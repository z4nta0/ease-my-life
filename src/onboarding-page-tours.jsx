import React from 'react';
import { Icon } from './ui.jsx';
import { TutorialIntroModal } from './onboarding-intro-modal.jsx';
import { GuidedTour } from './onboarding-tour-runner.jsx';
import { OB_NAV_TARGETS } from './onboarding-targets.jsx';
import { OB_PAGE_TOURS } from './onboarding-checklist.js';
import { OB_EXAMPLE, OB_EXTRA_PICKERS, OB_SAMPLE_PICKER_IDS, OB_TASKS, hydrateOnboardingStats } from './onboarding-seed-data.js';
import { emlTour } from './onboarding.jsx';

// Page tours ("Explore the {page}" — Today/Pickers/Stats/Data/Settings) are
// still growing in from an intro-only stub — Today is the only one with real
// steps beyond this so far. Falls back to OB_NAV_TARGETS' own per-page
// title/body (already written to stand alone, with no reference to "this
// tour" or "the next step" baked in — see that file's own comment) for any
// page PAGE_TOUR_COPY below hasn't gotten its own dedicated pass yet.
const PAGE_TOUR_COPY = {
  explore_today: {
    title: 'Today Page',
    body: <>This tutorial will take you on a quick tour of the Today page, in order to <b>highlight important elements and functionality</b>.</>,
    pills: ['page tour', 'today page', 'todo list'],
  },
  explore_pickers: {
    title: 'Pickers Page',
    body: <>This tutorial will take you on a quick tour of the Pickers page, in order to <b>highlight important elements and functionality</b>.</>,
    pills: ['page tour', 'pickers page', 'new pickers'],
  },
  explore_stats: {
    title: 'Stats Page',
    body: <>This tutorial will take you on a quick tour of the Stats page, in order to <b>highlight important elements and functionality</b>.</>,
    pills: ['page tour', 'stats page', 'picker statistics'],
  },
  explore_data: {
    title: 'Data Page',
    body: <>This tutorial will take you on a quick tour of the Data page, in order to <b>highlight important elements and functionality</b>.</>,
    pills: ['page tour', 'data page', 'edit pickers'],
  },
  explore_settings: {
    title: 'Settings Page',
    body: <>This tutorial will take you on a quick tour of the Settings page, in order to <b>highlight important elements and functionality</b>.</>,
    pills: ['page tour', 'settings page', 'app customization'],
  },
};

