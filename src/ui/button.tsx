


// #region Imports

import cssModObj from './button.module.css'; // What: CSS Module Object. Why: The button's base, size, and kind styles live in its own module. How: This maps each class name in button.module.css to its hashed module class.


import { IcoSvgCom } from './icon.tsx'; // What: Icon Svg Component. Why: A button can carry an optional leading icon. How: This renders icoNamStr's glyph ahead of the button's own label.


import type { ComponentProps } from 'react'; // What: Component Props. Why: The base button forwards every native button prop. How: This types BbcProTyp's native part.
import type { JSX            } from 'react'; // What: JSX. Why: The component declares the element it returns. How: This types its return as a JSX element.

// #endregion Imports



/**
 * button.tsx = Button
 *
 * @summary
 * The shared base for nearly every button in the app: a real button element
 * carrying the kind and size modifier classes, an optional leading icon, and
 * every other prop passed straight through, with its ref attached so callers
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

type BbcProTyp = ComponentProps< 'button' > & { icoClaStr? : string, icoNamStr? : string, kinValStr? : string, sizValStr? : string }; // What: Button-Basic-Component Props Type. Why: The base button takes every native button prop, its ref included, plus its own icon, kind, and size. How: This types ButBasCom's props.
// #region ButBasCom

/**
 * ButBasCom = Button Base Component
 *
 * @summary
 * The shared base for nearly every button in the app: a real <button>
 * (so it keeps native semantics and keyboard behavior) carrying the
 * kind/size modifier classes, an optional leading icon, and whatever
 * other props the caller passes straight through (onClick, disabled,
 * aria-*, ...). It attaches the ref prop to that <button>, so a caller can
 * restore focus to it after an action that hands focus away (see the
 * Settings export/import confirmations).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.children  - Children: The button's own visible content.
 * @param props.className - Class Name: Extra class name(s) to append;
 *                          defaults to an empty string.
 * @param props.icoClaStr - Icon Class String: An optional class from the
 *                          caller's own module for the icon, such as an
 *                          animation trigger.
 * @param props.icoNamStr - Icon Name String: An optional IcoSvgCom icon name
 *                          to render ahead of the children.
 * @param props.kinValStr - Kind Value String: The visual kind modifier;
 *                          defaults to 'ghost'.
 * @param props.ref       - Reference: The caller's own ref, attached to the
 *                          <button>.
 * @param props.sizValStr - Size Value String: The size modifier, 'sm' or
 *                          'md'; defaults to 'md'.
 * @param props.resProObj - Rest Props Object: Every other prop, spread
 *                          straight onto the <button>.
 *
 * @returns The rendered button element.
 *
 * @example
 * ```tsx
 * ButBasCom({ children, className, icoClaStr, ref, ... }) // => <ButBasCom />
 * ```
 *
*/

function ButBasCom ( { children, className = '', icoClaStr, icoNamStr, kinValStr = 'ghost', ref, sizValStr = 'md', ...resProObj } : BbcProTyp ) : JSX.Element {


	return (


		<button
			ref={ ref }

			className={` ${ cssModObj.butBasBut }   ${ kinValStr === 'primary' ? cssModObj.butBasButPrimary : '' }   ${ kinValStr === 'ghost' ? cssModObj.butBasButGhost : '' }   ${ kinValStr === 'danger' ? cssModObj.butBasButDanger : '' }   ${ kinValStr === 'secondary' ? cssModObj.butBasButSecondary : '' }   ${ sizValStr === 'sm' ? cssModObj.butBasButSm : '' }   ${ className } `}

			{ ...resProObj }
		>{ /* What: Base Button Element. Why: This is ButBasCom's own root rendered element, a real <button> so it keeps native semantics/keyboard behavior. How: This applies the kind/size modifier classes plus any caller className, forwards the ref, and spreads every other passed prop (onClick, disabled, aria-*, ...) directly onto the DOM node. */ }


			{ icoNamStr && ( // What: Icon Visibility Check. Why: An icon is optional, only some ButBasCom callers pass one. How: This renders an IcoSvgCom at the base rhythm step, only while icoNamStr holds a name.


				<IcoSvgCom
					className={ icoClaStr }

					icoNamStr={ icoNamStr }
					sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
				/> // What: Icon Svg Component. Why: This is the optional glyph shown ahead of the button's own text. How: This renders icoNamStr at the base rhythm step for every button size, carrying any icoClaStr class the caller passed.


			) }

			{ children }{ /* What: Button Content. Why: ButBasCom supplies only the button chrome; its label or other content comes from the caller. How: This renders whatever children the caller passed, after the optional icon. */ }


		</button>


	);


}

// #endregion ButBasCom

// #endregion Components



// #region Exports

export { ButBasCom }; // What: Named Export. Why: Nearly every action button in the app renders this base. How: This exports ButBasCom by name.

// #endregion Exports


