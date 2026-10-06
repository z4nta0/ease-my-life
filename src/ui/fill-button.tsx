


// #region Imports

import cssModObj from './fill-button.module.css'; // What: CSS Module Object. Why: The lever's icon spin lives in its own module. How: This maps each class name in fill-button.module.css to its hashed module class.
import React     from 'react';                    // What: React. Why: FilButCom is built directly on React's own APIs. How: This is used directly (React.useState) instead of importing individual named hooks.


import { ButBasCom } from './button.tsx';       // What: Button Base Component. Why: The Fill lever is a ghost-styled shared button. How: This renders the lever with its refresh icon and label.
import { redMotFun } from '../utils/motion.ts'; // What: Reduce Motion Function. Why: The decorative icon spin is skipped for a user who prefers reduced motion. How: This is checked before the spin starts.

// #endregion Imports



/**
 * fill-button.tsx = Fill Button
 *
 * @summary
 * The ghost Fill / Refill lever for ease modes. It spins its refresh icon once
 * on click and takes a disabled flag for when the target is already fully
 * charged. Picker items, pickers and conditionals share it.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

type FbcProTyp = { isaDisBoo : boolean, labTexStr : string, onFilActFun : () => void }; // What: Fill-Button-Component Props Type. Why: The lever needs its label, its action, and whether it's available. How: This types FilButCom's props.
// #region FilButCom

/**
 * FilButCom = Fill Button Component
 *
 * @summary
 * The ghost "Fill / Refill / Fill all / Refill all" lever for ease
 * modes. Spins its refresh icon once on click for subtle feedback, and
 * takes a disabled flag (callers pass true when already at full
 * charge, so a filled item/picker can't be re-filled). Shared by
 * picker items, pickers, and conditionals.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.isaDisBoo   - Is-A Disabled Boolean: Whether this lever is
 *                            currently unavailable (e.g. already at full
 *                            charge).
 * @param props.labTexStr   - Label Text String: The button's own visible text
 *                            (e.g. "Fill", "Refill all").
 * @param props.onFilActFun - On Fill Action Function: The real Fill/Refill
 *                            action, called once the disabled guard passes.
 *
 * @returns The lever rendered as a ButBasCom, with its own spin-on-click
 * behavior layered on top.
 *
 * @example
 * ```tsx
 * FilButCom({ isaDisBoo, labTexStr, onFilActFun }) // => <FilButCom />
 * ```
 *
*/

function FilButCom ( { isaDisBoo, labTexStr, onFilActFun } : FbcProTyp ) : React.JSX.Element {


	const [ spiAniBoo, setSpiAniBoo ] = React.useState( false ); // What: Spin Animate Boolean And Setter. Why: The refresh icon's own spin is purely decorative feedback, layered on top of the real Fill/Refill action. How: This is started on a live click (unless reduced motion) and cleared once the CSS spin animation finishes.



	return (


		<ButBasCom
			disabled={ isaDisBoo }
			icoClaStr={ spiAniBoo ? cssModObj.refIcoSvgSpinning : '' }
			icoNamStr='refEle'
			kinValStr='ghost'
			sizValStr='sm'

			onAnimationEnd={ () => setSpiAniBoo( false ) } // What: Spin End Reset. Why: The spin is a self-ending CSS animation that must be re-armable for the next click. How: This clears the spinning flag once the animation finishes.
			onClick={ () => { // What: On Click Handler. Why: A disabled FilButCom must be fully inert, and clicking a live one should spin the icon (unless reduced motion) before performing the real action. How: This guards on disabled, conditionally starts the spin, then always calls the caller's own onFilActFun.


				if ( isaDisBoo ) return; // What: Disabled Guard. Why: A disabled button must not spin or fire its own action at all. How: This bails out before touching spiAniBoo or calling onFilActFun.



				if ( !redMotFun() ) setSpiAniBoo( true ); // What: Spin Start Guard. Why: The spin is purely decorative feedback, skipped entirely under reduced motion. How: This starts the spin animation only when redMotFun() reports false.



				onFilActFun(); // What: On Fill Action Call. Why: This is the actual Fill/Refill action the caller owns. How: This invokes the passed-in onFilActFun handler unconditionally once the guards above pass.


			} }
		>{ /* What: Button Base Component. Why: This is FilButCom's own rendered control, reusing ButBasCom for consistent button chrome. How: This shows the spin class while spiAniBoo is true, is fully inert while disabled, and clears the spin on its own CSS animation finishing. */ }


			{ labTexStr }


		</ButBasCom>


	);


}

// #endregion FilButCom

// #endregion Components



// #region Exports

export { FilButCom }; // What: Named Export. Why: The item editor, the Data tab and the conditional controls render this lever. How: This exports FilButCom by name.

// #endregion Exports


