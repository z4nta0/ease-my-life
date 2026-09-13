



// #region Imports

import React from 'react'; // What: React. Why: This file's own AppFeatureTour and AppFeaturesIntroTip components need React in scope to compile their JSX and to call React.useState/React.useEffect. How: This is used directly (React.useState, React.useEffect) below, instead of importing individual named hooks.


import { buildPageTourStep1 } from './onboarding-page-tours.jsx';  // What: Build Page Tour Step 1. Why: Every App Feature tour reuses this exact shared Step 1, the real nav-button highlight, as its own opening step. How: This is called inside AppFeatureTour below, passed this feature's own page, an optional run side effect, and a primary button label.
import { GuidedTour         } from './onboarding-tour-runner.jsx'; // What: Guided Tour. Why: This is the generic spotlight-tour engine that actually drives each App Feature tutorial once its own intro modal is accepted. How: This is rendered while touPhaStr is 'tour', passed this file's own per-feature step array.
import { Icon                } from './ui.jsx';                    // What: Icon. Why: The intro modal needs a recognizable glyph matching the current feature's own page. How: This is rendered inside the intro modal's icon prop below.
import { TutorialIntroModal } from './onboarding-intro-modal.jsx'; // What: Tutorial Intro Modal. Why: Each App Feature tutorial opens on this generic intro modal before any spotlight step ever shows. How: This is rendered while touPhaStr is 'intro', passed this feature's own icon/title/paragraphs/pills.

// #endregion Imports



