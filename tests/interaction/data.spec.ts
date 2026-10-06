


// #region Imports

import { expect    } from '@playwright/test';      // What: Expect. Why: Every flow asserts what it changed. How: This makes the assertions.
import { opeFixFun } from '../support/app.ts';     // What: Open Fixture Function. Why: Each flow starts from real data. How: This opens the backup on a fixed day.
import { reaStaFun } from '../support/storage.ts'; // What: Read State Function. Why: Flows compare saved state before and after. How: This reads it.
import { selTabFun } from '../support/app.ts';     // What: Select Tab Function. Why: Every flow runs on the Data tab. How: This switches to it.
import { test      } from '@playwright/test';      // What: Test. Why: Each flow is its own test. How: This declares them.
import { waiStaFun } from '../support/storage.ts'; // What: Wait State Function. Why: Saves land a moment after each action. How: This waits for them.
import { watErrFun } from '../support/watch.ts';   // What: Watch Errors Function. Why: A flow fails on any page error. How: This collects them.


import type { Locator } from '@playwright/test'; // What: Locator. Why: Helpers open sections inside a card. How: This types the card parameters.
import type { Page    } from '@playwright/test'; // What: Page. Why: Helpers drive the page. How: This types the page parameters.

// #endregion Imports



/**
 * data.spec.ts = Data Spec
 *
 * @summary
 * Drives the Data tab's editors on real data. Picker controls are a draft
 * that commits on Save, and also when the controls close, so a rename saves
 * through Save and a holiday toggle saves by collapsing; the vacation
 * button switches a whole picker off at once; an item row renames through
 * its own editor; a new conditional saves from the conditionals section;
 * the reminder options matrix saves its toggles; and the section sort is
 * remembered. Every flow checks the saved state in IndexedDB, and fails on
 * any page or console error.
 *
 * Sections:
 *  - Helpers
 *  - Module Init
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Helpers

const picCarFun = ( curPagObj : Page ) => curPagObj.locator( '[data-element-name-hook~="datCatSec"][data-picker-id]' ).first(); // What: Picker Card Function. Why: Most flows use the first picker card. How: This finds it.



// #region opeSecFun

/**
 * opeSecFun = Open Section Function
 *
 * @summary
 * Opens a Data card and, when asked, one of its inner sections: index 0 is
 * Controls and index 1 is Items. Closed parts are opened; open ones are left
 * alone, so the helper can be called on a card in any state.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param carSecLoc - Card Section Locator: The card to open.
 * @param secIndNum - Section Index Number: Which inner section to open, or
 *                    null for none.
 *
 * @returns A promise that settles once the parts are open.
 *
 * @example
 * ```ts
 * await opeSecFun(picCarFun(curPagObj), 0) // => void
 * ```
 *
*/

const opeSecFun = async ( carSecLoc : Locator, secIndNum : number | null ) : Promise< void > => { // What: Open Section Function. Why: Card bodies and their sections start closed. How: This opens the card and the chosen section when closed.


	const heaButLoc = carSecLoc.locator( '[data-element-name-hook~="catHeaBut"]' ).first(); // What: Header Button Locator. Why: The header opens the card. How: This finds it.



	if ( await heaButLoc.getAttribute( 'aria-expanded' ) !== 'true' ) await heaButLoc.click(); // What: Card Open Call. Why: A closed card hides its sections. How: This opens it when closed.



	if ( secIndNum === null ) return; // What: Card Only Guard. Why: Some flows need only the card. How: This stops here.



	const togButLoc = carSecLoc.locator( '[data-element-name-hook~="catTogBut"]' ).nth( secIndNum ); // What: Toggle Button Locator. Why: Each inner section has its own toggle. How: This finds the chosen one.



	if ( await togButLoc.getAttribute( 'aria-expanded' ) !== 'true' ) await togButLoc.click(); // What: Section Open Call. Why: The section must be open to edit. How: This opens it when closed.


};

// #endregion opeSecFun

// #endregion Helpers



// #region Module Init

let errMesArr : string[] = []; // What: Error Message Array. Why: Each test's page errors are checked when it ends. How: This holds the current test's list.



test.beforeEach( async ( { page : curPagObj } ) => { // What: Setup Hook. Why: Every flow starts on the Data tab with errors watched. How: This starts the watcher, opens the backup, and switches tabs.


	errMesArr = watErrFun( curPagObj ); // What: Error Watch Call. Why: Errors are collected from the start. How: This attaches the watcher.



	await opeFixFun( curPagObj ); // What: App Open Call. Why: Flows start on the fixed day. How: This opens the backup.



	await selTabFun( curPagObj, 'data' ); // What: Tab Switch Call. Why: Every flow runs on the Data tab. How: This switches to it.


} );



test.afterEach( () => { expect( errMesArr, errMesArr.join( '\n' ) ).toEqual( [] ); } ); // What: Error Check Hook. Why: A flow that logged an error failed even if it finished. How: This expects no errors.



