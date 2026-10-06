


// #region Imports

import cssModObj from './day-log.module.css'; // What: CSS Module Object. Why: The Day Log's own styles live in its module. How: Each className reads its hashed class from here.
import React     from 'react';                // What: React. Why: This is the UI library every component in this file is built on. How: This is used directly (React.useState, React.Fragment) throughout, instead of importing individual named hooks.


import { CAD_NAM_OBJ } from '../../core/cadence.ts';      // What: Cadence Namespace Object. Why: An ease-mode item's subline needs CAD_NAM_OBJ.uniWorFun to phrase its range in the picker's own cadence unit (days/weeks/months/years) instead of always "days". How: This is called once inside iteSubFun below.
import { ColDisCom   } from '../../ui/collapse.tsx';      // What: Collapse Disclosure Component. Why: PicBloCom's own item table only needs to exist in the DOM while its block is actually expanded. How: This wraps that table, driven by PicBloCom's own open/closed state.
import { CON_NAM_OBJ } from '../../core/conditionals.ts'; // What: Conditional Namespace Object. Why: ConSecCom needs CON_NAM_OBJ.modValFun to know whether a given conditional's own mode even has a value to show. How: This is called once per conditional row inside ConSecCom below.
import { InfTipCom   } from '../../ui/info-tip.tsx';      // What: Info Tip Component. Why: Every truncatable name/label in this file (item, conditional, reminder) needs the shared reveal-on-truncation tooltip. How: This wraps those names/labels throughout PicBloCom, ConSecCom and RemLogCom.
import { isoDayFun   } from '../../utils/date.ts';        // What: Iso Day Function. Why: Dates are stored and compared as local-calendar YYYY-MM-DD keys. How: This formats a Date (or now) as that key.
import { SED_NAM_OBJ } from '../../state/seed.ts';        // What: Seed Namespace Object. Why: PicBloCom and ConSecCom label a mode with the same display names the mode radios use. How: This reads MOD_DEF_OBJ's own labStr for a picker's or conditional's mode.
import { TAS_NAM_OBJ } from '../../core/tasks.ts';        // What: Tasks Namespace Object. Why: RemLogCom needs the reminders engine's own scheduling helpers (ancDatFun, visTodFun, isaDonFun, nexEliFun, sumTasFun). How: These are called throughout RemLogCom below.
import { THR_VAL_NUM } from '../../constants.ts';         // What: Threshold Value Number. Why: Ease day-range math in this file divides by the shared full-charge ceiling. How: This is divided by an item's own easeMin/easeMax wherever a drift-to-days conversion happens.


import type { ConRcdTyp } from '../../core/data-model.ts'; // What: Conditional Record Type. Why: The log describes each conditional gating a group. How: This types conSubFun's conRcdObj.
import type { IteRcdTyp } from '../../core/data-model.ts'; // What: Item Record Type. Why: The log describes each picker's items. How: This types iteSubFun's iteRcdObj.
import type { PclRowTyp } from '../../core/data-model.ts'; // What: Pick-Log Row Type. Why: Item flags come from today's pick log rows. How: This types dayFlaFun's picLogArr.
import type { PicRcdTyp } from '../../core/data-model.ts'; // What: Picker Record Type. Why: The log is organized by picker. How: This types the pickers its helpers and blocks read.
import type { StaAppTyp } from '../../core/data-model.ts'; // What: State App Type. Why: The log panels read the logs, pickers, and reminders in the app state. How: This types their staAppObj.

// #endregion Imports



/**
 * day-log.tsx = Day Log
 *
 * @summary
 * A per-group, today-only audit of what the generator did, surfaced by
 * a "Log" chip on each group title (and the Reminders title). The
 * panel shows, per picker, a table of every item's value at generation
 * versus after, plus status icons derived from the pick log
 * (auto-picked, pushed, rolled off, skipped, completed). Conditionals
 * attached to the group's pickers get their own blue section (same row
 * shape, a Triggered/Not-triggered pill, and a strip listing the
 * pickers they affect). Reminders get a schedule-based log instead.
 *
 * All picker-event data already lives in state.pickLog (source:
 * auto/manual/reroll, outcome: rejected/skipped, done). The only
 * capture added for this feature is the per-generation value snapshot
 * at state.today.genLog.
 *
 * Sections:
 *  - Types
 *  - Helpers
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Types

type IteFlaTyp = { anyBoo : boolean, autBoo : boolean, comBoo : boolean, pusBoo : boolean, rolBoo : boolean, skiBoo : boolean }; // What: Item Flags Type. Why: Each item's row shows status chips for what happened to it today. How: This types the flags dayFlaFun builds and StaChiCom reads, each true once a pick log row sets it.

// #endregion Types



// #region Helpers

// #region conSubFun

/**
 * conSubFun = Conditional Subline Function
 *
 * @summary
 * Computes a conditional's own subline text: a soonest-latest day
 * range for ease modes, an odds percentage for dynamic/weighted, or a
 * flat "50% odds" for random.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param conRcdObj - Conditional Record Object: The conditional record itself.
 *
 * @returns The conditional's own subline string.
 *
 * @example
 * ```ts
 * conSubFun(conRcdObj) // => subline string
 * ```
 *
*/

function conSubFun ( conRcdObj : ConRcdTyp ) : string {


	if ( conRcdObj.mode === 'ease-up' || conRcdObj.mode === 'ease-down' ) { // What: Ease Mode Branch. Why: Both ease modes phrase their own subline as a soonest-latest day range. How: This computes that range from conRcdObj's own threshold/ease-min/ease-max.


		const thrValNum = conRcdObj.threshold ?? THR_VAL_NUM;                                          // What: Threshold Value Number. Why: This conditional's own range is relative to its own threshold, falling back to the shared default. How: This reads conRcdObj's own threshold, or THR_VAL_NUM when it has none set.
		const sooDayNum = Math.max( 1, Math.round( thrValNum / ( conRcdObj.easeMax ?? 14 ) ) );        // What: Soonest Day Number. Why: This is the earliest day count the range can show. How: This divides thrValNum by conRcdObj's own easeMax (or 14), floored at 1 whole day.
		const latDayNum = Math.max( sooDayNum, Math.round( thrValNum / ( conRcdObj.easeMin ?? 7 ) ) ); // What: Latest Day Number. Why: This is the latest day count the range can show, never earlier than sooDayNum. How: This divides thrValNum by conRcdObj's own easeMin (or 7), floored at sooDayNum itself.



		return `range ${ sooDayNum }–${ latDayNum } days`; // What: Ease Range Return. Why: The caller needs the final range string back. How: This joins sooDayNum and latDayNum with an en dash between them.


	}



	if ( conRcdObj.mode === 'dynamic' ) return `${ conRcdObj.oddsPct ?? 50 }%+ odds`; // What: Dynamic Mode Return. Why: Dynamic odds are a floor rather than a fixed value. How: This reads conRcdObj's own oddsPct, defaulting to 50, with a trailing "+" to signal it only ever climbs.



	if ( conRcdObj.mode === 'weighted' ) return `${ conRcdObj.oddsPct ?? 50 }% odds`; // What: Weighted Mode Return. Why: Weighted odds are a fixed value, unlike dynamic's floor. How: This reads conRcdObj's own oddsPct, defaulting to 50.



	return '50% odds'; // What: Random Mode Return. Why: Random mode always runs at a flat 50/50. How: This is the final fallback once neither the ease, dynamic nor weighted branches above matched.


}

// #endregion conSubFun



// #region dayFlaFun

/**
 * dayFlaFun = Day Flags Function
 *
 * @summary
 * Builds a per-item status-flags map for one picker on one day, purely
 * derived from state.pickLog's own rows (never mutated). Every row
 * matching this picker/day contributes to its own item's flags: auto
 * for an auto-picked row, pushed for a manual/reroll row, rolled off or
 * skipped from the row's own outcome, and completed once a row is
 * marked done.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param picLogArr - Picker Log Array: The full state.pickLog array to scan.
 * @param picIdeStr - Picker Identifier String: Which picker's own rows to
 *                    keep.
 * @param dayKeyStr - Day Key String: Which day's own rows to keep, as a
 *                    "YYYY-MM-DD" key from {@link isoDayFun}.
 *
 * @returns A Map from itemId to its own { anyBoo, autBoo, comBoo,
 * pusBoo, rolBoo, skiBoo } flags.
 * @see {@link iteFlaMap}
 *
 * @example
 * ```ts
 * dayFlaFun(picLogArr, picIdeStr, dayKeyStr) // => iteFlaMap
 * ```
 *
*/

function dayFlaFun ( picLogArr : PclRowTyp[], picIdeStr : string, dayKeyStr : string ) : Map< string, IteFlaTyp > {


	const iteFlaMap = new Map< string, IteFlaTyp >(); // What: Item Flags Map. Why: Every matching row below folds into this same per-item accumulator. How: This starts empty and is populated by the loop below, keyed by itemId.


	for ( const logRowObj of ( picLogArr || [] ) ) { // What: Pick Log Row Loop. Why: Every row in picLogArr is a candidate contribution to iteFlaMap. How: This walks picLogArr (or an empty array when it's missing), skipping any row that isn't for this exact picker/day.


		if ( logRowObj.date !== dayKeyStr || logRowObj.pickerId !== picIdeStr ) continue; // What: Wrong Picker Or Day Guard. Why: Only a row for this exact picker on this exact day belongs in the result at all. How: This skips the rest of this iteration otherwise.



		let iteFlaObj = iteFlaMap.get( logRowObj.itemId ); // What: Item Flags Object. Why: Every row for the same item must fold into the same flags object, not a fresh one each time. How: This reads whatever iteFlaMap already has for logRowObj's own itemId, if anything.


		if ( !iteFlaObj ) { // What: First Row Guard. Why: The very first matching row for an item must create its own fresh flags object. How: This builds and registers a new, all-false iteFlaObj only when none exists yet.


			iteFlaObj = { anyBoo : false, autBoo : false, comBoo : false, pusBoo : false, rolBoo : false, skiBoo : false }; // What: Fresh Item Flags Object. Why: Every flag starts false until a real row below sets it. How: This is the initial shape stored into iteFlaMap for a newly-seen item.

			iteFlaMap.set( logRowObj.itemId, iteFlaObj ); // What: Item Flags Register Call. Why: Every later row for this same item must find and reuse this exact object. How: This stores iteFlaObj under logRowObj's own itemId.


		}



		iteFlaObj.anyBoo = true; // What: Any Flag Set. Why: The caller needs to distinguish "genuinely no rows" from "rows exist but none of the specific flags below fired". How: This is set true the moment any row at all matched.


		if ( logRowObj.source === 'auto' ) iteFlaObj.autBoo = true; // What: Auto Flag Set. Why: An auto-sourced row means the generator picked this item on its own. How: This flips autBoo true when logRowObj's own source is 'auto'.



		if ( logRowObj.source === 'manual' || logRowObj.source === 'reroll' ) iteFlaObj.pusBoo = true; // What: Pushed Flag Set. Why: A manual or reroll row means a person pushed/rerolled this item onto Today. How: This flips pusBoo true when logRowObj's own source is either 'manual' or 'reroll'.



		if ( logRowObj.outcome === 'rejected' ) iteFlaObj.rolBoo = true; // What: Rolled Off Flag Set. Why: A rejected outcome means this item's own value rolled off without being completed. How: This flips rolBoo true when logRowObj's own outcome is 'rejected'.

		else if ( logRowObj.outcome === 'skipped' ) iteFlaObj.skiBoo = true; // What: Skipped Flag Set. Why: A skipped outcome is a distinct status from a rejected one. How: This flips skiBoo true when logRowObj's own outcome is 'skipped'.

		else if ( logRowObj.done ) iteFlaObj.comBoo = true; // What: Completed Flag Set. Why: A done row (neither rejected nor skipped) means this item was actually completed. How: This flips comBoo true when logRowObj's own done field is truthy.


	}



	return iteFlaMap; // What: Item Flags Map Return. Why: The caller needs the fully-populated map back. How: This returns iteFlaMap directly.


}

// #endregion dayFlaFun



// #region forDueFun

/**
 * forDueFun = Format Due Function
 *
 * @summary
 * Phrases a not-yet-due reminder's own next occurrence as a short
 * relative label ("Due tomorrow", "Due in N days") or, past 2 weeks
 * out, a plain calendar date.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param dueDatObj - Due Date Object: The next occurrence Date, or
 *                    null/undefined when there is none upcoming at all.
 * @param dayKeyStr - Day Key String: Today's own "YYYY-MM-DD" key, used as the
 *                    reference point dueDatObj is measured against.
 *
 * @returns A short due-date label string.
 *
 * @example
 * ```ts
 * forDueFun(dueDatObj, dayKeyStr) // => due label string
 * ```
 *
*/

