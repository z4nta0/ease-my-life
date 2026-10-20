


// #region Imports

import { connectAuthEmulator      } from 'firebase/auth';      // What: Connect Auth Emulator. Why: Tests sign in against the local emulator, never the real project. How: This points the auth instance at it.
import { connectFirestoreEmulator } from 'firebase/firestore'; // What: Connect Firestore Emulator. Why: Tests read and write the local emulator's database. How: This points Firestore at it.
import { getAuth                  } from 'firebase/auth';      // What: Get Auth. Why: Every sign-in call needs the project's auth instance. How: This creates it, remembering the session in IndexedDB.
import { GoogleAuthProvider       } from 'firebase/auth';      // What: Google Auth Provider. Why: Google is one of the two ways to sign in. How: This names it for the pop-up.
import { initializeApp            } from 'firebase/app';       // What: Initialize App. Why: Auth and Firestore both hang off one app instance. How: This creates it from the project's config.
import { initializeFirestore      } from 'firebase/firestore'; // What: Initialize Firestore. Why: The cloud copy lives in Firestore. How: This creates the database instance.
import { isSignInWithEmailLink    } from 'firebase/auth';      // What: Is Sign In With Email Link. Why: The app has to notice when it was opened from a sign-in email. How: This checks an address for the link's code.
import { onIdTokenChanged         } from 'firebase/auth';      // What: On ID Token Changed. Why: The app follows sign-ins, sign-outs, and a token gaining the paid claim. How: This calls back on each.
import { sendSignInLinkToEmail    } from 'firebase/auth';      // What: Send Sign In Link To Email. Why: Email sign-in works without a password. How: This emails a one-time link.
import { signInWithEmailLink      } from 'firebase/auth';      // What: Sign In With Email Link. Why: Opening the emailed link finishes signing in. How: This signs in with its code.
import { signInWithPopup          } from 'firebase/auth';      // What: Sign In With Popup. Why: Google sign-in runs in its own window. How: This opens it and waits.
import { signOut                  } from 'firebase/auth';      // What: Sign Out. Why: A device can leave its account. How: This ends the session.


// #endregion Imports



/**
 * firebase.ts = Firebase Services
 *
 * @summary
 * Connects to the Firebase project behind paid sync: its sign-in, with
 * Google or an emailed link, and the Firestore database holding each
 * account's cloud copy. The app imports this file only when someone signs in
 * or already has, so the Firebase SDK never loads for anyone else. The
 * config values below are public by design (every visitor's browser
 * receives them), and Firestore's security rules are what keep each
 * account's copy to its owner. A build with VITE_FIREBASE_EMULATOR set talks
 * to the local Firebase Emulator instead of the real project, which is how
 * the tests run.
 *
 * Sections:
 *  - Types
 *  - Constants
 *  - Module Init
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Types

type AccUseTyp = { emaStr : string | null, paiBoo : boolean, uidStr : string }; // What: Account User Type. Why: The app only needs to know who is signed in and whether they've paid. How: This holds the email, the paid claim, and the account's id.

// #endregion Types



// #region Constants

const EMU_HOS_STR = import.meta.env.VITE_FIREBASE_EMULATOR; // What: Emulator Host String. Why: Tests must never touch the real project. How: This is the emulator's host when the build sets one, undefined otherwise.
const EMU_PRO_STR = 'demo-ease-my-life';                    // What: Emulator Project String. Why: The emulator serves a demo project, which can never reach a real one. How: This is its id, whose demo- prefix the emulator requires for that.

const FIR_CON_OBJ = { // What: Firebase Config Object. Why: The SDK has to know which project to connect to. How: These are the project's public web app settings.


	apiKey            : 'AIzaSyDcRI6zFAKRTHPRKIOiLPirzlKqZ9XYftA',     // What: API Key. Why: It identifies the project to Google's servers, and grants nothing by itself. How: This is the web app's key.
	appId             : '1:609730787836:web:b72ce37d2aa361aa869a79', // What: App Identifier. Why: It names this web app within the project. How: This is its id.
	authDomain        : 'ease-my-life-4ce18.firebaseapp.com',        // What: Auth Domain. Why: Google sign-in's pop-up runs on a page Firebase serves there. How: This is the project's own domain.
	messagingSenderId : '609730787836',                              // What: Messaging Sender Identifier. Why: The config always carries it, though nothing here sends messages. How: This is the project's number.
	projectId         : 'ease-my-life-4ce18',                        // What: Project Identifier. Why: Firestore and auth address the project by it. How: This is its id.
	storageBucket     : 'ease-my-life-4ce18.firebasestorage.app'     // What: Storage Bucket. Why: The config always carries it, though nothing here stores files. How: This is the project's bucket name.


};

// #endregion Constants



// #region Module Init

const firAppObj = initializeApp( EMU_HOS_STR ? { ...FIR_CON_OBJ, projectId : EMU_PRO_STR } : FIR_CON_OBJ ); // What: Firebase App Object. Why: Auth and Firestore share it. How: This creates it, under the demo project when testing.
const firAutObj = getAuth( firAppObj );                                                                     // What: Firebase Auth Object. Why: Every sign-in call goes through it. How: This creates it.
const firStoObj = initializeFirestore( firAppObj, {} );                                                     // What: Firebase Store Object. Why: The cloud backend reads and writes through it. How: This creates it with the default memory cache, since this device's own storage already holds the state.



if ( EMU_HOS_STR ) { // What: Emulator Check. Why: Tests run against the local emulator. How: This connects both services to it when the build names a host.


	connectAuthEmulator( firAutObj, `http://${ EMU_HOS_STR }:9099`, { disableWarnings : true } ); // What: Auth Emulator Connect. Why: Test sign-ins stay local. How: This uses the emulator's default auth port, and hides its banner.

	connectFirestoreEmulator( firStoObj, EMU_HOS_STR, 8080 ); // What: Firestore Emulator Connect. Why: Test data stays local. How: This uses the emulator's default Firestore port.


}

// #endregion Module Init



// #region Helpers

const finLinFun = ( emaAdrStr : string, linUrlStr : string ) => signInWithEmailLink( firAutObj, emaAdrStr, linUrlStr ); // What: Finish Link Function. Why: Opening the emailed link finishes signing in, given the address it was sent to. How: This signs in with the link's code.
const isaLinFun = ( linUrlStr : string ) => isSignInWithEmailLink( firAutObj, linUrlStr );                           // What: Is-A Link Function. Why: The app has to notice it was opened from a sign-in email. How: This checks the address for the link's code.
const sigGooFun = () => signInWithPopup( firAutObj, new GoogleAuthProvider() );                                       // What: Sign Google Function. Why: Google is one way to sign in. How: This opens Google's sign-in window and waits.
const sigOutFun = () => signOut( firAutObj );                                                                          // What: Sign Out Function. Why: A device can leave its account. How: This ends the session.



// #region refTokFun

/**
 * refTokFun = Refresh Token Function
 *
 * @summary
 * Fetches a fresh ID token for the signed-in account, so a purchase made a
 * moment ago shows up: the paid claim is set on the server, and the device's
 * cached token doesn't carry it until it's refreshed. watUseFun's callback
 * runs again once the new token arrives.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns A promise that settles once the token is refreshed, with no
 *          value, or at once when nobody is signed in.
 *
 * @example
 * ```ts
 * await refTokFun() // => Promise<void>
 * ```
 *
*/

