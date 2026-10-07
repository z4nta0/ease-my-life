


// #region Imports

import { addDayFun } from './dates.ts';    // What: Add Day Function. Why: A weekly period starts some days back. How: This shifts a date by days.
import { difDayFun } from './dates.ts';    // What: Difference Day Function. Why: Reminder intervals count days from an anchor. How: This measures days between dates.
import { dimValFun } from './dates.ts';    // What: Days-In-Month Value Function. Why: Day-of-month rules clamp to the month's length. How: This reads a month's day count.
import { dowValFun } from './dates.ts';    // What: Day-Of-Week Value Function. Why: Weekly rules read the weekday. How: This reads a date's weekday.
import { isaHolFun } from './holidays.ts'; // What: Is-A Holiday Function. Why: Reminder classes can exclude holidays. How: This checks a date against the saved holidays.
import { isoParFun } from './dates.ts';    // What: ISO Parts Function. Why: Period starts are built from parts. How: This writes a year, month, and day as YYYY-MM-DD.
import { nthDayFun } from './dates.ts';    // What: Nth Day Function. Why: Nth-weekday schedules need the actual day. How: This finds the nth weekday of a month.
import { parIsoFun } from './dates.ts';    // What: Parts ISO Function. Why: Rules read a date's year, month, and day. How: This splits a date into numbers.


import type { PclRowTyp } from '../../src/core/data-model.ts'; // What: Pick-Log Row Type. Why: A period counts as run once a done row falls in it. How: This types comPerFun's log parameter.
import type { PicRcdTyp } from '../../src/core/data-model.ts'; // What: Picker Record Type. Why: Cadence rules read a picker's schedule fields. How: This types the picker parameters.
import type { StaAppTyp } from '../../src/core/data-model.ts'; // What: State App Type. Why: Reminder visibility reads the saved options and holidays. How: This types remVisFun's state parameter.
import type { TasRcdTyp } from '../../src/core/data-model.ts'; // What: Task Record Type. Why: Reminder rules read a reminder's repeat fields. How: This types the reminder parameters.

// #endregion Imports



/**
 * schedule.ts = Schedule
 *
 * @summary
 * The checker's own copy of when things come due, written from the rules
 * rather than from core/cadence.ts or core/tasks.ts.
 *
 * A non-daily picker runs once per period. A weekly period starts on the
 * anchor weekday; a monthly one on the anchor day of the month (clamped to
 * the month's length) or, in nth-weekday mode, on that month's nth weekday;
 * a yearly one on the anchor month and day the same way. A period counts as
 * run once the picker's lastRunPeriod names it or a done pick-log row for
 * the picker is dated on or after its start.
 *
 * A reminder's due days follow its repeat: a one-time reminder from its date
 * until it's done; weekly on its weekdays every N weeks counted in rolling
 * 7-day blocks from its anchor; every N days from its anchor; monthly on its
 * day or nth weekday every N months; yearly in its month on its day or nth
 * weekday every N years. An every-1 schedule ignores its anchor entirely. A
 * due reminder is shown unless it's hidden, skipped until a later day, or
 * excluded by its class's weekend or holiday option.
 *
 * Sections:
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Helpers

const eveNthFun = ( intValNum : number, uniCouNum : number ) : boolean => intValNum <= 1 || ( uniCouNum >= 0 && uniCouNum % intValNum === 0 ); // What: Every Nth Function. Why: Every-N schedules land on every Nth week, month, or year from the anchor. How: This passes every unit when N is 1, else only non-negative multiples of N.



const tdmDayFun = ( picRcdObj : PicRcdTyp, yeaValNum : number, monValNum : number, fieNamStr : 'anchorDay' | 'anchorDom' ) : number => ( picRcdObj.dateMode === 'nthWeekday' // What: Target-Day-Month Day Function. Why: Monthly and yearly anchors are a day number or an nth weekday. How: This resolves the anchor day for a given month.
	? nthDayFun( yeaValNum, monValNum, picRcdObj.nthOrdinal ?? 1, picRcdObj.nthWeekday ?? 0 )                                                                                // What: Nth Weekday Branch. Why: Nth-weekday mode anchors on a weekday. How: This finds that month's nth weekday.
	: Math.min( picRcdObj[ fieNamStr ] ?? 1, dimValFun( yeaValNum, monValNum ) ) );                                                                                          // What: Date Branch. Why: A day past the month's end falls on its last day. How: This clamps the anchor day to the month.



// #region perStaFun

/**
 * perStaFun = Period Start Function
 *
 * @summary
 * The first day of the cadence period a date falls in. A daily picker's
 * period is the day itself. A monthly anchor that doesn't exist this month
 * clamps, so with an anchor of 31, March 30 still belongs to the period
 * that began on the last day of February.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param picRcdObj - Picker Record Object: The picker whose cadence to read.
 * @param dayIsoStr - Day ISO String: The date, as YYYY-MM-DD.
 *
 * @returns The period's first day, as YYYY-MM-DD.
 *
 * @example
 * ```ts
 * perStaFun(weeklyPicker, '2026-10-08') // => '2026-10-05' for a Monday anchor
 * ```
 *
*/

