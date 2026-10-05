


/**
 * date.ts = Date
 *
 * @summary
 * App-agnostic date helpers shared across the app: the local-calendar ISO day
 * key every dated state field and log row is keyed by, the compact, long, and
 * time-of-day display formatters, and the calendar math behind monthly and
 * yearly schedules (days in a month, the nth weekday of a month, and ordinal
 * suffixes). Nothing here knows about pickers, tasks, or app state.
 *
 * Sections:
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Helpers

// #region dimCouFun

/**
 * dimCouFun = Days-In-Month Count Function
 *
 * @summary
 * The number of real days in a given month, e.g. 29 for February in a
 * leap year. Month numbers are 1-based here, unlike JS Date months.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param yeaValNum - Year Value Number: The calendar year to check.
 * @param monOneNum - Month One Number: The 1-indexed month to check (1 for
 *                    January through 12 for December).
 *
 * @returns The month's own day count, 28 through 31.
 *
 * @example
 * ```ts
 * dimCouFun(2028, 2) // => 29
 * ```
 *
*/

const dimCouFun = ( yeaValNum : number, monOneNum : number ) : number => new Date( yeaValNum, monOneNum, 0 ).getDate(); // What: Days-In-Month Count Function. Why: Monthly/yearly clamping and nth-weekday math both need to know how many days a given month actually has. How: This asks for day 0 of the FOLLOWING month, which JS's own Date resolves back to the last real day of monOneNum.

// #endregion dimCouFun



// #region forDatFun

/**
 * forDatFun = Format Date Function
 *
 * @summary
 * Formats a date the compact way the app shows dates everywhere (Today's
 * header, Stats rows, ...): short weekday, short month, day. With no
 * argument it formats right now.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param isoDatStr - Iso Date String: The date to format, or omitted for now.
 *
 * @returns The formatted date, e.g. 'Sun, Sep 27'.
 *
 * @example
 * ```ts
 * forDatFun('2026-09-27') // => 'Sun, Sep 27'
 * ```
 *
*/

const forDatFun = ( isoDatStr? : string ) : string => { // What: Format Date Function. Why: Every date shown compactly across the app (Today's header, Stats rows, ...) needs the same short weekday/month/day format. How: This builds a Date from isoDatStr (or now, when omitted) and formats it via toLocaleDateString.


	const parDatObj = isoDatStr ? new Date( isoDatStr ) : new Date(); // What: Parsed Date Object. Why: Every caller may pass an ISO string or omit it entirely for "right now". How: This constructs a Date from isoDatStr when given, otherwise the current moment.



	return parDatObj.toLocaleDateString( 'en-US', { day : 'numeric', month : 'short', weekday : 'short' } ); // What: Short Date Return. Why: The caller needs the actual formatted string, not the Date object itself. How: This formats parDatObj as e.g. "Wed, May 13" via the locale API.


};

// #endregion forDatFun



// #region forLonFun

/**
 * forLonFun = Format Long Function
 *
 * @summary
 * The same as forDatFun, but with the full weekday name, for the few
 * long-form date displays. With no argument it formats right now.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param isoDatStr - Iso Date String: The date to format, or omitted for now.
 *
 * @returns The formatted date, e.g. 'Sunday, Sep 27'.
 *
 * @example
 * ```ts
 * forLonFun('2026-09-27') // => 'Sunday, Sep 27'
 * ```
 *
*/

const forLonFun = ( isoDatStr? : string ) : string => { // What: Format Long Function. Why: A few spots (long-form date displays) need the full weekday name instead of the short 3-letter one. How: This builds a Date from isoDatStr (or now, when omitted) and formats it via toLocaleDateString with a long weekday.


	const parDatObj = isoDatStr ? new Date( isoDatStr ) : new Date(); // What: Parsed Date Object. Why: Every caller may pass an ISO string or omit it entirely for "right now". How: This constructs a Date from isoDatStr when given, otherwise the current moment.



	return parDatObj.toLocaleDateString( 'en-US', { day : 'numeric', month : 'short', weekday : 'long' } ); // What: Long Date Return. Why: The caller needs the actual formatted string, not the Date object itself. How: This formats parDatObj as e.g. "Wednesday, May 13" via the locale API.


};

// #endregion forLonFun



// #region forTimFun

/**
 * forTimFun = Format Time Function
 *
 * @summary
 * Formats a time as a plain hour and minute with no seconds. With no
 * argument it formats right now.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param isoDatStr - Iso Date String: The moment to format, or omitted for
 *                    now.
 *
 * @returns The formatted time, e.g. '3:42 PM'.
 *
 * @example
 * ```ts
 * forTimFun(isoDatStr) // => '3:42 PM'
 * ```
 *
*/

