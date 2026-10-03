


// #region Imports

import cssModObj from './button.module.css'; // What: CSS Module Object. Why: The help toggle is styled from its own module. How: This maps each class name in button.module.css to its hashed module class.

// #endregion Imports



/**
 * button.jsx = Button
 *
 * @summary
 * The per-page help-mode toggle: HelButCom is a controlled button each tab
 * renders in its header, flipping that tab's own local help-mode boolean (see
 * mode.jsx for why that state stays local to each tab).
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

// #region HelButCom

/**
 * HelButCom = Help Button Component
 *
 * @summary
 * The per-page toggle, usually placed in a page's own header. actModBoo
 * mirrors whether HelOveCom is currently showing anything for this
 * page.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actModBoo - Active Mode Boolean: Whether help mode is
 *                          currently on for this page; drives both the
 *                          "is-on" styling and the button's own pressed
 *                          state.
 * @param props.onClick   - On Click: Called when the button is pressed. The
 *                          caller owns actually flipping its own on/off
 *                          state.
 *
 * @returns The toggle's own single rendered button.
 *
 * @example
 * ```tsx
 * HelButCom({ actModBoo, onClick }) // => <HelButCom />
 * ```
 *
*/

function HelButCom ( { actModBoo, onClick } ) {


	return (


		<button
			className={ cssModObj.helTogBut }

			data-element-name-hook='helTogBut'

			type='button'

			aria-label={ actModBoo ? 'Hide help highlights' : 'Show help highlights' } // What: Toggle Label Ternary. Why: A screen reader should announce what pressing the button will do next. How: This names the hide action while help mode is on, the show action otherwise.
			aria-pressed={ actModBoo }

			onClick={ onClick }
		>{ /* What: Help Toggle Button Element. Why: This is HelButCom's own single rendered element. How: This shows actModBoo as its aria-pressed state, which its module also styles as switched on, and calls onClick when pressed. Its data-element-name-hook is read by help mode and the App Features tours. */ }


			i


		</button>


	);


}

// #endregion HelButCom

// #endregion Components



// #region Exports

export { HelButCom }; // What: Named Export. Why: Every tab renders the help-mode toggle in its own header. How: This exports HelButCom by name.

// #endregion Exports


