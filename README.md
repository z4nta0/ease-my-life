# Vite skeleton — Ease My Life

This folder is Phase B of `Vite Handoff Checklist.md`, already done: the app
converted from `window.*` globals to real ES modules. Drop it into an empty
directory, `npm install`, `npm run dev`.

```
vite/
  index.html          build entry (Vite parses this — keep it at the ROOT)
  package.json        react/react-dom pinned to 18.3.1
  vite.config.js      @vitejs/plugin-react (PWA plugin goes here in Phase C)
  src/
    main.jsx          boot gate: STORAGE.init() -> createRoot().render(<App />)
    *.js *.jsx        the app, as modules
    styles.css        copied from app/
    styles2.css
```

## Still yours to do

- `public/` — copy `favicon.ico`, `assets/`, `manifest.webmanifest`,
  `robots.txt`, `sitemap.xml` in. Nothing references them from `src/`, so Vite
  will not copy them for you. (Phase A + F.)
- Phase C (PWA plugin, self-hosted fonts), D (Netlify), E (device testing),
  F (real domain). Unchanged.
- The `CHECK` items in Phase B: this conversion is validated structurally
  (every import resolves to a real export, no cycles, no stray globals) but it
  has **never been executed**. `npm run dev` is the first real test.

## What changed beyond mechanical renaming

Four things needed a judgement call, not just a find-and-replace:

1. **`appearance.js` is new.** `PALETTES` / `applyPaletteObj` /
   `resolveCustomPalette` / `resolveActiveThemeKey` used to live in `app.jsx`
   and hang off `window.APPEARANCE`, but `tab-settings.jsx` reads them — which
   as modules is an import cycle (`app -> tab-settings -> app`). They now live
   in their own module that neither imports. `resolveActiveThemeKey` was also
   being bolted onto the `APPEARANCE` object one line after it was created; it
   is a normal export now.

2. **`constants.js` is new.** `EASE_UP_RANGE_WARN` was declared in
   `tab-data.jsx` and read by `tab-today.jsx`, while `tab-data.jsx` reads
   `EntryEditor` back out of `tab-today.jsx` — the second cycle. The string
   moved to its own module.

3. **The Tweaks panel is gone from `app.jsx`** — `useTweaks`, `TWEAK_DEFAULTS`,
   the `<TweaksPanel>` block, and the now-unused `PaletteSwatch`. It was
   design-time tooling. Note that palette / animation style / tab placement
   were already real persisted settings read from `state.appearance`; the only
   thing the panel uniquely drove was the `viewport: mobile` preview toggle,
   which has no place in the shipped app.

4. **Six globals deliberately stay on `window`**: `__escStack`, `__escBound`,
   `__editGuard`, `__emlGenerate`, `__emlPickerCreated`, `__dismissBootSplash`.
   These are runtime registration channels — a component assigns one on mount so
   another component (or `index.html`) can call it later. Converting them to
   imports would mean rewriting the coordination, which is a refactor, not a
   port. They are all `__`-prefixed, so they are easy to find later.

One cosmetic wart: `ui.jsx` declares `let announce;` at the top and assigns it
inside an IIFE further down, because that is where the live-region element gets
built. It exports correctly; it just does not read as nicely as the rest.
