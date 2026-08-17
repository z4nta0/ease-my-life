import React from 'react';
import { emlTour } from './eml-tour-bus.js';
import { Icon } from './ui.jsx';
import { TutorialIntroModal } from './onboarding-intro-modal.jsx';
import { GuidedTour } from './onboarding-tour-runner.jsx';
import { OB_NAV_TARGETS } from './onboarding-targets.jsx';
import { OB_EXAMPLE, OB_EXTRA_PICKERS } from './onboarding-seed-data.js';
import { MODES } from './seed.js';

// Every sample picker's own template data, keyed by id — this IS the exact
// shape NewPickerForm's `initial` prop expects (name/group/mode/items/step),
// and unlike the reminder samples, nothing seeds a picker with per-field
// overrides at tour time (see onboarding.jsx's seeding effect: pickers are
// added from these templates verbatim), so reading the static template here
// is safe — no live-vs-template divergence to worry about the way the
// reminder tours had to for daysOfWeek.
const PICKER_SAMPLES = Object.fromEntries(
  [OB_EXAMPLE, ...OB_EXTRA_PICKERS].map((p) => [p.id, p])
);

// Content for the picker mini-tours ("Set up a {picker name} picker"),
// launched by Play on each still-hidden sample picker's launcher card (see
// tab-today.jsx's startMiniTour, EntryCard's entry.kind === 'tutorial'
// branch). All of them share the same intro-modal structure and first
// paragraph — only the title (the picker's own name) and the second
// paragraph differ per picker. Keyed by the sample picker id (see
// onboarding-seed-data.js's OB_EXAMPLE/OB_EXTRA_PICKERS).
const PICKER_TOUR_BODY_1 = 'Pickers are where the magic happens. They have rules for when and how they should pick from its pool of items. There are 5 basic types of pickers: Truly Random, Weighted, Dynamic Weighted, Ease-up and Ease-down. Don’t worry too much about the details right now, as you start to use the app it will become more clear.';

