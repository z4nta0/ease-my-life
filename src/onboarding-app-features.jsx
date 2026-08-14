import React from 'react';
import { Icon } from './ui.jsx';
import { TutorialIntroModal } from './onboarding-intro-modal.jsx';
import { GuidedTour } from './onboarding-tour-runner.jsx';
import { buildPageTourStep1 } from './onboarding-page-tours.jsx';

// App Features — a SEPARATE, later-stage set of mini-tours shown on Today
// only once the user has generated their first real todo list (see
// tab-today.jsx's showAppFeatures), pinned as the LAST group on the page —
// below Reminders, Page Tours (mutually exclusive with these anyway, see
// showAppFeatures' own comment) and every real picker group. Unlike every
// earlier onboarding tour, these operate on the user's own REAL data rather
// than disposable samples — there's always at least one real picker by this
// point (see onboarding-checklist.js's readyToGenerate gate) — and are
// deliberately NOT tracked by the checklist "engine" at all: no doneCount/
// total ring or streak participation, no closing Generate-style card, no
// counting toward anything. Resolved state lives in its own
// state.onboarding.appFeatures map (see store.jsx's setAppFeatureItem),
// reset to {} whenever Replay Tour is clicked in Settings so these reappear
// alongside it (see tab-settings.jsx's own replay button).
//
// Content here is a first-pass STUB, same as every page tour in
// onboarding-page-tours.jsx started as (see that file's own PAGE_TOUR_COPY
// header comment) — one step per feature (highlight the real nav button for
// whichever page it lives on, reusing OB_NAV_TARGETS the same way
// buildPageTourStep1 does), not yet the full walkthrough. Copy/pills/order
// are a first draft per the user's own dictated list — expect an editing
// pass.
// Display label per `page` id — same 5 tabs as app.jsx's own TABS array,
// which isn't exported, so this stays self-contained rather than reaching
// into that file for it. Used for the launcher card's own kicker text (see
// tab-today.jsx's AppFeatureCard) — the page each feature's icon/nav-click
// step belongs to.
export const APP_FEATURE_PAGE_LABELS = {
  today: 'Today', picker: 'Pickers', stats: 'Stats', data: 'Data', settings: 'Settings',
};

export const APP_FEATURES = [
  {
    id: 'feat_manual_pick', page: 'picker', label: 'Make your first manual pick',
    title: 'Manual Picks',
    body: 'This tutorial will show you how to manually run one of your pickers and send its result straight to your todo list, without waiting for the next automatic generation.',
    pills: ['pickers page', 'run a picker', 'manual pick'],
  },
  {
    id: 'feat_edit_item', page: 'data', label: 'Edit your first item',
    title: 'Editing Items',
    body: 'This tutorial will show you how to edit one of your own items — updating its name, weight, or other values whenever your needs change.',
    pills: ['edit item', 'data page', 'update values'],
  },
  {
    id: 'feat_run_time', page: 'settings', label: 'Adjust your generator run time',
    title: 'Generator Run Time',
    body: 'This tutorial will show you how to change what time of day your todo list automatically generates, so it is ready exactly when you want it.',
    pills: ['settings page', 'daily generator', 'run time'],
  },
  {
    id: 'feat_theme', page: 'settings', label: 'Change your app theme',
    title: 'App Theme',
    body: 'This tutorial will show you how to switch between light and dark mode, or customize the app’s colors to your own taste.',
    pills: ['settings page', 'appearance', 'theme'],
  },
  {
    id: 'feat_celebration', page: 'settings', label: 'Change your celebration animation',
    title: 'Celebration Animation',
    body: 'This tutorial will show you how to change the animation that plays whenever you complete your entire todo list for the day.',
    pills: ['settings page', 'appearance', 'celebration'],
  },
  {
    id: 'feat_pick_anim', page: 'settings', label: 'Change your picker animation',
    title: 'Picker Animation',
    body: 'This tutorial will show you how to change the animation that plays whenever a picker is run, either automatically or manually.',
    pills: ['settings page', 'appearance', 'pick animation'],
  },
  {
    id: 'feat_highlights', page: 'today', label: 'Use the highlight feature',
    title: 'Highlight Feature',
    body: 'This tutorial will show you how to use the highlight feature, which lets you tap the info icon on any page to get an on demand explanation of everything on screen.',
    pills: ['help highlights', 'on demand', 'any page'],
  },
  {
    id: 'feat_protect_data', page: 'settings', label: 'Protect your data / Install the app',
    title: 'Protect Your Data',
    body: 'This tutorial will show you how your data is stored, how to back it up, and how to install the app for the best experience.',
    pills: ['settings page', 'data control', 'install app'],
  },
];

