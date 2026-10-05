


// #region Imports

import cssModObj from './number-stepper.module.css'; // What: CSS Module Object. Why: The stepper's own container, button, and input styles live in its own module. How: This maps each class name in number-stepper.module.css to its hashed module class.
import React     from 'react';                       // What: React. Why: NumSteCom is built directly on React's own APIs. How: This is used directly (React.useEffect, React.useState) instead of importing individual named hooks.

// #endregion Imports



/**
 * number-stepper.tsx = Number Stepper
 *
 * @summary
 * A minus, editable number, plus stepper. The value can also be typed
 * directly, committing on blur or Enter clamped to its range. Every ease
 * Soonest/Latest control uses it.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

// #region NumSteCom

/**
 * NumSteCom = Numeric Stepper Component
 *
 * @summary
 * A -/[editable number]/+ stepper. The value can be typed directly
 * (handy for big jumps the +/- buttons make tedious); typing commits
 * on blur/Enter, clamped to [minValNum,maxValNum]. onSetValFun receives
 * the new integer.
 * Used by every ease Soonest/Latest control.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.ariLabStr   - Aria Label String: The accessible name for the
 *                            whole stepper group and its own text input.
 * @param props.maxValNum   - Maximum Value Number: The highest allowed value;
 *                            defaults to 99.
 * @param props.minValNum   - Minimum Value Number: The lowest allowed value;
 *                            defaults to 1.
 * @param props.onSetValFun - On Set Value Function: Receives the newly
 *                            committed, clamped integer.
 * @param props.value       - Value: The current committed integer.
 *
 * @returns The stepper's own -/text/+ trio as one grouped control.
 *
 * @example
 * ```tsx
 * NumSteCom({ ariLabStr, maxValNum, minValNum, ... }) // => <NumSteCom />
 * ```
 *
*/

function NumSteCom ( { ariLabStr, maxValNum = 99, minValNum = 1, onSetValFun, value } ) {


	const [ texValStr, setTexValStr ] = React.useState( String( value ) ); // What: Text Value String And Setter. Why: The value must be typeable as free text, not just steppable, so a separate string buffer is needed alongside the real numeric value. How: This starts mirroring the initial value and is kept in sync by the effect below and overwritten locally while the user types.


	React.useEffect( () => { setTexValStr( String( value ) ); }, [ value ] ); // What: Value Sync Effect. Why: An external change to value (e.g. a +/- click, or another control writing the same state) must be reflected in the typed text too. How: This overwrites texValStr with the current value whenever it changes.


	const cmtTexFun = () => { // What: Commit Text Function. Why: Whatever the user typed must be parsed, validated, and clamped before it becomes the real committed value. How: This parses texValStr, falls back to the last real value if unparseable, clamps to [minValNum,maxValNum], calls onSetValFun, and re-syncs the text buffer to the final result.


		let parIntNum = parseInt( texValStr, 10 ); // What: Parsed Integer Number. Why: The raw typed text needs to become a real number before it can be validated. How: This parses texValStr as a base-10 integer, which yields NaN for anything unparseable.


		if ( isNaN( parIntNum ) ) parIntNum = value; // What: Not A Number Guard. Why: An unparseable or emptied text field should fall back to the last known-good value rather than committing NaN. How: This overwrites parIntNum with the current value when parsing failed.



		parIntNum = Math.max( minValNum, Math.min( maxValNum, parIntNum ) ); // What: Clamp Call. Why: A typed value can freely exceed [minValNum,maxValNum], which must never reach onSetValFun. How: This clamps parIntNum into the allowed range.


		onSetValFun( parIntNum );            // What: On Set Value Call. Why: The parent owns the real persisted value. How: This hands the freshly-validated integer up to the caller.
		setTexValStr( String( parIntNum ) ); // What: Text Value Sync. Why: The visible text should reflect exactly what was actually committed, not whatever was typed. How: This overwrites texValStr with the final clamped value.


	};



	return (


		<div
			className={ cssModObj.numSteDiv }

			aria-label={ ariLabStr }
			role='group'
		>{ /* What: Container Stepper Div Element. Why: This groups the -/text/+ trio as one accessible group. How: This renders the decrement button, the editable text input, and the increment button below. */ }


			<button
				className={ cssModObj.numSteBut }

				disabled={ value <= minValNum }

				aria-label='Fewer days'

				onClick={ () => onSetValFun( Math.max( minValNum, value - 1 ) ) } // What: Decrement Click. Why: The stepper must never go below its minimum. How: This sets the value one lower, clamped at minValNum.
			>−</button>{ /* What: Decrement Button Element. Why: This is the "-" side of the stepper. How: This is disabled once value reaches minValNum, otherwise steps it down by 1 on click. */ }

			<input
				className={ cssModObj.numSteInp }

				inputMode='numeric'
				type='text'
				value={ texValStr }

				aria-label={ ariLabStr }

				onBlur={ cmtTexFun }
				onChange={ ( chaEveObj ) => setTexValStr( chaEveObj.target.value.replace( /[^0-9]/g, '' ) ) }       // What: Digits-Only Change. Why: The field only accepts whole numbers. How: This strips every non-digit before storing the typed text.
				onFocus={ ( focEveObj ) => focEveObj.target.select() }                                              // What: Select On Focus. Why: A user typing a new number shouldn't have to delete the old one first. How: This selects the field's whole text on focus.
				onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Enter' ) keyEveObj.currentTarget.blur(); } } // What: Enter Commit. Why: Enter should commit the typed value like leaving the field does. How: This blurs the field on Enter, which runs the onBlur commit.
			/>{ /* What: Stepper Input Element. Why: This lets the value be typed directly, handy for big jumps the +/- buttons make tedious. How: This mirrors texValStr, strips non-digit characters as the user types, selects-all on focus, commits on blur, and commits early on Enter. */ }

			<button
				className={ cssModObj.numSteBut }

				disabled={ value >= maxValNum }

				aria-label='More days'

				onClick={ () => onSetValFun( Math.min( maxValNum, value + 1 ) ) } // What: Increment Click. Why: The stepper must never go above its maximum. How: This sets the value one higher, clamped at maxValNum.
			>+</button>{ /* What: Increment Button Element. Why: This is the "+" side of the stepper. How: This is disabled once value reaches maxValNum, otherwise steps it up by 1 on click. */ }


		</div>


	);


}

// #endregion NumSteCom

// #endregion Components



// #region Exports

export { NumSteCom }; // What: Named Export. Why: The item editor and the conditional controls both render this stepper. How: This exports NumSteCom by name.

// #endregion Exports


