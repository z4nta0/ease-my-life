


// #region Imports

import React from 'react'; // What: React. Why: This is the UI library the hook exported from this module is built on. How: This is used directly (React.useState, React.useEffect) inside useEmlTouFun below, instead of importing individual named hooks.

// #endregion Imports



/**
 * tour-bus.js = Tour Bus
 *
 * @summary
 * This is a tiny observable bus letting the onboarding tour(s) and the
 * tabs react to each other without a context provider. For example, a
 * tab anchoring a tour target needs to know the live phase/step even
 * when its own normal render gate is off, or Today needs to push its
 * list down by reserveTop while a tall highlight is up.
 *
 * This is kept in its own module, not onboarding/welcome-tour.jsx, so the
 * guided-tour engine (onboarding/tour-runner.jsx) and whatever authors an
 * individual tour's step content (onboarding/welcome-tour.jsx, future
 * mini-tour modules) can both import it without a circular dependency
 * between them.
 *
 * Sections:
 *  - Module State
 *  - Hooks
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Module State

let curBusObj = { preFilObj : null, staCreObj : null }; // What: Current Bus Object. Why: This is the bus's own live state, read by every get() call and replayed to every subscriber on every set() call. How: This starts with the same two fields the rest of the app already reads (preFilObj, staCreObj), reassigned wholesale by set() below rather than mutated in place.

const subCalSet = new Set(); // What: Subscriber Callback Set. Why: Every mounted useEmlTouFun instance needs to be notified when curBusObj changes. How: This collects every currently-subscribed callback, added by subscribe() and removed by the cleanup function it returns.



const emlTouObj = { // What: Ease-My-Life Tour Object. Why: This is the bus's own whole public API, the single shared object every consuming module reads and writes through. How: This exposes get/set/subscribe, each closing over the module-private curBusObj/subCalSet declared above.


	get : () => curBusObj, // What: Get. Why: A caller needs to read the bus's current state synchronously, without waiting on a subscription. How: This returns curBusObj directly.

	set : ( patDatObj ) => { // What: Set. Why: A caller needs to merge new fields into the bus's state and notify every subscriber of the change. How: This replaces curBusObj with a shallow merge of itself and patDatObj, then calls every subscribed callback with the freshly-merged value.


		curBusObj = { ...curBusObj, ...patDatObj }; // What: Current Bus Object Update. Why: The merged fields need to actually become the bus's own new live state before anyone is notified of them. How: This spreads the previous curBusObj followed by patDatObj, so patDatObj's own fields win on conflict.

		subCalSet.forEach( ( subCalFun ) => subCalFun( curBusObj ) ); // What: Subscriber Notify Loop. Why: Every subscribed callback must see the freshly-merged state, not the value from before this call. How: This calls each callback currently in subCalSet with the just-updated curBusObj.


	},

	subscribe : ( subCalFun ) => { // What: Subscribe. Why: A caller (normally useEmlTouFun below) needs to be notified on every future set() call, and be able to stop listening again later. How: This adds subCalFun to subCalSet and returns a matching cleanup function.


		subCalSet.add( subCalFun ); // What: Subscriber Callback Add. Why: The callback must actually be registered before it can receive any future notification. How: This adds subCalFun to the shared subCalSet.



		return () => subCalSet.delete( subCalFun ); // What: Cleanup Function Return. Why: The caller needs a way to stop listening again, typically on its own unmount. How: This returns a closure that removes the same subCalFun from subCalSet.


	}


};

// #endregion Module State



// #region Hooks

// #region useEmlTouFun

/**
 * useEmlTouFun = Use Ease-My-Life Tour Function
 *
 * @summary
 * Subscribes the calling component to the shared tour bus (emlTouObj)
 * for its own lifetime, re-rendering it with the bus's own latest value
 * on every set() call fired anywhere else in the app.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns The bus's own current state, kept in sync via subscription
 * for as long as the calling component stays mounted.
 *
 * @example
 * ```ts
 * useEmlTouFun() // => current tour bus state object
 * ```
 *
*/

function useEmlTouFun () {


	const [ busSnaObj, setBusSnaObj ] = React.useState( emlTouObj.get() ); // What: Bus Snapshot Object And Setter. Why: The calling component needs its own React state that re-renders it whenever the shared bus changes. How: This seeds itself from emlTouObj's own current value on this first render.


	React.useEffect( () => { // What: Subscribe Effect. Why: This component must be notified of every future set() call for as long as it stays mounted. How: This re-reads the bus once (covering a set() that fired between render and subscription), then subscribes setBusSnaObj and returns the matching cleanup.


		setBusSnaObj( emlTouObj.get() ); // What: Bus Snapshot Catch-Up. Why: A set() call landing between this component's own render and this effect's subscription would otherwise be missed entirely. How: This re-reads the bus's current value directly, same as the initializer above.



		return emlTouObj.subscribe( setBusSnaObj ); // What: Subscribe Return. Why: This effect's own cleanup must unsubscribe when the calling component unmounts. How: This returns the unsubscribe function emlTouObj.subscribe hands back.


	}, [] ); // What: Effect Dependency Array. Why: This subscription should be established exactly once per mount, never re-run. How: An empty array means there is no dependency that could ever change to trigger a re-run.



	return busSnaObj; // What: Bus Snapshot Object Return. Why: The caller needs the component's own always-current bus value. How: This returns the same state the effect above keeps synced.


}

// #endregion useEmlTouFun

// #endregion Hooks



// #region Exports

export { emlTouObj, useEmlTouFun }; // What: Named Exports. Why: The onboarding tours, the tour runner and the tabs all share this one bus, reading it through the hook or writing it through the object. How: This exports both bindings by name in one statement at the very end of the file.

// #endregion Exports


