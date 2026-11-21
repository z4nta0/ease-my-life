


/**
 * subscribers.ts = Subscribers
 *
 * @summary
 * A small factory for a module's own list of change subscribers. Each call
 * makes a fresh set and hands back the two functions that work on it: one
 * that adds a subscriber and returns its unsubscribe function, and one that
 * calls every subscriber in turn. A module calls it once and keeps the pair,
 * so its listeners never mix with another module's.
 *
 * Sections:
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Helpers

type SmfResTyp = { notSubFun : () => void, subAddFun : ( newSubFun : () => void ) => ( () => void ) }; // What: Subscriber-Make-Function Result Type. Why: A module keeps both functions the factory returns. How: This is the notify function and the add function that returns an unsubscribe function.

// #region subMakFun

/**
 * subMakFun = Subscriber Make Function
 *
 * @summary
 * Makes a fresh, empty set of subscribers and returns the two functions
 * that work on it. subAddFun adds a callback and returns a function that
 * removes it again. notSubFun calls every callback in insertion order, with
 * no arguments, isolating each call in its own try/catch, so one callback
 * that throws never stops the rest from being called.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns The set's notify function and its add function.
 *
 * @example
 * ```ts
 * subMakFun() // => { notSubFun, subAddFun }
 * ```
 *
*/

function subMakFun () : SmfResTyp {


	const subFunSet = new Set< () => void >(); // What: Subscriber Function Set. Why: The module's subscribers are kept apart from every other module's. How: subAddFun adds to this set and notSubFun walks it.


	const notSubFun = () => { // What: Notify Subscribers Function. Why: Every subscriber must hear about a change the module tracks. How: This calls every function currently in subFunSet, isolating each call in its own try/catch so one throwing subscriber cannot stop the rest from being notified.


		for ( const curSubFun of subFunSet ) { // What: Subscriber Loop. Why: Every registered subscriber must hear about the change. How: This walks subFunSet in insertion order.


			try { curSubFun(); } // What: Subscriber Call Try. Why: This is the actual notification. How: This calls the subscriber with no arguments.

			catch {} // What: Subscriber Error Guard. Why: One throwing subscriber must not stop the rest from being notified. How: This swallows the error and moves on to the next subscriber.


		}


	};



	// #region subAddFun

	/**
	 * subAddFun = Subscribe Add Function
	 *
	 * @summary
	 * Registers a callback to hear about every change the module reports
	 * through notSubFun. A callback that throws is swallowed there, so one
	 * broken listener never stops the others.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param newSubFun - New Subscriber Function: The callback to call, with
	 *                    no arguments, after each change.
	 *
	 * @returns A cleanup function that unsubscribes newSubFun again.
	 *
	 * @example
	 * ```ts
	 * subAddFun(newSubFun) // => unsubscribe function
	 * ```
	 *
	*/

	const subAddFun = ( newSubFun : () => void ) : ( () => void ) => { // What: Subscribe Add Function. Why: A caller needs to learn about the module's changes without polling. How: This adds newSubFun to subFunSet and returns its own unsubscribe function.


		subFunSet.add( newSubFun ); // What: New Subscriber Add Call. Why: The freshly-added callback must actually be tracked so notSubFun can reach it later. How: This adds newSubFun to subFunSet.



		return () => { subFunSet.delete( newSubFun ); }; // What: Unsubscribe Return. Why: The caller needs a way to stop receiving notifications later. How: This returns a closure that removes newSubFun from subFunSet when called.


	};

	// #endregion subAddFun



	return { notSubFun, subAddFun }; // What: Subscriber Pair Return. Why: The module keeps both functions working on this one set. How: This returns notSubFun and subAddFun under their own names, so a caller destructures them as they are.


}

// #endregion subMakFun

// #endregion Helpers



// #region Exports

export { subMakFun }; // What: Named Export. Why: A module needs its own subscriber list without repeating this code. How: This exports the factory by name.

// #endregion Exports


