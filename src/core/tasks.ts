


// #region Imports

import { dimCouFun   } from '../utils/date.ts'; // What: Days-In-Month Count Function. Why: Monthly and yearly clamping need a month's real length. How: This is called with a year and 1-based month.
import { HOL_NAM_OBJ } from './holidays.ts';    // What: Holidays Namespace Object. Why: A reminder's own weekend/holiday participation switches need to know whether a given date is an active day off. How: This is called (guarded, since it's an external module) inside visTodFun/todVisFun/nexEliFun below.
import { isoDayFun   } from '../utils/date.ts'; // What: Iso Day Function. Why: Dates are stored and compared as local-calendar YYYY-MM-DD keys. How: This formats a Date (or now) as that key.
import { nwmDayFun   } from '../utils/date.ts'; // What: Nth-Weekday-Month Day Function. Why: An nth-weekday schedule needs the day that weekday falls on. How: This is called with a year, month, nth and weekday.
import { ordSufFun   } from '../utils/date.ts'; // What: Ordinal Suffix Function. Why: Schedule summaries read days as ordinals like 1st or 22nd. How: This is called with the day number.


import type { HolStaTyp } from './data-model.ts'; // What: Holiday State Type. Why: Holiday exclusions read the saved holiday settings. How: This types every holStaObj parameter.
import type { RemClaTyp } from './data-model.ts'; // What: Reminder Class Type. Why: optForFun hands back one class's switches. How: This types its return.
import type { RemOptTyp } from './data-model.ts'; // What: Reminder Options Type. Why: Exclusions read the saved per-class switches. How: This types every remOptObj parameter.
import type { TasRcdTyp } from './data-model.ts'; // What: Task Record Type. Why: Every function here reads saved reminders. How: This types each task parameter and the defaulted record.

// #endregion Imports



/**
 * tasks.ts = Reminders Engine
 *
 * @summary
 * Manual, statically-scheduled tasks that live alongside the random
 * pickers. Unlike a picker (which chooses ONE item from many), a
 * reminder is an explicit task the user either does once or on a fixed
 * schedule.
 *
 * A reminder shows on Today only when it's DUE today, and completing it
 * sets lastDone to today's date. Recurring reminders come back fresh on
 * their next scheduled day; a one-time reminder is done for good (and
 * gets purged the next day).
 *
 * Schedule kinds (repeat): 'once' has no schedule at all, it's due every
 * day (starting onceDate, 'YYYY-MM-DD', defaulting to today) until
 * completed, then gone for good; setting onceDate in the future defers
 * that window instead of starting it immediately. 'weekly' is due on the
 * chosen weekdays (daysOfWeek, 0 for Sunday through 6 for Saturday),
 * every interval weeks (default 1), counted from anchor. 'interval' is
 * due every N days, counted from anchor. 'monthly' is due every interval
 * months (default 1), counted from anchor, on either a day-of-month
 * (dateMode 'date', dayOfMonth 1 through 31, clamped to the month's own
 * length) or the Nth occurrence of a weekday (dateMode 'nthWeekday',
 * nthOrdinal 1 through 5, nthWeekday 0 through 6, clamped to the 4th
 * whenever a requested 5th doesn't occur that month; every month has at
 * least 4 of any given weekday, so only a 5th can ever be missing).
 * 'annual' is due every interval years (default 1), counted from anchor,
 * within month (1 through 12), on either a day-of-month (dateMode
 * 'date', day 1 through 31, clamped for Feb 29) or the Nth weekday
 * within that month (dateMode 'nthWeekday', the same nthOrdinal/
 * nthWeekday fields and clamp as monthly).
 *
 * The persisted state shape (lives at state.tasks, an array of): { id,
 * name, repeat, daysOfWeek, interval, anchor, dateMode, dayOfMonth,
 * nthOrdinal, nthWeekday, month, day, onceDate, lastDone, skipUntil,
 * createdAt, hidden, createdFromSample }.
 *
 * The exported TAS_NAM_OBJ namespace object's own property names match
 * this file's own internal implementations exactly (defTasFun,
 * isaDueFun, nexEliFun, ...), swept across every consumer at once the
 * same way cadence.ts's own CAD_NAM_OBJ was (see CLAUDE.md's Exported
 * namespace objects rule), so a caller's TAS_NAM_OBJ.propName traces
 * straight back to the function it calls. Only the persisted task
 * fields above stay unrenamed, since they live in saved user data.
 *
 * Sections:
 *  - Types
 *  - Constants
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Types

type VisCauTyp = 'holidays' | 'schedule' | 'skipUntil' | 'weekends'; // What: Visibility Cause Type. Why: A due reminder can be hidden today for one of four reasons. How: This lists every reason todVisFun reports.



type TodVisTyp = { // What: Today Visibility Type. Why: The schedule editor explains why a reminder isn't showing today. How: This describes what todVisFun returns.


	cause         : VisCauTyp | null; // What: Cause. Why: An advisory note is routed by one main reason. How: This is the first reason, or null when the reminder shows.
	causes        : VisCauTyp[];      // What: Causes. Why: A fuller note can mention every reason at once. How: This lists them all.
	holidayCustom : boolean;          // What: Holiday Custom. Why: The note words a custom holiday differently. How: This is true when the blocking holiday is the user's own.
	holidayName   : string | null;    // What: Holiday Name. Why: The note can name the holiday. How: This is its name, or null when no holiday applies.
	next          : Date | null;      // What: Next. Why: The note can say when the reminder shows again. How: This is that date, or null when it's showing or never will.
	visible       : boolean;          // What: Visible. Why: The simplest question is whether it shows today. How: This is true when no reason applies.


};

// #endregion Types



// #region Constants

const DAY_ABB_ARR = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];                              // What: Day Abbreviation Array. Why: sumTasFun's own weekly multi-day and annual Nth-weekday summaries need a short weekday name to display. How: This is indexed by daysOfWeek/nthWeekday entries throughout sumTasFun below.
const DAY_FUL_ARR = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ]; // What: Day Full Array. Why: sumTasFun's own weekly/monthly/annual Nth-weekday summaries need the full weekday name to display. How: This is indexed by daysOfWeek/nthWeekday entries throughout sumTasFun below.

// #endregion Constants



// #region Helpers

// #region Date Formatting

// #region ancDatFun

/**
 * ancDatFun = Anchor Date Function
 *
 * @summary
 * The Today tab's reminders list is generator-driven, not calendar-
 * driven: a reminder due on a new day shouldn't appear until the daily
 * generator (auto or manual Regenerate) actually runs on/after that
 * day, exactly like picker entries only change on generation. Callers
 * computing what's CURRENTLY shown on Today (visibility, done-state,
 * streak) should pass this as their date instead of letting it default
 * to live new Date(); callers doing schedule advisories (Data tab,
 * "will this show today" notes) should keep using the real current
 * date.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param genTimStr - Generation Time String: The last generator run's
 *                    timestamp, or a missing value for right now.
 *
 * @returns The generator-anchored Date, or the live current Date.
 *
 * @example
 * ```ts
 * ancDatFun(genTimStr) // => Date
 * ```
 *
*/

const ancDatFun = ( genTimStr? : string | null ) : Date => genTimStr ? new Date( genTimStr ) : new Date(); // What: Anchor Date Function. Why: Every generator-anchored caller listed above needs one shared rule for "what day is it, for this purpose". How: This builds a Date from genTimStr (the last generation's own ISO timestamp) when given, otherwise falls back to live new Date().

// #endregion ancDatFun



// #region curIsoFun

/**
 * curIsoFun = Current Iso Function
 *
 * @summary
 * Today's own local YYYY-MM-DD string, from the live clock. This is
 * calendar time, not the generator-anchored day ancDatFun gives, so
 * callers showing what Today currently displays should format
 * ancDatFun's date with isoDayFun instead.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns Today's local YYYY-MM-DD string.
 *
 * @example
 * ```ts
 * curIsoFun() // => '2026-09-27'
 * ```
 *
*/

const curIsoFun = () : string => isoDayFun( new Date() ); // What: Current Iso Function. Why: A brand new task's own anchor/onceDate/createdAt fields, and every "is this in the past" comparison, need today's own date as a plain string. How: This calls isoDayFun against a freshly constructed Date.

// #endregion curIsoFun

// #endregion Date Formatting



// #region Date Math

// #region eveNthFun

/**
 * eveNthFun = Every-Nth Function
 *
 * @summary
 * Whether a unit count since a task's anchor lands on its "every N"
 * cadence. An interval of 1 or less always qualifies, so no anchor is
 * needed for the plain every-unit case, while a negative count (a date
 * before the anchor) never qualifies once N is greater than 1.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param nthValNum - Nth Value Number: The task's own interval.
 * @param uniCouNum - Unit Count Number: Whole weeks, months or years since
 *                    the anchor.
 *
 * @returns Whether this unit is one of the every-Nth units.
 *
 * @example
 * ```ts
 * eveNthFun(nthValNum, uniCouNum) // => true or false
 * ```
 *
*/

const eveNthFun = ( nthValNum : number, uniCouNum : number ) : boolean => nthValNum <= 1 || ( uniCouNum >= 0 && uniCouNum % nthValNum === 0 ); // What: Every-Nth Function. Why: Weekly/monthly/annual all share this same "every N units" check; nthValNum defaults effectively to 1 (no anchor needed, every unit always qualifies, same as before this feature existed) and only actually consults the anchor once N is greater than 1. How: This returns true outright for nthValNum of 1 or less, otherwise checks that uniCouNum is non-negative and evenly divisible by nthValNum.

