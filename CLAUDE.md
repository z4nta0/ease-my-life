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
mounts `<AppRooCom />` (`src/app.jsx`). `AppRooCom` owns a single active-tab-id
in React state and renders one of five tabs directly — there's no react-router.
The five tabs (`src/tab-today.jsx`, `tab-picker.jsx`, `tab-stats.jsx`,
`tab-data.jsx`, `tab-settings.jsx`) are large, self-contained files (each
~200KB+ of JSX) that share state/actions passed down as props.

### State: one big object, one hook, no context/redux

`src/store.jsx`'s `useStore()` hook is the entire state layer: a single
`useState` holding the whole app state object, plus a `React.useMemo`'d
`actions` object of state-transition functions (`toggleDone`, `addPicker`,
`skipEntry`, `resolveConditionalsForDay`, ...). `AppRooCom` calls `useStore()`
once and passes the state/actions pair down to every tab as props — there is no
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
  with (e.g. `<path\n  d='...'\n  strokeWidth='8' />`, where `<path` alone
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
  `TAB_OBJ_ARR`'s `label :`/`icon :` fields — is untouched; it stays literal
  spaces regardless, since it isn't indentation at all.

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
- **Every line of code gets a comment.** Rare exceptions: a closing
  bracket alone on its own line (a function/object/array/block's `}`,
  `]`, `)`, or a combination like `});`/`};`) never gets one. A bare
  `function foo(...) {}` declaration (a custom function that ISN'T stored
  in a `const`/`let`) is deferred — its own, more involved comment rules
  come later; this does NOT extend to inline/anonymous functions passed
  as arguments (a hook's callback like `useLayoutEffect(() => {...})`, a
  `return () => {...}` cleanup, `.map((x) => ...)`, ...) — those get
  commented normally, same as everything else. Other exceptions will turn
  up rarely; handle them case by case as they're found.
  - **Exception to the closing-bracket exemption**: a React hook call's
    closing line that carries a dependency array (`}, [ a, b, c ] );`)
    DOES get a comment, even though it's otherwise just a closing bracket
    — specifically to explain why the effect/callback/memo needs to
    re-run when each of those values changes, one clause per dependency
    if there's more than one:
    ```
    }, [ actIdeStr, tabPlaStr, raiOpeBoo ] ); // What: Effect Dependency Array. Why: This effect must re-run whenever a change to one of these values could move or resize the active tab's indicator target. How: actIdeStr changes which button is marked active, tabPlaStr changes the tab bar's placement and therefore its whole layout, and raiOpeBoo toggling the rail open or closed can resize the nav itself.
    ```
- **Placement**: a single-line statement's comment goes at the very end of
  the line, one space after the line's own trailing `;` (or just one space
  after whatever the line ends with, if it doesn't need a `;` — e.g. a
  `,` on an array/object entry). A multi-line construct (an array, object,
  if/else block, function, call, ...) gets its comment right after its own
  opening bracket, one space in — on that same line, not a new one:
  `const TAB_OBJ_ARR = [ // What: ...`, `React.useLayoutEffect( () => { // What: ...`.
- **Column alignment**: when a run of lines has NO blank lines between
  them (e.g. entries in the same array/object literal), pad each line so
  every comment's `//` starts at the same column — computed from the
  longest line in that run, same mechanism used for colon/import
  alignment elsewhere in this doc.
- **Structure — every comment is exactly one line**, following this exact
  template: `// What: <Name Expansion Or Short Descriptive Purpose, Title
  Cased>. Why: <a terse but complete sentence explaining why this exists>.
  How: <a terse but complete sentence explaining how it works and/or how
  it's used.>` The `What:` value is Title Case (capitalize every word,
  e.g. `TAB_OBJ_ARR` → `Tab Object Array`) — it's a label, not a sentence.
  When the name being expanded follows the 9-char/3-segment (or 6-char
  property) naming rule, expand each segment to its actual full word, in
  the SAME ORDER the segments appear in the name — never reordered, and
  never replaced with a paraphrase of what the thing conceptually is. E.g.
  `butActEle` (But+Act+Ele) → `Button Active Element`, not `Active Button
  Element` (segments swapped) and not `Clicked Tab Node` (a paraphrase
  instead of an expansion). This includes the type segment: expand it to
  its real word too (`Ref` → `Reference`, `Obj` → `Object`, `Ele` →
  `Element`, ...), don't leave it abbreviated while expanding the others.
  A clarifying word beyond the strict segment expansion is fine, but only
  APPENDED after all the real segment words, never inserted between them
  (e.g. `Indicator Record Object And Setter` is fine; `Left Offset Number`
  is not, since "Offset" sits between the two real segments — say that in
  the Why/How sentences instead). `Why:`/`How:` are real sentences
  (capitalized start, subject + verb,
  often starting with "This" as the subject), not sentence fragments —
  e.g. `Why: This defines the fixed set of tabs that TabBarCom renders.`,
  not `Why: defines the fixed set of tabs TabBarCom renders.` For an
  object literal with multiple properties packed onto ONE line, chain a
  separate What/Why/How group per property, one after another in the same
  comment: `// What: Prop1... Why: This... How: This... // What: Prop2...
  Why: This... How: This...`. These comments get long — that's expected
  and accepted, not a sign something's wrong.
  - **Editor tip worth knowing**: Alt+Z (Windows/Linux) or Option+Z (Mac)
    toggles soft-wrap in most editors (VS Code included), which makes
    these long single-line comments actually readable on screen without
    changing the file's real line structure. Turn it on when working in
    this codebase.