const perStaFun = ( picRcdObj : PicRcdTyp, dayIsoStr : string ) : string => { // What: Period Start Function. Why: Non-daily pickers run once per period. How: This finds the period's first day by cadence.


	const [ yeaValNum, monValNum, dayValNum ] = parIsoFun( dayIsoStr ); // What: Year Month Day Numbers. Why: Monthly and yearly rules read the date's parts. How: This splits the date.



	if ( picRcdObj.cadence === 'weekly' ) return addDayFun( dayIsoStr, -( ( dowValFun( dayIsoStr ) - ( picRcdObj.anchorDow ?? dowValFun( dayIsoStr ) ) + 7 ) % 7 ) ); // What: Weekly Start Return. Why: A weekly period starts on the anchor weekday. How: This steps back to the latest anchor weekday.



	if ( picRcdObj.cadence === 'monthly' ) { // What: Monthly Start Branch. Why: A monthly period starts on the anchor day, this month or last. How: This compares the date with this month's anchor day.


		const tarDayNum = tdmDayFun( picRcdObj, yeaValNum, monValNum, 'anchorDom' ); // What: Target Day Number. Why: This month's period starts on its anchor day. How: This resolves it.



		if ( dayValNum >= tarDayNum ) return isoParFun( yeaValNum, monValNum, tarDayNum ); // What: This Month Return. Why: On or after the anchor, the period began this month. How: This returns this month's anchor day.



		const preYeaNum = monValNum === 1 ? yeaValNum - 1 : yeaValNum; // What: Previous Year Number. Why: January's previous month is last December. How: This steps the year back for January.
		const preMonNum = monValNum === 1 ? 12 : monValNum - 1;        // What: Previous Month Number. Why: Before the anchor, the period began last month. How: This is the month before.



		return isoParFun( preYeaNum, preMonNum, tdmDayFun( picRcdObj, preYeaNum, preMonNum, 'anchorDom' ) ); // What: Previous Month Start Return. Why: Before this month's anchor, the period began last month. How: This returns last month's clamped anchor date.


	}



	if ( picRcdObj.cadence === 'yearly' ) { // What: Yearly Start Branch. Why: A yearly period starts on the anchor month and day, this year or last. How: This compares the date with this year's anchor date.


		const ancMonNum = picRcdObj.anchorMonth ?? 1;                                                                   // What: Anchor Month Number. Why: The yearly anchor is a month and a day. How: This reads the month, defaulting to January.
		const curStaStr = isoParFun( yeaValNum, ancMonNum, tdmDayFun( picRcdObj, yeaValNum, ancMonNum, 'anchorDay' ) ); // What: Current Start String. Why: This year's period starts on its anchor date. How: This builds it.



		return dayIsoStr >= curStaStr ? curStaStr : isoParFun( yeaValNum - 1, ancMonNum, tdmDayFun( picRcdObj, yeaValNum - 1, ancMonNum, 'anchorDay' ) ); // What: Yearly Start Return. Why: Before this year's anchor, the period began last year. How: This returns this year's anchor or last year's.


	}



	return dayIsoStr; // What: Daily Start Return. Why: A daily period is the day itself. How: This returns the date unchanged.


};

// #endregion perStaFun



// #region comPerFun

/**
 * comPerFun = Completed Period Function
 *
 * @summary
 * Whether a non-daily picker has already run in the period a date falls in:
 * its lastRunPeriod names the period, or a done pick-log row for it is
 * dated on or after the period's start. Daily pickers never count as run.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param picRcdObj - Picker Record Object: The picker to check.
 * @param picLogArr - Pick Log Array: The saved pick log.
 * @param dayIsoStr - Day ISO String: The date, as YYYY-MM-DD.
 *
 * @returns Whether the period has already run.
 *
 * @example
 * ```ts
 * comPerFun(picRcdObj, staAppObj.pickLog, '2026-10-20') // => true or false
 * ```
 *
*/

