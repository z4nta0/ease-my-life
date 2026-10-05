# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Ease My Life: "pick what to do today, without deciding." A client-only PWA
(React 18 + Vite, no backend, no accounts). Users define "pickers" (weighted
pools of items: chores, meals, etc.) that get chosen from on a schedule; the
app builds a short daily list. All data lives on-device (IndexedDB, with a
localStorage fallback/mirror); there is no server component to this app at all.

## Commands

```
npm run dev       # vite dev server (PWA service worker also active via devOptions)
npm run build     # production build to dist/
npm run preview   # serve the production build locally
npm run typecheck # tsc -b across tsconfig.app.json (src/) and tsconfig.node.json
```

TypeScript is being adopted (decided 2026-10-05, on the `integrate-typescript`
branch). `tsconfig.json` only references `tsconfig.app.json` (everything in
`src/`, browser and JSX) and `tsconfig.node.json` (`vite.config`,
`eslint.config`, and `scripts/`, with Node's types). `strict` starts off on
purpose so the file rename doesn't bury real problems; it gets turned on area
by area once the code is typed, and stays a tracked to-do until it is.
`typecheck` isn't part of `build` yet, so a type error can't block a deploy
mid-migration. `public/boot-splash.js` and `public/sw-notify.js` stay
JavaScript, since the browser and service worker load them by fixed URL
outside the build. There is no test suite. ESLint is installed and configured
(`eslint.config.js`, with `eslint-plugin-react-hooks`' recommended rules for
`.jsx` files, minus its four React Compiler readiness rules, plus `no-undef` and `react/jsx-no-undef` with browser globals
for everything under `src/`, which catch a reference a rename missed; its
`files` globs avoid `{a,b}` braces, since the `brace-expansion` override in
`package.json` breaks ESLint's brace matching), but no npm script runs it, so
it only runs when invoked by hand
(`npx eslint <file>`) or through an editor integration; don't assume `tsc` or
ESLint gate anything yet. Verify changes by running `npm run dev` and exercising
the app in a browser.

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

`src/main.jsx` boots by racing `STG_NAM_OBJ.iniStoFun()` against a timeout,
then mounts `<AppRooCom />` (`src/app.jsx`). `AppRooCom` owns a single
active-tab-id in React state and renders one of five tabs directly; there's
no react-router. Each tab lives in its own folder under `src/tabs/`
(`today/`, `pickers/`, `stats/`, `data/`, `settings/`): a main
`tab-*.jsx` component plus the sub-component files only that tab uses. Every
tab gets the shared state/actions passed down as props.

### State: one big object, one hook, no context/redux

`src/state/store.js`'s `useAppStaFun()` hook is the entire state layer: a
single `useState` holding the whole app state object, plus a
`React.useMemo`'d `actions` object of state-transition functions
(`togDonFun`, `addPicFun`, `skiEntFun`, `resConFun`, ...). `AppRooCom` calls
`useAppStaFun()` once and passes the state/actions pair down to every tab as
props; there is no context provider and no global store singleton reachable
from arbitrary files. Persistence is debounced via `requestIdleCallback` and
flushed synchronously on `pagehide`/tab-hide so nothing is lost. The store's
own helpers live beside it in `src/state/` (`ids.js`, `pick-log.js`,
`pending-mutations.js`, `migrate.js`).

`migStaFun(s)` in `src/state/migrate.js` is the schema-evolution point:
every persisted state passes through it on load (and on import), and it
backfills missing fields for old saves one `if` block at a time. When adding
a new persisted field, add a backfill there rather than assuming fresh
shape.

### Storage: IndexedDB primary, localStorage fallback + warm mirror

`src/state/storage.js` is a separate concern from `store.js`: it's the
actual persistence engine (`STG_NAM_OBJ.iniStoFun/savStaFun/fluSynFun/
wipDatFun/staRepFun/...`). Highlights worth knowing before touching it:
- The pick log (large, append-only) lives in its own IDB object store,
  separate from the rest of state, specifically so writing it isn't on the
  hot path of every other save.
- `STG_NAM_OBJ.iniStoFun()` runs and resolves *before* React mounts
  (`main.jsx`), so `store.js`'s `loaStaFun()` can stay synchronous.
- A `localStorage` "warm mirror" (minus the pick log) exists purely as a
  same-tick fallback if IDB fails later; it is not the source of truth.
- `wipDatFun()` (Settings → "Delete all data") must clear every key this
  layer has ever written, across legacy naming generations (see
  `OWN_KEY_REG`).

### Domain modules (pure logic, no React)

These live in `src/core/`, encapsulate specific pieces of the
scheduling/picking model, and are imported by both the state layer and the
relevant tabs:
- `src/core/pickers.js`: picker selection algorithms (random / weighted /
  dynamic / ease-up / ease-down); pure functions over an items snapshot.
- `src/core/cadence.js`: per-picker "when do I surface" gating (daily /
  weekly / monthly / yearly) and period/anchor math.
- `src/core/conditionals.js`: day-off gates that suppress dependent pickers
  for a day (probability / ease-up / ease-down / dynamic modes).
- `src/core/tasks.js`: the reminders engine (statically-scheduled one-time
  or recurring tasks, distinct from randomly-picked items).
- `src/core/holidays.js`: rule-based US holiday computation, fully offline.

`src/state/seed.js` holds the canonical data model comment block,
`buiCleFun()` (what a fresh install starts from), and `MOD_DEF_OBJ` (the
picker modes). Read its top comment first when working on the data model;
it's the closest thing to a schema doc.

Each of these modules has a substantial header comment explaining its
model; read it before modifying, since the domain logic (drift/charge
values, weight semantics, "pending" mutations applied only on completion,
etc.) is non-obvious from the code alone.

### "Pending" pick mutations: a key invariant

Picking/re-rolling/sending an item to Today stages its value/weight
consequences as `entry.pending`; they are **not** applied to the
picker/item state until the entry is marked done (`enpAplFun` / `enpRevFun`
in `src/state/pending-mutations.js`). Unchecking a done entry must exactly
revert via the `entry.revert` snapshot. If you touch `togDonFun`,
`swaIteFun`, `addEntFun`, or `skiEntFun` in `store.js`, preserve this
staging: directly mutating item state on pick (instead of on completion)
breaks the "nothing changes until you actually do it" contract the whole
ease-up/ease-down/dynamic system relies on.

### Logs are append-only and denormalized

`state.pickLog`, `state.conditionalLog`, `state.reminderLog`,
`state.reminderSkipLog`, `state.vacationLog` are flat, append-only arrays
(not per-entity tables) that power the Stats tab. Rows denormalize names
(`itemName`, `pickerName`, `group`, ...) so history survives renames/deletes
of the things it references. Don't refactor these into normalized
lookups without preserving that survivability property.

### UI support modules

- `src/ui/`: shared primitives and editors used by 2 or more features, one
  component or helper family per file (`icon.jsx`, `button.jsx`,
  `card-surface.jsx`, `collapse.jsx`, `info-tip.jsx`, `escape-cancel.js`,
  `edge-fade.js`, ...), plus the shared editors reused across tabs
  (`schedule-editor.jsx`, `cadence-control.jsx`,
  `conditional-controls.jsx`, `entry-editor.jsx`).
- `src/platform/appearance.js`: palette tokens + theme application;
  deliberately split out of `app.jsx` to avoid an import cycle with
  `tab-settings.jsx`.
- `src/tabs/today/reorder.js`: hand-rolled pointer drag-to-reorder for
  Today's Edit Mode (no external DnD library).
- `src/tabs/today/day-log.jsx`: per-group "what did the generator do today"
  audit panel, derived from the pick log.
- `src/onboarding/`: the first-run welcome modal and tour
  (`welcome-tour.jsx`), the tour engine (`tour-runner.jsx`), and the page,
  picker, reminder, and feature mini-tours. The tours drive the real app
  (not a mock overlay) and coordinate with other modules via a small event
  bus (`emlTouObj` in `src/state/tour-bus.js`) and a couple of deliberate
  `window.__eml*` globals (see "Runtime globals on `window`" below).
- `src/help/`: the on-demand help mode (`mode.jsx`, plus its toggle, tip,
  geometry, catalog, and sample data).

### Runtime globals on `window`

A handful of `__`-prefixed globals (`__escStack`, `__escBound`,
`__emlGenerate`, `__emlPickerCreated`, `__dismissBootSplash`) are deliberate
cross-module registration channels (e.g. a component registers a callback on
mount so `index.html`'s boot script or the onboarding tour can call it
later), not accidental leaks. Leave them as globals rather than "fixing" them
into imports; the components that set them are meant to be reachable before/
outside the normal React import graph.

### PWA / deploy details

- Deployed to Netlify: `public/_redirects` is an SPA catch-all, `public/_headers`
  fixes the manifest's Content-Type. `index.html` contains a hidden static
  `<form name="support">` purely so Netlify's build-time form parser detects
  it; keep its field names in sync with `ConSupCom`'s submit logic in
  `tabs/settings/contact-support.jsx`, or submissions will be rejected.
- `vite-plugin-pwa` is configured with `manifest: false`; `public/manifest.webmanifest`
  is hand-written and linked from `index.html`; the plugin only precaches and
  injects the notification-click handler (`public/sw-notify.js`).
- The boot splash in `index.html` is pure CSS, faded out by
  `public/boot-splash.js` (no framework), whose constants mirror the splash's
  own loop, stagger, and fade timings: see the Boot Splash Styles summary
  there before changing the animation timing.

## Project-specific rules

Every formatting, naming, comment, copy, and commit rule lives in the
user-level `~/.claude/CLAUDE.md`, which applies to all projects. This repo
is where those rules were developed, so its files are the examples cited
there. This section holds only what applies to this project.

### New persisted fields

Decided 2026-10-04. A field newly added to persisted user data (state,
items, pickers, Today entries, revert snapshots, ...) uses the same plain
camelCase as the existing persisted fields (`periodKey`, `activeItemId`)
rather than the 6-character property rule, so the whole persisted schema
can be renamed together in the planned migration-layer pass. E.g. a
picker's own `lastRunPeriod`, the period start of its last completed
non-daily run.

### Project-scoped naming overrides

Each of these resolves a naming collision that only exists in this
codebase, so it applies here and nowhere else.

- **Trigger/Triggered uses `trg`, not `tri`** (a project-scoped
  decision, reversing an earlier sweep that had moved `trgValBoo`/
  `trgEleRef`/`trgCurEle`/`trgRecObj` to `tri`). `tri` had become
  overloaded with three unrelated words at once: Trigger (the tooltip's
  own `triEleRef`/`triCurEle`/`triRecObj` in `ui.jsx`, `triValBoo` in
  `store.js`/`seed.js`/`conditionals.js`, `triFlaBoo`), Trimmed
  (`namTriStr`), and Try. Per the user's own choice, Trigger takes its
  consonant skeleton `trg` (the same style as `rcd`/`rmn`/`rmv`),
  Trimmed keeps the literal `tri` (e.g. `tab-today.jsx`'s own
  `triValStr`), and Try uses its own complete 3-letter word `try` (e.g.
  `onboarding/app-features.jsx`'s own `tryCouNum`/`tryColFun`). Being
  applied file by file as each file is next reviewed, not in one sweep.
  Scoped to ease-my-life ONLY, for the same reason as `rmn`/`rmv`.
- **Weekend uses `wkd`, not `wee`** (a project-scoped decision): the
  literal `wee` already means Week heavily throughout this codebase,
  and Phase A's own first candidate `wek` was a documented Week
  miscorrection, so per the user's own choice Weekend keeps its
  consonant skeleton `wkd` (e.g. `tasks.js`'s own `isaWkdBoo`).
  Scoped to ease-my-life ONLY, for the same reason as `rmn`/`rmv`.
- **Truncated uses `trn`, not `tru`** (a project-scoped decision): the
  literal `tru` reads as "true" and already means True in this
  codebase (`conditionals.js`'s own `truOddFun`, True Odds Function),
  so per the user's own choice Truncated takes its consonant skeleton
  `trn` (e.g. `ui.jsx`'s own `texTrnBoo`/`cheTrnFun`, and InfTipCom's
  `trnOnlBoo` prop). Scoped to ease-my-life ONLY, for the same reason
  as `rmn`/`rmv`.
- **A project-scoped override, requested by the user, when Phase A/B
  escalation itself keeps colliding**: `onboarding-checklist.js`'s own
  `cheStaFun` returns a `remaining` count that would normally truncate
  to `rem`, but `rem` is used dozens of times for "Reminder" throughout
  THIS project specifically (`remActRef`, `remAncObj`, `remCouNum`,
  `remIteArr`, ...), squarely the "heavy pre-existing overload" case
  just above. Phase A's own escalation candidate, `rea`, doesn't help
  either: it already carries two different meanings within this exact
  file alone (`reaGenFun` = Ready, `reaPicFun` = Real), so escalating
  into it would trade one collision for a worse one. Per the user's
  own explicit request, `remaining` is truncated to `rmn` instead (its
  leading consonant skeleton, Re-m-n, vowels dropped, rather than any
  letter found via the documented Phase A/B position-escalation
  method), giving `rmnNum`. **This exact resolution (`remaining` →
  `rmn`) is scoped to ease-my-life ONLY**, because `rem` = Reminder is
  specifically what makes it necessary here; it is NOT a general
  consonant-skeleton technique to reach for on a different project,
  where `rem` would truncate to "Remaining" the normal way with no
  such conflict.
- **The same override extended to Remove/Removing, requested by the
  user**: `rem` = Reminder blocks "Remove" and "Removing" the same way
  it blocks "Remaining", so both use their consonant skeleton `rmv`
  instead of the literal `rem` or Phase A's own `reo`, which reads far
  less clearly. E.g. `tab-data.jsx`'s own `rmvIdeStr` (Remove
  Identifier String, the id passed to `delIteFun`/`delConFun`) and
  `rmvPicStr`/`setRmvPicStr` (Removing Picker String, the card playing
  its removal animation). This is separate from the store actions'
  own `del` for "remove" (`delIteFun`, `delPicFun`, ...), which was
  chosen for those action keys specifically. Scoped to ease-my-life
  ONLY, for the same reason as `rmn`. Other files' own `rem`-as-
  Remove/Removing names (e.g. `remIdeSet`) get fixed during each
  file's own review.
- **A second project-scoped override, requested by the user, this
  time keeping the ORIGINAL unescalated abbreviation rather than
  accepting a genuinely clean escalated candidate**: `reorder.js`'s
  own `cmpTarFun` (Compute Target Function) keeps its literal `cmp`
  for "Compute" instead of the normal first-3-letters truncation
  `com`, even though `cmp` doesn't match any real word's own literal
  first 3 letters at all. `com` itself is unusable here (`Component`,
  the single most heavily-loaded segment in this whole codebase, on
  the order of 2,700 uses); Phase A's own escalation candidates fare
  no better: `cop` (the word's own 4th letter) is already `Copy`
  (roughly 116 uses), and `cou` (5th letter) is already `Count`
  (roughly 306 uses), both squarely the "heavy pre-existing overload"
  case rather than a safely available letter. The next Phase A
  candidate, `cot` (6th letter), genuinely IS clean (zero existing
  uses anywhere), but per the user's own explicit preference, `cmp`
  (the common real-world abbreviation for "compute"/"compare") was
  kept as-is instead, since it already reads clearly on its own even
  though it isn't a literal segment truncation or an escalation
  result. **This exact resolution (`Compute` → `cmp`, staying
  unescalated) is scoped to ease-my-life ONLY**, since it depends on
  `com`/`cop`/`cou` all already being unusable in THIS codebase
  specifically; on a different project, `Compute` would truncate to
  `cot` (the first genuinely clean Phase A candidate) or its own
  literal first-3-letters form, with no such conflict and no reason
  to keep `cmp` unescalated.
- **A third project-scoped override, the same shape as `cmp`**:
  `picker-controls.jsx`'s own `cmtGroFun` (Commit Group Function) keeps `cmt`
  for "Commit", per the user's own explicit preference. The literal
  first-3-letters `com` is Component (the same heavy overload as the
  `cmp` case), and Phase A's own first clean candidate would have been
  `coi`, which reads far less clearly than `cmt`. Scoped to ease-my-life
  ONLY, for the same reason as `cmp`.
- **A fourth project-scoped override, splitting `rec` between Record
  and Rect**: `rec` had grown into two heavy meanings at once, Record
  (`tasRecObj`, `picRecObj`, `entRecObj`, ...) and Rect, a bounding box
  (`scrRecObj`, `cliRecObj`, `butRecObj`, ...), so a name like
  `curRecObj` couldn't be read without checking what it held. `rec` now
  means Rect only, and Record uses its consonant skeleton `rcd`
  (`tasRcdObj`, `picRcdObj`, ...), per the user's own explicit choice;
  Phase A's own Rect candidate `ret` was rejected since it reads as
  Return. Being applied file by file, as each file is next reviewed,
  not in one sweep: `curRecObj` and `tarRecObj` hold a record in some
  files and a rect in others, so every instance is checked by hand.
  Where a better word than Record exists, use it instead (e.g.
  `group-entries.js`'s own `groBucObj`, a bucket pulled from
  `groBucMap`). Recurring, whose literal first 3 letters are also
  `rec`, takes Phase A's `reu` instead (Recurring's 4th letter), e.g.
  `tasks.js`'s own `isaReuFun`. Reconcile, whose Phase A letters all
  collide (`reo` is Reopen, `ren` is Rename), uses its synonym Sync
  instead, e.g. `store.js`'s own `stkSynFun`. Scoped to ease-my-life
  ONLY, for the same reason as `rmn`/`rmv`.
