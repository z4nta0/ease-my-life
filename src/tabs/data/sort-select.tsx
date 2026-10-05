


// #region Imports

import cssModObj from './sort-select.module.css'; // What: CSS Module Object. Why: The sort control's row, label, and select styles live in its own module. How: This maps each class name in sort-select.module.css to its hashed module class.

// #endregion Imports



/**
 * sort-select.tsx = Sort Select
 *
 * @summary
 * A small labeled select reused for every sort control on the Data tab: the
 * section-list sort and each section's own item-list sort.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

// #region SorSelCom

/**
 * SorSelCom = Sort Select Component
 *
 * @summary
 * A small labeled select reused for every sort control on the Data
 * tab: the section-list sort and each section's own item-list sort.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.labTexStr - Label Text String: The visible label text.
 * @param props.onChange  - On Change: Receives the newly-chosen option's own
 *                          key.
 * @param props.optLisArr - Option List Array: The list of { keyStr, labStr }
 *                          choices to render as options.
 * @param props.selIdeStr - Select Identifier String: The id shared between
 *                          the label's htmlFor and the select itself.
 * @param props.value     - Value: The currently-selected option's own key.
 *
 * @returns The labeled select as one grouped row.
 *
 * @example
 * ```tsx
 * SorSelCom({ labTexStr, onChange, optLisArr, ... }) // => <SorSelCom />
 * ```
 *
*/

function SorSelCom ( { labTexStr, onChange, optLisArr, selIdeStr, value } ) {


	return (


		<div className={ cssModObj.sorRowDiv }>{ /* What: Sort Row Div Element. Why: This groups the label and its own select as one labeled control. How: This wraps the label below and the actual select element. */ }


			<label
				className={ cssModObj.sorLabLab }

				htmlFor={ selIdeStr }
			>{ /* What: Sort Label Label Element. Why: The select below needs an associated visible label for accessibility. How: This is linked to the select via htmlFor/id and shows the caller's own labTexStr text. */ }


				{ labTexStr }


			</label>

			<select
				id={ selIdeStr }

				className={ cssModObj.sorDroSel }

				data-element-name-hook='sorDroSel'

				value={ value }

				onChange={ ( chaEveObj ) => onChange( chaEveObj.target.value ) }
			>{ /* What: Sort Dropdown Select Element. Why: This is the actual control the user picks a sort option from. How: This renders one <option> per entry in optLisArr below, and reports the chosen key up via onChange. Its data-element-name-hook is read by help mode's Data catalog. */ }


				{ optLisArr.map( ( optCurObj ) => ( // What: Sort Option Map. Why: One <option> is needed per entry in optLisArr. How: This maps optLisArr to one <option> per entry, keyed by its own keyStr.


					<option
						key={ optCurObj.keyStr }

						value={ optCurObj.keyStr }
					>{ optCurObj.labStr }</option> // What: Sort Option Element. Why: This is one selectable sort choice. How: This shows optCurObj's own labStr and reports its keyStr when chosen.


				) ) }


			</select>


		</div>


	);


}

// #endregion SorSelCom

// #endregion Components



// #region Exports

export { SorSelCom }; // What: Named Export. Why: The Data tab and the reminders manager render this select for their sort controls. How: This exports SorSelCom by name.

// #endregion Exports


