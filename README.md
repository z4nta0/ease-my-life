# Ease My Life

Pick what to do today, without deciding. Live at [easemylife.app](https://easemylife.app/).

Ease My Life is a small app for the everyday choices that eat up attention:
which chore to tackle, what to cook, which show to put on next. You build
**pickers**, pools of items with their own rules for how one gets chosen, and
the app puts together a short list for each day. Reminders cover the things
that happen on a fixed schedule, and conditionals can give a picker a day off.

## How it works

- **No accounts, no server.** Everything is stored on your own device
  (IndexedDB, with a localStorage fallback). Settings can export a backup file
  and import it again on another device.
- **Installable.** It's a Progressive Web App, so it can be added to a home
  screen or dock and works offline.
- **Pickers choose in different ways:** truly random, weighted, dynamic (an
  item's odds grow the longer it waits), or easing up or down over time so an
  item comes around again at a steady pace.
- **Pickers run on a schedule:** daily, weekly, monthly, or yearly, by date or
  by day of the week, limited to certain weekdays if you like, skipping
  holidays, and avoiding an item another picker already chose that day.
- **Reminders** are one-time (today or a future date) or recurring: every few
  days, weekly on chosen weekdays, monthly by date or by "the 2nd Tuesday",
  and yearly the same two ways, each able to skip intervals (every other
  week, every third month).
- **Conditionals** gate a picker for the day: by fixed or growing odds, or by
  charging up or down until they trigger. When one fires, the picker's slot
  shows a day-off card instead.
- **Nothing changes until you do it.** A picked item only updates its picker
  once it's marked done, and unchecking it undoes that exactly.
- **The list builds itself.** The daily generator can run automatically at a
  time you choose, with an optional notification while the app is open.

## The tabs

- **Today:** the day's list, grouped, with check-offs, re-rolls, skips, a
  progress ring, a day streak, and a log of what the generator did.
- **Pickers:** spin a picker by hand, send the result to Today, and manage its
  items. A guided form builds new pickers.
- **Stats:** streaks, completion rates, a calendar heatmap, and breakdowns by
  picker, item, reminder, and conditional, over any range.
- **Data:** every picker, item, reminder, and conditional in one place to edit
  in bulk.
- **Settings:** themes (light, dark, custom, or following the system),
  celebration and picker animations, tab bar placement, the daily generator,
  holidays (US holidays computed offline, plus your own), backups, and the
  legal documents.

## Getting started in the app

A first visit opens a welcome modal and a short guided tour. Today then shows
a checklist of mini-tours to work through at your own pace:

- **Page tours** walk through each tab.
- **Picker tutorials** build one sample picker of each kind, step by step.
- **Reminder tours** add a one-time and a recurring reminder.
- **Generate** closes the checklist by building your first real list.

After that, **App Features** tours cover manual picks, editing items, the
generator's run time, themes, animations, highlights, and protecting your
data. The tours drive the real app rather than a mock-up, and Settings can
replay the welcome tour at any time. Every tab also has a **help mode**: turn
it on and tap anything to see what it does.

## Running it locally

Requires Node.js 20.19+ or 22.12+ and npm.

```
npm install
npm run dev       # development server
npm run build     # type check, then production build into dist/
npm run preview   # serve the production build locally
npm run lint      # ESLint across the whole repo
npm run typecheck # TypeScript across the app, config, and test files
npm run test      # every test suite (see below)
```

The app is written in TypeScript with `strict` on. `npm run build` type checks
first, so a type error stops a build.

## Tests

Four [Playwright](https://playwright.dev/) suites live in `tests/` and are run
before merging a large change. Each starts its own development server on port
5190, so run them one at a time.

- `npm run test:simulation` fakes the clock and plays out about 53 days, from
  October 2026 through the new year, checking every generated list,
  check-off, undo, reminder, skip, re-roll, and streak against an independent
  copy of the rules, then the Stats figures and each conditional's odds.
  Picks are seeded, so a run repeats exactly and can be compared with an
  earlier one. About 20 minutes.
- `npm run test:interaction` drives every tab's controls and forms, checking
  that each change is saved and its animation plays.
- `npm run test:onboarding` runs the whole onboarding from an empty install,
  then the replay, on a phone width and a desktop width.
- `npm run test:responsive` measures every tab from 375 to 1280px wide for
  sideways scrolling, spilling text, and overlapping controls.

The suites run against a real data backup, which is personal and never part
of the repo: set `EML_TEST_FIXTURE` to an exported backup file, or put one in
an `ease-my-life-testdata` folder next to the repo. Results and screenshots go
to `tests/output/`. [CLAUDE.md](CLAUDE.md) has the details.

## Project layout

```
src/
  main.tsx       entry point: waits for storage, then mounts the app
  app.tsx        root component and tab bar
  core/          scheduling and picking logic, no React
  state/         app state, persistence, and sample data
  platform/      browser services: notifications, install, appearance
  ui/            shared components and editors
  tabs/          one folder per tab: today, pickers, stats, data, settings
  onboarding/    the welcome tour, the checklist tours, and App Features
  help/          the on-demand help mode
  utils/         small app-agnostic helpers (dates, formatting, motion)
  styles/        global CSS (fonts, tokens, base styles, shared animations)
tests/           the Playwright suites and their helpers
public/          files served at fixed URLs (icons, manifest, hosting rules)
scripts/         build helpers
design/          design notes, not shipped
```

Each component keeps its styles in a CSS module next to it
(`entry-card.tsx` with `entry-card.module.css`).

## Conventions

This codebase follows a detailed set of naming, formatting, and comment rules.
[CLAUDE.md](CLAUDE.md) documents the architecture, the reasoning behind the
less obvious parts of the domain logic, and the rules that apply to this
project alone. Read it before changing code.

## License

MIT-style with a non-commercial clause: free to use, copy, and modify, but not
for commercial purposes. See [LICENSE.md](LICENSE.md) for the full terms.