const forTimFun = ( isoDatStr? : string ) : string => { // What: Format Time Function. Why: A few spots need a plain "3:42 PM" style time with no seconds. How: This builds a Date from isoDatStr (or now, when omitted) and formats it via toLocaleTimeString.


	const parDatObj = isoDatStr ? new Date( isoDatStr ) : new Date(); // What: Parsed Date Object. Why: Every caller may pass an ISO string or omit it entirely for "right now". How: This constructs a Date from isoDatStr when given, otherwise the current moment.



	return parDatObj.toLocaleTimeString( 'en-US', { hour : 'numeric', minute : '2-digit' } ); // What: Time Return. Why: The caller needs the actual formatted string, not the Date object itself. How: This formats parDatObj as e.g. "3:42 PM" via the locale API.


};

// #endregion forTimFun



// #region isoDayFun

/**
 * isoDayFun = Iso Day Function
 *
 * @summary
 * Converts a Date into its own local-timezone calendar day, as a plain
 * 'YYYY-MM-DD' string. Every pick/conditional/reminder log row and
 * every day-scoped comparison in this file goes through this, so "today"
 * always means the same local calendar day everywhere.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param datInpObj - Date Input Object: The date to convert; defaults to the
 *                    current moment when omitted.
 *
 * @returns datInpObj's own local calendar day, as a 'YYYY-MM-DD' string.
 *
 * @example
 * ```ts
 * isoDayFun(new Date()) // => 'YYYY-MM-DD'
 * ```
 *
*/

const isoDayFun = ( datInpObj : Date = new Date() ) : string => { // What: Iso Day Function. Why: Every dated state field (pick-log dates, reminder dates) needs one local-calendar day format. How: This formats datInpObj, defaulting to now, as a local YYYY-MM-DD string.


	const datCopObj = new Date( datInpObj ); // What: Date Copy Object. Why: datInpObj itself must not be mutated by the timezone shift below. How: This constructs a fresh Date instance from datInpObj.

	datCopObj.setMinutes( datCopObj.getMinutes() - datCopObj.getTimezoneOffset() ); // What: Date Copy Minutes Adjustment. Why: Shifting by the local timezone offset is what makes the ISO string below reflect the local calendar day instead of UTC's. How: This subtracts the local timezone offset, in minutes, from the copy's own minutes.



	return datCopObj.toISOString().slice( 0, 10 ); // What: Iso Day String Return. Why: The caller only wants the calendar-day portion, not a full timestamp. How: This takes the shifted copy's own ISO string and slices off everything after the first 10 characters.


};

// #endregion isoDayFun



// #region nexDatFun

/**
 * nexDatFun = Next Date Function
 *
 * @summary
 * Formats a next-eligible date as a full prose label, not a compact
 * one. The year is included whenever the date falls outside the
 * current year, and ALWAYS for a yearly reminder, where "Monday,
 * January 25" would otherwise read like a date days away rather than
 * next year's occurrence.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param nexDatObj - Next Date Object: The next-eligible date to format, or a
 *                    falsy value when there is none.
 * @param alwYeaBoo - Always Year Boolean: Whether the year must always be
 *                    included, regardless of whether nexDatObj falls in the
 *                    current year (true for a yearly reminder).
 *
 * @returns The full prose date label, or null when nexDatObj is falsy.
 *
 * @example
 * ```ts
 * nexDatFun(nexDatObj, alwYeaBoo) // => 'Monday, January 25, 2027'
 * ```
 *
*/

function nexDatFun ( nexDatObj : Date | null, alwYeaBoo : boolean ) : string | null {


	if ( !nexDatObj ) return null; // What: Missing Date Guard. Why: A caller with no next-eligible date at all still needs a defined, safe return value. How: This returns null outright when nexDatObj is falsy.



	const shoYeaBoo = alwYeaBoo || nexDatObj.getFullYear() !== new Date().getFullYear(); // What: Show Year Boolean. Why: The year clutters a same-year date but is essential context for a yearly reminder or a date in a different year. How: This is true when alwYeaBoo was passed, or when nexDatObj's own year differs from the current year.


	const forOptObj : Intl.DateTimeFormatOptions = shoYeaBoo // What: Format Options Object. Why: The date's own locale format depends on whether the year shows. How: This picks one of the two options objects below based on shoYeaBoo.
		? { day : 'numeric', month : 'long', weekday : 'long', year : 'numeric' } // What: With-Year Format Object. Why: This is the full "Weekday, Month Day, Year" format used whenever shoYeaBoo is true. How: This is passed as toLocaleDateString's own options argument.
		: { day : 'numeric', month : 'long', weekday : 'long' };                  // What: Without-Year Format Object. Why: This is the shorter "Weekday, Month Day" format used for a same-year date on a non-yearly reminder. How: This is passed as toLocaleDateString's own options argument.



	return nexDatObj.toLocaleDateString( [], forOptObj ); // What: Next Date Return. Why: The caller needs the formatted label itself. How: This formats nexDatObj with forOptObj in the user's own locale.


}

// #endregion nexDatFun



// #region nwmDayFun