// Steps beyond Step 1 (the shared nav-highlight every App Feature tour
// starts with, built fresh per render below), keyed by feature id — empty/
// absent for any feature that only has Step 1 so far. Mirrors onboarding-
// page-tours.jsx's own buildPageTourSteps (same reasoning: filled in
// incrementally as each tutorial gets its own pass, not all at once).
const buildAppFeatureSteps = (featureId) => {
  if (featureId === 'feat_manual_pick') {
    return [
      // Title/body copied verbatim from the Pickers page tour's own
      // manualGeneration step (PICKER_PAGE_TARGETS in onboarding-page-
      // tours.jsx) — same functionality, same explanation. .picker-run
      // wraps the picker's stage + actions as one combined box (see that
      // file's own comment on it) so this highlights "the picker window
      // and the Pick one button" together, not just the button on its
      // own. No scrollToTop/Bottom override — the default pad-based
      // bring() already smooth-scrolls it into view. advanceWhen (not
      // an immediate advance): Pick one kicks off a multi-second spin
      // animation, so stay on THIS step's already-resolved coach for the
      // whole wait — same reasoning as the page tour's own step, whose
      // advanceWhen this copies (Step 3's own clickSel below).
      {
        sel: '.picker-run', tab: 'picker',
        title: 'Manual Generation',
        body: <>This will allow to <b>run a manual pick generation</b> for any given picker, so that you do not have to completely rely on the todo list's auto generation feature on the Today page. Click the Pick one button now to see how this works.</>,
        primary: 'Next', back: true, requireClick: true,
        advanceWhen: '.pv-act--send',
      },
      // Title/body copied verbatim from the Pickers page tour's own
      // addToTodoList step. Still .picker-run, not just the Send to
      // Today button on its own — same combined-box reasoning as Step
      // 2, and .picker-actions (which .picker-run wraps) contains the
      // WHOLE row (Send to Today, Re-roll, AND Done), so this highlights
      // all three together (the picker window itself staying highlighted
      // the whole time, same element as Step 2). clickSel narrows the
      // actual click-guard/requireClick target down to Send to Today
      // specifically — a click on Re-roll or Done shouldn't satisfy
      // this step, since either discards the very pick Step 2 just made.
      // advanceDelay: Send to Today swaps its own label to "Sent!" for
      // a beat (see tab-picker.jsx's sendToToday) before reverting —
      // finishing immediately would cut that confirmation off before
      // the user ever sees it.
      {
        sel: '.picker-run', clickSel: '.pv-act--send', tab: 'picker',
        title: 'Add to Todo List',
        body: <>This will <b>add the manually generated pick to your todo list on the Today page</b>. Go ahead and click this button now to give it a try.</>,
        primary: 'Done', back: true, requireClick: true,
        advanceDelay: 1600,
      },
    ];
  }
  return [];
};

function AppFeatureTour({ featureId, state, actions, active, selectTab, onClose }) {
  const feature = APP_FEATURES.find((f) => f.id === featureId);
  // Same resumable pattern as PageTour — see its own comment.
  const ob = state.onboarding || {};
  const resumable = ob.activeTour && ob.activeTour.id === `appfeature-${featureId}` ? ob.activeTour : null;
  const [phase, setPhase] = React.useState(resumable ? 'tour' : 'intro');

  const closeTour = (status) => {
    actions.setAppFeatureItem(featureId, { status });
    onClose();
  };

  if (phase === 'intro') {
    return (
      <TutorialIntroModal
        icon={<Icon name={feature.page} size={54} />}
        title={feature.title}
        paragraphs={[feature.body]}
        pills={feature.pills}
        onStart={() => setPhase('tour')}
        onSkip={() => closeTour('cancelled')}
      />
    );
  }

  const extraSteps = buildAppFeatureSteps(featureId);
  return (
    <GuidedTour
      tourId={`appfeature-${featureId}`}
      steps={[
        // Same Step 1 every page tour uses (see its own comment) — 'Done'
        // when this is still the only step, 'Next' once extraSteps exist.
        buildPageTourStep1(feature.page, undefined, extraSteps.length ? 'Next' : 'Done'),
        ...extraSteps,
      ]}
      resumeStep={resumable ? resumable.step : 0}
      actions={actions}
      active={active}
      selectTab={selectTab}
      onFinish={() => closeTour('finished')}
      onSkip={() => closeTour('skipped')}
    />
  );
}

export { AppFeatureTour };
