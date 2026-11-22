


// #region Imports

import cssModObj from './style-radio.module.css'; // What: CSS Module Object. Why: The style radio list is styled from its own module. How: This maps each class name in style-radio.module.css to its hashed module class.

// #endregion Imports



/**
 * style-radio.tsx = Style Radio
 *
 * @summary
 * A named-style radio list shared by Appearance's Picker animation and
 * Completion celebration pickers: StyRadCom mirrors the Data tab's full-bleed
 * radio rows (a dot, a name, and a hint that expands only on the selected
 * row), so these style pickers look and behave like the rest of the app.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

type SrcProTyp = { groLabStr : string, groNamStr : string, onChange : ( optValStr : string ) => void, onPreStyFun? : ( optValStr : string ) => void, radOptArr : { hinStr : string, labStr : string, valStr : string }[], value : string }; // What: Style-Radio-Component Props Type. Why: A style list picks one option, with an optional live preview per row. How: This types StyRadCom's props.

// #region StyRadCom

/**
 * StyRadCom = Style Radio Component
 *
 * @summary
 * A named-style radio list (used for both the Picker animation and Completion
 * celebration pickers), mirroring the full-bleed radio rows the Data tab's
 * picker-mode selector uses (a dot, a name, and a hint that expands only on
 * the selected row), so Appearance's style pickers look and behave
 * consistently with the rest of the app rather than introducing a new control
 * pattern.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.groLabStr   - Group Label String: The group's own accessible
 *                            name, applied to a visually-hidden legend since
 *                            the section's real heading, just above and
 *                            outside this component, already shows the same
 *                            text.
 * @param props.groNamStr   - Group Name String: The native radio group's own
 *                            `name` attribute, keeping its rows mutually
 *                            exclusive.
 * @param props.onChange    - On Change: Selects a new option; the exact
 *                            standard name, left as-is.
 * @param props.onPreStyFun - On Preview Style Function: Plays a live preview
 *                            of one option's own style; omit to hide every
 *                            row's own Preview button entirely.
 * @param props.radOptArr   - Radio Option Array: The list of { valStr,
 *                            labStr, hinStr } options to render, one row
 *                            each.
 * @param props.value       - Value: The currently-selected option's own
 *                            value.
 *
 * @returns A fieldset wrapping one radio row per entry in radOptArr,
 * each with an optional Preview button.
 *
 * @example
 * ```tsx
 * StyRadCom({ groLabStr, groNamStr, ... }) // => <StyRadCom />
 * ```
 *
*/

