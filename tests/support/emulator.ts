


/**
 * emulator.ts = Emulator
 *
 * @summary
 * The Firebase Emulator's auth and Firestore addresses and a helper that
 * posts to its admin API, shared by the Playwright suites that sign in and
 * the payments test that runs under Node's own test runner. It imports
 * nothing, so Node can load it without Playwright.
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

const AUT_EMU_STR = 'http://127.0.0.1:9099'; // What: Authentication Emulator String. Why: The admin calls reach the auth emulator. How: This is its default address.
const FIR_EMU_STR = 'http://127.0.0.1:8080'; // What: Firestore Emulator String. Why: Specs read and write the cloud copy straight through the Firestore emulator's REST API. How: This is its default address.

// #endregion Constants



// #region Helpers

type AdmRepTyp = { idToken : string, localId : string, users : { customAttributes? : string }[] }; // What: Admin Reply Type. Why: The callers read a new account's ID and token, and a looked-up account's claims. How: This types the fields of the emulator's JSON reply that they read.

// #region admPosFun

/**
 * admPosFun = Admin Post Function
 *
 * @summary
 * Posts a JSON body to a path on the auth emulator's admin API as the
 * emulator's owner and parses the reply.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param adrPatStr - Address Path String: The path after the emulator's
 *                    address.
 * @param posBodObj - Post Body Object: The object sent as the JSON body.
 *
 * @returns A promise that resolves with the parsed reply.
 *
 * @example
 * ```ts
 * await admPosFun(adrPatStr, posBodObj) // => the emulator's JSON reply
 * ```
 *
*/

const admPosFun = ( adrPatStr : string, posBodObj : object ) : Promise< AdmRepTyp > => fetch( `${ AUT_EMU_STR }${ adrPatStr }`, { body : JSON.stringify( posBodObj ), headers : { 'Authorization' : 'Bearer owner', 'Content-Type' : 'application/json' }, method : 'POST' } ).then( ( resCurObj ) => resCurObj.json() ); // What: Admin Post Function. Why: The emulator's admin API creates, reads, and updates test accounts. How: This posts JSON as the emulator's owner and parses the reply.

// #endregion admPosFun

// #endregion Helpers



// #region Exports

export { admPosFun, type AdmRepTyp, AUT_EMU_STR, FIR_EMU_STR }; // What: Named Exports. Why: The emulator is reached through these. How: This exports them by name.

// #endregion Exports


