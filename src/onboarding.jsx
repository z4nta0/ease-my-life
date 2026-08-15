import React from 'react';
import {
  OB_EXAMPLE, OB_EXTRA_PICKERS, OB_TASKS, OB_SAMPLE_PICKER_IDS, OB_SAMPLE_TASK_IDS,
  hydrateOnboardingStats,
} from './onboarding-seed-data.js';
import { OB_NAV_TARGETS } from './onboarding-targets.jsx';
import { emlTour, useEmlTour } from './eml-tour-bus.js';
import { GuidedTour, goToTodayTop } from './onboarding-tour-runner.jsx';
import { TutorialIntroModal } from './onboarding-intro-modal.jsx';

// Re-exported for existing importers (app.jsx, tab-today.jsx, tab-picker.jsx,
// tab-stats.jsx) — the bus itself lives in eml-tour-bus.js now, split out so
// onboarding-tour-runner.jsx can import it without a circular dependency on
// this file.
export { emlTour, useEmlTour };

// Onboarding: first-run welcome modal + a guided spotlight tour that
// actually drives the app (each coach card's primary button performs the
// step, so the user can do it themselves or let the tour do it). Both the
// modal (TutorialIntroModal) and the spotlight walkthrough (GuidedTour,
// onboarding-tour-runner.jsx) are generic, shared components — this file
// only supplies the Welcome Tour's own content and the handful of side
// effects specific to it (seeding sample data, hiding it again at the end,
// restoring it on Back). Every future per-feature mini-tour is built the
// same way: its own intro-modal content + its own step array, on the same
// two shared pieces.
//
// Decoupled from the tabs via:
//   • emlTour — a tiny observable bus (prefill for the picker form, plus live
//     phase/step so other tabs can react to the tour without a context
//     provider — e.g. Today's empty-states gate on obBus.phase).
//   • window.__emlGenerate() — registered by TabToday so the tour can run the
//     generator without reaching into the footer's confirm dialog.
//   • data-tour / .ob-* / data-tab selectors on real target elements.
//
// Trigger: shows when state.onboarding.welcomed is false (clean state). The dev
// SEED ships welcomed:true so the sample-data build isn't nagged; visit
// #onboard-demo for a non-destructive clean-state preview (see app.jsx).

// OB_EXAMPLE / OB_EXTRA_PICKERS / OB_TASKS (the sample pickers/items/reminders
// seeded on a fresh install, before the welcome tour begins — see the seeding
// effect in Onboarding()) live in ./onboarding-seed-data.js, imported above.
// Kept out of this file specifically so scripts/build-onboarding-stats.mjs
// (a Node script, can't parse this file's JSX) can import the exact same data
// when precomputing ~1yr of matching pick/reminder history.

const OB_BRAND = 'M 24.467 527.792 C 67.266 416.298 77.088 228.913 172.207 434.412 C 200.739 535.77 262.562 434.412 314.873 292.51 C 381.45 120.201 450.381 44.636 528.854 24.365 C 521.725 22.337 512.215 24.365 493.193 34.5 C 369.548 105.451 295.85 292.51 234.029 363.461 C 186.473 414.14 167.451 241.831 124.651 262.102 C 101.828 270.008 60.133 375.754 24.467 527.792 Z';

