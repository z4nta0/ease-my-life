


// #region Imports

import { expect    } from '@playwright/test';      // What: Expect. Why: Every tour asserts how it ended. How: This makes the assertions.
import { insClcFun } from '../support/clock.ts';   // What: Install Clock Function. Why: Tours run on a fixed day. How: This installs the fake clock.
import { selTabFun } from '../support/app.ts';     // What: Select Tab Function. Why: Replay starts from Settings. How: This switches tabs.
import { test      } from '@playwright/test';      // What: Test. Why: Each width runs the whole onboarding as one test. How: This declares them.
import { waiStaFun } from '../support/storage.ts'; // What: Wait State Function. Why: Tour outcomes land a moment after each tour. How: This waits for them.
import { watErrFun } from '../support/watch.ts';   // What: Watch Errors Function. Why: A tour fails on any page error. How: This collects them.


import type { Page } from '@playwright/test'; // What: Page. Why: The driver steers the page. How: This types the page parameters.

// #endregion Imports



/**
 * tours.spec.ts = Tours Spec
 *
 * @summary
 * Runs the whole new-user onboarding from an empty install, at a phone and a
 * desktop width: the Welcome tour from its intro modal, then every launcher
 * on Today's checklist (the reminder, page, and picker tours), the Generate
 * card that closes the checklist, the one-time App Features tip, every App
 * Features tour, and finally Replay from Settings, which brings the Welcome
 * tour back. Each tour must finish rather than skip itself, which the saved
 * checklist and App Features records confirm, and the whole run must log no
 * page or console errors.
 *
 * One driver walks every tour. A tour is running while the body carries
 * data-tour-active or an intro modal is open, and its coach card hides for a
 * moment between steps (while the tour switches tabs or finds the next
 * target), so a missing card only means the tour ended once neither is left.
 * Each step's card either has an enabled Next, Done, or Dismiss button,
 * which the driver clicks, or wants the highlighted element itself clicked.
 * The tour's dim ignores the pointer and its click guard blocks clicks off
 * the target, so the driver clicks the spotlight's center, then each
 * clickable element showing inside it, until the step advances. A step that
 * never advances fails the test with its text.
 *
 * Sections:
 *  - Types
 *  - Constants
 *  - Helpers
 *  - Module Init
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Types

type RecBoxTyp = { height : number, width : number, x : number, y : number }; // What: Rect Box Type. Why: The driver clicks the middle of rects measured in the page. How: This describes a measured rect's position and size.

// #endregion Types



// #region Constants

const CLI_SEL_STR = 'button, [role="button"], a[href], summary';                                                             // What: Clickable Selector String. Why: A click step's target is one of the page's clickable elements. How: This matches each kind.
const COA_CAR_STR = '[data-element-name-hook~="coaCarDiv"]:not([aria-hidden="true"])';                                       // What: Coach Card String. Why: A hidden measuring copy shares the hook. How: This selects the visible card.
const FEA_BUT_STR = '[data-element-name-hook~="appFeaSec"] [data-element-name-hook~="carCheBut"][aria-label^="Start the "]'; // What: Feature Button String. Why: Each unplayed App Features card offers Start. How: This selects those buttons.
const INT_MOD_STR = '[data-element-name-hook~="intScrDiv"][role="dialog"]';                                                  // What: Intro Modal String. Why: Every tour opens from an intro modal. How: This selects it.
const LAU_BUT_STR = '[data-element-name-hook~="tutCarArt"] [data-element-name-hook~="carCheBut"][aria-label^="Start the "]'; // What: Launcher Button String. Why: Each unplayed checklist launcher offers Start. How: This selects those buttons.
const TOD_TAB_STR = '[data-element-name-hook~="todTabDiv"]';                                                                 // What: Today Tab String. Why: Every launcher's tour returns to Today when it ends. How: This selects the Today tab's root.

// #endregion Constants



// #region Helpers

const coaKeyFun = async ( curPagObj : Page ) : Promise< string > => curPagObj.evaluate( ( coaSelStr ) => document.querySelector< HTMLElement >( coaSelStr )?.innerText.slice( 0, 200 ) || '', COA_CAR_STR ); // What: Coach Key Function. Why: A step has advanced once its card's text changes. How: This reads the visible card's text, or empty when there's none.



// #region chaWaiFun

/**
 * chaWaiFun = Change Wait Function
 *
 * @summary
 * Waits for the coach card's text to differ from an earlier reading,
 * including the card hiding or the tour ending, which both read as empty.
 * The tour moves on asynchronously after a click, sometimes after an
 * animation or a target appearing, so each try waits a given time before
 * giving up. Returns whether the text changed in time.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page running the tour.
 * @param preKeyStr - Previous Key String: The card's text before the try.
 * @param waiMilNum - Wait Milliseconds Number: How long to wait for a
 *                    change.
 *
 * @returns Whether the card's text changed in time.
 *
 * @example
 * ```ts
 * await chaWaiFun(curPagObj, preKeyStr, 1500) // => true
 * ```
 *
*/

