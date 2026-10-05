


/**
 * notify.ts = Local Notification Module
 *
 * @summary
 * Local notifications: these fire only while the app is running, whether
 * the tab is in the foreground or backgrounded. The page itself is what
 * decides to show one; delivering to a fully closed app would need Web
 * Push plus a real backend (see PWA-PLAN.md), which this app
 * deliberately doesn't have.
 *
 * Deliberate constraints this module enforces: a notification fires
 * only after the Daily generator has already run, never as a prompt to
 * run it, so clicking one can never trigger a second generation. It
 * stays silent whenever the app is already visible and focused, since a
 * notification for a page the user is already looking at is pure noise.
 * It fires at most once per local day, tracked in localStorage so a
 * reload can't re-notify. Permission is requested exactly once, and
 * only from a real user gesture (the Settings run-time change); a
 * denial is effectively permanent, so this module never asks for it on
 * load.
 *
 * Sections:
 *  - Constants
 *  - Module State
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const ASK_KEY_STR = 'easemylife.notifyasked'; // What: Ask Key String. Why: This is the localStorage key that tracks whether permission has already been requested once. How: This is read by askCheFun and written by askOncFun/reqPerFun below.
const DAY_KEY_STR = 'easemylife.notifiedday'; // What: Day Key String. Why: This is the localStorage key that tracks the last local day this module already notified on. How: This is read/written by stoGetFun/stoSetFun inside genNotFun's own once-per-day guard below.

// #endregion Constants



// #region Module State

const subLisSet = new Set(); // What: Subscriber Listener Set. Why: This holds every callback that wants to hear about a permission change, most notably the Settings page's own permission-state display. How: This is added to by subAddFun and iterated by broSubFun below.

// #endregion Module State



// #region Helpers

// #region Permission Subscribers

const broSubFun = () => { // What: Broadcast Subscriber Function. Why: Every subscriber needs to hear about a permission change the moment askOncFun/reqPerFun resolve one. How: This calls every function currently in subLisSet, swallowing any individual subscriber's own error so one bad listener can't block the rest.


	for ( const lisCurFun of subLisSet ) { // What: Subscriber Loop. Why: Every current subscriber must be notified, not just the first one. How: This iterates subLisSet, calling each entry in its own guarded try/catch below.


		try { lisCurFun(); } // What: Subscriber Call Try. Why: This is the actual notification each subscriber exists to receive. How: This invokes lisCurFun with no arguments.

		catch ( errCatObj ) {} // What: Subscriber Call Guard. Why: One bad listener throwing must not stop the rest of subLisSet from being notified. How: This silently swallows any error lisCurFun itself threw.


	}


};



// #region subAddFun

/**
 * subAddFun = Subscribe Add Function
 *
 * @summary
 * Registers a callback to hear about every permission change this module
 * makes (an ask, a request, or a grant), so a display like the Settings
 * page's notify-me row can re-read perCheFun and re-render. A callback
 * that throws is swallowed by broSubFun, so one broken listener never
 * stops the others.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param lisCalFun - Listener Callback Function: The callback to call, with no
 *                     arguments, after each permission change.
 *
 * @returns A cleanup function that unsubscribes lisCalFun again.
 *
 * @example
 * ```ts
 * subAddFun(lisCalFun) // => unsubscribe function
 * ```
 *
*/

const subAddFun = ( lisCalFun ) => { // What: Subscribe Add Function. Why: A caller (the Settings page) needs a way to register for permission-change broadcasts and later unregister again. How: This adds the given callback to subLisSet and hands back its own removal function.


	subLisSet.add( lisCalFun ); // What: Listener Add. Why: The given callback must actually be reachable by broSubFun above in order to receive future broadcasts. How: This adds lisCalFun to subLisSet.



	return () => subLisSet.delete( lisCalFun ); // What: Unsubscribe Return. Why: The caller needs a way to stop receiving broadcasts later, most commonly on its own component unmount. How: This returns a fresh function that removes lisCalFun from subLisSet when called.


};

// #endregion subAddFun

// #endregion Permission Subscribers



// #region Storage Access

