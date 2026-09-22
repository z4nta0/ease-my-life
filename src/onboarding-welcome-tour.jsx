


// #region Imports

import React from 'react'; // What: React. Why: This file's own WelTouCom component, its step array, and its render output all need React in scope to compile their JSX. How: This is used directly (React.useState, React.useEffect, React.useCallback) throughout WelTouCom below.


import { emlTouObj   } from './eml-tour-bus.js';            // What: Ease My Life Tour Object. Why: This is the shared observable tour bus other tabs read to react to the Welcome Tour without a context provider. How: This is written to via .set() at a few points below.
import { GuiTouCom   } from './onboarding-tour-runner.jsx'; // What: Guided Tour Component. Why: This is the generic spotlight-tour engine that actually drives the Welcome Tour once the intro modal is accepted. How: This is rendered while onbPhaStr is 'tour', passed this file's own step array and side effects.
import { hydStaFun   } from './onboarding-seed-data.js';    // What: Hydrate Stats Function. Why: The precomputed sample history stores day-offsets, not real dates. How: This converts those offsets into real ISO dates relative to today inside the seeding effect below.
import { IntModCom   } from './onboarding-intro-modal.jsx'; // What: Intro Modal Component. Why: The Welcome Tour opens on this generic intro modal before any spotlight step ever shows. How: This is rendered while onbPhaStr is 'welcome', passed this file's own copy and labels.
import { NAV_TAR_OBJ } from './onboarding-targets.jsx';     // What: Nav Target Object. Why: Four of this tour's steps just spotlight a nav button, sharing the same selector/copy as each page's own future mini-tour. How: This is spread into the Pickers/Stats/Data/Settings step objects below.
import { ONB_ESP_ARR } from './onboarding-seed-data.js';    // What: Onboarding Extra-Sample-Pickers Array. Why: These extra sample pickers make a generated day look like a fuller, more realistic todo list. How: This is spread into actStoObj.addPicker alongside ONB_EXA_OBJ by the seeding effect below.
import { ONB_EXA_OBJ } from './onboarding-seed-data.js';    // What: Onboarding Example Object. Why: This is the sample "Daily Chores" picker seeded alongside the Welcome Tour. How: This is spread into actStoObj.addPicker by the seeding effect below, exactly like a real, user-created picker.
import { ONB_SPI_ARR } from './onboarding-seed-data.js';    // What: Onboarding Sample-Picker-Ids Array. Why: The tour needs to recognize its own sample pickers by id, to hide/unhide them without touching a user's real ones. How: This is read by the settings step's run() and by bacSteFun below.
import { ONB_STI_ARR } from './onboarding-seed-data.js';    // What: Onboarding Sample-Task-Ids Array. Why: The tour needs to recognize its own sample reminders by id, so a Replay never seeds duplicates. How: This is checked before ever calling actStoObj.addTask below.
import { ONB_TAS_ARR } from './onboarding-seed-data.js';    // What: Onboarding Task Array. Why: This is the sample-reminder pool seeded alongside the sample pickers. How: This is spread into actStoObj.addTask by the Generate step's own run() and by the intro modal's onSkiTouFun below.
import { TodTopFun   } from './onboarding-tour-runner.jsx'; // What: Today Top Function. Why: Skipping the Welcome Tour should always land back on a pristine, top-scrolled Today, same as the guided tour's own Skip/Done paths. How: This is called from the intro modal's own onSkiTouFun handler below.

// #endregion Imports