// itemPrefill is the name Step 7's run() stages for the tour's own added
// item (see buildPickerTourStep7) — a new item distinct from anything
// already in that sample's own pool, themed to fit. body2/itemPrefill for
// every non-daily sample here is a first pass, not yet manually verified
// live the way Daily Chores' own tour was — expect touch-ups once each one
// gets its own dedicated pass.
const PICKER_TOUR_COPY = {
  pkr_ob_daily: {
    body2: 'This tutorial will guide you through creating a Daily Chores picker. This type of picker is an Ease-up and is perfect for something like chore tasks where you don’t want an item to be picked twice within, say, 1 week. e.g. once it picks "Do the laundry", you don’t want that task picked again for at least 1 week but also no later than 2 weeks. Let’s create one of these now.',
    itemPrefill: 'Mop the floors',
  },
  pkr_ob_monthly: {
    body2: 'This tutorial will guide you through creating a Monthly Chores picker. This type of picker is an Ease-up and is perfect for something like chore tasks where you don’t want an item to be picked twice within, say, 1 month. e.g. once it picks "Deep clean the oven", you don’t want that task picked again for at least 1 month but also no later than 2 months. Let’s create one of these now.',
    itemPrefill: 'Wash the windows',
    // Overrides the generic 7/14-day DEFAULT_EASE (tab-picker.jsx) for just
    // this tour's own added item — a monthly-cadence picker's own sample
    // item should look the part instead of a daily/weekly one. See Step 9's
    // own step9Tail override below for the matching copy change.
    itemSoonest: 31,
    itemLatest: 62,
    step9Body: <>This controls the <b>minimum number of days that a task item must wait before it becomes eligible to be picked again</b>. This is useful since most monthly chores do not usually need to be done again for at least a month or so.</>,
  },
  pkr_ob_coffee: {
    body2: 'This tutorial will guide you through creating a Coffee Creamer picker. This type of picker is a Dynamic Weighted and is perfect for randomly choosing something, while also making sure that every item is eventually picked and for prioritizing certain items over others. e.g. "Caramel" starts out more likely to be picked than "Cinnamon", but the longer "Cinnamon" goes unpicked the more its odds increase, until it’s eventually chosen and its odds reset. Let’s create one of these now.',
    itemPrefill: 'Peppermint Mocha',
  },
  pkr_ob_dinner: {
    body2: 'This tutorial will guide you through creating a Dinner picker. This type of picker is an Ease-up and is perfect for something like meals where you don’t want an item to be picked twice within, say, 1 week. e.g. once it picks "Spaghetti and meatballs", you don’t want that meal picked again for at least 1 week but also no later than 2 weeks. Let’s create one of these now.',
    itemPrefill: 'Grilled salmon',
    step8Body: <>This is the name of the meal item and is <b>what will show up in your todo list if it is picked</b>. We’ve already filled this out for you but feel free to customize it to whatever you’d prefer.</>,
    step9Body: <>This controls the <b>minimum number of days that a meal item must wait before it becomes eligible to be picked again</b>. This is useful since you do not usually want the same meal to be chosen again for at least a week or so.</>,
    step10Body: <>This controls the <b>maximum number of days that a meal item must wait before it should be picked again</b>. This is also useful since you usually want a meal to be picked again within a certain timeframe.</>,
  },
  pkr_ob_workouts: {
    body2: 'This tutorial will guide you through creating a Workouts picker. This type of picker is an Ease-up and is perfect for something like workouts where you don’t want a workout item to be picked twice within, say, a few days. e.g. once it picks "Chest", you don’t want that workout item picked again for at least 5 days but also no later than a week. Let’s create one of these now.',
    itemPrefill: 'Cardio',
    itemSoonest: 3,
    itemLatest: 6,
    step8Body: <>This is the name of the workout item and is <b>what will show up in your todo list if it is picked</b>. We’ve already filled this out for you but feel free to customize it to whatever you’d prefer.</>,
    step9Body: <>This controls the <b>minimum number of days that a workout item must wait before it becomes eligible to be picked again</b>. This is useful since you do not usually want the same workout to be chosen again for at least a few days or so.</>,
    step10Body: <>This controls the <b>maximum number of days that a workout item must wait before it should be picked again</b>. This is also useful since you usually want a workout to be picked again within a certain timeframe.</>,
  },
  pkr_ob_relax: {
    body2: 'This tutorial will guide you through creating a Relax picker. This type of picker is an Ease-down and is perfect for activities you want to stick with for a few days at a time instead of changing every day. e.g. once it picks "Read a book", that activity will stay as the picked item for at least 5 days but no more than a week before a new activity is chosen. Let’s create one of these now.',
    itemPrefill: 'Take a nap',
    itemSoonest: 3,
    itemLatest: 5,
    step8Body: <>This is the name of the activity item and is <b>what will show up in your todo list if it is picked</b>. We’ve already filled this out for you but feel free to customize it to whatever you’d prefer.</>,
    step9Body: <>This controls the <b>minimum number of days that an activity item will stay picked before it discharges</b> and another item is picked. This is useful since most activities you want to stick with for a few days at a time instead of changing every day.</>,
    step10Body: <>This controls the <b>maximum number of days that an activity item will stay picked before it discharges</b> and another item is picked. This is also useful since most activities you don’t want to stay picked past a certain timeframe.</>,
  },
};

// Step 1 is identical for every picker tutorial — just the Pickers nav
// button itself, requireClick so Next stays disabled and the user has to
// actually click the real icon to advance. Body copy is kept in sync with
// the Pickers page tour's own Step 1 (OB_NAV_TARGETS.picker + its
// buildPageTourStep1 suffix) by explicit request — the step still has to
// stay on Today (tab: 'today') rather than pre-navigating, so there's
// something left for the user's own click to do; only the copy is shared,
// not the step object.
const PICKER_TOUR_STEP_1 = {
  sel: '[data-tab="picker"]', tab: 'today',
  title: 'The Pickers page',
  body: <>Pickers are the heart of the app and this is <b>where you can create new pickers and their items</b>. You can also manually run any picker to generate a task. Go ahead and click the "Pickers" page's button now.</>,
  primary: 'Next', back: false, requireClick: true,
};

