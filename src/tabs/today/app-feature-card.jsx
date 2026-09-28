


// #region Imports

import React from 'react'; // What: React. Why: AppFeaCom is built directly on React's own APIs. How: This is used directly (React.Fragment) instead of importing individual named hooks.


import { bloReaFun   } from '../../onboarding/app-features.jsx'; // What: Blocked Reason Function. Why: An app-feature tour can require an earlier one first, and its card must explain why it can't start yet. How: This is called with the card's feature id.
import { IcoSvgCom   } from '../../ui/icon.jsx';                 // What: Icon Svg Component. Why: The card's Play and uncheck controls show small glyphs. How: This is rendered inside those buttons.
import { InfTipCom   } from '../../ui/info-tip.jsx';             // What: Info Tip Component. Why: A blocked tour's Play button needs to explain why it is disabled. How: This wraps that button with the blocked reason as its tip.
import { PAG_LAB_OBJ } from '../../onboarding/app-features.jsx'; // What: Page Label Object. Why: The card's meta row names the page its feature lives on. How: This is looked up by the feature's page.

// #endregion Imports



/**
 * app-feature-card.jsx = App Feature Card
 *
 * @summary
 * The Today tab's App Features launcher card: a persistent checklist-style row
 * that starts one app-feature tour, backed by the onboarding appFeatures map,
 * with Play and uncheck controls and an explanation when the tour is blocked.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

// #region AppFeaCom

/**
 * AppFeaCom = App Feature Card Component
 *
 * @summary
 * An "App Features" launcher card: same shape/behavior as a PagTouCom
 * card above, but backed by its own staAppObj.onboarding.appFeatures map
 * instead of the checklist, and with no cheExiBoo celebration-exit
 * animation to key off (App Features isn't part of that "closing card"
 * flow at all, see shoFeaBoo's own comment in TabTodCom for why).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actStoObj   - Action Store Object: The shared app actions.
 * @param props.feaRecObj   - Feature Record Object: The App Features manifest
 *                            entry this card offers.
 * @param props.onPlaTutFun - On Play Tutorial Function: Starts this App
 *                            Feature's own tutorial.
 * @param props.onUncFeaFun - On Uncheck Feature Function: Un-resolves this
 *                            App Feature.
 * @param props.staAppObj   - State App Object: The shared app state.
 *
 * @returns This card's own article element.
 *
 * @example
 * ```tsx
 * AppFeaCom({ actStoObj, feaRecObj, onPlaTutFun, ... }) // => <AppFeaCom />
 * ```
 *
*/