function forDueFun ( dueDatObj : Date | null, dayKeyStr : string ) : string {


	if ( !dueDatObj ) return 'No upcoming'; // What: No Upcoming Guard. Why: A reminder with no real next occurrence at all needs its own plain label. How: This returns immediately when dueDatObj is falsy.



	const [ yeaValNum, monValNum, domValNum ] = dayKeyStr.split( '-' ).map( Number ); // What: Reference Date Parts. Why: The midnight-stripped reference date below needs its own year/month/day numbers. How: This splits dayKeyStr on its dashes and parses each part as a Number.

	const curMidObj = new Date( yeaValNum, monValNum - 1, domValNum );                                // What: Current Midnight Object. Why: The day-count below must compare 2 midnights, not 2 arbitrary times of day. How: This builds a local Date at midnight from yeaValNum/monValNum/domValNum.
	const dueMidObj = new Date( dueDatObj.getFullYear(), dueDatObj.getMonth(), dueDatObj.getDate() ); // What: Due Midnight Object. Why: The day-count below must compare 2 midnights, not 2 arbitrary times of day. How: This builds a local Date at midnight from dueDatObj's own year/month/day.
	const dayDifNum = Math.round( ( dueMidObj.getTime() - curMidObj.getTime() ) / 86400000 );         // What: Day Difference Number. Why: The branches below phrase their own label from a whole day count, not a raw millisecond difference. How: This subtracts curMidObj from dueMidObj and divides by the number of milliseconds in a day.


	if ( dayDifNum <= 1 ) return 'Due tomorrow'; // What: Due Tomorrow Return. Why: 0 or 1 day out reads better as "tomorrow" than a bare day count. How: This returns once dayDifNum falls at or below 1.



	if ( dayDifNum <= 13 ) return `Due in ${ dayDifNum } days`; // What: Due In Days Return. Why: Up to 2 weeks out still reads well as a relative count. How: This returns once dayDifNum falls at or below 13.



	return 'Due ' + dueDatObj.toLocaleDateString( 'en-US', { day : 'numeric', month : 'short' } ); // What: Due Date Return. Why: Further out than 2 weeks reads better as a plain calendar date than a large day count. How: This formats dueDatObj as e.g. "Due Jun 12".


}

// #endregion forDueFun



const forTimFun = ( isoTimStr : string ) => { // What: Format Time Function. Why: Both GroLogCom's kicker needs a plain "3:42 PM" style time for when the day was generated. How: This builds a Date from isoTimStr and formats it via toLocaleTimeString, swallowing an invalid input as an empty string.


	try { return new Date( isoTimStr ).toLocaleTimeString( [], { hour : 'numeric', minute : '2-digit' } ); } // What: Format Attempt. Why: An otherwise-valid isoTimStr should render as a plain local time. How: This builds a Date from isoTimStr and formats it with no seconds.

	catch ( errCatObj ) { return ''; } // What: Format Error Guard. Why: A missing/invalid isoTimStr must not crash whichever caller invoked this. How: This returns an empty string instead of letting the error propagate.


};



const hasValFun = ( picModStr : string ) => { // What: Has Value Function. Why: PicBloCom and ValCelCom both need to know whether a picker's own mode tracks a numeric value at all, since random/weighted modes have nothing to show in the At-generation/After columns. How: This is called with a picker's own mode string.


	const easUpwBoo = picModStr === 'ease-up';   // What: Ease Upward Boolean. Why: This mode is one of the 3 that track a numeric value. How: This checks picModStr against the literal 'ease-up' mode key.
	const easDowBoo = picModStr === 'ease-down'; // What: Ease Down Boolean. Why: This mode is one of the 3 that track a numeric value. How: This checks picModStr against the literal 'ease-down' mode key.
	const dynModBoo = picModStr === 'dynamic';   // What: Dynamic Mode Boolean. Why: This mode is one of the 3 that track a numeric value. How: This checks picModStr against the literal 'dynamic' mode key.

	const hasValBoo = easUpwBoo || easDowBoo || dynModBoo; // What: Has Value Boolean. Why: The caller only needs one combined answer, not the 3 individual mode checks. How: This is true whenever any one of the 3 value-tracking modes matched.



	return hasValBoo; // What: Has Value Return. Why: The caller needs the combined answer back. How: This returns hasValBoo directly.


};



// #region iteSubFun

/**
 * iteSubFun = Item Subline Function
 *
 * @summary
 * Computes an item's own subline text (or, for dynamic mode, a small
 * mixed text/JSX fragment): a weight for weighted/dynamic modes, a
 * soonest-latest day range for ease modes, or "no weight" for random.
 * Dynamic also appends its own boost, the drift value added to the
 * base weight for today's roll (effective weight = weight + boost,
 * see pickers.ts), shown in the same green as a positive delta since
 * it carries the same quantity the value columns track. "(+0)" is
 * shown explicitly, since a blank there would read as broken rather
 * than as "no boost", but in muted grey like a flat delta so zero
 * doesn't compete visually with a real boost.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param picRcdObj - Picker Record Object: The item's own picker record.
 * @param iteRcdObj - Item Record Object: The item record itself.
 * @param booValNum - Boost Value Number: This item's own at-generation boost
 *                    snapshot (dynamic mode only), or null when not
 *                    applicable.
 *
 * @returns The item's own subline, as either a plain string or a
 * small React.Fragment.
 *
 * @example
 * ```ts
 * iteSubFun(picRcdObj, iteRcdObj, booValNum) // => subline content
 * ```
 *
*/

function iteSubFun ( picRcdObj : PicRcdTyp, iteRcdObj : IteRcdTyp, booValNum : number | null ) : React.ReactNode {


	const picModStr = picRcdObj.mode; // What: Picker Mode String. Why: Every branch below decides its own subline shape from this same picker mode. How: This reads picRcdObj's own mode once for reuse throughout.


	if ( picModStr === 'dynamic' ) { // What: Dynamic Mode Branch. Why: Dynamic is the only mode that also shows a boost alongside its own weight. How: See the design-rationale block above for the full boost/weight relationship.


		const booRouNum = booValNum == null ? null : Math.round( booValNum ); // What: Boost Rounded Number. Why: A raw drift value can carry fractional cycles; only the rounded whole number is ever shown. How: This rounds booValNum, staying null when there is no snapshot at all.



		return (


			<React.Fragment>{ /* What: Dynamic Subline Fragment Element. Why: This item's own subline needs both a plain weight string and an optional boost span, without an extra wrapping DOM element. How: This renders the weight text, then booRouNum's own boost span when it isn't null. */ }


				{ `weight ${ iteRcdObj.weight ?? 1 }` }{ /* What: Weight Text. Why: Every dynamic item still shows its own base weight first. How: This renders iteRcdObj's own weight, defaulting to 1 for an older item with none set. */ }

				{ booRouNum == null ? null : ( // What: Boost Span Visibility Check. Why: A boost is only ever known at generation time, not for a manually-added item with no snapshot. How: This renders the "(+N)" boost span, muted via data-boost-zero-active when booRouNum is exactly 0.


					<span
						className={ cssModObj.booValSpa }

						data-boost-zero-active={ !booRouNum || undefined } // What: Boost Zero Active Attribute. Why: No boost reads faint. How: This sets the presence-only attribute while booRouNum is 0.
					> (+{ booRouNum })</span> // What: Boost Span Element. Why: A dynamic item's boost shows beside its weight. How: This renders booRouNum in parentheses, faint when it's zero.


				) }


			</React.Fragment>


		);


	}



	if ( picModStr === 'weighted' ) return `weight ${ iteRcdObj.weight ?? 1 }`; // What: Weighted Mode Return. Why: A weighted item's subline is just its own plain weight. How: This reads iteRcdObj's own weight, defaulting to 1 for an older item with none set.



	if ( picModStr === 'ease-up' || picModStr === 'ease-down' ) { // What: Ease Mode Branch. Why: Both ease modes phrase their own subline as a soonest-latest day range instead of a weight. How: This computes that range from iteRcdObj's own (or picRcdObj's own) ease-min/ease-max.


		const easMinNum = iteRcdObj.easeMin ?? picRcdObj.easeMin ?? 1;                                                                             // What: Ease Min Number. Why: The range below needs this item's own effective ease-min, falling back to its picker's own. How: This reads iteRcdObj's own easeMin, then picRcdObj's own, then 1.
		const easMaxNum = iteRcdObj.easeMax ?? picRcdObj.easeMax ?? 1;                                                                             // What: Ease Max Number. Why: The range below needs this item's own effective ease-max, falling back to its picker's own. How: This reads iteRcdObj's own easeMax, then picRcdObj's own, then 1.
		const sooDayNum = Math.max( 1, Math.round( THR_VAL_NUM / easMaxNum ) );                                                                    // What: Soonest Day Number. Why: This is the earliest day count the range can show. How: This divides THR_VAL_NUM by easMaxNum, floored at 1 whole day.
		const latDayNum = Math.max( sooDayNum, Math.round( THR_VAL_NUM / easMinNum ) );                                                            // What: Latest Day Number. Why: This is the latest day count the range can show, never earlier than sooDayNum. How: This divides THR_VAL_NUM by easMinNum, floored at sooDayNum itself.
		const uniWorStr = ( picRcdObj.cadence && picRcdObj.cadence !== 'daily' ) ? CAD_NAM_OBJ.uniWorFun( picRcdObj.cadence, latDayNum ) : 'days'; // What: Unit Word String. Why: A non-daily cadence needs its own scaled unit word (e.g. "weeks") instead of always "days". How: This calls CAD_NAM_OBJ.uniWorFun for a real non-daily cadence, otherwise falls back to the literal word "days".



		return `range ${ sooDayNum }–${ latDayNum } ${ uniWorStr }`; // What: Ease Range Return. Why: The caller needs the final range string back. How: This joins sooDayNum, latDayNum and uniWorStr with an en dash between the two numbers.


	}



	return 'no weight'; // What: No Weight Return. Why: Random mode has no weight or range to show at all. How: This is the final fallback once neither the dynamic, weighted nor ease branches above matched.


}

// #endregion iteSubFun

// #endregion Helpers



// #region Components

type IecProTyp = { className? : string, icoKeyStr : string, strWidNum? : number }; // What: Icon-Set-Component Props Type. Why: A status icon draws one named shape, optionally styled and stroked by its parent. How: This types IcoSetCom's props, named Iec since Isc already belongs to another component.

// #region IcoSetCom

/**
 * IcoSetCom = Icon Set Component
 *
 * @summary
 * A small self-contained icon renderer, deliberately independent of
 * icon.tsx's own IcoSvgCom so this whole log panel never depends on
 * the app-wide icon set changing shape underneath it.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.className - Class Name: A class from the parent's own module
 *                          that sizes or colors this icon where it sits.
 * @param props.icoKeyStr - Icon Key String: Which shape to render; looked up
 *                          in this component's own isePatObj.
 * @param props.strWidNum - String Width Number: The SVG stroke width,
 *                          defaulting to 2.
 *
 * @returns This component's own single rendered svg element.
 *
 * @example
 * ```tsx
 * IcoSetCom({ className, icoKeyStr, strWidNum }) // => <IcoSetCom />
 * ```
 *
*/

