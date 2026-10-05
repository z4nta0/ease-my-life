# Ease My Life

Pick what to do today, without deciding. Live at [easemylife.app](https://easemylife.app/).

Ease My Life is a small app for the everyday choices that eat up attention:
which chore to tackle, what to cook, which book to pick up next. You build
**pickers**, pools of items with their own rules for how one gets chosen, and
the app puts together a short list for each day. Reminders cover the things
that happen on a fixed schedule, and conditionals can give a picker a day off.

## How it works

- **No accounts, no server.** Everything is stored on your own device
  (IndexedDB, with a localStorage fallback). Settings can export a backup file
  and import it again on another device.
- **Installable.** It's a Progressive Web App, so it can be added to a home
  screen or dock and works offline.
- **Pickers choose in different ways:** truly random, weighted, dynamic, or
  easing up or down over time so an item comes around again at a steady pace.
- **Nothing changes until you do it.** A picked item only updates its picker
  once it's marked done, and unchecking it undoes that exactly.

## Running it locally

Requires Node.js and npm.

```
npm install
npm run dev       # development server
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

There is no test suite; changes are verified by running the app in a browser.
ESLint is configured and can be run by hand with `npx eslint <file>`.

## Project layout

```
src/
  main.jsx       entry point: waits for storage, then mounts the app
  app.jsx        root component and tab bar
  core/          scheduling and picking logic, no React
  state/         app state, persistence, and sample data
  platform/      browser services: notifications, install, appearance
  ui/            shared components and editors
  tabs/          one folder per tab: today, pickers, stats, data, settings
  onboarding/    the welcome tour and the guided mini-tours
  help/          the on-demand help mode
  styles/        global CSS (fonts, tokens, base styles, shared animations)
public/          files served at fixed URLs (icons, manifest, hosting rules)
scripts/         build helpers
```

Each component keeps its styles in a CSS module next to it
(`entry-card.jsx` with `entry-card.module.css`).

## Conventions

This codebase follows a detailed, project-specific set of naming, formatting,
and comment rules, written down in [CLAUDE.md](CLAUDE.md). Read it before
changing code; it also documents the architecture and the reasoning behind
the less obvious parts of the domain logic.

## License

MIT-style with a non-commercial clause: free to use, copy, and modify, but not
for commercial purposes. See [LICENSE.md](LICENSE.md) for the full terms.
