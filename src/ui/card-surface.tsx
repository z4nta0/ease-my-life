


// #region Imports

import cssModObj from './card-surface.module.css'; // What: CSS Module Object. Why: The card's own surface and padding styles live in its own module. How: This maps each class name in card-surface.module.css to its hashed module class.

// #endregion Imports



/**
 * card-surface.tsx = Card Surface
 *
 * @summary
 * The shared surface wrapper used throughout every tab: it adds the card
 * classes, plus inner padding unless turned off, and forwards every other prop
 * to its root element.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

// #region CarSurCom

/**
 * CarSurCom = Card Surface Component
 *
 * @summary
 * The shared surface/panel wrapper used throughout every tab. It adds
 * the card classes (plus inner padding unless turned off) and forwards
 * every other prop to its root div, so a caller can still pass
 * attributes like an id or an aria label.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.children  - Children: The card's content.
 * @param props.className - Class Name: Extra classes appended to the card,
 *                          defaulting to an empty string.
 * @param props.isaPadBoo - Is-A Padded Boolean: Whether the card gets its
 *                          inner padding, defaulting to true.
 * @param props.resProObj - Rest Props Object: Every other prop, spread onto
 *                          the root div.
 *
 * @returns The card's root div.
 *
 * @example
 * ```tsx
 * CarSurCom({ children, className, isaPadBoo, ... }) // => <CarSurCom />
 * ```
 *
*/

const CarSurCom = ( { children, className = '', isaPadBoo = true, ...resProObj } ) => ( // What: Card Surface Component. Why: CarSurCom is the shared surface/panel wrapper used throughout every tab. How: This renders a div with the isaPadBoo/className modifier classes, spreading every other passed prop onto the DOM node.


	<div
		className={` ${ cssModObj.carSurDiv }   ${ isaPadBoo ? cssModObj.carSurDivPadded : '' }   ${ className } `}

		{ ...resProObj }
	>{ /* What: Surface Div Element. Why: This is CarSurCom's own root rendered element. How: This applies the isaPadBoo/className modifier classes, spreads any other passed props, and renders whatever children the caller passed. */ }


		{ children }{ /* What: Card Content. Why: CarSurCom is only the surface; everything shown on the card comes from its caller. How: This renders whatever children the caller passed, unchanged. */ }


	</div>


);

// #endregion CarSurCom

// #endregion Components



// #region Exports

export { CarSurCom }; // What: Named Export. Why: Every tab wraps its panels in this surface. How: This exports CarSurCom by name.

// #endregion Exports


