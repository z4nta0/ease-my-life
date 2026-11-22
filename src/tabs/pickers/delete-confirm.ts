


// #region Imports

import React from 'react'; // What: React. Why: The confirm state is held in React state so the pool rows re-render as it changes. How: This is used directly (React.useState).


import { durMilFun } from '../../utils/rhythm.ts'; // What: Duration Millisecond Function. Why: The clear timer must end with the leaving animation it waits on. How: This returns a duration step's length in milliseconds.
import { redMotFun } from '../../utils/motion.ts'; // What: Reduced Motion Function. Why: The leaving animation is skipped for a user who prefers reduced motion. How: This is checked before staging it.

// #endregion Imports



/**
 * delete-confirm.ts = Delete Confirm
 *
 * @summary
 * The inline delete confirmation state for a pool row: which row is asking
 * to be deleted, which one is playing its leaving animation after Cancel,
 * and the Cancel handler that plays it.
 *
 * Sections:
 *  - Hooks
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Hooks

// #region useDelConFun

/**
 * useDelConFun = Use Delete Confirm Function
 *
 * @summary
 * Holds a pool's delete confirmation. conDelStr is the id of the row showing
 * its confirm row, set through setConDelStr. conLeaStr is the id of the
 * row playing its leaving animation after Cancel. canConFun backs out of the
 * pending delete: under reduced motion it clears the confirm state at once,
 * and otherwise it marks the row as leaving, then clears both once the
 * leaving animation's base duration step has passed.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns The confirming and leaving ids, the confirming id's setter, and the
 *          Cancel handler.
 *
 * @example
 * ```ts
 * useDelConFun() // => { canConFun, conDelStr, conLeaStr, setConDelStr }
 * ```
 *
*/

function useDelConFun () : { canConFun : () => void, conDelStr : string | null, conLeaStr : string | null, setConDelStr : ( nexIdeStr : string | null ) => void } {


	const [ conDelStr, setConDelStr ] = React.useState< string | null >( null ); // What: Confirm Delete String And Setter. Why: Deleting a pool item asks for confirmation inline, in place of that row's own normal content. How: This holds the id currently showing its own delete-confirm row.
	const [ conLeaStr, setConLeaStr ] = React.useState< string | null >( null ); // What: Confirm Leaving String And Setter. Why: Cancelling a delete confirmation needs its own out-animation before the row reverts to normal. How: This holds the id currently playing that leaving animation, cleared once it finishes.



	// #region canConFun

	/**
	 * canConFun = Cancel Confirm Function
	 *
	 * @summary
	 * Backs out of a pending item delete. Under reduced motion it clears the
	 * confirm state at once; otherwise it flags the confirm row as leaving so
	 * it plays its exit animation, then clears both once its exit's base
	 * duration step has passed.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * canConFun() // => void
	 * ```
	 *
	*/

	const canConFun = () => { // What: Cancel Confirm Function. Why: Cancelling a pending delete needs to play the row's leaving animation, unless reduced motion applies. How: This either clears conDelStr immediately, or stages conLeaStr for the base duration step first.


		if ( redMotFun() ) { setConDelStr( null ); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion shouldn't wait through a skipped animation. How: This clears the confirm state immediately and returns.



		setConLeaStr( conDelStr ); // What: Leaving Stage Call. Why: The confirm row needs to actually play its own out-animation now. How: This copies the current conDelStr into conLeaStr.

		setTimeout( () => { // What: Delayed Clear Call. Why: The confirm row must not fully disappear until its own out-animation has had time to actually play. How: This clears both conLeaStr and conDelStr once the exit's base duration step has passed.


			setConLeaStr( null ); // What: Leaving Clear Call. Why: The confirm row has finished its exit animation. How: This resets conLeaStr to null.
			setConDelStr( null ); // What: Confirm Clear Call. Why: No row stays in its delete-confirm state. How: This resets conDelStr to null.


		}, durMilFun( 'bas' ) ); // What: Leaving Animation Delay. Why: The confirm row must finish leaving before it clears. How: This waits the same base duration step its leaving keyframes play over. // Duration Base ~= 157.8ms


	};

	// #endregion canConFun



	return { canConFun, conDelStr, conLeaStr, setConDelStr }; // What: Delete Confirm Return. Why: The caller needs the confirm state, its setter, and the Cancel handler. How: This returns canConFun, both ids, and setConDelStr.


}

// #endregion useDelConFun

// #endregion Hooks



// #region Exports

export { useDelConFun }; // What: Named Export. Why: The delete confirmation is one shared hook. How: This exports useDelConFun by name.

// #endregion Exports


