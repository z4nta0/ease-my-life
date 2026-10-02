


// #region Imports

import cssModObj from './reminders-section.module.css'; // What: CSS Module Object. Why: The Reminders section's header, quick-add form, and cards are styled from their own module. How: This maps each class name in reminders-section.module.css to its hashed module class.
import React     from 'react';                          // What: React. Why: Every component in this file is built directly on React's own APIs. How: This is used directly (React.useEffect, React.useRef, React.useState, React.Fragment) instead of importing individual named hooks.


import { ButBasCom    } from '../../ui/button.jsx';                 // What: Button Base Component. Why: The quick-add form and each reminder card's own actions need consistently-styled buttons. How: This is rendered throughout RemCarCom and RemSecCom.
import { ColDisCom    } from '../../ui/collapse.jsx';               // What: Collapse Disclosure Component. Why: The Reminders log, the quick-add form, and each inline editor need to animate open and closed instead of snapping. How: This wraps each of those in RemSecCom and InlEdiCom, driven by its own open state.
import { durMilFun    } from '../../utils/rhythm.js';               // What: Duration Millisecond Function. Why: Timers that wait on a CSS animation must end with it. How: This returns a duration step's length in milliseconds, matching the stylesheet's own --dur-* tokens.
import { EdiFooCom    } from '../../ui/editor-footer.jsx';          // What: Editor Footer Component. Why: Every reminder editor ends with the same Delete/Cancel/Save row. How: This is rendered at the bottom of each reminder editor.
import { emlTouObj    } from '../../state/tour-bus.js';             // What: Ease My Life Tour Object. Why: A reminder mini-tour publishes prefill data and reads the live draft's own repeat kind through this shared bus. How: This is read via .get() in staAddFun and written to via .set() below.
import { IcoSvgCom    } from '../../ui/icon.jsx';                   // What: Icon Svg Component. Why: Every reminder card and button needs a recognizable glyph. How: This is rendered throughout RemCarCom and RemSecCom.
import { InfTipCom    } from '../../ui/info-tip.jsx';               // What: Info Tip Component. Why: A disabled add control still needs to explain why it can't be clicked while a mini-tour checklist is in progress. How: This wraps the disabled add button in RemSecCom.
import { isoDayFun    } from '../../utils/date.js';                 // What: Iso Day Function. Why: Dates are stored and compared as local-calendar YYYY-MM-DD keys. How: This formats a Date (or now) as that key.
import { LogChiCom    } from './day-log.jsx';                       // What: Log Chip Component. Why: The Reminders section's own header needs the same show-today's-log toggle chip as every other group. How: This is rendered in RemSecCom's header, gated on onToggleLog being supplied.
import { nexDatFun    } from '../../utils/date.js';                 // What: Next Date Function. Why: A reminder's next occurrence reads as a full prose date. How: This is called with the date and whether the year must always show.
import { ONB_CHE_OBJ  } from '../../state/onboarding-checklist.js'; // What: Onboarding Checklist Object. Why: The quick-add entry point must stay disabled while any onboarding tutorial is still in progress, and a tutorial card needs its own launch state. How: This is read via its own tutProFun and entLooFun helpers.
import { ONB_RCT_OBJ  } from '../../state/onboarding-seed-data.js'; // What: Onboarding Reminder-Card-Text Object. Why: A still-hidden sample reminder's own mini-tour launcher card needs copy distinct from its real schedule summary. How: This is looked up by sample task id inside RemCarCom's own isaTutBoo branch.
import { ONB_STI_ARR  } from '../../state/onboarding-seed-data.js'; // What: Onboarding Sample-Task-Ids Array. Why: Only the Welcome Tour's own seeded sample reminders should ever render as a mini-tour launcher card. How: This is checked against a hidden task's own id inside RemSecCom's tutTasArr filter.
import { redMotFun    } from '../../utils/motion.js';               // What: Reduce Motion Function. Why: A user who prefers reduced motion should get an instant close, skip, or remove instead of a timed animation. How: This is checked before every staged animation in RemCarCom and RemSecCom.
import { RemLogCom    } from './day-log.jsx';                       // What: Reminders Log Component. Why: The Reminders section's own header chip opens this exact audit panel. How: This is rendered inside RemSecCom, gated on logOpen.
import { SchEdiCom    } from '../../ui/schedule-editor.jsx';        // What: Schedule Editor Component. Why: A reminder's own name, repeat, and schedule fields are edited with one shared editor. How: This is rendered for the add form and each open reminder.
import { TAS_NAM_OBJ  } from '../../core/tasks.js';                 // What: Tasks Namespace Object. Why: Every due-ness, visibility, and summary computation for Today's cards defers to the reminders engine instead of duplicating its logic. How: This namespace object is called throughout RemCarCom and RemSecCom.
import { useEscCanFun } from '../../ui/escape-cancel.js';           // What: Use Escape Cancel Function. Why: The quick-add form needs Escape to discard in-progress edits the same way every other editor does. How: This is called once inside RemSecCom.

// #endregion Imports



/**
 * reminders-section.jsx = Reminders Section
 *
 * @summary
 * The reminders list atop Today: RemSecCom renders every reminder due today as
 * a RemCarCom card (checkable, skippable, and openable in place), plus its own
 * quick-add form, and InlEdiCom is the inline editor an open card expands
 * into, built from the shared schedule editor and editor footer.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

// #region RemCarCom

/**
 * RemCarCom = Reminder Card Component
 *
 * @summary
 * Today: a single reminder row. Matches the picker EntryCard's own
 * structure: the whole row toggles done; the actions area (skip/edit)
 * is click-isolated. The schedule summary sits where a picker entry
 * shows its picker name. Also doubles as a mini-tour launcher card
 * (isaTutBoo) for a still-hidden sample reminder, offered until it's
 * resolved by any of the 3 ways the Welcome Tour checklist recognizes.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actStoObj   - Action Store Object: The actions bag; only its
 *                            own setCarFun is used, and only while isaTutBoo.
 * @param props.cheDatObj   - Check Date Object: The generator-anchored date to
 *                            check done-ness against.
 * @param props.extClaStr   - Extra Class String: Extra module class name(s)
 *                            driving the card's own insert/remove/purge
 *                            animations, defaulting to an empty string.
 * @param props.isaOpeBoo   - Is-An Open Boolean: Whether this card's own
 *                            inline editor is currently open.
 * @param props.isaSkiBoo   - Is-A Skip Boolean: Whether this card's own skip
 *                            confirm is currently open.
 * @param props.isaTutBoo   - Is-A Tutorial Boolean: Whether this instance is a
 *                            mini-tour launcher card for a still-hidden
 *                            sample, rather than a real due reminder.
 * @param props.jusCheStr   - Just Check String: The id of whichever reminder
 *                            was just checked, driving the brief fresh
 *                            flourish; unrelated to isaTutBoo.
 * @param props.onAniEndFun - On Animate End Function: Fires when this card's
 *                            own outer animation ends.
 * @param props.onEdiTasFun - On Edit Task Function: Opens/closes this card's
 *                            own inline editor.
 * @param props.onPlaTutFun - On Play Tutorial Function: Starts this sample's
 *                            own mini-tour.
 * @param props.onRenTasFun - On Rename Task Function: Commits a new name while
 *                            the inline name input is open.
 * @param props.onSkiTasFun - On Skip Task Function: Opens/closes this card's
 *                            own skip confirm.
 * @param props.onTogTasFun - On Toggle Task Function: Toggles this card's own
 *                            done state.
 * @param props.onUncTutFun - On Uncheck Tutorial Function: Un-resolves this
 *                            sample's own mini-tour.
 * @param props.tasRcdObj   - Task Record Object: The reminder/task record this
 *                            card renders, real or (while isaTutBoo) a
 *                            still-hidden sample.
 * @param props.tutDonBoo   - Tutorial Done Boolean: Whether this sample's own
 *                            mini-tour has already been resolved; only
 *                            meaningful while isaTutBoo.
 *
 * @returns Either the mini-tour launcher card's own markup (isaTutBoo)
 * or the real reminder row's own markup.
 *
 * @example
 * ```tsx
 * RemCarCom({ actStoObj, cheDatObj, extClaStr, ... }) // => <RemCarCom />
 * ```
 *
*/

