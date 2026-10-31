


// #region Imports

import { claSetFun   } from '../support/account.ts'; // What: Claim Set Function. Why: The purchase test sets the paid claim as the webhook would. How: This sets it.
import { creAccFun   } from '../support/account.ts'; // What: Create Account Function. Why: Each flow needs its own emulator account. How: This creates one.
import { EMU_PRO_STR } from '../support/account.ts'; // What: Emulator Project String. Why: The emulator's addresses name the project. How: This is the demo project.
import { expect      } from '@playwright/test';      // What: Expect. Why: Every step asserts what synced. How: This makes the assertions.
import { insClcFun   } from '../support/clock.ts';   // What: Install Clock Function. Why: The new-day flow runs both devices on chosen days. How: This fakes a page's clock before it loads.
import { locDayFun   } from '../support/clock.ts';   // What: Local Day Function. Why: The new-day flow checks which day a list was built on. How: This reads a timestamp's Chicago date.
import { reaFixFun   } from '../support/fixture.ts'; // What: Read Fixture Function. Why: The first device starts on real data. How: This reads the backup.
import { reaStaFun   } from '../support/storage.ts'; // What: Read State Function. Why: The new-day flow compares what each device saved. How: This reads a device's state.
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
 * webhook would, and the app has to notice the claim by itself. Another
 * opens a device on a new day with the previous day's list, which has to
 * take the list another device already checked off rather than build its
 * own.
 *
 * Sections:
 *  - Constants
 *  - Module Init
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const DAY_ONE_STR = '2026-10-05';     // What: Day One String. Why: Both devices share a list on the first day of the new-day flow. How: This is that Chicago date.
const DAY_TWO_STR = '2026-10-06';     // What: Day Two String. Why: The second device opens on the next day with the first day's list. How: This is that Chicago date.
const ENT_CHE_STR = '[data-element-name-hook~="todCarArt"]:not( [data-element-name-hook~="chrCarArt"], [data-element-name-hook~="daoCarArt"], [data-element-name-hook~="remCarArt"], [data-element-name-hook~="tutCarArt"] ) [data-element-name-hook~="carCheBut"]'; // What: Entry Check String. Why: The check-off has to land on a picked entry, not a reminder, a charging card, a day off, or a tutorial card. How: This finds the check button of a plain Today card.
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