const comPerFun = ( picRcdObj : PicRcdTyp, picLogArr : PclRowTyp[], dayIsoStr : string ) : boolean => { // What: Completed Period Function. Why: A period that already ran produces no pick. How: This checks lastRunPeriod and the done log rows.


	if ( ( picRcdObj.cadence || 'daily' ) === 'daily' ) return false; // What: Daily Guard. Why: Daily pickers run every day. How: This returns false for them.



	const perStaStr = perStaFun( picRcdObj, dayIsoStr ); // What: Period Start String. Why: Both checks compare against the period's start. How: This finds it.



	return picRcdObj.lastRunPeriod === perStaStr || picLogArr.some( ( logRowObj ) => { // What: Completed Period Return. Why: A finished run is recorded on the picker or in the log. How: This checks the saved period, then any done row since the period began.


		const samPicBoo = logRowObj.pickerId === picRcdObj.id; // What: Same Picker Boolean. Why: Only this picker's rows count. How: This compares the row's picker.
		const isaDonBoo = logRowObj.done;                      // What: Is-A Done Boolean. Why: Only a done row finishes a run. How: This reads the row's done flag.
		const aftStaBoo = logRowObj.date >= perStaStr;         // What: After Start Boolean. Why: Only rows since the period began count. How: This compares the row's date.

		const comRowBoo = samPicBoo && isaDonBoo && aftStaBoo; // What: Completed Row Boolean. Why: A row finishes the period only when all three hold. How: This combines them.



		return comRowBoo; // What: Completed Row Return. Why: The search stops at the first finishing row. How: This returns the combined check.


	} );


};

// #endregion comPerFun



// #region remDueFun

/**
 * remDueFun = Reminder Due Function
 *
 * @summary
 * Whether a reminder is due on a date by its repeat rule alone, before the
 * hidden, skip, weekend, and holiday filters. A one-time reminder stays due
 * from its date until it's done, and is still due, shown checked, on the
 * day it was done.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tasRcdObj - Task Record Object: The reminder to check.
 * @param dayIsoStr - Day ISO String: The date, as YYYY-MM-DD.
 *
 * @returns Whether the reminder is due that day.
 *
 * @example
 * ```ts
 * remDueFun(weeklyReminder, '2026-10-06') // => true or false
 * ```
 *
*/

const remDueFun = ( tasRcdObj : TasRcdTyp, dayIsoStr : string ) : boolean => { // What: Reminder Due Function. Why: The checker predicts which reminders Today shows. How: This applies the reminder's repeat rule to the date.


	const [ yeaValNum, monValNum, dayValNum ] = parIsoFun( dayIsoStr ); // What: Year Month Day Numbers. Why: Monthly and yearly rules read the date's parts. How: This splits the date.

	const intValNum = Math.max( 1, tasRcdObj.interval || 1 );                     // What: Interval Value Number. Why: Every repeat can skip units. How: This reads N, at least 1.
	const ancDayStr = ( tasRcdObj.anchor || tasRcdObj.createdAt ).slice( 0, 10 ); // What: Anchor Day String. Why: Every-N counts start from the anchor. How: This reads the anchor, falling back to the creation date.
	const [ ancYeaNum, ancMonNum ] = parIsoFun( ancDayStr );                      // What: Anchor Year Month Numbers. Why: Monthly and yearly counts are in whole months and years. How: This splits the anchor.
	const nthModBoo = tasRcdObj.dateMode === 'nthWeekday';                        // What: Nth Mode Boolean. Why: Monthly and yearly reminders can fall on an nth weekday. How: This reads the date mode.



	if ( tasRcdObj.repeat === 'once' ) return !( tasRcdObj.onceDate && dayIsoStr < tasRcdObj.onceDate ) && ( !tasRcdObj.lastDone || tasRcdObj.lastDone === dayIsoStr ); // What: Once Return. Why: A one-time reminder is due from its date until it's done. How: This checks the date and lastDone.



	if ( tasRcdObj.repeat === 'weekly' ) return ( tasRcdObj.daysOfWeek || [] ).includes( dowValFun( dayIsoStr ) ) && eveNthFun( intValNum, Math.floor( difDayFun( ancDayStr, dayIsoStr ) / 7 ) ); // What: Weekly Return. Why: A weekly reminder falls on its weekdays every N weeks. How: This checks the weekday and the 7-day block count.



	if ( tasRcdObj.repeat === 'interval' ) return difDayFun( ancDayStr, dayIsoStr ) >= 0 && difDayFun( ancDayStr, dayIsoStr ) % intValNum === 0; // What: Interval Return. Why: An interval reminder falls every N days from its anchor. How: This checks the day count.



	if ( tasRcdObj.repeat === 'monthly' ) { // What: Monthly Branch. Why: A monthly reminder falls on one day every N months. How: This checks the month count, then the day.


		if ( !eveNthFun( intValNum, ( yeaValNum - ancYeaNum ) * 12 + ( monValNum - ancMonNum ) ) ) return false; // What: Month Count Guard. Why: Only every Nth month counts. How: This returns false on other months.



		return dayValNum === ( nthModBoo ? nthDayFun( yeaValNum, monValNum, tasRcdObj.nthOrdinal || 1, tasRcdObj.nthWeekday ?? 0 ) : Math.min( tasRcdObj.dayOfMonth || 1, dimValFun( yeaValNum, monValNum ) ) ); // What: Monthly Due Return. Why: A monthly reminder falls on its nth weekday or its clamped date. How: This compares the day with whichever rule applies.


	}



	if ( tasRcdObj.repeat === 'annual' ) { // What: Annual Branch. Why: A yearly reminder falls on one day of its month every N years. How: This checks the month and year count, then the day.


		if ( monValNum !== tasRcdObj.month || !eveNthFun( intValNum, yeaValNum - ancYeaNum ) ) return false; // What: Month And Year Guard. Why: Only its month in every Nth year counts. How: This returns false otherwise.



		return dayValNum === ( nthModBoo ? nthDayFun( yeaValNum, tasRcdObj.month, tasRcdObj.nthOrdinal || 1, tasRcdObj.nthWeekday ?? 0 ) : Math.min( tasRcdObj.day || 1, dimValFun( yeaValNum, tasRcdObj.month ) ) ); // What: Yearly Due Return. Why: A yearly reminder falls in its month on its nth weekday or its clamped date. How: This compares the day with whichever rule applies.


	}



	return false; // What: Not Due Return. Why: Any other repeat never falls due. How: This returns false.


};