function RemCarCom ( { actStoObj, cheDatObj, extClaStr = '', isaOpeBoo, isaSkiBoo, isaTutBoo, jusCheStr, onAniEndFun, onEdiTasFun, onPlaTutFun, onRenTasFun, onSkiTasFun, onTogTasFun, onUncTutFun, tasRcdObj, tutDonBoo } ) {


	if ( isaTutBoo ) { // What: Tutorial Branch. Why: A still-hidden sample reminder renders as a mini-tour launcher card instead of a real due-reminder row. How: This returns the launcher card's own markup outright, never falling through to the real row below.


		const oveTexObj = ONB_RCT_OBJ[ tasRcdObj.id ] || {}; // What: Override Text Object. Why: A sample's own launcher card copy can override the real schedule summary/name/time. How: This looks up tasRcdObj's own id in ONB_RCT_OBJ, falling back to an empty object when there's no override.
		const texDisObj = { kicStr : oveTexObj.kicStr || TAS_NAM_OBJ.sumTasFun( tasRcdObj ), namStr : oveTexObj.namStr || tasRcdObj.name, timStr : oveTexObj.timStr }; // What: Text Display Object. Why: This resolves the 3 pieces of copy the card below actually renders, in one place. How: This falls back to the real schedule summary/name when no override was found, and leaves timStr undefined when none was given.


		const onRowCliFun = ( cliEveObj ) => { // What: On Row Click Function. Why: Clicking anywhere on the card (other than its own actions area) should start or un-resolve this sample's own mini-tour. How: This checks for a click inside the actions area first, then dispatches to onUncTutFun or onPlaTutFun based on tutDonBoo.


			if ( cliEveObj.target.closest( '[data-element-name-hook~="carActDiv"]' ) ) return; // What: Actions Area Guard. Why: The Cancel button below has its own click handling and must not also trigger the row-level tour toggle. How: This bails out when the click landed inside the actions area.



			if ( tutDonBoo ) onUncTutFun( tasRcdObj.id ); // What: Done Dispatch Branch. Why: A sample whose mini-tour already finished should un-resolve it back to not-done on click. How: This calls onUncTutFun when tutDonBoo is true.

			else onPlaTutFun( 'reminder', tasRcdObj.id ); // What: Not-Done Dispatch Branch. Why: A sample whose mini-tour hasn't finished yet should start playing it on click. How: This calls onPlaTutFun otherwise.


		};



		return (


			<article
				className={` ${ cssModObj.todayCard }   ${ extClaStr } `}

				data-card-done-active={ tutDonBoo || undefined } // What: Card Done Active Attribute. Why: A done card is shaded, its checkbox filled, and its name struck through by its module. How: This sets the presence-only attribute while tutDonBoo is true.
				data-element-name-hook='todCarArt tutCarArt remCarArt'

				onClick={ onRowCliFun }
			>{ /* What: Tutorial Article Element. Why: This is the mini-tour launcher card's own root element. How: This marks itself done via data-card-done-active once tutDonBoo, and dispatches every non-actions-area click to onRowCliFun. Its data-element-name-hook is read by Today's own drag-to-reorder and card-scroll code and help mode's Today catalog. */ }


				{ tutDonBoo ? ( // What: Tutorial Done Check. Why: A resolved sample card's checkbox behaves differently from a pending one. How: This renders the undo-check button while tutDonBoo is true, the play-check button otherwise.


					<button
						className={ cssModObj.check }

						data-element-name-hook='carCheBut'

						type='button'

						aria-label={ `Undo ${ texDisObj.namStr } tutorial` }
						aria-pressed='true'

						onClick={ ( cliEveObj ) => { // What: Undo Check Click Handler. Why: The resolved checkbox un-resolves its sample without the row's own click also firing. How: This isolates the click, then un-resolves.


							cliEveObj.stopPropagation(); // What: Row Click Isolation. Why: The card's own row click must not also fire for this control. How: This stops the click from bubbling to the article.

							onUncTutFun( tasRcdObj.id ); // What: Tutorial Undo Call. Why: This un-resolves the sample's own mini-tour. How: This calls onUncTutFun with the sample's own id.


						} }
					>{ /* What: Undo Check Button Element. Why: A resolved sample can be un-resolved directly from its own checkbox, same as a normal completed card toggling back off. How: This calls onUncTutFun, isolated from the row's own onRowCliFun via stopPropagation. Its data-element-name-hook is read by help mode's Today catalog. */ }


						<span
							className={ cssModObj.checkRipple }

							aria-hidden='true'
						/>{ /* What: Check Ripple Span Element. Why: The checkbox needs its own decorative press-ripple, same as every other checkbox in the app. How: This renders an empty, purely decorative span. */ }

						<IcoSvgCom
							icoNamStr='cheEle'
							sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
						/>{ /* What: Icon Svg Component. Why: A resolved sample's own checkbox needs the same checkmark glyph as a real completed card. How: This renders the 'cheEle' icon. */ }


					</button>


				) : ( // What: Play Check Branch. Why: A pending sample needs its own play-to-start checkbox instead. How: This renders the else branch, taken while tutDonBoo is false.


					<button
						className={ cssModObj.check }

						data-element-name-hook='carCheBut'

						type='button'

						aria-label={ `Start the ${ texDisObj.namStr } tutorial` }

						onClick={ ( cliEveObj ) => { // What: Play Check Click Handler. Why: The pending checkbox starts its sample's tour without the row's own click also firing. How: This isolates the click, then starts the tour.


							cliEveObj.stopPropagation(); // What: Row Click Isolation. Why: The card's own row click must not also fire for this control. How: This stops the click from bubbling to the article.

							onPlaTutFun( 'reminder', tasRcdObj.id ); // What: Tutorial Play Call. Why: This starts the sample's own reminder mini-tour. How: This calls onPlaTutFun with the 'reminder' tour kind and the sample's own id.


						} }
					>{ /* What: Play Check Button Element. Why: An unresolved sample's own checkbox instead starts the mini-tour, never marks it done directly. How: This calls onPlaTutFun, isolated from the row's own onRowCliFun via stopPropagation. Its data-element-name-hook is read by help mode's Today catalog. */ }


						<IcoSvgCom
							icoNamStr='plaEle'
							sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
						/>{ /* What: Icon Svg Component. Why: An unresolved sample's own checkbox needs a play glyph instead of a checkmark, since clicking it starts the tour rather than completing anything. How: This renders the 'plaEle' icon. */ }


					</button>


				) }


				<div className={ cssModObj.todayCardBody }>{ /* What: Card Body Div Element. Why: The card's own kicker/time meta and name need to sit together, same layout as a real reminder row. How: This wraps the meta row and the name div below. */ }


					<div className={ cssModObj.todayCardMeta }>{ /* What: Card Meta Div Element. Why: The kicker (schedule-like summary) and optional time estimate read together as one line. How: This renders the kicker span, then the optional dot/time pair. */ }


						<span className={ cssModObj.metaPicker }>{ texDisObj.kicStr }</span>{ /* What: Meta Picker Span Element. Why: This is the card's own kicker text, reusing the same class a real entry's picker name uses. How: This renders texDisObj's own kicStr. */ }

						{ texDisObj.timStr && ( // What: Time Visibility Check. Why: Not every sample card has a manually-timed estimate. How: This renders the dot/time pair only while texDisObj's own timStr is set.


							<>{ /* What: Time Pair Fragment Element. Why: The dot separator and the time estimate show or hide together. How: This groups both spans with no wrapper element. */ }


								<span className={ cssModObj.metaDot }>·</span>{ /* What: Meta Dot Span Element. Why: This visually separates the kicker from the time estimate. How: This renders a literal middle-dot character. */ }

								<span>{ texDisObj.timStr }</span>{ /* What: Meta Time Span Element. Why: This shows roughly how long the mini-tour takes. How: This renders texDisObj's own timStr. */ }


							</>


						) }


					</div>

					<div className={ cssModObj.todayCardName }>{ texDisObj.namStr }</div>{ /* What: Card Name Div Element. Why: This is the card's own primary, most prominent text. How: This renders texDisObj's own namStr. */ }


				</div>


				{ !tutDonBoo && ( // What: Cancel Visibility Check. Why: A resolved sample has nothing left to cancel. How: This renders the Cancel action only while the sample is still unresolved.


					<div
						className={ cssModObj.todayCardActions }

						data-element-name-hook='carActDiv'
					>{ /* What: Card Actions Div Element. Why: This is the click-isolated actions area onRowCliFun already excludes. How: This wraps the single Cancel button below. Its data-element-name-hook is read by each Today card's own row-click handler, which ignores clicks inside it and help mode's Today catalog. */ }


						<button
							className={ cssModObj.iconBtn }

							aria-label='Cancel tutorial'
							title='Cancel'

							onClick={ ( cliEveObj ) => { // What: Cancel Click Handler. Why: Cancel must not also start the sample's tour through the row click. How: This isolates the click, then cancels the entry.


								cliEveObj.stopPropagation(); // What: Row Click Isolation. Why: The card's own row click must not also fire for this control. How: This stops the click from bubbling to the article.

								actStoObj.setCarFun( tasRcdObj.id, { status : 'cancelled' } ); // What: Card Cancel Call. Why: Cancelling marks the sample's own checklist entry cancelled without resolving it. How: This sets the entry's status to 'cancelled'.


							} }
						>{ /* What: Cancel Button Element. Why: This marks the sample's own checklist entry cancelled without touching the sample itself, distinct from actually resolving it. How: This calls actStoObj.setCarFun, isolated from the row's own onRowCliFun via stopPropagation. */ }


							<IcoSvgCom
								icoNamStr='croEle'
								sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
							/>{ /* What: Icon Svg Component. Why: This is the Cancel action's own glyph. How: This renders the 'croEle' icon. */ }


						</button>


					</div>


				) }


			</article>


		);


	}



	const isaDonBoo = TAS_NAM_OBJ.isaDonFun( tasRcdObj, cheDatObj ); // What: Is-A Done Boolean. Why: Both the card's own checkbox state and its "fresh" flourish depend on today's real completion state. How: This calls TAS_NAM_OBJ.isaDonFun against tasRcdObj and cheDatObj.
	const isaFreBoo = jusCheStr === tasRcdObj.id && isaDonBoo;       // What: Is-A Fresh Boolean. Why: Only a reminder that was JUST checked (not one that was already done) should play the brief fresh flourish. How: This combines the jusCheStr match with isaDonBoo itself.



	const onRowCliFun = ( cliEveObj ) => { // What: On Row Click Function. Why: Clicking anywhere on the row (other than its own actions area or the open name input) should toggle done. How: This checks both exclusion zones first, then calls onTogTasFun.


		if ( cliEveObj.target.closest( '[data-element-name-hook~="carActDiv"]' ) ) return; // What: Actions Area Guard. Why: The skip/edit buttons have their own click handling and must not also toggle done. How: This bails out when the click landed inside the actions area.



		if ( cliEveObj.target.closest( '[data-element-name-hook~="remNamInp"]' ) ) return; // What: Name Input Guard. Why: Typing in the open name input must not also toggle done. How: This bails out when the click landed inside the name input.



		onTogTasFun( tasRcdObj ); // What: Toggle Done Call. Why: Once neither exclusion zone matched, the click is a genuine row toggle. How: This calls onTogTasFun against tasRcdObj.


	};



	return (


		<article
			className={` ${ cssModObj.todayCard }   ${ isaFreBoo ? cssModObj.isFresh : '' }   ${ extClaStr } `}

			data-card-done-active={ isaDonBoo || undefined } // What: Card Done Active Attribute. Why: A done card is shaded, its checkbox filled, and its name struck through by its module. How: This sets the presence-only attribute while isaDonBoo is true.
			data-card-edit-active={ isaOpeBoo || undefined } // What: Card Edit Active Attribute. Why: While its editor is open, the card stops looking clickable. How: This sets the presence-only attribute while isaOpeBoo is true.
			data-element-name-hook='todCarArt remCarArt'

			onAnimationEnd={ onAniEndFun }
			onClick={ onRowCliFun }
		>{ /* What: Reminder Article Element. Why: This is the real reminder row's own root element, matching a picker EntryCard's structure. How: This marks itself done/fresh/editing per the 3 booleans above, plus whatever animation class extClaStr carries. Its data-element-name-hook is read by Today's own drag-to-reorder and card-scroll code and help mode's Today catalog. */ }


			<button
				className={ cssModObj.check }

				data-element-name-hook='carCheBut'

				type='button'

				aria-label={ `${ isaDonBoo ? 'Unmark' : 'Mark' } ${ tasRcdObj.name } complete` } // What: Check Label Pick. Why: The screen reader label names the action the checkbox will take next. How: This says Unmark while done and Mark otherwise.
				aria-pressed={ !!isaDonBoo }

				onClick={ ( cliEveObj ) => { // What: Check Click Handler. Why: The checkbox toggles done on its own, without the row's click toggling it a second time. How: This isolates the click, then toggles.


					cliEveObj.stopPropagation(); // What: Row Click Isolation. Why: The card's own row click must not also fire for this control. How: This stops the click from bubbling to the article.

					onTogTasFun( tasRcdObj ); // What: Toggle Done Call. Why: The checkbox toggles the reminder's own done state. How: This calls onTogTasFun with the task.


				} }
			>{ /* What: Check Button Element. Why: The checkbox is also independently clickable, isolated from the row's own onRowCliFun (both end up calling onTogTasFun, but the button needs its own accessible name/state). How: This toggles done via stopPropagation plus a direct onTogTasFun call. Its data-element-name-hook is read by help mode's Today catalog. */ }


				<span
					className={ cssModObj.checkRipple }

					aria-hidden='true'
				/>{ /* What: Check Ripple Span Element. Why: The checkbox needs its own decorative press-ripple. How: This renders an empty, purely decorative span. */ }

				{ isaDonBoo && ( // What: Done IcoSvgCom Check. Why: A done reminder's own checkbox needs a checkmark glyph, an undone one doesn't. How: This renders the IcoSvgCom only while isaDonBoo is true.


					<IcoSvgCom
						icoNamStr='cheEle'
						sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
					/> // What: Icon Svg Component. Why: A done reminder's own checkbox needs a checkmark glyph. How: This renders the 'cheEle' icon only while isaDonBoo.


				) }


			</button>


			<div className={ cssModObj.todayCardBody }>{ /* What: Card Body Div Element. Why: The schedule-summary meta row and the name (or its inline editor) need to sit together. How: This wraps the meta row and the name/input below. */ }


				<div className={ cssModObj.todayCardMeta }>{ /* What: Card Meta Div Element. Why: A small type icon and the schedule summary read together as one line. How: This renders the type icon, then the summary span. */ }


					<IcoSvgCom
						icoNamStr={ tasRcdObj.repeat === 'once' ? 'pinEle' : 'calEle' } // What: Type Icon Pick. Why: A one-time reminder and a recurring one look different at a glance. How: This picks the pin for 'once' and the calendar otherwise.
						sizSteStr='m01' // Vertical Rhythm Base Minus 1 ~= 11.000px
					/>{ /* What: Icon Svg Component. Why: This distinguishes a one-time reminder from a recurring one at a glance. How: This renders 'pin' for a 'once' repeat, otherwise 'calendar'. */ }

					<span className={ cssModObj.metaPicker }>{ TAS_NAM_OBJ.sumTasFun( tasRcdObj ) }</span>{ /* What: Meta Picker Span Element. Why: This is the row's own schedule summary, reusing the same class a real entry's picker name uses. How: This calls TAS_NAM_OBJ.sumTasFun against tasRcdObj. */ }


				</div>

				{ isaOpeBoo ? ( // What: Name Editing Check. Why: The name area swaps between a live input and plain text depending on whether the row is being renamed. How: This renders the input while isaOpeBoo is true, the plain name div otherwise.


					<input
						className={ cssModObj.remCardNameInput }

						data-element-name-hook='remNamInp'

						autoComplete='off'
						autoFocus
						maxLength={ 60 }
						placeholder='Reminder name'
						type='text'
						value={ tasRcdObj.name }

						aria-label='Reminder name'

						onBlur={ ( bluEveObj ) => { // What: Name Blur Handler. Why: Leaving the input should commit the trimmed name once. How: This trims the value and commits it only when it differs.


							const namTriStr = bluEveObj.target.value.trim(); // What: Name Trimmed String. Why: Surrounding spaces are never part of a name. How: This trims the input's own value.


							if ( namTriStr !== tasRcdObj.name ) onRenTasFun( namTriStr ); // What: Changed Name Guard. Why: An unchanged name needs no commit. How: This calls onRenTasFun only when the trimmed name differs.


						} }
						onChange={ ( chaEveObj ) => onRenTasFun( chaEveObj.target.value ) }
						onClick={ ( cliEveObj ) => cliEveObj.stopPropagation() }                                            // What: Row Click Isolation. Why: Clicking into the name input must not also toggle the row done. How: This stops the click from bubbling to the card.
						onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Enter' ) keyEveObj.currentTarget.blur(); } } // What: Enter Blur Shortcut. Why: Pressing Enter should finish the name the same way leaving the field does. How: This blurs the input on Enter, which runs onBlur's own commit.
					/> // What: Name Input Element. Why: While isaOpeBoo, the plain name div below is replaced with a live-editable input. How: This commits on every change, re-trims and re-commits on blur, and blurs itself on Enter. Its data-element-name-hook is read by the reminder card's own row-click handler and help mode's Today catalog.


				) : ( // What: Plain Name Branch. Why: Outside editing, the plain non-editable name div belongs here instead. How: This renders the else branch, taken while isaOpeBoo is false.


					<div className={ cssModObj.todayCardName }>{ tasRcdObj.name }</div> // What: Card Name Div Element. Why: The plain, non-editing state just shows the name as text. How: This renders tasRcdObj's own name directly.


				) }


			</div>


			<div
				className={ cssModObj.todayCardActions }

				data-element-name-hook='carActDiv'
			>{ /* What: Card Actions Div Element. Why: Skip and Edit are the row's own click-isolated actions. How: This wraps both buttons below. Its data-element-name-hook is read by each Today card's own row-click handler, which ignores clicks inside it and help mode's Today catalog. */ }


				<button
					className={ cssModObj.iconBtn }

					aria-label='Skip reminder'
					title='Skip'

					onClick={ ( cliEveObj ) => { // What: Skip Click Handler. Why: Skip must not also toggle the row done. How: This isolates the click, then toggles the skip confirm.


						cliEveObj.stopPropagation(); // What: Row Click Isolation. Why: The card's own row click must not also fire for this control. How: This stops the click from bubbling to the article.

						onSkiTasFun(); // What: Skip Toggle Call. Why: This opens or closes the card's own skip confirm. How: This calls onSkiTasFun.


					} }
				>{ /* What: Skip Button Element. Why: This opens/closes this card's own skip confirm. How: This is isolated from the row's own onRowCliFun via stopPropagation. */ }


					<IcoSvgCom
						icoNamStr='skiEle'
						sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
					/>{ /* What: Icon Svg Component. Why: This is the Skip action's own glyph. How: This renders the 'skiEle' icon. */ }


				</button>

				<button
					className={ cssModObj.iconBtn }

					aria-expanded={ isaOpeBoo }
					aria-label='Edit reminder'
					title='Edit'

					onClick={ ( cliEveObj ) => { // What: Edit Click Handler. Why: Edit must not also toggle the row done. How: This isolates the click, then toggles the editor.


						cliEveObj.stopPropagation(); // What: Row Click Isolation. Why: The card's own row click must not also fire for this control. How: This stops the click from bubbling to the article.

						onEdiTasFun(); // What: Edit Toggle Call. Why: This opens or closes the card's own inline editor. How: This calls onEdiTasFun.


					} }
				>{ /* What: Edit Button Element. Why: This opens/closes this card's own inline schedule editor. How: This is isolated from the row's own onRowCliFun via stopPropagation. */ }


					<IcoSvgCom
						icoNamStr='ediEle'
						sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
					/>{ /* What: Icon Svg Component. Why: This is the Edit action's own glyph. How: This renders the 'ediEle' icon. */ }


				</button>


			</div>


		</article>


	);


}

