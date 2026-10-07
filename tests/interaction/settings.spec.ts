


// #region Imports

import { expect    } from '@playwright/test';      // What: Expect. Why: Every flow asserts what it changed. How: This makes the assertions.
import { opeFixFun } from '../support/app.ts';     // What: Open Fixture Function. Why: Each flow starts from real data. How: This opens the backup on a fixed day.
import { reaStaFun } from '../support/storage.ts'; // What: Read State Function. Why: Flows compare saved state before and after. How: This reads it.
import { recAniFun } from '../support/watch.ts';   // What: Record Animations Function. Why: Flows confirm their animations played. How: This starts recording.
import { seeAniFun } from '../support/watch.ts';   // What: Seen Animation Function. Why: Flows confirm their animations played. How: This checks the record.
import { selTabFun } from '../support/app.ts';     // What: Select Tab Function. Why: Every flow runs on the Settings tab. How: This switches to it.
import { test      } from '@playwright/test';      // What: Test. Why: Each flow is its own test. How: This declares them.
import { waiStaFun } from '../support/storage.ts'; // What: Wait State Function. Why: Saves land a moment after each action. How: This waits for them.
import { watErrFun } from '../support/watch.ts';   // What: Watch Errors Function. Why: A flow fails on any page error. How: This collects them.

// #endregion Imports



