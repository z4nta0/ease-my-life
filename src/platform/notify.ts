


// #region Imports

import { subMakFun } from '../utils/subscribers.ts'; // What: Subscriber Make Function. Why: Permission changes reach this module's own subscribers. How: This makes the subscriber set once, in Module State.

// #endregion Imports



/**
 * notify.ts = Local Notification Module
 *
 * @summary
 * Local notifications: these fire only while the app is running, whether
 * the tab is in the foreground or backgrounded. The page itself is what
 * decides to show one; delivering to a fully closed app would need Web
 * Push plus a real backend, which this app deliberately doesn't have.
 *
 * Deliberate constraints: the click handler this module attaches only focuses
 * the existing window, never triggering a second generation. It stays silent
 * whenever the app is already visible and focused, since a notification for a
 * page the user is already looking at is pure noise. It fires at most once per
 * local day, tracked in localStorage so a reload can't re-notify. Permission
 * is asked for only by askOncFun and reqPerFun, and nothing here asks for it
 * on load.
 *
 * Sections:
 *  - Types
 *  - Constants
 *  - Module State
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Types

type PerStaTyp = NotificationPermission | 'unsupported'; // What: Permission State Type. Why: Callers show the browser's notification permission, or that the browser has no Notification API at all. How: This is the browser's own permission value plus 'unsupported'.

// #endregion Types



// #region Constants

const ASK_KEY_STR = 'easemylife.notifyasked'; // What: Ask Key String. Why: This is the localStorage key that tracks whether permission has already been requested once. How: This is read by askCheFun and written by askOncFun/reqPerFun below.
const DAY_KEY_STR = 'easemylife.notifiedday'; // What: Day Key String. Why: This is the localStorage key that tracks the last local day this module already notified on. How: This is read/written by stoGetFun/stoSetFun inside genNotFun's own once-per-day guard below.

// #endregion Constants



// #region Module State

const { notSubFun, subAddFun } = subMakFun(); // What: Notify Subscribers Function. Why: Every subscriber needs to hear about a permission change the moment askOncFun/reqPerFun resolve one. How: This calls every subscriber, none of them able to stop the rest by throwing. // What: Subscribe Add Function. Why: A caller (the Settings page's permission-state display) needs a way to register for permission-change broadcasts and later unregister again. How: This adds a subscriber and returns its own removal function.

// #endregion Module State



// #region Helpers

// #region Storage Access

// #region stoGetFun

/**
 * stoGetFun = Storage Get Function
 *
 * @summary
 * Reads one localStorage value without throwing. A browser that blocks or
 * breaks localStorage gives null, the same as a key that was never written, so
 * callers treat both as not set.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param stoKeyStr - Storage Key String: The localStorage key to read.
 *
 * @returns The stored text, or null when the key is unset or the read failed.
 *
 * @example
 * ```ts
 * stoGetFun(stoKeyStr) // => '2026-11-21'
 * ```
 *
*/

const stoGetFun = ( stoKeyStr : string ) => { // What: Storage Get Function. Why: localStorage can throw when a browser blocks or breaks it, and a failed read should never crash the caller. How: This wraps getItem in a try/catch, returning null on any failure instead of throwing.


	try { return localStorage.getItem( stoKeyStr ); } // What: Storage Get Try. Why: This is the actual read this function exists to perform. How: This returns whatever getItem resolves to for stoKeyStr, including null when the key isn't set.

	catch { return null; } // What: Storage Get Guard. Why: A browser that blocks or breaks localStorage can throw on read. How: This returns null instead of letting the error propagate.


};

// #endregion stoGetFun



const stoSetFun = ( stoKeyStr : string, stoValStr : string ) => { // What: Storage Set Function. Why: Same reasoning as stoGetFun above, for writes: a failed write should never crash the caller. How: This wraps setItem in a try/catch, silently doing nothing on any failure.


	try { localStorage.setItem( stoKeyStr, stoValStr ); } // What: Storage Set Try. Why: This is the actual write this function exists to perform. How: This calls setItem with stoKeyStr and stoValStr.

	catch {} // What: Storage Set Guard. Why: A private-mode or full-quota localStorage can throw on write. How: This silently does nothing instead of letting the error propagate.


};

