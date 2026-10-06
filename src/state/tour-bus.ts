


// #region Imports

import React from 'react'; // What: React. Why: This is the UI library the hook exported from this module is built on. How: This is used directly (React.useState, React.useEffect) inside useEmlTouFun below, instead of importing individual named hooks.


import type { IteRcdTyp } from '../core/data-model.ts'; // What: Item Record Type. Why: A sample picker prefill carries its items. How: This types PreFilTyp's items.
import type { PicRcdTyp } from '../core/data-model.ts'; // What: Picker Record Type. Why: A prefill can carry any picker field. How: This is part of PreFilTyp.
import type { TasRcdTyp } from '../core/data-model.ts'; // What: Task Record Type. Why: A prefill can carry any reminder field. How: This is part of PreFilTyp.

// #endregion Imports



/**
 * tour-bus.ts = Tour Bus
 *
 * @summary
 * This is a tiny observable bus letting the onboarding tour(s) and the
 * tabs react to each other without a context provider. For example, a
 * tab anchoring a tour target needs to know the live phase/step even
 * when its own normal render gate is off, or Today needs to push its
 * list down by resTopNum while a tall highlight is up.
 *
 * This is kept in its own module, not onboarding/welcome-tour.tsx, so the
 * guided-tour engine (onboarding/tour-runner.tsx) and whatever authors an
 * individual tour's step content (onboarding/welcome-tour.tsx, future
 * mini-tour modules) can both import it without a circular dependency
 * between them.
 *
 * Sections:
 *  - Types
 *  - Module State
 *  - Hooks
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Types

type PreFilTyp = Partial< PicRcdTyp & TasRcdTyp > & { items? : Partial< IteRcdTyp >[], step? : number }; // What: Prefill Type. Why: A tour can prefill the real create form with a sample picker or reminder. How: This allows any picker or reminder field, plus a sample picker's items and the form step to open on.



type TouBusTyp = { // What: Tour Bus Type. Why: The tours, the tour runner, and the tabs coordinate through one shared state. How: This describes it, every field optional since each is written by whichever module needs it.


	draActBoo? : boolean;                                                         // What: Draft Active Boolean. Why: A tour waits while a draft editor is open. How: This is true while one is.
	draRepStr? : string | null;                                                   // What: Draft Repeat String. Why: A reminder tour reads the draft's repeat kind. How: This holds it, or null while no draft is open.
	exiIdeStr? : string | null;                                                   // What: Existing Identifier String. Why: A replayed tour reuses what it made before. How: This holds that record's id, or null once a tour clears it.
	iteMaxNum? : number | null;                                                   // What: Item Max Number. Why: A tour can stage an added item's ease band. How: This holds its easeMax, or null once a tour clears it.
	iteMinNum? : number | null;                                                   // What: Item Min Number. Why: A tour can stage an added item's ease band. How: This holds its easeMin, or null once a tour clears it.
	itePreStr? : string | null;                                                   // What: Item Prefill String. Why: A tour can stage an added item's name. How: This holds it, or null once a tour clears it.
	preFilObj? : PreFilTyp | null;                                                // What: Prefill Object. Why: A tour prefills the real create form. How: This holds the prefill, or null once consumed.
	redNonNum? : number;                                                          // What: Redo Nonce Number. Why: Going back in a tour asks the Pickers tab for a fresh pick. How: Each change of this number is one request.
	reoNonNum? : number;                                                          // What: Reopen Nonce Number. Why: Going back in a tour can reopen a form. How: Each change of this number is one request.
	resNonNum? : number;                                                          // What: Reset Nonce Number. Why: A tour can ask a page to reset to its starting state. How: Each change of this number is one request.
	resTopNum? : number;                                                          // What: Reserve Top Number. Why: Today pushes its list down while a tall highlight is up. How: This is the space to reserve, in pixels.
	samIdeStr? : string | null;                                                   // What: Sample Identifier String. Why: A tour names the sample it's working with. How: This holds its id, or null once a tour clears it.
	shoCheBoo? : boolean;                                                         // What: Show Checklist Boolean. Why: A tour can ask Today to show the setup checklist. How: This is true while it should.
	staCreObj? : { focusName? : boolean, name? : string, step? : number } | null; // What: Start Create Object. Why: Today can ask the Pickers tab to open its create form. How: This holds the request, or null once consumed.
	touIdeStr? : string;                                                          // What: Tour Identifier String. Why: Gates check which tour is running. How: This is its id.
	touPhaStr? : string;                                                          // What: Tour Phase String. Why: Modules check whether any tour is running. How: This is 'tour' while one is and 'off' otherwise.
	touSteNum? : number;                                                          // What: Tour Step Number. Why: Gates check the running tour's step. How: This is its index.
	wanRaiBoo? : boolean;                                                         // What: Want Rail Boolean. Why: A tour can ask for the side rail to be open. How: This is true while it should.


};

// #endregion Types



// #region Module State

let curBusObj : TouBusTyp = { preFilObj : null, staCreObj : null }; // What: Current Bus Object. Why: This is the bus's own live state, read by every get() call and replayed to every subscriber on every set() call. How: This starts with the same two fields the rest of the app already reads (preFilObj, staCreObj), reassigned wholesale by set() below rather than mutated in place.

const subCalSet = new Set< ( busSnaObj : TouBusTyp ) => void >(); // What: Subscriber Callback Set. Why: Every mounted useEmlTouFun instance needs to be notified when curBusObj changes. How: This collects every currently-subscribed callback, added by subscribe() and removed by the cleanup function it returns.



const emlTouObj = { // What: Ease-My-Life Tour Object. Why: This is the bus's own whole public API, the single shared object every consuming module reads and writes through. How: This exposes get/set/subscribe, each closing over the module-private curBusObj/subCalSet declared above.


	get : () => curBusObj, // What: Get. Why: A caller needs to read the bus's current state synchronously, without waiting on a subscription. How: This returns curBusObj directly.

	set : ( patDatObj : TouBusTyp ) => { // What: Set. Why: A caller needs to merge new fields into the bus's state and notify every subscriber of the change. How: This replaces curBusObj with a shallow merge of itself and patDatObj, then calls every subscribed callback with the freshly-merged value.


		curBusObj = { ...curBusObj, ...patDatObj }; // What: Current Bus Object Update. Why: The merged fields need to actually become the bus's own new live state before anyone is notified of them. How: This spreads the previous curBusObj followed by patDatObj, so patDatObj's own fields win on conflict.

		subCalSet.forEach( ( subCalFun ) => subCalFun( curBusObj ) ); // What: Subscriber Notify Loop. Why: Every subscribed callback must see the freshly-merged state, not the value from before this call. How: This calls each callback currently in subCalSet with the just-updated curBusObj.


	},

	subscribe : ( subCalFun : ( busSnaObj : TouBusTyp ) => void ) => { // What: Subscribe. Why: A caller (normally useEmlTouFun below) needs to be notified on every future set() call, and be able to stop listening again later. How: This adds subCalFun to subCalSet and returns a matching cleanup function.


		subCalSet.add( subCalFun ); // What: Subscriber Callback Add. Why: The callback must actually be registered before it can receive any future notification. How: This adds subCalFun to the shared subCalSet.



		return () => { subCalSet.delete( subCalFun ); }; // What: Cleanup Function Return. Why: The caller needs a way to stop listening again, typically on its own unmount. How: This returns a closure that removes the same subCalFun from subCalSet.


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
 * @see {@link busSnaObj}
 *
 * @example
 * ```ts
 * useEmlTouFun() // => current tour bus state object
 * ```
 *
*/

function useEmlTouFun () : TouBusTyp {


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


