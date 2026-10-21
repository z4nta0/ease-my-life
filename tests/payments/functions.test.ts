


// #region Imports

import assert    from 'node:assert/strict';                       // What: Assert. Why: Every case checks a response or a claim. How: This makes strict assertions.
import cheSerFun from '../../netlify/handlers/checkout.mts';      // What: Checkout Serve Function. Why: The checkout function is tested directly. How: This is its handler.
import webSerFun from '../../netlify/handlers/polar-webhook.mts'; // What: Webhook Serve Function. Why: The webhook function is tested directly. How: This is its handler.


import { before      } from 'node:test';                   // What: Before. Why: The handlers' setup is set once for every case. How: This runs it first.
import { createHmac  } from 'node:crypto';                 // What: Create HMAC. Why: Test webhooks are signed the way Polar signs them. How: This computes their signatures.
import { PRO_LIV_STR } from '../../netlify/lib/polar.mts'; // What: Product Live String. Why: Test orders are for the sync product. How: This is its id.
import { PRO_SAN_STR } from '../../netlify/lib/polar.mts'; // What: Product Sandbox String. Why: A preview's checkout sells the sandbox product. How: This is its id.
import { test        } from 'node:test';                   // What: Test. Why: Each case is its own test. How: This declares them.

// #endregion Imports



/**
 * functions.spec.ts = Payment Functions Spec
 *
 * @summary
 * Checks the two Netlify Functions behind the paid sync purchase, in Node's
 * own test runner (Playwright's loader can't load firebase-admin), against
 * the local auth emulator that npm run test:payments starts around the
 * suite. Each handler is called directly with a Request and a stand-in
 * for Netlify's context. The webhook must set the paid claim only for a
 * correctly signed, fresh order.paid of the sync product, find an untagged
 * order's account by email, clear the claim only on a full refund, and keep
 * other claims. The checkout must refuse a missing or unverified sign-in,
 * report a deploy without its setup, and send Polar the account's tags,
 * with Polar's API stubbed out so no real checkout is made.
 *
 * Sections:
 *  - Constants
 *  - Helpers
 *  - Module Init
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const AUT_EMU_STR = 'http://127.0.0.1:9099';                     // What: Auth Emulator String. Why: Admin calls reach the auth emulator. How: This is its address.
const EMU_PRO_STR = 'demo-ease-my-life';                         // What: Emulator Project String. Why: Admin calls name the project. How: This is the demo project.
const LIV_COT_OBJ = { deploy : { context : 'production' } };     // What: Live Context Object. Why: Most cases run as the production site. How: This stands in for Netlify's context there.
const PRE_COT_OBJ = { deploy : { context : 'deploy-preview' } }; // What: Preview Context Object. Why: A preview must not sell before the sandbox exists. How: This stands in for Netlify's context there.
const WEB_SEC_STR = 'test-webhook-secret';                       // What: Webhook Secret String. Why: Test webhooks are signed with a known secret. How: This is it.

// #endregion Constants



// #region Helpers

const admPosFun = ( adrPatStr : string, posBodObj : object ) => fetch( `${ AUT_EMU_STR }${ adrPatStr }`, { body : JSON.stringify( posBodObj ), headers : { 'Authorization' : 'Bearer owner', 'Content-Type' : 'application/json' }, method : 'POST' } ).then( ( resCurObj ) => resCurObj.json() ); // What: Admin Post Function. Why: The emulator's admin API creates and reads test accounts. How: This posts JSON as the emulator's owner and parses the reply.



const claReaFun = async ( uidValStr : string ) => JSON.parse( ( await admPosFun( `/identitytoolkit.googleapis.com/v1/projects/${ EMU_PRO_STR }/accounts:lookup`, { localId : [ uidValStr ] } ) ).users[ 0 ].customAttributes || '{}' ); // What: Claim Read Function. Why: Each webhook case checks the account's claims afterwards. How: This looks the account up and parses its custom claims.



// #region accNewFun

/**
 * accNewFun = Account New Function
 *
 * @summary
 * Creates a test account in the auth emulator, optionally with a verified
 * email and starting claims, and signs it in to get an ID token.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param verEmaBoo - Verified Email Boolean: Whether the email counts as
 *                    verified.
 * @param staClaObj - Start Claims Object: Claims the account starts with,
 *                    defaulting to none.
 *
 * @returns A promise that settles with the account's email, id, and token.
 *
 * @example
 * ```ts
 * await accNewFun(true, { beta: true }) // => { emaStr, idTokStr, uidStr }
 * ```
 *
*/

