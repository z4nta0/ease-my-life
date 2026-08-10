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
  // Scoped to the Reminders section specifically (.rem-section, its own
  // distinguishing class — every OTHER group section shares plain
  // .group-section) since .group-grip itself isn't unique: one renders per
  // section once editMode is on (see reminders.jsx's ReminderSection and
  // tab-today.jsx's GroupHeader, which share this exact class/aria-label).
  groupGrip: {
    sel: '.rem-section .group-grip',
    title: 'Movable Icon',
    body: <>This will allow to <b>move an entire group section to a different position in the todo list</b>. Just click or press on it, hold it and move it up or down. You can try it yourself now or click Next if you are ready to move on.</>,
  },
  // Reminders has no rename feature (its own header is a plain, non-
  // editable <h2> — see reminders.jsx), so this targets Page Tours instead:
  // it's rendered through the same GroupHeader component as a real picker
  // group (rename included), and — unlike any actual picker group — is
  // guaranteed to exist the moment this tour is reachable at all, since
  // both live under the same mini-tour checklist. A real picker group
  // (e.g. "Chores") would only exist once the user has already finished a
  // picker tutorial first, which this tour can't assume.
  renameGroup: {
    sel: '.group-name-input',
    title: 'Rename Group',
    body: <>This will alow you to change a group’s name. You can go ahead and try it yourself, but once you exit this tutorial the changes will be reverted. You can still change them afterwards if you’d like. This concludes the Today page tutorial, click Done when you are ready.</>,
  },
};

// The Page Tours group's real name at the moment Step 5 (below) opens its
// rename input — captured off the rename button's own aria-label ("Rename
// group {name}") before it disappears behind the input. Lets both Step 6's
// Done and a Back from Step 6 reset the input to a genuine no-op edit
// (draft === name) rather than an actual rename, without needing this
// module to otherwise know the live app state (PageTour itself is only
// ever passed `actions`, not `state`).
let lastPageToursName = 'Page Tours';

// Resets the rename input back to its real name and blurs it — a NO-OP
// commit (see tab-today.jsx's GroupHeader: commit() only calls
// onRenameGroup when draft differs from the name prop), so this discards
// whatever was typed without touching Edit Mode itself. Deliberately NOT
// Escape: GroupHeader's own Escape handling is exactly this (see its
// cancel()), but a real Escape keydown also bubbles to tab-today.jsx's
// OWN global window listener, which exits Edit Mode entirely — fine for
// Step 6's own Done (see its run() below, which wants that anyway) but
// wrong for a Back to Step 5, which needs Edit Mode to stay on.
const resetRenameInput = () => {
  const input = document.querySelector('.group-name-input');
  if (!input) return;
  input.value = lastPageToursName;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.blur();
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
    {
      ...TODAY_PAGE_TARGETS.groupGrip, tab: 'today', primary: 'Next', back: true,
      // Stages the next step's target: a real click into Page Tours' own
      // rename control (same real-UI-driving pattern used throughout the
      // Picker/Reminder tours), so its input already exists once Step 6
      // mounts. Fires on advancing OUT of this step, not into it — see
      // onPrimary's own comment in onboarding-tour-runner.jsx. Explicit
      // focus alongside the input's own autoFocus — belt-and-suspenders,
      // since the click driving it here is synthetic (this run(), not a
      // direct user click on the rename button itself). Deferred a frame
      // so it fires after the click's own re-render has actually mounted
      // the input.
      run: () => {
        const btn = document.querySelector('button.group-name--editable[aria-label="Rename group Page Tours"]');
        if (btn) {
          lastPageToursName = (btn.getAttribute('aria-label') || '').replace(/^Rename group /, '') || 'Page Tours';
          btn.click();
        }
        requestAnimationFrame(() => {
          const input = document.querySelector('.group-name-input');
          if (input) input.focus();
        });
      },
    },
    {
      ...TODAY_PAGE_TARGETS.renameGroup, tab: 'today', primary: 'Done', back: true,
      // Discards any typed rename (see resetRenameInput above), then exits
      // Edit Mode via its real Cancel control — present regardless of
      // viewport, unlike the desktop/mobile-specific one Step 4's own
      // onGoBack has to branch on — reverting any group reordering from
      // Step 5 too, before the tour itself navigates away.
      run: () => {
        resetRenameInput();
        const cancelBtn = document.querySelector('.editmode-banner-actions .btn--ghost');
        if (cancelBtn) cancelBtn.click();
      },
    },
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
      // Edit Mode (Today's Step 4, index 3) is a one-way real-UI transition,
      // same class of problem as the Picker tour's own onGoBack: its target
      // (.foot-editmode on mobile) only exists in the DOM while editMode is
      // off, and the step's own real click (required to reach Step 5) flips
      // it on. Reverse it via the real toggle/Cancel control so a Back from
      // Step 5 finds Step 4's target again — .em-rail-btn (desktop) always
      // exists and toggles itself regardless of state; the mobile footer
      // swaps to Cancel/Done buttons instead of keeping .foot-editmode, so
      // Cancel (.btn--ghost) is the equivalent control there.
      onGoBack={(to) => {
        if (pageId !== 'explore_today') return;
        if (to === 3) {
          const btn = document.querySelector('.em-rail-btn.is-on') || document.querySelector('.today-foot-actions .btn--ghost');
          if (btn) btn.click();
        } else if (to === 4) {
          // Back from Step 6 (Rename Group) to Step 5 — discards the
          // in-progress rename WITHOUT exiting Edit Mode (unlike Step 6's
          // own Done, which wants both) — see resetRenameInput's own
          // comment for why this can't just be an Escape keydown.
          resetRenameInput();
        }
      }}
      onSkip={() => closeTour('skipped')}
      onFinish={() => closeTour('finished')}
    />
  );
}

export { PageTour };
