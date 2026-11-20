


// #region Imports

import { conChaFun   } from '../support/update.ts';  // What: Controller Change Function. Why: A new version taking control starts each flow. How: This fires the control change.
import { expect      } from '@playwright/test';      // What: Expect. Why: Each check asserts on the note, the reload, and the update check. How: This compares what each check reads with what it should be.
import { fakWorFun   } from '../support/update.ts';  // What: Fake Worker Function. Why: The suites block service workers, so the update flow's inputs are faked. How: This fakes the controller, the registration, and the visibility.
import { NOT_MES_STR } from '../support/update.ts';  // What: Note Message String. Why: The note is found by its message. How: This is the text it shows.
import { opeFixFun   } from '../support/app.ts';     // What: Open Fixture Function. Why: The app should hold real data, the way it's used. How: This loads the backup and opens the app.
import { test        } from '@playwright/test';      // What: Test. Why: Each case of the update flow is its own test. How: This declares them.
import { visSetFun   } from '../support/update.ts';  // What: Visibility Set Function. Why: Each case decides when the app counts as hidden. How: This sets the faked visibility and fires its event.


import type { Page } from '@playwright/test'; // What: Page. Why: The helpers drive a Playwright page. How: This types their page parameter.

// #endregion Imports



/**
 * update.spec.ts = Update Spec
 *
 * @summary
 * Checks how the app takes a newly deployed version, in whichever engine the
 * project runs. The suites block service workers, so an init script fakes the
 * parts the app reads: a worker already controlling the page, a registration
 * whose update call it counts, and the page's visibility, which each test
 * switches. A new version taking control of a visible page shows the update
 * note, whose Reload button reloads; one taking control of a hidden page with
 * nothing being edited reloads at once; one taking control while an editor is
 * open waits with the note instead; one taking control while account sync is
 * busy waits until the sync ends; the app looks for a new version each time it
 * comes back to the foreground; and a first install shows nothing.
 *
 * Sections:
 *  - Constants
 *  - Helpers
 *  - Module Init
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const UPD_MOD_STR = '/src/platform/update.ts'; // What: Update Module String. Why: The sync test reaches the update handling the way the sync runner does. How: This is the module's address on the dev server, which hands the page the same module the app runs.

// #endregion Constants



// #region Helpers

// #region synSetFun

/**
 * synSetFun = Sync Set Function
 *
 * @summary
 * Tells the app's update handling whether account sync is busy, the way the
 * sync runner does while a sync runs or a change waits, by calling its
 * synBusFun through the module the app already loaded.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page whose app to tell.
 * @param synBusBoo - Sync Busy Boolean: Whether sync is busy.
 *
 * @returns A promise that settles once the flag is set, with no value.
 *
 * @example
 * ```ts
 * await synSetFun(page, true) // => Promise<void>
 * ```
 *
*/

async function synSetFun ( curPagObj : Page, synBusBoo : boolean ) : Promise< void > {


	await curPagObj.evaluate( async ( [ modUrlStr, newBusBoo ] ) => { // What: Sync Flag Call. Why: The app holds back a reload while sync is busy. How: This imports the update module and sets its flag.


		const updModObj = await import( modUrlStr ); // What: Update Module Object. Why: The flag lives in the app's own module. How: This imports it from the dev server, which returns the instance the app already runs.


		updModObj.UPD_NAM_OBJ.synBusFun( newBusBoo ); // What: Sync Busy Call. Why: The test stands in for the sync runner. How: This sets the flag.


	}, [ UPD_MOD_STR, synBusBoo ] as const ); // What: Flag Arguments. Why: The page can't read this file's variables. How: This hands in the module's address and the new state. // What: Type Assertion Note. Why: The page function destructures a pair of a string and a boolean. How: The as const keeps each element's own type.


}

// #endregion synSetFun

// #endregion Helpers



// #region Module Init