// Lands at the top of the Pickers page (scrollToTop) and highlights the real
// "+ Add new picker" tab — requireClick again, same teaching-the-real-
// interface pattern as the Reminders tours' "+" step. run() publishes the
// sample's data as the emlTour bus's prefill, timed so the real click (which
// natively opens the form via the button's own onClick, not this run()) ends
// up mounting NewPickerForm with it already applied — see the long comment
// on PickerTour below for why this specific ordering matters.
const buildPickerTourStep2 = (pickerId, state) => ({
  sel: '.picker-tab--add', tab: 'picker', scrollToTop: true,
  // The tab strip only ever has one or two real tabs during first-time
  // onboarding (each picker's own sample stays hidden until its own mini-
  // tour finishes), so "+Add" was always already in view there. Replaying
  // this tour, though, every REAL picker from a prior completion (this
  // tour's own, or an earlier one's) is already a real, visible tab — by
  // the 4th/5th/6th one, the strip overflows and "+Add" sits off the end,
  // fully obscured, with no horizontal-scroll handling anywhere to reveal
  // it (bring()'s own vertical-only scroll math left it wherever it
  // happened to sit) — a genuinely broken step, nothing left to click.
  // See revealHorizontally's own doc comment in onboarding-tour-runner.jsx.
  revealHorizontally: true,
  title: 'Create a new picker',
  body: <>This button will <b>open up the form</b> for creating a new picker. Go ahead and click it now.</>,
  primary: 'Next', back: true, requireClick: true,
  // suppressAutoOpen: tab-picker.jsx's dormant effect (`if (tour.prefill &&
  // !creating)`) is meant to stay silent for this tour — see the long
  // comment on PickerTour below — but its `!creating` check reads a value
  // from a DIFFERENT, earlier render than the one that eventually sets
  // `creating` true (this bus update flows through a plain subscriber
  // callback, outside the click's own React batch, so it commits before the
  // real button's native handler does). Without this flag the dormant
  // effect fires first, flips openedByTour to true, and Step 12's onCreate
  // then treats the picker as a dedup-and-skip revisit instead of actually
  // creating it.
  //
  // existingPickerId/createdFromSample: if this sample tour has already been
  // finished once before, there's a real picker out there tagged with
  // createdFromSample === pickerId (see store.jsx's addPicker) — publishing
  // its id here lets tab-picker.jsx's onCreate UPDATE that same picker in
  // place (via addPicker's replaceId) instead of creating a brand-new,
  // name-colliding duplicate. createdFromSample is republished regardless
  // (even on a genuine first run) so THIS run's picker is tagged for any
  // future replay to find.
  run: () => {
    const existing = state.pickers.find((p) => p.createdFromSample === pickerId);
    emlTour.set({
      prefill: PICKER_SAMPLES[pickerId], suppressAutoOpen: true,
      existingPickerId: existing ? existing.id : null,
      createdFromSample: pickerId,
    });
  },
});

// Highlights the Name field's whole group (label + description + input) as
// one region — the first .np-field in the Details step, which is what's
// showing once Step 2's click opens the form (initial.step === 1 in the
// sample template keeps it on Details rather than jumping to Items).
// resumable:false — this and every step through Step 12 only has a target
// because the create-picker form is open, which a reload doesn't survive
// (see resumable's own doc comment in onboarding-tour-runner.jsx); Steps
// 1-2 stay resumable since neither depends on the form already being open.
const PICKER_TOUR_STEP_3 = {
  sel: '.np-fields .np-field:first-child', tab: 'picker',
  title: 'Give it a name',
  body: <>This is the <b>name of the picker</b> and should be descriptive of the types of tasks contained in its pool of items. We’ve already filled this out for you but feel free to customize it to whatever you’d prefer.</>,
  primary: 'Next', back: true, resumable: false,
};

