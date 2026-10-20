


// #region Imports

import { expect    } from '@playwright/test';      // What: Expect. Why: Every step asserts what synced. How: This makes the assertions.
import { reaFixFun } from '../support/fixture.ts'; // What: Read Fixture Function. Why: The first device starts on real data. How: This reads the backup.
import { selTabFun } from '../support/app.ts';     // What: Select Tab Function. Why: Sign-in and holidays are on the Settings tab. How: This switches to it.
import { test      } from '@playwright/test';      // What: Test. Why: The flow is its own test. How: This declares it.
import { waiStaFun } from '../support/storage.ts'; // What: Wait State Function. Why: A synced change lands in IndexedDB a moment later. How: This waits for it.
import { watErrFun } from '../support/watch.ts';   // What: Watch Errors Function. Why: The flow fails on any page error. How: This collects them.
import { wriStaFun } from '../support/storage.ts'; // What: Write State Function. Why: The first device starts from the backup. How: This writes it.


import type { Page } from '@playwright/test'; // What: Page. Why: The helpers drive one device's page. How: This types their page parameter.

// #endregion Imports



/**
 * sync.spec.ts = Account Sync Spec
 *
 * @summary
 * Runs paid sync end to end against the Firebase Emulator, which npm run
 * test:account starts and stops around this suite. Two browser contexts
 * stand in for two devices. The emulator's admin API creates the account
 * and gives it the paid claim, standing in for the payment webhook, and
 * reads back each emailed sign-in link. The first device, on the real
 * backup, signs in with that link and uploads. The second, a fresh install,
 * signs in and adopts the account's data, adds a holiday, and syncs, and the
 * first device's next sync brings the holiday over. A second flow buys sync
 * on an unpaid account, with the checkout stubbed and the claim set as the
 * webhook would, and the app has to notice the claim by itself.
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

const AUT_EMU_STR = 'http://127.0.0.1:9099'; // What: Auth Emulator String. Why: The admin calls reach the auth emulator. How: This is its default address.
const EMU_PRO_STR = 'demo-ease-my-life';     // What: Emulator Project String. Why: Admin calls name the project. How: This is the demo project the app uses under the emulator.
const HOL_NAM_STR = 'Synced Holiday';        // What: Holiday Name String. Why: The second device's change must be found on the first. How: This names the holiday it adds.

// #endregion Constants



// #region Helpers

const admPosFun = ( adrPatStr : string, posBodObj : object ) => fetch( `${ AUT_EMU_STR }${ adrPatStr }`, { body : JSON.stringify( posBodObj ), headers : { 'Authorization' : 'Bearer owner', 'Content-Type' : 'application/json' }, method : 'POST' } ).then( ( resCurObj ) => resCurObj.json() ); // What: Admin Post Function. Why: The emulator's admin API creates the account and sets its claim. How: This posts JSON as the emulator's owner and parses the reply.



const claSetFun = ( uidValStr : string ) => admPosFun( `/identitytoolkit.googleapis.com/v1/projects/${ EMU_PRO_STR }/accounts:update`, { customAttributes : JSON.stringify( { paid : true } ), localId : uidValStr } ); // What: Claim Set Function. Why: Tests stand in for the payment webhook. How: This sets an account's paid claim.



// #region creAccFun

/**
 * creAccFun = Create Account Function
 *
 * @summary
 * Creates the account in the auth emulator and, unless told otherwise,
 * gives it the paid claim before anyone signs in, so the first token either device receives already
 * carries it, as it would after a purchase and a token refresh. The account
 * starts with a throwaway password that nothing uses, and the emailed link
 * then signs in to the same account and verifies its address.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param emaAdrStr - Email Address String: The account's address.
 * @param paiValBoo - Paid Value Boolean: Whether it starts paid, defaulting
 *                    to true.
 *
 * @returns A promise that settles with the account's id once it's set up.
 *
 * @example
 * ```ts
 * await creAccFun('sync@example.com') // => Promise<string>
 * ```
 *
*/