async function accNewFun ( verEmaBoo : boolean, staClaObj : object = {} ) : Promise< { emaStr : string, idTokStr : string, uidStr : string } > {


	const emaAdrStr = `pay-${ Date.now() }-${ Math.random().toString( 36 ).slice( 2 ) }@example.com`;                                                                                          // What: Email Address String. Why: Each case needs its own account. How: This builds a unique address.
	const sigUpcObj = await admPosFun( '/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake-api-key', { email : emaAdrStr, password : 'unused-password', returnSecureToken : true } ); // What: Sign Up Object. Why: The account has to exist. How: This creates it.


	await admPosFun( `/identitytoolkit.googleapis.com/v1/projects/${ EMU_PRO_STR }/accounts:update`, { customAttributes : JSON.stringify( staClaObj ), emailVerified : verEmaBoo, localId : sigUpcObj.localId } ); // What: Account Setup Call. Why: Cases need a chosen verification and starting claims. How: This sets both.


	const sigInnObj = await admPosFun( '/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key', { email : emaAdrStr, password : 'unused-password', returnSecureToken : true } ); // What: Sign In Object. Why: A fresh token carries the new verification. How: This signs in again.



	return { emaStr : emaAdrStr, idTokStr : sigInnObj.idToken, uidStr : sigUpcObj.localId }; // What: Account Return. Why: Cases use the email, token, and id. How: This returns them.


}

// #endregion accNewFun



// #region webReqFun

/**
 * webReqFun = Webhook Request Function
 *
 * @summary
 * Builds a webhook request the way Polar sends one: the event as JSON,
 * signed with WEB_SEC_STR (or a wrong secret), stamped with a timestamp
 * (now, or a chosen number of seconds ago).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param webEveObj - Webhook Event Object: The event to send.
 * @param sigSecStr - Signing Secret String: The secret to sign with,
 *                    defaulting to the real one.
 * @param ageSecNum - Age Seconds Number: How old the timestamp is,
 *                    defaulting to 0.
 *
 * @returns The request.
 *
 * @example
 * ```ts
 * webReqFun({ data, type: 'order.paid' }) // => Request
 * ```
 *
*/

function webReqFun ( webEveObj : object, sigSecStr : string = WEB_SEC_STR, ageSecNum : number = 0 ) : Request {


	const bodTexStr = JSON.stringify( webEveObj );                           // What: Body Text String. Why: The signature covers the exact text. How: This serializes the event.
	const msgIdeStr = `msg_${ Date.now() }`;                                 // What: Message Identifier String. Why: Each webhook has an id. How: This builds one.
	const msgTimStr = String( Math.floor( Date.now() / 1000 ) - ageSecNum ); // What: Message Timestamp String. Why: The timestamp is signed and checked. How: This is now, minus the chosen age.

	const sigValStr = createHmac( 'sha256', Buffer.from( sigSecStr, 'utf8' ) ).update( `${ msgIdeStr }.${ msgTimStr }.${ bodTexStr }` ).digest( 'base64' ); // What: Signature Value String. Why: The webhook is signed as Polar signs it. How: This signs the id, timestamp, and body.



	return new Request( 'https://easemylife.app/.netlify/functions/polar-webhook', { body : bodTexStr, headers : { 'webhook-id' : msgIdeStr, 'webhook-signature' : `v1,${ sigValStr }`, 'webhook-timestamp' : msgTimStr }, method : 'POST' } ); // What: Request Return. Why: The handler takes a Request. How: This builds it with Polar's three headers.


}

