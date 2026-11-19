


// #region Imports

import type { Page   } from '@playwright/test'; // What: Page. Why: The overflow helper reads one page. How: This types its page parameter.
import type { Result } from 'axe-core';         // What: Result. Why: The violation helper reads axe-core's results. How: This types one rule's result, which @axe-core/playwright's scan returns.

// #endregion Imports



/**
 * accessibility.ts = Accessibility
 *
 * @summary
 * The accessibility targets and readings the scanning specs share: the
 * axe-core rule sets a scan runs, for WCAG 2.2 AA plus axe's best practices,
 * the width the reflow checks open a page at, and helpers that put a scan's
 * violations into readable lines and measure a page's sideways overflow.
 *
 * Sections:
 *  - Constants
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const AXE_TAG_ARR = [ 'wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice' ]; // What: Axe Tag Array. Why: The app and its legal pages target WCAG 2.2 AA, which includes every earlier A and AA rule, and axe's best practices catch common problems WCAG doesn't name. How: This limits a scan to those rule sets.
const REF_WID_NUM = 320;                                                                         // What: Reflow Width Number. Why: WCAG's reflow criterion asks for no sideways scrolling at 320 CSS pixels, the width of 1,280px at 400% zoom. How: This is the viewport width a reflow check opens each page or state at.

// #endregion Constants



// #region Helpers

// #region sidOveFun

/**
 * sidOveFun = Sideways Overflow Function
 *
 * @summary
 * Measures how far the page's content reaches past the viewport's width, as
 * the root element's scroll width less its visible width. A page that doesn't
 * scroll sideways measures zero or less.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page to measure.
 *
 * @returns A promise that resolves with the overflow in CSS pixels.
 *
 * @example
 * ```ts
 * await sidOveFun(curPagObj) // => 0
 * ```
 *
*/

async function sidOveFun ( curPagObj : Page ) : Promise< number > {



	return curPagObj.evaluate( () => document.documentElement.scrollWidth - document.documentElement.clientWidth ); // What: Overflow Width Return. Why: The root element is what scrolls the page sideways. How: This subtracts its visible width from its scrollable width in the page.


}

// #endregion sidOveFun



// #region vioLinFun

/**
 * vioLinFun = Violation Lines Function
 *
 * @summary
 * Turns an axe-core scan's violations into one line each, naming the rule,
 * its help text, and the elements it found, so a failed assertion against an
 * empty list prints what broke and where.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param vioResArr - Violation Result Array: The scan's violations.
 *
 * @returns One line per violation, in the scan's order.
 *
 * @example
 * ```ts
 * vioLinFun(axeResObj.violations) // => [ 'region: ... at main' ]
 * ```
 *
*/

function vioLinFun ( vioResArr : Result[] ) : string[] {



	return vioResArr.map( ( vioCurObj ) => `${ vioCurObj.id }: ${ vioCurObj.help } at ${ vioCurObj.nodes.map( ( nodCurObj ) => nodCurObj.target.join( ' ' ) ).join( ', ' ) }` ); // What: Violation Line Return. Why: A failure should say what broke and where. How: This joins each violation's rule, help text, and its elements' selectors.


}

// #endregion vioLinFun

// #endregion Helpers



// #region Exports

export { AXE_TAG_ARR, REF_WID_NUM, sidOveFun, vioLinFun }; // What: Named Exports. Why: The app's, the legal pages', and the account screens' scans share one rule set and one way to report violations, and the reflow checks share one width and one overflow reading. How: This exports them by name.

// #endregion Exports


