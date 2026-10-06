


// #region Imports

import React from 'react'; // What: React. Why: The hook below is built on React's own layout effect and ref APIs. How: This is used directly (React.useLayoutEffect, React.useRef).


import { durMilFun } from '../utils/rhythm.ts'; // What: Duration Millisecond Function. Why: Both pill animations must last exactly as long as their own duration step. How: This returns a step's length in milliseconds.
import { motEasFun } from '../utils/motion.ts'; // What: Motion Easing Function. Why: Element.animate curves should match the stylesheet. How: This reads a --mot-*-eas token as a CSS easing string.
import { redMotFun } from '../utils/motion.ts'; // What: Reduce Motion Function. Why: A user who prefers reduced motion should see the pills snap instead of glide. How: This reports whether reduced motion is on.

// #endregion Imports



/**
 * flip-rail.ts = Flip Rail
 *
 * @summary
 * The reorder animation shared by every pill rail whose pills re-sort when a
 * selection changes: the conditional rails on the Data tab's picker controls
 * and in the Pickers tab's picker form, where the chosen conditional pins to
 * the front. Each pill that takes part carries its own stable id in
 * data-flip-item-key. After a re-sort, useFliRaiFun slides every pill that
 * moved from its old spot to its new one (the FLIP technique: record each
 * pill's First position, let React render its Last, Invert the difference
 * with a transform, then Play it back to none), and fades in any pill it has
 * not seen before. A pill without the attribute, such as a fixed "New" pill,
 * is left alone.
 *
 * Sections:
 *  - Hooks
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Hooks

// #region useFliRaiFun

/**
 * useFliRaiFun = Use Flip Rail Function
 *
 * @summary
 * Plays the rail's reorder animation every time trgKeyStr changes. It runs
 * as a layout effect, after React has re-sorted the pills but before the
 * browser paints, so each moved pill can be shifted back to its old spot and
 * glide forward without ever showing the snapped order. Positions are kept
 * between runs in a map keyed by data-flip-item-key; the first run after the
 * rail mounts fades every pill in, since none has a previous position yet.
 * Under reduced motion the pills simply snap, but their positions are still
 * recorded, so the next change starts from the right place.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param raiNodRef - Rail Node Reference: A ref holding the rail's own live
 *                    DOM node, null while the rail isn't mounted.
 * @param trgKeyStr - Trigger Key String: Any string that changes whenever
 *                    the rail re-sorts or remounts, such as the selected id
 *                    joined with the rail's visibility and pill count.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * useFliRaiFun(raiNodRef, trgKeyStr) // => void
 * ```
 *
*/