function IcoSetCom ( { className, icoKeyStr, strWidNum = 2 } : IecProTyp ) : React.JSX.Element {


	const isePatObj : Record< string, React.JSX.Element > = { // What: Icon-Shape-Element Path Object. Why: This is the lookup table mapping every icon key this file uses to its own inline SVG shape markup. How: This is indexed below by icoKeyStr to pick which shape the rendered svg actually draws.


		braEle : <><path d='M4 4v10a4 4 0 0 0 4 4h12' /><path d='m16 14 4 4-4 4' /></>,                                                  // What: Branch Element. Why: This marks the strip listing which pickers a conditional affects. How: This draws a branching arrow shape.
		cheEle : <><path d='M20 6 9 17l-5-5' /></>,                                                                                      // What: Check Element. Why: This marks a completed status. How: This draws a single checkmark stroke.
		chvEle : <><path d='m6 9 6 6 6-6' /></>,                                                                                         // What: Chevron Element. Why: This marks PicBloCom's own expand/collapse toggle. How: This draws a plain downward chevron, keyed chvEle (escalated past the usual che truncation, since that collides with cheEle just above, per the Naming-conflict resolution rule).
		clcEle : <><path d='M12 8v4l3 3' /><circle cx='12' cy='12' r='9' /></>,                                                          // What: Clock Element. Why: This marks RemLogCom's own kicker. How: This draws a plain clock face, keyed clcEle (escalated past the usual clo truncation, since clo already heavily means Close throughout this codebase, per the Naming-conflict resolution rule).
		logEle : <><path d='M3 5h18M3 12h18M3 19h18' /></>,                                                                              // What: Log Element. Why: This marks the LogChiCom toggle and every panel's own kicker. How: This draws 3 stacked horizontal lines.
		mooEle : <><path d='M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z' /></>,                                                                   // What: Moon Element. Why: This marks a picker resting today under a triggered conditional. How: This draws a crescent moon shape.
		pusEle : <><path d='M12 19V5M5 12l7-7 7 7' /></>,                                                                                // What: Push Element. Why: This marks a manually pushed/rerolled status. How: This draws an upward arrow.
		rolEle : <><path d='M3 2v6h6' /><path d='M3 8a9 9 0 1 0 3-5' /></>,                                                              // What: Roll Element. Why: This marks a rolled-off status. How: This draws a counter-clockwise arrow.
		shuEle : <><path d='M16 3h5v5' /><path d='M4 20 21 3' /><path d='M21 16v5h-5' /><path d='m15 15 6 6' /><path d='m4 4 5 5' /></>, // What: Shuffle Element. Why: This marks an auto-picked status. How: This draws a pair of crossing shuffle-style arrows.
		xEle   : <><path d='M18 6 6 18M6 6l12 12' /></>                                                                                  // What: X Element. Why: This marks a skipped status, and a close button. How: This draws a plain X shape.


	};

	const icoShaEle = isePatObj[ icoKeyStr ]; // What: Icon Shape Element. Why: This is the single shape the svg below actually renders. How: This reads isePatObj's own entry for icoKeyStr.



	return (


		<svg
			className={ className }

			fill='none'
			stroke='currentColor'
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth={ strWidNum }
			viewBox='0 0 24 24'

			aria-hidden='true'
		>{ /* What: Icon Shape Svg Element. Why: This is IcoSetCom's own single rendered element, sized and stroked identically for every glyph. How: This renders whichever shape icoShaEle resolves to. */ }


			{ icoShaEle }


		</svg>


	);


}

// #endregion IcoSetCom



type ShcProTyp = { iteFlaObj : IteFlaTyp | undefined }; // What: Status-Chip-Component Props Type. Why: An item's status chips show what happened to it today. How: This types StaChiCom's props, named Shc since Scc already belongs to another component.

// #region StaChiCom

/**
 * StaChiCom = Status Chip Component
 *
 * @summary
 * Renders the small run of colored status icons for one item, derived
 * from {@link dayFlaFun}'s own per-item flags. Shows an em-dash
 * placeholder when there is nothing to show at all.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.iteFlaObj - Item Flag Object: This item's own flags object from
 *                          {@link dayFlaFun}, or undefined when the item has
 *                          no pick-log rows today at all.
 *
 * @returns This item's own run of status icon chips, or a placeholder
 * span when there is nothing to show.
 *
 * @example
 * ```tsx
 * StaChiCom({ iteFlaObj }) // => <StaChiCom />
 * ```
 *
*/

function StaChiCom ( { iteFlaObj } : ShcProTyp ) : React.JSX.Element {


	if ( !iteFlaObj || !iteFlaObj.anyBoo ) { // What: No Rows Guard. Why: An item with no pick-log rows today has nothing to show but a placeholder. How: This returns the em-dash placeholder span below (a display glyph, not prose) before building any chips below.


		return (


			<span
				className={ cssModObj.staNonSpa }

				data-element-name-hook='logStaSpa'
			>—</span> // What: No Rows Span Element. Why: An item with no pick-log rows today still needs a placeholder in its status column. How: This renders an em-dash display glyph. Its data-element-name-hook is read by help mode's Today catalog.


		);


	}



	const chiTupArr : [ string, string, string, number ][] = []; // What: Chip Tuple Array. Why: The checks below each conditionally contribute one chip tuple to this same array. How: This starts empty and is filled in place by the pushes below.


	if ( iteFlaObj.autBoo ) chiTupArr.push( [ 'auto', 'shuEle', 'Auto-picked', 2 ] ); // What: Auto Chip Push. Why: An auto-picked item needs its own chip. How: This appends a [key, icon, title, width] tuple when autBoo is true.



	if ( iteFlaObj.pusBoo ) chiTupArr.push( [ 'push', 'pusEle', 'Pushed', 2.4 ] ); // What: Pushed Chip Push. Why: A pushed item needs its own chip. How: This appends a [key, icon, title, width] tuple when pusBoo is true.



	if ( iteFlaObj.rolBoo ) chiTupArr.push( [ 'roll', 'rolEle', 'Rolled off', 2.2 ] ); // What: Rolled Off Chip Push. Why: A rolled-off item needs its own chip. How: This appends a [key, icon, title, width] tuple when rolBoo is true.



	if ( iteFlaObj.skiBoo ) chiTupArr.push( [ 'skip', 'xEle', 'Skipped', 2.6 ] ); // What: Skipped Chip Push. Why: A skipped item needs its own chip. How: This appends a [key, icon, title, width] tuple when skiBoo is true.



	if ( iteFlaObj.comBoo ) chiTupArr.push( [ 'done', 'cheEle', 'Completed', 3 ] ); // What: Completed Chip Push. Why: A completed item needs its own chip. How: This appends a [key, icon, title, width] tuple when comBoo is true.



	return (


		<span
			className={ cssModObj.rowStaSpa }

			data-element-name-hook='logStaSpa'
		>{ /* What: Status Chip Row Span Element. Why: This is StaChiCom's own root element, holding every chip this item earned today. How: This maps chiTupArr into one small icon span per chip below. Its data-element-name-hook is read by help mode's Today catalog. */ }


			{ chiTupArr.map( ( [ chiKeyStr, chiIcoStr, chiTitStr, chiWidNum ] ) => ( // What: Chip Map Callback. Why: One small span is needed per earned chip. How: This destructures each chiTupArr tuple and renders it as a titled icon span, keyed by chiKeyStr.


				<span
					key={ chiKeyStr }

					className={` ${ cssModObj.staIcoSpa }   ${ chiKeyStr === 'auto' ? cssModObj.staIcoSpaAuto : '' }   ${ chiKeyStr === 'push' ? cssModObj.staIcoSpaPush : '' }   ${ chiKeyStr === 'roll' ? cssModObj.staIcoSpaRoll : '' }   ${ chiKeyStr === 'skip' ? cssModObj.staIcoSpaSkip : '' }   ${ chiKeyStr === 'done' ? cssModObj.staIcoSpaDone : '' } `}

					title={ chiTitStr }
				>{ /* What: Status Chip Span Element. Why: Each earned status gets its own small colored icon. How: This wraps IcoSetCom for chiIcoStr/chiWidNum, tinted by the staIcoSpa modifier class matching chiKeyStr. */ }


					<IcoSetCom
						className={ cssModObj.icoGlySvg }

						icoKeyStr={ chiIcoStr }
						strWidNum={ chiWidNum }
					/>{ /* What: Icon Set Component. Why: This is the chip's own glyph. How: This draws chiIcoStr at the chip's own stroke width. */ }


				</span> // What: Status Chip Span Element. Why: Each earned status gets its own small colored icon. How: This is tinted by its own staIcoSpa modifier for chiKeyStr class.


			) ) }


		</span>


	);


}

// #endregion StaChiCom



type ThcProTyp = { heaLabStr? : string }; // What: Table-Header-Component Props Type. Why: A log table's header names its first column. How: This types TabHeaCom's props.

// #region TabHeaCom

/**
 * TabHeaCom = Table Head Component
 *
 * @summary
 * The shared column-header row used by both PicBloCom's own item
 * table and ConSecCom's own conditional table.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.heaLabStr - Header Label String: The first column's own label,
 *                          defaulting to 'Item' (ConSecCom passes
 *                          'Conditional').
 *
 * @returns This table's own single header row.
 *
 * @example
 * ```tsx
 * TabHeaCom({ heaLabStr }) // => <TabHeaCom />
 * ```
 *
*/

function TabHeaCom ( { heaLabStr = 'Item' } : ThcProTyp ) : React.JSX.Element {


	return (


		<div className={ cssModObj.tabHeaDiv }>{ /* What: Table Head Div Element. Why: This is TabHeaCom's own root element. How: This renders the 5 shared column headers below. */ }


			<span data-element-name-hook='logIteSpa'>{ heaLabStr }</span>{ /* What: Item Header Span Element. Why: The first column's own label varies by caller. How: This renders heaLabStr directly. Its data-element-name-hook is read by help mode's Today catalog. */ }

			<span
				className={ cssModObj.heaGenSpa }

				data-element-name-hook='logGenSpa'
			>{ /* What: At Generation Header Span Element. Why: This column needs both a compact glyph and a real, screen-reader-only label. How: This renders an open-circle glyph plus a visually-hidden "At generation" span. Its data-element-name-hook is read by help mode's Today catalog. */ }


				<span
					className={ cssModObj.genIcoSpa }

					aria-hidden='true'
				>○</span>{ /* What: At Generation Glyph Span Element. Why: A compact glyph keeps the narrow column header short. How: This renders ○ hidden from screen readers. */ }

				<span className={ cssModObj.visHidSpa }>At generation</span>{ /* What: At Generation Label Span Element. Why: Screen readers need the column's real name. How: This renders "At generation" visually hidden. */ }


			</span>

			<span
				className={ cssModObj.heaDelSpa }

				data-element-name-hook='logDelSpa'
			>{ /* What: Delta Header Span Element. Why: This column needs both a compact glyph and a real, screen-reader-only label. How: This renders a delta glyph plus a visually-hidden "Change" span. Its data-element-name-hook is read by help mode's Today catalog. */ }


				<span aria-hidden='true'>Δ</span>{ /* What: Delta Glyph Span Element. Why: A compact glyph keeps the narrow column header short. How: This renders Δ hidden from screen readers. */ }

				<span className={ cssModObj.visHidSpa }>Change</span>{ /* What: Delta Label Span Element. Why: Screen readers need the column's real name. How: This renders "Change" visually hidden. */ }


			</span>

			<span
				className={ cssModObj.heaAftSpa }

				data-element-name-hook='logAftSpa'
			>{ /* What: After Header Span Element. Why: This column needs both a compact glyph and a real, screen-reader-only label. How: This renders a filled-circle glyph plus a visually-hidden "After" span. Its data-element-name-hook is read by help mode's Today catalog. */ }


				<span aria-hidden='true'>●</span>{ /* What: After Glyph Span Element. Why: A compact glyph keeps the narrow column header short. How: This renders ● hidden from screen readers. */ }

				<span className={ cssModObj.visHidSpa }>After</span>{ /* What: After Label Span Element. Why: Screen readers need the column's real name. How: This renders "After" visually hidden. */ }


			</span>

			<span
				className={ cssModObj.heaStaSpa }

				data-element-name-hook='logStaSpa'
			>Status</span>{ /* What: Status Header Span Element. Why: The last column is a plain text header, no glyph needed. How: This renders the literal text "Status". Its data-element-name-hook is read by help mode's Today catalog. */ }


		</div>


	);


}

// #endregion TabHeaCom



type VccProTyp = { aftValNum : number | null, genValNum : number | null, hasValBoo : boolean, offValNum? : number }; // What: Value-Cell-Component Props Type. Why: A value cell compares an item's value at generation with its value now. How: This types ValCelCom's props.

// #region ValCelCom

/**
 * ValCelCom = Value Cells Component
 *
 * @summary
 * Renders the 3 shared value cells (at generation, delta, after) used
 * by both an item row and a conditional row, showing "N/A" in all 3
 * when the mode has no value at all or there is no generation
 * snapshot yet. offValNum (dynamic items only) is the item's own base
 * weight, added to BOTH the at-generation and after cells so they read
 * as effective pick weight (weight + boost) rather than the bare
 * boost, since that is the number that actually drove the roll. It is
 * added to both, not just after, so the columns stay arithmetically
 * honest: after minus at-generation still equals delta. Delta itself
 * is untouched, since a constant base weight cancels out of the
 * difference; it remains the change in boost alone.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.aftValNum - After Value Number: The current value, after
 *                          whatever happened today.
 * @param props.genValNum - Generation Value Number: The value at generation
 *                          time, or null/ undefined when there is no snapshot.
 * @param props.hasValBoo - Has Value Boolean: Whether this row's own mode
 *                          tracks a value at all.
 * @param props.offValNum - Offset Value Number: The base weight to add to both
 *                          cells (dynamic items only); defaults to 0.
 *
 * @returns This row's own 3 value cells (at generation, delta, after),
 * as a React.Fragment.
 *
 * @example
 * ```tsx
 * ValCelCom({ aftValNum, genValNum, hasValBoo, ... }) // => <ValCelCom />
 * ```
 *
*/

