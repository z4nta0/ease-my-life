


// #region Imports

import { admPosFun   } from './emulator.ts';                 // What: Admin Post Function. Why: Accounts are created and given their claim through the emulator's admin API. How: This posts to it.
import { AUT_EMU_STR } from './emulator.ts';                 // What: Authentication Emulator String. Why: Emailed sign-in links are read back from the auth emulator. How: This is its address.
import { EMU_PRO_STR } from '../../src/emulator-project.ts'; // What: Emulator Project String. Why: Admin calls name the project. How: This is the demo project.
import { expect      } from '@playwright/test';              // What: Expect. Why: Signing in waits for what the page shows. How: This makes the assertions.
import { selTabFun   } from './app.ts';                      // What: Select Tab Function. Why: Sign-in happens on the Settings tab. How: This switches to it.
import { wriStaFun   } from './storage.ts';                  // What: Write State Function. Why: A device signing in with data starts from a saved state. How: This writes it.


import type { AdmRepTyp } from './emulator.ts';                // What: Admin Reply Type. Why: The claim helper hands back the emulator's reply. How: This types claSetFun's result.
import type { Page      } from '@playwright/test';             // What: Page. Why: The helpers drive one device's page. How: This types their page parameter.
import type { StaAppTyp } from '../../src/core/data-model.ts'; // What: State App Type. Why: A device signing in with data starts from a saved state. How: This types the state its helper writes.

// #endregion Imports



/**
 * account.ts = Account
 *
 * @summary
 * Helpers for the suites that sign in against the Firebase Emulator, which
 * their npm scripts start around them. The emulator's admin API creates an
 * account and gives it the paid claim, standing in for the payment webhook,
 * and reads back each emailed sign-in link, which a device then opens the
 * way a person would. It also holds the day their new-day flows start on.
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

const DAY_ONE_STR = '2026-10-05'; // What: Day One String. Why: The account flows build a daily list on a known day, after the backup's 6 AM run time. How: This is that Chicago date.

// #endregion Constants



// #region Helpers

// #region claSetFun

/**
 * claSetFun = Claim Set Function
 *
 * @summary
 * Sets the paid claim on an emulator account, standing in for the payment
 * webhook.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param uidValStr - UID Value String: The account's id.
 *
 * @returns A promise that resolves with the emulator's reply.
 *
 * @example
 * ```ts
 * await claSetFun(uidValStr) // => the emulator's reply
 * ```
 *
*/

const claSetFun = ( uidValStr : string ) : Promise< AdmRepTyp > => admPosFun( `/identitytoolkit.googleapis.com/v1/projects/${ EMU_PRO_STR }/accounts:update`, { customAttributes : JSON.stringify( { paid : true } ), localId : uidValStr } ); // What: Claim Set Function. Why: Tests stand in for the payment webhook. How: This sets an account's paid claim.

// #endregion claSetFun



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
 * @returns A promise that resolves with the account's id.
 *
 * @example
 * ```ts
 * await creAccFun('sync@example.com') // => the account's id
 * ```
 *
*/

async function creAccFun ( emaAdrStr : string, paiValBoo : boolean = true ) : Promise< string > {


	const sigNewObj = await admPosFun( '/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key', { email : emaAdrStr, password : 'unused-password', returnSecureToken : true } ); // What: Sign New Object. Why: The account has to exist before its claim is set. How: This creates it.


	if ( paiValBoo ) await claSetFun( sigNewObj.localId ); // What: Paid Claim Call. Why: Only a paid account syncs, and the webhook that sets this doesn't run here. How: This sets the paid claim unless the account starts unpaid.



	return sigNewObj.localId; // What: Identifier Return. Why: A purchase test sets the claim later. How: This returns the account's id.


}

// #endregion creAccFun



// #region sigLinFun

