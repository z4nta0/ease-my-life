


// #region Imports

import AxeBuilder from '@axe-core/playwright'; // What: Axe Builder. Why: The signed-in screens get the same axe-core scan as the rest of the app. How: This runs it on a page.


import { creAccFun   } from '../support/account.ts'; // What: Create Account Function. Why: Each screen needs its own emulator account. How: This creates one.
import { EMU_PRO_STR } from '../support/account.ts'; // What: Emulator Project String. Why: The first-sync choice needs a cloud copy written into the emulator. How: This names its project.
import { expect      } from '@playwright/test';      // What: Expect. Why: A screen passes only with no violations and no sideways scroll. How: This makes the assertions.
import { reaFixFun   } from '../support/fixture.ts'; // What: Read Fixture Function. Why: The first-sync choice needs a device with its own data. How: This reads the backup.
import { sigLinFun   } from '../support/account.ts'; // What: Sign In Link Function. Why: Each screen is reached by signing in. How: This signs a device in with an emailed link.
import { synWaiFun   } from '../support/account.ts'; // What: Sync Wait Function. Why: The paid screens are scanned once synced. How: This waits for the status to read Synced.
import { test        } from '@playwright/test';      // What: Test. Why: Each screen is its own test. How: This declares them.
import { watErrFun   } from '../support/watch.ts';   // What: Watch Errors Function. Why: A screen fails on any page error. How: This collects them.
import { wriStaFun   } from '../support/storage.ts'; // What: Write State Function. Why: The first-sync choice starts from the backup. How: This writes it.


import type { Page } from '@playwright/test'; // What: Page. Why: The helpers drive one page. How: This types their page parameter.

// #endregion Imports



/**
 * accessibility.spec.ts = Account Accessibility Spec
 *
 * @summary
 * Scans the Settings tab's signed-in Account screens, which the main
 * accessibility suite can't reach since signing in needs the Firebase Emulator
 * that npm run test:account starts around this suite. Each screen gets the
 * main suite's axe-core scan, limited to the Account section and the reset
 * row, since the main suite scans the rest of Settings (WCAG 2.2 AA plus best
 * practices, zero violations) at 1,280px and 375px wide, and a reflow check at
 * 320px: signed in but unpaid, with Unlock sync; paid and synced; the
 * first-sync choice, for a device with its own data joining an account that
 * already has a cloud copy; and the reset confirm with its cloud option.
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

const AXE_TAG_ARR = [ 'wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice' ]; // What: Axe Tag Array. Why: The app targets WCAG 2.2 AA, the same as the main suite. How: This selects every A and AA rule up to 2.2 plus best practices.

// #endregion Constants



// #region Helpers

// #region chePagFun

/**
 * chePagFun = Check Page Function
 *
 * @summary
 * Checks the screen showing on a page at each width: an axe-core scan at
 * 1,280px and 375px of what signing in changes (the Account section and the
 * reset row), which must find no violations, and at 320px a check that the
 * page doesn't scroll sideways, measured as the main suite measures it. It
 * reports the violations by rule and target, so a failure says what to fix.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page showing the screen.
 *
 * @returns A promise that settles once every width passed, with no value.
 *
 * @example
 * ```ts
 * await chePagFun(curPagObj) // => Promise<void>
 * ```
 *
*/

async function chePagFun ( curPagObj : Page ) : Promise< void > {


	for ( const widValNum of [ 1280, 375 ] ) { // What: Width Loop. Why: The section lays out differently on a phone. How: This scans at desktop and phone widths.


		await curPagObj.setViewportSize( { height : 900, width : widValNum } ); // What: Width Set Call. Why: Each width is scanned. How: This resizes the page.

		await curPagObj.waitForTimeout( 400 ); // What: Settle Wait. Why: Container queries and transitions finish after a resize. How: This waits a moment.


		const axeResObj = await new AxeBuilder( { page : curPagObj } ).include( '[data-element-name-hook~="setAccSec"]' ).include( '[data-element-name-hook~="resRowDiv"]' ).withTags( AXE_TAG_ARR ).analyze(); // What: Axe Result Object. Why: The scan decides the test, and covers only what signing in changes, since the main suite scans the rest of Settings, and a section half scrolled out of view reads to axe as a clipped, undersized target. How: This runs axe-core with the suite's tags on the Account section and the reset row.


		expect( axeResObj.violations.map( ( vioCurObj ) => `${ vioCurObj.id }: ${ vioCurObj.help } at ${ vioCurObj.nodes.map( ( nodCurObj ) => nodCurObj.target.join( ' ' ) ).join( ', ' ) }` ), `axe at ${ widValNum }px` ).toEqual( [] ); // What: Violation Assertion. Why: A screen passes only with none. How: This lists each by rule and target.


	}



	await curPagObj.setViewportSize( { height : 900, width : 320 } ); // What: Reflow Width Set Call. Why: WCAG reflow allows no sideways scroll at 320px. How: This resizes the page.

	await curPagObj.waitForTimeout( 400 ); // What: Settle Wait. Why: The layout settles after a resize. How: This waits a moment.


	expect( await curPagObj.evaluate( () => document.documentElement.scrollWidth - document.documentElement.clientWidth ), 'sideways overflow at 320px' ).toBeLessThanOrEqual( 0 ); // What: Reflow Assertion. Why: The page passes only when nothing scrolls it sideways, measured the way the main suite does. How: This expects the page no wider than the window.


}

// #endregion chePagFun

// #endregion Helpers



// #region Module Init

