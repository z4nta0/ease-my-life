



// #region Imports

import { HOL_NAM_OBJ } from './holidays.js'; // What: Holidays Namespace Object. Why: A reminder's own weekend/holiday participation switches need to know whether a given date is an active day off. How: This is called (guarded, since it's an external module) inside visTodFun/todVisFun/nexEliFun below.

// #endregion Imports



/**
 * tasks.js = Reminders Engine
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
 * The exported TASKS namespace object's own property names (defaultTask,
 * isDueToday, isDoneToday, isStaleOnce, isCompletedOnce, summary,
 * dueToday, defaultOpts, normalizeOpts, isRecurring, optsFor,
 * visibleToday, nextEligible, todayVisibility, isoToday, isoOf,
 * anchorDate, REPEATS) are a cross-file contract read directly by
 * store.jsx, reminders.jsx, day-log.jsx, tab-today.jsx, tab-stats.jsx,
 * seed.js, onboarding-seed-data.js, onboarding-page-tours.jsx,
 * onboarding-reminder-tours.jsx, and onboarding.jsx. They are
 * deliberately left unrenamed on this formatting pass, the same way
 * holidays.js's own HOL_NAM_OBJ property names were left unrenamed on
 * its own pass (unlike cadence.js's own CAD_NAM_OBJ, whose external
 * names were later swept to match its internal implementation exactly,
 * see CLAUDE.md's Exported namespace objects exception).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



const padNumFun = ( numValNum ) => String( numValNum ).padStart( 2, '0' ); // What: Pad Number Function. Why: An ISO date string needs its month and day both zero-padded to 2 digits. How: This is called twice by isoDatFun below, once for the month and once for the day.
const isoDatFun = ( datValObj ) => `${ datValObj.getFullYear() }-${ padNumFun( datValObj.getMonth() + 1 ) }-${ padNumFun( datValObj.getDate() ) }`; // What: Iso Date Function. Why: Every due-ness/summary/skip comparison in this file needs a plain, comparable YYYY-MM-DD string, not a Date instance. How: This reads datValObj's own year/month/day and zero-pads the month and day via padNumFun.
const curIsoFun = () => isoDatFun( new Date() ); // What: Current Iso Function. Why: A brand new task's own anchor/onceDate/createdAt fields, and every "is this in the past" comparison, need today's own date as a plain string. How: This calls isoDatFun against a freshly constructed Date.



/**
 * ancDatFun (anchorDate) = Anchor Date Function
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
*/

const ancDatFun = ( genTimStr ) => genTimStr ? new Date( genTimStr ) : new Date(); // What: Anchor Date Function Body. Why: Every generator-anchored caller listed above needs one shared rule for "what day is it, for this purpose". How: This builds a Date from genTimStr (the last generation's own ISO timestamp) when given, otherwise falls back to live new Date().



const parIsoFun = ( isoValStr ) => {


	const [ yeaNum, monNum, dayNum ] = ( isoValStr || '' ).split( '-' ).map( Number ); // What: Year Month Day Destructure. Why: An anchor/onceDate ISO string needs splitting into its 3 numeric parts before a local-midnight Date can be built from it. How: This splits isoValStr (or an empty string when falsy) on '-' and maps each segment through Number.



	return new Date( yeaNum, ( monNum || 1 ) - 1, dayNum || 1 ); // What: Parsed Iso Date Return. Why: Every anchor/onceDate comparison elsewhere in this file needs a real local-midnight Date, not a string (this avoids the UTC-parsing drift a bare `new Date(isoValStr)` would introduce). How: This builds a Date from the 3 destructured parts, each falling back to a safe default (month 1, day 1) when isoValStr was malformed or empty.


};



const dimCouFun = ( yeaValNum, monOneNum ) => new Date( yeaValNum, monOneNum, 0 ).getDate(); // What: Days-In-Month Count Function. Why: Monthly/annual clamping and Nth-weekday math both need to know how many days a given month actually has. How: This asks for day 0 of the FOLLOWING month, which JS's own Date resolves back to the last real day of monOneNum.



const difDayFun = ( ancIsoStr, cheDatObj ) => {


	const ancDatObj = parIsoFun( ancIsoStr );                                                          // What: Anchor Date Object. Why: An interval/weekly due-ness check needs the anchor as a real Date to subtract against, not a string. How: This parses ancIsoStr via parIsoFun.
	const cheMidObj = new Date( cheDatObj.getFullYear(), cheDatObj.getMonth(), cheDatObj.getDate() ); // What: Check Midnight Object. Why: The day-count subtraction below must ignore whatever time-of-day cheDatObj carries. How: This rebuilds a Date from cheDatObj's own year/month/day alone, dropping the time component entirely.



	return Math.round( ( cheMidObj - ancDatObj ) / 86400000 ); // What: Day Difference Return. Why: The caller needs a whole day count, not a raw millisecond difference. How: This subtracts ancDatObj from cheMidObj and divides by the number of milliseconds in a day.


};
const difMonFun = ( ancIsoStr, cheDatObj ) => {


	const ancDatObj = parIsoFun( ancIsoStr ); // What: Anchor Date Object. Why: A monthly due-ness check needs the anchor's own year/month, not just its ISO string. How: This parses ancIsoStr via parIsoFun.



	return ( cheDatObj.getFullYear() - ancDatObj.getFullYear() ) * 12 + ( cheDatObj.getMonth() - ancDatObj.getMonth() ); // What: Month Difference Return. Why: "Every N months" only cares which month index this is; the day-of-month itself is resolved separately via dayOfMonth/nthWeekday. How: This converts both dates to a flat month count (year times 12 plus month) and subtracts.


};
const difYeaFun = ( ancIsoStr, cheDatObj ) => cheDatObj.getFullYear() - parIsoFun( ancIsoStr ).getFullYear(); // What: Year Difference Function. Why: An annual due-ness check only cares how many calendar years separate cheDatObj from the anchor. How: This parses ancIsoStr via parIsoFun and subtracts its own year from cheDatObj's own year.



const eveNthFun = ( nthValNum, uniCouNum ) => nthValNum <= 1 || ( uniCouNum >= 0 && uniCouNum % nthValNum === 0 ); // What: Every-Nth Function. Why: Weekly/monthly/annual all share this same "every N units" check; nthValNum defaults effectively to 1 (no anchor needed, every unit always qualifies, same as before this feature existed) and only actually consults the anchor once N is greater than 1. How: This returns true outright for nthValNum of 1 or less, otherwise checks that uniCouNum is non-negative and evenly divisible by nthValNum.



// #region nwmDayFun

/**
 * nwmDayFun = Nth-Weekday-Month Day Function
 *
 * @summary
 * Day-of-month of the Nth (1 through 5) occurrence of a given weekday
 * in a given year/month. Clamps down to the 4th whenever a requested
 * 5th doesn't exist: every month has at least 4 of any weekday (the
 * shortest month is 28 days, exactly 4 weeks), so only the 5th can
 * ever be missing, and the 4th is always a valid fallback. Same logic
 * as cadence.js's own nwmDayFun, duplicated per this module's own
 * isolation from cadence.js (see CLAUDE.md's domain modules section).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param yeaValNum - Year Value Number: The calendar year to compute against.
 * @param monOneNum - Month One Number: The 1-indexed month to compute against
 *                    (1 for January through 12 for December).
 * @param nthValNum - Nth Value Number: Which occurrence to find, 1 through 5.
 * @param weeValNum - Weekday Value Number: The target weekday, 0 for Sunday
 *                    through 6 for Saturday.
 *
 * @returns The day-of-month (1 through 31) of that Nth weekday
 * occurrence, clamped to the 4th when a requested 5th doesn't exist.
 *
 * @example
 * ```ts
 * nwmDayFun(yeaValNum, monOneNum, nthValNum, weeValNum) // => day number
 * ```
 *
*/

