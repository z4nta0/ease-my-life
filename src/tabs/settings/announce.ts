


/**
 * announce.ts = Announce
 *
 * @summary
 * The app's screen-reader live region. The module creates one visually hidden
 * polite status element on load and assigns annStaFun, which announces a short
 * message through it, clearing the text first so a repeated message is still
 * read aloud.
 *
 * Sections:
 *  - Module State
 *  - Module Init
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Module State

let annStaFun : ( mesTexStr : string, mesOptObj? : { assertive? : boolean } ) => void; // What: Announce Status Function. Why: The real implementation is only built once the setup IIFE just below runs, but the exported binding must already exist for it to assign into. How: This starts undefined and is overwritten inside that IIFE.

// #endregion Module State



// #region Module Init

// #region Announce Status Setup

/**
 * announce.ts = Announce Status Setup
 *
 * @summary
 * Builds the one screen-reader live region the whole app announces
 * through, once, at module load, and assigns annStaFun's real
 * implementation. The region has to exist before any message arrives,
 * since a region that mounts together with its own text is announced
 * unreliably (or not at all) by several browser and screen-reader
 * pairs. When the page body doesn't exist yet, attaching waits for
 * DOMContentLoaded.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * (() => { ... })() // => void
 * ```
 *
*/

(() => { // What: Announce Status Setup IIFE. Why: The live region must be created exactly once, at module load, since a region that mounts together with its own text is announced unreliably (or not at all) in several browser/screen-reader pairs. How: This builds the live region, attaches it to <body> (immediately or on DOMContentLoaded), and assigns the real implementation into the module-level annStaFun binding declared just above.


	const livRegEle = document.createElement( 'div' ); // What: Live Region Element. Why: This is the actual DOM node screen readers watch for status announcements. How: This is a plain div, styled invisibly by CSS via its own class below, that persists for the app's whole lifetime.


	livRegEle.className = 'livRegDiv';               // What: Live Region Class Name. Why: CSS needs a selector to visually hide this element while keeping it in the accessibility tree. How: This sets the class the app's stylesheet targets.
	livRegEle.setAttribute( 'role', 'status' );      // What: Live Region Role Attribute. Why: This tells assistive tech that this element carries transient status updates. How: This sets the standard ARIA role.
	livRegEle.setAttribute( 'aria-live', 'polite' ); // What: Live Region Live Attribute. Why: A default politeness level is needed before any real annStaFun() call can override it per-call. How: This starts the region at "polite", overwritten per-call below.
	livRegEle.setAttribute( 'aria-atomic', 'true' ); // What: Live Region Atomic Attribute. Why: A screen reader should read the whole message, not just whatever text node changed. How: This tells assistive tech to treat content changes as replacing the whole region.


	const attRegFun = () => document.body && document.body.appendChild( livRegEle ); // What: Attach Region Function. Why: The live region does nothing until it's actually in the document. How: This appends livRegEle to document.body, guarded in case body doesn't exist yet.


	if ( document.body ) attRegFun(); // What: Immediate Attach Branch. Why: A load order where document.body already exists needs no further waiting. How: This calls attRegFun immediately.

	else document.addEventListener( 'DOMContentLoaded', attRegFun ); // What: Deferred Attach Branch. Why: A load order where document.body doesn't exist yet must wait for the DOM to finish parsing. How: This defers attRegFun until DOMContentLoaded fires.



	let annTimNum : number | null = null; // What: Announce Timeout Number. Why: A rapid-fire annStaFun() call must debounce against the previous call's own pending timeout. How: This holds the current setTimeout id, cleared and reassigned on every call below.


	// #region annStaFun

	/**
	 * annStaFun = Announce Status Function
	 *
	 * @summary
	 * Speaks a status message through the live region. The region is
	 * emptied first and the text set on a short delay, so even an
	 * identical repeat message is announced again; a newer call cancels
	 * an older one still waiting. An empty message is ignored.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param mesTexStr - Message Text String: The text to announce.
	 * @param mesOptObj - Message Option Object: Optional settings; assertive
	 *                    interrupts instead of waiting politely.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * annStaFun('Picker saved') // => void
	 * ```
	 *
	*/

	annStaFun = ( mesTexStr, mesOptObj ) => { // What: Announce Status Function. Why: This is the actual exported implementation, assigned into the module-level annStaFun binding declared just above this IIFE. How: This updates the region's own politeness, clears its text, then sets the new text on the next tick so the change is reliably detected.


		if ( !mesTexStr ) return; // What: No Message Guard. Why: There is nothing useful to annStaFun for an empty/falsy message. How: This bails out without touching the region at all.



		livRegEle.setAttribute( 'aria-live', ( mesOptObj && mesOptObj.assertive ) ? 'assertive' : 'polite' ); // What: Live Attribute Update. Why: Some announcements (e.g. an error) need to interrupt immediately rather than wait politely. How: This sets assertive only when mesOptObj explicitly asks for it, polite otherwise.


		livRegEle.textContent = ''; // What: Text Content Clear. Why: Re-announcing the exact same text as last time needs a real change for the reader to detect. How: This empties the region first, before the delayed set below.

		clearTimeout( annTimNum ); // What: Timeout Clear. Why: A rapid repeat call must not let an earlier delayed set race this newer one. How: This cancels whatever timeout was previously scheduled.

		annTimNum = setTimeout( () => { livRegEle.textContent = mesTexStr; }, 60 ); // What: Timeout Schedule. Why: Setting the text on the very next tick (rather than immediately) is what makes even an identical repeat message reliably re-announced. How: This schedules the real text write 60ms later.


	};

	// #endregion annStaFun


} )();

// #endregion Announce Status Setup

// #endregion Module Init



// #region Exports

export { annStaFun }; // What: Named Export. Why: Settings announces backup, import and reset results to screen readers through this function. How: This exports annStaFun by name.

// #endregion Exports