test( "a device opened with yesterday's list takes the day's list another device already checked off", async ( { browser } ) => { // What: New Day Test. Why: A device opened on a new day used to build its own list before its launch sync, then win the sync and replace the list another device had already checked off. How: This shares one day's list between two devices, builds and checks off the next day's on the first, opens the second on that day, and checks both keep the first device's list.


	const emaAdrStr = `newday-${ Date.now() }@example.com`;                     // What: Email Address String. Why: Each run needs its own account. How: This builds a unique address.
	const fixStaObj = reaFixFun();                                              // What: Fixture State Object. Why: The first device starts on real data with a daily generator. How: This reads the backup.
	const oneConObj = await browser.newContext( { serviceWorkers : 'block' } ); // What: One Context Object. Why: The first device has its own storage. How: This opens a context, blocking the service worker as every suite does.
	const twoConObj = await browser.newContext( { serviceWorkers : 'block' } ); // What: Two Context Object. Why: The second device has separate storage, kept between its two launches. How: This opens another context.
	const onePagObj = await oneConObj.newPage();                                // What: One Page Object. Why: The first device's app runs here. How: This opens its page.
	const twoPagObj = await twoConObj.newPage();                                // What: Two Page Object. Why: The second device's first launch runs here. How: This opens its page.
	const oneErrArr = watErrFun( onePagObj );                                   // What: One Error Array. Why: The first device is watched for errors. How: This starts watching it.
	const twoErrArr = watErrFun( twoPagObj );                                   // What: Two Error Array. Why: The second device's first launch is watched for errors. How: This starts watching it.


	await creAccFun( emaAdrStr ); // What: Account Creation Call. Why: The paid account exists before either device signs in. How: This creates it with the paid claim.



	await insClcFun( onePagObj, DAY_ONE_STR, 12 ); // What: First Clock Install. Why: The first device starts on day one, after the backup's 6 AM run time. How: This fakes its clock before anything loads.
	await insClcFun( twoPagObj, DAY_ONE_STR, 12 ); // What: Second Clock Install. Why: The second device joins on the same day. How: This fakes its clock before anything loads.

	await wriStaFun( onePagObj, fixStaObj ); // What: Backup Load Call. Why: The first device holds real data. How: This writes the backup into its storage.

	await onePagObj.goto( '/' ); // What: First Device Load. Why: The app boots on the backup and builds day one's list. How: This opens it.

	await sigLinFun( onePagObj, emaAdrStr ); // What: First Sign-In Call. Why: The first device joins the account. How: This signs it in through the emailed link.

	await synWaiFun( onePagObj ); // What: First Upload Wait. Why: The account takes the first device's data and day one's list. How: This waits for the upload to finish.

	await twoPagObj.goto( '/' ); // What: Second Device Load. Why: The second device starts as a fresh install. How: This opens the app.

	await twoPagObj.getByRole( 'button', { name : /explore myself/ } ).click(); // What: Welcome Skip Click. Why: A fresh install opens on the welcome modal. How: This skips the tour.

	await sigLinFun( twoPagObj, emaAdrStr ); // What: Second Sign-In Call. Why: The second device joins the same account. How: This signs it in.

	await synWaiFun( twoPagObj ); // What: Adopt Wait. Why: The second device takes the account's data, day one's list included. How: This waits for the sync to finish.

	await twoPagObj.close(); // What: Second Device Close. Why: The second device sits closed while the first moves on a day. How: This closes its page, keeping its storage.



	await onePagObj.close(); // What: First Device Close. Why: The first device is opened again on day two, as a person would the next morning. How: This closes its page, keeping its storage.


	const fouPagObj = await oneConObj.newPage(); // What: Fourth Page Object. Why: The first device opens again on its own storage. How: This opens a new page in its context.
	const fouErrArr = watErrFun( fouPagObj );    // What: Fourth Error Array. Why: The first device's second launch is watched for errors. How: This starts watching it.


	await insClcFun( fouPagObj, DAY_TWO_STR, 12 ); // What: Fourth Clock Install. Why: The first device moves on to day two. How: This fakes its clock before it loads.

	await fouPagObj.goto( '/' ); // What: First Device Reopen. Why: Opening the app on day two builds day two's list. How: This opens it.


	const oneDayObj = await waiStaFun( fouPagObj, ( staAppObj ) => !!staAppObj.today.generatedAt && locDayFun( staAppObj.today.generatedAt ) === DAY_TWO_STR, "day two's list built on the first device" ); // What: One Day Object. Why: The check-off below needs day two's list in place. How: This waits for a list generated on day two.
	const donCouNum = oneDayObj.today.entries.filter( ( entCurObj ) => entCurObj.done ).length; // What: Done Count Number. Why: The check-off has to add one. How: This counts the entries already done.


	await fouPagObj.locator( ENT_CHE_STR ).first().click(); // What: Check-Off Click. Why: The list another device mustn't replace holds real progress. How: This checks off the first picked entry.


	const oneDonObj = await waiStaFun( fouPagObj, ( staAppObj ) => staAppObj.today.entries.filter( ( entCurObj ) => entCurObj.done ).length > donCouNum, 'the check-off saved on the first device' ); // What: One Done Object. Why: The second device has to end up with this exact list. How: This waits for the check-off in storage.


	await selTabFun( fouPagObj, 'settings' ); // What: Tab Switch Call. Why: Sync now is on the Settings tab. How: This switches to it.

	await fouPagObj.locator( '[data-element-name-hook~="accNowBut"]' ).click(); // What: First Sync Click. Why: Day two's checked-off list goes up without waiting two minutes. How: This clicks Sync now.

	await synWaiFun( fouPagObj ); // What: Day Two Upload Wait. Why: The list has to reach the cloud before the second device opens. How: This waits for the sync.



	const thrPagObj = await twoConObj.newPage(); // What: Third Page Object. Why: The second device opens again, on its own storage still holding day one's list. How: This opens a new page in its context.
	const thrErrArr = watErrFun( thrPagObj );    // What: Third Error Array. Why: The second device's second launch is watched for errors. How: This starts watching it.


	await insClcFun( thrPagObj, DAY_TWO_STR, 13 ); // What: Third Clock Install. Why: The second device opens on day two, after the first device's check-off. How: This fakes its clock before it loads.

	await thrPagObj.goto( '/' ); // What: Second Device Reopen. Why: Opening on day two with day one's list is the moment the bug struck. How: This opens the app.

	await waiStaFun( thrPagObj, ( staAppObj ) => staAppObj.today.generatedAt === oneDonObj.today.generatedAt, "the first device's list on the second device" ); // What: Adopted List Wait. Why: The second device has to take day two's list rather than build its own. How: This waits for the first device's generation stamp.

	await thrPagObj.waitForTimeout( 3000 ); // What: Settle Wait. Why: A list built late would replace the adopted one after the wait above. How: This gives any late generation time to happen.


	const thrStaObj = await reaStaFun( thrPagObj ); // What: Third State Object. Why: The second device's settled list is compared with the first's. How: This reads it.


	expect( thrStaObj!.today ).toEqual( oneDonObj.today ); // What: Second Device List Assertion. Why: The second device must hold the first device's list, check-off included. How: This compares the two lists. // What: Non-Null Note. Why: The wait above just read a saved state from this device. How: The ! tells TypeScript the read found one.

	await fouPagObj.locator( '[data-element-name-hook~="accNowBut"]' ).click(); // What: Final Sync Click. Why: Anything the second device uploaded would land on the first now. How: This clicks Sync now.

	await synWaiFun( fouPagObj ); // What: Final Sync Wait. Why: The first device's list is read after the sync. How: This waits for it.


	const oneEndObj = await reaStaFun( fouPagObj ); // What: One End Object. Why: The first device's list must survive the second device's launch. How: This reads it after the final sync.


	expect( oneEndObj!.today ).toEqual( oneDonObj.today ); // What: First Device List Assertion. Why: The checked-off list must still be the first device's own. How: This compares it with the list before the second device opened. // What: Non-Null Note. Why: The first device has saved state throughout the flow. How: The ! tells TypeScript the read found one.

	expect( [ ...oneErrArr, ...twoErrArr, ...thrErrArr, ...fouErrArr ], [ ...oneErrArr, ...twoErrArr, ...thrErrArr, ...fouErrArr ].join( '\n' ) ).toEqual( [] ); // What: Error Assertion. Why: A flow that logged an error failed even if it finished. How: This expects no errors on either device.



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


