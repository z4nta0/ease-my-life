


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

const donCouFun = ( staAppObj : StaAppTyp ) => staAppObj.today.entries.filter( ( curEntObj ) => curEntObj.done ).length; // What: Done Count Function. Why: A check-off raises the done count by one. How: This counts done entries.

// #endregion Helpers



// #region Exports

export { donCouFun, ENT_CAR_STR, REM_CAR_STR }; // What: Named Exports. Why: The Today interaction suite and the simulation find cards and recognize check-offs through these. How: This exports them by name.

// #endregion Exports