/**
 * onboarding-app-features.jsx = Onboarding App Features
 *
 * @summary
 * App Features, a SEPARATE, later-stage set of mini-tours shown on Today only
 * once the user has generated their first real todo list (see tab-today.jsx's
 * showAppFeatures), pinned as the LAST group on the page, below Reminders,
 * Page Tours (mutually exclusive with these anyway, see showAppFeatures' own
 * comment) and every real picker group. Unlike every earlier onboarding tour,
 * these operate on the user's own REAL data rather than disposable samples:
 * there is always at least one real picker by this point (see onboarding-
 * checklist.js's readyToGenerate gate), and these are deliberately NOT tracked
 * by the checklist "engine" at all: no doneCount/total ring or streak
 * participation, no closing Generate-style card, no counting toward anything.
 * Resolved state lives in its own state.onboarding.appFeatures map (see
 * store.jsx's setAppFeatureItem), reset to {} whenever Replay Tour is clicked
 * in Settings so these reappear alongside it (see tab-settings.jsx's own
 * replay button).
 *
 * Content here is a first-pass STUB, same as every page tour in onboarding-
 * page-tours.jsx started as (see that file's own PAGE_TOUR_COPY header
 * comment): one step per feature (highlight the real nav button for whichever
 * page it lives on, reusing NAV_TAR_OBJ the same way buildPageTourStep1 does),
 * not yet the full walkthrough. Copy, pills, and order are a first draft per
 * the user's own dictated list, expect an editing pass.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



/**
 * APP_FEATURE_PAGE_LABELS = App Feature Page Labels
 *
 * @summary
 * Display label per `page` id, the same 5 tabs as app.jsx's own TABS array,
 * which isn't exported, so this stays self-contained rather than reaching into
 * that file for it. Used for the launcher card's own kicker text (see tab-
 * today.jsx's AppFeatureCard): the page each feature's icon/nav-click step
 * belongs to.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const APP_FEATURE_PAGE_LABELS = { // What: App Feature Page Labels. Why: tab-today.jsx's own AppFeatureCard reads this by a feature's own page id for its kicker text. How: This is looked up by APP_FEATURES entries' own page field wherever this file or tab-today.jsx needs the real tab's display name.


	today    : 'Today',    // What: Today Label. Why: This names the Today tab for any feature whose own page is 'today'. How: This is read back as APP_FEATURE_PAGE_LABELS.today.
	picker   : 'Pickers',  // What: Pickers Label. Why: This names the Pickers tab for any feature whose own page is 'picker'. How: This is read back as APP_FEATURE_PAGE_LABELS.picker.
	stats    : 'Stats',    // What: Stats Label. Why: This names the Stats tab for any feature whose own page is 'stats'. How: This is read back as APP_FEATURE_PAGE_LABELS.stats.
	data     : 'Data',     // What: Data Label. Why: This names the Data tab for any feature whose own page is 'data'. How: This is read back as APP_FEATURE_PAGE_LABELS.data.
	settings : 'Settings'  // What: Settings Label. Why: This names the Settings tab for any feature whose own page is 'settings'. How: This is read back as APP_FEATURE_PAGE_LABELS.settings.


};



/**
 * APP_FEATURES = App Features
 *
 * @summary
 * The ordered catalog of every App Feature tutorial: its own id (keys
 * state.onboarding.appFeatures and this tour's own GuidedTour tourId), which
 * real page it lives on, the launcher card's own label, the intro modal's own
 * title/body/pills, and an optional time estimate. id/page/label/time are
 * read directly by tab-today.jsx's own AppFeatureCard and progress counters,
 * so these property names stay exactly as written rather than following the
 * usual 6-character object-property convention.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const APP_FEATURES = [


	{


		id    : 'feat_manual_pick',                     // What: Id. Why: This uniquely identifies this feature, keying state.onboarding.appFeatures and this tour's own GuidedTour tourId. How: AppFeatureTour below searches APP_FEATURES for the entry whose own id matches its own featureId prop.
		page  : 'picker',                               // What: Page. Why: This says which real nav tab this feature's own Step 1 highlights. How: buildPageTourStep1 below reads this to find the matching NAV_TAR_OBJ entry.
		label : 'Make your first manual pick',           // What: Label. Why: The launcher card on Today needs this feature's own visible title. How: tab-today.jsx renders this directly as the card's own name.
		title : 'Manual Picks',                          // What: Title. Why: The intro modal needs a heading naming this tutorial. How: This is rendered as TutorialIntroModal's own title prop.
		body  : <>This tutorial will show you <b>how to manually run one of your pickers and send its result straight to your todo list</b>, without waiting for the next automatic generation.</>, // What: Body. Why: The intro modal needs a plain description of what this tutorial covers. How: This is rendered as the sole entry of TutorialIntroModal's own paragraphs prop.
		pills : [ 'pickers page', 'run a picker', 'manual pick' ], // What: Pills. Why: The intro modal's own pill row needs 3 short tags describing this tutorial. How: This is rendered as TutorialIntroModal's own pills prop.

		// Real, user-confirmed estimate (same convention as OB_PAGE_TOURS' own time field in onboarding-checklist.js). Only this feature has real step-by-step content built out so far, the rest stay untimed until they do too.
		time  : '1 min' // What: Time. Why: The launcher card shows this next to its label when present. How: tab-today.jsx renders feature.time directly whenever it's truthy.


	},

	{


		id    : 'feat_edit_item',
		page  : 'data',
		label : 'Edit your first item',
		title : 'Editing Items',
		body  : <>This tutorial will show you <b>how to edit one of your own items</b>. You will be able to update names, weights, or other values whenever your needs change.</>,
		pills : [ 'data page', 'edit item', 'update values' ],

		// Real, user-confirmed estimate, see feat_manual_pick's own comment on this same convention.
		time  : '1 min'


	},

	{


		id    : 'feat_run_time',
		page  : 'settings',
		label : 'Adjust your generator run time',
		title : 'Generator Run Time',
		body  : <>This tutorial will show you <b>how to change what time of day your todo list automatically generates</b>, so it is ready exactly when you want it.</>,
		pills : [ 'settings page', 'daily generator', 'run time' ],

		// Real, user-confirmed estimate, see feat_manual_pick's own comment on this same convention.
		time  : '< 1 min'


	},

	{


		id    : 'feat_theme',
		page  : 'settings',
		label : 'Change your app theme',
		title : 'App Theme',
		body  : <>This tutorial will show you <b>how to switch between light and dark mode</b>, or customize the app’s colors to your own taste.</>,
		pills : [ 'settings page', 'appearance', 'theme' ],

		// Real, user-confirmed estimate, see feat_manual_pick's own comment on this same convention.
		time  : '< 1 min'


	},

	{


		id    : 'feat_celebration',
		page  : 'settings',
		label : 'Change your celebration animation',
		title : 'Celebration Animation',
		body  : <>This tutorial will show you <b>how to change the animation that plays whenever you complete your entire todo list</b> for the day.</>,
		pills : [ 'settings page', 'appearance', 'animation' ],

		// Real, user-confirmed estimate, see feat_manual_pick's own comment on this same convention.
		time  : '< 1 min'


	},

	{


		id    : 'feat_pick_anim',
		page  : 'settings',
		label : 'Change your picker animation',
		title : 'Picker Animation',
		body  : <>This tutorial will show you <b>how to change the animation that plays on the Pickers page</b> whenever you manually direct it to select one of its items.</>,
		pills : [ 'settings page', 'appearance', 'animation' ],

		// Real, user-confirmed estimate, see feat_manual_pick's own comment on this same convention.
		time  : '< 1 min'


	},

	{


		id    : 'feat_highlights',
		page  : 'today',
		label : 'Use the highlight feature',
		title : 'Highlight Feature',
		body  : <>This tutorial will show you <b>how to use the highlight feature</b>, which lets you tap the info icon on any page to get an on demand explanation of everything on screen.</>,
		pills : [ 'help highlights', 'on demand', 'any page' ],

		// Real, user-confirmed estimate, see feat_manual_pick's own comment on this same convention.
		time  : '< 1 min'


	},

	{


		id    : 'feat_protect_data',
		page  : 'settings',
		label : 'Protect your data / Install the app',
		title : 'Protect Your Data',
		body  : <>This tutorial will show you <b>how to protect your data from being deleted by your browser</b>, and to keep your data even more safe, how to install the app.</>,
		pills : [ 'settings page', 'data control', 'install app' ],

		// Real, user-confirmed estimate, see feat_manual_pick's own comment on this same convention.
		time  : '< 1 min'


	}


];



/**
 * bldSteFun = Build Step Function
 *
 * @summary
 * Steps beyond Step 1 (the shared nav-highlight every App Feature tour starts
 * with, built fresh per render below), keyed by feature id, empty/absent for
 * any feature that only has Step 1 so far. Mirrors onboarding-page-tours.jsx's
 * own bldSteFun (same reasoning: filled in incrementally as each tutorial gets
 * its own pass, not all at once). Takes actions (built fresh per render, like
 * that file's own bldSteFun) since feat_edit_item's own Step 2 needs to call
 * actions.toggleControlsCollapsed directly, see that step's own run() comment
 * for why a real click won't do.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const bldSteFun = ( feaIdeStr, actions, alrProBoo ) => { // What: Build Step Function. Why: AppFeatureTour below needs this feature's own full ordered step array beyond Step 1. How: This branches on feaIdeStr, returning that feature's own real step array, or an empty array for any feature that only has Step 1 so far.


	if ( feaIdeStr === 'feat_manual_pick' ) { // What: Manual Pick Branch Check. Why: The manual-pick tour's own steps only apply to this one feature. How: This returns its own step array whenever feaIdeStr matches.


		return [ // What: Manual Pick Tour Steps Return. Why: The caller needs this feature tour's own full ordered step array beyond Step 1. How: This returns the manual-pick tour's own remaining steps, each carrying its own selector/copy/navigation fields.

			// Title/body copied verbatim from the Pickers page tour's own pickerSelection step. Has to come before Manual Generation below (the user needs to choose WHICH picker before running one): that's the whole reason this exists, letting the user pick a different picker than whichever one happened to already be active. No requireClick, same as the page tour's own step, selecting a different picker here is purely optional.
			{


				sel     : '.picker-tabs .picker-tab:not(.picker-tab--add)', // What: Selector String. Why: This step highlights every existing picker's own tab. How: GuidedTour spotlights whatever this selector matches.
				tab     : 'picker',                                        // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
				title   : 'Picker Selection',                              // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.
				body    : <>These buttons will <b>allow you to select a specific picker</b> in order to initiate a manual picker generation, as well as edit or delete its items.</>, // What: Body Element. Why: This step's own coach card needs a plain description of what these buttons do. How: GuidedTour renders this as the step's own descriptive paragraph.
				primary : 'Next',                                         // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuidedTour renders this as the button's own visible text.
				back    : true                                            // What: Back Boolean. Why: The user should always be able to return to Step 1's own nav highlight. How: GuidedTour shows its own Back button whenever this is true.


			}, // What: Picker Selection Step. Why: This is the manual-pick tour's own 2nd step. How: This lets the user choose a different picker than whichever one was already active before Manual Generation below.

			// Title/body copied verbatim from the Pickers page tour's own manualGeneration step (PICKER_PAGE_TARGETS in onboarding-page-tours.jsx), same functionality, same explanation, same two-phase highlight: before the click, .pv-act--pick:not(.is-busy) matches the idle "Pick One" button, so the pulse (.ob-spot.is-pulsing) lands tight on the actual button instead of the whole window. .is-busy (added the instant the click fires, well before the spin finishes) excludes that first selector immediately on click, so the fallback to framing .picker-run (which wraps the picker's stage + actions as one combined box) kicks in right as the spin starts, not once it ends. clickSel keeps the requireClick guard scoped to the button specifically even once the fallback is in play. pulseSel matches the exact same primary alternative as sel, there's nothing left to click once the highlight has widened to frame the window, so the pulse stops there too. No scrollToTop/Bottom override, the default pad-based bring() already smooth-scrolls it into view. advanceWhen (not an immediate advance): Pick One kicks off a multi-second spin animation, so stay on THIS step's already-resolved coach for the whole wait, same reasoning as the page tour's own step, whose advanceWhen this copies (Step 4's own clickSel below). coachAtTop: true, on a short viewport (iPhone SE height, 667px, or shorter) the coach can't fit above .picker-run without overlapping its top edge, pins the coach to safeTop instead, same treatment as Step 5's own fix (see that step's comment for the full reasoning).
			{


				sel         : '.pv-act--pick:not(.is-busy), .picker-run', // What: Selector String. Why: This step highlights the idle Pick One button, falling back to framing the whole stage once it goes busy. How: GuidedTour spotlights the first alternative that matches.
				clickSel    : '.pv-act--pick',                           // What: Click Selector String. Why: The requireClick guard must stay scoped to the button specifically even once the fallback widens the highlight. How: This is read by the click-guard/requireClick logic separately from sel.
				pulseSel    : '.pv-act--pick:not(.is-busy)',             // What: Pulse Selector String. Why: There is nothing left to click once the highlight has widened to frame the window, so the pulse should stop there too. How: This matches the same primary alternative as sel.
				tab         : 'picker',                                  // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
				title       : 'Manual Generation',                      // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.
				body        : <>The "Pick One" button will allow you to <b>run a manual pick generation</b> for any given picker, so that you do not have to completely rely on the todo list's auto generation feature on the Today page. Click the "Pick One" button now to see how this works.</>, // What: Body Element. Why: This step's own coach card needs a plain description plus an explicit click instruction. How: GuidedTour renders this as the step's own descriptive paragraph.
				primary     : 'Next',                                   // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuidedTour renders this as the button's own visible text.
				back        : true,                                     // What: Back Boolean. Why: The user should always be able to return to Picker Selection. How: GuidedTour shows its own Back button whenever this is true.
				requireClick : true,                                    // What: Require Click Boolean. Why: The click itself is the thing being taught, not just a gate. How: GuidedTour disables Next and only advances once the real target is clicked.
				advanceWhen : '.pv-act--send',                          // What: Advance When String. Why: Pick One kicks off a multi-second spin animation, so this step must hold until the pick actually resolves. How: GuidedTour polls for this selector before advancing past this step.
				coachAtTop  : true                                      // What: Coach At Top Boolean. Why: A short viewport (iPhone SE height or shorter) can't fit the coach above .picker-run without overlapping it. How: GuidedTour skips its own reserve-space math and pins the coach card to the top instead.


			}, // What: Manual Generation Step. Why: This is the manual-pick tour's own 3rd step, the real Pick One button. How: This spends the whole spin animation on this step's own already-resolved coach, only advancing once the send button actually appears.

			// Title/body copied verbatim from the Pickers page tour's own addToTodoList step, same two-phase highlight too: before the click, .pv-act--send:not(.is-sent) matches the real Send to Today button, so the pulse lands tight on it instead of the whole window. Clicking it flips phase to 'sent' SYNCHRONOUSLY (see sendToToday in tab-picker.jsx), which adds .is-sent immediately, so the fallback to framing .picker-run kicks in right on click, needed since this step's own advanceDelay (below) holds the tour here for 1600ms after the click so the "Sent!" label swap + stage checkmark can play out, and the highlight needs to have already widened to frame that whole confirmation rather than staying pinned to a single button mid-animation. pulseSel matches the exact same primary alternative as sel, same reasoning as the previous step. clickSel narrows the actual click-guard/requireClick target down to Send to Today specifically, only that click satisfies this step, matching the page tour's own behavior exactly. Re-roll is a deliberate exception, unlike the page tour (which disables it outright via tab-picker.jsx's tourInterceptSend): clickPassThroughSel lets it reach its own real handler, a genuine re-roll, own animation, WITHOUT also satisfying requireClick, so the user can re-roll as many times as they like before eventually sending. Done stays blocked (tab-picker.jsx's own tourDisableDone, gated on this exact tourId+step) since leaving would discard the pick AND make this step's own target, the done/sent view itself, vanish, reverting to the pre-pick "Pick One" button the previous step already moved past. coachAtTop: true, same short-viewport overlap as the previous step (same .picker-run target, now even taller with the result + all three action buttons showing), see that step's own comment for the full reasoning.
			{


				sel                : '.pv-act--send:not(.is-sent), .picker-run', // What: Selector String. Why: This step highlights the real Send to Today button, falling back to framing the whole stage once it's sent. How: GuidedTour spotlights the first alternative that matches.
				clickSel           : '.pv-act--send',                          // What: Click Selector String. Why: The requireClick guard must stay scoped to Send to Today specifically. How: This is read by the click-guard/requireClick logic separately from sel.
				clickPassThroughSel : '.pv-act--reroll',                       // What: Click Pass Through Selector String. Why: Re-roll must stay genuinely usable without also satisfying requireClick, so the user can re-roll as many times as they like before sending. How: A click matching this selector reaches its own real handler without advancing this step.
				pulseSel           : '.pv-act--send:not(.is-sent)',            // What: Pulse Selector String. Why: There is nothing left to click once the highlight has widened to frame the window, so the pulse should stop there too. How: This matches the same primary alternative as sel.
				tab                : 'picker',                                // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
				title              : 'Add to Todo List',                     // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.
				body               : <>The "Send to Today" button will <b>add the manually generated pick to your todo list on the Today page</b>. Go ahead and click the "Send to Today" button now to give it a try.</>, // What: Body Element. Why: This step's own coach card needs a plain description plus an explicit click instruction. How: GuidedTour renders this as the step's own descriptive paragraph.
				primary            : 'Next',                                  // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuidedTour renders this as the button's own visible text.
				back               : true,                                    // What: Back Boolean. Why: The user should always be able to return to Manual Generation. How: GuidedTour shows its own Back button whenever this is true.
				requireClick       : true,                                    // What: Require Click Boolean. Why: The click itself is the thing being taught, not just a gate. How: GuidedTour disables Next and only advances once the real target is clicked.
				advanceDelay       : 1600,                                    // What: Advance Delay Number. Why: The "Sent!" confirmation must be visible before this step advances. How: GuidedTour waits this many milliseconds after the click before advancing.
				coachAtTop         : true                                     // What: Coach At Top Boolean. Why: .picker-run is even taller here, with the result and all three action buttons showing. How: GuidedTour skips its own reserve-space math and pins the coach card to the top instead.


			}, // What: Add To Todo List Step. Why: This is the manual-pick tour's own 4th step, the real Send to Today button. How: This lets Re-roll stay usable while blocking Done, so leaving can't discard this step's own target out from under the user.

			// Title/body copied (lightly reworded) from the Pickers page tour's own pickerItems step. Same target (.pool-items, excludes "+ Add item", see that step's own comment in onboarding-page-tours.jsx), but unlike the page tour (which disables ALL THREE per-item buttons via tab-picker.jsx's disablePoolItemButtons), only Edit and Delete stay narrated-not-usable here (disablePoolEditDelete, a separate flag gated on this exact tourId+step): Send to Today stays genuinely usable, since it's real data and a second valid way to land a pick besides Manual Generation above. No requireClick: Send to Today is optional here, same "stays usable but doesn't gate advancing" treatment as Re-roll in the previous step, clicking anywhere inside .pool-items (including Send to Today) is already "on target" for the click-guard, so no clickPassThroughSel is needed the way Re-roll required one. coachAtTop: true, on a short viewport (e.g. iPhone SE) a pool of even a few real items is tall enough that the coach can't fit either above or below it without overlapping, pins the coach to safeTop and lets the pool run off the bottom instead, same tall-target treatment as the Data tour's own .data-list step and every Settings section, see coachAtTop's own doc comment in onboarding-tour-runner.jsx. Each genuinely-usable Send to Today button also gets its own fading .ob-tour-pulse (tab-picker.jsx's highlightManualPickSend), same per-element pulse-inside-a-bigger-spotlight idea as the Edit Item tour's own .ob-tour-pulse targets, so the one real actionable button per item still stands out inside this step's whole-pool highlight. Skips an already-sent or already-on-Today item's own (disabled) button, nothing to invite a click toward there.
			{


				sel        : '.pool-items', // What: Selector String. Why: This step highlights the whole item pool, excluding the Add Item button. How: GuidedTour spotlights whatever this selector matches.
				tab        : 'picker',     // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
				title      : 'Picker Items', // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.
				body       : <>Here you can <b>view all items in this picker's pool</b>. You can see a given item's values, if applicable, as well as the <b>Send to Today, Edit and Delete buttons</b>. The "Edit" and "Delete" buttons are disabled for this tutorial but feel free to try the "Send to Today" button on any item now. This concludes the Make your first manual pick tutorial, click Done when you are ready.</>, // What: Body Element. Why: This step's own coach card needs a plain description of the pool plus a closing instruction. How: GuidedTour renders this as the step's own descriptive paragraph.
				primary    : 'Done', // What: Primary String. Why: This is the manual-pick tour's own last step, so its main action finishes the tour instead of advancing. How: GuidedTour reads a 'Done' primary as the signal to call onFinish.
				back       : true,   // What: Back Boolean. Why: The user should always be able to return to Add to Todo List. How: GuidedTour shows its own Back button whenever this is true.
				coachAtTop : true    // What: Coach At Top Boolean. Why: A pool of even a few real items can be tall enough to overlap the coach on a short viewport. How: GuidedTour skips its own reserve-space math and pins the coach card to the top instead.


			} // What: Picker Items Step. Why: This is the manual-pick tour's own final step. How: This narrates Edit/Delete as disabled while leaving Send to Today genuinely usable as a second valid way to land a pick.


		];


	}

	if ( feaIdeStr === 'feat_edit_item' ) { // What: Edit Item Branch Check. Why: The edit-item tour's own steps only apply to this one feature. How: This returns its own step array whenever feaIdeStr matches.


		return [ // What: Edit Item Tour Steps Return. Why: The caller needs this feature tour's own full ordered step array beyond Step 1. How: This returns the edit-item tour's own remaining steps, each carrying its own selector/copy/navigation fields.

			// Highlights .data-list, same target as the Data page tour's own pickersManager step (DAT_TAR_OBJ in onboarding-page-tours.jsx), ALL of the user's real pickers, not one specific picker, since which one they choose to edit is up to them. clickSel narrows the actual click-guard/requireClick target down to .cat-h-l (each picker's own collapsible header button), any one of them expanding satisfies this step, matching "click on one of the pickers headers" per the user's own framing, not just a specific picker's. coachAtTop: true, .data-list can be far taller than the viewport once the user has more than a couple pickers, same "pin the coach to the top, let the list run off the bottom" treatment as the Data page tour's own equivalent step (see that step's own comment) and every other tall-target step in this app, see coachAtTop's own doc comment in onboarding-tour-runner.jsx.
			{


				sel          : '.data-list',                                                                                        // What: Selector String. Why: This step highlights ALL of the user's real pickers, since which one they edit is up to them. How: GuidedTour spotlights whatever this selector matches.
				clickSel     : '.cat-h-l',                                                                                          // What: Click Selector String. Why: Any one picker header expanding must satisfy this step, matching "click on one of the pickers headers" rather than one specific picker. How: This is read by the click-guard/requireClick logic separately from sel.
				// Suppresses the tour engine's own default requireClick pulse (one ring around the whole .data-list box), see tab-data.jsx's own highlightEditTourPickerHeaders comment for why: each individual picker header pulses on its own (.ob-tour-pulse) instead of one big ring around the entire list. pulseSel just needs to never match anything currently on screen.
				pulseSel     : '[data-ob-none]',                                                                                    // What: Pulse Selector String. Why: The default requireClick pulse must be suppressed in favor of each picker header's own individual pulse. How: This is a selector chosen to never match anything currently on screen.
				tab          : 'data',                                                                                               // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
				title        : 'Your Pickers',                                                                                       // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.
				body         : <>This is where you can <b>view and edit all of your pickers</b>, as well as their items. Click on any picker's header now to expand it and continue.</>, // What: Body Element. Why: This step's own coach card needs a plain description plus an explicit click instruction. How: GuidedTour renders this as the step's own descriptive paragraph.
				primary      : 'Next',                                                                                              // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuidedTour renders this as the button's own visible text.
				back         : true,                                                                                                // What: Back Boolean. Why: The user should always be able to return to Step 1's own nav highlight. How: GuidedTour shows its own Back button whenever this is true.
				requireClick : true,                                                                                                // What: Require Click Boolean. Why: The click itself is the thing being taught, not just a gate. How: GuidedTour disables Next and only advances once the real target is clicked.
				coachAtTop   : true,                                                                                                // What: Coach At Top Boolean. Why: .data-list can run far taller than the viewport once the user has more than a couple pickers. How: GuidedTour skips its own reserve-space math and pins the coach card to the top instead.

				// Controls/Items default OPEN the first time a picker's own section expands (absent === not-collapsed, see tab-data.jsx's own collapsedMap comment), same "clean, uncluttered" requirement as the pickers themselves, one level deeper. Can't just read state/DOM synchronously here: this run() fires from the tour's own CAPTURE-phase click listener, which, being capture, not bubble, always runs BEFORE the header's own React onClick (toggleControlsCollapsed) actually applies (see onClickCapture's own comment in onboarding-tour-runner.jsx), so at this exact instant the clicked picker's section hasn't actually opened yet, in state OR the DOM. Polled via rAF (bounded to ~20 frames), driven off the live DOM (this closure's own `state` would be just as stale by the time it fires), the picker's OWN outer Collapse mounts its .cat-body content (and thus these two buttons) on a SECOND render cycle after `open` first flips true (see Collapse's own render/useEffect split in ui.jsx), so a single synchronous check would too often find nothing yet. Scoped to .data-list specifically (NOT Conditionals/Reminders above it, which share this same .rd-ctl class for their own Controls/Items, see help-content.jsx's own scoped selectors for the same distinction). Calls actions.toggleControlsCollapsed directly (using the picker's own data-picker-id, added to .cat in tab-data.jsx for exactly this) rather than a real .click() on the header: Step 3 below now requires clicking that SAME Controls header to finish the tutorial, and a synthetic click fired this late (well after `step` has already advanced past this one, and after suppressGuardRef has already reset) would be indistinguishable from the user's own real click, collapsing Controls here would immediately satisfy Step 3's requireClick and finish the tour before the user ever saw it. A direct action call carries no such risk; it never touches the click-guard at all.
				run          : () => { // What: Run Function. Why: A freshly-expanded picker's own Controls/Items must start collapsed, same "clean slate" requirement as the pickers list itself. How: This polls the live DOM (bounded to 20 frames) for the just-expanded picker's own header buttons, then collapses whichever of Controls/Items defaulted open.


					let triCouNum = 0; // What: Try Count Number. Why: The polling loop below must give up eventually if the expected DOM never mounts. How: This counts attempts, capped at 20 frames by the loop itself.
					const triColFun = () => { // What: Try Collapse Function. Why: The just-expanded picker's own header buttons may not have mounted yet, so this must re-poll a frame at a time. How: This looks up the open picker's own header/buttons, retrying via requestAnimationFrame until they exist or the try cap is hit.


						const opeHdrEle = document.querySelector( '.data-list .cat-h-l[aria-expanded="true"]' ); // What: Open Header Element. Why: This must find whichever picker header the user just clicked open. How: This looks up the one .cat-h-l currently marked expanded.
						const catSecEle = opeHdrEle && opeHdrEle.closest( '.cat' );                              // What: Category Section Element. Why: The picker's own id and Controls/Items buttons live on its enclosing .cat section. How: This walks up from opeHdrEle to its closest .cat ancestor.
						const picIdeStr = catSecEle && catSecEle.dataset.pickerId;                              // What: Picker Identifier String. Why: actions.toggleControlsCollapsed needs this picker's own real id. How: This reads catSecEle's own data-picker-id attribute.
						const hdrButArr = catSecEle ? [ ...catSecEle.querySelectorAll( '.rd-ctl' ) ] : [];       // What: Header Button Array. Why: The Controls header (index 0) and Items header (index 1) both need checking. How: This collects every .rd-ctl button inside catSecEle into a plain array.

						// Re-polls a frame later whenever the expected DOM hasn't mounted yet and the try cap hasn't been hit. Left inline rather than extracted into named consts: triCouNum++ is a side effect that must stay inside this short-circuited check, extracting it would change how often it increments.
						if ( ( !picIdeStr || hdrButArr.length < 2 ) && triCouNum++ < 20 ) { requestAnimationFrame( triColFun ); return; } // What: Retry Guard. Why: The picker's own header/buttons may not have mounted on the very first frame checked. How: This re-schedules triColFun a frame later, up to 20 tries, whenever picIdeStr or both buttons are still missing.

						if ( !picIdeStr ) return; // What: Missing Picker Guard. Why: A try cap hit with no picker found at all has nothing left to collapse. How: This returns early whenever picIdeStr was never resolved.

						if ( hdrButArr[ 0 ] && hdrButArr[ 0 ].getAttribute( 'aria-expanded' ) === 'true' ) actions.toggleControlsCollapsed( picIdeStr + ':controls' ); // What: Controls Collapse Call. Why: Controls must start collapsed if it defaulted open. How: This toggles the picker's own ':controls' section only when it's currently expanded.

						if ( hdrButArr[ 1 ] && hdrButArr[ 1 ].getAttribute( 'aria-expanded' ) === 'true' ) actions.toggleControlsCollapsed( picIdeStr + ':items' ); // What: Items Collapse Call. Why: Items must start collapsed if it defaulted open. How: This toggles the picker's own ':items' section only when it's currently expanded.


					};

					requestAnimationFrame( triColFun ); // What: Initial Poll Call. Why: The first check must also wait a frame, same as every retry. How: This schedules the first call to triColFun.


				}


			}, // What: Your Pickers Step. Why: This is the edit-item tour's own 2nd step. How: This stages a clean, all-collapsed Controls/Items slate for whichever picker the user expanded, before Step 3 highlights it.

			// sel highlights the WHOLE expanded picker's own .cat section (header + its collapsed Controls/Items rows), keeps the user oriented on WHICH picker this is, same "highlight the bigger box, narrow the click" reasoning as the manual-pick tour's own Add to Todo List step (.picker-run + .pv-act--send). :has() scopes to whichever picker is currently expanded specifically, unlike .cat-body's content, the outer .cat <section>/header render for EVERY picker unconditionally, so a bare .data-list > .cat would highlight every picker's header at once. clickSel then narrows the actual click-guard/requireClick target down to the Controls header alone (same selector help-content.jsx's own dataPickerControlsHeader entry uses), doubling as a safety net: clicking the picker's own header (inside sel but outside clickSel) is silently blocked by the guard instead of collapsing the section and losing this step's target out from under the user.
			{


				sel          : '.data-list > .cat:has(.cat-h-l[aria-expanded="true"])',              // What: Selector String. Why: This step highlights the whole expanded picker's own section, keeping the user oriented on which picker this is. How: GuidedTour spotlights whatever this selector matches.
				clickSel     : '.data-list > .cat .cat-body > button.rd-ctl:nth-of-type(1)',         // What: Click Selector String. Why: Only the Controls header itself may satisfy this step. How: This is read by the click-guard/requireClick logic separately from sel.
				// Same pulse suppression as the previous step, the Controls header itself pulses (.ob-tour-pulse, tab-data.jsx) instead of a ring around the whole picker card.
				pulseSel     : '[data-ob-none]',                                                    // What: Pulse Selector String. Why: The default requireClick pulse must be suppressed in favor of the Controls header's own individual pulse. How: This is a selector chosen to never match anything currently on screen.
				tab          : 'data',                                                              // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
				title        : 'Controls Section',                                                  // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.
				body         : <>This is where you can <b>view and edit a picker's Controls</b>. This includes its name, group, type, and other settings. Click on the Controls' header now to expand it and continue.</>, // What: Body Element. Why: This step's own coach card needs a plain description plus an explicit click instruction. How: GuidedTour renders this as the step's own descriptive paragraph.
				primary      : 'Next',                                                              // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuidedTour renders this as the button's own visible text.
				back         : true,                                                                // What: Back Boolean. Why: The user should always be able to return to Your Pickers. How: GuidedTour shows its own Back button whenever this is true.
				requireClick : true                                                                 // What: Require Click Boolean. Why: The click itself is the thing being taught, not just a gate. How: GuidedTour disables Next and only advances once the real target is clicked.


			}, // What: Controls Section Step. Why: This is the edit-item tour's own 3rd step. How: This stays on the whole expanded picker's own box while narrowing the click guard to the Controls header alone.

			// Same sel as the previous step, still the whole picker box, now with Controls ITSELF expanded (the previous step's own click), so the box has grown to include all of PickerControls' real fields. No clickSel this time: every click inside stays genuinely usable (name/group/type fields, weight steppers, the works), "explore and do whatever you want" is the point. The only two things still guarded are the picker's own header and the Items header, both via real `disabled` props in tab-data.jsx (disableEditTourToggles) rather than the click-guard, since collapsing either would pull this step's own target out from under the user mid-step. coachAtTop: true, Controls' real field set is easily taller than a short viewport can fit alongside the coach, same "pin coach to top, let the section run off the bottom" treatment as the manual-pick tour's own tall-target steps, see coachAtTop's own doc comment in onboarding-tour-runner.jsx.
			{


				sel        : '.data-list > .cat:has(.cat-h-l[aria-expanded="true"])', // What: Selector String. Why: This step highlights the same whole picker box, now with Controls itself expanded. How: GuidedTour spotlights whatever this selector matches.
				tab        : 'data',                                                 // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
				title      : 'Edit Picker Settings',                                 // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.
				body       : <>Feel free to <b>explore this section and make any changes you'd like</b> to the picker's name, group, type, or other settings. Click Next when you are ready to move on.</>, // What: Body Element. Why: This step's own coach card needs to invite free exploration of Controls' real fields. How: GuidedTour renders this as the step's own descriptive paragraph.
				primary    : 'Next',                                                 // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuidedTour renders this as the button's own visible text.
				back       : true,                                                   // What: Back Boolean. Why: The user should always be able to return to Controls Section. How: GuidedTour shows its own Back button whenever this is true.
				coachAtTop : true,                                                   // What: Coach At Top Boolean. Why: Controls' real field set is easily taller than a short viewport can fit alongside the coach. How: GuidedTour skips its own reserve-space math and pins the coach card to the top instead.

				// Re-collapses Controls on the way to the Items Section step, same "clean slate" requirement as the previous step's own run(), that step highlights this same picker box again and needs Controls collapsed for it to look uncluttered. Controls is already mounted here (unlike the Your Pickers step's own case, which had to poll for it), so no async wait is needed, just a direct actions.toggleControlsCollapsed call, guarded on aria-expanded so this is a no-op if the user already collapsed it themselves while exploring.
				run        : () => { // What: Run Function. Why: The Items Section step's own box must read as uncluttered, with Controls collapsed again. How: This finds the real Controls header, then collapses it only if it's still expanded.


					const conHdrEle = document.querySelector( '.data-list > .cat .cat-body > button.rd-ctl:nth-of-type(1)' ); // What: Controls Header Element. Why: This is the real control this step must collapse on the way out. How: This looks it up fresh, since it only exists while a picker is expanded.
					const catSecEle = conHdrEle && conHdrEle.closest( '.cat' );                                              // What: Category Section Element. Why: The picker's own id lives on its enclosing .cat section. How: This walks up from conHdrEle to its closest .cat ancestor.
					const picIdeStr = catSecEle && catSecEle.dataset.pickerId;                                              // What: Picker Identifier String. Why: actions.toggleControlsCollapsed needs this picker's own real id. How: This reads catSecEle's own data-picker-id attribute.

					if ( picIdeStr && conHdrEle.getAttribute( 'aria-expanded' ) === 'true' ) actions.toggleControlsCollapsed( picIdeStr + ':controls' ); // What: Controls Collapse Call. Why: This must only fire when Controls is still actually expanded. How: This toggles the picker's own ':controls' section closed.


				}


			}, // What: Edit Picker Settings Step. Why: This is the edit-item tour's own 4th step. How: This invites free exploration, then collapses Controls again on the way to the Items Section step.

			// Same shape as Edit Picker Settings above (Controls Section), mirrored for Items: clickSel narrows to the Items header specifically (:nth-of-type(2)) instead of Controls. Controls itself was just re-collapsed by the previous step's own outgoing run(), so the highlighted box (same whole-picker sel as Controls Section/Edit Picker Settings) reads clean again rather than showing Controls still expanded alongside it.
			{


				sel          : '.data-list > .cat:has(.cat-h-l[aria-expanded="true"])',      // What: Selector String. Why: This step highlights the same whole picker box, Controls now re-collapsed by the previous step's own run(). How: GuidedTour spotlights whatever this selector matches.
				clickSel     : '.data-list > .cat .cat-body > button.rd-ctl:nth-of-type(2)', // What: Click Selector String. Why: Only the Items header itself may satisfy this step. How: This is read by the click-guard/requireClick logic separately from sel.
				// Same pulse suppression as Controls Section above, the Items header itself pulses (.ob-tour-pulse, tab-data.jsx) instead of a ring around the whole picker card.
				pulseSel     : '[data-ob-none]',                                            // What: Pulse Selector String. Why: The default requireClick pulse must be suppressed in favor of the Items header's own individual pulse. How: This is a selector chosen to never match anything currently on screen.
				tab          : 'data',                                                      // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
				title        : 'Items Section',                                             // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.
				body         : <>This is where you can <b>view and edit a picker's Items</b>. This includes each item's name, weight, and other values. Click on the Items' header now to expand it and continue.</>, // What: Body Element. Why: This step's own coach card needs a plain description plus an explicit click instruction. How: GuidedTour renders this as the step's own descriptive paragraph.
				primary      : 'Next',                                                      // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuidedTour renders this as the button's own visible text.
				back         : true,                                                        // What: Back Boolean. Why: The user should always be able to return to Edit Picker Settings. How: GuidedTour shows its own Back button whenever this is true.
				requireClick : true                                                         // What: Require Click Boolean. Why: The click itself is the thing being taught, not just a gate. How: GuidedTour disables Next and only advances once the real target is clicked.


			}, // What: Items Section Step. Why: This is the edit-item tour's own 5th step. How: This mirrors Controls Section but for the Items header instead.

			// Same whole-picker sel as Controls Section through Items Section, now with Items expanded (the previous step's own click). clickSel narrows to any item row, same selector help-content.jsx's own dataItemRow entry uses (.data-list .rd-item > .rd-row), so clicking ANY one of them satisfies this step, not just a specific item. The "+ Add new item" button (.rd-add, same scoped selector as help-content.jsx's own dataAddItem) is disabled for this and the next step (disableEditTourAddItem in tab-data.jsx), narrating that it exists is the point, not inviting a brand-new item mid-tutorial. coachAtTop: true, the item list's own height is unpredictable (depends how many items this picker has), same reasoning as every other "explore" step's own coachAtTop.
			{


				sel          : '.data-list > .cat:has(.cat-h-l[aria-expanded="true"])', // What: Selector String. Why: This step highlights the same whole picker box, Items now expanded by the previous step's own click. How: GuidedTour spotlights whatever this selector matches.
				clickSel     : '.data-list .rd-item > .rd-row',                        // What: Click Selector String. Why: Any one item row must satisfy this step, not just a specific item. How: This is read by the click-guard/requireClick logic separately from sel.
				// Same pulse suppression as every other requireClick step above, each item's own row pulses (.ob-tour-pulse, tab-data.jsx) instead of a ring around the whole picker card.
				pulseSel     : '[data-ob-none]',                                       // What: Pulse Selector String. Why: The default requireClick pulse must be suppressed in favor of each item row's own individual pulse. How: This is a selector chosen to never match anything currently on screen.
				tab          : 'data',                                                 // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
				title        : 'Picker Items',                                        // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.
				body         : <>This section contains <b>all of this picker's items</b>, as well as a form for adding new items (though this is disabled for this tutorial). Click on any of the items now to expand it and continue.</>, // What: Body Element. Why: This step's own coach card needs a plain description plus an explicit click instruction. How: GuidedTour renders this as the step's own descriptive paragraph.
				primary      : 'Next',                                                // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuidedTour renders this as the button's own visible text.
				back         : true,                                                  // What: Back Boolean. Why: The user should always be able to return to Items Section. How: GuidedTour shows its own Back button whenever this is true.
				requireClick : true,                                                  // What: Require Click Boolean. Why: The click itself is the thing being taught, not just a gate. How: GuidedTour disables Next and only advances once the real target is clicked.
				coachAtTop   : true                                                   // What: Coach At Top Boolean. Why: The item list's own height is unpredictable and can easily exceed a short viewport. How: GuidedTour skips its own reserve-space math and pins the coach card to the top instead.


			}, // What: Picker Items Step. Why: This is the edit-item tour's own 6th step. How: This narrows the click guard to any item row while narrating the disabled Add Item button.

			// Same shape as Edit Picker Settings above, mirrored for Items: free exploration, no clickSel, the clicked item already expanded by the previous step's own real click. Last step of this tutorial, primary 'Done', no outgoing run() needed since nothing comes after it to keep clean for. coachAtTop: true, an item list can run just as tall as Controls' own field set once a picker has more than a couple items, same reasoning as Edit Picker Settings' own coachAtTop.
			{


				sel        : '.data-list > .cat:has(.cat-h-l[aria-expanded="true"])', // What: Selector String. Why: This step highlights the same whole picker box, the clicked item now expanded. How: GuidedTour spotlights whatever this selector matches.
				tab        : 'data',                                                 // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
				title      : 'Edit Item Settings',                                   // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.
				body       : <>Feel free to <b>explore this section and make any changes you'd like</b> to an item's name, weight, or other values. This concludes the Edit your first item tutorial, click Done when you are ready.</>, // What: Body Element. Why: This step's own coach card needs to invite free exploration plus a closing instruction. How: GuidedTour renders this as the step's own descriptive paragraph.
				primary    : 'Done',                                                 // What: Primary String. Why: This is the edit-item tour's own last step, so its main action finishes the tour instead of advancing. How: GuidedTour reads a 'Done' primary as the signal to call onFinish.
				back       : true,                                                   // What: Back Boolean. Why: The user should always be able to return to Picker Items. How: GuidedTour shows its own Back button whenever this is true.
				coachAtTop : true                                                    // What: Coach At Top Boolean. Why: An item list can run just as tall as Controls' own field set once a picker has more than a couple items. How: GuidedTour skips its own reserve-space math and pins the coach card to the top instead.


			} // What: Edit Item Settings Step. Why: This is the edit-item tour's own final step. How: This invites free exploration of the already-expanded item's own fields.


		];


	}

	if ( feaIdeStr === 'feat_run_time' ) { // What: Run Time Branch Check. Why: The generator run-time tour's own steps only apply to this one feature. How: This returns its own step array whenever feaIdeStr matches.


		return [ // What: Run Time Tour Steps Return. Why: The caller needs this feature tour's own full ordered step array beyond Step 1. How: This returns the generator run-time tour's own remaining steps, each carrying its own selector/copy/navigation fields.

			// Body copied verbatim from the Settings page tour's own daily target (SET_TAR_OBJ in onboarding-page-tours.jsx), same section, same explanation. Title given its own, more specific wording rather than reusing that tour's plain "Daily Generator" verbatim. coachAtTop: true, matches every section step in that same tour, since .set-section--daily can run taller than the viewport just like the others.
			{


				sel        : '.set-section--daily', // What: Selector String. Why: This step highlights the whole Daily Generator section. How: GuidedTour spotlights whatever this selector matches.
				tab        : 'settings',            // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
				title      : 'Daily Generator Settings', // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.
				body       : <>This is where you can <b>control the daily generator</b>: turn auto generation on or off, what time it runs, and enabling notifications for when it does. This concludes the Adjust your daily generator run time tutorial, click Done when you are ready.</>, // What: Body Element. Why: This step's own coach card needs a plain description plus a closing instruction. How: GuidedTour renders this as the step's own descriptive paragraph.
				primary    : 'Done', // What: Primary String. Why: This is this tour's own only step, so its main action finishes the tour instead of advancing. How: GuidedTour reads a 'Done' primary as the signal to call onFinish.
				back       : true,   // What: Back Boolean. Why: The user should always be able to return to Step 1's own nav highlight. How: GuidedTour shows its own Back button whenever this is true.
				coachAtTop : true    // What: Coach At Top Boolean. Why: .set-section--daily can run taller than the viewport, same as every other Settings section. How: GuidedTour skips its own reserve-space math and pins the coach card to the top instead.


			} // What: Daily Generator Settings Step. Why: This is the run-time tour's own only step beyond Step 1. How: This spotlights the real Daily Generator section as a reference blurb.


		];


	}

	if ( feaIdeStr === 'feat_theme' ) { // What: Theme Branch Check. Why: The app-theme tour's own steps only apply to this one feature. How: This returns its own step array whenever feaIdeStr matches.


		return [ // What: Theme Tour Steps Return. Why: The caller needs this feature tour's own full ordered step array beyond Step 1. How: This returns the app-theme tour's own remaining steps, each carrying its own selector/copy/navigation fields.

			// .set-subsection--systempref, a new modifier class added to tab-settings.jsx for exactly this (previously bare .set-subsection, ambiguous against its own siblings: --celebration/--pickanim/--layout further down the same Appearance section). coachAtTop: true, same reasoning as every other Settings section step in this app: content can easily run taller than the viewport.
			{


				sel        : '.set-subsection--systempref', // What: Selector String. Why: This step highlights the System Preferences toggle. How: GuidedTour spotlights whatever this selector matches.
				tab        : 'settings',                    // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
				title      : 'System Preferences Toggle',   // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.
				body       : <>This lets Ease My Life <b>automatically switch between your light and dark theme</b> based on your device's own system setting.</>, // What: Body Element. Why: This step's own coach card needs a plain description of what this toggle does. How: GuidedTour renders this as the step's own descriptive paragraph.
				primary    : 'Next', // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuidedTour renders this as the button's own visible text.
				back       : true,   // What: Back Boolean. Why: The user should always be able to return to Step 1's own nav highlight. How: GuidedTour shows its own Back button whenever this is true.
				coachAtTop : true    // What: Coach At Top Boolean. Why: Every Settings section step can run taller than the viewport. How: GuidedTour skips its own reserve-space math and pins the coach card to the top instead.


			}, // What: System Preferences Toggle Step. Why: This is the theme tour's own 2nd step. How: This spotlights the real System Preferences toggle as a reference blurb.

			// .set-subsection--theme-light, already its own modifier class in ThemeSection (tab-settings.jsx), no changes needed there.
			{


				sel        : '.set-subsection--theme-light', // What: Selector String. Why: This step highlights the Light Theme settings. How: GuidedTour spotlights whatever this selector matches.
				tab        : 'settings',                     // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
				title      : 'Light Theme Settings',        // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.
				body       : <>This is where you can <b>pick a light based theme</b>, or create your own custom one.</>, // What: Body Element. Why: This step's own coach card needs a plain description of what this section does. How: GuidedTour renders this as the step's own descriptive paragraph.
				primary    : 'Next', // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuidedTour renders this as the button's own visible text.
				back       : true,   // What: Back Boolean. Why: The user should always be able to return to System Preferences Toggle. How: GuidedTour shows its own Back button whenever this is true.
				coachAtTop : true    // What: Coach At Top Boolean. Why: Every Settings section step can run taller than the viewport. How: GuidedTour skips its own reserve-space math and pins the coach card to the top instead.


			}, // What: Light Theme Settings Step. Why: This is the theme tour's own 3rd step. How: This spotlights the real Light Theme settings as a reference blurb.

			{


				sel        : '.set-subsection--theme-dark', // What: Selector String. Why: This step highlights the Dark Theme settings. How: GuidedTour spotlights whatever this selector matches.
				tab        : 'settings',                    // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
				title      : 'Dark Theme Settings',        // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.
				body       : <>This is where you can <b>pick a dark based theme</b>, or create your own custom one. This concludes the App Theme tutorial, click Done when you are ready.</>, // What: Body Element. Why: This step's own coach card needs a plain description plus a closing instruction. How: GuidedTour renders this as the step's own descriptive paragraph.
				primary    : 'Done', // What: Primary String. Why: This is the theme tour's own last step, so its main action finishes the tour instead of advancing. How: GuidedTour reads a 'Done' primary as the signal to call onFinish.
				back       : true,   // What: Back Boolean. Why: The user should always be able to return to Light Theme Settings. How: GuidedTour shows its own Back button whenever this is true.
				coachAtTop : true    // What: Coach At Top Boolean. Why: Every Settings section step can run taller than the viewport. How: GuidedTour skips its own reserve-space math and pins the coach card to the top instead.


			} // What: Dark Theme Settings Step. Why: This is the theme tour's own final step. How: This spotlights the real Dark Theme settings as a reference blurb.


		];


	}

	if ( feaIdeStr === 'feat_celebration' ) { // What: Celebration Branch Check. Why: The celebration-animation tour's own steps only apply to this one feature. How: This returns its own step array whenever feaIdeStr matches.


		return [ // What: Celebration Tour Steps Return. Why: The caller needs this feature tour's own full ordered step array beyond Step 1. How: This returns the celebration-animation tour's own remaining steps, each carrying its own selector/copy/navigation fields.

			// .set-subsection--celebration, already its own modifier class in tab-settings.jsx's Appearance section, no changes needed there.
			{


				sel        : '.set-subsection--celebration', // What: Selector String. Why: This step highlights the Completion Celebration settings. How: GuidedTour spotlights whatever this selector matches.
				tab        : 'settings',                     // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
				title      : 'Completion Celebration',      // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.
				body       : <>This is where you can <b>pick which animation plays</b> whenever you complete your entire todo list for the day. This concludes the Celebration Animation tutorial, click Done when you are ready.</>, // What: Body Element. Why: This step's own coach card needs a plain description plus a closing instruction. How: GuidedTour renders this as the step's own descriptive paragraph.
				primary    : 'Done', // What: Primary String. Why: This is this tour's own only step, so its main action finishes the tour instead of advancing. How: GuidedTour reads a 'Done' primary as the signal to call onFinish.
				back       : true,   // What: Back Boolean. Why: The user should always be able to return to Step 1's own nav highlight. How: GuidedTour shows its own Back button whenever this is true.
				coachAtTop : true    // What: Coach At Top Boolean. Why: Every Settings section step can run taller than the viewport. How: GuidedTour skips its own reserve-space math and pins the coach card to the top instead.


			} // What: Completion Celebration Step. Why: This is the celebration tour's own only step beyond Step 1. How: This spotlights the real Completion Celebration settings as a reference blurb.


		];


	}

	if ( feaIdeStr === 'feat_pick_anim' ) { // What: Pick Animation Branch Check. Why: The picker-animation tour's own steps only apply to this one feature. How: This returns its own step array whenever feaIdeStr matches.


		return [ // What: Pick Animation Tour Steps Return. Why: The caller needs this feature tour's own full ordered step array beyond Step 1. How: This returns the picker-animation tour's own remaining steps, each carrying its own selector/copy/navigation fields.

			// .set-subsection--pickanim, already its own modifier class in tab-settings.jsx's Appearance section, no changes needed there. Same shape as feat_celebration's own step just above.
			{


				sel        : '.set-subsection--pickanim', // What: Selector String. Why: This step highlights the Picker Animation settings. How: GuidedTour spotlights whatever this selector matches.
				tab        : 'settings',                  // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
				title      : 'Picker Animation',         // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.
				body       : <>This is where you can <b>pick which animation plays</b> whenever you manually direct a picker to select an item on the Pickers page. This concludes the Picker Animation tutorial, click Done when you are ready.</>, // What: Body Element. Why: This step's own coach card needs a plain description plus a closing instruction. How: GuidedTour renders this as the step's own descriptive paragraph.
				primary    : 'Done', // What: Primary String. Why: This is this tour's own only step, so its main action finishes the tour instead of advancing. How: GuidedTour reads a 'Done' primary as the signal to call onFinish.
				back       : true,   // What: Back Boolean. Why: The user should always be able to return to Step 1's own nav highlight. How: GuidedTour shows its own Back button whenever this is true.
				coachAtTop : true    // What: Coach At Top Boolean. Why: Every Settings section step can run taller than the viewport. How: GuidedTour skips its own reserve-space math and pins the coach card to the top instead.


			} // What: Picker Animation Step. Why: This is the pick-animation tour's own only step beyond Step 1. How: This spotlights the real Picker Animation settings as a reference blurb.


		];


	}

	if ( feaIdeStr === 'feat_highlights' ) { // What: Highlights Branch Check. Why: The highlights tour's own steps only apply to this one feature, and this is the only feature whose steps below fully replace Step 1 rather than follow it. How: This returns its own 2-step array whenever feaIdeStr matches.


		// Unlike every other feature, this one does NOT use the shared buildPageTourStep1 nav-click (see AppFeatureTour's own steps prop below, which skips prepending it for this feaIdeStr specifically): the whole point is the help-highlight toggle itself (.help-btn, help-mode.jsx), which already sits in the CURRENT page's own header, there's nothing to navigate to first. Both steps target the exact same element (it never moves), so the highlight/coach position stays pinned across the transition between them, only the body copy changes.
		return [ // What: Highlights Tour Steps Return. Why: The caller needs this feature's own full 2-step array, replacing Step 1 entirely rather than following it. How: This returns the highlights tour's own steps, each carrying its own selector/copy/navigation fields.

			{


				sel          : '.help-btn', // What: Selector String. Why: This step highlights the real help-highlight toggle. How: GuidedTour spotlights whatever this selector matches.
				tab          : 'today',    // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
				title        : 'Highlights Feature', // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.
				body         : <>The “i” button can be <b>found in the top right corner of every page</b>. Click the “i” button now to see how this works.</>, // What: Body Element. Why: This step's own coach card needs a plain description plus an explicit click instruction. How: GuidedTour renders this as the step's own descriptive paragraph.
				primary      : 'Next', // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuidedTour renders this as the button's own visible text.
				back         : false,  // What: Back Boolean. Why: This is this tour's very first step, so there is nothing to go back to. How: GuidedTour hides its own Back button whenever this is false.
				requireClick : true    // What: Require Click Boolean. Why: The click itself is the thing being taught, not just a gate. How: GuidedTour disables Next and only advances once the real target is clicked.


			}, // What: Highlights Feature Step. Why: This is the highlights tour's own 1st step, the real help-highlight toggle. How: This teaches turning the feature on.

			{


				sel          : '.help-btn', // What: Selector String. Why: This step highlights the exact same, still-pinned help-highlight toggle. How: GuidedTour spotlights whatever this selector matches.
				tab          : 'today',    // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
				title        : 'Highlights Feature', // What: Title String. Why: This step's own coach card needs the same heading as the previous step, since the target hasn't moved. How: GuidedTour renders this as the step's own heading text.
				body         : <><b>Important elements on the page are highlighted, each with their own button</b> that will bring up a tooltip with more information. Click the “i” button again to turn the feature back off and conclude the Highlight Feature tutorial.</>, // What: Body Element. Why: This step's own coach card needs to explain the now-visible highlights plus a closing instruction. How: GuidedTour renders this as the step's own descriptive paragraph.
				primary      : 'Done', // What: Primary String. Why: This is the highlights tour's own last step, so its main action finishes the tour instead of advancing. How: GuidedTour reads a 'Done' primary as the signal to call onFinish.
				back         : true,   // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuidedTour shows its own Back button whenever this is true.
				requireClick : true    // What: Require Click Boolean. Why: The click itself is the thing being taught, not just a gate. How: GuidedTour disables Next and only advances once the real target is clicked.


			} // What: Highlights Feature Step. Why: This is the highlights tour's own 2nd and final step. How: This teaches turning the feature back off, ending on the same target the tour opened on.


		];


	}

	if ( feaIdeStr === 'feat_protect_data' ) { // What: Protect Data Branch Check. Why: The protect-data tour's own steps only apply to this one feature. How: This returns its own step array whenever feaIdeStr matches.


		return [ // What: Protect Data Tour Steps Return. Why: The caller needs this feature tour's own full ordered step array beyond Step 1. How: This returns the protect-data tour's own remaining steps, each carrying its own selector/copy/navigation fields.

			// .set-protect-btn, new modifier class on the "Protect Data" Btn in tab-settings.jsx (only rendered while !stor.persisted, same condition already gating the real button). Omitted entirely when alrProBoo (see AppFeatureTour's own effect that computes it): a browser that already has persisted storage never renders this button at all, so this step's requireClick target would never resolve; without this the tour would sit on a phantom "Step 2 of 3" until the generic not-found timeout gave up and cancelled the whole tutorial. Skipping the step outright instead makes this a clean "Step n of 2".
			...( alrProBoo ? [] : [ {


				sel          : '.set-protect-btn', // What: Selector String. Why: This step highlights the real Protect Data button. How: GuidedTour spotlights whatever this selector matches.
				tab          : 'settings',        // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
				title        : 'Protect Your Data', // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.
				body         : <>The “Protect Data” button helps <b>protect your data from being cleared by your browser's own storage clean up</b>. Click the “Protect Data” button now to enable this.</>, // What: Body Element. Why: This step's own coach card needs a plain description plus an explicit click instruction. How: GuidedTour renders this as the step's own descriptive paragraph.
				primary      : 'Next', // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuidedTour renders this as the button's own visible text.
				back         : true,   // What: Back Boolean. Why: The user should always be able to return to Step 1's own nav highlight. How: GuidedTour shows its own Back button whenever this is true.
				requireClick : true,   // What: Require Click Boolean. Why: The click itself is the thing being taught, not just a gate. How: GuidedTour disables Next and only advances once the real target is clicked.
				coachAtTop   : true    // What: Coach At Top Boolean. Why: Every Settings section step can run taller than the viewport. How: GuidedTour skips its own reserve-space math and pins the coach card to the top instead.


			} ] ), // What: Protect Your Data Step Spread. Why: This step must not exist at all for a browser whose storage is already persisted, since its own target would never render. How: This spreads in a single-entry array only when alrProBoo is false, otherwise an empty array.

			// Comma-separated fallback (see findTargets' own comma-splitting in onboarding-tour-runner.jsx), .set-install-btn (new modifier class, only rendered when canInstall) is tried first; if this browser can't offer a real install prompt, falls back to .set-store-ios (shared by all of tab-settings.jsx's own browser-specific instructional blocks, iOS, Mac, or the generic "not available here" note, exactly one of which renders at a time), so this targets whichever one actually applies without needing to know which browser it's running in. No requireClick, Done is enabled outright, last step of this tutorial.
			{


				sel        : '.set-install-btn, .set-store-ios', // What: Selector String. Why: This step highlights whichever real install control actually applies to this browser. How: GuidedTour spotlights the first alternative that matches.
				tab        : 'settings',                        // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
				title      : 'Install the App',                // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.
				body       : <>Installing the app to your device is <b>the best way to protect your data</b>, and gives you a more native, app-like experience. If a direct install isn't available in your browser, instructions for how to install it are shown here instead. This concludes the Protect Your Data tutorial, click Done when you are ready.</>, // What: Body Element. Why: This step's own coach card needs a plain description plus a closing instruction. How: GuidedTour renders this as the step's own descriptive paragraph.
				primary    : 'Done', // What: Primary String. Why: This is the protect-data tour's own last step, so its main action finishes the tour instead of advancing. How: GuidedTour reads a 'Done' primary as the signal to call onFinish.
				back       : true,   // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuidedTour shows its own Back button whenever this is true.
				coachAtTop : true    // What: Coach At Top Boolean. Why: Every Settings section step can run taller than the viewport. How: GuidedTour skips its own reserve-space math and pins the coach card to the top instead.


			} // What: Install The App Step. Why: This is the protect-data tour's own final step. How: This spotlights whichever real install control applies without needing to know the browser.


		];


	}



	return []; // What: Fallback Return. Why: Any feature id not yet handled above has no steps beyond Step 1. How: This returns an empty array whenever feaIdeStr matched none of the branches above.


};



// #region appFeatureBlockedReason

/**
 * appFeatureBlockedReason = App Feature Blocked Reason
 *
 * @summary
 * "Make your first manual pick" needs a real target to run the tour against:
 * a real (non-hidden), non-sample picker with at least 2 items. 2, not 1,
 * Step 4's own copy invites a Re-roll ("give it a try"), and with a single
 * item Re-roll would deterministically return the same result every time,
 * making that invitation pointless. Unlike the checklist's own amber "needs
 * attention" cue on the Create-a-picker cards (which are always runnable,
 * just flagged as unfinished, see onboarding-checklist.js's realPickerCount),
 * this actually blocks the card: there's no partial tour to offer without a
 * real picker to run one on. No other App Feature has a requirement yet, so
 * this stays a one-off check rather than a generic per-feature schema field.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param feaIdeStr - Feature Identifier String: The feature id tab-today.jsx's
 *                    own AppFeatureCard is asking about.
 * @param state     - State: The entire app's own persisted state.
 *
 * @returns A user-facing reason string whenever this feature is blocked,
 * otherwise null.
 *
 * @example
 * ```ts
 * appFeatureBlockedReason(feaIdeStr, state)
 * // => a blocked-reason string, or null
 * ```
 *
*/

