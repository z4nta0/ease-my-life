


// #region Imports

import cssModObj from './schedule-editor.module.css'; // What: CSS Module Object. Why: The schedule editor's fields, both of its layouts, and its visibility note are styled from their own module. How: This maps each class name in schedule-editor.module.css to its hashed module class.
import React     from 'react';                        // What: React. Why: Every component in this file is built directly on React's own APIs. How: This is used directly (React.useRef, React.useState, React.Fragment) instead of importing individual named hooks.


import { ColDisCom   } from './collapse.tsx';          // What: Collapse Disclosure Component. Why: The editor's own schedule subsections need to animate open and closed instead of snapping. How: This wraps the anchor hint and each repeat kind's own fields in SchEdiCom.
import { nexDatFun   } from '../utils/date.ts';        // What: Next Date Function. Why: A reminder's next occurrence reads as a full prose date. How: This is called with the date and whether the year must always show.
import { ordSufFun   } from '../utils/date.ts';        // What: Ordinal Suffix Function. Why: Monthly and yearly schedules read days as ordinals like 1st or 22nd. How: This is called with the day number.
import { SegConCom   } from './segmented-control.tsx'; // What: Segment Control Component. Why: The schedule editor's own repeat choices use the shared segmented control. How: This is rendered wherever the editor offers mutually exclusive options.
import { TAS_NAM_OBJ } from '../core/tasks.ts';        // What: Tasks Namespace Object. Why: The editor's own summaries, visibility notes, and schedule defaults defer to the reminders engine instead of duplicating its logic. How: This namespace object is called throughout SchEdiCom and VisNotCom.
import { WeeChiCom   } from './weekday-chips.tsx';     // What: Weekday Chip Component. Why: A weekly schedule needs a multi-select control for its own chosen days. How: This is rendered inside SchEdiCom's own weekly schedule subsection.


import type { DatModTyp } from '../core/data-model.ts'; // What: Date Mode Type. Why: Each date mode option's key is one of the fixed modes. How: This types datModArr's keys, so the mode picker hands back a real mode.
import type { RepNamTyp } from '../core/data-model.ts'; // What: Repeat Name Type. Why: Each repeat option's key is one of the fixed repeat kinds. How: This types REP_OPT_ARR's keys, so the Repeat picker hands back a real kind.
import type { StaAppTyp } from '../core/data-model.ts'; // What: State App Type. Why: The visibility note reads the reminder options and holidays from app state. How: This types both components' staAppObj.
import type { TasRcdTyp } from '../core/data-model.ts'; // What: Task Record Type. Why: The editor edits a draft reminder. How: This types both components' reminder and SchEdiCom's patches.
import type { TodVisTyp } from '../core/tasks.ts';      // What: Today Visibility Type. Why: The reason phrase reads todVisFun's result. How: This types reaPhrFun's visResObj.

// #endregion Imports



/**
 * schedule-editor.tsx = Schedule Editor
 *
 * @summary
 * A reminder's own schedule editor, shared by Today's reminders section and
 * the Data tab's reminder manager: SchEdiCom edits the caller's draft of a
 * reminder's repeat kind (REP_OPT_ARR, one of the shared SegConCom's options)
 * and that kind's own schedule fields, and VisNotCom beneath it explains when
 * a reminder won't show today, with reaPhrFun naming the settings behind it.
 * All scheduling logic lives in tasks.ts; this file is presentation plus small
 * local form state only.
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

const REP_OPT_ARR : { keyStr : RepNamTyp, labStr : string, subEle : React.JSX.Element }[] = [ // What: Repeat Option Array. Why: SchEdiCom's own Repeat control needs one entry per schedule kind, each with its own live sub-explanation. How: This is passed as SegConCom's own optIteArr prop from SchEdiCom below.


	{ // What: Once Option Entry. Why: A one-time reminder is the default, no-repeat option. How: This entry's own subEle explains it stays included until marked as completed.


		keyStr : 'once',
		labStr : 'Once',
		subEle : <>included in the Today page <strong>until marked as completed</strong></>


	},

	{ // What: Interval Option Entry. Why: An interval reminder repeats every N days, set via the extra-fields subsection below. How: This entry's own subEle explains it recurs as often as specified there.


		keyStr : 'interval',
		labStr : 'N Days',
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

function reaPhrFun ( visResObj : TodVisTyp ) : string {


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

type VncProTyp = { kinValStr : string, notIdeStr : string, staAppObj : StaAppTyp, tasRcdObj : TasRcdTyp }; // What: Visibility-Note-Component Props Type. Why: The note explains why a reminder won't show today, in one of two placements. How: This types VisNotCom's props.

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

function VisNotCom ( { kinValStr, notIdeStr, staAppObj, tasRcdObj } : VncProTyp ) : React.JSX.Element {


	const visResObj = tasRcdObj && TAS_NAM_OBJ.todVisFun // What: Visibility Result Object. Why: Every branch below reads this same computed visibility result. How: This calls TAS_NAM_OBJ.todVisFun against tasRcdObj's own schedule, or stays null when there's no task yet.
		? TAS_NAM_OBJ.todVisFun( tasRcdObj, staAppObj.reminderOpts, staAppObj.holidays ) // What: Visibility Compute Branch. Why: A real task gets its own visibility result. How: This passes the task plus the reminder options and holidays it depends on.
		: null;                                                                          // What: No Task Branch. Why: With no task there is nothing to compute. How: This leaves the result null.


	const nevShoBoo = !!visResObj && !visResObj.visible && !visResObj.next; // What: Never Show Boolean. Why: A reminder with no eligible day at all is a dead configuration, not a deferred one, and needs a red warning instead of the calm advisory. How: This is true only when visResObj exists, isn't visible, and has no next eligible date either.


	const notConEle = ( () => { // What: Note Content Element. Why: The actual advisory content depends on several branches below, computed once as an IIFE rather than duplicated at each return point. How: This returns null when nothing applies to this instance's own kinValStr, otherwise the advisory paragraph.


		if ( !visResObj || visResObj.visible ) return null; // What: Already-Visible Guard. Why: A reminder that's already showing today needs no advisory at all. How: This returns null when there's no result yet, or the reminder is already visible.



		const setCauArr = visResObj.causes.filter( ( curCauStr ) => { // What: Settings Cause Array. Why: This decides which placement (settings vs schedule) the current cause set belongs to. How: This keeps only the 3 settings-based cause values out of visResObj's own causes.


			const wkdCauBoo = curCauStr === 'weekends';  // What: Weekend Cause Boolean. Why: The weekends setting is one of the 3 settings-based causes. How: This compares curCauStr against 'weekends'.
			const holCauBoo = curCauStr === 'holidays';  // What: Holiday Cause Boolean. Why: The holidays setting is one of the 3 settings-based causes. How: This compares curCauStr against 'holidays'.
			const skiCauBoo = curCauStr === 'skipUntil'; // What: Skip Cause Boolean. Why: A skip-until date is one of the 3 settings-based causes. How: This compares curCauStr against 'skipUntil'.

			const setCauBoo = wkdCauBoo || holCauBoo || skiCauBoo; // What: Settings Cause Boolean. Why: The filter keeps a cause only when it comes from a setting. How: This ORs the 3 checks above.



			return setCauBoo; // What: Settings Cause Return. Why: The filter needs a yes or no for each cause. How: This returns setCauBoo.


		} );


		const froSetBoo = !nevShoBoo && setCauArr.length > 0;  // What: From Settings Boolean. Why: A dead (never-showing) configuration always routes to the schedule subsection instead, regardless of which causes are present. How: This is true only when not nevShoBoo and at least one settings-based cause applies.
		const notPlaStr = froSetBoo ? 'settings' : 'schedule'; // What: Note Placement String. Why: This is compared against this instance's own kinValStr to decide whether IT is the one that should render the note. How: This picks 'settings' or 'schedule' based on froSetBoo.


		if ( kinValStr !== notPlaStr ) return null; // What: Wrong Placement Guard. Why: Only one of the several mounted instances per task should ever render the note. How: This returns null for every instance whose own kinValStr doesn't match notPlaStr.



		if ( nevShoBoo ) { // What: Dead Configuration Branch. Why: No eligible day ever is worth a red warning rather than the calm advisory below. How: This builds and returns the "never" warning paragraph.


			const whyTexEle = <>Reminders items are currently set to <strong>not show on { reaPhrFun( visResObj ) || 'weekends' }</strong></>; // What: Why Text Element. Why: The warning needs to name the specific settings-based reason, falling back to 'weekends' if none resolved. How: This calls reaPhrFun against visResObj.



			return (


				<p className={` ${ cssModObj.visNotPar }   ${ cssModObj.visNotParNever } `}>{ /* What: Never Note Paragraph Element. Why: This is the red dead-configuration warning shown only in kinValStr 'schedule'. How: This is glued to the schedule control that's the actual thing the user can change to fix it. */ }
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


			<p className={ cssModObj.visNotPar }>{ /* What: Deferred Note Paragraph Element. Why: This is the calm advisory shown for every non-dead mismatch, in whichever placement (settings or schedule) actually caused it. How: This renders bodTexEle followed by the next-appearance date when one is known. */ }


				{ bodTexEle }{ nexLabStr ? <> It will next appear on <strong>{ nexLabStr }</strong>.</> : null }{ /* What: Note Body Render. Why: The advisory sentence itself, plus an optional next-appearance clause when nexLabStr resolved to something. How: This renders bodTexEle directly, followed by the extra sentence only while nexLabStr holds a value. */ }


			</p>


		);


	} )();



	return (


		<div
			id={ notIdeStr }

			className={ cssModObj.visLivDiv }

			aria-live={ nevShoBoo ? 'assertive' : 'polite' } // What: Live Urgency Pick. Why: A reminder that will never show is urgent enough to interrupt, while a deferred one is not. How: This is assertive only for the never-show case.
			role='status'
		>{ notConEle }</div> // What: Note Live Region Element. Why: This must stay mounted even with nothing to say, so an aria-describedby reference from the control above always resolves to a real element, and so the live region announces reliably once notConEle changes. How: This renders notConEle inside a role="status" region, assertive only for the dead-configuration case.


	);


}

