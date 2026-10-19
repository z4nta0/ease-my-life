


// #region Imports

import { expect    } from '@playwright/test';      // What: Expect. Why: Every flow asserts what survived. How: This makes the assertions.
import { opeFixFun } from '../support/app.ts';     // What: Open Fixture Function. Why: Each flow starts from real data. How: This opens the backup on a fixed day.
import { reaStaFun } from '../support/storage.ts'; // What: Read State Function. Why: Flows check what IndexedDB holds. How: This reads it.
import { selTabFun } from '../support/app.ts';     // What: Select Tab Function. Why: Holidays are added on the Settings tab. How: This switches to it.
import { test      } from '@playwright/test';      // What: Test. Why: Each flow is its own test. How: This declares them.
import { waiStaFun } from '../support/storage.ts'; // What: Wait State Function. Why: The recovered state lands in IndexedDB a moment after boot. How: This waits for it.
import { watErrFun } from '../support/watch.ts';   // What: Watch Errors Function. Why: A flow fails on any page error. How: This collects them.


import type { Page } from '@playwright/test'; // What: Page. Why: The helpers drive one page. How: This types their page parameter.

// #endregion Imports



/**
 * storage.spec.ts = Storage Spec
 *
 * @summary
 * Checks that nothing saved during a launch where IndexedDB was slow or hung
 * is lost on the next normal launch. When IndexedDB misses the boot
 * deadline, a whole session runs on the localStorage mirror; custom holidays
 * added in such a session used to vanish once IndexedDB answered again,
 * since its older copy always won. Each flow opens the real backup, adds a
 * custom holiday in a launch whose IndexedDB hangs or answers late, then
 * relaunches normally twice and checks that the holiday is still listed,
 * that IndexedDB holds it, and that IndexedDB kept every Stats history row.
 * An init script slows or hangs IndexedDB while the emlTesIdbMod key is set,
 * a name the app's own key sweep never matches.
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

const IDB_MOD_STR = 'emlTesIdbMod';  // What: IndexedDB Mode String. Why: The init script reads which IndexedDB fault to fake on the next load. How: This is the localStorage key holding 'hang' or 'slow'.
const MIR_KEY_STR = 'easemylife.v2'; // What: Mirror Key String. Why: A fallback session saves only to the localStorage mirror. How: This is the key the app writes it under.

// #endregion Constants



// #region Helpers

// #region addHolFun

/**
 * addHolFun = Add Holiday Function
 *
 * @summary
 * Adds a custom holiday on the Settings tab and waits until the app has
 * saved it to the localStorage mirror, which every engine writes to: on
 * every save in a fallback session, and when the tab hides otherwise.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page running the app.
 * @param holNamStr - Holiday Name String: The custom holiday's name.
 *
 * @returns A promise that settles once the mirror holds the holiday, with
 * no value.
 *
 * @example
 * ```ts
 * await addHolFun(curPagObj, 'Fallback Holiday') // => Promise<void>
 * ```
 *
*/

const addHolFun = async ( curPagObj : Page, holNamStr : string ) : Promise< void > => { // What: Add Holiday Function. Why: Both flows add a holiday during a faulty launch. How: This fills the add form, clicks Add, and waits for the mirror.


	await selTabFun( curPagObj, 'settings' ); // What: Tab Switch Call. Why: The holiday form is on the Settings tab. How: This switches to it.



	await curPagObj.locator( '[aria-label="Name of the day off to add"]' ).fill( holNamStr );                    // What: Name Fill Call. Why: A custom holiday needs a name. How: This types holNamStr.
	await curPagObj.locator( '[data-element-name-hook~="holAddDiv"] [aria-label="Date"]' ).fill( '2026-11-03' ); // What: Date Fill Call. Why: A custom holiday needs a date. How: This sets one.



	await curPagObj.locator( '[data-element-name-hook~="holAddDiv"]' ).getByRole( 'button', { exact : true, name : 'Add' } ).click(); // What: Add Click Call. Why: The holiday is added on click. How: This clicks Add.



	await curPagObj.waitForFunction( ( [ mirKeyStr, wanNamStr ] ) => ( localStorage.getItem( mirKeyStr ) || '' ).includes( wanNamStr ), [ MIR_KEY_STR, holNamStr ] ); // What: Mirror Save Wait. Why: The relaunch must come after the holiday was saved. How: This waits until the mirror's text holds the name.


};