// ── STASHED: create-a-picker tour content ──────────────────────────────────
// Cut from the active tour below when it was refocused on orienting the user
// around the app in general, rather than building a real picker step by
// step. Preserved verbatim (not live code — everything here is inside this
// comment) for reuse when we build a dedicated "Create your first picker"
// mini-tour, launched from its own dismissible card. Predates the
// GuidedTour extraction (onboarding-tour-runner.jsx) — this content was
// written for the old inline-everything pattern (explicit setStep/selectTab
// calls inside each step, phase/step owned by this component) and will need
// adapting to the current one before reuse: run() is a pure side effect now
// (no setStep/selectTab — navigation is generic, driven by each step's
// `tab` field and advancing by one), and Back's side effects belong in a
// single onGoBack(targetStep) passed to <GuidedTour>, not per-step branches
// inside goBack() itself. All `step` numbers below are relative to the OLD
// 6-step layout (this content occupied indices 0-3, Generate was 4, the
// review/celebration step was 5) — recalculate for whatever local step
// numbering the new mini-tour ends up using.
//
// Supporting hooks this content depends on are NOT stashed — they were left
// in place in their own files, dormant but ready:
//   • app.jsx's TabBar renders `data-tab={t.id}` on every nav button (used
//     below to target the Pickers nav button).
//   • tab-picker.jsx's NewPickerForm still accepts an `openedByTour` prop
//     (suppresses its own tour-only "Picker name" field) and still renders
//     `.ob-picker-details` / `.ob-picker-next` / `.ob-picker-create` classes
//     on its Details-pill / Next / Create buttons for the tour to drive.
//   • tab-picker.jsx's onCreate still dedupes by name when `openedByTour` and
//     still calls `window.__emlPickerCreated()` on create/dedupe — that
//     window callback just isn't registered by anything right now (see the
//     advanceRef effect below, which needs to be restored to register it).
//
// 1) The advanceRef / window.__emlPickerCreated registration (lived right
//    after the `bus` line, inside the component body):
//
//   const advanceRef = React.useRef(null);
//   advanceRef.current = () => {
//     if (phase === 'tour' && (step === 2 || step === 3)) {
//       OB_EXTRA_PICKERS.forEach((p) => {
//         if (!state.pickers.some((pk) => pk.name === p.name)) actions.addPicker(p);
//       });
//       emlTour.set({ prefill: null });
//       selectTab('today');
//       setStep(4);
//     }
//   };
//   React.useEffect(() => {
//     window.__emlPickerCreated = () => { if (advanceRef.current) advanceRef.current(); };
//     return () => { if (window.__emlPickerCreated) delete window.__emlPickerCreated; };
//   }, []);
//
// 2) The four step definitions themselves (old indices 0-3, prepended to
//    whatever `steps` starts with today):
//
//   {
//     sel: '[data-tour="create-picker"], .ob-gsc', place: 'above',
//     title: 'Start with a picker',
//     body: 'Pickers are the heart of the app, containing a pool of items it chooses from each day. We’ll make one together.',
//     primary: 'Next', back: false,
//     run: () => { setStep(1); },
//   },
//   {
//     sel: '[data-tab="picker"]', place: 'below',
//     title: 'Pickers live here',
//     body: 'All of your pickers can be found on this page, which is also where new pickers are created. Click this button now so that we can create a new picker together.',
//     primary: 'Next', back: true,
//     run: () => { emlTour.set({ prefill: OB_EXAMPLE }); selectTab('picker'); setStep(2); },
//   },
//   {
//     sel: '.np-form', place: 'above',
//     title: 'Your first picker',
//     body: 'We’ve filled this out for you but feel free to change any of the details. Explore the form on your own to better understand how it works, or click Next once you’re ready to add items to its pool.',
//     primary: 'Next', back: true,
//     run: () => {
//       const toItems = document.querySelector('.ob-picker-next');
//       if (toItems) toItems.click();
//       setStep(3);
//     },
//   },
//   {
//     sel: '.np-form', place: 'above',
//     title: 'Your first picker’s items',
//     body: 'We’ve already added some items for you but feel free to delete any or add your own. Click Next once you are ready to generate your first todo list.',
//     primary: 'Next', back: true,
//     run: () => {
//       const create = document.querySelector('.ob-picker-create');
//       if (create) { create.click(); return; }
//       const toItems = document.querySelector('.ob-picker-next');
//       if (toItems) {
//         toItems.click();
//         let tries = 0;
//         const iv = setInterval(() => {
//           const c = document.querySelector('.ob-picker-create');
//           if (c) { clearInterval(iv); c.click(); }
//           else if (++tries > 25) clearInterval(iv);
//         }, 60);
//         return;
//       }
//       emlTour.set({ prefill: { ...OB_EXAMPLE, step: 2 } });
//       selectTab('picker');
//     },
//   },
//
// 3) goBack()'s special cases for to===0,1,2,3 (replaced the generic
//    `else selectTab('today')` fallback that's there now):
//
//   if (to === 0) { emlTour.set({ prefill: null }); selectTab('today'); }
//   else if (to === 1) { emlTour.set({ prefill: null }); selectTab('today'); }
//   else if (to === 2) {
//     emlTour.set({ prefill: { ...OB_EXAMPLE } });
//     selectTab('picker');
//     const details = document.querySelector('.ob-picker-details');
//     if (details) details.click();
//   }
//   else if (to === 3) { emlTour.set({ prefill: { ...OB_EXAMPLE, step: 2 } }); selectTab('picker'); }
//   else selectTab('today');
//
// 4) Desync-detection effect (catches the user clicking the real Pickers nav
//    button instead of the coach's Next during steps 0-1):
//
//   React.useEffect(() => {
//     if (phase === 'tour' && (step === 0 || step === 1) && active === 'picker') {
//       emlTour.set({ prefill: { ...OB_EXAMPLE } });
//       setStep(2);
//     }
//   }, [phase, step, active]);
//
// 5) Watchdog effect for steps 2-3 (re-opens the form if it hasn't mounted
//    shortly after the step opens):
//
//   React.useEffect(() => {
//     if (phase !== 'tour' || (step !== 2 && step !== 3)) return;
//     let tries = 0;
//     const iv = setInterval(() => {
//       if (document.querySelector('.np-form')) { clearInterval(iv); return; }
//       if (++tries > 20) { clearInterval(iv); return; }
//       emlTour.set({ prefill: { ...OB_EXAMPLE, ...(step === 3 ? { step: 2 } : {}) } });
//       selectTab('picker');
//     }, 120);
//     return () => clearInterval(iv);
//   }, [phase, step]);
// ─────────────────────────────────────────────────────────────────────────

