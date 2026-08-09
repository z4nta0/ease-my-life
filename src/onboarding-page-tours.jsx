import React from 'react';
import { Icon } from './ui.jsx';
import { TutorialIntroModal } from './onboarding-intro-modal.jsx';
import { OB_NAV_TARGETS } from './onboarding-targets.jsx';
import { OB_PAGE_TOURS } from './onboarding-checklist.js';

// Page tours ("Explore the {page}" — Today/Pickers/Stats/Data/Settings)
// don't have a real walkthrough yet — this is an intro-only stub so their
// launcher cards (tab-today.jsx's PageTourCard) have something to actually
// open instead of being a dead no-op. Falls back to OB_NAV_TARGETS' own
// per-page title/body (already written to stand alone, with no reference to
// "this tour" or "the next step" baked in — see that file's own comment)
// for any page PAGE_TOUR_COPY below hasn't gotten its own dedicated pass
// yet. Once a real walkthrough exists for a given page, this same intro
// step becomes its first phase, exactly like the Picker/Reminder tours' own
// intro modals — see PickerTour/ReminderTour for that two-phase
// (`intro` → `tour`) shape.
const PAGE_TOUR_COPY = {
  explore_today: {
    title: 'Today Page',
    body: 'This tutorial will take you on a quick tour of the Today page, in order to highlight important elements and functionality.',
    pills: ['page tour', 'today page', 'todo list'],
  },
};

function PageTour({ pageId, actions, onClose }) {
  const tour = OB_PAGE_TOURS.find((t) => t.id === pageId);
  const nav = OB_NAV_TARGETS[tour.page];
  const copy = PAGE_TOUR_COPY[pageId];

  const closeTour = (status) => {
    actions.setChecklistItem(pageId, { status });
    onClose();
  };

  return (
    <TutorialIntroModal
      icon={<Icon name={tour.page} size={54} />}
      title={(copy && copy.title) || nav.title}
      paragraphs={[(copy && copy.body) || nav.body]}
      pills={(copy && copy.pills) || ['page tour', tour.label.toLowerCase()]}
      startLabel="Got it"
      // No walkthrough to advance into yet, so Got it and Skip both just
      // close this — the only difference is which resolution the checklist
      // card ends up showing, same 'finished'/'cancelled' split every other
      // tour's own intro modal already uses for its Start/Skip.
      onStart={() => closeTour('finished')}
      onSkip={() => closeTour('cancelled')}
    />
  );
}

export { PageTour };