/**
 * onboarding-welcome-tour.jsx = Onboarding Welcome Tour
 *
 * @summary
 * The first-run welcome modal plus a guided spotlight tour that actually
 * drives the app itself: each coach card's own primary button performs
 * the step, so the user can do it themselves or let the tour do it for
 * them. Both the modal (IntModCom) and the spotlight walkthrough
 * (GuiTouCom, onboarding-tour-runner.jsx) are generic, shared
 * components; this file only supplies the Welcome Tour's own content and
 * the handful of side effects specific to it (seeding sample data,
 * hiding it again at the end, restoring it on Back). Every future
 * per-feature mini-tour is built the same way: its own intro-modal
 * content plus its own step array, on the same two shared pieces.
 *
 * Decoupled from the tabs via three mechanisms: emlTouObj, a tiny
 * observable bus publishing prefill data for the picker form plus a live
 * phase/step so other tabs can react to the tour without a context
 * provider (e.g. Today's own empty states gate on its phase field);
 * window.__emlGenerate(), registered by TabToday so the tour can run the
 * real generator without reaching into the footer's own confirm dialog;
 * and a set of data-tour / .ob-* / data-tab selectors on real target
 * elements.
 *
 * Trigger: this shows whenever state.onboarding.welcomed is false (a
 * clean state). The dev seed.js build (SED_NAM_OBJ.buiSeeFun) ships
 * welcomed:true so the sample-data build is never nagged by it; visit
 * #onboard-demo for a non-destructive clean-state preview (see
 * app.jsx).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



const BRA_MAR_STR = 'M 24.467 527.792 C 67.266 416.298 77.088 228.913 172.207 434.412 C 200.739 535.77 262.562 434.412 314.873 292.51 C 381.45 120.201 450.381 44.636 528.854 24.365 C 521.725 22.337 512.215 24.365 493.193 34.5 C 369.548 105.451 295.85 292.51 234.029 363.461 C 186.473 414.14 167.451 241.831 124.651 262.102 C 101.828 270.008 60.133 375.754 24.467 527.792 Z'; // What: Brand Mark String. Why: This is the app's own brand glyph path, drawn as the intro modal's icon. How: This is passed as the sole <path>'s own d attribute inside the icoTopEle prop below.



// #region WelTouCom

/**
 * WelTouCom = Welcome Tour Component
 *
 * @summary
 * Renders whichever piece of the Welcome Tour is currently relevant: the
 * intro modal, the running GuiTouCom, or nothing at all once it's
 * finished. Owns the Welcome Tour's own step content (steObjArr), the
 * seeding/unseeding of the sample pickers and reminders it depends on,
 * and the handful of side effects a step back into an earlier step
 * needs to undo (bacSteFun).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.staAppObj - State App Object: The entire app's own
 *                          persisted state.
 * @param props.actStoObj - Action Store Object: The shared app actions
 *                          that mutate props.staAppObj.
 * @param props.actIdeStr - Active Identifier String: the app's own
 *                          currently active tab id.
 * @param props.selTabFun - Select Tab Function: switches the app's own
 *                          active tab.
 *
 * @returns Either null (phase 'off'), the intro modal (phase
 * 'welcome'), or the running guided tour (phase 'tour'), depending on
 * onbPhaStr.
 *
 * @example
 * ```tsx
 * WelTouCom({ staAppObj, actStoObj, actIdeStr, ... }) // => <WelTouCom />
 * ```
 *
*/

