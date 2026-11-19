


// #region Imports

import { expect      } from '@playwright/test';       // What: Expect. Why: Each check passes only with no problems found. How: This asserts each problem list is empty and the page reaches no wider than the viewport.
import { EXT_STA_ARR } from '../support/states.ts';   // What: Extra State Array. Why: An opened editor or form holds controls the plain tabs don't. How: This lists those states, such as an item editor.
import { keyProFun   } from '../support/scripted.ts'; // What: Keyboard Problems Function. Why: Everything has to be usable without a mouse. How: This walks the page with Tab and returns every problem it meets.
import { namProFun   } from '../support/scripted.ts'; // What: Name Problems Function. Why: Every control must be announced by a clean name. How: This reads the accessibility tree and returns every badly named link or button.
import { opeStaFun   } from '../support/states.ts';   // What: Open State Function. Why: Each check opens and settles its state first. How: This loads it and waits for it.
import { REA_STA_ARR } from '../support/states.ts';   // What: Reachable State Array. Why: An open tip or form is a look a visitor can stay on. How: This lists those states, such as an open info tip.
import { STA_REC_ARR } from '../support/states.ts';   // What: State Record Array. Why: Every shared app state is checked. How: This lists them.
import { test        } from '@playwright/test';       // What: Test. Why: Each check of each state is its own test. How: This declares them.

// #endregion Imports



/**
 * scripted.spec.ts = Scripted Spec
 *
 * @summary
 * The accessibility checks axe-core can't make, run on every app state,
 * opened editors and forms and open tips included, in whichever engine the
 * project runs. Names and keyboard: the checks in tests/support/scripted.ts,
 * which list every badly named link or button, and every problem a Tab walk
 * meets, from a stop off screen or covered to one it never reaches, or a
 * pop-up left open once focus moves past it. Reflow: at 320px wide, WCAG's
 * narrowest reflow width, nothing scrolls sideways. Motion: with reduced
 * motion requested, no animation or transition longer than 1ms starts while
 * the state opens, or is still held once it has. The motion check lists each
 * motion it finds, and the reflow check reports how far the page reaches past
 * the viewport. Every test opens its own page, so they run in parallel.
 *
 * Sections:
 *  - Constants
 *  - Helpers
 *  - Module Init
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const ALL_STA_ARR = [ ...STA_REC_ARR, ...EXT_STA_ARR, ...REA_STA_ARR ]; // What: All State Array. Why: Every shared state is checked, and so is each opened or reachable one, since each holds a look the plain tabs don't. How: This lists the shared states first, then the opened ones, then the reachable ones.
const REF_WID_NUM = 320;                                                // What: Reflow Width Number. Why: WCAG's reflow criterion asks for no sideways scrolling at 320 CSS pixels, the width of 1,280px at 400% zoom. How: This is the viewport width the reflow check opens each state at.

// #endregion Constants



// #region Helpers

// #region lonAniFun

/**
 * lonAniFun = Long Animations Function
 *
 * @summary
 * Runs inside the page and lists every animation or transition the page
 * still holds that lasts longer than 1ms, naming each by its CSS animation
 * name or transitioned property, or as a script animation when it has
 * neither. Passed to Playwright's evaluate, so it can't read anything from
 * this file.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns The names of the long animations the page still holds.
 *
 * @example
 * ```ts
 * page.evaluate(lonAniFun) // => [ 'max-height' ]
 * ```
 *
*/

function lonAniFun () : string[] {


	return document.getAnimations().filter( ( aniCurObj ) => ( Number( aniCurObj.effect?.getTiming().duration ) || 0 ) > 1 ).map( ( aniCurObj ) => ( aniCurObj as CSSAnimation ).animationName || ( aniCurObj as CSSTransition ).transitionProperty || 'script animation' ); // What: Long Animations Return. Why: The check needs the name of each motion still running. How: This keeps the animations and transitions longer than 1ms and maps each to its name. // What: Type Assertion Note. Why: getAnimations returns plain Animation objects, which don't type their CSS names. How: Each one is read as a CSS animation, then a CSS transition, falling back to a generic label when neither name exists.


}

