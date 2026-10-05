


/**
 * format.ts = Format
 *
 * @summary
 * Text formatting with no knowledge of the app: uniNamFun makes a name unique
 * among its siblings by appending the next free " (N)" suffix.
 *
 * Sections:
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Helpers

// #region uniNamFun

/**
 * uniNamFun = Unique Name Function
 *
 * @summary
 * Makes name unique among siblings (an array of existing sibling
 * names) by appending " (2)", " (3)", ... as needed. Compares
 * case-insensitively so "vacuum"/"Vacuum" collide. Used whenever an
 * item/reminder/picker is added or renamed, so two entries in the same
 * scope can't share a name the user can't tell apart.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param namRawStr  - Name Raw String: The candidate name to make unique.
 * @param sibNamArr  - Sibling Name Array: The sibling names already in use in
 *                     this scope.
 *
 * @returns The unique name: namRawStr as-is if it doesn't collide,
 * otherwise namRawStr (or its already-numbered base) with the next
 * free " (N)" suffix appended.
 *
 * @example
 * ```ts
 * uniNamFun('Vacuum', ['vacuum']) // => 'Vacuum (2)'
 * ```
 *
*/

function uniNamFun ( namRawStr, sibNamArr ) {


	const takNamSet = new Set( sibNamArr.map( ( curNamStr ) => ( curNamStr || '' ).trim().toLowerCase() ) ); // What: Taken Name Set. Why: The collision check below needs every sibling name normalized the same way as the candidate. How: This trims and lowercases every entry of sibNamArr into a Set.
	const basNamStr = ( namRawStr || '' ).trim();                                                            // What: Base Name String. Why: The candidate itself needs the same trim before it's compared or returned. How: This trims namRawStr, falling back to an empty string.


	if ( !takNamSet.has( basNamStr.toLowerCase() ) ) return basNamStr; // What: No-Collision Guard. Why: A name that doesn't collide at all needs no renumbering. How: This returns basNamStr unchanged as soon as its lowercase form isn't in takNamSet.



	const stiNamStr = basNamStr.replace( /\s*\(\d+\)$/, '' ); // What: Stripped Name String. Why: A name that already ends in " (N)" must be re-numbered from its own bare base, not stacked again. How: This strips a trailing " (N)" suffix from basNamStr, if present.

	let sufCanNum = 2; // What: Suffix Candidate Number And Guard. Why: The loop below needs a running candidate suffix, starting at the first number that could possibly be free. How: This starts at 2 and is incremented until a free suffix is found.


	while ( takNamSet.has( `${ stiNamStr } (${ sufCanNum })`.toLowerCase() ) ) sufCanNum++; // What: Free-Suffix Search Loop. Why: Every already-taken suffix must be skipped until a genuinely free one is found. How: This keeps incrementing sufCanNum while its candidate string is still present in takNamSet.



	return `${ stiNamStr } (${ sufCanNum })`; // What: Numbered Name Return. Why: The caller needs the final, guaranteed-unique name. How: This combines stiNamStr with the first free sufCanNum found above.


}

// #endregion uniNamFun

// #endregion Helpers



// #region Exports

export { uniNamFun }; // What: Named Export. Why: Every add and rename action keeps sibling names unique. How: This exports uniNamFun by name.

// #endregion Exports