function AppFeaCom ( { actStoObj, feaRecObj, onPlaTutFun, onUncFeaFun, staAppObj } ) {


	const tutDonBoo = !!( staAppObj.onboarding && staAppObj.onboarding.appFeatures && staAppObj.onboarding.appFeatures[ feaRecObj.ideStr ] ); // What: Tutorial Done Boolean. Why: A resolved App Feature card renders/behaves differently from a pending one. How: This reads staAppObj's own onboarding.appFeatures map for feaRecObj's own ideStr.
	const bloReaStr = !tutDonBoo ? bloReaFun( feaRecObj.ideStr, staAppObj ) : null;                                                           // What: Blocked Reason String. Why: A still-pending card can require an earlier one first, and needs its own explanation string when it does. How: This calls bloReaFun only while tutDonBoo is false, otherwise null.


	const onRowCliFun = ( cliEveObj ) => { // What: On Row Click Function. Why: Clicking anywhere on the card (other than its own actions area) should start or un-resolve this feature, unless it is currently blocked. How: This checks the actions-area exclusion and the blocked guard first, then dispatches to onUncFeaFun or onPlaTutFun based on tutDonBoo.


		if ( cliEveObj.target.closest( '[data-element-name-hook="carActDiv"]' ) ) return; // What: Actions Area Guard. Why: A click on the card's own action buttons is handled by those buttons, not the row. How: This bails out when the click landed inside .today-card-actions.



		if ( bloReaStr ) return; // What: Blocked Guard. Why: A feature whose tutorial can't run yet must not start from a row click. How: This bails out while bloReaStr holds a reason.



		if ( tutDonBoo ) onUncFeaFun( feaRecObj.ideStr ); // What: Done Dispatch Branch. Why: A finished App Features card's row click un-resolves it. How: This calls onUncFeaFun with the feature's own id.

		else onPlaTutFun( 'appFeature', feaRecObj.ideStr ); // What: Not-Done Dispatch Branch. Why: An unfinished App Features card's row click starts its tutorial. How: This calls onPlaTutFun with the appFeature kind and id.


	};



	return (


		<article
			className={ ` today-card   today-card--tutorial   ${ tutDonBoo ? 'is-done' : '' }   ${ bloReaStr ? 'is-needed' : '' } ` }

			data-element-name-hook='todCarArt'

			onClick={ onRowCliFun }
		>{ /* What: App Feature Card Article Element. Why: This is AppFeaCom's own root. How: This renders a Play/Undo/blocked check button, the meta/name body, and (while unresolved) a Cancel action. Its data-element-name-hook is read by Today's own drag-to-reorder and card-scroll code. */ }


			{ tutDonBoo ? ( // What: Tutorial Done Check. Why: A resolved App Feature card's checkbox behaves differently from a pending one. How: This renders the undo-check button while tutDonBoo is true, otherwise one of the 2 branches below.


				<button
					className='check'

					type='button'

					aria-label={ `Undo ${ feaRecObj.labStr } tutorial` }
					aria-pressed='true'

					onClick={ ( cliEveObj ) => { // What: Click Handler. Why: This button's own action must not also trigger the card's own row click. How: This stops the click's propagation, then runs the button's own action.


						cliEveObj.stopPropagation();     // What: Propagation Stop. Why: The card's own onRowCliFun would otherwise also fire for this click. How: This stops the event from bubbling up to the article.
						onUncFeaFun( feaRecObj.ideStr ); // What: Uncheck Feature Call. Why: This App Features card should go back to unresolved. How: This calls onUncFeaFun with the feature's own id.


					} }
				>{ /* What: Undo Check Button Element. Why: A resolved App Feature card can be un-resolved directly from its own check button, unlike a pending one. How: This calls onUncFeaFun. */ }


					<span
						className='check-ripple'

						aria-hidden='true'
					/>{ /* What: Check Ripple Span Element. Why: A completed check needs the same ripple flourish every other done row gets. How: This is a purely decorative, empty span. */ }

					<IcoSvgCom
						icoNamStr='cheEle'
						sizValNum={ 14 }
					/>{ /* What: Icon Svg Component. Why: A resolved card needs a checkmark glyph. How: This renders the 'cheEle' icon at a fixed size. */ }


				</button>


			) : bloReaStr ? ( // What: Blocked Feature Check. Why: A pending, blocked feature needs an explained disabled control instead of a working one. How: This renders the disabled InfTipCom while bloReaStr holds a reason, the real play-check button otherwise.


				<InfTipCom
					className='check is-disabled'

					actNamStr={ `Start the ${ feaRecObj.labStr } tutorial` }
					labTexStr={ bloReaStr }
				>{ /* What: Info Tip Component. Why: A blocked feature's own disabled check button still needs to explain WHY it is blocked. How: This wraps a disabled-looking play icon with bloReaStr. */ }


					<IcoSvgCom
						icoNamStr='plaEle'
						sizValNum={ 13 }
					/>{ /* What: Icon Svg Component. Why: The disabled check button still needs its own recognizable play glyph. How: This renders the 'plaEle' icon at a fixed size. */ }


				</InfTipCom>


			) : ( // What: Play Check Branch. Why: A pending, unblocked feature needs its own real play-to-start checkbox instead. How: This renders the else branch, taken while bloReaStr is falsy.


				<button
					className='check'

					type='button'

					aria-label={ `Start the ${ feaRecObj.labStr } tutorial` }

					onClick={ ( cliEveObj ) => { // What: Click Handler. Why: This button's own action must not also trigger the card's own row click. How: This stops the click's propagation, then runs the button's own action.


						cliEveObj.stopPropagation();                   // What: Propagation Stop. Why: The card's own onRowCliFun would otherwise also fire for this click. How: This stops the event from bubbling up to the article.
						onPlaTutFun( 'appFeature', feaRecObj.ideStr ); // What: Play Tutorial Call. Why: This card's own tutorial should start playing. How: This calls onPlaTutFun with the tutorial kind and id.


					} }
				>{ /* What: Play Check Button Element. Why: A pending, unblocked App Feature card's own check button starts its tutorial instead of toggling done. How: This calls onPlaTutFun, scoped to 'appFeature'. */ }


					<IcoSvgCom
						icoNamStr='plaEle'
						sizValNum={ 13 }
					/>{ /* What: Icon Svg Component. Why: A pending card needs a play glyph inviting the user to start its tutorial. How: This renders the 'plaEle' icon at a fixed size. */ }


				</button>


			) }



			<div className='today-card-body'>{ /* What: Card Body Div Element. Why: The meta row and name row read as one grouped block. How: This wraps the meta row and the name div below. */ }


				<div className='today-card-meta'>{ /* What: Card Meta Div Element. Why: The feature's own page label and its optional time estimate sit together. How: This wraps the page-label span and, when one exists, the time estimate. */ }


					<span className='meta-picker'>{ PAG_LAB_OBJ[ feaRecObj.pagStr ] }</span>{ /* What: Meta Picker Span Element. Why: The user needs to see which page this App Feature lives on. How: This looks up feaRecObj's own pagStr in PAG_LAB_OBJ. */ }



					{ feaRecObj.timStr && ( // What: Time Estimate Check. Why: Not every App Feature card has a manually-timed estimate. How: This renders the dot/time pair only while feaRecObj's own timStr is set.


						<React.Fragment>{ /* What: Time Estimate Fragment Element. Why: The separator dot and the time text are true siblings with no shared wrapper of their own. How: This groups both spans without adding an extra DOM node. */ }


							<span className='meta-dot'>&middot;</span>{ /* What: Meta Dot Span Element. Why: The page label and the time estimate need a small visual separator between them. How: This renders a literal middle-dot character. */ }

							<span className='meta-time'>{ feaRecObj.timStr }</span>{ /* What: Meta Time Span Element. Why: A time estimate helps the user judge how long this tutorial takes. How: This renders feaRecObj's own time. */ }


						</React.Fragment>


					) }


				</div>

				<div className='today-card-name'>{ feaRecObj.labStr }</div>{ /* What: Card Name Div Element. Why: This is the card's own main display text. How: This renders feaRecObj's own label directly. */ }


			</div>


			{ !tutDonBoo && ( // What: Cancel Action Visibility Check. Why: A resolved card has nothing left to cancel. How: This renders the Cancel action only while tutDonBoo is false.


				<div
					className='today-card-actions'

					data-element-name-hook='carActDiv'
				>{ /* What: Card Actions Div Element. Why: A pending card offers a Cancel action distinct from resolving it. How: This wraps the single Cancel icon-button below. Its data-element-name-hook is read by each Today card's own row-click handler, which ignores clicks inside it. */ }


					<button
						className='icon-btn'

						aria-label='Cancel tutorial'
						title='Cancel'

						onClick={ ( cliEveObj ) => { // What: Click Handler. Why: This button's own action must not also trigger the card's own row click. How: This stops the click's propagation, then runs the button's own action.


							cliEveObj.stopPropagation();                                       // What: Propagation Stop. Why: The card's own onRowCliFun would otherwise also fire for this click. How: This stops the event from bubbling up to the article.
							actStoObj.setFeaFun( feaRecObj.ideStr, { status : 'cancelled' } ); // What: Cancel Feature Call. Why: The user is dismissing this App Features card entirely. How: This marks the feature cancelled via actStoObj.setFeaFun.


						} }
					>{ /* What: Cancel Icon Button Element. Why: Cancelling marks this card resolved without actually finishing its tutorial. How: This calls actStoObj.setFeaFun with a 'cancelled' status. */ }


						<IcoSvgCom
							icoNamStr='croEle'
							sizValNum={ 15 }
						/>{ /* What: Icon Svg Component. Why: The Cancel action needs a recognizable dismiss glyph. How: This renders the 'croEle' icon at a fixed size. */ }


					</button>


				</div>


			) }


		</article>


	);


}

// #endregion AppFeaCom

// #endregion Components



// #region Exports

export { AppFeaCom }; // What: Named Export. Why: The Today tab renders one card per app feature. How: This exports AppFeaCom by name.

// #endregion Exports


