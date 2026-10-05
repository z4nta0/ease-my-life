


// #region Imports

import React from 'react'; // What: React. Why: useEscCanFun registers and cleans up its stack entry from an effect. How: This is used directly (React.useRef, React.useEffect) instead of importing individual named hooks.

// #endregion Imports



/**
 * escape-cancel.js = Escape Cancel
 *
 * @summary
 * Escape-to-cancel for the app's inline editors and add forms. Every open
 * editor registers itself on one shared stack through useEscCanFun, and a
 * single document-level listener runs only the innermost entry, skipping while
 * a tooltip or modal scrim owns Escape. The stack and the listener are window
 * globals so repeated module evaluation never double-binds them.
 *
 * Sections:
 *  - Module State
 *  - Hooks
 *  - Module Init
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Module State

window.__escStack = window.__escStack || []; // What: Escape Stack Global. Why: Multiple inline editors can be open across different components at once, and only the innermost one should react to Escape. How: This is a plain array of { runFun } entries, pushed/spliced by every useEscCanFun call below and read by the document-level listener further down.

// #endregion Module State



// #region Hooks

// #region useEscCanFun

/**
 * useEscCanFun = Use Escape Cancel Function
 *
 * @summary
 * Escape cancels the innermost open inline editor/add-form. Registered
 * on a stack so only the deepest active editor reacts, and skipped
 * while a tooltip or modal scrim is showing (those own Escape first).
 * Escape is NOT bound to collapsible sections: the ARIA disclosure
 * pattern doesn't use it, their state is persisted, and they nest.
 * Document-level rather than an input's onKeyDown so it still fires
 * after focus has moved to a control inside the editor.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param actStaBoo - Active State Boolean: Whether the calling editor is
 *                    currently open, and so should hold a stack slot.
 * @param hanCalFun - Handler Callback Function: Runs when Escape cancels
 *                    this editor; the latest one passed is always used.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * useEscCanFun(actStaBoo, hanCalFun) // => void
 * ```
 *
*/

function useEscCanFun ( actStaBoo, hanCalFun ) {


	const hanFunRef = React.useRef( hanCalFun ); // What: Handler Function Reference. Why: The registered stack entry must always call the latest handler, not whichever one was passed on the render that first mounted it. How: This is created once from the initial handler and overwritten on every render below.


	hanFunRef.current = hanCalFun; // What: Handler Reference Update. Why: A closure captured on mount would otherwise go stale across re-renders. How: This keeps hanFunRef pointed at the caller's own current handler on every render.


	React.useEffect( () => { // What: Stack Registration Effect. Why: Only an active editor should occupy a slot on the shared escape stack. How: This pushes a stack entry while active, and removes that same entry on cleanup.


		if ( !actStaBoo ) return; // What: Inactive Guard. Why: A closed editor has nothing to register. How: This skips the rest of the effect while actStaBoo is false.



		const staEntObj = { runFun : () => hanFunRef.current && hanFunRef.current() }; // What: Stack Entry Object. Why: The shared stack needs a stable object identity per registration, so this exact entry can be found and removed again on cleanup. How: This wraps a call to whatever handler hanFunRef currently points at.


		window.__escStack.push( staEntObj ); // What: Stack Push Call. Why: This is what actually makes this editor reachable by the document-level Escape listener below. How: This appends staEntObj to the shared stack.



		return () => { // What: Stack Cleanup Function. Why: A closed or unmounted editor must not linger on the shared stack. How: This finds staEntObj's own current index and removes it.


			const entIndNum = window.__escStack.indexOf( staEntObj ); // What: Entry Index Number. Why: splice needs a real index, not the entry object itself. How: This looks up staEntObj's own current position in the shared stack.


			if ( entIndNum > -1 ) window.__escStack.splice( entIndNum, 1 ); // What: Stack Splice Guard. Why: The entry could conceivably already be gone. How: This removes exactly one element at entIndNum when it was actually found.


		};


	}, [ actStaBoo ] ); // What: Effect Dependency Array. Why: Registration/deregistration only needs to happen when actStaBoo itself flips. How: actStaBoo is read directly inside the guard above.


}

// #endregion useEscCanFun

// #endregion Hooks



// #region Module Init

if ( !window.__escBound ) { // What: Escape Bound Guard. Why: The document-level Escape listener must only ever be attached once, even across multiple module re-evaluations (e.g. HMR). How: This gates the whole listener-attach block below on a global marker.


	window.__escBound = true; // What: Escape Bound Flag Set. Why: Every later module evaluation must see that the listener is already attached. How: This marks the global guard true before actually attaching the listener.

	document.addEventListener( 'keydown', ( keyDowObj ) => { // What: Document Keydown Listener. Why: This is the single shared handler that lets Escape cancel whichever editor is currently innermost. How: This checks a run of guards, then invokes the top entry on the shared escape stack.


		if ( keyDowObj.key !== 'Escape' || keyDowObj.defaultPrevented ) return; // What: Non-Escape Guard. Why: Only an actual, not-already-handled Escape keypress should ever reach the stack. How: This bails out for any other key, or one whose default was already prevented by something else.



		const escStaArr = window.__escStack; // What: Escape Stack Array. Why: The rest of this handler needs a stable local reference to the shared stack. How: This reads window.__escStack once and reuses it below.


		if ( !escStaArr.length ) return; // What: Empty Stack Guard. Why: There is nothing to cancel when no editor is currently registered. How: This bails out when the shared stack is empty.



		if ( document.querySelector( '[data-element-name-hook~="infTipSpa"], [data-element-name-hook~="intScrDiv"]' ) ) return; // What: Overlay Guard. Why: A visible tooltip or modal scrim owns Escape first, ahead of any inline editor. How: This bails out while either kind of overlay is present in the document.



		keyDowObj.preventDefault(); // What: Default Prevention Call. Why: The browser's own Escape behavior (e.g. exiting fullscreen) shouldn't also fire alongside this cancel. How: This prevents the keydown event's default action.

		escStaArr[ escStaArr.length - 1 ].runFun(); // What: Top Entry Run Call. Why: Only the deepest (innermost, most-recently-registered) active editor should react. How: This invokes the runFun() of the last entry in escStaArr.


	} );


}

// #endregion Module Init



// #region Exports

export { useEscCanFun }; // What: Named Export. Why: Every inline editor and add form registers its own Escape handler through this hook. How: This exports useEscCanFun by name.

// #endregion Exports


