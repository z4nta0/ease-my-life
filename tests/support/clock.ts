


// #region Imports

import type { Page } from '@playwright/test'; // What: Page. Why: The clock helpers drive a Playwright page's faked time. How: This types each helper's page parameter.

// #endregion Imports



/**
 * clock.ts = Clock
 *
 * @summary
 * Fakes the page's clock in the app's own timezone, America/Chicago, the
 * timezone the real data was made in, so "10 AM on October 5" has to mean 10
 * AM Chicago time whatever timezone the machine running the tests is in, and
 * whether daylight saving applies that day or not. Its helpers set the fake
 * clock to such a moment, before the app loads or later on, with time flowing
 * normally from wherever it's set, and convert to and from Chicago time, such
 * as turning a saved timestamp back into the Chicago date it falls on.
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

const TIM_ZON_STR = 'America/Chicago'; // What: Time Zone String. Why: Day boundaries decide what the simulation checks, and the real data was made in this timezone. How: This names the Chicago timezone the helpers read and write times in.



const DAY_FOR_OBJ = new Intl.DateTimeFormat( 'en-CA', { day : '2-digit', month : '2-digit', timeZone : TIM_ZON_STR, year : 'numeric' } );    // What: Day Format Object. Why: The en-CA format writes dates as YYYY-MM-DD. How: This formats an instant as its Chicago date.
const HOU_FOR_OBJ = new Intl.DateTimeFormat( 'en-US', { hour : 'numeric', hourCycle : 'h23', minute : 'numeric', timeZone : TIM_ZON_STR } ); // What: Hour Format Object. Why: Finding an instant needs its Chicago hour and minute. How: This formats an instant as its Chicago time of day.

// #endregion Constants



// #region Helpers

// #region locDayFun

/**
 * locDayFun = Local Day Function
 *
 * @summary
 * Returns the Chicago date an instant falls on, as YYYY-MM-DD. The app saves
 * timestamps like generatedAt and completedAt in UTC, while the suites
 * reason in Chicago dates.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param timValStr - Time Value String: An ISO timestamp.
 *
 * @returns The Chicago date it falls on.
 *
 * @example
 * ```ts
 * locDayFun('2026-10-06T03:00:00.000Z') // => '2026-10-05'
 * ```
 *
*/

const locDayFun = ( timValStr : string ) : string => DAY_FOR_OBJ.format( new Date( timValStr ) ); // What: Local Day Function. Why: Saved timestamps are UTC but the suites reason in Chicago dates. How: This formats the instant as its Chicago date.

// #endregion locDayFun



// #region locTimFun

/**
 * locTimFun = Local Time Function
 *
 * @summary
 * Returns the instant at which the Chicago clock reads the given date, hour,
 * and minute. Chicago is five hours behind UTC in daylight saving time and
 * six otherwise, so both offsets are tried and the one whose instant reads
 * back as the requested date and time wins. A time inside a daylight saving
 * jump has no single instant and throws.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param dayIsoStr - Day ISO String: The Chicago date, as YYYY-MM-DD.
 * @param houValNum - Hour Value Number: The Chicago hour, 0 to 23.
 * @param minValNum - Minute Value Number: The Chicago minute, defaulting to 0.
 *
 * @returns The matching instant.
 * @see {@link canTimObj}
 *
 * @example
 * ```ts
 * locTimFun('2026-10-05', 10) // => 2026-10-05T15:00:00.000Z
 * ```
 *
*/

