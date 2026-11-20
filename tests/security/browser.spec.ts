


// #region Imports

import { expect      } from '@playwright/test';     // What: Expect. Why: Each check passes only when the policy is enforced and the page breaks none of its rules. How: This asserts on what each check collects from the page.
import { LEG_PAT_ARR } from '../support/states.ts'; // What: Legal Path Array. Why: The privacy policy and terms are static pages of their own, outside the app's states. How: This lists their addresses.
import { opeStaFun   } from '../support/states.ts'; // What: Open State Function. Why: Each state is opened the way the accessibility suite opens it. How: This loads the state and waits until it's settled.
import { polSetFun   } from '../support/policy.ts'; // What: Policy Setup Function. Why: Every page loads under the headers Netlify really sends. How: This adds the headers and the violation listener.
import { polVioFun   } from '../support/policy.ts'; // What: Policy Violation Function. Why: Each check reads what the browser refused. How: This reads the recorded violations.
import { relCheFun   } from '../support/policy.ts'; // What: Relationship Check Function. Why: Every new tab link has to be closed off. How: This checks each carries noopener and noreferrer.
import { STA_REC_ARR } from '../support/states.ts'; // What: State Record Array. Why: The policy has to hold in each state the suites visit. How: This lists the states to load.
import { test        } from '@playwright/test';     // What: Test. Why: Each state is its own test. How: This declares them.
import { watErrFun   } from '../support/watch.ts';  // What: Watch Errors Function. Why: A page error under the policy is a failure even when nothing was refused. How: This collects page and console errors.

// #endregion Imports



