


// #region Imports

import cssModObj from './contact-support.module.css'; // What: CSS Module Object. Why: The trigger row and the support form are styled from their own module. How: This maps each class name in contact-support.module.css to its hashed module class.
import React     from 'react';                        // What: React. Why: ConSupCom is built directly on React's own APIs. How: This is used directly (React.useMemo, React.useRef, React.useState, React.Fragment) instead of importing individual named hooks.


import { APP_VER_STR } from '../../constants.ts';        // What: App Version String. Why: A bug report should arrive with the real build version attached. How: This fills the form's own read-only version field and is posted with the message.
import { ButBasCom   } from '../../ui/button.tsx';       // What: Button Base Component. Why: The form's own open, send, and copy-address actions need consistently-styled buttons. How: This is rendered throughout ConSupCom.
import { CarSurCom   } from '../../ui/card-surface.tsx'; // What: Card Surface Component. Why: The support form sits inside the shared bordered container. How: This wraps the form's own fields inside ConSupCom.
import { ColDisCom   } from '../../ui/collapse.tsx';     // What: Collapse Disclosure Component. Why: The contact-support form needs to expand/collapse in place. How: This wraps the contact-support form's own CarSurCom, gated on forOpeBoo.
import { durMilFun   } from '../../utils/rhythm.ts';     // What: Duration Millisecond Function. Why: The scroll timer must wait out the form's expand. How: This returns a duration step's length in milliseconds.
import { redMotFun   } from '../../utils/motion.ts';     // What: Reduce Motion Function. Why: Scrolling the opened form into view must not animate for a user who prefers reduced motion. How: This is checked before choosing 'smooth' vs 'auto' scroll behavior in opeForFun.
import { rhyPxlFun   } from '../../utils/rhythm.ts';     // What: Rhythm Pixel Function. Why: Pixel layout math here needs the same step sizes the stylesheet uses. How: This returns a vertical rhythm step in pixels at the current root font size.

// #endregion Imports



/**
 * contact-support.tsx = Contact Support
 *
 * @summary
 * The Account section's own support form: ConSupCom is a collapsible card
 * holding a subject, a message, and 2 read-only diagnostic fields (the app
 * version and the browser detBroFun detects from the user agent against
 * BRO_PAT_ARR), posted to Netlify Forms under FOR_NAM_STR, with SUP_EMA_STR as
 * the fallback address shown when sending fails.
 *
 * Sections:
 *  - Constants
 *  - Helpers
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

// #region BRO_PAT_ARR

/**
 * BRO_PAT_ARR = Browser Pattern Array
 *
 * @summary
 * Every entry below shares this exact shape, read by detBroFun's own match
 * loop; none of the 5 entries repeat these same fields' own boilerplate
 * comments (see the "Repeated-shape object literals" comment exception in
 * CLAUDE.md). Each entry's own trailing comment instead just names which
 * specific browser it recognizes. Order matters: Edge and Opera come before
 * Chrome, since both of their own user-agent strings also contain the
 * Chrome substring.
 *
 * - `namStr` (String): Name String is the recognized browser's own display
 *   name, used directly in detBroFun's own returned label.
 *
 * - `regObj` (RegExp): Regex Object is the pattern that recognizes this
 *   specific browser from the user-agent string, capturing its version
 *   number in its own first group.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const BRO_PAT_ARR = [ // What: Browser Pattern Array. Why: This is the ordered list of engines detBroFun can recognize, checked most-specific first. How: This is iterated by detBroFun, matching each entry's own regObj against the user-agent string.


	{ namStr : 'Edge',    regObj : /Edg\/([\d.]+)/              }, // What: Edge Pattern Object. Why: Edge's own user-agent also contains "Chrome", so it must be checked first. How: This matches the "Edg/" token and its version.
	{ namStr : 'Opera',   regObj : /OPR\/([\d.]+)/              }, // What: Opera Pattern Object. Why: Opera's own user-agent also contains "Chrome", so it must be checked before Chrome. How: This matches the "OPR/" token and its version.
	{ namStr : 'Chrome',  regObj : /Chrome\/([\d.]+)/           }, // What: Chrome Pattern Object. Why: This covers Chrome itself once Edge and Opera have been ruled out. How: This matches the "Chrome/" token and its version.
	{ namStr : 'Firefox', regObj : /Firefox\/([\d.]+)/          }, // What: Firefox Pattern Object. Why: Firefox uses its own distinct engine and token. How: This matches the "Firefox/" token and its version.
	{ namStr : 'Safari',  regObj : /Version\/([\d.]+).*Safari/ }   // What: Safari Pattern Object. Why: Safari reports its own version in a separate "Version/" token rather than beside its name. How: This matches "Version/" followed later by "Safari", capturing that version.


];

// #endregion BRO_PAT_ARR



const FOR_NAM_STR = 'support'; // What: Form Name String. Why: Netlify matches an incoming POST to its own detected form by this exact "form-name" value. How: This is posted as the 'form-name' field and must match index.html's own static <form name="support">.



const SUP_EMA_STR = 'support@easemylife.app'; // What: Support Email String. Why: This is the fallback address shown when the in-app form fails to send. How: This is rendered in the failure message and copied by copAdrFun.

// #endregion Constants



// #region Helpers

// #region detBroFun

/**
 * detBroFun = Detect Browser Function
 *
 * @summary
 * A lightweight browser name + version sniff for the support form's
 * read-only diagnostic fields. Covers the common engines listed in
 * BRO_PAT_ARR and falls back to the raw user-agent string if nothing
 * matches, rather than guessing wrong.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns A short "Name X.Y" label for a recognized browser, or the
 * raw navigator.userAgent string otherwise.
 *
 * @example
 * ```ts
 * detBroFun() // => 'Chrome 128.0'
 * ```
 *
*/

