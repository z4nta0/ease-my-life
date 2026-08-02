# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Ease My Life — "pick what to do today, without deciding." A client-only PWA
(React 18 + Vite, no backend, no accounts). Users define "pickers" (weighted
pools of items — chores, meals, etc.) that get chosen from on a schedule; the
app builds a short daily list. All data lives on-device (IndexedDB, with a
localStorage fallback/mirror) — there is no server component to this app at all.

## Commands

```
npm run dev       # vite dev server (PWA service worker also active via devOptions)
npm run build     # production build to dist/
npm run preview   # serve the production build locally
```

There is no test suite, no lint config, and no type checker wired up
(`change-later-tsconfig.json` / `tsconfig.node.json` exist but are not
referenced by any script — don't assume `tsc` or ESLint gate anything). Verify
changes by running `npm run dev` and exercising the app in a browser.

`__APP_VERSION__` is injected at build time from `package.json`'s `version`
field (see `vite.config.js`) and surfaces in Settings → About and in the
support form's diagnostic field.

### Release convention

Releases bump `package.json`'s `version` and land as **two** commits, e.g.:
```
0.9.14 update to fix incorrect site usage data in Settings tab
Release version 0.9.14 to fix incorrect site usage data in Settings tab
```
Follow this pattern (bump commit, then a "Release version X.Y.Z ..." commit)
if asked to cut a release.

## Architecture

### No router, no build-time code splitting of routes

`src/main.jsx` boots by racing `STORAGE.init()` against a timeout, then
mounts `<App />` (`src/app.jsx`). `App` owns a single `active` tab id in
React state and renders one of five tabs directly — there's no react-router.
The five tabs (`src/tab-today.jsx`, `tab-picker.jsx`, `tab-stats.jsx`,
`tab-data.jsx`, `tab-settings.jsx`) are large, self-contained files (each
~200KB+ of JSX) that share state/actions passed down as props.

### State: one big object, one hook, no context/redux

`src/store.jsx`'s `useStore()` hook is the entire state layer: a single
`useState` holding the whole app state object, plus a `React.useMemo`'d
`actions` object of state-transition functions (`toggleDone`, `addPicker`,
`skipEntry`, `resolveConditionalsForDay`, ...). `App` calls `useStore()` once
and passes `[state, actions]` down to every tab as props — there is no
context provider and no global store singleton reachable from arbitrary
files. Persistence is debounced via `requestIdleCallback` and flushed
synchronously on `pagehide`/tab-hide so nothing is lost.

`migrate(s)` in `store.jsx` is the schema-evolution point: every persisted
state passes through it on load (and on import), and it backfills missing
fields for old saves one `if` block at a time. When adding a new persisted
field, add a backfill here rather than assuming fresh shape.

### Storage: IndexedDB primary, localStorage fallback + warm mirror

`src/storage.js` is a separate concern from `store.jsx`: it's the actual
persistence engine (`STORAGE.init/save/flushSync/wipe/status/...`).
Highlights worth knowing before touching it:
- The pick log (large, append-only) lives in its own IDB object store,
  separate from the rest of state, specifically so writing it isn't on the
  hot path of every other save.
- `STORAGE.init()` runs and resolves *before* React mounts (`main.jsx`), so
  `store.jsx`'s `loadState()` can stay synchronous.
- A `localStorage` "warm mirror" (minus the pick log) exists purely as a
  same-tick fallback if IDB fails later; it is not the source of truth.
- `wipe()` (Settings → "Delete all data") must clear every key this layer has
  ever written, across legacy naming generations — see `OWNED_KEY_RE`.

### Domain modules (pure logic, no React)

These encapsulate specific pieces of the scheduling/picking model and are
imported by both `store.jsx` and the relevant tabs:
- `src/pickers.js` — picker selection algorithms (random / weighted / dynamic
  / ease-up / ease-down); pure functions over an items snapshot.
- `src/cadence.js` — per-picker "when do I surface" gating (daily / weekly /
  monthly / yearly) and period/anchor math.
- `src/conditionals.js` — day-off gates that suppress dependent pickers for a
  day (probability / ease-up / ease-down / dynamic modes).
- `src/tasks.js` — the reminders engine (statically-scheduled one-time or
  recurring tasks, distinct from randomly-picked items).
- `src/holidays.js` — rule-based US holiday computation, fully offline.
- `src/seed.js` — canonical data model comment block + `CLEAN_STATE()` (what
  a fresh install starts from) + `MODES`. Read the top comment here first
  when working on the data model — it's the closest thing to a schema doc.

Each of these modules has a substantial header comment explaining its model;
read it before modifying, since the domain logic (drift/charge values,
weight semantics, "pending" mutations applied only on completion, etc.) is
non-obvious from the code alone.

### "Pending" pick mutations — a key invariant in store.jsx

Picking/re-rolling/sending an item to Today stages its value/weight
consequences as `entry.pending` — they are **not** applied to the picker/item
state until the entry is marked done (`applyEntryPending` /
`revertEntryPending` in `store.jsx`). Unchecking a done entry must exactly
revert via the `entry.revert` snapshot. If you touch `toggleDone`,
`setEntryItem`, `addTodayEntry`, or `skipEntry`, preserve this staging —
directly mutating item state on pick (instead of on completion) breaks the
"nothing changes until you actually do it" contract the whole ease-up/
ease-down/dynamic system relies on.

### Logs are append-only and denormalized

`state.pickLog`, `state.conditionalLog`, `state.reminderLog`,
`state.reminderSkipLog`, `state.vacationLog` are flat, append-only arrays
(not per-entity tables) that power the Stats tab. Rows denormalize names
(`itemName`, `pickerName`, `group`, ...) so history survives renames/deletes
of the things it references. Don't refactor these into normalized
lookups without preserving that survivability property.

### UI support modules

- `src/ui.jsx` — shared primitives (`Icon`, `Btn`, `Card`, `Collapse`,
  `Pill`, focus/escape helpers, live-region `announce`).
- `src/appearance.js` — palette tokens + theme application; deliberately
  split out of `app.jsx` to avoid an import cycle with `tab-settings.jsx`.
- `src/reorder.js` — hand-rolled pointer drag-to-reorder for Today's Edit
  Mode (no external DnD library).
- `src/day-log.jsx` — per-group "what did the generator do today" audit
  panel, derived from the pick log.
- `src/onboarding.jsx` — first-run welcome modal + a tour that drives the
  real app (not a mock overlay); coordinates with other modules via a small
  event bus (`emlTour`) and a couple of deliberate `window.__eml*` globals
  (see "Runtime globals on `window`" below).
- `src/reminders.jsx` / `src/cadence-control.jsx` / `src/tab-conditional.jsx`
  — shared editors reused across the Today/Pickers/Data tabs.

### Runtime globals on `window`

A handful of `__`-prefixed globals (`__escStack`, `__escBound`, `__editGuard`,
`__emlGenerate`, `__emlPickerCreated`, `__dismissBootSplash`) are deliberate
cross-module registration channels (e.g. a component registers a callback on
mount so `index.html`'s boot script or the onboarding tour can call it
later), not accidental leaks. Leave them as globals rather than "fixing" them
into imports — the components that set them are meant to be reachable before/
outside the normal React import graph.

### PWA / deploy details

- Deployed to Netlify: `public/_redirects` is an SPA catch-all, `public/_headers`
  fixes the manifest's Content-Type. `index.html` contains a hidden static
  `<form name="support">` purely so Netlify's build-time form parser detects
  it — keep its field names in sync with `ContactSupportCard`'s submit logic
  in `tab-settings.jsx`, or submissions will be rejected.
- `vite-plugin-pwa` is configured with `manifest: false` — `public/manifest.webmanifest`
  is hand-written and linked from `index.html`; the plugin only precaches and
  injects the notification-click handler (`public/sw-notify.js`).
- The boot splash in `index.html` is pure CSS/inline JS (no framework) and is
  timed to the animation's own keyframe durations — see the comment block
  there before changing the animation timing.

## Known repo quirk

There is a stray duplicate `store.jsx` at the repo root (identical to
`src/store.jsx`). It isn't imported by anything (Vite serves from `src/`) —
treat `src/store.jsx` as the canonical file if you need to edit store logic.

# Claude Code Rules

## CRITICAL: Development Server Management
- NEVER use global or pattern-based kill commands (e.g., `pkill`, `killall`, `fuser -k`) for `node`, `npm`, `vite`, `next`, or port numbers — these match by process name/command line across the *entire system*, so they can just as easily kill the user's own separately-running dev server as the one Claude started.
- Shell state (including a PID captured via `$!`) does NOT persist between separate Bash tool calls in this environment — capturing a PID in one command and referencing it in a later command silently fails.
- Start any dev/test server via the Bash tool's `run_in_background: true` option (not a manual `&` subshell) — this returns a task ID that stays valid across turns.
- To stop a server started that way, use the `TaskStop` tool with that task ID. Never `pkill`/`kill` by name, port, or a guessed PID.
- Do not interfere with any pre-existing Node processes running in this environment, or any dev server the user started themselves.


