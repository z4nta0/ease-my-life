


// #region Imports

import React from 'react'; // What: React. Why: Every component in this file is built directly on React's own APIs. How: This is used directly (React.useState, React.useRef, React.useCallback, React.useLayoutEffect, React.useEffect, React.forwardRef, React.useImperativeHandle, React.Fragment) throughout, instead of importing individual named hooks.


import { ButBasCom    } from './ui.jsx';                  // What: Button Base Component. Why: Every editor footer and quick-add form needs its own Cancel/Save/Delete buttons. How: This is rendered throughout EdiFooCom and the quick-add footer below.
import { ColDisCom    } from './ui.jsx';                  // What: Collapse Disclosure Component. Why: Every schedule subsection, log panel, and inline editor needs to animate open and closed instead of snapping. How: This wraps the anchor hint, the Reminders log, and every inline editor's own open state throughout this file.
import { emlTouObj    } from './eml-tour-bus.js';         // What: Ease My Life Tour Object. Why: A reminder mini-tour publishes prefill data and reads the live draft's own repeat kind through this shared bus. How: This is read via .get() in staAddFun and written to via .set() below.
import { freEdiFun    } from './ui.jsx';                  // What: Freeze Edited Function. Why: The Data tab's reminder list must not visibly reorder out from under an open editor as its own fields change. How: This is called once to compute disTasArr from sorTasArr.
import { IcoSvgCom    } from './ui.jsx';                  // What: Icon Svg Component. Why: Every reminder row, card, and button needs a recognizable glyph. How: This is rendered throughout RemCarCom, RemSecCom, and RemManCom.
import { InfTipCom    } from './ui.jsx';                  // What: Info Tip Component. Why: A disabled add control still needs to explain why it can't be clicked while a mini-tour checklist is in progress. How: This wraps the disabled add buttons in RemSecCom and RemManCom.
import { LogChiCom    } from './day-log.jsx';             // What: Log Chip Component. Why: The Reminders section's own header needs the same show-today's-log toggle chip as every other group. How: This is rendered in RemSecCom's header, gated on onToggleLog being supplied.
import { ONB_CHE_OBJ  } from './onboarding-checklist.js'; // What: Onboarding Checklist Object. Why: Both add-reminder entry points must stay disabled while any onboarding tutorial is still in progress. How: This is read via its own tutProFun and entLooFun helpers.
import { ONB_RCT_OBJ  } from './onboarding-seed-data.js'; // What: Onboarding Reminder-Card-Text Object. Why: A still-hidden sample reminder's own mini-tour launcher card needs copy distinct from its real schedule summary. How: This is looked up by sample task id inside RemCarCom's own isaTutBoo branch.
import { ONB_STI_ARR  } from './onboarding-seed-data.js'; // What: Onboarding Sample-Task-Ids Array. Why: Only the Welcome Tour's own seeded sample reminders should ever render as a mini-tour launcher card. How: This is checked against a hidden task's own id inside RemSecCom's tutTasArr filter.
import { redMotFun    } from './ui.jsx';                  // What: Reduce Motion Function. Why: A user who prefers reduced motion should get an instant close, skip, or remove instead of a timed animation. How: This is checked before every staged animation throughout this file.
import { RemLogCom    } from './day-log.jsx';             // What: Reminders Log Component. Why: The Reminders section's own header chip opens this exact audit panel. How: This is rendered inside RemSecCom, gated on logOpen.
import { sorEntFun    } from './ui.jsx';                  // What: Sort Entries Function. Why: The Data tab's reminder list needs the exact same sort vocabulary as the rest of the Data tab. How: This is called once per comparison inside RemManCom's own sorTasArr sort.
import { SorSelCom    } from './ui.jsx';                  // What: Sort Select Component. Why: The Data tab's reminder Items list needs the same sort control as every other Data tab list. How: This is rendered in RemManCom, driven by ITE_SOR_ARR.
import { TAS_NAM_OBJ  } from './tasks.js';                // What: Tasks Namespace Object. Why: Every due-ness, visibility, summary, and schedule computation in this file defers to the reminders engine instead of duplicating its logic. How: This namespace object is called throughout every component below.
import { useEscCanFun } from './ui.jsx';                  // What: Use Escape Cancel Function. Why: Both the quick-add form and EdiFooCom's own confirm flow need Escape to discard in-progress edits. How: This is called once each in EdiFooCom and RemSecCom.
import { WeeChiCom    } from './ui.jsx';                  // What: Weekday Chip Component. Why: A weekly schedule needs a multi-select control for its own chosen days. How: This is rendered inside SchEdiCom's own weekly schedule subsection.

// #endregion Imports



/**
 * reminders.jsx = Reminders User Interface
 *
 * @summary
 * Shared components for manual, statically-scheduled tasks (reminders),
 * rendered in two places: Today's RemSecCom (the list atop Today,
 * plus its own quick-add form) and Data's RemManCom (full
 * management, including the scheduling editor). All scheduling logic
 * lives in tasks.js (TAS_NAM_OBJ); this file is presentation plus small
 * local form state only. SegConCom, the animated segmented control
 * the schedule editor uses, is also exported for cadence-control.jsx and
 * tab-settings.jsx.
 *
 * Sections:
 *  - Constants
 *  - Helpers
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

// #region ITE_SOR_ARR

/**
 * ITE_SOR_ARR = Item Sort Array
 *
 * @summary
 * Item-list sort options for the Data tab's Reminders section,
 * extrapolated from the same vocabulary as the Data tab's own
 * section/item sorts (see sorEntFun in ui.jsx). Reminders
 * have no per-item Active/Inactive concept (no enabled/disabled
 * toggle, only a schedule and a today's-completion state, which isn't
 * the same thing) and no Group, so only Name and Type (One-time vs
 * Recurring) apply besides Date, the reminder's own next eligible
 * occurrence (TAS_NAM_OBJ.nexEliFun), the same date a Skip confirm
 * already computes elsewhere in this file. Labeled Soonest/Latest
 * rather than "Low to High"/"High to Low" like the numeric sorts
 * elsewhere, matching the app's own wording for date proximity (e.g.
 * the ease editor's Soonest/Latest). A reminder with no next
 * occurrence at all (rare, effectively stale, normally purged before
 * it'd ever be seen here) is a genuinely missing value, not an
 * irrelevant field the way Range/Odds/Boost are for a conditional
 * whose mode doesn't use them, so it uses sorEntFun's ordinary
 * top/bottom-by-direction N/A placement rather than always-last.
 *
 * Every entry shares one shape. Each row's own comment explains its
 * `keyStr`, while `labStr` repeats no comment of its own:
 *
 * - `keyStr` (String): Key String, the sort id SorSelCom compares
 *   against iteSorStr and reports via onChange.
 *
 * - `labStr` (String): Label String, the option's own visible menu
 *   text.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const ITE_SOR_ARR = [ // What: Item Sort Array. Why: RemManCom's own Items list sort control needs one entry per supported sort. How: This is passed as SorSelCom's own options prop from RemManCom below.


	{ keyStr : 'name-asc',  labStr : 'Name (A–Z)' }, // What: Key String. Why: This is the section's own default sort. How: SorSelCom compares this against iteSorStr and reports it via onChange.
	{ keyStr : 'name-desc', labStr : 'Name (Z–A)' }, // What: Key String. Why: This is the reverse of the default sort. How: SorSelCom compares this against iteSorStr and reports it via onChange.
	{ keyStr : 'type-asc',  labStr : 'Type (A–Z)' }, // What: Key String. Why: Type (One-time vs Recurring) is the only other text-like field reminders have. How: SorSelCom compares this against iteSorStr and reports it via onChange.
	{ keyStr : 'type-desc', labStr : 'Type (Z–A)' }, // What: Key String. Why: This is the reverse of the type sort. How: SorSelCom compares this against iteSorStr and reports it via onChange.
	{ keyStr : 'date-asc',  labStr : 'Soonest'    }, // What: Key String. Why: Date sorts by each reminder's own next eligible occurrence. How: SorSelCom compares this against iteSorStr and reports it via onChange.
	{ keyStr : 'date-desc', labStr : 'Latest'     }  // What: Key String. Why: This is the reverse of the date sort. How: SorSelCom compares this against iteSorStr and reports it via onChange.


];

// #endregion ITE_SOR_ARR



// #region REP_OPT_ARR

/**
 * REP_OPT_ARR = Repeat Option Array
 *
 * @summary
 * Every entry below shares this exact shape, passed as SegConCom's own
 * optIteArr prop from SchEdiCom below; none of the 5 entries repeat
 * these same fields' own boilerplate comments on their own lines (see
 * the "Repeated-shape object literals" comment exception in
 * CLAUDE.md). Each entry's own leading comment instead just names
 * which specific repeat option it represents.
 *
 * - `keyStr` (String): Key String is the value SchEdiCom compares
 *   against task.repeat and writes back on selection; SegConCom reads
 *   this against its own value prop and passes it to onChange.
 *
 * - `labStr` (String): Label String is the segmented control's own
 *   visible button text for this option, rendered by SegConCom as the
 *   button's own text content.
 *
 * - `subEle` (Element): Sub Element is the live sub-explanation shown
 *   under the Repeat control while this entry's own keyStr is
 *   selected; SchEdiCom looks this up by task.repeat and renders it
 *   directly.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const REP_OPT_ARR = [ // What: Repeat Option Array. Why: SchEdiCom's own Repeat control needs one entry per schedule kind, each with its own live sub-explanation. How: This is passed as SegConCom's own optIteArr prop from SchEdiCom below.


	{ // What: Once Option Entry. Why: A one-time reminder is the default, no-repeat option. How: This entry's own subEle explains it stays included until marked as completed.


		keyStr : 'once',
		labStr : 'Once',
		subEle : <>included in the Today page <strong>until marked as completed</strong></>


	},

	{ // What: Interval Option Entry. Why: An interval reminder repeats every N days, set via the extra-fields subsection below. How: This entry's own subEle explains it recurs as often as specified there.


		keyStr : 'interval',
		labStr : 'Every N days',
		subEle : <>included in the Today page <strong>as often as specified below</strong></>


	},

	{ // What: Weekly Option Entry. Why: A weekly reminder repeats on specific days of the week. How: This entry's own subEle explains it shows on the days specified below.


		keyStr : 'weekly',
		labStr : 'Weekly',
		subEle : <>included in the Today page <strong>on the days specified below</strong></>


	},

	{ // What: Monthly Option Entry. Why: A monthly reminder repeats once every month, or every N months. How: This entry's own subEle explains it recurs every month as specified below.


		keyStr : 'monthly',
		labStr : 'Monthly',
		subEle : <>included in the Today page <strong>every month as specified below</strong></>


	},

	{ // What: Annual Option Entry. Why: A yearly reminder repeats once every year, or every N years. How: This entry's own subEle explains it recurs every year as specified below.


		keyStr : 'annual',
		labStr : 'Yearly',
		subEle : <>included in the Today page <strong>every year as specified below</strong></>


	}


];

// #endregion REP_OPT_ARR

// #endregion Constants



// #region Helpers

// #region nexDatFun

/**
 * nexDatFun = Next Date Function
 *
 * @summary
 * Formats a next-eligible date as a full prose label, not a compact
 * one. The year is included whenever the date falls outside the
 * current year, and ALWAYS for a yearly reminder, where "Monday,
 * January 25" would otherwise read like a date days away rather than
 * next year's occurrence.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param nexDatObj - Next Date Object: The next-eligible date to format, or a
 *                    falsy value when there is none.
 * @param alwYeaBoo - Always Year Boolean: Whether the year must always be
 *                    included, regardless of whether nexDatObj falls in the
 *                    current year (true for a yearly reminder).
 *
 * @returns The full prose date label, or null when nexDatObj is falsy.
 *
 * @example
 * ```ts
 * nexDatFun(nexDatObj, alwYeaBoo) // => 'Monday, January 25, 2027'
 * ```
 *
*/

function nexDatFun ( nexDatObj, alwYeaBoo ) {


	if ( !nexDatObj ) return null; // What: Missing Date Guard. Why: A caller with no next-eligible date at all still needs a defined, safe return value. How: This returns null outright when nexDatObj is falsy.



	const shoYeaBoo = alwYeaBoo || nexDatObj.getFullYear() !== new Date().getFullYear(); // What: Show Year Boolean. Why: The year clutters a same-year date but is essential context for a yearly reminder or a date in a different year. How: This is true when alwYeaBoo was passed, or when nexDatObj's own year differs from the current year.


	const forOptObj = shoYeaBoo // What: Format Options Object. Why: The date's own locale format depends on whether the year shows. How: This picks one of the two options objects below based on shoYeaBoo.
		? { day : 'numeric', month : 'long', weekday : 'long', year : 'numeric' } // What: With-Year Format Object. Why: This is the full "Weekday, Month Day, Year" format used whenever shoYeaBoo is true. How: This is passed as toLocaleDateString's own options argument.
		: { day : 'numeric', month : 'long', weekday : 'long' };                  // What: Without-Year Format Object. Why: This is the shorter "Weekday, Month Day" format used for a same-year date on a non-yearly reminder. How: This is passed as toLocaleDateString's own options argument.



	return nexDatObj.toLocaleDateString( [], forOptObj ); // What: Next Date Return. Why: The caller needs the formatted label itself. How: This formats nexDatObj with forOptObj in the user's own locale.


}

// #endregion nexDatFun



// #region ordSufFun

/**
 * ordSufFun = Ordinal Suffix Function
 *
 * @summary
 * Appends the correct English ordinal suffix to a number (1st, 2nd,
 * 3rd, 4th, 11th, 21st, ...). Same algorithm as tasks.js's own
 * ordSufFun (and cadence.js's), duplicated per this file's own
 * isolation from the domain modules.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param ordValNum - Ordinal Value Number: The number to suffix.
 *
 * @returns ordValNum followed by its correct ordinal suffix, as a
 * string.
 *
 * @example
 * ```ts
 * ordSufFun(ordValNum) // => '1st', '2nd', '3rd', '4th', ...
 * ```
 *
*/

function ordSufFun ( ordValNum ) {


	const sufTexArr = [ 'th', 'st', 'nd', 'rd' ]; // What: Suffix Text Array. Why: Every English ordinal suffix boils down to one of just these 4 words. How: This is indexed below by lasTwoNum's own value.
	const lasTwoNum = ordValNum % 100;            // What: Last Two Number. Why: English ordinal suffixes are decided by a number's own last two digits (11th/12th/13th are the exception every other rule must respect). How: This is ordValNum modulo 100.



	return ordValNum + ( sufTexArr[ ( lasTwoNum - 20 ) % 10 ] || sufTexArr[ lasTwoNum ] || sufTexArr[ 0 ] ); // What: Ordinal Suffix Return. Why: The caller needs the full suffixed string back, not just the suffix. How: This picks sufTexArr's own entry for lasTwoNum minus 20 (handling 21st/22nd/23rd/31st/...), falling back to lasTwoNum directly (handling 11th/12th/13th), falling back to index 0 ('th') for everything else.


}

// #endregion ordSufFun



// #region paiSubFun

/**
 * paiSubFun = Pair Sub Function
 *
 * @summary
 * Data tab: full reminder management. Builds the dynamic
 * sub-explanation for a paired one-time/recurring toggle row, so it
 * always reflects which of the 2 types the setting actually applies
 * to right now.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param verTexStr - Version Text String: The trailing clause naming what the
 *                    setting does, e.g. 'trigger the day streak in the Today
 *                    page'.
 * @param neiConStr - Neither Conjunction String: The conjunction used in the
 *                    neither-selected phrasing, defaulting to 'and' ('nor'
 *                    reads better for a negatively-phrased verb).
 *
 * @returns A function of (oncEnaBoo, reuEnaBoo) that renders the correct
 * one of the 4 mutually-exclusive sub-explanation phrases.
 *
 * @example
 * ```ts
 * paiSubFun(verTexStr, neiConStr) // => (oncEnaBoo, reuEnaBoo) => <>...</>
 * ```
 *
*/

function paiSubFun ( verTexStr, neiConStr = 'and' ) {


	return ( oncEnaBoo, reuEnaBoo ) => ( // What: Pair Sub Return. Why: The caller (each REM_MAT_ARR entry's own dynFun) needs a function it can call with the live once/recurring toggle states. How: This renders one of the 4 mutually-exclusive phrases below.


		oncEnaBoo && reuEnaBoo // What: Both Check. Why: The phrase depends on which of the two classes has the setting on. How: This tests both flags first.
			? <><strong>both</strong> one-time and recurring items will { verTexStr }</>              // What: Both Phrase. Why: Both classes have this setting on. How: This names both item kinds.
			: oncEnaBoo                                                                               // What: Once-Only Check. Why: Only one class may have the setting on. How: This tests the one-time flag next.
			? <><strong>only</strong> one-time items will { verTexStr }</>                            // What: Once-Only Phrase. Why: Only the one-time class has this setting on. How: This names only one-time items.
			: reuEnaBoo                                                                               // What: Recurring-Only Check. Why: The recurring class may be the only one on. How: This tests the recurring flag last.
			? <><strong>only</strong> recurring items will { verTexStr }</>                           // What: Recurring-Only Phrase. Why: Only the recurring class has this setting on. How: This names only recurring items.
			: <><strong>neither</strong> one-time { neiConStr } recurring items will { verTexStr }</> // What: Neither Phrase. Why: Neither class has this setting on. How: This names neither item kind, joined by neiConStr.


	);


}

// #endregion paiSubFun



// #region REM_MAT_ARR

/**
 * REM_MAT_ARR = Reminder Matrix Array
 *
 * @summary
 * Every entry below shares this exact shape, mapped over in OptMatCom's
 * own JSX to render one participation-matrix row per entry; none of
 * the 5 entries repeat these same fields' own boilerplate comments on
 * their own lines (see the "Repeated-shape object literals" comment
 * exception in CLAUDE.md). Each entry's own leading comment instead
 * just names which specific setting it represents.
 *
 * - `dynFun` (Function): Dynamic Function is the row's own live
 *   sub-explanation, called by OptMatCom with the once/recurring
 *   classes' own current on/off state and returning the JSX phrase to
 *   render; every entry below builds this via paiSubFun, except the
 *   last, which is written out directly for its own documented reason.
 *
 * - `keyStr` (String): Key String ties this row to its own field on
 *   optObj[class], read and written by OptMatCom throughout.
 *
 * - `labStr` (String): Label String is the row's own visible setting
 *   name, rendered by OptMatCom as the row's own leading text.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const REM_MAT_ARR = [ // What: Reminder Matrix Array. Why: OptMatCom needs one row per participation setting, each pivoted across the once/recurring classes. How: This is mapped over in OptMatCom's JSX to render one matrix row per entry.


	{ // What: Streak Row Entry. Why: Whether a class counts toward the Today page's own day streak is its own independent participation setting. How: This entry's own dynFun explains which classes currently count.


		dynFun : paiSubFun( 'trigger the day streak in the Today page', 'nor' ),
		keyStr : 'streak',
		labStr : 'Counts toward day streak'


	},

	{ // What: Ring Row Entry. Why: Whether a class counts toward the Today page's own completion ring is its own independent participation setting. How: This entry's own dynFun explains which classes currently count.


		dynFun : paiSubFun( 'trigger the completion ring in the Today page', 'nor' ),
		keyStr : 'ring',
		labStr : 'Include in completion ring'


	},

	{ // What: Exclude Weekends Row Entry. Why: Whether a class is excluded from the Today page on weekends is its own independent participation setting. How: This entry's own dynFun explains which classes are currently excluded.


		dynFun : paiSubFun( 'show in the Today page on weekends', 'nor' ),
		keyStr : 'excludeWeekends',
		labStr : 'Exclude on weekends'


	},

	{ // What: Exclude Holidays Row Entry. Why: Whether a class is excluded from the Today page on holidays is its own independent participation setting. How: This entry's own dynFun explains which classes are currently excluded.


		dynFun : paiSubFun( 'show in the Today page on holidays', 'nor' ),
		keyStr : 'excludeHolidays',
		labStr : 'Exclude on holidays'


	},

	{ // What: Stats Row Entry. Why: Whether a class's own statistics show in the Stats page is its own independent participation setting. How: This entry's own dynFun (written directly, not via paiSubFun) explains which classes currently show.


		keyStr : 'stats',
		labStr : 'Include in Stats',

		dynFun : ( oncEnaBoo, reuEnaBoo ) => ( // What: Dynamic Function. Why: This row's own sub-explanation needs custom wording ("statistics") rather than paiSubFun's own generic verb phrasing, so it's written out directly instead of reusing paiSubFun. How: OptMatCom calls this with the live once/recurring toggle states.


			oncEnaBoo && reuEnaBoo // What: Both Check. Why: The phrase depends on which of the two classes shows statistics. How: This tests both flags first.
				? <><strong>both</strong> one-time and recurring item statistics will be shown in the Stats page</>    // What: Both Phrase. Why: Both classes show statistics. How: This names both item kinds.
				: oncEnaBoo                                                                                            // What: Once-Only Check. Why: Only one class may show statistics. How: This tests the one-time flag next.
				? <><strong>only</strong> one-time item statistics will be shown in the Stats page</>                  // What: Once-Only Phrase. Why: Only one-time statistics show. How: This names only one-time items.
				: reuEnaBoo                                                                                            // What: Recurring-Only Check. Why: The recurring class may be the only one shown. How: This tests the recurring flag last.
				? <><strong>only</strong> recurring item statistics will be shown in the Stats page</>                 // What: Recurring-Only Phrase. Why: Only recurring statistics show. How: This names only recurring items.
				: <><strong>neither</strong> one-time nor recurring item statistics will be shown in the Stats page</> // What: Neither Phrase. Why: Neither class shows statistics. How: This names neither item kind.


		)


	}


];

// #endregion REM_MAT_ARR



// #region reaPhrFun

/**
 * reaPhrFun = Reason Phrase Function
 *
 * @summary
 * The settings-based reasons a reminder isn't showing today, joined
 * with "and", in the order the participation switches appear in the
 * UI. Holidays name themselves and say which kind they are ("the
 * Christmas Day holiday" vs "your Family Day custom holiday"), so the
 * user knows where to go to change it.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param visResObj - Visibility Resolved Object: {@link
 *                    TAS_NAM_OBJ.todVisFun}'s own result object, carrying the
 *                    causes array and holiday name fields this function reads.
 *
 * @returns The joined reason phrase, e.g. 'weekends and the Christmas
 * Day holiday', or an empty string when no settings-based cause
 * applies.
 *
 * @example
 * ```ts
 * reaPhrFun(visResObj) // => 'weekends and the Christmas Day holiday'
 * ```
 *
*/

function reaPhrFun ( visResObj ) {


	const reaParArr = []; // What: Reason Part Array. Why: Every applicable settings-based cause below is collected here before being joined into one phrase. How: This is pushed onto by both branches below and joined at the very end.


	if ( visResObj.causes.includes( 'weekends' ) ) reaParArr.push( 'weekends' ); // What: Weekends Cause Guard. Why: Weekend exclusion is one of the possible settings-based reasons. How: This pushes the plain word onto reaParArr when visResObj's own causes include 'weekends'.



	if ( visResObj.causes.includes( 'holidays' ) ) { // What: Holidays Cause Guard. Why: Holiday exclusion is the other possible settings-based reason, and it needs its own specific holiday name when one is known. How: This pushes either a named-holiday phrase or the plain word 'holidays' onto reaParArr.


		const holPhrStr = visResObj.holidayName // What: Holiday Phrase String. Why: A named holiday reads better than the plain word. How: This picks the named phrase below when visResObj carries a holiday name.
			? ( visResObj.holidayCustom ? `your ${ visResObj.holidayName } custom holiday` : `the ${ visResObj.holidayName } holiday` ) // What: Named Holiday Phrase. Why: Naming the specific holiday tells the user exactly where to go to change it. How: This picks the custom-holiday or built-in-holiday phrasing based on visResObj's own holidayCustom flag.
			: 'holidays'; // What: Generic Holidays Fallback. Why: A holiday-based cause with no specific name still needs a defined phrase. How: This falls back to the plain word when visResObj's own holidayName is unset.


		reaParArr.push( holPhrStr ); // What: Holiday Phrase Push. Why: The holiday reason joins the other collected reasons. How: This appends holPhrStr to reaParArr.


	}



	return reaParArr.join( ' and ' ); // What: Reason Phrase Return. Why: The caller needs one joined, readable phrase, not a raw array. How: This joins every collected part with the word 'and'.


}

// #endregion reaPhrFun

// #endregion Helpers



// #region Components

// #region EdiFooCom

/**
 * EdiFooCom = Editor Foot Component
 *
 * @summary
 * The shared Cancel/Save/Delete footer for a reminder's editor, used by both
 * Today and Data so the two stay exact copies. Delete is confirm-gated inline,
 * morphing just this footer row while the schedule editor above stays intact.
 * The task is snapshotted on mount so Cancel can restore it, and a brand-new
 * reminder is discarded on any implicit close (unmounting without Save, Cancel
 * or Delete). A caller with its own close control calls the forwarded ref's
 * kepFun() first, so that close counts as a keep.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.isaNewBoo   - Is-A New Boolean: Whether the task is a
 *                            brand-new, not-yet-kept reminder, which an
 *                            implicit close discards and which shows no Delete
 *                            button.
 * @param props.onCanTasFun - On Cancel Task Function: Called with the
 *                            mount-time snapshot on Cancel, Escape, or an
 *                            implicit close of a new reminder.
 * @param props.onDelTasFun - On Delete Task Function: Called after a confirmed
 *                            Delete.
 * @param props.onDonTasFun - On Done Task Function: Called on Save.
 * @param props.tasRcdObj   - Task Record Object: The task being edited,
 *                            snapshotted once on mount.
 * @param extRefObj         - External Reference Object: The forwarded ref,
 *                            given a kepFun method that marks the next close
 *                            as already handled.
 *
 * @returns The plain footer, or the delete confirm prompt while it is
 * open.
 *
 * @example
 * ```tsx
 * EdiFooCom({ isaNewBoo, onCanTasFun, ... }, extRefObj) // => <EdiFooCom />
 * ```
 *
*/

const EdiFooCom = React.forwardRef( function EdiFooCom ( { isaNewBoo, onCanTasFun, onDelTasFun, onDonTasFun, tasRcdObj }, extRefObj ) { // What: Editor Foot Component. Why: Today and Data share one footer so the two stay exact copies. How: This forwards its ref so a caller's own close control can reach kepFun.


	const oriTasRef = React.useRef( tasRcdObj ); // What: Original Task Reference. Why: Cancel needs to restore the task exactly as it was when this footer (and its sibling editor) mounted. How: This snapshots tasRcdObj once, on mount, never updated afterward.
	const expDonRef = React.useRef( false );     // What: Explicit Done Reference. Why: The implicit-close effect below must not ALSO discard a brand-new reminder when Save/Cancel/Delete already handled it explicitly, or when an external close affordance already called kepFun. How: This is set true by every explicit action below, and read (never written) by the implicit-close effect.

	const [ conOpeBoo, setConOpeBoo ] = React.useState( false ); // What: Confirm Open Boolean And Setter. Why: Delete is confirm-gated, morphing this footer into a Delete/Cancel prompt instead of firing immediately. How: This toggles between the plain footer and the confirm prompt below.


	React.useImperativeHandle( extRefObj, () => ( { kepFun : () => { expDonRef.current = true; } } ) ); // What: Imperative Handle Publish. Why: A caller with its OWN close affordance outside this component (a row's own collapse chevron) needs to mark a save as already-handled before it closes, so that affordance reads as "done, keep this" rather than an implicit close. How: This exposes a single kepFun method that just flips expDonRef.


	const canNowFun = () => { // What: Cancel Now Function. Why: An explicit Cancel click needs to both mark itself as handled and actually revert the task. How: This flips expDonRef, then calls onCanTasFun with the original snapshot.


		expDonRef.current = true; // What: Explicit Done Mark. Why: The implicit-close effect must know this close was already handled. How: This flips expDonRef true.

		onCanTasFun( oriTasRef.current ); // What: Cancel Callback Call. Why: Cancel reverts the task to how it was when the editor opened. How: This passes the mount-time snapshot to onCanTasFun.


	};


	const donNowFun = () => { // What: Done Now Function. Why: An explicit Save click needs to both mark itself as handled and keep the live edits. How: This flips expDonRef, then calls onDonTasFun.


		expDonRef.current = true; // What: Explicit Done Mark. Why: The implicit-close effect must know this close was already handled. How: This flips expDonRef true.

		onDonTasFun(); // What: Done Callback Call. Why: Save keeps the live edits as they are. How: This calls onDonTasFun.


	};


	const delNowFun = () => { // What: Delete Now Function. Why: A confirmed Delete needs to both mark itself as handled and actually remove the task. How: This flips expDonRef, then calls onDelTasFun.


		expDonRef.current = true; // What: Explicit Done Mark. Why: The implicit-close effect must know this close was already handled. How: This flips expDonRef true.

		onDelTasFun(); // What: Delete Callback Call. Why: A confirmed Delete removes the task. How: This calls onDelTasFun.


	};


	React.useEffect( () => () => { if ( isaNewBoo && !expDonRef.current ) onCanTasFun( oriTasRef.current ); }, [] ); // What: Implicit Close Effect. Why: A brand-new, not-yet-kept reminder should be discarded if its editor closes ANY other way, not just an explicit Cancel. How: This runs only on unmount, discarding the draft only when it was new and nothing explicit already handled the close.

	useEscCanFun( true, () => { // What: Use Escape Cancel Function. Why: Escape should cancel the live edits, except while the delete confirm is up, where it should just back out of the confirm instead. How: This closes the confirm prompt when open, otherwise calls canNowFun.


		if ( conOpeBoo ) setConOpeBoo( false ); // What: Close Confirm Branch. Why: While the delete confirm prompt is up, Escape should just back out of it instead of cancelling the whole edit. How: This closes the confirm by setting conOpeBoo false.

		else canNowFun(); // What: Cancel Edits Branch. Why: With no confirm prompt up, Escape should cancel the live edits like an explicit Cancel click. How: This calls canNowFun.


	} );


	if ( conOpeBoo ) { // What: Confirm Open Branch. Why: The delete confirm prompt replaces the plain footer entirely while it's up. How: This returns the confirm prompt's own markup instead of falling through to the plain footer below.


		return (


			<div
				key='confirm'

				className='rem-inline-foot rem-foot-confirm'
			>{ /* What: Confirm Foot Div Element. Why: This is the delete-confirm prompt's own root, replacing the plain footer row. How: This renders the confirm message and its own Cancel/Delete actions. */ }


				<span className='rem-del-msg'>Delete this reminder?</span>{ /* What: Delete Message Span Element. Why: This asks the user to confirm before anything is actually removed. How: This renders the literal confirmation question. */ }

				<div className='rem-del-actions'>{ /* What: Delete Actions Div Element. Why: The confirm's own Cancel/Delete buttons need to sit together. How: This wraps both ButBasCom elements below. */ }


					<ButBasCom
						kinValStr='ghost'
						sizValStr='sm'

						onClick={ () => setConOpeBoo( false ) }
					>Cancel</ButBasCom>{ /* What: Button Base Component. Why: This backs out of the delete confirm without changing anything. How: This closes conOpeBoo, returning to the plain footer. */ }



					<ButBasCom
						kinValStr='danger'
						sizValStr='sm'

						onClick={ delNowFun }
					>Delete</ButBasCom>{ /* What: Button Base Component. Why: This is the actual, confirmed deletion trigger. How: This calls delNowFun, which marks itself handled and invokes onDelTasFun. */ }


				</div>


			</div>


		);


	}



	return (


		<div
			key='foot'

			className='rem-inline-foot rd-edit-foot'
		>{ /* What: Plain Foot Div Element. Why: This is the normal, non-confirming footer shown whenever conOpeBoo is false. How: This renders an optional Delete button (suppressed for a brand-new reminder) plus the Cancel/Save actions. */ }


			{ !isaNewBoo && ( // What: Delete Visibility Check. Why: A brand-new, not-yet-kept reminder has nothing to delete yet, only to discard via Cancel/implicit-close. How: This renders the Delete button only for an already-existing reminder.


				<ButBasCom
					icoNamStr='traEle'
					kinValStr='danger'
					sizValStr='sm'

					onClick={ () => setConOpeBoo( true ) }
				>Delete</ButBasCom> // What: Button Base Component. Why: This opens the delete confirm prompt above instead of deleting immediately. How: This sets conOpeBoo to true.


			) }



			<div className='rem-foot-right'>{ /* What: Foot Right Div Element. Why: Cancel and Save read as a pair, right-aligned opposite Delete. How: This wraps both ButBasCom elements below. */ }


				<ButBasCom
					kinValStr='ghost'
					sizValStr='sm'

					onClick={ canNowFun }
				>Cancel</ButBasCom>{ /* What: Button Base Component. Why: This discards the live edits and reverts to the original snapshot. How: This calls canNowFun. */ }



				<ButBasCom
					kinValStr='ghost'
					sizValStr='sm'

					onClick={ donNowFun }
				>Save</ButBasCom>{ /* What: Button Base Component. Why: This keeps the live edits as-is. How: This calls donNowFun. */ }


			</div>


		</div>


	);


} );