// #endregion eveNthFun



const parIsoFun = ( isoValStr : string ) => { // What: Parse Iso Function. Why: Every anchor/onceDate comparison in this file needs a stored ISO string turned back into a real local-midnight Date. How: This splits the string into its 3 numeric parts and builds a Date from them.


	const [ yeaValNum, monValNum, dayValNum ] = ( isoValStr || '' ).split( '-' ).map( Number ); // What: Year Value Month Value Day Value Destructure. Why: An anchor/onceDate ISO string needs splitting into its 3 numeric parts before a local-midnight Date can be built from it. How: This splits isoValStr (or an empty string when falsy) on '-' and maps each segment through Number.



	return new Date( yeaValNum, ( monValNum || 1 ) - 1, dayValNum || 1 ); // What: Parsed Iso Date Return. Why: Every anchor/onceDate comparison elsewhere in this file needs a real local-midnight Date, not a string (this avoids the UTC-parsing drift a bare `new Date(isoValStr)` would introduce). How: This builds a Date from the 3 destructured parts, each falling back to a safe default (month 1, day 1) when isoValStr was malformed or empty.


};



const difDayFun = ( ancIsoStr : string, cheDatObj : Date ) => { // What: Difference Day Function. Why: Weekly and interval due-ness both count whole days since a task's own anchor. How: This subtracts the parsed anchor from cheDatObj's own midnight and rounds to whole days.


	const ancDatObj = parIsoFun( ancIsoStr );                                                         // What: Anchor Date Object. Why: An interval/weekly due-ness check needs the anchor as a real Date to subtract against, not a string. How: This parses ancIsoStr via parIsoFun.
	const cheMidObj = new Date( cheDatObj.getFullYear(), cheDatObj.getMonth(), cheDatObj.getDate() ); // What: Check Midnight Object. Why: The day-count subtraction below must ignore whatever time-of-day cheDatObj carries. How: This rebuilds a Date from cheDatObj's own year/month/day alone, dropping the time component entirely.



	return Math.round( ( cheMidObj.getTime() - ancDatObj.getTime() ) / 86400000 ); // What: Day Difference Return. Why: The caller needs a whole day count, not a raw millisecond difference. How: This subtracts ancDatObj from cheMidObj and divides by the number of milliseconds in a day.


};



const difMonFun = ( ancIsoStr : string, cheDatObj : Date ) => { // What: Difference Month Function. Why: Monthly due-ness counts whole calendar months since a task's own anchor. How: This converts both dates to a flat month count and subtracts.


	const ancDatObj = parIsoFun( ancIsoStr ); // What: Anchor Date Object. Why: A monthly due-ness check needs the anchor's own year/month, not just its ISO string. How: This parses ancIsoStr via parIsoFun.



	return ( cheDatObj.getFullYear() - ancDatObj.getFullYear() ) * 12 + ( cheDatObj.getMonth() - ancDatObj.getMonth() ); // What: Month Difference Return. Why: "Every N months" only cares which month index this is; the day-of-month itself is resolved separately via dayOfMonth/nthWeekday. How: This converts both dates to a flat month count (year times 12 plus month) and subtracts.


};



const difYeaFun = ( ancIsoStr : string, cheDatObj : Date ) => cheDatObj.getFullYear() - parIsoFun( ancIsoStr ).getFullYear(); // What: Difference Year Function. Why: An annual due-ness check only cares how many calendar years separate cheDatObj from the anchor. How: This parses ancIsoStr via parIsoFun and subtracts its own year from cheDatObj's own year.

// #endregion Date Math



// #region Task State

// #region defTasFun

/**
 * defTasFun = Default Task Function
 *
 * @summary
 * Builds a fully-defaulted task/reminder record from a (possibly
 * partial) input, backfilling every field a task needs. interval is
 * shared by interval/weekly/monthly/annual (each is its own "every N
 * ___"); only the 'interval' repeat's own default is 2 (a deliberately
 * non-1 starting example), every other kind defaults to 1 ("every
 * week/month/year", the only behavior any of them had before this
 * field applied to them). This matters for any caller that constructs
 * a weekly/monthly/annual task directly with no explicit interval
 * (onboarding samples, help/sample-data.ts), not just the interactive
 * editor.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tasInpObj - Task Input Object: The (possibly partial) task fields to
 *                    default against, defaulting to an empty object for a
 *                    brand new draft with nothing set yet.
 *
 * @returns A fully-defaulted task/reminder record, in the persisted
 * shape documented at the top of this file.
 *
 * @example
 * ```ts
 * defTasFun(tasInpObj) // => a fully-defaulted task record
 * ```
 *
*/

function defTasFun ( tasInpObj : Partial< TasRcdTyp > = {} ) : TasRcdTyp {


	const curDatObj = new Date(); // What: Current Date Object. Why: Every date-based default below (daysOfWeek, dayOfMonth, nthWeekday, month, day, plus the onceDate/anchor/createdAt calls to curIsoFun) falls back to today's own value when tasInpObj has nothing set. How: This is read once and reused across the whole return object below.



	return { // What: Default Task Object Return. Why: Every caller (a brand new draft, an onboarding sample, a persisted record passing back through this function) needs this exact same fully-backfilled shape. How: This builds the object below from tasInpObj's own existing fields, falling back to curDatObj/curIsoFun wherever one is missing.


		anchor     : tasInpObj.anchor || curIsoFun(),                                                       // What: Anchor. Why: Weekly/interval/monthly/annual all count their own "every N" cadence from this date. How: This keeps tasInpObj's own anchor when given, otherwise defaults to today via curIsoFun.
		createdAt  : tasInpObj.createdAt || curIsoFun(),                                                    // What: Created At. Why: Weekly/interval fall back to this as their own anchor when none is set, and dueTodFun's own sort uses it to order same-day additions. How: This keeps tasInpObj's own createdAt when given, otherwise defaults to today via curIsoFun.
		dateMode   : tasInpObj.dateMode === 'nthWeekday' ? 'nthWeekday' : 'date',                           // What: Date Mode. Why: Monthly/annual need to know whether a plain date or an Nth-weekday rule decides the due day. How: This keeps 'nthWeekday' only when tasInpObj already says so, 'date' otherwise.
		day        : tasInpObj.day || curDatObj.getDate(),                                                  // What: Day. Why: An annual task in plain-date mode needs a target day within its own month. How: This keeps tasInpObj's own day when given, otherwise defaults to today's own date.
		dayOfMonth : tasInpObj.dayOfMonth || curDatObj.getDate(),                                           // What: Day Of Month. Why: A monthly task in plain-date mode needs a target day-of-month. How: This keeps tasInpObj's own dayOfMonth when given, otherwise defaults to today's own date.
		daysOfWeek : Array.isArray( tasInpObj.daysOfWeek ) ? tasInpObj.daysOfWeek : [ curDatObj.getDay() ], // What: Days Of Week. Why: A weekly task needs at least one selected weekday to start from. How: This keeps tasInpObj's own daysOfWeek only when it's a real array, defaulting to today's own weekday otherwise.
		hidden     : !!tasInpObj.hidden,                                                                    // What: Hidden. Why: A task created mid-mini-tour-checklist needs to stay out of dueTodFun's own list until the checklist's own closing Generate step. How: This coerces tasInpObj's own hidden to a real boolean.
		id         : tasInpObj.id || 'tk_' + Math.random().toString( 36 ).slice( 2, 8 ),                    // What: Id. Why: Every task needs a stable identifier, generated fresh when tasInpObj carries none of its own. How: This keeps tasInpObj's own id when given, otherwise mints a random 'tk_' prefixed one.
		interval   : tasInpObj.interval || ( tasInpObj.repeat === 'interval' ? 2 : 1 ),                     // What: Interval. Why: Shared by interval/weekly/monthly/annual, each its own "every N ___"; only 'interval' itself defaults to 2, every other kind to 1 (see this function's own @summary above). How: This keeps tasInpObj's own interval when given, otherwise picks 2 or 1 based on tasInpObj's own repeat.
		lastDone   : tasInpObj.lastDone ?? null,                                                            // What: Last Done. Why: Every task needs a defined (if empty) completion marker for isaDueFun/isaDonFun to read. How: This keeps tasInpObj's own lastDone when given, otherwise defaults to null.
		month      : tasInpObj.month || curDatObj.getMonth() + 1,                                           // What: Month. Why: An annual task needs its own target month. How: This keeps tasInpObj's own month when given, otherwise defaults to today's own 1-indexed month.
		name       : tasInpObj.name || '',                                                                  // What: Name. Why: A brand new draft still needs a defined (if empty) name field to bind an input to. How: This keeps tasInpObj's own name when given, otherwise falls back to an empty string.
		nthOrdinal : tasInpObj.nthOrdinal || 1,                                                             // What: Nth Ordinal. Why: Nth-weekday mode (monthly or annual) needs which occurrence (1st through 5th) to target. How: This keeps tasInpObj's own nthOrdinal when given, otherwise defaults to 1.
		nthWeekday : tasInpObj.nthWeekday ?? curDatObj.getDay(),                                            // What: Nth Weekday. Why: Nth-weekday mode also needs which weekday to target. How: This keeps tasInpObj's own nthWeekday when it's a real value, otherwise defaults to today's own weekday.
		onceDate   : tasInpObj.onceDate || curIsoFun(),                                                     // What: Once Date. Why: A one-time task's own due window starts here (today by default), and setting a future date defers it. How: This keeps tasInpObj's own onceDate when given, otherwise defaults to today via curIsoFun.
		repeat     : tasInpObj.repeat || 'once',                                                            // What: Repeat. Why: Every task needs one of the 5 recognized schedule kinds; a brand new draft defaults to the simplest one. How: This keeps tasInpObj's own repeat when given, otherwise falls back to 'once'.
		skipUntil  : tasInpObj.skipUntil ?? null,                                                           // What: Skip Until. Why: Every task needs a defined (if empty) manual-skip marker for visTodFun/todVisFun to read. How: This keeps tasInpObj's own skipUntil when given, otherwise defaults to null.

		...( tasInpObj.createdFromSample ? { createdFromSample : tasInpObj.createdFromSample } : {} ) // What: Created From Sample Spread. Why: Set only when a task is created by finishing a mini-tour, linking back to the sample template it was built from (see onboarding-checklist.ts); ignored everywhere else in the app. How: This spreads in a createdFromSample field only when tasInpObj actually carries one, adding nothing otherwise.


	};


}