const stoGetFun = ( stoKeyStr ) => { // What: Storage Get Function. Why: localStorage can throw in some contexts (private browsing, a full quota), and a failed read should never crash the caller. How: This wraps getItem in a try/catch, returning null on any failure instead of throwing.


	try { return localStorage.getItem( stoKeyStr ); } // What: Storage Get Try. Why: This is the actual read this function exists to perform. How: This returns whatever getItem resolves to for stoKeyStr, including null when the key isn't set.

	catch ( errCatObj ) { return null; } // What: Storage Get Guard. Why: A private-mode or full-quota localStorage can throw on read. How: This returns null instead of letting the error propagate.


};



const stoSetFun = ( stoKeyStr, stoValStr ) => { // What: Storage Set Function. Why: Same reasoning as stoGetFun above, for writes: a failed write should never crash the caller. How: This wraps setItem in a try/catch, silently doing nothing on any failure.


	try { localStorage.setItem( stoKeyStr, stoValStr ); } // What: Storage Set Try. Why: This is the actual write this function exists to perform. How: This calls setItem with stoKeyStr and stoValStr.

	catch ( errCatObj ) {} // What: Storage Set Guard. Why: A private-mode or full-quota localStorage can throw on write. How: This silently does nothing instead of letting the error propagate.


};

// #endregion Storage Access



// #region Local Day

const padZerFun = ( rawValNum ) => String( rawValNum ).padStart( 2, '0' );                                                                          // What: Pad Zero Function. Why: A local-day string needs its month/day components zero-padded to 2 digits each. How: This stringifies the given number and left-pads it with '0' to a length of 2.
const locDayFun = ( dayDatObj ) => `${ dayDatObj.getFullYear() }-${ padZerFun( dayDatObj.getMonth() + 1 ) }-${ padZerFun( dayDatObj.getDate() ) }`; // What: Local Day Function. Why: The once-per-day guard needs a stable, comparable string for "today" in the user's own local time zone. How: This builds a YYYY-MM-DD string from the given Date's own local year/month/day, zero-padding month and day via padZerFun.

// #endregion Local Day



// #region Permission Requests

const askCheFun = () => !!stoGetFun( ASK_KEY_STR );                // What: Ask Check Function. Why: askOncFun below must only ever prompt once, ever, regardless of how the previous prompt was answered. How: This reports whether the one-time "asked" flag has already been written.
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

const perCheFun = () => ( notSupFun() ? Notification.permission : 'unsupported' ); // What: Permission Check Function. Why: Callers (the Settings page's own display) need the current permission state without caring whether the API even exists. How: This reports Notification.permission when supported, or the literal string 'unsupported' otherwise.

// #endregion perCheFun



// #region askOncFun

/**
 * askOncFun = Ask Once Function
 *
 * @summary
 * Requests notification permission exactly once, called from the
 * Settings run-time input's onChange handler: a real user gesture, and
 * the moment the user has shown they care when the generator runs.
 * Skips straight to reporting the current permission, without
 * prompting again, once the browser doesn't support notifications at
 * all, the permission has already moved away from 'default', or this
 * module has already asked once before. Only burns the one-time
 * "asked" flag once the user has actually answered the prompt:
 * dismissing it (or a context that blocks it outright) leaves the
 * permission at 'default', so the module should still be allowed to
 * ask again later in that case.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns A Promise resolving to the current permission string:
 * either {@link perCheFun}'s own result, when the guard above
 * short-circuits, or the freshly-resolved result of the permission
 * prompt otherwise.
 * @see {@link perResStr}
 *
 * @example
 * ```ts
 * askOncFun() // => Promise<string>
 * ```
 *
*/

