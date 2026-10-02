


// #region Imports

import cssModObj from './button.module.css'; // What: CSS Module Object. Why: The button's base, size, and kind styles live in its own module. How: This maps each class name in button.module.css to its hashed module class.
import React     from 'react';               // What: React. Why: ButBasCom is built directly on React's own APIs. How: This is used directly (React.forwardRef) instead of importing individual named hooks.


import { IcoSvgCom } from './icon.jsx'; // What: Icon Svg Component. Why: A button can carry an optional leading icon. How: This renders icoNamStr's glyph ahead of the button's own label.

// #endregion Imports



/**
 * button.jsx = Button
 *
 * @summary
 * The shared base for nearly every button in the app: a real button element
 * carrying the kind and size modifier classes, an optional leading icon, and
 * every other prop passed straight through, with its ref forwarded so callers
 * can restore focus to it.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

// #region ButBasCom

/**
 * ButBasCom = Button Base Component
 *
 * @summary
 * The shared base for nearly every button in the app: a real <button>
 * (so it keeps native semantics and keyboard behavior) carrying the
 * kind/size modifier classes, an optional leading icon, and whatever
 * other props the caller passes straight through (onClick, disabled,
 * aria-*, ...). It forwards its ref onto that <button>, so a caller can
 * restore focus to it after an action that hands focus away (see the
 * Settings export/import confirmations).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.children  - Children: The button's own visible content.
 * @param props.className - Class Name: Extra class name(s) to append;
 *                          defaults to an empty string.
 * @param props.icoNamStr - Icon Name String: An optional IcoSvgCom icon name
 *                          to render ahead of the children.
 * @param props.kinValStr - Kind Value String: The visual kind modifier;
 *                          defaults to 'ghost'.
 * @param props.sizValStr - Size Value String: The size modifier, 'sm' or
 *                          'md'; defaults to 'md'.
 * @param props.resProObj - Rest Props Object: Every other prop, spread
 *                          straight onto the <button>.
 * @param forRefObj       - Forward Reference Object: The caller's own ref,
 *                          attached to the <button>.
 *
 * @returns The rendered button element.
 *
 * @example
 * ```tsx
 * ButBasCom({ children, className, icoNamStr, ... }) // => <ButBasCom />
 * ```
 *
*/

const ButBasCom = React.forwardRef( function ButBasCom ( { children, className = '', icoNamStr, kinValStr = 'ghost', sizValStr = 'md', ...resProObj }, forRefObj ) { // What: Button Base Component. Why: Nearly every button in the app shares the same chrome, and some callers need a ref on it to restore focus. How: This forwards forRefObj onto a real <button> carrying the kind/size classes and every other passed prop.


	return (


		<button
			ref={ forRefObj }

			className={` ${ cssModObj.btn }   ${ kinValStr === 'primary' ? cssModObj.btnPrimary : '' }   ${ kinValStr === 'ghost' ? cssModObj.btnGhost : '' }   ${ kinValStr === 'danger' ? cssModObj.btnDanger : '' }   ${ kinValStr === 'secondary' ? cssModObj.btnSecondary : '' }   ${ sizValStr === 'sm' ? cssModObj.btnSm : '' }   ${ className } `}

			{ ...resProObj }
		>{ /* What: Base Button Element. Why: This is ButBasCom's own root rendered element, a real <button> so it keeps native semantics/keyboard behavior. How: This applies the kind/size modifier classes plus any caller className, forwards the ref, and spreads every other passed prop (onClick, disabled, aria-*, ...) directly onto the DOM node. */ }


			{ icoNamStr && ( // What: Icon Visibility Check. Why: An icon is optional, only some ButBasCom callers pass one. How: This renders an IcoSvgCom at the base rhythm step, only while icoNamStr holds a name.


				<IcoSvgCom
					icoNamStr={ icoNamStr }
					sizStpStr='bas'
				/> // What: Leading Icon Svg Component. Why: This is the optional glyph shown ahead of the button's own text. How: This renders icoNamStr at the base rhythm step for every button size.


			) }

			{ children }{ /* What: Button Content. Why: ButBasCom supplies only the button chrome; its label or other content comes from the caller. How: This renders whatever children the caller passed, after the optional icon. */ }


		</button>


	);


} );

// #endregion ButBasCom

// #endregion Components



// #region Exports

export { ButBasCom }; // What: Named Export. Why: Nearly every action button in the app renders this base. How: This exports ButBasCom by name.

// #endregion Exports


