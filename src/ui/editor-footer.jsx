


// #region Imports

import cssModObj from './editor-footer.module.css'; // What: CSS Module Object. Why: The footer and delete confirm styles live in their own module. How: This maps each class name in editor-footer.module.css to its hashed module class.
import React     from 'react';                      // What: React. Why: EdiFooCom is built directly on React's own APIs. How: This is used directly (React.useState) instead of importing individual named hooks.


import { ButBasCom    } from './button.jsx';       // What: Button Base Component. Why: The footer's own Delete, Cancel, and Save actions need consistently-styled buttons. How: This is rendered throughout EdiFooCom.
import { useEscCanFun } from './escape-cancel.js'; // What: Use Escape Cancel Function. Why: Escape must back out of the footer's own delete confirm the same way every other confirm in the app does. How: This is called once inside EdiFooCom.

// #endregion Imports



/**
 * editor-footer.jsx = Editor Footer
 *
 * @summary
 * The Delete/Cancel/Save row that ends every reminder editor, shared by
 * Today's inline reminder editor and the Data tab's reminder manager so both
 * read and behave the same.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

// #region EdiFooCom

/**
 * EdiFooCom = Editor Footer Component
 *
 * @summary
 * The shared Cancel/Save/Delete footer for a reminder's editor, used by both
 * Today and Data so the two stay exact copies. Delete is confirm-gated inline,
 * morphing just this footer row while the schedule editor above stays intact.
 * Both editors edit a draft, so Cancel and Save simply hand off to the
 * caller, which drops or commits that draft.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.isaNewBoo   - Is-A New Boolean: Whether the task is a
 *                            brand-new, not-yet-kept reminder, which shows no
 *                            Delete button.
 * @param props.onCanTasFun - On Cancel Task Function: Called on Cancel or
 *                            Escape.
 * @param props.onDelTasFun - On Delete Task Function: Called after a confirmed
 *                            Delete.
 * @param props.onDonTasFun - On Done Task Function: Called on Save.
 *
 * @returns The plain footer, or the delete confirm prompt while it is
 * open.
 *
 * @example
 * ```tsx
 * EdiFooCom({ isaNewBoo, onCanTasFun, ... }) // => <EdiFooCom />
 * ```
 *
*/

function EdiFooCom ( { isaNewBoo, onCanTasFun, onDelTasFun, onDonTasFun } ) {


	const [ conOpeBoo, setConOpeBoo ] = React.useState( false ); // What: Confirm Open Boolean And Setter. Why: Delete is confirm-gated, morphing this footer into a Delete/Cancel prompt instead of firing immediately. How: This toggles between the plain footer and the confirm prompt.


	useEscCanFun( true, () => { // What: Use Escape Cancel Function. Why: Escape should cancel the edit, except while the delete confirm is up, where it should just back out of the confirm instead. How: This closes the confirm prompt when open, otherwise calls onCanTasFun.


		if ( conOpeBoo ) setConOpeBoo( false ); // What: Close Confirm Branch. Why: While the delete confirm prompt is up, Escape should just back out of it instead of cancelling the whole edit. How: This closes the confirm by setting conOpeBoo false.

		else onCanTasFun(); // What: Cancel Edits Branch. Why: With no confirm prompt up, Escape should cancel the edit like an explicit Cancel click. How: This calls onCanTasFun.


	} );


	if ( conOpeBoo ) { // What: Confirm Open Branch. Why: The delete confirm prompt replaces the plain footer entirely while it's up. How: This returns the confirm prompt's own markup instead of falling through to the plain footer below.


		return (


			<div
				key='confirm'

				className={` ${ cssModObj.ediFooDiv }   ${ cssModObj.ediFooDivConfirm } `}

				data-element-name-hook='ediFooDiv'
			>{ /* What: Confirm Foot Div Element. Why: This is the delete-confirm prompt's own root, replacing the plain footer row. How: This renders the confirm message and its own Cancel/Delete actions. Its data-element-name-hook is read by help mode's Today catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


				<span className={ cssModObj.delMesSpa }>Delete this reminder?</span>{ /* What: Delete Message Span Element. Why: This asks the user to confirm before anything is actually removed. How: This renders the literal confirmation question. */ }

				<div className={ cssModObj.delActDiv }>{ /* What: Delete Actions Div Element. Why: The confirm's own Cancel/Delete buttons need to sit together. How: This wraps both ButBasCom elements below. */ }


					<ButBasCom
						kinValStr='ghost'
						sizValStr='sm'

						onClick={ () => setConOpeBoo( false ) }
					>Cancel</ButBasCom>{ /* What: Button Base Component. Why: This backs out of the delete confirm without changing anything. How: This closes conOpeBoo, returning to the plain footer. */ }



					<ButBasCom
						data-element-name-hook='delActBut'

						kinValStr='danger'
						sizValStr='sm'

						onClick={ onDelTasFun }
					>Delete</ButBasCom>{ /* What: Button Base Component. Why: This is the actual, confirmed deletion trigger. How: This calls onDelTasFun. Its data-element-name-hook is read by help mode's Data catalog. */ }


				</div>


			</div>


		);


	}



	return (


		<div
			key='foot'

			className={ cssModObj.ediFooDiv }

			data-element-name-hook='ediFooDiv'
		>{ /* What: Plain Foot Div Element. Why: This is the normal, non-confirming footer shown whenever conOpeBoo is false. How: This renders an optional Delete button (suppressed for a brand-new reminder) plus the Cancel/Save actions. Its data-element-name-hook is read by help mode's Today catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


			{ !isaNewBoo && ( // What: Delete Visibility Check. Why: A brand-new, not-yet-kept reminder has nothing to delete yet, only to discard via Cancel. How: This renders the Delete button only for an already-existing reminder.


				<ButBasCom
					data-element-name-hook='delActBut'

					icoNamStr='traEle'
					kinValStr='danger'
					sizValStr='sm'

					onClick={ () => setConOpeBoo( true ) }
				>Delete</ButBasCom> // What: Button Base Component. Why: This opens the delete confirm prompt above instead of deleting immediately. How: This sets conOpeBoo to true. Its data-element-name-hook is read by help mode's Data catalog.


			) }



			<div className={ cssModObj.fooRigDiv }>{ /* What: Foot Right Div Element. Why: Cancel and Save read as a pair, right-aligned opposite Delete. How: This wraps both ButBasCom elements below. */ }


				<ButBasCom
					kinValStr='ghost'
					sizValStr='sm'

					onClick={ onCanTasFun }
				>Cancel</ButBasCom>{ /* What: Button Base Component. Why: This discards the edit. How: This calls onCanTasFun, which drops the caller's draft. */ }



				<ButBasCom
					kinValStr='ghost'
					sizValStr='sm'

					onClick={ onDonTasFun }
				>Save</ButBasCom>{ /* What: Button Base Component. Why: This keeps the edit. How: This calls onDonTasFun, which commits the caller's draft. */ }


			</div>


		</div>


	);


}

// #endregion EdiFooCom

// #endregion Components



// #region Exports

export { EdiFooCom }; // What: Named Export. Why: Today's inline reminder editor and the Data tab's reminder manager both end with it. How: This exports EdiFooCom by name.

// #endregion Exports


