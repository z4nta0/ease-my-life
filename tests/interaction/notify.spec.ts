


// #region Imports

import { expect } from '@playwright/test'; // What: Expect. Why: Each check asserts on what the notification call did. How: This compares what each check reads with what it should be.
import { test   } from '@playwright/test'; // What: Test. Why: Each delivery path is its own test. How: This declares them.


import type { Page } from '@playwright/test'; // What: Page. Why: The helper drives a Playwright page. How: This types its page parameter.

// #endregion Imports



/**
 * notify.spec.ts = Notify Spec
 *
 * @summary
 * Checks which path the daily-list notification takes, in whichever engine
 * the project runs. The suites block service workers and never grant
 * notification permission, so each test fakes the parts the notification
 * module reads, such as the worker's ready promise, then calls the module
 * the app already loaded and reads which path showed the notification.
 *
 * Sections:
 *  - Types
 *  - Constants
 *  - Helpers
 *  - Module Init
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Types

type NotRunTyp = { ellMilNum : number; recLisArr : string[]; resValBoo : boolean }; // What: Notification Run Type. Why: A test reads the call's result, the paths it took, and how long it waited. How: This types notRunFun's resolved value.

// #endregion Types



// #region Constants

const NOT_MOD_STR = '/src/platform/notify.ts'; // What: Notification Module String. Why: The tests reach the notification call the way the Today tab does. How: This is the module's address on the dev server, which hands the page the same module the app runs.

// #endregion Constants



// #region Helpers

// #region notRunFun

/**
 * notRunFun = Notification Run Function
 *
 * @summary
 * Fakes what the notification module reads, then calls its genNotFun and
 * reports what happened. Notification permission reads as granted, the page
 * reads as unfocused, the day's claim is cleared, and the service worker's
 * ready promise either resolves with a registration whose showNotification
 * is recorded or never settles, standing in for a page whose worker never
 * becomes active. A page-level notification is recorded the same way, each
 * entry prefixed with the path that showed it.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page whose app shows the
 *                    notification.
 * @param worActBoo - Worker Active Boolean: Whether a worker becomes active,
 *                    false for a ready promise that never settles.
 *
 * @returns A promise that resolves with the call's result, the paths it took,
 *          and the milliseconds it ran.
 *
 * @example
 * ```ts
 * await notRunFun(page, false) // => { ellMilNum : 3001, ... }
 * ```
 *
*/