// #endregion defTasFun



// #region isaComFun

/**
 * isaComFun = Is-A Completed Function
 *
 * @summary
 * A completed one-time task, on any day including today. Generate
 * purges these outright rather than waiting for isaStaFun (which only
 * catches a PRIOR day's completion).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tasRcdObj - Task Record Object: The task/reminder record being
 *                    checked.
 *
 * @returns Whether tasRcdObj is a 'once' task with any lastDone at all.
 *
 * @example
 * ```ts
 * isaComFun(tasRcdObj) // => true or false
 * ```
 *
*/

function isaComFun ( tasRcdObj : TasRcdTyp ) : boolean { return tasRcdObj.repeat === 'once' && !!tasRcdObj.lastDone; } // What: Is-A Completed Body. Why: store.ts's own Generate action calls this to drop a one-time task the moment it's done, same day included. How: This checks tasRcdObj is a 'once' task with any lastDone value at all.

// #endregion isaComFun



// #region isaDonFun

/**
 * isaDonFun = Is-A Done Function
 *
 * @summary
 * Has tasRcdObj's own occurrence on cheDatObj already been completed?
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tasRcdObj - Task Record Object: The task/reminder record being
 *                    checked.
 * @param cheDatObj - Check Date Object: The date to check completion against,
 *                    defaulting to right now.
 *
 * @returns Whether tasRcdObj's own lastDone exactly matches cheDatObj.
 *
 * @example
 * ```ts
 * isaDonFun(tasRcdObj, cheDatObj) // => true or false
 * ```
 *
*/

function isaDonFun ( tasRcdObj : TasRcdTyp, cheDatObj : Date = new Date() ) : boolean { return !!tasRcdObj.lastDone && tasRcdObj.lastDone === isoDayFun( cheDatObj ); } // What: Is-A Done Body. Why: Every caller (Today's checkbox state, streak reconciliation) needs a single boolean answer, not lastDone's own raw string. How: This compares tasRcdObj's own lastDone against cheDatObj's own iso string.

// #endregion isaDonFun



// #region isaDueFun

/**
 * isaDueFun = Is-A Due Function
 *
 * @summary
 * Is tasRcdObj due on cheDatObj? Dispatches per its own repeat kind;
 * see this file's own header comment for each kind's full schedule
 * semantics.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tasRcdObj - Task Record Object: The task/reminder record being
 *                    checked.
 * @param cheDatObj - Check Date Object: The date to check due-ness against,
 *                    defaulting to right now.
 *
 * @returns Whether tasRcdObj is due on cheDatObj, per its own repeat
 * kind's rule.
 *
 * @example
 * ```ts
 * isaDueFun(tasRcdObj, cheDatObj) // => true or false
 * ```
 *
*/

function isaDueFun ( tasRcdObj : TasRcdTyp, cheDatObj : Date = new Date() ) : boolean {


	const todIsoStr = isoDayFun( cheDatObj ); // What: Today Iso String. Why: The 'once' case below compares tasRcdObj's own onceDate/lastDone against cheDatObj as a plain string. How: This converts cheDatObj via isoDayFun.



	switch ( tasRcdObj.repeat ) { // What: Repeat Switch. Why: Each of the 5 schedule kinds has its own completely different due-ness rule. How: This branches on tasRcdObj's own repeat field, falling back to false for anything unrecognized.


		case 'once': { // What: Once Case Block. Why: A one-time task is due every day (from an optional future onceDate) until completed, then still shown the day it's completed. How: This defers to onceDate first, then checks lastDone.


			if ( tasRcdObj.onceDate && todIsoStr < tasRcdObj.onceDate ) return false; // What: Deferred Start Guard. Why: An onceDate in the future defers the whole due window instead of starting it immediately. How: This returns false while todIsoStr hasn't reached tasRcdObj's own onceDate yet (a safe plain string comparison, since both sides are 'YYYY-MM-DD').



			return !tasRcdObj.lastDone || tasRcdObj.lastDone === todIsoStr; // What: Once Case Return. Why: The task stays due until completed, but the day it's completed it still shows (checked) rather than disappearing mid-day. How: This returns true when lastDone is unset, or when it exactly matches today.


		}

		case 'weekly': { // What: Weekly Case Block. Why: A weekly task is due only on its own chosen weekdays, gated further by an every-N-weeks anchor. How: This guards on daysOfWeek membership first, then defers to eveNthFun for the N-week gate.


			if ( !( tasRcdObj.daysOfWeek || [] ).includes( cheDatObj.getDay() ) ) return false; // What: Weekday Membership Guard. Why: A weekly task never fires on a day outside its own chosen set at all. How: This returns false when cheDatObj's own weekday is absent from tasRcdObj's own daysOfWeek.



			const intCouNum = Math.max( 1, tasRcdObj.interval || 1 ); // What: Interval Count Number. Why: The every-N-weeks gate below needs a real, floor-1 interval count. How: This reads tasRcdObj's own interval, floored at 1.



			return eveNthFun( intCouNum, Math.floor( difDayFun( tasRcdObj.anchor || tasRcdObj.createdAt, cheDatObj ) / 7 ) ); // What: Weekly Case Return. Why: Weeks are counted as rolling 7-day blocks from the anchor, not calendar (Sun-Sat) weeks; every day within the same block counts as the same "week", the same non-calendar-aligned convention interval (days) already uses. How: This divides the anchor-to-cheDatObj day difference by 7 and checks it against intCouNum via eveNthFun.


		}

		case 'interval': { // What: Interval Case Block. Why: An interval task is due every flat N days from its own anchor, with no weekday/month concept at all. How: This computes the day difference and checks it's both non-negative and evenly divisible by N.


			const intCouNum = Math.max( 1, tasRcdObj.interval || 1 );                          // What: Interval Count Number. Why: The divisibility check below needs a real, floor-1 interval count. How: This reads tasRcdObj's own interval, floored at 1.
			const delDayNum = difDayFun( tasRcdObj.anchor || tasRcdObj.createdAt, cheDatObj ); // What: Delta Day Number. Why: The divisibility check below needs the actual day count since the anchor. How: This calls difDayFun once and reuses the result.



			return delDayNum >= 0 && delDayNum % intCouNum === 0; // What: Interval Case Return. Why: The task is only due on/after its own anchor, and only every intCouNum-th day past it. How: This checks delDayNum is non-negative and its remainder against intCouNum is exactly 0.


		}

		case 'monthly': { // What: Monthly Case Block. Why: A monthly task is due every N months from its own anchor, on either a plain day-of-month or an Nth-weekday rule. How: This guards on the every-N-months gate first, then branches on dateMode for the actual target day.


			const intCouNum = Math.max( 1, tasRcdObj.interval || 1 ); // What: Interval Count Number. Why: The every-N-months gate immediately below needs a real, floor-1 interval count. How: This reads tasRcdObj's own interval, floored at 1.


			if ( !eveNthFun( intCouNum, difMonFun( tasRcdObj.anchor || tasRcdObj.createdAt, cheDatObj ) ) ) return false; // What: Every-N-Months Guard. Why: A monthly task on, say, an every-3-months cadence must skip the 2 months in between entirely. How: This returns false when the anchor-to-cheDatObj month difference doesn't satisfy eveNthFun.



			if ( tasRcdObj.dateMode === 'nthWeekday' ) return cheDatObj.getDate() === nwmDayFun( cheDatObj.getFullYear(), cheDatObj.getMonth() + 1, tasRcdObj.nthOrdinal || 1, tasRcdObj.nthWeekday ?? 0 ); // What: Nth-Weekday Mode Guard. Why: In this mode the target day is whichever Nth weekday nwmDayFun resolves for cheDatObj's own month, not a plain day-of-month at all. How: This returns that comparison directly, short-circuiting the plain-date branch below.



			const dimValNum = dimCouFun( cheDatObj.getFullYear(), cheDatObj.getMonth() + 1 ); // What: Days-In-Month Value Number. Why: A plain-date target must clamp to however many real days cheDatObj's own month actually has. How: This calls dimCouFun for cheDatObj's own year and month.
			const tarDayNum = Math.min( tasRcdObj.dayOfMonth || 1, dimValNum );               // What: Target Day Number. Why: This is the actual target day-of-month, clamped so e.g. a 31st target still resolves in a 30-day month. How: This clamps tasRcdObj's own dayOfMonth against dimValNum.



			return cheDatObj.getDate() === tarDayNum; // What: Monthly Case Return. Why: The plain-date branch's own due-ness is a straight comparison against the clamped target day. How: This compares cheDatObj's own date-of-month against tarDayNum.


		}

		case 'annual': { // What: Annual Case Block. Why: An annual task is due every N years from its own anchor, within one fixed month, on either a plain day or an Nth-weekday rule. How: This guards on the target month first, then the every-N-years gate, then branches on dateMode for the actual target day.


			if ( cheDatObj.getMonth() + 1 !== tasRcdObj.month ) return false; // What: Wrong Month Guard. Why: An annual task can never be due outside its own single target month. How: This returns false when cheDatObj's own month doesn't match tasRcdObj's own month.



			const intCouNum = Math.max( 1, tasRcdObj.interval || 1 ); // What: Interval Count Number. Why: The every-N-years gate immediately below needs a real, floor-1 interval count. How: This reads tasRcdObj's own interval, floored at 1.


			if ( !eveNthFun( intCouNum, difYeaFun( tasRcdObj.anchor || tasRcdObj.createdAt, cheDatObj ) ) ) return false; // What: Every-N-Years Guard. Why: An annual task on, say, an every-3-years cadence must skip the 2 years in between entirely. How: This returns false when the anchor-to-cheDatObj year difference doesn't satisfy eveNthFun.



			if ( tasRcdObj.dateMode === 'nthWeekday' ) return cheDatObj.getDate() === nwmDayFun( cheDatObj.getFullYear(), tasRcdObj.month, tasRcdObj.nthOrdinal || 1, tasRcdObj.nthWeekday ?? 0 ); // What: Nth-Weekday Mode Guard. Why: In this mode the target day is whichever Nth weekday nwmDayFun resolves within tasRcdObj's own target month, not a plain day at all. How: This returns that comparison directly, short-circuiting the plain-date branch below.



			const dimValNum = dimCouFun( cheDatObj.getFullYear(), tasRcdObj.month ); // What: Days-In-Month Value Number. Why: A plain-date target must clamp to however many real days the target month actually has this year (Feb 29 in a leap year, Feb 28 otherwise). How: This calls dimCouFun for cheDatObj's own year and tasRcdObj's own month.
			const tarDayNum = Math.min( tasRcdObj.day || 1, dimValNum );             // What: Target Day Number. Why: This is the actual target day, clamped so e.g. a Feb 29th target still resolves in a common year. How: This clamps tasRcdObj's own day against dimValNum.



			return cheDatObj.getDate() === tarDayNum; // What: Annual Case Return. Why: The plain-date branch's own due-ness is a straight comparison against the clamped target day. How: This compares cheDatObj's own date-of-month against tarDayNum.


		}

		default: return false; // What: Default Case Return. Why: An unrecognized repeat value has no defined due-ness rule at all. How: This returns false unconditionally for any repeat not already handled above.


	}


}

