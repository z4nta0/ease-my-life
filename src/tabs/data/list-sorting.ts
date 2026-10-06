


// #region Imports

import type { RefObject } from 'react'; // What: Ref Object. Why: The frozen row's position persists across renders in the caller's ref. How: This types freEdiFun's froRowRef.

// #endregion Imports



/**
 * list-sorting.ts = List Sorting
 *
 * @summary
 * The Data tab's shared list-sorting helpers: one comparator that sorts every
 * section and item list by the same vocabulary of keys, and a helper that
 * keeps the row being edited from jumping around a live sort.
 *
 * Sections:
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Helpers

type SorRowTyp = { name : string } & Record< string, any >; // What: Sort Row Type. Why: The Data tab sorts items, conditionals, reminders, and pickers with one comparator, each carrying different fields. How: This is any row with a name, its other fields read by whichever sort key applies.

// #region sorEntFun

/**
 * sorEntFun = Sort Entries Function
 *
 * @summary
 * Shared sort vocabulary for the Data tab's section list (Conditionals
 * / Reminders / each picker card) and, per section, its own item list
 * (picker pool items, conditionals, reminders). Each list builds its
 * own array of { name, type, group, count, range, odds, boost, date,
 * isActive } rows (fields that don't apply to a given row are null)
 * and sorts them with this one comparator, keyed by e.g. 'name-asc' or
 * 'count-desc'.
 *
 * group/date/isActive are N/A (null) for anything that doesn't have a
 * meaningful single value for that field (the Conditionals/Reminders
 * section as a whole, an item type with no such concept, or, for
 * date, a reminder with no next occurrence at all): those sort to the
 * top for the forward direction and the bottom for the reverse,
 * rather than being forced into a fake value. range/odds/boost are
 * different: null on a row means the field is irrelevant to that
 * row's own mode (mixed into the same list as rows it does apply to,
 * e.g. Odds/Boost only mean something for a weighted/dynamic
 * conditional, Range only for an ease-up/ease-down one), so those
 * always sort to the bottom in EITHER direction, rather than flipping
 * to the top on a reverse sort the way a genuinely missing value
 * would. Ties always fall back to name (A-Z); a reverse sort only
 * flips the primary field's comparison, never that tie-break.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param rowOneObj - Row One Object: The left-hand row to compare.
 * @param rowTwoObj - Row Two Object: The right-hand row to compare.
 * @param sorKeyStr - Sort Key String: The sort key, e.g. 'name-asc' or
 *                    'count-desc'; everything before the last dash names the
 *                    field, the trailing 'asc'/'desc' names the direction.
 *
 * @returns A standard Array.prototype.sort comparator result: negative
 * when rowOneObj sorts first, positive when rowTwoObj sorts first, 0 on a
 * genuine tie.
 *
 * @example
 * ```ts
 * sorEntFun(rowOneObj, rowTwoObj, sorKeyStr) // => -1 | 0 | 1
 * ```
 *
*/

