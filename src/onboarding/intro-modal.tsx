


// #region Imports

import cssModObj from './intro-modal.module.css'; // What: CSS Module Object. Why: The modal's backdrop, card, and button styles live in its own module. How: This maps each class name in intro-modal.module.css to its hashed module class.
import React     from 'react';                    // What: React. Why: This is the UI library IntModCom is built on. How: This is used directly (React.useRef, React.useEffect) inside the component below.


import { createPortal } from 'react-dom';          // What: Create Portal. Why: The modal must render into <body> so it lays over the whole app instead of being clipped by an ancestor's own overflow/stacking context. How: This is called with the modal's own JSX and document.body inside IntModCom's return.
import { redMotFun    } from '../utils/motion.ts'; // What: Reduce Motion Function. Why: A user who prefers reduced motion should not see the card's own slide-in entrance animation. How: This is called below to decide whether the rise entrance modifier class is applied.

// #endregion Imports



/**
 * intro-modal.tsx = Intro Modal
 *
 * @summary
 * A single-component file: IntModCom, the generic intro modal shown before any
 * guided tour (the Welcome Tour and every per-feature/page/picker/reminder
 * mini-tour alike). See IntModCom's own function-declaration comment right
 * below for its full signature and design notes; this file exists purely so
 * every one of those tours can import the same shared component instead of
 * each rolling its own modal.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

// #region IntModCom

/**
 * IntModCom = Intro Modal Component
 *
 * @summary
 * This is the generic intro modal shown before any guided tour, the
 * Welcome Tour and every per-feature mini-tour built on the same
 * GuiTouCom engine alike (see onboarding/tour-runner.tsx). It renders
 * an icon, a title, one or more body paragraphs, and up to a few small
 * pills, then a primary "start" action above a secondary "skip" one.
 * Every piece of visible content is passed in by the caller; only the
 * structure and the two buttons' own styling are meant to stay identical
 * across every tour that uses this component. See
 * onboarding/welcome-tour.tsx for the Welcome Tour's own copy and labels,
 * which differ slightly ("Take the quick tour" and "I'll explore myself")
 * from a mini-tour's plainer "Get started" and "Skip".
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.begLabStr   - Begin Label String: The primary button's own
 *                            visible text; defaults to 'Get started'.
 * @param props.icoTopEle   - Icon Top Element: The icon or glyph node rendered
 *                            above the title, typically an <IcoSvgCom /> or an
 *                            inline <svg>.
 * @param props.onBegTouFun - On Begin Tour Function: Called when the primary
 *                            action button is activated.
 * @param props.onSkiTouFun - On Skip Tour Function: Called when the secondary,
 *                            skip action button is activated.
 * @param props.parEleArr   - Paragraph Element Array: The body paragraphs
 *                            shown under the title, in order; each entry may
 *                            be a plain string or a JSX fragment.
 * @param props.pilLabArr   - Pills Label Array: An optional array of short
 *                            label strings rendered as small chips below the
 *                            paragraphs; omitted or empty renders no chip row
 *                            at all.
 * @param props.skiLabStr   - Skip Label String: The secondary button's own
 *                            visible text; defaults to 'Skip'.
 * @param props.titHeaStr   - Title Heading String: The modal's own heading
 *                            text, used as both the visible <h2> and the
 *                            dialog's own aria-label.
 *
 * @returns The modal's own scrim-and-card markup, portaled into
 * document.body.
 *
 * @example
 * ```tsx
 * IntModCom({ begLabStr, icoTopEle, onBegTouFun, ... }) // => <IntModCom />
 * ```
 *
*/

