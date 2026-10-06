


// #region Imports

import cssModObj from './tab-stats.module.css'; // What: CSS Module Object. Why: TabStaCom's own styles live in its module. How: Each className reads its hashed class from here.
import React     from 'react';                  // What: React. Why: This is the UI library the whole file's component and its hooks are built on. How: This is used directly (React.useState, React.useMemo, React.useCallback, ...) throughout instead of importing individual named hooks.


import { CAD_NAM_OBJ  } from '../../core/cadence.ts';         // What: Cadence Namespace Object. Why: A cadence-scoped picker's run gaps need relabeling into real period words instead of raw day counts. How: This is called via CAD_NAM_OBJ.uniWorFun to turn a day/period count into "week"/"month"/"year" wording.
import { CarSurCom    } from '../../ui/card-surface.tsx';     // What: Card Surface Component. Why: Every stat card on this page shares the same rounded container chrome. How: This wraps each headline/breakdown/heatmap block rendered below.
import { HelButCom    } from '../../help/button.tsx';         // What: Help Button Component. Why: This page needs its own header toggle for entering and leaving help mode. How: This is rendered in the header, flipping helModBoo on click.
import { HelOveCom    } from '../../help/mode.tsx';           // What: Help Overlay Component. Why: Help mode needs a dimmed overlay with per-element tooltips layered above the real page. How: This is rendered while helModBoo is true, fed STA_HEL_ARR as its copy source.
import { hidHisFun    } from '../../state/sample-history.ts'; // What: Hide History Function. Why: The real hidden sample pickers borrowed for help mode must be re-hidden once help mode ends. How: This is called whenever helModBoo turns false, and again on unmount.
import { IcoSvgCom    } from '../../ui/icon.tsx';             // What: Icon Svg Component. Why: Several small glyphs (sort-direction arrows, the streak flame) are needed throughout this page. How: This is rendered with a specific name and size wherever one of those glyphs is shown.
import { InfTipCom    } from '../../ui/info-tip.tsx';         // What: Info Tip Component. Why: The Spent metric's "no completed cycle yet" case needs a small inline explanation. How: This renders a "?" bubble with its own label text next to that N/A value.
import { isaTruFun    } from '../../utils/guard.ts';          // What: Is-A Truthy Function. Why: The scroll-fade rows drop any that aren't mounted. How: This filters them so the rest read as real elements.
import { isoDayFun    } from '../../utils/date.ts';           // What: Iso Day Function. Why: Dates are stored and compared as local-calendar YYYY-MM-DD keys. How: This formats a Date (or now) as that key.
import { PilTagCom    } from '../../ui/pill-tag.tsx';         // What: Pill Tag Component. Why: The single-picker header needs a small labelled pill showing the picker's own mode. How: This renders that pill, toned as 'mode'.
import { SED_NAM_OBJ  } from '../../state/seed.ts';           // What: Seed Namespace Object. Why: Every picker mode's own display label and hint text live in this shared table. How: This is looked up (MOD_DEF_OBJ) by a picker's own mode key throughout the page.
import { STA_HEL_ARR  } from '../../help/content.tsx';        // What: Stats Help Array. Why: Help mode needs this page's own tooltip copy, keyed to its elements. How: This is passed straight through to HelOveCom.
import { TAS_NAM_OBJ  } from '../../core/tasks.ts';           // What: Tasks Namespace Object. Why: Which reminder types actually opt into Stats is a persisted, normalized setting. How: This is called via TAS_NAM_OBJ.norOptFun on the raw persisted reminderOpts.
import { THR_VAL_NUM  } from '../../constants.ts';            // What: Threshold Value Number. Why: Ease day-range math in this file divides by the shared full-charge ceiling. How: This is divided by an item's own easeMin/easeMax wherever a drift-to-days conversion happens.
import { togFadFun    } from '../../ui/edge-fade.ts';         // What: Toggle Fade Function. Why: Every scrolling rail in this file hides each edge fade once that edge is reached. How: This is called by each rail's own scroll and resize handlers.
import { unhHisFun    } from '../../state/sample-history.ts'; // What: Unhide History Function. Why: Help mode borrows the real hidden sample pickers so the heatmap and breakdown have genuine history to show. How: This is called whenever helModBoo turns true, as long as the page tour doesn't already own the same samples.
import { useEmlTouFun } from '../../state/tour-bus.ts';       // What: Use Ease My Life Tour Function. Why: The Welcome Tour needs to reserve top space above this page's content when its own coach card doesn't fit. How: This is called once to read the shared tour event bus's resTopNum field.


import type { ActStoTyp } from '../../state/store.ts';     // What: Action Store Type. Why: The Stats tab changes its saved filters through the store's actions. How: This types TtcProTyp's actStoObj.
import type { IteRcdTyp } from '../../core/data-model.ts'; // What: Item Record Type. Why: The per-item breakdown mixes live items with deleted ones rebuilt from the log. How: This types that combined list as partial items.
import type { StaAppTyp } from '../../core/data-model.ts'; // What: State App Type. Why: The Stats tab reads every log in the app state. How: This types TtcProTyp's staAppObj.
import type { VclRowTyp } from '../../core/data-model.ts'; // What: Vacation-Log Row Type. Why: The inactive-day checks replay each item's vacation toggles. How: This types the events grouped per item.

// #endregion Imports



/**
 * tab-stats.tsx = Tab Stats
 *
 * @summary
 * The Stats tab: the pick-log-derived history view, an activity heatmap,
 * per-picker breakdown, and reminder/conditional history, all filterable by
 * Group/Type/Show and a date range, paginated (PagNavCom) once a list runs
 * long. BreBarCom renders the stacked breakdown bars, HeaLegCom their heat
 * legend, and isoDayFun/relWheFun/couLevFun are small date/heatmap helpers
 * the rest of the file reads from. STA_RAN_ARR, SOU_MET_ARR, and TYP_MET_ARR
 * define the range pills and breakdown segments. TabStaCom ties every
 * section together as the tab.
 *
 * Sections:
 *  - Types
 *  - Constants
 *  - Helpers
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Types

type PibRowTyp = { autNum : number, couNum : number, delBoo : boolean, denNum : number, freNum : number, gapNum : number | null, ideStr : string, lasNum : number | null, manNum : number, namStr : string, rejNum : number, skiNum : number, speNum : number | null, vacBoo : boolean, wasBoo : boolean }; // What: Pick-Breakdown Row Type. Why: The Pick breakdown card renders, sorts, and labels one combined row per item, live or deleted. How: This types that row's identity flags and every metric it can show, with the gap, last-picked, and spent values null when an item has none.

// #endregion Types



// #region Constants

const HEA_LEV_ARR = [ cssModObj.hetCelButLevel0, cssModObj.hetCelButLevel1, cssModObj.hetCelButLevel2, cssModObj.hetCelButLevel3, cssModObj.hetCelButLevel4 ]; // What: Heat Level Array. Why: A day's cell tints by its completion level, and a hashed module class can't be built from a string. How: This lists each level's module class in order, so HEA_LEV_ARR[ levValNum ] picks the cell's tint.



const MET_FIE_OBJ : Record< string, 'autNum' | 'couNum' | 'manNum' | 'rejNum' | 'skiNum' > = { auto : 'autNum', count : 'couNum', manual : 'manNum', rejected : 'rejNum', skipped : 'skiNum' }; // What: Metric Field Object. Why: The Pick breakdown's plain-count metrics are selected by id, but each one's value lives under its own row field name. How: This maps a metric id (metKeyStr's own value) to the breakdown row field its sort and display read.



const PER_DAY_OBJ : Record< string, number > = { monthly : 30, weekly : 7, yearly : 365 }; // What: Period Day Object. Why: Converting a raw calendar-day count into cadence periods needs each cadence's own approximate period length. How: This is looked up by a picker's own cadence value, whose keys it must match exactly.



const REM_SIZ_NUM = 10; // What: Reminder Size Number. Why: The Reminders breakdown card pages like Gmail, 10 rows at a time. How: This is passed straight through to PagNavCom as its own pagSizNum.



const SOU_FIE_OBJ = { auto : 'autNum', manual : 'manNum', reroll : 'rerNum' }; // What: Source Field Object. Why: A pick row's saved source value names which per-item tally it counts toward, but the tally fields use their own names. How: This maps each saved source value to the per-item tally field it increments.



// #region SOU_MET_ARR

/**
 * SOU_MET_ARR = Source Meta Array
 *
 * @summary
 * Every entry below shares this exact shape, joined with each source's
 * own live count (as couNum) before being passed to BreBarCom as its own
 * segDatArr; none of the 3 entries repeat these same fields' own
 * boilerplate comments (see the "Repeated-shape object literals" comment
 * exception in CLAUDE.md). The colors stay on-palette (accent + warm) so
 * the breakdown bar reads as one family rather than a random spectrum.
 *
 * - `colStr` (String): Color String is the segment's own bar/dot color,
 *   applied as an inline style value.
 *
 * - `keyStr` (String): Key String matches a pick row's own source field,
 *   used to look up that source's live count.
 *
 * - `labStr` (String): Label String names the source, rendered as its own
 *   legend row's visible text.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const SOU_MET_ARR = [ // What: Source Meta Array. Why: This defines how each Today pick came to be. How: This is joined with each source's own live count for the "How picks were chosen" BreBarCom card.


	{ colStr : 'var(--acc-mai-col)',                                             keyStr : 'auto',   labStr : 'Auto Generated' }, // What: Auto Source Object. Why: Most picks come from the Daily generator. How: This colors them with the plain accent. // Accent Main Color = oklch( 0.5 0.14 250 )
	{ colStr : 'oklch(from var(--acc-mai-col) calc(l + 0.22) calc(c - 0.05) h)', keyStr : 'reroll', labStr : 'Re-Rolled'      }, // What: Reroll Source Object. Why: A re-rolled pick replaced an earlier one on Today. How: This colors it with a lighter, softer accent. // Accent Main Color = oklch( 0.5 0.14 250 )
	{ colStr : 'var(--acc-sec-col)',                                             keyStr : 'manual', labStr : 'Hand Picked'    }  // What: Manual Source Object. Why: A hand-picked item was chosen with Pick One on the Pickers page. How: This colors it with the warm tone. // Accent Secondary Color = oklch( 0.62 0.13 50 )


];

// #endregion SOU_MET_ARR



// #region STA_RAN_ARR

/**
 * STA_RAN_ARR = Stat Range Array
 *
 * @summary
 * Every entry below shares this exact shape, rendered as one pill each in
 * the Range filter row; none of the 6 entries repeat these same fields'
 * own boilerplate comments (see the "Repeated-shape object literals"
 * comment exception in CLAUDE.md). Each entry's own trailing comment
 * instead just names which lookback window it represents. Order matters:
 * the pills render left to right in this exact order.
 *
 * - `dayNum` (Number): Day Number is the lookback window's own length in
 *   days, subtracted from today to compute cutIsoStr, or Infinity to mean
 *   no cutoff at all.
 *
 * - `keyStr` (String): Key String uniquely identifies the range, compared
 *   against ranValStr for active-state styling and to resolve ranDefObj.
 *
 * - `labStr` (String): Label String names the range for the user,
 *   rendered as the pill's own visible text.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const STA_RAN_ARR = [ // What: Stat Range Array. Why: This defines the fixed set of lookback windows the Range filter row offers. How: This is mapped over to render one pill per entry, and ranDefObj/cutIsoStr resolve the active one by its own keyStr.


	{ dayNum : Infinity, keyStr : 'all',   labStr : 'All Time' }, // What: All Time Range Object. Why: This is the default, unbounded view. How: This sets no cutoff at all.
	{ dayNum : 365,      keyStr : 'year',  labStr : '1 year'   }, // What: Year Range Object. Why: This covers the last full year. How: This looks back 365 days.
	{ dayNum : 182,      keyStr : '6m',    labStr : '6 months' }, // What: Six Month Range Object. Why: This covers the last half year. How: This looks back 182 days.
	{ dayNum : 90,       keyStr : '3m',    labStr : '3 months' }, // What: Three Month Range Object. Why: This covers the last quarter. How: This looks back 90 days.
	{ dayNum : 30,       keyStr : 'month', labStr : 'Month'    }, // What: Month Range Object. Why: This covers the last month. How: This looks back 30 days.
	{ dayNum : 7,        keyStr : 'week',  labStr : 'Week'     }  // What: Week Range Object. Why: This covers the last week. How: This looks back 7 days.


];

// #endregion STA_RAN_ARR



// #region TYP_MET_ARR

/**
 * TYP_MET_ARR = Type Meta Array
 *
 * @summary
 * Every entry below shares this exact shape, joined with each reminder
 * type's own live count (as couNum) before being passed to BreBarCom as
 * its own segDatArr; none of the 2 entries repeat these same fields' own
 * boilerplate comments (see the "Repeated-shape object literals" comment
 * exception in CLAUDE.md). Each entry's own trailing comment instead just
 * names which reminder type it represents, using the same accent + warm
 * palette as SOU_MET_ARR so both breakdown bars read as one family.
 *
 * - `colStr` (String): Color String is the segment's own bar/dot color,
 *   applied as an inline style value.
 *
 * - `keyStr` (String): Key String matches a reminder log row's own type
 *   field, used to look up that type's live count.
 *
 * - `labStr` (String): Label String names the reminder type, rendered as
 *   its own legend row's visible text.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const TYP_MET_ARR = [ // What: Type Meta Array. Why: This defines the one-time versus recurring split shown for reminders, sharing the same visual language as SOU_MET_ARR. How: This is joined with each type's own live count for the "By reminder type" BreBarCom card.


	{ colStr : 'var(--acc-mai-col)', keyStr : 'recurring', labStr : 'Recurring' }, // What: Recurring Type Object. Why: Recurring reminders make up the bulk of most logs. How: This colors them with the plain accent. // Accent Main Color = oklch( 0.5 0.14 250 )
	{ colStr : 'var(--acc-sec-col)', keyStr : 'once',      labStr : 'One-Time'  }  // What: Once Type Object. Why: One-time reminders are the smaller, distinct share. How: This colors them with the warm tone. // Accent Secondary Color = oklch( 0.62 0.13 50 )


];

// #endregion TYP_MET_ARR

// #endregion Constants



// #region Helpers

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
 * couLevFun(6) // => 4
 * ```
 *
*/

function couLevFun ( donCouNum : number ) : number {


	return donCouNum <= 0 ? 0 : donCouNum >= 4 ? 4 : donCouNum; // What: Heat Level Return. Why: Zero and negative counts show as empty, four or more caps at the darkest cell, and anything between maps onto itself. How: This is a plain clamp of donCouNum into the 0-4 range.


}

// #endregion couLevFun



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
 * @param wheIsoStr - When Iso String: The ISO timestamp string to format.
 *
 * @returns A short "weekday, month day" label.
 *
 * @example
 * ```ts
 * relWheFun('2026-09-01T12:00:00.000Z') // => 'Tue, Sep 1'
 * ```
 *
*/

function relWheFun ( wheIsoStr : string ) : string {


	const wheDatObj = new Date( wheIsoStr ); // What: When Date Object. Why: The formatter below needs a real Date, not the raw ISO string. How: This parses wheIsoStr into a Date instance.



	return wheDatObj.toLocaleDateString( 'en-US', { day : 'numeric', month : 'short', weekday : 'short' } ); // What: Short Label Return. Why: Every row in the Reminders log/breakdown lists needs one compact, consistently-shaped date label. How: This formats wheDatObj as "weekday, month day" using the locale formatter.


}

// #endregion relWheFun

// #endregion Helpers



// #region Components

type BacProTyp = { 'data-element-name-hook'? : string, empMesStr : string, kicTexStr : string, segDatArr : { colStr : string, couNum : number, keyStr : string, labStr : string }[], totCouNum : number }; // What: Breakdown-Bar-Component Props Type. Why: A breakdown card splits a total across colored segments, or shows a message when there's nothing to split. How: This types BreBarCom's props, named Bac since Bbc and Brc already belong to ButBasCom and BooResCom.

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
 * @param props.data-element-name-hook - Data Element Name Hook: The element's
 *                                       own identity hook, forwarded onto its
 *                                       root card, so code can find it without
 *                                       its classes.
 * @param props.empMesStr              - Empty Message String: Message shown in
 *                                       place of the bar when totCouNum is
 *                                       zero.
 * @param props.kicTexStr              - Kicker Text String: The card's own
 *                                       kicker text.
 * @param props.segDatArr              - Segment Data Array: {@link
 *                                       SOU_MET_ARR} or {@link TYP_MET_ARR},
 *                                       each entry already joined with its own
 *                                       live couNum.
 * @param props.totCouNum              - Total Count Number: The combined total
 *                                       every segment's own share is computed
 *                                       against.
 *
 * @returns The card containing the stacked bar and legend, or the empty
 * state.
 *
 * @example
 * ```tsx
 * BreBarCom({ empMesStr, kicTexStr, segDatArr, ... }) // => <BreBarCom />
 * ```
 *
*/

