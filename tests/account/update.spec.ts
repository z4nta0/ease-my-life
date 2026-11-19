


// #region Imports

import { conChaFun   } from '../support/update.ts';          // What: Controller Change Function. Why: A new version taking control starts the flow. How: This fires the control change.
import { creAccFun   } from '../support/account.ts';         // What: Create Account Function. Why: The flow needs its own paid emulator account. How: This creates one.
import { DAY_ONE_STR } from '../support/account.ts';         // What: Day One String. Why: The device's daily list is built on a known day before the change. How: This is that Chicago date.
import { EMU_PRO_STR } from '../../src/emulator-project.ts'; // What: Emulator Project String. Why: The manifest's address names the project. How: This is the demo project.
import { expect      } from '@playwright/test';              // What: Expect. Why: Each step asserts on the note, the page's mark, and the cloud's revision. How: This makes the assertions.
import { fakWorFun   } from '../support/update.ts';          // What: Fake Worker Function. Why: The suites block service workers, so the update flow's inputs are faked. How: This fakes the controller, the registration, and the visibility.
import { FIR_EMU_STR } from '../support/emulator.ts';        // What: Firestore Emulator String. Why: The test reads the manifest straight from the Firestore emulator. How: This is its address.
import { insClcFun   } from '../support/clock.ts';           // What: Install Clock Function. Why: The flow runs on a chosen day, so its daily list is built at a known moment. How: This fakes the page's clock before it loads.
import { locDayFun   } from '../support/clock.ts';           // What: Local Day Function. Why: The flow checks which day a list was built on. How: This reads a timestamp's Chicago date.
import { NOT_MES_STR } from '../support/update.ts';          // What: Note Message String. Why: The note is found by its message. How: This is the text it shows.
import { reaFixFun   } from '../support/fixture.ts';         // What: Read Fixture Function. Why: The device starts on real data. How: This reads the backup.
import { sigLinFun   } from '../support/account.ts';         // What: Sign In Link Function. Why: The device signs in the way a person does. How: This signs it in with an emailed link.
import { subHolFun   } from '../support/app.ts';             // What: Submit Holiday Function. Why: A custom holiday is added through the Settings form. How: This names, dates, and adds it.
import { synWaiFun   } from '../support/account.ts';         // What: Sync Wait Function. Why: The first upload has to finish before the change. How: This waits for the status to read Synced.
import { test        } from '@playwright/test';              // What: Test. Why: The flow is its own test. How: This declares it.
import { visSetFun   } from '../support/update.ts';          // What: Visibility Set Function. Why: Hiding the app is what starts both the upload and the quiet reload. How: This sets the faked visibility and fires its event.
import { waiStaFun   } from '../support/storage.ts';         // What: Wait State Function. Why: The change has to be saved before it waits to sync. How: This waits for it in storage.
import { watErrFun   } from '../support/watch.ts';           // What: Watch Errors Function. Why: The flow fails on any page error. How: This collects them.
import { wriStaFun   } from '../support/storage.ts';         // What: Write State Function. Why: The device starts from the backup. How: This writes it.


import type { Page } from '@playwright/test'; // What: Page. Why: The helpers drive the device's page. How: This types their page parameter.

// #endregion Imports



/**
 * update.spec.ts = Account Update Spec
 *
 * @summary
 * Checks that an app update never reloads over a real account sync, and never
 * waits on one with nothing left to upload, against the Firebase Emulator,
 * which npm run test:account starts and stops around this suite. In each
 * test a paid device signs in on a chosen day and uploads, waits for that
 * day's list, makes a change that waits to sync, and receives a new version
 * while visible, so the update note shows. Hiding the app then starts the
 * waiting upload, whose manifest commit a route holds. In the first, the page
 * must not reload while the change waits or the upload runs, and has to
 * reload once the commit lands and the manifest's revision moves. In the
 * second, a further change made during the held upload is uploaded by the
 * sync that reruns after it, and the page has to reload once that rerun
 * lands, rather than waiting out the further change's two minutes.
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

const HOL_NAM_STR = 'Update Holiday'; // What: Holiday Name String. Why: The change that waits to sync must be found in storage. How: This names the holiday it adds.
const HOL_TWO_STR = 'Rerun Holiday';  // What: Holiday Two String. Why: The change made during the held upload must be found in storage. How: This names the second holiday the rerun test adds.

// #endregion Constants



// #region Helpers

// #region devSetFun

/**
 * devSetFun = Device Setup Function
 *
 * @summary
 * Readies a paid device on the backup: creates a paid account with its own
 * address, fakes the clock at noon on day one and a controlled worker, opens
 * the app, signs in through the emailed link, and waits for the first upload
 * and day one's list. It starts watching for page errors first, and hands
 * back that list and the manifest's address in the emulator.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The device's page.
 *
 * @returns A promise that resolves with the error list and the manifest's
 *          REST address.
 *
 * @example
 * ```ts
 * await devSetFun(curPagObj) // => { errMesArr, manUrlStr }
 * ```
 *
*/

