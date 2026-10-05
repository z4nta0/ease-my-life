


// #region Imports

import { isoDayFun } from '../utils/date.ts'; // What: Iso Day Function. Why: Dates are stored and compared as local-calendar YYYY-MM-DD keys. How: This formats a Date (or now) as that key.

// #endregion Imports



/**
 * pick-log.ts = Pick Log
 *
 * @summary
 * The pick log (state.pickLog) is an append-only, per-pick history that
 * powers the Stats tab: one flat list, not a table per picker, filtered
 * by date/pickerId as needed. Each row is a single pick that landed on
 * the Today list:
 *   { id, eid, date, pickerId, itemId, itemName, pickerName, group,
 *     done, completedAt, source }
 * date is the 'YYYY-MM-DD' the pick was placed on Today; eid links to a
 * live today.entries row (null once the day rolls); source is 'auto'
 * (placed by the Daily generator) or 'manual' (sent from the Pickers
 * tab). itemName/pickerName/group are denormalized so the log survives
 * an item/picker rename or delete, the same trick reminderLog uses. The
 * old per-day aggregate `history` is gone: Stats derives daily totals,
 * rankings, and streaks from this log on the fly.
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

let __pclSeqNum = 0; // What: Pick-Log Sequence Number. Why: newLogFun below needs a shared counter across every call so two ids minted in the same millisecond still differ. How: This starts at 0 and is incremented once per newLogFun call.

// #endregion Module State



// #region Helpers

// #region newLogFun

/**
 * newLogFun = New Log Function
 *
 * @summary
 * Mints a new, distinct id for one state.pickLog row, sharing one
 * module-private counter so two ids minted in the same millisecond
 * still never collide.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns A new pick-log row id string, prefixed 'pl_'.
 *
 * @example
 * ```ts
 * newLogFun() // => 'pl_abc123xy'
 * ```
 *
*/

function newLogFun () {


	return 'pl_' + Date.now().toString( 36 ) + ( __pclSeqNum++ ).toString( 36 ); // What: Pick-Log Id Return. Why: The caller needs a short, sortable, collision-resistant id. How: This concatenates a fixed prefix, the current time base-36, and the incrementing counter base-36.


}

// #endregion newLogFun



// #region logRowFun

/**
 * logRowFun = Log Row Function
 *
 * @summary
 * Builds a fresh state.pickLog row for itemId under pickerId,
 * denormalizing the item's/picker's own current name/group so the row
 * survives a later rename or delete of either.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curStaObj             - Current State Object: The current state,
 *                                read (not mutated) to look up the item and
 *                                picker being logged.
 * @param logFieObj             - Log Field Object: The row's own fields, read
 *                                by property since their keys are the
 *                                persisted row's own.
 * @param logFieObj.date        - Date: The 'YYYY-MM-DD' to stamp the row with;
 *                                defaults to today.
 * @param logFieObj.depletedEnd - Depleted End: Whether this row ends an Ease
 *                                Down depletion streak; defaults to false.
 * @param logFieObj.eid         - Entry Identifier: Links the row to its
 *                                live today.entries row; defaults to null.
 * @param logFieObj.itemId      - Item Id: The item that was picked.
 * @param logFieObj.pickerId    - Picker Id: The picker the pick belongs to.
 * @param logFieObj.source      - Source: How the pick was made: 'auto' |
 *                                'manual' | 'reroll'.
 *
 * @returns A new pickLog row, in state.pickLog's own shape.
 *
 * @example
 * ```ts
 * logRowFun(curStaObj, { itemId, pickerId, source: 'auto' }) // => row
 * ```
 *
*/

function logRowFun ( curStaObj, logFieObj ) {


	const curIteObj = curStaObj.items.find( ( iteFinObj ) => iteFinObj.id === logFieObj.itemId );     // What: Current Item Object And Guard. Why: The row below needs the item's own live name, or a removed-item fallback. How: This looks up logFieObj.itemId in curStaObj.items, undefined once removed.
	const curPicObj = curStaObj.pickers.find( ( picFinObj ) => picFinObj.id === logFieObj.pickerId ); // What: Current Picker Object And Guard. Why: The row below needs the picker's own live name/group, or removed-picker fallbacks. How: This looks up logFieObj.pickerId in curStaObj.pickers, undefined once removed.



	return { // What: Pick-Log Row Return. Why: The caller needs one fresh row shaped to state.pickLog's own contract. How: This builds the row from every argument plus the lookups above.


		completedAt : null,                                               // What: Completed At. Why: A freshly-logged pick has no completion timestamp yet. How: This is always null for a brand-new row.
		date        : logFieObj.date || isoDayFun(),                      // What: Date. Why: Stats groups/filters rows by their own calendar day. How: This uses the given logFieObj.date, defaulting to isoDayFun() when omitted.
		done        : false,                                              // What: Done. Why: A freshly-logged pick was never yet completed. How: This is always false for a brand-new row.
		eid         : logFieObj.eid === undefined ? null : logFieObj.eid, // What: Entry Identifier. Why: This links the row back to its live today.entries row, until the day rolls. How: This copies logFieObj.eid, defaulting to null when omitted.
		group       : curPicObj ? curPicObj.group : '',                   // What: Group. Why: Stats groups rows by their own picker's group. How: This reads curPicObj's own group, else empty when the picker is gone.
		id          : newLogFun(),                                        // What: Id. Why: Every row needs its own stable, unique identifier. How: This mints one via newLogFun.
		itemId      : logFieObj.itemId,                                   // What: Item Id. Why: Every row must record which item it belongs to. How: This is copied straight from logFieObj.itemId.
		itemName    : curIteObj ? curIteObj.name : '(removed)',           // What: Item Name. Why: This denormalized copy lets the row survive a later rename or deletion of the item itself. How: This reads curIteObj's own name, else a removed-item placeholder.
		pickerId    : logFieObj.pickerId,                                 // What: Picker Id. Why: Every row must record which picker it belongs to. How: This is copied straight from logFieObj.pickerId.
		pickerName  : curPicObj ? curPicObj.name : '(removed)',           // What: Picker Name. Why: This denormalized copy lets the row survive a later rename or deletion of the picker itself. How: This reads curPicObj's own name, else a removed-picker placeholder.
		source      : logFieObj.source,                                   // What: Source. Why: Stats breaks rows down by how the pick was made. How: This is copied straight from logFieObj.source.

		...( logFieObj.depletedEnd ? { depletedEnd : true } : {} ) // What: Depleted End Spread. Why: Only a row ending an Ease Down depletion streak needs this flag at all. How: This spreads in depletedEnd:true only when logFieObj.depletedEnd is truthy, so an omitted flag adds nothing.


	};


}

// #endregion logRowFun

// #endregion Helpers



// #region Exports

export { logRowFun }; // What: Named Export. Why: Every action that lands a pick on Today appends a row. How: This exports logRowFun by name; the id generator and its counter stay private to this file.

// #endregion Exports


