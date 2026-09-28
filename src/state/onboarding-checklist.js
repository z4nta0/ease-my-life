


// #region Imports

import { ONB_SPI_ARR } from './onboarding-seed-data.js'; // What: Onboarding Sample-Picker-Ids Array. Why: This module needs every seeded sample picker's own id to list its own checklist entries below and to tell a real, user-created picker apart from a sample one. How: This is read directly by reaPicFun and tutProFun below, and spread into CHE_IDE_ARR.
import { ONB_STI_ARR } from './onboarding-seed-data.js'; // What: Onboarding Sample-Task-Ids Array. Why: This module needs every seeded sample task's own id to list its own checklist entries below. How: This is spread into CHE_IDE_ARR below and read by tutProFun.

// #endregion Imports



/**
 * onboarding-checklist.js = Onboarding Checklist
 *
 * @summary
 * The full "todo list" of mini-tour launcher cards shown on Today after
 * the main Welcome Tour ends, plus the one closing "Generate a real
 * list" card. Every item's resolution lives in one place,
 * state.onboarding.checklist: { [itemId]: { status, createdId? } },
 * where status is 'finished' | 'skipped' | 'cancelled'. It's set
 * instantly by X (cancelled), by skipping mid-mini-tour (skipped), or by
 * finishing a mini-tour (finished, with createdId pointing at the real
 * picker/task it produced, for sample items only).
 * state.onboarding.checklistDone flips true once the Generate card's own
 * flow completes; every card here stops rendering at that point, in one
 * shot.
 *
 * Sample data (see onboarding-seed-data.js) is never deleted or
 * re-hidden by any of this. It's hidden exactly once, at the main
 * tour's last step, and stays that way forever. Resolving/unresolving a
 * card only ever touches this checklist map, never the sample itself,
 * which is what makes unchecking a card (to redo its mini-tour) free:
 * nothing needs restoring.
 *
 * Three item kinds exist. 'sample' is one of the Welcome Tour's sample
 * pickers/reminders, listed programmatically from ONB_SPI_ARR
 * and ONB_STI_ARR, so a new sample card needs no changes here.
 * 'pageTour' is an "Explore the {page}" tour, not tied to any sample
 * picker/reminder: no data to finish/skip/cancel, just the same
 * checklist bookkeeping. These render in their own "Page Tours" section
 * on Today (see tab-today.jsx), between Reminders and the picker
 * groups. 'generate' is the single closing card, whose fixed id is
 * ONB_GII_STR below. The kinds are conceptual only: CHE_IDE_ARR stores
 * just the item ids, since nothing reads an item's kind.
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
 *   Today launcher card (see tab-today.jsx's PagTouCom).
 *
 * - `pagStr` (String): Page String, matching the `data-tab` value on
 *   that page's own nav button (see app.jsx's TabBarCom), which the
 *   tour's own opening step targets.
 *
 * - `timStr` (String): Time String, a real, user-confirmed estimate
 *   (manually timed 2026-08-14) shown on the tour's Today launcher card.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const ONB_EPT_ARR = [ // What: Onboarding Explore-Page-Tours Array. Why: This is the ordered manifest of every "Explore the page" tour. How: This is mapped into CHE_IDE_ARR below, and read directly by onboarding/page-tours.jsx and tab-today.jsx.


	{ ideStr : 'explore_today',    labStr : 'Today',    pagStr : 'today',    timStr : '1 min'   },
	{ ideStr : 'explore_pickers',  labStr : 'Pickers',  pagStr : 'picker',   timStr : '1.5 min' },
	{ ideStr : 'explore_stats',    labStr : 'Stats',    pagStr : 'stats',    timStr : '1 min'   },
	{ ideStr : 'explore_data',     labStr : 'Data',     pagStr : 'data',     timStr : '< 1 min' },
	{ ideStr : 'explore_settings', labStr : 'Settings', pagStr : 'settings', timStr : '1 min'   }


];

// #endregion ONB_EPT_ARR



const ONB_GII_STR = 'ob_generate'; // What: Onboarding Generate-Item-Id String. Why: This is the fixed, load-bearing id for the single closing "Generate a real list" checklist card. How: This is CHE_IDE_ARR's own last entry and the checklist map's own key for that card's resolution.



const CHE_IDE_ARR = [ // What: Checklist Identifier Array. Why: This is the full, flat manifest of every checklist item id the app currently knows about (every sample picker, every sample task, every page tour, plus the closing Generate card). How: This concatenates the sample picker ids, the sample task ids, the page tour ids and ONB_GII_STR, in that fixed order.


	...ONB_SPI_ARR,                                          // What: Sample Picker Ids Spread. Why: Every seeded sample picker has its own checklist entry, resolved independently. How: This spreads ONB_SPI_ARR's own ids.
	...ONB_STI_ARR,                                          // What: Sample Task Ids Spread. Why: Every seeded sample task has its own checklist entry too. How: This spreads ONB_STI_ARR's own ids.
	...ONB_EPT_ARR.map( ( touConObj ) => touConObj.ideStr ), // What: Page Tour Ids Spread. Why: Every page tour has its own checklist entry, even with no sample data of its own. How: This maps ONB_EPT_ARR down to each tour's own ideStr.
	ONB_GII_STR                                              // What: Generate Item Id. Why: The single closing Generate card needs its own checklist entry as well. How: This is the fixed ONB_GII_STR.


];

// #endregion Constants



// #region Helpers

// #region entLooFun

/**
 * entLooFun = Entry Lookup Function
 *
 * @summary
 * Looks up one checklist item's own resolution entry, { status,
 * createdId? }, in state.onboarding.checklist. A truthy result means the
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

const entLooFun = ( appStaObj, iteIdeStr ) => ( appStaObj.onboarding && appStaObj.onboarding.checklist || {} )[ iteIdeStr ] || null; // What: Entry Lookup Function. Why: Every other function in this module needs to know whether one specific checklist item has already been resolved (any status), keyed by its own id. How: This reads appStaObj.onboarding.checklist (falling back to an empty object when either is missing) and looks up iteIdeStr, defaulting to null when there's no entry yet.

// #endregion entLooFun



// #region cheStaFun

/**
 * cheStaFun = Checklist Status Function
 *
 * @summary
 * Computes { totNum, donNum, rmnNum, comBoo } across every known
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
 * cheStaFun(appStaObj) // => { totNum, donNum, rmnNum, comBoo }
 * ```
 *
*/

