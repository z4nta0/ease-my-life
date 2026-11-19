


// #region Imports

import { dimValFun } from './dates.ts'; // What: Days-In-Month Value Function. Why: The last Monday of May depends on May's length. How: This reads a month's day count.
import { dowValFun } from './dates.ts'; // What: Day-Of-Week Value Function. Why: Weekend shifts and last-weekday rules read weekdays. How: This reads a date's weekday.
import { isoParFun } from './dates.ts'; // What: ISO Parts Function. Why: Each rule produces a year, month, and day. How: This writes them as YYYY-MM-DD.
import { nthDayFun } from './dates.ts'; // What: Nth Day Function. Why: Most holidays are the nth weekday of a month. How: This finds that day.


import type { HolStaTyp } from '../../src/core/data-model.ts'; // What: Holiday State Type. Why: The rules read the saved holiday settings. How: This types holSetFun's settings parameter.

// #endregion Imports



/**
 * holidays.ts = Holidays
 *
 * @summary
 * The checker's own copy of the app's US holiday rules, written from the
 * rules rather than from core/holidays.ts, so a mistake there shows up as a
 * disagreement here. Pickers that skip holidays and reminder classes that
 * exclude them both depend on this set.
 *
 * The rules: New Year's Day, Juneteenth, Independence Day, Veterans Day,
 * and Christmas fall on fixed dates, and when one lands on a Saturday it is
 * observed the Friday before, on a Sunday the Monday after, with only the
 * observed date counting (so New Year's can be observed on December 31 of
 * the year before). Martin Luther King Jr. Day, Presidents Day, Labor Day,
 * Columbus Day, and Thanksgiving are nth weekdays; Memorial Day is the last
 * Monday of May. A holiday whose key is in the saved disabled list is off.
 * Custom holidays fall on their exact date, never shifted and never
 * disabled, and a custom February 29 rolls to March 1 in a common year.
 *
 * Sections:
 *  - Constants
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const FIX_HOL_ARR = [ // What: Fixed Holiday Array. Why: These holidays fall on a set date, shifted off weekends. How: Each row names the holiday's key, month, and day.


	{ dayNum : 1,  keyStr : 'newyear',      monNum : 1  }, // What: New Year's Day Row. Why: January 1 is a US holiday. How: This is fixed at January 1.
	{ dayNum : 19, keyStr : 'juneteenth',   monNum : 6  }, // What: Juneteenth Row. Why: June 19 is a US holiday. How: This is fixed at June 19.
	{ dayNum : 4,  keyStr : 'independence', monNum : 7  }, // What: Independence Day Row. Why: July 4 is a US holiday. How: This is fixed at July 4.
	{ dayNum : 11, keyStr : 'veterans',     monNum : 11 }, // What: Veterans Day Row. Why: November 11 is a US holiday. How: This is fixed at November 11.
	{ dayNum : 25, keyStr : 'christmas',    monNum : 12 }  // What: Christmas Row. Why: December 25 is a US holiday. How: This is fixed at December 25.


];



const NTH_HOL_ARR = [ // What: Nth Holiday Array. Why: These holidays are an nth weekday of a month. How: Each row names the holiday's key, month, occurrence, and weekday.


	{ dowNum : 1, keyStr : 'mlk',          monNum : 1,  nthNum : 3 }, // What: MLK Day Row. Why: Martin Luther King Jr. Day is a US holiday. How: This is the 3rd Monday of January.
	{ dowNum : 1, keyStr : 'presidents',   monNum : 2,  nthNum : 3 }, // What: Presidents Day Row. Why: Presidents Day is a US holiday. How: This is the 3rd Monday of February.
	{ dowNum : 1, keyStr : 'labor',        monNum : 9,  nthNum : 1 }, // What: Labor Day Row. Why: Labor Day is a US holiday. How: This is the 1st Monday of September.
	{ dowNum : 1, keyStr : 'columbus',     monNum : 10, nthNum : 2 }, // What: Columbus Day Row. Why: Columbus Day is a US holiday. How: This is the 2nd Monday of October.
	{ dowNum : 4, keyStr : 'thanksgiving', monNum : 11, nthNum : 4 }  // What: Thanksgiving Row. Why: Thanksgiving is a US holiday. How: This is the 4th Thursday of November.


];

// #endregion Constants



// #region Helpers

// #region holSetFun

/**
 * holSetFun = Holiday Set Function
 *
 * @summary
 * Every date the saved settings treat as a holiday within a year, plus the
 * observed dates the neighboring years push into it (a Saturday New Year's
 * Day of the next year is observed on this year's December 31). Dates are
 * YYYY-MM-DD strings, so membership is a plain Set lookup.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param holStaObj - Holiday State Object: The saved holiday settings.
 * @param yeaValNum - Year Value Number: The year to list.
 *
 * @returns The set of holiday dates that touch the year.
 * @see {@link holDatSet}
 *
 * @example
 * ```ts
 * holSetFun(staAppObj.holidays, 2026) // => Set { '2026-01-01', ... }
 * ```
 *
*/

