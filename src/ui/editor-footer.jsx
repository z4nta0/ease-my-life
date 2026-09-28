


// #region Imports

import React from 'react'; // What: React. Why: EdiFooCom is built directly on React's own APIs. How: This is used directly (React.useEffect, React.useImperativeHandle, React.useRef, React.useState, React.forwardRef) instead of importing individual named hooks.


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
 * EdiFooCom = Editor Foot Component
 *
 * @summary
 * The shared Cancel/Save/Delete footer for a reminder's editor, used by both
 * Today and Data so the two stay exact copies. Delete is confirm-gated inline,
 * morphing just this footer row while the schedule editor above stays intact.
 * The task is snapshotted on mount so Cancel can restore it, and a brand-new
 * reminder is discarded on any implicit close (unmounting without Save, Cancel
 * or Delete). A caller with its own close control calls the forwarded ref's
 * kepFun() first, so that close counts as a keep.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.isaNewBoo   - Is-A New Boolean: Whether the task is a
 *                            brand-new, not-yet-kept reminder, which an
 *                            implicit close discards and which shows no Delete
 *                            button.
 * @param props.onCanTasFun - On Cancel Task Function: Called with the
 *                            mount-time snapshot on Cancel, Escape, or an
 *                            implicit close of a new reminder.
 * @param props.onDelTasFun - On Delete Task Function: Called after a confirmed
 *                            Delete.
 * @param props.onDonTasFun - On Done Task Function: Called on Save.
 * @param props.tasRcdObj   - Task Record Object: The task being edited,
 *                            snapshotted once on mount.
 * @param extRefObj         - External Reference Object: The forwarded ref,
 *                            given a kepFun method that marks the next close
 *                            as already handled.
 *
 * @returns The plain footer, or the delete confirm prompt while it is
 * open.
 *
 * @example
 * ```tsx
 * EdiFooCom({ isaNewBoo, onCanTasFun, ... }, extRefObj) // => <EdiFooCom />
 * ```
 *
*/

