


// #region Imports

import { STORAGE } from './storage.js'; // What: Storage. Why: The persistence request below needs to reach the real storage engine to actually call navigator.storage.persist(). How: This is called inside askPerFun via STORAGE.requestPersist().

// #endregion Imports



/**
 * pwa.js = Progressive Web App Glue
 *
 * @summary
 * This file is the PWA glue: the install prompt, standalone/installed
 * detection, and the engagement-gated request for persistent storage.
 * None of it is React; it is plain browser-API code imported by
 * store.jsx and tab-settings.jsx.
 *
 * Why the persistence request is engagement-gated: Chromium will not
 * re-prompt for storage persistence for the rest of the session once a
 * request is denied, and a cold first load, with no data and no
 * engagement yet, is the likeliest denial. So the request waits until
 * the user has actually made something worth protecting (their first
 * picker), at which point the browser's own heuristics, and any
 * install, work in this app's favor instead of against it.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



const PER_ASK_KEY = 'easemylife.persistasked'; // What: Persist Ask Key. Why: This is the localStorage key recording whether this device has already been asked once, so a denial is not re-requested on every later launch (browsers ignore a repeat request anyway). How: This is read and written inside askPerFun.



let insCapObj = null; // What: Install Captured Object. Why: The install button needs a live handle on the captured event so it can call that event's own prompt() method later. How: This starts null and is assigned by the beforeinstallprompt listener below, then cleared again once askInsFun consumes it.



/**
 * relInsBoo = Related Installed Boolean
 *
 * @summary
 * Set by proRelFun when this PWA is already installed on the device but
 * the user is looking at it in a normal browser tab. Chromium withholds
 * beforeinstallprompt in exactly that situation, which would otherwise
 * be indistinguishable from "this browser cannot install at all."
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

let relInsBoo = false; // What: Related Installed Boolean. Why: insStaFun must be able to tell "already installed elsewhere" apart from "cannot install here at all." How: This starts false and is set true by proRelFun when navigator.getInstalledRelatedApps() reports an existing install.



/**
 * insProBoo = Install Probe Boolean
 *
 * @summary
 * Whether this session has waited long enough to conclude that
 * beforeinstallprompt is never coming. There is no synchronous way to
 * ask a browser "do you support installing?"; the only real signal is
 * the event actually firing, so its absence has to be inferred from a
 * grace period instead. Chromium also needs its own criteria met first
 * (served over HTTPS, manifest parsed, service worker activated),
 * which is why proSupFun waits on serviceWorker.ready before starting
 * that clock, rather than declaring the browser incapable while the
 * service worker is still installing.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

let insProBoo = false; // What: Install Probe Boolean. Why: insStaFun must not report 'unsupported' before the install-support grace period has actually elapsed. How: This starts false and is set true by proSupFun once that grace period passes.



const subFunSet = new Set(); // What: Subscriber Function Set. Why: More than one UI component (Settings, an install button) may want to know about install/persistence changes. How: This holds every callback added via the exported subscribe property, each invoked in turn by notSubFun.
const notSubFun = () => { for ( const curSubFun of subFunSet ) { try { curSubFun(); } catch ( e ) {} } }; // What: Notify Subscribers Function. Why: Every subscriber must be told a moment after any state this file tracks (install availability, probe result, persistence) changes. How: This calls every function currently in subFunSet, isolating each call in its own try/catch so one throwing subscriber cannot stop the rest from being notified.



// #region proRelFun

/**
 * proRelFun = Probe Related Function
 *
 * @summary
 * Chromium-only, and only resolves usefully when the manifest carries
 * a related_applications entry naming itself:
 *   "related_applications": [
 *     { "platform": "webapp",
 *       "url": "https://easemylife.app/manifest.webmanifest" }
 *   ]
 * Absence of the API (Firefox, Safari) just leaves relInsBoo false,
 * which is the right answer there anyway: neither can install, so
 * nothing is installed.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * proRelFun() // => void
 * ```
 *
*/

