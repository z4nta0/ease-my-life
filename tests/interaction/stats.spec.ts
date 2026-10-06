


// #region Imports

import { expect    } from '@playwright/test';    // What: Expect. Why: Every flow asserts what it shows. How: This makes the assertions.
import { opeFixFun } from '../support/app.ts';   // What: Open Fixture Function. Why: Stats needs real history to show. How: This opens the backup on a fixed day.
import { selTabFun } from '../support/app.ts';   // What: Select Tab Function. Why: Every flow runs on the Stats tab. How: This switches to it.
import { test      } from '@playwright/test';    // What: Test. Why: Each flow is its own test. How: This declares them.
import { watErrFun } from '../support/watch.ts'; // What: Watch Errors Function. Why: A flow fails on any page error. How: This collects them.

// #endregion Imports



/**
 * stats.spec.ts = Stats Spec
 *
 * @summary
 * Drives the Stats tab on real data: every scope tab and every range pill
 * is selected in turn, each showing its headline cards without errors, and
 * a heatmap day opens its detail panel. The figures themselves are checked
 * against the logs by the simulation; this suite checks the controls.
 * Every flow fails on any page or console error.
 *
 * Sections:
 *  - Module Init
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Module Init

let errMesArr : string[] = []; // What: Error Message Array. Why: Each test's page errors are checked when it ends. How: This holds the current test's list.



test.beforeEach( async ( { page : curPagObj } ) => { // What: Setup Hook. Why: Every flow starts on the Stats tab with errors watched. How: This starts the watcher, opens the backup, and switches tabs.


	errMesArr = watErrFun( curPagObj ); // What: Error Watch Call. Why: Errors are collected from the start. How: This attaches the watcher.



	await opeFixFun( curPagObj ); // What: App Open Call. Why: Flows start on the fixed day. How: This opens the backup.



	await selTabFun( curPagObj, 'stats' ); // What: Tab Switch Call. Why: Every flow runs on the Stats tab. How: This switches to it.


} );



test.afterEach( () => { expect( errMesArr, errMesArr.join( '\n' ) ).toEqual( [] ); } ); // What: Error Check Hook. Why: A flow that logged an error failed even if it finished. How: This expects no errors.



test( 'every scope and range shows its cards', async ( { page : curPagObj } ) => { // What: Scope And Range Test. Why: Every combination of controls must render. How: This walks each scope and range.


	const scoTabLoc = curPagObj.locator( '[data-element-name-hook~="scoTabBut"]' ); // What: Scope Tab Locator. Why: Each scope is selected in turn. How: This finds the scope tabs.
	const scoTabNum = await scoTabLoc.count();                                      // What: Scope Tab Number. Why: The loop covers every scope. How: This counts them.



	for ( let scoIndNum = 0; scoIndNum < scoTabNum; scoIndNum++ ) { // What: Scope Loop. Why: Each scope shows different cards. How: This selects each in turn.


		await scoTabLoc.nth( scoIndNum ).click(); // What: Scope Click Call. Why: The scope changes through its tab. How: This clicks it.



		await expect( scoTabLoc.nth( scoIndNum ), 'scope selected' ).toHaveAttribute( 'data-tab-select-active', 'true' ); // What: Scope Selected Assertion. Why: The clicked tab becomes active. How: This checks its attribute.



		for ( const ranLabStr of [ 'All Time', '1 year', '6 months', '3 months', 'Month', 'Week' ] ) { // What: Range Loop. Why: Each range filters the figures. How: This selects each in turn.


			const ranButLoc = curPagObj.locator( '[data-element-name-hook~="ranPilBut"]' ).getByText( ranLabStr, { exact : true } ); // What: Range Button Locator. Why: Each range has its own pill. How: This finds it by text.



			await ranButLoc.click(); // What: Range Click Call. Why: The range changes through its pill. How: This clicks it.



			await expect( curPagObj.locator( '[data-element-name-hook~="ranPilBut"][data-pill-select-active]' ), 'range selected' ).toHaveText( ranLabStr ); // What: Range Selected Assertion. Why: The clicked pill becomes active. How: This checks the active pill's text.



			await expect( curPagObj.locator( '[class*="staNumDiv"]' ).first(), 'headline cards' ).toBeVisible(); // What: Card Assertion. Why: Every view shows its headline figures. How: This checks one is visible.


		}


	}


} );



test( 'a heatmap day opens its detail', async ( { page : curPagObj } ) => { // What: Heatmap Test. Why: Tapping a day shows what happened on it. How: This clicks a day cell and checks the detail.


	const celButLoc = curPagObj.locator( '[data-element-name-hook~="heaMapDiv"] button[class*="hetCelBut"]' ).last(); // What: Cell Button Locator. Why: The latest day has data on the fixed day. How: This finds the last cell.



	await celButLoc.click(); // What: Cell Click Call. Why: A tap selects the day. How: This clicks it.



	await expect( celButLoc, 'cell selected' ).toHaveAttribute( 'data-cell-select-active', 'true' ); // What: Selected Assertion. Why: The tapped day is marked. How: This checks its attribute.



	await expect( curPagObj.locator( '[class*="detDatSpa"]' ), 'detail date' ).toBeVisible(); // What: Detail Assertion. Why: The panel shows the day's date. How: This checks it's visible.


} );

// #endregion Module Init