// #endregion EdiFooCom



// #region OptMatCom

/**
 * OptMatCom = Options Matrix Component
 *
 * @summary
 * Data tab: the Reminders Controls body, the participation matrix.
 * Rendered only while the Controls disclosure is open, so it snapshots
 * the options on mount; Cancel reverts every toggle changed since
 * opening, Save keeps them. Mirrors the picker Controls' own
 * Cancel/Save (no Delete, since these are global settings).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actStoObj   - Action Store Object: The shared actions bag.
 * @param props.onCloConFun - On Close Control Function: Collapses this
 *                            Controls body, called by both Cancel and Save.
 * @param props.remOptObj   - Reminder Option Object: The live { once,
 *                            recurring } participation options object.
 *
 * @returns The full participation matrix: its head row, one row per
 * REM_MAT_ARR entry, and its own Cancel/Save foot.
 *
 * @example
 * ```tsx
 * OptMatCom({ actStoObj, onCloConFun, remOptObj }) // => <OptMatCom />
 * ```
 *
*/

function OptMatCom ( { actStoObj, onCloConFun, remOptObj } ) {


	const snaOptRef = React.useRef( { once : { ...remOptObj.once }, recurring : { ...remOptObj.recurring } } ); // What: Snapshot Options Reference. Why: Cancel needs to restore every toggle exactly as it was when this component mounted. How: This shallow-copies both classes of remOptObj once, on mount, never updated afterward.

	const canMatFun = () => { // What: Cancel Matrix Function. Why: An explicit Cancel needs to both restore the snapshot and collapse the body. How: This calls actStoObj.revOptFun with snaOptRef's own snapshot, then onCloConFun.


		actStoObj.revOptFun( snaOptRef.current ); // What: Options Revert Call. Why: Cancel restores every toggle to its mount-time state. How: This passes the snapshot to revOptFun.

		onCloConFun(); // What: Controls Close Call. Why: A cancelled matrix has nothing left to show. How: This collapses the Controls body.


	};



	return (


		<div className='rd-matrix'>{ /* What: Matrix Div Element. Why: This is OptMatCom's own root element. How: This renders the head row, one row per REM_MAT_ARR entry, and the foot below. */ }


			<div className='rd-mx-head'>{ /* What: Matrix Head Div Element. Why: The 2 column labels need their own header row above the data rows. How: This renders an empty leading cell (aligning with each row's own name column) plus the 2 column-label spans. */ }


				<span></span>{ /* What: Matrix Head Spacer Span Element. Why: This aligns the head row's own 2 column labels under the data rows' own switch cells, leaving the name column's own header cell blank. How: This renders an empty span. */ }

				<span className='rd-mx-col'>One-time</span>{ /* What: Matrix Col Span Element. Why: This labels the first switch column. How: This renders the literal text "One-time". */ }

				<span className='rd-mx-col'>Recurring</span>{ /* What: Matrix Col Span Element. Why: This labels the second switch column. How: This renders the literal text "Recurring". */ }


			</div>

			{ REM_MAT_ARR.map( ( optDefObj ) => ( // What: Matrix Row List Render. Why: One row is needed per participation setting. How: This maps REM_MAT_ARR to one row div per entry, keyed by its own key.


				<div
					key={ optDefObj.keyStr }

					className='rd-mx-row'
				>{ /* What: Matrix Row Div Element. Why: One setting's own name/sub-explanation and both switch cells need to sit together as one row. How: This renders the name span, then maps the 2 classes into their own switch cells below. */ }


					<span className='rd-mx-name'>{ /* What: Matrix Name Span Element. Why: The plain label and its own live sub-explanation read together as one unit. How: This renders optDefObj's own label, then its dynFun's live result. */ }


						{ optDefObj.labStr }{ /* What: Matrix Name Render. Why: This is the row's own plain, static setting name. How: This renders optDefObj's own labStr directly as text. */ }

						<span
							key={ ( remOptObj.once[ optDefObj.keyStr ] ? 1 : 0 ) + '' + ( remOptObj.recurring[ optDefObj.keyStr ] ? 1 : 0 ) } // What: Toggle State Key. Why: The explanation should re-fade only when either class's toggle for this row flips. How: This joins the two toggle states into one key.

							className='rd-mx-sub set-sub-fade'
						>{ optDefObj.dynFun( !!remOptObj.once[ optDefObj.keyStr ], !!remOptObj.recurring[ optDefObj.keyStr ] ) }</span>{ /* What: Dynamic Sub Span Element. Why: Every row needs its own live, re-fading explanation. How: This re-keys on the combined once/recurring toggle state and calls optDefObj's own dynFun. */ }


					</span>

					{ [ 'once', 'recurring' ].map( ( tasClaStr ) => { // What: Switch Cell List Render. Why: Every row needs exactly 2 switch cells, one per participation class. How: This maps the 2 literal class keys to one switch cell each.


						const swtEnaBoo = !!remOptObj[ tasClaStr ][ optDefObj.keyStr ]; // What: Switch Enabled Boolean. Why: Each cell's own switch needs to know whether this specific class/setting pair is currently on. How: This reads remOptObj indexed first by tasClaStr, then by optDefObj's own keyStr.



						return (


							<span
								key={ tasClaStr }

								className='rd-mx-cell'
							>{ /* What: Matrix Cell Span Element. Why: Each switch needs its own cell wrapper for layout. How: This wraps the single switch button below. */ }


								<button
									className={ ` switch   ${ swtEnaBoo ? 'is-on' : '' } ` }

									aria-label={ `${ tasClaStr === 'once' ? 'One-time' : 'Recurring' }: ${ optDefObj.labStr }` } // What: Switch Label Pick. Why: Each switch's accessible name must say which class and setting it controls. How: This joins the class name with the row's own label.
									aria-pressed={ swtEnaBoo }

									onClick={ () => actStoObj.setOptFun( tasClaStr, optDefObj.keyStr, !swtEnaBoo ) }
								>{ /* What: Switch Button Element. Why: This is the actual toggle for this class/setting pair. How: This flips swtEnaBoo via actStoObj.setOptFun. */ }


									<i />{ /* What: Switch Thumb Element. Why: The switch's own CSS-driven thumb needs a real (if empty) element to animate. How: This renders an empty, purely decorative i element. */ }


								</button>


							</span>


						);


					} ) }


				</div>


			) ) }


			<div className='rd-mx-foot'>{ /* What: Matrix Foot Div Element. Why: The Cancel/Save actions need their own row below every matrix row. How: This wraps the rem-foot-right div below. */ }


				<div className='rem-foot-right'>{ /* What: Foot Right Div Element. Why: Cancel and Save read as a pair, right-aligned. How: This wraps both ButBasCom elements below. */ }


					<ButBasCom
						kinValStr='ghost'
						sizValStr='sm'

						onClick={ canMatFun }
					>Cancel</ButBasCom>{ /* What: Button Base Component. Why: This reverts every toggle changed since this component mounted. How: This calls canMatFun. */ }



					<ButBasCom
						kinValStr='ghost'
						sizValStr='sm'

						onClick={ onCloConFun }
					>Save</ButBasCom>{ /* What: Button Base Component. Why: This just collapses the body, keeping every toggle as-is (they already committed live, on each individual click). How: This calls onCloConFun directly. */ }


				</div>


			</div>


		</div>


	);


}

// #endregion OptMatCom



// #region RemCarCom

/**
 * RemCarCom = Reminder Card Component
 *
 * @summary
 * Today: a single reminder row. Matches the picker EntryCard's own
 * structure: the whole row toggles done; the actions area (skip/edit)
 * is click-isolated. The schedule summary sits where a picker entry
 * shows its picker name. Also doubles as a mini-tour launcher card
 * (isaTutBoo) for a still-hidden sample reminder, offered until it's
 * resolved by any of the 3 ways the Welcome Tour checklist recognizes.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actStoObj   - Action Store Object: The actions bag; only its
 *                            own setCarFun is used, and only while isaTutBoo.
 * @param props.cheDatObj   - Check Date Object: The generator-anchored date to
 *                            check done-ness against.
 * @param props.extClaStr   - Extra Class String: Extra class name(s) driving
 *                            the card's own insert/remove/purge animations,
 *                            defaulting to an empty string.
 * @param props.isaOpeBoo   - Is-An Open Boolean: Whether this card's own
 *                            inline editor is currently open.
 * @param props.isaSkiBoo   - Is-A Skip Boolean: Whether this card's own skip
 *                            confirm is currently open.
 * @param props.isaTutBoo   - Is-A Tutorial Boolean: Whether this instance is a
 *                            mini-tour launcher card for a still-hidden
 *                            sample, rather than a real due reminder.
 * @param props.jusCheStr   - Just Check String: The id of whichever reminder
 *                            was just checked, driving the brief "is-fresh"
 *                            flourish; unrelated to isaTutBoo.
 * @param props.onAniEndFun - On Animate End Function: Fires when this card's
 *                            own outer animation ends.
 * @param props.onEdiTasFun - On Edit Task Function: Opens/closes this card's
 *                            own inline editor.
 * @param props.onPlaTutFun - On Play Tutorial Function: Starts this sample's
 *                            own mini-tour.
 * @param props.onRenTasFun - On Rename Task Function: Commits a new name while
 *                            the inline name input is open.
 * @param props.onSkiTasFun - On Skip Task Function: Opens/closes this card's
 *                            own skip confirm.
 * @param props.onTogTasFun - On Toggle Task Function: Toggles this card's own
 *                            done state.
 * @param props.onUncTutFun - On Uncheck Tutorial Function: Un-resolves this
 *                            sample's own mini-tour.
 * @param props.tasRcdObj   - Task Record Object: The reminder/task record this
 *                            card renders, real or (while isaTutBoo) a
 *                            still-hidden sample.
 * @param props.tutDonBoo   - Tutorial Done Boolean: Whether this sample's own
 *                            mini-tour has already been resolved; only
 *                            meaningful while isaTutBoo.
 *
 * @returns Either the mini-tour launcher card's own markup (isaTutBoo)
 * or the real reminder row's own markup.
 *
 * @example
 * ```tsx
 * RemCarCom({ actStoObj, cheDatObj, extClaStr, ... }) // => <RemCarCom />
 * ```
 *
*/

function RemCarCom ( { actStoObj, cheDatObj, extClaStr = '', isaOpeBoo, isaSkiBoo, isaTutBoo, jusCheStr, onAniEndFun, onEdiTasFun, onPlaTutFun, onRenTasFun, onSkiTasFun, onTogTasFun, onUncTutFun, tasRcdObj, tutDonBoo } ) {


	if ( isaTutBoo ) { // What: Tutorial Branch. Why: A still-hidden sample reminder renders as a mini-tour launcher card instead of a real due-reminder row. How: This returns the launcher card's own markup outright, never falling through to the real row below.


		const oveTexObj = ONB_RCT_OBJ[ tasRcdObj.id ] || {}; // What: Override Text Object. Why: A sample's own launcher card copy can override the real schedule summary/name/time. How: This looks up tasRcdObj's own id in ONB_RCT_OBJ, falling back to an empty object when there's no override.
		const texDisObj = { kicStr : oveTexObj.kicker || TAS_NAM_OBJ.sumTasFun( tasRcdObj ), namStr : oveTexObj.name || tasRcdObj.name, timStr : oveTexObj.time }; // What: Text Display Object. Why: This resolves the 3 pieces of copy the card below actually renders, in one place. How: This falls back to the real schedule summary/name when no override was found, and leaves timStr undefined when none was given.


		const onRowCliFun = ( cliEveObj ) => { // What: On Row Click Function. Why: Clicking anywhere on the card (other than its own actions area) should start or un-resolve this sample's own mini-tour. How: This checks for a click inside the actions area first, then dispatches to onUncTutFun or onPlaTutFun based on tutDonBoo.


			if ( cliEveObj.target.closest( '.today-card-actions' ) ) return; // What: Actions Area Guard. Why: The Cancel button below has its own click handling and must not also trigger the row-level tour toggle. How: This bails out when the click landed inside the actions area.



			if ( tutDonBoo ) onUncTutFun( tasRcdObj.id ); // What: Done Dispatch Branch. Why: A sample whose mini-tour already finished should un-resolve it back to not-done on click. How: This calls onUncTutFun when tutDonBoo is true.

			else onPlaTutFun( 'reminder', tasRcdObj.id ); // What: Not-Done Dispatch Branch. Why: A sample whose mini-tour hasn't finished yet should start playing it on click. How: This calls onPlaTutFun otherwise.


		};



		return (


			<article
				className={ ` today-card   rem-card   today-card--tutorial   ${ tutDonBoo ? 'is-done' : '' }   ${ extClaStr } ` }

				onClick={ onRowCliFun }
			>{ /* What: Tutorial Article Element. Why: This is the mini-tour launcher card's own root element. How: This marks itself "is-done" once tutDonBoo, and dispatches every non-actions-area click to onRowCliFun. */ }


				{ tutDonBoo ? ( // What: Tutorial Done Check. Why: A resolved sample card's checkbox behaves differently from a pending one. How: This renders the undo-check button while tutDonBoo is true, the play-check button otherwise.


					<button
						className='check'

						type='button'

						aria-label={ `Undo ${ texDisObj.namStr } tutorial` }
						aria-pressed='true'

						onClick={ ( cliEveObj ) => { // What: Undo Check Click Handler. Why: The resolved checkbox un-resolves its sample without the row's own click also firing. How: This isolates the click, then un-resolves.


							cliEveObj.stopPropagation(); // What: Row Click Isolation. Why: The card's own row click must not also fire for this control. How: This stops the click from bubbling to the article.

							onUncTutFun( tasRcdObj.id ); // What: Tutorial Undo Call. Why: This un-resolves the sample's own mini-tour. How: This calls onUncTutFun with the sample's own id.


						} }
					>{ /* What: Undo Check Button Element. Why: A resolved sample can be un-resolved directly from its own checkbox, same as a normal completed card toggling back off. How: This calls onUncTutFun, isolated from the row's own onRowCliFun via stopPropagation. */ }


						<span
							className='check-ripple'

							aria-hidden='true'
						/>{ /* What: Check Ripple Span Element. Why: The checkbox needs its own decorative press-ripple, same as every other checkbox in the app. How: This renders an empty, purely decorative span. */ }

						<IcoSvgCom
							icoNamStr='cheEle'
							sizValNum={ 14 }
						/>{ /* What: Icon Svg Component. Why: A resolved sample's own checkbox needs the same checkmark glyph as a real completed card. How: This renders the 'cheEle' icon. */ }


					</button>


				) : ( // What: Play Check Branch. Why: A pending sample needs its own play-to-start checkbox instead. How: This renders the else branch, taken while tutDonBoo is false.


					<button
						className='check'

						type='button'

						aria-label={ `Start the ${ texDisObj.namStr } tutorial` }

						onClick={ ( cliEveObj ) => { // What: Play Check Click Handler. Why: The pending checkbox starts its sample's tour without the row's own click also firing. How: This isolates the click, then starts the tour.


							cliEveObj.stopPropagation(); // What: Row Click Isolation. Why: The card's own row click must not also fire for this control. How: This stops the click from bubbling to the article.

							onPlaTutFun( 'reminder', tasRcdObj.id ); // What: Tutorial Play Call. Why: This starts the sample's own reminder mini-tour. How: This calls onPlaTutFun with the 'reminder' tour kind and the sample's own id.


						} }
					>{ /* What: Play Check Button Element. Why: An unresolved sample's own checkbox instead starts the mini-tour, never marks it done directly. How: This calls onPlaTutFun, isolated from the row's own onRowCliFun via stopPropagation. */ }


						<IcoSvgCom
							icoNamStr='plaEle'
							sizValNum={ 13 }
						/>{ /* What: Icon Svg Component. Why: An unresolved sample's own checkbox needs a play glyph instead of a checkmark, since clicking it starts the tour rather than completing anything. How: This renders the 'plaEle' icon. */ }


					</button>


				) }


				<div className='today-card-body'>{ /* What: Card Body Div Element. Why: The card's own kicker/time meta and name need to sit together, same layout as a real reminder row. How: This wraps the meta row and the name div below. */ }


					<div className='today-card-meta rem-meta'>{ /* What: Card Meta Div Element. Why: The kicker (schedule-like summary) and optional time estimate read together as one line. How: This renders the kicker span, then the optional dot/time pair. */ }


						<span className='meta-picker'>{ texDisObj.kicStr }</span>{ /* What: Meta Picker Span Element. Why: This is the card's own kicker text, reusing the same class a real entry's picker name uses. How: This renders texDisObj's own kicStr. */ }

						{ texDisObj.timStr && ( // What: Time Visibility Check. Why: Not every sample card has a manually-timed estimate. How: This renders the dot/time pair only while texDisObj's own timStr is set.


							<>{ /* What: Time Pair Fragment Element. Why: The dot separator and the time estimate show or hide together. How: This groups both spans with no wrapper element. */ }


								<span className='meta-dot'>·</span>{ /* What: Meta Dot Span Element. Why: This visually separates the kicker from the time estimate. How: This renders a literal middle-dot character. */ }

								<span className='meta-time'>{ texDisObj.timStr }</span>{ /* What: Meta Time Span Element. Why: This shows roughly how long the mini-tour takes. How: This renders texDisObj's own timStr. */ }


							</>


						) }


					</div>

					<div className='today-card-name'>{ texDisObj.namStr }</div>{ /* What: Card Name Div Element. Why: This is the card's own primary, most prominent text. How: This renders texDisObj's own namStr. */ }


				</div>


				{ !tutDonBoo && ( // What: Cancel Visibility Check. Why: A resolved sample has nothing left to cancel. How: This renders the Cancel action only while the sample is still unresolved.


					<div className='today-card-actions'>{ /* What: Card Actions Div Element. Why: This is the click-isolated actions area onRowCliFun already excludes. How: This wraps the single Cancel button below. */ }


						<button
							className='icon-btn'

							aria-label='Cancel tutorial'
							title='Cancel'

							onClick={ ( cliEveObj ) => { // What: Cancel Click Handler. Why: Cancel must not also start the sample's tour through the row click. How: This isolates the click, then cancels the entry.


								cliEveObj.stopPropagation(); // What: Row Click Isolation. Why: The card's own row click must not also fire for this control. How: This stops the click from bubbling to the article.

								actStoObj.setCarFun( tasRcdObj.id, { status : 'cancelled' } ); // What: Card Cancel Call. Why: Cancelling marks the sample's own checklist entry cancelled without resolving it. How: This sets the entry's status to 'cancelled'.


							} }
						>{ /* What: Cancel Button Element. Why: This marks the sample's own checklist entry cancelled without touching the sample itself, distinct from actually resolving it. How: This calls actStoObj.setCarFun, isolated from the row's own onRowCliFun via stopPropagation. */ }


							<IcoSvgCom
								icoNamStr='croEle'
								sizValNum={ 15 }
							/>{ /* What: Icon Svg Component. Why: This is the Cancel action's own glyph. How: This renders the 'croEle' icon. */ }


						</button>


					</div>


				) }


			</article>


		);


	}



	const isaDonBoo = TAS_NAM_OBJ.isaDonFun( tasRcdObj, cheDatObj ); // What: Is-A Done Boolean. Why: Both the card's own checkbox state and its "fresh" flourish depend on today's real completion state. How: This calls TAS_NAM_OBJ.isaDonFun against tasRcdObj and cheDatObj.
	const isaFreBoo = jusCheStr === tasRcdObj.id && isaDonBoo;       // What: Is-A Fresh Boolean. Why: Only a reminder that was JUST checked (not one that was already done) should play the brief fresh flourish. How: This combines the jusCheStr match with isaDonBoo itself.



	const onRowCliFun = ( cliEveObj ) => { // What: On Row Click Function. Why: Clicking anywhere on the row (other than its own actions area or the open name input) should toggle done. How: This checks both exclusion zones first, then calls onTogTasFun.


		if ( cliEveObj.target.closest( '.today-card-actions' ) ) return; // What: Actions Area Guard. Why: The skip/edit buttons have their own click handling and must not also toggle done. How: This bails out when the click landed inside the actions area.



		if ( cliEveObj.target.closest( '.rem-card-name-input' ) ) return; // What: Name Input Guard. Why: Typing in the open name input must not also toggle done. How: This bails out when the click landed inside the name input.



		onTogTasFun( tasRcdObj ); // What: Toggle Done Call. Why: Once neither exclusion zone matched, the click is a genuine row toggle. How: This calls onTogTasFun against tasRcdObj.


	};



	return (


		<article
			className={ ` today-card   rem-card   ${ isaDonBoo ? 'is-done' : '' }   ${ isaFreBoo ? 'is-fresh' : '' }   ${ isaOpeBoo ? 'is-editing' : '' }   ${ extClaStr } ` }

			onAnimationEnd={ onAniEndFun }
			onClick={ onRowCliFun }
		>{ /* What: Reminder Article Element. Why: This is the real reminder row's own root element, matching a picker EntryCard's structure. How: This marks itself done/fresh/editing per the 3 booleans above, plus whatever animation class extClaStr carries. */ }


			<button
				className='check'

				type='button'

				aria-label={ `${ isaDonBoo ? 'Unmark' : 'Mark' } ${ tasRcdObj.name } complete` } // What: Check Label Pick. Why: The screen reader label names the action the checkbox will take next. How: This says Unmark while done and Mark otherwise.
				aria-pressed={ !!isaDonBoo }

				onClick={ ( cliEveObj ) => { // What: Check Click Handler. Why: The checkbox toggles done on its own, without the row's click toggling it a second time. How: This isolates the click, then toggles.


					cliEveObj.stopPropagation(); // What: Row Click Isolation. Why: The card's own row click must not also fire for this control. How: This stops the click from bubbling to the article.

					onTogTasFun( tasRcdObj ); // What: Toggle Done Call. Why: The checkbox toggles the reminder's own done state. How: This calls onTogTasFun with the task.


				} }
			>{ /* What: Check Button Element. Why: The checkbox is also independently clickable, isolated from the row's own onRowCliFun (both end up calling onTogTasFun, but the button needs its own accessible name/state). How: This toggles done via stopPropagation plus a direct onTogTasFun call. */ }


				<span
					className='check-ripple'

					aria-hidden='true'
				/>{ /* What: Check Ripple Span Element. Why: The checkbox needs its own decorative press-ripple. How: This renders an empty, purely decorative span. */ }

				{ isaDonBoo && ( // What: Done IcoSvgCom Check. Why: A done reminder's own checkbox needs a checkmark glyph, an undone one doesn't. How: This renders the IcoSvgCom only while isaDonBoo is true.


					<IcoSvgCom
						icoNamStr='cheEle'
						sizValNum={ 14 }
					/> // What: Icon Svg Component. Why: A done reminder's own checkbox needs a checkmark glyph. How: This renders the 'cheEle' icon only while isaDonBoo.


				) }


			</button>


			<div className='today-card-body'>{ /* What: Card Body Div Element. Why: The schedule-summary meta row and the name (or its inline editor) need to sit together. How: This wraps the meta row and the name/input below. */ }


				<div className='today-card-meta rem-meta'>{ /* What: Card Meta Div Element. Why: A small type icon and the schedule summary read together as one line. How: This renders the type icon, then the summary span. */ }


					<IcoSvgCom
						icoNamStr={ tasRcdObj.repeat === 'once' ? 'pinEle' : 'calEle' } // What: Type Icon Pick. Why: A one-time reminder and a recurring one look different at a glance. How: This picks the pin for 'once' and the calendar otherwise.
						sizValNum={ 12 }
					/>{ /* What: Icon Svg Component. Why: This distinguishes a one-time reminder from a recurring one at a glance. How: This renders 'pin' for a 'once' repeat, otherwise 'calendar'. */ }

					<span className='meta-picker'>{ TAS_NAM_OBJ.sumTasFun( tasRcdObj ) }</span>{ /* What: Meta Picker Span Element. Why: This is the row's own schedule summary, reusing the same class a real entry's picker name uses. How: This calls TAS_NAM_OBJ.sumTasFun against tasRcdObj. */ }


				</div>

				{ isaOpeBoo ? ( // What: Name Editing Check. Why: The name area swaps between a live input and plain text depending on whether the row is being renamed. How: This renders the input while isaOpeBoo is true, the plain name div otherwise.


					<input
						className='rem-card-name-input'

						autoComplete='off'
						autoFocus
						maxLength={ 60 }
						placeholder='Reminder name'
						type='text'
						value={ tasRcdObj.name }

						aria-label='Reminder name'

						onBlur={ ( bluEveObj ) => { // What: Name Blur Handler. Why: Leaving the input should commit the trimmed name once. How: This trims the value and commits it only when it differs.


							const namTriStr = bluEveObj.target.value.trim(); // What: Name Trimmed String. Why: Surrounding spaces are never part of a name. How: This trims the input's own value.


							if ( namTriStr !== tasRcdObj.name ) onRenTasFun( namTriStr ); // What: Changed Name Guard. Why: An unchanged name needs no commit. How: This calls onRenTasFun only when the trimmed name differs.


						} }
						onChange={ ( chaEveObj ) => onRenTasFun( chaEveObj.target.value ) }
						onClick={ ( cliEveObj ) => cliEveObj.stopPropagation() }                                            // What: Row Click Isolation. Why: Clicking into the name input must not also toggle the row done. How: This stops the click from bubbling to the card.
						onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Enter' ) keyEveObj.currentTarget.blur(); } } // What: Enter Blur Shortcut. Why: Pressing Enter should finish the name the same way leaving the field does. How: This blurs the input on Enter, which runs onBlur's own commit.
					/> // What: Name Input Element. Why: While isaOpeBoo, the plain name div below is replaced with a live-editable input. How: This commits on every change, re-trims and re-commits on blur, and blurs itself on Enter.


				) : ( // What: Plain Name Branch. Why: Outside editing, the plain non-editable name div belongs here instead. How: This renders the else branch, taken while isaOpeBoo is false.


					<div className='today-card-name'>{ tasRcdObj.name }</div> // What: Card Name Div Element. Why: The plain, non-editing state just shows the name as text. How: This renders tasRcdObj's own name directly.


				) }


			</div>


			<div className='today-card-actions'>{ /* What: Card Actions Div Element. Why: Skip and Edit are the row's own click-isolated actions. How: This wraps both buttons below. */ }


				<button
					className={ ` icon-btn   ${ isaSkiBoo ? 'is-on' : '' } ` }

					aria-label='Skip reminder'
					title='Skip'

					onClick={ ( cliEveObj ) => { // What: Skip Click Handler. Why: Skip must not also toggle the row done. How: This isolates the click, then toggles the skip confirm.


						cliEveObj.stopPropagation(); // What: Row Click Isolation. Why: The card's own row click must not also fire for this control. How: This stops the click from bubbling to the article.

						onSkiTasFun(); // What: Skip Toggle Call. Why: This opens or closes the card's own skip confirm. How: This calls onSkiTasFun.


					} }
				>{ /* What: Skip Button Element. Why: This opens/closes this card's own skip confirm. How: This is isolated from the row's own onRowCliFun via stopPropagation. */ }


					<IcoSvgCom
						icoNamStr='skiEle'
						sizValNum={ 15 }
					/>{ /* What: Icon Svg Component. Why: This is the Skip action's own glyph. How: This renders the 'skiEle' icon. */ }


				</button>

				<button
					className={ ` icon-btn   ${ isaOpeBoo ? 'is-on' : '' } ` }

					aria-expanded={ isaOpeBoo }
					aria-label='Edit reminder'
					title='Edit'

					onClick={ ( cliEveObj ) => { // What: Edit Click Handler. Why: Edit must not also toggle the row done. How: This isolates the click, then toggles the editor.


						cliEveObj.stopPropagation(); // What: Row Click Isolation. Why: The card's own row click must not also fire for this control. How: This stops the click from bubbling to the article.

						onEdiTasFun(); // What: Edit Toggle Call. Why: This opens or closes the card's own inline editor. How: This calls onEdiTasFun.


					} }
				>{ /* What: Edit Button Element. Why: This opens/closes this card's own inline schedule editor. How: This is isolated from the row's own onRowCliFun via stopPropagation. */ }


					<IcoSvgCom
						icoNamStr='ediEle'
						sizValNum={ 15 }
					/>{ /* What: Icon Svg Component. Why: This is the Edit action's own glyph. How: This renders the 'ediEle' icon. */ }


				</button>


			</div>


		</article>


	);


}

