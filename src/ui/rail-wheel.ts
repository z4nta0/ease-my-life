


// #region Imports

import React from 'react'; // What: React. Why: useRaiWheFun attaches and removes its listener from an effect. How: This is used directly (React.useEffect).

// #endregion Imports



/**
 * rail-wheel.ts = Rail Wheel
 *
 * @summary
 * Lets a mouse wheel scroll the app's horizontal pill rails. A rail only
 * scrolls sideways, but a mouse wheel only scrolls up and down, so on a
 * desktop without a trackpad the rails could only be moved by dragging their
 * scrollbar. Each rail opts in with a presence-only data-rail-wheel-scroll
 * attribute, and one document-level listener turns a vertical wheel turn over
 * a marked rail into a sideways scroll of that rail. The listener is native
 * and non-passive, since React's onWheel can't cancel the page's own scroll.
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

// #region wheScrFun

/**
 * wheScrFun = Wheel Scroll Function
 *
 * @summary
 * Scrolls the marked rail under the pointer sideways by a vertical wheel
 * turn, and cancels the page's own scroll so the two don't move together. It
 * leaves alone a wheel event that's mostly sideways already (a trackpad
 * swipe, or Shift plus the wheel), a pinch zoom (which arrives with ctrlKey
 * set), and any turn that would push a rail past its first or last pill, so
 * the page scrolls on as usual once the rail can't go any further.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param wheEveObj - Wheel Event Object: The wheel event from the document.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * document.addEventListener('wheel', wheScrFun, { passive: false }) // => void
 * ```
 *
*/

const wheScrFun = ( wheEveObj : WheelEvent ) : void => { // What: Wheel Scroll Function. Why: A mouse wheel can only scroll up and down, but the pill rails only scroll sideways. How: This moves the marked rail under the pointer sideways by the wheel's vertical turn.


	if ( wheEveObj.ctrlKey || Math.abs( wheEveObj.deltaX ) >= Math.abs( wheEveObj.deltaY ) ) return; // What: Native Gesture Guard. Why: A pinch zoom and a mostly sideways turn already do the right thing on their own. How: This skips both.



	const raiDomEle = wheEveObj.target instanceof Element ? wheEveObj.target.closest< HTMLElement >( '[data-rail-wheel-scroll]' ) : null; // What: Rail DOM Element. Why: Only a rail that opted in is scrolled. How: This finds the nearest marked rail around the pointer, if any.


	if ( !raiDomEle ) return; // What: No Rail Guard. Why: A wheel turn anywhere else scrolls the page as usual. How: This skips it.



	const uniPixNum = [ 1, 16, raiDomEle.clientWidth ][ wheEveObj.deltaMode ] ?? 1; // What: Unit Pixel Number. Why: A wheel can report its turn in pixels, lines, or pages, depending on the browser. How: This picks the pixels in one unit, guessing 16 for a line.
	const delPixNum = wheEveObj.deltaY * uniPixNum;                                 // What: Delta Pixel Number. Why: The rail scrolls by the wheel's turn in pixels. How: This converts the vertical turn to pixels.
	const maxScrNum = raiDomEle.scrollWidth - raiDomEle.clientWidth;                // What: Maximum Scroll Number. Why: The rail can only scroll as far as its content overflows. How: This is its overflow width.
	const staEdgBoo = delPixNum < 0 && raiDomEle.scrollLeft <= 0;                   // What: Start Edge Boolean. Why: A rail already at its first pill can't scroll further back. How: This is true for a backward turn at the start.
	const endEdgBoo = delPixNum > 0 && raiDomEle.scrollLeft >= maxScrNum - 1;       // What: End Edge Boolean. Why: A rail already at its last pill can't scroll further on, with a pixel of tolerance for subpixel positions. How: This is true for a forward turn at the end.



	if ( maxScrNum <= 0 || staEdgBoo || endEdgBoo ) return; // What: Rail Edge Guard. Why: A rail with nothing to scroll, or already at the edge the turn points at, hands the turn back to the page. How: This skips it.



	wheEveObj.preventDefault(); // What: Page Scroll Prevention Call. Why: The page mustn't scroll while the rail does. How: This cancels the page's own scroll for this turn.

	raiDomEle.scrollLeft += delPixNum; // What: Rail Scroll Write. Why: The turn moves the rail sideways. How: This adds the turn's pixels to the rail's scroll position, which the browser clamps to its ends.


};

// #endregion wheScrFun

// #endregion Helpers



// #region Hooks

// #region useRaiWheFun

/**
 * useRaiWheFun = Use Rail Wheel Function
 *
 * @summary
 * Attaches wheScrFun to the document for as long as the calling component is
 * mounted, then removes it. The app root calls it once, so every rail marked
 * with data-rail-wheel-scroll scrolls with the mouse wheel on every tab, and
 * a hot reload swaps the listener cleanly instead of stacking a second one.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * useRaiWheFun() // => void
 * ```
 *
*/

function useRaiWheFun () : void {


	React.useEffect( () => { // What: Wheel Listener Effect. Why: The rails scroll by wheel only while the app is mounted. How: This attaches wheScrFun to the document and removes it on cleanup.


		document.addEventListener( 'wheel', wheScrFun, { passive : false } ); // What: Wheel Listener Call. Why: Cancelling the page's scroll needs a listener that isn't passive. How: This attaches wheScrFun with passive turned off.



		return () => document.removeEventListener( 'wheel', wheScrFun ); // What: Wheel Listener Cleanup. Why: An unmounted app must not leave its listener behind. How: This removes wheScrFun from the document.


	}, [] ); // What: Effect Dependency Array. Why: The listener reads nothing from the component, so it attaches once. How: The empty array runs the effect only on mount.


}

// #endregion useRaiWheFun

// #endregion Hooks



// #region Exports

export { useRaiWheFun }; // What: Named Exports. Why: The app root turns rail wheel scrolling on through this hook. How: This exports useRaiWheFun by name.

// #endregion Exports


