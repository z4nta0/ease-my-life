


/**
 * sequence-id.ts = Sequence Identifier
 *
 * @summary
 * A small factory for a module's own ID function, with no knowledge of the
 * app. Each ID joins a prefix, the current time in base 36, and a counter in
 * base 36, so two IDs minted in the same millisecond still differ. Each call
 * of the factory keeps its own counter, so one module's IDs never move
 * another's count.
 *
 * Sections:
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Helpers

// #region ideMakFun

/**
 * ideMakFun = Identifier Make Function
 *
 * @summary
 * Makes an ID function with a counter of its own, starting at 0. Each call
 * of the returned function gives the prefix, then Date.now() in base 36,
 * then the counter in base 36, and adds one to the counter.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param preTexStr - Prefix Text String: The text every ID starts with,
 *                    naming its kind of record.
 *
 * @returns The module's ID function.
 *
 * @example
 * ```ts
 * ideMakFun('e_')() // => 'e_mhq3k2x80'
 * ```
 *
*/

function ideMakFun ( preTexStr : string ) : ( () => string ) {


	let seqCouNum = 0; // What: Sequence Count Number. Why: Two IDs minted in the same millisecond must still differ. How: This starts at 0 and goes up by one per ID, private to this one ID function.



	return () => preTexStr + Date.now().toString( 36 ) + ( seqCouNum++ ).toString( 36 ); // What: Identifier Function Return. Why: The module mints every ID of its kind through it. How: This returns a function joining the prefix, the time in base 36, and the counter in base 36, counting up once per call.


}

// #endregion ideMakFun

// #endregion Helpers



// #region Exports

export { ideMakFun }; // What: Named Export. Why: The Today entries, the pick log, and the conditional log each mint IDs with a counter of their own. How: This exports the factory by name.

// #endregion Exports


