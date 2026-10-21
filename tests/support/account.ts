


// #region Imports

import { expect    } from '@playwright/test';  // What: Expect. Why: Signing in waits for what the page shows. How: This makes the assertions.
import { selTabFun } from './app.ts';           // What: Select Tab Function. Why: Sign-in happens on the Settings tab. How: This switches to it.


import type { Page } from '@playwright/test'; // What: Page. Why: The helpers drive one device's page. How: This types their page parameter.

// #endregion Imports



/**
 * account.ts = Account
 *
 * @summary
 * Helpers for the suites that sign in against the Firebase Emulator, which
 * their npm scripts start around them. The emulator's admin API creates an
 * account and gives it the paid claim, standing in for the payment webhook,
 * and reads back each emailed sign-in link, which a device then opens the
 * way a person would.
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

const AUT_EMU_STR = 'http://127.0.0.1:9099'; // What: Auth Emulator String. Why: The admin calls reach the auth emulator. How: This is its default address.
const EMU_PRO_STR = 'demo-ease-my-life';     // What: Emulator Project String. Why: Admin calls name the project. How: This is the demo project the app uses under the emulator.

// #endregion Constants



// #region Helpers

const admPosFun = ( adrPatStr : string, posBodObj : object ) => fetch( `${ AUT_EMU_STR }${ adrPatStr }`, { body : JSON.stringify( posBodObj ), headers : { 'Authorization' : 'Bearer owner', 'Content-Type' : 'application/json' }, method : 'POST' } ).then( ( resCurObj ) => resCurObj.json() ); // What: Admin Post Function. Why: The emulator's admin API creates the account and sets its claim. How: This posts JSON as the emulator's owner and parses the reply.



const claSetFun = ( uidValStr : string ) => admPosFun( `/identitytoolkit.googleapis.com/v1/projects/${ EMU_PRO_STR }/accounts:update`, { customAttributes : JSON.stringify( { paid : true } ), localId : uidValStr } ); // What: Claim Set Function. Why: Tests stand in for the payment webhook. How: This sets an account's paid claim.



// #region creAccFun

/**
 * creAccFun = Create Account Function
 *
 * @summary
 * Creates the account in the auth emulator and, unless told otherwise, gives
 * it the paid claim before anyone signs in, so the first token either device
 * receives already carries it, as it would after a purchase and a token
 * refresh. The account starts with a throwaway password that nothing uses, and
 * the emailed link then signs in to the same account and verifies its address.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param emaAdrStr - Email Address String: The account's address.
 * @param paiValBoo - Paid Value Boolean: Whether it starts paid, defaulting
 *                    to true.
 *
 * @returns A promise that settles with the account's id once it's set up.
 *
 * @example
 * ```ts
 * await creAccFun('sync@example.com') // => Promise<string>
 * ```
 *
*/

async function creAccFun ( emaAdrStr : string, paiValBoo : boolean = true ) : Promise< string > {


	const sigUpcObj = await admPosFun( '/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key', { email : emaAdrStr, password : 'unused-password', returnSecureToken : true } ); // What: Sign Up Object. Why: The account has to exist before its claim is set. How: This creates it.


	if ( paiValBoo ) await claSetFun( sigUpcObj.localId ); // What: Paid Claim Call. Why: Only a paid account syncs, and the webhook that sets this doesn't run here. How: This sets the paid claim unless the account starts unpaid.



	return sigUpcObj.localId; // What: Identifier Return. Why: A purchase test sets the claim later. How: This returns the account's id.


}

// #endregion creAccFun



// #region sigLinFun

/**
 * sigLinFun = Sign In Link Function
 *
 * @summary
 * Signs a device in the way a person does: types the address on the
 * Settings tab and asks for a link, then opens the link the emulator
 * recorded for it (built as the app's own address with the link's code, as
 * the real email's link would land), and waits for the account to show as
 * signed in. The address stays remembered on this device, so the link
 * finishes without being typed again.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The device's page.
 * @param emaAdrStr - Email Address String: The account's address.
 *
 * @returns A promise that settles once the device is signed in, with no
 *          value.
 *
 * @example
 * ```ts
 * await sigLinFun(curPagObj, 'sync@example.com') // => Promise<void>
 * ```
 *
*/

async function sigLinFun ( curPagObj : Page, emaAdrStr : string ) : Promise< void > {


	await selTabFun( curPagObj, 'settings' ); // What: Tab Switch Call. Why: The sign-in form is on the Settings tab. How: This switches to it.


	await curPagObj.locator( '[data-element-name-hook~="accEmaInp"]' ).fill( emaAdrStr );                           // What: Address Fill Call. Why: The link is sent to the account's address. How: This types it.
	await curPagObj.locator( '[data-element-name-hook~="accLinFor"]' ).getByRole( 'button' ).click();               // What: Send Click Call. Why: The link is requested on click. How: This clicks Email me a link.
	await expect( curPagObj.locator( '[data-element-name-hook~="accStaPar"]' ) ).toHaveText( /Sign-in link sent/ ); // What: Sent Assertion. Why: The link must have gone out before it's read back. How: This waits for the status region's news.



	const oobResObj = await fetch( `${ AUT_EMU_STR }/emulator/v1/projects/${ EMU_PRO_STR }/oobCodes` ).then( ( resCurObj ) => resCurObj.json() );                                                          // What: Out-Of-Band Result Object. Why: The emulator records every sign-in link instead of emailing it. How: This reads them.
	const oobCodStr = oobResObj.oobCodes.filter( ( oobCurObj : { email : string, requestType : string } ) => oobCurObj.email === emaAdrStr && oobCurObj.requestType === 'EMAIL_SIGNIN' ).at( -1 ).oobCode; // What: Out-Of-Band Code String. Why: The newest link for this address is this device's. How: This picks its code.


	await curPagObj.goto( `/?apiKey=fake-api-key&lang=en&mode=signIn&oobCode=${ oobCodStr }` ); // What: Link Open Call. Why: Opening the emailed link is what finishes signing in. How: This opens the app's address with the link's code.



	await selTabFun( curPagObj, 'settings' ); // What: Tab Return Call. Why: The account shows on the Settings tab. How: This switches back to it.


	await expect( curPagObj.locator( '[data-element-name-hook~="accOutBut"]' ) ).toBeVisible(); // What: Signed In Assertion. Why: The link must have signed the device in. How: This waits for the sign-out button.


}

// #endregion sigLinFun



const synWaiFun = ( curPagObj : Page ) => expect( curPagObj.locator( '[data-element-name-hook~="accStaSpa"]' ) ).toHaveText( /^Synced at/, { timeout : 30000 } ); // What: Sync Wait Function. Why: Each step waits for a finished sync. How: This waits for the status to read Synced.

// #endregion Helpers



// #region Exports

export { admPosFun, AUT_EMU_STR, claSetFun, creAccFun, EMU_PRO_STR, sigLinFun, synWaiFun }; // What: Named Exports. Why: The account suites create accounts, sign devices in, and wait for syncs through these. How: This exports them by name.

// #endregion Exports