// #endregion lonAniFun



// #region motRecFun

/**
 * motRecFun = Motion Recorder Function
 *
 * @summary
 * Runs inside the page from the moment it loads, as an init script, and
 * records every animation or transition that starts with a duration over 1ms
 * on window.motLisArr, naming each by its element's tag and its event's kind.
 * A transition an action sets off can finish before the check reads the page,
 * and a finished one drops out of getAnimations, so the recorder listens for
 * each motion as it starts instead. It listens in the capture phase, so
 * nothing on the page can stop it hearing one, and reads a pseudo-element's
 * own duration when the motion runs on one. Passed to Playwright's
 * addInitScript, so it can't read anything from this file.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * page.addInitScript(motRecFun) // => void
 * ```
 *
*/

function motRecFun () : void {


	const motLisArr : string[] = []; // What: Motion List Array. Why: Each motion that starts has to be kept until the check reads it. How: This collects one name per motion.


	Reflect.set( window, 'motLisArr', motLisArr ); // What: Motion List Global Set. Why: The check reads the list from outside the page. How: This puts the array on the window.


	for ( const eveTypStr of [ 'animationstart', 'transitionrun' ] ) window.addEventListener( eveTypStr, ( motEveObj ) => { // What: Motion Event Loop. Why: Animations and transitions announce themselves with different events. How: This listens for each on the window in the capture phase, catching every element's events before they reach it.


		const tarEleObj = motEveObj.target as Element;                                                                                       // What: Target Element Object. Why: The motion's duration is read from the element running it. How: This reads the event's target. // What: Type Assertion Note. Why: Event targets type as EventTarget. How: Both events only fire on elements.
		const motStyObj = getComputedStyle( tarEleObj, ( motEveObj as AnimationEvent ).pseudoElement || null );                              // What: Motion Style Object. Why: The event doesn't carry the motion's duration. How: This reads the computed styles of the element, or of its pseudo-element when the motion runs on one. // What: Type Assertion Note. Why: The listener types its event as a plain Event. How: Both animation and transition events carry pseudoElement, read here through the animation event's type.
		const durStrArr = ( motEveObj.type === 'transitionrun' ? motStyObj.transitionDuration : motStyObj.animationDuration ).split( ',' );  // What: Duration String Array. Why: An element can list several durations. How: This splits the duration that matches the event's kind.
		const lonDurBoo = durStrArr.some( ( durCurStr ) => parseFloat( durCurStr ) * ( durCurStr.trim().endsWith( 'ms' ) ? 1 : 1000 ) > 1 ); // What: Long Duration Boolean. Why: Only motion longer than 1ms counts. How: This converts each duration to milliseconds and checks for one over 1ms.


		if ( lonDurBoo ) motLisArr.push( `${ tarEleObj.tagName.toLowerCase() } ${ motEveObj.type }` ); // What: Long Motion Push. Why: Each long motion should be named in the failure. How: This records the element's tag and the event's kind.


	}, true ); // What: Capture Phase Flag. Why: The recorder has to see each motion event before anything on the page can stop it. How: This registers the listener for the capture phase.


}

// #endregion motRecFun

// #endregion Helpers



// #region Module Init

test.describe.configure( { mode : 'parallel' } ); // What: Parallel Mode Call. Why: Each test opens its own page, so none waits on another, and the keyboard walks are slow. How: This lets the file's tests run across every worker at once.


