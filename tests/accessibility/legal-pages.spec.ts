


// #region Imports

import AxeBuiCla from '@axe-core/playwright'; // What: Axe Builder Class. Why: axe-core finds the mechanical accessibility failures, such as low contrast and missing names. How: This runs its scan against a Playwright page.


import { expect } from '@playwright/test'; // What: Expect. Why: Each check asserts on what it reads from the page. How: This compares each reading with what the page should show.
import { test   } from '@playwright/test'; // What: Test. Why: Each check of each legal page is its own test. How: This declares them.


import type { Page } from '@playwright/test'; // What: Page. Why: The open helper drives a Playwright page. How: This types its page parameter.

// #endregion Imports



/**
 * legal-pages.spec.ts = Legal Pages Spec
 *
 * @summary
 * Checks the standalone /privacy and /terms pages, which the app's own state
 * list can't reach since they aren't tabs of the app. Each page is scanned
 * with axe at a phone and a desktop width, its skip link has to be the first
 * Tab stop and move focus to the main content without adding a hash, it has
 * to reflow at 320px without scrolling sideways, and under reduced motion
 * focusing its skip link must play no transition. Anything axe can't decide
 * is printed as needing review.
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

const AXE_TAG_ARR = [ 'wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice' ]; // What: Axe Tag Array. Why: The pages target WCAG 2.2 AA, as the app does, plus axe's best practices. How: This limits the scan to those rule sets.
const LEG_PAT_ARR = [ '/privacy', '/terms' ];                                                    // What: Legal Path Array. Why: Both legal pages get the same checks. How: This lists their addresses.
const REF_WID_NUM = 320;                                                                         // What: Reflow Width Number. Why: WCAG's reflow criterion asks for no sideways scrolling at 320 CSS pixels. How: This is the width the reflow check opens each page at.
const WID_NUM_ARR = [ 375, 1280 ];                                                               // What: Width Number Array. Why: The pages are scanned at a phone and a desktop width, as the app is. How: This lists the two viewport widths.

// #endregion Constants



// #region Helpers

// #region opePagFun

/**
 * opePagFun = Open Page Function
 *
 * @summary
 * Sizes the viewport, opens a legal page, and waits until its fonts have
 * loaded and every animation and transition has finished, so no check reads
 * the page mid-load. Under the dev server the stylesheets arrive by script,
 * which sets their links' rings and colors easing in from unstyled, so the
 * wait matters there.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page to open it in.
 * @param patStr    - Path String: The legal page's address.
 * @param widNum    - Width Number: The viewport width in CSS pixels.
 *
 * @returns A promise that settles once the page is open and still, with no
 *          value.
 *
 * @example
 * ```ts
 * opePagFun(page, '/privacy', 375) // => Promise<void>
 * ```
 *
*/

async function opePagFun ( curPagObj : Page, patStr : string, widNum : number ) : Promise< void > {


	await curPagObj.setViewportSize( { height : 800, width : widNum } ); // What: Viewport Size Call. Why: Layouts change with width. How: This sizes the viewport before the page loads.

	await curPagObj.goto( patStr ); // What: Page Open Call. Why: The checks read the page itself. How: This opens its address.

	await curPagObj.evaluate( async () => { // What: Settle Wait Call. Why: Fonts and transitions still running would change what the checks read. How: This waits for the fonts, then for every running animation to finish.


		await document.fonts.ready; // What: Fonts Ready Wait. Why: Text measured before its font loads takes a different size. How: This waits for every font the page uses.

		await Promise.all( document.getAnimations().map( ( aniCurObj ) => aniCurObj.finished ) ); // What: Animations Finished Wait. Why: A ring or color still easing in would be read halfway. How: This waits for every running animation and transition to finish.


	} );


}

// #endregion opePagFun

// #endregion Helpers



// #region Module Init

