


// #region Imports

import { subMakFun } from '../utils/subscribers.ts'; // What: Subscriber Make Function. Why: The update note's subscribers hear when an update becomes ready. How: This makes the subscriber set once, in Module State.

// #endregion Imports



/**
 * update.ts = App Update Handling
 *
 * @summary
 * Brings a newly deployed version into an open app without losing anything the
 * person is doing. The service worker already takes over as soon as a new
 * version installs (vite-plugin-pwa's autoUpdate calls skipWaiting and
 * clientsClaim), but the page keeps running the old code until it reloads, and
 * an installed app left open stays on the old code until something reloads it.
 * So this file asks the browser to look for a new version whenever the app
 * comes back to the foreground, and once a new version has taken control, it
 * reloads the app while it's hidden, but only when nothing is under way: no
 * inline editor or add form open, no support form open, no text field focused,
 * no tour running, and no account sync uploading or waiting to. While
 * something is under way, it marks the update ready instead, for the app to
 * offer a Reload button, and tries again the next time the app is hidden or a
 * sync finishes. A first install, where no worker controlled the page at load,
 * isn't an update and is ignored.
 *
 * Sections:
 *  - Module State
 *  - Helpers
 *  - Module Init
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Module State

let hadConBoo = !!( navigator.serviceWorker && navigator.serviceWorker.controller ); // What: Had Controller Boolean. Why: A worker taking control of a page that had none is a first install, not an update. How: This records whether a worker controlled the page at load.

const { notSubFun, subAddFun } = subMakFun(); // What: Notify Subscribers Function. Why: The update note has to rerender once an update is ready. How: This calls every subscriber, one throwing subscriber never stopping the rest. // What: Subscribe Add Function. Why: The update note listens for an update becoming ready. How: This adds a subscriber and returns the function that removes it.

let synBusBoo = false; // What: Sync Busy Boolean. Why: A reload would cut off an account sync uploading, or about to upload, a change. How: synBusFun sets this while a sync runs or a change waits.
let updReaBoo = false; // What: Update Ready Boolean. Why: The app shows its Reload note only once a new version has taken over. How: This turns true when that happens.

// #endregion Module State



// #region Helpers

// #region busNowFun

/**
 * busNowFun = Busy Now Function
 *
 * @summary
 * Reports whether the person may be in the middle of something a reload would
 * throw away: an inline editor or add form registered on the shared Escape
 * stack, the Settings support form open, a text field or text area focused,
 * a tour running, or account sync uploading a change or waiting to.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns True while any of those holds, false when a reload is safe.
 * @see {@link busNowBoo}
 *
 * @example
 * ```ts
 * busNowFun() // => false
 * ```
 *
*/

function busNowFun () : boolean {


	const actDomEle = document.activeElement; // What: Active DOM Element. Why: A focused text field means typing may be under way. How: This reads the focused element.

	const ediOpeBoo = ( window.__escStack || [] ).length > 0;                              // What: Editor Open Boolean. Why: An open inline editor or add form is registered on the Escape stack. How: This checks the stack holds an entry.
	const supOpeBoo = !!document.querySelector( '[data-element-name-hook~="supForDiv"]' ); // What: Support Open Boolean. Why: The support form doesn't register on the Escape stack. How: This checks its form is in the page.
	const texFocBoo = actDomEle instanceof HTMLTextAreaElement || ( actDomEle instanceof HTMLInputElement && /^(email|search|text|url)$/.test( actDomEle.type ) ); // What: Text Focus Boolean. Why: A field being typed in may hold text not yet saved. How: This checks the focused element is a text area or a text input.
	const touActBoo = document.body.hasAttribute( 'data-tour-active' );                    // What: Tour Active Boolean. Why: A reload would end a running tour partway. How: This checks the body's tour attribute.

	const busNowBoo = ediOpeBoo || supOpeBoo || synBusBoo || texFocBoo || touActBoo; // What: Busy Now Boolean. Why: Any one of these makes a reload unsafe. How: This combines them.



	return busNowBoo; // What: Busy Now Return. Why: The combined answer is this function's result. How: This hands back the combined answer.


}

// #endregion busNowFun



// #region relNowFun

/**
 * relNowFun = Reload Now Function
 *
 * @summary
 * Reloads the page so the new version runs.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * relNowFun() // => void
 * ```
 *
*/

const relNowFun = () : void => window.location.reload(); // What: Reload Now Function. Why: The new version runs only once the page reloads. How: This reloads the page, which the Reload note's button calls too.

// #endregion relNowFun



// #region relSafFun

