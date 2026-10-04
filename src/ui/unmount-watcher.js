


// #region Imports

import React from 'react'; // What: React. Why: The watcher is a component built on React's own ref and effect hooks. How: This is used directly (React.useRef, React.useLayoutEffect, React.useEffect).

// #endregion Imports



/**
 * unmount-watcher.js = Unmount Watcher
 *
 * @summary
 * A component that renders nothing and only reports when it unmounts. The
 * Data tab places one inside each open editor row, so every way that row can
 * disappear (collapsing its card or section, a filter hiding it, or a switch
 * to another tab) runs the same "closing saves" handler that the row's own
 * collapse chevron does, without each of those paths having to know an
 * editor was open inside it.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

// #region UnmWatCom

/**
 * UnmWatCom = Unmount Watcher Component
 *
 * @summary
 * Calls onUnmFun once, when this component unmounts. The handler is read
 * from the most recent render, so it always sees the parent's latest state
 * (the newest draft) rather than whatever existed when the watcher mounted.
 * Renders nothing.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.onUnmFun - On Unmount Function: The handler to run when this
 *                         watcher unmounts.
 *
 * @returns Nothing, since the watcher has no markup of its own.
 *
 * @example
 * ```tsx
 * UnmWatCom({ onUnmFun }) // => <UnmWatCom />
 * ```
 *
*/

function UnmWatCom ( { onUnmFun } ) {


	const onUnmRef = React.useRef( onUnmFun ); // What: On Unmount Reference. Why: The unmount cleanup below runs long after its own effect was created, so it must read the latest handler from somewhere that keeps changing. How: This holds the most recent onUnmFun.


	React.useLayoutEffect( () => { onUnmRef.current = onUnmFun; } ); // What: Handler Sync Effect. Why: Every render's own handler sees the parent's newest state. How: This copies the latest onUnmFun into onUnmRef after each render.


	React.useEffect( () => () => onUnmRef.current(), [] ); // What: Unmount Report Effect. Why: The parent needs to know the moment this watcher leaves the page. How: This returns a cleanup that calls the latest handler, run only on unmount.



	return null; // What: Empty Render Return. Why: The watcher exists only for its unmount, so it draws nothing. How: This returns null.


}

// #endregion UnmWatCom

// #endregion Components



// #region Exports

export { UnmWatCom }; // What: Named Export. Why: The Data tab's item and reminder rows both commit their drafts when they disappear. How: This exports UnmWatCom by name.

// #endregion Exports


