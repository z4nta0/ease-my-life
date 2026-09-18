


// #region Imports

import { OB_SAMPLE_PICKER_IDS } from './onboarding-seed-data.js'; // What: Onboarding Sample Picker Ids. Why: This module needs every seeded sample picker's own id to build its own 'sample' checklist entries below and to tell a real, user-created picker apart from a sample one. How: This is read directly by reaPicFun below and mapped into CHE_ITE_ARR's own 'sample' entries.
import { OB_SAMPLE_TASK_IDS   } from './onboarding-seed-data.js'; // What: Onboarding Sample Task Ids. Why: This module needs every seeded sample task's own id to build its own 'sample' checklist entries below. How: This is mapped into CHE_ITE_ARR's own 'sample' entries, one per seeded sample task id.

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
 * pickers/reminders, built programmatically from OB_SAMPLE_PICKER_IDS
 * and OB_SAMPLE_TASK_IDS, so a new sample card needs no changes here.
 * 'pageTour' is an "Explore the {page}" tour, not tied to any sample
 * picker/reminder: no data to finish/skip/cancel, just the same
 * checklist bookkeeping. These render in their own "Page Tours" section
 * on Today (see tab-today.jsx), between Reminders and the picker
 * groups. 'generate' is the single closing card, whose fixed id is
 * ONB_GII_STR below.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



export const ONB_GII_STR = 'ob_generate'; // What: Onboarding Generate-Item-Id String. Why: This is the fixed, load-bearing id for the single closing "Generate a real list" checklist card. How: This is used as CHE_ITE_ARR's own 'generate' entry key and as the checklist map's own key for that card's resolution.



