



// #region Imports

import React from 'react'; // What: React. Why: This is the UI library IntModCom is built on. How: This is used directly (React.useRef, React.useEffect) inside the component below.


import { createPortal } from 'react-dom'; // What: Create Portal. Why: The modal must render into <body> so it lays over the whole app instead of being clipped by an ancestor's own overflow/stacking context. How: This is called with the modal's own JSX and document.body inside IntModCom's return.
import { redMotFun    } from './ui.jsx';  // What: Reduce Motion Function.  Why: A user who prefers reduced motion should not see the card's own slide-in entrance animation. How: This is called below to decide whether the "ob-in" entrance class is applied.

// #endregion Imports



// #region IntModCom

/**
 * IntModCom = Intro Modal Component
 *
 * @summary
 * This is the generic intro modal shown before any guided tour, the
 * Welcome Tour and every per-feature mini-tour built on the same
 * GuidedTour engine alike (see onboarding-tour-runner.jsx). It renders
 * an icon, a title, one or more body paragraphs, and up to a few small
 * pills, then a primary "start" action above a secondary "skip" one.
 * Every piece of visible content is passed in by the caller; only the
 * structure and the two buttons' own styling are meant to stay
 * identical across every tour that uses this component. See
 * onboarding.jsx for the Welcome Tour's own copy and labels, which
 * differ slightly ("Take the quick tour" and "I'll explore myself")
 * from a mini-tour's plainer "Get started" and "Skip".
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.icon        - IcoSvgCom: The icon or glyph node rendered above the
 *                            title, typically an <IcoSvgCom /> or an inline <svg>.
 * @param props.title       - Title: The modal's own heading text, used as both
 *                            the visible <h2> and the dialog's own aria-label.
 * @param props.paragraphs  - Paragraphs: The body paragraphs shown under the
 *                            title, in order; each entry may be a plain string
 *                            or a JSX fragment.
 * @param props.pills       - Pills: An optional array of short label strings
 *                            rendered as small chips below the paragraphs;
 *                            omitted or empty renders no chip row at all.
 * @param props.onStart     - On Start: Called when the primary action button
 *                            is activated.
 * @param props.onSkip      - On Skip: Called when the secondary, skip action
 *                            button is activated.
 * @param props.startLabel  - Start Label: The primary button's own visible
 *                            text; defaults to 'Get started'.
 * @param props.skipLabel   - Skip Label: The secondary button's own visible
 *                            text; defaults to 'Skip'.
 *
 * @returns The modal's own scrim-and-card markup, portaled into
 * document.body.
 *
 * @example
 * ```tsx
 * IntModCom({ icon, title, ... }) // => <IntModCom />
 * ```
 *
*/

function IntModCom ( { icon, title, paragraphs, pills, onStart, onSkip, startLabel = 'Get started', skipLabel = 'Skip' } ) {


	const redMotBoo = redMotFun && redMotFun(); // What: Reduced Motion Boolean. Why: The card's own slide-in entrance animation should be skipped when the user prefers reduced motion. How: This calls the shared redMotFun() check, guarded so a missing import is also tolerated.



	const priButRef = React.useRef( null ); // What: Primary Button Reference. Why: The primary action button needs a stable handle so it can be focused on mount. How: This starts null and is attached to the primary button's own ref prop below.


	React.useEffect( () => { priButRef.current && priButRef.current.focus( { preventScroll : true } ); }, [] ); // What: Primary Focus Effect. Why: The primary button should be focused immediately on mount so pressing Enter submits right away, but a plain autoFocus's default scroll-into-view would land the page scrolled down to this button near the bottom of the modal instead of showing its own top (icon, title) first, now that .ob-scrim can be a scroll container. How: This focuses priButRef's current button with preventScroll, once, on mount only, guarded so it no-ops if the ref isn't attached yet.



	return createPortal(


		<div
			className='ob-scrim'
			role='dialog'
			aria-modal='true'
			aria-label={ title }
		>{ /* What: Container Scrim Div Element. Why: This is the modal's own full-viewport backdrop and, since it can scroll, the positioning context the focus effect above cares about. How: This wraps the welcome card below and marks itself as an accessible dialog named by title. */ }


			<div className={ ` ob-welcome   ${ redMotBoo ? '' : 'ob-in' } ` }>{ /* What: Welcome Card Div Element. Why: This is the actual visible card, separate from the scrim so only it plays the slide-in entrance animation. How: This applies the "ob-in" entrance class unless redMotBoo reports the user prefers reduced motion. */ }


				<div className='ob-wmark'>{ icon }</div>{ /* What: Icon Mark Div Element. Why: Every intro modal shows a recognizable glyph above its own title. How: This renders whatever icon node the caller passed in. */ }

				<h2>{ title }</h2>{ /* What: Title Heading Element. Why: Every intro modal needs one visible, accessible heading. How: This renders the title prop as an h2. */ }


				{ paragraphs.map( ( parIteNod, parIndNum ) => ( // What: Paragraph Map. Why: Each entry in paragraphs needs to become its own rendered paragraph tag. How: This maps every paragraph entry to a <p>, keyed by its own index since paragraph text can repeat.


					<p key={ parIndNum }>{ parIteNod }</p> // What: Paragraph Element. Why: This renders one paragraph of the modal's own body copy. How: This wraps parIteNod, which may be a plain string or a JSX fragment, directly as the tag's own children.

				) ) }


				{ pills && pills.length > 0 && ( // What: Pills Visibility Check. Why: Not every intro modal has pills to show. How: This renders the chip row only while pills holds at least one entry.


					<div className='ob-chips'>{ /* What: Container Chips Div Element. Why: This groups every pill chip as one visual row below the paragraphs. How: This renders one span per pills entry below. */ }


						{ pills.map( ( pilValStr ) => ( // What: Pill Map. Why: One chip is needed per entry in pills. How: This maps every pills entry to its own span, keyed by its own text.


							<span key={ pilValStr }>{ pilValStr }</span> // What: Pill Span Element. Why: This is one small chip labeling a topic the tour touches on. How: This renders pilValStr as the chip's own visible text.

						) ) }


					</div>


				) }


				<div className='ob-wact'>{ /* What: Container Action Div Element. Why: This groups the modal's own primary/secondary action pair on one row. How: This renders the primary start button followed by the secondary skip button below. */ }


					<button
						ref={ priButRef }
						className='ob-btn ob-btn--primary'
						onClick={ onStart }
					>{ startLabel }</button>{ /* What: Primary Action Button Element. Why: This is the tour's own main call to action. How: This is focused on mount via priButRef and calls onStart when clicked. */ }

					<button
						className='ob-btn ob-btn--ghost'
						onClick={ onSkip }
					>{ skipLabel }</button>{ /* What: Skip Action Button Element. Why: A user must always be able to decline a tour instead of taking it. How: This calls onSkip when clicked. */ }


				</div>


			</div>


		</div>,

		document.body // What: Document Body Target. Why: The modal must render outside the app's own DOM subtree so ancestor overflow/stacking never clips or buries it. How: This is createPortal's own target container argument.

	);


}

// #endregion IntModCom



export { IntModCom }; // What: Named Export. Why: onboarding.jsx, onboarding-app-features.jsx, onboarding-page-tours.jsx, onboarding-picker-tours.jsx, and onboarding-reminder-tours.jsx all import this by this exact name. How: This re-exports IntModCom by name, rippled into every one of those files' own import and JSX usage in the same pass.