// #endregion isaDueFun



// #region dueTodFun

/**
 * dueTodFun = Due Today Function
 *
 * @summary
 * Every task/reminder due on cheDatObj, in a stable order (one-time
 * first, then newest-added). Hidden tasks (see the migrate.ts migStaFun()
 * comment on the hidden flag) are excluded here so every downstream
 * consumer (Today, Stats, streak reconciliation) never has to filter
 * them out separately.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tasLisArr - Task List Array: The full list of task/reminder records
 *                    to filter.
 * @param cheDatObj - Check Date Object: The date to check due-ness against,
 *                    defaulting to right now.
 *
 * @returns The due, non-hidden subset of tasLisArr, sorted one-time
 * first, then newest createdAt first.
 *
 * @example
 * ```ts
 * dueTodFun(tasLisArr, cheDatObj) // => array of due task records
 * ```
 *
*/

function dueTodFun ( tasLisArr : TasRcdTyp[], cheDatObj : Date = new Date() ) : TasRcdTyp[] {


	return ( tasLisArr || [] ) // What: Due Today Return. Why: The caller needs the due, non-hidden subset in a stable, predictable order. How: This filters out hidden and not-due entries, then sorts one-time first, newest-added first within each group.

		.filter( ( curTasObj ) => !curTasObj.hidden && isaDueFun( curTasObj, cheDatObj ) ) // What: Due Filter. Why: Only a non-hidden, currently-due task belongs in this list at all. How: This keeps only entries where hidden is falsy and isaDueFun returns true.

		.sort( ( tasOneObj, tasTwoObj ) => { // What: Stable Sort. Why: One-time tasks read as more urgent than recurring ones, and within either group, the most recently added should surface first. How: This compares the 2 records' own repeat/createdAt fields below.


			if ( tasOneObj.repeat === 'once' && tasTwoObj.repeat !== 'once' ) return -1; // What: One-First Case Return. Why: A one-time task always outranks a recurring one. How: This returns -1 (tasOneObj first) when only tasOneObj is 'once'.



			if ( tasTwoObj.repeat === 'once' && tasOneObj.repeat !== 'once' ) return 1; // What: Two-First Case Return. Why: Same reasoning as above, mirrored. How: This returns 1 (tasTwoObj first) when only tasTwoObj is 'once'.



			return tasOneObj.createdAt < tasTwoObj.createdAt ? 1 : -1; // What: Newest-First Fallback Return. Why: Within the same urgency group, the most recently added task should surface first. How: This returns 1 (tasTwoObj first) when tasOneObj's own createdAt sorts earlier, -1 otherwise.


		} );


}

// #endregion dueTodFun



// #region isaReuFun

/**
 * isaReuFun = Is-A Recurring Function
 *
 * @summary
 * Whether a task recurs, meaning any repeat kind other than 'once'. The
 * reminder options split into a one-time class and a recurring class,
 * and this decides which class governs a given task.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tasRcdObj - Task Record Object: The task to classify.
 *
 * @returns Whether the task is recurring.
 *
 * @example
 * ```ts
 * isaReuFun(tasRcdObj) // => true or false
 * ```
 *
*/

const isaReuFun = ( tasRcdObj : TasRcdTyp ) : boolean => tasRcdObj.repeat !== 'once'; // What: Is-A Recurring Function. Why: optForFun/visTodFun/todVisFun all need to know which of the 2 option classes governs a given task. How: This is true for any repeat kind other than 'once'.

// #endregion isaReuFun



// #region isaStaFun

/**
 * isaStaFun = Is-A Stale Function
 *
 * @summary
 * A completed one-time task from a previous day, safe to purge.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tasRcdObj - Task Record Object: The task/reminder record being
 *                    checked.
 * @param cheDatObj - Check Date Object: The date to check staleness against,
 *                    defaulting to right now.
 *
 * @returns Whether tasRcdObj is a 'once' task completed on some day
 * other than cheDatObj.
 * @see {@link isaStaBoo}
 *
 * @example
 * ```ts
 * isaStaFun(tasRcdObj, cheDatObj) // => true or false
 * ```
 *
*/

function isaStaFun ( tasRcdObj : TasRcdTyp, cheDatObj : Date = new Date() ) : boolean {


	const isaOncBoo = tasRcdObj.repeat === 'once';                   // What: Is-A Once Boolean. Why: Only a one-time task can go stale; a recurring one keeps coming back. How: This is true when tasRcdObj's own repeat is 'once'.
	const lasDonBoo = !!tasRcdObj.lastDone;                          // What: Last Done Boolean. Why: A one-time task that was never completed hasn't served its purpose yet. How: This is true once tasRcdObj has a lastDone date, meaning the task has been completed.
	const othDayBoo = tasRcdObj.lastDone !== isoDayFun( cheDatObj ); // What: Other Day Boolean. Why: A task completed today must stay visible for the rest of the day. How: This is true when tasRcdObj's own lastDone differs from cheDatObj's own date key.

	const isaStaBoo = isaOncBoo && lasDonBoo && othDayBoo; // What: Is-A Stale Boolean. Why: migrate.ts's own migStaFun() calls this to drop one-time tasks that have already served their purpose. How: This combines the three checks above, true only for a 'once' task completed on some other day.



	return isaStaBoo; // What: Is-A Stale Return. Why: The caller needs the stale verdict back. How: This returns isaStaBoo.


}

// #endregion isaStaFun

// #endregion Task State



// #region sumTasFun

/**
 * sumTasFun = Summary Task Function
 *
 * @summary
 * Short human label for a task/reminder's own schedule, e.g. 'Every
 * Tuesday', 'Monthly · 3rd'.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tasRcdObj - Task Record Object: The task/reminder whose schedule is
 *                    being summarized.
 *
 * @returns The short human summary string.
 *
 * @example
 * ```ts
 * sumTasFun(tasRcdObj) // => summary string
 * ```
 *
*/

