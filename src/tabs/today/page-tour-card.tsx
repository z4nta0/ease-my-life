


// #region Imports

import cssModObj from './page-tour-card.module.css'; // What: CSS Module Object. Why: The page tour card is styled from its own module. How: This maps each class name in page-tour-card.module.css to its hashed module class.
import React     from 'react';                       // What: React. Why: PagTouCom is built directly on React's own APIs. How: This is used directly (React.Fragment) instead of importing individual named hooks.


import { IcoSvgCom   } from '../../ui/icon.tsx';                   // What: Icon Svg Component. Why: The card's Play and uncheck controls show small glyphs. How: This is rendered inside those buttons.
import { ONB_CHE_OBJ } from '../../state/onboarding-checklist.ts'; // What: Onboarding Checklist Object. Why: A page tour's card shows whether that tour is already done. How: This is called via ONB_CHE_OBJ.entLooFun.


import type { ActStoTyp } from '../../state/store.ts';     // What: Action Store Type. Why: The card changes state through the store's actions. How: This types PtoProTyp's actStoObj.
import type { StaAppTyp } from '../../core/data-model.ts'; // What: State App Type. Why: The card reads whether its tour is done. How: This types PtoProTyp's staAppObj.

// #endregion Imports



/**
 * page-tour-card.tsx = Page Tour Card
 *
 * @summary
 * The Today tab's Page Tours launcher card: a persistent checklist-style row
 * that starts one page tour, with Play and uncheck controls and only the
 * checklist bookkeeping behind it.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

type PtoProTyp = { actStoObj : ActStoTyp, cheExiBoo : boolean, onPlaTutFun : ( kinStr : string, ideStr : string ) => void, onUncTutFun : ( ideStr : string ) => void, staAppObj : StaAppTyp, touRecObj : { ideStr : string, labStr : string, timStr : string } }; // What: Page-Tour-Component Props Type. Why: A page tour's launcher card starts or un-resolves its tour and reads whether it's done. How: This types PagTouCom's props, named Pto since Ptc, Poc, and Puc already belong to other components.

// #region PagTouCom

/**
 * PagTouCom = Page Tour Component
 *
 * @summary
 * A "Page Tours" launcher card: same shape/behavior as a picker's
 * tutorial card (persistent, checked/unchecked toggle, Play/X, see
 * EntCarCom's own tutorial branch above), just with no sample picker/
 * task backing it: no data to finish/skip/cancel, only the checklist
 * bookkeeping itself.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actStoObj   - Action Store Object: The shared app actions.
 * @param props.cheExiBoo   - Checklist Exiting Boolean: Whether the
 *                            checklist's own closing exit animation is
 *                            currently playing.
 * @param props.onPlaTutFun - On Play Tutorial Function: Starts this page tour.
 * @param props.onUncTutFun - On Uncheck Tutorial Function: Un-resolves this
 *                            page tour's own checklist entry.
 * @param props.staAppObj   - State App Object: The shared app state.
 * @param props.touRecObj   - Tour Record Object: The page-tour manifest entry
 *                            this card offers.
 *
 * @returns This card's own article element.
 *
 * @example
 * ```tsx
 * PagTouCom({ actStoObj, cheExiBoo, onPlaTutFun, ... }) // => <PagTouCom />
 * ```
 *
*/

