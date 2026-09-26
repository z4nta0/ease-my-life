


// #region Imports

import React from 'react'; // What: React. Why: This is the UI library the whole file's component and its hooks are built on. How: This is used directly (React.useState, React.useMemo, React.useCallback, ...) throughout instead of importing individual named hooks.


import { CAD_NAM_OBJ  } from './cadence.js';          // What: Cadence. Why: A cadence-scoped picker's run gaps need relabeling into real period words instead of raw day counts. How: This is called via CAD_NAM_OBJ.uniWorFun to turn a day/period count into "week"/"month"/"year" wording.
import { CarSurCom    } from './ui.jsx';              // What: Card Surface Component. Why: Every stat card on this page shares the same rounded container chrome. How: This wraps each headline/breakdown/heatmap block rendered below.
import { HelButCom    } from './help-mode.jsx';       // What: Help Button Component. Why: This page needs its own header toggle for entering and leaving help mode. How: This is rendered in the header, flipping helOnBoo on click.
import { HelOveCom    } from './help-mode.jsx';       // What: Help Overlay Component. Why: Help mode needs a dimmed overlay with per-element tooltips layered above the real page. How: This is rendered while helOnBoo is true, fed STA_HEL_ARR as its copy source.
import { hidHisFun    } from './help-sample-data.js'; // What: Hide History Function. Why: The real hidden sample pickers borrowed for help mode must be re-hidden once help mode ends. How: This is called whenever helOnBoo turns false, and again on unmount.
import { IcoSvgCom    } from './ui.jsx';              // What: Icon Svg Component. Why: Several small glyphs (sort-direction arrows, the streak flame) are needed throughout this page. How: This is rendered with a specific name and size wherever one of those glyphs is shown.
import { InfTipCom    } from './ui.jsx';              // What: Info Tip Component. Why: The Spent metric's "no completed cycle yet" case needs a small inline explanation. How: This renders a "?" bubble with its own label text next to that N/A value.
import { PilTagCom    } from './ui.jsx';              // What: Pill Tag Component. Why: The single-picker header needs a small labelled pill showing the picker's own mode. How: This renders that pill, toned as 'mode'.
import { SED_NAM_OBJ  } from './seed.js';             // What: Seed Namespace Object. Why: Every picker mode's own display label and hint text live in this shared table. How: This is looked up (MOD_DEF_OBJ) by a picker's own mode key throughout the page.
import { STA_HEL_ARR  } from './help-content.jsx';    // What: Stats Help Array. Why: Help mode needs this page's own tooltip copy, keyed to its elements. How: This is passed straight through to HelOveCom.
import { TASKS        } from './tasks.js';            // What: Tasks. Why: Which reminder types actually opt into Stats is a persisted, normalized setting. How: This is called via TASKS.normalizeOpts on the raw persisted reminderOpts.
import { unhHisFun    } from './help-sample-data.js'; // What: Unhide History Function. Why: Help mode borrows the real hidden sample pickers so the heatmap and breakdown have genuine history to show. How: This is called whenever helOnBoo turns true, as long as the page tour doesn't already own the same samples.
import { useEmlTouFun } from './eml-tour-bus.js';     // What: Use Ease My Life Tour. Why: The Welcome Tour needs to reserve top space above this page's content when its own coach card doesn't fit. How: This is called once to read the shared tour event bus's reserveTop field.

// #endregion Imports



/**
 * tab-stats.jsx = Tab Stats
 *
 * @summary
 * The Stats tab: the pick-log-derived history view, an activity heatmap,
 * per-picker breakdown, and reminder/conditional history, all filterable by
 * Group/Type/Pickers and a date range, paginated (PagNavCom) once a list runs
 * long. BreBarCom renders the small horizontal breakdown bar charts
 * throughout, HeaLegCom their shared legend; dayIsoFun/relWheFun/couLevFun are
 * small date/heatmap-level helpers the rest of the file reads from. TabStats
 * ties every section together as the tab.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region dayIsoFun

/**
 * dayIsoFun = Day Iso Function
 *
 * @summary
 * Converts a Date into the local calendar day it falls on, as a plain
 * 'YYYY-MM-DD' string. Matches store.js's own isoDay and seed.js's
 * seedIsoDay, so a value produced here compares equal against a row's
 * denormalized date field without any timezone drift.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param dayDatObj - Day Date Object: The Date to convert.
 *
 * @returns The local calendar day as a 'YYYY-MM-DD' string.
 *
 * @example
 * ```ts
 * dayIsoFun(new Date())
 * // => a 'YYYY-MM-DD' string
 * ```
 *
*/

function dayIsoFun ( dayDatObj ) {


	const locDatObj = new Date( dayDatObj ); // What: Local Date Object. Why: The original Date must not be mutated by the timezone shift below. How: This clones dayDatObj before adjusting it.

	locDatObj.setMinutes( locDatObj.getMinutes() - locDatObj.getTimezoneOffset() ); // What: Timezone Shift Call. Why: toISOString always renders in UTC, which would drift the calendar day near midnight in most local timezones. How: This shifts the clock by the local UTC offset so slicing the ISO string yields the correct local day.


	return locDatObj.toISOString().slice( 0, 10 ); // What: Local Day Return. Why: Only the date portion, not the shifted time-of-day, is a meaningful "day" value. How: This slices the first 10 characters ('YYYY-MM-DD') off the shifted ISO string.


}

// #endregion dayIsoFun



// #region relWheFun

/**
 * relWheFun = Relative When Function
 *
 * @summary
 * Formats a completion timestamp as a short relative-reading date label,
 * such as "Mon, Jan 5". Today and Yesterday deliberately get no special
 * case of their own: an earlier version produced longer, differently
 * shaped strings for those two ("Today · 3:04 PM" / "Yesterday"), which
 * misaligned the column this label sits in against every other row, so
 * both now fall through to the same format as any other day.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param whenIsoStr - When Iso String: The ISO timestamp string to format.
 *
 * @returns A short "weekday, month day" label.
 *
 * @example
 * ```ts
 * relWheFun('2026-09-01T12:00:00.000Z')
 * // => 'Tue, Sep 1'
 * ```
 *
*/

function relWheFun ( whenIsoStr ) {


	const whnDatObj = new Date( whenIsoStr ); // What: When Date Object. Why: The formatter below needs a real Date, not the raw ISO string. How: This parses whenIsoStr into a Date instance.


	return whnDatObj.toLocaleDateString( 'en-US', { weekday : 'short', month : 'short', day : 'numeric' } ); // What: Short Label Return. Why: Every row in the Reminders log/breakdown lists needs one compact, consistently-shaped date label. How: This formats whnDatObj as "weekday, month day" using the locale formatter.


}

// #endregion relWheFun



const STA_RAN_ARR = [ // What: Stat Range Array. Why: This defines the fixed set of lookback windows the Range filter row offers. How: This is mapped over to render one pill per entry, and rangeDef/cutIsoStr below resolve the active one by its own keyStr.


	{ keyStr : 'all',   labStr : 'All Time', dayNum : Infinity }, // What: Key String. Why: This uniquely identifies the range. How: This is compared against ranValStr for active-state styling and to resolve rangeDef. // What: Label String. Why: This names the range for the user. How: This is rendered as the pill's visible text. // What: Day Number. Why: This is the lookback window's own length. How: This is subtracted from today to compute cutIsoStr, or left as Infinity to mean no cutoff at all.
	{ keyStr : 'year',  labStr : '1 year',   dayNum : 365      }, // What: Key String. Why: This uniquely identifies the range. How: This is compared against ranValStr for active-state styling and to resolve rangeDef. // What: Label String. Why: This names the range for the user. How: This is rendered as the pill's visible text. // What: Day Number. Why: This is the lookback window's own length. How: This is subtracted from today to compute cutIsoStr.
	{ keyStr : '6m',    labStr : '6 months', dayNum : 182      }, // What: Key String. Why: This uniquely identifies the range. How: This is compared against ranValStr for active-state styling and to resolve rangeDef. // What: Label String. Why: This names the range for the user. How: This is rendered as the pill's visible text. // What: Day Number. Why: This is the lookback window's own length. How: This is subtracted from today to compute cutIsoStr.
	{ keyStr : '3m',    labStr : '3 months', dayNum : 90       }, // What: Key String. Why: This uniquely identifies the range. How: This is compared against ranValStr for active-state styling and to resolve rangeDef. // What: Label String. Why: This names the range for the user. How: This is rendered as the pill's visible text. // What: Day Number. Why: This is the lookback window's own length. How: This is subtracted from today to compute cutIsoStr.
	{ keyStr : 'month', labStr : 'Month',    dayNum : 30       }, // What: Key String. Why: This uniquely identifies the range. How: This is compared against ranValStr for active-state styling and to resolve rangeDef. // What: Label String. Why: This names the range for the user. How: This is rendered as the pill's visible text. // What: Day Number. Why: This is the lookback window's own length. How: This is subtracted from today to compute cutIsoStr.
	{ keyStr : 'week',  labStr : 'Week',     dayNum : 7        }  // What: Key String. Why: This uniquely identifies the range. How: This is compared against ranValStr for active-state styling and to resolve rangeDef. // What: Label String. Why: This names the range for the user. How: This is rendered as the pill's visible text. // What: Day Number. Why: This is the lookback window's own length. How: This is subtracted from today to compute cutIsoStr.


];



const SOU_MET_ARR = [ // What: Source Meta Array. Why: This defines how each Today pick came to be, kept on-palette (accent + warm) so the breakdown bar reads as one family rather than a random spectrum. How: This is mapped in the "How picks were chosen" BreBarCom card, joined with each source's own live count.


	{ keyStr : 'auto',   labStr : 'Auto Generated', colStr : 'var(--accent)'                                               }, // What: Key String. Why: This matches a pick row's own source field. How: This is used to look up that source's live count. // What: Label String. Why: This names the source for the legend. How: This is rendered as the legend row's visible text. // What: Color String. Why: This is the segment's own bar/dot color. How: This is applied as an inline style value.
	{ keyStr : 'reroll', labStr : 'Re-Rolled',      colStr : 'oklch(from var(--accent) calc(l + 0.22) calc(c - 0.05) h)' }, // What: Key String. Why: This matches a pick row's own source field. How: This is used to look up that source's live count. // What: Label String. Why: This names the source for the legend. How: This is rendered as the legend row's visible text. // What: Color String. Why: This is the segment's own bar/dot color. How: This is applied as an inline style value.
	{ keyStr : 'manual', labStr : 'Hand Picked',    colStr : 'var(--warm)'                                                 }  // What: Key String. Why: This matches a pick row's own source field. How: This is used to look up that source's live count. // What: Label String. Why: This names the source for the legend. How: This is rendered as the legend row's visible text. // What: Color String. Why: This is the segment's own bar/dot color. How: This is applied as an inline style value.


];



const TYP_MET_ARR = [ // What: Type Meta Array. Why: This defines the one-time versus recurring split shown for reminders, sharing the same visual language as SOU_MET_ARR. How: This is mapped in the "By reminder type" BreBarCom card, joined with each type's own live count.


	{ keyStr : 'recurring', labStr : 'Recurring', colStr : 'var(--accent)' }, // What: Key String. Why: This matches a reminder log row's own type field. How: This is used to look up that type's live count. // What: Label String. Why: This names the type for the legend. How: This is rendered as the legend row's visible text. // What: Color String. Why: This is the segment's own bar/dot color. How: This is applied as an inline style value.
	{ keyStr : 'once',      labStr : 'One-Time',  colStr : 'var(--warm)'   }  // What: Key String. Why: This matches a reminder log row's own type field. How: This is used to look up that type's live count. // What: Label String. Why: This names the type for the legend. How: This is rendered as the legend row's visible text. // What: Color String. Why: This is the segment's own bar/dot color. How: This is applied as an inline style value.


];



// #region couLevFun

/**
 * couLevFun = Count Level Function
 *
 * @summary
 * Converts a raw day count of completed reminders into a 0-4 heat level
 * for the heatmap. Reminders have no "possible" denominator the way picks
 * do (there's no fixed daily total to divide by), so this is a raw volume
 * scale rather than a ratio like the pick heatmap uses.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param donCouNum - Done Count Number: How many reminders were completed
 *                    that day.
 *
 * @returns A heat level from 0 (none) to 4 (four or more).
 *
 * @example
 * ```ts
 * couLevFun(6)
 * // => 4
 * ```
 *
*/

function couLevFun ( donCouNum ) {


	return donCouNum <= 0 ? 0 : donCouNum >= 4 ? 4 : donCouNum; // What: Heat Level Return. Why: Zero and negative counts show as empty, four or more caps at the darkest cell, and anything between maps onto itself. How: This is a plain clamp of donCouNum into the 0-4 range.


}

// #endregion couLevFun



// #region BreBarCom

/**
 * BreBarCom = Breakdown Bar Component
 *
 * @summary
 * Renders a stacked proportion bar plus a legend list underneath it, used
 * both for the pick-source split ("How picks were chosen") and the
 * reminder one-time/recurring split ("By reminder type"). Shows an empty
 * state instead of a zero-width bar when there's nothing to show yet.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.titStr    - Title String: The card's own kicker text.
 * @param props.totNum    - Total Number: The combined total every segment's
 *                          own share is computed against.
 * @param props.segArr    - Segment Array: {@link SOU_MET_ARR} or {@link
 *                          TYP_MET_ARR}, each entry already joined with its
 *                          own live n.
 * @param props.empStr    - Empty String: Message shown in place of the bar
 *                          when totNum is zero.
 * @param props.className - Class Name: Extra class name(s) to append; defaults
 *                          to an empty string.
 *
 * @returns The card containing the stacked bar and legend, or the empty
 * state.
 *
 * @example
 * ```tsx
 * BreBarCom({ titStr, totNum, segArr, empStr, className })
 * // => <BreBarCom />
 * ```
 *
*/

function BreBarCom ( { titStr, totNum, segArr, empStr, className = '' } ) {


	return (


		<CarSurCom
			className={ className }
		>{ /* What: Card Surface Component. Why: This is BreBarCom's own root container, shared chrome with every other stat card. How: This renders the kicker, then either the bar and legend or the empty state below it. */ }


			<div className='kicker'>{ titStr }</div>{ /* What: Kicker Div Element. Why: Every card on this page opens with a small labelled kicker. How: This renders the caller's own titStr. */ }

			{ totNum > 0 ? ( // What: Has Data Check. Why: A stacked bar with nothing in it would render as an empty, confusing sliver. How: This renders the real bar and legend only while totNum is positive, otherwise the empty state below.


				<div className='bd'>{ /* What: Breakdown Div Element. Why: This groups the bar and its legend as one visual unit. How: This wraps the bd-bar span row and the bd-legend list below it. */ }


					<div className='bd-bar'>{ /* What: Bar Div Element. Why: This is the actual stacked proportion bar. How: This renders one span per non-zero segment, each sized to its own share of totNum. */ }


						{ segArr.filter( ( segObj ) => segObj.n > 0 ).map( ( segObj ) => ( // What: Bar Segment Render. Why: A zero-count segment would render as an invisible sliver anyway, so it's skipped entirely. How: This maps every segment with a positive count to one proportionally-widthed span.


							<span
								key={ segObj.keyStr }
								className='bd-seg'
								style={{
									background : segObj.colStr,
									width      : `${ ( segObj.n / totNum ) * 100 }%`
								}}
								title={ `${ segObj.labStr }: ${ segObj.n }` }
							/> // What: Segment Span Element. Why: Each stacked segment needs its own width, color, and a hover tooltip with the raw count. How: This is sized to the segment's own share of totNum and colored via its own colStr.


						))}


					</div>


					<ul className='bd-legend'>{ /* What: Legend List Element. Why: The bar alone doesn't label its own segments. How: This renders one legend row per segment, including zero-count ones, each with its own dot, name, value, and percentage. */ }


						{ segArr.map( ( segObj ) => ( // What: Legend Row Render. Why: Every segment, even a zero-count one, still needs its own legend row for context. How: This maps every segment in segArr to one legend list item.


							<li key={ segObj.keyStr }>{ /* What: Legend Item Element. Why: Each segment needs its own row grouping a color dot, its label, its count, and its share. How: This renders those four pieces as sibling spans. */ }


								<span className='bd-dot' style={{ background : segObj.colStr }} />{ /* What: Dot Span Element. Why: The legend row needs a small color swatch matching its bar segment. How: This is a plain colored dot, styled via segObj's own colStr. */ }

								<span className='bd-label'>{ segObj.labStr }</span>{ /* What: Label Span Element. Why: The legend row needs the segment's own name. How: This renders segObj.labStr. */ }

								<span className='bd-val'>{ segObj.n }</span>{ /* What: Value Span Element. Why: The legend row needs the segment's own raw count. How: This renders segObj.n. */ }

								<span className='bd-pct'>{ totNum ? Math.round( ( segObj.n / totNum ) * 100 ) : 0 }%</span>{ /* What: Percent Span Element. Why: The legend row needs the segment's own share of the total. How: This computes segObj.n as a percentage of totNum, guarding against a zero totNum. */ }


							</li>


						))}


					</ul>


				</div>


			) : <div className='stat-empty'>{ empStr }</div> }{ /* What: Empty State Div Element. Why: A zero-total card needs to explain why the bar is missing instead of showing nothing at all. How: This renders the caller's own empStr message in place of the bar and legend. */ }


		</CarSurCom>


	);


}

// #endregion BreBarCom



// #region HeaLegCom

/**
 * HeaLegCom = Heat Legend Component
 *
 * @summary
 * Renders the small "less ... more" heat-scale legend shown beside every
 * heatmap, made up of one static swatch per heat level (0 through 4).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props - This component does not use any props.
 *
 * @returns The heat-scale legend row.
 *
 * @example
 * ```tsx
 * HeaLegCom()
 * // => <HeaLegCom />
 * ```
 *
*/

function HeaLegCom () {


	return (


		<div className='heat-legend'>{ /* What: Legend Div Element. Why: This groups the "less"/"more" labels and the 5 swatches into one row. How: This renders those 7 children in a fixed left-to-right order. */ }


			<span>less</span>{ /* What: Less Span Element. Why: The scale needs a label at its dim end. How: This renders the literal word "less". */ }
			<i className='heat-cell heat-0' />{ /* What: Swatch Element. Why: This is the scale's own level-0 (empty) reference swatch. How: This is a plain, non-interactive colored cell sharing the real heatmap cells' own classes. */ }
			<i className='heat-cell heat-1' />{ /* What: Swatch Element. Why: This is the scale's own level-1 reference swatch. How: This is a plain, non-interactive colored cell sharing the real heatmap cells' own classes. */ }
			<i className='heat-cell heat-2' />{ /* What: Swatch Element. Why: This is the scale's own level-2 reference swatch. How: This is a plain, non-interactive colored cell sharing the real heatmap cells' own classes. */ }
			<i className='heat-cell heat-3' />{ /* What: Swatch Element. Why: This is the scale's own level-3 reference swatch. How: This is a plain, non-interactive colored cell sharing the real heatmap cells' own classes. */ }
			<i className='heat-cell heat-4' />{ /* What: Swatch Element. Why: This is the scale's own level-4 (darkest) reference swatch. How: This is a plain, non-interactive colored cell sharing the real heatmap cells' own classes. */ }
			<span>more</span>{ /* What: More Span Element. Why: The scale needs a label at its dark end. How: This renders the literal word "more". */ }


		</div>


	);


}

// #endregion HeaLegCom



// #region PagNavCom

/**
 * PagNavCom = Pager Navigation Component
 *
 * @summary
 * A reusable Gmail-style range pager: "1-10 of N" with previous/next
 * arrows. Hides itself entirely once the whole list already fits on one
 * page, unless the caller forces it to stay visible via alwShoBoo. Page
 * numbers are 0-indexed; the caller owns clamping/resetting curPagNum
 * whenever the underlying list changes shape.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.curPagNum - Current Page Number: The current, 0-indexed page.
 * @param props.pagSizNum - Page Size Number: How many items one page holds.
 * @param props.totIteNum - Total Item Number: The full, unpaged item count.
 * @param props.onChange  - On Change: Called with the next 0-indexed page on
 *                          an arrow tap.
 * @param props.uniStr    - Unit String: Unit word shown after the total;
 *                          defaults to 'items'.
 * @param props.alwShoBoo - Always Show Boolean: Forces the pager to render
 *                          even when everything fits on one page; defaults to
 *                          false.
 *
 * @returns The pager row, or nothing at all when the list fits on one
 * page and alwShoBoo is false.
 *
 * @example
 * ```tsx
 * PagNavCom({ curPagNum, pagSizNum, totIteNum, onChange, ... })
 * // => <PagNavCom />
 * ```
 *
*/

function PagNavCom ( { curPagNum, pagSizNum, totIteNum, onChange, uniStr = 'items', alwShoBoo = false } ) {


	const pagCouNum = Math.max( 1, Math.ceil( totIteNum / pagSizNum ) ); // What: Page Count Number. Why: The arrows need to know how many pages actually exist so the last page's next arrow can disable itself. How: This divides totIteNum by pagSizNum, rounding up, floored at 1 even for an empty list.

	if ( totIteNum <= pagSizNum && !alwShoBoo ) return null; // What: Fits On One Page Guard. Why: A pager showing "1-N of N" with both arrows disabled adds nothing once everything already fits. How: This renders nothing at all unless the caller forced alwShoBoo.



	const staIteNum = totIteNum === 0 ? 0 : curPagNum * pagSizNum + 1;          // What: Start Item Number. Why: The visible range's own first item number depends on which page is active. How: This is 0 for an empty list, otherwise the current page's own first 1-indexed item.
	const endIteNum = Math.min( totIteNum, ( curPagNum + 1 ) * pagSizNum );    // What: End Item Number. Why: The visible range's own last item number must not overshoot the real total on a partial final page. How: This takes whichever is smaller between the page's own last slot and the true total.


	return (


		<div className='pager'>{ /* What: Pager Div Element. Why: This is PagNavCom's own root element, grouping the range text and the arrow buttons. How: This renders the "start-end of total" text followed by the two arrow buttons. */ }


			<span className='pager-range'>{ /* What: Range Span Element. Why: The pager needs one combined "1-10 of N items" readout. How: This renders staIteNum, an en dash, endIteNum, "of", totIteNum, and the optional unit word. */ }


				{ staIteNum }&ndash;{ endIteNum } <span className='pager-of'>of</span> { totIteNum }{ uniStr ? ` ${ uniStr }` : '' }


			</span>


			<div className='pager-arrows'>{ /* What: Arrows Div Element. Why: The previous/next controls are grouped together for layout. How: This renders the two arrow buttons side by side. */ }


				<button
					type='button'
					className='pager-arrow'
					disabled={ curPagNum <= 0 }
					aria-label='Previous page'
					onClick={ () => onChange( curPagNum - 1 ) }
				>&lsaquo;</button>{ /* What: Previous Arrow Button Element. Why: The user needs a way to move back one page. How: This is disabled on the first page and otherwise calls onChange with the previous page index. */ }

				<button
					type='button'
					className='pager-arrow'
					disabled={ curPagNum >= pagCouNum - 1 }
					aria-label='Next page'
					onClick={ () => onChange( curPagNum + 1 ) }
				>&rsaquo;</button>{ /* What: Next Arrow Button Element. Why: The user needs a way to move forward one page. How: This is disabled on the last page and otherwise calls onChange with the next page index. */ }


			</div>


		</div>


	);


}

// #endregion PagNavCom



// #region TabStats

/**
 * TabStats = Tab Stats
 *
 * @summary
 * Renders the Stats tab. Everything shown here is derived on the fly from
 * the app's flat, append-only logs (state.pickLog, .conditionalLog,
 * .reminderLog, .reminderSkipLog, .vacationLog) rather than from any
 * dedicated stats storage of its own, so the Group/Type/Show/Range filter
 * row above the page applies uniformly to every card below it: the
 * heatmap, the headline totals, the completion rate, the streak, the
 * most/least picked rankings, and the auto/manual/re-roll source split.
 * Reminders and Conditionals each get their own dedicated scope that swaps
 * the whole dashboard over to their own shaped metrics instead of a
 * picker's.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.state    - State: The whole app's persisted state.
 * @param props.actions  - Actions: The whole app's state-transition functions.
 * @param props.onHome   - On Home: Navigates back to the Today tab.
 * @param props.onNavTab - On Nav Tab: Navigates to an arbitrary tab by id.
 *
 * @returns The Stats tab's own root element, including its header, filter
 * rows, and every scope-dependent card.
 *
 * @example
 * ```tsx
 * TabStats({ state, actions, onHome, onNavTab })
 * // => <TabStats />
 * ```
 *
*/