function appFeatureBlockedReason ( feaIdeStr, state ) {


	if ( feaIdeStr !== 'feat_manual_pick' ) return null; // What: Other Feature Guard. Why: No other App Feature has a requirement yet. How: This returns null immediately for any feaIdeStr besides 'feat_manual_pick'.

	const iteAllArr = state.items || []; // What: Item All Array. Why: The eligibility check below needs every real item to count how many belong to each picker. How: This reads state.items, falling back to an empty array.
	const eliPicBoo = ( state.pickers || [] ).some( ( curPicObj ) => !curPicObj.hidden
		&& iteAllArr.filter( ( curIteObj ) => curIteObj.pickerId === curPicObj.id ).length >= 2 ); // What: Eligible Picker Boolean. Why: The manual-pick tour needs at least one real, non-hidden picker with 2+ items to run against. How: This checks whether any non-hidden picker has 2 or more of its own items among iteAllArr.



	return eliPicBoo ? null : 'Create a picker with at least 2 items first, then come back to try this.'; // What: Blocked Reason Return. Why: The launcher card needs a user-facing string whenever no eligible picker exists yet, otherwise null to stay unblocked. How: This returns null when eliPicBoo is true, otherwise the reason string.


}

// #endregion appFeatureBlockedReason



// #region AppFeatureTour

