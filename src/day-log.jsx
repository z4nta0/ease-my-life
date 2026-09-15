


// #region Imports

import React from 'react'; // What: React. Why: This is the UI library every component in this file is built on. How: This is used directly (React.useState, React.Fragment) throughout, instead of importing individual named hooks.


import { CAD_NAM_OBJ } from './cadence.js';      // What: Cadence. Why: An ease-mode item's subline needs CAD_NAM_OBJ.uniWorFun to phrase its range in the picker's own cadence unit (days/weeks/months/years) instead of always "days". How: This is called once inside iteSubFun below.
import { ColDisCom   } from './ui.jsx';          // What: Collapse Disclosure Component. Why: PicBloCom's own item table only needs to exist in the DOM while its block is actually expanded. How: This wraps that table, driven by PicBloCom's own open/closed state.
import { CON_NAM_OBJ } from './conditionals.js'; // What: Conditionals. Why: ConSecCom needs CON_NAM_OBJ.modValFun to know whether a given conditional's own mode even has a value to show. How: This is called once per conditional row inside ConSecCom below.
import { InfTipCom   } from './ui.jsx';          // What: Info Tip Component. Why: Every truncatable name/label in this file (item, conditional, reminder) needs the shared reveal-on-truncation tooltip. How: This wraps those names/labels throughout PicBloCom, ConSecCom and RemLogCom.
import { TASKS       } from './tasks.js';        // What: Tasks. Why: RemLogCom needs the reminders engine's own scheduling helpers (anchorDate, visibleToday, isDoneToday, nextEligible, summary). How: These are called throughout RemLogCom below.

// #endregion Imports



/**
 * day-log.jsx = Day Log
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
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



const isoDayFun = ( inpDatObj = new Date() ) => { // What: Iso Day Function. Why: Every log lookup below needs a plain local-timezone "YYYY-MM-DD" key to match against state.pickLog's own date field. How: This shifts a copy of inpDatObj by its own timezone offset before slicing the ISO string down to just the date.


	const adjDatObj = new Date( inpDatObj ); // What: Adjusted Date Object. Why: The timezone shift below must never mutate the caller's own inpDatObj. How: This copies inpDatObj into a fresh, freely-mutable Date.

	adjDatObj.setMinutes( adjDatObj.getMinutes() - adjDatObj.getTimezoneOffset() ); // What: Timezone Shift Call. Why: toISOString below always renders in UTC, which would silently roll the date over near local midnight without this shift. How: This subtracts adjDatObj's own timezone offset from its own minutes.



	return adjDatObj.toISOString().slice( 0, 10 ); // What: Day Key Return. Why: The caller needs just the plain date portion, not a full ISO timestamp. How: This slices adjDatObj's own shifted ISO string down to its first 10 characters.


};



const THR_VAL_NUM = 100; // What: Threshold Value Number. Why: Every ease-mode range shown in this file (item and conditional sublines alike) is relative to this same full-charge ceiling. How: This is divided into below wherever a soonest/latest day count is derived from an ease-min/ease-max pair.



const hasValFun = ( picModStr ) => { // What: Has Value Function. Why: PicBloCom and ValCelCom both need to know whether a picker's own mode tracks a numeric value at all, since random/weighted modes have nothing to show in the At-generation/After columns. How: This is called with a picker's own mode string.


	const easUpBoo  = picModStr === 'ease-up';   // What: Ease Up Boolean. Why: This mode is one of the 3 that track a numeric value. How: This checks picModStr against the literal 'ease-up' mode key.
	const easDowBoo = picModStr === 'ease-down'; // What: Ease Down Boolean. Why: This mode is one of the 3 that track a numeric value. How: This checks picModStr against the literal 'ease-down' mode key.
	const dynModBoo = picModStr === 'dynamic';   // What: Dynamic Mode Boolean. Why: This mode is one of the 3 that track a numeric value. How: This checks picModStr against the literal 'dynamic' mode key.

	const hasValBoo = easUpBoo || easDowBoo || dynModBoo; // What: Has Value Boolean. Why: The caller only needs one combined answer, not the 3 individual mode checks. How: This is true whenever any one of the 3 value-tracking modes matched.


	return hasValBoo; // What: Has Value Return. Why: The caller needs the combined answer back. How: This returns hasValBoo directly.


};



// #region IcoSetCom

/**
 * IcoSetCom = Icon Set Component
 *
 * @summary
 * A small self-contained icon renderer, deliberately independent of
 * ui.jsx's own Icon component so this whole log panel never depends on
 * the app-wide icon set changing shape underneath it.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.icoKeyStr  - Icon Key String: Which shape to render; looked up
 *                           in this component's own isePatObj.
 * @param props.strWidNum  - String Width Number: The SVG stroke width,
 *                           defaulting to 2.
 *
 * @returns This component's own single rendered svg element.
 *
 * @example
 * ```tsx
 * IcoSetCom({ icoKeyStr, strWidNum }) // => <IcoSetCom />
 * ```
 *
*/