// #endregion webReqFun

// #endregion Helpers



// #region Module Init

before( () => { // What: Setup Hook. Why: The handlers read their setup from the environment. How: This points Firebase at the emulator and sets test secrets.


	process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';   // What: Emulator Host Setting. Why: The admin SDK must reach the emulator, never the real project. How: This names its host.
	process.env.POLAR_ACCESS_TOKEN          = 'test-polar-token'; // What: Polar Token Setting. Why: The checkout needs a token to call Polar. How: This sets a fake one for the stub.
	process.env.POLAR_WEBHOOK_SECRET        = WEB_SEC_STR;        // What: Webhook Secret Setting. Why: The webhook checks signatures against it. How: This sets the test secret.


} );



test( 'a signed order.paid for the sync product sets the paid claim and keeps other claims', async () => { // What: Paid Order Test. Why: A purchase must unlock its account. How: This sends a tagged order and reads the claims.


	const accNewObj = await accNewFun( true, { beta : true } ); // What: Account New Object. Why: The buyer's account, with another claim to keep. How: This creates it.
	const webResObj = await webSerFun( webReqFun( { data : { customer : { external_id : accNewObj.uidStr }, id : 'ord1', product_id : PRO_LIV_STR, status : 'paid' }, type : 'order.paid' } ), LIV_COT_OBJ ); // What: Webhook Response Object. Why: The order is delivered. How: This calls the handler.



	assert.equal( webResObj.status, 200 );                                                 // What: Status Assertion. Why: The order was handled. How: This expects 200.
	assert.deepEqual( await claReaFun( accNewObj.uidStr ), { beta : true, paid : true } ); // What: Claim Assertion. Why: The account is paid and keeps its other claim. How: This reads both.


} );



test( 'a webhook with a bad signature or an old timestamp is refused and changes nothing', async () => { // What: Signature Test. Why: Nobody but Polar may unlock an account. How: This sends forged and stale orders.


	const accNewObj = await accNewFun( true ); // What: Account New Object. Why: The target of the forged order. How: This creates it.
	const ordEveObj = { data : { customer : { external_id : accNewObj.uidStr }, id : 'ord2', product_id : PRO_LIV_STR, status : 'paid' }, type : 'order.paid' }; // What: Order Event Object. Why: Both attempts send the same order. How: This builds it.



	assert.equal( ( await webSerFun( webReqFun( ordEveObj, 'wrong-secret' ), LIV_COT_OBJ ) ).status, 403 );   // What: Forged Assertion. Why: A wrong secret's signature is refused. How: This expects 403.
	assert.equal( ( await webSerFun( webReqFun( ordEveObj, WEB_SEC_STR, 600 ), LIV_COT_OBJ ) ).status, 403 ); // What: Stale Assertion. Why: A ten-minute-old webhook is refused. How: This expects 403.
	assert.deepEqual( await claReaFun( accNewObj.uidStr ), {} );                                              // What: Unchanged Assertion. Why: Neither attempt unlocked anything. How: This expects no claims.


} );



