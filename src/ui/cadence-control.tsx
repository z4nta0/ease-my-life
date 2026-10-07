


// #region Imports

import cssModObj from './cadence-control.module.css'; // What: CSS Module Object. Why: The cadence editor's fields and anchor block are styled from their own module. How: This maps each class name in cadence-control.module.css to its hashed module class.


import { CAD_NAM_OBJ } from '../core/cadence.ts';      // What: Cadence Namespace Object. Why: Every cadence field this component reads or writes (mode, anchors, dateMode, nthOrdinal, nthWeekday) is normalized and summarized through this one domain namespace instead of duplicating that logic locally. How: This is called below for its own norCadFun and tipMesFun entries.
import { ColDisCom   } from './collapse.tsx';          // What: Collapse Disclosure Component. Why: The anchor subsection needs to animate open and closed as the selected cadence changes, instead of snapping. How: This wraps the whole non-daily anchor block below, gated on the current cadence.
import { InfTipCom   } from './info-tip.tsx';          // What: Info Tip Component. Why: Every cadence row's own "?" control needs an explanatory tooltip beside its label. How: This is rendered once per cadence row below, fed by CAD_NAM_OBJ's own tipMesFun copy.
import { ordSufFun   } from '../utils/date.ts';        // What: Ordinal Suffix Function. Why: Every day-of-month, week-ordinal, and weekday-of-month summary needs the correct English ordinal. How: This is called with the day number.
import { SegConCom   } from './segmented-control.tsx'; // What: Segment Control Component. Why: The top-level cadence picker and the monthly/yearly Date-vs-Weekday picker both need the same animated segmented control. How: This is rendered once for the cadence choice and once more inside each of the monthly and yearly subsections.


import type { CadFieTyp } from '../core/cadence.ts';    // What: Cadence Fields Type. Why: The editor reads and patches a picker's cadence fields. How: This types CccProTyp's value and patches.
import type { CadNamTyp } from '../core/data-model.ts'; // What: Cadence Name Type. Why: Each cadence option's key is one of the fixed cadences. How: This types CAD_OPT_ARR's keys, so the cadence picker hands back a real cadence.
import type { DatModTyp } from '../core/data-model.ts'; // What: Date Mode Type. Why: Each date mode option's key is one of the fixed modes. How: This types DAT_MOD_ARR's keys, so the mode picker hands back a real mode.
import type { JSX       } from 'react';                 // What: JSX. Why: The component declares the element it returns. How: This types its return as a JSX element.

// #endregion Imports



