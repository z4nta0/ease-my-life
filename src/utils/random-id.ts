


/**
 * random-id.ts = Random Identifier
 *
 * @summary
 * Mints short random ids with no knowledge of the app: ranIdeFun joins a
 * caller's prefix to a few random base-36 characters, so each kind of record
 * can be told apart by its prefix while its id stays unique enough to key it.
 *
 * Sections:
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Helpers

// #region ranIdeFun

/**
 * ranIdeFun = Random Identifier Function
 *
 * @summary
 * Mints an id from a prefix and a run of random base-36 characters, taken
 * from one Math.random call, so a seeded Math.random gives the same id for
 * the same call. The run is the characters after the "0." of the random
 * number's base-36 form, so it can come out shorter than asked for on the
 * rare draw whose form is shorter.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param preTexStr - Prefix Text String: The text the id starts with,
 *                    naming its kind of record.
 * @param lenValNum - Length Value Number: How many random characters follow
 *                    the prefix, 6 by default.
 *
 * @returns The prefix followed by the random characters.
 *
 * @example
 * ```ts
 * ranIdeFun('it_') // => 'it_k3x9qa'
 * ```
 *
*/

const ranIdeFun = ( preTexStr : string, lenValNum : number = 6 ) : string => preTexStr + Math.random().toString( 36 ).slice( 2, 2 + lenValNum ); // What: Random Identifier Function. Why: Records of many kinds mint a fresh id the same way. How: This joins preTexStr to lenValNum base-36 characters of one Math.random call.

// #endregion ranIdeFun

// #endregion Helpers



// #region Exports

export { ranIdeFun }; // What: Named Export. Why: Random record ids are minted from one helper. How: This exports ranIdeFun by name.

// #endregion Exports