- **JSX elements get exactly the same comment treatment as everything
  else** — every element, one comment each.
  - **The `What:` for a native HTML/SVG element**: pretend the element
    has an `id`, even though it doesn't — invent a plausible 3-segment
    name for it the same way the `id`-naming rule would, then expand THAT
    (Title Case, same segment order) as the `What:` value. E.g. `<nav>` →
    imagine an id like `conNavEle` (Container + Nav + Element) → `What:
    Container Nav Element`. Structurally-identical sibling elements (e.g.
    8 decorative grid-line `<path>`s, or repeated single-letter spans) may
    share the exact same What/Why/How text — they don't need distinct
    invented names just to be different.
  - **The `What:` for a custom component**: if the component's OWN name
    already follows the naming rules (like `TabBarCom`), use its real
    expanded name directly, same as any other named identifier — don't
    invent a separate pretend-id name for it. If the component HASN'T had
    naming rules applied yet (e.g. `Icon`, still awaiting its own pass),
    just use its literal current name as-is for now (e.g. `What: Icon.`)
    — that comment is expected to be revisited once the component itself
    gets renamed.
  - **Placement — NEVER a bare `//`/text comment as JSX children.**
    Anything that isn't wrapped in `{}` between an opening and closing tag
    is literal DOM text content, so a plain `// comment` placed after an
    element's closing tag (even a multi-line one) gets rendered as visible
    text — a real bug, not just a style slip. Instead, every JSX element
    comment is a comment-only JSX expression, `{ /* What: ... Why: ...
    How: ... */ }` — no `//`, and it compiles away to nothing at all (a
    comment-only `{}` child produces zero arguments to `createElement`,
    verified identical output with or without it), so it's always safe.
  - **Container elements and self-closing elements** get their comment
    glued directly onto their own closing bracket — the opening tag's own
    `>` for a container (right where the tag itself finishes, BEFORE any
    of its children/content — this is what keeps a big element like `<nav>`
    readable, since its comment sits right at its declaration instead of
    buried after everything it contains), or the `/>` for a self-closing
    element. Same line, no space, tight:
    ```
    <nav
    	ref={ navEleRef }
    	...
    >{ /* What: Container Nav Element. Why: ... How: ... */ }

    	...real children...

    </nav>
    ```
    ```
    <path d='M 528 112 L 16 112' />{ /* What: Grid Line Element. Why: ... How: ... */ }

    <path d='M 216 528 L 216 16' />{ /* What: Grid Line Element. Why: ... How: ... */ }
    ```
    Self-closing elements stay self-closing — no need to convert them to
    an explicit open/close pair, since a comment-only `{}` sibling on the
    same line works exactly like any other sibling in a normal children
    list (an element can have any number of siblings; the special case
    below is the one exception to that).
  - **A fully one-line element** — opening tag, real text/expression
    content, AND its own closing tag all on the same physical line (e.g.
    `<span className='bw-ease'>Ease</span>`, or `<span>{ tabConObj.labStr
    }</span>`) — gets its comment AFTER that closing tag instead, same
    line, so the comment never sits between the tag and its own content:
    `<span className='bw-ease'>Ease</span>{ /* What: Ease Span Element. Why: ... How: ... */ }`.
    Several such elements chained on one physical line (e.g. three
    single-letter spans) each get their own comment immediately after
    their own closing tag, chained along that same line — not one merged
    trailing comment covering the whole line.
  - **Exception — an element sitting directly inside a `{}` JS expression**
    (e.g. a self-closing element that's the sole value of a
    `{cond && ( <span ... /> )}` or `.map((x) => ( <span ... /> ))`
    expression, rather than a normal member of some element's DOM children
    list) is still real JS at that point, not JSX children syntax — so an
    ordinary `//` comment works there directly, at the same position the
    `{ /* */ }` rule would otherwise use (after the `>` for a multi-line
    tag, after the content and closing tag for a one-liner). This keeps
    the comment glued to the element itself instead of needing to hunt
    for an external sibling slot:
    ```
    { indRecObj && (

    	<span
    		className='tabbar-indicator'
    		...
    	/> // What: Indicator Span Element. Why: ... How: ...

    ) }
    ```
  - The closing tag itself still gets nothing, same as always.
  - **Attribute lines never get their own comment** — unlike object
    properties, a JSX attribute is self-descriptive enough via its own
    name/value pairing that per-attribute comments would just be noise.
  - A multi-line JS expression embedded in JSX that ISN'T itself an
    element — a `{condition && (` wrapper, a `{arr.map((x) => (` call —
    still gets a comment (it's still a line of code), but follows the
    general descriptive-purpose comment rule instead of the pretend-id
    one, placed after its own opening bracket like any other multi-line
    construct: `{ indRecObj && ( // What: Indicator Visibility Check. Why: ... How: ...`.
- **Import statements** get the same one-line What/Why/How comment as any
  other single-line statement — treat the imported binding like a variable
  declaration. Since import lines have no blank lines between them, pad
  every line so its `//` lines up in the same column as its neighbors,
  computed from the longest line in that run — same column-alignment
  mechanism used elsewhere in this doc (named-import padding, object
  `:` alignment, ...). The two import groups (default vs. named, see
  "Import statements" above) are padded independently, each against its
  own longest line — a single default import naturally has nothing to
  align against. The `What:` value expands the imported binding's OWN
  CURRENT name: split it into whatever camelCase/PascalCase word segments
  it already has (NOT the strict 9-char/3-segment truncation — the name
  hasn't had its own naming pass yet, so it may have more or fewer than 3
  segments), Title Case each word, and expand a recognizable abbreviation
  to its real word the same way segment-type expansion works elsewhere
  (`Obj`→`Object`, `Bg`→`Background`, `Eml`→`Ease My Life`, ...) — e.g.
  `AppFeatureTour` → `What: App Feature Tour.`, `applyPaletteObj` → `What:
  Apply Palette Object.` Since almost none of these imported names have
  been through their own defining file's naming pass yet, this expansion
  is provisional: once a source file gets its own naming/comment pass,
  revisit every import comment that pulls a binding from it so the
  expansion matches whatever segment words that pass actually lands on —
  same spirit as the "revisit once renamed" note already covering JSX
  custom components (`Icon`, `TabToday`, ...) above.

### Quotes
- Use `'single quotes'` for every string literal, including JSX attribute
  values — even though double quotes are the idiomatic default there (e.g.
  `className="x"` becomes `className='x'`). If a string's own content
  needs a literal `"` character, that's fine — it just sits inside the
  single-quoted string as normal text, no escaping concern either way.
- This only governs actual string-literal delimiters in code. Quotation
  marks used as ordinary English punctuation inside a `//`/`/* */` comment
  (e.g. quoting a UI phrase in a design-rationale comment) are prose, not
  a code token, and are untouched by this rule.
- **`className` template literals specifically**: a backtick-templated
  `className` value gets a space directly after its opening backtick and
  directly before its closing one, and each individual class-name token
  inside it (a plain word, or a `${...}` interpolation standing in for
  one) is separated from its neighbors by exactly 3 spaces — not the
  normal single space:
  ```
  className={ ` tabbar   tabbar--${ tabPlaStr }   ${ raiOpeBoo ? 'is-open' : '' }   ${ className } ` }
  ```
  This only changes the SOURCE formatting, not the rendered class list —
  the browser collapses any run of whitespace in an element's `class`
  attribute to a single separator when matching selectors, so the extra
  spacing is purely a readability convention with no visual/behavioral
  effect. Plain non-templated `className='single-class'` strings are
  unaffected — this only applies to the backtick-templated form.

### Arrays and objects
- No blank lines between entries within the same array/object literal
  (e.g. the rows of a plain config array) — but directly after the opening
  `[`/`{` and directly before the closing `]`/`}`, use 2 blank lines, same
  as a function body (below). This only applies when the literal already
  spans multiple lines — a single-line literal (e.g. one inline `{ id, label }`
  passed as a prop) needs no padding.
- **A multi-line entry inside an array, or a multi-line property inside an
  object, gets exactly 1 blank line before and after it** — UNLESS that
  side is also the container's own first/last position, in which case the
  container's own 2-blank-line open/close padding (the bullet above)
  applies instead of the 1-blank rule. The two sides (before/after) are
  judged independently: an entry can be "first" (so its own 2-blank rule
  applies before it, but only 1 blank after it, assuming something follows)
  or "last" (2 blanks after, 1 before) or neither (1 blank both sides) or
  both at once if it's the container's only entry (2 blanks both sides).
  This nests recursively at every depth — a deeply-nested multi-line
  property follows the exact same before/after logic relative to ITS OWN
  immediate parent, independent of how outer levels are padded:
  ```
  const exaRulArr = [


  	{


  		exaStr : 'example property string',
  		exaNum : 456,
  		exaBoo : true,

  		exaObj : {


  			exaStr : 'example property string',
  			exaNum : 456,
  			exaBoo : true,

  			exaObj : {


  				exaStr : 'example property string',
  				exaNum : 456,
  				exaBoo : true


  			}


  		}


  	},

  	{

  		...
  	}


  ];
  ```
  Walking this: `exaRulArr`'s first entry gets 2 blanks after `[` (first);
  that entry's first property `exaStr` gets 2 blanks after its own `{`
  (first); the simple properties `exaStr`/`exaNum`/`exaBoo` have no blanks
  between each other (plain entries, not multi-line); the multi-line
  property `exaObj` gets 1 blank before it (it's not first) and, since
  it's also the LAST property of its parent, 2 blanks after its own
  closing `}` before the parent's closing `}` (last). Between sibling
  array entries that are each multi-line objects (neither first nor last),
  it's 1 blank on both sides.
- Every multi-line object's properties get their `:` column-aligned —
  pad each property name (left-justify) to the width of the longest name
  in that specific object, same computation used for `style` objects and
  named imports elsewhere in this doc. This applies per-object — a nested
  object's own alignment is computed independently from its parent's.
- A one-line array literal — including a destructuring array binding like
  `const [ indRecObj, setIndRecObj ] = React.useState( null );` — gets a
  space directly after `[` and directly before `]` when it has at least one
  element. An empty array (`[]`, e.g. an empty `useEffect`/`useCallback`
  dependency list) stays tight — no space either side.
- Every object literal gets a space between each property name and its
  `:` (`id : 'today'`, not `id: 'today'`) — this applies universally to
  every object literal in the file, not just one array of config objects.
- When several structurally-similar object literals (or JSX conditional
  branches) are stacked as adjacent lines, column-align their matching
  parts too — e.g. every entry's closing `}` in a config array, or the
  `&&`/tag-name padding across parallel `{x === 'a' && <TabA .../>}`
  branches — computed from the longest entry's needed width.
- An object literal with 2+ properties gets split to one property per line
  — even if it would otherwise still fit on one line character-count-wise
  — whenever at least one property's value is a non-trivial expression
  (contains a binary operator like `+`/`-`/`*`/`/`, or is otherwise more
  than a bare literal/identifier/single property-access). A simple
  config-style object whose values are plain literals only (e.g.
  `TAB_OBJ_ARR`'s entries) stays on one line even with several properties,
  since there's nothing to visually untangle. Even when it's really just
  one call argument wrapped for readability (as opposed to a genuine
  multi-entry container like `TAB_OBJ_ARR`), it STILL gets the usual
  2-blank-line padding after `{`/before `}` — same as any other multi-line
  object literal, no exception for the call-argument case — but its last
  property still does NOT get a trailing comma. Combined with the
  tight-`({`/`})` exception from the Parentheses spacing section below
  (a call whose sole argument is this kind of object skips the paren's own
  inner space):
  ```
  setIndRecObj({


  	x : butRecObj.left - navRecObj.left + navCurEle.scrollLeft,
  	y : butRecObj.top - navRecObj.top + navCurEle.scrollTop,
  	w : butRecObj.width,
  	h : butRecObj.height


  });
  ```

### Parentheses spacing (declarations, calls, control-flow)
- A non-empty parenthesized list gets a space directly after `(` and
  directly before `)` — this covers a function/arrow declaration's own
  parameter list, a function/method call's own arguments, AND an
  `if`/`else if`/`while` condition alike (`if ( !navCurEle ) return;`,
  `resObsObj.observe( navCurEle );`, `function TabBarCom ( { ... } ) {`).
- An EMPTY parenthesized list stays tight instead — a zero-argument call
  (`foo()`), a zero-parameter arrow (`() => ...`), an empty dependency
  array's enclosing call — no space inserted either side.
- Ternary/grouping parens used purely for operator precedence (not a call,
  a declaration, or a control-flow condition) are NOT covered by this rule
  and stay exactly as written.
- **Exception**: a call whose sole argument is a multi-line object literal
  — where the `(` is followed immediately by `{` with nothing else on
  that line, and (on the matching closing line) `}` is followed
  immediately by `)` with nothing else before it — skips the space on
  that side. The object literal's own opening/closing braces already mark
  the boundary clearly, so the paren adds no useful separation there:
  ```
  setIndRecObj({


  	x : butRecObj.left - navRecObj.left + navCurEle.scrollLeft,
  	y : butRecObj.top - navRecObj.top + navCurEle.scrollTop,
  	w : butRecObj.width,
  	h : butRecObj.height


  });
  ```
  This is narrow: it's specifically about `(`/`{` and `}`/`)` landing
  directly adjacent at a line boundary. A call whose argument is anything
  else (an arrow function, a ternary, multiple arguments, ...) still
  follows the normal spacing rule above.

### Functions
This means ANY function that isn't a one-line declaration — named
functions, arrow functions, and inline callbacks passed to hooks like
`useEffect`/`useState`'s lazy initializer/`useCallback`/`useMemo`, no matter
how short the body is.
- Directly after the opening `{` — or the opening `(` for an implicit-return
  arrow like `() => ( expr )`, which counts as a function body too — insert
  2 blank lines before the first line inside. Directly before the closing
  `}`/`)`, insert 2 blank lines after the last line inside.
- A function that fits entirely on one line AND has only a single
  statement inside (e.g.
  `const onDarChaFun = ( chaEveObj ) => setSysDarBoo( chaEveObj.matches );`,
  or a one-line cleanup `return () => { resObsObj.disconnect(); };`) is
  exempt — there's nothing to pad. See "Multi-statement one-line blocks"
  below for what happens once there's more than one statement.

### Multi-statement one-line blocks
- A one-line block that requires 2 or more semicolon-separated statements
  crammed together (e.g. a cleanup function running two unrelated
  teardown calls) must be broken into a real multi-line block instead —
  even if it's a `return`ed arrow function and would otherwise qualify
  for the "Functions" one-liner exemption above. Space the resulting
  statements using the normal relatedness tiering (see "General
  relatedness tiering" below), and pad the block like any other
  multi-line function body (2 blank lines after `{`, 2 before `}`):
  ```
  return () => {

  	if ( resObsObj ) resObsObj.disconnect();

  	window.removeEventListener( 'resize', meaPosFun );

  };
  ```
- **Exception**: a guard-clause block whose second (and final) statement
  is a bare `return;` stays exempt and compact on one line regardless —
  e.g. `if ( !butActEle ) { setIndRecObj( null ); return; }`. Any other
  combination of 2+ statements (including two calls with no `return` at
  all, like two sibling `clearTimeout(...)` calls) follows the rule above
  instead.

### if/else and while statements
- Same padding as functions — 2 blank lines after the opening `{` and 2
  before the closing `}` — but only when the block actually spans multiple
  lines. A one-line body with a single statement (`if ( !navCurEle )
  return;`), or the guard-clause-ending-in-`return` exception from
  "Multi-statement one-line blocks" above (`if ( !butActEle ) {
  setIndRecObj( null ); return; }`), is exempt and stays exactly as
  compact as it already is.
- A short "declare a value, then immediately guard-check it and return
  early" pair (e.g.
  `const prePlaStr = prePlaRef.current; if ( prePlaStr === tabPlaStr ) return;`)
  counts as one small isolated unit: 1 blank line between the two lines
  internally, but 3 blank lines on both sides separating that whole pair
  from whatever comes before/after it — even if a neighboring pair looks
  structurally identical (e.g. a second `declare + guard` pair checking a
  completely different, independent condition right after it also gets 3
  before it, not folded into the same unit).
- A multi-line `if`/`else if`/`else` chain puts each `else if`/`else` on
  its OWN line — never cuddled onto the previous block's closing `}` (no
  `} else {`) — with exactly 1 blank line between that closing `}` and
  the next `else if`/`else` keyword. This is the same "related" (1 blank
  line) tiering already used for mutually-exclusive branches elsewhere in
  this doc, just made explicit for statement-level if/else chains: each
  branch of one conditional is inherently related to its siblings. Each
  branch's own body still gets the standard 2-blank-line padding from the
  bullet above when it spans multiple lines:
  ```
  if ( exaConBoo === true ) {


  	example code;


  }

  else if ( exaConBoo === false ) {


  	example code;


  }

  else {


  	example code;


  }
  ```

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
- No space after `<`/`</` or before `>`/`/>` on any element — `<span>`,
  `</span>`, `<img src='x' />` all stay tight. (An earlier version of this
  doc required a space there; reversed once multi-line attributes — see
  below — became the norm, since the tag name and its attribute list are
  now already visually separated by being on different lines, and the
  extra bracket-spacing just added noise on top of that.)
  - **Exception**: a one-line element with exactly one attribute (the
    only case where an element can have an attribute AND still be
    one-line, since 2+ always forces multi-line) DOES get a space before
    its closing `>` — e.g. `<span className='brand-name'>` →
    `<span className='brand-name' >`. A self-closing one-liner already has
    this space before `/>` from the pre-existing convention, so it's
    unaffected. A zero-attribute element (`<defs>`) or a closing tag
    (`</span>`, never carries attributes) stays tight either way.
- Every JSX expression container — an attribute value (`ref={navEleRef}`)
  or a JSX child expression (`{actIdeStr === 'today' && ...}`) — gets a
  space directly after its `{` and directly before its `}`:
  `ref={ navEleRef }`, `{ actIdeStr === 'today' && ... }`. This extends to
  `${...}` template-literal interpolations too: `` `tab--${tabPlaStr}` ``
  → `` `tab--${ tabPlaStr }` ``.
  - **Exception**: when the container's content is itself an object
    literal (the double-brace case, e.g. `style={{ stroke : '...' }}`),
    don't add a second, separate space on top of the object literal's own
    spacing — `{{`/`}}` stays tight exactly as it already reads.
  - **Exception**: when a JSX child expression's closing `}` is directly
    preceded by more than one other closing bracket from nested
    calls/arrows (e.g. `.map((x) => (<Foo />))`'s trailing `))}`), those
    closing brackets stay tight against each other and against the `}` —
    don't force a space between each one just because they're stacked:
    `{ TAB_OBJ_ARR.map( ( tabConObj ) => (\n\t...\n))}`, not
    `( ... ) )}`.
- Treat a JSX element that has actual children spanning multiple lines the
  same as a function/array/object: 2 blank lines directly after its opening
  tag and 2 directly before its closing tag. This includes a
  `{ condition && (\n  <Foo />\n) }` multi-line conditional wrapper — the
  `(` and `)` count as an opening/closing pair too.
  - Exception: a self-closing element whose only multi-line aspect is its
    own wrapped attributes (no children at all, e.g.
    `<button\n\tclassName='x'\n\tonClick={...}\n>`) needs no padding
    between its attribute lines — there's no "inside" to pad.
- Between sibling JSX children, apply the same related/somewhat-related/
  unrelated tiering as regular code (see below). One common case: a run of
  visually-repetitive sibling elements of the exact same kind (e.g. the
  several `<path>` elements making up one SVG icon, or a handful of mutually
  exclusive `{actIdeStr === 'x' && <TabX />}` branches selecting a page) is
  usually "related" (1), not the 3-blank-line default reserved for
  genuinely different elements.

### Attribute/prop ordering
Every JSX element's attributes/props (native DOM/SVG elements AND custom
components alike — a custom component's props follow the exact same
8-tier scheme, mapped by role, not by whether they're a "real" HTML
attribute) are ordered into these 8 tiers, top to bottom:
1. **React-internal, not real DOM attributes**: `key`, `ref`,
   `dangerouslySetInnerHTML`. React strips these before the element ever
   reaches the DOM, so they always come first regardless of element type —
   this includes SVG elements (SVG's own attributes do NOT get ranked
   ahead of `key`/`ref`, see tier 6 below).
2. **Identity**: `id` on a native element; on a custom component, whichever
   prop plays the equivalent identity role (e.g. `pickerId`, `featureId`,
   `pageId`).
3. **Class**: `className` (never bare `class` — that attribute name
   doesn't exist in JSX at all).
4. **Style**: `style={{ ... }}`.
5. **State/custom identifiers**: `name`, `data-*`, `htmlFor` (never bare
   `for` — reserved word in JS, so JSX renames it).
6. **Core functional / primary data** — the tier that does the most work,
   so it absorbs a few different things:
   - Native elements: `src`, `href`, `action`, `type`, `value`/
     `defaultValue`, `checked`/`defaultChecked`, `disabled`, `required`,
     `readOnly`, `placeholder`, `min`/`max`/`step`/`pattern`/`maxLength`,
     `target`/`rel`, `autoFocus`, `autoComplete`, `spellCheck`,
     `contentEditable`, `draggable`.
   - SVG elements specifically: every SVG geometry/presentation attribute
     (`viewBox`, `width`, `height`, `x`, `y`, `cx`, `cy`, `r`, `rx`, `ry`,
     `d`, `points`, `transform`, `fill`, `stroke`, `strokeWidth`,
     `strokeLinecap`, `strokeLinejoin`, `clipPath`, `clipPathUnits`, ...)
     sits in THIS tier — alphabetized among themselves rather than
     individually ranked, since there are too many to rank one by one.
   - Custom components: whatever core data/behavior props actually drive
     the component (e.g. `state`, `actions`, `animStyle`) — anything that
     isn't identity/style/descriptive/an event callback lands here.
7. **Descriptive / accessibility**: `alt`, `title`, `aria-*`, `role`,
   `tabIndex`.
8. **Events/callbacks, always last**: native handlers (`onClick`,
   `onChange`, ...) AND custom-component callback props (`onHome`,
   `onNavTab`, `onClose`, ...) — both are the same conceptual category, so
   they're interleaved by whatever order makes sense, not native-first.

### Multi-line attributes
- Any element (native or custom component) with 2 OR MORE attributes/props
  always goes multi-line — never all on one line, no matter how short the
  attributes are. This is exact, not "as long as it's reasonably long":
  even a 2-attribute element like `<span className='x' aria-hidden='true'>`
  must split.
- Exactly one attribute per line, no grouping multiple attributes onto a
  shared line. The opening tag name gets its OWN line with nothing else on
  it (not even the first attribute). The closing `>`/`/>` ALSO gets its
  own line, at the same indentation depth as (i.e. column-aligned under)
  the opening tag name's own `<` — it does NOT stay glued to the last
  attribute's line:
  ```
  <span
  	className='x'
  	aria-hidden='true'
  >
  ```
  Applies identically to self-closing elements — the `/>` sits alone on
  its own line too, aligned with the `<`:
  ```
  <Icon
  	name={ tabConObj.icon }
  	size={ 20 }
  />
  ```
  This supersedes the earlier "wrapped attributes column-aligned under the
  first attribute" indentation case for element attribute lists specifically
  — since the tag name never shares a line with an attribute anymore, there's
  no longer a column to align under. Use plain structural indent (one tab
  deeper than the opening tag's own line) for every attribute line instead.
  (That said, the alignment mechanism itself, from the Indentation section
  above, still applies to OTHER kinds of deliberately-column-aligned
  continuation lines that aren't an element's own attribute list.)
- A single-attribute element is unaffected as long as that attribute's own
  value doesn't itself force multi-line (see the `style` rule right below)
  — e.g. `<path d='...' />` stays exactly as compact as it already is.
- **`style={{ ... }}` objects follow this same "2+ means multi-line" rule,
  one property per line** — regardless of whether the property values are
  simple literals or complex expressions (this is stricter than the
  general object-literal rule elsewhere in this doc, which only splits an
  object when a value is non-trivial; `style` always splits at 2+
  properties). No trailing comma on the last property, and it stays tight
  (no blank-line padding) — same convention as a wrapped call-argument
  object. Additionally, the `:` of every property in the same `style`
  object always lines up in one column — pad each property name
  (left-justify) to the width of the longest name in that object, same
  computation as the column-alignment already used for named imports and
  stacked object literals elsewhere in this doc:
  ```
  style={{
  	stroke      : 'var(--accent-soft)',
  	strokeWidth : 16
  }}
  ```
  If `style` is an element's ONLY attribute and it has 2+ properties, the
  element itself still goes multi-line as a consequence — the tag name
  gets its own line, `style={{` follows, then each property, then the
  closing `}}`, then (per the closing-bracket rule above) the element's
  own `>`/`/>` on its own line after that:
  ```
  <g
  	style={{
  		stroke      : 'var(--accent-soft)',
  		strokeWidth : 16
  	}}
  >
  ```
- When this turns a JSX child into a genuine multi-line element (most
  commonly a `{condition && <Foo attr1 attr2 />}` one-liner that now has
  to expand), wrap it in the multi-line conditional `(...)` pattern from
  the JSX section above, with the usual 2 blank lines inside.
- A run of visually-repetitive sibling conditionals that used to share a
  deliberately-aligned single line each (e.g. four
  `{actIdeStr === 'x' && <TabX .../>}` branches column-padded to line up)
  loses that alignment once each one expands to multi-line — that's an
  accepted tradeoff of this rule, not a bug to fix.

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

### Naming conventions
Applies to every named thing — variables, function/component declarations,
function parameters, destructured bindings — no matter how short-lived or
narrowly scoped, subject to the specific exemptions below. Being rolled out
gradually alongside the whitespace rules above (started with `src/app.jsx`).

- **The 9-character/3-segment rule**: a name is built from exactly three
  3-character segments (9 characters total, camelCase for regular
  identifiers): segment 1 = what it is, segment 2 = a descriptor or
  continuation of what it is (no hard rule for this one beyond "strictly
  3 letters"), segment 3 = the type of variable (e.g.
  `Str`/`Boo`/`Obj`/`Arr`/`Fun`/`Ref`/`Tmo`). Each segment is strictly the
  first 3 letters of a chosen English word — even when a shorter
  conventional abbreviation exists (e.g. `but` for "button", not `btn`;
  `con` for "config", not `cfg`).
  - Example: `TABS` → `TAB_OBJ_ARR` (Tab + Object + Array).
  - Example: `active` (the app's current tab id) → `actIdeStr` (Active +
    Identifier + String).
- **True module-level constants** use `ALL_CAPS_WITH_UNDERSCORES` instead
  of camelCase, but still 9 letters across the 3 segments — underscores
  don't count toward that total (`TAB_OBJ_ARR` is Tab+Obj+Arr = 9 letters
  plus 2 separating underscores).
- **React components** get PascalCase (all 3 segments capitalized) but
  otherwise follow the same 9-character/3-segment rule — e.g. `TabBar` →
  `TabBarCom` (Tab+Bar+Component), the root `App` export → `AppRooCom`
  (App+Root+Component).
  - Renaming an exported symbol (a component, in particular) ripples to
    every file that imports it — e.g. renaming `App` also required
    updating `main.jsx`'s import and its `<App />` JSX usage. Check for
    other importers before committing to a rename like this.
- **Exemptions** — standard React/DOM convention names are left as-is,
  entirely exempt from the rule: `onChange`, `className`, and React's own
  hooks (`useState`, `useRef`, `useLayoutEffect`, `useEffect`,
  `useCallback`, ...).
- **"on"-prefix pattern**: a custom callback prop/handler that isn't the
  exact standard `onChange` keeps the "on" prefix (since "on" itself is
  standard convention) and applies the normal 9-character/3-segment rule
  to the rest of the name, for an 11-character total — e.g. `onToggleRail`
  → `onTogRaiFun` (on + Toggle + Rail + Function).
- **"set"-prefix pattern**: a `useState` setter function keeps the "set"
  prefix and reuses its paired state variable's own (already-renamed) name
  verbatim after it, for a 12-character total — e.g. the state variable
  `railOpen` → `raiOpeBoo`, so its setter `setRailOpen` → `setRaiOpeBoo`.
- **Acronym-reference rule**: when a name describes or refers to another
  named thing (a component, function, etc.), its own first segment is
  built from the first letter of *that* thing's own three segments,
  instead of inventing a fourth truncated word — e.g. a boolean describing
  whether `TabBarCom` itself (Tab+Bar+Com) is a ghost copy becomes
  `tbcGhoBoo` (tbc from Tab/Bar/Com + Ghost + Boolean).
- **Naming-conflict resolution** (rare — only when the standard first-3-
  letters rule would produce a 9-character name that collides with an
  already-in-use name elsewhere). Segment 3 (the type segment) is never
  touched by this — it's standard and always stays as the literal first 3
  letters of the type word, to avoid confusion about what type a variable
  is. Only segments 1 and 2 are ever adjusted, trying segment 1's word
  first and then segment 2's, using this escalating two-phase search:
  - **Phase A**: keep the segment's first 2 letters, skip its normal 3rd
    letter, and escalate which LATER letter fills the segment's 3rd
    character — try the word's 4th letter; if the name still collides, try
    the 5th letter, then 6th, and so on, one letter further each time. If
    the word is too short to reach a next letter before the collision
    resolves, stop escalating this segment and restart Phase A on segment
    2's word instead (only if segment 1 was the one just tried).
  - **Phase B**: only reached if Phase A ran out on both segments 1 and 2
    without resolving the collision. Restart from segment 1 with a
    different skip pattern — keep the word's 1st letter, skip its 2nd
    letter, and escalate the segment's 3rd character starting from the
    4th letter: try `[1st letter, 3rd letter, 4th letter]`; if it still
    collides, try `[1st letter, 3rd letter, 5th letter]`, then 6th, and so
    on. If segment 1's word runs out again, move to segment 2's word and
    repeat Phase B on it.
  - A segment whose word is too short even for a phase's first attempt
    (e.g. a 3-letter word has no 4th letter to skip to) contributes
    nothing in that phase and is simply skipped in favor of the other one.
    In the near-impossible case Phase B also exhausts both segments 1 and
    2, fall back to choosing a different word entirely for one of them and
    reapply the normal rule.
- **`id` attributes** follow the same 9-character/3-segment rule as any
  other name, but segment 3 (the "type" segment) describes what KIND OF
  THING the id labels — the element/role it identifies — rather than the
  JS data type of the string holding it. Example: the SVG `<clipPath>`
  that clips the nav brand-mark's glyph path to its rounded-square badge
  → `braMarCli` (Brand + Mark + Clippath), referenced via
  `clipPath={ \`url(#${ braMarCli })\` }` on the path it clips.
  - When a component can render more than one live instance of itself at
    once (e.g. `TabBarCom` mounts a second "ghost" copy of itself during
    the nav placement-switch animation, gated by its own `tbcGhoBoo`
    prop), a static id shared by both instances is a real bug — ids must
    be document-unique, and a duplicate means `url(#id)` only ever
    resolves to whichever instance is first in the DOM. Compute the id
    once as a local variable and append a `--` + 3-letter modifier
    segment (same truncation rule as the base name, e.g. `--gho` for
    "ghost") when the condition that causes duplication is true:
    ```
    const braMarCli = `braMarCli${ tbcGhoBoo ? '--gho' : '' }`;
    ```
    Reference that variable everywhere the id is needed (both the
    defining element's `id` and every place that reads it back via
    `url(#...)`) rather than recomputing or restating the ternary each
    time, so the definition and every reference can never drift apart.
- **Object property names** follow the same naming rule as everything
  above, but are only 6 characters — they drop the middle "descriptor"
  segment and keep just segment 1 (what it is) + segment 3 (type), each
  still strictly the first 3 letters of its word. Example — `TAB_OBJ_ARR`'s
  own entries: `id` → `ideStr` (Identifier + String), `label` → `labStr`
  (Label + String), `icon` → `icoStr` (Icon + String). Every place that
  reads the property (e.g. `tabConObj.ideStr`) must be updated to match
  when a property is renamed this way — same as any other rename.
  - **Naming-conflict resolution for properties**: with only 2 segments
    (6 characters) instead of 3, conflicts are more likely. The type
    segment (segment 2 here) is protected exactly like segment 3 is for
    the general rule — never touched. Only segment 1's word is ever
    escalated, using the same two-phase search as the general rule's
    Phase A/Phase B (Phase A: keep the first 2 letters, escalate the 3rd
    character through the word's 4th, 5th, 6th, ... letters; Phase B, only
    if Phase A exhausts: keep the 1st letter, skip the 2nd, escalate the
    3rd character through the 4th, 5th, 6th, ... letters). Since there's
    no second segment to fall back to this time (there's nowhere else for
    the escalation to move to), if Phase A and Phase B both exhaust
    without resolving the collision, stop and ask the user what to do —
    don't guess a different word unprompted the way the general rule's
    final fallback does.
  - **Exemption**: this rule only applies to an object whose property
    names are entirely OUR OWN invention — both the write site and every
    read site are code we control, so renaming is free (e.g. the
    `{ lefNum, topNum, widNum, heiNum }` shape `setIndRecObj` builds and
    `indRecObj.lefNum`/etc. reads back, all private to `TabBarCom`). An
    object whose keys are constrained by an external contract is exempt
    entirely — most commonly a `style={{ ... }}` object, whose keys must
    stay as real camelCase CSS property names (`strokeWidth`, `transform`,
    ...) because React passes them straight through to the DOM; renaming
    those would silently break rendering, not just look different. The
    test is always "do I control every reader of this key," not merely
    "is this an object I wrote."

### Default parameter values
- Only give a parameter a default where it's genuinely reachable/
  meaningful — some real caller actually relies on the fallback, or it
  documents real existing behavior — not a blanket "every parameter gets
  one" rule.
- For a callback prop that's central to a component's core purpose, weigh
  a silent no-op default (`() => {}`) against letting a call fail loudly
  with a thrown error if the prop is never wired up: a no-op can mask a
  forgotten-integration bug, while a thrown error surfaces it immediately.
  Lean toward the loud failure for those; a quiet, cosmetic default (e.g. a
  boolean flag's natural resting state, or a string's natural starting
  value) is fine either way.



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


