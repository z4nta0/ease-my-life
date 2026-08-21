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
    body: <>This tutorial will show you <b>how to manually run one of your pickers and send its result straight to your todo list</b>, without waiting for the next automatic generation.</>,
    pills: ['pickers page', 'run a picker', 'manual pick'],
    // Real, user-confirmed estimate (same convention as OB_PAGE_TOURS' own
    // `time` field in onboarding-checklist.js) — only this feature has real
    // step-by-step content built out so far, the rest stay untimed until
    // they do too.
    time: '1 min',
  },
  {
    id: 'feat_edit_item', page: 'data', label: 'Edit your first item',
    title: 'Editing Items',
    body: 'This tutorial will show you how to edit one of your own items. You will be able to update names, weights, or other values whenever your needs change.',
    pills: ['data page', 'edit item', 'update values'],
    // Real, user-confirmed estimate — see feat_manual_pick's own comment
    // on this same convention.
    time: '1 min',
  },
  {
    id: 'feat_run_time', page: 'settings', label: 'Adjust your generator run time',
    title: 'Generator Run Time',
    body: 'This tutorial will show you how to change what time of day your todo list automatically generates, so it is ready exactly when you want it.',
    pills: ['settings page', 'daily generator', 'run time'],
    // Real, user-confirmed estimate — see feat_manual_pick's own comment
    // on this same convention.
    time: '< 1 min',
  },
  {
    id: 'feat_theme', page: 'settings', label: 'Change your app theme',
    title: 'App Theme',
    body: 'This tutorial will show you how to switch between light and dark mode, or customize the app’s colors to your own taste.',
    pills: ['settings page', 'appearance', 'theme'],
    // Real, user-confirmed estimate — see feat_manual_pick's own comment
    // on this same convention.
    time: '< 1 min',
  },
  {
    id: 'feat_celebration', page: 'settings', label: 'Change your celebration animation',
    title: 'Celebration Animation',
    body: 'This tutorial will show you how to change the animation that plays whenever you complete your entire todo list for the day.',
    pills: ['settings page', 'appearance', 'animation'],
    // Real, user-confirmed estimate — see feat_manual_pick's own comment
    // on this same convention.
    time: '< 1 min',
  },
  {
    id: 'feat_pick_anim', page: 'settings', label: 'Change your picker animation',
    title: 'Picker Animation',
    body: 'This tutorial will show you how to change the animation that plays on the Pickers page whenever you manually direct it to select one of its items.',
    pills: ['settings page', 'appearance', 'animation'],
    // Real, user-confirmed estimate — see feat_manual_pick's own comment
    // on this same convention.
    time: '< 1 min',
  },
  {
    id: 'feat_highlights', page: 'today', label: 'Use the highlight feature',
    title: 'Highlight Feature',
    body: 'This tutorial will show you how to use the highlight feature, which lets you tap the info icon on any page to get an on demand explanation of everything on screen.',
    pills: ['help highlights', 'on demand', 'any page'],
    // Real, user-confirmed estimate — see feat_manual_pick's own comment
    // on this same convention.
    time: '< 1 min',
  },
  {
    id: 'feat_protect_data', page: 'settings', label: 'Protect your data / Install the app',
    title: 'Protect Your Data',
    body: 'This tutorial will show you how to protect your data from being deleted by your browser, and to keep your data even more safe, how to install the app.',
    pills: ['settings page', 'data control', 'install app'],
    // Real, user-confirmed estimate — see feat_manual_pick's own comment
    // on this same convention.
    time: '< 1 min',
  },
];