function ValCelCom ( { aftValNum, genValNum, hasValBoo, offValNum = 0 } : VccProTyp ) : React.JSX.Element {


	if ( !hasValBoo || genValNum == null ) { // What: No Value Guard. Why: A moded-out row or one with no generation snapshot at all has nothing real to show in any of the 3 cells. How: This renders all 3 as N/A/flat placeholders before computing anything below.


		return (


			<React.Fragment>{ /* What: No Value Cells Fragment Element. Why: This row still needs all 3 value cell slots rendered, even with nothing real to show. How: This renders 2 N/A cells and a flat placeholder delta between them. */ }


				<span
					className={ cssModObj.celGenSpa }

					data-element-name-hook='logGenSpa'
				><span className={ cssModObj.notAppSpa }>N/A</span></span>{ /* What: At Generation Not Available Span Element. Why: There is no generation-time value to show. How: This renders the shared notAppSpa "N/A" placeholder. Its data-element-name-hook is read by help mode's Today catalog. */ }

				<span
					className={` ${ cssModObj.celDelSpa }   ${ cssModObj.celDelSpaFlat } `}

					data-element-name-hook='logDelSpa'
				>—</span>{ /* What: Delta Placeholder Span Element. Why: With no real value, there is no real delta either. How: This renders the shared em-dash placeholder glyph (a display character, not prose). Its data-element-name-hook is read by help mode's Today catalog. */ }

				<span
					className={` ${ cssModObj.celAftSpa }   ${ cssModObj.celAftSpaEmpty } `}

					data-element-name-hook='logAftSpa'
				><span className={ cssModObj.notAppSpa }>N/A</span></span>{ /* What: After Not Available Span Element. Why: There is no current value to show either. How: This renders the shared notAppSpa "N/A" placeholder. Its data-element-name-hook is read by help mode's Today catalog. */ }


			</React.Fragment>


		);


	}



	const effGenNum = Math.round( genValNum ) + offValNum;                                              // What: Effective Generation Number. Why: This is the actual effective pick weight at generation time. How: This rounds genValNum and adds offValNum (0 for a non-dynamic row).
	const effAftNum = Math.round( aftValNum ) + offValNum;                                              // What: Effective After Number. Why: This is the actual effective pick weight after whatever happened today. How: This rounds aftValNum and adds offValNum (0 for a non-dynamic row).
	const delValNum = effAftNum - effGenNum;                                                            // What: Delta Value Number. Why: The middle cell shows the actual change, not either raw value. How: This subtracts effGenNum from effAftNum; offValNum cancels out of this difference either way.
	const treClaStr = delValNum > 0 ? 'up' : delValNum < 0 ? 'down' : 'flat';                           // What: Trend Class String. Why: The delta cell's own color/direction styling depends on which way delValNum moved. How: This picks 'up'/'down'/'flat' from delValNum's own sign.
	const disTexStr = delValNum === 0 ? '—' : ( delValNum > 0 ? `+${ delValNum }` : `${ delValNum }` ); // What: Display Text String. Why: The delta cell needs its own signed text, or a flat placeholder at exactly 0. How: This renders the em-dash placeholder at 0, otherwise a "+"-prefixed or plain signed number.



	return (


		<React.Fragment>{ /* What: Value Cells Fragment Element. Why: This row's own 3 real value cells share no wrapping DOM element. How: This renders the at-generation, delta and after cells in order. */ }


			<span
				className={ cssModObj.celGenSpa }

				data-element-name-hook='logGenSpa'
			>{ effGenNum }</span>{ /* What: At Generation Value Span Element. Why: This is the row's own value as it stood at generation time. How: This renders effGenNum directly. Its data-element-name-hook is read by help mode's Today catalog. */ }

			<span
				className={` ${ cssModObj.celDelSpa }   ${ treClaStr === 'up' ? cssModObj.celDelSpaUp : '' }   ${ treClaStr === 'down' ? cssModObj.celDelSpaDown : '' }   ${ treClaStr === 'flat' ? cssModObj.celDelSpaFlat : '' } `}

				data-element-name-hook='logDelSpa'
			>{ disTexStr }</span>{ /* What: Delta Value Span Element. Why: This is the row's own signed change since generation. How: This renders disTexStr, tinted by its own treClaStr direction class. Its data-element-name-hook is read by help mode's Today catalog. */ }

			<span
				className={ cssModObj.celAftSpa }

				data-element-name-hook='logAftSpa'
			>{ effAftNum }</span>{ /* What: After Value Span Element. Why: This is the row's own current value. How: This renders effAftNum directly. Its data-element-name-hook is read by help mode's Today catalog. */ }


		</React.Fragment>


	);


}

// #endregion ValCelCom



type CsoProTyp = { picGroArr : PicRcdTyp[], staAppObj : StaAppTyp }; // What: Conditional-Section-Component Props Type. Why: The conditional section lists the conditionals gating one group's pickers. How: This types ConSecCom's props, named Cso since Csc, Cec, and Ccc already belong to other components.

// #region ConSecCom

/**
 * ConSecCom = Conditional Section Component
 *
 * @summary
 * The blue section listing every conditional attached to any picker in
 * the current group, one row per conditional (name/mode subline, value
 * cells, Triggered/Not-triggered pill) plus a strip naming which
 * pickers it affects. Renders nothing at all when the group has no
 * attached conditionals.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.picGroArr - Picker Group Array: Every picker in the current
 *                          group.
 * @param props.staAppObj - State App Object: The whole app state object.
 *
 * @returns This group's own conditionals section, or null once it has
 * none.
 *
 * @example
 * ```tsx
 * ConSecCom({ picGroArr, staAppObj }) // => <ConSecCom />
 * ```
 *
*/

function ConSecCom ( { picGroArr, staAppObj } : CsoProTyp ) : React.JSX.Element | null {


	const conIdeArr = [ ...new Set( picGroArr.filter( ( picRcdObj ) => picRcdObj.conditionalId ).map( ( picRcdObj ) => picRcdObj.conditionalId ) ) ]; // What: Conditional Identifier Array. Why: This section only needs the unique conditional ids actually attached to this group's own pickers. How: This maps picGroArr down to its own conditionalId values, deduped via a Set.
	const conRcdArr = staAppObj.conditionals.filter( ( conRcdObj ) => conIdeArr.includes( conRcdObj.id ) );                                           // What: Conditional Record Array. Why: The table below needs the real conditional records, not just their ids. How: This filters staAppObj's own conditionals down to conIdeArr's own membership.


	if ( !conRcdArr.length ) return null; // What: No Conditionals Guard. Why: A group with no attached conditionals at all needs no section here. How: This returns null before building any of the table below.



	const genConObj = ( staAppObj.today.genLog && staAppObj.today.genLog.conds ) || {}; // What: Generation Conditional Object. Why: The value cells below need each conditional's own at-generation snapshot. How: This reads staAppObj's own today.genLog.conds, or an empty object when there is none yet.



	return (


		<div
			className={ cssModObj.logConDiv }

			data-element-name-hook='logConDiv'
		>{ /* What: Conditional Section Div Element. Why: This is ConSecCom's own root element, tinted blue via its own logConDiv class. How: This renders a static header plus the conditional table below. Its data-element-name-hook is read by help mode's Today catalog. */ }


			<div className={ cssModObj.bloHeaDiv }>{ /* What: Conditional Section Header Div Element. Why: This mirrors PicBloCom's own static header shape. How: This renders the section's own title plus a count pill. */ }


				<span className={ cssModObj.conTitSpa }>Conditionals</span>{ /* What: Conditional Section Title Span Element. Why: This section needs its own plain title. How: This renders the literal text "Conditionals". */ }

				<span className={ cssModObj.conCouSpa }>{ conRcdArr.length }</span>{ /* What: Conditional Count Span Element. Why: The header shows how many conditionals this section covers. How: This renders conRcdArr's own length. */ }


			</div>

			<div className={ cssModObj.logTabDiv }>{ /* What: Conditional Table Div Element. Why: This groups the shared header row with every conditional row below it. How: This renders TabHeaCom followed by one row per conRcdArr entry. */ }


				<TabHeaCom heaLabStr='Conditional' />{ /* What: Table Head Component. Why: This table's first column needs its own "Conditional" label instead of the default "Item". How: This renders with heaLabStr explicitly set. */ }



				{ conRcdArr.map( ( conRcdObj ) => { // What: Conditional Row Map Callback. Why: One row (plus its own affected-pickers strip) is needed per conRcdArr entry. How: This computes each row's own derived values before returning its JSX below.


					const attNamArr = staAppObj.pickers.filter( ( picRcdObj ) => picRcdObj.conditionalId === conRcdObj.id && !picRcdObj.hidden ).map( ( picRcdObj ) => picRcdObj.name ); // What: Attached Name Array. Why: The affected-pickers strip below needs just the visible attached pickers' own names. How: This filters staAppObj's own pickers down to this conditional's own id, excluding a hidden one, then maps to their own name.
					const trgFlaBoo = CON_NAM_OBJ.supGatFun( conRcdObj );                                           // What: Triggered Flag Boolean. Why: Both the pill and the affected-pickers wording below depend on whether this conditional actually fired today. How: This calls CON_NAM_OBJ.supGatFun, the same shared active-and-triggered check every other suppression decision in the app uses.
					const hasValBoo = CON_NAM_OBJ.modValFun( conRcdObj.mode );                                      // What: Has Value Boolean. Why: Some conditional modes track no value at all. How: This asks CON_NAM_OBJ.modValFun for conRcdObj's own mode.
					const genSnaObj = genConObj[ conRcdObj.id ];                                                    // What: Generation Snapshot Object. Why: The value cells below need this conditional's own at-generation snapshot, if any. How: This reads genConObj's own entry for conRcdObj's own id.
					const neuModBoo = conRcdObj.mode === 'weighted' || conRcdObj.mode === 'random';                 // What: Neutral Mode Boolean. Why: These 2 modes get a visually neutral pill instead of a tinted one. How: This checks conRcdObj's own mode against both literal keys.
					const modLabStr = ( SED_NAM_OBJ.MOD_DEF_OBJ[ conRcdObj.mode ] || {} ).labStr || conRcdObj.mode; // What: Mode Label String. Why: The row's own mode pill needs the final resolved label. How: This reads MOD_DEF_OBJ's own label for conRcdObj's own mode, falling back to the raw mode key for an unknown one.
					const attJsxArr = attNamArr.map( ( curNamStr, curIndNum ) => <React.Fragment key={ curNamStr }>{ curIndNum ? ', ' : '' }<b className={ cssModObj.affNamBol }>{ curNamStr }</b></React.Fragment> ); // What: Attached Jsx Array. Why: Both branches of the affected-pickers strip below need this exact same comma-joined name list. How: This maps attNamArr into one comma-prefixed bold name per entry, computed once for reuse.



					return (


						<React.Fragment key={ conRcdObj.id }>{ /* What: Conditional Row Fragment Element. Why: The row itself and its own affected-pickers strip are siblings, not nested. How: This groups the conRowDiv row and the conAffDiv strip below without an extra wrapping element. */ }


							<div className={ cssModObj.conRowDiv }>{ /* What: Conditional Row Div Element. Why: This is one conditional's own full row, spanning name/subline, value cells and its own triggered pill. How: This renders the name/mode span, ValCelCom, and the triggered pill below. */ }


								<span
									className={ cssModObj.rowIteSpa }

									data-element-name-hook='logIteSpa'
								>{ /* What: Conditional Name Span Element. Why: This groups the conditional's own name, mode pill and subline together. How: This renders conRcdObj's own name/mode row plus its computed subline below. Its data-element-name-hook is read by help mode's Today catalog. */ }


									<span className={ cssModObj.namRowSpa }>{ /* What: Name Row Span Element. Why: The name and mode pill sit side by side on their own row above the subline. How: This renders conRcdObj's own name plus its modLabStr pill. */ }


										<InfTipCom
											className={ cssModObj.rowNamSpa }

											labTexStr={ conRcdObj.name }
											trnOnlBoo
										>{ conRcdObj.name }</InfTipCom>{ /* What: Info Tip Component. Why: A long conditional name can truncate in a narrow layout. How: This renders conRcdObj's own name as a truncation-revealing InfTipCom. */ }



										<InfTipCom
											className={ cssModObj.conModSpa }

											data-mode-neutral-active={ neuModBoo || undefined } // What: Mode Neutral Active Attribute. Why: Weighted and random conditionals read neutral. How: This sets the presence-only attribute while neuModBoo is true, which InfTipCom forwards to its trigger.

											labTexStr={ modLabStr }
											trnOnlBoo
										>{ modLabStr }</InfTipCom>{ /* What: Info Tip Component. Why: A long mode label can truncate in a narrow layout. How: This renders modLabStr as a truncation-revealing InfTipCom. */ }


									</span>

									<span className={ cssModObj.rowSubSpa }>{ conSubFun( conRcdObj ) }</span>{ /* What: Conditional Subline Span Element. Why: Every conditional shows its own odds/range text beneath its name. How: This renders conSubFun's own result for conRcdObj. */ }


								</span>



								<ValCelCom
									aftValNum={ conRcdObj.value }
									genValNum={ genSnaObj ? genSnaObj.value : ( hasValBoo ? conRcdObj.value : null ) } // What: Generation Value Pick. Why: A conditional added after generation has no snapshot but still has a live value to show. How: This prefers the snapshot, then the current value under a value mode, then null.
									hasValBoo={ hasValBoo }
								/>{ /* What: Value Cells Component. Why: Every conditional shows its own at-generation/delta/after cells. How: This prefers genSnaObj's own value snapshot, falling back to conRcdObj's own current value under a value-tracking mode. */ }



								<span
									className={ cssModObj.rowStaSpa }

									data-element-name-hook='logStaSpa'
								>{ /* What: Conditional Status Span Element. Why: The last column shows whether this conditional actually fired today. How: This renders the triggered/not-triggered pill below. Its data-element-name-hook is read by help mode's Today catalog. */ }


									<span className={` ${ cssModObj.staPilSpa }   ${ trgFlaBoo ? cssModObj.staPilSpaTriggered : cssModObj.staPilSpaUntriggered } `}>{ trgFlaBoo ? 'Triggered' : 'Not triggered' }</span>{ /* What: Triggered Pill Span Element. Why: This is the actual triggered/not-triggered indicator. How: This renders its own text/class from trgFlaBoo. */ }


								</span>


							</div>

							<div className={ cssModObj.conAffDiv }>{ /* What: Conditional Affected Div Element. Why: This strip names which pickers this conditional actually governs. How: This renders a branch glyph plus attJsxArr, worded differently depending on trgFlaBoo. */ }


								<IcoSetCom
									className={ cssModObj.affIcoSvg }

									icoKeyStr='braEle'
								/>{ /* What: Icon Set Component. Why: This strip needs a small branch glyph marking it as a "this affects these" note. How: This renders IcoSetCom's own "branch" shape. */ }



								{ trgFlaBoo // What: Triggered Wording Check. Why: A triggered conditional rests its attached pickers, a not-triggered one lets them run normally. How: This renders one of 2 differently-worded spans depending on trgFlaBoo.
									? <span>Rested: { attJsxArr }</span>                  // What: Rested Span Element. Why: A triggered conditional rested these pickers. How: This lists them after the word Rested.
									: <span>Attached: { attJsxArr } (ran normally)</span> // What: Attached Span Element. Why: A quiet conditional left these pickers running. How: This lists them with a ran-normally note.
								}


							</div>


						</React.Fragment>


					);


				} ) }


			</div>


		</div>


	);


}

