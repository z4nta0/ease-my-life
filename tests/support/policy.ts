


// #region Imports

import { expect    } from '@playwright/test'; // What: Expect. Why: The new tab link check passes only when every such link is closed off. How: This asserts on the links' relationships.
import { heaPatFun } from './headers.ts';     // What: Headers Path Function. Why: The pages are loaded under the headers Netlify really sends with each path. How: This reads the headers the built dist/_headers sends with one path.


import type { Page } from '@playwright/test'; // What: Page. Why: The policy helpers drive a Playwright page. How: This types each helper's page parameter.

// #endregion Imports



/**
 * policy.ts = Policy
 *
 * @summary
 * The helpers that run a page under the app's own security policy. Neither
 * the dev server nor vite preview reads Netlify's headers file, so
 * polSetFun gives every response the headers the built dist/_headers sends
 * with its path and records each violation the browser reports, polVioFun
 * reads those violations back, and relCheFun checks that every link opening
 * a new tab is closed off.
 *
 * Sections:
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Helpers

// #region polSetFun

/**
 * polSetFun = Policy Setup Function
 *
 * @summary
 * Readies a page to be checked against the policy. Every response the page
 * receives is given the headers the built dist/_headers sends with its path,
 * the way Netlify gives them once deployed, and a listener added before any
 * of the page's own script runs records every violation the browser reports,
 * as a line naming the directive broken and what broke it, on the page's
 * window, where polVioFun reads them back. It reads the build, so it expects
 * npm run build to have run first.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page to ready.
 *
 * @returns A promise that settles once the headers and the listener are in
 *          place, with no value.
 *
 * @example
 * ```ts
 * polSetFun(page) // => Promise<void>
 * ```
 *
*/

async function polSetFun ( curPagObj : Page ) : Promise< void > {


	await curPagObj.route( '**/*', async ( rouCurObj ) => { // What: Header Route Call. Why: The preview server sends none of the policy's headers. How: This fetches every response as normal and fulfills it with its path's headers added.


		const resCurObj = await rouCurObj.fetch(); // What: Response Current Object. Why: The page should get the real file. How: This fetches it from the preview server.


		await rouCurObj.fulfill( { headers : { ...resCurObj.headers(), ...heaPatFun( new URL( rouCurObj.request().url() ).pathname ) }, response : resCurObj } ); // What: Fulfill Call. Why: The browser applies the app's policy from a response's headers. How: This answers with the real response and the headers its path is sent with on top.


	} );



	await curPagObj.addInitScript( () => { // What: Violation Listener Call. Why: The listener has to be in place before the page's own script runs, or an early violation would be missed. How: This runs before every page's script and records each violation the browser reports.


		const winVioObj = window as unknown as { __polVioArr : string[] }; // What: Window Violation Object. Why: The violations are kept where the test can read them back. How: This views the window with its violation list. // What: Type Assertion Note. Why: The window has no such field in its type. How: The as names the one the listener adds.


		winVioObj.__polVioArr = []; // What: Violation List Assignment. Why: Each page starts with none. How: This sets an empty list.


		document.addEventListener( 'securitypolicyviolation', ( vioEveObj ) => winVioObj.__polVioArr.push( `${ vioEveObj.effectiveDirective } blocked ${ vioEveObj.blockedURI || 'inline code' } on ${ ( vioEveObj.target as Element | null )?.tagName?.toLowerCase() ?? 'the page' }` ) ); // What: Violation Listener. Why: The browser reports each refused resource as an event. How: This records the directive broken, what it blocked, and the element it was on. // What: Type Assertion Note. Why: An event's target is typed as a plain event target. How: A violation's target is the element or document it happened on, so this reads it as an element, falling back for the document.


	} );


}

// #endregion polSetFun



// #region polVioFun

/**
 * polVioFun = Policy Violation Function
 *
 * @summary
 * Reads back the violations the listener polSetFun adds has recorded on the
 * page so far, one line each naming the directive broken and what broke it.
 * It expects polSetFun to have readied the page first.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page to read.
 *
 * @returns A promise that resolves with the list of violations recorded.
 *
 * @example
 * ```ts
 * polVioFun(page) // => []
 * ```
 *
*/

async function polVioFun ( curPagObj : Page ) : Promise< string[] > {


	return curPagObj.evaluate( () => ( window as unknown as { __polVioArr : string[] } ).__polVioArr ); // What: Violation List Return. Why: The test reads what the browser reported. How: This reads the page's list. // What: Type Assertion Note. Why: The window has no such field in its type. How: The as names the one polSetFun's listener adds.


}

// #endregion polVioFun



// #region relCheFun

/**
 * relCheFun = Relationship Check Function
 *
 * @summary
 * Checks that every link on the page that opens a new tab carries noopener,
 * so the opened page gets no handle on this one, and noreferrer, so the
 * opened site doesn't learn the address it came from.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page to check.
 *
 * @returns A promise that settles once both checks have passed, with no
 *          value.
 *
 * @example
 * ```ts
 * relCheFun(page) // => Promise<void>
 * ```
 *
*/

async function relCheFun ( curPagObj : Page ) : Promise< void > {


	const opeRelArr = await curPagObj.locator( 'a[target="_blank"]' ).evaluateAll( ( ancEleArr ) => ancEleArr.map( ( ancCurEle ) => ancCurEle.getAttribute( 'rel' ) ?? '' ) ); // What: Opener Relationship Array. Why: A new tab opened without noopener can reach back and change this page. How: This collects the rel of every link that opens a new tab.


	expect( opeRelArr.filter( ( relValStr ) => !/\bnoopener\b/.test( relValStr ) ) ).toEqual( [] );   // What: No Opener Assertion. Why: The opened page shouldn't get a handle on this one. How: This checks every new tab link carries noopener.
	expect( opeRelArr.filter( ( relValStr ) => !/\bnoreferrer\b/.test( relValStr ) ) ).toEqual( [] ); // What: No Referrer Assertion. Why: The opened site shouldn't learn the address it came from. How: This checks every new tab link carries noreferrer.


}

// #endregion relCheFun

// #endregion Helpers



// #region Exports

export { polSetFun, polVioFun, relCheFun }; // What: Named Exports. Why: Pages are run under the policy through these. How: This exports the setup, the violation reader, and the new tab link check.

// #endregion Exports