function proRelFun() {


	try { // What: Probe Related Try. Why: navigator.getInstalledRelatedApps itself may not exist, and calling a missing method would throw. How: This wraps the whole check-and-query sequence below, silently giving up in its own catch.


		if ( !navigator.getInstalledRelatedApps ) return; // What: No Related Apps Api Guard. Why: There is nothing to query at all in a browser without this API. How: This returns immediately when navigator.getInstalledRelatedApps is missing.



		navigator.getInstalledRelatedApps().then( ( curAppArr ) => { // What: Related Apps Then Callback. Why: A non-empty result is the only real evidence this PWA is already installed elsewhere. How: This is called once the async query resolves, with whatever related apps (if any) the browser found.


			if ( curAppArr && curAppArr.length ) { // What: Has Related Apps Check. Why: insStaFun must report 'installed' rather than 'unsupported'/'pending' once this is known. How: This gates the block below on curAppArr actually having entries.


				relInsBoo = true; // What: Related Installed Boolean Set. Why: A non-empty result is the only real evidence this PWA is already installed elsewhere. How: This sets relInsBoo true.


				notSubFun(); // What: Notify Subscribers Call. Why: insStaFun must now report 'installed' to any already-subscribed UI. How: This calls notSubFun.


			}


		}, () => {} ); // What: Related Apps Rejection Handler. Why: A rejected query is not an error worth surfacing, just more evidence there is nothing installed. How: This is a deliberate no-op second argument to .then, swallowing any rejection.


	}

	catch ( e ) {} // What: Probe Related Guard. Why: An unsupported or throwing API must not abort the rest of this module's own boot sequence. How: This silently ignores any error from the try block above.


}

// #endregion proRelFun



proRelFun(); // What: Probe Related Function Call. Why: This must run once at module load so relInsBoo is known as early as possible, well before insStaFun is likely to be first called. How: This invokes proRelFun immediately; it resolves asynchronously via its own internal .then, so nothing here is awaited.



// #region proSupFun

/**
 * proSupFun = Probe Support Function
 *
 * @summary
 * Starts the grace-period clock that lets insStaFun eventually
 * conclude "beforeinstallprompt is never coming" when it never fires.
 * The clock does not start until serviceWorker.ready resolves (capped
 * by its own timeout, in case a worker never activates), since
 * Chromium will not fire the install event until its own service
 * worker criteria are met, and starting the clock any earlier would
 * risk a false "unsupported" verdict while the worker is still
 * installing.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * proSupFun() // => void
 * ```
 *
*/

function proSupFun() {


	const staGraNum = 2500; // What: Start Grace Number. Why: This is the fixed number of milliseconds to wait, once the service worker is ready, before concluding the install prompt is never coming. How: This is passed as the delay to the setTimeout call inside finProFun below.

	const finProFun = () => { // What: Finish Probe Function. Why: Both branches below (service worker ready, or no service worker support at all) must eventually reach the same conclusion after the same grace period. How: This starts a single setTimeout that flips insProBoo true and notifies every subscriber once staGraNum has elapsed.


		setTimeout( () => { // What: Probe Done Timeout Call. Why: The grace period itself must actually elapse before insProBoo can be trusted. How: This callback fires once, after staGraNum milliseconds, from whichever branch below called finProFun.


			insProBoo = true; // What: Install Probe Boolean Update. Why: insStaFun must now be allowed to report 'unsupported' rather than 'pending'. How: This sets insProBoo true.
			notSubFun();      // What: Notify Subscribers Call. Why: insStaFun's own callers must re-read the now-settled insProBoo. How: This calls notSubFun.


		}, staGraNum ); // What: Timeout Delay Argument. Why: The grace-period clock must actually wait the fixed staGraNum milliseconds before this callback fires. How: This is setTimeout's own delay argument, closing the call opened above.


	};


	try { // What: Probe Support Try. Why: navigator.serviceWorker itself may not exist, and reading a missing property must not crash module load. How: This wraps the whole ready-check-and-race sequence below, falling back to finProFun in its own catch.


		if ( navigator.serviceWorker && navigator.serviceWorker.ready ) { // What: Service Worker Ready Check. Why: The grace-period clock should only start once the service worker is actually ready, or once it is clear this browser has no service worker support at all. How: This gates the capped race below on that API existing.


			Promise.race( [ // What: Service Worker Ready Race. Why: A worker that never activates must not leave the UI stuck on "checking" forever. How: This races the real navigator.serviceWorker.ready promise against a fixed 3-second timeout, running finProFun once whichever settles first.


				navigator.serviceWorker.ready,                                // What: Service Worker Ready Promise. Why: This is the real signal the race is actually waiting on. How: This is navigator.serviceWorker's own ready promise, passed straight through.
				new Promise( ( resValFun ) => setTimeout( resValFun, 3000 ) ) // What: Ready Timeout Promise. Why: This is the capped fallback that lets the race above resolve even if the real service worker never becomes ready. How: This resolves on its own after 3 seconds, with no value.


			] ).then( finProFun, finProFun ); // What: Race Settle Call. Why: Whichever promise above settles first must run the same finProFun, regardless of success or failure. How: This passes finProFun as both the resolve and reject handler.


		}

		else { finProFun(); } // What: No Service Worker Fallback. Why: A browser with no service worker support at all still needs its own grace-period clock started. How: This calls finProFun directly, skipping the race above entirely.


	}

	catch ( e ) { finProFun(); } // What: Probe Support Guard. Why: A throwing serviceWorker access must still leave the grace-period clock running. How: This falls back to calling finProFun directly.


}

