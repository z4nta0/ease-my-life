


// #region Imports

import { expect      } from '@playwright/test';     // What: Expect. Why: Each check asserts on what it reads from the page. How: This compares each reading with what the app should show.
import { opeStaFun   } from '../support/states.ts'; // What: Open State Function. Why: Each tab has to be opened and settled before its first Tab press. How: This loads it and waits for it.
import { STA_REC_ARR } from '../support/states.ts'; // What: State Record Array. Why: The check runs on the app's plain tab states. How: This lists them, and the spec keeps the ones with nothing opened over the tab.
import { test        } from '@playwright/test';     // What: Test. Why: Each tab's check is its own test. How: This declares them.

// #endregion Imports



/**
 * skip-link.spec.ts = Skip Link Spec
 *
 * @summary
 * Checks the app's skip link on every tab at a phone and a desktop width, in
 * whichever engine the project runs: the first Tab has to land on the link,
 * on screen, and a plain click on it has to move focus to the main area
 * without adding a hash to the address. States that open something over the
 * tab (help mode, a modal) are left out, since an open layer makes the page
 * behind it, the link included, inert on purpose.
 *
 * Sections:
 *  - Constants
 *  - Module Init
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const TAB_STA_ARR = STA_REC_ARR.filter( ( staRecObj ) => staRecObj.fixBoo && !staRecObj.actFun ); // What: Tab State Array. Why: Only a plain tab shows the link as the first stop. How: This keeps the states on real data with nothing opened over them.

// #endregion Constants



// #region Module Init

for ( const staRecObj of TAB_STA_ARR ) { // What: Tab State Loop. Why: Every tab opens with the same skip link. How: This declares one test per state.


	test( `${ staRecObj.ideStr } opens with a skip link to the main area`, async ( { page : curPagObj } ) => { // What: Skip Link Test. Why: A keyboard user's first stop should lead straight past the tab bar. How: This presses Tab, checks the link has focus on screen, clicks it, and checks the main area has focus with no hash added.


		await opeStaFun( curPagObj, staRecObj ); // What: State Open Call. Why: The first Tab press should meet the settled tab. How: This loads and settles it.


		await curPagObj.evaluate( () => { // What: Tab Start Reset Call. Why: Opening a tab clicks its button in the tab bar, which moves the browser's Tab starting point there, past the skip link. How: This focuses the root element for a moment, which puts the starting point at the top of the page.


			document.documentElement.tabIndex = -1; // What: Root Tab Index Set. Why: Only a focusable element can take focus from a script. How: This makes the root focusable without adding it to the Tab order.


			document.documentElement.focus(); // What: Root Focus Call. Why: Focusing an element moves the Tab starting point to it. How: This focuses the root.

			document.documentElement.removeAttribute( 'tabindex' ); // What: Root Tab Index Removal. Why: The root shouldn't stay focusable after the reset. How: This removes the attribute again.


		} );


		await curPagObj.keyboard.press( 'Tab' ); // What: First Tab Press. Why: The skip link has to be the first stop. How: This moves focus onto the first focusable element.

		await curPagObj.evaluate( () => Promise.all( document.getAnimations().map( ( aniCurObj ) => aniCurObj.finished ) ) ); // What: Slide Finished Wait. Why: The link slides into view on focus, so it's judged where it lands. How: This waits for every running animation to finish.


		const skiLinLoc = curPagObj.locator( '[data-element-name-hook~="skiLinAnc"]' ); // What: Skip Link Locator. Why: The checks read the skip link. How: This finds it by its hook.


		await expect( skiLinLoc ).toBeFocused();     // What: Skip Link Focus Assertion. Why: The first Tab has to land on the skip link. How: This checks it holds focus.
		await expect( skiLinLoc ).toBeInViewport(); // What: Skip Link On Screen Assertion. Why: A focused link has to be visible. How: This checks it sits inside the viewport.

		await skiLinLoc.click(); // What: Skip Link Click. Why: A plain click should move focus to the main area. How: This clicks the link.

		await expect( curPagObj.locator( 'main' ) ).toBeFocused(); // What: Main Focus Assertion. Why: The next Tab should continue into the open tab. How: This checks the main area holds focus.

		expect( new URL( curPagObj.url() ).hash ).toBe( '' ); // What: No Hash Assertion. Why: The skip link should leave no hash in the address. How: This reads the address's hash once the click has been handled.


	} );


}

// #endregion Module Init


