import React from 'react';
import { Icon } from './ui.jsx';
import { TutorialIntroModal } from './onboarding-intro-modal.jsx';
import { GuidedTour } from './onboarding-tour-runner.jsx';
import { OB_NAV_TARGETS } from './onboarding-targets.jsx';
import { OB_PAGE_TOURS } from './onboarding-checklist.js';
import { OB_EXAMPLE, OB_EXTRA_PICKERS } from './onboarding-seed-data.js';
import { emlTour } from './onboarding.jsx';

// Page tours ("Explore the {page}" — Today/Pickers/Stats/Data/Settings) are
// still growing in from an intro-only stub — Today is the only one with real
// steps beyond this so far. Falls back to OB_NAV_TARGETS' own per-page
// title/body (already written to stand alone, with no reference to "this
// tour" or "the next step" baked in — see that file's own comment) for any
// page PAGE_TOUR_COPY below hasn't gotten its own dedicated pass yet.
const PAGE_TOUR_COPY = {
  explore_today: {
    title: 'Today Page',
    body: 'This tutorial will take you on a quick tour of the Today page, in order to highlight important elements and functionality.',
    pills: ['page tour', 'today page', 'todo list'],
  },
  explore_pickers: {
    title: 'Pickers Page',
    body: 'This tutorial will take you on a quick tour of the Pickers page, in order to highlight important elements and functionality.',
    pills: ['page tour', 'pickers page', 'new pickers'],
  },
  explore_stats: {
    title: 'Stats Page',
    body: 'This tutorial will take you on a quick tour of the Stats page, in order to highlight important elements and functionality.',
    pills: ['page tour', 'stats page', 'picker statistics'],
  },
  explore_data: {
    title: 'Data Page',
    body: 'This tutorial will take you on a quick tour of the Data page, in order to highlight important elements and functionality.',
    pills: ['page tour', 'data page', 'edit pickers'],
  },
  explore_settings: {
    title: 'Settings Page',
    body: 'This tutorial will take you on a quick tour of the Settings page, in order to highlight important elements and functionality.',
    pills: ['page tour', 'settings page', 'app customization'],
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
const buildPageTourStep1 = (page, run) => {
  const nav = OB_NAV_TARGETS[page];
  return {
    ...nav,
    body: <>{nav.body} Go ahead and click it now.</>,
    tab: 'today',
    primary: 'Next', back: false, requireClick: true,
    ...(run ? { run } : {}),
  };
};

// The Pickers tour needs real pickers on screen to point at (the group
// filter row below doesn't even render with fewer than 2 groups), but
// reusing the Welcome Tour's own hidden sample pickers directly — the same
// ones the Today mini-tour launcher cards and Replay Tour depend on — would
// let the user's own interaction here (deleting one, editing an item, etc.)
// corrupt that shared reference data. Seeded as full COPIES instead, under
// their own `pt_`-prefixed ids (never colliding with the real
// `pkr_ob_*`/`it_ob_*` ones), and cleaned up again the moment this tour
// ends (see clearPickerTourPickers) — real, interactive, but disposable.
const PICKER_TOUR_SAMPLE_PICKERS = [OB_EXAMPLE, ...OB_EXTRA_PICKERS];
const pickerTourCopyId = (id) => `pt_${id}`;

// Fired from Step 1's run() (see PageTour below) — between the nav click
// and Step 2 ever mounting, same "prepare what the NEXT step needs" timing
// already used elsewhere in this file (e.g. Today's Step 5 staging Step
// 6's rename input). Guarded by existence so navigating back to Step 1 and
// forward again (re-firing this run()) can't create duplicate-id pickers.
const seedPickerTourPickers = (state, actions) => {
  PICKER_TOUR_SAMPLE_PICKERS.forEach((p) => {
    const copyId = pickerTourCopyId(p.id);
    if (state.pickers.some((x) => x.id === copyId)) return;
    // Items keep their own name/weight/ease fields but drop their `id` —
    // passing the real sample's item ids through would collide with the
    // real hidden picker's own items in `state.items`.
    actions.addPicker({
      id: copyId, name: p.name, group: p.group, mode: p.mode,
      items: p.items.map(({ id, ...rest }) => rest),
    });
  });
};

// Discards the copies made above — called whenever this tour ends (Skip or
// Done), so they never linger as clutter in the user's real picker list.
// Harmless no-op for any copy that was never actually seeded (e.g. Skip
// from the intro modal, before Step 1's run() ever fires).
const clearPickerTourPickers = (actions) => {
  PICKER_TOUR_SAMPLE_PICKERS.forEach((p) => actions.removePicker(pickerTourCopyId(p.id)));
};

// Target + description catalog for the Pickers page's OWN interior elements
// — same shape/reasoning as TODAY_PAGE_TARGETS below.
const PICKER_PAGE_TARGETS = {
  // The pills specifically, not their .picker-groups container — that
  // container stretches to the FULL width of its row (.stat-filter-row's
  // own align-items: stretch), well past the pills' own content width, so
  // highlighting it left a big undimmed gap of empty background after the
  // last visible pill.
  groupFilter: {
    sel: '.picker-groups .picker-group-pill',
    title: 'Group Filter',
    body: <>This will allow you to <b>filter the pickers row below by their group</b>, which is extremely useful if you have created a lot of pickers. Feel free to select one now or click Next to advance to the next step.</>,
  },
  // Excludes the trailing "Add new picker" button — Step 4 (below) covers
  // that on its own, and this step's own copy is entirely about selecting
  // an EXISTING picker.
  pickerSelection: {
    sel: '.picker-tabs .picker-tab:not(.picker-tab--add)',
    title: 'Picker Selection',
    body: <>This will allow you to <b>select a specific picker</b>, in order to initiate a manual picker generation down below as well as edit or delete its items. Feel free to select one now or click Next to advance to the next step.</>,
  },
  createNewPickers: {
    sel: '.picker-tab--add',
    title: 'Create New Pickers',
    body: <>This is where you can <b>create new pickers</b>. We will not include this as part of the tutorial, but if you want to learn more then please do any one of the picker tutorials after this is finished. Click Next when you are ready to move on.</>,
  },
  // .picker-run is a purely structural wrapper (tab-picker.jsx) around
  // .picker-stage + .picker-actions — added specifically so this step can
  // highlight both as one combined box without also catching the header/
  // pool above and below (the two aren't adjacent-enough on their own for
  // a single selector, and findTargets' comma syntax means "fallback", not
  // "union" — see its own comment in onboarding-tour-runner.jsx).
  manualGeneration: {
    sel: '.picker-run',
    title: 'Manual Generation',
    body: <>This will allow to <b>run a manual pick generation</b> for any given picker, so that you do not have to completely rely on the todo list's auto generation feature on the Today page. Click the Pick one button now to see how this works.</>,
  },
  // Only rendered once phase is 'done'/'sent' — i.e. after the PREVIOUS
  // step's own Pick one click resolves. tab-picker.jsx's own
  // tourInterceptSend (gated on this exact tourId+step) skips the real
  // actions.addTodayEntry while this step is up, so the Sent! animation
  // plays without actually landing an entry on Today.
  addToTodoList: {
    sel: '.pv-act--send',
    title: 'Add to Todo List',
    body: <>This will <b>add the manually generated pick to your todo list on the Today page</b>. Go ahead and click this button now to give it a try.</>,
  },
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
    // The <ul> specifically, not the whole .group-rail aside — on desktop
    // (a vertical sidebar) that aside also contains .rail-editmode's own
    // Edit Mode button below the group list, and highlighting the whole
    // container would spotlight that button right alongside the group
    // buttons this step is actually about, reading as if Edit Mode were
    // part of the list navigation. Mobile's .group-rail is a horizontal
    // pill row with Edit Mode surfaced separately in the footer instead, so
    // this scoping is a no-op difference there — same highlight either way.
    sel: '.group-rail ul',
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
    sel: '.pt-section .group-name-input',
    title: 'Rename Group',
    body: <>This will allow you to <b>change a group’s name</b>. You can go ahead and try it yourself, but once you exit this tutorial the changes will be reverted. You can still change them afterwards if you’d like. This concludes the Today page tutorial, click Done when you are ready.</>,
  },
};

// The Page Tours group's real name at the moment Step 5 (below) opens its
// rename input — captured off the rename button's own aria-label ("Rename
// group {name}") before it disappears behind the input. Lets a Back from
// Step 6 reset the input to a genuine no-op edit (draft === name) rather
// than an actual rename, without needing this module to otherwise know the
// live app state (PageTour itself is only ever passed `actions`, not
// `state`).
let lastPageToursName = 'Page Tours';

// Discards a typed rename WITHOUT exiting Edit Mode — used only for a Back
// to Step 5, which needs Edit Mode to stay on (Step 6's own Done doesn't
// need this at all; see its run() below for why). Resets the input's value
// back to its real name first so the blur that follows reads as a NO-OP
// commit (see tab-today.jsx's GroupHeader: commit() only calls
// onRenameGroup when draft differs from the name prop) instead of an actual
// rename. Deliberately NOT Escape: GroupHeader's own Escape handling is
// exactly this (see its cancel()), but a real Escape keydown also bubbles
// to tab-today.jsx's OWN global window listener, which exits Edit Mode
// entirely.
//
// The blur is deferred a frame — NOT a cosmetic choice. Dispatching the
// reset 'input' event calls React's onChange (setDraft) synchronously, but
// that only SCHEDULES the re-render; draft's actual value inside the
// ALREADY-DEFINED commit() closure doesn't update until React re-renders.
// Calling blur() in the same tick invokes that same (stale) commit() —
// reading the pre-reset, still-typed draft — and genuinely renames the
// group for real. This is not hypothetical: it's exactly how an earlier
// version of this function (calling blur() synchronously right after
// dispatch) shipped and broke — Done appeared to discard the rename but
// actually committed it, then Step 5's own run() on the next tour run
// could never find "Rename group Page Tours" again since the group's real
// name no longer matched.
const cancelRenameKeepEditMode = () => {
  const input = document.querySelector('.pt-section .group-name-input');
  if (!input) return;
  input.value = lastPageToursName;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  requestAnimationFrame(() => input.blur());
};

// Forces the real Page Tours name back — used wherever a click (Done, Back,
// Skip) might have blurred a still-open, typed-in rename input a tick
// earlier (see each call site's own comment for that race). Deferred a
// full 200ms, NOT just a frame: GroupHeader's own blur-triggered commit()
// doesn't call onRenameGroup synchronously either — it defers to its OWN
// setTimeout(…, 150) (the closing-animation delay in finishClose) — so
// calling this immediately would fire BEFORE that delayed commit and get
// overwritten right back to the typed value 150ms later. 200ms leaves a
// safety margin past it.
const forceRealPageToursName = (actions) => {
  setTimeout(() => actions.renamePageTours(lastPageToursName), 200);
};

// Steps beyond Step 1 (the nav-highlight every page tour shares), keyed by
// page tour id — empty/absent for any page that only has Step 1 so far.
// Advancing past the last step in here falls through GuidedTour's own "ran
// off the end" safety net into onSkip, same as every other mini-tour
// behaved before its own final Done step existed. A function of `actions`
// (built fresh per render, like buildPageTourStep1), not a static object —
// Step 6's own Done needs to call actions.renamePageTours directly (see its
// own comment below).
const buildPageTourSteps = (pageId, actions) => {
  if (pageId === 'explore_pickers') {
    return [
      { ...PICKER_PAGE_TARGETS.groupFilter, tab: 'picker', primary: 'Next', back: true },
      {
        ...PICKER_PAGE_TARGETS.pickerSelection, tab: 'picker', primary: 'Next', back: true,
        // Stages Step 4's own target: .picker-tabs scrolls horizontally
        // (the engine's own bring()/getScroller only ever handle VERTICAL
        // scrolling, so the Add button — last in the row — needs its own
        // reveal here), same "prepare what the NEXT step needs" timing used
        // elsewhere in this file. Already-in-view is a harmless no-op.
        run: () => {
          const btn = document.querySelector('.picker-tab--add');
          if (btn) btn.scrollIntoView({ inline: 'end', block: 'nearest' });
        },
      },
      {
        ...PICKER_PAGE_TARGETS.createNewPickers, tab: 'picker', primary: 'Next', back: true,
      },
      {
        ...PICKER_PAGE_TARGETS.manualGeneration, tab: 'picker', primary: 'Next', back: true, requireClick: true,
        // Pick one kicks off the multi-second spin animation — its result
        // (Step 6's own target) isn't ready the instant the click fires.
        // Stay on THIS step's own already-resolved coach/highlight for the
        // whole wait instead of advancing into a blank "not found yet" dim
        // — see advanceWhen's own doc comment in onboarding-tour-runner.jsx.
        advanceWhen: PICKER_PAGE_TARGETS.addToTodoList.sel,
      },
      { ...PICKER_PAGE_TARGETS.addToTodoList, tab: 'picker', primary: 'Next', back: true, requireClick: true },
    ];
  }
  if (pageId !== 'explore_today') return [];
  return [
    { ...TODAY_PAGE_TARGETS.progressRing, tab: 'today', primary: 'Next', back: true },
    { ...TODAY_PAGE_TARGETS.groupsNav, tab: 'today', primary: 'Next', back: true },
    { ...TODAY_PAGE_TARGETS.editMode, tab: 'today', primary: 'Next', back: true, requireClick: true },
    {
      ...TODAY_PAGE_TARGETS.groupGrip, tab: 'today', primary: 'Next', back: true,
      // Edit Mode is local, unpersisted UI state (tab-today.jsx's own
      // useState, not part of `state`) — a reload always lands back with it
      // off, so this step's target (only rendered while Edit Mode is on)
      // wouldn't exist to resume into. Not resumable — see that field's own
      // doc comment in onboarding-tour-runner.jsx; a reload mid this step or
      // Step 6 falls back to Step 4 (Edit Mode's own toggle), which is
      // always safe to land on.
      resumable: false,
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
      //
      // Found via .pt-section (see tab-today.jsx), not by matching the
      // aria-label's current name text — a user who's already renamed Page
      // Tours themselves, entirely outside any tour, would otherwise make
      // this selector (and the whole rest of the step) silently never
      // match again.
      run: () => {
        const btn = document.querySelector('.pt-section button.group-name--editable');
        if (btn) {
          lastPageToursName = (btn.getAttribute('aria-label') || '').replace(/^Rename group /, '') || 'Page Tours';
          btn.click();
        }
        requestAnimationFrame(() => {
          const input = document.querySelector('.pt-section .group-name-input');
          if (input) input.focus({ preventScroll: true });
        });
      },
    },
    {
      ...TODAY_PAGE_TARGETS.renameGroup, tab: 'today', primary: 'Done', back: true,
      // Same as Step 5's own resumable:false — this step's target depends on
      // BOTH Edit Mode being on AND Step 5's run() having already clicked
      // the rename button open, neither of which survives a reload.
      resumable: false,
      // Edit Mode's own real Cancel control discards any group reordering
      // from Step 5 AND closes the rename input — GroupHeader force-closes
      // `editing` the instant editMode itself goes false (see its own
      // effect), without ever going through the input's own commit().
      //
      // That's still not enough on its own, though: clicking this step's
      // Done button (a totally different element) blurs the currently-
      // focused rename input FIRST — as an intrinsic part of the click's
      // own focus-change handling, which happens before React's onClick
      // (and therefore this run()) ever fires — and that blur's own
      // commit() genuinely renames the group for real if the user typed
      // something, exactly like the earlier reset-and-blur race, just
      // triggered by a click on a DIFFERENT element instead of this step's
      // own code. There's no way to intercept that ordering from here, so
      // this doesn't try to — it just forces the real name back
      // afterward, directly, via the same action a real rename commit
      // would have called. A harmless no-op if nothing was ever typed.
      run: () => {
        const cancelBtn = document.querySelector('.editmode-banner-actions .btn--ghost');
        if (cancelBtn) cancelBtn.click();
        forceRealPageToursName(actions);
      },
    },
  ];
};

function PageTour({ pageId, state, actions, active, selectTab, onClose }) {
  const tour = OB_PAGE_TOURS.find((t) => t.id === pageId);
  const nav = OB_NAV_TARGETS[tour.page];
  const copy = PAGE_TOUR_COPY[pageId];
  // A reload lands here with tab-today.jsx's activeMiniTour already
  // re-derived from this SAME persisted activeTour (that's how this
  // component gets (re)mounted for this pageId at all) — re-reading it here
  // just decides whether to skip the intro modal and which (resumable) step
  // to land on. Same pattern as ReminderTour/PickerTour's own `resumable`.
  const ob = state.onboarding || {};
  const resumable = ob.activeTour && ob.activeTour.id === `page-${pageId}` ? ob.activeTour : null;
  const [phase, setPhase] = React.useState(resumable ? 'tour' : 'intro');

  const closeTour = (status) => {
    // Discard the Pickers tour's own disposable sample copies (see their
    // own comment) the moment this tour ends, however it ends — a harmless
    // no-op if Step 1's run() never got the chance to seed them.
    if (pageId === 'explore_pickers') clearPickerTourPickers(actions);
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
      steps={[
        buildPageTourStep1(tour.page, pageId === 'explore_pickers' ? () => seedPickerTourPickers(state, actions) : undefined),
        ...buildPageTourSteps(pageId, actions),
      ]}
      resumeStep={resumable ? resumable.step : 0}
      actions={actions}
      active={active}
      selectTab={selectTab}
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
        if (pageId === 'explore_pickers') {
          // Back from Step 4 (Create New Pickers) to Step 3 (Picker
          // Selection) — undoes Step 3's own run(), which scrolled
          // .picker-tabs horizontally to reveal the Add button. Left
          // scrolled, Step 3's own target (every OTHER tab in the row,
          // excluding Add) could include tabs now scrolled out of view on
          // the opposite side, stretching its highlight across the gap.
          if (to === 2) {
            const row = document.querySelector('.picker-tabs');
            if (row) row.scrollTo({ left: 0 });
          } else if (to === 4) {
            // Back from Step 6 (Add to Todo List) to Step 5 (Manual
            // Generation) — a pick already ran, so PickerView's own local
            // phase is still 'done'/'sent', showing Send to Today/Re-roll/
            // Done instead of Pick one. Step 5's own requireClick target is
            // .picker-run (the whole stage + actions box, not just the Pick
            // one button specifically — see its own comment), so those
            // buttons being there at all means the user can trigger them
            // from a step that was never written to expect it: Re-roll
            // silently re-runs the pick behind the scenes (advanceWhen just
            // waits for it, reading as a multi-second hang) and Done clears
            // the result with no re-run, so advanceWhen's poll never finds
            // its target again and the tour sits stuck forever. Resetting
            // PickerView back to its own idle state — via a bus nonce, since
            // phase/result are local state this module has no other way to
            // reach — means only Pick one ever shows here, matching what
            // this step actually expects and forecloses both failure modes
            // by construction instead of specifically patching either one.
            emlTour.set({ pickerTourResetNonce: (emlTour.get().pickerTourResetNonce || 0) + 1 });
          }
          return;
        }
        if (pageId !== 'explore_today') return;
        if (to === 3) {
          const btn = document.querySelector('.em-rail-btn.is-on') || document.querySelector('.today-foot-actions .btn--ghost');
          if (btn) btn.click();
        } else if (to === 4) {
          // Back from Step 6 (Rename Group) to Step 5 — discards the
          // in-progress rename WITHOUT exiting Edit Mode (unlike Step 6's
          // own Done, which wants both) — see cancelRenameKeepEditMode's
          // own comment for why this can't just be an Escape keydown.
          cancelRenameKeepEditMode();
          // Same blur-races-the-click risk as Step 6's own Done (see its
          // run() comment) — clicking Back is ALSO a click on a different
          // element than the input, which can blur-and-commit a real
          // rename before onGoBack even runs. Same fix: force the real
          // name back directly afterward, regardless of what the DOM did.
          forceRealPageToursName(actions);
        }
      }}
      // Skip can fire from Step 4 or 5 too, mid-Edit-Mode — exits it via
      // the same real Cancel control (a harmless no-op if Edit Mode was
      // never entered, since the banner/button won't exist), reverting any
      // reorder from Step 5. If Step 6's rename input is specifically open,
      // also forces the real name back first — same blur-races-the-click
      // risk as Step 6's own Done (see its run() comment): clicking Skip
      // is ALSO a click on a different element than the input.
      onSkip={() => {
        if (document.querySelector('.pt-section .group-name-input')) {
          forceRealPageToursName(actions);
        }
        const cancelBtn = document.querySelector('.editmode-banner-actions .btn--ghost');
        if (cancelBtn) cancelBtn.click();
        closeTour('skipped');
      }}
      onFinish={() => closeTour('finished')}
    />
  );
}

export { PageTour };
