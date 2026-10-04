


// #region Imports

import cssModObj from './app-features.module.css'; // What: CSS Module Object. Why: The highlight feature's own intro icon style lives in this file's module. How: This maps each class name in app-features.module.css to its hashed module class.
import React     from 'react';                     // What: React. Why: This file's own FeaTouCom and FeaTipCom components need React in scope to compile their JSX and to call React.useState/React.useEffect. How: This is used directly (React.useState, React.useEffect) below, instead of importing individual named hooks.


import { buiTs1Fun } from './page-steps.jsx';  // What: Build Tour-Step-1 Function. Why: Every App Feature tour reuses this exact shared Step 1, the real nav-button highlight, as its own opening step. How: This is called inside FeaTouCom below, passed this feature's own page, an optional run side effect, and a primary button label.
import { GuiTouCom } from './tour-runner.jsx'; // What: Guided Tour Component. Why: This is the generic spotlight-tour engine that actually drives each App Feature tutorial once its own intro modal is accepted. How: This is rendered while touPhaStr is 'tour', passed this file's own per-feature step array.
import { IcoSvgCom } from '../ui/icon.jsx';    // What: Icon Svg Component. Why: The intro modal needs a recognizable glyph matching the current feature's own page. How: This is rendered inside the intro modal's icon prop below.
import { IntModCom } from './intro-modal.jsx'; // What: Intro Modal Component. Why: Each App Feature tutorial opens on this generic intro modal before any spotlight step ever shows. How: This is rendered while touPhaStr is 'intro', passed this feature's own icon/title/paragraphs/pills.

// #endregion Imports



/**
 * app-features.jsx = App Features
 *
 * @summary
 * App Features, a SEPARATE, later-stage set of mini-tours shown on Today only
 * once the user has generated their first real todo list (see tab-today.jsx's
 * shoFeaBoo), pinned as the LAST group on the page, below Reminders, Page
 * Tours (mutually exclusive with these anyway, see shoFeaBoo's own comment)
 * and every real picker group. Unlike every earlier onboarding tour, these
 * operate on the user's own REAL data rather than disposable samples: there is
 * always at least one real picker by this point (see onboarding-checklist.js's
 * reaGenFun gate), and these are deliberately NOT tracked by the checklist
 * "engine" at all: no donCouNum/total ring or streak participation, no closing
 * Generate-style card, no counting toward anything. Resolved state lives in
 * its own state.onboarding.appFeatures map (see store.js's setFeaFun), reset
 * to {} whenever Replay Tour is clicked in Settings so these reappear
 * alongside it (see tab-settings.jsx's own replay button).
 *
 * Every App Feature tour opens on the shared Step 1 nav-button highlight from
 * onboarding/page-steps.jsx's own buiTs1Fun (except feat_highlights, whose
 * target is already on screen), then walks that feature's own steps from
 * buiTesFun.
 *
 * Sections:
 *  - Constants
 *  - Helpers
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

// #region APP_FEA_ARR

/**
 * APP_FEA_ARR = App Feature Array
 *
 * @summary
 * The ordered catalog of every App Feature tutorial. Every property here is
 * read only by this file and by tab-today.jsx's own AppFeaCom and progress
 * counters, none of it persisted (the persisted map itself is keyed by
 * ideStr's own string VALUE, e.g. 'feat_manual_pick', not by this
 * property's own name), so all 7 fields follow the usual 6-character
 * object-property convention.
 *
 * Every entry below shares this exact shape, and none of the 8 entries
 * repeat these same fields' own boilerplate comments on their own lines
 * (see the "Repeated-shape object literals" comment exception in
 * CLAUDE.md); a leading comment directly above a specific entry still
 * explains anything genuinely unique to that one entry instead:
 *
 * - `bodEle` (Element): Body Element is the intro modal's own plain
 *   description of what the tutorial covers, rendered as the sole entry
 *   of IntModCom's own parEleArr prop.
 *
 * - `ideStr` (String): Identifier String uniquely identifies this
 *   feature, keying state.onboarding.appFeatures and this tour's own
 *   GuiTouCom touIdeStr; FeaTouCom below searches APP_FEA_ARR for the
 *   entry whose own ideStr matches its own feaIdeStr prop.
 *
 * - `labStr` (String): Label String is the launcher card's own visible
 *   title on Today, rendered directly as the card's own name.
 *
 * - `pagStr` (String): Page String says which real nav tab this
 *   feature's own Step 1 highlights; buiTs1Fun below reads this
 *   to find the matching NAV_TAR_OBJ entry.
 *
 * - `pilArr` (Array): Pills Array holds 3 short tags describing this
 *   tutorial, rendered as the intro modal's own pill row (IntModCom's
 *   own pilLabArr prop).
 *
 * - `timStr` (String, optional): Time String is a real, user-confirmed
 *   estimate (same convention as ONB_EPT_ARR's own timStr field in
 *   onboarding-checklist.js), shown next to the launcher card's own
 *   label whenever present; tab-today.jsx renders feaRcdObj.timStr
 *   directly whenever it's truthy. Only a feature with real step-by-step
 *   content built out so far gets one; the rest stay untimed until they
 *   do too.
 *
 * - `titStr` (String): Title String is the intro modal's own heading
 *   naming this tutorial, rendered as IntModCom's own titHeaStr prop.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const APP_FEA_ARR = [ // What: App Feature Array. Why: Every App Feature tutorial's own launcher card and intro modal read their content from here. How: This is searched by ideStr in FeaTouCom below and read in order by tab-today.jsx's own App Features section.


	{ // What: Manual Picks Entry. Why: This is the launcher-card and intro-modal content descriptor for the Manual Picks tutorial. How: This is read by ideStr wherever this feature's own card or modal needs its copy.


		bodEle : <>This tutorial will show you <b>how to manually run one of your pickers and send its result straight to your todo list</b>, without waiting for the next automatic generation.</>,
		ideStr : 'feat_manual_pick',
		labStr : 'Make your first manual pick',
		pagStr : 'picker',
		pilArr : [ 'pickers page', 'run a picker', 'manual pick' ],
		timStr : '1 min',
		titStr : 'Manual Picks'


	},

	{ // What: Editing Items Entry. Why: This is the launcher-card and intro-modal content descriptor for the Editing Items tutorial. How: This is read by ideStr wherever this feature's own card or modal needs its copy.


		bodEle : <>This tutorial will show you <b>how to edit one of your own items</b>. You will be able to update names, weights, or other values whenever your needs change.</>,
		ideStr : 'feat_edit_item',
		labStr : 'Edit your first item',
		pagStr : 'data',
		pilArr : [ 'data page', 'edit item', 'update values' ],
		timStr : '1 min',
		titStr : 'Editing Items'


	},

	{ // What: Generator Run Time Entry. Why: This is the launcher-card and intro-modal content descriptor for the Generator Run Time tutorial. How: This is read by ideStr wherever this feature's own card or modal needs its copy.


		bodEle : <>This tutorial will show you <b>how to change what time of day your todo list automatically generates</b>, so it is ready exactly when you want it.</>,
		ideStr : 'feat_run_time',
		labStr : 'Adjust your generator run time',
		pagStr : 'settings',
		pilArr : [ 'settings page', 'daily generator', 'run time' ],
		timStr : '< 1 min',
		titStr : 'Generator Run Time'


	},

	{ // What: App Theme Entry. Why: This is the launcher-card and intro-modal content descriptor for the App Theme tutorial. How: This is read by ideStr wherever this feature's own card or modal needs its copy.


		bodEle : <>This tutorial will show you <b>how to switch between light and dark mode</b>, or customize the app’s colors to your own taste.</>,
		ideStr : 'feat_theme',
		labStr : 'Change your app theme',
		pagStr : 'settings',
		pilArr : [ 'settings page', 'appearance', 'theme' ],
		timStr : '< 1 min',
		titStr : 'App Theme'


	},

	{ // What: Celebration Animation Entry. Why: This is the launcher-card and intro-modal content descriptor for the Celebration Animation tutorial. How: This is read by ideStr wherever this feature's own card or modal needs its copy.


		bodEle : <>This tutorial will show you <b>how to change the animation that plays whenever you complete your entire todo list</b> for the day.</>,
		ideStr : 'feat_celebration',
		labStr : 'Change your celebration animation',
		pagStr : 'settings',
		pilArr : [ 'settings page', 'appearance', 'animation' ],
		timStr : '< 1 min',
		titStr : 'Celebration Animation'


	},

	{ // What: Picker Animation Entry. Why: This is the launcher-card and intro-modal content descriptor for the Picker Animation tutorial. How: This is read by ideStr wherever this feature's own card or modal needs its copy.


		bodEle : <>This tutorial will show you <b>how to change the animation that plays on the Pickers page</b> whenever you manually direct it to select one of its items.</>,
		ideStr : 'feat_pick_anim',
		labStr : 'Change your picker animation',
		pagStr : 'settings',
		pilArr : [ 'settings page', 'appearance', 'animation' ],
		timStr : '< 1 min',
		titStr : 'Picker Animation'


	},

	{ // What: Highlight Feature Entry. Why: This is the launcher-card and intro-modal content descriptor for the Highlight Feature tutorial. How: This is read by ideStr wherever this feature's own card or modal needs its copy.


		bodEle : <>This tutorial will show you <b>how to use the highlight feature</b>, which lets you tap the info icon on any page to get an on demand explanation of everything on screen.</>,
		ideStr : 'feat_highlights',
		labStr : 'Use the highlight feature',
		pagStr : 'today',
		pilArr : [ 'help highlights', 'on demand', 'any page' ],
		timStr : '< 1 min',
		titStr : 'Highlight Feature'


	},

	{ // What: Protect Your Data Entry. Why: This is the launcher-card and intro-modal content descriptor for the Protect Your Data tutorial. How: This is read by ideStr wherever this feature's own card or modal needs its copy.


		bodEle : <>This tutorial will show you <b>how to protect your data from being deleted by your browser</b>, and to keep your data even more safe, how to install the app.</>,
		ideStr : 'feat_protect_data',
		labStr : 'Protect your data / Install the app',
		pagStr : 'settings',
		pilArr : [ 'settings page', 'data control', 'install app' ],
		timStr : '< 1 min',
		titStr : 'Protect Your Data'


	}


];

// #endregion APP_FEA_ARR



/**
 * PAG_LAB_OBJ = Page Label Object
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

const PAG_LAB_OBJ = { // What: Page Label Object. Why: tab-today.jsx's own AppFeatureCard reads this by a feature's own page id for its kicker text. How: This is looked up by APP_FEA_ARR entries' own page field wherever this file or tab-today.jsx needs the real tab's display name.


	data     : 'Data',     // What: Data Label. Why: This names the Data tab for any feature whose own page is 'data'. How: This is read back as PAG_LAB_OBJ.data.
	picker   : 'Pickers',  // What: Pickers Label. Why: This names the Pickers tab for any feature whose own page is 'picker'. How: This is read back as PAG_LAB_OBJ.picker.
	settings : 'Settings', // What: Settings Label. Why: This names the Settings tab for any feature whose own page is 'settings'. How: This is read back as PAG_LAB_OBJ.settings.
	stats    : 'Stats',    // What: Stats Label. Why: This names the Stats tab for any feature whose own page is 'stats'. How: This is read back as PAG_LAB_OBJ.stats.
	today    : 'Today'     // What: Today Label. Why: This names the Today tab for any feature whose own page is 'today'. How: This is read back as PAG_LAB_OBJ.today.


};



/**
 * TIP_STE_OBJ = Tip Step Object
 *
 * @summary
 * The single solo step FeaTipCom shows, pointing at the freshly-appeared App
 * Features section. It reads nothing from FeaTipCom's own scope, so it lives
 * here once rather than being rebuilt on every render.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const TIP_STE_OBJ = { // What: Tip Step Object. Why: FeaTipCom's own GuiTouCom needs this one step. How: This is passed as the sole entry of FeaTipCom's own steObjArr prop.


	catBoo : true,                                    // What: Coach-At-Top Boolean. Why: The App Features section can run taller than the viewport, same as any other tall-target step. How: GuiTouCom skips its own reserve-space math and pins the coach card to the top instead.
	priStr : 'Dismiss',                               // What: Primary String. Why: This step's own coach card needs a label for its only action button. How: GuiTouCom renders this as the button's own visible text.
	selStr : '[data-element-name-hook~="appFeaSec"]', // What: Selector String. Why: This step highlights the freshly-appeared App Features section. How: GuiTouCom spotlights whatever this selector matches.
	solBoo : true,                                    // What: Solo Boolean. Why: This single step has no step counter, Skip, or Back, just one full-width Dismiss button. How: GuiTouCom hides its own step counter and Skip/Back whenever this is true.
	tabStr : 'today',                                 // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.
	titStr : 'One Last Thing...',                     // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuiTouCom renders this as the step's own heading text.

	bodEle : <>Here are some more tutorials that will let you interact with your real, live data as well adjust some of the app's settings. You are all set up and ready to go. <b>Have fun and enjoy your new eased life!</b></> // What: Body Element. Why: This step's own coach card needs a plain closing description. How: GuiTouCom renders this as the step's own descriptive paragraph.


};

// #endregion Constants



// #region Helpers

// #region bloReaFun

/**
 * bloReaFun = Blocked Reason Function
 *
 * @summary
 * "Make your first manual pick" needs a real target to run the tour against:
 * a real (non-hidden), non-sample picker with at least 2 items. 2, not 1,
 * Step 4's own copy invites a Re-roll ("give it a try"), and with a single
 * item Re-roll would deterministically return the same result every time,
 * making that invitation pointless. Unlike the checklist's own amber "needs
 * attention" cue on the Create-a-picker cards (which are always runnable,
 * just flagged as unfinished, see onboarding-checklist.js's reaPicFun),
 * this actually blocks the card: there's no partial tour to offer without a
 * real picker to run one on. No other App Feature has a requirement yet, so
 * this stays a one-off check rather than a generic per-feature schema field.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param feaIdeStr - Feature Identifier String: The feature id tab-today.jsx's
 *                    own AppFeaCom is asking about.
 * @param staAppObj - State App Object: The entire app's own persisted state.
 *
 * @returns A user-facing reason string whenever this feature is blocked,
 * otherwise null.
 *
 * @example
 * ```ts
 * bloReaFun( feaIdeStr, staAppObj )
 * // => a blocked-reason string, or null
 * ```
 *
*/