async function askOncFun () {


	if ( !notSupFun() || Notification.permission !== 'default' || askCheFun() ) return perCheFun(); // What: Ask Guard Clause. Why: There is nothing to prompt for when notifications aren't supported at all, the permission has already moved past 'default', or this module has already asked once before. How: This checks all 3 conditions with ||, short-circuiting on the first true one, and returns the current permission instead of prompting.



	let perResStr = 'default'; // What: Permission Result String. Why: This holds the actual outcome of the prompt below, defaulting to 'default' in case the prompt itself throws. How: This is reassigned by the try block right after it, then returned at the end of this function.



	try { perResStr = await Notification.requestPermission(); } // What: Request Permission Try. Why: A very old browser's callback-style requestPermission could throw when called with no callback argument at all. How: This awaits the modern Promise-returning form and falls back to leaving perResStr at its default value on any error.

	catch ( errCatObj ) { /* older API */ } // What: Request Permission Guard. Why: A very old browser's callback-style requestPermission could throw when called with no callback argument at all. How: This leaves perResStr at its default value instead of letting the error propagate.



	if ( perResStr !== 'default' ) stoSetFun( ASK_KEY_STR, '1' ); // What: Ask Flag Write Guard. Why: The one-time "asked" flag must only be burned once the user has actually answered the prompt; a dismissal leaves the permission at 'default' and should still be askable later. How: This writes the flag only when perResStr resolved to something other than 'default'.



	broSubFun(); // What: Broadcast Subscriber Call. Why: Every subscriber (the Settings page's own permission-state display) needs to hear about this potential permission change. How: This calls broSubFun with no arguments, notifying every current subscriber.



	return perResStr; // What: Permission Result Return. Why: The caller needs the actual resolved (or defaulted) permission value back. How: This returns the same perResStr the try block above may have reassigned.


}

// #endregion askOncFun



// #region reqPerFun

/**
 * reqPerFun = Request Permission Function
 *
 * @summary
 * Re-asks for notification permission, for the Settings page's own
 * "Enable notifications" button. Browsers ignore a fresh request once
 * the user has explicitly denied it, but the user may have cleared
 * that block themselves outside the app, so this always re-checks
 * rather than trusting a stale cached value.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns A Promise resolving to the current permission string, or
 * the literal string 'unsupported' when the browser has no
 * Notification API at all.
 * @see {@link perResStr}
 *
 * @example
 * ```ts
 * reqPerFun() // => Promise<string>
 * ```
 *
*/

async function reqPerFun () {


	if ( !notSupFun() ) return 'unsupported'; // What: Support Guard Clause. Why: There is nothing to request when the browser has no Notification API at all. How: This returns the literal string 'unsupported' early instead of touching Notification.permission below.



	stoSetFun( ASK_KEY_STR, '1' ); // What: Ask Flag Write. Why: A user pressing this button has already shown they care, the same signal askOncFun's own one-time flag exists to capture. How: This writes the flag unconditionally, since a re-ask from this button should never prompt automatically again either.



	let perResStr = Notification.permission; // What: Permission Result String. Why: This holds the actual outcome this function returns, defaulting to whatever the permission already is. How: This is reassigned by the try block right after it, then returned at the end of this function.



	try { if ( perResStr === 'default' ) perResStr = await Notification.requestPermission(); } // What: Request Permission Try. Why: A prompt should only actually be shown when the permission is still 'default'; a browser that has already denied it will just ignore this call anyway. How: This awaits the modern Promise-returning form only when needed, leaving perResStr unchanged on any error.

	catch ( errCatObj ) {} // What: Request Permission Guard. Why: The modern Promise-returning form could still throw in some edge case. How: This leaves perResStr unchanged instead of letting the error propagate.



	broSubFun(); // What: Broadcast Subscriber Call. Why: Every subscriber (the Settings page's own permission-state display) needs to hear about this potential permission change. How: This calls broSubFun with no arguments, notifying every current subscriber.



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
 * called by the Today tab's own scheduler immediately after that
 * generation completes. Fires only when permission is already
 * granted, the app isn't currently visible and focused (a notification
 * for a page the user is already looking at is pure noise), and this
 * local day hasn't already notified once. Prefers the service
 * worker's own showNotification() over the page-level Notification
 * constructor: on Android Chrome the constructor throws (Failed to
 * construct 'Notification') and always has, since it requires a
 * service worker registration, which was the reason notifications
 * appeared to do nothing at all on mobile. The click behavior for the
 * service-worker path lives in public/sw-notify.js instead, since
 * SW-owned notifications never reach page-level handlers.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns A Promise resolving to true once a notification was
 * actually shown through either path, or false when every guard or
 * every attempt failed.
 *
 * @example
 * ```ts
 * genNotFun() // => Promise<boolean>
 * ```
 *
*/