function nwmDayFun( yeaValNum, monOneNum, nthValNum, weeValNum ) {


	const firWeeNum = new Date( yeaValNum, monOneNum - 1, 1 ).getDay();                // What: First Weekday Number. Why: Finding the Nth occurrence of weeValNum needs to know which weekday the month itself starts on. How: This reads the weekday of that month's own 1st day.
	const firOccNum = 1 + ( ( weeValNum - firWeeNum + 7 ) % 7 );                        // What: First Occurrence Number. Why: This is the day-of-month of the VERY FIRST occurrence of weeValNum in this month, the base every later occurrence is counted from. How: This walks forward from firWeeNum to weeValNum, wrapping via modulo 7.
	const dimValNum = dimCouFun( yeaValNum, monOneNum );                                // What: Days-In-Month Value Number. Why: The clamp below needs to know how many real days this month actually has. How: This calls dimCouFun once and reuses the result.
	const canDayNum = firOccNum + ( Math.max( 1, Math.min( 5, nthValNum ) ) - 1 ) * 7;  // What: Candidate Day Number. Why: This is the day-of-month the requested Nth occurrence would land on before any clamping. How: This adds 7 days per occurrence past the first, with nthValNum itself clamped to [1, 5].



	return canDayNum > dimValNum ? canDayNum - 7 : canDayNum; // What: Nth-Weekday-Month Day Return. Why: A requested 5th occurrence that overshoots the month's own real length must fall back to the 4th instead. How: This steps canDayNum back by exactly one week whenever it lands past dimValNum.


}

// #endregion nwmDayFun



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
 * (onboarding samples, help-sample-data.js), not just the interactive
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

function defTasFun( tasInpObj = {} ) {


	const curDatObj = new Date(); // What: Current Date Object. Why: Every date-based default below (daysOfWeek, dayOfMonth, nthWeekday, month, day, plus the onceDate/anchor/createdAt calls to curIsoFun) falls back to today's own value when tasInpObj has nothing set. How: This is read once and reused across the whole return object below.



	return { // What: Default Task Object Return. Why: Every caller (a brand new draft, an onboarding sample, a persisted record passing back through this function) needs this exact same fully-backfilled shape. How: This builds the object below from tasInpObj's own existing fields, falling back to curDatObj/curIsoFun wherever one is missing.


		id             : tasInpObj.id || 'tk_' + Math.random().toString( 36 ).slice( 2, 8 ),           // What: Id. Why: Every task needs a stable identifier, generated fresh when tasInpObj carries none of its own. How: This keeps tasInpObj's own id when given, otherwise mints a random 'tk_' prefixed one.
		name           : tasInpObj.name || '',                                                          // What: Name. Why: A brand new draft still needs a defined (if empty) name field to bind an input to. How: This keeps tasInpObj's own name when given, otherwise falls back to an empty string.
		repeat         : tasInpObj.repeat || 'once',                                                     // What: Repeat. Why: Every task needs one of the 5 recognized schedule kinds; a brand new draft defaults to the simplest one. How: This keeps tasInpObj's own repeat when given, otherwise falls back to 'once'.
		daysOfWeek     : Array.isArray( tasInpObj.daysOfWeek ) ? tasInpObj.daysOfWeek : [ curDatObj.getDay() ], // What: Days Of Week. Why: A weekly task needs at least one selected weekday to start from. How: This keeps tasInpObj's own daysOfWeek only when it's a real array, defaulting to today's own weekday otherwise.
		interval       : tasInpObj.interval || ( tasInpObj.repeat === 'interval' ? 2 : 1 ),              // What: Interval. Why: Shared by interval/weekly/monthly/annual, each its own "every N ___"; only 'interval' itself defaults to 2, every other kind to 1 (see this function's own @summary above). How: This keeps tasInpObj's own interval when given, otherwise picks 2 or 1 based on tasInpObj's own repeat.
		anchor         : tasInpObj.anchor || curIsoFun(),                                                // What: Anchor. Why: Weekly/interval/monthly/annual all count their own "every N" cadence from this date. How: This keeps tasInpObj's own anchor when given, otherwise defaults to today via curIsoFun.
		dateMode       : tasInpObj.dateMode === 'nthWeekday' ? 'nthWeekday' : 'date',                    // What: Date Mode. Why: Monthly/annual need to know whether a plain date or an Nth-weekday rule decides the due day. How: This keeps 'nthWeekday' only when tasInpObj already says so, 'date' otherwise.
		dayOfMonth     : tasInpObj.dayOfMonth || curDatObj.getDate(),                                    // What: Day Of Month. Why: A monthly task in plain-date mode needs a target day-of-month. How: This keeps tasInpObj's own dayOfMonth when given, otherwise defaults to today's own date.
		nthOrdinal     : tasInpObj.nthOrdinal || 1,                                                      // What: Nth Ordinal. Why: Nth-weekday mode (monthly or annual) needs which occurrence (1st through 5th) to target. How: This keeps tasInpObj's own nthOrdinal when given, otherwise defaults to 1.
		nthWeekday     : tasInpObj.nthWeekday ?? curDatObj.getDay(),                                     // What: Nth Weekday. Why: Nth-weekday mode also needs which weekday to target. How: This keeps tasInpObj's own nthWeekday when it's a real value, otherwise defaults to today's own weekday.
		month          : tasInpObj.month || curDatObj.getMonth() + 1,                                    // What: Month. Why: An annual task needs its own target month. How: This keeps tasInpObj's own month when given, otherwise defaults to today's own 1-indexed month.
		day            : tasInpObj.day || curDatObj.getDate(),                                           // What: Day. Why: An annual task in plain-date mode needs a target day within its own month. How: This keeps tasInpObj's own day when given, otherwise defaults to today's own date.
		onceDate       : tasInpObj.onceDate || curIsoFun(),                                              // What: Once Date. Why: A one-time task's own due window starts here (today by default), and setting a future date defers it. How: This keeps tasInpObj's own onceDate when given, otherwise defaults to today via curIsoFun.
		lastDone       : tasInpObj.lastDone ?? null,                                                     // What: Last Done. Why: Every task needs a defined (if empty) completion marker for isaDueFun/isaDonFun to read. How: This keeps tasInpObj's own lastDone when given, otherwise defaults to null.
		skipUntil      : tasInpObj.skipUntil ?? null,                                                    // What: Skip Until. Why: Every task needs a defined (if empty) manual-skip marker for visTodFun/todVisFun to read. How: This keeps tasInpObj's own skipUntil when given, otherwise defaults to null.
		createdAt      : tasInpObj.createdAt || curIsoFun(),                                             // What: Created At. Why: Weekly/interval fall back to this as their own anchor when none is set, and dueTodFun's own sort uses it to order same-day additions. How: This keeps tasInpObj's own createdAt when given, otherwise defaults to today via curIsoFun.
		hidden         : !!tasInpObj.hidden,                                                             // What: Hidden. Why: A task created mid-mini-tour-checklist needs to stay out of dueTodFun's own list until the checklist's own closing Generate step. How: This coerces tasInpObj's own hidden to a real boolean.

		// What: Created From Sample Spread. Why: Set only when a task is created by finishing a mini-tour, linking back to the sample template it was built from (see onboarding-checklist.js); ignored everywhere else in the app. How: This spreads in a createdFromSample field only when tasInpObj actually carries one, adding nothing otherwise.
		...( tasInpObj.createdFromSample ? { createdFromSample : tasInpObj.createdFromSample } : {} )


	};


}

// #endregion defTasFun



// #region isaDueFun

/**
 * isaDueFun = Is-A Due Function
 *
 * @summary
 * Is tasRecObj due on cheDatObj? Dispatches per its own repeat kind;
 * see this file's own header comment for each kind's full schedule
 * semantics.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tasRecObj - Task Record Object: The task/reminder record being
 *                    checked.
 * @param cheDatObj - Check Date Object: The date to check due-ness against,
 *                    defaulting to right now.
 *
 * @returns Whether tasRecObj is due on cheDatObj, per its own repeat
 * kind's rule.
 *
 * @example
 * ```ts
 * isaDueFun(tasRecObj, cheDatObj) // => true or false
 * ```
 *
*/