async function devSetFun ( curPagObj : Page ) : Promise< { errMesArr : string[], manUrlStr : string } > {


	const emaAdrStr = `update-${ Date.now() }@example.com`;                                                                // What: Email Address String. Why: Each run needs its own account. How: This builds a unique address.
	const errMesArr = watErrFun( curPagObj );                                                                              // What: Error Message Array. Why: The flow fails on any page error. How: This starts watching.
	const uidValStr = await creAccFun( emaAdrStr );                                                                        // What: User Identifier Value String. Why: The manifest is read by the account's id. How: This creates the paid account.
	const manUrlStr = `${ FIR_EMU_STR }/v1/projects/${ EMU_PRO_STR }/databases/(default)/documents/users/${ uidValStr }`; // What: Manifest URL String. Why: The test reads the emulator's copy directly. How: This is the manifest's REST address.


	await insClcFun( curPagObj, DAY_ONE_STR, 12 ); // What: Clock Install Call. Why: The device starts on day one, after the backup's 6 AM run time, so it builds that day's list. How: This fakes its clock before anything loads.

	await fakWorFun( curPagObj, true ); // What: Worker Fake Call. Why: The update flow needs a controlled page. How: This fakes one before anything loads.

	await wriStaFun( curPagObj, reaFixFun() ); // What: Backup Load Call. Why: The device has data to sync. How: This writes the backup.

	await curPagObj.goto( '/' ); // What: App Load. Why: The app boots on the backup. How: This opens it.

	await sigLinFun( curPagObj, emaAdrStr ); // What: Sign-In Call. Why: Only a signed-in paid device syncs. How: This signs in through the emailed link.

	await synWaiFun( curPagObj ); // What: First Upload Wait. Why: The device's copy has to be in the cloud before the change. How: This waits for the first upload to finish.

	await waiStaFun( curPagObj, ( staAppObj ) => !!staAppObj.today.generatedAt && locDayFun( staAppObj.today.generatedAt ) === DAY_ONE_STR, "day one's list built on the device" ); // What: Day List Wait. Why: A list built while the upload is held would start a fresh two-minute wait and hold the reload past the test. How: This waits for day one's list before the change.



	return { errMesArr, manUrlStr }; // What: Setup Return. Why: Each test checks the errors and reads the manifest. How: This hands back both.


}

// #endregion devSetFun



// #region holAddFun

/**
 * holAddFun = Holiday Add Function
 *
 * @summary
 * Adds a custom holiday on the Settings tab the way a person does, naming it,
 * dating it, and pressing Add, then waits for it in storage. The holiday is
 * the change that waits to sync. It expects the Settings tab open.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The device's page.
 * @param holNamStr - Holiday Name String: The holiday's name.
 * @param holDatStr - Holiday Date String: The holiday's ISO date.
 *
 * @returns A promise that settles once the holiday is saved, with no value.
 *
 * @example
 * ```ts
 * await holAddFun(curPagObj, HOL_NAM_STR, '2026-11-03') // => Promise<void>
 * ```
 *
*/

async function holAddFun ( curPagObj : Page, holNamStr : string, holDatStr : string ) : Promise< void > {


	await subHolFun( curPagObj, holNamStr, holDatStr ); // What: Holiday Submit Call. Why: The device makes a change that waits to sync, starting the two-minute wait on click. How: This names, dates, and adds the holiday.

	await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.holidays.custom.some( ( holCusObj ) => holCusObj.name === holNamStr ), 'the holiday saved on the device' ); // What: Holiday Save Wait. Why: The change has to be saved and waiting. How: This waits for the holiday in storage.


}

// #endregion holAddFun



