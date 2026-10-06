


// #region Imports

import cssModObj from './entry-card.module.css'; // What: CSS Module Object. Why: Every Today entry card variant is styled from its own module. How: This maps each class name in entry-card.module.css to its hashed module class.
import React     from 'react';                   // What: React. Why: EntCarCom is built directly on React's own APIs. How: This is used directly (React.Fragment) instead of importing individual named hooks.


import { IcoSvgCom   } from '../../ui/icon.tsx';                   // What: Icon Svg Component. Why: The card's check, grip and action buttons show small glyphs. How: This is rendered inside those controls.
import { InfTipCom   } from '../../ui/info-tip.tsx';               // What: Info Tip Component. Why: Disabled actions and several card states need an inline explanation. How: This wraps those controls with their explanatory tips.
import { ONB_CHE_OBJ } from '../../state/onboarding-checklist.ts'; // What: Onboarding Checklist Object. Why: A tutorial card needs attention while no real picker exists yet. How: This is called via ONB_CHE_OBJ.reaPicFun.
import { ONB_PCT_OBJ } from '../../state/onboarding-seed-data.ts'; // What: Onboarding Picker-Card-Time Object. Why: A sample picker's tutorial card shows an estimated time. How: This is looked up by the card's picker id.
import { PIC_NAM_OBJ } from '../../core/pickers.ts';               // What: Pickers Namespace Object. Why: An ease-up card's Re-roll is only offered while another item is charged. How: This is called via PIC_NAM_OBJ.easEliFun to count the eligible items.


import type { ActStoTyp } from '../../state/store.ts';     // What: Action Store Type. Why: The card changes state through the store's actions. How: This types EccProTyp's actStoObj.
import type { StaAppTyp } from '../../core/data-model.ts'; // What: State App Type. Why: The card reads its item and picker details from the app state. How: This types EccProTyp's staAppObj.
import type { TodRowTyp } from './group-entries.ts';       // What: Today Row Type. Why: A card renders one grouped Today row. How: This types EccProTyp's entry and picker.

// #endregion Imports



/**
 * entry-card.tsx = Entry Card
 *
 * @summary
 * One row in the Today list: a real picked item, a mini-tour launcher card, a
 * day-off card, or a charging card, chosen by the entry's kind. It carries the
 * row's done toggle, Re-roll and Skip actions, Edit Mode grip and inline item
 * editor.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

type EccProTyp = { actStoObj : ActStoTyp, cheExiBoo : boolean, draNamStr? : string, ediModBoo : boolean, entRecObj : TodRowTyp[ 'entRecObj' ], isaEdiBoo : boolean, isaRmvBoo : boolean, isaRolBoo : boolean, jusCheStr : string | null, onGriDowFun : ( poiEveObj : React.PointerEvent< HTMLElement > ) => void, onPlaTutFun : ( kinStr : string, ideStr : string ) => void, onRenIteFun : ( curNamStr : string ) => void, onRerEntFun : ( entRecObj : TodRowTyp[ 'entRecObj' ], picRecObj : TodRowTyp[ 'picRecObj' ] ) => void, onSkiEntFun : ( entIdeStr : string ) => void, onTogDonFun : ( entRecObj : TodRowTyp[ 'entRecObj' ] ) => void, onTogEdiFun : () => void, onUncTutFun : ( ideStr : string ) => void, picRecObj : TodRowTyp[ 'picRecObj' ], staAppObj : StaAppTyp }; // What: Entry-Card-Component Props Type. Why: An entry card renders one Today row, a pick, day-off, charging, or tutorial card, with its check, skip, reroll, rename, and drag actions. How: This types EntCarCom's props, its entry and picker taken from the grouped row they come from.

// #region EntCarCom

/**
 * EntCarCom = Entry Card Component
 *
 * @summary
 * Renders one row in the Today list: a real picked item, a mini-tour
 * launcher card (a hidden sample picker still offering its own
 * tutorial), a day-off card (a triggered conditional suppressing its
 * dependent pickers), or a charging card (an ease-up picker with
 * nothing charged to its own threshold today). Which of the four
 * renders is decided entirely by entRecObj.kind, checked in that order.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actStoObj   - Action Store Object: The shared app actions.
 * @param props.cheExiBoo   - Checklist Exiting Boolean: Whether the
 *                            checklist's own closing exit animation is
 *                            currently playing (tutorial rows only).
 * @param props.draNamStr   - Draft Name String: The open editor's draft name,
 *                            shown in the name input instead of the real one,
 *                            or undefined when this row isn't being edited.
 * @param props.ediModBoo   - Edit Mode Boolean: Whether Edit Mode is currently
 *                            on.
 * @param props.entRecObj   - Entry Record Object: The entry (or synthetic
 *                            tutorial/day-off/charging row) this card renders.
 * @param props.isaEdiBoo   - Is-An Editing Boolean: Whether this row's own
 *                            inline editor is open.
 * @param props.isaRmvBoo   - Is-A Removing Boolean: Whether this row is mid-
 *                            removal animation.
 * @param props.isaRolBoo   - Is-A Rolling Boolean: Whether this row is mid-
 *                            reroll animation.
 * @param props.jusCheStr   - Just Checked String: The eid of whichever entry
 *                            was just checked, for the brief "fresh" cue.
 * @param props.onGriDowFun - On Grip Down Function: Starts a within-group drag
 *                            from this row's own grip handle.
 * @param props.onPlaTutFun - On Play Tutorial Function: Starts this row's own
 *                            mini-tour (tutorial rows only).
 * @param props.onRenIteFun - On Rename Item Function: Writes a typed name
 *                            into the open editor's draft.
 * @param props.onRerEntFun - On Reroll Entry Function: Re-rolls this row to a
 *                            different item.
 * @param props.onSkiEntFun - On Skip Entry Function: Skips (removes) this row
 *                            entirely.
 * @param props.onTogDonFun - On Toggle Done Function: Toggles this row's own
 *                            done state.
 * @param props.onTogEdiFun - On Toggle Editor Function: Toggles this row's own
 *                            inline editor.
 * @param props.onUncTutFun - On Uncheck Tutorial Function: Un-resolves this
 *                            row's own mini-tour (tutorial rows only).
 * @param props.picRecObj   - Picker Record Object: The entry's own resolved
 *                            picker (or a picker-shaped stand-in for a day-off
 *                            row).
 * @param props.staAppObj   - State App Object: The shared app state.
 *
 * @returns Exactly one of the tutorial/day-off/charging/real-pick
 * article elements, chosen by entRecObj.kind, or null when the row's own
 * item can no longer be found at all.
 *
 * @example
 * ```tsx
 * EntCarCom({ actStoObj, cheExiBoo, draNamStr, ... }) // => <EntCarCom />
 * ```
 *
*/