test( 'picker controls save a rename on Save', async ( { page : curPagObj } ) => { // What: Controls Rename Test. Why: Controls are a draft until saved. How: This renames a picker and saves.


	const carSecLoc = picCarFun( curPagObj ); // What: Card Section Locator. Why: The first picker is renamed. How: This finds its card.



	await opeSecFun( carSecLoc, 0 ); // What: Controls Open Call. Why: The name lives in the controls. How: This opens them.



	await carSecLoc.locator( '[data-element-name-hook~="basNamInp"]' ).fill( 'Data Renamed' ); // What: Rename Fill Call. Why: The draft takes the new name. How: This types it.



	await carSecLoc.locator( '[data-element-name-hook~="picFooDiv"]' ).getByRole( 'button', { exact : true, name : 'Save' } ).click(); // What: Save Click Call. Why: Save commits the draft. How: This clicks it.



	await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.pickers.some( ( curPicObj ) => curPicObj.name === 'Data Renamed' ), 'controls rename saved' ); // What: Rename Save Wait. Why: The rename must reach storage. How: This waits for it.


} );



test( 'closing the controls commits a toggle', async ( { page : curPagObj } ) => { // What: Controls Commit Test. Why: Closing the controls saves the draft too. How: This flips a toggle and collapses the controls.


	const carSecLoc = picCarFun( curPagObj );                                                                                      // What: Card Section Locator. Why: The first picker is changed. How: This finds its card.
	const picIdeStr = ( await carSecLoc.getAttribute( 'data-picker-id' ) )!;                                                       // What: Picker Identifier String. Why: The saved picker is checked afterwards. How: This reads the card's picker id. // What: Non-Null Note. Why: The card was selected by that attribute. How: The ! tells TypeScript it's present.
	const preSkiBoo = ( await reaStaFun( curPagObj ) )!.pickers.find( ( curPicObj ) => curPicObj.id === picIdeStr )!.skipHolidays; // What: Previous Skip Boolean. Why: The toggle flips it. How: This reads it first. // What: Non-Null Note. Why: The state was saved and the card names a real picker. How: Each ! tells TypeScript the value exists.



	await opeSecFun( carSecLoc, 0 ); // What: Controls Open Call. Why: The toggle lives in the controls. How: This opens them.



	await carSecLoc.locator( '[data-element-name-hook~="togSwiBut"][aria-label="Skip on holidays"]' ).click(); // What: Toggle Click Call. Why: The draft flips the holiday setting. How: This clicks the switch.



	await carSecLoc.locator( '[data-element-name-hook~="catTogBut"]' ).nth( 0 ).click(); // What: Controls Close Call. Why: Closing commits the draft. How: This collapses the controls.



	await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.pickers.find( ( curPicObj ) => curPicObj.id === picIdeStr )?.skipHolidays === !preSkiBoo, 'controls toggle committed' ); // What: Commit Wait. Why: The toggle must reach storage on close. How: This waits for the flipped setting.


} );



test( 'the vacation button switches a whole picker off', async ( { page : curPagObj } ) => { // What: Vacation Test. Why: A picker's items can all be deactivated at once. How: This clicks the vacation button.


	const carSecLoc = picCarFun( curPagObj );                                // What: Card Section Locator. Why: The first picker is switched off. How: This finds its card.
	const picIdeStr = ( await carSecLoc.getAttribute( 'data-picker-id' ) )!; // What: Picker Identifier String. Why: Its items are checked afterwards. How: This reads the id. // What: Non-Null Note. Why: The card was selected by that attribute. How: The ! tells TypeScript it's present.



	await carSecLoc.locator( '[aria-label^="Deactivate all items in"]' ).click(); // What: Vacation Click Call. Why: The button deactivates every item. How: This clicks it.



	await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.items.filter( ( curIteObj ) => curIteObj.pickerId === picIdeStr ).every( ( curIteObj ) => curIteObj.vacation ), 'vacation saved' ); // What: Vacation Save Wait. Why: Every item must be off in storage. How: This waits for it.


} );



test( 'an item row renames through its editor', async ( { page : curPagObj } ) => { // What: Item Row Test. Why: Item rows edit as drafts. How: This renames an item and saves.


	const carSecLoc = picCarFun( curPagObj ); // What: Card Section Locator. Why: The first picker's first item is renamed. How: This finds its card.



	await opeSecFun( carSecLoc, 1 ); // What: Items Open Call. Why: Items live in their own section. How: This opens it.



	await carSecLoc.locator( '[data-element-name-hook~="lisRowBut"]' ).first().click(); // What: Row Open Call. Why: An item opens its editor from its row. How: This clicks the first row.



	await carSecLoc.locator( '[data-element-name-hook~="rowNamInp"]' ).first().fill( 'Row Renamed' ); // What: Rename Fill Call. Why: The draft takes the new name. How: This types it.



	await carSecLoc.locator( '[data-element-name-hook~="iteSavBut"]' ).first().click(); // What: Save Click Call. Why: Save commits the draft. How: This clicks it.



	await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.items.some( ( curIteObj ) => curIteObj.name === 'Row Renamed' ), 'row rename saved' ); // What: Rename Save Wait. Why: The rename must reach storage. How: This waits for it.


} );



