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

## Code formatting rules

Whitespace conventions for JS/JSX in this repo, being rolled out gradually
(started with `src/app.jsx` as the reference implementation — consult it for
worked examples of every rule below before guessing). "N blank lines" always
means N visually-empty rows, i.e. N+1 newline characters between two lines
of content — not N newline characters.

### Import statements
- One imported binding per `import` statement, even when multiple bindings
  come from the same source — never combine them into one `import { A, B }`
  line. Splitting an existing combined import (without reordering it) is a
  real, mechanical source change, not whitespace, but produces an identical
  build output — verify with a byte-for-byte-identical bundle hash before
  treating it as done. Reordering to alphabetize (below) is also a real
  change and generally safe for side-effect-free modules like these, but
  don't expect an identical hash from that step — only from the splitting
  itself.
- Group non-destructured (default) imports separately from destructured
  (named, `{ ... }`) imports: all default imports first, then 2 blank lines,
  then all named imports.
- Within each of those two groups, alphabetize by the imported binding's own
  name (case-insensitive), not by source path — regardless of which source
  file each one came from.
- Within the named-imports group, pad every specifier name (left-justify) so
  the closing `}`, the `from` keyword, and the start of every source string
  all line up in their own columns — computed from the single longest
  specifier name in that group. Default imports don't need this treatment
  unless there's more than one (rare, since only one default export per
  module makes multiple default imports from the same source impossible
  anyway).

### Indentation
- Use tabs for indentation, one tab per nesting level — not spaces.
- Exception: a continuation line that's deliberately visually aligned to a
  specific column on the line above it (e.g. a wrapped JSX attribute list
  where the second attribute lines up directly under the first one, right
  after the tag name) keeps that alignment as literal spaces, but ONLY for
  the portion beyond its own structural depth. Concretely, such a line's
  leading whitespace is: the SAME number of tabs as the element's own
  opening line (not one level deeper — it's a continuation of the same
  element, not a child of it), followed by literal spaces to reach the
  exact alignment column (i.e. matching the width of the tag name and
  whatever it's lining up under).
- A continuation line that ISN'T deliberately aligned to a specific column —
  it's just wrapped for length, with nothing on the line(s) above to line up
  with (e.g. `<path\n  d="..."\n  strokeWidth="8" />`, where `<path` alone
  leaves nothing to align to) — uses one MORE tab than its own opening line,
  same as any other nested content, with no space-padding at all.
- When judging which case applies: does the continuation line's indentation
  match a specific character position on the line(s) above (typically right
  after `<tagname `)? If yes, it's an alignment case (tabs to the opening
  line's own depth + spaces for the rest). If the line above ends with just
  the tag name and nothing else, or the "continuation" is really just
  deeper nesting, it's a plain structural indent (tabs only, one level
  deeper).
- This rule only governs LEADING indentation. Mid-line spacing — e.g.
  padding array/object entries so their values line up in a column, like
  `TABS`' `label:`/`icon:` fields — is untouched; it stays literal spaces
  regardless, since it isn't indentation at all.

### File boundaries
- Every file starts with exactly 3 blank lines before its first real line,
  and ends with exactly 3 blank lines after its last real line.

### Top-level (module scope)
- Between any two distinct top-level declarations (a comment block, a
  `const`, a `function`, an `export` statement, ...) always use 3 blank
  lines — regardless of how related they seem (e.g. a component and a
  constant it reads from still get 3, not fewer, purely because they're
  both top-level).
- Import statements are the one exception within top-level scope: no blank
  lines between individual `import` lines — they're one tight block. The
  gap between that whole block and whatever follows it is still 3.

### Comments
- A comment sits glued (0 blank lines) to the specific line/block it
  describes — never insert a blank line between a comment and its target.
- If a comment's own target is genuinely ambiguous (unclear what it's
  actually describing), don't guess a glue point — treat it as its own
  freestanding unit, with whatever blank-line count applies on both sides
  given its surroundings (3 if it sits between top-level declarations).

### Arrays and objects
- No blank lines between entries within the same array/object literal
  (e.g. the rows of a plain config array) — but directly after the opening
  `[`/`{` and directly before the closing `]`/`}`, use 2 blank lines, same
  as a function body (below). This only applies when the literal already
  spans multiple lines — a single-line literal (e.g. one inline `{ id, label }`
  passed as a prop) needs no padding.

### Functions
This means ANY function that isn't a one-line declaration — named
functions, arrow functions, and inline callbacks passed to hooks like
`useEffect`/`useState`'s lazy initializer/`useCallback`/`useMemo`, no matter
how short the body is.
- Directly after the opening `{` — or the opening `(` for an implicit-return
  arrow like `() => ( expr )`, which counts as a function body too — insert
  2 blank lines before the first line inside. Directly before the closing
  `}`/`)`, insert 2 blank lines after the last line inside.
- A function that fits entirely on one line (e.g.
  `const onChange = (e) => setSystemDark(e.matches);`, or a one-line cleanup
  `return () => { ro.disconnect(); };`) is exempt — there's nothing to pad.