for ( const patStr of LEG_PAT_ARR ) { // What: Legal Page Loop. Why: Both pages get the same checks. How: This declares each page's tests.


	for ( const widNum of WID_NUM_ARR ) { // What: Width Loop. Why: Each page is scanned at a phone and a desktop width. How: This declares one scan per width.


		test( `${ patStr } at ${ widNum.toLocaleString( 'en-US' ) }px has no axe violations`, async ( { page : curPagObj }, tesInfObj ) => { // What: Axe Test. Why: The page passes only with zero axe violations. How: This opens the page, scans it, reports anything needing review, and fails on any violation.


			await opePagFun( curPagObj, patStr, widNum ); // What: Page Open Call. Why: The scan should see the page settled. How: This opens and settles it.


			const axeResObj = await new AxeBuiCla( { page : curPagObj } ).withTags( AXE_TAG_ARR ).analyze();                                                                     // What: Axe Result Object. Why: Both the violations and the undecided results come from one scan. How: This scans the page with the chosen rule sets.
			const revLinArr = axeResObj.incomplete.map( ( resCurObj ) => `${ resCurObj.id }: ${ resCurObj.help }` );                                                              // What: Review Line Array. Why: Results axe couldn't decide need a person's look. How: This names each one with its help text.
			const vioLinArr = axeResObj.violations.map( ( resCurObj ) => `${ resCurObj.id }: ${ resCurObj.help } at ${ resCurObj.nodes.map( ( nodCurObj ) => nodCurObj.target.join( ' ' ) ).join( ', ' ) }` ); // What: Violation Line Array. Why: A failure should say what broke and where. How: This names each violation with its help text and the elements it found.


			if ( revLinArr.length ) console.log( `[${ tesInfObj.project.name }] ${ patStr } at ${ widNum }px needs review:\n  ${ revLinArr.join( '\n  ' ) }` ); // What: Review Log Call. Why: The run should show what needs a look. How: This prints the page's review lines under its project, address, and width.



			expect( vioLinArr ).toEqual( [] ); // What: No Violations Assertion. Why: The page passes only with zero violations. How: This compares the violation lines with an empty list, so a failure prints each one.


		} );


	}



	test( `${ patStr } opens with a skip link to its main content`, async ( { page : curPagObj } ) => { // What: Skip Link Test. Why: A keyboard user's first stop should lead straight to the document. How: This presses Tab, checks the skip link has focus on screen, clicks it, and checks the main has focus with the address unchanged.


		await opePagFun( curPagObj, patStr, 375 ); // What: Page Open Call. Why: The link is checked at a phone width, where room is tightest. How: This opens and settles the page at 375px.

		await curPagObj.keyboard.press( 'Tab' ); // What: First Tab Press. Why: The skip link has to be the first stop. How: This moves focus onto the first focusable element.

		await curPagObj.evaluate( () => Promise.all( document.getAnimations().map( ( aniCurObj ) => aniCurObj.finished ) ) ); // What: Slide Finished Wait. Why: The link slides into view on focus, so it's judged where it lands. How: This waits for its transition to finish.


		const skiLinLoc = curPagObj.locator( '[data-element-name-hook~="skiLinAnc"]' ); // What: Skip Link Locator. Why: The checks read the skip link. How: This finds it by its hook.


		await expect( skiLinLoc ).toBeFocused();     // What: Skip Link Focus Assertion. Why: The first Tab has to land on the skip link. How: This checks it holds focus.
		await expect( skiLinLoc ).toBeInViewport(); // What: Skip Link On Screen Assertion. Why: A focused link has to be visible. How: This checks it sits inside the viewport.

		await skiLinLoc.click(); // What: Skip Link Click. Why: A plain click should move focus to the main content. How: This clicks the link.

		await expect( curPagObj.locator( 'main' ) ).toBeFocused();            // What: Main Focus Assertion. Why: The next Tab should continue into the document. How: This checks the main holds focus.
		await expect( curPagObj ).toHaveURL( new RegExp( `${ patStr }$` ) ); // What: Unchanged Address Assertion. Why: The skip link should leave no hash in the address. How: This checks the address still ends with the page's own path.


	} );



	test( `${ patStr } reflows at ${ REF_WID_NUM }px without scrolling sideways`, async ( { page : curPagObj } ) => { // What: Reflow Test. Why: Zoomed-in visitors read in one column without scrolling sideways. How: This opens the page at the reflow width and compares each scrolling box's content width with its visible width.


		await opePagFun( curPagObj, patStr, REF_WID_NUM ); // What: Page Open Call. Why: The check reads the page at the reflow width. How: This opens and settles it at 320px.


		const oveWidArr = await curPagObj.evaluate( () => [ document.documentElement, document.body ].map( ( eleCurObj ) => eleCurObj.scrollWidth - eleCurObj.clientWidth ) ); // What: Overflow Width Array. Why: Sideways overflow could show on the root or on the body. How: This reads how far each one's content reaches past its visible width.


		expect( oveWidArr ).toEqual( [ 0, 0 ] ); // What: No Sideways Scroll Assertion. Why: Neither box may scroll sideways. How: This checks both overflow by nothing.


	} );



	test( `${ patStr } plays no motion under reduced motion`, async ( { page : curPagObj } ) => { // What: Reduced Motion Test. Why: Visitors who ask for less motion shouldn't see the skip link slide or its ring ease. How: This requests reduced motion, focuses the skip link, and checks no animation is running.


		await curPagObj.emulateMedia( { reducedMotion : 'reduce' } ); // What: Reduced Motion Emulation. Why: The preference has to be set before the page loads. How: This makes the page match prefers-reduced-motion: reduce.

		await opePagFun( curPagObj, patStr, 375 ); // What: Page Open Call. Why: The check reads the page once it has loaded. How: This opens and settles it.

		await curPagObj.keyboard.press( 'Tab' ); // What: First Tab Press. Why: Focusing the skip link is the page's one motion. How: This moves focus onto it.


		expect( await curPagObj.evaluate( () => document.getAnimations().length ) ).toBe( 0 ); // What: No Motion Assertion. Why: Under reduced motion the link should simply appear. How: This checks nothing is animating right after it takes focus.


	} );


}

// #endregion Module Init