async function refTokFun () : Promise< void > {


	if ( firAutObj.currentUser ) await firAutObj.currentUser.getIdToken( true ); // What: Forced Refresh Call. Why: Only a fresh token carries a newly set claim. How: This forces one when someone is signed in.


}

// #endregion refTokFun



// #region senLinFun

/**
 * senLinFun = Send Link Function
 *
 * @summary
 * Emails a one-time sign-in link to an address. Opening it brings the
 * person back to this app's address, where isaLinFun spots the link and
 * finLinFun finishes signing in with the same address, which the caller
 * has to remember until then.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param emaAdrStr - Email Address String: The address to send the link to.
 * @param retUrlStr - Return URL String: The app's address, where the link
 *                    leads back to.
 *
 * @returns A promise that settles once the email is sent, with no value.
 *
 * @example
 * ```ts
 * await senLinFun('you@example.com', 'https://easemylife.app/') // => Promise<void>
 * ```
 *
*/

function senLinFun ( emaAdrStr : string, retUrlStr : string ) : Promise< void > {



	return sendSignInLinkToEmail( firAutObj, emaAdrStr, { handleCodeInApp : true, url : retUrlStr } ); // What: Link Send Return. Why: The link has to come back to this app to finish. How: This sends it with the return address, marked as handled by the app.


}

// #endregion senLinFun



// #region watUseFun

/**
 * watUseFun = Watch User Function
 *
 * @summary
 * Calls back with the signed-in account whenever it changes: on sign-in, on
 * sign-out (with null), and whenever its ID token is renewed, which is when
 * a newly set paid claim arrives. An account counts as paid only when its
 * token carries the paid claim, which only the payment webhook can set.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param useCalFun - User Callback Function: Receives the account, or null.
 *
 * @returns The function that stops watching.
 *
 * @example
 * ```ts
 * const stoWatFun = watUseFun((accUseObj) => ...) // => () => void
 * ```
 *
*/

function watUseFun ( useCalFun : ( accUseObj : AccUseTyp | null ) => void ) : () => void {



	return onIdTokenChanged( firAutObj, async ( firUseObj ) => { // What: Token Watch Return. Why: The paid claim lives in the token, so a token change is the moment to report. How: This reads each new token's claims and calls back.


		if ( !firUseObj ) { useCalFun( null ); return; } // What: Signed Out Guard. Why: Nobody is signed in. How: This reports null.



		const tokResObj = await firUseObj.getIdTokenResult(); // What: Token Result Object. Why: The paid claim is read from the token. How: This decodes the current token.


		useCalFun({ // What: Account Report Call. Why: The caller follows the account. How: This reports its email, paid claim, and id.


			emaStr : firUseObj.email,                // What: Email String. Why: The account screen shows who is signed in. How: This is the account's address, null for none.
			paiBoo : tokResObj.claims.paid === true, // What: Paid Boolean. Why: Only a paid account syncs. How: This is true when the token carries the paid claim.
			uidStr : firUseObj.uid                   // What: User Identifier String. Why: The cloud copy is stored under it. How: This is the account's id.


		});


	} );


}

// #endregion watUseFun

// #endregion Helpers



// #region Exports

export { type AccUseTyp, finLinFun, firStoObj, isaLinFun, refTokFun, senLinFun, sigGooFun, sigOutFun, watUseFun }; // What: Named Exports. Why: The account screen signs in and out through these, and the cloud backend uses firStoObj. How: This exports them by name.

// #endregion Exports


