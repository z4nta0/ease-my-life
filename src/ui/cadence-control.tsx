


// #region Imports

import cssModObj from './cadence-control.module.css'; // What: CSS Module Object. Why: This file's elements are styled from their own module. How: This maps each class name in cadence-control.module.css to its hashed module class.


import { CAD_NAM_OBJ } from '../core/cadence.ts';      // What: Cadence Namespace Object. Why: The cadence normalizing and tip copy come from this one domain namespace instead of being duplicated locally. How: This is called below for its own norCadFun and tipMesFun entries.
import { ColDisCom   } from './collapse.tsx';          // What: Collapse Disclosure Component. Why: The anchor subsection needs to animate open and closed as the selected cadence changes, instead of snapping. How: This wraps the whole non-daily anchor block below, gated on the current cadence.
import { DatModCom   } from './date-mode.tsx';         // What: Date Mode Component. Why: The monthly and yearly subsections offer the shared Date-vs-Weekday toggle. How: This is rendered once inside each of those subsections.
import { DAY_FUL_ARR } from '../utils/date.ts';        // What: Day Full Array. Why: The weekday selects and live summaries name each weekday in full. How: This is mapped to one option per weekday and indexed by anchorDow or nthWeekday.
import { InfTipCom   } from './info-tip.tsx';          // What: Info Tip Component. Why: The anchor labels and the daily explanation each carry a "?" control that needs an explanatory tooltip beside its label. How: This is rendered inside AncLabCom and beside the daily "How often?" label, fed by CAD_NAM_OBJ's own tipMesFun copy.
import { MON_FUL_ARR } from '../utils/date.ts';        // What: Month Full Array. Why: The yearly month selects and live summary name each month in full. How: This is mapped to one option per month and indexed by anchorMonth minus 1.
import { ordSufFun   } from '../utils/date.ts';        // What: Ordinal Suffix Function. Why: Day-of-month and week-ordinal options and summaries need the correct English ordinal. How: This is called with the day number.
import { SegConCom   } from './segmented-control.tsx'; // What: Segment Control Component. Why: The top-level cadence picker uses the shared animated segmented control. How: This is rendered once for the cadence choice.