function isaDueFun( tasRecObj, cheDatObj = new Date() ) {


	const todIsoStr = isoDatFun( cheDatObj ); // What: Today Iso String. Why: The 'once' case below compares tasRecObj's own onceDate/lastDone against cheDatObj as a plain string. How: This converts cheDatObj via isoDatFun.



	switch ( tasRecObj.repeat ) { // What: Repeat Switch. Why: Each of the 5 schedule kinds has its own completely different due-ness rule. How: This branches on tasRecObj's own repeat field, falling back to false for anything unrecognized.


		case 'once': { // What: Once Case Block. Why: A one-time task is due every day (from an optional future onceDate) until completed, then still shown the day it's completed. How: This defers to onceDate first, then checks lastDone.


			if ( tasRecObj.onceDate && todIsoStr < tasRecObj.onceDate ) return false; // What: Deferred Start Guard. Why: An onceDate in the future defers the whole due window instead of starting it immediately. How: This returns false while todIsoStr hasn't reached tasRecObj's own onceDate yet (a safe plain string comparison, since both sides are 'YYYY-MM-DD').



			return !tasRecObj.lastDone || tasRecObj.lastDone === todIsoStr; // What: Once Case Return. Why: The task stays due until completed, but the day it's completed it still shows (checked) rather than disappearing mid-day. How: This returns true when lastDone is unset, or when it exactly matches today.


		}

		case 'weekly': { // What: Weekly Case Block. Why: A weekly task is due only on its own chosen weekdays, gated further by an every-N-weeks anchor. How: This guards on daysOfWeek membership first, then defers to eveNthFun for the N-week gate.


			if ( !( tasRecObj.daysOfWeek || [] ).includes( cheDatObj.getDay() ) ) return false; // What: Weekday Membership Guard. Why: A weekly task never fires on a day outside its own chosen set at all. How: This returns false when cheDatObj's own weekday is absent from tasRecObj's own daysOfWeek.


			const itvCouNum = Math.max( 1, tasRecObj.interval || 1 ); // What: Interval Count Number. Why: The every-N-weeks gate below needs a real, floor-1 interval count. How: This reads tasRecObj's own interval, floored at 1.



			return eveNthFun( itvCouNum, Math.floor( difDayFun( tasRecObj.anchor || tasRecObj.createdAt, cheDatObj ) / 7 ) ); // What: Weekly Case Return. Why: Weeks are counted as rolling 7-day blocks from the anchor, not calendar (Sun-Sat) weeks; every day within the same block counts as the same "week", the same non-calendar-aligned convention interval (days) already uses. How: This divides the anchor-to-cheDatObj day difference by 7 and checks it against itvCouNum via eveNthFun.


		}

		case 'interval': { // What: Interval Case Block. Why: An interval task is due every flat N days from its own anchor, with no weekday/month concept at all. How: This computes the day difference and checks it's both non-negative and evenly divisible by N.


			const itvCouNum = Math.max( 1, tasRecObj.interval || 1 );                                 // What: Interval Count Number. Why: The divisibility check below needs a real, floor-1 interval count. How: This reads tasRecObj's own interval, floored at 1.
			const delDayNum = difDayFun( tasRecObj.anchor || tasRecObj.createdAt, cheDatObj );          // What: Delta Day Number. Why: The divisibility check below needs the actual day count since the anchor. How: This calls difDayFun once and reuses the result.



			return delDayNum >= 0 && delDayNum % itvCouNum === 0; // What: Interval Case Return. Why: The task is only due on/after its own anchor, and only every itvCouNum-th day past it. How: This checks delDayNum is non-negative and its remainder against itvCouNum is exactly 0.


		}

		case 'monthly': { // What: Monthly Case Block. Why: A monthly task is due every N months from its own anchor, on either a plain day-of-month or an Nth-weekday rule. How: This guards on the every-N-months gate first, then branches on dateMode for the actual target day.


			const itvCouNum = Math.max( 1, tasRecObj.interval || 1 ); // What: Interval Count Number. Why: The every-N-months gate immediately below needs a real, floor-1 interval count. How: This reads tasRecObj's own interval, floored at 1.

			if ( !eveNthFun( itvCouNum, difMonFun( tasRecObj.anchor || tasRecObj.createdAt, cheDatObj ) ) ) return false; // What: Every-N-Months Guard. Why: A monthly task on, say, an every-3-months cadence must skip the 2 months in between entirely. How: This returns false when the anchor-to-cheDatObj month difference doesn't satisfy eveNthFun.



			if ( tasRecObj.dateMode === 'nthWeekday' ) return cheDatObj.getDate() === nwmDayFun( cheDatObj.getFullYear(), cheDatObj.getMonth() + 1, tasRecObj.nthOrdinal || 1, tasRecObj.nthWeekday ?? 0 ); // What: Nth-Weekday Mode Guard. Why: In this mode the target day is whichever Nth weekday nwmDayFun resolves for cheDatObj's own month, not a plain day-of-month at all. How: This returns that comparison directly, short-circuiting the plain-date branch below.


			const dimValNum = dimCouFun( cheDatObj.getFullYear(), cheDatObj.getMonth() + 1 ); // What: Days-In-Month Value Number. Why: A plain-date target must clamp to however many real days cheDatObj's own month actually has. How: This calls dimCouFun for cheDatObj's own year and month.
			const tarDayNum = Math.min( tasRecObj.dayOfMonth || 1, dimValNum );               // What: Target Day Number. Why: This is the actual target day-of-month, clamped so e.g. a 31st target still resolves in a 30-day month. How: This clamps tasRecObj's own dayOfMonth against dimValNum.



			return cheDatObj.getDate() === tarDayNum; // What: Monthly Case Return. Why: The plain-date branch's own due-ness is a straight comparison against the clamped target day. How: This compares cheDatObj's own date-of-month against tarDayNum.


		}

		case 'annual': { // What: Annual Case Block. Why: An annual task is due every N years from its own anchor, within one fixed month, on either a plain day or an Nth-weekday rule. How: This guards on the target month first, then the every-N-years gate, then branches on dateMode for the actual target day.


			if ( cheDatObj.getMonth() + 1 !== tasRecObj.month ) return false; // What: Wrong Month Guard. Why: An annual task can never be due outside its own single target month. How: This returns false when cheDatObj's own month doesn't match tasRecObj's own month.



			const itvCouNum = Math.max( 1, tasRecObj.interval || 1 ); // What: Interval Count Number. Why: The every-N-years gate immediately below needs a real, floor-1 interval count. How: This reads tasRecObj's own interval, floored at 1.

			if ( !eveNthFun( itvCouNum, difYeaFun( tasRecObj.anchor || tasRecObj.createdAt, cheDatObj ) ) ) return false; // What: Every-N-Years Guard. Why: An annual task on, say, an every-3-years cadence must skip the 2 years in between entirely. How: This returns false when the anchor-to-cheDatObj year difference doesn't satisfy eveNthFun.



			if ( tasRecObj.dateMode === 'nthWeekday' ) return cheDatObj.getDate() === nwmDayFun( cheDatObj.getFullYear(), tasRecObj.month, tasRecObj.nthOrdinal || 1, tasRecObj.nthWeekday ?? 0 ); // What: Nth-Weekday Mode Guard. Why: In this mode the target day is whichever Nth weekday nwmDayFun resolves within tasRecObj's own target month, not a plain day at all. How: This returns that comparison directly, short-circuiting the plain-date branch below.


			const dimValNum = dimCouFun( cheDatObj.getFullYear(), tasRecObj.month ); // What: Days-In-Month Value Number. Why: A plain-date target must clamp to however many real days the target month actually has this year (Feb 29 in a leap year, Feb 28 otherwise). How: This calls dimCouFun for cheDatObj's own year and tasRecObj's own month.
			const tarDayNum = Math.min( tasRecObj.day || 1, dimValNum );             // What: Target Day Number. Why: This is the actual target day, clamped so e.g. a Feb 29th target still resolves in a common year. How: This clamps tasRecObj's own day against dimValNum.



			return cheDatObj.getDate() === tarDayNum; // What: Annual Case Return. Why: The plain-date branch's own due-ness is a straight comparison against the clamped target day. How: This compares cheDatObj's own date-of-month against tarDayNum.


		}

		default: return false; // What: Default Case Return. Why: An unrecognized repeat value has no defined due-ness rule at all. How: This returns false unconditionally for any repeat not already handled above.


	}


}

// #endregion isaDueFun



// #region isaDonFun

/**
 * isaDonFun = Is-A Done Function
 *
 * @summary
 * Has tasRecObj's own occurrence on cheDatObj already been completed?
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tasRecObj - Task Record Object: The task/reminder record being
 *                    checked.
 * @param cheDatObj - Check Date Object: The date to check completion against,
 *                    defaulting to right now.
 *
 * @returns Whether tasRecObj's own lastDone exactly matches cheDatObj.
 *
 * @example
 * ```ts
 * isaDonFun(tasRecObj, cheDatObj) // => true or false
 * ```
 *
*/

function isaDonFun( tasRecObj, cheDatObj = new Date() ) { return !!tasRecObj.lastDone && tasRecObj.lastDone === isoDatFun( cheDatObj ); } // What: Is-A Done Body. Why: Every caller (Today's checkbox state, streak reconciliation) needs a single boolean answer, not lastDone's own raw string. How: This compares tasRecObj's own lastDone against cheDatObj's own iso string.