// #endregion RemCarCom



// #region VisNotCom

/**
 * VisNotCom = Visibility Note Component
 *
 * @summary
 * A live "will this show today?" advisory, computed from the DRAFT as
 * the user edits, so the answer is visible before the reminder is
 * created rather than after it silently fails to appear. It renders in
 * two placements, since the two causes belong next to different
 * controls: a settings-based cause ('weekends', 'holidays', or
 * 'skipUntil') belongs next to the Repeat row, since it comes from the
 * reminder-type participation settings rather than this schedule; a
 * schedule-based cause belongs next to the specific schedule
 * subsection whose own values caused it. Each mounted instance only
 * ever shows its note when its own kinValStr matches which placement
 * currently applies, so exactly one of the several instances rendered
 * per task ever has content. It always names the next day the
 * reminder WILL appear: for a schedule mismatch that is reassurance
 * (the reminder is still working), and for an exclusion it is the
 * answer the user actually wants.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.kinValStr - Kind Value String: Which placement this instance
 *                          renders for, 'settings' (the Repeat row) or
 *                          'schedule' (the specific schedule subsection).
 * @param props.notIdeStr - Note Identifier String: The dom id to assign to
 *                          this note's own live region, so a control above it
 *                          can reference it via aria-describedby.
 * @param props.staAppObj - State App Object: The shared app state, read for
 *                          its own reminderOpts and holidays.
 * @param props.tasRcdObj - Task Record Object: The reminder/task record to
 *                          advise about.
 *
 * @returns The note's own always-mounted live region, holding the
 * advisory paragraph when one applies to this instance's own
 * kinValStr, or nothing.
 *
 * @example
 * ```tsx
 * VisNotCom({ kinValStr, notIdeStr, staAppObj, ... }) // => <VisNotCom />
 * ```
 *
*/

function VisNotCom ( { kinValStr, notIdeStr, staAppObj, tasRcdObj } ) {


	const visResObj = tasRcdObj && TAS_NAM_OBJ.todVisFun // What: Visibility Result Object. Why: Every branch below reads this same computed visibility result. How: This calls TAS_NAM_OBJ.todVisFun against tasRcdObj's own schedule, or stays null when there's no task yet.
		? TAS_NAM_OBJ.todVisFun( tasRcdObj, staAppObj.reminderOpts, staAppObj.holidays ) // What: Visibility Compute Branch. Why: A real task gets its own visibility result. How: This passes the task plus the reminder options and holidays it depends on.
		: null;                                                                          // What: No Task Branch. Why: With no task there is nothing to compute. How: This leaves the result null.


	const nevShoBoo = !!visResObj && !visResObj.visible && !visResObj.next; // What: Never Show Boolean. Why: A reminder with no eligible day at all is a dead configuration, not a deferred one, and needs a red warning instead of the calm advisory. How: This is true only when visResObj exists, isn't visible, and has no next eligible date either.


	const notConEle = ( () => { // What: Note Content Element. Why: The actual advisory content depends on several branches below, computed once as an IIFE rather than duplicated at each return point. How: This returns null when nothing applies to this instance's own kinValStr, otherwise the advisory paragraph.


		if ( !visResObj || visResObj.visible ) return null; // What: Already-Visible Guard. Why: A reminder that's already showing today needs no advisory at all. How: This returns null when there's no result yet, or the reminder is already visible.



		const setCauArr = visResObj.causes.filter( ( curCauStr ) => curCauStr === 'weekends' || curCauStr === 'holidays' || curCauStr === 'skipUntil' ); // What: Settings Cause Array. Why: This decides which placement (settings vs schedule) the current cause set belongs to. How: This keeps only the 3 settings-based cause values out of visResObj's own causes.
		const froSetBoo = !nevShoBoo && setCauArr.length > 0;                                                                                            // What: From Settings Boolean. Why: A dead (never-showing) configuration always routes to the schedule subsection instead, regardless of which causes are present. How: This is true only when not nevShoBoo and at least one settings-based cause applies.
		const notPlaStr = froSetBoo ? 'settings' : 'schedule';                                                                                           // What: Note Placement String. Why: This is compared against this instance's own kinValStr to decide whether IT is the one that should render the note. How: This picks 'settings' or 'schedule' based on froSetBoo.


		if ( kinValStr !== notPlaStr ) return null; // What: Wrong Placement Guard. Why: Only one of the several mounted instances per task should ever render the note. How: This returns null for every instance whose own kinValStr doesn't match notPlaStr.



		if ( nevShoBoo ) { // What: Dead Configuration Branch. Why: No eligible day ever is worth a red warning rather than the calm advisory below. How: This builds and returns the "never" warning paragraph.


			const whyTexEle = <>Reminders items are currently set to <strong>not show on { reaPhrFun( visResObj ) || 'weekends' }</strong></>; // What: Why Text Element. Why: The warning needs to name the specific settings-based reason, falling back to 'weekends' if none resolved. How: This calls reaPhrFun against visResObj.



			return (


				<p className='rem-vis-note is-never'>{ /* What: Never Note Paragraph Element. Why: This is the red dead-configuration warning shown only in kinValStr 'schedule'. How: This is glued to the schedule control that's the actual thing the user can change to fix it. */ }
					<strong>WARNING:</strong>{ /* What: Warning Label Element. Why: This flags the paragraph's own severity ahead of the explanation. How: This renders the literal bolded word "WARNING:". */ } Because of the values that you are using and because { whyTexEle }, this
					item will <strong>never</strong>{ /* What: Never Emphasis Element. Why: This is the paragraph's own key word, bolded for emphasis. How: This renders the literal bolded word "never". */ } show up in your todo list.
				</p>


			);


		}



		const nexLabStr = nexDatFun( visResObj.next, tasRcdObj.repeat === 'annual' );    // What: Next Label String. Why: Both remaining branches below name the next day the reminder WILL appear, whenever one is known. How: This calls nexDatFun against visResObj's own next date, always including the year for an annual reminder.
		const kinWorStr = TAS_NAM_OBJ.isaReuFun( tasRcdObj ) ? 'recurring' : 'one-time'; // What: Kind Word String. Why: The settings-cause branch below needs to name whether it's talking about a recurring or one-time item. How: This picks the word based on TAS_NAM_OBJ.isaReuFun.

		let bodTexEle; // What: Body Text Element. Why: The actual advisory sentence depends on which of the 3 branches below applies, assigned in exactly one of them. How: This is declared here and read by the shared return at the end of this branch.

		const reaPhrStr = reaPhrFun( visResObj ); // What: Reason Phrase String. Why: This decides which of the 3 body branches below applies. How: This calls reaPhrFun against visResObj once, reused by the if/else chain immediately below.


		if ( reaPhrStr ) { // What: Settings Cause Branch. Why: A weekend/holiday exclusion is the most common cause and covers both possibilities in one sentence. How: This names both the item kind and the joined reason phrase.


			bodTexEle = <>Because Reminders are set to <strong>not show { kinWorStr } items on { reaPhrStr }</strong>, this item will not show up in your todo list today.</>; // What: Settings Cause Text Assignment. Why: This is the actual sentence rendered when a weekend/holiday exclusion is the resolved cause. How: This names both kinWorStr and reaPhrStr in one sentence.


		}

		else if ( visResObj.cause === 'skipUntil' ) { // What: Manual Skip Branch. Why: A user-initiated Skip needs its own distinct wording rather than reusing the settings phrasing above. How: This names the manual skip directly.


			bodTexEle = <>This item is <strong>skipped</strong> until a later date, so it will not show up in your todo list today.</>; // What: Manual Skip Text Assignment. Why: This is the actual sentence rendered for a user-initiated Skip. How: This assigns the fixed skip-specific wording to bodTexEle.


		}

		else { // What: Generic Fallback Branch. Why: Some other schedule mismatch (e.g. a weekly reminder off today's weekday) still needs a defined message. How: This falls back to a generic explanation naming no specific cause.


			bodTexEle = <>Because of the values that you are using, this item will not show up in your todo list today.</>; // What: Generic Fallback Text Assignment. Why: This is the actual sentence rendered when no specific settings-based or manual-skip cause resolved. How: This assigns the generic fallback wording to bodTexEle.


		}



		return (


			<p className='rem-vis-note'>{ /* What: Deferred Note Paragraph Element. Why: This is the calm advisory shown for every non-dead mismatch, in whichever placement (settings or schedule) actually caused it. How: This renders bodTexEle followed by the next-appearance date when one is known. */ }


				{ bodTexEle }{ nexLabStr ? <> It will next appear on <strong>{ nexLabStr }</strong>.</> : null }{ /* What: Note Body Render. Why: The advisory sentence itself, plus an optional next-appearance clause when nexLabStr resolved to something. How: This renders bodTexEle directly, followed by the extra sentence only while nexLabStr holds a value. */ }


			</p>


		);


	} )();



	return (


		<div
			id={ notIdeStr }

			className='rem-vis-live'

			aria-live={ nevShoBoo ? 'assertive' : 'polite' } // What: Live Urgency Pick. Why: A reminder that will never show is urgent enough to interrupt, while a deferred one is not. How: This is assertive only for the never-show case.
			role='status'
		>{ notConEle }</div> // What: Note Live Region Element. Why: This must stay mounted even with nothing to say, so an aria-describedby reference from the control above always resolves to a real element, and so the live region announces reliably once notConEle changes. How: This renders notConEle inside a role="status" region, assertive only for the dead-configuration case.


	);


}

// #endregion VisNotCom



// #region SegConCom

/**
 * SegConCom = Segment Control Component
 *
 * @summary
 * A generic animated segmented control: a single accent "thumb" slides
 * between options. The thumb tracks the active button's own box (left,
 * width, top, height, so it also follows a wrap to a second line).
 * During a move, the leading edge uses a fast, slightly-overshooting
 * curve while the trailing edge eases in, so the pill stretches in
 * flight and settles with a small bounce, like real momentum.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.ariLabStr - Aria Label String: The control's own accessible
 *                          group label.
 * @param props.desIdeStr - Description Identifier String: An optional id of an
 *                          external element (an advisory note) that describes
 *                          this control.
 * @param props.onChange  - On Change: Called with the clicked entry's own key.
 * @param props.optIteArr - Option Item Array: The array of { keyStr, labStr }
 *                          entries this control renders one button per; also
 *                          read directly by cadence-control.jsx and
 *                          tab-settings.jsx when they build their own option
 *                          arrays for this same component.
 * @param props.value     - Value: The currently-selected entry's own key.
 *
 * @returns The segmented control's own group element, including the
 * sliding thumb span and one button per entry in props.optIteArr.
 *
 * @example
 * ```tsx
 * SegConCom({ ariLabStr, desIdeStr, onChange, ... }) // => <SegConCom />
 * ```
 *
*/

function SegConCom ( { ariLabStr, desIdeStr, onChange, optIteArr, value } ) {


	const segEleRef = React.useRef( null );                                                               // What: Segment Element Reference. Why: plaThuFun needs a handle on the actual group DOM node to query and measure it. How: This is attached via the group div's own ref prop below.
	const thuEleRef = React.useRef( null );                                                               // What: Thumb Element Reference. Why: plaThuFun needs a handle on the sliding thumb span to move and resize it. How: This is attached via the thumb span's own ref prop below.
	const preIndRef = React.useRef( optIteArr.findIndex( ( optConObj ) => optConObj.keyStr === value ) ); // What: Previous Index Reference. Why: plaThuFun needs to know which direction the selection just moved in, to decide which edge of the thumb leads the animation. How: This starts at the initially-selected entry's own index and is updated at the end of every plaThuFun run.


	const plaThuFun = React.useCallback( ( aniMovBoo ) => { // What: Place Thumb Function. Why: This centralizes measuring the active button and moving/resizing the thumb span to match it, with or without an animated transition. How: This is called by both layout effects below, once on every selection/resize and once (with animation) on every value change.


		const segCurEle = segEleRef.current; // What: Segment Current Element. Why: This gives a stable local reference to the live group DOM node for this placement pass. How: This is read once from segEleRef.current and reused below.
		const thuCurEle = thuEleRef.current; // What: Thumb Current Element. Why: This gives a stable local reference to the live thumb span for this placement pass. How: This is read once from thuEleRef.current and reused below.


		if ( !segCurEle || !thuCurEle ) return; // What: Missing Element Guard. Why: Neither ref may be attached yet, such as before the first render commits. How: This bails out of the placement early when either DOM node is unavailable.



		const butActEle = segCurEle.querySelector( '.seg-btn.is-on' ); // What: Button Active Element. Why: This is the specific option button the thumb needs to sit under. How: This is found via a CSS query for the "is-on" class inside the group.


		if ( !butActEle ) return; // What: No Active Button Guard. Why: No option is currently marked active, such as mid-transition. How: This bails out of the rest of the placement when there is nothing to measure against.



		const curIndNum = optIteArr.findIndex( ( optConObj ) => optConObj.keyStr === value );                   // What: Current Index Number. Why: This is compared against the previous index to decide which direction the thumb is moving. How: This looks up the currently-selected entry's own position in optIteArr.
		const movDirNum = curIndNum - preIndRef.current;                                                        // What: Move Direction Number. Why: A positive value means the selection moved right, negative means left, deciding which edge of the thumb leads. How: This subtracts the previous index from curIndNum.
		const redMotBoo = window.matchMedia && window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches; // What: Reduced Motion Boolean. Why: A user who prefers reduced motion shouldn't see the thumb glide between optIteArr. How: This safely checks matchMedia support before querying the prefers-reduced-motion media query's current match state.


		if ( !aniMovBoo || redMotBoo ) { // What: No-Animation Branch. Why: Either the caller explicitly asked for an instant placement, or the user prefers reduced motion. How: This clears the thumb's own transition so the move below applies instantly.


			thuCurEle.style.transition = 'none'; // What: Transition Clear. Why: The position/size writes below must apply with no animation at all in this branch. How: This sets the thumb's own CSS transition to 'none'.


		}

		else { // What: Animated Branch. Why: A genuine selection change should glide, with the leading edge overshooting slightly and the trailing edge easing in. How: This picks which edge leads based on movDirNum, then writes a matching CSS transition.


			const leaEasStr = 'cubic-bezier(.22,.9,.24,1.12)';       // What: Lead Ease String. Why: The leading edge of the thumb should overshoot slightly before settling, like real momentum. How: This is assigned to whichever of left/width is leading below.
			const traEasStr = 'cubic-bezier(.65,0,.5,1)';            // What: Trail Ease String. Why: The trailing edge of the thumb should ease in smoothly, stretching the pill in flight. How: This is assigned to whichever of left/width is trailing below.
			const movEasStr = 'cubic-bezier(.5,0,.2,1)';             // What: Move Ease String. Why: A vertical move (wrapping to a second line) has no leading/trailing edge concept, so it always uses this single ease-in-out curve. How: This is assigned to both top and height below.
			const lefEasStr = movDirNum < 0 ? leaEasStr : traEasStr; // What: Left Ease String. Why: The left edge leads when moving left, trails when moving right. How: This picks leaEasStr or traEasStr based on movDirNum's own sign.
			const widEasStr = movDirNum < 0 ? traEasStr : leaEasStr; // What: Width Ease String. Why: The right edge (expressed as width) leads when moving right, trails when moving left. How: This picks traEasStr or leaEasStr based on movDirNum's own sign.


			thuCurEle.style.transition = `left .36s ${ lefEasStr }, width .36s ${ widEasStr }, top .3s ${ movEasStr }, height .3s ${ movEasStr }`; // What: Transition Write. Why: This is the actual animated transition applied to the position/size writes below. How: This interpolates the 4 eased curves computed above into one CSS transition value.


		}



		thuCurEle.style.left     = butActEle.offsetLeft + 'px';   // What: Left Write. Why: This positions the thumb horizontally over the active button. How: This is taken directly from the active button's own offsetLeft.
		thuCurEle.style.top      = butActEle.offsetTop + 'px';    // What: Top Write. Why: This positions the thumb vertically over the active button. How: This is taken directly from the active button's own offsetTop.
		thuCurEle.style.width    = butActEle.offsetWidth + 'px';  // What: Width Write. Why: This sizes the thumb to match the active button's own width. How: This is taken directly from the active button's own offsetWidth.
		thuCurEle.style.height   = butActEle.offsetHeight + 'px'; // What: Height Write. Why: This sizes the thumb to match the active button's own height. How: This is taken directly from the active button's own offsetHeight.
		thuCurEle.style.opacity  = '1';                           // What: Opacity Write. Why: The thumb starts invisible until it has a real measurement to show. How: This reveals the thumb once it has actually been placed.

		preIndRef.current = curIndNum; // What: Previous Index Update. Why: The next call to plaThuFun needs to compare against the index that's current now. How: This overwrites preIndRef with curIndNum.


	}, [ value, optIteArr ] ); // What: Effect Dependency Array. Why: plaThuFun must be recreated whenever either the selected value or the option set itself changes, since both affect which button is "active". How: value decides which button matches, optIteArr decides the whole set plaThuFun searches.


	React.useLayoutEffect( () => { plaThuFun( true ); }, [ value ] ); // What: Selection Change Effect. Why: A genuine value change should animate the thumb to its new position. How: This calls plaThuFun with animation enabled whenever value itself changes.

	React.useLayoutEffect( () => { // What: Mount And Resize Effect. Why: The thumb needs an initial, unanimated placement on mount, and must stay in sync if the group's own layout changes size. How: This places the thumb instantly, then subscribes a ResizeObserver to re-place it (also instantly) on every observed resize.


		plaThuFun( false ); // What: Initial Placement Call. Why: This positions the thumb immediately on mount, without waiting for a resize. How: This invokes plaThuFun with animation disabled.


		const resObsObj = new ResizeObserver( () => { // What: Resize Observer Object. Why: The thumb must re-place itself whenever the group's own layout changes size, such as a responsive wrap to a second line. How: This is created once and observes the group element below.


			const thuCurEle = thuEleRef.current; // What: Thumb Current Element. Why: A resize-triggered re-placement must not animate, so this needs a handle on the thumb to clear its transition first. How: This is read once from thuEleRef.current.


			if ( thuCurEle ) thuCurEle.style.transition = 'none'; // What: Transition Clear Guard. Why: A resize is not a user-driven selection change, so the thumb should snap rather than glide. How: This clears the thumb's own transition only when it's actually mounted.



			plaThuFun( false ); // What: Resize Placement Call. Why: This re-measures and re-places the thumb after the layout change. How: This invokes plaThuFun with animation disabled, same as the initial call above.


		} );


		if ( segEleRef.current ) resObsObj.observe( segEleRef.current ); // What: Resize Observer Start Guard. Why: This should only begin observing once the group element actually exists. How: This starts watching the group element for size changes.



		return () => resObsObj.disconnect(); // What: Effect Cleanup Return. Why: The observer must not outlive this effect run. How: This disconnects resObsObj on unmount or before the next run.


	}, [] ); // What: Effect Dependency Array. Why: This effect only ever needs to subscribe its ResizeObserver once, on mount. How: An empty array means it never re-subscribes or re-runs after the initial mount.



	return (


		<div
			ref={ segEleRef }

			className='seg'

			aria-describedby={ desIdeStr }
			aria-label={ ariLabStr }
			role='group'
		>{ /* What: Segment Group Element. Why: This is SegConCom's own root element, holding the sliding thumb and every option button. How: This renders as a group landmark, its own aria-label/aria-describedby passed straight through from props. */ }


			<span
				ref={ thuEleRef }

				className='seg-thumb'

				aria-hidden='true'
			/>{ /* What: Thumb Span Element. Why: This is the small sliding pill plaThuFun positions and sizes via direct style writes. How: This starts with no inline position at all, until the first layout effect above places it. */ }

			{ optIteArr.map( ( optConObj ) => ( // What: Option Button List Render. Why: One button is needed per configured option, and the option set itself is data, not hardcoded markup. How: This maps optIteArr to one button element per entry, keyed by its own keyStr.


				<button
					key={ optConObj.keyStr }

					className={ ` seg-btn   ${ value === optConObj.keyStr ? 'is-on' : '' } ` }

					type='button'

					aria-describedby={ desIdeStr }
					aria-pressed={ value === optConObj.keyStr }

					onClick={ () => onChange( optConObj.keyStr ) }
				>{ optConObj.labStr }</button> // What: Option Button Element. Why: This is the clickable control for selecting this specific option. How: This marks itself pressed when its own keyStr matches value, and calls onChange with its keyStr when clicked.


			) ) }


		</div>


	);


}

// #endregion SegConCom



// #region SchEdiCom

/**
 * SchEdiCom = Schedule Editor Component
 *
 * @summary
 * Live-edits an existing (or in-progress draft) reminder's own
 * schedule. Repeat kind is a segmented control; the detail control
 * below it swaps to match the kind. Every field commits immediately
 * through props.actStoObj's own updTasFun, so this component holds no
 * schedule state of its own beyond the two inline-date-edit toggles.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actStoObj - Action Store Object: The actions bag this editor
 *                          commits through; a caller editing a local draft
 *                          passes a stand-in object exposing its own
 *                          updTasFun.
 * @param props.aniExtBoo - Animate Extra Boolean: Whether the extra-fields
 *                          subsection should animate open/closed via
 *                          ColDisCom, defaulting to false for a context that
 *                          doesn't need it.
 * @param props.staAppObj - State App Object: The shared app state, passed
 *                          through to VisNotCom for its own visibility
 *                          computation.
 * @param props.tasRcdObj - Task Record Object: The reminder/task record (real
 *                          or draft) being edited.
 *
 * @returns The full schedule editor: the Repeat row plus whichever
 * detail subsection matches the current (or last non-once) repeat kind.
 *
 * @example
 * ```tsx
 * SchEdiCom({ actStoObj, aniExtBoo, staAppObj, ... }) // => <SchEdiCom />
 * ```
 *
*/

