


/**
 * dates.ts = Dates
 *
 * @summary
 * Calendar math on plain YYYY-MM-DD dates for the simulation's checker. It
 * is written independently of the app's own utils/date.ts, so the checker
 * can't inherit a bug from the code it's checking. Every helper works in
 * UTC on the date's own year, month, and day, so no timezone or daylight
 * saving shift can move a date; the Chicago clock only matters when the
 * suite turns a timestamp into a date, which clock.ts does.
 *
 * Sections:
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Helpers

const daySerFun = ( dayIsoStr : string ) : number => Date.parse( `${ dayIsoStr }T00:00:00Z` ) / 86400000;                                                                                              // What: Day Serial Function. Why: Day differences are simplest as whole-day counts. How: This turns a date into days since 1970.
const serDayFun = ( daySerNum : number ) : string => new Date( daySerNum * 86400000 ).toISOString().slice( 0, 10 );                                                                                    // What: Serial Day Function. Why: Arithmetic results have to become dates again. How: This turns a day count back into YYYY-MM-DD.
const addDayFun = ( dayIsoStr : string, addValNum : number ) : string => serDayFun( daySerFun( dayIsoStr ) + addValNum );                                                                              // What: Add Day Function. Why: The simulation steps and looks back by whole days. How: This shifts a date by a number of days.
const difDayFun = ( froIsoStr : string, toaIsoStr : string ) : number => daySerFun( toaIsoStr ) - daySerFun( froIsoStr );                                                                              // What: Difference Day Function. Why: Intervals and anchors are measured in days. How: This returns how many days the second date is after the first.
const dowValFun = ( dayIsoStr : string ) : number => new Date( `${ dayIsoStr }T00:00:00Z` ).getUTCDay();                                                                                               // What: Day-Of-Week Value Function. Why: Weekday rules read the weekday, 0 for Sunday. How: This reads it in UTC from the date's own parts.
const dimValFun = ( yeaValNum : number, monValNum : number ) : number => new Date( Date.UTC( yeaValNum, monValNum, 0 ) ).getUTCDate();                                                                 // What: Days-In-Month Value Function. Why: Day-of-month rules clamp to a month's length. How: This reads day 0 of the next month, the last day of this one.
const isoParFun = ( yeaValNum : number, monValNum : number, dayValNum : number ) : string => `${ yeaValNum }-${ String( monValNum ).padStart( 2, '0' ) }-${ String( dayValNum ).padStart( 2, '0' ) }`; // What: ISO Parts Function. Why: Rules compute dates from a year, month, and day. How: This writes them as YYYY-MM-DD.
const parIsoFun = ( dayIsoStr : string ) : number[] => dayIsoStr.split( '-' ).map( Number ); // What: Parts ISO Function. Why: Rules read a date's year, month, and day. How: This splits YYYY-MM-DD into numbers.



// #region nthDayFun

/**
 * nthDayFun = Nth Day Function
 *
 * @summary
 * The day of the month that is the nth given weekday of a month, the rule
 * behind "the 2nd Tuesday" schedules. A 5th occurrence that doesn't exist
 * falls back to the 4th, the same promise the app's schedules make.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param yeaValNum - Year Value Number: The year.
 * @param monValNum - Month Value Number: The month, 1 to 12.
 * @param nthValNum - Nth Value Number: Which occurrence, 1 to 5.
 * @param dowValNum - Day-Of-Week Value Number: The weekday, 0 for Sunday.
 *
 * @returns The day of the month.
 *
 * @example
 * ```ts
 * nthDayFun(2026, 11, 4, 4) // => 26, the 4th Thursday of November 2026
 * ```
 *
*/

const nthDayFun = ( yeaValNum : number, monValNum : number, nthValNum : number, dowValNum : number ) : number => { // What: Nth Day Function. Why: Nth-weekday schedules need the actual date. How: This finds the first such weekday, steps whole weeks, and falls back a week past the month's end.


	const firDowNum = dowValFun( isoParFun( yeaValNum, monValNum, 1 ) );               // What: First Day-Of-Week Number. Why: The first occurrence depends on what weekday the month starts on. How: This reads the 1st's weekday.
	const firDayNum = 1 + ( ( dowValNum - firDowNum + 7 ) % 7 );                       // What: First Day Number. Why: Every later occurrence is whole weeks after the first. How: This finds the first matching day.
	const canDayNum = firDayNum + ( Math.min( 5, Math.max( 1, nthValNum ) ) - 1 ) * 7; // What: Candidate Day Number. Why: The nth occurrence is n minus one weeks later. How: This steps from the first, with n clamped to 1 to 5.



	return canDayNum > dimValFun( yeaValNum, monValNum ) ? canDayNum - 7 : canDayNum; // What: Nth Day Return. Why: A missing 5th occurrence falls back to the 4th. How: This steps back a week when the candidate runs past the month.


};

// #endregion nthDayFun

// #endregion Helpers



// #region Exports

export { addDayFun, difDayFun, dimValFun, dowValFun, isoParFun, nthDayFun, parIsoFun }; // What: Named Exports. Why: The checker's schedule and holiday rules build on these. How: This exports the date helpers by name.

// #endregion Exports


