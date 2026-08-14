import React from 'react';
import { Icon } from './ui.jsx';
import { TutorialIntroModal } from './onboarding-intro-modal.jsx';
import { GuidedTour } from './onboarding-tour-runner.jsx';
import { OB_NAV_TARGETS } from './onboarding-targets.jsx';

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
    pills: ['manual pick', 'pickers page', 'run a picker'],
  },
  {
    id: 'feat_edit_item', page: 'picker', label: 'Edit your first item',
    title: 'Editing Items',
    body: 'This tutorial will show you how to edit one of your own items — updating its name, weight, or other values whenever your needs change.',
    pills: ['edit item', 'pickers page', 'update values'],
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

function AppFeatureTour({ featureId, state, actions, active, selectTab, onClose }) {
  const feature = APP_FEATURES.find((f) => f.id === featureId);
  const nav = OB_NAV_TARGETS[feature.page];
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

  return (
    <GuidedTour
      tourId={`appfeature-${featureId}`}
      steps={[
        {
          ...nav,
          body: <>{nav.body} Go ahead and click it now.</>,
          tab: 'today',
          primary: 'Done', back: false, requireClick: true,
        },
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
