


// #region Imports

import { expect    } from '@playwright/test';      // What: Expect. Why: Each check passes only when the typed markup stayed text. How: This asserts on what each check reads from the page.
import { opeFixFun } from '../support/app.ts';     // What: Open Fixture Function. Why: Each field is typed into on real data. How: This loads the backup on its fixed day.
import { polSetFun } from '../support/policy.ts';  // What: Policy Setup Function. Why: The fields are used under the headers Netlify really sends. How: This adds the headers and the violation listener.
import { polVioFun } from '../support/policy.ts';  // What: Policy Violation Function. Why: Markup rendered as HTML would try to run its handler, which the policy refuses and reports. How: This reads the recorded violations.
import { selTabFun } from '../support/app.ts';     // What: Select Tab Function. Why: Each field lives on its own tab. How: This switches to it through the navigation.
import { subHolFun } from '../support/app.ts';     // What: Submit Holiday Function. Why: A custom holiday is added through the Settings form. How: This names, dates, and adds it.
import { test      } from '@playwright/test';      // What: Test. Why: Each field is its own test. How: This declares them.
import { waiStaFun } from '../support/storage.ts'; // What: Wait State Function. Why: The typed name is checked once it's saved and shown again. How: This waits for it in IndexedDB.
import { watErrFun } from '../support/watch.ts';   // What: Watch Errors Function. Why: A page error during a check is a failure even when the check itself passes. How: This collects page and console errors.


import type { Page } from '@playwright/test'; // What: Page. Why: The text check reads a Playwright page. How: This types its page parameter.

// #endregion Imports



/**
 * input.spec.ts = Input Spec
 *
 * @summary
 * Checks that what a person types is shown as text, never run or rendered as
 * HTML, in whichever engine the project runs. A picker's name, a reminder's
 * name, and a custom holiday's name are each set to an image tag whose error
 * handler would set a flag on the window, then saved and shown again. The
 * name has to read back as text, as typed or, for a picker, tidied into
 * plain words with no markup left, with no image added to the page,
 * no flag set, and no policy violation reported, which the policy's refusal
 * of the inline handler would raise. Each page loads from the production
 * build under the headers the built dist/_headers sends.
 *
 * Sections:
 *  - Constants
 *  - Module State
 *  - Helpers
 *  - Module Init
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const PAY_LOA_STR = '<img src=x onerror=__xssRanNum=1>'; // What: Payload String. Why: Markup rendered as HTML would add an image whose failed load runs its handler. How: This is an image tag with an inline error handler, short enough for the picker name field's 40-character limit.

// #endregion Constants



// #region Module State

let errMesArr : string[] = []; // What: Error Message Array. Why: Each test's page errors are checked when it ends. How: This holds the current test's list.

// #endregion Module State



// #region Helpers

// #region texCheFun

/**
 * texCheFun = Text Check Function
 *
 * @summary
 * Checks that the name a field saved shows on the page as text and did
 * nothing else: an element reads exactly the name, the page holds no image
 * with the payload's source, the handler's flag was never set on the window,
 * and the policy reported no violation. It expects the page readied by
 * polSetFun and the name already saved and shown.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page to check.
 * @param savNamStr - Saved Name String: The name as the app saved it, the
 *                    payload itself unless the field tidies what it's given.
 *
 * @returns A promise that settles once every check has passed, with no
 *          value.
 *
 * @example
 * ```ts
 * texCheFun(page, PAY_LOA_STR) // => Promise<void>
 * ```
 *
*/

async function texCheFun ( curPagObj : Page, savNamStr : string ) : Promise< void > {


	await expect( curPagObj.getByText( savNamStr, { exact : true } ).first() ).toBeVisible(); // What: Shown As Text Assertion. Why: The name should read back exactly as saved. How: This checks an element whose text is the saved name is on screen.

	expect( await curPagObj.locator( 'img[src="x"]' ).count() ).toBe( 0 );             // What: No Image Assertion. Why: Markup rendered as HTML would add the payload's image. How: This checks the page holds none.
	expect( await curPagObj.evaluate( () => '__xssRanNum' in window ) ).toBe( false ); // What: No Flag Assertion. Why: A handler that ran would set its flag. How: This checks the window has none.
	expect( await polVioFun( curPagObj ) ).toEqual( [] );                              // What: No Violation Assertion. Why: An inline handler the policy refused would still be reported. How: This checks nothing was refused.


}

// #endregion texCheFun

// #endregion Helpers



// #region Module Init

test.beforeEach( async ( { page : curPagObj } ) => { // What: Setup Hook. Why: Every field is typed into on real data under the policy, with errors watched. How: This starts the watcher, adds the headers and the violation listener, then opens the backup.


	errMesArr = watErrFun( curPagObj ); // What: Error Watch Call. Why: Errors are collected from the start. How: This attaches the watcher.



	await polSetFun( curPagObj ); // What: Policy Setup Call. Why: The page has to load under the policy. How: This adds the headers and the violation listener.

	await opeFixFun( curPagObj ); // What: App Open Call. Why: Each flow starts on the fixed day. How: This opens the backup.


} );



