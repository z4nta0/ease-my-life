


// #region Imports

import React from 'react'; // What: React. Why: This file's own PagTouCom component needs React in scope to compile its JSX and to call React.useState. How: This is used directly (React.useState) below, instead of importing individual named hooks.


import { buiTesFun   } from './page-steps.jsx';                 // What: Build Tour-Extra-Steps Function. Why: Each page tour's own steps after Step 1 come from that page's catalog. How: This is called with the page id and the shared app actions object.
import { buiTs1Fun   } from './page-steps.jsx';                 // What: Build Tour-Step-1 Function. Why: Every page tour opens with the same kind of nav step. How: This is called with the page key, its run function, and its button labels.
import { canRenFun   } from './page-steps.jsx';                 // What: Cancel Rename Function. Why: A Back out of the rename step must discard whatever was typed. How: This is called from the tour's own Back handler.
import { clePicFun   } from './page-samples.js';                // What: Clear Picker Function. Why: A page tour's disposable picker copies must never linger past the tour. How: This is called when a tour closes.
import { cleTasFun   } from './page-samples.js';                // What: Clear Task Function. Why: A page tour's disposable reminder copies must never linger past the tour. How: This is called when a tour closes.
import { emlTouObj   } from '../state/tour-bus.js';             // What: Ease My Life Tour Object. Why: This publishes/reads bus nonces the Pickers-page onBacTouFun handler uses to reset or redo an in-flight picker-form animation. How: This is read via .get() and written via .set() inside PagTouCom's own onBacTouFun below.
import { forNamFun   } from './page-steps.jsx';                 // What: Force Name Function. Why: A click racing an open rename input's delayed commit must not lose the tour's group name. How: This is called with the shared app actions object before a step advances.
import { GuiTouCom   } from './tour-runner.jsx';                // What: Guided Tour Component. Why: This is the generic spotlight-tour engine that actually drives each page mini-tour once its own intro modal is accepted. How: This is rendered while touPhaStr is 'tour', passed this file's own per-page step array.
import { hidHisFun   } from '../state/sample-history.js';       // What: Hide History Function. Why: The real sample pickers borrowed by the Stats tour must go back to hidden the moment that tour ends. How: This is called when the Stats tour closes.
import { IcoSvgCom   } from '../ui/icon.jsx';                   // What: Icon Svg Component. Why: The intro modal needs a recognizable glyph matching the current page. How: This is rendered inside the intro modal's icon prop below.
import { IntModCom   } from './intro-modal.jsx';                // What: Intro Modal Component. Why: Each page mini-tour opens on this generic intro modal before any spotlight step ever shows. How: This is rendered while touPhaStr is 'intro', passed this page's own icon/title/paragraphs/pills.
import { NAV_TAR_OBJ } from './targets.jsx';                    // What: Nav Target Object. Why: A page's own intro modal falls back to this shared nav-button catalog's copy. How: This is looked up by a page key inside PagTouCom.
import { neeCopFun   } from './page-samples.js';                // What: Needs Copies Function. Why: Only the Pickers and Data tours work on disposable copies. How: This is called with the page id to decide whether to seed or clear them.
import { ONB_EPT_ARR } from '../state/onboarding-checklist.js'; // What: Onboarding Explore-Page-Tours Array. Why: PagTouCom below needs this page tour's own id/page/label manifest entry. How: This is searched by pagIdeStr inside PagTouCom below.
import { seePicFun   } from './page-samples.js';                // What: Seed Picker Function. Why: The Pickers and Data tours need real, disposable picker copies to demonstrate on. How: This is called when one of those tours opens.
import { seeTasFun   } from './page-samples.js';                // What: Seed Task Function. Why: The Data tour needs real, disposable reminder copies to demonstrate on. How: This is called when that tour opens.
import { unhHisFun   } from '../state/sample-history.js';       // What: Unhide History Function. Why: The Stats tour's own heatmap and breakdown need the real sample pickers and their history. How: This is called when the Stats tour starts.

// #endregion Imports