// #endregion addHolFun



// #region relAppFun

/**
 * relAppFun = Relaunch App Function
 *
 * @summary
 * Relaunches the app with the given IndexedDB fault, or none, and waits for
 * the Today tab to mount. The fault is set on a plain same-origin page
 * first, so the app's own pagehide flush always runs without it.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page running the app.
 * @param faiModStr - Fault Mode String: 'hang', 'slow', or null for a
 *                    healthy IndexedDB.
 *
 * @returns A promise that settles once Today has mounted, with no value.
 *
 * @example
 * ```ts
 * await relAppFun(curPagObj, 'hang') // => Promise<void>
 * ```
 *
*/

const relAppFun = async ( curPagObj : Page, faiModStr : string | null ) : Promise< void > => { // What: Relaunch App Function. Why: Each flow relaunches with and without a fault. How: This sets or clears the fault, reloads the app, and waits for Today.


	await curPagObj.goto( '/robots.txt' ); // What: Plain Page Navigation. Why: Leaving the app fires its pagehide flush, and the fault must be set while no app code runs. How: This opens a same-origin file that runs no app code.



	await curPagObj.evaluate( ( { modKeyStr, modValStr } ) => { if ( modValStr ) localStorage.setItem( modKeyStr, modValStr ); else localStorage.removeItem( modKeyStr ); }, { modKeyStr : IDB_MOD_STR, modValStr : faiModStr } ); // What: Fault Set Call. Why: The init script reads the fault on the next load. How: This writes faiModStr under IDB_MOD_STR, or removes the key for none, passing both in one object since the script can't see this file's variables.



	await curPagObj.goto( '/' ); // What: App Load Call. Why: The app boots its storage on load. How: This opens the app's root.

	await curPagObj.locator( '[data-element-name-hook~="todTabDiv"]' ).waitFor(); // What: Today Mount Wait. Why: The app has booted once Today mounts. How: This waits for the Today tab's root.


};

// #endregion relAppFun



// #region cheSurFun

/**
 * cheSurFun = Check Survival Function
 *
 * @summary
 * Relaunches the app normally twice and checks after each launch that the
 * custom holiday is still listed on the Settings tab and saved in IndexedDB,
 * and that IndexedDB still holds at least the pick log rows the backup
 * started with. Two launches, since the old bug also rewrote the mirror with
 * IndexedDB's older copy, so a holiday lost once stayed lost.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page running the app.
 * @param holNamStr - Holiday Name String: The holiday that must survive.
 * @param logCouNum - Log Count Number: The pick log rows the backup started
 *                    with.
 *
 * @returns A promise that settles once both launches pass, with no value.
 *
 * @example
 * ```ts
 * await cheSurFun(curPagObj, 'Fallback Holiday', 1200) // => Promise<void>
 * ```
 *
*/

const cheSurFun = async ( curPagObj : Page, holNamStr : string, logCouNum : number ) : Promise< void > => { // What: Check Survival Function. Why: Both flows check the same outcome. How: This relaunches twice, checking the holiday and the pick log each time.


	for ( const lauIndNum of [ 1, 2 ] ) { // What: Launch Loop. Why: The holiday must survive the first normal launch and every one after it. How: This runs the checks after two launches.


		await relAppFun( curPagObj, null ); // What: Healthy Relaunch Call. Why: The lost data used to vanish on a normal launch. How: This relaunches without a fault.



		const savStaObj = await waiStaFun( curPagObj, ( staAppObj ) => staAppObj.holidays.custom.some( ( cusHolObj ) => cusHolObj.name === holNamStr ), `holiday kept in IndexedDB, launch ${ lauIndNum }` ); // What: Saved State Object. Why: IndexedDB must hold the holiday. How: This waits until its custom list includes holNamStr.


		expect( savStaObj.pickLog.length, `pick log kept, launch ${ lauIndNum }` ).toBeGreaterThanOrEqual( logCouNum ); // What: Pick Log Assertion. Why: Recovering the holiday must not cost any Stats history. How: This expects at least the backup's rows.



		await selTabFun( curPagObj, 'settings' ); // What: Tab Switch Call. Why: The holiday is listed on the Settings tab. How: This switches to it.

		await expect( curPagObj.getByRole( 'button', { exact : true, name : `Remove ${ holNamStr }` } ) ).toBeVisible(); // What: Listed Holiday Assertion. Why: The holiday must show, not just be stored. How: This expects its Remove button.


	}


};