function sorEntFun ( rowOneObj : SorRowTyp, rowTwoObj : SorRowTyp, sorKeyStr : string ) : number {


	const [ fieNamStr, sorDirStr ] = sorKeyStr.split( '-' ); // What: Field Name String And Direction String. Why: Every sort key packs both which field to compare and which way, joined by a dash. How: This splits sorKeyStr once into the two pieces every branch below reads.

	const revSorBoo = sorDirStr === 'desc'; // What: Reverse Sort Boolean. Why: Every branch below needs to know whether to flip its own comparison. How: This is true only when sorDirStr is exactly 'desc'.


	const namSorFun = () => rowOneObj.name.localeCompare( rowTwoObj.name ); // What: Name Sort Function. Why: Every field's own tie-break, and the fallback for an unrecognized field, both need the same plain A-Z name comparison. How: This calls String.localeCompare between the two rows' own name fields.


	const dirNulFun = ( cmpOneVal : unknown, cmpTwoVal : unknown ) => { // What: Direction Null Function. Why: A field that's genuinely missing (not merely irrelevant) should sort to whichever end the current direction implies, rather than being forced into a fake value. How: This returns a real comparison result when either side is null/undefined, or null to mean both sides are real values and the caller does the actual field comparison.


		const nulOneBoo = cmpOneVal == null; // What: Null One Boolean. Why: The 3 outcomes below all depend on which side (if any) is actually missing. How: This checks cmpOneVal with a loose null comparison, matching undefined too.
		const nulTwoBoo = cmpTwoVal == null; // What: Null Two Boolean. Why: Same reasoning as nulOneBoo, for the other side. How: This checks cmpTwoVal with a loose null comparison, matching undefined too.


		if ( nulOneBoo && nulTwoBoo ) return namSorFun(); // What: Both Null Check. Why: Two equally-missing rows have nothing else to compare by. How: This falls back to the plain name tie-break.



		if ( nulOneBoo ) return revSorBoo ? 1 : -1; // What: A Null Check. Why: A missing left side sorts to the top ascending, bottom descending. How: This returns the direction-appropriate sentinel comparison result.



		if ( nulTwoBoo ) return revSorBoo ? -1 : 1; // What: B Null Check. Why: Same reasoning as the A Null check, mirrored for the right side. How: This returns the direction-appropriate sentinel comparison result.



		return null; // What: Both Real Return. Why: Neither side was missing, so this helper has nothing useful to say. How: This signals the caller to fall through to its own real field comparison.


	};


	const lasNulFun = ( cmpOneVal : unknown, cmpTwoVal : unknown ) => { // What: Last Null Function. Why: A field that's irrelevant to a row (not missing, just N/A for its own mode) should always sort last in EITHER direction, unlike a genuinely missing value. How: This is the same idea as dirNulFun, except both null cases return a fixed "goes last" result regardless of revSorBoo.


		const nulOneBoo = cmpOneVal == null; // What: Null One Boolean. Why: The 3 outcomes below all depend on which side (if any) is actually N/A. How: This checks cmpOneVal with a loose null comparison, matching undefined too.
		const nulTwoBoo = cmpTwoVal == null; // What: Null Two Boolean. Why: Same reasoning as nulOneBoo, for the other side. How: This checks cmpTwoVal with a loose null comparison, matching undefined too.


		if ( nulOneBoo && nulTwoBoo ) return namSorFun(); // What: Both Null Check. Why: Two equally-N/A rows have nothing else to compare by. How: This falls back to the plain name tie-break.



		if ( nulOneBoo ) return 1; // What: A Null Check. Why: An N/A left side always sorts last, regardless of direction. How: This returns a fixed "a goes after b" result.



		if ( nulTwoBoo ) return -1; // What: B Null Check. Why: Same reasoning as the A Null check, mirrored for the right side. How: This returns a fixed "b goes after a" result.



		return null; // What: Both Real Return. Why: Neither side was N/A, so this helper has nothing useful to say. How: This signals the caller to fall through to its own real field comparison.


	};


	const numLasFun = ( cmpOneVal : number | null, cmpTwoVal : number | null ) => { // What: Numeric Last Function. Why: A numeric field (Range/Odds/Boost) that's irrelevant to a row needs the same "always last" rule as lasNulFun, plus the actual numeric comparison once both sides are real. How: This defers to lasNulFun first, then subtracts the two values and applies revSorBoo/the name tie-break.


		const notAvaNum = lasNulFun( cmpOneVal, cmpTwoVal ); // What: Not Available Number. Why: A real comparison result from lasNulFun means one side was N/A and nothing more needs computing. How: This calls lasNulFun and checks its result before doing any real math.


		if ( notAvaNum != null ) return notAvaNum; // What: Not Available Check. Why: An N/A result from lasNulFun already fully answers this comparison. How: This returns that result directly instead of falling through to the numeric comparison below.



		const priCmpNum = cmpOneVal! - cmpTwoVal!; // What: Primary Compare Number. Why: Both sides are confirmed real numbers at this point, so a plain subtraction is a valid ascending comparison. How: This subtracts cmpTwoVal from cmpOneVal. // What: Non-Null Note. Why: lasNulFun only returns null once both values are real. How: The ! tells TypeScript both are numbers here.



		return ( revSorBoo ? -priCmpNum : priCmpNum ) || namSorFun(); // What: Numeric Compare Return. Why: The caller needs the actual final ordering, flipped for a descending sort, falling back to name on an exact tie. How: This negates priCmpNum when reversed, then falls back to namSorFun() only when the numeric comparison itself was exactly 0.


	};


	switch ( fieNamStr ) { // What: Field Switch. Why: Each sortable field has its own distinct comparison rule, keyed by name. How: This dispatches to one of the branches below, falling back to a plain name comparison for any unrecognized field.


		case 'name': return revSorBoo ? -namSorFun() : namSorFun(); // What: Name Case Return. Why: Sorting by name itself is just the plain comparison, optionally flipped. How: This negates namSorFun()'s result when revSorBoo is true.

		case 'type': { // What: Type Case Block. Why: Type has no N/A concept at all, unlike most other fields, so it skips straight to a real comparison. How: This compares the two rows' own type strings, flips for descending, and falls back to name on a tie.


			const priCmpNum = rowOneObj.type.localeCompare( rowTwoObj.type ); // What: Primary Compare Number. Why: This is the actual field comparison this case exists to perform. How: This calls String.localeCompare between the two rows' own type fields.



			return ( revSorBoo ? -priCmpNum : priCmpNum ) || namSorFun(); // What: Type Case Return. Why: The caller needs the actual final ordering, flipped for a descending sort, falling back to name on an exact tie. How: This negates priCmpNum when reversed, then falls back to namSorFun() only on an exact tie.


		}

		case 'group': { // What: Group Case Block. Why: Group can be genuinely N/A for a row with no meaningful single group. How: This defers to dirNulFun first, then compares the two rows' own group strings.


			const notAvaNum = dirNulFun( rowOneObj.group, rowTwoObj.group ); // What: Not Available Number. Why: A real result from dirNulFun already fully answers this comparison. How: This calls dirNulFun and checks its result before doing any real comparison.


			if ( notAvaNum != null ) return notAvaNum; // What: Not Available Check. Why: An N/A result from dirNulFun already fully answers this comparison. How: This returns that result directly instead of falling through.



			const priCmpNum = rowOneObj.group.localeCompare( rowTwoObj.group ); // What: Primary Compare Number. Why: Both sides are confirmed real strings at this point. How: This calls String.localeCompare between the two rows' own group fields.



			return ( revSorBoo ? -priCmpNum : priCmpNum ) || namSorFun(); // What: Group Case Return. Why: The caller needs the actual final ordering, flipped for a descending sort, falling back to name on an exact tie. How: This negates priCmpNum when reversed, then falls back to namSorFun() only on an exact tie.


		}

		case 'count': { // What: Count Case Block. Why: Count is always a real number for every row, with no N/A concept at all. How: This compares the two rows' own count fields directly.


			const priCmpNum = rowOneObj.count - rowTwoObj.count; // What: Primary Compare Number. Why: This is the actual field comparison this case exists to perform. How: This subtracts rowTwoObj.count from rowOneObj.count.



			return ( revSorBoo ? -priCmpNum : priCmpNum ) || namSorFun(); // What: Count Case Return. Why: The caller needs the actual final ordering, flipped for a descending sort, falling back to name on an exact tie. How: This negates priCmpNum when reversed, then falls back to namSorFun() only on an exact tie.


		}

		case 'date': { // What: Date Case Block. Why: Date can be genuinely N/A for a reminder with no next occurrence at all. How: This defers to dirNulFun first, then compares the two rows' own date fields.


			const notAvaNum = dirNulFun( rowOneObj.date, rowTwoObj.date ); // What: Not Available Number. Why: A real result from dirNulFun already fully answers this comparison. How: This calls dirNulFun and checks its result before doing any real comparison.


			if ( notAvaNum != null ) return notAvaNum; // What: Not Available Check. Why: An N/A result from dirNulFun already fully answers this comparison. How: This returns that result directly instead of falling through.



			const priCmpNum = rowOneObj.date - rowTwoObj.date; // What: Primary Compare Number. Why: Both sides are confirmed real timestamps at this point. How: This subtracts rowTwoObj.date from rowOneObj.date.



			return ( revSorBoo ? -priCmpNum : priCmpNum ) || namSorFun(); // What: Date Case Return. Why: The caller needs the actual final ordering, flipped for a descending sort, falling back to name on an exact tie. How: This negates priCmpNum when reversed, then falls back to namSorFun() only on an exact tie.


		}

		case 'range': return numLasFun( rowOneObj.range, rowTwoObj.range ); // What: Range Case Return. Why: Range only means something for an ease-up/ease-down conditional, so it always sorts last on any other mode. How: This defers entirely to numLasFun.

		case 'odds': return numLasFun( rowOneObj.odds, rowTwoObj.odds ); // What: Odds Case Return. Why: Odds only means something for a weighted/dynamic conditional, so it always sorts last on any other mode. How: This defers entirely to numLasFun.

		case 'boost': return numLasFun( rowOneObj.boost, rowTwoObj.boost ); // What: Boost Case Return. Why: Boost only means something for a dynamic conditional, so it always sorts last on any other mode. How: This defers entirely to numLasFun.

		case 'active': { // What: Active Case Block. Why: isActive can be genuinely N/A for a row with no single meaningful active state. How: This defers to dirNulFun first, then compares the two rows' own boolean isActive fields.


			const notAvaNum = dirNulFun( rowOneObj.isActive, rowTwoObj.isActive ); // What: Not Available Number. Why: A real result from dirNulFun already fully answers this comparison. How: This calls dirNulFun and checks its result before doing any real comparison.


			if ( notAvaNum != null ) return notAvaNum; // What: Not Available Check. Why: An N/A result from dirNulFun already fully answers this comparison. How: This returns that result directly instead of falling through.



			if ( rowOneObj.isActive !== rowTwoObj.isActive ) { // What: Active Difference Check. Why: A plain boolean subtraction doesn't work, so an unequal pair needs its own explicit comparison. How: This picks -1/1 based on which row is active, then flips it for a descending sort.


				const priCmpNum = rowOneObj.isActive ? -1 : 1; // What: Primary Compare Number. Why: An active row should sort before an inactive one, ascending. How: This picks -1 when rowOneObj is the active one, 1 otherwise.



				return revSorBoo ? -priCmpNum : priCmpNum; // What: Active Case Return. Why: The caller needs the actual final ordering, flipped for a descending sort. How: This negates priCmpNum when reversed.


			}



			return namSorFun(); // What: Active Tie Return. Why: Two rows with the same active state have nothing else to compare by for this field. How: This falls back to the plain name tie-break.


		}

		default: return namSorFun(); // What: Default Case Return. Why: An unrecognized field has no dedicated rule, so name is a safe universal fallback. How: This returns the plain name comparison.


	}


}

