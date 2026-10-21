


// #region Imports

import { admAutFun   } from '../lib/admin-auth.mts'; // What: Admin Auth Function. Why: The webhook sets and clears the paid claim. How: This returns Firebase's admin auth service.
import { isaLivFun   } from '../lib/polar.mts';      // What: Is-A Live Function. Why: Production listens to live Polar and previews to the sandbox. How: This checks the deploy context.
import { ordUidFun   } from '../lib/polar.mts';      // What: Order User Identifier Function. Why: An order names its account through the checkout's tags. How: This reads them.
import { PRO_LIV_STR } from '../lib/polar.mts';      // What: Product Live String. Why: Only the sync product unlocks sync. How: This is the live product's id.
import { PRO_SAN_STR } from '../lib/polar.mts';      // What: Product Sandbox String. Why: Previews check the sandbox product. How: This is its id.
import { verWebFun   } from '../lib/polar.mts';      // What: Verify Webhook Function. Why: Only Polar may mark an account paid. How: This checks the signature.


import type { PolOrdTyp } from '../lib/polar.mts'; // What: Polar Order Type. Why: The webhook reads an order's fields. How: This types it.

// #endregion Imports



/**
 * polar-webhook.mts = Polar Webhook Function
 *
 * @summary
 * Receives Polar's order events and keeps each account's paid claim in step
 * with them. After checking the signature (anything unsigned or stale is
 * refused), an order.paid event for the sync product sets the claim, and an
 * order.refunded event that refunds the whole order clears it. The account
 * comes from the checkout's tags (ordUidFun), or else from the buyer's email,
 * so a purchase through a plain checkout link still unlocks the account the
 * buyer signs in with. An order whose account can't be found is logged and
 * acknowledged, so Polar doesn't retry it forever. Other events, and orders
 * for other products, are acknowledged and ignored.
 *
 * Setting the claim keeps any other claims the account has. The app picks
 * the change up when its token refreshes, which it forces on returning from
 * the checkout.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Types

type NetCotTyp = { deploy : { context : string } }; // What: Netlify Context Type. Why: The webhook reads which deploy it runs in. How: This types the one field of Netlify's context it uses.

// #endregion Types



// #region Helpers

// #region ordAccFun

/**
 * ordAccFun = Order Account Function
 *
 * @summary
 * Finds the Firebase account an order belongs to: the one its checkout
 * tagged it with, or the one whose email matches the buyer's.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param ordCurObj - Order Current Object: The webhook's order.
 *
 * @returns A promise that settles with the account's id, or null when no
 *          account matches.
 *
 * @example
 * ```ts
 * await ordAccFun(ordCurObj) // => 'k3j...'
 * ```
 *
*/

async function ordAccFun ( ordCurObj : PolOrdTyp ) : Promise< string | null > {


	const tagUidStr = ordUidFun( ordCurObj ); // What: Tagged User Identifier String. Why: A checkout from the app tags its account. How: This reads the tag.



	if ( tagUidStr ) return tagUidStr; // What: Tagged Guard. Why: The tag names the account directly. How: This returns it.



	const buyEmaStr = ordCurObj.customer?.email; // What: Buyer Email String. Why: An untagged order can still be matched by its email. How: This reads it.



	if ( !buyEmaStr ) return null; // What: No Email Guard. Why: Without a tag or an email, nothing names the account. How: This returns null.



	try { return ( await admAutFun().getUserByEmail( buyEmaStr ) ).uid; } // What: Email Lookup Try. Why: The buyer may have an account under that email. How: This looks it up.

	catch { return null; } // What: Email Lookup Catch. Why: No account has that email yet. How: This returns null.


}

// #endregion ordAccFun



// #region webSerFun

/**
 * webSerFun = Webhook Serve Function
 *
 * @summary
 * Handles one webhook (see the file summary). It answers 405 for anything
 * but a POST, 503 when this deploy has no webhook secret, 403 for a bad
 * signature, 202 for an event it acknowledges without acting on, and 200
 * once the claim is set or cleared.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param reqCurObj - Request Current Object: Polar's request.
 * @param netCotObj - Netlify Context Object: Netlify's details of the
 *                    deploy running the function.
 *
 * @returns A promise that settles with the response.
 *
 * @example
 * ```ts
 * await webSerFun(reqCurObj, netCotObj) // => Response
 * ```
 *
*/

