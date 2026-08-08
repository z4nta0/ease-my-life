import React from 'react';
import { emlTour, useEmlTour } from './eml-tour-bus.js';
import { Icon } from './ui.jsx';
import { TutorialIntroModal } from './onboarding-intro-modal.jsx';
import { GuidedTour } from './onboarding-tour-runner.jsx';
import { OB_TASKS } from './onboarding-seed-data.js';

// Content for the two Reminders mini-tours ("Set up a one-time reminder" /
// "Set up a recurring reminder"), launched by Play on their sample launcher
// cards on Today (see tab-today.jsx's startMiniTour, reminders.jsx's
// ReminderCard isTutorial branch). Both share the same intro-modal structure
// and first paragraph — only the icon/title/second paragraph differ by
// variant, matching the two sample reminders seeded by the Welcome Tour
// (onboarding-seed-data.js's OB_TASKS: tk_ob_meds is the one-time sample,
// tk_ob_trash the recurring one).
const REMINDER_TOUR_BODY_1 = 'Reminders can be thought of as what a normal task would be in a typical todo list app, since not all tasks can be randomly selected. Taking out the trash for pickup, as an example, since this must be done on a set day every week.';

const REMINDER_TOUR_COPY = {
  once: {
    taskId: 'tk_ob_meds',
    icon: 'pin',
    title: 'One-Time Reminders',
    body2: 'One-time reminders are simple one off things that need to get done. e.g. pickup precription or pickup dry cleaning. Let’s create one of these now.',
  },
  recurring: {
    taskId: 'tk_ob_trash',
    icon: 'calendar',
    title: 'Recurring Reminders',
    body2: 'Recurring tasks are things that need to get done on a set schedule. e.g. take trash out for pickup (weekly) or get the mail (daily). Let’s create one of these now.',
  },
};

// Steps 1-2 are identical for either variant — only the sample data they end
// up prefilling (set on the emlTour bus below, read by reminders.jsx's
// startAdd) differs by variant. Step 3 onward is where the two diverge.
const REMINDER_TOUR_STEPS_SHARED = [
  // Requires the user to actually click the "+" button themselves (Next
  // stays disabled) — the click isn't just a gate, it's the thing being
  // taught, and it also opens the real add-reminder form pre-filled with
  // the sample's data (see the prefill wiring below).
  {
    sel: '.rem-add-btn', tab: 'today',
    title: 'Create Reminder item',
    body: <>This button is always present on the Today page. It will <b>open the interface</b> for creating a Reminder. Go ahead and click it now.</>,
    primary: 'Next', back: false, requireClick: true,
  },
  {
    sel: '.rem-quickadd input', tab: 'today',
    title: 'Give it a name',
    body: <>This is the name of the reminder and is what will be <b>shown in your todo list on the Today page</b>. We’ve already filled this out for you but feel free to customize it to whatever you’d prefer.</>,
    primary: 'Next', back: true,
  },
];

// The recurring tour's Step 3: all 4 non-"Once" pills of the Repeat
// segmented control, as one combined highlight — scoped to the quick-add
// form specifically (`.seg-btn ~ .seg-btn` matches every pill after the
// first, i.e. every option except "Once", since REPEAT_OPTS in reminders.jsx
// always lists it first). No requireClick: there's no single correct pill to
// click, the prefilled "Weekly" is just a starting point.
const REMINDER_TOUR_STEP_3 = {
  sel: '.rem-quickadd-wrap .seg-btn ~ .seg-btn', tab: 'today',
  title: 'Select recurring schedule',
  body: <>Recurring reminders have multiple options for <b>how often they should show up in your todo list</b>. We’ve already selected "Weekly" for you but feel free to select whichever one you’d prefer.</>,
  primary: 'Next', back: true,
};

// Step 4 highlights whichever schedule control Step 3's pill choice reveals
// below it — same container (`.rem-extra-fade`) regardless of which one that
// is, since reminders.jsx's ReminderEditor only ever renders one at a time.
// Only the copy needs to track the live selection, keyed by REPEAT_OPTS' own
// keys (interval/weekly/monthly/annual — "Once" never reaches this tour).
const REPEAT_STEP_COPY = {
  interval: {
    title: 'Select recurring frequency',
    lead: 'how frequently a recurring reminder will show up in your todo list',
    tail: ', with an additional selector control for the start date.',
    plural: true,
  },
  weekly: {
    title: 'Select day of the week',
    lead: 'which day(s) of the week a recurring reminder will show up in your todo list',
    tail: ' (multiple days may be selected).',
  },
  monthly: {
    title: 'Select day of the month',
    lead: 'which day of the month a recurring reminder will show up in your todo list',
    tail: '.',
  },
  annual: {
    title: 'Select day of the year',
    lead: 'which day of the year a recurring reminder will show up in your todo list',
    tail: '.',
  },
};
// `repeat` is the live draft's current schedule type (published by
// reminders.jsx's startAdd/draftActions onto the emlTour bus) — falls back
// to 'weekly' (the recurring sample's own prefilled default) for the one
// frame before that publish has happened yet.
const buildReminderTourStep4 = (repeat) => {
  const c = REPEAT_STEP_COPY[repeat] || REPEAT_STEP_COPY.weekly;
  return {
    sel: '.rem-quickadd-wrap .rem-extra-fade', tab: 'today',
    title: c.title,
    body: <>This option controls <b>{c.lead}</b>{c.tail} We’ve already made {c.plural ? 'these selections' : 'this selection'} for you but feel free to customize it to whatever you’d prefer.</>,
    primary: 'Next', back: true,
  };
};