// Highlights the Group field's whole group (label + description + chips) as
// one region — the second .np-field in the Details step, right after Name.
const PICKER_TOUR_STEP_4 = {
  sel: '.np-fields .np-field:nth-child(2)', tab: 'picker',
  title: 'Attach to a group',
  body: <>This is the group that the picker will be attached to and <b>controls how pickers are organized on the Today page</b>. You can either select an existing group or create a new one. We’ve already filled this out for you but feel free to customize it to whatever you’d prefer.</>,
  primary: 'Next', back: true, resumable: false,
};

// Highlights ONLY the sample's own mode option — .mode-opt[data-mode="..."]
// (the data-mode attribute exists purely for this) — rather than the whole
// .mode-radio list. Deliberately narrow: the click-guard blocks clicks
// outside a step's target for non-requireClick steps too, so scoping to
// just this one mode also prevents switching to a different type here,
// which would break the mode-specific copy/targets later steps assume
// (Soonest/Latest wording, the Fill row, etc. are all Ease-mode-specific —
// see the isEase check that conditionally includes Steps 9/10 below).
// coachAtTop: a single mode option (label + description) can be tall enough
// on its own to rival a short mobile viewport's whole height — the ease
// modes' 2-paragraph descriptions are the longest of the 5. Not every
// sample's selected mode is long enough to actually need this, but there's
// no real cost to always requesting it (see the flag's own doc comment in
// onboarding-tour-runner.jsx), so it's set unconditionally here rather than
// only for the samples currently known to need it.
const buildPickerTourStep5 = (pickerId) => ({
  sel: `.np-fields .mode-opt[data-mode="${PICKER_SAMPLES[pickerId].mode}"]`, tab: 'picker',
  title: 'Select a picker type',
  body: <>These are the different types of pickers. They are the <b>main control for how pickers work</b> and each type has its own pros and cons. We have already selected the appropriate type for you, so you can go ahead and click Next whenever you are ready.</>,
  primary: 'Next', back: true, resumable: false, coachAtTop: true,
});

// Highlights the "Add items" button that advances the form from its Details
// sub-step to its Items sub-step — .ob-picker-next, a class name left over
// from the original stashed create-a-picker tour design, reused here as-is
// since it already targets exactly this button. scrollToBottom since it's
// always the last thing in the Details footer regardless of how the form
// got here — reached going forward (scrolled down from filling out fields)
// or Back from Step 7 (the form just switched back from its Items sub-step,
// a completely different shape, so whatever scroll position carried over
// means nothing).
const PICKER_TOUR_STEP_6 = {
  sel: '.ob-picker-next', tab: 'picker', scrollToBottom: true,
  title: 'Add items to this picker',
  body: <>The picker options are all done, you just need to <b>add some task items for the picker to choose from</b>. Go ahead and click this button now.</>,
  primary: 'Next', back: true, requireClick: true, resumable: false,
  // The click this run() accompanies swaps the form from Details to its own
  // (much shorter) Items sub-step IN PLACE, within the same scrollable
  // container — not a real navigation, so bring() never gets a chance to
  // animate anything: the instant the shorter content mounts, the browser
  // auto-clamps the still-scrolled-to-the-bottom-of-the-old-content scroll
  // position down to whatever's now valid, synchronously and completely
  // unanimatably, before Step 7's own tour effect ever runs (confirmed live
  // — .main.scrollTop dropped from ~2960 to ~1060 within 50ms of the click,
  // with zero scroll calls of ours in between). By the time Step 7's own
  // bring() checks, the "+ Add item" target is usually already sitting
  // wherever that clamp landed, so no scroll fires and the whole transition
  // reads as an unexplained jump instead of the tour visibly navigating
  // there. Resetting to the top HERE — before the native click's own
  // handler swaps the content — sidesteps the clamp entirely (0 is always a
  // valid scroll position, whatever the new content's height turns out to
  // be) and leaves a real gap for Step 7's own bring() to smoothly scroll
  // across instead. Instant, not smooth: this reset needs to be invisible
  // (same frame as the click, before the old content is even gone) — an
  // animated scroll here would show as its own, separate upward motion
  // before the content swap, on top of Step 7's own real one after it.
  run: () => {
    const main = document.querySelector('.main');
    if (main) main.scrollTop = 0;
  },
};

