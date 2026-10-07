


// #region Imports

import { addDayFun } from './dates.ts';          // What: Add Day Function. Why: Ranges and streaks step back by days. How: This shifts a date.
import { locDayFun } from '../support/clock.ts'; // What: Local Day Function. Why: Reminder completions are counted by their Chicago day. How: This reads a timestamp's date.


import type { StaAppTyp } from '../../src/core/data-model.ts'; // What: State App Type. Why: Every figure is recomputed from the saved state. How: This types the state parameter.

// #endregion Imports



/**
 * check-stats.ts = Check Stats
 *
 * @summary
 * Recomputes, from the raw logs, the figures the Stats tab shows, so the
 * simulation can compare them with what's on screen. A range keeps rows
 * dated within the last N days, today included, or every row for All Time.
 *
 * Pick figures count the pick log's rows that weren't re-rolled away or
 * skipped, for pickers that aren't hidden, done or not: items done, the
 * completion rate (done over all such rows, rounded), full days (days where
 * every row is done), active days, the day streak (consecutive days back
 * from today, or from yesterday when today has no rows, each with at least
 * one done row), how picks were chosen by source, and the five most picked
 * items. Reminder figures count completions of classes with stats on, for
 * reminders that aren't hidden: total, active days, and the busiest day's
 * count. Conditional figures count the conditional log: triggered days,
 * cycles (every row), and the fire rate.
 *
 * Sections:
 *  - Types
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Types

type ExpStaTyp = { // What: Expected Stats Type. Why: The simulation compares each figure with the screen. How: This holds every expected figure as the text the tab shows.


	conCycStr : string;   // What: Conditional Cycles String. Why: The conditionals card shows its cycle count. How: This is that count as text.
	conFirStr : string;   // What: Conditional Fired String. Why: The conditionals card shows its trigger count. How: This is that count as text.
	conRatStr : string;   // What: Conditional Rate String. Why: The conditionals card shows its fire rate. How: This is the rounded percent with a % sign.
	mosPicArr : string[]; // What: Most Picked Array. Why: The Most picked card lists its top five. How: Each entry is an item's name and count.
	remActStr : string;   // What: Reminder Active String. Why: The reminders card shows its active days. How: This is that count as text.
	remBusStr : string;   // What: Reminder Busiest String. Why: The reminders card shows its busiest day's count. How: This is that count as text.
	remDonStr : string;   // What: Reminder Done String. Why: The reminders card shows its completions. How: This is that count as text.
	souCouArr : number[]; // What: Source Count Array. Why: The source breakdown shows auto, re-rolled, and hand-picked counts. How: This lists them in that order.
	staDonStr : string;   // What: Stats Done String. Why: The headline shows items done. How: This is that count as text.
	staFulStr : string;   // What: Stats Full String. Why: The headline shows full days. How: This is that count as text.
	staRatStr : string;   // What: Stats Rate String. Why: The headline shows the completion rate. How: This is the rounded percent with a % sign.
	staStrStr : string;   // What: Stats Streak String. Why: The headline shows the day streak. How: This is that count as text.


};

// #endregion Types



// #region Helpers

// #region expStaFun

/**
 * expStaFun = Expected Stats Function
 *
 * @summary
 * Every figure the Stats tab should show for a range, as the text it shows
 * it. The state must be read after the Stats tab has mounted, since
 * mounting it hides the onboarding sample pickers.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param staAppObj - State App Object: The saved state as Stats sees it.
 * @param todIsoStr - Today ISO String: The simulated today, as YYYY-MM-DD.
 * @param ranDayNum - Range Day Number: The range in days, or null for All
 *                    Time.
 *
 * @returns The expected figures.
 *
 * @example
 * ```ts
 * expStaFun(staAppObj, '2026-11-08', 7) // => { staDonStr: '61', ... }
 * ```
 *
*/

