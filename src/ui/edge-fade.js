


/**
 * edge-fade.js = Edge Fade
 *
 * @summary
 * The edge fades on every horizontally scrolling rail in the app: CSS fades a
 * rail's left and right edges unless its own at-start/at-end classes say that
 * edge is already reached. togFadFun computes both classes from the rail's
 * current scroll position; each rail wires it to its own scroll and resize
 * events, since what can change a rail's layout differs from rail to rail.
 *
 * Sections:
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Helpers

// #region togFadFun

/**
 * togFadFun = Toggle Fade Function
 *
 * @summary
 * Sets a rail's at-start/at-end classes from its current scroll position. A
 * rail that can't scroll at all counts as having reached both edges, so
 * neither fade shows. A 1px tolerance keeps subpixel scroll positions from
 * leaving a fade stuck on at either end.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param scrCurEle - Scroll Current Element: The element that actually
 *                    scrolls.
 * @param claCurEle - Class Current Element: The element the at-start/at-end
 *                    classes go on, defaulting to scrCurEle itself when the
 *                    scroller carries its own fades.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * togFadFun( raiCurEle ) // => void
 * ```
 *
*/

const togFadFun = ( scrCurEle, claCurEle = scrCurEle ) => { // What: Toggle Fade Function. Why: Every scrolling rail hides each edge fade once that edge is reached. How: This measures scrCurEle and toggles both classes on claCurEle.


	const canScrBoo = scrCurEle.scrollWidth - scrCurEle.clientWidth > 1;                                      // What: Can Scroll Boolean. Why: A rail that doesn't overflow has no edge to fade at all. How: This checks for more than 1px of overflow.
	const reaStaBoo = !canScrBoo || scrCurEle.scrollLeft <= 1;                                                // What: Reached Start Boolean. Why: The left fade should hide once the rail is scrolled all the way left. How: This is true when the rail can't scroll or sits within 1px of its start.
	const reaEndBoo = !canScrBoo || scrCurEle.scrollLeft + scrCurEle.clientWidth >= scrCurEle.scrollWidth - 1; // What: Reached End Boolean. Why: The right fade should hide once the rail is scrolled all the way right. How: This is true when the rail can't scroll or sits within 1px of its end.


	claCurEle.classList.toggle( 'at-start', reaStaBoo ); // What: At Start Toggle. Why: This is the class CSS reads to hide the left fade. How: This applies reaStaBoo.
	claCurEle.classList.toggle( 'at-end', reaEndBoo );   // What: At End Toggle. Why: This is the class CSS reads to hide the right fade. How: This applies reaEndBoo.


};

// #endregion togFadFun

// #endregion Helpers



// #region Exports

export { togFadFun }; // What: Named Export. Why: Every scrolling rail in the app shares this fade logic. How: This exports togFadFun by name.

// #endregion Exports