const holSetFun = ( holStaObj : HolStaTyp | undefined, yeaValNum : number ) : Set< string > => { // What: Holiday Set Function. Why: Holiday skipping needs the year's holiday dates. How: This applies every rule for the year and its neighbors and collects the dates.


	const holDatSet = new Set< string >();                                  // What: Holiday Date Set. Why: Membership checks are lookups by date. How: This collects every holiday date found.
	const disKeySet = new Set( ( holStaObj && holStaObj.disabled ) || [] ); // What: Disabled Key Set. Why: A disabled holiday doesn't count. How: This holds the saved disabled keys.



	for ( const rulYeaNum of [ yeaValNum - 1, yeaValNum, yeaValNum + 1 ] ) { // What: Rule Year Loop. Why: A neighboring year's observed date can fall in this one. How: This applies the rules for the year before, the year, and the year after.


		for ( const fixHolObj of FIX_HOL_ARR ) { // What: Fixed Holiday Loop. Why: Each fixed holiday has to be shifted off a weekend. How: This finds each one's observed date.


			if ( disKeySet.has( fixHolObj.keyStr ) ) continue; // What: Disabled Skip Guard. Why: A disabled holiday doesn't count. How: This skips it.



			const holDayStr = isoParFun( rulYeaNum, fixHolObj.monNum, fixHolObj.dayNum ); // What: Holiday Day String. Why: The shift starts from the actual date. How: This writes the fixed date for the year.
			const holDowNum = dowValFun( holDayStr );                                     // What: Holiday Day-Of-Week Number. Why: Only a weekend date shifts. How: This reads its weekday.

			const shiValNum = holDowNum === 6 ? -1 : ( holDowNum === 0 ? 1 : 0 ); // What: Shift Value Number. Why: Saturday is observed Friday and Sunday is observed Monday. How: This is the day shift for the weekday.



			holDatSet.add( new Date( Date.UTC( rulYeaNum, fixHolObj.monNum - 1, fixHolObj.dayNum + shiValNum ) ).toISOString().slice( 0, 10 ) ); // What: Observed Date Add. Why: Only the observed date counts. How: This adds the shifted date, letting Date.UTC roll across a month or year.


		}



		for ( const nthHolObj of NTH_HOL_ARR ) if ( !disKeySet.has( nthHolObj.keyStr ) ) holDatSet.add( isoParFun( rulYeaNum, nthHolObj.monNum, nthDayFun( rulYeaNum, nthHolObj.monNum, nthHolObj.nthNum, nthHolObj.dowNum ) ) ); // What: Nth Holiday Loop. Why: These holidays are a weekday rule. How: This adds each enabled one's date.



		if ( !disKeySet.has( 'memorial' ) ) { // What: Memorial Day Check. Why: Memorial Day is the last Monday of May, unless disabled. How: This steps back from May 31 to a Monday.


			const lasDayNum = dimValFun( rulYeaNum, 5 ); // What: Last Day Number. Why: The search starts from May's last day. How: This is 31.



			holDatSet.add( isoParFun( rulYeaNum, 5, lasDayNum - ( ( dowValFun( isoParFun( rulYeaNum, 5, lasDayNum ) ) - 1 + 7 ) % 7 ) ) ); // What: Memorial Day Add. Why: Memorial Day is the last Monday of May. How: This steps back from May 31 by however many days it is past a Monday.


		}



		for ( const cusHolObj of ( holStaObj && holStaObj.custom ) || [] ) holDatSet.add( new Date( Date.UTC( rulYeaNum, cusHolObj.month - 1, cusHolObj.day ) ).toISOString().slice( 0, 10 ) ); // What: Custom Holiday Loop. Why: Custom holidays fall on their exact date. How: This adds each one, letting February 29 roll to March 1 in a common year.


	}



	return holDatSet; // What: Holiday Dates Return. Why: Callers test a date against the year's holidays. How: This returns the collected set.


};

// #endregion holSetFun



// #region isaHolFun

/**
 * isaHolFun = Is-A Holiday Function
 *
 * @summary
 * Whether a date is a holiday under the saved settings.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param holStaObj - Holiday State Object: The saved holiday settings.
 * @param dayIsoStr - Day ISO String: The date to check, as YYYY-MM-DD.
 *
 * @returns Whether the date is a holiday.
 *
 * @example
 * ```ts
 * isaHolFun(staAppObj.holidays, '2026-11-26') // => true
 * ```
 *
*/

const isaHolFun = ( holStaObj : HolStaTyp | undefined, dayIsoStr : string ) : boolean => holSetFun( holStaObj, Number( dayIsoStr.slice( 0, 4 ) ) ).has( dayIsoStr ); // What: Is-A Holiday Function. Why: Pickers and reminders skip holidays. How: This builds the date's year set and looks the date up.

// #endregion isaHolFun

// #endregion Helpers



// #region Exports

export { isaHolFun }; // What: Named Exports. Why: The schedule checks ask whether a day is a holiday through this. How: This exports isaHolFun by name.

// #endregion Exports