async function creAccFun ( emaAdrStr : string, paiValBoo : boolean = true ) : Promise< string > {


	const sigUpcObj = await admPosFun( '/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key', { email : emaAdrStr, password : 'unused-password', returnSecureToken : true } ); // What: Sign Up Object. Why: The account has to exist before its claim is set. How: This creates it.


	if ( paiValBoo ) await claSetFun( sigUpcObj.localId ); // What: Paid Claim Call. Why: Only a paid account syncs, and the webhook that sets this doesn't run here. How: This sets the paid claim unless the account starts unpaid.



	return sigUpcObj.localId; // What: Identifier Return. Why: A purchase test sets the claim later. How: This returns the account's id.


}

// #endregion creAccFun



// #region sigLinFun

/**
 * sigLinFun = Sign In Link Function
 *
 * @summary
 * Signs a device in the way a person does: types the address on the
 * Settings tab and asks for a link, then opens the link the emulator
 * recorded for it (built as the app's own address with the link's code, as
 * the real email's link would land), and waits for the account to show as
 * signed in. The address stays remembered on this device, so the link
 * finishes without being typed again.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The device's page.
 * @param emaAdrStr - Email Address String: The account's address.
 *
 * @returns A promise that settles once the device is signed in, with no
 *          value.
 *
 * @example
 * ```ts
 * await sigLinFun(curPagObj, 'sync@example.com') // => Promise<void>
 * ```
 *
*/

async function sigLinFun ( curPagObj : Page, emaAdrStr : string ) : Promise< void > {


	await selTabFun( curPagObj, 'settings' ); // What: Tab Switch Call. Why: The sign-in form is on the Settings tab. How: This switches to it.


	await curPagObj.locator( '[data-element-name-hook~="accEmaInp"]' ).fill( emaAdrStr );                           // What: Address Fill Call. Why: The link is sent to the account's address. How: This types it.
	await curPagObj.locator( '[data-element-name-hook~="accLinFor"]' ).getByRole( 'button' ).click();               // What: Send Click Call. Why: The link is requested on click. How: This clicks Email me a link.
	await expect( curPagObj.locator( '[data-element-name-hook~="accStaPar"]' ) ).toHaveText( /Sign-in link sent/ ); // What: Sent Assertion. Why: The link must have gone out before it's read back. How: This waits for the status region's news.



	const oobResObj = await fetch( `${ AUT_EMU_STR }/emulator/v1/projects/${ EMU_PRO_STR }/oobCodes` ).then( ( resCurObj ) => resCurObj.json() );                                                          // What: Out-Of-Band Result Object. Why: The emulator records every sign-in link instead of emailing it. How: This reads them.
	const oobCodStr = oobResObj.oobCodes.filter( ( oobCurObj : { email : string, requestType : string } ) => oobCurObj.email === emaAdrStr && oobCurObj.requestType === 'EMAIL_SIGNIN' ).at( -1 ).oobCode; // What: Out-Of-Band Code String. Why: The newest link for this address is this device's. How: This picks its code.


	await curPagObj.goto( `/?apiKey=fake-api-key&lang=en&mode=signIn&oobCode=${ oobCodStr }` ); // What: Link Open Call. Why: Opening the emailed link is what finishes signing in. How: This opens the app's address with the link's code.



	await selTabFun( curPagObj, 'settings' ); // What: Tab Return Call. Why: The account shows on the Settings tab. How: This switches back to it.


	await expect( curPagObj.locator( '[data-element-name-hook~="accOutBut"]' ) ).toBeVisible(); // What: Signed In Assertion. Why: The link must have signed the device in. How: This waits for the sign-out button.


}

// #endregion sigLinFun



const synWaiFun = ( curPagObj : Page ) => expect( curPagObj.locator( '[data-element-name-hook~="accStaSpa"]' ) ).toHaveText( /^Synced at/, { timeout : 30000 } ); // What: Sync Wait Function. Why: Each step waits for a finished sync. How: This waits for the status to read Synced.