/**
 * page-tours.jsx = Page Tours
 *
 * @summary
 * Content for the page tours ("Explore the {page}", for
 * Today/Pickers/Stats/Data/Settings), launched from each page's own Today
 * launcher card (see onboarding-checklist.js's ONB_EPT_ARR and
 * tabs/today/page-tour-card.jsx). PagTouCom opens a page's intro modal (its
 * copy in PAG_COP_OBJ), then runs its tour: Step 1 is the shared nav-button
 * highlight built by page-steps.jsx's own buiTs1Fun (also reused verbatim by
 * onboarding/app-features.jsx's own App Features tours), and the rest walks
 * that page's own interior elements.
 *
 * The Pickers/Data tours need real pickers on screen to point at, but both
 * expose real edit/delete controls, so they seed disposable `pt_`-prefixed
 * COPIES of the Welcome Tour's own hidden samples (page-samples.js) rather
 * than risk the user's own interaction here corrupting that shared reference
 * data; the Data tour does the same for reminders, and both clean their copies
 * up the moment their own tour ends. The Stats tour has no edit/delete
 * controls at all, so it instead borrows the REAL hidden samples for its own
 * duration through state/sample-history.js, hiding them again on exit.
 *
 * Each page's own interior elements are described in a small "content only"
 * catalog in page-steps.jsx, the same selStr/titStr/bodEle shape as
 * NAV_TAR_OBJ, kept separate from navigation flags (tabStr/priStr/bacBoo/...)
 * so a future on-demand multi-highlight help mode could pull from these same
 * catalogs directly. page-steps.jsx's own buiTesFun assembles each page's real
 * step array by spreading a catalog entry together with that flow's own
 * navigation flags.
 *
 * Sections:
 *  - Constants
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

// #region PAG_COP_OBJ

/**
 * PAG_COP_OBJ = Page Copy Object
 *
 * @summary
 * Each page tour's own intro-modal title/body/pills, keyed by its own
 * checklist id. Falls back to NAV_TAR_OBJ's own per-page titStr/bodEle
 * (already written to stand alone, with no reference to "this tour" or
 * "the next step" baked in) for any page this object hasn't gotten its
 * own dedicated copy pass yet.
 *
 * Every entry below shares this exact shape, and none of the 5 entries
 * repeat these same fields' own boilerplate comments on their own lines
 * (see the "Repeated-shape object literals" comment exception in
 * CLAUDE.md):
 *
 * - `bodEle` (Element): Body Element is the intro modal's own plain
 *   description of what this tour covers, rendered as the sole entry of
 *   IntModCom's own parEleArr prop.
 *
 * - `pilArr` (Array): Pills Array holds 3 short tags describing this
 *   tour, rendered as the intro modal's own pill row (IntModCom's own
 *   pilLabArr prop).
 *
 * - `titStr` (String): Title String is the intro modal's own heading
 *   naming this page, rendered as IntModCom's own titHeaStr prop.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const PAG_COP_OBJ = { // What: Page Copy Object. Why: PagTouCom's own intro modal reads this by pagIdeStr for its title/body/pills, falling back to navTarObj's own content when a page has no entry here. How: This is looked up by pagIdeStr inside PagTouCom below.


	explore_data : { // What: Explore Data Entry. Why: This is the intro-modal content descriptor for the Data page's own tour. How: This is looked up by PagTouCom via the real 'explore_data' pagIdeStr.


		bodEle : <>This tutorial will take you on a quick tour of the Data page, in order to <b>highlight important elements and functionality</b>.</>,
		pilArr : [ 'page tour', 'data page', 'edit pickers' ],
		titStr : 'Data Page'


	},

	explore_pickers : { // What: Explore Pickers Entry. Why: This is the intro-modal content descriptor for the Pickers page's own tour. How: This is looked up by PagTouCom via the real 'explore_pickers' pagIdeStr.


		bodEle : <>This tutorial will take you on a quick tour of the Pickers page, in order to <b>highlight important elements and functionality</b>.</>,
		pilArr : [ 'page tour', 'pickers page', 'new pickers' ],
		titStr : 'Pickers Page'


	},

	explore_settings : { // What: Explore Settings Entry. Why: This is the intro-modal content descriptor for the Settings page's own tour. How: This is looked up by PagTouCom via the real 'explore_settings' pagIdeStr.


		bodEle : <>This tutorial will take you on a quick tour of the Settings page, in order to <b>highlight important elements and functionality</b>.</>,
		pilArr : [ 'page tour', 'settings page', 'app customization' ],
		titStr : 'Settings Page'


	},

	explore_stats : { // What: Explore Stats Entry. Why: This is the intro-modal content descriptor for the Stats page's own tour. How: This is looked up by PagTouCom via the real 'explore_stats' pagIdeStr.


		bodEle : <>This tutorial will take you on a quick tour of the Stats page, in order to <b>highlight important elements and functionality</b>.</>,
		pilArr : [ 'page tour', 'stats page', 'picker statistics' ],
		titStr : 'Stats Page'


	},

	explore_today : { // What: Explore Today Entry. Why: This is the intro-modal content descriptor for the Today page's own tour. How: This is looked up by PagTouCom via the real 'explore_today' pagIdeStr.


		bodEle : <>This tutorial will take you on a quick tour of the Today page, in order to <b>highlight important elements and functionality</b>.</>,
		pilArr : [ 'page tour', 'today page', 'todo list' ],
		titStr : 'Today Page'


	}


};

// #endregion PAG_COP_OBJ

// #endregion Constants



// #region Components

// #region PagTouCom

/**
 * PagTouCom = Page Tour Component
 *
 * @summary
 * Renders whichever piece of one page's own mini-tour is currently
 * relevant: the intro modal, or the running GuiTouCom. Mounted at the
 * app level (see app.jsx's own actPagStr), reads real persisted
 * staAppObj and calls real actStoObj.* methods (see store.js), and
 * reads/writes emlTouObj's own bus fields for the Pickers tour's own
 * onBacTouFun handling below.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actIdeStr   - Active Identifier String: The app's own currently
 *                            active tab id.
 * @param props.actStoObj   - Action Store Object: The shared app actions that
 *                            mutate props.staAppObj.
 * @param props.onCloTouFun - On Close Tour Function: Clears app.jsx's own
 *                            actPagStr, ending this mount.
 * @param props.pagIdeStr   - Page Identifier String: This page tour's own
 *                            checklist id (e.g. 'explore_today'), keying
 *                            PAG_COP_OBJ and buiTesFun.
 * @param props.selTabFun   - Select Tab Function: Switches the app's own
 *                            active tab.
 * @param props.staAppObj   - State App Object: The entire app's own
 *                            persisted state.
 *
 * @returns Either the intro modal (touPhaStr 'intro') or the running
 * guided tour (touPhaStr 'tour'), depending on this page's own phase.
 *
 * @example
 * ```tsx
 * PagTouCom({ actIdeStr, actStoObj, onCloTouFun, pagIdeStr, selTabFun, ... })
 * // => <PagTouCom />
 * ```
 *
*/

