


// #region Imports

import { expect    } from '@playwright/test';    // What: Expect. Why: The check passes only when local storage holds nothing secret. How: This asserts on the keys and values it reads.
import { opeFixFun } from '../support/app.ts';   // What: Open Fixture Function. Why: Storage is read once the app has run on real data. How: This loads the backup on its fixed day.
import { selTabFun } from '../support/app.ts';   // What: Select Tab Function. Why: Every tab gets a chance to write what it keeps. How: This switches tabs through the navigation.
import { test      } from '@playwright/test';    // What: Test. Why: The storage check is its own test. How: This declares it.
import { watErrFun } from '../support/watch.ts'; // What: Watch Errors Function. Why: A page error during a check is a failure even when the check itself passes. How: This collects page and console errors.

// #endregion Imports



/**
 * storage.spec.ts = Storage Spec
 *
 * @summary
 * Checks that local storage keeps nothing secret, in whichever engine the
 * project runs. The app runs on the real-data backup through every tab, then
 * the page is told it's being hidden, so the app writes its warm mirror the
 * way it does when a visitor leaves. Every key left has to be one the app
 * documents in CLAUDE.md's "Where data lives" or one the Firebase SDK names
 * for itself, and no value may hold a token, a private key, or a password
 * field. The app keeps its data in IndexedDB and Firebase Auth keeps its
 * session in its own IndexedDB database, so local storage holds only the
 * mirror and the app's small flags.
 *
 * Sections:
 *  - Constants
 *  - Module Init
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const APP_KEY_ARR = [ // What: App Key Array. Why: Every key the app writes is documented, so an unknown one is a change to look at. How: Each entry is one documented local storage key.


	'easemylife.idbboots',         // What: IndexedDB Boots Key. Why: The boot sweep counts clean IndexedDB boots. How: This holds the count.
	'easemylife.mirrorat',         // What: Mirror At Key. Why: The app compares the mirror's age with IndexedDB's. How: This holds when the mirror was written.
	'easemylife.persistasked',     // What: Persist Asked Key. Why: The app asks for persistent storage only once. How: This records that it asked.
	'easemylife.signedin',         // What: Signed In Key. Why: Firebase loads at launch only on a device that signed in. How: This holds a flag, never a token.
	'easemylife.signinemail',      // What: Sign-In Email Key. Why: An emailed link finishes in the browser that asked for it. How: This holds the address until the link is used.
	'easemylife.snapshot.pre-idb', // What: Pre-IndexedDB Snapshot Key. Why: The first IndexedDB migration kept a rollback copy for a few boots. How: This holds that copy.
	'easemylife.syncmeta',         // What: Sync Meta Key. Why: Each sync compares against what this device last synced. How: This holds hashes, a revision, and the account's ID, never a token.
	'easemylife.v2'                // What: Warm Mirror Key. Why: A boot that can't open IndexedDB in time runs on this copy. How: This holds the state without its pick log.


];

const SEC_VAL_ARR = [ // What: Secret Value Array. Why: A token or key kept in local storage can be read by any script that runs on the page. How: Each entry matches one kind of secret value.


	/-----BEGIN [A-Z ]*PRIVATE KEY-----/,                        // What: Private Key Pattern. Why: A private key's text opens with this line. How: This matches it.
	/eyJ[0-9A-Za-z_-]{10,}\.[0-9A-Za-z_-]{10,}\.[0-9A-Za-z_-]+/, // What: Token Pattern. Why: Firebase's ID tokens are signed JSON web tokens, which open with eyJ. How: This matches a token's three dotted parts.
	/"(password|refreshToken|accessToken|idToken)"/              // What: Secret Field Pattern. Why: A saved sign-in or password field names itself. How: This matches one of those field names in JSON.


];

// #endregion Constants



// #region Module Init

test( 'local storage holds only the documented keys and no secret', async ( { page : curPagObj } ) => { // What: Storage Test. Why: Local storage is readable by any script on the page and survives sign-out, so nothing secret belongs there beyond what the sign-in library keeps. How: This runs the app through every tab, makes it write its mirror, then checks every key is documented and no value matches a secret pattern.


	const errMesArr = watErrFun( curPagObj ); // What: Error Message Array. Why: The run through the tabs fails on any page error. How: This starts watching.


	await opeFixFun( curPagObj ); // What: App Open Call. Why: The app writes its flags as it boots on real data. How: This opens the backup.


	for ( const tabIdeStr of [ 'picker', 'stats', 'data', 'settings' ] ) await selTabFun( curPagObj, tabIdeStr ); // What: Tab Walk Loop. Why: A tab could write something of its own. How: This visits every tab after Today.



	await curPagObj.evaluate( () => window.dispatchEvent( new Event( 'pagehide' ) ) ); // What: Page Hide Call. Why: The app writes its warm mirror as the page goes away. How: This sends the event it listens for.


	const stoEntArr = await curPagObj.evaluate( () => Object.entries( localStorage ) ); // What: Storage Entry Array. Why: Every key and value is checked. How: This reads local storage's pairs.


	expect( stoEntArr.map( ( [ stoKeyStr ] ) => stoKeyStr ).filter( ( stoKeyStr ) => !APP_KEY_ARR.includes( stoKeyStr ) && !stoKeyStr.startsWith( 'firebase:' ) ) ).toEqual( [] ); // What: Documented Keys Assertion. Why: An unknown key may hold something nobody reviewed. How: This lists every key that's neither the app's nor the Firebase SDK's own.
	expect( stoEntArr.filter( ( [ , stoValStr ] ) => SEC_VAL_ARR.some( ( secValReg ) => secValReg.test( stoValStr ) ) ).map( ( [ stoKeyStr ] ) => stoKeyStr ) ).toEqual( [] );     // What: No Secret Assertion. Why: No value should hold a token, a private key, or a password. How: This lists every key whose value matches a secret pattern.
	expect( stoEntArr.map( ( [ stoKeyStr ] ) => stoKeyStr ) ).toContain( 'easemylife.v2' );                                                                                        // What: Mirror Written Assertion. Why: The check means little unless the largest value, the mirror, was there to read. How: This checks the mirror was written.
	expect( errMesArr, errMesArr.join( '\n' ) ).toEqual( [] ); // What: Error Assertion. Why: A run that logged an error failed even if it finished. How: This expects no errors.


} );

// #endregion Module Init


