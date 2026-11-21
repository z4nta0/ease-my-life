


// #region Imports

import React from 'react'; // What: React. Why: The watcher is a component built on React's own ref and effect hooks. How: This is used directly (React.useRef, React.useLayoutEffect, React.useEffect).

// #endregion Imports



/**
 * unmount-watcher.ts = Unmount Watcher
 *
 * @summary
 * A component that renders nothing and only reports when it unmounts, so
 * whatever removes it from the page runs its handler without that code
 * having to know it was there. The Data tab places one inside each open
 * editor row.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

type UwcProTyp = { onUnmWatFun : () => void }; // What: Unmount-Watcher-Component Props Type. Why: The watcher's only prop is the handler it runs on unmount. How: This types UnmWatCom's props.

// #region UnmWatCom

/**
 * UnmWatCom = Unmount Watcher Component
 *
 * @summary
 * Calls onUnmWatFun once, when this component unmounts. The handler is read
 * from the most recent render, so it always sees the parent's latest state
 * (the newest draft) rather than whatever existed when the watcher mounted.
 * Renders nothing.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.onUnmWatFun - On Unmount Watcher Function: The handler to run
 *                            when this watcher unmounts.
 *
 * @returns Nothing, since the watcher has no markup of its own.
 *
 * @example
 * ```tsx
 * UnmWatCom({ onUnmWatFun }) // => <UnmWatCom />
 * ```
 *
*/

function UnmWatCom ( { onUnmWatFun } : UwcProTyp ) : null {


	const unmHanRef = React.useRef( onUnmWatFun ); // What: Unmount Handler Reference. Why: The unmount cleanup below runs long after its own effect was created, so it must read the latest handler from somewhere that keeps changing. How: This holds the most recent onUnmWatFun.


	React.useLayoutEffect( () => { unmHanRef.current = onUnmWatFun; } ); // What: Handler Sync Effect. Why: Every render's own handler sees the parent's newest state. How: This copies the latest onUnmWatFun into unmHanRef after each render.


	React.useEffect( () => () => unmHanRef.current(), [] ); // What: Unmount Report Effect. Why: The parent needs to know the moment this watcher leaves the page. How: This returns a cleanup that calls the latest handler, run only on unmount.



	return null; // What: Empty Render Return. Why: The watcher exists only for its unmount, so it draws nothing. How: This returns null.


}

// #endregion UnmWatCom

// #endregion Components



// #region Exports

export { UnmWatCom }; // What: Named Export. Why: A row commits its draft when it disappears through this watcher. How: This exports UnmWatCom by name.

// #endregion Exports


