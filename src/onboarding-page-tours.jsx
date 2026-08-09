import React from 'react';
import { Icon } from './ui.jsx';
import { TutorialIntroModal } from './onboarding-intro-modal.jsx';
import { GuidedTour } from './onboarding-tour-runner.jsx';
import { OB_NAV_TARGETS } from './onboarding-targets.jsx';
import { OB_PAGE_TOURS } from './onboarding-checklist.js';

// Page tours ("Explore the {page}" — Today/Pickers/Stats/Data/Settings) are
// still growing in from an intro-only stub — this is their first real step.
// Falls back to OB_NAV_TARGETS' own per-page title/body (already written to
// stand alone, with no reference to "this tour" or "the next step" baked in
// — see that file's own comment) for any page PAGE_TOUR_COPY below hasn't
// gotten its own dedicated pass yet.
const PAGE_TOUR_COPY = {
  explore_today: {
    title: 'Today Page',
    body: 'This tutorial will take you on a quick tour of the Today page, in order to highlight important elements and functionality.',
    pills: ['page tour', 'today page', 'todo list'],
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
// be what does the navigating, not the step itself).
const buildPageTourStep1 = (page) => ({
  ...OB_NAV_TARGETS[page],
  tab: 'today',
  primary: 'Next', back: false, requireClick: true,
});

function PageTour({ pageId, actions, onClose }) {
  const tour = OB_PAGE_TOURS.find((t) => t.id === pageId);
  const nav = OB_NAV_TARGETS[tour.page];
  const copy = PAGE_TOUR_COPY[pageId];
  const [phase, setPhase] = React.useState('intro');

  const closeTour = (status) => {
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

  // Only Step 1 exists so far — advancing past it falls through
  // GuidedTour's own "ran off the end" safety net into onSkip, same as
  // every other mini-tour behaved before its own final Done step existed.
  return (
    <GuidedTour
      tourId={`page-${pageId}`}
      steps={[buildPageTourStep1(tour.page)]}
      resumeStep={0}
      actions={actions}
      active="today"
      selectTab={() => {}}
      onSkip={() => closeTour('skipped')}
      onFinish={() => closeTour('finished')}
    />
  );
}

export { PageTour };