function SchEdiCom ( { actStoObj, aniExtBoo = false, staAppObj, tasRcdObj } ) {


	const updPatFun = ( patValObj ) => actStoObj.updTasFun( tasRcdObj.id, patValObj ); // What: Update Patch Function. Why: Every schedule field editor below commits through this single call. How: This calls actStoObj.updTasFun with tasRcdObj's own id and the given patch.



	// #region Last Kind Memory

	const lasExtRef = React.useRef( tasRcdObj.repeat === 'once' ? 'interval' : tasRcdObj.repeat ); // What: Last Extra Reference. Why: While collapsing back to 'once', the extra-fields subsection needs its last non-once schedule kind to keep animating out instead of blanking instantly. How: This starts at 'interval' for a brand-new 'once' task, or the task's own real repeat otherwise.


	if ( tasRcdObj.repeat !== 'once' ) lasExtRef.current = tasRcdObj.repeat; // What: Last Extra Update Guard. Why: Every time the task genuinely has a non-once repeat, that's the value the collapse-out animation should remember next. How: This overwrites lasExtRef only while tasRcdObj's own repeat isn't 'once'.

	// #endregion Last Kind Memory



	// #region Label Lists

	const monAbbArr = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];                                       // What: Month Abbreviation Array. Why: The annual schedule's month select needs a short label per month. How: This is indexed by month number minus 1 in the annual subsection below.
	const monFulArr = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]; // What: Month Full Array. Why: The annual schedule's own live summary needs the full month name to display. How: This is indexed by tasRcdObj.month minus 1 in the annual subsection below.
	const dayAbbArr = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];                                                                          // What: Day Abbreviation Array. Why: The weekly summary needs a short weekday name for a multi-day list. How: This is indexed by daysOfWeek entries in the weekly subsection below.
	const dayFulArr = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];                                             // What: Day Full Array. Why: The weekly single-day and monthly/annual Nth-weekday summaries need the full weekday name. How: This is indexed by daysOfWeek/nthWeekday entries throughout this function.


	const datModArr = [ // What: Date Mode Array. Why: The monthly and annual subsections both offer the same Date-vs-Weekday choice, driven by one shared SegConCom control. How: This is passed as that SegConCom's own optIteArr prop in both subsections below.


		{ keyStr : 'date',       labStr : 'Date'    }, // What: Plain Date Option. Why: This is the default day-of-month/day targeting mode. How: SegConCom reads this entry the same way as any other options entry.
		{ keyStr : 'nthWeekday', labStr : 'Weekday' }  // What: Nth-Weekday Option. Why: This lets the user target e.g. "the 2nd Tuesday" instead of a fixed day number. How: SegConCom reads this entry the same way as any other options entry.


	];

	// #endregion Label Lists



	// #region Anchor Date Link

	const [ ancEdiBoo, setAncEdiBoo ] = React.useState( false ); // What: Anchor Editing Boolean And Setter. Why: Interval reminders count from a start date the user can amend if they got it wrong; this tracks whether that inline date picker is open. How: This toggles between the plain date link and a native date input in ancHinEle below.

	const ancIsoStr = tasRcdObj.anchor || tasRcdObj.createdAt; // What: Anchor Iso String. Why: Every anchor-related read below needs a single resolved ISO date, since anchor itself may be unset on an older task. How: This falls back to tasRcdObj's own createdAt when anchor is missing.


	const ancLabStr = ( () => { // What: Anchor Label String. Why: The anchor link's own visible text needs a locale-formatted date, not the raw ISO string. How: This parses ancIsoStr into a real Date and formats it.


		const [ yeaValNum, monValNum, dayValNum ] = ( ancIsoStr || '' ).split( '-' ).map( Number ); // What: Year Value Month Value Day Value Destructure. Why: A locale-formatted date needs a real Date instance built from 3 numeric parts. How: This splits ancIsoStr (or an empty string when falsy) on '-' and maps each segment through Number.

		const ancDatObj = ( yeaValNum && monValNum && dayValNum ) ? new Date( yeaValNum, monValNum - 1, dayValNum ) : new Date(); // What: Anchor Date Object. Why: The format call below needs a real Date, not the 3 raw numbers. How: This builds a Date from the destructured parts, falling back to right now if any part was missing.



		return ancDatObj.toLocaleDateString( 'en-US', { day : 'numeric', month : 'short', weekday : 'long' } ); // What: Anchor Label Return. Why: The caller needs the actual formatted string. How: This formats ancDatObj using a fixed en-US weekday/short-month/day shape.


	} )();

	// #endregion Anchor Date Link



	// #region Start Date Link

	const [ oncEdiBoo, setOncEdiBoo ] = React.useState( false ); // What: Once Editing Boolean And Setter. Why: A one-time reminder's own start date can likewise be amended inline. How: This toggles between the plain date link and a native date input in oncFieEle below.

	const oncIsoStr = tasRcdObj.onceDate || TAS_NAM_OBJ.curIsoFun(); // What: Once Iso String. Why: An older task may have no onceDate set at all. How: This falls back to TAS_NAM_OBJ.curIsoFun() when onceDate is missing.
	const oncFutBoo = oncIsoStr > TAS_NAM_OBJ.curIsoFun();           // What: Once Future Boolean. Why: A one-time reminder defaults to due right away; this decides whether it's instead deferred to a future start date. How: This compares oncIsoStr against today's own iso string.


	const oncLabStr = ( () => { // What: Once Label String. Why: The start-date link's own visible text needs a locale-formatted date. How: This parses oncIsoStr into a real Date and formats it.


		const [ yeaValNum, monValNum, dayValNum ] = oncIsoStr.split( '-' ).map( Number ); // What: Year Value Month Value Day Value Destructure. Why: A locale-formatted date needs a real Date instance built from 3 numeric parts. How: This splits oncIsoStr on '-' and maps each segment through Number.



		return new Date( yeaValNum, monValNum - 1, dayValNum ).toLocaleDateString( 'en-US', { day : 'numeric', month : 'short', weekday : 'long' } ); // What: Once Label Return. Why: The caller needs the actual formatted string. How: This builds a Date from the destructured parts and formats it the same way ancLabStr does.


	} )();

	// #endregion Start Date Link



	// #region Visibility Note Ids

	const schNotStr = `rem-vis-sched-${ tasRcdObj.id }`; // What: Schedule Note String. Why: The schedule-subsection VisNotCom instance below needs a stable dom id so a control can reference it via aria-describedby. How: This is passed as that instance's own notIdeStr prop.
	const repNotStr = `rem-vis-set-${ tasRcdObj.id }`;   // What: Repeat Note String. Why: The Repeat row's own VisNotCom instance below needs its own distinct dom id for the same reason. How: This is passed as that instance's own notIdeStr prop.

	// #endregion Visibility Note Ids



	// #region Schedule Field Elements

	const ancHinEle = ( // What: Anchor Hint Element. Why: Interval/weekly/monthly/annual all share this same "counted from" hint once N > 1. How: This renders either a live date link or an inline date input, based on ancEdiBoo.


		<p className='rem-hint'>{ /* What: Anchor Hint Paragraph Element. Why: This is the shared hint every interval-based schedule below reuses unmodified. How: This renders the counted-from sentence, swapping in a live link or an inline input based on ancEdiBoo. */ }
			Counted from{ ' ' }
			{ ancEdiBoo ? ( // What: Anchor Editing Check. Why: The anchor date swaps between a plain link and a live inline input depending on whether editing is active. How: This renders the inline date input while ancEdiBoo is true, the plain link otherwise.


				<input
					className='rem-date-inline'

					autoFocus
					type='date'
					value={ ancIsoStr }

					onBlur={ () => setAncEdiBoo( false ) }
					onChange={ ( chaEveObj ) => { if ( chaEveObj.target.value ) updPatFun( { anchor : chaEveObj.target.value } ); } } // What: Anchor Change Guard. Why: Clearing the native date input must not commit an empty anchor. How: This commits only a non-empty value.
					onKeyDown={ ( keyEveObj ) => { // What: Anchor Key Down Handler. Why: Enter/Escape both need to close the inline anchor input, matching onBlur's own behavior. How: This checks for either key and, when matched, prevents the default action and closes the input.


						if ( keyEveObj.key === 'Enter' || keyEveObj.key === 'Escape' ) { // What: Commit Key Guard. Why: Enter and Escape should both close the inline anchor input; the value already committed via onChange. How: This prevents the default action and closes the input.


							keyEveObj.preventDefault(); // What: Default Prevent Call. Why: The native date input shouldn't perform its own default Enter/Escape behavior on top of this handler's own close. How: This calls keyEveObj's own preventDefault.

							setAncEdiBoo( false ); // What: Anchor Edit Close Call. Why: Both keys should close the inline input back to the plain link. How: This flips ancEdiBoo back to false.


						}


					} }
				/> // What: Anchor Inline Input Element. Why: This lets the user amend the anchor date directly, in place. How: This is a native date input, focused immediately, committing on change and closing on blur/Enter/Escape.


			) : ( // What: Anchor Link Branch. Why: Outside editing, the plain clickable date link belongs here instead. How: This renders the else branch, taken while ancEdiBoo is false.


				<>{ /* What: Anchor Link Fragment Element. Why: The date link and its trailing period render together as one branch. How: This groups the button and the period with no wrapper element. */ }


					<button
						className='rem-date-link'

						type='button'

						aria-describedby={ schNotStr }

						onClick={ () => setAncEdiBoo( true ) }
					>{ ancLabStr }</button>{ /* What: Anchor Date Link Element. Why: This is the plain-text entry point into editing the anchor date. How: This shows ancLabStr and opens the inline input above when clicked. */ }.


				</>


			) }
		</p>


	);


	const oncFieEle = ( // What: Once Fields Element. Why: A one-time reminder is due immediately by default, and this subsection lets picking a later start date defer that. How: This renders the start-date label plus the same live link/inline-input pattern as ancHinEle.


		<div className='rem-field'>{ /* What: Once Field Div Element. Why: This groups the start-date label, live link/input, and its own visibility note as one schedule subsection. How: This is the multi-line container every other schedule subsection below also uses. */ }


			<div className='rem-flabel-wrap'>{ /* What: Flabel Wrap Div Element. Why: The subsection's own label and live summary need to sit together as one visual unit. How: This wraps the plain label span and the fading summary span below. */ }


				<span className='rem-flabel'>Start date</span>{ /* What: Flabel Span Element. Why: This is the subsection's own plain label. How: This renders the literal text "Start date". */ }

				<span
					key={ oncFutBoo ? 'future' : 'now' } // What: Start State Key. Why: The summary should re-fade only when the start flips between future and immediate. How: This keys on oncFutBoo.

					className='rem-flabel-sub set-sub-fade'
				>{ /* What: Flabel Sub Span Element. Why: This is the live summary of when the reminder will actually start showing. How: This re-keys (and so re-fades) whenever oncFutBoo flips, rendering one of the 2 branches below. */ }


					{ oncFutBoo // What: Start Phrase Pick. Why: A future start date defers the reminder, while a today-or-past one shows at once. How: This picks the phrase below based on oncFutBoo.
						? <>won't show on the Today page until <strong>{ oncLabStr }</strong></> // What: Future Start Phrase. Why: A future start date genuinely defers the reminder, so the summary must say so. How: This names oncLabStr as the date it will start showing.
						: <>shows on the Today page <strong>right away</strong></>               // What: Immediate Start Phrase. Why: The default (today-or-past) start date needs no extra explanation. How: This renders the plain reassurance phrase.
					}


				</span>


			</div>

			<p className='rem-hint'>{ /* What: Once Hint Paragraph Element. Why: This is the same "starting on" link/input pattern ancHinEle uses, for the once-specific start date field. How: This renders the live link or inline input based on oncEdiBoo. */ }
				Starting on{ ' ' }
				{ oncEdiBoo ? ( // What: Once Editing Check. Why: The once start date swaps between a plain link and a live inline input depending on whether editing is active. How: This renders the inline date input while oncEdiBoo is true, the plain link otherwise.


					<input
						className='rem-date-inline'

						autoFocus
						min={ TAS_NAM_OBJ.curIsoFun() }
						type='date'
						value={ oncIsoStr }

						onBlur={ () => setOncEdiBoo( false ) }
						onChange={ ( chaEveObj ) => { // What: Once Date Change Handler. Why: `min` only disables the picker UI's own earlier dates; typing a date by hand bypasses it in every browser, so a past pick still has to be clamped here. How: This commits chaEveObj's own value, clamped up to today when it's earlier.


							if ( chaEveObj.target.value ) updPatFun( { onceDate : chaEveObj.target.value < TAS_NAM_OBJ.curIsoFun() ? TAS_NAM_OBJ.curIsoFun() : chaEveObj.target.value } ); // What: Clamped Commit Guard. Why: A typed-in date must still commit, but never earlier than today. How: This calls updPatFun only when a value exists, clamping it up to today when needed.


						} }
						onKeyDown={ ( keyEveObj ) => { // What: Once Key Down Handler. Why: Enter/Escape both need to close the inline once-date input, matching onBlur's own behavior. How: This checks for either key and, when matched, prevents the default action and closes the input.


							if ( keyEveObj.key === 'Enter' || keyEveObj.key === 'Escape' ) { // What: Commit Key Guard. Why: Enter and Escape should both close the inline once-date input; the value already committed via onChange. How: This prevents the default action and closes the input.


								keyEveObj.preventDefault(); // What: Default Prevent Call. Why: The native date input shouldn't perform its own default Enter/Escape behavior on top of this handler's own close. How: This calls keyEveObj's own preventDefault.

								setOncEdiBoo( false ); // What: Once Edit Close Call. Why: Both keys should close the inline input back to the plain link. How: This flips oncEdiBoo back to false.


							}


						} }
					/> // What: Once Date Inline Input Element. Why: This lets the user amend the start date directly, in place, never earlier than today. How: This is a native date input, focused immediately, committing (clamped) on change and closing on blur/Enter/Escape.


				) : ( // What: Once Link Branch. Why: Outside editing, the plain clickable date link belongs here instead. How: This renders the else branch, taken while oncEdiBoo is false.


					<>{ /* What: Once Link Fragment Element. Why: The date link and its trailing period render together as one branch. How: This groups the button and the period with no wrapper element. */ }


						<button
							className='rem-date-link'

							type='button'

							aria-describedby={ schNotStr }

							onClick={ () => setOncEdiBoo( true ) }
						>{ oncLabStr }</button>{ /* What: Once Date Link Element. Why: This is the plain-text entry point into editing the start date. How: This shows oncLabStr and opens the inline input above when clicked. */ }.


					</>


				) }
			</p>



			{ staAppObj && ( // What: Once Visibility Check. Why: The once schedule's own advisory only makes sense once a real staAppObj is available. How: This renders VisNotCom, gated on kinValStr 'schedule', only while staAppObj was actually passed.


				<VisNotCom
					kinValStr='schedule'
					notIdeStr={ schNotStr }
					staAppObj={ staAppObj }
					tasRcdObj={ tasRcdObj }
				/> // What: Visibility Note Component. Why: This is the schedule-placement advisory, which only ever shows when a schedule-based cause applies. How: This passes kinValStr 'schedule' and schNotStr as its own note id.


			) }


		</div>


	);


	const extFieEle = ( () => { // What: Extra Fields Element. Why: Every repeat kind except 'once' has its own extra schedule subsection, computed once as an IIFE and reused by both the animated and plain render paths below. How: This resolves curRepStr, then renders whichever of the 6 conditional blocks below match it.


		const curRepStr = tasRcdObj.repeat === 'once' ? lasExtRef.current : tasRcdObj.repeat; // What: Current Repeat String. Why: While collapsing back to 'once', the subsection below should keep showing its last real kind instead of blanking. How: This picks lasExtRef's own remembered kind only while tasRcdObj.repeat is 'once'.



		return (


			<React.Fragment>{ /* What: Extra Fields Fragment Element. Why: Up to 2 of the 6 conditional blocks below can render at once (monthly and annual each split into 2), so a single wrapping element is needed with no dom footprint of its own. How: This groups every conditional block below as one returned value. */ }


				{ curRepStr === 'weekly' && ( // What: Weekly Visibility Check. Why: Only the schedule subsection matching the current repeat kind should render. How: This renders the weekly subsection only while curRepStr is 'weekly'.


					<div className='rem-field'>{ /* What: Weekly Field Div Element. Why: This groups every weekly-specific control as one schedule subsection. How: This renders the day-picker, the every-N-weeks control, and the shared anchor hint/visibility note. */ }


						<div className='rem-flabel-wrap'>{ /* What: Flabel Wrap Div Element. Why: The subsection's own label and live summary need to sit together. How: This wraps the plain label span and the fading summary span below. */ }


							<span className='rem-flabel'>On these days</span>{ /* What: Flabel Span Element. Why: This is the subsection's own plain label. How: This renders the literal text "On these days". */ }

							<span
								key={ tasRcdObj.interval || 1 }

								className='rem-flabel-sub set-sub-fade'
							>{ /* What: Flabel Sub Span Element. Why: This is the live summary of which days and how often the reminder shows. How: This re-keys (and so re-fades) whenever interval changes, rendering one of the 2 branches below. */ }


								{ ( tasRcdObj.daysOfWeek && tasRcdObj.daysOfWeek.length ) // What: Days Chosen Check. Why: The summary can only name days once at least one is chosen. How: This picks the chosen-days phrase while daysOfWeek has entries, the prompt otherwise.
									? <>shows on the Today page <strong>every { ( tasRcdObj.interval || 1 ) > 1 ? `${ tasRcdObj.interval } weeks on ` : '' }{ [ ...tasRcdObj.daysOfWeek ].sort( ( dowOneNum, dowTwoNum ) => dowOneNum - dowTwoNum ).map( ( dowNum ) => dayAbbArr[ dowNum ] ).join( ', ' ) }</strong></> // What: Chosen Days Phrase. Why: At least one day is selected, so the summary names every chosen weekday in order. How: This sorts a copy of daysOfWeek ascending, maps each to its abbreviation, and joins them, prefixed by the every-N-weeks clause when interval is above 1.
									: 'pick at least one day' // What: No Days Fallback. Why: No day is selected yet, an invalid, incomplete configuration. How: This renders a plain prompt instead of a broken summary.
								}


							</span>


						</div>

						<div className='rem-inline'>{ /* What: Weekly Inline Div Element. Why: The every-N-weeks number input reads best inline with its own surrounding words. How: This wraps the "Every", the number input, and the "week(s) on" label. */ }


							<span>Every</span>{ /* What: Every Span Element. Why: This is the inline control's own leading word. How: This renders the literal text "Every". */ }

							<input
								className='np-input rem-num'

								max='52'
								min='1'
								type='number'
								value={ tasRcdObj.interval || 1 }

								aria-describedby={ schNotStr }
								aria-label='Interval in weeks'

								onChange={ ( chaEveObj ) => updPatFun( { interval : Math.max( 1, parseInt( chaEveObj.target.value ) || 1 ) } ) } // What: Interval Clamp Commit. Why: An empty or invalid number must never commit an interval below 1. How: This parses the typed value, falling back to 1 and clamping at 1.
							/>{ /* What: Interval Number Input Element. Why: This is the actual every-N-weeks control. How: This clamps its own committed value to a minimum of 1 whole week. */ }

							<span>{ ( tasRcdObj.interval || 1 ) === 1 ? 'week on' : 'weeks on' }</span>{ /* What: Weeks Label Span Element. Why: This is the inline control's own trailing word, singular or plural to match the current interval. How: This picks between 'week on' and 'weeks on' based on tasRcdObj's own interval. */ }


						</div>



						<WeeChiCom
							value={ tasRcdObj.daysOfWeek || [] }

							desIdeStr={ schNotStr }

							onChange={ ( weeSelArr ) => updPatFun( { daysOfWeek : weeSelArr } ) }
						/>{ /* What: Weekday Chips Component. Why: A weekly schedule needs a multi-select control for its own chosen days. How: This commits the newly-selected day array straight through updPatFun. */ }



						<ColDisCom open={ ( tasRcdObj.interval || 1 ) > 1 }>{ /* What: Collapse Disclosure Component. Why: The counted-from hint is only meaningful once interval is above 1 week. How: This animates ancHinEle open only while that condition holds. */ }


							<div className='cad-anchor-fade'>{ ancHinEle }</div>{ /* What: Anchor Fade Div Element. Why: The counted-from hint needs its own fade wrapper distinct from ColDisCom's own height animation. How: This renders ancHinEle inside a plain div that CSS cross-fades on interval change. */ }


						</ColDisCom>



						{ staAppObj && ( // What: Weekly Visibility Check. Why: Same reasoning as oncFieEle's own check. How: This renders VisNotCom, gated on kinValStr 'schedule', only while staAppObj was actually passed.


							<VisNotCom
								kinValStr='schedule'
								notIdeStr={ schNotStr }
								staAppObj={ staAppObj }
								tasRcdObj={ tasRcdObj }
							/> // What: Visibility Note Component. Why: This is the schedule-placement advisory, which only ever shows when a schedule-based cause applies. How: This passes kinValStr 'schedule' and schNotStr as its own note id.


						) }


					</div>


				) }


				{ curRepStr === 'interval' && ( // What: Interval Visibility Check. Why: Only the schedule subsection matching the current repeat kind should render. How: This renders the interval subsection only while curRepStr is 'interval'.


					<div className='rem-field'>{ /* What: Interval Field Div Element. Why: This groups the every-N-days control and its own anchor hint/visibility note as one schedule subsection. How: This renders the number input plus the shared anchor hint, always visible (unlike weekly/monthly/annual, which collapse it below N of 1). */ }


						<div className='rem-flabel-wrap'>{ /* What: Flabel Wrap Div Element. Why: The subsection's own label and live summary need to sit together. How: This wraps the plain label span and the (non-fading, since interval always shows the hint) summary span below. */ }


							<span className='rem-flabel'>Frequency</span>{ /* What: Flabel Span Element. Why: This is the subsection's own plain label. How: This renders the literal text "Frequency". */ }

							<span className='rem-flabel-sub'>shows on the Today page <strong>every { tasRcdObj.interval || 1 } days</strong></span>{ /* What: Flabel Sub Span Element. Why: This is the plain cadence summary; interval has no alternate phrasing to fade between. How: This names tasRcdObj's own interval directly. */ }


						</div>

						<div className='rem-inline'>{ /* What: Interval Inline Div Element. Why: The every-N-days number input reads best inline with its own surrounding words. How: This wraps the "Every", the number input, and the "days" label. */ }


							<span>Every</span>{ /* What: Every Span Element. Why: This is the inline control's own leading word. How: This renders the literal text "Every". */ }

							<input
								className='np-input rem-num'

								max='365'
								min='1'
								type='number'
								value={ tasRcdObj.interval || 1 }

								aria-describedby={ schNotStr }
								aria-label='Interval in days'

								onChange={ ( chaEveObj ) => updPatFun( { interval : Math.max( 1, parseInt( chaEveObj.target.value ) || 1 ) } ) } // What: Interval Clamp Commit. Why: An empty or invalid number must never commit an interval below 1. How: This parses the typed value, falling back to 1 and clamping at 1.
							/>{ /* What: Interval Number Input Element. Why: This is the actual every-N-days control. How: This clamps its own committed value to a minimum of 1 whole day. */ }

							<span>days</span>{ /* What: Days Label Span Element. Why: This is the inline control's own trailing word. How: This renders the literal, always-plural text "days". */ }


						</div>

						{ ancHinEle }{ /* What: Anchor Hint Render. Why: The every-N-days interval subsection reuses the same shared "counted from" hint every other interval-based subsection does. How: This renders ancHinEle, already fully built above, directly as a JSX child, unlike the weekly/monthly/annual subsections which additionally wrap it in a fade div. */ }
						{ staAppObj && ( // What: Interval Visibility Check. Why: Same reasoning as oncFieEle's own check. How: This renders VisNotCom, gated on kinValStr 'schedule', only while staAppObj was actually passed.


							<VisNotCom
								kinValStr='schedule'
								notIdeStr={ schNotStr }
								staAppObj={ staAppObj }
								tasRcdObj={ tasRcdObj }
							/> // What: Visibility Note Component. Why: This is the schedule-placement advisory, which only ever shows when a schedule-based cause applies. How: This passes kinValStr 'schedule' and schNotStr as its own note id.


						) }


					</div>


				) }


				{ curRepStr === 'monthly' && ( // What: Monthly Frequency Visibility Check. Why: The monthly kind splits into 2 independent subsections; this is the first, the every-N-months control. How: This renders it only while curRepStr is 'monthly'.


					<div className='rem-field'>{ /* What: Monthly Frequency Field Div Element. Why: This groups the every-N-months control and its own anchor hint as one schedule subsection. How: This renders the number input plus the shared anchor hint, collapsed until interval is above 1. */ }


						<div className='rem-flabel-wrap'>{ /* What: Flabel Wrap Div Element. Why: The subsection's own label and live summary need to sit together. How: This wraps the plain label span and the fading summary span below. */ }


							<span className='rem-flabel'>Frequency</span>{ /* What: Flabel Span Element. Why: This is the subsection's own plain label. How: This renders the literal text "Frequency". */ }

							<span
								key={ tasRcdObj.interval || 1 }

								className='rem-flabel-sub set-sub-fade'
							>shows on the Today page <strong>every { ( tasRcdObj.interval || 1 ) > 1 ? `${ tasRcdObj.interval } months` : 'month' }</strong></span>{ /* What: Flabel Sub Span Element. Why: This is the live cadence summary, re-fading whenever interval changes. How: This picks between a plain "month" and an "every N months" phrase based on tasRcdObj's own interval. */ }


						</div>

						<div className='rem-inline'>{ /* What: Monthly Inline Div Element. Why: The every-N-months number input reads best inline with its own surrounding words. How: This wraps the "Every", the number input, and the "month(s)" label. */ }


							<span>Every</span>{ /* What: Every Span Element. Why: This is the inline control's own leading word. How: This renders the literal text "Every". */ }

							<input
								className='np-input rem-num'

								max='60'
								min='1'
								type='number'
								value={ tasRcdObj.interval || 1 }

								aria-describedby={ schNotStr }
								aria-label='Interval in months'

								onChange={ ( chaEveObj ) => updPatFun( { interval : Math.max( 1, parseInt( chaEveObj.target.value ) || 1 ) } ) } // What: Interval Clamp Commit. Why: An empty or invalid number must never commit an interval below 1. How: This parses the typed value, falling back to 1 and clamping at 1.
							/>{ /* What: Interval Number Input Element. Why: This is the actual every-N-months control. How: This clamps its own committed value to a minimum of 1 whole month. */ }

							<span>{ ( tasRcdObj.interval || 1 ) === 1 ? 'month' : 'months' }</span>{ /* What: Months Label Span Element. Why: This is the inline control's own trailing word, singular or plural to match the current interval. How: This picks between 'month' and 'months' based on tasRcdObj's own interval. */ }


						</div>



						<ColDisCom open={ ( tasRcdObj.interval || 1 ) > 1 }>{ /* What: Collapse Disclosure Component. Why: The counted-from hint is only meaningful once interval is above 1 month. How: This animates ancHinEle open only while that condition holds. */ }


							<div className='cad-anchor-fade'>{ ancHinEle }</div>{ /* What: Anchor Fade Div Element. Why: The counted-from hint needs its own fade wrapper distinct from ColDisCom's own height animation. How: This renders ancHinEle inside a plain div that CSS cross-fades on interval change. */ }


						</ColDisCom>


					</div>


				) }


				{ curRepStr === 'monthly' && ( // What: Monthly Day Visibility Check. Why: This is the monthly kind's own second, independent subsection, targeting which day of the month. How: This renders it only while curRepStr is 'monthly', right after the frequency subsection above.


					<div className='rem-field'>{ /* What: Monthly Day Field Div Element. Why: This groups the Date/Weekday mode toggle and its own detail controls as one schedule subsection. How: This renders SegConCom plus whichever detail row matches the current dateMode. */ }


						<div className='rem-flabel-wrap'>{ /* What: Flabel Wrap Div Element. Why: The subsection's own label and live summary need to sit together. How: This wraps the plain label span and the fading summary span below. */ }


							<span className='rem-flabel'>Day of the month</span>{ /* What: Flabel Span Element. Why: This is the subsection's own plain label. How: This renders the literal text "Day of the month". */ }

							<span
								key={ tasRcdObj.dateMode === 'nthWeekday' ? 'nthWeekday' : 'date' }

								className='rem-flabel-sub set-sub-fade'
							>{ /* What: Flabel Sub Span Element. Why: This is the live summary of which day targeting mode is active, re-fading on mode switch. How: This renders one of the 2 branches below depending on tasRcdObj's own dateMode. */ }
								shows on the Today page <strong>{ tasRcdObj.dateMode === 'nthWeekday' // What: Date Mode Check. Why: The monthly target reads differently for each date mode. How: This picks the nth-weekday or plain-date phrase below based on dateMode.
									? <>on the { ordSufFun( tasRcdObj.nthOrdinal || 1 ) } { dayFulArr[ tasRcdObj.nthWeekday ?? 0 ] }</> // What: Nth-Weekday Summary Phrase. Why: In this mode the target reads as an ordinal weekday, e.g. "the 2nd Tuesday". How: This names tasRcdObj's own nthOrdinal and nthWeekday.
									: <>every { ordSufFun( tasRcdObj.dayOfMonth || 1 ) }</>                                             // What: Plain Date Summary Phrase. Why: In the default mode the target reads as a plain ordinal day, e.g. "every 15th". How: This names tasRcdObj's own dayOfMonth.
								} of the month</strong>
							</span>


						</div>



						<SegConCom
							optIteArr={ datModArr }
							value={ tasRcdObj.dateMode === 'nthWeekday' ? 'nthWeekday' : 'date' } // What: Date Mode Value. Why: An older task may carry no dateMode at all, which should read as the plain date mode. How: This maps anything other than 'nthWeekday' to 'date'.

							ariLabStr='Day selection'
							desIdeStr={ schNotStr }

							onChange={ ( modKeyStr ) => updPatFun( { dateMode : modKeyStr } ) }
						/>{ /* What: Segment Control Component. Why: This is the Date-vs-Weekday targeting mode toggle. How: This commits the clicked option's own key as tasRcdObj's new dateMode. */ }



						{ tasRcdObj.dateMode === 'nthWeekday' ? ( // What: Nth-Weekday Mode Check. Why: The monthly detail row's own shape depends on which date-targeting mode is selected. How: This renders the ordinal-plus-weekday selects while tasRcdObj.dateMode is 'nthWeekday', the plain day-of-month select otherwise.


							<div className='rem-inline'>{ /* What: Nth-Weekday Inline Div Element. Why: This mode needs 2 selects (ordinal, weekday) read together as one sentence. How: This wraps the "On the" label and both selects below. */ }


								<span>On the</span>{ /* What: On-The Span Element. Why: This is the inline row's own leading words. How: This renders the literal text "On the". */ }

								<select
									className='np-input rem-sel'

									value={ tasRcdObj.nthOrdinal || 1 }

									aria-describedby={ schNotStr }
									aria-label='Week of the month'

									onChange={ ( chaEveObj ) => updPatFun( { nthOrdinal : parseInt( chaEveObj.target.value ) } ) }
								>{ /* What: Ordinal Select Element. Why: This is the "1st through 5th" occurrence picker. How: This commits the chosen option's own numeric value as tasRcdObj's new nthOrdinal. */ }


									{ [ 1, 2, 3, 4, 5 ].map( ( nthOptNum ) => ( // What: Ordinal Option List Render. Why: One option is needed per occurrence, 1st through 5th. How: This maps a literal 1-5 array to one option per entry, keyed by its own nthOptNum, labeled with its ordinal suffix.


										<option
											key={ nthOptNum }

											value={ nthOptNum }
										>{ ordSufFun( nthOptNum ) }</option> // What: Ordinal Option Element. Why: This is one choice in the select. How: This renders its own label, valued by its own value above.


									) ) }


								</select>

								<select
									className='np-input rem-sel'

									value={ tasRcdObj.nthWeekday ?? 0 }

									aria-describedby={ schNotStr }
									aria-label='Weekday'

									onChange={ ( chaEveObj ) => updPatFun( { nthWeekday : parseInt( chaEveObj.target.value ) } ) }
								>{ /* What: Weekday Select Element. Why: This is the target-weekday picker for the Nth-weekday mode. How: This commits the chosen option's own numeric value as tasRcdObj's new nthWeekday. */ }


									{ dayFulArr.map( ( dowNamStr, dowIndNum ) => ( // What: Weekday Option List Render. Why: One option is needed per weekday. How: This maps dayFulArr to one option per entry, keyed by its own dowNamStr, valued by its own dowIndNum.


										<option
											key={ dowNamStr }

											value={ dowIndNum }
										>{ dowNamStr }</option> // What: Weekday Option Element. Why: This is one choice in the select. How: This renders its own label, valued by its own value above.


									) ) }


								</select>


							</div>


						) : ( // What: Plain Date Mode Branch. Why: The default mode just needs the plain day-of-month select instead. How: This renders the else branch, taken while tasRcdObj.dateMode isn't 'nthWeekday'.


							<div className='rem-inline'>{ /* What: Plain Date Inline Div Element. Why: The default mode only needs the single day-of-month select read alongside its own label. How: This wraps the "On the" label and the day select below. */ }


								<span>On the</span>{ /* What: On-The Span Element. Why: This is the inline row's own leading words. How: This renders the literal text "On the". */ }

								<select
									className='np-input rem-sel'

									value={ tasRcdObj.dayOfMonth || 1 }

									aria-describedby={ schNotStr }
									aria-label='Day of the month'

									onChange={ ( chaEveObj ) => updPatFun( { dayOfMonth : parseInt( chaEveObj.target.value ) } ) }
								>{ /* What: Day-Of-Month Select Element. Why: This is the plain 1-31 day picker for the default mode. How: This commits the chosen option's own numeric value as tasRcdObj's new dayOfMonth. */ }


									{ Array.from( { length : 31 }, ( _, domIndNum ) => domIndNum + 1 ).map( ( domNum ) => ( // What: Day Of Month Option List Render. Why: One option is needed per possible day of month, 1 through 31. How: This maps a generated 1-31 array to one option per entry, keyed by its own domNum.


										<option
											key={ domNum }

											value={ domNum }
										>{ ordSufFun( domNum ) }</option> // What: Day-Of-Month Option Element. Why: One option is needed per possible day-of-month. How: This renders domNum's own ordinal label.


									) ) }


								</select>


							</div>


						) }

						{ tasRcdObj.dateMode === 'nthWeekday' // What: Clamp Hint Mode Check. Why: Each date mode has its own clamp edge case to warn about. How: This picks the nth-weekday hint while dateMode is 'nthWeekday', the plain-date hint otherwise.
							? ( tasRcdObj.nthOrdinal || 1 ) === 5 && <p className='rem-hint'>In months without a 5th, this falls on the 4th instead.</p> // What: Nth-Weekday Clamp Hint. Why: A requested 5th occurrence doesn't exist in every month, so the user needs to know the real fallback rule. How: This renders only when nthOrdinal is exactly 5.
							: ( tasRcdObj.dayOfMonth || 1 ) > 28 && <p className='rem-hint'>In shorter months this falls on the last day.</p>            // What: Plain Date Clamp Hint. Why: A day past 28 doesn't exist in every month, so the user needs to know the real fallback rule. How: This renders only when dayOfMonth is past 28.
						}



						{ staAppObj && ( // What: Monthly Day Visibility Check. Why: Same reasoning as oncFieEle's own check. How: This renders VisNotCom, gated on kinValStr 'schedule', only while staAppObj was actually passed.


							<VisNotCom
								kinValStr='schedule'
								notIdeStr={ schNotStr }
								staAppObj={ staAppObj }
								tasRcdObj={ tasRcdObj }
							/> // What: Visibility Note Component. Why: This is the schedule-placement advisory, which only ever shows when a schedule-based cause applies. How: This passes kinValStr 'schedule' and schNotStr as its own note id.


						) }


					</div>


				) }


				{ curRepStr === 'annual' && ( // What: Annual Frequency Visibility Check. Why: The annual kind splits into 2 independent subsections; this is the first, the every-N-years control. How: This renders it only while curRepStr is 'annual'.


					<div className='rem-field'>{ /* What: Annual Frequency Field Div Element. Why: This groups the every-N-years control and its own anchor hint as one schedule subsection. How: This renders the number input plus the shared anchor hint, collapsed until interval is above 1. */ }


						<div className='rem-flabel-wrap'>{ /* What: Flabel Wrap Div Element. Why: The subsection's own label and live summary need to sit together. How: This wraps the plain label span and the fading summary span below. */ }


							<span className='rem-flabel'>Frequency</span>{ /* What: Flabel Span Element. Why: This is the subsection's own plain label. How: This renders the literal text "Frequency". */ }

							<span
								key={ tasRcdObj.interval || 1 }

								className='rem-flabel-sub set-sub-fade'
							>shows on the Today page <strong>every { ( tasRcdObj.interval || 1 ) > 1 ? `${ tasRcdObj.interval } years` : 'year' }</strong></span>{ /* What: Flabel Sub Span Element. Why: This is the live cadence summary, re-fading whenever interval changes. How: This picks between a plain "year" and an "every N years" phrase based on tasRcdObj's own interval. */ }


						</div>

						<div className='rem-inline'>{ /* What: Annual Inline Div Element. Why: The every-N-years number input reads best inline with its own surrounding words. How: This wraps the "Every", the number input, and the "year(s)" label. */ }


							<span>Every</span>{ /* What: Every Span Element. Why: This is the inline control's own leading word. How: This renders the literal text "Every". */ }

							<input
								className='np-input rem-num'

								max='50'
								min='1'
								type='number'
								value={ tasRcdObj.interval || 1 }

								aria-describedby={ schNotStr }
								aria-label='Interval in years'

								onChange={ ( chaEveObj ) => updPatFun( { interval : Math.max( 1, parseInt( chaEveObj.target.value ) || 1 ) } ) } // What: Interval Clamp Commit. Why: An empty or invalid number must never commit an interval below 1. How: This parses the typed value, falling back to 1 and clamping at 1.
							/>{ /* What: Interval Number Input Element. Why: This is the actual every-N-years control. How: This clamps its own committed value to a minimum of 1 whole year. */ }

							<span>{ ( tasRcdObj.interval || 1 ) === 1 ? 'year' : 'years' }</span>{ /* What: Years Label Span Element. Why: This is the inline control's own trailing word, singular or plural to match the current interval. How: This picks between 'year' and 'years' based on tasRcdObj's own interval. */ }


						</div>



						<ColDisCom open={ ( tasRcdObj.interval || 1 ) > 1 }>{ /* What: Collapse Disclosure Component. Why: The counted-from hint is only meaningful once interval is above 1 year. How: This animates ancHinEle open only while that condition holds. */ }


							<div className='cad-anchor-fade'>{ ancHinEle }</div>{ /* What: Anchor Fade Div Element. Why: The counted-from hint needs its own fade wrapper distinct from ColDisCom's own height animation. How: This renders ancHinEle inside a plain div that CSS cross-fades on interval change. */ }


						</ColDisCom>


					</div>


				) }


				{ curRepStr === 'annual' && ( // What: Annual Date Visibility Check. Why: This is the annual kind's own second, independent subsection, targeting which date each year. How: This renders it only while curRepStr is 'annual', right after the frequency subsection above.


					<div className='rem-field'>{ /* What: Annual Date Field Div Element. Why: This groups the Date/Weekday mode toggle and its own detail controls as one schedule subsection. How: This renders SegConCom plus whichever detail row matches the current dateMode. */ }


						<div className='rem-flabel-wrap'>{ /* What: Flabel Wrap Div Element. Why: The subsection's own label and live summary need to sit together. How: This wraps the plain label span and the fading summary span below. */ }


							<span className='rem-flabel'>Date each year</span>{ /* What: Flabel Span Element. Why: This is the subsection's own plain label. How: This renders the literal text "Date each year". */ }

							<span
								key={ tasRcdObj.dateMode === 'nthWeekday' ? 'nthWeekday' : 'date' }

								className='rem-flabel-sub set-sub-fade'
							>{ /* What: Flabel Sub Span Element. Why: This is the live summary of which day targeting mode is active, re-fading on mode switch. How: This renders one of the 2 branches below depending on tasRcdObj's own dateMode. */ }
								shows on the Today page <strong>{ tasRcdObj.dateMode === 'nthWeekday' // What: Date Mode Check. Why: The yearly target reads differently for each date mode. How: This picks the nth-weekday or plain-date phrase below based on dateMode.
									? <>the { ordSufFun( tasRcdObj.nthOrdinal || 1 ) } { dayFulArr[ tasRcdObj.nthWeekday ?? 0 ] } of { monFulArr[ ( tasRcdObj.month || 1 ) - 1 ] }</> // What: Nth-Weekday Summary Phrase. Why: In this mode the target reads as an ordinal weekday within a named month, e.g. "the 2nd Tuesday of June". How: This names tasRcdObj's own nthOrdinal, nthWeekday, and month.
									: <>{ monFulArr[ ( tasRcdObj.month || 1 ) - 1 ] } { tasRcdObj.day || 1 }</>                                                                       // What: Plain Date Summary Phrase. Why: In the default mode the target reads as a plain month/day, e.g. "June 15". How: This names tasRcdObj's own month and day.
								}</strong>
							</span>


						</div>



						<SegConCom
							optIteArr={ datModArr }
							value={ tasRcdObj.dateMode === 'nthWeekday' ? 'nthWeekday' : 'date' } // What: Date Mode Value. Why: An older task may carry no dateMode at all, which should read as the plain date mode. How: This maps anything other than 'nthWeekday' to 'date'.

							ariLabStr='Day selection'
							desIdeStr={ schNotStr }

							onChange={ ( modKeyStr ) => updPatFun( { dateMode : modKeyStr } ) }
						/>{ /* What: Segment Control Component. Why: This is the Date-vs-Weekday targeting mode toggle. How: This commits the clicked option's own key as tasRcdObj's new dateMode. */ }



						{ tasRcdObj.dateMode === 'nthWeekday' ? ( // What: Nth-Weekday Mode Check. Why: The annual detail row's own shape depends on which date-targeting mode is selected. How: This renders the ordinal-plus-weekday-plus-month selects while tasRcdObj.dateMode is 'nthWeekday', the plain month-plus-day selects otherwise.


							<div className='rem-inline'>{ /* What: Nth-Weekday Inline Div Element. Why: This mode needs 3 selects (ordinal, weekday, month) read together as one sentence. How: This wraps both selects, the "of" word, and the month select below. */ }


								<select
									className='np-input rem-sel'

									value={ tasRcdObj.nthOrdinal || 1 }

									aria-describedby={ schNotStr }
									aria-label='Week of the month'

									onChange={ ( chaEveObj ) => updPatFun( { nthOrdinal : parseInt( chaEveObj.target.value ) } ) }
								>{ /* What: Ordinal Select Element. Why: This is the "1st through 5th" occurrence picker. How: This commits the chosen option's own numeric value as tasRcdObj's new nthOrdinal. */ }


									{ [ 1, 2, 3, 4, 5 ].map( ( nthOptNum ) => ( // What: Ordinal Option List Render. Why: One option is needed per occurrence, 1st through 5th. How: This maps a literal 1-5 array to one option per entry, keyed by its own nthOptNum, labeled with its ordinal suffix.


										<option
											key={ nthOptNum }

											value={ nthOptNum }
										>{ ordSufFun( nthOptNum ) }</option> // What: Ordinal Option Element. Why: This is one choice in the select. How: This renders its own label, valued by its own value above.


									) ) }


								</select>

								<select
									className='np-input rem-sel'

									value={ tasRcdObj.nthWeekday ?? 0 }

									aria-describedby={ schNotStr }
									aria-label='Weekday'

									onChange={ ( chaEveObj ) => updPatFun( { nthWeekday : parseInt( chaEveObj.target.value ) } ) }
								>{ /* What: Weekday Select Element. Why: This is the target-weekday picker for the Nth-weekday mode. How: This commits the chosen option's own numeric value as tasRcdObj's new nthWeekday. */ }


									{ dayFulArr.map( ( dowNamStr, dowIndNum ) => ( // What: Weekday Option List Render. Why: One option is needed per weekday. How: This maps dayFulArr to one option per entry, keyed by its own dowNamStr, valued by its own dowIndNum.


										<option
											key={ dowNamStr }

											value={ dowIndNum }
										>{ dowNamStr }</option> // What: Weekday Option Element. Why: This is one choice in the select. How: This renders its own label, valued by its own value above.


									) ) }


								</select>

								<span>of</span>{ /* What: Of Span Element. Why: This joins the weekday selects to the month select below as one sentence. How: This renders the literal text "of". */ }

								<select
									className='np-input rem-sel'

									value={ tasRcdObj.month || 1 }

									aria-describedby={ schNotStr }
									aria-label='Month'

									onChange={ ( chaEveObj ) => updPatFun( { month : parseInt( chaEveObj.target.value ) } ) }
								>{ /* What: Month Select Element. Why: This is the target-month picker for the Nth-weekday mode. How: This commits the chosen option's own 1-indexed value as tasRcdObj's new month. */ }


									{ monAbbArr.map( ( monNamStr, monIndNum ) => ( // What: Month Option List Render. Why: One option is needed per month. How: This maps monAbbArr to one option per entry, keyed by its own monNamStr, valued by its own 1-indexed monIndNum.


										<option
											key={ monNamStr }

											value={ monIndNum + 1 }
										>{ monNamStr }</option> // What: Month Option Element. Why: This is one choice in the select. How: This renders its own label, valued by its own value above.


									) ) }


								</select>


							</div>


						) : ( // What: Plain Date Mode Branch. Why: The default mode just needs the plain month-and-day selects instead. How: This renders the else branch, taken while tasRcdObj.dateMode isn't 'nthWeekday'.


							<div className='rem-inline'>{ /* What: Plain Date Inline Div Element. Why: The default mode needs a month select and a day select read together. How: This wraps both selects below. */ }


								<select
									className='np-input rem-sel'

									value={ tasRcdObj.month || 1 }

									aria-describedby={ schNotStr }
									aria-label='Month'

									onChange={ ( chaEveObj ) => updPatFun( { month : parseInt( chaEveObj.target.value ) } ) }
								>{ /* What: Month Select Element. Why: This is the target-month picker for the default mode. How: This commits the chosen option's own 1-indexed value as tasRcdObj's new month. */ }


									{ monAbbArr.map( ( monNamStr, monIndNum ) => ( // What: Month Option List Render. Why: One option is needed per month. How: This maps monAbbArr to one option per entry, keyed by its own monNamStr, valued by its own 1-indexed monIndNum.


										<option
											key={ monNamStr }

											value={ monIndNum + 1 }
										>{ monNamStr }</option> // What: Month Option Element. Why: This is one choice in the select. How: This renders its own label, valued by its own value above.


									) ) }


								</select>

								<select
									className='np-input rem-sel'

									value={ tasRcdObj.day || 1 }

									aria-describedby={ schNotStr }
									aria-label='Day'

									onChange={ ( chaEveObj ) => updPatFun( { day : parseInt( chaEveObj.target.value ) } ) }
								>{ /* What: Day Select Element. Why: This is the plain 1-31 day picker for the default mode. How: This commits the chosen option's own numeric value as tasRcdObj's new day. */ }


									{ Array.from( { length : 31 }, ( _, domIndNum ) => domIndNum + 1 ).map( ( domNum ) => ( // What: Day Option List Render. Why: One option is needed per possible day of month, 1 through 31. How: This maps a generated 1-31 array to one option per entry, keyed by its own domNum.


										<option
											key={ domNum }

											value={ domNum }
										>{ domNum }</option> // What: Day Option Element. Why: One option is needed per possible day-of-month. How: This renders domNum's own plain numeric label, unlike the ordinal label the monthly subsection uses.


									) ) }


								</select>


							</div>


						) }

						{ tasRcdObj.dateMode === 'nthWeekday' && ( tasRcdObj.nthOrdinal || 1 ) === 5 && ( // What: Nth-Weekday Clamp Hint Check. Why: A requested 5th occurrence doesn't exist in every year for a given month, so the user needs to know the real fallback rule. How: This renders the hint only when both conditions hold.


							<p className='rem-hint'>In years where that month has no 5th, this falls on the 4th instead.</p> // What: Nth-Weekday Clamp Hint Element. Why: A requested 5th occurrence doesn't exist in every year for a given month, so the user needs to know the real fallback rule. How: This renders only when the Clamp Hint Check above holds.


						) }



						{ staAppObj && ( // What: Annual Date Visibility Check. Why: Same reasoning as oncFieEle's own check. How: This renders VisNotCom, gated on kinValStr 'schedule', only while staAppObj was actually passed.


							<VisNotCom
								kinValStr='schedule'
								notIdeStr={ schNotStr }
								staAppObj={ staAppObj }
								tasRcdObj={ tasRcdObj }
							/> // What: Visibility Note Component. Why: This is the schedule-placement advisory, which only ever shows when a schedule-based cause applies. How: This passes kinValStr 'schedule' and schNotStr as its own note id.


						) }


					</div>


				) }


			</React.Fragment>


		);


	} )();

	// #endregion Schedule Field Elements



	return (


		<div className='rem-editor'>{ /* What: Reminder Editor Div Element. Why: This is SchEdiCom's own root element, holding the Repeat row and whichever detail subsection currently applies. How: This renders the Repeat row, then either oncFieEle or extFieEle based on tasRcdObj's own repeat. */ }


			<div className='rem-field'>{ /* What: Repeat Field Div Element. Why: The Repeat control is its own schedule subsection, always shown regardless of which kind is selected. How: This renders the segmented control plus its own live summary and visibility note. */ }


				<div className='rem-flabel-wrap'>{ /* What: Flabel Wrap Div Element. Why: The subsection's own label and live summary need to sit together. How: This wraps the plain label span and the fading summary span below. */ }


					<span className='rem-flabel'>Repeat</span>{ /* What: Flabel Span Element. Why: This is the subsection's own plain label. How: This renders the literal text "Repeat". */ }

					<span
						key={ tasRcdObj.repeat }

						className='rem-flabel-sub set-sub-fade'
					>{ ( REP_OPT_ARR.find( ( optConObj ) => optConObj.keyStr === tasRcdObj.repeat ) || {} ).subEle }</span>{ /* What: Flabel Sub Span Element. Why: This is the live sub-explanation matching the currently-selected repeat kind. How: This looks up REP_OPT_ARR by tasRcdObj's own repeat and renders that entry's own subEle. */ }


				</div>



				<SegConCom
					optIteArr={ REP_OPT_ARR }
					value={ tasRcdObj.repeat }

					ariLabStr='Repeat'
					desIdeStr={ repNotStr }

					onChange={ ( modKeyStr ) => updPatFun({ // What: Repeat Change Handler. Why: interval is shared across interval/weekly/monthly/annual (each its own "every N ___"), so switching kind resets it to that kind's own sensible default instead of carrying over a number that meant something else a moment ago. How: This commits the new repeat kind plus a matching default interval.


						interval : modKeyStr === 'interval' ? 2 : 1, // What: Interval. Why: Every N days defaults to every 2, since every 1 day would just be daily. How: This picks 2 for the interval kind and 1 for every other kind.
						repeat   : modKeyStr                         // What: Repeat. Why: This is the newly selected repeat kind. How: This is modKeyStr.


					}) }
				/>{ /* What: Segment Control Component. Why: This is the actual Repeat kind picker. How: This renders one button per REP_OPT_ARR entry, committing both repeat and a reset interval on change. */ }



				{ staAppObj && ( // What: Repeat Visibility Check. Why: A settings-based mismatch (weekends/holidays/skipUntil) belongs next to this row rather than the schedule subsection below. How: This renders VisNotCom, gated on kinValStr 'settings', only while staAppObj was actually passed.


					<VisNotCom
						kinValStr='settings'
						notIdeStr={ repNotStr }
						staAppObj={ staAppObj }
						tasRcdObj={ tasRcdObj }
					/> // What: Visibility Note Component. Why: This is the settings-placement advisory, which only ever shows when a settings-based cause applies. How: This passes kinValStr 'settings' and repNotStr as its own note id.


				) }


			</div>



			{ aniExtBoo // What: Once Fields Animation Check. Why: Only a caller that opted into animation wraps the once fields in a collapse. How: This picks the animated or plain branch below based on aniExtBoo.
				? <ColDisCom open={ tasRcdObj.repeat === 'once' }><div className='rem-extra-fade'>{ oncFieEle }</div></ColDisCom> // What: Animated Once Fields Branch. Why: A caller that opted into animation needs the once-fields subsection to grow/shrink instead of snapping. How: This wraps oncFieEle in ColDisCom, open only while repeat is 'once'.
				: ( tasRcdObj.repeat === 'once' && oncFieEle )                                                                    // What: Plain Once Fields Branch. Why: A caller that didn't opt into animation just needs oncFieEle shown or hidden outright. How: This renders oncFieEle directly, with no ColDisCom wrapper, only while repeat is 'once'.
			}



			{ aniExtBoo ? ( // What: Animated Extra Fields Branch. Why: A caller that opted into animation needs the extra-fields subsection to grow/shrink, and to re-key on kind switch so its own internal ColDisCom states reset cleanly. How: This wraps extFieEle in ColDisCom, open whenever repeat isn't 'once', keyed by curRepStr.


				<ColDisCom open={ tasRcdObj.repeat !== 'once' }>{ /* What: Collapse Disclosure Component. Why: A caller that opted into animation needs the extra-fields subsection to grow/shrink instead of snapping. How: This wraps extFieEle, open whenever repeat isn't 'once'. */ }


					<div
						key={ tasRcdObj.repeat === 'once' ? lasExtRef.current : tasRcdObj.repeat } // What: Extra Kind Key. Why: A genuine kind switch should remount the subsection, but collapsing back to 'once' should not. How: This keys on the remembered last kind while repeat is 'once', the real repeat otherwise.

						className='rem-extra-fade'
					>{ extFieEle }</div>{ /* What: Extra Fade Div Element. Why: The extra-fields subsection needs to re-key on a genuine kind switch, so its own internal ColDisCom states reset cleanly instead of carrying over stale open/closed state. How: This keys on lasExtRef's own remembered kind while collapsing back to 'once', otherwise the task's own real repeat. */ }


				</ColDisCom>


			) : ( // What: Plain Extra Fields Branch. Why: A caller that didn't opt into animation just needs extFieEle shown or hidden outright, which it already does internally via its own curRepStr checks. How: This renders extFieEle directly, with no ColDisCom wrapper.


				extFieEle


			) }


		</div>


	);


}