// #endregion cheSurFun

// #endregion Helpers



// #region Module Init

let errMesArr : string[] = []; // What: Error Message Array. Why: Each test's page errors are checked when it ends. How: This holds the current test's list.



test.beforeEach( async ( { page : curPagObj } ) => { // What: Setup Hook. Why: Every flow can fake an IndexedDB fault and starts on real data. How: This installs the fault script, starts the watcher, and opens the backup.


	await curPagObj.addInitScript( () => { // What: Fault Script. Why: A slow or hung IndexedDB can't be produced on demand otherwise. How: This wraps indexedDB.open, and IDBObjectStore.prototype.get for a slow launch, while emlTesIdbMod is set.


		const modValStr = localStorage.getItem( 'emlTesIdbMod' ); // What: Mode Value String. Why: Only a launch with a fault set is changed. How: This reads 'hang', 'slow', or null.



		if ( !modValStr ) return; // What: Healthy Launch Guard. Why: A launch without a fault runs IndexedDB as is. How: This returns early.



		const sucSetFun = Object.getOwnPropertyDescriptor( IDBRequest.prototype, 'onsuccess' )!.set!; // What: Success Setter Function. Why: A delayed request still has to deliver its success to the real handler. How: This is the native onsuccess setter. // What: Non-Null Note. Why: Every engine defines onsuccess as an accessor on IDBRequest.prototype. How: The two ! tell TypeScript the descriptor and its setter exist.
		const oriOpeFun = indexedDB.open.bind( indexedDB );                                            // What: Original Open Function. Why: The wrapper still opens the real database. How: This is the native open, bound to indexedDB.
		const oriGetFun = IDBObjectStore.prototype.get;                                                // What: Original Get Function. Why: The slow wrapper still reads the real store. How: This is the native get.



		const delSucFun = ( idbReqObj : IDBRequest, delMilNum : number ) => Object.defineProperty( idbReqObj, 'onsuccess', { configurable : true, set ( hanFunObj ) { sucSetFun.call( idbReqObj, ( sucEveObj : Event ) => setTimeout( () => hanFunObj.call( idbReqObj, sucEveObj ), delMilNum ) ); } } ); // What: Delay Success Function. Why: A slow IndexedDB answers, just late. How: This makes the request's onsuccess handler run delMilNum milliseconds after the real success.



		let opeCouNum = 0; // What: Open Count Number. Why: Only the app's own boot open is faulty, so the test can still read IndexedDB later. How: This counts opens on this page.



		indexedDB.open = ( datNamStr : string, datVerNum? : number ) => { // What: Open Wrapper. Why: The app's first open is the one that hangs or answers late. How: This opens the real database, then hides or delays the first open's success.


			const opeReqObj = oriOpeFun( datNamStr, datVerNum ); // What: Open Request Object. Why: The real database still opens underneath. How: This calls the native open.



			opeCouNum += 1; // What: Open Count Increment. Why: Only the first open is faulty. How: This counts this open.



			if ( opeCouNum > 1 ) return opeReqObj; // What: Later Open Guard. Why: The test's own reads must work. How: This returns later opens untouched.



			if ( modValStr === 'hang' ) Object.defineProperty( opeReqObj, 'onsuccess', { configurable : true, set () {} } ); // What: Hang Check. Why: A hung open never reports success. How: This discards the handler the app sets.

			else delSucFun( opeReqObj, 2900 ); // What: Slow Open Branch. Why: A slow open succeeds just inside the app's own 3-second open timeout. How: This delays its success by 2,900ms.



			return opeReqObj;


		};



		if ( modValStr === 'slow' ) IDBObjectStore.prototype.get = function ( this : IDBObjectStore, ...getArgArr : Parameters< IDBObjectStore[ 'get' ] > ) { const getReqObj = oriGetFun.apply( this, getArgArr ); delSucFun( getReqObj, 400 ); return getReqObj; }; // What: Slow Read Check. Why: A slow open plus slow reads runs the whole boot past its 3.5-second deadline. How: This delays each store read's success by 400ms.


	} );



	errMesArr = watErrFun( curPagObj ); // What: Error Watch Call. Why: Errors are collected from the start. How: This attaches the watcher.



	await opeFixFun( curPagObj ); // What: App Open Call. Why: Flows start on the fixed day. How: This opens the backup.


} );