test( 'a new version reaching a visible app shows the note, whose Reload button reloads', async ( { page : curPagObj } ) => { // What: Visible Update Test. Why: A person using the app chooses when to load a new version. How: This fires a control change with the app visible, checks the note shows, and waits for its Reload button's reload.


	await fakWorFun( curPagObj, true ); // What: Worker Fake Call. Why: The flow needs a controlled page. How: This fakes one.

	await opeFixFun( curPagObj ); // What: Fixture Open Call. Why: The note shows over a real tab. How: This loads the backup and opens the app.

	await conChaFun( curPagObj ); // What: Control Change Call. Why: A new version has taken over. How: This fires the event.


	await expect( curPagObj.getByText( NOT_MES_STR ) ).toBeVisible(); // What: Note Shown Assertion. Why: A visible app doesn't reload under the person. How: This checks the note shows.


	await Promise.all( [ curPagObj.waitForEvent( 'load' ), curPagObj.getByRole( 'button', { exact : true, name : 'Reload' } ).click() ] ); // What: Reload Click Call. Why: The button loads the new version. How: This presses it and waits for the page to load again.


} );



test( 'a new version reaching a hidden app with nothing being edited reloads it', async ( { page : curPagObj } ) => { // What: Hidden Update Test. Why: An app out of sight can take the new version unseen. How: This hides the app, fires a control change, and waits for the reload.


	await fakWorFun( curPagObj, true ); // What: Worker Fake Call. Why: The flow needs a controlled page. How: This fakes one.

	await opeFixFun( curPagObj ); // What: Fixture Open Call. Why: The app should hold real data. How: This loads the backup and opens the app.

	await visSetFun( curPagObj, 'hidden' ); // What: Hide Call. Why: The quiet reload happens only out of sight. How: This hides the app.


	await Promise.all( [ curPagObj.waitForEvent( 'load' ), conChaFun( curPagObj ) ] ); // What: Hidden Reload Wait. Why: Nothing is being edited, so the app reloads at once. How: This fires the control change and waits for the page to load again.


} );



test( 'a new version reaching a hidden app with an editor open waits and shows the note', async ( { page : curPagObj } ) => { // What: Busy Update Test. Why: A reload would throw away an unsaved edit. How: This opens the reminder form, hides the app, fires a control change, and checks no reload comes while the note shows.


	// #region Update Setup

	await fakWorFun( curPagObj, true ); // What: Worker Fake Call. Why: The flow needs a controlled page. How: This fakes one.

	await opeFixFun( curPagObj ); // What: Fixture Open Call. Why: The reminder form opens on the Today tab. How: This loads the backup and opens the app.

	await curPagObj.locator( '[data-element-name-hook~="remAddBut"]' ).click(); // What: Form Open Call. Why: An open add form is something being edited. How: This opens the reminder form.

	await curPagObj.evaluate( () => { window.__stiMarBoo = true; } ); // What: Still Mark Call. Why: A reload would clear anything the page set. How: This marks the page.

	// #endregion Update Setup



	// #region Hidden Update Arrival

	await visSetFun( curPagObj, 'hidden' ); // What: Hide Call. Why: The app would reload if nothing were being edited. How: This hides the app.

	await conChaFun( curPagObj ); // What: Control Change Call. Why: A new version has taken over. How: This fires the event.

	await visSetFun( curPagObj, 'visible' ); // What: Show Call. Why: The person comes back to the form. How: This shows the app again.

	// #endregion Hidden Update Arrival



	// #region Update Checks

	await expect( curPagObj.getByText( NOT_MES_STR ) ).toBeVisible(); // What: Note Shown Assertion. Why: The update waits for the person. How: This checks the note shows.

	expect( await curPagObj.evaluate( () => !!window.__stiMarBoo ) ).toBe( true ); // What: No Reload Assertion. Why: The open form must survive. How: This checks the page's mark is still set.

	// #endregion Update Checks


} );