test( 'a new conditional saves', async ( { page : curPagObj } ) => { // What: Conditional Add Test. Why: Conditionals can be created from Data. How: This adds and saves one.


	const conSecLoc = curPagObj.locator( '[data-element-name-hook~="conCatSec"]' ); // What: Conditional Section Locator. Why: Conditionals have their own card. How: This finds it.
	const preConNum = ( await reaStaFun( curPagObj ) )!.conditionals.length;        // What: Previous Conditional Number. Why: The add raises the count. How: This reads it first. // What: Non-Null Note. Why: The day's list was already saved. How: The ! tells TypeScript a state exists.



	await opeSecFun( conSecLoc, null ); // What: Section Open Call. Why: The add button lives in the open card. How: This opens it.



	await conSecLoc.locator( '[data-element-name-hook~="rowAddBut"]' ).click(); // What: Add Click Call. Why: New conditionals start from the add button. How: This opens a new row.



	await conSecLoc.locator( '[data-element-name-hook~="rowNamInp"]' ).last().fill( 'Data Conditional' ); // What: Name Fill Call. Why: A conditional needs a name. How: This types one.



	await conSecLoc.locator( '[data-element-name-hook~="conFooDiv"]' ).last().getByRole( 'button', { exact : true, name : 'Save' } ).click(); // What: Save Click Call. Why: The conditional is created on save. How: This clicks it.



	await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.conditionals.length === preConNum + 1 && staAppObj.conditionals.some( ( curConObj ) => curConObj.name === 'Data Conditional' ), 'conditional added' ); // What: Add Save Wait. Why: The conditional must reach storage. How: This waits for it.


} );



test( 'the reminder options matrix saves', async ( { page : curPagObj } ) => { // What: Reminder Options Test. Why: Reminder class options save from the matrix. How: This flips one option and saves.


	const remSecLoc = curPagObj.locator( '[data-element-name-hook~="remCatSec"]' );     // What: Reminder Section Locator. Why: The matrix lives in the reminders card. How: This finds it.
	const preOptStr = JSON.stringify( ( await reaStaFun( curPagObj ) )!.reminderOpts ); // What: Previous Options String. Why: The save changes the options. How: This records them first. // What: Non-Null Note. Why: The day's list was already saved. How: The ! tells TypeScript a state exists.



	await opeSecFun( remSecLoc, 0 ); // What: Matrix Open Call. Why: The matrix is the first section. How: This opens it.



	await remSecLoc.locator( '[data-element-name-hook~="remMatDiv"] [data-element-name-hook~="togSwiBut"]' ).first().click(); // What: Option Flip Call. Why: One option changes. How: This clicks the first switch.



	await remSecLoc.locator( '[data-element-name-hook~="matFooDiv"]' ).getByRole( 'button', { exact : true, name : 'Save' } ).click(); // What: Save Click Call. Why: The matrix saves on Save. How: This clicks it.



	await waiStaFun( curPagObj, ( staAppObj ) => JSON.stringify( staAppObj.reminderOpts ) !== preOptStr, 'reminder options saved' ); // What: Options Save Wait. Why: The change must reach storage. How: This waits for the options to differ.


} );



test( 'the section sort is remembered', async ( { page : curPagObj } ) => { // What: Sort Test. Why: The chosen sort persists. How: This changes the sort and checks it saved.


	const sorSelLoc = curPagObj.locator( '[data-element-name-hook~="sorBarDiv"] [data-element-name-hook~="sorDroSel"]' ).first();                                     // What: Sort Select Locator. Why: The section sort is the top dropdown. How: This finds it.
	const optValArr = await sorSelLoc.locator( 'option' ).evaluateAll( ( optEleArr ) => optEleArr.map( ( optDomEle ) => ( optDomEle as HTMLOptionElement ).value ) ); // What: Option Value Array. Why: A different option is chosen. How: This lists the values. // What: Type Assertion Note. Why: Every match is an option element. How: It's read as an option, since the selector names option.
	const curValStr = await sorSelLoc.inputValue(); // What: Current Value String. Why: The new choice must differ. How: This reads the current one.
	const newValStr = optValArr.find( ( optValStr ) => optValStr !== curValStr )!;                                                                                    // What: New Value String. Why: A different sort is chosen. How: This takes the first other value. // What: Non-Null Note. Why: The sort always offers several options. How: The ! tells TypeScript one exists.



	await sorSelLoc.selectOption( newValStr ); // What: Sort Choice Call. Why: The sort changes. How: This selects the new value.



	await waiStaFun( curPagObj, ( staAppObj ) => JSON.stringify( staAppObj.ui ).includes( newValStr ), 'sort saved' ); // What: Sort Save Wait. Why: The sort must reach storage. How: This waits for the value in the saved UI settings.


} );

// #endregion Module Init