test( 'an untagged order finds its account by email, and only a full refund clears the claim', async () => { // What: Email And Refund Test. Why: A checkout-link purchase still unlocks, and a partial refund keeps sync. How: This pays by email, then refunds partly and fully.


	const accNewObj = await accNewFun( true );                                                                                // What: Account New Object. Why: The buyer's account. How: This creates it.
	const ordDatObj = { customer : { email : accNewObj.emaStr, external_id : null }, id : 'ord3', product_id : PRO_LIV_STR }; // What: Order Data Object. Why: The order carries only the buyer's email. How: This builds it.


	await webSerFun( webReqFun( { data : { ...ordDatObj, status : 'paid' }, type : 'order.paid' } ), LIV_COT_OBJ ); // What: Paid Delivery. Why: The purchase arrives. How: This sends order.paid.


	assert.deepEqual( await claReaFun( accNewObj.uidStr ), { paid : true } ); // What: Email Match Assertion. Why: The email found the account. How: This expects it paid.


	await webSerFun( webReqFun( { data : { ...ordDatObj, status : 'partially_refunded' }, type : 'order.refunded' } ), LIV_COT_OBJ ); // What: Partial Refund Delivery. Why: A partial refund keeps sync. How: This sends one.


	assert.deepEqual( await claReaFun( accNewObj.uidStr ), { paid : true } ); // What: Partial Refund Assertion. Why: Sync stays unlocked. How: This expects it still paid.


	await webSerFun( webReqFun( { data : { ...ordDatObj, status : 'refunded' }, type : 'order.refunded' } ), LIV_COT_OBJ ); // What: Full Refund Delivery. Why: A full refund takes sync away. How: This sends one.


	assert.deepEqual( await claReaFun( accNewObj.uidStr ), { paid : false } ); // What: Full Refund Assertion. Why: Sync is locked again. How: This expects it unpaid.


} );



test( 'an order for another product is acknowledged and unlocks nothing', async () => { // What: Other Product Test. Why: Only the sync product unlocks sync. How: This sends an order for another product.


	const accNewObj = await accNewFun( true ); // What: Account New Object. Why: The buyer's account. How: This creates it.
	const webResObj = await webSerFun( webReqFun( { data : { customer : { external_id : accNewObj.uidStr }, id : 'ord4', product_id : 'another-product', status : 'paid' }, type : 'order.paid' } ), LIV_COT_OBJ ); // What: Webhook Response Object. Why: The order is delivered. How: This calls the handler.



	assert.equal( webResObj.status, 202 );                       // What: Acknowledged Assertion. Why: Polar shouldn't retry it. How: This expects 202.
	assert.deepEqual( await claReaFun( accNewObj.uidStr ), {} ); // What: Unchanged Assertion. Why: Nothing was unlocked. How: This expects no claims.


} );



test( 'the checkout refuses a missing or unverified sign-in and a deploy without its Polar token', async () => { // What: Checkout Refusal Test. Why: Only a verified account may buy, and only where checkout is set up. How: This posts without a token, with an unverified one, and to a preview.


	const unvAccObj = await accNewFun( false ); // What: Unverified Account Object. Why: An account without a verified email. How: This creates it.
	const verAccObj = await accNewFun( true );  // What: Verified Account Object. Why: A verified account, refused only where the token is missing. How: This creates it.

	const cheReqFun = ( idTokStr : string ) => new Request( 'https://easemylife.app/.netlify/functions/checkout', { headers : { 'Authorization' : `Bearer ${ idTokStr }` }, method : 'POST' } ); // What: Checkout Request Function. Why: Each case posts with a different token. How: This builds the request.



	assert.equal( ( await cheSerFun( cheReqFun( '' ), LIV_COT_OBJ ) ).status, 401 );                 // What: No Token Assertion. Why: Nobody signed in can't buy. How: This expects 401.
	assert.equal( ( await cheSerFun( cheReqFun( unvAccObj.idTokStr ), LIV_COT_OBJ ) ).status, 403 ); // What: Unverified Assertion. Why: An unverified email couldn't sync anyway. How: This expects 403.



	delete process.env.POLAR_ACCESS_TOKEN; // What: Token Removal. Why: A deploy context without its token must say checkout isn't set up. How: This removes it for the next check.


	assert.equal( ( await cheSerFun( cheReqFun( verAccObj.idTokStr ), PRE_COT_OBJ ) ).status, 503 ); // What: Missing Token Assertion. Why: A deploy without its token can't sell. How: This expects 503.


	process.env.POLAR_ACCESS_TOKEN = 'test-polar-token'; // What: Token Restore. Why: Later cases need it. How: This puts the fake token back.


} );