// #endregion isaDonFun



// #region isaStaFun

/**
 * isaStaFun = Is-A Stale Function
 *
 * @summary
 * A completed one-time task from a previous day, safe to purge.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tasRecObj - Task Record Object: The task/reminder record being
 *                    checked.
 * @param cheDatObj - Check Date Object: The date to check staleness against,
 *                    defaulting to right now.
 *
 * @returns Whether tasRecObj is a 'once' task completed on some day
 * other than cheDatObj.
 *
 * @example
 * ```ts
 * isaStaFun(tasRecObj, cheDatObj) // => true or false
 * ```
 *
*/

function isaStaFun( tasRecObj, cheDatObj = new Date() ) { return tasRecObj.repeat === 'once' && tasRecObj.lastDone && tasRecObj.lastDone !== isoDatFun( cheDatObj ); } // What: Is-A Stale Body. Why: store.jsx's own migrate() calls this to drop one-time tasks that have already served their purpose. How: This checks tasRecObj is a completed 'once' task whose own lastDone isn't cheDatObj's own date.

// #endregion isaStaFun



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
 * @param tasRecObj - Task Record Object: The task/reminder record being
 *                    checked.
 *
 * @returns Whether tasRecObj is a 'once' task with any lastDone at all.
 *
 * @example
 * ```ts
 * isaComFun(tasRecObj) // => true or false
 * ```
 *
*/

function isaComFun( tasRecObj ) { return tasRecObj.repeat === 'once' && !!tasRecObj.lastDone; } // What: Is-A Completed Body. Why: store.jsx's own Generate action calls this to drop a one-time task the moment it's done, same day included. How: This checks tasRecObj is a 'once' task with any lastDone value at all.

// #endregion isaComFun



const DAY_FUL_ARR = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ]; // What: Day Full Array. Why: sumTasFun's own weekly/monthly/annual Nth-weekday summaries need the full weekday name to display. How: This is indexed by daysOfWeek/nthWeekday entries throughout sumTasFun below.
const DAY_ABB_ARR = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ]; // What: Day Abbreviation Array. Why: sumTasFun's own weekly multi-day and annual Nth-weekday summaries need a short weekday name to display. How: This is indexed by daysOfWeek/nthWeekday entries throughout sumTasFun below.



// #region ordSufFun

/**
 * ordSufFun = Ordinal Suffix Function
 *
 * @summary
 * Appends the correct English ordinal suffix to a number (1st, 2nd,
 * 3rd, 4th, 11th, 21st, ...). Same algorithm as cadence.js's own
 * ordSufFun, duplicated per this module's own isolation from
 * cadence.js.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param ordValNum - Ordinal Value Number: The number to suffix.
 *
 * @returns ordValNum followed by its correct ordinal suffix, as a
 * string.
 *
 * @example
 * ```ts
 * ordSufFun(ordValNum) // => '1st', '2nd', '3rd', '4th', ...
 * ```
 *
*/

function ordSufFun( ordValNum ) {


	const sufTexArr = [ 'th', 'st', 'nd', 'rd' ]; // What: Suffix Text Array. Why: Every English ordinal suffix boils down to one of just these 4 words. How: This is indexed below by lasTwoNum's own value.
	const lasTwoNum = ordValNum % 100;             // What: Last Two Number. Why: English ordinal suffixes are decided by a number's own last two digits (11th/12th/13th are the exception every other rule must respect). How: This is ordValNum modulo 100.



	return ordValNum + ( sufTexArr[ ( lasTwoNum - 20 ) % 10 ] || sufTexArr[ lasTwoNum ] || sufTexArr[ 0 ] ); // What: Ordinal Suffix Return. Why: The caller needs the full suffixed string back, not just the suffix. How: This picks sufTexArr's own entry for lasTwoNum minus 20 (handling 21st/22nd/23rd/31st/...), falling back to lasTwoNum directly (handling 11th/12th/13th), falling back to index 0 ('th') for everything else.


}

// #endregion ordSufFun



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
 * @param tasRecObj - Task Record Object: The task/reminder whose schedule is
 *                    being summarized.
 *
 * @returns The short human summary string.
 *
 * @example
 * ```ts
 * sumTasFun(tasRecObj) // => summary string
 * ```
 *
*/