// #endregion sorEntFun



// #region freEdiFun

/**
 * freEdiFun = Freeze Edited Function
 *
 * @summary
 * Keeps whichever row is currently open for editing from jumping
 * around a live sort (picker items and reminders both write each
 * keystroke straight to the store, so their sort key can change mid-
 * edit): a brand-new row (still being named for the first time, id
 * === newIdeVal) pins to the very top, matching where its own
 * "+ Add" button sits, rather than wherever its still-default values
 * would otherwise sort it; an existing row being edited freezes at
 * whatever index it already occupied when editing began, instead of
 * chasing its live-typed values through the sort in real time.
 * froRowRef is a plain useRef({}) owned by the caller, persisted
 * across renders for as long as opeIdeVal stays the same; the caller is
 * responsible for replaying the row's entrance animation once its
 * editor actually closes (opeIdeVal changes away), so it settles into
 * its now-current live position with the same visual treatment a
 * freshly-created row already gets, rather than silently snapping
 * there.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param sorLisArr  - Sort List Array: The list, already sorted by the
 *                     caller's own live sort key.
 * @param opeIdeVal  - Open Identifier Value: The currently-open row's own id,
 *                     or null/undefined when nothing is open.
 * @param newIdeVal  - New Identifier Value: The id of a row that was just
 *                     created (pins to the top instead of freezing at its live
 *                     index).
 * @param froRowRef  - Frozen Row Reference: A ref, owned by the caller, that
 *                     persists the frozen { ideVal, indNum } record across
 *                     renders.
 *
 * @returns sorLisArr unmodified when nothing is open or the open row
 * isn't in this list, otherwise the same rows with the open one
 * reinserted at its own frozen position.
 *
 * @example
 * ```ts
 * freEdiFun(sorLisArr, opeIdeVal, newIdeVal, froRowRef) // => reordered array
 * ```
 *
*/

