


// #region Imports

import { createHmac      } from 'node:crypto'; // What: Create HMAC. Why: Polar signs every webhook with a shared secret. How: This computes the expected signature.
import { timingSafeEqual } from 'node:crypto'; // What: Timing Safe Equal. Why: A signature compared byte by byte at varying speed can leak it. How: This compares in constant time.

// #endregion Imports



/**
 * polar.mts = Polar
 *
 * @summary
 * What the Netlify Functions need to know about Polar, which sells the paid
 * sync upgrade. The production site talks to live Polar and every other
 * deploy (a preview, a branch) to Polar's sandbox, so a preview can never
 * charge anyone. Each has its own product, API address, and secrets.
 *
 * Polar signs each webhook the Standard Webhooks way: an HMAC-SHA256 of the
 * message id, its timestamp, and its body, keyed by the endpoint's secret,
 * sent base64-encoded in the webhook-signature header. A webhook whose
 * signature doesn't match, or whose timestamp is more than five minutes
 * off, is refused, so nobody else can mark an account as paid.
 *
 * Sections:
 *  - Types
 *  - Constants
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Types

type PolOrdTyp = { customer? : { email? : string, external_id? : string | null }, id : string, metadata? : Record< string, unknown >, product? : { id? : string }, product_id? : string, status? : string }; // What: Polar Order Type. Why: The webhook reads only a few fields of an order. How: This types those, each optional the way Polar may leave them out.

// #endregion Types



// #region Constants

const API_LIV_STR = 'https://api.polar.sh';                 // What: API Live String. Why: Production checkouts are created on live Polar. How: This is its API address.
const API_SAN_STR = 'https://sandbox-api.polar.sh';         // What: API Sandbox String. Why: Previews create checkouts in Polar's sandbox. How: This is its API address.
const PRO_LIV_STR = '84f9df3f-576a-49be-a989-f7a75fb6b91e'; // What: Product Live String. Why: Production sells the live Ease My Life Sync product. How: This is its id.
const PRO_SAN_STR = '16fd9863-be3a-4968-8423-53002acaba2f'; // What: Product Sandbox String. Why: Previews sell the sandbox copy of the product. How: This is its id.
const TIM_TOL_NUM = 300;                                    // What: Time Tolerance Number. Why: A replayed old webhook must be refused. How: This allows five minutes, in seconds, between Polar's timestamp and now.

// #endregion Constants



// #region Helpers

const isaLivFun = ( depCotStr : string ) => depCotStr === 'production'; // What: Is-A Live Function. Why: Only the production site talks to live Polar. How: This is true for Netlify's production deploy context.



// #region verWebFun

/**
 * verWebFun = Verify Webhook Function
 *
 * @summary
 * Checks a webhook's signature and timestamp the Standard Webhooks way (see
 * the file summary). Polar's secret is used as is, as the HMAC key's bytes,
 * the same as Polar's own SDK does. The signature header can list several
 * signatures (during a secret rotation), and any one matching is enough.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param bodTexStr - Body Text String: The request body, exactly as received.
 * @param reqHeaObj - Request Headers Object: The request's headers.
 * @param webSecStr - Webhook Secret String: The endpoint's signing secret.
 * @param nowSecNum - Now Seconds Number: The current time in seconds,
 *                    defaulting to the clock, which tests can replace.
 *
 * @returns Whether the webhook is genuine and fresh.
 *
 * @example
 * ```ts
 * verWebFun(bodTexStr, reqCurObj.headers, webSecStr) // => true
 * ```
 *
*/

function verWebFun ( bodTexStr : string, reqHeaObj : Headers, webSecStr : string, nowSecNum : number = Math.floor( Date.now() / 1000 ) ) : boolean {


	const msgIdeStr = reqHeaObj.get( 'webhook-id' );        // What: Message Identifier String. Why: The id is part of what's signed. How: This reads its header.
	const msgSigStr = reqHeaObj.get( 'webhook-signature' ); // What: Message Signature String. Why: The signatures to check. How: This reads their header.
	const msgTimStr = reqHeaObj.get( 'webhook-timestamp' ); // What: Message Timestamp String. Why: The time is signed and checked for freshness. How: This reads its header.



	if ( !msgIdeStr || !msgSigStr || !msgTimStr ) return false; // What: Missing Header Guard. Why: An unsigned request isn't from Polar. How: This refuses it.



	if ( Math.abs( nowSecNum - Number( msgTimStr ) ) > TIM_TOL_NUM ) return false; // What: Stale Timestamp Guard. Why: An old webhook could be replayed. How: This refuses one more than five minutes off.



	const expSigBuf = createHmac( 'sha256', Buffer.from( webSecStr, 'utf8' ) ).update( `${ msgIdeStr }.${ msgTimStr }.${ bodTexStr }` ).digest(); // What: Expected Signature Buffer. Why: A genuine webhook's signature matches this. How: This signs the id, timestamp, and body with the secret.



	return msgSigStr.split( ' ' ).some( ( sigEntStr ) => { // What: Signature Match Return. Why: Any listed signature matching proves the webhook genuine. How: This compares each one in constant time.


		const sigValBuf = Buffer.from( sigEntStr.split( ',' )[ 1 ] || '', 'base64' ); // What: Signature Value Buffer. Why: Each entry is a version, a comma, and the base64 signature. How: This decodes the signature part.



		return sigValBuf.length === expSigBuf.length && timingSafeEqual( sigValBuf, expSigBuf ); // What: Entry Match Return. Why: Lengths must match before a constant-time compare. How: This checks both.


	} );


}

// #endregion verWebFun



// #region ordUidFun

/**
 * ordUidFun = Order User Identifier Function
 *
 * @summary
 * Reads which Firebase account an order belongs to, from what the checkout
 * function attached: the customer's external id, or the order's
 * firebaseUid metadata. It returns null for an order made some other way
 * (a checkout link), whose account the webhook then looks up by email.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param ordCurObj - Order Current Object: The webhook's order.
 *
 * @returns The account's id, or null.
 *
 * @example
 * ```ts
 * ordUidFun(ordCurObj) // => 'k3j...'
 * ```
 *
*/

function ordUidFun ( ordCurObj : PolOrdTyp ) : string | null {


	const extIdeStr = ordCurObj.customer?.external_id; // What: External Identifier String. Why: The checkout tags its customer with the account's id. How: This reads it.
	const metUidAny = ordCurObj.metadata?.firebaseUid; // What: Metadata User Identifier Any. Why: The checkout also copies the id into the order's metadata. How: This reads it.



	return extIdeStr || ( typeof metUidAny === 'string' && metUidAny ) || null; // What: Identifier Return. Why: Either tag names the account. How: This returns the first present, or null.


}

// #endregion ordUidFun

// #endregion Helpers



// #region Exports

export { API_LIV_STR, API_SAN_STR, isaLivFun, ordUidFun, type PolOrdTyp, PRO_LIV_STR, PRO_SAN_STR, verWebFun }; // What: Named Exports. Why: The checkout and webhook functions share Polar's addresses, products, and checks. How: This exports them by name.

// #endregion Exports