const EdiFooCom = React.forwardRef( function EdiFooCom ( { isaNewBoo, onCanTasFun, onDelTasFun, onDonTasFun, tasRcdObj }, extRefObj ) { // What: Editor Foot Component. Why: Today and Data share one footer so the two stay exact copies. How: This forwards its ref so a caller's own close control can reach kepFun.


	const oriTasRef = React.useRef( tasRcdObj ); // What: Original Task Reference. Why: Cancel needs to restore the task exactly as it was when this footer (and its sibling editor) mounted. How: This snapshots tasRcdObj once, on mount, never updated afterward.
	const expDonRef = React.useRef( false );     // What: Explicit Done Reference. Why: The implicit-close effect below must not ALSO discard a brand-new reminder when Save/Cancel/Delete already handled it explicitly, or when an external close affordance already called kepFun. How: This is set true by every explicit action below, and read (never written) by the implicit-close effect.

	const [ conOpeBoo, setConOpeBoo ] = React.useState( false ); // What: Confirm Open Boolean And Setter. Why: Delete is confirm-gated, morphing this footer into a Delete/Cancel prompt instead of firing immediately. How: This toggles between the plain footer and the confirm prompt below.


	React.useImperativeHandle( extRefObj, () => ( { kepFun : () => { expDonRef.current = true; } } ) ); // What: Imperative Handle Publish. Why: A caller with its OWN close affordance outside this component (a row's own collapse chevron) needs to mark a save as already-handled before it closes, so that affordance reads as "done, keep this" rather than an implicit close. How: This exposes a single kepFun method that just flips expDonRef.


	const canNowFun = () => { // What: Cancel Now Function. Why: An explicit Cancel click needs to both mark itself as handled and actually revert the task. How: This flips expDonRef, then calls onCanTasFun with the original snapshot.


		expDonRef.current = true; // What: Explicit Done Mark. Why: The implicit-close effect must know this close was already handled. How: This flips expDonRef true.

		onCanTasFun( oriTasRef.current ); // What: Cancel Callback Call. Why: Cancel reverts the task to how it was when the editor opened. How: This passes the mount-time snapshot to onCanTasFun.


	};


	const donNowFun = () => { // What: Done Now Function. Why: An explicit Save click needs to both mark itself as handled and keep the live edits. How: This flips expDonRef, then calls onDonTasFun.


		expDonRef.current = true; // What: Explicit Done Mark. Why: The implicit-close effect must know this close was already handled. How: This flips expDonRef true.

		onDonTasFun(); // What: Done Callback Call. Why: Save keeps the live edits as they are. How: This calls onDonTasFun.


	};


	const delNowFun = () => { // What: Delete Now Function. Why: A confirmed Delete needs to both mark itself as handled and actually remove the task. How: This flips expDonRef, then calls onDelTasFun.


		expDonRef.current = true; // What: Explicit Done Mark. Why: The implicit-close effect must know this close was already handled. How: This flips expDonRef true.

		onDelTasFun(); // What: Delete Callback Call. Why: A confirmed Delete removes the task. How: This calls onDelTasFun.


	};


	React.useEffect( () => () => { if ( isaNewBoo && !expDonRef.current ) onCanTasFun( oriTasRef.current ); }, [] ); // What: Implicit Close Effect. Why: A brand-new, not-yet-kept reminder should be discarded if its editor closes ANY other way, not just an explicit Cancel. How: This runs only on unmount, discarding the draft only when it was new and nothing explicit already handled the close.

	useEscCanFun( true, () => { // What: Use Escape Cancel Function. Why: Escape should cancel the live edits, except while the delete confirm is up, where it should just back out of the confirm instead. How: This closes the confirm prompt when open, otherwise calls canNowFun.


		if ( conOpeBoo ) setConOpeBoo( false ); // What: Close Confirm Branch. Why: While the delete confirm prompt is up, Escape should just back out of it instead of cancelling the whole edit. How: This closes the confirm by setting conOpeBoo false.

		else canNowFun(); // What: Cancel Edits Branch. Why: With no confirm prompt up, Escape should cancel the live edits like an explicit Cancel click. How: This calls canNowFun.


	} );


	if ( conOpeBoo ) { // What: Confirm Open Branch. Why: The delete confirm prompt replaces the plain footer entirely while it's up. How: This returns the confirm prompt's own markup instead of falling through to the plain footer below.


		return (


			<div
				key='confirm'

				className='rem-inline-foot rem-foot-confirm'

				data-element-name-hook='ediFooDiv'
			>{ /* What: Confirm Foot Div Element. Why: This is the delete-confirm prompt's own root, replacing the plain footer row. How: This renders the confirm message and its own Cancel/Delete actions. Its data-element-name-hook is read by help mode's Today catalog. */ }


				<span className='rem-del-msg'>Delete this reminder?</span>{ /* What: Delete Message Span Element. Why: This asks the user to confirm before anything is actually removed. How: This renders the literal confirmation question. */ }

				<div className='rem-del-actions'>{ /* What: Delete Actions Div Element. Why: The confirm's own Cancel/Delete buttons need to sit together. How: This wraps both ButBasCom elements below. */ }


					<ButBasCom
						kinValStr='ghost'
						sizValStr='sm'

						onClick={ () => setConOpeBoo( false ) }
					>Cancel</ButBasCom>{ /* What: Button Base Component. Why: This backs out of the delete confirm without changing anything. How: This closes conOpeBoo, returning to the plain footer. */ }



					<ButBasCom
						kinValStr='danger'
						sizValStr='sm'

						onClick={ delNowFun }
					>Delete</ButBasCom>{ /* What: Button Base Component. Why: This is the actual, confirmed deletion trigger. How: This calls delNowFun, which marks itself handled and invokes onDelTasFun. */ }


				</div>


			</div>


		);


	}



	return (


		<div
			key='foot'

			className='rem-inline-foot rd-edit-foot'

			data-element-name-hook='ediFooDiv'
		>{ /* What: Plain Foot Div Element. Why: This is the normal, non-confirming footer shown whenever conOpeBoo is false. How: This renders an optional Delete button (suppressed for a brand-new reminder) plus the Cancel/Save actions. Its data-element-name-hook is read by help mode's Today catalog. */ }


			{ !isaNewBoo && ( // What: Delete Visibility Check. Why: A brand-new, not-yet-kept reminder has nothing to delete yet, only to discard via Cancel/implicit-close. How: This renders the Delete button only for an already-existing reminder.


				<ButBasCom
					icoNamStr='traEle'
					kinValStr='danger'
					sizValStr='sm'

					onClick={ () => setConOpeBoo( true ) }
				>Delete</ButBasCom> // What: Button Base Component. Why: This opens the delete confirm prompt above instead of deleting immediately. How: This sets conOpeBoo to true.


			) }



			<div className='rem-foot-right'>{ /* What: Foot Right Div Element. Why: Cancel and Save read as a pair, right-aligned opposite Delete. How: This wraps both ButBasCom elements below. */ }


				<ButBasCom
					kinValStr='ghost'
					sizValStr='sm'

					onClick={ canNowFun }
				>Cancel</ButBasCom>{ /* What: Button Base Component. Why: This discards the live edits and reverts to the original snapshot. How: This calls canNowFun. */ }



				<ButBasCom
					kinValStr='ghost'
					sizValStr='sm'

					onClick={ donNowFun }
				>Save</ButBasCom>{ /* What: Button Base Component. Why: This keeps the live edits as-is. How: This calls donNowFun. */ }


			</div>


		</div>


	);


} );

// #endregion EdiFooCom

// #endregion Components



// #region Exports

export { EdiFooCom }; // What: Named Export. Why: Today's inline reminder editor and the Data tab's reminder manager both end with it. How: This exports EdiFooCom by name.

// #endregion Exports