// #endregion Helpers



// #region Module Init

test( 'two devices sign in to one paid account and sync each other', async ( { browser } ) => { // What: Two Device Test. Why: Paid sync has to carry one device's data and changes to another. How: This signs two contexts in to one account and syncs each way.


	const emaAdrStr = `sync-${ Date.now() }@example.com`;                       // What: Email Address String. Why: Each run needs its own account. How: This builds a unique address.
	const fixStaObj = reaFixFun();                                              // What: Fixture State Object. Why: The first device starts on real data, which the second must receive. How: This reads the backup.
	const oneConObj = await browser.newContext( { serviceWorkers : 'block' } ); // What: One Context Object. Why: The first device has its own storage. How: This opens a context, blocking the service worker as every suite does.
	const twoConObj = await browser.newContext( { serviceWorkers : 'block' } ); // What: Two Context Object. Why: The second device has separate storage. How: This opens another context.
	const onePagObj = await oneConObj.newPage();                                // What: One Page Object. Why: The first device's app runs here. How: This opens its page.
	const twoPagObj = await twoConObj.newPage();                                // What: Two Page Object. Why: The second device's app runs here. How: This opens its page.
	const oneErrArr = watErrFun( onePagObj );                                   // What: One Error Array. Why: The first device is watched for errors. How: This starts watching it.
	const twoErrArr = watErrFun( twoPagObj );                                   // What: Two Error Array. Why: The second device is watched for errors. How: This starts watching it.


	await creAccFun( emaAdrStr ); // What: Account Creation Call. Why: The paid account exists before either device signs in. How: This creates it with the paid claim.



	await wriStaFun( onePagObj, fixStaObj ); // What: Backup Load Call. Why: The first device holds real data. How: This writes the backup into its storage.

	await onePagObj.goto( '/' ); // What: First Device Load. Why: The app boots on the backup. How: This opens it.

	await sigLinFun( onePagObj, emaAdrStr ); // What: First Sign-In Call. Why: The first device joins the account. How: This signs it in through the emailed link.

	await synWaiFun( onePagObj ); // What: First Upload Wait. Why: An empty account takes the first device's data. How: This waits for the upload to finish.



	await twoPagObj.goto( '/' ); // What: Second Device Load. Why: The second device starts as a fresh install. How: This opens the app.

	await twoPagObj.getByRole( 'button', { name : /explore myself/ } ).click(); // What: Welcome Skip Click. Why: A fresh install opens on the welcome modal. How: This skips the tour.

	await sigLinFun( twoPagObj, emaAdrStr ); // What: Second Sign-In Call. Why: The second device joins the same account. How: This signs it in.

	await synWaiFun( twoPagObj ); // What: Adopt Wait. Why: A fresh device takes the account's data. How: This waits for the sync to finish.

	await waiStaFun( twoPagObj, ( staAppObj ) => staAppObj.pickers.length === fixStaObj.pickers.length, 'the account adopted on the second device' ); // What: Adopted State Wait. Why: The second device must now hold the first's pickers. How: This waits until its count matches the backup's.



	await twoPagObj.locator( '[aria-label="Name of the day off to add"]' ).fill( HOL_NAM_STR );                  // What: Holiday Name Fill. Why: The second device makes a change to carry back. How: This names a holiday.
	await twoPagObj.locator( '[data-element-name-hook~="holAddDiv"] [aria-label="Date"]' ).fill( '2026-11-03' ); // What: Holiday Date Fill. Why: A holiday needs a date. How: This sets one.



	await twoPagObj.locator( '[data-element-name-hook~="holAddDiv"]' ).getByRole( 'button', { exact : true, name : 'Add' } ).click(); // What: Holiday Add Click. Why: The change is made on click. How: This adds the holiday.

	await waiStaFun( twoPagObj, ( staAppObj ) => staAppObj.holidays.custom.some( ( holCusObj ) => holCusObj.name === HOL_NAM_STR ), 'the holiday saved on the second device' ); // What: Holiday Save Wait. Why: The sync must read the saved change. How: This waits for the holiday in storage.

	await twoPagObj.locator( '[data-element-name-hook~="accNowBut"]' ).click(); // What: Second Sync Click. Why: The change goes up without waiting two minutes. How: This clicks Sync now.

	await synWaiFun( twoPagObj ); // What: Change Upload Wait. Why: The holiday must reach the cloud. How: This waits for the sync.



	await onePagObj.locator( '[data-element-name-hook~="accNowBut"]' ).click(); // What: First Sync Click. Why: The first device pulls the change. How: This clicks Sync now.

	await waiStaFun( onePagObj, ( staAppObj ) => staAppObj.holidays.custom.some( ( holCusObj ) => holCusObj.name === HOL_NAM_STR ), 'the holiday synced to the first device' ); // What: Holiday Arrival Wait. Why: The second device's change has to reach the first. How: This waits for the holiday in its storage.



	expect( [ ...oneErrArr, ...twoErrArr ], [ ...oneErrArr, ...twoErrArr ].join( '\n' ) ).toEqual( [] ); // What: Error Assertion. Why: A flow that logged an error failed even if it finished. How: This expects no errors on either device.



	await oneConObj.close(); // What: First Context Close. Why: The devices end with the test. How: This closes the first.
	await twoConObj.close(); // What: Second Context Close. Why: The devices end with the test. How: This closes the second.


} );

