import React from 'react';

// Shared, reusable "target + description" catalog for onboarding overlays.
// The nav bar's per-page buttons ([data-tab="..."]) are spotlighted both by
// the main Welcome Tour (onboarding.jsx) and, later, by each page's own
// "Explore the {page}" mini-tour (see OB_PAGE_TOURS in
// onboarding-checklist.js) as its opening step — so this is kept as one
// source of truth instead of being duplicated per consumer. Keyed by the
// same page ids as OB_PAGE_TOURS' `page` field.
//
// Each entry is content only — `sel`/`place`/`title`/`body`, no navigation
// (primary/back/run) — since a guided tour needs Back/Next/Skip and a
// future on-demand help mode won't. `body` is written to stand alone as a
// plain description of what the page IS, with no reference to "this tour"
// or "the next step" baked in, so it reads fine wherever it's reused.
// Consumers that need tour-flow-specific framing (e.g. "let's explore this
// page now") append that themselves rather than have it forced into the
// shared text — see the steps in onboarding.jsx for that split in practice.
const OB_NAV_TARGETS = {
  today: {
    sel: '[data-tab="today"]', place: 'below',
    title: 'This is the Today page',
    body: <>The <b>Today</b> page is the main page of the app, and it will be where your auto-generated list will be displayed every day.</>,
  },
  picker: {
    sel: '[data-tab="picker"]', place: 'below',
    title: 'This is the Pickers page',
    body: <>The <b>Pickers</b> page is where new pickers and their items can be created. You can also run any picker to generate a task.</>,
  },
  stats: {
    sel: '[data-tab="stats"]', place: 'below',
    title: 'This is the Stats page',
    body: <>The <b>Stats</b> page is where you can find a breakdown of all the statistics associated with a given picker and its items.</>,
  },
  data: {
    sel: '[data-tab="data"]', place: 'below',
    title: 'This is the Data page',
    body: <>The <b>Data</b> page is where you will be able to view and edit all your reminders, pickers and their items.</>,
  },
  settings: {
    sel: '[data-tab="settings"]', place: 'below',
    title: 'This is the Settings page',
    body: <>The <b>Settings</b> page is where you will be able to customize various aspects of the app, install the app and export/import your data.</>,
  },
};

export { OB_NAV_TARGETS };