const revReaFun = ( manUrlStr : string ) : Promise< number > => fetch( manUrlStr, { headers : { 'Authorization' : 'Bearer owner' } } ).then( ( resCurObj ) => resCurObj.json() ).then( ( manDocObj ) => Number( manDocObj.fields.rev.integerValue ) ); // What: Revision Read Function. Why: An upload lands when the manifest's revision moves. How: This reads the manifest from the emulator as its owner and returns its revision.

// #endregion Helpers



// #region Module Init

test( 'a hidden app holds a new version back while a change syncs, then reloads once the upload lands', async ( { page : curPagObj } ) => { // What: Sync Update Test. Why: A reload would cut off a change waiting to sync or an upload under way. How: This makes a change, readies an update, hides the app with the upload's commit held, checks no reload comes, then lets the commit through and waits for the reload.


	const { errMesArr, manUrlStr } = await devSetFun( curPagObj ); // What: Error Message Array. Why: The flow fails on any page error. How: This is the list the setup started. // What: Manifest URL String. Why: The test reads the emulator's copy directly. How: This is the manifest's REST address.

	let cmtRelFun = () => {}; // What: Commit Release Function. Why: The held commit goes through only once the test has checked no reload came. How: The promise below replaces this with its resolver.

	const cmtRelPro = new Promise< void >( ( resFunObj ) => { cmtRelFun = () => resFunObj(); } ); // What: Commit Release Promise. Why: The route holds the commit until the test lets it go. How: This settles once cmtRelFun is called.

	const begRevNum = await revReaFun( manUrlStr ); // What: Begin Revision Number. Why: The change's upload must move the revision past this. How: This reads it after the first upload.



	await holAddFun( curPagObj, HOL_NAM_STR, '2026-11-03' ); // What: Holiday Add Call. Why: The device makes a change that waits to sync. How: This adds a holiday and waits for it in storage.

	await conChaFun( curPagObj ); // What: Control Change Call. Why: A new version takes over while the app is visible. How: This fires the event.

	await expect( curPagObj.getByText( NOT_MES_STR ) ).toBeVisible(); // What: Note Shown Assertion. Why: The update is ready and waiting for the app to be hidden. How: This checks the note shows.



	await curPagObj.route( /documents:commit/, async ( rouCurObj ) => { // What: Commit Hold Route. Why: The upload has to stay under way long enough to check no reload cuts it off. How: This holds the manifest's commit until the test releases it.


		await cmtRelPro; // What: Release Wait. Why: The commit waits for the test. How: This waits for the release promise.


		await rouCurObj.continue(); // What: Commit Continue Call. Why: Once released, the upload lands. How: This sends the commit on to the emulator.


	} );



	await curPagObj.evaluate( () => { window.__stiMarBoo = true; } ); // What: Still Mark Call. Why: A reload would clear anything the page set. How: This marks the page.


	const cmtReqPro = curPagObj.waitForRequest( /documents:commit/ ); // What: Commit Request Promise. Why: The upload is under way once its commit is sent. How: This waits for the commit request.


	await visSetFun( curPagObj, 'hidden' ); // What: Hide Call. Why: Hiding the app tries the quiet reload and starts the waiting upload. How: This hides the app.

	await cmtReqPro; // What: Commit Request Wait. Why: The checks below run while the upload is held. How: This waits for the commit to be sent.

	expect( await curPagObj.evaluate( () => !!window.__stiMarBoo ) ).toBe( true ); // What: No Reload Assertion. Why: The waiting change and the running upload must hold the reload back. How: This checks the page's mark is still set.
	expect( await revReaFun( manUrlStr ) ).toBe( begRevNum );                      // What: Held Revision Assertion. Why: The upload hasn't landed while its commit is held. How: This checks the revision hasn't moved.
	expect( errMesArr, errMesArr.join( '\n' ) ).toEqual( [] );                     // What: Error Assertion. Why: A flow that logged an error failed even if it finished. How: This expects no errors up to the reload, since the reload aborts Firestore's long-polling requests, which WebKit reports as page errors (measured 2026-11-19).

	await Promise.all( [ curPagObj.waitForEvent( 'load' ), cmtRelFun() ] ); // What: Upload Reload Wait. Why: Once the upload lands, a hidden app takes the new version. How: This releases the commit and waits for the page to load again.

	expect( await revReaFun( manUrlStr ) ).toBeGreaterThan( begRevNum ); // What: Landed Revision Assertion. Why: The reload must come after the upload landed. How: This checks the revision moved.


} );