/**
 * ONB_EPT_ARR = Onboarding Explore-Page-Tours Array
 *
 * @summary
 * One entry per page tour, in the order their cards/tours should
 * appear. `page` matches the `data-tab` value on that page's own nav
 * button (see app.jsx's TabBarCom). It isn't used yet, but it's what
 * each tour's own "explore" step will target once built.
 *
 * `time` is a real, user-confirmed estimate (manually timed
 * 2026-08-14) shown on the tour's Today launcher card (see
 * tab-today.jsx's PageTourCard).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

export const ONB_EPT_ARR = [ // What: Onboarding Explore-Page-Tours Array. Why: This is the ordered manifest of every "Explore the page" tour described above. How: This is mapped into CHE_ITE_ARR's own 'pageTour' entries below, and read directly by onboarding-page-tours.jsx and tab-today.jsx.


	{ id : 'explore_today',    page : 'today',    label : 'Today',    time : '1 min'   }, // What: Identifier String. Why: This is this page tour's own stable id, matched against a resolved checklist item id in state.onboarding.checklist and against activeTour's own "page-" prefixed suffix. How: This is read by CHE_ITE_ARR below and by every ONB_CHE_OBJ.entLooFun lookup keyed on a page tour. // What: Page String. Why: This must match the data-tab value on this page's own nav button so a future "explore" step can target it. How: This is read directly by onboarding-page-tours.jsx to resolve the tour's own nav target. // What: Label String. Why: This names the page shown on this tour's own Today launcher card. How: This is rendered directly as the card's visible page name (see tab-today.jsx's PageTourCard). // What: Time String. Why: This is a real, user-confirmed estimate (manually timed 2026-08-14) of how long this tour takes. How: This is rendered on the tour's Today launcher card (see tab-today.jsx's PageTourCard).
	{ id : 'explore_pickers',  page : 'picker',   label : 'Pickers',  time : '1.5 min' }, // What: Identifier String. Why: This is this page tour's own stable id, matched against a resolved checklist item id in state.onboarding.checklist and against activeTour's own "page-" prefixed suffix. How: This is read by CHE_ITE_ARR below and by every ONB_CHE_OBJ.entLooFun lookup keyed on a page tour. // What: Page String. Why: This must match the data-tab value on this page's own nav button so a future "explore" step can target it. How: This is read directly by onboarding-page-tours.jsx to resolve the tour's own nav target. // What: Label String. Why: This names the page shown on this tour's own Today launcher card. How: This is rendered directly as the card's visible page name (see tab-today.jsx's PageTourCard). // What: Time String. Why: This is a real, user-confirmed estimate (manually timed 2026-08-14) of how long this tour takes. How: This is rendered on the tour's Today launcher card (see tab-today.jsx's PageTourCard).
	{ id : 'explore_stats',    page : 'stats',    label : 'Stats',    time : '1 min'   }, // What: Identifier String. Why: This is this page tour's own stable id, matched against a resolved checklist item id in state.onboarding.checklist and against activeTour's own "page-" prefixed suffix. How: This is read by CHE_ITE_ARR below and by every ONB_CHE_OBJ.entLooFun lookup keyed on a page tour. // What: Page String. Why: This must match the data-tab value on this page's own nav button so a future "explore" step can target it. How: This is read directly by onboarding-page-tours.jsx to resolve the tour's own nav target. // What: Label String. Why: This names the page shown on this tour's own Today launcher card. How: This is rendered directly as the card's visible page name (see tab-today.jsx's PageTourCard). // What: Time String. Why: This is a real, user-confirmed estimate (manually timed 2026-08-14) of how long this tour takes. How: This is rendered on the tour's Today launcher card (see tab-today.jsx's PageTourCard).
	{ id : 'explore_data',     page : 'data',     label : 'Data',     time : '< 1 min' }, // What: Identifier String. Why: This is this page tour's own stable id, matched against a resolved checklist item id in state.onboarding.checklist and against activeTour's own "page-" prefixed suffix. How: This is read by CHE_ITE_ARR below and by every ONB_CHE_OBJ.entLooFun lookup keyed on a page tour. // What: Page String. Why: This must match the data-tab value on this page's own nav button so a future "explore" step can target it. How: This is read directly by onboarding-page-tours.jsx to resolve the tour's own nav target. // What: Label String. Why: This names the page shown on this tour's own Today launcher card. How: This is rendered directly as the card's visible page name (see tab-today.jsx's PageTourCard). // What: Time String. Why: This is a real, user-confirmed estimate (manually timed 2026-08-14) of how long this tour takes. How: This is rendered on the tour's Today launcher card (see tab-today.jsx's PageTourCard).
	{ id : 'explore_settings', page : 'settings', label : 'Settings', time : '1 min'   }, // What: Identifier String. Why: This is this page tour's own stable id, matched against a resolved checklist item id in state.onboarding.checklist and against activeTour's own "page-" prefixed suffix. How: This is read by CHE_ITE_ARR below and by every ONB_CHE_OBJ.entLooFun lookup keyed on a page tour. // What: Page String. Why: This must match the data-tab value on this page's own nav button so a future "explore" step can target it. How: This is read directly by onboarding-page-tours.jsx to resolve the tour's own nav target. // What: Label String. Why: This names the page shown on this tour's own Today launcher card. How: This is rendered directly as the card's visible page name (see tab-today.jsx's PageTourCard). // What: Time String. Why: This is a real, user-confirmed estimate (manually timed 2026-08-14) of how long this tour takes. How: This is rendered on the tour's Today launcher card (see tab-today.jsx's PageTourCard).


];



const CHE_ITE_ARR = [ // What: Checklist Item Array. Why: This is the full, flat manifest of every checklist item the app currently knows about (every sample picker, every sample task, every page tour, plus the closing Generate card), across all 3 item kinds. How: This concatenates a 'sample' entry per OB_SAMPLE_PICKER_IDS/OB_SAMPLE_TASK_IDS id, a 'pageTour' entry per ONB_EPT_ARR entry, and the single 'generate' entry, in that fixed order.


	...OB_SAMPLE_PICKER_IDS.map( ( picIdeStr ) => ( { id : picIdeStr, kind : 'sample', entityKind : 'picker' } ) ), // What: Sample Picker Entries. Why: Every seeded sample picker needs its own 'sample' checklist entry so it can be resolved (finished/skipped/cancelled) independently. How: This maps OB_SAMPLE_PICKER_IDS down to one { id, kind, entityKind } object per sample picker id.
	...OB_SAMPLE_TASK_IDS.map( ( tasIdeStr ) => ( { id : tasIdeStr, kind : 'sample', entityKind : 'task' } ) ),     // What: Sample Task Entries. Why: Every seeded sample task needs its own 'sample' checklist entry, same reasoning as the picker entries above. How: This maps OB_SAMPLE_TASK_IDS down to one { id, kind, entityKind } object per sample task id.
	...ONB_EPT_ARR.map( ( touConObj ) => ( { id : touConObj.id, kind : 'pageTour' } ) ),                            // What: Page Tour Entries. Why: Every page tour needs its own checklist entry too, even though it has no sample data of its own to finish/skip/cancel. How: This maps ONB_EPT_ARR down to one { id, kind } object per page tour entry, keyed by that tour's own id.
	{ id : ONB_GII_STR, kind : 'generate' }                                                                         // What: Generate Entry. Why: The single closing Generate card needs its own checklist entry, the same as every other item. How: This is a single { id, kind } object, keyed by the fixed ONB_GII_STR above.


];



const entLooFun = ( appStaObj, iteIdeStr ) => ( appStaObj.onboarding && appStaObj.onboarding.checklist || {} )[ iteIdeStr ] || null; // What: Entry Lookup Function. Why: Every other function in this module needs to know whether one specific checklist item has already been resolved (any status), keyed by its own id. How: This reads appStaObj.onboarding.checklist (falling back to an empty object when either is missing) and looks up iteIdeStr, defaulting to null when there's no entry yet.



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
 *                    own onboarding.checklist map via entLooFun below.
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


	const totIteNum = CHE_ITE_ARR.length;                                                                   // What: Total Item Number. Why: Every summary needs to know how many checklist items exist at all, as the denominator for "done". How: This is simply CHE_ITE_ARR's own length.
	const donIteNum = CHE_ITE_ARR.filter( ( curIteObj ) => !!entLooFun( appStaObj, curIteObj.id ) ).length; // What: Done Item Number. Why: An item counts as "done" once it has any resolution at all, regardless of which status it resolved to. How: This filters CHE_ITE_ARR down to items with a truthy entLooFun lookup, then takes the resulting count.



	return { // What: Checklist Status Return. Why: The caller needs all 4 summary counts at once, in one plain object. How: This builds totNum/donNum directly from totIteNum/donIteNum above, then derives rmnNum and comBoo from them.


		comBoo : donIteNum === totIteNum, // What: Complete Boolean. Why: The caller needs to know at a glance whether every checklist item has been resolved. How: This is true only when donIteNum equals totIteNum, meaning nothing is left unresolved.
		donNum : donIteNum,               // What: Done Number. Why: The caller needs the raw resolved-item count as one of the summary's own fields. How: This is donIteNum above, assigned under its own external property name.
		rmnNum : totIteNum - donIteNum,   // What: Remaining Number. Why: The caller needs to know how many items are still unresolved. How: This subtracts donIteNum from totIteNum.
		totNum : totIteNum                // What: Total Number. Why: The caller needs the raw total-item count as one of the summary's own fields. How: This is totIteNum above, assigned under its own external property name.


	};


}

// #endregion cheStaFun



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
 * deleted (see store.jsx's addPicker replaceId comment), so checking
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

function reaPicFun ( appStaObj ) { return appStaObj.pickers.filter( ( curPicObj ) => !OB_SAMPLE_PICKER_IDS.includes( curPicObj.id ) ).length; } // What: Real Picker Count Return. Why: The caller needs a plain count of every picker that isn't one of the seeded samples. How: This filters appStaObj.pickers down to ids absent from OB_SAMPLE_PICKER_IDS, then takes the resulting count.

// #endregion reaPicFun



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

function othRemFun ( appStaObj ) { return CHE_ITE_ARR.filter( ( curIteObj ) => curIteObj.id !== ONB_GII_STR && !entLooFun( appStaObj, curIteObj.id ) ).length; } // What: Others Remaining Return. Why: The caller needs a plain count of every non-Generate item that still has no resolution. How: This filters CHE_ITE_ARR down to items that are neither the Generate card nor already resolved, then takes the resulting count.

// #endregion othRemFun



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
 *                    straight through to othRemFun and reaPicFun below.
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
 * store.jsx's migrate).
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



	const picHidBoo = appStaObj.pickers.some( ( curPicObj ) => curPicObj.hidden && OB_SAMPLE_PICKER_IDS.includes( curPicObj.id ) );       // What: Picker Hidden Boolean. Why: The mini-tour checklist phase only starts once the Welcome Tour's own last step has actually hidden at least one sample picker. How: This checks appStaObj.pickers for any picker that's both hidden and one of the seeded sample ids.
	const tasHidBoo = ( appStaObj.tasks || [] ).some( ( curTasObj ) => curTasObj.hidden && OB_SAMPLE_TASK_IDS.includes( curTasObj.id ) ); // What: Task Hidden Boolean. Why: A hidden sample task counts exactly the same as a hidden sample picker for this check. How: This checks appStaObj.tasks (falling back to an empty array, since old saves may be missing it) for any task that's both hidden and one of the seeded sample ids.

	const maiTouBoo = picHidBoo || tasHidBoo; // What: Main Tour (Ended) Boolean. Why: The mini-tour checklist phase only starts once the Welcome Tour's own last step has actually hidden at least one sample, either kind being enough. How: This is true whenever either picHidBoo or tasHidBoo is true.



	return maiTouBoo && !onbStaObj.checklistDone; // What: Tutorials-In-Progress Return. Why: The mini-tour checklist phase itself lasts from the main tour ending until the Generate card's own flow completes. How: This reports true only while a sample has actually been hidden and checklistDone hasn't yet flipped true.


}

// #endregion tutProFun



export const ONB_CHE_OBJ = { // What: Onboarding Checklist Object. Why: store.jsx/reminders.jsx/tab-today.jsx/tab-picker.jsx/tab-data.jsx all import this one namespace object rather than several individual named exports. How: This maps every one of this file's own internal implementations onto an external property name matching it exactly, swept everywhere at once so external and internal names never drift apart.


	cheIteArr : CHE_ITE_ARR, // What: Checklist Item Array. Why: Some future caller may need the full flat manifest directly rather than one of the derived helpers below. How: This re-exports CHE_ITE_ARR as cheIteArr, consistent with this object's own other property names.
	cheStaFun : cheStaFun,   // What: Checklist Status Function. Why: tab-today.jsx reads this to decide whether the whole checklist (and therefore its own launcher UI) is complete, by this exact name. How: This re-exports cheStaFun under its own matching name.
	entLooFun : entLooFun,   // What: Entry Lookup Function. Why: Every consuming file needs to check one specific checklist item's own resolution, by this exact name. How: This re-exports entLooFun under its own matching name.
	othRemFun : othRemFun,   // What: Others Remaining Function. Why: tab-today.jsx reads this for the Generate card's own dynamic explanation text, by this exact name. How: This re-exports othRemFun under its own matching name.
	reaGenFun : reaGenFun,   // What: Ready Generate Function. Why: store.jsx and tab-today.jsx both gate the Generate card's own actionability on this, by this exact name. How: This re-exports reaGenFun under its own matching name.
	reaPicFun : reaPicFun,   // What: Real Picker Function. Why: store.jsx and tab-today.jsx both gate real-data-exists checks on this, by this exact name. How: This re-exports reaPicFun under its own matching name.
	tutProFun : tutProFun    // What: Tutorials Progress Function. Why: reminders.jsx/tab-picker.jsx/tab-data.jsx all gate their own "add new X" controls on this, by this exact name. How: This re-exports tutProFun under its own matching name.


};


