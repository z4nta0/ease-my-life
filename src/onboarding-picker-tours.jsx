import React from 'react';
import { Icon } from './ui.jsx';
import { TutorialIntroModal } from './onboarding-intro-modal.jsx';
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

// `pickerId` is the sample picker's id. Every step so far stays on Today,
// and this component is only ever mounted from within TabToday (see
// tab-today.jsx's startMiniTour) — same constraints as ReminderTour, see its
// own comment in onboarding-reminder-tours.jsx.
function PickerTour({ pickerId, state, actions, onClose }) {
  const picker = (state.pickers || []).find((p) => p.id === pickerId);
  const copy = PICKER_TOUR_COPY[pickerId];
  const modeLabel = ((MODES[picker.mode] || {}).label || picker.mode).toLowerCase();

  const closeTour = (status) => {
    actions.setChecklistItem(pickerId, { status });
    onClose();
  };

  return (
    <TutorialIntroModal
      icon={<Icon name="picker" size={54} />}
      title={`${picker.name} Picker`}
      paragraphs={[PICKER_TOUR_BODY_1, copy.body2]}
      pills={['pickers', modeLabel, (picker.group || '').toLowerCase()]}
      // TODO: launch the GuidedTour walkthrough once its steps are written.
      onStart={() => {}}
      // Mirrors the launcher card's own X button exactly — marks the card
      // cancelled without touching the underlying sample picker.
      onSkip={() => closeTour('cancelled')}
    />
  );
}

export { PickerTour };
