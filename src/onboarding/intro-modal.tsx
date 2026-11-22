


// #region Imports

import cssModObj from './intro-modal.module.css'; // What: CSS Module Object. Why: The modal's backdrop, card, and button styles live in its own module. How: This maps each class name in intro-modal.module.css to its hashed module class.
import React     from 'react';                    // What: React. Why: This is the UI library IntModCom is built on. How: This is used directly (React.useRef, for one) inside the component below.


import { createPortal } from 'react-dom';            // What: Create Portal. Why: The modal must render into <body> so it lays over the whole app instead of being clipped by an ancestor's own overflow/stacking context. How: This is called with the modal's own JSX and document.body inside IntModCom's return.
import { redMotFun    } from '../utils/motion.ts';   // What: Reduced Motion Function. Why: A user who prefers reduced motion should not see the card's own slide-in entrance animation. How: This is called below to decide whether the rise entrance modifier class is applied.
import { useModIneFun } from '../ui/modal-inert.ts'; // What: Use Modal Inert Function. Why: Tab must not leave the open modal for the page behind it. How: This is called with the primary button's ref, making everything outside the modal inert while it's open.

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

type ImcProTyp = { begLabStr? : string, icoTopEle : React.ReactNode, onBegTouFun : () => void, onRetUsrFun? : () => void, onSkiTouFun : () => void, parEleArr : React.ReactNode[], pilLabArr? : string[], retLabStr? : string, skiLabStr? : string, titHeaStr : string }; // What: Intro-Modal-Component Props Type. Why: Every tour opens with the same intro modal, filled with its own icon, heading, paragraphs, pills, and button labels. How: This types IntModCom's props.

// #region IntModCom

