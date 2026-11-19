


/**
 * emulator.ts = Emulator
 *
 * @summary
 * The Firebase Emulator's auth address, the demo project it runs, and a
 * helper that posts to its admin API, shared by the Playwright suites that
 * sign in and the payments test that runs under Node's own test runner. It
 * imports nothing, so Node can load it without Playwright.
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

const admPosFun = ( adrPatStr : string, posBodObj : object ) => fetch( `${ AUT_EMU_STR }${ adrPatStr }`, { body : JSON.stringify( posBodObj ), headers : { 'Authorization' : 'Bearer owner', 'Content-Type' : 'application/json' }, method : 'POST' } ).then( ( resCurObj ) => resCurObj.json() ); // What: Admin Post Function. Why: The emulator's admin API creates, reads, and updates test accounts. How: This posts JSON as the emulator's owner and parses the reply.

// #endregion Helpers



// #region Exports

export { admPosFun, AUT_EMU_STR, EMU_PRO_STR }; // What: Named Exports. Why: The account helpers, the account specs, and the payments test reach the emulator through these. How: This exports them by name.

// #endregion Exports