async function genNotFun () {


	if ( !notSupFun() || Notification.permission !== 'granted' ) return false; // What: Permission Granted Guard Clause. Why: There is nothing to show when notifications aren't supported at all or the user hasn't already granted permission. How: This checks both conditions with ||, short-circuiting on the first true one.



	const appVisBoo = document.visibilityState === 'visible' && document.hasFocus(); // What: App Visible Boolean. Why: A notification for a page the user is already looking at is pure noise. How: This is true only when the tab is both the visible one and actually focused.


	if ( appVisBoo ) return false; // What: App Visible Guard. Why: The whole point of appVisBoo above is to skip showing a notification while it's true. How: This returns early without showing anything when the app is already front and center.



	const curDayStr = locDayFun( new Date() ); // What: Current Day String. Why: The once-per-day guard below needs today's own local-day string to compare against. How: This calls locDayFun with a freshly-constructed Date for right now.


	if ( stoGetFun( DAY_KEY_STR ) === curDayStr ) return false; // What: Already Notified Guard. Why: This local day must not notify more than once, even across a page reload. How: This compares the persisted last-notified day against curDayStr and returns early on a match.



	stoSetFun( DAY_KEY_STR, curDayStr ); // What: Day Claim Write. Why: The day must be claimed before the async work below, so two near-simultaneous calls can't both get past the guard above. How: This writes curDayStr as the new last-notified day immediately, ahead of any await.



	const notTitStr = 'Your life is ready to be eased!'; // What: Notification Title String. Why: This is the fixed headline shown on every daily-generation notification. How: This is handed to both the service-worker and page-level notification paths below.

	const notOptObj = { // What: Notification Options Object. Why: This is the fixed set of options shown on every daily-generation notification. How: This is handed to both the service-worker and page-level notification paths below; its own property names are the Notification API's own contract, not this codebase's invention, so they are left as-is.


		badge              : 'assets/icon-192.png',                                               // What: Badge. Why: This is the notification's own small monochrome status-bar badge image, read directly by the browser's Notification API. How: This reuses the same 192px icon asset as the badge source.
		body               : 'Your personalized list for today is ready. Click here to open it.', // What: Body. Why: This is the notification's own secondary line of text, read directly by the browser's Notification API. How: This tells the user their list is ready and that clicking opens it.
		icon               : 'assets/icon-192.png',                                               // What: Icon. Why: This is the notification's own large icon image, read directly by the browser's Notification API. How: This points at the app's own 192px icon asset.
		requireInteraction : false,                                                               // What: Require Interaction. Why: This notification should dismiss itself normally rather than staying pinned, read directly by the browser's Notification API. How: This is fixed false, since nothing about this notification requires the user to act on it.
		tag                : 'eml-daily-' + curDayStr                                             // What: Tag. Why: A shared tag collapses duplicate notifications from multiple open tabs into one, read directly by the browser's Notification API. How: This combines a fixed prefix with curDayStr so only same-day notifications collapse together.


	};



	try { // What: Service Worker Notification Attempt. Why: The service worker's own showNotification() is the only path that works at all on Android Chrome, where the page-level constructor throws. How: This tries the service-worker path first and falls through to the page-level constructor below on any failure.


		if ( navigator.serviceWorker && navigator.serviceWorker.ready ) { // What: Service Worker Ready Guard. Why: A page with no service worker support, or no registration at all, has no showNotification() to call. How: This gates the await below on both the API and the ready promise actually existing.


			const worRegObj = await navigator.serviceWorker.ready; // What: Worker Registration Object. Why: The registration itself is what actually exposes showNotification(). How: This awaits the ready promise to get the live registration.


			if ( worRegObj && worRegObj.showNotification ) { // What: Show Notification Method Guard. Why: Some old or partial service worker implementations may lack showNotification() even once ready. How: This checks the method actually exists before calling it below.


				await worRegObj.showNotification( notTitStr, notOptObj ); // What: Service Worker Notification Call. Why: This is the actual notification display call for this path. How: This hands the fixed title/options to the registration's own showNotification().



				return true; // What: Service Worker Success Return. Why: The caller needs to know a notification was actually shown. How: This returns true once showNotification() has resolved successfully.


			}


		}


	}

	catch ( errCatObj ) { /* fall through to the page-level constructor */ } // What: Service Worker Attempt Catch. Why: Any failure in the service-worker path should fall through to the page-level constructor instead of failing the whole function. How: This swallows the error and lets execution continue past the try block.



	try { // What: Page Notification Attempt. Why: This is the fallback path for a browser that lacks (or hasn't registered) a service worker, so the page-level Notification constructor is used directly. How: This constructs the notification, wires its click handler, and reports success, falling through to the catch below on any failure.


		const pagNotObj = new Notification( notTitStr, notOptObj ); // What: Page Notification Object. Why: This is the fallback path for a browser that lacks (or hasn't registered) a service worker. How: This constructs a page-level Notification directly from the fixed title/options.


		pagNotObj.onclick = () => { // What: Page Notification Click Handler. Why: Clicking the notification should focus the existing window, never regenerate, since the list it's about has already been built. How: This is assigned once, right after construction, and runs the 2 cleanup calls below on click.


			try { window.focus(); } // What: Window Focus Attempt. Why: Focusing the existing tab is the actual point of clicking the notification. How: This calls window.focus() and swallows any error some browsers may throw here.

			catch ( errCatObj ) {} // What: Window Focus Guard. Why: Some browsers may throw when focusing a window in certain contexts. How: This silently swallows any error window.focus() itself threw.



			try { pagNotObj.close(); } // What: Notification Close Attempt. Why: The notification should dismiss itself once clicked. How: This calls pagNotObj's own close() and swallows any error the same way.

			catch ( errCatObj ) {} // What: Notification Close Guard. Why: Some browsers may throw when closing an already-dismissed notification. How: This silently swallows any error pagNotObj.close() itself threw.


		};



		return true; // What: Page Notification Success Return. Why: The caller needs to know a notification was actually shown. How: This returns true once the page-level Notification has been constructed successfully.


	}

	catch ( errCatObj ) { // What: Page Notification Catch. Why: Both notification paths having failed means the day claimed earlier must be released so a later attempt can still try. How: This releases the claimed day and reports failure.


		if ( stoGetFun( DAY_KEY_STR ) === curDayStr ) stoSetFun( DAY_KEY_STR, '' ); // What: Day Release Guard. Why: Both notification paths having failed means a later attempt should still be allowed to notify for this same day. How: This clears the claimed day back out, but only if nothing else has already claimed a different one since.



		return false; // What: Notification Failure Return. Why: The caller needs to know no notification was actually shown. How: This returns false after every attempt has failed.


	}


}

