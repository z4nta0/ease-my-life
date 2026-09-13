


// #region Imports

import { CADENCE   } from './cadence.js';     // What: Cadence. Why: Every cadence field this component reads or writes (mode, anchors, dateMode, nthOrdinal, nthWeekday) is normalized and summarized through this one domain namespace instead of duplicating that logic locally. How: This is called below for its own normalize and tipFor entries.
import { Collapse  } from './ui.jsx';         // What: Collapse. Why: The anchor subsection needs to animate open and closed as the selected cadence changes, instead of snapping. How: This wraps the whole non-daily anchor block below, gated on the current cadence.
import { InfoTip   } from './ui.jsx';         // What: Info Tip. Why: Every cadence row's own "?" control needs an explanatory tooltip beside its label. How: This is rendered once per cadence row below, fed by CADENCE's own tipFor copy.
import { Segmented } from './reminders.jsx';  // What: Segmented. Why: The top-level cadence picker and the monthly/yearly Date-vs-Weekday picker both need the same animated segmented control. How: This is rendered once for the cadence choice and once more inside each of the monthly and yearly subsections.

// #endregion Imports



/**
 * cadence-control.jsx = Cadence Control
 *
 * @summary
 * CadConCom is the shared editor for a single picker's own
 * surfacing cadence (daily, weekly, monthly, or yearly) plus whichever
 * anchor fields that cadence needs: an anchor weekday for weekly, an
 * anchor day of month for monthly, or an anchor month and day for
 * yearly, either one further switchable to an nth-weekday rule (e.g.
 * "the 2nd Tuesday") for monthly and yearly. It is rendered in both the
 * picker create-flow (tab-picker.jsx) and the Data tab's own picker
 * controls (tab-data.jsx), committing every change through a single
 * onChange(patch) callback; the caller owns the actual persisted
 * value and decides how a patch gets merged into it. Reuses the
 * Segmented control and the Reminders scheduling styles (rem-*, cad-*)
 * rather than defining its own.
 *
 * The exported CadConCom name and its own value/onChange props are
 * a cross-file contract read directly by tab-picker.jsx, and stay
 * unrenamed for that reason, the same way reminders.jsx's own Segmented
 * options/value/onChange/ariaLabel/describedBy props were left
 * unrenamed. CAD_OPT_ARR (originally named CAD_OPTS) was also read by
 * tab-data.jsx, but was renamed anyway with tab-data.jsx's own import
 * and usage updated to match in the same pass, since the array's own
 * property names (key/label/sub) still follow no naming rule at all and
 * this rename at least gets its own binding name compliant. This
 * collided in name only (not at runtime, separate modules) with
 * cadence.js's own unrelated CAD_OPT_ARR, a flat array of cadence
 * value strings; that one was renamed to CAD_STR_ARR to resolve it.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



const CAD_OPT_ARR = [ // What: Cadence Options Array. Why: The top-level cadence picker below needs one option per cadence, each carrying its own live sub-explanation; tab-data.jsx also reads this same array directly for its own cadence-summary lookup. How: This is passed as the top Segmented's own options prop below.


	{


		keyStr : 'daily',                                                                 // What: Key String. Why: This is the value the top Segmented compares against norCadObj.cadence and writes back on selection. How: Segmented reads this against value and passes it to onChange.
		labStr : 'Daily',                                                                 // What: Label String. Why: This is the segmented control's own visible button text for this option. How: Segmented renders this as the button's own text content.
		subEle : <>surfaces <strong>every day</strong> it runs (the standard behavior)</> // What: Sub Element. Why: This is the live sub-explanation shown under the cadence picker while 'daily' is selected. How: CadConCom looks this up by norCadObj.cadence and renders it as curSubEle.


	},

	{


		keyStr : 'weekly',                                                                                                                                // What: Key String. Why: This is the value the top Segmented compares against norCadObj.cadence and writes back on selection. How: Segmented reads this against value and passes it to onChange.
		labStr : 'Weekly',                                                                                                                                // What: Label String. Why: This is the segmented control's own visible button text for this option. How: Segmented renders this as the button's own text content.
		subEle : <>surfaces <strong>once a week</strong>, on the weekday you choose below, after which the pick will persist until marked as completed</> // What: Sub Element. Why: This is the live sub-explanation shown under the cadence picker while 'weekly' is selected. How: CadConCom looks this up by norCadObj.cadence and renders it as curSubEle.


	},

	{


		keyStr : 'monthly',                                                                                                                            // What: Key String. Why: This is the value the top Segmented compares against norCadObj.cadence and writes back on selection. How: Segmented reads this against value and passes it to onChange.
		labStr : 'Monthly',                                                                                                                            // What: Label String. Why: This is the segmented control's own visible button text for this option. How: Segmented renders this as the button's own text content.
		subEle : <>surfaces <strong>once a month</strong>, on the day you choose below, after which the pick will persist until marked as completed</> // What: Sub Element. Why: This is the live sub-explanation shown under the cadence picker while 'monthly' is selected. How: CadConCom looks this up by norCadObj.cadence and renders it as curSubEle.


	},

	{


		keyStr : 'yearly',                                                                                                                             // What: Key String. Why: This is the value the top Segmented compares against norCadObj.cadence and writes back on selection. How: Segmented reads this against value and passes it to onChange.
		labStr : 'Yearly',                                                                                                                             // What: Label String. Why: This is the segmented control's own visible button text for this option. How: Segmented renders this as the button's own text content.
		subEle : <>surfaces <strong>once a year</strong>, on the date you choose below, after which the pick will persist until marked as completed</> // What: Sub Element. Why: This is the live sub-explanation shown under the cadence picker while 'yearly' is selected. How: CadConCom looks this up by norCadObj.cadence and renders it as curSubEle.


	}


];



const DAT_MOD_ARR = [ // What: Date Mode Array. Why: The monthly and yearly subsections below both offer the same Date-vs-Weekday choice, driven by one shared Segmented control. How: This is passed as that Segmented's own options prop in both subsections below.


	{ keyStr : 'date',       labStr : 'Date' },   // What: Key String. Why: This is the default day-of-month/day targeting mode's own value. How: Segmented compares this against the current dateMode and writes it back on selection. // What: Label String. Why: This is the segmented control's own visible button text for this option. How: Segmented renders this as the button's own text content.
	{ keyStr : 'nthWeekday', labStr : 'Weekday' } // What: Key String. Why: This lets the user target e.g. "the 2nd Tuesday" instead of a fixed day number. How: Segmented compares this against the current dateMode and writes it back on selection. // What: Label String. Why: This is the segmented control's own visible button text for this option. How: Segmented renders this as the button's own text content.


];



const DAY_FUL_ARR = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];                                             // What: Day Full Array. Why: The weekly, monthly, and yearly subsections below all need the full weekday name, in both their own select options and their own live summaries. How: This is indexed by anchorDow/nthWeekday throughout CadConCom below.
const MON_FUL_ARR = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]; // What: Month Full Array. Why: The yearly subsection's own month select and live summary both need the full month name to display. How: This is indexed by anchorMonth (1-indexed, so minus 1) throughout the yearly subsection below.



const ordSufFun = ( ordValNum ) => { // What: Ordinal Suffix Function. Why: Every day-of-month, week-ordinal, and weekday-of-month summary below needs the correct English ordinal suffix appended to a plain number. How: This picks the right suffix off ordValNum's own last two digits and returns the combined string.


	const sufTxtArr = [ 'th', 'st', 'nd', 'rd' ]; // What: Suffix Text Array. Why: Every English ordinal suffix boils down to one of just these 4 words. How: This is indexed below by lasTwoNum's own value.
	const lasTwoNum = ordValNum % 100;            // What: Last Two Number. Why: English ordinal suffixes are decided by a number's own last two digits (11th/12th/13th are the exception every other rule must respect). How: This is ordValNum modulo 100.


	return ordValNum + ( sufTxtArr[ ( lasTwoNum - 20 ) % 10 ] || sufTxtArr[ lasTwoNum ] || sufTxtArr[ 0 ] ); // What: Ordinal Suffix Return. Why: The caller needs the full suffixed string back, not just the suffix. How: This picks sufTxtArr's own entry for lasTwoNum minus 20 (handling 21st/22nd/23rd/31st/...), falling back to lasTwoNum directly (handling 11th/12th/13th), falling back to index 0 ('th') for everything else.


};



const dayCouFun = ( monOneNum ) => new Date( 2024, monOneNum, 0 ).getDate(); // What: Day Count Function. Why: The yearly subsection's day-of-month select always needs to allow day 29 for February, regardless of the real current year. How: This asks for day 0 of the month after monOneNum in a fixed leap year (2024), which JS's own Date resolves back to that month's own real last day.



// #region CadConCom

/**
 * CadConCom = Cadence Control Component
 *
 * @summary
 * See this file's own header comment above for the full picture of
 * what this component renders and where it is reused. In short: a
 * cadence picker (Daily/Weekly/Monthly/Yearly) plus, for every mode
 * but daily, whichever anchor subsection matches the selected mode,
 * animated open and closed via Collapse as the mode itself changes.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.value    - The picker's own persisted cadence value
 *                        (or an in-progress draft), normalized on
 *                        every render via CADENCE.normalize.
 * @param props.onChange - Called with a patch object whenever any
 *                        cadence field changes; the caller owns how
 *                        the patch gets merged into its own storage.
 *
 * @returns The full cadence editor: the cadence picker plus, for
 * every mode but daily, the matching anchor subsection inside an
 * animated Collapse.
 *
 * @example
 * ```tsx
 * CadConCom({ value, onChange }) // => <CadConCom />
 * ```
 *
*/