function PagTouCom ( { actIdeStr, actStoObj, onCloTouFun, pagIdeStr, selTabFun, staAppObj } ) {


	const touRcdObj = ONB_EPT_ARR.find( ( curTouObj ) => curTouObj.ideStr === pagIdeStr ); // What: Tour Record Object. Why: This page's own real page key/label are read off its own ONB_EPT_ARR manifest entry. How: This searches ONB_EPT_ARR for the entry whose own id matches pagIdeStr.
	const navTarObj = NAV_TAR_OBJ[ touRcdObj.pagStr ];                                     // What: Nav Target Object. Why: The intro modal's own fallback titStr/bodEle come from the shared nav-button catalog. How: This looks up NAV_TAR_OBJ by touRcdObj's own page.
	const pagCopObj = PAG_COP_OBJ[ pagIdeStr ];                                            // What: Page Copy Object. Why: The intro modal's own title/body/pills prefer this page's own dedicated copy when it has one. How: This looks up PAG_COP_OBJ by pagIdeStr.



	const onbStaObj = staAppObj.onboarding || {};                                                                              // What: Onboarding State Object. Why: A reload lands here with tab-today.jsx's own activeMiniTour already re-derived from this SAME persisted activeTour, so this just decides whether to skip the intro modal and which (resBoo) step to land on. How: This reads staAppObj.onboarding, falling back to an empty object.
	const resTouObj = onbStaObj.activeTour && onbStaObj.activeTour.id === `page-${ pagIdeStr }` ? onbStaObj.activeTour : null; // What: Resume Tour Object. Why: See onboarding/tour-runner.jsx's own resBoo field doc comment for why this is a checkpoint, not necessarily the exact step the user was last on. How: This reads onbStaObj.activeTour back out only when its own id matches this page's own tourId, otherwise null.

	const [ touPhaStr, setTouPhaStr ] = React.useState( resTouObj ? 'tour' : 'intro' ); // What: Tour Phase String And Setter. Why: This is the mini-tour's own top-level position, 'intro' (the modal showing) or 'tour' (GuiTouCom running). How: This starts on 'tour' whenever resTouObj says a tour was left running, otherwise 'intro'.



	// #region cloTouFun

	/**
	 * cloTouFun = Close Tour Function
	 *
	 * @summary
	 * Ends this page tour however it ends, recording how in the page's own
	 * checklist entry. It first discards whatever sample data this tour set up:
	 * the disposable picker copies for Pickers/Data, the disposable reminder
	 * copies for Data, or the borrowed real sample history for Stats. It then
	 * updates this page's own launcher card status and calls onCloTouFun so
	 * app.jsx unmounts the tour. Each cleanup is a harmless no-op when nothing
	 * was seeded, e.g. a Skip from the intro modal.
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

	const cloTouFun = ( staValStr ) => { // What: Close Tour Function. Why: Discards this tour's own disposable sample copies/borrowed history the moment it ends, however it ends, harmless no-op paths included. How: This branches on pagIdeStr to run whichever cleanup that page's own tour needs, then updates the checklist and calls onCloTouFun.


		if ( neeCopFun( pagIdeStr ) ) clePicFun( actStoObj ); // What: Picker Copy Cleanup Call. Why: The Pickers/Data tours must never leave a disposable picker copy behind. How: This calls clePicFun whenever neeCopFun says this page needed copies.

		else if ( pagIdeStr === 'explore_stats' ) hidHisFun( actStoObj ); // What: Sample History Hide Call. Why: The Stats tour must re-hide the real samples it borrowed. How: This calls hidHisFun only for the Stats page.



		if ( pagIdeStr === 'explore_data' ) cleTasFun( actStoObj ); // What: Task Copy Cleanup Call. Why: The Data tour must never leave a disposable reminder copy behind. How: This calls cleTasFun only for the Data page.



		actStoObj.setCarFun( pagIdeStr, { status : staValStr } ); // What: Checklist Status Update Call. Why: This page's own Today launcher card reads this to know whether to keep showing itself. How: This updates this page's own checklist entry to staValStr.


		onCloTouFun(); // What: On Close Call. Why: app.jsx's own actPagStr must be cleared however this tour ends. How: This calls the onCloTouFun prop passed down from app.jsx.


	};

	// #endregion cloTouFun



	if ( touPhaStr === 'intro' ) { // What: Intro Phase Check. Why: The intro modal must show before any spotlight step ever does. How: This returns IntModCom below whenever touPhaStr is 'intro'.


		const intIcoEle = ( // What: Intro Icon Element. Why: The intro modal's own icon matches this page's own nav icon. How: This renders touRcdObj.pagStr's own icon at 54px, passed as IntModCom's own icoTopEle prop below.


			<IcoSvgCom
				icoNamStr={ touRcdObj.pagStr }
				sizValNum={ 54 }
			/> // What: Icon Svg Component. Why: This is the glyph identifying which page this tour explores. How: This renders the page's own nav icon.


		);



		return (


			<IntModCom
				icoTopEle={ intIcoEle }
				parEleArr={ [ ( pagCopObj && pagCopObj.bodEle ) || navTarObj.bodEle ] } // What: Paragraph Element Array Attribute. Why: A page without its own dedicated copy still needs a body. How: This prefers pagCopObj's own bodEle, falling back to navTarObj's.
				pilLabArr={ ( pagCopObj && pagCopObj.pilArr ) || [ 'page tour', touRcdObj.labStr.toLowerCase() ] } // What: Pill Label Array Attribute. Why: A page without its own dedicated copy still needs pills. How: This prefers pagCopObj's own pilArr, falling back to a generic page tour pill plus the page's own label.
				titHeaStr={ ( pagCopObj && pagCopObj.titStr ) || navTarObj.titStr } // What: Title Heading Attribute. Why: A page without its own dedicated copy still needs a heading. How: This prefers pagCopObj's own titStr, falling back to navTarObj's.

				onBegTouFun={ () => setTouPhaStr( 'tour' ) }
				onSkiTouFun={ () => cloTouFun( 'cancelled' ) } // What: On Skip Handler. Why: This mirrors the launcher card's own X button exactly, marking the card cancelled without touching the underlying page. How: This calls cloTouFun with 'cancelled'.
			/> // What: Tutorial Intro Modal Element. Why: This is this page's own opening screen, shown before any spotlight step ever does. How: This is passed this page's own icon/title/paragraphs/pills and the onBegTouFun/onSkiTouFun handlers above.


		);


	}



	// #region oneRunFun

	/**
	 * oneRunFun = One Run Function
	 *
	 * @summary
	 * Step 1's own side effect, fired with the real nav click, which prepares
	 * what this page tour's later steps point at. The Pickers and Data tours seed
	 * disposable picker copies, the Stats tour unhides the real samples and their
	 * history, and the Data tour also seeds disposable reminder copies. Only
	 * passed to buiTs1Fun for a page tour that needs one of these (see
	 * seeNeeBoo), so Today and Settings get no Step 1 side effect at all.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * oneRunFun() // => void
	 * ```
	 *
	*/

	const oneRunFun = () => { // What: One Run Function. Why: Step 1's own click must set up the sample data this page tour's later steps point at. How: This seeds picker copies or unhides the real samples, then also seeds reminder copies for the Data tour.


		if ( neeCopFun( pagIdeStr ) ) seePicFun( staAppObj, actStoObj ); // What: Picker Copy Seed Call. Why: The Pickers/Data tours need disposable picker copies to point at. How: This calls seePicFun.

		else if ( pagIdeStr === 'explore_stats' ) unhHisFun( staAppObj, actStoObj ); // What: Sample History Unhide Call. Why: The Stats tour borrows the real samples and their history instead. How: This calls unhHisFun.



		if ( pagIdeStr === 'explore_data' ) seeTasFun( staAppObj, actStoObj ); // What: Task Copy Seed Call. Why: The Data tour's own Reminders step also needs disposable reminder copies. How: This calls seeTasFun.


	};

	// #endregion oneRunFun



	const seeNeeBoo = neeCopFun( pagIdeStr ) || pagIdeStr === 'explore_stats'; // What: Seed Needed Boolean. Why: Only the Pickers, Data, and Stats tours need a Step 1 side effect. How: This is true for a page that needs copies seeded or the real samples unhidden.

	const steObjArr = [ // What: Step Object Array. Why: GuiTouCom needs this page's own full ordered step list, Step 1 plus every step buiTesFun returns beyond it. How: This combines buiTs1Fun's own Step 1 with buiTesFun's own spread result.


		buiTs1Fun( touRcdObj.pagStr, seeNeeBoo ? oneRunFun : undefined, 'Next', touRcdObj.labStr ), // What: Step One Call. Why: Every page tour opens on its own nav-button highlight. How: This builds Step 1 with oneRunFun only when seeNeeBoo says it is needed, naming the button by touRcdObj.labStr.

		...buiTesFun( pagIdeStr, actStoObj ) // What: Extra Steps Spread. Why: Every step after Step 1 is page-specific. How: This spreads buiTesFun's own step array for pagIdeStr.


	];



	return (


		<GuiTouCom
			actIdeStr={ actIdeStr }
			actStoObj={ actStoObj }
			resSteNum={ resTouObj ? resTouObj.step : 0 } // What: Resume Step Attribute. Why: A tour a reload interrupted should reopen on its own checkpoint step. How: This passes resTouObj's own step when there is one, otherwise 0.
			selTabFun={ selTabFun }
			steObjArr={ steObjArr }
			touIdeStr={ `page-${ pagIdeStr }` }

			onBacTouFun={ ( tarSteNum ) => { // What: On Go Back Handler. Why: A real, one-way UI transition (the Pickers tour's own pick animation, or Today's own Edit Mode) must be reversed by a real control so a Back finds its target step's own selector again. How: This branches on pagIdeStr first, then on tarSteNum, driving whichever real DOM control or bus nonce reverses that specific transition.


				if ( pagIdeStr === 'explore_pickers' ) { // What: Pickers Back Branch Check. Why: Only the Pickers tour's own steps have this one-way pick-animation state to reverse. How: This branches on pagIdeStr matching 'explore_pickers'.


					if ( tarSteNum === 3 ) { // What: Add Tab Scroll Check. Why: Back from Picker Selection to Create New Pickers must undo Picker Selection's own scroll-into-view, which can scroll .picker-tabs rightward past the Add tab (the first tab in the row) if there are enough pickers to overflow it. How: This scrolls .picker-tabs back to its own left edge.


						const tabRowEle = document.querySelector( '[data-element-name-hook="picTabDiv"]' ); // What: Tab Row Element. Why: This is the real, horizontally-scrollable strip that needs resetting. How: This looks it up fresh, since it only exists on the Pickers tab.


						if ( tabRowEle ) tabRowEle.scrollTo( { left : 0 } ); // What: Tab Row Scroll Reset. Why: This must only fire when the row actually exists. How: This scrolls tabRowEle back to its own left edge.


					}

					else if ( tarSteNum === 5 ) { // What: Manual Generation Reset Check. Why: Back from Manual Generation to Edit Picker (tarSteNum 5 is reached only by backing out of the step whose own target is mpgObj) needs any still-spinning pick animation cancelled, so it doesn't settle into a 'done' result behind the tour's back. How: This bumps the Pickers tour's own reset nonce on the shared bus.


						emlTouObj.set( { resNonNum : ( emlTouObj.get().resNonNum || 0 ) + 1 } ); // What: Reset Nonce Publish. Why: tab-picker.jsx's own PicStrCom only renders while phase is 'running'/'done', so bumping this unmounts it immediately, actually cancelling the in-flight animation instead of leaving it to finish on its own. How: This increments the bus's own current resNonNum by 1.


					}

					else if ( tarSteNum === 6 ) { // What: Add To Todo List Reset Check. Why: Back from Add To Todo List to Manual Generation needs PicVieCom's own local phase reset back to idle, otherwise a leftover 'done'/'sent' phase would let Re-roll/Done show on a step that was never written to expect them. How: This bumps the same reset nonce as the tarSteNum === 5 branch above.


						emlTouObj.set( { resNonNum : ( emlTouObj.get().resNonNum || 0 ) + 1 } ); // What: Reset Nonce Publish. Why: Same reasoning as the tarSteNum === 5 branch above, PicStrCom must unmount so only Pick One shows again. How: This increments the bus's own current resNonNum by 1.


					}

					else if ( tarSteNum === 7 ) { // What: Picker Items Redo Check. Why: Back from Picker Items to Add To Todo List needs a real 'done' result synthesized, that step's own target (.pv-act--send) only exists while phase is 'done'/'sent', and by the time this fires the advDelNum wait has already let it revert to idle. How: This bumps a SEPARATE bus nonce telling PickerView to synthesize a result directly, skipping the spin animation since this is a revisit.


						emlTouObj.set( { redNonNum : ( emlTouObj.get().redNonNum || 0 ) + 1 } ); // What: Redo Nonce Publish. Why: Unlike a plain reset, this step NEEDS a real 'done' result to show Send to Today at all. How: This increments the bus's own current redNonNum by 1.


					}



					return; // What: Pickers Branch Return. Why: Nothing below this point applies to the Pickers tour. How: This exits onBacTouFun once the branch above has run.


				}



				if ( pagIdeStr !== 'explore_today' ) return; // What: Today Branch Guard. Why: Only the Today tour's own steps have Edit Mode/rename state to reverse. How: This returns early whenever pagIdeStr isn't 'explore_today'.



				if ( tarSteNum === 3 ) { // What: Edit Mode Toggle Check. Why: Back from Group Grip to Edit Mode must toggle Edit Mode back off via its own real control, since the .foot-editmode target only exists while it's off. How: This clicks whichever real Edit Mode toggle/Cancel control is currently visible.


					const butEdmEle = document.querySelector( '[data-element-name-hook="ediRaiBut"][data-edit-mode-active]' ) || document.querySelector( '[data-element-name-hook~="fooActDiv"] [data-element-name-hook="ediCanBut"]' ); // What: Edit Mode Button Element. Why: Desktop's own toggle always exists and flips itself regardless of state, mobile's own footer swaps to Cancel/Done buttons instead of keeping .foot-editmode. How: This looks up whichever control is currently present.


					if ( butEdmEle ) butEdmEle.click(); // What: Edit Mode Button Click. Why: This must only fire when a control actually exists. How: This clicks butEdmEle.


				}

				else if ( tarSteNum === 4 ) { // What: Rename Cancel Check. Why: Back from Rename Group to Group Grip must discard the in-progress rename WITHOUT exiting Edit Mode. How: This calls canRenFun, then forces the real name back afterward regardless of what the DOM did.


					canRenFun(); // What: Cancel Rename Call. Why: See canRenFun's own doc comment for why this can't just be an Escape keydown. How: This resets the real rename input's value and defers its own blur a frame.

					forNamFun( actStoObj ); // What: Force Name Call. Why: Clicking Back is ALSO a click on a different element than the input, which can blur-and-commit a real rename before this handler even runs. How: This forces the real pgtNamStr back, 200ms after this fires.


				}


			} }
			onFinTouFun={ () => cloTouFun( 'finished' ) } // What: On Finish Handler. Why: This only fires from a step's own cirBoo priStr 'Done'. How: This calls cloTouFun with 'finished'.
			onSkiTouFun={ () => { // What: On Skip Handler. Why: Skip can fire mid-Edit-Mode too, so any open rename input and any active Edit Mode session both need reverting before this tour actually closes. How: This forces the real name back if a rename input is open, clicks the real Cancel control if Edit Mode is on, then calls cloTouFun.


				if ( document.querySelector( '[data-element-name-hook~="pagTouSec"] [data-element-name-hook="groNamInp"]' ) ) forNamFun( actStoObj ); // What: Open Rename Guard. Why: The same blur-races-the-click risk as a real Done click applies here too, clicking Skip is ALSO a click on a different element than the input. How: This forces the real name back only when the rename input is actually still open.


				const canButEle = document.querySelector( '[data-element-name-hook="ediBanSpa"] [data-element-name-hook="ediCanBut"]' ); // What: Cancel Button Element. Why: This reverts any group reordering, a harmless no-op if Edit Mode was never entered, since the banner/button won't exist. How: This looks it up fresh, since it only exists while Edit Mode is on.


				if ( canButEle ) canButEle.click(); // What: Cancel Button Click. Why: This must only fire when the control actually exists. How: This clicks canButEle.



				cloTouFun( 'skipped' ); // What: Close Tour Call. Why: This funnels Skip through the same cleanup any other exit path off this tour uses. How: This clears the disposable copies/borrowed history, updates the checklist to 'skipped', and calls onCloTouFun.


			} }
		/> // What: Guided Tour Element. Why: This is the actual running spotlight walkthrough for this page, mounted once its own intro modal has been accepted or resumed into. How: This is passed this page's own touIdeStr, step array, and the resume/lifecycle plumbing above.


	);


}

// #endregion PagTouCom

// #endregion Components



// #region Exports

export { PagTouCom }; // What: Named Exports. Why: app.jsx renders PagTouCom directly, and onboarding/app-features.jsx reuses buiTs1Fun verbatim for its own App Features tours. How: This re-exports both bindings unchanged from their own module.

// #endregion Exports


