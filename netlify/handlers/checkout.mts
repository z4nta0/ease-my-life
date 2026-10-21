


// #region Imports

import { admAutFun   } from '../lib/admin-auth.mts'; // What: Admin Auth Function. Why: Only a verified sign-in may start a checkout. How: This verifies the caller's token.
import { API_LIV_STR } from '../lib/polar.mts';      // What: API Live String. Why: Production checkouts are created on live Polar. How: This is its address.
import { API_SAN_STR } from '../lib/polar.mts';      // What: API Sandbox String. Why: Preview checkouts are created in the sandbox. How: This is its address.
import { isaLivFun   } from '../lib/polar.mts';      // What: Is-A Live Function. Why: Only production uses live Polar. How: This checks the deploy context.
import { PRO_LIV_STR } from '../lib/polar.mts';      // What: Product Live String. Why: Production sells the live product. How: This is its id.
import { PRO_SAN_STR } from '../lib/polar.mts';      // What: Product Sandbox String. Why: Previews sell the sandbox product. How: This is its id.

// #endregion Imports



/**
 * checkout.mts = Checkout Function
 *
 * @summary
 * Starts a purchase of the paid sync upgrade. The app posts here with the
 * signed-in person's Firebase ID token, which this function verifies (and
 * requires a verified email, as the Firestore rules do), then asks Polar
 * for a checkout of the sync product tagged with the account's id, as the
 * customer's external id and in the checkout's metadata, with the email
 * filled in. The app sends the person to the checkout's address, and
 * Polar's webhook (polar-webhook.mts) unlocks the account once paid. The
 * production site uses live Polar and every other deploy the sandbox, and a
 * deploy whose token or product isn't set up says so instead of failing.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Types

type NetCotTyp = { deploy : { context : string } }; // What: Netlify Context Type. Why: The function reads which deploy it runs in. How: This types the one field of Netlify's context it uses.

// #endregion Types



// #region Helpers

const errResFun = ( errMesStr : string, staCodNum : number ) => Response.json( { error : errMesStr }, { status : staCodNum } ); // What: Error Response Function. Why: Every failure answers the same way, with a sentence the app can show. How: This returns it as JSON with the status.



// #region cheSerFun

/**
 * cheSerFun = Checkout Serve Function
 *
 * @summary
 * Handles one request (see the file summary). It answers 405 for anything
 * but a POST, 401 for a missing or invalid token, 403 for an unverified
 * email, 503 when this deploy has no Polar token or product, 502 when Polar
 * refuses, and otherwise 200 with the checkout's address as { url }.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param reqCurObj - Request Current Object: The app's request.
 * @param netCotObj - Netlify Context Object: Netlify's details of the
 *                    deploy running the function.
 *
 * @returns A promise that settles with the response.
 *
 * @example
 * ```ts
 * await cheSerFun(reqCurObj, netCotObj) // => Response { url }
 * ```
 *
*/

