


// #region Imports

import { expect    } from '@playwright/test';      // What: Expect. Why: Every flow asserts what it changed. How: This makes the assertions.
import { opeFixFun } from '../support/app.ts';     // What: Open Fixture Function. Why: Each flow starts from real data. How: This opens the backup on a fixed day.
import { reaStaFun } from '../support/storage.ts'; // What: Read State Function. Why: Flows compare saved state before and after. How: This reads it.
import { recAniFun } from '../support/watch.ts';   // What: Record Animations Function. Why: Flows confirm their animations played. How: This starts recording.
import { seeAniFun } from '../support/watch.ts';   // What: Seen Animation Function. Why: Flows confirm their animations played. How: This checks the record.
import { selTabFun } from '../support/app.ts';     // What: Select Tab Function. Why: Every flow runs on the Pickers tab. How: This switches to it.
import { test      } from '@playwright/test';      // What: Test. Why: Each flow is its own test. How: This declares them.
import { waiStaFun } from '../support/storage.ts'; // What: Wait State Function. Why: Saves land a moment after each action. How: This waits for them.
import { watErrFun } from '../support/watch.ts';   // What: Watch Errors Function. Why: A flow fails on any page error. How: This collects them.

// #endregion Imports



/**
 * pickers.spec.ts = Pickers Spec
 *
 * @summary
 * Drives the Pickers tab on real data: running Pick One and sending the
 * result to Today, which adds an entry and flashes the Sent state; editing,
 * then deleting, a pool item, each saved only on its own confirm; and
 * building a new picker through the form, from its details step through two
 * items to Create. Every flow checks the saved state in IndexedDB, and fails
 * on any page or console error.
 *
 * Sections:
 *  - Constants
 *  - Module Init
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const POO_DIV_STR = '[data-element-name-hook~="pooIteDiv"]'; // What: Pool Division String. Why: Pool actions live in the pool list. How: This selects it.

// #endregion Constants



// #region Module Init

let errMesArr : string[] = []; // What: Error Message Array. Why: Each test's page errors are checked when it ends. How: This holds the current test's list.



test.beforeEach( async ( { page : curPagObj } ) => { // What: Setup Hook. Why: Every flow starts on the Pickers tab with errors watched. How: This starts the watcher, opens the backup, and switches tabs.


	errMesArr = watErrFun( curPagObj ); // What: Error Watch Call. Why: Errors are collected from the start. How: This attaches the watcher.



	await opeFixFun( curPagObj ); // What: App Open Call. Why: Flows start on the fixed day. How: This opens the backup.



	await selTabFun( curPagObj, 'picker' ); // What: Tab Switch Call. Why: Every flow runs on the Pickers tab. How: This switches to it.


} );



test.afterEach( () => { expect( errMesArr, errMesArr.join( '\n' ) ).toEqual( [] ); } ); // What: Error Check Hook. Why: A flow that logged an error failed even if it finished. How: This expects no errors.



test( 'pick one and send it to Today', async ( { page : curPagObj } ) => { // What: Pick And Send Test. Why: A manual pick must reach Today. How: This picks, sends, and checks the new entry.


	const preStaObj = ( await reaStaFun( curPagObj ) )!; // What: Previous State Object. Why: The send adds one entry. How: This reads the state first. // What: Non-Null Note. Why: The day's list was already saved. How: The ! tells TypeScript a state exists.



	await curPagObj.locator( '[data-element-name-hook~="picOneBut"]' ).click(); // What: Pick Click Call. Why: Pick One runs the picker. How: This clicks it.



	await expect( curPagObj.locator( '[data-element-name-hook~="picSenBut"]' ), 'send button' ).toBeEnabled( { timeout : 15000 } ); // What: Send Ready Assertion. Why: Send unlocks once the reel settles. How: This waits for it to enable.



	await recAniFun( curPagObj ); // What: Recording Start Call. Why: The Sent flash is confirmed. How: This starts recording.



	await curPagObj.locator( '[data-element-name-hook~="picSenBut"]' ).click(); // What: Send Click Call. Why: Sending adds the pick to Today. How: This clicks it.



	await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.today.entries.length > preStaObj.today.entries.length || staAppObj.pickLog.some( ( logRowObj ) => logRowObj.source === 'manual' && !preStaObj.pickLog.some( ( oldRowObj ) => oldRowObj.id === logRowObj.id ) ), 'manual send saved' ); // What: Send Save Wait. Why: The send must reach storage. How: This waits for a new entry or manual row.



	expect( await seeAniFun( curPagObj, '[data-pick-sent-active]' ), 'sent flash' ).toBe( true ); // What: Sent Flash Assertion. Why: The button flashes Sent. How: This checks its attribute appeared.


} );



test( 'a pool item can be edited and deleted', async ( { page : curPagObj } ) => { // What: Pool Item Test. Why: Pool edits and deletes must save. How: This renames an item, then deletes it.


	const ediButLoc = curPagObj.locator( `${ POO_DIV_STR } [aria-label^="Edit "]` ).first(); // What: Edit Button Locator. Why: The first pool item is edited. How: This finds its Edit button.



	await ediButLoc.click(); // What: Editor Open Call. Why: Renaming happens in the editor. How: This opens it.



	await curPagObj.locator( '[data-element-name-hook~="lisIteDiv"] [data-element-name-hook~="rowNamInp"]' ).first().fill( 'Pool Renamed' ); // What: Rename Fill Call. Why: The draft takes the new name. How: This types it.



	await curPagObj.locator( '[data-element-name-hook~="iteSavBut"]' ).first().click(); // What: Save Click Call. Why: Save commits the draft. How: This clicks it.



	const renStaObj = await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.items.some( ( curIteObj ) => curIteObj.name === 'Pool Renamed' ), 'pool rename saved' ); // What: Renamed State Object. Why: The rename must reach storage. How: This waits for it.



	await curPagObj.locator( `${ POO_DIV_STR } [aria-label="Delete Pool Renamed"]` ).click(); // What: Delete Open Call. Why: Deleting asks to confirm first. How: This opens the confirm.



	await curPagObj.locator( POO_DIV_STR ).getByRole( 'button', { exact : true, name : 'Delete' } ).click(); // What: Delete Confirm Call. Why: The item is deleted once confirmed. How: This clicks Delete.



	await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.items.length === renStaObj.items.length - 1 && !staAppObj.items.some( ( curIteObj ) => curIteObj.name === 'Pool Renamed' ), 'pool delete saved' ); // What: Delete Save Wait. Why: The delete must reach storage. How: This waits for the item to go.


} );



test( 'the form creates a new picker with items', async ( { page : curPagObj } ) => { // What: Picker Form Test. Why: Building a picker is the main setup flow. How: This fills the form and creates a picker.


	await curPagObj.locator( '[data-element-name-hook~="picAddBut"]' ).click(); // What: Form Open Call. Why: New pickers start from Add New Picker. How: This opens the form.



	await curPagObj.locator( '#np-name' ).fill( 'Form Picker' ); // What: Name Fill Call. Why: A picker needs a name. How: This types one.



	await curPagObj.locator( '[data-element-name-hook~="forGroDiv"] button' ).first().click(); // What: Group Choice Call. Why: A picker needs a group. How: This picks the first existing group.



	await curPagObj.locator( '[data-element-name-hook~="modOptLab"][data-mode="random"]' ).click(); // What: Mode Choice Call. Why: A picker needs a mode. How: This picks Truly Random.



	await curPagObj.locator( '[data-element-name-hook~="forNexBut"]' ).click(); // What: Next Click Call. Why: Items come on the second step. How: This moves on.



	for ( const iteNamStr of [ 'Form Item A', 'Form Item B' ] ) { // What: Item Add Loop. Why: The new picker gets two items. How: This adds each in turn.


		await curPagObj.locator( '[data-element-name-hook~="iteAddBut"]' ).click(); // What: Item Add Call. Why: Each item starts from the add button. How: This opens a new row.



		await curPagObj.locator( '[data-element-name-hook~="rowNamInp"]' ).last().fill( iteNamStr ); // What: Item Name Call. Why: Each item needs a name. How: This types it.



		await curPagObj.locator( '[data-element-name-hook~="iteSavBut"]' ).last().click(); // What: Item Save Call. Why: The item joins the form's pool. How: This saves it.



		await curPagObj.waitForTimeout( 600 ); // What: Row Settle Wait. Why: A saved row commits after its close animation. How: This waits for it.


	}



	await curPagObj.locator( '[data-element-name-hook~="forCreBut"]' ).click(); // What: Create Click Call. Why: Create saves the picker and its items. How: This clicks it.



	const creStaObj = await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.pickers.some( ( curPicObj ) => curPicObj.name === 'Form Picker' ), 'picker created' ); // What: Created State Object. Why: The picker must reach storage. How: This waits for it.
	const newPicObj = creStaObj.pickers.find( ( curPicObj ) => curPicObj.name === 'Form Picker' )!;                                                                 // What: New Picker Object. Why: Its items and mode are checked. How: This looks it up. // What: Non-Null Note. Why: The wait above just found it. How: The ! tells TypeScript it exists.



	expect( newPicObj.mode, 'mode saved' ).toBe( 'random' ); // What: Mode Assertion. Why: The chosen mode is saved. How: This checks it.



	expect( creStaObj.items.filter( ( curIteObj ) => curIteObj.pickerId === newPicObj.id ).map( ( curIteObj ) => curIteObj.name ).sort(), 'items saved' ).toEqual( [ 'Form Item A', 'Form Item B' ] ); // What: Items Assertion. Why: Both items are saved with the picker. How: This compares their names.


} );

// #endregion Module Init