// #endregion Storage Access



// #region Local Day

const padZerFun = ( rawValNum : number ) => String( rawValNum ).padStart( 2, '0' );                                                                        // What: Pad Zero Function. Why: A local-day string needs its month/day components zero-padded to 2 digits each. How: This stringifies the given number and left-pads it with '0' to a length of 2.
const locDayFun = ( dayDatObj : Date ) => `${ dayDatObj.getFullYear() }-${ padZerFun( dayDatObj.getMonth() + 1 ) }-${ padZerFun( dayDatObj.getDate() ) }`; // What: Local Day Function. Why: The once-per-day guard needs a stable, comparable string for "today" in the user's own local time zone. How: This builds a YYYY-MM-DD string from the given Date's own local year/month/day, zero-padding month and day via padZerFun.

// #endregion Local Day



// #region Permission Requests

const askCheFun = () => !!stoGetFun( ASK_KEY_STR );                // What: Ask Check Function. Why: askOncFun below must not prompt again once a prompt has been answered. How: This reports whether the one-time "asked" flag has already been written.
const notSupFun = () => typeof window.Notification === 'function'; // What: Notification Support Function. Why: Every other function below needs to know whether the browser has the Notification API at all before doing anything else with it. How: This checks that window.Notification exists and is itself a function.



// #region perCheFun

/**
 * perCheFun = Permission Check Function
 *
 * @summary
 * The browser's current notification permission, read live every call.
 * A browser without the Notification API reports 'unsupported' instead
 * of throwing, so callers can treat it as one more display state.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns 'default', 'granted', 'denied', or 'unsupported'.
 *
 * @example
 * ```ts
 * perCheFun() // => 'granted'
 * ```
 *
*/

const perCheFun = () : PerStaTyp => ( notSupFun() ? Notification.permission : 'unsupported' ); // What: Permission Check Function. Why: Callers (the Settings page's own display) need the current permission state without caring whether the API even exists. How: This reports Notification.permission when supported, or the literal string 'unsupported' otherwise.

// #endregion perCheFun



// #region askOncFun

/**
 * askOncFun = Ask Once Function
 *
 * @summary
 * Requests notification permission, then stops asking once a prompt has
 * been answered. It is meant to run from a user gesture, such as the
 * Settings run-time change. Skips straight to reporting the current
 * permission, without prompting again, once the browser doesn't support
 * notifications at all, the permission has already moved away from
 * 'default', or this module has already asked once before. Only burns the
 * one-time "asked" flag once the user has actually answered the prompt:
 * dismissing it (or a context that blocks it outright) leaves the
 * permission at 'default', so the module should still be allowed to ask
 * again later in that case.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns A promise that resolves with the current permission:
 *          {@link perCheFun}'s result when the guard above short-circuits,
 *          or the prompt's result otherwise.
 * @see {@link perResStr}
 *
 * @example
 * ```ts
 * await askOncFun() // => 'granted'
 * ```
 *
*/

async function askOncFun () : Promise< PerStaTyp > {


	if ( !notSupFun() || Notification.permission !== 'default' || askCheFun() ) return perCheFun(); // What: Ask Guard Clause. Why: There is nothing to prompt for when notifications aren't supported at all, the permission has already moved past 'default', or this module has already asked once before. How: This checks all 3 conditions with ||, short-circuiting on the first true one, and returns the current permission instead of prompting.



	let perResStr : NotificationPermission = 'default'; // What: Permission Result String. Why: This holds the actual outcome of the prompt below, defaulting to 'default' in case the prompt itself throws. How: This is reassigned by the try block right after it, then returned at the end of this function.



	try { perResStr = await Notification.requestPermission(); } // What: Request Permission Try. Why: The prompt can fail, and the permission should then stay as it was. How: This awaits the modern Promise-returning form and falls back to leaving perResStr at its default value on any error.

	catch {} // What: Request Permission Guard. Why: The prompt can fail, and the permission should then stay as it was. How: This leaves perResStr at its default value instead of letting the error propagate.



	if ( perResStr !== 'default' ) stoSetFun( ASK_KEY_STR, '1' ); // What: Ask Flag Write Guard. Why: The one-time "asked" flag must only be burned once the user has actually answered the prompt; a dismissal leaves the permission at 'default' and should still be askable later. How: This writes the flag only when perResStr resolved to something other than 'default'.



	notSubFun(); // What: Notify Subscribers Call. Why: Every subscriber (the Settings page's own permission-state display) needs to hear about this potential permission change. How: This calls notSubFun with no arguments, notifying every current subscriber.



	return perResStr; // What: Permission Result Return. Why: The caller needs the actual resolved (or defaulted) permission value back. How: This returns the same perResStr the try block above may have reassigned.


}

