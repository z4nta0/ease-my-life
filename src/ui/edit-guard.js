


/**
 * edit-guard.js = Edit Guard
 *
 * @summary
 * The cross-editor edit guard: one window-level object every inline editor
 * arms with its own revert function when it closes implicitly and disarms when
 * the next editor opens, so an edit abandoned by switching away is rolled
 * back. It lives on window because the editors that use it sit in separate
 * files, and it only exists for its side effect, so users import this file
 * without importing a binding.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region window.__editGuard

/**
 * window.__editGuard = Edit Guard Coordinator
 *
 * @summary
 * Lets live-commit editors (picker settings, picker items) discard
 * UNSAVED edits when the editor closes implicitly (tab-switch or
 * reload) while KEEPING them on an in-tab sibling swap. An unmounting
 * editor calls armFun() to stage a revert on the next macrotask; a
 * sibling editor mounting in the same React commit calls disFun() to
 * cancel it before it fires. A real tab-switch leaves nothing to
 * cancel it, so the revert runs.
 * (Reload is handled by each editor's own pagehide synchronous
 * localStorage restore, so this timeout never matters there.)
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

window.__editGuard = window.__editGuard || { // What: Edit Guard Global. Why: This must be a single shared object every editor's mount/unmount can read and write, reachable outside the normal React import graph. How: This is only created once (a re-evaluation keeps whatever the global already holds), exposing armFun/disFun as the stable methods every editor calls by name.


	_revFun : null, // What: Revert Function. Why: The actual staged revert callback must be reachable from the timeout that eventually runs it. How: This starts null and is set by arm, read and cleared by the timeout callback below.
	_timNum : null, // What: Timeout Number. Why: A pending revert's own setTimeout id must be cancelable by a later armFun/disFun call. How: This starts null and is set/cleared by arm and disarm below.

	armFun( penRevFun ) { // What: Arm Function. Why: An unmounting editor needs to stage its own revert, cancelable by a sibling mounting in the same commit. How: This cancels any previous timeout, stores penRevFun, and schedules it to run on the next macrotask unless disarmed first.


		clearTimeout( this._timNum ); // What: Timeout Cancel. Why: A previous armFun() call's own pending revert must not also fire alongside this new one. How: This cancels whatever timeout id was previously stored.

		this._revFun = penRevFun; // What: Revert Function Store. Why: The scheduled timeout below needs to find this exact callback when it runs. How: This overwrites _revFun with the newly-armed callback.

		this._timNum = setTimeout( () => { // What: Timeout Schedule. Why: A same-commit sibling mount must get a chance to disFun() before this actually runs. How: This schedules the revert for the very next macrotask, i.e. after the current commit's own synchronous work finishes.


			const staRevFun = this._revFun; // What: Staged Revert Function. Why: _revFun must be captured before it's cleared below, in case running it somehow re-enters armFun/disFun. How: This reads the currently-staged callback into a local before touching the shared fields.


			this._revFun = null; // What: Revert Function Clear. Why: A fired revert must not remain staged as if it were still pending. How: This resets _revFun back to null.
			this._timNum = null; // What: Timeout Number Clear. Why: A fired timeout's own id is no longer meaningful to cancel. How: This resets _timNum back to null.


			if ( staRevFun ) { // What: Staged Revert Guard. Why: disFun() may have already cleared the callback before this timeout fired. How: This only attempts to run the revert when one was actually still staged.


				try { staRevFun(); } // What: Staged Revert Call. Why: This is the actual state-reverting side effect an unmounted editor asked for. How: This invokes the captured callback.

				catch {} // What: Staged Revert Error Guard. Why: A revert callback throwing must not crash whatever unrelated code happens to run next on this same tick. How: This silently swallows any error the callback raised.


			}


		}, 0 );


	},

	disFun() { // What: Disarm Function. Why: A sibling editor mounting in the same React commit needs to cancel an outgoing editor's staged revert before it fires. How: This cancels the pending timeout and clears both shared fields back to their idle state.


		clearTimeout( this._timNum ); // What: Timeout Cancel. Why: The scheduled revert must never actually run once disarmed. How: This cancels whatever timeout id is currently stored.

		this._timNum = null; // What: Timeout Number Clear. Why: A canceled timeout's own id is no longer meaningful. How: This resets _timNum back to null.
		this._revFun = null; // What: Revert Function Clear. Why: A canceled arm should leave nothing staged behind. How: This resets _revFun back to null.


	}


};

// #endregion window.__editGuard


