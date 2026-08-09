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

// TODO: body2 for the other 5 sample pickers (pkr_ob_monthly, pkr_ob_coffee,
// pkr_ob_dinner, pkr_ob_workouts, pkr_ob_relax) hasn't been written yet.
const PICKER_TOUR_COPY = {
  pkr_ob_daily: {
    body2: 'This tutorial will guide you through creating a Daily Chores picker. This type of picker is an Ease-up and is perfect for something like chore tasks where you don’t want an item to be picked twice within, say, 1 week. e.g. once it picks "Do the laundry", you don’t want that task picked again for at least 1 week but also no later than 2 weeks. Let’s create one of these now.',
  },
};

// Step 1 is identical for every picker tutorial — just the Pickers nav
// button itself, requireClick so Next stays disabled and the user has to
// actually click the real icon to advance. Deliberately NOT the Welcome
// Tour's OB_NAV_TARGETS.picker content (which describes the page you've
// already arrived at) — the point here is teaching icon-only nav on mobile,
// so the copy has to instruct the click, and the step has to stay on Today
// (tab: 'today') rather than pre-navigating, so there's something left for
// the user's own click to do.
const PICKER_TOUR_STEP_1 = {
  sel: '[data-tab="picker"]', tab: 'today',
  title: 'The Pickers page',
  body: <>Pickers are the <b>heart of the app</b> and this is where you can create new pickers and their items. You can also manually run any picker to generate a task. Go ahead and click it now.</>,
  primary: 'Next', back: false, requireClick: true,
};

// Lands at the top of the Pickers page (scrollToTop) and highlights the real
// "+ Add new picker" tab — requireClick again, same teaching-the-real-
// interface pattern as the Reminders tours' "+" step. run() publishes the
// sample's data as the emlTour bus's prefill, timed so the real click (which
// natively opens the form via the button's own onClick, not this run()) ends
// up mounting NewPickerForm with it already applied — see the long comment
// on PickerTour below for why this specific ordering matters.
const buildPickerTourStep2 = (pickerId) => ({
  sel: '.picker-tab--add', tab: 'picker', scrollToTop: true,
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
  // effect fires first, flips openedByTour to true, and Step 13's onCreate
  // then treats the picker as a dedup-and-skip revisit instead of actually
  // creating it.
  run: () => { emlTour.set({ prefill: PICKER_SAMPLES[pickerId], suppressAutoOpen: true }); },
});

// Highlights the Name field's whole group (label + description + input) as
// one region — the first .np-field in the Details step, which is what's
// showing once Step 2's click opens the form (initial.step === 1 in the
// sample template keeps it on Details rather than jumping to Items).
const PICKER_TOUR_STEP_3 = {
  sel: '.np-fields .np-field:first-child', tab: 'picker',
  title: 'Give it a name',
  body: <>This is the <b>name of the picker</b> and should be descriptive of the types of tasks contained in its pool of items. We’ve already filled this out for you but feel free to customize it to whatever you’d prefer.</>,
  primary: 'Next', back: true,
};

// Highlights the Group field's whole group (label + description + chips) as
// one region — the second .np-field in the Details step, right after Name.
const PICKER_TOUR_STEP_4 = {
  sel: '.np-fields .np-field:nth-child(2)', tab: 'picker',
  title: 'Attach to a group',
  body: <>This is the group that the picker will be attached to and <b>controls how pickers are organized on the Today page</b>. You can either select an existing group or create a new one. We’ve already filled this out for you but feel free to customize it to whatever you’d prefer.</>,
  primary: 'Next', back: true,
};

// Highlights ONLY the Ease-up option — .mode-opt[data-mode="ease-up"] (the
// data-mode attribute exists purely for this) — rather than the whole
// .mode-radio list. Deliberately narrow: the click-guard blocks clicks
// outside a step's target for non-requireClick steps too, so scoping to
// just Ease-up also prevents switching to a different type here, which
// would break the mode-specific copy/targets several later steps assume
// (Soonest/Latest wording, the Fill row, etc. are all Ease-up-specific).
const PICKER_TOUR_STEP_5 = {
  sel: '.np-fields .mode-opt[data-mode="ease-up"]', tab: 'picker',
  title: 'Select a picker type',
  body: <>These are the different types of pickers. They are the <b>main control for how pickers work</b> and each type has its own pros and cons. We have already selected the appropriate type for you, so you can go ahead and click Next whenever you are ready.</>,
  primary: 'Next', back: true,
};

