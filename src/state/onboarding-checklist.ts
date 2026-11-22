


// #region Imports

import { ONB_SPI_ARR } from './onboarding-seed-data.ts'; // What: Onboarding Sample-Picker-Identifiers Array. Why: This module needs every seeded sample picker's own id to list its own checklist entries below and to tell a real, user-created picker apart from a sample one. How: This is read directly by the checklist helpers below, such as tutProFun, and spread into CHE_IDE_ARR.
import { ONB_STI_ARR } from './onboarding-seed-data.ts'; // What: Onboarding Sample-Task-Identifiers Array. Why: This module needs every seeded sample task's own id to list its own checklist entries below. How: This is spread into CHE_IDE_ARR below and read by tutProFun.


import type { CheStaTyp } from '../core/data-model.ts'; // What: Checklist Status Type. Why: Every checklist entry records how its item was resolved. How: This types entLooFun's returned entry.
import type { StaAppTyp } from '../core/data-model.ts'; // What: State App Type. Why: Every function here reads the whole app state. How: This types each appStaObj parameter.

// #endregion Imports



/**
 * onboarding-checklist.ts = Onboarding Checklist
 *
 * @summary
 * The full "todo list" of mini-tour launcher cards shown on Today after the
 * main Welcome Tour ends, plus the one closing "Generate a real list" card.
 * Every item's resolution lives in one place, state.onboarding.checklist:
 * { [itemId]: { status } }, where status is 'finished' | 'skipped' |
 * 'cancelled'. It's set instantly by X (cancelled), by skipping mid-mini-tour
 * (skipped), or by finishing a mini-tour (finished).
 * state.onboarding.checklistDone flips true once the Generate card's own flow
 * completes.
 *
 * Sample data (see onboarding-seed-data.ts) is never deleted or re-hidden by
 * anything in this file. Resolving or unresolving a card only ever touches
 * this checklist map, never the sample itself, which is what makes unchecking
 * a card (to redo its mini-tour) free: nothing needs restoring.
 *
 * Three item kinds exist. 'sample' is one of the Welcome Tour's sample
 * pickers/reminders, listed programmatically from ONB_SPI_ARR and ONB_STI_ARR,
 * so a new sample card needs no changes here. 'pageTour' is an "Explore the
 * {page}" tour, not tied to any sample picker/reminder: no data to
 * finish/skip/cancel, just the same checklist bookkeeping. These render in
 * their own "Page Tours" section on Today (see tab-today.tsx). 'generate' is
 * the single closing card, whose fixed id is ONB_GII_STR below. The kinds are
 * conceptual only: CHE_IDE_ARR stores just the item ids, since nothing reads
 * an item's kind.
 *
 * Sections:
 *  - Constants
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

// #region ONB_EPT_ARR

/**
 * ONB_EPT_ARR = Onboarding Explore-Page-Tours Array
 *
 * @summary
 * One entry per page tour, in the order their cards/tours should
 * appear. Every entry shares one shape, and none of them repeat these
 * fields' own boilerplate comments on their own lines (see the
 * "Repeated-shape object literals" comment exception in CLAUDE.md):
 *
 * - `ideStr` (String): Identifier String, the tour's own stable id,
 *   matched against a resolved checklist item id in
 *   state.onboarding.checklist and against activeTour's own "page-"
 *   prefixed suffix.
 *
 * - `labStr` (String): Label String, the page name shown on the tour's
 *   Today launcher card (see tab-today.tsx's PagTouCom).
 *
 * - `pagStr` (String): Page String, matching the `data-tab-button-key` value
 *   on that page's own nav button (see app.tsx's TabBarCom), which the tour's
 *   own opening step targets.
 *
 * - `timStr` (String): Time String, a real, user-confirmed estimate
 *   (manually timed 2026-08-14) shown on the tour's Today launcher card.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const ONB_EPT_ARR = [ // What: Onboarding Explore-Page-Tours Array. Why: This is the ordered manifest of every "Explore the page" tour. How: This is mapped into CHE_IDE_ARR below.


	{ ideStr : 'explore_today',    labStr : 'Today',    pagStr : 'today',    timStr : '1 min'   }, // What: Today Page Tour Row. Why: This is the Today page tour's manifest entry. How: This lists its id, launcher label, nav button key, and time estimate.
	{ ideStr : 'explore_pickers',  labStr : 'Pickers',  pagStr : 'picker',   timStr : '1.5 min' }, // What: Pickers Page Tour Row. Why: This is the Pickers page tour's manifest entry. How: This lists its id, launcher label, nav button key, and time estimate.
	{ ideStr : 'explore_stats',    labStr : 'Stats',    pagStr : 'stats',    timStr : '1 min'   }, // What: Stats Page Tour Row. Why: This is the Stats page tour's manifest entry. How: This lists its id, launcher label, nav button key, and time estimate.
	{ ideStr : 'explore_data',     labStr : 'Data',     pagStr : 'data',     timStr : '< 1 min' }, // What: Data Page Tour Row. Why: This is the Data page tour's manifest entry. How: This lists its id, launcher label, nav button key, and time estimate.
	{ ideStr : 'explore_settings', labStr : 'Settings', pagStr : 'settings', timStr : '1 min'   }  // What: Settings Page Tour Row. Why: This is the Settings page tour's manifest entry. How: This lists its id, launcher label, nav button key, and time estimate.


];

// #endregion ONB_EPT_ARR



const ONB_GII_STR = 'ob_generate'; // What: Onboarding Generate-Item-Identifier String. Why: This is the fixed, load-bearing id for the single closing "Generate a real list" checklist card. How: This is CHE_IDE_ARR's own last entry and the checklist map's own key for that card's resolution.



const CHE_IDE_ARR = [ // What: Checklist Identifier Array. Why: This is the full, flat manifest of every checklist item id the app currently knows about (every sample picker, every sample task, every page tour, plus the closing Generate card). How: This concatenates the sample picker ids, the sample task ids, the page tour ids and ONB_GII_STR, in that fixed order.


	...ONB_SPI_ARR,                                          // What: Sample Picker IDs Spread. Why: Every seeded sample picker has its own checklist entry, resolved independently. How: This spreads ONB_SPI_ARR's own ids.
	...ONB_STI_ARR,                                          // What: Sample Task IDs Spread. Why: Every seeded sample task has its own checklist entry too. How: This spreads ONB_STI_ARR's own ids.
	...ONB_EPT_ARR.map( ( touConObj ) => touConObj.ideStr ), // What: Page Tour IDs Spread. Why: Every page tour has its own checklist entry, even with no sample data of its own. How: This maps ONB_EPT_ARR down to each tour's own ideStr.
	ONB_GII_STR                                              // What: Generate Item ID. Why: The single closing Generate card needs its own checklist entry as well. How: This is the fixed ONB_GII_STR.


];

// #endregion Constants



// #region Helpers

// #region entLooFun

/**
 * entLooFun = Entry Lookup Function
 *
 * @summary
 * Looks up one checklist item's own resolution entry, { status }, in
 * state.onboarding.checklist. A truthy result means the
 * item is resolved in any of the 3 ways (finished, skipped or
 * cancelled); null means it is still open. Tolerates a save with no
 * onboarding state at all.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param appStaObj - App State Object: The full app state object, read for
 *                    its own onboarding.checklist map.
 * @param iteIdeStr - Item Identifier String: The checklist item's own id.
 *
 * @returns The item's own resolution entry, or null when it has none.
 *
 * @example
 * ```ts
 * entLooFun(appStaObj, 'explore_today') // => { status : 'finished' }
 * ```
 *
*/

