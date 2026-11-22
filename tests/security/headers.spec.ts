


// #region Imports

import { execFileSync  } from 'node:child_process';    // What: Exec File Sync. Why: The dependency check asks npm itself. How: This runs npm audit and returns its output.
import { expect        } from '@playwright/test';      // What: Expect. Why: Each check passes only when the policy and the build are what they should be. How: This asserts on what each check reads, such as the audit's counts.
import { fileURLToPath } from 'node:url';              // What: File URL To Path. Why: The build folder, dist/, and the source file read sit under the repo root, two folders above this file. How: This turns each one's URL into a path.
import { heaAllFun     } from '../support/headers.ts'; // What: Headers All Function. Why: The checks test the policy Netlify really sends. How: This reads the /* block of public/_headers.
import { join          } from 'node:path';             // What: Join. Why: A built file's path is its folder plus its name. How: This joins them with the right separator.
import { readdirSync   } from 'node:fs';               // What: Read Directory Sync. Why: Every built text file is searched for secrets. How: This lists the build folder's entries, recursively.
import { readFileSync  } from 'node:fs';               // What: Read File Sync. Why: Each built file's text is searched, and the browser keys are read from their source. How: This reads a file.
import { relative      } from 'node:path';             // What: Relative. Why: A match is reported by its path inside the build. How: This trims the build folder off a file's path.
import { ROO_DIR_STR   } from '../support/servers.ts'; // What: Root Directory String. Why: npm audit reads the repo's lockfile. How: This is the repo root it runs from.
import { test          } from '@playwright/test';      // What: Test. Why: Each part of the policy is its own test. How: This declares them.

// #endregion Imports