for ( const staRecObj of ALL_STA_ARR ) { // What: State Test Loop. Why: Every check runs on every app state. How: This declares each check once per state.


	test( `${ staRecObj.ideStr } names every link and button cleanly`, async ( { page : curPagObj } ) => { // What: Names Test. Why: Every control must be announced by a clean name. How: This opens the state and checks its accessibility tree.


		await opeStaFun( curPagObj, staRecObj ); // What: State Open Call. Why: The tree should be read with the state settled. How: This loads and settles it.


		expect( await namProFun( curPagObj ) ).toEqual( [] ); // What: No Name Problems Assertion. Why: The state passes only with clean names. How: This compares the problems with an empty list, so a failure prints each one.


	} );



	test( `${ staRecObj.ideStr } walks cleanly with the keyboard`, async ( { browserName : engNamStr, page : curPagObj } ) => { // What: Keyboard Test. Why: Everything has to be usable without a mouse. How: This opens the state under reduced motion and walks it with Tab, handing the walk the state's open pop-up, if it has one.


		await curPagObj.emulateMedia( { reducedMotion : 'reduce' } ); // What: Reduced Motion Emulation. Why: A smooth scroll or a focus transition still running would be measured halfway. How: This makes the page match prefers-reduced-motion, which turns both off.

		await opeStaFun( curPagObj, staRecObj ); // What: State Open Call. Why: The walk should start from the state settled. How: This loads and settles it.


		expect( await keyProFun( curPagObj, engNamStr, staRecObj.popStr || null ) ).toEqual( [] ); // What: No Keyboard Problems Assertion. Why: The state passes only when no element takes a positive tabindex, every stop is reached, in order, on screen, uncovered, and visibly focused, and an open pop-up closes as focus moves on. How: This compares the problems with an empty list, so a failure prints each one.


	} );



	test( `${ staRecObj.ideStr } reflows at ${ REF_WID_NUM }px without scrolling sideways`, async ( { page : curPagObj } ) => { // What: Reflow Test. Why: Zoomed-in visitors read in one column without scrolling sideways. How: This opens the state at the reflow width and compares the page's scroll width with its visible width.


		await opeStaFun( curPagObj, { ...staRecObj, widNum : REF_WID_NUM } ); // What: Narrow State Open Call. Why: Reflow is judged at WCAG's narrowest width. How: This opens the state with its width replaced by the reflow width.


		expect( await curPagObj.evaluate( () => document.documentElement.scrollWidth - document.documentElement.clientWidth ) ).toBeLessThanOrEqual( 0 ); // What: No Sideways Scroll Assertion. Why: The page passes only when nothing reaches past the viewport's width. How: This subtracts the visible width from the scrollable width, which stays at zero without sideways scrolling.


	} );



	test( `${ staRecObj.ideStr } plays no motion under reduced motion`, async ( { page : curPagObj } ) => { // What: Reduced Motion Test. Why: Visitors who ask for less motion shouldn't see the page animate. How: This requests reduced motion, records any animation or transition over 1ms that starts while the state opens, and lists any the page still holds once it has.


		await curPagObj.emulateMedia( { reducedMotion : 'reduce' } ); // What: Reduced Motion Emulation. Why: The preference has to be set before the page loads. How: This makes the page match prefers-reduced-motion: reduce.

		await curPagObj.addInitScript( motRecFun ); // What: Motion Recorder Install Call. Why: A transition the state's action sets off can finish before the page settles, and a finished one drops out of getAnimations. How: This runs motRecFun in the page before it loads, recording every motion over 1ms that starts.

		await opeStaFun( curPagObj, staRecObj ); // What: State Open Call. Why: Entrance animations and the state's own action are the motion being checked. How: This loads the state and runs its action.


		expect( await curPagObj.evaluate( () => Reflect.get( window, 'motLisArr' ) ) ).toEqual( [] ); // What: No Motion Started Assertion. Why: Nothing should have moved while the state opened, including transitions that already finished. How: This checks the recorder caught no motion longer than 1ms.
		expect( await curPagObj.evaluate( lonAniFun ) ).toEqual( [] );                                // What: No Motion Assertion. Why: The state passes only when no animation or transition it still holds lasts longer than 1ms. How: This lists every one through lonAniFun, which should find none.


	} );


}

// #endregion Module Init