/**
 * AppFeatureTour = App Feature Tour
 *
 * @summary
 * Renders whichever piece of one feature's own App Feature mini-tour is
 * currently relevant: the intro modal, or the running GuidedTour. Mounted at
 * the app level (see app.jsx's own actFeaStr), reads real persisted state and
 * calls real actions.* methods (see store.jsx), same overall shape as
 * PageTour in onboarding-page-tours.jsx.
 *
 * Unlike PageTour, most features here have no extra steps yet beyond the
 * shared Step 1 (see bldSteFun above), and the feat_highlights feature skips
 * Step 1 entirely since its own target, the real help-highlight toggle,
 * already sits on the current page with nothing to navigate to first.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.featureId  - Feature Id: This feature's own id (e.g.
 *                           'feat_manual_pick'), keying APP_FEATURES and
 *                           bldSteFun. Named featureId, not the usual
 *                           feaIdeStr, to match app.jsx's own JSX call site.
 * @param props.state      - State: The entire app's own persisted state.
 * @param props.actions    - Actions: The actions that mutate props.state.
 * @param props.active     - Active: The app's own currently active tab id.
 * @param props.selectTab  - Select Tab: Switches the app's own active tab.
 * @param props.onClose    - On Close: Clears app.jsx's own actFeaStr, ending
 *                           this mount.
 *
 * @returns Either the intro modal (touPhaStr 'intro') or the running guided
 * tour (touPhaStr 'tour'), depending on this feature's own phase.
 *
 * @example
 * ```tsx
 * AppFeatureTour({ featureId, state, actions, active, selectTab, onClose })
 * // => <AppFeatureTour />
 * ```
 *
*/