// #endregion RemCarCom



// #region InlEdiCom

/**
 * InlEdiCom = Inline Edit Component
 *
 * @summary
 * Today's inline editor for a SAVED reminder. Edits a LOCAL draft
 * (never the store directly) so changing the schedule, e.g. moving a
 * weekly reminder off today, doesn't immediately filter the row out of
 * the live list; the change only lands on Save.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.onCloEdiFun - On Close Edit Function: Closes this inline editor
 *                            without saving.
 * @param props.onComTasFun - On Commit Task Function: Commits the local draft
 *                            back onto the real store.
 * @param props.onDelTasFun - On Delete Task Function: Deletes the underlying
 *                            reminder outright.
 * @param props.staAppObj   - State App Object: The shared app state, passed
 *                            through to {@link SchEdiCom}.
 * @param props.tasRcdObj   - Task Record Object: The saved reminder record
 *                            being edited.
 *
 * @returns The inline editor's own schedule editor plus its footer.
 *
 * @example
 * ```tsx
 * InlEdiCom({ onCloEdiFun, onComTasFun, ... }) // => <InlEdiCom />
 * ```
 *
*/

function InlEdiCom ( { onCloEdiFun, onComTasFun, onDelTasFun, staAppObj, tasRcdObj } ) {


	const [ draTasObj, setDraTasObj ] = React.useState( () => ( { ...tasRcdObj } ) ); // What: Draft Task Object And Setter. Why: The schedule editor below must edit a local copy, not the store directly, so a change doesn't immediately filter the row out of the live list. How: This starts as a shallow copy of tasRcdObj and is patched by draActObj below.

	const draActObj = { updTasFun : ( tasIdeStr, patValObj ) => setDraTasObj( ( curDraObj ) => ( { ...curDraObj, ...patValObj } ) ) }; // What: Draft Actions Object. Why: SchEdiCom expects an actions bag exposing updTasFun; this stands in for the real one, patching draTasObj locally instead of the store. How: This ignores its own first argument (SchEdiCom always passes tasRcdObj.id, already known here) and merges patValObj into draTasObj.



	return (


		<div
			className={ cssModObj.remInlineEditor }

			data-element-name-hook='inlEdiDiv'
		>{ /* What: Inline Editor Div Element. Why: This groups the schedule editor and its own footer as one visual unit. How: This renders SchEdiCom against draTasObj, then EdiFooCom below it. Its data-element-name-hook is read by help mode's Today catalog and help mode's Data catalog. */ }


			<SchEdiCom
				actStoObj={ draActObj }
				aniExtBoo
				layStr='stacked' // What: Layout String. Why: Today's editor keeps each label above its control, with dividers between fields. How: SchEdiCom's own module applies its stacked layout class.
				staAppObj={ staAppObj }
				tasRcdObj={ draTasObj }
			/>{ /* What: Schedule Editor Component. Why: This is the actual live schedule editor, operating on the local draft. How: This is passed draActObj instead of the real store actions, so every edit stays local until Save. */ }



			<EdiFooCom
				tasRcdObj={ draTasObj }

				onCanTasFun={ () => onCloEdiFun() }
				onDelTasFun={ onDelTasFun }
				onDonTasFun={ () => { // What: Save Handler. Why: Save commits the local draft and closes the editor. How: This commits draTasObj, then closes.


					onComTasFun( draTasObj ); // What: Draft Commit Call. Why: The local draft only reaches the store on Save. How: This passes draTasObj to onComTasFun.

					onCloEdiFun(); // What: Editor Close Call. Why: A saved editor has nothing left to show. How: This calls onCloEdiFun.


				} }
			/>{ /* What: Editor Foot Component. Why: This is the shared Cancel/Save/Delete footer. How: Cancel just closes without committing; Save commits draTasObj onto the real store via onComTasFun, then closes. */ }


		</div>


	);


}

// #endregion InlEdiCom



// #region RemSecCom

/**
 * RemSecCom = Reminder Section Component
 *
 * @summary
 * Today's Reminders section: the list of due reminders with their inline
 * editors and skip confirms, the mini-tour launcher cards for still-hidden
 * sample reminders, and the quick-add form, under a header matching every
 * other Today group. Rendered by tab-today.jsx.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actEdiStr    - Active Editor String: The tab-wide "which editor
 *                             is open" slot, shared with the picker item
 *                             editor.
 * @param props.actStoObj    - Action Store Object: The shared app actions that
 *                             mutate props.staAppObj.
 * @param props.arvTasSet    - Arriving Task Set: Ids currently playing a
 *                             cross-day arrival animation.
 * @param props.cheExiBoo    - Checklist Exiting Boolean: Whether the
 *                             onboarding checklist itself is mid-exit
 *                             animation.
 * @param props.ediModBoo    - Edit Mode Boolean: Whether Today's own Edit Mode
 *                             is on.
 * @param props.leaTasSet    - Leaving Task Set: Ids currently playing a cross-
 *                             day purge exit animation.
 * @param props.logOpeBoo    - Log Open Boolean: Whether the Reminders day-log
 *                             panel is currently open.
 * @param props.onGriDowFun  - On Grip Down Function: Starts dragging this
 *                             whole section to reorder it among other groups.
 * @param props.onPlaTutFun  - On Play Tutorial Function: Starts a sample
 *                             reminder's own mini-tour.
 * @param props.onTogLogFun  - On Toggle Log Function: Toggles the day-log
 *                             panel above.
 * @param props.onUncTutFun  - On Uncheck Tutorial Function: Un-resolves a
 *                             sample reminder's own mini-tour.
 * @param props.secRefFun    - Section Reference Function: A ref callback
 *                             registering this section's own DOM node by group
 *                             key.
 * @param props.setActEdiStr - Setter Active Editor String: Updates
 *                             props.actEdiStr.
 * @param props.staAppObj    - State App Object: The entire app's own persisted
 *                             state.
 *
 * @returns The full Reminders section: its header, optional day-log
 * panel, and its list of tutorial cards, quick-add form, and real
 * reminder cards.
 *
 * @example
 * ```tsx
 * RemSecCom({ actEdiStr, actStoObj, arvTasSet, ... }) // => <RemSecCom />
 * ```
 *
*/