function bloReaFun ( feaIdeStr, staAppObj ) {


	if ( feaIdeStr !== 'feat_manual_pick' ) return null; // What: Other Feature Guard. Why: No other App Feature has a requirement yet. How: This returns null immediately for any feaIdeStr besides 'feat_manual_pick'.



	const iteAllArr = staAppObj.items || []; // What: Item All Array. Why: The eligibility check below needs every real item to count how many belong to each picker. How: This reads staAppObj.items, falling back to an empty array.

	const eliPicBoo = ( staAppObj.pickers || [] ).some( ( curPicObj ) => !curPicObj.hidden && iteAllArr.filter( ( curIteObj ) => curIteObj.pickerId === curPicObj.id ).length >= 2 ); // What: Eligible Picker Boolean. Why: The manual-pick tour needs at least one real, non-hidden picker with 2+ items to run against. How: This checks whether any non-hidden picker has 2 or more of its own items among iteAllArr.



	return eliPicBoo ? null : 'Create a picker with at least 2 items first, then come back to try this.'; // What: Blocked Reason Return. Why: The launcher card needs a user-facing string whenever no eligible picker exists yet, otherwise null to stay unblocked. How: This returns null when eliPicBoo is true, otherwise the reason string.


}

// #endregion bloReaFun



// #region buiTesFun

/**
 * buiTesFun = Build Tour-Extra-Steps Function
 *
 * @summary
 * Steps beyond Step 1 (the shared nav-highlight every App Feature tour starts
 * with, built fresh per render below), keyed by feature id, empty for any
 * other feature id. Mirrors onboarding/page-steps.jsx's own buiTesFun (same
 * reasoning: filled in incrementally as each tutorial gets its own pass, not
 * all at once). Takes actStoObj (built fresh per render, like that file's own
 * buiTesFun) since feat_edit_item's own Step 2 needs to call
 * actStoObj.togColFun directly, see that step's own runFun comment for why a
 * real click won't do.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param feaIdeStr - Feature Identifier String: This feature's own id, e.g.
 *                    'feat_edit_item'.
 * @param actStoObj - Action Store Object: The shared app actions object,
 *                    called directly by feat_edit_item's own steps.
 * @param alrProBoo - Already Protected Boolean: Whether this browser already
 *                    persists storage, which drops feat_protect_data's own
 *                    first step.
 *
 * @returns This feature's own steps beyond Step 1, as GuiTouCom step objects,
 * or an empty array for any other feature id.
 *
 * @example
 * ```ts
 * buiTesFun( 'feat_edit_item', actStoObj, false ) // => [ step, ... ]
 * ```
 *
*/

