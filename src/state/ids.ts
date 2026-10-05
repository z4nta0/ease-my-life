


/**
 * ids.ts = Identifiers
 *
 * @summary
 * Mints the unique id every Today entry carries. A module-level counter is
 * appended to the timestamp so two ids minted in the same millisecond still
 * differ.
 *
 * Sections:
 *  - Module State
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Module State

let __eidSeqNum = 0; // What: Entry-Id Sequence Number. Why: newEidFun below needs a shared counter across every call so two ids minted in the same millisecond still differ. How: This starts at 0 and is incremented once per newEidFun call.

// #endregion Module State



// #region Helpers

// #region newEidFun

/**
 * newEidFun = New Entry-Id Function
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
 * newEidFun() // => 'e_abc123xy'
 * ```
 *
*/

function newEidFun () {


	return 'e_' + Date.now().toString( 36 ) + ( __eidSeqNum++ ).toString( 36 ); // What: Entry Id Return. Why: The caller needs a short, sortable, collision-resistant id. How: This concatenates a fixed prefix, the current time base-36, and the incrementing counter base-36.


}

// #endregion newEidFun

// #endregion Helpers



// #region Exports

export { newEidFun }; // What: Named Export. Why: Migration and the Today-entry actions both mint entry ids. How: This exports newEidFun by name; its counter stays private to this file.

// #endregion Exports