// Highlights the whole "Include in the Daily generator" field — .np-daily-
// group, which contains both the toggle and (while it's on, which it is for
// every sample picker) the "Which days?" weekday chips beneath it — as one
// region.
const PICKER_TOUR_STEP_6 = {
  sel: '.np-fields .np-daily-group', tab: 'picker',
  title: 'When the picker should run',
  body: <>This controls whether the picker should be <b>included when the app runs its daily generator</b>. There are also controls for <b>which days of the week it should be included</b>, because you may not want something like chores to show up in your todo list on the weekend. Feel free to customize it to whatever you prefer or click the Next button to advance to the next step.</>,
  primary: 'Next', back: true,
};

// Highlights the "Add items" button that advances the form from its Details
// sub-step to its Items sub-step — .ob-picker-next, a class name left over
// from the original stashed create-a-picker tour design, reused here as-is
// since it already targets exactly this button. scrollToBottom since it's
// always the last thing in the Details footer regardless of how the form
// got here — reached going forward (scrolled down from filling out fields)
// or Back from Step 8 (the form just switched back from its Items sub-step,
// a completely different shape, so whatever scroll position carried over
// means nothing).
const PICKER_TOUR_STEP_7 = {
  sel: '.ob-picker-next', tab: 'picker', scrollToBottom: true,
  title: 'Add item to this picker',
  body: <>The picker options are all done, you just need to <b>add some items for the picker to choose from</b>. Go ahead and click this button now.</>,
  primary: 'Next', back: true, requireClick: true,
};

// Highlights the "+ Add item" button on the now-showing Items sub-step
// (reached via Step 7's click) — .pv-additem-btn. run() stages the item's
// name on the bus (same timing trick as Step 2's picker-level prefill —
// fires in the click-guard's capture phase, same batch as addNewDraft's own
// bubble-phase handler) so the draft item addNewDraft creates is named
// "Mop the floors" instead of the generic "New item" default.
const PICKER_TOUR_STEP_8 = {
  sel: '.pv-additem-btn', tab: 'picker',
  title: 'Add a task to the picker’s pool',
  body: <>Pickers need a <b>pool of tasks to choose from</b> when it is run, whether manually or via the auto generation feature. Go ahead and click this button now.</>,
  primary: 'Next', back: true, requireClick: true,
  run: () => { emlTour.set({ itemPrefill: 'Mop the floors' }); },
};

// Highlights the item name input inside the inline editor Step 8's click
// just opened — .rd-name-input, scoped under .pv-additem-wrap since the same
// class is reused (mutually exclusively at render time) by the existing-
// picker "add item" flow elsewhere on this tab.
const PICKER_TOUR_STEP_9 = {
  sel: '.pv-additem-wrap .rd-name-input', tab: 'picker',
  title: 'Give it a name',
  body: <>This is the name of the task item and is <b>what will show up in your todo list if it is picked</b>. We’ve already filled this out for you but feel free to customize it to whatever you’d prefer.</>,
  primary: 'Next', back: true,
};

// Highlights the Soonest row — the first .pie-row in the editor's isEase
// branch (this sample is Ease-up, so the row's own label reads "Soonest").
// No new one-way DOM transition happens between Step 9 and here (the
// editor stays open the whole time), so no onGoBack handling is needed.
const PICKER_TOUR_STEP_10 = {
  sel: '.pv-additem-wrap .pie-row:first-child', tab: 'picker',
  title: 'Set a timeout',
  body: <>This controls the <b>minimum number of days that a task item must wait before it becomes eligible to be picked again</b>. This is useful since most chores do not usually need to be done again for at least a week or so.</>,
  primary: 'Next', back: true,
};