function IntModCom ( { begLabStr = 'Get started', icoTopEle, onBegTouFun, onSkiTouFun, parEleArr, pilLabArr, skiLabStr = 'Skip', titHeaStr } ) {


	const redMotBoo = redMotFun(); // What: Reduced Motion Boolean. Why: The card's own slide-in entrance animation should be skipped when the user prefers reduced motion. How: This calls the shared redMotFun() check once per render.



	const priButRef = React.useRef( null ); // What: Primary Button Reference. Why: The primary action button needs a stable handle so it can be focused on mount. How: This starts null and is attached to the primary button's own ref prop below.


	React.useEffect( () => { priButRef.current && priButRef.current.focus( { preventScroll : true } ); }, [] ); // What: Primary Focus Effect. Why: The primary button should be focused immediately on mount so pressing Enter submits right away, but a plain autoFocus's default scroll-into-view would land the page scrolled down to this button near the bottom of the modal instead of showing its own top (icon, title) first, now that .intScrDiv can be a scroll container. How: This focuses priButRef's current button with preventScroll, once, on mount only, guarded so it no-ops if the ref isn't attached yet.



	return createPortal( // What: Modal Portal Return. Why: The modal must lay over the whole app rather than render inside whichever tab mounted it. How: This portals the scrim and its card onto document.body.


		<div
			className={ cssModObj.intScrDiv }

			data-element-name-hook='intScrDiv'

			aria-label={ titHeaStr }
			aria-modal='true'
			role='dialog'
		>{ /* What: Container Scrim Div Element. Why: This is the modal's own full-viewport backdrop and, since it can scroll, the positioning context the focus effect above cares about. How: This wraps the welcome card below and marks itself as an accessible dialog named by titHeaStr. Its data-element-name-hook is read by the shared Escape-key handler. */ }


			<div className={` ${ cssModObj.welCarDiv }   ${ redMotBoo ? '' : cssModObj.welCarDivRise } `}>{ /* What: Welcome Card Div Element. Why: This is the actual visible card, separate from the scrim so only it plays the slide-in entrance animation. How: This applies the rise entrance modifier class unless redMotBoo reports the user prefers reduced motion. */ }


				<div className={ cssModObj.icoMarDiv }>{ icoTopEle }</div>{ /* What: Icon Mark Div Element. Why: Every intro modal shows a recognizable glyph above its own title. How: This renders whatever icon node the caller passed in. */ }

				<h2 className={ cssModObj.intTitHea }>{ titHeaStr }</h2>{ /* What: Intro Title Heading Element. Why: Every intro modal needs one visible, accessible heading. How: This renders the titHeaStr prop as an h2. */ }

				{ parEleArr.map( ( parIteEle, parIndNum ) => ( // What: Paragraph Map. Why: Each entry in parEleArr needs to become its own rendered paragraph tag. How: This maps every paragraph entry to a <p>, keyed by its own index since paragraph text can repeat.


					<p
						key={ parIndNum }

						className={ cssModObj.intBodPar }
					>{ parIteEle }</p> // What: Intro Body Paragraph Element. Why: This renders one paragraph of the modal's own body copy. How: This wraps parIteEle, which may be a plain string or a JSX fragment, directly as the tag's own children.


				) ) }

				{ pilLabArr && pilLabArr.length > 0 && ( // What: Pills Visibility Check. Why: Not every intro modal has pills to show. How: This renders the chip row only while pilLabArr holds at least one entry.


					<div className={ cssModObj.chiRowDiv }>{ /* What: Chip Row Div Element. Why: This groups every pill chip as one visual row below the paragraphs. How: This renders one span per pilLabArr entry below. */ }


						{ pilLabArr.map( ( pilValStr ) => ( // What: Pill Map. Why: One chip is needed per entry in pilLabArr. How: This maps every pilLabArr entry to its own span, keyed by its own text.


							<span
								key={ pilValStr }

								className={ cssModObj.topPilSpa }
							>{ pilValStr }</span> // What: Topic Pill Span Element. Why: This is one small chip labeling a topic the tour touches on. How: This renders pilValStr as the chip's own visible text.


						) ) }


					</div>


				) }

				<div className={ cssModObj.actStaDiv }>{ /* What: Action Stack Div Element. Why: This groups the modal's own primary/secondary action pair in one stack. How: This renders the primary start button followed by the secondary skip button below. */ }


					<button
						ref={ priButRef }

						className={` ${ cssModObj.intActBut }   ${ cssModObj.intActButPrimary } `}

						onClick={ onBegTouFun }
					>{ begLabStr }</button>{ /* What: Primary Action Button Element. Why: This is the tour's own main call to action. How: This is focused on mount via priButRef and calls onBegTouFun when clicked. */ }

					<button
						className={` ${ cssModObj.intActBut }   ${ cssModObj.intActButGhost } `}

						onClick={ onSkiTouFun }
					>{ skiLabStr }</button>{ /* What: Skip Action Button Element. Why: A user must always be able to decline a tour instead of taking it. How: This calls onSkiTouFun when clicked. */ }


				</div>


			</div>


		</div>,

		document.body // What: Document Body Target. Why: The modal must render outside the app's own DOM subtree so ancestor overflow/stacking never clips or buries it. How: This is createPortal's own target container argument.


	);


}

// #endregion IntModCom

// #endregion Components



// #region Exports

export { IntModCom }; // What: Named Export. Why: onboarding/welcome-tour.tsx, onboarding/app-features.tsx, onboarding/page-tours.tsx, onboarding/picker-tours.tsx, and onboarding/reminder-tours.tsx all import this by this exact name. How: This re-exports IntModCom by name, rippled into every one of those files' own import and JSX usage in the same pass.

// #endregion Exports