function detBroFun () : string {


	const useAgeStr = navigator.userAgent; // What: User Agent String. Why: Every pattern below is matched against the browser's own real user-agent string. How: This reads navigator.userAgent once, reused by every pattern check below.


	for ( const broPatObj of BRO_PAT_ARR ) { // What: Pattern Match Loop. Why: The first pattern that actually matches the real user-agent string wins. How: This iterates BRO_PAT_ARR in order, returning as soon as one pattern matches.


		const matResArr = useAgeStr.match( broPatObj.regObj ); // What: Match Result Array. Why: This is the actual test of whether this pattern recognizes the current browser. How: This runs broPatObj's own regObj against useAgeStr, producing null or a match array with the captured version in [1].


		if ( matResArr ) return `${ broPatObj.namStr } ${ matResArr[ 1 ].split( '.' ).slice( 0, 2 ).join( '.' ) }`; // What: Recognized Browser Return. Why: A recognized browser should report its own name and a short major.minor version, not the full patch string. How: This returns "Name X.Y", trimming the captured version down to its first 2 dot-separated parts.


	}



	return useAgeStr; // What: Unrecognized Fallback Return. Why: An unrecognized browser is still worth reporting for diagnostics, even without a friendly name. How: This returns the raw user-agent string as-is.


}

// #endregion detBroFun

// #endregion Helpers



// #region Components

// #region ConSupCom

/**
 * ConSupCom = Contact Support Component
 *
 * @summary
 * A collapsible card (the same disclosure pattern used elsewhere in the
 * app) holding a small support form: subject, message, and 2 read-only
 * diagnostic fields (app version + browser) so bug reports arrive with
 * useful context already attached.
 *
 * Send POSTs to Netlify Forms. 2 things this depends on OUTSIDE this
 * file: (1) the static `<form name="support" netlify hidden>` in
 * index.html, since Netlify detects forms by parsing the built HTML at
 * deploy time and never runs the app itself, so a React-rendered form
 * alone is invisible to it (the field names there MUST match the keys
 * posted below); (2) Netlify's Forms feature being enabled for the site,
 * with a notification email configured, so submissions actually reach an
 * inbox rather than only the Netlify dashboard.
 *
 * If the POST fails for any reason (offline, Forms not enabled, a deploy
 * that dropped the static form), the user is shown the address instead
 * and their own typed text is preserved.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props - This component does not use any props.
 *
 * @returns The "Having problems?" trigger card, plus the collapsible
 * support form beneath it.
 *
 * @example
 * ```tsx
 * ConSupCom({}) // => <ConSupCom />
 * ```
 *
*/