// Steps beyond Step 1 (the shared nav-highlight every App Feature tour
// starts with, built fresh per render below), keyed by feature id — empty/
// absent for any feature that only has Step 1 so far. Mirrors onboarding-
// page-tours.jsx's own buildPageTourSteps (same reasoning: filled in
// incrementally as each tutorial gets its own pass, not all at once). Takes
// `actions` (built fresh per render, like buildPageTourSteps itself) since
// feat_edit_item's own Step 2 needs to call actions.toggleControlsCollapsed
// directly — see that step's own run() comment for why a real click won't do.
const buildAppFeatureSteps = (featureId, actions) => {
  if (featureId === 'feat_manual_pick') {
    return [
      // Title/body copied verbatim from the Pickers page tour's own
      // pickerSelection step. Has to come before Manual Generation below
      // (the user needs to choose WHICH picker before running one) —
      // that's the whole reason this exists: letting the user pick a
      // different picker than whichever one happened to already be
      // active. No requireClick — same as the page tour's own step,
      // selecting a different picker here is purely optional.
      {
        sel: '.picker-tabs .picker-tab:not(.picker-tab--add)', tab: 'picker',
        title: 'Picker Selection',
        body: <>These buttons will <b>allow you to select a specific picker</b> in order to initiate a manual picker generation, as well as edit or delete its items.</>,
        primary: 'Next', back: true,
      },
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
      // advanceWhen this copies (Step 4's own clickSel below). coachAtTop:
      // true — on a short viewport (iPhone SE height, 667px, or shorter)
      // the coach can't fit above .picker-run without overlapping its top
      // edge; pins the coach to safeTop instead, same treatment as Step 5's
      // own fix (see that step's comment for the full reasoning).
      {
        sel: '.picker-run', tab: 'picker',
        title: 'Manual Generation',
        body: <>The "Pick one" button will allow you to <b>run a manual pick generation</b> for any given picker, so that you do not have to completely rely on the todo list's auto generation feature on the Today page. Click the "Pick one" button now to see how this works.</>,
        primary: 'Next', back: true, requireClick: true,
        advanceWhen: '.pv-act--send', coachAtTop: true,
      },
      // Title/body copied verbatim from the Pickers page tour's own
      // addToTodoList step. Still .picker-run, not just the Send to
      // Today button on its own — same combined-box reasoning as Step
      // 3, and .picker-actions (which .picker-run wraps) contains the
      // WHOLE row (Send to Today, Re-roll, AND Done), so this highlights
      // all three together (the picker window itself staying highlighted
      // the whole time, same element as Step 3). clickSel narrows the
      // actual click-guard/requireClick target down to Send to Today
      // specifically — only that click satisfies this step, matching the
      // page tour's own behavior exactly. Re-roll is a deliberate
      // exception, unlike the page tour (which disables it outright via
      // tab-picker.jsx's tourInterceptSend): clickPassThroughSel lets it
      // reach its own real handler — a genuine re-roll, own animation —
      // WITHOUT also satisfying requireClick, so the user can re-roll as
      // many times as they like before eventually sending. Done stays
      // blocked (tab-picker.jsx's own tourDisableDone, gated on this
      // exact tourId+step) since leaving would discard the pick AND
      // make this step's own target — the done/sent view itself —
      // vanish, reverting to the pre-pick "Pick one" button Step 3
      // already moved past. advanceDelay: Send to Today swaps its own
      // label to "Sent!" for a beat (see tab-picker.jsx's sendToToday)
      // before reverting — finishing immediately would cut that
      // confirmation off before the user ever sees it. coachAtTop: true —
      // same short-viewport overlap as Step 3 (same .picker-run target,
      // now even taller with the result + all three action buttons showing)
      // — see that step's own comment for the full reasoning.
      {
        sel: '.picker-run', clickSel: '.pv-act--send', clickPassThroughSel: '.pv-act--reroll', tab: 'picker',
        title: 'Add to Todo List',
        body: <>The "Send to Today" button will <b>add the manually generated pick to your todo list on the Today page</b>. Go ahead and click the "Send to Today" button now to give it a try.</>,
        primary: 'Next', back: true, requireClick: true,
        advanceDelay: 1600, coachAtTop: true,
      },
      // Title/body copied (lightly reworded) from the Pickers page tour's
      // own pickerItems step. Same target (.pool-items, excludes "+ Add
      // item" — see that step's own comment in onboarding-page-tours.jsx),
      // but unlike the page tour (which disables ALL THREE per-item
      // buttons via tab-picker.jsx's disablePoolItemButtons), only Edit and
      // Delete stay narrated-not-usable here (disablePoolEditDelete, a
      // separate flag gated on this exact tourId+step) — Send to Today
      // stays genuinely usable, since it's real data and a second valid way
      // to land a pick besides Manual Generation above. No requireClick:
      // Send to Today is optional here, same "stays usable but doesn't
      // gate advancing" treatment as Re-roll in the previous step — clicking
      // anywhere inside .pool-items (including Send to Today) is already
      // "on target" for the click-guard, so no clickPassThroughSel is
      // needed the way Re-roll required one. coachAtTop: true — on a short
      // viewport (e.g. iPhone SE) a pool of even a few real items is tall
      // enough that the coach can't fit either above or below it without
      // overlapping; pins the coach to safeTop and lets the pool run off
      // the bottom instead, same tall-target treatment as the Data tour's
      // own .data-list step and every Settings section — see coachAtTop's
      // own doc comment in onboarding-tour-runner.jsx.
      {
        sel: '.pool-items', tab: 'picker',
        title: 'Picker Items',
        body: <>Here you can <b>view all items in this picker's pool</b>. You can see a given item's values, if applicable, as well as the <b>Send to Today, Edit and Delete buttons</b>. The "Edit" and "Delete" buttons are disabled for this tutorial but feel free to try the "Send to Today" button on any item now. This concludes the Make your first manual pick tutorial, click Done when you are ready.</>,
        primary: 'Done', back: true, coachAtTop: true,
      },
    ];
  }
  if (featureId === 'feat_edit_item') {
    return [
      // Highlights .data-list — same target as the Data page tour's own
      // pickersManager step (DATA_PAGE_TARGETS in onboarding-page-
      // tours.jsx) — ALL of the user's real pickers, not one specific
      // picker, since which one they choose to edit is up to them.
      // clickSel narrows the actual click-guard/requireClick target down
      // to .cat-h-l (each picker's own collapsible header button) — any
      // one of them expanding satisfies this step, matching "click on one
      // of the pickers headers" per the user's own framing, not just a
      // specific picker's. coachAtTop: true — .data-list can be far taller
      // than the viewport once the user has more than a couple pickers,
      // same "pin the coach to the top, let the list run off the bottom"
      // treatment as the Data page tour's own equivalent step (see that
      // step's own comment) and every other tall-target step in this app
      // — see coachAtTop's own doc comment in onboarding-tour-runner.jsx.
      {
        sel: '.data-list', clickSel: '.cat-h-l', tab: 'data',
        title: 'Your Pickers',
        body: <>This is where you can <b>view and edit all of your pickers</b>, as well as their items. Click on any picker's header now to expand it and continue.</>,
        primary: 'Next', back: true, requireClick: true, coachAtTop: true,
        // Controls/Items default OPEN the first time a picker's own section
        // expands (absent === not-collapsed, see tab-data.jsx's own
        // collapsedMap comment) — same "clean, uncluttered" requirement as
        // the pickers themselves (collapseAllPickers above), one level
        // deeper. Can't just read state/DOM synchronously here: this run()
        // fires from the tour's own CAPTURE-phase click listener, which —
        // being capture, not bubble — always runs BEFORE the header's own
        // React onClick (toggleControlsCollapsed) actually applies (see
        // onClickCapture's own comment in onboarding-tour-runner.jsx), so
        // at this exact instant the clicked picker's section hasn't
        // actually opened yet, in state OR the DOM. Polled via rAF (bounded
        // to ~20 frames), driven off the live DOM (this closure's own
        // `state` would be just as stale by the time it fires) — the
        // picker's OWN outer Collapse mounts its .cat-body content (and
        // thus these two buttons) on a SECOND render cycle after `open`
        // first flips true (see Collapse's own render/useEffect split in
        // ui.jsx), so a single synchronous check would too often find
        // nothing yet. Scoped to .data-list specifically (NOT Conditionals/
        // Reminders above it, which share this same .rd-ctl class for
        // their own Controls/Items — see help-content.jsx's own scoped
        // selectors for the same distinction). Calls
        // actions.toggleControlsCollapsed directly (using the picker's own
        // data-picker-id, added to .cat in tab-data.jsx for exactly this)
        // rather than a real .click() on the header: Step 3 below now
        // requires clicking that SAME Controls header to finish the
        // tutorial, and a synthetic click fired this late (well after
        // `step` has already advanced past this one, and after
        // suppressGuardRef has already reset) would be indistinguishable
        // from the user's own real click — collapsing Controls here would
        // immediately satisfy Step 3's requireClick and finish the tour
        // before the user ever saw it. A direct action call carries no
        // such risk; it never touches the click-guard at all.
        run: () => {
          let tries = 0;
          const tryCollapse = () => {
            const openHeader = document.querySelector('.data-list .cat-h-l[aria-expanded="true"]');
            const cat = openHeader && openHeader.closest('.cat');
            const pickerId = cat && cat.dataset.pickerId;
            const btns = cat ? [...cat.querySelectorAll('.rd-ctl')] : [];
            if ((!pickerId || btns.length < 2) && tries++ < 20) { requestAnimationFrame(tryCollapse); return; }
            if (!pickerId) return;
            if (btns[0] && btns[0].getAttribute('aria-expanded') === 'true') actions.toggleControlsCollapsed(pickerId + ':controls');
            if (btns[1] && btns[1].getAttribute('aria-expanded') === 'true') actions.toggleControlsCollapsed(pickerId + ':items');
          };
          requestAnimationFrame(tryCollapse);
        },
      },
      // sel highlights the WHOLE expanded picker's own .cat section (header
      // + its collapsed Controls/Items rows) — keeps the user oriented on
      // WHICH picker this is, same "highlight the bigger box, narrow the
      // click" reasoning as the manual-pick tour's own Add to Todo List
      // step (.picker-run + .pv-act--send). :has() scopes to whichever
      // picker is currently expanded specifically — unlike .cat-body's
      // content, the outer .cat <section>/header render for EVERY picker
      // unconditionally, so a bare .data-list > .cat would highlight every
      // picker's header at once. clickSel then narrows the actual
      // click-guard/requireClick target down to the Controls header alone
      // (same selector help-content.jsx's own dataPickerControlsHeader
      // entry uses) — doubling as a safety net: clicking the picker's own
      // header (inside sel but outside clickSel) is silently blocked by
      // the guard instead of collapsing the section and losing this step's
      // target out from under the user.
      {
        sel: '.data-list > .cat:has(.cat-h-l[aria-expanded="true"])',
        clickSel: '.data-list > .cat .cat-body > button.rd-ctl:nth-of-type(1)', tab: 'data',
        title: 'Controls Section',
        body: <>This is where you can <b>view and edit a picker's Controls</b>. This includes its name, group, type, and other settings. Click on the Controls header now to advance this tutorial.</>,
        primary: 'Next', back: true, requireClick: true,
      },
      // Same sel as Step 3 — still the whole picker box, now with Controls
      // ITSELF expanded (the previous step's own click), so the box has
      // grown to include all of PickerControls' real fields. No clickSel
      // this time: every click inside stays genuinely usable (name/group/
      // type fields, weight steppers, the works) — "explore and do
      // whatever you want" is the point. The only two things still guarded
      // are the picker's own header and the Items header, both via real
      // `disabled` props in tab-data.jsx (disableEditTourToggles) rather
      // than the click-guard, since collapsing either would pull this
      // step's own target out from under the user mid-step. coachAtTop:
      // true — Controls' real field set is easily taller than a short
      // viewport can fit alongside the coach, same "pin coach to top, let
      // the section run off the bottom" treatment as the manual-pick
      // tour's own tall-target steps — see coachAtTop's own doc comment in
      // onboarding-tour-runner.jsx.
      {
        sel: '.data-list > .cat:has(.cat-h-l[aria-expanded="true"])', tab: 'data',
        title: 'Edit Picker Settings',
        body: <>Feel free to <b>explore this section and make any changes you'd like</b> to the picker's name, group, type, or other settings. Click Next when you are ready to advance this tutorial.</>,
        primary: 'Next', back: true, coachAtTop: true,
        // Re-collapses Controls on the way to Step 5, same "clean slate"
        // requirement as Step 2's own run() — Step 5 highlights this same
        // picker box again and needs Controls collapsed for it to look
        // uncluttered, same reasoning as Step 3 originally needing it
        // collapsed. Controls is already mounted here (unlike Step 2's own
        // case, which had to poll for it), so no async wait is needed —
        // just a direct actions.toggleControlsCollapsed call, guarded on
        // aria-expanded so this is a no-op if the user already collapsed
        // it themselves while exploring.
        run: () => {
          const btn = document.querySelector('.data-list > .cat .cat-body > button.rd-ctl:nth-of-type(1)');
          const cat = btn && btn.closest('.cat');
          const pickerId = cat && cat.dataset.pickerId;
          if (pickerId && btn.getAttribute('aria-expanded') === 'true') actions.toggleControlsCollapsed(pickerId + ':controls');
        },
      },
      // Same shape as Step 3 (Controls Section), mirrored for Items:
      // clickSel narrows to the Items header specifically (:nth-of-
      // type(2)) instead of Controls. Controls itself was just
      // re-collapsed by Step 4's own outgoing run() above, so the
      // highlighted box (same whole-picker sel as Steps 3/4) reads clean
      // again rather than showing Controls still expanded alongside it.
      {
        sel: '.data-list > .cat:has(.cat-h-l[aria-expanded="true"])',
        clickSel: '.data-list > .cat .cat-body > button.rd-ctl:nth-of-type(2)', tab: 'data',
        title: 'Items Section',
        body: <>This is where you can <b>view and edit a picker's Items</b>. This includes each item's name, weight, and other values. Click on the Items header now to advance this tutorial.</>,
        primary: 'Next', back: true, requireClick: true,
      },
      // Same whole-picker sel as Steps 3-5, now with Items expanded (Step
      // 5's own click). clickSel narrows to any item row — same selector
      // help-content.jsx's own dataItemRow entry uses (.data-list .rd-item
      // > .rd-row) — so clicking ANY one of them satisfies this step, not
      // just a specific item. The "+ Add new item" button (.rd-add, same
      // scoped selector as help-content.jsx's own dataAddItem) is
      // disabled for this and the next step (disableEditTourAddItem in
      // tab-data.jsx) — narrating that it exists is the point, not
      // inviting a brand-new item mid-tutorial. coachAtTop: true — the
      // item list's own height is unpredictable (depends how many items
      // this picker has), same reasoning as every other "explore" step's
      // own coachAtTop.
      {
        sel: '.data-list > .cat:has(.cat-h-l[aria-expanded="true"])',
        clickSel: '.data-list .rd-item > .rd-row', tab: 'data',
        title: 'Picker Items',
        body: <>This section contains <b>all of this picker's items</b>, as well as a form for adding new items (though this is disabled for this tutorial). Click any one of the items to advance this tutorial.</>,
        primary: 'Next', back: true, requireClick: true, coachAtTop: true,
      },
      // Same shape as Step 4 (Edit Picker Settings), mirrored for Items:
      // free exploration, no clickSel, the clicked item already expanded
      // by Step 6's own real click. Last step of this tutorial — primary
      // 'Done', no outgoing run() needed since nothing comes after it to
      // keep clean for. coachAtTop: true — an item list can run just as
      // tall as Controls' own field set once a picker has more than a
      // couple items, same reasoning as Step 4's own coachAtTop.
      {
        sel: '.data-list > .cat:has(.cat-h-l[aria-expanded="true"])', tab: 'data',
        title: 'Edit Item Settings',
        body: <>Feel free to <b>explore this section and make any changes you'd like</b> to an item's name, weight, or other values. Go ahead and click Done when you are ready to finish this tutorial.</>,
        primary: 'Done', back: true, coachAtTop: true,
      },
    ];
  }
  if (featureId === 'feat_run_time') {
    return [
      // Body copied verbatim from the Settings page tour's own daily
      // target (SETTINGS_PAGE_TARGETS in onboarding-page-tours.jsx) — same
      // section, same explanation. Title given its own, more specific
      // wording rather than reusing that tour's plain "Daily Generator"
      // verbatim. coachAtTop: true — matches every section step in that
      // same tour, since .set-section--daily can run taller than the
      // viewport just like the others.
      {
        sel: '.set-section--daily', tab: 'settings',
        title: 'Daily Generator Settings',
        body: <>This is where you can <b>control the daily generator</b>: turn auto generation on or off, what time it runs, and enabling notifications for when it does. Click Done when you are ready to finish this tutorial.</>,
        primary: 'Done', back: true, coachAtTop: true,
      },
    ];
  }
  if (featureId === 'feat_theme') {
    return [
      // .set-subsection--systempref — a new modifier class added to
      // tab-settings.jsx for exactly this (previously bare .set-subsection,
      // ambiguous against its own siblings: --celebration/--pickanim/
      // --layout further down the same Appearance section). coachAtTop:
      // true — same reasoning as every other Settings section step in
      // this app: content can easily run taller than the viewport.
      {
        sel: '.set-subsection--systempref', tab: 'settings',
        title: 'System Preferences Toggle',
        body: <>This lets Ease My Life <b>automatically switch between your light and dark theme</b> based on your device's own system setting. Click Next when you are ready to advance this tutorial.</>,
        primary: 'Next', back: true, coachAtTop: true,
      },
      // .set-subsection--theme-light — already its own modifier class in
      // ThemeSection (tab-settings.jsx), no changes needed there.
      {
        sel: '.set-subsection--theme-light', tab: 'settings',
        title: 'Light Theme Settings',
        body: <>This is where you can <b>pick a light based theme</b>, or create your own custom one. Click Next when you are ready to advance this tutorial.</>,
        primary: 'Next', back: true, coachAtTop: true,
      },
      {
        sel: '.set-subsection--theme-dark', tab: 'settings',
        title: 'Dark Theme Settings',
        body: <>This is where you can <b>pick a dark based theme</b>, or create your own custom one. Click Done when you are ready to finish this tutorial.</>,
        primary: 'Done', back: true, coachAtTop: true,
      },
    ];
  }
  if (featureId === 'feat_celebration') {
    return [
      // .set-subsection--celebration — already its own modifier class in
      // tab-settings.jsx's Appearance section, no changes needed there.
      {
        sel: '.set-subsection--celebration', tab: 'settings',
        title: 'Completion Celebration',
        body: <>This is where you can <b>pick which animation plays</b> whenever you complete your entire todo list for the day. Click Done when you are ready to finish this tutorial.</>,
        primary: 'Done', back: true, coachAtTop: true,
      },
    ];
  }
  if (featureId === 'feat_pick_anim') {
    return [
      // .set-subsection--pickanim — already its own modifier class in
      // tab-settings.jsx's Appearance section, no changes needed there.
      // Same shape as feat_celebration's own Step 2 just above.
      {
        sel: '.set-subsection--pickanim', tab: 'settings',
        title: 'Picker Animation',
        body: <>This is where you can <b>pick which animation plays</b> whenever you manually direct a picker to select an item on the Pickers page. Click Done when you are ready to finish this tutorial.</>,
        primary: 'Done', back: true, coachAtTop: true,
      },
    ];
  }
  if (featureId === 'feat_highlights') {
    // Unlike every other feature, this one does NOT use the shared
    // buildPageTourStep1 nav-click (see AppFeatureTour's own steps prop
    // below, which skips prepending it for this featureId specifically):
    // the whole point is the help-highlight toggle itself (.help-btn,
    // help-mode.jsx), which already sits in the CURRENT page's own header
    // — there's nothing to navigate to first. Both steps target the exact
    // same element (it never moves), so the highlight/coach position stays
    // pinned across the Step 1 -> Step 2 transition, only the body copy
    // changes.
    return [
      {
        sel: '.help-btn', tab: 'today',
        title: 'Highlights Feature',
        body: <>This is the highlight button that <b>can be found in the top right corner of every page</b>. Click this button now to advance the tutorial.</>,
        primary: 'Next', back: false, requireClick: true,
      },
      {
        sel: '.help-btn', tab: 'today',
        title: 'Highlights Feature',
        body: <><b>Important elements on the page are highlighted</b>, each with their own button that will bring up a tooltip with more information. Click this button again to turn the feature off and finish this tutorial.</>,
        primary: 'Done', back: true, requireClick: true,
      },
    ];
  }
  if (featureId === 'feat_protect_data') {
    return [
      // .set-protect-btn — new modifier class on the "Protect data" Btn in
      // tab-settings.jsx (only rendered while !stor.persisted — same
      // condition already gating the real button).
      {
        sel: '.set-protect-btn', tab: 'settings',
        title: 'Protect Your Data',
        body: <>This button helps <b>protect your data from being cleared by your browser's own storage cleanup</b>. Click it now to advance this tutorial.</>,
        primary: 'Next', back: true, requireClick: true, coachAtTop: true,
      },
      // Comma-separated fallback (see findTargets' own comma-splitting in
      // onboarding-tour-runner.jsx) — .set-install-btn (new modifier class,
      // only rendered when canInstall) is tried first; if this browser
      // can't offer a real install prompt, falls back to .set-store-ios
      // (shared by all of tab-settings.jsx's own browser-specific
      // instructional blocks — iOS, Mac, or the generic "not available
      // here" note — exactly one of which renders at a time), so this
      // targets whichever one actually applies without needing to know
      // which browser it's running in. No requireClick — Done is enabled
      // outright, last step of this tutorial.
      {
        sel: '.set-install-btn, .set-store-ios', tab: 'settings',
        title: 'Install the App',
        body: <>Installing the app to your device is <b>the best way to protect your data</b>, and gives you a more native, app-like experience. If a direct install isn't available in your browser, instructions for how to install it are shown here instead. Click Done when you are ready to finish this tutorial.</>,
        primary: 'Done', back: true, coachAtTop: true,
      },
    ];
  }
  return [];
};

