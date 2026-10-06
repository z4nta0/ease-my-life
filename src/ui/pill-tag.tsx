


// #region Imports

import cssModObj from './pill-tag.module.css'; // What: CSS Module Object. Why: The pill's own base and tone styles live in its own module. How: This maps each class name in pill-tag.module.css to its hashed module class.


import type { JSX       } from 'react'; // What: JSX. Why: The component declares the element it returns. How: This types its return as a JSX element.
import type { ReactNode } from 'react'; // What: React Node. Why: A pill's text can be any renderable content. How: This types PtcProTyp's children.

// #endregion Imports



/**
 * pill-tag.tsx = Pill Tag
 *
 * @summary
 * The small colored label the Stats and Pickers tabs use to tag a mode or a
 * status, with a tone that picks one of the pill color modifiers.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

type PtcProTyp = { children : ReactNode, 'data-element-name-hook'? : string, tonValStr? : string }; // What: Pill-Tag-Component Props Type. Why: A pill shows its text in a tone, with an optional identity hook. How: This types PilTagCom's props.
// #region PilTagCom

/**
 * PilTagCom = Pill Tag Component
 *
 * @summary
 * The small colored label Stats, Pickers and Data use to tag a mode or a
 * status. The tone picks one of the pill color modifiers.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.children               - Children: The pill's text.
 * @param props.data-element-name-hook - Data Element Name Hook: The element's
 *                                       own identity hook, forwarded onto its
 *                                       span, so code can find it without its
 *                                       classes.
 * @param props.tonValStr              - Tone Value String: The color modifier,
 *                                       defaulting to 'default'.
 *
 * @returns The pill's span.
 *
 * @example
 * ```tsx
 * PilTagCom({ children, tonValStr: 'mode' }) // => <PilTagCom />
 * ```
 *
*/

const PilTagCom = ( { children, 'data-element-name-hook' : hooNamStr, tonValStr = 'default' } : PtcProTyp ) : JSX.Element => ( // What: Pill Tag Component. Why: Stats/Pickers/Data all need the same small colored label to tag a mode or status. How: This renders a span whose "pill--{tone}" modifier class picks the actual color/style, defaulting to a neutral tone.


	<span
		className={` ${ cssModObj.pilTagSpa }   ${ tonValStr === 'default' ? cssModObj.pilTagSpaDefault : '' }   ${ tonValStr === 'mode' ? cssModObj.pilTagSpaMode : '' }   ${ tonValStr === 'muted' ? cssModObj.pilTagSpaMuted : '' } `}

		data-element-name-hook={ hooNamStr }
	>{ children }</span> // What: Tag Span Element. Why: This is PilTagCom's own single rendered element. How: This applies the tonValStr modifier class and renders whatever children the caller passed.


);

// #endregion PilTagCom

// #endregion Components



// #region Exports

export { PilTagCom }; // What: Named Export. Why: The Stats and Pickers tabs tag modes and statuses with this pill. How: This exports PilTagCom by name.

// #endregion Exports


