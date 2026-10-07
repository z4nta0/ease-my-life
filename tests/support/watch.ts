


// #region Imports

import type { Page } from '@playwright/test'; // What: Page. Why: Every watcher attaches to a page. How: This types the page parameters.

// #endregion Imports



/**
 * watch.ts = Watch
 *
 * @summary
 * Watches a page for the things a click can't report on its own. watErrFun
 * collects every uncaught page error and console error, React's warnings
 * included, so a suite can fail on any of them. recAniFun starts recording
 * every class and attribute the page adds, and seeAniFun asks whether one
 * matching a name appeared since, which is how a test confirms an
 * animation played: most animations switch on a class or a data attribute
 * for a moment and then remove it, too quickly to catch by looking. Module
 * class names are hashed but keep their local name, so a class is matched
 * by the name inside it (proRinDiv--pulsing matches _proRinDiv--pulsing_x1).
 *
 * Sections:
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Helpers

// #region watErrFun

/**
 * watErrFun = Watch Errors Function
 *
 * @summary
 * Starts collecting a page's uncaught errors and console errors into an
 * array the caller keeps, so the test can assert it stayed empty. The
 * service worker block's own warning is a console warning, not an error,
 * so it never lands here.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page to watch.
 *
 * @returns The array the errors collect into.
 * @see {@link errMesArr}
 *
 * @example
 * ```ts
 * const errMesArr = watErrFun(curPagObj) // => [] until something goes wrong
 * ```
 *
*/

const watErrFun = ( curPagObj : Page ) : string[] => { // What: Watch Errors Function. Why: A page error during a flow is a failure even when the flow finishes. How: This collects page and console errors.


	const errMesArr : string[] = []; // What: Error Message Array. Why: The caller asserts it stays empty. How: This collects the errors.



	curPagObj.on( 'pageerror', ( errPagObj ) => errMesArr.push( `page error: ${ errPagObj.message }` ) ); // What: Page Error Listener. Why: An uncaught exception breaks the app. How: This records its message.



	curPagObj.on( 'console', ( conMesObj ) => { if ( conMesObj.type() === 'error' ) errMesArr.push( `console error: ${ conMesObj.text().slice( 0, 300 ) }` ); } ); // What: Console Error Listener. Why: React reports problems like duplicate keys as console errors. How: This records every console error.



	return errMesArr; // What: Errors Return. Why: The caller asserts on it later. How: This returns the live array.


};

// #endregion watErrFun



// #region recAniFun

/**
 * recAniFun = Record Animations Function
 *
 * @summary
 * Starts recording, in the page, every class token added to any element and
 * every attribute set, from now on, into window.__aniRecArr. A later
 * seeAniFun call reads it. Calling it again clears the record.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page to record.
 *
 * @returns A promise that settles once recording has started.
 *
 * @example
 * ```ts
 * await recAniFun(curPagObj) // => void
 * ```
 *
*/

const recAniFun = async ( curPagObj : Page ) : Promise< void > => curPagObj.evaluate( () => { // What: Record Animations Function. Why: Animations switch classes on and off too fast to catch by looking. How: This records every added class and attribute.


	const winAnyObj = window as unknown as { __aniObsObj? : MutationObserver, __aniRecArr : string[] }; // What: Window Any Object. Why: The record lives on the page's window. How: This reads the window with the recorder's fields. // What: Type Assertion Note. Why: These test-only fields aren't on the app's Window type. How: The window is read as holding them, since this script sets them.



	if ( winAnyObj.__aniObsObj ) winAnyObj.__aniObsObj.disconnect(); // What: Old Observer Disconnect. Why: Recording again starts fresh. How: This stops any earlier recorder.



	winAnyObj.__aniRecArr = []; // What: Record Reset. Why: Only additions from now on count. How: This empties the record.



	winAnyObj.__aniObsObj = new MutationObserver( ( mutRecArr ) => { // What: Mutation Observer. Why: Every class and attribute change passes through it. How: This records added classes and set attributes.


		for ( const mutRecObj of mutRecArr ) { // What: Mutation Loop. Why: Each change is recorded. How: This walks the batch.


			if ( mutRecObj.type !== 'attributes' || !( mutRecObj.target instanceof Element ) ) continue; // What: Attribute Guard. Why: Only attribute changes on elements matter. How: This skips the rest.



			if ( mutRecObj.attributeName === 'class' ) winAnyObj.__aniRecArr.push( ...Array.from( mutRecObj.target.classList ).filter( ( claNamStr ) => !( mutRecObj.oldValue || '' ).split( ' ' ).includes( claNamStr ) ) ); // What: Added Class Record. Why: An animation class appears once added. How: This records classes not present before.

			else if ( mutRecObj.target.hasAttribute( mutRecObj.attributeName || '' ) ) winAnyObj.__aniRecArr.push( `[${ mutRecObj.attributeName }]` ); // What: Set Attribute Record. Why: Some animations switch on a data attribute. How: This records the attribute's name in brackets.


		}


	} );



	winAnyObj.__aniObsObj.observe( document.documentElement, { attributeOldValue : true, attributes : true, subtree : true } ); // What: Observe Call. Why: Every element's changes must be seen. How: This observes the whole document's attributes.


} );

// #endregion recAniFun



// #region seeAniFun

/**
 * seeAniFun = Seen Animation Function
 *
 * @summary
 * Waits up to five seconds for a recorded class or attribute containing a
 * name, and returns whether one appeared. Attributes are recorded in
 * brackets, so asking for [data-pick-sent-active] matches the attribute.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page recording.
 * @param aniNamStr - Animation Name String: The class or bracketed attribute
 *                    name to look for.
 *
 * @returns Whether it appeared.
 *
 * @example
 * ```ts
 * await seeAniFun(curPagObj, 'proRinDiv--pulsing') // => true
 * ```
 *
*/

const seeAniFun = async ( curPagObj : Page, aniNamStr : string ) : Promise< boolean > => curPagObj.waitForFunction( ( wanNamStr ) => ( ( window as unknown as { __aniRecArr? : string[] } ).__aniRecArr || [] ).some( ( recNamStr ) => recNamStr.includes( wanNamStr ) ), aniNamStr, { timeout : 5000 } ).then( () => true, () => false ); // What: Seen Animation Function. Why: A test confirms an animation played. How: This waits for a matching recorded name and returns whether it came. // What: Type Assertion Note. Why: The record is a test-only window field. How: The window is read as holding it, since recAniFun sets it.

// #endregion seeAniFun

// #endregion Helpers



// #region Exports

export { recAniFun, seeAniFun, watErrFun }; // What: Named Exports. Why: The suites watch for errors and animations through these. How: This exports them by name.

// #endregion Exports