const expStaFun = ( staAppObj : StaAppTyp, todIsoStr : string, ranDayNum : number | null ) : ExpStaTyp => { // What: Expected Stats Function. Why: The Stats tab's figures must match the logs. How: This recomputes each one for the range.


	const cutIsoStr = ranDayNum === null ? '' : addDayFun( todIsoStr, -( ranDayNum - 1 ) );                                          // What: Cut ISO String. Why: A range keeps rows from its first day on. How: This is that day, or empty for All Time.
	const hidPicSet = new Set( staAppObj.pickers.filter( ( curPicObj ) => curPicObj.hidden ).map( ( curPicObj ) => curPicObj.id ) ); // What: Hidden Picker Set. Why: Hidden pickers' rows don't count. How: This collects their ids.
	const hidTasSet = new Set( staAppObj.tasks.filter( ( curTasObj ) => curTasObj.hidden ).map( ( curTasObj ) => curTasObj.id ) );   // What: Hidden Task Set. Why: Hidden reminders' completions don't count. How: This collects their ids.
	const dayAggMap = new Map< string, { donNum : number, totNum : number } >();                                                     // What: Day Aggregate Map. Why: Full days and the streak are per-day figures. How: This collects each day's done and total counts.


	const picRowArr = staAppObj.pickLog.filter( ( logRowObj ) => { // What: Pick Row Array. Why: Every pick figure counts these rows. How: This drops outcome rows, hidden pickers, and rows before the range.


		const notOutBoo = !logRowObj.outcome;                   // What: Not Outcome Boolean. Why: Outcome rows record skips and rejections, not picks. How: This checks the row has none.
		const visPicBoo = !hidPicSet.has( logRowObj.pickerId ); // What: Visible Picker Boolean. Why: Hidden pickers' rows don't count. How: This checks the row's picker isn't hidden.
		const aftCutBoo = logRowObj.date >= cutIsoStr;          // What: After Cut Boolean. Why: A range keeps rows from its first day on. How: This compares the row's date.

		const keeRowBoo = notOutBoo && visPicBoo && aftCutBoo; // What: Keep Row Boolean. Why: A row counts only when all three hold. How: This combines them.



		return keeRowBoo; // What: Keep Row Return. Why: The filter keeps the counted rows. How: This returns the combined check.


	} );



	for ( const logRowObj of picRowArr ) { // What: Day Aggregate Loop. Why: Each row adds to its day's counts. How: This tallies done and total by date.


		const dayAggObj = dayAggMap.get( logRowObj.date ) || { donNum : 0, totNum : 0 }; // What: Day Aggregate Object. Why: A day's running counts. How: This reads them or starts at zero.



		dayAggMap.set( logRowObj.date, { // What: Day Aggregate Set. Why: The row adds to its day. How: This stores the raised counts.


			donNum : dayAggObj.donNum + ( logRowObj.done ? 1 : 0 ), // What: Done Number. Why: A done row adds to the day's done count. How: This adds 1 when the row is done.
			totNum : dayAggObj.totNum + 1                           // What: Total Number. Why: Every row adds to the day's total. How: This adds 1.


		} );


	}



	let walDayStr = dayAggMap.has( todIsoStr ) ? todIsoStr : addDayFun( todIsoStr, -1 ); // What: Walk Day String. Why: The streak counts back from today, or yesterday when today has nothing yet. How: This picks the starting day.
	let strDayNum = 0;                                                                   // What: Streak Day Number. Why: The streak's running count. How: This starts at zero.



	while ( ( dayAggMap.get( walDayStr )?.donNum ?? 0 ) > 0 ) { strDayNum++; walDayStr = addDayFun( walDayStr, -1 ); } // What: Streak Walk Loop. Why: The streak is the run of days with something done. How: This counts back until a day without.



	const couMapObj = new Map< string, { couNum : number, namStr : string } >(); // What: Count Map Object. Why: Most picked counts rows per item, in first-seen order. How: This tallies each item's rows and keeps its latest name.



	for ( const logRowObj of picRowArr ) { // What: Item Count Loop. Why: Each row counts for its item. How: This raises the item's count and records its name.


		couMapObj.set( logRowObj.itemId, { // What: Item Count Set. Why: The row adds to its item's tally. How: This stores the raised count and the latest name.


			couNum : ( couMapObj.get( logRowObj.itemId )?.couNum ?? 0 ) + 1, // What: Count Number. Why: Each row is one more pick. How: This adds 1 to the item's count so far.
			namStr : logRowObj.itemName                                      // What: Name String. Why: The card shows the item's latest name. How: This records the row's name.


		} );


	}



	const remDayMap = new Map< string, number >(); // What: Reminder Day Map. Why: Active and busiest days are per-day figures. How: This counts completions per day.



	const remRowArr = staAppObj.reminderLog.filter( ( logRowObj ) => { // What: Reminder Row Array. Why: Reminder figures count enabled, visible completions in range. How: This filters the reminder log.


		const staEnaBoo = ( ( staAppObj.reminderOpts || {} )[ logRowObj.type ] || {} ).stats !== false; // What: Stats Enabled Boolean. Why: A reminder class can be left out of Stats. How: This reads the class's stats option.
		const visTasBoo = !hidTasSet.has( logRowObj.taskId );                                           // What: Visible Task Boolean. Why: Hidden reminders' completions don't count. How: This checks the row's reminder isn't hidden.
		const aftCutBoo = locDayFun( logRowObj.completedAt ) >= cutIsoStr;                              // What: After Cut Boolean. Why: A range keeps completions from its first day on. How: This compares the completion's day.

		const keeRowBoo = staEnaBoo && visTasBoo && aftCutBoo; // What: Keep Row Boolean. Why: A completion counts only when all three hold. How: This combines them.



		return keeRowBoo; // What: Keep Row Return. Why: The filter keeps the counted completions. How: This returns the combined check.


	} );



	for ( const logRowObj of remRowArr ) remDayMap.set( locDayFun( logRowObj.completedAt ), ( remDayMap.get( locDayFun( logRowObj.completedAt ) ) ?? 0 ) + 1 ); // What: Reminder Day Loop. Why: Each completion counts for its day. How: This raises the day's count.



	const conRowArr = staAppObj.conditionalLog.filter( ( logRowObj ) => logRowObj.date >= cutIsoStr ); // What: Conditional Row Array. Why: Conditional figures count rows in range. How: This filters the conditional log.
	const conFirNum = conRowArr.filter( ( logRowObj ) => logRowObj.triggered ).length;                 // What: Conditional Fired Number. Why: Triggered rows are fires. How: This counts them.
	const totDonNum = picRowArr.filter( ( logRowObj ) => logRowObj.done ).length;                      // What: Total Done Number. Why: Items done counts done rows. How: This counts them.



	return { // What: Expected Figures Return. Why: Each figure is compared as the tab's text. How: This formats every figure.


		conCycStr : String( conRowArr.length ),                                                      // What: Conditional Cycles String. Why: Every row is a cycle. How: This is the row count.
		conFirStr : String( conFirNum ),                                                             // What: Conditional Fired String. Why: Triggered rows are fires. How: This is their count.
		conRatStr : `${ conRowArr.length ? Math.round( conFirNum / conRowArr.length * 100 ) : 0 }%`, // What: Conditional Rate String. Why: The fire rate is fires over cycles. How: This is the rounded percent.
		mosPicArr : [ ...couMapObj.values() ].filter( ( couEntObj ) => couEntObj.couNum > 0 ).sort( ( oneEntObj, twoEntObj ) => twoEntObj.couNum - oneEntObj.couNum ).slice( 0, 5 ).map( ( couEntObj ) => `${ couEntObj.namStr } ${ couEntObj.couNum }` ), // What: Most Picked Array. Why: The card lists the five most picked items, ties in first-seen order. How: This sorts the counts stably and keeps the top five.
		remActStr : String( remDayMap.size ),                                                        // What: Reminder Active String. Why: Active days have a completion. How: This is the day count.
		remBusStr : String( Math.max( 0, ...remDayMap.values() ) ),                                  // What: Reminder Busiest String. Why: The busiest day has the most completions. How: This is the largest day count.
		remDonStr : String( remRowArr.length ),                                                      // What: Reminder Done String. Why: Every completion counts. How: This is the row count.
		souCouArr : [ 'auto', 'reroll', 'manual' ].map( ( souKeyStr ) => picRowArr.filter( ( logRowObj ) => logRowObj.source === souKeyStr ).length ), // What: Source Count Array. Why: The breakdown counts rows by source. How: This counts auto, re-rolled, and hand-picked rows.
		staDonStr : String( totDonNum ),                                                             // What: Stats Done String. Why: Items done counts done rows. How: This is that count.
		staFulStr : String( [ ...dayAggMap.values() ].filter( ( dayAggObj ) => dayAggObj.totNum > 0 && dayAggObj.donNum === dayAggObj.totNum ).length ), // What: Stats Full String. Why: A full day has every row done. How: This counts them.
		staRatStr : `${ Math.round( totDonNum / Math.max( 1, picRowArr.length ) * 100 ) }%`,         // What: Stats Rate String. Why: The completion rate is done over all rows. How: This is the rounded percent.
		staStrStr : String( strDayNum )                                                              // What: Stats Streak String. Why: The streak is the run of active days. How: This is the walked count.


	};


};

// #endregion expStaFun

// #endregion Helpers



// #region Exports

export { expStaFun, type ExpStaTyp }; // What: Named Exports. Why: The simulation compares the Stats tab with these figures. How: This exports expStaFun and its result type by name.

// #endregion Exports


