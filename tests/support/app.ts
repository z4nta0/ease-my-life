


// #region Imports

import { insClcFun } from './clock.ts';   // What: Install Clock Function. Why: Opening the backup starts the fake clock on a fixed day. How: This installs it.
import { locDayFun } from './clock.ts';   // What: Local Day Function. Why: Generation is confirmed by the Chicago date of its timestamp. How: This reads generatedAt's date.
import { reaFixFun } from './fixture.ts'; // What: Read Fixture Function. Why: The layout and interaction suites run on real data. How: This reads the backup.
import { setClcFun } from './clock.ts';   // What: Set Clock Function. Why: Opening a day moves the fake clock to it first. How: This jumps the clock to the day's hour.
import { waiStaFun } from './storage.ts'; // What: Wait State Function. Why: The generated list lands on disk a moment after it shows. How: This polls until the day's list is saved.
import { wriStaFun } from './storage.ts'; // What: Write State Function. Why: Opening the backup writes it into the page. How: This loads it.


import type { Page      } from '@playwright/test';             // What: Page. Why: Every helper drives a Playwright page. How: This types each helper's page parameter.
import type { StaAppTyp } from '../../src/core/data-model.ts'; // What: State App Type. Why: Opening a day hands back the saved state it produced. How: This types opeDayFun's result.

// #endregion Imports



/**
 * app.ts = App
 *
 * @summary
 * Moves around the running app the way a person would. opeDayFun opens the
 * app on a given Chicago day, which is how the simulation advances: it
 * moves the fake clock, loads the page fresh so the Today tab mounts and
 * runs its own check for a new day, and waits until that day's list has
 * been generated and saved. selTabFun switches tabs through the real
 * navigation buttons, and opeFixFun opens the real-data backup on a fixed
 * day for the suites that need realistic content.
 *
 * Sections:
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Helpers

// #region opeDayFun

/**
 * opeDayFun = Open Day Function
 *
 * @summary
 * Opens the app on a Chicago date at the given hour and waits for that day's
 * list. The app generates on its own once the day's run time has passed, but
 * only while the Today tab is mounted, so the page is loaded fresh on Today
 * after the clock moves. Waiting on the saved state rather than the screen
 * means the caller gets the list exactly as it was committed, generatedAt
 * included.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page to open the day on.
 * @param dayIsoStr - Day ISO String: The Chicago date, as YYYY-MM-DD.
 * @param houValNum - Hour Value Number: The Chicago hour to open at,
 *                    defaulting to 10, after the usual run times.
 *
 * @returns The saved state once the day's list was generated.
 *
 * @example
 * ```ts
 * await opeDayFun(curPagObj, '2026-10-06') // => saved state for that day
 * ```
 *
*/

const opeDayFun = async ( curPagObj : Page, dayIsoStr : string, houValNum : number = 10 ) : Promise< StaAppTyp > => { // What: Open Day Function. Why: The simulation advances one day at a time. How: This moves the clock, reloads on Today, and waits for the day's list to be saved.


	await setClcFun( curPagObj, dayIsoStr, houValNum ); // What: Clock Move Call. Why: The app decides the day from its clock. How: This jumps the fake clock to the day's hour.



	await curPagObj.goto( '/' ); // What: App Load Call. Why: A fresh load mounts Today, which checks for a new day on mount. How: This opens the app's root.



	await curPagObj.locator( '[data-element-name-hook~="todTabDiv"]' ).waitFor(); // What: Today Mount Wait. Why: Generation only runs once Today has mounted. How: This waits for the Today tab's root.



	return waiStaFun( curPagObj, ( staAppObj ) => !!staAppObj.today.generatedAt && locDayFun( staAppObj.today.generatedAt ) === dayIsoStr, `list generated for ${ dayIsoStr }` ); // What: Generated State Return. Why: The caller checks the list exactly as it was committed. How: This waits until generatedAt falls on the day, then returns that state.


};

// #endregion opeDayFun



// #region opeFixFun

/**
 * opeFixFun = Open Fixture Function
 *
 * @summary
 * Opens the app on the real-data backup at a fixed Chicago day, so the
 * layout and interaction suites see real names and a real list without
 * depending on today's date. It installs the fake clock, writes the backup
 * into the page, and opens the day, which generates its list.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page to open the app on.
 * @param dayIsoStr - Day ISO String: The Chicago date to open, defaulting to
 *                    2026-10-05.
 *
 * @returns The saved state once the day's list was generated.
 *
 * @example
 * ```ts
 * await opeFixFun(curPagObj) // => saved state on the fixed day
 * ```
 *
*/

const opeFixFun = async ( curPagObj : Page, dayIsoStr : string = '2026-10-05' ) : Promise< StaAppTyp > => { // What: Open Fixture Function. Why: Suites need the app on real data at a fixed day. How: This fakes the clock, loads the backup, and opens the day.


	await insClcFun( curPagObj, dayIsoStr, 10 ); // What: Clock Install Call. Why: The day must not depend on when the suite runs. How: This installs the fake clock on the day.



	await wriStaFun( curPagObj, reaFixFun() ); // What: Backup Load Call. Why: Real names and lists show real layouts. How: This writes the backup into the page.



	return opeDayFun( curPagObj, dayIsoStr ); // What: Day Open Return. Why: The caller starts from the generated day. How: This opens the day and returns its state.


};

// #endregion opeFixFun



// #region selTabFun

/**
 * selTabFun = Select Tab Function
 *
 * @summary
 * Switches to a tab through its navigation button and waits until the
 * button reports itself as the current page. The tab ids are today,
 * picker, stats, data, and settings; the Pickers tab is picker, singular.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page to switch tabs on.
 * @param tabIdeStr - Tab Identifier String: The tab to switch to.
 *
 * @returns A promise that settles once the tab is current.
 *
 * @example
 * ```ts
 * await selTabFun(curPagObj, 'stats') // => void
 * ```
 *
*/

const selTabFun = async ( curPagObj : Page, tabIdeStr : string ) : Promise< void > => { // What: Select Tab Function. Why: Tests move between tabs the way a person does. How: This clicks the tab's navigation button and waits for it to be current.


	const tabButLoc = curPagObj.locator( `[data-element-name-hook~="navTabBut"][data-tab="${ tabIdeStr }"]` ).first(); // What: Tab Button Locator. Why: The navigation can render more than one bar during a placement change. How: This finds the tab's button and takes the first.



	await tabButLoc.click(); // What: Tab Click Call. Why: Switching tabs goes through the real button. How: This clicks it.



	await curPagObj.locator( `[data-element-name-hook~="navTabBut"][data-tab="${ tabIdeStr }"][aria-current="page"]` ).first().waitFor(); // What: Current Tab Wait. Why: The tab renders only once it's current. How: This waits for its button to report aria-current.


};

// #endregion selTabFun

// #endregion Helpers



// #region Exports

export { opeDayFun, opeFixFun, selTabFun }; // What: Named Exports. Why: The suites open days, open the backup, and switch tabs through these. How: This exports opeDayFun, opeFixFun, and selTabFun by name.

// #endregion Exports