// #endregion SchEdiCom



// #region InlEdiCom

/**
 * InlEdiCom = Inline Edit Component
 *
 * @summary
 * Today's inline editor for a SAVED reminder. Edits a LOCAL draft
 * (never the store directly) so changing the schedule, e.g. moving a
 * weekly reminder off today, doesn't immediately filter the row out of
 * the live list; the change only lands on Save.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.onCloEdiFun - On Close Edit Function: Closes this inline editor
 *                            without saving.
 * @param props.onComTasFun - On Commit Task Function: Commits the local draft
 *                            back onto the real store.
 * @param props.onDelTasFun - On Delete Task Function: Deletes the underlying
 *                            reminder outright.
 * @param props.staAppObj   - State App Object: The shared app state, passed
 *                            through to {@link SchEdiCom}.
 * @param props.tasRcdObj   - Task Record Object: The saved reminder record
 *                            being edited.
 *
 * @returns The inline editor's own schedule editor plus its footer.
 *
 * @example
 * ```tsx
 * InlEdiCom({ onCloEdiFun, onComTasFun, ... }) // => <InlEdiCom />
 * ```
 *
*/

function InlEdiCom ( { onCloEdiFun, onComTasFun, onDelTasFun, staAppObj, tasRcdObj } ) {


	const [ draTasObj, setDraTasObj ] = React.useState( () => ( { ...tasRcdObj } ) ); // What: Draft Task Object And Setter. Why: The schedule editor below must edit a local copy, not the store directly, so a change doesn't immediately filter the row out of the live list. How: This starts as a shallow copy of tasRcdObj and is patched by draActObj below.

	const draActObj = { updTasFun : ( tasIdeStr, patValObj ) => setDraTasObj( ( curDraObj ) => ( { ...curDraObj, ...patValObj } ) ) }; // What: Draft Actions Object. Why: SchEdiCom expects an actions bag exposing updTasFun; this stands in for the real one, patching draTasObj locally instead of the store. How: This ignores its own first argument (SchEdiCom always passes tasRcdObj.id, already known here) and merges patValObj into draTasObj.



	return (


		<div className='rem-inline-editor'>{ /* What: Inline Editor Div Element. Why: This groups the schedule editor and its own footer as one visual unit. How: This renders SchEdiCom against draTasObj, then EdiFooCom below it. */ }


			<SchEdiCom
				actStoObj={ draActObj }
				aniExtBoo
				staAppObj={ staAppObj }
				tasRcdObj={ draTasObj }
			/>{ /* What: Schedule Editor Component. Why: This is the actual live schedule editor, operating on the local draft. How: This is passed draActObj instead of the real store actions, so every edit stays local until Save. */ }



			<EdiFooCom
				tasRcdObj={ draTasObj }

				onCanTasFun={ () => onCloEdiFun() }
				onDelTasFun={ onDelTasFun }
				onDonTasFun={ () => { // What: Save Handler. Why: Save commits the local draft and closes the editor. How: This commits draTasObj, then closes.


					onComTasFun( draTasObj ); // What: Draft Commit Call. Why: The local draft only reaches the store on Save. How: This passes draTasObj to onComTasFun.

					onCloEdiFun(); // What: Editor Close Call. Why: A saved editor has nothing left to show. How: This calls onCloEdiFun.


				} }
			/>{ /* What: Editor Foot Component. Why: This is the shared Cancel/Save/Delete footer. How: Cancel just closes without committing; Save commits draTasObj onto the real store via onComTasFun, then closes. */ }


		</div>


	);


}

// #endregion InlEdiCom



// #region RemManCom

/**
 * RemManCom = Reminder Manager Component
 *
 * @summary
 * The Data tab's full reminder management: a collapsible category holding the
 * participation Controls (OptMatCom) and the sortable Items list, where each
 * row expands into the same schedule editor and footer Today uses, committing
 * straight to the store. Rendered by tab-data.jsx.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actStoObj - Action Store Object: The shared app actions that
 *                          mutate props.staAppObj.
 * @param props.staAppObj - State App Object: The entire app's own persisted
 *                          state.
 *
 * @returns The Reminders category: its header, the Controls
 * disclosure (OptMatCom), and the Items disclosure (one row per
 * reminder, expanding into SchEdiCom plus EdiFooCom).
 *
 * @example
 * ```tsx
 * RemManCom({ actStoObj, staAppObj }) // => <RemManCom />
 * ```
 *
*/