const chaWaiFun = async ( curPagObj : Page, preKeyStr : string, waiMilNum : number ) : Promise< boolean > => curPagObj.waitForFunction( ( [ coaSelStr, oldKeyStr ] ) => ( document.querySelector< HTMLElement >( coaSelStr )?.innerText.slice( 0, 200 ) || '' ) !== oldKeyStr, [ COA_CAR_STR, preKeyStr ], { timeout : waiMilNum } ).then( () => true, () => false ); // What: Change Wait Function. Why: Each try waits for the card to change. How: This polls the card's text in the page and turns a timeout into false.

// #endregion chaWaiFun



// #region advSteFun

/**
 * advSteFun = Advance Step Function
 *
 * @summary
 * Tries to move the current step on: an enabled Next, Done, or Dismiss
 * button first, then the spotlight's center, then the center of each
 * clickable element showing inside the spotlight, skipping any covered by
 * the coach card. The button and the center get five seconds each, since a
 * click step can wait on an animation or a new target before advancing, and
 * each further element gets a second and a half. Off-target clicks are
 * blocked by the tour's own click guard, so a wrong guess does nothing.
 * Returns whether the step advanced.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page running the tour.
 *
 * @returns Whether the step advanced.
 *
 * @example
 * ```ts
 * await advSteFun(curPagObj) // => true
 * ```
 *
*/