// #endregion VisNotCom



type SecProTyp = { aniExtBoo? : boolean, layVarStr : string, onPatTasFun : ( patValObj : Partial< TasRcdTyp > ) => void, staAppObj : StaAppTyp, tasRcdObj : TasRcdTyp }; // What: Schedule-Editor-Component Props Type. Why: The editor shows a draft reminder's schedule in one of two layouts and hands each change back as a patch. How: This types SchEdiCom's props.

// #region SchEdiCom

/**
 * SchEdiCom = Schedule Editor Component
 *
 * @summary
 * Edits a reminder's own schedule, always the caller's local draft
 * of it. Repeat kind is a segmented control; the detail control below
 * it swaps to match the kind. Every field change goes straight through
 * props.onPatTasFun, so this component holds no schedule state of its
 * own beyond the two inline-date-edit toggles.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.aniExtBoo   - Animate Extra Boolean: Whether the extra-fields
 *                            subsection should animate open/closed via
 *                            ColDisCom, defaulting to false for a context that
 *                            doesn't need it.
 * @param props.layVarStr   - Layout Variant String: Which layout the editor
 *                            renders in, 'stacked' (Today, label above
 *                            control) or 'rows' (the Data tab, one full-bleed
 *                            row per field).
 * @param props.onPatTasFun - On Patch Task Function: Merges a changed field
 *                            or two into the caller's draft reminder.
 * @param props.staAppObj   - State App Object: The shared app state, passed
 *                            through to VisNotCom for its own visibility
 *                            computation.
 * @param props.tasRcdObj   - Task Record Object: The caller's draft of the
 *                            reminder being edited.
 *
 * @returns The full schedule editor: the Repeat row plus whichever
 * detail subsection matches the current (or last non-once) repeat kind.
 *
 * @example
 * ```tsx
 * SchEdiCom({ aniExtBoo, layVarStr, onPatTasFun, ... }) // => <SchEdiCom />
 * ```
 *
*/