function sumTasFun ( tasRcdObj : TasRcdTyp ) : string {


	switch ( tasRcdObj.repeat ) { // What: Repeat Switch. Why: Each of the 5 schedule kinds has its own completely different summary shape. How: This branches on tasRcdObj's own repeat field, falling back to an empty string for anything unrecognized.


		case 'once': { // What: Once Case Block. Why: onceDate defaults to today (defTasFun), so only a genuinely future date changes the label; today-or-past reads as plain "One-Time", same as before this control existed. How: This guards on that first, then formats the future date when it applies.


			if ( !tasRcdObj.onceDate || tasRcdObj.onceDate <= curIsoFun() ) return 'One-Time'; // What: Plain Label Guard. Why: A missing or already-arrived onceDate needs no extra wording at all. How: This returns the plain label when onceDate is unset or not yet in the future.



			const [ yeaValNum, monValNum, dayValNum ] = tasRcdObj.onceDate.split( '-' ).map( Number ); // What: Year Value Month Value Day Value Destructure. Why: A locale-formatted date label needs a real Date instance, not the raw ISO string. How: This splits tasRcdObj's own onceDate on '-' and maps each segment through Number.

			const datLabStr = new Date( yeaValNum, monValNum - 1, dayValNum ).toLocaleDateString( 'en-US', { day : 'numeric', month : 'short' } ); // What: Date Label String. Why: This is the actual short, locale-formatted date the label displays. How: This builds a Date from the 3 destructured parts and formats it.



			return `One-Time · starts ${ datLabStr }`; // What: Deferred Once Case Return. Why: The caller needs to know this one-time task hasn't started its own due window yet. How: This interpolates datLabStr into the deferred-start label.


		}

		case 'weekly': { // What: Weekly Case Block. Why: A weekly summary reads very differently depending on whether interval is 1 (a plain day-name label) or greater (an "every N weeks" label with a secondary day clause). How: This sorts daysOfWeek once, then branches entirely on intCouNum.


			const dowSetArr = [ ...( tasRcdObj.daysOfWeek || [] ) ].sort( ( dowOneNum, dowTwoNum ) => dowOneNum - dowTwoNum ); // What: Day-Of-Week Set Array. Why: Every branch below reads daysOfWeek in ascending order, so a stray unsorted save doesn't produce a scrambled label. How: This spreads and sorts tasRcdObj's own daysOfWeek numerically.
			const intCouNum = Math.max( 1, tasRcdObj.interval || 1 );                                                          // What: Interval Count Number. Why: This decides which of the 2 branches below applies. How: This reads tasRcdObj's own interval, floored at 1.


			if ( intCouNum === 1 ) { // What: Plain Weekly Branch. Why: The common every-1-week case reads as a plain day-name label with no "every N weeks" prefix at all. How: This chains 5 mutually exclusive day-set shapes, falling back to a raw comma list.


				if ( dowSetArr.length === 0 ) return 'Weekly'; // What: Empty Set Case Return. Why: No selected day at all still needs a defined, generic label. How: This returns the bare word when dowSetArr is empty.



				if ( dowSetArr.length === 7 ) return 'Every day'; // What: Full Week Case Return. Why: All 7 days selected reads better as a single plain phrase than a 7-day list. How: This returns the plain phrase when dowSetArr's own length is 7.



				if ( dowSetArr.length === 5 && [ 1, 2, 3, 4, 5 ].every( ( dowValNum ) => dowSetArr.includes( dowValNum ) ) ) return 'Every weekday'; // What: Every Weekday Case Return. Why: Exactly Mon-Fri is common enough to deserve its own plain phrase instead of a 5-day list. How: This returns the plain phrase when dowSetArr is exactly the 5 weekday numbers.



				const twoLenBoo = dowSetArr.length === 2;  // What: Two Length Boolean. Why: The weekend-shape check below combines 3 real checks, so each is named individually per this repo's long-boolean-expression rule. How: This is true only when dowSetArr holds exactly 2 entries.
				const hasSunBoo = dowSetArr.includes( 0 ); // What: Has Sunday Boolean. Why: Same reasoning as twoLenBoo above. How: This is true only when dowSetArr includes Sunday (0).
				const hasSatBoo = dowSetArr.includes( 6 ); // What: Has Saturday Boolean. Why: Same reasoning as twoLenBoo above. How: This is true only when dowSetArr includes Saturday (6).

				const wkdSetBoo = twoLenBoo && hasSunBoo && hasSatBoo; // What: Weekend Set Boolean. Why: Exactly Sun+Sat is common enough to deserve its own plain phrase instead of a 2-day list. How: This combines the 3 individual checks above with &&, true only when every one of them holds.


				if ( wkdSetBoo ) return 'Weekends'; // What: Weekends Case Return. Why: See wkdSetBoo above. How: This returns the plain phrase when wkdSetBoo is true.



				if ( dowSetArr.length === 1 ) return 'Every ' + DAY_FUL_ARR[ dowSetArr[ 0 ] ]; // What: Single Day Case Return. Why: Exactly one selected day reads best as its own full weekday name. How: This looks dowSetArr's own only entry up in DAY_FUL_ARR.



				return 'Every ' + dowSetArr.map( ( dowValNum ) => DAY_ABB_ARR[ dowValNum ] ).join( ', ' ); // What: Fallback Day List Return. Why: Any other day combination falls back to a plain comma-separated abbreviated list. How: This maps every dowSetArr entry through DAY_ABB_ARR and joins them.


			}



			const uniLabStr = `Every ${ intCouNum } weeks`; // What: Unit Label String. Why: This is the "every N weeks" prefix every branch below shares. How: This interpolates intCouNum into the plain unit phrase.



			if ( dowSetArr.length === 0 ) return uniLabStr; // What: Empty Set Case Return. Why: No selected day at all still needs a defined label, just the bare unit phrase with no secondary day clause. How: This returns uniLabStr directly when dowSetArr is empty.



			const twoLenBoo = dowSetArr.length === 2;  // What: Two Length Boolean. Why: The weekend-shape check below combines 3 real checks, so each is named individually per this repo's long-boolean-expression rule. How: This is true only when dowSetArr holds exactly 2 entries.
			const hasSunBoo = dowSetArr.includes( 0 ); // What: Has Sunday Boolean. Why: Same reasoning as twoLenBoo above. How: This is true only when dowSetArr includes Sunday (0).
			const hasSatBoo = dowSetArr.includes( 6 ); // What: Has Saturday Boolean. Why: Same reasoning as twoLenBoo above. How: This is true only when dowSetArr includes Saturday (6).

			const wkdSetBoo = twoLenBoo && hasSunBoo && hasSatBoo; // What: Weekend Set Boolean. Why: Exactly Sun+Sat is common enough to deserve its own plain phrase instead of a 2-day list. How: This combines the 3 individual checks above with &&, true only when every one of them holds.


			const dayLabStr = dowSetArr.length === 7 // What: Day Label String. Why: This is the secondary day-set clause the unit phrase is joined with below. How: This chains 4 mutually exclusive day-set shapes, falling back to a raw comma list, reusing wkdSetBoo for the weekend shape.
				? 'every day'                                                                                               // What: Full Week Branch. Why: All 7 days selected reads better as a single plain phrase than a 7-day list. How: This returns the plain phrase when dowSetArr's own length is 7.
				: ( dowSetArr.length === 5 && [ 1, 2, 3, 4, 5 ].every( ( dowValNum ) => dowSetArr.includes( dowValNum ) ) ) // What: Weekdays Check. Why: Exactly Mon-Fri is common enough to deserve its own plain phrase. How: This tests for exactly the 5 weekday numbers next.
				? 'weekdays'                                                                                                // What: Weekdays Branch. Why: See the check above. How: This returns the plain phrase when that check holds.
				: wkdSetBoo                                                                                                 // What: Weekend Check. Why: Exactly Sun+Sat also deserves its own plain phrase. How: This tests wkdSetBoo next.
				? 'weekends'                                                                                                // What: Weekends Branch. Why: See the check above. How: This returns the plain phrase when wkdSetBoo is true.
				: dowSetArr.length === 1                                                                                    // What: Single Day Check. Why: Exactly one selected day reads best as its own full weekday name. How: This tests for a single entry next.
				? DAY_FUL_ARR[ dowSetArr[ 0 ] ]                                                                             // What: Single Day Branch. Why: See the check above. How: This looks dowSetArr's own only entry up in DAY_FUL_ARR.
				: dowSetArr.map( ( dowValNum ) => DAY_ABB_ARR[ dowValNum ] ).join( ', ' );                                  // What: Fallback Day List Branch. Why: Any other day combination falls back to a plain comma-separated abbreviated list. How: This maps every dowSetArr entry through DAY_ABB_ARR and joins them.



			return `${ uniLabStr } · ${ dayLabStr }`; // What: Weekly Case Return. Why: The caller needs the full "every N weeks · <days>" label. How: This interpolates uniLabStr and dayLabStr together.


		}

		case 'interval': { // What: Interval Case Block. Why: An interval summary is just the plain "every N days" phrase, singularized for N of 1. How: This floors interval at 1 and picks between the 2 phrasings.


			const intCouNum = Math.max( 1, tasRcdObj.interval || 1 ); // What: Interval Count Number. Why: This decides both the phrasing and the interpolated count below. How: This reads tasRcdObj's own interval, floored at 1.



			return intCouNum === 1 ? 'Every day' : `Every ${ intCouNum } days`; // What: Interval Case Return. Why: A plain daily cadence reads better as "Every day" than "Every 1 days". How: This picks the singular phrasing only when intCouNum is exactly 1.


		}

		case 'monthly': { // What: Monthly Case Block. Why: A monthly summary joins an "every N months" unit phrase with either an Nth-weekday clause or a plain ordinal day clause. How: This computes both pieces then joins them with a middle dot.


			const intCouNum = Math.max( 1, tasRcdObj.interval || 1 );                      // What: Interval Count Number. Why: This decides both the unit phrasing and the interpolated count below. How: This reads tasRcdObj's own interval, floored at 1.
			const uniLabStr = intCouNum === 1 ? 'Monthly' : `Every ${ intCouNum } months`; // What: Unit Label String. Why: A plain monthly cadence reads better as "Monthly" than "Every 1 months". How: This picks the singular phrasing only when intCouNum is exactly 1.


			const dayLabStr = tasRcdObj.dateMode === 'nthWeekday' // What: Day Label String. Why: The day clause reads completely differently depending on dateMode. How: This branches on tasRcdObj's own dateMode, naming either an Nth-weekday or a plain ordinal day.
				? `${ ordSufFun( tasRcdObj.nthOrdinal || 1 ) } ${ DAY_FUL_ARR[ tasRcdObj.nthWeekday ?? 0 ] }` // What: Nth-Weekday Branch. Why: This mode names the target occurrence and weekday. How: This joins the ordinal nthOrdinal with its full weekday name.
				: ordSufFun( tasRcdObj.dayOfMonth || 1 );                                                     // What: Plain Date Branch. Why: This mode names only the target day-of-month. How: This suffixes dayOfMonth via ordSufFun.



			return `${ uniLabStr } · ${ dayLabStr }`; // What: Monthly Case Return. Why: The caller needs the full "<unit> · <day>" label. How: This interpolates uniLabStr and dayLabStr together.


		}

		case 'annual': { // What: Annual Case Block. Why: An annual summary joins an "every N years" unit phrase with either an Nth-weekday-of-month clause or a plain month/day clause. How: This computes all 3 pieces then joins the unit and day clauses with a middle dot.


			const intCouNum = Math.max( 1, tasRcdObj.interval || 1 );                                                               // What: Interval Count Number. Why: This decides both the unit phrasing and the interpolated count below. How: This reads tasRcdObj's own interval, floored at 1.
			const uniLabStr = intCouNum === 1 ? 'Yearly' : `Every ${ intCouNum } years`;                                            // What: Unit Label String. Why: A plain annual cadence reads better as "Yearly" than "Every 1 years". How: This picks the singular phrasing only when intCouNum is exactly 1.
			const monAbbStr = new Date( 2001, ( tasRcdObj.month || 1 ) - 1, 1 ).toLocaleDateString( 'en-US', { month : 'short' } ); // What: Month Abbreviation String. Why: The Nth-weekday branch below needs a short month name to name the target month. How: This builds a throwaway Date (year 2001 is arbitrary) from tasRcdObj's own month and formats it.


			const dayLabStr = tasRcdObj.dateMode === 'nthWeekday' // What: Day Label String. Why: The day clause reads completely differently depending on dateMode. How: This branches on tasRcdObj's own dateMode, naming either an Nth-weekday-of-month or a plain month/day via the locale's own short date formatting.
				? `${ ordSufFun( tasRcdObj.nthOrdinal || 1 ) } ${ DAY_ABB_ARR[ tasRcdObj.nthWeekday ?? 0 ] } of ${ monAbbStr }`                           // What: Nth-Weekday Branch. Why: This mode names the target occurrence, weekday, and month. How: This joins the ordinal nthOrdinal, the short weekday name, and monAbbStr.
				: new Date( 2001, ( tasRcdObj.month || 1 ) - 1, tasRcdObj.day || 1 ).toLocaleDateString( 'en-US', { day : 'numeric', month : 'short' } ); // What: Plain Date Branch. Why: This mode names only the target month and day. How: This formats a throwaway Date (year 2001 is arbitrary) with the locale's own short date formatting.



			return `${ uniLabStr } · ${ dayLabStr }`; // What: Annual Case Return. Why: The caller needs the full "<unit> · <day>" label. How: This interpolates uniLabStr and dayLabStr together.


		}

		default: return ''; // What: Default Case Return. Why: An unrecognized repeat value has no defined summary at all. How: This returns an empty string unconditionally for any repeat not already handled above.


	}


}