const entLooFun = ( appStaObj : StaAppTyp, iteIdeStr : string ) : { status : CheStaTyp } | null => ( appStaObj.onboarding && appStaObj.onboarding.checklist || {} )[ iteIdeStr ] || null; // What: Entry Lookup Function. Why: A checklist item's resolution, of any status, has to be readable by its id alone. How: This reads appStaObj.onboarding.checklist (falling back to an empty object when either is missing) and looks up iteIdeStr, defaulting to null when there's no entry yet.

// #endregion entLooFun



// #region cheStaFun

/**
 * cheStaFun = Checklist Status Function
 *
 * @summary
 * Computes { totNum, donNum, rmnNum, fulBoo } across every known
 * checklist item. "donNum" means resolved (any status), regardless of
 * which of the 3 resolution paths (finished/skipped/cancelled) actually
 * produced it.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param appStaObj - App State Object: The full app state object, read for its
 *                    own onboarding.checklist map via entLooFun above.
 *
 * @returns The checklist's own summary counts, as a plain object.
 *
 * @example
 * ```ts
 * cheStaFun(appStaObj) // => { totNum, donNum, rmnNum, fulBoo }
 * ```
 *
*/

function cheStaFun ( appStaObj : StaAppTyp ) : { donNum : number, fulBoo : boolean, rmnNum : number, totNum : number } {


	const totIteNum = CHE_IDE_ARR.length;                                                                // What: Total Item Number. Why: Every summary needs to know how many checklist items exist at all, as the denominator for "done". How: This is simply CHE_IDE_ARR's own length.
	const donIteNum = CHE_IDE_ARR.filter( ( iteIdeStr ) => !!entLooFun( appStaObj, iteIdeStr ) ).length; // What: Done Item Number. Why: An item counts as "done" once it has any resolution at all, regardless of which status it resolved to. How: This filters CHE_IDE_ARR down to ids with a truthy entLooFun lookup, then takes the resulting count.



	return { // What: Checklist Status Return. Why: The four summary fields are handed back together in one plain object. How: This builds totNum/donNum directly from totIteNum/donIteNum above, then derives fulBoo and rmnNum from them.


		donNum : donIteNum,               // What: Done Number. Why: This is the raw resolved-item count. How: This is donIteNum above, assigned under its own external property name.
		fulBoo : donIteNum === totIteNum, // What: Full Boolean. Why: This says whether every checklist item has been resolved. How: This is true only when donIteNum equals totIteNum, meaning nothing is left unresolved.
		rmnNum : totIteNum - donIteNum,   // What: Remaining Number. Why: This is how many items are still unresolved. How: This subtracts donIteNum from totIteNum.
		totNum : totIteNum                // What: Total Number. Why: This is the raw total-item count. How: This is totIteNum above, assigned under its own external property name.


	};


}