// "Make your first manual pick" needs a real target to run the tour against:
// a real (non-hidden), non-sample picker with at least 2 items. 2, not 1 —
// Step 4's own copy invites a Re-roll ("give it a try"), and with a single
// item Re-roll would deterministically return the same result every time,
// making that invitation pointless. Unlike the checklist's own amber "needs
// attention" cue on the Create-a-picker cards (which are always runnable,
// just flagged as unfinished — see onboarding-checklist.js's
// realPickerCount), this actually blocks the card: there's no partial tour
// to offer without a real picker to run one on. No other App Feature has a
// requirement yet, so this stays a one-off check rather than a generic
// per-feature schema field.
function appFeatureBlockedReason(featureId, state) {
  if (featureId !== 'feat_manual_pick') return null;
  const items = state.items || [];
  const eligible = (state.pickers || []).some((p) => !p.hidden
    && items.filter((i) => i.pickerId === p.id).length >= 2);
  return eligible ? null : 'Create a picker with at least 2 items first, then come back to try this.';
}

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
        icon={featureId === 'feat_highlights'
          ? <span className="ob-wmark-help">i</span>
          : <Icon name={feature.page} size={54} />}
        title={feature.title}
        paragraphs={[feature.body]}
        pills={feature.pills}
        onStart={() => setPhase('tour')}
        onSkip={() => closeTour('cancelled')}
      />
    );
  }

  const extraSteps = buildAppFeatureSteps(featureId, actions);
  // "Edit your first item" wants a clean, all-collapsed Data page the
  // moment it lands there — any picker the user happened to leave expanded
  // from a previous visit would otherwise make Step 2's "click a header to
  // expand" instruction confusing (that picker's already open). Runs as
  // Step 1's own `run()`, which fires at the exact moment its real nav
  // click transitions into Step 2 (see onPrimary's own comment in
  // onboarding-tour-runner.jsx) — toggleControlsCollapsed only ever FLIPS,
  // so this only touches pickers actually found expanded (=== false),
  // rather than blindly toggling every picker and accidentally re-opening
  // ones that were already collapsed.
  const collapseAllPickers = () => {
    const collapsed = (state.ui && state.ui.controlsCollapsed) || {};
    state.pickers.forEach((p) => { if (collapsed[p.id] === false) actions.toggleControlsCollapsed(p.id, true); });
  };
  return (
    <GuidedTour
      tourId={`appfeature-${featureId}`}
      steps={featureId === 'feat_highlights' ? extraSteps : [
        // Same Step 1 every page tour uses (see its own comment) — 'Done'
        // when this is still the only step, 'Next' once extraSteps exist.
        buildPageTourStep1(feature.page, featureId === 'feat_edit_item' ? collapseAllPickers : undefined, extraSteps.length ? 'Next' : 'Done'),
        ...extraSteps,
      ]}
      resumeStep={resumable ? resumable.step : 0}
      actions={actions}
      active={active}
      selectTab={selectTab}
      // Back from Step 3 (Controls and Items, index 2) to Step 2 (Your
      // Pickers, index 1) — undoes whichever picker section(s) got
      // expanded, restoring the same all-collapsed slate Step 2 originally
      // expects. Without this, expanding Picker A, reaching Step 3, going
      // Back, then expanding Picker B (without A ever closing — clicking a
      // DIFFERENT picker's header doesn't auto-collapse others) leaves BOTH
      // open: Step 3's own .rd-ctl selector would then match both pickers'
      // Controls/Items together, and its own collapse-on-entry run() (see
      // Step 2's own comment) only ever finds the FIRST one in DOM order,
      // silently leaving the actually-just-clicked one still expanded.
      // Clicking each real header (not a direct store call) is the same
      // toggle the user would trigger themselves, consistent with every
      // other DOM-driven run()/onGoBack in this file.
      onGoBack={featureId === 'feat_edit_item' ? (to) => {
        if (to === 1) {
          [...document.querySelectorAll('.data-list .cat-h-l[aria-expanded="true"]')].forEach((h) => h.click());
        } else if (to === 2) {
          // Back from Step 4 (Explore Controls, index 3) to Step 3
          // (Controls Section, index 2) — re-collapses Controls, undoing
          // Step 3's own real click that expanded it. Restores Step 3's
          // own expected starting state (Controls collapsed, requireClick
          // still to satisfy) instead of landing back on a step whose
          // target looks already-done. A real click, not a direct action
          // call like Step 2's run() above needs — no async DOM-mount wait
          // required here (Controls is already mounted, just needs
          // toggling shut), and onGoBack itself runs fully synchronously
          // before `step` advances (see goBack's own comment in
          // onboarding-tour-runner.jsx), so there's no risk of this click
          // landing after the click-guard has already moved on, unlike the
          // run() case.
          const btn = document.querySelector('.data-list > .cat .cat-body > button.rd-ctl:nth-of-type(1)[aria-expanded="true"]');
          if (btn) btn.click();
        } else if (to === 3) {
          // Back from Step 5 (Items Section, index 4) to Step 4 (Explore
          // Controls, index 3) — re-expands Controls, undoing Step 4's own
          // outgoing run() (which collapses it on the way to Step 5) so
          // Step 4's own "explore Controls" description matches what's on
          // screen again, same reasoning as the to===2 case above but one
          // section over.
          const btn = document.querySelector('.data-list > .cat .cat-body > button.rd-ctl:nth-of-type(1)[aria-expanded="false"]');
          if (btn) btn.click();
        } else if (to === 4) {
          // Back from Step 6 (Picker Items, index 5) to Step 5 (Items
          // Section, index 4) — re-collapses Items, undoing Step 5's own
          // real click that expanded it, same reasoning as the to===2
          // case above but for Items instead of Controls. Can't use a
          // real click here the way to===2/3 do: the Items header is
          // itself disabled during Step 6 (disableEditTourItemsToggle in
          // tab-data.jsx, guarding it so it can't be collapsed out from
          // under Step 6's own item-row target) — onGoBack fires BEFORE
          // `step` advances (see goBack's own comment in onboarding-tour-
          // runner.jsx), so tab-data.jsx's own tour.step read from the bus
          // is still 5 at this exact instant, meaning a native .click()
          // on a disabled button would silently no-op. A direct action
          // call bypasses the disabled attribute entirely — same
          // pickerId-via-data-attribute lookup Step 2's own run() uses.
          const cat = document.querySelector('.data-list > .cat:has(.cat-h-l[aria-expanded="true"])');
          const pickerId = cat && cat.dataset.pickerId;
          const itemsBtn = cat && cat.querySelector('.cat-body > button.rd-ctl:nth-of-type(2)');
          if (pickerId && itemsBtn && itemsBtn.getAttribute('aria-expanded') === 'true') actions.toggleControlsCollapsed(pickerId + ':items');
        } else if (to === 5) {
          // Back from Step 7 (Edit Item Settings, index 6) to Step 6
          // (Picker Items, index 5) — re-collapses whichever item got
          // expanded (Step 6's own click, or the user opening a different
          // one while freely exploring during Step 7), so Step 6's own
          // requireClick can be satisfied again instead of landing on an
          // item that's already open. Individual items toggle via local
          // component state (openItemId in tab-data.jsx), not
          // toggleControlsCollapsed — but the SAME "click it again to
          // close it" mechanism still applies, so a real click still
          // works here exactly like every other case in this handler.
          const btn = document.querySelector('.data-list .rd-item > .rd-row[aria-expanded="true"]');
          if (btn) btn.click();
        }
      } : undefined}
      onFinish={() => closeTour('finished')}
      onSkip={() => closeTour('skipped')}
    />
  );
}

