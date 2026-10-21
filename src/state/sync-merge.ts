


// #region Imports

import { COR_DOC_STR } from './sync-docs.ts'; // What: Core Document String. Why: Core is merged by taking one side whole. How: This names its document id.
import { LOG_SPE_ARR } from './sync-docs.ts'; // What: Log Specification Array. Why: A log month's rows are merged by their identity and day. How: This supplies both for each log.


import type { RawSavTyp } from '../core/data-model.ts'; // What: Raw Save Type. Why: Documents hold saved rows and state of any shape the app has written. How: This types the merged content.

// #endregion Imports



/**
 * sync-merge.ts = Sync Merge
 *
 * @summary
 * Merges one cloud document that two devices both changed since they last
 * synced. Core moves as a whole from the winning side, the device that saved
 * most recently: Today's list, the pickers, the items, and their staged pick
 * consequences have to stay consistent with each other, so they're never
 * mixed. A history log's month is merged row by row instead, since a day
 * spent offline on one device is history worth keeping: every row from
 * before today comes from either side (the winner's copy when both have it),
 * while today's rows come from the winner alone. Today's rows are the only
 * ones the app ever removes or replaces (regenerating, deleting an item, or
 * unchecking a reminder), so taking them from one side keeps a removal from
 * coming back, and keeps them matching the winner's own Today list.
 *
 * Sections:
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Helpers

// #region merDocFun

/**
 * merDocFun = Merge Document Function
 *
 * @summary
 * Merges one document both devices changed. Core, and any document that
 * isn't a known log month, is taken whole from the winner. A log month keeps
 * every row the winner holds, then adds each row the other side holds that's
 * dated before todDayStr and isn't already present, and finally orders the
 * rows by day, keeping each day's rows in the order they were added.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param docIdeStr - Document Identifier String: The document's id, such as
 *                    core or pickLog-2026-10.
 * @param locDocObj - Local Document Object: This device's content, or
 *                    undefined when it has none.
 * @param remDocObj - Remote Document Object: The cloud's content, or
 *                    undefined when it has none.
 * @param locWinBoo - Local Winner Boolean: Whether this device saved last,
 *                    making its side the winner.
 * @param todDayStr - Today Day String: Today's local 'YYYY-MM-DD', the first
 *                    day whose rows come from the winner alone.
 *
 * @returns The merged document.
 *
 * @example
 * ```ts
 * merDocFun('core', locDocObj, remDocObj, true, '2026-10-20') // => merged
 * ```
 *
*/

function merDocFun ( docIdeStr : string, locDocObj : RawSavTyp, remDocObj : RawSavTyp, locWinBoo : boolean, todDayStr : string ) : RawSavTyp {


	const winDocObj = locWinBoo ? locDocObj : remDocObj;                                                     // What: Winner Document Object. Why: The winner's content leads every merge. How: This picks the local side when it saved last, the cloud's otherwise.
	const losDocObj = locWinBoo ? remDocObj : locDocObj;                                                     // What: Loser Document Object. Why: Only the other side's older rows are added. How: This picks the side that didn't win.
	const logSpeObj = LOG_SPE_ARR.find( ( speCurObj ) => docIdeStr.startsWith( `${ speCurObj.keyStr }-` ) ); // What: Log Specification Object. Why: Only a log month merges row by row. How: This finds the log whose name prefixes the id, or undefined for core.



	if ( docIdeStr === COR_DOC_STR || !logSpeObj ) return winDocObj ?? losDocObj; // What: Whole Document Guard. Why: Core has to stay consistent with itself, so it isn't mixed. How: This returns the winner's copy, or the other side's when the winner has none.



	const winRowArr = winDocObj || []; // What: Winner Row Array. Why: Every winner row is kept. How: This reads the winner's rows, or none.
	const winIdeSet = new Set( winRowArr.map( ( rowCurObj : RawSavTyp ) => logSpeObj.ideFun( rowCurObj ) ) );                                                                  // What: Winner Identity Set. Why: A row both sides hold is taken from the winner, so the other side's copy is skipped. How: This collects the winner's row identities.
	const addRowArr = ( losDocObj || [] ).filter( ( rowCurObj : RawSavTyp ) => logSpeObj.dayFun( rowCurObj ) < todDayStr && !winIdeSet.has( logSpeObj.ideFun( rowCurObj ) ) ); // What: Added Row Array. Why: The other side's history from before today is kept, while its rows for today follow the winner. How: This keeps the other side's rows dated before todDayStr that the winner doesn't already hold.



	return [ ...winRowArr, ...addRowArr ].sort( ( rowOneObj, rowTwoObj ) => logSpeObj.dayFun( rowOneObj ).localeCompare( logSpeObj.dayFun( rowTwoObj ) ) ); // What: Merged Rows Return. Why: The merged month reads in day order, as a log is written. How: This sorts the rows by day, and since the sort is stable, each day's rows keep their order.


}

// #endregion merDocFun

// #endregion Helpers



// #region Exports

export { merDocFun }; // What: Named Export. Why: The sync engine merges a document both sides changed through this. How: This exports merDocFun by name.

// #endregion Exports