function Onboarding({ state, actions, active, selectTab }) {
  const ob = state.onboarding || { welcomed: true };
  // A tour a reload interrupted resumes exactly where it left off instead of
  // vanishing — activeTour survives a reload (it's real persisted state),
  // unlike GuidedTour's own step state. Ignored if welcomed is false — the
  // welcome modal (not yet dismissed) always takes priority.
  const resumable = ob.welcomed && ob.activeTour && ob.activeTour.id === 'welcome' ? ob.activeTour : null;
  // phase: 'welcome' | 'tour' | 'off'
  const [phase, setPhase] = React.useState(!ob.welcomed ? 'welcome' : (resumable ? 'tour' : 'off'));

  // If the flag flips (replay from Settings / demo route), re-open.
  React.useEffect(() => {
    if (!ob.welcomed && phase === 'off') setPhase('welcome');
  }, [ob.welcomed]);

  // Seed the sample pickers/reminders immediately on a fresh install —
  // before the welcome tour even begins — so every tour step always has real
  // content to point at and generate from. Checked once on mount only (an
  // intentionally empty dep array): re-running on later state changes would
  // fight a user who's since deleted every picker on purpose.
  //
  // The ~1yr of matching Stats history is a ~650KB precomputed file that's
  // irrelevant to everyone past their first run, so it's dynamic-imported
  // (code-split out of the main bundle) rather than imported at the top of
  // this file. Its rows store day-offsets, not absolute dates —
  // hydrateOnboardingStats converts them to real ISO dates relative to
  // TODAY, not whenever the data was generated (see
  // scripts/build-onboarding-stats.mjs for why).
  React.useEffect(() => {
    if (ob.welcomed || state.pickers.length > 0) return;
    [OB_EXAMPLE, ...OB_EXTRA_PICKERS].forEach((p) => actions.addPicker(p));
    // The sample reminders themselves are seeded later, at the Generate
    // step (see that step's run() below) — unlike picker items, a reminder
    // needs no "generate" to become visible on Today, so seeding it here
    // would show it during Step 1, before the user has generated anything.
    // The precomputed history seeded below is independent of whether the
    // live task exists yet (log rows are denormalized), so it stays here.
    import('./onboarding-stats-data.js').then(({ ONBOARDING_STATS }) => {
      actions.seedHistory(hydrateOnboardingStats(ONBOARDING_STATS));
    });
  }, []);

  const finish = React.useCallback(() => {
    setPhase('off');
    emlTour.set({ prefill: null });
  }, []);
  const welcomeDone = () => actions.setOnboarding({ welcomed: true });

  // ── Step definitions ────────────────────────────────────────────────
  // Each: target selector, copy, primary action, and which tab its target
  // lives on (`tab`) — GuidedTour switches there automatically, steps never
  // call selectTab themselves. run() is a pure side effect; which step/tab
  // comes next is handled generically (advance by one, or finish on
  // primary:'Done').
  const steps = [
    {
      ...OB_NAV_TARGETS.today,
      tab: 'today',
      primary: 'Next', back: false,
    },
    {
      // .gen-confirm is a fallback, not the primary target: clicking
      // Regenerate yourself (the step's own "do it yourself" path) replaces
      // the button with tab-today.jsx's confirm prompt, and without this the
      // step's target would genuinely vanish for however long the user
      // takes to read it and click Continue — long enough, on a real human
      // timescale, to trip the not-found watchdog and end the tour outright.
      sel: '.ob-generate, .gen-confirm', tab: 'today',
      // Confirming the real Regenerate flow (the "do it yourself" path the
      // body text offers) is functionally the same action Next's own run()
      // performs below via window.__emlGenerate() — the real generate()
      // call is reentrancy-guarded (see tab-today.jsx's generatingRef), so
      // whichever of the two fires first "wins" and the other becomes a
      // harmless no-op; either way exactly one reel-cycle animation plays
      // and the tour advances, matching Next's own behavior exactly.
      advanceOn: '.gen-confirm-continue',
      title: 'Todo list generation',
      body: <>Each morning the app will <b>automatically generate your daily todo list</b>. Since you have not created anything yet, the app will use some sample data so that you can see how it works. You can always click Regenerate if you’d rather generate the list yourself. Let’s go ahead and run that now.</>,
      primary: 'Next', back: true,
      run: () => {
        // On replay (dismissed:true) the user already has a real Today list —
        // don't regenerate and clobber it, just advance to the review step,
        // which highlights the list as it already stands. Otherwise kick off
        // the real generator — the next step's highlight covers the whole
        // list, group sections included, so it already has a real target to
        // point at while the list is still filling in.
        if (!ob.dismissed) {
          if (window.__emlGenerate) window.__emlGenerate();
          // Sample reminders appear alongside the generated picks, not
          // before — seeded here rather than on mount (see that effect's
          // comment). Guarded by existence so navigating back to this step
          // and forward again can't add them twice.
          if (!state.tasks.some((t) => OB_SAMPLE_TASK_IDS.includes(t.id))) {
            const today = new Date().getDay();
            OB_TASKS.forEach((t) => actions.addTask(
              t.repeat === 'weekly' ? { ...t, daysOfWeek: [today] } : t
            ));
          }
        }
      },
    },
    {
      sel: '.group-section', tab: 'today',
      title: 'Daily todo list',
      body: <>This is what a <b>typical todo list</b> will look like once you’ve set up your own pickers and reminders. There will be tutorials for setting these up once this tour ends.</>,
      primary: 'Next', back: true,
      scrollToTop: true,
    },
    {
      ...OB_NAV_TARGETS.picker,
      tab: 'picker',
      primary: 'Next', back: true,
    },
    {
      ...OB_NAV_TARGETS.stats,
      tab: 'stats',
      primary: 'Next', back: true,
    },
    {
      ...OB_NAV_TARGETS.data,
      tab: 'data',
      primary: 'Next', back: true,
    },
    {
      ...OB_NAV_TARGETS.settings,
      tab: 'settings',
      primary: 'Next', back: true,
      run: () => {
        // Tuck the sample pickers/reminders out of sight — not deleted, the
        // per-page mini-tours will reuse this exact data (and its precomputed
        // Stats history) later.
        OB_SAMPLE_PICKER_IDS.forEach((id) => actions.updatePicker(id, { hidden: true }));
        OB_TASKS.forEach((t) => actions.updateTask(t.id, { hidden: true }));
      },
    },
    {
      sel: '.groups-dnd', tab: 'today',
      title: 'You’re all finished!',
      body: <>That is all for the Welcome Tour. Highlighted here are a few small tutorials that will help get you set up to start using the app. Enjoy!</>,
      primary: 'Done', back: true,
      scrollToTop: true,
    },
  ];

  // Sample pickers/tasks only ever get hidden once, at the Settings→final
  // step's run() above — stepping back before that point should show them
  // exactly as they did the first time through, not whatever the checklist
  // phase (tutorial cards, Page Tours) left behind from having reached the
  // end. Skipped during a replay (dismissed:true): those samples are the
  // ORIGINAL ones from the user's first-ever onboarding, already hidden
  // long before this session started, and un-hiding them would mix stale
  // demo pickers into the real, current Today list.
  const handleGoBack = (to) => {
    if (ob.dismissed) return;
    OB_SAMPLE_PICKER_IDS.forEach((id) => actions.updatePicker(id, { hidden: false }));
    if (to === 1) {
      // Back to the Generate step specifically: sample REMINDERS don't
      // exist yet the very first time this step shows — its own run() only
      // adds them once its Next actually fires. Removed rather than hidden
      // — hidden would keep bus.phase's consumers thinking a tutorial
      // checklist is still relevant here. Safe to fully delete: the forward
      // run()'s own existence check re-adds them exactly as before the
      // moment Next fires again. Also clear whatever's on the picker list
      // so it again looks like nothing's been generated yet.
      OB_TASKS.forEach((t) => actions.removeTask(t.id));
      actions.clearTodayEntries();
    } else {
      OB_TASKS.forEach((t) => actions.updateTask(t.id, { hidden: false }));
    }
  };

  if (phase === 'off') return null;

  if (phase === 'welcome') {
    return (
      <TutorialIntroModal
        icon={<svg viewBox="8 8 528 528" fill="none"><path d={OB_BRAND} style={{ fill: 'currentColor', stroke: 'currentColor' }} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        title="Welcome to Ease My Life"
        paragraphs={[
          'Decide less and add some variety to your life! Ease My Life is a todo app that generates a daily list of tasks from pools of items that you create and according to the rules that you set.',
          'Ease My Life requires no account to use, works completely offline, stores all data on your device and is ad free!',
          'This welcome tour will show you the layout of the app and help you understand how it works. After it finishes, there will be a few small tutorials that will guide you through setting up everything you need in order to generate your first todo list. Let’s get started!',
        ]}
        pills={['todo list', 'pickers', 'reminders']}
        startLabel="Take the quick tour"
        skipLabel="I’ll explore myself"
        onStart={() => { selectTab('today'); welcomeDone(); setPhase('tour'); }}
        onSkip={() => {
          welcomeDone();
          // Skipping the tour still needs to land on the same "few small
          // tutorials" checklist phase the full tour reaches at its last
          // step (Generate step's task-seeding run(), Settings step's
          // hide-everything run() — see the `steps` array above) — otherwise
          // Today has nothing to show: the sample pickers exist but aren't
          // hidden yet (groupEntries only renders a tutorial launcher card
          // for a hidden sample), and no sample reminders exist at all.
          // Seeded straight into `hidden`, unlike the tour's own Generate
          // step — there's no in-between "review the generated list" step
          // here for them to be visible during first.
          if (!state.tasks.some((t) => OB_SAMPLE_TASK_IDS.includes(t.id))) {
            const today = new Date().getDay();
            OB_TASKS.forEach((t) => actions.addTask({
              ...t,
              ...(t.repeat === 'weekly' ? { daysOfWeek: [today] } : {}),
              hidden: true,
            }));
          }
          OB_SAMPLE_PICKER_IDS.forEach((id) => actions.updatePicker(id, { hidden: true }));
          finish();
          goToTodayTop(active, selectTab);
        }}
      />
    );
  }

  return (
    <GuidedTour
      tourId="welcome"
      steps={steps}
      resumeStep={resumable ? resumable.step : 0}
      actions={actions}
      active={active}
      selectTab={selectTab}
      onGoBack={handleGoBack}
      onFinish={finish}
    />
  );
}

export { Onboarding };