// #endregion cheStaFun



// #region othRmnFun

/**
 * othRmnFun = Others Remaining Function
 *
 * @summary
 * How many checklist items OTHER than the Generate card itself are still
 * unresolved.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param appStaObj - App State Object: The full app state object, read for its
 *                    own onboarding.checklist map via entLooFun above.
 *
 * @returns How many non-Generate checklist items still have no resolution at
 *          all, as a plain count.
 *
 * @example
 * ```ts
 * othRmnFun(appStaObj) // => 2
 * ```
 *
*/

function othRmnFun ( appStaObj : StaAppTyp ) : number { return CHE_IDE_ARR.filter( ( iteIdeStr ) => iteIdeStr !== ONB_GII_STR && !entLooFun( appStaObj, iteIdeStr ) ).length; } // What: Others Remaining Body. Why: This is a plain count of every non-Generate item that still has no resolution. How: This filters CHE_IDE_ARR down to ids that are neither the Generate card nor already resolved, then takes the resulting count.

// #endregion othRmnFun



// #region reaPicFun

/**
 * reaPicFun = Real Picker Function
 *
 * @summary
 * How many real (non-sample) pickers currently exist.
 *
 * Checks actual EXISTENCE in appStaObj.pickers, not checklist status: a
 * picker's own checklist entry can go from 'finished' back to unresolved (an
 * uncheck) or to 'cancelled'/'skipped' (an X, or Skip on a replay) without the
 * real picker it already created ever being deleted (see store.ts's addPicFun
 * replaceId comment).
 *
 * Counts hidden ones too: a picker created while the mini-tour
 * checklist is still up stays hidden only until the closing Generate
 * step (see tab-today.tsx's genResBoo effect), at which
 * point it becomes exactly the real data this is asking about.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param appStaObj - App State Object: The full app state object, read for its
 *                    own pickers array.
 *
 * @returns How many of appStaObj's own pickers are real (not one of the seeded
 *          samples), as a plain count.
 *
 * @example
 * ```ts
 * reaPicFun(appStaObj) // => 4
 * ```
 *
*/

function reaPicFun ( appStaObj : StaAppTyp ) : number { return appStaObj.pickers.filter( ( curPicObj ) => !ONB_SPI_ARR.includes( curPicObj.id ) ).length; } // What: Real Picker Body. Why: This is a plain count of every picker that isn't one of the seeded samples. How: This filters appStaObj.pickers down to ids absent from ONB_SPI_ARR, then takes the resulting count.

// #endregion reaPicFun



// #region reaGenFun

/**
 * reaGenFun = Ready Generate Function
 *
 * @summary
 * The Generate card is actionable once every OTHER item is resolved (ready to
 * generate) AND at least one real picker exists (see reaPicFun above).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param appStaObj - App State Object: The full app state object, passed
 *                    straight through to othRmnFun and reaPicFun above.
 *
 * @returns Whether the Generate card is actionable yet, as a boolean.
 *
 * @example
 * ```ts
 * reaGenFun(appStaObj) // => true
 * ```
 *
*/

function reaGenFun ( appStaObj : StaAppTyp ) : boolean { return othRmnFun( appStaObj ) === 0 && reaPicFun( appStaObj ) >= 1; } // What: Ready Generate Body. Why: This is a single boolean saying whether the Generate card can be actioned yet. How: This combines othRmnFun's own zero-check with reaPicFun's own >=1 check.

// #endregion reaGenFun



// #region tutProFun