// #endregion sumTasFun



// #region Visibility Options

// #region defOptFun

/**
 * defOptFun = Default Options Function
 *
 * @summary
 * Tasks split into two classes, one-time vs recurring, each with its
 * own switches for how it participates app-wide. Defaults: count
 * toward streak + ring, appear in Stats, and never auto-skip weekends
 * or holidays.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns The canonical default { once, recurring } participation-
 * options object.
 *
 * @example
 * ```ts
 * defOptFun() // => { once: {...}, recurring: {...} }
 * ```
 *
*/

function defOptFun () : RemOptTyp {


	const basOptObj = { excludeHolidays : false, excludeWeekends : false, ring : true, stats : true, streak : true }; // What: Base Options Object. Why: This is the one shared default shape both the once and recurring classes start from. How: This is spread into each of the 2 return properties below.



	return { // What: Default Options Return. Why: The caller needs 2 independent copies, not 2 references to the same object, so editing one class's own switches later can never affect the other. How: This spreads basOptObj fresh into each of the 2 properties.


		once      : { ...basOptObj }, // What: Once. Why: One-time reminders get their own copy of the default switches. How: This spreads basOptObj into a fresh object.
		recurring : { ...basOptObj }  // What: Recurring. Why: Recurring reminders get their own copy of the default switches, separate from the one-time copy. How: This spreads basOptObj into a second fresh object.


	};


}

// #endregion defOptFun



// #region norOptFun

/**
 * norOptFun = Normalize Options Function
 *
 * @summary
 * Merges a stored (possibly partial or missing) reminderOpts object
 * over defOptFun's own defaults, so an older or partial saved state
 * always comes out fully-shaped.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param remOptObj - Reminder Option Object: The raw, possibly partial or
 *                    missing reminderOpts state to normalize.
 *
 * @returns A fully-shaped { once, recurring } participation-options
 * object.
 *
 * @example
 * ```ts
 * norOptFun(remOptObj) // => { once: {...}, recurring: {...} }
 * ```
 *
*/

function norOptFun ( remOptObj : RemOptTyp | null | undefined ) : RemOptTyp {


	const defOptObj = defOptFun(); // What: Default Options Object. Why: Every field below falls back to this canonical shape when remOptObj has nothing of its own. How: This calls defOptFun once and reuses the result.



	if ( !remOptObj ) return defOptObj; // What: Missing Options Guard. Why: A caller might pass a missing/undefined reminderOpts state entirely, which still needs a safe fallback. How: This returns defOptObj directly when remOptObj is falsy.



	return { // What: Normalized Options Return. Why: A partially-saved remOptObj (an older save missing a newer switch) must still come out fully-shaped. How: This merges each of remOptObj's own 2 classes over defOptObj's own matching class.


		once      : { ...defOptObj.once, ...( remOptObj.once || {} ) },          // What: Once. Why: This is the fully-merged once-class options object. How: This spreads defOptObj.once first, then remOptObj's own once (or an empty object when missing) over it.
		recurring : { ...defOptObj.recurring, ...( remOptObj.recurring || {} ) } // What: Recurring. Why: This is the fully-merged recurring-class options object. How: This spreads defOptObj.recurring first, then remOptObj's own recurring (or an empty object when missing) over it.


	};


}

// #endregion norOptFun



// #region optForFun

/**
 * optForFun = Options For Function
 *
 * @summary
 * The option set (once or recurring) actually governing tasRcdObj.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tasRcdObj - Task Record Object: The task/reminder whose governing
 *                    options are wanted.
 * @param remOptObj - Reminder Option Object: The raw reminderOpts state to
 *                    normalize and choose from.
 *
 * @returns tasRcdObj's own governing options object, either
 * remOptObj's normalized once or recurring class.
 *
 * @example
 * ```ts
 * optForFun(tasRcdObj, remOptObj) // => { ring, stats, streak, ... }
 * ```
 *
*/

function optForFun ( tasRcdObj : TasRcdTyp, remOptObj : RemOptTyp | null | undefined ) : RemClaTyp {


	const optNorObj = norOptFun( remOptObj ); // What: Options Normalized Object. Why: tasRcdObj's own class must be read from the fully-shaped, defaulted options, not a possibly-partial raw remOptObj. How: This calls norOptFun once and reuses the result.



	return isaReuFun( tasRcdObj ) ? optNorObj.recurring : optNorObj.once; // What: Options For Return. Why: The caller needs whichever single class actually governs tasRcdObj. How: This picks optNorObj's own recurring or once class based on isaReuFun.


}

// #endregion optForFun



// #region nexEliFun

/**
 * nexEliFun = Next Eligible Function
 *
 * @summary
 * The first date on/after tomorrow when tasRcdObj would naturally
 * appear again, honoring both its own schedule AND its class's
 * weekend/holiday exclusions. Powers the "Skip until ..." action.
 * resSkiBoo, when true, also skips any day before an already-active
 * skipUntil; it's OFF by default since the "Skip until ..." action
 * calls this to find the next natural occurrence to skip TO, where the
 * current skipUntil must be ignored or it could never advance. A
 * caller describing when tasRcdObj will actually REAPPEAR (the editor
 * advisory, the day log) must pass true.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tasRcdObj - Task Record Object: The task/reminder to search a next
 *                    occurrence for.
 * @param remOptObj - Reminder Option Object: The raw reminderOpts state
 *                    governing weekend/holiday participation.
 * @param holStaObj - Holiday State Object: The persisted holidays state to
 *                    check exclusions against.
 * @param froDatObj - From Date Object: The date to search forward from,
 *                    defaulting to right now.
 * @param resSkiBoo - Respect Skip Boolean: Whether to also respect an
 *                    already-active skipUntil, defaulting to false.
 *
 * @returns The next eligible Date, or null if nothing qualifies within
 * this function's own search horizon (e.g. an annual task that always
 * lands on an excluded holiday).
 *
 * @example
 * ```ts
 * nexEliFun(tasRcdObj, remOptObj, holStaObj, froDatObj, resSkiBoo) // => Date
 * ```
 *
*/

