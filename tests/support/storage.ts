


// #region Imports

import type { Page      } from '@playwright/test';             // What: Page. Why: Every helper reads or writes through a Playwright page. How: This types each helper's page parameter.
import type { StaAppTyp } from '../../src/core/data-model.ts'; // What: State App Type. Why: The tests check the same saved state the app writes. How: This types what reaStaFun returns.

// #endregion Imports



/**
 * storage.ts = Storage
 *
 * @summary
 * Reads and writes the app's saved state the way src/state/storage.ts lays
 * it out, so a test can check what actually landed on disk rather than what
 * the screen shows. The app keeps everything in the IndexedDB database
 * easemylife: the state, minus its pick log, under the key main in the
 * state store, and the pick log under main in the picklog store. Saves are
 * debounced to an idle moment, so a read straight after an action can see
 * the state before it; waiStaFun polls until a condition holds instead.
 * wriStaFun writes a whole state before the app loads, so a test can start
 * from exactly the data it names.
 *
 * Sections:
 *  - Constants
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const POL_GAP_NUM = 100;   // What: Poll Gap Number. Why: A debounced save usually lands within a few hundred milliseconds. How: This is the wait between reads, in milliseconds.
const POL_MAX_NUM = 10000; // What: Poll Maximum Number. Why: A save that never lands is a failure, not something to wait on forever. How: This is the longest waiStaFun keeps polling, in milliseconds.

// #endregion Constants



// #region Helpers

// #region reaStaFun

/**
 * reaStaFun = Read State Function
 *
 * @summary
 * Reads the saved state out of IndexedDB inside the page, joining the pick
 * log back onto it the same way the app's own reaDatFun does, so the result
 * has the full StaAppTyp shape. Returns null when nothing has been saved
 * yet, as on a fresh install before the first save.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page whose saved state to read.
 *
 * @returns The saved state with its pick log, or null when none exists.
 *
 * @example
 * ```ts
 * await reaStaFun(curPagObj) // => saved state or null
 * ```
 *
*/

const reaStaFun = async ( curPagObj : Page ) : Promise< StaAppTyp | null > => curPagObj.evaluate( () => new Promise< StaAppTyp | null >( ( resFunObj, rejFunObj ) => { // What: Read State Function. Why: Tests check what landed on disk. How: This opens the app's database in the page and resolves with the state and its pick log joined.


	const opeReqObj = indexedDB.open( 'easemylife' ); // What: Open Request Object. Why: The state lives in the app's own database. How: This opens it at whatever version it has.



	opeReqObj.onerror = () => rejFunObj( opeReqObj.error ); // What: Open Error Handler. Why: A database that won't open fails the read loudly. How: This rejects with the open error.



	opeReqObj.onsuccess = () => { // What: Open Success Handler. Why: Both stores are read in one transaction once the database is open. How: This reads main from state and picklog, then resolves.


		const datConObj = opeReqObj.result;                                            // What: Database Connection Object. Why: Both reads go through the open database. How: This is the open connection.
		const reaTraObj = datConObj.transaction( [ 'state', 'picklog' ], 'readonly' ); // What: Read Transaction Object. Why: The state and its log should come from the same moment. How: This opens one read transaction over both stores.
		const staReqObj = reaTraObj.objectStore( 'state' ).get( 'main' );              // What: State Request Object. Why: The state minus its log is saved under main. How: This reads it.
		const logReqObj = reaTraObj.objectStore( 'picklog' ).get( 'main' );            // What: Log Request Object. Why: The pick log is saved separately under main. How: This reads it.



		reaTraObj.oncomplete = () => { // What: Read Complete Handler. Why: Both values are ready once the transaction finishes. How: This closes the connection and resolves with the joined state.


			datConObj.close(); // What: Connection Close Call. Why: An open connection would block the app's own upgrades. How: This closes it.



			resFunObj( staReqObj.result ? { ...staReqObj.result, pickLog : logReqObj.result || [] } : null ); // What: Joined State Resolve. Why: Callers want the same shape the app works with. How: This adds the log back onto the state, or resolves null when nothing was saved.


		};


	};


} ) );

// #endregion reaStaFun



// #region waiStaFun

/**
 * waiStaFun = Wait State Function
 *
 * @summary
 * Polls the saved state until a condition on it holds, then returns that
 * state. The app saves on an idle callback after each change, so a check
 * made straight after a click can see the old state; waiting on the
 * condition the click should cause avoids racing the save. Throws with the
 * label when the condition still fails after ten seconds.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page whose saved state to poll.
 * @param conTesFun - Condition Test Function: Returns true once the state
 *                    reflects the expected change.
 * @param conLabStr - Condition Label String: Names the condition in the error
 *                    when it never holds.
 *
 * @returns The first saved state that met the condition.
 * @see {@link curStaObj}
 *
 * @example
 * ```ts
 * await waiStaFun(curPagObj, (staAppObj) => !!staAppObj.today, 'today')
 * // => the saved state
 * ```
 *
*/

