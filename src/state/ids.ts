


// #region Imports

import { ideMakFun } from '../utils/sequence-id.ts'; // What: Identifier Make Function. Why: Each Today entry ID joins a time stamp and a counter of this file's own. How: This makes newIdeFun once, in Module State.

// #endregion Imports



/**
 * ids.ts = Identifiers
 *
 * @summary
 * Mints the unique id every Today entry carries. A counter of this file's
 * own is appended to the timestamp so two ids minted in the same millisecond
 * still differ.
 *
 * Sections:
 *  - Module State
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Module State

// #region newIdeFun

/**
 * newIdeFun = New Identifier Function
 *
 * @summary
 * Mints a new, distinct id for one Today entry. Entries are keyed by
 * this (not by pickerId) so the same picker can contribute more than
 * one choice to Today, and check/skip/re-roll can act on exactly one of
 * them.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns A new Today-entry id string, prefixed 'e_'.
 *
 * @example
 * ```ts
 * newIdeFun() // => 'e_abc123xy'
 * ```
 *
*/

const newIdeFun = ideMakFun( 'e_' ); // What: New Identifier Function. Why: The caller needs a short, collision-resistant ID. How: This is the factory's ID function, joining the 'e_' prefix, the current time in base 36, and this file's own counter in base 36.

// #endregion newIdeFun

// #endregion Module State



// #region Exports

export { newIdeFun }; // What: Named Export. Why: Entry ids are minted through this one helper. How: This exports newIdeFun by name; its counter stays private to it.

// #endregion Exports