const locTimFun = ( dayIsoStr : string, houValNum : number, minValNum : number = 0 ) : Date => { // What: Local Time Function. Why: Faked times are named in Chicago time. How: This tries both Chicago offsets and returns the instant that reads back as the request.


	const [ yeaValNum, monValNum, dayValNum ] = dayIsoStr.split( '-' ).map( Number ); // What: Year Value Number. Why: The candidate instants are built from the date's parts. How: This splits the ISO date into numbers and keeps the first. // What: Month Value Number. Why: The month is the second part. How: This keeps the second. // What: Day Value Number. Why: The day is the third part. How: This keeps the third.

	const wanTimStr = `${ houValNum }:${ String( minValNum ).padStart( 2, '0' ) }`; // What: Wanted Time String. Why: A candidate instant is checked against the requested time of day. How: This formats it the way HOU_FOR_OBJ does.



	for ( const offHouNum of [ 5, 6 ] ) { // What: Offset Loop. Why: Chicago is UTC-5 in daylight saving and UTC-6 otherwise. How: This tries each offset in turn.


		const canTimObj = new Date( Date.UTC( yeaValNum, monValNum - 1, dayValNum, houValNum + offHouNum, minValNum ) ); // What: Candidate Time Object. Why: Adding the offset to the Chicago time gives a UTC time to test. How: This builds that UTC instant, letting Date.UTC roll past midnight.



		if ( DAY_FOR_OBJ.format( canTimObj ) === dayIsoStr && HOU_FOR_OBJ.format( canTimObj ) === wanTimStr ) return canTimObj; // What: Match Return. Why: The right offset reads back as the requested date and time. How: This returns the first candidate that does.


	}



	throw new Error( `No Chicago instant for ${ dayIsoStr } ${ wanTimStr }` ); // What: No Match Error. Why: A time inside a daylight saving jump has no single instant. How: This throws with the request.


};

// #endregion locTimFun



// #region insClcFun

/**
 * insClcFun = Install Clock Function
 *
 * @summary
 * Installs Playwright's fake clock on a page, set to the given Chicago date
 * and hour, before the app loads. It comes before the first navigation, as
 * Playwright's docs advise, so the page starts with the fake Date and timers
 * in place. Time then flows normally from that moment.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page to fake the clock on.
 * @param dayIsoStr - Day ISO String: The Chicago date, as YYYY-MM-DD.
 * @param houValNum - Hour Value Number: The Chicago hour, 0 to 23.
 *
 * @returns A promise that settles once the clock is installed, with no value.
 *
 * @example
 * ```ts
 * await insClcFun(curPagObj, '2026-10-05', 10) // => Promise<void>
 * ```
 *
*/

const insClcFun = async ( curPagObj : Page, dayIsoStr : string, houValNum : number ) : Promise< void > => curPagObj.clock.install( { time : locTimFun( dayIsoStr, houValNum ) } ); // What: Install Clock Function. Why: Simulated days need the page to believe it's a chosen date. How: This installs the fake clock at that Chicago time.

// #endregion insClcFun



// #region setClcFun

/**
 * setClcFun = Set Clock Function
 *
 * @summary
 * Moves an installed fake clock to another Chicago date and hour. Only the
 * current time jumps; no timers fire for the time skipped over.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page whose clock to move.
 * @param dayIsoStr - Day ISO String: The Chicago date, as YYYY-MM-DD.
 * @param houValNum - Hour Value Number: The Chicago hour, 0 to 23.
 *
 * @returns A promise that settles once the clock has moved, with no value.
 *
 * @example
 * ```ts
 * await setClcFun(curPagObj, '2026-10-06', 10) // => Promise<void>
 * ```
 *
*/

const setClcFun = async ( curPagObj : Page, dayIsoStr : string, houValNum : number ) : Promise< void > => curPagObj.clock.setSystemTime( locTimFun( dayIsoStr, houValNum ) ); // What: Set Clock Function. Why: Each simulated day starts at a chosen Chicago time. How: This jumps the fake clock there.

// #endregion setClcFun

// #endregion Helpers



// #region Exports

export { insClcFun, locDayFun, setClcFun, TIM_ZON_STR }; // What: Named Exports. Why: The timezone is set once here, and the clock is faked through these. How: This exports the clock helpers and the timezone by name.

// #endregion Exports