test( 'the signed-in Account screens pass the accessibility checks', async ( { page : curPagObj } ) => { // What: Signed-In Screens Test. Why: The main suite only reaches the signed-out section. How: This signs in unpaid, then paid, and checks each screen and the reset confirm.


	const errMesArr = watErrFun( curPagObj );                    // What: Error Message Array. Why: A screen fails on any page error. How: This starts watching.
	const unpEmaStr = `a11y-unpaid-${ Date.now() }@example.com`; // What: Unpaid Email String. Why: The unpaid screen needs its own account. How: This builds a unique address.
	const paiEmaStr = `a11y-paid-${ Date.now() }@example.com`;   // What: Paid Email String. Why: The paid screens need their own account. How: This builds a unique address.



	await creAccFun( unpEmaStr, false ); // What: Unpaid Account Call. Why: The unpaid screen shows Unlock sync. How: This creates the account without the claim.

	await curPagObj.goto( '/' ); // What: App Load. Why: The screen starts on a fresh install. How: This opens the app.

	await curPagObj.getByRole( 'button', { name : /explore myself/ } ).click(); // What: Welcome Skip Click. Why: A fresh install opens on the welcome modal. How: This skips it.

	await sigLinFun( curPagObj, unpEmaStr ); // What: Unpaid Sign-In Call. Why: The screen is signed in. How: This signs in the unpaid account.

	await expect( curPagObj.locator( '[data-element-name-hook~="accBuyBut"]' ) ).toBeVisible(); // What: Unlock Row Wait. Why: The screen is ready once Unlock sync shows. How: This waits for it.

	await chePagFun( curPagObj ); // What: Unpaid Check Call. Why: The unpaid screen must pass. How: This checks it.



	await curPagObj.locator( '[data-element-name-hook~="accOutBut"]' ).click(); // What: Sign-Out Click. Why: The paid account signs in next on the same device. How: This signs out.

	await creAccFun( paiEmaStr ); // What: Paid Account Call. Why: The paid screens show sync. How: This creates the account with the claim.

	await curPagObj.setViewportSize( { height : 900, width : 1280 } ); // What: Width Reset Call. Why: Signing in uses the desktop layout. How: This restores the width.

	await sigLinFun( curPagObj, paiEmaStr ); // What: Paid Sign-In Call. Why: The screen is signed in. How: This signs in the paid account.

	await synWaiFun( curPagObj ); // What: Sync Wait Call. Why: The paid screen is scanned once synced. How: This waits for it.

	await chePagFun( curPagObj ); // What: Paid Check Call. Why: The synced screen must pass. How: This checks it.



	await curPagObj.setViewportSize( { height : 900, width : 1280 } ); // What: Width Reset Call. Why: The reset row is opened at desktop width. How: This restores the width.

	await curPagObj.locator( '[data-element-name-hook~="resRowDiv"]' ).getByRole( 'button', { exact : true, name : 'Reset' } ).click(); // What: Reset Open Click. Why: The signed-in confirm has its cloud option. How: This opens it.

	await expect( curPagObj.locator( '[data-element-name-hook~="resCloBut"]' ) ).toBeVisible(); // What: Confirm Wait. Why: The screen is ready once the cloud option shows. How: This waits for it.

	await chePagFun( curPagObj ); // What: Confirm Check Call. Why: The reset confirm must pass. How: This checks it.



	expect( errMesArr, errMesArr.join( '\n' ) ).toEqual( [] ); // What: Error Assertion. Why: A screen that logged an error failed even if it passed. How: This expects no errors.


} );



test( 'the first-sync choice passes the accessibility checks', async ( { page : curPagObj } ) => { // What: Choice Screen Test. Why: A device with its own data joining an account with a cloud copy asks which to keep. How: This sets that up and checks the choice.


	const emaAdrStr = `a11y-choice-${ Date.now() }@example.com`; // What: Email Address String. Why: The screen needs its own account. How: This builds a unique address.
	const errMesArr = watErrFun( curPagObj );                    // What: Error Message Array. Why: A screen fails on any page error. How: This starts watching.
	const uidValStr = await creAccFun( emaAdrStr );              // What: User Identifier Value String. Why: The cloud copy is written under the account's id. How: This creates the paid account.


	await fetch( `http://127.0.0.1:8080/v1/projects/${ EMU_PRO_STR }/databases/(default)/documents/users/${ uidValStr }`, { body : JSON.stringify( { fields : { docs : { mapValue : { fields : {} } }, prior : { mapValue : { fields : {} } }, rev : { integerValue : '1' }, savedAt : { integerValue : '1' }, v : { integerValue : '1' } } } ), headers : { 'Authorization' : 'Bearer owner', 'Content-Type' : 'application/json' }, method : 'PATCH' } ); // What: Cloud Copy Write. Why: The choice only appears when the account already has a copy. How: This writes an empty manifest into the emulator as its owner.



	await wriStaFun( curPagObj, reaFixFun() ); // What: Backup Load Call. Why: The device has data of its own. How: This writes the backup.

	await curPagObj.goto( '/' ); // What: App Load. Why: The app boots on the backup. How: This opens it.

	await sigLinFun( curPagObj, emaAdrStr ); // What: Sign-In Call. Why: The first sync starts on sign-in. How: This signs in.

	await expect( curPagObj.locator( '[data-element-name-hook~="accChoBut"]' ) ).toBeVisible(); // What: Choice Wait. Why: The screen is ready once the choice shows. How: This waits for it.

	await chePagFun( curPagObj ); // What: Choice Check Call. Why: The choice must pass. How: This checks it.



	expect( errMesArr, errMesArr.join( '\n' ) ).toEqual( [] ); // What: Error Assertion. Why: A screen that logged an error failed even if it passed. How: This expects no errors.


} );

// #endregion Module Init