function nexEliFun ( tasRcdObj : TasRcdTyp, remOptObj : RemOptTyp | null | undefined, holStaObj : HolStaTyp | null | undefined, froDatObj : Date = new Date(), resSkiBoo : boolean = false ) : Date | null {


	const optNorObj = optForFun( tasRcdObj, remOptObj );                                              // What: Options Normalized Object. Why: The weekend/holiday exclusion guards inside the loop below both read from tasRcdObj's own governing class. How: This calls optForFun once and reuses the result.
	const basDatObj = new Date( froDatObj.getFullYear(), froDatObj.getMonth(), froDatObj.getDate() ); // What: Base Date Object. Why: Every candidate day stepped through below is relative to froDatObj with its own time-of-day stripped. How: This rebuilds a Date from froDatObj's own year/month/day alone.
	const intCouNum = Math.max( 1, tasRcdObj.interval || 1 );                                         // What: Interval Count Number. Why: The search horizon below needs to scale with a sparse "every N ___" schedule, or it could fail to find its own next occurrence. How: This reads tasRcdObj's own interval, floored at 1.


	const horDayNum = tasRcdObj.repeat === 'annual' // What: Horizon Day Number. Why: 1100 days (~3 years) comfortably covers the old max (annual, interval 1) but not a large "every N weeks/months/years", and a one-time task's own onceDate has no upper bound (a plain date picker), so a far-future pick needs its own horizon or this function would falsely report "this will never show". How: This picks a horizon sized to tasRcdObj's own repeat kind and interval, or (for 'once') the distance to its own onceDate plus 30 days of slack.
		? intCouNum * 366 + 366                                                                             // What: Annual Horizon Branch. Why: An annual task needs at least one full interval of years plus a year of slack. How: This scales 366 days by intCouNum and adds one more year.
		: tasRcdObj.repeat === 'monthly'                                                                    // What: Monthly Check. Why: A monthly task needs its own month-sized horizon. How: This tests for the monthly kind next.
		? intCouNum * 31 + 31                                                                               // What: Monthly Horizon Branch. Why: A monthly task needs at least one full interval of months plus a month of slack. How: This scales 31 days by intCouNum and adds one more month.
		: tasRcdObj.repeat === 'weekly'                                                                     // What: Weekly Check. Why: A weekly task needs its own week-sized horizon. How: This tests for the weekly kind next.
		? intCouNum * 7 + 7                                                                                 // What: Weekly Horizon Branch. Why: A weekly task needs at least one full interval of weeks plus a week of slack. How: This scales 7 days by intCouNum and adds one more week.
		: ( tasRcdObj.repeat === 'once' && tasRcdObj.onceDate )                                             // What: Dated Once Check. Why: A one-time task's own onceDate can sit arbitrarily far in the future. How: This tests for a once task with a set onceDate next.
		? Math.round( ( parIsoFun( tasRcdObj.onceDate ).getTime() - basDatObj.getTime() ) / 86400000 ) + 30 // What: Dated Once Horizon Branch. Why: The search must reach past onceDate itself. How: This counts the days from basDatObj to onceDate and adds 30 days of slack.
		: 1100;                                                                                             // What: Default Horizon Branch. Why: Every other kind is covered by the original ~3 year horizon. How: This returns 1100 days.


	const horValNum = Math.max( 1100, horDayNum ); // What: Horizon Value Number. Why: The loop below needs a single floored-at-1100 day count to actually iterate up to. How: This floors horDayNum at 1100.


	for ( let dayOffNum = 1; dayOffNum <= horValNum; dayOffNum++ ) { // What: Search Loop. Why: Every candidate day from tomorrow through the horizon must be checked in order, so the FIRST one that qualifies is genuinely the next eligible one. How: This walks basDatObj forward one day at a time via dayOffNum.


		const curDatObj = new Date( basDatObj ); // What: Current Date Object. Why: Each iteration needs its own fresh Date to step forward, without mutating basDatObj itself. How: This copies basDatObj.


		curDatObj.setDate( basDatObj.getDate() + dayOffNum ); // What: Current Date Step. Why: This is the actual step to today's candidate day. How: This mutates curDatObj in place to basDatObj's own date plus dayOffNum.



		if ( !isaDueFun( tasRcdObj, curDatObj ) ) continue; // What: Not-Due Guard. Why: A candidate day tasRcdObj isn't even due on can never be the next eligible one. How: This skips to the next iteration when isaDueFun returns false.



		if ( resSkiBoo && tasRcdObj.skipUntil && isoDayFun( curDatObj ) < tasRcdObj.skipUntil ) continue; // What: Active Skip Guard. Why: When resSkiBoo is honored, a day still inside an active skipUntil window can't be the next eligible one either. How: This skips to the next iteration when all 3 conditions hold.



		const isaWkdBoo = curDatObj.getDay() === 0 || curDatObj.getDay() === 6; // What: Is-A Weekend Boolean. Why: The weekend-exclusion guard right below needs to know whether curDatObj itself falls on a weekend. How: This checks curDatObj's own weekday against Sunday (0) and Saturday (6).


		if ( optNorObj.excludeWeekends && isaWkdBoo ) continue; // What: Weekend Exclusion Guard. Why: This class has opted out of showing on a weekend, and curDatObj is one. How: This skips to the next iteration when both conditions hold.



		if ( optNorObj.excludeHolidays && HOL_NAM_OBJ && HOL_NAM_OBJ.holDatFun( holStaObj, curDatObj ) ) continue; // What: Holiday Exclusion Guard. Why: This class has opted out of showing on a holiday, and curDatObj is one; the HOL_NAM_OBJ existence check must stay part of this same short-circuit chain, never split out, since holDatFun can't be called before HOL_NAM_OBJ itself is confirmed to exist. How: This skips to the next iteration when all 3 conditions hold.



		return curDatObj; // What: Next Eligible Return. Why: curDatObj survived every guard above, so it's genuinely the first eligible day. How: This returns curDatObj directly.


	}



	return null; // What: No Match Return. Why: No candidate day within the whole horizon ever qualified. How: This returns null once the loop above completes without an early return.


}

// #endregion nexEliFun



// #region todVisFun

/**
 * todVisFun = Today Visibility Function
 *
 * @summary
 * Will tasRcdObj show on Today, and if not, WHY and when will it?
 * Separates 2 causes because they mean different things to the user:
 * 'schedule' means the repeat rule simply doesn't land on today, and
 * nothing is wrong, it will appear on its own day; 'weekends'/
 * 'holidays' means tasRcdObj IS due today but its own class's
 * participation switch hides it, which is surprising, especially for
 * a one-time task with no later occurrence of its own; 'skipUntil'
 * means the user manually skipped it. The returned next is the first
 * day tasRcdObj will actually appear (schedule AND exclusions
 * honored), or null if nothing qualifies within nexEliFun's own search
 * horizon.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tasRcdObj - Task Record Object: The task/reminder being checked.
 * @param remOptObj - Reminder Option Object: The raw reminderOpts state
 *                    governing weekend/holiday participation.
 * @param holStaObj - Holiday State Object: The persisted holidays state to
 *                    check exclusions against.
 * @param cheDatObj - Check Date Object: The date to check visibility against,
 *                    defaulting to right now.
 *
 * @returns A { visible, cause, causes, holidayName, holidayCustom,
 * next } advisory object; see this function's own @summary above for
 * what each field means.
 *
 * @example
 * ```ts
 * todVisFun(tasRcdObj, remOptObj, holStaObj, cheDatObj) // => advisory
 * ```
 *
*/

function todVisFun ( tasRcdObj : TasRcdTyp, remOptObj : RemOptTyp | null | undefined, holStaObj : HolStaTyp | null | undefined, cheDatObj : Date = new Date() ) : TodVisTyp {


	const optNorObj = optForFun( tasRcdObj, remOptObj );                    // What: Options Normalized Object. Why: The 2 exclusion checks further below both read from tasRcdObj's own governing class. How: This calls optForFun once and reuses the result.
	const isaWkdBoo = cheDatObj.getDay() === 0 || cheDatObj.getDay() === 6; // What: Is-A Weekend Boolean. Why: The weekend-exclusion check further below needs to know whether cheDatObj itself falls on a weekend. How: This checks cheDatObj's own weekday against Sunday (0) and Saturday (6).
	const holInfObj = HOL_NAM_OBJ.holInfFun( holStaObj, cheDatObj );        // What: Holiday Info Object. Why: A caller distinguishing a built-in holiday from a custom one needs the full record, not just its name. How: This calls holInfFun, which returns the matched holiday's record, or null when cheDatObj isn't a holiday.
	const isaHolBoo = !!holInfObj;                                          // What: Is-A Holiday Boolean. Why: The holiday-exclusion check further below only needs a plain boolean, not the full record. How: This coerces holInfObj to a real boolean.
	const cheIsoStr = isoDayFun( cheDatObj );                               // What: Check Iso String. Why: The manual-skip check further below compares tasRcdObj's own skipUntil against cheDatObj as a plain string. How: This converts cheDatObj via isoDayFun.

	const cauValArr : VisCauTyp[] = []; // What: Cause Value Array. Why: More than one exclusion can apply on the same day (e.g. both an excluded weekend and an excluded holiday), and naming only the first would leave the user turning off one setting while the task still doesn't appear. How: This starts empty and is pushed to below, one entry per applicable cause.


	if ( !isaDueFun( tasRcdObj, cheDatObj ) ) cauValArr.push( 'schedule' ); // What: Schedule Cause Push. Why: A task that isn't even due today has nothing else worth checking; every exclusion below only makes sense for an already-due task. How: This pushes 'schedule' and skips the else branch entirely via isaDueFun's own result.

	else { // What: Due-Today Else Block. Why: Only once tasRcdObj is confirmed due does checking its own weekend/holiday/skip exclusions make sense. How: This pushes 0 or more of 'weekends'/'holidays'/'skipUntil', any combination of which can apply at once.


		if ( optNorObj.excludeWeekends && isaWkdBoo ) cauValArr.push( 'weekends' ); // What: Weekends Cause Push. Why: This class has opted out of showing on a weekend, and today is one. How: This pushes 'weekends' when both conditions hold.



		if ( optNorObj.excludeHolidays && isaHolBoo ) cauValArr.push( 'holidays' ); // What: Holidays Cause Push. Why: This class has opted out of showing on a holiday, and today is one. How: This pushes 'holidays' when both conditions hold.



		if ( tasRcdObj.skipUntil && cheIsoStr < tasRcdObj.skipUntil ) cauValArr.push( 'skipUntil' ); // What: Skip-Until Cause Push. Why: The user manually skipped tasRcdObj until a later date that hasn't arrived yet. How: This pushes 'skipUntil' while cheIsoStr hasn't reached tasRcdObj's own skipUntil.


	}



	const priCauStr = cauValArr[ 0 ] || null; // What: Primary Cause String. Why: Routing the advisory note to the right control needs one single primary reason, even though cauValArr may carry more. How: This reads cauValArr's own first entry, or null when it's empty.



	return { // What: Today Visibility Return. Why: The caller needs the full advisory shape described in this function's own @summary above. How: This builds one plain object from every value computed above.


		cause         : priCauStr,                                                                        // What: Cause. Why: The caller needs the single primary reason, for routing an advisory note to the right control. How: This is priCauStr, computed above.
		causes        : cauValArr,                                                                        // What: Causes. Why: A caller wording a fuller note (more than one cause can apply at once) needs the complete set. How: This is cauValArr, computed above.
		holidayCustom : holInfObj ? !!holInfObj.custom : false,                                           // What: Holiday Custom. Why: A caller needs to distinguish "the Christmas Day holiday" from "your Family Day custom holiday" in its own wording. How: This coerces holInfObj's own custom flag when holInfObj exists, false otherwise.
		holidayName   : holInfObj ? holInfObj.namStr : null,                                              // What: Holiday Name. Why: A caller wording itself around a specific holiday needs its own display name. How: This reads holInfObj's own name when holInfObj exists, null otherwise.
		next          : priCauStr ? nexEliFun( tasRcdObj, remOptObj, holStaObj, cheDatObj, true ) : null, // What: Next. Why: A caller offering "it'll show again on ..." only needs to compute that (a real search) when tasRcdObj isn't visible at all. How: This calls nexEliFun only when priCauStr is set, null otherwise.
		visible       : !priCauStr                                                                        // What: Visible. Why: The caller's simplest possible question is whether tasRcdObj shows at all. How: This is true only when priCauStr is null.


	};


}