// #endregion ConSecCom



type PlcProTyp = { dayKeyStr : string, isaSupBoo : boolean, picRcdObj : PicRcdTyp, staAppObj : StaAppTyp }; // What: Picker-Block-Component Props Type. Why: A picker block shows one picker's items and what happened to each today. How: This types PicBloCom's props, named Plc since Pbc already belongs to ProBarCom.

// #region PicBloCom

/**
 * PicBloCom = Picker Block Component
 *
 * @summary
 * One picker's own collapsible table within a group's log panel: a
 * header (name, mode pill, item/done summary or expand chevron) plus,
 * while expanded, one row per item showing its own subline, value
 * cells and status chips. A picker suppressed today by a triggered
 * conditional (and with no manual-override rows of its own) instead
 * renders as a single static "Rested" row.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.dayKeyStr - Day Key String: Today's own "YYYY-MM-DD" key, from
 *                          {@link isoDayFun}.
 * @param props.isaSupBoo - Is-A Suppressed Boolean: Whether picRcdObj is
 *                          suppressed today by a triggered conditional.
 * @param props.picRcdObj - Picker Record Object: The picker this block
 *                          renders.
 * @param props.staAppObj - State App Object: The whole app state object.
 *
 * @returns This picker's own block, either a static rested row or its
 * full collapsible item table.
 *
 * @example
 * ```tsx
 * PicBloCom({ dayKeyStr, isaSupBoo, picRcdObj, ... }) // => <PicBloCom />
 * ```
 *
*/

function PicBloCom ( { dayKeyStr, isaSupBoo, picRcdObj, staAppObj } : PlcProTyp ) : React.JSX.Element {


	const [ bloOpeBoo, setBloOpeBoo ] = React.useState( true ); // What: Block Open Boolean And Setter. Why: This picker's own item table starts expanded, but can be collapsed independently of every other picker's own block. How: This is flipped by the header button's own onClick below.

	const picIteArr = staAppObj.items.filter( ( iteRcdObj ) => iteRcdObj.pickerId === picRcdObj.id ); // What: Picker Item Array. Why: Every row below is one of this picker's own items, not the whole app's. How: This filters staAppObj's own items down to picRcdObj's own id.
	const iteFlaMap = dayFlaFun( staAppObj.pickLog, picRcdObj.id, dayKeyStr );                        // What: Item Flags Map Call. Why: Every item row below needs its own today's-events flags. How: This calls dayFlaFun for this exact picker/day.
	const genIteObj = ( staAppObj.today.genLog && staAppObj.today.genLog.items ) || {};               // What: Generation Item Object. Why: The value cells below need each item's own at-generation snapshot. How: This reads staAppObj's own today.genLog.items, or an empty object when there is none yet.
	const hasRowBoo = iteFlaMap.size > 0;                                                             // What: Has Row Boolean. Why: A manual override on an otherwise-suppressed picker must still render its real table, not the static rested row. How: This is true once any item earned at least one flag today.
	const modLabStr = ( SED_NAM_OBJ.MOD_DEF_OBJ[ picRcdObj.mode ] || {} ).labStr || picRcdObj.mode;   // What: Mode Label String. Why: The header pill below needs the final resolved label. How: This reads MOD_DEF_OBJ's own label for picRcdObj's own mode, falling back to the raw mode key for an unknown one.
	const neuModBoo = picRcdObj.mode === 'weighted' || picRcdObj.mode === 'random';                   // What: Neutral Mode Boolean. Why: These 2 modes get a visually neutral pill instead of a tinted one. How: This checks picRcdObj's own mode against both literal keys.



	if ( !hasRowBoo && isaSupBoo ) { // What: Suppressed Rest Guard. Why: A picker suppressed today with no manual-override rows renders as a single static rested row instead of its full table. How: This checks both conditions before returning the rested-row branch below.


		const conRcdObj = staAppObj.conditionals.find( ( curConObj ) => curConObj.id === picRcdObj.conditionalId ); // What: Conditional Record Object. Why: The rested row below names which conditional actually suppressed this picker. How: This finds staAppObj's own conditional matching picRcdObj's own conditionalId.



		return (


			<div
				className={ cssModObj.logBloDiv }

				data-element-name-hook='logBloDiv'
			>{ /* What: Rested Picker Block Div Element. Why: This is the whole static-rested variant's own root element. How: This renders a single non-interactive header row, no table beneath it. Its data-element-name-hook is read by help mode's Today catalog. */ }


				<div className={ cssModObj.bloHeaDiv }>{ /* What: Rested Block Header Div Element. Why: This mirrors the interactive header's own layout without being a button. How: This renders the picker's own name/mode pill plus the rested strip. */ }


					<span className={ cssModObj.namModSpa }>{ /* What: Name Mode Span Element. Why: The picker's own name and mode pill are grouped together. How: This renders picRcdObj's own name plus its modLabStr pill. */ }


						<span className={ cssModObj.bloNamSpa }>{ picRcdObj.name }</span>{ /* What: Block Name Span Element. Why: The picker's own name is always shown first. How: This renders picRcdObj's own name directly. */ }



						<InfTipCom
							className={ cssModObj.picModSpa }

							data-mode-neutral-active={ neuModBoo || undefined } // What: Mode Neutral Active Attribute. Why: Weighted and random pickers read neutral. How: This sets the presence-only attribute while neuModBoo is true, which InfTipCom forwards to its trigger.

							labTexStr={ modLabStr }
							trnOnlBoo
						>{ modLabStr }</InfTipCom>{ /* What: Info Tip Component. Why: A long mode label can truncate in a narrow layout. How: This renders modLabStr as a truncation-revealing InfTipCom. */ }


					</span>

					<span className={ cssModObj.bloResSpa }>{ /* What: Rest Span Element. Why: This groups the rested icon/text with which conditional caused it. How: This renders the "Rested" strip plus conRcdObj's own name when found. */ }


						<span className={ cssModObj.resLinSpa }>{ /* What: Rest Label Span Element. Why: This is the actual "rested today" indicator. How: This renders a moon glyph plus the literal text "Rested". */ }


							<IcoSetCom
								className={ cssModObj.resIcoSvg }

								icoKeyStr='mooEle'
							/>{ /* What: Icon Set Component. Why: A moon glyph marks the picker as resting today. How: This draws the mooEle shape. */ }

							Rested


						</span>

						{ conRcdObj && <span className={ cssModObj.resConSpa }>{ conRcdObj.name }</span> }{ /* What: Rest Conditional Visibility Check. Why: Naming which conditional caused the rest is only possible when one was actually found. How: This renders conRcdObj's own name only while conRcdObj is truthy. */ }


					</span>


				</div>


			</div>


		);


	}



	const donCouNum = picIteArr.filter( ( iteRcdObj ) => ( iteFlaMap.get( iteRcdObj.id ) || {} ).comBoo ).length; // What: Done Count Number. Why: The header's own summary strip shows how many items are already completed today. How: This counts picIteArr entries whose own iteFlaMap flags (or an empty fallback) have comBoo set.



	return (


		<div
			className={ cssModObj.logBloDiv }

			data-element-name-hook='logBloDiv'
		>{ /* What: Picker Block Div Element. Why: This is the interactive variant's own root element. How: This wraps the header button, whose aria-expanded reflects bloOpeBoo, and the collapsible table below. Its data-element-name-hook is read by help mode's Today catalog. */ }


			<button
				className={ cssModObj.bloHeaBut }

				type='button'

				aria-expanded={ bloOpeBoo }

				onClick={ () => setBloOpeBoo( ( preOpeBoo ) => !preOpeBoo ) }
			>{ /* What: Block Header Button Element. Why: The whole header is the actual expand/collapse control. How: This flips bloOpeBoo on click and reflects it via aria-expanded. */ }


				<span className={ cssModObj.bloChvSpa }>{ /* What: Chevron Span Element. Why: A chevron glyph signals this header is expandable. How: This renders IcoSetCom's own "chevron" shape, rotated via CSS from its header's own aria-expanded. */ }


					<IcoSetCom
						className={ cssModObj.chvIcoSvg }

						icoKeyStr='chvEle'
					/>{ /* What: Icon Set Component. Why: The chevron glyph is what turns. How: This draws the chvEle shape. */ }


				</span>

				<span className={ cssModObj.namModSpa }>{ /* What: Name Mode Span Element. Why: The picker's own name and mode pill are grouped together. How: This renders picRcdObj's own name plus its modLabStr pill. */ }


					<span className={ cssModObj.bloNamSpa }>{ picRcdObj.name }</span>{ /* What: Block Name Span Element. Why: The picker's own name is always shown first. How: This renders picRcdObj's own name directly. */ }



					<InfTipCom
						className={ cssModObj.picModSpa }

						data-mode-neutral-active={ neuModBoo || undefined } // What: Mode Neutral Active Attribute. Why: Weighted and random pickers read neutral. How: This sets the presence-only attribute while neuModBoo is true, which InfTipCom forwards to its trigger.

						labTexStr={ modLabStr }
						trnOnlBoo
					>{ modLabStr }</InfTipCom>{ /* What: Info Tip Component. Why: A long mode label can truncate in a narrow layout. How: This renders modLabStr as a truncation-revealing InfTipCom. */ }


				</span>

				<span className={ cssModObj.bloSumSpa }>{ /* What: Summary Span Element. Why: The header's own right-hand side summarizes this picker's own item/done counts. How: This renders the item count, plus a done chip once donCouNum is positive. */ }


					<span>{ picIteArr.length } item{ picIteArr.length === 1 ? '' : 's' }</span>{ /* What: Item Count Span Element. Why: The header always shows how many items this picker has. How: This renders picIteArr's own length, pluralized. */ }

					{ donCouNum > 0 && ( // What: Done Chip Visibility Check. Why: The done chip only makes sense once at least 1 item is actually completed. How: This renders the chip only while donCouNum is positive.


						<span className={ cssModObj.donChiSpa }>{ /* What: Done Chip Span Element. Why: The done count reads with its own check glyph. How: This wraps the glyph and the count. */ }


							<IcoSetCom
								className={ cssModObj.donIcoSvg }

								icoKeyStr='cheEle'
								strWidNum={ 3 }
							/>{ /* What: Icon Set Component. Why: A check glyph marks the completed count. How: This draws the check at a bolder stroke. */ }



							<span>{ donCouNum } done</span>{ /* What: Done Count Span Element. Why: This says how many items are done today. How: This renders donCouNum followed by the word done. */ }


						</span>


					) }


				</span>


			</button>



			<ColDisCom open={ bloOpeBoo }>{ /* What: Collapse Disclosure Component. Why: The item table below should only exist in the DOM while this block is actually expanded. How: This wraps the table, driven by bloOpeBoo. */ }


				<div className={ cssModObj.logTabDiv }>{ /* What: Item Table Div Element. Why: This groups the shared header row with every item row below it. How: This renders TabHeaCom followed by one row per picIteArr entry. */ }


					<TabHeaCom />{ /* What: Table Head Component. Why: This item table needs the shared column headers. How: This renders with its own default 'Item' first-column label. */ }



					{ picIteArr.length === 0 && <div className={ cssModObj.logEmpDiv }>This picker has no items.</div> }{ /* What: Empty Picker Visibility Check. Why: A picker with no items at all needs an explanatory row instead of an empty table. How: This renders only while picIteArr's own length is 0. */ }

					{ picIteArr.map( ( iteRcdObj ) => { // What: Item Row Map Callback. Why: One row is needed per item in picIteArr. How: This builds each row's own flags, done state and value-mode check before returning its JSX below.


						const iteFlaObj = iteFlaMap.get( iteRcdObj.id );                      // What: Item Flags Object. Why: This row's own status chips and done state both read from the same flags object. How: This reads iteFlaMap's own entry for iteRcdObj's own id.
						const iteDonBoo = iteFlaObj && iteFlaObj.comBoo;                      // What: Item Done Boolean. Why: A completed item gets its own done row styling. How: This is true only when iteFlaObj exists and its own comBoo flag is set.
						const hasValBoo = hasValFun( picRcdObj.mode ) && !iteRcdObj.vacation; // What: Has Value Boolean. Why: An item on vacation never shows a value, even under a value-tracking mode. How: This combines hasValFun's own mode check with iteRcdObj's own vacation flag.



						return (


							<div
								key={ iteRcdObj.id }

								className={ cssModObj.tabRowDiv }

								data-row-done-active={ iteDonBoo || undefined } // What: Row Done Active Attribute. Why: A completed item's row reads green. How: This sets the presence-only attribute while iteDonBoo is true.
								data-row-vacation-active={ iteRcdObj.vacation || undefined } // What: Row Vacation Active Attribute. Why: An item on vacation reads quieter. How: This sets the presence-only attribute while the item is on vacation.
							>{ /* What: Item Row Div Element. Why: This is one item's own full row, spanning name/subline, value cells and status. How: This marks itself with data-row-done-active/data-row-vacation-active from iteDonBoo/iteRcdObj.vacation. */ }


								<span
									className={ cssModObj.rowIteSpa }

									data-element-name-hook='logIteSpa'
								>{ /* What: Item Name Span Element. Why: This groups the item's own name and subline together. How: This renders iteRcdObj's own name plus its computed subline below. Its data-element-name-hook is read by help mode's Today catalog. */ }


									<InfTipCom
										className={ cssModObj.rowNamSpa }

										labTexStr={ iteRcdObj.name }
										trnOnlBoo
									>{ iteRcdObj.name }</InfTipCom>{ /* What: Info Tip Component. Why: A long item name can truncate in a narrow layout. How: This renders iteRcdObj's own name as a truncation-revealing InfTipCom. */ }



									<span className={ cssModObj.rowSubSpa }>{ iteSubFun( picRcdObj, iteRcdObj, hasValBoo ? genIteObj[ iteRcdObj.id ] : null ) }</span>{ /* What: Item Subline Span Element. Why: Every item shows its own weight/range/boost text beneath its name. How: This renders iteSubFun's own result, passing the generation snapshot only while hasValBoo. */ }


								</span>



								<ValCelCom
									aftValNum={ iteRcdObj.value }
									genValNum={ genIteObj[ iteRcdObj.id ] }
									hasValBoo={ hasValBoo }
									offValNum={ picRcdObj.mode === 'dynamic' ? ( iteRcdObj.weight ?? 1 ) : 0 } // What: Base Weight Offset. Why: Dynamic value cells show effective weight, which is base weight plus boost. How: This passes the item's own weight under dynamic mode and 0 otherwise.
								/>{ /* What: Value Cells Component. Why: Every item shows its own at-generation/delta/after cells. How: This passes hasValBoo plus the raw generation/current values, offset by this item's own base weight under dynamic mode. */ }



								{ iteRcdObj.vacation // What: Vacation Status Check. Why: A vacationing item shows a plain "Inactive" label instead of the normal status chips. How: This renders the inactive span for a vacationing item, StaChiCom otherwise.
									? <span
										className={ cssModObj.rowStaSpa }

										data-element-name-hook='logStaSpa'
									><span className={ cssModObj.vacNotSpa }>Inactive</span></span> // What: Inactive Status Span Element. Why: A vacationing item has no chips to show. How: This renders the plain Inactive label in the status column. Its data-element-name-hook is read by help mode's Today catalog.
									: <StaChiCom iteFlaObj={ iteFlaObj } />                                                    // What: Status Chip Component. Why: Every other item shows its own status chips. How: This passes the item's own flags.
								}


							</div>


						);


					} ) }


				</div>


			</ColDisCom>


		</div>


	);


}