function sumTasFun( tasRecObj ) {


	switch ( tasRecObj.repeat ) { // What: Repeat Switch. Why: Each of the 5 schedule kinds has its own completely different summary shape. How: This branches on tasRecObj's own repeat field, falling back to an empty string for anything unrecognized.


		case 'once': { // What: Once Case Block. Why: onceDate defaults to today (defTasFun), so only a genuinely future date changes the label; today-or-past reads as plain "One-Time", same as before this control existed. How: This guards on that first, then formats the future date when it applies.


			if ( !tasRecObj.onceDate || tasRecObj.onceDate <= curIsoFun() ) return 'One-Time'; // What: Plain Label Guard. Why: A missing or already-arrived onceDate needs no extra wording at all. How: This returns the plain label when onceDate is unset or not yet in the future.



			const [ yeaNum, monNum, dayNum ] = tasRecObj.onceDate.split( '-' ).map( Number );                                       // What: Year Month Day Destructure. Why: A locale-formatted date label needs a real Date instance, not the raw ISO string. How: This splits tasRecObj's own onceDate on '-' and maps each segment through Number.
			const datLabStr = new Date( yeaNum, monNum - 1, dayNum ).toLocaleDateString( 'en-US', { month : 'short', day : 'numeric' } ); // What: Date Label String. Why: This is the actual short, locale-formatted date the label displays. How: This builds a Date from the 3 destructured parts and formats it.



			return `One-Time · starts ${ datLabStr }`; // What: Deferred Once Case Return. Why: The caller needs to know this one-time task hasn't started its own due window yet. How: This interpolates datLabStr into the deferred-start label.


		}

		case 'weekly': { // What: Weekly Case Block. Why: A weekly summary reads very differently depending on whether interval is 1 (a plain day-name label) or greater (an "every N weeks" label with a secondary day clause). How: This sorts daysOfWeek once, then branches entirely on itvCouNum.


			const dowSetArr = [ ...( tasRecObj.daysOfWeek || [] ) ].sort( ( dowOneNum, dowTwoNum ) => dowOneNum - dowTwoNum ); // What: Dow Set Array. Why: Every branch below reads daysOfWeek in ascending order, so a stray unsorted save doesn't produce a scrambled label. How: This spreads and sorts tasRecObj's own daysOfWeek numerically.
			const itvCouNum = Math.max( 1, tasRecObj.interval || 1 );                                                          // What: Interval Count Number. Why: This decides which of the 2 branches below applies. How: This reads tasRecObj's own interval, floored at 1.


			if ( itvCouNum === 1 ) { // What: Plain Weekly Branch. Why: The common every-1-week case reads as a plain day-name label with no "every N weeks" prefix at all. How: This chains 5 mutually exclusive day-set shapes, falling back to a raw comma list.


				if ( dowSetArr.length === 0 ) return 'Weekly'; // What: Empty Set Case Return. Why: No selected day at all still needs a defined, generic label. How: This returns the bare word when dowSetArr is empty.

				if ( dowSetArr.length === 7 ) return 'Every day'; // What: Full Week Case Return. Why: All 7 days selected reads better as a single plain phrase than a 7-day list. How: This returns the plain phrase when dowSetArr's own length is 7.

				if ( dowSetArr.length === 5 && [ 1, 2, 3, 4, 5 ].every( ( dowNum ) => dowSetArr.includes( dowNum ) ) ) return 'Every weekday'; // What: Every Weekday Case Return. Why: Exactly Mon-Fri is common enough to deserve its own plain phrase instead of a 5-day list. How: This returns the plain phrase when dowSetArr is exactly the 5 weekday numbers.



				const isaTwoLenBoo = dowSetArr.length === 2;  // What: Is-A Two-Length Boolean. Why: The weekend-shape check below combines 3 real checks, so each is named individually per this repo's long-boolean-expression rule. How: This is true only when dowSetArr holds exactly 2 entries.
				const isaSunIncBoo = dowSetArr.includes( 0 ); // What: Is-A Sunday-Included Boolean. Why: Same reasoning as isaTwoLenBoo above. How: This is true only when dowSetArr includes Sunday (0).
				const isaSatIncBoo = dowSetArr.includes( 6 ); // What: Is-A Saturday-Included Boolean. Why: Same reasoning as isaTwoLenBoo above. How: This is true only when dowSetArr includes Saturday (6).

				const isaWkdEndBoo = isaTwoLenBoo && isaSunIncBoo && isaSatIncBoo; // What: Is-A Weekend Boolean. Why: Exactly Sun+Sat is common enough to deserve its own plain phrase instead of a 2-day list. How: This combines the 3 individual checks above with &&, true only when every one of them holds.


				if ( isaWkdEndBoo ) return 'Weekends'; // What: Weekends Case Return. Why: See isaWkdEndBoo above. How: This returns the plain phrase when isaWkdEndBoo is true.



				if ( dowSetArr.length === 1 ) return 'Every ' + DAY_FUL_ARR[ dowSetArr[ 0 ] ]; // What: Single Day Case Return. Why: Exactly one selected day reads best as its own full weekday name. How: This looks dowSetArr's own only entry up in DAY_FUL_ARR.



				return 'Every ' + dowSetArr.map( ( dowNum ) => DAY_ABB_ARR[ dowNum ] ).join( ', ' ); // What: Fallback Day List Return. Why: Any other day combination falls back to a plain comma-separated abbreviated list. How: This maps every dowSetArr entry through DAY_ABB_ARR and joins them.


			}



			const unitLabStr = `Every ${ itvCouNum } weeks`; // What: Unit Label String. Why: This is the "every N weeks" prefix every branch below shares. How: This interpolates itvCouNum into the plain unit phrase.

			if ( dowSetArr.length === 0 ) return unitLabStr; // What: Empty Set Case Return. Why: No selected day at all still needs a defined label, just the bare unit phrase with no secondary day clause. How: This returns unitLabStr directly when dowSetArr is empty.



			const isaTwoLenBoo = dowSetArr.length === 2;  // What: Is-A Two-Length Boolean. Why: The weekend-shape check below combines 3 real checks, so each is named individually per this repo's long-boolean-expression rule. How: This is true only when dowSetArr holds exactly 2 entries.
			const isaSunIncBoo = dowSetArr.includes( 0 ); // What: Is-A Sunday-Included Boolean. Why: Same reasoning as isaTwoLenBoo above. How: This is true only when dowSetArr includes Sunday (0).
			const isaSatIncBoo = dowSetArr.includes( 6 ); // What: Is-A Saturday-Included Boolean. Why: Same reasoning as isaTwoLenBoo above. How: This is true only when dowSetArr includes Saturday (6).

			const isaWkdEndBoo = isaTwoLenBoo && isaSunIncBoo && isaSatIncBoo; // What: Is-A Weekend Boolean. Why: Exactly Sun+Sat is common enough to deserve its own plain phrase instead of a 2-day list. How: This combines the 3 individual checks above with &&, true only when every one of them holds.


			const dayLabStr = dowSetArr.length === 7 ? 'every day' // What: Day Label String. Why: This is the secondary day-set clause the unit phrase is joined with below. How: This chains 4 mutually exclusive day-set shapes, falling back to a raw comma list, reusing isaWkdEndBoo for the weekend shape.
				: ( dowSetArr.length === 5 && [ 1, 2, 3, 4, 5 ].every( ( dowNum ) => dowSetArr.includes( dowNum ) ) ) ? 'weekdays'
				: isaWkdEndBoo ? 'weekends'
				: dowSetArr.length === 1 ? DAY_FUL_ARR[ dowSetArr[ 0 ] ]
				: dowSetArr.map( ( dowNum ) => DAY_ABB_ARR[ dowNum ] ).join( ', ' );



			return `${ unitLabStr } · ${ dayLabStr }`; // What: Weekly Case Return. Why: The caller needs the full "every N weeks · <days>" label. How: This interpolates unitLabStr and dayLabStr together.


		}

		case 'interval': { // What: Interval Case Block. Why: An interval summary is just the plain "every N days" phrase, singularized for N of 1. How: This floors interval at 1 and picks between the 2 phrasings.


			const itvCouNum = Math.max( 1, tasRecObj.interval || 1 ); // What: Interval Count Number. Why: This decides both the phrasing and the interpolated count below. How: This reads tasRecObj's own interval, floored at 1.



			return itvCouNum === 1 ? 'Every day' : `Every ${ itvCouNum } days`; // What: Interval Case Return. Why: A plain daily cadence reads better as "Every day" than "Every 1 days". How: This picks the singular phrasing only when itvCouNum is exactly 1.


		}

		case 'monthly': { // What: Monthly Case Block. Why: A monthly summary joins an "every N months" unit phrase with either an Nth-weekday clause or a plain ordinal day clause. How: This computes both pieces then joins them with a middle dot.


			const itvCouNum = Math.max( 1, tasRecObj.interval || 1 );                        // What: Interval Count Number. Why: This decides both the unit phrasing and the interpolated count below. How: This reads tasRecObj's own interval, floored at 1.
			const unitLabStr = itvCouNum === 1 ? 'Monthly' : `Every ${ itvCouNum } months`;    // What: Unit Label String. Why: A plain monthly cadence reads better as "Monthly" than "Every 1 months". How: This picks the singular phrasing only when itvCouNum is exactly 1.
			const dayLabStr = tasRecObj.dateMode === 'nthWeekday' // What: Day Label String. Why: The day clause reads completely differently depending on dateMode. How: This branches on tasRecObj's own dateMode, naming either an Nth-weekday or a plain ordinal day.
				? `${ ordSufFun( tasRecObj.nthOrdinal || 1 ) } ${ DAY_FUL_ARR[ tasRecObj.nthWeekday ?? 0 ] }`
				: ordSufFun( tasRecObj.dayOfMonth || 1 );



			return `${ unitLabStr } · ${ dayLabStr }`; // What: Monthly Case Return. Why: The caller needs the full "<unit> · <day>" label. How: This interpolates unitLabStr and dayLabStr together.


		}

		case 'annual': { // What: Annual Case Block. Why: An annual summary joins an "every N years" unit phrase with either an Nth-weekday-of-month clause or a plain month/day clause. How: This computes all 3 pieces then joins the unit and day clauses with a middle dot.


			const itvCouNum = Math.max( 1, tasRecObj.interval || 1 );                     // What: Interval Count Number. Why: This decides both the unit phrasing and the interpolated count below. How: This reads tasRecObj's own interval, floored at 1.
			const unitLabStr = itvCouNum === 1 ? 'Yearly' : `Every ${ itvCouNum } years`;   // What: Unit Label String. Why: A plain annual cadence reads better as "Yearly" than "Every 1 years". How: This picks the singular phrasing only when itvCouNum is exactly 1.
			const monAbbStr = new Date( 2001, ( tasRecObj.month || 1 ) - 1, 1 ).toLocaleDateString( 'en-US', { month : 'short' } ); // What: Month Abbreviation String. Why: The Nth-weekday branch below needs a short month name to name the target month. How: This builds a throwaway Date (year 2001 is arbitrary) from tasRecObj's own month and formats it.
			const dayLabStr = tasRecObj.dateMode === 'nthWeekday' // What: Day Label String. Why: The day clause reads completely differently depending on dateMode. How: This branches on tasRecObj's own dateMode, naming either an Nth-weekday-of-month or a plain month/day via the locale's own short date formatting.
				? `${ ordSufFun( tasRecObj.nthOrdinal || 1 ) } ${ DAY_ABB_ARR[ tasRecObj.nthWeekday ?? 0 ] } of ${ monAbbStr }`
				: new Date( 2001, ( tasRecObj.month || 1 ) - 1, tasRecObj.day || 1 ).toLocaleDateString( 'en-US', { month : 'short', day : 'numeric' } );



			return `${ unitLabStr } · ${ dayLabStr }`; // What: Annual Case Return. Why: The caller needs the full "<unit> · <day>" label. How: This interpolates unitLabStr and dayLabStr together.


		}

		default: return ''; // What: Default Case Return. Why: An unrecognized repeat value has no defined summary at all. How: This returns an empty string unconditionally for any repeat not already handled above.


	}


}

// #endregion sumTasFun



// #region dueTodFun

/**
 * dueTodFun = Due Today Function
 *
 * @summary
 * Every task/reminder due on cheDatObj, in a stable order (one-time
 * first, then newest-added). Hidden tasks (see the store.jsx migrate()
 * comment on the hidden flag) are excluded here so every downstream
 * consumer (Today, Stats, streak reconciliation) never has to filter
 * them out separately.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tasListArr - Task List Array: The full list of task/reminder records
 *                     to filter.
 * @param cheDatObj  - Check Date Object: The date to check due-ness against,
 *                     defaulting to right now.
 *
 * @returns The due, non-hidden subset of tasListArr, sorted one-time
 * first, then newest createdAt first.
 *
 * @example
 * ```ts
 * dueTodFun(tasListArr, cheDatObj) // => array of due task records
 * ```
 *
*/