/**
 * nwmDayFun = Nth-Weekday-Month Day Function
 *
 * @summary
 * Day-of-month of the Nth (1 through 5) occurrence of a given weekday in
 * a given year/month. Clamps down to the 4th whenever a requested 5th
 * doesn't exist: every month has at least 4 of any weekday (the
 * shortest month is 28 days, exactly 4 weeks), so only the 5th can ever
 * be missing, and the 4th is always a valid fallback. Same logic as
 * tasks.ts' own nwmDayFun, duplicated per this module's own
 * isolation from tasks.ts.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param yeaValNum - Year Value Number: The calendar year to compute
 *                    against.
 * @param monOneNum - Month One Number: The 1-indexed month to compute
 *                    against (1 for January through 12 for December).
 * @param nthValNum - Nth Value Number: Which occurrence to find, 1
 *                    through 5.
 * @param weeValNum - Weekday Value Number: The target weekday, 0 for
 *                    Sunday through 6 for Saturday.
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

function nwmDayFun ( yeaValNum : number, monOneNum : number, nthValNum : number, weeValNum : number ) : number {


	const firWeeNum = new Date( yeaValNum, monOneNum - 1, 1 ).getDay();                // What: First Weekday Number. Why: Finding the Nth occurrence of weeValNum needs to know which weekday the month itself starts on. How: This reads the weekday of that month's own 1st day.
	const firOccNum = 1 + ( ( weeValNum - firWeeNum + 7 ) % 7 );                       // What: First Occurrence Number. Why: This is the day-of-month of the VERY FIRST occurrence of weeValNum in this month, the base every later occurrence is counted from. How: This walks forward from firWeeNum to weeValNum, wrapping via modulo 7.
	const dimValNum = dimCouFun( yeaValNum, monOneNum );                               // What: Days-In-Month Value Number. Why: The clamp below needs to know how many real days this month actually has. How: This calls dimCouFun once and reuses the result.
	const canDayNum = firOccNum + ( Math.max( 1, Math.min( 5, nthValNum ) ) - 1 ) * 7; // What: Candidate Day Number. Why: This is the day-of-month the requested Nth occurrence would land on before any clamping. How: This adds 7 days per occurrence past the first, with nthValNum itself clamped to [1, 5].



	return canDayNum > dimValNum ? canDayNum - 7 : canDayNum; // What: Nth-Weekday-Month Day Return. Why: A requested 5th occurrence that overshoots the month's own real length must fall back to the 4th instead. How: This steps canDayNum back by exactly one week whenever it lands past dimValNum.


}

// #endregion nwmDayFun



// #region ordSufFun

/**
 * ordSufFun = Ordinal Suffix Function
 *
 * @summary
 * Appends the correct English ordinal suffix to a number (1st, 2nd,
 * 3rd, 4th, 11th, 21st, ...).
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

function ordSufFun ( ordValNum : number ) : string {


	const sufTexArr = [ 'th', 'st', 'nd', 'rd' ];           // What: Suffix Text Array. Why: Every English ordinal suffix boils down to one of just these 4 words. How: This is indexed below by lasTwoNum's own value.
	const lasTwoNum = ordValNum % 100;                      // What: Last Two Number. Why: English ordinal suffixes are decided by a number's own last two digits (11th/12th/13th are the exception every other rule must respect). How: This is ordValNum modulo 100.
	const oneSufStr = sufTexArr[ ( lasTwoNum - 20 ) % 10 ]; // What: Ones Suffix String. Why: Past 20, the suffix follows the last digit alone (21st, 22nd, 23rd, 31st, ...). How: This reads sufTexArr at lasTwoNum minus 20, modulo 10, which is undefined below 21 and for any last digit past 3.
	const lowSufStr = sufTexArr[ lasTwoNum ];               // What: Low Suffix String. Why: Below 20, only 1, 2 and 3 take their own suffix, so 11th, 12th and 13th fall through to 'th'. How: This reads sufTexArr at lasTwoNum directly, which is undefined from 4 upward.
	const defSufStr = sufTexArr[ 0 ];                       // What: Default Suffix String. Why: Every number neither lookup above matched takes 'th'. How: This reads sufTexArr's own first entry.

	const finSufStr = oneSufStr || lowSufStr || defSufStr; // What: Final Suffix String. Why: The ones suffix, the low suffix and the default must be tried in that order. How: This takes the first of the three that is defined.



	return ordValNum + finSufStr; // What: Ordinal Suffix Return. Why: The caller needs the full suffixed string back, not just the suffix. How: This appends finSufStr to ordValNum.


}

// #endregion ordSufFun

// #endregion Helpers



// #region Exports

export { dimCouFun, forDatFun, forLonFun, forTimFun, isoDayFun, nexDatFun, nwmDayFun, ordSufFun }; // What: Named Exports. Why: Core schedules, state, and UI all format and compute dates the same way. How: This exports every helper above by name.

// #endregion Exports