function AppFeatureTour ( { featureId, state, actions, active, selectTab, onClose } ) {


	const feaRecObj = APP_FEATURES.find( ( curFeaObj ) => curFeaObj.id === featureId ); // What: Feature Record Object. Why: This feature's own page/title/body/pills/time are read off its own APP_FEATURES entry. How: This searches APP_FEATURES for the entry whose own id matches featureId.
	// Same resumable pattern as PageTour, see its own comment.
	const onbStaObj = state.onboarding || {}; // What: Onboarding State Object. Why: A reload lands here with tab-today.jsx's own activeAppFeature already re-derived from this SAME persisted activeTour, so this just decides whether to skip the intro modal and which (resumable) step to land on. How: This reads state.onboarding, falling back to an empty object.
	const resTouObj = onbStaObj.activeTour && onbStaObj.activeTour.id === `appfeature-${ featureId }` ? onbStaObj.activeTour : null; // What: Resume Tour Object. Why: See onboarding-tour-runner.jsx's own resumable field doc comment for why this is a checkpoint, not necessarily the exact step the user was last on. How: This reads onbStaObj.activeTour back out only when its own id matches this feature's own tourId, otherwise null.
	const [ touPhaStr, setTouPhaStr ] = React.useState( resTouObj ? 'tour' : 'intro' ); // What: Tour Phase String And Setter. Why: This is the mini-tour's own top-level position, 'intro' (the modal showing) or 'tour' (GuidedTour running). How: This starts on 'tour' whenever resTouObj says a tour was left running, otherwise 'intro'.

	// Whether THIS browser already has persisted storage, checked once up front (not reactively), see bldSteFun's own comment on why feat_protect_data's first step needs to know this. Frozen at whatever it resolves to on mount: a user who actually grants persistence mid-tour (by clicking the real button that step targets) shouldn't have the step list change shape out from under them the same run.
	const [ alrProBoo, setAlrProBoo ] = React.useState( false ); // What: Already Protected Boolean And Setter. Why: feat_protect_data's own first step must not exist at all once this browser already has persisted storage. How: This starts false, then resolves once via the effect below.

	React.useEffect( () => { // What: Check Persisted Effect. Why: navigator.storage.persisted() is itself async, so alrProBoo can't be computed synchronously up front. How: This resolves the real persisted() promise once, then sets alrProBoo, guarded against a stale update after unmount.


		if ( featureId !== 'feat_protect_data' ) return; // What: Other Feature Guard. Why: Only feat_protect_data's own steps ever read alrProBoo, so no other feature needs this checked. How: This returns early for every other featureId.

		let aliMouBoo = true; // What: Alive Mounted Boolean. Why: A resolved promise must not update state after this effect's own cleanup has already fired. How: This starts true, then this effect's own cleanup below flips it false.

		Promise.resolve( navigator.storage && navigator.storage.persisted ? navigator.storage.persisted() : false )
			.then( ( curValBoo ) => { if ( aliMouBoo ) setAlrProBoo( curValBoo ); } ); // What: Persisted Resolve Call. Why: A browser without the Storage API at all must resolve to false rather than throwing. How: This resolves the real persisted() promise (or a plain false), then sets alrProBoo only if this effect is still mounted.

		return () => { aliMouBoo = false; }; // What: Cleanup Function. Why: A reload or featureId change mid-flight must not let a late resolve touch a stale closure's own state. How: This flips aliMouBoo to false on unmount.


	}, [ featureId ] ); // What: Effect Dependency Array. Why: This must re-run whenever featureId itself changes, so a fresh mount for a different feature re-checks fresh. How: featureId is the exact value this effect's own guard reads.



	const cloTouFun = ( staValStr ) => { // What: Close Tour Function. Why: Every path that ends this tour, however it ends, needs the exact same cleanup. How: This resolves this feature's own checklist entry to staValStr, then calls onClose.


		actions.setAppFeatureItem( featureId, { status : staValStr } ); // What: Set App Feature Item Call. Why: The launcher card on Today reads this to know whether to keep showing itself. How: This updates this feature's own appFeatures entry to staValStr.

		onClose(); // What: On Close Call. Why: app.jsx's own actFeaStr must be cleared however this tour ends. How: This calls the onClose prop passed down from app.jsx.


	};



	if ( touPhaStr === 'intro' ) { // What: Intro Phase Check. Why: The intro modal must show before any spotlight step ever does. How: This returns TutorialIntroModal below whenever touPhaStr is 'intro'.


		return (

			<TutorialIntroModal
				icon={ featureId === 'feat_highlights'
					? <span className='ob-wmark-help'>i</span>
					: <Icon name={ feaRecObj.page } size={ 54 } /> }
				title={ feaRecObj.title }
				paragraphs={ [ feaRecObj.body ] }
				pills={ feaRecObj.pills }
				onStart={ () => setTouPhaStr( 'tour' ) }
				onSkip={ () => cloTouFun( 'cancelled' ) }
			/> // What: Tutorial Intro Modal Element. Why: This is this feature's own opening screen, shown before any spotlight step ever does. How: This is passed this feature's own icon/title/paragraphs/pills and the onStart/onSkip handlers above.


		);


	}



	const extSteArr = bldSteFun( featureId, actions, alrProBoo ); // What: Extra Step Array. Why: GuidedTour needs this feature's own full step array beyond Step 1. How: This calls bldSteFun with featureId, actions, and alrProBoo.

	// "Edit your first item" wants a clean, all-collapsed Data page the moment it lands there, any picker the user happened to leave expanded from a previous visit would otherwise make the Your Pickers step's "click a header to expand" instruction confusing (that picker's already open). Runs as Step 1's own run(), which fires at the exact moment its real nav click transitions into Step 2 (see onPrimary's own comment in onboarding-tour-runner.jsx), toggleControlsCollapsed only ever FLIPS, so this only touches pickers actually found expanded (=== false), rather than blindly toggling every picker and accidentally re-opening ones that were already collapsed.
	const colAllFun = () => { // What: Collapse All Function. Why: Step 2 of the edit-item tour expects every picker to start collapsed. How: This flips only the pickers currently found expanded, leaving already-collapsed ones untouched.


		const colMapObj = ( state.ui && state.ui.controlsCollapsed ) || {}; // What: Collapsed Map Object. Why: Only a picker actually found expanded (=== false) should be touched. How: This reads state.ui.controlsCollapsed, falling back to an empty object.

		state.pickers.forEach( ( curPicObj ) => { if ( colMapObj[ curPicObj.id ] === false ) actions.toggleControlsCollapsed( curPicObj.id ); } ); // What: Collapse Forced Call. Why: Every picker actually found expanded must be flipped closed. How: This toggles curPicObj.id only when colMapObj marks it explicitly not collapsed.


	};

	return (


		<GuidedTour
			tourId={ `appfeature-${ featureId }` }
			steps={ featureId === 'feat_highlights' ? extSteArr : [
				buildPageTourStep1( feaRecObj.page, featureId === 'feat_edit_item' ? colAllFun : undefined, extSteArr.length ? 'Next' : 'Done' ), // What: Build Page Tour Step 1 Call. Why: Every feature but feat_highlights prepends this exact shared Step 1. How: This passes this feature's own page, feat_edit_item's own collapse callback (undefined for every other feature), and 'Next'/'Done' depending on whether extSteArr has any steps of its own.
				...extSteArr // What: Extra Steps Spread. Why: Whatever steps this feature has beyond Step 1 must follow it in order. How: This spreads extSteArr after the Step 1 object above.
			] }
			resumeStep={ resTouObj ? resTouObj.step : 0 }
			actions={ actions }
			active={ active }
			selectTab={ selectTab }
			onGoBack={ ( tarSteNum ) => { // What: On Go Back Handler. Why: A real, one-way UI transition (Edit Mode-style collapses, or the highlights toggle) must be reversed by a real control so a Back finds its target step's own selector again. How: This branches on featureId first, then on tarSteNum, driving whichever real DOM control or direct action reverses that specific transition.


				if ( featureId === 'feat_edit_item' ) { // What: Edit Item Back Branch Check. Why: Only the edit-item tour's own steps have this one-way collapse/expand state to reverse. How: This branches on featureId matching 'feat_edit_item'.


					if ( tarSteNum === 1 ) { // What: Your Pickers Collapse Check. Why: Back from Controls Section to Your Pickers must re-collapse whichever picker header(s) got expanded, restoring the same all-collapsed slate Your Pickers originally expects. How: This clicks every currently-expanded picker header, the same real click the user would trigger themselves.


						[ ...document.querySelectorAll( '.data-list .cat-h-l[aria-expanded="true"]' ) ].forEach( ( curHedEle ) => curHedEle.click() ); // What: Header Click Loop. Why: Expanding Picker A, reaching Controls Section, going Back, then expanding Picker B without A ever closing would otherwise leave BOTH open. How: This clicks every currently-expanded .cat-h-l header, collapsing all of them.


					}

					else if ( tarSteNum === 2 ) { // What: Controls Re-Collapse Check. Why: Back from Edit Picker Settings to Controls Section must re-collapse Controls, undoing that step's own real click that expanded it. How: This clicks the real, currently-expanded Controls header.


						const conHdrEle = document.querySelector( '.data-list > .cat .cat-body > button.rd-ctl:nth-of-type(1)[aria-expanded="true"]' ); // What: Controls Header Element. Why: This is the real control that must be clicked shut. How: This looks it up fresh, since it only exists while a picker is expanded.

						if ( conHdrEle ) conHdrEle.click(); // What: Controls Header Click. Why: This must only fire when the control actually exists. How: This clicks conHdrEle.


					}

					else if ( tarSteNum === 3 ) { // What: Controls Re-Expand Check. Why: Back from Items Section to Edit Picker Settings must re-expand Controls, undoing Edit Picker Settings' own outgoing run() (which collapses it on the way to Items Section). How: This clicks the real, currently-collapsed Controls header.


						const conHdrEle = document.querySelector( '.data-list > .cat .cat-body > button.rd-ctl:nth-of-type(1)[aria-expanded="false"]' ); // What: Controls Header Element. Why: This is the real control that must be clicked back open. How: This looks it up fresh, since it only exists while a picker is expanded.

						if ( conHdrEle ) conHdrEle.click(); // What: Controls Header Click. Why: This must only fire when the control actually exists. How: This clicks conHdrEle.


					}

					else if ( tarSteNum === 4 ) { // What: Items Re-Collapse Check. Why: Back from Picker Items to Items Section must re-collapse Items, undoing that step's own real click that expanded it. How: This looks up the Items header via a direct action call, since a native click would silently no-op on its own disabled attribute at this exact instant.


						const catSecEle = document.querySelector( '.data-list > .cat:has(.cat-h-l[aria-expanded="true"])' ); // What: Category Section Element. Why: The picker's own id and Items header both live on its enclosing .cat section. How: This looks up the one currently-expanded picker's own section.
						const picIdeStr = catSecEle && catSecEle.dataset.pickerId;                                             // What: Picker Identifier String. Why: actions.toggleControlsCollapsed needs this picker's own real id. How: This reads catSecEle's own data-picker-id attribute.
						const iteHdrEle = catSecEle && catSecEle.querySelector( '.cat-body > button.rd-ctl:nth-of-type(2)' );  // What: Items Header Element. Why: This is the real control whose own aria-expanded state must be read. How: This looks it up fresh, since it only exists while a picker is expanded.

						if ( picIdeStr && iteHdrEle && iteHdrEle.getAttribute( 'aria-expanded' ) === 'true' ) actions.toggleControlsCollapsed( picIdeStr + ':items' ); // What: Items Collapse Call. Why: Items is disabled during Picker Items itself, so a native click would silently no-op. How: This toggles the picker's own ':items' section closed directly.


					}

					else if ( tarSteNum === 5 ) { // What: Item Re-Collapse Check. Why: Back from Edit Item Settings to Picker Items must re-collapse whichever item got expanded, either by that step's own click or by the user opening a different one while freely exploring. How: This clicks the real, currently-expanded item row.


						const iteRowEle = document.querySelector( '.data-list .rd-item > .rd-row[aria-expanded="true"]' ); // What: Item Row Element. Why: This is the real control that must be clicked shut. How: This looks it up fresh, since it only exists while an item is expanded.

						if ( iteRowEle ) iteRowEle.click(); // What: Item Row Click. Why: This must only fire when the control actually exists. How: This clicks iteRowEle.


					}


				}

				else if ( featureId === 'feat_highlights' ) { // What: Highlights Back Branch Check. Why: Only the highlights tour's own steps have the help-highlight toggle state to reverse. How: This branches on featureId matching 'feat_highlights'.


					if ( tarSteNum === 0 ) { // What: Toggle Off Check. Why: Back from the 2nd step to the 1st expects help mode currently off, but reaching the 2nd step in the first place required a real click that turned it on. How: This clicks the real, currently-on help-highlight toggle.


						const helButEle = document.querySelector( '.help-btn.is-on' ); // What: Help Button Element. Why: This is the real control that must be clicked back off. How: This looks it up fresh, since it only exists while help mode is on.

						if ( helButEle ) helButEle.click(); // What: Help Button Click. Why: This must only fire when the control actually exists. How: This clicks helButEle.


					}


				}


			} }
			onFinish={ () => cloTouFun( 'finished' ) }
			onSkip={ () => { // What: On Skip Handler. Why: Help mode's own on/off flag is local React state inside TabToday, unreachable from here, only reachable via the highlights tour's own 2nd step requireClick target (.help-btn). How: This clicks the real, currently-on help-highlight toggle when featureId is 'feat_highlights', mirroring exactly how finishing normally turns it back off.


				if ( featureId === 'feat_highlights' ) { // What: Highlights Feature Check. Why: Only this feature can leave help mode turned on mid-Step-2 for Skip to undo. How: This branches on featureId matching 'feat_highlights'.


					const helButEle = document.querySelector( '.help-btn.is-on' ); // What: Help Button Element. Why: This is the real control that must be clicked back off if it's still on. How: This looks it up fresh, since it only exists while help mode is on.

					if ( helButEle ) helButEle.click(); // What: Help Button Click. Why: This must only fire when the control actually exists. How: This clicks helButEle.


				}

				cloTouFun( 'skipped' ); // What: Close Tour Call. Why: This funnels Skip through the same cleanup any other exit path off this tour uses. How: This updates this feature's own appFeatures entry to 'skipped' and calls onClose.


			} }
		/> // What: Guided Tour Element. Why: This is the actual running spotlight walkthrough for this feature, mounted once its own intro modal has been accepted or resumed into. How: This is passed this feature's own tourId, step array, and the resume/lifecycle plumbing above.


	);


}