const waiStaFun = async ( curPagObj : Page, conTesFun : ( staAppObj : StaAppTyp ) => boolean, conLabStr : string ) : Promise< StaAppTyp > => { // What: Wait State Function. Why: Debounced saves land a moment after the action. How: This polls reaStaFun until conTesFun passes or the time runs out.


	const endTimNum = Date.now() + POL_MAX_NUM; // What: End Time Number. Why: Polling must stop eventually. How: This is the deadline in milliseconds.



	while ( Date.now() < endTimNum ) { // What: Poll Loop. Why: The save may take several idle moments to land. How: This reads and tests the state until the deadline.


		const curStaObj = await reaStaFun( curPagObj ); // What: Current State Object. Why: Each poll checks the latest save. How: This reads the saved state.



		if ( curStaObj && conTesFun( curStaObj ) ) return curStaObj; // What: Condition Met Return. Why: The caller needs the state that satisfied the condition. How: This returns it as soon as the test passes.



		await curPagObj.waitForTimeout( POL_GAP_NUM ); // What: Poll Gap Wait. Why: Reading again immediately would only repeat the same result. How: This waits POL_GAP_NUM milliseconds.


	}



	throw new Error( `Saved state never met: ${ conLabStr }` ); // What: Timeout Error. Why: A save that never lands is a real failure. How: This throws with the condition's label.


};

// #endregion waiStaFun



// #region wriStaFun

/**
 * wriStaFun = Write State Function
 *
 * @summary
 * Replaces a page's saved state before the app loads, so a test starts from
 * exactly the data it names. It writes from /robots.txt, a plain file served
 * from the same origin that runs none of the app's code; writing from a page
 * running the app would race the app's own saves, which flush on the way
 * out. The state goes into the state and picklog stores the way the app
 * lays them out, creating them on a fresh database, and the localStorage
 * mirror is cleared so it can't be preferred over what was written. The app
 * migrates the state on its next load, the same as any saved state.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page whose origin to write to.
 * @param staAppObj - State App Object: The full state, pick log included.
 *
 * @returns A promise that settles once the state is written.
 *
 * @example
 * ```ts
 * await wriStaFun(curPagObj, reaFixFun()) // => void
 * ```
 *
*/

const wriStaFun = async ( curPagObj : Page, staAppObj : StaAppTyp ) : Promise< void > => { // What: Write State Function. Why: Tests start from a known saved state. How: This writes it into IndexedDB from a page that doesn't run the app.


	await curPagObj.goto( '/robots.txt' ); // What: Plain Page Navigation. Why: Writing while the app runs would race its own saves. How: This opens a same-origin file that runs no app code.



	await curPagObj.evaluate( ( wriStaObj ) => new Promise< void >( ( resFunObj, rejFunObj ) => { // What: State Write Script. Why: IndexedDB can only be written from inside the page. How: This opens the database, writes both stores, and clears the mirror.


		const { pickLog : picLogArr, ...resStaObj } = wriStaObj; // What: Log And Rest Split. Why: The app keeps the pick log in its own store. How: This separates the log from the rest of the state.
		const opeReqObj = indexedDB.open( 'easemylife', 1 );     // What: Open Request Object. Why: The state lives in the app's own database. How: This opens it at the app's version 1.



		opeReqObj.onupgradeneeded = () => { // What: Upgrade Handler. Why: A fresh profile has no database yet. How: This creates the two stores the app expects.


			opeReqObj.result.createObjectStore( 'state' );   // What: State Store Create. Why: The state minus its log lives here. How: This creates the store with out-of-line keys.
			opeReqObj.result.createObjectStore( 'picklog' ); // What: Pick Log Store Create. Why: The pick log lives in its own store. How: This creates the store with out-of-line keys.


		};



		opeReqObj.onerror = () => rejFunObj( opeReqObj.error ); // What: Open Error Handler. Why: A database that won't open fails the setup loudly. How: This rejects with the open error.



		opeReqObj.onsuccess = () => { // What: Open Success Handler. Why: Both stores are written in one transaction once the database is open. How: This puts both values under main.


			const datConObj = opeReqObj.result;                                             // What: Database Connection Object. Why: Both writes go through the open database. How: This is the open connection.
			const wriTraObj = datConObj.transaction( [ 'state', 'picklog' ], 'readwrite' ); // What: Write Transaction Object. Why: The state and its log should land together. How: This opens one write transaction over both stores.

			wriTraObj.objectStore( 'state' ).put( resStaObj, 'main' );         // What: State Put Call. Why: The app reads its state from main. How: This writes the state minus its log.
			wriTraObj.objectStore( 'picklog' ).put( picLogArr || [], 'main' ); // What: Pick Log Put Call. Why: The app reads its log from main. How: This writes the log, or an empty one.



			wriTraObj.oncomplete = () => { // What: Write Complete Handler. Why: The setup is done once both writes commit. How: This clears the mirror, closes the connection, and resolves.


				for ( const keyNamStr of Object.keys( localStorage ) ) if ( /^easemylife/.test( keyNamStr ) ) localStorage.removeItem( keyNamStr ); // What: Mirror Clear Loop. Why: A leftover mirror could be preferred over the written state. How: This removes every easemylife key from localStorage.



				datConObj.close(); // What: Connection Close Call. Why: An open connection would block the app's own open. How: This closes it.



				resFunObj(); // What: Write Resolve Call. Why: The caller loads the app only after the write. How: This resolves the promise.


			};


		};


	} ), staAppObj ); // What: State Argument. Why: The script runs in the page and can't see this file's variables. How: This passes the state in as the script's argument.


};

// #endregion wriStaFun

// #endregion Helpers



// #region Exports

export { reaStaFun, waiStaFun, wriStaFun }; // What: Named Exports. Why: Every suite sets up and checks saved state through these. How: This exports reaStaFun, waiStaFun, and wriStaFun by name.

// #endregion Exports