// #endregion askOncFun



// #region reqPerFun

/**
 * reqPerFun = Request Permission Function
 *
 * @summary
 * Re-asks for notification permission. The person may have changed it
 * outside the app, so this reads the permission on every call rather than
 * trusting a cached value.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns A promise that resolves with the current permission, or the literal
 *          string 'unsupported' when the browser has no Notification API.
 * @see {@link perResStr}
 *
 * @example
 * ```ts
 * await reqPerFun() // => 'granted'
 * ```
 *
*/

async function reqPerFun () : Promise< PerStaTyp > {


	if ( !notSupFun() ) return 'unsupported'; // What: Support Guard Clause. Why: There is nothing to request when the browser has no Notification API at all. How: This returns the literal string 'unsupported' early instead of touching Notification.permission below.



	stoSetFun( ASK_KEY_STR, '1' ); // What: Ask Flag Write. Why: Re-asking is an explicit request, the same signal askOncFun's own one-time flag exists to capture. How: This writes the flag unconditionally, so askOncFun never prompts on its own afterwards.



	let perResStr = Notification.permission; // What: Permission Result String. Why: This holds the actual outcome this function returns, defaulting to whatever the permission already is. How: This is reassigned by the try block right after it, then returned at the end of this function.



	try { if ( perResStr === 'default' ) perResStr = await Notification.requestPermission(); } // What: Request Permission Try. Why: A prompt can only be shown while the permission is still 'default'. How: This awaits the modern Promise-returning form only when needed, leaving perResStr unchanged on any error.

	catch {} // What: Request Permission Guard. Why: The request can fail. How: This leaves perResStr unchanged instead of letting the error propagate.



	notSubFun(); // What: Notify Subscribers Call. Why: Every subscriber (the Settings page's own permission-state display) needs to hear about this potential permission change. How: This calls notSubFun with no arguments, notifying every current subscriber.



	return perResStr; // What: Permission Result Return. Why: The caller needs the actual resolved (or unchanged) permission value back. How: This returns the same perResStr the try block above may have reassigned.


}

// #endregion reqPerFun

// #endregion Permission Requests



// #region genNotFun

/**
 * genNotFun = Generated Notification Function
 *
 * @summary
 * Shows a local notification after an automatic daily-list generation,
 * meant to run right after that generation completes. Fires only when
 * permission is already granted, the app isn't currently visible and
 * focused (a notification for a page the user is already looking at is
 * pure noise), and this local day hasn't already notified once. Prefers the
 * service worker's own showNotification() over the page-level Notification
 * constructor: on Android Chrome the constructor throws (Failed to construct
 * 'Notification'), since it requires a service worker registration there.
 * The click behavior for the service-worker path lives in
 * public/sw-notify.js instead, since SW-owned notifications never reach
 * page-level handlers.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns A promise that resolves with true once a notification was shown
 *          through either path, or false when a guard stops it or both
 *          attempts fail.
 *
 * @example
 * ```ts
 * await genNotFun() // => true
 * ```
 *
*/