const advSteFun = async ( curPagObj : Page ) : Promise< boolean > => { // What: Advance Step Function. Why: Every step advances by its button or by clicking its target. How: This tries each way until the card changes.


	const preKeyStr = await coaKeyFun( curPagObj ); // What: Previous Key String. Why: An advance changes the card. How: This reads the card first.



	const nexButLoc = curPagObj.locator( COA_CAR_STR ).getByRole( 'button', { name : /^(Next ›|Done|Dismiss)$/ } ); // What: Next Button Locator. Why: Most steps advance by their primary button. How: This finds it by label.



	if ( await nexButLoc.count() && await nexButLoc.first().isEnabled() ) { // What: Next Try Check. Why: An enabled primary button advances the step, while a click step disables it. How: This clicks it when it's enabled.


		await nexButLoc.first().click(); // What: Next Click Call. Why: The primary button moves the tour on. How: This clicks it.



		if ( await chaWaiFun( curPagObj, preKeyStr, 5000 ) ) return true; // What: Next Advance Return. Why: The click usually advances the step. How: This returns once the card changes.


	}



	const tarRecArr = await curPagObj.evaluate( ( cliSelStr ) => { // What: Target Rect Array. Why: A click step advances on a click on its target, which lies under the spotlight. How: This measures the spotlight, then every clickable element showing inside it.


		const spoDomEle = Array.from( document.querySelectorAll( '[data-element-name-hook~="touOveDiv"] div' ) ).find( ( curDomEle ) => /touSpoDiv/.test( curDomEle.className ) ); // What: Spotlight DOM Element. Why: The spotlight sits over the target and carries no hook of its own. How: This finds it by its module class inside the tour overlay.


		if ( !spoDomEle ) return []; // What: No Spotlight Return. Why: Some steps highlight nothing. How: This returns no targets.



		const spoRecObj = spoDomEle.getBoundingClientRect(); // What: Spotlight Rect Object. Why: The target lies under it. How: This measures it.


		const insEleArr = Array.from( document.querySelectorAll( cliSelStr ) ).filter( ( curDomEle ) => { // What: Inside Element Array. Why: Only elements showing inside the spotlight can be the target. How: This keeps those whose center sits inside it and isn't covered.


			const curRecObj = curDomEle.getBoundingClientRect();                         // What: Current Rect Object. Why: An element counts as inside by its center. How: This measures it.
			const cenXcoNum = curRecObj.left + curRecObj.width / 2;                      // What: Center X-Coordinate Number. Why: The click lands on the center. How: This finds its horizontal center.
			const cenYcoNum = curRecObj.top + curRecObj.height / 2;                      // What: Center Y-Coordinate Number. Why: The click lands on the center. How: This finds its vertical center.
			const hitDomEle = document.elementFromPoint( cenXcoNum, cenYcoNum );         // What: Hit DOM Element. Why: A covered element, such as one under the coach card, can't be clicked. How: This finds what a click there would hit.
			const insXcoBoo = cenXcoNum > spoRecObj.left && cenXcoNum < spoRecObj.right; // What: Inside X-Coordinate Boolean. Why: The center must sit between the spotlight's sides. How: This compares it with both.
			const insYcoBoo = cenYcoNum > spoRecObj.top && cenYcoNum < spoRecObj.bottom; // What: Inside Y-Coordinate Boolean. Why: The center must sit between the spotlight's top and bottom. How: This compares it with both.
			const visHitBoo = !!hitDomEle && curDomEle.contains( hitDomEle );            // What: Visible Hit Boolean. Why: A click must reach the element itself. How: This checks the hit lands on it or inside it.



			return insXcoBoo && insYcoBoo && visHitBoo; // What: Inside Return. Why: The element is a candidate only when all three hold. How: This combines them.


		} );



		return [ spoRecObj, ...insEleArr.map( ( curDomEle ) => curDomEle.getBoundingClientRect() ) ].map( ( curRecObj ) => curRecObj.toJSON() as RecBoxTyp ); // What: Target Rects Return. Why: The caller clicks the spotlight's center first, then each candidate. How: This returns their plain rects in that order. // What: Type Assertion Note. Why: A DOMRect's toJSON is typed as any, but it always holds a plain copy of the rect. How: The as tells TypeScript it's a RecBoxTyp.


	}, CLI_SEL_STR ); // What: Clickable Selector Argument. Why: The page function needs the clickable selector, which lives in Node. How: This passes CLI_SEL_STR in.


	for ( const [ recIndNum, curRecObj ] of tarRecArr.entries() ) { // What: Target Loop. Why: The spotlight's center often lands on the target, and otherwise one of the elements inside it is the target. How: This clicks each in turn.


		await curPagObj.mouse.click( curRecObj.x + curRecObj.width / 2, curRecObj.y + curRecObj.height / 2 ); // What: Target Click Call. Why: A real click passes through the dim to what's under it. How: This clicks the rect's center.



		if ( await chaWaiFun( curPagObj, preKeyStr, recIndNum ? 1500 : 5000 ) ) return true; // What: Target Advance Return. Why: The right click advances the step, and the spotlight's center gets longer since it usually is the target. How: This returns once the card changes.


	}



	return false; // What: Stuck Return. Why: Nothing advanced the step. How: This reports it.


};

// #endregion advSteFun



// #region runTouFun

/**
 * runTouFun = Run Tour Function
 *
 * @summary
 * Walks the running tour to its end. Before each step it waits for the
 * coach card to show, or for the tour to stop running, since the card hides
 * for a moment between steps. The tour has ended once the body has lost
 * data-tour-active, no intro modal is open, and no card returns within two
 * seconds, since the tour can drop the attribute for a moment as it
 * remounts. Throws with the stuck step's text when a step won't advance,
 * when the card never comes back while the tour is still running, or after
 * 40 steps, more than any tour has.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page running the tour.
 * @param touNamStr - Tour Name String: Names the tour in a failure.
 *
 * @returns A promise that settles once the tour has ended.
 *
 * @example
 * ```ts
 * await runTouFun(curPagObj, 'welcome') // => void
 * ```
 *
*/