function ConSupCom () : React.JSX.Element {


	// #region Form State

	const [ forOpeBoo, setForOpeBoo ] = React.useState( false ); // What: Form Open Boolean And Setter. Why: The support form is not persisted; it always starts closed on load. How: This gates the ColDisCom below and is flipped by opeForFun/canForFun.
	const [ draSubStr, setDraSubStr ] = React.useState( '' );    // What: Draft Subject String And Setter. Why: The subject field needs somewhere to hold its own typed value before sending. How: This is bound to the subject input below and read by senForFun.
	const [ draMesStr, setDraMesStr ] = React.useState( '' );    // What: Draft Message String And Setter. Why: The message field needs somewhere to hold its own typed value before sending. How: This is bound to the message textarea below and read by senForFun.
	const [ senTimNum, setSenTimNum ] = React.useState( 0 );     // What: Sent Time Number And Setter. Why: A successful send needs both a truthy flag and a fresh React key to replay the "sent" note if the user sends a second message later. How: This is set to Date.now() on a successful send and used as both the visibility check and the key below.
	const [ shoErrBoo, setShoErrBoo ] = React.useState( false ); // What: Show Error Boolean And Setter. Why: Pressing Send with an empty field needs to surface a validation message. How: This is set true by senForFun's own guard and cleared on every subsequent send attempt.
	const [ senFaiBoo, setSenFaiBoo ] = React.useState( false ); // What: Send Failed Boolean And Setter. Why: A failed POST needs to surface the fallback address instead of leaving the user stuck. How: This is set inside senForFun's own catch handler.
	const [ adrCopBoo, setAdrCopBoo ] = React.useState( false ); // What: Address Copied Boolean And Setter. Why: The fallback "Copy address" button needs to confirm the copy actually happened. How: This is set true by copAdrFun and cleared 2400ms later.
	const [ botFieStr, setBotFieStr ] = React.useState( '' );    // What: Bot Field String And Setter. Why: A spam bot filling this hidden field is the signal a real human never would. How: This is posted alongside the real fields and left for Netlify's own spam filtering to act on. // Honeypot. Bots fill every field they find; humans never see this one, so a non-empty value means we silently accept and drop the submission.
	const [ isaSenBoo, setIsaSenBoo ] = React.useState( false ); // What: Is-A Sending Boolean And Setter. Why: A second Send press must not fire a second overlapping request while one is already in flight. How: This gates senForFun's own guard and disables the Send button while true.

	const broNamStr = React.useMemo( () => detBroFun(), [] );    // What: Browser Name String. Why: The diagnostic fields need the detected browser, computed once rather than on every render. How: This memoizes detBroFun's own return value with an empty dependency array.
	const appVerStr = APP_VER_STR == null ? '1.0' : APP_VER_STR; // What: App Version String. Why: The diagnostic fields still need a sane version to show even on a build where the define is missing. How: This falls back to '1.0' when APP_VER_STR is null.
	const forCarRef = React.useRef( null );                      // What: Form Card Reference. Why: opeForFun needs a handle on the rendered form to scroll it into view. How: This is attached to the supForDiv div's own ref prop below.
	const canSenBoo = draSubStr.trim() && draMesStr.trim();      // What: Can Send Boolean. Why: The Send button's own enabled state, and the validation guard, both depend on both drafts actually holding text. How: This is true only while both draSubStr and draMesStr trim to something non-empty.

	// #endregion Form State



	// #region Form Actions

	// #region opeForFun

	/**
	 * opeForFun = Open Form Function
	 *
	 * @summary
	 * Opens the Contact Support form and brings it into view. After ColDisCom's
	 * expand animation finishes, it scrolls the form into view only when its
	 * bottom would otherwise sit below the fold.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * opeForFun() // => void
	 * ```
	 *
	*/

	const opeForFun = () => { // What: Open Form Function. Why: "Contact Support" needs to actually expand the form and bring it into view. How: This opens the form, then (after ColDisCom's own expand animation finishes) scrolls it into view if it would otherwise sit below the fold.


		setForOpeBoo( true ); // What: Form Open Call. Why: This is the actual trigger that expands the ColDisCom below. How: This flips forOpeBoo to true.

		setTimeout( () => { // What: Scroll-Into-View Timeout. Why: Scrolling must wait until ColDisCom's own expand animation has actually finished, so the form's final height (not a mid-animation one) is what gets measured. How: This waits 360ms, matching ColDisCom's own animation duration, before measuring and possibly scrolling.


			const forCurEle = forCarRef.current;                                                         // What: Form Current Element. Why: This gives a stable local handle on the rendered form for this measurement pass. How: This is read once from forCarRef.current.
			const scrConEle = forCurEle && forCurEle.closest( '[data-element-name-hook~="appConMai"]' ); // What: Scroll Container Element. Why: The shared scroll container is what actually needs to be scrolled, not the form itself. How: This walks up from forCurEle to the nearest ancestor matching '.appConMai'.


			if ( !forCurEle || !scrConEle ) return; // What: Missing Element Guard. Why: Nothing can be measured or scrolled if either element is not actually mounted. How: This bails out early whenever either lookup above failed.



			const forRecObj = forCurEle.getBoundingClientRect();                                                                  // What: Form Rect Object. Why: Deciding whether the form overflows below the fold requires its own real, current position and size. How: This is compared against conRecObj below.
			const conRecObj = scrConEle.getBoundingClientRect();                                                                  // What: Container Rect Object. Why: The visible scroll boundary is relative to the container, not the viewport. How: This is combined with forRecObj and the bottom tab bar's own rect below.
			const barCurEle = document.querySelector( '[data-placement="bottom"] > [data-element-name-hook~="appTabNav"]' );      // What: Bar Current Element. Why: A bottom-placed tab bar's own top edge is the real scroll boundary, when one exists. How: This queries for it directly; other placements leave this null. // The floating bottom tab bar overlays .main rather than sitting outside it, so its own top edge, not the container's raw bottom, is the real visible boundary content can scroll up to. Other tab placements (side/top) don't occupy this edge, so .appTabNav--bottom simply won't exist and conRecObj.bottom is used as-is.
			const visBotNum = barCurEle ? Math.min( conRecObj.bottom, barCurEle.getBoundingClientRect().top ) : conRecObj.bottom; // What: Visible Bottom Number. Why: This is the actual usable bottom edge content can scroll up to. How: This takes whichever is smaller, the container's own bottom or the bottom bar's own top, falling back to the container's bottom when there is no bottom bar.
			const oveBelNum = forRecObj.bottom - visBotNum + rhyPxlFun( 'p02' );                                                  // What: Overflow Below Number. Why: Only a form that actually overflows past the visible bottom edge needs any scrolling at all. How: This is the form's own bottom minus the visible bottom edge, plus a p02 step of breathing room. // Bring the form's bottom into view (with a little breathing room), but never scroll past its top, so the "Having problems?" row stays visible too when the form is short enough to fit alongside it. // Vertical Rhythm Base Plus 2 ~= 25.572px


			if ( oveBelNum > 0 ) { // What: Overflow Check. Why: The form should only actually be scrolled when it truly overflows below the fold. How: This scrolls the container only while oveBelNum is positive.


				scrConEle.scrollTo({ // What: Scroll Into View Call. Why: This is the actual scroll that brings the form's bottom into view. How: This scrolls the container down by exactly the overflow amount.


					behavior : redMotFun() ? 'auto' : 'smooth', // What: Behavior. Why: A user who prefers reduced motion should not see an animated scroll. How: This picks 'auto' under reduced motion, 'smooth' otherwise.
					top      : scrConEle.scrollTop + oveBelNum  // What: Top. Why: This is the scroll target that just clears the overflow. How: This adds oveBelNum to the container's own current scrollTop.


				});


			}


		}, durMilFun( 'p02' ) ); // What: Expand Animation Delay. Why: The scroll must measure the form's final height. How: This waits the same p02 duration step ColDisCom expands over. // Duration Base Plus 2 ~= 277.0ms


	};

	// #endregion opeForFun



	const canForFun = () => { // What: Cancel Form Function. Why: Cancelling the form should discard the draft and fully reset its own transient state. How: This clears both drafts and every transient flag, then closes the form.


		setDraSubStr( '' );    // What: Draft Subject Reset. Why: A cancelled form must not leave stale text behind for next time. How: This clears the subject draft.
		setDraMesStr( '' );    // What: Draft Message Reset. Why: A cancelled form must not leave stale text behind for next time. How: This clears the message draft.
		setShoErrBoo( false ); // What: Show Error Reset. Why: A cancelled form must not leave a stale validation message behind for next time. How: This clears the validation-error flag.
		setSenFaiBoo( false ); // What: Send Failed Reset. Why: A cancelled form must not leave a stale fallback state behind for next time. How: This clears the send-failed flag.
		setAdrCopBoo( false ); // What: Address Copied Reset. Why: A cancelled form must not leave a stale copy confirmation behind for next time. How: This clears the address-copied flag.

		setForOpeBoo( false ); // What: Form Close Call. Why: This is the actual trigger that collapses the form again. How: This flips forOpeBoo back to false.


	};



	const copAdrFun = () => { // What: Copy Address Function. Why: The fallback row lets a user copy the support address with one click instead of selecting it by hand. How: This writes SUP_EMA_STR to the clipboard when available, confirming success for 2400ms.


		const copDonFun = () => { // What: Copy Done Function. Why: A successful copy needs to show a brief confirmation, then revert. How: This flips adrCopBoo true, then false again 2400ms later.


			setAdrCopBoo( true ); // What: Address Copied Set. Why: This shows the "Copied" confirmation on the button. How: This flips adrCopBoo true.

			setTimeout( () => setAdrCopBoo( false ), 2400 ); // What: Address Copied Revert Timeout. Why: The confirmation should only show briefly. How: This flips adrCopBoo back to false 2400ms later.


		};



		try { // What: Clipboard Write Try. Why: Some browsers throw synchronously when the Clipboard API is touched outside a secure context. How: This wraps the write so the catch below can swallow that.


			if ( navigator.clipboard && navigator.clipboard.writeText ) navigator.clipboard.writeText( SUP_EMA_STR ).then( copDonFun, () => {} ); // What: Clipboard Write Attempt. Why: The Clipboard API is not universally available, and a rejected promise here should not surface as an error. How: This writes SUP_EMA_STR to the clipboard when the API exists, silently ignoring a rejection.


		}

		catch ( errCatObj ) {} // What: Clipboard Error Guard. Why: A clipboard failure must never crash the form, since the address is on screen either way. How: This silently swallows any error.


	};



	// #region senForFun

	/**
	 * senForFun = Send Form Function
	 *
	 * @summary
	 * Submits the support form to Netlify Forms. It ignores a second press while
	 * a request is in flight and shows the validation message when either field
	 * is empty. On a successful response it clears both drafts, stamps the sent
	 * confirmation and closes the form; on any failure it keeps the drafts and
	 * shows the fallback email row instead.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * senForFun() // => void
	 * ```
	 *
	*/

	const senForFun = () => { // What: Send Form Function. Why: This is the actual submit action behind the Send button. How: This validates both drafts, POSTs to Netlify Forms, and only clears the drafts once that POST actually succeeds. // POST to Netlify Forms. Netlify listens for form-encoded POSTs on any path of the site and matches them to a detected form by the `form-name` field, hence posting to '/' rather than to an endpoint of our own. // Only clear the form on success. A failed send must never eat what the user typed, which is the whole reason this waits on the response instead of optimistically confirming.


		if ( isaSenBoo ) return; // What: Already Sending Guard. Why: A second Send press while one request is already in flight must not fire a second, overlapping one. How: This bails out early whenever isaSenBoo is already true.



		if ( !canSenBoo ) { setShoErrBoo( true ); return; } // What: Draft Validity Guard. Why: Both fields are required before anything can be sent. How: This surfaces the validation message and bails out whenever canSenBoo is false.



		setShoErrBoo( false ); // What: Show Error Reset. Why: A fresh send attempt must not carry over a stale validation message. How: This clears the validation-error flag.
		setSenFaiBoo( false ); // What: Send Failed Reset. Why: A fresh send attempt must not carry over a stale failure state. How: This clears the send-failed flag.
		setIsaSenBoo( true );  // What: Sending Flag Set. Why: The request is now in flight. How: This marks isaSenBoo true until the request settles.


		const reqBodStr = new URLSearchParams({ // What: Request Body String. Why: Netlify Forms expects a standard form-encoded POST body, matching the static form's own field names in index.html. How: This builds that body from the form-name, the honeypot, and the 4 real fields.


			'bot-field' : botFieStr,        // What: Bot Field. Why: This is the honeypot a real human never fills. How: This posts botFieStr as-is for Netlify's own spam filter.
			browser     : broNamStr,        // What: Browser. Why: Bug reports need the sender's own browser. How: This posts the detected browser label.
			'form-name' : FOR_NAM_STR,      // What: Form Name. Why: Netlify matches the POST to its own detected form by this field. How: This posts FOR_NAM_STR.
			message     : draMesStr.trim(), // What: Message. Why: This is the body of the support request. How: This posts the trimmed message draft.
			subject     : draSubStr.trim(), // What: Subject. Why: This is the subject line of the support request. How: This posts the trimmed subject draft.
			version     : appVerStr         // What: Version. Why: Bug reports need the app version they were sent from. How: This posts appVerStr.


		}).toString(); // What: Body Encoding Call. Why: fetch needs the form fields as one encoded string. How: This serializes the URLSearchParams to a form-encoded body.


		fetch( '/', { // What: Support Form Post Call. Why: This is the actual submission to Netlify Forms. How: This POSTs reqBodStr to the site root as a form-encoded body.


			body    : reqBodStr,                                                // What: Body. Why: This is the encoded form payload. How: This passes reqBodStr.
			headers : { 'Content-Type' : 'application/x-www-form-urlencoded' }, // What: Headers. Why: Netlify only parses a form-encoded body. How: This sets the matching Content-Type.
			method  : 'POST'                                                    // What: Method. Why: A form submission is a POST. How: This sets the request method.


		} ).then( ( fetResObj ) => { // What: Fetch Then Handler. Why: Netlify's own response status is the only reliable signal of whether the submission was actually accepted. How: This throws on a non-ok status (caught below), otherwise clears the drafts and shows the sent confirmation.


			if ( !fetResObj.ok ) throw new Error( 'HTTP ' + fetResObj.status ); // What: Non-Ok Status Guard. Why: Netlify can accept the connection but still reject the submission itself. How: This throws, routing to the catch handler below, whenever the response status is not ok.



			setDraSubStr( '' ); // What: Draft Subject Clear. Why: A successfully sent message should not linger in the form. How: This clears the subject draft.
			setDraMesStr( '' ); // What: Draft Message Clear. Why: A successfully sent message should not linger in the form. How: This clears the message draft.

			setSenTimNum( Date.now() ); // What: Sent Time Stamp. Why: The user needs to see a confirmation, replayed on every successful send. How: This stamps senTimNum with the current time.

			setForOpeBoo( false ); // What: Form Close Call. Why: The form itself no longer needs to stay open once sent. How: This flips forOpeBoo back to false.


		} ).catch( () => { // What: Fetch Catch Handler. Why: Offline, Forms not enabled, or the static form missing from the build all surface here. How: This flags the send as failed so the fallback address can be shown.


			setSenFaiBoo( true ); // What: Send Failed Flag. Why: This is what actually surfaces the fallback address and copy button below. How: This flips senFaiBoo to true.


		} ).then( () => { // What: Fetch Finally Handler. Why: Whether the request succeeded or failed, it is no longer in flight. How: This clears isaSenBoo regardless of which branch above ran.


			setIsaSenBoo( false ); // What: Sending Flag Clear. Why: The Send button must re-enable once this attempt has actually finished. How: This flips isaSenBoo back to false.


		} );


	};

	// #endregion senForFun

	// #endregion Form Actions



	return (


		<React.Fragment>{ /* What: Contact Support Fragment Element. Why: The "Having problems?" trigger card and the collapsible form below it are true siblings with no shared wrapper of their own. How: This groups both without adding an extra DOM node. */ }


			<CarSurCom>{ /* What: Card Surface Component. Why: "Having problems?" needs its own bordered container, matching every other row in this tab. How: This wraps the trigger row below. */ }


				<div
					className={ cssModObj.setRowDiv }

					data-element-name-hook='supTriDiv'
				>{ /* What: Contact Trigger Div Element. Why: The label/description and the trigger button need to sit in the tab's usual info-plus-action row layout. How: This wraps the info block and the Contact Support button. Its data-element-name-hook is read by help mode's Settings catalog. */ }


					<div className={ cssModObj.setInfDiv }>{ /* What: Contact Info Div Element. Why: The row's own name/description/sent-note need their own grouping, apart from the button. How: This wraps the name span, the description span, and (conditionally) the sent-confirmation span. */ }


						<span className={ cssModObj.setNamSpa }>Having problems?</span>{ /* What: Set Data Name Span Element. Why: Every row in this tab names itself with this same span. How: This renders the fixed label "Having problems?". */ }

						<span className={ cssModObj.setSubSpa }>Send a note and it&rsquo;ll come through with your app version and browser attached, so there&rsquo;s no back-and-forth to track those down.</span>{ /* What: Set Data Sub Span Element. Why: Every row in this tab explains itself with this same span. How: This renders the fixed description text. */ }

						{ senTimNum > 0 && ( // What: Sent Confirmation Check. Why: A confirmation note should only exist right after an actual successful send. How: This renders the confirmation span only while senTimNum holds a real timestamp.


							<span
								key={ senTimNum }

								className={ cssModObj.setMesSpa }

								role='status'
							>Message sent, thanks! I&rsquo;ll be in touch.</span> // What: Sent Confirmation Span Element. Why: This is the actual confirmation text shown after a successful send. How: This is remounted (via its own senTimNum key) so a repeat send replays the announcement.


						) }


					</div>



					<ButBasCom
						kinValStr='secondary'
						sizValStr='sm'

						onClick={ opeForFun }
					>Contact Support</ButBasCom>{ /* What: Button Base Component. Why: This is the actual trigger that expands the support form below. How: This calls opeForFun when clicked. */ }


				</div>


			</CarSurCom>



			<ColDisCom open={ forOpeBoo }>{ /* What: Collapse Disclosure Component. Why: The support form itself should stay collapsed until the trigger above is pressed. How: This mounts/expands its own CarSurCom below, gated on forOpeBoo. */ }


				<CarSurCom>{ /* What: Card Surface Component. Why: The form's own fields need the same bordered container as every other card in this tab. How: This wraps the whole supForDiv div below. */ }


					<div
						ref={ forCarRef }

						className={ cssModObj.supForDiv }

						data-element-name-hook='supForDiv'
					>{ /* What: Support Form Div Element. Why: This is the form's own root, giving opeForFun a stable element to measure and scroll to. How: This wraps the subject/message fields, the diagnostic fields, the honeypot, and the form's own footer buttons. Its data-element-name-hook is read by help mode's Settings catalog. */ }


						<label className={ cssModObj.supFieLab }>{ /* What: Subject Label Element. Why: The subject input needs its own labeled field wrapper, matching the message field below. How: This wraps the visible field label and the subject input itself. */ }


							<span className={ cssModObj.supLabSpa }>Subject</span>{ /* What: Support Flabel Span Element. Why: The subject input needs a visible label. How: This renders the fixed text "Subject". */ }

							<input
								className={ cssModObj.supSubInp }

								placeholder='What’s going on?'
								type='text'
								value={ draSubStr }

								onChange={ ( chaEveObj ) => setDraSubStr( chaEveObj.target.value ) }
							/>{ /* What: Draft Subject Input Element. Why: The user needs a text field to type the support message's own subject into. How: This is bound to draSubStr. */ }


						</label>

						<div className={ cssModObj.supFieDiv }>{ /* What: Message Field Div Element. Why: The message textarea needs its own explicit label element rather than an implicit wrapping label, since its id must differ from index.html's own static form (see the comment on that id below). How: This wraps the message label and the message textarea. */ }


							<label
								className={ cssModObj.supLabLab }

								htmlFor='support-message-input'
							>Message</label>{ /* What: Message Label Element. Why: The message textarea needs a visible, properly-associated label. How: This points at the textarea below via its own distinct id. */ }{ /* The id is "support-message-input", not "support-message", since that id is already taken by index.html's hidden static Netlify form (see its own comment above the <form name="support">), and duplicate ids on the page confused the browser's label matching (both labels applied, announcing "Message Message"). */ }

							<textarea
								id='support-message-input'

								className={ cssModObj.supMesTex }

								placeholder='The more detail, the better.'
								rows={ 4 }
								value={ draMesStr }

								onChange={ ( chaEveObj ) => setDraMesStr( chaEveObj.target.value ) }
							/>{ /* What: Draft Message Textarea Element. Why: The user needs a multi-line field to type the support message's own body into. How: This is bound to draMesStr. */ }


						</div>


						<div className={ cssModObj.supDiaDiv }>{ /* What: Support Diag Div Element. Why: The 2 read-only diagnostic fields need their own grouping, separate from the editable fields above. How: This wraps the app-version field and the browser field. */ }


							<div className={ cssModObj.diaFieDiv }>{ /* What: Version Diag Field Div Element. Why: The app version needs its own labeled diagnostic row. How: This wraps its own label span and value span. */ }


								<span className={ cssModObj.supLabSpa }>App version</span>{ /* What: Support Flabel Span Element. Why: The diagnostic value needs a visible label. How: This renders the fixed text "App version". */ }

								<span className={ cssModObj.diaValSpa }>{ appVerStr }</span>{ /* What: Support Diag Val Span Element. Why: The actual diagnostic value needs to render. How: This renders appVerStr. */ }


							</div>

							<div className={ cssModObj.diaFieDiv }>{ /* What: Browser Diag Field Div Element. Why: The detected browser needs its own labeled diagnostic row. How: This wraps its own label span and value span. */ }


								<span className={ cssModObj.supLabSpa }>Browser</span>{ /* What: Support Flabel Span Element. Why: The diagnostic value needs a visible label. How: This renders the fixed text "Browser". */ }

								<span className={ cssModObj.diaValSpa }>{ broNamStr }</span>{ /* What: Support Diag Val Span Element. Why: The actual diagnostic value needs to render. How: This renders broNamStr. */ }


							</div>


						</div>


						<p
							className={ cssModObj.supHonPar }

							aria-hidden='true'
						>{ /* What: Honeypot Paragraph Element. Why: A real human never sees or fills this field, so any bot that does gives itself away. How: This wraps a label and input a screen reader never announces, hidden from assistive tech entirely. */ }


							<label>{ /* What: Honeypot Label Element. Why: A hidden form field still technically needs a label. How: This wraps the honeypot input below inside its own label text. */ }


								Don&rsquo;t fill this out if you&rsquo;re human:

								<input
									name='bot-field'

									autoComplete='off'
									value={ botFieStr }

									tabIndex={ -1 }

									onChange={ ( chaEveObj ) => setBotFieStr( chaEveObj.target.value ) }
								/>{ /* What: Bot Field Input Element. Why: A non-empty value here is the actual honeypot signal. How: This is bound to botFieStr and posted alongside the real fields. */ }


							</label>


						</p>

						<div
							className={ cssModObj.supFooDiv }

							data-element-name-hook='supFooDiv'
						>{ /* What: Support Form Foot Div Element. Why: The validation/failure messages and the form's own action buttons need their own grouping at the bottom. How: This wraps whichever messages currently apply plus the Cancel/Send buttons. Its data-element-name-hook is read by help mode's Settings catalog. */ }


							{ shoErrBoo && !canSenBoo && ( // What: Validation Message Check. Why: A validation message should only show while the form is actually invalid and the user has already tried to send. How: This renders the message only while both conditions hold.


								<span
									key='verr'

									className={ cssModObj.supValSpa }
								>Please fill out both form fields.</span> // What: Validation Message Span Element. Why: This is the actual validation copy shown on an empty-field send attempt. How: This renders fixed text explaining what is missing.


							) }

							{ senFaiBoo && !shoErrBoo && ( // What: Failure Message Check. Why: The fallback address should only show after an actual failed send, and not alongside an unrelated validation message. How: This renders the fallback message only while both conditions hold.


								<span
									key='sfail'

									className={ cssModObj.supFalSpa }

									role='status'
								>{ /* What: Failure Message Span Element. Why: This is the actual fallback copy shown on a failed send. How: This explains the likely cause and surfaces the raw support address. */ }


									Couldn&rsquo;t send. You may be offline. Your message is still here, so try again, or write to <span className={ cssModObj.falAdrSpa }>{ SUP_EMA_STR }</span>.


								</span>


							) }



							{ senFaiBoo && !shoErrBoo && ( // What: Copy Address Button Check. Why: The copy-address shortcut should only show alongside the fallback message above. How: This renders the button only while both conditions hold, same as the message above.


								<ButBasCom
									kinValStr='ghost'
									sizValStr='sm'

									onClick={ copAdrFun }
								>{ adrCopBoo ? 'Copied' : 'Copy address' }</ButBasCom> // What: Button Base Component. Why: This lets the user copy the fallback address without selecting it by hand. How: This calls copAdrFun when clicked, and its own label reflects adrCopBoo.


							) }



							<ButBasCom
								kinValStr='ghost'
								sizValStr='sm'

								onClick={ canForFun }
							>Cancel</ButBasCom>{ /* What: Button Base Component. Why: The form needs an explicit way to back out without sending. How: This calls canForFun when clicked. */ }



							<ButBasCom
								disabled={ isaSenBoo }
								kinValStr='secondary'
								sizValStr='sm'

								onClick={ senForFun }
							>{ isaSenBoo ? 'Sending…' : 'Send' }</ButBasCom>{ /* What: Button Base Component. Why: This is the form's own actual submit action. How: This calls senForFun when clicked, disabling itself and relabeling while isaSenBoo is true. */ }


						</div>


					</div>


				</CarSurCom>


			</ColDisCom>


		</React.Fragment>


	);


}

// #endregion ConSupCom

// #endregion Components



// #region Exports

export { ConSupCom }; // What: Named Export. Why: TabSetCom renders the support form in its Account section. How: This exports ConSupCom by name; its constants and detBroFun stay private to this file.

// #endregion Exports


