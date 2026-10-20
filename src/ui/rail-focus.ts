


// #region Imports

import React from 'react'; // What: React. Why: useRaiFocFun attaches and removes its listener from an effect. How: This is used directly (React.useEffect).


import { redMotFun } from '../utils/motion.ts'; // What: Reduce Motion Function. Why: Bringing a focused pill into view should jump rather than glide for someone who asked for less motion. How: This picks the scroll behavior in focScrFun.

// #endregion Imports



/**
 * rail-focus.ts = Rail Focus
 *
 * @summary
 * Keeps a keyboard-focused control inside one of the app's sideways pill
 * rails fully in view. Browsers scroll a focused element into view only when
 * it's entirely hidden, so a pill focused at a rail's edge stayed half
 * clipped, and behind the rail's edge fade. Each rail opts in with the same
 * presence-only data-rail-wheel-scroll attribute the mouse wheel support
 * uses, and one document-level listener scrolls the focused control fully
 * into its rail. The global stylesheet gives every marked rail an inline
 * scroll padding equal to its own fade, so the control lands clear of it.
 *
 * Sections:
 *  - Helpers
 *  - Hooks
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Helpers

// #region focScrFun

/**
 * focScrFun = Focus Scroll Function
 *
 * @summary
 * Scrolls a newly focused control fully into view when it sits inside a
 * marked rail, and leaves focus anywhere else alone. It scrolls to the
 * nearest edge, so a control already fully in view doesn't move, and a
 * rail's scroll padding keeps it clear of the edge fade.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param focEveObj - Focus Event Object: The focusin event from the
 *                    document.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * document.addEventListener('focusin', focScrFun) // => void
 * ```
 *
*/

const focScrFun = ( focEveObj : FocusEvent ) : void => { // What: Focus Scroll Function. Why: A pill focused at a rail's edge stayed half clipped. How: This scrolls a focused control inside a marked rail fully into view.


	const tarEleObj = focEveObj.target instanceof Element ? focEveObj.target : null; // What: Target Element Object. Why: Only an element can be scrolled into view. How: This reads the focused element, or null for anything else.



	if ( !tarEleObj?.closest( '[data-rail-wheel-scroll]' ) ) return; // What: Outside Rail Guard. Why: Focus anywhere else is left to the browser. How: This returns unless the focused element sits inside a marked rail.



	tarEleObj.scrollIntoView({ // What: Into View Call. Why: The focused pill has to be fully visible. How: This scrolls it to the nearest edge of its rail, jumping under reduced motion.


		behavior : redMotFun() ? 'auto' : 'smooth', // What: Behavior. Why: The scroll should glide unless less motion was asked for. How: This jumps under reduced motion and glides otherwise.
		block    : 'nearest',                       // What: Block. Why: The page shouldn't jump vertically for a pill already in view. How: This scrolls vertically only as far as needed.
		inline   : 'nearest'                        // What: Inline. Why: The rail should move only far enough to show the whole pill. How: This scrolls sideways to its nearest edge.


	});


};

// #endregion focScrFun

// #endregion Helpers



// #region Hooks

// #region useRaiFocFun

/**
 * useRaiFocFun = Use Rail Focus Function
 *
 * @summary
 * Attaches focScrFun to the document for as long as the calling component is
 * mounted, then removes it. The app root calls it once, so every rail marked
 * with data-rail-wheel-scroll keeps its focused control in view on every tab.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * useRaiFocFun() // => void
 * ```
 *
*/

function useRaiFocFun () : void {


	React.useEffect( () => { // What: Focus Listener Effect. Why: Rails keep their focused control in view only while the app is mounted. How: This attaches focScrFun to the document and removes it on cleanup.


		document.addEventListener( 'focusin', focScrFun ); // What: Focus Listener Call. Why: focusin bubbles from every focused element, unlike focus. How: This attaches focScrFun to it.



		return () => document.removeEventListener( 'focusin', focScrFun ); // What: Focus Listener Cleanup. Why: An unmounted app must not leave its listener behind. How: This removes focScrFun from the document.


	}, [] ); // What: Effect Dependency Array. Why: The listener reads nothing from the component, so it attaches once. How: The empty array runs the effect only on mount.


}

// #endregion useRaiFocFun

// #endregion Hooks



// #region Exports

export { useRaiFocFun }; // What: Named Export. Why: The app root turns rail focus scrolling on through this hook. How: This exports useRaiFocFun by name.

// #endregion Exports