async function notRunFun ( curPagObj : Page, worActBoo : boolean ) : Promise< NotRunTyp > {


	return curPagObj.evaluate( async ( [ modUrlStr, iniActBoo ] ) => { // What: Notification Run Call. Why: The fakes and the call have to run in the page. How: This fakes the inputs, calls genNotFun, and returns what it did.


		const recLisArr : string[] = []; // What: Record List Array. Why: The test reads which path showed the notification. How: Each fake pushes the path and title here.



		class FakNotCla { // What: Fake Notification Class. Why: The suites never grant permission, and a real notification can't be read back. How: This stands in for the page-level constructor, recording each notification it makes.


			static permission = 'granted'; // What: Permission. Why: genNotFun shows nothing without permission. How: This reports it as granted.


			onclick : ( () => void ) | null = null; // What: On Click. Why: genNotFun assigns a click handler to the page-level notification. How: This gives it a field to land on.


			constructor ( titValStr : string ) { // What: Constructor. Why: Making a page-level notification is what the fallback does. How: This records it.


				recLisArr.push( 'page:' + titValStr ); // What: Page Record Push. Why: The test checks the page-level path ran. How: This records it with its title.


			}


		}



		const regReaPro = iniActBoo ? Promise.resolve( { showNotification : async ( titValStr : string ) => { recLisArr.push( 'worker:' + titValStr ); } } ) : new Promise( () => {} ); // What: Registration Ready Promise. Why: The worker path waits on the container's ready promise. How: This resolves with a registration that records its notifications, or never settles for a page with no active worker.



		Object.defineProperty( window, 'Notification', { configurable : true, value : FakNotCla } );                 // What: Notification Fake. Why: The fallback constructs a page-level notification. How: This swaps in the recording class.
		Object.defineProperty( document, 'hasFocus', { configurable : true, value : () => false } );                 // What: Focus Fake. Why: genNotFun stays quiet while the app is in front. How: This reports the page as unfocused.
		Object.defineProperty( navigator.serviceWorker, 'ready', { configurable : true, get : () => regReaPro } );   // What: Ready Fake. Why: The worker path awaits the container's ready promise. How: This hands it regReaPro.


		localStorage.removeItem( 'easemylife.notifiedday' ); // What: Day Claim Clear. Why: genNotFun notifies once per day, and a load may already have claimed it. How: This removes the claim.



		const notModObj = await import( modUrlStr );               // What: Notification Module Object. Why: The call lives in the app's own module. How: This imports it from the dev server, which returns the instance the app already runs.
		const staTimNum = performance.now();                       // What: Start Time Number. Why: The test checks how long the fallback waits. How: This reads the clock before the call.
		const resValBoo = await notModObj.NOT_NAM_OBJ.genNotFun(); // What: Result Value Boolean. Why: genNotFun reports whether a notification was shown. How: This awaits its result.


		return { ellMilNum : performance.now() - staTimNum, recLisArr, resValBoo }; // What: Run Return. Why: The test checks what the call did. How: This returns the time it ran, the records, and its result.


	}, [ NOT_MOD_STR, worActBoo ] as const ); // What: Run Arguments. Why: The page can't read this file's variables. How: This hands in the module's address and whether a worker becomes active. // What: Type Assertion Note. Why: The page function destructures a pair of a string and a boolean. How: The as const keeps each element's own type.


}

// #endregion notRunFun

// #endregion Helpers



// #region Module Init

test.beforeEach( async ( { page : curPagObj } ) => { // What: Setup Hook. Why: Each test needs the app's modules loaded. How: This opens the app.


	await curPagObj.goto( '/' ); // What: App Open Call. Why: The notification module is reached through the running app. How: This loads it.


} );



test( 'a page whose service worker never becomes active falls back to a page-level notification', async ( { page : curPagObj } ) => { // What: No Worker Fallback Test. Why: A ready promise that never settles must not hold back the notification. How: This runs the call with no active worker and checks the page-level path showed it after the wait.


	const notRunObj = await notRunFun( curPagObj, false ); // What: Notification Run Object. Why: The checks read what the call did. How: This runs it with no active worker.


	expect( notRunObj.resValBoo ).toBe( true );                                          // What: Shown Assertion. Why: The fallback still shows the notification. How: This checks genNotFun reported success.
	expect( notRunObj.recLisArr ).toEqual( [ 'page:Your life is ready to be eased!' ] ); // What: Page Path Assertion. Why: Only the page-level path could show it. How: This checks the one record came from the constructor.
	expect( notRunObj.ellMilNum ).toBeGreaterThanOrEqual( 2900 );                        // What: Wait Assertion. Why: The worker gets its time to become active first. How: This checks the call waited out the timeout.


} );



test( 'a page with an active service worker shows the notification through the worker', async ( { page : curPagObj } ) => { // What: Worker Path Test. Why: The worker's own path is preferred, since some browsers refuse the page-level constructor. How: This runs the call with an active worker and checks only the worker path showed it.


	const notRunObj = await notRunFun( curPagObj, true ); // What: Notification Run Object. Why: The checks read what the call did. How: This runs it with an active worker.


	expect( notRunObj.resValBoo ).toBe( true );                                            // What: Shown Assertion. Why: The worker shows the notification. How: This checks genNotFun reported success.
	expect( notRunObj.recLisArr ).toEqual( [ 'worker:Your life is ready to be eased!' ] ); // What: Worker Path Assertion. Why: An active worker takes the notification. How: This checks the one record came from the registration.


} );

// #endregion Module Init