test( "the checkout asks Polar for the sync product tagged with the buyer's account, and a preview asks the sandbox", async () => { // What: Checkout Request Test. Why: The webhook relies on the checkout's tags. How: This stubs Polar's API and reads what the function sent.


	const accNewObj = await accNewFun( true ); // What: Account New Object. Why: The buyer's account. How: This creates it.
	const oriFetFun = globalThis.fetch;        // What: Original Fetch Function. Why: The stub must hand everything but Polar back to the real fetch. How: This keeps it.

	let polReqObj : { body : string, url : string } | null = null; // What: Polar Request Object. Why: The test reads what the function sent Polar. How: The stub stores it.



	globalThis.fetch = async ( reqAdrAny, reqOptObj ) => { // What: Fetch Stub. Why: No real checkout may be created. How: This answers Polar's API itself and passes other calls through.


		if ( !/^https:\/\/(sandbox-)?api\.polar\.sh/.test( String( reqAdrAny ) ) ) return oriFetFun( reqAdrAny, reqOptObj ); // What: Pass Through Guard. Why: The emulator calls must still work. How: This hands them to the real fetch.



		polReqObj = { body : String( reqOptObj?.body ), url : String( reqAdrAny ) }; // What: Polar Request Record. Why: The test checks it. How: This stores the address and body.



		return Response.json( { url : 'https://polar.sh/checkout/test' } ); // What: Stub Reply. Why: The function expects a checkout back. How: This returns a fake one.


	};



	try { // What: Checkout Call Try. Why: The real fetch has to come back even if the checkout fails. How: This calls the function and restores fetch after.


		const cheResObj = await cheSerFun( new Request( 'https://easemylife.app/.netlify/functions/checkout', { headers : { 'Authorization' : `Bearer ${ accNewObj.idTokStr }` }, method : 'POST' } ), LIV_COT_OBJ ); // What: Checkout Response Object. Why: The checkout is started. How: This calls the handler.



		assert.deepEqual( await cheResObj.json(), { url : 'https://polar.sh/checkout/test' } ); // What: Address Assertion. Why: The app sends the buyer to Polar's address. How: This expects it returned.
		assert.equal( polReqObj!.url, 'https://api.polar.sh/v1/checkouts/' );                   // What: Endpoint Assertion. Why: Production uses live Polar. How: This checks the address. // What: Non-Null Note. Why: The stub stored the request. How: The ! tells TypeScript it exists.
		assert.deepEqual( JSON.parse( polReqObj!.body ), { customer_email : accNewObj.emaStr, external_customer_id : accNewObj.uidStr, metadata : { firebaseUid : accNewObj.uidStr }, products : [ PRO_LIV_STR ], success_url : 'https://easemylife.app/?purchase=sync' } ); // What: Body Assertion. Why: The webhook finds the account from these tags. How: This checks every field. // What: Non-Null Note. Why: The stub stored the request. How: The ! tells TypeScript it exists.



		await cheSerFun( new Request( 'https://paid-sync-accounts--ease-my-life.netlify.app/.netlify/functions/checkout', { headers : { 'Authorization' : `Bearer ${ accNewObj.idTokStr }` }, method : 'POST' } ), PRE_COT_OBJ ); // What: Preview Checkout Call. Why: A preview must never reach live Polar. How: This starts a checkout as a preview.


		assert.equal( polReqObj!.url, 'https://sandbox-api.polar.sh/v1/checkouts/' ); // What: Sandbox Endpoint Assertion. Why: Previews use the sandbox. How: This checks the address. // What: Non-Null Note. Why: The stub stored the request. How: The ! tells TypeScript it exists.
		assert.deepEqual( JSON.parse( polReqObj!.body ).products, [ PRO_SAN_STR ] );  // What: Sandbox Product Assertion. Why: Previews sell the sandbox product. How: This checks it. // What: Non-Null Note. Why: The stub stored the request. How: The ! tells TypeScript it exists.


	}

	finally { globalThis.fetch = oriFetFun; } // What: Fetch Restore. Why: Later tests need the real fetch. How: This puts it back.


} );

// #endregion Module Init