function PagTouCom ( { actStoObj, cheExiBoo, onPlaTutFun, onUncTutFun, staAppObj, touRecObj } : PtoProTyp ) : React.JSX.Element {


	const tutDonBoo = !!ONB_CHE_OBJ.entLooFun( staAppObj, touRecObj.ideStr ); // What: Tutorial Done Boolean. Why: A resolved page-tour card renders/behaves differently from a pending one. How: This checks ONB_CHE_OBJ for an existing entry against touRecObj's own id.


	const onRowCliFun = ( cliEveObj : React.MouseEvent ) => { // What: On Row Click Function. Why: Clicking anywhere on the card (other than its own actions area) should start or un-resolve this tour. How: This checks for a click inside the actions area first, then dispatches to onUncTutFun or onPlaTutFun based on tutDonBoo.


		if ( ( cliEveObj.target as Element ).closest( '[data-element-name-hook~="carActDiv"]' ) ) return; // What: Actions Area Guard. Why: A click on the card's own action buttons is handled by those buttons, not the row. How: This bails out when the click landed inside carActDiv. // What: Event Target Note. Why: An event's target is typed as a plain EventTarget. How: It's read as an element here, since a click on a card always lands on one.



		if ( tutDonBoo ) onUncTutFun( touRecObj.ideStr ); // What: Done Dispatch Branch. Why: A finished page-tour card's row click un-resolves it. How: This calls onUncTutFun with the tour's own id.

		else onPlaTutFun( 'pageTour', touRecObj.ideStr ); // What: Not-Done Dispatch Branch. Why: An unfinished page-tour card's row click starts its tour. How: This calls onPlaTutFun with the pageTour kind and id.


	};



	return (


		<article
			className={` ${ cssModObj.todCarArt }   ${ cheExiBoo ? cssModObj.todCarArtRemoving : '' } `}

			data-card-done-active={ tutDonBoo || undefined } // What: Card Done Active Attribute. Why: A finished tour's card dims, fills its check, and strikes its text through from its module. How: This sets the presence-only attribute while tutDonBoo is true and removes it otherwise.
			data-element-name-hook='todCarArt tutCarArt'

			onClick={ onRowCliFun }
		>{ /* What: Page Tour Card Article Element. Why: This is PagTouCom's own root. How: This renders a Play/Undo check button, the meta/name body, and (while unresolved) a Cancel action. Its data-element-name-hook is read by Today's own drag-to-reorder and card-scroll code and help mode's Today catalog. */ }


			{ tutDonBoo ? ( // What: Tutorial Done Check. Why: A resolved page-tour card's checkbox behaves differently from a pending one. How: This renders the undo-check button while tutDonBoo is true, the play-check button otherwise.


				<button
					className={ cssModObj.carCheBut }

					data-element-name-hook='carCheBut'

					type='button'

					aria-label={ `Undo ${ touRecObj.labStr } tour` }
					aria-pressed='true'

					onClick={ ( cliEveObj ) => { // What: Click Handler. Why: This button's own action must not also trigger the card's own row click. How: This stops the click's propagation, then runs the button's own action.


						cliEveObj.stopPropagation();     // What: Propagation Stop. Why: The card's own onRowCliFun would otherwise also fire for this click. How: This stops the event from bubbling up to the article.
						onUncTutFun( touRecObj.ideStr ); // What: Uncheck Tutorial Call. Why: This card's own tutorial should go back to unresolved. How: This calls onUncTutFun with the card's own id.


					} }
				>{ /* What: Undo Check Button Element. Why: A resolved page-tour card can be un-resolved directly from its own check button, unlike a pending one. How: This calls onUncTutFun, scoped to 'pageTour'. Its data-element-name-hook is read by help mode's Today catalog. */ }


					<span
						className={ cssModObj.cheRipSpa }

						aria-hidden='true'
					/>{ /* What: Check Ripple Span Element. Why: A completed check needs the same ripple flourish every other done row gets. How: This is a purely decorative, empty span. */ }

					<IcoSvgCom
						className={ cssModObj.cheIcoSvg }

						icoNamStr='cheEle'
						sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
					/>{ /* What: Icon Svg Component. Why: A resolved card needs a checkmark glyph. How: This renders the 'cheEle' icon at a fixed size. */ }


				</button>


			) : ( // What: Play Check Branch. Why: A pending page tour needs its own play-to-start checkbox instead. How: This renders the else branch, taken while tutDonBoo is false.


				<button
					className={ cssModObj.carCheBut }

					data-element-name-hook='carCheBut'

					type='button'

					aria-label={ `Start the ${ touRecObj.labStr } tour` }

					onClick={ ( cliEveObj ) => { // What: Click Handler. Why: This button's own action must not also trigger the card's own row click. How: This stops the click's propagation, then runs the button's own action.


						cliEveObj.stopPropagation();                 // What: Propagation Stop. Why: The card's own onRowCliFun would otherwise also fire for this click. How: This stops the event from bubbling up to the article.
						onPlaTutFun( 'pageTour', touRecObj.ideStr ); // What: Play Tutorial Call. Why: This card's own tutorial should start playing. How: This calls onPlaTutFun with the tutorial kind and id.


					} }
				>{ /* What: Play Check Button Element. Why: A pending page-tour card's own check button starts the tour instead of toggling done. How: This calls onPlaTutFun, scoped to 'pageTour'. Its data-element-name-hook is read by help mode's Today catalog. */ }


					<IcoSvgCom
						icoNamStr='plaEle'
						sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
					/>{ /* What: Icon Svg Component. Why: A pending card needs a play glyph inviting the user to start the tour. How: This renders the 'plaEle' icon at a fixed size. */ }


				</button>


			) }


			<div className={ cssModObj.carBodDiv }>{ /* What: Card Body Div Element. Why: The meta row and name row read as one grouped block. How: This wraps the meta row and the name div below. */ }


				<div className={ cssModObj.carMetDiv }>{ /* What: Card Meta Div Element. Why: The tour's own label and its optional time estimate sit together. How: This wraps the label span and, when one exists, the time estimate. */ }


					<span>{ touRecObj.labStr } Tour</span>{ /* What: Meta Picker Span Element. Why: The user needs to see which page tour this card offers. How: This renders touRecObj's own label plus the literal word "Tour". */ }



					{ touRecObj.timStr && ( // What: Time Estimate Check. Why: Not every page-tour card has a manually-timed estimate. How: This renders the dot/time pair only while touRecObj's own time is set.


						<React.Fragment>{ /* What: Time Estimate Fragment Element. Why: The separator dot and the time text are true siblings with no shared wrapper of their own. How: This groups both spans without adding an extra DOM node. */ }


							<span className={ cssModObj.metDotSpa }>&middot;</span>{ /* What: Meta Dot Span Element. Why: The label and the time estimate need a small visual separator between them. How: This renders a literal middle-dot character. */ }

							<span>{ touRecObj.timStr }</span>{ /* What: Meta Time Span Element. Why: A time estimate helps the user judge how long this tour takes. How: This renders touRecObj's own time. */ }


						</React.Fragment>


					) }


				</div>

				<div className={ cssModObj.carNamDiv }>Take a quick tour of the { touRecObj.labStr } page</div>{ /* What: Card Name Div Element. Why: This is the card's own call-to-action text. How: This renders the fixed phrasing with touRecObj's own label interpolated. */ }


			</div>


			{ !tutDonBoo && ( // What: Cancel Action Visibility Check. Why: A resolved card has nothing left to cancel. How: This renders the Cancel action only while tutDonBoo is false.


				<div
					className={ cssModObj.carActDiv }

					data-element-name-hook='carActDiv'
				>{ /* What: Card Actions Div Element. Why: A pending card offers a Cancel action distinct from resolving it. How: This wraps the single Cancel icon-button below. Its data-element-name-hook is read by each Today card's own row-click handler, which ignores clicks inside it and help mode's Today catalog. */ }


					<button
						className={ cssModObj.actIcoBut }

						aria-label='Cancel tutorial'
						title='Cancel'

						onClick={ ( cliEveObj ) => { // What: Click Handler. Why: This button's own action must not also trigger the card's own row click. How: This stops the click's propagation, then runs the button's own action.


							cliEveObj.stopPropagation();                                       // What: Propagation Stop. Why: The card's own onRowCliFun would otherwise also fire for this click. How: This stops the event from bubbling up to the article.
							actStoObj.setCarFun( touRecObj.ideStr, { status : 'cancelled' } ); // What: Cancel Tutorial Call. Why: The user is dismissing this tutorial card entirely. How: This marks the checklist entry cancelled via actStoObj.setCarFun.


						} }
					>{ /* What: Cancel Icon Button Element. Why: Cancelling marks this card resolved without actually finishing the tour. How: This calls actStoObj.setCarFun with a 'cancelled' status. */ }


						<IcoSvgCom
							icoNamStr='croEle'
							sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
						/>{ /* What: Icon Svg Component. Why: The Cancel action needs a recognizable dismiss glyph. How: This renders the 'croEle' icon at a fixed size. */ }


					</button>


				</div>


			) }


		</article>


	);


}

// #endregion PagTouCom

// #endregion Components



// #region Exports

export { PagTouCom }; // What: Named Export. Why: The Today tab renders one card per page tour. How: This exports PagTouCom by name.

// #endregion Exports


