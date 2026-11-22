


// #region Imports

import { expect    } from '@playwright/test';  // What: Expect. Why: Each check passes only when the result is announced and focus lands where it should. How: This asserts on what each check reads.
import { opeFixFun } from '../support/app.ts'; // What: Open Fixture Function. Why: The Settings tab needs the app loaded with data. How: This loads the backup and opens the app.
import { selTabFun } from '../support/app.ts'; // What: Select Tab Function. Why: The support form lives on the Settings tab. How: This switches to it.
import { test      } from '@playwright/test';  // What: Test. Why: Each check is its own test. How: This declares them.


import type { Page } from '@playwright/test'; // What: Page. Why: The helpers drive a Playwright page. How: This types their page parameter.

// #endregion Imports



/**
 * announce.spec.ts = Announce Spec
 *
 * @summary
 * Checks that the app's forms tell screen reader users what happened once
 * they're sent, in whichever engine the project runs, such as the Settings
 * tab's support form. Each form's live regions start out in the page and
 * empty, and each kind of result fills its region or moves focus to what
 * replaces the form, such as a failed send putting the fallback note in the
 * alert region and handing focus back to Send. Adapted from TechGeek.support's
 * own.
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

const ADD_LOC_STR = '[class*="todLisDiv"] > [role="status"]'; // What: Added Locator String. Why: The reminder form's note sits in its own classless region at the top of the Reminders list. How: This matches that status region by its place in the list.
const ALE_LOC_STR = '[class*="supAleSpa"]';                   // What: Alert Locator String. Why: The tab holds other alert and status regions, so the form's own is found by its class. How: This matches the alert region's module class, which the dev server keeps in the hashed name.
const STA_LOC_STR = '[class*="senStaSpa"]';                   // What: Status Locator String. Why: The sent note's region sits in the support row, beside the tab's other status regions. How: This matches its module class.

// #endregion Constants



// #region Helpers

// #region opeForFun

/**
 * opeForFun = Open Form Function
 *
 * @summary
 * Loads the app with the backup, switches to the Settings tab, and presses
 * Contact Support, waiting until the form's alert region is in the page.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page to open the form on.
 *
 * @returns A promise that settles once the form is open, with no value.
 *
 * @example
 * ```ts
 * await opeForFun(page) // => Promise<void>
 * ```
 *
*/

async function opeForFun ( curPagObj : Page ) : Promise< void > {


	await opeFixFun( curPagObj ); // What: Fixture Open Call. Why: The tab should hold real data, the way it's used. How: This loads the backup and opens the app.

	await selTabFun( curPagObj, 'settings' ); // What: Settings Tab Call. Why: The form lives there. How: This switches to the Settings tab.

	await curPagObj.getByRole( 'button', { exact : true, name : 'Contact Support' } ).click(); // What: Contact Support Click Call. Why: The form opens from its row. How: This presses the button.

	await curPagObj.locator( ALE_LOC_STR ).waitFor( { state : 'attached' } ); // What: Alert Region Wait. Why: The form mounts as it opens. How: This waits for its alert region.


}

// #endregion opeForFun



// #region senFilFun

/**
 * senFilFun = Send Filled Function
 *
 * @summary
 * Fills the open form's subject and message, answers the form's POST to the
 * app's root with the given status, or drops the connection when the status
 * is 0, and presses Send.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page whose form is open.
 * @param resStaNum - Response Status Number: The status to answer with, or 0
 *                    to drop the connection.
 *
 * @returns A promise that settles once Send is pressed, with no value.
 *
 * @example
 * ```ts
 * await senFilFun(page, 200) // => Promise<void>
 * ```
 *
*/

async function senFilFun ( curPagObj : Page, resStaNum : number ) : Promise< void > {


	await curPagObj.route( '**/', ( rouReqObj ) => { // What: Post Route Call. Why: The send has to reach no real server, with its answer chosen by the test. How: This answers the root's POST, and lets every other request through.


		if ( rouReqObj.request().method() !== 'POST' ) return rouReqObj.fallback(); // What: Non-Post Guard. Why: The page itself loads from the same address. How: This passes any other request on.



		return resStaNum ? rouReqObj.fulfill( { status : resStaNum } ) : rouReqObj.abort(); // What: Post Answer Return. Why: Each test fakes one server answer. How: This answers with the status, or drops the connection for 0.


	} );

	await curPagObj.getByPlaceholder( 'What’s going on?' ).fill( 'Audit check' );                // What: Subject Fill Call. Why: Both fields are needed to send. How: This types a subject.
	await curPagObj.getByPlaceholder( 'The more detail, the better.' ).fill( 'Testing the form.' ); // What: Message Fill Call. Why: Both fields are needed to send. How: This types a message.

	await curPagObj.getByRole( 'button', { exact : true, name : 'Send' } ).click(); // What: Send Click Call. Why: The form sends from its Send button. How: This presses it.


}

// #endregion senFilFun

// #endregion Helpers



// #region Module Init

test.use( { contextOptions : { reducedMotion : 'reduce' } } ); // What: Reduced Motion Use. Why: The form's collapse and the notes' pops would otherwise still be running when the checks read them. How: This makes each page prefer reduced motion.