function EntCarCom ( { actStoObj, cheExiBoo, draNamStr, ediModBoo, entRecObj, isaEdiBoo, isaRmvBoo, isaRolBoo, jusCheStr, onGriDowFun, onPlaTutFun, onRenIteFun, onRerEntFun, onSkiEntFun, onTogDonFun, onTogEdiFun, onUncTutFun, picRecObj, staAppObj } : EccProTyp ) : React.JSX.Element | null {


	// #region Tutorial Branch

	if ( entRecObj.kind === 'tutorial' ) { // What: Tutorial Branch. Why: A mini-tour launcher card renders entirely differently from a real pick, with no item/reroll/skip of its own. How: This returns a dedicated article and skips every other branch below.


		const tutDonBoo = entRecObj.done;                                         // What: Tutorial Done Boolean. Why: A resolved tutorial card renders/behaves differently from a pending one. How: This reads entRecObj's own done flag.
		const neeAttBoo = !tutDonBoo && ONB_CHE_OBJ.reaPicFun( staAppObj ) === 0; // What: Needs Attention Boolean. Why: Only picker cards participate in the "at least one real picker" gate that blocks the closing Generate card, flagged with a visible cue rather than requiring a tap to discover. How: This is true only while this card is unresolved and no real picker exists yet.


		const onRowCliFun = ( cliEveObj : React.MouseEvent ) => { // What: On Row Click Function. Why: Clicking anywhere on the card (other than its own actions area) should start or un-resolve this sample's own mini-tour. How: This checks for a click inside the actions area first, then dispatches to onUncTutFun or onPlaTutFun based on tutDonBoo.


			if ( ( cliEveObj.target as Element ).closest( '[data-element-name-hook~="carActDiv"]' ) ) return; // What: Actions Area Guard. Why: A click on the card's own action buttons is handled by those buttons, not the row. How: This bails out when the click landed inside carActDiv. // What: Event Target Note. Why: An event's target is typed as a plain EventTarget. How: It's read as an element here, since a click on a card always lands on one.



			if ( tutDonBoo ) onUncTutFun( picRecObj.id ); // What: Done Dispatch Branch. Why: A finished tutorial card's row click un-resolves it. How: This calls onUncTutFun with the picker's own id.

			else onPlaTutFun( 'picker', picRecObj.id ); // What: Not-Done Dispatch Branch. Why: An unfinished tutorial card's row click starts its mini-tour. How: This calls onPlaTutFun with the picker kind and id.


		};



		return (


			<article
				className={` ${ cssModObj.todCarArt }   ${ cssModObj.todCarArtTutorial }   ${ cheExiBoo ? cssModObj.todCarArtRemoving : '' } `}

				data-card-done-active={ tutDonBoo || undefined } // What: Card Done Active Attribute. Why: A done card is shaded, its checkbox filled, and its name struck through by its module. How: This sets the presence-only attribute while tutDonBoo is true.
				data-card-needed-active={ neeAttBoo || undefined } // What: Card Needed Active Attribute. Why: While no real picker exists, the tutorial card asks for attention in a warm tint. How: This sets the presence-only attribute while neeAttBoo is true.
				data-element-name-hook='todCarArt tutCarArt'

				onClick={ onRowCliFun }
			>{ /* What: Tutorial Card Article Element. Why: This is EntCarCom's own root for a mini-tour launcher row. How: This renders a Play/Undo check button, the meta/name body, and (while unresolved) a Cancel action. Its data-element-name-hook is read by Today's own drag-to-reorder and card-scroll code and help mode's Today catalog. */ }


				{ tutDonBoo ? ( // What: Tutorial Done Check. Why: A resolved sample card's checkbox behaves differently from a pending one. How: This renders the undo-check button while tutDonBoo is true, the play-check button otherwise.


					<button
						className={ cssModObj.carCheBut }

						data-element-name-hook='carCheBut'

						type='button'

						aria-label={ `Undo ${ picRecObj.name } tutorial` }
						aria-pressed='true'

						onClick={ ( cliEveObj ) => { // What: Click Handler. Why: This button's own action must not also trigger the card's own row click. How: This stops the click's propagation, then runs the button's own action.


							cliEveObj.stopPropagation(); // What: Propagation Stop. Why: The card's own onRowCliFun would otherwise also fire for this click. How: This stops the event from bubbling up to the article.
							onUncTutFun( picRecObj.id ); // What: Uncheck Tutorial Call. Why: This card's own tutorial should go back to unresolved. How: This calls onUncTutFun with the card's own id.


						} }
					>{ /* What: Undo Check Button Element. Why: A resolved tutorial card can be un-resolved directly from its own check button, unlike a pending one. How: This calls onUncTutFun, scoped to 'picker'. Its data-element-name-hook is read by help mode's Today catalog. */ }


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


				) : ( // What: Play Check Branch. Why: A pending sample needs its own play-to-start checkbox instead. How: This renders the else branch, taken while tutDonBoo is false.


					<button
						className={ cssModObj.carCheBut }

						data-element-name-hook='carCheBut'

						type='button'

						aria-label={ `Start the ${ picRecObj.name } tutorial` }

						onClick={ ( cliEveObj ) => { // What: Click Handler. Why: This button's own action must not also trigger the card's own row click. How: This stops the click's propagation, then runs the button's own action.


							cliEveObj.stopPropagation();           // What: Propagation Stop. Why: The card's own onRowCliFun would otherwise also fire for this click. How: This stops the event from bubbling up to the article.
							onPlaTutFun( 'picker', picRecObj.id ); // What: Play Tutorial Call. Why: This card's own tutorial should start playing. How: This calls onPlaTutFun with the tutorial kind and id.


						} }
					>{ /* What: Play Check Button Element. Why: A pending tutorial card's own check button starts its mini-tour instead of toggling done. How: This calls onPlaTutFun, scoped to 'picker'. Its data-element-name-hook is read by help mode's Today catalog. */ }


						<IcoSvgCom
							icoNamStr='plaEle'
							sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
						/>{ /* What: Icon Svg Component. Why: A pending card needs a play glyph inviting the user to start its tutorial. How: This renders the 'plaEle' icon at a fixed size. */ }


					</button>


				) }


				<div className={ cssModObj.carBodDiv }>{ /* What: Card Body Div Element. Why: The meta row and name row read as one grouped block. How: This wraps the meta row and the name div below. */ }


					<div className={ cssModObj.carMetDiv }>{ /* What: Card Meta Div Element. Why: The picker's own name and its optional time estimate sit together. How: This wraps the picker-name span and, when one exists, the time estimate. */ }


						<span>{ picRecObj.name }</span>{ /* What: Meta Picker Span Element. Why: The user needs to see which sample picker this card offers. How: This renders picRecObj's own name. */ }



						{ ONB_PCT_OBJ[ picRecObj.id ] && ( // What: Time Estimate Check. Why: Not every sample picker card has a manually-timed estimate. How: This renders the dot/time pair only while ONB_PCT_OBJ has an entry for picRecObj's own id.


							<React.Fragment>{ /* What: Time Estimate Fragment Element. Why: The separator dot and the time text are true siblings with no shared wrapper of their own. How: This groups both spans without adding an extra DOM node. */ }


								<span className={ cssModObj.metDotSpa }>&middot;</span>{ /* What: Meta Dot Span Element. Why: The picker name and the time estimate need a small visual separator between them. How: This renders a literal middle-dot character. */ }

								<span>{ ONB_PCT_OBJ[ picRecObj.id ] }</span>{ /* What: Meta Time Span Element. Why: A manually-timed estimate helps the user judge how long this tutorial takes. How: This renders the looked-up estimate for picRecObj's own id. */ }


							</React.Fragment>


						) }


					</div>

					<div className={ cssModObj.carNamDiv }>Set up a { picRecObj.name } picker</div>{ /* What: Card Name Div Element. Why: This is the card's own call-to-action text. How: This renders the fixed phrasing with picRecObj's own name interpolated. */ }


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


								cliEveObj.stopPropagation();                                   // What: Propagation Stop. Why: The card's own onRowCliFun would otherwise also fire for this click. How: This stops the event from bubbling up to the article.
								actStoObj.setCarFun( picRecObj.id, { status : 'cancelled' } ); // What: Cancel Tutorial Call. Why: The user is dismissing this tutorial card entirely. How: This marks the checklist entry cancelled via actStoObj.setCarFun.


							} }
						>{ /* What: Cancel Icon Button Element. Why: Cancelling marks this card resolved without actually finishing its tutorial. How: This calls actStoObj.setCarFun with a 'cancelled' status. */ }


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

	// #endregion Tutorial Branch



	// #region Day-Off Branch

	if ( entRecObj.kind === 'dayoff' ) { // What: Day-Off Branch. Why: A triggered conditional's own day-off card renders like a completable row, but with no item, no re-roll, and no editable name. How: This returns a dedicated article and skips every other branch below.


		const daoFreBoo = jusCheStr === entRecObj.eid && entRecObj.done;                                                         // What: Day-Off Fresh Boolean. Why: This row's own brief "fresh" cue only plays right after IT specifically was just checked done. How: This compares jusCheStr against entRecObj's own eid, and requires done to already be true.
		const disTipStr = 'This action is disabled for this type of item.';                                                      // What: Disabled Tip String. Why: Every disabled action icon on this row shares the exact same explanation. How: This is passed as every InfTipCom's own label below.
		const daoTitStr = entRecObj.pickerName ? `${ entRecObj.pickerName } · ${ entRecObj.condName || 'Day off' }` : 'Day off'; // What: Day-Off Title String. Why: The truncatable title tooltip needs the full "{picker} · {conditional}" text even when the visible row itself wraps or truncates it. How: This combines entRecObj's own pickerName/condName, falling back to a plain "Day off" when no picker name is recorded.


		const onRowCliFun = ( cliEveObj : React.MouseEvent ) => { // What: On Row Click Function. Why: Clicking anywhere on the row (other than its own actions area) should toggle done, but only outside Edit Mode and while not mid-removal. How: This checks both exclusion conditions first, then calls onTogDonFun.


			if ( ediModBoo || isaRmvBoo ) return; // What: Busy Row Guard. Why: A row being dragged in Edit Mode, or already animating out, must not toggle. How: This bails out while ediModBoo or isaRmvBoo is true.



			if ( ( cliEveObj.target as Element ).closest( '[data-element-name-hook~="carActDiv"]' ) ) return; // What: Actions Area Guard. Why: A click on the card's own action buttons is handled by those buttons, not the row. How: This bails out when the click landed inside carActDiv. // What: Event Target Note. Why: An event's target is typed as a plain EventTarget. How: It's read as an element here, since a click on a card always lands on one.



			onTogDonFun( entRecObj ); // What: Check Toggle Call. Why: A plain row click toggles the row's own done state. How: This calls onTogDonFun with the row's own entry.


		};



		return (


			<article
				className={` ${ cssModObj.todCarArt }   ${ cssModObj.todCarArtDayoff }   ${ daoFreBoo ? cssModObj.todCarArtFresh : '' }   ${ isaRmvBoo ? cssModObj.todCarArtRemoving : '' } `}

				data-card-done-active={ entRecObj.done || undefined } // What: Card Done Active Attribute. Why: A done card is shaded, its checkbox filled, and its name struck through by its module. How: This sets the presence-only attribute while entRecObj.done is true.
				data-card-reorder-active={ ediModBoo || undefined } // What: Card Reorder Active Attribute. Why: In Edit Mode the card turns into a dashed, draggable outline. How: This sets the presence-only attribute while ediModBoo is true.
				data-element-name-hook='todCarArt daoCarArt'

				onClick={ onRowCliFun }
			>{ /* What: Day-Off Card Article Element. Why: This is EntCarCom's own root for a day-off row. How: This renders a grip (Edit Mode) or check button, the meta/name body, and (outside Edit Mode) a disabled re-roll/edit plus a working Skip. Its data-element-name-hook is read by Today's own drag-to-reorder and card-scroll code and help mode's Today catalog. */ }


				{ ediModBoo ? ( // What: Edit Mode Check. Why: The row's own leading control swaps between a drag grip and a check button depending on whether Edit Mode is active. How: This renders the grip handle while ediModBoo is true, the check button otherwise.


					<span
						className={ cssModObj.carGriSpa }

						data-element-name-hook='carGriSpa'

						draggable={ false }

						aria-label='Drag to reorder'
						role='button'
						tabIndex={ 0 }

						onDragStart={ ( draEveObj ) => draEveObj.preventDefault() }
						onPointerDown={ ( poiEveObj ) => onGriDowFun( poiEveObj ) }
					>{ /* What: Card Grip Span Element. Why: This is the actual pointer-drag handle for reordering this row within its group. How: This forwards its own pointerdown to onGriDowFun and blocks the native HTML5 drag gesture entirely. Its data-element-name-hook is read by help mode's Today catalog. */ }


						<IcoSvgCom
							icoNamStr='griEle'
							sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
						/>{ /* What: Icon Svg Component. Why: The grip handle needs a recognizable drag-affordance glyph. How: This renders the 'griEle' icon at a fixed size. */ }


					</span>


				) : ( // What: Check Button Branch. Why: Outside Edit Mode, the row needs its own working done-toggle checkbox instead. How: This renders the else branch, taken while ediModBoo is false.


					<button
						className={ cssModObj.carCheBut }

						data-element-name-hook='carCheBut'

						type='button'

						aria-label={ `${ entRecObj.done ? 'Unmark' : 'Mark' } day off complete` }
						aria-pressed={ !!entRecObj.done }

						onClick={ ( cliEveObj ) => { // What: Click Handler. Why: This button's own action must not also trigger the card's own row click. How: This stops the click's propagation, then runs the button's own action.


							cliEveObj.stopPropagation(); // What: Propagation Stop. Why: The card's own onRowCliFun would otherwise also fire for this click. How: This stops the event from bubbling up to the article.
							onTogDonFun( entRecObj );    // What: Check Toggle Call. Why: This button toggles the row's own done state. How: This calls onTogDonFun with the row's own entry.


						} }
					>{ /* What: Check Button Element. Why: This is the actual done-toggle control for a day-off row. How: This calls onTogDonFun, and shows a checkmark only once entRecObj.done is true. Its data-element-name-hook is read by help mode's Today catalog. */ }


						<span
							className={ cssModObj.cheRipSpa }

							aria-hidden='true'
						/>{ /* What: Check Ripple Span Element. Why: A completed check needs the same ripple flourish every other done row gets. How: This is a purely decorative, empty span. */ }

						{ entRecObj.done && ( // What: Done IcoSvgCom Check. Why: A completed day-off card's own checkbox needs a checkmark glyph, an undone one doesn't. How: This renders the IcoSvgCom only while entRecObj.done is true.


							<IcoSvgCom
								className={ cssModObj.cheIcoSvg }

								icoNamStr='cheEle'
								sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
							/> // What: Icon Svg Component. Why: A completed day-off card needs a checkmark glyph. How: This renders the 'cheEle' icon only while entRecObj.done is true.


						) }


					</button>


				) }


				<div className={ cssModObj.carBodDiv }>{ /* What: Card Body Div Element. Why: The meta row and name row read as one grouped block. How: This wraps the meta row and the name div below. */ }


					<div className={` ${ cssModObj.carMetDiv }   ${ cssModObj.carMetDivDayoff } `}>{ /* What: Card Meta Div Element. Why: A day-off row's own truncatable title needs its own modifier class for layout. How: This wraps the InfTipCom-wrapped title below. */ }


						<InfTipCom
							className={ cssModObj.daoTitSpa }

							labTexStr={ daoTitStr }
							trnOnlBoo
						>{ /* What: Info Tip Component. Why: A visually-truncated title still needs its own full text reachable on hover/tap. How: This wraps the visible title text, only ever showing its own tooltip when the text is actually truncated (trnOnlBoo). */ }


							{ entRecObj.pickerName ? <>{ entRecObj.pickerName } &middot; <strong className={ cssModObj.daoConStr }>{ entRecObj.condName || 'Day off' }</strong></> : 'Day off' }{ /* What: Day-Off Title Expression. Why: The title names both the suppressed picker and its conditional when the entry carries them. How: This renders the picker name and bold conditional name, or a plain "Day off". */ }


						</InfTipCom>


					</div>

					<div className={ cssModObj.carNamDiv }>{ entRecObj.cardText || 'Enjoy your day off' }</div>{ /* What: Card Name Div Element. Why: This is the day-off card's own main display text. How: This renders entRecObj's own cardText, falling back to a fixed friendly phrase. */ }


				</div>


				{ !ediModBoo && ( // What: Card Actions Visibility Check. Why: Edit Mode replaces the whole actions strip with the drag grip above, so it has nothing left to show here. How: This renders the actions strip only while ediModBoo is false.


					<div
						className={ cssModObj.carActDiv }

						data-element-name-hook='carActDiv'
					>{ /* What: Card Actions Div Element. Why: A day-off row still shows the full 3-icon action strip for layout parity, but re-roll/edit are disabled since neither concept applies. How: This wraps the disabled Re-Roll InfTipCom, a working Skip button, and the disabled Edit InfTipCom. Its data-element-name-hook is read by each Today card's own row-click handler, which ignores clicks inside it and help mode's Today catalog. */ }


						<InfTipCom
							className={ cssModObj.actIcoSpa }

							actNamStr='Re-Roll'
							labTexStr={ disTipStr }
						>{ /* What: Info Tip Component. Why: A day-off card has no items to re-roll between, so this action is explained rather than removed. How: This wraps a disabled-looking refresh icon with disTipStr. */ }


							<IcoSvgCom
								icoNamStr='refEle'
								sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
							/>{ /* What: Icon Svg Component. Why: The disabled Re-Roll action still needs its own recognizable glyph. How: This renders the 'refEle' icon at a fixed size. */ }


						</InfTipCom>



						<button
							className={ cssModObj.actIcoBut }

							aria-label='Skip'
							title='Skip'

							onClick={ ( cliEveObj ) => { // What: Click Handler. Why: This button's own action must not also trigger the card's own row click. How: This stops the click's propagation, then runs the button's own action.


								cliEveObj.stopPropagation();  // What: Propagation Stop. Why: The card's own onRowCliFun would otherwise also fire for this click. How: This stops the event from bubbling up to the article.
								onSkiEntFun( entRecObj.eid ); // What: Skip Call. Why: This button skips the row entirely. How: This calls onSkiEntFun with the row's own eid.


							} }
						>{ /* What: Skip Icon Button Element. Why: Skip is the one action that DOES still apply to a day-off row. How: This calls onSkiEntFun with entRecObj's own eid. */ }


							<IcoSvgCom
								icoNamStr='skiEle'
								sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
							/>{ /* What: Icon Svg Component. Why: The Skip action needs a recognizable glyph. How: This renders the 'skiEle' icon at a fixed size. */ }


						</button>



						<InfTipCom
							className={ cssModObj.actIcoSpa }

							actNamStr='Edit'
							labTexStr={ disTipStr }
						>{ /* What: Info Tip Component. Why: A day-off card has no editable name of its own, so this action is explained rather than removed. How: This wraps a disabled-looking edit icon with disTipStr. */ }


							<IcoSvgCom
								icoNamStr='ediEle'
								sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
							/>{ /* What: Icon Svg Component. Why: The disabled Edit action still needs its own recognizable glyph. How: This renders the 'ediEle' icon at a fixed size. */ }


						</InfTipCom>


					</div>


				) }


			</article>


		);


	}

	// #endregion Day-Off Branch



	// #region Charging Branch

	if ( entRecObj.kind === 'charging' ) { // What: Charging Branch. Why: An ease-up picker with nothing charged to its own threshold today still needs a completable placeholder row that applies the day's drift once checked. How: This returns a dedicated article and skips the real-pick branch below.


		const chrFreBoo = jusCheStr === entRecObj.eid && entRecObj.done;    // What: Charging Fresh Boolean. Why: This row's own brief "fresh" cue only plays right after IT specifically was just checked done. How: This compares jusCheStr against entRecObj's own eid, and requires done to already be true.
		const disTipStr = 'This action is disabled for this type of item.'; // What: Disabled Tip String. Why: Every disabled action icon on this row shares the exact same explanation. How: This is passed as every InfTipCom's own label below.


		const onRowCliFun = ( cliEveObj : React.MouseEvent ) => { // What: On Row Click Function. Why: Clicking anywhere on the row (other than its own actions area) should toggle done, but only outside Edit Mode and while not mid-removal. How: This checks both exclusion conditions first, then calls onTogDonFun.


			if ( ediModBoo || isaRmvBoo ) return; // What: Busy Row Guard. Why: A row being dragged in Edit Mode, or already animating out, must not toggle. How: This bails out while ediModBoo or isaRmvBoo is true.



			if ( ( cliEveObj.target as Element ).closest( '[data-element-name-hook~="carActDiv"]' ) ) return; // What: Actions Area Guard. Why: A click on the card's own action buttons is handled by those buttons, not the row. How: This bails out when the click landed inside carActDiv. // What: Event Target Note. Why: An event's target is typed as a plain EventTarget. How: It's read as an element here, since a click on a card always lands on one.



			onTogDonFun( entRecObj ); // What: Check Toggle Call. Why: A plain row click toggles the row's own done state. How: This calls onTogDonFun with the row's own entry.


		};



		return (


			<article
				className={` ${ cssModObj.todCarArt }   ${ cssModObj.todCarArtCharging }   ${ chrFreBoo ? cssModObj.todCarArtFresh : '' }   ${ isaRmvBoo ? cssModObj.todCarArtRemoving : '' } `}

				data-card-done-active={ entRecObj.done || undefined } // What: Card Done Active Attribute. Why: A done card is shaded, its checkbox filled, and its name struck through by its module. How: This sets the presence-only attribute while entRecObj.done is true.
				data-card-reorder-active={ ediModBoo || undefined } // What: Card Reorder Active Attribute. Why: In Edit Mode the card turns into a dashed, draggable outline. How: This sets the presence-only attribute while ediModBoo is true.
				data-element-name-hook='todCarArt chrCarArt'

				onClick={ onRowCliFun }
			>{ /* What: Charging Card Article Element. Why: This is EntCarCom's own root for a charging row. How: This renders a grip (Edit Mode) or check button, the meta/name body, and (outside Edit Mode) 3 fully-disabled actions. Its data-element-name-hook is read by Today's own drag-to-reorder and card-scroll code and help mode's Today catalog. */ }


				{ ediModBoo ? ( // What: Edit Mode Check. Why: The row's own leading control swaps between a drag grip and a check button depending on whether Edit Mode is active. How: This renders the grip handle while ediModBoo is true, the check button otherwise.


					<span
						className={ cssModObj.carGriSpa }

						data-element-name-hook='carGriSpa'

						draggable={ false }

						aria-label='Drag to reorder'
						role='button'
						tabIndex={ 0 }

						onDragStart={ ( draEveObj ) => draEveObj.preventDefault() }
						onPointerDown={ ( poiEveObj ) => onGriDowFun( poiEveObj ) }
					>{ /* What: Card Grip Span Element. Why: This is the actual pointer-drag handle for reordering this row within its group. How: This forwards its own pointerdown to onGriDowFun and blocks the native HTML5 drag gesture entirely. Its data-element-name-hook is read by help mode's Today catalog. */ }


						<IcoSvgCom
							icoNamStr='griEle'
							sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
						/>{ /* What: Icon Svg Component. Why: The grip handle needs a recognizable drag-affordance glyph. How: This renders the 'griEle' icon at a fixed size. */ }


					</span>


				) : ( // What: Check Button Branch. Why: Outside Edit Mode, the row needs its own working done-toggle checkbox instead. How: This renders the else branch, taken while ediModBoo is false.


					<button
						className={ cssModObj.carCheBut }

						data-element-name-hook='carCheBut'

						type='button'

						aria-label={ `${ entRecObj.done ? 'Unmark' : 'Mark' } ${ picRecObj.name } charging card complete` }
						aria-pressed={ !!entRecObj.done }

						onClick={ ( cliEveObj ) => { // What: Click Handler. Why: This button's own action must not also trigger the card's own row click. How: This stops the click's propagation, then runs the button's own action.


							cliEveObj.stopPropagation(); // What: Propagation Stop. Why: The card's own onRowCliFun would otherwise also fire for this click. How: This stops the event from bubbling up to the article.
							onTogDonFun( entRecObj );    // What: Check Toggle Call. Why: This button toggles the row's own done state. How: This calls onTogDonFun with the row's own entry.


						} }
					>{ /* What: Check Button Element. Why: This is the actual done-toggle control for a charging row, applying the day's own staged drift once checked. How: This calls onTogDonFun, and shows a checkmark only once entRecObj.done is true. Its data-element-name-hook is read by help mode's Today catalog. */ }


						<span
							className={ cssModObj.cheRipSpa }

							aria-hidden='true'
						/>{ /* What: Check Ripple Span Element. Why: A completed check needs the same ripple flourish every other done row gets. How: This is a purely decorative, empty span. */ }

						{ entRecObj.done && ( // What: Done IcoSvgCom Check. Why: A completed charging card's own checkbox needs a checkmark glyph, an undone one doesn't. How: This renders the IcoSvgCom only while entRecObj.done is true.


							<IcoSvgCom
								className={ cssModObj.cheIcoSvg }

								icoNamStr='cheEle'
								sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
							/> // What: Icon Svg Component. Why: A completed charging card needs a checkmark glyph. How: This renders the 'cheEle' icon only while entRecObj.done is true.


						) }


					</button>


				) }


				<div className={ cssModObj.carBodDiv }>{ /* What: Card Body Div Element. Why: The meta row and name row read as one grouped block. How: This wraps the meta row and the name div below. */ }


					<div className={ cssModObj.carMetDiv }>{ /* What: Card Meta Div Element. Why: The picker's own name needs a consistent meta-row slot, matching a real card's own layout. How: This wraps the picker-name span below. */ }


						<span>{ picRecObj.name }</span>{ /* What: Meta Picker Span Element. Why: The user needs to see which picker this charging card belongs to. How: This renders picRecObj's own name. */ }


					</div>

					<div className={ cssModObj.carNamDiv }>No eligible items for today</div>{ /* What: Card Name Div Element. Why: This is the fixed explanatory text for a charging row. How: This renders a literal, fixed phrase. */ }


				</div>


				{ !ediModBoo && ( // What: Card Actions Visibility Check. Why: Edit Mode replaces the whole actions strip with the drag grip above, so it has nothing left to show here. How: This renders the actions strip only while ediModBoo is false.


					<div
						className={ cssModObj.carActDiv }

						data-element-name-hook='carActDiv'
					>{ /* What: Card Actions Div Element. Why: A charging row still shows the full 3-icon action strip for layout parity, but every one of them is disabled since none of those concepts apply here. How: This wraps 3 disabled InfTipCom-wrapped icons. Its data-element-name-hook is read by each Today card's own row-click handler, which ignores clicks inside it and help mode's Today catalog. */ }


						<InfTipCom
							className={ cssModObj.actIcoSpa }

							actNamStr='Re-Roll'
							labTexStr={ disTipStr }
						>{ /* What: Info Tip Component. Why: A charging card has no items to re-roll between yet. How: This wraps a disabled-looking refresh icon with disTipStr. */ }


							<IcoSvgCom
								icoNamStr='refEle'
								sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
							/>{ /* What: Icon Svg Component. Why: The disabled Re-Roll action still needs its own recognizable glyph. How: This renders the 'refEle' icon at a fixed size. */ }


						</InfTipCom>



						<InfTipCom
							className={ cssModObj.actIcoSpa }

							actNamStr='Skip'
							labTexStr={ disTipStr }
						>{ /* What: Info Tip Component. Why: Skipping a charging card would discard the day's own staged drift instead of applying it. How: This wraps a disabled-looking skip icon with disTipStr. */ }


							<IcoSvgCom
								icoNamStr='skiEle'
								sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
							/>{ /* What: Icon Svg Component. Why: The disabled Skip action still needs its own recognizable glyph. How: This renders the 'skiEle' icon at a fixed size. */ }


						</InfTipCom>



						<InfTipCom
							className={ cssModObj.actIcoSpa }

							actNamStr='Edit'
							labTexStr={ disTipStr }
						>{ /* What: Info Tip Component. Why: A charging card has no item of its own yet to edit. How: This wraps a disabled-looking edit icon with disTipStr. */ }


							<IcoSvgCom
								icoNamStr='ediEle'
								sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
							/>{ /* What: Icon Svg Component. Why: The disabled Edit action still needs its own recognizable glyph. How: This renders the 'ediEle' icon at a fixed size. */ }


						</InfTipCom>


					</div>


				) }


			</article>


		);


	}

	// #endregion Charging Branch



	// #region Real Pick Branch

	const curIteObj = staAppObj.items.find( ( pooIteObj ) => pooIteObj.id === entRecObj.itemId ); // What: Current Item Object. Why: A real pick row needs its own live item resolved before anything else in this branch can render. How: This finds the item matching entRecObj's own itemId.


	if ( !curIteObj ) return null; // What: Missing Item Guard. Why: An item deleted out from under a still-listed entry has nothing left to render. How: This returns null early when curIteObj cannot be found at all.



	const isaFreBoo = jusCheStr === entRecObj.eid && entRecObj.done; // What: Is-A Fresh Boolean. Why: This row's own brief "fresh" cue only plays right after IT specifically was just checked done. How: This compares jusCheStr against entRecObj's own eid, and requires done to already be true.



	// #region Reroll Eligibility

	/**
	 * entry-card.tsx = Reroll Eligibility
	 *
	 * @summary
	 * Re-roll needs at least two candidates to land on a DIFFERENT item;
	 * with only one, the button is disabled and shows a tip (hover on
	 * desktop, tap on mobile). What counts as a candidate is per-mode:
	 * ease-up cycles items charged to the threshold, every other mode
	 * draws from the picker's own active (non-vacation) items.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const rerPooArr = staAppObj.items.filter( ( pooIteObj ) => pooIteObj.pickerId === picRecObj.id && !pooIteObj.vacation ); // What: Reroll Pool Array. Why: See the doc comment just above. How: This filters staAppObj.items down to this picker's own active items.


	const eliCouNum = picRecObj.mode === 'ease-up' // What: Eligible Count Number. Why: This is the actual number of candidates re-roll could land on. How: This counts only threshold-eligible items for ease-up, or the whole active pool for every other mode.
		? rerPooArr.filter( ( pooIteObj ) => PIC_NAM_OBJ.easEliFun( pooIteObj, picRecObj.threshold ) ).length // What: Ease-Up Count Branch. Why: Ease-up only re-rolls between items charged to the threshold. How: This counts rerPooArr's own eligible items.
		: rerPooArr.length;                                                                                   // What: Active Pool Count Branch. Why: Every other mode can land on any active item. How: This counts the whole rerPooArr.

	// #endregion Reroll Eligibility



	// #region Completed Row Lockout

	/**
	 * entry-card.tsx = Completed Row Lockout
	 *
	 * @summary
	 * A completed entry can't be rolled away or skipped: re-roll would
	 * silently revoke the completion and revert the drift/boost mutation
	 * it applied (and leave a log row that is both done and rejected),
	 * and skip would discard the completion outright. Both are
	 * expressible without the footgun (push another item manually, or
	 * un-check first), so the buttons explain rather than act.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const entDonBoo = !!entRecObj.done;             // What: Entry Done Boolean. Why: See the doc comment just above. How: This reads entRecObj's own done flag.
	const canRerBoo = eliCouNum >= 2 && !entDonBoo; // What: Can Reroll Boolean. Why: Re-roll is only ever a live control when both enough candidates exist AND the row is not already completed. How: This combines eliCouNum's own floor with the negation of entDonBoo.

	const donRerStr = 'Item is completed and cannot be rolled away. If you want another item added, use the Pickers tab to manually push another item here.'; // What: Done Reroll String. Why: A completed row's own disabled re-roll needs its own specific explanation. How: This is passed as the InfTipCom's own label when entDonBoo blocks re-roll.
	const donSkiStr = 'Item is completed and cannot be skipped. If you want to remove this item, uncheck it first.';                                          // What: Done Skip String. Why: A completed row's own disabled skip needs its own specific explanation. How: This is passed as the InfTipCom's own label when entDonBoo blocks skip.


	const rerTipStr = picRecObj.mode === 'ease-up' // What: Reroll Tip String. Why: A not-yet-completed row with too few candidates still needs an explanation, phrased differently per mode. How: This picks the ease-up-specific wording or the general "only one active item" wording.
		? 'Only one item is charged and ready, so there’s nothing to re-roll to. Another item becomes available once it reaches full charge.'         // What: Ease-Up Tip Branch. Why: Ease-up's candidates are only the fully charged items. How: This explains waiting for another item to charge.
		: 'This picker has only one active item, so there’s nothing to re-roll to. Add or activate another item for this picker to enable re-rolls.'; // What: Active Pool Tip Branch. Why: Every other mode's candidates are its active items. How: This explains adding or activating another item.


	const actRerStr = entDonBoo ? donRerStr : rerTipStr; // What: Active Reroll String. Why: Completion takes precedence over the plain candidate-count explanation, since it applies regardless of how many candidates actually exist. How: This picks donRerStr once entDonBoo is true, otherwise rerTipStr.

	// #endregion Completed Row Lockout


	const onRowCliFun = ( cliEveObj : React.MouseEvent ) => { // What: On Row Click Function. Why: Clicking anywhere on the card (other than its own actions area or the name field) should toggle done, but only outside Edit Mode and while not mid-removal/mid-reroll. How: This checks all 3 exclusion conditions first, then calls onTogDonFun.


		if ( ediModBoo || isaRmvBoo || isaRolBoo ) return; // What: Busy Row Guard. Why: A row being dragged in Edit Mode, or mid removal or reroll animation, must not toggle. How: This bails out while any of those three flags is true.



		if ( ( cliEveObj.target as Element ).closest( '[data-element-name-hook~="carActDiv"]' ) ) return; // What: Actions Area Guard. Why: A click on the card's own action buttons is handled by those buttons, not the row. How: This bails out when the click landed inside carActDiv. // What: Event Target Note. Why: An event's target is typed as a plain EventTarget. How: It's read as an element here, since a click on a card always lands on one.



		if ( ( cliEveObj.target as Element ).closest( '[data-element-name-hook~="entNamInp"]' ) ) return; // What: Name Input Guard. Why: Clicking into the inline rename field must not toggle the row. How: This bails out when the click landed inside .entNamInp. // What: Event Target Note. Why: An event's target is typed as a plain EventTarget. How: It's read as an element here, since a click on a card always lands on one.



		onTogDonFun( entRecObj ); // What: Check Toggle Call. Why: A plain row click toggles the row's own done state. How: This calls onTogDonFun with the row's own entry.


	};



	return (


		<article
			className={` ${ cssModObj.todCarArt }   ${ isaFreBoo ? cssModObj.todCarArtFresh : '' }   ${ isaRmvBoo ? cssModObj.todCarArtRemoving : '' }   ${ isaRolBoo ? cssModObj.todCarArtRolling : '' } `}

			data-card-done-active={ entRecObj.done || undefined } // What: Card Done Active Attribute. Why: A done card is shaded, its checkbox filled, and its name struck through by its module. How: This sets the presence-only attribute while entRecObj.done is true.
			data-card-edit-active={ isaEdiBoo || undefined } // What: Card Edit Active Attribute. Why: While its editor is open, the card stops looking clickable. How: This sets the presence-only attribute while isaEdiBoo is true.
			data-card-reorder-active={ ediModBoo || undefined } // What: Card Reorder Active Attribute. Why: In Edit Mode the card turns into a dashed, draggable outline. How: This sets the presence-only attribute while ediModBoo is true.
			data-element-name-hook='todCarArt'

			onClick={ onRowCliFun }
		>{ /* What: Real Pick Card Article Element. Why: This is EntCarCom's own root for an ordinary picked-item row. How: This renders a grip (Edit Mode) or check button, the meta/name body (a text field while editing), and (outside Edit Mode) the re-roll/skip/edit actions. Its data-element-name-hook is read by Today's own drag-to-reorder and card-scroll code and help mode's Today catalog. */ }


			{ ediModBoo ? ( // What: Edit Mode Check. Why: The row's own leading control swaps between a drag grip and a check button depending on whether Edit Mode is active. How: This renders the grip handle while ediModBoo is true, the check button otherwise.


				<span
					className={ cssModObj.carGriSpa }

					data-element-name-hook='carGriSpa'

					draggable={ false }

					aria-label='Drag to reorder'
					role='button'
					tabIndex={ 0 }

					onDragStart={ ( draEveObj ) => draEveObj.preventDefault() }
					onPointerDown={ ( poiEveObj ) => onGriDowFun( poiEveObj ) }
				>{ /* What: Card Grip Span Element. Why: This is the actual pointer-drag handle for reordering this row within its group. How: This forwards its own pointerdown to onGriDowFun and blocks the native HTML5 drag gesture entirely. Its data-element-name-hook is read by help mode's Today catalog. */ }


					<IcoSvgCom
						icoNamStr='griEle'
						sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
					/>{ /* What: Icon Svg Component. Why: The grip handle needs a recognizable drag-affordance glyph. How: This renders the 'griEle' icon at a fixed size. */ }


				</span>


			) : ( // What: Check Button Branch. Why: Outside Edit Mode, the row needs its own working done-toggle checkbox instead. How: This renders the else branch, taken while ediModBoo is false.


				<button
					className={ cssModObj.carCheBut }

					data-element-name-hook='carCheBut'

					type='button'

					aria-label={ `${ entRecObj.done ? 'Unmark' : 'Mark' } ${ curIteObj.name } complete` }
					aria-pressed={ !!entRecObj.done }

					onClick={ ( cliEveObj ) => { // What: Click Handler. Why: This button's own action must not also trigger the card's own row click. How: This stops the click's propagation, then runs the button's own action.


						cliEveObj.stopPropagation(); // What: Propagation Stop. Why: The card's own onRowCliFun would otherwise also fire for this click. How: This stops the event from bubbling up to the article.
						onTogDonFun( entRecObj );    // What: Check Toggle Call. Why: This button toggles the row's own done state. How: This calls onTogDonFun with the row's own entry.


					} }
				>{ /* What: Check Button Element. Why: This is the actual done-toggle control for an ordinary picked row. How: This calls onTogDonFun, and shows a checkmark only once entRecObj.done is true. Its data-element-name-hook is read by help mode's Today catalog. */ }


					<span
						className={ cssModObj.cheRipSpa }

						aria-hidden='true'
					/>{ /* What: Check Ripple Span Element. Why: A completed check needs the same ripple flourish every other done row gets. How: This is a purely decorative, empty span. */ }

					{ entRecObj.done && ( // What: Done IcoSvgCom Check. Why: A completed pick card's own checkbox needs a checkmark glyph, an undone one doesn't. How: This renders the IcoSvgCom only while entRecObj.done is true.


						<IcoSvgCom
							className={ cssModObj.cheIcoSvg }

							icoNamStr='cheEle'
							sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
						/> // What: Icon Svg Component. Why: A completed pick card needs a checkmark glyph. How: This renders the 'cheEle' icon only while entRecObj.done is true.


					) }


				</button>


			) }


			<div className={ cssModObj.carBodDiv }>{ /* What: Card Body Div Element. Why: The meta row and name row (or its editable field) read as one grouped block. How: This wraps the meta row and either the name field or the plain name div below. */ }


				<div className={ cssModObj.carMetDiv }>{ /* What: Card Meta Div Element. Why: The picker's own name needs a consistent meta-row slot. How: This wraps the picker-name span below. */ }


					<span>{ picRecObj.name }</span>{ /* What: Meta Picker Span Element. Why: The user needs to see which picker produced this item. How: This renders picRecObj's own name. */ }


				</div>

				{ isaEdiBoo ? ( // What: Name Editing Check. Why: The name area swaps between a live input and plain text depending on whether the row is being renamed. How: This renders the input while isaEdiBoo is true, the plain name div otherwise.


					<input
						className={ cssModObj.entNamInp }

						data-element-name-hook='entNamInp'

						autoComplete='off'
						autoFocus
						maxLength={ 60 }
						placeholder='Item name'
						type='text'
						value={ draNamStr ?? curIteObj.name } // What: Value. Why: The name being typed lives in the editor's draft until Save. How: This shows the draft's name, falling back to the real one.

						aria-label='Item name'

						onChange={ ( chaEveObj ) => onRenIteFun( chaEveObj.target.value ) }
						onClick={ ( cliEveObj ) => cliEveObj.stopPropagation() }
						onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Enter' ) keyEveObj.currentTarget.blur(); } }
					/> // What: Entry Card Name Input Element. Why: This is the actual editable field for renaming the item in place. How: This writes every change into the editor's draft through onRenIteFun, and blurs on Enter. Its data-element-name-hook is read by the entry card's own row-click handler and help mode's Today catalog.


				) : ( // What: Plain Name Branch. Why: Outside editing, the plain non-editable name div belongs here instead. How: This renders the else branch, taken while isaEdiBoo is false.


					<div className={ cssModObj.carNamDiv }>{ curIteObj.name }</div> // What: Card Name Div Element. Why: Outside the inline rename field, the item's own name just displays plainly. How: This renders curIteObj's own name.


				) }


			</div>


			{ !ediModBoo && ( // What: Card Actions Visibility Check. Why: Edit Mode replaces the whole actions strip with the drag grip above, so it has nothing left to show here. How: This renders the actions strip only while ediModBoo is false.


				<div
					className={ cssModObj.carActDiv }

					data-element-name-hook='carActDiv'
				>{ /* What: Card Actions Div Element. Why: An ordinary pick row's own re-roll/skip/edit controls sit together. How: This wraps a working-or-disabled Re-Roll, a working-or-disabled Skip, and an always-working Edit toggle. Its data-element-name-hook is read by each Today card's own row-click handler, which ignores clicks inside it and help mode's Today catalog. */ }


					{ canRerBoo ? ( // What: Reroll Availability Check. Why: Re-Roll's own working control only makes sense while canRerBoo actually allows it. How: This renders the working button while canRerBoo is true, an explained disabled one otherwise.


						<button
							className={` ${ cssModObj.actIcoBut }   ${ isaRolBoo ? cssModObj.actIcoButSpinning : '' } `}

							aria-label='Re-Roll'
							title='Re-Roll'

							onClick={ ( cliEveObj ) => { // What: Click Handler. Why: This button's own action must not also trigger the card's own row click. How: This stops the click's propagation, then runs the button's own action.


								cliEveObj.stopPropagation();         // What: Propagation Stop. Why: The card's own onRowCliFun would otherwise also fire for this click. How: This stops the event from bubbling up to the article.
								onRerEntFun( entRecObj, picRecObj ); // What: Re-Roll Call. Why: This button swaps the row to a different item. How: This calls onRerEntFun with the row's own entry and picker.


							} }
						>{ /* What: Reroll Icon Button Element. Why: This is the actual working re-roll control, available whenever canRerBoo allows it. How: This calls onRerEntFun, spinning its own icon while isaRolBoo is true. */ }


							<IcoSvgCom
								className={ cssModObj.rolIcoSvg }

								icoNamStr='refEle'
								sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
							/>{ /* What: Icon Svg Component. Why: The Re-Roll action needs a recognizable glyph. How: This renders the 'refEle' icon at a fixed size. */ }


						</button>


					) : ( // What: Disabled Reroll Branch. Why: A blocked re-roll needs an explained disabled control instead. How: This renders the else branch, taken while canRerBoo is false.


						<InfTipCom
							className={ cssModObj.actIcoSpa }

							actNamStr='Re-Roll'
							labTexStr={ actRerStr }
						>{ /* What: Info Tip Component. Why: A blocked re-roll (too few candidates, or already completed) still needs to explain itself. How: This wraps a disabled-looking refresh icon with actRerStr. */ }


							<IcoSvgCom
								icoNamStr='refEle'
								sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
							/>{ /* What: Icon Svg Component. Why: The disabled Re-Roll action still needs its own recognizable glyph. How: This renders the 'refEle' icon at a fixed size. */ }


						</InfTipCom>


					) }



					{ entDonBoo ? ( // What: Entry Done Check. Why: Skip only makes sense while the row isn't already completed. How: This renders an explained disabled Skip while entDonBoo is true, the working button otherwise.


						<InfTipCom
							className={ cssModObj.actIcoSpa }

							actNamStr='Skip'
							labTexStr={ donSkiStr }
						>{ /* What: Info Tip Component. Why: A completed row's own skip is explained rather than removed, matching re-roll's own lockout above. How: This wraps a disabled-looking skip icon with donSkiStr. */ }


							<IcoSvgCom
								icoNamStr='skiEle'
								sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
							/>{ /* What: Icon Svg Component. Why: The disabled Skip action still needs its own recognizable glyph. How: This renders the 'skiEle' icon at a fixed size. */ }


						</InfTipCom>


					) : ( // What: Working Skip Branch. Why: An uncompleted row needs its own real, working Skip control instead. How: This renders the else branch, taken while entDonBoo is false.


						<button
							className={ cssModObj.actIcoBut }

							aria-label='Skip'
							title='Skip'

							onClick={ ( cliEveObj ) => { // What: Click Handler. Why: This button's own action must not also trigger the card's own row click. How: This stops the click's propagation, then runs the button's own action.


								cliEveObj.stopPropagation();  // What: Propagation Stop. Why: The card's own onRowCliFun would otherwise also fire for this click. How: This stops the event from bubbling up to the article.
								onSkiEntFun( entRecObj.eid ); // What: Skip Call. Why: This button skips the row entirely. How: This calls onSkiEntFun with the row's own eid.


							} }
						>{ /* What: Skip Icon Button Element. Why: This is the actual working skip control, available whenever the row is not yet completed. How: This calls onSkiEntFun with entRecObj's own eid. */ }


							<IcoSvgCom
								icoNamStr='skiEle'
								sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
							/>{ /* What: Icon Svg Component. Why: The Skip action needs a recognizable glyph. How: This renders the 'skiEle' icon at a fixed size. */ }


						</button>


					) }



					<button
						className={ cssModObj.actIcoBut }

						aria-expanded={ isaEdiBoo }
						aria-label='Edit'
						title='Edit'

						onClick={ ( cliEveObj ) => { // What: Click Handler. Why: This button's own action must not also trigger the card's own row click. How: This stops the click's propagation, then runs the button's own action.


							cliEveObj.stopPropagation(); // What: Propagation Stop. Why: The card's own onRowCliFun would otherwise also fire for this click. How: This stops the event from bubbling up to the article.
							onTogEdiFun();               // What: Edit Toggle Call. Why: This button opens or closes the row's own inline editor. How: This calls onTogEdiFun.


						} }
					>{ /* What: Edit Icon Button Element. Why: Edit always works, regardless of completion, unlike re-roll/skip. How: This calls onTogEdiFun, toggling isaEdiBoo. */ }


						<IcoSvgCom
							icoNamStr='ediEle'
							sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
						/>{ /* What: Icon Svg Component. Why: The Edit action needs a recognizable glyph. How: This renders the 'ediEle' icon at a fixed size. */ }


					</button>


				</div>


			) }


		</article>


	);

	// #endregion Real Pick Branch


}

// #endregion EntCarCom

// #endregion Components



// #region Exports

export { EntCarCom }; // What: Named Export. Why: The Today tab renders one card per entry. How: This exports EntCarCom by name.

// #endregion Exports