// #endregion PicBloCom



type GlcProTyp = { groNamStr : string, onCloLogFun : () => void, staAppObj : StaAppTyp }; // What: Group-Log-Component Props Type. Why: A group's log panel covers that group's pickers and can be closed. How: This types GroLogCom's props.

// #region GroLogCom

/**
 * GroLogCom = Group Log Component
 *
 * @summary
 * The whole log panel for one group (or the Reminders section calling
 * through {@link RemLogCom} instead), opened inline beneath its own
 * header. Renders the shared key/legend, ConSecCom's own conditionals
 * section, then one PicBloCom per picker in the group, in the group's
 * own saved picker order.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.groNamStr   - Group Name String: Which group this panel covers.
 * @param props.onCloLogFun - On Close Log Function: Called when the panel's
 *                            own close button is pressed; omitted entirely
 *                            suppresses that button.
 * @param props.staAppObj   - State App Object: The whole app state object.
 *
 * @returns This group's own full log panel.
 *
 * @example
 * ```tsx
 * GroLogCom({ groNamStr, onCloLogFun, staAppObj }) // => <GroLogCom />
 * ```
 *
*/

function GroLogCom ( { groNamStr, onCloLogFun, staAppObj } : GlcProTyp ) : React.JSX.Element {


	const dayKeyStr = isoDayFun();                                                                                                    // What: Day Key String. Why: Every lookup below (conditionals, pickers, items) is scoped to today's own date key. How: This calls isoDayFun with no argument, defaulting to right now.
	const groPicArr = staAppObj.pickers.filter( ( picRcdObj ) => ( picRcdObj.group || 'Other' ) === groNamStr && !picRcdObj.hidden ); // What: Group Picker Array. Why: This panel only ever shows the pickers actually belonging to this exact group. How: This filters staAppObj's own pickers down to a matching (or defaulted) group, excluding a hidden one.
	const picOrdArr = ( staAppObj.pickerOrder && staAppObj.pickerOrder[ groNamStr ] ) || [];                                          // What: Picker Order Array. Why: The sort below needs this group's own saved manual order, if any. How: This reads staAppObj's own pickerOrder entry for groNamStr, or an empty array when there is none.

	const sorPicArr = groPicArr.slice().sort( ( picOneObj, picTwoObj ) => { // What: Sorted Picker Array. Why: This panel renders pickers in the group's own saved order, not whatever order staAppObj.pickers happens to hold. How: This sorts a defensive copy of groPicArr by each picker's own position in picOrdArr.


		const ordOneNum = picOrdArr.indexOf( picOneObj.id ); // What: Order One Number. Why: The comparison below needs picOneObj's own position in picOrdArr. How: This reads picOrdArr's own indexOf for picOneObj's own id.
		const ordTwoNum = picOrdArr.indexOf( picTwoObj.id ); // What: Order Two Number. Why: The comparison below needs picTwoObj's own position in picOrdArr. How: This reads picOrdArr's own indexOf for picTwoObj's own id.



		return ( ordOneNum === -1 ? 1e6 : ordOneNum ) - ( ordTwoNum === -1 ? 1e6 : ordTwoNum ); // What: Order Comparison Return. Why: A picker with no saved position at all must sort after every ordered one. How: This treats a -1 (not found) as a huge fallback position before subtracting.


	} );



	const cheSupFun = ( picRcdObj : PicRcdTyp ) => { // What: Check Suppressed Function. Why: PicBloCom needs to know, per picker, whether a triggered conditional suppresses it today. How: This finds picRcdObj's own conditional (if any) and checks whether it is currently active and triggered.


		if ( !picRcdObj.conditionalId ) return false; // What: No Conditional Guard. Why: A picker with no attached conditional at all can never be suppressed. How: This returns false immediately when picRcdObj's own conditionalId is missing.



		const conRcdObj = staAppObj.conditionals.find( ( curConObj ) => curConObj.id === picRcdObj.conditionalId ); // What: Conditional Record Object. Why: The return below needs the real conditional record, not just its id. How: This finds staAppObj's own conditional matching picRcdObj's own conditionalId.



		return CON_NAM_OBJ.supGatFun( conRcdObj ); // What: Suppressed Return. Why: The caller needs one combined answer. How: This calls CON_NAM_OBJ.supGatFun, which already tolerates a nullish conRcdObj on its own.


	};



	return (


		<div className={ cssModObj.logPanDiv }>{ /* What: Group Log Panel Div Element. Why: This is GroLogCom's own root element. How: This renders the panel header, the shared key/legend, and the conditionals/pickers body below. */ }


			<div className={ cssModObj.panHeaDiv }>{ /* What: Panel Header Div Element. Why: This groups the panel's own kicker with its optional close button. How: This renders the kicker span plus onCloLogFun's own button when provided. */ }


				<span className={ cssModObj.panKicSpa }>{ /* What: Kicker Span Element. Why: The panel names which group it covers and when it was generated. How: This renders a log glyph plus groNamStr and forTimFun's own formatted time. */ }


					<IcoSetCom
						className={ cssModObj.kicIcoSvg }

						icoKeyStr='logEle'
					/>{ /* What: Icon Set Component. Why: The kicker needs a small recognizable log glyph. How: This renders IcoSetCom's own "log" shape. */ }



					<span>{ groNamStr } log · generated { forTimFun( staAppObj.today.generatedAt ) }</span>{ /* What: Kicker Text Span Element. Why: The kicker's own text names the group and generation time. How: This renders groNamStr plus forTimFun's own result for staAppObj's own today.generatedAt. */ }


				</span>

				{ onCloLogFun && ( // What: Close Button Visibility Check. Why: A panel opened without a real close handler (none in this codebase today, but supported) needs no close button at all. How: This renders the close button only while onCloLogFun is truthy.


					<button
						className={ cssModObj.panCloBut }

						type='button'

						aria-label='Close log'

						onClick={ onCloLogFun }
					>{ /* What: Close Button Element. Why: This is the panel's own dismiss control. How: This calls onCloLogFun on click. */ }


						<IcoSetCom
							className={ cssModObj.cloIcoSvg }

							icoKeyStr='xEle'
							strWidNum={ 2 }
						/>{ /* What: Icon Set Component. Why: An X glyph marks the close control. How: This draws the X shape. */ }


					</button> // What: Close Button Element. Why: This is the panel's own dismiss control. How: This calls onCloLogFun on click.


				) }


			</div>

			<div
				className={ cssModObj.logKeyDiv }

				data-element-name-hook='logKeyDiv'
			>{ /* What: Key Legend Div Element. Why: The panel needs a one-time legend explaining every status chip's own meaning. How: This renders 5 icon/label pairs, one per possible status. Its data-element-name-hook is read by help mode's Today catalog. */ }


				<span className={ cssModObj.panKicSpa }>Key</span>{ /* What: Key Kicker Span Element. Why: The legend needs its own small title. How: This renders the literal text "Key". */ }

				<span className={ cssModObj.keyIteSpa }>{ /* What: Key Items Span Element. Why: All 5 legend entries are grouped as one inline run. How: This renders one keyEntSpa span per possible status chip. */ }


					<span className={ cssModObj.keyEntSpa }>{ /* What: Auto Key Item Span Element. Why: The legend needs an entry explaining the auto-picked chip. How: This renders the shuffle glyph plus its own bold label. */ }


						<span className={` ${ cssModObj.staIcoSpa }   ${ cssModObj.staIcoSpaAuto } `}>{ /* What: Auto Key Icon Span Element. Why: The legend icon is tinted like the real chip. How: This wraps the glyph in the chip's own color class. */ }


							<IcoSetCom
								className={ cssModObj.icoGlySvg }

								icoKeyStr='shuEle'
							/>{ /* What: Icon Set Component. Why: The legend shows the same glyph the chip uses. How: This draws the shuEle shape. */ }


						</span>

						<b className={ cssModObj.keyNamBol }>Auto-picked</b>{ /* What: Auto Key Label Element. Why: The legend names what the chip means. How: This renders the bold label. */ }


					</span>

					<span className={ cssModObj.keyEntSpa }>{ /* What: Pushed Key Item Span Element. Why: The legend needs an entry explaining the pushed chip. How: This renders the push glyph plus its own bold label. */ }


						<span className={` ${ cssModObj.staIcoSpa }   ${ cssModObj.staIcoSpaPush } `}>{ /* What: Pushed Key Icon Span Element. Why: The legend icon is tinted like the real chip. How: This wraps the glyph in the chip's own color class. */ }


							<IcoSetCom
								className={ cssModObj.icoGlySvg }

								icoKeyStr='pusEle'
								strWidNum={ 2.4 }
							/>{ /* What: Icon Set Component. Why: The legend shows the same glyph the chip uses. How: This draws the pusEle shape. */ }


						</span>

						<b className={ cssModObj.keyNamBol }>Pushed</b>{ /* What: Pushed Key Label Element. Why: The legend names what the chip means. How: This renders the bold label. */ }


					</span>

					<span className={ cssModObj.keyEntSpa }>{ /* What: Rolled Off Key Item Span Element. Why: The legend needs an entry explaining the rolled-off chip. How: This renders the roll glyph plus its own bold label. */ }


						<span className={` ${ cssModObj.staIcoSpa }   ${ cssModObj.staIcoSpaRoll } `}>{ /* What: Rolled Off Key Icon Span Element. Why: The legend icon is tinted like the real chip. How: This wraps the glyph in the chip's own color class. */ }


							<IcoSetCom
								className={ cssModObj.icoGlySvg }

								icoKeyStr='rolEle'
								strWidNum={ 2.2 }
							/>{ /* What: Icon Set Component. Why: The legend shows the same glyph the chip uses. How: This draws the rolEle shape. */ }


						</span>

						<b className={ cssModObj.keyNamBol }>Rolled off</b>{ /* What: Rolled Off Key Label Element. Why: The legend names what the chip means. How: This renders the bold label. */ }


					</span>

					<span className={ cssModObj.keyEntSpa }>{ /* What: Skipped Key Item Span Element. Why: The legend needs an entry explaining the skipped chip. How: This renders the x glyph plus its own bold label. */ }


						<span className={` ${ cssModObj.staIcoSpa }   ${ cssModObj.staIcoSpaSkip } `}>{ /* What: Skipped Key Icon Span Element. Why: The legend icon is tinted like the real chip. How: This wraps the glyph in the chip's own color class. */ }


							<IcoSetCom
								className={ cssModObj.icoGlySvg }

								icoKeyStr='xEle'
								strWidNum={ 2.6 }
							/>{ /* What: Icon Set Component. Why: The legend shows the same glyph the chip uses. How: This draws the xEle shape. */ }


						</span>

						<b className={ cssModObj.keyNamBol }>Skipped</b>{ /* What: Skipped Key Label Element. Why: The legend names what the chip means. How: This renders the bold label. */ }


					</span>

					<span className={ cssModObj.keyEntSpa }>{ /* What: Completed Key Item Span Element. Why: The legend needs an entry explaining the completed chip. How: This renders the check glyph plus its own bold label. */ }


						<span className={` ${ cssModObj.staIcoSpa }   ${ cssModObj.staIcoSpaDone } `}>{ /* What: Completed Key Icon Span Element. Why: The legend icon is tinted like the real chip. How: This wraps the glyph in the chip's own color class. */ }


							<IcoSetCom
								className={ cssModObj.icoGlySvg }

								icoKeyStr='cheEle'
								strWidNum={ 3 }
							/>{ /* What: Icon Set Component. Why: The legend shows the same glyph the chip uses. How: This draws the cheEle shape. */ }


						</span>

						<b className={ cssModObj.keyNamBol }>Completed</b>{ /* What: Completed Key Label Element. Why: The legend names what the chip means. How: This renders the bold label. */ }


					</span>


				</span>


			</div>

			<div className={ cssModObj.logBodDiv }>{ /* What: Group Body Div Element. Why: This groups the conditionals section with every picker block below it. How: This renders ConSecCom followed by one PicBloCom per sorPicArr entry. */ }


				<ConSecCom
					picGroArr={ sorPicArr }
					staAppObj={ staAppObj }
				/>{ /* What: Conditional Section Component. Why: This group's own attached conditionals (if any) render above its pickers. How: This passes staAppObj and the sorted picker array straight through; ConSecCom needs no day key since it reads today's own generation snapshot directly, not a per-day pick-log scan. */ }



				{ sorPicArr.map( ( picRcdObj ) => ( // What: Picker Block Map Callback. Why: One block is needed per picker in sorPicArr. How: This renders PicBloCom for each, passing whether cheSupFun finds it suppressed today.


					<PicBloCom
						key={ picRcdObj.id }

						dayKeyStr={ dayKeyStr }
						isaSupBoo={ cheSupFun( picRcdObj ) }
						picRcdObj={ picRcdObj }
						staAppObj={ staAppObj }
					/> // What: Picker Block Component. Why: This renders one picker's own full log block for today. How: This is keyed by picRcdObj's own id, passed staAppObj, picRcdObj, dayKeyStr, and cheSupFun's own suppressed check.


				) ) }


			</div>


		</div>


	);


}

