


/**
 * selector.js = Selector
 *
 * @summary
 * CSS selector helpers with no knowledge of the app: splSelFun splits a
 * selector list into its own top-level alternatives, so a comma inside
 * :is(), :not(), :has(), an attribute selector, or a quoted value never
 * splits one alternative in two.
 *
 * Sections:
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Helpers

// #region splSelFun

/**
 * splSelFun = Split Selector Function
 *
 * @summary
 * Splits a selector list at its top-level commas only, tracking
 * parenthesis and bracket depth plus quoted strings, so a nested list such
 * as ":is(a, b)" stays one alternative. Each returned alternative is
 * trimmed.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param selLisStr - Selector List String: The selector list to split.
 *
 * @returns The list's own top-level alternatives, in order.
 * @see {@link altSelArr}
 *
 * @example
 * ```ts
 * splSelFun( ':is(a, b), c' ) // => [ ':is(a, b)', 'c' ]
 * ```
 *
*/

const splSelFun = ( selLisStr ) => { // What: Split Selector Function. Why: Callers that try each alternative of a selector list in turn must not split a nested list apart. How: This walks selLisStr one character at a time and cuts only at commas outside any parentheses, brackets, or quotes.


	const altSelArr = []; // What: Alternative Selector Array. Why: Every finished top-level alternative is collected here. How: This is pushed onto at each top-level comma and once more at the end.
	let depValNum   = 0;  // What: Depth Value Number. Why: A comma inside parentheses or brackets belongs to a nested list, not the top level. How: This rises on each opening bracket and falls on each closing one.
	let quoCurStr   = ''; // What: Quote Current String. Why: A comma inside a quoted attribute value is plain text, never a separator. How: This holds the open quote character, or is empty outside any quotes.
	let staIndNum   = 0;  // What: Start Index Number. Why: Each alternative runs from the character after the previous top-level comma. How: This is moved past every top-level comma found.


	for ( let chaIndNum = 0; chaIndNum < selLisStr.length; chaIndNum++ ) { // What: Character Loop. Why: Every character decides whether the depth, the quote state, or the alternatives change. How: This walks selLisStr from start to end.


		const chaCurStr = selLisStr[ chaIndNum ]; // What: Character Current String. Why: Each check below reads this one character. How: This reads selLisStr at chaIndNum.


		if ( quoCurStr ) { // What: Inside Quote Check. Why: Inside a quoted value only the matching closing quote matters. How: This clears quoCurStr when chaCurStr closes the open quote.


			if ( chaCurStr === quoCurStr ) quoCurStr = ''; // What: Quote Close Guard. Why: The matching quote ends the quoted value. How: This clears quoCurStr.


		}

		else if ( chaCurStr === '"' || chaCurStr === '\'' ) quoCurStr = chaCurStr; // What: Quote Open Branch. Why: A quote starts a quoted value whose commas are plain text. How: This records which quote opened it.

		else if ( chaCurStr === '(' || chaCurStr === '[' ) depValNum++; // What: Depth Open Branch. Why: An opening bracket starts a nested part. How: This raises depValNum.

		else if ( chaCurStr === ')' || chaCurStr === ']' ) depValNum--; // What: Depth Close Branch. Why: A closing bracket ends a nested part. How: This lowers depValNum.

		else if ( chaCurStr === ',' && depValNum === 0 ) { // What: Top-Level Comma Branch. Why: Only a comma at depth 0 separates two alternatives. How: This pushes the alternative ending here and moves staIndNum past the comma.


			altSelArr.push( selLisStr.slice( staIndNum, chaIndNum ).trim() ); // What: Alternative Push Call. Why: The alternative before this comma is finished. How: This pushes its trimmed text.

			staIndNum = chaIndNum + 1; // What: Start Index Advance. Why: The next alternative begins after this comma. How: This sets staIndNum to the following character.


		}


	}



	altSelArr.push( selLisStr.slice( staIndNum ).trim() ); // What: Final Alternative Push Call. Why: The last alternative has no comma after it. How: This pushes the trimmed text from staIndNum to the end.



	return altSelArr; // What: Alternative Selector Array Return. Why: The caller tries each top-level alternative in order. How: This returns every alternative split out above.


};

// #endregion splSelFun

// #endregion Helpers



// #region Exports

export { splSelFun }; // What: Named Export. Why: Help mode and the tour runner both try a selector list's alternatives in turn. How: This exports splSelFun by name.

// #endregion Exports