test( 'a hidden app reloads once a rerun uploads a change made during a sync, without waiting out its two minutes', async ( { page : curPagObj } ) => { // What: Rerun Update Test. Why: A sync uploads every change made before it starts, so the two-minute wait a change made during the last sync started must not hold the reload once the rerun has uploaded it. How: This hides the app with the first upload's commit held, makes a second change, then lets the commits through and waits for the reload well inside two minutes.


	const { errMesArr, manUrlStr } = await devSetFun( curPagObj ); // What: Error Message Array. Why: The flow fails on any page error. How: This is the list the setup started. // What: Manifest URL String. Why: The test reads the emulator's copy directly. How: This is the manifest's REST address.

	let cmtRelFun = () => {}; // What: Commit Release Function. Why: The held commit goes through only once the second change is made. How: The promise below replaces this with its resolver.

	const cmtRelPro = new Promise< void >( ( resFunObj ) => { cmtRelFun = () => resFunObj(); } ); // What: Commit Release Promise. Why: The route holds the commits until the test lets them go. How: This settles once cmtRelFun is called.

	const begRevNum = await revReaFun( manUrlStr ); // What: Begin Revision Number. Why: Both uploads must move the revision past this. How: This reads it after the first upload.



	await holAddFun( curPagObj, HOL_NAM_STR, '2026-11-03' ); // What: First Holiday Add Call. Why: The device makes a change that waits to sync. How: This adds a holiday and waits for it in storage.

	await conChaFun( curPagObj ); // What: Control Change Call. Why: A new version takes over while the app is visible. How: This fires the event.

	await expect( curPagObj.getByText( NOT_MES_STR ) ).toBeVisible(); // What: Note Shown Assertion. Why: The update is ready and waiting for the app to be hidden. How: This checks the note shows.



	await curPagObj.route( /documents:commit/, async ( rouCurObj ) => { // What: Commit Hold Route. Why: The first upload has to stay under way while the second change is made. How: This holds each commit until the test releases them, after which they pass at once.


		await cmtRelPro; // What: Release Wait. Why: The commit waits for the test. How: This waits for the release promise.


		await rouCurObj.continue(); // What: Commit Continue Call. Why: Once released, the upload lands. How: This sends the commit on to the emulator.


	} );



	await curPagObj.evaluate( () => { window.__stiMarBoo = true; } ); // What: Still Mark Call. Why: A reload would clear anything the page set. How: This marks the page.


	const cmtReqPro = curPagObj.waitForRequest( /documents:commit/ ); // What: Commit Request Promise. Why: The first upload is under way once its commit is sent. How: This waits for the commit request.


	await visSetFun( curPagObj, 'hidden' ); // What: Hide Call. Why: Hiding the app tries the quiet reload and starts the waiting upload. How: This hides the app.

	await cmtReqPro; // What: Commit Request Wait. Why: The second change has to land while the first upload runs. How: This waits for the commit to be sent.

	await holAddFun( curPagObj, HOL_TWO_STR, '2026-11-04' ); // What: Second Holiday Add Call. Why: A change made during a sync starts its own two-minute wait, and the sync reruns to upload it. How: This adds a second holiday while the commit is held.

	expect( await curPagObj.evaluate( () => !!window.__stiMarBoo ) ).toBe( true ); // What: No Reload Assertion. Why: The running upload must hold the reload back. How: This checks the page's mark is still set.
	expect( errMesArr, errMesArr.join( '\n' ) ).toEqual( [] );                     // What: Error Assertion. Why: A flow that logged an error failed even if it finished. How: This expects no errors up to the reload, since the reload aborts Firestore's long-polling requests, which WebKit reports as page errors (measured 2026-11-19).

	await Promise.all( [ curPagObj.waitForEvent( 'load', { timeout : 30000 } ), cmtRelFun() ] ); // What: Rerun Reload Wait. Why: Once the rerun has uploaded the second change, nothing is left to upload, so a hidden app takes the new version well before the second change's two minutes are up. How: This releases the commits and waits up to 30 seconds for the page to load again.

	expect( await revReaFun( manUrlStr ) ).toBeGreaterThanOrEqual( begRevNum + 2 ); // What: Rerun Revision Assertion. Why: The reload must come after both the first upload and the rerun landed. How: This checks the revision moved by at least two commits.


} );

// #endregion Module Init