// Highlights the "+ Add item" button on the now-showing Items sub-step
// (reached via Step 6's click) — .pv-additem-btn. run() stages the item's
// name (and, if this sample overrides them, its Soonest/Latest days too —
// see pkr_ob_monthly's itemSoonest/itemLatest) on the bus (same timing trick
// as Step 2's picker-level prefill — fires in the click-guard's capture
// phase, same batch as addNewDraft's own bubble-phase handler) so the draft
// item addNewDraft creates matches this sample's own cadence instead of the
// generic "New item" / 7-14 day defaults.
const buildPickerTourStep7 = (pickerId) => ({
  sel: '.pv-additem-btn', tab: 'picker',
  title: 'Add a task to the picker’s pool',
  body: <>Pickers need a <b>pool of tasks to choose from</b> when it is run, whether manually or via the auto generation feature. Go ahead and click this button now.</>,
  primary: 'Next', back: true, requireClick: true, resumable: false,
  run: () => {
    const copy = PICKER_TOUR_COPY[pickerId];
    emlTour.set({
      itemPrefill: copy.itemPrefill,
      // 100/days is the same days↔drift conversion tab-picker.jsx's own
      // driftToSoonest/daysToDrift use — kept in sync manually since those
      // aren't exported (see addNewDraft's read side in tab-picker.jsx).
      itemEaseMax: copy.itemSoonest ? 100 / copy.itemSoonest : null,
      itemEaseMin: copy.itemLatest ? 100 / copy.itemLatest : null,
    });
  },
});

// Default bodies for Steps 8/9/10 — used whenever PICKER_TOUR_COPY[pickerId]
// doesn't set its own step8Body/step9Body/step10Body override (e.g. Dinner's
// "meal item" wording). Kept as named constants rather than inlined so the
// per-picker fallback (`copy.stepNBody || DEFAULT_STEPN_BODY`) reads clearly.
const DEFAULT_STEP8_BODY = <>This is the name of the task item and is <b>what will show up in your todo list if it is picked</b>. We’ve already filled this out for you but feel free to customize it to whatever you’d prefer.</>;
const DEFAULT_STEP9_BODY = <>This controls the <b>minimum number of days that a task item must wait before it becomes eligible to be picked again</b>. This is useful since most chores do not usually need to be done again for at least a week or so.</>;
const DEFAULT_STEP10_BODY = <>This controls the <b>maximum number of days that a task item must wait before it should be picked again</b>. This is also useful since most chores need to be done again within a certain timeframe.</>;

// Highlights the item name input inside the inline editor Step 7's click
// just opened — .rd-name-input, scoped under .pv-additem-wrap since the same
// class is reused (mutually exclusively at render time) by the existing-
// picker "add item" flow elsewhere on this tab.
const buildPickerTourStep8 = (pickerId) => ({
  sel: '.pv-additem-wrap .rd-name-input', tab: 'picker',
  title: 'Give it a name',
  body: PICKER_TOUR_COPY[pickerId].step8Body || DEFAULT_STEP8_BODY,
  primary: 'Next', back: true, resumable: false,
});

