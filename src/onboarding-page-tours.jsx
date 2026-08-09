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
const buildPageTourStep1 = (page) => {
  const nav = OB_NAV_TARGETS[page];
  return {
    ...nav,
    body: <>{nav.body} Go ahead and click it now.</>,
    tab: 'today',
    primary: 'Next', back: false, requireClick: true,
  };
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
    sel: '.group-rail',
    title: 'List Navigation',
    body: <>This is the todo list’s navigation, allowing you to <b>jump directly to a group’s section</b>. Over time your list can grow quite long and this helps to eliminate any long scrolling.</>,
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
    body: <>This will allow you to both <b>rearrange the positions of the groups and items, as well as rename the groups</b>. Go ahead and click it now.</>,
  },
};

// Steps beyond Step 1 (the nav-highlight every page tour shares), keyed by
// page tour id — empty/absent for any page that only has Step 1 so far.
// Advancing past the last step in here falls through GuidedTour's own "ran
// off the end" safety net into onSkip, same as every other mini-tour
// behaved before its own final Done step existed.
const PAGE_TOUR_STEPS = {
  explore_today: [
    { ...TODAY_PAGE_TARGETS.progressRing, tab: 'today', primary: 'Next', back: true },
    { ...TODAY_PAGE_TARGETS.groupsNav, tab: 'today', primary: 'Next', back: true },
    { ...TODAY_PAGE_TARGETS.editMode, tab: 'today', primary: 'Next', back: true, requireClick: true },
  ],
};

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

  return (
    <GuidedTour
      tourId={`page-${pageId}`}
      steps={[buildPageTourStep1(tour.page), ...(PAGE_TOUR_STEPS[pageId] || [])]}
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
