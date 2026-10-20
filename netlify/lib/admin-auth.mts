


// #region Imports

import { cert          } from 'firebase-admin/app';  // What: Cert. Why: The real project is reached with the service account's key. How: This builds the credential from it.
import { getApps       } from 'firebase-admin/app';  // What: Get Apps. Why: A warm function instance must not initialize twice. How: This lists the apps already set up.
import { getAuth       } from 'firebase-admin/auth'; // What: Get Auth. Why: The functions verify sign-ins and set the paid claim. How: This returns the admin auth service.
import { initializeApp } from 'firebase-admin/app';  // What: Initialize App. Why: Admin calls need an app. How: This creates it.


import type { Auth } from 'firebase-admin/auth'; // What: Auth. Why: Callers use the admin auth service. How: This types it.

// #endregion Imports



/**
 * admin-auth.mts = Admin Auth
 *
 * @summary
 * Gives the Netlify Functions Firebase's admin auth service, which verifies
 * a signed-in person's ID token and sets the paid claim that the Firestore
 * rules and the app read. On Netlify it signs in to the real project with
 * the service account's email and private key, kept in the
 * FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY secrets. The key is stored
 * with its line breaks written as \n, so they're turned back into real line
 * breaks first. When FIREBASE_AUTH_EMULATOR_HOST is set, which only the
 * tests do, it talks to the local auth emulator under the demo project and
 * needs no key at all.
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

const EMU_PRO_STR = 'demo-ease-my-life';  // What: Emulator Project String. Why: The emulator serves the demo project the app also uses in tests. How: This is its id.
const LIV_PRO_STR = 'ease-my-life-4ce18'; // What: Live Project String. Why: Production signs in to the real project. How: This is its id.

// #endregion Constants



// #region Helpers

// #region admAutFun

/**
 * admAutFun = Admin Auth Function
 *
 * @summary
 * Returns the admin auth service, setting up the admin app the first time a
 * function instance asks (see the file summary for how it signs in). It
 * throws when the key's secrets are missing, so a function reports a setup
 * problem rather than failing later in a confusing way.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns The admin auth service.
 *
 * @example
 * ```ts
 * admAutFun().verifyIdToken(idTokStr) // => Promise<DecodedIdToken>
 * ```
 *
*/

function admAutFun () : Auth {


	if ( getApps().length ) return getAuth(); // What: Warm Instance Guard. Why: The app is set up once per instance. How: This returns the existing service.



	if ( process.env.FIREBASE_AUTH_EMULATOR_HOST ) { // What: Emulator Check. Why: Tests use the local emulator, which needs no key. How: This sets up the demo project and returns its service.


		initializeApp( { projectId : EMU_PRO_STR } ); // What: Emulator App Setup. Why: The emulator serves the demo project. How: This names it.



		return getAuth(); // What: Emulator Auth Return. Why: The caller uses the emulator's service. How: This returns it.


	}



	const cliEmaStr = process.env.FIREBASE_CLIENT_EMAIL; // What: Client Email String. Why: The service account signs in by its email. How: This reads the secret.
	const priKeyStr = process.env.FIREBASE_PRIVATE_KEY;  // What: Private Key String. Why: The service account proves itself with its key. How: This reads the secret.



	if ( !cliEmaStr || !priKeyStr ) throw new Error( 'FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY must be set.' ); // What: Missing Key Guard. Why: A function without the key can't do anything useful. How: This throws a clear setup error.



	initializeApp({ // What: Live App Setup. Why: Production reaches the real project. How: This signs in with the service account's key.


		projectId : LIV_PRO_STR, // What: Project Identifier. Why: The app names the project it works on. How: This is the real project's id.

		credential : cert({ // What: Credential. Why: The service account proves it may administer the project. How: This builds it from the two secrets.


			clientEmail : cliEmaStr,                         // What: Client Email. Why: The account is named by its email. How: This is the secret.
			privateKey  : priKeyStr.replace( /\\n/g, '\n' ), // What: Private Key. Why: The key's line breaks are stored as \n. How: This turns them back into real line breaks.
			projectId   : LIV_PRO_STR                        // What: Project Identifier. Why: The key belongs to this project. How: This is its id.


		})


	});



	return getAuth(); // What: Auth Return. Why: The caller uses the service. How: This returns it.


}

// #endregion admAutFun

// #endregion Helpers



// #region Exports

export { admAutFun }; // What: Named Export. Why: Both functions reach Firebase through it. How: This exports admAutFun by name.

// #endregion Exports