function TabStats ( { state, actions, onHome, onNavTab } ) {


	// #region Page Tour And Help Mode

	const touCtxObj = useEmlTouFun ? useEmlTouFun() : { reserveTop : 0 }; // What: Tour Context Object. Why: The Welcome Tour needs to reserve top space above this page's content when its own coach card doesn't fit above/below the highlighted area. How: This is read for its own reserveTop field and applied as top padding on the page body below.


	const [ helOnBoo, setHelOnBoo ] = React.useState( false );          // What: Help On Boolean And Setter. Why: This page needs its own toggle for entering and leaving help mode, since nothing here is editable the way Pickers/Data are. How: This is flipped by the header's HelButCom and read by the effect below.
	const helExiFun                 = React.useCallback( () => setHelOnBoo( false ), [] ); // What: Help Exit Function. Why: HelOveCom needs a stable close handler to call when the user dismisses it. How: This forces helOnBoo back to false.


	// Skipped while the Stats PAGE TOUR owns these same real samples (see
	// onboarding-page-tours.jsx's own unhideSampleHistory): this effect
	// also runs on mount (helOnBoo starts false), and without this guard it
	// would immediately re-hide the samples the instant the tour navigates
	// onto this page, right after the tour's own Step 1 just unhid them.
	// Confirmed as the cause of the Stats page tour going dim-with-nothing-
	// then-ending: the group filter's own existingGroups check never got
	// the chance to see any unhidden pickers before this ran them back to
	// hidden.
	const staTouBoo = !!( state.onboarding && state.onboarding.activeTour && state.onboarding.activeTour.id === 'page-explore_stats' ); // What: Stats Tour Active Boolean. Why: This page's own help-mode sample borrowing must defer to the page tour whenever the tour is the one currently driving the same samples. How: This checks the persisted onboarding state for that exact active tour id.

	React.useEffect( () => { // What: Help Sample History Effect. Why: Help mode borrows the real hidden sample pickers so the heatmap/breakdown have genuine history to show, and must give them back once help mode ends. How: This unhides the samples while helOnBoo is true, or hides them again otherwise, unless the page tour already owns them.


		if ( staTouBoo ) return; // What: Tour Ownership Guard. Why: Hiding the samples out from under the page tour would break its own Step 1 reveal. How: This bails out of the whole effect while the Stats page tour is active.

		if ( helOnBoo ) unhHisFun( state, actions ); // What: Unhide Samples Call. Why: Entering help mode needs real history to show. How: This reveals the borrowed hidden sample pickers.

		else hidHisFun( actions ); // What: Hide Samples Call. Why: Leaving help mode must not leave the borrowed samples permanently visible. How: This re-hides them.


	}, [ helOnBoo, staTouBoo ] ); // What: Effect Dependency Array. Why: This must re-run whenever help mode itself toggles, or whenever tour ownership of the samples changes. How: helOnBoo drives the actual show/hide, staTouBoo gates whether this effect is allowed to act at all.

	React.useEffect( () => () => hidHisFun( actions ), [] ); // What: Unmount Cleanup Effect. Why: The borrowed samples must not stay revealed if this page unmounts while help mode happens to still be on. How: This registers a cleanup-only effect that hides the samples on unmount, with no setup of its own.

	// #endregion Page Tour And Help Mode



	// #region Scope And Filter State

	// scoValStr: 'all' | <pickerId> | 'reminders' | 'conditionals'.
	const [ scoValStr, setScoValStr ] = React.useState( 'all' );      // What: Scope Value String And Setter. Why: This is the single source of truth for which card set the whole page shows: everything, one picker, Conditionals, or Reminders. How: This is read throughout every memo below and written by the Show/Type filter rows.
	const [ ranValStr, setRanValStr ] = React.useState( 'all' );      // What: Range Value String And Setter. Why: Every card on the page needs the same active lookback window. How: This is resolved into ranDefObj/cutIsoStr below and written by the Range filter row.


	// Shared sort direction for the single-picker "Pick breakdown" list,
	// used by every metric pill it can show.
	const [ sorDirStr, setSorDirStr ] = React.useState( 'desc' );     // What: Sort Direction String And Setter. Why: The Pick breakdown list needs one shared High-to-Low/Low-to-High toggle regardless of which metric is active. How: This is applied inside the breListArr sort below and flipped by the card's own sort button.
	// Which per-item metric the Pick breakdown shows: count | freq | auto |
	// manual | rejected | skipped (and 'spent' substitutes for 'freq' on an
	// ease-down picker).
	const [ metKeyStr, setMetKeyStr ] = React.useState( 'count' );    // What: Metric Key String And Setter. Why: The Pick breakdown card pivots its whole displayed value and sort on this one selection. How: This is read by effMetStr below and written by the bd-metrics pill row.
	// Unit for the "Last picked" metric: calendar days vs. the picker's own
	// eligible (run) days, toggled inline in that metric's own explanation.
	const [ lasModStr, setLasModStr ] = React.useState( 'calendar' ); // What: Last Mode String And Setter. Why: "Last picked" can be read either in literal calendar days or in the picker's own eligible run-days. How: This is read wherever lasForFun formats a lastDays value.
	// Same calendar/eligible toggle for the "Frequency" metric's own
	// average gap.
	const [ freModStr, setFreModStr ] = React.useState( 'eligible' ); // What: Frequency Mode String And Setter. Why: "Frequency" can be read either in literal calendar days or in the picker's own eligible run-days. How: This selects which of freGapMap's two gap values (aveGapCal/aveGapElig) is shown.
	// And for the ease-down "Spent" metric.
	const [ speModStr, setSpeModStr ] = React.useState( 'eligible' ); // What: Spent Mode String And Setter. Why: "Spent" can likewise be read in calendar days or the picker's own eligible run-days. How: This selects which of speGapMap's two values (cal/elig) is shown.
	// Count denominator mode: 'total' (share of all picks, sums to 100%)
	// vs. 'eligible' (share of picks made while the item was active).
	const [ couModStr, setCouModStr ] = React.useState( 'total' );    // What: Count Mode String And Setter. Why: The Count metric's own percentage column can read against either the whole picker's total or just this item's own eligible window. How: This is read inside the breListArr JSX where the Count metric's percent/fraction is rendered.

	// Reminders "Reminders breakdown" card: which metric it pivots on, its
	// own sort direction, and the current pager page (0-indexed).
	const [ remMetStr, setRemMetStr ] = React.useState( 'recent' ); // What: Reminder Metric String And Setter. Why: The Reminders breakdown card can pivot between its recent-completions log and per-reminder completion/skip totals. How: This selects which of remRecArr/remComArr/remSkiArr feeds remBreArr below.
	const [ remSorStr, setRemSorStr ] = React.useState( 'desc' );    // What: Reminder Sort String And Setter. Why: Every one of remMetStr's own shapes still needs a shared High/Low or Newest/Oldest toggle. How: This is applied inside remRecArr/remComArr/remSkiArr's own sort and flipped by the card's sort button.
	const [ remIndNum, setRemIndNum ] = React.useState( 0 );         // What: Reminder Index Number And Setter. Why: The Reminders breakdown card's own list is paged, so the current 0-indexed page must be tracked. How: This is clamped into remSafNum below and reset to 0 whenever the underlying list's shape changes.

	// Conditionals scope breakdown: which metric its own list pivots on,
	// plus its sort direction.
	const [ conMetStr, setConMetStr ] = React.useState( 'rate' ); // What: Conditional Metric String And Setter. Why: The Conditionals breakdown list can pivot across fire rate, trigger count, cycle count, average interval, or last-fired date. How: This selects the sort key used inside conBreArr below.
	const [ conSorStr, setConSorStr ] = React.useState( 'desc' ); // What: Conditional Sort String And Setter. Why: Every one of conMetStr's own shapes still needs a shared High/Low toggle. How: This is applied inside conBreArr's own sort and flipped by the card's sort button.

	// Heatmap: the day cell the user tapped, whose own detail shows below
	// the grid. Hover still uses the native title tooltip; a tap drives
	// this instead, for touch.
	const [ heaSelStr, setHeaSelStr ] = React.useState( null ); // What: Heat Selected String And Setter. Why: Touch devices have no hover, so a tapped day needs its own persisted selection to show its detail list. How: This holds the tapped day's own date string, or null when nothing is selected.
	// Heatmap year pager, only used when "All time" spans more than one
	// calendar year (keeps the grid bounded to one year at a time). null
	// means "the latest year".
	const [ heaYeaNum, setHeaYeaNum ] = React.useState( null ); // What: Heat Year Number And Setter. Why: An "All time" heatmap spanning several calendar years would otherwise grow unreasonably tall. How: This is clamped into actYeaNum below and changed by the year-pager arrows.
	// Direction of the last year-page change ('next' | 'prev'), so the grid
	// can slide in from the matching side. Cleared to '' on any other
	// change.
	const [ heaDirStr, setHeaDirStr ] = React.useState( '' ); // What: Heat Direction String And Setter. Why: The heatmap's own slide-in animation needs to know which edge to enter from. How: This is set by the year-pager arrows and applied as a className modifier on the grid.

	// #endregion Scope And Filter State



	const ranDefObj  = STA_RAN_ARR.find( ( rngObj ) => rngObj.keyStr === ranValStr ) || STA_RAN_ARR[ 0 ];       // What: Range Definition Object. Why: Every card below needs the active range's own label and day count, not just its key. How: This looks up ranValStr in STA_RAN_ARR, falling back to "All Time".
	const ranNouStr  = ranValStr === 'all' ? 'all time' : `the last ${ ranDefObj.labStr.toLowerCase() }`;       // What: Range Noun String. Why: Several empty-state and explanatory sentences need the active range phrased as a noun clause. How: This special-cases "all time" and otherwise lowercases ranDefObj's own label into a "the last X" phrase.
	const ranKicStr  = ranValStr === 'all' ? 'All time' : `Last ${ ranDefObj.labStr.toLowerCase() }`;           // What: Range Kicker String. Why: The heatmap card's own kicker needs the active range phrased as a short heading instead of a noun clause. How: This special-cases "All time" and otherwise capitalizes a "Last X" phrase from ranDefObj's own label.

	const todDatObj = React.useMemo( () => { const zerDatObj = new Date(); zerDatObj.setHours( 0, 0, 0, 0 ); return zerDatObj; }, [] ); // What: Today Date Object. Why: Every date-math memo below needs one stable, time-zeroed "today" reference rather than repeatedly calling new Date(). How: This is computed once on mount and never recomputed.
	const todIsoStr = dayIsoFun( todDatObj );                                                                                            // What: Today Iso String. Why: The streak, heatmap, and "last picked" math all need today's own calendar day as a plain string. How: This converts todDatObj via the shared dayIsoFun helper.
	const cutIsoStr = React.useMemo( () => { // What: Cutoff Iso String Memo. Why: Every range-filtered query below needs one shared lower-bound date to compare a row's own date against. How: This computes today minus the active range's own day count, or null for "All time"'s no-cutoff case.


		if ( ranDefObj.dayNum === Infinity ) return null; // What: No Cutoff Guard. Why: "All time" has no lower bound at all. How: This returns null, which every range-filtered query below treats as "include everything".

		const cutDatObj = new Date( todDatObj ); // What: Cutoff Date Object. Why: The cutoff must be computed from today, not mutate todDatObj itself. How: This clones todDatObj before subtracting the range's own day count.

		cutDatObj.setDate( todDatObj.getDate() - ( ranDefObj.dayNum - 1 ) ); // What: Cutoff Date Subtraction. Why: A range's own day count is inclusive of today, so only dayNum-1 days need subtracting to land on the correct earliest day. How: This moves cutDatObj back by that many days.


		return dayIsoFun( cutDatObj ); // What: Cutoff Iso Return. Why: Every comparison against this cutoff elsewhere compares against a plain date string, not a Date object. How: This converts cutDatObj via the shared dayIsoFun helper.


	}, [ ranDefObj, todDatObj ] ); // What: Effect Dependency Array. Why: The cutoff only ever needs recomputing when the active range definition or today's own date changes. How: ranDefObj changes the day-count subtracted, todDatObj changes the date it's subtracted from.



	const picLogArr = state.pickLog || [];   // What: Pick Log Array. Why: Every pick-related card on this page derives from this one flat, append-only log. How: This falls back to an empty array for a fresh install with no history yet.
	const picLisArr = state.pickers || [];   // What: Picker List Array. Why: The Show/Group/Type filter rows and every picker lookup below need the live picker list. How: This falls back to an empty array for a fresh install with no pickers yet.

	// Hidden pickers/tasks (see store.js's own hidden flag) keep their
	// history rows in picLogArr/reminderLog/reminderSkipLog (nothing here
	// is ever deleted), but every rollup below excludes them by id so the
	// numbers reflect only what's currently visible, same as Today/Pickers/
	// Data.
	const hidPicSet = React.useMemo( () => ( // What: Hidden Picker Set Memo. Why: Excluding a hidden picker's own rows from every rollup needs a fast id lookup, not a repeated array scan. How: This collects every picker flagged hidden into a Set of ids.


		new Set( picLisArr.filter( ( picObj ) => picObj.hidden ).map( ( picObj ) => picObj.id ) )


	), [ picLisArr ] ); // What: Effect Dependency Array. Why: This set only ever needs rebuilding when the picker list itself changes. How: picLisArr is the sole source the filter/map above reads from.

	const hidTasSet = React.useMemo( () => ( // What: Hidden Task Set Memo. Why: Excluding a hidden reminder task's own rows from every reminder rollup needs the same fast id lookup. How: This collects every task flagged hidden into a Set of ids.


		new Set( ( state.tasks || [] ).filter( ( tasObj ) => tasObj.hidden ).map( ( tasObj ) => tasObj.id ) )


	), [ state.tasks ] ); // What: Effect Dependency Array. Why: This set only ever needs rebuilding when the persisted task list itself changes. How: state.tasks is the sole source the filter/map above reads from.



	// #region Conditionals Scope Data

	const conDefArr = state.conditionals || [];                                 // What: Conditional Definition Array. Why: The Conditionals scope needs the live definitions to join against their own trigger history. How: This falls back to an empty array for a fresh install with no conditionals yet.
	const conLogArr = state.conditionalLog || [];                               // What: Conditional Log Array. Why: This flat, append-only log holds every historical trigger evaluation, including ones for now-deleted conditionals. How: This falls back to an empty array when nothing has ever fired.
	const hasConBoo = conDefArr.length > 0 || conLogArr.length > 0;             // What: Has Conditional Boolean. Why: The Type filter row and the whole Conditionals scope should only appear at all once there's something to show. How: This is true when either a live definition or a logged history row exists.
	const isaConBoo = scoValStr === 'conditionals';                             // What: Is-A Conditional Boolean. Why: Several blocks below need a quick check for whether the Conditionals scope is the active one. How: This compares scoValStr against the 'conditionals' sentinel value.

	const conStaArr = React.useMemo( () => { // What: Conditional Stats Array Memo. Why: The Conditionals headline numbers and breakdown list both need one summarized row per conditional (live or deleted), joined against its own range-filtered trigger history. How: This walks conLogArr once, accumulating totals/fired counts/fire dates per conditional id, then finalizes rate/interval fields.


		const rngRowArr = conLogArr.filter( ( rowObj ) => !cutIsoStr || rowObj.date >= cutIsoStr ); // What: Ranged Row Array. Why: Only trigger evaluations inside the active range should count toward the summarized stats. How: This keeps every log row whose own date is on or after cutIsoStr, or every row at all when there's no cutoff.

		const conByIdMap = new Map(); // What: Conditional By Id Map. Why: Both live and deleted conditionals need one shared accumulator, keyed by id, to build up their own totals into. How: This starts empty and is populated by the two loops below.


		for ( const conObj of conDefArr ) conByIdMap.set( conObj.id, { // What: Live Conditional Seed Loop. Why: Every live conditional needs a starting accumulator row, even one that never fired in range. How: This seeds one entry per live definition with its own current config values and zeroed history fields.


			active    : conObj.active !== false,
			deleted   : false,
			easeMax   : conObj.easeMax ?? 14,
			easeMin   : conObj.easeMin ?? 7,
			fired     : 0,
			fireDates : [],
			id        : conObj.id,
			lastFired : null,
			mode      : conObj.mode,
			name      : conObj.name,
			oddsPct   : conObj.oddsPct ?? 50,
			threshold : conObj.threshold ?? 100,
			total     : 0,
			value     : conObj.value ?? 0


		});

		for ( const rowObj of rngRowArr ) { // What: Trigger History Accumulation Loop. Why: Every ranged log row needs to be folded into its own conditional's accumulator, including a since-deleted conditional with no live seed above. How: This looks up (or lazily creates, for a deleted conditional) the accumulator row, then increments its totals and fire history.


			let conRowObj = conByIdMap.get( rowObj.condId ); // What: Conditional Row Object. Why: The accumulator for this specific row's own conditional might already exist (live) or might not (deleted). How: This looks it up by the row's own condId.

			if ( !conRowObj ) { // What: Deleted Conditional Lazy-Seed Guard. Why: A trigger row can outlive the conditional it belonged to, since the log is append-only and never rewritten on delete. How: This creates a minimal accumulator, flagged deleted, using the row's own denormalized name/mode.


				conRowObj = { id : rowObj.condId, name : rowObj.name || 'Deleted conditional', mode : rowObj.mode, deleted : true, total : 0, fired : 0, lastFired : null, fireDates : [] };

				conByIdMap.set( rowObj.condId, conRowObj );


			}

			conRowObj.total++; // What: Total Increment. Why: Every evaluated cycle, fired or not, counts toward the conditional's own total. How: This increments the accumulator's total field by one.

			if ( rowObj.triggered ) { // What: Triggered Branch. Why: Only a row where the conditional actually fired should count toward fired/lastFired/fireDates. How: This increments fired, records the fire date, and advances lastFired when this row is more recent.


				conRowObj.fired++;

				conRowObj.fireDates.push( rowObj.date );

				if ( !conRowObj.lastFired || rowObj.date > conRowObj.lastFired ) conRowObj.lastFired = rowObj.date;


			}


		}

		for ( const conRowObj of conByIdMap.values() ) { // What: Rate And Interval Finalize Loop. Why: The average fire interval and fire-rate percentage can only be computed once every row has been folded in. How: This computes aveInterval from sorted fireDates (when there are at least two), and rate as a simple fired/total percentage.


			if ( conRowObj.fireDates.length >= 2 ) { // What: Interval Computable Guard. Why: An average gap needs at least two fire dates to measure a gap between. How: This sorts the fire dates and averages the day-gaps between each consecutive pair.


				const sorDatArr = conRowObj.fireDates.slice().sort(); // What: Sorted Date Array. Why: Consecutive-gap math requires the fire dates in chronological order. How: This is a plain string sort, safe since ISO dates sort lexicographically in date order.

				let gapSumNum = 0; // What: Gap Sum Number. Why: The running total of day-gaps needs an accumulator before the loop below can average it. How: This starts at zero and is added to by every consecutive pair.


				for ( let indNum = 1; indNum < sorDatArr.length; indNum++ ) gapSumNum += ( new Date( sorDatArr[ indNum ] ) - new Date( sorDatArr[ indNum - 1 ] ) ) / 86400000; // What: Gap Accumulation Loop. Why: Every consecutive pair of fire dates contributes one day-gap to the running average. How: This divides the millisecond difference between two Dates by a day's own millisecond count and adds it to gapSumNum.

				conRowObj.aveInterval = Math.round( gapSumNum / ( sorDatArr.length - 1 ) ); // What: Average Interval Assignment. Why: The finished average needs to be stored back onto the accumulator for the breakdown list to read. How: This divides the summed gaps by the number of gaps (one fewer than the date count) and rounds to a whole day.


			}

			else conRowObj.aveInterval = null; // What: No Interval Case. Why: Fewer than two fire dates means there's no gap at all to average. How: This explicitly marks aveInterval as null rather than leaving it undefined.

			conRowObj.rate = conRowObj.total ? Math.round( ( conRowObj.fired / conRowObj.total ) * 100 ) : null; // What: Rate Assignment. Why: The breakdown list's own default sort and display both need a plain fire-rate percentage. How: This divides fired by total, guarding against a zero total, rounding to a whole percent.

			// Configured trigger probability, where the mode has one.
			conRowObj.configured = conRowObj.mode === 'random' ? 50 // What: Configured Probability Assignment. Why: Some modes have a fixed or user-set probability worth surfacing alongside the measured rate. How: A random mode is always 50%, a weighted/dynamic mode uses its own saved oddsPct, and any other mode has no such concept.
				: ( conRowObj.mode === 'weighted' || conRowObj.mode === 'dynamic' ) ? ( conRowObj.oddsPct ?? 50 ) : null;


		}

		const outConArr = []; // What: Out Conditional Array. Why: The finished stats need a stable, deterministic order rather than the Map's own insertion order. How: This starts empty and is filled below, live conditionals first in their own definition order, then deleted ones.


		for ( const conObj of conDefArr ) outConArr.push( conByIdMap.get( conObj.id ) ); // What: Live Order Push Loop. Why: Live conditionals should list in the same order their own definitions are stored in. How: This looks each one back up by id and appends it.

		for ( const conRowObj of conByIdMap.values() ) if ( conRowObj.deleted ) outConArr.push( conRowObj ); // What: Deleted Append Loop. Why: A deleted conditional's history should still surface, appended after every live one. How: This appends every accumulator flagged deleted.


		return outConArr; // What: Conditional Stats Return. Why: This is the finished, per-conditional summary the headline numbers and breakdown list both read from. How: This returns the ordered array built above.


	}, [ conDefArr, conLogArr, cutIsoStr ] ); // What: Effect Dependency Array. Why: The whole summary only ever needs recomputing when the live definitions, the trigger log, or the active range's own cutoff changes. How: conDefArr seeds live rows, conLogArr supplies the history folded in, cutIsoStr bounds which rows count.

	const conTotObj = React.useMemo( () => { // What: Conditional Totals Object Memo. Why: The Conditionals headline cards need one combined total/fired/rate/lastFired across every conditional, not per-conditional detail. How: This reduces conStaArr into those four combined fields.


		const totCouNum = conStaArr.reduce( ( sumNum, conRowObj ) => sumNum + conRowObj.total, 0 ); // What: Total Count Number. Why: The headline "cycles" card needs the combined evaluated-cycle count across every conditional. How: This sums every conditional's own total field.
		const firCouNum = conStaArr.reduce( ( sumNum, conRowObj ) => sumNum + conRowObj.fired, 0 ); // What: Fired Count Number. Why: The headline "triggered" card needs the combined fired count across every conditional. How: This sums every conditional's own fired field.
		const lasFirStr = conStaArr.reduce( ( maxDatStr, conRowObj ) => ( conRowObj.lastFired && ( !maxDatStr || conRowObj.lastFired > maxDatStr ) ) ? conRowObj.lastFired : maxDatStr, null ); // What: Last Fired String. Why: The headline "last fired" card needs the single most recent fire date across every conditional. How: This reduces to whichever conditional's own lastFired is the latest.


		return { total : totCouNum, fired : firCouNum, rate : totCouNum ? Math.round( ( firCouNum / totCouNum ) * 100 ) : 0, lastFired : lasFirStr }; // What: Conditional Totals Return. Why: The four headline cards each read one field off this combined object. How: This packages the three reduced values plus a derived combined rate percentage.


	}, [ conStaArr ] ); // What: Effect Dependency Array. Why: The combined totals only ever need recomputing when the per-conditional stats array itself changes. How: conStaArr is the sole source every reduce above reads from.

	// Conditionals breakdown list, sorted by the active metric. A null
	// metric value (no rate / no interval / never fired) always sinks to
	// the bottom regardless of sort direction.
	const conBreArr = React.useMemo( () => { // What: Conditional Breakdown Array Memo. Why: The Conditionals breakdown card needs conStaArr resorted by whichever metric pill is currently active. How: This picks a comparable value per conMetStr, then sorts with nulls always sinking to the bottom.


		const conValFun = ( conRowObj ) => conMetStr === 'triggers' ? conRowObj.fired // What: Conditional Value Function. Why: Each metric pill compares a different field, so the sort below needs one function resolving "the active metric's own value" per row. How: This branches on conMetStr, defaulting to the fire-rate field.
			: conMetStr === 'cycles' ? conRowObj.total
			: conMetStr === 'interval' ? conRowObj.aveInterval
			: conMetStr === 'last' ? ( conRowObj.lastFired ? new Date( conRowObj.lastFired ).getTime() : null )
			: conRowObj.rate; // 'rate'

		const sorDirNum = conSorStr === 'desc' ? 1 : -1; // What: Sort Direction Number. Why: The comparator below needs a plain +1/-1 multiplier instead of re-checking the string every comparison. How: This is 1 for descending, -1 for ascending.


		return conStaArr.slice().sort( ( aConObj, bConObj ) => { // What: Sorted Copy Return. Why: The original conStaArr order must stay stable for other consumers, so a copy is sorted instead. How: This compares each pair's own conValFun result, sinking a null value to the bottom regardless of direction.


			const aValNum = conValFun( aConObj ), bValNum = conValFun( bConObj ); // What: Compared Value Pair. Why: Both sides of the comparison need their own resolved metric value up front. How: This calls conValFun once per side.

			if ( aValNum == null && bValNum == null ) return 0;  // What: Both Null Guard. Why: Two equally-missing values have no real order between them. How: This treats them as tied.
			if ( aValNum == null ) return 1;                     // What: Left Null Guard. Why: A missing value always sinks to the bottom regardless of sort direction. How: This orders the left side after the right.
			if ( bValNum == null ) return -1;                    // What: Right Null Guard. Why: Same reasoning as the left-null guard, mirrored. How: This orders the right side after the left.

			return ( bValNum - aValNum ) * sorDirNum; // What: Numeric Comparison Return. Why: Both values are real numbers at this point, so a normal subtraction comparison applies. How: This orders high-to-low by default, flipped to low-to-high by sorDirNum.


		});


	}, [ conStaArr, conMetStr, conSorStr ] ); // What: Effect Dependency Array. Why: The sorted list only ever needs recomputing when the underlying stats, the active metric, or the sort direction changes. How: conStaArr supplies the rows, conMetStr picks the compared field, conSorStr picks the direction.

	// #endregion Conditionals Scope Data



	// #region Group And Type Filters

	// Distinct group names, alphabetical: drives the group selector that
	// narrows the Show row below it (mirrors the Pickers tab; "All" itself
	// is a separate, always-first pill rendered outside this list).
	const exiGroArr = React.useMemo( () => { // What: Existing Group Array Memo. Why: The Group filter row needs the live, deduplicated set of group names actually in use. How: This walks picLisArr once, collecting each non-hidden picker's own group the first time it's seen, then sorts alphabetically.


		const seenGroArr = []; // What: Seen Group Array. Why: A plain array preserves first-seen order for the loop below to check membership against, before the final sort reorders it. How: This starts empty and is pushed to as new group names are found.

		for ( const picObj of picLisArr ) if ( picObj.group && !picObj.hidden && !seenGroArr.includes( picObj.group ) ) seenGroArr.push( picObj.group ); // What: Group Collection Loop. Why: Every non-hidden picker with a group contributes that group name, but only once each. How: This pushes a picker's own group the first time it's encountered.


		return seenGroArr.sort( ( aGroStr, bGroStr ) => aGroStr.localeCompare( bGroStr ) ); // What: Sorted Group Return. Why: The filter row's own pills should list alphabetically, not in whatever order pickers happen to be stored. How: This sorts the collected group names via localeCompare.


	}, [ picLisArr ] ); // What: Effect Dependency Array. Why: The group list only ever needs recomputing when the live picker list itself changes. How: picLisArr is the sole source the loop above reads from.

	// staGroStr only scopes which pickers appear in the Show row below; it
	// never filters the stats themselves. 'all' also lets the All +
	// Reminders options show. A hidden picker (see store.js's own hidden
	// flag) never appears here at all.
	const [ staGroStr, setStaGroStr ] = React.useState( 'all' ); // What: Stat Group String And Setter. Why: This is the single source of truth for the active Group filter pill. How: This is read by visPicArr below and written by the Group filter row's own buttons.

	// Distinct modes actually in use, alphabetical by their own display
	// label: feeds the Type filter row's own picker-mode pills ("All"
	// pinned first, same as Group). Independent of staGroStr, both narrow
	// visPicArr together.
	const exiModArr = React.useMemo( () => { // What: Existing Mode Array Memo. Why: The Type filter row needs the live, deduplicated set of picker modes actually in use, ordered by their own display label. How: This walks picLisArr once collecting non-hidden modes into a Set, then sorts by SED_NAM_OBJ.MOD_DEF_OBJ's own label text.


		const seenModSet = new Set(); // What: Seen Mode Set. Why: A Set naturally deduplicates without a manual membership check, unlike the group loop above which needed first-seen order preserved. How: This starts empty and is added to below.

		for ( const picObj of picLisArr ) if ( !picObj.hidden ) seenModSet.add( picObj.mode ); // What: Mode Collection Loop. Why: Every non-hidden picker contributes its own mode key. How: This adds a picker's own mode to the set.


		return [ ...seenModSet ].sort( ( aModStr, bModStr ) => SED_NAM_OBJ.MOD_DEF_OBJ[ aModStr ].label.localeCompare( SED_NAM_OBJ.MOD_DEF_OBJ[ bModStr ].label ) ); // What: Sorted Mode Return. Why: The Type row's own pills should list by their user-facing label, not their raw internal mode key. How: This spreads the set into an array and sorts by each mode's own SED_NAM_OBJ.MOD_DEF_OBJ label.


	}, [ picLisArr ] ); // What: Effect Dependency Array. Why: The mode list only ever needs recomputing when the live picker list itself changes. How: picLisArr is the sole source the loop above reads from.

	// typFilStr also carries the Conditionals/Reminders sentinel values
	// (moved here from staGroStr): a real picker's mode never matches
	// either, so visPicArr naturally excludes every real picker under
	// both, same as any other empty filter value.
	const [ typFilStr, setTypFilStr ] = React.useState( 'all' ); // What: Type Filter String And Setter. Why: This is the single source of truth for the active Type filter pill, including the Conditionals/Reminders sentinels. How: This is read by visPicArr below and written by the Type filter row's own buttons.

	const visPicArr = React.useMemo( () => ( // What: Visible Picker Array Memo. Why: The Show row below needs the live picker list narrowed by both the Group and Type filters together. How: This filters out hidden pickers, then applies staGroStr and typFilStr as optional equality checks.


		picLisArr.filter( ( picObj ) => !picObj.hidden
			&& ( staGroStr === 'all' || picObj.group === staGroStr )
			&& ( typFilStr === 'all' || picObj.mode === typFilStr ) )


	), [ picLisArr, staGroStr, typFilStr ] ); // What: Effect Dependency Array. Why: The narrowed list only ever needs recomputing when the live picker list or either filter itself changes. How: picLisArr supplies the rows, staGroStr and typFilStr each gate one of the two filter checks above.

	// #endregion Group And Type Filters



	// #region Reminder Availability

	const remOptObj = TASKS.normalizeOpts( state.reminderOpts );                        // What: Reminder Options Object. Why: Which reminder types opt into Stats is a persisted setting that may be missing/partial on an older save. How: This normalizes the raw persisted reminderOpts via TASKS' own helper.
	const enaTypArr = [ 'once', 'recurring' ].filter( ( typStr ) => remOptObj[ typStr ].stats ); // What: Enabled Type Array. Why: Every reminder-scoped query below needs to know exactly which of the two types are opted into Stats. How: This keeps whichever of 'once'/'recurring' has its own stats flag turned on.
	const remEnaBoo = enaTypArr.length > 0;                                              // What: Reminder Enabled Boolean. Why: The whole Reminders scope, and its Type-row pill, should only exist once at least one reminder type opts in. How: This is true when enaTypArr isn't empty.

	// Don't strand the view on a Reminders scope that's just been turned
	// off.
	React.useEffect( () => { // What: Reminder Scope Guard Effect. Why: Turning off every reminder type's own Stats opt-in while the Reminders scope is active would otherwise leave the page showing a now-unreachable scope. How: This falls back to 'all' whenever scoValStr is 'reminders' but remEnaBoo has gone false.


		if ( scoValStr === 'reminders' && !remEnaBoo ) setScoValStr( 'all' );


	}, [ scoValStr, remEnaBoo ] ); // What: Effect Dependency Array. Why: This only ever needs re-checking when the active scope or the reminders-enabled flag changes. How: scoValStr is what's being validated, remEnaBoo is what it's validated against.

	// Same guard for a Conditionals scope once every conditional is gone.
	React.useEffect( () => { // What: Conditional Scope Guard Effect. Why: Deleting every conditional while the Conditionals scope is active would otherwise leave the page showing a now-unreachable scope. How: This falls back to 'all' whenever scoValStr is 'conditionals' but hasConBoo has gone false.


		if ( scoValStr === 'conditionals' && !hasConBoo ) setScoValStr( 'all' );


	}, [ scoValStr, hasConBoo ] ); // What: Effect Dependency Array. Why: This only ever needs re-checking when the active scope or the has-conditionals flag changes. How: scoValStr is what's being validated, hasConBoo is what it's validated against.

	// #endregion Reminder Availability



	// Same alphabetical order the Show row itself renders its pickers in
	// (below), reused so "jump to the first card" always agrees with
	// what's actually shown first, not visPicArr's own storage-array
	// order.
	const sorVisArr = React.useMemo( () => ( // What: Sorted Visible Array Memo. Why: The scope-repair effect below needs to know which picker the Show row would render first. How: This sorts a copy of visPicArr by each picker's own name.


		[ ...visPicArr ].sort( ( aPicObj, bPicObj ) => aPicObj.name.localeCompare( bPicObj.name ) )


	), [ visPicArr ] ); // What: Effect Dependency Array. Why: This only ever needs resorting when the visible picker list itself changes. How: visPicArr is the sole source the sort above reads from.

	// Keep scoValStr coherent with the Group + Type filters: within a
	// specific group and/or type, All/Reminders aren't offered, so if the
	// current scope isn't one of the filtered pickers, fall back to the
	// first one, alphabetically, matching the Show row. Also jumps
	// whenever either filter itself just changed, not only once the OLD
	// scope happens to fall out of view (e.g. switching between two groups
	// that both happen to contain the same picker used to leave the view
	// stranded there instead of jumping to the new filter's own first
	// card).
	const preFilRef = React.useRef( { staGroStr, typFilStr } ); // What: Previous Filter Reference. Why: The repair effect below needs to remember the last-seen filter pair across renders to detect an actual change. How: This starts at the current filter pair and is updated by the effect below on every run.

	React.useEffect( () => { // What: Scope Repair Effect. Why: A stale or now-unreachable scope must be corrected to the new filter's own first alphabetical picker. How: This detects a filter change or an out-of-view scope and reassigns scoValStr accordingly.


		const filChaBoo = preFilRef.current.staGroStr !== staGroStr || preFilRef.current.typFilStr !== typFilStr; // What: Filters Changed Boolean. Why: The repair below must run both on a filter change and on a stale scope, not only the latter. How: This compares the previous filter pair against the current one.

		preFilRef.current = { staGroStr, typFilStr }; // What: Previous Filter Update. Why: The next run of this effect needs to compare against the filter pair that's current now. How: This overwrites preFilRef with the freshly-observed pair.

		// 'conditionals'/'reminders' are the Type row's own sentinel
		// values (their pill sets scope directly), not a real picker mode
		// to auto-pick a first card from, since visPicArr is empty for both, so
		// falling through below would immediately reset scoValStr back to
		// 'all' right after it's set.
		if ( typFilStr === 'conditionals' || typFilStr === 'reminders' ) return; // What: Sentinel Type Guard. Why: Neither sentinel value has any "visible pickers" to fall back to. How: This bails out of the repair entirely while either sentinel is active.

		if ( filChaBoo || !visPicArr.some( ( picObj ) => picObj.id === scoValStr ) ) setScoValStr( sorVisArr[ 0 ] ? sorVisArr[ 0 ].id : 'all' ); // What: Scope Reassignment. Why: A changed filter or a scope that fell out of view both need the same fallback behavior. How: This jumps to the first sorted visible picker, or 'all' when there isn't one.


	}, [ staGroStr, typFilStr, visPicArr, sorVisArr, scoValStr ] ); // What: Effect Dependency Array. Why: This must re-run whenever either filter, the resulting visible/sorted lists, or the scope itself changes. How: staGroStr/typFilStr detect a filter change, visPicArr/sorVisArr supply the fallback target, scoValStr is what's being validated.

	const isaRemBoo = scoValStr === 'reminders'; // What: Is-A Reminder Boolean. Why: Many blocks below need a quick check for whether the Reminders scope is the active one. How: This compares scoValStr against the 'reminders' sentinel value.



	// #region Filter Row Scroll Fades

	// Scroll-edge fades on the filter pill rows, the same affordance as the
	// Pickers tab strip: a mask gradient that only fades the side with
	// more content.
	const scpRowRef = React.useRef( null ); // What: Scope Row Reference. Why: The Show row's own scroll-fade effect below needs a handle on its DOM node. How: This is attached to the Show row's own ref prop and read inside the effect.
	const groRowRef = React.useRef( null ); // What: Group Row Reference. Why: The Group row's own scroll-fade effect below needs a handle on its DOM node. How: This is attached to the Group row's own ref prop and read inside the effect.
	const typRowRef = React.useRef( null ); // What: Type Row Reference. Why: The Type row's own scroll-fade effect below needs a handle on its DOM node. How: This is attached to the Type row's own ref prop and read inside the effect.
	const ranRowRef = React.useRef( null ); // What: Range Row Reference. Why: The Range row's own scroll-fade effect below needs a handle on its DOM node. How: This is attached to the Range row's own ref prop and read inside the effect.
	const metRowRef = React.useRef( null ); // What: Metric Row Reference. Why: The Pick breakdown metric row's own scroll-fade effect below needs a handle on its DOM node. How: This is attached to that row's own ref prop and read inside the effect.
	const remRowRef = React.useRef( null ); // What: Reminder Row Reference. Why: The Reminders breakdown metric row's own scroll-fade effect below needs a handle on its DOM node. How: This is attached to that row's own ref prop and read inside the effect.
	const conRowRef = React.useRef( null ); // What: Conditional Row Reference. Why: The Conditionals breakdown metric row's own scroll-fade effect below needs a handle on its DOM node. How: This is attached to that row's own ref prop and read inside the effect.

	React.useEffect( () => { // What: Scroll Fade Effect. Why: Every filter/metric pill row needs the same "fade the scrollable edge" affordance, without duplicating the logic once per row. How: This attaches one scroll/resize-driven class toggler to each currently-mounted ref, then tears every one of them down on cleanup.


		const rowEleArr = [ scpRowRef.current, groRowRef.current, typRowRef.current, ranRowRef.current, metRowRef.current, remRowRef.current, conRowRef.current ].filter( Boolean ); // What: Row Element Array. Why: Not every row is mounted at once (e.g. the Group row only exists with 2+ groups), so only the currently-real DOM nodes should get a listener. How: This collects every ref's own current value, dropping any that are still null.

		const cleFunArr = rowEleArr.map( ( rowEleEle ) => { // What: Cleanup Function Array. Why: Each row needs its own scroll listener and ResizeObserver, and each needs its own matching teardown. How: This maps every row element to a function that removes that specific row's own listener and observer.


			const updFadFun = () => { // What: Update Fade Function. Why: Both the initial state and every future scroll/resize need the same at-start/at-end recalculation. How: This measures whether the row can scroll at all, then toggles the at-start/at-end classes based on the current scroll position.


				const canScrBoo = rowEleEle.scrollWidth - rowEleEle.clientWidth > 1; // What: Can Scroll Boolean. Why: A row that already shows its full content has nothing to fade on either edge. How: This checks whether the row's own scrollable width meaningfully exceeds its visible width.
				const atStaBoo  = !canScrBoo || rowEleEle.scrollLeft <= 1;          // What: At Start Boolean. Why: The left/leading fade should hide once the row is scrolled to (or can't scroll away from) its start. How: This is true when the row can't scroll at all, or its scroll position is at or near zero.
				const atEndBoo  = !canScrBoo || rowEleEle.scrollLeft + rowEleEle.clientWidth >= rowEleEle.scrollWidth - 1; // What: At End Boolean. Why: The right/trailing fade should hide once the row is scrolled to (or can't scroll away from) its end. How: This is true when the row can't scroll at all, or its visible window reaches the row's own full scrollable width.

				rowEleEle.classList.toggle( 'at-start', atStaBoo ); // What: At Start Toggle. Why: CSS reads this class to hide the leading fade gradient. How: This adds or removes 'at-start' based on atStaBoo.
				rowEleEle.classList.toggle( 'at-end', atEndBoo );   // What: At End Toggle. Why: CSS reads this class to hide the trailing fade gradient. How: This adds or removes 'at-end' based on atEndBoo.


			};

			updFadFun(); // What: Initial Fade Update Call. Why: The row's own fade state must be correct immediately on mount, not only after the first scroll/resize. How: This invokes updFadFun once, synchronously.

			rowEleEle.addEventListener( 'scroll', updFadFun, { passive : true } ); // What: Scroll Listener Attach. Why: The fade must track the row's own live scroll position as the user drags it. How: This re-runs updFadFun on every scroll event, passively for smoother scrolling.

			const rowObsObj = new ResizeObserver( updFadFun ); // What: Row Observer Object. Why: A row's own scrollability can change purely from a resize (e.g. rotating the device), without any scroll event firing. How: This re-runs updFadFun whenever the row's own size changes.

			rowObsObj.observe( rowEleEle ); // What: Row Observer Start. Why: The observer created above does nothing until it's told which element to watch. How: This begins watching rowEleEle for size changes.


			return () => { rowEleEle.removeEventListener( 'scroll', updFadFun ); rowObsObj.disconnect(); }; // What: Row Cleanup Return. Why: Both the listener and the observer must not outlive this effect run. How: This removes the scroll listener and disconnects the observer together.


		});


		return () => cleFunArr.forEach( ( cleFun ) => cleFun() ); // What: Effect Cleanup Return. Why: Every row's own cleanup function built above must actually run on unmount or re-run. How: This invokes each one in turn.


	}, [ picLisArr.length, remEnaBoo, scoValStr, ranValStr, metKeyStr, remMetStr, conMetStr, isaConBoo, isaRemBoo, staGroStr, typFilStr, exiModArr.length, visPicArr.length ] ); // What: Effect Dependency Array. Why: Any change that can mount, unmount, resize, or reflow one of these rows needs this to re-attach its listeners against the current DOM nodes. How: Each dependency corresponds to a value that can change which rows exist or how wide their content is.

	// #endregion Filter Row Scroll Fades



	// #region Pick And Reminder Rows

	// Pick rows for the active scope ('all' or a single picker). Active
	// picks only: rejected (re-rolled-away) and skipped rows are excluded
	// here so they never touch completion, totals, rankings, or the
	// heatmap.
	const picRowArr = React.useMemo( () => { // What: Pick Row Array Memo. Why: Nearly every pick-shaped card below shares this one range/scope/hidden-filtered view of the log. How: This keeps only active (no outcome) rows matching the current scope, hidden-picker exclusion, and range cutoff.


		if ( isaRemBoo ) return []; // What: Reminders Scope Guard. Why: The Reminders scope has no pick rows of its own to derive. How: This returns an empty array whenever the Reminders scope is active.

		return picLogArr.filter( ( rowObj ) =>
			!rowObj.outcome &&
			!hidPicSet.has( rowObj.pickerId ) &&
			( scoValStr === 'all' || rowObj.pickerId === scoValStr ) &&
			( !cutIsoStr || rowObj.date >= cutIsoStr ) );


	}, [ picLogArr, scoValStr, cutIsoStr, isaRemBoo, hidPicSet ] ); // What: Effect Dependency Array. Why: This filtered view only ever needs recomputing when the raw log, the active scope, the range cutoff, the Reminders-scope flag, or the hidden-picker set changes. How: Each dependency corresponds to one of the four filter conditions above (or the log itself).

	// Per-item count of re-rolled-away (rejected) rows, range + scope
	// aware.
	const rejCouMap = React.useMemo( () => { // What: Rejected Count Map Memo. Why: The Pick breakdown's own "Re-Rolled Away" metric needs a per-item rejection count under the same scope/range rules as picRowArr. How: This walks the raw log once, counting only 'rejected'-outcome rows matching the active filters.


		const outMapObj = new Map(); // What: Out Map Object. Why: The counts need a fresh accumulator to build up as the loop below runs. How: This starts empty and is filled by the loop.

		if ( isaRemBoo ) return outMapObj; // What: Reminders Scope Guard. Why: The Reminders scope has no rejected pick rows to count. How: This returns the still-empty map whenever the Reminders scope is active.

		for ( const rowObj of picLogArr ) { // What: Rejection Count Loop. Why: Every logged row must be checked against the same outcome/hidden/scope/range rules picRowArr itself uses. How: This skips any row that doesn't match, then increments that item's own running count.


			if ( rowObj.outcome !== 'rejected' ) continue;               // What: Outcome Guard. Why: Only a re-rolled-away row counts toward this metric. How: This skips any row whose own outcome isn't 'rejected'.
			if ( hidPicSet.has( rowObj.pickerId ) ) continue;            // What: Hidden Picker Guard. Why: A hidden picker's own history must not surface in this count. How: This skips any row belonging to a hidden picker.
			if ( scoValStr !== 'all' && rowObj.pickerId !== scoValStr ) continue; // What: Scope Guard. Why: A single-picker scope must only count that picker's own rows. How: This skips any row from a different picker while scoValStr isn't 'all'.
			if ( cutIsoStr && rowObj.date < cutIsoStr ) continue;        // What: Range Guard. Why: Only rows inside the active range should count. How: This skips any row dated before cutIsoStr.

			outMapObj.set( rowObj.itemId, ( outMapObj.get( rowObj.itemId ) || 0 ) + 1 ); // What: Count Increment. Why: This is the actual per-item tally the metric reads. How: This increments the row's own itemId entry, defaulting a first-seen item to zero.


		}

		return outMapObj; // What: Rejected Count Return. Why: This is the finished per-item map the breakdown's Re-Rolled Away column reads. How: This returns the map built above.


	}, [ picLogArr, scoValStr, cutIsoStr, isaRemBoo, hidPicSet ] ); // What: Effect Dependency Array. Why: This map only ever needs rebuilding when the same inputs picRowArr itself depends on change. How: Each dependency gates one of the same four filter conditions.

	// Per-item count of skipped rows, range + scope aware.
	const skiCouMap = React.useMemo( () => { // What: Skipped Count Map Memo. Why: The Pick breakdown's own "Skipped" metric needs a per-item skip count under the same scope/range rules as picRowArr. How: This walks the raw log once, counting only 'skipped'-outcome rows matching the active filters.


		const outMapObj = new Map(); // What: Out Map Object. Why: The counts need a fresh accumulator to build up as the loop below runs. How: This starts empty and is filled by the loop.

		if ( isaRemBoo ) return outMapObj; // What: Reminders Scope Guard. Why: The Reminders scope has no skipped pick rows to count. How: This returns the still-empty map whenever the Reminders scope is active.

		for ( const rowObj of picLogArr ) { // What: Skip Count Loop. Why: Every logged row must be checked against the same outcome/hidden/scope/range rules picRowArr itself uses. How: This skips any row that doesn't match, then increments that item's own running count.


			if ( rowObj.outcome !== 'skipped' ) continue;                // What: Outcome Guard. Why: Only a skipped row counts toward this metric. How: This skips any row whose own outcome isn't 'skipped'.
			if ( hidPicSet.has( rowObj.pickerId ) ) continue;            // What: Hidden Picker Guard. Why: A hidden picker's own history must not surface in this count. How: This skips any row belonging to a hidden picker.
			if ( scoValStr !== 'all' && rowObj.pickerId !== scoValStr ) continue; // What: Scope Guard. Why: A single-picker scope must only count that picker's own rows. How: This skips any row from a different picker while scoValStr isn't 'all'.
			if ( cutIsoStr && rowObj.date < cutIsoStr ) continue;        // What: Range Guard. Why: Only rows inside the active range should count. How: This skips any row dated before cutIsoStr.

			outMapObj.set( rowObj.itemId, ( outMapObj.get( rowObj.itemId ) || 0 ) + 1 ); // What: Count Increment. Why: This is the actual per-item tally the metric reads. How: This increments the row's own itemId entry, defaulting a first-seen item to zero.


		}

		return outMapObj; // What: Skipped Count Return. Why: This is the finished per-item map the breakdown's Skipped column reads. How: This returns the map built above.


	}, [ picLogArr, scoValStr, cutIsoStr, isaRemBoo, hidPicSet ] ); // What: Effect Dependency Array. Why: This map only ever needs rebuilding when the same inputs picRowArr itself depends on change. How: Each dependency gates one of the same four filter conditions.

	// Reminder rows for the active range.
	const remRowArr = React.useMemo( () => ( // What: Reminder Row Array Memo. Why: Every reminder-shaped card below shares this one type/hidden/range-filtered view of the reminder completion log. How: This keeps only rows whose own type opts into Stats, whose own task isn't hidden, and whose own completion date is inside the active range.


		( state.reminderLog || [] )
			.filter( ( rowObj ) => enaTypArr.includes( rowObj.type ) )
			.filter( ( rowObj ) => !hidTasSet.has( rowObj.taskId ) )
			.filter( ( rowObj ) => !cutIsoStr || dayIsoFun( new Date( rowObj.completedAt ) ) >= cutIsoStr )


	), [ state.reminderLog, enaTypArr.join( ',' ), cutIsoStr, hidTasSet ] ); // What: Effect Dependency Array. Why: This filtered view only ever needs recomputing when the raw log, the enabled-types set, the range cutoff, or the hidden-task set changes. How: enaTypArr is joined to a stable string since a fresh array identity would otherwise re-trigger this every render.

	// Per-day aggregation. Picks become { done, total, items: [{name,done}] };
	// reminders become { done: count, total: count, items: [names] }.
	const dayAggMap = React.useMemo( () => { // What: Day Aggregate Map Memo. Why: The heatmap, streak, and full-days count all need one shared per-day rollup, built once instead of separately per card. How: This walks either remRowArr or picRowArr (whichever scope is active) into a Map keyed by calendar day.


		const outMapObj = new Map(); // What: Out Map Object. Why: The per-day rollup needs a fresh accumulator to build up as the loop below runs. How: This starts empty and is filled by whichever branch below runs.

		if ( isaRemBoo ) { // What: Reminders Aggregation Branch. Why: A reminder completion has no "possible total" the way a pick day does, so its own day entry counts done and total identically. How: This walks remRowArr, incrementing both done and total for every completion on its own day.


			for ( const rowObj of remRowArr ) { // What: Reminder Row Aggregation Loop. Why: Every completion needs folding into its own calendar day's entry. How: This looks up (or lazily creates) that day's entry, then increments it and appends the completed reminder's own name.


				const dayKeyStr = dayIsoFun( new Date( rowObj.completedAt ) ); // What: Day Key String. Why: The Map needs a plain calendar-day string to key each entry by. How: This converts the row's own completedAt timestamp via dayIsoFun.
				const dayEntObj = outMapObj.get( dayKeyStr ) || { done : 0, total : 0, items : [] }; // What: Day Entry Object. Why: A day's own entry might already exist from an earlier completion the same day. How: This looks it up, or starts a fresh zeroed entry.

				dayEntObj.done++; dayEntObj.total++; dayEntObj.items.push( { name : rowObj.name || 'Reminder', done : true } ); outMapObj.set( dayKeyStr, dayEntObj ); // What: Day Entry Update. Why: Both counters and the item list need updating together for this one completion. How: This increments done/total and appends the completed reminder's own denormalized name.


			}


		}

		else { // What: Pick Aggregation Branch. Why: A pick day has a real "possible total" (every row logged that day, done or not), unlike a reminder completion. How: This walks picRowArr, incrementing total for every row and done only for a completed one.


			for ( const rowObj of picRowArr ) { // What: Pick Row Aggregation Loop. Why: Every logged pick needs folding into its own calendar day's entry. How: This looks up (or lazily creates) that day's entry, then increments it and appends the item's own name/done state.


				const dayEntObj = outMapObj.get( rowObj.date ) || { done : 0, total : 0, items : [] }; // What: Day Entry Object. Why: A day's own entry might already exist from an earlier pick the same day. How: This looks it up, or starts a fresh zeroed entry.

				dayEntObj.total++; if ( rowObj.done ) dayEntObj.done++; // What: Day Entry Counters Update. Why: Every row counts toward the day's total, but only a completed one counts toward done. How: This always increments total, and increments done only when rowObj.done is truthy.

				dayEntObj.items.push( { name : rowObj.itemName, done : !!rowObj.done } ); // What: Day Entry Item Push. Why: The heatmap's own tap-to-see-detail list needs every item's own name and done state. How: This appends one entry per logged row.

				outMapObj.set( rowObj.date, dayEntObj ); // What: Day Entry Store. Why: The freshly-updated entry must be written back, since it may have just been created above. How: This sets the entry back under its own date key.


			}


		}

		return outMapObj; // What: Day Aggregate Return. Why: This is the finished per-day rollup every heatmap/streak/full-days computation below reads from. How: This returns the map built by whichever branch ran above.


	}, [ picRowArr, remRowArr, isaRemBoo ] ); // What: Effect Dependency Array. Why: The rollup only ever needs rebuilding when the underlying pick rows, reminder rows, or which scope is active changes. How: picRowArr/remRowArr each feed one branch, isaRemBoo picks which branch runs.

	// #endregion Pick And Reminder Rows



	// #region Headline Numbers

	const totDonNum = isaRemBoo ? remRowArr.length : picRowArr.reduce( ( sumNum, rowObj ) => sumNum + ( rowObj.done ? 1 : 0 ), 0 ); // What: Total Done Number. Why: The headline "completed"/"items done" card needs one combined done count regardless of which scope is active. How: A Reminders scope counts every completion row directly; a pick scope sums each row's own done flag.
	const totPosNum = picRowArr.length;                                                                                            // What: Total Possible Number. Why: The completion-rate card needs the total number of pick opportunities logged, not just the done ones. How: This is simply picRowArr's own length.
	const comRatNum = Math.round( ( totDonNum / Math.max( 1, totPosNum ) ) * 100 );                                                // What: Completion Rate Number. Why: The headline "completion" card needs a percentage, not a raw count. How: This divides totDonNum by totPosNum, floored at 1 to avoid a divide-by-zero on an empty range.
	const actDayNum = dayAggMap.size;                                                                                              // What: Active Day Number. Why: Both the "full days" card's own denominator and the heatmap's empty-state check need the count of days with any activity at all. How: This is simply dayAggMap's own size.
	const fulDayNum = [ ...dayAggMap.values() ].filter( ( dayEntObj ) => dayEntObj.total > 0 && dayEntObj.done === dayEntObj.total ).length; // What: Full Day Number. Why: The headline "full days" card counts only days where every logged pick that day was actually completed. How: This filters dayAggMap's own values down to days whose done count equals their total.
	const weeAgoNum = Date.now() - 7 * 86400000;                                                                                   // What: Week Ago Number. Why: The "this week" reminder count needs a rolling 7-day cutoff timestamp to compare against. How: This subtracts 7 days' worth of milliseconds from the current time.
	const remWeeNum = remRowArr.filter( ( rowObj ) => new Date( rowObj.completedAt ).getTime() >= weeAgoNum ).length;             // What: Reminder Week Number. Why: The Reminders headline/summary cards both show a rolling "this week" count. How: This counts every reminder row whose own completedAt falls on or after weeAgoNum.
	const busDayNum = [ ...dayAggMap.values() ].reduce( ( maxNum, dayEntObj ) => Math.max( maxNum, dayEntObj.done ), 0 );          // What: Busiest Day Number. Why: The Reminders headline card's "busiest day" needs the single highest per-day done count. How: This reduces dayAggMap's own values to the largest done field seen.

	// Streak: consecutive days (ending today) with at least one done. An
	// empty today doesn't break it (the day isn't over yet); a day with
	// activity but nothing done does.
	const strCouNum = React.useMemo( () => { // What: Streak Count Number Memo. Why: The headline "day streak" card needs a walked-backward consecutive-day count, not a simple aggregate. How: This walks dayAggMap backward from today (or yesterday, if today has no entry yet), stopping at the first day with no done activity.


		let stkCouNum = 0; // What: Streak Count Accumulator. Why: The walk below needs a running tally to increment as each qualifying day is found. How: This starts at zero and is incremented once per qualifying day.

		const walDatObj = new Date( todDatObj ); // What: Walk Date Object. Why: The backward walk needs its own mutable date cursor, separate from todDatObj itself. How: This clones todDatObj as the starting point.

		if ( !dayAggMap.get( todIsoStr ) ) walDatObj.setDate( walDatObj.getDate() - 1 ); // What: Empty Today Guard. Why: A today with no logged activity yet shouldn't break an otherwise-continuing streak, since the day isn't over. How: This steps the walk back one day when today has no entry at all.

		for ( ;; ) { // What: Backward Walk Loop. Why: The streak must keep extending for as long as each earlier day also has done activity. How: This checks the walk cursor's own day, incrementing and stepping back while it qualifies, breaking on the first day that doesn't.


			const dayEntObj = dayAggMap.get( dayIsoFun( walDatObj ) ); // What: Day Entry Lookup. Why: The current walk cursor's own day needs to be checked against the aggregate map. How: This looks up the cursor's own ISO day in dayAggMap.

			if ( dayEntObj && dayEntObj.done > 0 ) { // What: Qualify Branch. Why: A day with at least one done item extends the streak and the walk keeps going. How: This increments stkCouNum and steps the cursor back one more day.


				stkCouNum++; // What: Streak Increment. Why: A qualifying day counts toward the running streak. How: This increments stkCouNum by one.

				walDatObj.setDate( walDatObj.getDate() - 1 ); // What: Cursor Step Back. Why: The walk must keep checking earlier days while the streak holds. How: This steps walDatObj back one calendar day.


			}

			else break; // What: Stop Branch. Why: A day with no done items (or missing entirely) ends the streak right there. How: This breaks out of the backward walk loop.


		}

		return stkCouNum; // What: Streak Count Return. Why: This is the finished consecutive-day count the headline card reads. How: This returns the accumulator built by the walk above.


	}, [ dayAggMap, todDatObj, todIsoStr ] ); // What: Effect Dependency Array. Why: The streak only ever needs rewalking when the day aggregate, today's own date, or today's own ISO string changes. How: dayAggMap supplies the per-day data, todDatObj/todIsoStr anchor where the backward walk starts.

	// #endregion Headline Numbers



	// #region Heatmap Grid

	// Flat chronological run of fixed-size day cells, wrapping to as many
	// rows as the range needs (taller, never wider). For "All time"
	// spanning more than one calendar year, a year pager clamps the grid
	// to one year at a time.
	const datYeaArr = React.useMemo( () => { // What: Data Year Array Memo. Why: The year pager needs the full list of calendar years that actually have any logged activity. How: This derives the earliest year with data and every year up through the current one.


		const dayKeyArr = [ ...dayAggMap.keys() ]; // What: Day Key Array. Why: The earliest year present needs to be found from the actual logged days, not assumed. How: This spreads dayAggMap's own keys into a plain array.

		if ( !dayKeyArr.length ) return [ todDatObj.getFullYear() ]; // What: No Data Guard. Why: With nothing logged yet, the grid still needs exactly the current year to render against. How: This returns a single-entry array holding today's own year.

		const minYeaNum = +dayKeyArr.reduce( ( eariKeyStr, dayKeyStr ) => ( dayKeyStr < eariKeyStr ? dayKeyStr : eariKeyStr ), dayKeyArr[ 0 ] ).slice( 0, 4 ); // What: Minimum Year Number. Why: The year list must start from the earliest logged day, not an arbitrary default. How: This reduces to the lexicographically earliest day key, then reads its own leading 4-digit year.
		const maxYeaNum = todDatObj.getFullYear(); // What: Maximum Year Number. Why: The year list must always reach through the current year, even with no activity logged yet this year. How: This reads today's own year.

		const outYeaArr = []; // What: Out Year Array. Why: The final list needs building up one year at a time between the bounds computed above. How: This starts empty and is filled by the loop below.

		for ( let yeaNum = minYeaNum; yeaNum <= maxYeaNum; yeaNum++ ) outYeaArr.push( yeaNum ); // What: Year Range Loop. Why: Every year between the earliest logged year and the current one belongs in the pager, even a year with no activity of its own. How: This pushes every year in that inclusive range.


		return outYeaArr; // What: Data Year Return. Why: This is the finished year list the pager below reads its own bounds from. How: This returns the array built above.


	}, [ dayAggMap, todDatObj ] ); // What: Effect Dependency Array. Why: The year list only ever needs recomputing when the day aggregate or today's own date changes. How: dayAggMap supplies the earliest logged day, todDatObj supplies the current year ceiling.

	const yeaPagBoo = ranValStr === 'all' && datYeaArr.length > 1; // What: Year Paging Boolean. Why: The year-pager arrows should only render when "All time" is active and actually spans more than one calendar year. How: This checks both conditions together.

	// Clamp the (possibly stale) selected year to what's available;
	// default to the latest.
	const actYeaNum = yeaPagBoo // What: Active Year Number. Why: The heatmap's own bounds below need one concrete active year whenever paging is in effect. How: This uses heaYeaNum if it's still a valid year, otherwise falls back to the latest one, or null when paging isn't active at all.
		? ( datYeaArr.includes( heaYeaNum ) ? heaYeaNum : datYeaArr[ datYeaArr.length - 1 ] )
		: null;

	const heaDayArr = React.useMemo( () => { // What: Heat Day Array Memo. Why: The heatmap grid needs one cell per calendar day across its own bounded window, not just the days that happen to have logged activity. How: This computes a start/end day (clamped to actYeaNum when paging), then fills every day in between from dayAggMap.


		let staIsoStr = cutIsoStr; // What: Start Iso String. Why: The grid's own first day defaults to the active range's own cutoff. How: This starts from cutIsoStr and may be overridden below for an "All time" view with no cutoff at all.

		if ( !staIsoStr ) { // What: No Cutoff Guard. Why: "All time" has no cutIsoStr to start from, so the earliest logged day must be found instead. How: This falls back to the earliest key in dayAggMap, or today when nothing has been logged at all.


			const dayKeyArr = [ ...dayAggMap.keys() ]; // What: Day Key Array. Why: The earliest logged day needs to be found from the actual keys present. How: This spreads dayAggMap's own keys into a plain array.

			staIsoStr = dayKeyArr.length ? dayKeyArr.reduce( ( eariKeyStr, dayKeyStr ) => ( dayKeyStr < eariKeyStr ? dayKeyStr : eariKeyStr ), dayKeyArr[ 0 ] ) : todIsoStr; // What: Start Iso Fallback. Why: A truly empty history still needs some concrete starting day for the loop below. How: This reduces to the earliest key, or falls back to todIsoStr when there are none at all.


		}

		let endIsoStr = todIsoStr; // What: End Iso String. Why: The grid's own last day defaults to today. How: This may be overridden below when a specific year is being paged.

		if ( actYeaNum != null ) { // What: Year Clamp Guard. Why: A paged single-year view must not show days outside that year at all. How: This clamps both staIsoStr and endIsoStr to the active year's own January 1 and December 31.


			const yeaStaStr = `${ actYeaNum }-01-01`; // What: Year Start String. Why: The clamp below needs the active year's own first day as a comparable ISO string. How: This builds a plain 'YYYY-01-01' string from actYeaNum.
			const yeaEndStr = `${ actYeaNum }-12-31`; // What: Year End String. Why: The clamp below needs the active year's own last day as a comparable ISO string. How: This builds a plain 'YYYY-12-31' string from actYeaNum.

			if ( staIsoStr < yeaStaStr ) staIsoStr = yeaStaStr; // What: Start Clamp Up. Why: A start day from an earlier year (or no cutoff at all) must not bleed into this year's own grid. How: This raises staIsoStr up to the year's own January 1 when it would otherwise start earlier.

			endIsoStr = yeaEndStr < todIsoStr ? yeaEndStr : todIsoStr; // What: End Clamp. Why: A past year's grid should show its own full December 31, but the current year must still cap at today. How: This takes whichever of the year's own December 31 or today is earlier.


		}

		const staDatObj = new Date( staIsoStr + 'T00:00:00' ); // What: Start Date Object. Why: The fill loop below needs a real Date to step forward one day at a time from. How: This parses staIsoStr at local midnight.

		const outDayArr = []; // What: Out Day Array. Why: The finished grid needs building up one day at a time between the bounds computed above. How: This starts empty and is filled by the loop below.


		for ( let curDatObj = new Date( staDatObj ); dayIsoFun( curDatObj ) <= endIsoStr; curDatObj.setDate( curDatObj.getDate() + 1 ) ) { // What: Day Fill Loop. Why: Every day in the window needs its own cell, whether or not anything was logged that day. How: This steps a cloned cursor forward one day at a time, stopping once it passes endIsoStr.


			const dayKeyStr = dayIsoFun( curDatObj ); // What: Day Key String. Why: Both the aggregate lookup and the cell's own date field need this day's own ISO string. How: This converts the current loop cursor via dayIsoFun.

			outDayArr.push( { date : dayKeyStr, ...( dayAggMap.get( dayKeyStr ) || { done : 0, total : 0, items : [] } ) } ); // What: Day Cell Push. Why: Every cell needs its own date plus whatever aggregate data exists for it, or a zeroed placeholder when nothing was logged. How: This spreads either the real aggregate entry or a zeroed default onto the date field.


		}

		return outDayArr; // What: Heat Day Return. Why: This is the finished, gap-free day list the heatmap grid renders one cell per. How: This returns the array built by the fill loop above.


	}, [ dayAggMap, cutIsoStr, todIsoStr, actYeaNum ] ); // What: Effect Dependency Array. Why: The grid only ever needs rebuilding when the day aggregate, the range cutoff, today's own date, or the active paged year changes. How: Each dependency feeds one part of the start/end window computed above.

	// #endregion Heatmap Grid



	// #region Rankings

	const picCouMap = React.useMemo( () => { // What: Pick Count Map Memo. Why: The Most Picked/Coldest rankings and the single-picker breakdown all need one shared per-item pick count, joined with its own source split. How: This walks picRowArr once, accumulating a count plus a per-source tally per itemId.


		const outMapObj = new Map(); // What: Out Map Object. Why: The per-item counts need a fresh accumulator to build up as the loop below runs. How: This starts empty and is filled by the loop.

		for ( const rowObj of picRowArr ) { // What: Pick Count Loop. Why: Every logged pick contributes one to its own item's total, and one to whichever source produced it. How: This looks up (or lazily creates) the item's own accumulator, then increments it.


			const iteEntObj = outMapObj.get( rowObj.itemId ) || { name : rowObj.itemName, n : 0, auto : 0, manual : 0, reroll : 0 }; // What: Item Entry Object. Why: An item's own accumulator might already exist from an earlier pick. How: This looks it up, or starts a fresh zeroed entry using the row's own denormalized name.

			iteEntObj.n++; iteEntObj.name = rowObj.itemName; // What: Item Total And Name Update. Why: Every pick increments the total, and the name is re-assigned each time in case it changed between log entries. How: This increments n and overwrites name from the current row.

			if ( iteEntObj[ rowObj.source ] !== undefined ) iteEntObj[ rowObj.source ]++; // What: Source Tally Update. Why: The Auto/Hand Picked/Re-Rolled breakdown needs a per-source count alongside the plain total. How: This increments whichever of auto/manual/reroll matches the row's own source field.

			outMapObj.set( rowObj.itemId, iteEntObj ); // What: Item Entry Store. Why: The freshly-updated entry must be written back, since it may have just been created above. How: This sets the entry back under its own itemId key.


		}

		return outMapObj; // What: Pick Count Return. Why: This is the finished per-item map both rankings and the breakdown card read from. How: This returns the map built above.


	}, [ picRowArr ] ); // What: Effect Dependency Array. Why: This map only ever needs rebuilding when the underlying pick rows themselves change. How: picRowArr is the sole source the loop above reads from.

	const topPicArr = React.useMemo( () => ( // What: Top Pick Array Memo. Why: The "Most picked" card needs the 5 highest-count items, in descending order. How: This filters out zero-count entries, sorts descending by count, and takes the first 5.


		[ ...picCouMap.values() ].filter( ( iteEntObj ) => iteEntObj.n > 0 ).sort( ( aIteObj, bIteObj ) => bIteObj.n - aIteObj.n ).slice( 0, 5 )


	), [ picCouMap ] ); // What: Effect Dependency Array. Why: This top-5 list only ever needs resorting when the underlying count map changes. How: picCouMap is the sole source the filter/sort above reads from.

	const colIteArr = React.useMemo( () => { // What: Cold Item Array Memo. Why: The "Coldest items" card needs the 5 lowest-count LIVE items (not deleted ones), including ones never picked at all. How: This starts from state.items rather than picCouMap, so a zero-pick item still appears.


		const livIteArr = ( state.items || [] ).filter( ( iteObj ) => // What: Live Item Array. Why: Only an item that's actually live, in scope, and not on vacation belongs in this ranking. How: This filters state.items by hidden-picker exclusion, scope, and its own vacation flag.
			!hidPicSet.has( iteObj.pickerId ) && ( scoValStr === 'all' || iteObj.pickerId === scoValStr ) && !iteObj.vacation );

		return livIteArr
			.map( ( iteObj ) => ( { name : iteObj.name, n : ( picCouMap.get( iteObj.id ) || {} ).n || 0 } ) ) // What: Cold Item Mapping. Why: Each live item needs just its own name and its (possibly zero) pick count for this ranking. How: This looks up iteObj's own id in picCouMap, defaulting to a zero count.
			.sort( ( aIteObj, bIteObj ) => aIteObj.n - bIteObj.n || aIteObj.name.localeCompare( bIteObj.name ) ) // What: Cold Sort. Why: The coldest (least-picked) items should list first, tied items breaking alphabetically for a stable order. How: This sorts ascending by count, falling back to a name comparison.
			.slice( 0, 5 ); // What: Cold Slice. Why: Only the 5 coldest items are shown. How: This takes the first 5 entries of the sorted array.


	}, [ state.items, scoValStr, picCouMap, hidPicSet ] ); // What: Effect Dependency Array. Why: This ranking only ever needs recomputing when the live item list, the active scope, the pick counts, or the hidden-picker set changes. How: Each dependency feeds one part of the filter/map/sort above.

	// #endregion Rankings



	// #region Single-Picker Breakdown Setup

	// Single-picker breakdown: EVERY item in the picker (including
	// zero-pick and inactive ones), with all per-item metrics on one
	// object. The Pick breakdown card pivots on metKeyStr to choose which
	// value to show and sort by.
	const isaPicBoo = scoValStr !== 'all' && !isaRemBoo && !isaConBoo;                                // What: Is-A Picker Boolean. Why: Several blocks below only make sense while a single real picker is the active scope. How: This is true when scoValStr isn't 'all' and neither the Reminders nor Conditionals sentinel is active.
	const scpPicObj = picLisArr.find( ( picObj ) => picObj.id === scoValStr );                        // What: Scope Picker Object. Why: The single-picker header and every mode-dependent branch below need the actual picker object, not just its id. How: This looks scoValStr up in picLisArr.
	const easDowBoo = isaPicBoo && scpPicObj && scpPicObj.mode === 'ease-down';                        // What: Ease Down Boolean. Why: An ease-down picker swaps the Frequency metric for Spent and measures things differently below. How: This checks the scoped picker's own mode.
	const easUpwBoo = isaPicBoo && scpPicObj && scpPicObj.mode === 'ease-up';                          // What: Ease Upward Boolean. Why: An ease-up picker's own items show a range suffix the same way an ease-down picker's do. How: This checks the scoped picker's own mode.
	const useWeiBoo = isaPicBoo && scpPicObj && ( scpPicObj.mode === 'weighted' || scpPicObj.mode === 'dynamic' ); // What: Uses Weight Boolean. Why: Only a weighted or dynamic picker's items have a meaningful weight suffix to show. How: This checks the scoped picker's own mode against both weight-driven modes.
	const THR_VAL_NUM = 100;                                                                          // What: Threshold Value Number. Why: Every ease-mode drift/day-band computation below shares this one fixed ceiling value. How: This is referenced directly wherever a drift-to-days conversion happens.

	// Inactive-state replay from the event log: vacCheObj.onAt(itemId, date)
	// answers whether that item was inactive that day; vacCheObj.onAfter
	// answers whether an 'on' (return-from-vacation) transition happened
	// after that date.
	const vacCheObj = React.useMemo( () => { // What: Vacation Check Object Memo. Why: Several metrics below need to know an item's own active/inactive state on an arbitrary past day, not just its current state. How: This replays state.vacationLog into a per-item sorted event list, then exposes two small lookup functions closing over it.


		const eveByIdMap = new Map(); // What: Event By Id Map. Why: Each item's own vacation-toggle history needs to be grouped before it can be replayed. How: This starts empty and is filled by the loop below.

		for ( const rowObj of ( state.vacationLog || [] ) ) { // What: Vacation Row Grouping Loop. Why: Every logged toggle event needs filing under its own item. How: This appends each row to that item's own array, lazily creating it on first use.


			if ( !eveByIdMap.has( rowObj.itemId ) ) eveByIdMap.set( rowObj.itemId, [] ); // What: Lazy Array Guard. Why: An item's own event array must exist before rows can be pushed onto it. How: This seeds an empty array the first time an item's id is seen.

			eveByIdMap.get( rowObj.itemId ).push( rowObj ); // What: Event Push. Why: This is the actual filing of the row under its own item. How: This appends rowObj to that item's own array.


		}

		for ( const eveArr of eveByIdMap.values() ) eveArr.sort( ( aEveObj, bEveObj ) => ( aEveObj.date < bEveObj.date ? -1 : 1 ) ); // What: Chronological Sort Loop. Why: The replay functions below assume each item's own events are in chronological order. How: This sorts every item's own array by its own date field.

		const onAtFun = ( iteIdeStr, dayIsoStr ) => { // What: On At Function. Why: Several metrics need to ask "was this item inactive on this specific day", replayed from its own toggle history. How: This walks the item's own sorted events up through dayIsoStr, remembering the most recent on/off state.


			const eveArr = eveByIdMap.get( iteIdeStr ); // What: Event Array Lookup. Why: An item with no vacation history at all has nothing to replay. How: This looks up the item's own event array, which may be undefined.

			if ( !eveArr ) return false; // What: No History Guard. Why: An item that's never toggled vacation at all was never inactive. How: This returns false immediately when there's no event array for it.

			let onBoo = false; // What: On Boolean Accumulator. Why: The replay below needs a running "current state" to update as it walks forward. How: This starts false (active) and is overwritten by each event up to dayIsoStr.

			for ( const eveObj of eveArr ) { // What: Replay Walk Loop. Why: Only events on or before the asked-about day should affect the answer. How: This keeps overwriting onBoo while an event's own date qualifies, stopping at the first one that doesn't.


				if ( eveObj.date <= dayIsoStr ) onBoo = eveObj.on; // What: Qualifying Event Branch. Why: An event on or before dayIsoStr is the most recent state known as of that day. How: This overwrites onBoo with eveObj's own on value.

				else break; // What: Future Event Stop. Why: Once an event is found still in the future relative to dayIsoStr, every later event (eveArr is chronological) is too. How: This breaks out of the loop immediately.


			}

			return onBoo; // What: On At Return. Why: This is the replayed inactive/active state as of dayIsoStr. How: This returns the final onBoo value after the walk above.


		};

		const onAfterFun = ( iteIdeStr, dayIsoStr ) => { // What: On After Function. Why: The "was on vacation" label needs to know whether an item returned FROM vacation after a specific day, not just its state on that day. How: This checks the item's own event array for any later 'on' transition.


			const eveArr = eveByIdMap.get( iteIdeStr ); // What: Event Array Lookup. Why: An item with no vacation history at all can't have a later transition either. How: This looks up the item's own event array, which may be undefined.

			return !!eveArr && eveArr.some( ( eveObj ) => eveObj.on && eveObj.date > dayIsoStr ); // What: On After Return. Why: This answers whether a later return-from-vacation event exists at all. How: This checks for any event flagged on whose own date is after dayIsoStr.


		};

		return { onAt : onAtFun, onAfter : onAfterFun }; // What: Vacation Check Return. Why: Callers below need both replay functions bundled together, closing over the same grouped/sorted event data. How: This returns the small two-function api object.


	}, [ state.vacationLog ] ); // What: Effect Dependency Array. Why: This only ever needs rebuilding when the raw vacation log itself changes. How: state.vacationLog is the sole source the grouping loop above reads from.

	// Picker run days in range (distinct active-pick dates).
	const actDatArr = React.useMemo( () => [ ...new Set( picRowArr.map( ( rowObj ) => rowObj.date ) ) ].sort(), [ picRowArr ] ); // What: Active Date Array Memo. Why: The Frequency/Spent/Last-picked metrics all need the distinct set of days the picker actually ran, in order. How: This deduplicates picRowArr's own date field via a Set, then sorts it.

	// #endregion Single-Picker Breakdown Setup



	// #region Per-Item Metric Memos

	// Eligible-day gap per item (used by the Frequency metric). The
	// eligible index is per-item: picker run days MINUS that item's own
	// inactive days, so an inactive stretch can't inflate the gap.
	// Calendar gap stays literal wall-clock time.
	const freGapMap = React.useMemo( () => { // What: Frequency Gap Map Memo. Why: The Frequency metric needs a per-item average gap, in both calendar and eligible-day units, between its own consecutive picks. How: This groups picRowArr's own dates per item, then averages consecutive gaps in each unit.


		const outMapObj = new Map(); // What: Out Map Object. Why: The per-item gap results need a fresh accumulator to build up as the loop below runs. How: This starts empty and is filled below.

		if ( !isaPicBoo || easDowBoo ) return outMapObj; // What: Scope Guard. Why: Frequency only applies to a single-picker, non-ease-down scope; an ease-down picker uses Spent instead. How: This returns the still-empty map otherwise.

		const datByIteMap = new Map(); // What: Date By Item Map. Why: Each item's own pick dates need grouping before gaps between them can be measured. How: This starts empty and is filled by the loop below.

		for ( const rowObj of picRowArr ) { // What: Date Grouping Loop. Why: Every logged pick contributes one date to its own item's set. How: This adds rowObj's own date to that item's own Set, lazily creating it on first use.


			if ( !datByIteMap.has( rowObj.itemId ) ) datByIteMap.set( rowObj.itemId, new Set() ); // What: Lazy Set Guard. Why: An item's own date set must exist before a date can be added to it. How: This seeds an empty Set the first time an item's id is seen.

			datByIteMap.get( rowObj.itemId ).add( rowObj.date ); // What: Date Add. Why: This is the actual filing of the date under its own item. How: This adds rowObj.date to that item's own Set.


		}

		for ( const [ iteIdeStr, datSetObj ] of datByIteMap ) { // What: Per-Item Gap Loop. Why: Every item with at least one pick date needs its own average-gap computation in both units. How: This sorts the item's own dates, builds an eligible-day index, then averages consecutive gaps.


			const sorDatArr = [ ...datSetObj ].sort();                                                    // What: Sorted Date Array. Why: Consecutive-gap math requires the item's own pick dates in chronological order. How: This spreads and sorts the item's own date Set.
			const eliDatArr = actDatArr.filter( ( dayIsoStr ) => !vacCheObj.onAt( iteIdeStr, dayIsoStr ) ); // What: Eligible Date Array. Why: The eligible-day index must exclude any day this specific item was inactive, even if the picker itself ran that day. How: This filters actDatArr down to days vacCheObj.onAt reports as active for this item.
			const eliIndMap  = new Map( eliDatArr.map( ( dayIsoStr, indNum ) => [ dayIsoStr, indNum ] ) ); // What: Eligible Index Map. Why: Converting a calendar date into its own eligible-day position requires a fast lookup. How: This maps each eligible date to its own position in eliDatArr.

			let aveGapEliNum = null, aveGapCalNum = null; // What: Average Gap Accumulators. Why: Both unit's own averages default to "no data" until at least two pick dates exist to measure a gap between. How: This starts both at null and is overwritten below when there's enough data.

			if ( sorDatArr.length >= 2 ) { // What: Enough Data Guard. Why: An average gap needs at least two pick dates to measure a gap between. How: This computes both sums only when there are at least two dates.


				let eliSumNum = 0, calSumNum = 0; // What: Gap Sum Accumulators. Why: The loop below needs running totals in both units before they can be averaged. How: Both start at zero and are added to below.


				for ( let indNum = 1; indNum < sorDatArr.length; indNum++ ) { // What: Consecutive Gap Loop. Why: Every consecutive pair of pick dates contributes one gap in each unit. How: This adds the eligible-index difference and the calendar-day difference for each pair.


					eliSumNum += ( eliIndMap.get( sorDatArr[ indNum ] ) ?? 0 ) - ( eliIndMap.get( sorDatArr[ indNum - 1 ] ) ?? 0 ); // What: Eligible Gap Add. Why: This is the actual eligible-day distance between one pick and the next. How: This subtracts the earlier date's own eligible index from the later one's.

					calSumNum += Math.round( ( new Date( sorDatArr[ indNum ] ) - new Date( sorDatArr[ indNum - 1 ] ) ) / 86400000 ); // What: Calendar Gap Add. Why: This is the actual wall-clock day distance between one pick and the next. How: This divides the millisecond difference by a day's own millisecond count.


				}

				aveGapEliNum = eliSumNum / ( sorDatArr.length - 1 ); // What: Average Eligible Gap Assignment. Why: The finished eligible-unit average needs storing for the metric to read. How: This divides the summed eligible gaps by the number of gaps measured.
				aveGapCalNum = calSumNum / ( sorDatArr.length - 1 ); // What: Average Calendar Gap Assignment. Why: The finished calendar-unit average needs storing for the metric to read. How: This divides the summed calendar gaps by the number of gaps measured.


			}

			outMapObj.set( iteIdeStr, { aveGapElig : aveGapEliNum, aveGapCal : aveGapCalNum, count : sorDatArr.length } ); // What: Item Gap Store. Why: The Frequency metric needs both averages plus the raw pick count per item. How: This sets the finished per-item result under its own iteIdeStr key.


		}

		return outMapObj; // What: Frequency Gap Return. Why: This is the finished per-item gap map the Frequency metric reads from. How: This returns the map built above.


	}, [ isaPicBoo, easDowBoo, picRowArr, actDatArr, vacCheObj ] ); // What: Effect Dependency Array. Why: This map only ever needs rebuilding when the picker scope, the ease-down flag, the pick rows, the active dates, or the vacation-check api changes. How: Each dependency feeds one part of the grouping/averaging above.

	// Ease Down "Spent": measured from ACTUAL history, the average length
	// of a completed depletion streak (consecutive runs of the same active
	// item that ended when its charge hit 0, flagged depletedEnd).
	// Abandoned streaks (re-roll / inactive / manual) never reach 0, so
	// they're excluded, which is why recharging an abandoned item can't
	// skew this. elig = runs; cal = calendar days spanned. null when the
	// item has no completed cycle in range.
	const speGapMap = React.useMemo( () => { // What: Spent Gap Map Memo. Why: The ease-down Spent metric needs a per-item average completed-cycle length, in both run-count and calendar-day units. How: This walks picRowArr's own dates in order, grouping consecutive same-item runs and keeping only ones that ended depleted.


		const outMapObj = new Map(); // What: Out Map Object. Why: The per-item spent results need a fresh accumulator to build up below. How: This starts empty and is filled below.

		if ( !easDowBoo ) return outMapObj; // What: Ease Down Guard. Why: Spent only applies to an ease-down picker. How: This returns the still-empty map otherwise.

		const dayInfMap = new Map(); // What: Day Info Map. Why: The run-detection loop below needs each date's own item and depleted-end flag, keyed for lookup. How: This maps each pick date to a small { itemId, depletedEnd } record.

		for ( const rowObj of picRowArr ) dayInfMap.set( rowObj.date, { itemId : rowObj.itemId, depletedEnd : !!rowObj.depletedEnd } ); // What: Day Info Population Loop. Why: Every logged pick contributes its own date's item/depleted-end pair. How: This sets one entry per row, keyed by its own date.

		const sorDatArr = [ ...dayInfMap.keys() ].sort(); // What: Sorted Date Array. Why: Run detection below depends on walking the picker's own dates in chronological order. How: This spreads and sorts dayInfMap's own keys.

		const strkByIteMap = new Map(); // What: Streak By Item Map. Why: Every completed depletion streak needs filing under its own item before it can be averaged. How: This starts empty and is filled by the run-walk loop below.

		let staIndNum = 0; // What: Start Index Number. Why: The run-walk loop below needs a cursor marking where the current same-item run began. How: This starts at 0 and advances past each completed run.


		while ( staIndNum < sorDatArr.length ) { // What: Run Walk Loop. Why: Every maximal run of consecutive same-item dates needs detecting, one at a time. How: This finds the run's own end index, then checks whether it ended depleted before recording it.


			const runIteStr = dayInfMap.get( sorDatArr[ staIndNum ] ).itemId; // What: Run Item String. Why: A run is defined as consecutive dates belonging to the same item. How: This reads the item at the run's own starting date.

			let endIndNum = staIndNum; // What: End Index Number. Why: The inner loop below needs a cursor to advance while the same item continues. How: This starts at the run's own start and advances below.

			while ( endIndNum + 1 < sorDatArr.length && dayInfMap.get( sorDatArr[ endIndNum + 1 ] ).itemId === runIteStr ) endIndNum++; // What: Run Extension Loop. Why: The run continues for as long as the next date's own item still matches. How: This advances endIndNum while the next date belongs to the same item.

			if ( dayInfMap.get( sorDatArr[ endIndNum ] ).depletedEnd ) { // What: Completed Cycle Guard. Why: Only a run that actually ended in depletion (not an abandoned re-roll/inactive/manual switch) counts toward this average. How: This checks the run's own final date for its depletedEnd flag.


				const runCouNum = endIndNum - staIndNum + 1;                                                             // What: Run Count Number. Why: The eligible-unit average needs the run's own length in picks. How: This is the inclusive distance between the run's start and end indices.
				const calDayNum = Math.round( ( new Date( sorDatArr[ endIndNum ] ) - new Date( sorDatArr[ staIndNum ] ) ) / 86400000 ) + 1; // What: Calendar Day Number. Why: The calendar-unit average needs the run's own wall-clock span, inclusive of both endpoints. How: This divides the millisecond difference by a day's own millisecond count, then adds 1 to make it inclusive.

				if ( !strkByIteMap.has( runIteStr ) ) strkByIteMap.set( runIteStr, [] ); // What: Lazy Array Guard. Why: An item's own streak array must exist before a completed streak can be pushed onto it. How: This seeds an empty array the first time this item's id completes a streak.

				strkByIteMap.get( runIteStr ).push( { runs : runCouNum, calDays : calDayNum } ); // What: Streak Push. Why: This is the actual filing of the completed streak's own two measurements under its own item. How: This appends the { runs, calDays } pair.


			}

			staIndNum = endIndNum + 1; // What: Start Index Advance. Why: The outer loop must continue searching from right after the run just processed. How: This moves staIndNum past the run's own end index.


		}

		for ( const [ iteIdeStr, strkArr ] of strkByIteMap ) { // What: Per-Item Average Loop. Why: Every item with at least one completed streak needs its own averaged elig/cal values. How: This averages every recorded streak's own runs and calDays fields.


			if ( !strkArr.length ) continue; // What: Empty Guard. Why: An item that never appears in strkByIteMap already has no entry, but this guards a theoretical empty array too. How: This skips straight to the next item.

			outMapObj.set( iteIdeStr, { // What: Item Spent Store. Why: The Spent metric needs both unit averages plus the completed-cycle count per item. How: This averages every streak's own runs/calDays field and counts how many streaks were averaged.


				cal    : strkArr.reduce( ( sumNum, strkObj ) => sumNum + strkObj.calDays, 0 ) / strkArr.length,
				cycles : strkArr.length,
				elig   : strkArr.reduce( ( sumNum, strkObj ) => sumNum + strkObj.runs, 0 ) / strkArr.length


			});


		}

		return outMapObj; // What: Spent Gap Return. Why: This is the finished per-item spent map the Spent metric reads from. How: This returns the map built above.


	}, [ easDowBoo, picRowArr ] ); // What: Effect Dependency Array. Why: This map only ever needs rebuilding when the ease-down flag or the underlying pick rows change. How: Both feed the run-detection and averaging logic above.

	// Most-recent active pick date per item (used by the "Last picked"
	// metric). Range + scope aware via picRowArr; rejected rows are
	// already excluded there.
	const lasPicMap = React.useMemo( () => { // What: Last Pick Map Memo. Why: The Last Picked metric needs each item's own most recent active-pick date. How: This walks picRowArr once, keeping only the latest date seen per item.


		const outMapObj = new Map(); // What: Out Map Object. Why: The per-item latest-date results need a fresh accumulator to build up below. How: This starts empty and is filled by the loop below.

		for ( const rowObj of picRowArr ) { // What: Latest Date Loop. Why: Every logged pick might be a new latest date for its own item. How: This overwrites the item's own entry whenever a later date is seen.


			const preDatStr = outMapObj.get( rowObj.itemId ); // What: Previous Date String. Why: The comparison below needs whatever date was previously recorded for this item, if any. How: This looks up the item's own current entry.

			if ( !preDatStr || rowObj.date > preDatStr ) outMapObj.set( rowObj.itemId, rowObj.date ); // What: Latest Date Update. Why: Only a later (or first-ever) date should overwrite the item's own entry. How: This sets rowObj.date when there's no previous entry or this one is later.


		}

		return outMapObj; // What: Last Pick Return. Why: This is the finished per-item latest-date map the Last Picked metric reads from. How: This returns the map built above.


	}, [ picRowArr ] ); // What: Effect Dependency Array. Why: This map only ever needs rebuilding when the underlying pick rows themselves change. How: picRowArr is the sole source the loop above reads from.

	// #endregion Per-Item Metric Memos



	// #region Per-Item Breakdown List

	// One row per item with every metric attached. Includes "ghost" items,
	// ones deleted from the picker but still with history in the log for
	// the active range, so the breakdown totals stay consistent with the
	// aggregate cards. Ghosts are flagged deleted and labelled in the UI.
	const perIteArr = React.useMemo( () => { // What: Per Item Array Memo. Why: The Pick breakdown card needs one combined row per item, live or ghost, carrying every metric it might display. How: This joins state.items (plus reconstructed ghost rows) against every per-item map computed above.


		if ( !isaPicBoo ) return []; // What: Scope Guard. Why: A per-item breakdown only makes sense while a single real picker is the active scope. How: This returns an empty array otherwise.

		const livIteArr = ( state.items || [] ).filter( ( iteObj ) => iteObj.pickerId === scoValStr ); // What: Live Item Array. Why: Every currently-existing item under this picker needs its own row, even a zero-pick one. How: This filters state.items down to the scoped picker's own items.
		const livIdeSet = new Set( livIteArr.map( ( iteObj ) => iteObj.id ) );                        // What: Live Id Set. Why: The ghost-detection loop below needs a fast membership check against every currently-live item id. How: This collects livIteArr's own ids into a Set.

		// Deleted-but-logged items: any itemId in this scope's log (within
		// range) that no longer exists live. The name comes from the log's
		// own denormalized label.
		const ghoNamMap = new Map(); // What: Ghost Name Map. Why: A deleted item's own display name must be recovered from the log, since it no longer exists live to read a name from. How: This starts empty and is filled by the loop below.

		for ( const rowObj of ( picLogArr || [] ) ) { // What: Ghost Detection Loop. Why: Every logged row for this scope in range might belong to an item that's since been deleted. How: This records that row's own itemId/itemName pair whenever the id isn't among the live ones.


			if ( scoValStr !== 'all' && rowObj.pickerId !== scoValStr ) continue; // What: Scope Guard. Why: Only rows belonging to the scoped picker are relevant here. How: This skips any row from a different picker.
			if ( cutIsoStr && rowObj.date < cutIsoStr ) continue;                 // What: Range Guard. Why: Only rows inside the active range are relevant here. How: This skips any row dated before cutIsoStr.

			if ( !livIdeSet.has( rowObj.itemId ) ) ghoNamMap.set( rowObj.itemId, rowObj.itemName || '(deleted item)' ); // What: Ghost Name Record. Why: A ghost's own display name should come from its most recent logged label. How: This sets (or overwrites) the ghost's own name whenever its id isn't live.


		}

		const ghoIteArr = [ ...ghoNamMap ].map( ( [ iteIdeStr, iteNamStr ] ) => ( // What: Ghost Item Array. Why: Every ghost needs a minimal item-shaped object so it can flow through the same mapping logic as a live item below. How: This turns each recorded ghost name into a small stand-in object flagged __deleted.


			{ id : iteIdeStr, name : iteNamStr, pickerId : scoValStr, vacation : false, __deleted : true }


		));

		const allIteArr = [ ...livIteArr, ...ghoIteArr ]; // What: All Item Array. Why: The mapping below builds one output row per item regardless of whether it's live or a ghost. How: This concatenates both arrays into one combined list.

		return allIteArr.map( ( iteObj ) => { // What: Row Build Map. Why: Every item, live or ghost, needs its own combined row of every metric the breakdown card can show. How: This looks each item up in every per-item map above and packages the results together.


			const couEntObj = picCouMap.get( iteObj.id ) || { n : 0, auto : 0, manual : 0, reroll : 0 };                     // What: Count Entry Object. Why: An item with no picks at all still needs a zeroed count entry to read from. How: This looks iteObj's own id up in picCouMap, falling back to zeros.
			const freEntObj = freGapMap.get( iteObj.id ) || { aveGapElig : null, aveGapCal : null, count : 0 };             // What: Frequency Entry Object. Why: An item with no frequency data at all still needs a null-filled entry to read from. How: This looks iteObj's own id up in freGapMap, falling back to nulls.
			const aveGapNum = freModStr === 'calendar' ? freEntObj.aveGapCal : freEntObj.aveGapElig;                        // What: Average Gap Number. Why: The row's own displayed gap depends on which unit mode is currently active. How: This picks whichever of freEntObj's two fields matches freModStr.
			const lasDatStr = lasPicMap.get( iteObj.id ) || null;                                                          // What: Last Date String. Why: The row needs this item's own most recent pick date, or null if it's never been picked. How: This looks iteObj's own id up in lasPicMap.

			// Calendar days ago vs. eligible days ago; eligible excludes
			// days the picker itself didn't run AND days this item was
			// inactive.
			const lasCalNum  = lasDatStr ? Math.round( ( new Date( todIsoStr ) - new Date( lasDatStr ) ) / 86400000 ) : null; // What: Last Calendar Number. Why: The calendar-mode "days ago" reading needs a literal wall-clock day count. How: This divides the millisecond difference between today and lasDatStr by a day's own millisecond count.
			const eliDatArr  = actDatArr.filter( ( dayIsoStr ) => !vacCheObj.onAt( iteObj.id, dayIsoStr ) );                 // What: Eligible Date Array. Why: The eligible-mode reading needs this item's own subset of run days, excluding its inactive stretches. How: This filters actDatArr down to days vacCheObj.onAt reports as active for this item.
			const eliIndNum  = eliDatArr.indexOf( lasDatStr );                                                              // What: Eligible Index Number. Why: The eligible-mode reading needs to know this pick's own position among eligible days. How: This finds lasDatStr's own position in eliDatArr, or -1 if it isn't present at all.
			const lasEliNum  = ( lasDatStr != null && eliIndNum >= 0 ) ? ( eliDatArr.length - 1 - eliIndNum ) : null;        // What: Last Eligible Number. Why: The eligible-mode reading needs "how many eligible days ago", not the raw index. How: This subtracts the pick's own position from the last eligible index.
			const lasDayNum  = lasModStr === 'eligible' ? lasEliNum : lasCalNum;                                            // What: Last Day Number. Why: The row's own displayed "last picked" value depends on which unit mode is currently active. How: This picks whichever of lasEliNum/lasCalNum matches lasModStr.

			// Count denominator: total picks vs. picks made while this item
			// was eligible.
			const eliDenNum = picRowArr.reduce( ( sumNum, rowObj ) => sumNum + ( vacCheObj.onAt( iteObj.id, rowObj.date ) ? 0 : 1 ), 0 ); // What: Eligible Denominator Number. Why: The eligible-mode Count percentage needs a denominator of only the picks made while this item was actually active. How: This sums picRowArr, adding 1 per row unless this item was inactive on that row's own date.

			// Label: not currently inactive, but went inactive after its
			// last pick and hasn't been picked since returning. Never
			// shown for a deleted item.
			const wasVacBoo = !iteObj.__deleted && !iteObj.vacation && vacCheObj.onAfter( iteObj.id, lasDatStr || '' ); // What: Was Vacation Boolean. Why: This flags an item that went inactive after its own last pick and hasn't been picked again since returning. How: This checks vacCheObj.onAfter against lasDatStr, only for a live, currently-active item.

			return { // What: Breakdown Row Return. Why: This is the single combined object the Pick breakdown card renders one list item from. How: This packages the item's own identity flags alongside every metric value computed above.


				auto      : couEntObj.auto,
				aveGap    : aveGapNum,
				deleted   : !!iteObj.__deleted,
				eligDenom : eliDenNum,
				freqCount : freEntObj.count,
				id        : iteObj.id,
				lastDays  : lasDayNum,
				manual    : couEntObj.manual,
				n         : couEntObj.n,
				name      : iteObj.name,
				rejected  : rejCouMap.get( iteObj.id ) || 0,
				skipped   : skiCouMap.get( iteObj.id ) || 0,

				spent : ( () => { // What: Spent Field Resolver. Why: The Spent field needs the same calendar/eligible unit switch as aveGap above, but sourced from speGapMap instead. How: This looks the item up in speGapMap, returning null when it has no completed cycle, otherwise the mode-selected value.


					const speEntObj = speGapMap.get( iteObj.id );

					if ( !speEntObj ) return null;

					return speModStr === 'calendar' ? speEntObj.cal : speEntObj.elig;


				})(),

				vacation : !!iteObj.vacation,
				wasOnVac : wasVacBoo


			};


		});


	}, [ isaPicBoo, state.items, scoValStr, picLogArr, cutIsoStr, picCouMap, freGapMap, rejCouMap, skiCouMap, speGapMap, lasPicMap, actDatArr, vacCheObj, picRowArr, lasModStr, freModStr, speModStr, todIsoStr ] ); // What: Effect Dependency Array. Why: Every input this join reads from must be listed so a change to any one of them rebuilds the combined rows. How: Each dependency feeds one specific field or filter used inside the map above.

	// Active metric for ease-down swaps Frequency to Spent. Guards against
	// a stale 'spent'/'freq' selection lingering when switching picker
	// modes.
	const freKeyStr = easDowBoo ? 'spent' : 'freq';                                     // What: Frequency Key String. Why: Which metric key represents "the frequency-like metric" depends on the scoped picker's own mode. How: This resolves to 'spent' for an ease-down picker, 'freq' otherwise.
	const effMetStr = ( metKeyStr === 'freq' || metKeyStr === 'spent' ) ? freKeyStr : metKeyStr; // What: Effective Metric String. Why: The rest of the card must treat a stale 'freq'/'spent' selection as whichever one actually applies to the current picker's mode. How: This substitutes freKeyStr whenever metKeyStr is either of those two, otherwise passes metKeyStr through unchanged.

	// Sort perIteArr by the active metric + direction. Frequency and Last-
	// picked pin their "no data" rows (never-picked) to the bottom.
	const breListArr = React.useMemo( () => { // What: Breakdown List Array Memo. Why: The Pick breakdown card needs perIteArr resorted by whichever metric/direction is currently active. How: This branches per effMetStr's own shape, since a null-heavy metric needs its own bottom-pinning comparator.


		const sorDirNum = sorDirStr === 'desc' ? -1 : 1; // What: Sort Direction Number. Why: Every branch below needs a plain +1/-1 multiplier instead of re-checking the string per comparison. How: This is -1 for descending (since the raw subtraction below is ascending-oriented), 1 for ascending.
		const sorIteArr = perIteArr.slice();             // What: Sorted Item Array. Why: The original perIteArr order must stay stable for other consumers, so a copy is sorted instead. How: This is a shallow copy, sorted in place by whichever branch below runs.

		if ( effMetStr === 'freq' ) { // What: Frequency Sort Branch. Why: A never-picked item has no aveGap at all and must sink to the bottom regardless of direction. How: This compares aveGap when both sides have it, otherwise falls back to freqCount and then name.


			sorIteArr.sort( ( aIteObj, bIteObj ) => {

				if ( aIteObj.aveGap == null && bIteObj.aveGap == null ) return ( bIteObj.freqCount - aIteObj.freqCount ) || aIteObj.name.localeCompare( bIteObj.name );
				if ( aIteObj.aveGap == null ) return 1;
				if ( bIteObj.aveGap == null ) return -1;
				return sorDirNum * ( aIteObj.aveGap - bIteObj.aveGap ) || aIteObj.name.localeCompare( bIteObj.name );

			});


		}

		else if ( effMetStr === 'last' ) { // What: Last Picked Sort Branch. Why: A never-picked item has no lastDays at all and must sink to the bottom regardless of direction. How: This compares lastDays when both sides have it, otherwise falls back to a plain name comparison.


			sorIteArr.sort( ( aIteObj, bIteObj ) => {

				if ( aIteObj.lastDays == null && bIteObj.lastDays == null ) return aIteObj.name.localeCompare( bIteObj.name );
				if ( aIteObj.lastDays == null ) return 1;
				if ( bIteObj.lastDays == null ) return -1;
				return sorDirNum * ( aIteObj.lastDays - bIteObj.lastDays ) || aIteObj.name.localeCompare( bIteObj.name );

			});


		}

		else if ( effMetStr === 'spent' ) { // What: Spent Sort Branch. Why: An item with no completed cycle has no spent value at all and must sink to the bottom either way. How: This compares spent when both sides have it, otherwise falls back to a plain name comparison.


			sorIteArr.sort( ( aIteObj, bIteObj ) => {

				if ( aIteObj.spent == null && bIteObj.spent == null ) return aIteObj.name.localeCompare( bIteObj.name );
				if ( aIteObj.spent == null ) return 1;
				if ( bIteObj.spent == null ) return -1;
				return sorDirNum * ( aIteObj.spent - bIteObj.spent ) || aIteObj.name.localeCompare( bIteObj.name );

			});


		}

		else { // What: Plain Numeric Sort Branch. Why: Every remaining metric (count/auto/manual/rejected/skipped) is a plain always-present number with no null case to pin. How: This resolves the active metric's own field per row, then sorts by it directly.


			const rowValFun = ( iteObj ) => effMetStr === 'auto' ? iteObj.auto // What: Row Value Function. Why: Each of these metrics compares a different field, so one resolver function covers all of them. How: This branches on effMetStr, defaulting to the plain pick count n.
				: effMetStr === 'manual' ? iteObj.manual
				: effMetStr === 'rejected' ? iteObj.rejected
				: effMetStr === 'skipped' ? iteObj.skipped
				: iteObj.n;

			sorIteArr.sort( ( aIteObj, bIteObj ) => sorDirNum * ( rowValFun( aIteObj ) - rowValFun( bIteObj ) ) || aIteObj.name.localeCompare( bIteObj.name ) ); // What: Plain Sort Call. Why: This is the actual comparator applied for every non-null-pinning metric. How: This orders by rowValFun's own resolved value, tie-breaking alphabetically.


		}

		return sorIteArr; // What: Breakdown List Return. Why: This is the finished, metric-sorted list the Pick breakdown card renders. How: This returns whichever branch above sorted sorIteArr in place.


	}, [ perIteArr, effMetStr, sorDirStr ] ); // What: Effect Dependency Array. Why: This list only ever needs resorting when the underlying rows, the active metric, or the sort direction changes. How: perIteArr supplies the rows, effMetStr/sorDirStr together determine the comparator branch and direction.

	// #endregion Per-Item Breakdown List



	// #region Cadence-Aware Formatting

	// Cadence-aware unit words. A cadence picker runs once per period, so
	// its own "eligible" (run-count) values ARE period counts, so eligible
	// mode relabels days into week/month/year. Calendar mode always stays
	// in literal days.
	const staCadStr = ( scpPicObj && scpPicObj.cadence ) || 'daily'; // What: Stat Cadence String. Why: Every unit-formatting helper below needs to know the scoped picker's own cadence. How: This reads scpPicObj.cadence, falling back to 'daily' for a picker with none set.
	const isaCadBoo = staCadStr !== 'daily';                        // What: Is-A Cadenced Boolean. Why: A daily picker's own values never need relabeling into a different unit word. How: This is true whenever staCadStr isn't the 'daily' default.

	// Approx wall-clock days per cadence period, used to express CALENDAR-
	// mode day-counts in the picker's own cadence unit (eligible-mode
	// values are already period counts and need no conversion).
	const PER_DAY_OBJ = { weekly : 7, monthly : 30, yearly : 365 };            // What: Per Day Object. Why: Converting a raw calendar-day count into cadence periods needs each cadence's own approximate period length. How: This is looked up by staCadStr below.
	const perDayNum   = PER_DAY_OBJ[ staCadStr ] || 1;                        // What: Per Day Number. Why: cadDisFun below needs this scoped picker's own approximate days-per-period value. How: This looks staCadStr up in PER_DAY_OBJ, falling back to 1 for a daily picker.
	const uniForFun   = ( uniModStr, uniNum ) => isaCadBoo // What: Unit For Function. Why: A day-count metric's own unit word depends on both the picker's cadence and whether the value is singular or plural. How: This defers to CAD_NAM_OBJ.uniWorFun for a cadenced picker, otherwise pluralizes the literal word "day".
		? CAD_NAM_OBJ.uniWorFun( staCadStr, uniNum )
		: ( uniNum === 1 ? 'day' : 'days' );

	// Plural unit word for the eligible-mode toggle labels (weeks/months/
	// years).
	const eliUniStr = isaCadBoo ? CAD_NAM_OBJ.uniWorFun( staCadStr, 2 ) : 'days';         // What: Eligible Unit String. Why: The eligible-mode toggle button's own label needs a plural unit word matching the picker's cadence. How: This asks CAD_NAM_OBJ.uniWorFun for the plural form (using 2 as a representative plural count), or falls back to 'days'.
	// Toggle-button label for calendar mode (relabelled to the cadence
	// unit).
	const calUniStr = isaCadBoo ? `calendar ${ eliUniStr }` : 'calendar days'; // What: Calendar Unit String. Why: The calendar-mode toggle button's own label needs the same cadence-aware relabeling as the eligible one. How: This prefixes eliUniStr with "calendar", or falls back to the literal "calendar days".

	// Format a raw day-count metric for the value column. A cadence picker
	// converts calendar days into periods and ALWAYS shows one decimal
	// (forced ".0") so eligible and calendar line up; a daily picker keeps
	// its existing whole-day display via dlyDayNum. Returns
	// { num (string), word }.
	const cadDisFun = ( rawDayNum, uniModStr, dlyDayNum ) => { // What: Cadence Display Function. Why: Every day-count metric's own value column needs this same conversion, so it's centralized once instead of repeated per metric. How: This converts rawDayNum into cadence periods for a cadenced picker, otherwise passing dlyDayNum straight through.


		if ( !isaCadBoo ) return { num : String( dlyDayNum ), word : ( dlyDayNum === 1 ? 'day' : 'days' ) }; // What: Daily Return. Why: A daily picker's own value column already has its own whole-day formatting computed by the caller. How: This returns dlyDayNum as-is, with a simple singular/plural "day"/"days" word.

		const perNum = uniModStr === 'calendar' ? rawDayNum / perDayNum : rawDayNum; // What: Period Number. Why: A calendar-mode raw day count must be converted into periods before display; an eligible-mode one is already in periods. How: This divides by perDayNum only in calendar mode.

		return { num : ( Math.round( perNum * 10 ) / 10 ).toFixed( 1 ), word : CAD_NAM_OBJ.uniWorFun( staCadStr, perNum ) }; // What: Cadence Return. Why: A cadenced picker's own value column always shows one forced decimal place, with a matching singular/plural unit word. How: This rounds perNum to one decimal and asks CAD_NAM_OBJ.uniWorFun for the matching word.


	};

	// Human label for "last picked", in the active unit.
	const lasForFun = ( dayNum, uniModStr ) => { // What: Last Format Function. Why: The Last Picked metric's own value column needs a distinct "ago"-phrased label rather than the plain cadDisFun format. How: This special-cases zero (as "Most recent"), otherwise phrasing a cadence-aware or literal "N days ago" string.


		if ( uniModStr === 'eligible' ) { // What: Eligible Mode Branch. Why: Eligible-mode "last picked" is already a period count, phrased differently from the calendar branch below. How: This special-cases zero, then a cadenced or plain "ago" phrase.


			if ( dayNum === 0 ) return 'Most recent';

			if ( isaCadBoo ) return `${ ( Math.round( dayNum * 10 ) / 10 ).toFixed( 1 ) } ${ CAD_NAM_OBJ.uniWorFun( staCadStr, dayNum ) } ago`;

			return `${ dayNum } ${ uniForFun( 'eligible', dayNum ) } ago`;


		}

		if ( dayNum === 0 ) return 'Most recent'; // What: Calendar Zero Case. Why: A same-day pick reads more naturally as "Most recent" than "0 days ago" in calendar mode too. How: This short-circuits before the cadence/plain branches below.

		if ( isaCadBoo ) { const perNum = dayNum / perDayNum; return `${ ( Math.round( perNum * 10 ) / 10 ).toFixed( 1 ) } ${ CAD_NAM_OBJ.uniWorFun( staCadStr, perNum ) } ago`; } // What: Calendar Cadenced Case. Why: A cadenced picker's own calendar-mode reading must still convert into its own period unit. How: This divides dayNum by perDayNum, then phrases it the same way the eligible branch above does.

		return dayNum === 1 ? 'Yesterday' : `${ dayNum } days ago`; // What: Calendar Daily Case. Why: A plain daily picker's own calendar-mode reading is just literal days. How: This special-cases exactly one day as "Yesterday", otherwise a plain "N days ago" string.


	};

	// #endregion Cadence-Aware Formatting



	// #region Suffix Helpers

	// Name suffixes, scoped to the metric being shown:
	//   - Count           -> weight suffix (weighted / dynamic)
	//   - Freq/Spent      -> range suffix (ease modes), days from the
	//                        drift band (soonest = 100/easeMax, latest =
	//                        100/easeMin)
	//   - Auto/Hand Picked/Re-Rolled Away -> no suffix ("{name} {count}")
	const weiSufFun = React.useCallback( ( iteObj ) => { // What: Weight Suffix Function. Why: A weighted/dynamic picker's own items need their configured weight shown alongside the Count metric. How: This returns null unless useWeiBoo is true, otherwise a "weight N" string.


		if ( !iteObj || !useWeiBoo ) return null;

		return `weight ${ iteObj.weight ?? 1 }`;


	}, [ useWeiBoo ] ); // What: Effect Dependency Array. Why: This callback's own identity only needs to change when the weighted/dynamic flag itself changes. How: useWeiBoo is the sole external value the function body reads.

	const ranSufFun = React.useCallback( ( iteObj ) => { // What: Range Suffix Function. Why: An ease-up/ease-down item's own configured drift band needs surfacing as a day-range suffix. How: This computes the soonest/latest day-band from the item's own (or the picker's default) easeMin/easeMax.


		if ( !iteObj || !( easUpwBoo || easDowBoo ) ) return null; // What: Ease Mode Guard. Why: This suffix only applies to an ease-up or ease-down picker. How: This returns null for every other mode.

		const easMinNum = iteObj.easeMin ?? scpPicObj.easeMin ?? 1; // What: Ease Min Number. Why: The band's own upper bound (latest) is derived from the smaller drift value. How: This reads the item's own easeMin, falling back to the picker's own default, then 1.
		const easMaxNum = iteObj.easeMax ?? scpPicObj.easeMax ?? 1; // What: Ease Max Number. Why: The band's own lower bound (soonest) is derived from the larger drift value. How: This reads the item's own easeMax, falling back to the picker's own default, then 1.
		const soonDayNum = Math.max( 1, Math.round( THR_VAL_NUM / ( easMaxNum || 1 ) ) ); // What: Soonest Day Number. Why: The fastest a full drift cycle can complete is governed by the larger (max) drift value. How: This divides the threshold by easMaxNum, floored at 1 day.
		const lateDayNum = Math.max( 1, Math.round( THR_VAL_NUM / ( easMinNum || 1 ) ) ); // What: Latest Day Number. Why: The slowest a full drift cycle can complete is governed by the smaller (min) drift value. How: This divides the threshold by easMinNum, floored at 1 day.

		// soonDayNum/lateDayNum are period counts; relabel in the picker's
		// own cadence unit.
		const uniWorStr = ( ( scpPicObj && scpPicObj.cadence ) || 'daily' ) !== 'daily' // What: Unit Word String. Why: A cadenced picker's own band suffix must relabel from raw days into its own period word. How: This asks CAD_NAM_OBJ.uniWorFun for lateDayNum's own word, or falls back to the literal "days".
			? CAD_NAM_OBJ.uniWorFun( scpPicObj.cadence, lateDayNum ) : 'days';

		return `range ${ soonDayNum }–${ lateDayNum } ${ uniWorStr }`; // What: Range Suffix Return. Why: This is the finished "range X-Y unit" string rendered under the item's own name. How: This joins the two computed bounds with an en dash and the resolved unit word.


	}, [ easUpwBoo, easDowBoo, scpPicObj ] ); // What: Effect Dependency Array. Why: This callback's own identity only needs to change when either ease-mode flag or the scoped picker itself changes. How: Each is read directly inside the function body above.

	// Suffix shown for the active metric (count -> weight, freq/spent ->
	// range).
	const actSufFun = React.useCallback( ( iteObj ) => { // What: Active Suffix Function. Why: The breakdown list needs one function resolving "whichever suffix applies to the currently active metric", rather than the card checking both individually. How: This dispatches to weiSufFun for the Count metric, ranSufFun for Frequency/Spent, and null otherwise.


		if ( effMetStr === 'count' ) return weiSufFun( iteObj );

		if ( effMetStr === 'freq' || effMetStr === 'spent' ) return ranSufFun( iteObj );

		return null;


	}, [ effMetStr, weiSufFun, ranSufFun ] ); // What: Effect Dependency Array. Why: This callback's own identity only needs to change when the active metric or either underlying suffix function changes. How: Each is read directly inside the function body above.

	// Per-item lookup so the card can fetch the raw item for its suffix.
	const iteObjMap = React.useMemo( () => { // What: Item Object Map Memo. Why: The breakdown list's own rows don't carry every raw item field, so a suffix needs to look the real item back up by id. How: This maps every live item's own id to itself.


		const outMapObj = new Map();

		for ( const iteObj of ( state.items || [] ) ) outMapObj.set( iteObj.id, iteObj );

		return outMapObj;


	}, [ state.items ] ); // What: Effect Dependency Array. Why: This map only ever needs rebuilding when the live item list itself changes. How: state.items is the sole source the loop above reads from.

	const gapForFun = ( gapNum ) => ( gapNum >= 10 ? Math.round( gapNum ) : Math.round( gapNum * 10 ) / 10 ); // What: Gap Format Function. Why: The Frequency metric's own displayed gap should show one decimal for a small, precise value but round to a whole number once the gap is large enough that a decimal adds no useful precision. How: This rounds to the nearest whole number at or above 10, otherwise to one decimal place.

	// Metric pills for the Pick breakdown card (an ease-down picker swaps
	// Frequency for Spent).
	const metPilArr = [ // What: Metric Pill Array. Why: This defines the fixed set of pill buttons the Pick breakdown card's own metric row renders. How: This is mapped over in that row's JSX, each entry's own key compared against metKeyStr for active-state styling.


		{ keyStr : 'count', labStr : 'Count' },
		easDowBoo ? { keyStr : 'spent', labStr : 'Spent' } : { keyStr : 'freq', labStr : 'Frequency' },
		{ keyStr : 'last', labStr : 'Last Picked' },
		{ keyStr : 'auto', labStr : 'Auto' },
		{ keyStr : 'manual', labStr : 'Hand Picked' },
		{ keyStr : 'rejected', labStr : 'Re-Rolled Away' },
		{ keyStr : 'skipped', labStr : 'Skipped' }


	];

	// #endregion Suffix Helpers



	// #region Source, Type, And Reminder Breakdown Data

	// Source split (picks only).
	const souSegArr = React.useMemo( () => { // What: Source Segment Array Memo. Why: The "How picks were chosen" card needs SOU_MET_ARR joined with each source's own live count. How: This tallies picRowArr's own source field, then maps SOU_MET_ARR to include each count.


		const couObj = { auto : 0, manual : 0, reroll : 0 }; // What: Count Object. Why: The tally needs one accumulator field per real source value. How: This starts zeroed and is incremented by the loop below.

		for ( const rowObj of picRowArr ) if ( couObj[ rowObj.source ] !== undefined ) couObj[ rowObj.source ]++; // What: Source Tally Loop. Why: Every logged pick contributes one to whichever source produced it. How: This increments couObj's own matching field per row.

		return SOU_MET_ARR.map( ( souObj ) => ( { ...souObj, n : couObj[ souObj.keyStr ] } ) ); // What: Source Segment Return. Why: BreBarCom needs each meta entry joined with its own live count under the n field. How: This spreads each SOU_MET_ARR entry, adding its own tallied count.


	}, [ picRowArr ] ); // What: Effect Dependency Array. Why: This only ever needs recomputing when the underlying pick rows themselves change. How: picRowArr is the sole source the tally loop above reads from.

	// Reminder type split + log list.
	const typSegArr = React.useMemo( () => { // What: Type Segment Array Memo. Why: The "By reminder type" card needs TYP_MET_ARR joined with each type's own live count. How: This tallies remRowArr's own type field, then maps TYP_MET_ARR to include each count.


		const couObj = { once : 0, recurring : 0 }; // What: Count Object. Why: The tally needs one accumulator field per real type value. How: This starts zeroed and is incremented by the loop below.

		for ( const rowObj of remRowArr ) if ( couObj[ rowObj.type ] !== undefined ) couObj[ rowObj.type ]++; // What: Type Tally Loop. Why: Every logged completion contributes one to whichever type it belongs to. How: This increments couObj's own matching field per row.

		return TYP_MET_ARR.map( ( typObj ) => ( { ...typObj, n : couObj[ typObj.keyStr ] } ) ); // What: Type Segment Return. Why: BreBarCom needs each meta entry joined with its own live count under the n field. How: This spreads each TYP_MET_ARR entry, adding its own tallied count.


	}, [ remRowArr ] ); // What: Effect Dependency Array. Why: This only ever needs recomputing when the underlying reminder rows themselves change. How: remRowArr is the sole source the tally loop above reads from.

	const remLogArr = React.useMemo( () => ( // What: Reminder Log Array Memo. Why: The "Reminders completed" summary card (All view) needs remRowArr sorted newest-first, independent of the breakdown card's own sort toggle. How: This sorts a copy of remRowArr descending by completedAt.


		remRowArr.slice().sort( ( aRowObj, bRowObj ) => ( aRowObj.completedAt < bRowObj.completedAt ? 1 : -1 ) )


	), [ remRowArr ] ); // What: Effect Dependency Array. Why: This only ever needs resorting when the underlying reminder rows themselves change. How: remRowArr is the sole source the sort above reads from.

	// "Reminders breakdown" card data. Per-reminder COMPLETION totals in
	// range (grouped by taskId, denormalized name/type). Includes long-
	// gone one-time reminders, since the log row persists after the task
	// is purged, so its history stays counted.
	const remComArr = React.useMemo( () => { // What: Reminder Completion Array Memo. Why: The Completions metric pivot needs one row per reminder with its own total completion count in range. How: This groups remRowArr by taskId, then sorts the grouped totals by remSorStr.


		if ( !isaRemBoo ) return []; // What: Scope Guard. Why: This grouping only matters while the Reminders scope is active. How: This returns an empty array otherwise.

		const totByIdMap = new Map(); // What: Total By Id Map. Why: Every completion needs filing under its own reminder before the totals can be sorted. How: This starts empty and is filled by the loop below.

		for ( const rowObj of remRowArr ) { // What: Completion Grouping Loop. Why: Every logged completion contributes one to its own reminder's running total. How: This looks up (or lazily creates) the reminder's own accumulator, then increments it.


			const remEntObj = totByIdMap.get( rowObj.taskId ) || { name : rowObj.name, type : rowObj.type, n : 0 }; // What: Reminder Entry Object. Why: A reminder's own accumulator might already exist from an earlier completion. How: This looks it up, or starts a fresh zeroed entry using the row's own denormalized name/type.

			remEntObj.n++; remEntObj.name = rowObj.name; remEntObj.type = rowObj.type; // What: Reminder Entry Update. Why: Every completion increments the total, and name/type are re-assigned each time in case they changed between log entries. How: This increments n and overwrites name/type from the current row.

			totByIdMap.set( rowObj.taskId, remEntObj ); // What: Reminder Entry Store. Why: The freshly-updated entry must be written back, since it may have just been created above. How: This sets the entry back under its own taskId key.


		}

		const sorDirNum = remSorStr === 'desc' ? -1 : 1; // What: Sort Direction Number. Why: The sort below needs a plain +1/-1 multiplier instead of re-checking the string per comparison. How: This is -1 for descending, 1 for ascending.

		return [ ...totByIdMap.values() ].sort( ( aRemObj, bRemObj ) => sorDirNum * ( aRemObj.n - bRemObj.n ) || aRemObj.name.localeCompare( bRemObj.name ) ); // What: Completion Totals Return. Why: This is the finished, sorted per-reminder completion list the Completions pivot renders. How: This sorts the grouped totals by n, tie-breaking alphabetically.


	}, [ isaRemBoo, remRowArr, remSorStr ] ); // What: Effect Dependency Array. Why: This list only ever needs rebuilding when the Reminders-scope flag, the underlying rows, or the sort direction changes. How: Each feeds one part of the grouping/sorting above.

	// Per-reminder SKIP totals in range (same shape).
	const remSkiArr = React.useMemo( () => { // What: Reminder Skip Array Memo. Why: The Skipped metric pivot needs one row per reminder with its own total skip count in range. How: This groups state.reminderSkipLog by taskId, then sorts the grouped totals by remSorStr.


		if ( !isaRemBoo ) return []; // What: Scope Guard. Why: This grouping only matters while the Reminders scope is active. How: This returns an empty array otherwise.

		const totByIdMap = new Map(); // What: Total By Id Map. Why: Every skip needs filing under its own reminder before the totals can be sorted. How: This starts empty and is filled by the loop below.

		for ( const rowObj of ( state.reminderSkipLog || [] ) ) { // What: Skip Grouping Loop. Why: Every logged skip contributes one to its own reminder's running total, subject to the same type/hidden/range rules as remRowArr. How: This filters non-matching rows, then increments the reminder's own accumulator.


			if ( !enaTypArr.includes( rowObj.type ) ) continue;                                       // What: Type Guard. Why: Only a skip whose own type opts into Stats should count. How: This skips any row whose type isn't in enaTypArr.
			if ( hidTasSet.has( rowObj.taskId ) ) continue;                                           // What: Hidden Task Guard. Why: A hidden task's own history must not surface in this count. How: This skips any row belonging to a hidden task.
			if ( cutIsoStr && dayIsoFun( new Date( rowObj.skippedAt ) ) < cutIsoStr ) continue;        // What: Range Guard. Why: Only a skip inside the active range should count. How: This skips any row whose own skippedAt converts to a day before cutIsoStr.

			const remEntObj = totByIdMap.get( rowObj.taskId ) || { name : rowObj.name, type : rowObj.type, n : 0 }; // What: Reminder Entry Object. Why: A reminder's own accumulator might already exist from an earlier skip. How: This looks it up, or starts a fresh zeroed entry using the row's own denormalized name/type.

			remEntObj.n++; remEntObj.name = rowObj.name; remEntObj.type = rowObj.type; // What: Reminder Entry Update. Why: Every skip increments the total, and name/type are re-assigned each time in case they changed between log entries. How: This increments n and overwrites name/type from the current row.

			totByIdMap.set( rowObj.taskId, remEntObj ); // What: Reminder Entry Store. Why: The freshly-updated entry must be written back, since it may have just been created above. How: This sets the entry back under its own taskId key.


		}

		const sorDirNum = remSorStr === 'desc' ? -1 : 1; // What: Sort Direction Number. Why: The sort below needs a plain +1/-1 multiplier instead of re-checking the string per comparison. How: This is -1 for descending, 1 for ascending.

		return [ ...totByIdMap.values() ].sort( ( aRemObj, bRemObj ) => sorDirNum * ( aRemObj.n - bRemObj.n ) || aRemObj.name.localeCompare( bRemObj.name ) ); // What: Skip Totals Return. Why: This is the finished, sorted per-reminder skip list the Skipped pivot renders. How: This sorts the grouped totals by n, tie-breaking alphabetically.


	}, [ isaRemBoo, state.reminderSkipLog, enaTypArr.join( ',' ), cutIsoStr, remSorStr, hidTasSet ] ); // What: Effect Dependency Array. Why: This list only ever needs rebuilding when the Reminders-scope flag, the raw skip log, the enabled types, the range cutoff, the sort direction, or the hidden-task set changes. How: Each feeds one part of the filter/grouping/sorting above.

	// Active list for the card + paging.
	const REM_SIZ_NUM = 10; // What: Reminder Size Number. Why: The Reminders breakdown card pages like Gmail, 10 rows at a time. How: This is passed straight through to PagNavCom as its own pagSizNum.

	// "Recent" is the chronological completion event log (one row per
	// check-off), sorted by the shared sort direction: desc = newest
	// first. Completions/Skipped are per-reminder aggregate counts: desc =
	// highest first.
	const remRecArr = React.useMemo( () => { // What: Reminder Recent Array Memo. Why: The Recent metric pivot needs the raw completion event log, not a grouped total, sorted by the shared direction toggle. How: This sorts a copy of remRowArr by completedAt, applying remSorStr's own direction.


		const sorDirNum = remSorStr === 'desc' ? -1 : 1; // What: Sort Direction Number. Why: The sort below needs a plain +1/-1 multiplier instead of re-checking the string per comparison. How: This is -1 for descending, 1 for ascending.

		return remRowArr.slice().sort( ( aRowObj, bRowObj ) =>
			( aRowObj.completedAt < bRowObj.completedAt ? -1 : aRowObj.completedAt > bRowObj.completedAt ? 1 : 0 ) * sorDirNum );


	}, [ remRowArr, remSorStr ] ); // What: Effect Dependency Array. Why: This only ever needs resorting when the underlying reminder rows or the sort direction changes. How: Both feed the sort comparator above.

	const remBreArr  = remMetStr === 'skipped' ? remSkiArr : remMetStr === 'completions' ? remComArr : remRecArr;            // What: Reminder Breakdown Array. Why: The card's own rendered list depends on which of the three metric pivots is active. How: This selects remSkiArr/remComArr/remRecArr by remMetStr.
	const remPagNum  = Math.max( 1, Math.ceil( remBreArr.length / REM_SIZ_NUM ) );                                         // What: Reminder Page Number. Why: PagNavCom needs the total page count to disable the next arrow on the last page. How: This divides remBreArr's own length by REM_SIZ_NUM, rounding up, floored at 1.
	const remSafNum  = Math.min( remIndNum, remPagNum - 1 );                                                                // What: Reminder Safe Number. Why: remIndNum can go stale if the underlying list shrinks (e.g. switching metric pivots), landing past the new last page. How: This clamps remIndNum down to the highest valid page index.
	const remIteArr  = remBreArr.slice( remSafNum * REM_SIZ_NUM, ( remSafNum + 1 ) * REM_SIZ_NUM );                        // What: Reminder Item Array. Why: Only the current page's own slice of remBreArr should actually render. How: This slices remBreArr from the safe page's own start to its own end.

	// Reset to page 1 whenever the metric, sort, scope, or range filter
	// changes.
	React.useEffect( () => { setRemIndNum( 0 ); }, [ remMetStr, remSorStr, scoValStr, cutIsoStr, enaTypArr.join( ',' ) ] ); // What: Reminder Page Reset Effect. Why: Changing what the card even shows should always land back on its own first page rather than an arbitrary stale one. How: This resets remIndNum to 0 whenever any of these five values changes.

	// Reminders summary card shown on the combined "All" view.
	const shoRemBoo = scoValStr === 'all' && remEnaBoo; // What: Show Reminder Boolean. Why: The "Reminders completed" summary card only belongs on the combined All view, and only while reminders are enabled at all. How: This checks both conditions together.

	// #endregion Source, Type, And Reminder Breakdown Data



	return (


		<div className='tab tab--stats'>{ /* What: Tab Div Element. Why: This is TabStats' own root element. How: This renders the help overlay, the header, and the scrollable filters/body wrapper below it. */ }


			<HelOveCom
				actModBoo={ helOnBoo }
				helIteArr={ STA_HEL_ARR }
				onCloAllFun={ helExiFun }
			/>{ /* What: Help Overlay Component. Why: Help mode needs its own dimmed tooltip layer above the real page. How: This renders active only while helOnBoo is true, fed this page's own STA_HEL_ARR copy. */ }

			<header className='stat-h'>{ /* What: Header Element. Why: This groups the page's own kicker/help toggle, brand mark, title, and subtitle. How: This renders as a semantic header landmark above the filters/body wrapper. */ }


				<div className='kicker-row'>{ /* What: Kicker Row Div Element. Why: The page's own kicker and help toggle sit side by side. How: This wraps the kicker span and the HelButCom. */ }


					<div className='kicker stat-h-kicker'>Stats</div>{ /* What: Kicker Div Element. Why: Every tab opens with a small labelled kicker naming the page. How: This renders the literal word "Stats". */ }

					<HelButCom
						actModBoo={ helOnBoo }
						onClick={ () => setHelOnBoo( ( preHelBoo ) => !preHelBoo ) }
					/>{ /* What: Help Button Component. Why: This page needs its own header toggle for entering/leaving help mode. How: This flips helOnBoo on click, reflecting its current state via actModBoo. */ }


				</div>

				<div className='stat-h-lead'>{ /* What: Lead Div Element. Why: The brand mark and the page title sit together as the header's own lead row. How: This wraps the brand button and the section-h title block. */ }


					<button
						type='button'
						className='brand-mark'
						aria-label='Ease My Life link to go to the Today page'
						onClick={ onHome }
					>{ /* What: Brand Button Element. Why: The logo mark also works as a shortcut back to the Today tab. How: This wraps the logo svg in a real button and calls onHome on click. */ }


						{ /* Same theme-wired logo as the Today header (currentColor ->
						    accent, grid lines -> accent-soft) so the two tabs read as
						    one product. */ }
						<svg
							viewBox='8 8 528 528'
							fill='none'
							aria-hidden='true'
						>{ /* What: Logo Svg Element. Why: This draws the small square "Ease My Life" logo mark. How: This is a fixed-viewBox icon composed of a grid, a rounded-square badge outline, and a clipped glyph path. */ }


							<defs>{ /* What: Clip Defs Element. Why: An SVG clipPath can only be applied via a defined, referenced id, not inline. How: This holds the one clipPath definition the glyph path below references. */ }


								<clipPath
									id='braMarCli--sta'
									clipPathUnits='userSpaceOnUse'
								>{ /* What: Badge Clippath Element. Why: The glyph path's own curves slightly overshoot the rounded-square badge and need to be masked to it. How: This defines a rounded-square clip region, referenced below via url(#braMarCli--sta). */ }


									<rect
										height='512'
										rx='75'
										ry='75'
										width='512'
										x='16'
										y='16'
									/>{ /* What: Clip Rect Element. Why: The clip region itself needs a concrete shape to clip to. How: This draws the rounded-square shape that the clipPath above exposes for reference. */ }


								</clipPath>


							</defs>

							<g
								style={{
									stroke      : 'var(--accent-soft)',
									strokeWidth : 16
								}}
							>{ /* What: Grid Group Element. Why: Groups the 8 decorative background lines so they can share one stroke style instead of repeating it 8 times. How: This sets the shared stroke/strokeWidth once, applied to every child path below. */ }


								<path d='M 528 112 L 16 112' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight segment; its siblings below draw the rest of the grid. */ }
								<path d='M 216 528 L 216 16' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight segment; its siblings draw the rest of the grid. */ }
								<path d='M 320 528 L 320 16' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight segment; its siblings draw the rest of the grid. */ }
								<path d='M 424 528 L 424 16' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight segment; its siblings draw the rest of the grid. */ }
								<path d='M 112 528 L 112 16' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight segment; its siblings draw the rest of the grid. */ }
								<path d='M 528 216 L 16 216' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight segment; its siblings draw the rest of the grid. */ }
								<path d='M 528 320 L 16 320' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight segment; its siblings draw the rest of the grid. */ }
								<path d='M 528 424 L 16 424' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight segment, completing the grid. */ }


							</g>

							<rect
								height='512'
								rx='75'
								ry='75'
								width='512'
								x='16'
								y='16'
								style={{
									stroke         : 'currentColor',
									strokeLinecap  : 'round',
									strokeLinejoin : 'round',
									strokeWidth    : 16
								}}
							/>{ /* What: Badge Rect Element. Why: The logo needs a visible rounded-square border/badge behind the glyph. How: This draws the same rounded-square shape as the clip rect above, but stroked and visible instead of hidden in defs. */ }

							<path
								d='M 24.467 527.792 C 67.266 416.298 77.088 228.913 172.207 434.412 C 200.739 535.77 262.562 434.412 314.873 292.51 C 381.45 120.201 450.381 44.636 528.854 24.365 C 521.725 22.337 512.215 24.365 493.193 34.5 C 369.548 105.451 295.85 292.51 234.029 363.461 C 186.473 414.14 167.451 241.831 124.651 262.102 C 101.828 270.008 60.133 375.754 24.467 527.792 Z'
								strokeWidth='8'
								strokeLinecap='round'
								strokeLinejoin='round'
								clipPath='url(#braMarCli--sta)'
								style={{ fill : 'currentColor', stroke : 'currentColor' }}
							/>{ /* What: Glyph Path Element. Why: This is the actual squiggly "Ease My Life" brand glyph drawn inside the badge. How: This path is clipped to the rounded-square badge so its curves never spill outside it. */ }


						</svg>


					</button>

					<div className='section-h'>{ /* What: Section Header Div Element. Why: The page's own title needs a dedicated wrapper matching every other tab's header layout. How: This wraps the single h1 title below. */ }


						<h1 className='section-title'>Your <span className='stat-title-accent'>eased</span> life, according to the numbers.</h1>{ /* What: Section Title Element. Why: Every tab needs its own large page title. How: This renders the page's own title text with one accented span. */ }


					</div>


				</div>

				<p className='section-sub stat-h-sub'>{ /* What: Section Subtitle Element. Why: The page needs a short explanatory subtitle beneath its title, including a link to the Data page. How: This renders that explanatory copy with an inline button jumping to the Data tab. */ }

					Filter by group, conditionals, reminders, pickers, and time below. This page is best used in conjunction with the{ ' ' }
					<button
						type='button'
						className='sub-tablink'
						onClick={ () => onNavTab && onNavTab( 'data' ) }
					>Data page</button>{ /* What: Sub Tablink Button Element. Why: The subtitle's own explanation needs a working shortcut to the Data tab. How: This calls onNavTab with 'data' when clicked, guarding against a missing onNavTab prop. */ }
					{ ' ' }, so that you can view the statistics here in order to see if your created items' numbers line up with your expectations and then tweak them in the Data page if they do not.

				</p>


			</header>

			<div
				className='stat-body-wrap'
				style={ touCtxObj.reserveTop ? { paddingTop : touCtxObj.reserveTop } : undefined }
			>{ /* What: Body Wrap Div Element. Why: The Welcome Tour's own reserved top space applies to the whole scrollable filters/body area together. How: This applies touCtxObj.reserveTop as top padding when it's non-zero. */ }


				<div className='stat-filters ob-stat-content'>{ /* What: Filters Div Element. Why: This groups every filter row together above the scope-dependent body cards. How: This renders the Group, Type, Show, and Range rows in that fixed order. */ }


					{ exiGroArr.length > 1 && ( // What: Group Row Visibility Check. Why: A Group filter row is pointless with zero or one group in use. How: This renders the row only while more than one distinct group exists.


						<div className='stat-filter-row'>{ /* What: Group Filter Row Div Element. Why: The Group label and its own pill list are grouped as one row. How: This wraps the "Group" label span and the picker-groups pill list. */ }


							<span className='stat-filter-lbl'>Group</span>{ /* What: Group Label Span Element. Why: The row needs its own visible label naming what it filters. How: This renders the literal word "Group". */ }

							<div
								className='picker-groups stat-scope-groups'
								ref={ groRowRef }
								role='tablist'
								aria-label='Filter pickers by group'
							>{ /* What: Group Pill List Div Element. Why: This is the actual scrollable row of Group filter pills. How: This renders an "All" pill first, then one pill per exiGroArr entry. */ }


								<button
									type='button'
									role='tab'
									aria-selected={ staGroStr === 'all' }
									className={ `picker-group-pill ${ staGroStr === 'all' ? 'is-on' : '' }` }
									onClick={ () => { setStaGroStr( 'all' ); setScoValStr( 'all' ); } }
								>{ /* What: All Group Pill Button Element. Why: The user needs a way back to seeing every group at once. How: This resets both staGroStr and scoValStr to 'all' when clicked. */ }

									All
									<span className='picker-group-count'>{ picLisArr.filter( ( picObj ) => !picObj.hidden ).length }</span>{ /* What: Group Count Span Element. Why: The All pill needs its own total picker count. How: This counts every non-hidden picker regardless of group. */ }

								</button>

								{ exiGroArr.map( ( groStr ) => ( // What: Group Pill Render. Why: Every distinct group needs its own selectable pill. How: This maps exiGroArr to one button per group name.


									<button
										key={ groStr }
										type='button'
										role='tab'
										aria-selected={ staGroStr === groStr }
										className={ `picker-group-pill ${ staGroStr === groStr ? 'is-on' : '' }` }
										onClick={ () => setStaGroStr( groStr ) }
									>{ /* What: Group Pill Button Element. Why: The user needs a way to narrow the Show row down to just this one group. How: This sets staGroStr to this pill's own group name when clicked. */ }

										{ groStr }
										<span className='picker-group-count'>{ picLisArr.filter( ( picObj ) => picObj.group === groStr && !picObj.hidden ).length }</span>{ /* What: Group Count Span Element. Why: This pill needs its own picker count for this specific group. How: This counts every non-hidden picker whose own group matches groStr. */ }

									</button>


								))}


							</div>


						</div>


					) }

					{ ( exiModArr.length > 1 || hasConBoo || remEnaBoo ) && ( // What: Type Row Visibility Check. Why: A Type filter row is pointless with only one mode in use and neither Conditionals nor Reminders available. How: This renders the row only while at least one of those three conditions holds.


						<div className='stat-filter-row'>{ /* What: Type Filter Row Div Element. Why: The Type label and its own pill list are grouped as one row. How: This wraps the "Type" label span and the picker-groups pill list. */ }


							<span className='stat-filter-lbl'>Type</span>{ /* What: Type Label Span Element. Why: The row needs its own visible label naming what it filters. How: This renders the literal word "Type". */ }

							<div
								className='picker-groups stat-scope-groups stat-scope-groups--type'
								ref={ typRowRef }
								role='tablist'
								aria-label='Filter pickers by type'
							>{ /* What: Type Pill List Div Element. Why: This is the actual scrollable row of Type filter pills. How: This renders an "All" pill first, then every mode/Conditionals/Reminders pill sorted alphabetically by name. */ }


								<button
									type='button'
									role='tab'
									aria-selected={ typFilStr === 'all' }
									className={ `picker-group-pill ${ typFilStr === 'all' ? 'is-on' : '' }` }
									onClick={ () => { setTypFilStr( 'all' ); setScoValStr( 'all' ); } }
								>{ /* What: All Type Pill Button Element. Why: The user needs a way back to seeing every mode/Conditionals/Reminders at once. How: This resets both typFilStr and scoValStr to 'all' when clicked. */ }

									All
									<span className='picker-group-count'>{ picLisArr.filter( ( picObj ) => !picObj.hidden ).length }</span>{ /* What: Type Count Span Element. Why: The All pill needs its own total picker count. How: This counts every non-hidden picker regardless of mode. */ }

								</button>

								{ /* Conditionals/Reminders sort in alphabetically alongside
								    the real modes, rather than being pinned, so they're easy
								    to find now that both this rail and the Show rail below
								    sort that way. typFilStr doubles as their own scope value
								    ('conditionals' / 'reminders', not a real picker mode) so
								    the Show row below can narrow to just that one card
								    instead of the full "All" list, visPicArr's own mode
								    match naturally excludes every real picker under either
								    value, same as any other empty mode. */ }
								{ [

									...exiModArr.map( ( picModStr ) => ( { // What: Mode Entry Mapping. Why: Every real mode in use needs its own pill entry with a matching count/click handler before the combined list is sorted. How: This maps each exiModArr entry to a small { key, name, count, isOn, onClick } shape.


										count   : picLisArr.filter( ( picObj ) => picObj.mode === picModStr && !picObj.hidden ).length,
										isOn    : typFilStr === picModStr,
										key     : picModStr,
										name    : SED_NAM_OBJ.MOD_DEF_OBJ[ picModStr ].label,
										onClick : () => setTypFilStr( picModStr )


									})),

									...( hasConBoo ? [ { // What: Conditionals Entry Array. Why: The Conditionals sentinel pill only belongs in the list at all once at least one conditional exists. How: This is a one-entry array (or empty) spread into the combined list below.


										count   : conDefArr.length,
										isOn    : typFilStr === 'conditionals',
										key     : 'conditionals',
										name    : 'Conditionals',
										onClick : () => { setTypFilStr( 'conditionals' ); setScoValStr( 'conditionals' ); }


									} ] : [] ),

									...( remEnaBoo ? [ { // What: Reminders Entry Array. Why: The Reminders sentinel pill only belongs in the list at all once at least one reminder type is enabled. How: This is a one-entry array (or empty) spread into the combined list below.


										count   : ( state.tasks || [] ).filter( ( tasObj ) => !tasObj.hidden ).length,
										isOn    : typFilStr === 'reminders',
										key     : 'reminders',
										name    : 'Reminders',
										onClick : () => { setTypFilStr( 'reminders' ); setScoValStr( 'reminders' ); }


									} ] : [] )


								]
									.sort( ( aEntObj, bEntObj ) => aEntObj.name.localeCompare( bEntObj.name ) )
									.map( ( entObj ) => ( // What: Type Pill Render. Why: The combined, sorted list of modes plus Conditionals/Reminders needs one button per entry. How: This maps the sorted array to one button, styled/keyed by each entry's own fields.


										<button
											key={ entObj.key }
											type='button'
											role='tab'
											aria-selected={ entObj.isOn }
											className={ `picker-group-pill ${ entObj.isOn ? 'is-on' : '' }` }
											onClick={ entObj.onClick }
										>{ /* What: Type Pill Button Element. Why: The user needs a way to narrow both the Type filter and (for the two sentinels) the scope itself down to this one entry. How: This calls the entry's own onClick, already closing over whichever behavior it needs. */ }

											{ entObj.name }
											<span className='picker-group-count'>{ entObj.count }</span>{ /* What: Type Count Span Element. Why: This pill needs its own picker/conditional/reminder count. How: This renders the entry's own precomputed count field. */ }

										</button>


									))}


							</div>


						</div>


					) }

					<div className='stat-filter-row'>{ /* What: Show Filter Row Div Element. Why: The Show label and its own scope-tab list are grouped as one row. How: This wraps the "Show" label span and the picker-tabs scope list. */ }


						<span className='stat-filter-lbl'>Show</span>{ /* What: Show Label Span Element. Why: The row needs its own visible label naming what it selects. How: This renders the literal word "Show". */ }

						<div
							className='picker-tabs stat-scope-tabs'
							ref={ scpRowRef }
							key={ staGroStr + '|' + typFilStr }
						>{ /* What: Show Tab List Div Element. Why: This is the actual scrollable row of scope tabs (All, Conditionals, Reminders, and every visible picker). How: This remounts (replaying its own enter animation) whenever the Group/Type filter pair changes. */ }


							{ staGroStr === 'all' && typFilStr === 'all' && ( // What: All Tab Visibility Check. Why: The "All" scope tab only makes sense while neither the Group nor Type filter has narrowed the view. How: This renders the All tab only while both filters are still 'all'.


								<button
									type='button'
									className={ `picker-tab picker-tab--enter ${ scoValStr === 'all' ? 'is-on' : '' }` }
									style={{ animationDelay : '0ms' }}
									onClick={ () => setScoValStr( 'all' ) }
								>{ /* What: All Scope Tab Button Element. Why: The user needs a way back to the combined, everything-at-once dashboard. How: This sets scoValStr to 'all' when clicked. */ }

									<span className='picker-tab-name'>All</span>{ /* What: Tab Name Span Element. Why: Every scope tab needs its own visible name. How: This renders the literal word "All". */ }
									<span className='picker-tab-mode'>Everything</span>{ /* What: Tab Mode Span Element. Why: Every scope tab needs a small descriptive subline under its name. How: This renders the literal word "Everything". */ }

								</button>


							) }

							{ /* Everything after "All", Conditionals, Reminders, and
							    every visible picker, sorts together alphabetically by
							    its own displayed name, rather than Conditionals/
							    Reminders being pinned right after All. typFilStr
							    'conditionals'/'reminders' (set by their own Type-rail
							    pill) narrows this down to just that one card, same as
							    any real group/type narrows to its own pickers. */ }
							{ [

								...( ( typFilStr === 'all' || typFilStr === 'conditionals' ) && hasConBoo // What: Conditionals Tab Entry Array. Why: The Conditionals scope tab only belongs in the list while it's reachable from the current Type filter and at least one conditional exists. How: This is a one-entry array (or empty) spread into the combined list below.
									? [ { key : 'conditionals', name : 'Conditionals', modeLabel : 'Gates', isOn : isaConBoo, onClick : () => setScoValStr( 'conditionals' ) } ]
									: [] ),

								...( ( typFilStr === 'all' || typFilStr === 'reminders' ) && remEnaBoo // What: Reminders Tab Entry Array. Why: The Reminders scope tab only belongs in the list while it's reachable from the current Type filter and reminders are enabled at all. How: This is a one-entry array (or empty) spread into the combined list below.
									? [ { key : 'reminders', name : 'Reminders', modeLabel : 'Tasks', isOn : isaRemBoo, onClick : () => setScoValStr( 'reminders' ) } ]
									: [] ),

								...visPicArr.map( ( picObj ) => ( { key : picObj.id, name : picObj.name, modeLabel : SED_NAM_OBJ.MOD_DEF_OBJ[ picObj.mode ].label, isOn : scoValStr === picObj.id, onClick : () => setScoValStr( picObj.id ), pickerId : picObj.id } ) ) // What: Picker Tab Entry Mapping. Why: Every currently-visible picker needs its own scope tab entry before the combined list is sorted. How: This maps each visPicArr entry to a small { key, name, modeLabel, isOn, onClick, pickerId } shape.


							]
								.sort( ( aEntObj, bEntObj ) => aEntObj.name.localeCompare( bEntObj.name ) )
								.map( ( entObj, entIndNum ) => ( // What: Scope Tab Render. Why: The combined, sorted list of Conditionals/Reminders/pickers needs one button per entry, staggered by its own position. How: This maps the sorted array to one button, each with its own animation delay based on entIndNum.


									<button
										key={ entObj.key }
										data-picker-id={ entObj.pickerId }
										type='button'
										className={ `picker-tab picker-tab--enter ${ entObj.isOn ? 'is-on' : '' }` }
										style={{ animationDelay : ( entIndNum + 1 ) * 40 + 'ms' }}
										onClick={ entObj.onClick }
									>{ /* What: Scope Tab Button Element. Why: The user needs a way to switch the whole page over to this specific Conditionals/Reminders/picker scope. How: This calls the entry's own onClick when clicked. */ }

										<span className='picker-tab-name'>{ entObj.name }</span>{ /* What: Tab Name Span Element. Why: Every scope tab needs its own visible name. How: This renders the entry's own name field. */ }
										<span className='picker-tab-mode'>{ entObj.modeLabel }</span>{ /* What: Tab Mode Span Element. Why: Every scope tab needs a small descriptive subline under its name. How: This renders the entry's own modeLabel field. */ }

									</button>


								))}


						</div>


					</div>

					<div className='stat-filter-row'>{ /* What: Range Filter Row Div Element. Why: The Range label and its own pill list are grouped as one row. How: This wraps the "Range" label span and the stat-filter-pills list. */ }


						<span className='stat-filter-lbl'>Range</span>{ /* What: Range Label Span Element. Why: The row needs its own visible label naming what it filters. How: This renders the literal word "Range". */ }

						<div
							className='stat-filter-pills stat-filter-pills--seg'
							ref={ ranRowRef }
						>{ /* What: Range Pill List Div Element. Why: This is the actual scrollable row of Range filter pills. How: This renders one pill per STA_RAN_ARR entry. */ }


							{ STA_RAN_ARR.map( ( rngObj ) => ( // What: Range Pill Render. Why: Every configured lookback window needs its own selectable pill. How: This maps STA_RAN_ARR to one button per range.


								<button
									key={ rngObj.keyStr }
									type='button'
									className={ `stat-pill ${ ranValStr === rngObj.keyStr ? 'is-on' : '' }` }
									onClick={ () => setRanValStr( rngObj.keyStr ) }
								>{ /* What: Range Pill Button Element. Why: The user needs a way to switch the whole page over to this specific lookback window. How: This sets ranValStr to this pill's own keyStr when clicked. */ }{ rngObj.labStr }</button>


							))}


						</div>


					</div>


				</div>

				<div
					className='tab-fade stat-body ob-stat-content'
					key={ scoValStr + '|' + ranValStr }
				>{ /* What: Body Div Element. Why: This groups every scope-dependent card below the filter rows, remounting (and replaying its own fade) whenever the scope or range changes. How: This renders the single-picker header, the Conditionals/headline/heatmap blocks, and every remaining card in a fixed order. */ }


					{ /* Picker identity (single-picker scope), mirrors the
					    Pickers page header: "Picker" kicker, then name, then
					    the mode pill below it, then the mode's own
					    description. */ }
					{ isaPicBoo && scpPicObj && ( // What: Picker Identity Visibility Check. Why: This header block only makes sense while a single real picker is the active scope. How: This renders it only while isaPicBoo is true and scpPicObj actually resolved.


						<div className='stat-picker-id'>{ /* What: Picker Identity Div Element. Why: This groups the scoped picker's own kicker, name, mode pill, and hint text. How: This wraps those four pieces in a fixed order. */ }


							<span className='kicker'>Picker</span>{ /* What: Picker Kicker Span Element. Why: This block needs its own small label naming what it identifies. How: This renders the literal word "Picker". */ }



							<h2 className='picker-title'>{ scpPicObj.name }</h2>{ /* What: Picker Title Element. Why: The scoped picker's own name is the headline of this identity block. How: This renders scpPicObj.name. */ }
							<PilTagCom tone='mode'>{ ( SED_NAM_OBJ.MOD_DEF_OBJ[ scpPicObj.mode ] || {} ).label || scpPicObj.mode }</PilTagCom>{ /* What: Pill Tag Component. Why: The scoped picker's own mode needs a small labelled pill under its name. How: This renders that mode's own SED_NAM_OBJ.MOD_DEF_OBJ label, falling back to the raw mode key. */ }

							{ ( () => { // What: Mode Hint Render. Why: A mode's own hint text can be either a single paragraph or several, and each needs wrapping in its own paragraph element. How: This reads the mode's own hint field and maps an array into one <p> per paragraph, or wraps a plain string in one.


								const modHntVal = ( SED_NAM_OBJ.MOD_DEF_OBJ[ scpPicObj.mode ] || {} ).hint; // What: Mode Hint Value. Why: The render below needs this looked up once rather than twice. How: This reads the scoped picker's own mode's hint field, which may be a string or an array of strings.

								return Array.isArray( modHntVal )
									? modHntVal.map( ( parStr, parIndNum ) => <p key={ parIndNum } className='picker-hint'>{ parStr }</p> )
									: <p className='picker-hint'>{ modHntVal }</p>;


							})() }


						</div>


					) }

					{ /* Conditionals scope body. */ }
					{ isaConBoo && ( () => { // What: Conditionals Body Visibility Check. Why: This entire block only renders while the Conditionals scope is active. How: This IIFE computes two small local formatters once, then returns the headline cards and breakdown list together.


						const conDayFun  = ( datIsoStr ) => new Date( datIsoStr + 'T00:00:00' ).toLocaleDateString( undefined, { month : 'short', day : 'numeric' } ); // What: Format Conditional Day Function. Why: Both the headline "last fired" card and the breakdown's own Last Fired column need the same short date label. How: This formats an ISO date string as a locale "month day" label.

						return (


							<React.Fragment>{ /* What: Conditionals Fragment Element. Why: This groups the headline row and the breakdown card without adding an extra DOM wrapper of its own. How: This wraps those two sibling blocks. */ }


								<div className='stat-row'>{ /* What: Conditional Headline Row Div Element. Why: The four Conditionals headline numbers share the same row layout as every other scope's own headline cards. How: This renders one CarSurCom per headline number. */ }


									<CarSurCom className='stat-card stat-mk-condfired'>{ /* What: Card Surface Component. Why: Every headline number shares the same card chrome. How: This wraps the "triggered" total. */ }

										<div className='stat-num'>{ conTotObj.fired }</div>{ /* What: Stat Number Div Element. Why: The headline card needs its own large number. How: This renders conTotObj.fired. */ }
										<div className='stat-lbl'>triggered</div>{ /* What: Stat Label Div Element. Why: The headline number needs its own caption beneath it. How: This renders the literal word "triggered". */ }

									</CarSurCom>

									<CarSurCom className='stat-card stat-mk-condcycles'>{ /* What: Card Surface Component. Why: Every headline number shares the same card chrome. How: This wraps the "cycles" total. */ }

										<div className='stat-num'>{ conTotObj.total }</div>{ /* What: Stat Number Div Element. Why: The headline card needs its own large number. How: This renders conTotObj.total. */ }
										<div className='stat-lbl'>cycles</div>{ /* What: Stat Label Div Element. Why: The headline number needs its own caption beneath it. How: This renders the literal word "cycles". */ }

									</CarSurCom>

									<CarSurCom className='stat-card stat-mk-condrate'>{ /* What: Card Surface Component. Why: Every headline number shares the same card chrome. How: This wraps the "fire rate" percentage. */ }

										<div className='stat-num'>{ conTotObj.rate }%</div>{ /* What: Stat Number Div Element. Why: The headline card needs its own large number. How: This renders conTotObj.rate as a percentage. */ }
										<div className='stat-lbl'>fire rate</div>{ /* What: Stat Label Div Element. Why: The headline number needs its own caption beneath it. How: This renders the literal words "fire rate". */ }

									</CarSurCom>

									<CarSurCom className='stat-card stat-mk-condlast'>{ /* What: Card Surface Component. Why: Every headline number shares the same card chrome. How: This wraps the "last fired" date. */ }

										<div className='stat-num'>{ conTotObj.lastFired ? conDayFun( conTotObj.lastFired ) : '—' }</div>{ /* What: Stat Number Div Element. Why: The headline card needs its own large value, or a placeholder glyph when nothing has ever fired. How: This formats conTotObj.lastFired, or renders the em-dash placeholder glyph when it's null. */ }
										<div className='stat-lbl'>last fired</div>{ /* What: Stat Label Div Element. Why: The headline number needs its own caption beneath it. How: This renders the literal words "last fired". */ }

									</CarSurCom>


								</div>

								<CarSurCom className='stat-mk-condbreakdown'>{ /* What: Card Surface Component. Why: The Conditionals breakdown list shares the same card chrome as every other breakdown card. How: This wraps the sort header, metric pill row, explanatory note, and the list itself. */ }


									<div className='rank-head'>{ /* What: Rank Head Div Element. Why: The breakdown's own kicker and sort toggle sit together in one row. How: This wraps the kicker div and the sort button. */ }


										<div className='kicker'>Conditionals breakdown</div>{ /* What: Kicker Div Element. Why: This card needs its own small labelled kicker. How: This renders the literal words "Conditionals breakdown". */ }

										<button
											type='button'
											className='rank-sort'
											onClick={ () => setConSorStr( ( preDirStr ) => ( preDirStr === 'desc' ? 'asc' : 'desc' ) ) }
										>{ /* What: Sort Toggle Button Element. Why: The user needs a way to flip the breakdown list's own sort direction. How: This flips conSorStr between 'desc' and 'asc' when clicked. */ }

											{ conSorStr === 'desc' ? 'High → Low' : 'Low → High' }
											<IcoSvgCom name={ conSorStr === 'desc' ? 'arrow_down' : 'arrow_up' } size={ 13 } />{ /* What: Icon Svg Component. Why: The sort button needs a small directional glyph matching its own current direction. How: This renders the arrow_down/arrow_up icon based on conSorStr. */ }

										</button>


									</div>

									<div
										className='bd-metrics'
										ref={ conRowRef }
									>{ /* What: Metric Pill Row Div Element. Why: The user needs a way to pivot the breakdown list across five different metrics. How: This renders one pill per entry in the inline metric-label list below. */ }


										{ [ [ 'rate', 'Fire Rate' ], [ 'triggers', 'Triggers' ], [ 'cycles', 'Cycles' ], [ 'interval', 'Interval' ], [ 'last', 'Last Fired' ] ].map( ( [ conKeyStr, conLabStr ] ) => ( // What: Metric Pill Render. Why: Every one of the five available metrics needs its own selectable pill. How: This maps the inline [key, label] pair list to one button per metric.


											<button
												key={ conKeyStr }
												type='button'
												className={ `bd-metric ${ conMetStr === conKeyStr ? 'is-on' : '' }` }
												onClick={ () => setConMetStr( conKeyStr ) }
											>{ /* What: Metric Pill Button Element. Why: The user needs a way to switch the breakdown list over to this specific metric. How: This sets conMetStr to this pill's own key when clicked. */ }

												{ conLabStr }

											</button>


										))}


									</div>

									<p className='rank-note'>{ /* What: Rank Note Paragraph Element. Why: The active metric needs a short explanation of what it actually measures. How: This renders one of five explanatory sentences, chosen by conMetStr. */ }

										{ conMetStr === 'rate'
											? `How often each conditional fired versus the cycles it was actually evaluated over ${ ranNouStr }. A cycle only counts once a dependent item or the replacement card is completed.`
											: conMetStr === 'triggers'
											? `Number of cycles each conditional fired (suppressed its picker) over ${ ranNouStr }.`
											: conMetStr === 'cycles'
											? `Number of completed cycles each conditional was evaluated over ${ ranNouStr }.`
											: conMetStr === 'interval'
											? 'Average number of days between subsequent triggers.'
											: 'When each conditional last fired.' }

									</p>

									{ conBreArr.length ? ( // What: Conditional List Visibility Check. Why: An empty breakdown needs its own message instead of a bare empty list. How: This renders the real list only while conBreArr has at least one row.


										<ul
											className={ `rank rank--breakdown bd-list-fade ${ ( conMetStr === 'interval' || conMetStr === 'last' ) ? 'rank--freq' : '' }` }
											key={ conMetStr + conSorStr }
										>{ /* What: Conditional List Element. Why: This is the actual rendered breakdown list, remounting (and replaying its own fade) whenever the metric or sort changes. How: This maps conBreArr to one list item per conditional. */ }


											{ conBreArr.map( ( conRowObj ) => { // What: Conditional Row Render. Why: Every conditional in the breakdown needs its own list item showing its name, mode-intrinsic target, and the active metric's own value. How: This computes that row's own target suffix, then returns the list item.


												// Mode-intrinsic "target" (what you configured), shown as
												// a suffix under the name like the Pickers breakdown
												// does. Probability modes show a trigger %; ease modes
												// show an interval band.
												const conTarStr = conRowObj.deleted ? null // What: Conditional Target String. Why: Every non-deleted conditional's own configured target is worth surfacing alongside its measured rate. How: This branches on the conditional's own mode to phrase either a percentage or a day-band string.
													: conRowObj.mode === 'random' ? 'set 50%'
													: conRowObj.mode === 'weighted' ? `set ${ conRowObj.oddsPct }%`
													: conRowObj.mode === 'dynamic' ? `from ${ conRowObj.oddsPct }%`
													: ( () => { // What: Ease Mode Target Resolver. Why: An ease-mode conditional has no single percentage, so its own target is phrased as a day band instead. How: This computes the soonest/latest day band from the conditional's own easeMin/easeMax, the same drift math the picker breakdown uses.


														const soonDayNum = Math.max( 1, Math.round( 100 / ( conRowObj.easeMax || 1 ) ) ); // What: Soonest Day Number. Why: The fastest a full drift cycle can complete is governed by the larger (max) drift value. How: This divides the fixed threshold by easeMax, floored at 1 day.
														const lateDayNum = Math.max( 1, Math.round( 100 / ( conRowObj.easeMin || 1 ) ) ); // What: Latest Day Number. Why: The slowest a full drift cycle can complete is governed by the smaller (min) drift value. How: This divides the fixed threshold by easeMin, floored at 1 day.

														return `target ${ soonDayNum }–${ lateDayNum }d`; // What: Ease Target Return. Why: This is the finished "target X-Yd" string rendered under the conditional's own name. How: This joins the two computed bounds with an en dash and a literal "d" unit suffix.


													})();

												return (


													<li
														key={ conRowObj.id }
														className={ conRowObj.deleted ? 'is-deleted' : '' }
													>{ /* What: Conditional List Item Element. Why: Every conditional needs its own row grouping its name/target on one side and its metric value on the other. How: This renders the rank-name block and the cnd-bd-vals block as two siblings. */ }


														<span className='rank-name'>{ /* What: Rank Name Span Element. Why: The conditional's own name, deleted tag, and target suffix are grouped together. How: This wraps the name row and the optional target meta span. */ }


															<span className='rank-name-row'>{ /* What: Rank Name Row Span Element. Why: The name text and an optional "deleted" tag sit side by side. How: This wraps the name text span and the conditional deleted tag. */ }

																<span className='rank-name-text'>{ conRowObj.name }</span>{ /* What: Rank Name Text Span Element. Why: The row needs its own visible conditional name. How: This renders conRowObj.name. */ }
																{ conRowObj.deleted && <span className='rank-tag rank-tag--deleted'>deleted</span> }{ /* What: Deleted Tag Check. Why: A since-deleted conditional's own row must be visibly flagged. How: This renders a small "deleted" tag only while conRowObj.deleted is true. */ }

															</span>

															{ conTarStr && <span className='rank-meta'>{ conTarStr }</span> }{ /* What: Target Meta Check. Why: A deleted conditional has no configured target left to show. How: This renders the computed conTarStr under the name only while it's non-null. */ }


														</span>

														<span className='cnd-bd-vals'>{ /* What: Conditional Values Span Element. Why: The row's own inactive tag and metric-specific value sit together on the opposite side from the name. How: This wraps the inactive tag, the mode tag, and whichever metric-specific value block matches conMetStr. */ }


															{ !conRowObj.deleted && conRowObj.active === false && <span className='rank-tag'>inactive</span> }{ /* What: Inactive Tag Check. Why: A live but currently-disabled conditional needs its own visible flag. How: This renders a small "inactive" tag only for a non-deleted conditional whose own active field is false. */ }
															<span className='rem-log-type'>{ ( conRowObj.mode || '' ).replace( '-', '‑' ) }</span>{ /* What: Mode Tag Span Element. Why: Every row needs its own small mode label. How: This renders the conditional's own mode, with a non-breaking hyphen swapped in for a literal hyphen. */ }

															{ conMetStr === 'rate' && ( // What: Rate Value Check. Why: The rate-specific percentage/fraction display only belongs on this one metric. How: This renders it only while conMetStr is 'rate'.


																<span className='rank-vals'>{ /* What: Rank Values Span Element. Why: The rate metric shows both a percentage and a raw fraction together. How: This wraps the percent span and the fraction span. */ }

																	<span className='rank-pct'>{ conRowObj.rate == null ? '—' : conRowObj.rate + '%' }</span>{ /* What: Rank Percent Span Element. Why: The rate metric's own headline value is a percentage, or a placeholder glyph when there's no rate at all. How: This renders conRowObj.rate as a percentage, or the em-dash placeholder when it's null. */ }
																	<span className='rank-frac'>{ conRowObj.fired } / { conRowObj.total }</span>{ /* What: Rank Fraction Span Element. Why: The rate metric's own supporting detail is the raw fired/total fraction. How: This renders conRowObj.fired and conRowObj.total joined by a slash. */ }

																</span>


															) }

															{ conMetStr === 'triggers' && <span className='rank-metric-n'>{ conRowObj.fired }</span> }{ /* What: Triggers Value Check. Why: The triggers metric shows a single raw count. How: This renders conRowObj.fired only while conMetStr is 'triggers'. */ }
															{ conMetStr === 'cycles' && <span className='rank-metric-n'>{ conRowObj.total }</span> }{ /* What: Cycles Value Check. Why: The cycles metric shows a single raw count. How: This renders conRowObj.total only while conMetStr is 'cycles'. */ }

															{ conMetStr === 'interval' && ( // What: Interval Value Check. Why: The interval metric's own value/placeholder display only belongs on this one metric. How: This renders it only while conMetStr is 'interval'.

																conRowObj.aveInterval != null
																	? <span className='rank-freq-val cnd-bd-freq--interval'>every { conRowObj.aveInterval } { conRowObj.aveInterval === 1 ? 'day' : 'days' }</span>
																	: <span className='rank-freq-val cnd-bd-freq--interval is-dim'>{ conRowObj.fired <= 1 ? 'Fired Once' : 'Not Fired' }</span>

															) }

															{ conMetStr === 'last' && ( // What: Last Value Check. Why: The last-fired metric's own value/placeholder display only belongs on this one metric. How: This renders it only while conMetStr is 'last'.

																conRowObj.lastFired
																	? <span className='rank-freq-val cnd-bd-freq--last'>{ conDayFun( conRowObj.lastFired ) }</span>
																	: <span className='rank-freq-val cnd-bd-freq--last is-dim'>Never</span>

															) }


														</span>


													</li>


												);

											})}


										</ul>


									) : <div className='stat-empty'>No conditional activity in { ranNouStr } yet.</div> }{ /* What: Conditional Empty State Div Element. Why: An empty breakdown needs to explain why the list is missing instead of showing nothing at all. How: This renders only while conBreArr is empty. */ }


								</CarSurCom>


							</React.Fragment>


						);

					})() }

					{ /* Headline numbers. */ }
					{ !isaConBoo && ( // What: Headline Row Visibility Check. Why: The Conditionals scope has its own dedicated headline row above, so this generic one only belongs on every other scope. How: This renders it only while isaConBoo is false.


						<div className='stat-row'>{ /* What: Headline Row Div Element. Why: Every non-Conditionals scope shows 4 headline cards in one row. How: This renders either the Reminders-shaped set or the pick-shaped set, based on isaRemBoo. */ }


							{ /* stat-mk-* are dedicated, zero-styling selector
							    hooks for help mode (same idea as day-log.jsx's
							    dl-mk-* classes), since every headline card here
							    shares the plain .stat-card class with no other
							    way to address one specifically. */ }
							{ isaRemBoo ? ( // What: Reminders Headline Check. Why: The Reminders scope's own headline cards are shaped differently from a pick-based scope's. How: This renders the Reminders-shaped set while isaRemBoo is true, the pick-shaped set otherwise.


								<React.Fragment>{ /* What: Reminders Headline Fragment Element. Why: The 4 Reminders-shaped headline cards need grouping without an extra DOM wrapper. How: This wraps those 4 CarSurCom elements. */ }


									<CarSurCom className='stat-card stat-mk-remdone'>{ /* What: Card Surface Component. Why: Every headline number shares the same card chrome. How: This wraps the "completed" total. */ }

										<div className='stat-num'>{ totDonNum }</div>{ /* What: Stat Number Div Element. Why: The headline card needs its own large number. How: This renders totDonNum. */ }
										<div className='stat-lbl'>completed</div>{ /* What: Stat Label Div Element. Why: The headline number needs its own caption beneath it. How: This renders the literal word "completed". */ }

									</CarSurCom>

									<CarSurCom className='stat-card stat-mk-remweek'>{ /* What: Card Surface Component. Why: Every headline number shares the same card chrome. How: This wraps the "this week" total. */ }

										<div className='stat-num'>{ remWeeNum }</div>{ /* What: Stat Number Div Element. Why: The headline card needs its own large number. How: This renders remWeeNum. */ }
										<div className='stat-lbl'>this week</div>{ /* What: Stat Label Div Element. Why: The headline number needs its own caption beneath it. How: This renders the literal words "this week". */ }

									</CarSurCom>

									<CarSurCom className='stat-card stat-mk-remactive'>{ /* What: Card Surface Component. Why: Every headline number shares the same card chrome. How: This wraps the "active days" total. */ }

										<div className='stat-num'>{ actDayNum }</div>{ /* What: Stat Number Div Element. Why: The headline card needs its own large number. How: This renders actDayNum. */ }
										<div className='stat-lbl'>active days</div>{ /* What: Stat Label Div Element. Why: The headline number needs its own caption beneath it. How: This renders the literal words "active days". */ }

									</CarSurCom>

									<CarSurCom className='stat-card stat-mk-rembusiest'>{ /* What: Card Surface Component. Why: Every headline number shares the same card chrome. How: This wraps the "busiest day" total. */ }

										<div className='stat-num'>{ busDayNum }</div>{ /* What: Stat Number Div Element. Why: The headline card needs its own large number. How: This renders busDayNum. */ }
										<div className='stat-lbl'>busiest day</div>{ /* What: Stat Label Div Element. Why: The headline number needs its own caption beneath it. How: This renders the literal words "busiest day". */ }

									</CarSurCom>


								</React.Fragment>


							) : ( // What: Pick Headline Branch. Why: Every non-Reminders scope needs the pick-shaped headline cards instead. How: This renders the else branch, taken while isaRemBoo is false.


								<React.Fragment>{ /* What: Pick Headline Fragment Element. Why: The 4 pick-shaped headline cards need grouping without an extra DOM wrapper. How: This wraps those 4 CarSurCom elements. */ }


									{ /* stat-mk-scope-{all,picker}: All and a specific
									    picker both fall into this branch and share the
									    exact same stat-mk-* classes above, so help mode
									    needs an extra hook to give the two scopes their
									    own separate tooltip copy. */ }
									<CarSurCom className={ `stat-card stat-mk-streak ${ isaPicBoo ? 'stat-mk-scope-picker' : 'stat-mk-scope-all' }` }>{ /* What: Card Surface Component. Why: Every headline number shares the same card chrome. How: This wraps the "day streak" total, tagged with an extra scope-specific class for help mode. */ }

										<div className='stat-num'>{ strCouNum }</div>{ /* What: Stat Number Div Element. Why: The headline card needs its own large number. How: This renders strCouNum. */ }
										<div className='stat-lbl'>day streak</div>{ /* What: Stat Label Div Element. Why: The headline number needs its own caption beneath it. How: This renders the literal words "day streak". */ }
										<IcoSvgCom name='flame' size={ 16 } />{ /* What: Icon Svg Component. Why: The streak card needs a small flame glyph reinforcing its own meaning. How: This renders the 'flame' icon at a fixed size. */ }

									</CarSurCom>

									<CarSurCom className={ `stat-card stat-mk-fulldays ${ isaPicBoo ? 'stat-mk-scope-picker' : 'stat-mk-scope-all' }` }>{ /* What: Card Surface Component. Why: Every headline number shares the same card chrome. How: This wraps the "full days" total, tagged with an extra scope-specific class for help mode. */ }

										<div className='stat-num'>{ fulDayNum }</div>{ /* What: Stat Number Div Element. Why: The headline card needs its own large number. How: This renders fulDayNum. */ }
										<div className='stat-lbl'>full days &middot; { actDayNum }</div>{ /* What: Stat Label Div Element. Why: The headline number needs its own caption beneath it, plus its own denominator for context. How: This renders the literal words "full days" followed by actDayNum. */ }

									</CarSurCom>

									<CarSurCom className={ `stat-card stat-mk-done ${ isaPicBoo ? 'stat-mk-scope-picker' : 'stat-mk-scope-all' }` }>{ /* What: Card Surface Component. Why: Every headline number shares the same card chrome. How: This wraps the "items done" total, tagged with an extra scope-specific class for help mode. */ }

										<div className='stat-num'>{ totDonNum }</div>{ /* What: Stat Number Div Element. Why: The headline card needs its own large number. How: This renders totDonNum. */ }
										<div className='stat-lbl'>items done</div>{ /* What: Stat Label Div Element. Why: The headline number needs its own caption beneath it. How: This renders the literal words "items done". */ }

									</CarSurCom>

									<CarSurCom className={ `stat-card stat-mk-rate ${ isaPicBoo ? 'stat-mk-scope-picker' : 'stat-mk-scope-all' }` }>{ /* What: Card Surface Component. Why: Every headline number shares the same card chrome. How: This wraps the "completion" percentage, tagged with an extra scope-specific class for help mode. */ }

										<div className='stat-num'>{ comRatNum }%</div>{ /* What: Stat Number Div Element. Why: The headline card needs its own large number. How: This renders comRatNum as a percentage. */ }
										<div className='stat-lbl'>completion</div>{ /* What: Stat Label Div Element. Why: The headline number needs its own caption beneath it. How: This renders the literal word "completion". */ }

									</CarSurCom>


								</React.Fragment>


							) }


						</div>


					) }

					{ /* Heatmap. */ }
					{ !isaConBoo && ( // What: Heatmap Visibility Check. Why: The Conditionals scope has no day-by-day heatmap of its own to show. How: This renders the whole heatmap card only while isaConBoo is false.


						<CarSurCom className='stat-heatmap-card'>{ /* What: Card Surface Component. Why: The heatmap shares the same card chrome as every other stat card. How: This wraps the heat header, the optional year pager, and either the grid+detail or an empty state. */ }


							<div className='heat-h'>{ /* What: Heat Header Div Element. Why: The heatmap's own kicker and legend sit together in one row. How: This wraps the kicker div and the HeaLegCom legend. */ }

								<div className='kicker'>{ ranKicStr }{ isaRemBoo ? ' · reminders' : '' }</div>{ /* What: Kicker Div Element. Why: The heatmap needs its own label naming the active range, plus a Reminders qualifier when that scope is active. How: This renders ranKicStr, appending " · reminders" only while isaRemBoo is true. */ }
								<HeaLegCom />{ /* What: Heat Legend Component. Why: The heatmap needs its own "less...more" scale legend beside its kicker. How: This renders the shared 5-swatch legend row. */ }

							</div>

							{ yeaPagBoo && ( () => { // What: Year Pager Visibility Check. Why: The year-pager arrows only belong on an "All time" view spanning more than one calendar year. How: This IIFE computes the active year's own index and a small navigation helper once, then returns the pager row.


								const yeaIndNum = datYeaArr.indexOf( actYeaNum ); // What: Year Index Number. Why: Both arrows need to know the active year's own position in datYeaArr to disable themselves at either end. How: This looks actYeaNum up in datYeaArr.

								const goToYeaFun = ( yeaNum, dirStr ) => { setHeaDirStr( dirStr ); setHeaYeaNum( yeaNum ); setHeaSelStr( null ); }; // What: Go To Year Function. Why: Paging to a different year needs to set the slide direction, the target year, and clear any tapped-cell selection together. How: This updates all three pieces of state in one call.

								return (


									<div className='heat-year-nav'>{ /* What: Heat Year Navigation Div Element. Why: The previous-arrow, active-year label, and next-arrow sit together in one row. How: This wraps those three elements. */ }


										<button
											type='button'
											className='heat-year-arrow'
											disabled={ yeaIndNum <= 0 }
											aria-label='Previous year'
											onClick={ () => goToYeaFun( datYeaArr[ yeaIndNum - 1 ], 'prev' ) }
										>{ /* What: Previous Year Arrow Button Element. Why: The user needs a way to page back one calendar year. How: This is disabled on the earliest year and otherwise pages to the previous entry in datYeaArr. */ }&lsaquo;</button>

										<span className='heat-year'>{ actYeaNum }</span>{ /* What: Heat Year Span Element. Why: The pager needs its own visible label naming the active year. How: This renders actYeaNum. */ }

										<button
											type='button'
											className='heat-year-arrow'
											disabled={ yeaIndNum >= datYeaArr.length - 1 }
											aria-label='Next year'
											onClick={ () => goToYeaFun( datYeaArr[ yeaIndNum + 1 ], 'next' ) }
										>{ /* What: Next Year Arrow Button Element. Why: The user needs a way to page forward one calendar year. How: This is disabled on the latest year and otherwise pages to the next entry in datYeaArr. */ }&rsaquo;</button>


									</div>


								);

							})() }

							{ actDayNum === 0 ? ( // What: Empty Heatmap Check. Why: A heatmap with zero active days needs its own explanatory message instead of an all-empty grid. How: This renders that message only while actDayNum is zero, otherwise the real grid and detail panel below.


								<div className='stat-empty'>

									{ isaRemBoo
										? `No reminders completed in ${ ranNouStr } yet.`
										: `No picks logged in ${ ranNouStr }${ scoValStr !== 'all' ? ' for this picker' : '' } yet.` }

								</div>


							) : ( // What: Heatmap Grid Branch. Why: With at least one active day, the real grid and its tap-detail panel need to render instead of the empty message. How: This renders the else branch, taken while actDayNum is above zero.


								<React.Fragment>{ /* What: Heatmap Grid Fragment Element. Why: The grid itself and its own tap-detail panel need grouping without an extra DOM wrapper. How: This wraps those two sibling blocks. */ }


									<div
										className={ `heat${ heaDirStr ? ' heat-slide-' + heaDirStr : '' }` }
										key={ actYeaNum == null ? 'single' : actYeaNum }
									>{ /* What: Heat Grid Div Element. Why: This is the actual grid of day cells, remounting (and replaying its own slide-in) whenever the active paged year changes. How: This maps heaDayArr to one cell button per day. */ }


										{ heaDayArr.map( ( dayObj ) => { // What: Heat Cell Render. Why: Every day in the window needs its own colored, tappable cell. How: This computes that day's own heat level and tooltip text, then returns the cell button.


											let levNum; // What: Level Number. Why: The cell's own heat level is computed differently for a Reminders day (raw volume) than a pick day (a ratio). How: This is assigned in exactly one of the two branches below.


											if ( isaRemBoo ) levNum = couLevFun( dayObj.done ); // What: Reminders Level Branch. Why: A reminder day has no "possible" denominator, so its level is a raw volume scale. How: This calls the shared couLevFun helper on dayObj.done.

											else { // What: Pick Level Branch. Why: A pick day's own level is a ratio of done to total, not a raw count. How: This computes that ratio, then buckets it into one of 5 levels.


												const ratNum = dayObj.done / Math.max( 1, dayObj.total ); // What: Ratio Number. Why: The bucketing below needs a plain 0-1 fraction to compare against thresholds. How: This divides dayObj.done by dayObj.total, floored at 1 to avoid a divide-by-zero.

												levNum = dayObj.total === 0 ? 0 : ratNum >= 1 ? 4 : ratNum >= 0.66 ? 3 : ratNum >= 0.33 ? 2 : ratNum > 0 ? 1 : 0; // What: Ratio Bucket Assignment. Why: The 5 heat levels correspond to specific completion-ratio bands. How: This buckets ratNum into one of those 5 thresholds, with a zero-total day always at level 0.


											}

											const hedTexStr = isaRemBoo // What: Head Text String. Why: The tooltip's own first line differs in shape between a Reminders day and a pick day. How: This phrases either a "done" count or a "done/total" fraction.
												? `${ dayObj.date } · ${ dayObj.done } done`
												: `${ dayObj.date } · ${ dayObj.done }/${ dayObj.total }`;

											// Native (desktop) tooltip lists what was picked/completed
											// that day.
											const namTexArr = ( dayObj.items || [] ).map( ( iteObj ) => // What: Name Text Array. Why: The tooltip's own body needs one bullet line per logged item that day. How: This maps each item to a "- name" line, appending a checkmark for a completed pick.
												isaRemBoo ? `• ${ iteObj.name }` : `• ${ iteObj.name }${ iteObj.done ? ' ✓' : '' }` );

											const titTexStr = namTexArr.length ? `${ hedTexStr }\n${ namTexArr.join( '\n' ) }` : hedTexStr; // What: Title Text String. Why: The cell's own native tooltip needs the head line plus every bullet line joined together, or just the head line when nothing was logged. How: This joins hedTexStr and namTexArr with newlines, or falls back to hedTexStr alone.
											const selBoo     = heaSelStr === dayObj.date;                                                    // What: Selected Boolean. Why: A tapped cell needs its own distinct styling. How: This compares heaSelStr against this cell's own date.

											return (


												<button
													key={ dayObj.date }
													type='button'
													className={ `heat-cell heat-${ levNum }${ selBoo ? ' is-sel' : '' }` }
													title={ titTexStr }
													aria-label={ titTexStr }
													onClick={ () => setHeaSelStr( selBoo ? null : dayObj.date ) }
												/> // What: Heat Cell Button Element. Why: Each day needs its own tappable, color-coded cell. How: This toggles heaSelStr to this cell's own date (or clears it, if already selected) on click.


											);

										})}


									</div>

									{ ( () => { // What: Heat Detail Render. Why: A tapped cell's own detail list is either shown or a plain hint is shown instead, depending on whether anything is currently selected. How: This looks up the selected day's own aggregate entry, then returns either the hint or the detail panel.


										const selDayObj = heaSelStr && heaDayArr.find( ( dayObj ) => dayObj.date === heaSelStr ); // What: Selected Day Object. Why: The detail panel below needs the actual aggregate entry for whichever day is selected, not just its date string. How: This finds the matching entry in heaDayArr, or stays falsy when nothing is selected.

										if ( !selDayObj ) return <p className='heat-tap-hint'>Tap a day to see what was picked.</p>; // What: No Selection Guard. Why: With nothing tapped yet, a plain hint replaces the detail panel entirely. How: This returns the hint paragraph and skips the rest of this IIFE.

										const selDatObj  = new Date( selDayObj.date + 'T00:00:00' );                                                          // What: Selected Date Object. Why: The detail panel's own header needs a real Date to format a label from. How: This parses selDayObj.date at local midnight.
										const selLabStr  = selDatObj.toLocaleDateString( undefined, { weekday : 'short', month : 'short', day : 'numeric' } ); // What: Selected Label String. Why: The detail panel's own header needs a short, readable date label. How: This formats selDatObj as "weekday, month day".

										return (


											<div className='heat-detail'>{ /* What: Heat Detail Div Element. Why: The tapped day's own header and item list are grouped together. How: This wraps the detail header and either the item list or an empty message. */ }


												<div className='heat-detail-h'>{ /* What: Heat Detail Header Div Element. Why: The selected day's own label and done-count sit together in one row. How: This wraps the date span and the count span. */ }

													<span className='heat-detail-date'>{ selLabStr }</span>{ /* What: Heat Detail Date Span Element. Why: The panel needs its own visible date label. How: This renders selLabStr. */ }
													<span className='heat-detail-count'>{ isaRemBoo ? `${ selDayObj.done } done` : `${ selDayObj.done }/${ selDayObj.total } done` }</span>{ /* What: Heat Detail Count Span Element. Why: The panel needs its own visible completion count for the day. How: This phrases either a plain "done" count or a "done/total" fraction, depending on scope. */ }

												</div>

												{ ( selDayObj.items || [] ).length ? ( // What: Item List Visibility Check. Why: A day with an aggregate entry but no logged items at all still needs an explanatory message instead of an empty list. How: This renders the real list only while selDayObj.items has at least one entry.


													<ul className='heat-detail-list'>{ /* What: Heat Detail List Element. Why: This is the actual list of what was logged on the selected day. How: This maps selDayObj.items to one list item per entry. */ }


														{ selDayObj.items.map( ( iteObj, iteIndNum ) => ( // What: Heat Detail Item Render. Why: Every logged item on the selected day needs its own row. How: This maps each item to a list item, keyed by its own position since items have no stable id here.


															<li
																key={ iteIndNum }
																className={ iteObj.done ? 'is-done' : '' }
															>{ /* What: Heat Detail Item Element. Why: Each item needs its own name and (for a pick day) a done/not-done mark. How: This renders the name span and, only outside the Reminders scope, the mark span. */ }

																<span className='heat-detail-name'>{ iteObj.name }</span>{ /* What: Heat Detail Name Span Element. Why: The row needs its own visible item name. How: This renders iteObj.name. */ }
																{ !isaRemBoo && <span className='heat-detail-mark'>{ iteObj.done ? '✓' : '—' }</span> }{ /* What: Heat Detail Mark Check. Why: A Reminders day has no separate done/not-done state to mark, since every logged row there is already a completion. How: This renders a check or em-dash mark only outside the Reminders scope. */ }

															</li>


														))}


													</ul>


												) : ( <p className='heat-detail-empty'>Nothing { isaRemBoo ? 'completed' : 'picked' } this day.</p> ) }


											</div>


										);

									})() }


								</React.Fragment>


							) }


						</CarSurCom>


					) }

					{ /* Conditionals summary (All view). */ }
					{ scoValStr === 'all' && hasConBoo && ( // What: Conditionals Summary Visibility Check. Why: This compact summary only belongs on the combined All view, and only while at least one conditional exists. How: This renders it only while both conditions hold.


						<CarSurCom className='cnd-sum-card'>{ /* What: Card Surface Component. Why: The Conditionals summary shares the same card chrome as every other stat card. How: This wraps the summary header and either the summary list or an empty state. */ }


							<div className='rem-stats-head'>{ /* What: Reminder Stats Header Div Element. Why: The summary's own kicker and headline numbers sit together in one row, sharing this class with the Reminders summary below for consistent layout. How: This wraps the kicker div and the two inline stat spans. */ }


								<div className='kicker'>Conditionals</div>{ /* What: Kicker Div Element. Why: This card needs its own small labelled kicker. How: This renders the literal word "Conditionals". */ }

								<div className='rem-stats-nums'>{ /* What: Reminder Stats Numbers Div Element. Why: The two inline headline stats sit side by side. How: This wraps the two rem-stat spans. */ }

									<span className='rem-stat'><strong>{ conTotObj.fired }</strong>&nbsp;triggered</span>{ /* What: Rem Stat Span Element. Why: The summary needs one inline "N triggered" readout. How: This renders conTotObj.fired in bold, followed by the word "triggered". */ }
									<span className='rem-stat'><strong>{ conTotObj.rate }%</strong>&nbsp;fire rate</span>{ /* What: Rem Stat Span Element. Why: The summary needs one inline "N% fire rate" readout. How: This renders conTotObj.rate in bold as a percentage, followed by "fire rate". */ }

								</div>


							</div>

							{ conStaArr.length ? ( // What: Conditional Summary List Check. Why: An empty summary needs its own message instead of a bare empty list. How: This renders the real list only while conStaArr has at least one row.


								<ul className='cnd-sum-list'>{ /* What: Conditional Summary List Element. Why: This is the actual summary list, capped to the first 8 conditionals. How: This maps the first 8 entries of conStaArr to one list item per conditional. */ }


									{ conStaArr.slice( 0, 8 ).map( ( conRowObj ) => ( // What: Conditional Summary Row Render. Why: Every summarized conditional needs its own compact row showing its name, tags, mode, and fraction/rate. How: This maps up to 8 conStaArr entries to one list item per conditional.


										<li key={ conRowObj.id }>{ /* What: Conditional Summary Item Element. Why: Each conditional needs its own row grouping its name/tags on one side and its mode/fraction/rate on the other. How: This renders the name span and the meta span as two siblings. */ }


											<span className='cnd-sum-name'>{ /* What: Conditional Summary Name Span Element. Why: The conditional's own name and any deleted/inactive tags are grouped together. How: This wraps the plain name text and its two conditional tag checks. */ }

												{ conRowObj.name }
												{ conRowObj.deleted && <span className='rank-tag rank-tag--deleted'>deleted</span> }{ /* What: Deleted Tag Check. Why: A since-deleted conditional's own row must be visibly flagged. How: This renders a small "deleted" tag only while conRowObj.deleted is true. */ }
												{ !conRowObj.deleted && conRowObj.active === false && <span className='rank-tag'>inactive</span> }{ /* What: Inactive Tag Check. Why: A live but currently-disabled conditional needs its own visible flag. How: This renders a small "inactive" tag only for a non-deleted conditional whose own active field is false. */ }

											</span>

											<span className='cnd-sum-meta'>{ /* What: Conditional Summary Meta Span Element. Why: The conditional's own mode, fraction, and rate are grouped on the opposite side from the name. How: This wraps those three spans. */ }

												<span className='rem-log-type'>{ ( conRowObj.mode || '' ).replace( '-', '‑' ) }</span>{ /* What: Mode Tag Span Element. Why: Every row needs its own small mode label. How: This renders the conditional's own mode, with a non-breaking hyphen swapped in for a literal hyphen. */ }
												<span className='cnd-sum-frac'>{ conRowObj.fired } / { conRowObj.total }</span>{ /* What: Conditional Summary Fraction Span Element. Why: The summary needs its own raw fired/total fraction. How: This renders conRowObj.fired and conRowObj.total joined by a slash. */ }
												<span className='cnd-sum-rate'>{ conRowObj.rate == null ? '—' : conRowObj.rate + '%' }</span>{ /* What: Conditional Summary Rate Span Element. Why: The summary needs its own rate percentage, or a placeholder glyph when there's no rate at all. How: This renders conRowObj.rate as a percentage, or the em-dash placeholder when it's null. */ }

											</span>


										</li>


									))}


								</ul>


							) : <div className='rem-log-empty'>No conditional activity in { ranNouStr } yet.</div> }{ /* What: Conditional Summary Empty State Div Element. Why: An empty summary needs to explain why the list is missing instead of showing nothing at all. How: This renders only while conStaArr is empty. */ }


						</CarSurCom>


					) }

					{ /* Reminders dashboard extras. */ }
					{ isaRemBoo && ( // What: Reminders Extras Visibility Check. Why: The type-split bar and the Reminders breakdown card only belong while the Reminders scope is active. How: This renders both together only while isaRemBoo is true.


						<React.Fragment>{ /* What: Reminders Extras Fragment Element. Why: These two blocks need grouping without an extra DOM wrapper. How: This wraps the BreBarCom type-split card and the Reminders breakdown CarSurCom. */ }


							<BreBarCom
								titStr='By reminder type'
								totNum={ totDonNum }
								segArr={ typSegArr }
								empStr={ `No reminders completed in ${ ranNouStr } yet.` }
								className='stat-mk-remtype'
							/>{ /* What: Breakdown Bar Component. Why: The Reminders scope needs the same stacked-bar treatment as the pick-source split, but for the one-time/recurring type split instead. How: This is fed typSegArr and totDonNum as its own segments/total. */ }

							<CarSurCom className='stat-mk-rembreakdown'>{ /* What: Card Surface Component. Why: The Reminders breakdown list shares the same card chrome as every other breakdown card. How: This wraps the sort header, metric pill row, explanatory note, and the paged list itself. */ }


								<div className='rank-head'>{ /* What: Rank Head Div Element. Why: The breakdown's own kicker and sort toggle sit together in one row. How: This wraps the kicker div and the sort button. */ }


									<div className='kicker'>Reminders breakdown</div>{ /* What: Kicker Div Element. Why: This card needs its own small labelled kicker. How: This renders the literal words "Reminders breakdown". */ }

									<button
										type='button'
										className='rank-sort'
										onClick={ () => setRemSorStr( ( preDirStr ) => ( preDirStr === 'desc' ? 'asc' : 'desc' ) ) }
									>{ /* What: Sort Toggle Button Element. Why: The user needs a way to flip the breakdown list's own sort direction. How: This flips remSorStr between 'desc' and 'asc' when clicked. */ }

										{ remMetStr === 'recent'
											? ( remSorStr === 'desc' ? 'Newest → Oldest' : 'Oldest → Newest' )
											: ( remSorStr === 'desc' ? 'High → Low' : 'Low → High' ) }
										<IcoSvgCom name={ remSorStr === 'desc' ? 'arrow_down' : 'arrow_up' } size={ 13 } />{ /* What: Icon Svg Component. Why: The sort button needs a small directional glyph matching its own current direction. How: This renders the arrow_down/arrow_up icon based on remSorStr. */ }

									</button>


								</div>

								<div
									className='bd-metrics'
									ref={ remRowRef }
								>{ /* What: Metric Pill Row Div Element. Why: The user needs a way to pivot the breakdown list across three different metrics. How: This renders one pill per entry in the inline metric-label list below. */ }


									{ [ [ 'recent', 'Recent' ], [ 'completions', 'Completions' ], [ 'skipped', 'Skipped' ] ].map( ( [ remKeyStr, remLabStr ] ) => ( // What: Metric Pill Render. Why: Every one of the three available metrics needs its own selectable pill. How: This maps the inline [key, label] pair list to one button per metric.


										<button
											key={ remKeyStr }
											type='button'
											className={ `bd-metric ${ remMetStr === remKeyStr ? 'is-on' : '' }` }
											onClick={ () => setRemMetStr( remKeyStr ) }
										>{ /* What: Metric Pill Button Element. Why: The user needs a way to switch the breakdown list over to this specific metric. How: This sets remMetStr to this pill's own key when clicked. */ }

											{ remLabStr }

										</button>


									))}


								</div>

								<p className='rank-note'>{ /* What: Rank Note Paragraph Element. Why: The active metric needs a short explanation of what it actually shows. How: This renders one of three explanatory sentences, chosen by remMetStr. */ }

									{ remMetStr === 'recent'
										? 'Every Reminder that has been completed. Once you check one off on the Today page, it will show up here.'
										: remMetStr === 'completions'
										? 'Total count for the number of times that a Reminders item was completed on the Today page.'
										: 'Total count for the number of times that a Reminders item was skipped using the skip button on the Today page.' }

								</p>

								{ remBreArr.length ? ( // What: Reminder List Visibility Check. Why: An empty breakdown needs its own message instead of a bare empty list plus a pointless pager. How: This renders the real list and pager only while remBreArr has at least one row.


									<React.Fragment>{ /* What: Reminder List Fragment Element. Why: The list itself and its own pager need grouping without an extra DOM wrapper. How: This wraps the ul and the PagNavCom pager. */ }


										<ul
											className='rem-log bd-list-fade'
											key={ remMetStr + remSorStr + remSafNum }
										>{ /* What: Reminder List Element. Why: This is the actual rendered breakdown list, remounting (and replaying its own fade) whenever the metric, sort, or page changes. How: This maps remIteArr to one list item per reminder row. */ }


											{ remIteArr.map( ( remRowObj, remRowIndNum ) => ( // What: Reminder Row Render. Why: Every row on the current page needs its own list item showing its name, type tag, and either a relative date or a raw count. How: This maps remIteArr to one list item, keyed by its own rowId when in Recent mode (each row is a distinct event) or by its own index otherwise (each row is a distinct reminder).


												<li key={ remMetStr === 'recent' ? remRowObj.rowId : remRowIndNum }>{ /* What: Reminder List Item Element. Why: Each row needs its own name on one side and its own meta (type + date/count) on the other. How: This renders the name span and the meta span as two siblings. */ }

													<span className='rem-log-name'>{ remRowObj.name }</span>{ /* What: Rem Log Name Span Element. Why: The row needs its own visible reminder name. How: This renders remRowObj.name. */ }

													<span className='rem-log-meta'>{ /* What: Rem Log Meta Span Element. Why: The row's own type tag and date/count value are grouped on the opposite side from the name. How: This wraps the type span and either a relative-date span or a raw-count span. */ }

														<span className={ `rem-log-type rem-log-type--${ remRowObj.type }` }>{ remRowObj.type === 'once' ? 'one-time' : 'recurring' }</span>{ /* What: Rem Log Type Span Element. Why: Every row needs its own small type label. How: This renders "one-time" or "recurring" based on remRowObj.type. */ }
														{ remMetStr === 'recent'
															? <span className='rem-log-when'>{ relWheFun( remRowObj.completedAt ) }</span>
															: <span className='rank-metric-n'>{ remRowObj.n }</span> }

													</span>


												</li>


											))}


										</ul>

										<PagNavCom
											curPagNum={ remSafNum }
											pagSizNum={ REM_SIZ_NUM }
											totIteNum={ remBreArr.length }
											onChange={ setRemIndNum }
											uniStr={ remMetStr === 'skipped' ? 'skipped' : 'completed' }
											alwShoBoo
										/>{ /* What: Pager Navigation Component. Why: A breakdown list longer than one page needs its own pager to move through it. How: This is fed the current safe page/size/total, always showing itself via alwShoBoo since this card's own list is often long. */ }


									</React.Fragment>


								) : ( // What: Reminder Empty Branch. Why: An empty breakdown needs its own explanatory message instead of the list and pager. How: This renders the else branch, taken while remBreArr has no rows.


									<div className='rem-log-empty'>{ /* What: Rem Log Empty Div Element. Why: An empty breakdown needs to explain why the list is missing, phrased differently for the Skipped metric than the others. How: This renders one of two explanatory messages based on remMetStr. */ }

										{ remMetStr === 'skipped'
											? `No skips in ${ ranNouStr }. Skip one on Today and it lands here.`
											: `No completions in ${ ranNouStr }. Check one off on Today and it lands here.` }

									</div>


								) }


							</CarSurCom>


						</React.Fragment>


					) }

					{ shoRemBoo && ( // What: Reminders Summary Visibility Check. Why: This compact summary only belongs on the combined All view, and only while reminders are enabled at all. How: This renders it only while shoRemBoo is true.


						<CarSurCom className='rem-stats-card'>{ /* What: Card Surface Component. Why: The Reminders summary shares the same card chrome as every other stat card. How: This wraps the summary header and either the summary list or an empty state. */ }


							<div className='rem-stats-head'>{ /* What: Reminder Stats Header Div Element. Why: The summary's own kicker and headline numbers sit together in one row. How: This wraps the kicker div and the two inline stat spans. */ }


								<div className='kicker'>Reminders completed</div>{ /* What: Kicker Div Element. Why: This card needs its own small labelled kicker. How: This renders the literal words "Reminders completed". */ }

								<div className='rem-stats-nums'>{ /* What: Reminder Stats Numbers Div Element. Why: The two inline headline stats sit side by side. How: This wraps the two rem-stat spans. */ }

									<span className='rem-stat'><strong>{ remRowArr.length }</strong>&nbsp;{ ranValStr === 'all' ? 'all time' : 'in range' }</span>{ /* What: Rem Stat Span Element. Why: The summary needs one inline total readout, phrased for the active range. How: This renders remRowArr.length in bold, followed by "all time" or "in range". */ }
									<span className='rem-stat'><strong>{ remWeeNum }</strong>&nbsp;this week</span>{ /* What: Rem Stat Span Element. Why: The summary needs one inline "N this week" readout. How: This renders remWeeNum in bold, followed by "this week". */ }

								</div>


							</div>

							{ remLogArr.length ? ( // What: Reminder Summary List Check. Why: An empty summary needs its own message instead of a bare empty list. How: This renders the real list only while remLogArr has at least one row.


								<ul className='rem-log'>{ /* What: Reminder Summary List Element. Why: This is the actual summary list, capped to the first 8 completions. How: This maps the first 8 entries of remLogArr to one list item per completion. */ }


									{ remLogArr.slice( 0, 8 ).map( ( remRowObj ) => ( // What: Reminder Summary Row Render. Why: Every summarized completion needs its own compact row showing its name, type, and relative date. How: This maps up to 8 remLogArr entries to one list item per row.


										<li key={ remRowObj.rowId }>{ /* What: Reminder Summary Item Element. Why: Each completion needs its own name on one side and its own type/date on the other. How: This renders the name span and the meta span as two siblings. */ }

											<span className='rem-log-name'>{ remRowObj.name }</span>{ /* What: Rem Log Name Span Element. Why: The row needs its own visible reminder name. How: This renders remRowObj.name. */ }

											<span className='rem-log-meta'>{ /* What: Rem Log Meta Span Element. Why: The row's own type tag and relative date are grouped on the opposite side from the name. How: This wraps the type span and the relative-date span. */ }

												<span className={ `rem-log-type rem-log-type--${ remRowObj.type }` }>{ remRowObj.type === 'once' ? 'one-time' : 'recurring' }</span>{ /* What: Rem Log Type Span Element. Why: Every row needs its own small type label. How: This renders "one-time" or "recurring" based on remRowObj.type. */ }
												<span className='rem-log-when'>{ relWheFun( remRowObj.completedAt ) }</span>{ /* What: Rem Log When Span Element. Why: Every row needs its own relative completion date. How: This renders relWheFun applied to remRowObj.completedAt. */ }

											</span>


										</li>


									))}


								</ul>


							) : ( // What: Rem Stats Empty Branch. Why: An empty summary needs its own fixed message instead of the real list. How: This renders the else branch, taken while remLogArr is empty.


								<div className='rem-log-empty'>No completions in { ranNouStr }. Check one off on Today and it lands here.</div>


							) }


						</CarSurCom>


					) }

					{ /* Source split (picks); the All view shows it last, and a
					    single-picker scope shows it too. */ }
					{ !isaRemBoo && !isaConBoo && ( // What: Source Split Visibility Check. Why: The pick-source breakdown only makes sense while a pick-shaped scope (All or a single picker) is active. How: This renders it only while neither the Reminders nor Conditionals sentinel is active.


						<BreBarCom
							titStr='How picks were chosen'
							totNum={ totPosNum }
							segArr={ souSegArr }
							empStr={ `Nothing picked in ${ ranNouStr } yet.` }
							className='stat-mk-source'
						/>


					) }

					{ /* Rankings (picks). */ }
					{ scoValStr === 'all' && ( // What: Rankings Visibility Check. Why: The Most Picked/Coldest cards only make sense on the combined All view, not a single-picker scope. How: This renders both cards only while scoValStr is 'all'.


						<div className='stat-row stat-row--2'>{ /* What: Rankings Row Div Element. Why: The two ranking cards sit side by side in their own row. How: This wraps the Most Picked and Coldest items Cards. */ }


							<CarSurCom className='stat-mk-mostpicked'>{ /* What: Card Surface Component. Why: The Most Picked ranking shares the same card chrome as every other stat card. How: This wraps the kicker and either the ranked list or an empty state. */ }


								<div className='kicker'>Most picked</div>{ /* What: Kicker Div Element. Why: This card needs its own small labelled kicker. How: This renders the literal words "Most picked". */ }

								{ topPicArr.length ? ( // What: Top List Visibility Check. Why: An empty ranking needs its own message instead of a bare empty list. How: This renders the real list only while topPicArr has at least one entry.


									<ul className='rank'>{ /* What: Top Ranking List Element. Why: This is the actual top-5 most-picked list. How: This maps topPicArr to one list item per item. */ }


										{ topPicArr.map( ( iteObj, iteIndNum ) => ( // What: Top Ranking Row Render. Why: Every one of the top 5 items needs its own row showing its name and count. How: This maps topPicArr to one list item, keyed by its own position since these are plain aggregate values with no stable id here.


											<li key={ iteIndNum }>{ /* What: Top Ranking Item Element. Why: Each item needs its own name on one side and its own count on the other. How: This renders a plain name span and the count span. */ }

												<span>{ iteObj.name }</span>{ /* What: Item Name Span Element. Why: The row needs its own visible item name. How: This renders iteObj.name. */ }
												<span className='rank-n'>{ iteObj.n }</span>{ /* What: Rank Number Span Element. Why: The row needs its own visible pick count. How: This renders iteObj.n. */ }

											</li>


										))}


									</ul>


								) : <div className='stat-empty'>Nothing picked in { ranNouStr } yet.</div> }{ /* What: Top Ranking Empty State Div Element. Why: An empty ranking needs to explain why the list is missing instead of showing nothing at all. How: This renders only while topPicArr is empty. */ }


							</CarSurCom>

							<CarSurCom className='stat-mk-coldest'>{ /* What: Card Surface Component. Why: The Coldest items ranking shares the same card chrome as every other stat card. How: This wraps the kicker and either the ranked list or an empty state. */ }


								<div className='kicker'>Coldest items</div>{ /* What: Kicker Div Element. Why: This card needs its own small labelled kicker. How: This renders the literal words "Coldest items". */ }

								{ colIteArr.length ? ( // What: Cold List Visibility Check. Why: An empty ranking needs its own message instead of a bare empty list. How: This renders the real list only while colIteArr has at least one entry.


									<ul className='rank rank--cold'>{ /* What: Cold Ranking List Element. Why: This is the actual bottom-5 least-picked list. How: This maps colIteArr to one list item per item. */ }


										{ colIteArr.map( ( iteObj, iteIndNum ) => ( // What: Cold Ranking Row Render. Why: Every one of the bottom 5 items needs its own row showing its name and count. How: This maps colIteArr to one list item, keyed by its own position since these are plain aggregate values with no stable id here.


											<li key={ iteIndNum }>{ /* What: Cold Ranking Item Element. Why: Each item needs its own name on one side and its own count on the other. How: This renders a plain name span and the count span. */ }

												<span>{ iteObj.name }</span>{ /* What: Item Name Span Element. Why: The row needs its own visible item name. How: This renders iteObj.name. */ }
												<span className='rank-n'>{ iteObj.n }</span>{ /* What: Rank Number Span Element. Why: The row needs its own visible pick count. How: This renders iteObj.n. */ }

											</li>


										))}


									</ul>


								) : <div className='stat-empty'>No items in this scope.</div> }{ /* What: Cold Ranking Empty State Div Element. Why: An empty ranking needs to explain why the list is missing instead of showing nothing at all. How: This renders only while colIteArr is empty. */ }


							</CarSurCom>


						</div>


					) }

					{ /* Single-picker Pick breakdown: one card, metric switcher. */ }
					{ isaPicBoo && ( // What: Pick Breakdown Visibility Check. Why: This entire card only belongs while a single real picker is the active scope. How: This renders it only while isaPicBoo is true.


						<CarSurCom className='stat-breakdown-card'>{ /* What: Card Surface Component. Why: The Pick breakdown shares the same card chrome as every other breakdown card. How: This wraps the sort header, metric pill row, the active metric's own note, and the sorted list itself. */ }


							<div className='rank-head'>{ /* What: Rank Head Div Element. Why: The breakdown's own kicker and sort toggle sit together in one row. How: This wraps the kicker div and the sort button. */ }


								<div className='kicker'>Pick breakdown</div>{ /* What: Kicker Div Element. Why: This card needs its own small labelled kicker. How: This renders the literal words "Pick breakdown". */ }

								<button
									type='button'
									className='rank-sort'
									onClick={ () => setSorDirStr( ( preDirStr ) => ( preDirStr === 'desc' ? 'asc' : 'desc' ) ) }
								>{ /* What: Sort Toggle Button Element. Why: The user needs a way to flip the breakdown list's own sort direction. How: This flips sorDirStr between 'desc' and 'asc' when clicked. */ }

									{ sorDirStr === 'desc' ? 'High → Low' : 'Low → High' }
									<IcoSvgCom name={ sorDirStr === 'desc' ? 'arrow_down' : 'arrow_up' } size={ 13 } />{ /* What: Icon Svg Component. Why: The sort button needs a small directional glyph matching its own current direction. How: This renders the arrow_down/arrow_up icon based on sorDirStr. */ }

								</button>


							</div>

							<div
								className='bd-metrics'
								role='tablist'
								aria-label='Breakdown metric'
								ref={ metRowRef }
							>{ /* What: Metric Pill Row Div Element. Why: The user needs a way to pivot the breakdown list across every metric this picker's own mode supports. How: This renders one pill per entry in metPilArr. */ }


								{ metPilArr.map( ( metObj ) => ( // What: Metric Pill Render. Why: Every available metric needs its own selectable pill. How: This maps metPilArr to one button per metric.


									<button
										key={ metObj.keyStr }
										type='button'
										role='tab'
										aria-selected={ effMetStr === metObj.keyStr }
										className={ `bd-metric ${ effMetStr === metObj.keyStr ? 'is-on' : '' }` }
										onClick={ () => setMetKeyStr( metObj.keyStr ) }
									>{ /* What: Metric Pill Button Element. Why: The user needs a way to switch the breakdown list over to this specific metric. How: This sets metKeyStr to this pill's own key when clicked. */ }

										{ metObj.labStr }

									</button>


								))}


							</div>

							{ effMetStr === 'count' && ( // What: Count Note Visibility Check. Why: The Count metric's own explanation, including its inline total/eligible toggle, only belongs while it's the active metric. How: This renders it only while effMetStr is 'count'.


								<p className='rank-note'>

									Total count for the number of times that a { scpPicObj.name } item was picked (rejections and skips are not included), counted in{ ' ' }
									<button
										type='button'
										className={ `note-link ${ couModStr === 'total' ? 'is-on' : '' }` }
										onClick={ () => setCouModStr( 'total' ) }
									>total picks</button>{ /* What: Total Toggle Button Element. Why: The user needs a way to switch the Count metric's own percentage denominator to the picker's whole total. How: This sets couModStr to 'total' when clicked. */ }
									{ ' ' }or only{ ' ' }
									<button
										type='button'
										className={ `note-link ${ couModStr === 'eligible' ? 'is-on' : '' }` }
										onClick={ () => setCouModStr( 'eligible' ) }
									>eligible picks</button>{ /* What: Eligible Toggle Button Element. Why: The user needs a way to switch the Count metric's own percentage denominator to only picks made while each item was active. How: This sets couModStr to 'eligible' when clicked. */ }
									{ ' ' }when an item was active.

								</p>


							) }

							{ effMetStr === 'freq' && ( // What: Frequency Note Visibility Check. Why: The Frequency metric's own explanation, including its inline calendar/eligible toggle, only belongs while it's the active metric. How: This renders it only while effMetStr is 'freq'.


								<p className='rank-note'>

									Average number of days between subsequent picks, counted in total{ ' ' }
									<button
										type='button'
										className={ `note-link ${ freModStr === 'calendar' ? 'is-on' : '' }` }
										onClick={ () => setFreModStr( 'calendar' ) }
									>{ calUniStr }</button>{ /* What: Calendar Toggle Button Element. Why: The user needs a way to switch the Frequency metric's own unit to literal calendar days/periods. How: This sets freModStr to 'calendar' when clicked. */ }
									{ ' ' }or only{ ' ' }
									<button
										type='button'
										className={ `note-link ${ freModStr === 'eligible' ? 'is-on' : '' }` }
										onClick={ () => setFreModStr( 'eligible' ) }
									>eligible { eliUniStr }</button>{ /* What: Eligible Toggle Button Element. Why: The user needs a way to switch the Frequency metric's own unit to only the picker's own eligible run periods. How: This sets freModStr to 'eligible' when clicked. */ }
									{ ' ' }when the { scpPicObj.name } picker actually runs.

								</p>


							) }

							{ effMetStr === 'spent' && ( // What: Spent Note Visibility Check. Why: The Spent metric's own explanation, including its inline calendar/eligible toggle, only belongs while it's the active metric. How: This renders it only while effMetStr is 'spent'.


								<p className='rank-note'>

									Average number of days before an item&rsquo;s charge runs out, counted in total{ ' ' }
									<button
										type='button'
										className={ `note-link ${ speModStr === 'calendar' ? 'is-on' : '' }` }
										onClick={ () => setSpeModStr( 'calendar' ) }
									>{ calUniStr }</button>{ /* What: Calendar Toggle Button Element. Why: The user needs a way to switch the Spent metric's own unit to literal calendar days/periods. How: This sets speModStr to 'calendar' when clicked. */ }
									{ ' ' }or only{ ' ' }
									<button
										type='button'
										className={ `note-link ${ speModStr === 'eligible' ? 'is-on' : '' }` }
										onClick={ () => setSpeModStr( 'eligible' ) }
									>eligible { eliUniStr }</button>{ /* What: Eligible Toggle Button Element. Why: The user needs a way to switch the Spent metric's own unit to only the picker's own eligible run periods. How: This sets speModStr to 'eligible' when clicked. */ }
									{ ' ' }when the { scpPicObj.name } picker actually runs.

								</p>


							) }

							{ effMetStr === 'auto' && ( // What: Auto Note Visibility Check. Why: The Auto metric needs its own one-line explanation. How: This renders it only while effMetStr is 'auto'.

								<p className='rank-note'>Total count for the number of times that a { scpPicObj.name } item was picked using the auto generator.</p>

							) }

							{ effMetStr === 'manual' && ( // What: Manual Note Visibility Check. Why: The Hand Picked metric needs its own one-line explanation. How: This renders it only while effMetStr is 'manual'.

								<p className='rank-note'>Total count for the number of times that a { scpPicObj.name } item was picked manually using the Pick One button on the Pickers page.</p>

							) }

							{ effMetStr === 'rejected' && ( // What: Rejected Note Visibility Check. Why: The Re-Rolled Away metric needs its own one-line explanation. How: This renders it only while effMetStr is 'rejected'.

								<p className='rank-note'>Total count for the number of times that a { scpPicObj.name } item was rejected using the re-roll button on the Today page.</p>

							) }

							{ effMetStr === 'skipped' && ( // What: Skipped Note Visibility Check. Why: The Skipped metric needs its own one-line explanation. How: This renders it only while effMetStr is 'skipped'.

								<p className='rank-note'>Total count for the number of times that a { scpPicObj.name } item was skipped using the skip button on the Today page.</p>

							) }

							{ effMetStr === 'last' && ( // What: Last Picked Note Visibility Check. Why: The Last Picked metric's own explanation, including its inline calendar/eligible toggle, only belongs while it's the active metric. How: This renders it only while effMetStr is 'last'.


								<p className='rank-note'>

									Days since each item was last picked, counted in total{ ' ' }
									<button
										type='button'
										className={ `note-link ${ lasModStr === 'calendar' ? 'is-on' : '' }` }
										onClick={ () => setLasModStr( 'calendar' ) }
									>{ calUniStr }</button>{ /* What: Calendar Toggle Button Element. Why: The user needs a way to switch the Last Picked metric's own unit to literal calendar days/periods. How: This sets lasModStr to 'calendar' when clicked. */ }
									{ ' ' }or only{ ' ' }
									<button
										type='button'
										className={ `note-link ${ lasModStr === 'eligible' ? 'is-on' : '' }` }
										onClick={ () => setLasModStr( 'eligible' ) }
									>eligible { eliUniStr }</button>{ /* What: Eligible Toggle Button Element. Why: The user needs a way to switch the Last Picked metric's own unit to only the picker's own eligible run periods. How: This sets lasModStr to 'eligible' when clicked. */ }
									{ ' ' }when the { scpPicObj.name } picker actually runs.

								</p>


							) }

							{ breListArr.length ? ( // What: Breakdown List Visibility Check. Why: An empty picker needs its own message instead of a bare empty list. How: This renders the real list only while breListArr has at least one row.


								<ul
									className={ `rank rank--breakdown bd-list-fade ${ ( effMetStr === 'freq' || effMetStr === 'last' ) ? 'rank--freq' : '' }` }
									key={ effMetStr + sorDirStr }
								>{ /* What: Breakdown List Element. Why: This is the actual rendered breakdown list, remounting (and replaying its own fade) whenever the metric or sort changes. How: This maps breListArr to one list item per item. */ }


									{ breListArr.map( ( iteObj ) => { // What: Breakdown Row Render. Why: Every item in the breakdown needs its own list item showing its name, suffix, tags, and the active metric's own value. How: This looks up the item's own suffix, then returns the list item.


										const sufStr = actSufFun( iteObjMap.get( iteObj.id ) ); // What: Suffix String. Why: The row's own name-suffix depends on both the active metric and the item's own raw weight/ease fields, resolved via the shared suffix helper. How: This calls actSufFun with the raw item looked up from iteObjMap.

										return (


											<li
												key={ iteObj.id }
												className={ `${ iteObj.vacation ? 'is-vacation' : '' }${ iteObj.deleted ? ' is-deleted' : '' }` }
											>{ /* What: Breakdown List Item Element. Why: Every item needs its own row grouping its name/tags/suffix on one side and its metric value on the other. How: This renders the rank-name block and the rank-bd-vals block as two siblings. */ }


												<span className='rank-name'>{ /* What: Rank Name Span Element. Why: The item's own name, deleted tag, and suffix are grouped together. How: This wraps the name row and the optional suffix meta span. */ }


													<span className='rank-name-row'>{ /* What: Rank Name Row Span Element. Why: The name text and an optional "deleted" tag sit side by side. How: This wraps the name text span and the item deleted tag. */ }

														<span className='rank-name-text'>{ iteObj.name }</span>{ /* What: Rank Name Text Span Element. Why: The row needs its own visible item name. How: This renders iteObj.name. */ }
														{ iteObj.deleted && <span className='rank-tag rank-tag--deleted'>deleted</span> }{ /* What: Deleted Tag Check. Why: A since-deleted item's own row must be visibly flagged. How: This renders a small "deleted" tag only while iteObj.deleted is true. */ }

													</span>

													{ sufStr && <span className='rank-meta'>{ sufStr }</span> }{ /* What: Suffix Meta Check. Why: Not every metric has a suffix to show under the name. How: This renders the resolved sufStr under the name only while it's non-null. */ }


												</span>

												<span className='rank-bd-vals'>{ /* What: Rank Breakdown Values Span Element. Why: The row's own inactive/was-inactive tags and metric-specific value sit together on the opposite side from the name. How: This wraps those tags and whichever metric-specific value block matches effMetStr. */ }


													{ !iteObj.deleted && iteObj.vacation && <span className='rank-tag'>inactive</span> }{ /* What: Inactive Tag Check. Why: A live but currently-inactive item needs its own visible flag. How: This renders a small "inactive" tag only for a non-deleted item whose own vacation field is true. */ }

													{ !iteObj.deleted && effMetStr === 'last' && !iteObj.vacation && iteObj.wasOnVac && ( // What: Was Inactive Tag Check. Why: The Last Picked metric specifically wants to flag an item that went inactive after its own last pick and hasn't been picked since returning. How: This renders a small "was inactive" tag only under that exact combination of conditions.

														<span className='rank-tag rank-tag--was'>was inactive</span>

													) }

													{ effMetStr === 'count' && ( () => { // What: Count Value Render. Why: The Count metric's own percentage/fraction display depends on the active denominator mode. How: This resolves the active denominator, then returns the percent and fraction spans together.


														const denNum = couModStr === 'eligible' ? iteObj.eligDenom : totPosNum; // What: Denominator Number. Why: The percentage below needs a single resolved denominator, chosen by couModStr. How: This picks iteObj.eligDenom in eligible mode, otherwise the picker's own totPosNum.

														return (


															<span className='rank-vals'>{ /* What: Rank Values Span Element. Why: The Count metric shows both a percentage and a raw fraction together. How: This wraps the percent span and the fraction span. */ }

																<span className='rank-pct'>{ denNum ? Math.round( ( iteObj.n / denNum ) * 100 ) : 0 }%</span>{ /* What: Rank Percent Span Element. Why: The Count metric's own headline value is a percentage of the active denominator. How: This divides iteObj.n by denNum, guarding against a zero denominator. */ }
																<span className='rank-frac'>{ iteObj.n } / { denNum }</span>{ /* What: Rank Fraction Span Element. Why: The Count metric's own supporting detail is the raw picks/denominator fraction. How: This renders iteObj.n and denNum joined by a slash. */ }

															</span>


														);

													})() }

													{ effMetStr === 'freq' && ( // What: Frequency Value Check. Why: The Frequency metric's own value/placeholder display only belongs on this one metric. How: This renders it only while effMetStr is 'freq'.

														iteObj.aveGap != null
															? ( () => { const dspObj = cadDisFun( iteObj.aveGap, freModStr, gapForFun( iteObj.aveGap ) ); return <span className='rank-freq-val rank-bd-freq--freq'>every { dspObj.num } { dspObj.word }</span>; } )()
															: <span className='rank-freq-val rank-bd-freq--freq is-dim'>{ iteObj.freqCount === 1 ? 'Picked Once' : 'Not Picked' }</span>

													) }

													{ effMetStr === 'spent' && ( // What: Spent Value Check. Why: The Spent metric's own value/placeholder display only belongs on this one metric. How: This renders it only while effMetStr is 'spent'.

														iteObj.spent != null
															? ( () => { const dspObj = cadDisFun( iteObj.spent, speModStr, Math.round( iteObj.spent ) ); return <span className='rank-freq-val rank-bd-freq--freq'>&asymp; { dspObj.num } { dspObj.word }</span>; } )()
															: (

																<span className='rank-freq-val rank-bd-freq--freq is-dim'>

																	N/A <InfTipCom className='pie-help pie-help--sm' label='No full cycle has been completed yet'>?</InfTipCom>{ /* What: Info Tip Component. Why: A N/A Spent value needs a small inline explanation of why there's no cycle to measure yet. How: This renders the shared "?" bubble with its own label text. */ }

																</span>

															)

													) }

													{ effMetStr === 'last' && ( // What: Last Picked Value Check. Why: The Last Picked metric's own value/placeholder display only belongs on this one metric. How: This renders it only while effMetStr is 'last'.

														iteObj.lastDays != null
															? <span className='rank-freq-val rank-bd-freq--last'>{ lasForFun( iteObj.lastDays, lasModStr ) }</span>
															: <span className='rank-freq-val rank-bd-freq--last is-dim'>Not Picked</span>

													) }

													{ ( effMetStr === 'auto' || effMetStr === 'manual' || effMetStr === 'rejected' || effMetStr === 'skipped' ) && ( // What: Plain Metric Value Check. Why: These four metrics all show the same plain raw-count shape, just reading a different field. How: This renders iteObj's own field named by effMetStr only while effMetStr matches one of these four.

														<span className='rank-metric-n'>{ iteObj[ effMetStr ] }</span>

													) }


												</span>


											</li>


										);

									})}


								</ul>


							) : <div className='stat-empty'>This picker has no items yet.</div> }{ /* What: Breakdown Empty State Div Element. Why: An empty picker needs to explain why the list is missing instead of showing nothing at all. How: This renders only while breListArr is empty. */ }


						</CarSurCom>


					) }


				</div>


			</div>


		</div>


	);


}

// #endregion TabStats



export { TabStats }; // What: Named Exports. Why: app.jsx renders this as the Stats tab itself. How: This re-exports TabStats; every other binding in this file is internal-only.