import type { CadFieTyp } from '../core/cadence.ts';    // What: Cadence Field Type. Why: The editor reads and patches a picker's cadence fields. How: This types CccProTyp's value and patches.
import type { CadNamTyp } from '../core/data-model.ts'; // What: Cadence Name Type. Why: Each cadence option's key is one of the fixed cadences. How: This types CAD_OPT_ARR's keys, so the cadence picker hands back a real cadence.
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
 * and yearly. Every change is committed through a single onChange(patch)
 * callback; the caller owns the actual persisted value and decides how a
 * patch gets merged into it. It reuses the SegConCom control.
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
 *   curSubEle.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const CAD_OPT_ARR : { keyStr : CadNamTyp, labStr : string, subEle : JSX.Element }[] = [ // What: Cadence Options Array. Why: The top-level cadence picker below needs one option per cadence, each carrying its own live sub-explanation. How: This is passed as the top SegConCom's own optIteArr prop below.


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

type AlcProTyp = { cadNamStr : CadNamTyp, labTexStr : string }; // What: Anchor-Label-Component Props Type. Why: Each anchor subsection's label names its own question and its own cadence's tip. How: This types AncLabCom's props.

// #region AncLabCom

/**
 * AncLabCom = Anchor Label Component
 *
 * @summary
 * Draws one anchor subsection's plain label, the question it asks followed
 * by an inline "?" help bubble whose copy explains how that cadence's
 * anchor day interacts with a picker's own Days control.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.cadNamStr - Cadence Name String: The cadence whose tip copy
 *                          the bubble shows.
 * @param props.labTexStr - Label Text String: The label's own question.
 *
 * @returns The label span with its help bubble.
 *
 * @example
 * ```tsx
 * AncLabCom({ cadNamStr, labTexStr }) // => <AncLabCom />
 * ```
 *
*/

function AncLabCom ( { cadNamStr, labTexStr } : AlcProTyp ) : JSX.Element {


	return (


		<span className={ cssModObj.fieLabSpa }>{ /* What: Field Label Span Element. Why: This is an anchor subsection's own plain label, with an inline "?" help bubble. How: This renders labTexStr followed by the InfTipCom below. */ }


			{ labTexStr }
			<InfTipCom
				className={ cssModObj.helBubSpa }

				labTexStr={ CAD_NAM_OBJ.tipMesFun( cadNamStr, 'Which days?' ) } // What: Cadence Tip Copy. Why: The tip names the picker's own days control, whose visible label in the picker form is 'Which days?'. How: This passes that label as tipMesFun's own second argument, alongside the subsection's cadence.
			>?</InfTipCom>{ /* What: Info Tip Component. Why: The cadence's own anchor day interacts with a picker's own Days control, which needs explaining. How: This renders the shared "?" bubble, fed by CAD_NAM_OBJ's own tipMesFun copy. */ }


		</span>


	);


}

// #endregion AncLabCom



type DecProTyp = { ariLabStr : string, dayCouNum : number, onChange : ( dayValNum : number ) => void, value : number }; // What: Day-Of-Month-Select-Component Props Type. Why: Each day select names its own role and month length and hands back the chosen day. How: This types DomSelCom's props.

// #region DomSelCom

/**
 * DomSelCom = Day-Of-Month Select Component
 *
 * @summary
 * Draws a select of the days of a month, from the 1st up to the given day
 * count, each labeled with its ordinal suffix, for the monthly and yearly
 * anchor days.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.ariLabStr - ARIA Label String: The select's accessible name.
 * @param props.dayCouNum - Day Count Number: How many days the select offers.
 * @param props.onChange  - On Change: Called with the chosen day of the month.
 * @param props.value     - Value: The current day of the month.
 *
 * @returns The day select.
 *
 * @example
 * ```tsx
 * DomSelCom({ ariLabStr, dayCouNum, onChange, value }) // => <DomSelCom />
 * ```
 *
*/

function DomSelCom ( { ariLabStr, dayCouNum, onChange, value } : DecProTyp ) : JSX.Element {


	return (


		<select
			className={ cssModObj.ancPicSel }

			value={ value }

			aria-label={ ariLabStr }

			onChange={ ( chaEveObj ) => onChange( parseInt( chaEveObj.target.value ) ) }
		>{ /* What: Anchor Pick Select Element. Why: This is the actual control for choosing an anchor day of the month. How: This hands the chosen day to onChange. */ }


			{ Array.from( Array( dayCouNum ).keys(), ( dayIndNum ) => dayIndNum + 1 ).map( ( dayValNum ) => ( // What: Day Option List Render. Why: One option is needed per day the select offers. How: This maps a generated array sized by dayCouNum to one option per entry, keyed by its own dayValNum.


				<option
					key={ dayValNum }

					value={ dayValNum }
				>{ ordSufFun( dayValNum ) }</option> // What: Day Option Element. Why: One option is needed per day the select offers. How: This renders ordSufFun's own suffixed label, valued by dayValNum.


			) ) }


		</select>


	);


}

// #endregion DomSelCom



type DscProTyp = { ariLabStr : string, onChange : ( dowValNum : number ) => void, value : number }; // What: Day-Of-Week-Select-Component Props Type. Why: Each weekday select names its own role and hands back the chosen weekday. How: This types DowSelCom's props.

// #region DowSelCom

/**
 * DowSelCom = Day-Of-Week Select Component
 *
 * @summary
 * Draws a select of every weekday, named in full and valued by its index
 * from Sunday, for the weekly anchor day and the nth-weekday rules.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.ariLabStr - ARIA Label String: The select's accessible name.
 * @param props.onChange  - On Change: Called with the chosen weekday's index.
 * @param props.value     - Value: The current weekday's index.
 *
 * @returns The weekday select.
 *
 * @example
 * ```tsx
 * DowSelCom({ ariLabStr, onChange, value }) // => <DowSelCom />
 * ```
 *
*/

function DowSelCom ( { ariLabStr, onChange, value } : DscProTyp ) : JSX.Element {


	return (


		<select
			className={ cssModObj.ancPicSel }

			value={ value }

			aria-label={ ariLabStr }

			onChange={ ( chaEveObj ) => onChange( parseInt( chaEveObj.target.value ) ) }
		>{ /* What: Anchor Pick Select Element. Why: This is the actual control for choosing a weekday. How: This hands the chosen weekday's own index to onChange. */ }


			{ DAY_FUL_ARR.map( ( dayNamStr, dowIndNum ) => ( // What: Weekday Option List Render. Why: One option is needed per real weekday. How: This maps DAY_FUL_ARR to one option per entry, keyed by its own dowIndNum.


				<option
					key={ dowIndNum }

					value={ dowIndNum }
				>{ dayNamStr }</option> // What: Weekday Option Element. Why: One option is needed per real weekday. How: This renders dayNamStr, valued by its own dowIndNum.


			) ) }


		</select>


	);


}

// #endregion DowSelCom



type MscProTyp = { onChange : ( monValNum : number ) => void, value : number }; // What: Month-Select-Component Props Type. Why: The month select shows the anchor month and hands back the one chosen. How: This types MonSelCom's props.

// #region MonSelCom

/**
 * MonSelCom = Month Select Component
 *
 * @summary
 * Draws the yearly anchor month select, every month named in full and
 * valued by its 1-indexed number, shared by both yearly date modes.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.onChange - On Change: Called with the chosen month's 1-indexed
 *                         number.
 * @param props.value    - Value: The current anchor month's 1-indexed number.
 *
 * @returns The month select.
 *
 * @example
 * ```tsx
 * MonSelCom({ onChange, value }) // => <MonSelCom />
 * ```
 *
*/

function MonSelCom ( { onChange, value } : MscProTyp ) : JSX.Element {


	return (


		<select
			className={ cssModObj.ancPicSel }

			value={ value }

			aria-label='Anchor month'

			onChange={ ( chaEveObj ) => onChange( parseInt( chaEveObj.target.value ) ) }
		>{ /* What: Anchor Pick Select Element. Why: This is the actual control for choosing the yearly anchor month. How: This hands the chosen month's own 1-indexed number to onChange. */ }


			{ MON_FUL_ARR.map( ( monNamStr, monIndNum ) => ( // What: Month Option List Render. Why: One option is needed per real month. How: This maps MON_FUL_ARR to one option per entry, keyed by its own zero-indexed monIndNum.


				<option
					key={ monIndNum }

					value={ monIndNum + 1 }
				>{ monNamStr }</option> // What: Month Option Element. Why: One option is needed per real month. How: This renders monNamStr, valued by its own monIndNum plus 1, the 1-indexed month number.


			) ) }


		</select>


	);


}

// #endregion MonSelCom



type NecProTyp = { dowValNum : number, onPatChaFun : ( patValObj : CadFieTyp ) => void, ordValNum : number }; // What: Nth-Select-Component Props Type. Why: The pair shows the rule's occurrence and weekday and hands back each change as a patch. How: This types NthSelCom's props.

// #region NthSelCom

/**
 * NthSelCom = Nth Select Component
 *
 * @summary
 * Draws the nth-weekday rule's two selects, which occurrence (1st through
 * 5th) and which weekday, as siblings in whatever row holds them, for the
 * monthly and yearly subsections alike.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.dowValNum   - Day-Of-Week Value Number: The rule's weekday
 *                            index.
 * @param props.onPatChaFun - On Patch Change Function: Called with a patch
 *                            naming the changed field.
 * @param props.ordValNum   - Ordinal Value Number: The rule's occurrence.
 *
 * @returns The ordinal and weekday selects.
 *
 * @example
 * ```tsx
 * NthSelCom({ dowValNum, onPatChaFun, ordValNum }) // => <NthSelCom />
 * ```
 *
*/

function NthSelCom ( { dowValNum, onPatChaFun, ordValNum } : NecProTyp ) : JSX.Element {


	return (


		<>{ /* What: Nth Selects Fragment. Why: The two selects sit in their caller's own row, beside its other words and selects. How: This groups them without a wrapper of its own. */ }


			<select
				className={ cssModObj.ancPicSel }

				value={ ordValNum }

				aria-label='Week of the month'

				onChange={ ( chaEveObj ) => onPatChaFun( { nthOrdinal : parseInt( chaEveObj.target.value ) } ) }
			>{ /* What: Anchor Pick Select Element. Why: This is the actual control for choosing which occurrence (1st through 5th) of the weekday to target. How: This commits the chosen ordinal straight through onPatChaFun. */ }


				{ [ 1, 2, 3, 4, 5 ].map( ( ordOptNum ) => ( // What: Ordinal Option List Render. Why: One option is needed per possible occurrence, 1st through 5th. How: This maps the fixed [1..5] array to one option per entry, keyed by its own ordOptNum.


					<option
						key={ ordOptNum }

						value={ ordOptNum }
					>{ ordSufFun( ordOptNum ) }</option> // What: Ordinal Option Element. Why: One option is needed per possible occurrence, 1st through 5th. How: This renders ordSufFun's own suffixed label, valued by ordOptNum.


				) ) }


			</select>



			<DowSelCom
				value={ dowValNum }

				ariLabStr='Weekday'

				onChange={ ( newDowNum ) => onPatChaFun( { nthWeekday : newDowNum } ) }
			/>{ /* What: Day-Of-Week Select Component. Why: This is the actual control for choosing which weekday to target. How: This commits the chosen weekday's own index straight through onPatChaFun. */ }


		</>


	);


}

// #endregion NthSelCom



type CccProTyp = { onChange : ( patValObj : CadFieTyp ) => void, value : CadFieTyp | null | undefined }; // What: Cadence-Control-Component Props Type. Why: The editor shows a picker's cadence fields and hands each change back as a patch. How: This types CadConCom's props.

// #region CadConCom

/**
 * CadConCom = Cadence Control Component
 *
 * @summary
 * See this file's own header comment above for the full picture of
 * what this component renders. In short: a
 * cadence picker (Daily/Weekly/Monthly/Yearly) plus, for every mode
 * but daily, whichever anchor subsection matches the selected mode,
 * animated open and closed via ColDisCom as the mode itself changes.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.onChange - On Change: Called with a patch object whenever any
 *                         cadence field changes; the caller owns how the patch
 *                         gets merged into its own storage.
 * @param props.value    - Value: {@link cadCurObj}
 *
 * @returns The full cadence editor: the cadence picker plus, for every mode
 *          but daily, the matching anchor subsection inside an animated
 *          ColDisCom.
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
		>{ /* What: Cadence Control Div Element. Why: This is CadConCom's own root element, holding the cadence picker and, for a non-daily cadence, the matching anchor subsection. How: This renders as a plain div; every field below commits through setPatFun. Its data-element-name-hook is read by help mode. */ }


			<div className={ cssModObj.forFieDiv }>{ /* What: Form Field Div Element. Why: This groups the cadence picker's own label and its own SegConCom control as one field. How: This wraps the label block and the top SegConCom below. */ }


				<div className={ cssModObj.fieLabDiv }>{ /* What: Field Label Div Element. Why: The field's own label and live summary need to sit together as one visual unit. How: This wraps the label span and the fading summary span below. */ }


					<span className={ cssModObj.fieLabSpa }>{ /* What: Field Label Span Element. Why: This is the cadence field's own plain label, with an inline "?" help bubble on the daily mode. How: This renders the literal text "How often?" followed by the conditional InfTipCom below. */ }


						How often?
						{ norCadObj.cadence === 'daily' && ( // What: Daily Help Check. Why: Only the daily cadence needs its own inline explanation of how it interacts with a picker's own Days control. How: This renders the InfTipCom only while norCadObj.cadence is 'daily'.


							<InfTipCom
								className={ cssModObj.helBubSpa }

								labTexStr={ CAD_NAM_OBJ.tipMesFun( 'daily', 'Which days?' ) } // What: Cadence Tip Copy. Why: The tip names the picker's own days control, whose visible label in the picker form is 'Which days?'. How: This passes that label as tipMesFun's own second argument, alongside the daily cadence.
							>?</InfTipCom> // What: Info Tip Component. Why: Only the daily cadence needs this inline explanation of how it interacts with a picker's own Days control. How: This renders the shared "?" bubble, fed by CAD_NAM_OBJ's own tipMesFun copy.


						) }


					</span>

					<span
						key={ norCadObj.cadence }

						className={` ${ cssModObj.fieSubSpa }   ${ cssModObj.fieSubSpaFading } `}
					>{ curSubEle }</span>{ /* What: Field Subtitle Span Element. Why: This is the live human-readable summary of the currently-selected cadence. How: This re-keys, and so re-fades, whenever norCadObj.cadence changes, rendering curSubEle. It also carries the fading modifier class. */ }


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


						<div className={ cssModObj.forFieDiv }>{ /* What: Form Field Div Element. Why: This groups the weekly anchor subsection's controls as one field. How: This renders the field label/summary and the anchor-weekday select below. */ }


							<div className={ cssModObj.fieLabDiv }>{ /* What: Field Label Div Element. Why: The subsection's own label and live summary need to sit together. How: This wraps the label span and the plain summary span below. */ }


								<AncLabCom
									cadNamStr='weekly'
									labTexStr='On which day?'
								/>{ /* What: Anchor Label Component. Why: This is the weekly subsection's own plain label, with an inline "?" help bubble. How: This asks "On which day?" and feeds the bubble the weekly cadence's tip. */ }



								<span className={ cssModObj.fieSubSpa }>surfaces <strong>every { DAY_FUL_ARR[ norCadObj.anchorDow ] }</strong></span>{ /* What: Field Subtitle Span Element. Why: This is the plain summary of which weekday the picker surfaces on. How: This names norCadObj's own anchorDow, looked up in DAY_FUL_ARR. */ }


							</div>



							<div className={ cssModObj.fieRowDiv }>{ /* What: Field Row Div Element. Why: The anchor-weekday select reads best inline with its own leading word. How: This wraps the "Every" span and the weekday select below. */ }


								<span>Every</span>{ /* What: Every Span Element. Why: This is the inline control's own leading word. How: This renders the literal text "Every". */ }



								<DowSelCom
									value={ norCadObj.anchorDow }

									ariLabStr='Anchor weekday'

									onChange={ ( dowValNum ) => setPatFun( { anchorDow : dowValNum } ) }
								/>{ /* What: Day-Of-Week Select Component. Why: This is the actual control for choosing the weekly anchor day. How: This commits the chosen weekday's own index straight through setPatFun. */ }


							</div>


						</div>


					) }




					{ norCadObj.cadence === 'monthly' && ( // What: Monthly Visibility Check. Why: Only the monthly cadence's own anchor subsection belongs here. How: This renders it only while norCadObj.cadence is 'monthly'.


						<div className={ cssModObj.forFieDiv }>{ /* What: Form Field Div Element. Why: This groups the monthly anchor subsection's controls as one field. How: This renders the field label/summary, the Date/Weekday DatModCom, whichever detail row matches it, and a clamp hint. */ }


							<div className={ cssModObj.fieLabDiv }>{ /* What: Field Label Div Element. Why: The subsection's own label and live summary need to sit together. How: This wraps the label span and the fading summary span below. */ }


								<AncLabCom
									cadNamStr='monthly'
									labTexStr='On which day?'
								/>{ /* What: Anchor Label Component. Why: This is the monthly subsection's own plain label, with an inline "?" help bubble. How: This asks "On which day?" and feeds the bubble the monthly cadence's tip. */ }



								<span
									key={ norCadObj.dateMode }

									className={` ${ cssModObj.fieSubSpa }   ${ cssModObj.fieSubSpaFading } `}
								>{ norCadObj.dateMode === 'nthWeekday' ? <>surfaces on the <strong>{ ordSufFun( norCadObj.nthOrdinal ) } { DAY_FUL_ARR[ norCadObj.nthWeekday ] }</strong> of every month</> : <>surfaces the <strong>{ ordSufFun( norCadObj.anchorDom ) } of every month</strong></> }</span>{ /* What: Field Subtitle Span Element. Why: This is the live summary of which day (or nth weekday) the picker surfaces on. How: This re-keys, and so re-fades, whenever norCadObj.dateMode changes, rendering one of the 2 branches. It also carries the fading modifier class. */ }


							</div>



							<DatModCom
								value={ norCadObj.dateMode }

								onChange={ ( modKeyStr ) => setPatFun( { dateMode : modKeyStr } ) }
							/>{ /* What: Date Mode Component. Why: This is the Date-vs-Weekday picker shared by the monthly and yearly subsections. How: This commits the clicked date-mode key straight through setPatFun. */ }



							{ norCadObj.dateMode === 'nthWeekday' ? ( // What: Nth-Weekday Mode Check. Why: The monthly detail row's own shape depends on which date-targeting mode is selected. How: This renders the ordinal-plus-weekday selects while norCadObj.dateMode is 'nthWeekday', the plain day-of-month select otherwise.


								<div className={ cssModObj.fieRowDiv }>{ /* What: Field Row Div Element. Why: The ordinal and weekday selects read best inline with their own leading word. How: This wraps the "On the" span and the 2 selects below. */ }


									<span>On the</span>{ /* What: On The Span Element. Why: This is the inline control's own leading words. How: This renders the literal text "On the". */ }



									<NthSelCom
										dowValNum={ norCadObj.nthWeekday }
										ordValNum={ norCadObj.nthOrdinal }

										onPatChaFun={ setPatFun }
									/>{ /* What: Nth Select Component. Why: These are the actual controls for choosing which occurrence of which weekday to target. How: This renders the ordinal and weekday selects, committing each change straight through setPatFun. */ }


								</div>


							) : ( // What: Plain Date Mode Branch. Why: The default mode just needs the plain day-of-month select instead. How: This renders the else branch, taken while norCadObj.dateMode isn't 'nthWeekday'.


								<div className={ cssModObj.fieRowDiv }>{ /* What: Field Row Div Element. Why: The anchor-day-of-month select reads best inline with its own leading word. How: This wraps the "On the" span and the day-of-month select below. */ }


									<span>On the</span>{ /* What: On The Span Element. Why: This is the inline control's own leading words. How: This renders the literal text "On the". */ }



									<DomSelCom
										dayCouNum={ 31 }
										value={ norCadObj.anchorDom }

										ariLabStr='Anchor day of month'

										onChange={ ( dayValNum ) => setPatFun( { anchorDom : dayValNum } ) }
									/>{ /* What: Day-Of-Month Select Component. Why: This is the actual control for choosing the monthly anchor day. How: This offers the 1st through the 31st and commits the chosen day straight through setPatFun. */ }


								</div>


							) }

							{ norCadObj.dateMode === 'nthWeekday' // What: Clamp Hint Mode Check. Why: Each date mode has its own clamp edge case to warn about. How: This picks the nth-weekday hint while norCadObj.dateMode is 'nthWeekday', the plain-date hint otherwise.
								? norCadObj.nthOrdinal === 5 && <p className={ cssModObj.fieHinPar }>In months without a 5th, this falls on the 4th instead.</p> // What: Field Hint Paragraph Element. Why: A requested 5th occurrence silently falls back to the 4th, which the user needs to know about. How: This renders only while norCadObj.nthOrdinal is exactly 5.
								: norCadObj.anchorDom > 28 && <p className={ cssModObj.fieHinPar }>In shorter months this falls on the last day.</p>             // What: Field Hint Paragraph Element. Why: A day past 28 can silently clamp in a shorter month, which the user needs to know about. How: This renders only while norCadObj.anchorDom is past 28.
							}


						</div>


					) }




					{ norCadObj.cadence === 'yearly' && ( // What: Yearly Visibility Check. Why: Only the yearly cadence's own anchor subsection belongs here. How: This renders it only while norCadObj.cadence is 'yearly'.


						<div className={ cssModObj.forFieDiv }>{ /* What: Form Field Div Element. Why: This groups the yearly anchor subsection's controls as one field. How: This renders the field label/summary, the Date/Weekday DatModCom, whichever detail row matches it, and a clamp hint. */ }


							<div className={ cssModObj.fieLabDiv }>{ /* What: Field Label Div Element. Why: The subsection's own label and live summary need to sit together. How: This wraps the label span and the fading summary span below. */ }


								<AncLabCom
									cadNamStr='yearly'
									labTexStr='On which date?'
								/>{ /* What: Anchor Label Component. Why: This is the yearly subsection's own plain label, with an inline "?" help bubble. How: This asks "On which date?" and feeds the bubble the yearly cadence's tip. */ }



								<span
									key={ norCadObj.dateMode }

									className={` ${ cssModObj.fieSubSpa }   ${ cssModObj.fieSubSpaFading } `}
								>{ norCadObj.dateMode === 'nthWeekday' ? <>surfaces the <strong>{ ordSufFun( norCadObj.nthOrdinal ) } { DAY_FUL_ARR[ norCadObj.nthWeekday ] }</strong> of <strong>{ MON_FUL_ARR[ norCadObj.anchorMonth - 1 ] }</strong>, every year</> : <>surfaces <strong>every { MON_FUL_ARR[ norCadObj.anchorMonth - 1 ] } { ordSufFun( Math.min( norCadObj.anchorDay, dayCouFun( norCadObj.anchorMonth ) ) ) }</strong></> }</span>{ /* What: Field Subtitle Span Element. Why: This is the live summary of which date (or nth weekday of month) the picker surfaces on. How: This re-keys, and so re-fades, whenever norCadObj.dateMode changes, rendering one of the 2 branches. It also carries the fading modifier class. */ }


							</div>



							<DatModCom
								value={ norCadObj.dateMode }

								onChange={ ( modKeyStr ) => setPatFun( { dateMode : modKeyStr } ) }
							/>{ /* What: Date Mode Component. Why: This is the Date-vs-Weekday picker shared by the monthly and yearly subsections. How: This commits the clicked date-mode key straight through setPatFun. */ }



							{ norCadObj.dateMode === 'nthWeekday' ? ( // What: Nth-Weekday Mode Check. Why: The yearly detail row's own shape depends on which date-targeting mode is selected. How: This renders the ordinal-plus-weekday-plus-month selects while norCadObj.dateMode is 'nthWeekday', the plain month-plus-day selects otherwise.


								<div className={ cssModObj.fieRowDiv }>{ /* What: Field Row Div Element. Why: The ordinal, weekday, and month selects read best inline together. How: This wraps all 3 selects below. */ }


									<NthSelCom
										dowValNum={ norCadObj.nthWeekday }
										ordValNum={ norCadObj.nthOrdinal }

										onPatChaFun={ setPatFun }
									/>{ /* What: Nth Select Component. Why: These are the actual controls for choosing which occurrence of which weekday to target. How: This renders the ordinal and weekday selects, committing each change straight through setPatFun. */ }



									<span>of</span>{ /* What: Of Span Element. Why: This is the inline control's own connecting word between the weekday and month selects. How: This renders the literal text "of". */ }



									<MonSelCom
										value={ norCadObj.anchorMonth }

										onChange={ ( monValNum ) => setPatFun( { anchorMonth : monValNum } ) }
									/>{ /* What: Month Select Component. Why: This is the actual control for choosing the yearly anchor month. How: This commits the chosen month's own 1-indexed number straight through setPatFun. */ }


								</div>


							) : ( // What: Plain Date Mode Branch. Why: The default mode just needs the plain month-and-day selects instead. How: This renders the else branch, taken while norCadObj.dateMode isn't 'nthWeekday'.


								<div className={ cssModObj.fieRowDiv }>{ /* What: Field Row Div Element. Why: The anchor-month and anchor-day selects read best inline with their own leading word. How: This wraps the "Every" span and the 2 selects below. */ }


									<span>Every</span>{ /* What: Every Span Element. Why: This is the inline control's own leading word. How: This renders the literal text "Every". */ }



									<MonSelCom
										value={ norCadObj.anchorMonth }

										onChange={ ( monValNum ) => setPatFun( { anchorMonth : monValNum } ) }
									/>{ /* What: Month Select Component. Why: This is the actual control for choosing the yearly anchor month. How: This commits the chosen month's own 1-indexed number straight through setPatFun. */ }



									<DomSelCom
										dayCouNum={ dayCouFun( norCadObj.anchorMonth ) } // What: Anchor Month Day Count. Why: The yearly anchor day can't run past the anchor month's own real length. How: This offers as many days as dayCouFun gives the anchor month.
										value={ Math.min( norCadObj.anchorDay, dayCouFun( norCadObj.anchorMonth ) ) } // What: Clamped Anchor Day Value. Why: A stored anchor day can outlast a month change (e.g. the 31st after switching to April), which would leave the select with no matching option. How: This shows the anchor day capped at the anchor month's own day count.

										ariLabStr='Anchor day'

										onChange={ ( dayValNum ) => setPatFun( { anchorDay : dayValNum } ) }
									/>{ /* What: Day-Of-Month Select Component. Why: This is the actual control for choosing the yearly anchor day, clamped to whatever the anchor month's own real length allows. How: This commits the chosen day straight through setPatFun. */ }


								</div>


							) }

							{ norCadObj.dateMode === 'nthWeekday' // What: Clamp Hint Mode Check. Why: Each date mode has its own clamp edge case to warn about. How: This picks the nth-weekday hint while norCadObj.dateMode is 'nthWeekday', the leap-day hint otherwise.
								? norCadObj.nthOrdinal === 5 && <p className={ cssModObj.fieHinPar }>In years where that month has no 5th, this falls on the 4th instead.</p>            // What: Field Hint Paragraph Element. Why: A requested 5th occurrence silently falls back to the 4th, which the user needs to know about. How: This renders only while norCadObj.nthOrdinal is exactly 5.
								: norCadObj.anchorMonth === 2 && norCadObj.anchorDay === 29 && <p className={ cssModObj.fieHinPar }>In common (non-leap) years this falls on Feb 28.</p> // What: Field Hint Paragraph Element. Why: Feb 29 silently clamps to Feb 28 in a common year, which the user needs to know about. How: This renders only while the anchor month and day are exactly Feb 29.
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

export { CAD_OPT_ARR, CadConCom }; // What: Named Exports. Why: The editor component and its option list are shared by name. How: This exports the component and the option array by name.

// #endregion Exports


