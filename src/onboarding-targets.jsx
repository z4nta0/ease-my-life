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
    title: 'The Today Page',
    body: <>The Today page is the main page of the app and can be found using the calendar icon indicated here. The Today page is <b>where your auto-generated todo list will be displayed every day</b>.</>,
  },
  picker: {
    sel: '[data-tab="picker"]', place: 'below',
    title: 'The Pickers Page',
    body: <>The Pickers page is <b>where you can create new pickers</b> and can be found using the shuffle icon indicated here. You can also <b>manually run any picker, as well as send a specific item to your todo list</b>, from the Pickers page.</>,
  },
  stats: {
    sel: '[data-tab="stats"]', place: 'below',
    title: 'The Stats Page',
    body: <>The Stats page is where you can find a <b>breakdown of all the statistics associated with your created data</b> and can be found using the bar graph icon indicated here. As you continue to use the app over time, this page will be extremely useful.</>,
  },
  data: {
    sel: '[data-tab="data"]', place: 'below',
    title: 'The Data Page',
    body: <>The Data page is <b>where you can view and edit all of your created data</b> and can be found using the database storage icon indicated here. The Data page content includes all of your reminders, pickers and their associated items.</>,
  },
  settings: {
    sel: '[data-tab="settings"]', place: 'below',
    title: 'This is the Settings page',
    body: <>This is where you will be able to customize various aspects of the app, adjust the daily generator, customize holiday observances, <b>install the app</b> and export/import your data.</>,
  },
};

export { OB_NAV_TARGETS };