/**
 * browser.spec.ts = Browser Spec
 *
 * @summary
 * Checks that the app works under its own security policy, in whichever
 * engine the project runs. Each page loads from the production build, which
 * the preview server serves, since the dev server injects inline scripts the
 * policy would block. Neither server reads Netlify's headers file, so every
 * response is given the headers the built dist/_headers sends with its path.
 * First a check proves the policy is live, by injecting an inline script and
 * seeing it refused and reported. Then every app state the accessibility
 * suite visits, and the two legal pages, are checked for policy violations
 * and checked to close off every new tab link, with neither an opener nor a
 * referrer. Last, an unknown address has to load the app and be replaced by
 * the root, keeping its query and hash, since the app answers at one address.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



test( 'the policy refuses an injected inline script', async ( { page : curPagObj } ) => { // What: Policy Live Test. Why: A clean run means nothing unless the policy was really applied and its violations really recorded. How: This loads the app under the policy, injects an inline script, and checks it didn't run and was reported.


	// #region Page Load Under Policy

	await polSetFun( curPagObj ); // What: Policy Setup Call. Why: The page has to load under the policy. How: This adds the headers and the violation listener.

	await curPagObj.goto( '/' ); // What: App Open Call. Why: The script is injected into a real page. How: This loads the app's root.

	// #endregion Page Load Under Policy



	const injRanBoo = await curPagObj.evaluate( async () => { // What: Injection Ran Boolean. Why: A refused script never sets its flag. How: This adds an inline script that sets a flag, waits a moment for any violation event, and reports whether the flag was set.


		const scrNewEle = document.createElement( 'script' ); // What: Script New Element. Why: Injected markup is how a cross-site scripting attack runs code. How: This makes an inline script.


		scrNewEle.textContent = 'document.documentElement.dataset.injectedScriptRan = "true";'; // What: Script Text Assignment. Why: The flag shows whether the script ran. How: This sets a data attribute on the page's root if it does.


		document.body.append( scrNewEle ); // What: Script Append Call. Why: An inline script runs as soon as it joins the page, unless the policy refuses it. How: This adds it to the body.

		await new Promise( ( resWaiFun ) => setTimeout( resWaiFun, 100 ) ); // What: Event Wait Call. Why: The browser reports a violation as an event shortly after refusing the script. How: This waits 100ms for it.



		return document.documentElement.dataset.injectedScriptRan === 'true'; // What: Flag Return. Why: The test checks the script stayed off. How: This reports whether it set its flag.


	} );



	// #region Policy Checks

	expect( injRanBoo ).toBe( false );                                                                // What: Script Refused Assertion. Why: The policy has to stop inline script. How: This checks the injected script never ran.
	expect( await polVioFun( curPagObj ) ).toContainEqual( expect.stringContaining( 'script-src' ) ); // What: Violation Reported Assertion. Why: The later checks rely on violations being recorded. How: This checks the refusal was recorded as a script-src violation.

	// #endregion Policy Checks


} );



for ( const staRecObj of STA_REC_ARR ) { // What: State Loop. Why: Every state the suites visit has to work under the policy. How: This declares one test per state.


	test( `${ staRecObj.ideStr } breaks no rule of the security policy and closes off every new tab link`, async ( { page : curPagObj } ) => { // What: State Policy Test. Why: A blocked resource, such as a font, would break the app once deployed, and the policy can't be loosened to hide it. How: This opens the state under the policy and checks nothing was refused and every new tab link is closed off.


		// #region Page Load Under Policy

		const errMesArr = watErrFun( curPagObj ); // What: Error Message Array. Why: A page error under the policy is a failure even when nothing was refused. How: This starts watching.


		await polSetFun( curPagObj ); // What: Policy Setup Call. Why: The page has to load under the policy. How: This adds the headers and the violation listener.

		await opeStaFun( curPagObj, staRecObj ); // What: State Open Call. Why: The state's fonts, data, and open panel have to load before the page is checked. How: This opens the state the way the accessibility suite does.

		// #endregion Page Load Under Policy



		// #region Policy Checks

		expect( await polVioFun( curPagObj ) ).toEqual( [] ); // What: No Violation Assertion. Why: Everything the state loads should be allowed by the policy. How: This checks none was refused.

		await relCheFun( curPagObj ); // What: Relationship Check Call. Why: Every new tab link has to be closed off. How: This checks each carries noopener and noreferrer.

		// #endregion Policy Checks



		expect( errMesArr, errMesArr.join( '\n' ) ).toEqual( [] ); // What: Error Assertion. Why: A page that logged an error failed even if it loaded. How: This expects no errors.


	} );


}



for ( const legPatStr of LEG_PAT_ARR ) { // What: Legal Page Loop. Why: The legal pages load their own script and styles, outside the app. How: This declares one test per page.


	test( `${ legPatStr } breaks no rule of the security policy and closes off every new tab link`, async ( { page : curPagObj } ) => { // What: Legal Policy Test. Why: The legal pages ship under the same policy as the app. How: This opens the page under the policy, waits for its fonts, and checks nothing was refused and every new tab link is closed off.


		// #region Legal Page Load

		const errMesArr = watErrFun( curPagObj ); // What: Error Message Array. Why: A page error under the policy is a failure even when nothing was refused. How: This starts watching.


		await polSetFun( curPagObj ); // What: Policy Setup Call. Why: The page has to load under the policy. How: This adds the headers and the violation listener.

		await curPagObj.goto( legPatStr ); // What: Legal Page Open Call. Why: The page is checked as a visitor loads it. How: This loads its address.

		await curPagObj.evaluate( () => document.fonts.ready.then( () => undefined ) ); // What: Fonts Ready Wait. Why: A refused font is reported only once the page asks for it. How: This waits until every font face has loaded.

		// #endregion Legal Page Load



		// #region Policy Checks

		expect( await polVioFun( curPagObj ) ).toEqual( [] ); // What: No Violation Assertion. Why: Everything the page loads should be allowed by the policy. How: This checks none was refused.

		await relCheFun( curPagObj ); // What: Relationship Check Call. Why: The legal text links out to other sites. How: This checks each new tab link carries noopener and noreferrer.

		// #endregion Policy Checks



		expect( errMesArr, errMesArr.join( '\n' ) ).toEqual( [] ); // What: Error Assertion. Why: A page that logged an error failed even if it loaded. How: This expects no errors.


	} );


}



test( 'an unknown address loads the app and is replaced by the root', async ( { page : curPagObj } ) => { // What: Unknown Address Test. Why: The app answers at one address, so a mistyped one must never stay in the address bar, while its query and hash still reach the app. How: This loads an unknown path under the policy and checks the app shows at the root with the same query and hash and nothing refused.


	// #region Unknown Address Load

	const errMesArr = watErrFun( curPagObj ); // What: Error Message Array. Why: A page error on the fallback is a failure even when nothing was refused. How: This starts watching.


	await polSetFun( curPagObj ); // What: Policy Setup Call. Why: The fallback has to work under the policy too. How: This adds the headers and the violation listener.

	await curPagObj.goto( '/no-such-page?from=test#top' ); // What: Unknown Address Open Call. Why: A mistyped address is served the app, as the host's catch-all serves it. How: This loads a path the app has no page for.

	await curPagObj.getByRole( 'dialog' ).first().waitFor(); // What: Welcome Modal Wait. Why: A fresh install opens the app on its welcome modal, which shows the app loaded. How: This waits for it.

	// #endregion Unknown Address Load



	// #region Address And Policy Checks

	await expect( curPagObj ).toHaveURL( /^http:\/\/localhost:\d+\/\?from=test#top$/ ); // What: Root Address Assertion. Why: The unknown path has to give way to the root, keeping the query and hash. How: This checks the address is the root with both kept.

	expect( await polVioFun( curPagObj ) ).toEqual( [] );      // What: No Violation Assertion. Why: The fallback page should load cleanly. How: This checks nothing was refused.
	expect( errMesArr, errMesArr.join( '\n' ) ).toEqual( [] ); // What: Error Assertion. Why: A page that logged an error failed even if it loaded. How: This expects no errors.

	// #endregion Address And Policy Checks


} );