// Highlights the Soonest/Shortest row — the first .pie-row in the editor's
// isEase branch. Only meaningful for Ease-up/Ease-down samples (the row
// doesn't exist at all for Weighted/Dynamic/Random modes, where this same
// .pie-row position is a Weight stepper instead) — PickerTour only includes
// this step when the sample's own mode is one of the ease modes. The whole
// body is per-picker (PICKER_TOUR_COPY[pickerId].step9Body), defaulting to
// the original Ease-up/"task item"/"week" wording — Daily Chores is the
// only sample this has been manually verified against so far; Ease-down
// samples (Relax) reuse the default as a first pass, not yet touched up for
// the "Shortest" label or ease-down's reversed stays-picked-until-
// discharged semantics. No new one-way DOM transition happens between Step
// 8 and here (the editor stays open the whole time), so no onGoBack
// handling is needed.
const buildPickerTourStep9 = (pickerId) => ({
  sel: '.pv-additem-wrap .pie-row:first-child', tab: 'picker',
  title: 'Set a timeout',
  body: PICKER_TOUR_COPY[pickerId].step9Body || DEFAULT_STEP9_BODY,
  primary: 'Next', back: true, resumable: false,
});

// Highlights the Latest/Longest row — the second .pie-row in the editor's
// isEase branch, right after Soonest/Shortest. Same mode gating, Ease-down
// caveat, and per-picker step10Body override as Step 9 above. Same
// reasoning as Step 9: the editor stays open, so no new DOM transition to
// revert on Back.
const buildPickerTourStep10 = (pickerId) => ({
  sel: '.pv-additem-wrap .pie-row:nth-child(2)', tab: 'picker',
  title: 'Set a maximum wait',
  body: PICKER_TOUR_COPY[pickerId].step10Body || DEFAULT_STEP10_BODY,
  primary: 'Next', back: true, resumable: false,
});

// Highlights the Weight stepper row — the first .pie-row in the editor's
// usesWeight branch (Weighted/Dynamic modes only; mutually exclusive with
// the isEase branch above, so reusing the same :first-child position is
// safe — only one of the two ever renders for a given picker). PickerTour
// only includes this step when the sample's own mode is Weighted or
// Dynamic. No new one-way DOM transition happens between Step 8 and here
// (the editor stays open the whole time), so no onGoBack handling is
// needed — same reasoning as the isEase steps above.
const PICKER_TOUR_STEP_WEIGHT = {
  sel: '.pv-additem-wrap .pie-row:first-child', tab: 'picker',
  title: 'Give it a weight',
  body: <>The Weight control allows you to <b>prioritize some items over others</b>. e.g. an item with a weight of 2 is twice as likely to be picked as an item with a weight of 1. That way the pick is still random while allowing you some control over how it works.</>,
  primary: 'Next', back: true, resumable: false,
};

// Highlights the Boost row — the second .pie-row, right after Weight, in
// the editor's isDynamic-only branch (Dynamic mode specifically; unlike
// Weight, Weighted-mode pickers don't get this row at all). Not
// interactive (there's no requireClick — the BoostReset control only ever
// does something once an item has actually accrued a boost, never true for
// a freshly-created item), just narration, since this value is the core
// mechanic of how Dynamic Weighted differs from plain Weighted.
const PICKER_TOUR_STEP_BOOST = {
  sel: '.pv-additem-wrap .pie-row:nth-child(2)', tab: 'picker',
  title: 'Boost value',
  body: <>This is the <b>crucial piece of a Dynamic Weighted picker</b>. Every time an item does not get picked this value will increase, making it more and more likely to be picked. Then when it does get picked this value will reset, making it much less likely to be picked. Nothing to adjust here, click Next whenever you are ready.</>,
  primary: 'Next', back: true, resumable: false,
};

// Highlights the item editor's Save button — .ob-item-save (tagged
// alongside .ob-item-cancel, see EntryEditor in tab-today.jsx). requireClick
// since this closes the editor for good, same real-interface-teaching
// pattern as Steps 2/6/7.
const PICKER_TOUR_STEP_11 = {
  sel: '.ob-item-save', tab: 'picker',
  title: 'Save this task item',
  body: <>This task item is now complete and can be <b>saved to this picker’s pool</b>. Go ahead and click this button now.</>,
  primary: 'Next', back: true, requireClick: true, resumable: false,
};