// #endregion remDueFun



// #region remVisFun

/**
 * remVisFun = Reminder Visible Function
 *
 * @summary
 * Whether Today shows a reminder on a date: due by its rule, not hidden, not
 * skipped until a later day, and not excluded by its class's weekend or
 * holiday option. One-time reminders use the once class, the rest the
 * recurring class, each defaulting to no exclusions.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tasRcdObj - Task Record Object: The reminder to check.
 * @param staAppObj - State App Object: The saved state, for its reminder
 *                    options and holidays.
 * @param dayIsoStr - Day ISO String: The date, as YYYY-MM-DD.
 *
 * @returns Whether Today shows the reminder.
 *
 * @example
 * ```ts
 * remVisFun(reminder, staAppObj, '2026-10-06') // => true or false
 * ```
 *
*/

const remVisFun = ( tasRcdObj : TasRcdTyp, staAppObj : StaAppTyp, dayIsoStr : string ) : boolean => { // What: Reminder Visible Function. Why: The checker compares Today's reminders with this prediction. How: This applies the due rule and every filter.


	const claOptObj = ( staAppObj.reminderOpts || {} )[ tasRcdObj.repeat === 'once' ? 'once' : 'recurring' ] || {}; // What: Class Options Object. Why: Weekend and holiday exclusions are set per reminder class. How: This reads the reminder's class options.
	const dowValNum = dowValFun( dayIsoStr );                                                                       // What: Day-Of-Week Value Number. Why: The weekend exclusion reads the weekday. How: This reads it.

	const wkdExcBoo = !!claOptObj.excludeWeekends && ( dowValNum === 0 || dowValNum === 6 );     // What: Weekend Excluded Boolean. Why: A class can sit out weekends. How: This is true on a weekend when the option is on.
	const holExcBoo = !!claOptObj.excludeHolidays && isaHolFun( staAppObj.holidays, dayIsoStr ); // What: Holiday Excluded Boolean. Why: A class can sit out holidays. How: This is true on a holiday when the option is on.
	const skiActBoo = !!tasRcdObj.skipUntil && dayIsoStr < tasRcdObj.skipUntil;                  // What: Skip Active Boolean. Why: A skipped reminder hides until its skip date. How: This is true before it.
	const notHidBoo = !tasRcdObj.hidden;                                                         // What: Not Hidden Boolean. Why: A hidden reminder never shows. How: This checks its hidden flag.
	const isaDueBoo = remDueFun( tasRcdObj, dayIsoStr );                                         // What: Is-A Due Boolean. Why: A reminder shows only on a due day. How: This applies the due rule.
	const notExcBoo = !( wkdExcBoo || holExcBoo || skiActBoo );                                  // What: Not Excluded Boolean. Why: Any exclusion hides the reminder. How: This is true when none applies.

	const visRemBoo = notHidBoo && isaDueBoo && notExcBoo; // What: Visible Reminder Boolean. Why: A reminder shows when it's due and nothing excludes it. How: This combines the due check with every exclusion.



	return visRemBoo; // What: Visible Return. Why: The checker compares this with Today's reminders. How: This returns the combined check.


};

// #endregion remVisFun

// #endregion Helpers



// #region Exports

export { comPerFun, perStaFun, remDueFun, remVisFun }; // What: Named Exports. Why: The generation and reminder checks predict schedules through these. How: This exports the schedule helpers by name.

// #endregion Exports