// #endregion proSupFun



proSupFun(); // What: Probe Support Function Call. Why: This must run once at module load so the install-support grace period starts as early as possible. How: This invokes proSupFun immediately; its own clock settles asynchronously via finProFun.



const iosPlaBoo = /iP(hone|ad|od)/.test( navigator.platform || '' );                 // What: Ios Platform Boolean. Why: navigator.platform is the most direct signal an iPhone/iPad/iPod can offer. How: This tests it against an iOS-device pattern, falling back to an empty string when platform itself is unavailable.
const padMacBoo = /Mac/.test( navigator.userAgent ) && navigator.maxTouchPoints > 1; // What: iPad Mac Boolean. Why: iPadOS 13+ deliberately reports itself as a desktop Mac in its own user agent string, so a touch-capable "Mac" is really an iPad. How: This combines a Mac user-agent match with a real multi-touch capability check.
const iosUsrBoo = /iPhone|iPad|iPod/.test( navigator.userAgent );                    // What: Ios User Boolean. Why: Some environments carry the real device family in the user agent string even when navigator.platform does not. How: This tests navigator.userAgent directly against the same device-family pattern.

const isaIosBoo = iosPlaBoo || padMacBoo || iosUsrBoo; // What: Is-An Ios Boolean. Why: iOS/iPadOS Safari never fires beforeinstallprompt at all, so the UI must show manual Share-to-Home-Screen instructions instead of a dead install button. How: This is true whenever any one of the three device-detection checks above holds.


const isaSafBoo = /^((?!chrome|android|crios|fxios).)*safari/i.test( navigator.userAgent ); // What: Is-A Safari Boolean. Why: Safari is the specific browser whose own install path differs by platform (Share sheet on iOS, File menu on macOS), so it has to be told apart from every Chromium/Firefox-based browser that also happens to mention "Safari" in its own user agent. How: This matches 'safari' while excluding every user agent that also contains a known non-Safari browser token.
const isaMacBoo = /Mac/.test( navigator.userAgent ) && !( navigator.maxTouchPoints > 1 );   // What: Is-A Mac Boolean. Why: Genuine desktop macOS, excluding any touch-capable device isaIosBoo already claims above, also never fires beforeinstallprompt; installation there is File menu, then Add to Dock. How: This combines a Mac user-agent match with the negation of the same multi-touch check isaIosBoo uses.



// #region isaStaFun

/**
 * isaStaFun = Is-A Standalone Function
 *
 * @summary
 * Reports whether this page is currently running as an installed app
 * rather than a normal browser tab, checked three different ways since
 * no single API is reliable across every browser: the standard
 * display-mode media queries, and Safari's own legacy
 * navigator.standalone flag.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns Whether this page is currently running standalone, or false
 * when the check itself throws.
 * @see {@link isaStaBoo}
 *
 * @example
 * ```ts
 * isaStaFun() // => true or false
 * ```
 *
*/

function isaStaFun() {


	try { // What: Is-A Standalone Try. Why: window.matchMedia is not guaranteed to exist in every environment this code might run in. How: This wraps the three checks and their combination below, falling back to false in its own catch.


		const disStaBoo = window.matchMedia( '(display-mode: standalone)' ).matches; // What: Display Standalone Boolean. Why: This is the standard, spec-defined way a PWA can tell it is running installed. How: This reads the current match state of the 'display-mode: standalone' media query.
		const disFulBoo = window.matchMedia( '(display-mode: fullscreen)' ).matches; // What: Display Fullscreen Boolean. Why: Some installed configurations report as fullscreen display-mode instead of standalone. How: This reads the current match state of the 'display-mode: fullscreen' media query.
		const navStaBoo = window.navigator.standalone === true;                      // What: Navigator Standalone Boolean. Why: Safari on iOS predates the display-mode media queries and only ever exposes this legacy flag. How: This compares window.navigator.standalone against true directly.

		const isaStaBoo = disStaBoo || disFulBoo || navStaBoo; // What: Is-A Standalone Boolean. Why: insStaFun (and every other caller) only needs one combined answer, true whenever any one of the three underlying checks holds. How: This ORs all three together.



		return isaStaBoo; // What: Is-A Standalone Return. Why: The caller needs the fully-combined result computed above. How: This returns the same isaStaBoo just assembled.


	}

	catch ( e ) { return false; } // What: Is-A Standalone Guard. Why: An environment missing matchMedia entirely must not crash whichever caller invoked this. How: This returns false instead of letting the error propagate.


}