// Highlights the Latest row — the second .pie-row in the editor's isEase
// branch, right after Soonest. Same reasoning as Step 10: the editor stays
// open, so no new DOM transition to revert on Back.
const PICKER_TOUR_STEP_11 = {
  sel: '.pv-additem-wrap .pie-row:nth-child(2)', tab: 'picker',
  title: 'Set a maximum wait',
  body: <>This controls the <b>maximum number of days that a task item must wait before it should be picked again</b>. This is also useful since most chores need to be done again within a certain timeframe.</>,
  primary: 'Next', back: true,
};

// Highlights the item editor's Save button — .ob-item-save (tagged
// alongside .ob-item-cancel, see EntryEditor in tab-today.jsx). requireClick
// since this closes the editor for good, same real-interface-teaching
// pattern as Steps 2/7/8.
const PICKER_TOUR_STEP_12 = {
  sel: '.ob-item-save', tab: 'picker',
  title: 'Save this task item',
  body: <>This task item is now complete and can be <b>saved to this picker’s pool</b>. Go ahead and click this button now.</>,
  primary: 'Next', back: true, requireClick: true,
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
const PICKER_TOUR_STEP_13 = {
  sel: '.ob-picker-create', tab: 'picker',
  title: 'Create this picker',
  body: <>You’re all set! You’ve created this picker and its pool of task items. All that’s left is to <b>click the Create picker button</b>. Go ahead and click it now.</>,
  primary: 'Done', back: true, requireClick: true,
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

  const [phase, setPhase] = React.useState('intro');

  const closeTour = (status) => {
    // Clear both bus fields regardless of exit path (cancelled/skipped/
    // finished) — tab-picker.jsx's dormant auto-open effect keys off
    // tour.prefill's mere presence (`if (tour.prefill && !creating)`), so a
    // leftover value from THIS tour would silently reopen the create form
    // with stale sample data the next time TabPicker mounts (e.g. just
    // revisiting the Pickers tab), same class of bug the Reminders tours'
    // closeTour already guards against.
    emlTour.set({ prefill: null, itemPrefill: null, suppressAutoOpen: false });
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

  const steps = [PICKER_TOUR_STEP_1, buildPickerTourStep2(pickerId), PICKER_TOUR_STEP_3, PICKER_TOUR_STEP_4, PICKER_TOUR_STEP_5, PICKER_TOUR_STEP_6, PICKER_TOUR_STEP_7, PICKER_TOUR_STEP_8, PICKER_TOUR_STEP_9, PICKER_TOUR_STEP_10, PICKER_TOUR_STEP_11, PICKER_TOUR_STEP_12, PICKER_TOUR_STEP_13];

  return (
    <GuidedTour
      tourId={`picker-${pickerId}`}
      steps={steps}
      resumeStep={0}
      actions={actions}
      active={active}
      selectTab={selectTab}
      // Back from Step 8 (index 7, the Items sub-step's "+ Add item"
      // button) to Step 7 (index 6, "Add items") needs the form pushed back
      // to its Details sub-step first — unlike the Reminders tours' "+"
      // button, .ob-picker-next's click is a one-way step change inside
      // NewPickerForm, not a toggle, so without this Step 7's own target
      // stays gone (the form is still showing Items) and the tour has
      // nothing to highlight. .ob-picker-details is the form's own "Details"
      // step-indicator tab — clicking it is the only way to reverse this
      // from outside the form, which owns that step state locally.
      onGoBack={(to) => {
        if (to === 6) {
          const detailsTab = document.querySelector('.ob-picker-details');
          if (detailsTab) detailsTab.click();
        } else if (to === 7) {
          // Step 8→9's click opened the inline item editor, which is also a
          // one-way transition (no toggle) — Cancel is the only real-DOM way
          // to close it back to the bare .pv-additem-btn from outside, same
          // reasoning as the to===6 branch above.
          const cancelBtn = document.querySelector('.ob-item-cancel');
          if (cancelBtn) cancelBtn.click();
        }
      }}
      // Skip (or the not-found watchdog) reads as "the user didn't finish",
      // distinct both from the intro modal's 'cancelled' and from Step 13's
      // genuine 'finished' via onFinish below. See onboarding-checklist.js's
      // status comment.
      onSkip={() => closeTour('skipped')}
      onFinish={() => closeTour('finished')}
    />
  );
}

export { PickerTour };
