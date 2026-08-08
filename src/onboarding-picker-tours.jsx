import React from 'react';
import { Icon } from './ui.jsx';
import { TutorialIntroModal } from './onboarding-intro-modal.jsx';
import { GuidedTour } from './onboarding-tour-runner.jsx';
import { OB_NAV_TARGETS } from './onboarding-targets.jsx';
import { MODES } from './seed.js';

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
const PICKER_TOUR_STEPS_SHARED = [
  {
    sel: '[data-tab="picker"]', tab: 'today',
    title: 'The Pickers page',
    body: <>Pickers are the <b>heart of the app</b> and this is where you can create new pickers and their items. You can also manually run any picker to generate a task. Go ahead and click it now.</>,
    primary: 'Next', back: false, requireClick: true,
  },
  // Lands at the top of the Pickers page (scrollToTop) and highlights the
  // real "+ Add new picker" tab — requireClick again, same teaching-the-
  // real-interface pattern as the Reminders tours' "+" step.
  {
    sel: '.picker-tab--add', tab: 'picker', scrollToTop: true,
    title: 'Create a new picker',
    body: <>This button will <b>open up the form</b> for creating a new picker. Go ahead and click it now.</>,
    primary: 'Next', back: true, requireClick: true,
  },
];

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

  return (
    <GuidedTour
      tourId={`picker-${pickerId}`}
      steps={PICKER_TOUR_STEPS_SHARED}
      resumeStep={0}
      actions={actions}
      active={active}
      selectTab={selectTab}
      onGoBack={null}
      // No 'Done' step exists yet, so the only way this is reachable right
      // now is Skip (or the not-found watchdog) — both read as "the user
      // didn't finish", distinct from the intro modal's 'cancelled'. See
      // onboarding-checklist.js's status comment.
      onSkip={() => closeTour('skipped')}
      onFinish={() => closeTour('finished')}
    />
  );
}

export { PickerTour };