// #endregion AppFeatureTour



// #region AppFeaturesIntroTip

/**
 * AppFeaturesIntroTip = App Features Intro Tip
 *
 * @summary
 * "One Last Thing...", a single, standalone tip shown exactly once, right
 * after the closing checklist's own generate() call actually finishes,
 * pointing at the freshly-appeared App Features section. NOT a per-feature
 * tutorial like AppFeatureTour above (no intro modal, no per-feature id): a
 * single `solo` GuidedTour step (see that flag's own doc comment in
 * onboarding-tour-runner.jsx), which hides the step counter and Skip/Back,
 * showing one full-width "Dismiss" button instead. Mounted directly from
 * TabToday rather than lifted to app.jsx like
 * AppFeatureTour/PageTour/PickerTour are: unlike those, this never navigates
 * to another tab (the whole point is the section already on screen), so it
 * doesn't need real cross-tab selectTab/active plumbing, active='today'/a
 * no-op selectTab is enough, the same pattern PageTour itself used before
 * Pickers/Stats/Data/Settings tours needed it to actually leave Today.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actions - Actions: The actions that mutate the app's own
 *                        persisted state.
 *
 * @returns The single, solo GuidedTour step described above.
 *
 * @example
 * ```tsx
 * AppFeaturesIntroTip({ actions })
 * // => <AppFeaturesIntroTip />
 * ```
 *
*/