test.afterEach( () => { expect( errMesArr, errMesArr.join( '\n' ) ).toEqual( [] ); } ); // What: Error Check Hook. Why: A flow that logged an error failed even if it finished. How: This expects no errors.



test( 'a picker name typed as markup is tidied and shows as text', async ( { page : curPagObj } ) => { // What: Picker Name Test. Why: A picker's name shows again on every tab, and the app tidies a picker's name into plain words as it saves. How: This renames a picker in the Data tab's controls, saves, checks the saved name kept no markup, and checks it shows as text and ran nothing.


	await selTabFun( curPagObj, 'data' ); // What: Tab Switch Call. Why: Pickers are renamed on the Data tab. How: This switches to it.


	const carSecLoc = curPagObj.locator( '[data-element-name-hook~="datCatSec"][data-picker-id]' ).first(); // What: Card Section Locator. Why: The first picker is renamed. How: This finds its card.


	await carSecLoc.locator( '[data-element-name-hook~="catHeaBut"]' ).first().click(); // What: Card Open Click. Why: A closed card hides its controls. How: This opens it.

	await carSecLoc.locator( '[data-element-name-hook~="catTogBut"]' ).first().click(); // What: Controls Open Click. Why: The name lives in the controls. How: This opens them.

	await carSecLoc.locator( '[data-element-name-hook~="basNamInp"]' ).fill( PAY_LOA_STR ); // What: Name Fill Call. Why: The payload is typed where a name goes. How: This fills the name field.

	await carSecLoc.locator( '[data-element-name-hook~="picFooDiv"]' ).getByRole( 'button', { exact : true, name : 'Save' } ).click(); // What: Save Click Call. Why: Save commits the draft. How: This clicks it.


	const savStaObj = await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.pickers.some( ( curPicObj ) => /onerror/i.test( curPicObj.name ) ), 'picker name saved' ); // What: Saved State Object. Why: The name is checked once saved, in whatever form the app tidied it to. How: This waits for a picker whose name holds the payload's words.
	const savNamStr = savStaObj.pickers.find( ( curPicObj ) => /onerror/i.test( curPicObj.name ) )!.name;                                                               // What: Saved Name String. Why: The tidied name is what the card shows. How: This reads it from the saved state. // What: Non-Null Note. Why: The wait above returns only once such a picker exists. How: The ! says find succeeds.


	expect( savNamStr ).not.toMatch( /[<>=]/ ); // What: Tidied Name Assertion. Why: A picker's name keeps only words, so no markup reaches any screen. How: This checks the saved name holds none of the tag's symbols.

	await texCheFun( curPagObj, savNamStr ); // What: Text Check Call. Why: The saved name shows again on the card. How: This checks it shows as text and ran nothing.


} );



test( 'a reminder name typed as markup shows as text', async ( { page : curPagObj } ) => { // What: Reminder Name Test. Why: A reminder's name shows again on its Today card. How: This adds a reminder from Today, saves, and checks the name shows as text and ran nothing.


	await curPagObj.locator( '[data-element-name-hook~="remAddBut"]' ).click(); // What: Add Open Click. Why: New reminders start from the add button. How: This opens the form.

	await curPagObj.locator( '[data-element-name-hook~="addNamInp"]' ).fill( PAY_LOA_STR ); // What: Name Fill Call. Why: The payload is typed where a name goes. How: This fills the name field.

	await curPagObj.locator( '[data-element-name-hook~="remSavBut"]' ).click(); // What: Save Click Call. Why: The reminder is created on save. How: This clicks it.

	await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.tasks.some( ( curTasObj ) => curTasObj.name === PAY_LOA_STR ), 'reminder added' ); // What: Name Save Wait. Why: The name is checked once saved. How: This waits for it in IndexedDB.

	await texCheFun( curPagObj, PAY_LOA_STR ); // What: Text Check Call. Why: The saved name shows on the reminder's card. How: This checks it shows as text and ran nothing.


} );



test( 'a holiday name typed as markup shows as text', async ( { page : curPagObj } ) => { // What: Holiday Name Test. Why: A custom holiday's name shows again in the Settings list and on its day off. How: This adds a holiday in Settings and checks the name shows as text and ran nothing.


	await selTabFun( curPagObj, 'settings' ); // What: Tab Switch Call. Why: Holidays are added on the Settings tab. How: This switches to it.

	await subHolFun( curPagObj, PAY_LOA_STR, '2026-11-03' ); // What: Holiday Submit Call. Why: The payload is typed where a holiday's name goes. How: This names, dates, and adds the holiday.

	await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.holidays.custom.some( ( holCusObj ) => holCusObj.name === PAY_LOA_STR ), 'holiday added' ); // What: Name Save Wait. Why: The name is checked once saved. How: This waits for it in IndexedDB.

	await texCheFun( curPagObj, PAY_LOA_STR ); // What: Text Check Call. Why: The saved name shows in the holiday list. How: This checks it shows as text and ran nothing.


} );

// #endregion Module Init