/**
 * relSafFun = Reload Safe Function
 *
 * @summary
 * Reloads the page only when it is safe to do so quietly: a new version has
 * taken control, the app is hidden, and busNowFun finds nothing under way.
 * Otherwise it does nothing, leaving the update marked ready for the Reload
 * note.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * relSafFun() // => void
 * ```
 *
*/

const relSafFun = () : void => { if ( updReaBoo && document.visibilityState === 'hidden' && !busNowFun() ) relNowFun(); }; // What: Reload Safe Function. Why: A quiet reload must happen only out of sight and with nothing being edited. How: This reloads once an update is ready, the app is hidden, and busNowFun finds nothing under way.

// #endregion relSafFun



// #region synBusFun

/**
 * synBusFun = Sync Busy Function
 *
 * @summary
 * Records whether account sync is uploading a change or has one waiting to
 * go up, either of which a reload would cut off. Turning it off tries the
 * safe reload again, so a hidden app that held an update back for a sync
 * takes the new version once the sync is done.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param newBusBoo - New Busy Boolean: Whether a sync is running or a change
 *                    is waiting to sync.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * synBusFun(false) // => void
 * ```
 *
*/

const synBusFun = ( newBusBoo : boolean ) : void => { // What: Sync Busy Function. Why: Sync tells this file when a reload would interrupt it. How: This stores the flag and, once it clears, tries the safe reload.


	synBusBoo = newBusBoo; // What: Sync Busy Assignment. Why: busNowFun reads it. How: This stores the new state.


	if ( !newBusBoo ) relSafFun(); // What: Sync Done Reload Call. Why: An update held back for a sync should land once the sync ends. How: This tries the safe reload when the sync is no longer busy.


};

// #endregion synBusFun



// #region updReaFun

/**
 * updReaFun = Update Ready Function
 *
 * @summary
 * Reports whether a new version has taken control of the page.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns True once an update is ready, false before.
 *
 * @example
 * ```ts
 * updReaFun() // => false
 * ```
 *
*/

const updReaFun = () : boolean => updReaBoo; // What: Update Ready Function. Why: The update note reads whether to show itself. How: This returns the current flag.

// #endregion updReaFun

// #endregion Helpers



// #region Module Init

if ( navigator.serviceWorker ) navigator.serviceWorker.addEventListener( 'controllerchange', () => { // What: Controller Change Listener. Why: A new version taking control of the page is the signal that an update is ready. How: This marks the update ready, tells the note to show, and reloads at once when that's safe.


	if ( !hadConBoo ) { hadConBoo = true; return; } // What: First Install Guard. Why: A first install's worker taking control isn't a new version. How: This records the controller and stops.



	updReaBoo = true; // What: Update Ready Set. Why: A new version now controls the page. How: This marks the update ready.


	notSubFun(); // What: Subscriber Notify Call. Why: The note should offer the reload. How: This tells every subscriber.

	relSafFun(); // What: Safe Reload Call. Why: A hidden app with nothing being edited can take the new version at once. How: This reloads when that holds.


} );



document.addEventListener( 'visibilitychange', () => { // What: Visibility Change Listener. Why: Coming back is the moment to look for a new version, and leaving is the moment to apply one quietly. How: This asks for an update when the app shows, and tries a safe reload when it hides.


	if ( document.visibilityState === 'visible' && navigator.serviceWorker ) navigator.serviceWorker.getRegistration().then( ( worRegObj ) => worRegObj?.update() ).catch( () => {} ); // What: Update Check Call. Why: Coming back to the app is when to look for a new version. How: This asks the registration to look for one, ignoring a failed check, such as one made offline.

	else relSafFun(); // What: Hidden Reload Call. Why: A hidden app with an update ready and nothing being edited can reload unseen. How: This tries the safe reload.


} );

// #endregion Module Init



// #region Exports

const UPD_NAM_OBJ = { // What: Update Namespace Object. Why: This gathers the update operations into one namespaced export. How: This maps each name to the function it calls.


	relNowFun : relNowFun, // What: Reload Now Function. Why: The note's Reload button applies the update. How: This exports relNowFun under its own name.
	subAddFun : subAddFun, // What: Subscribe Add Function. Why: The note listens for an update becoming ready. How: This exports subAddFun under its own name.
	synBusFun : synBusFun, // What: Sync Busy Function. Why: Sync tells this file when a reload would interrupt it. How: This exports synBusFun under its own name.
	updReaFun : updReaFun  // What: Update Ready Function. Why: The note reads whether an update is ready. How: This exports updReaFun under its own name.


};



export { UPD_NAM_OBJ }; // What: Named Export. Why: The one object carries every update operation. How: This exports UPD_NAM_OBJ by name.

// #endregion Exports


