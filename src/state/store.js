


// #region Imports

import React from 'react'; // What: React. Why: This is the UI library the whole store hook is built on. How: This is used directly (React.useState, React.useMemo, React.useEffect, React.useRef, React.useCallback) instead of importing individual named hooks.


import { buiIteFun   } from './new-item.js';             // What: Build Item Function. Why: addIteFun builds its new item with the same defaults the Data tab's new-item draft uses. How: This is called once per added item.
import { CAD_NAM_OBJ } from '../core/cadence.js';        // What: Cadence. Why: Every picker's own daily/weekly/monthly/yearly surfacing schedule is computed by this module. How: This is called (enfWeeFun/norCadFun) from the picker-authoring actions below.
import { cdlAplFun   } from './pending-mutations.js';    // What: Conditional Log Apply Function. Why: A day-off card's completion is recorded in the conditional log. How: This is called by togDonFun for a day-off entry.
import { CON_NAM_OBJ } from '../core/conditionals.js';   // What: Conditionals. Why: Day-off gate resolution logic lives here, not in this file. How: This is called (resDayFun) from resConFun below.
import { cotAplFun   } from './pending-mutations.js';    // What: Conditional Toggle Apply Function. Why: Checking off a day-off card advances or reverts its conditional. How: This is called by togDonFun for a day-off entry.
import { enpAplFun   } from './pending-mutations.js';    // What: Entry Pending Apply Function. Why: A pick's staged consequences land only when its entry is marked done. How: This is called when an entry is checked off.
import { enpRevFun   } from './pending-mutations.js';    // What: Entry Pending Revert Function. Why: Unchecking a done entry must restore exactly what completing it changed. How: This is called when an entry is unchecked.
import { HOL_NAM_OBJ } from '../core/holidays.js';       // What: Holidays Namespace Object. Why: The holiday-editing actions need the canonical empty holidays shape. How: This is called (defStaFun) from the holiday actions below.
import { invColFun   } from '../utils/color.js';         // What: Invert Color Function. Why: A custom theme's other half is derived from whichever color the user edited. How: This is called in setCusFun with the edited hex color.
import { isoDayFun   } from '../utils/date.js';          // What: Iso Day Function. Why: Dates are stored and compared as local-calendar YYYY-MM-DD keys. How: This formats a Date (or now) as that key.
import { logRowFun   } from './pick-log.js';             // What: Log Row Function. Why: Every pick that lands on Today appends one pick-log row. How: This is called with the state and the pick's own fields.
import { migStaFun   } from './migrate.js';              // What: Migrate State Function. Why: Every loaded or imported state must be brought up to the current shape. How: This is called on load and on import.
import { modDefFun   } from './new-item.js';             // What: Mode Defaults Function. Why: savEdiFun resets a picker's items to its new type's defaults the same way the Data tab's draft picker does. How: This is called with the new mode and threshold.
import { newEidFun   } from './ids.js';                  // What: New Entry-Id Function. Why: Migrated entries and new Today entries both need unique ids. How: This is called once per entry that needs one.
import { norConFun   } from '../core/pickers.js';        // What: Normalize Conditional Function. Why: A newly-authored inline conditional's own name needs the same tidy Title-Case treatment as a picker's. How: This is called from addPicFun and savEdiFun below.
import { norGroFun   } from '../core/pickers.js';        // What: Normalize Group Function. Why: A picker's own group label needs tidying/de-duplication in several places. How: This is called from renGroFun/renTouFun and the picker-authoring actions below.
import { norPicFun   } from '../core/pickers.js';        // What: Normalize Picker Function. Why: A picker's own display name needs tidying wherever one is created or renamed. How: This is called from addPicFun, savEdiFun, and renPicFun below.
import { ONB_CHE_OBJ } from './onboarding-checklist.js'; // What: Onboarding Checklist Object. Why: Resolving a checklist item can flip the closing Generate card's own readiness. How: This is called (reaGenFun) from setCarFun below.
import { ONB_SPI_ARR } from './onboarding-seed-data.js'; // What: Onboarding Sample-Picker-Ids Array. Why: A sample picker being (re)seeded must skip the normal name de-duplication so its canonical name stays intact. How: This is checked against inside addPicFun below.
import { PWA_NAM_OBJ } from '../platform/pwa.js';        // What: Progressive Web App Namespace Object. Why: The very first picker a user creates is the first data worth protecting from storage eviction. How: This is called (askFirFun) once, from inside addPicFun below.
import { SED_NAM_OBJ } from './seed.js';                 // What: Seed Namespace Object. Why: A brand-new install, and a hard reset, both need this fresh empty-state shape rather than the design-time demo fixture. How: This is called (buiCleFun) by loaStaFun and by the reset action below.
import { spuDroFun   } from './pending-mutations.js';    // What: Stale Pending Updates Drop Function. Why: A direct item edit must not be overwritten by a sibling entry's stale pending row. How: This is called by the direct item-edit actions.
import { STG_NAM_OBJ } from './storage.js';              // What: Storage Namespace Object. Why: This is the actual persistence engine this file's own load/save/flush wrappers delegate to. How: This is called from loaStaFun, wriStaFun, fluStaFun, and the reset/impDatFun actions below.
import { TAS_NAM_OBJ } from '../core/tasks.js';          // What: Tasks Namespace Object. Why: The reminders engine's own scheduling/eligibility/normalization logic lives here, not in this file. How: This is called throughout stkSynFun and the task actions below.
import { uniNamFun   } from '../utils/format.js';        // What: Unique Name Function. Why: Two entries in the same scope can't share a name the user can't tell apart. How: This is called whenever an item, reminder, or picker is added or renamed.

// #endregion Imports



/**
 * store.js = Store And Persisted-State Layer
 *
 * @summary
 * The entire app state layer: one useState holding the whole app state
 * object, plus a useMemo'd object of state-transition functions (the
 * "actions"). Deliberately framework-light so every tab can call the
 * exact same helpers. Persistence is a separate concern delegated to
 * storage.js; this file only decides WHEN to save (debounced via
 * requestIdleCallback, flushed synchronously on pagehide/tab-hide), and
 * runs every loaded state through migrate.js's own migStaFun.
 *
 * A key invariant lives here: picking/re-rolling/sending an item to Today
 * stages its value/weight consequences as entry.pending rather than applying
 * them immediately; they only take effect once the entry is marked done
 * (pending-mutations.js's own enpAplFun/enpRevFun), and unchecking a done
 * entry must exactly revert via entry.revert. Every action below that touches
 * an entry's own done/pending/revert fields must preserve this staging.
 *
 * Sections:
 *  - Constants
 *  - Helpers
 *  - Hooks
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const STO_KEY_STR = 'easemylife.v2'; // What: Storage Key String. Why: The localStorage fallback/mirror needs a fixed key to read/write under. How: This is read by loaStaFun, wriStaFun, and fluStaFun below.

// #endregion Constants



// #region Helpers

// #region fluStaFun

/**
 * fluStaFun = Flush State Function
 *
 * @summary
 * The teardown path (pagehide / tab-hide): an in-flight async IDB write
 * may not survive the page going away, so this also mirrors
 * synchronously to localStorage as a last-resort safety net.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curStaObj - Current State Object: The state to flush synchronously.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * fluStaFun(state) // => undefined
 * ```
 *
*/

function fluStaFun( curStaObj ) {


	try { // What: Flush Attempt. Why: A storage failure during teardown must never throw while the page is going away. How: This delegates to STG_NAM_OBJ.fluSynFun when available, else falls back to a raw localStorage write.


		if ( STG_NAM_OBJ ) return STG_NAM_OBJ.fluSynFun( curStaObj ); // What: Storage Delegate Return. Why: STG_NAM_OBJ's own fluSynFun is the real synchronous-write path. How: This returns STG_NAM_OBJ.fluSynFun(curStaObj) as soon as STG_NAM_OBJ exists.



		localStorage.setItem( STO_KEY_STR, JSON.stringify( curStaObj ) ); // What: Localstorage Fallback Write. Why: This only runs when STG_NAM_OBJ itself failed to load at all. How: This writes curStaObj's own JSON string under STO_KEY_STR.


	}

	catch ( errCatObj ) {} // What: Flush Failure Guard. Why: A write failure must never propagate up while the page is unloading. How: This swallows the error silently.


}

// #endregion fluStaFun



// #region loaStaFun

/**
 * loaStaFun = Load State Function
 *
 * @summary
 * Synchronous by design: STG_NAM_OBJ.iniStoFun() has already resolved before
 * React mounts (see the boot gate in the HTML shell), so the loaded
 * state is sitting in memory and no component had to become async. The
 * localStorage read is kept as a fallback for the case where storage.js
 * failed to load at all. A brand-new user (nothing stored anywhere)
 * starts from SED_NAM_OBJ.buiCleFun() and is met by onboarding.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns The migrated state to boot React with.
 *
 * @example
 * ```ts
 * loaStaFun() // => state
 * ```
 *
*/

function loaStaFun() {


	try { // What: Cached-State Attempt. Why: STG_NAM_OBJ's own warm cache is the fastest, most authoritative source when it's available. How: This returns migStaFun() of STG_NAM_OBJ's own cached state, when there is one.


		const cacStaObj = STG_NAM_OBJ && STG_NAM_OBJ.cacStaFun(); // What: Cached State Object And Guard. Why: STG_NAM_OBJ may not exist at all, or may have nothing cached yet. How: This reads STG_NAM_OBJ.cacStaFun(), short-circuiting to undefined when STG_NAM_OBJ itself is falsy.


		if ( cacStaObj ) return migStaFun( cacStaObj ); // What: Cached-Hit Return. Why: A cached state is the normal, fast path and needs no further fallback. How: This returns migStaFun(cacStaObj) as soon as one exists.


	}

	catch ( errCatObj ) { /* fall through */ } // What: Cached-State Failure Guard. Why: A broken STG_NAM_OBJ module must not prevent booting from the localStorage fallback below. How: This swallows the error and falls through.



	try { // What: Localstorage Fallback Attempt. Why: This is the last-resort source when STG_NAM_OBJ itself failed to load at all. How: This returns migStaFun() of the parsed localStorage value, when there is one.


		const rawJsoStr = localStorage.getItem( STO_KEY_STR ); // What: Raw Json String And Guard. Why: There may be nothing stored under this key yet. How: This reads STO_KEY_STR from localStorage, null when absent.


		if ( rawJsoStr ) return migStaFun( JSON.parse( rawJsoStr ) ); // What: Localstorage-Hit Return. Why: A parsed localStorage value is the fallback path's own normal case. How: This returns migStaFun() of the JSON-parsed rawJsoStr as soon as one exists.


	}

	catch ( errCatObj ) { /* fall through */ } // What: Localstorage Failure Guard. Why: Malformed or inaccessible localStorage must not crash boot. How: This swallows the error and falls through to the clean-state return below.



	return migStaFun( SED_NAM_OBJ.buiCleFun() ); // What: Clean-State Return. Why: Nothing was stored anywhere, so a brand-new user starts empty and is met by onboarding. How: This returns migStaFun() of a fresh SED_NAM_OBJ.buiCleFun().


}

// #endregion loaStaFun



// #region wriStaFun

/**
 * wriStaFun = Write State Function
 *
 * @summary
 * Persists curStaObj through STG_NAM_OBJ when it's available (the real,
 * debounced/idle-safe persistence engine), falling back to a plain
 * synchronous localStorage.setItem only when STG_NAM_OBJ itself is absent.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curStaObj - Current State Object: The state to persist.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * wriStaFun(state) // => undefined
 * ```
 *
*/

function wriStaFun( curStaObj ) {


	try { // What: Persist Attempt. Why: A storage failure (quota, disabled storage, ...) must never crash the caller. How: This delegates to STG_NAM_OBJ.savStaFun when available, else falls back to a raw localStorage write.


		if ( STG_NAM_OBJ ) return STG_NAM_OBJ.savStaFun( curStaObj ); // What: Storage Delegate Return. Why: STG_NAM_OBJ is the real, debounced/idle-safe persistence engine and should always be preferred. How: This returns STG_NAM_OBJ.savStaFun(curStaObj) as soon as STG_NAM_OBJ exists.



		localStorage.setItem( STO_KEY_STR, JSON.stringify( curStaObj ) ); // What: Localstorage Fallback Write. Why: This only runs when STG_NAM_OBJ itself failed to load at all. How: This writes curStaObj's own JSON string under STO_KEY_STR.


	}

	catch ( errCatObj ) {} // What: Persist Failure Guard. Why: A write failure must never propagate up to the caller. How: This swallows the error silently.


}

// #endregion wriStaFun



// #region stkSynFun

/**
 * stkSynFun = Streak Sync Function
 *
 * @summary
 * Decides whether "today" counts toward the streak: it counts if ANY
 * picker entry is done OR any streak-participating manual reminder was
 * completed today, but only once EVERYTHING currently on Today is
 * actually done (a day with nothing to do can't claim a streak).
 * Reconciles that verdict against whether the day was already claimed,
 * so toggling the last done item back off un-claims it, and a day is
 * never double-counted. Entries belonging to a hidden picker (see the
 * hidden flag backfilled in migStaFun above) don't count toward, or
 * block, the streak, same as if that picker didn't exist. Reminders
 * are checked against the last generation's own anchor date (not live
 * "now"), so this must always agree with whatever RemSecCom is
 * actually showing right now.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curStaObj - Current State Object: The current state, read (not
 *                    mutated) for its own
 *                    pickers/today/reminderOpts/holidays/streak.
 * @param entArgArr - Entry Argument Array: The today.entries to reconcile
 *                    against (may already reflect an in-progress toggle).
 * @param tasArgArr - Task Argument Array: The tasks to reconcile against.
 *
 * @returns { stkClaBoo, stkValNum } reflecting the reconciled verdict.
 *
 * @example
 * ```ts
 * stkSynFun(state, entries, tasks) // => { stkClaBoo, stkValNum }
 * ```
 *
*/

function stkSynFun( curStaObj, entArgArr, tasArgArr ) {


	const hidPicSet = new Set( ( curStaObj.pickers || [] ).filter( ( curPicObj ) => curPicObj.hidden ).map( ( curPicObj ) => curPicObj.id ) ); // What: Hidden Picker Set. Why: The visible-entries filter below needs fast membership checks against every hidden picker's own id. How: This collects the id of every picker whose own hidden flag is true.
	const visEntArr = ( entArgArr || [] ).filter( ( curEntObj ) => !curEntObj.pickerId || !hidPicSet.has( curEntObj.pickerId ) );              // What: Visible Entry Array. Why: An entry belonging to a hidden picker must not count toward, or block, the streak. How: This keeps every entry with no pickerId at all, or whose pickerId isn't in hidPicSet.

	const curAncObj = TAS_NAM_OBJ.ancDatFun( curStaObj.today && curStaObj.today.generatedAt );                                // What: Current Anchor Object. Why: Reminder eligibility below must be pinned to the last generation's own day, matching whatever RemSecCom is actually showing right now. How: This calls TAS_NAM_OBJ.ancDatFun with today's own generatedAt.
	const visTasArr = TAS_NAM_OBJ.visTodFun( tasArgArr, curStaObj.reminderOpts, curStaObj.holidays, curAncObj );              // What: Visible Task Array. Why: Only a reminder actually shown today can participate in the streak at all. How: This calls TAS_NAM_OBJ.visTodFun with curAncObj as the anchor.
	const stkTasArr = visTasArr.filter( ( curTasObj ) => TAS_NAM_OBJ.optForFun( curTasObj, curStaObj.reminderOpts ).streak ); // What: Streak Task Array. Why: Only a reminder whose own type has the streak switch on actually counts. How: This filters visTasArr to those TAS_NAM_OBJ.optForFun reports streak:true for.

	const hasAnyBoo = visEntArr.length > 0 || stkTasArr.length > 0;                                      // What: Has Any Boolean. Why: A day with nothing eligible on it at all can't claim a streak either way. How: This is true when either visEntArr or stkTasArr is non-empty.
	const entDonBoo = visEntArr.every( ( curEntObj ) => curEntObj.done );                                // What: Entries Done Boolean. Why: The streak requires every visible entry to be done, not just some. How: This is true only when every entry in visEntArr is done.
	const tasDonBoo = stkTasArr.every( ( curTasObj ) => TAS_NAM_OBJ.isaDonFun( curTasObj, curAncObj ) ); // What: Tasks Done Boolean. Why: The streak requires every streak-counting reminder to be done today too. How: This is true only when every task in stkTasArr is done as of curAncObj.

	const nowDonBoo = hasAnyBoo && entDonBoo && tasDonBoo; // What: Now Done Boolean. Why: The final streak verdict needs all 3 conditions to hold at once. How: This combines hasAnyBoo/entDonBoo/tasDonBoo with &&.


	const wasClaBoo = !!curStaObj.today.streakClaimed; // What: Was Claimed Boolean. Why: The reconciliation below needs to compare the new verdict against the PRIOR claimed state. How: This coerces curStaObj.today.streakClaimed to a real boolean.

	let stkValNum = curStaObj.streak; // What: Streak Value Number. Why: The 2 branches below may adjust this starting from curStaObj's own current streak. How: This starts at curStaObj.streak and is reassigned by whichever branch below actually fires.
	let stkClaBoo = wasClaBoo;        // What: Streak Claimed Boolean. Why: The 2 branches below may flip this starting from the prior claimed state. How: This starts at wasClaBoo and is reassigned by whichever branch below actually fires.


	if ( nowDonBoo && !wasClaBoo ) { // What: Claim Branch. Why: The day just became fully done and wasn't already claimed, so it banks a new streak point. How: This increments stkValNum and flips stkClaBoo true.


		stkValNum = stkValNum + 1; // What: Streak Value Increment. Why: A newly-claimed day banks a new streak point. How: This increments stkValNum by 1.
		stkClaBoo = true;          // What: Streak Claimed Flip. Why: Today's own claimed state must reflect this new claim. How: This sets stkClaBoo true.


	}

	else if ( !nowDonBoo && wasClaBoo ) { // What: Unclaim Branch. Why: The day is no longer fully done but was previously claimed (e.g. an item got un-checked), so its point must be given back. How: This decrements stkValNum (floored at 0) and flips stkClaBoo false.


		stkValNum = Math.max( 0, stkValNum - 1 ); // What: Streak Value Decrement. Why: A day that lost its claim must give back the streak point it previously banked, floored at 0. How: This decrements stkValNum by 1, never below 0.
		stkClaBoo = false;                        // What: Streak Claimed Flip. Why: Today's own claimed state must reflect this lost claim. How: This sets stkClaBoo false.


	}



	return { stkClaBoo, stkValNum }; // What: Reconciled Streak Return. Why: The caller needs both the adjusted streak count and its own new claimed state. How: This bundles stkValNum/stkClaBoo together.


}

// #endregion stkSynFun

// #endregion Helpers



// #region Hooks

// #region useAppStaFun

/**
 * useAppStaFun = Use App State Function
 *
 * @summary
 * The entire app state layer. Holds one useState for the whole app
 * state object, seeded either from optArgObj.initial (the onboarding
 * demo's own non-persisted state) or from loaStaFun()'s own migrated
 * result. Persistence is a synchronous localStorage.setItem(JSON.
 * stringify(state)) underneath, and the state itself carries a long
 * pick log, so writing on every setState blocked the main thread (it
 * janked the Regenerate loader whenever a store update fired mid-
 * animation). The write is instead scheduled during idle time and
 * coalesced across rapid updates, then flushed synchronously on hide/
 * unload/unmount so nothing is ever lost. Returns [state, actions],
 * where actions is a useMemo'd object of state-transition functions;
 * every key of that object, and every top-level field of state itself,
 * is a real contract every tab reads by name and must never be renamed.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param optArgObj - Option Argument Object: Optional. { initial, persist }:
 *                    initial supplies a non-persisted starting state (used by
 *                    the onboarding demo) instead of loaStaFun(); persist:
 *                    false (used by the same demo) disables the idle-
 *                    save/flush effects entirely. Omitted entirely for every
 *                    normal, real-data caller.
 *
 * @returns [state, actions]: the current app state, and the memoized
 * object of state-transition functions that mutate it.
 *
 * @example
 * ```ts
 * useAppStaFun() // => [state, actions]
 * ```
 *
*/