/**
 * headers.spec.ts = Headers Spec
 *
 * @summary
 * Checks the security policy and what ships rather than a page, so it runs in
 * the Chromium project only, since a file reads the same in every engine. Its
 * checks cover the headers public/_headers sends, the production build the
 * preview server builds before the run, and the shipped dependencies, such as
 * the headers holding the app to its own strict policy with nothing from
 * another origin but the Firebase and reCAPTCHA addresses the optional paid
 * sync needs. The npm audit check skips with a message when npm can't reach
 * its registry.
 *
 * Sections:
 *  - Constants
 *  - Module State
 *  - Module Init
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const ALO_HOS_ARR = [ // What: Allowed Host Array. Why: The only other origins the app talks to are Firebase's and reCAPTCHA's, for the optional paid sync. How: Each entry is one host the policy may name over HTTPS.


	'apis.google.com',                         // What: Google API Loader Host. Why: Google sign-in's frame loads its script loader from here. How: This allows it in script-src.
	'content-firebaseappcheck.googleapis.com', // What: App Check Host. Why: App Check trades its reCAPTCHA proof for a token here. How: This allows it in connect-src.
	'ease-my-life-4ce18.firebaseapp.com',      // What: Authentication Domain Host. Why: The project's own auth domain runs Google sign-in's hidden frame. How: This allows it in frame-src.
	'firestore.googleapis.com',                // What: Firestore Host. Why: The cloud copy lives in Firestore. How: This allows it in connect-src.
	'identitytoolkit.googleapis.com',          // What: Identity Toolkit Host. Why: Firebase Auth signs in through it. How: This allows it in connect-src.
	'recaptcha.google.com',                    // What: ReCaptcha Host. Why: reCAPTCHA's challenge frames load from here. How: This allows it in frame-src.
	'securetoken.googleapis.com',              // What: Secure Token Host. Why: Firebase Auth renews its tokens here. How: This allows it in connect-src.
	'www.google.com',                          // What: Google Host. Why: reCAPTCHA's script, frames, and requests live under its /recaptcha/ path. How: This allows it in connect-src, frame-src, and script-src.
	'www.gstatic.com'                          // What: Google Static Host. Why: reCAPTCHA's script files are served from here. How: This allows it in script-src.


];

const BIN_EXT_REG = /\.(ico|png|webp|woff2)$/;                                                     // What: Binary Extension Regular Expression. Why: Raster images and fonts hold no text to search, and their bytes could match a pattern by chance. How: This matches the built file types the secret search skips.
const DIS_DIR_STR = fileURLToPath( new URL( '../../dist/', import.meta.url ) );                    // What: Distribution Directory String. Why: The secret search reads what visitors download. How: This resolves the build folder, dist/.
const FIR_PAT_STR = fileURLToPath( new URL( '../../src/platform/firebase.ts', import.meta.url ) ); // What: Firebase Path String. Why: The browser keys the secret search allows are read from the one file that holds them. How: This resolves src/platform/firebase.ts.
const RED_FIL_STR = fileURLToPath( new URL( '../../dist/_redirects', import.meta.url ) );          // What: Redirects File String. Why: The legal pages and the app are reached on the live site only through the host's rules, and the built copy is what Netlify reads. How: This resolves the built dist/_redirects.

const SEC_PAT_ARR = [ // What: Secret Pattern Array. Why: A key pasted into the source would ship to every visitor. How: Each entry matches one well-known kind of private key or provider token.


	/-----BEGIN [A-Z ]*PRIVATE KEY-----/, // What: Private Key Pattern. Why: A private key's file opens with this line, the Firebase service account's included. How: This matches it.
	/AIza[0-9A-Za-z_-]{35}/,              // What: Google Key Pattern. Why: Any Google key but the Firebase web config's is a mistake. How: This matches a Google API key.
	/AKIA[0-9A-Z]{16}/,                   // What: AWS Key Pattern. Why: An AWS access key opens with AKIA. How: This matches one.
	/gh[opsu]_[0-9A-Za-z]{36}/,           // What: GitHub Token Pattern. Why: A GitHub token opens with a short type prefix. How: This matches a personal, OAuth, app, or user token.
	/polar_[a-z]{2,4}_[0-9A-Za-z]{20,}/,  // What: Polar Token Pattern. Why: The checkout function's Polar access token belongs to the server alone. How: This matches a Polar token by its prefix.
	/sk_live_[0-9A-Za-z]{20,}/,           // What: Stripe Key Pattern. Why: A live Stripe secret key opens with sk_live_. How: This matches one.
	/whsec_[0-9A-Za-z+/=]{20,}/,          // What: Webhook Secret Pattern. Why: The Polar webhook's signing secret belongs to the server alone. How: This matches a webhook secret by its prefix.
	/xox[abprs]-[0-9A-Za-z-]{10,}/        // What: Slack Token Pattern. Why: A Slack token opens with xox and a type letter. How: This matches one.


];

// #endregion Constants



// #region Module State

const FIR_TEX_STR = readFileSync( FIR_PAT_STR, 'utf8' ); // What: Firebase Text String. Why: The allowed browser keys are read from their source rather than copied here. How: This reads src/platform/firebase.ts once.

const ALO_KEY_ARR = [ // What: Allowed Key Array. Why: The Firebase web config's API key and the App Check reCAPTCHA site key are meant for the browser and grant nothing by themselves, so the build carries both. How: Each entry is one of those keys, read from the source.


	FIR_TEX_STR.match( /apiKey\s*:\s*'([^']+)'/ )?.[ 1 ] ?? '',     // What: Firebase API Key. Why: It identifies the project to Google's servers, and the security rules, not the key, guard the data. How: This reads the config's apiKey.
	FIR_TEX_STR.match( /REC_SIT_STR\s*=\s*'([^']+)'/ )?.[ 1 ] ?? '' // What: ReCaptcha Site Key. Why: A site key is public, registered for easemylife.app only. How: This reads REC_SIT_STR.


];

// #endregion Module State



// #region Module Init

test.skip( ( { browserName : broNamStr } ) => broNamStr !== 'chromium', 'These checks read files, which are the same in every engine, so they run in Chromium only.' ); // What: Chromium Only Skip. Why: Running a file check three times proves nothing more. How: This skips every test in the file outside the Chromium project.



// #region Headers Checks

test( 'the content security policy allows only the app and its named sync services', () => { // What: Content Security Policy Test. Why: A strict policy stops injected or third-party script from running, which limits cross-site scripting. How: This reads the policy, checks each directive it depends on, checks that it never allows evaluated code, inline script, or a data: image, and checks every other source is the app's own origin or one of the named HTTPS hosts.


	const cspValStr = heaAllFun()[ 'content-security-policy' ] ?? ''; // What: Content-Security-Policy Value String. Why: Each directive is checked in the policy's own text. How: This reads the header, or an empty string if it's missing.


	expect( cspValStr ).toContain( "default-src 'self'" );     // What: Default Source Assertion. Why: Every resource type the policy doesn't name falls back to this, images included. How: This checks the policy names default-src 'self'.
	expect( cspValStr ).toContain( "base-uri 'self'" );        // What: Base URI Assertion. Why: An injected base tag could point every relative address at another site. How: This checks the policy names base-uri 'self'.
	expect( cspValStr ).toContain( "form-action 'self'" );     // What: Form Action Assertion. Why: An injected form could post a visitor's details elsewhere, while the support form posts to the app itself. How: This checks the policy names form-action 'self'.
	expect( cspValStr ).toContain( "frame-ancestors 'none'" ); // What: Frame Ancestors Assertion. Why: A site framing this one could trick visitors into clicks. How: This checks no page may frame it.
	expect( cspValStr ).toContain( "object-src 'none'" );      // What: Object Source Assertion. Why: Plugins can run code outside the policy. How: This checks none can load.
	expect( cspValStr ).not.toContain( 'unsafe-eval' );        // What: No Unsafe Eval Assertion. Why: Evaluated strings run as code. How: This checks the policy never allows it.
	expect( cspValStr ).not.toMatch( /(^|\s)data:/ );          // What: No Data Source Assertion. Why: A data: image source would let markup injected into the page draw any picture it carries, and nothing the app ships is inlined. How: This checks no directive lists data:.


	for ( const dirTexStr of cspValStr.split( ';' ).map( ( dirRawStr ) => dirRawStr.trim() ).filter( ( dirCurStr ) => dirCurStr.length > 0 ) ) { // What: Directive Loop. Why: Any source but the app's own origin, none, or a named sync host would let another site's files in, a wildcard or a bare scheme included. How: This checks each directive in turn.


		const [ dirNamStr, ...souLisArr ] = dirTexStr.split( /\s+/ ); // What: Directive Name String. Why: Inline styles are allowed in style-src alone. How: This reads the directive's name. // What: Source List Array. Why: The sources follow the directive's name. How: This keeps the rest of the directive's words.


		expect( souLisArr.filter( ( souCurStr ) => !( souCurStr === "'self'" || souCurStr === "'none'" || ( souCurStr === "'unsafe-inline'" && dirNamStr === 'style-src' ) || ALO_HOS_ARR.some( ( aloHosStr ) => souCurStr === `https://${ aloHosStr }` || souCurStr.startsWith( `https://${ aloHosStr }/` ) ) ) ), dirTexStr ).toEqual( [] ); // What: Allowed Sources Assertion. Why: Inline styles are allowed only for the boot splash's critical CSS and React's style attributes, which CLAUDE.md records, and nothing else may widen the policy. How: This checks the directive lists no other source, naming the directive when it fails.


	}


} );



test( 'the other hardening headers are set', () => { // What: Hardening Headers Test. Why: Each header closes a different gap: plain HTTP, sniffed file types, framing, referrer leaks, and unused browser features. How: This reads the policy, checks HSTS's age and subdomain flag and the nosniff and DENY values, and checks that a referrer policy and a permissions policy are set.


	// #region Header Lookup

	const heaAllObj = heaAllFun();                                    // What: Headers All Object. Why: Each header is looked up by name. How: This reads the /* block of public/_headers.
	const hstValStr = heaAllObj[ 'strict-transport-security' ] ?? ''; // What: HTTP-Strict-Transport Value String. Why: Its age and subdomain flag are checked separately. How: This reads the header, or an empty string if it's missing.

	// #endregion Header Lookup



	// #region Hardening Checks

	expect( Number( hstValStr.match( /max-age=(\d+)/ )?.[ 1 ] ?? 0 ) ).toBeGreaterThanOrEqual( 31536000 ); // What: HSTS Age Assertion. Why: Browsers should stay on HTTPS for at least a year once they've seen the app. How: This checks max-age is at least 31,536,000 seconds.
	expect( hstValStr ).toContain( 'includeSubDomains' );                                                  // What: HSTS Subdomains Assertion. Why: A plain HTTP subdomain could still be used against the app. How: This checks HSTS covers every subdomain.
	expect( heaAllObj[ 'x-content-type-options' ] ).toBe( 'nosniff' );                                     // What: No Sniff Assertion. Why: A browser guessing a file's type could run a text file as script. How: This checks it's told not to guess.
	expect( heaAllObj[ 'x-frame-options' ] ).toBe( 'DENY' );                                               // What: Frame Options Assertion. Why: Older browsers ignore frame-ancestors. How: This checks framing is refused the older way too.
	expect( heaAllObj[ 'referrer-policy' ] ).toBeTruthy();                                                 // What: Referrer Policy Assertion. Why: A referrer policy states how much of the address other sites receive. How: This checks a policy is set.
	expect( heaAllObj[ 'permissions-policy' ] ).toBeTruthy();                                              // What: Permissions Policy Assertion. Why: Browser features the app never uses shouldn't be available to injected code. How: This checks a policy is set.

	// #endregion Hardening Checks


} );



test( 'the legal pages keep their own addresses and every other path falls back to the app', () => { // What: Rewrite Rules Test. Why: Netlify answers a path with no file of its own with its own error page unless a rule hands it to the app, and a catch-all above the legal pages' rules would swallow them, while the dev and preview servers fall back on their own, so the page suites can't tell. How: This reads the built dist/_redirects and checks its rules are the two legal pages' rewrites, then the catch-all, in that order.


	const rulLisArr = readFileSync( RED_FIL_STR, 'utf8' ).split( '\n' ).map( ( linCurStr ) => linCurStr.trim() ).filter( ( linCurStr ) => linCurStr && !linCurStr.startsWith( '#' ) ); // What: Rule List Array. Why: Netlify reads the file's rules top to bottom and ignores comments and blank lines. How: This keeps each rule line, trimmed.


	expect( rulLisArr.map( ( rulCurStr ) => rulCurStr.split( /\s+/ ).join( ' ' ) ) ).toEqual( [ '/privacy /privacy.html 200', '/terms /terms.html 200', '/* /index.html 200' ] ); // What: Rule Order Assertion. Why: The legal pages have to match before the catch-all, and the catch-all has to rewrite with a 200 rather than redirect, so the app loads and replaces the unknown address itself. How: This checks the rules' fields, in order.


} );

// #endregion Headers Checks



// #region Build Checks

test( 'the built app holds no secrets beyond its browser keys', () => { // What: Secret Search Test. Why: Anything in the build ships to every visitor, so a key there is public. How: This searches every built text file for each secret pattern, sets aside the two browser keys, and checks that no other match is left.


	expect( ALO_KEY_ARR.every( ( aloKeyStr ) => aloKeyStr.length > 0 ) ).toBe( true ); // What: Browser Keys Found Assertion. Why: An allowed key that couldn't be read would leave nothing set aside, hiding a source change. How: This checks both keys were read.



	const proLisArr : string[] = []; // What: Problem List Array. Why: Every match is reported at once. How: This collects one entry per match.


	for ( const filEntObj of readdirSync( DIS_DIR_STR, { recursive : true, withFileTypes : true } ) ) { // What: Built Entry Loop. Why: Every built file could hold a secret. How: This walks every file and folder in the build.


		if ( !filEntObj.isFile() || BIN_EXT_REG.test( filEntObj.name ) ) continue; // What: Text File Guard. Why: Folders, raster images, and fonts hold no text to search. How: This skips folders and the built raster image and font files, so the rest are read.



		const filPatStr = join( filEntObj.parentPath, filEntObj.name ); // What: File Path String. Why: The file is read, and reported, by its path. How: This joins the entry's folder and name.
		const filTexStr = readFileSync( filPatStr, 'utf8' );            // What: File Text String. Why: Each pattern is searched in the file's text. How: This reads the built file.


		for ( const secPatReg of SEC_PAT_ARR ) for ( const secMatArr of filTexStr.matchAll( new RegExp( secPatReg, 'g' ) ) ) if ( !ALO_KEY_ARR.includes( secMatArr[ 0 ] ) ) proLisArr.push( `${ relative( DIS_DIR_STR, filPatStr ) } matches ${ secPatReg }` ); // What: Pattern Loop. Why: Each kind of secret is searched for, and only the browser keys may match. How: This records the file, relative to the build, and the pattern for every match that isn't an allowed key.


	}



	expect( proLisArr ).toEqual( [] ); // What: No Secrets Assertion. Why: The build should hold none. How: This checks the list stayed empty.


} );



test( 'the shipped dependencies have no high or critical advisory', () => { // What: Dependency Audit Test. Why: A known hole in a library the app or its functions ship reaches every visitor or the accounts. How: This runs npm audit on the production dependencies and checks the high and critical counts.


	// #region Audit Run

	let audTexStr = ''; // What: Audit Text String. Why: npm reports its findings as JSON on standard output, even when it exits with an error for finding some. How: This holds that output.



	try { // What: Audit Run Attempt. Why: npm audit exits with an error when it finds advisories, which would otherwise end the test. How: This runs the audit so a failed exit can be caught below.


		audTexStr = execFileSync( 'npm', [ 'audit', '--omit=dev', '--json' ], { cwd : ROO_DIR_STR, encoding : 'utf8' } ); // What: Audit Run Assignment. Why: The advisories come from npm's registry. How: This runs npm audit on the production dependencies.


	}

	catch ( errCatObj ) { // What: Audit Failure Catch. Why: A failed exit still carries the findings on its standard output. How: This reads that output into the audit text.


		audTexStr = String( ( errCatObj as { stdout? : string } ).stdout ?? '' ); // What: Failed Audit Output Assignment. Why: npm audit exits with an error when it finds advisories, and still prints them. How: This keeps the output the error carries. // What: Type Assertion Note. Why: A failed execFileSync throws an error carrying the command's output. How: The as reads its stdout field.


	}

	// #endregion Audit Run



	// #region Audit Counts

	const audDatObj = JSON.parse( audTexStr || '{}' ) as { metadata? : { vulnerabilities? : Record< string, number > } }; // What: Audit Data Object. Why: The counts are read by severity. How: This parses npm's JSON, or an empty object when there was no output. // What: Type Assertion Note. Why: JSON.parse returns any. How: The as names only the fields read.
	const vulCouObj = audDatObj.metadata?.vulnerabilities;                                                                // What: Vulnerability Count Object. Why: Only a real report has counts. How: This reads them, or undefined when npm couldn't reach its registry.

	// #endregion Audit Counts



	test.skip( !vulCouObj, 'npm audit could not reach the registry, so the dependencies went unchecked.' ); // What: Offline Skip. Why: Without a report there's nothing to check, and passing would hide that. How: This skips the test with a message saying why.



	expect( vulCouObj!.high + vulCouObj!.critical ).toBe( 0 ); // What: No Severe Advisory Assertion. Why: A high or critical advisory needs fixing before the app ships. How: This checks there are none. // What: Non-Null Note. Why: The skip above ends the test when the counts are missing. How: The ! says they're present here.


} );

// #endregion Build Checks

// #endregion Module Init