const buiTesFun = ( feaIdeStr, actStoObj, alrProBoo ) => { // What: Build Tour-Extra-Steps Function. Why: FeaTouCom below needs this feature's own full ordered step array beyond Step 1. How: This branches on feaIdeStr, returning that feature's own real step array, or an empty array for any feature that only has Step 1 so far.


	if ( feaIdeStr === 'feat_manual_pick' ) { // What: Manual Pick Branch Check. Why: The manual-pick tour's own steps only apply to this one feature. How: This returns its own step array whenever feaIdeStr matches.


		return [ // What: Manual Pick Tour Steps Return. Why: The caller needs this feature tour's own full ordered step array beyond Step 1. How: This returns the manual-pick tour's own remaining steps, each carrying its own selector/copy/navigation fields.


			{ // What: Picker Selection Step. Why: This is the manual-pick tour's own 2nd step. How: This lets the user choose a different picker than whichever one was already active before Manual Generation below.


				bacBoo : true,                                                                          // What: Back Boolean. Why: The user should always be able to return to Step 1's own nav highlight. How: GuiTouCom shows its own Back button whenever this is true.
				priStr : 'Next',                                                                        // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				selStr : '[data-element-name-hook~="picTabDiv"] [data-element-name-hook~="picTabBut"]', // What: Selector String. Why: This step highlights every existing picker's own tab. How: GuiTouCom spotlights whatever this selector matches.
				tabStr : 'picker',                                                                      // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.
				titStr : 'Picker Selection',                                                            // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuiTouCom renders this as the step's own heading text. // Title/body copied verbatim from the Pickers page tour's own spsObj step. Has to come before Manual Generation below (the user needs to choose WHICH picker before running one): that's the whole reason this exists, letting the user pick a different picker than whichever one happened to already be active. No cirBoo, same as the page tour's own step, selecting a different picker here is purely optional.

				bodEle : <>These buttons will <b>allow you to select a specific picker</b> in order to initiate a manual picker generation, as well as edit or delete its items.</> // What: Body Element. Why: This step's own coach card needs a plain description of what these buttons do. How: GuiTouCom renders this as the step's own descriptive paragraph. // Title/body copied verbatim from the Pickers page tour's own spsObj step. Has to come before Manual Generation below (the user needs to choose WHICH picker before running one): that's the whole reason this exists, letting the user pick a different picker than whichever one happened to already be active. No cirBoo, same as the page tour's own step, selecting a different picker here is purely optional.


			},

			{ // What: Manual Generation Step. Why: This is the manual-pick tour's own 3rd step, the real Pick One button. How: This spends the whole spin animation on this step's own already-resolved coach, only advancing once the send button actually appears.


				advSelStr : '[data-element-name-hook~="picSenBut"]',                                                       // What: Advance Selector String. Why: Pick One kicks off a multi-second spin animation, so this step must hold until the pick actually resolves. How: GuiTouCom polls for this selector before advancing past this step.
				bacBoo    : true,                                                                                          // What: Back Boolean. Why: The user should always be able to return to Picker Selection. How: GuiTouCom shows its own Back button whenever this is true.
				catBoo    : true,                                                                                          // What: Coach-At-Top Boolean. Why: A short viewport (iPhone SE height or shorter) can't fit the coach above picRunDiv without overlapping it. How: GuiTouCom skips its own reserve-space math and pins the coach card to the top instead.
				cirBoo    : true,                                                                                          // What: Click-Is-Required Boolean. Why: The click itself is the thing being taught, not just a gate. How: GuiTouCom disables Next and only advances once the real target is clicked.
				cliSelStr : '[data-element-name-hook~="picOneBut"]',                                                       // What: Click Selector String. Why: The cirBoo guard must stay scoped to the button specifically even once the fallback widens the highlight. How: This is read by the click-guard/cirBoo logic separately from selStr.
				priStr    : 'Next',                                                                                        // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				pulSelStr : '[data-element-name-hook~="picOneBut"]:not(:disabled)',                                        // What: Pulse Selector String. Why: There is nothing left to click once the highlight has widened to frame the window, so the pulse should stop there too. How: This matches the same primary alternative as selStr.
				selStr    : '[data-element-name-hook~="picOneBut"]:not(:disabled), [data-element-name-hook~="picRunDiv"]', // What: Selector String. Why: This step highlights the idle Pick One button, falling back to framing the whole stage once it goes busy. How: GuiTouCom spotlights the first alternative that matches.
				tabStr    : 'picker',                                                                                      // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.
				titStr    : 'Manual Generation',                                                                           // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuiTouCom renders this as the step's own heading text. // Title/body copied verbatim from the Pickers page tour's own mpgObj step (PIC_TAR_OBJ in onboarding/page-steps.jsx), same functionality, same explanation, same two-phase highlight: before the click, picOneBut:not(:disabled) matches the idle "Pick One" button, so the pulse (touSpoDiv--pulse) lands tight on the actual button instead of the whole window. The button's disabled state (set the instant the click fires, well before the spin finishes) excludes that first selector immediately on click, so the fallback to framing picRunDiv (which wraps the picker's stage + actions as one combined box) kicks in right as the spin starts, not once it ends. cliSelStr keeps the cirBoo guard scoped to the button specifically even once the fallback is in play. pulSelStr matches the exact same primary alternative as selStr, there's nothing left to click once the highlight has widened to frame the window, so the pulse stops there too. No sttBoo/stbBoo override, the default pad-based briTarFun already smooth-scrolls it into view. advSelStr (not an immediate advance): Pick One kicks off a multi-second spin animation, so stay on THIS step's already-resolved coach for the whole wait, same reasoning as the page tour's own step, whose advSelStr this copies (Step 4's own cliSelStr below). catBoo: true, on a short viewport (iPhone SE height, 667px, or shorter) the coach can't fit above picRunDiv without overlapping its top edge, pins the coach to safTopFun instead, same treatment as Step 5's own fix (see that step's comment for the full reasoning).

				bodEle : <>The "Pick One" button will allow you to <b>run a manual pick generation</b> for any given picker, so that you do not have to completely rely on the todo list's auto generation feature on the Today page. Click the "Pick One" button now to see how this works.</> // What: Body Element. Why: This step's own coach card needs a plain description plus an explicit click instruction. How: GuiTouCom renders this as the step's own descriptive paragraph. // Title/body copied verbatim from the Pickers page tour's own mpgObj step (PIC_TAR_OBJ in onboarding/page-steps.jsx), same functionality, same explanation, same two-phase highlight: before the click, picOneBut:not(:disabled) matches the idle "Pick One" button, so the pulse (touSpoDiv--pulse) lands tight on the actual button instead of the whole window. The button's disabled state (set the instant the click fires, well before the spin finishes) excludes that first selector immediately on click, so the fallback to framing picRunDiv (which wraps the picker's stage + actions as one combined box) kicks in right as the spin starts, not once it ends. cliSelStr keeps the cirBoo guard scoped to the button specifically even once the fallback is in play. pulSelStr matches the exact same primary alternative as selStr, there's nothing left to click once the highlight has widened to frame the window, so the pulse stops there too. No sttBoo/stbBoo override, the default pad-based briTarFun already smooth-scrolls it into view. advSelStr (not an immediate advance): Pick One kicks off a multi-second spin animation, so stay on THIS step's already-resolved coach for the whole wait, same reasoning as the page tour's own step, whose advSelStr this copies (Step 4's own cliSelStr below). catBoo: true, on a short viewport (iPhone SE height, 667px, or shorter) the coach can't fit above picRunDiv without overlapping its top edge, pins the coach to safTopFun instead, same treatment as Step 5's own fix (see that step's comment for the full reasoning).


			},

			{ // What: Add To Todo List Step. Why: This is the manual-pick tour's own 4th step, the real Send to Today button. How: This lets Re-roll stay usable while blocking Done, so leaving can't discard this step's own target out from under the user.


				advDelNum : 1600,                                                                 // What: Advance Delay Number. Why: The "Sent!" confirmation must be visible before this step advances. How: GuiTouCom waits this many milliseconds after the click before advancing.
				bacBoo    : true,                                                                 // What: Back Boolean. Why: The user should always be able to return to Manual Generation. How: GuiTouCom shows its own Back button whenever this is true.
				catBoo    : true,                                                                 // What: Coach-At-Top Boolean. Why: picRunDiv is even taller here, with the result and all three action buttons showing. How: GuiTouCom skips its own reserve-space math and pins the coach card to the top instead.
				cirBoo    : true,                                                                 // What: Click-Is-Required Boolean. Why: The click itself is the thing being taught, not just a gate. How: GuiTouCom disables Next and only advances once the real target is clicked.
				cliSelStr : '[data-element-name-hook~="picSenBut"]',                              // What: Click Selector String. Why: The cirBoo guard must stay scoped to Send to Today specifically. How: This is read by the click-guard/cirBoo logic separately from selStr.
				cptSelStr : '[data-element-name-hook~="picRerBut"]',                              // What: Click-Pass-Through Selector String. Why: Re-roll must stay genuinely usable without also satisfying cirBoo, so the user can re-roll as many times as they like before sending. How: A click matching this selector reaches its own real handler without advancing this step.
				priStr    : 'Next',                                                               // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				pulSelStr : '[data-element-name-hook~="picSenBut"]:not([data-pick-sent-active])', // What: Pulse Selector String. Why: There is nothing left to click once the highlight has widened to frame the window, so the pulse should stop there too. How: This matches the same primary alternative as selStr.
				selStr    : '[data-element-name-hook~="picSenBut"]:not([data-pick-sent-active]), [data-element-name-hook~="picRunDiv"]', // What: Selector String. Why: This step highlights the real Send to Today button, falling back to framing the whole stage once it's sent. How: GuiTouCom spotlights the first alternative that matches.
				tabStr    : 'picker',                                                             // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.
				titStr    : 'Add to Todo List',                                                   // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuiTouCom renders this as the step's own heading text. // Title/body copied verbatim from the Pickers page tour's own atlObj step, same two-phase highlight too: before the click, picSenBut:not([data-pick-sent-active]) matches the real Send to Today button, so the pulse lands tight on it instead of the whole window. Clicking it flips phase to 'sent' SYNCHRONOUSLY (see senTodFun in picker-view.jsx), which sets data-pick-sent-active immediately, so the fallback to framing picRunDiv kicks in right on click, needed since this step's own advDelNum (below) holds the tour here for 1600ms after the click so the "Sent!" label swap + stage checkmark can play out, and the highlight needs to have already widened to frame that whole confirmation rather than staying pinned to a single button mid-animation. pulSelStr matches the exact same primary alternative as selStr, same reasoning as the previous step. cliSelStr narrows the actual click-guard/cirBoo target down to Send to Today specifically, only that click satisfies this step, matching the page tour's own behavior exactly. Re-roll is a deliberate exception, unlike the page tour (which disables it outright via tab-picker.jsx's intSenBoo): cptSelStr lets it reach its own real handler, a genuine re-roll, own animation, WITHOUT also satisfying cirBoo, so the user can re-roll as many times as they like before eventually sending. Done stays blocked (tab-picker.jsx's own disDonBoo, gated on this exact touIdeStr plus touSteNum) since leaving would discard the pick AND make this step's own target, the done/sent view itself, vanish, reverting to the pre-pick "Pick One" button the previous step already moved past. catBoo: true, same short-viewport overlap as the previous step (same picRunDiv target, now even taller with the result + all three action buttons showing), see that step's own comment for the full reasoning.

				bodEle : <>The "Send to Today" button will <b>add the manually generated pick to your todo list on the Today page</b>. Go ahead and click the "Send to Today" button now to give it a try.</> // What: Body Element. Why: This step's own coach card needs a plain description plus an explicit click instruction. How: GuiTouCom renders this as the step's own descriptive paragraph. // Title/body copied verbatim from the Pickers page tour's own atlObj step, same two-phase highlight too: before the click, picSenBut:not([data-pick-sent-active]) matches the real Send to Today button, so the pulse lands tight on it instead of the whole window. Clicking it flips phase to 'sent' SYNCHRONOUSLY (see senTodFun in picker-view.jsx), which sets data-pick-sent-active immediately, so the fallback to framing picRunDiv kicks in right on click, needed since this step's own advDelNum (below) holds the tour here for 1600ms after the click so the "Sent!" label swap + stage checkmark can play out, and the highlight needs to have already widened to frame that whole confirmation rather than staying pinned to a single button mid-animation. pulSelStr matches the exact same primary alternative as selStr, same reasoning as the previous step. cliSelStr narrows the actual click-guard/cirBoo target down to Send to Today specifically, only that click satisfies this step, matching the page tour's own behavior exactly. Re-roll is a deliberate exception, unlike the page tour (which disables it outright via tab-picker.jsx's intSenBoo): cptSelStr lets it reach its own real handler, a genuine re-roll, own animation, WITHOUT also satisfying cirBoo, so the user can re-roll as many times as they like before eventually sending. Done stays blocked (tab-picker.jsx's own disDonBoo, gated on this exact touIdeStr plus touSteNum) since leaving would discard the pick AND make this step's own target, the done/sent view itself, vanish, reverting to the pre-pick "Pick One" button the previous step already moved past. catBoo: true, same short-viewport overlap as the previous step (same picRunDiv target, now even taller with the result + all three action buttons showing), see that step's own comment for the full reasoning.


			},

			{ // What: Picker Items Step. Why: This is the manual-pick tour's own final step. How: This narrates Edit/Delete as disabled while leaving Send to Today genuinely usable as a second valid way to land a pick.


				bacBoo : true,                                    // What: Back Boolean. Why: The user should always be able to return to Add to Todo List. How: GuiTouCom shows its own Back button whenever this is true.
				catBoo : true,                                    // What: Coach-At-Top Boolean. Why: A pool of even a few real items can be tall enough to overlap the coach on a short viewport. How: GuiTouCom skips its own reserve-space math and pins the coach card to the top instead.
				priStr : 'Done',                                  // What: Primary String. Why: This is the manual-pick tour's own last step, so its main action finishes the tour instead of advancing. How: GuiTouCom reads a 'Done' priStr as the signal to call onFinTouFun.
				selStr : '[data-element-name-hook~="pooIteDiv"]', // What: Selector String. Why: This step highlights the whole item pool, excluding the Add Item button. How: GuiTouCom spotlights whatever this selector matches.
				tabStr : 'picker',                                // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.
				titStr : 'Picker Items',                          // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuiTouCom renders this as the step's own heading text. // Title/body copied (lightly reworded) from the Pickers page tour's own pivObj step. Same target (pooIteDiv, excludes "+ Add item", see that step's own comment in onboarding/page-tours.jsx), but unlike the page tour (which disables ALL THREE per-item buttons via tab-picker.jsx's disIteBoo), only Edit and Delete stay narrated-not-usable here (disEdiBoo, a separate flag gated on this exact touIdeStr plus touSteNum): Send to Today stays genuinely usable, since it's real data and a second valid way to land a pick besides Manual Generation above. No cirBoo: Send to Today is optional here, same "stays usable but doesn't gate advancing" treatment as Re-roll in the previous step, clicking anywhere inside pooIteDiv (including Send to Today) is already "on target" for the click-guard, so no cptSelStr is needed the way Re-roll required one. catBoo: true, on a short viewport (e.g. iPhone SE) a pool of even a few real items is tall enough that the coach can't fit either above or below it without overlapping, pins the coach to safTopFun and lets the pool run off the bottom instead, same tall-target treatment as the Data tour's own .datLisDiv step and every Settings section, see catBoo's own doc comment in onboarding/tour-runner.jsx. Each genuinely-usable Send to Today button also gets its own fading pooSenBut--tour pulse (picker-view.jsx's higSenBoo), same per-element pulse-inside-a-bigger-spotlight idea as the Edit Item tour's own --tour modifier targets, so the one real actionable button per item still stands out inside this step's whole-pool highlight. Skips an already-sent or already-on-Today item's own (disabled) button, nothing to invite a click toward there.

				bodEle : <>Here you can <b>view all items in this picker's pool</b>. You can see a given item's values, if applicable, as well as the <b>Send to Today, Edit and Delete buttons</b>. The "Edit" and "Delete" buttons are disabled for this tutorial but feel free to try the "Send to Today" button on any item now. This concludes the Make your first manual pick tutorial, click Done when you are ready.</> // What: Body Element. Why: This step's own coach card needs a plain description of the pool plus a closing instruction. How: GuiTouCom renders this as the step's own descriptive paragraph. // Title/body copied (lightly reworded) from the Pickers page tour's own pivObj step. Same target (pooIteDiv, excludes "+ Add item", see that step's own comment in onboarding/page-tours.jsx), but unlike the page tour (which disables ALL THREE per-item buttons via tab-picker.jsx's disIteBoo), only Edit and Delete stay narrated-not-usable here (disEdiBoo, a separate flag gated on this exact touIdeStr plus touSteNum): Send to Today stays genuinely usable, since it's real data and a second valid way to land a pick besides Manual Generation above. No cirBoo: Send to Today is optional here, same "stays usable but doesn't gate advancing" treatment as Re-roll in the previous step, clicking anywhere inside pooIteDiv (including Send to Today) is already "on target" for the click-guard, so no cptSelStr is needed the way Re-roll required one. catBoo: true, on a short viewport (e.g. iPhone SE) a pool of even a few real items is tall enough that the coach can't fit either above or below it without overlapping, pins the coach to safTopFun and lets the pool run off the bottom instead, same tall-target treatment as the Data tour's own .datLisDiv step and every Settings section, see catBoo's own doc comment in onboarding/tour-runner.jsx. Each genuinely-usable Send to Today button also gets its own fading pooSenBut--tour pulse (picker-view.jsx's higSenBoo), same per-element pulse-inside-a-bigger-spotlight idea as the Edit Item tour's own --tour modifier targets, so the one real actionable button per item still stands out inside this step's whole-pool highlight. Skips an already-sent or already-on-Today item's own (disabled) button, nothing to invite a click toward there.


			}


		];


	}



	if ( feaIdeStr === 'feat_edit_item' ) { // What: Edit Item Branch Check. Why: The edit-item tour's own steps only apply to this one feature. How: This returns its own step array whenever feaIdeStr matches.


		return [ // What: Edit Item Tour Steps Return. Why: The caller needs this feature tour's own full ordered step array beyond Step 1. How: This returns the edit-item tour's own remaining steps, each carrying its own selector/copy/navigation fields.


			{ // What: Your Pickers Step. Why: This is the edit-item tour's own 2nd step. How: This stages a clean, all-collapsed Controls/Items slate for whichever picker the user expanded, before Step 3 highlights it. // Highlights .datLisDiv, same target as the Data page tour's own pmsObj step (DAT_TAR_OBJ in onboarding/page-steps.jsx), ALL of the user's real pickers, not one specific picker, since which one they choose to edit is up to them. cliSelStr narrows the actual click-guard/cirBoo target down to .catHeaBut (each picker's own collapsible header button), any one of them expanding satisfies this step, matching "click on one of the pickers headers" per the user's own framing, not just a specific picker's. catBoo: true, .datLisDiv can be far taller than the viewport once the user has more than a couple pickers, same "pin the coach to the top, let the list run off the bottom" treatment as the Data page tour's own equivalent step (see that step's own comment) and every other tall-target step in this app, see catBoo's own doc comment in onboarding/tour-runner.jsx.


				bacBoo    : true,                                    // What: Back Boolean. Why: The user should always be able to return to Step 1's own nav highlight. How: GuiTouCom shows its own Back button whenever this is true.
				catBoo    : true,                                    // What: Coach-At-Top Boolean. Why: .datLisDiv can run far taller than the viewport once the user has more than a couple pickers. How: GuiTouCom skips its own reserve-space math and pins the coach card to the top instead.
				cirBoo    : true,                                    // What: Click-Is-Required Boolean. Why: The click itself is the thing being taught, not just a gate. How: GuiTouCom disables Next and only advances once the real target is clicked.
				cliSelStr : '[data-element-name-hook~="catHeaBut"]', // What: Click Selector String. Why: Any one picker header expanding must satisfy this step, matching "click on one of the pickers headers" rather than one specific picker. How: This is read by the click-guard/cirBoo logic separately from selStr.
				priStr    : 'Next',                                  // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				pulSelStr : '[data-ob-none]',                        // What: Pulse Selector String. Why: The default cirBoo pulse must be suppressed in favor of each picker header's own individual pulse. How: This is a selector chosen to never match anything currently on screen. // Suppresses the tour engine's own default cirBoo pulse (one ring around the whole .datLisDiv box), see tab-data.jsx's own hetPicBoo comment for why: each individual picker header pulses on its own (.datCatSec--tour) instead of one big ring around the entire list. pulSelStr just needs to never match anything currently on screen.
				selStr    : '[data-element-name-hook~="datLisDiv"]', // What: Selector String. Why: This step highlights ALL of the user's real pickers, since which one they edit is up to them. How: GuiTouCom spotlights whatever this selector matches.
				tabStr    : 'data',                                  // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.
				titStr    : 'Your Pickers',                          // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuiTouCom renders this as the step's own heading text.

				bodEle : <>This is where you can <b>view and edit all of your pickers</b>, as well as their items. Click on any picker's header now to expand it and continue.</>, // What: Body Element. Why: This step's own coach card needs a plain description plus an explicit click instruction. How: GuiTouCom renders this as the step's own descriptive paragraph.

				runFun : () => { // What: Run Function. Why: A freshly-expanded picker's own Controls/Items must start collapsed, same "clean slate" requirement as the pickers list itself. How: This polls the live DOM (bounded to 20 frames) for the just-expanded picker's own header buttons, then collapses whichever of Controls/Items defaulted open. // Controls/Items default OPEN the first time a picker's own section expands (absent === not-collapsed, see tab-data.jsx's own colMapObj comment), same "clean, uncluttered" requirement as the pickers themselves, one level deeper. Can't just read state/DOM synchronously here: this runFun fires from the tour's own CAPTURE-phase click listener, which, being capture, not bubble, always runs BEFORE the header's own React onClick (togColFun) actually applies (see cliGuaFun's own comment in onboarding/tour-runner.jsx), so at this exact instant the clicked picker's section hasn't actually opened yet, in state OR the DOM. Polled via rAF (bounded to ~20 frames), driven off the live DOM (this closure's own `staAppObj` would be just as stale by the time it fires), the picker's OWN outer ColDisCom mounts its .catBodDiv content (and thus these two buttons) on a SECOND render cycle after `open` first flips true (see ColDisCom's own render/useEffect split in ui.jsx), so a single synchronous check would too often find nothing yet. Scoped to .datLisDiv specifically (NOT Conditionals/Reminders above it, which share this same .catTogBut class for their own Controls/Items, see help/content.jsx's own scoped selectors for the same distinction). Calls actStoObj.togColFun directly (using the picker's own data-picker-id, added to .datCatSec in tab-data.jsx for exactly this) rather than a real .click() on the header: Step 3 below now requires clicking that SAME Controls header to finish the tutorial, and a synthetic click fired this late (well after `step` has already advanced past this one, and after supGuaRef has already reset) would be indistinguishable from the user's own real click, collapsing Controls here would immediately satisfy Step 3's cirBoo and finish the tour before the user ever saw it. A direct action call carries no such risk; it never touches the click-guard at all.


					let tryCouNum = 0; // What: Try Count Number. Why: The polling loop below must give up eventually if the expected DOM never mounts. How: This counts attempts, capped at 20 frames by the loop itself.


					const tryColFun = () => { // What: Try Collapse Function. Why: The just-expanded picker's own header buttons may not have mounted yet, so this must re-poll a frame at a time. How: This looks up the open picker's own header/buttons, retrying via requestAnimationFrame until they exist or the try cap is hit.


						const opeHeaEle = document.querySelector( '[data-element-name-hook~="datLisDiv"] [data-element-name-hook~="catHeaBut"][aria-expanded="true"]' ); // What: Open Header Element. Why: This must find whichever picker header the user just clicked open. How: This looks up the one .catHeaBut currently marked expanded.
						const catSecEle = opeHeaEle && opeHeaEle.closest( '[data-element-name-hook~="datCatSec"]' );                                                     // What: Category Section Element. Why: The picker's own id and Controls/Items buttons live on its enclosing .cat section. How: This walks up from opeHeaEle to its closest .cat ancestor.
						const picIdeStr = catSecEle && catSecEle.dataset.pickerId;                                                                                       // What: Picker Identifier String. Why: actStoObj.togColFun needs this picker's own real id. How: This reads catSecEle's own data-picker-id attribute.
						const heaButArr = catSecEle ? [ ...catSecEle.querySelectorAll( '[data-element-name-hook~="catTogBut"]' ) ] : [];                                 // What: Header Button Array. Why: The Controls header (index 0) and Items header (index 1) both need checking. How: This collects every .catTogBut button inside catSecEle into a plain array.


						if ( ( !picIdeStr || heaButArr.length < 2 ) && tryCouNum++ < 20 ) { requestAnimationFrame( tryColFun ); return; } // What: Retry Guard. Why: The picker's own header/buttons may not have mounted on the very first frame checked. How: This re-schedules tryColFun a frame later, up to 20 tries, whenever picIdeStr or both buttons are still missing. // Re-polls a frame later whenever the expected DOM hasn't mounted yet and the try cap hasn't been hit. Left inline rather than extracted into named consts: tryCouNum++ is a side effect that must stay inside this short-circuited check, extracting it would change how often it increments.



						if ( !picIdeStr ) return; // What: Missing Picker Guard. Why: A try cap hit with no picker found at all has nothing left to collapse. How: This returns early whenever picIdeStr was never resolved.



						if ( heaButArr[ 0 ] && heaButArr[ 0 ].getAttribute( 'aria-expanded' ) === 'true' ) actStoObj.togColFun( picIdeStr + ':controls' ); // What: Controls Collapse Call. Why: Controls must start collapsed if it defaulted open. How: This toggles the picker's own ':controls' section only when it's currently expanded.



						if ( heaButArr[ 1 ] && heaButArr[ 1 ].getAttribute( 'aria-expanded' ) === 'true' ) actStoObj.togColFun( picIdeStr + ':items' ); // What: Items Collapse Call. Why: Items must start collapsed if it defaulted open. How: This toggles the picker's own ':items' section only when it's currently expanded.


					};

					requestAnimationFrame( tryColFun ); // What: Initial Poll Call. Why: The first check must also wait a frame, same as every retry. How: This schedules the first call to tryColFun.


				}


			},

			{ // What: Controls Section Step. Why: This is the edit-item tour's own 3rd step. How: This stays on the whole expanded picker's own box while narrowing the click guard to the Controls header alone. // selStr highlights the WHOLE expanded picker's own .datCatSec section (header + its collapsed Controls/Items rows), keeps the user oriented on WHICH picker this is, same "highlight the bigger box, narrow the click" reasoning as the manual-pick tour's own Add to Todo List step (picRunDiv + picSenBut). :has() scopes to whichever picker is currently expanded specifically, unlike .catBodDiv's content, the outer .datCatSec <section>/header render for EVERY picker unconditionally, so a bare .datLisDiv > .datCatSec would highlight every picker's header at once. cliSelStr then narrows the actual click-guard/cirBoo target down to the Controls header alone (same selector help/content.jsx's own dataPickerControlsHeader entry uses), doubling as a safety net: clicking the picker's own header (inside selStr but outside cliSelStr) is silently blocked by the guard instead of collapsing the section and losing this step's target out from under the user.


				bacBoo    : true,             // What: Back Boolean. Why: The user should always be able to return to Your Pickers. How: GuiTouCom shows its own Back button whenever this is true.
				cirBoo    : true,             // What: Click-Is-Required Boolean. Why: The click itself is the thing being taught, not just a gate. How: GuiTouCom disables Next and only advances once the real target is clicked.
				cliSelStr : '[data-element-name-hook~="datLisDiv"] > [data-element-name-hook~="datCatSec"] [data-element-name-hook~="catBodDiv"] > button[data-element-name-hook~="catTogBut"]:nth-of-type(1)', // What: Click Selector String. Why: Only the Controls header itself may satisfy this step. How: This is read by the click-guard/cirBoo logic separately from selStr.
				priStr    : 'Next',           // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				pulSelStr : '[data-ob-none]', // What: Pulse Selector String. Why: The default cirBoo pulse must be suppressed in favor of the Controls header's own individual pulse. How: This is a selector chosen to never match anything currently on screen. // Same pulse suppression as the previous step, the Controls header itself pulses (.catTogBut--tour, tab-data.jsx) instead of a ring around the whole picker card.
				selStr    : '[data-element-name-hook~="datLisDiv"] > [data-element-name-hook~="datCatSec"]:has([data-element-name-hook~="catHeaBut"][aria-expanded="true"])', // What: Selector String. Why: This step highlights the whole expanded picker's own section, keeping the user oriented on which picker this is. How: GuiTouCom spotlights whatever this selector matches.
				tabStr    : 'data',           // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.
				titStr    : 'Controls Section', // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuiTouCom renders this as the step's own heading text.

				bodEle : <>This is where you can <b>view and edit a picker's Controls</b>. This includes its name, group, type, and other settings. Click on the Controls' header now to expand it and continue.</> // What: Body Element. Why: This step's own coach card needs a plain description plus an explicit click instruction. How: GuiTouCom renders this as the step's own descriptive paragraph.


			},

			{ // What: Edit Picker Settings Step. Why: This is the edit-item tour's own 4th step. How: This invites free exploration, then collapses Controls again on the way to the Items Section step. // Same selStr as the previous step, still the whole picker box, now with Controls ITSELF expanded (the previous step's own click), so the box has grown to include all of PickerControls' real fields. No cliSelStr this time: every click inside stays genuinely usable (name/group/type fields, weight steppers, the works), "explore and do whatever you want" is the point. The only two things still guarded are the picker's own header and the Items header, both via real `disabled` props in tab-data.jsx (disableEditTourToggles) rather than the click-guard, since collapsing either would pull this step's own target out from under the user mid-step. catBoo: true, Controls' real field set is easily taller than a short viewport can fit alongside the coach, same "pin coach to top, let the section run off the bottom" treatment as the manual-pick tour's own tall-target steps, see catBoo's own doc comment in onboarding/tour-runner.jsx.


				bacBoo : true,   // What: Back Boolean. Why: The user should always be able to return to Controls Section. How: GuiTouCom shows its own Back button whenever this is true.
				catBoo : true,   // What: Coach-At-Top Boolean. Why: Controls' real field set is easily taller than a short viewport can fit alongside the coach. How: GuiTouCom skips its own reserve-space math and pins the coach card to the top instead.
				priStr : 'Next', // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				selStr : '[data-element-name-hook~="datLisDiv"] > [data-element-name-hook~="datCatSec"]:has([data-element-name-hook~="catHeaBut"][aria-expanded="true"])', // What: Selector String. Why: This step highlights the same whole picker box, now with Controls itself expanded. How: GuiTouCom spotlights whatever this selector matches.
				tabStr : 'data', // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.
				titStr : 'Edit Picker Settings', // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuiTouCom renders this as the step's own heading text.

				bodEle : <>Feel free to <b>explore this section and make any changes you'd like</b> to the picker's name, group, type, or other settings. Click Next when you are ready to move on.</>, // What: Body Element. Why: This step's own coach card needs to invite free exploration of Controls' real fields. How: GuiTouCom renders this as the step's own descriptive paragraph.

				runFun : () => { // What: Run Function. Why: The Items Section step's own box must read as uncluttered, with Controls collapsed again. How: This finds the real Controls header, then collapses it only if it's still expanded. // Re-collapses Controls on the way to the Items Section step, same "clean slate" requirement as the previous step's own runFun, that step highlights this same picker box again and needs Controls collapsed for it to look uncluttered. Controls is already mounted here (unlike the Your Pickers step's own case, which had to poll for it), so no async wait is needed, just a direct actStoObj.togColFun call, guarded on aria-expanded so this is a no-op if the user already collapsed it themselves while exploring.


					const conHeaEle = document.querySelector( '[data-element-name-hook~="datLisDiv"] > [data-element-name-hook~="datCatSec"] [data-element-name-hook~="catBodDiv"] > button[data-element-name-hook~="catTogBut"]:nth-of-type(1)' ); // What: Controls Header Element. Why: This is the real control this step must collapse on the way out. How: This looks it up fresh, since it only exists while a picker is expanded.
					const catSecEle = conHeaEle && conHeaEle.closest( '[data-element-name-hook~="datCatSec"]' ); // What: Category Section Element. Why: The picker's own id lives on its enclosing .cat section. How: This walks up from conHeaEle to its closest .cat ancestor.
					const picIdeStr = catSecEle && catSecEle.dataset.pickerId;                                   // What: Picker Identifier String. Why: actStoObj.togColFun needs this picker's own real id. How: This reads catSecEle's own data-picker-id attribute.


					if ( picIdeStr && conHeaEle.getAttribute( 'aria-expanded' ) === 'true' ) actStoObj.togColFun( picIdeStr + ':controls' ); // What: Controls Collapse Call. Why: This must only fire when Controls is still actually expanded. How: This toggles the picker's own ':controls' section closed.


				}


			},

			{ // What: Items Section Step. Why: This is the edit-item tour's own 5th step. How: This mirrors Controls Section but for the Items header instead. // Same shape as Edit Picker Settings above (Controls Section), mirrored for Items: cliSelStr narrows to the Items header specifically (:nth-of-type(2)) instead of Controls. Controls itself was just re-collapsed by the previous step's own outgoing runFun, so the highlighted box (same whole-picker selStr as Controls Section/Edit Picker Settings) reads clean again rather than showing Controls still expanded alongside it.


				bacBoo    : true,             // What: Back Boolean. Why: The user should always be able to return to Edit Picker Settings. How: GuiTouCom shows its own Back button whenever this is true.
				cirBoo    : true,             // What: Click-Is-Required Boolean. Why: The click itself is the thing being taught, not just a gate. How: GuiTouCom disables Next and only advances once the real target is clicked.
				cliSelStr : '[data-element-name-hook~="datLisDiv"] > [data-element-name-hook~="datCatSec"] [data-element-name-hook~="catBodDiv"] > button[data-element-name-hook~="catTogBut"]:nth-of-type(2)', // What: Click Selector String. Why: Only the Items header itself may satisfy this step. How: This is read by the click-guard/cirBoo logic separately from selStr.
				priStr    : 'Next',           // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				pulSelStr : '[data-ob-none]', // What: Pulse Selector String. Why: The default cirBoo pulse must be suppressed in favor of the Items header's own individual pulse. How: This is a selector chosen to never match anything currently on screen. // Same pulse suppression as Controls Section above, the Items header itself pulses (.catTogBut--tour, tab-data.jsx) instead of a ring around the whole picker card.
				selStr    : '[data-element-name-hook~="datLisDiv"] > [data-element-name-hook~="datCatSec"]:has([data-element-name-hook~="catHeaBut"][aria-expanded="true"])', // What: Selector String. Why: This step highlights the same whole picker box, Controls now re-collapsed by the previous step's own runFun. How: GuiTouCom spotlights whatever this selector matches.
				tabStr    : 'data',           // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.
				titStr    : 'Items Section',  // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuiTouCom renders this as the step's own heading text.

				bodEle : <>This is where you can <b>view and edit a picker's Items</b>. This includes each item's name, weight, and other values. Click on the Items' header now to expand it and continue.</> // What: Body Element. Why: This step's own coach card needs a plain description plus an explicit click instruction. How: GuiTouCom renders this as the step's own descriptive paragraph.


			},

			{ // What: Picker Items Step. Why: This is the edit-item tour's own 6th step. How: This narrows the click guard to any item row while narrating the disabled Add Item button. // Same whole-picker selStr as Controls Section through Items Section, now with Items expanded (the previous step's own click). cliSelStr narrows to any item row, same selector help/content.jsx's own dataItemRow entry uses (.datLisDiv .lisIteDiv > .lisRowBut), so clicking ANY one of them satisfies this step, not just a specific item. The "+ Add new item" button (.rowAddBut, same scoped selector as help/content.jsx's own dataAddItem) is disabled for this and the next step (disableEditTourAddItem in tab-data.jsx), narrating that it exists is the point, not inviting a brand-new item mid-tutorial. catBoo: true, the item list's own height is unpredictable (depends how many items this picker has), same reasoning as every other "explore" step's own catBoo.


				bacBoo    : true,             // What: Back Boolean. Why: The user should always be able to return to Items Section. How: GuiTouCom shows its own Back button whenever this is true.
				catBoo    : true,             // What: Coach-At-Top Boolean. Why: The item list's own height is unpredictable and can easily exceed a short viewport. How: GuiTouCom skips its own reserve-space math and pins the coach card to the top instead.
				cirBoo    : true,             // What: Click-Is-Required Boolean. Why: The click itself is the thing being taught, not just a gate. How: GuiTouCom disables Next and only advances once the real target is clicked.
				cliSelStr : '[data-element-name-hook~="datLisDiv"] [data-element-name-hook~="lisIteDiv"] > :is([data-element-name-hook~="lisRowBut"], [data-element-name-hook~="lisRowDiv"])', // What: Click Selector String. Why: Any one item row must satisfy this step, not just a specific item. How: This is read by the click-guard/cirBoo logic separately from selStr.
				priStr    : 'Next',           // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				pulSelStr : '[data-ob-none]', // What: Pulse Selector String. Why: The default cirBoo pulse must be suppressed in favor of each item row's own individual pulse. How: This is a selector chosen to never match anything currently on screen. // Same pulse suppression as every other cirBoo step above, each item's own row pulses (.lisIteDiv--tour, tab-data.jsx) instead of a ring around the whole picker card.
				selStr    : '[data-element-name-hook~="datLisDiv"] > [data-element-name-hook~="datCatSec"]:has([data-element-name-hook~="catHeaBut"][aria-expanded="true"])', // What: Selector String. Why: This step highlights the same whole picker box, Items now expanded by the previous step's own click. How: GuiTouCom spotlights whatever this selector matches.
				tabStr    : 'data',           // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.
				titStr    : 'Picker Items',   // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuiTouCom renders this as the step's own heading text.

				bodEle : <>This section contains <b>all of this picker's items</b>, as well as a form for adding new items (though this is disabled for this tutorial). Click on any of the items now to expand it and continue.</> // What: Body Element. Why: This step's own coach card needs a plain description plus an explicit click instruction. How: GuiTouCom renders this as the step's own descriptive paragraph.


			},

			{ // What: Edit Item Settings Step. Why: This is the edit-item tour's own final step. How: This invites free exploration of the already-expanded item's own fields. // Same shape as Edit Picker Settings above, mirrored for Items: free exploration, no cliSelStr, the clicked item already expanded by the previous step's own real click. Last step of this tutorial, priStr 'Done', no outgoing runFun needed since nothing comes after it to keep clean for. catBoo: true, an item list can run just as tall as Controls' own field set once a picker has more than a couple items, same reasoning as Edit Picker Settings' own catBoo.


				bacBoo : true,   // What: Back Boolean. Why: The user should always be able to return to Picker Items. How: GuiTouCom shows its own Back button whenever this is true.
				catBoo : true,   // What: Coach-At-Top Boolean. Why: An item list can run just as tall as Controls' own field set once a picker has more than a couple items. How: GuiTouCom skips its own reserve-space math and pins the coach card to the top instead.
				priStr : 'Done', // What: Primary String. Why: This is the edit-item tour's own last step, so its main action finishes the tour instead of advancing. How: GuiTouCom reads a 'Done' priStr as the signal to call onFinTouFun.
				selStr : '[data-element-name-hook~="datLisDiv"] > [data-element-name-hook~="datCatSec"]:has([data-element-name-hook~="catHeaBut"][aria-expanded="true"])', // What: Selector String. Why: This step highlights the same whole picker box, the clicked item now expanded. How: GuiTouCom spotlights whatever this selector matches.
				tabStr : 'data', // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.
				titStr : 'Edit Item Settings', // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuiTouCom renders this as the step's own heading text.

				bodEle : <>Feel free to <b>explore this section and make any changes you'd like</b> to an item's name, weight, or other values. This concludes the Edit your first item tutorial, click Done when you are ready.</> // What: Body Element. Why: This step's own coach card needs to invite free exploration plus a closing instruction. How: GuiTouCom renders this as the step's own descriptive paragraph.


			}


		];


	}



	if ( feaIdeStr === 'feat_run_time' ) { // What: Run Time Branch Check. Why: The generator run-time tour's own steps only apply to this one feature. How: This returns its own step array whenever feaIdeStr matches.


		return [ // What: Run Time Tour Steps Return. Why: The caller needs this feature tour's own full ordered step array beyond Step 1. How: This returns the generator run-time tour's own remaining steps, each carrying its own selector/copy/navigation fields.


			{ // What: Daily Generator Settings Step. Why: This is the run-time tour's own only step beyond Step 1. How: This spotlights the real Daily Generator section as a reference blurb. // Body copied verbatim from the Settings page tour's own daily target (SET_TAR_OBJ in onboarding/page-steps.jsx), same section, same explanation. Title given its own, more specific wording rather than reusing that tour's plain "Daily Generator" verbatim. catBoo: true, matches every section step in that same tour, since .set-section--daily can run taller than the viewport just like the others.


				bacBoo : true,                                    // What: Back Boolean. Why: The user should always be able to return to Step 1's own nav highlight. How: GuiTouCom shows its own Back button whenever this is true.
				catBoo : true,                                    // What: Coach-At-Top Boolean. Why: .set-section--daily can run taller than the viewport, same as every other Settings section. How: GuiTouCom skips its own reserve-space math and pins the coach card to the top instead.
				priStr : 'Done',                                  // What: Primary String. Why: This is this tour's own only step, so its main action finishes the tour instead of advancing. How: GuiTouCom reads a 'Done' priStr as the signal to call onFinTouFun.
				selStr : '[data-element-name-hook~="setDaiSec"]', // What: Selector String. Why: This step highlights the whole Daily Generator section. How: GuiTouCom spotlights whatever this selector matches.
				tabStr : 'settings',                              // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.
				titStr : 'Daily Generator Settings',              // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuiTouCom renders this as the step's own heading text.

				bodEle : <>This is where you can <b>control the daily generator</b>: turn auto generation on or off, what time it runs, and enabling notifications for when it does. This concludes the Adjust your daily generator run time tutorial, click Done when you are ready.</> // What: Body Element. Why: This step's own coach card needs a plain description plus a closing instruction. How: GuiTouCom renders this as the step's own descriptive paragraph.


			}


		];


	}



	if ( feaIdeStr === 'feat_theme' ) { // What: Theme Branch Check. Why: The app-theme tour's own steps only apply to this one feature. How: This returns its own step array whenever feaIdeStr matches.


		return [ // What: Theme Tour Steps Return. Why: The caller needs this feature tour's own full ordered step array beyond Step 1. How: This returns the app-theme tour's own remaining steps, each carrying its own selector/copy/navigation fields.


			{ // What: System Preferences Toggle Step. Why: This is the theme tour's own 2nd step. How: This spotlights the real System Preferences toggle as a reference blurb. // The sysPreDiv hook, added to tab-settings.jsx for exactly this (the shared setSubDiv class is ambiguous against its own siblings, the celStyDiv/picAniDiv/setLayDiv subsections further down the same Appearance section). catBoo: true, same reasoning as every other Settings section step in this app: content can easily run taller than the viewport.


				bacBoo : true,                                    // What: Back Boolean. Why: The user should always be able to return to Step 1's own nav highlight. How: GuiTouCom shows its own Back button whenever this is true.
				catBoo : true,                                    // What: Coach-At-Top Boolean. Why: Every Settings section step can run taller than the viewport. How: GuiTouCom skips its own reserve-space math and pins the coach card to the top instead.
				priStr : 'Next',                                  // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				selStr : '[data-element-name-hook~="sysPreDiv"]', // What: Selector String. Why: This step highlights the System Preferences toggle. How: GuiTouCom spotlights whatever this selector matches.
				tabStr : 'settings',                              // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.
				titStr : 'System Preferences Toggle',             // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuiTouCom renders this as the step's own heading text.

				bodEle : <>This lets Ease My Life <b>automatically switch between your light and dark theme</b> based on your device's own system setting.</> // What: Body Element. Why: This step's own coach card needs a plain description of what this toggle does. How: GuiTouCom renders this as the step's own descriptive paragraph.


			},

			{ // What: Light Theme Settings Step. Why: This is the theme tour's own 3rd step. How: This spotlights the real Light Theme settings as a reference blurb. // .set-subsection--theme-light, already its own modifier class in TheSecCom (tab-settings.jsx), no changes needed there.


				bacBoo : true,                                    // What: Back Boolean. Why: The user should always be able to return to System Preferences Toggle. How: GuiTouCom shows its own Back button whenever this is true.
				catBoo : true,                                    // What: Coach-At-Top Boolean. Why: Every Settings section step can run taller than the viewport. How: GuiTouCom skips its own reserve-space math and pins the coach card to the top instead.
				priStr : 'Next',                                  // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				selStr : '[data-element-name-hook~="theLigDiv"]', // What: Selector String. Why: This step highlights the Light Theme settings. How: GuiTouCom spotlights whatever this selector matches.
				tabStr : 'settings',                              // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.
				titStr : 'Light Theme Settings',                  // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuiTouCom renders this as the step's own heading text.

				bodEle : <>This is where you can <b>pick a light based theme</b>, or create your own custom one.</> // What: Body Element. Why: This step's own coach card needs a plain description of what this section does. How: GuiTouCom renders this as the step's own descriptive paragraph.


			},

			{ // What: Dark Theme Settings Step. Why: This is the theme tour's own final step. How: This spotlights the real Dark Theme settings as a reference blurb.


				bacBoo : true,                                    // What: Back Boolean. Why: The user should always be able to return to Light Theme Settings. How: GuiTouCom shows its own Back button whenever this is true.
				catBoo : true,                                    // What: Coach-At-Top Boolean. Why: Every Settings section step can run taller than the viewport. How: GuiTouCom skips its own reserve-space math and pins the coach card to the top instead.
				priStr : 'Done',                                  // What: Primary String. Why: This is the theme tour's own last step, so its main action finishes the tour instead of advancing. How: GuiTouCom reads a 'Done' priStr as the signal to call onFinTouFun.
				selStr : '[data-element-name-hook~="theDarDiv"]', // What: Selector String. Why: This step highlights the Dark Theme settings. How: GuiTouCom spotlights whatever this selector matches.
				tabStr : 'settings',                              // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.
				titStr : 'Dark Theme Settings',                   // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuiTouCom renders this as the step's own heading text.

				bodEle : <>This is where you can <b>pick a dark based theme</b>, or create your own custom one. This concludes the App Theme tutorial, click Done when you are ready.</> // What: Body Element. Why: This step's own coach card needs a plain description plus a closing instruction. How: GuiTouCom renders this as the step's own descriptive paragraph.


			}


		];


	}



	if ( feaIdeStr === 'feat_celebration' ) { // What: Celebration Branch Check. Why: The celebration-animation tour's own steps only apply to this one feature. How: This returns its own step array whenever feaIdeStr matches.


		return [ // What: Celebration Tour Steps Return. Why: The caller needs this feature tour's own full ordered step array beyond Step 1. How: This returns the celebration-animation tour's own remaining steps, each carrying its own selector/copy/navigation fields.


			{ // What: Completion Celebration Step. Why: This is the celebration tour's own only step beyond Step 1. How: This spotlights the real Completion Celebration settings as a reference blurb. // .set-subsection--celebration, already its own modifier class in tab-settings.jsx's Appearance section, no changes needed there.


				bacBoo : true,                                    // What: Back Boolean. Why: The user should always be able to return to Step 1's own nav highlight. How: GuiTouCom shows its own Back button whenever this is true.
				catBoo : true,                                    // What: Coach-At-Top Boolean. Why: Every Settings section step can run taller than the viewport. How: GuiTouCom skips its own reserve-space math and pins the coach card to the top instead.
				priStr : 'Done',                                  // What: Primary String. Why: This is this tour's own only step, so its main action finishes the tour instead of advancing. How: GuiTouCom reads a 'Done' priStr as the signal to call onFinTouFun.
				selStr : '[data-element-name-hook~="celStyDiv"]', // What: Selector String. Why: This step highlights the Completion Celebration settings. How: GuiTouCom spotlights whatever this selector matches.
				tabStr : 'settings',                              // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.
				titStr : 'Completion Celebration',                // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuiTouCom renders this as the step's own heading text.

				bodEle : <>This is where you can <b>pick which animation plays</b> whenever you complete your entire todo list for the day. This concludes the Celebration Animation tutorial, click Done when you are ready.</> // What: Body Element. Why: This step's own coach card needs a plain description plus a closing instruction. How: GuiTouCom renders this as the step's own descriptive paragraph.


			}


		];


	}



	if ( feaIdeStr === 'feat_pick_anim' ) { // What: Pick Animation Branch Check. Why: The picker-animation tour's own steps only apply to this one feature. How: This returns its own step array whenever feaIdeStr matches.


		return [ // What: Pick Animation Tour Steps Return. Why: The caller needs this feature tour's own full ordered step array beyond Step 1. How: This returns the picker-animation tour's own remaining steps, each carrying its own selector/copy/navigation fields.


			{ // What: Picker Animation Step. Why: This is the pick-animation tour's own only step beyond Step 1. How: This spotlights the real Picker Animation settings as a reference blurb. // .set-subsection--pickanim, already its own modifier class in tab-settings.jsx's Appearance section, no changes needed there. Same shape as feat_celebration's own step just above.


				bacBoo : true,                                    // What: Back Boolean. Why: The user should always be able to return to Step 1's own nav highlight. How: GuiTouCom shows its own Back button whenever this is true.
				catBoo : true,                                    // What: Coach-At-Top Boolean. Why: Every Settings section step can run taller than the viewport. How: GuiTouCom skips its own reserve-space math and pins the coach card to the top instead.
				priStr : 'Done',                                  // What: Primary String. Why: This is this tour's own only step, so its main action finishes the tour instead of advancing. How: GuiTouCom reads a 'Done' priStr as the signal to call onFinTouFun.
				selStr : '[data-element-name-hook~="picAniDiv"]', // What: Selector String. Why: This step highlights the Picker Animation settings. How: GuiTouCom spotlights whatever this selector matches.
				tabStr : 'settings',                              // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.
				titStr : 'Picker Animation',                      // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuiTouCom renders this as the step's own heading text.

				bodEle : <>This is where you can <b>pick which animation plays</b> whenever you manually direct a picker to select an item on the Pickers page. This concludes the Picker Animation tutorial, click Done when you are ready.</> // What: Body Element. Why: This step's own coach card needs a plain description plus a closing instruction. How: GuiTouCom renders this as the step's own descriptive paragraph.


			}


		];


	}



	if ( feaIdeStr === 'feat_highlights' ) { // What: Highlights Branch Check. Why: The highlights tour's own steps only apply to this one feature, and this is the only feature whose steps below fully replace Step 1 rather than follow it. How: This returns its own 2-step array whenever feaIdeStr matches.


		return [ // What: Highlights Tour Steps Return. Why: The caller needs this feature's own full 2-step array, replacing Step 1 entirely rather than following it. How: This returns the highlights tour's own steps, each carrying its own selector/copy/navigation fields. // Unlike every other feature, this one does NOT use the shared buiTs1Fun nav-click (see FeaTouCom's own steps prop below, which skips prepending it for this feaIdeStr specifically): the whole point is the help-highlight toggle itself (.helTogBut, help/mode.jsx), which already sits in the CURRENT page's own header, there's nothing to navigate to first. Both steps target the exact same element (it never moves), so the highlight/coach position stays pinned across the transition between them, only the body copy changes.


			{ // What: Highlights Feature Step. Why: This is the highlights tour's own 1st step, the real help-highlight toggle. How: This teaches turning the feature on.


				bacBoo : false,                                   // What: Back Boolean. Why: This is this tour's very first step, so there is nothing to go back to. How: GuiTouCom hides its own Back button whenever this is false.
				cirBoo : true,                                    // What: Click-Is-Required Boolean. Why: The click itself is the thing being taught, not just a gate. How: GuiTouCom disables Next and only advances once the real target is clicked.
				priStr : 'Next',                                  // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				selStr : '[data-element-name-hook~="helTogBut"]', // What: Selector String. Why: This step highlights the real help-highlight toggle. How: GuiTouCom spotlights whatever this selector matches.
				tabStr : 'today',                                 // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.
				titStr : 'Highlights Feature',                    // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuiTouCom renders this as the step's own heading text.

				bodEle : <>The “i” button can be <b>found in the top right corner of every page</b>. Click the “i” button now to see how this works.</> // What: Body Element. Why: This step's own coach card needs a plain description plus an explicit click instruction. How: GuiTouCom renders this as the step's own descriptive paragraph.


			},

			{ // What: Highlights Feature Step. Why: This is the highlights tour's own 2nd and final step. How: This teaches turning the feature back off, ending on the same target the tour opened on.


				bacBoo : true,                                    // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
				cirBoo : true,                                    // What: Click-Is-Required Boolean. Why: The click itself is the thing being taught, not just a gate. How: GuiTouCom disables Next and only advances once the real target is clicked.
				priStr : 'Done',                                  // What: Primary String. Why: This is the highlights tour's own last step, so its main action finishes the tour instead of advancing. How: GuiTouCom reads a 'Done' priStr as the signal to call onFinTouFun.
				selStr : '[data-element-name-hook~="helTogBut"]', // What: Selector String. Why: This step highlights the exact same, still-pinned help-highlight toggle. How: GuiTouCom spotlights whatever this selector matches.
				tabStr : 'today',                                 // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.
				titStr : 'Highlights Feature',                    // What: Title String. Why: This step's own coach card needs the same heading as the previous step, since the target hasn't moved. How: GuiTouCom renders this as the step's own heading text.

				bodEle : <><b>Important elements on the page are highlighted, each with their own button</b> that will bring up a tooltip with more information. Click the “i” button again to turn the feature back off and conclude the Highlight Feature tutorial.</> // What: Body Element. Why: This step's own coach card needs to explain the now-visible highlights plus a closing instruction. How: GuiTouCom renders this as the step's own descriptive paragraph.


			}


		];


	}



	if ( feaIdeStr === 'feat_protect_data' ) { // What: Protect Data Branch Check. Why: The protect-data tour's own steps only apply to this one feature. How: This returns its own step array whenever feaIdeStr matches.


		return [ // What: Protect Data Tour Steps Return. Why: The caller needs this feature tour's own full ordered step array beyond Step 1. How: This returns the protect-data tour's own remaining steps, each carrying its own selector/copy/navigation fields.


			...( alrProBoo ? [] : [ { // What: Protect Your Data Step Spread. Why: This step must not exist at all for a browser whose storage is already persisted, since its own target would never render. How: This spreads in a single-entry array only when alrProBoo is false, otherwise an empty array. // .set-protect-btn, new modifier class on the "Protect Data" ButBasCom in tab-settings.jsx (only rendered while !stor.persisted, same condition already gating the real button). Omitted entirely when alrProBoo (see FeaTouCom's own effect that computes it): a browser that already has persisted storage never renders this button at all, so this step's cirBoo target would never resolve; without this the tour would sit on a phantom "Step 2 of 3" until the generic not-found timeout gave up and cancelled the whole tutorial. Skipping the step outright instead makes this a clean "Step n of 2".


				bacBoo : true,                                    // What: Back Boolean. Why: The user should always be able to return to Step 1's own nav highlight. How: GuiTouCom shows its own Back button whenever this is true.
				catBoo : true,                                    // What: Coach-At-Top Boolean. Why: Every Settings section step can run taller than the viewport. How: GuiTouCom skips its own reserve-space math and pins the coach card to the top instead.
				cirBoo : true,                                    // What: Click-Is-Required Boolean. Why: The click itself is the thing being taught, not just a gate. How: GuiTouCom disables Next and only advances once the real target is clicked.
				priStr : 'Next',                                  // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				selStr : '[data-element-name-hook~="proDatBut"]', // What: Selector String. Why: This step highlights the real Protect Data button. How: GuiTouCom spotlights whatever this selector matches.
				tabStr : 'settings',                              // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.
				titStr : 'Protect Your Data',                     // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuiTouCom renders this as the step's own heading text.

				bodEle : <>The “Protect Data” button helps <b>protect your data from being cleared by your browser's own storage clean up</b>. Click the “Protect Data” button now to enable this.</> // What: Body Element. Why: This step's own coach card needs a plain description plus an explicit click instruction. How: GuiTouCom renders this as the step's own descriptive paragraph.


			} ] ),

			{ // What: Install The App Step. Why: This is the protect-data tour's own final step. How: This spotlights whichever real install control applies without needing to know the browser. // Comma-separated fallback (see findTargets' own comma-splitting in onboarding/tour-runner.jsx), the insAppBut hook (only rendered when canInstall) is tried first; if this browser can't offer a real install prompt, falls back to the insRowDiv hook (shared by all of tab-settings.jsx's own browser-specific instructional blocks, iOS, Mac, or the generic "not available here" note, exactly one of which renders at a time), so this targets whichever one actually applies without needing to know which browser it's running in. No cirBoo, Done is enabled outright, last step of this tutorial.


				bacBoo : true,                                                                           // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
				catBoo : true,                                                                           // What: Coach-At-Top Boolean. Why: Every Settings section step can run taller than the viewport. How: GuiTouCom skips its own reserve-space math and pins the coach card to the top instead.
				priStr : 'Done',                                                                         // What: Primary String. Why: This is the protect-data tour's own last step, so its main action finishes the tour instead of advancing. How: GuiTouCom reads a 'Done' priStr as the signal to call onFinTouFun.
				selStr : '[data-element-name-hook~="insAppBut"], [data-element-name-hook~="insRowDiv"]', // What: Selector String. Why: This step highlights whichever real install control actually applies to this browser. How: GuiTouCom spotlights the first alternative that matches.
				tabStr : 'settings',                                                                     // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.
				titStr : 'Install the App',                                                              // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuiTouCom renders this as the step's own heading text.

				bodEle : <>Installing the app to your device is <b>the best way to protect your data</b>, and gives you a more native, app-like experience. If a direct install isn't available in your browser, instructions for how to install it are shown here instead. This concludes the Protect Your Data tutorial, click Done when you are ready.</> // What: Body Element. Why: This step's own coach card needs a plain description plus a closing instruction. How: GuiTouCom renders this as the step's own descriptive paragraph.


			}


		];


	}



	return []; // What: Fallback Return. Why: Any feature id not yet handled above has no steps beyond Step 1. How: This returns an empty array whenever feaIdeStr matched none of the branches above.


};