function dueTodFun( tasListArr, cheDatObj = new Date() ) {


	return ( tasListArr || [] ) // What: Due Today Return. Why: The caller needs the due, non-hidden subset in a stable, predictable order. How: This filters out hidden and not-due entries, then sorts one-time first, newest-added first within each group.

		.filter( ( curTasObj ) => !curTasObj.hidden && isaDueFun( curTasObj, cheDatObj ) ) // What: Due Filter. Why: Only a non-hidden, currently-due task belongs in this list at all. How: This keeps only entries where hidden is falsy and isaDueFun returns true.

		.sort( ( tasAObj, tasBObj ) => { // What: Stable Sort. Why: One-time tasks read as more urgent than recurring ones, and within either group, the most recently added should surface first. How: This compares the 2 records' own repeat/createdAt fields below.


			if ( tasAObj.repeat === 'once' && tasBObj.repeat !== 'once' ) return -1; // What: A-First Case Return. Why: A one-time task always outranks a recurring one. How: This returns -1 (A first) when only tasAObj is 'once'.

			if ( tasBObj.repeat === 'once' && tasAObj.repeat !== 'once' ) return 1; // What: B-First Case Return. Why: Same reasoning as above, mirrored. How: This returns 1 (B first) when only tasBObj is 'once'.



			return tasAObj.createdAt < tasBObj.createdAt ? 1 : -1; // What: Newest-First Fallback Return. Why: Within the same urgency group, the most recently added task should surface first. How: This returns 1 (B first) when tasAObj's own createdAt sorts earlier, -1 otherwise.


		} );


}

// #endregion dueTodFun



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