// Both tours' closing step: the real "Add" button, requireClick +
// primary:'Done' together mean Next stays disabled and clicking the button
// itself both saves the reminder AND ends the tour (GuidedTour's finish(),
// not just an advance) — see onboarding-tour-runner.jsx's onPrimary. The
// recurring variant gets one extra sentence about the recurrence date.
const buildReminderTourAddStep = (variant) => ({
  sel: '.rem-quickadd-wrap .btn--primary', tab: 'today',
  title: 'Add Reminder item',
  body: variant === 'recurring'
    ? <>We’re all done creating this reminder item. Go ahead and click this button now to <b>add it to your todo list</b>. NOTE: if you selected a day other than today as the recurrence date, then this item will not show up in your todo list until it is due.</>
    : <>We’re all done creating this reminder item. Go ahead and click this button now to <b>add it to your todo list</b>.</>,
  primary: 'Done', back: true, requireClick: true,
});

// `variant` is 'once' or 'recurring'. Every step so far stays on Today, and
// this component is only ever mounted from within TabToday (see
// tab-today.jsx's startMiniTour), so `active`/`selectTab` are hardcoded/
// stubbed rather than threaded all the way up — a future step needing
// another tab would need this lifted the way Onboarding is. Resume-across-
// reload isn't wired up yet either (GuidedTour still persists activeTour for
// free, but nothing reads it back into activeMiniTour on mount) — fine while
// each tour is still short, worth revisiting once there's more to lose.
function ReminderTour({ variant, state, actions, closeReminderForm, onClose }) {
  const copy = REMINDER_TOUR_COPY[variant];
  // Only the recurring tour's Step 4 actually depends on this, but the hook
  // has to run unconditionally either way — harmless to read it up front.
  const bus = useEmlTour();

  const [phase, setPhase] = React.useState('intro');

  // Clears the checklist status and the shared bus's prefill together — the
  // only two bits of state this tour ever touches outside its own local
  // phase. Never touches the sample task itself (see startAdd's comment in
  // reminders.jsx) — only the new draft it seeded gets built from it.
  const closeTour = (status) => {
    emlTour.set({ prefill: null });
    actions.setChecklistItem(copy.taskId, { status });
    onClose();
  };

  if (phase === 'intro') {
    return (
      <TutorialIntroModal
        icon={<Icon name={copy.icon} size={54} />}
        title={copy.title}
        paragraphs={[REMINDER_TOUR_BODY_1, copy.body2]}
        pills={['reminders', 'one-time', 'recurring']}
        onStart={() => {
          // Published before Step 1 even opens the add-reminder form (the
          // user clicks the real "+" themselves) so it's already there for
          // reminders.jsx's startAdd to pick up the moment that happens.
          // Read off the LIVE sample task, not the static OB_TASKS template
          // — the Welcome Tour seeds tk_ob_trash with today's actual weekday
          // (see onboarding.jsx's Step 2 run()), not OB_TASKS' own
          // hardcoded Monday, so the template would prefill the wrong day.
          const sample = (state.tasks || []).find((t) => t.id === copy.taskId)
            || OB_TASKS.find((t) => t.id === copy.taskId);
          // Stays out of the real Today list until every mini-tour is done
          // and the closing Generate step unhides it — reminders.jsx's
          // startAdd applies `hidden: true` generically whenever the
          // checklist is up, not just for tutorial-prefilled ones, so
          // nothing needs to be set here for that.
          emlTour.set({
            prefill: {
              name: sample.name,
              repeat: sample.repeat,
              ...(sample.daysOfWeek ? { daysOfWeek: sample.daysOfWeek } : {}),
              createdFromSample: copy.taskId,
            },
          });
          setPhase('tour');
        }}
        // Mirrors the launcher card's own X button exactly — marks the card
        // cancelled without touching the underlying sample reminder. Never
        // set the prefill yet at this point, so nothing to clear.
        onSkip={() => { actions.setChecklistItem(copy.taskId, { status: 'cancelled' }); onClose(); }}
      />
    );
  }

  const steps = variant === 'recurring'
    ? [...REMINDER_TOUR_STEPS_SHARED, REMINDER_TOUR_STEP_3, buildReminderTourStep4(bus.draftRepeat), buildReminderTourAddStep(variant)]
    : [...REMINDER_TOUR_STEPS_SHARED, buildReminderTourAddStep(variant)];

  return (
    <GuidedTour
      tourId={`reminder-${variant}`}
      steps={steps}
      resumeStep={0}
      actions={actions}
      active="today"
      selectTab={() => {}}
      // Back to Step 1 re-highlights the "+" button, which toggles the add
      // form open/closed — if it's still open from Step 2, leaving it open
      // would make that click close the form instead of reopening it,
      // breaking requireClick's only way forward. Closing it here keeps
      // Step 1's click meaning exactly what it always means: open the form.
      onGoBack={(to) => { if (to === 0) closeReminderForm(); }}
      // Skip discards the in-progress form exactly like its own Cancel
      // button would (closeReminderForm is a no-op if it's not even open —
      // e.g. Skip from Step 1) — a half-created reminder shouldn't survive
      // behind the scenes just because the user backed out via the tour
      // instead of the form itself. Distinct from the intro modal's own
      // Skip, which is 'cancelled' — see onboarding-checklist.js's status
      // comment.
      onSkip={() => { closeReminderForm(); closeTour('skipped'); }}
      // Deliberately does NOT touch the form — this only fires from the Add
      // button's own requireClick (see buildReminderTourAddStep), and the
      // real click that saves the reminder hasn't reached the button's own
      // handler yet at this point (this runs in the capture phase, before
      // it) — closing the form here would discard the save instead of
      // letting it happen. TODO: pass createdId once there's a reason to
      // track it — nothing currently reads a reminder checklist entry's
      // createdId the way finishedPickerCount reads a picker's.
      onFinish={() => closeTour('finished')}
    />
  );
}

export { ReminderTour };