const runTouFun = async ( curPagObj : Page, touNamStr : string ) : Promise< void > => { // What: Run Tour Function. Why: Every tour is walked the same way. How: This advances steps until the tour stops running.


	await curPagObj.locator( COA_CAR_STR ).first().waitFor( { timeout : 15000 } ); // What: Coach Wait. Why: The tour starts once its card shows. How: This waits for it.



	for ( let steIndNum = 0; steIndNum < 40; steIndNum++ ) { // What: Step Loop. Why: Each step is advanced in turn. How: This runs until the tour ends.


		await curPagObj.waitForFunction( ( [ coaSelStr, intSelStr ] ) => !!document.querySelector( coaSelStr ) || ( !document.body.hasAttribute( 'data-tour-active' ) && !document.querySelector( intSelStr ) ), [ COA_CAR_STR, INT_MOD_STR ], { timeout : 15000 } ).catch( () => { throw new Error( `${ touNamStr } tour is running with no coach card` ); } ); // What: Settle Wait. Why: The card hides for a moment between steps. How: This waits until a card shows or the tour has stopped running, and fails when neither happens.



		if ( !await curPagObj.locator( COA_CAR_STR ).count() && !await chaWaiFun( curPagObj, '', 2000 ) ) return; // What: Ended Return. Why: The tour can drop data-tour-active for a moment as it remounts, so it has ended only once no card comes back. How: This gives a missing card two seconds to return and stops when none does.



		const steKeyStr = await coaKeyFun( curPagObj ); // What: Step Key String. Why: A stuck step is reported by its text. How: This reads it.



		if ( !await advSteFun( curPagObj ) ) throw new Error( `${ touNamStr } tour stuck on: ${ steKeyStr }` ); // What: Stuck Guard. Why: A step that won't advance is a failure. How: This throws with the step's text.


	}



	throw new Error( `${ touNamStr } tour never ended` ); // What: Endless Error. Why: No tour runs past 40 steps. How: This throws.


};

// #endregion runTouFun



// #region begModFun

/**
 * begModFun = Begin Modal Function
 *
 * @summary
 * Starts the tour behind an intro modal by clicking its primary button, the
 * first in the dialog. Every tour opens on one, so the modal not opening
 * within fifteen seconds fails the test.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page showing the modal.
 *
 * @returns A promise that settles once the button is clicked.
 *
 * @example
 * ```ts
 * await begModFun(curPagObj) // => void
 * ```
 *
*/

const begModFun = async ( curPagObj : Page ) : Promise< void > => { // What: Begin Modal Function. Why: Every tour starts from its intro modal. How: This waits for the modal and clicks its primary button.


	await curPagObj.locator( INT_MOD_STR ).waitFor( { timeout : 15000 } ); // What: Modal Wait. Why: The modal opens a moment after the launcher. How: This waits for it.



	await curPagObj.locator( INT_MOD_STR ).getByRole( 'button' ).first().click(); // What: Begin Click Call. Why: The primary button starts the tour. How: This clicks the dialog's first button.


};

// #endregion begModFun



// #region lauRunFun

/**
 * lauRunFun = Launcher Run Function
 *
 * @summary
 * Plays the first unplayed launcher card matching a selector: clicks its
 * Start button, begins the tour from its intro modal, walks the tour to its
 * end, and waits for Today, where every launcher's tour returns. Checklist
 * launchers and App Features cards both work this way.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page showing the launchers.
 * @param butSelStr - Button Selector String: Matches the unplayed
 *                    launchers' Start buttons.
 *
 * @returns A promise that settles once the tour has ended back on Today.
 *
 * @example
 * ```ts
 * await lauRunFun(curPagObj, LAU_BUT_STR) // => void
 * ```
 *
*/