function cheStaFun ( appStaObj ) {


	const totIteNum = CHE_IDE_ARR.length;                                                                // What: Total Item Number. Why: Every summary needs to know how many checklist items exist at all, as the denominator for "done". How: This is simply CHE_IDE_ARR's own length.
	const donIteNum = CHE_IDE_ARR.filter( ( iteIdeStr ) => !!entLooFun( appStaObj, iteIdeStr ) ).length; // What: Done Item Number. Why: An item counts as "done" once it has any resolution at all, regardless of which status it resolved to. How: This filters CHE_IDE_ARR down to ids with a truthy entLooFun lookup, then takes the resulting count.



	return { // What: Checklist Status Return. Why: The caller needs all 4 summary counts at once, in one plain object. How: This builds totNum/donNum directly from totIteNum/donIteNum above, then derives rmnNum and comBoo from them.


		comBoo : donIteNum === totIteNum, // What: Complete Boolean. Why: The caller needs to know at a glance whether every checklist item has been resolved. How: This is true only when donIteNum equals totIteNum, meaning nothing is left unresolved.
		donNum : donIteNum,               // What: Done Number. Why: The caller needs the raw resolved-item count as one of the summary's own fields. How: This is donIteNum above, assigned under its own external property name.
		rmnNum : totIteNum - donIteNum,   // What: Remaining Number. Why: The caller needs to know how many items are still unresolved. How: This subtracts donIteNum from totIteNum.
		totNum : totIteNum                // What: Total Number. Why: The caller needs the raw total-item count as one of the summary's own fields. How: This is totIteNum above, assigned under its own external property name.


	};


}

// #endregion cheStaFun



// #region othRemFun

/**
 * othRemFun = Others Remaining Function
 *
 * @summary
 * How many checklist items OTHER than the Generate card itself are
 * still unresolved. Used both by reaGenFun below and by the Generate
 * card's own dynamic explanation text (see tab-today.jsx).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param appStaObj - App State Object: The full app state object, read for its
 *                    own onboarding.checklist map via entLooFun above.
 *
 * @returns How many non-Generate checklist items still have no
 * resolution at all, as a plain count.
 *
 * @example
 * ```ts
 * othRemFun(appStaObj) // => 2
 * ```
 *
*/