/**
 * sigLinFun = Sign-In Link Function
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


	// #region Link Request

	await selTabFun( curPagObj, 'settings' ); // What: Tab Switch Call. Why: The sign-in form is on the Settings tab. How: This switches to it.


	await curPagObj.locator( '[data-element-name-hook~="accEmaInp"]' ).fill( emaAdrStr );                           // What: Address Fill Call. Why: The link is sent to the account's address. How: This types it.
	await curPagObj.locator( '[data-element-name-hook~="accLinFor"]' ).getByRole( 'button' ).click();               // What: Send Click Call. Why: The link is requested on click. How: This clicks Email me a link.
	await expect( curPagObj.locator( '[data-element-name-hook~="accStaPar"]' ) ).toHaveText( /Sign-in link sent/ ); // What: Sent Assertion. Why: The link must have gone out before it's read back. How: This waits for the status region's news.

	// #endregion Link Request



	// #region Emailed Link Follow

	const oobResObj = await fetch( `${ AUT_EMU_STR }/emulator/v1/projects/${ EMU_PRO_STR }/oobCodes` ).then( ( resCurObj ) => resCurObj.json() );                                                          // What: Out-Of-Band Result Object. Why: The emulator records every sign-in link instead of emailing it. How: This reads them.
	const oobCodStr = oobResObj.oobCodes.filter( ( oobCurObj : { email : string, requestType : string } ) => oobCurObj.email === emaAdrStr && oobCurObj.requestType === 'EMAIL_SIGNIN' ).at( -1 ).oobCode; // What: Out-Of-Band Code String. Why: The newest link for this address is this device's. How: This picks its code.


	await curPagObj.goto( `/?apiKey=fake-api-key&lang=en&mode=signIn&oobCode=${ oobCodStr }` ); // What: Link Open Call. Why: Opening the emailed link is what finishes signing in. How: This opens the app's address with the link's code.

	// #endregion Emailed Link Follow



	// #region Signed In Check

	await selTabFun( curPagObj, 'settings' ); // What: Tab Return Call. Why: The account shows on the Settings tab. How: This switches back to it.


	await expect( curPagObj.locator( '[data-element-name-hook~="accOutBut"]' ) ).toBeVisible(); // What: Signed-In Assertion. Why: The link must have signed the device in. How: This waits for the sign-out button.

	// #endregion Signed In Check


}

// #endregion sigLinFun



// #region freSigFun

/**
 * freSigFun = Fresh Sign-In Function
 *
 * @summary
 * Signs a fresh install in: opens the app, skips the welcome modal's tour,
 * and signs in through the emailed link. It leaves waiting for a sync to
 * the caller, since an unpaid account has no sync to wait for.
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
 * await freSigFun(curPagObj, 'sync@example.com') // => Promise<void>
 * ```
 *
*/

async function freSigFun ( curPagObj : Page, emaAdrStr : string ) : Promise< void > {


	await curPagObj.goto( '/' ); // What: App Load. Why: The device starts as a fresh install. How: This opens the app.

	await curPagObj.getByRole( 'button', { name : /explore myself/ } ).click(); // What: Welcome Skip Click. Why: A fresh install opens on the welcome modal. How: This skips the tour.

	await sigLinFun( curPagObj, emaAdrStr ); // What: Sign-In Call. Why: The device joins the account. How: This signs it in through the emailed link.


}

// #endregion freSigFun



// #region synWaiFun

/**
 * synWaiFun = Sync Wait Function
 *
 * @summary
 * Waits up to 30 seconds for the account status to read Synced.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The device's page.
 *
 * @returns A promise that settles once the status reads Synced, with no
 *          value.
 *
 * @example
 * ```ts
 * await synWaiFun(curPagObj) // => Promise<void>
 * ```
 *
*/

const synWaiFun = ( curPagObj : Page ) : Promise< void > => expect( curPagObj.locator( '[data-element-name-hook~="accStaSpa"]' ) ).toHaveText( /^Synced at/, { timeout : 30000 } ); // What: Sync Wait Function. Why: Each step waits for a finished sync. How: This waits for the status to read Synced.

// #endregion synWaiFun



// #region bacUplFun

/**
 * bacUplFun = Backup Upload Function
 *
 * @summary
 * Readies a signed-in device holding data: writes the given state into its
 * storage, opens the app on it, signs in through the emailed link, and
 * waits for the sync that follows, which uploads the state to an empty
 * account. It expects the account already created.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The device's page.
 * @param emaAdrStr - Email Address String: The account's address.
 * @param staAppObj - State App Object: The saved state the device starts on.
 *
 * @returns A promise that settles once the sync has finished, with no value.
 *
 * @example
 * ```ts
 * await bacUplFun(curPagObj, 'a@example.com', reaFixFun()) // => Promise<void>
 * ```
 *
*/

async function bacUplFun ( curPagObj : Page, emaAdrStr : string, staAppObj : StaAppTyp ) : Promise< void > {


	await wriStaFun( curPagObj, staAppObj ); // What: State Load Call. Why: The device holds data to upload. How: This writes the state into its storage.

	await curPagObj.goto( '/' ); // What: App Load. Why: The app boots on the written state. How: This opens it.

	await sigLinFun( curPagObj, emaAdrStr ); // What: Sign-In Call. Why: Only a signed-in device syncs. How: This signs it in through the emailed link.

	await synWaiFun( curPagObj ); // What: Upload Wait. Why: The device's copy has to reach the cloud before the flow goes on. How: This waits for the sync to finish.


}

// #endregion bacUplFun

// #endregion Helpers



// #region Exports

export { bacUplFun, claSetFun, creAccFun, DAY_ONE_STR, freSigFun, sigLinFun, synWaiFun }; // What: Named Exports. Why: Other files create accounts, sign devices in, wait for syncs, and start their new-day flows through these. How: This exports them by name.

// #endregion Exports