const lauRunFun = async ( curPagObj : Page, butSelStr : string ) : Promise< void > => { // What: Launcher Run Function. Why: Every launcher card plays its tour the same way. How: This starts the first unplayed one and walks its tour.


	const lauButLoc = curPagObj.locator( butSelStr ).first();                 // What: Launcher Button Locator. Why: The cards are played in order. How: This finds the first unplayed one.
	const lauLabStr = ( await lauButLoc.getAttribute( 'aria-label' ) ) || ''; // What: Launcher Label String. Why: A failure names the tour. How: This reads the launcher's label.



	await lauButLoc.click(); // What: Launcher Click Call. Why: The launcher opens its tour's modal. How: This clicks it.



	await begModFun( curPagObj ); // What: Tour Begin Call. Why: Each tour starts from its modal. How: This clicks its primary button.



	await runTouFun( curPagObj, lauLabStr ); // What: Tour Run Call. Why: The tour must finish. How: This walks it.



	await curPagObj.locator( TOD_TAB_STR ).waitFor( { timeout : 15000 } ); // What: Today Return Wait. Why: The next launcher lives on Today, where every tour ends. How: This waits for the Today tab.


};

// #endregion lauRunFun

// #endregion Helpers



// #region Module Init

test.use( { contextOptions : { reducedMotion : 'reduce' } } ); // What: Page Options Call. Why: Tours wait on animations, which reduced motion shortens. How: This turns on reduced motion.