function IcoSetCom ( { icoKeyStr, strWidNum = 2 } ) {


	const isePatObj = { // What: Icon-Shape-Element Path Object. Why: This is the lookup table mapping every icon key this file uses to its own inline SVG shape markup. How: This is indexed below by icoKeyStr to pick which shape the rendered svg actually draws.


		logEle : <><path d='M3 5h18M3 12h18M3 19h18' /></>,                                                                              // What: Log Element. Why: This marks the DayLogChip toggle and every panel's own kicker. How: This draws 3 stacked horizontal lines.
		shuEle : <><path d='M16 3h5v5' /><path d='M4 20 21 3' /><path d='M21 16v5h-5' /><path d='m15 15 6 6' /><path d='m4 4 5 5' /></>, // What: Shuffle Element. Why: This marks an auto-picked status. How: This draws a pair of crossing shuffle-style arrows.
		pusEle : <><path d='M12 19V5M5 12l7-7 7 7' /></>,                                                                                // What: Push Element. Why: This marks a manually pushed/rerolled status. How: This draws an upward arrow.
		rolEle : <><path d='M3 2v6h6' /><path d='M3 8a9 9 0 1 0 3-5' /></>,                                                              // What: Roll Element. Why: This marks a rolled-off status. How: This draws a counter-clockwise arrow.
		xEle   : <><path d='M18 6 6 18M6 6l12 12' /></>,                                                                                 // What: X Element. Why: This marks a skipped status, and a close button. How: This draws a plain X shape.
		cheEle : <><path d='M20 6 9 17l-5-5' /></>,                                                                                      // What: Check Element. Why: This marks a completed status. How: This draws a single checkmark stroke.
		mooEle : <><path d='M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z' /></>,                                                                   // What: Moon Element. Why: This marks a picker resting today under a triggered conditional. How: This draws a crescent moon shape.
		braEle : <><path d='M4 4v10a4 4 0 0 0 4 4h12' /><path d='m16 14 4 4-4 4' /></>,                                                  // What: Branch Element. Why: This marks the strip listing which pickers a conditional affects. How: This draws a branching arrow shape.
		clcEle : <><path d='M12 8v4l3 3' /><circle cx='12' cy='12' r='9' /></>,                                                          // What: Clock Element. Why: This marks RemLogCom's own kicker. How: This draws a plain clock face, keyed clcEle (escalated past the usual clo truncation, since clo already heavily means Close throughout this codebase, per the Naming-conflict resolution rule).
		chvEle : <><path d='m6 9 6 6 6-6' /></>                                                                                          // What: Chevron Element. Why: This marks PicBloCom's own expand/collapse toggle. How: This draws a plain downward chevron, keyed chvEle (escalated past the usual che truncation, since that collides with cheEle just above, per the Naming-conflict resolution rule).


	};

	const icoShaEle = isePatObj[ icoKeyStr ]; // What: Icon Shape Element. Why: This is the single shape the svg below actually renders. How: This reads isePatObj's own entry for icoKeyStr.



	return (


		<svg
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



// #region DayLogChip

/**
 * DayLogChip = Day Log Chip
 *
 * @summary
 * The small "Log" chip shown on a group header (and the Reminders
 * header) that opens/closes that section's own log panel below it.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.open    - Open: Whether this section's own log panel is
 *                        currently open; drives the chip's own "is-on" styling
 *                        and aria-pressed state.
 * @param props.onClick - On Click: Called when the chip is clicked; the caller
 *                        owns actually toggling its own log panel open state.
 *
 * @returns This component's own single rendered button.
 *
 * @example
 * ```tsx
 * DayLogChip({ open, onClick }) // => <DayLogChip />
 * ```
 *
*/

function DayLogChip ( { open, onClick } ) {


	return (


		<button
			type='button'
			className={ `dl-chip ${ open ? 'is-on' : '' }` }
			aria-pressed={ open }
			aria-label={ open ? 'Hide day log' : 'Show day log' }
			onClick={ ( clkEveObj ) => { clkEveObj.stopPropagation(); onClick(); } }
		>{ /* What: Day Log Toggle Button Element. Why: This is DayLogChip's own single rendered element. How: This shows open as both its "is-on" class and its aria-pressed state, stops the click from also reaching the group header's own onClick, then calls onClick. */ }


			<IcoSetCom icoKeyStr='logEle' />{ /* What: Icon Shape Component. Why: The chip needs a small recognizable log glyph next to its own label. How: This renders IcoSetCom's own "log" shape. */ }
			{ ' Log' }{ /* What: Chip Label Text. Why: The chip needs a plain visible label alongside its own icon. How: This renders the literal text " Log". */ }


		</button>


	);


}

// #endregion DayLogChip



// #region dayFlaFun

/**
 * dayFlaFun = Day Flags Function
 *
 * @summary
 * Builds a per-item status-flags map for one picker on one day, purely
 * derived from state.pickLog's own rows (never mutated). Every row
 * matching this picker/day contributes to its own item's flags: auto
 * for an auto-picked row, pushed for a manual/reroll row, rolledOff or
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
 * @returns A Map from itemId to its own { autBoo, pusBoo, rolBoo,
 * skiBoo, comBoo, anyBoo } flags.
 * @see {@link iteFlaMap}
 *
 * @example
 * ```ts
 * dayFlaFun(picLogArr, picIdeStr, dayKeyStr) // => iteFlaMap
 * ```
 *
*/

function dayFlaFun ( picLogArr, picIdeStr, dayKeyStr ) {


	const iteFlaMap = new Map(); // What: Item Flags Map. Why: Every matching row below folds into this same per-item accumulator. How: This starts empty and is populated by the loop below, keyed by itemId.


	for ( const logRowObj of ( picLogArr || [] ) ) { // What: Pick Log Row Loop. Why: Every row in picLogArr is a candidate contribution to iteFlaMap. How: This walks picLogArr (or an empty array when it's missing), skipping any row that isn't for this exact picker/day.


		if ( logRowObj.date !== dayKeyStr || logRowObj.pickerId !== picIdeStr ) continue; // What: Wrong Picker Or Day Guard. Why: Only a row for this exact picker on this exact day belongs in the result at all. How: This skips the rest of this iteration otherwise.



		let iteFlaObj = iteFlaMap.get( logRowObj.itemId ); // What: Item Flags Object. Why: Every row for the same item must fold into the same flags object, not a fresh one each time. How: This reads whatever iteFlaMap already has for logRowObj's own itemId, if anything.


		if ( !iteFlaObj ) { // What: First Row Guard. Why: The very first matching row for an item must create its own fresh flags object. How: This builds and registers a new, all-false iteFlaObj only when none exists yet.


			iteFlaObj = { autBoo : false, pusBoo : false, rolBoo : false, skiBoo : false, comBoo : false, anyBoo : false }; // What: Fresh Item Flags Object. Why: Every flag starts false until a real row below sets it. How: This is the initial shape stored into iteFlaMap for a newly-seen item.

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

function StaChiCom ( { iteFlaObj } ) {


	if ( !iteFlaObj || !iteFlaObj.anyBoo ) return <span className='dl-none dl-mk-status'>—</span>; // What: No Rows Guard. Why: An item with no pick-log rows today has nothing to show but a placeholder. How: This returns the em-dash placeholder span (a display glyph, not prose) before building any chips below.



	const chiTupArr = []; // What: Chip Tuple Array. Why: The checks below each conditionally contribute one chip tuple to this same array. How: This starts empty and is filled in place by the pushes below.


	if ( iteFlaObj.autBoo ) chiTupArr.push( [ 'auto', 'shuEle', 'Auto-picked', 2 ] );  // What: Auto Chip Push. Why: An auto-picked item needs its own chip. How: This appends a [key, icon, title, width] tuple when autBoo is true.
	if ( iteFlaObj.pusBoo ) chiTupArr.push( [ 'push', 'pusEle', 'Pushed', 2.4 ] );     // What: Pushed Chip Push. Why: A pushed item needs its own chip. How: This appends a [key, icon, title, width] tuple when pusBoo is true.
	if ( iteFlaObj.rolBoo ) chiTupArr.push( [ 'roll', 'rolEle', 'Rolled off', 2.2 ] ); // What: Rolled Off Chip Push. Why: A rolled-off item needs its own chip. How: This appends a [key, icon, title, width] tuple when rolBoo is true.
	if ( iteFlaObj.skiBoo ) chiTupArr.push( [ 'skip', 'xEle', 'Skipped', 2.6 ] );      // What: Skipped Chip Push. Why: A skipped item needs its own chip. How: This appends a [key, icon, title, width] tuple when skiBoo is true.
	if ( iteFlaObj.comBoo ) chiTupArr.push( [ 'done', 'cheEle', 'Completed', 3 ] );    // What: Completed Chip Push. Why: A completed item needs its own chip. How: This appends a [key, icon, title, width] tuple when comBoo is true.



	return (


		<span className='dl-status dl-mk-status'>{ /* What: Status Chip Row Span Element. Why: This is StaChiCom's own root element, holding every chip this item earned today. How: This maps chiTupArr into one small icon span per chip below. */ }


			{ chiTupArr.map( ( [ chiKeyStr, chiIcoStr, chiTitStr, chiWidNum ] ) => ( // What: Chip Map Callback. Why: One small span is needed per earned chip. How: This destructures each chiTupArr tuple and renders it as a titled icon span, keyed by chiKeyStr.


				<span
					key={ chiKeyStr }
					className={ `dl-ico dl-c-${ chiKeyStr }` }
					title={ chiTitStr }
				><IcoSetCom icoKeyStr={ chiIcoStr } strWidNum={ chiWidNum } /></span> // What: Status Chip Span Element. Why: Each earned status gets its own small colored icon. How: This renders IcoSetCom for chiIcoStr/chiWidNum, tinted by its own dl-c-{chiKeyStr} modifier class.


			) ) }


		</span>


	);


}

// #endregion StaChiCom



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
 * see pickers.js), shown in the same green as a positive delta since
 * it carries the same quantity the value columns track. "(+0)" is
 * shown explicitly, since a blank there would read as broken rather
 * than as "no boost", but in muted grey like a flat delta so zero
 * doesn't compete visually with a real boost.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param picRecObj - Picker Record Object: The item's own picker record.
 * @param iteRecObj - Item Record Object: The item record itself.
 * @param booValNum - Boolean Value Number: This item's own at-generation boost
 *                    snapshot (dynamic mode only), or null when not
 *                    applicable.
 *
 * @returns The item's own subline, as either a plain string or a
 * small React.Fragment.
 *
 * @example
 * ```tsx
 * iteSubFun(picRecObj, iteRecObj, booValNum) // => subline content
 * ```
 *
*/

function iteSubFun ( picRecObj, iteRecObj, booValNum ) {


	const picModStr = picRecObj.mode; // What: Picker Mode String. Why: Every branch below decides its own subline shape from this same picker mode. How: This reads picRecObj's own mode once for reuse throughout.


	if ( picModStr === 'dynamic' ) { // What: Dynamic Mode Branch. Why: Dynamic is the only mode that also shows a boost alongside its own weight. How: See the design-rationale block above for the full boost/weight relationship.


		const booRouNum = booValNum == null ? null : Math.round( booValNum ); // What: Boost Rounded Number. Why: A raw drift value can carry fractional cycles; only the rounded whole number is ever shown. How: This rounds booValNum, staying null when there is no snapshot at all.



		return (


			<React.Fragment>{ /* What: Dynamic Subline Fragment Element. Why: This item's own subline needs both a plain weight string and an optional boost span, without an extra wrapping DOM element. How: This renders the weight text, then booRouNum's own boost span when it isn't null. */ }


				{ `weight ${ iteRecObj.weight ?? 1 }` }{ /* What: Weight Text. Why: Every dynamic item still shows its own base weight first. How: This renders iteRecObj's own weight, defaulting to 1 for an older item with none set. */ }
				{ booRouNum == null ? null : <span className={ `dl-boost ${ booRouNum ? '' : 'is-zero' }` }> (+{ booRouNum })</span> }{ /* What: Boost Span Visibility Check. Why: A boost is only ever known at generation time, not for a manually-added item with no snapshot. How: This renders the "(+N)" boost span, muted via its own is-zero class when booRouNum is exactly 0. */ }


			</React.Fragment>


		);


	}



	if ( picModStr === 'weighted' ) return `weight ${ iteRecObj.weight ?? 1 }`; // What: Weighted Mode Return. Why: A weighted item's subline is just its own plain weight. How: This reads iteRecObj's own weight, defaulting to 1 for an older item with none set.



	if ( picModStr === 'ease-up' || picModStr === 'ease-down' ) { // What: Ease Mode Branch. Why: Both ease modes phrase their own subline as a soonest-latest day range instead of a weight. How: This computes that range from iteRecObj's own (or picRecObj's own) ease-min/ease-max.


		const easMinNum = iteRecObj.easeMin ?? picRecObj.easeMin ?? 1;                                                                             // What: Ease Min Number. Why: The range below needs this item's own effective ease-min, falling back to its picker's own. How: This reads iteRecObj's own easeMin, then picRecObj's own, then 1.
		const easMaxNum = iteRecObj.easeMax ?? picRecObj.easeMax ?? 1;                                                                             // What: Ease Max Number. Why: The range below needs this item's own effective ease-max, falling back to its picker's own. How: This reads iteRecObj's own easeMax, then picRecObj's own, then 1.
		const sooDayNum = Math.max( 1, Math.round( THR_VAL_NUM / easMaxNum ) );                                                                    // What: Soonest Day Number. Why: This is the earliest day count the range can show. How: This divides THR_VAL_NUM by easMaxNum, floored at 1 whole day.
		const latDayNum = Math.max( sooDayNum, Math.round( THR_VAL_NUM / easMinNum ) );                                                            // What: Latest Day Number. Why: This is the latest day count the range can show, never earlier than sooDayNum. How: This divides THR_VAL_NUM by easMinNum, floored at sooDayNum itself.
		const uniWorStr = ( picRecObj.cadence && picRecObj.cadence !== 'daily' ) ? CAD_NAM_OBJ.uniWorFun( picRecObj.cadence, latDayNum ) : 'days'; // What: Unit Word String. Why: A non-daily cadence needs its own scaled unit word (e.g. "weeks") instead of always "days". How: This calls CAD_NAM_OBJ.uniWorFun for a real non-daily cadence, otherwise falls back to the literal word "days".



		return `range ${ sooDayNum }–${ latDayNum } ${ uniWorStr }`; // What: Ease Range Return. Why: The caller needs the final range string back. How: This joins sooDayNum, latDayNum and uniWorStr with an en dash between the two numbers.


	}



	return 'no weight'; // What: No Weight Return. Why: Random mode has no weight or range to show at all. How: This is the final fallback once neither the dynamic, weighted nor ease branches above matched.


}

// #endregion iteSubFun



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
 * @param conRecObj - Conditional Record Object: The conditional record itself.
 *
 * @returns The conditional's own subline string.
 *
 * @example
 * ```ts
 * conSubFun(conRecObj) // => subline string
 * ```
 *
*/

function conSubFun ( conRecObj ) {


	if ( conRecObj.mode === 'ease-up' || conRecObj.mode === 'ease-down' ) { // What: Ease Mode Branch. Why: Both ease modes phrase their own subline as a soonest-latest day range. How: This computes that range from conRecObj's own threshold/ease-min/ease-max.


		const thrValNum = conRecObj.threshold ?? THR_VAL_NUM;                                          // What: Threshold Value Number. Why: This conditional's own range is relative to its own threshold, falling back to the shared default. How: This reads conRecObj's own threshold, or THR_VAL_NUM when it has none set.
		const sooDayNum = Math.max( 1, Math.round( thrValNum / ( conRecObj.easeMax ?? 14 ) ) );        // What: Soonest Day Number. Why: This is the earliest day count the range can show. How: This divides thrValNum by conRecObj's own easeMax (or 14), floored at 1 whole day.
		const latDayNum = Math.max( sooDayNum, Math.round( thrValNum / ( conRecObj.easeMin ?? 7 ) ) ); // What: Latest Day Number. Why: This is the latest day count the range can show, never earlier than sooDayNum. How: This divides thrValNum by conRecObj's own easeMin (or 7), floored at sooDayNum itself.



		return `range ${ sooDayNum }–${ latDayNum } days`; // What: Ease Range Return. Why: The caller needs the final range string back. How: This joins sooDayNum and latDayNum with an en dash between them.


	}



	if ( conRecObj.mode === 'dynamic' ) return `${ conRecObj.oddsPct ?? 50 }%+ odds`; // What: Dynamic Mode Return. Why: Dynamic odds are a floor rather than a fixed value. How: This reads conRecObj's own oddsPct, defaulting to 50, with a trailing "+" to signal it only ever climbs.



	if ( conRecObj.mode === 'weighted' ) return `${ conRecObj.oddsPct ?? 50 }% odds`; // What: Weighted Mode Return. Why: Weighted odds are a fixed value, unlike dynamic's floor. How: This reads conRecObj's own oddsPct, defaulting to 50.



	return '50% odds'; // What: Random Mode Return. Why: Random mode always runs at a flat 50/50. How: This is the final fallback once neither the ease, dynamic nor weighted branches above matched.


}

// #endregion conSubFun



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
 * @param props.hasValBoo - Has Value Boolean: Whether this row's own mode
 *                          tracks a value at all.
 * @param props.genValNum - Generation Value Number: The value at generation
 *                          time, or null/ undefined when there is no snapshot.
 * @param props.aftValNum - After Value Number: The current value, after
 *                          whatever happened today.
 * @param props.offValNum - Offset Value Number: The base weight to add to both
 *                          cells (dynamic items only); defaults to 0.
 *
 * @returns This row's own 3 value cells (at generation, delta, after),
 * as a React.Fragment.
 *
 * @example
 * ```tsx
 * ValCelCom({ hasValBoo, genValNum, aftValNum, offValNum }) // => <ValCelCom />
 * ```
 *
*/

function ValCelCom ( { hasValBoo, genValNum, aftValNum, offValNum = 0 } ) {


	if ( !hasValBoo || genValNum == null ) { // What: No Value Guard. Why: A moded-out row or one with no generation snapshot at all has nothing real to show in any of the 3 cells. How: This renders all 3 as N/A/flat placeholders before computing anything below.


		return (


			<React.Fragment>{ /* What: No Value Cells Fragment Element. Why: This row still needs all 3 value cell slots rendered, even with nothing real to show. How: This renders 2 N/A cells and a flat placeholder delta between them. */ }


				<span className='dl-val dl-mk-atgen r'><span className='dl-na'>N/A</span></span>{ /* What: At Generation Not Available Span Element. Why: There is no generation-time value to show. How: This renders the shared dl-na "N/A" placeholder. */ }

				<span className='dl-delta dl-mk-delta flat r'>—</span>{ /* What: Delta Placeholder Span Element. Why: With no real value, there is no real delta either. How: This renders the shared em-dash placeholder glyph (a display character, not prose). */ }

				<span className='dl-val dl-mk-after r'><span className='dl-na'>N/A</span></span>{ /* What: After Not Available Span Element. Why: There is no current value to show either. How: This renders the shared dl-na "N/A" placeholder. */ }


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


			<span className='dl-val dl-mk-atgen r'>{ effGenNum }</span>{ /* What: At Generation Value Span Element. Why: This is the row's own value as it stood at generation time. How: This renders effGenNum directly. */ }

			<span className={ `dl-delta dl-mk-delta ${ treClaStr } r` }>{ disTexStr }</span>{ /* What: Delta Value Span Element. Why: This is the row's own signed change since generation. How: This renders disTexStr, tinted by its own treClaStr direction class. */ }

			<span className='dl-val dl-after dl-mk-after r'>{ effAftNum }</span>{ /* What: After Value Span Element. Why: This is the row's own current value. How: This renders effAftNum directly. */ }


		</React.Fragment>


	);


}

// #endregion ValCelCom



const forTimFun = ( isoStr ) => { // What: Format Time Function. Why: Both GroLogCom's kicker needs a plain "3:42 PM" style time for when the day was generated. How: This builds a Date from isoStr and formats it via toLocaleTimeString, swallowing an invalid input as an empty string.


	try { return new Date( isoStr ).toLocaleTimeString( [], { hour : 'numeric', minute : '2-digit' } ); } // What: Format Attempt. Why: An otherwise-valid isoStr should render as a plain local time. How: This builds a Date from isoStr and formats it with no seconds.

	catch ( e ) { return ''; } // What: Format Error Guard. Why: A missing/invalid isoStr must not crash whichever caller invoked this. How: This returns an empty string instead of letting the error propagate.


};



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

function TabHeaCom ( { heaLabStr = 'Item' } ) {


	return (


		<div className='dl-thead'>{ /* What: Table Head Div Element. Why: This is TabHeaCom's own root element. How: This renders the 5 shared column headers below. */ }


			<span className='dl-mk-item'>{ heaLabStr }</span>{ /* What: Item Header Span Element. Why: The first column's own label varies by caller. How: This renders heaLabStr directly. */ }

			<span
				className='r dl-mk-atgen'
			><span aria-hidden='true' className='dl-th-ic dl-th-ic--open'>○</span><span className='dl-vh'>At generation</span></span>{ /* What: At Generation Header Span Element. Why: This column needs both a compact glyph and a real, screen-reader-only label. How: This renders an open-circle glyph plus a visually-hidden "At generation" span. */ }

			<span className='r dl-mk-delta'><span aria-hidden='true'>Δ</span><span className='dl-vh'>Change</span></span>{ /* What: Delta Header Span Element. Why: This column needs both a compact glyph and a real, screen-reader-only label. How: This renders a delta glyph plus a visually-hidden "Change" span. */ }

			<span
				className='r dl-mk-after'
			><span aria-hidden='true' className='dl-th-ic'>●</span><span className='dl-vh'>After</span></span>{ /* What: After Header Span Element. Why: This column needs both a compact glyph and a real, screen-reader-only label. How: This renders a filled-circle glyph plus a visually-hidden "After" span. */ }

			<span className='r dl-mk-status'>Status</span>{ /* What: Status Header Span Element. Why: The last column is a plain text header, no glyph needed. How: This renders the literal text "Status". */ }


		</div>


	);


}

// #endregion TabHeaCom



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
 * @param props.appStaObj - App State Object: The whole app state object.
 * @param props.picRecObj - Picker Record Object: The picker this block
 *                          renders.
 * @param props.dayKeyStr - Day Key String: Today's own "YYYY-MM-DD" key, from
 *                          {@link isoDayFun}.
 * @param props.isaSupBoo - Is-A Suppressed Boolean: Whether picRecObj is
 *                          suppressed today by a triggered conditional.
 *
 * @returns This picker's own block, either a static rested row or its
 * full collapsible item table.
 *
 * @example
 * ```tsx
 * PicBloCom({ appStaObj, picRecObj, dayKeyStr, isaSupBoo }) // => <PicBloCom />
 * ```
 *
*/

function PicBloCom ( { appStaObj, picRecObj, dayKeyStr, isaSupBoo } ) {


	const [ bloOpeBoo, setBloOpeBoo ] = React.useState( true ); // What: Block Open Boolean And Setter. Why: This picker's own item table starts expanded, but can be collapsed independently of every other picker's own block. How: This is flipped by the header button's own onClick below.

	const picIteArr = appStaObj.items.filter( ( iteRecObj ) => iteRecObj.pickerId === picRecObj.id ); // What: Picker Item Array. Why: Every row below is one of this picker's own items, not the whole app's. How: This filters appStaObj's own items down to picRecObj's own id.
	const iteFlaMap = dayFlaFun( appStaObj.pickLog, picRecObj.id, dayKeyStr );                        // What: Item Flags Map Call. Why: Every item row below needs its own today's-events flags. How: This calls dayFlaFun for this exact picker/day.
	const genIteObj = ( appStaObj.today.genLog && appStaObj.today.genLog.items ) || {};               // What: Generation Item Object. Why: The value cells below need each item's own at-generation snapshot. How: This reads appStaObj's own today.genLog.items, or an empty object when there is none yet.
	const hasRowBoo = iteFlaMap.size > 0;                                                             // What: Has Row Boolean. Why: A manual override on an otherwise-suppressed picker must still render its real table, not the static rested row. How: This is true once any item earned at least one flag today.

	const modLabObj = { // What: Mode Label Object. Why: The header pill below needs a human-friendly label for picRecObj's own mode key. How: This is indexed just below by picRecObj's own mode.


		'ease-up'   : 'Ease Up',          // What: Ease Up Entry. Why: An ease-up picker's own header pill needs this exact display label. How: This is read when picRecObj's own mode is 'ease-up'.
		'ease-down' : 'Ease Down',        // What: Ease Down Entry. Why: An ease-down picker's own header pill needs this exact display label. How: This is read when picRecObj's own mode is 'ease-down'.
		'dynamic'   : 'Dynamic Weighted', // What: Dynamic Entry. Why: A dynamic picker's own header pill needs this exact display label. How: This is read when picRecObj's own mode is 'dynamic'.
		'weighted'  : 'Weighted',         // What: Weighted Entry. Why: A weighted picker's own header pill needs this exact display label. How: This is read when picRecObj's own mode is 'weighted'.
		'random'    : 'Truly Random'      // What: Random Entry. Why: A random picker's own header pill needs this exact display label. How: This is read when picRecObj's own mode is 'random'.


	};

	const modLabStr = modLabObj[ picRecObj.mode ] || picRecObj.mode;                // What: Mode Label String. Why: The header pill below needs the final resolved label. How: This reads modLabObj's own entry for picRecObj's own mode, falling back to the raw mode key for an unknown one.
	const neuModBoo = picRecObj.mode === 'weighted' || picRecObj.mode === 'random'; // What: Neutral Mode Boolean. Why: These 2 modes get a visually neutral pill instead of a tinted one. How: This checks picRecObj's own mode against both literal keys.



	if ( !hasRowBoo && isaSupBoo ) { // What: Suppressed Rest Guard. Why: A picker suppressed today with no manual-override rows renders as a single static rested row instead of its full table. How: This checks both conditions before returning the rested-row branch below.


		const conRecObj = ( appStaObj.conditionals || [] ).find( ( curConObj ) => curConObj.id === picRecObj.conditionalId ); // What: Conditional Record Object. Why: The rested row below names which conditional actually suppressed this picker. How: This finds appStaObj's own conditional matching picRecObj's own conditionalId.



		return (


			<div className='dl-block'>{ /* What: Rested Picker Block Div Element. Why: This is the whole static-rested variant's own root element. How: This renders a single non-interactive header row, no table beneath it. */ }


				<div className='dl-block-h dl-block-h--static'>{ /* What: Rested Block Header Div Element. Why: This mirrors the interactive header's own layout without being a button. How: This renders the picker's own name/mode pill plus the rested strip. */ }


					<span className='dl-name-mode'>{ /* What: Name Mode Span Element. Why: The picker's own name and mode pill are grouped together. How: This renders picRecObj's own name plus its modLabStr pill. */ }


						<span className='dl-block-name'>{ picRecObj.name }</span>{ /* What: Block Name Span Element. Why: The picker's own name is always shown first. How: This renders picRecObj's own name directly. */ }

						<InfTipCom
							className={ `dl-mode ${ neuModBoo ? 'neutral' : '' }` }
							label={ modLabStr }
							truncationOnly
						>{ modLabStr }</InfTipCom>{ /* What: Mode Pill Info Tip Element. Why: A long mode label can truncate in a narrow layout. How: This renders modLabStr as a truncation-revealing InfTipCom. */ }


					</span>

					<span className='dl-rest'>{ /* What: Rest Span Element. Why: This groups the rested icon/text with which conditional caused it. How: This renders the "Rested" strip plus conRecObj's own name when found. */ }


						<span className='dl-rest-l1'><IcoSetCom icoKeyStr='mooEle' />Rested</span>{ /* What: Rest Label Span Element. Why: This is the actual "rested today" indicator. How: This renders a moon glyph plus the literal text "Rested". */ }

						{ conRecObj && <span className='dl-rest-cond'>{ conRecObj.name }</span> }{ /* What: Rest Conditional Visibility Check. Why: Naming which conditional caused the rest is only possible when one was actually found. How: This renders conRecObj's own name only while conRecObj is truthy. */ }


					</span>


				</div>


			</div>


		);


	}



	const donCouNum = picIteArr.filter( ( iteRecObj ) => ( iteFlaMap.get( iteRecObj.id ) || {} ).comBoo ).length; // What: Done Count Number. Why: The header's own summary strip shows how many items are already completed today. How: This counts picIteArr entries whose own iteFlaMap flags (or an empty fallback) have comBoo set.



	return (


		<div className={ `dl-block ${ bloOpeBoo ? '' : 'is-closed' }` }>{ /* What: Picker Block Div Element. Why: This is the interactive variant's own root element. How: This toggles its own is-closed class per bloOpeBoo, wrapping the header button and the collapsible table below. */ }


			<button
				type='button'
				className='dl-block-h'
				aria-expanded={ bloOpeBoo }
				onClick={ () => setBloOpeBoo( ( preOpeBoo ) => !preOpeBoo ) }
			>{ /* What: Block Header Button Element. Why: The whole header is the actual expand/collapse control. How: This flips bloOpeBoo on click and reflects it via aria-expanded. */ }


				<span className='dl-chev'><IcoSetCom icoKeyStr='chvEle' /></span>{ /* What: Chevron Span Element. Why: A chevron glyph signals this header is expandable. How: This renders IcoSetCom's own "chevron" shape, rotated via CSS from bloOpeBoo's own is-closed class above. */ }


				<span className='dl-name-mode'>{ /* What: Name Mode Span Element. Why: The picker's own name and mode pill are grouped together. How: This renders picRecObj's own name plus its modLabStr pill. */ }


					<span className='dl-block-name'>{ picRecObj.name }</span>{ /* What: Block Name Span Element. Why: The picker's own name is always shown first. How: This renders picRecObj's own name directly. */ }

					<InfTipCom
						className={ `dl-mode ${ neuModBoo ? 'neutral' : '' }` }
						label={ modLabStr }
						truncationOnly
					>{ modLabStr }</InfTipCom>{ /* What: Mode Pill Info Tip Element. Why: A long mode label can truncate in a narrow layout. How: This renders modLabStr as a truncation-revealing InfTipCom. */ }


				</span>

				<span className='dl-sum'>{ /* What: Summary Span Element. Why: The header's own right-hand side summarizes this picker's own item/done counts. How: This renders the item count, plus a done chip once donCouNum is positive. */ }


					<span>{ picIteArr.length } item{ picIteArr.length === 1 ? '' : 's' }</span>{ /* What: Item Count Span Element. Why: The header always shows how many items this picker has. How: This renders picIteArr's own length, pluralized. */ }

					{ donCouNum > 0 && <span className='dl-dchip'><IcoSetCom icoKeyStr='cheEle' strWidNum={ 3 } /><span>{ donCouNum } done</span></span> } { /* What: Done Chip Visibility Check. Why: The done chip only makes sense once at least 1 item is actually completed. How: This renders the chip only while donCouNum is positive. */ }


				</span>


			</button>


			<ColDisCom open={ bloOpeBoo }>{ /* What: Collapse Disclosure Component. Why: The item table below should only exist in the DOM while this block is actually expanded. How: This wraps the table, driven by bloOpeBoo. */ }


				<div className='dl-table'>{ /* What: Item Table Div Element. Why: This groups the shared header row with every item row below it. How: This renders TabHeaCom followed by one row per picIteArr entry. */ }


					<TabHeaCom />{ /* What: Table Head Component. Why: This item table needs the shared column headers. How: This renders with its own default 'Item' first-column label. */ }


					{ picIteArr.length === 0 && <div className='dl-empty'>This picker has no items.</div> }{ /* What: Empty Picker Visibility Check. Why: A picker with no items at all needs an explanatory row instead of an empty table. How: This renders only while picIteArr's own length is 0. */ }
					{ picIteArr.map( ( iteRecObj ) => { // What: Item Row Map Callback. Why: One row is needed per item in picIteArr. How: This builds each row's own flags, done state and value-mode check before returning its JSX below.


						const iteFlaObj = iteFlaMap.get( iteRecObj.id );                      // What: Item Flags Object. Why: This row's own status chips and done state both read from the same flags object. How: This reads iteFlaMap's own entry for iteRecObj's own id.
						const iteDonBoo = iteFlaObj && iteFlaObj.comBoo;                      // What: Item Done Boolean. Why: A completed item gets its own is-done row styling. How: This is true only when iteFlaObj exists and its own comBoo flag is set.
						const hasValBoo = hasValFun( picRecObj.mode ) && !iteRecObj.vacation; // What: Has Value Boolean. Why: An item on vacation never shows a value, even under a value-tracking mode. How: This combines hasValFun's own mode check with iteRecObj's own vacation flag.



						return (


							<div
								key={ iteRecObj.id }
								className={ `dl-trow ${ iteDonBoo ? 'is-done' : '' } ${ iteRecObj.vacation ? 'is-dim' : '' }` }
							>{ /* What: Item Row Div Element. Why: This is one item's own full row, spanning name/subline, value cells and status. How: This toggles its own is-done/is-dim classes from iteDonBoo/iteRecObj.vacation. */ }


								<span className='dl-item dl-mk-item'>{ /* What: Item Name Span Element. Why: This groups the item's own name and subline together. How: This renders iteRecObj's own name plus its computed subline below. */ }


									<InfTipCom
										className='dl-name'
										label={ iteRecObj.name }
										truncationOnly
									>{ iteRecObj.name }</InfTipCom>{ /* What: Item Name Info Tip Element. Why: A long item name can truncate in a narrow layout. How: This renders iteRecObj's own name as a truncation-revealing InfTipCom. */ }

									<span className='dl-sub'>{ iteSubFun( picRecObj, iteRecObj, hasValBoo ? genIteObj[ iteRecObj.id ] : null ) }</span>{ /* What: Item Subline Span Element. Why: Every item shows its own weight/range/boost text beneath its name. How: This renders iteSubFun's own result, passing the generation snapshot only while hasValBoo. */ }


								</span>

								<ValCelCom
									hasValBoo={ hasValBoo }
									genValNum={ genIteObj[ iteRecObj.id ] }
									aftValNum={ iteRecObj.value }
									offValNum={ picRecObj.mode === 'dynamic' ? ( iteRecObj.weight ?? 1 ) : 0 }
								/>{ /* What: Value Cells Component. Why: Every item shows its own at-generation/delta/after cells. How: This passes hasValBoo plus the raw generation/current values, offset by this item's own base weight under dynamic mode. */ }

								{ iteRecObj.vacation // What: Vacation Status Check. Why: A vacationing item shows a plain "Inactive" label instead of the normal status chips. How: This renders the inactive span for a vacationing item, StaChiCom otherwise.
									? <span className='dl-status dl-mk-status'><span className='dl-vac'>Inactive</span></span>
									: <StaChiCom iteFlaObj={ iteFlaObj } /> }


							</div>


						);


					} ) }


				</div>


			</ColDisCom>


		</div>


	);


}

// #endregion PicBloCom



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
 * @param props.appStaObj - App State Object: The whole app state object.
 * @param props.picGroArr - Picker Group Array: Every picker in the current
 *                          group.
 *
 * @returns This group's own conditionals section, or null once it has
 * none.
 *
 * @example
 * ```tsx
 * ConSecCom({ appStaObj, picGroArr }) // => <ConSecCom />
 * ```
 *
*/

function ConSecCom ( { appStaObj, picGroArr } ) {


	const conIdeArr = [ ...new Set( picGroArr.filter( ( picRecObj ) => picRecObj.conditionalId ).map( ( picRecObj ) => picRecObj.conditionalId ) ) ]; // What: Conditional Identifier Array. Why: This section only needs the unique conditional ids actually attached to this group's own pickers. How: This maps picGroArr down to its own conditionalId values, deduped via a Set.
	const conRecArr = ( appStaObj.conditionals || [] ).filter( ( conRecObj ) => conIdeArr.includes( conRecObj.id ) );                                 // What: Conditional Record Array. Why: The table below needs the real conditional records, not just their ids. How: This filters appStaObj's own conditionals down to conIdeArr's own membership.


	if ( !conRecArr.length ) return null; // What: No Conditionals Guard. Why: A group with no attached conditionals at all needs no section here. How: This returns null before building any of the table below.



	const genConObj = ( appStaObj.today.genLog && appStaObj.today.genLog.conds ) || {}; // What: Generation Conditional Object. Why: The value cells below need each conditional's own at-generation snapshot. How: This reads appStaObj's own today.genLog.conds, or an empty object when there is none yet.



	return (


		<div className='dl-block dl-cond-sec'>{ /* What: Conditional Section Div Element. Why: This is ConSecCom's own root element, tinted blue via its own dl-cond-sec class. How: This renders a static header plus the conditional table below. */ }


			<div className='dl-block-h dl-block-h--static'>{ /* What: Conditional Section Header Div Element. Why: This mirrors PicBloCom's own static header shape. How: This renders the section's own title plus a count pill. */ }


				<span className='dl-block-name dl-cond-title'>Conditionals</span>{ /* What: Conditional Section Title Span Element. Why: This section needs its own plain title. How: This renders the literal text "Conditionals". */ }

				<span className='dl-mode'>{ conRecArr.length }</span>{ /* What: Conditional Count Span Element. Why: The header shows how many conditionals this section covers. How: This renders conRecArr's own length. */ }


			</div>


			<div className='dl-table'>{ /* What: Conditional Table Div Element. Why: This groups the shared header row with every conditional row below it. How: This renders TabHeaCom followed by one row per conRecArr entry. */ }


				<TabHeaCom heaLabStr='Conditional' />{ /* What: Table Head Component. Why: This table's first column needs its own "Conditional" label instead of the default "Item". How: This renders with heaLabStr explicitly set. */ }


				{ conRecArr.map( ( conRecObj ) => { // What: Conditional Row Map Callback. Why: One row (plus its own affected-pickers strip) is needed per conRecArr entry. How: This computes each row's own derived values before returning its JSX below.


					const attNamArr = appStaObj.pickers.filter( ( picRecObj ) => picRecObj.conditionalId === conRecObj.id && !picRecObj.hidden ).map( ( picRecObj ) => picRecObj.name ); // What: Attached Name Array. Why: The affected-pickers strip below needs just the visible attached pickers' own names. How: This filters appStaObj's own pickers down to this conditional's own id, excluding a hidden one, then maps to their own name.
					const triFlaBoo = CON_NAM_OBJ.supGatFun( conRecObj );                                                                                                                // What: Triggered Flag Boolean. Why: Both the pill and the affected-pickers wording below depend on whether this conditional actually fired today. How: This calls CON_NAM_OBJ.supGatFun, the same shared active-and-triggered check every other suppression decision in the app uses.
					const hasValBoo = CON_NAM_OBJ.modValFun( conRecObj.mode );                                                                                                           // What: Has Value Boolean. Why: Some conditional modes track no value at all. How: This asks CON_NAM_OBJ.modValFun for conRecObj's own mode.
					const genSnaObj = genConObj[ conRecObj.id ];                                                                                                                         // What: Generation Snapshot Object. Why: The value cells below need this conditional's own at-generation snapshot, if any. How: This reads genConObj's own entry for conRecObj's own id.
					const neuModBoo = conRecObj.mode === 'weighted' || conRecObj.mode === 'random';                                                                                      // What: Neutral Mode Boolean. Why: These 2 modes get a visually neutral pill instead of a tinted one. How: This checks conRecObj's own mode against both literal keys.

					const modLabObj = { // What: Mode Label Object. Why: The row's own mode pill needs a human-friendly label for conRecObj's own mode key. How: This is indexed just below by conRecObj's own mode.


						'ease-up'   : 'Ease Up',          // What: Ease Up Entry. Why: An ease-up conditional's own mode pill needs this exact display label. How: This is read when conRecObj's own mode is 'ease-up'.
						'ease-down' : 'Ease Down',        // What: Ease Down Entry. Why: An ease-down conditional's own mode pill needs this exact display label. How: This is read when conRecObj's own mode is 'ease-down'.
						'dynamic'   : 'Dynamic Weighted', // What: Dynamic Entry. Why: A dynamic conditional's own mode pill needs this exact display label. How: This is read when conRecObj's own mode is 'dynamic'.
						'weighted'  : 'Weighted',         // What: Weighted Entry. Why: A weighted conditional's own mode pill needs this exact display label. How: This is read when conRecObj's own mode is 'weighted'.
						'random'    : 'Truly Random'      // What: Random Entry. Why: A random conditional's own mode pill needs this exact display label. How: This is read when conRecObj's own mode is 'random'.


					};

					const modLabStr = modLabObj[ conRecObj.mode ] || conRecObj.mode;                                                                                                 // What: Mode Label String. Why: The row's own mode pill needs the final resolved label. How: This reads modLabObj's own entry for conRecObj's own mode, falling back to the raw mode key for an unknown one.
					const attJsxArr = attNamArr.map( ( curNamStr, curIndNum ) => <React.Fragment key={ curNamStr }>{ curIndNum ? ', ' : '' }<b>{ curNamStr }</b></React.Fragment> ); // What: Attached Jsx Array. Why: Both branches of the affected-pickers strip below need this exact same comma-joined name list. How: This maps attNamArr into one comma-prefixed bold name per entry, computed once for reuse.



					return (


						<React.Fragment key={ conRecObj.id }>{ /* What: Conditional Row Fragment Element. Why: The row itself and its own affected-pickers strip are siblings, not nested. How: This groups the dl-trow row and the dl-cond-aff strip below without an extra wrapping element. */ }


							<div className='dl-trow dl-cond-row'>{ /* What: Conditional Row Div Element. Why: This is one conditional's own full row, spanning name/subline, value cells and its own triggered pill. How: This renders the name/mode span, ValCelCom, and the triggered pill below. */ }


								<span className='dl-item dl-mk-item'>{ /* What: Conditional Name Span Element. Why: This groups the conditional's own name, mode pill and subline together. How: This renders conRecObj's own name/mode row plus its computed subline below. */ }


									<span className='dl-nrow'>{ /* What: Name Row Span Element. Why: The name and mode pill sit side by side on their own row above the subline. How: This renders conRecObj's own name plus its modLabStr pill. */ }


										<InfTipCom
											className='dl-name'
											label={ conRecObj.name }
											truncationOnly
										>{ conRecObj.name }</InfTipCom>{ /* What: Conditional Name Info Tip Element. Why: A long conditional name can truncate in a narrow layout. How: This renders conRecObj's own name as a truncation-revealing InfTipCom. */ }

										<InfTipCom
											className={ `dl-mode dl-mode--cond ${ neuModBoo ? 'is-neutral' : '' }` }
											label={ modLabStr }
											truncationOnly
										>{ modLabStr }</InfTipCom>{ /* What: Mode Pill Info Tip Element. Why: A long mode label can truncate in a narrow layout. How: This renders modLabStr as a truncation-revealing InfTipCom. */ }


									</span>

									<span className='dl-sub'>{ conSubFun( conRecObj ) }</span>{ /* What: Conditional Subline Span Element. Why: Every conditional shows its own odds/range text beneath its name. How: This renders conSubFun's own result for conRecObj. */ }


								</span>

								<ValCelCom
									hasValBoo={ hasValBoo }
									genValNum={ genSnaObj ? genSnaObj.value : ( hasValBoo ? conRecObj.value : null ) }
									aftValNum={ conRecObj.value }
								/>{ /* What: Value Cells Component. Why: Every conditional shows its own at-generation/delta/after cells. How: This prefers genSnaObj's own value snapshot, falling back to conRecObj's own current value under a value-tracking mode. */ }

								<span className='dl-status dl-mk-status'>{ /* What: Conditional Status Span Element. Why: The last column shows whether this conditional actually fired today. How: This renders the triggered/not-triggered pill below. */ }


									<span className={ `dl-st-pill ${ triFlaBoo ? 'dl-st-trig' : 'dl-st-nottrig' }` }>{ triFlaBoo ? 'Triggered' : 'Not triggered' }</span>{ /* What: Triggered Pill Span Element. Why: This is the actual triggered/not-triggered indicator. How: This renders its own text/class from triFlaBoo. */ }


								</span>


							</div>


							<div className='dl-cond-aff'>{ /* What: Conditional Affected Div Element. Why: This strip names which pickers this conditional actually governs. How: This renders a branch glyph plus attJsxArr, worded differently depending on triFlaBoo. */ }


								<IcoSetCom icoKeyStr='braEle' />{ /* What: Icon Shape Component. Why: This strip needs a small branch glyph marking it as a "this affects these" note. How: This renders IcoSetCom's own "branch" shape. */ }

								{ triFlaBoo // What: Triggered Wording Check. Why: A triggered conditional rests its attached pickers, a not-triggered one lets them run normally. How: This renders one of 2 differently-worded spans depending on triFlaBoo.
									? <span>Rested: { attJsxArr }</span>
									: <span>Attached: { attJsxArr } (ran normally)</span> }


							</div>


						</React.Fragment>


					);


				} ) }


			</div>


		</div>


	);


}

// #endregion ConSecCom



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
 * @param props.state     - State: The whole app state object.
 * @param props.groNamStr - Group Name String: Which group this panel covers.
 * @param props.onClose   - On Close: Called when the panel's own close button
 *                          is pressed; omitted entirely suppresses that
 *                          button.
 *
 * @returns This group's own full log panel.
 *
 * @example
 * ```tsx
 * GroLogCom({ state, groNamStr, onClose }) // => <GroLogCom />
 * ```
 *
*/

function GroLogCom ( { state, groNamStr, onClose } ) {


	const dayKeyStr = isoDayFun();                                                                                                // What: Day Key String. Why: Every lookup below (conditionals, pickers, items) is scoped to today's own date key. How: This calls isoDayFun with no argument, defaulting to right now.
	const groPicArr = state.pickers.filter( ( picRecObj ) => ( picRecObj.group || 'Other' ) === groNamStr && !picRecObj.hidden ); // What: Group Picker Array. Why: This panel only ever shows the pickers actually belonging to this exact group. How: This filters state's own pickers down to a matching (or defaulted) group, excluding a hidden one.
	const picOrdArr = ( state.pickerOrder && state.pickerOrder[ groNamStr ] ) || [];                                              // What: Picker Order Array. Why: The sort below needs this group's own saved manual order, if any. How: This reads state's own pickerOrder entry for groNamStr, or an empty array when there is none.

	const sorPicArr = groPicArr.slice().sort( ( aPicObj, bPicObj ) => { // What: Sorted Picker Array. Why: This panel renders pickers in the group's own saved order, not whatever order state.pickers happens to hold. How: This sorts a defensive copy of groPicArr by each picker's own position in picOrdArr.


		const aOrdNum = picOrdArr.indexOf( aPicObj.id ); // What: A Order Number. Why: The comparison below needs aPicObj's own position in picOrdArr. How: This reads picOrdArr's own indexOf for aPicObj's own id.
		const bOrdNum = picOrdArr.indexOf( bPicObj.id ); // What: B Order Number. Why: The comparison below needs bPicObj's own position in picOrdArr. How: This reads picOrdArr's own indexOf for bPicObj's own id.



		return ( aOrdNum === -1 ? 1e6 : aOrdNum ) - ( bOrdNum === -1 ? 1e6 : bOrdNum ); // What: Order Comparison Return. Why: A picker with no saved position at all must sort after every ordered one. How: This treats a -1 (not found) as a huge fallback position before subtracting.


	} );



	const cheSupFun = ( picRecObj ) => { // What: Check Suppressed Function. Why: PicBloCom needs to know, per picker, whether a triggered conditional suppresses it today. How: This finds picRecObj's own conditional (if any) and checks whether it is currently active and triggered.


		if ( !picRecObj.conditionalId ) return false; // What: No Conditional Guard. Why: A picker with no attached conditional at all can never be suppressed. How: This returns false immediately when picRecObj's own conditionalId is missing.



		const conRecObj = ( state.conditionals || [] ).find( ( curConObj ) => curConObj.id === picRecObj.conditionalId ); // What: Conditional Record Object. Why: The return below needs the real conditional record, not just its id. How: This finds state's own conditional matching picRecObj's own conditionalId.



		return CON_NAM_OBJ.supGatFun( conRecObj ); // What: Suppressed Return. Why: The caller needs one combined answer. How: This calls CON_NAM_OBJ.supGatFun, which already tolerates a nullish conRecObj on its own.


	};



	return (


		<div className='dl-panel'>{ /* What: Group Log Panel Div Element. Why: This is GroLogCom's own root element. How: This renders the panel header, the shared key/legend, and the conditionals/pickers body below. */ }


			<div className='dl-panel-h'>{ /* What: Panel Header Div Element. Why: This groups the panel's own kicker with its optional close button. How: This renders the kicker span plus onClose's own button when provided. */ }


				<span className='dl-kicker'>{ /* What: Kicker Span Element. Why: The panel names which group it covers and when it was generated. How: This renders a log glyph plus groNamStr and forTimFun's own formatted time. */ }


					<IcoSetCom icoKeyStr='logEle' />{ /* What: Icon Shape Component. Why: The kicker needs a small recognizable log glyph. How: This renders IcoSetCom's own "log" shape. */ }

					<span>{ groNamStr } log · generated { forTimFun( state.today.generatedAt ) }</span>{ /* What: Kicker Text Span Element. Why: The kicker's own text names the group and generation time. How: This renders groNamStr plus forTimFun's own result for state's own today.generatedAt. */ }


				</span>


				{ onClose && ( // What: Close Button Visibility Check. Why: A panel opened without a real close handler (none in this codebase today, but supported) needs no close button at all. How: This renders the close button only while onClose is truthy.


					<button
						type='button'
						className='dl-close'
						aria-label='Close log'
						onClick={ onClose }
					><IcoSetCom icoKeyStr='xEle' strWidNum={ 2 } /></button> // What: Close Button Element. Why: This is the panel's own dismiss control. How: This calls onClose directly on click.


				) }


			</div>


			<div className='dl-key'>{ /* What: Key Legend Div Element. Why: The panel needs a one-time legend explaining every status chip's own meaning. How: This renders 5 icon/label pairs, one per possible status. */ }


				<span className='dl-kicker'>Key</span>{ /* What: Key Kicker Span Element. Why: The legend needs its own small title. How: This renders the literal text "Key". */ }

				<span className='dl-key-items'>{ /* What: Key Items Span Element. Why: All 5 legend entries are grouped as one inline run. How: This renders one dl-ki span per possible status chip. */ }


					<span className='dl-ki'><span className='dl-ico dl-c-auto'><IcoSetCom icoKeyStr='shuEle' /></span><b>Auto-picked</b></span>{ /* What: Auto Key Item Span Element. Why: The legend needs an entry explaining the auto-picked chip. How: This renders the shuffle glyph plus its own bold label. */ }

					<span className='dl-ki'><span className='dl-ico dl-c-push'><IcoSetCom icoKeyStr='pusEle' strWidNum={ 2.4 } /></span><b>Pushed</b></span>{ /* What: Pushed Key Item Span Element. Why: The legend needs an entry explaining the pushed chip. How: This renders the push glyph plus its own bold label. */ }

					<span className='dl-ki'><span className='dl-ico dl-c-roll'><IcoSetCom icoKeyStr='rolEle' strWidNum={ 2.2 } /></span><b>Rolled off</b></span>{ /* What: Rolled Off Key Item Span Element. Why: The legend needs an entry explaining the rolled-off chip. How: This renders the roll glyph plus its own bold label. */ }

					<span className='dl-ki'><span className='dl-ico dl-c-skip'><IcoSetCom icoKeyStr='xEle' strWidNum={ 2.6 } /></span><b>Skipped</b></span>{ /* What: Skipped Key Item Span Element. Why: The legend needs an entry explaining the skipped chip. How: This renders the x glyph plus its own bold label. */ }

					<span className='dl-ki'><span className='dl-ico dl-c-done'><IcoSetCom icoKeyStr='cheEle' strWidNum={ 3 } /></span><b>Completed</b></span>{ /* What: Completed Key Item Span Element. Why: The legend needs an entry explaining the completed chip. How: This renders the check glyph plus its own bold label. */ }


				</span>


			</div>


			<div className='dl-body'>{ /* What: Group Body Div Element. Why: This groups the conditionals section with every picker block below it. How: This renders ConSecCom followed by one PicBloCom per sorPicArr entry. */ }


				<ConSecCom appStaObj={ state } picGroArr={ sorPicArr } />{ /* What: Conditional Section Component. Why: This group's own attached conditionals (if any) render above its pickers. How: This passes state and the sorted picker array straight through; ConSecCom needs no day key since it reads today's own generation snapshot directly, not a per-day pick-log scan. */ }


				{ sorPicArr.map( ( picRecObj ) => ( // What: Picker Block Map Callback. Why: One block is needed per picker in sorPicArr. How: This renders PicBloCom for each, passing whether cheSupFun finds it suppressed today.


					<PicBloCom
						key={ picRecObj.id }
						appStaObj={ state }
						picRecObj={ picRecObj }
						dayKeyStr={ dayKeyStr }
						isaSupBoo={ cheSupFun( picRecObj ) }
					/> // What: Picker Block Component. Why: This renders one picker's own full log block for today. How: This is keyed by picRecObj's own id, passed state, picRecObj, dayKeyStr, and cheSupFun's own suppressed check.


				) ) }


			</div>


		</div>


	);


}

// #endregion GroLogCom



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

function forDueFun ( dueDatObj, dayKeyStr ) {


	if ( !dueDatObj ) return 'No upcoming'; // What: No Upcoming Guard. Why: A reminder with no real next occurrence at all needs its own plain label. How: This returns immediately when dueDatObj is falsy.



	const [ yeaNum, monNum, domNum ] = dayKeyStr.split( '-' ).map( Number ); // What: Reference Date Parts. Why: The midnight-stripped reference date below needs its own year/month/day numbers. How: This splits dayKeyStr on its dashes and parses each part as a Number.

	const curMidObj = new Date( yeaNum, monNum - 1, domNum );                                         // What: Current Midnight Object. Why: The day-count below must compare 2 midnights, not 2 arbitrary times of day. How: This builds a local Date at midnight from yeaNum/monNum/domNum.
	const dueMidObj = new Date( dueDatObj.getFullYear(), dueDatObj.getMonth(), dueDatObj.getDate() ); // What: Due Midnight Object. Why: The day-count below must compare 2 midnights, not 2 arbitrary times of day. How: This builds a local Date at midnight from dueDatObj's own year/month/day.
	const dayDifNum = Math.round( ( dueMidObj - curMidObj ) / 86400000 );                             // What: Day Difference Number. Why: The branches below phrase their own label from a whole day count, not a raw millisecond difference. How: This subtracts curMidObj from dueMidObj and divides by the number of milliseconds in a day.


	if ( dayDifNum <= 1 ) return 'Due tomorrow'; // What: Due Tomorrow Return. Why: 0 or 1 day out reads better as "tomorrow" than a bare day count. How: This returns once dayDifNum falls at or below 1.



	if ( dayDifNum <= 13 ) return `Due in ${ dayDifNum } days`; // What: Due In Days Return. Why: Up to 2 weeks out still reads well as a relative count. How: This returns once dayDifNum falls at or below 13.



	return 'Due ' + dueDatObj.toLocaleDateString( 'en-US', { month : 'short', day : 'numeric' } ); // What: Due Date Return. Why: Further out than 2 weeks reads better as a plain calendar date than a large day count. How: This formats dueDatObj as e.g. "Due Jun 12".


}

// #endregion forDueFun



// #region RemLogCom

/**
 * RemLogCom = Reminders Log Component
 *
 * @summary
 * The Reminders section's own log panel, listing every non-hidden
 * task/reminder with its own current status (done/due today/skipped/
 * not yet due) and, for a not-yet-due one, a short relative due label.
 * Pinned to the last generation's own anchor date (TASKS.anchorDate),
 * not live "now", since this panel is a snapshot of the Reminders
 * section right above it, itself frozen to the last generate() call
 * until the next one runs.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.state   - State: The whole app state object.
 * @param props.onClose - On Close: Called when the panel's own close button is
 *                        pressed; omitted entirely suppresses that button.
 *
 * @returns This panel's own full reminders log.
 *
 * @example
 * ```tsx
 * RemLogCom({ state, onClose }) // => <RemLogCom />
 * ```
 *
*/

function RemLogCom ( { state, onClose } ) {


	const ancDatObj = TASKS.anchorDate( state.today && state.today.generatedAt );                       // What: Anchor Date Object. Why: Every lookup below must use the same frozen anchor the Reminders section above this panel already used. How: This calls TASKS.anchorDate with state's own today.generatedAt, if any.
	const dayKeyStr = isoDayFun( ancDatObj );                                                           // What: Day Key String. Why: The skipped-lookup below needs a plain date key to match against, scoped to ancDatObj rather than live "now". How: This calls isoDayFun with ancDatObj.
	const tasListArr = ( state.tasks || [] ).filter( ( curTasObj ) => !curTasObj.hidden );              // What: Task List Array. Why: A hidden task/reminder never belongs in this log at all. How: This filters state's own tasks down to the non-hidden ones.
	const visTasArr = TASKS.visibleToday( state.tasks, state.reminderOpts, state.holidays, ancDatObj ); // What: Visible Task Array. Why: The status below needs to know which tasks are actually due today. How: This calls TASKS.visibleToday with state's own tasks/reminderOpts/holidays and ancDatObj.
	const visIdeSet = new Set( visTasArr.map( ( curTasObj ) => curTasObj.id ) );                        // What: Visible Identifier Set. Why: The status below needs a fast membership check, not a repeated array scan. How: This maps visTasArr down to just its own ids.


	const skiIdeSet = new Set( // What: Skipped Identifier Set. Why: The status below needs to know which tasks were manually skipped specifically today. How: This filters state's own reminderSkipLog down to today's own rows, then maps to their own taskId.


		( state.reminderSkipLog || [] )
			.filter( ( logRowObj ) => isoDayFun( new Date( logRowObj.skippedAt ) ) === dayKeyStr )
			.map( ( logRowObj ) => logRowObj.taskId )


	);


	const remRowArr = tasListArr.map( ( curTasObj ) => { // What: Reminder Row Array. Why: One display row is needed per task/reminder in tasListArr. How: This computes each row's own status and (once not-yet-due) its own due label before returning its shape below.


		const tasDonBoo = TASKS.isDoneToday( curTasObj, ancDatObj ); // What: Task Done Boolean. Why: A done task always outranks every other status below. How: This calls TASKS.isDoneToday for curTasObj/ancDatObj.

		let rowStaStr = 'notdue'; // What: Row Status String And Fallthrough. Why: Every task starts as not-yet-due until one of the checks below says otherwise. How: This is overwritten by whichever of the 3 checks below matches first.


		if ( tasDonBoo ) rowStaStr = 'done'; // What: Done Status Check. Why: Done always wins over every other status. How: This sets rowStaStr to 'done' once tasDonBoo is true.

		else if ( skiIdeSet.has( curTasObj.id ) ) rowStaStr = 'skip'; // What: Skip Status Check. Why: A manually-skipped task (that wasn't also done) is its own distinct status. How: This sets rowStaStr to 'skip' once curTasObj's own id is in skiIdeSet.

		else if ( visIdeSet.has( curTasObj.id ) ) rowStaStr = 'due'; // What: Due Status Check. Why: A currently-visible task (neither done nor skipped) is due today. How: This sets rowStaStr to 'due' once curTasObj's own id is in visIdeSet.



		let dueLabStr = null; // What: Due Label String And Fallthrough. Why: Only a genuinely not-yet-due task ever gets a relative due label at all. How: This stays null unless the guard below overwrites it.


		if ( rowStaStr === 'notdue' ) { // What: Not Due Guard. Why: A relative due label only makes sense for a task that is neither done, skipped, nor due today. How: This computes and assigns dueLabStr only while rowStaStr is still 'notdue'.


			const nexDatObj = TASKS.nextEligible( curTasObj, state.reminderOpts, state.holidays, ancDatObj, true ); // What: Next Date Object. Why: This is the raw next-occurrence Date forDueFun below needs, honoring an active manual skip so the label reflects when the reminder actually reappears. How: This calls TASKS.nextEligible with respectSkipUntil set true.

			dueLabStr = forDueFun( nexDatObj, dayKeyStr ); // What: Due Label String Assign. Why: The row below needs the final short relative label, not the raw Date. How: This calls forDueFun with nexDatObj and dayKeyStr.


		}



		return { tasObj : curTasObj, rowStaStr : rowStaStr, dueLabStr : dueLabStr, wheStr : TASKS.summary( curTasObj ) }; // What: Reminder Row Return. Why: The render below needs exactly these 4 fields per row. How: This bundles curTasObj alongside its own computed rowStaStr/dueLabStr and TASKS.summary's own schedule text.


	} );



	const staRanObj = { done : 0, due : 1, skip : 2, notdue : 3 }; // What: Status Rank Object. Why: The sort below needs a numeric priority per status to order the rows sensibly. How: This is indexed just below by each row's own rowStaStr.

	remRowArr.sort( ( aRowObj, bRowObj ) => ( staRanObj[ aRowObj.rowStaStr ] - staRanObj[ bRowObj.rowStaStr ] ) || ( aRowObj.tasObj.name < bRowObj.tasObj.name ? -1 : 1 ) ); // What: Reminder Row Sort Call. Why: Rows should group by status first, then alphabetically within a status. How: This sorts remRowArr by staRanObj's own rank difference, falling back to a plain name comparison when ranks tie.



	return (


		<div className='dl-panel'>{ /* What: Reminders Log Panel Div Element. Why: This is RemLogCom's own root element. How: This renders the panel header plus the reminder rows body below. */ }


			<div className='dl-panel-h'>{ /* What: Panel Header Div Element. Why: This groups the panel's own kicker with its optional close button. How: This renders the kicker span plus onClose's own button when provided. */ }


				<span className='dl-kicker'>{ /* What: Kicker Span Element. Why: The panel names which anchor date this snapshot covers. How: This renders a clock glyph plus ancDatObj's own formatted weekday/date. */ }


					<IcoSetCom icoKeyStr='clcEle' />{ /* What: Icon Shape Component. Why: The kicker needs a small recognizable clock glyph. How: This renders IcoSetCom's own "clock" shape. */ }

					<span>Reminders log · { ancDatObj.toLocaleDateString( 'en-US', { weekday : 'short', month : 'short', day : 'numeric' } ) }</span>{ /* What: Kicker Text Span Element. Why: The kicker's own text names which day this snapshot covers. How: This formats ancDatObj as e.g. "Wed, Jun 12". */ }


				</span>


				{ onClose && ( // What: Close Button Visibility Check. Why: A panel opened without a real close handler (none in this codebase today, but supported) needs no close button at all. How: This renders the close button only while onClose is truthy.


					<button
						type='button'
						className='dl-close'
						aria-label='Close log'
						onClick={ onClose }
					><IcoSetCom icoKeyStr='xEle' strWidNum={ 2 } /></button> // What: Close Button Element. Why: This is the panel's own dismiss control. How: This calls onClose directly on click.


				) }


			</div>


			<div className='dl-body dl-body--rem'>{ /* What: Reminders Body Div Element. Why: dl-mk-r* below are pure selector hooks for help mode (see help-content.jsx), kept separate from .dl-r-name/.dl-r-when/.dl-r-st, which carry their own font styling meant for data rows; reusing those directly on the header would restyle it away from the small-caps look every other header cell has. How: This renders the header row plus one row per remRowArr entry below. */ }


				<div className='dl-rt-head'><span className='dl-mk-rname'>Reminder</span><span className='dl-mk-rwhen'>When</span><span className='r dl-mk-rst'>Status</span></div>{ /* What: Reminders Table Head Div Element. Why: This table needs its own 3-column header row. How: This renders the 3 shared column-header spans. */ }


				{ remRowArr.length === 0 && <div className='dl-empty'>No reminders yet.</div> }{ /* What: Empty Reminders Visibility Check. Why: No non-hidden tasks at all needs an explanatory row instead of an empty table. How: This renders only while remRowArr's own length is 0. */ }
				{ remRowArr.map( ( { tasObj, rowStaStr, dueLabStr, wheStr } ) => ( // What: Reminder Row Map Callback. Why: One row is needed per remRowArr entry. How: This destructures each row and renders its own name/when/status cells.


					<div
						key={ tasObj.id }
						className={ `dl-rt-row ${ rowStaStr === 'done' ? 'is-done' : rowStaStr === 'due' ? 'is-due' : rowStaStr === 'notdue' ? 'is-notdue' : '' }` }
					>{ /* What: Reminder Row Div Element. Why: This is one task/reminder's own full row. How: This toggles its own is-done/is-due/is-notdue classes from rowStaStr. */ }


						<InfTipCom
							className='dl-r-name dl-mk-rname'
							label={ tasObj.name }
							truncationOnly
						>{ tasObj.name }</InfTipCom>{ /* What: Reminder Name Info Tip Element. Why: A long reminder name can truncate in a narrow layout. How: This renders tasObj's own name as a truncation-revealing InfTipCom. */ }

						<span className='dl-r-when dl-mk-rwhen'>{ wheStr }</span>{ /* What: Reminder When Span Element. Why: Every row shows its own plain schedule summary. How: This renders wheStr directly. */ }

						<span className='dl-r-st dl-mk-rst'>{ /* What: Reminder Status Span Element. Why: The last column shows this row's own current status, differently per rowStaStr. How: This renders one of 4 status variants below, matched on rowStaStr. */ }


							{ rowStaStr === 'done' && ( // What: Done Status Visibility Check. Why: A done row shows its own check icon plus a Done pill. How: This renders only while rowStaStr is 'done'.


								<React.Fragment>{ /* What: Done Status Fragment Element. Why: The check icon and its own Done pill are true siblings with no shared wrapper of their own. How: This groups both without adding an extra DOM node. */ }


									<span className='dl-ico dl-c-done'><IcoSetCom icoKeyStr='cheEle' strWidNum={ 3 } /></span>{ /* What: Done Icon Span Element. Why: A done row's own status needs a recognizable check glyph before its pill. How: This renders IcoSetCom's own "check" shape. */ }

									<span className='dl-st-pill dl-st-done'>Done</span>{ /* What: Done Pill Span Element. Why: The done row's own status needs a plain, fixed label alongside its icon. How: This renders the literal text "Done". */ }


								</React.Fragment>

							) }
							{ rowStaStr === 'due' && <span className='dl-st-pill dl-st-due'>Due today</span> }{ /* What: Due Status Visibility Check. Why: A due-today row shows a plain Due pill. How: This renders only while rowStaStr is 'due'. */ }
							{ rowStaStr === 'skip' && ( // What: Skip Status Visibility Check. Why: A skipped row shows its own x icon plus a Skipped pill. How: This renders only while rowStaStr is 'skip'.


								<React.Fragment>{ /* What: Skip Status Fragment Element. Why: The x icon and its own Skipped pill are true siblings with no shared wrapper of their own. How: This groups both without adding an extra DOM node. */ }


									<span className='dl-ico dl-c-skip'><IcoSetCom icoKeyStr='xEle' strWidNum={ 2.6 } /></span>{ /* What: Skip Icon Span Element. Why: A skipped row's own status needs a recognizable x glyph before its pill. How: This renders IcoSetCom's own "x" shape. */ }

									<span className='dl-st-pill dl-st-skip'>Skipped</span>{ /* What: Skip Pill Span Element. Why: The skipped row's own status needs a plain, fixed label alongside its icon. How: This renders the literal text "Skipped". */ }


								</React.Fragment>

							) }
							{ rowStaStr === 'notdue' && <span className='dl-st-not'>{ dueLabStr }</span> }{ /* What: Not Due Status Visibility Check. Why: A not-yet-due row shows its own relative due label instead of a pill. How: This renders only while rowStaStr is 'notdue'. */ }


						</span>


					</div>


				) ) }


			</div>


		</div>


	);


}

// #endregion RemLogCom



export { DayLogChip, GroLogCom, RemLogCom }; // What: Named Exports. Why: tab-today.jsx and reminders.jsx both import these 3 by name; every other binding in this file is internal-only. How: This re-exports the 3 components declared above. GroLogCom's and RemLogCom's own names were each swept to a proper component-type name after checking their own blast radius was small (a single consumer apiece, tab-today.jsx and reminders.jsx respectively); DayLogChip stays unrenamed as an external contract for now.