async function cheSerFun ( reqCurObj : Request, netCotObj : NetCotTyp ) : Promise< Response > {


	if ( reqCurObj.method !== 'POST' ) return errResFun( 'Use POST.', 405 ); // What: Method Guard. Why: A checkout is only started on purpose. How: This refuses any other method.



	const ideTokStr = ( reqCurObj.headers.get( 'authorization' ) || '' ).replace( /^Bearer\s*/i, '' ).trim(); // What: Identity Token String. Why: The caller proves who they are with their Firebase token. How: This reads it from the Authorization header.



	if ( !ideTokStr ) return errResFun( 'Sign in first.', 401 ); // What: Missing Token Guard. Why: Only a signed-in person can buy. How: This refuses a request without a token.



	let decTokObj; // What: Decoded Token Object. Why: The account's id and email come from the verified token. How: The try below sets it.



	try { decTokObj = await admAutFun().verifyIdToken( ideTokStr ); } // What: Token Verify Try. Why: A forged or expired token must not start a checkout. How: This verifies it with Firebase.

	catch ( errCatObj ) { // What: Token Verify Catch. Why: The caller needs to sign in again. How: This logs and refuses.


		console.warn( errCatObj ); // What: Failure Log. Why: A bad token is worth seeing in the function's log. How: This logs it.



		return errResFun( 'Your sign-in has expired. Sign in again.', 401 ); // What: Expired Return. Why: Signing in again fixes it. How: This says so.


	}



	if ( !decTokObj.email_verified || !decTokObj.email ) return errResFun( 'Your email address needs to be verified first.', 403 ); // What: Unverified Email Guard. Why: The Firestore rules need a verified email to sync, so buying without one would unlock nothing. How: This refuses.



	const isaLivBoo = isaLivFun( netCotObj.deploy.context ); // What: Is-A Live Boolean. Why: Only production uses live Polar. How: This checks the deploy context.
	const polTokStr = process.env.POLAR_ACCESS_TOKEN;        // What: Polar Token String. Why: Polar's API needs the organization's token. How: This reads the deploy's secret.
	const proIdeStr = isaLivBoo ? PRO_LIV_STR : PRO_SAN_STR; // What: Product Identifier String. Why: Each Polar has its own copy of the product. How: This picks this deploy's.



	if ( !polTokStr || !proIdeStr ) return errResFun( "Checkout isn't set up on this version of the site yet.", 503 ); // What: Setup Guard. Why: A preview without the sandbox set up can't sell anything. How: This says so.



	const polResObj = await fetch( `${ isaLivBoo ? API_LIV_STR : API_SAN_STR }/v1/checkouts/`, { // What: Polar Response Object. Why: Polar creates the checkout. How: This posts the product, the account's tags, the email, and where to return.


		method : 'POST', // What: Method. Why: Creating a checkout is a POST. How: This sets it.

		body : JSON.stringify({ // What: Body. Why: Polar reads the checkout's details as JSON. How: This serializes them.


			customer_email       : decTokObj.email,                                      // What: Customer Email. Why: The buyer shouldn't retype it. How: This fills it in from the account.
			external_customer_id : decTokObj.uid,                                        // What: External Customer Identifier. Why: The webhook finds the account by it. How: This is the account's id.
			metadata             : { firebaseUid : decTokObj.uid },                      // What: Metadata. Why: The order keeps the account's id even if the customer record changes. How: This copies it in.
			products             : [ proIdeStr ],                                        // What: Products. Why: The checkout sells the sync product. How: This lists it.
			success_url          : `${ new URL( reqCurObj.url ).origin }/?purchase=sync` // What: Success URL. Why: The buyer returns to the app, which then picks up the paid claim. How: This is the site's own address, marked as a purchase.


		}),

		headers : { // What: Headers. Why: Polar needs the token and the body's type. How: This sets both.


			'Authorization' : `Bearer ${ polTokStr }`, // What: Authorization. Why: Polar's API needs the organization's token. How: This sends it as a bearer token.
			'Content-Type'  : 'application/json'       // What: Content Type. Why: The body is JSON. How: This says so.


		}


	} );



	if ( !polResObj.ok ) { // What: Polar Failure Check. Why: Polar refusing is worth logging and explaining. How: This logs Polar's reply and answers 502.


		console.warn( await polResObj.text() ); // What: Failure Log. Why: Polar's reply says what was wrong. How: This logs it.



		return errResFun( "The checkout couldn't be started. Try again in a moment.", 502 ); // What: Failure Return. Why: A moment later usually works. How: This says so.


	}



	const cheSesObj = await polResObj.json() as { url : string }; // What: Checkout Session Object. Why: Polar returns the checkout's address. How: This parses its reply. // What: Type Assertion Note. Why: A successful checkout creation always returns the checkout with its url. How: The as types the parsed reply.



	return Response.json( { url : cheSesObj.url } ); // What: Checkout Return. Why: The app sends the buyer there. How: This returns the address.


}

// #endregion cheSerFun

// #endregion Helpers



// #region Exports

export default cheSerFun; // What: Default Export. Why: Netlify runs a function file's default export. How: This exports cheSerFun as the handler.

// #endregion Exports