// #endregion isaStaFun



// #region askInsFun

/**
 * askInsFun = Ask Install Function
 *
 * @summary
 * Shows the captured beforeinstallprompt event's own native install
 * dialog and reports what the user chose. Consumes insCapObj
 * unconditionally: a captured prompt can only ever be shown once, and
 * this is the only place that ever calls its own .prompt() method.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns A Promise resolving to 'accepted', 'dismissed', or
 * 'unavailable' when there was no captured event to show at all, or
 * showing it itself failed.
 *
 * @example
 * ```ts
 * askInsFun() // => 'accepted' | 'dismissed' | 'unavailable'
 * ```
 *
*/

async function askInsFun() {


	if ( !insCapObj ) return 'unavailable'; // What: No Install Event Guard. Why: There is nothing to prompt with when beforeinstallprompt was never captured, or was already consumed by an earlier call. How: This returns 'unavailable' immediately whenever insCapObj is falsy.



	const curEveObj = insCapObj; // What: Current Event Object. Why: insCapObj is cleared immediately below, so the actual event this call acts on must be captured into its own local first. How: This copies the live insCapObj reference before it is nulled out.

	insCapObj = null; // What: Install Captured Object Reset. Why: A captured prompt can only ever be shown once; leaving insCapObj set would let a later caller try to reuse an already-consumed event. How: This clears insCapObj immediately after curEveObj has captured its own reference.

	notSubFun(); // What: Notify Subscribers Call. Why: canInstall() must now report false, since the captured event is about to be shown (and consumed) below. How: This calls notSubFun so every subscriber re-reads the now-cleared insCapObj.


	try { // What: Ask Install Try. Why: Both .prompt() and awaiting .userChoice can throw if the browser's own dialog fails to show. How: This wraps the actual prompt-and-await sequence below, falling back to 'unavailable' in its own catch.


		curEveObj.prompt(); // What: Prompt Call. Why: This is the actual native install dialog the browser shows on the captured event's behalf. How: This calls curEveObj's own prompt() method.

		const choResObj = await curEveObj.userChoice; // What: Choice Result Object. Why: The caller needs to know what the user actually chose, not merely that the dialog was shown. How: This awaits curEveObj's own userChoice promise.



		return ( choResObj && choResObj.outcome ) || 'dismissed'; // What: Ask Install Return. Why: The caller needs a definite outcome string even if choResObj itself is missing its own outcome field. How: This returns choResObj.outcome when present, otherwise 'dismissed'.


	}

	catch ( e ) { return 'unavailable'; } // What: Ask Install Guard. Why: A failure to show or read the native dialog must not crash whichever caller invoked this. How: This returns 'unavailable' instead of letting the error propagate.


}

// #endregion askInsFun



// #region askPerFun

/**
 * askPerFun = Ask Persist Function
 *
 * @summary
 * Requests eviction-exempt storage persistence from the browser, at
 * most once per device unless forced, so a denial is not re-requested
 * on every later launch (which browsers ignore anyway). This should
 * only ever be called after real user engagement, since Chromium will
 * not re-prompt for the rest of the session once denied once.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param forAskBoo - Force Ask Boolean: Whether to ask again even if this
 *                    device has already been asked before.
 *
 * @returns A Promise resolving to whether persistent storage is now
 * granted, either already, or as a result of this actual request.
 *
 * @example
 * ```ts
 * askPerFun(forAskBoo) // => true or false
 * ```
 *
*/