test.afterEach( () => { expect( errMesArr, errMesArr.join( '\n' ) ).toEqual( [] ); } ); // What: Error Check Hook. Why: A flow that logged an error failed even if it finished. How: This expects no errors.



test( 'a holiday added while IndexedDB hangs survives the next launches', async ( { page : curPagObj } ) => { // What: Hung Boot Test. Why: A session that ran on localStorage must not lose its changes. How: This adds a holiday in a hung launch and relaunches normally.


	const logCouNum = ( await reaStaFun( curPagObj ) )!.pickLog.length; // What: Log Count Number. Why: The recovery must keep every Stats row. How: This counts the backup's pick log rows. // What: Non-Null Note. Why: The day's list was already saved. How: The ! tells TypeScript a state exists.



	await relAppFun( curPagObj, 'hang' ); // What: Hung Relaunch Call. Why: IndexedDB's open never answers, so the session runs on localStorage. How: This relaunches with the hang fault.

	await addHolFun( curPagObj, 'Hung Boot Holiday' ); // What: Holiday Add Call. Why: This is the change that used to be lost. How: This adds the holiday and waits for the mirror.



	await cheSurFun( curPagObj, 'Hung Boot Holiday', logCouNum ); // What: Survival Check Call. Why: The holiday and the history must both survive. How: This relaunches normally twice and checks both.


} );



test( 'a holiday added while IndexedDB is slow survives the next launches', async ( { page : curPagObj } ) => { // What: Slow Boot Test. Why: A boot that runs past the deadline must not mount on the mirror and then save as IndexedDB. How: This adds a holiday in a slow launch and relaunches normally.


	const logCouNum = ( await reaStaFun( curPagObj ) )!.pickLog.length; // What: Log Count Number. Why: The slow launch must not save an empty pick log over the history. How: This counts the backup's pick log rows. // What: Non-Null Note. Why: The day's list was already saved. How: The ! tells TypeScript a state exists.



	await relAppFun( curPagObj, 'slow' ); // What: Slow Relaunch Call. Why: IndexedDB answers after the boot deadline. How: This relaunches with the slow fault.

	await addHolFun( curPagObj, 'Slow Boot Holiday' ); // What: Holiday Add Call. Why: This is the change that used to be lost. How: This adds the holiday and waits for the mirror.



	expect( ( await reaStaFun( curPagObj ) )!.pickLog.length, 'pick log kept during the slow launch' ).toBeGreaterThanOrEqual( logCouNum ); // What: Mid-Session Log Assertion. Why: The late IndexedDB boot used to save the mirror's empty pick log over the history. How: This expects IndexedDB to still hold the backup's rows. // What: Non-Null Note. Why: IndexedDB already holds the backup. How: The ! tells TypeScript a state exists.



	await cheSurFun( curPagObj, 'Slow Boot Holiday', logCouNum ); // What: Survival Check Call. Why: The holiday and the history must both survive. How: This relaunches normally twice and checks both.


} );

// #endregion Module Init