// #endregion GroLogCom



type LccProTyp = { onTogLogFun : () => void, open : boolean }; // What: Log-Chip-Component Props Type. Why: The log chip opens and closes a section's log panel. How: This types LogChiCom's props.

// #region LogChiCom

/**
 * LogChiCom = Log Chip Component
 *
 * @summary
 * The small "Log" chip shown on a group header (and the Reminders
 * header) that opens/closes that section's own log panel below it.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.onTogLogFun - On Toggle Log Function: Called when the chip is
 *                            clicked; the caller owns actually toggling its
 *                            own log panel open state.
 * @param props.open        - Open: Whether this section's own log panel is
 *                            currently open; drives the chip's own
 *                            aria-pressed state, which its styling keys off.
 *
 * @returns This component's own single rendered button.
 *
 * @example
 * ```tsx
 * LogChiCom({ onTogLogFun, open }) // => <LogChiCom />
 * ```
 *
*/

function LogChiCom ( { onTogLogFun, open } : LccProTyp ) : React.JSX.Element {


	return (


		<button
			className={ cssModObj.logChiBut }

			data-element-name-hook='logChiBut'

			type='button'

			aria-label={ open ? 'Hide day log' : 'Show day log' } // What: Chip Label Pick. Why: The screen reader label names the action the chip will take. How: This says Hide while open and Show otherwise.
			aria-pressed={ open }

			onClick={ ( cliEveObj ) => { // What: Chip Click Handler. Why: The chip sits inside a clickable group header whose own click must not also fire. How: This stops the click from bubbling, then toggles the panel.


				cliEveObj.stopPropagation(); // What: Header Click Isolation. Why: The group header has its own click behavior. How: This stops the click from bubbling to it.

				onTogLogFun(); // What: Log Toggle Call. Why: The caller owns the panel's open state. How: This calls onTogLogFun.


			} }
		>{ /* What: Day Log Toggle Button Element. Why: This is LogChiCom's own single rendered element. How: This shows open through its aria-pressed state, which its styling keys off, and toggles the panel without the click reaching the group header. Its data-element-name-hook is read by help mode's Today catalog. */ }


			<IcoSetCom
				className={ cssModObj.chiIcoSvg }

				icoKeyStr='logEle'
			/>{ /* What: Icon Set Component. Why: The chip needs a small recognizable log glyph next to its own label. How: This renders IcoSetCom's own "log" shape. */ }

			{ ' Log' }{ /* What: Chip Label Text. Why: The chip needs a plain visible label alongside its own icon. How: This renders the literal text " Log". */ }


		</button>


	);


}

// #endregion LogChiCom



type RlcProTyp = { onCloLogFun : () => void, staAppObj : StaAppTyp }; // What: Reminder-Log-Component Props Type. Why: The reminders' log panel covers every reminder and can be closed. How: This types RemLogCom's props.

// #region RemLogCom

/**
 * RemLogCom = Reminders Log Component
 *
 * @summary
 * The Reminders section's own log panel, listing every non-hidden
 * task/reminder with its own current status (done/due today/skipped/
 * not yet due) and, for a not-yet-due one, a short relative due label.
 * Pinned to the last generation's own anchor date (TAS_NAM_OBJ.ancDatFun),
 * not live "now", since this panel is a snapshot of the Reminders
 * section right above it, itself frozen to the last generate() call
 * until the next one runs.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.onCloLogFun - On Close Log Function: Called when the panel's
 *                            own close button is pressed; omitted entirely
 *                            suppresses that button.
 * @param props.staAppObj   - State App Object: The whole app state object.
 *
 * @returns This panel's own full reminders log.
 *
 * @example
 * ```tsx
 * RemLogCom({ onCloLogFun, staAppObj }) // => <RemLogCom />
 * ```
 *
*/