// #endregion buiTesFun

// #endregion Helpers



// #region Components

// #region FeaTipCom

/**
 * FeaTipCom = Feature Tip Component
 *
 * @summary
 * "One Last Thing...", a single, standalone tip shown exactly once, right
 * after the closing checklist's own generate() call actually finishes,
 * pointing at the freshly-appeared App Features section. NOT a per-feature
 * tutorial like FeaTouCom above (no intro modal, no per-feature id): a
 * single `solBoo` GuiTouCom step (see that flag's own doc comment in
 * onboarding/tour-runner.jsx), which hides the step counter and Skip/Back,
 * showing one full-width "Dismiss" button instead. Mounted directly from
 * TabTodCom rather than lifted to app.jsx like
 * FeaTouCom/PagTouCom/PicTouCom are: unlike those, this never navigates to
 * another tab (the whole point is the section already on screen), so it
 * doesn't need real cross-tab selTabFun/actIdeStr plumbing,
 * actIdeStr='today'/a no-op selTabFun is enough, the same pattern PagTouCom
 * itself used before Pickers/Stats/Data/Settings tours needed it to actually
 * leave Today.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actStoObj - Action Store Object: The actions that mutate
 *                          the app's own persisted state.
 *
 * @returns The single, solo GuiTouCom step described above.
 *
 * @example
 * ```tsx
 * FeaTipCom({ actStoObj })
 * // => <FeaTipCom />
 * ```
 *
*/