test( 'an unpaid account buys sync, and the app picks up the paid claim on its own', async ( { page : curPagObj } ) => { // What: Purchase Test. Why: Returning from the checkout must unlock sync without a reload or a sign-in. How: This stubs the checkout, sets the claim as the webhook would, and waits for the app to sync.


	const emaAdrStr = `buy-${ Date.now() }@example.com`;   // What: Email Address String. Why: Each run needs its own account. How: This builds a unique address.
	const errMesArr = watErrFun( curPagObj );              // What: Error Message Array. Why: The flow fails on any page error. How: This starts watching.
	const uidValStr = await creAccFun( emaAdrStr, false ); // What: User Identifier Value String. Why: The claim is set on this account mid-flow. How: This creates it unpaid.



	await curPagObj.route( '**/.netlify/functions/checkout', async ( rouCurObj ) => { // What: Checkout Stub. Why: The dev server has no functions, and no real checkout may be made. How: This sets the claim, as Polar's webhook would, and answers with the app's own return address.


		await claSetFun( uidValStr ); // What: Webhook Stand-In. Why: The purchase lands while the buyer is away. How: This sets the paid claim.



		await rouCurObj.fulfill( { json : { url : '/?purchase=sync' } } ); // What: Stub Reply. Why: The app sends the buyer to the checkout's address, here the return itself. How: This answers with it.


	} );



	await curPagObj.goto( '/' ); // What: App Load. Why: The buyer starts on a fresh install. How: This opens the app.

	await curPagObj.getByRole( 'button', { name : /explore myself/ } ).click(); // What: Welcome Skip Click. Why: A fresh install opens on the welcome modal. How: This skips the tour.

	await sigLinFun( curPagObj, emaAdrStr ); // What: Sign-In Call. Why: Only a signed-in account can buy. How: This signs in.



	await curPagObj.locator( '[data-element-name-hook~="accBuyBut"]' ).click(); // What: Unlock Click. Why: This is the purchase. How: This clicks Unlock sync.

	await selTabFun( curPagObj, 'settings' ); // What: Tab Return Call. Why: The account shows on the Settings tab after the return. How: This switches to it.

	await synWaiFun( curPagObj ); // What: Unlock Wait. Why: The app must notice the claim and sync. How: This waits for the status to read Synced.



	expect( errMesArr, errMesArr.join( '\n' ) ).toEqual( [] ); // What: Error Assertion. Why: A flow that logged an error failed even if it finished. How: This expects no errors.


} );



// #endregion Module Init