test( 'the status and alert regions are in the page and empty before anything is sent', async ( { page : curPagObj } ) => { // What: Empty Regions Test. Why: A live region added at the moment it speaks is often missed. How: This opens the form and checks both regions hold no text.


	await opeForFun( curPagObj ); // What: Form Open Call. Why: The alert region lives in the open form. How: This opens it.


	await expect( curPagObj.locator( STA_LOC_STR ) ).toHaveAttribute( 'role', 'status' ); // What: Status Role Assertion. Why: The sent note has to be announced politely. How: This checks the region's role.
	await expect( curPagObj.locator( STA_LOC_STR ) ).toBeEmpty();                         // What: Empty Status Assertion. Why: Nothing has been sent yet. How: This checks the region holds no text.
	await expect( curPagObj.locator( ALE_LOC_STR ) ).toHaveAttribute( 'role', 'alert' );  // What: Alert Role Assertion. Why: A refused or failed send is an error. How: This checks the region's role.
	await expect( curPagObj.locator( ALE_LOC_STR ) ).toBeEmpty();                         // What: Empty Alert Assertion. Why: Nothing has gone wrong yet. How: This checks the region holds no text.


} );



test( 'an empty send puts the validation note in the alert region', async ( { page : curPagObj } ) => { // What: Empty Send Test. Why: Screen reader users have to hear why nothing was sent. How: This presses Send with both fields empty and checks the alert region and the focus.


	await opeForFun( curPagObj ); // What: Form Open Call. Why: The form has to be open to send. How: This opens it.

	await curPagObj.getByRole( 'button', { exact : true, name : 'Send' } ).click(); // What: Send Click Call. Why: An empty send is refused. How: This presses Send with nothing typed.


	await expect( curPagObj.locator( ALE_LOC_STR ) ).toHaveText( 'Please fill out both form fields.' );   // What: Validation Alert Assertion. Why: The alert region announces the refusal. How: This checks it holds the validation note.
	await expect( curPagObj.getByRole( 'button', { exact : true, name : 'Send' } ) ).toBeFocused(); // What: Send Focus Assertion. Why: Focus never falls to the page. How: This checks Send still holds it.


} );



test( 'a failed send puts the fallback note in the alert region and hands focus back to Send', async ( { page : curPagObj } ) => { // What: Failed Send Test. Why: Screen reader users have to hear that the message didn't go through. How: This sends with the connection dropped and checks the alert region and the focus.


	await opeForFun( curPagObj ); // What: Form Open Call. Why: The form has to be open to send. How: This opens it.

	await senFilFun( curPagObj, 0 ); // What: Failed Send Call. Why: The fallback note shows only after a failed send. How: This sends with the connection dropped.


	await expect( curPagObj.locator( ALE_LOC_STR ) ).toContainText( 'Couldn’t send.' );             // What: Fallback Alert Assertion. Why: The alert region announces the failure. How: This checks it holds the fallback note.
	await expect( curPagObj.getByRole( 'button', { exact : true, name : 'Send' } ) ).toBeFocused(); // What: Send Focus Assertion. Why: The person can retry from where they were. How: This checks focus came back to Send.


} );



test( 'a sent message fills the status region and moves focus to Contact Support', async ( { page : curPagObj } ) => { // What: Sent Message Test. Why: The focused Send button leaves with the closing form, and the result must be announced. How: This sends with a 200 answer and checks the status region and the focus.


	await opeForFun( curPagObj ); // What: Form Open Call. Why: The form has to be open to send. How: This opens it.

	await senFilFun( curPagObj, 200 ); // What: Sent Send Call. Why: The note shows only after a sent message. How: This sends with the root's POST answered by a 200.


	await expect( curPagObj.locator( STA_LOC_STR ) ).toHaveText( 'Message sent, thanks! I’ll be in touch.' );       // What: Sent Status Assertion. Why: The status region announces the send. How: This checks it holds the sent note.
	await expect( curPagObj.getByRole( 'button', { exact : true, name : 'Contact Support' } ) ).toBeFocused(); // What: Contact Focus Assertion. Why: Focus never falls to the page as the form closes. How: This checks Contact Support holds it.


} );


test( "the reminder form's status region is empty on load and fills once a reminder is added", async ( { page : curPagObj } ) => { // What: Reminder Note Test. Why: The note after adding a reminder has to reach screen reader users. How: This checks the region is empty on load, adds a reminder, and checks the region holds the note.


	await opeFixFun( curPagObj ); // What: Fixture Open Call. Why: The Reminders list lives on the Today tab, which opens first. How: This loads the backup and opens the app.



	// #region Region Starts Empty

	await expect( curPagObj.locator( ADD_LOC_STR ) ).toHaveCount( 1 ); // What: One Region Assertion. Why: The region has to be in the list from the first render. How: This checks exactly one is there.
	await expect( curPagObj.locator( ADD_LOC_STR ) ).toBeEmpty();      // What: Empty Region Assertion. Why: Nothing has been added yet. How: This checks it holds no text.

	// #endregion Region Starts Empty



	// #region Reminder Add Steps

	await curPagObj.locator( '[data-element-name-hook~="remAddBut"]' ).click();                      // What: Add Open Call. Why: The form opens from the Reminders header. How: This presses its add button.
	await curPagObj.locator( '[data-element-name-hook~="addNamInp"]' ).fill( 'Announced Reminder' ); // What: Name Fill Call. Why: A reminder needs a name to save. How: This types one.
	await curPagObj.locator( '[data-element-name-hook~="remSavBut"]' ).click();                      // What: Add Save Call. Why: The note shows once the reminder is added. How: This saves it.

	// #endregion Reminder Add Steps



	await expect( curPagObj.locator( ADD_LOC_STR ) ).not.toBeEmpty(); // What: Filled Region Assertion. Why: The region announces where the reminder went. How: This checks it now holds the note.


} );

// #endregion Module Init