function SchEdiCom ( { aniExtBoo = false, layVarStr, onPatTasFun, staAppObj, tasRcdObj } : SecProTyp ) : React.JSX.Element {


	// #region Last Kind Memory

	const lasExtRef = React.useRef( tasRcdObj.repeat === 'once' ? 'interval' : tasRcdObj.repeat ); // What: Last Extra Reference. Why: While collapsing back to 'once', the extra-fields subsection needs its last non-once schedule kind to keep animating out instead of blanking instantly. How: This starts at 'interval' for a brand-new 'once' task, or the task's own real repeat otherwise.


	if ( tasRcdObj.repeat !== 'once' ) lasExtRef.current = tasRcdObj.repeat; // What: Last Extra Update Guard. Why: Every time the task genuinely has a non-once repeat, that's the value the collapse-out animation should remember next. How: This overwrites lasExtRef only while tasRcdObj's own repeat isn't 'once'.

	// #endregion Last Kind Memory



	// #region Label Lists

	const monAbbArr = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ];                                       // What: Month Abbreviation Array. Why: The annual schedule's month select needs a short label per month. How: This is indexed by month number minus 1 in the annual subsection below.
	const monFulArr = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]; // What: Month Full Array. Why: The annual schedule's own live summary needs the full month name to display. How: This is indexed by tasRcdObj.month minus 1 in the annual subsection below.
	const dayAbbArr = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];                                                                          // What: Day Abbreviation Array. Why: The weekly summary needs a short weekday name for a multi-day list. How: This is indexed by daysOfWeek entries in the weekly subsection below.
	const dayFulArr = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];                                             // What: Day Full Array. Why: The weekly single-day and monthly/annual Nth-weekday summaries need the full weekday name. How: This is indexed by daysOfWeek/nthWeekday entries throughout this function.


	const datModArr : { keyStr : DatModTyp, labStr : string }[] = [ // What: Date Mode Array. Why: The monthly and annual subsections both offer the same Date-vs-Weekday choice, driven by one shared SegConCom control. How: This is passed as that SegConCom's own optIteArr prop in both subsections below.


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


		<p className={ cssModObj.fieHinPar }>{ /* What: Anchor Hint Paragraph Element. Why: This is the shared hint every interval-based schedule below reuses unmodified. How: This renders the counted-from sentence, swapping in a live link or an inline input based on ancEdiBoo. */ }
			Counted from{ ' ' }
			{ ancEdiBoo ? ( // What: Anchor Editing Check. Why: The anchor date swaps between a plain link and a live inline input depending on whether editing is active. How: This renders the inline date input while ancEdiBoo is true, the plain link otherwise.


				<input
					className={ cssModObj.datInlInp }

					autoFocus
					type='date'
					value={ ancIsoStr }

					onBlur={ () => setAncEdiBoo( false ) }
					onChange={ ( chaEveObj ) => { if ( chaEveObj.target.value ) onPatTasFun( { anchor : chaEveObj.target.value } ); } } // What: Anchor Change Guard. Why: Clearing the native date input must not commit an empty anchor. How: This commits only a non-empty value.
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
						className={ cssModObj.datLinBut }

						type='button'

						aria-describedby={ schNotStr }

						onClick={ () => setAncEdiBoo( true ) }
					>{ ancLabStr }</button>{ /* What: Anchor Date Link Element. Why: This is the plain-text entry point into editing the anchor date. How: This shows ancLabStr and opens the inline input above when clicked. */ }.


				</>


			) }
		</p>


	);


	const oncFieEle = ( // What: Once Fields Element. Why: A one-time reminder is due immediately by default, and this subsection lets picking a later start date defer that. How: This renders the start-date label plus the same live link/inline-input pattern as ancHinEle.


		<div className={ cssModObj.forFieDiv }>{ /* What: Once Field Div Element. Why: This groups the start-date label, live link/input, and its own visibility note as one schedule subsection. How: This is the multi-line container every other schedule subsection below also uses. */ }


			<div className={ cssModObj.fieLabDiv }>{ /* What: Flabel Wrap Div Element. Why: The subsection's own label and live summary need to sit together as one visual unit. How: This wraps the plain label span and the fading summary span below. */ }


				<span className={ cssModObj.fieLabSpa }>Start date</span>{ /* What: Flabel Span Element. Why: This is the subsection's own plain label. How: This renders the literal text "Start date". */ }

				<span
					key={ oncFutBoo ? 'future' : 'now' } // What: Start State Key. Why: The summary should re-fade only when the start flips between future and immediate. How: This keys on oncFutBoo.

					className={` ${ cssModObj.fieSubSpa }   ${ cssModObj.fieSubSpaFading } `}
				>{ /* What: Flabel Sub Span Element. Why: This is the live summary of when the reminder will actually start showing. How: This re-keys (and so re-fades) whenever oncFutBoo flips, rendering one of the 2 branches below. */ }


					{ oncFutBoo // What: Start Phrase Pick. Why: A future start date defers the reminder, while a today-or-past one shows at once. How: This picks the phrase below based on oncFutBoo.
						? <>won't show on the Today page until <strong>{ oncLabStr }</strong></> // What: Future Start Phrase. Why: A future start date genuinely defers the reminder, so the summary must say so. How: This names oncLabStr as the date it will start showing.
						: <>shows on the Today page <strong>right away</strong></>               // What: Immediate Start Phrase. Why: The default (today-or-past) start date needs no extra explanation. How: This renders the plain reassurance phrase.
					}


				</span>


			</div>

			<p className={ cssModObj.fieHinPar }>{ /* What: Once Hint Paragraph Element. Why: This is the same "starting on" link/input pattern ancHinEle uses, for the once-specific start date field. How: This renders the live link or inline input based on oncEdiBoo. */ }
				Starting on{ ' ' }
				{ oncEdiBoo ? ( // What: Once Editing Check. Why: The once start date swaps between a plain link and a live inline input depending on whether editing is active. How: This renders the inline date input while oncEdiBoo is true, the plain link otherwise.


					<input
						className={ cssModObj.datInlInp }

						autoFocus
						min={ TAS_NAM_OBJ.curIsoFun() }
						type='date'
						value={ oncIsoStr }

						onBlur={ () => setOncEdiBoo( false ) }
						onChange={ ( chaEveObj ) => { // What: Once Date Change Handler. Why: `min` only disables the picker UI's own earlier dates; typing a date by hand bypasses it in every browser, so a past pick still has to be clamped here. How: This commits chaEveObj's own value, clamped up to today when it's earlier.


							if ( chaEveObj.target.value ) onPatTasFun( { onceDate : chaEveObj.target.value < TAS_NAM_OBJ.curIsoFun() ? TAS_NAM_OBJ.curIsoFun() : chaEveObj.target.value } ); // What: Clamped Commit Guard. Why: A typed-in date must still commit, but never earlier than today. How: This calls onPatTasFun only when a value exists, clamping it up to today when needed.


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
							className={ cssModObj.datLinBut }

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


					<div className={ cssModObj.forFieDiv }>{ /* What: Weekly Field Div Element. Why: This groups every weekly-specific control as one schedule subsection. How: This renders the day-picker, the every-N-weeks control, and the shared anchor hint/visibility note. */ }


						<div className={ cssModObj.fieLabDiv }>{ /* What: Flabel Wrap Div Element. Why: The subsection's own label and live summary need to sit together. How: This wraps the plain label span and the fading summary span below. */ }


							<span className={ cssModObj.fieLabSpa }>On these days</span>{ /* What: Flabel Span Element. Why: This is the subsection's own plain label. How: This renders the literal text "On these days". */ }

							<span
								key={ tasRcdObj.interval || 1 }

								className={` ${ cssModObj.fieSubSpa }   ${ cssModObj.fieSubSpaFading } `}
							>{ /* What: Flabel Sub Span Element. Why: This is the live summary of which days and how often the reminder shows. How: This re-keys (and so re-fades) whenever interval changes, rendering one of the 2 branches below. */ }


								{ ( tasRcdObj.daysOfWeek && tasRcdObj.daysOfWeek.length ) // What: Days Chosen Check. Why: The summary can only name days once at least one is chosen. How: This picks the chosen-days phrase while daysOfWeek has entries, the prompt otherwise.
									? <>shows on the Today page <strong>every { ( tasRcdObj.interval || 1 ) > 1 ? `${ tasRcdObj.interval } weeks on ` : '' }{ [ ...tasRcdObj.daysOfWeek ].sort( ( dowOneNum, dowTwoNum ) => dowOneNum - dowTwoNum ).map( ( dowIndNum ) => dayAbbArr[ dowIndNum ] ).join( ', ' ) }</strong></> // What: Chosen Days Phrase. Why: At least one day is selected, so the summary names every chosen weekday in order. How: This sorts a copy of daysOfWeek ascending, maps each to its abbreviation, and joins them, prefixed by the every-N-weeks clause when interval is above 1.
									: 'pick at least one day' // What: No Days Fallback. Why: No day is selected yet, an invalid, incomplete configuration. How: This renders a plain prompt instead of a broken summary.
								}


							</span>


						</div>

						<div className={ cssModObj.fieRowDiv }>{ /* What: Weekly Inline Div Element. Why: The every-N-weeks number input reads best inline with its own surrounding words. How: This wraps the "Every", the number input, and the "week(s) on" label. */ }


							<span>Every</span>{ /* What: Every Span Element. Why: This is the inline control's own leading word. How: This renders the literal text "Every". */ }

							<input
								className={` ${ cssModObj.eveNumInp } `}

								max='52'
								min='1'
								type='number'
								value={ tasRcdObj.interval || 1 }

								aria-describedby={ schNotStr }
								aria-label='Interval in weeks'

								onChange={ ( chaEveObj ) => onPatTasFun( { interval : Math.max( 1, parseInt( chaEveObj.target.value ) || 1 ) } ) } // What: Interval Clamp Commit. Why: An empty or invalid number must never commit an interval below 1. How: This parses the typed value, falling back to 1 and clamping at 1.
							/>{ /* What: Interval Number Input Element. Why: This is the actual every-N-weeks control. How: This clamps its own committed value to a minimum of 1 whole week. */ }

							<span>{ ( tasRcdObj.interval || 1 ) === 1 ? 'week on' : 'weeks on' }</span>{ /* What: Weeks Label Span Element. Why: This is the inline control's own trailing word, singular or plural to match the current interval. How: This picks between 'week on' and 'weeks on' based on tasRcdObj's own interval. */ }


						</div>



						<WeeChiCom
							value={ tasRcdObj.daysOfWeek || [] }

							desIdeStr={ schNotStr }

							onChange={ ( weeSelArr ) => onPatTasFun( { daysOfWeek : weeSelArr } ) }
						/>{ /* What: Weekday Chips Component. Why: A weekly schedule needs a multi-select control for its own chosen days. How: This commits the newly-selected day array straight through onPatTasFun. */ }



						<ColDisCom open={ ( tasRcdObj.interval || 1 ) > 1 }>{ /* What: Collapse Disclosure Component. Why: The counted-from hint is only meaningful once interval is above 1 week. How: This animates ancHinEle open only while that condition holds. */ }


							<div className={ cssModObj.ancFadDiv }>{ ancHinEle }</div>{ /* What: Anchor Fade Div Element. Why: The counted-from hint needs its own fade wrapper distinct from ColDisCom's own height animation. How: This renders ancHinEle inside a plain div that CSS cross-fades on interval change. */ }


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


					<div className={ cssModObj.forFieDiv }>{ /* What: Interval Field Div Element. Why: This groups the every-N-days control and its own anchor hint/visibility note as one schedule subsection. How: This renders the number input plus the shared anchor hint, always visible (unlike weekly/monthly/annual, which collapse it below N of 1). */ }


						<div className={ cssModObj.fieLabDiv }>{ /* What: Flabel Wrap Div Element. Why: The subsection's own label and live summary need to sit together. How: This wraps the plain label span and the (non-fading, since interval always shows the hint) summary span below. */ }


							<span className={ cssModObj.fieLabSpa }>Frequency</span>{ /* What: Flabel Span Element. Why: This is the subsection's own plain label. How: This renders the literal text "Frequency". */ }

							<span className={ cssModObj.fieSubSpa }>shows on the Today page <strong>every { tasRcdObj.interval || 1 } days</strong></span>{ /* What: Flabel Sub Span Element. Why: This is the plain cadence summary; interval has no alternate phrasing to fade between. How: This names tasRcdObj's own interval directly. */ }


						</div>

						<div className={ cssModObj.fieRowDiv }>{ /* What: Interval Inline Div Element. Why: The every-N-days number input reads best inline with its own surrounding words. How: This wraps the "Every", the number input, and the "days" label. */ }


							<span>Every</span>{ /* What: Every Span Element. Why: This is the inline control's own leading word. How: This renders the literal text "Every". */ }

							<input
								className={` ${ cssModObj.eveNumInp } `}

								max='365'
								min='1'
								type='number'
								value={ tasRcdObj.interval || 1 }

								aria-describedby={ schNotStr }
								aria-label='Interval in days'

								onChange={ ( chaEveObj ) => onPatTasFun( { interval : Math.max( 1, parseInt( chaEveObj.target.value ) || 1 ) } ) } // What: Interval Clamp Commit. Why: An empty or invalid number must never commit an interval below 1. How: This parses the typed value, falling back to 1 and clamping at 1.
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


					<div className={ cssModObj.forFieDiv }>{ /* What: Monthly Frequency Field Div Element. Why: This groups the every-N-months control and its own anchor hint as one schedule subsection. How: This renders the number input plus the shared anchor hint, collapsed until interval is above 1. */ }


						<div className={ cssModObj.fieLabDiv }>{ /* What: Flabel Wrap Div Element. Why: The subsection's own label and live summary need to sit together. How: This wraps the plain label span and the fading summary span below. */ }


							<span className={ cssModObj.fieLabSpa }>Frequency</span>{ /* What: Flabel Span Element. Why: This is the subsection's own plain label. How: This renders the literal text "Frequency". */ }

							<span
								key={ tasRcdObj.interval || 1 }

								className={` ${ cssModObj.fieSubSpa }   ${ cssModObj.fieSubSpaFading } `}
							>shows on the Today page <strong>every { ( tasRcdObj.interval || 1 ) > 1 ? `${ tasRcdObj.interval } months` : 'month' }</strong></span>{ /* What: Flabel Sub Span Element. Why: This is the live cadence summary, re-fading whenever interval changes. How: This picks between a plain "month" and an "every N months" phrase based on tasRcdObj's own interval. */ }


						</div>

						<div className={ cssModObj.fieRowDiv }>{ /* What: Monthly Inline Div Element. Why: The every-N-months number input reads best inline with its own surrounding words. How: This wraps the "Every", the number input, and the "month(s)" label. */ }


							<span>Every</span>{ /* What: Every Span Element. Why: This is the inline control's own leading word. How: This renders the literal text "Every". */ }

							<input
								className={` ${ cssModObj.eveNumInp } `}

								max='60'
								min='1'
								type='number'
								value={ tasRcdObj.interval || 1 }

								aria-describedby={ schNotStr }
								aria-label='Interval in months'

								onChange={ ( chaEveObj ) => onPatTasFun( { interval : Math.max( 1, parseInt( chaEveObj.target.value ) || 1 ) } ) } // What: Interval Clamp Commit. Why: An empty or invalid number must never commit an interval below 1. How: This parses the typed value, falling back to 1 and clamping at 1.
							/>{ /* What: Interval Number Input Element. Why: This is the actual every-N-months control. How: This clamps its own committed value to a minimum of 1 whole month. */ }

							<span>{ ( tasRcdObj.interval || 1 ) === 1 ? 'month' : 'months' }</span>{ /* What: Months Label Span Element. Why: This is the inline control's own trailing word, singular or plural to match the current interval. How: This picks between 'month' and 'months' based on tasRcdObj's own interval. */ }


						</div>



						<ColDisCom open={ ( tasRcdObj.interval || 1 ) > 1 }>{ /* What: Collapse Disclosure Component. Why: The counted-from hint is only meaningful once interval is above 1 month. How: This animates ancHinEle open only while that condition holds. */ }


							<div className={ cssModObj.ancFadDiv }>{ ancHinEle }</div>{ /* What: Anchor Fade Div Element. Why: The counted-from hint needs its own fade wrapper distinct from ColDisCom's own height animation. How: This renders ancHinEle inside a plain div that CSS cross-fades on interval change. */ }


						</ColDisCom>


					</div>


				) }


				{ curRepStr === 'monthly' && ( // What: Monthly Day Visibility Check. Why: This is the monthly kind's own second, independent subsection, targeting which day of the month. How: This renders it only while curRepStr is 'monthly', right after the frequency subsection above.


					<div className={ cssModObj.forFieDiv }>{ /* What: Monthly Day Field Div Element. Why: This groups the Date/Weekday mode toggle and its own detail controls as one schedule subsection. How: This renders SegConCom plus whichever detail row matches the current dateMode. */ }


						<div className={ cssModObj.fieLabDiv }>{ /* What: Flabel Wrap Div Element. Why: The subsection's own label and live summary need to sit together. How: This wraps the plain label span and the fading summary span below. */ }


							<span className={ cssModObj.fieLabSpa }>Day of the month</span>{ /* What: Flabel Span Element. Why: This is the subsection's own plain label. How: This renders the literal text "Day of the month". */ }

							<span
								key={ tasRcdObj.dateMode === 'nthWeekday' ? 'nthWeekday' : 'date' }

								className={` ${ cssModObj.fieSubSpa }   ${ cssModObj.fieSubSpaFading } `}
							>{ /* What: Flabel Sub Span Element. Why: This is the live summary of which day targeting mode is active, re-fading on mode switch. How: This renders one of the 2 branches below depending on tasRcdObj's own dateMode. */ }
								shows on the Today page <strong>{ tasRcdObj.dateMode === 'nthWeekday' // What: Date Mode Check. Why: The monthly target reads differently for each date mode. How: This picks the nth-weekday or plain-date phrase below based on dateMode.
									? <>on the { ordSufFun( tasRcdObj.nthOrdinal || 1 ) } { dayFulArr[ tasRcdObj.nthWeekday ?? 0 ] }</> // What: Nth-Weekday Summary Phrase. Why: In this mode the target reads as an ordinal weekday, e.g. "the 2nd Tuesday". How: This names tasRcdObj's own nthOrdinal and nthWeekday.
									: <>every { ordSufFun( tasRcdObj.dayOfMonth || 1 ) }</>                                             // What: Plain Date Summary Phrase. Why: In the default mode the target reads as a plain ordinal day, e.g. "every 15th". How: This names tasRcdObj's own dayOfMonth.
								} of the month</strong>
							</span>


						</div>



						<SegConCom
							layVarStr='snug' // What: Layout Variant String. Why: The two Day selection options should sit snug at their content's width instead of spreading across the field. How: SegConCom applies its snug layout for this value.
							optIteArr={ datModArr }
							value={ tasRcdObj.dateMode === 'nthWeekday' ? 'nthWeekday' : 'date' } // What: Date Mode Value. Why: An older task may carry no dateMode at all, which should read as the plain date mode. How: This maps anything other than 'nthWeekday' to 'date'.

							ariLabStr='Day selection'
							desIdeStr={ schNotStr }

							onChange={ ( modKeyStr ) => onPatTasFun( { dateMode : modKeyStr } ) }
						/>{ /* What: Segment Control Component. Why: This is the Date-vs-Weekday targeting mode toggle. How: This commits the clicked option's own key as tasRcdObj's new dateMode. */ }



						{ tasRcdObj.dateMode === 'nthWeekday' ? ( // What: Nth-Weekday Mode Check. Why: The monthly detail row's own shape depends on which date-targeting mode is selected. How: This renders the ordinal-plus-weekday selects while tasRcdObj.dateMode is 'nthWeekday', the plain day-of-month select otherwise.


							<div className={ cssModObj.fieRowDiv }>{ /* What: Nth-Weekday Inline Div Element. Why: This mode needs 2 selects (ordinal, weekday) read together as one sentence. How: This wraps the "On the" label and both selects below. */ }


								<span>On the</span>{ /* What: On-The Span Element. Why: This is the inline row's own leading words. How: This renders the literal text "On the". */ }

								<select
									className={` ${ cssModObj.ancPicSel } `}

									value={ tasRcdObj.nthOrdinal || 1 }

									aria-describedby={ schNotStr }
									aria-label='Week of the month'

									onChange={ ( chaEveObj ) => onPatTasFun( { nthOrdinal : parseInt( chaEveObj.target.value ) } ) }
								>{ /* What: Ordinal Select Element. Why: This is the "1st through 5th" occurrence picker. How: This commits the chosen option's own numeric value as tasRcdObj's new nthOrdinal. */ }


									{ [ 1, 2, 3, 4, 5 ].map( ( nthOptNum ) => ( // What: Ordinal Option List Render. Why: One option is needed per occurrence, 1st through 5th. How: This maps a literal 1-5 array to one option per entry, keyed by its own nthOptNum, labeled with its ordinal suffix.


										<option
											key={ nthOptNum }

											value={ nthOptNum }
										>{ ordSufFun( nthOptNum ) }</option> // What: Ordinal Option Element. Why: This is one choice in the select. How: This renders its own label, valued by its own value above.


									) ) }


								</select>

								<select
									className={` ${ cssModObj.ancPicSel } `}

									value={ tasRcdObj.nthWeekday ?? 0 }

									aria-describedby={ schNotStr }
									aria-label='Weekday'

									onChange={ ( chaEveObj ) => onPatTasFun( { nthWeekday : parseInt( chaEveObj.target.value ) } ) }
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


							<div className={ cssModObj.fieRowDiv }>{ /* What: Plain Date Inline Div Element. Why: The default mode only needs the single day-of-month select read alongside its own label. How: This wraps the "On the" label and the day select below. */ }


								<span>On the</span>{ /* What: On-The Span Element. Why: This is the inline row's own leading words. How: This renders the literal text "On the". */ }

								<select
									className={` ${ cssModObj.ancPicSel } `}

									value={ tasRcdObj.dayOfMonth || 1 }

									aria-describedby={ schNotStr }
									aria-label='Day of the month'

									onChange={ ( chaEveObj ) => onPatTasFun( { dayOfMonth : parseInt( chaEveObj.target.value ) } ) }
								>{ /* What: Day-Of-Month Select Element. Why: This is the plain 1-31 day picker for the default mode. How: This commits the chosen option's own numeric value as tasRcdObj's new dayOfMonth. */ }


									{ Array.from( Array( 31 ).keys(), ( arrIndNum ) => arrIndNum + 1 ).map( ( domValNum ) => ( // What: Day Of Month Option List Render. Why: One option is needed per possible day of month, 1 through 31. How: This maps a generated 1-31 array to one option per entry, keyed by its own domValNum.


										<option
											key={ domValNum }

											value={ domValNum }
										>{ ordSufFun( domValNum ) }</option> // What: Day-Of-Month Option Element. Why: One option is needed per possible day-of-month. How: This renders domValNum's own ordinal label.


									) ) }


								</select>


							</div>


						) }

						{ tasRcdObj.dateMode === 'nthWeekday' // What: Clamp Hint Mode Check. Why: Each date mode has its own clamp edge case to warn about. How: This picks the nth-weekday hint while dateMode is 'nthWeekday', the plain-date hint otherwise.
							? ( tasRcdObj.nthOrdinal || 1 ) === 5 && <p className={ cssModObj.fieHinPar }>In months without a 5th, this falls on the 4th instead.</p> // What: Nth-Weekday Clamp Hint. Why: A requested 5th occurrence doesn't exist in every month, so the user needs to know the real fallback rule. How: This renders only when nthOrdinal is exactly 5.
							: ( tasRcdObj.dayOfMonth || 1 ) > 28 && <p className={ cssModObj.fieHinPar }>In shorter months this falls on the last day.</p>            // What: Plain Date Clamp Hint. Why: A day past 28 doesn't exist in every month, so the user needs to know the real fallback rule. How: This renders only when dayOfMonth is past 28.
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


					<div className={ cssModObj.forFieDiv }>{ /* What: Annual Frequency Field Div Element. Why: This groups the every-N-years control and its own anchor hint as one schedule subsection. How: This renders the number input plus the shared anchor hint, collapsed until interval is above 1. */ }


						<div className={ cssModObj.fieLabDiv }>{ /* What: Flabel Wrap Div Element. Why: The subsection's own label and live summary need to sit together. How: This wraps the plain label span and the fading summary span below. */ }


							<span className={ cssModObj.fieLabSpa }>Frequency</span>{ /* What: Flabel Span Element. Why: This is the subsection's own plain label. How: This renders the literal text "Frequency". */ }

							<span
								key={ tasRcdObj.interval || 1 }

								className={` ${ cssModObj.fieSubSpa }   ${ cssModObj.fieSubSpaFading } `}
							>shows on the Today page <strong>every { ( tasRcdObj.interval || 1 ) > 1 ? `${ tasRcdObj.interval } years` : 'year' }</strong></span>{ /* What: Flabel Sub Span Element. Why: This is the live cadence summary, re-fading whenever interval changes. How: This picks between a plain "year" and an "every N years" phrase based on tasRcdObj's own interval. */ }


						</div>

						<div className={ cssModObj.fieRowDiv }>{ /* What: Annual Inline Div Element. Why: The every-N-years number input reads best inline with its own surrounding words. How: This wraps the "Every", the number input, and the "year(s)" label. */ }


							<span>Every</span>{ /* What: Every Span Element. Why: This is the inline control's own leading word. How: This renders the literal text "Every". */ }

							<input
								className={` ${ cssModObj.eveNumInp } `}

								max='50'
								min='1'
								type='number'
								value={ tasRcdObj.interval || 1 }

								aria-describedby={ schNotStr }
								aria-label='Interval in years'

								onChange={ ( chaEveObj ) => onPatTasFun( { interval : Math.max( 1, parseInt( chaEveObj.target.value ) || 1 ) } ) } // What: Interval Clamp Commit. Why: An empty or invalid number must never commit an interval below 1. How: This parses the typed value, falling back to 1 and clamping at 1.
							/>{ /* What: Interval Number Input Element. Why: This is the actual every-N-years control. How: This clamps its own committed value to a minimum of 1 whole year. */ }

							<span>{ ( tasRcdObj.interval || 1 ) === 1 ? 'year' : 'years' }</span>{ /* What: Years Label Span Element. Why: This is the inline control's own trailing word, singular or plural to match the current interval. How: This picks between 'year' and 'years' based on tasRcdObj's own interval. */ }


						</div>



						<ColDisCom open={ ( tasRcdObj.interval || 1 ) > 1 }>{ /* What: Collapse Disclosure Component. Why: The counted-from hint is only meaningful once interval is above 1 year. How: This animates ancHinEle open only while that condition holds. */ }


							<div className={ cssModObj.ancFadDiv }>{ ancHinEle }</div>{ /* What: Anchor Fade Div Element. Why: The counted-from hint needs its own fade wrapper distinct from ColDisCom's own height animation. How: This renders ancHinEle inside a plain div that CSS cross-fades on interval change. */ }


						</ColDisCom>


					</div>


				) }


				{ curRepStr === 'annual' && ( // What: Annual Date Visibility Check. Why: This is the annual kind's own second, independent subsection, targeting which date each year. How: This renders it only while curRepStr is 'annual', right after the frequency subsection above.


					<div className={ cssModObj.forFieDiv }>{ /* What: Annual Date Field Div Element. Why: This groups the Date/Weekday mode toggle and its own detail controls as one schedule subsection. How: This renders SegConCom plus whichever detail row matches the current dateMode. */ }


						<div className={ cssModObj.fieLabDiv }>{ /* What: Flabel Wrap Div Element. Why: The subsection's own label and live summary need to sit together. How: This wraps the plain label span and the fading summary span below. */ }


							<span className={ cssModObj.fieLabSpa }>Date each year</span>{ /* What: Flabel Span Element. Why: This is the subsection's own plain label. How: This renders the literal text "Date each year". */ }

							<span
								key={ tasRcdObj.dateMode === 'nthWeekday' ? 'nthWeekday' : 'date' }

								className={` ${ cssModObj.fieSubSpa }   ${ cssModObj.fieSubSpaFading } `}
							>{ /* What: Flabel Sub Span Element. Why: This is the live summary of which day targeting mode is active, re-fading on mode switch. How: This renders one of the 2 branches below depending on tasRcdObj's own dateMode. */ }
								shows on the Today page <strong>{ tasRcdObj.dateMode === 'nthWeekday' // What: Date Mode Check. Why: The yearly target reads differently for each date mode. How: This picks the nth-weekday or plain-date phrase below based on dateMode.
									? <>the { ordSufFun( tasRcdObj.nthOrdinal || 1 ) } { dayFulArr[ tasRcdObj.nthWeekday ?? 0 ] } of { monFulArr[ ( tasRcdObj.month || 1 ) - 1 ] }</> // What: Nth-Weekday Summary Phrase. Why: In this mode the target reads as an ordinal weekday within a named month, e.g. "the 2nd Tuesday of June". How: This names tasRcdObj's own nthOrdinal, nthWeekday, and month.
									: <>{ monFulArr[ ( tasRcdObj.month || 1 ) - 1 ] } { tasRcdObj.day || 1 }</>                                                                       // What: Plain Date Summary Phrase. Why: In the default mode the target reads as a plain month/day, e.g. "June 15". How: This names tasRcdObj's own month and day.
								}</strong>
							</span>


						</div>



						<SegConCom
							layVarStr='snug' // What: Layout Variant String. Why: The two Day selection options should sit snug at their content's width instead of spreading across the field. How: SegConCom applies its snug layout for this value.
							optIteArr={ datModArr }
							value={ tasRcdObj.dateMode === 'nthWeekday' ? 'nthWeekday' : 'date' } // What: Date Mode Value. Why: An older task may carry no dateMode at all, which should read as the plain date mode. How: This maps anything other than 'nthWeekday' to 'date'.

							ariLabStr='Day selection'
							desIdeStr={ schNotStr }

							onChange={ ( modKeyStr ) => onPatTasFun( { dateMode : modKeyStr } ) }
						/>{ /* What: Segment Control Component. Why: This is the Date-vs-Weekday targeting mode toggle. How: This commits the clicked option's own key as tasRcdObj's new dateMode. */ }



						{ tasRcdObj.dateMode === 'nthWeekday' ? ( // What: Nth-Weekday Mode Check. Why: The annual detail row's own shape depends on which date-targeting mode is selected. How: This renders the ordinal-plus-weekday-plus-month selects while tasRcdObj.dateMode is 'nthWeekday', the plain month-plus-day selects otherwise.


							<div className={ cssModObj.fieRowDiv }>{ /* What: Nth-Weekday Inline Div Element. Why: This mode needs 3 selects (ordinal, weekday, month) read together as one sentence. How: This wraps both selects, the "of" word, and the month select below. */ }


								<select
									className={` ${ cssModObj.ancPicSel } `}

									value={ tasRcdObj.nthOrdinal || 1 }

									aria-describedby={ schNotStr }
									aria-label='Week of the month'

									onChange={ ( chaEveObj ) => onPatTasFun( { nthOrdinal : parseInt( chaEveObj.target.value ) } ) }
								>{ /* What: Ordinal Select Element. Why: This is the "1st through 5th" occurrence picker. How: This commits the chosen option's own numeric value as tasRcdObj's new nthOrdinal. */ }


									{ [ 1, 2, 3, 4, 5 ].map( ( nthOptNum ) => ( // What: Ordinal Option List Render. Why: One option is needed per occurrence, 1st through 5th. How: This maps a literal 1-5 array to one option per entry, keyed by its own nthOptNum, labeled with its ordinal suffix.


										<option
											key={ nthOptNum }

											value={ nthOptNum }
										>{ ordSufFun( nthOptNum ) }</option> // What: Ordinal Option Element. Why: This is one choice in the select. How: This renders its own label, valued by its own value above.


									) ) }


								</select>

								<select
									className={` ${ cssModObj.ancPicSel } `}

									value={ tasRcdObj.nthWeekday ?? 0 }

									aria-describedby={ schNotStr }
									aria-label='Weekday'

									onChange={ ( chaEveObj ) => onPatTasFun( { nthWeekday : parseInt( chaEveObj.target.value ) } ) }
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
									className={` ${ cssModObj.ancPicSel } `}

									value={ tasRcdObj.month || 1 }

									aria-describedby={ schNotStr }
									aria-label='Month'

									onChange={ ( chaEveObj ) => onPatTasFun( { month : parseInt( chaEveObj.target.value ) } ) }
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


							<div className={ cssModObj.fieRowDiv }>{ /* What: Plain Date Inline Div Element. Why: The default mode needs a month select and a day select read together. How: This wraps both selects below. */ }


								<select
									className={` ${ cssModObj.ancPicSel } `}

									value={ tasRcdObj.month || 1 }

									aria-describedby={ schNotStr }
									aria-label='Month'

									onChange={ ( chaEveObj ) => onPatTasFun( { month : parseInt( chaEveObj.target.value ) } ) }
								>{ /* What: Month Select Element. Why: This is the target-month picker for the default mode. How: This commits the chosen option's own 1-indexed value as tasRcdObj's new month. */ }


									{ monAbbArr.map( ( monNamStr, monIndNum ) => ( // What: Month Option List Render. Why: One option is needed per month. How: This maps monAbbArr to one option per entry, keyed by its own monNamStr, valued by its own 1-indexed monIndNum.


										<option
											key={ monNamStr }

											value={ monIndNum + 1 }
										>{ monNamStr }</option> // What: Month Option Element. Why: This is one choice in the select. How: This renders its own label, valued by its own value above.


									) ) }


								</select>

								<select
									className={` ${ cssModObj.ancPicSel } `}

									value={ tasRcdObj.day || 1 }

									aria-describedby={ schNotStr }
									aria-label='Day'

									onChange={ ( chaEveObj ) => onPatTasFun( { day : parseInt( chaEveObj.target.value ) } ) }
								>{ /* What: Day Select Element. Why: This is the plain 1-31 day picker for the default mode. How: This commits the chosen option's own numeric value as tasRcdObj's new day. */ }


									{ Array.from( Array( 31 ).keys(), ( arrIndNum ) => arrIndNum + 1 ).map( ( domValNum ) => ( // What: Day Option List Render. Why: One option is needed per possible day of month, 1 through 31. How: This maps a generated 1-31 array to one option per entry, keyed by its own domValNum.


										<option
											key={ domValNum }

											value={ domValNum }
										>{ domValNum }</option> // What: Day Option Element. Why: One option is needed per possible day-of-month. How: This renders domValNum's own plain numeric label, unlike the ordinal label the monthly subsection uses.


									) ) }


								</select>


							</div>


						) }

						{ tasRcdObj.dateMode === 'nthWeekday' && ( tasRcdObj.nthOrdinal || 1 ) === 5 && ( // What: Nth-Weekday Clamp Hint Check. Why: A requested 5th occurrence doesn't exist in every year for a given month, so the user needs to know the real fallback rule. How: This renders the hint only when both conditions hold.


							<p className={ cssModObj.fieHinPar }>In years where that month has no 5th, this falls on the 4th instead.</p> // What: Nth-Weekday Clamp Hint Element. Why: A requested 5th occurrence doesn't exist in every year for a given month, so the user needs to know the real fallback rule. How: This renders only when the Clamp Hint Check above holds.


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


		<div
			className={` ${ cssModObj.schEdiDiv }   ${ layVarStr === 'stacked' ? cssModObj.schEdiDivStacked : '' }   ${ layVarStr === 'rows' ? cssModObj.schEdiDivRows : '' } `}

			data-element-name-hook='schEdiDiv'
		>{ /* What: Reminder Editor Div Element. Why: This is SchEdiCom's own root element, holding the Repeat row and whichever detail subsection currently applies. How: This renders the Repeat row, then either oncFieEle or extFieEle based on tasRcdObj's own repeat. Its data-element-name-hook is read by help mode's Today catalog and help mode's Data catalog. */ }


			<div className={ cssModObj.forFieDiv }>{ /* What: Repeat Field Div Element. Why: The Repeat control is its own schedule subsection, always shown regardless of which kind is selected. How: This renders the segmented control plus its own live summary and visibility note. */ }


				<div className={ cssModObj.fieLabDiv }>{ /* What: Flabel Wrap Div Element. Why: The subsection's own label and live summary need to sit together. How: This wraps the plain label span and the fading summary span below. */ }


					<span className={ cssModObj.fieLabSpa }>Repeat</span>{ /* What: Flabel Span Element. Why: This is the subsection's own plain label. How: This renders the literal text "Repeat". */ }

					<span
						key={ tasRcdObj.repeat }

						className={` ${ cssModObj.fieSubSpa }   ${ cssModObj.fieSubSpaFading } `}
					>{ ( REP_OPT_ARR.find( ( optConObj ) => optConObj.keyStr === tasRcdObj.repeat ) || {} ).subEle }</span>{ /* What: Flabel Sub Span Element. Why: This is the live sub-explanation matching the currently-selected repeat kind. How: This looks up REP_OPT_ARR by tasRcdObj's own repeat and renders that entry's own subEle. */ }


				</div>



				<SegConCom
					layVarStr='grid' // What: Layout Variant String. Why: Repeat's five options wrap on a narrow screen and must line up in columns. How: SegConCom applies its grid layout for this value.
					optIteArr={ REP_OPT_ARR }
					value={ tasRcdObj.repeat }

					ariLabStr='Repeat'
					desIdeStr={ repNotStr }

					onChange={ ( modKeyStr ) => onPatTasFun({ // What: Repeat Change Handler. Why: interval is shared across interval/weekly/monthly/annual (each its own "every N ___"), so switching kind resets it to that kind's own sensible default instead of carrying over a number that meant something else a moment ago. How: This commits the new repeat kind plus a matching default interval.


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



			{ aniExtBoo ? ( // What: Animated Once Fields Branch. Why: A caller that opted into animation needs the once-fields subsection to grow/shrink instead of snapping. How: This wraps oncFieEle in ColDisCom, open only while repeat is 'once'.


				<ColDisCom open={ tasRcdObj.repeat === 'once' }>{ /* What: Collapse Disclosure Component. Why: A caller that opted into animation needs the once-fields subsection to grow/shrink instead of snapping. How: This wraps oncFieEle, open only while repeat is 'once'. */ }


					<div
						className={ cssModObj.remExtDiv }

						data-element-name-hook='remExtDiv'
					>{ oncFieEle }</div>{ /* What: Extra Fade Div Element. Why: The once fields share the extra-fields subsection's own fade wrapper. How: This wraps oncFieEle inside the collapse. Its data-element-name-hook is read by the reminder mini-tours. */ }


				</ColDisCom>


			) : ( // What: Plain Once Fields Branch. Why: A caller that didn't opt into animation just needs oncFieEle shown or hidden outright. How: This renders oncFieEle directly, with no ColDisCom wrapper, only while repeat is 'once'.


				tasRcdObj.repeat === 'once' && oncFieEle // What: Once Fields Check. Why: The one-time fields only belong with a one-time reminder. How: This renders oncFieEle only while the repeat kind is once.


			) }



			{ aniExtBoo ? ( // What: Animated Extra Fields Branch. Why: A caller that opted into animation needs the extra-fields subsection to grow/shrink, and to re-key on kind switch so its own internal ColDisCom states reset cleanly. How: This wraps extFieEle in ColDisCom, open whenever repeat isn't 'once', keyed by curRepStr.


				<ColDisCom open={ tasRcdObj.repeat !== 'once' }>{ /* What: Collapse Disclosure Component. Why: A caller that opted into animation needs the extra-fields subsection to grow/shrink instead of snapping. How: This wraps extFieEle, open whenever repeat isn't 'once'. */ }


					<div
						key={ tasRcdObj.repeat === 'once' ? lasExtRef.current : tasRcdObj.repeat } // What: Extra Kind Key. Why: A genuine kind switch should remount the subsection, but collapsing back to 'once' should not. How: This keys on the remembered last kind while repeat is 'once', the real repeat otherwise.

						className={ cssModObj.remExtDiv }

						data-element-name-hook='remExtDiv'
					>{ extFieEle }</div>{ /* What: Extra Fade Div Element. Why: The extra-fields subsection needs to re-key on a genuine kind switch, so its own internal ColDisCom states reset cleanly instead of carrying over stale open/closed state. How: This keys on lasExtRef's own remembered kind while collapsing back to 'once', otherwise the task's own real repeat. Its data-element-name-hook is read by the reminder mini-tours. */ }


				</ColDisCom>


			) : ( // What: Plain Extra Fields Branch. Why: A caller that didn't opt into animation just needs extFieEle shown or hidden outright, which it already does internally via its own curRepStr checks. How: This renders extFieEle directly, with no ColDisCom wrapper.


				extFieEle


			) }


		</div>


	);


}

// #endregion SchEdiCom

// #endregion Components



// #region Exports

export { SchEdiCom }; // What: Named Export. Why: Today's reminders section and the Data tab's reminder manager both edit reminders with it. How: This exports SchEdiCom by name; VisNotCom, reaPhrFun, and REP_OPT_ARR stay private to this file.

// #endregion Exports