function RemLogCom ( { onCloLogFun, staAppObj } : RlcProTyp ) : React.JSX.Element {


	const ancDatObj = TAS_NAM_OBJ.ancDatFun( staAppObj.today && staAppObj.today.generatedAt );                         // What: Anchor Date Object. Why: Every lookup below must use the same frozen anchor the Reminders section above this panel already used. How: This calls TAS_NAM_OBJ.ancDatFun with staAppObj's own today.generatedAt, if any.
	const dayKeyStr = isoDayFun( ancDatObj );                                                                          // What: Day Key String. Why: The skipped-lookup below needs a plain date key to match against, scoped to ancDatObj rather than live "now". How: This calls isoDayFun with ancDatObj.
	const tasLisArr = staAppObj.tasks.filter( ( curTasObj ) => !curTasObj.hidden );                                    // What: Task List Array. Why: A hidden task/reminder never belongs in this log at all. How: This filters staAppObj's own tasks down to the non-hidden ones.
	const visTasArr = TAS_NAM_OBJ.visTodFun( staAppObj.tasks, staAppObj.reminderOpts, staAppObj.holidays, ancDatObj ); // What: Visible Task Array. Why: The status below needs to know which tasks are actually due today. How: This calls TAS_NAM_OBJ.visTodFun with staAppObj's own tasks/reminderOpts/holidays and ancDatObj.
	const visIdeSet = new Set( visTasArr.map( ( curTasObj ) => curTasObj.id ) );                                       // What: Visible Identifier Set. Why: The status below needs a fast membership check, not a repeated array scan. How: This maps visTasArr down to just its own ids.


	const skiIdeSet = new Set( // What: Skipped Identifier Set. Why: The status below needs to know which tasks were manually skipped specifically today. How: This filters staAppObj's own reminderSkipLog down to today's own rows, then maps to their own taskId.


		staAppObj.reminderSkipLog // What: Skip Log Source. Why: Every manual skip ever recorded is a candidate. How: This reads the skip log.
			.filter( ( logRowObj ) => isoDayFun( new Date( logRowObj.skippedAt ) ) === dayKeyStr ) // What: Today Skip Filter. Why: Only a skip made on the anchor day counts. How: This keeps rows whose own skippedAt falls on dayKeyStr.
			.map( ( logRowObj ) => logRowObj.taskId )                                              // What: Task Id Map. Why: The set only needs the skipped task ids. How: This maps each row to its own taskId.


	);


	const remRowArr = tasLisArr.map( ( curTasObj ) => { // What: Reminder Row Array. Why: One display row is needed per task/reminder in tasLisArr. How: This computes each row's own status and (once not-yet-due) its own due label before returning its shape below.


		const tasDonBoo = TAS_NAM_OBJ.isaDonFun( curTasObj, ancDatObj ); // What: Task Done Boolean. Why: A done task always outranks every other status below. How: This calls TAS_NAM_OBJ.isaDonFun for curTasObj/ancDatObj.

		let rowStaStr = 'notdue'; // What: Row Status String And Fallthrough. Why: Every task starts as not-yet-due until one of the checks below says otherwise. How: This is overwritten by whichever of the 3 checks below matches first.


		if ( tasDonBoo ) rowStaStr = 'done'; // What: Done Status Check. Why: Done always wins over every other status. How: This sets rowStaStr to 'done' once tasDonBoo is true.

		else if ( skiIdeSet.has( curTasObj.id ) ) rowStaStr = 'skip'; // What: Skip Status Check. Why: A manually-skipped task (that wasn't also done) is its own distinct status. How: This sets rowStaStr to 'skip' once curTasObj's own id is in skiIdeSet.

		else if ( visIdeSet.has( curTasObj.id ) ) rowStaStr = 'due'; // What: Due Status Check. Why: A currently-visible task (neither done nor skipped) is due today. How: This sets rowStaStr to 'due' once curTasObj's own id is in visIdeSet.



		let dueLabStr = null; // What: Due Label String And Fallthrough. Why: Only a genuinely not-yet-due task ever gets a relative due label at all. How: This stays null unless the guard below overwrites it.


		if ( rowStaStr === 'notdue' ) { // What: Not Due Guard. Why: A relative due label only makes sense for a task that is neither done, skipped, nor due today. How: This computes and assigns dueLabStr only while rowStaStr is still 'notdue'.


			const nexDatObj = TAS_NAM_OBJ.nexEliFun( curTasObj, staAppObj.reminderOpts, staAppObj.holidays, ancDatObj, true ); // What: Next Date Object. Why: This is the raw next-occurrence Date forDueFun below needs, honoring an active manual skip so the label reflects when the reminder actually reappears. How: This calls TAS_NAM_OBJ.nexEliFun with resSkiBoo set true.

			dueLabStr = forDueFun( nexDatObj, dayKeyStr ); // What: Due Label String Assign. Why: The row below needs the final short relative label, not the raw Date. How: This calls forDueFun with nexDatObj and dayKeyStr.


		}



		return { // What: Reminder Row Return. Why: The render below destructures exactly these 4 fields per row. How: This bundles curTasObj with its own status, due label and schedule summary.


			dueLabStr : dueLabStr,                         // What: Due Label String. Why: A not-yet-due row shows when it next appears. How: This is the forDueFun label, or null.
			rowStaStr : rowStaStr,                         // What: Row Status String. Why: The row's own status decides its pill and class. How: This is one of done, due, skip or notdue.
			tasRcdObj : curTasObj,                         // What: Task Record Object. Why: The row renders the task's own name and id. How: This is curTasObj itself.
			wheSumStr : TAS_NAM_OBJ.sumTasFun( curTasObj ) // What: When Summary String. Why: Every row shows its own schedule in words. How: This calls TAS_NAM_OBJ.sumTasFun for curTasObj.


		};


	} );



	const staRanObj : Record< string, number > = { done : 0, due : 1, notdue : 3, skip : 2 }; // What: Status Rank Object. Why: The sort below needs a numeric priority per status to order the rows sensibly. How: This is indexed just below by each row's own rowStaStr.

	remRowArr.sort( ( rowOneObj, rowTwoObj ) => ( staRanObj[ rowOneObj.rowStaStr ] - staRanObj[ rowTwoObj.rowStaStr ] ) || ( rowOneObj.tasRcdObj.name < rowTwoObj.tasRcdObj.name ? -1 : 1 ) ); // What: Reminder Row Sort Call. Why: Rows should group by status first, then alphabetically within a status. How: This sorts remRowArr by staRanObj's own rank difference, falling back to a plain name comparison when ranks tie.



	return (


		<div className={ cssModObj.logPanDiv }>{ /* What: Reminders Log Panel Div Element. Why: This is RemLogCom's own root element. How: This renders the panel header plus the reminder rows body below. */ }


			<div className={ cssModObj.panHeaDiv }>{ /* What: Panel Header Div Element. Why: This groups the panel's own kicker with its optional close button. How: This renders the kicker span plus onCloLogFun's own button when provided. */ }


				<span className={ cssModObj.panKicSpa }>{ /* What: Kicker Span Element. Why: The panel names which anchor date this snapshot covers. How: This renders a clock glyph plus ancDatObj's own formatted weekday/date. */ }


					<IcoSetCom
						className={ cssModObj.kicIcoSvg }

						icoKeyStr='clcEle'
					/>{ /* What: Icon Set Component. Why: The kicker needs a small recognizable clock glyph. How: This renders IcoSetCom's own "clock" shape. */ }



					<span>Reminders log · { ancDatObj.toLocaleDateString( 'en-US', { day : 'numeric', month : 'short', weekday : 'short' } ) }</span>{ /* What: Kicker Text Span Element. Why: The kicker's own text names which day this snapshot covers. How: This formats ancDatObj as e.g. "Wed, Jun 12". */ }


				</span>

				{ onCloLogFun && ( // What: Close Button Visibility Check. Why: A panel opened without a real close handler (none in this codebase today, but supported) needs no close button at all. How: This renders the close button only while onCloLogFun is truthy.


					<button
						className={ cssModObj.panCloBut }

						type='button'

						aria-label='Close log'

						onClick={ onCloLogFun }
					>{ /* What: Close Button Element. Why: This is the panel's own dismiss control. How: This calls onCloLogFun on click. */ }


						<IcoSetCom
							className={ cssModObj.cloIcoSvg }

							icoKeyStr='xEle'
							strWidNum={ 2 }
						/>{ /* What: Icon Set Component. Why: An X glyph marks the close control. How: This draws the X shape. */ }


					</button> // What: Close Button Element. Why: This is the panel's own dismiss control. How: This calls onCloLogFun on click.


				) }


			</div>


			<div className={` ${ cssModObj.logBodDiv }   ${ cssModObj.logBodDivRem } `}>{ /* What: Reminders Body Div Element. Why: The reminders table sits inset under the panel header, its header cells carrying their own data-element-name-hook values for help mode instead of borrowing the data rows' styled classes. How: This renders the header row plus one row per remRowArr entry below. */ }


				<div className={ cssModObj.remHeaDiv }>{ /* What: Reminders Table Head Div Element. Why: This table needs its own 3-column header row. How: This renders the 3 shared column-header spans. */ }


					<span data-element-name-hook='remNamSpa'>Reminder</span>{ /* What: Reminder Header Span Element. Why: This labels the name column. How: This renders the literal text "Reminder". Its data-element-name-hook is read by help mode's Today catalog. */ }

					<span
						className={ cssModObj.heaWheSpa }

						data-element-name-hook='remWheSpa'
					>When</span>{ /* What: When Header Span Element. Why: This labels the schedule column. How: This renders the literal text "When". Its data-element-name-hook is read by help mode's Today catalog. */ }

					<span
						className={ cssModObj.heaStaSpa }

						data-element-name-hook='remStaSpa'
					>Status</span>{ /* What: Status Header Span Element. Why: This labels the status column. How: This renders the literal text "Status". Its data-element-name-hook is read by help mode's Today catalog. */ }


				</div>

				{ remRowArr.length === 0 && <div className={ cssModObj.logEmpDiv }>No reminders yet.</div> }{ /* What: Empty Reminders Visibility Check. Why: No non-hidden tasks at all needs an explanatory row instead of an empty table. How: This renders only while remRowArr's own length is 0. */ }

				{ remRowArr.map( ( { dueLabStr, rowStaStr, tasRcdObj, wheSumStr } ) => ( // What: Reminder Row Map Callback. Why: One row is needed per remRowArr entry. How: This destructures each row and renders its own name/when/status cells.


					<div
						key={ tasRcdObj.id }

						className={ cssModObj.remRowDiv }

						data-row-done-active={ rowStaStr === 'done' || undefined } // What: Row Done Active Attribute. Why: A done reminder's row reads green. How: This sets the presence-only attribute while rowStaStr is 'done'.
						data-row-due-active={ rowStaStr === 'due' || undefined } // What: Row Due Active Attribute. Why: A reminder due today reads in the accent. How: This sets the presence-only attribute while rowStaStr is 'due'.
						data-row-upcoming-active={ rowStaStr === 'notdue' || undefined } // What: Row Upcoming Active Attribute. Why: A reminder not due yet reads quieter. How: This sets the presence-only attribute while rowStaStr is 'notdue'.
					>{ /* What: Reminder Row Div Element. Why: This is one task/reminder's own full row. How: This marks itself with data-row-done-active, data-row-due-active, or data-row-upcoming-active from rowStaStr. */ }


						<InfTipCom
							className={ cssModObj.remNamSpa }

							data-element-name-hook='remNamSpa'

							labTexStr={ tasRcdObj.name }
							trnOnlBoo
						>{ tasRcdObj.name }</InfTipCom>{ /* What: Info Tip Component. Why: A long reminder name can truncate in a narrow layout. How: This renders tasRcdObj's own name as a truncation-revealing InfTipCom. Its data-element-name-hook is read by help mode's Today catalog. */ }



						<span
							className={ cssModObj.remWheSpa }

							data-element-name-hook='remWheSpa'
						>{ wheSumStr }</span>{ /* What: Reminder When Span Element. Why: Every row shows its own plain schedule summary. How: This renders wheSumStr directly. Its data-element-name-hook is read by help mode's Today catalog. */ }

						<span
							className={ cssModObj.remStaSpa }

							data-element-name-hook='remStaSpa'
						>{ /* What: Reminder Status Span Element. Why: The last column shows this row's own current status, differently per rowStaStr. How: This renders one of 4 status variants below, matched on rowStaStr. Its data-element-name-hook is read by help mode's Today catalog. */ }


							{ rowStaStr === 'done' && ( // What: Done Status Visibility Check. Why: A done row shows its own check icon plus a Done pill. How: This renders only while rowStaStr is 'done'.


								<React.Fragment>{ /* What: Done Status Fragment Element. Why: The check icon and its own Done pill are true siblings with no shared wrapper of their own. How: This groups both without adding an extra DOM node. */ }


									<span className={` ${ cssModObj.staIcoSpa }   ${ cssModObj.staIcoSpaDone } `}>{ /* What: Done Icon Span Element. Why: A done row's own status needs a recognizable check glyph before its pill. How: This renders IcoSetCom's own "check" shape. */ }


										<IcoSetCom
											className={ cssModObj.icoGlySvg }

											icoKeyStr='cheEle'
											strWidNum={ 3 }
										/>{ /* What: Icon Set Component. Why: The status glyph matches the Day Log legend. How: This draws the cheEle shape. */ }


									</span>

									<span className={` ${ cssModObj.staPilSpa }   ${ cssModObj.staPilSpaDone } `}>Done</span>{ /* What: Done Pill Span Element. Why: The done row's own status needs a plain, fixed label alongside its icon. How: This renders the literal text "Done". */ }


								</React.Fragment>

							) }



							{ rowStaStr === 'due' && <span className={` ${ cssModObj.staPilSpa }   ${ cssModObj.staPilSpaDue } `}>Due today</span> }{ /* What: Due Status Visibility Check. Why: A due-today row shows a plain Due pill. How: This renders only while rowStaStr is 'due'. */ }



							{ rowStaStr === 'skip' && ( // What: Skip Status Visibility Check. Why: A skipped row shows its own x icon plus a Skipped pill. How: This renders only while rowStaStr is 'skip'.


								<React.Fragment>{ /* What: Skip Status Fragment Element. Why: The x icon and its own Skipped pill are true siblings with no shared wrapper of their own. How: This groups both without adding an extra DOM node. */ }


									<span className={` ${ cssModObj.staIcoSpa }   ${ cssModObj.staIcoSpaSkip } `}>{ /* What: Skip Icon Span Element. Why: A skipped row's own status needs a recognizable x glyph before its pill. How: This renders IcoSetCom's own "x" shape. */ }


										<IcoSetCom
											className={ cssModObj.icoGlySvg }

											icoKeyStr='xEle'
											strWidNum={ 2.6 }
										/>{ /* What: Icon Set Component. Why: The status glyph matches the Day Log legend. How: This draws the xEle shape. */ }


									</span>

									<span className={` ${ cssModObj.staPilSpa }   ${ cssModObj.staPilSpaSkipped } `}>Skipped</span>{ /* What: Skip Pill Span Element. Why: The skipped row's own status needs a plain, fixed label alongside its icon. How: This renders the literal text "Skipped". */ }


								</React.Fragment>

							) }



							{ rowStaStr === 'notdue' && <span className={ cssModObj.notDueSpa }>{ dueLabStr }</span> }{ /* What: Not Due Status Visibility Check. Why: A not-yet-due row shows its own relative due label instead of a pill. How: This renders only while rowStaStr is 'notdue'. */ }


						</span>


					</div>


				) ) }


			</div>


		</div>


	);


}

// #endregion RemLogCom

// #endregion Components



// #region Exports

export { GroLogCom, LogChiCom, RemLogCom }; // What: Named Exports. Why: tab-today.tsx renders GroLogCom and LogChiCom, and reminders-section.tsx renders LogChiCom and RemLogCom. How: This exports the three components by name.

// #endregion Exports