function RemSecCom ( { actEdiStr, actStoObj, arvTasSet, cheExiBoo, ediModBoo, leaTasSet, logOpeBoo, onGriDowFun, onPlaTutFun, onTogLogFun, onUncTutFun, secRefFun, setActEdiStr, staAppObj } ) {


	// #region Due And Tutorial Lists

	const ancDatObj = TAS_NAM_OBJ.ancDatFun( staAppObj.today && staAppObj.today.generatedAt );                         // What: Anchor Date Object. Why: A reminder due on a new day shouldn't appear until the generator actually runs on/after that day, exactly like picker entries. How: This calls TAS_NAM_OBJ.ancDatFun against staAppObj's own last generation timestamp.
	const dueTasArr = TAS_NAM_OBJ.visTodFun( staAppObj.tasks, staAppObj.reminderOpts, staAppObj.holidays, ancDatObj ); // What: Due Task Array. Why: This is the real, non-sample reminder list this section actually renders. How: This calls TAS_NAM_OBJ.visTodFun against staAppObj's own tasks/reminderOpts/holidays, anchored to ancDatObj.


	const cheDonBoo = !!( staAppObj.onboarding && staAppObj.onboarding.checklistDone ); // What: Checklist Done Boolean. Why: Mini-tour launcher cards behave differently before vs. after the ORIGINAL first-time checklist concludes (see tutTasArr below). How: This reads staAppObj's own onboarding.checklistDone.

	const actTouStr = staAppObj.onboarding && staAppObj.onboarding.activeTour && staAppObj.onboarding.activeTour.id; // What: Active Tour String. Why: This decides whether a reminder mini-tour specifically (not just any tour) is currently running. How: This reads staAppObj's own onboarding.activeTour.id, or a falsy value when no tour is active.
	const remTouBoo = typeof actTouStr === 'string' && actTouStr.startsWith( 'reminder-' );                          // What: Reminder Tour Boolean. Why: The add button below must stay clickable during a reminder mini-tour's own Step 1, which needs the user to click it themselves rather than a simulated click. How: This checks actTouStr's own prefix.
	const tutProBoo = ONB_CHE_OBJ.tutProFun( staAppObj ) && !remTouBoo;                                              // What: Tutorial Progress Boolean. Why: Every OTHER tutorial still disables the add button as normal; only a reminder tour itself is exempted. How: This combines ONB_CHE_OBJ's own check with the negation of remTouBoo.


	const tutTasArr = ( staAppObj.tasks || [] ).filter( ( curTasObj ) => { // What: Tutorial Task Array. Why: One mini-tour launcher card is needed per still-hidden, still-relevant sample reminder. How: This keeps a hidden sample task unless it's already resolved post-checklistDone, or a same-named real reminder has since been created post-checklistDone.


		const hidSamBoo = curTasObj.hidden && ONB_STI_ARR.includes( curTasObj.id );                                                                                   // What: Hidden Sample Boolean. Why: Only a still-hidden sample reminder can have a launcher card at all. How: This checks the task's own hidden flag and the sample id list.
		const resDonBoo = cheDonBoo && ONB_CHE_OBJ.entLooFun( staAppObj, curTasObj.id );                                                                              // What: Resolved Done Boolean. Why: Once the checklist concludes, a sample whose tutorial entry is already resolved no longer needs its card. How: This looks up the sample's own checklist entry, only once cheDonBoo is true.
		const reaTwiBoo = cheDonBoo && ( staAppObj.tasks || [] ).some( ( othTasObj ) => !ONB_STI_ARR.includes( othTasObj.id ) && othTasObj.name === curTasObj.name ); // What: Real Twin Boolean. Why: Once the checklist concludes, a real reminder with the same name means the user already made their own. How: This searches the non-sample tasks for a matching name, only once cheDonBoo is true.

		const keeCarBoo = hidSamBoo && !resDonBoo && !reaTwiBoo; // What: Keep Card Boolean. Why: A launcher card stays only for a hidden sample that is neither resolved nor already copied. How: This combines the three checks above.



		return keeCarBoo; // What: Keep Card Return. Why: The filter needs the final keep decision. How: This returns keeCarBoo.


	} );

	// #endregion Due And Tutorial Lists



	// #region Editor Slots

	const addOpeBoo = actEdiStr === 'reminder-add'; // What: Add Open Boolean. Why: This decides whether the quick-add form's own actEdiStr slot is currently claimed. How: This compares actEdiStr against the literal 'reminder-add' sentinel.


	const opeTasStr = ( typeof actEdiStr === 'string' && actEdiStr.startsWith( 'reminder:' ) ) // What: Open Task String. Why: This is the id of whichever SAVED reminder's own inline editor is currently open, distinct from the quick-add form. How: This strips the 'reminder:' prefix off actEdiStr when it has one, otherwise null.
		? actEdiStr.slice( 'reminder:'.length ) // What: Prefixed Id Branch. Why: A saved reminder's editor slot is 'reminder:' plus its id. How: This strips the prefix to leave the id.
		: null;                                 // What: No Open Task Branch. Why: Any other slot value means no saved reminder's editor is open. How: This is null.

	// #endregion Editor Slots



	// #region Card Transitions

	const [ insIdeStr, setInsIdeStr ] = React.useState( null ); // What: Insert Identifier String And Setter. Why: A newly-added card needs to play its own entrance animation exactly once. How: This is set to the new card's own id right when commit finishes, then cleared on that card's own animation end.
	const [ remIdeStr, setRemIdeStr ] = React.useState( null ); // What: Removing Identifier String And Setter. Why: A card slated for delete/skip needs to play its own collapse-out animation before the underlying task is actually removed. How: This is set right before that animation starts, then cleared once it ends.
	const [ skiIdeStr, setSkiIdeStr ] = React.useState( null ); // What: Skip Identifier String And Setter. Why: A card's own skip confirm is its own independent open/closed slot, separate from actEdiStr. How: This holds whichever task's own skip confirm is currently open.
	const [ jusCheStr, setJusCheStr ] = React.useState( null ); // What: Just-Checked String And Setter. Why: A reminder that was JUST checked needs a brief "fresh" flourish, distinct from one that was already done. How: This is set on every fresh check and cleared 700ms later.

	const remActRef = React.useRef( null ); // What: Remove Action Reference. Why: Delete and Skip share the same collapse-out animation, but each needs its own action to run once it finishes. How: This holds whichever thunk should run on the removing card's own animation end.


	const onTogDonFun = ( curTasObj ) => { // What: On Toggle Done Function. Why: Toggling a reminder's own done state also needs to trigger its brief "fresh" flourish, but only on a genuine 0-to-1 transition. How: This calls actStoObj.togTasFun, then stages jusCheStr only when curTasObj wasn't already done.


		const wasDonBoo = TAS_NAM_OBJ.isaDonFun( curTasObj, ancDatObj ); // What: Was Done Boolean. Why: The fresh flourish must never replay for a reminder that was already checked before this toggle. How: This reads curTasObj's own done state before the toggle below applies.


		actStoObj.togTasFun( curTasObj.id ); // What: Toggle Done Call. Why: This is the actual state change every branch below reacts to. How: This calls actStoObj.togTasFun against curTasObj's own id.

		if ( !wasDonBoo ) { // What: Fresh Flourish Guard. Why: Only a genuine 0-to-1 transition should play the flourish. How: This stages and later clears jusCheStr only while wasDonBoo was false.


			setJusCheStr( curTasObj.id ); // What: Just-Checked Stage Call. Why: The card needs to know it was JUST checked so it can play its own fresh flourish. How: This sets jusCheStr to curTasObj's own id.

			setTimeout( () => setJusCheStr( ( preIdeStr ) => preIdeStr === curTasObj.id ? null : preIdeStr ), durMilFun( 'p05' ) ); // What: Fresh Flourish Clear Call. Why: The flourish must not replay on every future re-render, only the one right after this toggle. How: This clears jusCheStr back to null after the check ripple's own p05 duration step, but only if it still matches curTasObj's own id. // Duration Base Plus 5 ~= 643.9ms


		}


	};

	// #endregion Card Transitions



	// #region Add Announcement

	const [ addMesObj, setAddMesObj ] = React.useState( null ); // What: Added Message Object And Setter. Why: After a successful add, silence is indistinguishable from a failed save whenever the new reminder won't actually appear today, so this needs an explicit announcement. How: This is populated by annAddFun below and auto-cleared by the effect right after it.

	const addTimRef = React.useRef( null ); // What: Added Timeout Reference. Why: The scheduled clearing of addMesObj needs to be cancellable if a second add happens before the first message times out. How: This holds whichever setTimeout id is currently pending.


	React.useEffect( () => () => clearTimeout( addTimRef.current ), [] ); // What: Added Timer Cleanup Effect. Why: A pending message-clear timeout must not outlive this component. How: This clears addTimRef's own timeout id on unmount.


	const annAddFun = ( curTasObj ) => { // What: Announce Added Function. Why: This decides and stages the actual wording of the post-add announcement. How: This computes curTasObj's own real visibility, then picks a success or a "won't show today" message accordingly.


		const visResObj = TAS_NAM_OBJ.todVisFun( curTasObj, staAppObj.reminderOpts, staAppObj.holidays ); // What: Visibility Result Object. Why: The message below depends entirely on whether the new reminder is actually visible today. How: This calls TAS_NAM_OBJ.todVisFun against curTasObj.
		const nexLabStr = nexDatFun( visResObj.next, curTasObj.repeat === 'annual' );                     // What: Next Label String. Why: A hidden-today message should still say when the reminder WILL next appear, when known. How: This calls nexDatFun against visResObj's own next date.


		const newMesObj = visResObj.visible // What: New Message Object. Why: The announcement differs for an add that shows today versus one that doesn't. How: This picks the success or hidden-today message object based on visResObj's own visible flag.
			? { okaBoo : true, texStr : `"${ curTasObj.name }" added.` } // What: Success Message Object. Why: A visible-today add just needs a short confirmation. How: This names curTasObj's own name in the confirmation text.
			: { okaBoo : false, texStr : `"${ curTasObj.name }" added, but it will not show up in today's todo list.${ nexLabStr ? ` It will next appear on ${ nexLabStr }.` : '' }` }; // What: Hidden Message Object. Why: A not-visible-today add needs the fuller explanation, plus the next-appearance date when known. How: This names curTasObj's own name and appends nexLabStr's own sentence when it resolved to something.


		setAddMesObj( newMesObj ); // What: Add Message Stage Call. Why: This is the actual announcement staged for the effect below to auto-clear. How: This stores newMesObj for the message paragraph to render.


		clearTimeout( addTimRef.current );                                                             // What: Stale Timer Clear. Why: A previous message's own scheduled clear must not fire early and wipe this fresh one. How: This clears whatever timeout id addTimRef currently holds.
		addTimRef.current = setTimeout( () => setAddMesObj( null ), visResObj.visible ? 3000 : 9000 ); // What: Message Auto-Clear Call. Why: A hidden-today message is more important and gets more time on screen before it fades. How: This schedules addMesObj back to null after 3s (visible) or 9s (hidden).


	};

	// #endregion Add Announcement



	// #region Quick-Add Form

	const [ visForBoo, setVisForBoo ] = React.useState( addOpeBoo ); // What: Visible Form Boolean And Setter. Why: The quick-add form must stay mounted for its own exit animation even after actEdiStr has already moved on to a different editor. How: This starts at addOpeBoo and is later driven by the effect below.
	const [ draTasObj, setDraTasObj ] = React.useState( null );      // What: Draft Task Object And Setter. Why: The quick-add form holds a full draft task so the same SchEdiCom used on an existing reminder can configure recurrence before it's ever created. How: This starts null and is populated by staAddFun below.
	const [ addCloBoo, setAddCloBoo ] = React.useState( false );     // What: Add Closing Boolean And Setter. Why: The quick-add form's own exit animation needs a flag distinct from visForBoo, so the form stays mounted but visually collapsing during the close. How: This is toggled by cancelAdd/commit below.

	const wasAddRef  = React.useRef( addOpeBoo ); // What: Was Adding Reference. Why: The effect below needs to detect an addOpeBoo transition, not just its current value. How: This is read and overwritten at the end of that same effect.
	const selCloRef  = React.useRef( false );     // What: Self Closing Reference. Why: Our own cancel/commit already starts the exit animation itself; the effect below must not ALSO re-trigger it as if some other editor forced this one closed. How: This is set just before that self-initiated close begins.
	const cloTimRef  = React.useRef( null );      // What: Close Timeout Reference. Why: The scheduled end of an in-progress close animation needs to be cancellable if a fresh open/close interrupts it. How: This holds whichever setTimeout id is currently pending.
	const inpEleRef = React.useRef( null );       // What: Input Element Reference. Why: The quick-add form's own name input needs to be focusable programmatically. How: This is attached to that input's own ref prop below.
	const comTasRef = React.useRef( false );      // What: Commit Task Reference. Why: A rapid double-click on Add must not commit the same draft twice. How: This is checked and set at the very top of comAddFun below, then cleared 500ms after it finishes.


	React.useEffect( () => { if ( addOpeBoo && inpEleRef.current ) inpEleRef.current.focus(); }, [ addOpeBoo ] ); // What: Focus Effect. Why: Opening the quick-add form should focus its own name input immediately. How: This focuses inpEleRef's own current node whenever addOpeBoo becomes true.


	React.useEffect( () => { // What: Forced Close Effect. Why: Another editor opening elsewhere should force this quick-add form closed, playing the same exit animation Cancel itself uses rather than snapping shut. How: This detects a addOpeBoo transition to false that WASN'T our own doing, then stages the same close sequence cancelAdd uses.


		if ( addOpeBoo ) { setVisForBoo( true ); } // What: Opening Branch. Why: A genuine open transition just needs the form to become visible again. How: This sets visForBoo true while addOpeBoo is true.

		else if ( wasAddRef.current && !selCloRef.current ) { // What: Forced Close Branch. Why: A transition to closed that wasn't flagged as self-initiated means some other editor forced this one shut. How: This stages the same close sequence cancelAdd uses, respecting reduced motion.


			clearTimeout( cloTimRef.current ); // What: Stale Timer Clear. Why: A close already scheduled a moment ago must not also fire after this fresh forced-close begins. How: This clears whatever timeout id cloTimRef currently holds.


			if ( redMotFun() ) { // What: Reduced Motion Branch. Why: A user who prefers reduced motion should get an instant discard instead of an animated close. How: This clears the draft and hides the form immediately.


				setDraTasObj( null );  // What: Draft Clear Call. Why: A forced close discards the in-progress draft. How: This resets draTasObj to null.
				setVisForBoo( false ); // What: Form Hide Call. Why: With motion reduced the form hides at once. How: This flips visForBoo false.


			}

			else { // What: Animated Branch. Why: Otherwise the animated close should play, matching cancelAdd's own sequence. How: This stages addCloBoo, then clears the draft/form after the CSS transition finishes.


				setAddCloBoo( true ); // What: Add Closing Flag Set. Why: The form needs to stay mounted but visually collapsing while the transition plays. How: This flips addCloBoo true.

				cloTimRef.current = setTimeout( () => { // What: Deferred Discard Call. Why: The actual unmount must wait for the .18s close animation to finish first. How: This schedules the draft clear, then stores the timeout id for possible cancellation.


					setDraTasObj( null );  // What: Draft Clear Call. Why: The closed form's draft is spent. How: This resets draTasObj to null.
					setAddCloBoo( false ); // What: Add Closing Flag Reset. Why: The next open must not start mid-close. How: This clears addCloBoo.
					setVisForBoo( false ); // What: Form Hide Call. Why: The close animation has finished, so the form can unmount. How: This flips visForBoo false.


				}, 180 );


			}


		}



		selCloRef.current = false;     // What: Self-Close Flag Reset. Why: This effect's own guard only needs to suppress ITS reaction to the very next addOpeBoo transition our own code caused. How: This clears selCloRef back to false every run.
		wasAddRef.current = addOpeBoo; // What: Was-Adding Snapshot Update. Why: The next run of this effect needs to compare against whatever addOpeBoo is right now. How: This overwrites wasAddRef with addOpeBoo's own current value.


	}, [ addOpeBoo ] ); // What: Effect Dependency Array. Why: This effect only needs to re-run when addOpeBoo itself changes, since that's the exact transition it's watching for. How: addOpeBoo is compared against wasAddRef's own remembered prior value.


	const draActObj = { updTasFun : ( tasIdeStr, patValObj ) => setDraTasObj( ( curDraObj ) => ( { ...curDraObj, ...patValObj } ) ) }; // What: Draft Actions Object. Why: SchEdiCom expects an actStoObj bag exposing updTasFun; this stands in for the real one, patching draTasObj locally instead of the store. How: This ignores its own first argument (already known here) and merges patValObj into draTasObj.


	React.useEffect( () => { // What: Draft Repeat Publish Effect. Why: A reminder mini-tour's later steps need to show copy matching whichever schedule type is currently selected in this draft, without lifting this local state anywhere else. How: This republishes draTasObj's own repeat field onto the shared tour bus.


		emlTouObj.set( { draRepStr : draTasObj ? draTasObj.repeat : null } ); // What: Draft Repeat Publish Call. Why: A running mini-tour reads this field to decide which copy variant to show next. How: This writes draTasObj's own repeat (or null while no draft exists) onto the shared tour bus.


	}, [ draTasObj && draTasObj.repeat ] ); // What: Effect Dependency Array. Why: Only the draft's own repeat field is published, so only a change to that specific field needs to re-run this effect. How: draTasObj && draTasObj.repeat is the exact value being published.



	const staAddFun = () => { // What: Start Add Function. Why: Opening the quick-add form needs to build a fresh draft task, optionally pre-filled from a running mini-tour's own sample. How: This resolves the tour bus's own prefill (if any), builds a defaulted draft via TAS_NAM_OBJ.defTasFun, and claims the actEdiStr slot.


		clearTimeout( cloTimRef.current ); // What: Stale Timer Clear. Why: A pending forced-close discard from a moment ago shouldn't wipe this fresh draft once it lands. How: This clears whatever timeout id cloTimRef currently holds.

		const touBusObj = emlTouObj.get(); // What: Tour Bus Object. Why: A reminder mini-tour publishes the sample it's walking through here so the real "+" button (which the tour has the user click themselves) opens pre-filled with that sample's data instead of blank. How: This reads the shared tour bus's own current snapshot.


		setDraTasObj( TAS_NAM_OBJ.defTasFun( { ...( touBusObj.preFilObj || { repeat : 'once' } ), ...( touBusObj.shoCheBoo ? { hidden : true } : {} ) } ) ); // What: Draft Task Seed. Why: Any reminder created while the mini-tour checklist is up should stay hidden from the real list until it concludes, not just a tour's own reminders. How: This spreads touBusObj's own prefill (or a plain 'once' default) plus a hidden flag whenever touBusObj's own showChecklist is set.

		setAddCloBoo( false );          // What: Add Closing Flag Reset. Why: A freshly-opened form must not start out mid-close, in case a previous close was still in flight. How: This clears addCloBoo back to false.
		setActEdiStr( 'reminder-add' ); // What: Active Editor Claim. Why: The quick-add form needs to claim the shared actEdiStr slot so every other open editor forces itself closed. How: This sets actEdiStr to the 'reminder-add' sentinel.


	};



	const cloAddFun = () => setActEdiStr( ( curEdiStr ) => curEdiStr === 'reminder-add' ? null : curEdiStr ); // What: Close Add Function. Why: The shared actEdiStr slot may have already moved on to a different editor by the time a scheduled close finishes; only clear it if it's still ours. How: This clears actEdiStr only while it still equals the 'reminder-add' sentinel.


	const canAddFun = () => { // What: Cancel Add Function. Why: Cancel (and Escape) both discard the in-progress draft, playing the same collapse animation the forced-close effect above uses. How: This flags selCloRef first, then either discards instantly (reduced motion) or stages the animated close.


		selCloRef.current = true; // What: Self-Close Flag Set. Why: The forced-close effect above must not also react to the addOpeBoo transition this cancel is about to cause. How: This flags selCloRef before anything else below runs.



		if ( redMotFun() ) { // What: Reduced Motion Guard. Why: A user who prefers reduced motion should get an instant discard instead of an animated close. How: This clears the draft, closes the editor slot, and returns early.


			setDraTasObj( null );  // What: Draft Clear Call. Why: Cancel discards the in-progress draft. How: This resets draTasObj to null.
			setVisForBoo( false ); // What: Form Hide Call. Why: With motion reduced the form hides at once. How: This flips visForBoo false.
			cloAddFun();           // What: Close Add Call. Why: The shared editor slot must be released. How: This clears actEdiStr while it is still this form's own sentinel.
			setAddCloBoo( false ); // What: Add Closing Flag Reset. Why: The next open must not start mid-close. How: This clears addCloBoo.



			return; // What: Instant Discard Return. Why: The animated close below must not also run. How: This returns early.


		}



		setAddCloBoo( true ); // What: Add Closing Flag Set. Why: The form needs to stay mounted but visually collapsing while the transition plays. How: This flips addCloBoo true.

		cloTimRef.current = setTimeout( () => { // What: Deferred Discard Call. Why: The actual unmount must wait for the .18s close animation to finish first. How: This schedules the draft clear/editor close, then stores the timeout id for possible cancellation.


			setDraTasObj( null );  // What: Draft Clear Call. Why: The cancelled draft is discarded. How: This resets draTasObj to null.
			setVisForBoo( false ); // What: Form Hide Call. Why: The close animation has finished, so the form can unmount. How: This flips visForBoo false.
			cloAddFun();           // What: Close Add Call. Why: The shared editor slot must be released. How: This clears actEdiStr while it is still this form's own sentinel.
			setAddCloBoo( false ); // What: Add Closing Flag Reset. Why: The next open must not start mid-close. How: This clears addCloBoo.


		}, 180 );


	};


	const comAddFun = () => { // What: Commit Add Function. Why: This is the quick-add form's own Save action, creating the real reminder (or updating an existing one, for a re-run mini-tour) from draTasObj. How: This validates the name, resolves a possible existing sample-linked task, then stages the same collapse-then-reveal animation commit already used elsewhere.


		const tasNamStr = ( draTasObj?.name || '' ).trim(); // What: Task Name String. Why: An empty name is not a valid reminder and must not be committed. How: This trims draTasObj's own name, defaulting to an empty string when draTasObj itself is null.


		if ( !tasNamStr || comTasRef.current ) return; // What: Guard: Ignore Rapid Double-Click. Why: Either the name is blank, or a commit is already in flight. How: This bails out of the whole commit when either condition holds.



		comTasRef.current = true; // What: Commit In-Flight Flag Set. Why: This is the actual guard the top-of-function check above reads to reject a rapid second click. How: This flips comTasRef true for the duration of this commit.
		selCloRef.current = true; // What: Self-Close Flag Set. Why: The forced-close effect above must not also react to the addOpeBoo transition this commit is about to cause. How: This flags selCloRef before the animated close below begins.


		const exiTasObj = draTasObj.createdFromSample // What: Existing Task Object. Why: A reminder mini-tour replayed after already finishing once should update the SAME real reminder it created before, not spawn a duplicate. How: This looks up staAppObj's own tasks by matching createdFromSample, or null when this draft isn't tour-linked at all.
			? staAppObj.tasks.find( ( curTasObj ) => curTasObj.createdFromSample === draTasObj.createdFromSample ) // What: Sample Link Lookup. Why: A replayed mini-tour must find the reminder it created before. How: This finds the task sharing the draft's own createdFromSample id.
			: null;                                                                                                // What: No Sample Branch. Why: A draft not started from a sample has nothing to replace. How: This is null.

		const newIdeStr = exiTasObj ? exiTasObj.id : draTasObj.id; // What: New Identifier String. Why: The entrance animation below needs to target whichever id the committed reminder actually ends up at. How: This picks exiTasObj's own id when one was found, otherwise draTasObj's own id.

		const finAddFun = () => { // What: Finish Add Function. Why: The actual commit is deferred behind the collapse animation below (or run immediately under reduced motion), so it's centralized here. How: This calls actStoObj.addTasFun, announces the result, stages the entrance animation, and resets every quick-add staAppObj slot.


			actStoObj.addTasFun( { ...draTasObj, name : tasNamStr, ...( exiTasObj ? { replaceId : exiTasObj.id } : {} ) } ); // What: Add Task Call. Why: This is the actual commit, creating a new reminder or, for a re-run mini-tour, replacing the existing sample-linked one via replaceId. How: This spreads draTasObj with the trimmed name and an optional replaceId.

			annAddFun( { ...draTasObj, name : tasNamStr } ); // What: Announce Add Call. Why: The user needs to know whether the just-added reminder will actually show up today. How: This calls annAddFun against the same committed shape.
			setInsIdeStr( newIdeStr );                       // What: Insert Identifier Stage Call. Why: The committed reminder needs to play its own entrance animation exactly once. How: This sets insIdeStr to newIdeStr.
			setDraTasObj( null );                            // What: Draft Clear Call. Why: The quick-add form's own draft is fully spent once committed. How: This resets draTasObj back to null.
			setVisForBoo( false );                           // What: Visible Form Flag Clear. Why: The form must stop rendering once the commit finishes. How: This flips visForBoo false.
			cloAddFun();                                     // What: Close Add Call. Why: The shared actEdiStr slot must be released now that the commit is done. How: This calls cloAddFun, which clears actEdiStr only while it's still this form's own sentinel.
			setAddCloBoo( false );                           // What: Add Closing Flag Reset. Why: The next open must not start out mid-close. How: This clears addCloBoo back to false.

			setTimeout( () => { comTasRef.current = false; }, 500 ); // What: Commit Flag Release Call. Why: A later, genuinely new commit must be allowed once this one has fully settled. How: This clears comTasRef back to false after 500ms.


		};



		if ( redMotFun() ) { finAddFun(); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion should get an instant commit instead of an animated close-then-commit. How: This calls finAddFun directly and returns early.



		setAddCloBoo( true ); // What: Add Closing Flag Set. Why: The form needs to stay mounted but visually collapsing while the transition plays before the real commit lands. How: This flips addCloBoo true.

		cloTimRef.current = setTimeout( finAddFun, 180 ); // What: Deferred Commit Call. Why: The actual commit must wait for the .18s close animation to finish first. How: This schedules finAddFun, then stores the timeout id for possible cancellation.


	};


	useEscCanFun( visForBoo && !addCloBoo, canAddFun ); // What: Use Escape Cancel Function. Why: Escape should discard the quick-add regardless of what's been typed or which of its controls has focus. How: This calls canAddFun whenever the form is visible and not already mid-close.

	// #endregion Quick-Add Form



	// #region Header Progress

	const donCouNum = dueTasArr.filter( ( curTasObj ) => TAS_NAM_OBJ.isaDonFun( curTasObj, ancDatObj ) ).length;      // What: Done Count Number. Why: The header's own "N of M" count needs the real completed count among dueTasArr. How: This filters dueTasArr by TAS_NAM_OBJ.isaDonFun and reads the resulting length.
	const tutDonNum = tutTasArr.filter( ( curTasObj ) => !!ONB_CHE_OBJ.entLooFun( staAppObj, curTasObj.id ) ).length; // What: Tutorial Done Number. Why: A mini-tour launcher card resolved any of the 3 ways counts toward the same header total as a real completed card. How: This filters tutTasArr by ONB_CHE_OBJ.entLooFun and reads the resulting length.
	const remTotNum = dueTasArr.length + tutTasArr.length;                                                            // What: Reminder Total Number. Why: The header's own "of M" total must include both real due reminders and any still-offered tutorial cards. How: This sums dueTasArr's own length and tutTasArr's own length.
	const remDonNum = donCouNum + tutDonNum;                                                                          // What: Reminder Done Number. Why: The header's own "N of" count must likewise include both real completions and resolved tutorial cards. How: This sums donCouNum and tutDonNum.

	const remPreRef = React.useRef( remDonNum ); // What: Reminder Previous Reference. Why: The dash-bar animation below needs remDonNum's own PRIOR value to detect a genuine increase, not just its current value. How: This starts at remDonNum and is updated at the end of the effect below.

	const [ remFreNum, setRemFreNum ] = React.useState( -1 ); // What: Reminder Fresh Number And Setter. Why: The dash-bar's own just-completed dash needs to know WHICH index to briefly animate, mirroring GroupHeader's own freshIdx. How: This is set by the effect below and cleared 520ms later.


	React.useEffect( () => { // What: Dash Animation Effect. Why: The dash that just turned on should animate in, exactly like every other group's own progress bar, even though this section isn't rendered by that shared component. How: This detects a genuine increase in remDonNum, stages remFreNum, then clears it after the flourish's own duration.


		if ( remDonNum > remPreRef.current ) { // What: Genuine Increase Guard. Why: Only an actual increase (not e.g. an unrelated re-render) should trigger the flourish. How: This compares remDonNum against remPreRef's own remembered prior value.


			const newFreNum = remDonNum - 1; // What: New Fresh Number. Why: The just-completed dash is always the one immediately before the new total. How: This subtracts 1 from remDonNum.


			setRemFreNum( newFreNum ); // What: Fresh Index Stage Call. Why: This is what actually tells the dash bar which index to briefly animate. How: This sets remFreNum to newFreNum.

			const freTimNum = setTimeout( () => setRemFreNum( ( curFreNum ) => ( curFreNum === newFreNum ? -1 : curFreNum ) ), durMilFun( 'p04' ) ); // What: Fresh Timeout Number. Why: The flourish must clear itself after its own animation duration, but only if nothing newer has already taken over. How: This resets remFreNum back to -1 after the dash sweep's own p04 duration step, guarded against a staler run clobbering a newer one. // Duration Base Plus 4 ~= 486.1ms


			remPreRef.current = remDonNum; // What: Previous Snapshot Update. Why: The next run of this effect needs to compare against whatever remDonNum is right now. How: This overwrites remPreRef with remDonNum's own current value.



			return () => clearTimeout( freTimNum ); // What: Effect Cleanup Return. Why: A stale fresh-flourish timeout must not outlive this run, in case remDonNum changes again before it fires. How: This returns a closure that clears freTimNum.


		}



		remPreRef.current = remDonNum; // What: Previous Snapshot Update. Why: A non-increasing run still needs to keep remPreRef in sync, so a later genuine increase is detected correctly. How: This overwrites remPreRef with remDonNum's own current value.


	}, [ remDonNum ] ); // What: Effect Dependency Array. Why: This effect only needs to re-run when remDonNum itself changes, since that's the exact value its own comparison watches. How: remDonNum is compared against remPreRef's own remembered prior value every run.

	// #endregion Header Progress



	return (


		<section
			ref={ secRefFun }

			className={ cssModObj.groupSection }

			data-element-name-hook='todGroSec remGroSec'
		>{ /* What: Group Section Element. Why: This is RemSecCom's own root element, matching every other Today group's own outer landmark. How: This renders the header, the optional day-log panel, and the today-list below. Its data-element-name-hook is read by Today's own drag-to-reorder and scroll code, the Welcome Tour, help mode's Today catalog, and the Today page tour. */ }


			<header className={ cssModObj.groupH }>{ /* What: Group Header Element. Why: This groups the section's own name/count/log-chip on the left and its progress/add-button on the right. How: This renders group-h-l and rem-h-r below, marking itself reorderable while ediModBoo is on. */ }


				<div className={ cssModObj.groupHL }>{ /* What: Group Header Left Div Element. Why: The drag grip, name, count, and log chip read together on the header's own left side. How: This wraps all 4 below, the grip only while ediModBoo is on. */ }


					{ ediModBoo && ( // What: Grip Visibility Check. Why: The drag grip only makes sense while Edit Mode is on. How: This renders the grip span only while ediModBoo is true.


						<span
							className={ cssModObj.groupGrip }

							data-element-name-hook='groGriSpa'

							draggable={ false }

							aria-label='Drag to reorder group'
							role='button'
							tabIndex={ 0 }

							onDragStart={ ( draEveObj ) => draEveObj.preventDefault() } // What: Native Drag Block. Why: The grip uses its own pointer-driven reorder, so the browser's HTML5 drag must never start. How: This cancels dragstart.
							onPointerDown={ ( poiEveObj ) => onGriDowFun( poiEveObj ) }
						>{ /* What: Group Grip Span Element. Why: This is the whole section's own drag handle for reordering among other groups. How: This suppresses the native HTML5 drag entirely and forwards pointer-down straight to onGriDowFun. Its data-element-name-hook is read by the Today page tour and help mode's Today catalog. */ }


							<IcoSvgCom
								icoNamStr='griEle'
								sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
							/>{ /* What: Icon Svg Component. Why: This is the grip's own visible glyph. How: This renders the 'griEle' icon. */ }


						</span>


					) }

					<h2 className={ cssModObj.groupName }>Reminders</h2>{ /* What: Group Name Heading Element. Why: This is the section's own fixed title, matching every other Today group's own heading. How: This renders the literal text "Reminders". */ }

					<span className={ cssModObj.groupCount }>{ /* What: Group Count Span Element. Why: The done and total counts read together as one "N of M" unit. How: This wraps the done span and the "of M" span below. */ }


						<span className={ cssModObj.groupDone }>{ remDonNum }</span>{ /* What: Group Done Span Element. Why: This is the header's own live completed count. How: This renders remDonNum directly. */ }

						<span className={ cssModObj.groupOf }>of { remTotNum }</span>{ /* What: Group Of Span Element. Why: This is the header's own live total count. How: This renders remTotNum directly. */ }


					</span>



					{ !ediModBoo && onTogLogFun && ( // What: Log Chip Visibility Check. Why: The day-log toggle only makes sense outside Edit Mode, and only when a caller actually wired up onTogLogFun. How: This renders only while both conditions hold.


						<LogChiCom
							open={ logOpeBoo }

							onTogLogFun={ onTogLogFun }
						/> // What: Log Chip Component. Why: This is the Reminders header's own toggle for its day-log panel. How: This shows logOpeBoo and toggles the panel via onTogLogFun.


					) }


				</div>


				<div className={ cssModObj.remHR }>{ /* What: Header Right Div Element. Why: The progress dash-bar and the add button read together on the header's own right side. How: This wraps both below. */ }


					<div className={ cssModObj.groupProgress }>{ /* What: Group Progress Div Element. Why: This mirrors GroupHeader's own dash-bar for every other Today group, even though this section isn't rendered by that shared component. How: This renders one dash per remTotNum, marking the done ones and briefly flourishing the freshest one. */ }


						{ [ ...Array( remTotNum ).keys() ].map( ( dasIndNum ) => ( // What: Dash List Render. Why: One dash is needed per item this section counts toward its own total. How: This maps the indices of a remTotNum-length array to one <i> per dash, keyed by its own index (stable here, since remTotNum only ever grows/shrinks at its own end).


							<i
								key={ dasIndNum }

								className={ dasIndNum === remFreNum ? cssModObj.isFresh : '' }

								data-dash-done-active={ dasIndNum < remDonNum || undefined } // What: Dash Done Active Attribute. Why: A done row's dash is filled by its module. How: This sets the presence-only attribute while this dash's index is below remDonNum.
							/> // What: Dash Element. Why: This is one individual dash in the progress bar. How: This marks itself done when its own index is below remDonNum, and fresh with the module's sweep class only for the single index remFreNum currently flourishing.


						) ) }


					</div>



					{ !ediModBoo && ( // What: Add Button Visibility Check. Why: The add button (or its disabled InfTipCom stand-in) only makes sense outside Edit Mode. How: This renders one of the 2 branches below only while ediModBoo is false.


						tutProBoo ? ( // What: Tutorials In Progress Check. Why: The add control must stay disabled with an explanation while the guided checklist is still running. How: This renders the disabled InfTipCom while tutProBoo is true, the real button otherwise.


							<InfTipCom
								className={ cssModObj.remAddBtn }

								data-element-name-hook='remAddSpa'

								actNamStr='Add a Reminder'
								labTexStr='This button is disabled until all tutorials are completed.'
							>{ /* What: Info Tip Component. Why: A disabled add control still needs to explain why it can't be clicked while some other tutorial is in progress. How: This wraps the plus icon, standing in for the real button below. Its data-element-name-hook is read by the reminder mini-tours and help mode's Today catalog. */ }


								<IcoSvgCom
									icoNamStr='pluEle'
									sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
								/>{ /* What: Icon Svg Component. Why: This is the disabled control's own visible glyph, matching the real button's own icon. How: This renders the 'pluEle' icon. */ }


							</InfTipCom>


						) : ( // What: Add Button Branch. Why: Outside the guided checklist, the real working Add button belongs here instead. How: This renders the else branch, taken while tutProBoo is false.


							<button
								className={ cssModObj.remAddBtn }

								data-element-name-hook='remAddBut'

								aria-label='Add a Reminder'
								title='Add a Reminder'

								onClick={ () => { addOpeBoo ? canAddFun() : staAddFun(); } } // What: Add Toggle Click. Why: The same button opens the quick-add form or cancels it when already open. How: This calls canAddFun while addOpeBoo, staAddFun otherwise.
							>{ /* What: Add Button Element. Why: This is the real, clickable entry point into the quick-add form. How: This toggles between canAddFun and staAddFun based on whether the form is already open. Its data-element-name-hook is read by the reminder mini-tours and help mode's Today catalog. */ }


								<IcoSvgCom
									icoNamStr='pluEle'
									sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
								/>{ /* What: Icon Svg Component. Why: This is the add button's own visible glyph. How: This renders the 'pluEle' icon. */ }


							</button>


						)


					) }


				</div>


			</header>



			{ !ediModBoo && ( // What: Log Panel Visibility Check. Why: The day-log panel only makes sense outside Edit Mode. How: This renders the ColDisCom-wrapped RemLogCom only while ediModBoo is false.


				<ColDisCom open={ !!logOpeBoo }>{ /* What: Collapse Disclosure Component. Why: The day-log panel needs to animate open/closed rather than snapping. How: This wraps RemLogCom, open only while logOpeBoo is true. */ }


					<RemLogCom
						staAppObj={ staAppObj }

						onCloLogFun={ onTogLogFun }
					/>{ /* What: Reminders Log Component. Why: This is the actual "what did the generator do today" audit panel for this group. How: This is passed staAppObj and closes back via onTogLogFun. */ }


				</ColDisCom>


			) }



			<div
				className={ cssModObj.todayList }

				data-element-name-hook='todLisDiv'
			>{ /* What: Today List Div Element. Why: This is the shared vertical list every card/form below stacks inside, matching every other Today group's own list. How: This renders the added-message banner, the quick-add form, every tutorial card, and every real reminder row plus its inline editors. Its data-element-name-hook is read by Today's own drag-to-reorder code. */ }


				{ addMesObj && ( // What: Added Message Visibility Check. Why: The post-add announcement only exists right after a successful commit. How: This renders the message paragraph only while addMesObj holds a value.


					<p
						className={ cssModObj.remAddedMsg }

						data-message-ok-active={ addMesObj.okaBoo || undefined } // What: Message Ok Active Attribute. Why: A reminder that lands in today's list reads as a success, anything else as a warning. How: This sets the presence-only attribute while addMesObj's okaBoo is true.

						role='status'
					>{ addMesObj.texStr }</p> // What: Added Message Paragraph Element. Why: This is the live-announced confirmation or warning text itself. How: This reads as a success while data-message-ok-active is set, and as a warning otherwise.


				) }



				{ visForBoo && draTasObj && ( // What: Quick-Add Visibility Check. Why: The whole quick-add form only exists while it's visible AND a draft has actually been built. How: This renders the form only while both conditions hold.


					<div
						className={` ${ cssModObj.remQuickaddWrap }   ${ addCloBoo ? cssModObj.isClosing : '' } `}

						data-element-name-hook='remAddDiv'
					>{ /* What: Quick-Add Wrap Div Element. Why: The name input row and the full schedule editor need to collapse together as one unit. How: This wraps both below, marking itself closing while addCloBoo is true. Its data-element-name-hook is read by the reminder mini-tours, help mode's Today catalog, and help mode's Data catalog. */ }


						<div
							className={ cssModObj.remQuickadd }

							data-element-name-hook='remFieDiv'
						>{ /* What: Quick-Add Div Element. Why: The name input needs its own row above the schedule editor. How: This wraps the single name input below. Its data-element-name-hook is read by the reminder mini-tours and help mode's Today catalog. */ }


							<input
								ref={ inpEleRef }

								className={ cssModObj.npInput }

								data-element-name-hook='addNamInp'

								maxLength={ 60 }
								placeholder='Add a reminder, e.g. Take out the trash'
								type='text'
								value={ draTasObj.name }

								aria-label='Reminder name'

								onChange={ ( chaEveObj ) => setDraTasObj( ( curDraObj ) => ( { ...curDraObj, name : chaEveObj.target.value } ) ) }
								onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Enter' ) comAddFun(); } } // What: Enter Commit Shortcut. Why: Pressing Enter in the name field should add the reminder. How: This calls comAddFun on Enter.
							/>{ /* What: Name Input Element. Why: This is the quick-add form's own primary, first-focused field. How: This commits every keystroke straight into draTasObj, and Enter commits the whole form via comAddFun. Its data-element-name-hook is read by help mode's Today catalog. */ }


						</div>


						<div
							className={ cssModObj.remInlineEditor }

							data-element-name-hook='inlEdiDiv'
						>{ /* What: Inline Editor Div Element. Why: The schedule editor and its own footer need to sit together, same layout as InlEdiCom's own root. How: This renders SchEdiCom against draTasObj, then its own Cancel/Add footer. Its data-element-name-hook is read by help mode's Today catalog and help mode's Data catalog. */ }


							<SchEdiCom
								actStoObj={ draActObj }
								aniExtBoo
								layStr='stacked' // What: Layout String. Why: Today's editor keeps each label above its control, with dividers between fields. How: SchEdiCom's own module applies its stacked layout class.
								staAppObj={ staAppObj }
								tasRcdObj={ draTasObj }
							/>{ /* What: Schedule Editor Component. Why: This is the actual live schedule editor, operating on the in-progress draft before it's ever created. How: This is passed draActObj instead of the real store actStoObj, so every field stays local until Add. */ }



							<div
								className={ cssModObj.remInlineFoot }

								data-element-name-hook='ediFooDiv'
							>{ /* What: Inline Foot Div Element. Why: Cancel and Add read as a pair, matching EdiFooCom's own plain-footer shape. How: This wraps both ButBasCom elements below. Its data-element-name-hook is read by help mode's Today catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


								<ButBasCom
									kinValStr='ghost'
									sizValStr='sm'

									onClick={ canAddFun }
								>Cancel</ButBasCom>{ /* What: Button Base Component. Why: This discards the in-progress draft entirely. How: This calls canAddFun. */ }



								<ButBasCom
									data-element-name-hook='remSavBut'

									disabled={ !draTasObj.name.trim() }
									kinValStr='primary'
									sizValStr='sm'

									onClick={ comAddFun }
								>Add</ButBasCom>{ /* What: Button Base Component. Why: This is the form's own actual submit action. How: This calls comAddFun, disabled while the name is blank. Its data-element-name-hook is read by the reminder mini-tours. */ }


							</div>


						</div>


					</div>


				) }



				{ tutTasArr.map( ( curTasObj ) => ( // What: Tutorial Card List Render. Why: One mini-tour launcher card is needed per still-relevant hidden sample. How: This maps tutTasArr to one RemCarCom per entry, keyed by its own id.


					<RemCarCom
						key={ curTasObj.id }

						actStoObj={ actStoObj }
						extClaStr={ cheExiBoo ? cssModObj.isRemoving : '' } // What: Checklist Exit Class. Why: Tutorial cards leave together with the onboarding checklist. How: This applies the removing class while cheExiBoo.
						isaTutBoo
						tasRcdObj={ curTasObj }
						tutDonBoo={ !!ONB_CHE_OBJ.entLooFun( staAppObj, curTasObj.id ) }

						onPlaTutFun={ onPlaTutFun }
						onUncTutFun={ onUncTutFun }
					/> // What: Reminder Card Component. Why: This is one mini-tour launcher card. How: This is flagged isaTutBoo, resolved via ONB_CHE_OBJ.entLooFun, and plays the checklist's own exit class while cheExiBoo.


				) ) }



				{ dueTasArr.map( ( curTasObj ) => ( // What: Due Card List Render. Why: One real reminder row (plus its own inline editors) is needed per currently-due reminder. How: This maps dueTasArr to one RemCarCom, one skip ColDisCom, and one edit ColDisCom per entry, keyed by its own id.


					<React.Fragment key={ curTasObj.id }>{ /* What: Due Card Fragment Element. Why: Each due reminder renders its card plus its inline editors as siblings. How: This groups them per reminder, keyed by the task's own id. */ }


						<RemCarCom
							actStoObj={ actStoObj }
							cheDatObj={ ancDatObj }
							extClaStr={ insIdeStr === curTasObj.id // What: Card Class Pick. Why: A card plays at most one entrance or exit animation, picked by which transition it is currently in. How: This checks each transition in priority order below, falling back to no class.
								? cssModObj.remCardInsert                        // What: Just Added Class. Why: A newly added card plays its entrance animation. How: This applies while insIdeStr matches this card.
								: remIdeStr === curTasObj.id                     // What: Removing Check. Why: A card being deleted plays its exit animation next in priority. How: This compares remIdeStr against this card.
								? cssModObj.remCardRemoving                      // What: Removing Class. Why: This is the deletion exit animation. How: This applies while remIdeStr matches this card.
								: ( leaTasSet && leaTasSet.has( curTasObj.id ) ) // What: Leaving Check. Why: A card leaving the list for another reason plays the purge animation. How: This checks leaTasSet for this card.
								? cssModObj.remCardPurging                       // What: Purging Class. Why: This is the leave-the-list exit animation. How: This applies while leaTasSet holds this card.
								: ( arvTasSet && arvTasSet.has( curTasObj.id ) ) // What: Arriving Check. Why: A card newly arriving in the list (e.g. due again) also plays the entrance animation. How: This checks arvTasSet for this card.
								? cssModObj.remCardInsert                        // What: Arriving Class. Why: An arriving card reuses the entrance animation. How: This applies while arvTasSet holds this card.
								: ''                                             // What: No Class. Why: A card in no transition needs no extra class. How: This is an empty string.
							}
							isaOpeBoo={ opeTasStr === curTasObj.id }
							isaSkiBoo={ skiIdeStr === curTasObj.id }
							jusCheStr={ jusCheStr }
							tasRcdObj={ curTasObj }

							onAniEndFun={ ( aniEveObj ) => { // What: Animation End Handler. Why: This card's own collapse-in/out animations must clear their own staged flags exactly once, and only for the card's own outer element, not a bubbled child animation. How: This guards on the real target first, then clears insIdeStr and/or runs the deferred remove/skip action.


								if ( aniEveObj.target !== aniEveObj.currentTarget ) return; // What: Bubbled Animation Guard. Why: A child element's own animation ending must not be mistaken for this card's own outer animation ending. How: This bails out unless the event's own target is this exact element.



								if ( insIdeStr === curTasObj.id ) setInsIdeStr( null ); // What: Insert Flag Clear Guard. Why: The entrance animation must only ever play once. How: This clears insIdeStr only while it still matches curTasObj's own id.



								if ( remIdeStr === curTasObj.id ) { // What: Removal Finish Guard. Why: The card's own collapse-out animation ending is exactly when the deferred delete/skip action should actually run. How: This invokes remActRef's own thunk (or a plain delTasFun fallback), then clears both remActRef and remIdeStr.


									( remActRef.current || ( () => actStoObj.delTasFun( curTasObj.id ) ) )(); // What: Deferred Action Call. Why: Delete and Skip each stage a different thunk here; a missing thunk still falls back to a plain remove. How: This invokes remActRef's own current thunk, or a plain delTasFun call when none was staged.
									remActRef.current = null;                                                 // What: Action Reference Clear. Why: A stale thunk must not accidentally run again on some later animation end. How: This resets remActRef back to null.
									setRemIdeStr( null );                                                     // What: Removing Flag Clear. Why: The card's own collapse-out animation has now fully finished. How: This clears remIdeStr back to null.


								}


							} }
							onEdiTasFun={ () => { // What: Edit Toggle Handler. Why: Tapping Edit toggles this card's own inline editor and closes its skip confirm. How: This flips the shared editor slot for this card, then clears skiIdeStr.


								setActEdiStr( ( curEdiStr ) => curEdiStr === `reminder:${ curTasObj.id }` ? null : `reminder:${ curTasObj.id }` ); // What: Editor Slot Toggle Call. Why: The same tap opens or closes this card's editor. How: This clears the slot when it already holds this card, otherwise claims it.

								setSkiIdeStr( null ); // What: Skip Confirm Close Call. Why: The editor and the skip confirm never show together. How: This clears skiIdeStr.


							} }
							onRenTasFun={ ( namStr ) => actStoObj.renTasFun( curTasObj.id, namStr ) }
							onSkiTasFun={ () => { // What: Skip Handler. Why: The row's own Skip button needs to toggle its own confirm prompt open/closed and close any unrelated open editor at the same time. How: This flips skiIdeStr and clears a matching actEdiStr sentinel.


								setSkiIdeStr( ( curSkiStr ) => curSkiStr === curTasObj.id ? null : curTasObj.id );                                            // What: Skip Confirm Toggle Call. Why: This is the actual open/close toggle for this card's own skip confirm prompt. How: This flips skiIdeStr between null and curTasObj's own id.
								setActEdiStr( ( curEdiStr ) => ( typeof curEdiStr === 'string' && curEdiStr.startsWith( 'reminder:' ) ) ? null : curEdiStr ); // What: Reminder Editor Close Call. Why: Opening the skip confirm should close any open inline schedule editor, but must not clobber some unrelated other editor. How: This clears actEdiStr only while it's currently any 'reminder:' editor sentinel.


							} }
							onTogTasFun={ onTogDonFun }
						/>{ /* What: Reminder Card Component. Why: This is one real, due reminder's own row. How: This wires every one of its callback props straight into this section's own local staAppObj and actStoObj. */ }



						<ColDisCom open={ opeTasStr === curTasObj.id }>{ /* What: Collapse Disclosure Component. Why: The inline schedule editor only exists while this exact card's own edit affordance is open. How: This animates InlEdiCom open only while opeTasStr matches curTasObj's own id. */ }


							<InlEdiCom
								staAppObj={ staAppObj }
								tasRcdObj={ curTasObj }

								onCloEdiFun={ () => setActEdiStr( ( curEdiStr ) => curEdiStr === `reminder:${ curTasObj.id }` ? null : curEdiStr ) } // What: Editor Close Handler. Why: Another editor may already hold the shared slot, which must not be cleared. How: This clears the slot only while it still holds this card's own sentinel.
								onComTasFun={ ( draSnaObj ) => actStoObj.updTasFun( curTasObj.id, draSnaObj ) }
								onDelTasFun={ () => { // What: Delete Handler. Why: Deleting this reminder needs to close its own inline editor and stage the same collapse-then-remove sequence the card-level Delete uses. How: This closes actEdiStr, then either removes immediately (reduced motion) or defers it behind the collapse-out animation.


									setActEdiStr( ( curEdiStr ) => curEdiStr === `reminder:${ curTasObj.id }` ? null : curEdiStr ); // What: Reminder Editor Close Call. Why: Deleting this reminder must also close its own now-stale inline editor. How: This clears actEdiStr only while it still equals this exact card's own sentinel.



									if ( redMotFun() ) { actStoObj.delTasFun( curTasObj.id ); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion should get an instant remove instead of an animated collapse-then-remove. How: This calls actStoObj.delTasFun directly and returns early.



									remActRef.current = () => actStoObj.delTasFun( curTasObj.id ); // What: Remove Action Stage Call. Why: The card's own collapse-out animation must finish before the actual removal runs. How: This stages a thunk remActRef reads on the card's own onAniEndFun.
									setRemIdeStr( curTasObj.id );                                  // What: Removal Stage Call. Why: The card above must play its own collapse-out animation before remActRef's own thunk actually runs, on that card's own onAniEndFun. How: This stages curTasObj's own id as the currently-removing card.


								} }
							/>{ /* What: Inline Edit Component. Why: This is the actual schedule editor for this card, committing straight to the real store. How: This is passed curTasObj directly (not a local draft), closing back via onCloEdiFun. */ }


						</ColDisCom>



						<ColDisCom open={ skiIdeStr === curTasObj.id }>{ /* What: Collapse Disclosure Component. Why: The skip confirm only exists while this exact card's own skip affordance is open. How: This animates the confirm prompt open only while skiIdeStr matches curTasObj's own id. */ }


							{ ( () => { // What: Skip Confirm Content Function. Why: The confirm prompt's own wording depends on curTasObj's own next eligible day, computed once as an IIFE rather than inline in the JSX below. How: This resolves that next day, then returns the confirm/no-day-available markup.


								const nexEliObj = TAS_NAM_OBJ.nexEliFun( curTasObj, staAppObj.reminderOpts, staAppObj.holidays ); // What: Next Eligible Object. Why: This is the actual date the Skip action would defer curTasObj to. How: This calls TAS_NAM_OBJ.nexEliFun against curTasObj.
								const tomIsoStr = isoDayFun( new Date( Date.now() + 86400000 ) );                     // What: Tomorrow Iso String. Why: The label below reads "tomorrow" instead of a full date when that's literally what nexEliObj resolves to. How: This computes tomorrow's own iso string from right now plus one day in milliseconds.
								const nexIsoStr = nexEliObj ? isoDayFun( nexEliObj ) : null;                          // What: Next Iso String. Why: This is compared against tomIsoStr to decide the label below. How: This calls isoDayFun against nexEliObj, or null when there's no eligible day at all.

								const skiLabStr = !nexEliObj // What: Skip Label String. Why: This is the actual day named in the confirm prompt below, or null when there's nothing to skip to. How: This picks 'tomorrow' when nexIsoStr matches tomIsoStr, otherwise a full locale-formatted date, or null when nexEliObj itself is null.
									? null                                                                                             // What: No Day Branch. Why: With no next eligible day there is nothing to name. How: This is null.
									: nexIsoStr === tomIsoStr                                                                          // What: Tomorrow Check. Why: A next day of tomorrow reads better as the word itself. How: This compares nexIsoStr against tomIsoStr.
									? 'tomorrow'                                                                                       // What: Tomorrow Branch. Why: This is the plain word used when the next day is tomorrow. How: This is the literal 'tomorrow'.
									: nexEliObj.toLocaleDateString( 'en-US', { day : 'numeric', month : 'short', weekday : 'long' } ); // What: Full Date Branch. Why: Any later day needs its real date named. How: This formats nexEliObj as a weekday, short month and day.



								return (


									<div className={ cssModObj.remSkipConfirm }>{ /* What: Skip Confirm Div Element. Why: This is the skip prompt's own root, replacing nothing (it renders inline below the card, inside its own ColDisCom). How: This renders one of the 2 branches below depending on whether skiLabStr resolved to a real day. */ }


										{ skiLabStr ? ( // What: Skip Label Check. Why: The confirm prompt's own shape depends on whether a real eligible day was actually found. How: This renders the Skip-until confirm while skiLabStr holds a value, an explanatory no-day message otherwise.


											<>{ /* What: Skip Confirm Fragment Element. Why: The skip message and its buttons render together as one branch. How: This groups them with no wrapper element. */ }


												<div className={ cssModObj.remSkipMsg }>Skip until <strong>{ skiLabStr }</strong>?</div>{ /* What: Skip Message Div Element. Why: This names the exact day curTasObj would be deferred to. How: This renders skiLabStr inside the confirm question. */ }

												<div className={ cssModObj.remSkipActions }>{ /* What: Skip Actions Div Element. Why: Cancel and Confirm read as a pair. How: This wraps both ButBasCom elements below. */ }


													<ButBasCom
														kinValStr='ghost'
														sizValStr='sm'

														onClick={ () => setSkiIdeStr( null ) }
													>Cancel</ButBasCom>{ /* What: Button Base Component. Why: This backs out of the skip confirm without changing anything. How: This closes skiIdeStr, returning to the plain row. */ }



													<ButBasCom
														kinValStr='primary'
														sizValStr='sm'

														onClick={ () => { // What: Confirm Skip Click Handler. Why: Confirming the skip needs to close the prompt and stage the same collapse-then-skip sequence Delete uses. How: This closes skiIdeStr, then either skips immediately (reduced motion) or defers it behind the collapse-out animation.


															setSkiIdeStr( null ); // What: Skip Confirm Close Call. Why: The confirm prompt has now been answered, so it must close. How: This clears skiIdeStr back to null.



															if ( redMotFun() ) { actStoObj.skiTasFun( curTasObj.id, nexIsoStr ); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion should get an instant skip instead of an animated collapse-then-skip. How: This calls actStoObj.skiTasFun directly and returns early.



															remActRef.current = () => actStoObj.skiTasFun( curTasObj.id, nexIsoStr ); // What: Skip Action Stage Call. Why: The card's own collapse-out animation must finish before the actual skip runs. How: This stages a thunk remActRef reads on the card's own onAniEndFun, reusing the same removal machinery Delete uses.

															setRemIdeStr( curTasObj.id ); // What: Removal Stage Call. Why: The card above must play its own collapse-out animation before the deferred skiTasFun call actually runs, on that card's own onAniEndFun. How: This stages curTasObj's own id as the currently-removing card, reusing the same removal machinery Delete uses.


														} }
													>Confirm</ButBasCom>{ /* What: Button Base Component. Why: This is the actual, confirmed skip trigger. How: This stages the deferred actStoObj.skiTasFun call above. */ }


												</div>


											</>


										) : ( // What: No Eligible Day Branch. Why: With nothing to skip to, the prompt just needs a plain explanatory message and Close button instead. How: This renders the else branch, taken while skiLabStr is null.


											<>{ /* What: No Day Fragment Element. Why: The explanation and its Close button render together as one branch. How: This groups them with no wrapper element. */ }


												<div className={ cssModObj.remSkipMsg }>No upcoming eligible day to skip to.</div>{ /* What: Skip Message Div Element. Why: curTasObj has no eligible day at all to defer to, e.g. every allowed weekday is excluded. How: This renders the plain explanatory text instead of a real confirm question. */ }

												<div className={ cssModObj.remSkipActions }>{ /* What: Skip Actions Div Element. Why: Even with nothing to confirm, the prompt still needs a way to close. How: This wraps the single Close ButBasCom below. */ }


													<ButBasCom
														kinValStr='ghost'
														sizValStr='sm'

														onClick={ () => setSkiIdeStr( null ) }
													>Close</ButBasCom>{ /* What: Button Base Component. Why: This is the only available action when there's no eligible day to skip to. How: This closes skiIdeStr, returning to the plain row. */ }


												</div>


											</>


										) }


									</div>


								);


							} )() }


						</ColDisCom>


					</React.Fragment>


				) ) }


			</div>


		</section>


	);


}

// #endregion RemSecCom

// #endregion Components



// #region Exports

export { RemSecCom }; // What: Named Export. Why: TabTodCom renders the reminders section atop Today. How: This exports RemSecCom by name; RemCarCom and InlEdiCom stay private to this file.

// #endregion Exports