function useAppStaFun( optArgObj ) {


	const [ appStaObj, setAppStaObj ] = React.useState( () => ( optArgObj && optArgObj.initial ? migStaFun( optArgObj.initial ) : loaStaFun() ) ); // What: App State Object And Setter. Why: This one useState is the entire app's own persisted state. How: This lazily seeds from optArgObj.initial when given, else from loaStaFun()'s own migrated result.

	const perActBoo = !( optArgObj && optArgObj.persist === false ); // What: Persist Active Boolean. Why: The onboarding demo needs to opt entirely out of the idle-save/flush effects below. How: This is false only when optArgObj.persist is explicitly false.


	const latStaRef = React.useRef( appStaObj ); // What: Latest State Reference And Guard. Why: The idle-save/flush effects below need the CURRENT state even when they fire outside a fresh render (e.g. from a pagehide handler). How: This starts pointing at appStaObj and is kept in sync on every render below.

	latStaRef.current = appStaObj; // What: Latest State Reference Sync. Why: Every render must re-point latStaRef at whatever appStaObj currently is. How: This assigns appStaObj onto latStaRef.current directly in the render body.


	const idlTimRef = React.useRef( null ); // What: Idle Timeout Reference And Guard. Why: The debounced save effect below needs to remember its own pending idle-callback/timeout handle so a later update can cancel it. How: This starts at null and is set/cleared by canPenFun and the save effect below.

	const canPenFun = React.useCallback( () => { // What: Cancel Pending Function. Why: Both the debounced save effect and the flush effect need to cancel any still-pending idle-callback/timeout before scheduling or flushing again. How: This cancels whatever idlTimRef currently holds and clears the ref.


		if ( idlTimRef.current == null ) return; // What: Nothing-Pending Guard. Why: There's nothing to cancel when no idle callback/timeout is currently scheduled. How: This returns immediately when idlTimRef.current is null/undefined.



		( window.cancelIdleCallback || clearTimeout )( idlTimRef.current ); // What: Pending Cancel Call. Why: Whichever scheduling primitive was actually used to schedule it is the one that can cancel it. How: This calls cancelIdleCallback when available, else clearTimeout, passing idlTimRef's own current handle.

		idlTimRef.current = null; // What: Reference Clear. Why: A cancelled handle must not be mistaken for a still-pending one later. How: This resets idlTimRef.current back to null.


	}, [] ); // What: Callback Dependency Array. Why: This callback closes over only the stable idlTimRef, so it never needs to be recreated. How: An empty array means canPenFun is created once and reused for the lifetime of this component.


	React.useEffect( () => { // What: Debounced Save Effect. Why: Every app-state change must eventually be persisted, but not synchronously on the hot path of every single update. How: This cancels any previously-scheduled save, then schedules a fresh one during idle time (or a 200ms timeout fallback), capped at a 2s max wait.


		if ( !perActBoo ) return; // What: Persist-Disabled Guard. Why: The onboarding demo explicitly opts out of ever persisting at all. How: This returns immediately when perActBoo is false.



		canPenFun(); // What: Prior Schedule Cancel. Why: A save already queued for the previous state must not also fire and overwrite this newer one out of order. How: This calls canPenFun to cancel whatever idlTimRef currently holds.


		const schIdlFun = window.requestIdleCallback || ( ( schCalFun ) => setTimeout( schCalFun, 200 ) ); // What: Schedule Idle Function. Why: Not every browser supports requestIdleCallback, so a plain 200ms timeout is the fallback scheduler. How: This picks requestIdleCallback when available, else wraps setTimeout at a fixed 200ms delay.

		idlTimRef.current = schIdlFun( () => { // What: Idle Save Schedule. Why: The scheduled callback must clear its own handle before saving, and save whatever the LATEST state is by the time it actually runs. How: This calls schIdlFun with a callback that clears idlTimRef.current then calls wriStaFun(latStaRef.current), capped by a 2000ms max wait.


			idlTimRef.current = null; // What: Idle Timeout Reference Clear. Why: This scheduled run is about to fire, so its own handle must no longer be treated as pending. How: This clears idlTimRef.current back to null.

			wriStaFun( latStaRef.current ); // What: Write State Call. Why: The save must use whatever the LATEST state is by the time this callback actually runs, not whatever it was when scheduled. How: This calls wriStaFun with latStaRef's own current value.


		}, { timeout : 2000 } ); // What: Idle Callback Options. Why: A save must still happen soon even on a page that never goes idle. How: This caps the idle wait at 2 seconds.


	}, [ appStaObj, perActBoo ] ); // What: Effect Dependency Array. Why: This effect must re-run whenever a change to one of these values could need a fresh save scheduled. How: appStaObj changing means there's new state to eventually persist, and perActBoo changing means persistence itself was just turned on or off.


	React.useEffect( () => { // What: Flush-On-Hide Effect. Why: An async IDB write scheduled by the debounced effect above may not survive the page actually going away, so a synchronous flush must run on pagehide, tab-hide, and unmount. How: This wires pagehide/visibilitychange listeners that flush, and returns a cleanup that flushes once more.


		if ( !perActBoo ) return; // What: Persist-Disabled Guard. Why: The onboarding demo explicitly opts out of ever persisting at all. How: This returns immediately when perActBoo is false.



		const runFluFun = () => { // What: Run Flush Function. Why: A synchronous flush must first cancel any still-pending idle save so the 2 writes don't race each other. How: This calls canPenFun then fluStaFun(latStaRef.current).


			canPenFun(); // What: Prior Schedule Cancel. Why: A save already queued via the debounced effect above must not also fire and race this synchronous flush. How: This calls canPenFun to cancel whatever idlTimRef currently holds.

			fluStaFun( latStaRef.current ); // What: Flush State Call. Why: The flush must use whatever the LATEST state is, not whatever it was when this handler was registered. How: This calls fluStaFun with latStaRef's own current value.


		};


		const onVisChaFun = () => { if ( document.visibilityState === 'hidden' ) runFluFun(); }; // What: On Visibility Change Function. Why: A tab being hidden (not just closed) is another moment a pending save could otherwise be lost. How: This calls runFluFun only when the document's own visibilityState just became 'hidden'.


		window.addEventListener( 'pagehide', runFluFun );             // What: Pagehide Listener Attach. Why: The page actually going away is the primary moment this flush must catch. How: This wires runFluFun to the window's own 'pagehide' event.
		document.addEventListener( 'visibilitychange', onVisChaFun ); // What: Visibilitychange Listener Attach. Why: A tab merely being hidden (not unloaded) is the secondary moment this flush must catch. How: This wires onVisChaFun to the document's own 'visibilitychange' event.



		return () => { // What: Cleanup Return. Why: This effect's own listeners must be removed, and one final flush run, whenever perActBoo changes or the component unmounts. How: This flushes once more, then removes both listeners.


			runFluFun(); // What: Unmount Flush. Why: An unmount is itself a moment a pending save could otherwise be lost. How: This calls runFluFun one final time.

			window.removeEventListener( 'pagehide', runFluFun );             // What: Pagehide Listener Detach. Why: A stale listener must not linger past this effect's own lifetime. How: This removes runFluFun from the window's own 'pagehide' event.
			document.removeEventListener( 'visibilitychange', onVisChaFun ); // What: Visibilitychange Listener Detach. Why: A stale listener must not linger past this effect's own lifetime. How: This removes onVisChaFun from the document's own 'visibilitychange' event.


		};


	}, [ perActBoo ] ); // What: Effect Dependency Array. Why: This effect must re-run only when perActBoo itself changes, since that's the only thing that could turn persistence on or off. How: perActBoo changing means the listeners themselves need re-wiring (or tearing down) under the new persistence setting.


	const actStoObj = React.useMemo( () => ( { // What: Action Store Object. Why: This is the entire mutation surface of the app's own state: a tab reads/calls these exact keys by name, so every key here is a real, load-bearing external contract. How: This builds a memoized object of state-transition functions, computed once (empty dependency array below).


		// #region App Data

		// #region impDatFun

		/**
		 * impDatFun = Import Data Function
		 *
		 * @summary
		 * Replaces the whole store from an imported JSON blob (Settings
		 * tab's Data control's own Import). Runs through migStaFun() so an
		 * older/partial export gets the same backfills a fresh load would.
		 * An imported backup's own pickLog is authoritative even when
		 * empty: it replaces ALL data, so stale local history must not
		 * survive it.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param impRawObj - Import Raw Object: The parsed JSON blob from the
		 *                    imported backup file.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * impDatFun(impRawObj) // => void
		 * ```
		 *
		*/

		impDatFun : ( impRawObj ) => { // What: Import Data Function. Why: This is called with the parsed JSON blob a user just imported. How: This marks the next save authoritative (so an empty imported pickLog isn't treated as "nothing to save yet"), then replaces state wholesale via migStaFun().


			try { if ( STG_NAM_OBJ ) STG_NAM_OBJ.logAutFun(); } // What: Authoritative-Write Marker Try. Why: STG_NAM_OBJ must treat the very next save as authoritative, not incremental, so an intentionally-empty imported log actually overwrites the old one. How: This calls STG_NAM_OBJ.logAutFun() when STG_NAM_OBJ exists.

			catch ( errCatObj ) {} // What: Authoritative-Write Marker Guard. Why: A throwing logAutFun call must not abort the state replace below. How: This silently ignores any error from the call above.



			setAppStaObj( migStaFun( impRawObj ) ); // What: State Replace. Why: The imported blob becomes the entire new state, once migrated to the current shape. How: This calls setAppStaObj with migStaFun(impRawObj).


		},

		// #endregion impDatFun



		// #region wipAppFun

		/**
		 * wipAppFun = Wipe App Function
		 *
		 * @summary
		 * Wipes persisted storage, then hard-RELOADS rather than setState-
		 * ing a clean state in place and stopping there: a plain in-memory
		 * reset left stale module-level singletons behind (state/tour-bus.js's
		 * bus, etc.), which is what made onboarding misbehave after "Reset
		 * all data". wipe() is async (an IDB clear); awaiting it before
		 * reloading matters here specifically, unlike a fire-and-forget
		 * call, since a reload can tear down the page mid-transaction,
		 * something setState() never could guard against.
		 *
		 * latStaRef.current is updated (not just setAppStaObj) before
		 * reloading, even though nothing will ever render it: window.
		 * location.reload() fires a pagehide event, and this file's own
		 * flush effect above synchronously re-persists whatever
		 * latStaRef.current holds at that moment. Without this, that flush
		 * would silently re-save the STALE pre-wipe state right back into
		 * the storage this action just cleared, undoing the wipe before
		 * the reload even finishes loading; setAppStaObj() alone isn't
		 * enough since React's own re-render (which is what actually
		 * updates latStaRef.current, via this file's own render-phase
		 * `latStaRef.current = appStaObj` line above) isn't guaranteed to
		 * have committed yet by the time reload() below fires.
		 *
		 * The URL hash is cleared too: app.jsx's own initial active-tab
		 * read consults location.hash for its #settings deep link, and a
		 * reload alone would otherwise land right back on Settings for
		 * anyone who'd arrived that way, the same "onboarding anchors only
		 * exist on Today" problem the Settings button's own onNavTab
		 * ('today') call exists to avoid.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param void - This function takes no parameters.
		 *
		 * @returns A promise that settles once every store has been cleared.
		 *
		 * @example
		 * ```ts
		 * wipAppFun() // => Promise
		 * ```
		 *
		*/

		wipAppFun : async () => { // What: Wipe App Function. Why: This is the "Delete all data" action, and it must fully clear storage AND reload before anything (including this file's own flush effect) can re-persist stale state. How: See the design-rationale comment directly above.


			try { // What: Wipe Attempt. Why: A storage failure here must not prevent the clean reload below from still happening. How: This awaits STG_NAM_OBJ.wipDatFun() then STG_NAM_OBJ.logAutFun(), only when STG_NAM_OBJ itself exists.


				if ( STG_NAM_OBJ ) { // What: Storage Wipe And Log. Why: Both the actual IDB/localStorage clear and the authoritative-write marker must happen before anything else below runs. How: This awaits STG_NAM_OBJ.wipDatFun(), then calls STG_NAM_OBJ.logAutFun().


					await STG_NAM_OBJ.wipDatFun(); // What: Storage Wipe Call. Why: The actual IDB/localStorage clear must happen before anything else below runs. How: This awaits STG_NAM_OBJ.wipDatFun().


					STG_NAM_OBJ.logAutFun(); // What: Authoritative-Write Marker Call. Why: The very next save after this wipe must be treated as authoritative, not incremental. How: This calls STG_NAM_OBJ.logAutFun().


				}


			}

			catch ( errCatObj ) {} // What: Wipe Failure Guard. Why: A wipe failure must never prevent the reload below from still happening. How: This swallows the error silently.



			const cleStaObj = migStaFun( SED_NAM_OBJ.buiCleFun() ); // What: Clean State Object. Why: The freshly-reloaded app needs a real, migrated empty state ready in latStaRef before reload() fires. How: This builds a fresh SED_NAM_OBJ.buiCleFun() and runs it through migStaFun().

			latStaRef.current = cleStaObj; // What: Latest State Reference Update. Why: The flush effect's own pagehide handler must see this clean state, not the stale pre-wipe one, per the design-rationale comment above. How: This assigns cleStaObj directly onto latStaRef.current.

			setAppStaObj( cleStaObj ); // What: App State Set. Why: React itself should also reflect the clean state, even though the reload below discards this render anyway. How: This calls setAppStaObj with cleStaObj.



			try { window.location.hash = ''; } // What: Hash Clear Try. Why: A stale #settings deep link must not survive the reload, per the design-rationale comment above. How: This clears location.hash before the reload below.

			catch ( errCatObj ) {} // What: Hash Clear Guard. Why: A throwing location.hash write must not abort the reload below. How: This silently ignores any error from the clear above.



			window.location.reload(); // What: Hard Reload. Why: Only a real reload clears stale module-level singletons left behind by an in-memory-only reset. How: This calls window.location.reload().


		},

		// #endregion wipAppFun

		// #endregion App Data



		// #region Appearance Settings

		// #region renCusFun

		/**
		 * renCusFun = Rename Custom Function
		 *
		 * @summary
		 * Renames a custom theme slot without touching its own colors or
		 * activating it (renaming while just browsing shouldn't force-
		 * switch the live theme). Mirrors the color auto-derive above:
		 * renaming one slot also renames its own counterpart, UNLESS the
		 * counterpart's own name has since been edited directly (tracked
		 * separately from the color derived flag, since a user might
		 * customize one without touching the other).
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param theModStr - Theme Mode String: 'light' or 'dark', picking the
		 *                    custom
		 *                    slot to rename.
		 * @param newNamStr - New Name String: The name typed for that slot.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * renCusFun('dark', newNamStr) // => void
		 * ```
		 *
		*/

		renCusFun : ( theModStr, newNamStr ) => setAppStaObj( ( curStaObj ) => { // What: Rename Custom Function. Why: A custom theme slot needs its own editable display name without switching the live theme. How: This renames theModStr's own slot and its counterpart too, unless the counterpart's name was edited directly.


			const keyNamStr = theModStr === 'dark' ? 'customDark' : 'customLight'; // What: Key Name String. Why: The rename below is written under whichever slot this exact mode owns. How: This picks 'customDark' or 'customLight' from theModStr.
			const couKeyStr = theModStr === 'dark' ? 'customLight' : 'customDark'; // What: Counter Key String. Why: The auto-derive step below writes onto the OPPOSITE slot from keyNamStr. How: This picks the opposite of keyNamStr.

			const sedDefObj = theModStr === 'dark' // What: Seed Defaults Object. Why: The counterpart fallback below needs plausible starting colors when it has no slot of its own yet at all. How: This picks the light-mode defaults when theModStr is 'dark' (since the counterpart would be light), else the dark-mode defaults.
				? { accent : '#3360a8', bg : '#fcfbf9', text : '#242629' }  // What: Light Seed Branch. Why: A light slot starts from light colors. How: This is the default light palette.
				: { accent : '#7da4ff', bg : '#1e2230', text : '#f2f3f6' }; // What: Dark Seed Branch. Why: A dark slot starts from dark colors. How: This is the default dark palette.

			const curColObj = ( curStaObj.appearance || {} )[ keyNamStr ] || ( theModStr === 'dark' // What: Current Colors Object. Why: The rename below must preserve this slot's own existing colors, falling back to plausible defaults when it has none yet. How: This reads curStaObj's own appearance[keyNamStr], else a dark/light default shape matching mode.
				? { accent : '#7da4ff', bg : '#1e2230', text : '#f2f3f6' }    // What: Dark Default Branch. Why: A dark slot with no colors of its own falls back to dark colors. How: This is the default dark palette.
				: { accent : '#3360a8', bg : '#fcfbf9', text : '#242629' } ); // What: Light Default Branch. Why: A light slot with no colors of its own falls back to light colors. How: This is the default light palette.

			const nexAppObj = { // What: Next Appearance Object. Why: This slot's own colors are kept, but its name is now explicitly set (nameDerived:false, since a direct rename is never itself derived). How: This spreads curStaObj's own appearance, writing the renamed slot under keyNamStr.


				...( curStaObj.appearance || {} ), // What: Current Appearance Spread. Why: Every other appearance setting must carry over unchanged. How: This spreads curStaObj.appearance, defaulting to {} for state that predates it.

				[ keyNamStr ] : { ...curColObj, name : newNamStr, nameDerived : false } // What: Renamed Slot. Why: This slot keeps its own colors but takes the new name, flagged as set directly. How: This spreads curColObj, writing newNamStr as name and nameDerived:false.


			};

			const couSloObj = nexAppObj[ couKeyStr ]; // What: Counter Slot Object And Guard. Why: The auto-rename check below needs to know whether the counterpart's own name was already set directly. How: This reads nexAppObj's own counterpart slot.


			if ( !couSloObj || couSloObj.nameDerived !== false ) { // What: Auto-Rename Guard. Why: Only a counterpart whose own name is missing, or ITSELF still auto-derived, should be renamed along with this one. How: This rewrites nexAppObj's own counterpart slot only when this condition holds.


				nexAppObj[ couKeyStr ] = { // What: Counterpart Slot Rename. Why: The counterpart needs the same name, flagged as auto-derived rather than a direct user choice. How: This spreads the prior counterpart slot (or sedDefObj) with name/nameDerived overridden.


					...( couSloObj || sedDefObj ), // What: Prior Counterpart Spread. Why: The counterpart keeps its own colors, or starts from plausible defaults when it has no slot yet. How: This spreads couSloObj, falling back to sedDefObj.

					name        : newNamStr, // What: Name. Why: The counterpart takes the same name as the slot just renamed. How: This is newNamStr.
					nameDerived : true       // What: Name Derived. Why: This name was copied automatically, so a later direct rename of this counterpart may still replace it. How: This is true.


				};


			}



			return { ...curStaObj, appearance : nexAppObj }; // What: Next State Return. Why: The caller needs appearance replaced on a fresh state. How: This spreads curStaObj with appearance replaced by nexAppObj.


		} ),

		// #endregion renCusFun



		setAniFun : ( picAniStr ) => setAppStaObj( ( curStaObj ) => ( { // What: Set Animation Function. Why: This picks the Today tab's own pick-reveal animation style ('reel' | 'spotlight' | 'dissolve'). How: This writes pickAnim (from picAniStr) onto appearance.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the appearance override below.

			appearance : { // What: Appearance. Why: Only one appearance setting changes, every other one must survive. How: This rebuilds appearance from its own current settings plus the one override below.


				...( curStaObj.appearance || {} ), // What: Current Appearance Spread. Why: Every other appearance setting must carry over unchanged. How: This spreads curStaObj.appearance, defaulting to {} for state that predates it.

				pickAnim : picAniStr // What: Pick Animation. Why: This is the Today tab's own pick-reveal animation style. How: This is picAniStr.


			}


		} ) ),



		setCelFun : ( celStyStr ) => setAppStaObj( ( curStaObj ) => ( { // What: Set Celebration Function. Why: This picks the Today tab's own ring-fill completion-celebration style ('ripple' | 'confetti' | 'sparkle'). How: This writes completionStyle (from celStyStr) onto appearance.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the appearance override below.

			appearance : { // What: Appearance. Why: Only one appearance setting changes, every other one must survive. How: This rebuilds appearance from its own current settings plus the one override below.


				...( curStaObj.appearance || {} ), // What: Current Appearance Spread. Why: Every other appearance setting must carry over unchanged. How: This spreads curStaObj.appearance, defaulting to {} for state that predates it.

				completionStyle : celStyStr // What: Completion Style. Why: This is the Today tab's own ring-fill celebration style. How: This is celStyStr.


			}


		} ) ),



		// #region setCusFun

		/**
		 * setCusFun = Set Custom Function
		 *
		 * @summary
		 * Saves the 3 user-picked colors (bg/text/accent) for the light or
		 * dark custom slot, and immediately makes it the active theme.
		 * Also auto-generates/updates the OTHER mode's own custom slot as
		 * an inverted counterpart (same hue, flipped lightness), so
		 * creating one custom palette gives you both for free. That auto-
		 * fill stops the moment the user edits the counterpart directly
		 * (its own derived flag flips to false), so a real manual edit is
		 * never clobbered.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param theModStr - Theme Mode String: 'light' or 'dark', picking the
		 *                    custom
		 *                    slot to save.
		 * @param cusColObj - Custom Color Object: The picked colors to save into
		 *                    that
		 *                    slot.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * setCusFun('light', cusColObj) // => void
		 * ```
		 *
		*/

		setCusFun : ( theModStr, cusColObj ) => setAppStaObj( ( curStaObj ) => { // What: Set Custom Function. Why: Appearance's own custom color pickers need to save a palette and make it live immediately. How: This writes the 3 colors to theModStr's own custom slot, activates it, and auto-derives the other mode's counterpart unless that one was edited directly.


			const keyNamStr = theModStr === 'dark' ? 'customDark' : 'customLight'; // What: Key Name String. Why: Every field below is written under whichever slot this exact mode owns. How: This picks 'customDark' or 'customLight' from theModStr.
			const couKeyStr = theModStr === 'dark' ? 'customLight' : 'customDark'; // What: Counter Key String. Why: The auto-derive step below writes onto the OPPOSITE slot from keyNamStr. How: This picks the opposite of keyNamStr.

			const savColObj = { ...cusColObj, derived : false }; // What: Saved Colors Object. Why: A directly-saved slot is by definition NOT auto-derived from its own counterpart. How: This spreads cusColObj with derived explicitly set false.

			const nexAppObj = { // What: Next Appearance Object. Why: The caller needs this slot saved and immediately activated as the live theme. How: This spreads curStaObj's own appearance, writing savColObj under keyNamStr and setting theme to keyNamStr.


				...( curStaObj.appearance || {} ), // What: Current Appearance Spread. Why: Every other appearance setting must carry over unchanged. How: This spreads curStaObj.appearance, defaulting to {} for state that predates it.

				[ keyNamStr ] : savColObj, // What: Saved Slot. Why: The chosen custom slot must hold the colors just picked. How: This writes savColObj under keyNamStr.

				theme : keyNamStr // What: Theme. Why: A saved custom palette becomes the live theme immediately. How: This sets theme to keyNamStr.


			};

			const couSloObj = nexAppObj[ couKeyStr ]; // What: Counter Slot Object And Guard. Why: The auto-derive check below needs to know whether the counterpart slot already has a real, manually-derived value. How: This reads nexAppObj's own counterpart slot.


			if ( !couSloObj || couSloObj.derived !== false ) { // What: Auto-Derive Guard. Why: Only a counterpart that's missing, or ITSELF still auto-derived, should be overwritten; a real manual edit (derived:false) must never be clobbered. How: This rewrites nexAppObj's own counterpart slot only when this condition holds.


				nexAppObj[ couKeyStr ] = { // What: Counterpart Slot Write. Why: The counterpart needs its own bg/text/accent inverted from the slot that was just saved, keeping any existing name. How: This spreads the prior counterpart slot (or {}), overriding bg/text/accent via invColFun on cusColObj and flagging derived:true.


					...( couSloObj || {} ), // What: Existing Name Keep Spread. Why: A counterpart slot's own name (if it had one) shouldn't be lost just because its colors are being re-derived. How: This spreads couSloObj (or {}) first, so bg/text/accent/derived below still win.

					accent  : invColFun( cusColObj.accent ), // What: Accent. Why: The counterpart gets the inverted accent color. How: This calls invColFun on cusColObj.accent.
					bg      : invColFun( cusColObj.bg ),     // What: Background. Why: The counterpart gets the inverted background color. How: This calls invColFun on cusColObj.bg.
					derived : true,                          // What: Derived. Why: This slot was auto-generated, so a later save of its own counterpart may overwrite it again. How: This is true.
					text    : invColFun( cusColObj.text )    // What: Text. Why: The counterpart gets the inverted text color. How: This calls invColFun on cusColObj.text.


				};


			}



			return { ...curStaObj, appearance : nexAppObj }; // What: Next State Return. Why: The caller needs appearance replaced on a fresh state. How: This spreads curStaObj with appearance replaced by nexAppObj.


		} ),

		// #endregion setCusFun



		setPlaFun : ( tabPlaStr ) => setAppStaObj( ( curStaObj ) => ( { // What: Set Placement Function. Why: This picks the tab bar's own placement ('bottom' | 'side' | 'top') from Appearance's own Layout control. How: This writes tabPlacement (from tabPlaStr) onto appearance.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the appearance override below.

			appearance : { // What: Appearance. Why: Only one appearance setting changes, every other one must survive. How: This rebuilds appearance from its own current settings plus the one override below.


				...( curStaObj.appearance || {} ), // What: Current Appearance Spread. Why: Every other appearance setting must carry over unchanged. How: This spreads curStaObj.appearance, defaulting to {} for state that predates it.

				tabPlacement : tabPlaStr // What: Tab Placement. Why: This is where the tab bar sits. How: This is tabPlaStr.


			}


		} ) ),



		setSysFun : ( autSysBoo ) => setAppStaObj( ( curStaObj ) => ( { // What: Set System Function. Why: "System preference" (Appearance) makes the app auto-swap between the current theme and its own light/dark counterpart to match the OS's own prefers-color-scheme, rather than always applying whichever was picked. How: This writes autoSystem (from autSysBoo) onto appearance.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the appearance override below.

			appearance : { // What: Appearance. Why: Only one appearance setting changes, every other one must survive. How: This rebuilds appearance from its own current settings plus the one override below.


				...( curStaObj.appearance || {} ), // What: Current Appearance Spread. Why: Every other appearance setting must carry over unchanged. How: This spreads curStaObj.appearance, defaulting to {} for state that predates it.

				autoSystem : autSysBoo // What: Auto System. Why: This decides whether the app follows the OS's own light/dark preference. How: This is autSysBoo.


			}


		} ) ),



		setTheFun : ( theKeyStr ) => setAppStaObj( ( curStaObj ) => ( { // What: Set Theme Function. Why: This picks a built-in theme by key ('ink' | 'sage' | 'sand' | 'night' | 'moss' | 'ember'), or 'customLight'/'customDark' once the matching custom colors have been set via setCusFun. How: This writes theme (from theKeyStr) onto appearance.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the appearance override below.

			appearance : { // What: Appearance. Why: Only one appearance setting changes, every other one must survive. How: This rebuilds appearance from its own current settings plus the one override below.


				...( curStaObj.appearance || {} ), // What: Current Appearance Spread. Why: Every other appearance setting must carry over unchanged. How: This spreads curStaObj.appearance, defaulting to {} for state that predates it.

				theme : theKeyStr // What: Theme. Why: This is the active built-in or custom theme's own key. How: This is theKeyStr.


			}


		} ) ),

		// #endregion Appearance Settings



		// #region Conditionals

		// #region addConFun

		/**
		 * addConFun = Add Conditional Function
		 *
		 * @summary
		 * Creates a brand-new conditional (a day-off gate) from the Data tab's own
		 * authoring form and prepends it onto the conditionals list. Every field
		 * the form leaves out gets its default, so a caller only needs to pass
		 * what the user actually set.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param conArgObj - Conditional Argument Object: The authoring form's
		 *                    fields; any field left out gets its default.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * addConFun(conArgObj) // => void
		 * ```
		 *
		*/

		addConFun : ( conArgObj ) => setAppStaObj( ( curStaObj ) => ( { // What: Add Conditional Function. Why: This creates a brand-new conditional (a day-off gate) from the Data tab's own authoring form. How: This builds a full conditional object from conArgObj's own fields (defaulting every field not given) and prepends it onto conditionals.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the conditionals override below.

			conditionals : [ // What: Conditionals. Why: The new conditional must appear at the top of the list, ahead of every existing one. How: This builds a fresh array with the new conditional first, then every existing one.


				{ // What: New Conditional Object. Why: This is the brand-new conditional itself, with every field conArgObj didn't supply filled with its default. How: This builds each field from conArgObj or its own default.


					active       : conArgObj.active !== undefined ? conArgObj.active : true,                                     // What: Active. Why: A new conditional is enabled unless the form says otherwise. How: This honors conArgObj.active when given, else defaults to true. // What: Active/Triggered Defaults. Why: active means enabled (not inactive); triggered means currently firing, defaulting true only for ease-down (which starts "charged"). How: This honors an explicit value when given, else applies each field's own default.
					cardText     : conArgObj.cardText || 'Day off',                                                              // What: Card Text. Why: The day-off card shown on Today needs its own display text. How: This reads conArgObj.cardText, defaulting to 'Day off'.
					chargedToday : false,                                                                                        // What: Charged Today. Why: A brand-new conditional hasn't charged yet today, so its per-day charge guard starts clear. How: This is false.
					easeMax      : conArgObj.easeMax ?? 14,                                                                      // What: Ease Max. Why: An ease-mode conditional needs the upper end of its own drift band. How: This reads conArgObj.easeMax, defaulting to 14.
					easeMin      : conArgObj.easeMin ?? 7,                                                                       // What: Ease Min. Why: An ease-mode conditional needs the lower end of its own drift band. How: This reads conArgObj.easeMin, defaulting to 7.
					id           : conArgObj.id || ( 'cnd_' + Math.random().toString( 36 ).slice( 2, 8 ) ),                      // What: Id. Why: Every conditional needs a stable id pickers can link to. How: This uses conArgObj.id when given, else mints a random 'cnd_' id.
					mode         : conArgObj.mode || 'ease-up',                                                                  // What: Mode. Why: The mode decides how this conditional rolls or charges each day. How: This reads conArgObj.mode, defaulting to 'ease-up'.
					name         : conArgObj.name || 'Conditional',                                                              // What: Name. Why: The conditional needs a display name across the Data tab and its own day-off card. How: This reads conArgObj.name, defaulting to 'Conditional'.
					oddsPct      : conArgObj.oddsPct ?? 50,                                                                      // What: Odds Percent. Why: A probability-mode conditional needs its own daily firing odds. How: This reads conArgObj.oddsPct, defaulting to 50.
					threshold    : conArgObj.threshold ?? 100,                                                                   // What: Threshold. Why: An ease-mode conditional charges toward (or decays from) this value. How: This reads conArgObj.threshold, defaulting to 100.
					triggered    : conArgObj.triggered !== undefined ? conArgObj.triggered : ( conArgObj.mode === 'ease-down' ), // What: Triggered. Why: A new conditional starts firing only when it's ease-down, which starts charged. How: This honors conArgObj.triggered when given, else defaults to whether mode is 'ease-down'. // What: Active/Triggered Defaults. Why: active means enabled (not inactive); triggered means currently firing, defaulting true only for ease-down (which starts "charged"). How: This honors an explicit value when given, else applies each field's own default.
					value        : conArgObj.mode === 'ease-down' ? ( conArgObj.threshold ?? 100 ) : 0,                          // What: Value. Why: Ease Down starts fully charged at its threshold while every other mode starts empty. How: This is the threshold (default 100) for ease-down, else 0.
					weight       : conArgObj.weight ?? 1                                                                         // What: Weight. Why: A weighted conditional needs its own draw weight. How: This reads conArgObj.weight, defaulting to 1.


				},

				...( curStaObj.conditionals || [] ) // What: Existing Conditionals Spread. Why: Every existing conditional must survive, after the new one. How: This spreads curStaObj.conditionals, defaulting to [].


			]


		} ) ),

		// #endregion addConFun



		// #region delConFun

		/**
		 * delConFun = Delete Conditional Function
		 *
		 * @summary
		 * Deletes a conditional and detaches it from every picker it gated, by
		 * nulling each such picker's own conditionalId, so nothing is left
		 * pointing at an id that no longer exists.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param conIdeStr - Conditional Identifier String: The conditional to
		 *                    delete.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * delConFun(conIdeStr) // => void
		 * ```
		 *
		*/

		delConFun : ( conIdeStr ) => setAppStaObj( ( curStaObj ) => ( { // What: Delete Conditional Function. Why: Deleting a conditional must also detach it from every picker that was gated by it, so nothing references a now-gone id. How: This filters the conditional out, and nulls conditionalId on every picker that pointed at it.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			conditionals : ( curStaObj.conditionals || [] ).filter( ( curConObj ) => curConObj.id !== conIdeStr ),                                              // What: Conditionals. Why: The deleted conditional must actually be gone from state. How: This filters out the one whose own id matches conIdeStr.
			pickers      : curStaObj.pickers.map( ( curPicObj ) => curPicObj.conditionalId === conIdeStr ? { ...curPicObj, conditionalId : null } : curPicObj ) // What: Pickers. Why: No picker may keep pointing at a conditional that no longer exists. How: This nulls conditionalId on every picker that pointed at conIdeStr.


		} ) ),

		// #endregion delConFun



		// #region resConFun

		/**
		 * resConFun = Resolve Conditionals Function
		 *
		 * @summary
		 * Phase A of Generate. It rolls the probability and dynamic modes, carries
		 * the persisted active flag for the ease modes, and clears each
		 * conditional's per-day charge guard. Unlike most actions it also returns
		 * the resolved array directly, so the generator can gate pickers off the
		 * fresh values in the same pass instead of waiting for React state.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param void - This function takes no parameters.
		 *
		 * @returns The conditionals resolved for this Generate pass.
		 * @see {@link resConArr}
		 *
		 * @example
		 * ```ts
		 * resConFun() // => resolved conditionals array
		 * ```
		 *
		*/

		resConFun : () => { // What: Resolve Conditionals Function. Why: Phase A of Generate: rolls probability/dynamic modes and carries persisted active for ease modes, clearing the per-day charge guard, so the generator can gate pickers off fresh values in the same pass. How: This calls CON_NAM_OBJ.resDayFun, applies its own per-conditional patch, and returns the resolved array directly (not just via setAppStaObj).


			let resConArr = null; // What: Resolved Conditionals Array. Why: The caller needs the resolved array back directly, not only via the next render's own state. How: This starts null and is captured inside the setAppStaObj updater below.


			setAppStaObj( ( curStaObj ) => { // What: State Update Call. Why: The per-day patches must be computed from, and merged into, the latest state rather than a stale closure copy. How: This runs an updater that resolves every conditional's own patch, captures the result in resConArr, and returns the patched state.


				const patIdeObj = CON_NAM_OBJ.resDayFun( curStaObj.conditionals || [] );                                                       // What: Patch Identifier Object. Why: CON_NAM_OBJ itself decides each conditional's own per-day patch (or none). How: This calls CON_NAM_OBJ.resDayFun with curStaObj's own conditionals.
				const nexConArr = ( curStaObj.conditionals || [] ).map( ( curConObj ) => ( { ...curConObj, ...patIdeObj[ curConObj.id ] } ) ); // What: Next Conditionals Array. Why: Every conditional gets its own matching patch (if any) merged on. How: This maps every conditional, spreading in patIdeObj's own entry for its id.

				resConArr = nexConArr; // What: Resolved Array Capture. Why: The outer resConArr must be set from inside this updater, the only place nexConArr actually exists. How: This assigns nexConArr onto the closed-over resConArr.



				return { ...curStaObj, conditionals : nexConArr }; // What: Next State Return. Why: The caller needs conditionals replaced on a fresh state. How: This spreads curStaObj with conditionals replaced by nexConArr.


			} );



			return resConArr; // What: Resolved Conditionals Return. Why: The generator needs the resolved array synchronously, not just via the next render. How: This returns resConArr, captured above.


		},

		// #endregion resConFun



		updConFun : ( conIdeStr, patValObj ) => setAppStaObj( ( curStaObj ) => ( { // What: Update Conditional Function. Why: Callers need to patch one existing conditional's own fields in place, without touching any other. How: This merges patValObj onto the one conditional whose own id matches conIdeStr.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			conditionals : ( curStaObj.conditionals || [] ).map( ( curConObj ) => curConObj.id === conIdeStr ? { ...curConObj, ...patValObj } : curConObj ) // What: Conditionals. Why: Only the one matching conditional changes. How: This merges patValObj onto the conditional whose own id matches conIdeStr, leaving every other one as-is.


		} ) ),

		// #endregion Conditionals



		// #region Daily Generator

		daiModFun : ( daiModStr ) => setAppStaObj( ( curStaObj ) => ( { // What: Daily Mode Function. Why: This decides whether the Daily generator runs on its own each day, or only when the user triggers it ('auto' | 'manual'). How: This writes daiModStr as mode onto daily.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			daily : { ...curStaObj.daily, mode : daiModStr } // What: Daily. Why: Only the generator's own run mode changes. How: This spreads curStaObj.daily with mode replaced by daiModStr.


		} ) ),



		daiPicFun : ( picIdeArr ) => setAppStaObj( ( curStaObj ) => ( { // What: Daily Pickers Function. Why: This is the Daily generator's own picker membership list. How: This writes picIdeArr as pickerIds onto daily.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			daily : { ...curStaObj.daily, pickerIds : picIdeArr } // What: Daily. Why: Only the generator's own picker membership changes. How: This spreads curStaObj.daily with pickerIds replaced by picIdeArr.


		} ) ),



		daiTimFun : ( runTimStr ) => setAppStaObj( ( curStaObj ) => ( { // What: Daily Time Function. Why: This is the time of day (HH:MM, 24h) the Daily generator auto-runs. How: This writes runTimStr as runTime onto daily.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			daily : { ...curStaObj.daily, runTime : runTimStr } // What: Daily. Why: Only the generator's own auto-run time changes. How: This spreads curStaObj.daily with runTime replaced by runTimStr.


		} ) ),



		// #region marGenFun

		/**
		 * marGenFun = Mark Generated Function
		 *
		 * @summary
		 * Stamps the generation time and snapshots every item's and
		 * conditional's own value at that moment, so the Day Log can show "value
		 * at generation, then after". It is Today-only and overwritten by every
		 * Regenerate; because values are done-gated, the live values only drift
		 * from this snapshot once entries are completed.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param void - This function takes no parameters.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * marGenFun() // => void
		 * ```
		 *
		*/

		marGenFun : () => setAppStaObj( ( curStaObj ) => { // What: Mark Generated Function. Why: This stamps the generation time AND snapshots every item's/conditional's own value at that moment, so the Day Log can show "value at generation to after". Today-only: overwritten on each Regenerate; values are done-gated so the live values only diverge from this snapshot once entries are completed. How: This builds a genLog of {items, conds} keyed by id, alongside a fresh generatedAt.


			const iteValObj = {}; // What: Item Values Object. Why: The Day Log needs every item's own value AS OF right now, keyed by id. How: This starts empty and is filled by the loop below.


			( curStaObj.items || [] ).forEach( ( curIteObj ) => { iteValObj[ curIteObj.id ] = curIteObj.value; } ); // What: Item Value Fill. Why: Every item's own current value must be captured before anything changes it. How: This writes each item's value under its own id.


			const conValObj = {}; // What: Conditional Values Object. Why: The Day Log needs every conditional's own value/triggered state AS OF right now, keyed by id. How: This starts empty and is filled by the loop below.


			( curStaObj.conditionals || [] ).forEach( ( curConObj ) => { conValObj[ curConObj.id ] = { triggered : curConObj.triggered, value : curConObj.value }; } ); // What: Conditional Value Fill. Why: Every conditional's own current value and triggered flag must be captured before anything changes them. How: This writes a { value, triggered } pair under each conditional's own id.



			return { // What: Next State Return. Why: The caller needs a fresh generatedAt timestamp plus the snapshot genLog written onto today. How: This spreads curStaObj.today with generatedAt/genLog replaced.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				today : { // What: Today. Why: Only today's own generation stamp and snapshot change. How: This rebuilds today from its own current fields plus the two overrides below.


					...curStaObj.today, // What: Current Today Spread. Why: Every other today field (entries, streakClaimed, ...) must carry over unchanged. How: This spreads curStaObj.today before the overrides below.

					generatedAt : new Date().toISOString(),                // What: Generated At. Why: This marks exactly when today's list was generated. How: This stamps the current time as an ISO string.
					genLog      : { conds : conValObj, items : iteValObj } // What: Generation Log. Why: The Day Log compares these snapshot values against later ones. How: This bundles conValObj/iteValObj under the log's own conds/items keys.


				}


			};


		} ),

		// #endregion marGenFun

		// #endregion Daily Generator



		// #region Data Tab UI

		setSorFun : ( sorScoStr, sorKeyStr ) => setAppStaObj( ( curStaObj ) => ( { // What: Set Sort Function. Why: This is the Data tab's own persisted sort preference; sorScoStr is 'sections' (the top-level Conditionals/Reminders/picker card order) or a picker id/'conditionals'/'reminders' (that section's own item-list order). How: This writes sorKeyStr onto ui.dataSort[sorScoStr].


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			ui : { // What: UI. Why: Only the sort-preference map inside ui changes, every other ui field must survive. How: This rebuilds ui from its own current fields plus the updated map.


				...( curStaObj.ui || {} ), // What: Current UI Spread. Why: Every other ui field (controlsCollapsed, ...) must carry over unchanged. How: This spreads curStaObj.ui, defaulting to {} for state that predates it.

				dataSort : { // What: Data Sort. Why: Only this one scope's own sort key changes, every other scope's must survive. How: This rebuilds dataSort from its own current entries plus the one override below.


					...( ( curStaObj.ui && curStaObj.ui.dataSort ) || {} ), // What: Current Data-Sort Spread. Why: Every other scope's own saved sort key must carry over unchanged. How: This spreads curStaObj.ui.dataSort, defaulting to {}.

					[ sorScoStr ] : sorKeyStr // What: Scope Sort Key. Why: This scope's own sort preference must be saved. How: This writes sorKeyStr under sorScoStr's own key.


				}


			}


		} ) ),



		togColFun : ( secIdeStr, defColBoo = false ) => setAppStaObj( ( curStaObj ) => { // What: Toggle Collapsed Function. Why: Persisted collapse state for the Data tab's own disclosures, uniform polarity everywhere (true means COLLAPSED, false means expanded); the main sections default collapsed via defColBoo so the first click expands rather than re-collapsing. How: This flips ui.controlsCollapsed[secIdeStr], falling back to defColBoo when it has no value yet.


			const curColObj = ( curStaObj.ui && curStaObj.ui.controlsCollapsed ) || {};                  // What: Current Collapsed Object. Why: The flip below needs the live collapse-state map, or an empty fallback. How: This reads curStaObj's own ui.controlsCollapsed, defaulting to {}.
			const curValBoo = curColObj[ secIdeStr ] === undefined ? defColBoo : curColObj[ secIdeStr ]; // What: Current Value Boolean. Why: A section with no saved value yet starts from its own caller-supplied default, not always false. How: This reads curColObj's own secIdeStr entry, falling back to defColBoo when it's undefined.
			const nexColObj = { ...curColObj, [ secIdeStr ] : !curValBoo };                              // What: Next Collapsed Object. Why: The caller needs exactly this one section's own collapse state flipped. How: This spreads curColObj, negating secIdeStr's own entry.



			return { // What: Next State Return. Why: The caller needs controlsCollapsed replaced on a fresh ui object. How: This spreads curStaObj's own ui with controlsCollapsed replaced by nexColObj.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				ui : { // What: UI. Why: Only the collapse-state map inside ui changes, every other ui field must survive. How: This rebuilds ui from its own current fields plus the new map.


					...( curStaObj.ui || {} ), // What: Current UI Spread. Why: Every other ui field (dataSort, ...) must carry over unchanged. How: This spreads curStaObj.ui, defaulting to {} for state that predates it.

					controlsCollapsed : nexColObj // What: Controls Collapsed. Why: This is the Data tab's own per-section collapse-state map. How: This is nexColObj.


				}


			};


		} ),

		// #endregion Data Tab UI



		// #region Groups

		// #region renGroFun

		/**
		 * renGroFun = Rename Group Function
		 *
		 * @summary
		 * Renames a group everywhere: every member picker's own group, the
		 * groupOrder slot and the pickerOrder key. If the new name matches an
		 * existing group (case-insensitively), this becomes a merge that folds
		 * the 2 groups together, so the caller (Edit Mode) must confirm a merge
		 * before calling it.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param oldNamStr - Old Name String: The group's current name.
		 * @param rawNamStr - Raw Name String: The new name as typed, before
		 *                    normalizing.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * renGroFun(oldNamStr, rawNamStr) // => void
		 * ```
		 *
		*/

		renGroFun : ( oldNamStr, rawNamStr ) => setAppStaObj( ( curStaObj ) => { // What: Rename Group Function. Why: This renames a group everywhere: rewriting every member picker's own group, remapping the groupOrder slot + pickerOrder key. If the new name matches an existing group (case-insensitively, via the normalizer's own collision reuse) this becomes a MERGE, folding the 2 groups together; the caller (Edit Mode) confirms the merge before invoking. How: See the inline comments below for each step.


			const othGroArr = [ ...new Set( curStaObj.pickers.filter( ( curPicObj ) => curPicObj.group && curPicObj.group !== oldNamStr ).map( ( curPicObj ) => curPicObj.group ) ) ]; // What: Other Group Array. Why: The normalizer needs every OTHER existing group name to detect a same-name collision (a merge). How: This collects the distinct group of every picker not already in oldNamStr.
			const nexNamStr = ( norGroFun && norGroFun( rawNamStr, othGroArr ) ) || String( rawNamStr || '' ).trim();                                                                  // What: Next Name String. Why: The normalizer both tidies rawNamStr and reuses an existing collision's own exact casing. How: This calls norGroFun with othGroArr, else falls back to a plain trim.


			if ( !nexNamStr || nexNamStr === oldNamStr ) return curStaObj; // What: No-Op Guard. Why: An empty result, or a name that didn't actually change, has nothing to rename. How: This returns curStaObj unchanged when either holds.



			const nexPicArr = curStaObj.pickers.map( ( curPicObj ) => curPicObj.group === oldNamStr ? { ...curPicObj, group : nexNamStr } : curPicObj ); // What: Next Picker Array. Why: Every picker that belonged to oldNamStr must now belong to nexNamStr. How: This maps curStaObj.pickers, rewriting group on every matching picker.

			let nexOrdArr = ( curStaObj.groupOrder || [] ).map( ( curGroStr ) => curGroStr === oldNamStr ? nexNamStr : curGroStr ); // What: Next Order Array. Why: The display-order slot itself must follow the rename too. How: This maps groupOrder, replacing oldNamStr with nexNamStr.

			nexOrdArr = nexOrdArr.filter( ( curGroStr, curIndNum ) => nexOrdArr.indexOf( curGroStr ) === curIndNum ); // What: Merge De-Duplicate. Why: A MERGE (renaming onto an existing group) would otherwise leave 2 entries for the same name in groupOrder. How: This keeps only each group name's own first occurrence.

			const nexPodObj = { ...curStaObj.pickerOrder }; // What: Next Picker-Order Object. Why: The per-group row order must be remapped (and merged, on a collision) the same way groupOrder itself was above. How: This starts as a shallow copy of curStaObj.pickerOrder, patched below.


			if ( nexPodObj[ oldNamStr ] ) { // What: Old-Key Remap Guard. Why: Only a group that actually had its own saved row order needs remapping at all. How: This merges oldNamStr's own order into nexNamStr's own (deduped), then drops the old key entirely.


				const exiIdeArr = nexPodObj[ nexNamStr ] || []; // What: Existing Identifier Array. Why: A MERGE must append oldNamStr's own order onto whatever nexNamStr already had, not overwrite it. How: This reads nexPodObj's own current entry for nexNamStr, defaulting to empty.

				nexPodObj[ nexNamStr ] = exiIdeArr.concat( nexPodObj[ oldNamStr ].filter( ( curIdeStr ) => !exiIdeArr.includes( curIdeStr ) ) ); // What: Merged Order Write. Why: Every id from oldNamStr's own order must join nexNamStr's own, without duplicating one already present. How: This concatenates exiIdeArr with oldNamStr's own order filtered to non-duplicates.

				delete nexPodObj[ oldNamStr ]; // What: Old Key Drop. Why: oldNamStr no longer exists as a group, so its own pickerOrder key must be removed entirely. How: This deletes nexPodObj's own oldNamStr key.


			}



			return { ...curStaObj, groupOrder : nexOrdArr, pickerOrder : nexPodObj, pickers : nexPicArr }; // What: Next State Return. Why: Every affected field must land together on one fresh state. How: This spreads curStaObj with pickers/groupOrder/pickerOrder all replaced.


		} ),

		// #endregion renGroFun



		renTouFun : ( rawNamStr ) => setAppStaObj( ( curStaObj ) => { // What: Rename Tours Function. Why: Page Tours has no pickers to rewrite (unlike renGroFun), just a label swap; collision-with-an-existing-group blocking happens in the UI before this ever fires. How: This normalizes rawNamStr and writes it onto onboarding.pageToursName.


			const nexNamStr = ( norGroFun && norGroFun( rawNamStr ) ) || String( rawNamStr || '' ).trim(); // What: Next Name String. Why: The write below needs a tidied, real name. How: This calls norGroFun, else falls back to a plain trim.


			if ( !nexNamStr ) return curStaObj; // What: Empty-Name Guard. Why: An empty result has nothing meaningful to write. How: This returns curStaObj unchanged when nexNamStr is falsy.



			return { // What: Next State Return. Why: The caller needs pageToursName replaced on a fresh state. How: This spreads curStaObj's own onboarding with pageToursName replaced.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				onboarding : { // What: Onboarding Override. Why: Only the Page Tours group label changes, every other onboarding field must survive. How: This rebuilds onboarding from its own current fields plus the new label.


					...( curStaObj.onboarding || {} ), // What: Current Onboarding Spread. Why: Every other onboarding field must carry over unchanged. How: This spreads curStaObj.onboarding, defaulting to {} for state that predates it.

					pageToursName : nexNamStr // What: Page Tours Name. Why: This is the display label for the Page Tours group. How: This is nexNamStr.


				}


			};


		} ),

		// #endregion Groups



		// #region Holiday List Subsystem

		/**
		 * addHolFun = Add Holiday Function
		 *
		 * @summary
		 * The global "days off" the skip-holidays gate reads. togHolFun
		 * turns a computed holiday on/off (off means listed in disabled);
		 * addHolFun/delHolFun manage the user's own extra,
		 * hand-entered holidays alongside the computed ones.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param props.day   - Day: The holiday's day of the month.
		 * @param props.month - Month: The holiday's month, 1 through 12.
		 * @param props.name  - Name: The holiday's display name.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * addHolFun({ day, month, name }) // => void
		 * ```
		 *
		*/



		addHolFun : ( { day : dayValNum, month : monValNum, name : holNamStr } ) => setAppStaObj( ( curStaObj ) => { // What: Add Holiday Function. Why: A user's own hand-entered holiday needs its own fresh id before it can be appended. How: This appends a new row to holidays.custom.


			const curHolObj = curStaObj.holidays || HOL_NAM_OBJ.defStaFun(); // What: Current Holidays Object. Why: The append below needs a real holidays shape even for state that predates this field. How: This reads curStaObj's own holidays, falling back to HOL_NAM_OBJ's own default state.

			const newHolObj = { // What: New Holiday Object. Why: This is the actual custom-holiday row being added. How: This bundles a fresh id with holNamStr/monValNum/dayValNum.


				day   : dayValNum,                                         // What: Day. Why: The holiday recurs on this day of the month every year. How: This is dayValNum.
				id    : 'h_' + Math.random().toString( 36 ).slice( 2, 7 ), // What: Id. Why: A custom holiday must be removable by its own unique id. How: This mints a random 'h_' id.
				month : monValNum,                                         // What: Month. Why: The holiday recurs in this month every year. How: This is monValNum.
				name  : holNamStr                                          // What: Name. Why: The holiday list shows the user's own name for it. How: This is holNamStr.


			};



			return { // What: Next State Return. Why: The caller needs newHolObj appended to a fresh holidays object. How: This spreads curHolObj with custom replaced, newHolObj appended.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				holidays : { // What: Holidays. Why: Only one part of the holidays object changes, every other field must survive. How: This rebuilds holidays from curHolObj plus the one override below.


					...curHolObj, // What: Current Holidays Spread. Why: Every other holidays field must carry over unchanged. How: This spreads curHolObj before the override below.

					custom : [ ...( curHolObj.custom || [] ), newHolObj ] // What: Custom. Why: The user's own hand-entered holidays gain the new one. How: This appends newHolObj to curHolObj.custom, defaulting to [].


				}


			};


		} ),



		delHolFun : ( tarIdeStr ) => setAppStaObj( ( curStaObj ) => { // What: Delete Holiday Function. Why: A user's own hand-entered holiday must be removable by its own id. How: This filters holidays.custom down to every entry but the matching one.


			const curHolObj = curStaObj.holidays || HOL_NAM_OBJ.defStaFun(); // What: Current Holidays Object. Why: The filter below needs a real holidays shape even for state that predates this field. How: This reads curStaObj's own holidays, falling back to HOL_NAM_OBJ's own default state.



			return { // What: Next State Return. Why: The caller needs the one matching custom holiday removed from a fresh holidays object. How: This spreads curHolObj with custom filtered.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				holidays : { // What: Holidays. Why: Only one part of the holidays object changes, every other field must survive. How: This rebuilds holidays from curHolObj plus the one override below.


					...curHolObj, // What: Current Holidays Spread. Why: Every other holidays field must carry over unchanged. How: This spreads curHolObj before the override below.

					custom : ( curHolObj.custom || [] ).filter( ( curCusObj ) => curCusObj.id !== tarIdeStr ) // What: Custom. Why: The deleted custom holiday must be gone. How: This filters out the one whose own id matches tarIdeStr, defaulting to [].


				}


			};


		} ),



		togHolFun : ( holKeyStr ) => setAppStaObj( ( curStaObj ) => { // What: Toggle Holiday Function. Why: A computed holiday must be switchable off and back on for the skip-holidays gate. How: This adds holKeyStr to, or removes it from, the holidays object's own disabled list.


			const curHolObj = curStaObj.holidays || HOL_NAM_OBJ.defStaFun(); // What: Current Holidays Object. Why: The toggle below needs a real holidays shape even for state that predates this field. How: This reads curStaObj's own holidays, falling back to HOL_NAM_OBJ's own default state.

			const nexDisArr = curHolObj.disabled.includes( holKeyStr ) // What: Next Disabled Array. Why: Toggling off removes holKeyStr from disabled; toggling on (re-enabling) adds it. How: This filters holKeyStr out when already present, else appends it.
				? curHolObj.disabled.filter( ( curKeyStr ) => curKeyStr !== holKeyStr ) // What: Re-Enable Branch. Why: A disabled holiday being turned back on leaves the list. How: This filters holKeyStr out.
				: [ ...curHolObj.disabled, holKeyStr ];                                 // What: Disable Branch. Why: An enabled holiday being turned off joins the list. How: This appends holKeyStr.



			return { // What: Next State Return. Why: The caller needs disabled replaced on a fresh holidays object. How: This spreads curHolObj with disabled replaced by nexDisArr.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				holidays : { // What: Holidays. Why: Only one part of the holidays object changes, every other field must survive. How: This rebuilds holidays from curHolObj plus the one override below.


					...curHolObj, // What: Current Holidays Spread. Why: Every other holidays field must carry over unchanged. How: This spreads curHolObj before the override below.

					disabled : nexDisArr // What: Disabled. Why: This is the list of computed holidays the user switched off. How: This is nexDisArr.


				}


			};


		} ),

		// #endregion Holiday List Subsystem



		// #region Items

		// #region addIteFun

		/**
		 * addIteFun = Add Item Function
		 *
		 * @summary
		 * Adds one brand-new item to picIdeStr's own pool, built with the
		 * mode-specific defaults described in new-item.js's buiIteFun (a
		 * charged, peer-average-weighted Ease Down item, an ease band stamped
		 * from the picker's current average, a de-duplicated name), and puts
		 * it first in the global items array.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param picIdeStr - Picker Identifier String: The picker gaining the item.
		 * @param newNamStr - New Name String: The item's name.
		 * @param optIdeStr - Optional Identifier String: An id to use instead of
		 *                    minting a random one.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * addIteFun(picIdeStr, newNamStr) // => void
		 * ```
		 *
		*/

		addIteFun : ( picIdeStr, newNamStr, optIdeStr ) => setAppStaObj( ( curStaObj ) => { // What: Add Item Function. Why: A picker's own pool needs a way to gain a brand-new item with sensible mode-specific defaults. How: This builds the item with buiIteFun from the picker and its existing items, then puts it first in the global items array.


			const curPicObj = curStaObj.pickers.find( ( picFinObj ) => picFinObj.id === picIdeStr ) || { id : picIdeStr }; // What: Current Picker Object. Why: The new item's defaults depend on its picker's type and threshold. How: This looks the picker up, falling back to a bare id so a missing one still yields a plain item.
			const sibIteArr = curStaObj.items.filter( ( curIteObj ) => curIteObj.pickerId === picIdeStr );                 // What: Sibling Item Array. Why: The name de-duplication and the ease-down weight averaging need the picker's existing items. How: This filters the items owned by picIdeStr.



			return { // What: Next State Return. Why: A newly-added item is prepended to the global items array. How: This spreads curStaObj with items rebuilt as the new item first, then everything else.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the items override below.

				items : [ buiIteFun( curPicObj, sibIteArr, newNamStr, optIdeStr ), ...curStaObj.items ] // What: Items. Why: A newly-added item goes to the front of the global items array. How: This builds it with buiIteFun from the picker and its existing items, then puts it first, ahead of every existing item.


			};


		} ),

		// #endregion addIteFun



		// #region delIteFun

		/**
		 * delIteFun = Delete Item Function
		 *
		 * @summary
		 * Deletes an item along with every trace of it on Today: the entries
		 * pointing at it, today's own live log rows for it, and any picker's
		 * activeItemId pointer at it, then reconciles the streak as a removal
		 * would. Historical log rows are kept, so Stats still counts past picks.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param tarIdeStr - Target Identifier String: The item to delete.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * delIteFun(tarIdeStr) // => void
		 * ```
		 *
		*/

		delIteFun : ( tarIdeStr ) => setAppStaObj( ( curStaObj ) => { // What: Delete Item Function. Why: Deleting an item must also drop today's own entries pointing at it (keeping the ring/group totals honest), reconcile the streak as a removal would, drop today's own live log rows for it (keeping historical rows for Stats survivability), and clear any picker's own activeItemId pointer at it. How: See the inline comments below for each step.


			const nexIteArr = curStaObj.items.filter( ( curIteObj ) => curIteObj.id !== tarIdeStr );                       // What: Next Item Array. Why: The removed item must actually be gone from state.items. How: This filters out the one matching tarIdeStr.
			const nexEntArr = ( curStaObj.today.entries || [] ).filter( ( curEntObj ) => curEntObj.itemId !== tarIdeStr ); // What: Next Entry Array. Why: A removed item can no longer have a live Today entry pointing at it. How: This filters out every entry whose own itemId matches tarIdeStr.

			const curDayStr = isoDayFun(); // What: Current Day String. Why: The pick-log purge below only drops TODAY's own rows, keeping history intact. How: This reads isoDayFun().
			const nexLogArr = ( curStaObj.pickLog || [] ).filter( ( curRowObj ) => !( curRowObj.itemId === tarIdeStr && curRowObj.date === curDayStr ) ); // What: Next Pick-Log Array. Why: Only today's own live rows for this item are dropped; historical rows survive (their own denormalized name preserves past stats, like reminderLog does). How: This filters out rows matching both tarIdeStr and curDayStr.

			const { stkClaBoo, stkValNum } = stkSynFun( curStaObj, nexEntArr, curStaObj.tasks ); // What: Streak Reconcile. Why: Removing an item can drop entries off today, which can flip whether today counts as fully done. How: This calls stkSynFun against the already-filtered entries.

			const nexPicArr = curStaObj.pickers.map( ( curPicObj ) => curPicObj.activeItemId === tarIdeStr ? { ...curPicObj, activeItemId : null } : curPicObj ); // What: Next Picker Array. Why: A removed item that was some ease-down picker's own in-progress item must no longer be pointed at. How: This nulls activeItemId on any picker that was pointing at tarIdeStr.



			return { // What: Next State Return. Why: Every affected field must land together on one fresh state. How: This spreads curStaObj with items/pickers/streak/pickLog/today all replaced.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				items   : nexIteArr,                                                             // What: Items. Why: The removed item must be gone. How: This is nexIteArr.
				pickers : nexPicArr,                                                             // What: Pickers. Why: A nulled activeItemId must land here. How: This is nexPicArr.
				pickLog : nexLogArr,                                                             // What: Pick Log. Why: Today's own live rows for the removed item must be gone. How: This is nexLogArr.
				streak  : stkValNum,                                                             // What: Streak. Why: The persisted streak count must reflect the reconciled verdict. How: This is stkValNum, from stkSynFun.
				today   : { ...curStaObj.today, entries : nexEntArr, streakClaimed : stkClaBoo } // What: Today. Why: Today's own entries and claimed flag must both reflect this change. How: This spreads curStaObj.today with entries replaced and streakClaimed set to stkClaBoo.


			};


		} ),

		// #endregion delIteFun



		movIteFun : ( tarIdeStr ) => setAppStaObj( ( curStaObj ) => { // What: Move Item Function. Why: The Pickers-tab add flow renders a picker's own items in array order, so this lands a just-saved item at the bottom of that picker's own list. How: This moves the one matching item to the end of the global items array.


			const tarIteObj = curStaObj.items.find( ( iteFinObj ) => iteFinObj.id === tarIdeStr ); // What: Target Item Object And Guard. Why: A stale tarIdeStr must be a no-op rather than silently dropping the item. How: This looks up tarIdeStr in curStaObj.items.


			if ( !tarIteObj ) return curStaObj; // What: Missing-Item Guard. Why: There's nothing to move when tarIteObj wasn't found. How: This returns curStaObj unchanged.



			return { // What: Next State Return. Why: The caller needs tarIteObj moved to the end of the items array. How: This spreads curStaObj with items rebuilt as everything else, then tarIteObj last.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				items : [ ...curStaObj.items.filter( ( iteFilObj ) => iteFilObj.id !== tarIdeStr ), tarIteObj ] // What: Items. Why: The item must land at the very end of the array. How: This rebuilds items as every other item, then tarIteObj.


			};


		} ),



		// #region renIteFun

		/**
		 * renIteFun = Rename Item Function
		 *
		 * @summary
		 * Commits an item rename (on blur, Enter or Save, never per keystroke).
		 * The name is de-duplicated against the item's own siblings in the same
		 * picker, so the saved name can differ from what was typed, e.g. gaining
		 * a " (2)" suffix.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param tarIdeStr - Target Identifier String: The item to rename.
		 * @param newNamStr - New Name String: The name as typed.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * renIteFun(tarIdeStr, newNamStr) // => void
		 * ```
		 *
		*/

		renIteFun : ( tarIdeStr, newNamStr ) => setAppStaObj( ( curStaObj ) => { // What: Rename Item Function. Why: Commit-time rename (blur/Enter/Save only, not every keystroke) with de-duplication, so 2 items in the same picker can't share a name. How: This resolves a unique name against the item's own sibling item names, then writes it onto the one matching item.


			const tarIteObj = curStaObj.items.find( ( iteFinObj ) => iteFinObj.id === tarIdeStr ); // What: Target Item Object And Guard. Why: The sibling filter below needs to know this item's own pickerId to scope the collision check correctly. How: This looks up tarIdeStr in curStaObj.items.

			const sibNamArr = curStaObj.items.filter( ( iteFilObj ) => iteFilObj.pickerId === ( tarIteObj && tarIteObj.pickerId ) && iteFilObj.id !== tarIdeStr ).map( ( iteFilObj ) => iteFilObj.name ); // What: Sibling Name Array. Why: A name only needs to be unique among items owned by the SAME picker, excluding the item being renamed itself. How: This filters curStaObj.items to same-picker siblings, then maps to their own names.

			const uniNamStr = uniNamFun( newNamStr, sibNamArr ); // What: Unique Name String. Why: The write below needs the actual de-duplicated name to apply. How: This calls uniNamFun with newNamStr and sibNamArr.



			return { // What: Next State Return. Why: The caller needs the one matching item's own name replaced. How: This spreads curStaObj with items rebuilt, patching only the one matching item.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				items : curStaObj.items.map( ( curIteObj ) => curIteObj.id === tarIdeStr ? { ...curIteObj, name : uniNamStr } : curIteObj ) // What: Items. Why: Only the one matching item's own name changes. How: This writes uniNamStr as name on the item matching tarIdeStr.


			};


		} ),

		// #endregion renIteFun



		setWeiFun : ( tarIdeStr, weiValNum ) => setAppStaObj( ( curStaObj ) => ( { // What: Set Weight Function. Why: A direct weight override (Data tab) needs to patch just this one field on one item. How: This maps items, setting weight to weiValNum on the one matching tarIdeStr.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			items : curStaObj.items.map( ( curIteObj ) => curIteObj.id === tarIdeStr ? { ...curIteObj, weight : weiValNum } : curIteObj ) // What: Items. Why: Only the one matching item's own weight changes. How: This maps items, writing weiValNum as weight on the item matching tarIdeStr.


		} ) ),



		// #region togVacFun

		/**
		 * togVacFun = Toggle Vacation Function
		 *
		 * @summary
		 * Flips one item's own vacation flag, or (tarKinStr:'picker') every item
		 * owned by a picker at once. When an in-progress Ease Down item
		 * (its own picker's activeItemId) is marked inactive, that streak
		 * is abandoned: the picker's activeItemId is nulled and the item
		 * recharges to full, since an abandoned streak never reached 0 and
		 * so must never count toward Spent.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param tarIdeStr - Target Identifier String: The item or picker to toggle.
		 * @param tarKinStr - Target Kind String: 'item' for one item, or anything
		 *                    else for every item the picker owns.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * togVacFun(tarIdeStr, 'item') // => void
		 * ```
		 *
		*/

		togVacFun : ( tarIdeStr, tarKinStr ) => setAppStaObj( ( curStaObj ) => { // What: Toggle Vacation Function. Why: Marking one item, or every item a picker owns, inactive must also abandon any in-progress Ease Down streak and log the transition for Stats. How: This branches on tarKinStr ('item' or 'picker'), flips the matching vacation flag(s), runs abaStkFun when going inactive, and appends vacationLog rows.


			const curDayStr = isoDayFun(); // What: Current Day String. Why: Every vacationLog row below is stamped with today's own calendar day. How: This reads isoDayFun().


			const abaStkFun = ( picArgArr, iteArgArr, iteIdeArr ) => { // What: Abandon Streak Function. Why: Both branches below (single item, whole picker) share this same abandon-in-progress-streak logic. How: This walks iteIdeArr, and for any item that's some ease-down picker's own activeItemId, nulls that pointer and recharges the item to full.


				let nexPicArr = picArgArr; // What: Next Picker Array. Why: The loop below folds its own patch onto this on each iteration that actually finds a match. How: This starts at picArgArr, the caller's own current pickers.
				let nexIteArr = iteArgArr; // What: Next Item Array. Why: The loop below folds its own patch onto this on each iteration that actually finds a match. How: This starts at iteArgArr, the caller's own current items.


				for ( const cuiIdeStr of iteIdeArr ) { // What: Abandon Loop. Why: Every touched item id must be checked for whether it's currently some ease-down picker's own in-progress item. How: This iterates iteIdeArr, patching nexPicArr/nexIteArr only for a genuine match.


					const curPicObj = nexPicArr.find( ( picFinObj ) => picFinObj.mode === 'ease-down' && picFinObj.activeItemId === cuiIdeStr ); // What: Current Picker Object And Guard. Why: Only an ease-down picker currently working down exactly this item needs anything abandoned. How: This looks for a picker whose own mode is 'ease-down' and activeItemId matches cuiIdeStr.


					if ( !curPicObj ) continue; // What: No-Match Skip Guard. Why: An item not currently in progress for any picker needs nothing abandoned. How: This skips to the next id when curPicObj wasn't found.



					const thrValNum = curPicObj.threshold ?? 100; // What: Threshold Value Number. Why: An abandoned item must recharge back to this exact threshold, as if it were never touched. How: This reads curPicObj's own threshold, defaulting to 100.

					nexPicArr = nexPicArr.map( ( picMapObj ) => picMapObj.id === curPicObj.id ? { ...picMapObj, activeItemId : null } : picMapObj ); // What: Picker Pointer Null. Why: The abandoned picker must no longer point at this item as its own in-progress one. How: This nulls activeItemId on the one matching picker.
					nexIteArr = nexIteArr.map( ( iteMapObj ) => iteMapObj.id === cuiIdeStr ? { ...iteMapObj, value : thrValNum } : iteMapObj );      // What: Item Recharge. Why: An abandoned streak must recharge to full, never counting toward Spent. How: This sets the one matching item's own value to thrValNum.


				}



				return { items : nexIteArr, pickers : nexPicArr }; // What: Abandon Result Return. Why: The caller needs both patched arrays back together. How: This bundles nexPicArr/nexIteArr.


			};


			if ( tarKinStr === 'item' ) { // What: Single-Item Branch. Why: Toggling one item's own vacation flag is a narrower case than the whole-picker branch below. How: This flips tarIdeStr's own vacation flag, abandons its own in-progress streak if it just went inactive, and logs the transition.


				const curIteObj = curStaObj.items.find( ( iteFinObj ) => iteFinObj.id === tarIdeStr ); // What: Current Item Object And Guard. Why: The vacationLog row below needs to know the item's own vacation state BEFORE this toggle. How: This looks up tarIdeStr in curStaObj.items.
				const nexVacBoo = curIteObj ? !curIteObj.vacation : true;                              // What: Next Vacation Boolean. Why: The vacationLog row records whether the item just went ON (inactive) or OFF (active again). How: This is curIteObj's own negated vacation flag, else true when curIteObj is somehow missing.

				let nexIteArr = curStaObj.items.map( ( iteMapObj ) => iteMapObj.id === tarIdeStr ? { ...iteMapObj, vacation : !iteMapObj.vacation } : iteMapObj ); // What: Next Item Array. Why: Only the one matching item's own vacation flag actually flips. How: This maps curStaObj.items, negating vacation on the one matching item.
				let nexPicArr = curStaObj.pickers; // What: Next Picker Array. Why: This only changes below when the item just went inactive and needs its own in-progress streak abandoned. How: This starts at curStaObj's own current pickers.


				if ( nexVacBoo ) ( { items : nexIteArr, pickers : nexPicArr } = abaStkFun( nexPicArr, nexIteArr, [ tarIdeStr ] ) ); // What: Abandon Streak Call Guard. Why: Only going INTO vacation (not coming back out of it) can abandon an in-progress streak. How: This calls abaStkFun and destructures its own result back onto nexPicArr/nexIteArr, only when nexVacBoo is true.



				return { // What: Single-Item Return. Why: The caller needs the patched arrays plus a fresh vacationLog row recording this exact transition. How: This spreads curStaObj with items/pickers replaced and appends one row to vacationLog.


					...curStaObj, // What: Current State Spread. Why: Every field this branch doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

					items   : nexIteArr, // What: Items. Why: The one toggled item's own new vacation flag (and any recharge) must land in state. How: This is nexIteArr.
					pickers : nexPicArr, // What: Pickers. Why: An abandoned streak's own nulled activeItemId must land in state. How: This is nexPicArr.

					vacationLog : [ ...( curStaObj.vacationLog || [] ), { date : curDayStr, itemId : tarIdeStr, on : nexVacBoo } ] // What: Vacation Log. Why: Stats needs a row recording exactly when this item went inactive or came back. How: This appends one row for tarIdeStr to the existing log.


				};


			}



			const ownIteArr = curStaObj.items.filter( ( curIteObj ) => curIteObj.pickerId === tarIdeStr );     // What: Owned Item Array. Why: The whole-picker branch needs every item this picker actually owns. How: This filters curStaObj.items to those whose own pickerId matches tarIdeStr.
			const nexVacBoo = !( ownIteArr.length && ownIteArr.every( ( curIteObj ) => curIteObj.vacation ) ); // What: Next Vacation Boolean. Why: A picker's own toggle flips to the OPPOSITE of "every owned item is already inactive" (so a mixed state turns everything ON first). How: This negates whether ownIteArr is non-empty and every item in it is already vacation:true.
			const chaIteArr = ownIteArr.filter( ( curIteObj ) => curIteObj.vacation !== nexVacBoo );           // What: Changed Item Array. Why: Only an item whose own vacation flag actually differs from nexVacBoo needs a vacationLog row of its own. How: This filters ownIteArr to items whose own vacation doesn't already match nexVacBoo.

			let nexIteArr = curStaObj.items.map( ( curIteObj ) => curIteObj.pickerId === tarIdeStr ? { ...curIteObj, vacation : nexVacBoo } : curIteObj ); // What: Next Item Array. Why: Every item owned by this picker gets the same new vacation state. How: This maps curStaObj.items, setting vacation:nexVacBoo on every item owned by tarIdeStr.
			let nexPicArr = curStaObj.pickers; // What: Next Picker Array. Why: This only changes below when the picker's own items just went inactive and need their own in-progress streaks abandoned. How: This starts at curStaObj's own current pickers.


			if ( nexVacBoo ) ( { items : nexIteArr, pickers : nexPicArr } = abaStkFun( nexPicArr, nexIteArr, chaIteArr.map( ( curIteObj ) => curIteObj.id ) ) ); // What: Abandon Streak Call Guard. Why: Only going INTO vacation can abandon an in-progress streak, same reasoning as the single-item branch above. How: This calls abaStkFun (over just the CHANGED items) and destructures its own result, only when nexVacBoo is true.



			return { // What: Whole-Picker Return. Why: The caller needs the patched arrays plus one fresh vacationLog row per actually-changed item. How: This spreads curStaObj with items/pickers replaced and appends chaIteArr's own rows to vacationLog.


				...curStaObj, // What: Current State Spread. Why: Every field this branch doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				items   : nexIteArr, // What: Items. Why: Every owned item's own new vacation flag (and any recharge) must land in state. How: This is nexIteArr.
				pickers : nexPicArr, // What: Pickers. Why: Any abandoned streak's own nulled activeItemId must land in state. How: This is nexPicArr.

				vacationLog : [ ...( curStaObj.vacationLog || [] ), ...chaIteArr.map( ( curIteObj ) => ( { date : curDayStr, itemId : curIteObj.id, on : nexVacBoo } ) ) ] // What: Vacation Log. Why: Stats needs one row per item whose own state actually changed. How: This appends one row per chaIteArr entry to the existing log.


			};


		} ),

		// #endregion togVacFun



		// #region updIteFun

		/**
		 * updIteFun = Update Item Function
		 *
		 * @summary
		 * The general per-item field patch (Fill, Refill, Reset boost, editor
		 * saves). When the patch touches value, it also strips any stale pending
		 * update for this item from every other Today entry, since completing
		 * one of those entries later would otherwise silently overwrite the
		 * value just set.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param tarIdeStr - Target Identifier String: The item to patch.
		 * @param patValObj - Patch Value Object: The fields to merge onto the item.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * updIteFun(tarIdeStr, patValObj) // => void
		 * ```
		 *
		*/

		updIteFun : ( tarIdeStr, patValObj ) => setAppStaObj( ( curStaObj ) => ( { // What: Update Item Function. Why: This is the general per-item field patch (Fill/Refill/Reset boost, editor saves, ...), which must ALSO strip any stale pending mutation a direct value edit would otherwise be silently overwritten by later (see spuDroFun above). How: This merges patValObj onto the one matching item, and when patValObj touches value, also drops stale pending rows for tarIdeStr from every other Today entry.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			items : curStaObj.items.map( ( curIteObj ) => curIteObj.id === tarIdeStr ? { ...curIteObj, ...patValObj } : curIteObj ), // What: Items. Why: Only the one matching item gets patched. How: This merges patValObj onto the item matching tarIdeStr.

			...( 'value' in patValObj ? { // What: Stale-Pending Drop Spread. Why: A direct value edit would otherwise be silently overwritten later by a still-staged pending mutation on one of today's entries. How: This replaces today.entries with spuDroFun's output, stripping stale pending for tarIdeStr, only when patValObj sets value.


				today : { // What: Today. Why: Only today's own entries list changes here. How: This rebuilds today with its entries replaced.


					...curStaObj.today, // What: Current Today Spread. Why: Every other today field must carry over unchanged. How: This spreads curStaObj.today before the entries override below.

					entries : spuDroFun( curStaObj.today.entries, [ tarIdeStr ] ) // What: Entries. Why: Any stale pending mutation targeting this item must be stripped. How: This calls spuDroFun with today's entries and tarIdeStr.


				}


			} : {} )


		} ) ),

		// #endregion updIteFun

		// #endregion Items



		// #region Manual Reminders Subsystem

		/**
		 * addTasFun = Add Task Function
		 *
		 * @summary
		 * Statically-scheduled tasks shown atop Today, distinct from the
		 * randomly-picked items above. fields.replaceId updates THIS existing
		 * task in place (same id) instead of prepending a new one, mirroring
		 * addPicFun's own replaceId, used when a reminder mini-tour is
		 * replayed after already finishing once (see reminders-section.jsx's
		 * own comAddFun, which looks up the prior real task via
		 * createdFromSample).
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param tasArgObj - Task Argument Object: The reminder's fields; any field
		 *                    left out gets its default.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * addTasFun(tasArgObj) // => void
		 * ```
		 *
		*/



		addTasFun : ( tasArgObj ) => setAppStaObj( ( curStaObj ) => { // What: Add Task Function. Why: Hidden reminders (onboarding's own sample reminders, plus any real reminder still hidden pending the checklist's closing Generate step) are excluded from the sibling-name check, same policy as addPicFun's own uniNamFun call, otherwise the FIRST real reminder a tutorial ever creates would collide with its own still-hidden sample template. How: This builds a default task via TAS_NAM_OBJ.defTasFun, resolves tasArgObj.replaceId, de-duplicates its own name, then replaces or prepends it.


			const newTasObj = TAS_NAM_OBJ.defTasFun( tasArgObj );  // What: New Task Object. Why: TAS_NAM_OBJ itself owns the real default shape for a brand-new task. How: This calls TAS_NAM_OBJ.defTasFun with the given tasArgObj.
			const tasIdeStr = tasArgObj.replaceId || newTasObj.id; // What: Task Identifier String. Why: A replace keeps the existing id alive; a fresh add uses the one TAS_NAM_OBJ.defTasFun just minted. How: This prefers tasArgObj.replaceId, else newTasObj's own id.
			const finTasObj = { ...newTasObj, id : tasIdeStr };    // What: Final Task Object. Why: The task actually written must carry tasIdeStr, not necessarily newTasObj's own freshly-minted one. How: This spreads newTasObj with id overridden.

			const sibNamArr = curStaObj.tasks.filter( ( curTasObj ) => curTasObj.id !== tasIdeStr && !curTasObj.hidden ).map( ( curTasObj ) => curTasObj.name ); // What: Sibling Name Array. Why: The de-duplication below must exclude both this task itself and every hidden (invisible) reminder. How: This filters curStaObj.tasks down to visible siblings, then maps to their own names.
			const namTasObj = { ...finTasObj, name : uniNamFun( finTasObj.name, sibNamArr ) };                                                                   // What: Named Task Object. Why: The task actually written must carry its own de-duplicated name. How: This spreads finTasObj with name replaced by uniNamFun's own result.

			const nexTasArr = tasArgObj.replaceId // What: Next Task Array. Why: A replace updates the one matching task in place; a fresh add prepends the new one. How: This maps in namTasObj for the matching id when tasArgObj.replaceId was given, else prepends namTasObj.
				? curStaObj.tasks.map( ( curTasObj ) => curTasObj.id === tasIdeStr ? namTasObj : curTasObj ) // What: Replace Branch. Why: An existing task keeps its own place in the list. How: This swaps namTasObj in for the matching task.
				: [ namTasObj, ...curStaObj.tasks ];                                                         // What: Add Branch. Why: A brand-new task goes first in the list. How: This prepends namTasObj.



			return { ...curStaObj, tasks : nexTasArr }; // What: Next State Return. Why: The caller needs tasks replaced on a fresh state. How: This spreads curStaObj with tasks replaced by nexTasArr.


		} ),



		delTasFun : ( tarIdeStr ) => setAppStaObj( ( curStaObj ) => ( { // What: Delete Task Function. Why: Deleting a reminder must actually drop it from state.tasks. How: This filters out the one matching tarIdeStr.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			tasks : curStaObj.tasks.filter( ( curTasObj ) => curTasObj.id !== tarIdeStr ) // What: Tasks. Why: The deleted reminder must actually be gone from state. How: This filters out the task matching tarIdeStr.


		} ) ),



		// #region renTasFun

		/**
		 * renTasFun = Rename Task Function
		 *
		 * @summary
		 * Commits a reminder rename (on blur, Enter or Save). The name is
		 * de-duplicated against every other reminder's own name, so the saved
		 * name can differ from what was typed.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param tarIdeStr - Target Identifier String: The reminder to rename.
		 * @param newNamStr - New Name String: The name as typed.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * renTasFun(tarIdeStr, newNamStr) // => void
		 * ```
		 *
		*/

		renTasFun : ( tarIdeStr, newNamStr ) => setAppStaObj( ( curStaObj ) => { // What: Rename Task Function. Why: Commit-time reminder rename (blur/Enter/Save only) with de-duplication. How: This resolves a unique name against every OTHER task's own name, then writes it onto the one matching task.


			const sibNamArr = curStaObj.tasks.filter( ( curTasObj ) => curTasObj.id !== tarIdeStr ).map( ( curTasObj ) => curTasObj.name ); // What: Sibling Name Array. Why: A reminder name only needs to be unique among every OTHER reminder. How: This filters curStaObj.tasks to every task but the one being renamed, then maps to their own names.
			const uniNamStr = uniNamFun( newNamStr, sibNamArr );                                                                            // What: Unique Name String. Why: The write below needs the actual de-duplicated name to apply. How: This calls uniNamFun with newNamStr and sibNamArr.



			return { // What: Next State Return. Why: The caller needs the one matching task's own name replaced. How: This spreads curStaObj with tasks rebuilt, patching only the one matching task.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				tasks : curStaObj.tasks.map( ( curTasObj ) => curTasObj.id === tarIdeStr ? { ...curTasObj, name : uniNamStr } : curTasObj ) // What: Tasks. Why: Only the one matching reminder's own name changes. How: This writes uniNamStr as name on the task matching tarIdeStr.


			};


		} ),

		// #endregion renTasFun



		setOptFun : ( tasTypStr, optKeyStr, optValBoo ) => setAppStaObj( ( curStaObj ) => { // What: Set Option Function. Why: This flips one participation switch for a reminder type ('once' | 'recurring'), without callers re-specifying every other switch. How: This normalizes the current options, then merges one key onto the matching type's own sub-object.


			const norOptObj = TAS_NAM_OBJ.norOptFun( curStaObj.reminderOpts ); // What: Normalized Options Object. Why: A patch must be applied against the FULL, normalized switch set, never a possibly-partial raw one. How: This calls TAS_NAM_OBJ.norOptFun with curStaObj's own reminderOpts.



			return { // What: Next State Return. Why: The caller needs just this one switch flipped, every other one untouched. How: This spreads norOptObj, overriding [tasTypStr]'s own sub-object with [optKeyStr] replaced by value.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				reminderOpts : { // What: Reminder Options. Why: Only one switch of one reminder type changes, every other switch must survive. How: This rebuilds reminderOpts from the normalized full set plus the one patched type.


					...norOptObj, // What: Normalized Options Spread. Why: Every other reminder type's own switches must carry over unchanged. How: This spreads norOptObj before the one type override below.

					[ tasTypStr ] : { ...norOptObj[ tasTypStr ], [ optKeyStr ] : optValBoo } // What: Patched Type Options. Why: Only the one requested switch of this type flips. How: This spreads the type's own current switches, then writes optValBoo under optKeyStr.


				}


			};


		} ),



		// #region skiTasFun

		/**
		 * skiTasFun = Skip Task Function
		 *
		 * @summary
		 * Hides a reminder until its own next eligible day, which the caller
		 * computes from the reminder's rules. It never marks the reminder done
		 * or logs a completion, but it does append a skip row so Stats can tally
		 * skips per reminder.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param tarIdeStr - Target Identifier String: The reminder to skip.
		 * @param untIsoStr - Until Iso String: The next eligible day, as YYYY-MM-DD,
		 *                    computed by the caller.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * skiTasFun(tarIdeStr, untIsoStr) // => void
		 * ```
		 *
		*/

		skiTasFun : ( tarIdeStr, untIsoStr ) => setAppStaObj( ( curStaObj ) => { // What: Skip Task Function. Why: This hides a reminder until its own next eligible day (computed by the caller from the reminder's own rules), without marking it done or logging a completion, but DOES append a skip row so Stats can tally per-reminder skips. How: This writes skipUntil onto the matching task and appends one row to reminderSkipLog.


			const curTasObj = curStaObj.tasks.find( ( tasFinObj ) => tasFinObj.id === tarIdeStr ); // What: Current Task Object And Guard. Why: The skip row below needs this task's own name and recurrence type, when it still exists. How: This looks up tarIdeStr in curStaObj.tasks.

			const skiRowArr = curTasObj ? [ // What: Skip Row Array. Why: A stale tarIdeStr (already removed) must log no row at all. How: This builds one reminderSkipLog row when curTasObj was found, else stays empty.


				{ // What: Skip Row Object. Why: This is the one reminderSkipLog row recording this skip. How: This bundles the task's own id/name/type with a fresh row id and timestamp.


					name      : curTasObj.name,                                           // What: Name. Why: The skip row keeps the reminder's own name, denormalized so history survives a later rename or delete. How: This is curTasObj.name.
					rowId     : 'rs_' + Math.random().toString( 36 ).slice( 2, 9 ),       // What: Row Id. Why: Every log row needs its own unique id. How: This mints a random 'rs_' id.
					skippedAt : new Date().toISOString(),                                 // What: Skipped At. Why: Stats needs the exact moment of the skip. How: This stamps the current time as an ISO string.
					taskId    : tarIdeStr,                                                // What: Task Id. Why: The row must point back at the reminder it belongs to. How: This is tarIdeStr.
					type      : TAS_NAM_OBJ.isaReuFun( curTasObj ) ? 'recurring' : 'once' // What: Type. Why: Stats tallies skips separately for one-time and recurring reminders. How: This is 'recurring' when TAS_NAM_OBJ.isaReuFun says so, else 'once'.


				}


			] : [];



			return { // What: Next State Return. Why: The caller needs skipUntil written on the matching task, and the skip row (if any) appended to reminderSkipLog. How: This spreads curStaObj with tasks/reminderSkipLog both replaced.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				reminderSkipLog : [ ...( curStaObj.reminderSkipLog || [] ), ...skiRowArr ],                                                                // What: Reminder Skip Log. Why: Stats needs a row for every skip. How: This appends skiRowArr (empty for a stale id) to the existing log.
				tasks           : curStaObj.tasks.map( ( tasMapObj ) => tasMapObj.id === tarIdeStr ? { ...tasMapObj, skipUntil : untIsoStr } : tasMapObj ) // What: Tasks. Why: The skipped reminder must stay hidden until its own next eligible day. How: This writes untIsoStr as skipUntil on the task matching tarIdeStr.


			};


		} ),

		// #endregion skiTasFun



		// #region togTasFun

		/**
		 * togTasFun = Toggle Task Function
		 *
		 * @summary
		 * Checks/un-checks today's own occurrence of a reminder. Completing
		 * stamps lastDone with today AND appends a row to the completion
		 * log; un-checking clears lastDone and voids today's own log row
		 * for that reminder. Either way the streak is reconciled, since
		 * reminders count toward the daily streak per their own type's
		 * switch, but the Stats log itself is kept regardless of the
		 * Stats toggle. Stamped against the generator's own day
		 * (TAS_NAM_OBJ.ancDatFun), not live real time, since Today's own reminders
		 * list is itself pinned to the last generation, so "done" must
		 * agree with whatever day that list is currently showing.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param tarIdeStr - Target Identifier String: The reminder to check or
		 *                    uncheck.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * togTasFun(tarIdeStr) // => void
		 * ```
		 *
		*/

		togTasFun : ( tarIdeStr ) => setAppStaObj( ( curStaObj ) => { // What: Toggle Task Function. Why: Checking a reminder off (or back on) must update its own done state, the completion log, and the streak together. How: This stamps or clears lastDone against the generator's anchor day, appends or voids today's log row, and reconciles the streak via stkSynFun.


			const curTasObj = curStaObj.tasks.find( ( tasFinObj ) => tasFinObj.id === tarIdeStr ); // What: Current Task Object And Guard. Why: A stale tarIdeStr (already removed) must be a no-op. How: This looks up tarIdeStr in curStaObj.tasks.


			if ( !curTasObj ) return curStaObj; // What: Missing-Task Guard. Why: There's nothing to toggle when curTasObj wasn't found. How: This returns curStaObj unchanged.



			const curAncObj = TAS_NAM_OBJ.ancDatFun( curStaObj.today && curStaObj.today.generatedAt ); // What: Current Anchor Object. Why: Every day-comparison below must be pinned to the last generation's own day, not live "now". How: This calls TAS_NAM_OBJ.ancDatFun with today's own generatedAt.
			const curDayStr = isoDayFun( curAncObj );                                                  // What: Current Day String. Why: Both the lastDone stamp and the completion-log row below need this exact ISO day. How: This calls isoDayFun with curAncObj.
			const wasDonBoo = TAS_NAM_OBJ.isaDonFun( curTasObj, curAncObj );                           // What: Was Done Boolean. Why: Every branch below depends on which direction this toggle is heading. How: This calls TAS_NAM_OBJ.isaDonFun with curTasObj and curAncObj.

			const nexTasArr = curStaObj.tasks.map( ( tasMapObj ) => // What: Next Task Array. Why: Only the toggled task's own lastDone actually changes. How: This maps curStaObj.tasks, setting lastDone to null (un-checking) or curDayStr (completing) on the one matching task.
				tasMapObj.id === tarIdeStr ? { ...tasMapObj, lastDone : wasDonBoo ? null : curDayStr } : tasMapObj ); // What: Toggled Task Patch. Why: Only the toggled task changes. How: This clears lastDone when un-checking, sets it to today when checking, and passes every other task through.

			let nexLogArr = curStaObj.reminderLog || []; // What: Next Reminder-Log Array. Why: Both branches below patch this same array, one way or the other. How: This starts at curStaObj's own current reminderLog.


			if ( wasDonBoo ) { // What: Un-Check Branch. Why: Un-checking must void today's own completion row for this reminder. How: This filters out the one row matching taskId and curDayStr.


				nexLogArr = nexLogArr.filter( ( curRowObj ) => // What: Completion Row Void. Why: Un-checking means today's own completion never happened. How: This drops the row whose taskId matches tarIdeStr and whose completedAt falls on curDayStr.
					!( curRowObj.taskId === tarIdeStr && isoDayFun( new Date( curRowObj.completedAt ) ) === curDayStr ) ); // What: Today Completion Test. Why: Only today's own completion of this task is voided. How: This keeps every row except the one for tarIdeStr completed today.


			}

			else { // What: Complete Branch. Why: Completing must append a fresh completion row for this reminder. How: This appends one row shaped to state.reminderLog's own contract.


				nexLogArr = [ // What: Completion Row Append. Why: Completing must add a fresh completion row for this reminder. How: This rebuilds the log as every existing row plus one new row.


					...nexLogArr, // What: Existing Rows Spread. Why: Every earlier completion row must survive. How: This spreads the current nexLogArr first.

					{ // What: Completion Row Object. Why: This is the one reminderLog row recording this completion. How: This bundles the task's own id/name/type with a fresh row id and timestamp.


						completedAt : new Date().toISOString(),                                 // What: Completed At. Why: Stats needs the exact moment of the completion. How: This stamps the current time as an ISO string.
						name        : curTasObj.name,                                           // What: Name. Why: The row keeps the reminder's own name, denormalized so history survives a later rename or delete. How: This is curTasObj.name.
						rowId       : 'rl_' + Math.random().toString( 36 ).slice( 2, 9 ),       // What: Row Id. Why: Every log row needs its own unique id. How: This mints a random 'rl_' id.
						taskId      : tarIdeStr,                                                // What: Task Id. Why: The row must point back at the reminder it belongs to. How: This is tarIdeStr.
						type        : TAS_NAM_OBJ.isaReuFun( curTasObj ) ? 'recurring' : 'once' // What: Type. Why: Stats tallies completions separately for one-time and recurring reminders. How: This is 'recurring' when TAS_NAM_OBJ.isaReuFun says so, else 'once'.


					}


				];


			}



			const { stkClaBoo, stkValNum } = stkSynFun( curStaObj, curStaObj.today.entries, nexTasArr ); // What: Streak Reconcile. Why: Toggling a reminder can flip whether today counts as fully done. How: This calls stkSynFun against curStaObj's own current entries and the already-toggled nexTasArr.



			return { // What: Next State Return. Why: Every affected field must land together on one fresh state. How: This spreads curStaObj with streak/tasks/reminderLog/today all replaced.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				reminderLog : nexLogArr,                                        // What: Reminder Log. Why: The toggle's own completion row must be recorded. How: This is nexLogArr.
				streak      : stkValNum,                                        // What: Streak. Why: The persisted streak count must reflect the reconciled verdict. How: This is stkValNum, from stkSynFun.
				tasks       : nexTasArr,                                        // What: Tasks. Why: The toggled reminder's own done state lands here. How: This is nexTasArr.
				today       : { ...curStaObj.today, streakClaimed : stkClaBoo } // What: Today. Why: Today's own claimed flag must reflect the reconciled verdict. How: This spreads curStaObj.today with streakClaimed set to stkClaBoo.


			};


		} ),

		// #endregion togTasFun



		updTasFun : ( tarIdeStr, patValObj ) => setAppStaObj( ( curStaObj ) => ( { // What: Update Task Function. Why: Callers need to patch one existing task's own fields in place, without touching any other. How: This merges patValObj onto the one task whose own id matches tarIdeStr.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			tasks : curStaObj.tasks.map( ( curTasObj ) => curTasObj.id === tarIdeStr ? { ...curTasObj, ...patValObj } : curTasObj ) // What: Tasks. Why: Only the one matching task gets patched. How: This merges patValObj onto the task matching tarIdeStr.


		} ) ),

		// #endregion Manual Reminders Subsystem



		// #region Onboarding

		finCheFun : ( donValBoo = true ) => setAppStaObj( ( curStaObj ) => ( { // What: Finish Checklist Function. Why: This flips the instant the closing Generate card's own flow completes; every checklist card stops rendering the moment it's true. How: This writes donValBoo (defaulting to true) as checklistDone onto curStaObj.onboarding.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the onboarding override below.

			onboarding : { // What: Onboarding Override. Why: Only the checklistDone flag inside onboarding changes, every sibling onboarding field must survive. How: This rebuilds onboarding from its own current fields plus the new flag.


				...( curStaObj.onboarding || {} ), // What: Current Onboarding Spread. Why: Every other onboarding field must carry over unchanged. How: This spreads curStaObj.onboarding, defaulting to {} for state that predates it.

				checklistDone : donValBoo // What: Checklist Done. Why: This is the flag every checklist card checks before rendering. How: This is donValBoo.


			}


		} ) ),



		sedHisFun : ( { pickLog : picLogArr, reminderLog : remLogArr, reminderSkipLog : skiLogArr } ) => setAppStaObj( ( curStaObj ) => ( { // What: Seed History Function. Why: This merges precomputed, already-hydrated history rows into state, used only by the Welcome Tour's own onboarding seeding to backfill Stats for the sample pickers/reminders without computing about a year of rows live. How: This prepends pickLog/reminderLog/reminderSkipLog rows (each already in their own full row shape) onto whatever curStaObj already holds.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the log overrides below.

			pickLog         : [ ...( picLogArr || [] ), ...( curStaObj.pickLog || [] ) ],        // What: Pick Log. Why: The seeded pick history must sit ahead of any rows already logged. How: This puts picLogArr (defaulting to []) before the existing pickLog.
			reminderLog     : [ ...( remLogArr || [] ), ...( curStaObj.reminderLog || [] ) ],    // What: Reminder Log. Why: The seeded reminder completions must sit ahead of any already logged. How: This puts remLogArr (defaulting to []) before the existing reminderLog.
			reminderSkipLog : [ ...( skiLogArr || [] ), ...( curStaObj.reminderSkipLog || [] ) ] // What: Reminder Skip Log. Why: The seeded reminder skips must sit ahead of any already logged. How: This puts skiLogArr (defaulting to []) before the existing reminderSkipLog.


		} ) ),



		// #region setCarFun

		/**
		 * setCarFun = Set Card Function
		 *
		 * @summary
		 * Resolves (or un-resolves) one mini-tour checklist item (see
		 * onboarding-checklist.js). patValObj is {status:'finished'|
		 * 'skipped'|'cancelled', createdId?} to resolve it, or null to
		 * uncheck it back to pending (redo). Never touches the underlying
		 * sample picker/task; resolution is tracked here only, which is
		 * exactly what makes unchecking free. Also flags the exact moment
		 * reaGenFun flips false-to-true, for tab-today.jsx's own
		 * auto-scroll (see generateScrollPending's own migStaFun() comment
		 * for why this has to be captured HERE, the actual mutation
		 * point, rather than as a derived-value comparison inside
		 * TabTodCom itself, which may not even be mounted right now).
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param iteIdeStr - Item Identifier String: The checklist card to resolve
		 *                    or
		 *                    unresolve.
		 * @param patValObj - Patch Value Object: The value to resolve the card with,
		 *                    or null to unresolve it.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * setCarFun(iteIdeStr, patValObj) // => void
		 * ```
		 *
		*/

		setCarFun : ( iteIdeStr, patValObj ) => setAppStaObj( ( curStaObj ) => { // What: Set Card Function. Why: Every mini-tour launcher (picker, page and reminder tours, plus Today's own Skip button) needs to resolve or un-resolve its own checklist card without re-specifying the whole checklist. How: This patches or deletes iteIdeStr's own entry in onboarding.checklist, then flags generateScrollPending if readiness to generate just flipped on.


			const curCheObj = { ...( ( curStaObj.onboarding && curStaObj.onboarding.checklist ) || {} ) }; // What: Current Checklist Object. Why: The resolve/unresolve below must patch a COPY, never curStaObj.onboarding.checklist directly. How: This shallow-copies curStaObj's own onboarding.checklist, defaulting to {}.


			if ( patValObj ) curCheObj[ iteIdeStr ] = patValObj; // What: Resolve Branch. Why: A truthy patValObj resolves the item, giving it a real value. How: This writes patValObj onto curCheObj[iteIdeStr].

			else delete curCheObj[ iteIdeStr ]; // What: Unresolve Branch. Why: A falsy patValObj (null/undefined) unchecks the item back to pending. How: This deletes curCheObj[iteIdeStr] entirely.



			const nexStaObj = { // What: Next State Object. Why: The caller needs a fresh state with the patched checklist written on. How: This spreads curStaObj with onboarding's own checklist replaced by curCheObj.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the onboarding override below.

				onboarding : { // What: Onboarding Override. Why: Only the checklist map inside onboarding changes, every sibling onboarding field must survive. How: This rebuilds onboarding from its own current fields plus the patched checklist.


					...( curStaObj.onboarding || {} ), // What: Current Onboarding Spread. Why: Every other onboarding field (welcome/tour flags, appFeatures, ...) must carry over unchanged. How: This spreads curStaObj.onboarding, defaulting to {} for state that predates it.

					checklist : curCheObj // What: Checklist. Why: The resolve/unresolve above must land in state. How: This is curCheObj.


				}


			};


			if ( !ONB_CHE_OBJ.reaGenFun( curStaObj ) && ONB_CHE_OBJ.reaGenFun( nexStaObj ) ) { // What: Ready-To-Generate Edge Guard. Why: tab-today.jsx's own auto-scroll needs to know the EXACT moment readiness just flipped on, not merely that it's on now. How: This flags generateScrollPending only when curStaObj was not-yet-ready and nexStaObj now is.


				nexStaObj.onboarding.generateScrollPending = true; // What: Generate-Scroll-Pending Flag Set. Why: TabTodCom consumes (and clears) this the next time it renders with it true, per its own migStaFun() comment. How: This flips nexStaObj.onboarding.generateScrollPending to true.


			}



			return nexStaObj; // What: Next State Return. Why: The caller needs the fully-patched state. How: This returns nexStaObj, built above.


		} ),

		// #endregion setCarFun



		setFeaFun : ( iteIdeStr, patValObj ) => setAppStaObj( ( curStaObj ) => { // What: Set Feature Function. Why: App Features tutorials (see onboarding/app-features.jsx) resolve independently of the checklist, in their own separate map, for the same reasons documented on its own migStaFun() backfill. How: This mirrors setCarFun's own resolve/unresolve shape, but against onboarding.appFeatures instead.


			const appFeaObj = { ...( ( curStaObj.onboarding && curStaObj.onboarding.appFeatures ) || {} ) }; // What: App Features Object. Why: The resolve/unresolve below must patch a COPY, never curStaObj.onboarding.appFeatures directly. How: This shallow-copies curStaObj's own onboarding.appFeatures, defaulting to {}.


			if ( patValObj ) appFeaObj[ iteIdeStr ] = patValObj; // What: Resolve Branch. Why: A truthy patValObj resolves the item, giving it a real value. How: This writes patValObj onto appFeaObj[iteIdeStr].

			else delete appFeaObj[ iteIdeStr ]; // What: Unresolve Branch. Why: A falsy patValObj (null/undefined) unchecks the item back to pending. How: This deletes appFeaObj[iteIdeStr] entirely.



			return { // What: Next State Return. Why: The caller needs a fresh state with the patched appFeatures written on. How: This spreads curStaObj with onboarding's own appFeatures replaced by appFeaObj.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the onboarding override below.

				onboarding : { // What: Onboarding Override. Why: Only the appFeatures map inside onboarding changes, every sibling onboarding field must survive. How: This rebuilds onboarding from its own current fields plus the patched appFeatures.


					...( curStaObj.onboarding || {} ), // What: Current Onboarding Spread. Why: Every other onboarding field (checklist, welcome/tour flags, ...) must carry over unchanged. How: This spreads curStaObj.onboarding, defaulting to {} for state that predates it.

					appFeatures : appFeaObj // What: App Features. Why: The resolve/unresolve above must land in state. How: This is appFeaObj.


				}


			};


		} ),



		setOnbFun : ( patValObj ) => setAppStaObj( ( curStaObj ) => ( { // What: Set Onboarding Function. Why: The welcome modal/mini-tour checklist need to flip individual flags without callers re-specifying the whole onboarding object. How: This merges patValObj onto curStaObj.onboarding, defaulting to {} when onboarding doesn't exist yet.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			onboarding : { // What: Onboarding. Why: Only the flags in patValObj change, every other onboarding field must survive. How: This rebuilds onboarding from its own current fields with patValObj merged on top.


				...( curStaObj.onboarding || {} ), // What: Current Onboarding Spread. Why: Every onboarding flag the patch doesn't mention must carry over unchanged. How: This spreads curStaObj.onboarding, defaulting to {} for state that predates it.
				...patValObj                       // What: Patch Spread. Why: The caller's own flags must override the current ones. How: This spreads patValObj last, so its keys win.


			}


		} ) ),

		// #endregion Onboarding



		// #region Pickers

		// #region addPicFun

		/**
		 * addPicFun = Add Picker Function
		 *
		 * @summary
		 * Creates a brand-new picker from the Add-Picker flow. Builds a
		 * fresh pool (Option B): each typed item becomes a new item owned
		 * by this picker via pickerId. For ease modes each item carries its
		 * OWN drift band; the picker-level easeMin/easeMax is just a
		 * fallback span. Initial drift value depends on mode: ease-down
		 * items start "charged" at the threshold, else 0. replaceId
		 * updates THIS existing picker in place (same id) instead of
		 * appending a new one, used when a picker mini-tour is replayed
		 * after already finishing once; keeping the id alive is what makes
		 * it "the same picker" rather than a renamed-on-collision
		 * duplicate, so Stats history/pick log/daily generator membership
		 * all keep pointing at it. Returns the new (or reused) picker id.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param picArgObj - Picker Argument Object: The new picker's fields, items
		 *                    and options.
		 *
		 * @returns The created (or replaced) picker's own id.
		 * @see {@link picIdeStr}
		 *
		 * @example
		 * ```ts
		 * addPicFun(picArgObj) // => picIdeStr
		 * ```
		 *
		*/

		addPicFun : ( picArgObj ) => { // What: Add Picker Function. Why: The Add-Picker flow needs to create a whole picker, its own item pool, and any new conditional in one step. How: This normalizes the submitted fields, builds the picker and its items, attaches or creates its conditional, updates daily membership, and returns the new (or replaced) picker's id.


			try { // What: First-Picker Persistence Request Guard. Why: The first picker a user creates is the first data worth protecting from browser storage eviction, best asked for now rather than on a cold first load (where a denial would be sticky for the session). How: This calls PWA_NAM_OBJ.askFirFun only when this is genuinely the user's very first picker.


				const curLatObj = latStaRef.current; // What: Current Latest Object. Why: The check below needs the freshest state, not a possibly-stale closed-over one. How: This reads latStaRef's own current value.


				if ( PWA_NAM_OBJ && curLatObj && ( curLatObj.pickers || [] ).length === 0 ) PWA_NAM_OBJ.askFirFun(); // What: First-Picker Call Guard. Why: Only an account with zero existing pickers is about to create its own first one. How: This calls PWA_NAM_OBJ.askFirFun only when PWA_NAM_OBJ/curLatObj exist and curLatObj.pickers is empty.


			}

			catch ( errCatObj ) {} // What: Persistence-Request Failure Guard. Why: A failed permission request must never block picker creation itself. How: This swallows the error silently.



			const picIdeStr = picArgObj.replaceId || picArgObj.id || ( 'pkr_' + Math.random().toString( 36 ).slice( 2, 8 ) ); // What: Picker Id String. Why: An explicit id (onboarding's own sample pickers only, so their ids match the ones baked into precomputed Stats history) must win; every other caller gets a fresh random one. How: This prefers picArgObj.replaceId, then id, else mints a fresh 'pkr_' id.
			const iniValNum = picArgObj.mode === 'ease-down' ? 100 : 0;                                                       // What: Initial Value Number. Why: Every new item's own starting drift value depends on the picker's own mode. How: This is 100 for ease-down (starts "charged"), else 0.
			const isaEasBoo = picArgObj.mode === 'ease-up' || picArgObj.mode === 'ease-down';                                 // What: Is-An Ease Boolean. Why: Only an ease-mode item carries its own per-item drift band. How: This is true when mode is either ease-up or ease-down.
			const isaDowBoo = picArgObj.mode === 'ease-down';                                                                 // What: Is-A Down Boolean. Why: Only ease-down forces every item to a uniform starting weight of 1 regardless of any user-supplied weight. How: This is true only when mode is 'ease-down'.

			const newConObj = picArgObj.newConditional; // What: New Conditional Object. Why: The inline-conditional build below reads many of this one field's own properties. How: This reads picArgObj.newConditional, which is null/undefined when no inline conditional was authored.

			const newIteArr = ( picArgObj.items || [] ).map( ( curIteObj ) => ( { // What: New Item Array. Why: Every typed item in the create form becomes a real item object owned by this picker. How: This maps each raw item into state.items' own shape, honoring a form-set value/vacation and defaulting the rest per mode.


				id         : curIteObj.id || ( 'it_' + Math.random().toString( 36 ).slice( 2, 8 ) ), // What: Id. Why: Every item needs a stable id. How: This keeps curIteObj.id when given, else mints a random 'it_' id.
				lastPicked : null,                                                                   // What: Last Picked. Why: A brand-new item has never been picked. How: This is null.
				name       : curIteObj.name,                                                         // What: Name. Why: The item keeps whatever name was typed into the create form. How: This is curIteObj.name.
				pickerId   : picIdeStr,                                                              // What: Picker Id. Why: Every item belongs to exactly this picker. How: This is picIdeStr.
				picks      : 0,                                                                      // What: Picks. Why: A brand-new item has never been picked. How: This is 0.
				vacation   : !!curIteObj.vacation,                                                   // What: Vacation. Why: A form-set vacation flag must be honored. How: This coerces curIteObj.vacation to a real boolean.
				value      : curIteObj.value != null ? curIteObj.value : iniValNum,                  // What: Value Honor-Or-Default. Why: A value the create form already set (e.g. Fill/Refill charging an ease item to threshold) must be honored; otherwise the mode's own default applies. How: This uses curIteObj.value when it isn't null/undefined, else iniValNum.
				weight     : isaDowBoo ? 1 : ( curIteObj.weight || 1 ),                              // What: Weight. Why: Ease Down forces every item to a uniform starting weight while other modes honor a form-set one. How: This is 1 for ease-down, else curIteObj.weight defaulting to 1.

				...( isaEasBoo ? { // What: Drift Band Spread. Why: Only an ease-mode item carries its own per-item drift band. How: This adds easeMin/easeMax (defaulting to 7/14) only when isaEasBoo is true.


					easeMax : curIteObj.easeMax ?? 14, // What: Ease Max. Why: An ease-mode item needs the upper end of its own drift band. How: This reads curIteObj.easeMax, defaulting to 14.
					easeMin : curIteObj.easeMin ?? 7   // What: Ease Min. Why: An ease-mode item needs the lower end of its own drift band. How: This reads curIteObj.easeMin, defaulting to 7.


				} : {} )


			} ) );

			const madConObj = newConObj ? { // What: Made Conditional Object. Why: A brand-new inline conditional (authored inline in this same form) needs its own fresh id minted here so the picker below can attach to it. How: This builds a full conditional object from newConObj's own fields, mirroring addConFun's own defaults.


				active       : newConObj.active !== undefined ? newConObj.active : true,                                     // What: Active. Why: A new conditional is enabled unless the form says otherwise. How: This honors newConObj.active when given, else defaults to true.
				cardText     : newConObj.cardText || 'Day off',                                                              // What: Card Text. Why: The day-off card shown on Today needs its own display text. How: This reads newConObj.cardText, defaulting to 'Day off'.
				chargedToday : false,                                                                                        // What: Charged Today. Why: A brand-new conditional hasn't charged yet today, so its per-day charge guard starts clear. How: This is false.
				easeMax      : newConObj.easeMax ?? 14,                                                                      // What: Ease Max. Why: An ease-mode conditional needs the upper end of its own drift band. How: This reads newConObj.easeMax, defaulting to 14.
				easeMin      : newConObj.easeMin ?? 7,                                                                       // What: Ease Min. Why: An ease-mode conditional needs the lower end of its own drift band. How: This reads newConObj.easeMin, defaulting to 7.
				id           : 'cnd_' + Math.random().toString( 36 ).slice( 2, 8 ),                                          // What: Id. Why: The picker below attaches to this conditional by id, so it must exist before the picker is built. How: This mints a random 'cnd_' id.
				mode         : newConObj.mode || 'random',                                                                   // What: Mode. Why: The mode decides how this conditional rolls or charges each day. How: This reads newConObj.mode, defaulting to 'random'.
				name         : ( norConFun && norConFun( newConObj.name ) ) || newConObj.name || 'Conditional',              // What: Name. Why: The conditional needs a tidied display name. How: This title-cases newConObj.name via norConFun, falling back to the raw name, then 'Conditional'.
				oddsPct      : newConObj.oddsPct ?? 50,                                                                      // What: Odds Percent. Why: A probability-mode conditional needs its own daily firing odds. How: This reads newConObj.oddsPct, defaulting to 50.
				threshold    : newConObj.threshold ?? 100,                                                                   // What: Threshold. Why: An ease-mode conditional charges toward (or decays from) this value. How: This reads newConObj.threshold, defaulting to 100.
				triggered    : newConObj.triggered !== undefined ? newConObj.triggered : ( newConObj.mode === 'ease-down' ), // What: Triggered. Why: A new conditional starts firing only when it's ease-down, which starts charged. How: This honors newConObj.triggered when given, else defaults to whether mode is 'ease-down'.
				value        : newConObj.mode === 'ease-down' ? ( newConObj.threshold ?? 100 ) : ( newConObj.value ?? 0 ),   // What: Value. Why: Ease Down starts fully charged at its threshold while every other mode starts from its own given value. How: This is the threshold (default 100) for ease-down, else newConObj.value (default 0).
				weight       : newConObj.weight ?? 1                                                                         // What: Weight. Why: A weighted conditional needs its own draw weight. How: This reads newConObj.weight, defaulting to 1.


			} : null;

			const norCadObj = CAD_NAM_OBJ.norCadFun({ // What: Normalized Cadence Object. Why: The schedule resolve and the cadence spread below both need the same normalized cadence fields. How: This calls CAD_NAM_OBJ.norCadFun once with picArgObj's own 8 cadence fields, reused by both the daysOfWeek resolve and the cadence spread below.


				anchorDay   : picArgObj.anchorDay,   // What: Anchor Day. Why: A yearly cadence needs its own day of the month. How: This passes picArgObj.anchorDay through.
				anchorDom   : picArgObj.anchorDom,   // What: Anchor Dom. Why: A monthly cadence needs its own day of the month. How: This passes picArgObj.anchorDom through.
				anchorDow   : picArgObj.anchorDow,   // What: Anchor Dow. Why: A weekly cadence needs its own day of the week. How: This passes picArgObj.anchorDow through.
				anchorMonth : picArgObj.anchorMonth, // What: Anchor Month. Why: A yearly cadence needs its own month. How: This passes picArgObj.anchorMonth through.
				cadence     : picArgObj.cadence,     // What: Cadence. Why: This decides whether the picker surfaces daily, weekly, monthly, or yearly. How: This passes picArgObj.cadence through; norCadFun itself defaults a missing one to 'daily'.
				dateMode    : picArgObj.dateMode,    // What: Date Mode. Why: A monthly/yearly cadence can anchor on a date or an nth weekday. How: This passes picArgObj.dateMode through.
				nthOrdinal  : picArgObj.nthOrdinal,  // What: Nth Ordinal. Why: An nth-weekday anchor needs which occurrence (1st, 2nd, ...). How: This passes picArgObj.nthOrdinal through.
				nthWeekday  : picArgObj.nthWeekday   // What: Nth Weekday. Why: An nth-weekday anchor needs which weekday. How: This passes picArgObj.nthWeekday through.


			});

			const newPicObj = { // What: New Picker Object. Why: This is the actual picker being created (or, with replaceId, re-created in place). How: This bundles the given fields with schedule/gate/visibility defaults resolved below.


				avoidDuplicates : !!picArgObj.avoidDuplicates,                                    // What: Avoid-Duplicates Flag. Why: This excludes an item from this picker's own pool for the day if its name (case-insensitively) is already present elsewhere on today's list. How: This coerces picArgObj.avoidDuplicates to a real boolean; see pickers.js's own pick() for how it's applied.
				conditionalId   : madConObj ? madConObj.id : ( picArgObj.conditionalId || null ), // What: Conditional Id Resolve. Why: A freshly-made inline conditional wins over an explicitly-passed existing one. How: This prefers madConObj's own id, else picArgObj.conditionalId, else null.
				easeMax         : picArgObj.easeMax ?? 20,                                        // What: Ease Max. Why: The picker-level drift band is only a fallback span for its items. How: This reads picArgObj.easeMax, defaulting to 20.
				easeMin         : picArgObj.easeMin ?? 10,                                        // What: Ease Min. Why: The picker-level drift band is only a fallback span for its items. How: This reads picArgObj.easeMin, defaulting to 10.
				group           : picArgObj.group,                                                // What: Group. Why: The picker must land in the group chosen in the form. How: This is picArgObj.group.
				hidden          : picArgObj.hidden === undefined ? false : picArgObj.hidden,      // What: Hidden Flag. Why: tab-picker.jsx passes true while the mini-tour checklist is up (mirrors reminders-section.jsx's own staAddFun) so a picker created during onboarding stays out of the real list until the closing Generate step. How: This copies picArgObj.hidden, defaulting to false when it was never given.
				id              : picIdeStr,                                                      // What: Id. Why: The picker keeps whichever id was resolved above (replaceId, a given id, or a fresh one). How: This is picIdeStr.
				mode            : picArgObj.mode,                                                 // What: Mode. Why: The mode decides which selection algorithm this picker uses. How: This is picArgObj.mode.
				name            : picArgObj.name,                                                 // What: Name. Why: This is the raw name; the de-duplicated one replaces it below, once state is available. How: This is picArgObj.name.
				skipHolidays    : !!picArgObj.skipHolidays,                                       // What: Skip Holidays. Why: The generator must know whether this picker sits out public holidays. How: This coerces picArgObj.skipHolidays to a real boolean.
				threshold       : 100,                                                            // What: Threshold. Why: Every new picker starts with the standard full-charge threshold. How: This is 100.

				daysOfWeek : CAD_NAM_OBJ.enfWeeFun({ // What: Daily-Generator Schedule. Why: Which weekdays this picker may run on must be resolved before the generator can use it. How: This calls CAD_NAM_OBJ.enfWeeFun over norCadObj plus an explicit daysOfWeek, defaulting to every day.


					...norCadObj, // What: Normalized Cadence Spread. Why: enfWeeFun needs the picker's own resolved cadence and anchor to force a weekly picker's anchor day into its days. How: This spreads norCadObj before the daysOfWeek override below.

					daysOfWeek : Array.isArray( picArgObj.daysOfWeek ) && picArgObj.daysOfWeek.length ? picArgObj.daysOfWeek : [ 0, 1, 2, 3, 4, 5, 6 ] // What: Days Of Week. Why: An empty or missing selection must mean every day, never no day. How: This uses picArgObj.daysOfWeek when it's a non-empty array, else all 7 days.


				} ),

				...norCadObj,                                                                                 // What: Normalized Cadence Spread. Why: The surfacing anchor and display unit must be resolved (and defaulted) the same way for every picker. How: This spreads norCadObj's own 8 cadence fields onto the picker.
				...( picArgObj.createdFromSample ? { createdFromSample : picArgObj.createdFromSample } : {} ) // What: Created-From-Sample Spread. Why: This links back to the sample template a mini-tour-created picker was built from (see onboarding-checklist.js); ignored everywhere else in the app. How: This spreads createdFromSample only when it was actually given.


			};


			setAppStaObj( ( curStaObj ) => { // What: State Update Call. Why: The name de-duplication and the replace-or-append writes all need the latest state. How: This runs an updater that finalizes the picker's name, then writes items/pickers/conditionals/daily together.


				// #region finNamStr

				/**
				 * finNamStr = Final Name String
				 *
				 * @summary
				 * Tidies and de-duplicates the picker name against existing,
				 * VISIBLE pickers only (same policy as items/reminders, but
				 * scoped globally since picker names are container-style
				 * identifiers shown across every tab). Hidden ones
				 * (onboarding's own sample pickers) are excluded: they're
				 * invisible reference data the user can't see or tell apart
				 * from, so a collision with something the user doesn't know
				 * exists shouldn't cost a real picker an ugly " (2)" suffix
				 * (seen concretely: the Picker mini-tour's own "Create
				 * Picker" step recreates a sample by name, e.g. "Daily
				 * Chores"). Excludes itself too, so a replaceId update
				 * keeping the same name never collides with its own prior
				 * name.
				 *
				 * Skipped entirely (name kept verbatim) when THIS call is
				 * (re)seeding a sample itself, i.e. id is one of onboarding's
				 * own fixed sample ids. A freshly (re)seeded sample starts
				 * out visible (hidden defaults false; the tour's own later
				 * step is what hides it), so if a real picker already
				 * happens to share its exact name, the dedup below would
				 * otherwise rename the SAMPLE before onboarding's own name-
				 * collision suppression (tab-today.jsx's groupEntries) ever
				 * runs, which compares against the sample's own exact,
				 * canonical name; that would silently defeat the
				 * suppression instead of triggering it, since the renamed
				 * sample would no longer match anything, so its own
				 * "already have one" tutorial card would keep offering
				 * itself.
				 *
				 * @author z4nta0 <https://github.com/z4nta0>
				 *
				*/

				const finNamStr = ONB_SPI_ARR.includes( picArgObj.id ) ? ( norPicFun( picArgObj.name ) || picArgObj.name ) : uniNamFun( // What: Final Name String. Why: Onboarding sample pickers keep their exact names; every other picker needs a unique name. How: This tidies the name for a sample picker, else de-duplicates it against the other visible pickers.
					norPicFun( picArgObj.name ) || picArgObj.name,                                                                                      // What: Tidied Name Argument. Why: The de-duplication starts from the tidied name. How: This normalizes picArgObj.name, falling back to the raw name.
					curStaObj.pickers.filter( ( curPicObj ) => !curPicObj.hidden && curPicObj.id !== picIdeStr ).map( ( curPicObj ) => curPicObj.name ) // What: Sibling Names Argument. Why: The new name must not collide with another visible picker. How: This lists every other visible picker's own name.
				);

				// #endregion finNamStr



				const finPicObj = { ...newPicObj, name : finNamStr }; // What: Final Picker Object. Why: The picker actually written to state must carry the de-duplicated name, not the raw one. How: This spreads newPicObj with name replaced by finNamStr.

				const nexPidArr = ( picArgObj.includeInDaily === undefined ? true : picArgObj.includeInDaily ) // What: Next Picker-Ids Array. Why: picArgObj.includeInDaily (defaulting to true) decides whether this picker joins or leaves the Daily generator's own membership list. How: This adds picIdeStr when it's included and it isn't already present, else removes it.
					? ( curStaObj.daily.pickerIds.includes( picIdeStr ) ? curStaObj.daily.pickerIds : [ ...curStaObj.daily.pickerIds, picIdeStr ] ) // What: Include Branch. Why: The picker joins the Daily generator. How: This appends picIdeStr unless it's already listed.
					: curStaObj.daily.pickerIds.filter( ( curPidStr ) => curPidStr !== picIdeStr );                                                 // What: Exclude Branch. Why: The picker leaves the Daily generator. How: This filters picIdeStr out.



				return { // What: Next State Return. Why: The caller needs items/pickers/conditionals/daily all updated together, honoring picArgObj.replaceId's own "recreate but keep the id" semantics when given. How: This spreads curStaObj, replacing or appending each field depending on whether picArgObj.replaceId was given.


					...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

					conditionals : madConObj ? [ ...( curStaObj.conditionals || [] ), madConObj ] : ( curStaObj.conditionals || [] ), // What: Conditionals. Why: A freshly-made inline conditional must be saved alongside the picker that uses it. How: This appends madConObj when there is one, else keeps the existing list.
					daily        : { ...curStaObj.daily, pickerIds : nexPidArr },                                                     // What: Daily. Why: The picker's own daily-generator membership must be updated. How: This spreads curStaObj.daily with pickerIds replaced by nexPidArr.

					items : picArgObj.replaceId // What: Items Replace-Or-Append. Why: On a replace, the picker's own OLD items are dropped wholesale and rebuilt from this run's own payload, not merged with whatever was there before. How: This drops picArgObj.replaceId's own old items then appends newIteArr, or simply appends newIteArr when there's no picArgObj.replaceId.
						? [ ...curStaObj.items.filter( ( curIteObj ) => curIteObj.pickerId !== picArgObj.replaceId ), ...newIteArr ] // What: Replace Items Branch. Why: A replayed tour rebuilds its picker's items from scratch. How: This drops the old picker's items, then appends the new ones.
						: [ ...curStaObj.items, ...newIteArr ],                                                                      // What: Append Items Branch. Why: A fresh picker only adds items. How: This appends the new items.

					pickers : picArgObj.replaceId // What: Pickers Replace-Or-Append. Why: On a replace, the picker keeps its own slot and id instead of appearing twice. How: This swaps finPicObj in for the picker matching picArgObj.replaceId, or appends finPicObj when there's no replace.
						? curStaObj.pickers.map( ( curPicObj ) => curPicObj.id === picArgObj.replaceId ? finPicObj : curPicObj ) // What: Replace Picker Branch. Why: A replayed tour keeps its picker's slot and id. How: This swaps finPicObj in for the matching picker.
						: [ ...curStaObj.pickers, finPicObj ]                                                                    // What: Append Picker Branch. Why: A fresh picker goes at the end. How: This appends finPicObj.


				};


			} );



			return picIdeStr; // What: Picker Id Return. Why: The caller (the Add-Picker form) needs the new or reused picker's own id back. How: This returns picIdeStr, resolved above.


		},

		// #endregion addPicFun



		// #region delPicFun

		/**
		 * delPicFun = Delete Picker Function
		 *
		 * @summary
		 * Deletes a picker together with every item it owns, and unhooks it from
		 * the Daily generator and from Today. Only today's own live log rows are
		 * purged, so the picker's history stays in Stats.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param picIdeStr - Picker Identifier String: The picker to delete.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * delPicFun(picIdeStr) // => void
		 * ```
		 *
		*/

		delPicFun : ( picIdeStr ) => setAppStaObj( ( curStaObj ) => { // What: Delete Picker Function. Why: Deleting a picker must also delete every item it owns (items are tied to one picker), and unhook it from both the daily generator and today's list. How: This filters items/pickers/entries/pickerIds, and purges only today's own live pick-log rows (keeping history intact).


			const curDayStr = isoDayFun(); // What: Current Day String. Why: The pick-log purge below only drops TODAY's own rows, keeping history intact. How: This reads isoDayFun().



			return { // What: Next State Return. Why: Every field this picker touches must be cleaned up together. How: This spreads curStaObj, filtering items/pickers/daily.pickerIds/today.entries/pickLog.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				items   : curStaObj.items.filter( ( curIteObj ) => curIteObj.pickerId !== picIdeStr ),                                                  // What: Items. Why: Items belong to exactly one picker, so every item this picker owned goes with it. How: This filters out every item whose own pickerId matches picIdeStr.
				pickers : curStaObj.pickers.filter( ( curPicObj ) => curPicObj.id !== picIdeStr ),                                                      // What: Pickers. Why: The deleted picker must actually be gone from state. How: This filters out the picker matching picIdeStr.
				pickLog : ( curStaObj.pickLog || [] ).filter( ( curRowObj ) => !( curRowObj.pickerId === picIdeStr && curRowObj.date === curDayStr ) ), // What: Pick-Log Purge. Why: Historical rows are kept (denormalized survivability); only today's own live ones for this picker are dropped. How: This filters out rows matching both pickerId and curDayStr.

				daily : { // What: Daily. Why: The deleted picker must leave the daily generator's own membership list. How: This rebuilds daily with only its pickerIds replaced.


					...curStaObj.daily, // What: Current Daily Spread. Why: Every other daily setting (mode, run time, ...) must carry over unchanged. How: This spreads curStaObj.daily before the pickerIds override below.

					pickerIds : ( curStaObj.daily.pickerIds || [] ).filter( ( curPidStr ) => curPidStr !== picIdeStr ) // What: Picker Ids. Why: The deleted picker's id must not linger in the generator's list. How: This filters picIdeStr out of daily.pickerIds, defaulting to [].


				},

				today : { // What: Today. Why: The deleted picker's own entries must leave today's list. How: This rebuilds today with only its entries replaced.


					...curStaObj.today, // What: Current Today Spread. Why: Every other today field must carry over unchanged. How: This spreads curStaObj.today before the entries override below.

					entries : ( curStaObj.today.entries || [] ).filter( ( curEntObj ) => curEntObj.pickerId !== picIdeStr ) // What: Entries. Why: No Today entry may keep pointing at a deleted picker. How: This filters out every entry whose own pickerId matches picIdeStr, defaulting to [].


				}


			};


		} ),

		// #endregion delPicFun



		// #region filPicFun

		/**
		 * filPicFun = Fill Picker Function
		 *
		 * @summary
		 * Fill RAISES to the threshold; it must never pull a value down.
		 * Ease Up items keep charging past the threshold while they wait,
		 * and that overshoot is what orders them (highest value is picked
		 * first, and re-roll cycles highest-to-lowest); assigning the
		 * threshold flat-out would erase that ordering and reset every
		 * waiting item to a tie. Ease Down values only ever decay from the
		 * threshold, so the max() below is a no-op there. A full recharge
		 * also clears any in-progress ease-down item.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param picIdeStr - Picker Identifier String: The picker to fill.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * filPicFun(picIdeStr) // => void
		 * ```
		 *
		*/

		filPicFun : ( picIdeStr ) => setAppStaObj( ( curStaObj ) => { // What: Fill Picker Function. Why: The Fill/Refill button needs to bring every item in a picker back to full charge at once. How: This raises every owned item's value to at least the threshold (never lowering an Ease Up overshoot) and clears any in-progress ease-down item.


			const curPicObj = curStaObj.pickers.find( ( picFinObj ) => picFinObj.id === picIdeStr ); // What: Current Picker Object And Guard. Why: A stale picIdeStr (already removed) must be a no-op. How: This looks up picIdeStr in curStaObj.pickers.


			if ( !curPicObj ) return curStaObj; // What: Missing-Picker Guard. Why: There's nothing to refill when curPicObj wasn't found. How: This returns curStaObj unchanged.



			const thrValNum = curPicObj.threshold ?? 100; // What: Threshold Value Number. Why: Every owned item's own value below must be raised to (at least) this exact number. How: This reads curPicObj's own threshold, defaulting to 100.



			return { // What: Next State Return. Why: The caller needs every owned item's own value raised (never lowered), and any in-progress ease-down item cleared. How: This spreads curStaObj with items/pickers replaced.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				items   : curStaObj.items.map( ( curIteObj ) => curIteObj.pickerId === picIdeStr ? { ...curIteObj, value : Math.max( curIteObj.value ?? 0, thrValNum ) } : curIteObj ), // What: Items. Why: Every owned item must be raised to full charge, but an Ease Up overshoot above the threshold must never be pulled back down. How: This sets each owned item's value to the larger of its current value and thrValNum.
				pickers : curStaObj.pickers.map( ( picMapObj ) => picMapObj.id === picIdeStr ? { ...picMapObj, activeItemId : null } : picMapObj )                                      // What: Pickers. Why: A full recharge ends any in-progress ease-down item, so the picker must stop pointing at one. How: This nulls activeItemId on the picker matching picIdeStr.


			};


		} ),

		// #endregion filPicFun



		// #region renPicFun

		/**
		 * renPicFun = Rename Picker Function
		 *
		 * @summary
		 * Commits a picker rename (on blur, Enter or Save). The name is tidied to
		 * Title Case and de-duplicated against every other picker, so the saved
		 * name can differ from what was typed.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param picIdeStr - Picker Identifier String: The picker to rename.
		 * @param newNamStr - New Name String: The name as typed.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * renPicFun(picIdeStr, newNamStr) // => void
		 * ```
		 *
		*/

		renPicFun : ( picIdeStr, newNamStr ) => setAppStaObj( ( curStaObj ) => { // What: Rename Picker Function. Why: Commit-time picker rename (blur/Enter/Save only): tidy to Title Case and de-duplicate against every OTHER picker so 2 can't share a display name. How: This resolves a unique tidied name, then writes it onto the one matching picker.


			const sibNamArr = curStaObj.pickers.filter( ( curPicObj ) => curPicObj.id !== picIdeStr ).map( ( curPicObj ) => curPicObj.name ); // What: Sibling Name Array. Why: A picker name only needs to be unique among every OTHER picker. How: This filters curStaObj.pickers to every picker but the one being renamed, then maps to their own names.
			const tidNamStr = ( norPicFun && norPicFun( newNamStr ) ) || newNamStr;                                                           // What: Tidied Name String. Why: The name must be normalized to Title Case before the collision check below. How: This calls norPicFun when available, else falls back to newNamStr.
			const uniNamStr = uniNamFun( tidNamStr, sibNamArr );                                                                              // What: Unique Name String. Why: The write below needs the actual de-duplicated name to apply. How: This calls uniNamFun with tidNamStr and sibNamArr.



			return { // What: Next State Return. Why: The caller needs the one matching picker's own name replaced. How: This spreads curStaObj with pickers rebuilt, patching only the one matching picker.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				pickers : curStaObj.pickers.map( ( curPicObj ) => curPicObj.id === picIdeStr ? { ...curPicObj, name : uniNamStr } : curPicObj ) // What: Pickers. Why: Only the one matching picker's own name changes. How: This writes uniNamStr as name on the picker matching picIdeStr.


			};


		} ),

		// #endregion renPicFun



		// #region savEdiFun

		/**
		 * savEdiFun = Save Edit Function
		 *
		 * @summary
		 * Commits an edit made via the Pickers page's own "Edit" button,
		 * which reuses NewPickerForm's own Details step (items aren't
		 * touched by this flow; those are edited via the Data tab or the
		 * live Pickers-tab pool instead). Mirrors addPicFun's own field
		 * normalization (name dedup, cadence/days, conditional attach) but
		 * as an in-place UPDATE, and additionally resets every one of this
		 * picker's own items to fresh defaults for the NEW mode whenever
		 * mode actually changes: an item's own weight/value/easeMin/easeMax
		 * from the OLD mode has no meaningful translation to the new one
		 * (e.g. a Weighted item's own weight doesn't mean anything as an
		 * Ease Up drift band). This deliberately resets rather than tries
		 * to preserve old values; the user can revisit the item list after
		 * saving to tune them for the new mode.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param picIdeStr - Picker Identifier String: The picker being edited.
		 * @param picArgObj - Picker Argument Object: The edited picker's fields.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * savEdiFun(picIdeStr, picArgObj) // => void
		 * ```
		 *
		*/

		savEdiFun : ( picIdeStr, picArgObj ) => setAppStaObj( ( curStaObj ) => { // What: Save Edit Function. Why: The Pickers page's own Edit button needs to save changed picker details in place, keeping its id and history. How: This mirrors addPicFun's own normalization as an in-place update, resetting every owned item to fresh defaults whenever mode actually changes.


			const curPicObj = curStaObj.pickers.find( ( picFinObj ) => picFinObj.id === picIdeStr ); // What: Current Picker Object And Guard. Why: A stale picIdeStr (already removed) must be a no-op. How: This looks up picIdeStr in curStaObj.pickers.


			if ( !curPicObj ) return curStaObj; // What: Missing-Picker Guard. Why: There's nothing to edit when curPicObj wasn't found. How: This returns curStaObj unchanged.



			const modChaBoo = picArgObj.mode !== curPicObj.mode; // What: Mode Changed Boolean. Why: Only an actual mode change triggers the item-defaults reset further below. How: This is true when the new mode differs from curPicObj's own current one.
			const newConObj = picArgObj.newConditional;          // What: New Conditional Object. Why: The inline-conditional build below reads many of this one field's own properties. How: This reads picArgObj.newConditional, which is null/undefined when no inline conditional was authored.


			const finNamStr = uniNamFun( // What: Final Name String. Why: The committed picker still needs its own name tidied and de-duplicated against every OTHER visible picker. How: This calls uniNamFun with the tidied name against every sibling picker's own name, excluding itself.
				norPicFun( picArgObj.name ) || picArgObj.name,                                                                                      // What: Tidied Name Argument. Why: The de-duplication starts from the tidied name. How: This normalizes picArgObj.name, falling back to the raw name.
				curStaObj.pickers.filter( ( picFilObj ) => !picFilObj.hidden && picFilObj.id !== picIdeStr ).map( ( picFilObj ) => picFilObj.name ) // What: Sibling Names Argument. Why: The edited name must not collide with another visible picker. How: This lists every other visible picker's own name.
			);


			const madConObj = newConObj ? { // What: Made Conditional Object. Why: A brand-new inline conditional authored inline in this same edit form needs its own fresh id, mirroring addPicFun's own madConObj. How: This builds a full conditional object from newConObj's own fields.


				active       : newConObj.active !== undefined ? newConObj.active : true,                                     // What: Active. Why: A new conditional is enabled unless the form says otherwise. How: This honors newConObj.active when given, else defaults to true.
				cardText     : newConObj.cardText || 'Day off',                                                              // What: Card Text. Why: The day-off card shown on Today needs its own display text. How: This reads newConObj.cardText, defaulting to 'Day off'.
				chargedToday : false,                                                                                        // What: Charged Today. Why: A brand-new conditional hasn't charged yet today, so its per-day charge guard starts clear. How: This is false.
				easeMax      : newConObj.easeMax ?? 14,                                                                      // What: Ease Max. Why: An ease-mode conditional needs the upper end of its own drift band. How: This reads newConObj.easeMax, defaulting to 14.
				easeMin      : newConObj.easeMin ?? 7,                                                                       // What: Ease Min. Why: An ease-mode conditional needs the lower end of its own drift band. How: This reads newConObj.easeMin, defaulting to 7.
				id           : 'cnd_' + Math.random().toString( 36 ).slice( 2, 8 ),                                          // What: Id. Why: The picker below attaches to this conditional by id, so it must exist before the picker is built. How: This mints a random 'cnd_' id.
				mode         : newConObj.mode || 'random',                                                                   // What: Mode. Why: The mode decides how this conditional rolls or charges each day. How: This reads newConObj.mode, defaulting to 'random'.
				name         : norConFun( newConObj.name ) || newConObj.name || 'Conditional',                               // What: Name. Why: The conditional needs a tidied display name. How: This title-cases newConObj.name via norConFun, falling back to the raw name, then 'Conditional'.
				oddsPct      : newConObj.oddsPct ?? 50,                                                                      // What: Odds Percent. Why: A probability-mode conditional needs its own daily firing odds. How: This reads newConObj.oddsPct, defaulting to 50.
				threshold    : newConObj.threshold ?? 100,                                                                   // What: Threshold. Why: An ease-mode conditional charges toward (or decays from) this value. How: This reads newConObj.threshold, defaulting to 100.
				triggered    : newConObj.triggered !== undefined ? newConObj.triggered : ( newConObj.mode === 'ease-down' ), // What: Triggered. Why: A new conditional starts firing only when it's ease-down, which starts charged. How: This honors newConObj.triggered when given, else defaults to whether mode is 'ease-down'.
				value        : newConObj.mode === 'ease-down' ? ( newConObj.threshold ?? 100 ) : ( newConObj.value ?? 0 ),   // What: Value. Why: Ease Down starts fully charged at its threshold while every other mode starts from its own given value. How: This is the threshold (default 100) for ease-down, else newConObj.value (default 0).
				weight       : newConObj.weight ?? 1                                                                         // What: Weight. Why: A weighted conditional needs its own draw weight. How: This reads newConObj.weight, defaulting to 1.


			} : null;


			const norCadObj = CAD_NAM_OBJ.norCadFun({ // What: Normalized Cadence Object. Why: The schedule resolve and the cadence spread below both need the same normalized cadence fields. How: This calls CAD_NAM_OBJ.norCadFun once with picArgObj's own 8 cadence fields, reused by both the daysOfWeek resolve and the cadence spread below.


				anchorDay   : picArgObj.anchorDay,   // What: Anchor Day. Why: A yearly cadence needs its own day of the month. How: This passes picArgObj.anchorDay through.
				anchorDom   : picArgObj.anchorDom,   // What: Anchor Dom. Why: A monthly cadence needs its own day of the month. How: This passes picArgObj.anchorDom through.
				anchorDow   : picArgObj.anchorDow,   // What: Anchor Dow. Why: A weekly cadence needs its own day of the week. How: This passes picArgObj.anchorDow through.
				anchorMonth : picArgObj.anchorMonth, // What: Anchor Month. Why: A yearly cadence needs its own month. How: This passes picArgObj.anchorMonth through.
				cadence     : picArgObj.cadence,     // What: Cadence. Why: This decides whether the picker surfaces daily, weekly, monthly, or yearly. How: This passes picArgObj.cadence through; norCadFun itself defaults a missing one to 'daily'.
				dateMode    : picArgObj.dateMode,    // What: Date Mode. Why: A monthly/yearly cadence can anchor on a date or an nth weekday. How: This passes picArgObj.dateMode through.
				nthOrdinal  : picArgObj.nthOrdinal,  // What: Nth Ordinal. Why: An nth-weekday anchor needs which occurrence (1st, 2nd, ...). How: This passes picArgObj.nthOrdinal through.
				nthWeekday  : picArgObj.nthWeekday   // What: Nth Weekday. Why: An nth-weekday anchor needs which weekday. How: This passes picArgObj.nthWeekday through.


			});


			const finPicObj = { // What: Final Picker Object. Why: This is curPicObj patched with every field this edit form can change. How: This spreads curPicObj, overriding name/group/mode/schedule/gate fields with the resolved values below.


				...curPicObj, // What: Current Picker Spread. Why: Every picker field this edit form can't change (id, threshold, activeItemId, ...) must carry over unchanged. How: This spreads curPicObj before the overrides below.

				avoidDuplicates : !!picArgObj.avoidDuplicates,                                    // What: Avoid Duplicates. Why: The edit form can toggle whether this picker skips items already on today's list. How: This coerces picArgObj.avoidDuplicates to a real boolean.
				conditionalId   : madConObj ? madConObj.id : ( picArgObj.conditionalId || null ), // What: Conditional Id Resolve. Why: Unlike addPicFun's own create-only flow, this can also DETACH a conditional the picker already had, so there's no bare "keep the old one" default to fall back on here. How: This prefers madConObj's own id, else the given conditionalId, else null.
				group           : picArgObj.group,                                                // What: Group. Why: The edit form can move the picker to another group. How: This is picArgObj.group.
				mode            : picArgObj.mode,                                                 // What: Mode. Why: The edit form can switch the picker's selection algorithm. How: This is picArgObj.mode.
				name            : finNamStr,                                                      // What: Name. Why: The committed name must be tidied and de-duplicated. How: This is finNamStr.
				skipHolidays    : !!picArgObj.skipHolidays,                                       // What: Skip Holidays. Why: The edit form can toggle whether this picker sits out public holidays. How: This coerces picArgObj.skipHolidays to a real boolean.

				daysOfWeek : CAD_NAM_OBJ.enfWeeFun({ // What: Daily-Generator Schedule. Why: The schedule must be re-resolved the same way addPicFun itself resolves it. How: This calls CAD_NAM_OBJ.enfWeeFun over norCadObj plus an explicit daysOfWeek, defaulting to every day.


					...norCadObj, // What: Normalized Cadence Spread. Why: enfWeeFun needs the picker's own resolved cadence and anchor to force a weekly picker's anchor day into its days. How: This spreads norCadObj before the daysOfWeek override below.

					daysOfWeek : Array.isArray( picArgObj.daysOfWeek ) && picArgObj.daysOfWeek.length ? picArgObj.daysOfWeek : [ 0, 1, 2, 3, 4, 5, 6 ] // What: Days Of Week. Why: An empty or missing selection must mean every day, never no day. How: This uses picArgObj.daysOfWeek when it's a non-empty array, else all 7 days.


				} ),

				...norCadObj // What: Normalized Cadence Spread. Why: The surfacing anchor and display unit must be resolved (and defaulted) the same way for every picker. How: This spreads norCadObj's own 8 cadence fields onto the picker.


			};


			const thrValNum = curPicObj.threshold ?? 100;             // What: Threshold Value Number. Why: An Ease Down picker's items reset to fully charged at its threshold. How: This reads curPicObj's own threshold, defaulting to 100.
			const modDefObj = modDefFun( picArgObj.mode, thrValNum ); // What: Mode Defaults Object. Why: Every item's own weight/value/drift-band must reset to sensible defaults for whichever mode was just switched to. How: This calls modDefFun with the new mode and this picker's threshold.


			const nexIteArr = modChaBoo // What: Next Item Array. Why: Only an ACTUAL mode change resets this picker's own items; an unchanged mode leaves every item's own tuning untouched. How: This maps curStaObj.items, merging modDefObj onto every item owned by picIdeStr, only when modChaBoo is true.
				? curStaObj.items.map( ( curIteObj ) => curIteObj.pickerId === picIdeStr ? { ...curIteObj, ...modDefObj } : curIteObj ) // What: Reset Items Branch. Why: A mode change resets this picker's own items. How: This spreads modDefObj onto each of its items.
				: curStaObj.items; // What: Unchanged Items Branch. Why: An unchanged mode keeps every item's tuning. How: This passes the items through.


			const nexPidArr = picArgObj.includeInDaily // What: Next Picker-Ids Array. Why: picArgObj.includeInDaily decides whether this picker joins or leaves the Daily generator's own membership list, same as addPicFun's own resolution. How: This adds picIdeStr when it's included and it isn't already present, else removes it.
				? ( curStaObj.daily.pickerIds.includes( picIdeStr ) ? curStaObj.daily.pickerIds : [ ...curStaObj.daily.pickerIds, picIdeStr ] ) // What: Include Branch. Why: The picker joins the Daily generator. How: This appends picIdeStr unless it's already listed.
				: curStaObj.daily.pickerIds.filter( ( curPidStr ) => curPidStr !== picIdeStr );                                                 // What: Exclude Branch. Why: The picker leaves the Daily generator. How: This filters picIdeStr out.



			return { // What: Next State Return. Why: The caller needs items/pickers/conditionals/daily all updated together. How: This spreads curStaObj, replacing each field with the values resolved above.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				conditionals : madConObj ? [ ...( curStaObj.conditionals || [] ), madConObj ] : ( curStaObj.conditionals || [] ), // What: Conditionals. Why: A freshly-made inline conditional must be saved alongside the picker that uses it. How: This appends madConObj when there is one, else keeps the existing list.
				daily        : { ...curStaObj.daily, pickerIds : nexPidArr },                                                     // What: Daily. Why: The picker's own daily-generator membership must be updated. How: This spreads curStaObj.daily with pickerIds replaced by nexPidArr.
				items        : nexIteArr,                                                                                         // What: Items. Why: A mode change resets this picker's own items. How: This is nexIteArr.
				pickers      : curStaObj.pickers.map( ( picMapObj ) => picMapObj.id === picIdeStr ? finPicObj : picMapObj )       // What: Pickers. Why: Only the edited picker is replaced. How: This swaps finPicObj in for the picker matching picIdeStr.


			};


		} ),

		// #endregion savEdiFun



		// #region updPicFun

		/**
		 * updPicFun = Update Picker Function
		 *
		 * @summary
		 * Merges a patch onto one picker, then re-derives its daysOfWeek through
		 * the weekly-day rule, so switching to Weekly (or changing its day)
		 * selects that day in the Days control automatically.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param picIdeStr - Picker Identifier String: The picker to patch.
		 * @param patValObj - Patch Value Object: The fields to merge onto the
		 *                    picker.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * updPicFun(picIdeStr, patValObj) // => void
		 * ```
		 *
		*/

		updPicFun : ( picIdeStr, patValObj ) => setAppStaObj( ( curStaObj ) => ( { // What: Update Picker Function. Why: Any patch touching cadence/anchorDow/daysOfWeek must be re-run through enforceWeeklyDay, so switching to Weekly (or changing its own day) selects that day in the Days control automatically. How: This merges patValObj onto the one matching picker, then re-derives daysOfWeek.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			pickers : curStaObj.pickers.map( ( curPicObj ) => { // What: Pickers. Why: Only the one matching picker is patched, with its weekly anchor day re-enforced. How: This maps pickers, returning every other one unchanged and the matching one patched and re-derived.


				if ( curPicObj.id !== picIdeStr ) return curPicObj; // What: Non-Matching Guard. Why: Every other picker is untouched by this patch. How: This returns curPicObj unchanged when its own id doesn't match picIdeStr.



				const nexPicObj = { ...curPicObj, ...patValObj }; // What: Next Picker Object. Why: The patch itself must land before daysOfWeek is re-derived from it. How: This spreads curPicObj with patValObj merged on.

				nexPicObj.daysOfWeek = CAD_NAM_OBJ.enfWeeFun( nexPicObj ); // What: Days-Of-Week Re-Derive. Why: A cadence/anchorDow/daysOfWeek change must keep the weekly-cadence anchor day selected in the Days control. How: This calls CAD_NAM_OBJ.enfWeeFun against nexPicObj's own just-patched fields.



				return nexPicObj; // What: Next Picker Return. Why: The map above needs the fully-patched picker. How: This returns nexPicObj, built above.


			} )


		} ) ),

		// #endregion updPicFun

		// #endregion Pickers



		// #region Today Edit-Mode Reordering Mechanism

		/**
		 * reoGroFun = Reorder Groups Function
		 *
		 * @summary
		 * groupOrder is the display order of the picker-based groups on
		 * Today; pickerOrder maps a group label to the ordered picker ids
		 * within it, driving per-row order. Unknown groups fall back to
		 * first-occurrence order in the render layer. setOrdFun is the
		 * bulk restore Edit Mode's own "Cancel" uses to revert to the
		 * entry snapshot.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param ordGroArr - Order Group Array: The group names in their new display
		 *                    order.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * reoGroFun(ordGroArr) // => void
		 * ```
		 *
		*/



		reoGroFun : ( ordGroArr ) => setAppStaObj( ( curStaObj ) => ( { // What: Reorder Groups Function. Why: Edit Mode needs to persist a fresh group display order after a drag. How: This copies ordGroArr onto groupOrder.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			groupOrder : ordGroArr.slice() // What: Group Order. Why: The dragged group order must be saved as-is. How: This copies ordGroArr so later edits to the caller's own array can't leak in.


		} ) ),



		reoPicFun : ( groNamStr, picIdeArr ) => setAppStaObj( ( curStaObj ) => ( { // What: Reorder Pickers Function. Why: Edit Mode needs to persist a fresh per-group row order after a drag. How: This copies picIdeArr onto pickerOrder's own entry for groNamStr.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			pickerOrder : { // What: Picker Order. Why: Only this one group's own row order changes, every other group's must survive. How: This rebuilds pickerOrder from its own current entries plus the one override below.


				...curStaObj.pickerOrder, // What: Current Picker-Order Spread. Why: Every other group's own saved row order must carry over unchanged. How: This spreads curStaObj.pickerOrder before the override below.

				[ groNamStr ] : picIdeArr.slice() // What: Group Row Order. Why: The dragged row order for this group must be saved as-is. How: This copies picIdeArr under groNamStr's own key.


			}


		} ) ),



		setOrdFun : ( ordGroArr, ordPicObj ) => setAppStaObj( ( curStaObj ) => ( { // What: Set Order Function. Why: This is the bulk restore Edit Mode's own "Cancel" uses to revert both order structures to their entry snapshot at once. How: This copies ordGroArr onto groupOrder and deep-clones ordPicObj onto pickerOrder.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			groupOrder  : ordGroArr.slice(),                        // What: Group Order. Why: Cancel must restore the group order snapshot taken on entry. How: This copies ordGroArr.
			pickerOrder : JSON.parse( JSON.stringify( ordPicObj ) ) // What: Picker Order. Why: Cancel must restore every group's row order snapshot taken on entry. How: This deep-copies ordPicObj so nested arrays can't be shared with the snapshot.


		} ) ),

		// #endregion Today Edit-Mode Reordering Mechanism



		// #region Today Entries

		// #region addEntFun

		/**
		 * addEntFun = Add Entry Function
		 *
		 * @summary
		 * Adds a NEW today entry for picIdeStr showing iteIdeStr. Multiple
		 * entries per picker are allowed for other modes; the Pickers tab
		 * uses this to ADD a choice, and the user prunes any they don't
		 * want via each entry's own Skip button. Ease Down is the one
		 * exception: since it's a single ongoing "active item", sending a
		 * new pick REPLACES today's existing entry for that picker rather
		 * than stacking a second one. A manual send stages its own value
		 * mutation as `pending` (applied on DONE), so sending an item
		 * doesn't change picker state until it's completed; the caller
		 * (Pickers-tab spin) normally passes the full staged pick result,
		 * falling back to the ease-down default (make this item active,
		 * recharge the previously-active one on done) only when it
		 * doesn't.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param picIdeStr - Picker Identifier String: The picker the item belongs
		 *                    to.
		 * @param iteIdeStr - Item Identifier String: The item to send to Today.
		 * @param penArgObj - Pending Argument Object: The staged consequences to
		 *                    apply once the entry is done.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * addEntFun(picIdeStr, iteIdeStr, penArgObj) // => void
		 * ```
		 *
		*/

		addEntFun : ( picIdeStr, iteIdeStr, penArgObj ) => setAppStaObj( ( curStaObj ) => { // What: Add Entry Function. Why: The Pickers tab needs to send a chosen item to Today as its own new entry, without changing any picker state until that entry is completed. How: This appends a fresh entry (or, for Ease Down, replaces that picker's existing one) with its value consequences staged as pending, and logs a live pick-log row.


			const curPicObj = curStaObj.pickers.find( ( picFinObj ) => picFinObj.id === picIdeStr ); // What: Current Picker Object And Guard. Why: Every branch below needs to know this picker's own mode/activeItemId/conditionalId. How: This looks up picIdeStr in curStaObj.pickers.
			const easDowBoo = curPicObj && curPicObj.mode === 'ease-down';                           // What: Ease-Down Boolean. Why: Ease Down's own single-entry-per-picker replace behavior branches everywhere below. How: This is true only when curPicObj exists and its own mode is 'ease-down'.

			const entIdeStr = easDowBoo // What: Entry Identifier String. Why: Ease Down reuses its own existing entry's eid (so a replace, not a stack); every other mode always mints a fresh one. How: This reuses the picker's own current entry's eid when found, else mints a new one via newEidFun.
				? ( curStaObj.today.entries.find( ( curEntObj ) => curEntObj.pickerId === picIdeStr )?.eid || newEidFun() ) // What: Reused Eid Branch. Why: Ease Down replaces its own existing entry. How: This reuses that entry's eid, minting one when there is none.
				: newEidFun();                                                                                              // What: Fresh Eid Branch. Why: Every other mode stacks a new entry. How: This mints a new eid.

			let penValObj = penArgObj; // What: Pending Value Object. Why: The caller's own staged pick result is normally used as-is, but a fallback must be computed when none was given. How: This starts at penArgObj and is resolved below when it's undefined.


			if ( penValObj === undefined ) { // What: Fallback-Pending Guard. Why: Only a caller that passed no pending at all needs the ease-down default computed here. How: This resolves penValObj to null, then to the ease-down default when applicable.


				penValObj = null; // What: Default Pending Reset. Why: Every mode besides ease-down's own re-activation case has no mutation to stage at all. How: This starts penValObj at null before the ease-down check below.


				if ( easDowBoo && curPicObj.activeItemId !== iteIdeStr ) { // What: Ease-Down Reactivation Guard. Why: Only switching to a DIFFERENT active item needs its own staged recharge-and-activate pending. How: This builds penValObj only when curPicObj is ease-down and itemId isn't already its own active item.


					const thrValNum = curPicObj.threshold ?? 100; // What: Threshold Value Number. Why: The previously-active item (if any) must be staged to recharge back to this exact threshold. How: This reads curPicObj's own threshold, defaulting to 100.

					penValObj = { // What: Ease-Down Pending Object. Why: The caller needs a real pending payload staging both the recharge and the activation switch. How: This stages the previously-active item's own recharge (if any), the activeItemId patch, and the pick bump.


						bumpPick    : false,                                                                               // What: Bump Pick. Why: A re-activation is not a fresh pick, so the item's own pick count must not rise. How: This is always false here.
						pickedId    : iteIdeStr,                                                                           // What: Picked Id. Why: The completion step needs to know which item this pending belongs to. How: This is iteIdeStr.
						pickerPatch : { activeItemId : iteIdeStr },                                                        // What: Picker Patch. Why: Completing this entry must make iteIdeStr the picker's own active item. How: This stages activeItemId as iteIdeStr.
						updates     : curPicObj.activeItemId ? [ { id : curPicObj.activeItemId, value : thrValNum } ] : [] // What: Updates. Why: The previously-active item (if any) must recharge to full on completion. How: This stages one value:thrValNum update for it, else none.


					};


				}


			}



			const newEntObj = { done : false, eid : entIdeStr, itemId : iteIdeStr, pending : penValObj, pickerId : picIdeStr, revert : null, skipped : false }; // What: New Entry Object. Why: This is the actual Today entry being added, in today.entries' own shape. How: This bundles entIdeStr/picIdeStr/iteIdeStr, under the entry's own persisted eid/pickerId/itemId keys, with a fresh not-done/not-skipped state and penValObj as its own pending.
			const logRowObj = logRowFun( curStaObj, { eid : entIdeStr, itemId : iteIdeStr, pickerId : picIdeStr, source : 'manual' } );                         // What: Log Row Object. Why: A manual send must be reflected in the pick log too, denormalized the same way every other pick is. How: This calls logRowFun with source:'manual'.

			const conIdeStr = curPicObj && curPicObj.conditionalId; // What: Conditional Identifier String. Why: The day-off-card check below needs to know which conditional (if any) gates this picker. How: This reads curPicObj's own conditionalId, or stays falsy when curPicObj is missing.

			const hasDofBoo = easDowBoo && conIdeStr && // What: Has Day-Off Boolean. Why: An ease-down picker that's currently suppressed behind its own day-off card must NOT have that card silently replaced by this manual override. How: This is true only when this is ease-down, gated, and today already shows a live day-off card for that same conditional.
				curStaObj.today.entries.some( ( curEntObj ) => curEntObj.kind === 'dayoff' && curEntObj.conditionalId === conIdeStr ); // What: Day-Off Card Test. Why: The picker is suppressed only when its own conditional's day-off card is on Today. How: This looks for a day-off entry with conIdeStr.

			const nexEntArr = ( easDowBoo && !hasDofBoo ) // What: Next Entry Array. Why: Ease Down normally REPLACES its own picker's existing entry; the day-off-card exception instead ADDS an extra entry alongside the still-showing card. How: This filters out this picker's own prior entry (unless the exception applies) before appending newEntObj.
				? [ ...curStaObj.today.entries.filter( ( curEntObj ) => curEntObj.pickerId !== picIdeStr ), newEntObj ] // What: Replace Entry Branch. Why: Ease Down replaces its own picker's entry. How: This drops the old entry and appends newEntObj.
				: [ ...curStaObj.today.entries, newEntObj ];                                                            // What: Add Entry Branch. Why: Every other case adds an entry. How: This appends newEntObj.

			const nexLogArr = easDowBoo // What: Next Pick-Log Array. Why: A replaced Ease Down entry must not leave its own prior log row behind under the same eid. How: This drops any earlier row sharing eid before appending logRowObj, only for ease-down; every other mode simply appends.
				? [ ...( curStaObj.pickLog || [] ).filter( ( curRowObj ) => curRowObj.eid !== entIdeStr ), logRowObj ] // What: Replace Row Branch. Why: A replaced entry's old row must not linger under the same eid. How: This drops that row and appends logRowObj.
				: [ ...( curStaObj.pickLog || [] ), logRowObj ];                                                       // What: Append Row Branch. Why: A new entry just adds its row. How: This appends logRowObj.



			return { // What: Next State Return. Why: The caller needs the new entry and its own log row written onto a fresh state. How: This spreads curStaObj with today.entries and pickLog replaced.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				pickLog : nexLogArr,                                  // What: Pick Log. Why: The manual send's own log row must land in state. How: This is nexLogArr.
				today   : { ...curStaObj.today, entries : nexEntArr } // What: Today. Why: The new (or replacing) entry must land in today's own list. How: This spreads curStaObj.today with entries replaced by nexEntArr.


			};


		} ),

		// #endregion addEntFun



		cleEntFun : () => setAppStaObj( ( curStaObj ) => ( { // What: Clear Entries Function. Why: The Welcome Tour uses this to back up to its own Generate step, showing the same pristine "nothing generated yet" state it did the first time through. How: This empties today.entries without touching generatedAt/streakClaimed/anything else about today.


			...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

			today : { ...curStaObj.today, entries : [] } // What: Today. Why: The Welcome Tour's own back-up step needs Today emptied without touching any other today field. How: This spreads curStaObj.today with entries replaced by an empty array.


		} ) ),



		// #region setEntFun

		/**
		 * setEntFun = Set Entries Function
		 *
		 * @summary
		 * Rebuilds the entire entries list from scratch (used by
		 * Generate). lisEntArr holds 2 kinds of descriptors: a CARRIED
		 * entry (has _carry + entry) is kept VERBATIM (same eid/itemId/
		 * pending/done/revert/periodKey) so a cadence pick persists across
		 * days until completed, log row included; a FRESH descriptor (no
		 * eid) gets a new eid and a fresh 'auto' log row. optArgObj.
		 * resetStreak, only ever passed by the scheduled auto-run (never a
		 * manual Regenerate, and deliberately not derived from the date),
		 * clears today.streakClaimed so the new period starts unclaimed;
		 * this is what stops a user from "farming" extra streak points by
		 * repeatedly regenerating and completing within the same day.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param lisEntArr - List Entry Array: The fresh entries this Generate
		 *                    produced.
		 * @param optArgObj - Option Argument Object: Optional flags; resetStreak
		 *                    starts the new period unclaimed.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * setEntFun(lisEntArr, { resetStreak: true }) // => void
		 * ```
		 *
		*/

		setEntFun : ( lisEntArr, optArgObj ) => setAppStaObj( ( curStaObj ) => { // What: Set Entries Function. Why: Generate rebuilds the whole Today list at once, carrying unfinished cadence picks forward and adding fresh ones. How: This keeps every carried entry verbatim, gives every fresh descriptor a new eid and 'auto' log row, and clears streakClaimed only when optArgObj.resetStreak is set.


			const curDayStr = isoDayFun(); // What: Current Day String. Why: The fresh-row and pick-log-purge logic below both need today's own calendar day. How: This reads isoDayFun().

			const carEntArr = lisEntArr.filter( ( curDesObj ) => curDesObj._carry ).map( ( curDesObj ) => curDesObj.entry ); // What: Carried Entry Array. Why: A carried descriptor's own already-formed entry must be kept verbatim, unwrapped from its own _carry marker. How: This filters lisEntArr to _carry descriptors and unwraps each one's own entry.
			const carEidSet = new Set( carEntArr.map( ( curEntObj ) => curEntObj.eid ) );                                    // What: Carried Eid Set. Why: The pick-log purge below must never drop a carried entry's own still-live row. How: This collects every carried entry's own eid.

			const freEntArr = lisEntArr.filter( ( curDesObj ) => !curDesObj._carry ).map( ( curDesObj ) => ( { // What: Fresh Entry Array. Why: Every non-carried descriptor becomes a brand-new Today entry with its own fresh eid. How: This maps each descriptor into a full entry, spreading in periodKey/day-off-card fields only when present.


				done     : false,                      // What: Done. Why: A freshly generated entry always starts not-done. How: This is false.
				eid      : newEidFun(),                // What: Entry Id. Why: Every fresh entry needs its own brand-new id. How: This mints one via newEidFun.
				itemId   : curDesObj.itemId || null,   // What: Item Id. Why: This is the item the generator picked for this entry, if any. How: This reads curDesObj.itemId, defaulting to null.
				pending  : curDesObj.pending || null,  // What: Pending. Why: The pick's own value consequences stay staged until the entry is completed. How: This reads curDesObj.pending, defaulting to null.
				pickerId : curDesObj.pickerId || null, // What: Picker Id. Why: Every entry records which picker produced it. How: This reads curDesObj.pickerId, defaulting to null.
				revert   : null,                       // What: Revert. Why: Nothing has been applied yet, so there is nothing to revert. How: This is null until the entry is completed.
				skipped  : false,                      // What: Skipped. Why: A freshly generated entry always starts not-skipped. How: This is false.

				...( curDesObj.periodKey ? { periodKey : curDesObj.periodKey } : {} ), // What: Period-Key Spread. Why: A non-daily cadence pick must remember which period it belongs to, so it can carry across days until completed. How: This adds periodKey only when curDesObj carries one.

				...( curDesObj.kind ? { // What: Day-Off Card Fields Spread. Why: A day-off card entry carries a kind + conditional link + display text and has no itemId, and never writes to the pick log (excluded from stats). How: This spreads kind/conditionalId/cardText/group/pickerName/condName only when curDesObj.kind is present.


					cardText      : curDesObj.cardText || '',        // What: Card Text. Why: The day-off card shows its own explanatory line. How: This reads curDesObj.cardText, defaulting to ''.
					conditionalId : curDesObj.conditionalId || null, // What: Conditional Id. Why: The card must stay linked to the conditional that suppressed its picker today. How: This reads curDesObj.conditionalId, defaulting to null.
					condName      : curDesObj.condName || '',        // What: Conditional Name. Why: The card's own title shows the conditional's name, denormalized so it survives a later rename. How: This reads curDesObj.condName, defaulting to ''.
					group         : curDesObj.group || 'Other',      // What: Group. Why: The card must render inside its picker's own Today group. How: This reads curDesObj.group, defaulting to 'Other'.
					kind          : curDesObj.kind,                  // What: Kind. Why: This marks the entry as a day-off card rather than a real pick. How: This copies curDesObj.kind, which is always truthy on this branch.
					pickerName    : curDesObj.pickerName || ''       // What: Picker Name. Why: The card's own title shows the suppressed picker's name, denormalized so it survives a later rename. How: This reads curDesObj.pickerName, defaulting to ''.


				} : {} )


			} ) );

			const nexEntArr = [ ...carEntArr, ...freEntArr ]; // What: Next Entry Array. Why: The new today.entries list is exactly the carried entries plus the freshly-built ones. How: This concatenates carEntArr and freEntArr.

			const newRowArr = freEntArr.filter( ( curEntObj ) => !curEntObj.kind && curEntObj.pickerId ).map( ( curEntObj ) => // What: New Row Array. Why: Only a real (non-day-off-card) fresh entry needs its own auto pick-log row; depletedEnd is deliberately NOT written here, since it's a value consequence recorded only on completion. How: This builds one logRowFun row per qualifying fresh entry, source:'auto'.
				logRowFun( curStaObj, { date : curDayStr, eid : curEntObj.eid, itemId : curEntObj.itemId, pickerId : curEntObj.pickerId, source : 'auto' } ) ); // What: Auto Row Build. Why: Every fresh entry logs as an automatic pick. How: This builds the row from the entry's own eid, item and picker.

			const nexLogArr = ( curStaObj.pickLog || [] ).filter( ( curRowObj ) => curRowObj.date !== curDayStr || carEidSet.has( curRowObj.eid ) ).concat( newRowArr ); // What: Next Pick-Log Array. Why: The generator owns today, so every OTHER row logged today (auto or manual) must be dropped, except a carried entry's own still-live row. How: This keeps every row not dated today (or belonging to a carried eid), then appends newRowArr.

			const nexTodObj = { ...curStaObj.today, entries : nexEntArr }; // What: Next Today Object. Why: The caller needs a fresh today object carrying the new entries. How: This spreads curStaObj.today with entries replaced by nexEntArr.


			if ( optArgObj && optArgObj.resetStreak ) nexTodObj.streakClaimed = false; // What: Streak-Claimed Reset Guard. Why: Only the scheduled auto-run (never a manual Regenerate) starts the new period unclaimed, per the design-rationale comment above. How: This sets nexTodObj.streakClaimed to false only when optArgObj.resetStreak is truthy.



			const nexTasArr = ( curStaObj.tasks || [] ).filter( ( curTasObj ) => !TAS_NAM_OBJ.isaComFun( curTasObj ) ); // What: Next Task Array. Why: Every Generate also drops completed one-time reminders outright, rather than waiting for a future reload/day-change. How: This keeps every task TAS_NAM_OBJ.isaComFun reports false for.



			return { ...curStaObj, pickLog : nexLogArr, tasks : nexTasArr, today : nexTodObj }; // What: Next State Return. Why: The caller needs today/pickLog/tasks all replaced on a fresh state. How: This spreads curStaObj with the 3 fields replaced.


		} ),

		// #endregion setEntFun



		// #region skiEntFun

		/**
		 * skiEntFun = Skip Entry Function
		 *
		 * @summary
		 * Removes the entry from today, but its own live log row is KEPT
		 * and marked outcome:'skipped' (like re-roll's own 'rejected') so
		 * Stats can tally per-item skips. Skipped rows never count toward
		 * pick totals; rejected rows for the same eid stay as they are. If
		 * the entry had been completed, its own applied mutation is undone
		 * first (it's no longer a completion), and any conditional charge
		 * it drove is reverted too.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param entIdeStr - Entry Identifier String: The Today entry to skip.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * skiEntFun(entIdeStr) // => void
		 * ```
		 *
		*/

		skiEntFun : ( entIdeStr ) => setAppStaObj( ( curStaObj ) => { // What: Skip Entry Function. Why: A user must be able to drop an entry from today while Stats still counts it as a skip. How: This undoes any completed mutation and conditional charge first, removes the entry, marks its own live log row skipped, and reconciles the streak.


			const curEntObj = curStaObj.today.entries.find( ( entFinObj ) => entFinObj.eid === entIdeStr ); // What: Current Entry Object And Guard. Why: The undo-before-skip branch below needs to know whether this entry was already completed. How: This looks up entIdeStr in curStaObj.today.entries.

			let nexIteArr = curStaObj.items;         // What: Next Item Array. Why: This defaults to the unchanged items and is only replaced below when an already-done entry needs its own pending undone first. How: This starts at curStaObj.items.
			let nexPicArr = curStaObj.pickers;       // What: Next Picker Array. Why: This defaults to the unchanged pickers and is only replaced below when an already-done entry needs its own pending undone first. How: This starts at curStaObj.pickers.
			let nexLogArr = curStaObj.pickLog || []; // What: Next Pick-Log Array. Why: This defaults to the unchanged pick log and is only replaced below when an already-done entry needs its own pending undone first. How: This starts at curStaObj.pickLog, defaulting to [].


			if ( curEntObj && curEntObj.done && curEntObj.revert ) { // What: Already-Done Undo Guard. Why: A skipped entry is no longer a completion, so any staged mutation it already applied must be undone first. How: This calls enpRevFun and adopts its own result.


				const resValObj = enpRevFun( { ...curStaObj }, curEntObj ); // What: Result Value Object. Why: enpRevFun returns the restored items/pickers/pickLog together. How: This calls enpRevFun with a shallow copy of curStaObj and curEntObj.

				nexIteArr = resValObj.items;   // What: Restored Items Array Adopt. Why: Every downstream line below must build on the RESTORED items. How: This adopts resValObj's own items onto the outer nexIteArr binding.
				nexPicArr = resValObj.pickers; // What: Restored Pickers Array Adopt. Why: Every downstream line below must build on the RESTORED pickers. How: This adopts resValObj's own pickers onto the outer nexPicArr binding.
				nexLogArr = resValObj.pickLog; // What: Restored Pick Log Array Adopt. Why: Every downstream line below must build on the RESTORED pick log. How: This adopts resValObj's own pickLog onto the outer nexLogArr binding.


			}



			const nexEntArr = curStaObj.today.entries.filter( ( entFilObj ) => entFilObj.eid !== entIdeStr ); // What: Next Entry Array. Why: A skipped entry is removed from today entirely, not merely marked. How: This filters out the one entry matching entIdeStr.

			const nexConArr = ( curEntObj && curEntObj.done ) // What: Next Conditionals Array. Why: A completed entry being skipped is no longer a completion, so any conditional charge/discharge it drove must be reverted. How: This calls cotAplFun with nowDone:false only when curEntObj was actually done, else passes conditionals through unchanged.
				? cotAplFun( { ...curStaObj, items : nexIteArr, pickers : nexPicArr }, nexEntArr, curEntObj, false ) // What: Undo Charge Branch. Why: A done entry being skipped must undo the conditional charge it drove. How: This re-runs cotAplFun as not-done.
				: ( curStaObj.conditionals || [] );                                                                  // What: Unchanged Conditionals Branch. Why: A not-done entry never drove a charge. How: This passes the conditionals through.

			const nexCdlArr = ( curEntObj && curEntObj.done ) // What: Next Conditional-Log Array. Why: The matching cycle's own log row must be un-recorded too, for the same reason as nexConArr above. How: This calls cdlAplFun with nowDone:false only when curEntObj was actually done, else passes conditionalLog through unchanged.
				? cdlAplFun( { ...curStaObj, items : nexIteArr, pickers : nexPicArr }, nexEntArr, curEntObj, false ) // What: Undo Log Branch. Why: The matching cycle's row must be un-recorded too. How: This re-runs cdlAplFun as not-done.
				: ( curStaObj.conditionalLog || [] );                                                                // What: Unchanged Log Branch. Why: A not-done entry never logged a cycle. How: This passes the conditional log through.

			nexLogArr = nexLogArr.map( ( curRowObj ) => // What: Live Log Row Skip. Why: The live row for this entry must be marked skipped (never overwriting an already-rejected row from an earlier re-roll). How: This flags the matching row outcome:'skipped', done:false, completedAt:null.
				( curRowObj.eid === entIdeStr && curRowObj.outcome !== 'rejected' ) ? { ...curRowObj, completedAt : null, done : false, outcome : 'skipped' } : curRowObj ); // What: Skip Row Patch. Why: Only this entry's non-rejected row becomes skipped. How: This marks it skipped and not done, and passes every other row through.

			const { stkClaBoo, stkValNum } = stkSynFun( { ...curStaObj, items : nexIteArr, pickers : nexPicArr }, nexEntArr, curStaObj.tasks ); // What: Streak Reconcile. Why: Removing an entry from today can flip whether today counts as fully done. How: This calls stkSynFun against the already-patched items/pickers and the already-filtered entries.



			return { // What: Next State Return. Why: Every affected field must land together on one fresh state. How: This spreads curStaObj with items/pickers/conditionals/conditionalLog/streak/today/pickLog all replaced.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				conditionalLog : nexCdlArr,                                                             // What: Conditional Log. Why: Skipping an already-completed entry must revert its conditional's own logged cycle. How: This is nexCdlArr.
				conditionals   : nexConArr,                                                             // What: Conditionals. Why: Skipping an already-completed entry must revert its gating conditional's own charge. How: This is nexConArr.
				items          : nexIteArr,                                                             // What: Items. Why: Any completed consequences this skip reverts land here. How: This is nexIteArr.
				pickers        : nexPicArr,                                                             // What: Pickers. Why: Any completed picker-level consequences this skip reverts land here. How: This is nexPicArr.
				pickLog        : nexLogArr,                                                             // What: Pick Log. Why: The live row for this entry must be marked skipped. How: This is nexLogArr.
				streak         : stkValNum,                                                             // What: Streak. Why: The persisted streak count must reflect the reconciled verdict. How: This is stkValNum, from stkSynFun.
				today          : { ...curStaObj.today, entries : nexEntArr, streakClaimed : stkClaBoo } // What: Today. Why: Today's own entries and claimed flag must both reflect this change. How: This spreads curStaObj.today with entries replaced and streakClaimed set to stkClaBoo.


			};


		} ),

		// #endregion skiEntFun



		// #region swaIteFun

		/**
		 * swaIteFun = Swap Item Function
		 *
		 * @summary
		 * Replaces the item shown by ONE entry (Today's own Re-roll).
		 * Instead of overwriting the row, the rolled-away row is marked
		 * outcome:'rejected' (keeping its own itemId so it's known what
		 * was rejected), and a fresh 'reroll' row is APPENDED for the item
		 * landed on. Consecutive re-rolls leave a chain of rejected rows
		 * plus one live row, all sharing the same eid. Rejected rows never
		 * count toward day totals; they power the per-item "re-rolled
		 * away" metric.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param entIdeStr - Entry Identifier String: The Today entry to re-roll.
		 * @param iteIdeStr - Item Identifier String: The item it swaps to.
		 * @param penArgObj - Pending Argument Object: The new item's staged
		 *                    consequences.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * swaIteFun(entIdeStr, iteIdeStr, penArgObj) // => void
		 * ```
		 *
		*/

		swaIteFun : ( entIdeStr, iteIdeStr, penArgObj ) => setAppStaObj( ( curStaObj ) => { // What: Swap Item Function. Why: Today's own Re-roll must swap the item one entry shows while keeping a record of what was rolled away. How: This points the entry at the new item with freshly staged pending, marks the old live log row rejected, and appends a new 'reroll' row under the same eid.


			const curEntObj = curStaObj.today.entries.find( ( entFinObj ) => entFinObj.eid === entIdeStr ); // What: Current Entry Object And Guard. Why: The undo-then-restage flow below needs to know whether this entry was already completed. How: This looks up entIdeStr in curStaObj.today.entries.

			let nexIteArr = curStaObj.items;         // What: Next Item Array. Why: This defaults to the unchanged items and is only replaced below when an already-completed entry needs its own pending undone first. How: This starts at curStaObj.items.
			let nexPicArr = curStaObj.pickers;       // What: Next Picker Array. Why: This defaults to the unchanged pickers and is only replaced below when an already-completed entry needs its own pending undone first. How: This starts at curStaObj.pickers.
			let nexLogArr = curStaObj.pickLog || []; // What: Next Pick-Log Array. Why: This defaults to the unchanged pick log and is only replaced below when an already-completed entry needs its own pending undone first. How: This starts at curStaObj.pickLog, defaulting to [].


			if ( curEntObj && curEntObj.done && curEntObj.revert ) { // What: Already-Done Undo Guard. Why: A re-roll always lands not-done, so an already-completed entry's own staged mutation must be undone first. How: This calls enpRevFun and adopts its own result when curEntObj is done and carries a revert snapshot.


				const resValObj = enpRevFun( { ...curStaObj }, curEntObj ); // What: Result Value Object. Why: enpRevFun returns the restored items/pickers/pickLog together. How: This calls enpRevFun with a shallow copy of curStaObj and curEntObj.

				nexIteArr = resValObj.items;   // What: Restored Items Array Adopt. Why: Every downstream line below must build on the RESTORED items, not the still-applied ones. How: This adopts resValObj's own items onto the outer nexIteArr binding.
				nexPicArr = resValObj.pickers; // What: Restored Pickers Array Adopt. Why: Every downstream line below must build on the RESTORED pickers, not the still-applied ones. How: This adopts resValObj's own pickers onto the outer nexPicArr binding.
				nexLogArr = resValObj.pickLog; // What: Restored Pick Log Array Adopt. Why: Every downstream line below must build on the RESTORED pick log, not the still-applied one. How: This adopts resValObj's own pickLog onto the outer nexLogArr binding.


			}



			const curRowObj = nexLogArr.find( ( logFinObj ) => logFinObj.eid === entIdeStr && !logFinObj.outcome ); // What: Current Row Object And Guard. Why: The live log row (if any) is where this entry's own current pickerId can still be read from. How: This finds the one row sharing entIdeStr with no outcome yet.

			const picIdeStr = curRowObj ? curRowObj.pickerId // What: Picker Identifier String. Why: The fresh reroll log row below needs a pickerId, preferring the live log row's own, falling back to the live entry's own. How: This reads curRowObj's own pickerId, else the matching today.entries row's own pickerId.
				: ( curStaObj.today.entries.find( ( entFinObj ) => entFinObj.eid === entIdeStr ) || {} ).pickerId; // What: Entry Picker Fallback. Why: With no live row, the entry itself still knows its picker. How: This reads the matching entry's own pickerId.

			let rejLogArr = nexLogArr.map( ( logMapObj ) => // What: Rejected Log Array. Why: The rolled-away row must be marked rejected, keeping its own itemId, before the fresh reroll row is appended. How: This flags the live row sharing entIdeStr as outcome:'rejected'.
				( logMapObj.eid === entIdeStr && !logMapObj.outcome ) ? { ...logMapObj, outcome : 'rejected' } : logMapObj ); // What: Reject Row Patch. Why: Only this entry's live row is rolled away. How: This marks it rejected and passes every other row through.


			if ( picIdeStr ) rejLogArr.push( logRowFun( { ...curStaObj, items : nexIteArr }, { eid : entIdeStr, itemId : iteIdeStr, pickerId : picIdeStr, source : 'reroll' } ) ); // What: Reroll Row Append. Why: Only when a picker id could actually be resolved does a fresh reroll row make sense to log. How: This pushes a new logRowFun row with source:'reroll' onto rejLogArr.



			return { // What: Next State Return. Why: The caller needs the entry re-pointed at iteIdeStr (not-done, not-skipped, freshly staged), plus the updated log. How: This spreads curStaObj with items/pickers/today.entries/pickLog all replaced.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				items   : nexIteArr, // What: Items. Why: Any undone completion's own restored items must land in state. How: This is nexIteArr.
				pickers : nexPicArr, // What: Pickers. Why: Any undone completion's own restored pickers must land in state. How: This is nexPicArr.
				pickLog : rejLogArr, // What: Pick Log. Why: The rejected row and the fresh reroll row must both land in state. How: This is rejLogArr.

				today : { // What: Today. Why: The re-rolled entry itself must be re-pointed at its new item. How: This rebuilds today with only its own entries list replaced.


					...curStaObj.today, // What: Current Today Spread. Why: Every other today field (generatedAt, streakClaimed, ...) must carry over unchanged. How: This spreads curStaObj.today before the entries override below.

					entries : curStaObj.today.entries.map( ( entMapObj ) => entMapObj.eid === entIdeStr ? { ...entMapObj, done : false, itemId : iteIdeStr, pending : penArgObj || null, revert : null, skipped : false } : entMapObj ) // What: Entries. Why: A re-rolled entry always lands not-done and not-skipped, with its own freshly staged pending. How: This re-points the one entry matching entIdeStr at iteIdeStr and resets its own done/skipped/pending/revert.


				}


			};


		} ),

		// #endregion swaIteFun



		// #region togDonFun

		/**
		 * togDonFun = Toggle Done Function
		 *
		 * @summary
		 * The central done and undone mutation for a Today entry. From one toggle
		 * it applies (or reverts) the entry's staged pending, resolves the
		 * conditional consequences, updates the entry's live pick-log row and
		 * reconciles the streak.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param entIdeStr - Entry Identifier String: The Today entry to check or
		 *                    uncheck.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * togDonFun(entIdeStr) // => void
		 * ```
		 *
		*/

		togDonFun : ( entIdeStr ) => setAppStaObj( ( curStaObj ) => { // What: Toggle Done Function. Why: This is THE central done/undone mutation for a Today entry: it applies (or reverts) the entry's own staged pending, resolves conditional consequences, updates the live pick-log row, and reconciles the streak, all from one toggle. How: See the inline comments below for each step.


			const curEntObj = curStaObj.today.entries.find( ( entFinObj ) => entFinObj.eid === entIdeStr ); // What: Current Entry Object And Guard. Why: A stale entIdeStr (already removed) must be a no-op. How: This looks up entIdeStr in curStaObj.today.entries.


			if ( !curEntObj ) return curStaObj; // What: Missing-Entry Guard. Why: There's nothing to toggle when curEntObj wasn't found. How: This returns curStaObj unchanged.



			const nowDonBoo = !curEntObj.done; // What: Now Done Boolean. Why: Every branch below needs to know which direction this toggle is heading. How: This is the logical negation of curEntObj's own current done state.

			let nexIteArr = curStaObj.items;         // What: Next Item Array. Why: This defaults to the unchanged items and is replaced below by whichever branch fires. How: This starts at curStaObj.items.
			let nexPicArr = curStaObj.pickers;       // What: Next Picker Array. Why: This defaults to the unchanged pickers and is replaced below by whichever branch fires. How: This starts at curStaObj.pickers.
			let nexLogArr = curStaObj.pickLog || []; // What: Next Pick-Log Array. Why: This defaults to the unchanged pick log and is replaced below by whichever branch fires. How: This starts at curStaObj.pickLog, defaulting to [].
			let nexRevObj = null;                    // What: Next Revert Object. Why: Only the apply branch stages a fresh revert snapshot; the revert branch leaves this null. How: This starts at null.


			if ( nowDonBoo ) { // What: Apply Branch. Why: Marking DONE is what actually applies curEntObj's own staged pending mutation. How: This calls enpAplFun and adopts its own result, including the revert snapshot it returns.


				const resValObj = enpAplFun( { ...curStaObj }, curEntObj ); // What: Result Value Object. Why: enpAplFun returns the patched arrays plus a fresh revert snapshot together. How: This calls enpAplFun with a shallow copy of curStaObj and curEntObj.

				nexIteArr = resValObj.items;   // What: Patched Items Array Adopt. Why: Every downstream line below must build on the PATCHED items. How: This adopts resValObj's own items onto the outer nexIteArr binding.
				nexPicArr = resValObj.pickers; // What: Patched Pickers Array Adopt. Why: Every downstream line below must build on the PATCHED pickers. How: This adopts resValObj's own pickers onto the outer nexPicArr binding.
				nexLogArr = resValObj.pickLog; // What: Patched Pick Log Array Adopt. Why: Every downstream line below must build on the PATCHED pick log. How: This adopts resValObj's own pickLog onto the outer nexLogArr binding.
				nexRevObj = resValObj.revert;  // What: Fresh Revert Object Stage. Why: The entry being marked done needs a revert snapshot staged on it so unchecking it later can undo this exact mutation. How: This adopts resValObj's own revert onto the outer nexRevObj binding.


			}

			else { // What: Revert Branch. Why: Un-marking DONE must undo exactly whatever the apply branch above staged, using the entry's own prior revert snapshot. How: This calls enpRevFun and adopts its own result, clearing nexRevObj back to null.


				const resValObj = enpRevFun( { ...curStaObj }, curEntObj ); // What: Result Value Object. Why: enpRevFun returns the restored arrays together. How: This calls enpRevFun with a shallow copy of curStaObj and curEntObj.

				nexIteArr = resValObj.items;   // What: Reverted Items Array Adopt. Why: Every downstream line below must build on the REVERTED items. How: This adopts resValObj's own items onto the outer nexIteArr binding.
				nexPicArr = resValObj.pickers; // What: Reverted Pickers Array Adopt. Why: Every downstream line below must build on the REVERTED pickers. How: This adopts resValObj's own pickers onto the outer nexPicArr binding.
				nexLogArr = resValObj.pickLog; // What: Reverted Pick Log Array Adopt. Why: Every downstream line below must build on the REVERTED pick log. How: This adopts resValObj's own pickLog onto the outer nexLogArr binding.
				nexRevObj = null;              // What: Revert Object Clear. Why: An un-done entry no longer carries any revert snapshot of its own. How: This nulls nexRevObj.


			}



			const nexEntArr = curStaObj.today.entries.map( ( entMapObj ) => // What: Next Entry Array. Why: Only the toggled entry's own done/skipped/revert fields actually change. How: This maps today.entries, patching the one entry matching entIdeStr.
				entMapObj.eid === entIdeStr ? { ...entMapObj, done : nowDonBoo, revert : nexRevObj, skipped : false } : entMapObj ); // What: Toggled Entry Patch. Why: Only the toggled entry changes. How: This sets done, clears skipped, stores the revert snapshot, and passes every other entry through.

			const nexConArr = cotAplFun( { ...curStaObj, items : nexIteArr, pickers : nexPicArr }, nexEntArr, curEntObj, nowDonBoo ); // What: Next Conditionals Array. Why: A charge on the first dependent completion, or a day-off card reset/discharge, must be resolved against the ALREADY-toggled entries list. How: This calls cotAplFun against the patched items/pickers.
			const nexCdlArr = cdlAplFun( { ...curStaObj, items : nexIteArr, pickers : nexPicArr }, nexEntArr, curEntObj, nowDonBoo ); // What: Next Conditional-Log Array. Why: The matching cycle's own log row must be resolved against the same ALREADY-toggled entries list. How: This calls cdlAplFun against the patched items/pickers.

			nexLogArr = nexLogArr.map( ( curRowObj ) => ( curRowObj.eid === entIdeStr && !curRowObj.outcome ) // What: Live Log Row Toggle. Why: Only the live (active, non-rejected/non-skipped) row for this entry ever toggles its own done/completedAt. How: This stamps done/completedAt on the one matching row, leaving every other row untouched.
				? { ...curRowObj, completedAt : nowDonBoo ? new Date().toISOString() : null, done : nowDonBoo } // What: Toggled Row Branch. Why: The live row mirrors the entry's new done state. How: This sets done and stamps or clears completedAt.
				: curRowObj );                                                                                  // What: Other Row Branch. Why: Every other row is untouched. How: This passes curRowObj through.

			const { stkClaBoo, stkValNum } = stkSynFun( { ...curStaObj, items : nexIteArr, pickers : nexPicArr }, nexEntArr, curStaObj.tasks ); // What: Streak Reconcile. Why: Toggling any entry can flip whether today counts as fully done. How: This calls stkSynFun against the already-patched items/pickers and the already-toggled entries.



			return { // What: Next State Return. Why: Every affected field must land together on one fresh state. How: This spreads curStaObj with items/pickers/conditionals/conditionalLog/streak/today/pickLog all replaced.


				...curStaObj, // What: Current State Spread. Why: Every field this action doesn't touch must carry over unchanged. How: This spreads curStaObj before the overrides below.

				conditionalLog : nexCdlArr,                                                             // What: Conditional Log. Why: A done/undone flip can open or close a conditional's own logged cycle. How: This is nexCdlArr.
				conditionals   : nexConArr,                                                             // What: Conditionals. Why: A done/undone flip can change a gating conditional's own charge. How: This is nexConArr.
				items          : nexIteArr,                                                             // What: Items. Why: The entry's own staged value/weight consequences land here. How: This is nexIteArr.
				pickers        : nexPicArr,                                                             // What: Pickers. Why: The entry's own staged picker-level consequences land here. How: This is nexPicArr.
				pickLog        : nexLogArr,                                                             // What: Pick Log. Why: The live row for this entry must reflect its new outcome. How: This is nexLogArr.
				streak         : stkValNum,                                                             // What: Streak. Why: The persisted streak count must reflect the reconciled verdict. How: This is stkValNum, from stkSynFun.
				today          : { ...curStaObj.today, entries : nexEntArr, streakClaimed : stkClaBoo } // What: Today. Why: Today's own entries and claimed flag must both reflect this change. How: This spreads curStaObj.today with entries replaced and streakClaimed set to stkClaBoo.


			};


		} )

		// #endregion togDonFun

		// #endregion Today Entries


	} ), [] ); // What: Actions Memo Dependency Array. Why: Every action closes over stable references (setAppStaObj, latStaRef, canPenFun), none of which ever change identity across renders, so this object never needs to be recomputed. How: An empty array means actStoObj is built exactly once, for the lifetime of this component.



	return [ appStaObj, actStoObj ]; // What: Store Tuple Return. Why: Every caller (AppRooCom) destructures this into its own state/actStoObj pair. How: This returns the current appStaObj alongside the memoized actStoObj object.


}

// #endregion useAppStaFun

// #endregion Hooks



// #region Exports

export { useAppStaFun }; // What: Use App State Function Export. Why: This hook is the entire app's own state layer, imported by app.jsx (and nowhere else). How: This re-exports the useAppStaFun function declared above by name.

// #endregion Exports


