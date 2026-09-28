


/**
 * style-radio.jsx = Style Radio
 *
 * @summary
 * A named-style radio list shared by Appearance's Picker animation and
 * Completion celebration pickers: StyRadCom reuses the Data tab's own
 * full-bleed radio rows (a dot, a name, and a hint that expands only on the
 * selected row), so these style pickers look and behave like the rest of the
 * app.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

// #region StyRadCom

/**
 * StyRadCom = Style Radio Component
 *
 * @summary
 * A named-style radio list (used for both the Picker animation and
 * Completion celebration pickers), reusing the exact same full-bleed
 * radio rows the Data tab's picker-mode selector uses (a dot, a name,
 * and a hint that expands only on the selected row), so Appearance's
 * style pickers look and behave consistently with the rest of the app
 * rather than introducing a new control pattern.
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

function StyRadCom ( { groLabStr, groNamStr, onChange, onPreStyFun, radOptArr, value } ) {


	return (


		<fieldset className='style-radio-fieldset'>{ /* What: Style Radio Fieldset Element. Why: A native radio group needs a real fieldset/legend pairing for assistive tech, even though the legend itself stays visually hidden. How: This wraps the visually-hidden legend and the radio rows below. */ }{ /* A dedicated wrapper fieldset (rather than making .rd-mode-radio itself a fieldset) since that class is shared with the Data tab's picker-mode list, which renders it as a plain div nested inside its own fieldset, so this reset is scoped to just this usage. The legend is visually hidden, since the section's own visible heading (just above, outside this CarSurCom) already shows this same text, and a visible legend here would just duplicate it right above the radio rows. */ }


			<legend className='visually-hidden'>{ groLabStr }</legend>{ /* What: Style Radio Legend Element. Why: The group still needs a real accessible name, even with no visible legend text. How: This renders groLabStr, hidden visually but still exposed to assistive tech. */ }

			<div className='rd-mode-radio'>{ /* What: Radio Mode Div Element. Why: The actual rows need their own shared layout wrapper, reused from the Data tab's own picker-mode selector. How: This maps radOptArr into one label/row per option. */ }


				{ radOptArr.map( ( optCurObj ) => { // What: Radio Option Map. Why: One full-bleed row is needed per entry in radOptArr. How: This maps radOptArr, deriving each row's own selected state before rendering it.


					const optSelBoo = optCurObj.valStr === value; // What: Option Selected Boolean. Why: A row's own selected style and its hint's expanded state both depend on whether this is the currently-chosen option. How: This is true only when this option's own value matches the selected value.



					return (


						<label
							key={ optCurObj.valStr }

							className={ ` rd-mode-opt   ${ optSelBoo ? 'is-on' : '' } ` }
						>{ /* What: Radio Mode Opt Label Element. Why: The native radio input, the dot, and the name/hint text all need to sit inside one clickable label. How: This wraps the hidden radio input, the visual dot, the name/hint block, and (optionally) a Preview button. */ }


							<input
								name={ groNamStr }

								checked={ optSelBoo }
								type='radio'

								onChange={ () => onChange( optCurObj.valStr ) }
							/>{ /* What: Radio Option Input Element. Why: This is the actual native control backing the row's own selected state. How: This is checked while optSelBoo is true and selects this option's value on change. */ }

							<span
								className='rd-mode-dot'

								aria-hidden='true'
							></span>{ /* What: Radio Mode Dot Span Element. Why: The visual selected/unselected indicator is a styled dot, not the native radio's own default appearance. How: This is purely decorative, styled via CSS off the parent label's own 'is-on' class. */ }



							<span className='rd-mode-text'>{ /* What: Radio Mode Text Span Element. Why: The option's own name and its expanding hint need their own grouping. How: This wraps the name span and the always-mounted hint collapse below. */ }


								<span className='rd-mode-name'>{ optCurObj.labStr }</span>{ /* What: Radio Mode Name Span Element. Why: Every row needs its own visible option name. How: This renders optCurObj's own labStr. */ }


								<div className={ ` collapse   ${ optSelBoo ? 'is-open' : '' } ` }>{ /* What: Collapse Div Element. Why: The hint text needs to expand/collapse in place without ever unmounting, so its own height transition can actually animate. How: This toggles its own 'is-open' class based on optSelBoo, driving a CSS grid-template-rows transition. */ }{ /* Always-mounted collapse (not <ColDisCom>, which unmounts the hint on deselect, since a freshly-inserted node can't transition its own grid-template-rows and the height would snap). Keeping it mounted lets the 0fr<->1fr glide run every time. */ }


									<div className='collapse-inner'>{ /* What: Collapse Inner Div Element. Why: The CSS grid-row transition needs an inner wrapper to measure/clip against. How: This wraps the hint span inside the collapsing region. */ }


										<span className='rd-mode-hint'>{ optCurObj.hinStr }</span>{ /* What: Radio Mode Hint Span Element. Why: Every row needs its own explanatory hint, shown only while selected. How: This renders optCurObj's own hinStr. */ }


									</div>


								</div>


							</span>



							{ onPreStyFun && ( // What: Preview Button Check. Why: Not every caller wants a Preview button on each row. How: This renders the button only while the caller actually passed an onPreStyFun handler.


								<button
									className='style-preview-btn'

									type='button'

									onClick={ ( cliEveObj ) => { // What: Preview Click Handler. Why: Pressing Preview must play the style without also selecting the radio row it sits inside. How: This cancels the click's own default label behavior, then plays the preview.


										cliEveObj.preventDefault(); // What: Default Prevention Call. Why: A click inside the label would otherwise also toggle the radio itself. How: This cancels the click's own default action.

										onPreStyFun( optCurObj.valStr ); // What: Style Preview Call. Why: This is the actual preview trigger. How: This calls onPreStyFun with this option's own valStr.


									} }
								>Preview</button> // What: Style Preview Button Element. Why: This is the actual control that plays a live preview of this specific option's own style. How: This prevents the click from also toggling the radio itself, then calls onPreStyFun with this option's own value.


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

export { StyRadCom }; // What: Named Export. Why: TabSetCom renders this list for both of its style pickers. How: This exports StyRadCom by name.

// #endregion Exports