function defOptFun() {


	const basOptObj = { streak : true, ring : true, stats : true, excludeWeekends : false, excludeHolidays : false }; // What: Base Options Object. Why: This is the one shared default shape both the once and recurring classes start from. How: This is spread into each of the 2 return properties below.



	return { once : { ...basOptObj }, recurring : { ...basOptObj } }; // What: Default Options Return. Why: The caller needs 2 independent copies, not 2 references to the same object, so editing one class's own switches later can never affect the other. How: This spreads basOptObj fresh into each of the 2 properties.


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

function norOptFun( remOptObj ) {


	const defOptObj = defOptFun(); // What: Default Options Object. Why: Every field below falls back to this canonical shape when remOptObj has nothing of its own. How: This calls defOptFun once and reuses the result.

	if ( !remOptObj ) return defOptObj; // What: Missing Options Guard. Why: A caller might pass a missing/undefined reminderOpts state entirely, which still needs a safe fallback. How: This returns defOptObj directly when remOptObj is falsy.



	return { // What: Normalized Options Return. Why: A partially-saved remOptObj (an older save missing a newer switch) must still come out fully-shaped. How: This merges each of remOptObj's own 2 classes over defOptObj's own matching class.


		once      : { ...defOptObj.once, ...( remOptObj.once || {} ) },           // What: Once. Why: This is the fully-merged once-class options object. How: This spreads defOptObj.once first, then remOptObj's own once (or an empty object when missing) over it.
		recurring : { ...defOptObj.recurring, ...( remOptObj.recurring || {} ) } // What: Recurring. Why: This is the fully-merged recurring-class options object. How: This spreads defOptObj.recurring first, then remOptObj's own recurring (or an empty object when missing) over it.


	};


}

// #endregion norOptFun



const isaRecFun = ( tasRecObj ) => tasRecObj.repeat !== 'once'; // What: Is-A Recurring Function. Why: optForFun/visTodFun/todVisFun all need to know which of the 2 option classes governs a given task. How: This is true for any repeat kind other than 'once'.



// #region optForFun

/**
 * optForFun = Options For Function
 *
 * @summary
 * The option set (once or recurring) actually governing tasRecObj.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tasRecObj - Task Record Object: The task/reminder whose governing
 *                    options are wanted.
 * @param remOptObj - Reminder Option Object: The raw reminderOpts state to
 *                    normalize and choose from.
 *
 * @returns tasRecObj's own governing options object, either
 * remOptObj's normalized once or recurring class.
 *
 * @example
 * ```ts
 * optForFun(tasRecObj, remOptObj) // => { streak, ring, stats, ... }
 * ```
 *
*/

function optForFun( tasRecObj, remOptObj ) {


	const optNorObj = norOptFun( remOptObj ); // What: Options Normalized Object. Why: tasRecObj's own class must be read from the fully-shaped, defaulted options, not a possibly-partial raw remOptObj. How: This calls norOptFun once and reuses the result.



	return isaRecFun( tasRecObj ) ? optNorObj.recurring : optNorObj.once; // What: Options For Return. Why: The caller needs whichever single class actually governs tasRecObj. How: This picks optNorObj's own recurring or once class based on isaRecFun.


}

// #endregion optForFun



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
 * @param tasListArr - Task List Array: The full list of task/reminder records
 *                     to filter.
 * @param remOptObj  - Reminder Option Object: The raw reminderOpts state
 *                     governing weekend/ holiday participation.
 * @param holStaObj  - Holiday State Object: The persisted holidays state to
 *                     check exclusions against.
 * @param cheDatObj  - Check Date Object: The date to check visibility against,
 *                     defaulting to right now.
 *
 * @returns The subset of tasListArr that's both due and not excluded
 * on cheDatObj.
 *
 * @example
 * ```ts
 * visTodFun(tasListArr, remOptObj, holStaObj, cheDatObj) // => array
 * ```
 *
*/

function visTodFun( tasListArr, remOptObj, holStaObj, cheDatObj = new Date() ) {


	const isaWkdBoo = cheDatObj.getDay() === 0 || cheDatObj.getDay() === 6;                       // What: Is-A Weekend Boolean. Why: The filter below needs to know once, not per-task, whether cheDatObj itself falls on a weekend. How: This checks cheDatObj's own weekday against Sunday (0) and Saturday (6).
	const isaHolBoo = !!( HOL_NAM_OBJ && HOL_NAM_OBJ.holDatFun( holStaObj, cheDatObj ) );          // What: Is-A Holiday Boolean. Why: The filter below needs to know once, not per-task, whether cheDatObj itself is an active holiday. How: This guards on HOL_NAM_OBJ existing before calling its own holDatFun, coercing the result to a real boolean.
	const cheIsoStr = isoDatFun( cheDatObj );                                                      // What: Check Iso String. Why: The filter below compares a task's own skipUntil against cheDatObj as a plain string. How: This converts cheDatObj via isoDatFun.



	return dueTodFun( tasListArr, cheDatObj ).filter( ( curTasObj ) => { // What: Visible Today Return. Why: A task can be due yet still hidden, by its own class's switches or a manual skip. How: This filters dueTodFun's own result down further, per curTasObj's own governing options.


		const optNorObj = optForFun( curTasObj, remOptObj ); // What: Options Normalized Object. Why: The 3 guards below all read from curTasObj's own governing class. How: This calls optForFun once per task and reuses the result.

		if ( optNorObj.excludeWeekends && isaWkdBoo ) return false; // What: Weekend Exclusion Guard. Why: This class has opted out of showing on a weekend, and today is one. How: This returns false when both conditions hold.

		if ( optNorObj.excludeHolidays && isaHolBoo ) return false; // What: Holiday Exclusion Guard. Why: This class has opted out of showing on a holiday, and today is one. How: This returns false when both conditions hold.

		if ( curTasObj.skipUntil && cheIsoStr < curTasObj.skipUntil ) return false; // What: Manual Skip Guard. Why: The user manually skipped curTasObj until a later date that hasn't arrived yet. How: This returns false while cheIsoStr hasn't reached curTasObj's own skipUntil.



		return true; // What: Visible Fallback Return. Why: A due task that survived every exclusion guard above genuinely belongs on Today. How: This returns true unconditionally once every guard above has passed.


	} );


}

// #endregion visTodFun



// #region todVisFun

/**
 * todVisFun = Today Visibility Function
 *
 * @summary
 * Will tasRecObj show on Today, and if not, WHY and when will it?
 * Separates 2 causes because they mean different things to the user:
 * 'schedule' means the repeat rule simply doesn't land on today, and
 * nothing is wrong, it will appear on its own day; 'weekends'/
 * 'holidays' means tasRecObj IS due today but its own class's
 * participation switch hides it, which is surprising, especially for
 * a one-time task with no later occurrence of its own; 'skipUntil'
 * means the user manually skipped it. The returned next is the first
 * day tasRecObj will actually appear (schedule AND exclusions
 * honored), or null if nothing qualifies within nexEliFun's own search
 * horizon.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tasRecObj - Task Record Object: The task/reminder being checked.
 * @param remOptObj - Reminder Option Object: The raw reminderOpts state
 *                    governing weekend/ holiday participation.
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
 * todVisFun(tasRecObj, remOptObj, holStaObj, cheDatObj) // => advisory
 * ```
 *
*/

function todVisFun( tasRecObj, remOptObj, holStaObj, cheDatObj = new Date() ) {


	const optNorObj = optForFun( tasRecObj, remOptObj );                    // What: Options Normalized Object. Why: The 2 exclusion checks further below both read from tasRecObj's own governing class. How: This calls optForFun once and reuses the result.
	const isaWkdBoo = cheDatObj.getDay() === 0 || cheDatObj.getDay() === 6; // What: Is-A Weekend Boolean. Why: The weekend-exclusion check further below needs to know whether cheDatObj itself falls on a weekend. How: This checks cheDatObj's own weekday against Sunday (0) and Saturday (6).
	const holInfObj = HOL_NAM_OBJ && HOL_NAM_OBJ.holInfFun // What: Holiday Info Object. Why: A caller distinguishing a built-in holiday from a custom one needs the full record, not just its name; an older HOL_NAM_OBJ shape only ever exposed holDatFun (name only), so the richer holInfFun is preferred when present. This whole expression is deliberately left as one guarded chain rather than split into separate always-evaluated consts, since HOL_NAM_OBJ.holDatFun must never be called before HOL_NAM_OBJ itself is confirmed to exist. How: This calls holInfFun directly when it exists, otherwise rebuilds a name-only record from holDatFun when that finds a match, or lands on null when neither one does.
		? HOL_NAM_OBJ.holInfFun( holStaObj, cheDatObj )
		: ( HOL_NAM_OBJ && HOL_NAM_OBJ.holDatFun( holStaObj, cheDatObj )
			? {


				name   : HOL_NAM_OBJ.holDatFun( holStaObj, cheDatObj ), // What: Name. Why: The caller needs the matched holiday's own display name. How: This calls HOL_NAM_OBJ.holDatFun again for its own return value (already confirmed truthy by the guard above).
				custom : false // What: Custom. Why: This name-only fallback path can only ever be reached for a computed built-in holiday, never a custom one. How: This is always false on this branch.


			}
			: null );
	const isaHolBoo = !!holInfObj;   // What: Is-A Holiday Boolean. Why: The holiday-exclusion check further below only needs a plain boolean, not the full record. How: This coerces holInfObj to a real boolean.
	const cheIsoStr = isoDatFun( cheDatObj ); // What: Check Iso String. Why: The manual-skip check further below compares tasRecObj's own skipUntil against cheDatObj as a plain string. How: This converts cheDatObj via isoDatFun.
	const cauValArr = []; // What: Cause Value Array. Why: More than one exclusion can apply on the same day (e.g. both an excluded weekend and an excluded holiday), and naming only the first would leave the user turning off one setting while the task still doesn't appear. How: This starts empty and is pushed to below, one entry per applicable cause.


	if ( !isaDueFun( tasRecObj, cheDatObj ) ) cauValArr.push( 'schedule' ); // What: Schedule Cause Push. Why: A task that isn't even due today has nothing else worth checking; every exclusion below only makes sense for an already-due task. How: This pushes 'schedule' and skips the else branch entirely via isaDueFun's own result.

	else { // What: Due-Today Else Block. Why: Only once tasRecObj is confirmed due does checking its own weekend/holiday/skip exclusions make sense. How: This pushes 0 or more of 'weekends'/'holidays'/'skipUntil', any combination of which can apply at once.


		if ( optNorObj.excludeWeekends && isaWkdBoo ) cauValArr.push( 'weekends' ); // What: Weekends Cause Push. Why: This class has opted out of showing on a weekend, and today is one. How: This pushes 'weekends' when both conditions hold.

		if ( optNorObj.excludeHolidays && isaHolBoo ) cauValArr.push( 'holidays' ); // What: Holidays Cause Push. Why: This class has opted out of showing on a holiday, and today is one. How: This pushes 'holidays' when both conditions hold.

		if ( tasRecObj.skipUntil && cheIsoStr < tasRecObj.skipUntil ) cauValArr.push( 'skipUntil' ); // What: Skip-Until Cause Push. Why: The user manually skipped tasRecObj until a later date that hasn't arrived yet. How: This pushes 'skipUntil' while cheIsoStr hasn't reached tasRecObj's own skipUntil.


	}

	const priCauStr = cauValArr[ 0 ] || null; // What: Primary Cause String. Why: Routing the advisory note to the right control needs one single primary reason, even though cauValArr may carry more. How: This reads cauValArr's own first entry, or null when it's empty.



	return { // What: Today Visibility Return. Why: The caller needs the full advisory shape described in this function's own @summary above. How: This builds one plain object from every value computed above.


		visible       : !priCauStr,                                                                 // What: Visible. Why: The caller's simplest possible question is whether tasRecObj shows at all. How: This is true only when priCauStr is null.
		cause         : priCauStr,                                                                  // What: Cause. Why: The caller needs the single primary reason, for routing an advisory note to the right control. How: This is priCauStr, computed above.
		causes        : cauValArr,                                                                  // What: Causes. Why: A caller wording a fuller note (more than one cause can apply at once) needs the complete set. How: This is cauValArr, computed above.
		holidayName   : holInfObj ? holInfObj.name : null,                                          // What: Holiday Name. Why: A caller wording itself around a specific holiday needs its own display name. How: This reads holInfObj's own name when holInfObj exists, null otherwise.
		holidayCustom : holInfObj ? !!holInfObj.custom : false,                                     // What: Holiday Custom. Why: A caller needs to distinguish "the Christmas Day holiday" from "your Family Day custom holiday" in its own wording. How: This coerces holInfObj's own custom flag when holInfObj exists, false otherwise.
		next          : priCauStr ? nexEliFun( tasRecObj, remOptObj, holStaObj, cheDatObj, true ) : null // What: Next. Why: A caller offering "it'll show again on ..." only needs to compute that (a real search) when tasRecObj isn't visible at all. How: This calls nexEliFun only when priCauStr is set, null otherwise.


	};


}

// #endregion todVisFun



// #region nexEliFun

/**
 * nexEliFun = Next Eligible Function
 *
 * @summary
 * The first date on/after tomorrow when tasRecObj would naturally
 * appear again, honoring both its own schedule AND its class's
 * weekend/holiday exclusions. Powers the "Skip until ..." action.
 * resSkiBoo, when true, also skips any day before an already-active
 * skipUntil; it's OFF by default since the "Skip until ..." action
 * calls this to find the next natural occurrence to skip TO, where the
 * current skipUntil must be ignored or it could never advance. A
 * caller describing when tasRecObj will actually REAPPEAR (the editor
 * advisory, the day log) must pass true.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tasRecObj  - Task Record Object: The task/reminder to search a next
 *                     occurrence for.
 * @param remOptObj  - Reminder Option Object: The raw reminderOpts state
 *                     governing weekend/ holiday participation.
 * @param holStaObj  - Holiday State Object: The persisted holidays state to
 *                     check exclusions against.
 * @param fromDatObj - From Date Object: The date to search forward from,
 *                     defaulting to right now.
 * @param resSkiBoo  - Resolved Skip Boolean: Whether to also respect an
 *                     already-active skipUntil, defaulting to false.
 *
 * @returns The next eligible Date, or null if nothing qualifies within
 * this function's own search horizon (e.g. an annual task that always
 * lands on an excluded holiday).
 *
 * @example
 * ```ts
 * nexEliFun(tasRecObj, remOptObj, holStaObj, fromDatObj, resSkiBoo) // => Date or null
 * ```
 *
*/

function nexEliFun( tasRecObj, remOptObj, holStaObj, fromDatObj = new Date(), resSkiBoo = false ) {


	const optNorObj = optForFun( tasRecObj, remOptObj );                                                 // What: Options Normalized Object. Why: The weekend/holiday exclusion guards inside the loop below both read from tasRecObj's own governing class. How: This calls optForFun once and reuses the result.
	const basDatObj = new Date( fromDatObj.getFullYear(), fromDatObj.getMonth(), fromDatObj.getDate() ); // What: Base Date Object. Why: Every candidate day stepped through below is relative to fromDatObj with its own time-of-day stripped. How: This rebuilds a Date from fromDatObj's own year/month/day alone.
	const itvCouNum = Math.max( 1, tasRecObj.interval || 1 );                                            // What: Interval Count Number. Why: The search horizon below needs to scale with a sparse "every N ___" schedule, or it could fail to find its own next occurrence. How: This reads tasRecObj's own interval, floored at 1.
	const horDayNum = tasRecObj.repeat === 'annual' ? itvCouNum * 366 + 366 // What: Horizon Day Number. Why: 1100 days (~3 years) comfortably covers the old max (annual, interval 1) but not a large "every N weeks/months/years", and a one-time task's own onceDate has no upper bound (a plain date picker), so a far-future pick needs its own horizon or this function would falsely report "this will never show". How: This picks a horizon sized to tasRecObj's own repeat kind and interval, or (for 'once') the distance to its own onceDate plus 30 days of slack.
		: tasRecObj.repeat === 'monthly' ? itvCouNum * 31 + 31
		: tasRecObj.repeat === 'weekly' ? itvCouNum * 7 + 7
		: ( tasRecObj.repeat === 'once' && tasRecObj.onceDate ) ? Math.round( ( parIsoFun( tasRecObj.onceDate ) - basDatObj ) / 86400000 ) + 30
		: 1100;
	const horValNum = Math.max( 1100, horDayNum ); // What: Horizon Value Number. Why: The loop below needs a single floored-at-1100 day count to actually iterate up to. How: This floors horDayNum at 1100.


	for ( let dayOffNum = 1; dayOffNum <= horValNum; dayOffNum++ ) { // What: Search Loop. Why: Every candidate day from tomorrow through the horizon must be checked in order, so the FIRST one that qualifies is genuinely the next eligible one. How: This walks basDatObj forward one day at a time via dayOffNum.


		const curDatObj = new Date( basDatObj ); // What: Current Date Object. Why: Each iteration needs its own fresh Date to step forward, without mutating basDatObj itself. How: This copies basDatObj.

		curDatObj.setDate( basDatObj.getDate() + dayOffNum ); // What: Current Date Step. Why: This is the actual step to today's candidate day. How: This mutates curDatObj in place to basDatObj's own date plus dayOffNum.

		if ( !isaDueFun( tasRecObj, curDatObj ) ) continue; // What: Not-Due Guard. Why: A candidate day tasRecObj isn't even due on can never be the next eligible one. How: This skips to the next iteration when isaDueFun returns false.

		if ( resSkiBoo && tasRecObj.skipUntil && isoDatFun( curDatObj ) < tasRecObj.skipUntil ) continue; // What: Active Skip Guard. Why: When resSkiBoo is honored, a day still inside an active skipUntil window can't be the next eligible one either. How: This skips to the next iteration when all 3 conditions hold.

		const isaWkdBoo = curDatObj.getDay() === 0 || curDatObj.getDay() === 6; // What: Is-A Weekend Boolean. Why: The weekend-exclusion guard right below needs to know whether curDatObj itself falls on a weekend. How: This checks curDatObj's own weekday against Sunday (0) and Saturday (6).

		if ( optNorObj.excludeWeekends && isaWkdBoo ) continue; // What: Weekend Exclusion Guard. Why: This class has opted out of showing on a weekend, and curDatObj is one. How: This skips to the next iteration when both conditions hold.

		if ( optNorObj.excludeHolidays && HOL_NAM_OBJ && HOL_NAM_OBJ.holDatFun( holStaObj, curDatObj ) ) continue; // What: Holiday Exclusion Guard. Why: This class has opted out of showing on a holiday, and curDatObj is one; the HOL_NAM_OBJ existence check must stay part of this same short-circuit chain, never split out, since holDatFun can't be called before HOL_NAM_OBJ itself is confirmed to exist. How: This skips to the next iteration when all 3 conditions hold.



		return curDatObj; // What: Next Eligible Return. Why: curDatObj survived every guard above, so it's genuinely the first eligible day. How: This returns curDatObj directly.


	}



	return null; // What: No Match Return. Why: No candidate day within the whole horizon ever qualified. How: This returns null once the loop above completes without an early return.


}

// #endregion nexEliFun



const TAS_RPT_ARR = [ 'once', 'weekly', 'interval', 'monthly', 'annual' ]; // What: Task Repeat Array. Why: This is the fixed set of valid repeat values every task's own repeat field must fall back to one of. How: This is re-exported as TASKS.REPEATS below, read by the editor's own repeat-kind dropdown.



export const TASKS = { // What: Tasks Namespace Object. Why: store.jsx, reminders.jsx, day-log.jsx, tab-today.jsx, tab-stats.jsx, seed.js, and the onboarding modules all import this one namespace object rather than several individual named exports. How: This maps every one of this file's own renamed internal implementations back onto the SAME external property names those callers already depend on.


	defaultTask     : defTasFun, // What: Default Task. Why: Callers build a fully-defaulted task/reminder record by this exact name. How: This re-exports defTasFun under its original external property name.
	isDueToday      : isaDueFun, // What: Is Due Today. Why: Callers check whether a task is due on a given date by this exact name. How: This re-exports isaDueFun under its original external property name.
	isDoneToday     : isaDonFun, // What: Is Done Today. Why: Callers check whether a task's own occurrence is already completed by this exact name. How: This re-exports isaDonFun under its original external property name.
	isStaleOnce     : isaStaFun, // What: Is Stale Once. Why: store.jsx's own migrate() drops a previous-day completed one-time task by this exact name. How: This re-exports isaStaFun under its original external property name.
	isCompletedOnce : isaComFun, // What: Is Completed Once. Why: Callers drop a same-day completed one-time task by this exact name. How: This re-exports isaComFun under its original external property name.
	summary         : sumTasFun, // What: Summary. Why: Callers need a task's own human-readable schedule summary by this exact name. How: This re-exports sumTasFun under its original external property name.
	dueToday        : dueTodFun, // What: Due Today. Why: Callers need the due, non-hidden, stably-sorted task list by this exact name. How: This re-exports dueTodFun under its original external property name.
	defaultOpts     : defOptFun, // What: Default Opts. Why: Callers need the canonical default participation-options shape by this exact name. How: This re-exports defOptFun under its original external property name.
	normalizeOpts   : norOptFun, // What: Normalize Opts. Why: store.jsx's own migrate() and every opts-reading caller need a fully-shaped options object by this exact name. How: This re-exports norOptFun under its original external property name.
	isRecurring     : isaRecFun, // What: Is Recurring. Why: Callers check whether a task belongs to the recurring (vs one-time) options class by this exact name. How: This re-exports isaRecFun under its original external property name.
	optsFor         : optForFun, // What: Opts For. Why: Callers need a specific task's own governing options object by this exact name. How: This re-exports optForFun under its original external property name.
	visibleToday    : visTodFun, // What: Visible Today. Why: Callers need the actually-visible-on-Today task list by this exact name. How: This re-exports visTodFun under its original external property name.
	nextEligible    : nexEliFun, // What: Next Eligible. Why: Callers need a task's own next eligible occurrence by this exact name. How: This re-exports nexEliFun under its original external property name.
	todayVisibility : todVisFun, // What: Today Visibility. Why: Callers need the full visible/cause/next advisory for a single task by this exact name. How: This re-exports todVisFun under its original external property name.
	isoToday        : curIsoFun, // What: Iso Today. Why: Callers need today's own ISO date string by this exact name. How: This re-exports curIsoFun under its original external property name.
	isoOf           : isoDatFun, // What: Iso Of. Why: Callers need an arbitrary date's own ISO string by this exact name. How: This re-exports isoDatFun under its original external property name.
	anchorDate      : ancDatFun, // What: Anchor Date. Why: Callers need the generator-anchored "what day is it" Date by this exact name. How: This re-exports ancDatFun under its original external property name.
	REPEATS         : TAS_RPT_ARR // What: Repeats. Why: Callers (a task's own repeat-kind dropdown) need the fixed list of valid repeat option values. How: This re-exports TAS_RPT_ARR under its original external property name.


};