/**
 * tutProFun = Tutorials Progress Function
 *
 * @summary
 * Whether we're anywhere between the Welcome Tour's very first step and the
 * closing Generate card's flow actually completing.
 *
 * True for the Welcome Tour's entire run (checked via activeTour), since
 * maiTouBoo below only turns true once a sample is hidden, then true again
 * straight through the mini-tour checklist phase until checklistDone. False
 * afterward, including once a Replay's Welcome Tour ends (checklistDone never
 * resets, see tab-today.tsx) and false for any existing user who upgraded into
 * a build with onboarding and so never had sample data seeded at all:
 * maiTouBoo requires actual hidden samples to exist, which protects that case.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param appStaObj - App State Object: The full app state object, read for its
 *                    own onboarding/pickers/tasks fields.
 *
 * @returns Whether tutorial-gated controls should currently stay disabled, as
 *          a boolean.
 *
 * @example
 * ```ts
 * tutProFun(appStaObj) // => false
 * ```
 *
*/

function tutProFun ( appStaObj : StaAppTyp ) : boolean {


	const onbStaObj = appStaObj.onboarding; // What: Onboarding State Object. Why: The guards and the return below read off this same sub-object, so it's worth resolving once up front. How: This reads appStaObj's own onboarding field directly.


	if ( !onbStaObj ) return false; // What: No Onboarding State Guard. Why: A save with no onboarding state at all was never seeded with sample data, so no tutorial can possibly be in progress. How: This bails out early, reporting false, when onbStaObj is missing.



	if ( onbStaObj.activeTour && onbStaObj.activeTour.id === 'welcome' ) return true; // What: Welcome Tour Active Guard. Why: The Welcome Tour's early steps run while no sample is hidden yet, so maiTouBoo below wouldn't catch this phase on its own. How: This reports true immediately whenever the persisted activeTour is specifically the 'welcome' tour.



	const picHidBoo = appStaObj.pickers.some( ( curPicObj ) => curPicObj.hidden && ONB_SPI_ARR.includes( curPicObj.id ) );         // What: Picker Hidden Boolean. Why: The mini-tour checklist phase only starts once the Welcome Tour has actually hidden at least one sample picker. How: This checks appStaObj.pickers for any picker that's both hidden and one of the seeded sample ids.
	const tasHidBoo = ( appStaObj.tasks || [] ).some( ( curTasObj ) => curTasObj.hidden && ONB_STI_ARR.includes( curTasObj.id ) ); // What: Task Hidden Boolean. Why: A hidden sample task counts exactly the same as a hidden sample picker for this check. How: This checks appStaObj.tasks (falling back to an empty array, since old saves may be missing it) for any task that's both hidden and one of the seeded sample ids.

	const maiTouBoo = picHidBoo || tasHidBoo; // What: Main Tour Boolean. Why: The mini-tour checklist phase only starts once the Welcome Tour has actually hidden at least one sample, either kind being enough. How: This is true whenever either picHidBoo or tasHidBoo is true.



	return maiTouBoo && !onbStaObj.checklistDone; // What: Tutorials-In-Progress Return. Why: The mini-tour checklist phase itself lasts from the main tour ending until the Generate card's own flow completes. How: This reports true only while a sample has actually been hidden and checklistDone hasn't yet flipped true.


}

// #endregion tutProFun

// #endregion Helpers



// #region Exports

const ONB_CHE_OBJ = { // What: Onboarding Checklist Object. Why: This gathers the checklist helpers into one namespace object rather than several individual named exports. How: This maps every internal implementation onto an external property name matching it exactly.


	cheStaFun : cheStaFun, // What: Checklist Status Function. Why: This is the checklist's summary counts. How: This exports cheStaFun under its own matching name.
	entLooFun : entLooFun, // What: Entry Lookup Function. Why: This looks up one checklist item's own resolution. How: This exports entLooFun under its own matching name.
	othRmnFun : othRmnFun, // What: Others Remaining Function. Why: This counts the open items other than the Generate card. How: This exports othRmnFun under its own matching name.
	reaGenFun : reaGenFun, // What: Ready Generate Function. Why: This says whether the Generate card is actionable. How: This exports reaGenFun under its own matching name.
	reaPicFun : reaPicFun, // What: Real Picker Function. Why: This counts the real, non-sample pickers. How: This exports reaPicFun under its own matching name.
	tutProFun : tutProFun  // What: Tutorials Progress Function. Why: This says whether the tutorials are in progress. How: This exports tutProFun under its own matching name.


};



export { ONB_CHE_OBJ, ONB_EPT_ARR, ONB_GII_STR }; // What: Named Exports. Why: The checklist helpers go out through the ONB_CHE_OBJ namespace, alongside the page-tour manifest and the Generate card's id. How: This exports all three by name.

// #endregion Exports