function BreBarCom ( { 'data-element-name-hook' : hooNamStr, empMesStr, kicTexStr, segDatArr, totCouNum } : BacProTyp ) : React.JSX.Element {


	return (


		<CarSurCom data-element-name-hook={ hooNamStr }>{ /* What: Card Surface Component. Why: This is BreBarCom's own root container, shared chrome with every other stat card. How: This renders the kicker, then either the bar and legend or the empty state below it. */ }


			<div className={ cssModObj.pagKicDiv }>{ kicTexStr }</div>{ /* What: Kicker Div Element. Why: Every card on this page opens with a small labelled kicker. How: This renders the caller's own kicTexStr. */ }



			{ totCouNum > 0 ? ( // What: Has Data Check. Why: A stacked bar with nothing in it would render as an empty, confusing sliver. How: This renders the real bar and legend only while totCouNum is positive, otherwise the empty state below.


				<div className={ cssModObj.breBloDiv }>{ /* What: Breakdown Div Element. Why: This groups the bar and its legend as one visual unit. How: This wraps the breBarDiv segment row and the breLegUno list below it. */ }


					<div className={ cssModObj.breBarDiv }>{ /* What: Bar Div Element. Why: This is the actual stacked proportion bar. How: This renders one span per non-zero segment, each sized to its own share of totCouNum. */ }


						{ segDatArr.filter( ( segCurObj ) => segCurObj.couNum > 0 ).map( ( segCurObj ) => ( // What: Bar Segment Render. Why: A zero-count segment would render as an invisible sliver anyway, so it's skipped entirely. How: This maps every segment with a positive count to one proportionally-widthed span.


							<span
								key={ segCurObj.keyStr }

								className={ cssModObj.barSegSpa }

								style={{
									background : segCurObj.colStr,
									width      : `${ ( segCurObj.couNum / totCouNum ) * 100 }%`
								}}

								title={ `${ segCurObj.labStr }: ${ segCurObj.couNum }` }
							/> // What: Segment Span Element. Why: Each stacked segment needs its own width, color, and a hover tooltip with the raw count. How: This is sized to the segment's own share of totCouNum and colored via its own colStr.


						))}


					</div>


					<ul className={ cssModObj.breLegUno }>{ /* What: Legend List Element. Why: The bar alone doesn't label its own segments. How: This renders one legend row per segment, including zero-count ones, each with its own dot, name, value, and percentage. */ }


						{ segDatArr.map( ( segCurObj ) => ( // What: Legend Row Render. Why: Every segment, even a zero-count one, still needs its own legend row for context. How: This maps every segment in segDatArr to one legend list item.


							<li
								key={ segCurObj.keyStr }

								className={ cssModObj.legIteIte }
							>{ /* What: Legend Item Element. Why: Each segment needs its own row grouping a color dot, its label, its count, and its share. How: This renders those four pieces as sibling spans. */ }


								<span
									className={ cssModObj.legDotSpa }

									style={{ background : segCurObj.colStr }}
								/>{ /* What: Dot Span Element. Why: The legend row needs a small color swatch matching its bar segment. How: This is a plain colored dot, styled via segCurObj's own colStr. */ }

								<span className={ cssModObj.legLabSpa }>{ segCurObj.labStr }</span>{ /* What: Label Span Element. Why: The legend row needs the segment's own name. How: This renders segCurObj.labStr. */ }

								<span className={ cssModObj.legValSpa }>{ segCurObj.couNum }</span>{ /* What: Value Span Element. Why: The legend row needs the segment's own raw count. How: This renders segCurObj.couNum. */ }

								<span className={ cssModObj.legPerSpa }>{ totCouNum ? Math.round( ( segCurObj.couNum / totCouNum ) * 100 ) : 0 }%</span>{ /* What: Percent Span Element. Why: The legend row needs the segment's own share of the total. How: This computes segCurObj.couNum as a percentage of totCouNum, guarding against a zero totCouNum. */ }


							</li>


						))}


					</ul>


				</div>


			) : ( // What: Empty State Branch. Why: A zero-total card needs to explain why the bar is missing instead of showing nothing at all. How: This renders the else branch, taken while totCouNum is zero.


				<div className={ cssModObj.staEmpDiv }>{ empMesStr }</div> // What: Empty State Div Element. Why: This is the actual empty-state message. How: This renders the caller's own empMesStr.


			) }


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
 * HeaLegCom({}) // => <HeaLegCom />
 * ```
 *
*/

function HeaLegCom () : React.JSX.Element {


	return (


		<div className={ cssModObj.hetLegDiv }>{ /* What: Legend Div Element. Why: This groups the "less"/"more" labels and the 5 swatches into one row. How: This renders those 7 children in a fixed left-to-right order. */ }


			<span>less</span>{ /* What: Less Span Element. Why: The scale needs a label at its dim end. How: This renders the literal word "less". */ }

			<i className={` ${ cssModObj.hetCelIta }   ${ cssModObj.hetCelItaLevel0 } `} />{ /* What: Swatch Element. Why: This is the scale's own level-0 (empty) reference swatch. How: This is a plain, non-interactive colored cell sharing the real heatmap cells' own classes. */ }

			<i className={` ${ cssModObj.hetCelIta }   ${ cssModObj.hetCelItaLevel1 } `} />{ /* What: Swatch Element. Why: This is the scale's own level-1 reference swatch. How: This is a plain, non-interactive colored cell sharing the real heatmap cells' own classes. */ }

			<i className={` ${ cssModObj.hetCelIta }   ${ cssModObj.hetCelItaLevel2 } `} />{ /* What: Swatch Element. Why: This is the scale's own level-2 reference swatch. How: This is a plain, non-interactive colored cell sharing the real heatmap cells' own classes. */ }

			<i className={` ${ cssModObj.hetCelIta }   ${ cssModObj.hetCelItaLevel3 } `} />{ /* What: Swatch Element. Why: This is the scale's own level-3 reference swatch. How: This is a plain, non-interactive colored cell sharing the real heatmap cells' own classes. */ }

			<i className={` ${ cssModObj.hetCelIta }   ${ cssModObj.hetCelItaLevel4 } `} />{ /* What: Swatch Element. Why: This is the scale's own level-4 (darkest) reference swatch. How: This is a plain, non-interactive colored cell sharing the real heatmap cells' own classes. */ }

			<span>more</span>{ /* What: More Span Element. Why: The scale needs a label at its dark end. How: This renders the literal word "more". */ }


		</div>


	);


}

// #endregion HeaLegCom



type PncProTyp = { alwShoBoo? : boolean, curPagNum : number, onChange : ( nexPagNum : number ) => void, pagSizNum : number, totIteNum : number, uniWorStr? : string }; // What: Page-Navigation-Component Props Type. Why: A pager steps through a long list a page at a time. How: This types PagNavCom's props.

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
 * @param props.alwShoBoo - Always Show Boolean: Forces the pager to render
 *                          even when everything fits on one page; defaults to
 *                          false.
 * @param props.curPagNum - Current Page Number: The current, 0-indexed page.
 * @param props.onChange  - On Change: Called with the next 0-indexed page on
 *                          an arrow tap; the exact standard name, left as-is.
 * @param props.pagSizNum - Page Size Number: How many items one page holds.
 * @param props.totIteNum - Total Item Number: The full, unpaged item count.
 * @param props.uniWorStr - Unit Word String: Unit word shown after the
 *                          total; defaults to 'items'.
 *
 * @returns The pager row, or nothing at all when the list fits on one
 * page and alwShoBoo is false.
 *
 * @example
 * ```tsx
 * PagNavCom({ alwShoBoo, curPagNum, onChange, ... }) // => <PagNavCom />
 * ```
 *
*/

function PagNavCom ( { alwShoBoo = false, curPagNum, onChange, pagSizNum, totIteNum, uniWorStr = 'items' } : PncProTyp ) : React.JSX.Element | null {


	const pagCouNum = Math.max( 1, Math.ceil( totIteNum / pagSizNum ) ); // What: Page Count Number. Why: The arrows need to know how many pages actually exist so the last page's next arrow can disable itself. How: This divides totIteNum by pagSizNum, rounding up, floored at 1 even for an empty list.



	if ( totIteNum <= pagSizNum && !alwShoBoo ) return null; // What: Fits On One Page Guard. Why: A pager showing "1-N of N" with both arrows disabled adds nothing once everything already fits. How: This renders nothing at all unless the caller forced alwShoBoo.



	const staIteNum = totIteNum === 0 ? 0 : curPagNum * pagSizNum + 1;      // What: Start Item Number. Why: The visible range's own first item number depends on which page is active. How: This is 0 for an empty list, otherwise the current page's own first 1-indexed item.
	const endIteNum = Math.min( totIteNum, ( curPagNum + 1 ) * pagSizNum ); // What: End Item Number. Why: The visible range's own last item number must not overshoot the real total on a partial final page. How: This takes whichever is smaller between the page's own last slot and the true total.



	return (


		<div className={ cssModObj.pagNavDiv }>{ /* What: Pager Div Element. Why: This is PagNavCom's own root element, grouping the range text and the arrow buttons. How: This renders the "start-end of total" text followed by the two arrow buttons. */ }


			<span className={ cssModObj.pagRanSpa }>{ /* What: Range Span Element. Why: The pager needs one combined "1-10 of N items" readout. How: This renders staIteNum, an en dash, endIteNum, "of", totIteNum, and the optional unit word. */ }


				{ staIteNum }&ndash;{ endIteNum } <span className={ cssModObj.pagJoiSpa }>of</span> { totIteNum }{ uniWorStr ? ` ${ uniWorStr }` : '' }{ /* What: Range Readout Expression. Why: The pager reads as one line of text. How: This joins the start, end, total, and optional unit word. */ }


			</span>

			<div className={ cssModObj.pagArrDiv }>{ /* What: Arrows Div Element. Why: The previous/next controls are grouped together for layout. How: This renders the two arrow buttons side by side. */ }


				<button
					className={ cssModObj.pagArrBut }

					disabled={ curPagNum <= 0 }
					type='button'

					aria-label='Previous page'

					onClick={ () => onChange( curPagNum - 1 ) }
				>&lsaquo;</button>{ /* What: Previous Arrow Button Element. Why: The user needs a way to move back one page. How: This is disabled on the first page and otherwise calls onChange with the previous page index. */ }

				<button
					className={ cssModObj.pagArrBut }

					disabled={ curPagNum >= pagCouNum - 1 }
					type='button'

					aria-label='Next page'

					onClick={ () => onChange( curPagNum + 1 ) }
				>&rsaquo;</button>{ /* What: Next Arrow Button Element. Why: The user needs a way to move forward one page. How: This is disabled on the last page and otherwise calls onChange with the next page index. */ }


			</div>


		</div>


	);


}

// #endregion PagNavCom



type ScoTabTyp = { cliFun : () => void, keyStr : string, labStr : string, namStr : string, picStr? : string, selBoo : boolean };             // What: Scope Tab Type. Why: The Show row mixes the Conditionals and Reminders tabs with one tab per picker, and only a picker tab carries a picker id. How: This describes one scope tab entry.
type TtcProTyp = { actStoObj : ActStoTyp, onNavHomFun? : () => void, onNavTabFun? : ( tabIdeStr : string ) => void, staAppObj : StaAppTyp }; // What: Tab-Stats-Component Props Type. Why: The Stats tab reads the whole app state, filters it, and can navigate to other tabs. How: This types TabStaCom's props, named Ttc since Tsc already belongs to TheSecCom.

// #region TabStaCom

/**
 * TabStaCom = Tab Stats Component
 *
 * @summary
 * Renders the Stats tab. Everything shown here is derived on the fly from
 * the app's flat, append-only logs (staAppObj.pickLog, .conditionalLog,
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
 * @param props.actStoObj   - Action Store Object: {@link useAppStaFun}
 * @param props.onNavHomFun - On Navigate Home Function: Navigates back to the
 *                            Today tab.
 * @param props.onNavTabFun - On Navigate Tab Function: Navigates to an
 *                            arbitrary tab by id.
 * @param props.staAppObj   - State App Object: {@link useAppStaFun}
 *
 * @returns The Stats tab's own root element, including its header, filter
 * rows, and every scope-dependent card.
 *
 * @example
 * ```tsx
 * TabStaCom({ actStoObj, onNavHomFun, ... }) // => <TabStaCom />
 * ```
 *
*/

function TabStaCom ( { actStoObj, onNavHomFun, onNavTabFun, staAppObj } : TtcProTyp ) : React.JSX.Element {


	// #region Page Tour And Help Mode

	const touBusObj = useEmlTouFun(); // What: Tour Bus Object. Why: The Welcome Tour needs to reserve top space above this page's content when its own coach card doesn't fit above/below the highlighted area. How: This is read for its own resTopNum field and applied as top padding on the page body below.



	const [ helModBoo, setHelModBoo ] = React.useState( false ); // What: Help Mode Boolean And Setter. Why: This page needs its own toggle for entering and leaving help mode, since nothing here is editable the way Pickers/Data are. How: This is flipped by the header's HelButCom and read by the effect below.

	const helExiFun = React.useCallback( () => setHelModBoo( false ), [] ); // What: Help Exit Function. Why: HelOveCom needs a stable close handler to call when the user dismisses it. How: This forces helModBoo back to false.


	const staTouBoo = staAppObj.onboarding?.activeTour?.id === 'page-explore_stats'; // What: Stats Tour Boolean. Why: This page's own help-mode sample borrowing must defer to the page tour whenever the tour is the one currently driving the same samples. How: This checks the persisted onboarding state for that exact active tour id, optional-chaining past a missing onboarding object or active tour. // Skipped while the Stats PAGE TOUR owns these same real samples (see onboarding/page-tours.tsx's own unhHisFun call): this effect also runs on mount (helModBoo starts false), and without this guard it would immediately re-hide the samples the instant the tour navigates onto this page, right after the tour's own Step 1 just unhid them. Confirmed as the cause of the Stats page tour going dim-with-nothing- then-ending: the group filter's own exiGroArr check never got the chance to see any unhidden pickers before this ran them back to hidden.


	React.useEffect( () => { // What: Help Sample History Effect. Why: Help mode borrows the real hidden sample pickers so the heatmap/breakdown have genuine history to show, and must give them back once help mode ends. How: This unhides the samples while helModBoo is true, or hides them again otherwise, unless the page tour already owns them.


		if ( staTouBoo ) return; // What: Tour Ownership Guard. Why: Hiding the samples out from under the page tour would break its own Step 1 reveal. How: This bails out of the whole effect while the Stats page tour is active.



		if ( helModBoo ) unhHisFun( staAppObj, actStoObj ); // What: Unhide Samples Call. Why: Entering help mode needs real history to show. How: This reveals the borrowed hidden sample pickers.

		else hidHisFun( actStoObj ); // What: Hide Samples Call. Why: Leaving help mode must not leave the borrowed samples permanently visible. How: This re-hides them.


	// eslint-disable-next-line react-hooks/exhaustive-deps -- What: Deliberate Dependency Omission. Why: Un-hiding the samples changes the app state, so re-running on every state change would un-hide them again in a loop. How: staAppObj is read from the render where help mode or tour ownership changed.
	}, [ actStoObj, helModBoo, staTouBoo ] ); // What: Effect Dependency Array. Why: This must re-run whenever help mode itself toggles, or whenever tour ownership of the samples changes. How: helModBoo drives the actual show/hide, staTouBoo gates whether this effect is allowed to act at all, and actStoObj never changes identity.


	React.useEffect( () => () => hidHisFun( actStoObj ), [ actStoObj ] ); // What: Unmount Cleanup Effect. Why: The borrowed samples must not stay revealed if this page unmounts while help mode happens to still be on. How: This registers a cleanup-only effect that hides the samples on unmount, with no setup of its own, listing actStoObj, which never changes identity, so it still runs only once.

	// #endregion Page Tour And Help Mode



	// #region Scope And Filter State

	const [ scoValStr, setScoValStr ] = React.useState( 'all' ); // What: Scope Value String And Setter. Why: This is the single source of truth for which card set the whole page shows: everything, one picker, Conditionals, or Reminders. How: This is read throughout every memo below and written by the Show/Type filter rows. // scoValStr: 'all' | <pickerId> | 'reminders' | 'conditionals'.
	const [ ranValStr, setRanValStr ] = React.useState( 'all' ); // What: Range Value String And Setter. Why: Every card on the page needs the same active lookback window. How: This is resolved into ranDefObj/cutIsoStr below and written by the Range filter row.

	const [ sorDirStr, setSorDirStr ] = React.useState( 'desc' );     // What: Sort Direction String And Setter. Why: The Pick breakdown list needs one shared High-to-Low/Low-to-High toggle regardless of which metric is active. How: This is applied inside the breLisArr sort below and flipped by the card's own sort button. // Shared sort direction for the single-picker "Pick breakdown" list, used by every metric pill it can show.
	const [ metKeyStr, setMetKeyStr ] = React.useState( 'count' );    // What: Metric Key String And Setter. Why: The Pick breakdown card pivots its whole displayed value and sort on this one selection. How: This is read by effMetStr below and written by the breMetDiv pill row. // Which per-item metric the Pick breakdown shows: count | freq | auto | manual | rejected | skipped (and 'spent' substitutes for 'freq' on an ease-down picker).
	const [ lasModStr, setLasModStr ] = React.useState( 'calendar' ); // What: Last Mode String And Setter. Why: "Last picked" can be read either in literal calendar days or in the picker's own eligible run-days. How: This is read wherever lasForFun formats a lasNum value. // Unit for the "Last picked" metric: calendar days vs. the picker's own eligible (run) days, toggled inline in that metric's own explanation.
	const [ freModStr, setFreModStr ] = React.useState( 'eligible' ); // What: Frequency Mode String And Setter. Why: "Frequency" can be read either in literal calendar days or in the picker's own eligible run-days. How: This selects which of freGapMap's two gap values (calNum/eliNum) is shown. // Same calendar/eligible toggle for the "Frequency" metric's own average gap.
	const [ speModStr, setSpeModStr ] = React.useState( 'eligible' ); // What: Spent Mode String And Setter. Why: "Spent" can likewise be read in calendar days or the picker's own eligible run-days. How: This selects which of speGapMap's two values (cal/elig) is shown. // And for the ease-down "Spent" metric.
	const [ couModStr, setCouModStr ] = React.useState( 'total' );    // What: Count Mode String And Setter. Why: The Count metric's own percentage column can read against either the whole picker's total or just this item's own eligible window. How: This is read inside the breLisArr JSX where the Count metric's percent/fraction is rendered. // Count denominator mode: 'total' (share of all picks, sums to 100%) vs. 'eligible' (share of picks made while the item was active).

	const [ remMetStr, setRemMetStr ] = React.useState( 'recent' ); // What: Reminder Metric String And Setter. Why: The Reminders breakdown card can pivot between its recent-completions log and per-reminder completion/skip totals. How: This selects which of remRecArr/remComArr/remSkiArr feeds remBreArr below. // Reminders "Reminders breakdown" card: which metric it pivots on, its own sort direction, and the current pager page (0-indexed).
	const [ remSorStr, setRemSorStr ] = React.useState( 'desc' );   // What: Reminder Sort String And Setter. Why: Every one of remMetStr's own shapes still needs a shared High/Low or Newest/Oldest toggle. How: This is applied inside remRecArr/remComArr/remSkiArr's own sort and flipped by the card's sort button.
	const [ remIndNum, setRemIndNum ] = React.useState( 0 );        // What: Reminder Index Number And Setter. Why: The Reminders breakdown card's own list is paged, so the current 0-indexed page must be tracked. How: This is clamped into remSafNum below and reset to 0 whenever the underlying list's shape changes.

	const [ conMetStr, setConMetStr ] = React.useState( 'rate' ); // What: Conditional Metric String And Setter. Why: The Conditionals breakdown list can pivot across fire rate, trigger count, cycle count, average interval, or last-fired date. How: This selects the sort key used inside conBreArr below. // Conditionals scope breakdown: which metric its own list pivots on, plus its sort direction.
	const [ conSorStr, setConSorStr ] = React.useState( 'desc' ); // What: Conditional Sort String And Setter. Why: Every one of conMetStr's own shapes still needs a shared High/Low toggle. How: This is applied inside conBreArr's own sort and flipped by the card's sort button.

	const [ heaSelStr, setHeaSelStr ] = React.useState< string | null >( null ); // What: Heat Selected String And Setter. Why: Touch devices have no hover, so a tapped day needs its own persisted selection to show its detail list. How: This holds the tapped day's own date string, or null when nothing is selected. // Heatmap: the day cell the user tapped, whose own detail shows below the grid. Hover still uses the native title tooltip; a tap drives this instead, for touch.
	const [ heaYeaNum, setHeaYeaNum ] = React.useState< number | null >( null ); // What: Heat Year Number And Setter. Why: An "All time" heatmap spanning several calendar years would otherwise grow unreasonably tall. How: This is clamped into actYeaNum below and changed by the year-pager arrows. // Heatmap year pager, only used when "All time" spans more than one calendar year (keeps the grid bounded to one year at a time). null means "the latest year".
	const [ heaDirStr, setHeaDirStr ] = React.useState( '' );                    // What: Heat Direction String And Setter. Why: The heatmap's own slide-in animation needs to know which edge to enter from. How: This is set by the year-pager arrows and applied as a className modifier on the grid. // Direction of the last year-page change ('next' | 'prev'), so the grid can slide in from the matching side. Cleared to '' on any other change.

	// #endregion Scope And Filter State



	const ranDefObj = STA_RAN_ARR.find( ( ranCurObj ) => ranCurObj.keyStr === ranValStr ) || STA_RAN_ARR[ 0 ]; // What: Range Definition Object. Why: Every card below needs the active range's own label and day count, not just its key. How: This looks up ranValStr in STA_RAN_ARR, falling back to "All Time".
	const ranNouStr = ranValStr === 'all' ? 'all time' : `the last ${ ranDefObj.labStr.toLowerCase() }`;       // What: Range Noun String. Why: Several empty-state and explanatory sentences need the active range phrased as a noun clause. How: This special-cases "all time" and otherwise lowercases ranDefObj's own label into a "the last X" phrase.
	const ranKicStr = ranValStr === 'all' ? 'All time' : `Last ${ ranDefObj.labStr.toLowerCase() }`;           // What: Range Kicker String. Why: The heatmap card's own kicker needs the active range phrased as a short heading instead of a noun clause. How: This special-cases "All time" and otherwise capitalizes a "Last X" phrase from ranDefObj's own label.



	const todDatObj = React.useMemo( () => { // What: Today Date Object. Why: Every date-math memo below needs one stable, time-zeroed "today" reference rather than repeatedly calling new Date(). How: This is computed once on mount and never recomputed.


		const zerDatObj = new Date(); // What: Zeroed Date Object. Why: Today's own date needs a fresh Date to zero out. How: This captures the current moment.


		zerDatObj.setHours( 0, 0, 0, 0 ); // What: Time Zeroing Call. Why: Every day comparison below needs midnight, not the current time of day. How: This clears the hours, minutes, seconds, and milliseconds.



		return zerDatObj; // What: Zeroed Date Return. Why: This is the stable, time-zeroed today reference. How: This returns zerDatObj.


	}, [] ); // What: Effect Dependency Array. Why: Today only needs computing once, on mount. How: An empty array means it never recomputes.


	const todIsoStr = isoDayFun( todDatObj ); // What: Today Iso String. Why: The streak, heatmap, and "last picked" math all need today's own calendar day as a plain string. How: This converts todDatObj via the shared isoDayFun helper.


	const cutIsoStr = React.useMemo( () => { // What: Cutoff Iso String Memo. Why: Every range-filtered query below needs one shared lower-bound date to compare a row's own date against. How: This computes today minus the active range's own day count, or null for "All time"'s no-cutoff case.


		if ( ranDefObj.dayNum === Infinity ) return null; // What: No Cutoff Guard. Why: "All time" has no lower bound at all. How: This returns null, which every range-filtered query below treats as "include everything".



		const cutDatObj = new Date( todDatObj ); // What: Cutoff Date Object. Why: The cutoff must be computed from today, not mutate todDatObj itself. How: This clones todDatObj before subtracting the range's own day count.

		cutDatObj.setDate( todDatObj.getDate() - ( ranDefObj.dayNum - 1 ) ); // What: Cutoff Date Subtraction. Why: A range's own day count is inclusive of today, so only dayNum-1 days need subtracting to land on the correct earliest day. How: This moves cutDatObj back by that many days.



		return isoDayFun( cutDatObj ); // What: Cutoff Iso Return. Why: Every comparison against this cutoff elsewhere compares against a plain date string, not a Date object. How: This converts cutDatObj via the shared isoDayFun helper.


	}, [ ranDefObj, todDatObj ] ); // What: Memo Dependency Array. Why: The cutoff only ever needs recomputing when the active range definition or today's own date changes. How: ranDefObj changes the day-count subtracted, todDatObj changes the date it's subtracted from.



	const picLogArr = staAppObj.pickLog; // What: Pick Log Array. Why: Every pick-related card on this page derives from this one flat, append-only log. How: This reads staAppObj.pickLog, which migStaFun guarantees, so it stays the same array until the log changes.
	const picLisArr = staAppObj.pickers; // What: Picker List Array. Why: The Show/Group/Type filter rows and every picker lookup below need the live picker list. How: This reads staAppObj.pickers, which every state carries, so it stays the same array until a picker changes.


	const hidPicSet = React.useMemo( () => ( // What: Hidden Picker Set Memo. Why: Excluding a hidden picker's own rows from every rollup needs a fast id lookup, not a repeated array scan. How: This collects every picker flagged hidden into a Set of ids. // Hidden pickers/tasks (see store.ts's own hidden flag) keep their history rows in picLogArr/reminderLog/reminderSkipLog (nothing here is ever deleted), but every rollup below excludes them by id so the numbers reflect only what's currently visible, same as Today/Pickers/ Data.


		new Set( picLisArr.filter( ( picCurObj ) => picCurObj.hidden ).map( ( picCurObj ) => picCurObj.id ) ) // What: Hidden Picker Id Set. Why: This is the finished lookup. How: This keeps hidden pickers, maps them to ids, and wraps the ids in a Set.


	), [ picLisArr ] ); // What: Memo Dependency Array. Why: This set only ever needs rebuilding when the picker list itself changes. How: picLisArr is the sole source the filter/map above reads from.


	const hidTasSet = React.useMemo( () => ( // What: Hidden Task Set Memo. Why: Excluding a hidden reminder task's own rows from every reminder rollup needs the same fast id lookup. How: This collects every task flagged hidden into a Set of ids.


		new Set( ( staAppObj.tasks || [] ).filter( ( tasCurObj ) => tasCurObj.hidden ).map( ( tasCurObj ) => tasCurObj.id ) ) // What: Hidden Task Id Set. Why: This is the finished lookup. How: This keeps hidden tasks, maps them to ids, and wraps the ids in a Set.


	), [ staAppObj.tasks ] ); // What: Memo Dependency Array. Why: This set only ever needs rebuilding when the persisted task list itself changes. How: staAppObj.tasks is the sole source the filter/map above reads from.



	// #region Conditionals Scope Data

	const conDefArr = staAppObj.conditionals;                       // What: Conditional Definition Array. Why: The Conditionals scope needs the live definitions to join against their own trigger history. How: This reads staAppObj.conditionals, which migStaFun guarantees, so it stays the same array until a conditional changes.
	const conLogArr = staAppObj.conditionalLog;                     // What: Conditional Log Array. Why: This flat, append-only log holds every historical trigger evaluation, including ones for now-deleted conditionals. How: This reads staAppObj.conditionalLog, which migStaFun guarantees, so it stays the same array until the log changes.
	const hasConBoo = conDefArr.length > 0 || conLogArr.length > 0; // What: Has Conditional Boolean. Why: The Type filter row and the whole Conditionals scope should only appear at all once there's something to show. How: This is true when either a live definition or a logged history row exists.
	const isaConBoo = scoValStr === 'conditionals';                 // What: Is-A Conditional Boolean. Why: Several blocks below need a quick check for whether the Conditionals scope is the active one. How: This compares scoValStr against the 'conditionals' sentinel value.


	const conStaArr = React.useMemo( () => { // What: Conditional Stats Array Memo. Why: The Conditionals headline numbers and breakdown list both need one summarized row per conditional (live or deleted), joined against its own range-filtered trigger history. How: This walks conLogArr once, accumulating totals/fired counts/fire dates per conditional id, then finalizes rate/interval fields.


		const ranRowArr = conLogArr.filter( ( rowCurObj ) => !cutIsoStr || rowCurObj.date >= cutIsoStr ); // What: Ranged Row Array. Why: Only trigger evaluations inside the active range should count toward the summarized stats. How: This keeps every log row whose own date is on or after cutIsoStr, or every row at all when there's no cutoff.
		const conAccMap = new Map();                                                                      // What: Conditional Accumulator Map. Why: Both live and deleted conditionals need one shared accumulator, keyed by id, to build up their own totals into. How: This starts empty and is populated by the two loops below.


		for ( const conCurObj of conDefArr ) { // What: Live Conditional Seed Loop. Why: Every live conditional needs a starting accumulator row, even one that never fired in range. How: This seeds one entry per live definition with its own current config values and zeroed history fields.


			conAccMap.set( conCurObj.id, { // What: Live Accumulator Seed Call. Why: This is the actual starting row for one live conditional. How: This stores a zeroed accumulator under the conditional's own id.


				actBoo : conCurObj.active !== false, // What: Active Boolean. Why: A disabled conditional gets its own "inactive" tag. How: This treats a missing active flag as active.
				delBoo : false,                      // What: Deleted Boolean. Why: A live conditional is never flagged deleted. How: This is always false here.
				firArr : [],                         // What: Fire Array. Why: The average interval needs every fire date. How: This starts empty and is pushed to below.
				firNum : 0,                          // What: Fired Number. Why: The fired count starts at zero. How: This is incremented per triggered row below.
				ideStr : conCurObj.id,               // What: Identifier String. Why: Each row needs a stable React key. How: This copies the conditional's own id.
				lasStr : null,                       // What: Last String. Why: Nothing has fired yet. How: This is advanced to the latest fire date below.
				maxNum : conCurObj.easeMax ?? 14,    // What: Maximum Number. Why: An ease-mode conditional's own target band needs its max drift. How: This copies easeMax, defaulting to 14.
				minNum : conCurObj.easeMin ?? 7,     // What: Minimum Number. Why: An ease-mode conditional's own target band needs its min drift. How: This copies easeMin, defaulting to 7.
				modStr : conCurObj.mode,             // What: Mode String. Why: The row's own mode tag and target both read the mode. How: This copies the conditional's own mode.
				namStr : conCurObj.name,             // What: Name String. Why: Every row needs a visible name. How: This copies the conditional's own name.
				oddNum : conCurObj.oddsPct ?? 50,    // What: Odds Number. Why: A weighted or dynamic conditional's own target shows its trigger odds. How: This copies oddsPct, defaulting to 50.
				totNum : 0                           // What: Total Number. Why: The evaluated-cycle count starts at zero. How: This is incremented per ranged row below.


			} );


		}



		for ( const rowCurObj of ranRowArr ) { // What: Trigger History Accumulation Loop. Why: Every ranged log row needs to be folded into its own conditional's accumulator, including a since-deleted conditional with no live seed above. How: This looks up (or lazily creates, for a deleted conditional) the accumulator row, then increments its totals and fire history.


			let conRowObj = conAccMap.get( rowCurObj.condId ); // What: Conditional Row Object. Why: The accumulator for this specific row's own conditional might already exist (live) or might not (deleted). How: This looks it up by the row's own condId.


			if ( !conRowObj ) { // What: Deleted Conditional Lazy-Seed Check. Why: A trigger row can outlive the conditional it belonged to, since the log is append-only and never rewritten on delete. How: This creates a minimal accumulator, flagged deleted, using the row's own denormalized name/mode.


				conRowObj = { // What: Deleted Accumulator Assignment. Why: A deleted conditional still needs a row to fold its history into. How: This builds a zeroed accumulator from the log row's own denormalized fields.


					delBoo : true,                                    // What: Deleted Boolean. Why: This conditional no longer exists live. How: This flags the row deleted.
					firArr : [],                                      // What: Fire Array. Why: The average interval needs every fire date. How: This starts empty.
					firNum : 0,                                       // What: Fired Number. Why: The fired count starts at zero. How: This is incremented below.
					ideStr : rowCurObj.condId,                        // What: Identifier String. Why: Each row needs a stable React key. How: This copies the log row's own condId.
					lasStr : null,                                    // What: Last String. Why: Nothing has fired yet. How: This is advanced below.
					modStr : rowCurObj.mode,                          // What: Mode String. Why: The row still needs a mode tag. How: This copies the log row's own denormalized mode.
					namStr : rowCurObj.name || 'Deleted conditional', // What: Name String. Why: The row still needs a visible name. How: This copies the log row's own denormalized name, with a fallback.
					totNum : 0                                        // What: Total Number. Why: The evaluated-cycle count starts at zero. How: This is incremented below.


				};


				conAccMap.set( rowCurObj.condId, conRowObj ); // What: Deleted Accumulator Store. Why: Later rows for the same deleted conditional must reuse this accumulator. How: This stores it under the row's own condId.


			}



			conRowObj.totNum++; // What: Total Increment. Why: Every evaluated cycle, fired or not, counts toward the conditional's own total. How: This increments the accumulator's totNum field by one.


			if ( rowCurObj.triggered ) { // What: Triggered Branch. Why: Only a row where the conditional actually fired should count toward firNum/lasStr/firArr. How: This increments firNum, records the fire date, and advances lasStr when this row is more recent.


				conRowObj.firNum++; // What: Fired Increment. Why: This row actually fired. How: This increments the accumulator's firNum field by one.

				conRowObj.firArr.push( rowCurObj.date ); // What: Fire Date Push. Why: The average interval below needs every fire date. How: This appends the row's own date.



				if ( !conRowObj.lasStr || rowCurObj.date > conRowObj.lasStr ) conRowObj.lasStr = rowCurObj.date; // What: Last Fired Update. Why: Only a later fire date should replace the recorded one. How: This advances lasStr whenever this row is more recent.


			}


		}



		for ( const conRowObj of conAccMap.values() ) { // What: Rate And Interval Finalize Loop. Why: The average fire interval and fire-rate percentage can only be computed once every row has been folded in. How: This computes intNum from sorted firArr (when there are at least two), and ratNum as a simple fired/total percentage.


			if ( conRowObj.firArr.length >= 2 ) { // What: Interval Computable Check. Why: An average gap needs at least two fire dates to measure a gap between. How: This sorts the fire dates and averages the day-gaps between each consecutive pair.


				const sorDatArr = conRowObj.firArr.slice().sort(); // What: Sorted Date Array. Why: Consecutive-gap math requires the fire dates in chronological order. How: This is a plain string sort, safe since ISO dates sort lexicographically in date order.

				let gapSumNum = 0; // What: Gap Sum Number. Why: The running total of day-gaps needs an accumulator before the loop below can average it. How: This starts at zero and is added to by every consecutive pair.


				for ( let indCurNum = 1; indCurNum < sorDatArr.length; indCurNum++ ) gapSumNum += ( new Date( sorDatArr[ indCurNum ] ).getTime() - new Date( sorDatArr[ indCurNum - 1 ] ).getTime() ) / 86400000; // What: Gap Accumulation Loop. Why: Every consecutive pair of fire dates contributes one day-gap to the running average. How: This divides the millisecond difference between two Dates by a day's own millisecond count and adds it to gapSumNum.



				conRowObj.intNum = Math.round( gapSumNum / ( sorDatArr.length - 1 ) ); // What: Interval Number Assignment. Why: The finished average needs to be stored back onto the accumulator for the breakdown list to read. How: This divides the summed gaps by the number of gaps (one fewer than the date count) and rounds to a whole day.


			}

			else conRowObj.intNum = null; // What: No Interval Case. Why: Fewer than two fire dates means there's no gap at all to average. How: This explicitly marks intNum as null rather than leaving it undefined.



			conRowObj.ratNum = conRowObj.totNum ? Math.round( ( conRowObj.firNum / conRowObj.totNum ) * 100 ) : null; // What: Rate Number Assignment. Why: The breakdown list's own default sort and display both need a plain fire-rate percentage. How: This divides firNum by totNum, guarding against a zero total, rounding to a whole percent.


		}



		const outConArr = []; // What: Out Conditional Array. Why: The finished stats need a stable, deterministic order rather than the Map's own insertion order. How: This starts empty and is filled below, live conditionals first in their own definition order, then deleted ones.


		for ( const conCurObj of conDefArr ) outConArr.push( conAccMap.get( conCurObj.id ) ); // What: Live Order Push Loop. Why: Live conditionals should list in the same order their own definitions are stored in. How: This looks each one back up by id and appends it.



		for ( const conRowObj of conAccMap.values() ) if ( conRowObj.delBoo ) outConArr.push( conRowObj ); // What: Deleted Append Loop. Why: A deleted conditional's history should still surface, appended after every live one. How: This appends every accumulator flagged deleted.



		return outConArr; // What: Conditional Stats Return. Why: This is the finished, per-conditional summary the headline numbers and breakdown list both read from. How: This returns the ordered array built above.


	}, [ conDefArr, conLogArr, cutIsoStr ] ); // What: Memo Dependency Array. Why: The whole summary only ever needs recomputing when the live definitions, the trigger log, or the active range's own cutoff changes. How: conDefArr seeds live rows, conLogArr supplies the history folded in, cutIsoStr bounds which rows count.


	const conTotObj = React.useMemo( () => { // What: Conditional Totals Object Memo. Why: The Conditionals headline cards need one combined totNum/firNum/ratNum/lasStr across every conditional, not per-conditional detail. How: This reduces conStaArr into those four combined fields.


		const totCouNum = conStaArr.reduce( ( sumRunNum, conRowObj ) => sumRunNum + conRowObj.totNum, 0 );                                                                             // What: Total Count Number. Why: The headline "cycles" card needs the combined evaluated-cycle count across every conditional. How: This sums every conditional's own totNum field.
		const firCouNum = conStaArr.reduce( ( sumRunNum, conRowObj ) => sumRunNum + conRowObj.firNum, 0 );                                                                             // What: Fired Count Number. Why: The headline "triggered" card needs the combined fired count across every conditional. How: This sums every conditional's own firNum field.
		const lasFirStr = conStaArr.reduce( ( maxDatStr, conRowObj ) => ( conRowObj.lasStr && ( !maxDatStr || conRowObj.lasStr > maxDatStr ) ) ? conRowObj.lasStr : maxDatStr, null ); // What: Last Fired String. Why: The headline "last fired" card needs the single most recent fire date across every conditional. How: This reduces to whichever conditional's own lasStr is the latest.



		return { // What: Conditional Totals Return. Why: The four headline cards each read one field off this combined object. How: This packages the three reduced values plus a derived combined rate percentage.


			firNum : firCouNum,                                                     // What: Fired Number. Why: The "triggered" card shows this. How: This passes the combined fired count.
			lasStr : lasFirStr,                                                     // What: Last String. Why: The "last fired" card shows this. How: This passes the latest fire date.
			ratNum : totCouNum ? Math.round( ( firCouNum / totCouNum ) * 100 ) : 0, // What: Rate Number. Why: The "fire rate" card shows this. How: This divides fired by total, guarding against zero.
			totNum : totCouNum                                                      // What: Total Number. Why: The "cycles" card shows this. How: This passes the combined cycle count.


		};


	}, [ conStaArr ] ); // What: Memo Dependency Array. Why: The combined totals only ever need recomputing when the per-conditional stats array itself changes. How: conStaArr is the sole source every reduce above reads from.


	const conBreArr = React.useMemo( () => { // What: Conditional Breakdown Array Memo. Why: The Conditionals breakdown card needs conStaArr resorted by whichever metric pill is currently active. How: This picks a comparable value per conMetStr, then sorts with nulls always sinking to the bottom. // Conditionals breakdown list, sorted by the active metric. A null metric value (no rate / no interval / never fired) always sinks to the bottom regardless of sort direction.


		const conValFun = ( conRowObj : { firNum : number, intNum : number | null, lasStr : string | null, ratNum : number | null, totNum : number } ) => conMetStr === 'triggers' // What: Conditional Value Function. Why: Each metric pill compares a different field, so the sort below needs one function resolving "the active metric's own value" per row. How: This branches on conMetStr, defaulting to the fire-rate field.
			? conRowObj.firNum                                                     // What: Triggers Branch. Why: The triggers metric compares fired counts. How: This returns firNum.
			: conMetStr === 'cycles'                                               // What: Cycles Check. Why: The cycles metric compares evaluated-cycle counts. How: This tests for the cycles pill next.
			? conRowObj.totNum                                                     // What: Cycles Branch. Why: The cycles metric compares totals. How: This returns totNum.
			: conMetStr === 'interval'                                             // What: Interval Check. Why: The interval metric compares average gaps. How: This tests for the interval pill next.
			? conRowObj.intNum                                                     // What: Interval Branch. Why: The interval metric compares average gaps. How: This returns intNum, possibly null.
			: conMetStr === 'last'                                                 // What: Last Check. Why: The last-fired metric compares dates. How: This tests for the last pill next.
			? ( conRowObj.lasStr ? new Date( conRowObj.lasStr ).getTime() : null ) // What: Last Branch. Why: Dates need a numeric form to compare. How: This converts lasStr to a timestamp, or null when it never fired.
			: conRowObj.ratNum;                                                    // What: Rate Branch. Why: Fire rate is the default metric. How: This returns ratNum, possibly null.


		const sorDirNum = conSorStr === 'desc' ? 1 : -1; // What: Sort Direction Number. Why: The comparator below needs a plain +1/-1 multiplier instead of re-checking the string every comparison. How: This is 1 for descending, -1 for ascending.



		return conStaArr.slice().sort( ( conOneObj, conTwoObj ) => { // What: Sorted Copy Return. Why: The original conStaArr order must stay stable for other consumers, so a copy is sorted instead. How: This compares each pair's own conValFun result, sinking a null value to the bottom regardless of direction.


		const valOneNum = conValFun( conOneObj ); // What: Value One Number. Why: The left side of the comparison needs its own resolved metric value. How: This calls conValFun on conOneObj.
		const valTwoNum = conValFun( conTwoObj ); // What: Value Two Number. Why: The right side of the comparison needs its own resolved metric value. How: This calls conValFun on conTwoObj.


			if ( valOneNum == null && valTwoNum == null ) return 0; // What: Both Null Guard. Why: Two equally-missing values have no real order between them. How: This treats them as tied.



			if ( valOneNum == null ) return 1; // What: Left Null Guard. Why: A missing value always sinks to the bottom regardless of sort direction. How: This orders the left side after the right.



			if ( valTwoNum == null ) return -1; // What: Right Null Guard. Why: Same reasoning as the left-null guard, mirrored. How: This orders the right side after the left.



			return ( valTwoNum - valOneNum ) * sorDirNum; // What: Numeric Comparison Return. Why: Both values are real numbers at this point, so a normal subtraction comparison applies. How: This orders high-to-low by default, flipped to low-to-high by sorDirNum.


		} );


	}, [ conStaArr, conMetStr, conSorStr ] ); // What: Memo Dependency Array. Why: The sorted list only ever needs recomputing when the underlying stats, the active metric, or the sort direction changes. How: conStaArr supplies the rows, conMetStr picks the compared field, conSorStr picks the direction.

	// #endregion Conditionals Scope Data



	// #region Group And Type Filters

	const exiGroArr = React.useMemo( () => { // What: Existing Group Array Memo. Why: The Group filter row needs the live, deduplicated set of group names actually in use. How: This walks picLisArr once, collecting each non-hidden picker's own group the first time it's seen, then sorts alphabetically. // Distinct group names, alphabetical: drives the group selector that narrows the Show row below it (mirrors the Pickers tab; "All" itself is a separate, always-first pill rendered outside this list).


		const seeGroArr : string[] = []; // What: Seen Group Array. Why: A plain array preserves first-seen order for the loop below to check membership against, before the final sort reorders it. How: This starts empty and is pushed to as new group names are found.

		for ( const picCurObj of picLisArr ) { // What: Group Collection Loop. Why: Every non-hidden picker with a group contributes that group name, but only once each. How: This pushes a picker's own group the first time it's encountered.


			const hasGroBoo = !!picCurObj.group;                      // What: Has Group Boolean. Why: A picker with no group contributes nothing to this row. How: This checks the picker's own group field.
			const visPicBoo = !picCurObj.hidden;                      // What: Visible Picker Boolean. Why: A hidden picker's own group must not surface here. How: This checks the picker's own hidden flag.
			const newGroBoo = !seeGroArr.includes( picCurObj.group ); // What: New Group Boolean. Why: Each group name belongs in the list only once. How: This checks the group isn't already collected.

			const addGroBoo = hasGroBoo && visPicBoo && newGroBoo; // What: Add Group Boolean. Why: All three conditions must hold before a group is collected. How: This combines the three checks above.


			if ( addGroBoo ) seeGroArr.push( picCurObj.group ); // What: Group Push Call. Why: This is the actual collection of a new group name. How: This appends the picker's own group.


		}



		return seeGroArr.sort( ( groOneStr, groTwoStr ) => groOneStr.localeCompare( groTwoStr ) ); // What: Sorted Group Return. Why: The filter row's own pills should list alphabetically, not in whatever order pickers happen to be stored. How: This sorts the collected group names via localeCompare.


	}, [ picLisArr ] ); // What: Memo Dependency Array. Why: The group list only ever needs recomputing when the live picker list itself changes. How: picLisArr is the sole source the loop above reads from.


	const [ staGroStr, setStaGroStr ] = React.useState( 'all' ); // What: Stat Group String And Setter. Why: This is the single source of truth for the active Group filter pill. How: This is read by visPicArr below and written by the Group filter row's own buttons. // staGroStr only scopes which pickers appear in the Show row below; it never filters the stats themselves. 'all' also lets the All + Reminders options show. A hidden picker (see store.ts's own hidden flag) never appears here at all.


	const exiModArr = React.useMemo( () => { // What: Existing Mode Array Memo. Why: The Type filter row needs the live, deduplicated set of picker modes actually in use, ordered by their own display label. How: This walks picLisArr once collecting non-hidden modes into a Set, then sorts by SED_NAM_OBJ.MOD_DEF_OBJ's own label text. // Distinct modes actually in use, alphabetical by their own display label: feeds the Type filter row's own picker-mode pills ("All" pinned first, same as Group). Independent of staGroStr, both narrow visPicArr together.


		const seeModSet = new Set< string >(); // What: Seen Mode Set. Why: A Set naturally deduplicates without a manual membership check, unlike the group loop above which needed first-seen order preserved. How: This starts empty and is added to below.

		for ( const picCurObj of picLisArr ) if ( !picCurObj.hidden ) seeModSet.add( picCurObj.mode ); // What: Mode Collection Loop. Why: Every non-hidden picker contributes its own mode key. How: This adds a picker's own mode to the set.



		return [ ...seeModSet ].sort( ( modOneStr, modTwoStr ) => SED_NAM_OBJ.MOD_DEF_OBJ[ modOneStr ].labStr.localeCompare( SED_NAM_OBJ.MOD_DEF_OBJ[ modTwoStr ].labStr ) ); // What: Sorted Mode Return. Why: The Type row's own pills should list by their user-facing label, not their raw internal mode key. How: This spreads the set into an array and sorts by each mode's own SED_NAM_OBJ.MOD_DEF_OBJ label.


	}, [ picLisArr ] ); // What: Memo Dependency Array. Why: The mode list only ever needs recomputing when the live picker list itself changes. How: picLisArr is the sole source the loop above reads from.


	const [ typFilStr, setTypFilStr ] = React.useState( 'all' ); // What: Type Filter String And Setter. Why: This is the single source of truth for the active Type filter pill, including the Conditionals/Reminders sentinels. How: This is read by visPicArr below and written by the Type filter row's own buttons. // typFilStr also carries the Conditionals/Reminders sentinel values (moved here from staGroStr): a real picker's mode never matches either, so visPicArr naturally excludes every real picker under both, same as any other empty filter value.


	const visPicArr = React.useMemo( () => ( // What: Visible Picker Array Memo. Why: The Show row below needs the live picker list narrowed by both the Group and Type filters together. How: This filters out hidden pickers, then applies staGroStr and typFilStr as optional equality checks.


		picLisArr.filter( ( picCurObj ) => { // What: Visible Picker Filter. Why: Each picker must pass the hidden, group, and type checks together. How: This combines the three checks into one keep/drop decision per picker.


			const visPicBoo = !picCurObj.hidden;                                    // What: Visible Picker Boolean. Why: A hidden picker never appears in the Show row. How: This checks the picker's own hidden flag.
			const groMatBoo = staGroStr === 'all' || picCurObj.group === staGroStr; // What: Group Match Boolean. Why: The Group filter narrows the row to one group. How: This passes every picker under 'all', otherwise only matching groups.
			const typMatBoo = typFilStr === 'all' || picCurObj.mode === typFilStr;  // What: Type Match Boolean. Why: The Type filter narrows the row to one mode. How: This passes every picker under 'all', otherwise only matching modes.

			const keePicBoo = visPicBoo && groMatBoo && typMatBoo; // What: Keep Picker Boolean. Why: A picker only shows when all three checks pass. How: This combines the three checks above.



			return keePicBoo; // What: Keep Picker Return. Why: Array.filter keeps exactly the pickers this returns true for. How: This returns keePicBoo.


		} )


	), [ picLisArr, staGroStr, typFilStr ] ); // What: Memo Dependency Array. Why: The narrowed list only ever needs recomputing when the live picker list or either filter itself changes. How: picLisArr supplies the rows, staGroStr and typFilStr each gate one of the two filter checks above.

	// #endregion Group And Type Filters



	// #region Reminder Availability

	const remOptObj = React.useMemo( () => TAS_NAM_OBJ.norOptFun( staAppObj.reminderOpts ), [ staAppObj.reminderOpts ] );                                 // What: Reminder Options Object. Why: Which reminder types opt into Stats is a persisted setting that may be missing/partial on an older save. How: This normalizes the raw persisted reminderOpts via TAS_NAM_OBJ' own helper. It's memoized on the saved options, so it keeps one identity until they change.
	const enaTypArr = React.useMemo( () => ( [ 'once', 'recurring' ] as const ).filter( ( typCurStr ) => remOptObj[ typCurStr ].stats ), [ remOptObj ] ); // What: Enabled Type Array. Why: Every reminder-scoped query below needs to know exactly which of the two types are opted into Stats. How: This keeps whichever of 'once'/'recurring' has its own stats flag turned on, memoized on remOptObj so the dependency arrays below see one stable array until the options change. // What: Type Assertion Note. Why: Each class name indexes the reminder options. How: The two names are read as a constant tuple so each one is a real class key.
	const remEnaBoo = enaTypArr.length > 0; // What: Reminder Enabled Boolean. Why: The whole Reminders scope, and its Type-row pill, should only exist once at least one reminder type opts in. How: This is true when enaTypArr isn't empty.


	React.useEffect( () => { // What: Reminder Scope Guard Effect. Why: Turning off every reminder type's own Stats opt-in while the Reminders scope is active would otherwise leave the page showing a now-unreachable scope. How: This falls back to 'all' whenever scoValStr is 'reminders' but remEnaBoo has gone false. // Don't strand the view on a Reminders scope that's just been turned off.


		if ( scoValStr === 'reminders' && !remEnaBoo ) setScoValStr( 'all' ); // What: Reminder Scope Fallback. Why: A disabled Reminders scope must not strand the view. How: This resets scoValStr to 'all' whenever reminders are off but still selected.


	}, [ scoValStr, remEnaBoo ] ); // What: Effect Dependency Array. Why: This only ever needs re-checking when the active scope or the reminders-enabled flag changes. How: scoValStr is what's being validated, remEnaBoo is what it's validated against.


	React.useEffect( () => { // What: Conditional Scope Guard Effect. Why: Deleting every conditional while the Conditionals scope is active would otherwise leave the page showing a now-unreachable scope. How: This falls back to 'all' whenever scoValStr is 'conditionals' but hasConBoo has gone false. // Same guard for a Conditionals scope once every conditional is gone.


		if ( scoValStr === 'conditionals' && !hasConBoo ) setScoValStr( 'all' ); // What: Conditional Scope Fallback. Why: An empty Conditionals scope must not strand the view. How: This resets scoValStr to 'all' whenever no conditional remains but that scope is still selected.


	}, [ scoValStr, hasConBoo ] ); // What: Effect Dependency Array. Why: This only ever needs re-checking when the active scope or the has-conditionals flag changes. How: scoValStr is what's being validated, hasConBoo is what it's validated against.

	// #endregion Reminder Availability



	const sorVisArr = React.useMemo( () => ( // What: Sorted Visible Array Memo. Why: The scope-repair effect below needs to know which picker the Show row would render first. How: This sorts a copy of visPicArr by each picker's own name. // Same alphabetical order the Show row itself renders its pickers in (below), reused so "jump to the first card" always agrees with what's actually shown first, not visPicArr's own storage-array order.


		[ ...visPicArr ].sort( ( picOneObj, picTwoObj ) => picOneObj.name.localeCompare( picTwoObj.name ) ) // What: Name Sorted Copy. Why: The original visPicArr order must stay untouched. How: This sorts a spread copy by each picker's own name.


	), [ visPicArr ] ); // What: Memo Dependency Array. Why: This only ever needs resorting when the visible picker list itself changes. How: visPicArr is the sole source the sort above reads from.


	const preFilRef = React.useRef( { staGroStr, typFilStr } ); // What: Previous Filter Reference. Why: The repair effect below needs to remember the last-seen filter pair across renders to detect an actual change. How: This starts at the current filter pair and is updated by the effect below on every run. // Keep scoValStr coherent with the Group + Type filters: within a specific group and/or type, All/Reminders aren't offered, so if the current scope isn't one of the filtered pickers, fall back to the first one, alphabetically, matching the Show row. Also jumps whenever either filter itself just changed, not only once the OLD scope happens to fall out of view (e.g. switching between two groups that both happen to contain the same picker used to leave the view stranded there instead of jumping to the new filter's own first card).


	React.useEffect( () => { // What: Scope Repair Effect. Why: A stale or now-unreachable scope must be corrected, to All while both filters are on All, otherwise to the new filter's own first alphabetical picker. How: This detects a filter change or an out-of-view scope and reassigns scoValStr accordingly.


		const filChaBoo = preFilRef.current.staGroStr !== staGroStr || preFilRef.current.typFilStr !== typFilStr; // What: Filters Changed Boolean. Why: The repair below must run both on a filter change and on a stale scope, not only the latter. How: This compares the previous filter pair against the current one.

		preFilRef.current = { staGroStr, typFilStr }; // What: Previous Filter Update. Why: The next run of this effect needs to compare against the filter pair that's current now. How: This overwrites preFilRef with the freshly-observed pair.



		if ( typFilStr === 'conditionals' || typFilStr === 'reminders' ) return; // What: Sentinel Type Guard. Why: Neither sentinel value has any "visible pickers" to fall back to. How: This bails out of the repair entirely while either sentinel is active. // 'conditionals'/'reminders' are the Type row's own sentinel values (their pill sets scope directly), not a real picker mode to auto-pick a first card from, since visPicArr is empty for both, so falling through below would immediately reset scoValStr back to 'all' right after it's set.



		const allTypBoo = typFilStr === 'all';                                           // What: All Type Boolean. Why: The All, Conditionals, and Reminders tabs only appear in the Show row while the Type filter is on All. How: This checks typFilStr for 'all'.
		const defFilBoo = staGroStr === 'all' && allTypBoo;                              // What: Default Filter Boolean. Why: The All tab only appears while both filters are on All, and that's also when the fallback should land on All. How: This checks staGroStr alongside allTypBoo.
		const allScoBoo = scoValStr === 'all' && defFilBoo;                              // What: All Scope Boolean. Why: The All scope is only valid while its tab is in the Show row. How: This checks scoValStr for 'all' while defFilBoo holds.
		const conScoBoo = scoValStr === 'conditionals' && allTypBoo && hasConBoo;        // What: Conditional Scope Boolean. Why: The Conditionals scope is only valid while its tab is in the Show row. How: This checks scoValStr for 'conditionals' while the Type filter is on All and conditionals exist.
		const picScoBoo = visPicArr.some( ( picCurObj ) => picCurObj.id === scoValStr ); // What: Picker Scope Boolean. Why: A picker scope is only valid while that picker is still in view. How: This checks visPicArr for scoValStr's id.
		const remScoBoo = scoValStr === 'reminders' && allTypBoo && remEnaBoo;           // What: Reminder Scope Boolean. Why: The Reminders scope is only valid while its tab is in the Show row. How: This checks scoValStr for 'reminders' while the Type filter is on All and a reminder type is enabled.

		const scoLivBoo = allScoBoo || conScoBoo || picScoBoo || remScoBoo; // What: Scope Live Boolean. Why: The repair only needs to move a scope whose tab is no longer in the Show row. How: This combines the four scope checks above.


		const falScoStr = defFilBoo ? 'all' : ( sorVisArr[ 0 ] ? sorVisArr[ 0 ].id : 'all' ); // What: Fallback Scope String. Why: With both filters on All the page should show the combined dashboard, the same as the Group and Type All pills ask for, while a narrowed filter lands on its first picker. How: This picks 'all' while defFilBoo holds, else the first sorted visible picker, else 'all'.


		if ( filChaBoo || !scoLivBoo ) setScoValStr( falScoStr ); // What: Scope Reassignment. Why: A changed filter or a scope whose tab left the Show row both need the same fallback. How: This writes falScoStr into scoValStr.


	}, [ hasConBoo, remEnaBoo, scoValStr, sorVisArr, staGroStr, typFilStr, visPicArr ] ); // What: Effect Dependency Array. Why: This must re-run whenever either filter, the resulting visible/sorted lists, the Conditionals and Reminders tabs' availability, or the scope itself changes. How: staGroStr/typFilStr detect a filter change, visPicArr/sorVisArr supply the picker checks and fallback, hasConBoo/remEnaBoo decide whether those two tabs exist, and scoValStr is what's being validated.



	const isaRemBoo = scoValStr === 'reminders'; // What: Is-A Reminder Boolean. Why: Many blocks below need a quick check for whether the Reminders scope is the active one. How: This compares scoValStr against the 'reminders' sentinel value.



	// #region Filter Row Scroll Fades

	const scoRowRef = React.useRef< HTMLDivElement | null >( null ); // What: Scope Row Reference. Why: The Show row's own scroll-fade effect below needs a handle on its DOM node. How: This is attached to the Show row's own ref prop and read inside the effect. // Scroll-edge fades on the filter pill rows, the same affordance as the Pickers tab strip: a mask gradient that only fades the side with more content.
	const groRowRef = React.useRef< HTMLDivElement | null >( null ); // What: Group Row Reference. Why: The Group row's own scroll-fade effect below needs a handle on its DOM node. How: This is attached to the Group row's own ref prop and read inside the effect.
	const typRowRef = React.useRef< HTMLDivElement | null >( null ); // What: Type Row Reference. Why: The Type row's own scroll-fade effect below needs a handle on its DOM node. How: This is attached to the Type row's own ref prop and read inside the effect.
	const ranRowRef = React.useRef< HTMLDivElement | null >( null ); // What: Range Row Reference. Why: The Range row's own scroll-fade effect below needs a handle on its DOM node. How: This is attached to the Range row's own ref prop and read inside the effect.
	const metRowRef = React.useRef< HTMLDivElement | null >( null ); // What: Metric Row Reference. Why: The Pick breakdown metric row's own scroll-fade effect below needs a handle on its DOM node. How: This is attached to that row's own ref prop and read inside the effect.
	const remRowRef = React.useRef< HTMLDivElement | null >( null ); // What: Reminder Row Reference. Why: The Reminders breakdown metric row's own scroll-fade effect below needs a handle on its DOM node. How: This is attached to that row's own ref prop and read inside the effect.
	const conRowRef = React.useRef< HTMLDivElement | null >( null ); // What: Conditional Row Reference. Why: The Conditionals breakdown metric row's own scroll-fade effect below needs a handle on its DOM node. How: This is attached to that row's own ref prop and read inside the effect.


	React.useEffect( () => { // What: Scroll Fade Effect. Why: Every filter/metric pill row needs the same "fade the scrollable edge" affordance, without duplicating the logic once per row. How: This attaches one scroll/resize-driven class toggler to each currently-mounted ref, then tears every one of them down on cleanup.


		const rowEleArr = [ scoRowRef.current, groRowRef.current, typRowRef.current, ranRowRef.current, metRowRef.current, remRowRef.current, conRowRef.current ].filter( isaTruFun ); // What: Row Element Array. Why: Not every row is mounted at once (e.g. the Group row only exists with 2+ groups), so only the currently-real DOM nodes should get a listener. How: This collects every ref's own current value, dropping any that are still null.


		const cleFunArr = rowEleArr.map( ( rowCurEle ) => { // What: Cleanup Function Array. Why: Each row needs its own scroll listener and ResizeObserver, and each needs its own matching teardown. How: This maps every row element to a function that removes that specific row's own listener and observer.


			const updFadFun = () => togFadFun( rowCurEle ); // What: Update Fade Function. Why: Both the initial state and every future scroll/resize need the same scroll-edge recalculation. How: This calls togFadFun on rowCurEle.


			updFadFun(); // What: Initial Fade Update Call. Why: The row's own fade state must be correct immediately on mount, not only after the first scroll/resize. How: This invokes updFadFun once, synchronously.


			rowCurEle.addEventListener( 'scroll', updFadFun, { passive : true } ); // What: Scroll Listener Attach. Why: The fade must track the row's own live scroll position as the user drags it. How: This re-runs updFadFun on every scroll event, passively for smoother scrolling.


			const rowObsObj = new ResizeObserver( updFadFun ); // What: Row Observer Object. Why: A row's own scrollability can change purely from a resize (e.g. rotating the device), without any scroll event firing. How: This re-runs updFadFun whenever the row's own size changes.


			rowObsObj.observe( rowCurEle ); // What: Row Observer Start. Why: The observer created above does nothing until it's told which element to watch. How: This begins watching rowCurEle for size changes.



			return () => { // What: Row Cleanup Return. Why: Both the listener and the observer must not outlive this effect run. How: This removes the scroll listener and disconnects the observer together.


				rowCurEle.removeEventListener( 'scroll', updFadFun ); // What: Scroll Listener Teardown. Why: The listener must not outlive this effect run. How: This removes the same updFadFun reference from rowCurEle.

				rowObsObj.disconnect(); // What: Row Observer Teardown. Why: The observer must not keep watching after this effect run. How: This disconnects rowObsObj entirely.


			};


		} );



		return () => cleFunArr.forEach( ( cleCurFun ) => cleCurFun() ); // What: Effect Cleanup Return. Why: Every row's own cleanup function built above must actually run on unmount or re-run. How: This invokes each one in turn.


	}, [ picLisArr.length, remEnaBoo, scoValStr, ranValStr, metKeyStr, remMetStr, conMetStr, isaConBoo, isaRemBoo, staGroStr, typFilStr, exiModArr.length, visPicArr.length ] ); // What: Effect Dependency Array. Why: Any change that can mount, unmount, resize, or reflow one of these rows needs this to re-attach its listeners against the current DOM nodes. How: picLisArr.length, staGroStr, typFilStr, and visPicArr.length change how many pills the Show and Group rows hold, exiModArr.length and remEnaBoo decide whether the Type row exists, scoValStr, isaConBoo, and isaRemBoo swap which scope's metric rows mount, ranValStr moves the Range row's selection, and metKeyStr, remMetStr, and conMetStr move each metric row's selection.

	// #endregion Filter Row Scroll Fades



	// #region Pick And Reminder Rows

	const picRowArr = React.useMemo( () => { // What: Pick Row Array Memo. Why: Nearly every pick-shaped card below shares this one range/scope/hidden-filtered view of the log. How: This keeps only active (no outcome) rows matching the current scope, hidden-picker exclusion, and range cutoff. // Pick rows for the active scope ('all' or a single picker). Active picks only: rejected (re-rolled-away) and skipped rows are excluded here so they never touch completion, totals, rankings, or the heatmap.


		if ( isaRemBoo ) return []; // What: Reminders Scope Guard. Why: The Reminders scope has no pick rows of its own to derive. How: This returns an empty array whenever the Reminders scope is active.



		return picLogArr.filter( ( rowCurObj ) => { // What: Pick Row Filter Return. Why: Each logged row must pass the outcome, hidden, scope, and range checks together. How: This combines the four checks into one keep/drop decision per row.


			const actRowBoo = !rowCurObj.outcome;                                      // What: Active Row Boolean. Why: Rejected and skipped rows never count here. How: This keeps only rows with no outcome.
			const visPicBoo = !hidPicSet.has( rowCurObj.pickerId );                    // What: Visible Picker Boolean. Why: A hidden picker's own history must not surface. How: This checks the row's picker against hidPicSet.
			const scoMatBoo = scoValStr === 'all' || rowCurObj.pickerId === scoValStr; // What: Scope Match Boolean. Why: A single-picker scope only counts its own rows. How: This passes every row under 'all', otherwise only the scoped picker's.
			const ranMatBoo = !cutIsoStr || rowCurObj.date >= cutIsoStr;               // What: Range Match Boolean. Why: Only rows inside the active range count. How: This passes every row with no cutoff, otherwise only rows on or after it.

			const keeRowBoo = actRowBoo && visPicBoo && scoMatBoo && ranMatBoo; // What: Keep Row Boolean. Why: A row only counts when all four checks pass. How: This combines the four checks above.



			return keeRowBoo; // What: Keep Row Return. Why: Array.filter keeps exactly the rows this returns true for. How: This returns keeRowBoo.


		} );


	}, [ picLogArr, scoValStr, cutIsoStr, isaRemBoo, hidPicSet ] ); // What: Memo Dependency Array. Why: This filtered view only ever needs recomputing when the raw log, the active scope, the range cutoff, the Reminders-scope flag, or the hidden-picker set changes. How: Each dependency corresponds to one of the four filter conditions above (or the log itself).


	const rejCouMap = React.useMemo( () => { // What: Rejected Count Map Memo. Why: The Pick breakdown's own "Re-Rolled Away" metric needs a per-item rejection count under the same scope/range rules as picRowArr. How: This walks the raw log once, counting only 'rejected'-outcome rows matching the active filters. // Per-item count of re-rolled-away (rejected) rows, range + scope aware.


		const outMapObj = new Map(); // What: Out Map Object. Why: The counts need a fresh accumulator to build up as the loop below runs. How: This starts empty and is filled by the loop.



		if ( isaRemBoo ) return outMapObj; // What: Reminders Scope Guard. Why: The Reminders scope has no rejected pick rows to count. How: This returns the still-empty map whenever the Reminders scope is active.



		for ( const rowCurObj of picLogArr ) { // What: Rejection Count Loop. Why: Every logged row must be checked against the same outcome/hidden/scope/range rules picRowArr itself uses. How: This skips any row that doesn't match, then increments that item's own running count.


			if ( rowCurObj.outcome !== 'rejected' ) continue; // What: Outcome Guard. Why: Only a re-rolled-away row counts toward this metric. How: This skips any row whose own outcome isn't 'rejected'.



			if ( hidPicSet.has( rowCurObj.pickerId ) ) continue; // What: Hidden Picker Guard. Why: A hidden picker's own history must not surface in this count. How: This skips any row belonging to a hidden picker.



			if ( scoValStr !== 'all' && rowCurObj.pickerId !== scoValStr ) continue; // What: Scope Guard. Why: A single-picker scope must only count that picker's own rows. How: This skips any row from a different picker while scoValStr isn't 'all'.



			if ( cutIsoStr && rowCurObj.date < cutIsoStr ) continue; // What: Range Guard. Why: Only rows inside the active range should count. How: This skips any row dated before cutIsoStr.



			outMapObj.set( rowCurObj.itemId, ( outMapObj.get( rowCurObj.itemId ) || 0 ) + 1 ); // What: Count Increment. Why: This is the actual per-item tally the metric reads. How: This increments the row's own itemId entry, defaulting a first-seen item to zero.


		}



		return outMapObj; // What: Rejected Count Return. Why: This is the finished per-item map the breakdown's Re-Rolled Away column reads. How: This returns the map built above.


	}, [ picLogArr, scoValStr, cutIsoStr, isaRemBoo, hidPicSet ] ); // What: Memo Dependency Array. Why: This map only ever needs rebuilding when the same inputs picRowArr itself depends on change. How: Each dependency gates one of the same four filter conditions.


	const skiCouMap = React.useMemo( () => { // What: Skipped Count Map Memo. Why: The Pick breakdown's own "Skipped" metric needs a per-item skip count under the same scope/range rules as picRowArr. How: This walks the raw log once, counting only 'skipped'-outcome rows matching the active filters. // Per-item count of skipped rows, range + scope aware.


		const outMapObj = new Map(); // What: Out Map Object. Why: The counts need a fresh accumulator to build up as the loop below runs. How: This starts empty and is filled by the loop.



		if ( isaRemBoo ) return outMapObj; // What: Reminders Scope Guard. Why: The Reminders scope has no skipped pick rows to count. How: This returns the still-empty map whenever the Reminders scope is active.



		for ( const rowCurObj of picLogArr ) { // What: Skip Count Loop. Why: Every logged row must be checked against the same outcome/hidden/scope/range rules picRowArr itself uses. How: This skips any row that doesn't match, then increments that item's own running count.


			if ( rowCurObj.outcome !== 'skipped' ) continue; // What: Outcome Guard. Why: Only a skipped row counts toward this metric. How: This skips any row whose own outcome isn't 'skipped'.



			if ( hidPicSet.has( rowCurObj.pickerId ) ) continue; // What: Hidden Picker Guard. Why: A hidden picker's own history must not surface in this count. How: This skips any row belonging to a hidden picker.



			if ( scoValStr !== 'all' && rowCurObj.pickerId !== scoValStr ) continue; // What: Scope Guard. Why: A single-picker scope must only count that picker's own rows. How: This skips any row from a different picker while scoValStr isn't 'all'.



			if ( cutIsoStr && rowCurObj.date < cutIsoStr ) continue; // What: Range Guard. Why: Only rows inside the active range should count. How: This skips any row dated before cutIsoStr.



			outMapObj.set( rowCurObj.itemId, ( outMapObj.get( rowCurObj.itemId ) || 0 ) + 1 ); // What: Count Increment. Why: This is the actual per-item tally the metric reads. How: This increments the row's own itemId entry, defaulting a first-seen item to zero.


		}



		return outMapObj; // What: Skipped Count Return. Why: This is the finished per-item map the breakdown's Skipped column reads. How: This returns the map built above.


	}, [ picLogArr, scoValStr, cutIsoStr, isaRemBoo, hidPicSet ] ); // What: Memo Dependency Array. Why: This map only ever needs rebuilding when the same inputs picRowArr itself depends on change. How: Each dependency gates one of the same four filter conditions.


	const remRowArr = React.useMemo( () => ( // What: Reminder Row Array Memo. Why: Every reminder-shaped card below shares this one type/hidden/range-filtered view of the reminder completion log. How: This keeps only rows whose own type opts into Stats, whose own task isn't hidden, and whose own completion date is inside the active range. // Reminder rows for the active range.


		( staAppObj.reminderLog || [] )                                                                           // What: Reminder Log Source. Why: The chain below starts from the raw completion log. How: This falls back to an empty array for a fresh install.
			.filter( ( rowCurObj ) => enaTypArr.includes( rowCurObj.type ) )                                      // What: Enabled Type Filter. Why: Only reminder types opted into Stats count. How: This keeps rows whose own type is in enaTypArr.
			.filter( ( rowCurObj ) => !hidTasSet.has( rowCurObj.taskId ) )                                        // What: Hidden Task Filter. Why: A hidden task's own history must not surface. How: This drops rows whose task is in hidTasSet.
			.filter( ( rowCurObj ) => !cutIsoStr || isoDayFun( new Date( rowCurObj.completedAt ) ) >= cutIsoStr ) // What: Range Filter. Why: Only completions inside the active range count. How: This keeps rows completed on or after cutIsoStr, or every row with no cutoff.


	), [ cutIsoStr, enaTypArr, hidTasSet, staAppObj.reminderLog ] ); // What: Memo Dependency Array. Why: This filtered view only ever needs recomputing when the raw log, the enabled-types set, the range cutoff, or the hidden-task set changes. How: enaTypArr is memoized on its two flags, so it only gets a new identity when the enabled set really changes.


	const dayAggMap = React.useMemo( () => { // What: Day Aggregate Map Memo. Why: The heatmap, streak, and full-days count all need one shared per-day rollup, built once instead of separately per card. How: This walks either remRowArr or picRowArr (whichever scope is active) into a Map keyed by calendar day. // Per-day aggregation, one { donNum, iteArr, totNum } entry per calendar day, each iteArr entry a { donBoo, namStr } pair. A pick day counts every logged row toward totNum and only completed ones toward donNum; a reminder day counts every completion toward both.


		const outMapObj = new Map< string, { donNum : number, iteArr : { donBoo : boolean, namStr : string }[], totNum : number } >(); // What: Out Map Object. Why: The per-day rollup needs a fresh accumulator to build up as the loop below runs. How: This starts empty and is filled by whichever branch below runs.

		if ( isaRemBoo ) { // What: Reminders Aggregation Branch. Why: A reminder completion has no "possible total" the way a pick day does, so its own day entry counts done and total identically. How: This walks remRowArr, incrementing both done and total for every completion on its own day.


			for ( const rowCurObj of remRowArr ) { // What: Reminder Row Aggregation Loop. Why: Every completion needs folding into its own calendar day's entry. How: This looks up (or lazily creates) that day's entry, then increments it and appends the completed reminder's own name.


				const dayKeyStr = isoDayFun( new Date( rowCurObj.completedAt ) );                        // What: Day Key String. Why: The Map needs a plain calendar-day string to key each entry by. How: This converts the row's own completedAt timestamp via isoDayFun.
				const dayEntObj = outMapObj.get( dayKeyStr ) || { donNum : 0, iteArr : [], totNum : 0 }; // What: Day Entry Object. Why: A day's own entry might already exist from an earlier completion the same day. How: This looks it up, or starts a fresh zeroed entry.


				dayEntObj.donNum++; // What: Done Increment. Why: Every reminder completion counts as done. How: This increments donNum.
				dayEntObj.totNum++; // What: Total Increment. Why: A reminder day's total always equals its done count. How: This increments totNum.

				dayEntObj.iteArr.push({ // What: Day Entry Item Push. Why: The tap-to-see-detail list needs every completed reminder's own name. How: This appends the row's own denormalized name, always done.


					donBoo : true,                        // What: Done Boolean. Why: A reminder completion row only ever records a finished reminder. How: This is always true here.
					namStr : rowCurObj.name || 'Reminder' // What: Name String. Why: The detail list shows each reminder by name. How: This reads the row's own denormalized name, falling back to Reminder when it has none.


				});

				outMapObj.set( dayKeyStr, dayEntObj ); // What: Day Entry Store. Why: The freshly-updated entry must be written back, since it may have just been created above. How: This sets the entry back under its own day key.


			}


		}

		else { // What: Pick Aggregation Branch. Why: A pick day has a real "possible total" (every row logged that day, done or not), unlike a reminder completion. How: This walks picRowArr, incrementing total for every row and done only for a completed one.


			for ( const rowCurObj of picRowArr ) { // What: Pick Row Aggregation Loop. Why: Every logged pick needs folding into its own calendar day's entry. How: This looks up (or lazily creates) that day's entry, then increments it and appends the item's own name/done state.


				const dayEntObj = outMapObj.get( rowCurObj.date ) || { donNum : 0, iteArr : [], totNum : 0 }; // What: Day Entry Object. Why: A day's own entry might already exist from an earlier pick the same day. How: This looks it up, or starts a fresh zeroed entry.


				dayEntObj.totNum++; // What: Total Increment. Why: Every logged row counts toward the day's total. How: This increments totNum.



				if ( rowCurObj.done ) dayEntObj.donNum++; // What: Done Increment. Why: Only a completed row counts toward done. How: This increments donNum whenever rowCurObj.done is truthy.



				dayEntObj.iteArr.push({ // What: Day Entry Item Push. Why: The heatmap's own tap-to-see-detail list needs every item's own name and done state. How: This appends one entry per logged row.


					donBoo : !!rowCurObj.done,  // What: Done Boolean. Why: The detail list marks which logged items were completed. How: This coerces the row's own done flag to a real boolean.
					namStr : rowCurObj.itemName // What: Name String. Why: The detail list shows each item by name. How: This reads the row's own denormalized item name.


				});

				outMapObj.set( rowCurObj.date, dayEntObj ); // What: Day Entry Store. Why: The freshly-updated entry must be written back, since it may have just been created above. How: This sets the entry back under its own date key.


			}


		}



		return outMapObj; // What: Day Aggregate Return. Why: This is the finished per-day rollup every heatmap/streak/full-days computation below reads from. How: This returns the map built by whichever branch ran above.


	}, [ picRowArr, remRowArr, isaRemBoo ] ); // What: Memo Dependency Array. Why: The rollup only ever needs rebuilding when the underlying pick rows, reminder rows, or which scope is active changes. How: picRowArr/remRowArr each feed one branch, isaRemBoo picks which branch runs.

	// #endregion Pick And Reminder Rows



	// #region Headline Numbers

	const totDonNum = isaRemBoo ? remRowArr.length : picRowArr.reduce( ( sumRunNum, rowCurObj ) => sumRunNum + ( rowCurObj.done ? 1 : 0 ), 0 );  // What: Total Done Number. Why: The headline "completed"/"items done" card needs one combined done count regardless of which scope is active. How: A Reminders scope counts every completion row directly; a pick scope sums each row's own done flag.
	const totPosNum = picRowArr.length; // What: Total Possible Number. Why: The completion-rate card needs the total number of pick opportunities logged, not just the done ones. How: This is simply picRowArr's own length.
	const comRatNum = Math.round( ( totDonNum / Math.max( 1, totPosNum ) ) * 100 );                                                              // What: Completion Rate Number. Why: The headline "completion" card needs a percentage, not a raw count. How: This divides totDonNum by totPosNum, floored at 1 to avoid a divide-by-zero on an empty range.
	const actDayNum = dayAggMap.size; // What: Active Day Number. Why: Both the "full days" card's own denominator and the heatmap's empty-state check need the count of days with any activity at all. How: This is simply dayAggMap's own size.
	const fulDayNum = [ ...dayAggMap.values() ].filter( ( dayEntObj ) => dayEntObj.totNum > 0 && dayEntObj.donNum === dayEntObj.totNum ).length; // What: Full Day Number. Why: The headline "full days" card counts only days where every logged pick that day was actually completed. How: This filters dayAggMap's own values down to days whose done count equals their total.
	const weeAgoNum = Date.now() - 7 * 86400000;                                                                                                 // What: Week Ago Number. Why: The "this week" reminder count needs a rolling 7-day cutoff timestamp to compare against. How: This subtracts 7 days' worth of milliseconds from the current time.
	const remWeeNum = remRowArr.filter( ( rowCurObj ) => new Date( rowCurObj.completedAt ).getTime() >= weeAgoNum ).length;                      // What: Reminder Week Number. Why: The Reminders headline/summary cards both show a rolling "this week" count. How: This counts every reminder row whose own completedAt falls on or after weeAgoNum.
	const busDayNum = [ ...dayAggMap.values() ].reduce( ( maxRunNum, dayEntObj ) => Math.max( maxRunNum, dayEntObj.donNum ), 0 );                // What: Busiest Day Number. Why: The Reminders headline card's "busiest day" needs the single highest per-day done count. How: This reduces dayAggMap's own values to the largest done field seen.


	const stkDayNum = React.useMemo( () => { // What: Streak Day Number Memo. Why: The headline "day streak" card needs a walked-backward consecutive-day count, not a simple aggregate. How: This walks dayAggMap backward from today (or yesterday, if today has no entry yet), stopping at the first day with no done activity. // Streak: consecutive days (ending today) with at least one done. An empty today doesn't break it (the day isn't over yet); a day with activity but nothing done does.


		let stkCouNum = 0; // What: Streak Count Number. Why: The walk below needs a running tally to increment as each qualifying day is found. How: This starts at zero and is incremented once per qualifying day.

		const walDatObj = new Date( todDatObj ); // What: Walk Date Object. Why: The backward walk needs its own mutable date cursor, separate from todDatObj itself. How: This clones todDatObj as the starting point.


		if ( !dayAggMap.get( todIsoStr ) ) walDatObj.setDate( walDatObj.getDate() - 1 ); // What: Empty Today Check. Why: A today with no logged activity yet shouldn't break an otherwise-continuing streak, since the day isn't over. How: This steps the walk back one day when today has no entry at all.



		for ( ;; ) { // What: Backward Walk Loop. Why: The streak must keep extending for as long as each earlier day also has done activity. How: This checks the walk cursor's own day, incrementing and stepping back while it qualifies, breaking on the first day that doesn't.


			const dayEntObj = dayAggMap.get( isoDayFun( walDatObj ) ); // What: Day Entry Object. Why: The current walk cursor's own day needs to be checked against the aggregate map. How: This looks up the cursor's own ISO day in dayAggMap.


			if ( dayEntObj && dayEntObj.donNum > 0 ) { // What: Qualify Branch. Why: A day with at least one done item extends the streak and the walk keeps going. How: This increments stkCouNum and steps the cursor back one more day.


				stkCouNum++; // What: Streak Increment. Why: A qualifying day counts toward the running streak. How: This increments stkCouNum by one.

				walDatObj.setDate( walDatObj.getDate() - 1 ); // What: Cursor Step Back. Why: The walk must keep checking earlier days while the streak holds. How: This steps walDatObj back one calendar day.


			}

			else break; // What: Stop Branch. Why: A day with no done items (or missing entirely) ends the streak right there. How: This breaks out of the backward walk loop.


		}



		return stkCouNum; // What: Streak Count Return. Why: This is the finished consecutive-day count the headline card reads. How: This returns the accumulator built by the walk above.


	}, [ dayAggMap, todDatObj, todIsoStr ] ); // What: Memo Dependency Array. Why: The streak only ever needs rewalking when the day aggregate, today's own date, or today's own ISO string changes. How: dayAggMap supplies the per-day data, todDatObj/todIsoStr anchor where the backward walk starts.

	// #endregion Headline Numbers



	// #region Heatmap Grid

	const datYeaArr = React.useMemo( () => { // What: Data Year Array Memo. Why: The year pager needs the full list of calendar years that actually have any logged activity. How: This derives the earliest year with data and every year up through the current one. // Flat chronological run of fixed-size day cells, wrapping to as many rows as the range needs (taller, never wider). For "All time" spanning more than one calendar year, a year pager clamps the grid to one year at a time.


		const dayKeyArr = [ ...dayAggMap.keys() ]; // What: Day Key Array. Why: The earliest year present needs to be found from the actual logged days, not assumed. How: This spreads dayAggMap's own keys into a plain array.


		if ( !dayKeyArr.length ) return [ todDatObj.getFullYear() ]; // What: No Data Guard. Why: With nothing logged yet, the grid still needs exactly the current year to render against. How: This returns a single-entry array holding today's own year.



		const minYeaNum = +dayKeyArr.reduce( ( earKeyStr, dayKeyStr ) => ( dayKeyStr < earKeyStr ? dayKeyStr : earKeyStr ), dayKeyArr[ 0 ] ).slice( 0, 4 ); // What: Minimum Year Number. Why: The year list must start from the earliest logged day, not an arbitrary default. How: This reduces to the lexicographically earliest day key, then reads its own leading 4-digit year.
		const maxYeaNum = todDatObj.getFullYear(); // What: Maximum Year Number. Why: The year list must always reach through the current year, even with no activity logged yet this year. How: This reads today's own year.
		const outYeaArr = [];                      // What: Out Year Array. Why: The final list needs building up one year at a time between the bounds computed above. How: This starts empty and is filled by the loop below.


		for ( let yeaCurNum = minYeaNum; yeaCurNum <= maxYeaNum; yeaCurNum++ ) outYeaArr.push( yeaCurNum ); // What: Year Range Loop. Why: Every year between the earliest logged year and the current one belongs in the pager, even a year with no activity of its own. How: This pushes every year in that inclusive range.



		return outYeaArr; // What: Data Year Return. Why: This is the finished year list the pager below reads its own bounds from. How: This returns the array built above.


	}, [ dayAggMap, todDatObj ] ); // What: Memo Dependency Array. Why: The year list only ever needs recomputing when the day aggregate or today's own date changes. How: dayAggMap supplies the earliest logged day, todDatObj supplies the current year ceiling.


	const yeaPagBoo = ranValStr === 'all' && datYeaArr.length > 1; // What: Year Paging Boolean. Why: The year-pager arrows should only render when "All time" is active and actually spans more than one calendar year. How: This checks both conditions together.


	const actYeaNum = yeaPagBoo // What: Active Year Number. Why: The heatmap's own bounds below need one concrete active year whenever paging is in effect. How: This uses heaYeaNum if it's still a valid year, otherwise falls back to the latest one, or null when paging isn't active at all. // Clamp the (possibly stale) selected year to what's available; default to the latest.
		? ( heaYeaNum !== null && datYeaArr.includes( heaYeaNum ) ? heaYeaNum : datYeaArr[ datYeaArr.length - 1 ] ) // What: Paged Year Branch. Why: A stale heaYeaNum must fall back to a real year. How: This keeps heaYeaNum when it's still valid, otherwise the latest year.
		: null;                                                                                                     // What: Unpaged Branch. Why: Without paging there's no single active year. How: This returns null.


	const heaDayArr = React.useMemo( () => { // What: Heat Day Array Memo. Why: The heatmap grid needs one cell per calendar day across its own bounded window, not just the days that happen to have logged activity. How: This computes a start/end day (clamped to actYeaNum when paging), then fills every day in between from dayAggMap.


		let staIsoStr = cutIsoStr; // What: Start Iso String. Why: The grid's own first day defaults to the active range's own cutoff. How: This starts from cutIsoStr and may be overridden below for an "All time" view with no cutoff at all.


		if ( !staIsoStr ) { // What: No Cutoff Check. Why: "All time" has no cutIsoStr to start from, so the earliest logged day must be found instead. How: This falls back to the earliest key in dayAggMap, or today when nothing has been logged at all.


			const dayKeyArr = [ ...dayAggMap.keys() ]; // What: Day Key Array. Why: The earliest logged day needs to be found from the actual keys present. How: This spreads dayAggMap's own keys into a plain array.


			staIsoStr = dayKeyArr.length ? dayKeyArr.reduce( ( earKeyStr, dayKeyStr ) => ( dayKeyStr < earKeyStr ? dayKeyStr : earKeyStr ), dayKeyArr[ 0 ] ) : todIsoStr; // What: Start Iso Fallback. Why: A truly empty history still needs some concrete starting day for the loop below. How: This reduces to the earliest key, or falls back to todIsoStr when there are none at all.


		}



		let endIsoStr = todIsoStr; // What: End Iso String. Why: The grid's own last day defaults to today. How: This may be overridden below when a specific year is being paged.


		if ( actYeaNum != null ) { // What: Year Clamp Check. Why: A paged single-year view must not show days outside that year at all. How: This clamps both staIsoStr and endIsoStr to the active year's own January 1 and December 31.


			const yeaStaStr = `${ actYeaNum }-01-01`; // What: Year Start String. Why: The clamp below needs the active year's own first day as a comparable ISO string. How: This builds a plain 'YYYY-01-01' string from actYeaNum.
			const yeaEndStr = `${ actYeaNum }-12-31`; // What: Year End String. Why: The clamp below needs the active year's own last day as a comparable ISO string. How: This builds a plain 'YYYY-12-31' string from actYeaNum.


			if ( staIsoStr < yeaStaStr ) staIsoStr = yeaStaStr; // What: Start Clamp Up. Why: A start day from an earlier year (or no cutoff at all) must not bleed into this year's own grid. How: This raises staIsoStr up to the year's own January 1 when it would otherwise start earlier.



			endIsoStr = yeaEndStr < todIsoStr ? yeaEndStr : todIsoStr; // What: End Clamp. Why: A past year's grid should show its own full December 31, but the current year must still cap at today. How: This takes whichever of the year's own December 31 or today is earlier.


		}



		const staDatObj = new Date( staIsoStr + 'T00:00:00' ); // What: Start Date Object. Why: The fill loop below needs a real Date to step forward one day at a time from. How: This parses staIsoStr at local midnight.
		const outDayArr = [];                                  // What: Out Day Array. Why: The finished grid needs building up one day at a time between the bounds computed above. How: This starts empty and is filled by the loop below.


		for ( let curDatObj = new Date( staDatObj ); isoDayFun( curDatObj ) <= endIsoStr; curDatObj.setDate( curDatObj.getDate() + 1 ) ) { // What: Day Fill Loop. Why: Every day in the window needs its own cell, whether or not anything was logged that day. How: This steps a cloned cursor forward one day at a time, stopping once it passes endIsoStr.


			const dayKeyStr = isoDayFun( curDatObj ); // What: Day Key String. Why: Both the aggregate lookup and the cell's own date field need this day's own ISO string. How: This converts the current loop cursor via isoDayFun.


			outDayArr.push( { datStr : dayKeyStr, ...( dayAggMap.get( dayKeyStr ) || { donNum : 0, iteArr : [], totNum : 0 } ) } ); // What: Day Cell Push. Why: Every cell needs its own date plus whatever aggregate data exists for it, or a zeroed placeholder when nothing was logged. How: This spreads either the real aggregate entry or a zeroed default onto the date field.


		}



		return outDayArr; // What: Heat Day Return. Why: This is the finished, gap-free day list the heatmap grid renders one cell per. How: This returns the array built by the fill loop above.


	}, [ dayAggMap, cutIsoStr, todIsoStr, actYeaNum ] ); // What: Memo Dependency Array. Why: The grid only ever needs rebuilding when the day aggregate, the range cutoff, today's own date, or the active paged year changes. How: Each dependency feeds one part of the start/end window computed above.

	// #endregion Heatmap Grid



	// #region Rankings

	const picCouMap = React.useMemo( () => { // What: Pick Count Map Memo. Why: The Most Picked/Coldest rankings and the single-picker breakdown all need one shared per-item pick count, joined with its own source split. How: This walks picRowArr once, accumulating a count plus a per-source tally per itemId.


		const outMapObj = new Map(); // What: Out Map Object. Why: The per-item counts need a fresh accumulator to build up as the loop below runs. How: This starts empty and is filled by the loop.


		for ( const rowCurObj of picRowArr ) { // What: Pick Count Loop. Why: Every logged pick contributes one to its own item's total, and one to whichever source produced it. How: This looks up (or lazily creates) the item's own accumulator, then increments it.


			const iteEntObj = outMapObj.get( rowCurObj.itemId ) || { autNum : 0, couNum : 0, manNum : 0, namStr : rowCurObj.itemName, rerNum : 0 }; // What: Item Entry Object. Why: An item's own accumulator might already exist from an earlier pick. How: This looks it up, or starts a fresh zeroed entry using the row's own denormalized name.


			iteEntObj.couNum++; // What: Item Total Increment. Why: Every pick counts toward the item's own total. How: This increments couNum.

			iteEntObj.namStr = rowCurObj.itemName; // What: Item Name Refresh. Why: The item may have been renamed between log entries. How: This overwrites namStr from the current row.


			if ( SOU_FIE_OBJ[ rowCurObj.source ] ) iteEntObj[ SOU_FIE_OBJ[ rowCurObj.source ] ]++; // What: Source Tally Update. Why: The Auto/Hand Picked/Re-Rolled breakdown needs a per-source count alongside the plain total. How: SOU_FIE_OBJ translates the row's saved source value into its tally field, then increments that field.



			outMapObj.set( rowCurObj.itemId, iteEntObj ); // What: Item Entry Store. Why: The freshly-updated entry must be written back, since it may have just been created above. How: This sets the entry back under its own itemId key.


		}



		return outMapObj; // What: Pick Count Return. Why: This is the finished per-item map both rankings and the breakdown card read from. How: This returns the map built above.


	}, [ picRowArr ] ); // What: Memo Dependency Array. Why: This map only ever needs rebuilding when the underlying pick rows themselves change. How: picRowArr is the sole source the loop above reads from.


	const topPicArr = React.useMemo( () => ( // What: Top Pick Array Memo. Why: The "Most picked" card needs the 5 highest-count items, in descending order. How: This filters out zero-count entries, sorts descending by count, and takes the first 5.


		[ ...picCouMap.values() ].filter( ( iteEntObj ) => iteEntObj.couNum > 0 ).sort( ( iteOneObj, iteTwoObj ) => iteTwoObj.couNum - iteOneObj.couNum ).slice( 0, 5 ) // What: Top Five Chain. Why: Only picked items belong in the ranking, highest first. How: This drops zero-count entries, sorts descending by couNum, and keeps the first 5.


	), [ picCouMap ] ); // What: Memo Dependency Array. Why: This top-5 list only ever needs resorting when the underlying count map changes. How: picCouMap is the sole source the filter/sort above reads from.


	const colIteArr = React.useMemo( () => { // What: Cold Item Array Memo. Why: The "Coldest items" card needs the 5 lowest-count LIVE items (not deleted ones), including ones never picked at all. How: This starts from staAppObj.items rather than picCouMap, so a zero-pick item still appears.


		const livIteArr = ( staAppObj.items || [] ).filter( ( iteCurObj ) => { // What: Live Item Array. Why: Only an item that's actually live, in scope, and not on vacation belongs in this ranking. How: This filters staAppObj.items by hidden-picker exclusion, scope, and its own vacation flag.


			const visPicBoo = !hidPicSet.has( iteCurObj.pickerId );                    // What: Visible Picker Boolean. Why: A hidden picker's own items never rank. How: This checks the item's picker against hidPicSet.
			const scoMatBoo = scoValStr === 'all' || iteCurObj.pickerId === scoValStr; // What: Scope Match Boolean. Why: A single-picker scope only ranks its own items. How: This passes every item under 'all', otherwise only the scoped picker's.
			const actIteBoo = !iteCurObj.vacation;                                     // What: Active Item Boolean. Why: An inactive item can't be picked, so it shouldn't rank as cold. How: This checks the item's own vacation flag.

			const keeIteBoo = visPicBoo && scoMatBoo && actIteBoo; // What: Keep Item Boolean. Why: An item only ranks when all three checks pass. How: This combines the three checks above.



			return keeIteBoo; // What: Keep Item Return. Why: Array.filter keeps exactly the items this returns true for. How: This returns keeIteBoo.


		} );



		return livIteArr // What: Cold Item Return. Why: This is the finished bottom-5 ranking. How: This maps, sorts, and slices livIteArr in the chain below.
			.map( ( iteCurObj ) => ( { // What: Cold Item Mapping. Why: Each live item needs just its own name and its (possibly zero) pick count for this ranking. How: This looks up iteCurObj's own id in picCouMap, defaulting to a zero count.


				couNum : ( picCouMap.get( iteCurObj.id ) || {} ).couNum || 0, // What: Count Number. Why: The ranking sorts by how often each item was picked. How: This reads the item's own tally from picCouMap, defaulting to zero when it was never picked.
				namStr : iteCurObj.name                                       // What: Name String. Why: Each ranked row shows the item's name and breaks count ties alphabetically. How: This copies the item's own name.


			} ) )
			.sort( ( iteOneObj, iteTwoObj ) => iteOneObj.couNum - iteTwoObj.couNum || iteOneObj.namStr.localeCompare( iteTwoObj.namStr ) ) // What: Cold Sort. Why: The coldest (least-picked) items should list first, tied items breaking alphabetically for a stable order. How: This sorts ascending by count, falling back to a name comparison.
			.slice( 0, 5 ); // What: Cold Slice. Why: Only the 5 coldest items are shown. How: This takes the first 5 entries of the sorted array.


	}, [ staAppObj.items, scoValStr, picCouMap, hidPicSet ] ); // What: Memo Dependency Array. Why: This ranking only ever needs recomputing when the live item list, the active scope, the pick counts, or the hidden-picker set changes. How: Each dependency feeds one part of the filter/map/sort above.

	// #endregion Rankings



	// #region Single-Picker Breakdown Setup

	const scoPicObj = picLisArr.find( ( picCurObj ) => picCurObj.id === scoValStr ); // What: Scope Picker Object. Why: The single-picker header and every mode-dependent branch below need the actual picker object, not just its id. How: This looks scoValStr up in picLisArr.
	const notAllBoo = scoValStr !== 'all';                                           // What: Not All Boolean. Why: A single-picker scope first needs the view narrowed past All. How: This compares scoValStr against 'all'.
	const notRemBoo = !isaRemBoo;                                                    // What: Not Reminder Boolean. Why: The Reminders scope narrows the view without being a real picker. How: This negates isaRemBoo.
	const notConBoo = !isaConBoo;                                                    // What: Not Conditional Boolean. Why: The Conditionals scope narrows the view without being a real picker either. How: This negates isaConBoo.
	const hasPicBoo = !!scoPicObj;                                                   // What: Has Picker Boolean. Why: A scoped picker that just disappeared, such as a help sample removed while Stats is open, must not render its card for the one frame before the scope repair runs. How: This is true when scoPicObj was found.

	const isaPicBoo = notAllBoo && notRemBoo && notConBoo && hasPicBoo; // What: Is-A Picker Boolean. Why: Several blocks below only make sense while a single real picker is the active scope. How: This is true when scoValStr isn't 'all', neither the Reminders nor Conditionals sentinel is active, and the scoped picker exists. // Single-picker breakdown: EVERY item in the picker (including zero-pick and inactive ones), with all per-item metrics on one object. The Pick breakdown card pivots on metKeyStr to choose which value to show and sort by.


	const easDowBoo = isaPicBoo && scoPicObj && scoPicObj.mode === 'ease-down';                                    // What: Ease Down Boolean. Why: An ease-down picker swaps the Frequency metric for Spent and measures things differently below. How: This checks the scoped picker's own mode.
	const easUpwBoo = isaPicBoo && scoPicObj && scoPicObj.mode === 'ease-up';                                      // What: Ease Upward Boolean. Why: An ease-up picker's own items show a range suffix the same way an ease-down picker's do. How: This checks the scoped picker's own mode.
	const useWeiBoo = isaPicBoo && scoPicObj && ( scoPicObj.mode === 'weighted' || scoPicObj.mode === 'dynamic' ); // What: Uses Weight Boolean. Why: Only a weighted or dynamic picker's items have a meaningful weight suffix to show. How: This checks the scoped picker's own mode against both weight-driven modes.


	const vacCheObj = React.useMemo( () => { // What: Vacation Check Object Memo. Why: Several metrics below need to know an item's own active/inactive state on an arbitrary past day, not just its current state. How: This replays staAppObj.vacationLog into a per-item sorted event list, then exposes two small lookup functions closing over it. // Inactive-state replay from the event log: vacCheObj.inaDayFun(itemId, date) answers whether that item was inactive that day; vacCheObj.retAftFun answers whether an 'on' (return-from-vacation) transition happened after that date.


		const iteEveMap = new Map< string, VclRowTyp[] >(); // What: Item Event Map. Why: Each item's own vacation-toggle history needs to be grouped before it can be replayed. How: This starts empty and is filled by the loop below.

		for ( const rowCurObj of ( staAppObj.vacationLog || [] ) ) { // What: Vacation Row Grouping Loop. Why: Every logged toggle event needs filing under its own item. How: This appends each row to that item's own array, lazily creating it on first use.


			if ( !iteEveMap.has( rowCurObj.itemId ) ) iteEveMap.set( rowCurObj.itemId, [] ); // What: Lazy Array Check. Why: An item's own event array must exist before rows can be pushed onto it. How: This seeds an empty array the first time an item's id is seen.



			iteEveMap.get( rowCurObj.itemId )!.push( rowCurObj ); // What: Event Push. Why: This is the actual filing of the row under its own item. How: This appends rowCurObj to that item's own array. // What: Non-Null Note. Why: The lazy check just above creates this item's array before anything is pushed. How: The ! tells TypeScript the get returns it.


		}



		for ( const iteEveArr of iteEveMap.values() ) iteEveArr.sort( ( eveOneObj, eveTwoObj ) => ( eveOneObj.date < eveTwoObj.date ? -1 : 1 ) ); // What: Chronological Sort Loop. Why: The replay functions below assume each item's own events are in chronological order. How: This sorts every item's own array by its own date field.



		const inaDayFun = ( iteIdeStr : string, dayIsoStr : string ) => { // What: Inactive Day Function. Why: Several metrics need to ask "was this item inactive on this specific day", replayed from its own toggle history. How: This walks the item's own sorted events up through dayIsoStr, remembering the most recent on/off state.


			const iteEveArr = iteEveMap.get( iteIdeStr ); // What: Item Event Array. Why: An item with no vacation history at all has nothing to replay. How: This looks up the item's own event array, which may be undefined.


			if ( !iteEveArr ) return false; // What: No History Guard. Why: An item that's never toggled vacation at all was never inactive. How: This returns false immediately when there's no event array for it.



			let inaStaBoo = false; // What: Inactive State Boolean. Why: The replay below needs a running "current state" to update as it walks forward. How: This starts false (active) and is overwritten by each event up to dayIsoStr.


			for ( const eveCurObj of iteEveArr ) { // What: Replay Walk Loop. Why: Only events on or before the asked-about day should affect the answer. How: This keeps overwriting inaStaBoo while an event's own date qualifies, stopping at the first one that doesn't.


				if ( eveCurObj.date <= dayIsoStr ) inaStaBoo = eveCurObj.on; // What: Qualifying Event Branch. Why: An event on or before dayIsoStr is the most recent state known as of that day. How: This overwrites inaStaBoo with eveCurObj's own on value.

				else break; // What: Future Event Stop. Why: Once an event is found still in the future relative to dayIsoStr, every later event (iteEveArr is chronological) is too. How: This breaks out of the loop immediately.


			}



			return inaStaBoo; // What: Inactive Day Return. Why: This is the replayed inactive/active state as of dayIsoStr. How: This returns the final inaStaBoo value after the walk above.


		};


		const retAftFun = ( iteIdeStr : string, dayIsoStr : string ) => { // What: Return After Function. Why: The "was on vacation" label needs to know whether an item returned FROM vacation after a specific day, not just its state on that day. How: This checks the item's own event array for any later 'on' transition.


			const iteEveArr = iteEveMap.get( iteIdeStr ); // What: Item Event Array. Why: An item with no vacation history at all can't have a later transition either. How: This looks up the item's own event array, which may be undefined.



			return !!iteEveArr && iteEveArr.some( ( eveCurObj ) => eveCurObj.on && eveCurObj.date > dayIsoStr ); // What: Return After Return. Why: This answers whether a later return-from-vacation event exists at all. How: This checks for any event flagged on whose own date is after dayIsoStr.


		};



		return { // What: Vacation Check Return. Why: Callers below need both replay functions bundled together, closing over the same grouped/sorted event data. How: This returns the small two-function api object.


			inaDayFun : inaDayFun, // What: Inactive Day Function. Why: Metrics ask whether an item was inactive on a given day. How: This exposes inaDayFun under its own name.
			retAftFun : retAftFun  // What: Return After Function. Why: The "was inactive" tag asks whether an item came back after a given day. How: This exposes retAftFun under its own name.


		};


	}, [ staAppObj.vacationLog ] ); // What: Memo Dependency Array. Why: This only ever needs rebuilding when the raw vacation log itself changes. How: staAppObj.vacationLog is the sole source the grouping loop above reads from.


	const actDatArr = React.useMemo( () => [ ...new Set( picRowArr.map( ( rowCurObj ) => rowCurObj.date ) ) ].sort(), [ picRowArr ] ); // What: Active Date Array Memo. Why: The Frequency/Spent/Last-picked metrics all need the distinct set of days the picker actually ran, in order. How: This deduplicates picRowArr's own date field via a Set, then sorts it. // Picker run days in range (distinct active-pick dates).

	// #endregion Single-Picker Breakdown Setup



	// #region Per-Item Metric Memos

	const freGapMap = React.useMemo( () => { // What: Frequency Gap Map Memo. Why: The Frequency metric needs a per-item average gap, in both calendar and eligible-day units, between its own consecutive picks. How: This groups picRowArr's own dates per item, then averages consecutive gaps in each unit. // Eligible-day gap per item (used by the Frequency metric). The eligible index is per-item: picker run days MINUS that item's own inactive days, so an inactive stretch can't inflate the gap. Calendar gap stays literal wall-clock time.


		const outMapObj = new Map(); // What: Out Map Object. Why: The per-item gap results need a fresh accumulator to build up as the loop below runs. How: This starts empty and is filled below.



		if ( !isaPicBoo || easDowBoo ) return outMapObj; // What: Scope Guard. Why: Frequency only applies to a single-picker, non-ease-down scope; an ease-down picker uses Spent instead. How: This returns the still-empty map otherwise.



		const iteDatMap = new Map(); // What: Item Date Map. Why: Each item's own pick dates need grouping before gaps between them can be measured. How: This starts empty and is filled by the loop below.

		for ( const rowCurObj of picRowArr ) { // What: Date Grouping Loop. Why: Every logged pick contributes one date to its own item's set. How: This adds rowCurObj's own date to that item's own Set, lazily creating it on first use.


			if ( !iteDatMap.has( rowCurObj.itemId ) ) iteDatMap.set( rowCurObj.itemId, new Set() ); // What: Lazy Set Guard. Why: An item's own date set must exist before a date can be added to it. How: This seeds an empty Set the first time an item's id is seen.



			iteDatMap.get( rowCurObj.itemId ).add( rowCurObj.date ); // What: Date Add. Why: This is the actual filing of the date under its own item. How: This adds rowCurObj.date to that item's own Set.


		}



		for ( const [ iteIdeStr, datSetObj ] of iteDatMap ) { // What: Per-Item Gap Loop. Why: Every item with at least one pick date needs its own average-gap computation in both units. How: This sorts the item's own dates, builds an eligible-day index, then averages consecutive gaps.


			const sorDatArr = [ ...datSetObj ].sort();                                                           // What: Sorted Date Array. Why: Consecutive-gap math requires the item's own pick dates in chronological order. How: This spreads and sorts the item's own date Set.
			const eliDatArr = actDatArr.filter( ( dayIsoStr ) => !vacCheObj.inaDayFun( iteIdeStr, dayIsoStr ) ); // What: Eligible Date Array. Why: The eligible-day index must exclude any day this specific item was inactive, even if the picker itself ran that day. How: This filters actDatArr down to days vacCheObj.inaDayFun reports as active for this item.
			const eliIndMap = new Map( eliDatArr.map( ( dayIsoStr, indCurNum ) => [ dayIsoStr, indCurNum ] ) );  // What: Eligible Index Map. Why: Converting a calendar date into its own eligible-day position requires a fast lookup. How: This maps each eligible date to its own position in eliDatArr.

			let gapEliNum = null; // What: Gap Eligible Number. Why: The eligible-unit average defaults to "no data" until at least two pick dates exist. How: This starts null and is overwritten below when there's enough data.
			let gapCalNum = null; // What: Gap Calendar Number. Why: The calendar-unit average defaults to "no data" until at least two pick dates exist. How: This starts null and is overwritten below when there's enough data.


			if ( sorDatArr.length >= 2 ) { // What: Enough Data Check. Why: An average gap needs at least two pick dates to measure a gap between. How: This computes both sums only when there are at least two dates.


				let eliSumNum = 0; // What: Eligible Sum Number. Why: The loop below needs a running eligible-unit total before it can be averaged. How: This starts at zero and is added to below.
				let calSumNum = 0; // What: Calendar Sum Number. Why: The loop below needs a running calendar-unit total before it can be averaged. How: This starts at zero and is added to below.


				for ( let indCurNum = 1; indCurNum < sorDatArr.length; indCurNum++ ) { // What: Consecutive Gap Loop. Why: Every consecutive pair of pick dates contributes one gap in each unit. How: This adds the eligible-index difference and the calendar-day difference for each pair.


					eliSumNum += ( eliIndMap.get( sorDatArr[ indCurNum ] ) ?? 0 ) - ( eliIndMap.get( sorDatArr[ indCurNum - 1 ] ) ?? 0 ); // What: Eligible Gap Add. Why: This is the actual eligible-day distance between one pick and the next. How: This subtracts the earlier date's own eligible index from the later one's.

					calSumNum += Math.round( ( new Date( sorDatArr[ indCurNum ] ).getTime() - new Date( sorDatArr[ indCurNum - 1 ] ).getTime() ) / 86400000 ); // What: Calendar Gap Add. Why: This is the actual wall-clock day distance between one pick and the next. How: This divides the millisecond difference by a day's own millisecond count.


				}



				gapEliNum = eliSumNum / ( sorDatArr.length - 1 ); // What: Average Eligible Gap Assignment. Why: The finished eligible-unit average needs storing for the metric to read. How: This divides the summed eligible gaps by the number of gaps measured.
				gapCalNum = calSumNum / ( sorDatArr.length - 1 ); // What: Average Calendar Gap Assignment. Why: The finished calendar-unit average needs storing for the metric to read. How: This divides the summed calendar gaps by the number of gaps measured.


			}



			outMapObj.set( iteIdeStr, { calNum : gapCalNum, couNum : sorDatArr.length, eliNum : gapEliNum } ); // What: Item Gap Store. Why: The Frequency metric needs both averages plus the raw pick count per item. How: This sets the finished per-item result under its own iteIdeStr key.


		}



		return outMapObj; // What: Frequency Gap Return. Why: This is the finished per-item gap map the Frequency metric reads from. How: This returns the map built above.


	}, [ isaPicBoo, easDowBoo, picRowArr, actDatArr, vacCheObj ] ); // What: Memo Dependency Array. Why: This map only ever needs rebuilding when the picker scope, the ease-down flag, the pick rows, the active dates, or the vacation-check api changes. How: Each dependency feeds one part of the grouping/averaging above.


	const speGapMap = React.useMemo( () => { // What: Spent Gap Map Memo. Why: The ease-down Spent metric needs a per-item average completed-cycle length, in both run-count and calendar-day units. How: This walks picRowArr's own dates in order, grouping consecutive same-item runs and keeping only ones that ended depleted. // Ease Down "Spent": measured from ACTUAL history, the average length of a completed depletion streak (consecutive runs of the same active item that ended when its charge hit 0, flagged depletedEnd). Abandoned streaks (re-roll / inactive / manual) never reach 0, so they're excluded, which is why recharging an abandoned item can't skew this. elig = runs; cal = calendar days spanned. null when the item has no completed cycle in range.


		const outMapObj = new Map(); // What: Out Map Object. Why: The per-item spent results need a fresh accumulator to build up below. How: This starts empty and is filled below.



		if ( !easDowBoo ) return outMapObj; // What: Ease Down Guard. Why: Spent only applies to an ease-down picker. How: This returns the still-empty map otherwise.



		const dayInfMap = new Map(); // What: Day Info Map. Why: The run-detection loop below needs each date's own item and depleted-end flag, keyed for lookup. How: This maps each pick date to a small { itemId, depletedEnd } record.


		for ( const rowCurObj of picRowArr ) dayInfMap.set( rowCurObj.date, { // What: Day Info Population Loop. Why: Every logged pick contributes its own date's item/depleted-end pair. How: This sets one entry per row, keyed by its own date.


			depBoo : !!rowCurObj.depletedEnd, // What: Depleted Boolean. Why: Run detection below ends a streak on the day the pool ran out. How: This coerces the row's own depletedEnd flag to a real boolean.
			ideStr : rowCurObj.itemId         // What: Identifier String. Why: Run detection below groups consecutive dates by the same item. How: This copies the row's own picked item id.


		} );



		const sorDatArr = [ ...dayInfMap.keys() ].sort();                              // What: Sorted Date Array. Why: Run detection below depends on walking the picker's own dates in chronological order. How: This spreads and sorts dayInfMap's own keys.
		const iteStkMap = new Map< string, { calNum : number, runNum : number }[] >(); // What: Item Streak Map. Why: Every completed depletion streak needs filing under its own item before it can be averaged. How: This starts empty and is filled by the run-walk loop below.

		let staIndNum = 0; // What: Start Index Number. Why: The run-walk loop below needs a cursor marking where the current same-item run began. How: This starts at 0 and advances past each completed run.


		while ( staIndNum < sorDatArr.length ) { // What: Run Walk Loop. Why: Every maximal run of consecutive same-item dates needs detecting, one at a time. How: This finds the run's own end index, then checks whether it ended depleted before recording it.


			const runIteStr = dayInfMap.get( sorDatArr[ staIndNum ] ).ideStr; // What: Run Item String. Why: A run is defined as consecutive dates belonging to the same item. How: This reads the item at the run's own starting date.

			let endIndNum = staIndNum; // What: End Index Number. Why: The inner loop below needs a cursor to advance while the same item continues. How: This starts at the run's own start and advances below.


			while ( endIndNum + 1 < sorDatArr.length && dayInfMap.get( sorDatArr[ endIndNum + 1 ] ).ideStr === runIteStr ) endIndNum++; // What: Run Extension Loop. Why: The run continues for as long as the next date's own item still matches. How: This advances endIndNum while the next date belongs to the same item.



			if ( dayInfMap.get( sorDatArr[ endIndNum ] ).depBoo ) { // What: Completed Cycle Check. Why: Only a run that actually ended in depletion (not an abandoned re-roll/inactive/manual switch) counts toward this average. How: This checks the run's own final date for its depletedEnd flag.


				const runCouNum = endIndNum - staIndNum + 1;                                                                                                    // What: Run Count Number. Why: The eligible-unit average needs the run's own length in picks. How: This is the inclusive distance between the run's start and end indices.
				const calDayNum = Math.round( ( new Date( sorDatArr[ endIndNum ] ).getTime() - new Date( sorDatArr[ staIndNum ] ).getTime() ) / 86400000 ) + 1; // What: Calendar Day Number. Why: The calendar-unit average needs the run's own wall-clock span, inclusive of both endpoints. How: This divides the millisecond difference by a day's own millisecond count, then adds 1 to make it inclusive.


				if ( !iteStkMap.has( runIteStr ) ) iteStkMap.set( runIteStr, [] ); // What: Lazy Array Guard. Why: An item's own streak array must exist before a completed streak can be pushed onto it. How: This seeds an empty array the first time this item's id completes a streak.



				iteStkMap.get( runIteStr )!.push( { calNum : calDayNum, runNum : runCouNum } ); // What: Streak Push. Why: This is the actual filing of the completed streak's own two measurements under its own item. How: This appends the { calNum, runNum } pair. // What: Non-Null Note. Why: The lazy check just above creates this item's array before anything is pushed. How: The ! tells TypeScript the get returns it.


			}



			staIndNum = endIndNum + 1; // What: Start Index Advance. Why: The outer loop must continue searching from right after the run just processed. How: This moves staIndNum past the run's own end index.


		}



		for ( const [ iteIdeStr, stkRunArr ] of iteStkMap ) { // What: Per-Item Average Loop. Why: Every item with at least one completed streak needs its own averaged elig/cal values. How: This averages every recorded streak's own runNum and calNum fields.


			if ( !stkRunArr.length ) continue; // What: Empty Guard. Why: An item that never appears in iteStkMap already has no entry, but this guards a theoretical empty array too. How: This skips straight to the next item.



			outMapObj.set( iteIdeStr, { // What: Item Spent Store. Why: The Spent metric needs both unit averages per item. How: This averages every streak's own calNum/runNum field.


				calNum : stkRunArr.reduce( ( sumRunNum, stkRunObj ) => sumRunNum + stkRunObj.calNum, 0 ) / stkRunArr.length, // What: Calendar Number. Why: The calendar-mode Spent value is the average wall-clock span. How: This averages every streak's own calNum.
				eliNum : stkRunArr.reduce( ( sumRunNum, stkRunObj ) => sumRunNum + stkRunObj.runNum, 0 ) / stkRunArr.length  // What: Eligible Number. Why: The eligible-mode Spent value is the average run length. How: This averages every streak's own runNum.


			} );


		}



		return outMapObj; // What: Spent Gap Return. Why: This is the finished per-item spent map the Spent metric reads from. How: This returns the map built above.


	}, [ easDowBoo, picRowArr ] ); // What: Memo Dependency Array. Why: This map only ever needs rebuilding when the ease-down flag or the underlying pick rows change. How: Both feed the run-detection and averaging logic above.


	const lasPicMap = React.useMemo( () => { // What: Last Pick Map Memo. Why: The Last Picked metric needs each item's own most recent active-pick date. How: This walks picRowArr once, keeping only the latest date seen per item. // Most-recent active pick date per item (used by the "Last picked" metric). Range + scope aware via picRowArr; rejected rows are already excluded there.


		const outMapObj = new Map(); // What: Out Map Object. Why: The per-item latest-date results need a fresh accumulator to build up below. How: This starts empty and is filled by the loop below.


		for ( const rowCurObj of picRowArr ) { // What: Latest Date Loop. Why: Every logged pick might be a new latest date for its own item. How: This overwrites the item's own entry whenever a later date is seen.


			const preDatStr = outMapObj.get( rowCurObj.itemId ); // What: Previous Date String. Why: The comparison below needs whatever date was previously recorded for this item, if any. How: This looks up the item's own current entry.


			if ( !preDatStr || rowCurObj.date > preDatStr ) outMapObj.set( rowCurObj.itemId, rowCurObj.date ); // What: Latest Date Update. Why: Only a later (or first-ever) date should overwrite the item's own entry. How: This sets rowCurObj.date when there's no previous entry or this one is later.


		}



		return outMapObj; // What: Last Pick Return. Why: This is the finished per-item latest-date map the Last Picked metric reads from. How: This returns the map built above.


	}, [ picRowArr ] ); // What: Memo Dependency Array. Why: This map only ever needs rebuilding when the underlying pick rows themselves change. How: picRowArr is the sole source the loop above reads from.

	// #endregion Per-Item Metric Memos



	// #region Per-Item Breakdown List

	const perIteArr = React.useMemo( () => { // What: Per Item Array Memo. Why: The Pick breakdown card needs one combined row per item, live or ghost, carrying every metric it might display. How: This joins staAppObj.items (plus reconstructed ghost rows) against every per-item map computed above. // One row per item with every metric attached. Includes "ghost" items, ones deleted from the picker but still with history in the log for the active range, so the breakdown totals stay consistent with the aggregate cards. Ghosts are flagged deleted and labelled in the UI.


		if ( !isaPicBoo ) return []; // What: Scope Guard. Why: A per-item breakdown only makes sense while a single real picker is the active scope. How: This returns an empty array otherwise.



		const livIteArr = ( staAppObj.items || [] ).filter( ( iteCurObj ) => iteCurObj.pickerId === scoValStr ); // What: Live Item Array. Why: Every currently-existing item under this picker needs its own row, even a zero-pick one. How: This filters staAppObj.items down to the scoped picker's own items.
		const livIdeSet = new Set( livIteArr.map( ( iteCurObj ) => iteCurObj.id ) );                             // What: Live Identifier Set. Why: The ghost-detection loop below needs a fast membership check against every currently-live item id. How: This collects livIteArr's own ids into a Set.
		const ghoNamMap = new Map();                                                                             // What: Ghost Name Map. Why: A deleted item's own display name must be recovered from the log, since it no longer exists live to read a name from. How: This starts empty and is filled by the loop below. // Deleted-but-logged items: any itemId in this scope's log (within range) that no longer exists live. The name comes from the log's own denormalized label.


		for ( const rowCurObj of picLogArr ) { // What: Ghost Detection Loop. Why: Every logged row for this scope in range might belong to an item that's since been deleted. How: This records that row's own itemId/itemName pair whenever the id isn't among the live ones.


			if ( scoValStr !== 'all' && rowCurObj.pickerId !== scoValStr ) continue; // What: Scope Guard. Why: Only rows belonging to the scoped picker are relevant here. How: This skips any row from a different picker.



			if ( cutIsoStr && rowCurObj.date < cutIsoStr ) continue; // What: Range Guard. Why: Only rows inside the active range are relevant here. How: This skips any row dated before cutIsoStr.



			if ( !livIdeSet.has( rowCurObj.itemId ) ) ghoNamMap.set( rowCurObj.itemId, rowCurObj.itemName || '(deleted item)' ); // What: Ghost Name Record. Why: A ghost's own display name should come from its most recent logged label. How: This sets (or overwrites) the ghost's own name whenever its id isn't live.


		}



		const ghoIteArr = [ ...ghoNamMap ].map( ( [ iteIdeStr, iteNamStr ] ) => ( // What: Ghost Item Array. Why: Every ghost needs a minimal item-shaped object so it can flow through the same mapping logic as a live item below. How: This turns each recorded ghost name into a small stand-in object flagged __delBoo.


			{ __delBoo : true, id : iteIdeStr, name : iteNamStr, pickerId : scoValStr, vacation : false } // What: Ghost Item Object. Why: A ghost has to look like a real item so it flows through the same mapping below. How: This mirrors a live item's own id/name/pickerId/vacation fields, flagged __delBoo.


		) );


		const allIteArr : ( Partial< IteRcdTyp > & Pick< IteRcdTyp, 'id' | 'name' > & { __delBoo? : boolean } )[] = [ ...livIteArr, ...ghoIteArr ]; // What: All Item Array. Why: The mapping below builds one output row per item regardless of whether it's live or a ghost. How: This concatenates both arrays into one combined list.



		return allIteArr.map( ( iteCurObj ) : PibRowTyp => { // What: Row Build Map. Why: Every item, live or ghost, needs its own combined row of every metric the breakdown card can show. How: This looks each item up in every per-item map above and packages the results together.


			const couEntObj = picCouMap.get( iteCurObj.id ) || { autNum : 0, couNum : 0, manNum : 0, rerNum : 0 };                               // What: Count Entry Object. Why: An item with no picks at all still needs a zeroed count entry to read from. How: This looks iteCurObj's own id up in picCouMap, falling back to zeros.
			const freEntObj = freGapMap.get( iteCurObj.id ) || { calNum : null, couNum : 0, eliNum : null };                                     // What: Frequency Entry Object. Why: An item with no frequency data at all still needs a null-filled entry to read from. How: This looks iteCurObj's own id up in freGapMap, falling back to nulls.
			const aveGapNum = freModStr === 'calendar' ? freEntObj.calNum : freEntObj.eliNum;                                                    // What: Average Gap Number. Why: The row's own displayed gap depends on which unit mode is currently active. How: This picks whichever of freEntObj's two fields matches freModStr.
			const lasDatStr = lasPicMap.get( iteCurObj.id ) || null;                                                                             // What: Last Date String. Why: The row needs this item's own most recent pick date, or null if it's never been picked. How: This looks iteCurObj's own id up in lasPicMap.
			const lasCalNum = lasDatStr ? Math.round( ( new Date( todIsoStr ).getTime() - new Date( lasDatStr ).getTime() ) / 86400000 ) : null; // What: Last Calendar Number. Why: The calendar-mode "days ago" reading needs a literal wall-clock day count. How: This divides the millisecond difference between today and lasDatStr by a day's own millisecond count. // Calendar days ago vs. eligible days ago; eligible excludes days the picker itself didn't run AND days this item was inactive.
			const eliDatArr = actDatArr.filter( ( dayIsoStr ) => !vacCheObj.inaDayFun( iteCurObj.id, dayIsoStr ) );                              // What: Eligible Date Array. Why: The eligible-mode reading needs this item's own subset of run days, excluding its inactive stretches. How: This filters actDatArr down to days vacCheObj.inaDayFun reports as active for this item.
			const eliIndNum = eliDatArr.indexOf( lasDatStr );                                                                                    // What: Eligible Index Number. Why: The eligible-mode reading needs to know this pick's own position among eligible days. How: This finds lasDatStr's own position in eliDatArr, or -1 if it isn't present at all.
			const lasEliNum = ( lasDatStr != null && eliIndNum >= 0 ) ? ( eliDatArr.length - 1 - eliIndNum ) : null;                             // What: Last Eligible Number. Why: The eligible-mode reading needs "how many eligible days ago", not the raw index. How: This subtracts the pick's own position from the last eligible index.
			const lasDayNum = lasModStr === 'eligible' ? lasEliNum : lasCalNum;                                                                  // What: Last Day Number. Why: The row's own displayed "last picked" value depends on which unit mode is currently active. How: This picks whichever of lasEliNum/lasCalNum matches lasModStr.
			const eliDenNum = picRowArr.reduce( ( sumRunNum, rowCurObj ) => sumRunNum + ( vacCheObj.inaDayFun( iteCurObj.id, rowCurObj.date ) ? 0 : 1 ), 0 ); // What: Eligible Denominator Number. Why: The eligible-mode Count percentage needs a denominator of only the picks made while this item was actually active. How: This sums picRowArr, adding 1 per row unless this item was inactive on that row's own date. // Count denominator: total picks vs. picks made while this item was eligible.
			const notDelBoo = !iteCurObj.__delBoo;                                                                                               // What: Not Deleted Boolean. Why: A deleted item's ghost row never gets the was-inactive label. How: This negates the ghost's own __delBoo marker.
			const notVacBoo = !iteCurObj.vacation;                                                                                               // What: Not Vacation Boolean. Why: A currently-inactive item shows its own inactive tag instead of the was-inactive label. How: This negates the item's own vacation flag.
			const retAftBoo = vacCheObj.retAftFun( iteCurObj.id, lasDatStr || '' );                                                              // What: Return After Boolean. Why: The label only applies when the item came back from inactive after its own last pick. How: This calls vacCheObj.retAftFun with the item's id and lasDatStr, or an empty string for a never-picked item.

			const wasVacBoo = notDelBoo && notVacBoo && retAftBoo; // What: Was Vacation Boolean. Why: This flags an item that went inactive after its own last pick and hasn't been picked again since returning. How: This checks vacCheObj.retAftFun against lasDatStr, only for a live, currently-active item. // Label: not currently inactive, but went inactive after its last pick and hasn't been picked since returning. Never shown for a deleted item.


			const speEntObj = speGapMap.get( iteCurObj.id );                                                          // What: Spent Entry Object. Why: The Spent field reads this item's own completed-cycle averages, when it has any. How: This looks iteCurObj's own id up in speGapMap.
			const speValNum = !speEntObj ? null : ( speModStr === 'calendar' ? speEntObj.calNum : speEntObj.eliNum ); // What: Spent Value Number. Why: The Spent field needs the same calendar/eligible unit switch as the gap above, sourced from speGapMap instead. How: This returns null when the item has no completed cycle, otherwise the mode-selected average.



			return { // What: Breakdown Row Return. Why: This is the single combined object the Pick breakdown card renders one list item from. How: This packages the item's own identity flags alongside every metric value computed above.


				autNum : couEntObj.autNum,                   // What: Auto Number. Why: The Auto metric reads this count. How: This passes the auto-sourced pick count.
				couNum : couEntObj.couNum,                   // What: Count Number. Why: The Count metric reads this total. How: This passes the item's own pick count.
				delBoo : !!iteCurObj.__delBoo,               // What: Deleted Boolean. Why: A ghost row gets its own "deleted" tag. How: This reads the ghost's own __delBoo marker.
				denNum : eliDenNum,                          // What: Denominator Number. Why: The eligible-mode Count percentage divides by this. How: This passes eliDenNum.
				freNum : freEntObj.couNum,                   // What: Frequency Number. Why: A never-gapped item still sorts by how often it was picked. How: This passes freEntObj's own distinct-day count.
				gapNum : aveGapNum,                          // What: Gap Number. Why: The Frequency metric reads this average gap. How: This passes aveGapNum.
				ideStr : iteCurObj.id,                       // What: Identifier String. Why: Each row needs a stable React key and raw-item lookup. How: This copies the item's own id.
				lasNum : lasDayNum,                          // What: Last Number. Why: The Last Picked metric reads this. How: This passes lasDayNum.
				manNum : couEntObj.manNum,                   // What: Manual Number. Why: The Hand Picked metric reads this count. How: This passes the hand-picked count.
				namStr : iteCurObj.name,                     // What: Name String. Why: Every row needs a visible name. How: This copies the item's own name.
				rejNum : rejCouMap.get( iteCurObj.id ) || 0, // What: Rejected Number. Why: The Re-Rolled Away metric reads this count. How: This looks the item up in rejCouMap.
				skiNum : skiCouMap.get( iteCurObj.id ) || 0, // What: Skipped Number. Why: The Skipped metric reads this count. How: This looks the item up in skiCouMap.
				speNum : speValNum,                          // What: Spent Number. Why: The Spent metric reads this. How: This passes speValNum.
				vacBoo : !!iteCurObj.vacation,               // What: Vacation Boolean. Why: An inactive item gets its own "inactive" tag. How: This reads the item's own vacation flag.
				wasBoo : wasVacBoo                           // What: Was Boolean. Why: The Last Picked metric flags an item that went inactive after its last pick. How: This passes wasVacBoo.


			};


		} );


	}, [ isaPicBoo, staAppObj.items, scoValStr, picLogArr, cutIsoStr, picCouMap, freGapMap, rejCouMap, skiCouMap, speGapMap, lasPicMap, actDatArr, vacCheObj, picRowArr, lasModStr, freModStr, speModStr, todIsoStr ] ); // What: Memo Dependency Array. Why: Every input this join reads from must be listed so a change to any one of them rebuilds the combined rows. How: isaPicBoo, scoValStr, and staAppObj.items decide which items get rows, picLogArr, cutIsoStr, and todIsoStr bound the logged history and its day gaps, picCouMap, freGapMap, rejCouMap, skiCouMap, speGapMap, lasPicMap, and picRowArr supply each row's counts and gaps, actDatArr and vacCheObj decide which days count as active, and lasModStr, freModStr, and speModStr pick each metric's calendar or eligible mode.



	const freKeyStr = easDowBoo ? 'spent' : 'freq';                                              // What: Frequency Key String. Why: Which metric key represents "the frequency-like metric" depends on the scoped picker's own mode. How: This resolves to 'spent' for an ease-down picker, 'freq' otherwise. // Active metric for ease-down swaps Frequency to Spent. Guards against a stale 'spent'/'freq' selection lingering when switching picker modes.
	const effMetStr = ( metKeyStr === 'freq' || metKeyStr === 'spent' ) ? freKeyStr : metKeyStr; // What: Effective Metric String. Why: The rest of the card must treat a stale 'freq'/'spent' selection as whichever one actually applies to the current picker's mode. How: This substitutes freKeyStr whenever metKeyStr is either of those two, otherwise passes metKeyStr through unchanged.


	const breLisArr = React.useMemo( () => { // What: Breakdown List Array Memo. Why: The Pick breakdown card needs perIteArr resorted by whichever metric/direction is currently active. How: This branches per effMetStr's own shape, since a null-heavy metric needs its own bottom-pinning comparator. // Sort perIteArr by the active metric + direction. Frequency and Last- picked pin their "no data" rows (never-picked) to the bottom.


		const sorDirNum = sorDirStr === 'desc' ? -1 : 1; // What: Sort Direction Number. Why: Every branch below needs a plain +1/-1 multiplier instead of re-checking the string per comparison. How: This is -1 for descending (since the raw subtraction below is ascending-oriented), 1 for ascending.
		const sorIteArr = perIteArr.slice();             // What: Sorted Item Array. Why: The original perIteArr order must stay stable for other consumers, so a copy is sorted instead. How: This is a shallow copy, sorted in place by whichever branch below runs.


		const nulSorFun = ( keyNamStr : 'gapNum' | 'lasNum' | 'speNum', tieBreFun : ( iteOneObj : PibRowTyp, iteTwoObj : PibRowTyp ) => number ) => ( iteOneObj : PibRowTyp, iteTwoObj : PibRowTyp ) => { // What: Null Sort Function. Why: Frequency, Last Picked, and Spent all share the same "missing values sink to the bottom" comparator, differing only in which field they read and how they break a double-null tie. How: This returns a comparator over keyNamStr that pins nulls last and uses tieBreFun when both sides are null.


			if ( iteOneObj[ keyNamStr ] == null && iteTwoObj[ keyNamStr ] == null ) return tieBreFun( iteOneObj, iteTwoObj ); // What: Both Null Guard. Why: Two equally-missing values fall back to the caller's own tie-break. How: This returns tieBreFun's own result.



			if ( iteOneObj[ keyNamStr ] == null ) return 1; // What: Left Null Guard. Why: A missing value always sinks to the bottom regardless of sort direction. How: This orders the left side after the right.



			if ( iteTwoObj[ keyNamStr ] == null ) return -1; // What: Right Null Guard. Why: Same reasoning as the left-null guard, mirrored. How: This orders the right side after the left.



			return sorDirNum * ( iteOneObj[ keyNamStr ] - iteTwoObj[ keyNamStr ] ) || iteOneObj.namStr.localeCompare( iteTwoObj.namStr ); // What: Numeric Comparison Return. Why: Both values are real numbers at this point. How: This orders by the field in the active direction, tie-breaking alphabetically.


		};


		const namTieFun = ( iteOneObj : PibRowTyp, iteTwoObj : PibRowTyp ) => iteOneObj.namStr.localeCompare( iteTwoObj.namStr ); // What: Name Tie Function. Why: Most null-pinned metrics break a double-null tie alphabetically. How: This compares the two rows' own names.



		if ( effMetStr === 'freq' ) sorIteArr.sort( nulSorFun( 'gapNum', ( iteOneObj, iteTwoObj ) => ( iteTwoObj.freNum - iteOneObj.freNum ) || namTieFun( iteOneObj, iteTwoObj ) ) ); // What: Frequency Sort Branch. Why: A never-gapped item sinks to the bottom, most-picked first among those. How: This sorts by gapNum, breaking a double-null tie by freNum then name.

		else if ( effMetStr === 'last' ) sorIteArr.sort( nulSorFun( 'lasNum', namTieFun ) ); // What: Last Picked Sort Branch. Why: A never-picked item has no lasNum and sinks to the bottom. How: This sorts by lasNum, breaking a double-null tie by name.

		else if ( effMetStr === 'spent' ) sorIteArr.sort( nulSorFun( 'speNum', namTieFun ) ); // What: Spent Sort Branch. Why: An item with no completed cycle has no speNum and sinks to the bottom. How: This sorts by speNum, breaking a double-null tie by name.

		else sorIteArr.sort( ( iteOneObj, iteTwoObj ) => sorDirNum * ( iteOneObj[ MET_FIE_OBJ[ effMetStr ] ] - iteTwoObj[ MET_FIE_OBJ[ effMetStr ] ] ) || namTieFun( iteOneObj, iteTwoObj ) ); // What: Plain Numeric Sort Branch. Why: Every remaining metric (count/auto/manual/rejected/skipped) is a plain always-present number. How: This reads whichever row field MET_FIE_OBJ maps the metric to, tie-breaking alphabetically.



		return sorIteArr; // What: Breakdown List Return. Why: This is the finished, metric-sorted list the Pick breakdown card renders. How: This returns whichever branch above sorted sorIteArr in place.


	}, [ perIteArr, effMetStr, sorDirStr ] ); // What: Memo Dependency Array. Why: This list only ever needs resorting when the underlying rows, the active metric, or the sort direction changes. How: perIteArr supplies the rows, effMetStr/sorDirStr together determine the comparator branch and direction.

	// #endregion Per-Item Breakdown List



	// #region Cadence-Aware Formatting

	const staCadStr = ( scoPicObj && scoPicObj.cadence ) || 'daily';              // What: Stat Cadence String. Why: Every unit-formatting helper below needs to know the scoped picker's own cadence. How: This reads scoPicObj.cadence, falling back to 'daily' for a picker with none set. // Cadence-aware unit words. A cadence picker runs once per period, so its own "eligible" (run-count) values ARE period counts, so eligible mode relabels days into week/month/year. Calendar mode always stays in literal days.
	const isaCadBoo = staCadStr !== 'daily';                                      // What: Is-A Cadenced Boolean. Why: A daily picker's own values never need relabeling into a different unit word. How: This is true whenever staCadStr isn't the 'daily' default.
	const perDayNum = PER_DAY_OBJ[ staCadStr ] || 1;                              // What: Period Day Number. Why: cadDisFun below needs this scoped picker's own approximate days-per-period value. How: This looks staCadStr up in PER_DAY_OBJ, falling back to 1 for a daily picker.
	const eliUniStr = isaCadBoo ? CAD_NAM_OBJ.uniWorFun( staCadStr, 2 ) : 'days'; // What: Eligible Unit String. Why: The eligible-mode toggle button's own label needs a plural unit word matching the picker's cadence. How: This asks CAD_NAM_OBJ.uniWorFun for the plural form (using 2 as a representative plural count), or falls back to 'days'. // Plural unit word for the eligible-mode toggle labels (weeks/months/ years).
	const calUniStr = isaCadBoo ? `calendar ${ eliUniStr }` : 'calendar days';    // What: Calendar Unit String. Why: The calendar-mode toggle button's own label needs the same cadence-aware relabeling as the eligible one. How: This prefixes eliUniStr with "calendar", or falls back to the literal "calendar days". // Toggle-button label for calendar mode (relabelled to the cadence unit).


	const uniForFun = ( valCouNum : number ) => isaCadBoo // What: Unit For Function. Why: A day-count metric's own unit word depends on both the picker's cadence and whether the value is singular or plural. How: This defers to CAD_NAM_OBJ.uniWorFun for a cadenced picker, otherwise pluralizes the literal word "day".
		? CAD_NAM_OBJ.uniWorFun( staCadStr, valCouNum ) // What: Cadenced Branch. Why: A cadenced picker counts in its own period unit. How: This asks CAD_NAM_OBJ.uniWorFun for the matching word.
		: ( valCouNum === 1 ? 'day' : 'days' );         // What: Daily Branch. Why: A daily picker counts in plain days. How: This pluralizes "day" by valCouNum.


	const cadDisFun = ( rawDayNum : number, uniModStr : string, daiDayNum : number ) => { // What: Cadence Display Function. Why: Every day-count metric's own value column needs this same conversion, so it's centralized once instead of repeated per metric. How: This converts rawDayNum into cadence periods for a cadenced picker, otherwise passing daiDayNum straight through. // Format a raw day-count metric for the value column. A cadence picker converts calendar days into periods and ALWAYS shows one decimal (forced ".0") so eligible and calendar line up; a daily picker keeps its existing whole-day display via daiDayNum. Returns { num (string), word }.


		if ( !isaCadBoo ) return { // What: Daily Return. Why: A daily picker's own value column already has its own whole-day formatting computed by the caller. How: This returns daiDayNum as-is, with a simple singular/plural "day"/"days" word.


			numStr : String( daiDayNum ),                 // What: Number String. Why: The value column renders its number as text. How: This converts daiDayNum to a string unchanged.
			worStr : ( daiDayNum === 1 ? 'day' : 'days' ) // What: Word String. Why: The value needs a matching singular or plural unit word. How: This picks day for exactly 1 and days otherwise.


		};



		const perValNum = uniModStr === 'calendar' ? rawDayNum / perDayNum : rawDayNum; // What: Period Value Number. Why: A calendar-mode raw day count must be converted into periods before display; an eligible-mode one is already in periods. How: This divides by perDayNum only in calendar mode.



		return { // What: Cadence Return. Why: A cadenced picker's own value column always shows one forced decimal place, with a matching singular/plural unit word. How: This rounds perValNum to one decimal and asks CAD_NAM_OBJ.uniWorFun for the matching word.


			numStr : ( Math.round( perValNum * 10 ) / 10 ).toFixed( 1 ), // What: Number String. Why: A cadenced value always shows one forced decimal place. How: This rounds perValNum to one decimal and formats it.
			worStr : CAD_NAM_OBJ.uniWorFun( staCadStr, perValNum )       // What: Word String. Why: The value needs a matching singular or plural period word. How: This asks CAD_NAM_OBJ.uniWorFun for it.


		};


	};


	const lasForFun = ( dayCouNum : number, uniModStr : string ) => { // What: Last Format Function. Why: The Last Picked metric's own value column needs a distinct elapsed-time label rather than the plain cadDisFun format. How: This special-cases zero (as "Most recent"), otherwise phrasing a cadence-aware or literal "N days ago" string. // Human label for "last picked", in the active unit.


		if ( uniModStr === 'eligible' ) { // What: Eligible Mode Branch. Why: Eligible-mode "last picked" is already a period count, phrased differently from the calendar branch below. How: This special-cases zero, then a cadenced or plain count.


			if ( dayCouNum === 0 ) return 'Most recent'; // What: Eligible Zero Case. Why: A pick on the latest run reads more naturally as "Most recent". How: This short-circuits before the phrased branches below.



			if ( isaCadBoo ) return `${ ( Math.round( dayCouNum * 10 ) / 10 ).toFixed( 1 ) } ${ CAD_NAM_OBJ.uniWorFun( staCadStr, dayCouNum ) }`; // What: Eligible Cadenced Case. Why: A cadenced picker's own eligible reading is already a period count. How: This phrases it with one decimal and the matching period word.



			return `${ dayCouNum } ${ uniForFun( dayCouNum ) }`; // What: Eligible Daily Return. Why: A daily picker's own eligible reading is a plain run count. How: This phrases it with uniForFun's own unit word.


		}



		if ( dayCouNum === 0 ) return 'Most recent'; // What: Calendar Zero Case. Why: A same-day pick reads more naturally as "Most recent" than "0 days" in calendar mode too. How: This short-circuits before the cadence/plain branches below.



		if ( isaCadBoo ) { // What: Calendar Cadenced Case. Why: A cadenced picker's own calendar-mode reading must still convert into its own period unit. How: This divides dayCouNum by perDayNum, then phrases it the same way the eligible branch above does.


			const perValNum = dayCouNum / perDayNum; // What: Period Value Number. Why: A calendar day count must become a period count first. How: This divides dayCouNum by perDayNum.



			return `${ ( Math.round( perValNum * 10 ) / 10 ).toFixed( 1 ) } ${ CAD_NAM_OBJ.uniWorFun( staCadStr, perValNum ) }`; // What: Calendar Cadenced Return. Why: This is the phrased period-count reading. How: This formats perValNum with one decimal and the matching period word.


		}



		return dayCouNum === 1 ? 'Yesterday' : `${ dayCouNum } days`; // What: Calendar Daily Case. Why: A plain daily picker's own calendar-mode reading is just literal days. How: This special-cases exactly one day as "Yesterday", otherwise a plain "N days" string.


	};

	// #endregion Cadence-Aware Formatting



	// #region Suffix Helpers

	const weiSufFun = React.useCallback( ( iteCurObj : Partial< IteRcdTyp > | undefined ) => { // What: Weight Suffix Function. Why: A weighted/dynamic picker's own items need their configured weight shown alongside the Count metric. How: This returns null unless useWeiBoo is true, otherwise a "weight N" string. // Name suffixes, scoped to the metric being shown: - Count -> weight suffix (weighted / dynamic) - Freq/Spent -> range suffix (ease modes), days from the drift band (soonest = 100/easeMax, latest = 100/easeMin) - Auto/Hand Picked/Re-Rolled Away -> no suffix ("{name} {count}")


		if ( !iteCurObj || !useWeiBoo ) return null; // What: Weight Mode Guard. Why: Only a weighted or dynamic picker's items carry a weight worth showing. How: This returns null for every other mode, or a missing item.



		return `weight ${ iteCurObj.weight ?? 1 }`; // What: Weight Suffix Return. Why: This is the finished suffix under the item's name. How: This reads the item's own weight, defaulting to 1.


	}, [ useWeiBoo ] ); // What: Callback Dependency Array. Why: This callback's own identity only needs to change when the weighted/dynamic flag itself changes. How: useWeiBoo is the sole external value the function body reads.


	const ranSufFun = React.useCallback( ( iteCurObj : Partial< IteRcdTyp > | undefined ) => { // What: Range Suffix Function. Why: An ease-up/ease-down item's own configured drift band needs surfacing as a day-range suffix. How: This computes the soonest/latest day-band from the item's own (or the picker's default) easeMin/easeMax.


		if ( !iteCurObj || !( easUpwBoo || easDowBoo ) ) return null; // What: Ease Mode Guard. Why: This suffix only applies to an ease-up or ease-down picker. How: This returns null for every other mode.



		const easMinNum = iteCurObj.easeMin ?? scoPicObj.easeMin ?? 1;                   // What: Ease Min Number. Why: The band's own upper bound (latest) is derived from the smaller drift value. How: This reads the item's own easeMin, falling back to the picker's own default, then 1.
		const easMaxNum = iteCurObj.easeMax ?? scoPicObj.easeMax ?? 1;                   // What: Ease Max Number. Why: The band's own lower bound (soonest) is derived from the larger drift value. How: This reads the item's own easeMax, falling back to the picker's own default, then 1.
		const sooDayNum = Math.max( 1, Math.round( THR_VAL_NUM / ( easMaxNum || 1 ) ) ); // What: Soonest Day Number. Why: The fastest a full drift cycle can complete is governed by the larger (max) drift value. How: This divides the threshold by easMaxNum, floored at 1 day.
		const latDayNum = Math.max( 1, Math.round( THR_VAL_NUM / ( easMinNum || 1 ) ) ); // What: Latest Day Number. Why: The slowest a full drift cycle can complete is governed by the smaller (min) drift value. How: This divides the threshold by easMinNum, floored at 1 day.


		const uniWorStr = ( ( scoPicObj && scoPicObj.cadence ) || 'daily' ) !== 'daily' // What: Unit Word String. Why: A cadenced picker's own band suffix must relabel from raw days into its own period word. How: This asks CAD_NAM_OBJ.uniWorFun for latDayNum's own word, or falls back to the literal "days". // sooDayNum/latDayNum are period counts; relabel in the picker's own cadence unit.
			? CAD_NAM_OBJ.uniWorFun( scoPicObj.cadence, latDayNum ) // What: Cadenced Branch. Why: A cadenced picker's band is counted in its own period unit. How: This asks CAD_NAM_OBJ.uniWorFun for latDayNum's own word.
			: 'days';                                               // What: Daily Branch. Why: A daily picker's band is counted in plain days. How: This returns the literal "days".



		return `range ${ sooDayNum }–${ latDayNum } ${ uniWorStr }`; // What: Range Suffix Return. Why: This is the finished "range X-Y unit" string rendered under the item's own name. How: This joins the two computed bounds with an en dash and the resolved unit word.


	}, [ easUpwBoo, easDowBoo, scoPicObj ] ); // What: Callback Dependency Array. Why: This callback's own identity only needs to change when either ease-mode flag or the scoped picker itself changes. How: Each is read directly inside the function body above.


	const actSufFun = React.useCallback( ( iteCurObj : Partial< IteRcdTyp > | undefined ) => { // What: Active Suffix Function. Why: The breakdown list needs one function resolving "whichever suffix applies to the currently active metric", rather than the card checking both individually. How: This dispatches to weiSufFun for the Count metric, ranSufFun for Frequency/Spent, and null otherwise. // Suffix shown for the active metric (count -> weight, freq/spent -> range).


		if ( effMetStr === 'count' ) return weiSufFun( iteCurObj ); // What: Count Suffix Branch. Why: The Count metric shows each item's own weight. How: This returns weiSufFun's own result.



		if ( effMetStr === 'freq' || effMetStr === 'spent' ) return ranSufFun( iteCurObj ); // What: Range Suffix Branch. Why: Frequency and Spent show each item's own drift band. How: This returns ranSufFun's own result.



		return null; // What: No Suffix Return. Why: Every other metric shows no suffix. How: This returns null.


	}, [ effMetStr, weiSufFun, ranSufFun ] ); // What: Callback Dependency Array. Why: This callback's own identity only needs to change when the active metric or either underlying suffix function changes. How: Each is read directly inside the function body above.


	const iteObjMap = React.useMemo( () => { // What: Item Object Map Memo. Why: The breakdown list's own rows don't carry every raw item field, so a suffix needs to look the real item back up by id. How: This maps every live item's own id to itself. // Per-item lookup so the card can fetch the raw item for its suffix.


		const outMapObj = new Map(); // What: Out Map Object. Why: The lookup needs a fresh map to fill. How: This starts empty and is filled by the loop below.


		for ( const iteCurObj of ( staAppObj.items || [] ) ) outMapObj.set( iteCurObj.id, iteCurObj ); // What: Item Map Loop. Why: Every live item needs its own id entry. How: This maps each item's own id to the item itself.



		return outMapObj; // What: Item Map Return. Why: This is the finished id-to-item lookup. How: This returns outMapObj.


	}, [ staAppObj.items ] ); // What: Memo Dependency Array. Why: This map only ever needs rebuilding when the live item list itself changes. How: staAppObj.items is the sole source the loop above reads from.



	const gapForFun = ( gapValNum : number ) => ( gapValNum >= 10 ? Math.round( gapValNum ) : Math.round( gapValNum * 10 ) / 10 ); // What: Gap Format Function. Why: The Frequency metric's own displayed gap should show one decimal for a small, precise value but round to a whole number once the gap is large enough that a decimal adds no useful precision. How: This rounds to the nearest whole number at or above 10, otherwise to one decimal place.



	const freSpeObj = easDowBoo ? { keyStr : 'spent', labStr : 'Spent' } : { keyStr : 'freq', labStr : 'Frequency' }; // What: Frequency Spent Object. Why: An ease-down picker measures Spent in place of Frequency, and pulling this choice out of metPilArr keeps that array's plain rows aligned. How: This picks whichever pill object fits the scoped picker's own mode.


	const metPilArr = [ // What: Metric Pill Array. Why: This defines the fixed set of pill buttons the Pick breakdown card's own metric row renders. How: This is mapped over in that row's JSX, each entry's own key compared against metKeyStr for active-state styling. // Metric pills for the Pick breakdown card (an ease-down picker swaps Frequency for Spent).


		{ keyStr : 'count',    labStr : 'Count'          }, // What: Count Pill Object. Why: Count is the default metric. How: This labels the plain pick-count pill.
		freSpeObj,                                          // What: Frequency Spent Object. Why: The Frequency or Spent pill sits second in the row. How: This places freSpeObj's own chosen pill object here.
		{ keyStr : 'last',     labStr : 'Last Picked'    }, // What: Last Picked Pill Object. Why: Recency is its own metric. How: This labels the days-since pill.
		{ keyStr : 'auto',     labStr : 'Auto'           }, // What: Auto Pill Object. Why: Auto-generated picks are their own metric. How: This labels the auto-count pill.
		{ keyStr : 'manual',   labStr : 'Hand Picked'    }, // What: Manual Pill Object. Why: Hand-picked items are their own metric. How: This labels the manual-count pill.
		{ keyStr : 'rejected', labStr : 'Re-Rolled Away' }, // What: Rejected Pill Object. Why: Re-rolled-away picks are their own metric. How: This labels the rejection-count pill.
		{ keyStr : 'skipped',  labStr : 'Skipped'        }  // What: Skipped Pill Object. Why: Skipped picks are their own metric. How: This labels the skip-count pill.


	];

	// #endregion Suffix Helpers



	// #region Source, Type, And Reminder Breakdown Data

	const souSegArr = React.useMemo( () => { // What: Source Segment Array Memo. Why: The "How picks were chosen" card needs SOU_MET_ARR joined with each source's own live count. How: This tallies picRowArr's own source field, then maps SOU_MET_ARR to include each count. // Source split (picks only).


		const couTalMap = new Map( SOU_MET_ARR.map( ( souCurObj ) => [ souCurObj.keyStr, 0 ] ) ); // What: Count Tally Map. Why: The tally needs one accumulator per real source value, keyed by the pick rows' own saved source values. How: This starts every SOU_MET_ARR source at zero and is incremented by the loop below.

		for ( const rowCurObj of picRowArr ) if ( couTalMap.has( rowCurObj.source ) ) couTalMap.set( rowCurObj.source, couTalMap.get( rowCurObj.source )! + 1 ); // What: Source Tally Loop. Why: Every logged pick contributes one to whichever source produced it. How: This increments couTalMap's own matching entry per row. // What: Non-Null Note. Why: The has check just before it found this key in the tally. How: The ! tells TypeScript the get returns its count.



		return SOU_MET_ARR.map( ( souCurObj ) => ( { // What: Source Segment Return. Why: BreBarCom needs each meta entry joined with its own live count under the couNum field. How: This spreads each SOU_MET_ARR entry, adding its own tallied count.


			...souCurObj, // What: Source Current Spread. Why: Each segment keeps its own color, key, and label from SOU_MET_ARR. How: This spreads the meta entry in first.

			couNum : couTalMap.get( souCurObj.keyStr )! // What: Count Number. Why: Each segment's width comes from its own live tally. How: This looks the entry's own key up in couTalMap. // What: Non-Null Note. Why: couTalMap was built with one entry per row of this same list. How: The ! tells TypeScript every key reads back a count.


		} ) );


	}, [ picRowArr ] ); // What: Memo Dependency Array. Why: This only ever needs recomputing when the underlying pick rows themselves change. How: picRowArr is the sole source the tally loop above reads from.


	const typSegArr = React.useMemo( () => { // What: Type Segment Array Memo. Why: The "By reminder type" card needs TYP_MET_ARR joined with each type's own live count. How: This tallies remRowArr's own type field, then maps TYP_MET_ARR to include each count. // Reminder type split + log list.


		const couTalMap = new Map( TYP_MET_ARR.map( ( typCurObj ) => [ typCurObj.keyStr, 0 ] ) ); // What: Count Tally Map. Why: The tally needs one accumulator per real type value, keyed by the reminder rows' own saved type values. How: This starts every TYP_MET_ARR type at zero and is incremented by the loop below.

		for ( const rowCurObj of remRowArr ) if ( couTalMap.has( rowCurObj.type ) ) couTalMap.set( rowCurObj.type, couTalMap.get( rowCurObj.type )! + 1 ); // What: Type Tally Loop. Why: Every logged completion contributes one to whichever type it belongs to. How: This increments couTalMap's own matching entry per row. // What: Non-Null Note. Why: The has check just before it found this key in the tally. How: The ! tells TypeScript the get returns its count.



		return TYP_MET_ARR.map( ( typCurObj ) => ( { // What: Type Segment Return. Why: BreBarCom needs each meta entry joined with its own live count under the couNum field. How: This spreads each TYP_MET_ARR entry, adding its own tallied count.


			...typCurObj, // What: Type Current Spread. Why: Each segment keeps its own color, key, and label from TYP_MET_ARR. How: This spreads the meta entry in first.

			couNum : couTalMap.get( typCurObj.keyStr )! // What: Count Number. Why: Each segment's width comes from its own live tally. How: This looks the entry's own key up in couTalMap. // What: Non-Null Note. Why: couTalMap was built with one entry per row of this same list. How: The ! tells TypeScript every key reads back a count.


		} ) );


	}, [ remRowArr ] ); // What: Memo Dependency Array. Why: This only ever needs recomputing when the underlying reminder rows themselves change. How: remRowArr is the sole source the tally loop above reads from.


	const remLogArr = React.useMemo( () => ( // What: Reminder Log Array Memo. Why: The "Reminders completed" summary card (All view) needs remRowArr sorted newest-first, independent of the breakdown card's own sort toggle. How: This sorts a copy of remRowArr descending by completedAt.


		remRowArr.slice().sort( ( rowOneObj, rowTwoObj ) => ( rowOneObj.completedAt < rowTwoObj.completedAt ? 1 : -1 ) ) // What: Newest First Sort. Why: The summary lists the latest completions first. How: This sorts a copy of remRowArr descending by completedAt.


	), [ remRowArr ] ); // What: Memo Dependency Array. Why: This only ever needs resorting when the underlying reminder rows themselves change. How: remRowArr is the sole source the sort above reads from.


	const remComArr = React.useMemo( () => { // What: Reminder Completion Array Memo. Why: The Completions metric pivot needs one row per reminder with its own total completion count in range. How: This groups remRowArr by taskId, then sorts the grouped totals by remSorStr. // "Reminders breakdown" card data. Per-reminder COMPLETION totals in range (grouped by taskId, denormalized name/type). Includes long- gone one-time reminders, since the log row persists after the task is purged, so its history stays counted.


		if ( !isaRemBoo ) return []; // What: Scope Guard. Why: This grouping only matters while the Reminders scope is active. How: This returns an empty array otherwise.



		const remTotMap = new Map(); // What: Reminder Total Map. Why: Every completion needs filing under its own reminder before the totals can be sorted. How: This starts empty and is filled by the loop below.

		for ( const rowCurObj of remRowArr ) { // What: Completion Grouping Loop. Why: Every logged completion contributes one to its own reminder's running total. How: This looks up (or lazily creates) the reminder's own accumulator, then increments it.


			const remEntObj = remTotMap.get( rowCurObj.taskId ) || { couNum : 0, namStr : rowCurObj.name, typStr : rowCurObj.type }; // What: Reminder Entry Object. Why: A reminder's own accumulator might already exist from an earlier completion. How: This looks it up, or starts a fresh zeroed entry using the row's own denormalized name/type.

			remEntObj.couNum++; // What: Reminder Count Increment. Why: Every logged row counts toward this reminder's own total. How: This increments couNum.

			remEntObj.namStr = rowCurObj.name; // What: Reminder Name Refresh. Why: The reminder may have been renamed between log entries. How: This overwrites namStr from the current row.
			remEntObj.typStr = rowCurObj.type; // What: Reminder Type Refresh. Why: The reminder's type may have changed between log entries. How: This overwrites typStr from the current row.

			remTotMap.set( rowCurObj.taskId, remEntObj ); // What: Reminder Entry Store. Why: The freshly-updated entry must be written back, since it may have just been created above. How: This sets the entry back under its own taskId key.


		}



		const sorDirNum = remSorStr === 'desc' ? -1 : 1; // What: Sort Direction Number. Why: The sort below needs a plain +1/-1 multiplier instead of re-checking the string per comparison. How: This is -1 for descending, 1 for ascending.



		return [ ...remTotMap.values() ].sort( ( remOneObj, remTwoObj ) => sorDirNum * ( remOneObj.couNum - remTwoObj.couNum ) || remOneObj.namStr.localeCompare( remTwoObj.namStr ) ); // What: Completion Totals Return. Why: This is the finished, sorted per-reminder completion list the Completions pivot renders. How: This sorts the grouped totals by couNum, tie-breaking alphabetically.


	}, [ isaRemBoo, remRowArr, remSorStr ] ); // What: Memo Dependency Array. Why: This list only ever needs rebuilding when the Reminders-scope flag, the underlying rows, or the sort direction changes. How: Each feeds one part of the grouping/sorting above.


	const remSkiArr = React.useMemo( () => { // What: Reminder Skip Array Memo. Why: The Skipped metric pivot needs one row per reminder with its own total skip count in range. How: This groups staAppObj.reminderSkipLog by taskId, then sorts the grouped totals by remSorStr. // Per-reminder SKIP totals in range (same shape).


		if ( !isaRemBoo ) return []; // What: Scope Guard. Why: This grouping only matters while the Reminders scope is active. How: This returns an empty array otherwise.



		const remTotMap = new Map(); // What: Reminder Total Map. Why: Every skip needs filing under its own reminder before the totals can be sorted. How: This starts empty and is filled by the loop below.

		for ( const rowCurObj of ( staAppObj.reminderSkipLog || [] ) ) { // What: Skip Grouping Loop. Why: Every logged skip contributes one to its own reminder's running total, subject to the same type/hidden/range rules as remRowArr. How: This filters non-matching rows, then increments the reminder's own accumulator.


			if ( !enaTypArr.includes( rowCurObj.type ) ) continue; // What: Type Guard. Why: Only a skip whose own type opts into Stats should count. How: This skips any row whose type isn't in enaTypArr.



			if ( hidTasSet.has( rowCurObj.taskId ) ) continue; // What: Hidden Task Guard. Why: A hidden task's own history must not surface in this count. How: This skips any row belonging to a hidden task.



			if ( cutIsoStr && isoDayFun( new Date( rowCurObj.skippedAt ) ) < cutIsoStr ) continue; // What: Range Guard. Why: Only a skip inside the active range should count. How: This skips any row whose own skippedAt converts to a day before cutIsoStr.



			const remEntObj = remTotMap.get( rowCurObj.taskId ) || { couNum : 0, namStr : rowCurObj.name, typStr : rowCurObj.type }; // What: Reminder Entry Object. Why: A reminder's own accumulator might already exist from an earlier skip. How: This looks it up, or starts a fresh zeroed entry using the row's own denormalized name/type.

			remEntObj.couNum++; // What: Reminder Count Increment. Why: Every logged row counts toward this reminder's own total. How: This increments couNum.

			remEntObj.namStr = rowCurObj.name; // What: Reminder Name Refresh. Why: The reminder may have been renamed between log entries. How: This overwrites namStr from the current row.
			remEntObj.typStr = rowCurObj.type; // What: Reminder Type Refresh. Why: The reminder's type may have changed between log entries. How: This overwrites typStr from the current row.

			remTotMap.set( rowCurObj.taskId, remEntObj ); // What: Reminder Entry Store. Why: The freshly-updated entry must be written back, since it may have just been created above. How: This sets the entry back under its own taskId key.


		}



		const sorDirNum = remSorStr === 'desc' ? -1 : 1; // What: Sort Direction Number. Why: The sort below needs a plain +1/-1 multiplier instead of re-checking the string per comparison. How: This is -1 for descending, 1 for ascending.



		return [ ...remTotMap.values() ].sort( ( remOneObj, remTwoObj ) => sorDirNum * ( remOneObj.couNum - remTwoObj.couNum ) || remOneObj.namStr.localeCompare( remTwoObj.namStr ) ); // What: Skip Totals Return. Why: This is the finished, sorted per-reminder skip list the Skipped pivot renders. How: This sorts the grouped totals by couNum, tie-breaking alphabetically.


	}, [ cutIsoStr, enaTypArr, hidTasSet, isaRemBoo, remSorStr, staAppObj.reminderSkipLog ] ); // What: Memo Dependency Array. Why: This list only ever needs rebuilding when the Reminders-scope flag, the raw skip log, the enabled types, the range cutoff, the sort direction, or the hidden-task set changes. How: Each feeds one part of the filter/grouping/sorting above.



	const remRecArr = React.useMemo( () => { // What: Reminder Recent Array Memo. Why: The Recent metric pivot needs the raw completion event log, not a grouped total, sorted by the shared direction toggle. How: This sorts a copy of remRowArr by completedAt, applying remSorStr's own direction. // "Recent" is the chronological completion event log (one row per check-off), sorted by the shared sort direction: desc = newest first. Completions/Skipped are per-reminder aggregate counts: desc = highest first.


		const sorDirNum = remSorStr === 'desc' ? -1 : 1; // What: Sort Direction Number. Why: The sort below needs a plain +1/-1 multiplier instead of re-checking the string per comparison. How: This is -1 for descending, 1 for ascending.



		return remRowArr.slice().sort( ( rowOneObj, rowTwoObj ) => ( rowOneObj.completedAt < rowTwoObj.completedAt ? -1 : rowOneObj.completedAt > rowTwoObj.completedAt ? 1 : 0 ) * sorDirNum ).map( ( rowCurObj ) => ( { ideStr : rowCurObj.rowId, namStr : rowCurObj.name, timStr : rowCurObj.completedAt, typStr : rowCurObj.type } ) ); // What: Recent Sort Return. Why: The Recent pivot lists raw completion events in the chosen direction, under the same field names as the Completions/Skipped totals it shares a renderer with. How: This sorts a copy of remRowArr by completedAt, flipped by sorDirNum, then copies each row's saved fields into ideStr/namStr/timStr/typStr.


	}, [ remRowArr, remSorStr ] ); // What: Memo Dependency Array. Why: This only ever needs resorting when the underlying reminder rows or the sort direction changes. How: Both feed the sort comparator above.


	const remBreArr = remMetStr === 'skipped' ? remSkiArr : remMetStr === 'completions' ? remComArr : remRecArr; // What: Reminder Breakdown Array. Why: The card's own rendered list depends on which of the three metric pivots is active. How: This selects remSkiArr/remComArr/remRecArr by remMetStr.
	const remPagNum = Math.max( 1, Math.ceil( remBreArr.length / REM_SIZ_NUM ) );                                // What: Reminder Page Number. Why: PagNavCom needs the total page count to disable the next arrow on the last page. How: This divides remBreArr's own length by REM_SIZ_NUM, rounding up, floored at 1.
	const remSafNum = Math.min( remIndNum, remPagNum - 1 );                                                      // What: Reminder Safe Number. Why: remIndNum can go stale if the underlying list shrinks (e.g. switching metric pivots), landing past the new last page. How: This clamps remIndNum down to the highest valid page index.
	const remIteArr = remBreArr.slice( remSafNum * REM_SIZ_NUM, ( remSafNum + 1 ) * REM_SIZ_NUM );               // What: Reminder Item Array. Why: Only the current page's own slice of remBreArr should actually render. How: This slices remBreArr from the safe page's own start to its own end.

	React.useEffect( () => setRemIndNum( 0 ), [ cutIsoStr, enaTypArr, remMetStr, remSorStr, scoValStr ] ); // What: Reminder Page Reset Effect. Why: Changing what the card even shows should always land back on its own first page rather than an arbitrary stale one. How: This resets remIndNum to 0 whenever any of these five values changes. // Reset to page 1 whenever the metric, sort, scope, or range filter changes.

	const shoRemBoo = scoValStr === 'all' && remEnaBoo; // What: Show Reminder Boolean. Why: The "Reminders completed" summary card only belongs on the combined All view, and only while reminders are enabled at all. How: This checks both conditions together. // Reminders summary card shown on the combined "All" view.

	// #endregion Source, Type, And Reminder Breakdown Data



	return (


		<div className={ cssModObj.tabPagDiv }>{ /* What: Tab Div Element. Why: This is TabStaCom's own root element. How: This renders the help overlay, the header, and the scrollable filters/body wrapper below it. */ }


			<HelOveCom
				actModBoo={ helModBoo }
				helIteArr={ STA_HEL_ARR }

				onCloAllFun={ helExiFun }
			/>{ /* What: Help Overlay Component. Why: Help mode needs its own dimmed tooltip layer above the real page. How: This renders active only while helModBoo is true, fed this page's own STA_HEL_ARR copy. */ }



			<header className={ cssModObj.pagHeaHea }>{ /* What: Header Element. Why: This groups the page's own kicker/help toggle, brand mark, title, and subtitle. How: This renders as a semantic header landmark above the filters/body wrapper. */ }


				<div className={ cssModObj.kicRowDiv }>{ /* What: Kicker Row Div Element. Why: The page's own kicker and help toggle sit side by side. How: This wraps the kicker span and the HelButCom. */ }


					<div className={ cssModObj.pagKicDiv }>Stats</div>{ /* What: Kicker Div Element. Why: Every tab opens with a small labelled kicker naming the page. How: This renders the literal word "Stats". */ }



					<HelButCom
						actModBoo={ helModBoo }

						onTogModFun={ () => setHelModBoo( ( preHelBoo ) => !preHelBoo ) }
					/>{ /* What: Help Button Component. Why: This page needs its own header toggle for entering/leaving help mode. How: This flips helModBoo on click, reflecting its current state via actModBoo. */ }


				</div>



				<div
					className={ cssModObj.heaLeaDiv }

					data-element-name-hook='heaLeaDiv'
				>{ /* What: Lead Div Element. Why: The brand mark and the page title sit together as the header's own lead row. How: This wraps the brand button and the heaTitDiv title block. Its data-element-name-hook is read by help mode's Stats catalog, help mode's Settings catalog, help mode's Today catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


					<button
						className={ cssModObj.braMarBut }

						data-element-name-hook='braMarBut'

						type='button'

						aria-label='Ease My Life link to go to the Today page'

						onClick={ onNavHomFun }
					>{ /* What: Brand Button Element. Why: The logo mark also works as a shortcut back to the Today tab. How: This wraps the logo svg in a real button and calls onNavHomFun on click. Its data-element-name-hook is read by help mode's Stats catalog, help mode's Settings catalog, help mode's Today catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


						<svg
							className={ cssModObj.braMarSvg }

							fill='none'
							viewBox='8 8 528 528'

							aria-hidden='true'
						>{ /* What: Logo Svg Element. Why: This draws the small square "Ease My Life" logo mark. How: This is a fixed-viewBox icon composed of a grid, a rounded-square badge outline, and a clipped glyph path. */ }{ /* Same theme-wired logo as the Today header (currentColor -> accent, grid lines -> accent-soft) so the two tabs read as one product. */ }


							<defs>{ /* What: Clip Defs Element. Why: An SVG clipPath can only be applied via a defined, referenced id, not inline. How: This holds the one clipPath definition the glyph path below references. */ }


								<clipPath
									id='braMarCli--sta'

									clipPathUnits='userSpaceOnUse'
								>{ /* What: Badge Clippath Element. Why: The glyph path's own curves slightly overshoot the rounded-square badge and need to be masked to it. How: This defines a rounded-square clip region, given a unique id so it can be referenced via url(#...). */ }


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
									stroke      : 'var(--acc-tin-col)', // Accent Tint Color = oklch( 0.95 0.025 250 )
									strokeWidth : 16
								}}
							>{ /* What: Grid Group Element. Why: Groups the 8 decorative background lines so they can share one stroke style instead of repeating it 8 times. How: This sets the shared stroke/strokeWidth once, applied to every child path below. */ }


								<path d='M 528 112 L 16 112' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment; its siblings below draw the rest of the grid. */ }

								<path d='M 216 528 L 216 16' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment; its siblings draw the rest of the grid. */ }

								<path d='M 320 528 L 320 16' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment; its siblings draw the rest of the grid. */ }

								<path d='M 424 528 L 424 16' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment; its siblings draw the rest of the grid. */ }

								<path d='M 112 528 L 112 16' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment; its siblings draw the rest of the grid. */ }

								<path d='M 528 216 L 16 216' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment; its siblings draw the rest of the grid. */ }

								<path d='M 528 320 L 16 320' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment; its siblings draw the rest of the grid. */ }

								<path d='M 528 424 L 16 424' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment, completing the grid. */ }


							</g>

							<rect
								style={{
									stroke         : 'currentColor',
									strokeLinecap  : 'round',
									strokeLinejoin : 'round',
									strokeWidth    : 16
								}}

								height='512'
								rx='75'
								ry='75'
								width='512'
								x='16'
								y='16'
							/>{ /* What: Badge Rect Element. Why: The logo needs a visible rounded-square border/badge behind the glyph. How: This draws the same rounded-square shape as the clip rect above, but stroked and visible instead of hidden in defs. */ }

							<path
								style={{
									fill   : 'currentColor',
									stroke : 'currentColor'
								}}

								clipPath='url(#braMarCli--sta)'
								d='M 24.467 527.792 C 67.266 416.298 77.088 228.913 172.207 434.412 C 200.739 535.77 262.562 434.412 314.873 292.51 C 381.45 120.201 450.381 44.636 528.854 24.365 C 521.725 22.337 512.215 24.365 493.193 34.5 C 369.548 105.451 295.85 292.51 234.029 363.461 C 186.473 414.14 167.451 241.831 124.651 262.102 C 101.828 270.008 60.133 375.754 24.467 527.792 Z'
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth='8'
							/>{ /* What: Glyph Path Element. Why: This is the actual squiggly "Ease My Life" brand glyph drawn inside the badge. How: This path is clipped to the rounded-square badge so its curves never spill outside it. */ }


						</svg>


					</button>


					<div className={ cssModObj.heaTitDiv }>{ /* What: Section Header Div Element. Why: The page's own title needs a dedicated wrapper matching every other tab's header layout. How: This wraps the single h1 title below. */ }


						<h1 className={ cssModObj.pagTitHea }>Your <span className={ cssModObj.titAccSpa }>eased</span> life, according to the numbers.</h1>{ /* What: Section Title Element. Why: Every tab needs its own large page title. How: This renders the page's own title text with one accented span. */ }


					</div>


				</div>



				<p className={ cssModObj.pagSubPar }>{ /* What: Section Subtitle Element. Why: The page needs a short explanatory subtitle beneath its title, including a link to the Data page. How: This renders that explanatory copy with an inline button jumping to the Data tab. */ }


					Filter by group, conditionals, reminders, pickers, and time below. This page is best used in conjunction with the{ ' ' }

					<button
						className={ cssModObj.subLinBut }

						type='button'

						onClick={ () => onNavTabFun && onNavTabFun( 'data' ) }
					>Data page</button>{ /* What: Sub Tablink Button Element. Why: The subtitle's own explanation needs a working shortcut to the Data tab. How: This calls onNavTabFun with 'data' when clicked, guarding against a missing onNavTabFun prop. */ }

					, so that you can view the statistics here in order to see if your created items' numbers line up with your expectations and then tweak them in the Data page if they do not.


				</p>


			</header>



			<div
				className={ cssModObj.pagBodDiv }

				style={ touBusObj.resTopNum ? { paddingTop : touBusObj.resTopNum } : undefined }
			>{ /* What: Body Wrap Div Element. Why: The Welcome Tour's own reserved top space applies to the whole scrollable filters/body area together. How: This applies touBusObj.resTopNum as top padding when it's non-zero. */ }


				<div className={ cssModObj.pagFilDiv }>{ /* What: Filters Div Element. Why: This groups every filter row together above the scope-dependent body cards. How: This renders the Group, Type, Show, and Range rows in that fixed order. */ }


					{ exiGroArr.length > 1 && ( // What: Group Row Visibility Check. Why: A Group filter row is pointless with zero or one group in use. How: This renders the row only while more than one distinct group exists.


						<div className={ cssModObj.filRowDiv }>{ /* What: Group Filter Row Div Element. Why: The Group label and its own pill list are grouped as one row. How: This wraps the "Group" label span and the filRaiDiv pill list. */ }


							<span className={ cssModObj.filLabSpa }>Group</span>{ /* What: Group Label Span Element. Why: The row needs its own visible label naming what it filters. How: This renders the literal word "Group". */ }

							<div
								ref={ groRowRef }

								className={ cssModObj.filRaiDiv }

								data-element-name-hook='groFilDiv'
								data-rail-wheel-scroll

								aria-label='Filter pickers by group'
								role='tablist'
							>{ /* What: Group Pill List Div Element. Why: This is the actual scrollable row of Group filter pills. How: This renders an "All" pill first, then one pill per exiGroArr entry. Its data-element-name-hook is read by the Stats page tour, the Pickers page tour, help mode's Stats catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


								<button
									className={ cssModObj.filPilBut }

									data-element-name-hook='filPilBut'

									type='button'

									aria-selected={ staGroStr === 'all' }
									role='tab'

									onClick={ () => { // What: All Group Click Handler. Why: Returning to All must also reset the scope, since a narrowed scope may no longer be visible. How: This resets both staGroStr and scoValStr to 'all'.


										setStaGroStr( 'all' ); // What: Group Filter Reset. Why: The Group row should highlight All again. How: This writes 'all' into staGroStr.
										setScoValStr( 'all' ); // What: Scope Reset. Why: The page should show the combined dashboard again. How: This writes 'all' into scoValStr.


									} }
								>{ /* What: All Group Pill Button Element. Why: The user needs a way back to seeing every group at once. How: This resets both staGroStr and scoValStr to 'all' when clicked. Its data-element-name-hook is read by the Stats page tour, the Pickers page tour, help mode's Stats catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


									All

									<span className={ cssModObj.filCouSpa }>{ picLisArr.filter( ( picCurObj ) => !picCurObj.hidden ).length }</span>{ /* What: Group Count Span Element. Why: The All pill needs its own total picker count. How: This counts every non-hidden picker regardless of group. */ }


								</button>

								{ exiGroArr.map( ( groCurStr ) => ( // What: Group Pill Render. Why: Every distinct group needs its own selectable pill. How: This maps exiGroArr to one button per group name.


									<button
										key={ groCurStr }

										className={ cssModObj.filPilBut }

										data-element-name-hook='filPilBut'

										type='button'

										aria-selected={ staGroStr === groCurStr }
										role='tab'

										onClick={ () => setStaGroStr( groCurStr ) }
									>{ /* What: Group Pill Button Element. Why: The user needs a way to narrow the Show row down to just this one group. How: This sets staGroStr to this pill's own group name when clicked. Its data-element-name-hook is read by the Stats page tour, the Pickers page tour, help mode's Stats catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


										{ groCurStr }{ /* What: Group Name Expression. Why: The pill shows its own group name. How: This renders groCurStr. */ }

										<span className={ cssModObj.filCouSpa }>{ picLisArr.filter( ( picCurObj ) => picCurObj.group === groCurStr && !picCurObj.hidden ).length }</span>{ /* What: Group Count Span Element. Why: This pill needs its own picker count for this specific group. How: This counts every non-hidden picker whose own group matches groCurStr. */ }


									</button>


								))}


							</div>


						</div>


					) }


					{ ( exiModArr.length > 1 || hasConBoo || remEnaBoo ) && ( // What: Type Row Visibility Check. Why: A Type filter row is pointless with only one mode in use and neither Conditionals nor Reminders available. How: This renders the row only while at least one of those three conditions holds.


						<div className={ cssModObj.filRowDiv }>{ /* What: Type Filter Row Div Element. Why: The Type label and its own pill list are grouped as one row. How: This wraps the "Type" label span and the filRaiDiv pill list. */ }


							<span className={ cssModObj.filLabSpa }>Type</span>{ /* What: Type Label Span Element. Why: The row needs its own visible label naming what it filters. How: This renders the literal word "Type". */ }

							<div
								ref={ typRowRef }

								className={ cssModObj.filRaiDiv }

								data-element-name-hook='typFilDiv'
								data-rail-wheel-scroll

								aria-label='Filter pickers by type'
								role='tablist'
							>{ /* What: Type Pill List Div Element. Why: This is the actual scrollable row of Type filter pills. How: This renders an "All" pill first, then every mode/Conditionals/Reminders pill sorted alphabetically by name. Its data-element-name-hook is read by the Stats page tour, the Pickers page tour, help mode's Stats catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


								<button
									className={ cssModObj.filPilBut }

									data-element-name-hook='filPilBut'

									type='button'

									aria-selected={ typFilStr === 'all' }
									role='tab'

									onClick={ () => { // What: All Type Click Handler. Why: Returning to All must also reset the scope, since a narrowed scope may no longer be visible. How: This resets both typFilStr and scoValStr to 'all'.


										setTypFilStr( 'all' ); // What: Type Filter Reset. Why: The Type row should highlight All again. How: This writes 'all' into typFilStr.
										setScoValStr( 'all' ); // What: Scope Reset. Why: The page should show the combined dashboard again. How: This writes 'all' into scoValStr.


									} }
								>{ /* What: All Type Pill Button Element. Why: The user needs a way back to seeing every mode/Conditionals/Reminders at once. How: This resets both typFilStr and scoValStr to 'all' when clicked. Its data-element-name-hook is read by the Stats page tour, the Pickers page tour, help mode's Stats catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


									All

									<span className={ cssModObj.filCouSpa }>{ picLisArr.filter( ( picCurObj ) => !picCurObj.hidden ).length }</span>{ /* What: Type Count Span Element. Why: The All pill needs its own total picker count. How: This counts every non-hidden picker regardless of mode. */ }


								</button>

								{ [ // What: Type Pill Entry Array. Why: The Type row's own pills combine every real mode with the Conditionals/Reminders sentinels. How: This spreads all three sources into one array, sorted and rendered by the chain below. // Conditionals/Reminders sort in alphabetically alongside the real modes, rather than being pinned, so they're easy to find now that both this rail and the Show rail below sort that way. typFilStr doubles as their own scope value ('conditionals' / 'reminders', not a real picker mode) so the Show row below can narrow to just that one card instead of the full "All" list, visPicArr's own mode match naturally excludes every real picker under either value, same as any other empty mode.


									...exiModArr.map( ( picModStr ) => ( { // What: Mode Entry Mapping. Why: Every real mode in use needs its own pill entry with a matching count/click handler before the combined list is sorted. How: This maps each exiModArr entry to a small { cliFun, couNum, keyStr, namStr, selBoo } shape.


										cliFun : () => setTypFilStr( picModStr ),                                                               // What: Click Function. Why: Choosing this pill narrows the Type filter. How: This sets typFilStr to the mode.
										couNum : picLisArr.filter( ( picCurObj ) => picCurObj.mode === picModStr && !picCurObj.hidden ).length, // What: Count Number. Why: The pill shows how many visible pickers use this mode. How: This counts non-hidden pickers with a matching mode.
										keyStr : picModStr,                                                                                     // What: Key String. Why: Each pill needs a stable React key. How: This uses the mode key itself.
										namStr : SED_NAM_OBJ.MOD_DEF_OBJ[ picModStr ].labStr,                                                   // What: Name String. Why: The pill shows the mode's own display label. How: This reads it from SED_NAM_OBJ.MOD_DEF_OBJ.
										selBoo : typFilStr === picModStr                                                                        // What: Selected Boolean. Why: The active Type pill is highlighted. How: This compares typFilStr against the mode.


									}) ),

									...( hasConBoo ? [ { // What: Conditionals Entry Array. Why: The Conditionals sentinel pill only belongs in the list at all once at least one conditional exists. How: This is a one-entry array (or empty) spread into the combined list below.


										couNum : conDefArr.length,             // What: Count Number. Why: The pill shows how many conditionals exist. How: This reads conDefArr's own length.
										keyStr : 'conditionals',               // What: Key String. Why: Each pill needs a stable React key. How: This uses the sentinel value.
										namStr : 'Conditionals',               // What: Name String. Why: The pill needs a visible label. How: This is fixed text.
										selBoo : typFilStr === 'conditionals', // What: Selected Boolean. Why: The active Type pill is highlighted. How: This compares typFilStr against the sentinel.

										cliFun : () => { // What: Click Function. Why: This sentinel pill switches both the Type filter and the whole scope. How: This sets typFilStr and scoValStr to 'conditionals'.


											setTypFilStr( 'conditionals' ); // What: Type Filter Set. Why: The Type row should highlight this pill. How: This writes 'conditionals' into typFilStr.
											setScoValStr( 'conditionals' ); // What: Scope Set. Why: The page should switch to the Conditionals dashboard. How: This writes 'conditionals' into scoValStr.


										}


									} ] : [] ),

									...( remEnaBoo ? [ { // What: Reminders Entry Array. Why: The Reminders sentinel pill only belongs in the list at all once at least one reminder type is enabled. How: This is a one-entry array (or empty) spread into the combined list below.


										couNum : ( staAppObj.tasks || [] ).filter( ( tasCurObj ) => !tasCurObj.hidden ).length, // What: Count Number. Why: The pill shows how many visible reminders exist. How: This counts non-hidden tasks.
										keyStr : 'reminders',                                                                   // What: Key String. Why: Each pill needs a stable React key. How: This uses the sentinel value.
										namStr : 'Reminders',                                                                   // What: Name String. Why: The pill needs a visible label. How: This is fixed text.
										selBoo : typFilStr === 'reminders',                                                     // What: Selected Boolean. Why: The active Type pill is highlighted. How: This compares typFilStr against the sentinel.

										cliFun : () => { // What: Click Function. Why: This sentinel pill switches both the Type filter and the whole scope. How: This sets typFilStr and scoValStr to 'reminders'.


											setTypFilStr( 'reminders' ); // What: Type Filter Set. Why: The Type row should highlight this pill. How: This writes 'reminders' into typFilStr.
											setScoValStr( 'reminders' ); // What: Scope Set. Why: The page should switch to the Reminders dashboard. How: This writes 'reminders' into scoValStr.


										}


									} ] : [] )


								]
									.sort( ( entOneObj, entTwoObj ) => entOneObj.namStr.localeCompare( entTwoObj.namStr ) ) // What: Type Pill Sort. Why: Modes and sentinels list alphabetically together. How: This compares each entry's own namStr.
									.map( ( entCurObj ) => (                                                                // What: Type Pill Render. Why: The combined, sorted list of modes plus Conditionals/Reminders needs one button per entry. How: This maps the sorted array to one button, styled/keyed by each entry's own fields.


										<button
											key={ entCurObj.keyStr }

											className={ cssModObj.filPilBut }

											data-element-name-hook='filPilBut'

											type='button'

											aria-selected={ entCurObj.selBoo }
											role='tab'

											onClick={ entCurObj.cliFun }
										>{ /* What: Type Pill Button Element. Why: The user needs a way to narrow both the Type filter and (for the two sentinels) the scope itself down to this one entry. How: This calls the entry's own cliFun, already closing over whichever behavior it needs. Its data-element-name-hook is read by the Stats page tour, the Pickers page tour, help mode's Stats catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


											{ entCurObj.namStr }{ /* What: Type Name Expression. Why: The pill shows its own mode or sentinel name. How: This renders the entry's own namStr. */ }

											<span className={ cssModObj.filCouSpa }>{ entCurObj.couNum }</span>{ /* What: Type Count Span Element. Why: This pill needs its own picker/conditional/reminder count. How: This renders the entry's own precomputed couNum field. */ }


										</button>


									))}


							</div>


						</div>


					) }


					<div className={ cssModObj.filRowDiv }>{ /* What: Show Filter Row Div Element. Why: The Show label and its own scope-tab list are grouped as one row. How: This wraps the "Show" label span and the scoTabDiv scope list. */ }


						<span className={ cssModObj.filLabSpa }>Show</span>{ /* What: Show Label Span Element. Why: The row needs its own visible label naming what it selects. How: This renders the literal word "Show". */ }

						<div
							key={ staGroStr + '|' + typFilStr }
							ref={ scoRowRef }

							className={ cssModObj.scoTabDiv }

							data-element-name-hook='scoTabDiv'
							data-rail-wheel-scroll
						>{ /* What: Show Tab List Div Element. Why: This is the actual scrollable row of scope tabs (All, Conditionals, Reminders, and every visible picker). How: This remounts (replaying its own enter animation) whenever the Group/Type filter pair changes. Its data-element-name-hook is read by the Stats page tour, help mode's Stats catalog, and help mode's Data catalog. */ }


							{ staGroStr === 'all' && typFilStr === 'all' && ( // What: All Tab Visibility Check. Why: The "All" scope tab only makes sense while neither the Group nor Type filter has narrowed the view. How: This renders the All tab only while both filters are still 'all'.


								<button
									className={ cssModObj.scoTabBut }

									style={{ animationDelay : '0ms' }}

									data-element-name-hook='scoTabBut'
									data-tab-select-active={ scoValStr === 'all' || undefined } // What: Tab Select Active Attribute. Why: The scope showing below should stand out in the strip. How: This is present only on the showing scope's tab.

									type='button'

									onClick={ () => setScoValStr( 'all' ) }
								>{ /* What: All Scope Tab Button Element. Why: The user needs a way back to the combined, everything-at-once dashboard. How: This sets scoValStr to 'all' when clicked. Its data-element-name-hook is read by the Stats page tour, help mode's Stats catalog, and help mode's Data catalog. */ }


									<span className={ cssModObj.scoNamSpa }>All</span>{ /* What: Tab Name Span Element. Why: Every scope tab needs its own visible name. How: This renders the literal word "All". */ }

									<span className={ cssModObj.scoModSpa }>Everything</span>{ /* What: Tab Mode Span Element. Why: Every scope tab needs a small descriptive subline under its name. How: This renders the literal word "Everything". */ }


								</button>


							) }

							{ [ // What: Scope Tab Entry Array. Why: The Show row's own tabs combine the Conditionals/Reminders sentinels with every visible picker. How: This spreads all three sources into one array, sorted and rendered by the chain below. // Everything after "All", Conditionals, Reminders, and every visible picker, sorts together alphabetically by its own displayed name, rather than Conditionals/ Reminders being pinned right after All. typFilStr 'conditionals'/'reminders' (set by their own Type-rail pill) narrows this down to just that one card, same as any real group/type narrows to its own pickers.


								...( ( typFilStr === 'all' || typFilStr === 'conditionals' ) && hasConBoo // What: Conditionals Tab Entry Array. Why: The Conditionals scope tab only belongs in the list while it's reachable from the current Type filter and at least one conditional exists. How: This is a one-entry array (or empty) spread into the combined list below.
									? [ { cliFun : () => setScoValStr( 'conditionals' ), keyStr : 'conditionals', labStr : 'Gates', namStr : 'Conditionals', selBoo : isaConBoo } ] // What: Conditionals Tab Branch. Why: The sentinel tab is reachable here. How: This supplies a one-entry array for the Conditionals scope.
									: [] ), // What: No Conditionals Branch. Why: The sentinel tab is unreachable here. How: This supplies an empty array.

								...( ( typFilStr === 'all' || typFilStr === 'reminders' ) && remEnaBoo // What: Reminders Tab Entry Array. Why: The Reminders scope tab only belongs in the list while it's reachable from the current Type filter and reminders are enabled at all. How: This is a one-entry array (or empty) spread into the combined list below.
									? [ { cliFun : () => setScoValStr( 'reminders' ), keyStr : 'reminders', labStr : 'Tasks', namStr : 'Reminders', selBoo : isaRemBoo } ] // What: Reminders Tab Branch. Why: The sentinel tab is reachable here. How: This supplies a one-entry array for the Reminders scope.
									: [] ), // What: No Reminders Branch. Why: The sentinel tab is unreachable here. How: This supplies an empty array.

								...visPicArr.map( ( picCurObj ) => ( { // What: Picker Tab Entry Mapping. Why: Every currently-visible picker needs its own scope tab entry before the combined list is sorted. How: This maps each visPicArr entry to a small { cliFun, keyStr, labStr, namStr, picStr, selBoo } shape.


									cliFun : () => setScoValStr( picCurObj.id ),               // What: Click Function. Why: Choosing this tab switches the page to this picker. How: This sets scoValStr to the picker's own id.
									keyStr : picCurObj.id,                                     // What: Key String. Why: Each tab needs a stable React key. How: This uses the picker's own id.
									labStr : SED_NAM_OBJ.MOD_DEF_OBJ[ picCurObj.mode ].labStr, // What: Label String. Why: The tab's subline names the picker's mode. How: This reads the mode's own display label.
									namStr : picCurObj.name,                                   // What: Name String. Why: The tab shows the picker's own name. How: This copies it.
									picStr : picCurObj.id,                                     // What: Picker String. Why: The tab carries a data-picker-id hook for the tours. How: This copies the picker's own id.
									selBoo : scoValStr === picCurObj.id                        // What: Selected Boolean. Why: The active tab is highlighted. How: This compares scoValStr against the picker's own id.


								} ) )


							]
								.sort( ( entOneObj, entTwoObj ) => entOneObj.namStr.localeCompare( entTwoObj.namStr ) ) // What: Scope Tab Sort. Why: Sentinels and pickers list alphabetically together. How: This compares each entry's own namStr.
								.map( ( entCurObj : ScoTabTyp, entIndNum ) => (                                         // What: Scope Tab Render. Why: The combined, sorted list of Conditionals/Reminders/pickers needs one button per entry, staggered by its own position. How: This maps the sorted array to one button, each with its own animation delay based on entIndNum.


									<button
										key={ entCurObj.keyStr }

										className={ cssModObj.scoTabBut }

										style={{ animationDelay : ( entIndNum + 1 ) * 40 + 'ms' }}

										data-element-name-hook='scoTabBut'
										data-picker-id={ entCurObj.picStr }
										data-tab-select-active={ entCurObj.selBoo || undefined } // What: Tab Select Active Attribute. Why: The scope showing below should stand out in the strip. How: This is present only on the showing scope's tab.

										type='button'

										onClick={ entCurObj.cliFun }
									>{ /* What: Scope Tab Button Element. Why: The user needs a way to switch the whole page over to this specific Conditionals/Reminders/picker scope. How: This calls the entry's own cliFun when clicked. Its data-element-name-hook is read by the Stats page tour, help mode's Stats catalog, and help mode's Data catalog. */ }


										<span className={ cssModObj.scoNamSpa }>{ entCurObj.namStr }</span>{ /* What: Tab Name Span Element. Why: Every scope tab needs its own visible name. How: This renders the entry's own namStr field. */ }

										<span className={ cssModObj.scoModSpa }>{ entCurObj.labStr }</span>{ /* What: Tab Mode Span Element. Why: Every scope tab needs a small descriptive subline under its name. How: This renders the entry's own labStr field. */ }


									</button>


								))}


						</div>


					</div>


					<div className={ cssModObj.filRowDiv }>{ /* What: Range Filter Row Div Element. Why: The Range label and its own pill list are grouped as one row. How: This wraps the "Range" label span and the ranPilDiv list. */ }


						<span className={ cssModObj.filLabSpa }>Range</span>{ /* What: Range Label Span Element. Why: The row needs its own visible label naming what it filters. How: This renders the literal word "Range". */ }

						<div
							ref={ ranRowRef }

							className={ cssModObj.ranPilDiv }

							data-element-name-hook='ranPilDiv'
							data-rail-wheel-scroll
						>{ /* What: Range Pill List Div Element. Why: This is the actual scrollable row of Range filter pills. How: This renders one pill per STA_RAN_ARR entry. Its data-element-name-hook is read by the Stats page tour and help mode's Stats catalog. */ }


							{ STA_RAN_ARR.map( ( ranCurObj ) => ( // What: Range Pill Render. Why: Every configured lookback window needs its own selectable pill. How: This maps STA_RAN_ARR to one button per range.


								<button
									key={ ranCurObj.keyStr }

									className={ cssModObj.ranPilBut }

									data-element-name-hook='ranPilBut'
									data-pill-select-active={ ranValStr === ranCurObj.keyStr || undefined } // What: Pill Select Active Attribute. Why: The active range should stand out. How: This is present only on the showing range's pill.

									type='button'

									onClick={ () => setRanValStr( ranCurObj.keyStr ) }
								>{ ranCurObj.labStr }</button> // What: Range Pill Button Element. Why: The user needs a way to switch the whole page over to this specific lookback window. How: This sets ranValStr to this pill's own keyStr when clicked. Its data-element-name-hook is read by the Stats page tour and help mode's Stats catalog.


							))}


						</div>


					</div>


				</div>



				<div
					key={ scoValStr + '|' + ranValStr }

					className={ cssModObj.staBodDiv }
				>{ /* What: Body Div Element. Why: This groups every scope-dependent card below the filter rows, remounting (and replaying its own fade) whenever the scope or range changes. How: This renders the single-picker header, the Conditionals/headline/heatmap blocks, and every remaining card in a fixed order. */ }


					{ isaPicBoo && scoPicObj && ( // What: Picker Identity Visibility Check. Why: This header block only makes sense while a single real picker is the active scope. How: This renders it only while isaPicBoo is true and scoPicObj actually resolved. // Picker identity (single-picker scope), mirrors the Pickers page header: "Picker" kicker, then name, then the mode pill below it, then the mode's own description.


						<div
							className={ cssModObj.picIdeDiv }

							data-element-name-hook='picIdeDiv'
						>{ /* What: Picker Identity Div Element. Why: This groups the scoped picker's own kicker, name, mode pill, and hint text. How: This wraps those four pieces in a fixed order. Its data-element-name-hook is read by help mode's Stats catalog. */ }


							<span className={ cssModObj.pagKicSpa }>Picker</span>{ /* What: Picker Kicker Span Element. Why: This block needs its own small label naming what it identifies. How: This renders the literal word "Picker". */ }

							<h2
								className={ cssModObj.picTitHea }

								data-element-name-hook='picTitHea'
							>{ scoPicObj.name }</h2>{ /* What: Picker Title Element. Why: The scoped picker's own name is the headline of this identity block. How: This renders scoPicObj.name. Its data-element-name-hook is read by help mode's Stats catalog and help mode's Pickers catalog. */ }



							<PilTagCom
								data-element-name-hook='modPilSpa'

								tonValStr='mode'
							>{ ( SED_NAM_OBJ.MOD_DEF_OBJ[ scoPicObj.mode ] || {} ).labStr || scoPicObj.mode }</PilTagCom>{ /* What: Pill Tag Component. Why: The scoped picker's own mode needs a small labelled pill under its name. How: This renders that mode's own SED_NAM_OBJ.MOD_DEF_OBJ label, falling back to the raw mode key. Its data-element-name-hook is read by help mode's Stats catalog and help mode's Pickers catalog. */ }



							{ ( () => { // What: Mode Hint Render. Why: A mode's own hint text can be either a single paragraph or several, and each needs wrapping in its own paragraph element. How: This reads the mode's own hint field and maps an array into one <p> per paragraph, or wraps a plain string in one.


								const modHinVal = ( SED_NAM_OBJ.MOD_DEF_OBJ[ scoPicObj.mode ] || {} ).hinArr; // What: Mode Hint Value. Why: The render below needs this looked up once rather than twice. How: This reads the scoped picker's own mode's hint field, which may be a string or an array of strings.


								if ( !Array.isArray( modHinVal ) ) { // What: Single Hint Guard. Why: A plain-string hint is just one paragraph. How: This returns it wrapped in a single picHinPar paragraph.


									return (


										<p
											className={ cssModObj.picHinPar }

											data-element-name-hook='picHinPar'
										>{ modHinVal }</p> // What: Picker Hint Paragraph Element. Why: A plain-string hint needs just one paragraph element. How: This renders modHinVal. Its data-element-name-hook is read by help mode's Stats catalog and help mode's Pickers catalog.


									);


								}



								return modHinVal.map( ( parCurStr, parIndNum ) => ( // What: Paragraph Hint Return. Why: A multi-paragraph hint needs one paragraph element per entry. How: This maps each string to its own picHinPar paragraph, keyed by position.


									<p
										key={ parIndNum }

										className={ cssModObj.picHinPar }

										data-element-name-hook='picHinPar'
									>{ parCurStr }</p> // What: Picker Hint Paragraph Element. Why: Each hint paragraph needs its own element. How: This renders parCurStr. Its data-element-name-hook is read by help mode's Stats catalog and help mode's Pickers catalog.


								) );


							})() }


						</div>


					) }



					{ isaConBoo && ( () => { // What: Conditionals Body Visibility Check. Why: This entire block only renders while the Conditionals scope is active. How: This IIFE computes two small local formatters once, then returns the headline cards and breakdown list together.


						const conDayFun = ( datIsoStr : string ) => new Date( datIsoStr + 'T00:00:00' ).toLocaleDateString( undefined, { day : 'numeric', month : 'short' } ); // What: Conditional Day Function. Why: Both the headline "last fired" card and the breakdown's own Last Fired column need the same short date label. How: This formats an ISO date string as a locale "month day" label.



						return (


							<React.Fragment>{ /* What: Conditionals Fragment Element. Why: This groups the headline row and the breakdown card without adding an extra DOM wrapper of its own. How: This wraps those two sibling blocks. */ }


								<div className={ cssModObj.staRowDiv }>{ /* What: Conditional Headline Row Div Element. Why: The four Conditionals headline numbers share the same row layout as every other scope's own headline cards. How: This renders one CarSurCom per headline number. */ }


									<CarSurCom
										className={ cssModObj.staCarDiv }

										data-element-name-hook='conFirDiv'
									>{ /* What: Card Surface Component. Why: Every headline number shares the same card chrome. How: This wraps the "triggered" total. Its data-element-name-hook is read by help mode's Stats catalog. */ }


										<div className={ cssModObj.staNumDiv }>{ conTotObj.firNum }</div>{ /* What: Stat Number Div Element. Why: The headline card needs its own large number. How: This renders conTotObj.firNum. */ }

										<div className={ cssModObj.staLabDiv }>triggered</div>{ /* What: Stat Label Div Element. Why: The headline number needs its own caption beneath it. How: This renders the literal word "triggered". */ }


									</CarSurCom>



									<CarSurCom
										className={ cssModObj.staCarDiv }

										data-element-name-hook='conCycDiv'
									>{ /* What: Card Surface Component. Why: Every headline number shares the same card chrome. How: This wraps the "cycles" total. Its data-element-name-hook is read by help mode's Stats catalog. */ }


										<div className={ cssModObj.staNumDiv }>{ conTotObj.totNum }</div>{ /* What: Stat Number Div Element. Why: The headline card needs its own large number. How: This renders conTotObj.totNum. */ }

										<div className={ cssModObj.staLabDiv }>cycles</div>{ /* What: Stat Label Div Element. Why: The headline number needs its own caption beneath it. How: This renders the literal word "cycles". */ }


									</CarSurCom>



									<CarSurCom
										className={ cssModObj.staCarDiv }

										data-element-name-hook='conRatDiv'
									>{ /* What: Card Surface Component. Why: Every headline number shares the same card chrome. How: This wraps the "fire rate" percentage. Its data-element-name-hook is read by help mode's Stats catalog. */ }


										<div className={ cssModObj.staNumDiv }>{ conTotObj.ratNum }%</div>{ /* What: Stat Number Div Element. Why: The headline card needs its own large number. How: This renders conTotObj.ratNum as a percentage. */ }

										<div className={ cssModObj.staLabDiv }>fire rate</div>{ /* What: Stat Label Div Element. Why: The headline number needs its own caption beneath it. How: This renders the literal words "fire rate". */ }


									</CarSurCom>



									<CarSurCom
										className={ cssModObj.staCarDiv }

										data-element-name-hook='conLasDiv'
									>{ /* What: Card Surface Component. Why: Every headline number shares the same card chrome. How: This wraps the "last fired" date. Its data-element-name-hook is read by help mode's Stats catalog. */ }


										<div className={ cssModObj.staNumDiv }>{ conTotObj.lasStr ? conDayFun( conTotObj.lasStr ) : '—' }</div>{ /* What: Stat Number Div Element. Why: The headline card needs its own large value, or a placeholder glyph when nothing has ever fired. How: This formats conTotObj.lasStr, or renders the em-dash placeholder glyph when it's null. */ }

										<div className={ cssModObj.staLabDiv }>last fired</div>{ /* What: Stat Label Div Element. Why: The headline number needs its own caption beneath it. How: This renders the literal words "last fired". */ }


									</CarSurCom>


								</div>



								<CarSurCom
									data-element-name-hook='conBreDiv'
								>{ /* What: Card Surface Component. Why: The Conditionals breakdown list shares the same card chrome as every other breakdown card. How: This wraps the sort header, metric pill row, explanatory note, and the list itself. Its data-element-name-hook is read by help mode's Stats catalog. */ }


									<div className={ cssModObj.ranHeaDiv }>{ /* What: Rank Head Div Element. Why: The breakdown's own kicker and sort toggle sit together in one row. How: This wraps the kicker div and the sort button. */ }


										<div className={ cssModObj.pagKicDiv }>Conditionals breakdown</div>{ /* What: Kicker Div Element. Why: This card needs its own small labelled kicker. How: This renders the literal words "Conditionals breakdown". */ }

										<button
											className={ cssModObj.ranSorBut }

											type='button'

											onClick={ () => setConSorStr( ( preDirStr ) => ( preDirStr === 'desc' ? 'asc' : 'desc' ) ) }
										>{ /* What: Sort Toggle Button Element. Why: The user needs a way to flip the breakdown list's own sort direction. How: This flips conSorStr between 'desc' and 'asc' when clicked. */ }


											{ conSorStr === 'desc' ? 'High → Low' : 'Low → High' }{ /* What: Sort Label Expression. Why: The button names the current direction. How: This reads High to Low or Low to High from conSorStr. */ }

											<IcoSvgCom
												icoNamStr={ conSorStr === 'desc' ? 'ardEle' : 'aruEle' }
												sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
											/>{ /* What: Icon Svg Component. Why: The sort button needs a small directional glyph matching its own current direction. How: This renders the arrow_down/arrow_up icon based on conSorStr. */ }


										</button>


									</div>

									<div
										ref={ conRowRef }

										className={ cssModObj.breMetDiv }

										data-rail-wheel-scroll
									>{ /* What: Metric Pill Row Div Element. Why: The user needs a way to pivot the breakdown list across five different metrics. How: This renders one pill per entry in the inline metric-label list below. */ }


										{ [ [ 'rate', 'Fire Rate' ], [ 'triggers', 'Triggers' ], [ 'cycles', 'Cycles' ], [ 'interval', 'Interval' ], [ 'last', 'Last Fired' ] ].map( ( [ conKeyStr, conLabStr ] ) => ( // What: Metric Pill Render. Why: Every one of the five available metrics needs its own selectable pill. How: This maps the inline [key, label] pair list to one button per metric.


											<button
												key={ conKeyStr }

												className={ cssModObj.breMetBut }

												data-pill-select-active={ conMetStr === conKeyStr || undefined } // What: Pill Select Active Attribute. Why: The showing metric should stand out. How: This is present only on the showing metric's pill.

												type='button'

												onClick={ () => setConMetStr( conKeyStr ) }
											>{ /* What: Metric Pill Button Element. Why: The user needs a way to switch the breakdown list over to this specific metric. How: This sets conMetStr to this pill's own key when clicked. */ }


												{ conLabStr }{ /* What: Metric Label Expression. Why: The pill shows its own metric name. How: This renders conLabStr. */ }


											</button>


										))}


									</div>

									<p className={ cssModObj.ranNotPar }>{ /* What: Rank Note Paragraph Element. Why: The active metric needs a short explanation of what it actually measures. How: This renders one of five explanatory sentences, chosen by conMetStr. */ }


										{ conMetStr === 'rate' // What: Conditional Note Expression. Why: The note paragraph's own text depends on the active metric. How: This picks one of five explanations by conMetStr, testing for the rate pill first.
											? `How often each conditional fired versus the cycles it was actually evaluated over ${ ranNouStr }. A cycle only counts once a dependent item or the replacement card is completed.` // What: Rate Note Branch. Why: Fire rate needs its denominator explained. How: This explains cycles and when one counts.
											: conMetStr === 'triggers'                                                               // What: Triggers Note Check. Why: The triggers pill has its own explanation. How: This tests for it next.
											? `Number of cycles each conditional fired (suppressed its picker) over ${ ranNouStr }.` // What: Triggers Note Branch. Why: A trigger needs defining. How: This explains that firing suppresses the picker.
											: conMetStr === 'cycles'                                                                 // What: Cycles Note Check. Why: The cycles pill has its own explanation. How: This tests for it next.
											? `Number of completed cycles each conditional was evaluated over ${ ranNouStr }.`       // What: Cycles Note Branch. Why: A cycle needs defining. How: This explains evaluated cycles.
											: conMetStr === 'interval'                                                               // What: Interval Note Check. Why: The interval pill has its own explanation. How: This tests for it next.
											? 'Average number of days between subsequent triggers.'                                  // What: Interval Note Branch. Why: The interval needs its unit explained. How: This explains the average day gap.
											: 'When each conditional last fired.'                                                    // What: Last Note Branch. Why: The last-fired pill is the only one left. How: This explains the date column.
										}


									</p>


									{ conBreArr.length ? ( // What: Conditional List Visibility Check. Why: An empty breakdown needs its own message instead of a bare empty list. How: This renders the real list only while conBreArr has at least one row.


										<ul
											key={ conMetStr + conSorStr }

											className={` ${ cssModObj.ranLisUno }   ${ cssModObj.ranLisUnoBreakdown }   ${ cssModObj.ranLisUnoFade }   ${ ( conMetStr === 'interval' || conMetStr === 'last' ) ? cssModObj.ranLisUnoFreq : '' } `}
										>{ /* What: Conditional List Element. Why: This is the actual rendered breakdown list, remounting (and replaying its own fade) whenever the metric or sort changes. How: This maps conBreArr to one list item per conditional. */ }


											{ conBreArr.map( ( conRowObj ) => { // What: Conditional Row Render. Why: Every conditional in the breakdown needs its own list item showing its name, mode-intrinsic target, and the active metric's own value. How: This computes that row's own target suffix, then returns the list item.


												const sooDayNum = Math.max( 1, Math.round( THR_VAL_NUM / ( conRowObj.maxNum || 1 ) ) ); // What: Soonest Day Number. Why: The fastest a full drift cycle can complete is governed by the larger (max) drift value. How: This divides the fixed threshold by easeMax, floored at 1 day.
												const latDayNum = Math.max( 1, Math.round( THR_VAL_NUM / ( conRowObj.minNum || 1 ) ) ); // What: Latest Day Number. Why: The slowest a full drift cycle can complete is governed by the smaller (min) drift value. How: This divides the fixed threshold by easeMin, floored at 1 day.


												const conTarStr = conRowObj.delBoo // What: Conditional Target String. Why: Every non-deleted conditional's own configured target is worth surfacing alongside its measured rate. How: This branches on the conditional's own mode to phrase either a percentage or a day-band string. // Mode-intrinsic "target" (what you configured), shown as a suffix under the name like the Pickers breakdown does. Probability modes show a trigger %; ease modes show an interval band.
													? null                                     // What: Deleted Branch. Why: A deleted conditional has no configured target left. How: This returns null so no suffix renders.
													: conRowObj.modStr === 'random'            // What: Random Check. Why: A random conditional always fires half the time. How: This tests for the random mode next.
													? 'set 50%'                                // What: Random Branch. Why: Random odds are fixed. How: This returns the fixed 50% label.
													: conRowObj.modStr === 'weighted'          // What: Weighted Check. Why: A weighted conditional has its own set odds. How: This tests for the weighted mode next.
													? `set ${ conRowObj.oddNum }%`             // What: Weighted Branch. Why: Weighted odds stay where they were set. How: This shows the configured odds.
													: conRowObj.modStr === 'dynamic'           // What: Dynamic Check. Why: A dynamic conditional starts from its own set odds. How: This tests for the dynamic mode next.
													? `from ${ conRowObj.oddNum }%`            // What: Dynamic Branch. Why: Dynamic odds drift from where they were set. How: This shows the starting odds.
													: `target ${ sooDayNum }–${ latDayNum }d`; // What: Ease Target Branch. Why: An ease-mode conditional has no single percentage, so its target is a day band. How: This joins the soonest and latest day counts.



												return (


													<li
														key={ conRowObj.ideStr }

														className={ cssModObj.ranIteIte }

														data-row-deleted-active={ conRowObj.delBoo || undefined } // What: Row Deleted Active Attribute. Why: A deleted conditional's history remains but reads as historical. How: This is present only while conRowObj.delBoo is true.
													>{ /* What: Conditional List Item Element. Why: Every conditional needs its own row grouping its name/target on one side and its metric value on the other. How: This renders the ranNamSpa block and the conValSpa block as two siblings. */ }


														<span className={ cssModObj.ranNamSpa }>{ /* What: Rank Name Span Element. Why: The conditional's own name, deleted tag, and target suffix are grouped together. How: This wraps the name row and the optional target meta span. */ }


															<span className={ cssModObj.namRowSpa }>{ /* What: Rank Name Row Span Element. Why: The name text and an optional "deleted" tag sit side by side. How: This wraps the name text span and the conditional deleted tag. */ }


																<span className={ cssModObj.namTexSpa }>{ conRowObj.namStr }</span>{ /* What: Rank Name Text Span Element. Why: The row needs its own visible conditional name. How: This renders conRowObj.namStr. */ }

																{ conRowObj.delBoo && <span className={` ${ cssModObj.ranTagSpa }   ${ cssModObj.ranTagSpaDeleted } `}>deleted</span> }{ /* What: Deleted Tag Check. Why: A since-deleted conditional's own row must be visibly flagged. How: This renders a small "deleted" tag only while conRowObj.delBoo is true. */ }


															</span>

															{ conTarStr && <span className={ cssModObj.ranMetSpa }>{ conTarStr }</span> }{ /* What: Target Meta Check. Why: A deleted conditional has no configured target left to show. How: This renders the computed conTarStr under the name only while it's non-null. */ }


														</span>

														<span className={ cssModObj.conValSpa }>{ /* What: Conditional Values Span Element. Why: The row's own inactive tag and metric-specific value sit together on the opposite side from the name. How: This wraps the inactive tag, the mode tag, and whichever metric-specific value block matches conMetStr. */ }


															{ !conRowObj.delBoo && conRowObj.actBoo === false && <span className={ cssModObj.ranTagSpa }>inactive</span> }{ /* What: Inactive Tag Check. Why: A live but currently-disabled conditional needs its own visible flag. How: This renders a small "inactive" tag only for a non-deleted conditional whose own active field is false. */ }

															<span className={ cssModObj.logTypSpa }>{ ( conRowObj.modStr || '' ).replace( '-', '‑' ) }</span>{ /* What: Mode Tag Span Element. Why: Every row needs its own small mode label. How: This renders the conditional's own mode, with a non-breaking hyphen swapped in for a literal hyphen. */ }

															{ conMetStr === 'rate' && ( // What: Rate Value Check. Why: The rate-specific percentage/fraction display only belongs on this one metric. How: This renders it only while conMetStr is 'rate'.


																<span className={ cssModObj.ranValSpa }>{ /* What: Rank Values Span Element. Why: The rate metric shows both a percentage and a raw fraction together. How: This wraps the percent span and the fraction span. */ }


																	<span className={ cssModObj.ranPerSpa }>{ conRowObj.ratNum == null ? '—' : conRowObj.ratNum + '%' }</span>{ /* What: Rank Percent Span Element. Why: The rate metric's own headline value is a percentage, or a placeholder glyph when there's no rate at all. How: This renders conRowObj.ratNum as a percentage, or the em-dash placeholder when it's null. */ }

																	<span className={ cssModObj.ranFraSpa }>{ conRowObj.firNum } / { conRowObj.totNum }</span>{ /* What: Rank Fraction Span Element. Why: The rate metric's own supporting detail is the raw fired/total fraction. How: This renders conRowObj.firNum and conRowObj.totNum joined by a slash. */ }


																</span>


															) }

															{ conMetStr === 'triggers' && <span className={ cssModObj.metNumSpa }>{ conRowObj.firNum }</span> }{ /* What: Triggers Value Check. Why: The triggers metric shows a single raw count. How: This renders conRowObj.firNum only while conMetStr is 'triggers'. */ }

															{ conMetStr === 'cycles' && <span className={ cssModObj.metNumSpa }>{ conRowObj.totNum }</span> }{ /* What: Cycles Value Check. Why: The cycles metric shows a single raw count. How: This renders conRowObj.totNum only while conMetStr is 'cycles'. */ }

															{ conMetStr === 'interval' && ( conRowObj.intNum != null ? ( // What: Interval Value Check. Why: The interval metric's own value/placeholder display only belongs on this one metric. How: This renders it only while conMetStr is 'interval'.


																<span className={` ${ cssModObj.freValSpa }   ${ cssModObj.freValSpaInterval } `}>every { conRowObj.intNum } { conRowObj.intNum === 1 ? 'day' : 'days' }</span> // What: Interval Span Element. Why: A conditional that fired at least twice has a real average gap. How: This renders "every N days", pluralized.


															) : ( // What: No Interval Branch. Why: Fewer than two fires means no gap to average. How: This renders the else branch, taken while intNum is null.


																<span
																	className={` ${ cssModObj.freValSpa }   ${ cssModObj.freValSpaInterval } `}

																	data-value-dim-active
																>{ conRowObj.firNum === 1 ? 'Fired Once' : 'Not Fired' }</span> // What: Interval Placeholder Span Element. Why: The row still needs a dimmed placeholder. How: This says whether it fired once or never, since an interval needs two fires.


															) ) }

															{ conMetStr === 'last' && ( conRowObj.lasStr ? ( // What: Last Value Check. Why: The last-fired metric's own value/placeholder display only belongs on this one metric. How: This renders it only while conMetStr is 'last'.


																<span className={` ${ cssModObj.freValSpa }   ${ cssModObj.freValSpaFired } `}>{ conDayFun( conRowObj.lasStr ) }</span> // What: Last Fired Span Element. Why: A conditional that fired has a real last date. How: This renders lasStr via conDayFun.


															) : ( // What: Never Fired Branch. Why: A conditional that never fired has no date. How: This renders the else branch, taken while lasStr is null.


																<span
																	className={` ${ cssModObj.freValSpa }   ${ cssModObj.freValSpaFired } `}

																	data-value-dim-active
																>Never</span> // What: Never Span Element. Why: The row still needs a dimmed placeholder. How: This renders the fixed word "Never".


															) ) }


														</span>


													</li>


												);


											})}


										</ul>


									) : ( // What: Empty State Branch. Why: With nothing to list, the card needs its own message instead. How: This renders the else branch.


										<div className={ cssModObj.staEmpDiv }>No conditional activity in { ranNouStr } yet.</div> // What: Conditional Empty State Div Element. Why: An empty breakdown needs to explain why the list is missing instead of showing nothing at all. How: This renders only while conBreArr is empty.


									) }


								</CarSurCom>


							</React.Fragment>


						);


					})() }



					{ !isaConBoo && ( // What: Headline Row Visibility Check. Why: The Conditionals scope has its own dedicated headline row above, so this generic one only belongs on every other scope. How: This renders it only while isaConBoo is false.


						<div className={ cssModObj.staRowDiv }>{ /* What: Headline Row Div Element. Why: Every non-Conditionals scope shows 4 headline cards in one row. How: This renders either the Reminders-shaped set or the pick-shaped set, based on isaRemBoo. */ }


							{ isaRemBoo ? ( // What: Reminders Headline Check. Why: The Reminders scope's own headline cards are shaped differently from a pick-based scope's. How: This renders the Reminders-shaped set while isaRemBoo is true, the pick-shaped set otherwise.


								<React.Fragment>{ /* What: Reminders Headline Fragment Element. Why: The 4 Reminders-shaped headline cards need grouping without an extra DOM wrapper. How: This wraps those 4 CarSurCom elements. */ }


									<CarSurCom
										className={ cssModObj.staCarDiv }

										data-element-name-hook='remDonDiv'
									>{ /* What: Card Surface Component. Why: Every headline number shares the same card chrome. How: This wraps the "completed" total. Its data-element-name-hook is read by help mode's Stats catalog. */ }


										<div className={ cssModObj.staNumDiv }>{ totDonNum }</div>{ /* What: Stat Number Div Element. Why: The headline card needs its own large number. How: This renders totDonNum. */ }

										<div className={ cssModObj.staLabDiv }>completed</div>{ /* What: Stat Label Div Element. Why: The headline number needs its own caption beneath it. How: This renders the literal word "completed". */ }


									</CarSurCom>



									<CarSurCom
										className={ cssModObj.staCarDiv }

										data-element-name-hook='remWeeDiv'
									>{ /* What: Card Surface Component. Why: Every headline number shares the same card chrome. How: This wraps the "this week" total. Its data-element-name-hook is read by help mode's Stats catalog. */ }


										<div className={ cssModObj.staNumDiv }>{ remWeeNum }</div>{ /* What: Stat Number Div Element. Why: The headline card needs its own large number. How: This renders remWeeNum. */ }

										<div className={ cssModObj.staLabDiv }>this week</div>{ /* What: Stat Label Div Element. Why: The headline number needs its own caption beneath it. How: This renders the literal words "this week". */ }


									</CarSurCom>



									<CarSurCom
										className={ cssModObj.staCarDiv }

										data-element-name-hook='remActDiv'
									>{ /* What: Card Surface Component. Why: Every headline number shares the same card chrome. How: This wraps the "active days" total. Its data-element-name-hook is read by help mode's Stats catalog. */ }


										<div className={ cssModObj.staNumDiv }>{ actDayNum }</div>{ /* What: Stat Number Div Element. Why: The headline card needs its own large number. How: This renders actDayNum. */ }

										<div className={ cssModObj.staLabDiv }>active days</div>{ /* What: Stat Label Div Element. Why: The headline number needs its own caption beneath it. How: This renders the literal words "active days". */ }


									</CarSurCom>



									<CarSurCom
										className={ cssModObj.staCarDiv }

										data-element-name-hook='remBusDiv'
									>{ /* What: Card Surface Component. Why: Every headline number shares the same card chrome. How: This wraps the "busiest day" total. Its data-element-name-hook is read by help mode's Stats catalog. */ }


										<div className={ cssModObj.staNumDiv }>{ busDayNum }</div>{ /* What: Stat Number Div Element. Why: The headline card needs its own large number. How: This renders busDayNum. */ }

										<div className={ cssModObj.staLabDiv }>busiest day</div>{ /* What: Stat Label Div Element. Why: The headline number needs its own caption beneath it. How: This renders the literal words "busiest day". */ }


									</CarSurCom>


								</React.Fragment>


							) : ( // What: Pick Headline Branch. Why: Every non-Reminders scope needs the pick-shaped headline cards instead. How: This renders the else branch, taken while isaRemBoo is false.


								<React.Fragment>{ /* What: Pick Headline Fragment Element. Why: The 4 pick-shaped headline cards need grouping without an extra DOM wrapper. How: This wraps those 4 CarSurCom elements. */ }


									<CarSurCom
										className={ cssModObj.staCarDiv }

										data-element-name-hook='staStrDiv'
										data-picker-scope-active={ isaPicBoo || undefined } // What: Picker Scope Active Attribute. Why: Help mode tells the single-picker version of this card apart from the all-pickers version without reading the card's own classes. How: This is present only while isaPicBoo is true, since undefined drops the attribute entirely.
									>{ /* What: Card Surface Component. Why: Every headline number shares the same card chrome. How: This wraps the "day streak" total, tagged with data-picker-scope-active so help mode can tell the two scopes apart. Its data-element-name-hook is read by help mode's Stats catalog. */ }


										<div className={ cssModObj.staNumDiv }>{ stkDayNum }</div>{ /* What: Stat Number Div Element. Why: The headline card needs its own large number. How: This renders stkDayNum. */ }

										<div className={ cssModObj.staLabDiv }>day streak</div>{ /* What: Stat Label Div Element. Why: The headline number needs its own caption beneath it. How: This renders the literal words "day streak". */ }



										<IcoSvgCom
											className={ cssModObj.staIcoSvg }

											icoNamStr='flaEle'
											sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
										/>{ /* What: Icon Svg Component. Why: The streak card needs a small flame glyph reinforcing its own meaning. How: This renders the 'flaEle' icon at a fixed size. */ }


									</CarSurCom>



									<CarSurCom
										className={ cssModObj.staCarDiv }

										data-element-name-hook='staFulDiv'
										data-picker-scope-active={ isaPicBoo || undefined } // What: Picker Scope Active Attribute. Why: Help mode tells the single-picker version of this card apart from the all-pickers version without reading the card's own classes. How: This is present only while isaPicBoo is true, since undefined drops the attribute entirely.
									>{ /* What: Card Surface Component. Why: Every headline number shares the same card chrome. How: This wraps the "full days" total, tagged with data-picker-scope-active so help mode can tell the two scopes apart. Its data-element-name-hook is read by help mode's Stats catalog. */ }


										<div className={ cssModObj.staNumDiv }>{ fulDayNum }</div>{ /* What: Stat Number Div Element. Why: The headline card needs its own large number. How: This renders fulDayNum. */ }

										<div className={ cssModObj.staLabDiv }>full days &middot; { actDayNum }</div>{ /* What: Stat Label Div Element. Why: The headline number needs its own caption beneath it, plus its own denominator for context. How: This renders the literal words "full days" followed by actDayNum. */ }


									</CarSurCom>



									<CarSurCom
										className={ cssModObj.staCarDiv }

										data-element-name-hook='staDonDiv'
										data-picker-scope-active={ isaPicBoo || undefined } // What: Picker Scope Active Attribute. Why: Help mode tells the single-picker version of this card apart from the all-pickers version without reading the card's own classes. How: This is present only while isaPicBoo is true, since undefined drops the attribute entirely.
									>{ /* What: Card Surface Component. Why: Every headline number shares the same card chrome. How: This wraps the "items done" total, tagged with data-picker-scope-active so help mode can tell the two scopes apart. Its data-element-name-hook is read by help mode's Stats catalog. */ }


										<div className={ cssModObj.staNumDiv }>{ totDonNum }</div>{ /* What: Stat Number Div Element. Why: The headline card needs its own large number. How: This renders totDonNum. */ }

										<div className={ cssModObj.staLabDiv }>items done</div>{ /* What: Stat Label Div Element. Why: The headline number needs its own caption beneath it. How: This renders the literal words "items done". */ }


									</CarSurCom>



									<CarSurCom
										className={ cssModObj.staCarDiv }

										data-element-name-hook='staRatDiv'
										data-picker-scope-active={ isaPicBoo || undefined } // What: Picker Scope Active Attribute. Why: Help mode tells the single-picker version of this card apart from the all-pickers version without reading the card's own classes. How: This is present only while isaPicBoo is true, since undefined drops the attribute entirely.
									>{ /* What: Card Surface Component. Why: Every headline number shares the same card chrome. How: This wraps the "completion" percentage, tagged with data-picker-scope-active so help mode can tell the two scopes apart. Its data-element-name-hook is read by help mode's Stats catalog. */ }


										<div className={ cssModObj.staNumDiv }>{ comRatNum }%</div>{ /* What: Stat Number Div Element. Why: The headline card needs its own large number. How: This renders comRatNum as a percentage. */ }

										<div className={ cssModObj.staLabDiv }>completion</div>{ /* What: Stat Label Div Element. Why: The headline number needs its own caption beneath it. How: This renders the literal word "completion". */ }


									</CarSurCom>


								</React.Fragment>


							) }


						</div>


					) }



					{ !isaConBoo && ( // What: Heatmap Visibility Check. Why: The Conditionals scope has no day-by-day heatmap of its own to show. How: This renders the whole heatmap card only while isaConBoo is false.


						<CarSurCom
							data-element-name-hook='heaMapDiv'
						>{ /* What: Card Surface Component. Why: The heatmap shares the same card chrome as every other stat card. How: This wraps the heat header, the optional year pager, and either the grid+detail or an empty state. Its data-element-name-hook is read by the Stats page tour and help mode's Stats catalog. */ }


							<div className={ cssModObj.hetHeaDiv }>{ /* What: Heat Header Div Element. Why: The heatmap's own kicker and legend sit together in one row. How: This wraps the kicker div and the HeaLegCom legend. */ }


								<div className={ cssModObj.pagKicDiv }>{ ranKicStr }{ isaRemBoo ? ' · reminders' : '' }</div>{ /* What: Kicker Div Element. Why: The heatmap needs its own label naming the active range, plus a Reminders qualifier when that scope is active. How: This renders ranKicStr, appending " · reminders" only while isaRemBoo is true. */ }



								<HeaLegCom />{ /* What: Heat Legend Component. Why: The heatmap needs its own "less...more" scale legend beside its kicker. How: This renders the shared 5-swatch legend row. */ }


							</div>

							{ yeaPagBoo && ( () => { // What: Year Pager Visibility Check. Why: The year-pager arrows only belong on an "All time" view spanning more than one calendar year. How: This IIFE computes the active year's own index and a small navigation helper once, then returns the pager row.


								const yeaIndNum = datYeaArr.indexOf( actYeaNum! ); // What: Year Index Number. Why: Both arrows need to know the active year's own position in datYeaArr to disable themselves at either end. How: This looks actYeaNum up in datYeaArr. // What: Non-Null Note. Why: The pager only renders while yeaPagBoo holds, and actYeaNum is a real year whenever it does. How: The ! tells TypeScript actYeaNum is set here.


								const jumYeaFun = ( yeaCurNum : number, sliDirStr : string ) => { // What: Jump Year Function. Why: Paging to a different year needs to set the slide direction, the target year, and clear any tapped-cell selection together. How: This updates all three pieces of state in one call.


									setHeaDirStr( sliDirStr ); // What: Slide Direction Set. Why: The grid slides in from the matching side. How: This writes sliDirStr into heaDirStr.
									setHeaYeaNum( yeaCurNum ); // What: Paged Year Set. Why: This is the actual year change. How: This writes yeaCurNum into heaYeaNum.
									setHeaSelStr( null );      // What: Selection Clear. Why: A tapped day from another year no longer applies. How: This resets heaSelStr to null.


								};



								return (


									<div className={ cssModObj.yeaNavDiv }>{ /* What: Heat Year Navigation Div Element. Why: The previous-arrow, active-year label, and next-arrow sit together in one row. How: This wraps those three elements. */ }


										<button
											className={ cssModObj.yeaArrBut }

											disabled={ yeaIndNum <= 0 }
											type='button'

											aria-label='Previous year'

											onClick={ () => jumYeaFun( datYeaArr[ yeaIndNum - 1 ], 'prev' ) }
										>&lsaquo;</button>{ /* What: Previous Year Arrow Button Element. Why: The user needs a way to page back one calendar year. How: This is disabled on the earliest year and otherwise pages to the previous entry in datYeaArr. */ }

										<span className={ cssModObj.hetYeaSpa }>{ actYeaNum }</span>{ /* What: Heat Year Span Element. Why: The pager needs its own visible label naming the active year. How: This renders actYeaNum. */ }

										<button
											className={ cssModObj.yeaArrBut }

											disabled={ yeaIndNum >= datYeaArr.length - 1 }
											type='button'

											aria-label='Next year'

											onClick={ () => jumYeaFun( datYeaArr[ yeaIndNum + 1 ], 'next' ) }
										>&rsaquo;</button>{ /* What: Next Year Arrow Button Element. Why: The user needs a way to page forward one calendar year. How: This is disabled on the latest year and otherwise pages to the next entry in datYeaArr. */ }


									</div>


								);


							})() }



							{ actDayNum === 0 ? ( // What: Empty Heatmap Check. Why: A heatmap with zero active days needs its own explanatory message instead of an all-empty grid. How: This renders that message only while actDayNum is zero, otherwise the real grid and detail panel below.


								<div className={ cssModObj.staEmpDiv }>{ /* What: Heatmap Empty Div Element. Why: An empty heatmap needs to explain why there's no grid. How: This renders a scope-specific empty message. */ }


									{ isaRemBoo // What: Heatmap Empty Expression. Why: The message names what's missing for the active scope. How: This picks the reminders or picks wording by isaRemBoo.
										? `No reminders completed in ${ ranNouStr } yet.`                                            // What: Reminders Empty Branch. Why: The Reminders scope counts completions. How: This names reminders and the active range.
										: `No picks logged in ${ ranNouStr }${ scoValStr !== 'all' ? ' for this picker' : '' } yet.` // What: Picks Empty Branch. Why: A pick scope counts logged picks. How: This names picks and the range, noting a single picker when scoped.
									}


								</div>


							) : ( // What: Heatmap Grid Branch. Why: With at least one active day, the real grid and its tap-detail panel need to render instead of the empty message. How: This renders the else branch, taken while actDayNum is above zero.


								<React.Fragment>{ /* What: Heatmap Grid Fragment Element. Why: The grid itself and its own tap-detail panel need grouping without an extra DOM wrapper. How: This wraps those two sibling blocks. */ }


									<div
										key={ actYeaNum == null ? 'single' : actYeaNum }

										className={` ${ cssModObj.hetGriDiv }   ${ heaDirStr === 'next' ? cssModObj.hetGriDivNext : '' }   ${ heaDirStr === 'prev' ? cssModObj.hetGriDivPrev : '' } `}
									>{ /* What: Heat Grid Div Element. Why: This is the actual grid of day cells, remounting (and replaying its own slide-in) whenever the active paged year changes. How: This maps heaDayArr to one cell button per day. */ }


										{ heaDayArr.map( ( dayCurObj ) => { // What: Heat Cell Render. Why: Every day in the window needs its own colored, tappable cell. How: This computes that day's own heat level and tooltip text, then returns the cell button.


											let levValNum; // What: Level Value Number. Why: The cell's own heat level is computed differently for a Reminders day (raw volume) than a pick day (a ratio). How: This is assigned in exactly one of the two branches below.


											if ( isaRemBoo ) levValNum = couLevFun( dayCurObj.donNum ); // What: Reminders Level Branch. Why: A reminder day has no "possible" denominator, so its level is a raw volume scale. How: This calls the shared couLevFun helper on dayCurObj.donNum.

											else { // What: Pick Level Branch. Why: A pick day's own level is a ratio of done to total, not a raw count. How: This computes that ratio, then buckets it into one of 5 levels.


												const ratValNum = dayCurObj.donNum / Math.max( 1, dayCurObj.totNum ); // What: Ratio Value Number. Why: The bucketing below needs a plain 0-1 fraction to compare against thresholds. How: This divides dayCurObj.donNum by dayCurObj.totNum, floored at 1 to avoid a divide-by-zero.

												levValNum = dayCurObj.totNum === 0 ? 0 : ratValNum >= 1 ? 4 : ratValNum >= 0.66 ? 3 : ratValNum >= 0.33 ? 2 : ratValNum > 0 ? 1 : 0; // What: Ratio Bucket Assignment. Why: The 5 heat levels correspond to specific completion-ratio bands. How: This buckets ratValNum into one of those 5 thresholds, with a zero-total day always at level 0.


											}



											const hedTexStr = isaRemBoo // What: Head Text String. Why: The tooltip's own first line differs in shape between a Reminders day and a pick day. How: This phrases either a "done" count or a "done/total" fraction.
												? `${ dayCurObj.datStr } · ${ dayCurObj.donNum } done`                   // What: Reminders Head Branch. Why: A reminder day has no separate total. How: This shows the done count.
												: `${ dayCurObj.datStr } · ${ dayCurObj.donNum }/${ dayCurObj.totNum }`; // What: Picks Head Branch. Why: A pick day has a real total. How: This shows done over total.


											const namTexArr = ( dayCurObj.iteArr || [] ).map( ( iteCurObj ) => ( // What: Name Text Array. Why: The tooltip's own body needs one bullet line per logged item that day. How: This maps each item to a "- name" line, appending a checkmark for a completed pick. // Native (desktop) tooltip lists what was picked/completed that day.


													isaRemBoo ? `• ${ iteCurObj.namStr }` : `• ${ iteCurObj.namStr }${ iteCurObj.donBoo ? ' ✓' : '' }` // What: Bullet Line Text. Why: Each logged item gets one tooltip line. How: This prefixes a bullet and, for a completed pick, appends a check.


												) );


											const titTexStr = namTexArr.length ? `${ hedTexStr }\n${ namTexArr.join( '\n' ) }` : hedTexStr; // What: Title Text String. Why: The cell's own native tooltip needs the head line plus every bullet line joined together, or just the head line when nothing was logged. How: This joins hedTexStr and namTexArr with newlines, or falls back to hedTexStr alone.
											const selDayBoo = heaSelStr === dayCurObj.datStr;                                               // What: Selected Day Boolean. Why: A tapped cell needs its own distinct styling. How: This compares heaSelStr against this cell's own date.



											return (


												<button
													key={ dayCurObj.datStr }

													className={` ${ cssModObj.hetCelBut }   ${ HEA_LEV_ARR[ levValNum ] } `}

													data-cell-select-active={ selDayBoo || undefined } // What: Cell Select Active Attribute. Why: The tapped day should stand out. How: This is present only on the selected day's cell.

													type='button'

													aria-label={ titTexStr }
													title={ titTexStr }

													onClick={ () => setHeaSelStr( selDayBoo ? null : dayCurObj.datStr ) }
												/> // What: Heat Cell Button Element. Why: Each day needs its own tappable, color-coded cell. How: This toggles heaSelStr to this cell's own date (or clears it, if already selected) on click.


											);


										})}


									</div>



									{ ( () => { // What: Heat Detail Render. Why: A tapped cell's own detail list is either shown or a plain hint is shown instead, depending on whether anything is currently selected. How: This looks up the selected day's own aggregate entry, then returns either the hint or the detail panel.


										const selDayObj = heaSelStr && heaDayArr.find( ( dayCurObj ) => dayCurObj.datStr === heaSelStr ); // What: Selected Day Object. Why: The detail panel below needs the actual aggregate entry for whichever day is selected, not just its date string. How: This finds the matching entry in heaDayArr, or stays falsy when nothing is selected.


										if ( !selDayObj ) return <p className={ cssModObj.tapHinPar }>Tap a day to see what was picked.</p>; // What: No Selection Guard. Why: With nothing tapped yet, a plain hint replaces the detail panel entirely. How: This returns the hint paragraph and skips the rest of this IIFE.



										const selDatObj = new Date( selDayObj.datStr + 'T00:00:00' );                                                         // What: Selected Date Object. Why: The detail panel's own header needs a real Date to format a label from. How: This parses selDayObj.datStr at local midnight.
										const selLabStr = selDatObj.toLocaleDateString( undefined, { day : 'numeric', month : 'short', weekday : 'short' } ); // What: Selected Label String. Why: The detail panel's own header needs a short, readable date label. How: This formats selDatObj as "weekday, month day".



										return (


											<div className={ cssModObj.hetDetDiv }>{ /* What: Heat Detail Div Element. Why: The tapped day's own header and item list are grouped together. How: This wraps the detail header and either the item list or an empty message. */ }


												<div className={ cssModObj.detHeaDiv }>{ /* What: Heat Detail Header Div Element. Why: The selected day's own label and done-count sit together in one row. How: This wraps the date span and the count span. */ }


													<span className={ cssModObj.detDatSpa }>{ selLabStr }</span>{ /* What: Heat Detail Date Span Element. Why: The panel needs its own visible date label. How: This renders selLabStr. */ }

													<span className={ cssModObj.detCouSpa }>{ isaRemBoo ? `${ selDayObj.donNum } done` : `${ selDayObj.donNum }/${ selDayObj.totNum } done` }</span>{ /* What: Heat Detail Count Span Element. Why: The panel needs its own visible completion count for the day. How: This phrases either a plain "done" count or a "done/total" fraction, depending on scope. */ }


												</div>


												{ ( selDayObj.iteArr || [] ).length ? ( // What: Item List Visibility Check. Why: A day with an aggregate entry but no logged items at all still needs an explanatory message instead of an empty list. How: This renders the real list only while selDayObj.iteArr has at least one entry.


													<ul className={ cssModObj.detLisUno }>{ /* What: Heat Detail List Element. Why: This is the actual list of what was logged on the selected day. How: This maps selDayObj.iteArr to one list item per entry. */ }


														{ selDayObj.iteArr.map( ( iteCurObj, iteIndNum ) => ( // What: Heat Detail Item Render. Why: Every logged item on the selected day needs its own row. How: This maps each item to a list item, keyed by its own position since items have no stable id here.


															<li
																key={ iteIndNum }

																className={ cssModObj.detIteIte }

																data-row-done-active={ iteCurObj.donBoo || undefined } // What: Row Done Active Attribute. Why: A done item and its check read darker. How: This is present only while iteCurObj.donBoo is true.
															>{ /* What: Heat Detail Item Element. Why: Each item needs its own name and (for a pick day) a done/not-done mark. How: This renders the name span and, only outside the Reminders scope, the mark span. */ }


																<span className={ cssModObj.detNamSpa }>{ iteCurObj.namStr }</span>{ /* What: Heat Detail Name Span Element. Why: The row needs its own visible item name. How: This renders iteCurObj.namStr. */ }

																{ !isaRemBoo && <span className={ cssModObj.detMarSpa }>{ iteCurObj.donBoo ? '✓' : '—' }</span> }{ /* What: Heat Detail Mark Check. Why: A Reminders day has no separate done/not-done state to mark, since every logged row there is already a completion. How: This renders a check or em-dash mark only outside the Reminders scope. */ }


															</li>


														))}


													</ul>


												) : ( // What: No Items Branch. Why: A day with an entry but no logged items still needs a message. How: This renders the else branch, taken while selDayObj.iteArr is empty.


													<p className={ cssModObj.detEmpPar }>Nothing { isaRemBoo ? 'completed' : 'picked' } this day.</p> // What: Heat Detail Empty Paragraph Element. Why: This is the actual empty-day message. How: This says nothing was completed or picked, by scope.


												) }


											</div>


										);


									})() }


								</React.Fragment>


							) }


						</CarSurCom>


					) }



					{ scoValStr === 'all' && hasConBoo && ( // What: Conditionals Summary Visibility Check. Why: This compact summary only belongs on the combined All view, and only while at least one conditional exists. How: This renders it only while both conditions hold.


						<CarSurCom
							className={ cssModObj.conSumDiv }

							data-element-name-hook='conSumDiv'
						>{ /* What: Card Surface Component. Why: The Conditionals summary shares the same card chrome as every other stat card. How: This wraps the summary header and either the summary list or an empty state. Its data-element-name-hook is read by help mode's Stats catalog. */ }


							<div className={ cssModObj.remHeaDiv }>{ /* What: Reminder Stats Header Div Element. Why: The summary's own kicker and headline numbers sit together in one row, sharing this class with the Reminders summary below for consistent layout. How: This wraps the kicker div and the two inline stat spans. */ }


								<div className={ cssModObj.pagKicDiv }>Conditionals</div>{ /* What: Kicker Div Element. Why: This card needs its own small labelled kicker. How: This renders the literal word "Conditionals". */ }

								<div className={ cssModObj.remNumDiv }>{ /* What: Reminder Stats Numbers Div Element. Why: The two inline headline stats sit side by side. How: This wraps the two remStaSpa spans. */ }


									<span className={ cssModObj.remStaSpa }><strong className={ cssModObj.staNumStr }>{ conTotObj.firNum }</strong>&nbsp;triggered</span>{ /* What: Rem Stat Span Element. Why: The summary needs one inline "N triggered" readout. How: This renders conTotObj.firNum in bold, followed by the word "triggered". */ }

									<span className={ cssModObj.remStaSpa }><strong className={ cssModObj.staNumStr }>{ conTotObj.ratNum }%</strong>&nbsp;fire rate</span>{ /* What: Rem Stat Span Element. Why: The summary needs one inline "N% fire rate" readout. How: This renders conTotObj.ratNum in bold as a percentage, followed by "fire rate". */ }


								</div>


							</div>


							{ conStaArr.length ? ( // What: Conditional Summary List Check. Why: An empty summary needs its own message instead of a bare empty list. How: This renders the real list only while conStaArr has at least one row.


								<ul className={ cssModObj.sumLisUno }>{ /* What: Conditional Summary List Element. Why: This is the actual summary list, capped to the first 8 conditionals. How: This maps the first 8 entries of conStaArr to one list item per conditional. */ }


									{ conStaArr.slice( 0, 8 ).map( ( conRowObj ) => ( // What: Conditional Summary Row Render. Why: Every summarized conditional needs its own compact row showing its name, tags, mode, and fraction/rate. How: This maps up to 8 conStaArr entries to one list item per conditional.


										<li
											key={ conRowObj.ideStr }

											className={ cssModObj.sumIteIte }
										>{ /* What: Conditional Summary Item Element. Why: Each conditional needs its own row grouping its name/tags on one side and its mode/fraction/rate on the other. How: This renders the name span and the meta span as two siblings. */ }


											<span className={ cssModObj.sumNamSpa }>{ /* What: Conditional Summary Name Span Element. Why: The conditional's own name and any deleted/inactive tags are grouped together. How: This wraps the plain name text and its two conditional tag checks. */ }


												{ conRowObj.namStr }{ /* What: Conditional Name Expression. Why: The summary row shows the conditional's own name. How: This renders conRowObj.namStr. */ }

												{ conRowObj.delBoo && <span className={` ${ cssModObj.ranTagSpa }   ${ cssModObj.ranTagSpaDeleted } `}>deleted</span> }{ /* What: Deleted Tag Check. Why: A since-deleted conditional's own row must be visibly flagged. How: This renders a small "deleted" tag only while conRowObj.delBoo is true. */ }

												{ !conRowObj.delBoo && conRowObj.actBoo === false && <span className={ cssModObj.ranTagSpa }>inactive</span> }{ /* What: Inactive Tag Check. Why: A live but currently-disabled conditional needs its own visible flag. How: This renders a small "inactive" tag only for a non-deleted conditional whose own active field is false. */ }


											</span>

											<span className={ cssModObj.sumMetSpa }>{ /* What: Conditional Summary Meta Span Element. Why: The conditional's own mode, fraction, and rate are grouped on the opposite side from the name. How: This wraps those three spans. */ }


												<span className={ cssModObj.logTypSpa }>{ ( conRowObj.modStr || '' ).replace( '-', '‑' ) }</span>{ /* What: Mode Tag Span Element. Why: Every row needs its own small mode label. How: This renders the conditional's own mode, with a non-breaking hyphen swapped in for a literal hyphen. */ }

												<span className={ cssModObj.sumFraSpa }>{ conRowObj.firNum } / { conRowObj.totNum }</span>{ /* What: Conditional Summary Fraction Span Element. Why: The summary needs its own raw fired/total fraction. How: This renders conRowObj.firNum and conRowObj.totNum joined by a slash. */ }

												<span className={ cssModObj.sumRatSpa }>{ conRowObj.ratNum == null ? '—' : conRowObj.ratNum + '%' }</span>{ /* What: Conditional Summary Rate Span Element. Why: The summary needs its own rate percentage, or a placeholder glyph when there's no rate at all. How: This renders conRowObj.ratNum as a percentage, or the em-dash placeholder when it's null. */ }


											</span>


										</li>


									))}


								</ul>


							) : ( // What: Empty State Branch. Why: With nothing to list, the card needs its own message instead. How: This renders the else branch.


								<div className={ cssModObj.logEmpDiv }>No conditional activity in { ranNouStr } yet.</div> // What: Conditional Summary Empty State Div Element. Why: An empty summary needs to explain why the list is missing instead of showing nothing at all. How: This renders only while conStaArr is empty.


							) }


						</CarSurCom>


					) }



					{ isaRemBoo && ( // What: Reminders Extras Visibility Check. Why: The type-split bar and the Reminders breakdown card only belong while the Reminders scope is active. How: This renders both together only while isaRemBoo is true.


						<React.Fragment>{ /* What: Reminders Extras Fragment Element. Why: These two blocks need grouping without an extra DOM wrapper. How: This wraps the BreBarCom type-split card and the Reminders breakdown CarSurCom. */ }


							<BreBarCom
								data-element-name-hook='remTypDiv'

								empMesStr={ `No reminders completed in ${ ranNouStr } yet.` }
								kicTexStr='By reminder type'
								segDatArr={ typSegArr }
								totCouNum={ totDonNum }
							/>{ /* What: Breakdown Bar Component. Why: The Reminders scope needs the same stacked-bar treatment as the pick-source split, but for the one-time/recurring type split instead. How: This is fed typSegArr and totDonNum as its own segments/total. Its data-element-name-hook is read by help mode's Stats catalog. */ }



							<CarSurCom
								data-element-name-hook='remBreDiv'
							>{ /* What: Card Surface Component. Why: The Reminders breakdown list shares the same card chrome as every other breakdown card. How: This wraps the sort header, metric pill row, explanatory note, and the paged list itself. Its data-element-name-hook is read by help mode's Stats catalog. */ }


								<div className={ cssModObj.ranHeaDiv }>{ /* What: Rank Head Div Element. Why: The breakdown's own kicker and sort toggle sit together in one row. How: This wraps the kicker div and the sort button. */ }


									<div className={ cssModObj.pagKicDiv }>Reminders breakdown</div>{ /* What: Kicker Div Element. Why: This card needs its own small labelled kicker. How: This renders the literal words "Reminders breakdown". */ }

									<button
										className={ cssModObj.ranSorBut }

										type='button'

										onClick={ () => setRemSorStr( ( preDirStr ) => ( preDirStr === 'desc' ? 'asc' : 'desc' ) ) }
									>{ /* What: Sort Toggle Button Element. Why: The user needs a way to flip the breakdown list's own sort direction. How: This flips remSorStr between 'desc' and 'asc' when clicked. */ }


										{ remMetStr === 'recent' // What: Reminder Sort Label Expression. Why: The sort button's own label reads differently for dated events versus counts. How: This picks date wording for Recent and count wording otherwise.
											? ( remSorStr === 'desc' ? 'Newest → Oldest' : 'Oldest → Newest' ) // What: Date Label Branch. Why: Recent lists dated events. How: This phrases the direction as newest/oldest.
											: ( remSorStr === 'desc' ? 'High → Low' : 'Low → High' )           // What: Count Label Branch. Why: Completions and Skipped list counts. How: This phrases the direction as high/low.
										}

										<IcoSvgCom
											icoNamStr={ remSorStr === 'desc' ? 'ardEle' : 'aruEle' }
											sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
										/>{ /* What: Icon Svg Component. Why: The sort button needs a small directional glyph matching its own current direction. How: This renders the arrow_down/arrow_up icon based on remSorStr. */ }


									</button>


								</div>

								<div
									ref={ remRowRef }

									className={ cssModObj.breMetDiv }

									data-rail-wheel-scroll
								>{ /* What: Metric Pill Row Div Element. Why: The user needs a way to pivot the breakdown list across three different metrics. How: This renders one pill per entry in the inline metric-label list below. */ }


									{ [ [ 'recent', 'Recent' ], [ 'completions', 'Completions' ], [ 'skipped', 'Skipped' ] ].map( ( [ remKeyStr, remLabStr ] ) => ( // What: Metric Pill Render. Why: Every one of the three available metrics needs its own selectable pill. How: This maps the inline [key, label] pair list to one button per metric.


										<button
											key={ remKeyStr }

											className={ cssModObj.breMetBut }

											data-pill-select-active={ remMetStr === remKeyStr || undefined } // What: Pill Select Active Attribute. Why: The showing metric should stand out. How: This is present only on the showing metric's pill.

											type='button'

											onClick={ () => setRemMetStr( remKeyStr ) }
										>{ /* What: Metric Pill Button Element. Why: The user needs a way to switch the breakdown list over to this specific metric. How: This sets remMetStr to this pill's own key when clicked. */ }


											{ remLabStr }{ /* What: Metric Label Expression. Why: The pill shows its own metric name. How: This renders remLabStr. */ }


										</button>


									))}


								</div>

								<p className={ cssModObj.ranNotPar }>{ /* What: Rank Note Paragraph Element. Why: The active metric needs a short explanation of what it actually shows. How: This renders one of three explanatory sentences, chosen by remMetStr. */ }


									{ remMetStr === 'recent' // What: Reminder Note Expression. Why: The note paragraph's own text depends on the active metric. How: This picks one of three explanations by remMetStr, testing for Recent first.
										? 'Every Reminder that has been completed. Once you check one off on the Today page, it will show up here.'        // What: Recent Note Branch. Why: Recent lists every completion. How: This explains where rows come from.
										: remMetStr === 'completions'                                                                                      // What: Completions Note Check. Why: Completions has its own explanation. How: This tests for it next.
										? 'Total count for the number of times that a Reminders item was completed on the Today page.'                     // What: Completions Note Branch. Why: Completions are per-reminder totals. How: This explains the count.
										: 'Total count for the number of times that a Reminders item was skipped using the skip button on the Today page.' // What: Skipped Note Branch. Why: Skipped is the only pill left. How: This explains the skip count.
									}


								</p>



								{ remBreArr.length ? ( // What: Reminder List Visibility Check. Why: An empty breakdown needs its own message instead of a bare empty list plus a pointless pager. How: This renders the real list and pager only while remBreArr has at least one row.


									<React.Fragment>{ /* What: Reminder List Fragment Element. Why: The list itself and its own pager need grouping without an extra DOM wrapper. How: This wraps the ul and the PagNavCom pager. */ }


										<ul
											key={ remMetStr + remSorStr + remSafNum }

											className={` ${ cssModObj.remLogUno }   ${ cssModObj.remLogUnoFade } `}
										>{ /* What: Reminder List Element. Why: This is the actual rendered breakdown list, remounting (and replaying its own fade) whenever the metric, sort, or page changes. How: This maps remIteArr to one list item per reminder row. */ }


											{ remIteArr.map( ( remRowObj, rowIndNum ) => ( // What: Reminder Row Render. Why: Every row on the current page needs its own list item showing its name, type tag, and either a relative date or a raw count. How: This maps remIteArr to one list item, keyed by its own ideStr when in Recent mode (each row is a distinct event) or by its own index otherwise (each row is a distinct reminder).


												<li
													key={ remMetStr === 'recent' ? remRowObj.ideStr : rowIndNum }

													className={ cssModObj.logIteIte }
												>{ /* What: Reminder List Item Element. Why: Each row needs its own name on one side and its own meta (type + date/count) on the other. How: This renders the name span and the meta span as two siblings. */ }


													<span className={ cssModObj.logNamSpa }>{ remRowObj.namStr }</span>{ /* What: Rem Log Name Span Element. Why: The row needs its own visible reminder name. How: This renders remRowObj.namStr. */ }

													<span className={ cssModObj.logMetSpa }>{ /* What: Rem Log Meta Span Element. Why: The row's own type tag and date/count value are grouped on the opposite side from the name. How: This wraps the type span and either a relative-date span or a raw-count span. */ }


														<span className={` ${ cssModObj.logTypSpa }   ${ remRowObj.typStr === 'recurring' ? cssModObj.logTypSpaRecurring : '' } `}>{ remRowObj.typStr === 'once' ? 'one-time' : 'recurring' }</span>{ /* What: Rem Log Type Span Element. Why: Every row needs its own small type label. How: This renders "one-time" or "recurring" based on remRowObj.typStr. */ }

														{ remMetStr === 'recent' ? ( // What: Recent Value Check. Why: Recent rows are dated events, while the other pills show counts. How: This renders a relative date while remMetStr is 'recent', otherwise the count.


															<span className={ cssModObj.logWheSpa }>{ relWheFun( remRowObj.timStr ) }</span> // What: Rem Log When Span Element. Why: A recent event shows when it happened. How: This formats timStr via relWheFun.


														) : ( // What: Count Value Branch. Why: Completions and Skipped rows show a total. How: This renders the else branch, taken for every non-Recent pill.


															<span className={ cssModObj.metNumSpa }>{ remRowObj.couNum }</span> // What: Rank Metric Number Span Element. Why: A grouped row shows its own total. How: This renders couNum.


														) }


													</span>


												</li>


											))}


										</ul>



										<PagNavCom
											alwShoBoo
											curPagNum={ remSafNum }
											pagSizNum={ REM_SIZ_NUM }
											totIteNum={ remBreArr.length }
											uniWorStr={ remMetStr === 'skipped' ? 'skipped' : 'completed' }

											onChange={ setRemIndNum }
										/>{ /* What: Pager Navigation Component. Why: A breakdown list longer than one page needs its own pager to move through it. How: This is fed the current safe page/size/total, always showing itself via alwShoBoo since this card's own list is often long. */ }


									</React.Fragment>


								) : ( // What: Reminder Empty Branch. Why: An empty breakdown needs its own explanatory message instead of the list and pager. How: This renders the else branch, taken while remBreArr has no rows.


									<div className={ cssModObj.logEmpDiv }>{ /* What: Rem Log Empty Div Element. Why: An empty breakdown needs to explain why the list is missing, phrased differently for the Skipped metric than the others. How: This renders one of two explanatory messages based on remMetStr. */ }


										{ remMetStr === 'skipped' // What: Reminder Empty Expression. Why: The empty message names what's missing for the active metric. How: This picks skip or completion wording by remMetStr.
											? `No skips in ${ ranNouStr }. Skip one on Today and it lands here.`            // What: No Skips Branch. Why: The Skipped pill counts skips. How: This explains how skips appear.
											: `No completions in ${ ranNouStr }. Check one off on Today and it lands here.` // What: No Completions Branch. Why: Every other pill counts completions. How: This explains how completions appear.
										}


									</div>


								) }


							</CarSurCom>


						</React.Fragment>


					) }



					{ shoRemBoo && ( // What: Reminders Summary Visibility Check. Why: This compact summary only belongs on the combined All view, and only while reminders are enabled at all. How: This renders it only while shoRemBoo is true.


						<CarSurCom
							data-element-name-hook='remSumDiv'
						>{ /* What: Card Surface Component. Why: The Reminders summary shares the same card chrome as every other stat card. How: This wraps the summary header and either the summary list or an empty state. Its data-element-name-hook is read by help mode's Stats catalog. */ }


							<div className={ cssModObj.remHeaDiv }>{ /* What: Reminder Stats Header Div Element. Why: The summary's own kicker and headline numbers sit together in one row. How: This wraps the kicker div and the two inline stat spans. */ }


								<div className={ cssModObj.pagKicDiv }>Reminders completed</div>{ /* What: Kicker Div Element. Why: This card needs its own small labelled kicker. How: This renders the literal words "Reminders completed". */ }

								<div className={ cssModObj.remNumDiv }>{ /* What: Reminder Stats Numbers Div Element. Why: The two inline headline stats sit side by side. How: This wraps the two remStaSpa spans. */ }


									<span className={ cssModObj.remStaSpa }><strong className={ cssModObj.staNumStr }>{ remRowArr.length }</strong>&nbsp;{ ranValStr === 'all' ? 'all time' : 'in range' }</span>{ /* What: Rem Stat Span Element. Why: The summary needs one inline total readout, phrased for the active range. How: This renders remRowArr.length in bold, followed by "all time" or "in range". */ }

									<span className={ cssModObj.remStaSpa }><strong className={ cssModObj.staNumStr }>{ remWeeNum }</strong>&nbsp;this week</span>{ /* What: Rem Stat Span Element. Why: The summary needs one inline "N this week" readout. How: This renders remWeeNum in bold, followed by "this week". */ }


								</div>


							</div>


							{ remLogArr.length ? ( // What: Reminder Summary List Check. Why: An empty summary needs its own message instead of a bare empty list. How: This renders the real list only while remLogArr has at least one row.


								<ul className={ cssModObj.remLogUno }>{ /* What: Reminder Summary List Element. Why: This is the actual summary list, capped to the first 8 completions. How: This maps the first 8 entries of remLogArr to one list item per completion. */ }


									{ remLogArr.slice( 0, 8 ).map( ( remRowObj ) => ( // What: Reminder Summary Row Render. Why: Every summarized completion needs its own compact row showing its name, type, and relative date. How: This maps up to 8 remLogArr entries to one list item per row.


										<li
											key={ remRowObj.rowId }

											className={ cssModObj.logIteIte }
										>{ /* What: Reminder Summary Item Element. Why: Each completion needs its own name on one side and its own type/date on the other. How: This renders the name span and the meta span as two siblings. */ }


											<span className={ cssModObj.logNamSpa }>{ remRowObj.name }</span>{ /* What: Rem Log Name Span Element. Why: The row needs its own visible reminder name. How: This renders remRowObj.name. */ }

											<span className={ cssModObj.logMetSpa }>{ /* What: Rem Log Meta Span Element. Why: The row's own type tag and relative date are grouped on the opposite side from the name. How: This wraps the type span and the relative-date span. */ }


												<span className={` ${ cssModObj.logTypSpa }   ${ remRowObj.type === 'recurring' ? cssModObj.logTypSpaRecurring : '' } `}>{ remRowObj.type === 'once' ? 'one-time' : 'recurring' }</span>{ /* What: Rem Log Type Span Element. Why: Every row needs its own small type label. How: This renders "one-time" or "recurring" based on remRowObj.type. */ }

												<span className={ cssModObj.logWheSpa }>{ relWheFun( remRowObj.completedAt ) }</span>{ /* What: Rem Log When Span Element. Why: Every row needs its own relative completion date. How: This renders relWheFun applied to remRowObj.completedAt. */ }


											</span>


										</li>


									))}


								</ul>


							) : ( // What: Rem Stats Empty Branch. Why: An empty summary needs its own fixed message instead of the real list. How: This renders the else branch, taken while remLogArr is empty.


								<div className={ cssModObj.logEmpDiv }>No completions in { ranNouStr }. Check one off on Today and it lands here.</div> // What: Rem Log Empty Div Element. Why: An empty summary needs to explain why the list is missing. How: This renders a fixed message naming the active range.


							) }


						</CarSurCom>


					) }



					{ !isaRemBoo && !isaConBoo && ( // What: Source Split Visibility Check. Why: The pick-source breakdown only makes sense while a pick-shaped scope (All or a single picker) is active. How: This renders it only while neither the Reminders nor Conditionals sentinel is active. // Source split (picks); the All view shows it last, and a single-picker scope shows it too.


						<BreBarCom
							data-element-name-hook='souBreDiv'

							empMesStr={ `Nothing picked in ${ ranNouStr } yet.` }
							kicTexStr='How picks were chosen'
							segDatArr={ souSegArr }
							totCouNum={ totPosNum }
						/> // What: Breakdown Bar Component. Why: The All and single-picker scopes need a stacked bar showing how picks came to be (auto, re-rolled, or hand picked). How: This is fed souSegArr's own per-source counts against totPosNum. Its data-element-name-hook is read by help mode's Stats catalog.


					) }



					{ scoValStr === 'all' && ( // What: Rankings Visibility Check. Why: The Most Picked/Coldest cards only make sense on the combined All view, not a single-picker scope. How: This renders both cards only while scoValStr is 'all'.


						<div className={` ${ cssModObj.staRowDiv }   ${ cssModObj.staRowDivTwo } `}>{ /* What: Rankings Row Div Element. Why: The two ranking cards sit side by side in their own row. How: This wraps the Most Picked and Coldest items Cards. */ }


							<CarSurCom
								data-element-name-hook='mosPicDiv'
							>{ /* What: Card Surface Component. Why: The Most Picked ranking shares the same card chrome as every other stat card. How: This wraps the kicker and either the ranked list or an empty state. Its data-element-name-hook is read by help mode's Stats catalog. */ }


								<div className={ cssModObj.pagKicDiv }>Most picked</div>{ /* What: Kicker Div Element. Why: This card needs its own small labelled kicker. How: This renders the literal words "Most picked". */ }


								{ topPicArr.length ? ( // What: Top List Visibility Check. Why: An empty ranking needs its own message instead of a bare empty list. How: This renders the real list only while topPicArr has at least one entry.


									<ul className={ cssModObj.ranLisUno }>{ /* What: Top Ranking List Element. Why: This is the actual top-5 most-picked list. How: This maps topPicArr to one list item per item. */ }


										{ topPicArr.map( ( iteCurObj, iteIndNum ) => ( // What: Top Ranking Row Render. Why: Every one of the top 5 items needs its own row showing its name and count. How: This maps topPicArr to one list item, keyed by its own position since these are plain aggregate values with no stable id here.


											<li
												key={ iteIndNum }

												className={ cssModObj.ranIteIte }
											>{ /* What: Top Ranking Item Element. Why: Each item needs its own name on one side and its own count on the other. How: This renders a plain name span and the count span. */ }


												<span>{ iteCurObj.namStr }</span>{ /* What: Item Name Span Element. Why: The row needs its own visible item name. How: This renders iteCurObj.namStr. */ }

												<span className={ cssModObj.ranNumSpa }>{ iteCurObj.couNum }</span>{ /* What: Rank Number Span Element. Why: The row needs its own visible pick count. How: This renders iteCurObj.couNum. */ }


											</li>


										))}


									</ul>


								) : ( // What: Empty State Branch. Why: With nothing to list, the card needs its own message instead. How: This renders the else branch.


									<div className={ cssModObj.staEmpDiv }>Nothing picked in { ranNouStr } yet.</div> // What: Top Ranking Empty State Div Element. Why: An empty ranking needs to explain why the list is missing instead of showing nothing at all. How: This renders only while topPicArr is empty.


								) }


							</CarSurCom>



							<CarSurCom
								data-element-name-hook='colIteDiv'
							>{ /* What: Card Surface Component. Why: The Coldest items ranking shares the same card chrome as every other stat card. How: This wraps the kicker and either the ranked list or an empty state. Its data-element-name-hook is read by help mode's Stats catalog. */ }


								<div className={ cssModObj.pagKicDiv }>Coldest items</div>{ /* What: Kicker Div Element. Why: This card needs its own small labelled kicker. How: This renders the literal words "Coldest items". */ }


								{ colIteArr.length ? ( // What: Cold List Visibility Check. Why: An empty ranking needs its own message instead of a bare empty list. How: This renders the real list only while colIteArr has at least one entry.


									<ul className={` ${ cssModObj.ranLisUno }   ${ cssModObj.ranLisUnoCold } `}>{ /* What: Cold Ranking List Element. Why: This is the actual bottom-5 least-picked list. How: This maps colIteArr to one list item per item. */ }


										{ colIteArr.map( ( iteCurObj, iteIndNum ) => ( // What: Cold Ranking Row Render. Why: Every one of the bottom 5 items needs its own row showing its name and count. How: This maps colIteArr to one list item, keyed by its own position since these are plain aggregate values with no stable id here.


											<li
												key={ iteIndNum }

												className={ cssModObj.ranIteIte }
											>{ /* What: Cold Ranking Item Element. Why: Each item needs its own name on one side and its own count on the other. How: This renders a plain name span and the count span. */ }


												<span>{ iteCurObj.namStr }</span>{ /* What: Item Name Span Element. Why: The row needs its own visible item name. How: This renders iteCurObj.namStr. */ }

												<span className={ cssModObj.ranNumSpa }>{ iteCurObj.couNum }</span>{ /* What: Rank Number Span Element. Why: The row needs its own visible pick count. How: This renders iteCurObj.couNum. */ }


											</li>


										))}


									</ul>


								) : ( // What: Empty State Branch. Why: With nothing to list, the card needs its own message instead. How: This renders the else branch.


									<div className={ cssModObj.staEmpDiv }>No items in this scope.</div> // What: Cold Ranking Empty State Div Element. Why: An empty ranking needs to explain why the list is missing instead of showing nothing at all. How: This renders only while colIteArr is empty.


								) }


							</CarSurCom>


						</div>


					) }



					{ isaPicBoo && ( // What: Pick Breakdown Visibility Check. Why: This entire card only belongs while a single real picker is the active scope. How: This renders it only while isaPicBoo is true.


						<CarSurCom
							data-element-name-hook='breCarDiv'
						>{ /* What: Card Surface Component. Why: The Pick breakdown shares the same card chrome as every other breakdown card. How: This wraps the sort header, metric pill row, the active metric's own note, and the sorted list itself. Its data-element-name-hook is read by the Stats page tour and help mode's Stats catalog. */ }


							<div className={ cssModObj.ranHeaDiv }>{ /* What: Rank Head Div Element. Why: The breakdown's own kicker and sort toggle sit together in one row. How: This wraps the kicker div and the sort button. */ }


								<div className={ cssModObj.pagKicDiv }>Pick breakdown</div>{ /* What: Kicker Div Element. Why: This card needs its own small labelled kicker. How: This renders the literal words "Pick breakdown". */ }

								<button
									className={ cssModObj.ranSorBut }

									type='button'

									onClick={ () => setSorDirStr( ( preDirStr ) => ( preDirStr === 'desc' ? 'asc' : 'desc' ) ) }
								>{ /* What: Sort Toggle Button Element. Why: The user needs a way to flip the breakdown list's own sort direction. How: This flips sorDirStr between 'desc' and 'asc' when clicked. */ }


									{ sorDirStr === 'desc' ? 'High → Low' : 'Low → High' }{ /* What: Sort Label Expression. Why: The button names the current direction. How: This reads High to Low or Low to High from sorDirStr. */ }

									<IcoSvgCom
										icoNamStr={ sorDirStr === 'desc' ? 'ardEle' : 'aruEle' }
										sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
									/>{ /* What: Icon Svg Component. Why: The sort button needs a small directional glyph matching its own current direction. How: This renders the arrow_down/arrow_up icon based on sorDirStr. */ }


								</button>


							</div>

							<div
								ref={ metRowRef }

								className={ cssModObj.breMetDiv }

								data-rail-wheel-scroll

								aria-label='Breakdown metric'
								role='tablist'
							>{ /* What: Metric Pill Row Div Element. Why: The user needs a way to pivot the breakdown list across every metric this picker's own mode supports. How: This renders one pill per entry in metPilArr. */ }


								{ metPilArr.map( ( metCurObj ) => ( // What: Metric Pill Render. Why: Every available metric needs its own selectable pill. How: This maps metPilArr to one button per metric.


									<button
										key={ metCurObj.keyStr }

										className={ cssModObj.breMetBut }

										data-pill-select-active={ effMetStr === metCurObj.keyStr || undefined } // What: Pill Select Active Attribute. Why: The showing metric should stand out. How: This is present only on the showing metric's pill.

										type='button'

										aria-selected={ effMetStr === metCurObj.keyStr }
										role='tab'

										onClick={ () => setMetKeyStr( metCurObj.keyStr ) }
									>{ /* What: Metric Pill Button Element. Why: The user needs a way to switch the breakdown list over to this specific metric. How: This sets metKeyStr to this pill's own key when clicked. */ }


										{ metCurObj.labStr }{ /* What: Metric Label Expression. Why: The pill shows its own metric name. How: This renders the pill's own labStr. */ }


									</button>


								))}


							</div>

							{ effMetStr === 'count' && ( // What: Count Note Visibility Check. Why: The Count metric's own explanation, including its inline total/eligible toggle, only belongs while it's the active metric. How: This renders it only while effMetStr is 'count'.


								<p className={ cssModObj.ranNotPar }>{ /* What: Count Note Paragraph Element. Why: The Count metric needs its own explanation, including its denominator toggle. How: This wraps the text and the total/eligible toggle buttons. */ }


									Total count for the number of times that a { scoPicObj.name } item was picked (rejections and skips are not included), counted in{ ' ' }

									<button
										className={ cssModObj.notLinBut }

										data-link-select-active={ couModStr === 'total' || undefined } // What: Link Select Active Attribute. Why: The showing unit should stand out. How: This is present only on the showing unit's link.

										type='button'

										onClick={ () => setCouModStr( 'total' ) }
									>total picks</button>{ /* What: Total Toggle Button Element. Why: The user needs a way to switch the Count metric's own percentage denominator to the picker's whole total. How: This sets couModStr to 'total' when clicked. */ }

									{ ' ' }or only{ ' ' }
									<button
										className={ cssModObj.notLinBut }

										data-link-select-active={ couModStr === 'eligible' || undefined } // What: Link Select Active Attribute. Why: The showing unit should stand out. How: This is present only on the showing unit's link.

										type='button'

										onClick={ () => setCouModStr( 'eligible' ) }
									>eligible picks</button>{ /* What: Eligible Toggle Button Element. Why: The user needs a way to switch the Count metric's own percentage denominator to only picks made while each item was active. How: This sets couModStr to 'eligible' when clicked. */ }

									{ ' ' }when an item was active.


								</p>


							) }

							{ effMetStr === 'freq' && ( // What: Frequency Note Visibility Check. Why: The Frequency metric's own explanation, including its inline calendar/eligible toggle, only belongs while it's the active metric. How: This renders it only while effMetStr is 'freq'.


								<p className={ cssModObj.ranNotPar }>{ /* What: Frequency Note Paragraph Element. Why: The Frequency metric needs its own explanation, including its unit toggle. How: This wraps the text and the calendar/eligible toggle buttons. */ }


									Average number of days between subsequent picks, counted in total{ ' ' }

									<button
										className={ cssModObj.notLinBut }

										data-link-select-active={ freModStr === 'calendar' || undefined } // What: Link Select Active Attribute. Why: The showing unit should stand out. How: This is present only on the showing unit's link.

										type='button'

										onClick={ () => setFreModStr( 'calendar' ) }
									>{ calUniStr }</button>{ /* What: Calendar Toggle Button Element. Why: The user needs a way to switch the Frequency metric's own unit to literal calendar days/periods. How: This sets freModStr to 'calendar' when clicked. */ }

									{ ' ' }or only{ ' ' }
									<button
										className={ cssModObj.notLinBut }

										data-link-select-active={ freModStr === 'eligible' || undefined } // What: Link Select Active Attribute. Why: The showing unit should stand out. How: This is present only on the showing unit's link.

										type='button'

										onClick={ () => setFreModStr( 'eligible' ) }
									>eligible { eliUniStr }</button>{ /* What: Eligible Toggle Button Element. Why: The user needs a way to switch the Frequency metric's own unit to only the picker's own eligible run periods. How: This sets freModStr to 'eligible' when clicked. */ }

									{ ' ' }when the { scoPicObj.name } picker actually runs.


								</p>


							) }

							{ effMetStr === 'spent' && ( // What: Spent Note Visibility Check. Why: The Spent metric's own explanation, including its inline calendar/eligible toggle, only belongs while it's the active metric. How: This renders it only while effMetStr is 'spent'.


								<p className={ cssModObj.ranNotPar }>{ /* What: Spent Note Paragraph Element. Why: The Spent metric needs its own explanation, including its unit toggle. How: This wraps the text and the calendar/eligible toggle buttons. */ }


									Average number of days before an item&rsquo;s charge runs out, counted in total{ ' ' }

									<button
										className={ cssModObj.notLinBut }

										data-link-select-active={ speModStr === 'calendar' || undefined } // What: Link Select Active Attribute. Why: The showing unit should stand out. How: This is present only on the showing unit's link.

										type='button'

										onClick={ () => setSpeModStr( 'calendar' ) }
									>{ calUniStr }</button>{ /* What: Calendar Toggle Button Element. Why: The user needs a way to switch the Spent metric's own unit to literal calendar days/periods. How: This sets speModStr to 'calendar' when clicked. */ }

									{ ' ' }or only{ ' ' }
									<button
										className={ cssModObj.notLinBut }

										data-link-select-active={ speModStr === 'eligible' || undefined } // What: Link Select Active Attribute. Why: The showing unit should stand out. How: This is present only on the showing unit's link.

										type='button'

										onClick={ () => setSpeModStr( 'eligible' ) }
									>eligible { eliUniStr }</button>{ /* What: Eligible Toggle Button Element. Why: The user needs a way to switch the Spent metric's own unit to only the picker's own eligible run periods. How: This sets speModStr to 'eligible' when clicked. */ }

									{ ' ' }when the { scoPicObj.name } picker actually runs.


								</p>


							) }

							{ effMetStr === 'auto' && ( // What: Auto Note Visibility Check. Why: The Auto metric needs its own one-line explanation. How: This renders it only while effMetStr is 'auto'.


								<p className={ cssModObj.ranNotPar }>Total count for the number of times that a { scoPicObj.name } item was picked using the auto generator.</p> // What: Auto Note Paragraph Element. Why: This metric needs its own one-line explanation. How: This renders fixed copy naming the scoped picker.


							) }

							{ effMetStr === 'manual' && ( // What: Manual Note Visibility Check. Why: The Hand Picked metric needs its own one-line explanation. How: This renders it only while effMetStr is 'manual'.


								<p className={ cssModObj.ranNotPar }>Total count for the number of times that a { scoPicObj.name } item was picked manually using the Pick One button on the Pickers page.</p> // What: Manual Note Paragraph Element. Why: This metric needs its own one-line explanation. How: This renders fixed copy naming the scoped picker.


							) }

							{ effMetStr === 'rejected' && ( // What: Rejected Note Visibility Check. Why: The Re-Rolled Away metric needs its own one-line explanation. How: This renders it only while effMetStr is 'rejected'.


								<p className={ cssModObj.ranNotPar }>Total count for the number of times that a { scoPicObj.name } item was rejected using the re-roll button on the Today page.</p> // What: Rejected Note Paragraph Element. Why: This metric needs its own one-line explanation. How: This renders fixed copy naming the scoped picker.


							) }

							{ effMetStr === 'skipped' && ( // What: Skipped Note Visibility Check. Why: The Skipped metric needs its own one-line explanation. How: This renders it only while effMetStr is 'skipped'.


								<p className={ cssModObj.ranNotPar }>Total count for the number of times that a { scoPicObj.name } item was skipped using the skip button on the Today page.</p> // What: Skipped Note Paragraph Element. Why: This metric needs its own one-line explanation. How: This renders fixed copy naming the scoped picker.


							) }

							{ effMetStr === 'last' && ( // What: Last Picked Note Visibility Check. Why: The Last Picked metric's own explanation, including its inline calendar/eligible toggle, only belongs while it's the active metric. How: This renders it only while effMetStr is 'last'.


								<p className={ cssModObj.ranNotPar }>{ /* What: Last Picked Note Paragraph Element. Why: The Last Picked metric needs its own explanation, including its unit toggle. How: This wraps the text and the calendar/eligible toggle buttons. */ }


									Days since each item was last picked, counted in total{ ' ' }

									<button
										className={ cssModObj.notLinBut }

										data-link-select-active={ lasModStr === 'calendar' || undefined } // What: Link Select Active Attribute. Why: The showing unit should stand out. How: This is present only on the showing unit's link.

										type='button'

										onClick={ () => setLasModStr( 'calendar' ) }
									>{ calUniStr }</button>{ /* What: Calendar Toggle Button Element. Why: The user needs a way to switch the Last Picked metric's own unit to literal calendar days/periods. How: This sets lasModStr to 'calendar' when clicked. */ }

									{ ' ' }or only{ ' ' }
									<button
										className={ cssModObj.notLinBut }

										data-link-select-active={ lasModStr === 'eligible' || undefined } // What: Link Select Active Attribute. Why: The showing unit should stand out. How: This is present only on the showing unit's link.

										type='button'

										onClick={ () => setLasModStr( 'eligible' ) }
									>eligible { eliUniStr }</button>{ /* What: Eligible Toggle Button Element. Why: The user needs a way to switch the Last Picked metric's own unit to only the picker's own eligible run periods. How: This sets lasModStr to 'eligible' when clicked. */ }

									{ ' ' }when the { scoPicObj.name } picker actually runs.


								</p>


							) }


							{ breLisArr.length ? ( // What: Breakdown List Visibility Check. Why: An empty picker needs its own message instead of a bare empty list. How: This renders the real list only while breLisArr has at least one row.


								<ul
									key={ effMetStr + sorDirStr }

									className={` ${ cssModObj.ranLisUno }   ${ cssModObj.ranLisUnoBreakdown }   ${ cssModObj.ranLisUnoFade }   ${ ( effMetStr === 'freq' || effMetStr === 'last' ) ? cssModObj.ranLisUnoFreq : '' } `}
								>{ /* What: Breakdown List Element. Why: This is the actual rendered breakdown list, remounting (and replaying its own fade) whenever the metric or sort changes. How: This maps breLisArr to one list item per item. */ }


									{ breLisArr.map( ( iteCurObj ) => { // What: Breakdown Row Render. Why: Every item in the breakdown needs its own list item showing its name, suffix, tags, and the active metric's own value. How: This looks up the item's own suffix, then returns the list item.


										const sufValStr = actSufFun( iteObjMap.get( iteCurObj.ideStr ) );                                                             // What: Suffix Value String. Why: The row's own name-suffix depends on both the active metric and the item's own raw weight/ease fields, resolved via the shared suffix helper. How: This calls actSufFun with the raw item looked up from iteObjMap.
										const denValNum = couModStr === 'eligible' ? iteCurObj.denNum : totPosNum;                                                    // What: Denominator Value Number. Why: The Count percentage needs a single resolved denominator, chosen by couModStr. How: This picks iteCurObj.denNum in eligible mode, otherwise the picker's own totPosNum.
										const freDisObj = iteCurObj.gapNum != null ? cadDisFun( iteCurObj.gapNum, freModStr, gapForFun( iteCurObj.gapNum ) ) : null;  // What: Frequency Display Object. Why: The Frequency value column needs a cadence-aware number and unit word. How: This formats gapNum via cadDisFun, or stays null for a never-gapped item.
										const speDisObj = iteCurObj.speNum != null ? cadDisFun( iteCurObj.speNum, speModStr, Math.round( iteCurObj.speNum ) ) : null; // What: Spent Display Object. Why: The Spent value column needs a cadence-aware number and unit word. How: This formats speNum via cadDisFun, or stays null when no cycle completed.
										const notDelBoo = !iteCurObj.delBoo;                                                                                          // What: Not Deleted Boolean. Why: A deleted item's ghost row never shows the was-inactive tag. How: This negates the row's own delBoo flag.
										const metLasBoo = effMetStr === 'last';                                                                                       // What: Metric Last Boolean. Why: The was-inactive tag only belongs to the Last Picked metric. How: This compares effMetStr against 'last'.
										const notVacBoo = !iteCurObj.vacBoo;                                                                                          // What: Not Vacation Boolean. Why: A currently-inactive item already shows its own inactive tag instead. How: This negates the row's own vacBoo flag.
										const wasInaBoo = iteCurObj.wasBoo;                                                                                           // What: Was Inactive Boolean. Why: The tag only applies to an item that went inactive after its own last pick. How: This reads the row's own wasBoo flag.

										const wasTagBoo = notDelBoo && metLasBoo && notVacBoo && wasInaBoo; // What: Was Tag Boolean. Why: The was-inactive tag below renders only under this exact combination of conditions. How: This combines the four checks above.


										const metAutBoo = effMetStr === 'auto';     // What: Metric Auto Boolean. Why: The Auto metric shows a plain raw count. How: This compares effMetStr against 'auto'.
										const metManBoo = effMetStr === 'manual';   // What: Metric Manual Boolean. Why: The Hand Picked metric shows a plain raw count. How: This compares effMetStr against 'manual'.
										const metRejBoo = effMetStr === 'rejected'; // What: Metric Rejected Boolean. Why: The Re-Rolled Away metric shows a plain raw count. How: This compares effMetStr against 'rejected'.
										const metSkiBoo = effMetStr === 'skipped';  // What: Metric Skipped Boolean. Why: The Skipped metric shows a plain raw count. How: This compares effMetStr against 'skipped'.

										const metPlaBoo = metAutBoo || metManBoo || metRejBoo || metSkiBoo; // What: Metric Plain Boolean. Why: These four metrics all show the same plain raw-count shape, just reading a different field. How: This is true when effMetStr matches any one of them.



										return (


											<li
												key={ iteCurObj.ideStr }

												className={ cssModObj.ranIteIte }

												data-row-deleted-active={ iteCurObj.delBoo || undefined } // What: Row Deleted Active Attribute. Why: A deleted item's history remains but reads as historical. How: This is present only while iteCurObj.delBoo is true.
												data-row-vacation-active={ iteCurObj.vacBoo || undefined } // What: Row Vacation Active Attribute. Why: An inactive item reads muted. How: This is present only while iteCurObj.vacBoo is true.
											>{ /* What: Breakdown List Item Element. Why: Every item needs its own row grouping its name/tags/suffix on one side and its metric value on the other. How: This renders the ranNamSpa block and the breValSpa block as two siblings. */ }


												<span className={ cssModObj.ranNamSpa }>{ /* What: Rank Name Span Element. Why: The item's own name, deleted tag, and suffix are grouped together. How: This wraps the name row and the optional suffix meta span. */ }


													<span className={ cssModObj.namRowSpa }>{ /* What: Rank Name Row Span Element. Why: The name text and an optional "deleted" tag sit side by side. How: This wraps the name text span and the item deleted tag. */ }


														<span className={ cssModObj.namTexSpa }>{ iteCurObj.namStr }</span>{ /* What: Rank Name Text Span Element. Why: The row needs its own visible item name. How: This renders iteCurObj.namStr. */ }

														{ iteCurObj.delBoo && <span className={` ${ cssModObj.ranTagSpa }   ${ cssModObj.ranTagSpaDeleted } `}>deleted</span> }{ /* What: Deleted Tag Check. Why: A since-deleted item's own row must be visibly flagged. How: This renders a small "deleted" tag only while iteCurObj.delBoo is true. */ }


													</span>

													{ sufValStr && <span className={ cssModObj.ranMetSpa }>{ sufValStr }</span> }{ /* What: Suffix Meta Check. Why: Not every metric has a suffix to show under the name. How: This renders the resolved sufValStr under the name only while it's non-null. */ }


												</span>

												<span className={ cssModObj.breValSpa }>{ /* What: Rank Breakdown Values Span Element. Why: The row's own inactive/was-inactive tags and metric-specific value sit together on the opposite side from the name. How: This wraps those tags and whichever metric-specific value block matches effMetStr. */ }


													{ !iteCurObj.delBoo && iteCurObj.vacBoo && <span className={ cssModObj.ranTagSpa }>inactive</span> }{ /* What: Inactive Tag Check. Why: A live but currently-inactive item needs its own visible flag. How: This renders a small "inactive" tag only for a non-deleted item whose own vacation field is true. */ }

													{ wasTagBoo && ( // What: Was Inactive Tag Check. Why: The Last Picked metric specifically wants to flag an item that went inactive after its own last pick and hasn't been picked since returning. How: This renders a small "was inactive" tag only under that exact combination of conditions.


														<span className={` ${ cssModObj.ranTagSpa }   ${ cssModObj.ranTagSpaWas } `}>was inactive</span> // What: Was Inactive Tag Span Element. Why: This is the actual tag text. How: This renders the fixed words "was inactive".


													) }

													{ effMetStr === 'count' && ( // What: Count Value Check. Why: The Count metric's own percentage/fraction display only belongs on this one metric. How: This renders it only while effMetStr is 'count', against the denominator couModStr picks.


														<span className={ cssModObj.ranValSpa }>{ /* What: Rank Values Span Element. Why: The Count metric shows both a percentage and a raw fraction together. How: This wraps the percent span and the fraction span. */ }


															<span className={ cssModObj.ranPerSpa }>{ denValNum ? Math.round( ( iteCurObj.couNum / denValNum ) * 100 ) : 0 }%</span>{ /* What: Rank Percent Span Element. Why: The Count metric's own headline value is a percentage of the active denominator. How: This divides iteCurObj.couNum by denValNum, guarding against a zero denominator. */ }

															<span className={ cssModObj.ranFraSpa }>{ iteCurObj.couNum } / { denValNum }</span>{ /* What: Rank Fraction Span Element. Why: The Count metric's own supporting detail is the raw picks/denominator fraction. How: This renders iteCurObj.couNum and denValNum joined by a slash. */ }


														</span>


													) }

													{ effMetStr === 'freq' && ( freDisObj ? ( // What: Frequency Value Check. Why: The Frequency metric's own value/placeholder display only belongs on this one metric. How: This renders it only while effMetStr is 'freq'.


														<span className={` ${ cssModObj.freValSpa }   ${ cssModObj.freValSpaFreq } `}>every { freDisObj.numStr } { freDisObj.worStr }</span> // What: Frequency Span Element. Why: A gapped item shows its own average gap. How: This renders freDisObj's own number and unit word.


													) : ( // What: No Frequency Branch. Why: An item picked fewer than twice has no gap. How: This renders the else branch, taken while freDisObj is null.


														<span
															className={` ${ cssModObj.freValSpa }   ${ cssModObj.freValSpaFreq } `}

															data-value-dim-active
														>{ iteCurObj.freNum === 1 ? 'Picked Once' : 'Not Picked' }</span> // What: Frequency Placeholder Span Element. Why: The row still needs a dimmed placeholder. How: This says whether it was picked once or never.


													) ) }

													{ effMetStr === 'spent' && ( speDisObj ? ( // What: Spent Value Check. Why: The Spent metric's own value/placeholder display only belongs on this one metric. How: This renders it only while effMetStr is 'spent'.


														<span className={` ${ cssModObj.freValSpa }   ${ cssModObj.freValSpaFreq } `}>&asymp; { speDisObj.numStr } { speDisObj.worStr }</span> // What: Spent Span Element. Why: An item with a completed cycle shows its own average cycle length. How: This renders speDisObj's own number and unit word, marked approximate.


													) : ( // What: No Spent Branch. Why: An item with no completed cycle has nothing to average. How: This renders the else branch, taken while speDisObj is null.


														<span
															className={` ${ cssModObj.freValSpa }   ${ cssModObj.freValSpaFreq } `}

															data-value-dim-active
														>{ /* What: Spent Placeholder Span Element. Why: The row still needs a dimmed N/A placeholder with an explanation. How: This wraps the N/A text and its info tip. */ }


															N/A{ ' ' }

															<InfTipCom
																className={ cssModObj.pieHelSpa }

																labTexStr='No full cycle has been completed yet'
															>?</InfTipCom>{ /* What: Info Tip Component. Why: A N/A Spent value needs a small inline explanation of why there's no cycle to measure yet. How: This renders the shared "?" bubble with its own label text. */ }


														</span>


													) ) }

													{ effMetStr === 'last' && ( iteCurObj.lasNum != null ? ( // What: Last Picked Value Check. Why: The Last Picked metric's own value/placeholder display only belongs on this one metric. How: This renders it only while effMetStr is 'last'.


														<span className={` ${ cssModObj.freValSpa }   ${ cssModObj.freValSpaLast } `}>{ lasForFun( iteCurObj.lasNum, lasModStr ) }</span> // What: Last Picked Span Element. Why: A picked item shows how long ago it was last picked. How: This formats lasNum via lasForFun in the active unit.


													) : ( // What: Never Picked Branch. Why: A never-picked item has no last date. How: This renders the else branch, taken while lasNum is null.


														<span
															className={` ${ cssModObj.freValSpa }   ${ cssModObj.freValSpaLast } `}

															data-value-dim-active
														>Not Picked</span> // What: Never Picked Span Element. Why: The row still needs a dimmed placeholder. How: This renders the fixed words "Not Picked".


													) ) }

													{ metPlaBoo && ( // What: Plain Metric Value Check. Why: These four metrics all show the same plain raw-count shape, just reading a different field. How: This renders iteCurObj's own field named by effMetStr only while effMetStr matches one of these four.


														<span className={ cssModObj.metNumSpa }>{ iteCurObj[ MET_FIE_OBJ[ effMetStr ] ] }</span> // What: Metric Number Span Element. Why: These four metrics each show one raw count. How: This reads the row field MET_FIE_OBJ maps effMetStr to.


													) }


												</span>


											</li>


										);


									})}


								</ul>


							) : ( // What: Empty State Branch. Why: With nothing to list, the card needs its own message instead. How: This renders the else branch.


								<div className={ cssModObj.staEmpDiv }>This picker has no items yet.</div> // What: Breakdown Empty State Div Element. Why: An empty picker needs to explain why the list is missing instead of showing nothing at all. How: This renders only while breLisArr is empty.


							) }


						</CarSurCom>


					) }


				</div>


			</div>


		</div>


	);


}

// #endregion TabStaCom

// #endregion Components



// #region Exports

export { TabStaCom }; // What: Named Exports. Why: app.tsx renders this as the Stats tab itself. How: This re-exports TabStaCom; every other binding in this file is internal-only.

// #endregion Exports