/**
 * IntModCom = Intro Modal Component
 *
 * @summary
 * This is the generic intro modal shown before any guided tour, the
 * Welcome Tour and every per-feature mini-tour built on the same
 * GuiTouCom engine alike (see onboarding/tour-runner.tsx). It renders
 * an icon, a title, one or more body paragraphs, and up to a few small
 * pills, then a primary "start" action above a secondary "skip" one, and,
 * when the caller asks, a quieter third action for someone returning.
 * The icon, heading, paragraphs, and pills are passed in by the caller, and
 * the button labels fall back to defaults; only the structure and the two
 * buttons' own styling are meant to stay identical across every tour that
 * uses this component. See
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
 * @param props.onRetUsrFun - On Returning User Function: Called when the
 *                            returning-user text button is activated; without
 *                            it, that button isn't shown.
 * @param props.onSkiTouFun - On Skip Tour Function: Called when the secondary,
 *                            skip action button is activated.
 * @param props.parEleArr   - Paragraph Element Array: The body paragraphs
 *                            shown under the title, in order; each entry may
 *                            be a plain string or a JSX fragment.
 * @param props.pilLabArr   - Pills Label Array: An optional array of short
 *                            label strings rendered as small chips below the
 *                            paragraphs; omitted or empty renders no chip row
 *                            at all.
 * @param props.retLabStr   - Returning Label String: The returning-user
 *                            button's own visible text; defaults to "I've
 *                            used Ease My Life before".
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

function IntModCom ( { begLabStr = 'Get started', icoTopEle, onBegTouFun, onRetUsrFun, onSkiTouFun, parEleArr, pilLabArr, retLabStr = "I've used Ease My Life before", skiLabStr = 'Skip', titHeaStr } : ImcProTyp ) : React.ReactPortal {


	const redMotBoo = redMotFun(); // What: Reduced Motion Boolean. Why: The card's own slide-in entrance animation should be skipped when the user prefers reduced motion. How: This calls the shared redMotFun() check once per render.



	const priButRef = React.useRef< HTMLButtonElement | null >( null ); // What: Primary Button Reference. Why: The primary action button needs a stable handle so it can be focused on mount. How: This starts null and is attached to the primary button's own ref prop below.


	React.useEffect( () => { if ( priButRef.current ) priButRef.current.focus( { preventScroll : true } ); }, [] ); // What: Primary Focus Effect. Why: The primary button should be focused on mount so pressing Enter starts the tour right away, without scrolling the modal down to it. How: This focuses priButRef's current button with preventScroll, once, on mount only, guarded so it no-ops if the ref isn't attached yet.



	useModIneFun( priButRef, true ); // What: Modal Inert Call. Why: Tab must stay inside the modal instead of reaching the app behind it. How: This makes everything outside the modal inert for as long as it's mounted, which is only while it's open.



	return createPortal( // What: Modal Portal Return. Why: The modal must lay over the whole app rather than render inside whichever tab mounted it. How: This portals the scrim and its card onto document.body.


		<div
			className={ cssModObj.intScrDiv }

			data-element-name-hook='intScrDiv'

			aria-label={ titHeaStr }
			aria-modal='true'
			role='dialog'
		>{ /* What: Intro Scrim Div Element. Why: This is the modal's own full-viewport, scrollable backdrop. How: This wraps the intro card below and marks itself as an accessible dialog named by titHeaStr. Its data-element-name-hook is read by the Escape-key handler and the test suites. */ }


			<div className={` ${ cssModObj.intCarDiv }   ${ redMotBoo ? '' : cssModObj.intCarDivRise } `}>{ /* What: Intro Card Div Element. Why: This is the actual visible card, separate from the scrim so only it plays the slide-in entrance animation. How: This applies the rise entrance modifier class unless redMotBoo reports the user prefers reduced motion. */ }


				<div className={ cssModObj.icoMarDiv }>{ icoTopEle }</div>{ /* What: Icon Mark Div Element. Why: Every intro modal shows a recognizable glyph above its own title. How: This renders whatever icon node the caller passed in. */ }

				<h2 className={ cssModObj.intTitHea }>{ titHeaStr }</h2>{ /* What: Intro Title Heading Element. Why: Every intro modal needs one visible, accessible heading. How: This renders the titHeaStr prop as an h2. */ }

				{ parEleArr.map( ( parIteEle, parIndNum ) => ( // What: Paragraph Map. Why: Each entry in parEleArr needs to become its own rendered paragraph tag. How: This maps every paragraph entry to a <p>, keyed by its own index since paragraph text can repeat.


					<p
						key={ parIndNum }

						className={ cssModObj.intBodPar }
					>{ parIteEle }</p> // What: Intro Body Paragraph Element. Why: This renders one paragraph of the modal's own body copy. How: This wraps parIteEle, which may be a plain string or a JSX fragment, directly as the tag's own children.


				) ) }

				{ pilLabArr && pilLabArr.length > 0 && ( // What: Pills Visibility Check. Why: Not every intro modal has pills to show. How: This renders the chip row only while pilLabArr holds at least one entry.


					<div className={ cssModObj.chiRowDiv }>{ /* What: Chip Row Div Element. Why: This groups every pill chip together below the paragraphs. How: This renders one span per pilLabArr entry below, in a centered, wrapping row. */ }


						{ pilLabArr.map( ( pilValStr ) => ( // What: Pill Map. Why: One chip is needed per entry in pilLabArr. How: This maps every pilLabArr entry to its own span, keyed by its own text.


							<span
								key={ pilValStr }

								className={ cssModObj.topPilSpa }
							>{ pilValStr }</span> // What: Topic Pill Span Element. Why: This is one small chip labeling a topic the tour touches on. How: This renders pilValStr as the chip's own visible text.


						) ) }


					</div>


				) }

				<div className={ cssModObj.actStaDiv }>{ /* What: Action Stack Div Element. Why: This groups the modal's own primary/secondary action pair in one stack. How: This renders the primary start button, the secondary skip button, and, when onRetUsrFun is passed, the returning-user button below. */ }


					<button
						ref={ priButRef }

						className={` ${ cssModObj.intActBut }   ${ cssModObj.intActButPrimary } `}

						onClick={ onBegTouFun }
					>{ begLabStr }</button>{ /* What: Intro Action Button Element. Why: This is the tour's own main call to action, styled as the primary button. How: This is focused on mount via priButRef and calls onBegTouFun when clicked. */ }

					<button
						className={` ${ cssModObj.intActBut }   ${ cssModObj.intActButGhost } `}

						onClick={ onSkiTouFun }
					>{ skiLabStr }</button>{ /* What: Intro Action Button Element. Why: A user must always be able to decline a tour instead of taking it, so this is styled as the quieter ghost button. How: This calls onSkiTouFun when clicked. */ }

					{ onRetUsrFun && ( // What: Returning User Check. Why: Not every intro modal offers a way past onboarding for someone who has used the app before. How: This shows the text button when the caller passes its handler.


						<button
							className={ cssModObj.intRetBut }

							data-element-name-hook='intRetBut'

							onClick={ onRetUsrFun }
						>{ retLabStr }</button> // What: Intro Return Button Element. Why: Someone restoring a backup or signing in to sync doesn't need onboarding. How: This calls onRetUsrFun when clicked.


					) }


				</div>


			</div>


		</div>,

		document.body // What: Document Body Target. Why: The modal must render outside the app's own DOM subtree so ancestor overflow/stacking never clips or buries it. How: This is createPortal's own target container argument.


	);


}

// #endregion IntModCom

// #endregion Components



// #region Exports

export { IntModCom }; // What: Named Export. Why: The intro modal is this file's one public binding. How: This exports IntModCom by name.

// #endregion Exports