function othRemFun ( appStaObj ) { return CHE_IDE_ARR.filter( ( iteIdeStr ) => iteIdeStr !== ONB_GII_STR && !entLooFun( appStaObj, iteIdeStr ) ).length; } // What: Others Remaining Return. Why: The caller needs a plain count of every non-Generate item that still has no resolution. How: This filters CHE_IDE_ARR down to ids that are neither the Generate card nor already resolved, then takes the resulting count.

// #endregion othRemFun



// #region reaPicFun

/**
 * reaPicFun = Real Picker Function
 *
 * @summary
 * How many real (non-sample) pickers currently exist. The Generate card
 * (and every still-open "Create a picker" card's amber "needs
 * attention" cue) stays gated on this being >= 1, so there's always at
 * least one real picker for the real generate to draw from.
 *
 * Checks actual EXISTENCE in appStaObj.pickers, not checklist status: a
 * picker's own checklist entry can go from 'finished' back to
 * unresolved (an uncheck) or to 'cancelled'/'skipped' (an X, or Skip on
 * a replay) without the real picker it already created ever being
 * deleted (see store.js's addPicFun replaceId comment), so checking
 * status here would wrongly re-flag cards as needing attention even
 * though real data already exists.
 *
 * Counts hidden ones too: a picker created while the mini-tour
 * checklist is still up stays hidden only until the closing Generate
 * step (see tab-today.jsx's generateItemResolved effect), at which
 * point it becomes exactly the real data this is asking about.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param appStaObj - App State Object: The full app state object, read for its
 *                    own pickers array.
 *
 * @returns How many of appStaObj's own pickers are real (not one of
 * the seeded samples), as a plain count.
 *
 * @example
 * ```ts
 * reaPicFun(appStaObj) // => 4
 * ```
 *
*/

function reaPicFun ( appStaObj ) { return appStaObj.pickers.filter( ( curPicObj ) => !ONB_SPI_ARR.includes( curPicObj.id ) ).length; } // What: Real Picker Count Return. Why: The caller needs a plain count of every picker that isn't one of the seeded samples. How: This filters appStaObj.pickers down to ids absent from ONB_SPI_ARR, then takes the resulting count.

// #endregion reaPicFun



// #region reaGenFun

/**
 * reaGenFun = Ready Generate Function
 *
 * @summary
 * The Generate card is actionable once every OTHER item is resolved
 * (ready to generate) AND at least one real picker exists (see
 * reaPicFun above). It's still visible before that, just blocked.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param appStaObj - App State Object: The full app state object, passed
 *                    straight through to othRemFun and reaPicFun above.
 *
 * @returns Whether the Generate card is actionable yet, as a boolean.
 *
 * @example
 * ```ts
 * reaGenFun(appStaObj) // => true
 * ```
 *
*/

function reaGenFun ( appStaObj ) { return othRemFun( appStaObj ) === 0 && reaPicFun( appStaObj ) >= 1; } // What: Ready-To-Generate Return. Why: The caller needs a single boolean saying whether the Generate card can actually be actioned yet. How: This combines othRemFun's own zero-check with reaPicFun's own >=1 check.

// #endregion reaGenFun



// #region tutProFun

/**
 * tutProFun = Tutorials Progress Function
 *
 * @summary
 * Whether we're anywhere between the Welcome Tour's very first step and
 * the closing Generate card's flow actually completing. Used to gate
 * every "add new X" control (reminders, pickers, conditionals, picker
 * items) that would otherwise let a user create real data mid-tutorial,
 * before the sample data every step is narrating has even finished
 * being reviewed.
 *
 * True for the tour's ENTIRE run (checked via activeTour, since
 * maiTouBoo below doesn't flip until the tour's next-to-last step hides
 * the samples), then true again straight through the mini-tour
 * checklist phase until checklistDone. False afterward, including for a
 * Replay (checklistDone never resets, see tab-today.jsx) and false for
 * any existing user who upgraded into a build with onboarding and so
 * never had sample data seeded at all: maiTouBoo requires actual hidden
 * samples to exist, which protects that case independent of
 * checklistDone's own backfilled-false default for legacy saves (see
 * store.js's migStaFun).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param appStaObj - App State Object: The full app state object, read for its
 *                    own onboarding/pickers/tasks fields.
 *
 * @returns Whether tutorial-gated controls should currently stay
 * disabled, as a boolean.
 *
 * @example
 * ```ts
 * tutProFun(appStaObj) // => false
 * ```
 *
*/