### if/else and while statements
- Same padding as functions — 2 blank lines after the opening `{` and 2
  before the closing `}` — but only when the block actually spans multiple
  lines. A one-line body (`if (!nav) return;`, or even
  `if (!btn) { setInd(null); return; }` written on one line) is exempt and
  stays exactly as compact as it already is.
- A short "declare a value, then immediately guard-check it and return
  early" pair (e.g. `const prev = x.current; if (prev === next) return;`)
  counts as one small isolated unit: 1 blank line between the two lines
  internally, but 3 blank lines on both sides separating that whole pair
  from whatever comes before/after it — even if a neighboring pair looks
  structurally identical (e.g. a second `declare + guard` pair checking a
  completely different, independent condition right after it also gets 3
  before it, not folded into the same unit).

### Return statements
- A `return` that occupies its own line (not a `return;`/`return x;` fused
  into a compact one-line guard clause like `if (!x) return;`) always gets
  3 blank lines directly before it, regardless of whether the returned
  value itself is one line or many. This is the one case where "3" shows up
  inside a function body, not just between top-level declarations.
- If the enclosing function/block's own closing brace comes right after the
  return statement, put 2 blank lines between the return's own close and
  that enclosing `}`.
- A multi-line/parenthesized return (most commonly a JSX return,
  `return (\n  <div>...</div>\n);`) additionally follows the function
  padding rule for its own content: 2 blank lines after the opening `(` and
  2 before the closing `)`.
- Single-line early-return guards (`if (!btn) { setInd(null); return; }`)
  are exempt from the "3 before" rule entirely — they're not a standalone
  return statement, just an inline guard, so they follow the ordinary
  relatedness tiering below instead.

### JSX
- Treat a JSX element that has actual children spanning multiple lines the
  same as a function/array/object: 2 blank lines directly after its opening
  tag and 2 directly before its closing tag. This includes a
  `{condition && (\n  <Foo />\n)}` multi-line conditional wrapper — the `(`
  and `)` count as an opening/closing pair too.
  - Exception: a self-closing element whose only multi-line aspect is its
    own wrapped attributes (no children at all, e.g.
    `<button className="x"\n        onClick={...}>`) needs no padding
    between its attribute lines — there's no "inside" to pad.
- Between sibling JSX children, apply the same related/somewhat-related/
  unrelated tiering as regular code (see below). One common case: a run of
  visually-repetitive sibling elements of the exact same kind (e.g. the
  several `<path>` elements making up one SVG icon, or a handful of mutually
  exclusive `{active === 'x' && <TabX />}` branches selecting a page) is
  usually "related" (1), not the 3-blank-line default reserved for
  genuinely different elements.

### Variable declarations
- Every variable gets its own `const`/`let` on its own row — a single
  `const a = foo(), b = bar();` combining multiple declarations must be
  split into separate statements, each on its own line (this is a real,
  intentional code change, not just whitespace — verify nothing depends on
  the original combined-statement ordering/scoping before splitting).
  Space the resulting lines using the normal relatedness tiering below
  (typically 1, "related," when one was born from the same combined
  statement as the other).

### General relatedness tiering
Used for spacing between statements inside a function/block body, and
between JSX siblings. Three tiers:
- **Related (1 blank line)**: tightly, directly connected — a value used on
  the very next line; two lines that are literally the same *kind* of code
  working toward the same immediate step (e.g. two plain `const`
  declarations where the second directly consumes the first; two sibling
  `useState` calls backing the same visual feature; parallel/mutually-
  exclusive branches of one conditional).
- **Somewhat related (2 blank lines)**: connected, but via a different
  specific mechanism or a different *kind* of code, even when the
  underlying data is identical. Two recurring shapes:
  - Different mechanism, same overarching goal — e.g. a `ResizeObserver`
    call and a `window.addEventListener('resize', ...)` call right after
    it both exist to trigger the same re-measurement, but they're
    different specific tools, so 2, not 1.
  - Same data, different *kind* of code construct — a plain variable/state
    declaration (or a function's own definition) immediately followed by a
    function/effect/if-block/function-call that operates on that exact
    same data (or the function itself being invoked) is 2, not 1, purely
    because a plain declaration and a function/block/call are inherently
    different *kinds* of code. This applies in both directions (declare →
    block, or block → declare) and also to "define a function, then call
    it" pairs. Only two instances of the *same kind* of code (e.g. two
    plain declarations, or two sibling effects) can be "1".
  - The same logic applies to two `useEffect`s specifically: 1 if they
    handle the exact same data, 2 if they operate on different (even if
    related/sibling) data while doing a similar kind of action, 3 otherwise.
- **Unrelated (3 blank lines)**: no real shared data and no real shared
  purpose — including cases that only *look* structurally parallel. Two
  independent "declare + guard clause" pairs that happen to share the same
  shape but check entirely unrelated conditions (e.g. one checking that a
  DOM ref exists, the next checking that a *different* DOM ref exists) are
  still 3 apart, not 1 or 2, because what they actually check is unrelated.
  When judging this, check for real data/behavior overlap (e.g. "does the
  effect after this ref actually reference it in its own body or dependency
  array?") rather than assuming a topical-sounding comment means they're
  related — several calls in this file were revised from 2 down to 3 after
  actually checking for shared data and finding none.



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