// Step 1 for every page tour: highlight that page's own navbar button,
// reusing the Welcome Tour's own copy for it verbatim (OB_NAV_TARGETS
// already carries `sel`/title/body written to stand alone). Unlike
// PICKER_TOUR_STEP_1 (which deliberately writes its OWN copy instructing
// the click), this one is asked to match the Welcome Tour's wording
// exactly — requireClick's own hover hint is what tells the user to click.
// tab: 'today' keeps this from auto-navigating when the step opens (a page
// tour is launched from Today, and clicking the real nav icon is meant to
// be what does the navigating, not the step itself). `primary` defaults to
// 'Next' (every page tour has more steps after this one) but is overridable
// — App Features' own tours (onboarding-app-features.jsx) reuse this exact
// step verbatim as their OWN Step 1, currently still their only step, so
// theirs pass 'Done' instead. `buttonLabel` names the actual nav button
// ("Today", "Pickers", ...) in the closing sentence instead of the generic
// "click it now" — optional and only passed where a caller has explicitly
// asked for it, so other callers' wording is unaffected.
const buildPageTourStep1 = (page, run, primary = 'Next', buttonLabel = null) => {
  const nav = OB_NAV_TARGETS[page];
  return {
    ...nav,
    body: <>{nav.body} Go ahead and click {buttonLabel ? <>the "{buttonLabel}" page's button</> : 'it'} now.</>,
    tab: 'today',
    primary, back: false, requireClick: true,
    ...(run ? { run } : {}),
  };
};

// The Pickers/Data tours need real pickers on screen to point at (e.g. the
// group filter row doesn't even render with fewer than 2 groups), but both
// expose real edit/delete controls on whatever picker they highlight —
// reusing the Welcome Tour's own hidden sample pickers directly (the same
// ones the Today mini-tour launcher cards and Replay Tour depend on) would
// let the user's own interaction here (deleting one, editing an item,
// re-selecting a scope, etc.) corrupt that shared reference data. Seeded as
// full COPIES instead, under their own `pt_`-prefixed ids (never colliding
// with the real `pkr_ob_*`/`it_ob_*` ones), and cleaned up again the moment
// whichever tour used them ends (see clearPageTourPickers) — real,
// interactive, but disposable. Shared between the two tours rather than
// each maintaining its own copy set. Stats does NOT use this — see
// unhideSampleHistory below for why it borrows the real samples instead.
const PAGE_TOUR_SAMPLE_PICKERS = [OB_EXAMPLE, ...OB_EXTRA_PICKERS];
const pageTourCopyId = (id) => `pt_${id}`;
// Which page tours need disposable copies seeded/cleared at all — Today and
// Settings don't touch pickers, and Stats uses the real samples instead.
const usesSampleCopies = (pageId) => pageId === 'explore_pickers' || pageId === 'explore_data';

// Fired from Step 1's run() (see PageTour below) — between the nav click
// and Step 2 ever mounting, same "prepare what the NEXT step needs" timing
// already used elsewhere in this file (e.g. Today's Step 5 staging Step
// 6's rename input). Guarded by existence so navigating back to Step 1 and
// forward again (re-firing this run()) can't create duplicate-id pickers.
const seedPageTourPickers = (state, actions) => {
  PAGE_TOUR_SAMPLE_PICKERS.forEach((p) => {
    const copyId = pageTourCopyId(p.id);
    if (state.pickers.some((x) => x.id === copyId)) return;
    // Items keep their own name/weight/ease fields but drop their `id` —
    // passing the real sample's item ids through would collide with the
    // real hidden picker's own items in `state.items`.
    actions.addPicker({
      id: copyId, name: p.name, group: p.group, mode: p.mode,
      items: p.items.map(({ id, ...rest }) => rest),
    });
  });
};

// Discards the copies made above — called whenever a tour that seeded them
// ends (Skip or Done), so they never linger as clutter in the user's real
// picker list. Harmless no-op for any copy that was never actually seeded
// (e.g. Skip from the intro modal, before Step 1's run() ever fires).
const clearPageTourPickers = (actions) => {
  PAGE_TOUR_SAMPLE_PICKERS.forEach((p) => actions.removePicker(pageTourCopyId(p.id)));
};

// The Data tour's own Reminders step needs real reminders to point at, same
// reasoning as PAGE_TOUR_SAMPLE_PICKERS just above (real edit/delete
// controls are exposed there too, so a disposable copy protects the real
// hidden samples) — just for OB_TASKS instead of pickers. Data-only: the
// Pickers tour never touches reminders at all.
const pageTourTaskCopyId = (id) => `pt_${id}`;
const seedPageTourTasks = (state, actions) => {
  OB_TASKS.forEach((t) => {
    const copyId = pageTourTaskCopyId(t.id);
    if (state.tasks.some((x) => x.id === copyId)) return;
    actions.addTask({
      id: copyId, name: t.name, repeat: t.repeat,
      // Mirrors the real Welcome Tour's own seeding (see onboarding.jsx's
      // Generate-step run()): the recurring sample's own daysOfWeek is
      // whatever weekday it happens to be, not the base template's
      // hardcoded Monday — so it reads as "due today" like the real one
      // does, rather than an arbitrary fixed day.
      ...(t.repeat === 'weekly' ? { daysOfWeek: [new Date().getDay()] } : {}),
    });
  });
};
const clearPageTourTasks = (actions) => {
  OB_TASKS.forEach((t) => actions.removeTask(pageTourTaskCopyId(t.id)));
};

// The Stats tour has no edit/delete controls anywhere on the page — it's
// pure viewing — so unlike Pickers/Data it doesn't need a disposable copy to
// protect against corruption. A copy would also be worse here specifically:
// it'd start with zero pick history, leaving the heatmap/breakdown empty,
// the opposite of what the tour is trying to demonstrate. Instead it
// borrows the REAL hidden sample pickers directly — which normally already
// carry ~1yr of precomputed pickLog history, seeded once on fresh install
// (see onboarding.jsx's own mount effect) — unhiding them for this tour's
// own duration and hiding them again the moment it ends. Mirrors the exact
// hide/show mechanism the main Welcome Tour itself already uses for its own
// Back-navigation (see onboarding.jsx's handleGoBack / Settings-step run()).
//
// "Normally" above is load-bearing: that mount effect only seeds history on
// a genuinely virgin install (`state.pickers.length === 0`) — anyone who
// already had a picker of their own the very first time it ran (e.g. they
// used the app before this tour existed, or before the precomputed-history
// feature shipped at all) ends up with the sample PICKERS but none of their
// history, which is exactly what made the heatmap/breakdown look empty
// through Step 5 here. Backfilled the same way as that effect, guarded by
// existence (checking for any pickLog row already belonging to a sample
// picker) so a repeat tour run — or Back-then-Forward re-firing this same
// run() — can't duplicate rows.
const unhideSampleHistory = (state, actions) => {
  OB_SAMPLE_PICKER_IDS.forEach((id) => actions.updatePicker(id, { hidden: false }));
  if (!(state.pickLog || []).some((r) => OB_SAMPLE_PICKER_IDS.includes(r.pickerId))) {
    import('./onboarding-stats-data.js').then(({ ONBOARDING_STATS }) => {
      actions.seedHistory(hydrateOnboardingStats(ONBOARDING_STATS));
    });
  }
};
const hideSampleHistory = (actions) => {
  OB_SAMPLE_PICKER_IDS.forEach((id) => actions.updatePicker(id, { hidden: true }));
};

// Target + description catalog for the Pickers page's OWN interior elements
// — same shape/reasoning as TODAY_PAGE_TARGETS below.
const PICKER_PAGE_TARGETS = {
  // The pills specifically, not their .picker-groups container — that
  // container stretches to the FULL width of its row (.stat-filter-row's
  // own align-items: stretch), well past the pills' own content width, so
  // highlighting it left a big undimmed gap of empty background after the
  // last visible pill.
  groupFilter: {
    sel: '.picker-groups .picker-group-pill',
    title: 'Group Filter',
    body: <>This will allow you to <b>filter the pickers row below by their group</b>, which is extremely useful if you have created a lot of pickers. Feel free to select one now or click Next to advance to the next step.</>,
  },
  // Excludes the "Add new picker" button (now the first tab, not the last)
  // — Step 4 (below) covers that on its own, and this step's own copy is
  // entirely about selecting an EXISTING picker.
  pickerSelection: {
    sel: '.picker-tabs .picker-tab:not(.picker-tab--add)',
    title: 'Picker Selection',
    body: <>This will allow you to <b>select a specific picker</b>, in order to initiate a manual picker generation down below as well as edit or delete its items. Feel free to select one now or click Next to advance to the next step.</>,
  },
  createNewPickers: {
    sel: '.picker-tab--add',
    title: 'Create New Pickers',
    body: <>This is where you can <b>create new pickers</b>. We will not include this as part of the tutorial, but if you want to learn more then please do any one of the picker tutorials after this is finished. Click Next when you are ready to move on.</>,
  },
  // Two-phase highlight, both via the same fallback `sel` (findTargets tries
  // each comma-separated selector in turn and uses the first that matches —
  // see its own comment in onboarding-tour-runner.jsx). Before the click,
  // .pv-act--pick:not(.is-busy) matches the idle "Pick one" button, so the
  // pulse (.ob-spot.is-pulsing) lands tight on the actual button instead of
  // the whole window. The button alone doesn't disappear until the pick
  // actually lands (phase flips to 'done'/'sent' — see tab-picker.jsx) —
  // simply falling back once it's gone would leave the highlight pinned to
  // a "Picking…" button for the whole multi-second spin instead of framing
  // the window it's about to affect. .is-busy (added the instant the click
  // fires, well before the spin finishes) excludes that first selector
  // immediately on click, so the fallback to framing .picker-run kicks in
  // right as the spin starts, not once it ends. clickSel keeps the
  // requireClick guard scoped to the button specifically even once the
  // fallback is in play, same reasoning as addToTodoList's own clickSel
  // just below. pulseSel matches the exact same primary alternative as
  // `sel` — there's nothing left to click once the highlight has widened to
  // frame the window, so the pulse stops there too (see pulseSel's own doc
  // comment in onboarding-tour-runner.jsx) rather than continuing to ping
  // around a box the user can no longer act on.
  manualGeneration: {
    sel: '.pv-act--pick:not(.is-busy), .picker-run',
    clickSel: '.pv-act--pick',
    pulseSel: '.pv-act--pick:not(.is-busy)',
    title: 'Manual Generation',
    body: <>The "Pick one" button will allow you to <b>run a manual pick generation</b> for any given picker, so that you do not have to completely rely on the todo list's auto generation feature on the Today page. Click the "Pick one" button now to see how this works.</>,
  },
  // Same two-phase highlight as manualGeneration above: before the click,
  // .pv-act--send:not(.is-sent) matches the real Send to Today button, so
  // the pulse lands tight on it instead of the whole window. Clicking it
  // flips phase to 'sent' SYNCHRONOUSLY (see sendToToday in tab-picker.jsx
  // — unlike Pick one's spin, there's no separate busy/running phase to
  // exclude), which adds .is-sent immediately, so the fallback to framing
  // .picker-run kicks in right on click. That's deliberate, not just
  // incidental: this step's own advanceDelay (see its call site below)
  // holds the tour here for 1600ms after the click specifically so the
  // "Sent!" label swap + stage checkmark can play out — the highlight
  // needs to have already widened to frame that whole confirmation, not
  // stay pinned to a single button mid-animation. Re-roll/Done render
  // alongside Send to Today once phase is 'done'/'sent' but are disabled —
  // see tourInterceptSend's own gating in tab-picker.jsx, which also drives
  // their .is-tour-disabled look (a plain `disabled` attribute alone
  // renders no differently here) — so clickSel narrows the click-guard/
  // requireClick target down to Send to Today specifically; without it, a
  // click landing anywhere else in the widened box (the stage, or a
  // disabled sibling button — pointer-events:none passes its click through
  // to the container) would satisfy requireClick as if Send to Today
  // itself had been clicked. tourInterceptSend also skips the real
  // actions.addTodayEntry while this step is up, so the Sent! animation
  // plays without actually landing an entry on Today.
  addToTodoList: {
    sel: '.pv-act--send:not(.is-sent), .picker-run',
    clickSel: '.pv-act--send',
    pulseSel: '.pv-act--send:not(.is-sent)',
    title: 'Add to Todo List',
    body: <>The "Send to Today" button will <b>add the manually generated pick to your todo list on the Today page</b>. Go ahead and click the "Send to Today" button now to give it a try.</>,
  },
  // Per-item Send to Today/Edit/Delete are disabled while this step is up
  // (tab-picker.jsx's own disablePoolItemButtons, gated on this exact
  // tourId+step) — narrating what they do is the point, not inviting the
  // user to act on a disposable tutorial picker's real items. Excludes
  // "+ Add item" below (.pool-items, not .picker-pool) — that gets its own
  // step next.
  pickerItems: {
    sel: '.pool-items',
    title: 'Picker Items',
    body: <>Here you can <b>view all items in this picker's pool</b>. You can see a given items values, if applicable, as well as the <b>Send to Today, Edit and Delete buttons</b>. These buttons are disabled for this tutorial, so click Next when you are ready to move on.</>,
  },
  // Disabled while this step is up (tab-picker.jsx's own
  // disableAddItemButton, same tourId+step gating pattern) — narrating
  // what it does is the point, not inviting the user to open the real
  // create-item form on a disposable tutorial picker.
  addPickerItem: {
    sel: '.pv-additem-btn',
    title: 'Add Picker Item',
    body: <>This will allow you to <b>add new items to the selected picker's pool</b>. This button is disabled for this tutorial, so go ahead and click Done when you are ready to finish this tutorial.</>,
  },
};

// Id of the picker the Stats tour pre-selects for its own "single picker"
// steps below — matched by [data-picker-id] on the tab button
// (tab-stats.jsx), NOT by its display name: a real picker sharing that same
// name (nothing stops a user from naming their own picker "Daily Chores")
// would otherwise let a stale/duplicate name-match select the WRONG picker.
// Points at the REAL sample directly (not a disposable copy) — see
// unhideSampleHistory's own comment for why. The Data tour doesn't need an
// equivalent: it never narrows scope to one specific picker (see
// DATA_PAGE_TARGETS' own header comment).
const STATS_TOUR_PRESELECT_PICKER_ID = OB_EXAMPLE.id;

// Target + description catalog for the Stats page's OWN interior elements —
// same shape/reasoning as PICKER_PAGE_TARGETS above. A first draft covering
// only the "main sections" per instruction — not every filter/card gets its
// own step yet.
const STATS_PAGE_TARGETS = {
  groupFilter: {
    sel: '.stat-scope-groups .picker-group-pill',
    title: 'Group Filter',
    body: <>This will allow you to <b>filter the pickers row below by group</b>, which is extremely useful if you have created a lot of pickers. Feel free to select one now or click Next to advance to the next step.</>,
  },
  // All/Conditionals/Reminders/individual pickers all render as tabs in the
  // same row — one combined step rather than splitting them out, since
  // they're really one "what am I looking at" choice.
  pickersFilter: {
    sel: '.stat-scope-tabs .picker-tab',
    title: 'Pickers Filter',
    body: <>This will allow you to <b>narrow your selection to specific pickers or reminders</b>, or you can view everything all at once. Feel free to select one now or click Next to advance to the next step.</>,
  },
  // The pills specifically, not their .stat-filter-pills--seg container —
  // that container stretches to the FULL width of its row (.stat-filter-row's
  // own align-items: stretch), well past the pills' own content width, so
  // highlighting it left a big undimmed gap of empty background past the
  // last visible pill. Same fix as groupFilter's own sel, above.
  rangeFilter: {
    sel: '.stat-filter-pills--seg .stat-pill',
    title: 'Range Filter',
    body: <>This will allow you to further <b>narrow your selection by date range</b>, with ranges from 1 week to 1 year to all time. Feel free to select one now or click Next to advance to the next step.</>,
  },
  heatmap: {
    sel: '.stat-heatmap-card',
    title: 'Activity Heatmap',
    body: <>This visualizes your completed activity over time, with <b>each day shaded by how much you got done</b>. Click on any day for more details. Click Next when you are ready to advance to the next step.</>,
  },
  // Only rendered once a specific picker is the active scope — the PREVIOUS
  // step's own run() (below) selects one before this step ever mounts, same
  // "prepare what the NEXT step needs" timing used throughout this file.
  pickerBreakdown: {
    sel: '.stat-breakdown-card',
    title: 'Picker Breakdown',
    body: <>Once a specific picker is selected, its individual items are broken down here. You can <b>view things like pick count, pick frequency, last picked date</b> and others. This concludes the Stats page tutorial, click Done when you are ready to finish this tutorial.</>,
  },
};

// Target + description catalog for the Data page's OWN interior elements —
// same shape/reasoning as STATS_PAGE_TARGETS above. Also a first draft
// covering only the "main sections" per instruction; likely to grow more
// steps later (see this catalog's own comment header in the codebase).
// Group Filter / Pickers Filter are both disabled while their own step is
// up (tab-data.jsx's own disableGroupFilter/disablePickersFilter, same
// tourId+step gating pattern as tab-picker.jsx) — narrating what they do is
// the point, and changing statGroup/scope mid-tour would otherwise leave a
// LATER step's own target (e.g. Reminders, which only shows at scope 'all')
// unable to find anything, since nothing here resets it back afterward.
const DATA_PAGE_TARGETS = {
  groupFilter: {
    sel: '.stat-scope-groups .picker-group-pill',
    title: 'Group Filter',
    body: <>This will allow you to <b>filter the pickers row below by group</b>, which is extremely useful if you have created a lot of pickers. These buttons are disabled for this tutorial, so click Next when you are ready to advance to the next step.</>,
  },
  pickersFilter: {
    sel: '.stat-scope-tabs .picker-tab',
    title: 'Pickers Filter',
    body: <>This will allow you to <b>further narrow exactly what you want to view and edit</b>. These buttons are disabled for this tutorial, so click Next when you are ready to advance to the next step.</>,
  },
  remindersManager: {
    sel: '.cat--reminders',
    title: 'View and Edit Reminders',
    body: <>This is where you can <b>view and edit all of your reminders, as well as create new ones</b>. Feel free to explore this section yourself or click Next when you are ready to advance to the next step.</>,
  },
  // Targets .data-list, not an individual .cat section — scope stays 'all'
  // for the whole Data tour (nothing narrows it to one picker anymore, see
  // this catalog's own header comment), so every picker card renders here,
  // same as the Welcome Tour's own whole-list highlight on Today.
  pickersManager: {
    sel: '.data-list',
    title: 'View and Edit Pickers',
    body: <>This is where you can <b>view and edit all of your pickers, as well as their containing items</b>. You can also create new picker items. Feel free to explore this section yourself. This concludes the Data page tutorial, click Done when you are ready to finish this tutorial.</>,
  },
};

// Target + description catalog for the Settings page's OWN interior
// elements — same shape/reasoning as PICKER_PAGE_TARGETS above. One step
// per section, each a fixed-content reference blurb (no interaction to
// drive, unlike the Pickers tour) — every .set-section is always mounted
// (a scroll-spy sidebar, not a disclosure), so GuidedTour's own scroll-into-
// view handles reaching each one without any run() staging.
const SETTINGS_PAGE_TARGETS = {
  appearance: {
    sel: '.set-section--appearance',
    title: 'App Customization',
    body: <>This is where you can <b>customize the app's look and feel</b>: light, dark and custom theme colors, completion celebration animations, picker pick animations, and tab bar placement.</>,
  },
  daily: {
    sel: '.set-section--daily',
    title: 'Daily Generator',
    body: <>This is where you can <b>control the daily generator</b>: turn auto generation on or off, what time it runs, and enabling notifications for when it does.</>,
  },
  holidays: {
    sel: '.set-section--holidays',
    title: 'Holiday Controls',
    body: <>This is where you can <b>toggle which holiday observances that the pickers and reminders option uses</b>. You can even add your own custom holidays, like your birthday!</>,
  },
  data: {
    sel: '.set-section--data',
    title: 'Data Control',
    body: <>This is where you can protect your data from browser deletion, <b>install the app directly to your device</b>, back up your data (export), restore your data (import), or erase all of your data.</>,
  },
  about: {
    sel: '.set-section--about',
    title: 'About Ease My Life',
    body: <>This is where you can find information about this app and its developer, replay the welcome tour and all of these tutorials at any time, and <b>contact the developer if you have any problems or suggestions</b>.</>,
  },
  legal: {
    sel: '.set-section--legal',
    title: 'Legal Information',
    body: <>This is where you can <b>view the Privacy Policy and Terms of Service</b>. This concludes the Settings page tutorial, so go ahead and click Done when you are ready to finish this tutorial.</>,
  },
};

// Target + description catalog for the Today page's OWN interior elements
// (as opposed to OB_NAV_TARGETS, which only covers the nav bar buttons) —
// same shape/reasoning as that file's own catalog: content only (sel/title/
// body), no navigation fields, written to stand alone with no reference to
// "this tour" or "the next step" baked in. Kept here rather than moved into
// onboarding-targets.jsx for now (nothing outside this file reads it yet),
// but is exactly what a future on-demand multi-highlight help mode would
// pull from by id — see the onboarding-engine-reuse-design memory. Extract
// into its own module alongside OB_NAV_TARGETS if/when that help mode
// actually gets built and needs to reference these same targets.
const TODAY_PAGE_TARGETS = {
  progressRing: {
    sel: '.ring',
    title: 'Progress Ring',
    body: <>This <b>tracks your current progress of completed / total tasks for today’s todo list</b>. Once filled completely, your Day Streak will increase and the celebration animations will play.</>,
  },
  groupsNav: {
    // The <ul> specifically, not the whole .group-rail aside — on desktop
    // (a vertical sidebar) that aside also contains .rail-editmode's own
    // Edit Mode button below the group list, and highlighting the whole
    // container would spotlight that button right alongside the group
    // buttons this step is actually about, reading as if Edit Mode were
    // part of the list navigation. Mobile's .group-rail is a horizontal
    // pill row with Edit Mode surfaced separately in the footer instead, so
    // this scoping is a no-op difference there — same highlight either way.
    sel: '.group-rail ul',
    title: 'List Navigation',
    body: <>This is the todo list’s navigation, <b>allowing you to jump directly to a group’s section</b>. Over time your list can grow quite long and this helps to quickly move between the different sections of your todo list.</>,
  },
  // .em-rail-btn (sidebar, desktop) / .foot-editmode (footer, mobile) both
  // exist in the DOM at every width — a container query just toggles which
  // one is display:none — so this relies on findTargets' own zero-rect
  // filtering (see its comment) to resolve to whichever is actually visible.
  // Unlike the other two targets here, this body isn't a pure standalone
  // reference blurb — it bakes in the click instruction, since Edit Mode
  // (like Step 1's nav button) is taught by having the user click the real
  // control, not just described.
  editMode: {
    sel: '.em-rail-btn, .foot-editmode',
    title: 'Edit Mode',
    body: <>The "Edit Mode" button will allow you to both <b>rearrange the positions of the groups and items, as well as rename the groups</b>. Go ahead and click the "Edit Mode" button now.</>,
  },
  // Scoped to the Reminders section specifically (.rem-section, its own
  // distinguishing class — every OTHER group section shares plain
  // .group-section) since .group-grip itself isn't unique: one renders per
  // section once editMode is on (see reminders.jsx's ReminderSection and
  // tab-today.jsx's GroupHeader, which share this exact class/aria-label).
  groupGrip: {
    sel: '.rem-section .group-grip',
    title: 'Movable Icon',
    body: <>This will <b>allow you to move an entire group section to a different position in the todo list or move item positions within a group’s section</b>. Just click or press on it, hold it and move it up or down. You can try it yourself now. Click Next when you are ready to move on.</>,
  },
  // Reminders has no rename feature (its own header is a plain, non-
  // editable <h2> — see reminders.jsx), so this targets Page Tours instead:
  // it's rendered through the same GroupHeader component as a real picker
  // group (rename included), and — unlike any actual picker group — is
  // guaranteed to exist the moment this tour is reachable at all, since
  // both live under the same mini-tour checklist. A real picker group
  // (e.g. "Chores") would only exist once the user has already finished a
  // picker tutorial first, which this tour can't assume.
  renameGroup: {
    sel: '.pt-section .group-name-input',
    title: 'Rename Group',
    body: <>This will allow you to <b>change a group’s name</b>. You can go ahead and try it yourself, but once you exit this tutorial the changes will be reverted. You can still change them afterwards if you’d like. This concludes the Today page tutorial, click Done when you are ready.</>,
  },
};

// The Page Tours group's real name at the moment Step 5 (below) opens its
// rename input — captured off the rename button's own aria-label ("Rename
// group {name}") before it disappears behind the input. Lets a Back from
// Step 6 reset the input to a genuine no-op edit (draft === name) rather
// than an actual rename, without needing this module to otherwise know the
// live app state (PageTour itself is only ever passed `actions`, not
// `state`).
let lastPageToursName = 'Page Tours';

// Discards a typed rename WITHOUT exiting Edit Mode — used only for a Back
// to Step 5, which needs Edit Mode to stay on (Step 6's own Done doesn't
// need this at all; see its run() below for why). Resets the input's value
// back to its real name first so the blur that follows reads as a NO-OP
// commit (see tab-today.jsx's GroupHeader: commit() only calls
// onRenameGroup when draft differs from the name prop) instead of an actual
// rename. Deliberately NOT Escape: GroupHeader's own Escape handling is
// exactly this (see its cancel()), but a real Escape keydown also bubbles
// to tab-today.jsx's OWN global window listener, which exits Edit Mode
// entirely.
//
// The blur is deferred a frame — NOT a cosmetic choice. Dispatching the
// reset 'input' event calls React's onChange (setDraft) synchronously, but
// that only SCHEDULES the re-render; draft's actual value inside the
// ALREADY-DEFINED commit() closure doesn't update until React re-renders.
// Calling blur() in the same tick invokes that same (stale) commit() —
// reading the pre-reset, still-typed draft — and genuinely renames the
// group for real. This is not hypothetical: it's exactly how an earlier
// version of this function (calling blur() synchronously right after
// dispatch) shipped and broke — Done appeared to discard the rename but
// actually committed it, then Step 5's own run() on the next tour run
// could never find "Rename group Page Tours" again since the group's real
// name no longer matched.
const cancelRenameKeepEditMode = () => {
  const input = document.querySelector('.pt-section .group-name-input');
  if (!input) return;
  input.value = lastPageToursName;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  requestAnimationFrame(() => input.blur());
};

// Forces the real Page Tours name back — used wherever a click (Done, Back,
// Skip) might have blurred a still-open, typed-in rename input a tick
// earlier (see each call site's own comment for that race). Deferred a
// full 200ms, NOT just a frame: GroupHeader's own blur-triggered commit()
// doesn't call onRenameGroup synchronously either — it defers to its OWN
// setTimeout(…, 150) (the closing-animation delay in finishClose) — so
// calling this immediately would fire BEFORE that delayed commit and get
// overwritten right back to the typed value 150ms later. 200ms leaves a
// safety margin past it.
const forceRealPageToursName = (actions) => {
  setTimeout(() => actions.renamePageTours(lastPageToursName), 200);
};

// Steps beyond Step 1 (the nav-highlight every page tour shares), keyed by
// page tour id — empty/absent for any page that only has Step 1 so far.
// Advancing past the last step in here falls through GuidedTour's own "ran
// off the end" safety net into onSkip, same as every other mini-tour
// behaved before its own final Done step existed. A function of `actions`
// (built fresh per render, like buildPageTourStep1), not a static object —
// Step 6's own Done needs to call actions.renamePageTours directly (see its
// own comment below).
const buildPageTourSteps = (pageId, actions) => {
  if (pageId === 'explore_pickers') {
    return [
      { ...PICKER_PAGE_TARGETS.groupFilter, tab: 'picker', primary: 'Next', back: true },
      { ...PICKER_PAGE_TARGETS.pickerSelection, tab: 'picker', primary: 'Next', back: true },
      {
        ...PICKER_PAGE_TARGETS.createNewPickers, tab: 'picker', primary: 'Next', back: true,
      },
      {
        ...PICKER_PAGE_TARGETS.manualGeneration, tab: 'picker', primary: 'Next', back: true, requireClick: true,
        // .picker-run (stage + actions) can run taller than a short viewport
        // on its own, before Re-roll/Done even render alongside it — same
        // "pin the coach to the top and let the target run off the bottom"
        // reasoning as the Data tour's own tall .data-list step — see
        // coachAtTop's own doc comment in onboarding-tour-runner.jsx.
        // Confirmed live: without this, the coach overlapped the real Pick
        // one button on an iPhone SE-sized viewport.
        coachAtTop: true,
        // Pick one kicks off the multi-second spin animation — its result
        // (Step 6's own target) isn't ready the instant the click fires.
        // Stay on THIS step's own already-resolved coach/highlight for the
        // whole wait instead of advancing into a blank "not found yet" dim
        // — see advanceWhen's own doc comment in onboarding-tour-runner.jsx.
        // Polls for .pv-act--send specifically (Step 6's clickSel, NOT its
        // sel) — .picker-run itself (Step 6's sel) already exists the whole
        // time, spin animation included, so polling for that would advance
        // immediately instead of waiting for the pick to actually resolve.
        advanceWhen: PICKER_PAGE_TARGETS.addToTodoList.clickSel,
      },
      {
        ...PICKER_PAGE_TARGETS.addToTodoList, tab: 'picker', primary: 'Next', back: true, requireClick: true,
        // Same short-viewport reasoning as manualGeneration just above —
        // .picker-run is taller still here (Re-roll/Done now render
        // alongside the stage too).
        coachAtTop: true,
        // Send to Today swaps its own label to "Sent!" for 1500ms (see
        // sendToToday's own setTimeout in tab-picker.jsx) before reverting
        // — advancing immediately would cut that confirmation off before
        // the user ever sees it. 100ms past that own timer as a safety
        // margin. See advanceDelay's own doc comment in
        // onboarding-tour-runner.jsx for why this needs a fixed delay
        // rather than advanceWhen's target-polling (nothing new appears in
        // the DOM to poll for — the button reverts to what it already was).
        advanceDelay: 1600,
      },
      {
        ...PICKER_PAGE_TARGETS.pickerItems, tab: 'picker', primary: 'Next', back: true,
        // .pool-items grows with the picker's own item count and can run
        // WAY past a short viewport's height — same reasoning as
        // manualGeneration above, see coachAtTop's own doc comment in
        // onboarding-tour-runner.jsx.
        coachAtTop: true,
      },
      { ...PICKER_PAGE_TARGETS.addPickerItem, tab: 'picker', primary: 'Done', back: true },
    ];
  }
  if (pageId === 'explore_stats') {
    return [
      { ...STATS_PAGE_TARGETS.groupFilter, tab: 'stats', primary: 'Next', back: true },
      { ...STATS_PAGE_TARGETS.pickersFilter, tab: 'stats', primary: 'Next', back: true },
      { ...STATS_PAGE_TARGETS.rangeFilter, tab: 'stats', primary: 'Next', back: true },
      {
        ...STATS_PAGE_TARGETS.heatmap, tab: 'stats', primary: 'Next', back: true,
        // .stat-heatmap-card renders a full year's worth of cells and can
        // run FAR past a short viewport's height — same "pin the coach to
        // the top and let the target run off the bottom" reasoning as the
        // Data tour's own tall .data-list step (and this tour's own
        // pickerBreakdown step below) — see coachAtTop's own doc comment in
        // onboarding-tour-runner.jsx. Confirmed live: without this, the
        // coach overlapped the top of the heatmap on an iPhone SE-sized
        // viewport.
        coachAtTop: true,
        // Stages the picker-breakdown step's own target — that card only
        // renders once a specific picker is the active scope, so this
        // selects the real sample picker (unhidden for this whole tour, see
        // unhideSampleHistory) before that step ever mounts.
        run: () => {
          const btn = document.querySelector(`.stat-scope-tabs .picker-tab[data-picker-id="${STATS_TOUR_PRESELECT_PICKER_ID}"]`);
          if (btn) btn.click();
        },
      },
      {
        ...STATS_PAGE_TARGETS.pickerBreakdown, tab: 'stats', primary: 'Done', back: true,
        // .stat-breakdown-card lists every item in the picker's pool and can
        // run well past a short viewport's height, same as the heatmap step
        // just above — see coachAtTop's own doc comment in
        // onboarding-tour-runner.jsx. Confirmed live: without this, the
        // coach clipped the top of its own body text and overlapped the
        // card on an iPhone SE-sized viewport.
        coachAtTop: true,
        // `scope` (tab-stats.jsx's own local useState, choosing which picker
        // is active) is NOT persisted — a reload always lands back at 'all',
        // so this step's own target wouldn't exist to resume into even
        // though the real sample picker itself stays unhidden (a real,
        // persisted field) across the reload. Not resumable — see that
        // field's own doc comment in onboarding-tour-runner.jsx; a reload
        // mid this step falls back to the heatmap step, which is always
        // safe to land on and re-runs the selection on its own next Next
        // click.
        resumable: false,
      },
    ];
  }
  if (pageId === 'explore_data') {
    return [
      { ...DATA_PAGE_TARGETS.groupFilter, tab: 'data', primary: 'Next', back: true },
      { ...DATA_PAGE_TARGETS.pickersFilter, tab: 'data', primary: 'Next', back: true },
      { ...DATA_PAGE_TARGETS.remindersManager, tab: 'data', primary: 'Next', back: true },
      {
        ...DATA_PAGE_TARGETS.pickersManager, tab: 'data', primary: 'Done', back: true,
        // .data-list can be much taller than the viewport once every picker
        // card renders (6 real disposable copies plus whatever the user has
        // of their own) — the normal reserve-space padding would push the
        // target's own bottom edge further past the fold instead of
        // helping, exactly backwards. Pins the coach to the top and lets
        // the target run off the bottom instead — see coachAtTop's own doc
        // comment in onboarding-tour-runner.jsx.
        coachAtTop: true,
      },
    ];
  }
  if (pageId === 'explore_settings') {
    // coachAtTop on every section but Legal (short enough to fit normally)
    // — each of these can be taller than the viewport, same "pin the coach
    // to the top instead of padding the target past the fold" reasoning as
    // the Data tour's own tall .data-list step — see coachAtTop's own doc
    // comment in onboarding-tour-runner.jsx.
    return [
      { ...SETTINGS_PAGE_TARGETS.appearance, tab: 'settings', primary: 'Next', back: true, coachAtTop: true },
      { ...SETTINGS_PAGE_TARGETS.daily, tab: 'settings', primary: 'Next', back: true, coachAtTop: true },
      { ...SETTINGS_PAGE_TARGETS.holidays, tab: 'settings', primary: 'Next', back: true, coachAtTop: true },
      { ...SETTINGS_PAGE_TARGETS.data, tab: 'settings', primary: 'Next', back: true, coachAtTop: true },
      { ...SETTINGS_PAGE_TARGETS.about, tab: 'settings', primary: 'Next', back: true, coachAtTop: true },
      { ...SETTINGS_PAGE_TARGETS.legal, tab: 'settings', primary: 'Done', back: true },
    ];
  }
  if (pageId !== 'explore_today') return [];
  return [
    { ...TODAY_PAGE_TARGETS.progressRing, tab: 'today', primary: 'Next', back: true },
    { ...TODAY_PAGE_TARGETS.groupsNav, tab: 'today', primary: 'Next', back: true },
    { ...TODAY_PAGE_TARGETS.editMode, tab: 'today', primary: 'Next', back: true, requireClick: true },
    {
      ...TODAY_PAGE_TARGETS.groupGrip, tab: 'today', primary: 'Next', back: true,
      // Edit Mode is local, unpersisted UI state (tab-today.jsx's own
      // useState, not part of `state`) — a reload always lands back with it
      // off, so this step's target (only rendered while Edit Mode is on)
      // wouldn't exist to resume into. Not resumable — see that field's own
      // doc comment in onboarding-tour-runner.jsx; a reload mid this step or
      // Step 6 falls back to Step 4 (Edit Mode's own toggle), which is
      // always safe to land on.
      resumable: false,
      // Stages the next step's target: a real click into Page Tours' own
      // rename control (same real-UI-driving pattern used throughout the
      // Picker/Reminder tours), so its input already exists once Step 6
      // mounts. Fires on advancing OUT of this step, not into it — see
      // onPrimary's own comment in onboarding-tour-runner.jsx. Explicit
      // focus alongside the input's own autoFocus — belt-and-suspenders,
      // since the click driving it here is synthetic (this run(), not a
      // direct user click on the rename button itself). Deferred a frame
      // so it fires after the click's own re-render has actually mounted
      // the input.
      //
      // Found via .pt-section (see tab-today.jsx), not by matching the
      // aria-label's current name text — a user who's already renamed Page
      // Tours themselves, entirely outside any tour, would otherwise make
      // this selector (and the whole rest of the step) silently never
      // match again.
      run: () => {
        const btn = document.querySelector('.pt-section button.group-name--editable');
        if (btn) {
          lastPageToursName = (btn.getAttribute('aria-label') || '').replace(/^Rename group /, '') || 'Page Tours';
          btn.click();
        }
        requestAnimationFrame(() => {
          const input = document.querySelector('.pt-section .group-name-input');
          if (input) input.focus({ preventScroll: true });
        });
      },
    },
    {
      ...TODAY_PAGE_TARGETS.renameGroup, tab: 'today', primary: 'Done', back: true,
      // Same as Step 5's own resumable:false — this step's target depends on
      // BOTH Edit Mode being on AND Step 5's run() having already clicked
      // the rename button open, neither of which survives a reload.
      resumable: false,
      // Edit Mode's own real Cancel control discards any group reordering
      // from Step 5 AND closes the rename input — GroupHeader force-closes
      // `editing` the instant editMode itself goes false (see its own
      // effect), without ever going through the input's own commit().
      //
      // That's still not enough on its own, though: clicking this step's
      // Done button (a totally different element) blurs the currently-
      // focused rename input FIRST — as an intrinsic part of the click's
      // own focus-change handling, which happens before React's onClick
      // (and therefore this run()) ever fires — and that blur's own
      // commit() genuinely renames the group for real if the user typed
      // something, exactly like the earlier reset-and-blur race, just
      // triggered by a click on a DIFFERENT element instead of this step's
      // own code. There's no way to intercept that ordering from here, so
      // this doesn't try to — it just forces the real name back
      // afterward, directly, via the same action a real rename commit
      // would have called. A harmless no-op if nothing was ever typed.
      run: () => {
        const cancelBtn = document.querySelector('.editmode-banner-actions .btn--ghost');
        if (cancelBtn) cancelBtn.click();
        forceRealPageToursName(actions);
      },
    },
  ];
};

function PageTour({ pageId, state, actions, active, selectTab, onClose }) {
  const tour = OB_PAGE_TOURS.find((t) => t.id === pageId);
  const nav = OB_NAV_TARGETS[tour.page];
  const copy = PAGE_TOUR_COPY[pageId];
  // A reload lands here with tab-today.jsx's activeMiniTour already
  // re-derived from this SAME persisted activeTour (that's how this
  // component gets (re)mounted for this pageId at all) — re-reading it here
  // just decides whether to skip the intro modal and which (resumable) step
  // to land on. Same pattern as ReminderTour/PickerTour's own `resumable`.
  const ob = state.onboarding || {};
  const resumable = ob.activeTour && ob.activeTour.id === `page-${pageId}` ? ob.activeTour : null;
  const [phase, setPhase] = React.useState(resumable ? 'tour' : 'intro');

  const closeTour = (status) => {
    // Discard this tour's own disposable sample copies (see their own
    // comment) the moment it ends, however it ends — a harmless no-op if
    // Step 1's run() never got the chance to seed them. Stats instead
    // re-hides the REAL samples it borrowed (see unhideSampleHistory).
    if (usesSampleCopies(pageId)) clearPageTourPickers(actions);
    else if (pageId === 'explore_stats') hideSampleHistory(actions);
    if (pageId === 'explore_data') clearPageTourTasks(actions);
    actions.setChecklistItem(pageId, { status });
    onClose();
  };

  if (phase === 'intro') {
    return (
      <TutorialIntroModal
        icon={<Icon name={tour.page} size={54} />}
        title={(copy && copy.title) || nav.title}
        paragraphs={[(copy && copy.body) || nav.body]}
        pills={(copy && copy.pills) || ['page tour', tour.label.toLowerCase()]}
        onStart={() => setPhase('tour')}
        onSkip={() => closeTour('cancelled')}
      />
    );
  }

  return (
    <GuidedTour
      tourId={`page-${pageId}`}
      steps={[
        buildPageTourStep1(tour.page,
          pageId === 'explore_data' ? () => { seedPageTourPickers(state, actions); seedPageTourTasks(state, actions); } :
          usesSampleCopies(pageId) ? () => seedPageTourPickers(state, actions) :
          pageId === 'explore_stats' ? () => unhideSampleHistory(state, actions) :
          undefined,
          'Next',
          tour.label),
        ...buildPageTourSteps(pageId, actions),
      ]}
      resumeStep={resumable ? resumable.step : 0}
      actions={actions}
      active={active}
      selectTab={selectTab}
      // Edit Mode (Today's Step 4, index 3) is a one-way real-UI transition,
      // same class of problem as the Picker tour's own onGoBack: its target
      // (.foot-editmode on mobile) only exists in the DOM while editMode is
      // off, and the step's own real click (required to reach Step 5) flips
      // it on. Reverse it via the real toggle/Cancel control so a Back from
      // Step 5 finds Step 4's target again — .em-rail-btn (desktop) always
      // exists and toggles itself regardless of state; the mobile footer
      // swaps to Cancel/Done buttons instead of keeping .foot-editmode, so
      // Cancel (.btn--ghost) is the equivalent control there.
      onGoBack={(to) => {
        if (pageId === 'explore_pickers') {
          // Back from Step 4 (Create New Pickers) to Step 3 (Picker
          // Selection) — undoes Step 3's own run(), which scrolled
          // .picker-tabs horizontally to reveal the Add button. Left
          // scrolled, Step 3's own target (every OTHER tab in the row,
          // excluding Add) could include tabs now scrolled out of view on
          // the opposite side, stretching its highlight across the gap.
          if (to === 2) {
            const row = document.querySelector('.picker-tabs');
            if (row) row.scrollTo({ left: 0 });
          } else if (to === 3) {
            // Back from Step 5 (Manual Generation) to Step 4 (Create New
            // Pickers) — if a pick is still spinning (busy/phase 'running')
            // when Back is clicked, PickerView never unmounts between
            // steps, so that animation just keeps running in the
            // background regardless of which step the tour is on, and its
            // eventual onAnimDone still lands phase on 'done' whenever it
            // finishes — showing Send to Today/Re-roll/Done on Step 5 if
            // Next brings the user back to it before that settles on its
            // own. Same reset nonce Step 6→5's own case below uses, fired
            // here on the way OUT of Step 5 instead: PickerStrip only
            // renders while phase is 'running'/'done' (see PickerView's own
            // picker-stage JSX), so bumping this unmounts it immediately —
            // actually cancelling the in-flight animation outright, not
            // just leaving it to finish on its own and clean up after.
            // Harmless no-op if the pick had already settled by the time
            // Back was clicked.
            emlTour.set({ pickerTourResetNonce: (emlTour.get().pickerTourResetNonce || 0) + 1 });
          } else if (to === 4) {
            // Back from Step 6 (Add to Todo List) to Step 5 (Manual
            // Generation) — a pick already ran, so PickerView's own local
            // phase is still 'done'/'sent', showing Send to Today/Re-roll/
            // Done instead of Pick one. Step 5's own sel falls back to
            // .picker-run only once .pv-act--pick is gone (see
            // manualGeneration's own comment), which a leftover 'done'/
            // 'sent' phase satisfies just as well as a genuine spin in
            // progress would — so without this, those buttons being there
            // at all means the user can trigger them from a step that was
            // never written to expect it: Re-roll silently re-runs the pick
            // behind the scenes (advanceWhen just waits for it, reading as
            // a multi-second hang) and Done clears the result with no
            // re-run, so advanceWhen's poll never finds its target again
            // and the tour sits stuck forever. Resetting PickerView back to
            // its own idle state — via a bus nonce, since phase/result are
            // local state this module has no other way to reach — means
            // only Pick one ever shows here, matching what this step
            // actually expects and forecloses both failure modes by
            // construction instead of specifically patching either one.
            emlTour.set({ pickerTourResetNonce: (emlTour.get().pickerTourResetNonce || 0) + 1 });
          } else if (to === 5) {
            // Back from Step 7 (Picker Items) to Step 6 (Add to Todo List)
            // — Step 6's own target is .pv-act--send, which only exists
            // while phase is 'done'/'sent'. By the time this fires, Step
            // 6's own advanceDelay wait (see its own comment) has already
            // let phase run all the way through 'sent' and back to 'idle'
            // (Send to Today reverted to Pick one), so that target is gone
            // — the exact "different state than when Step 6 finished"
            // mismatch that made this crash. Unlike Step 5→4's reset
            // above, this can't just drop back to idle — Step 6 NEEDS a
            // real 'done' result to show Send to Today at all — so this
            // fires a SEPARATE bus nonce telling PickerView to synthesize
            // one directly (skipping the spin animation, since this is a
            // revisit, not the user's first time seeing it).
            emlTour.set({ pickerTourRedoNonce: (emlTour.get().pickerTourRedoNonce || 0) + 1 });
          }
          return;
        }
        if (pageId !== 'explore_today') return;
        if (to === 3) {
          const btn = document.querySelector('.em-rail-btn.is-on') || document.querySelector('.today-foot-actions .btn--ghost');
          if (btn) btn.click();
        } else if (to === 4) {
          // Back from Step 6 (Rename Group) to Step 5 — discards the
          // in-progress rename WITHOUT exiting Edit Mode (unlike Step 6's
          // own Done, which wants both) — see cancelRenameKeepEditMode's
          // own comment for why this can't just be an Escape keydown.
          cancelRenameKeepEditMode();
          // Same blur-races-the-click risk as Step 6's own Done (see its
          // run() comment) — clicking Back is ALSO a click on a different
          // element than the input, which can blur-and-commit a real
          // rename before onGoBack even runs. Same fix: force the real
          // name back directly afterward, regardless of what the DOM did.
          forceRealPageToursName(actions);
        }
      }}
      // Skip can fire from Step 4 or 5 too, mid-Edit-Mode — exits it via
      // the same real Cancel control (a harmless no-op if Edit Mode was
      // never entered, since the banner/button won't exist), reverting any
      // reorder from Step 5. If Step 6's rename input is specifically open,
      // also forces the real name back first — same blur-races-the-click
      // risk as Step 6's own Done (see its run() comment): clicking Skip
      // is ALSO a click on a different element than the input.
      onSkip={() => {
        if (document.querySelector('.pt-section .group-name-input')) {
          forceRealPageToursName(actions);
        }
        const cancelBtn = document.querySelector('.editmode-banner-actions .btn--ghost');
        if (cancelBtn) cancelBtn.click();
        closeTour('skipped');
      }}
      onFinish={() => closeTour('finished')}
    />
  );
}

export { PageTour, buildPageTourStep1 };