function FeaTipCom ( { actStoObj } ) {


	return (


		<GuiTouCom
			actIdeStr='today'
			actStoObj={ actStoObj }
			resSteNum={ 0 }
			selTabFun={ () => {} } // What: Select Tab Stub Attribute. Why: This tip never leaves Today, so there is never a tab to switch to. How: This passes a no-op in place of the app-wide selTabFun, which this mount never receives.
			steObjArr={ [ TIP_STE_OBJ ] }
			touIdeStr='appfeatures-intro'

			onFinTouFun={ () => actStoObj.setOnbFun( { appFeaturesIntroSeen : true } ) }
			onSkiTouFun={ () => actStoObj.setOnbFun( { appFeaturesIntroSeen : true } ) }
		/> // What: Guided Tour Element. Why: This is the single, solo spotlight step described above. How: This is passed a fixed touIdeStr, the single step above, and the actIdeStr='today'/no-op selTabFun stand-ins described in this function's own doc comment.


	);


}

// #endregion FeaTipCom



// #region FeaTouCom

/**
 * FeaTouCom = Feature Tour Component
 *
 * @summary
 * Renders whichever piece of one feature's own App Feature mini-tour is
 * currently relevant: the intro modal, or the running GuiTouCom. Mounted at
 * the app level (see app.jsx's own actFeaStr), reads real persisted
 * staAppObj and calls real actStoObj.* methods (see store.js), same
 * overall shape as PagTouCom in onboarding/page-tours.jsx.
 *
 * The feat_highlights feature skips the shared Step 1 entirely, since its
 * own target, the real help-highlight toggle, already sits on the current
 * page with nothing to navigate to first.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actIdeStr   - Active Identifier String: The app's own currently
 *                            active tab id.
 * @param props.actStoObj   - Action Store Object: The actions that mutate
 *                            props.staAppObj.
 * @param props.feaIdeStr   - Feature Identifier String: This feature's own id
 *                            (e.g. 'feat_manual_pick'), keying APP_FEA_ARR and
 *                            buiTesFun.
 * @param props.onCloTouFun - On Close Tour Function: Clears app.jsx's own
 *                            actFeaStr, ending this mount.
 * @param props.selTabFun   - Select Tab Function: Switches the app's own
 *                            active tab.
 * @param props.staAppObj   - State App Object: The entire app's own
 *                            persisted state.
 *
 * @returns Either the intro modal (touPhaStr 'intro') or the running guided
 * tour (touPhaStr 'tour'), depending on this feature's own phase.
 *
 * @example
 * ```tsx
 * FeaTouCom({ actIdeStr, actStoObj, feaIdeStr, onCloTouFun, selTabFun, ... })
 * // => <FeaTouCom />
 * ```
 *
*/