// "One Last Thing..." — a single, standalone tip shown exactly once, right
// after the closing checklist's own generate() call actually finishes,
// pointing at the freshly-appeared App Features section. NOT a per-feature
// tutorial like AppFeatureTour above (no intro modal, no per-feature id) —
// a single `solo` GuidedTour step (see that flag's own doc comment in
// onboarding-tour-runner.jsx: hides the step counter and Skip/Back, one
// full-width "Dismiss" button). Mounted directly from TabToday rather than
// lifted to app.jsx like AppFeatureTour/PageTour/PickerTour are: unlike
// those, this never navigates to another tab (the whole point is the
// section already on screen), so it doesn't need real cross-tab selectTab/
// active plumbing — active="today"/a no-op selectTab is enough, the same
// pattern PageTour itself used before Pickers/Stats/Data/Settings tours
// needed it to actually leave Today.
function AppFeaturesIntroTip({ actions }) {
  return (
    <GuidedTour
      tourId="appfeatures-intro"
      steps={[{
        sel: '.af-section', tab: 'today',
        title: 'One Last Thing...',
        body: <>Here are some more tutorials that will let you interact with your real, live data as well adjust some of the app's settings. You are all set up and ready to go. <b>Have fun and enjoy your new eased life!</b></>,
        primary: 'Dismiss', solo: true, coachAtTop: true,
      }]}
      resumeStep={0}
      actions={actions}
      active="today"
      selectTab={() => {}}
      onFinish={() => actions.setOnboarding({ appFeaturesIntroSeen: true })}
      onSkip={() => actions.setOnboarding({ appFeaturesIntroSeen: true })}
    />
  );
}

export { AppFeatureTour, appFeatureBlockedReason, AppFeaturesIntroTip };