async function askPerFun( forAskBoo ) {


	try { // What: Ask Persist Try. Why: localStorage.getItem/setItem can both throw in private mode, and either failure should still let the actual persistence request below proceed. How: This wraps the ask-once bookkeeping below, silently giving up in its own catch.


		if ( !forAskBoo && localStorage.getItem( PER_ASK_KEY ) ) return false; // What: Already Asked Guard. Why: A device that has already been asked once, and was not forced, must not be asked again on every later launch. How: This returns false immediately when forAskBoo is falsy and PER_ASK_KEY is already set.



		localStorage.setItem( PER_ASK_KEY, '1' ); // What: Persist Ask Key Set Call. Why: The very next unforced call on this device must see PER_ASK_KEY already set. How: This writes '1' under PER_ASK_KEY.


	}

	catch ( e ) {} // What: Ask Persist Guard. Why: Private mode (or an otherwise inaccessible localStorage) is not a reason to skip the actual request below. How: This silently ignores any error from the bookkeeping above.



	if ( !STORAGE ) return false; // What: No Storage Guard. Why: There is no persistence request to make at all without the storage layer this file delegates to. How: This returns false immediately when STORAGE itself is unavailable.



	const askOkaBoo = await STORAGE.requestPersist(); // What: Ask Okay Boolean. Why: The caller needs to know whether persistence is now actually granted. How: This awaits STORAGE's own requestPersist call.

	notSubFun(); // What: Notify Subscribers Call. Why: The Settings storage panel must re-read the now-possibly-changed persistence grant. How: This calls notSubFun.



	return askOkaBoo; // What: Ask Persist Return. Why: The caller needs the same grant result STORAGE.requestPersist itself resolved. How: This returns the same askOkaBoo just awaited above.


}

// #endregion askPerFun



window.addEventListener( 'beforeinstallprompt', ( insEveObj ) => { // What: Before Install Prompt Listener. Why: Chromium fires this instead of showing its own mini-infobar, and the app wants to drive its own install button instead of relying on that. How: This suppresses the browser's own UI, captures the event for askInsFun to use later, and tells every subscriber the install state just changed.


	insEveObj.preventDefault(); // What: Prevent Default Call. Why: The browser's own mini-infobar must not appear now that this app is handling the prompt itself. How: This calls the captured event's own preventDefault method.
	insCapObj = insEveObj;      // What: Install Captured Object Assignment. Why: askInsFun and canInstall both need this exact event later, once the user actually clicks the app's own install button. How: This stores insEveObj onto the module-level insCapObj.

	notSubFun(); // What: Notify Subscribers Call. Why: canInstall()/insStaFun() must now report differently to any subscribed UI. How: This calls notSubFun so every subscriber re-reads the now-set insCapObj.


} );

window.addEventListener( 'appinstalled', () => { // What: App Installed Listener. Why: An actual install is the strongest possible engagement signal this app can ever see. How: This clears the now-stale captured event, takes the chance to force a persistence request, and notifies every subscriber.


	insCapObj = null; // What: Install Captured Object Reset. Why: A prompt that just led to a real install has nothing left to show again. How: This clears insCapObj.

	askPerFun( true ); // What: Ask Persist Force Call. Why: An install is worth spending this device's one lifetime persistence request on immediately, rather than waiting for the first-picker moment. How: This calls askPerFun with forAskBoo true.

	notSubFun(); // What: Notify Subscribers Call. Why: canInstall() must now report false, since the captured event this app used to offer installing is gone. How: This calls notSubFun.


} );



// #region insStaFun

/**
 * insStaFun = Install State Function
 *
 * @summary
 * One value for the UI to switch on, so the "can't install here" case
 * is feature-detected rather than sniffed for Firefox by name, the
 * same answer then covers any browser that doesn't implement the
 * install prompt. The possible values:
 *
 *   'standalone'  already running as an installed app
 *   'ready'       beforeinstallprompt captured; the in-app button will
 *                 work
 *   'ios'         iOS/iPadOS Safari, manual Share to Home Screen
 *   'mac'         macOS Safari, manual File menu to Add to Dock
 *   'installed'   installed on this device, but viewed in a browser
 *                 tab
 *   'pending'     still waiting to find out; show nothing definitive
 *                 yet
 *   'unsupported' no prompt after the grace period
 *
 * Note 'unsupported' is genuinely ambiguous and the UI copy has to
 * respect it: some browsers (Firefox on Android, Samsung Internet) do
 * offer installing from their own menu, while Firefox on desktop
 * offers no install path at all. There is no reliable way to tell
 * those apart, so the wording covers both instead of sending desktop
 * users hunting for a menu item that does not exist.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns One of the seven state strings documented above.
 *
 * @example
 * ```ts
 * insStaFun() // => 'standalone' | 'ready' | 'ios' | 'mac' |
 *                    'installed' | 'pending' | 'unsupported'
 * ```
 *
*/