function FeaTouCom ( { actIdeStr, actStoObj, feaIdeStr, onCloTouFun, selTabFun, staAppObj } ) {


	const feaRcdObj = APP_FEA_ARR.find( ( curFeaObj ) => curFeaObj.ideStr === feaIdeStr );                                           // What: Feature Record Object. Why: This feature's own pagStr/titStr/bodEle/pilArr/timStr are read off its own APP_FEA_ARR entry. How: This searches APP_FEA_ARR for the entry whose own id matches feaIdeStr.
	const onbStaObj = staAppObj.onboarding || {};                                                                                    // What: Onboarding State Object. Why: A reload lands here with tab-today.jsx's own actFeaStr already re-derived from this SAME persisted activeTour, so this just decides whether to skip the intro modal and which (resBoo) step to land on. How: This reads staAppObj.onboarding, falling back to an empty object.
	const resTouObj = onbStaObj.activeTour && onbStaObj.activeTour.id === `appfeature-${ feaIdeStr }` ? onbStaObj.activeTour : null; // What: Resume Tour Object. Why: See onboarding/tour-runner.jsx's own resBoo field doc comment for why this is a checkpoint, not necessarily the exact step the user was last on. How: This reads onbStaObj.activeTour back out only when its own id matches this feature's own touIdeStr, otherwise null.

	const [ touPhaStr, setTouPhaStr ] = React.useState( resTouObj ? 'tour' : 'intro' ); // What: Tour Phase String And Setter. Why: This is the mini-tour's own top-level position, 'intro' (the modal showing) or 'tour' (GuiTouCom running). How: This starts on 'tour' whenever resTouObj says a tour was left running, otherwise 'intro'.
	const [ alrProBoo, setAlrProBoo ] = React.useState( false );                        // What: Already Protected Boolean And Setter. Why: feat_protect_data's own first step must not exist at all once this browser already has persisted storage. How: This starts false, then resolves once via the effect below. // Whether THIS browser already has persisted storage, checked once up front (not reactively), see buiTesFun's own comment on why feat_protect_data's first step needs to know this. Frozen at whatever it resolves to on mount: a user who actually grants persistence mid-tour (by clicking the real button that step targets) shouldn't have the step list change shape out from under them the same run.


	React.useEffect( () => { // What: Check Persisted Effect. Why: navigator.storage.persisted() is itself async, so alrProBoo can't be computed synchronously up front. How: This resolves the real persisted() promise once, then sets alrProBoo, guarded against a stale update after unmount.


		if ( feaIdeStr !== 'feat_protect_data' ) return; // What: Other Feature Guard. Why: Only feat_protect_data's own steps ever read alrProBoo, so no other feature needs this checked. How: This returns early for every other feaIdeStr.



		let aliMouBoo = true; // What: Alive Mounted Boolean. Why: A resolved promise must not update state after this effect's own cleanup has already fired. How: This starts true, then this effect's own cleanup below flips it false.

		const perProObj = Promise.resolve( navigator.storage && navigator.storage.persisted ? navigator.storage.persisted() : false ); // What: Persisted Promise Object. Why: A browser without the Storage API at all must resolve to false rather than throwing. How: This wraps navigator.storage.persisted() in a promise, or resolves false straight away when the API is missing.


		perProObj.then( ( curValBoo ) => { if ( aliMouBoo ) setAlrProBoo( curValBoo ); } ); // What: Persisted Resolve Call. Why: The real persisted state is only known once the promise settles. How: This stores the resolved value in alrProBoo, unless this effect has already been cleaned up.



		return () => { aliMouBoo = false; }; // What: Cleanup Function. Why: A reload or feaIdeStr change mid-flight must not let a late resolve touch a stale closure's own state. How: This flips aliMouBoo to false on unmount.


	}, [ feaIdeStr ] ); // What: Effect Dependency Array. Why: This must re-run whenever feaIdeStr itself changes, so a fresh mount for a different feature re-checks fresh. How: feaIdeStr is the exact value this effect's own guard reads.



	// #region cloTouFun

	/**
	 * cloTouFun = Close Tour Function
	 *
	 * @summary
	 * Ends this App Feature tour however it ends, recording how in this feature's
	 * own entry in state.onboarding.appFeatures, then calls onCloTouFun so
	 * app.jsx unmounts the tour.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param staValStr - Status Value String: How the tour ended, one of
	 *                    'cancelled' (the intro modal's Skip), 'skipped' (the
	 *                    coach card's Skip or the not-found watchdog), or
	 *                    'finished'.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * cloTouFun( 'finished' ) // => void
	 * ```
	 *
	*/

	const cloTouFun = ( staValStr ) => { // What: Close Tour Function. Why: Every path that ends this tour, however it ends, needs the exact same cleanup. How: This resolves this feature's own checklist entry to staValStr, then calls onCloTouFun.


		actStoObj.setFeaFun( feaIdeStr, { status : staValStr } ); // What: Set App Feature Item Call. Why: The launcher card on Today reads this to know whether to keep showing itself. How: This updates this feature's own appFeatures entry to staValStr.



		onCloTouFun(); // What: On Close Call. Why: app.jsx's own actFeaStr must be cleared however this tour ends. How: This calls the onCloTouFun prop passed down from app.jsx.


	};

	// #endregion cloTouFun



	if ( touPhaStr === 'intro' ) { // What: Intro Phase Check. Why: The intro modal must show before any spotlight step ever does. How: This returns IntModCom below whenever touPhaStr is 'intro'.


		const pagIcoEle = ( // What: Page Icon Element. Why: Most features' intro modal shows the icon of the page the feature lives on. How: This renders feaRcdObj.pagStr's own icon at the p05 rhythm step.


			<IcoSvgCom
				icoNamStr={ feaRcdObj.pagStr }
				sizSteStr='p05' // Vertical Rhythm Base Plus 5 ~= 59.447px
			/> // What: Icon Svg Component. Why: This is the glyph identifying the page this feature lives on. How: This renders that page's own nav icon.


		);


		const intIcoEle = feaIdeStr === 'feat_highlights' ? <span className={ cssModObj.helIcoSpa }>i</span> : pagIcoEle; // What: Intro Icon Element. Why: The highlight feature has no page of its own, so it shows the help mark instead. How: This picks the help glyph for feat_highlights, otherwise pagIcoEle.



		return (


			<IntModCom
				icoTopEle={ intIcoEle }
				parEleArr={ [ feaRcdObj.bodEle ] }
				pilLabArr={ feaRcdObj.pilArr }
				titHeaStr={ feaRcdObj.titStr }

				onBegTouFun={ () => setTouPhaStr( 'tour' ) }
				onSkiTouFun={ () => cloTouFun( 'cancelled' ) }
			/> // What: Tutorial Intro Modal Element. Why: This is this feature's own opening screen, shown before any spotlight step ever does. How: This is passed this feature's own icon/title/paragraphs/pills and the onBegTouFun/onSkiTouFun handlers above.


		);


	}



	const extSteArr = buiTesFun( feaIdeStr, actStoObj, alrProBoo ); // What: Extra Step Array. Why: GuiTouCom needs this feature's own full step array beyond Step 1. How: This calls buiTesFun with feaIdeStr, actStoObj, and alrProBoo.


	const colAllFun = () => { // What: Collapse All Function. Why: Step 2 of the edit-item tour expects every picker to start collapsed. How: This flips only the pickers currently found expanded, leaving already-collapsed ones untouched. // "Edit your first item" wants a clean, all-collapsed Data page the moment it lands there, any picker the user happened to leave expanded from a previous visit would otherwise make the Your Pickers step's "click a header to expand" instruction confusing (that picker's already open). Runs as Step 1's own runFun, which fires at the exact moment its real nav click transitions into Step 2 (see priActFun's own comment in onboarding/tour-runner.jsx), togColFun only ever FLIPS, so this only touches pickers actually found expanded (=== false), rather than blindly toggling every picker and accidentally re-opening ones that were already collapsed.


		const colMapObj = ( staAppObj.ui && staAppObj.ui.controlsCollapsed ) || {}; // What: Collapsed Map Object. Why: Only a picker actually found expanded (=== false) should be touched. How: This reads staAppObj.ui.controlsCollapsed, falling back to an empty object.


		staAppObj.pickers.forEach( ( curPicObj ) => { if ( colMapObj[ curPicObj.id ] === false ) actStoObj.togColFun( curPicObj.id ); } ); // What: Collapse Forced Call. Why: Every picker actually found expanded must be flipped closed. How: This toggles curPicObj.id only when colMapObj marks it explicitly not collapsed.


	};



	const oneSteObj = buiTs1Fun( feaRcdObj.pagStr, feaIdeStr === 'feat_edit_item' ? colAllFun : undefined, extSteArr.length ? 'Next' : 'Done' ); // What: One Step Object. Why: Every feature but feat_highlights opens on the shared nav-button step. How: This builds it with colAllFun only for feat_edit_item, labeled Done when there are no further steps.
	const steObjArr = feaIdeStr === 'feat_highlights' ? extSteArr : [ oneSteObj, ...extSteArr ];                                                 // What: Step Object Array. Why: feat_highlights' own target is already on screen, so it skips the shared step. How: This uses extSteArr alone for feat_highlights, otherwise puts oneSteObj first.



	return (


		<GuiTouCom
			actIdeStr={ actIdeStr }
			actStoObj={ actStoObj }
			resSteNum={ resTouObj ? resTouObj.step : 0 } // What: Resume Step Attribute. Why: A tour a reload interrupted should reopen on its own checkpoint step. How: This passes resTouObj's own step when there is one, otherwise 0.
			selTabFun={ selTabFun }
			steObjArr={ steObjArr }
			touIdeStr={ `appfeature-${ feaIdeStr }` }

			onBacTouFun={ ( tarSteNum ) => { // What: On Go Back Handler. Why: A real, one-way UI transition (Edit Mode-style collapses, or the highlights toggle) must be reversed by a real control so a Back finds its target step's own selector again. How: This branches on feaIdeStr first, then on tarSteNum, driving whichever real DOM control or direct action reverses that specific transition.


				if ( feaIdeStr === 'feat_edit_item' ) { // What: Edit Item Back Branch Check. Why: Only the edit-item tour's own steps have this one-way collapse/expand state to reverse. How: This branches on feaIdeStr matching 'feat_edit_item'.


					if ( tarSteNum === 1 ) { // What: Your Pickers Collapse Check. Why: Back from Controls Section to Your Pickers must re-collapse whichever picker header(s) got expanded, restoring the same all-collapsed slate Your Pickers originally expects. How: This clicks every currently-expanded picker header, the same real click the user would trigger themselves.


						[ ...document.querySelectorAll( '[data-element-name-hook~="datLisDiv"] [data-element-name-hook~="catHeaBut"][aria-expanded="true"]' ) ].forEach( ( curHeaEle ) => curHeaEle.click() ); // What: Header Click Loop. Why: Expanding Picker A, reaching Controls Section, going Back, then expanding Picker B without A ever closing would otherwise leave BOTH open. How: This clicks every currently-expanded .catHeaBut header, collapsing all of them.


					}

					else if ( tarSteNum === 2 ) { // What: Controls Re-Collapse Check. Why: Back from Edit Picker Settings to Controls Section must re-collapse Controls, undoing that step's own real click that expanded it. How: This clicks the real, currently-expanded Controls header.


						const conHeaEle = document.querySelector( '[data-element-name-hook~="datLisDiv"] > [data-element-name-hook~="datCatSec"] [data-element-name-hook~="catBodDiv"] > button[data-element-name-hook~="catTogBut"]:nth-of-type(1)[aria-expanded="true"]' ); // What: Controls Header Element. Why: This is the real control that must be clicked shut. How: This looks it up fresh, since it only exists while a picker is expanded.


						if ( conHeaEle ) conHeaEle.click(); // What: Controls Header Click. Why: This must only fire when the control actually exists. How: This clicks conHeaEle.


					}

					else if ( tarSteNum === 3 ) { // What: Controls Re-Expand Check. Why: Back from Items Section to Edit Picker Settings must re-expand Controls, undoing Edit Picker Settings' own outgoing runFun (which collapses it on the way to Items Section). How: This clicks the real, currently-collapsed Controls header.


						const conHeaEle = document.querySelector( '[data-element-name-hook~="datLisDiv"] > [data-element-name-hook~="datCatSec"] [data-element-name-hook~="catBodDiv"] > button[data-element-name-hook~="catTogBut"]:nth-of-type(1)[aria-expanded="false"]' ); // What: Controls Header Element. Why: This is the real control that must be clicked back open. How: This looks it up fresh, since it only exists while a picker is expanded.


						if ( conHeaEle ) conHeaEle.click(); // What: Controls Header Click. Why: This must only fire when the control actually exists. How: This clicks conHeaEle.


					}

					else if ( tarSteNum === 4 ) { // What: Items Re-Collapse Check. Why: Back from Picker Items to Items Section must re-collapse Items, undoing that step's own real click that expanded it. How: This looks up the Items header via a direct action call, since a native click would silently no-op on its own disabled attribute at this exact instant.


						const catSecEle = document.querySelector( '[data-element-name-hook~="datLisDiv"] > [data-element-name-hook~="datCatSec"]:has([data-element-name-hook~="catHeaBut"][aria-expanded="true"])' ); // What: Category Section Element. Why: The picker's own id and Items header both live on its enclosing .cat section. How: This looks up the one currently-expanded picker's own section.
						const picIdeStr = catSecEle && catSecEle.dataset.pickerId; // What: Picker Identifier String. Why: actStoObj.togColFun needs this picker's own real id. How: This reads catSecEle's own data-picker-id attribute.
						const iteHeaEle = catSecEle && catSecEle.querySelector( '[data-element-name-hook~="catBodDiv"] > button[data-element-name-hook~="catTogBut"]:nth-of-type(2)' );                               // What: Items Header Element. Why: This is the real control whose own aria-expanded state must be read. How: This looks it up fresh, since it only exists while a picker is expanded.


						if ( picIdeStr && iteHeaEle && iteHeaEle.getAttribute( 'aria-expanded' ) === 'true' ) actStoObj.togColFun( picIdeStr + ':items' ); // What: Items Collapse Call. Why: Items is disabled during Picker Items itself, so a native click would silently no-op. How: This toggles the picker's own ':items' section closed directly.


					}

					else if ( tarSteNum === 5 ) { // What: Item Re-Collapse Check. Why: Back from Edit Item Settings to Picker Items must re-collapse whichever item got expanded, either by that step's own click or by the user opening a different one while freely exploring. How: This clicks the real, currently-expanded item row.


						const iteRowEle = document.querySelector( '[data-element-name-hook~="datLisDiv"] [data-element-name-hook~="lisIteDiv"] > [data-element-name-hook~="lisRowBut"][aria-expanded="true"]' ); // What: Item Row Element. Why: This is the real control that must be clicked shut. How: This looks it up fresh, since it only exists while an item is expanded.


						if ( iteRowEle ) iteRowEle.click(); // What: Item Row Click. Why: This must only fire when the control actually exists. How: This clicks iteRowEle.


					}


				}

				else if ( feaIdeStr === 'feat_highlights' ) { // What: Highlights Back Branch Check. Why: Only the highlights tour's own steps have the help-highlight toggle state to reverse. How: This branches on feaIdeStr matching 'feat_highlights'.


					if ( tarSteNum === 0 ) { // What: Toggle Off Check. Why: Back from the 2nd step to the 1st expects help mode currently off, but reaching the 2nd step in the first place required a real click that turned it on. How: This clicks the real, currently-on help-highlight toggle.


						const helButEle = document.querySelector( '[data-element-name-hook~="helTogBut"][aria-pressed="true"]' ); // What: Help Button Element. Why: This is the real control that must be clicked back off. How: This looks it up fresh, since it only exists while help mode is on.


						if ( helButEle ) helButEle.click(); // What: Help Button Click. Why: This must only fire when the control actually exists. How: This clicks helButEle.


					}


				}


			} }
			onFinTouFun={ () => cloTouFun( 'finished' ) }
			onSkiTouFun={ () => { // What: On Skip Handler. Why: Help mode's own on/off flag is local React state inside TabTodCom, unreachable from here, only reachable via the highlights tour's own 2nd step cirBoo target (.helTogBut). How: This clicks the real, currently-on help-highlight toggle when feaIdeStr is 'feat_highlights', mirroring exactly how finishing normally turns it back off.


				if ( feaIdeStr === 'feat_highlights' ) { // What: Highlights Feature Check. Why: Only this feature can leave help mode turned on mid-Step-2 for Skip to undo. How: This branches on feaIdeStr matching 'feat_highlights'.


					const helButEle = document.querySelector( '[data-element-name-hook~="helTogBut"][aria-pressed="true"]' ); // What: Help Button Element. Why: This is the real control that must be clicked back off if it's still on. How: This looks it up fresh, since it only exists while help mode is on.


					if ( helButEle ) helButEle.click(); // What: Help Button Click. Why: This must only fire when the control actually exists. How: This clicks helButEle.


				}



				cloTouFun( 'skipped' ); // What: Close Tour Call. Why: This funnels Skip through the same cleanup any other exit path off this tour uses. How: This updates this feature's own appFeatures entry to 'skipped' and calls onCloTouFun.


			} }
		/> // What: Guided Tour Element. Why: This is the actual running spotlight walkthrough for this feature, mounted once its own intro modal has been accepted or resumed into. How: This is passed this feature's own touIdeStr, step array, and the resume/lifecycle plumbing above.


	);


}

// #endregion FeaTouCom

// #endregion Components



// #region Exports

export { APP_FEA_ARR, bloReaFun, FeaTipCom, FeaTouCom, PAG_LAB_OBJ }; // What: Named Exports. Why: tab-today.jsx reads APP_FEA_ARR/PAG_LAB_OBJ/bloReaFun and renders FeaTipCom, and app.jsx renders FeaTouCom. How: This re-exports all 5 bindings by name; every other binding in this file is internal-only.

// #endregion Exports