// #endregion todVisFun



// #region visTodFun

/**
 * visTodFun = Visible Today Function
 *
 * @summary
 * Every task/reminder that should actually SHOW on Today: due, minus
 * any excluded by its own class's weekend/holiday switches or an
 * active manual skip.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tasLisArr - Task List Array: The full list of task/reminder records
 *                    to filter.
 * @param remOptObj - Reminder Option Object: The raw reminderOpts state
 *                    governing weekend/holiday participation.
 * @param holStaObj - Holiday State Object: The persisted holidays state to
 *                    check exclusions against.
 * @param cheDatObj - Check Date Object: The date to check visibility against,
 *                    defaulting to right now.
 *
 * @returns The subset of tasLisArr that's both due and not excluded
 * on cheDatObj.
 *
 * @example
 * ```ts
 * visTodFun(tasLisArr, remOptObj, holStaObj, cheDatObj) // => array
 * ```
 *
*/

function visTodFun ( tasLisArr : TasRcdTyp[], remOptObj : RemOptTyp | null | undefined, holStaObj : HolStaTyp | null | undefined, cheDatObj : Date = new Date() ) : TasRcdTyp[] {


	const isaWkdBoo = cheDatObj.getDay() === 0 || cheDatObj.getDay() === 6;               // What: Is-A Weekend Boolean. Why: The filter below needs to know once, not per-task, whether cheDatObj itself falls on a weekend. How: This checks cheDatObj's own weekday against Sunday (0) and Saturday (6).
	const isaHolBoo = !!( HOL_NAM_OBJ && HOL_NAM_OBJ.holDatFun( holStaObj, cheDatObj ) ); // What: Is-A Holiday Boolean. Why: The filter below needs to know once, not per-task, whether cheDatObj itself is an active holiday. How: This guards on HOL_NAM_OBJ existing before calling its own holDatFun, coercing the result to a real boolean.
	const cheIsoStr = isoDayFun( cheDatObj );                                             // What: Check Iso String. Why: The filter below compares a task's own skipUntil against cheDatObj as a plain string. How: This converts cheDatObj via isoDayFun.



	return dueTodFun( tasLisArr, cheDatObj ).filter( ( curTasObj ) => { // What: Visible Today Return. Why: A task can be due yet still hidden, by its own class's switches or a manual skip. How: This filters dueTodFun's own result down further, per curTasObj's own governing options.


		const optNorObj = optForFun( curTasObj, remOptObj ); // What: Options Normalized Object. Why: The 3 guards below all read from curTasObj's own governing class. How: This calls optForFun once per task and reuses the result.


		if ( optNorObj.excludeWeekends && isaWkdBoo ) return false; // What: Weekend Exclusion Guard. Why: This class has opted out of showing on a weekend, and today is one. How: This returns false when both conditions hold.



		if ( optNorObj.excludeHolidays && isaHolBoo ) return false; // What: Holiday Exclusion Guard. Why: This class has opted out of showing on a holiday, and today is one. How: This returns false when both conditions hold.



		if ( curTasObj.skipUntil && cheIsoStr < curTasObj.skipUntil ) return false; // What: Manual Skip Guard. Why: The user manually skipped curTasObj until a later date that hasn't arrived yet. How: This returns false while cheIsoStr hasn't reached curTasObj's own skipUntil.



		return true; // What: Visible Fallback Return. Why: A due task that survived every exclusion guard above genuinely belongs on Today. How: This returns true unconditionally once every guard above has passed.


	} );


}

// #endregion visTodFun

// #endregion Visibility Options

// #endregion Helpers



// #region Exports

const TAS_NAM_OBJ = { // What: Tasks Namespace Object. Why: store.ts, the reminders UI files, day-log.tsx, tab-today.tsx, tab-stats.tsx, seed.ts, and the onboarding modules all import this one namespace object rather than several individual named exports. How: This maps every one of this file's own internal implementations onto an external property name matching it exactly, swept everywhere at once so external and internal names never drift apart.


	ancDatFun : ancDatFun, // What: Anchor Date Function. Why: Callers need the generator-anchored "what day is it" Date by this exact name. How: This re-exports ancDatFun under its own matching name.
	curIsoFun : curIsoFun, // What: Current Iso Function. Why: Callers need today's own ISO date string by this exact name. How: This re-exports curIsoFun under its own matching name.
	defOptFun : defOptFun, // What: Default Options Function. Why: Callers need the canonical default participation-options shape by this exact name. How: This re-exports defOptFun under its own matching name.
	defTasFun : defTasFun, // What: Default Task Function. Why: Callers build a fully-defaulted task/reminder record by this exact name. How: This re-exports defTasFun under its own matching name.
	dueTodFun : dueTodFun, // What: Due Today Function. Why: Callers need the due, non-hidden, stably-sorted task list by this exact name. How: This re-exports dueTodFun under its own matching name.
	isaComFun : isaComFun, // What: Is-A Completed Function. Why: Callers drop a same-day completed one-time task by this exact name. How: This re-exports isaComFun under its own matching name.
	isaDonFun : isaDonFun, // What: Is-A Done Function. Why: Callers check whether a task's own occurrence is already completed by this exact name. How: This re-exports isaDonFun under its own matching name.
	isaDueFun : isaDueFun, // What: Is-A Due Function. Why: Callers check whether a task is due on a given date by this exact name. How: This re-exports isaDueFun under its own matching name.
	isaReuFun : isaReuFun, // What: Is-A Recurring Function. Why: Callers check whether a task belongs to the recurring (vs one-time) options class by this exact name. How: This re-exports isaReuFun under its own matching name.
	isaStaFun : isaStaFun, // What: Is-A Stale Function. Why: migrate.ts's own migStaFun() drops a previous-day completed one-time task by this exact name. How: This re-exports isaStaFun under its own matching name.
	nexEliFun : nexEliFun, // What: Next Eligible Function. Why: Callers need a task's own next eligible occurrence by this exact name. How: This re-exports nexEliFun under its own matching name.
	norOptFun : norOptFun, // What: Normalize Options Function. Why: migrate.ts's own migStaFun() and every opts-reading caller need a fully-shaped options object by this exact name. How: This re-exports norOptFun under its own matching name.
	optForFun : optForFun, // What: Options For Function. Why: Callers need a specific task's own governing options object by this exact name. How: This re-exports optForFun under its own matching name.
	sumTasFun : sumTasFun, // What: Summary Task Function. Why: Callers need a task's own human-readable schedule summary by this exact name. How: This re-exports sumTasFun under its own matching name.
	todVisFun : todVisFun, // What: Today Visibility Function. Why: Callers need the full visible/cause/next advisory for a single task by this exact name. How: This re-exports todVisFun under its own matching name.
	visTodFun : visTodFun  // What: Visible Today Function. Why: Callers need the actually-visible-on-Today task list by this exact name. How: This re-exports visTodFun under its own matching name.


};



export { TAS_NAM_OBJ, type TodVisTyp }; // What: Named Exports. Why: Every consumer reaches this file's own reminders engine through the one namespace object, and the schedule editor types todVisFun's result with TodVisTyp. How: This exports both by name at the very end of the file.

// #endregion Exports