async function genNotFun () : Promise< boolean > {


	if ( !notSupFun() || Notification.permission !== 'granted' ) return false; // What: Permission Granted Guard Clause. Why: There is nothing to show when notifications aren't supported at all or the user hasn't already granted permission. How: This checks both conditions with ||, short-circuiting on the first true one.



	// #region Visibility Check

	const appVisBoo = document.visibilityState === 'visible' && document.hasFocus(); // What: App Visible Boolean. Why: A notification for a page the user is already looking at is pure noise. How: This is true only when the tab is both the visible one and actually focused.


	if ( appVisBoo ) return false; // What: App Visible Guard. Why: The whole point of appVisBoo above is to skip showing a notification while it's true. How: This returns early without showing anything when the app is already front and center.

	// #endregion Visibility Check



	// #region Daily Claim

	const curDayStr = locDayFun( new Date() ); // What: Current Day String. Why: The once-per-day guard below needs today's own local-day string to compare against. How: This calls locDayFun with a freshly-constructed Date for right now.


	if ( stoGetFun( DAY_KEY_STR ) === curDayStr ) return false; // What: Already Notified Guard. Why: This local day must not notify more than once, even across a page reload. How: This compares the persisted last-notified day against curDayStr and returns early on a match.



	stoSetFun( DAY_KEY_STR, curDayStr ); // What: Day Claim Write. Why: The day must be claimed before the async work below, so two near-simultaneous calls can't both get past the guard above. How: This writes curDayStr as the new last-notified day immediately, ahead of any await.

	// #endregion Daily Claim



	// #region Notification Content

	const notTitStr = 'Your life is ready to be eased!'; // What: Notification Title String. Why: This is the fixed headline shown on every daily-generation notification. How: This is handed to both the service-worker and page-level notification paths below.

	const notOptObj = { // What: Notification Options Object. Why: This is the fixed set of options shown on every daily-generation notification. How: This is handed to both the service-worker and page-level notification paths below; its own property names are the Notification API's own contract, not this codebase's invention, so they are left as-is.


		badge              : 'assets/icon-192.png',                                               // What: Badge. Why: This is the notification's own small monochrome status-bar badge image, read directly by the browser's Notification API. How: This reuses the same 192px icon asset as the badge source.
		body               : 'Your personalized list for today is ready. Click here to open it.', // What: Body. Why: This is the notification's own secondary line of text, read directly by the browser's Notification API. How: This tells the user their list is ready and that clicking opens it.
		icon               : 'assets/icon-192.png',                                               // What: Icon. Why: This is the notification's own large icon image, read directly by the browser's Notification API. How: This points at the app's own 192px icon asset.
		requireInteraction : false,                                                               // What: Require Interaction. Why: This notification should dismiss itself normally rather than staying pinned, read directly by the browser's Notification API. How: This is fixed false, since nothing about this notification requires the user to act on it.
		tag                : 'eml-daily-' + curDayStr                                             // What: Tag. Why: A shared tag collapses duplicate notifications from multiple open tabs into one, read directly by the browser's Notification API. How: This combines a fixed prefix with curDayStr so only same-day notifications collapse together.


	};

	// #endregion Notification Content



	// #region Notification Delivery

	try { // What: Service Worker Notification Attempt. Why: The service worker's own showNotification() is the only path that works at all on Android Chrome, where the page-level constructor throws. How: This tries the service-worker path first and falls through to the page-level constructor below on any failure.


		if ( navigator.serviceWorker && navigator.serviceWorker.ready ) { // What: Service Worker Ready Guard. Why: A page with no service worker support, or no registration at all, has no showNotification() to call. How: This gates the await below on both the API and the ready promise actually existing.


			const worRegObj = await navigator.serviceWorker.ready; // What: Worker Registration Object. Why: The registration itself is what actually exposes showNotification(). How: This awaits the ready promise to get the live registration.


			if ( worRegObj && worRegObj.showNotification ) { // What: Show Notification Method Guard. Why: A registration without showNotification() has nothing to call. How: This checks the method actually exists before calling it below.


				await worRegObj.showNotification( notTitStr, notOptObj ); // What: Service Worker Notification Call. Why: This is the actual notification display call for this path. How: This hands the fixed title/options to the registration's own showNotification().



				return true; // What: Service Worker Success Return. Why: The caller needs to know a notification was actually shown. How: This returns true once showNotification() has resolved successfully.


			}


		}


	}

	catch { /* fall through to the page-level constructor */ } // What: Service Worker Attempt Catch. Why: Any failure in the service-worker path should fall through to the page-level constructor instead of failing the whole function. How: This swallows the error and lets execution continue past the try block.



	try { // What: Page Notification Attempt. Why: This is the fallback path for a browser that lacks (or hasn't registered) a service worker, so the page-level Notification constructor is used directly. How: This constructs the notification, wires its click handler, and reports success, falling through to the catch below on any failure.


		const pagNotObj = new Notification( notTitStr, notOptObj ); // What: Page Notification Object. Why: This is the fallback path for a browser that lacks (or hasn't registered) a service worker. How: This constructs a page-level Notification directly from the fixed title/options.


		pagNotObj.onclick = () => { // What: Page Notification Click Handler. Why: Clicking the notification should focus the existing window, never regenerate, since the list it's about has already been built. How: This is assigned once, right after construction, and runs the 2 cleanup calls below on click.


			try { window.focus(); } // What: Window Focus Attempt. Why: Focusing the existing tab is the actual point of clicking the notification. How: This calls window.focus(), swallowing any error it throws.

			catch {} // What: Window Focus Guard. Why: Focusing can fail, and that must not stop the close below. How: This silently swallows any error window.focus() itself threw.



			try { pagNotObj.close(); } // What: Notification Close Attempt. Why: The notification should dismiss itself once clicked. How: This calls pagNotObj's own close() and swallows any error the same way.

			catch {} // What: Notification Close Guard. Why: Closing can fail, and that must not surface as an error. How: This silently swallows any error pagNotObj.close() itself threw.


		};



		return true; // What: Page Notification Success Return. Why: The caller needs to know a notification was actually shown. How: This returns true once the page-level Notification has been constructed successfully.


	}

	catch ( errCatObj ) { // What: Page Notification Catch. Why: Both notification paths having failed means the day claimed earlier must be released so a later attempt can still try. How: This releases the claimed day and reports failure.


		console.warn( errCatObj ); // What: Error Warning Call. Why: A real failure here should stay visible to anyone debugging. How: This logs the caught error as a console warning.


		if ( stoGetFun( DAY_KEY_STR ) === curDayStr ) stoSetFun( DAY_KEY_STR, '' ); // What: Day Release Guard. Why: Both notification paths having failed means a later attempt should still be allowed to notify for this same day. How: This clears the claimed day back out, but only if nothing else has already claimed a different one since.



		return false; // What: Notification Failure Return. Why: The caller needs to know no notification was actually shown. How: This returns false after every attempt has failed.


	}

	// #endregion Notification Delivery


}

// #endregion genNotFun

// #endregion Helpers



// #region Exports

const NOT_NAM_OBJ = { // What: Notification Namespace Object. Why: This bundles this module's public operations behind one object, giving callers a single import. How: This maps five of this file's functions onto external properties of the same names.


	askOncFun : askOncFun, // What: Ask Once Function. Why: A caller needs the one-time permission request. How: This exports askOncFun under its own matching name.
	genNotFun : genNotFun, // What: Generated Notification Function. Why: A caller needs to show a notification after a daily-list generation. How: This exports genNotFun under its own matching name.
	perCheFun : perCheFun, // What: Permission Check Function. Why: A caller needs the current permission to show its state. How: This exports perCheFun under its own matching name.
	reqPerFun : reqPerFun, // What: Request Permission Function. Why: A caller needs to re-request permission on demand. How: This exports reqPerFun under its own matching name.
	subAddFun : subAddFun  // What: Subscribe Add Function. Why: A caller needs to hear about live permission changes. How: This exports subAddFun under its own matching name.


};



export { NOT_NAM_OBJ }; // What: Named Export. Why: The one namespace object carries this module's public notification operations. How: This exports NOT_NAM_OBJ by name.

// #endregion Exports