function freEdiFun< T extends { id : string } > ( sorLisArr : T[], opeIdeVal : string | null | undefined, newIdeVal : string | null | undefined, froRowRef : RefObject< { ideVal : string, indNum : number } | null > ) : T[] {


	if ( opeIdeVal == null ) { // What: No Open Row Guard. Why: With nothing currently open for editing, there is no frozen position to maintain at all. How: This clears any stale frozen record and returns the live sorted list completely unmodified.


		froRowRef.current = null; // What: Frozen Row Reference Clear. Why: A stale frozen record from a previously-open row must not leak into a later editing session. How: This resets froRowRef back to null.



		return sorLisArr; // What: Live List Return. Why: With nothing open, the caller's own live sort order is already correct. How: This returns sorLisArr unmodified.


	}



	const livIndNum = sorLisArr.findIndex( ( curRowObj ) => curRowObj.id === opeIdeVal ); // What: Live Index Number. Why: The frozen position logic below needs to know where the open row currently sits in the live sort. How: This searches sorLisArr for the row whose id matches opeIdeVal.


	if ( livIndNum === -1 ) return sorLisArr; // What: Not Found Guard. Why: A list that doesn't contain the currently-open row has nothing to freeze at all. How: This returns sorLisArr unmodified when no matching row was found.



	if ( !froRowRef.current || froRowRef.current.ideVal !== opeIdeVal ) { // What: Frozen Record Guard. Why: A frozen position must only be computed once per "this row became the open one" session, not recomputed on every render while it stays open. How: This (re)computes froRowRef only when there's no existing record or it belongs to a different row than the currently-open one.


		froRowRef.current = { // What: Frozen Record Set. Why: A brand-new row pins to the very top matching its own "+ Add" button, while an existing row freezes at whatever index it already occupied. How: This records the open row's id plus its own starting index, 0 for a just-created row, livIndNum otherwise.


			ideVal : opeIdeVal,                              // What: Identifier Value. Why: A later render must be able to tell whether this record still belongs to the open row. How: This stores opeIdeVal.
			indNum : opeIdeVal === newIdeVal ? 0 : livIndNum // What: Index Number. Why: This is the position the open row stays frozen at. How: This is 0 for a just-created row, livIndNum otherwise.


		};


	}



	const opeRowObj = sorLisArr[ livIndNum ];                                          // What: Open Row Object. Why: The final result needs the actual open row's own data to reinsert at its frozen position. How: This reads the row at livIndNum from sorLisArr.
	const resRowArr = sorLisArr.filter( ( curRowObj ) => curRowObj.id !== opeIdeVal ); // What: Rest Row Array. Why: The open row must be pulled out before it can be reinserted at a fixed position rather than wherever it currently live-sorts to. How: This filters sorLisArr down to every row except the open one.
	const insIndNum = Math.min( froRowRef.current.indNum, resRowArr.length );          // What: Insert Index Number. Why: A frozen index from an earlier, longer list must not run past the current (possibly shorter) rest array. How: This clamps froRowRef's own recorded index to resRowArr's own current length.



	return [ ...resRowArr.slice( 0, insIndNum ), opeRowObj, ...resRowArr.slice( insIndNum ) ]; // What: Frozen Order Return. Why: The caller needs the open row reinserted at its own frozen position rather than wherever it currently live-sorts to. How: This splices opeRowObj back into resRowArr at insIndNum.


}

// #endregion freEdiFun

// #endregion Helpers



// #region Exports

export { freEdiFun, sorEntFun, type SorRowTyp }; // What: Named Exports. Why: The Data tab and the reminders manager sort their lists with these helpers. How: This exports sorEntFun, freEdiFun, and the sort row type by name.

// #endregion Exports