function insStaFun() {


	if ( isaStaFun() ) return 'standalone'; // What: Standalone Guard. Why: An already-installed, already-running app has nothing left to offer installing. How: This returns 'standalone' as soon as isaStaFun reports true.



	if ( insCapObj ) return 'ready'; // What: Ready Guard. Why: A captured beforeinstallprompt event means the in-app install button will actually work. How: This returns 'ready' whenever insCapObj is set.



	if ( isaIosBoo && isaSafBoo ) return 'ios'; // What: Ios Guard. Why: iOS/iPadOS Safari never fires beforeinstallprompt at all, so its own manual instructions are needed instead. How: This returns 'ios' whenever both isaIosBoo and isaSafBoo hold.



	if ( isaMacBoo && isaSafBoo ) return 'mac'; // What: Mac Guard. Why: macOS Safari also never fires beforeinstallprompt, so its own manual instructions are needed instead. How: This returns 'mac' whenever both isaMacBoo and isaSafBoo hold.



	if ( relInsBoo ) return 'installed'; // What: Installed Guard. Why: proRelFun's own async probe found this PWA already installed elsewhere on this device. How: This returns 'installed' whenever relInsBoo is true.



	return insProBoo ? 'unsupported' : 'pending'; // What: Fallback Return. Why: Every more specific case above was ruled out, so the only remaining question is whether the grace period has actually elapsed yet. How: This returns 'unsupported' once insProBoo is true, otherwise 'pending'.


}

// #endregion insStaFun



const canInsFun = () => !!insCapObj; // What: Can Install Function. Why: tab-settings.jsx calls this to decide whether to render its own install button at all. How: This closes over the module-private insCapObj rather than exposing it directly.



const askFirFun = () => askPerFun( false ); // What: Ask First Function. Why: store.jsx calls this the moment the user creates their first picker, the first instant there is data worth protecting from eviction. How: This calls askPerFun unforced, so a device that already asked (and was denied) is not asked again.



export const PWA_NAM_OBJ = { // What: Progressive Web App Namespace Object. Why: This is the single public entry point store.jsx and tab-settings.jsx both import by name. How: This maps each of this file's own internal function/variable names directly onto matching external property names.


	askFirFun : askFirFun, // What: Ask First Function. Why: store.jsx calls this the moment the user creates their first picker. How: This re-exports askFirFun under its own matching name.
	askInsFun : askInsFun, // What: Ask Install Function. Why: tab-settings.jsx calls this from its own install button's click handler. How: This re-exports askInsFun under its own matching name.
	askPerFun : askPerFun, // What: Ask Persist Function. Why: tab-settings.jsx calls this directly, forced, from its own Settings action. How: This re-exports askPerFun under its own matching name.
	canInsFun : canInsFun, // What: Can Install Function. Why: tab-settings.jsx calls this to decide whether to render its own install button at all. How: This re-exports canInsFun under its own matching name.
	insStaFun : insStaFun, // What: Install State Function. Why: tab-settings.jsx calls this to choose which install-instructions copy to show. How: This re-exports insStaFun under its own matching name.
	isaIosBoo : isaIosBoo, // What: Is-An Ios Boolean. Why: tab-settings.jsx reads this directly, not called, to decide whether to show the manual Share-to-Home-Screen instructions. How: This re-exports isaIosBoo under its own matching name.
	isaMacBoo : isaMacBoo, // What: Is-A Mac Boolean. Why: tab-settings.jsx reads this directly, not called, to decide whether to show the manual File-menu-Add-to-Dock instructions. How: This re-exports isaMacBoo under its own matching name.
	isaSafBoo : isaSafBoo, // What: Is-A Safari Boolean. Why: This stays exported as part of PWA_NAM_OBJ's own stable public shape, even though nothing outside this file currently reads it. How: This re-exports isaSafBoo under its own matching name.
	isaStaFun : isaStaFun, // What: Is-A Standalone Function. Why: tab-settings.jsx calls this to decide whether the app is already running installed. How: This re-exports isaStaFun under its own matching name.

	subscribe : ( newSubFun ) => { // What: Subscribe. Why: A UI component needs to learn about install/persistence changes without polling. How: This adds newSubFun to subFunSet and returns its own unsubscribe function.


		subFunSet.add( newSubFun ); // What: New Subscriber Add Call. Why: The freshly-added callback must actually be tracked so notSubFun can reach it later. How: This adds newSubFun to subFunSet.



		return () => subFunSet.delete( newSubFun ); // What: Unsubscribe Return. Why: The caller needs a way to stop receiving notifications later. How: This returns a closure that removes newSubFun from subFunSet when called.


	}


};