async function webSerFun ( reqCurObj : Request, netCotObj : NetCotTyp ) : Promise< Response > {


	if ( reqCurObj.method !== 'POST' ) return new Response( 'Use POST.', { status : 405 } ); // What: Method Guard. Why: Polar only posts. How: This refuses any other method.



	const webSecStr = process.env.POLAR_WEBHOOK_SECRET; // What: Webhook Secret String. Why: Signatures are checked against this deploy's secret. How: This reads it.



	if ( !webSecStr ) return new Response( 'Webhook not set up.', { status : 503 } ); // What: Setup Guard. Why: Without a secret, nothing can be trusted. How: This refuses.



	const bodTexStr = await reqCurObj.text(); // What: Body Text String. Why: The signature covers the exact text. How: This reads it before parsing.



	const verFaiStr = verWebFun( bodTexStr, reqCurObj.headers, webSecStr ); // What: Verify Failure String. Why: Only Polar may change an account's claim. How: This checks the signature, giving the reason it failed or null.



	if ( verFaiStr ) { // What: Signature Check. Why: A refused webhook should say why, in Polar's delivery log and Netlify's. How: This logs the reason with the secret's length, never the secret, and refuses.


		console.warn( `Webhook refused: ${ verFaiStr } (secret length ${ webSecStr.length })` ); // What: Refusal Log. Why: The length helps spot a wrong or padded secret without exposing it. How: This logs the reason and length.



		return new Response( `Webhook refused: ${ verFaiStr }.`, { status : 403 } ); // What: Refusal Return. Why: Polar shows the reply in its delivery log. How: This answers 403 with the reason.


	}



	const webEveObj : { data : PolOrdTyp, type : string } = JSON.parse( bodTexStr );               // What: Webhook Event Object. Why: The event's type and order decide what happens. How: This parses the body.
	const proIdeStr = isaLivFun( netCotObj.deploy.context ) ? PRO_LIV_STR : PRO_SAN_STR;           // What: Product Identifier String. Why: Only the sync product unlocks sync. How: This picks this deploy's product.
	const paiNowBoo = webEveObj.type === 'order.paid';                                             // What: Paid Now Boolean. Why: A payment sets the claim. How: This is true for order.paid.
	const proMatBoo = ( webEveObj.data.product_id || webEveObj.data.product?.id ) === proIdeStr;   // What: Product Match Boolean. Why: Only the sync product unlocks sync. How: This compares the order's product, read from either of the fields Polar sends it in.
	const refAllBoo = webEveObj.type === 'order.refunded' && webEveObj.data.status === 'refunded'; // What: Refunded All Boolean. Why: Only a full refund takes sync away. How: This is true for a refund that left the order fully refunded.



	if ( paiNowBoo && !proMatBoo ) console.warn( `Polar order ${ webEveObj.data.id } is for another product` ); // What: Product Mismatch Log. Why: A paid order that unlocks nothing is worth noticing, in case its product was misread. How: This logs the order's id.



	if ( ( !paiNowBoo && !refAllBoo ) || !proMatBoo ) return new Response( null, { status : 202 } ); // What: Ignored Event Guard. Why: Other events and products change nothing. How: This acknowledges them.



	const accUidStr = await ordAccFun( webEveObj.data ); // What: Account User Identifier String. Why: The claim belongs on the buyer's account. How: This finds it.



	if ( !accUidStr ) { // What: No Account Check. Why: A purchase whose account can't be found needs a person's attention, not endless retries. How: This logs the order and acknowledges it.


		console.warn( `No Firebase account for Polar order ${ webEveObj.data.id }` ); // What: Unmatched Log. Why: The order can be matched by hand from the log. How: This logs its id.



		return new Response( null, { status : 202 } ); // What: Unmatched Return. Why: Polar should stop retrying. How: This acknowledges it.


	}



	const admAutObj = admAutFun();                          // What: Admin Auth Object. Why: The claim is set through it. How: This gets the service.
	const accRcdObj = await admAutObj.getUser( accUidStr ); // What: Account Record Object. Why: Other claims must survive. How: This reads the account's current claims.



	await admAutObj.setCustomUserClaims( accUidStr, { ...accRcdObj.customClaims, paid : paiNowBoo } ); // What: Claim Write Call. Why: The paid claim follows the order. How: This sets it true on payment and false on a full refund, keeping other claims.



	return new Response( null, { status : 200 } ); // What: Done Return. Why: Polar should know it landed. How: This answers 200.


}

// #endregion webSerFun

// #endregion Helpers



// #region Exports

export default webSerFun; // What: Default Export. Why: Netlify runs a function file's default export. How: This exports webSerFun as the handler.

// #endregion Exports