for ( const vieWidNum of [ 375, 1280 ] ) test( `the whole onboarding at ${ vieWidNum }px`, async ( { page : curPagObj } ) => { // What: Onboarding Test Loop. Why: Tours lay out differently on phones and desktops. How: This runs the whole onboarding at each width.


	const errMesArr = watErrFun( curPagObj ); // What: Error Message Array. Why: Any page error fails the run. How: This collects them.



	await curPagObj.setViewportSize({ // What: Viewport Size Call. Why: Each test runs at one width. How: This sizes the page.


		height : vieWidNum < 768 ? 812 : 900, // What: Height. Why: Phones are tall and narrow, tablets and desktops less so. How: This picks a phone height below tablet width.
		width  : vieWidNum                    // What: Width. Why: Each test runs at one width. How: This is that width.


	});



	await insClcFun( curPagObj, '2026-10-05', 10 ); // What: Clock Install Call. Why: Tours run on a fixed day. How: This installs the fake clock.



	await curPagObj.goto( '/' ); // What: App Load Call. Why: An empty install shows the Welcome modal. How: This opens the app.



	await begModFun( curPagObj ); // What: Welcome Begin Call. Why: The Welcome tour starts from its modal. How: This clicks Take the quick tour.



	await runTouFun( curPagObj, 'welcome' ); // What: Welcome Run Call. Why: The Welcome tour must finish. How: This walks it.



	await curPagObj.locator( LAU_BUT_STR ).first().waitFor( { state : 'attached', timeout : 15000 } ); // What: Launchers Wait. Why: The Welcome tour's end puts the checklist's launchers on Today. How: This waits for the first to be rendered, since a card can still be collapsed or entering while it lands.



	let lauCouNum = 0; // What: Launcher Count Number. Why: Every launcher must leave a finished checklist entry. How: This counts the launchers played.


	while ( await curPagObj.locator( LAU_BUT_STR ).count() ) { // What: Launcher Loop. Why: Every checklist launcher runs its tour. How: This plays the next unplayed launcher until none remain.


		if ( ++lauCouNum > 20 ) throw new Error( 'the checklist launchers never ran out' ); // What: Endless Guard. Why: A launcher that stays unplayed after its tour would loop forever. How: This throws past 20, more than the checklist has.



		await lauRunFun( curPagObj, LAU_BUT_STR ); // What: Launcher Run Call. Why: Each launcher's tour must finish. How: This plays it.


	}



	await curPagObj.getByRole( 'button', { exact : true, name : 'Generate your list' } ).click(); // What: Generate Click Call. Why: The Generate card closes the checklist once every launcher has run. How: This clicks it.



	await waiStaFun( curPagObj, ( staAppObj ) => !!staAppObj.onboarding.checklistDone, 'checklist done' ); // What: Checklist Wait. Why: The checklist closes once generated. How: This waits for checklistDone.



	await runTouFun( curPagObj, 'app features intro' ); // What: Features Intro Run Call. Why: A one-time tip introduces App Features after the checklist closes. How: This waits for it and dismisses it.



	await curPagObj.locator( FEA_BUT_STR ).first().waitFor( { state : 'attached', timeout : 15000 } ); // What: Features Wait. Why: The App Features cards follow the tip. How: This waits for the first to be rendered, since a card can still be collapsed or entering while it lands.



	let feaCouNum = 0; // What: Feature Count Number. Why: Every App Features card must leave a finished record. How: This counts the cards played.


	while ( await curPagObj.locator( FEA_BUT_STR ).count() ) { // What: Feature Loop. Why: Every App Features card runs its tour. How: This plays the next unplayed card until none remain.


		if ( ++feaCouNum > 12 ) throw new Error( 'the App Features cards never ran out' ); // What: Endless Guard. Why: A card that stays unplayed after its tour would loop forever. How: This throws past 12, more than the section has.



		await lauRunFun( curPagObj, FEA_BUT_STR ); // What: Feature Run Call. Why: Each feature's tour must finish. How: This plays it.


	}



	const onbStaObj = ( await waiStaFun( curPagObj, ( staAppObj ) => Object.keys( staAppObj.onboarding.appFeatures ).length === feaCouNum && !staAppObj.onboarding.activeTour, 'every App Features tour saved' ) ).onboarding; // What: Onboarding State Object. Why: Each tour's outcome is saved a moment after it ends. How: This waits until every feature has a record and no tour is active.


	expect( Object.entries( onbStaObj.checklist ).filter( ( [ , cheEntObj ] ) => cheEntObj.status !== 'finished' ), 'every launcher finished' ).toEqual( [] ); // What: Launcher Outcome Assertion. Why: Every tour must finish rather than skip. How: This lists any entry that didn't.



	expect( Object.keys( onbStaObj.checklist ).length, 'every launcher and Generate recorded' ).toBe( lauCouNum + 1 ); // What: Checklist Size Assertion. Why: Each launcher and the Generate card leave one entry. How: This compares the entry count with the launchers played plus Generate.



	expect( Object.entries( onbStaObj.appFeatures ).filter( ( [ , feaEntObj ] ) => feaEntObj.status !== 'finished' ), 'every App Features tour finished' ).toEqual( [] ); // What: Feature Outcome Assertion. Why: Every feature tour must finish rather than skip. How: This lists any record that didn't.



	expect( onbStaObj.appFeaturesIntroSeen, 'App Features tip seen' ).toBe( true ); // What: Intro Seen Assertion. Why: Dismissing the tip records it as seen. How: This expects the flag.



	await selTabFun( curPagObj, 'settings' ); // What: Settings Switch Call. Why: Replay lives in Settings. How: This switches tabs.



	await curPagObj.locator( '[data-element-name-hook~="repTouDiv"]' ).getByRole( 'button', { name : 'Replay Tour' } ).click(); // What: Replay Click Call. Why: Replay restarts the Welcome tour. How: This clicks it.



	await begModFun( curPagObj ); // What: Replay Begin Call. Why: Replay reopens the Welcome modal. How: This begins the tour.



	await runTouFun( curPagObj, 'replayed welcome' ); // What: Replay Run Call. Why: The replayed tour must finish too. How: This walks it.



	await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.onboarding.welcomed && !staAppObj.onboarding.activeTour, 'replayed welcome saved' ); // What: Replay Saved Wait. Why: The replayed tour must leave onboarding welcomed with no tour active. How: This waits for both.



	expect( errMesArr, errMesArr.join( '\n' ) ).toEqual( [] ); // What: No Errors Assertion. Why: The whole onboarding must run cleanly. How: This expects no errors.


} );

// #endregion Module Init


