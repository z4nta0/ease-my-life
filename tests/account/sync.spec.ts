


// #region Imports

import { claSetFun   } from '../support/account.ts'; // What: Claim Set Function. Why: The purchase test sets the paid claim as the webhook would. How: This sets it.
import { creAccFun   } from '../support/account.ts'; // What: Create Account Function. Why: Each flow needs its own emulator account. How: This creates one.
import { EMU_PRO_STR } from '../support/account.ts'; // What: Emulator Project String. Why: The emulator's addresses name the project. How: This is the demo project.
import { expect      } from '@playwright/test';      // What: Expect. Why: Every step asserts what synced. How: This makes the assertions.
import { reaFixFun   } from '../support/fixture.ts'; // What: Read Fixture Function. Why: The first device starts on real data. How: This reads the backup.
import { selTabFun   } from '../support/app.ts';     // What: Select Tab Function. Why: Sign-in and holidays are on the Settings tab. How: This switches to it.
import { sigLinFun   } from '../support/account.ts'; // What: Sign In Link Function. Why: Devices sign in the way a person does. How: This signs one in with an emailed link.
import { synWaiFun   } from '../support/account.ts'; // What: Sync Wait Function. Why: Steps wait for a finished sync. How: This waits for the status to read Synced.
import { test        } from '@playwright/test';      // What: Test. Why: The flow is its own test. How: This declares it.
import { waiStaFun   } from '../support/storage.ts'; // What: Wait State Function. Why: A synced change lands in IndexedDB a moment later. How: This waits for it.
import { watErrFun   } from '../support/watch.ts';   // What: Watch Errors Function. Why: The flow fails on any page error. How: This collects them.
import { wriStaFun   } from '../support/storage.ts'; // What: Write State Function. Why: The first device starts from the backup. How: This writes it.

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
 *  - Module Init
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const HOL_NAM_STR = 'Synced Holiday'; // What: Holiday Name String. Why: The second device's change must be found on the first. How: This names the holiday it adds.

// #endregion Constants



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



test( "a returning user skips onboarding and lands on Settings' Account section", async ( { page : curPagObj } ) => { // What: Returning User Test. Why: Someone restoring a backup or signing in to sync shouldn't sit through onboarding. How: This picks the returning-user option on a fresh install and checks where it lands.


	const errMesArr = watErrFun( curPagObj ); // What: Error Message Array. Why: The flow fails on any page error. How: This starts watching.



	await curPagObj.goto( '/' ); // What: App Load. Why: The option is on a fresh install's welcome modal. How: This opens the app.

	await curPagObj.locator( '[data-element-name-hook~="intRetBut"]' ).click(); // What: Returning Click. Why: This is the option under test. How: This clicks it.



	await expect( curPagObj.locator( '[data-tab="settings"]' ) ).toHaveAttribute( 'aria-current', 'page' );                 // What: Settings Assertion. Why: Signing in and importing live there. How: This expects the Settings tab current.
	await expect( curPagObj.locator( '[data-element-name-hook~="setAccSec"]' ) ).toBeInViewport();                          // What: Account Section Assertion. Why: The person lands on Sign in. How: This expects the section on screen.
	await expect( curPagObj.getByRole( 'dialog', { name : 'Welcome to Ease My Life' } ) ).toHaveCount( 0 );                 // What: Modal Gone Assertion. Why: Onboarding is out of the way. How: This expects no welcome modal.
	await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.onboarding.welcomed === true, 'the welcome modal marked done' ); // What: Welcomed Wait. Why: The modal must not come back on the next launch. How: This waits for the saved flag.

	expect( errMesArr, errMesArr.join( '\n' ) ).toEqual( [] ); // What: Error Assertion. Why: A flow that logged an error failed even if it finished. How: This expects no errors.


} );



test( 'resetting a signed-in device can delete the cloud copy too, and signs the device out', async ( { page : curPagObj } ) => { // What: Cloud Reset Test. Why: Someone must be able to remove their cloud copy along with the device's data. How: This syncs a copy, resets with the cloud option, and checks both.


	const emaAdrStr = `wipe-${ Date.now() }@example.com`;                                                                      // What: Email Address String. Why: Each run needs its own account. How: This builds a unique address.
	const errMesArr = watErrFun( curPagObj );                                                                                  // What: Error Message Array. Why: The flow fails on any page error. How: This starts watching.
	const uidValStr = await creAccFun( emaAdrStr );                                                                            // What: User Identifier Value String. Why: The cloud copy is checked by the account's id. How: This creates the paid account.
	const manUrlStr = `http://127.0.0.1:8080/v1/projects/${ EMU_PRO_STR }/databases/(default)/documents/users/${ uidValStr }`; // What: Manifest URL String. Why: The test reads the emulator's copy directly. How: This is the manifest's REST address.


	await wriStaFun( curPagObj, reaFixFun() ); // What: Backup Load Call. Why: The device has data to upload and then wipe. How: This writes the backup.

	await curPagObj.goto( '/' ); // What: App Load. Why: The app boots on the backup. How: This opens it.

	await sigLinFun( curPagObj, emaAdrStr ); // What: Sign-In Call. Why: Only a signed-in device has a cloud copy. How: This signs in.

	await synWaiFun( curPagObj ); // What: Upload Wait. Why: The copy must exist before it's deleted. How: This waits for the sync.


	expect( ( await fetch( manUrlStr, { headers : { 'Authorization' : 'Bearer owner' } } ) ).status ).toBe( 200 ); // What: Copy Exists Assertion. Why: The deletion has something to delete. How: This expects the manifest found.


	await curPagObj.locator( '[data-element-name-hook~="resRowDiv"]' ).getByRole( 'button', { exact : true, name : 'Reset' } ).click(); // What: Reset Open Click. Why: The reset asks for confirmation first. How: This opens it.

	await curPagObj.locator( '[data-element-name-hook~="resCloBut"]' ).click(); // What: Cloud Reset Click. Why: This is the option under test. How: This resets and deletes the cloud copy.

	await curPagObj.getByRole( 'dialog', { name : 'Welcome to Ease My Life' } ).waitFor(); // What: Reload Wait. Why: A reset reloads the app onto its welcome modal. How: This waits for it.


	expect( ( await fetch( manUrlStr, { headers : { 'Authorization' : 'Bearer owner' } } ) ).status ).toBe( 404 ); // What: Copy Gone Assertion. Why: The cloud copy was deleted. How: This expects the manifest missing.


	await curPagObj.getByRole( 'button', { name : /explore myself/ } ).click(); // What: Welcome Skip Click. Why: The reset device opens on the welcome modal. How: This skips it.

	await selTabFun( curPagObj, 'settings' ); // What: Tab Switch Call. Why: The account shows on the Settings tab. How: This switches to it.

	await expect( curPagObj.locator( '[data-element-name-hook~="accGooBut"]' ) ).toBeVisible(); // What: Signed Out Assertion. Why: The reset signed the device out. How: This expects the sign-in button back.

	expect( errMesArr, errMesArr.join( '\n' ) ).toEqual( [] ); // What: Error Assertion. Why: A flow that logged an error failed even if it finished. How: This expects no errors.


} );



// #endregion Module Init