function tutProFun ( appStaObj ) {


	const onbStaObj = appStaObj.onboarding; // What: Onboarding State Object. Why: Every check below reads off this same sub-object, so it's worth resolving once up front. How: This reads appStaObj's own onboarding field directly.


	if ( !onbStaObj ) return false; // What: No Onboarding State Guard. Why: A save with no onboarding state at all was never seeded with sample data, so no tutorial can possibly be in progress. How: This bails out early, reporting false, when onbStaObj is missing.



	if ( onbStaObj.activeTour && onbStaObj.activeTour.id === 'welcome' ) return true; // What: Welcome Tour Active Guard. Why: The Welcome Tour's own steps run before any sample picker/task is ever hidden, so maiTouBoo below wouldn't catch this phase on its own. How: This reports true immediately whenever the persisted activeTour is specifically the 'welcome' tour.



	const picHidBoo = appStaObj.pickers.some( ( curPicObj ) => curPicObj.hidden && ONB_SPI_ARR.includes( curPicObj.id ) );         // What: Picker Hidden Boolean. Why: The mini-tour checklist phase only starts once the Welcome Tour's own last step has actually hidden at least one sample picker. How: This checks appStaObj.pickers for any picker that's both hidden and one of the seeded sample ids.
	const tasHidBoo = ( appStaObj.tasks || [] ).some( ( curTasObj ) => curTasObj.hidden && ONB_STI_ARR.includes( curTasObj.id ) ); // What: Task Hidden Boolean. Why: A hidden sample task counts exactly the same as a hidden sample picker for this check. How: This checks appStaObj.tasks (falling back to an empty array, since old saves may be missing it) for any task that's both hidden and one of the seeded sample ids.

	const maiTouBoo = picHidBoo || tasHidBoo; // What: Main Tour (Ended) Boolean. Why: The mini-tour checklist phase only starts once the Welcome Tour's own last step has actually hidden at least one sample, either kind being enough. How: This is true whenever either picHidBoo or tasHidBoo is true.



	return maiTouBoo && !onbStaObj.checklistDone; // What: Tutorials-In-Progress Return. Why: The mini-tour checklist phase itself lasts from the main tour ending until the Generate card's own flow completes. How: This reports true only while a sample has actually been hidden and checklistDone hasn't yet flipped true.


}

// #endregion tutProFun

// #endregion Helpers



// #region Exports

const ONB_CHE_OBJ = { // What: Onboarding Checklist Object. Why: store.js, the reminders files, tab-today.jsx, tab-picker.jsx, and tab-data.jsx all import this one namespace object rather than several individual named exports. How: This maps every one of this file's own internal implementations onto an external property name matching it exactly, swept everywhere at once so external and internal names never drift apart.


	cheStaFun : cheStaFun, // What: Checklist Status Function. Why: tab-today.jsx reads this to decide whether the whole checklist (and therefore its own launcher UI) is complete, by this exact name. How: This re-exports cheStaFun under its own matching name.
	entLooFun : entLooFun, // What: Entry Lookup Function. Why: Every consuming file needs to check one specific checklist item's own resolution, by this exact name. How: This re-exports entLooFun under its own matching name.
	othRemFun : othRemFun, // What: Others Remaining Function. Why: tab-today.jsx reads this for the Generate card's own dynamic explanation text, by this exact name. How: This re-exports othRemFun under its own matching name.
	reaGenFun : reaGenFun, // What: Ready Generate Function. Why: store.js and tab-today.jsx both gate the Generate card's own actionability on this, by this exact name. How: This re-exports reaGenFun under its own matching name.
	reaPicFun : reaPicFun, // What: Real Picker Function. Why: store.js and tab-today.jsx both gate real-data-exists checks on this, by this exact name. How: This re-exports reaPicFun under its own matching name.
	tutProFun : tutProFun  // What: Tutorials Progress Function. Why: the reminders files, tab-picker.jsx, and tab-data.jsx all gate their own "add new X" controls on this, by this exact name. How: This re-exports tutProFun under its own matching name.


};



export { ONB_CHE_OBJ, ONB_EPT_ARR, ONB_GII_STR }; // What: Named Exports. Why: Every checklist consumer uses the ONB_CHE_OBJ namespace, while tab-today.jsx and onboarding/page-tours.jsx also read the page-tour manifest and the Generate card's id. How: This exports all three by name.

// #endregion Exports