/**
 * cadence-control.tsx = Cadence Control
 *
 * @summary
 * CadConCom is the shared editor for a single picker's own surfacing
 * cadence (daily, weekly, monthly, or yearly) plus whichever anchor fields
 * that cadence needs: an anchor weekday for weekly, an anchor day of month
 * for monthly, or an anchor month and day for yearly, either one further
 * switchable to an nth-weekday rule (e.g. "the 2nd Tuesday") for monthly
 * and yearly. tab-picker.tsx renders it in the picker schedule editor,
 * committing every change through a single onChange(patch) callback; the
 * caller owns the actual persisted value and decides how a patch gets
 * merged into it. tab-data.tsx reads CAD_OPT_ARR for its own daily-cadence
 * summary. Reuses the SegConCom control and the Reminders scheduling
 * styles (rem-*, cad-*) rather than defining its own.
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

// #region CAD_OPT_ARR

/**
 * CAD_OPT_ARR = Cadence Options Array
 *
 * @summary
 * Every cadence option below shares one shape, the same option shape
 * SegConCom expects, and none of them repeat these fields' own
 * boilerplate comments on their own lines (see the "Repeated-shape object
 * literals" comment exception in CLAUDE.md):
 *
 * - `keyStr` (String): Key String, the cadence value the picker compares
 *   against the current cadence and writes back on selection.
 *
 * - `labStr` (String): Label String, the picker button's own visible
 *   text.
 *
 * - `subEle` (Element): Sub Element, the live sub-explanation shown under
 *   the picker while that cadence is selected, looked up by CadConCom as
 *   curSubEle (and by tab-data.tsx for its own daily summary).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const CAD_OPT_ARR : { keyStr : CadNamTyp, labStr : string, subEle : JSX.Element }[] = [ // What: Cadence Options Array. Why: The top-level cadence picker below needs one option per cadence, each carrying its own live sub-explanation; tab-data.tsx also reads this same array directly for its own cadence-summary lookup. How: This is passed as the top SegConCom's own optIteArr prop below.


	{ // What: Daily Cadence Option. Why: A picker that surfaces every day it runs, the default needs its own option. How: This pairs the 'daily' key with its label and live explanation.


		keyStr : 'daily',
		labStr : 'Daily',
		subEle : <>surfaces <strong>every day</strong> it runs (the standard behavior)</>


	},

	{ // What: Weekly Cadence Option. Why: A picker that surfaces once a week on a chosen weekday needs its own option. How: This pairs the 'weekly' key with its label and live explanation.


		keyStr : 'weekly',
		labStr : 'Weekly',

		subEle : <>surfaces <strong>once a week</strong>, on the weekday you choose below, after which the pick will persist until marked as completed</>


	},

	{ // What: Monthly Cadence Option. Why: A picker that surfaces once a month on a chosen day needs its own option. How: This pairs the 'monthly' key with its label and live explanation.


		keyStr : 'monthly',
		labStr : 'Monthly',

		subEle : <>surfaces <strong>once a month</strong>, on the day you choose below, after which the pick will persist until marked as completed</>


	},

	{ // What: Yearly Cadence Option. Why: A picker that surfaces once a year on a chosen date needs its own option. How: This pairs the 'yearly' key with its label and live explanation.


		keyStr : 'yearly',
		labStr : 'Yearly',

		subEle : <>surfaces <strong>once a year</strong>, on the date you choose below, after which the pick will persist until marked as completed</>


	}


];

// #endregion CAD_OPT_ARR



const DAT_MOD_ARR : { keyStr : DatModTyp, labStr : string }[] = [ // What: Date Mode Array. Why: The monthly and yearly subsections below both offer the same Date-vs-Weekday choice, driven by one shared SegConCom control. How: This is passed as that SegConCom's own optIteArr prop in both subsections below.


	{ keyStr : 'date',       labStr : 'Date'    }, // What: Key String. Why: This is the default day-of-month/day targeting mode's own value. How: SegConCom compares this against the current dateMode and writes it back on selection. // What: Label String. Why: This is the segmented control's own visible button text for this option. How: SegConCom renders this as the button's own text content.
	{ keyStr : 'nthWeekday', labStr : 'Weekday' }  // What: Key String. Why: This lets the user target e.g. "the 2nd Tuesday" instead of a fixed day number. How: SegConCom compares this against the current dateMode and writes it back on selection. // What: Label String. Why: This is the segmented control's own visible button text for this option. How: SegConCom renders this as the button's own text content.


];



const DAY_FUL_ARR = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];                                             // What: Day Full Array. Why: The weekly, monthly, and yearly subsections below all need the full weekday name, in both their own select options and their own live summaries. How: This is indexed by anchorDow/nthWeekday throughout CadConCom below.
const MON_FUL_ARR = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]; // What: Month Full Array. Why: The yearly subsection's own month select and live summary both need the full month name to display. How: This is indexed by anchorMonth (1-indexed, so minus 1) throughout the yearly subsection below.

// #endregion Constants



// #region Helpers

// #region dayCouFun

/**
 * dayCouFun = Day Count Function
 *
 * @summary
 * Returns how many days a month has, always counting February as 29 days
 * because the year is fixed at 2024 (a leap year). The yearly anchor is
 * a date that repeats every year, so Feb 29 has to stay selectable; the
 * scheduler itself clamps it to Feb 28 in a common year.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param monOneNum - Month One Number: The month, 1-indexed (1 is
 *                    January), matching a picker's own anchorMonth.
 *
 * @returns That month's own day count, 29 for February.
 *
 * @example
 * ```ts
 * dayCouFun(2) // => 29
 * ```
 *
*/

const dayCouFun = ( monOneNum : number ) : number => new Date( 2024, monOneNum, 0 ).getDate(); // What: Day Count Function. Why: The yearly subsection's day-of-month select always needs to allow day 29 for February, regardless of the real current year. How: This asks for day 0 of the month after monOneNum in a fixed leap year (2024), which JS's own Date resolves back to that month's own real last day.

// #endregion dayCouFun

// #endregion Helpers



// #region Components

type CccProTyp = { onChange : ( patValObj : CadFieTyp ) => void, value : CadFieTyp | null | undefined }; // What: Cadence-Control-Component Props Type. Why: The editor shows a picker's cadence fields and hands each change back as a patch. How: This types CadConCom's props.

// #region CadConCom

/**
 * CadConCom = Cadence Control Component
 *
 * @summary
 * See this file's own header comment above for the full picture of
 * what this component renders and where it is reused. In short: a
 * cadence picker (Daily/Weekly/Monthly/Yearly) plus, for every mode
 * but daily, whichever anchor subsection matches the selected mode,
 * animated open and closed via ColDisCom as the mode itself changes.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.onChange - On Change: Called with a patch object whenever any
 *                         cadence field changes; the caller owns how the patch
 *                         gets merged into its own storage.
 * @param props.value    - Value: The picker's own persisted cadence value (or
 *                         an in-progress draft), normalized on every render
 *                         via CAD_NAM_OBJ.norCadFun.
 *
 * @returns The full cadence editor: the cadence picker plus, for
 * every mode but daily, the matching anchor subsection inside an
 * animated ColDisCom.
 *
 * @example
 * ```tsx
 * CadConCom({ onChange, value }) // => <CadConCom />
 * ```
 *
*/