test( 'a new version reaching a hidden app waits while sync is busy, then reloads once it ends', async ( { page : curPagObj } ) => { // What: Sync Wait Test. Why: A reload would cut off a sync uploading a change or one waiting to. How: This marks sync busy, hides the app, fires a control change, checks no reload comes, then ends the sync while hidden and waits for the reload.


	// #region Busy Sync Setup

	await fakWorFun( curPagObj, true ); // What: Worker Fake Call. Why: The flow needs a controlled page. How: This fakes one.

	await opeFixFun( curPagObj ); // What: Fixture Open Call. Why: The app should hold real data. How: This loads the backup and opens the app.

	await synSetFun( curPagObj, true ); // What: Sync Busy Call. Why: A sync is running or a change is waiting. How: This marks sync busy.

	await curPagObj.evaluate( () => { window.__stiMarBoo = true; } ); // What: Still Mark Call. Why: A reload would clear anything the page set. How: This marks the page.

	// #endregion Busy Sync Setup



	// #region Hidden Update Arrival

	await visSetFun( curPagObj, 'hidden' ); // What: Hide Call. Why: The app would reload if sync weren't busy. How: This hides the app.

	await conChaFun( curPagObj ); // What: Control Change Call. Why: A new version has taken over. How: This fires the event.

	await visSetFun( curPagObj, 'visible' ); // What: Show Call. Why: The note confirms the update was held back. How: This shows the app again.

	// #endregion Hidden Update Arrival



	// #region Held Update Checks

	await expect( curPagObj.getByText( NOT_MES_STR ) ).toBeVisible(); // What: Note Shown Assertion. Why: The update waits for the sync. How: This checks the note shows.

	expect( await curPagObj.evaluate( () => !!window.__stiMarBoo ) ).toBe( true ); // What: No Reload Assertion. Why: The sync must not be cut off. How: This checks the page's mark is still set.

	// #endregion Held Update Checks



	// #region Second Hide Check

	await visSetFun( curPagObj, 'hidden' ); // What: Hide Again Call. Why: The sync ends while the app is out of sight. How: This hides the app, which still holds the reload back.

	expect( await curPagObj.evaluate( () => !!window.__stiMarBoo ) ).toBe( true ); // What: Hidden No Reload Assertion. Why: Hiding again must not reload while sync is busy. How: This checks the mark is still set.

	// #endregion Second Hide Check



	await Promise.all( [ curPagObj.waitForEvent( 'load' ), synSetFun( curPagObj, false ) ] ); // What: Sync End Reload Wait. Why: Once the sync ends, a hidden app takes the new version. How: This ends the sync and waits for the page to load again.


} );



test( 'coming back to the app looks for a new version, and a first install shows nothing', async ( { page : curPagObj } ) => { // What: Update Check Test. Why: An app left open never looks for a new version by itself, and a first install isn't an update. How: This shows the app twice and checks each asks for an update, then fires a control change with no earlier controller and checks no note shows.


	// #region First Install Setup

	await fakWorFun( curPagObj, false ); // What: Worker Fake Call. Why: A first install has no controller at load. How: This fakes the page without one.

	await opeFixFun( curPagObj ); // What: Fixture Open Call. Why: The app should hold real data. How: This loads the backup and opens the app.

	// #endregion First Install Setup



	// #region Foreground Returns

	await visSetFun( curPagObj, 'hidden' );  // What: Hide Call. Why: The check runs on coming back. How: This hides the app first.
	await visSetFun( curPagObj, 'visible' ); // What: Show Call. Why: Coming back asks for an update. How: This shows the app.
	await visSetFun( curPagObj, 'hidden' );  // What: Hide Again Call. Why: Each return asks again. How: This hides the app once more.
	await visSetFun( curPagObj, 'visible' ); // What: Show Again Call. Why: The second return asks again. How: This shows the app.

	await expect.poll( () => curPagObj.evaluate( () => window.__updCheNum || 0 ) ).toBe( 2 ); // What: Update Check Assertion. Why: Each return should look for a new version. How: This waits until two checks were counted.

	// #endregion Foreground Returns



	// #region First Install Control Change

	await conChaFun( curPagObj ); // What: Control Change Call. Why: A first install's worker takes control too. How: This fires the event with no earlier controller.


	await expect( curPagObj.locator( '[data-element-name-hook~="updNotDiv"]' ) ).toBeEmpty(); // What: No Note Assertion. Why: A first install isn't a new version. How: This checks the note's region stays empty.

	// #endregion First Install Control Change


} );

// #endregion Module Init


