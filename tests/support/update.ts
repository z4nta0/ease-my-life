


// #region Imports

import type { Page } from '@playwright/test'; // What: Page. Why: The helpers drive a Playwright page. How: This types their page parameter.

// #endregion Imports



/**
 * update.ts = Update
 *
 * @summary
 * Helpers for the specs that check how the app takes a newly deployed version,
 * with the types and text those specs share, such as the update note's
 * message. The suites block service workers, so an init script fakes the parts
 * the app reads: a worker already controlling the page, a registration whose
 * update call it counts, and the page's visibility, which each spec switches.
 *
 * Sections:
 *  - Types
 *  - Constants
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Types

declare global { // What: Global Declaration. Why: The specs' own window flags have to type check in the page functions. How: This adds them to the browser's Window.


	interface Window { // What: Window Interface. Why: Only an interface merges with the built-in Window. How: This declares the flags the init script and specs set.


		__stiMarBoo? : boolean; // What: Still Mark Boolean. Why: A reload clears it, so its survival proves none came. How: The specs set it before a reload could come.
		__updCheNum? : number;  // What: Update Check Number. Why: Each return to the app should ask for an update. How: The fake registration counts its update calls here.
		__visStaStr? : string;  // What: Visibility State String. Why: The specs decide when the app counts as hidden. How: The faked visibility reads it.


	}


}

// #endregion Types



// #region Constants

const NOT_MES_STR = 'A new version of Ease My Life is ready.'; // What: Note Message String. Why: The update note is found by its message. How: This is the text it shows.

// #endregion Constants



// #region Helpers

// #region conChaFun

/**
 * conChaFun = Controller Change Function
 *
 * @summary
 * Fires controllerchange on the page's service worker container, the signal
 * that a new version has taken control.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page to fire it on.
 *
 * @returns A promise that settles once the event is fired, with no value.
 *
 * @example
 * ```ts
 * await conChaFun(page) // => Promise<void>
 * ```
 *
*/

const conChaFun = ( curPagObj : Page ) : Promise< void > => curPagObj.evaluate( () => { navigator.serviceWorker.dispatchEvent( new Event( 'controllerchange' ) ); } ); // What: Controller Change Function. Why: A new version taking control is what starts the flow. How: This fires the container's controllerchange event.

// #endregion conChaFun



// #region fakWorFun

/**
 * fakWorFun = Fake Worker Function
 *
 * @summary
 * Adds an init script, run before the app's own code on every load, that
 * gives the page a fake controlling worker when asked for one, a fake
 * registration whose update calls it counts in `__updCheNum`, and a
 * visibility state read from `__visStaStr`, defaulting to visible.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page to fake the worker on.
 * @param conHasBoo - Controller Has Boolean: Whether a worker controls the
 *                    page at load, false for a first install.
 *
 * @returns A promise that settles once the script is added, with no value.
 *
 * @example
 * ```ts
 * await fakWorFun(page, true) // => Promise<void>
 * ```
 *
*/

async function fakWorFun ( curPagObj : Page, conHasBoo : boolean ) : Promise< void > {


	await curPagObj.addInitScript( ( iniConBoo ) => { // What: Fake Worker Script. Why: Service workers are blocked in the suites, so the update flow's inputs are faked. How: This replaces the controller, the registration lookup, and the visibility state before the app loads.


		const worConObj = navigator.serviceWorker; // What: Worker Container Object. Why: The app listens for control changes on it. How: This reads the page's container.



		if ( !worConObj ) return; // What: No Container Guard. Why: A page without the container can't run the flow. How: This stops.



		Object.defineProperty( worConObj, 'controller', { configurable : true, get : () => ( iniConBoo ? {} : null ) } );                                                                           // What: Controller Fake. Why: An update is a new worker replacing one that already controlled the page. How: This reports a controller, or none for a first install.
		Object.defineProperty( worConObj, 'getRegistration', { configurable : true, value : async () => ( { update : async () => { window.__updCheNum = ( window.__updCheNum || 0 ) + 1; } } ) } ); // What: Registration Fake. Why: The update check asks the registration to look for a new version. How: This returns one whose update call adds one to __updCheNum.
		Object.defineProperty( document, 'visibilityState', { configurable : true, get : () => window.__visStaStr || 'visible' } );                                                                 // What: Visibility Fake. Why: Each spec decides when the app counts as hidden. How: This reports __visStaStr, defaulting to visible.


	}, conHasBoo ); // What: Script Argument. Why: The page can't read this file's variables. How: This hands in whether a worker controls the page at load.


}

// #endregion fakWorFun



// #region visSetFun

/**
 * visSetFun = Visibility Set Function
 *
 * @summary
 * Sets the faked visibility state and fires the page's visibilitychange
 * event, the way switching away from the app or back to it does.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page to switch.
 * @param visStaStr - Visibility State String: 'hidden' or 'visible'.
 *
 * @returns A promise that settles once the event is fired, with no value.
 *
 * @example
 * ```ts
 * await visSetFun(page, 'hidden') // => Promise<void>
 * ```
 *
*/

async function visSetFun ( curPagObj : Page, visStaStr : string ) : Promise< void > {


	await curPagObj.evaluate( ( newStaStr ) => { // What: Visibility Switch Call. Why: The app reacts to the page being hidden or shown. How: This sets the faked state and fires the event.


		window.__visStaStr = newStaStr; // What: Visibility State Assignment. Why: The faked visibility reads it. How: This stores the new state.


		document.dispatchEvent( new Event( 'visibilitychange' ) ); // What: Visibility Event Dispatch. Why: The app listens for this event. How: This fires it on the document.


	}, visStaStr ); // What: Visibility Argument. Why: The page can't read this file's variables. How: This hands in the new state.


}

// #endregion visSetFun

// #endregion Helpers



// #region Exports

export { conChaFun, fakWorFun, NOT_MES_STR, visSetFun }; // What: Named Exports. Why: A new version and the page's visibility are faked through these, and the note is found by its message. How: This exports them by name.

// #endregion Exports