function WelTouCom ( { staAppObj, actStoObj, actIdeStr, selTabFun } ) {


	const onbStaObj = staAppObj.onboarding || { welcomed : true };                                                                       // What: Onboarding State Object. Why: A brand-new install has no persisted onboarding slice yet, so a plain stand-in default is needed until the real one exists. How: This reads staAppObj.onboarding, falling back to an object whose welcomed field alone is enough for every check below.
	const resTouObj = onbStaObj.welcomed && onbStaObj.activeTour && onbStaObj.activeTour.id === 'welcome' ? onbStaObj.activeTour : null; // What: Resume Tour Object. Why: A tour a reload interrupted should resume exactly where it left off instead of vanishing, since activeTour survives a reload (it's real persisted state) unlike GuiTouCom's own step state, but only once welcomed is already true, so the welcome modal (not yet dismissed) always takes priority. How: This reads onbStaObj.activeTour back out only when its own id matches 'welcome', otherwise null.

	const [ onbPhaStr, setOnbPhaStr ] = React.useState( !onbStaObj.welcomed ? 'welcome' : ( resTouObj ? 'tour' : 'off' ) ); // What: Onboarding Phase String And Setter. Why: This is the tour's own top-level position: 'welcome' (intro modal showing), 'tour' (GuiTouCom running), or 'off' (nothing to show). How: This starts on 'welcome' whenever onbStaObj.welcomed is false, otherwise resumes straight into 'tour' when resTouObj says a tour was left running, else 'off'.


	React.useEffect( () => { // What: Reopen On Flip Effect. Why: A Replay Tour from Settings (or the #onboard-demo route) flips welcomed back to false on an already-mounted app, and that needs to reopen the modal, not just be checked once at initial page load. How: This flips onbPhaStr back to 'welcome' whenever onbStaObj.welcomed is false and nothing is currently showing.


		if ( !onbStaObj.welcomed && onbPhaStr === 'off' ) setOnbPhaStr( 'welcome' ); // What: Reopen Guard. Why: Only a genuinely idle onboarding should be reopened by this effect. How: This sets onbPhaStr only when welcomed is false and onbPhaStr is currently 'off'.


	}, [ onbStaObj.welcomed ] ); // What: Effect Dependency Array. Why: This must re-run whenever the persisted welcomed flag itself flips. How: onbStaObj.welcomed is the exact value this effect reopens on.


	React.useEffect( () => { // What: Seed Samples Effect. Why: Every tour step always needs real content to point at and generate from, and this must re-run on every genuine "flag flips" event (a Replay Tour on an already-mounted app), not just once on initial mount, guarded on the sample ids specifically existing (any status, hidden or not) rather than "the user has any picker at all", since a Replay Tour or an imported backup can leave welcomed false while state.pickers already holds the user's own real, sample-unrelated pickers; a plain "has any picker" check would read that as already-seeded and skip forever, leaving the per-page mini-tours with no sample to ever point at. How: This seeds ONB_EXA_OBJ plus every ONB_ESP_ARR entry as real pickers, then dynamic-imports the ~650KB precomputed Stats history (irrelevant to everyone past their first run, so kept out of the main bundle) and hydrates its day-offsets into real ISO dates relative to today via hydStaFun.


		if ( onbStaObj.welcomed || staAppObj.pickers.some( ( curPicObj ) => ONB_SPI_ARR.includes( curPicObj.id ) ) ) return; // What: Already Seeded Guard. Why: A welcomed-false state whose samples already exist (from an earlier pass, hidden or not) must never be seeded twice. How: This bails out once welcomed is already true, or once any sample picker id is already present among staAppObj.pickers.



		[ ONB_EXA_OBJ, ...ONB_ESP_ARR ].forEach( ( curPicObj ) => actStoObj.addPicker( curPicObj ) ); // What: Sample Picker Seed Call. Why: Every step of the tour needs a real, generatable picker to point at. How: This adds ONB_EXA_OBJ and every ONB_ESP_ARR entry exactly like a real, user-created picker.


		import( './onboarding-stats-data.js' ).then( ( { ONBOARDING_STATS } ) => { // What: Stats History Import. Why: The sample reminders themselves are seeded later, at the Generate step's own run() below (unlike picker items, a reminder needs no "generate" to become visible on Today, so seeding it here would show it before the user has generated anything), but this precomputed history is independent of whether the live task exists yet, since log rows are denormalized. How: This dynamic-imports the generated stats-history module once seeding is confirmed necessary.


			actStoObj.seedHistory( hydStaFun( ONBOARDING_STATS ) ); // What: Seed History Call. Why: The Stats tab needs a full year of matching history for the sample pickers to look genuinely used, not brand new. How: This hydrates ONBOARDING_STATS' own day-offsets into real dates and persists them as pick/reminder log rows.


		} );


	}, [ onbStaObj.welcomed ] ); // What: Effect Dependency Array. Why: This must re-run whenever the persisted welcomed flag itself flips, the same trigger the reopen effect above reacts to, not just once at mount. How: onbStaObj.welcomed is the exact value gating whether seeding is even considered.



	const finTouFun = React.useCallback( () => { // What: Finish Tour Function. Why: Every path that ends the Welcome Tour (Skip, Done, or the not-found watchdog inside GuiTouCom) needs the exact same cleanup. How: This flips onbPhaStr to 'off' and clears the shared bus's own prefill field.


		setOnbPhaStr( 'off' ); // What: Phase Off Set Call. Why: Nothing further from this tour should render once it's finished. How: This flips onbPhaStr to 'off'.

		emlTouObj.set( { prefill : null } ); // What: Prefill Clear Call. Why: A stale prefill left over from an earlier step must not leak into whatever the picker form shows next. How: This clears the shared bus's own prefill field.


	}, [] ); // What: Effect Dependency Array. Why: This callback closes over nothing that ever changes across renders. How: An empty array means there is no dependency that could ever change to trigger a re-creation.



	const welDonFun = () => actStoObj.setOnboarding( { welcomed : true } ); // What: Welcome Done Function. Why: Both accepting and skipping the tour are, from the persisted state's own point of view, the same "the welcome modal is done" transition. How: This persists onboarding.welcomed as true.



	/**
	 * steObjArr = Step Object Array
	 *
	 * @summary
	 * Each entry holds a target selector, copy, a primary action, and
	 * which tab its target lives on (tab); GuiTouCom switches there
	 * automatically, no step here ever calls selectTab itself. Every
	 * step's own run() is a pure side effect: which step/tab comes
	 * next is handled generically by GuiTouCom (advance by one, or
	 * finish once primary is 'Done'), never by run() itself.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const steObjArr = [ // What: Step Object Array. Why: This is the Welcome Tour's own ordered content, read by <GuiTouCom> below. How: This is passed directly as GuiTouCom's own steps prop.


		{ // What: Today Nav Step Object. Why: The tour's very first step orients the user on the Today tab's own nav button. How: This spreads NAV_TAR_OBJ.today's shared selStr/place/titStr/bodEle onto a step targeting the 'today' tab, with no Back button since it's the first step.


			...NAV_TAR_OBJ.today, // What: Today Nav Target Spread. Why: This reuses the shared Today nav-target descriptor instead of duplicating its selStr/place/titStr/bodEle. How: This spreads NAV_TAR_OBJ.today's own fields onto this step object.

			bacBoo : false,  // What: Back Boolean. Why: This is the tour's very first step, so there is nothing to go back to. How: GuiTouCom hides its own Back button whenever this is false.
			priStr : 'Next', // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
			tabStr : 'today' // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


		},

		{ // What: Generate Step Object. Why: This is the step that actually produces (or reviews) a real Today list, seeding the sample reminders and running the real generator alongside the tour's own "do it yourself" fallback path. How: This targets whichever of .ob-generate/.gen-confirm currently exists, and its own runFun() below both triggers generation and seeds the sample reminders.


			advClkStr : '.gen-confirm-continue',      // What: Advance Click String. Why: Confirming the real Regenerate flow (the "do it yourself" path this step's own body text offers) is functionally the same action Next's own runFun() performs below via window.__emlGenerate(), and the real generate() call is reentrancy-guarded (see tab-today.jsx's own generatingRef), so whichever of the two fires first wins and the other becomes a harmless no-op. How: A real click landing on .gen-confirm-continue is treated exactly like clicking Next, runFun() included.
			bacBoo    : true,                         // What: Back Boolean. Why: The user should always be able to return to the previous, Today-orientation step. How: GuiTouCom shows its own Back button whenever this is true.
			priStr    : 'Next',                       // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
			selStr    : '.ob-generate, .gen-confirm', // What: Selector String. Why: .gen-confirm is a fallback, not the primary target: clicking Regenerate yourself (the step's own "do it yourself" path) replaces the button with tab-today.jsx's own confirm prompt, and without this fallback the step's own target would genuinely vanish for however long the user takes to read the step and click Continue, long enough on a real human timescale to trip the not-found watchdog and end the tour outright. How: GuiTouCom tries .ob-generate first, falling back to .gen-confirm once the button has already been replaced.
			tabStr    : 'today',                      // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.
			titStr    : 'Todo list generation',       // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuiTouCom renders this as the step's own heading text.

			bodEle    : <>Each morning the app will <b>automatically generate your daily todo list</b>. Since you have not created anything yet, the app will use some sample data so that you can see how it works. You can always click Regenerate if you’d rather generate the list yourself. Let’s go ahead and run that now.</>, // What: Body Element. Why: This step's own coach card needs a plain description of what the generator does. How: GuiTouCom renders this as the step's own descriptive paragraph, written as JSX so specific phrases can be bolded.

			runFun    : () => { // What: Run Function. Why: On a genuine first run, the real generator needs to actually fire; on a replay (dismissed:true) the user already has a real Today list, so regenerating would clobber it, and the sample reminders below need seeding differently in each case too. How: This conditionally calls window.__emlGenerate() and seeds ONB_TAS_ARR, guarded by existence so returning to this step and forward again can never seed either one twice.


				if ( !onbStaObj.dismissed ) { // What: Not Dismissed Guard. Why: Only a true first run should actually regenerate the list; a replay's own review moment is the user's real, current list, not sample data. How: This calls the registered generator only when onbStaObj.dismissed is falsy.


					if ( window.__emlGenerate ) window.__emlGenerate(); // What: Generate Call. Why: The next step's own highlight covers the whole list, group sections included, so it already has a real target to point at while the list is still filling in. How: This calls the generator TabToday registered on window.__emlGenerate, if it has registered one yet.


				}



				if ( !staAppObj.tasks.some( ( curTasObj ) => ONB_STI_ARR.includes( curTasObj.id ) ) ) { // What: Sample Tasks Missing Guard. Why: This used to sit inside the "not dismissed" branch above, which meant a replay never created the sample reminders at all, silently breaking their own two mini-tour launcher cards under Reminders on any replay. How: This seeds the sample tasks whenever none of them already exist, on a first run or a replay alike.


					const dowValNum = new Date().getDay(); // What: Day-Of-Week Value Number. Why: A weekly sample reminder needs a real day of the week to be scheduled on. How: This reads the current local day index (0-6) from a fresh Date.


					ONB_TAS_ARR.forEach( ( curTasObj ) => actStoObj.addTask( { // What: Sample Task Add Call. Why: On a true first run these appear alongside the generated picks, not before; on a replay there is no such review moment, so they are seeded straight into hidden instead, same as the intro modal's own onSkiTouFun handling below. How: This adds each ONB_TAS_ARR entry, pinning a weekly one to today and hiding it outright on a replay.


						...curTasObj, // What: Task Spread. Why: Every one of the sample task's own fields is kept as authored. How: This spreads curTasObj's own fields first so the overrides below can still win.
						...( curTasObj.repeat === 'weekly' ? { daysOfWeek : [ dowValNum ] } : {} ), // What: Weekly Override. Why: A weekly-repeat sample reminder should actually show up today, not on whatever day it happened to be authored for. How: This overrides daysOfWeek to [dowValNum] only when curTasObj.repeat is 'weekly'.
						...( onbStaObj.dismissed ? { hidden : true } : {} ) // What: Dismissed Override. Why: A replay has no in-between review step for these to appear alongside, so they must start hidden. How: This overrides hidden to true only when onbStaObj.dismissed is true.


					} ) );


				}


			}


		},

		{ // What: List Review Step Object. Why: This step lets the user see what a real generated todo list looks like before they have created anything of their own. How: This spotlights the whole generated list via .group-section, scrolled to the top since its own target already starts there.


			bacBoo : true,              // What: Back Boolean. Why: The user should always be able to return to the previous, Generate step. How: GuiTouCom shows its own Back button whenever this is true.
			priStr : 'Next',            // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
			selStr : '.group-section',  // What: Selector String. Why: This step highlights the whole generated list, group sections included. How: GuiTouCom spotlights every element .group-section matches.
			sttBoo : true,              // What: Scroll-To-Top Boolean. Why: This step's own target starts right at the top of the page anyway. How: GuiTouCom scrolls all the way to 0 instead of just nudging the target into view.
			tabStr : 'today',           // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.
			titStr : 'Daily todo list', // What: Title String. Why: This step's own coach card needs a heading naming what it's showing. How: GuiTouCom renders this as the step's own heading text.

			bodEle : <>This is <b>what a typical todo list will look like</b> once you’ve set up your own pickers and reminders. There will be tutorials for setting these up once this tour ends.</> // What: Body Element. Why: This step's own coach card needs a plain description of what the highlighted list represents. How: GuiTouCom renders this as the step's own descriptive paragraph, written as JSX so specific phrases can be bolded.


		},

		{ // What: Picker Nav Step Object. Why: This step orients the user on the Pickers tab's own nav button, immediately after they have seen a sample list. How: This spreads NAV_TAR_OBJ.picker's shared selStr/place/titStr/bodEle onto a step targeting the 'picker' tab.


			...NAV_TAR_OBJ.picker, // What: Picker Nav Target Spread. Why: This reuses the shared Pickers nav-target descriptor instead of duplicating its selStr/place/titStr/bodEle. How: This spreads NAV_TAR_OBJ.picker's own fields onto this step object.

			bacBoo : true,    // What: Back Boolean. Why: The user should always be able to return to the previous, list-review step. How: GuiTouCom shows its own Back button whenever this is true.
			priStr : 'Next',  // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
			tabStr : 'picker' // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


		},

		{ // What: Stats Nav Step Object. Why: This step orients the user on the Stats tab's own nav button. How: This spreads NAV_TAR_OBJ.stats's shared selStr/place/titStr/bodEle onto a step targeting the 'stats' tab.


			...NAV_TAR_OBJ.stats, // What: Stats Nav Target Spread. Why: This reuses the shared Stats nav-target descriptor instead of duplicating its selStr/place/titStr/bodEle. How: This spreads NAV_TAR_OBJ.stats's own fields onto this step object.

			bacBoo : true,   // What: Back Boolean. Why: The user should always be able to return to the previous, Pickers step. How: GuiTouCom shows its own Back button whenever this is true.
			priStr : 'Next', // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
			tabStr : 'stats' // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


		},

		{ // What: Data Nav Step Object. Why: This step orients the user on the Data tab's own nav button. How: This spreads NAV_TAR_OBJ.data's shared selStr/place/titStr/bodEle onto a step targeting the 'data' tab.


			...NAV_TAR_OBJ.data, // What: Data Nav Target Spread. Why: This reuses the shared Data nav-target descriptor instead of duplicating its selStr/place/titStr/bodEle. How: This spreads NAV_TAR_OBJ.data's own fields onto this step object.

			bacBoo : true,   // What: Back Boolean. Why: The user should always be able to return to the previous, Stats step. How: GuiTouCom shows its own Back button whenever this is true.
			priStr : 'Next', // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
			tabStr : 'data'  // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


		},

		{ // What: Settings Nav Step Object. Why: This step orients the user on the Settings tab's own nav button, and also hides the sample data now that the tour has finished touring every tab. How: This spreads NAV_TAR_OBJ.settings's shared selStr/place/titStr/bodEle onto a step targeting the 'settings' tab, with its own runFun() hiding every sample picker and task.


			...NAV_TAR_OBJ.settings, // What: Settings Nav Target Spread. Why: This reuses the shared Settings nav-target descriptor instead of duplicating its selStr/place/titStr/bodEle. How: This spreads NAV_TAR_OBJ.settings's own fields onto this step object.

			bacBoo : true,       // What: Back Boolean. Why: The user should always be able to return to the previous, Data step. How: GuiTouCom shows its own Back button whenever this is true.
			priStr : 'Next',     // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
			tabStr : 'settings', // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.

			runFun : () => { // What: Run Function. Why: The sample pickers/reminders are not deleted, since the per-page mini-tours will reuse this exact data (and its precomputed Stats history) later, only tucked out of sight. How: This hides every sample picker and every sample task.


				ONB_SPI_ARR.forEach( ( picIdeStr ) => actStoObj.updatePicker( picIdeStr, { hidden : true } ) ); // What: Sample Picker Hide Call. Why: A hidden sample still exists for a later mini-tour to reuse, it just should not clutter Today anymore. How: This updates every sample picker id to hidden:true.

				ONB_TAS_ARR.forEach( ( curTasObj ) => actStoObj.updateTask( curTasObj.id, { hidden : true } ) ); // What: Sample Task Hide Call. Why: A hidden sample reminder still exists for its own mini-tour launcher card to read later. How: This updates every ONB_TAS_ARR entry's own id to hidden:true.


			}


		},

		{ // What: Closing Step Object. Why: This is the tour's own last step, closing out the Welcome Tour and pointing at where the per-page mini-tours will appear next. How: This spotlights .groups-dnd, scrolled to the top, with a 'Done' priStr that finishes the tour instead of advancing.


			bacBoo : true,                   // What: Back Boolean. Why: The user should always be able to return to the previous, Settings step. How: GuiTouCom shows its own Back button whenever this is true.
			priStr : 'Done',                 // What: Primary String. Why: This is the tour's own last step, so its main action finishes the tour instead of advancing. How: GuiTouCom reads a 'Done' priStr as the signal to call onFinTouFun instead of moving to a next step.
			selStr : '.groups-dnd',          // What: Selector String. Why: This closing step highlights the same area the tutorial launcher cards will appear in next. How: GuiTouCom spotlights whatever .groups-dnd matches.
			sttBoo : true,                   // What: Scroll-To-Top Boolean. Why: This step's own target starts right at the top of the page anyway. How: GuiTouCom scrolls all the way to 0 instead of just nudging the target into view.
			tabStr : 'today',                // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.
			titStr : 'You’re all finished!', // What: Title String. Why: This closing step's own coach card needs a heading marking the tour's own end. How: GuiTouCom renders this as the step's own heading text.

			bodEle : <>That is all for the Welcome Tour. Highlighted here are <b>a few small tutorials that will help get you set up to start using the app</b>. Enjoy!</> // What: Body Element. Why: This closing step's own coach card needs a plain description of what comes next. How: GuiTouCom renders this as the step's own descriptive paragraph, written as JSX so specific phrases can be bolded.


		}


	];



	/**
	 * bacSteFun = Back Step Function
	 *
	 * @summary
	 * Sample pickers/tasks only ever get hidden once, at the Settings
	 * step's own run() above, so stepping back before that point should
	 * show them exactly as they did the first time through, not
	 * whatever the checklist phase (tutorial cards, Page Tours) left
	 * behind from having reached the end. Skipped entirely during a
	 * replay (onbStaObj.dismissed): those samples are the ORIGINAL ones
	 * from the user's first-ever onboarding, already hidden long before
	 * this session started, and un-hiding them would mix stale demo
	 * pickers into the real, current Today list.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const bacSteFun = ( tarSteNum ) => { // What: Back Step Function. Why: GuiTouCom's own onBacTouFun calls this before actually navigating back to a given step, so any step-specific side effect a later step performed can be undone. How: This unhides the sample pickers, then branches on tarSteNum for the one step (the Generate step) whose own forward runFun() adds data that did not exist before it fired.


		if ( onbStaObj.dismissed ) return; // What: Dismissed Guard. Why: A replay's own samples are the user's real, already-hidden ones; unhiding them here would leak stale demo data into the real Today list. How: This bails out before touching anything whenever onbStaObj.dismissed is true.



		ONB_SPI_ARR.forEach( ( picIdeStr ) => actStoObj.updatePicker( picIdeStr, { hidden : false } ) ); // What: Sample Picker Unhide Call. Why: Every earlier step's own review of the sample pickers should look exactly as it did the first time through. How: This updates every sample picker id back to hidden:false.



		if ( tarSteNum === 1 ) { // What: Generate Step Target Check. Why: Sample REMINDERS do not exist yet the very first time the Generate step shows, since its own run() only adds them once its Next actually fires. How: This branch fully removes them instead of hiding them, since a hidden sample would keep the shared bus's own phase reading a tutorial checklist as still relevant here.


			ONB_TAS_ARR.forEach( ( curTasObj ) => actStoObj.removeTask( curTasObj.id ) ); // What: Sample Task Remove Call. Why: Safe to fully delete, since the Generate step's own forward run() re-adds them exactly as before the moment Next fires again. How: This removes every ONB_TAS_ARR entry's own id from state.tasks.

			actStoObj.clearTodayEntries(); // What: Today Entries Clear Call. Why: The picker list should again look like nothing has been generated yet. How: This clears whatever entries currently sit on Today.


		}

		else { // What: Other Step Target Branch. Why: Every step besides the Generate step only ever needs the sample tasks unhidden, never removed. How: This updates every ONB_TAS_ARR entry's own id back to hidden:false.


			ONB_TAS_ARR.forEach( ( curTasObj ) => actStoObj.updateTask( curTasObj.id, { hidden : false } ) ); // What: Sample Task Unhide Call. Why: An earlier step's own review of the sample reminders should look exactly as it did the first time through. How: This updates every ONB_TAS_ARR entry's own id back to hidden:false.


		}


	};



	if ( onbPhaStr === 'off' ) return null; // What: Off Guard. Why: Nothing should render once the Welcome Tour has finished or was never triggered at all. How: This returns null early whenever onbPhaStr is 'off'.



	if ( onbPhaStr === 'welcome' ) { // What: Welcome Phase Check. Why: The intro modal must show before any spotlight step ever does. How: This returns the IntModCom below whenever onbPhaStr is 'welcome'.


		return (


			<IntModCom
				icoTopEle={ <svg viewBox='8 8 528 528' fill='none'><path style={{ fill : 'currentColor', stroke : 'currentColor' }} d={ BRA_MAR_STR } strokeWidth='8' strokeLinecap='round' strokeLinejoin='round' /></svg> }
				titHeaStr='Welcome to Ease My Life'
				parEleArr={ [ // What: Paragraph Element Array. Why: The intro modal's own body needs its full set of paragraphs passed as one prop. How: This holds the 3 paragraph entries below, mixing a JSX fragment (for bolded phrases) and plain strings.


					<>Decide less and add some variety to your life! <b>Ease My Life is a todo app that automatically generates a daily list of tasks</b> from lists of items that you create and according to the rules that you set.</>, // What: Intro Paragraph Element. Why: The modal's own body needs an opening paragraph explaining what the app does. How: This is rendered as the modal's own first paragraph, written as JSX so specific phrases can be bolded.

					'Ease My Life requires no account to use, works completely offline, stores all data on your device and is ad free!', // What: Privacy Paragraph String. Why: The modal's own body needs a paragraph addressing privacy/account concerns up front. How: This is rendered as the modal's own second paragraph.

					'This welcome tour will show you the layout of the app and help you understand how it works. After it finishes, there will be a few small tutorials that will guide you through setting up everything you need in order to generate your first todo list. Let’s get started!' // What: Tour Preview Paragraph String. Why: The modal's own body needs a closing paragraph setting expectations for what comes next. How: This is rendered as the modal's own third and final paragraph.


				] }
				pilLabArr={ [ 'todo list', 'pickers', 'reminders' ] }
				begLabStr='Take the quick tour'
				skiLabStr='I’ll explore myself'
				onBegTouFun={ () => { // What: On Begin Handler. Why: Accepting the tour needs to switch to Today, persist that the welcome modal is done, and hand off to the running GuiTouCom, all as one action. How: This is called when IntModCom's own primary button is activated.


					selTabFun( 'today' ); // What: Today Switch Call. Why: The tour should always begin its walkthrough from the Today tab. How: This switches the app's own active tab to 'today'.

					welDonFun(); // What: Welcome Done Call. Why: Accepting the tour is also the point this welcome modal should never show again. How: This persists onboarding.welcomed as true.

					setOnbPhaStr( 'tour' ); // What: Phase Set To Tour Call. Why: The modal itself must give way to the running guided tour. How: This flips onbPhaStr to 'tour', which the render logic below reads to switch from the modal to GuiTouCom.


				} }
				onSkiTouFun={ () => { // What: On Skip Handler. Why: Skipping still needs to land on the exact same "few small tutorials" checklist phase the full tour reaches at its own last step (the Generate step's task-seeding run(), the Settings step's hide-everything run(), see steObjArr above), since without this Today would have nothing to show: the sample pickers would exist but not be hidden yet, and no sample reminders would exist at all; seeded straight into hidden here, unlike the tour's own Generate step, since there is no in-between "review the generated list" step for them to be visible during first. How: This persists welcomed, seeds the sample tasks (hidden) if they do not already exist, hides the sample pickers, finishes the tour, and lands back on a pristine Today.


					welDonFun(); // What: Welcome Done Call. Why: Skipping is also the point this welcome modal should never show again. How: This persists onboarding.welcomed as true.



					if ( !staAppObj.tasks.some( ( curTasObj ) => ONB_STI_ARR.includes( curTasObj.id ) ) ) { // What: Sample Tasks Missing Guard. Why: A Skip that runs twice (or a Replay that already seeded these) must never duplicate the sample reminders. How: This seeds the sample tasks only when none of them already exist.


						const dowValNum = new Date().getDay(); // What: Day-Of-Week Value Number. Why: A weekly sample reminder needs a real day of the week to be scheduled on. How: This reads the current local day index (0-6) from a fresh Date.


						ONB_TAS_ARR.forEach( ( curTasObj ) => actStoObj.addTask( { // What: Sample Task Add Call. Why: There is no in-between review step on this path for these to be visible during, unlike the tour's own Generate step. How: This adds each ONB_TAS_ARR entry, pinning a weekly one to today and hiding it outright.


							...curTasObj, // What: Task Spread. Why: Every one of the sample task's own fields is kept as authored. How: This spreads curTasObj's own fields first so the overrides below can still win.
							...( curTasObj.repeat === 'weekly' ? { daysOfWeek : [ dowValNum ] } : {} ), // What: Weekly Override. Why: A weekly-repeat sample reminder should actually show up today, not on whatever day it happened to be authored for. How: This overrides daysOfWeek to [dowValNum] only when curTasObj.repeat is 'weekly'.

							hidden : true // What: Hidden Override. Why: There is no review moment on this path for these to appear alongside first. How: This always overrides hidden to true on this path.


						} ) );


					}



					ONB_SPI_ARR.forEach( ( picIdeStr ) => actStoObj.updatePicker( picIdeStr, { hidden : true } ) ); // What: Sample Picker Hide Call. Why: Skipping reaches the same "tucked out of sight, not deleted" end state the full tour's own Settings step reaches. How: This updates every sample picker id to hidden:true.

					finTouFun(); // What: Finish Tour Call. Why: Skipping still needs the exact same cleanup any other path off the tour performs. How: This flips onbPhaStr to 'off' and clears the shared bus's own prefill field.

					TodTopFun( actIdeStr, selTabFun ); // What: Today Landing Call. Why: Skipping should always land back on a pristine, top-scrolled Today, same as the guided tour's own Skip/Done paths. How: This switches to Today if needed and scrolls both the app's own scroller and the window to 0.


				} }
			/> // What: Tutorial Intro Modal Element. Why: This is the Welcome Tour's own opening screen, shown before any spotlight step ever does. How: This is passed this file's own brand icon, copy, pills, and the onBegTouFun/onSkiTouFun handlers above.


		);


	}



	return (


		<GuiTouCom
			touIdeStr='welcome'
			steObjArr={ steObjArr }
			resSteNum={ resTouObj ? resTouObj.step : 0 }
			actStoObj={ actStoObj }
			actIdeStr={ actIdeStr }
			selTabFun={ selTabFun }
			onBacTouFun={ bacSteFun }
			onFinTouFun={ finTouFun }
		/> // What: Guided Tour Element. Why: This is the actual running spotlight walkthrough, mounted once the intro modal has been accepted or resumed into. How: This is passed this file's own touIdeStr, steObjArr, and the resume/lifecycle plumbing above.


	);


}

// #endregion WelTouCom



export { WelTouCom }; // What: Named Exports. Why: app.jsx renders this as the first-run welcome modal and its own driven tour. How: This re-exports WelTouCom; every other binding in this file is internal-only.