function CadConCom ( { onChange, value } : CccProTyp ) : JSX.Element {


	const norCadObj = CAD_NAM_OBJ.norCadFun( value || {} );                                                         // What: Normalized Cadence Object. Why: Every field read throughout this component needs a fully-defaulted cadence value, not a possibly-partial draft. How: This calls CAD_NAM_OBJ.norCadFun against the caller's own value, falling back to an empty object for a brand-new draft.
	const setPatFun = ( patValObj : CadFieTyp ) => onChange( patValObj );                                           // What: Set Patch Function. Why: Every field editor below needs one shared way to forward a partial change up to the caller. How: This calls onChange directly with whatever patch object it is given.
	const curSubEle = ( CAD_OPT_ARR.find( ( optConObj ) => optConObj.keyStr === norCadObj.cadence ) || {} ).subEle; // What: Current Sub Element. Why: The cadence picker's own live sub-explanation needs whichever CAD_OPT_ARR entry matches the currently-selected cadence. How: This looks up norCadObj's own cadence in CAD_OPT_ARR and reads that entry's own subEle field.



	return (


		<div
			className={ cssModObj.cadConDiv }

			data-element-name-hook='cadConDiv'
		>{ /* What: Controls Container Div Element. Why: This is CadConCom's own root element, holding the cadence picker and, for every mode but daily, the matching anchor subsection. How: This renders as a plain div; every field below commits through setPatFun. Its data-element-name-hook is read by help mode's Pickers catalog. */ }


			<div className={ cssModObj.forFieDiv }>{ /* What: Cadence Field Div Element. Why: This groups the cadence picker's own label and its own SegConCom control as one field, matching the Reminders editor's own field layout. How: This wraps the flabel-wrap block and the top SegConCom below. */ }


				<div className={ cssModObj.fieLabDiv }>{ /* What: Flabel Wrap Div Element. Why: The field's own label and live summary need to sit together as one visual unit. How: This wraps the label span and the fading summary span below. */ }


					<span className={ cssModObj.fieLabSpa }>{ /* What: How Often Label Span Element. Why: This is the cadence field's own plain label, with an inline "?" help bubble on the daily mode. How: This renders the literal text "How often?" followed by the conditional InfTipCom below. */ }


						How often?
						{ norCadObj.cadence === 'daily' && ( // What: Daily Help Check. Why: Only the daily cadence needs its own inline explanation of how it interacts with a picker's own Days control. How: This renders the InfTipCom only while norCadObj.cadence is 'daily'.


							<InfTipCom
								className={` ${ cssModObj.helBubSpa }   ${ cssModObj.helBubSpaSm } `}

								labTexStr={ CAD_NAM_OBJ.tipMesFun( 'daily', 'Which days?' ) } // What: Cadence Tip Copy. Why: The tip names the picker's own days control, whose visible label on the schedule editor is 'Which days?'. How: This passes that label as tipMesFun's own second argument, alongside the daily cadence.
							>?</InfTipCom> // What: Info Tip Component. Why: Only the daily cadence needs this inline explanation of how it interacts with a picker's own Days control. How: This renders the shared "?" bubble, fed by CAD_NAM_OBJ's own tipMesFun copy.


						) }


					</span>

					<span
						key={ norCadObj.cadence }

						className={` ${ cssModObj.fieSubSpa }   ${ cssModObj.fieSubSpaFading } `}
					>{ curSubEle }</span>{ /* What: Cadence Sub Span Element. Why: This is the live human-readable summary of the currently-selected cadence. How: This re-keys, and so re-fades, whenever norCadObj.cadence changes, rendering curSubEle. */ }


				</div>



				<SegConCom
					optIteArr={ CAD_OPT_ARR }
					value={ norCadObj.cadence }

					ariLabStr='Cadence'

					onChange={ ( cadKeyStr ) => setPatFun( { cadence : cadKeyStr } ) }
				/>{ /* What: Segment Control Component. Why: This is the actual top-level cadence picker. How: This commits the clicked cadence key straight through setPatFun. */ }


			</div>



			<ColDisCom open={ norCadObj.cadence !== 'daily' }>{ /* What: Collapse Disclosure Component. Why: Only a non-daily cadence has any anchor subsection at all to show. How: This animates the whole anchor block below open only while norCadObj.cadence isn't 'daily'. */ }


				<div
					key={ norCadObj.cadence }

					className={ cssModObj.ancFadDiv }
				>{ /* What: Anchor Fade Div Element. Why: The anchor subsection should fade in and out as a unit whenever the selected cadence itself changes. How: This re-keys, and so re-fades, whenever norCadObj.cadence changes, wrapping whichever of the 3 subsections below actually matches it. */ }


					{ norCadObj.cadence === 'weekly' && ( // What: Weekly Visibility Check. Why: Only the weekly cadence's own anchor-weekday subsection belongs here. How: This renders it only while norCadObj.cadence is 'weekly'.


						<div className={ cssModObj.forFieDiv }>{ /* What: Weekly Field Div Element. Why: This groups every weekly-specific control as one anchor subsection. How: This renders the field label/summary and the anchor-weekday select below. */ }


							<div className={ cssModObj.fieLabDiv }>{ /* What: Flabel Wrap Div Element. Why: The subsection's own label and live summary need to sit together. How: This wraps the label span and the plain summary span below. */ }


								<span className={ cssModObj.fieLabSpa }>{ /* What: On Which Day Label Span Element. Why: This is the weekly subsection's own plain label, with an inline "?" help bubble. How: This renders the literal text "On which day?" followed by the InfTipCom below. */ }


									On which day?
									<InfTipCom
										className={ cssModObj.helBubSpa }

										labTexStr={ CAD_NAM_OBJ.tipMesFun( 'weekly', 'Which days?' ) } // What: Cadence Tip Copy. Why: The tip names the picker's own days control, whose visible label on the schedule editor is 'Which days?'. How: This passes that label as tipMesFun's own second argument, alongside the weekly cadence.
									>?</InfTipCom>{ /* What: Info Tip Component. Why: The weekly cadence's own anchor day interacts with a picker's own Days control, which needs explaining. How: This renders the shared "?" bubble, fed by CAD_NAM_OBJ's own tipMesFun copy. */ }


								</span>

								<span className={ cssModObj.fieSubSpa }>surfaces <strong>every { DAY_FUL_ARR[ norCadObj.anchorDow ] }</strong></span>{ /* What: Weekly Sub Span Element. Why: This is the plain summary of which weekday the picker surfaces on. How: This names norCadObj's own anchorDow, looked up in DAY_FUL_ARR. */ }


							</div>

							<div className={ cssModObj.fieRowDiv }>{ /* What: Weekly Inline Div Element. Why: The anchor-weekday select reads best inline with its own leading word. How: This wraps the "Every" span and the weekday select below. */ }


								<span>Every</span>{ /* What: Every Span Element. Why: This is the inline control's own leading word. How: This renders the literal text "Every". */ }

								<select
									className={ cssModObj.ancPicSel }

									value={ norCadObj.anchorDow }

									aria-label='Anchor weekday'

									onChange={ ( chaEveObj ) => setPatFun( { anchorDow : parseInt( chaEveObj.target.value ) } ) }
								>{ /* What: Anchor Weekday Select Element. Why: This is the actual control for choosing the weekly anchor day. How: This commits the chosen weekday's own index straight through setPatFun. */ }


									{ DAY_FUL_ARR.map( ( dayNamStr, dowIndNum ) => ( // What: Weekday Option List Render. Why: One option is needed per real weekday. How: This maps DAY_FUL_ARR to one option per entry, keyed by its own dowIndNum.


										<option
											key={ dowIndNum }

											value={ dowIndNum }
										>{ dayNamStr }</option> // What: Weekday Option Element. Why: One option is needed per real weekday. How: This renders dayNamStr, valued by its own dowIndNum.


									) ) }


								</select>


							</div>


						</div>


					) }


					{ norCadObj.cadence === 'monthly' && ( // What: Monthly Visibility Check. Why: Only the monthly cadence's own anchor subsection belongs here. How: This renders it only while norCadObj.cadence is 'monthly'.


						<div className={ cssModObj.forFieDiv }>{ /* What: Monthly Field Div Element. Why: This groups every monthly-specific control as one anchor subsection. How: This renders the field label/summary, the Date/Weekday SegConCom, whichever detail row matches it, and a clamp hint. */ }


							<div className={ cssModObj.fieLabDiv }>{ /* What: Flabel Wrap Div Element. Why: The subsection's own label and live summary need to sit together. How: This wraps the label span and the fading summary span below. */ }


								<span className={ cssModObj.fieLabSpa }>{ /* What: On Which Day Label Span Element. Why: This is the monthly subsection's own plain label, with an inline "?" help bubble. How: This renders the literal text "On which day?" followed by the InfTipCom below. */ }


									On which day?
									<InfTipCom
										className={ cssModObj.helBubSpa }

										labTexStr={ CAD_NAM_OBJ.tipMesFun( 'monthly', 'Which days?' ) } // What: Cadence Tip Copy. Why: The tip names the picker's own days control, whose visible label on the schedule editor is 'Which days?'. How: This passes that label as tipMesFun's own second argument, alongside the monthly cadence.
									>?</InfTipCom>{ /* What: Info Tip Component. Why: The monthly cadence's own anchor day interacts with a picker's own Days control, which needs explaining. How: This renders the shared "?" bubble, fed by CAD_NAM_OBJ's own tipMesFun copy. */ }


								</span>

								<span
									key={ norCadObj.dateMode }

									className={` ${ cssModObj.fieSubSpa }   ${ cssModObj.fieSubSpaFading } `}
								>{ norCadObj.dateMode === 'nthWeekday' ? <>surfaces on the <strong>{ ordSufFun( norCadObj.nthOrdinal ) } { DAY_FUL_ARR[ norCadObj.nthWeekday ] }</strong> of every month</> : <>surfaces the <strong>{ ordSufFun( norCadObj.anchorDom ) } of every month</strong></> }</span>{ /* What: Monthly Sub Span Element. Why: This is the live summary of which day (or nth weekday) the picker surfaces on. How: This re-keys, and so re-fades, whenever norCadObj.dateMode changes, rendering one of the 2 branches. */ }


							</div>



							<SegConCom
								layVarStr='snug' // What: Layout Variant String. Why: The two Day selection options should sit snug at their content's width instead of spreading across the field. How: SegConCom applies its snug layout for this value.
								optIteArr={ DAT_MOD_ARR }
								value={ norCadObj.dateMode }

								ariLabStr='Day selection'

								onChange={ ( modKeyStr ) => setPatFun( { dateMode : modKeyStr } ) }
							/>{ /* What: Segment Control Component. Why: This is the Date-vs-Weekday picker shared by the monthly and yearly subsections. How: This commits the clicked date-mode key straight through setPatFun. */ }



							{ norCadObj.dateMode === 'nthWeekday' ? ( // What: Nth-Weekday Mode Check. Why: The monthly detail row's own shape depends on which date-targeting mode is selected. How: This renders the ordinal-plus-weekday selects while norCadObj.dateMode is 'nthWeekday', the plain day-of-month select otherwise.


								<div className={ cssModObj.fieRowDiv }>{ /* What: Monthly Nth-Weekday Inline Div Element. Why: The ordinal and weekday selects read best inline with their own leading word. How: This wraps the "On the" span and the 2 selects below. */ }


									<span>On the</span>{ /* What: On The Span Element. Why: This is the inline control's own leading words. How: This renders the literal text "On the". */ }

									<select
										className={ cssModObj.ancPicSel }

										value={ norCadObj.nthOrdinal }

										aria-label='Week of the month'

										onChange={ ( chaEveObj ) => setPatFun( { nthOrdinal : parseInt( chaEveObj.target.value ) } ) }
									>{ /* What: Nth Ordinal Select Element. Why: This is the actual control for choosing which occurrence (1st through 5th) of the weekday to target. How: This commits the chosen ordinal straight through setPatFun. */ }


										{ [ 1, 2, 3, 4, 5 ].map( ( ordValNum ) => ( // What: Ordinal Option List Render. Why: One option is needed per possible occurrence, 1st through 5th. How: This maps the fixed [1..5] array to one option per entry, keyed by its own ordValNum.


											<option
												key={ ordValNum }

												value={ ordValNum }
											>{ ordSufFun( ordValNum ) }</option> // What: Ordinal Option Element. Why: One option is needed per possible occurrence, 1st through 5th. How: This renders ordSufFun's own suffixed label, valued by ordValNum.


										) ) }


									</select>

									<select
										className={ cssModObj.ancPicSel }

										value={ norCadObj.nthWeekday }

										aria-label='Weekday'

										onChange={ ( chaEveObj ) => setPatFun( { nthWeekday : parseInt( chaEveObj.target.value ) } ) }
									>{ /* What: Nth Weekday Select Element. Why: This is the actual control for choosing which weekday to target. How: This commits the chosen weekday's own index straight through setPatFun. */ }


										{ DAY_FUL_ARR.map( ( dayNamStr, dowIndNum ) => ( // What: Weekday Option List Render. Why: One option is needed per real weekday. How: This maps DAY_FUL_ARR to one option per entry, keyed by its own dowIndNum.


											<option
												key={ dowIndNum }

												value={ dowIndNum }
											>{ dayNamStr }</option> // What: Weekday Option Element. Why: One option is needed per real weekday. How: This renders dayNamStr, valued by its own dowIndNum.


										) ) }


									</select>


								</div>


							) : ( // What: Plain Date Mode Branch. Why: The default mode just needs the plain day-of-month select instead. How: This renders the else branch, taken while norCadObj.dateMode isn't 'nthWeekday'.


								<div className={ cssModObj.fieRowDiv }>{ /* What: Monthly Date Inline Div Element. Why: The anchor-day-of-month select reads best inline with its own leading word. How: This wraps the "On the" span and the day-of-month select below. */ }


									<span>On the</span>{ /* What: On The Span Element. Why: This is the inline control's own leading words. How: This renders the literal text "On the". */ }

									<select
										className={ cssModObj.ancPicSel }

										value={ norCadObj.anchorDom }

										aria-label='Anchor day of month'

										onChange={ ( chaEveObj ) => setPatFun( { anchorDom : parseInt( chaEveObj.target.value ) } ) }
									>{ /* What: Anchor Day Of Month Select Element. Why: This is the actual control for choosing the monthly anchor day. How: This commits the chosen day-of-month straight through setPatFun. */ }


										{ Array.from( Array( 31 ).keys(), ( dayIndNum ) => dayIndNum + 1 ).map( ( dayValNum ) => ( // What: Day Of Month Option List Render. Why: One option is needed per possible day of month, 1 through 31. How: This maps a generated 1-31 array to one option per entry, keyed by its own dayValNum.


											<option
												key={ dayValNum }

												value={ dayValNum }
											>{ ordSufFun( dayValNum ) }</option> // What: Day Of Month Option Element. Why: One option is needed per possible day of month, 1 through 31. How: This renders ordSufFun's own suffixed label, valued by dayValNum.


										) ) }


									</select>


								</div>


							) }

							{ norCadObj.dateMode === 'nthWeekday' // What: Clamp Hint Mode Check. Why: Each date mode has its own clamp edge case to warn about. How: This picks the nth-weekday hint while norCadObj.dateMode is 'nthWeekday', the plain-date hint otherwise.
								? norCadObj.nthOrdinal === 5 && <p className={ cssModObj.fieHinPar }>In months without a 5th, this falls on the 4th instead.</p> // What: Nth-Weekday Clamp Hint Paragraph Element. Why: A requested 5th occurrence silently falls back to the 4th, which the user needs to know about. How: This renders only while norCadObj.nthOrdinal is exactly 5.
								: norCadObj.anchorDom > 28 && <p className={ cssModObj.fieHinPar }>In shorter months this falls on the last day.</p>             // What: Plain-Date Clamp Hint Paragraph Element. Why: A day past 28 can silently clamp in a shorter month, which the user needs to know about. How: This renders only while norCadObj.anchorDom is past 28.
							}


						</div>


					) }


					{ norCadObj.cadence === 'yearly' && ( // What: Yearly Visibility Check. Why: Only the yearly cadence's own anchor subsection belongs here. How: This renders it only while norCadObj.cadence is 'yearly'.


						<div className={ cssModObj.forFieDiv }>{ /* What: Yearly Field Div Element. Why: This groups every yearly-specific control as one anchor subsection. How: This renders the field label/summary, the Date/Weekday SegConCom, whichever detail row matches it, and a clamp hint. */ }


							<div className={ cssModObj.fieLabDiv }>{ /* What: Flabel Wrap Div Element. Why: The subsection's own label and live summary need to sit together. How: This wraps the label span and the fading summary span below. */ }


								<span className={ cssModObj.fieLabSpa }>{ /* What: On Which Date Label Span Element. Why: This is the yearly subsection's own plain label, with an inline "?" help bubble. How: This renders the literal text "On which date?" followed by the InfTipCom below. */ }


									On which date?
									<InfTipCom
										className={ cssModObj.helBubSpa }

										labTexStr={ CAD_NAM_OBJ.tipMesFun( 'yearly', 'Which days?' ) } // What: Cadence Tip Copy. Why: The tip names the picker's own days control, whose visible label on the schedule editor is 'Which days?'. How: This passes that label as tipMesFun's own second argument, alongside the yearly cadence.
									>?</InfTipCom>{ /* What: Info Tip Component. Why: The yearly cadence's own anchor day interacts with a picker's own Days control, which needs explaining. How: This renders the shared "?" bubble, fed by CAD_NAM_OBJ's own tipMesFun copy. */ }


								</span>

								<span
									key={ norCadObj.dateMode }

									className={` ${ cssModObj.fieSubSpa }   ${ cssModObj.fieSubSpaFading } `}
								>{ norCadObj.dateMode === 'nthWeekday' ? <>surfaces the <strong>{ ordSufFun( norCadObj.nthOrdinal ) } { DAY_FUL_ARR[ norCadObj.nthWeekday ] }</strong> of <strong>{ MON_FUL_ARR[ norCadObj.anchorMonth - 1 ] }</strong>, every year</> : <>surfaces <strong>every { MON_FUL_ARR[ norCadObj.anchorMonth - 1 ] } { ordSufFun( Math.min( norCadObj.anchorDay, dayCouFun( norCadObj.anchorMonth ) ) ) }</strong></> }</span>{ /* What: Yearly Sub Span Element. Why: This is the live summary of which date (or nth weekday of month) the picker surfaces on. How: This re-keys, and so re-fades, whenever norCadObj.dateMode changes, rendering one of the 2 branches. */ }


							</div>



							<SegConCom
								layVarStr='snug' // What: Layout Variant String. Why: The two Day selection options should sit snug at their content's width instead of spreading across the field. How: SegConCom applies its snug layout for this value.
								optIteArr={ DAT_MOD_ARR }
								value={ norCadObj.dateMode }

								ariLabStr='Day selection'

								onChange={ ( modKeyStr ) => setPatFun( { dateMode : modKeyStr } ) }
							/>{ /* What: Segment Control Component. Why: This is the Date-vs-Weekday picker shared by the monthly and yearly subsections. How: This commits the clicked date-mode key straight through setPatFun. */ }



							{ norCadObj.dateMode === 'nthWeekday' ? ( // What: Nth-Weekday Mode Check. Why: The yearly detail row's own shape depends on which date-targeting mode is selected. How: This renders the ordinal-plus-weekday-plus-month selects while norCadObj.dateMode is 'nthWeekday', the plain month-plus-day selects otherwise.


								<div className={ cssModObj.fieRowDiv }>{ /* What: Yearly Nth-Weekday Inline Div Element. Why: The ordinal, weekday, and month selects read best inline together. How: This wraps all 3 selects below. */ }


									<select
										className={ cssModObj.ancPicSel }

										value={ norCadObj.nthOrdinal }

										aria-label='Week of the month'

										onChange={ ( chaEveObj ) => setPatFun( { nthOrdinal : parseInt( chaEveObj.target.value ) } ) }
									>{ /* What: Nth Ordinal Select Element. Why: This is the actual control for choosing which occurrence (1st through 5th) of the weekday to target. How: This commits the chosen ordinal straight through setPatFun. */ }


										{ [ 1, 2, 3, 4, 5 ].map( ( ordValNum ) => ( // What: Ordinal Option List Render. Why: One option is needed per possible occurrence, 1st through 5th. How: This maps the fixed [1..5] array to one option per entry, keyed by its own ordValNum.


											<option
												key={ ordValNum }

												value={ ordValNum }
											>{ ordSufFun( ordValNum ) }</option> // What: Ordinal Option Element. Why: One option is needed per possible occurrence, 1st through 5th. How: This renders ordSufFun's own suffixed label, valued by ordValNum.


										) ) }


									</select>

									<select
										className={ cssModObj.ancPicSel }

										value={ norCadObj.nthWeekday }

										aria-label='Weekday'

										onChange={ ( chaEveObj ) => setPatFun( { nthWeekday : parseInt( chaEveObj.target.value ) } ) }
									>{ /* What: Nth Weekday Select Element. Why: This is the actual control for choosing which weekday to target. How: This commits the chosen weekday's own index straight through setPatFun. */ }


										{ DAY_FUL_ARR.map( ( dayNamStr, dowIndNum ) => ( // What: Weekday Option List Render. Why: One option is needed per real weekday. How: This maps DAY_FUL_ARR to one option per entry, keyed by its own dowIndNum.


											<option
												key={ dowIndNum }

												value={ dowIndNum }
											>{ dayNamStr }</option> // What: Weekday Option Element. Why: One option is needed per real weekday. How: This renders dayNamStr, valued by its own dowIndNum.


										) ) }


									</select>

									<span>of</span>{ /* What: Of Span Element. Why: This is the inline control's own connecting word between the weekday and month selects. How: This renders the literal text "of". */ }

									<select
										className={ cssModObj.ancPicSel }

										value={ norCadObj.anchorMonth }

										aria-label='Anchor month'

										onChange={ ( chaEveObj ) => setPatFun( { anchorMonth : parseInt( chaEveObj.target.value ) } ) }
									>{ /* What: Anchor Month Select Element. Why: This is the actual control for choosing the yearly anchor month. How: This commits the chosen month's own 1-indexed number straight through setPatFun. */ }


										{ MON_FUL_ARR.map( ( monNamStr, monIndNum ) => ( // What: Month Option List Render. Why: One option is needed per real month. How: This maps MON_FUL_ARR to one option per entry, keyed by its own 1-indexed monIndNum.


											<option
												key={ monIndNum }

												value={ monIndNum + 1 }
											>{ monNamStr }</option> // What: Month Option Element. Why: One option is needed per real month. How: This renders monNamStr, valued by its own 1-indexed monIndNum.


										) ) }


									</select>


								</div>


							) : ( // What: Plain Date Mode Branch. Why: The default mode just needs the plain month-and-day selects instead. How: This renders the else branch, taken while norCadObj.dateMode isn't 'nthWeekday'.


								<div className={ cssModObj.fieRowDiv }>{ /* What: Yearly Date Inline Div Element. Why: The anchor-month and anchor-day selects read best inline with their own leading word. How: This wraps the "Every" span and the 2 selects below. */ }


									<span>Every</span>{ /* What: Every Span Element. Why: This is the inline control's own leading word. How: This renders the literal text "Every". */ }

									<select
										className={ cssModObj.ancPicSel }

										value={ norCadObj.anchorMonth }

										aria-label='Anchor month'

										onChange={ ( chaEveObj ) => setPatFun( { anchorMonth : parseInt( chaEveObj.target.value ) } ) }
									>{ /* What: Anchor Month Select Element. Why: This is the actual control for choosing the yearly anchor month. How: This commits the chosen month's own 1-indexed number straight through setPatFun. */ }


										{ MON_FUL_ARR.map( ( monNamStr, monIndNum ) => ( // What: Month Option List Render. Why: One option is needed per real month. How: This maps MON_FUL_ARR to one option per entry, keyed by its own 1-indexed monIndNum.


											<option
												key={ monIndNum }

												value={ monIndNum + 1 }
											>{ monNamStr }</option> // What: Month Option Element. Why: One option is needed per real month. How: This renders monNamStr, valued by its own 1-indexed monIndNum.


										) ) }


									</select>

									<select
										className={ cssModObj.ancPicSel }

										value={ Math.min( norCadObj.anchorDay, dayCouFun( norCadObj.anchorMonth ) ) } // What: Clamped Anchor Day Value. Why: A stored anchor day can outlast a month change (e.g. the 31st after switching to April), which would leave the select with no matching option. How: This shows the anchor day capped at the anchor month's own day count.

										aria-label='Anchor day'

										onChange={ ( chaEveObj ) => setPatFun( { anchorDay : parseInt( chaEveObj.target.value ) } ) }
									>{ /* What: Anchor Day Select Element. Why: This is the actual control for choosing the yearly anchor day, clamped to whatever the anchor month's own real length allows. How: This commits the chosen day-of-month straight through setPatFun. */ }


										{ Array.from( Array( dayCouFun( norCadObj.anchorMonth ) ).keys(), ( dayIndNum ) => dayIndNum + 1 ).map( ( dayValNum ) => ( // What: Anchor Day Option List Render. Why: One option is needed per possible day within the anchor month's own real length. How: This maps a generated array sized by dayCouFun to one option per entry, keyed by its own dayValNum.


											<option
												key={ dayValNum }

												value={ dayValNum }
											>{ ordSufFun( dayValNum ) }</option> // What: Anchor Day Option Element. Why: One option is needed per possible day within the anchor month's own real length. How: This renders ordSufFun's own suffixed label, valued by dayValNum.


										) ) }


									</select>


								</div>


							) }

							{ norCadObj.dateMode === 'nthWeekday' // What: Clamp Hint Mode Check. Why: Each date mode has its own clamp edge case to warn about. How: This picks the nth-weekday hint while norCadObj.dateMode is 'nthWeekday', the leap-day hint otherwise.
								? norCadObj.nthOrdinal === 5 && <p className={ cssModObj.fieHinPar }>In years where that month has no 5th, this falls on the 4th instead.</p>            // What: Nth-Weekday Clamp Hint Paragraph Element. Why: A requested 5th occurrence silently falls back to the 4th, which the user needs to know about. How: This renders only while norCadObj.nthOrdinal is exactly 5.
								: norCadObj.anchorMonth === 2 && norCadObj.anchorDay === 29 && <p className={ cssModObj.fieHinPar }>In common (non-leap) years this falls on Feb 28.</p> // What: Leap-Day Clamp Hint Paragraph Element. Why: Feb 29 silently clamps to Feb 28 in a common year, which the user needs to know about. How: This renders only while the anchor month and day are exactly Feb 29.
							}


						</div>


					) }


				</div>


			</ColDisCom>


		</div>


	);


}

// #endregion CadConCom

// #endregion Components



// #region Exports

export { CadConCom, CAD_OPT_ARR }; // What: Named Exports. Why: tab-picker.tsx renders CadConCom for its own cadence editor, and tab-data.tsx reads CAD_OPT_ARR for its own daily-cadence summary text; every other binding in this file is internal-only. How: This re-exports the 2 declared above.

// #endregion Exports