function useFliRaiFun ( raiNodRef : React.RefObject< HTMLElement | null >, trgKeyStr : string ) : void {


	const fliFirRef = React.useRef( new Map< string, number >() ); // What: Flip First Reference. Why: Each pill's PREVIOUS x position is needed to compute how far it moved. How: This starts as an empty map and is repopulated at the end of every effect run.


	React.useLayoutEffect( () => { // What: Rail Flip Effect. Why: A re-sorted pill would otherwise snap to its new spot; this plays a FLIP tween instead. How: This measures each pill's new x, inverts it back to its recorded old x, and plays the transform to none.


		const raiCurEle = raiNodRef.current; // What: Rail Current Element. Why: There is nothing to animate before the rail itself has mounted. How: This reads the live node the caller's own ref holds.


		if ( !raiCurEle ) return; // What: No Rail Guard. Why: The rail may not be mounted yet, such as while its own collapse is still closed. How: This bails out of the effect early when there is no rail element to measure.



		const firMapObj = fliFirRef.current;                                                          // What: First Map Object. Why: This is the map of each pill's own previous x position, read and then overwritten below. How: This is read once from fliFirRef.current and reused throughout this effect run.
		const pilNodArr = [ ...raiCurEle.querySelectorAll< HTMLElement >( '[data-flip-item-key]' ) ]; // What: Pill Node Array. Why: Every currently-rendered pill that takes part needs to be measured and possibly animated. How: This queries every element carrying data-flip-item-key inside the rail and spreads the NodeList into a real array.
		const redMotBoo = redMotFun();                                                                // What: Reduce Motion Boolean. Why: A user who prefers reduced motion should never see this FLIP tween. How: This is checked once per run and read by every pill below.


		pilNodArr.forEach( ( pilCurEle ) => { // What: Pill Animate Loop. Why: Every pill needs its own individual FLIP tween (or fade-in, if new), since each may have moved a different distance. How: This computes each pill's own delta from firMapObj and plays the matching animation.


			const pilIdeStr = pilCurEle.dataset.flipItemKey; // What: Pill Identifier String. Why: firMapObj is keyed by each pill's own stable id, not the DOM node itself. How: This reads the pill's own data-flip-item-key attribute.
			const preXcoNum = firMapObj.get( pilIdeStr );    // What: Previous X-Coordinate Number. Why: A FLIP tween needs to know where this exact pill sat before the reorder. How: This looks up pilIdeStr in firMapObj, undefined if this pill is brand new.
			const newXcoNum = pilCurEle.offsetLeft;          // What: New X-Coordinate Number. Why: The tween's own end point is wherever the pill actually landed after the reorder. How: This reads the pill's own current offsetLeft.



			if ( redMotBoo ) return; // What: Reduced Motion Guard. Why: This pill should snap silently instead of tweening. How: This skips straight to the next pill without animating.



			if ( preXcoNum == null ) { // What: New Pill Guard. Why: A pill with no recorded previous position is appearing for the first time. How: This plays a fade-and-rise-in animation instead of a horizontal FLIP tween.


				pilCurEle.animate( [ { opacity : 0, transform : 'translateY(4px)' }, { opacity : 1, transform : 'none' } ], { // What: Entrance Animation Call. Why: A brand-new pill deserves its own entrance rather than a slide from nowhere. How: This fades and rises the pill into place over the p02 duration step.


					duration : durMilFun( 'p02' ), // What: Duration. Why: The entrance must match the app's own motion scale. How: This reads the p02 duration step through durMilFun. // Duration Base Plus 2 ~= 277.0ms
					easing   : motEasFun( 'dec' )  // What: Easing. Why: A pill arriving in the row should start fast and land softly. How: This reads the decelerate easing curve through motEasFun. // Motion Decelerate Easing = cubic-bezier( .2, .7, .3, 1 )


				} );


			}

			else { // What: Moved Pill Branch. Why: A pill that was already in the row before this render may have moved sideways. How: This plays a horizontal FLIP slide from its previous x back to its new one.


				const difXcoNum = preXcoNum - newXcoNum; // What: Difference X-Coordinate Number. Why: The FLIP tween's own starting transform is the distance this pill needs to travel back from its new position. How: This subtracts the new x from the previous x.


				if ( Math.abs( difXcoNum ) > 1 ) pilCurEle.animate( [ { transform : `translateX(${ difXcoNum }px)` }, { transform : 'none' } ], { // What: Flip Animation Guard. Why: A pill that didn't actually move by more than a rounding pixel needs no tween at all. How: This plays the invert-then-play transform over the p03 duration step only when difXcoNum is meaningfully non-zero.


					duration : durMilFun( 'p03' ), // What: Duration. Why: The slide back into place must match the app's own motion scale. How: This reads the p03 duration step through durMilFun. // Duration Base Plus 3 ~= 366.9ms
					easing   : motEasFun( 'dec' )  // What: Easing. Why: A pill arriving at its new spot should start fast and land softly. How: This reads the decelerate easing curve through motEasFun. // Motion Decelerate Easing = cubic-bezier( .2, .7, .3, 1 )


				} );


			}


		} );



		firMapObj.clear(); // What: First Map Clear. Why: The map must not accumulate stale positions from a pill that no longer exists. How: This empties firMapObj before it's repopulated just below.

		pilNodArr.forEach( ( pilCurEle ) => firMapObj.set( pilCurEle.dataset.flipItemKey, pilCurEle.offsetLeft ) ); // What: First Map Populate. Why: The NEXT reorder's own FLIP tween needs this run's final positions as its own "previous" baseline. How: This records every pill's own current offsetLeft, keyed by its own data-flip-item-key.


	}, [ raiNodRef, trgKeyStr ] ); // What: Effect Dependency Array. Why: The animation must run once per re-sort, and a different rail ref would mean different pills. How: trgKeyStr is the caller's own reorder trigger, and raiNodRef is the stable ref the effect reads the rail through.


}

// #endregion useFliRaiFun

// #endregion Hooks



// #region Exports

export { useFliRaiFun }; // What: Named Export. Why: Every pill rail that re-sorts on selection shares this reorder animation. How: This exports useFliRaiFun by name.

// #endregion Exports