function AppFeaturesIntroTip ( { actions } ) {


	return (


		<GuidedTour
			tourId='appfeatures-intro'
			steps={ [ {


				sel        : '.af-section', // What: Selector String. Why: This step highlights the freshly-appeared App Features section. How: GuidedTour spotlights whatever this selector matches.
				tab        : 'today',      // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
				title      : 'One Last Thing...', // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.
				body       : <>Here are some more tutorials that will let you interact with your real, live data as well adjust some of the app's settings. You are all set up and ready to go. <b>Have fun and enjoy your new eased life!</b></>, // What: Body Element. Why: This step's own coach card needs a plain closing description. How: GuidedTour renders this as the step's own descriptive paragraph.
				primary    : 'Dismiss', // What: Primary String. Why: This step's own coach card needs a label for its only action button. How: GuidedTour renders this as the button's own visible text.
				solo       : true,      // What: Solo Boolean. Why: This single step has no step counter, Skip, or Back, just one full-width Dismiss button. How: GuidedTour hides its own step counter and Skip/Back whenever this is true.
				coachAtTop : true       // What: Coach At Top Boolean. Why: The App Features section can run taller than the viewport, same as any other tall-target step. How: GuidedTour skips its own reserve-space math and pins the coach card to the top instead.


			} ] }
			resumeStep={ 0 }
			actions={ actions }
			active='today'
			selectTab={ () => {} }
			onFinish={ () => actions.setOnboarding( { appFeaturesIntroSeen : true } ) }
			onSkip={ () => actions.setOnboarding( { appFeaturesIntroSeen : true } ) }
		/> // What: Guided Tour Element. Why: This is the single, solo spotlight step described above. How: This is passed a fixed tourId, the single step above, and the active='today'/no-op selectTab stand-ins described in this function's own doc comment.


	);


}

// #endregion AppFeaturesIntroTip



export { APP_FEATURES, APP_FEATURE_PAGE_LABELS, appFeatureBlockedReason, AppFeatureTour, AppFeaturesIntroTip }; // What: Named Exports. Why: tab-today.jsx reads APP_FEATURES/APP_FEATURE_PAGE_LABELS/appFeatureBlockedReason and renders AppFeaturesIntroTip, app.jsx renders AppFeatureTour directly. How: This re-exports all five bindings unchanged from their own module.



