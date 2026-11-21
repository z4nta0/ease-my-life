


// #region Imports

import type { StaAppTyp } from '../../src/core/data-model.ts'; // What: State App Type. Why: The done count is read from a saved state. How: This types it.

// #endregion Imports



/**
 * today.ts = Today
 *
 * @summary
 * What the Today suites share for finding and counting cards: selectors for
 * the real entry and reminder cards, leaving out the tutorial cards beside
 * them, and a count of the entries a saved state has checked off.
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

const ENT_CAR_STR = '[data-element-name-hook~="todCarArt"]:not([data-element-name-hook~="remCarArt"]):not([data-element-name-hook~="tutCarArt"])'; // What: Entry Card String. Why: Entry cards exclude reminders and tutorials. How: This selects real entry cards.
const REM_CAR_STR = '[data-element-name-hook~="remCarArt"]:not([data-element-name-hook~="tutCarArt"])';                                            // What: Reminder Card String. Why: Reminder cards exclude tutorials. How: This selects real reminder cards.

// #endregion Constants



// #region Helpers

// #region donCouFun

/**
 * donCouFun = Done Count Function
 *
 * @summary
 * Counts the entries in a saved state's Today list that are checked off. It
 * reads only the state it is given and changes nothing.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param staAppObj - State App Object: The saved state whose Today entries to
 *                    count.
 *
 * @returns The number of entries marked done.
 *
 * @example
 * ```ts
 * donCouFun(staAppObj) // => 3
 * ```
 *
*/

const donCouFun = ( staAppObj : StaAppTyp ) : number => staAppObj.today.entries.filter( ( curEntObj ) => curEntObj.done ).length; // What: Done Count Function. Why: A check-off raises the done count by one. How: This counts done entries.

// #endregion donCouFun

// #endregion Helpers



// #region Exports

export { donCouFun, ENT_CAR_STR, REM_CAR_STR }; // What: Named Exports. Why: These are the card selectors and done count the Today suites share. How: This exports them by name.

// #endregion Exports