// #endregion genNotFun

// #endregion Helpers



// #region Exports

const NOT_NAM_OBJ = { // What: Notification Namespace Object. Why: This bundles every one of this module's public operations behind one object, giving callers a single import surface, its own external names swept to match the internal implementation exactly after checking the blast radius was small and non-persisted. How: This maps each of this file's own internal function names onto an external property name matching it exactly.


	askOncFun : askOncFun, // What: Ask Once Function. Why: tab-settings.tsx calls this from the run-time input's own onChange handler, the one moment this app ever asks for notification permission unprompted. How: This re-exports askOncFun under its own matching name.
	genNotFun : genNotFun, // What: Generated Notification Function. Why: tab-today.tsx calls this right after an automatic daily-list generation completes. How: This re-exports genNotFun under its own matching name.
	perCheFun : perCheFun, // What: Permission Check Function. Why: tab-settings.tsx's own notify-me row reads this to decide which of its 3 states to show. How: This re-exports perCheFun under its own matching name.
	reqPerFun : reqPerFun, // What: Request Permission Function. Why: tab-settings.tsx's own explicit Enable button calls this to (re-)request permission. How: This re-exports reqPerFun under its own matching name.
	subAddFun : subAddFun  // What: Subscribe Add Function. Why: tab-settings.tsx's own permission-state display needs to hear about live permission changes. How: This re-exports subAddFun under its own matching name.


};



export { NOT_NAM_OBJ }; // What: Notification Namespace Object Export. Why: tab-settings.tsx and tab-today.tsx reach every notification operation through the one namespace object. How: This exports NOT_NAM_OBJ by name at the very end of the file.

// #endregion Exports