/**
 * settings.spec.ts = Settings Spec
 *
 * @summary
 * Drives the Settings tab on real data. Choosing a theme saves it and fades
 * the page between palettes; the celebration and pick animation choices
 * save; the tab bar moves when its placement changes; the daily generator
 * switch and run time save; a built-in holiday can be turned off, and a
 * custom one added and removed with its exit animation; a backup exported
 * here imports back cleanly; the legal panels open and close with their
 * closing animation; and cancelling a reset leaves the data alone. Every
 * flow checks the saved state in IndexedDB, and fails on any page or
 * console error.
 *
 * Sections:
 *  - Module Init
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Module Init

let errMesArr : string[] = []; // What: Error Message Array. Why: Each test's page errors are checked when it ends. How: This holds the current test's list.



test.beforeEach( async ( { page : curPagObj } ) => { // What: Setup Hook. Why: Every flow starts on the Settings tab with errors watched. How: This starts the watcher, opens the backup, and switches tabs.


	errMesArr = watErrFun( curPagObj ); // What: Error Watch Call. Why: Errors are collected from the start. How: This attaches the watcher.



	await opeFixFun( curPagObj ); // What: App Open Call. Why: Flows start on the fixed day. How: This opens the backup.



	await selTabFun( curPagObj, 'settings' ); // What: Tab Switch Call. Why: Every flow runs on the Settings tab. How: This switches to it.


} );



test.afterEach( () => { expect( errMesArr, errMesArr.join( '\n' ) ).toEqual( [] ); } ); // What: Error Check Hook. Why: A flow that logged an error failed even if it finished. How: This expects no errors.



test( 'a theme choice saves and fades the page', async ( { page : curPagObj } ) => { // What: Theme Test. Why: Themes must save and cross-fade. How: This picks an unchosen light theme.


	const preTheStr = ( await reaStaFun( curPagObj ) )!.appearance.theme; // What: Previous Theme String. Why: The new theme must differ. How: This reads the current one. // What: Non-Null Note. Why: The day's list was already saved. How: The ! tells TypeScript a state exists.



	await recAniFun( curPagObj ); // What: Recording Start Call. Why: The page fade is confirmed. How: This starts recording.



	await curPagObj.locator( '[data-element-name-hook~="theLigDiv"] [role="radio"][aria-checked="false"]' ).first().click(); // What: Theme Click Call. Why: An unchosen theme is picked. How: This clicks the first one.



	await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.appearance.theme !== preTheStr, 'theme saved' ); // What: Theme Save Wait. Why: The theme must reach storage. How: This waits for it to change.



	expect( await seeAniFun( curPagObj, '[data-theme-fade-active]' ), 'theme fade' ).toBe( true ); // What: Fade Assertion. Why: The page fades between palettes. How: This checks its attribute appeared.


} );



test( 'celebration and pick animation choices save', async ( { page : curPagObj } ) => { // What: Animation Choice Test. Why: Both animation choices must save. How: This picks a different option in each.


	await curPagObj.locator( '[data-element-name-hook~="celStyDiv"]' ).getByText( 'Ripple', { exact : true } ).click(); // What: Celebration Choice Call. Why: Ripple replaces the backup's confetti, and its radio is hidden inside the row's label. How: This clicks the row's name, which checks the radio.



	await curPagObj.locator( '[data-element-name-hook~="picAniDiv"]' ).getByText( 'Spotlight', { exact : true } ).click(); // What: Pick Animation Choice Call. Why: Spotlight replaces the backup's reel, and its radio is hidden inside the row's label. How: This clicks the row's name, which checks the radio.



	await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.appearance.completionStyle === 'ripple' && staAppObj.appearance.pickAnim === 'spotlight', 'animation choices saved' ); // What: Choice Save Wait. Why: Both choices must reach storage. How: This waits for them.


} );



test( 'the tab bar moves to the side', async ( { page : curPagObj } ) => { // What: Placement Test. Why: The tab bar's placement must save and apply. How: This picks Side.


	await curPagObj.locator( '[data-element-name-hook~="segConDiv"][aria-label="Tab bar placement"]' ).getByRole( 'button', { exact : true, name : 'Side' } ).click(); // What: Side Click Call. Why: Side is a different placement. How: This clicks it.



	await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.appearance.tabPlacement === 'side', 'placement saved' ); // What: Placement Save Wait. Why: The placement must reach storage. How: This waits for it.



	await expect( curPagObj.locator( 'body' ), 'body placement' ).toHaveAttribute( 'data-placement', 'side' ); // What: Placement Applied Assertion. Why: The layout follows the body's placement. How: This checks the attribute.


} );



test( 'the daily generator switch and run time save', async ( { page : curPagObj } ) => { // What: Daily Generator Test. Why: Both generator settings must save. How: This changes the time, then the switch.


	await curPagObj.locator( '[aria-label="Daily generator run time"]' ).fill( '07:30' ); // What: Time Fill Call. Why: A new run time is set. How: This types it.



	await curPagObj.locator( '[aria-label="Daily generator run time"]' ).blur(); // What: Time Commit Call. Why: Some time inputs commit on blur. How: This leaves the field.



	await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.daily.runTime === '07:30', 'run time saved' ); // What: Time Save Wait. Why: The time must reach storage. How: This waits for it.



	await curPagObj.locator( '[aria-label="Run the Daily generator automatically"]' ).click(); // What: Switch Click Call. Why: The generator is switched to manual. How: This clicks the switch.



	await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.daily.mode !== 'auto', 'generator mode saved' ); // What: Mode Save Wait. Why: The mode must reach storage. How: This waits for it to leave auto.


} );



test( 'holidays can be turned off, added, and removed', async ( { page : curPagObj } ) => { // What: Holiday Test. Why: Every holiday action must save. How: This disables one, adds one, and removes it.


	await curPagObj.locator( '[data-element-name-hook~="holLisUno"] [aria-label^="Disable "]' ).first().click(); // What: Disable Click Call. Why: A built-in holiday can be turned off. How: This clicks the first enabled one's switch.



	const disStaObj = await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.holidays.disabled.length > 0, 'holiday disabled' ); // What: Disabled State Object. Why: The holiday must be off in storage. How: This waits for the disabled list to fill.
	const preCusNum = disStaObj.holidays.custom.length;                                                                          // What: Previous Custom Number. Why: Adding raises the count. How: This reads it.



	await curPagObj.locator( '[aria-label="Name of the day off to add"]' ).fill( 'Test Holiday' ); // What: Name Fill Call. Why: A custom holiday needs a name. How: This types one.



	await curPagObj.locator( '[data-element-name-hook~="holAddDiv"] [aria-label="Date"]' ).fill( '2026-11-03' ); // What: Date Fill Call. Why: A custom holiday needs a date. How: This sets one.



	await curPagObj.locator( '[data-element-name-hook~="holAddDiv"]' ).getByRole( 'button', { exact : true, name : 'Add' } ).click(); // What: Add Click Call. Why: The holiday is added on click. How: This clicks Add.



	await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.holidays.custom.length === preCusNum + 1, 'holiday added' ); // What: Add Save Wait. Why: The holiday must reach storage. How: This waits for it.



	await recAniFun( curPagObj ); // What: Recording Start Call. Why: The row's exit is confirmed. How: This starts recording.



	await curPagObj.locator( '[aria-label="Remove Test Holiday"]' ).click(); // What: Remove Click Call. Why: A custom holiday can be removed. How: This clicks its remove button.



	await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.holidays.custom.length === preCusNum, 'holiday removed' ); // What: Remove Save Wait. Why: The removal must reach storage. How: This waits for it.



	expect( await seeAniFun( curPagObj, 'holRowIte--exiting' ), 'holiday row exit' ).toBe( true ); // What: Exit Assertion. Why: The row animates out. How: This checks its class appeared.


} );



test( 'an exported backup imports back', async ( { page : curPagObj }, tesInfObj ) => { // What: Backup Round Trip Test. Why: Export and import must round trip. How: This exports, imports the file, and compares.


	const preStaObj = ( await reaStaFun( curPagObj ) )!; // What: Previous State Object. Why: The import is compared with the export. How: This reads the state. // What: Non-Null Note. Why: The day's list was already saved. How: The ! tells TypeScript a state exists.



	const [ dowFilObj ] = await Promise.all( [ curPagObj.waitForEvent( 'download' ), curPagObj.locator( '[data-element-name-hook~="expRowDiv"]' ).getByRole( 'button', { name : 'Export' } ).click() ] ); // What: Download Object. Why: Export downloads a file. How: This clicks Export and catches the download.
	const filPatStr = tesInfObj.outputPath( 'backup.json' );                                                                                                                                                // What: File Path String. Why: The file is imported next. How: This picks a path in the test's output.



	await dowFilObj.saveAs( filPatStr ); // What: Download Save Call. Why: The import reads the file from disk. How: This saves it.



	await curPagObj.locator( '[data-element-name-hook~="impRowDiv"] input[type="file"]' ).setInputFiles( filPatStr ); // What: File Choice Call. Why: Import starts from a chosen file. How: This sets it on the input.



	await curPagObj.locator( '[data-element-name-hook~="impRowDiv"]' ).getByRole( 'button', { exact : true, name : 'Import' } ).last().click(); // What: Import Confirm Call. Why: The import replaces the data once confirmed. How: This clicks Import.



	await expect( curPagObj.locator( '[data-element-name-hook~="impRowDiv"] [data-message-ok-active]' ), 'import message' ).toBeVisible(); // What: Import Message Assertion. Why: A good import says so. How: This checks the success message.



	const impStaObj = await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.pickers.length === preStaObj.pickers.length, 'import saved' ); // What: Import State Object. Why: The imported data reaches storage. How: This waits for it.



	expect( [ impStaObj.items.length, impStaObj.tasks.length, impStaObj.pickLog.length ], 'round trip' ).toEqual( [ preStaObj.items.length, preStaObj.tasks.length, preStaObj.pickLog.length ] ); // What: Round Trip Assertion. Why: Nothing is lost on the way. How: This compares the record counts.


} );



test( 'the legal panels open and close', async ( { page : curPagObj } ) => { // What: Legal Panel Test. Why: The legal panels must open and close. How: This opens the privacy panel and closes it.


	const panDiaLoc = curPagObj.locator( '[data-element-name-hook~="legBacDiv"]' ).getByRole( 'dialog', { name : 'Privacy Policy' } ); // What: Panel Dialog Locator. Why: The panel sits in the modal's backdrop, which carries the modal's hook. How: This finds the privacy dialog inside it.



	await curPagObj.locator( '[data-element-name-hook~="priRowDiv"] button' ).first().click(); // What: Panel Open Call. Why: The privacy row opens its panel. How: This clicks its button.



	await expect( panDiaLoc, 'panel open' ).toBeVisible(); // What: Panel Open Assertion. Why: The panel shows. How: This checks it's visible.



	await recAniFun( curPagObj ); // What: Recording Start Call. Why: The closing animation is confirmed. How: This starts recording.



	await panDiaLoc.locator( '[aria-label="Close"]' ).click(); // What: Panel Close Call. Why: Close dismisses the panel. How: This clicks it.



	expect( await seeAniFun( curPagObj, 'legPanDiv--closing' ), 'panel close' ).toBe( true ); // What: Close Animation Assertion. Why: The panel animates out. How: This checks its class appeared.



	await expect( curPagObj.locator( '[data-element-name-hook~="legBacDiv"]' ), 'panel gone' ).toHaveCount( 0 ); // What: Panel Gone Assertion. Why: The modal leaves once closed. How: This checks its backdrop is gone.


} );



test( 'cancelling a reset keeps the data', async ( { page : curPagObj } ) => { // What: Reset Cancel Test. Why: A cancelled reset must not wipe anything. How: This opens the reset confirm and cancels.


	const preStaObj = ( await reaStaFun( curPagObj ) )!; // What: Previous State Object. Why: The data must survive. How: This reads it first. // What: Non-Null Note. Why: The day's list was already saved. How: The ! tells TypeScript a state exists.



	await curPagObj.locator( '[data-element-name-hook~="resRowDiv"]' ).getByRole( 'button', { exact : true, name : 'Reset' } ).first().click(); // What: Reset Open Call. Why: Reset asks to confirm. How: This opens the confirm.



	await curPagObj.locator( '[data-element-name-hook~="resRowDiv"]' ).getByRole( 'button', { exact : true, name : 'Cancel' } ).click(); // What: Cancel Click Call. Why: Cancel keeps the data. How: This clicks it.



	await curPagObj.waitForTimeout( 800 ); // What: Settle Wait. Why: A wrong wipe would land quickly. How: This waits past the save delay.



	expect( ( await reaStaFun( curPagObj ) )!.pickers.length, 'data kept' ).toBe( preStaObj.pickers.length ); // What: Data Kept Assertion. Why: The pickers are still there. How: This compares the count. // What: Non-Null Note. Why: A kept state still exists. How: The ! tells TypeScript it does.


} );

// #endregion Module Init