// Highlights the form's real "Create picker" button — .ob-picker-create
// (see tab-picker.jsx's np-footer). requireClick + primary:'Done': this is
// the ONE step where the real target's native click handler (submit, which
// actually calls actions.addPicker) has to survive finish()'s own side
// effects (selectTab away from Pickers, unmounting this whole tour) —
// GuidedTour's onPrimary defers the 'Done'/advance half of a requireClick
// click by a tick for exactly this reason (see its own comment), so submit()
// still fires normally in the click's native bubble phase before finish()
// tears anything down.
const PICKER_TOUR_STEP_12 = {
  sel: '.ob-picker-create', tab: 'picker',
  title: 'Create this picker',
  body: <>You’re all set! You’ve created this picker and its pool of task items. All that’s left is to <b>click the Create picker button</b>. Go ahead and click it now.</>,
  primary: 'Done', back: true, requireClick: true, resumable: false,
};

// Why Step 2's run() (not, say, Step 1's, or PickerTour's onStart) is where
// prefill gets published: tab-picker.jsx has its own dormant effect from the
// original (stashed) create-a-picker tour design — `if (tour.prefill &&
// !creating) { setCreating(true); setOpenedByTour(true); }` — that
// auto-opens the form the instant prefill appears. Publishing any earlier
// (tour start, or even Step 1) would trigger that the moment TabPicker
// mounts, skipping Step 2 entirely (the form would already be open before
// the user ever sees "+ Add new picker" highlighted). run() fires in the
// click-guard's CAPTURE-phase handling of the same click whose native
// bubble-phase handler is the button's own `onClick={() => setCreating(true)}`
// — that ordering (not, as an earlier version of this comment assumed, both
// landing in one React batch — they don't: the bus's plain-JS subscriber
// callback commits its own render before the native handler's does) is
// exactly why run() also sets `suppressAutoOpen: true` — without it, the
// dormant effect would see `creating` still false on its own earlier render
// and wrongly claim credit, flipping openedByTour to true (this tour walks
// Details normally via a real click, unlike the OTHER prefill entry point
// that comment block still documents, which SHOULD trigger that effect).
//
// `pickerId` is the sample picker's id. Mounted at the app level (see
// app.jsx's activePickerTour), not inside TabToday like ReminderTour —
// Step 1 navigates to the Pickers tab, which would unmount TabToday (and
// this along with it) if it lived there instead. active/selectTab are the
// real app-wide ones as a result, not stubs.
function PickerTour({ pickerId, state, actions, active, selectTab, onClose }) {
  const picker = (state.pickers || []).find((p) => p.id === pickerId);
  const copy = PICKER_TOUR_COPY[pickerId];
  const modeLabel = ((MODES[picker.mode] || {}).label || picker.mode).toLowerCase();

  // A reload lands here with app.jsx already having re-derived activePickerTour
  // from the SAME persisted activeTour (that's how this component gets
  // (re)mounted for pickerId at all) — re-reading it here just decides
  // whether to skip the intro modal and which (resumable) step to land on.
  const ob = state.onboarding || {};
  const resumable = ob.activeTour && ob.activeTour.id === `picker-${pickerId}` ? ob.activeTour : null;
  const [phase, setPhase] = React.useState(resumable ? 'tour' : 'intro');

  const closeTour = (status) => {
    // Clear both bus fields regardless of exit path (cancelled/skipped/
    // finished) — tab-picker.jsx's dormant auto-open effect keys off
    // tour.prefill's mere presence (`if (tour.prefill && !creating)`), so a
    // leftover value from THIS tour would silently reopen the create form
    // with stale sample data the next time TabPicker mounts (e.g. just
    // revisiting the Pickers tab), same class of bug the Reminders tours'
    // closeTour already guards against.
    emlTour.set({
      prefill: null, itemPrefill: null, itemEaseMin: null, itemEaseMax: null,
      suppressAutoOpen: false, existingPickerId: null, createdFromSample: null,
    });
    actions.setChecklistItem(pickerId, { status });
    onClose();
  };

  if (phase === 'intro') {
    return (
      <TutorialIntroModal
        icon={<Icon name="picker" size={54} />}
        title={`${picker.name} Picker`}
        paragraphs={[PICKER_TOUR_BODY_1, copy.body2]}
        pills={['pickers', modeLabel, (picker.group || '').toLowerCase()]}
        onStart={() => setPhase('tour')}
        // Mirrors the launcher card's own X button exactly — marks the card
        // cancelled without touching the underlying sample picker.
        onSkip={() => closeTour('cancelled')}
      />
    );
  }

  // Steps 9/10 (Soonest/Latest) only apply to Ease-up/Ease-down samples —
  // every other mode's item editor doesn't have those rows at all (see the
  // steps' own comments), so including them there would highlight nothing
  // and trip the not-found watchdog. The Weight step is the mirror image:
  // only Weighted/Dynamic samples get it. The Boost step is narrower still
  // — only Dynamic samples (not plain Weighted) get that row at all.
  const isEase = picker.mode === 'ease-up' || picker.mode === 'ease-down';
  const usesWeight = picker.mode === 'weighted' || picker.mode === 'dynamic';
  const isDynamic = picker.mode === 'dynamic';
  const steps = [
    PICKER_TOUR_STEP_1, buildPickerTourStep2(pickerId, state), PICKER_TOUR_STEP_3, PICKER_TOUR_STEP_4,
    buildPickerTourStep5(pickerId), PICKER_TOUR_STEP_6, buildPickerTourStep7(pickerId), buildPickerTourStep8(pickerId),
    ...(isEase ? [buildPickerTourStep9(pickerId), buildPickerTourStep10(pickerId)] : []),
    ...(usesWeight ? [PICKER_TOUR_STEP_WEIGHT] : []),
    ...(isDynamic ? [PICKER_TOUR_STEP_BOOST] : []),
    PICKER_TOUR_STEP_11, PICKER_TOUR_STEP_12,
  ];

  return (
    <GuidedTour
      tourId={`picker-${pickerId}`}
      steps={steps}
      resumeStep={resumable ? resumable.step : 0}
      actions={actions}
      active={active}
      selectTab={selectTab}
      // Back from Step 7 (index 6, the Items sub-step's "+ Add item"
      // button) to Step 6 (index 5, "Add items") needs the form pushed back
      // to its Details sub-step first — unlike the Reminders tours' "+"
      // button, .ob-picker-next's click is a one-way step change inside
      // NewPickerForm, not a toggle, so without this Step 6's own target
      // stays gone (the form is still showing Items) and the tour has
      // nothing to highlight. .ob-picker-details is the form's own "Details"
      // step-indicator tab — clicking it is the only way to reverse this
      // from outside the form, which owns that step state locally.
      onGoBack={(to) => {
        if (to === 5) {
          const detailsTab = document.querySelector('.ob-picker-details');
          if (detailsTab) detailsTab.click();
        } else if (to === 6) {
          // Step 7→8's click opened the inline item editor, which is also a
          // one-way transition (no toggle) — Cancel is the only real-DOM way
          // to close it back to the bare .pv-additem-btn from outside, same
          // reasoning as the to===5 branch above.
          const cancelBtn = document.querySelector('.ob-item-cancel');
          if (cancelBtn) cancelBtn.click();
        }
      }}
      // Skip (or the not-found watchdog) reads as "the user didn't finish",
      // distinct both from the intro modal's 'cancelled' and from Step 12's
      // genuine 'finished' via onFinish below. See onboarding-checklist.js's
      // status comment.
      onSkip={() => closeTour('skipped')}
      onFinish={() => closeTour('finished')}
    />
  );
}

export { PickerTour };