function RemManCom ( { actStoObj, staAppObj } ) {


	// #region Open Row Tracking

	const [ opeIdeStr, setOpeIdeStr ] = React.useState( null ); // What: Open Identifier String And Setter. Why: This tracks which reminder's own row is currently expanded into its editor. How: This is compared against each row's own id throughout the render below.
	const [ insIdeStr, setInsIdeStr ] = React.useState( null ); // What: Insert Identifier String And Setter. Why: A just-inserted reminder row needs to play its own slide-in entrance exactly once. How: This is set right when a row is created or an editor closes, cleared on that row's own animation end.

	const newAddRef = React.useRef( null ); // What: New Added Reference. Why: A reminder just created via "New reminder" hasn't been kept yet; Cancel on such an item discards the whole add (removes it) rather than reverting to an empty snapshot. How: This holds that reminder's own id until it's kept, cleared by kepCloFun.
	const opeEdiRef = React.useRef( null ); // What: Open Editor Reference. Why: The currently-open reminder's own EdiFooCom instance needs to be reachable from outside itself, so the row's own collapse chevron can call its kepFun before closing. How: This is attached only to the currently-open row's own EdiFooCom, via its ref prop below.
	const froIndRef = React.useRef( null ); // What: Frozen Index Reference. Why: freEdiFun needs a place to remember whichever reminder's own render position is currently frozen. How: This is passed straight through to freEdiFun below.
	const preOpeRef = React.useRef( null ); // What: Previous Open Reference. Why: The effect right below needs opeIdeStr's own PRIOR value to detect a genuine close, not just its current value. How: This is read and overwritten at the end of that same effect.
	const opeRowRef = React.useRef( null ); // What: Open Row Reference. Why: A brand-new reminder's own "+ New reminder" click needs to scroll the resulting form into view, since it opens pinned below the sort control rather than guaranteed to already be on-screen. How: This is attached only to the currently-open row's own DOM node, via its ref prop below.
	const focInpRef = React.useRef( null ); // What: Focus Input Reference. Why: The open row's own name input focuses itself via a ref callback below instead of plain autoFocus, suppressing the browser's own instant focus-scroll so it doesn't fight the deliberate smooth scroll above. How: This is attached via that input's own ref callback in the render below.


	React.useEffect( () => { // What: Replay Insert Effect. Why: Whichever reminder's own editor just closed (Done, Cancel-revert, delete, or the row's own collapse chevron) should replay the insert entrance once it settles into its (possibly new, now-unfrozen) sorted position, instead of silently snapping there. How: This detects an opeIdeStr transition away from a real id, then stages that id as insIdeStr.


		const preOpeStr = preOpeRef.current; // What: Previous Open String. Why: This is compared against opeIdeStr below to detect the exact close transition. How: This reads preOpeRef's own remembered prior value.

		if ( preOpeStr != null && preOpeStr !== opeIdeStr ) setInsIdeStr( preOpeStr ); // What: Close Transition Guard. Why: Only a genuine "was open, now isn't (or moved to a different row)" transition should replay the insert entrance. How: This stages preOpeStr as insIdeStr only when both conditions hold.



		preOpeRef.current = opeIdeStr; // What: Previous Open Snapshot Update. Why: The next run of this effect needs to compare against whatever opeIdeStr is right now. How: This overwrites preOpeRef with opeIdeStr's own current value.


	}, [ opeIdeStr ] ); // What: Effect Dependency Array. Why: This effect only needs to re-run when opeIdeStr itself changes, since that's the exact transition it watches for. How: opeIdeStr is compared against preOpeRef's own remembered prior value every run.


	React.useEffect( () => { // What: Scroll Into View Effect. Why: Only a BRAND-NEW reminder's own editor opening should auto-scroll; reopening an existing reminder's editor should not yank the viewport. How: This guards on newAddRef still matching opeIdeStr, then scrolls opeRowRef's own current node into view, waiting for the ColDisCom open animation to finish first (unless reduced motion).


		if ( !opeIdeStr || newAddRef.current !== opeIdeStr || !opeRowRef.current ) return; // What: Not-A-New-Open Guard. Why: Every other case (no row open, a re-opened existing row, or the ref not yet attached) should do nothing at all. How: This bails out unless all 3 conditions hold.



		const rowCurEle = opeRowRef.current; // What: Row Current Element. Why: This gives a stable local reference to the live row DOM node for this scroll pass. How: This is read once from opeRowRef.current and reused below.



		if ( redMotFun() ) { rowCurEle.scrollIntoView( { behavior : 'auto', block : 'nearest' } ); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion should get an instant scroll instead of a smooth, timed one. How: This scrolls instantly and returns early when redMotFun reports true.



		const scrTimNum = setTimeout( () => rowCurEle.scrollIntoView( { behavior : 'smooth', block : 'nearest' } ), 300 ); // What: Scroll Timeout Number. Why: The ColDisCom open animation (.26s, see .collapse in styles2.css) needs to finish growing the editor below the row header before scrolling, or the scroll target would still be moving. How: This waits 300ms, then scrolls smoothly.



		return () => clearTimeout( scrTimNum ); // What: Effect Cleanup Return. Why: A pending scroll must not fire after this effect re-runs or the component unmounts. How: This clears scrTimNum.


	}, [ opeIdeStr ] ); // What: Effect Dependency Array. Why: This effect only needs to re-run when opeIdeStr itself changes, since that's the exact condition its own guard checks. How: opeIdeStr is read directly inside the effect body above.

	// #endregion Open Row Tracking



	// #region Items List Order

	const visTasArr = ( staAppObj.tasks || [] ).filter( ( curTasObj ) => !curTasObj.hidden );                     // What: Visible Task Array. Why: A hidden (mini-tour-linked) task must never appear in this real management list. How: This filters staAppObj's own tasks by their own hidden flag.
	const iteSorStr = ( staAppObj.ui && staAppObj.ui.dataSort && staAppObj.ui.dataSort.reminders ) || 'name-asc'; // What: Item Sort String. Why: The Items list's own sort needs a persisted, defaulted value to drive both the sort control and the comparator below. How: This reads staAppObj's own ui.dataSort.reminders, falling back to 'name-asc'.


	const tasDatMap = new Map( visTasArr.map( ( curTasObj ) => { // What: Task Date Map. Why: TAS_NAM_OBJ.nexEliFun can walk up to ~3 years of days per call; computing every task's own next date once up front (rather than inside the comparator below, which runs it on every comparison) avoids doing that work redundantly. How: This maps each visible task to a [id, time] pair.


		const nexEliObj = TAS_NAM_OBJ.nexEliFun( curTasObj, staAppObj.reminderOpts, staAppObj.holidays ); // What: Next Eligible Object. Why: This is the actual date sorEntFun sorts by for the date-asc/date-desc options. How: This calls TAS_NAM_OBJ.nexEliFun against curTasObj.



		return [ curTasObj.id, nexEliObj ? nexEliObj.getTime() : null ]; // What: Task Date Pair Return. Why: A Map needs a real, comparable numeric time (or null for "no next occurrence"), not a Date instance. How: This pairs curTasObj's own id with nexEliObj's own getTime(), or null when there's no next occurrence at all.


	} ) );


	const sorTasArr = [ ...visTasArr ].sort( ( tasOneObj, tasTwoObj ) => sorEntFun( // What: Sorted Task Array. Why: This is the Items list's own actual render order. How: This sorts a copy of visTasArr via sorEntFun, fed each side's own name/type/date shape and iteSorStr.


		{ // What: Row One Object. Why: sorEntFun needs a comparable shape for the left-hand side of this comparison. How: This builds it from tasOneObj, with every field this shape doesn't use left null.


			count    : null,                                                         // What: Count. Why: A reminder has no meaningful count field. How: This is always null for a reminder row.
			date     : tasDatMap.get( tasOneObj.id ),                                // What: Date. Why: This is the field sorEntFun sorts by for the date-asc/date-desc options. How: This looks up tasOneObj's own precomputed next-eligible time from tasDatMap.
			group    : null,                                                         // What: Group. Why: A reminder has no meaningful group field. How: This is always null for a reminder row.
			isActive : null,                                                         // What: Is Active. Why: A reminder has no meaningful active-state field. How: This is always null for a reminder row.
			name     : tasOneObj.name,                                               // What: Name. Why: This is the field sorEntFun sorts by for the name-asc/name-desc options, and the tie-break for every other sort. How: This reads tasOneObj's own name.
			type     : TAS_NAM_OBJ.isaReuFun( tasOneObj ) ? 'Recurring' : 'One-time' // What: Type. Why: This is the field sorEntFun sorts by for the type-asc/type-desc options. How: This picks the word based on TAS_NAM_OBJ.isaReuFun.


		},

		{ // What: Row Two Object. Why: sorEntFun needs a comparable shape for the right-hand side of this comparison. How: This builds it from tasTwoObj, mirroring Row One Object's own shape.


			count    : null,                                                         // What: Count. Why: A reminder has no meaningful count field. How: This is always null for a reminder row.
			date     : tasDatMap.get( tasTwoObj.id ),                                // What: Date. Why: This is the field sorEntFun sorts by for the date-asc/date-desc options. How: This looks up tasTwoObj's own precomputed next-eligible time from tasDatMap.
			group    : null,                                                         // What: Group. Why: A reminder has no meaningful group field. How: This is always null for a reminder row.
			isActive : null,                                                         // What: Is Active. Why: A reminder has no meaningful active-state field. How: This is always null for a reminder row.
			name     : tasTwoObj.name,                                               // What: Name. Why: This is the field sorEntFun sorts by for the name-asc/name-desc options, and the tie-break for every other sort. How: This reads tasTwoObj's own name.
			type     : TAS_NAM_OBJ.isaReuFun( tasTwoObj ) ? 'Recurring' : 'One-time' // What: Type. Why: This is the field sorEntFun sorts by for the type-asc/type-desc options. How: This picks the word based on TAS_NAM_OBJ.isaReuFun.


		},

		iteSorStr


	) );


	const disTasArr = freEdiFun( sorTasArr, opeIdeStr, newAddRef.current, froIndRef ); // What: Display Task Array. Why: The open editor's own row must not visibly reorder out from under it as its own fields change. How: This calls freEdiFun against sorTasArr, opeIdeStr, and newAddRef's own current value.

	// #endregion Items List Order



	// #region Category State

	const colMaiMap = ( staAppObj.ui && staAppObj.ui.controlsCollapsed ) || {}; // What: Collapsed Main Map. Why: The main section's own collapse state persists (like the pickers), so it survives tab switches. How: This reads staAppObj's own ui.controlsCollapsed, falling back to an empty object.
	const secOpeBoo = colMaiMap[ '__reminders_main' ] === false;                // What: Section Open Boolean. Why: This reserved key defaults COLLAPSED, so absent means collapsed and an explicit false means expanded. How: This checks colMaiMap's own '__reminders_main' entry against exactly false.
	const togMaiFun = () => actStoObj.togColFun( '__reminders_main', true );    // What: Toggle Main Function. Why: The header's own clickable area needs a single call to flip the main section's own collapse staAppObj. How: This calls actStoObj.togColFun against the same reserved key.

	const colSubMap = ( staAppObj.ui && staAppObj.ui.controlsCollapsed ) || {}; // What: Collapsed Sub Map. Why: The Controls and Items sub-panels each remember their own collapse state independently of the main section and of each other. How: This reads the same staAppObj's own ui.controlsCollapsed, kept as a separate read for its own 2 sub-keys below.
	const conColBoo = !!colSubMap[ '__reminders' ];                             // What: Controls Collapsed Boolean. Why: The Controls disclosure defaults OPEN, so absent means open. How: This checks colSubMap's own '__reminders' entry.
	const iteColBoo = !!colSubMap[ '__reminders:items' ];                       // What: Items Collapsed Boolean. Why: The Items disclosure likewise defaults open. How: This checks colSubMap's own '__reminders:items' entry.

	const norOptObj = TAS_NAM_OBJ.norOptFun( staAppObj.reminderOpts ); // What: Normalized Options Object. Why: OptMatCom needs a fully-shaped { once, recurring } object even from an older or partial saved staAppObj. How: This calls TAS_NAM_OBJ.norOptFun against staAppObj's own reminderOpts.
	const tutProBoo = ONB_CHE_OBJ.tutProFun( staAppObj );              // What: Tutorial Progress Boolean. Why: "New reminder" is a second, independent path to a real reminder, reachable from this page, and must stay disabled during any onboarding tutorial the same way RemSecCom's own add button does. How: This calls ONB_CHE_OBJ.tutProFun against staAppObj.

	// #endregion Category State



	// #region Row Actions

	const kepCloFun = ( tasIdeStr ) => { // What: Keep Close Function. Why: The row's own collapse chevron AND EdiFooCom's own Save mean "keep this, I'm done", and both need the exact same cleanup so the chevron can't drift out of sync with what Save already does. How: This calls the open editor's own kepFun, clears the new-item flag, and closes only if this row is still the open one.


		opeEdiRef.current?.kepFun(); // What: Keep Call. Why: EdiFooCom's own committed-edit lifecycle (the "keep" side of the mount-time snapshot it takes) must run before this row is allowed to close. How: This optionally chains onto opeEdiRef's own current ref, since it may be unmounted already.

		if ( newAddRef.current === tasIdeStr ) newAddRef.current = null; // What: New-Item Flag Clear Guard. Why: Once kept, a brand-new reminder is no longer "new" for isaNewBoo's own purposes. How: This clears newAddRef only while it still matches tasIdeStr.



		setOpeIdeStr( ( curOpeStr ) => curOpeStr === tasIdeStr ? null : curOpeStr ); // What: Open Row Close Call. Why: This is the actual collapse, closing the row only while it's still this exact one that was open. How: This clears opeIdeStr only while it still matches tasIdeStr.


	};


	const addEdiFun = () => { // What: Add Edit Function. Why: "New reminder" needs to create a real, minimal reminder AND immediately open its own editor, ensuring both the main section and the Items disclosure are expanded to actually show it. How: This mints a fresh id, adds the task, stages every relevant "just added"/open/insert flag, and expands whichever section is currently collapsed.


		if ( newAddRef.current ) return; // What: Guard: Ignore Rapid Double-Click. Why: A second "New reminder" click while the first add hasn't been kept yet would spawn a stray extra reminder. How: This bails out while newAddRef already holds an id.



		const newIdeStr = 'tk_' + Math.random().toString( 36 ).slice( 2, 8 ); // What: New Identifier String. Why: The freshly-created reminder needs a real, unique id before actStoObj.addTasFun is ever called. How: This mints a random 'tk_'-prefixed id, the same scheme TAS_NAM_OBJ.defTasFun itself uses.


		actStoObj.addTasFun( { id : newIdeStr, name : 'New reminder', repeat : 'once' } ); // What: Add Task Call. Why: This is the actual creation of the new, minimal reminder. How: This calls actStoObj.addTasFun with newIdeStr, a placeholder name, and a plain 'once' repeat.

		newAddRef.current = newIdeStr; // What: New-Item Flag Set. Why: The freshly-created row needs to know it's "new" for its own isaNewBoo prop and for kepCloFun's own guard above. How: This sets newAddRef to newIdeStr.

		setInsIdeStr( newIdeStr ); // What: Insert Identifier Stage Call. Why: The new row needs to play its own entrance animation exactly once. How: This sets insIdeStr to newIdeStr.
		setOpeIdeStr( newIdeStr ); // What: Open Row Stage Call. Why: The new reminder's own editor should open immediately so the user can fill it in. How: This sets opeIdeStr to newIdeStr.

		if ( !secOpeBoo ) actStoObj.togColFun( '__reminders_main', true ); // What: Main Section Expand Guard. Why: The newly-open editor must actually be visible, which requires the main section itself to be expanded. How: This expands the main section only while it was collapsed.


	};

	// #endregion Row Actions



	return (


		<section className='cat cat--reminders cat--enter'>{ /* What: Category Section Element. Why: This is RemManCom's own root element, matching every other Data tab category's own outer landmark. How: This renders the header, then the ColDisCom-wrapped body below. */ }


			<header className='cat-h'>{ /* What: Category Header Element. Why: The whole header is one clickable disclosure toggling the main section. How: This wraps the single toggle button below. */ }


				<button
					className='cat-h-l'

					type='button'

					aria-expanded={ secOpeBoo }

					onClick={ togMaiFun }
				>{ /* What: Category Header Button Element. Why: This is the actual clickable disclosure control for the whole category. How: This toggles secOpeBoo via togMaiFun. */ }


					<span className={ ` chev   ${ secOpeBoo ? 'is-open' : '' } ` }>{ /* What: Chevron Span Element. Why: The chevron's own rotation communicates the disclosure's open/closed staAppObj. How: This marks itself is-open while secOpeBoo is true. */ }


						<IcoSvgCom
							icoNamStr='chvEle'
							sizValNum={ 14 }
						/>{ /* What: Icon Svg Component. Why: A chevron glyph gives the whole section's own disclosure a recognizable, rotating open/closed affordance. How: This renders the 'chvEle' icon at a small 14px size. */ }


					</span>

					<span className='cat-h-main'>{ /* What: Category Header Main Span Element. Why: The name and count read together as one unit, distinct from the chevron beside them. How: This wraps the heading and the count span below. */ }


						<h2 className='cat-name'>Reminders</h2>{ /* What: Category Name Heading Element. Why: This is the category's own fixed title. How: This renders the literal text "Reminders". */ }

						<span className='cat-count'>{ /* What: Category Count Span Element. Why: Reminders have no active/inactive concept yet (unlike pickers' eligible-of-total and Conditionals' active-of-total), so both numbers are the same for now, kept in this "N of N" shape for visual consistency and in case that changes later. How: This wraps 2 identical count spans and the literal word "of" between them. */ }


							<span className='cat-count-n'>{ visTasArr.length }</span>{ /* What: Category Count Number Span Element. Why: Reminders have no active/inactive split yet, so this same number stands in for both halves of the "N of N" shape. How: This renders visTasArr's own length. */ }

							<span className='cat-count-of'>of</span>{ /* What: Category Count Of Span Element. Why: This joins the two count numbers into one readable "N of N" phrase. How: This renders the literal text "of". */ }

							<span className='cat-count-n'>{ visTasArr.length }</span>{ /* What: Category Count Number Span Element. Why: See the leading count span's own comment above; this is its mirrored second half. How: This renders visTasArr's own length again. */ }


						</span>


					</span>


				</button>


			</header>



			<ColDisCom open={ secOpeBoo }>{ /* What: Collapse Disclosure Component. Why: The entire body below only exists while the category itself is expanded. How: This animates cat-body open/closed based on secOpeBoo. */ }


				<div className='cat-body'>{ /* What: Category Body Div Element. Why: The Controls and Items disclosures need to sit together as one scrollable body. How: This renders both disclosure toggles and their own ColDisCom-wrapped content below. */ }


					<button
						className='rd-ctl'

						type='button'

						aria-expanded={ !conColBoo }

						onClick={ () => actStoObj.togColFun( '__reminders' ) }
					>{ /* What: Controls Disclosure Button Element. Why: Controls is a nested collapsible, open by default, remembered per section. How: This toggles conColBoo via actStoObj.togColFun. */ }


						<span className='rd-ctl-l'>{ /* What: Controls Left Span Element. Why: The chevron and the "Controls" kicker read together as one unit. How: This wraps both below. */ }


							<span className={ ` chev   ${ conColBoo ? '' : 'is-open' } ` }>{ /* What: Chevron Span Element. Why: The chevron's own rotation communicates whether Controls is currently open (note the inverted sense: is-open while NOT collapsed). How: This marks itself is-open while conColBoo is false. */ }


								<IcoSvgCom
									icoNamStr='chvEle'
									sizValNum={ 12 }
								/>{ /* What: Icon Svg Component. Why: A chevron glyph gives the disclosure a recognizable, rotating open/closed affordance. How: This renders the 'chvEle' icon at a small 12px size. */ }


							</span>

							<span className='kicker'>Controls</span>{ /* What: Kicker Span Element. Why: This is the disclosure's own plain label. How: This renders the literal text "Controls". */ }


						</span>

						{ conColBoo && <span className='rd-ctl-sum'>{ REM_MAT_ARR.length } settings</span> }{ /* What: Controls Summary Span Element. Why: A collapsed disclosure still needs a hint of how much content it's hiding. How: This renders REM_MAT_ARR's own length only while conColBoo is true. */ }


					</button>



					<ColDisCom open={ !conColBoo }>{ /* What: Collapse Disclosure Component. Why: OptMatCom's own matrix only exists while the Controls disclosure is open. How: This animates OptMatCom open/closed based on conColBoo. */ }


						<OptMatCom
							actStoObj={ actStoObj }
							remOptObj={ norOptObj }

							onCloConFun={ () => actStoObj.togColFun( '__reminders' ) }
						/>{ /* What: Option Matrix Component. Why: This is the actual once/recurring participation matrix, editing the normalized reminderOpts shape. How: This closes back via onCloConFun, collapsing the Controls disclosure above. */ }


					</ColDisCom>



					<button
						className='rd-ctl'

						type='button'

						aria-expanded={ !iteColBoo }

						onClick={ () => actStoObj.togColFun( '__reminders:items' ) }
					>{ /* What: Items Disclosure Button Element. Why: Items is the same kind of nested collapsible as Controls, independently remembered. How: This toggles iteColBoo via actStoObj.togColFun. */ }


						<span className='rd-ctl-l'>{ /* What: Items Left Span Element. Why: The chevron and the "Items" kicker read together as one unit. How: This wraps both below. */ }


							<span className={ ` chev   ${ iteColBoo ? '' : 'is-open' } ` }>{ /* What: Chevron Span Element. Why: The chevron's own rotation communicates whether Items is currently open. How: This marks itself is-open while iteColBoo is false. */ }


								<IcoSvgCom
									icoNamStr='chvEle'
									sizValNum={ 12 }
								/>{ /* What: Icon Svg Component. Why: A chevron glyph gives the disclosure a recognizable, rotating open/closed affordance. How: This renders the 'chvEle' icon at a small 12px size. */ }


							</span>

							<span className='kicker'>Items</span>{ /* What: Kicker Span Element. Why: This is the disclosure's own plain label. How: This renders the literal text "Items". */ }


						</span>

						{ iteColBoo && <span className='rd-ctl-sum'>{ visTasArr.length } items</span> }{ /* What: Items Summary Span Element. Why: A collapsed disclosure still needs a hint of how many reminders it's hiding. How: This renders visTasArr's own length only while iteColBoo is true. */ }


					</button>



					<ColDisCom open={ !iteColBoo }>{ /* What: Collapse Disclosure Component. Why: The whole Items list (full-bleed rows: type icon + name + schedule, expanding into the exact Today editor) only exists while this disclosure is open. How: This animates the fragment below open/closed based on iteColBoo. */ }


						<React.Fragment>{ /* What: Items Fragment Element. Why: The add button and the list/empty-state below need to sit together with no extra dom wrapper of their own. How: This groups both below as one returned value. */ }


							{ tutProBoo ? ( // What: Tutorials In Progress Check. Why: This second add-reminder entry point must also stay disabled with an explanation while the guided checklist is running. How: This renders the disabled InfTipCom while tutProBoo is true, the real button otherwise.


								<InfTipCom
									className='rd-add is-tour-disabled'

									actNamStr='New reminder'
									labTexStr='This button is disabled until all tutorials are completed.'
								>{ /* What: Info Tip Component. Why: This is a second, independent path to a real reminder, so it must stay disabled during any onboarding tutorial the same way RemSecCom's own add button does. How: This wraps the plus icon and label text, standing in for the real button below. */ }


									<IcoSvgCom
										icoNamStr='pluEle'
										sizValNum={ 13 }
									/>{ /* What: Icon Svg Component. Why: This is the add control's own visible glyph, read together with the literal "New reminder" label right after it. How: This renders the 'pluEle' icon. */ } New reminder


								</InfTipCom>


							) : ( // What: Add Button Branch. Why: Outside the guided checklist, the real working Add button belongs here instead. How: This renders the else branch, taken while tutProBoo is false.


								<button
									className='rd-add'

									onClick={ addEdiFun }
								>{ /* What: Add Button Element. Why: This is the real, clickable "New reminder" entry point. How: This calls addEdiFun. */ }


									<IcoSvgCom
										icoNamStr='pluEle'
										sizValNum={ 13 }
									/>{ /* What: Icon Svg Component. Why: This is the add control's own visible glyph, read together with the literal "New reminder" label right after it. How: This renders the 'pluEle' icon. */ } New reminder


								</button>


							) }



							{ visTasArr.length === 0 ? ( // What: Empty List Check. Why: With no reminders at all, a plain empty-state message belongs here instead of a list. How: This renders the empty message while visTasArr is empty, the real list otherwise.


								<div className='rd-empty'>No reminders yet. Add one to see it on Today.</div> // What: Empty State Div Element. Why: With no reminders at all, the list area needs a plain explanation. How: This renders a fixed prompt to add one.


							) : ( // What: Reminder List Branch. Why: With at least one reminder, the real list of rows belongs here instead. How: This renders the else branch, taken while visTasArr has entries.


								<>{ /* What: Reminder List Fragment Element. Why: The sort control and the list rows render together as one branch. How: This groups them with no wrapper element. */ }


									{ visTasArr.length > 1 && ( // What: Sort Visibility Check. Why: Sorting only matters once there's more than 1 reminder to sort. How: This renders SorSelCom only while there are at least 2.


										<SorSelCom
											labTexStr='Sort'
											optLisArr={ ITE_SOR_ARR }
											selIdeStr='rem-item-sort'
											value={ iteSorStr }

											onChange={ ( sorKeyStr ) => actStoObj.setSorFun( 'reminders', sorKeyStr ) }
										/> // What: Sort Select Component. Why: The Items list needs the same sort control every other Data tab list uses. How: This is driven by ITE_SOR_ARR, committing through actStoObj.setSorFun.


									) }



									{ disTasArr.map( ( curTasObj ) => { // What: Task Row List Render. Why: One full-bleed row (plus its own expanding editor) is needed per visible reminder. How: This maps disTasArr to one row div per entry, keyed by its own id.


										const carOpeBoo = opeIdeStr === curTasObj.id;  // What: Card Open Boolean. Why: This single check decides both this row's own toggle-button-vs-name-input branch and whether its editor ColDisCom is open. How: This compares opeIdeStr against curTasObj's own id.
										const isaOncBoo = curTasObj.repeat === 'once'; // What: Is-A Once Boolean. Why: The row's own type icon depends on whether this is a one-time or recurring reminder. How: This checks curTasObj's own repeat.


										return (


											<div
												key={ curTasObj.id }
												ref={ carOpeBoo ? opeRowRef : undefined } // What: Open Row Ref. Why: Only the open row is scrolled into view. How: This attaches opeRowRef only while this row is open.

												className={ ` rd-item   ${ carOpeBoo ? 'is-editing' : '' }   ${ insIdeStr === curTasObj.id ? 'rd-item--insert' : '' } ` }

												onAnimationEnd={ () => { if ( insIdeStr === curTasObj.id ) setInsIdeStr( null ); } } // What: Insert Flag Clear. Why: The entrance animation must play only once. How: This clears insIdeStr when this row's own animation ends while it still matches.
											>{ /* What: Row Div Element. Why: This is one reminder's own full-bleed row, holding either its plain summary or its live name input, plus its own expanding editor below. How: This renders one of the 2 header branches below, then the shared editor ColDisCom. */ }


												{ carOpeBoo ? ( // What: Row Editing Check. Why: The row's own header swaps between a live-editable div and a plain clickable button depending on whether it's open. How: This renders the editing div while carOpeBoo is true, the plain toggle button otherwise.


													<div className='rd-row'>{ /* What: Row Editing Div Element. Why: While editing, this is a plain div rather than a button, since a button can't legally contain the input below it (interactive-in-interactive), which also cost it an accessible name of its own. How: This renders the type icon, the live name input, and a real, separate collapse-chevron button. */ }


														<span className={ ` rd-ico   ${ isaOncBoo ? 'is-once' : '' } ` }>{ /* What: Row Icon Span Element. Why: The type icon needs its own wrapper for styling. How: This wraps the single IcoSvgCom below. */ }


															<IcoSvgCom
																icoNamStr={ isaOncBoo ? 'pinEle' : 'calEle' } // What: Type Icon Pick. Why: A one-time reminder and a recurring one look different at a glance. How: This picks the pin while isaOncBoo and the calendar otherwise.
																sizValNum={ 15 }
															/>{ /* What: Icon Svg Component. Why: The row's own icon needs to distinguish a one-time reminder from a recurring one at a glance. How: This renders 'pin' while isaOncBoo, 'calendar' otherwise, at a small 15px size. */ }


														</span>

														<span className='rd-main'>{ /* What: Row Main Span Element. Why: The live name input needs its own wrapper matching the closed row's own layout. How: This wraps the single input below. */ }


															<input
																ref={ ( inpCurEle ) => { // What: Focus Ref Callback. Why: The input should focus once when it mounts, without the browser's own focus scroll fighting the smooth scroll above. How: This focuses a newly attached input with preventScroll and remembers it.


																	if ( inpCurEle && focInpRef.current !== inpCurEle ) { // What: New Input Guard. Why: Re-renders call this ref again, but focus should only happen once per input. How: This runs only for a real node not already focused.


																		inpCurEle.focus( { preventScroll : true } ); // What: Quiet Focus Call. Why: The row's own smooth scroll handles bringing it into view. How: This focuses without scrolling.

																		focInpRef.current = inpCurEle; // What: Focused Input Mark. Why: The guard above must skip this node next time. How: This stores it in focInpRef.


																	}


																} }

																className='rd-name-input'

																maxLength={ 60 }
																placeholder='Reminder name'
																type='text'
																value={ curTasObj.name }

																aria-label='Reminder name'

																onBlur={ ( bluEveObj ) => { // What: Name Blur Handler. Why: Leaving the input should commit the trimmed name, but never a blank one. How: This trims the value and commits it only when non-empty.


																	const namTriStr = bluEveObj.target.value.trim(); // What: Name Trimmed String. Why: Surrounding spaces are never part of a name. How: This trims the input's own value.


																	if ( namTriStr ) actStoObj.renTasFun( curTasObj.id, namTriStr ); // What: Non-Empty Name Guard. Why: A blank name must not replace the real one. How: This renames only when namTriStr has content.


																} }
																onChange={ ( chaEveObj ) => actStoObj.updTasFun( curTasObj.id, { name : chaEveObj.target.value } ) }
																onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Enter' ) keyEveObj.currentTarget.blur(); } } // What: Enter Blur Shortcut. Why: Pressing Enter should finish the name the same way leaving the field does. How: This blurs the input on Enter, which runs onBlur's own commit.
															/>{ /* What: Name Input Element. Why: This is the row's own live-editable name field while carOpeBoo. How: This commits every keystroke, re-trims and re-commits (only if non-empty) on blur, and blurs itself on Enter; its own ref callback suppresses the browser's native focus-scroll so it doesn't fight opeRowRef's own smooth scroll. */ }


														</span>

														<button
															className='rd-chev chev is-open'

															type='button'

															aria-label='Collapse'

															onClick={ () => kepCloFun( curTasObj.id ) }
														>{ /* What: Collapse Chevron Button Element. Why: This is the row's own real, separate close affordance (see the row-editing div's own comment above for why it can't be the button itself). How: This calls kepCloFun, which marks the editor kept before closing it. */ }


															<IcoSvgCom
																icoNamStr='chvEle'
																sizValNum={ 16 }
															/>{ /* What: Icon Svg Component. Why: A chevron glyph gives this row's own open editor a recognizable close affordance. How: This renders the 'chvEle' icon at a 16px size. */ }


														</button>


													</div>


												) : ( // What: Row Toggle Branch. Why: A closed row just needs its own plain clickable toggle button instead. How: This renders the else branch, taken while carOpeBoo is false.


													<button
														className='rd-row'

														type='button'

														aria-expanded={ carOpeBoo }

														onClick={ () => setOpeIdeStr( carOpeBoo ? null : curTasObj.id ) } // What: Row Toggle Click. Why: The same row button opens and closes its own editor. How: This clears opeIdeStr while open and sets it to this row otherwise.
													>{ /* What: Row Toggle Button Element. Why: The plain, non-editing state is itself the clickable control that opens the editor. How: This toggles opeIdeStr to curTasObj's own id (or back to null). */ }


														<span className={ ` rd-ico   ${ isaOncBoo ? 'is-once' : '' } ` }>{ /* What: Row Icon Span Element. Why: The type icon needs its own wrapper for styling. How: This wraps the single IcoSvgCom below. */ }


															<IcoSvgCom
																icoNamStr={ isaOncBoo ? 'pinEle' : 'calEle' } // What: Type Icon Pick. Why: A one-time reminder and a recurring one look different at a glance. How: This picks the pin while isaOncBoo and the calendar otherwise.
																sizValNum={ 15 }
															/>{ /* What: Icon Svg Component. Why: The row's own icon needs to distinguish a one-time reminder from a recurring one at a glance. How: This renders 'pin' while isaOncBoo, 'calendar' otherwise, at a small 15px size. */ }


														</span>

														<span className='rd-main'>{ /* What: Row Main Span Element. Why: The name and schedule summary read together as one unit, matching the editing state's own layout. How: This wraps both spans below. */ }


															<span className='rd-name'>{ curTasObj.name }</span>{ /* What: Row Name Span Element. Why: This is the row's own primary text. How: This renders curTasObj's own name. */ }

															<span className='rd-sched'>{ TAS_NAM_OBJ.sumTasFun( curTasObj ) }</span>{ /* What: Row Schedule Span Element. Why: This is the row's own secondary, schedule-summary text. How: This calls TAS_NAM_OBJ.sumTasFun against curTasObj. */ }


														</span>

														<span
															className='rd-chev chev'

															aria-hidden='true'
														>{ /* What: Row Chevron Span Element. Why: The plain state's own chevron is purely decorative (the whole row is already the real toggle), so it's a span rather than a separate button. How: This wraps the single IcoSvgCom below, hidden from screen readers. */ }


															<IcoSvgCom
																icoNamStr='chvEle'
																sizValNum={ 16 }
															/>{ /* What: Icon Svg Component. Why: A chevron glyph gives this closed row's own real toggle a recognizable open affordance. How: This renders the 'chvEle' icon at a 16px size. */ }


														</span>


													</button>


												) }



												<ColDisCom open={ carOpeBoo }>{ /* What: Collapse Disclosure Component. Why: The schedule editor and its own footer only exist while this exact row is open. How: This animates the editor div below open/closed based on carOpeBoo. */ }


													<div className='rd-edit'>{ /* What: Edit Div Element. Why: The editor needs its own padding/framing distinct from the plain row above it. How: This wraps the shared rem-inline-editor div below. */ }


														<div className='rem-inline-editor'>{ /* What: Inline Editor Div Element. Why: The schedule editor and its own footer need to sit together, matching InlEdiCom's own root layout. How: This renders SchEdiCom against curTasObj directly (the real store, not a local draft), then EdiFooCom below it. */ }


															<SchEdiCom
																actStoObj={ actStoObj }
																aniExtBoo
																staAppObj={ staAppObj }
																tasRcdObj={ curTasObj }
															/>{ /* What: Schedule Editor Component. Why: Unlike Today's own InlEdiCom, the Data tab commits every field change straight to the real store; there's no local draft to revert on Cancel here except via EdiFooCom's own snapshot. How: This is passed the real actStoObj bag directly as actStoObj. */ }



															<EdiFooCom
																ref={ carOpeBoo ? opeEdiRef : undefined } // What: Open Footer Ref. Why: The row's own chevron needs the open footer's kepFun handle. How: This attaches opeEdiRef only while this row is open.

																isaNewBoo={ newAddRef.current === curTasObj.id }
																tasRcdObj={ curTasObj }

																onCanTasFun={ ( snaTasObj ) => { // What: Cancel Handler. Why: Cancel behaves differently depending on whether this row is a brand-new, not-yet-kept reminder (discard outright) or an already-existing one (revert to its own mount-time snapshot). How: This branches on newAddRef, staging the same collapse-then-remove sequence Delete uses for the new-and-discarded case.


																	if ( newAddRef.current === curTasObj.id ) { // What: New-And-Discarded Branch. Why: A brand-new reminder should be discarded outright on Cancel, but still play the collapse-close animation Save uses, rather than vanish instantly. How: This clears newAddRef, snapshots the id, closes this row, then defers the actual delTasFun call.


																		newAddRef.current = null; // What: New-Item Flag Clear. Why: Cancelling a brand-new reminder discards it outright, so nothing "new" is left pointing at a soon-to-be-removed id. How: This resets newAddRef back to null unconditionally, since this whole branch only runs when it already matched curTasObj's own id.


																		const tasIdeStr = curTasObj.id; // What: Task Identifier String. Why: The deferred delTasFun call below must not close over curTasObj itself, in case it's captured after a later re-render. How: This snapshots curTasObj's own id right now.


																		setOpeIdeStr( ( curOpeStr ) => curOpeStr === curTasObj.id ? null : curOpeStr ); // What: Open Row Close Call. Why: The row must collapse right away rather than wait for the deferred remove below. How: This clears opeIdeStr only while it still matches curTasObj's own id.

																		setTimeout( () => actStoObj.delTasFun( tasIdeStr ), 280 ); // What: Deferred Remove Call. Why: This gives the row's own collapse-close animation time to finish before the underlying task actually disappears. How: This waits 280ms, then removes tasIdeStr's own snapshot.


																	}

																	else { // What: Existing-Reverted Branch. Why: An already-existing reminder should just revert to the snapshot EdiFooCom captured on mount, not be removed at all. How: This calls actStoObj.revTasFun with snaTasObj, then closes this row.


																		actStoObj.revTasFun( curTasObj.id, snaTasObj );                                 // What: Replace Task Call. Why: An existing reminder's own Cancel reverts it to the snapshot EdiFooCom captured on mount, discarding any in-progress edits. How: This calls actStoObj.revTasFun with curTasObj's own id and snaTasObj.
																		setOpeIdeStr( ( curOpeStr ) => curOpeStr === curTasObj.id ? null : curOpeStr ); // What: Open Row Close Call. Why: The row must collapse once the revert is complete. How: This clears opeIdeStr only while it still matches curTasObj's own id.


																	}


																} }
																onDelTasFun={ () => { // What: Delete Handler. Why: Deleting this row needs to clear a stale "new" flag, close the row, and stage the same collapse-then-remove sequence the card-level Delete uses. How: This snapshots the id, closes opeIdeStr, then either removes immediately (reduced motion) or defers it behind the collapse-out animation.


																	if ( newAddRef.current === curTasObj.id ) newAddRef.current = null; // What: New-Item Flag Clear Guard. Why: Deleting a brand-new reminder must not leave a stale "new" flag pointing at an id that no longer exists. How: This clears newAddRef only while it still matches curTasObj's own id.



																	const tasIdeStr = curTasObj.id; // What: Task Identifier String. Why: The deferred delTasFun call below must not close over curTasObj itself, in case it's captured after a later re-render. How: This snapshots curTasObj's own id right now.


																	setOpeIdeStr( ( curOpeStr ) => curOpeStr === curTasObj.id ? null : curOpeStr ); // What: Open Row Close Call. Why: The row must collapse right away rather than wait for the deferred remove below. How: This clears opeIdeStr only while it still matches curTasObj's own id.



																	if ( redMotFun() ) { actStoObj.delTasFun( tasIdeStr ); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion should get an instant remove instead of an animated collapse-then-remove. How: This calls actStoObj.delTasFun directly and returns early.



																	setTimeout( () => actStoObj.delTasFun( tasIdeStr ), 280 ); // What: Deferred Remove Call. Why: This can fire well after the user has already switched to a different reminder's editor, so it must only ever remove tasIdeStr's own snapshot, never whatever row happens to be open by then. How: This waits 280ms (matching the editor's own collapse-close animation) before actually removing the task.


																} }
																onDonTasFun={ () => kepCloFun( curTasObj.id ) }
															/>{ /* What: Editor Foot Component. Why: This is the shared Cancel/Save/Delete footer, same component InlEdiCom uses on Today. How: Delete and Cancel both defer their own delTasFun call by 280ms to let the collapse-close animation finish first (unless reduced motion); Save calls kepCloFun. */ }


														</div>


													</div>


												</ColDisCom>


											</div>


										);


									} ) }


								</>


							) }


						</React.Fragment>


					</ColDisCom>


				</div>


			</ColDisCom>


		</section>


	);


}

// #endregion RemManCom



// #region RemSecCom

/**
 * RemSecCom = Reminder Section Component
 *
 * @summary
 * Today's Reminders section: the list of due reminders with their inline
 * editors and skip confirms, the mini-tour launcher cards for still-hidden
 * sample reminders, and the quick-add form, under a header matching every
 * other Today group. Rendered by tab-today.jsx.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actEdiStr    - Active Editor String: The tab-wide "which editor
 *                             is open" slot, shared with the picker item
 *                             editor.
 * @param props.actStoObj    - Action Store Object: The shared app actions that
 *                             mutate props.staAppObj.
 * @param props.arvTasSet    - Arriving Task Set: Ids currently playing a
 *                             cross-day arrival animation.
 * @param props.cheExiBoo    - Checklist Exiting Boolean: Whether the
 *                             onboarding checklist itself is mid-exit
 *                             animation.
 * @param props.ediModBoo    - Edit Mode Boolean: Whether Today's own Edit Mode
 *                             is on.
 * @param props.leaTasSet    - Leaving Task Set: Ids currently playing a cross-
 *                             day purge exit animation.
 * @param props.logOpeBoo    - Log Open Boolean: Whether the Reminders day-log
 *                             panel is currently open.
 * @param props.onGriDowFun  - On Grip Down Function: Starts dragging this
 *                             whole section to reorder it among other groups.
 * @param props.onPlaTutFun  - On Play Tutorial Function: Starts a sample
 *                             reminder's own mini-tour.
 * @param props.onTogLogFun  - On Toggle Log Function: Toggles the day-log
 *                             panel above.
 * @param props.onUncTutFun  - On Uncheck Tutorial Function: Un-resolves a
 *                             sample reminder's own mini-tour.
 * @param props.secRefFun    - Section Reference Function: A ref callback
 *                             registering this section's own DOM node by group
 *                             key.
 * @param props.setActEdiStr - Setter Active Editor String: Updates
 *                             props.actEdiStr.
 * @param props.staAppObj    - State App Object: The entire app's own persisted
 *                             state.
 *
 * @returns The full Reminders section: its header, optional day-log
 * panel, and its list of tutorial cards, quick-add form, and real
 * reminder cards.
 *
 * @example
 * ```tsx
 * RemSecCom({ actEdiStr, actStoObj, arvTasSet, ... }) // => <RemSecCom />
 * ```
 *
*/

function RemSecCom ( { actEdiStr, actStoObj, arvTasSet, cheExiBoo, ediModBoo, leaTasSet, logOpeBoo, onGriDowFun, onPlaTutFun, onTogLogFun, onUncTutFun, secRefFun, setActEdiStr, staAppObj } ) {


	// #region Due And Tutorial Lists

	const ancDatObj = TAS_NAM_OBJ.ancDatFun( staAppObj.today && staAppObj.today.generatedAt );                         // What: Anchor Date Object. Why: A reminder due on a new day shouldn't appear until the generator actually runs on/after that day, exactly like picker entries. How: This calls TAS_NAM_OBJ.ancDatFun against staAppObj's own last generation timestamp.
	const dueTasArr = TAS_NAM_OBJ.visTodFun( staAppObj.tasks, staAppObj.reminderOpts, staAppObj.holidays, ancDatObj ); // What: Due Task Array. Why: This is the real, non-sample reminder list this section actually renders. How: This calls TAS_NAM_OBJ.visTodFun against staAppObj's own tasks/reminderOpts/holidays, anchored to ancDatObj.


	const cheDonBoo = !!( staAppObj.onboarding && staAppObj.onboarding.checklistDone ); // What: Checklist Done Boolean. Why: Mini-tour launcher cards behave differently before vs. after the ORIGINAL first-time checklist concludes (see tutTasArr below). How: This reads staAppObj's own onboarding.checklistDone.

	const actTouStr = staAppObj.onboarding && staAppObj.onboarding.activeTour && staAppObj.onboarding.activeTour.id; // What: Active Tour String. Why: This decides whether a reminder mini-tour specifically (not just any tour) is currently running. How: This reads staAppObj's own onboarding.activeTour.id, or a falsy value when no tour is active.
	const remTouBoo = typeof actTouStr === 'string' && actTouStr.startsWith( 'reminder-' );                          // What: Reminder Tour Boolean. Why: The add button below must stay clickable during a reminder mini-tour's own Step 1, which needs the user to click it themselves rather than a simulated click. How: This checks actTouStr's own prefix.
	const tutProBoo = ONB_CHE_OBJ.tutProFun( staAppObj ) && !remTouBoo;                                              // What: Tutorial Progress Boolean. Why: Every OTHER tutorial still disables the add button as normal; only a reminder tour itself is exempted. How: This combines ONB_CHE_OBJ's own check with the negation of remTouBoo.


	const tutTasArr = ( staAppObj.tasks || [] ).filter( ( curTasObj ) => { // What: Tutorial Task Array. Why: One mini-tour launcher card is needed per still-hidden, still-relevant sample reminder. How: This keeps a hidden sample task unless it's already resolved post-checklistDone, or a same-named real reminder has since been created post-checklistDone.


		const hidSamBoo = curTasObj.hidden && ONB_STI_ARR.includes( curTasObj.id );                                                                                   // What: Hidden Sample Boolean. Why: Only a still-hidden sample reminder can have a launcher card at all. How: This checks the task's own hidden flag and the sample id list.
		const resDonBoo = cheDonBoo && ONB_CHE_OBJ.entLooFun( staAppObj, curTasObj.id );                                                                              // What: Resolved Done Boolean. Why: Once the checklist concludes, a sample whose tutorial entry is already resolved no longer needs its card. How: This looks up the sample's own checklist entry, only once cheDonBoo is true.
		const reaTwiBoo = cheDonBoo && ( staAppObj.tasks || [] ).some( ( othTasObj ) => !ONB_STI_ARR.includes( othTasObj.id ) && othTasObj.name === curTasObj.name ); // What: Real Twin Boolean. Why: Once the checklist concludes, a real reminder with the same name means the user already made their own. How: This searches the non-sample tasks for a matching name, only once cheDonBoo is true.

		const keeCarBoo = hidSamBoo && !resDonBoo && !reaTwiBoo; // What: Keep Card Boolean. Why: A launcher card stays only for a hidden sample that is neither resolved nor already copied. How: This combines the three checks above.



		return keeCarBoo; // What: Keep Card Return. Why: The filter needs the final keep decision. How: This returns keeCarBoo.


	} );

	// #endregion Due And Tutorial Lists



	// #region Editor Slots

	const addOpeBoo = actEdiStr === 'reminder-add'; // What: Add Open Boolean. Why: This decides whether the quick-add form's own actEdiStr slot is currently claimed. How: This compares actEdiStr against the literal 'reminder-add' sentinel.


	const opeTasStr = ( typeof actEdiStr === 'string' && actEdiStr.startsWith( 'reminder:' ) ) // What: Open Task String. Why: This is the id of whichever SAVED reminder's own inline editor is currently open, distinct from the quick-add form. How: This strips the 'reminder:' prefix off actEdiStr when it has one, otherwise null.
		? actEdiStr.slice( 'reminder:'.length ) // What: Prefixed Id Branch. Why: A saved reminder's editor slot is 'reminder:' plus its id. How: This strips the prefix to leave the id.
		: null;                                 // What: No Open Task Branch. Why: Any other slot value means no saved reminder's editor is open. How: This is null.

	// #endregion Editor Slots



	// #region Card Transitions

	const [ insIdeStr, setInsIdeStr ] = React.useState( null ); // What: Insert Identifier String And Setter. Why: A newly-added card needs to play its own entrance animation exactly once. How: This is set to the new card's own id right when commit finishes, then cleared on that card's own animation end.
	const [ remIdeStr, setRemIdeStr ] = React.useState( null ); // What: Removing Identifier String And Setter. Why: A card slated for delete/skip needs to play its own collapse-out animation before the underlying task is actually removed. How: This is set right before that animation starts, then cleared once it ends.
	const [ skiIdeStr, setSkiIdeStr ] = React.useState( null ); // What: Skip Identifier String And Setter. Why: A card's own skip confirm is its own independent open/closed slot, separate from actEdiStr. How: This holds whichever task's own skip confirm is currently open.
	const [ jusCheStr, setJusCheStr ] = React.useState( null ); // What: Just-Checked String And Setter. Why: A reminder that was JUST checked needs a brief "fresh" flourish, distinct from one that was already done. How: This is set on every fresh check and cleared 700ms later.

	const remActRef = React.useRef( null ); // What: Remove Action Reference. Why: Delete and Skip share the same collapse-out animation, but each needs its own action to run once it finishes. How: This holds whichever thunk should run on the removing card's own animation end.


	const onTogDonFun = ( curTasObj ) => { // What: On Toggle Done Function. Why: Toggling a reminder's own done state also needs to trigger its brief "fresh" flourish, but only on a genuine 0-to-1 transition. How: This calls actStoObj.togTasFun, then stages jusCheStr only when curTasObj wasn't already done.


		const wasDonBoo = TAS_NAM_OBJ.isaDonFun( curTasObj, ancDatObj ); // What: Was Done Boolean. Why: The fresh flourish must never replay for a reminder that was already checked before this toggle. How: This reads curTasObj's own done state before the toggle below applies.


		actStoObj.togTasFun( curTasObj.id ); // What: Toggle Done Call. Why: This is the actual state change every branch below reacts to. How: This calls actStoObj.togTasFun against curTasObj's own id.

		if ( !wasDonBoo ) { // What: Fresh Flourish Guard. Why: Only a genuine 0-to-1 transition should play the flourish. How: This stages and later clears jusCheStr only while wasDonBoo was false.


			setJusCheStr( curTasObj.id ); // What: Just-Checked Stage Call. Why: The card needs to know it was JUST checked so it can play its own fresh flourish. How: This sets jusCheStr to curTasObj's own id.

			setTimeout( () => setJusCheStr( ( preIdeStr ) => preIdeStr === curTasObj.id ? null : preIdeStr ), 700 ); // What: Fresh Flourish Clear Call. Why: The flourish must not replay on every future re-render, only the one right after this toggle. How: This clears jusCheStr back to null after 700ms, but only if it still matches curTasObj's own id.


		}


	};

	// #endregion Card Transitions



	// #region Add Announcement

	const [ addMesObj, setAddMesObj ] = React.useState( null ); // What: Added Message Object And Setter. Why: After a successful add, silence is indistinguishable from a failed save whenever the new reminder won't actually appear today, so this needs an explicit announcement. How: This is populated by annAddFun below and auto-cleared by the effect right after it.

	const addTimRef = React.useRef( null ); // What: Added Timeout Reference. Why: The scheduled clearing of addMesObj needs to be cancellable if a second add happens before the first message times out. How: This holds whichever setTimeout id is currently pending.


	React.useEffect( () => () => clearTimeout( addTimRef.current ), [] ); // What: Added Timer Cleanup Effect. Why: A pending message-clear timeout must not outlive this component. How: This clears addTimRef's own timeout id on unmount.


	const annAddFun = ( curTasObj ) => { // What: Announce Added Function. Why: This decides and stages the actual wording of the post-add announcement. How: This computes curTasObj's own real visibility, then picks a success or a "won't show today" message accordingly.


		const visResObj = TAS_NAM_OBJ.todVisFun( curTasObj, staAppObj.reminderOpts, staAppObj.holidays ); // What: Visibility Result Object. Why: The message below depends entirely on whether the new reminder is actually visible today. How: This calls TAS_NAM_OBJ.todVisFun against curTasObj.
		const nexLabStr = nexDatFun( visResObj.next, curTasObj.repeat === 'annual' );                     // What: Next Label String. Why: A hidden-today message should still say when the reminder WILL next appear, when known. How: This calls nexDatFun against visResObj's own next date.


		const newMesObj = visResObj.visible // What: New Message Object. Why: The announcement differs for an add that shows today versus one that doesn't. How: This picks the success or hidden-today message object based on visResObj's own visible flag.
			? { okaBoo : true, texStr : `"${ curTasObj.name }" added.` } // What: Success Message Object. Why: A visible-today add just needs a short confirmation. How: This names curTasObj's own name in the confirmation text.
			: { okaBoo : false, texStr : `"${ curTasObj.name }" added, but it will not show up in today's todo list.${ nexLabStr ? ` It will next appear on ${ nexLabStr }.` : '' }` }; // What: Hidden Message Object. Why: A not-visible-today add needs the fuller explanation, plus the next-appearance date when known. How: This names curTasObj's own name and appends nexLabStr's own sentence when it resolved to something.


		setAddMesObj( newMesObj ); // What: Add Message Stage Call. Why: This is the actual announcement staged for the effect below to auto-clear. How: This stores newMesObj for the message paragraph to render.


		clearTimeout( addTimRef.current );                                                             // What: Stale Timer Clear. Why: A previous message's own scheduled clear must not fire early and wipe this fresh one. How: This clears whatever timeout id addTimRef currently holds.
		addTimRef.current = setTimeout( () => setAddMesObj( null ), visResObj.visible ? 3000 : 9000 ); // What: Message Auto-Clear Call. Why: A hidden-today message is more important and gets more time on screen before it fades. How: This schedules addMesObj back to null after 3s (visible) or 9s (hidden).


	};

	// #endregion Add Announcement



	// #region Quick-Add Form

	const [ visForBoo, setVisForBoo ] = React.useState( addOpeBoo ); // What: Visible Form Boolean And Setter. Why: The quick-add form must stay mounted for its own exit animation even after actEdiStr has already moved on to a different editor. How: This starts at addOpeBoo and is later driven by the effect below.
	const [ draTasObj, setDraTasObj ] = React.useState( null );      // What: Draft Task Object And Setter. Why: The quick-add form holds a full draft task so the same SchEdiCom used on an existing reminder can configure recurrence before it's ever created. How: This starts null and is populated by staAddFun below.
	const [ addCloBoo, setAddCloBoo ] = React.useState( false );     // What: Add Closing Boolean And Setter. Why: The quick-add form's own exit animation needs a flag distinct from visForBoo, so the form stays mounted but visually collapsing during the close. How: This is toggled by cancelAdd/commit below.

	const wasAddRef  = React.useRef( addOpeBoo ); // What: Was Adding Reference. Why: The effect below needs to detect an addOpeBoo transition, not just its current value. How: This is read and overwritten at the end of that same effect.
	const selCloRef  = React.useRef( false );     // What: Self Closing Reference. Why: Our own cancel/commit already starts the exit animation itself; the effect below must not ALSO re-trigger it as if some other editor forced this one closed. How: This is set just before that self-initiated close begins.
	const cloTimRef  = React.useRef( null );      // What: Close Timeout Reference. Why: The scheduled end of an in-progress close animation needs to be cancellable if a fresh open/close interrupts it. How: This holds whichever setTimeout id is currently pending.
	const inpEleRef = React.useRef( null );       // What: Input Element Reference. Why: The quick-add form's own name input needs to be focusable programmatically. How: This is attached to that input's own ref prop below.
	const comTasRef = React.useRef( false );      // What: Commit Task Reference. Why: A rapid double-click on Add must not commit the same draft twice. How: This is checked and set at the very top of comAddFun below, then cleared 500ms after it finishes.


	React.useEffect( () => { if ( addOpeBoo && inpEleRef.current ) inpEleRef.current.focus(); }, [ addOpeBoo ] ); // What: Focus Effect. Why: Opening the quick-add form should focus its own name input immediately. How: This focuses inpEleRef's own current node whenever addOpeBoo becomes true.


	React.useEffect( () => { // What: Forced Close Effect. Why: Another editor opening elsewhere should force this quick-add form closed, playing the same exit animation Cancel itself uses rather than snapping shut. How: This detects a addOpeBoo transition to false that WASN'T our own doing, then stages the same close sequence cancelAdd uses.


		if ( addOpeBoo ) { setVisForBoo( true ); } // What: Opening Branch. Why: A genuine open transition just needs the form to become visible again. How: This sets visForBoo true while addOpeBoo is true.

		else if ( wasAddRef.current && !selCloRef.current ) { // What: Forced Close Branch. Why: A transition to closed that wasn't flagged as self-initiated means some other editor forced this one shut. How: This stages the same close sequence cancelAdd uses, respecting reduced motion.


			clearTimeout( cloTimRef.current ); // What: Stale Timer Clear. Why: A close already scheduled a moment ago must not also fire after this fresh forced-close begins. How: This clears whatever timeout id cloTimRef currently holds.


			if ( redMotFun() ) { // What: Reduced Motion Branch. Why: A user who prefers reduced motion should get an instant discard instead of an animated close. How: This clears the draft and hides the form immediately.


				setDraTasObj( null );  // What: Draft Clear Call. Why: A forced close discards the in-progress draft. How: This resets draTasObj to null.
				setVisForBoo( false ); // What: Form Hide Call. Why: With motion reduced the form hides at once. How: This flips visForBoo false.


			}

			else { // What: Animated Branch. Why: Otherwise the animated close should play, matching cancelAdd's own sequence. How: This stages addCloBoo, then clears the draft/form after the CSS transition finishes.


				setAddCloBoo( true ); // What: Add Closing Flag Set. Why: The form needs to stay mounted but visually collapsing while the transition plays. How: This flips addCloBoo true.

				cloTimRef.current = setTimeout( () => { // What: Deferred Discard Call. Why: The actual unmount must wait for the .18s close animation to finish first. How: This schedules the draft clear, then stores the timeout id for possible cancellation.


					setDraTasObj( null );  // What: Draft Clear Call. Why: The closed form's draft is spent. How: This resets draTasObj to null.
					setAddCloBoo( false ); // What: Add Closing Flag Reset. Why: The next open must not start mid-close. How: This clears addCloBoo.
					setVisForBoo( false ); // What: Form Hide Call. Why: The close animation has finished, so the form can unmount. How: This flips visForBoo false.


				}, 180 );


			}


		}



		selCloRef.current = false;     // What: Self-Close Flag Reset. Why: This effect's own guard only needs to suppress ITS reaction to the very next addOpeBoo transition our own code caused. How: This clears selCloRef back to false every run.
		wasAddRef.current = addOpeBoo; // What: Was-Adding Snapshot Update. Why: The next run of this effect needs to compare against whatever addOpeBoo is right now. How: This overwrites wasAddRef with addOpeBoo's own current value.


	}, [ addOpeBoo ] ); // What: Effect Dependency Array. Why: This effect only needs to re-run when addOpeBoo itself changes, since that's the exact transition it's watching for. How: addOpeBoo is compared against wasAddRef's own remembered prior value.


	const draActObj = { updTasFun : ( tasIdeStr, patValObj ) => setDraTasObj( ( curDraObj ) => ( { ...curDraObj, ...patValObj } ) ) }; // What: Draft Actions Object. Why: SchEdiCom expects an actStoObj bag exposing updTasFun; this stands in for the real one, patching draTasObj locally instead of the store. How: This ignores its own first argument (already known here) and merges patValObj into draTasObj.


	React.useEffect( () => { // What: Draft Repeat Publish Effect. Why: A reminder mini-tour's later steps need to show copy matching whichever schedule type is currently selected in this draft, without lifting this local state anywhere else. How: This republishes draTasObj's own repeat field onto the shared tour bus.


		emlTouObj.set( { draRepStr : draTasObj ? draTasObj.repeat : null } ); // What: Draft Repeat Publish Call. Why: A running mini-tour reads this field to decide which copy variant to show next. How: This writes draTasObj's own repeat (or null while no draft exists) onto the shared tour bus.


	}, [ draTasObj && draTasObj.repeat ] ); // What: Effect Dependency Array. Why: Only the draft's own repeat field is published, so only a change to that specific field needs to re-run this effect. How: draTasObj && draTasObj.repeat is the exact value being published.



	const staAddFun = () => { // What: Start Add Function. Why: Opening the quick-add form needs to build a fresh draft task, optionally pre-filled from a running mini-tour's own sample. How: This resolves the tour bus's own prefill (if any), builds a defaulted draft via TAS_NAM_OBJ.defTasFun, and claims the actEdiStr slot.


		clearTimeout( cloTimRef.current ); // What: Stale Timer Clear. Why: A pending forced-close discard from a moment ago shouldn't wipe this fresh draft once it lands. How: This clears whatever timeout id cloTimRef currently holds.

		const touBusObj = emlTouObj.get(); // What: Tour Bus Object. Why: A reminder mini-tour publishes the sample it's walking through here so the real "+" button (which the tour has the user click themselves) opens pre-filled with that sample's data instead of blank. How: This reads the shared tour bus's own current snapshot.


		setDraTasObj( TAS_NAM_OBJ.defTasFun( { ...( touBusObj.preFilObj || { repeat : 'once' } ), ...( touBusObj.shoCheBoo ? { hidden : true } : {} ) } ) ); // What: Draft Task Seed. Why: Any reminder created while the mini-tour checklist is up should stay hidden from the real list until it concludes, not just a tour's own reminders. How: This spreads touBusObj's own prefill (or a plain 'once' default) plus a hidden flag whenever touBusObj's own showChecklist is set.

		setAddCloBoo( false );          // What: Add Closing Flag Reset. Why: A freshly-opened form must not start out mid-close, in case a previous close was still in flight. How: This clears addCloBoo back to false.
		setActEdiStr( 'reminder-add' ); // What: Active Editor Claim. Why: The quick-add form needs to claim the shared actEdiStr slot so every other open editor forces itself closed. How: This sets actEdiStr to the 'reminder-add' sentinel.


	};



	const cloAddFun = () => setActEdiStr( ( curEdiStr ) => curEdiStr === 'reminder-add' ? null : curEdiStr ); // What: Close Add Function. Why: The shared actEdiStr slot may have already moved on to a different editor by the time a scheduled close finishes; only clear it if it's still ours. How: This clears actEdiStr only while it still equals the 'reminder-add' sentinel.


	const canAddFun = () => { // What: Cancel Add Function. Why: Cancel (and Escape) both discard the in-progress draft, playing the same collapse animation the forced-close effect above uses. How: This flags selCloRef first, then either discards instantly (reduced motion) or stages the animated close.


		selCloRef.current = true; // What: Self-Close Flag Set. Why: The forced-close effect above must not also react to the addOpeBoo transition this cancel is about to cause. How: This flags selCloRef before anything else below runs.



		if ( redMotFun() ) { // What: Reduced Motion Guard. Why: A user who prefers reduced motion should get an instant discard instead of an animated close. How: This clears the draft, closes the editor slot, and returns early.


			setDraTasObj( null );  // What: Draft Clear Call. Why: Cancel discards the in-progress draft. How: This resets draTasObj to null.
			setVisForBoo( false ); // What: Form Hide Call. Why: With motion reduced the form hides at once. How: This flips visForBoo false.
			cloAddFun();           // What: Close Add Call. Why: The shared editor slot must be released. How: This clears actEdiStr while it is still this form's own sentinel.
			setAddCloBoo( false ); // What: Add Closing Flag Reset. Why: The next open must not start mid-close. How: This clears addCloBoo.



			return; // What: Instant Discard Return. Why: The animated close below must not also run. How: This returns early.


		}



		setAddCloBoo( true ); // What: Add Closing Flag Set. Why: The form needs to stay mounted but visually collapsing while the transition plays. How: This flips addCloBoo true.

		cloTimRef.current = setTimeout( () => { // What: Deferred Discard Call. Why: The actual unmount must wait for the .18s close animation to finish first. How: This schedules the draft clear/editor close, then stores the timeout id for possible cancellation.


			setDraTasObj( null );  // What: Draft Clear Call. Why: The cancelled draft is discarded. How: This resets draTasObj to null.
			setVisForBoo( false ); // What: Form Hide Call. Why: The close animation has finished, so the form can unmount. How: This flips visForBoo false.
			cloAddFun();           // What: Close Add Call. Why: The shared editor slot must be released. How: This clears actEdiStr while it is still this form's own sentinel.
			setAddCloBoo( false ); // What: Add Closing Flag Reset. Why: The next open must not start mid-close. How: This clears addCloBoo.


		}, 180 );


	};


	const comAddFun = () => { // What: Commit Add Function. Why: This is the quick-add form's own Save action, creating the real reminder (or updating an existing one, for a re-run mini-tour) from draTasObj. How: This validates the name, resolves a possible existing sample-linked task, then stages the same collapse-then-reveal animation commit already used elsewhere.


		const tasNamStr = ( draTasObj?.name || '' ).trim(); // What: Task Name String. Why: An empty name is not a valid reminder and must not be committed. How: This trims draTasObj's own name, defaulting to an empty string when draTasObj itself is null.


		if ( !tasNamStr || comTasRef.current ) return; // What: Guard: Ignore Rapid Double-Click. Why: Either the name is blank, or a commit is already in flight. How: This bails out of the whole commit when either condition holds.



		comTasRef.current = true; // What: Commit In-Flight Flag Set. Why: This is the actual guard the top-of-function check above reads to reject a rapid second click. How: This flips comTasRef true for the duration of this commit.
		selCloRef.current = true; // What: Self-Close Flag Set. Why: The forced-close effect above must not also react to the addOpeBoo transition this commit is about to cause. How: This flags selCloRef before the animated close below begins.


		const exiTasObj = draTasObj.createdFromSample // What: Existing Task Object. Why: A reminder mini-tour replayed after already finishing once should update the SAME real reminder it created before, not spawn a duplicate. How: This looks up staAppObj's own tasks by matching createdFromSample, or null when this draft isn't tour-linked at all.
			? staAppObj.tasks.find( ( curTasObj ) => curTasObj.createdFromSample === draTasObj.createdFromSample ) // What: Sample Link Lookup. Why: A replayed mini-tour must find the reminder it created before. How: This finds the task sharing the draft's own createdFromSample id.
			: null;                                                                                                // What: No Sample Branch. Why: A draft not started from a sample has nothing to replace. How: This is null.

		const newIdeStr = exiTasObj ? exiTasObj.id : draTasObj.id; // What: New Identifier String. Why: The entrance animation below needs to target whichever id the committed reminder actually ends up at. How: This picks exiTasObj's own id when one was found, otherwise draTasObj's own id.

		const finAddFun = () => { // What: Finish Add Function. Why: The actual commit is deferred behind the collapse animation below (or run immediately under reduced motion), so it's centralized here. How: This calls actStoObj.addTasFun, announces the result, stages the entrance animation, and resets every quick-add staAppObj slot.


			actStoObj.addTasFun( { ...draTasObj, name : tasNamStr, ...( exiTasObj ? { replaceId : exiTasObj.id } : {} ) } ); // What: Add Task Call. Why: This is the actual commit, creating a new reminder or, for a re-run mini-tour, replacing the existing sample-linked one via replaceId. How: This spreads draTasObj with the trimmed name and an optional replaceId.

			annAddFun( { ...draTasObj, name : tasNamStr } ); // What: Announce Add Call. Why: The user needs to know whether the just-added reminder will actually show up today. How: This calls annAddFun against the same committed shape.
			setInsIdeStr( newIdeStr );                       // What: Insert Identifier Stage Call. Why: The committed reminder needs to play its own entrance animation exactly once. How: This sets insIdeStr to newIdeStr.
			setDraTasObj( null );                            // What: Draft Clear Call. Why: The quick-add form's own draft is fully spent once committed. How: This resets draTasObj back to null.
			setVisForBoo( false );                           // What: Visible Form Flag Clear. Why: The form must stop rendering once the commit finishes. How: This flips visForBoo false.
			cloAddFun();                                     // What: Close Add Call. Why: The shared actEdiStr slot must be released now that the commit is done. How: This calls cloAddFun, which clears actEdiStr only while it's still this form's own sentinel.
			setAddCloBoo( false );                           // What: Add Closing Flag Reset. Why: The next open must not start out mid-close. How: This clears addCloBoo back to false.

			setTimeout( () => { comTasRef.current = false; }, 500 ); // What: Commit Flag Release Call. Why: A later, genuinely new commit must be allowed once this one has fully settled. How: This clears comTasRef back to false after 500ms.


		};



		if ( redMotFun() ) { finAddFun(); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion should get an instant commit instead of an animated close-then-commit. How: This calls finAddFun directly and returns early.



		setAddCloBoo( true ); // What: Add Closing Flag Set. Why: The form needs to stay mounted but visually collapsing while the transition plays before the real commit lands. How: This flips addCloBoo true.

		cloTimRef.current = setTimeout( finAddFun, 180 ); // What: Deferred Commit Call. Why: The actual commit must wait for the .18s close animation to finish first. How: This schedules finAddFun, then stores the timeout id for possible cancellation.


	};


	useEscCanFun( visForBoo && !addCloBoo, canAddFun ); // What: Use Escape Cancel Function. Why: Escape should discard the quick-add regardless of what's been typed or which of its controls has focus. How: This calls canAddFun whenever the form is visible and not already mid-close.

	// #endregion Quick-Add Form



	// #region Header Progress

	const donCouNum = dueTasArr.filter( ( curTasObj ) => TAS_NAM_OBJ.isaDonFun( curTasObj, ancDatObj ) ).length;      // What: Done Count Number. Why: The header's own "N of M" count needs the real completed count among dueTasArr. How: This filters dueTasArr by TAS_NAM_OBJ.isaDonFun and reads the resulting length.
	const tutDonNum = tutTasArr.filter( ( curTasObj ) => !!ONB_CHE_OBJ.entLooFun( staAppObj, curTasObj.id ) ).length; // What: Tutorial Done Number. Why: A mini-tour launcher card resolved any of the 3 ways counts toward the same header total as a real completed card. How: This filters tutTasArr by ONB_CHE_OBJ.entLooFun and reads the resulting length.
	const remTotNum = dueTasArr.length + tutTasArr.length;                                                            // What: Reminder Total Number. Why: The header's own "of M" total must include both real due reminders and any still-offered tutorial cards. How: This sums dueTasArr's own length and tutTasArr's own length.
	const remDonNum = donCouNum + tutDonNum;                                                                          // What: Reminder Done Number. Why: The header's own "N of" count must likewise include both real completions and resolved tutorial cards. How: This sums donCouNum and tutDonNum.

	const remPreRef = React.useRef( remDonNum ); // What: Reminder Previous Reference. Why: The dash-bar animation below needs remDonNum's own PRIOR value to detect a genuine increase, not just its current value. How: This starts at remDonNum and is updated at the end of the effect below.

	const [ remFreNum, setRemFreNum ] = React.useState( -1 ); // What: Reminder Fresh Number And Setter. Why: The dash-bar's own just-completed dash needs to know WHICH index to briefly animate, mirroring GroupHeader's own freshIdx. How: This is set by the effect below and cleared 520ms later.


	React.useEffect( () => { // What: Dash Animation Effect. Why: The dash that just turned on should animate in, exactly like every other group's own progress bar, even though this section isn't rendered by that shared component. How: This detects a genuine increase in remDonNum, stages remFreNum, then clears it after the flourish's own duration.


		if ( remDonNum > remPreRef.current ) { // What: Genuine Increase Guard. Why: Only an actual increase (not e.g. an unrelated re-render) should trigger the flourish. How: This compares remDonNum against remPreRef's own remembered prior value.


			const newFreNum = remDonNum - 1; // What: New Fresh Number. Why: The just-completed dash is always the one immediately before the new total. How: This subtracts 1 from remDonNum.


			setRemFreNum( newFreNum ); // What: Fresh Index Stage Call. Why: This is what actually tells the dash bar which index to briefly animate. How: This sets remFreNum to newFreNum.

			const freTimNum = setTimeout( () => setRemFreNum( ( curFreNum ) => ( curFreNum === newFreNum ? -1 : curFreNum ) ), 520 ); // What: Fresh Timeout Number. Why: The flourish must clear itself after its own animation duration, but only if nothing newer has already taken over. How: This resets remFreNum back to -1 520ms later, guarded against a staler run clobbering a newer one.


			remPreRef.current = remDonNum; // What: Previous Snapshot Update. Why: The next run of this effect needs to compare against whatever remDonNum is right now. How: This overwrites remPreRef with remDonNum's own current value.



			return () => clearTimeout( freTimNum ); // What: Effect Cleanup Return. Why: A stale fresh-flourish timeout must not outlive this run, in case remDonNum changes again before it fires. How: This returns a closure that clears freTimNum.


		}



		remPreRef.current = remDonNum; // What: Previous Snapshot Update. Why: A non-increasing run still needs to keep remPreRef in sync, so a later genuine increase is detected correctly. How: This overwrites remPreRef with remDonNum's own current value.


	}, [ remDonNum ] ); // What: Effect Dependency Array. Why: This effect only needs to re-run when remDonNum itself changes, since that's the exact value its own comparison watches. How: remDonNum is compared against remPreRef's own remembered prior value every run.

	// #endregion Header Progress



	return (


		<section
			ref={ secRefFun }

			className='group-section rem-section'
		>{ /* What: Group Section Element. Why: This is RemSecCom's own root element, matching every other Today group's own outer landmark. How: This renders the header, the optional day-log panel, and the today-list below. */ }


			<header className={ ` group-h   ${ ediModBoo ? 'is-reorderable' : '' } ` }>{ /* What: Group Header Element. Why: This groups the section's own name/count/log-chip on the left and its progress/add-button on the right. How: This renders group-h-l and rem-h-r below, marking itself reorderable while ediModBoo is on. */ }


				<div className='group-h-l'>{ /* What: Group Header Left Div Element. Why: The drag grip, name, count, and log chip read together on the header's own left side. How: This wraps all 4 below, the grip only while ediModBoo is on. */ }


					{ ediModBoo && ( // What: Grip Visibility Check. Why: The drag grip only makes sense while Edit Mode is on. How: This renders the grip span only while ediModBoo is true.


						<span
							className='group-grip'

							draggable={ false }

							aria-label='Drag to reorder group'
							role='button'
							tabIndex={ 0 }

							onDragStart={ ( draEveObj ) => draEveObj.preventDefault() } // What: Native Drag Block. Why: The grip uses its own pointer-driven reorder, so the browser's HTML5 drag must never start. How: This cancels dragstart.
							onPointerDown={ ( poiEveObj ) => onGriDowFun( poiEveObj ) }
						>{ /* What: Group Grip Span Element. Why: This is the whole section's own drag handle for reordering among other groups. How: This suppresses the native HTML5 drag entirely and forwards pointer-down straight to onGriDowFun. */ }


							<IcoSvgCom
								icoNamStr='griEle'
								sizValNum={ 16 }
							/>{ /* What: Icon Svg Component. Why: This is the grip's own visible glyph. How: This renders the 'griEle' icon. */ }


						</span>


					) }

					<h2 className='group-name'>Reminders</h2>{ /* What: Group Name Heading Element. Why: This is the section's own fixed title, matching every other Today group's own heading. How: This renders the literal text "Reminders". */ }

					<span className='group-count'>{ /* What: Group Count Span Element. Why: The done and total counts read together as one "N of M" unit. How: This wraps the done span and the "of M" span below. */ }


						<span className='group-done'>{ remDonNum }</span>{ /* What: Group Done Span Element. Why: This is the header's own live completed count. How: This renders remDonNum directly. */ }

						<span className='group-of'>of { remTotNum }</span>{ /* What: Group Of Span Element. Why: This is the header's own live total count. How: This renders remTotNum directly. */ }


					</span>



					{ !ediModBoo && onTogLogFun && ( // What: Log Chip Visibility Check. Why: The day-log toggle only makes sense outside Edit Mode, and only when a caller actually wired up onTogLogFun. How: This renders only while both conditions hold.


						<LogChiCom
							open={ logOpeBoo }

							onTogLogFun={ onTogLogFun }
						/> // What: Log Chip Component. Why: This is the Reminders header's own toggle for its day-log panel. How: This shows logOpeBoo and toggles the panel via onTogLogFun.


					) }


				</div>


				<div className='rem-h-r'>{ /* What: Header Right Div Element. Why: The progress dash-bar and the add button read together on the header's own right side. How: This wraps both below. */ }


					<div className='group-progress'>{ /* What: Group Progress Div Element. Why: This mirrors GroupHeader's own dash-bar for every other Today group, even though this section isn't rendered by that shared component. How: This renders one dash per remTotNum, marking the done ones and briefly flourishing the freshest one. */ }


						{ Array( remTotNum ).fill( 0 ).map( ( _, dasIndNum ) => ( // What: Dash List Render. Why: One dash is needed per item this section counts toward its own total. How: This maps a throwaway remTotNum-length array to one <i> per dash, keyed by its own index (stable here, since remTotNum only ever grows/shrinks at its own end).


							<i
								key={ dasIndNum }

								className={ ` ${ dasIndNum < remDonNum ? 'is-done' : '' }   ${ dasIndNum === remFreNum ? 'is-fresh' : '' } ` }
							/> // What: Dash Element. Why: This is one individual dash in the progress bar. How: This marks itself done when its own index is below remDonNum, and fresh only for the single index remFreNum currently flourishing.


						) ) }


					</div>



					{ !ediModBoo && ( // What: Add Button Visibility Check. Why: The add button (or its disabled InfTipCom stand-in) only makes sense outside Edit Mode. How: This renders one of the 2 branches below only while ediModBoo is false.


						tutProBoo ? ( // What: Tutorials In Progress Check. Why: The add control must stay disabled with an explanation while the guided checklist is still running. How: This renders the disabled InfTipCom while tutProBoo is true, the real button otherwise.


							<InfTipCom
								className='rem-add-btn is-tour-disabled'

								actNamStr='Add a Reminder'
								labTexStr='This button is disabled until all tutorials are completed.'
							>{ /* What: Info Tip Component. Why: A disabled add control still needs to explain why it can't be clicked while some other tutorial is in progress. How: This wraps the plus icon, standing in for the real button below. */ }


								<IcoSvgCom
									icoNamStr='pluEle'
									sizValNum={ 16 }
								/>{ /* What: Icon Svg Component. Why: This is the disabled control's own visible glyph, matching the real button's own icon. How: This renders the 'pluEle' icon. */ }


							</InfTipCom>


						) : ( // What: Add Button Branch. Why: Outside the guided checklist, the real working Add button belongs here instead. How: This renders the else branch, taken while tutProBoo is false.


							<button
								className='rem-add-btn'

								aria-label='Add a Reminder'
								title='Add a Reminder'

								onClick={ () => { addOpeBoo ? canAddFun() : staAddFun(); } } // What: Add Toggle Click. Why: The same button opens the quick-add form or cancels it when already open. How: This calls canAddFun while addOpeBoo, staAddFun otherwise.
							>{ /* What: Add Button Element. Why: This is the real, clickable entry point into the quick-add form. How: This toggles between canAddFun and staAddFun based on whether the form is already open. */ }


								<IcoSvgCom
									icoNamStr='pluEle'
									sizValNum={ 16 }
								/>{ /* What: Icon Svg Component. Why: This is the add button's own visible glyph. How: This renders the 'pluEle' icon. */ }


							</button>


						)


					) }


				</div>


			</header>



			{ !ediModBoo && ( // What: Log Panel Visibility Check. Why: The day-log panel only makes sense outside Edit Mode. How: This renders the ColDisCom-wrapped RemLogCom only while ediModBoo is false.


				<ColDisCom open={ !!logOpeBoo }>{ /* What: Collapse Disclosure Component. Why: The day-log panel needs to animate open/closed rather than snapping. How: This wraps RemLogCom, open only while logOpeBoo is true. */ }


					<RemLogCom
						staAppObj={ staAppObj }

						onCloLogFun={ onTogLogFun }
					/>{ /* What: Reminders Log Component. Why: This is the actual "what did the generator do today" audit panel for this group. How: This is passed staAppObj and closes back via onTogLogFun. */ }


				</ColDisCom>


			) }



			<div className='today-list'>{ /* What: Today List Div Element. Why: This is the shared vertical list every card/form below stacks inside, matching every other Today group's own list. How: This renders the added-message banner, the quick-add form, every tutorial card, and every real reminder row plus its inline editors. */ }


				{ addMesObj && ( // What: Added Message Visibility Check. Why: The post-add announcement only exists right after a successful commit. How: This renders the message paragraph only while addMesObj holds a value.


					<p
						className={ ` rem-added-msg   ${ addMesObj.okaBoo ? 'is-ok' : 'is-warn' } ` }

						role='status'
					>{ addMesObj.texStr }</p> // What: Added Message Paragraph Element. Why: This is the live-announced confirmation or warning text itself. How: This marks itself is-ok or is-warn based on addMesObj's own okaBoo flag.


				) }



				{ visForBoo && draTasObj && ( // What: Quick-Add Visibility Check. Why: The whole quick-add form only exists while it's visible AND a draft has actually been built. How: This renders the form only while both conditions hold.


					<div className={ ` rem-quickadd-wrap   ${ addCloBoo ? 'is-closing' : '' } ` }>{ /* What: Quick-Add Wrap Div Element. Why: The name input row and the full schedule editor need to collapse together as one unit. How: This wraps both below, marking itself closing while addCloBoo is true. */ }


						<div className='rem-quickadd'>{ /* What: Quick-Add Div Element. Why: The name input needs its own row above the schedule editor. How: This wraps the single name input below. */ }


							<input
								ref={ inpEleRef }

								className='np-input'

								maxLength={ 60 }
								placeholder='Add a reminder, e.g. Take out the trash'
								type='text'
								value={ draTasObj.name }

								aria-label='Reminder name'

								onChange={ ( chaEveObj ) => setDraTasObj( ( curDraObj ) => ( { ...curDraObj, name : chaEveObj.target.value } ) ) }
								onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Enter' ) comAddFun(); } } // What: Enter Commit Shortcut. Why: Pressing Enter in the name field should add the reminder. How: This calls comAddFun on Enter.
							/>{ /* What: Name Input Element. Why: This is the quick-add form's own primary, first-focused field. How: This commits every keystroke straight into draTasObj, and Enter commits the whole form via comAddFun. */ }


						</div>


						<div className='rem-inline-editor'>{ /* What: Inline Editor Div Element. Why: The schedule editor and its own footer need to sit together, same layout as InlEdiCom's own root. How: This renders SchEdiCom against draTasObj, then its own Cancel/Add footer. */ }


							<SchEdiCom
								actStoObj={ draActObj }
								aniExtBoo
								staAppObj={ staAppObj }
								tasRcdObj={ draTasObj }
							/>{ /* What: Schedule Editor Component. Why: This is the actual live schedule editor, operating on the in-progress draft before it's ever created. How: This is passed draActObj instead of the real store actStoObj, so every field stays local until Add. */ }



							<div className='rem-inline-foot'>{ /* What: Inline Foot Div Element. Why: Cancel and Add read as a pair, matching EdiFooCom's own plain-footer shape. How: This wraps both ButBasCom elements below. */ }


								<ButBasCom
									kinValStr='ghost'
									sizValStr='sm'

									onClick={ canAddFun }
								>Cancel</ButBasCom>{ /* What: Button Base Component. Why: This discards the in-progress draft entirely. How: This calls canAddFun. */ }



								<ButBasCom
									disabled={ !draTasObj.name.trim() }
									kinValStr='primary'
									sizValStr='sm'

									onClick={ comAddFun }
								>Add</ButBasCom>{ /* What: Button Base Component. Why: This is the form's own actual submit action. How: This calls comAddFun, disabled while the name is blank. */ }


							</div>


						</div>


					</div>


				) }



				{ tutTasArr.map( ( curTasObj ) => ( // What: Tutorial Card List Render. Why: One mini-tour launcher card is needed per still-relevant hidden sample. How: This maps tutTasArr to one RemCarCom per entry, keyed by its own id.


					<RemCarCom
						key={ curTasObj.id }

						actStoObj={ actStoObj }
						extClaStr={ cheExiBoo ? 'is-removing' : '' } // What: Checklist Exit Class. Why: Tutorial cards leave together with the onboarding checklist. How: This applies the removing class while cheExiBoo.
						isaTutBoo
						tasRcdObj={ curTasObj }
						tutDonBoo={ !!ONB_CHE_OBJ.entLooFun( staAppObj, curTasObj.id ) }

						onPlaTutFun={ onPlaTutFun }
						onUncTutFun={ onUncTutFun }
					/> // What: Reminder Card Component. Why: This is one mini-tour launcher card. How: This is flagged isaTutBoo, resolved via ONB_CHE_OBJ.entLooFun, and plays the checklist's own exit class while cheExiBoo.


				) ) }



				{ dueTasArr.map( ( curTasObj ) => ( // What: Due Card List Render. Why: One real reminder row (plus its own inline editors) is needed per currently-due reminder. How: This maps dueTasArr to one RemCarCom, one skip ColDisCom, and one edit ColDisCom per entry, keyed by its own id.


					<React.Fragment key={ curTasObj.id }>{ /* What: Due Card Fragment Element. Why: Each due reminder renders its card plus its inline editors as siblings. How: This groups them per reminder, keyed by the task's own id. */ }


						<RemCarCom
							actStoObj={ actStoObj }
							cheDatObj={ ancDatObj }
							extClaStr={ insIdeStr === curTasObj.id // What: Card Class Pick. Why: A card plays at most one entrance or exit animation, picked by which transition it is currently in. How: This checks each transition in priority order below, falling back to no class.
								? 'rem-card--insert'                             // What: Just Added Class. Why: A newly added card plays its entrance animation. How: This applies while insIdeStr matches this card.
								: remIdeStr === curTasObj.id                     // What: Removing Check. Why: A card being deleted plays its exit animation next in priority. How: This compares remIdeStr against this card.
								? 'rem-card--removing'                           // What: Removing Class. Why: This is the deletion exit animation. How: This applies while remIdeStr matches this card.
								: ( leaTasSet && leaTasSet.has( curTasObj.id ) ) // What: Leaving Check. Why: A card leaving the list for another reason plays the purge animation. How: This checks leaTasSet for this card.
								? 'rem-card--purging'                            // What: Purging Class. Why: This is the leave-the-list exit animation. How: This applies while leaTasSet holds this card.
								: ( arvTasSet && arvTasSet.has( curTasObj.id ) ) // What: Arriving Check. Why: A card newly arriving in the list (e.g. due again) also plays the entrance animation. How: This checks arvTasSet for this card.
								? 'rem-card--insert'                             // What: Arriving Class. Why: An arriving card reuses the entrance animation. How: This applies while arvTasSet holds this card.
								: ''                                             // What: No Class. Why: A card in no transition needs no extra class. How: This is an empty string.
							}
							isaOpeBoo={ opeTasStr === curTasObj.id }
							isaSkiBoo={ skiIdeStr === curTasObj.id }
							jusCheStr={ jusCheStr }
							tasRcdObj={ curTasObj }

							onAniEndFun={ ( aniEveObj ) => { // What: Animation End Handler. Why: This card's own collapse-in/out animations must clear their own staged flags exactly once, and only for the card's own outer element, not a bubbled child animation. How: This guards on the real target first, then clears insIdeStr and/or runs the deferred remove/skip action.


								if ( aniEveObj.target !== aniEveObj.currentTarget ) return; // What: Bubbled Animation Guard. Why: A child element's own animation ending must not be mistaken for this card's own outer animation ending. How: This bails out unless the event's own target is this exact element.



								if ( insIdeStr === curTasObj.id ) setInsIdeStr( null ); // What: Insert Flag Clear Guard. Why: The entrance animation must only ever play once. How: This clears insIdeStr only while it still matches curTasObj's own id.



								if ( remIdeStr === curTasObj.id ) { // What: Removal Finish Guard. Why: The card's own collapse-out animation ending is exactly when the deferred delete/skip action should actually run. How: This invokes remActRef's own thunk (or a plain delTasFun fallback), then clears both remActRef and remIdeStr.


									( remActRef.current || ( () => actStoObj.delTasFun( curTasObj.id ) ) )(); // What: Deferred Action Call. Why: Delete and Skip each stage a different thunk here; a missing thunk still falls back to a plain remove. How: This invokes remActRef's own current thunk, or a plain delTasFun call when none was staged.
									remActRef.current = null;                                                 // What: Action Reference Clear. Why: A stale thunk must not accidentally run again on some later animation end. How: This resets remActRef back to null.
									setRemIdeStr( null );                                                     // What: Removing Flag Clear. Why: The card's own collapse-out animation has now fully finished. How: This clears remIdeStr back to null.


								}


							} }
							onEdiTasFun={ () => { // What: Edit Toggle Handler. Why: Tapping Edit toggles this card's own inline editor and closes its skip confirm. How: This flips the shared editor slot for this card, then clears skiIdeStr.


								setActEdiStr( ( curEdiStr ) => curEdiStr === `reminder:${ curTasObj.id }` ? null : `reminder:${ curTasObj.id }` ); // What: Editor Slot Toggle Call. Why: The same tap opens or closes this card's editor. How: This clears the slot when it already holds this card, otherwise claims it.

								setSkiIdeStr( null ); // What: Skip Confirm Close Call. Why: The editor and the skip confirm never show together. How: This clears skiIdeStr.


							} }
							onRenTasFun={ ( namStr ) => actStoObj.renTasFun( curTasObj.id, namStr ) }
							onSkiTasFun={ () => { // What: Skip Handler. Why: The row's own Skip button needs to toggle its own confirm prompt open/closed and close any unrelated open editor at the same time. How: This flips skiIdeStr and clears a matching actEdiStr sentinel.


								setSkiIdeStr( ( curSkiStr ) => curSkiStr === curTasObj.id ? null : curTasObj.id );                                            // What: Skip Confirm Toggle Call. Why: This is the actual open/close toggle for this card's own skip confirm prompt. How: This flips skiIdeStr between null and curTasObj's own id.
								setActEdiStr( ( curEdiStr ) => ( typeof curEdiStr === 'string' && curEdiStr.startsWith( 'reminder:' ) ) ? null : curEdiStr ); // What: Reminder Editor Close Call. Why: Opening the skip confirm should close any open inline schedule editor, but must not clobber some unrelated other editor. How: This clears actEdiStr only while it's currently any 'reminder:' editor sentinel.


							} }
							onTogTasFun={ onTogDonFun }
						/>{ /* What: Reminder Card Component. Why: This is one real, due reminder's own row. How: This wires every one of its callback props straight into this section's own local staAppObj and actStoObj. */ }



						<ColDisCom open={ opeTasStr === curTasObj.id }>{ /* What: Collapse Disclosure Component. Why: The inline schedule editor only exists while this exact card's own edit affordance is open. How: This animates InlEdiCom open only while opeTasStr matches curTasObj's own id. */ }


							<InlEdiCom
								staAppObj={ staAppObj }
								tasRcdObj={ curTasObj }

								onCloEdiFun={ () => setActEdiStr( ( curEdiStr ) => curEdiStr === `reminder:${ curTasObj.id }` ? null : curEdiStr ) } // What: Editor Close Handler. Why: Another editor may already hold the shared slot, which must not be cleared. How: This clears the slot only while it still holds this card's own sentinel.
								onComTasFun={ ( draSnaObj ) => actStoObj.updTasFun( curTasObj.id, draSnaObj ) }
								onDelTasFun={ () => { // What: Delete Handler. Why: Deleting this reminder needs to close its own inline editor and stage the same collapse-then-remove sequence the card-level Delete uses. How: This closes actEdiStr, then either removes immediately (reduced motion) or defers it behind the collapse-out animation.


									setActEdiStr( ( curEdiStr ) => curEdiStr === `reminder:${ curTasObj.id }` ? null : curEdiStr ); // What: Reminder Editor Close Call. Why: Deleting this reminder must also close its own now-stale inline editor. How: This clears actEdiStr only while it still equals this exact card's own sentinel.



									if ( redMotFun() ) { actStoObj.delTasFun( curTasObj.id ); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion should get an instant remove instead of an animated collapse-then-remove. How: This calls actStoObj.delTasFun directly and returns early.



									remActRef.current = () => actStoObj.delTasFun( curTasObj.id ); // What: Remove Action Stage Call. Why: The card's own collapse-out animation must finish before the actual removal runs. How: This stages a thunk remActRef reads on the card's own onAniEndFun.
									setRemIdeStr( curTasObj.id );                                  // What: Removal Stage Call. Why: The card above must play its own collapse-out animation before remActRef's own thunk actually runs, on that card's own onAniEndFun. How: This stages curTasObj's own id as the currently-removing card.


								} }
							/>{ /* What: Inline Edit Component. Why: This is the actual schedule editor for this card, committing straight to the real store. How: This is passed curTasObj directly (not a local draft), closing back via onCloEdiFun. */ }


						</ColDisCom>



						<ColDisCom open={ skiIdeStr === curTasObj.id }>{ /* What: Collapse Disclosure Component. Why: The skip confirm only exists while this exact card's own skip affordance is open. How: This animates the confirm prompt open only while skiIdeStr matches curTasObj's own id. */ }


							{ ( () => { // What: Skip Confirm Content Function. Why: The confirm prompt's own wording depends on curTasObj's own next eligible day, computed once as an IIFE rather than inline in the JSX below. How: This resolves that next day, then returns the confirm/no-day-available markup.


								const nexEliObj = TAS_NAM_OBJ.nexEliFun( curTasObj, staAppObj.reminderOpts, staAppObj.holidays ); // What: Next Eligible Object. Why: This is the actual date the Skip action would defer curTasObj to. How: This calls TAS_NAM_OBJ.nexEliFun against curTasObj.
								const tomIsoStr = TAS_NAM_OBJ.isoDatFun( new Date( Date.now() + 86400000 ) );                     // What: Tomorrow Iso String. Why: The label below reads "tomorrow" instead of a full date when that's literally what nexEliObj resolves to. How: This computes tomorrow's own iso string from right now plus one day in milliseconds.
								const nexIsoStr = nexEliObj ? TAS_NAM_OBJ.isoDatFun( nexEliObj ) : null;                          // What: Next Iso String. Why: This is compared against tomIsoStr to decide the label below. How: This calls TAS_NAM_OBJ.isoDatFun against nexEliObj, or null when there's no eligible day at all.

								const skiLabStr = !nexEliObj // What: Skip Label String. Why: This is the actual day named in the confirm prompt below, or null when there's nothing to skip to. How: This picks 'tomorrow' when nexIsoStr matches tomIsoStr, otherwise a full locale-formatted date, or null when nexEliObj itself is null.
									? null                                                                                             // What: No Day Branch. Why: With no next eligible day there is nothing to name. How: This is null.
									: nexIsoStr === tomIsoStr                                                                          // What: Tomorrow Check. Why: A next day of tomorrow reads better as the word itself. How: This compares nexIsoStr against tomIsoStr.
									? 'tomorrow'                                                                                       // What: Tomorrow Branch. Why: This is the plain word used when the next day is tomorrow. How: This is the literal 'tomorrow'.
									: nexEliObj.toLocaleDateString( 'en-US', { day : 'numeric', month : 'short', weekday : 'long' } ); // What: Full Date Branch. Why: Any later day needs its real date named. How: This formats nexEliObj as a weekday, short month and day.



								return (


									<div className='rem-skip-confirm'>{ /* What: Skip Confirm Div Element. Why: This is the skip prompt's own root, replacing nothing (it renders inline below the card, inside its own ColDisCom). How: This renders one of the 2 branches below depending on whether skiLabStr resolved to a real day. */ }


										{ skiLabStr ? ( // What: Skip Label Check. Why: The confirm prompt's own shape depends on whether a real eligible day was actually found. How: This renders the Skip-until confirm while skiLabStr holds a value, an explanatory no-day message otherwise.


											<>{ /* What: Skip Confirm Fragment Element. Why: The skip message and its buttons render together as one branch. How: This groups them with no wrapper element. */ }


												<div className='rem-skip-msg'>Skip until <strong>{ skiLabStr }</strong>?</div>{ /* What: Skip Message Div Element. Why: This names the exact day curTasObj would be deferred to. How: This renders skiLabStr inside the confirm question. */ }

												<div className='rem-skip-actions'>{ /* What: Skip Actions Div Element. Why: Cancel and Confirm read as a pair. How: This wraps both ButBasCom elements below. */ }


													<ButBasCom
														kinValStr='ghost'
														sizValStr='sm'

														onClick={ () => setSkiIdeStr( null ) }
													>Cancel</ButBasCom>{ /* What: Button Base Component. Why: This backs out of the skip confirm without changing anything. How: This closes skiIdeStr, returning to the plain row. */ }



													<ButBasCom
														kinValStr='primary'
														sizValStr='sm'

														onClick={ () => { // What: Confirm Skip Click Handler. Why: Confirming the skip needs to close the prompt and stage the same collapse-then-skip sequence Delete uses. How: This closes skiIdeStr, then either skips immediately (reduced motion) or defers it behind the collapse-out animation.


															setSkiIdeStr( null ); // What: Skip Confirm Close Call. Why: The confirm prompt has now been answered, so it must close. How: This clears skiIdeStr back to null.



															if ( redMotFun() ) { actStoObj.skiTasFun( curTasObj.id, nexIsoStr ); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion should get an instant skip instead of an animated collapse-then-skip. How: This calls actStoObj.skiTasFun directly and returns early.



															remActRef.current = () => actStoObj.skiTasFun( curTasObj.id, nexIsoStr ); // What: Skip Action Stage Call. Why: The card's own collapse-out animation must finish before the actual skip runs. How: This stages a thunk remActRef reads on the card's own onAniEndFun, reusing the same removal machinery Delete uses.

															setRemIdeStr( curTasObj.id ); // What: Removal Stage Call. Why: The card above must play its own collapse-out animation before the deferred skiTasFun call actually runs, on that card's own onAniEndFun. How: This stages curTasObj's own id as the currently-removing card, reusing the same removal machinery Delete uses.


														} }
													>Confirm</ButBasCom>{ /* What: Button Base Component. Why: This is the actual, confirmed skip trigger. How: This stages the deferred actStoObj.skiTasFun call above. */ }


												</div>


											</>


										) : ( // What: No Eligible Day Branch. Why: With nothing to skip to, the prompt just needs a plain explanatory message and Close button instead. How: This renders the else branch, taken while skiLabStr is null.


											<>{ /* What: No Day Fragment Element. Why: The explanation and its Close button render together as one branch. How: This groups them with no wrapper element. */ }


												<div className='rem-skip-msg'>No upcoming eligible day to skip to.</div>{ /* What: Skip Message Div Element. Why: curTasObj has no eligible day at all to defer to, e.g. every allowed weekday is excluded. How: This renders the plain explanatory text instead of a real confirm question. */ }

												<div className='rem-skip-actions'>{ /* What: Skip Actions Div Element. Why: Even with nothing to confirm, the prompt still needs a way to close. How: This wraps the single Close ButBasCom below. */ }


													<ButBasCom
														kinValStr='ghost'
														sizValStr='sm'

														onClick={ () => setSkiIdeStr( null ) }
													>Close</ButBasCom>{ /* What: Button Base Component. Why: This is the only available action when there's no eligible day to skip to. How: This closes skiIdeStr, returning to the plain row. */ }


												</div>


											</>


										) }


									</div>


								);


							} )() }


						</ColDisCom>


					</React.Fragment>


				) ) }


			</div>


		</section>


	);


}

// #endregion RemSecCom

// #endregion Components



// #region Exports

export { RemManCom, RemSecCom, SegConCom }; // What: Named Exports. Why: tab-data.jsx renders RemManCom, tab-today.jsx renders RemSecCom, and cadence-control.jsx and tab-settings.jsx reuse SegConCom. How: This exports all three components by name.

// #endregion Exports