function CadConCom ( { value, onChange } ) {


	const norCadObj = CADENCE.normalize( value || {} );                                                             // What: Normalized Cadence Object. Why: Every field read throughout this component needs a fully-defaulted cadence value, not a possibly-partial draft. How: This calls CADENCE.normalize against the caller's own value, falling back to an empty object for a brand-new draft.
	const setPatFun = ( patObj ) => onChange( patObj );                                                             // What: Set Patch Function. Why: Every field editor below needs one shared way to forward a partial change up to the caller. How: This calls onChange directly with whatever patch object it is given.
	const curSubEle = ( CAD_OPT_ARR.find( ( optConObj ) => optConObj.keyStr === norCadObj.cadence ) || {} ).subEle; // What: Current Sub Element. Why: The cadence picker's own live sub-explanation needs whichever CAD_OPT_ARR entry matches the currently-selected cadence. How: This looks up norCadObj's own cadence in CAD_OPT_ARR and reads that entry's own subEle field.



	return (


		<div className='cad-ctl'>{ /* What: Controls Container Div Element. Why: This is CadConCom's own root element, holding the cadence picker and, for every mode but daily, the matching anchor subsection. How: This renders as a plain div; every field below commits through setPatFun. */ }


			<div className='rem-field'>{ /* What: Cadence Field Div Element. Why: This groups the cadence picker's own label and its own Segmented control as one field, matching the Reminders editor's own field layout. How: This wraps the flabel-wrap block and the top Segmented below. */ }


				<div className='rem-flabel-wrap'>{ /* What: Flabel Wrap Div Element. Why: The field's own label and live summary need to sit together as one visual unit. How: This wraps the label span and the fading summary span below. */ }


					<span className='rem-flabel pie-lbl-row'>{ /* What: How Often Label Span Element. Why: This is the cadence field's own plain label, with an inline "?" help bubble on the daily mode. How: This renders the literal text "How often?" followed by the conditional InfoTip below. */ }


						How often?
						{ norCadObj.cadence === 'daily' && (


							<InfoTip
								className='pie-help pie-help--sm'
								label={ CADENCE.tipFor( 'daily', 'Which days?' ) }
							>?</InfoTip> // What: Info Tip. Why: Only the daily cadence needs this inline explanation of how it interacts with a picker's own Days control. How: This renders the shared "?" bubble, fed by CADENCE's own tipFor copy.


						) }


					</span>

					<span
						key={ norCadObj.cadence }
						className='rem-flabel-sub set-sub-fade'
					>{ curSubEle }</span>{ /* What: Cadence Sub Span Element. Why: This is the live human-readable summary of the currently-selected cadence. How: This re-keys, and so re-fades, whenever norCadObj.cadence changes, rendering curSubEle. */ }


				</div>


				<Segmented
					options={ CAD_OPT_ARR }
					value={ norCadObj.cadence }
					ariaLabel='Cadence'
					onChange={ ( cadKeyStr ) => setPatFun( { cadence : cadKeyStr } ) }
				/>{ /* What: Segmented. Why: This is the actual top-level cadence picker. How: This commits the clicked cadence key straight through setPatFun. */ }


			</div>

			<Collapse open={ norCadObj.cadence !== 'daily' }>{ /* What: Anchor Collapse Element. Why: Only a non-daily cadence has any anchor subsection at all to show. How: This animates the whole anchor block below open only while norCadObj.cadence isn't 'daily'. */ }


				<div
					key={ norCadObj.cadence }
					className='cad-anchor-fade'
				>{ /* What: Anchor Fade Div Element. Why: The anchor subsection should fade in and out as a unit whenever the selected cadence itself changes. How: This re-keys, and so re-fades, whenever norCadObj.cadence changes, wrapping whichever of the 3 subsections below actually matches it. */ }


					{ norCadObj.cadence === 'weekly' && (


						<div className='rem-field'>{ /* What: Weekly Field Div Element. Why: This groups every weekly-specific control as one anchor subsection. How: This renders the field label/summary and the anchor-weekday select below. */ }


							<div className='rem-flabel-wrap'>{ /* What: Flabel Wrap Div Element. Why: The subsection's own label and live summary need to sit together. How: This wraps the label span and the plain summary span below. */ }


								<span className='rem-flabel pie-lbl-row'>{ /* What: On Which Day Label Span Element. Why: This is the weekly subsection's own plain label, with an inline "?" help bubble. How: This renders the literal text "On which day?" followed by the InfoTip below. */ }


									On which day?
									<InfoTip
										className='pie-help'
										label={ CADENCE.tipFor( 'weekly', 'Which days?' ) }
									>?</InfoTip>{ /* What: Info Tip. Why: The weekly cadence's own anchor day interacts with a picker's own Days control, which needs explaining. How: This renders the shared "?" bubble, fed by CADENCE's own tipFor copy. */ }


								</span>

								<span className='rem-flabel-sub'>surfaces <strong>every { DAY_FUL_ARR[ norCadObj.anchorDow ] }</strong></span>{ /* What: Weekly Sub Span Element. Why: This is the plain summary of which weekday the picker surfaces on. How: This names norCadObj's own anchorDow, looked up in DAY_FUL_ARR. */ }


							</div>


							<div className='rem-inline'>{ /* What: Weekly Inline Div Element. Why: The anchor-weekday select reads best inline with its own leading word. How: This wraps the "Every" span and the weekday select below. */ }


								<span>Every</span>{ /* What: Every Span Element. Why: This is the inline control's own leading word. How: This renders the literal text "Every". */ }

								<select
									className='np-input rem-sel'
									value={ norCadObj.anchorDow }
									aria-label='Anchor weekday'
									onChange={ ( chaEveObj ) => setPatFun( { anchorDow : parseInt( chaEveObj.target.value ) } ) }
								>{ /* What: Anchor Weekday Select Element. Why: This is the actual control for choosing the weekly anchor day. How: This commits the chosen weekday's own index straight through setPatFun. */ }


									{ DAY_FUL_ARR.map( ( dayNamStr, dowIndNum ) => (


										<option
											key={ dowIndNum }
											value={ dowIndNum }
										>{ dayNamStr }</option> // What: Weekday Option Element. Why: One option is needed per real weekday. How: This renders dayNamStr, valued by its own dowIndNum.


									) ) }


								</select>


							</div>


						</div>


					) }

					{ norCadObj.cadence === 'monthly' && (


						<div className='rem-field'>{ /* What: Monthly Field Div Element. Why: This groups every monthly-specific control as one anchor subsection. How: This renders the field label/summary, the Date/Weekday Segmented, whichever detail row matches it, and a clamp hint. */ }


							<div className='rem-flabel-wrap'>{ /* What: Flabel Wrap Div Element. Why: The subsection's own label and live summary need to sit together. How: This wraps the label span and the fading summary span below. */ }


								<span className='rem-flabel pie-lbl-row'>{ /* What: On Which Day Label Span Element. Why: This is the monthly subsection's own plain label, with an inline "?" help bubble. How: This renders the literal text "On which day?" followed by the InfoTip below. */ }


									On which day?
									<InfoTip
										className='pie-help'
										label={ CADENCE.tipFor( 'monthly', 'Which days?' ) }
									>?</InfoTip>{ /* What: Info Tip. Why: The monthly cadence's own anchor day interacts with a picker's own Days control, which needs explaining. How: This renders the shared "?" bubble, fed by CADENCE's own tipFor copy. */ }


								</span>

								<span
									key={ norCadObj.dateMode }
									className='rem-flabel-sub set-sub-fade'
								>{ norCadObj.dateMode === 'nthWeekday' ? <>surfaces on the <strong>{ ordSufFun( norCadObj.nthOrdinal ) } { DAY_FUL_ARR[ norCadObj.nthWeekday ] }</strong> of every month</> : <>surfaces the <strong>{ ordSufFun( norCadObj.anchorDom ) } of every month</strong></> }</span>{ /* What: Monthly Sub Span Element. Why: This is the live summary of which day (or nth weekday) the picker surfaces on. How: This re-keys, and so re-fades, whenever norCadObj.dateMode changes, rendering one of the 2 branches. */ }


							</div>


							<Segmented
								options={ DAT_MOD_ARR }
								value={ norCadObj.dateMode }
								ariaLabel='Day selection'
								onChange={ ( modKeyStr ) => setPatFun( { dateMode : modKeyStr } ) }
							/>{ /* What: Segmented. Why: This is the Date-vs-Weekday picker shared by the monthly and yearly subsections. How: This commits the clicked date-mode key straight through setPatFun. */ }

							{ norCadObj.dateMode === 'nthWeekday' ? ( // What: Nth-Weekday Mode Check. Why: The monthly detail row's own shape depends on which date-targeting mode is selected. How: This renders the ordinal-plus-weekday selects while norCadObj.dateMode is 'nthWeekday', the plain day-of-month select otherwise.


								<div className='rem-inline'>{ /* What: Monthly Nth-Weekday Inline Div Element. Why: The ordinal and weekday selects read best inline with their own leading word. How: This wraps the "On the" span and the 2 selects below. */ }


									<span>On the</span>{ /* What: On The Span Element. Why: This is the inline control's own leading words. How: This renders the literal text "On the". */ }

									<select
										className='np-input rem-sel'
										value={ norCadObj.nthOrdinal }
										aria-label='Week of the month'
										onChange={ ( chaEveObj ) => setPatFun( { nthOrdinal : parseInt( chaEveObj.target.value ) } ) }
									>{ /* What: Nth Ordinal Select Element. Why: This is the actual control for choosing which occurrence (1st through 5th) of the weekday to target. How: This commits the chosen ordinal straight through setPatFun. */ }


										{ [ 1, 2, 3, 4, 5 ].map( ( ordValNum ) => (


											<option
												key={ ordValNum }
												value={ ordValNum }
											>{ ordSufFun( ordValNum ) }</option> // What: Ordinal Option Element. Why: One option is needed per possible occurrence, 1st through 5th. How: This renders ordSufFun's own suffixed label, valued by ordValNum.


										) ) }


									</select>

									<select
										className='np-input rem-sel'
										value={ norCadObj.nthWeekday }
										aria-label='Weekday'
										onChange={ ( chaEveObj ) => setPatFun( { nthWeekday : parseInt( chaEveObj.target.value ) } ) }
									>{ /* What: Nth Weekday Select Element. Why: This is the actual control for choosing which weekday to target. How: This commits the chosen weekday's own index straight through setPatFun. */ }


										{ DAY_FUL_ARR.map( ( dayNamStr, dowIndNum ) => (


											<option
												key={ dowIndNum }
												value={ dowIndNum }
											>{ dayNamStr }</option> // What: Weekday Option Element. Why: One option is needed per real weekday. How: This renders dayNamStr, valued by its own dowIndNum.


										) ) }


									</select>


								</div>


							) : ( // What: Plain Date Mode Branch. Why: The default mode just needs the plain day-of-month select instead. How: This renders the else branch, taken while norCadObj.dateMode isn't 'nthWeekday'.


								<div className='rem-inline'>{ /* What: Monthly Date Inline Div Element. Why: The anchor-day-of-month select reads best inline with its own leading word. How: This wraps the "On the" span and the day-of-month select below. */ }


									<span>On the</span>{ /* What: On The Span Element. Why: This is the inline control's own leading words. How: This renders the literal text "On the". */ }

									<select
										className='np-input rem-sel'
										value={ norCadObj.anchorDom }
										aria-label='Anchor day of month'
										onChange={ ( chaEveObj ) => setPatFun( { anchorDom : parseInt( chaEveObj.target.value ) } ) }
									>{ /* What: Anchor Day Of Month Select Element. Why: This is the actual control for choosing the monthly anchor day. How: This commits the chosen day-of-month straight through setPatFun. */ }


										{ Array.from( { length : 31 }, ( _, dayIndNum ) => dayIndNum + 1 ).map( ( dayValNum ) => (


											<option
												key={ dayValNum }
												value={ dayValNum }
											>{ ordSufFun( dayValNum ) }</option> // What: Day Of Month Option Element. Why: One option is needed per possible day of month, 1 through 31. How: This renders ordSufFun's own suffixed label, valued by dayValNum.


										) ) }


									</select>


								</div>


							) }
							{ norCadObj.dateMode === 'nthWeekday'

								? norCadObj.nthOrdinal === 5 && <p className='rem-hint'>In months without a 5th, this falls on the 4th instead.</p> // What: Nth-Weekday Clamp Hint Paragraph Element. Why: A requested 5th occurrence silently falls back to the 4th, which the user needs to know about. How: This renders only while norCadObj.nthOrdinal is exactly 5.
								: norCadObj.anchorDom > 28 && <p className='rem-hint'>In shorter months this falls on the last day.</p> } // What: Plain-Date Clamp Hint Paragraph Element. Why: A day past 28 can silently clamp in a shorter month, which the user needs to know about. How: This renders only while norCadObj.anchorDom is past 28.


						</div>


					) }

					{ norCadObj.cadence === 'yearly' && (


						<div className='rem-field'>{ /* What: Yearly Field Div Element. Why: This groups every yearly-specific control as one anchor subsection. How: This renders the field label/summary, the Date/Weekday Segmented, whichever detail row matches it, and a clamp hint. */ }


							<div className='rem-flabel-wrap'>{ /* What: Flabel Wrap Div Element. Why: The subsection's own label and live summary need to sit together. How: This wraps the label span and the fading summary span below. */ }


								<span className='rem-flabel pie-lbl-row'>{ /* What: On Which Date Label Span Element. Why: This is the yearly subsection's own plain label, with an inline "?" help bubble. How: This renders the literal text "On which date?" followed by the InfoTip below. */ }


									On which date?
									<InfoTip
										className='pie-help'
										label={ CADENCE.tipFor( 'yearly', 'Which days?' ) }
									>?</InfoTip>{ /* What: Info Tip. Why: The yearly cadence's own anchor day interacts with a picker's own Days control, which needs explaining. How: This renders the shared "?" bubble, fed by CADENCE's own tipFor copy. */ }


								</span>

								<span
									key={ norCadObj.dateMode }
									className='rem-flabel-sub set-sub-fade'
								>{ norCadObj.dateMode === 'nthWeekday' ? <>surfaces the <strong>{ ordSufFun( norCadObj.nthOrdinal ) } { DAY_FUL_ARR[ norCadObj.nthWeekday ] }</strong> of <strong>{ MON_FUL_ARR[ norCadObj.anchorMonth - 1 ] }</strong>, every year</> : <>surfaces <strong>every { MON_FUL_ARR[ norCadObj.anchorMonth - 1 ] } { ordSufFun( Math.min( norCadObj.anchorDay, dayCouFun( norCadObj.anchorMonth ) ) ) }</strong></> }</span>{ /* What: Yearly Sub Span Element. Why: This is the live summary of which date (or nth weekday of month) the picker surfaces on. How: This re-keys, and so re-fades, whenever norCadObj.dateMode changes, rendering one of the 2 branches. */ }


							</div>


							<Segmented
								options={ DAT_MOD_ARR }
								value={ norCadObj.dateMode }
								ariaLabel='Day selection'
								onChange={ ( modKeyStr ) => setPatFun( { dateMode : modKeyStr } ) }
							/>{ /* What: Segmented. Why: This is the Date-vs-Weekday picker shared by the monthly and yearly subsections. How: This commits the clicked date-mode key straight through setPatFun. */ }

							{ norCadObj.dateMode === 'nthWeekday' ? ( // What: Nth-Weekday Mode Check. Why: The yearly detail row's own shape depends on which date-targeting mode is selected. How: This renders the ordinal-plus-weekday-plus-month selects while norCadObj.dateMode is 'nthWeekday', the plain month-plus-day selects otherwise.


								<div className='rem-inline'>{ /* What: Yearly Nth-Weekday Inline Div Element. Why: The ordinal, weekday, and month selects read best inline together. How: This wraps all 3 selects below. */ }


									<select
										className='np-input rem-sel'
										value={ norCadObj.nthOrdinal }
										aria-label='Week of the month'
										onChange={ ( chaEveObj ) => setPatFun( { nthOrdinal : parseInt( chaEveObj.target.value ) } ) }
									>{ /* What: Nth Ordinal Select Element. Why: This is the actual control for choosing which occurrence (1st through 5th) of the weekday to target. How: This commits the chosen ordinal straight through setPatFun. */ }


										{ [ 1, 2, 3, 4, 5 ].map( ( ordValNum ) => (


											<option
												key={ ordValNum }
												value={ ordValNum }
											>{ ordSufFun( ordValNum ) }</option> // What: Ordinal Option Element. Why: One option is needed per possible occurrence, 1st through 5th. How: This renders ordSufFun's own suffixed label, valued by ordValNum.


										) ) }


									</select>

									<select
										className='np-input rem-sel'
										value={ norCadObj.nthWeekday }
										aria-label='Weekday'
										onChange={ ( chaEveObj ) => setPatFun( { nthWeekday : parseInt( chaEveObj.target.value ) } ) }
									>{ /* What: Nth Weekday Select Element. Why: This is the actual control for choosing which weekday to target. How: This commits the chosen weekday's own index straight through setPatFun. */ }


										{ DAY_FUL_ARR.map( ( dayNamStr, dowIndNum ) => (


											<option
												key={ dowIndNum }
												value={ dowIndNum }
											>{ dayNamStr }</option> // What: Weekday Option Element. Why: One option is needed per real weekday. How: This renders dayNamStr, valued by its own dowIndNum.


										) ) }


									</select>

									<span>of</span>{ /* What: Of Span Element. Why: This is the inline control's own connecting word between the weekday and month selects. How: This renders the literal text "of". */ }

									<select
										className='np-input rem-sel'
										value={ norCadObj.anchorMonth }
										aria-label='Anchor month'
										onChange={ ( chaEveObj ) => setPatFun( { anchorMonth : parseInt( chaEveObj.target.value ) } ) }
									>{ /* What: Anchor Month Select Element. Why: This is the actual control for choosing the yearly anchor month. How: This commits the chosen month's own 1-indexed number straight through setPatFun. */ }


										{ MON_FUL_ARR.map( ( monNamStr, monIndNum ) => (


											<option
												key={ monIndNum }
												value={ monIndNum + 1 }
											>{ monNamStr }</option> // What: Month Option Element. Why: One option is needed per real month. How: This renders monNamStr, valued by its own 1-indexed monIndNum.


										) ) }


									</select>


								</div>


							) : ( // What: Plain Date Mode Branch. Why: The default mode just needs the plain month-and-day selects instead. How: This renders the else branch, taken while norCadObj.dateMode isn't 'nthWeekday'.


								<div className='rem-inline'>{ /* What: Yearly Date Inline Div Element. Why: The anchor-month and anchor-day selects read best inline with their own leading word. How: This wraps the "Every" span and the 2 selects below. */ }


									<span>Every</span>{ /* What: Every Span Element. Why: This is the inline control's own leading word. How: This renders the literal text "Every". */ }

									<select
										className='np-input rem-sel'
										value={ norCadObj.anchorMonth }
										aria-label='Anchor month'
										onChange={ ( chaEveObj ) => setPatFun( { anchorMonth : parseInt( chaEveObj.target.value ) } ) }
									>{ /* What: Anchor Month Select Element. Why: This is the actual control for choosing the yearly anchor month. How: This commits the chosen month's own 1-indexed number straight through setPatFun. */ }


										{ MON_FUL_ARR.map( ( monNamStr, monIndNum ) => (


											<option
												key={ monIndNum }
												value={ monIndNum + 1 }
											>{ monNamStr }</option> // What: Month Option Element. Why: One option is needed per real month. How: This renders monNamStr, valued by its own 1-indexed monIndNum.


										) ) }


									</select>

									<select
										className='np-input rem-sel'
										value={ Math.min( norCadObj.anchorDay, dayCouFun( norCadObj.anchorMonth ) ) }
										aria-label='Anchor day'
										onChange={ ( chaEveObj ) => setPatFun( { anchorDay : parseInt( chaEveObj.target.value ) } ) }
									>{ /* What: Anchor Day Select Element. Why: This is the actual control for choosing the yearly anchor day, clamped to whatever the anchor month's own real length allows. How: This commits the chosen day-of-month straight through setPatFun. */ }


										{ Array.from( { length : dayCouFun( norCadObj.anchorMonth ) }, ( _, dayIndNum ) => dayIndNum + 1 ).map( ( dayValNum ) => (


											<option
												key={ dayValNum }
												value={ dayValNum }
											>{ ordSufFun( dayValNum ) }</option> // What: Anchor Day Option Element. Why: One option is needed per possible day within the anchor month's own real length. How: This renders ordSufFun's own suffixed label, valued by dayValNum.


										) ) }


									</select>


								</div>


							) }
							{ norCadObj.dateMode === 'nthWeekday'

								? norCadObj.nthOrdinal === 5 && <p className='rem-hint'>In years where that month has no 5th, this falls on the 4th instead.</p> // What: Nth-Weekday Clamp Hint Paragraph Element. Why: A requested 5th occurrence silently falls back to the 4th, which the user needs to know about. How: This renders only while norCadObj.nthOrdinal is exactly 5.
								: norCadObj.anchorMonth === 2 && norCadObj.anchorDay === 29 && <p className='rem-hint'>In common (non-leap) years this falls on Feb 28.</p> } // What: Leap-Day Clamp Hint Paragraph Element. Why: Feb 29 silently clamps to Feb 28 in a common year, which the user needs to know about. How: This renders only while the anchor month and day are exactly Feb 29.


						</div>


					) }


				</div>


			</Collapse>


		</div>


	);


}

// #endregion CadConCom



export { CadConCom, CAD_OPT_ARR };