function StyRadCom ( { groLabStr, groNamStr, onChange, onPreStyFun, radOptArr, value } : SrcProTyp ) : React.JSX.Element {


	return (


		<fieldset className={ cssModObj.styRadFie }>{ /* What: Style Radio Fieldset Element. Why: A native radio group needs a real fieldset/legend pairing for assistive tech, even though the legend itself stays visually hidden. How: This wraps the visually-hidden legend and the radio rows below. */ }{ /* A dedicated wrapper fieldset rather than making modRadDiv itself a fieldset, so the reset applies only to this list. The legend is visually hidden, since the section's own visible heading, just above and outside this StyRadCom, already shows the same text. */ }


			<legend className={ cssModObj.styRadLeg }>{ groLabStr }</legend>{ /* What: Style Radio Legend Element. Why: The group still needs a real accessible name, even with no visible legend text. How: This renders groLabStr, hidden visually but still exposed to assistive tech. */ }

			<div className={ cssModObj.modRadDiv }>{ /* What: Mode Radio Div Element. Why: The rows need their own shared layout wrapper, styled like the Data tab's picker-mode selector. How: This maps radOptArr into one label/row per option. */ }


				{ radOptArr.map( ( optCurObj ) => { // What: Radio Option Map. Why: One full-bleed row is needed per entry in radOptArr. How: This maps radOptArr, deriving each row's own selected state before rendering it.


					const optSelBoo = optCurObj.valStr === value; // What: Option Selected Boolean. Why: A row's own selected style and its hint's expanded state both depend on whether this is the currently-chosen option. How: This is true only when this option's own value matches the selected value.



					return (


						<label
							key={ optCurObj.valStr }

							className={ cssModObj.modOptLab }

							data-option-select-active={ optSelBoo || undefined } // What: Option Select Active Attribute. Why: The selected row is tinted and marked by its module, and a label has no aria state of its own to key that off. How: This sets the presence-only attribute while optSelBoo is true and removes it otherwise.
						>{ /* What: Mode Option Label Element. Why: The native radio input, the dot, and the name/hint text all need to sit inside one clickable label. How: This wraps the hidden radio input, the visual dot, the name/hint block, and (optionally) a Preview button. */ }


							<input
								className={ cssModObj.modOptInp }

								name={ groNamStr }

								checked={ optSelBoo }
								type='radio'

								onChange={ () => onChange( optCurObj.valStr ) }
							/>{ /* What: Mode Option Input Element. Why: This is the actual native control backing the row's own selected state. How: This is checked while optSelBoo is true and selects this option's value on change. */ }

							<span
								className={ cssModObj.modDotSpa }

								aria-hidden='true'
							></span>{ /* What: Mode Dot Span Element. Why: The visual selected/unselected indicator is a styled dot, not the native radio's own default appearance. How: This is purely decorative, styled by its module off the parent label's own data-option-select-active attribute. */ }



							<span className={ cssModObj.modTexSpa }>{ /* What: Mode Text Span Element. Why: The option's own name and its expanding hint need their own grouping. How: This wraps the name span and the always-mounted hint collapse below. */ }


								<span className={ cssModObj.modNamSpa }>{ optCurObj.labStr }</span>{ /* What: Mode Name Span Element. Why: Every row needs its own visible option name. How: This renders optCurObj's own labStr. */ }


								<div
									className={ cssModObj.colDisDiv }

									data-collapse-open-active={ optSelBoo || undefined } // What: Collapse Open Active Attribute. Why: Only the selected row's hint should be open, and its module keys the open state off this attribute. How: This sets the presence-only attribute while optSelBoo is true and removes it otherwise.
								>{ /* What: Collapse Disclosure Div Element. Why: The hint text needs to expand/collapse in place without ever unmounting, so its own height transition can actually animate. How: This sets its own data-collapse-open-active attribute from optSelBoo, driving a CSS grid-template-rows transition. */ }{ /* This collapse stays mounted, so the hint never unmounts and its grid-template-rows glide runs on each selection. */ }


									<div className={ cssModObj.colInnDiv }>{ /* What: Collapse Inner Div Element. Why: The CSS grid-row transition needs an inner wrapper to measure/clip against. How: This wraps the hint span inside the collapsing region. */ }


										<span className={ cssModObj.modHinSpa }>{ optCurObj.hinStr }</span>{ /* What: Mode Hint Span Element. Why: Every row needs its own explanatory hint, shown only while selected. How: This renders optCurObj's own hinStr. */ }


									</div>


								</div>


							</span>



							{ onPreStyFun && ( // What: Preview Button Check. Why: The Preview button is optional. How: This renders the button only while the caller actually passed an onPreStyFun handler.


								<button
									className={ cssModObj.styPreBut }

									type='button'

									onClick={ ( cliEveObj ) => { // What: Preview Click Handler. Why: Pressing Preview must play the style and nothing else. How: This cancels the click's default, then plays the style.


										cliEveObj.preventDefault(); // What: Default Prevention Call. Why: Pressing Preview should only play the style. How: This cancels the click's own default action.

										onPreStyFun( optCurObj.valStr ); // What: Style Preview Call. Why: This is the actual preview trigger. How: This calls onPreStyFun with this option's own valStr.


									} }
								>Preview</button> // What: Style Preview Button Element. Why: This is the actual control that plays a live preview of this specific option's own style. How: This cancels the click's default, then calls onPreStyFun with this option's own value.


							) }


						</label>


					);


				} ) }


			</div>


		</fieldset>


	);


}

// #endregion StyRadCom

// #endregion Components



// #region Exports

export { StyRadCom }; // What: Named Export. Why: The style radio list is this file's one public binding. How: This exports StyRadCom by name.

// #endregion Exports


