


// #region Imports

import cssModObj from './item-card.module.css'; // What: CSS Module Object. Why: The item card, its name row, and its editor slot are styled from their own module. How: This maps each class name in item-card.module.css to its hashed module class.


import { EntEdiCom } from '../../ui/entry-editor.tsx'; // What: Entry Editor Component. Why: Adding or editing a pool item reuses the exact same weight/ease editor the Today tab uses. How: This is rendered once below the card's name row.


import type { IteRcdTyp } from '../../core/data-model.ts'; // What: Item Record Type. Why: The card edits one pool item. How: This types IccProTyp's item, pool, and patches.
import type { PicRcdTyp } from '../../core/data-model.ts'; // What: Picker Record Type. Why: The editor reads the item's picker, which may still be an unsaved draft. How: This types IccProTyp's picDatObj.

// #endregion Imports



/**
 * item-card.tsx = Item Card
 *
 * @summary
 * The card a Pickers tab pool opens below its list to add a new item or edit
 * an existing one, shared by the picker view and the create form: a name row
 * with its own name field above the shared item editor. The card springs in
 * as it mounts and plays its closing animation while its parent marks it
 * closing, handing the end of that animation back so the parent can keep,
 * drop, or tidy up the item.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

type IccProTyp = { cloBoo : boolean, ediKeyStr? : string, iteDatObj : IteRcdTyp, namRef? : ( namInpEle : HTMLInputElement | null ) => void, namValStr : string, onCanEdiFun : () => void, onCloEndFun : () => void, onNamChaFun : ( namValStr : string ) => void, onNamCmtFun? : ( namValStr : string ) => void, onPatIteFun : ( patValObj : Partial< IteRcdTyp > ) => void, onSavEdiFun : () => void, picDatObj : Partial< PicRcdTyp > | null, picIteArr? : IteRcdTyp[] }; // What: Item-Card-Component Props Type. Why: The card shows one item's name and editor, may key its editor and select its name on mount, and hands every edit, save, cancel, and close back to its parent. How: This types IteCarCom's props.

// #region IteCarCom

/**
 * IteCarCom = Item Card Component
 *
 * @summary
 * Draws one item card: a name row whose field shows namValStr and reports
 * each keystroke through onNamChaFun, blurring itself on Enter, above the
 * shared item editor for iteDatObj. When onNamCmtFun is given, leaving the
 * field commits its trimmed name through it, unless the name is blank.
 * While cloBoo is true the card plays its closing animation, and once that
 * animation (not one of its children's) ends, it calls onCloEndFun. The
 * editor's own footer Delete stays hidden, since deleting an item is the
 * pool row's own trash icon and confirm.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.cloBoo      - Closing Boolean: Whether the card is playing its
 *                            closing animation.
 * @param props.ediKeyStr   - Editor Key String: The optional key for the
 *                            editor, so switching straight from one item to
 *                            another mounts a fresh editor.
 * @param props.iteDatObj   - Item Data Object: The item the editor shows.
 * @param props.namRef      - Name Reference: The optional ref callback for
 *                            the name field.
 * @param props.namValStr   - Name Value String: The name field's value.
 * @param props.onCanEdiFun - On Cancel Edit Function: Called by the editor's
 *                            Cancel.
 * @param props.onCloEndFun - On Close End Function: Called once the card's
 *                            closing animation ends.
 * @param props.onNamChaFun - On Name Change Function: Called with the name
 *                            field's value on every change.
 * @param props.onNamCmtFun - On Name Commit Function: The optional handler
 *                            called with the trimmed name when the field
 *                            loses focus with a non-blank name.
 * @param props.onPatIteFun - On Patch Item Function: Called with each change
 *                            the editor makes.
 * @param props.onSavEdiFun - On Save Edit Function: Called by the editor's
 *                            Save.
 * @param props.picDatObj   - Picker Data Object: The item's picker.
 * @param props.picIteArr   - Picker Item Array: The optional pool the editor
 *                            averages ease values over.
 *
 * @returns The item card.
 *
 * @example
 * ```tsx
 * IteCarCom({ cloBoo, iteDatObj, namValStr, ... }) // => <IteCarCom />
 * ```
 *
*/

function IteCarCom ( { cloBoo, ediKeyStr, iteDatObj, namRef, namValStr, onCanEdiFun, onCloEndFun, onNamChaFun, onNamCmtFun, onPatIteFun, onSavEdiFun, picDatObj, picIteArr } : IccProTyp ) : React.JSX.Element {


	return (


		<div
			className={` ${ cssModObj.lisIteDiv }   ${ cloBoo ? cssModObj.lisIteDivClosing : '' } `}

			data-element-name-hook='lisIteDiv'

			onAnimationEnd={ ( aniEveObj ) => { // What: On Animation End Handler. Why: The card's own close animation must finish before its parent clears or keeps the item. How: This hands the end to onCloEndFun once the closing animation is over.


				if ( !cloBoo || aniEveObj.target !== aniEveObj.currentTarget ) return; // What: Not Closing Guard. Why: Only the card's own closing animation should finish the close. How: This bails out unless cloBoo is set and the event came from this element.



				onCloEndFun(); // What: Close End Call. Why: The parent decides what the finished close means for its item. How: This calls onCloEndFun.


			} }
		>{ /* What: List Item Div Element. Why: This is the whole item card slot, playing its own closing animation before its parent tears it down. How: This hands the end of that closing keyframe to onCloEndFun. Its data-element-name-hook is read by the App Features tours, help mode's Pickers catalog, and help mode's Data catalog. */ }


			<div
				className={ cssModObj.lisRowDiv }

				onClick={ ( cliEveObj ) => cliEveObj.stopPropagation() }
			>{ /* What: List Row Div Element. Why: A click inside the name row must not bubble up to whatever the pool wrap itself listens for. How: This stops propagation on every click. */ }


				<span className={ cssModObj.rowMaiSpa }>{ /* What: Row Main Span Element. Why: The name input needs the same wrapper the closed row's name uses. How: This wraps the input below. */ }


					<input
						ref={ namRef }

						className={ cssModObj.rowNamInp }

						data-element-name-hook='rowNamInp'

						autoFocus
						maxLength={ 60 }
						placeholder='Item name'
						type='text'
						value={ namValStr }

						aria-label='Item name'

						onBlur={ onNamCmtFun && ( ( bluEveObj ) => { // What: On Blur Handler. Why: Leaving the name field commits a tidied name, where the parent asks for it. How: This trims the value and hands it to onNamCmtFun when it's non-empty, and is left off when onNamCmtFun isn't given.


							const newNamStr = bluEveObj.target.value.trim(); // What: New Name String. Why: A blur commit should tidy the name, not keep stray whitespace. How: This trims the input's current value.


							if ( newNamStr ) onNamCmtFun( newNamStr ); // What: Rename Item Guard. Why: A blank name must never be committed. How: This hands the tidied name to onNamCmtFun only when newNamStr is non-empty.


						} ) }
						onChange={ ( chaEveObj ) => onNamChaFun( chaEveObj.target.value ) }
						onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Enter' ) keyEveObj.currentTarget.blur(); } }
					/>{ /* What: Row Name Input Element. Why: This is the actual live-typed name field for the item being added or edited. How: This reports every change through onNamChaFun and blurs itself on Enter. Its data-element-name-hook is read by the picker mini-tours, help mode's Pickers catalog, and help mode's Data catalog. */ }


				</span>


			</div>

			<div className={ cssModObj.iteEdiDiv }>{ /* What: Item Edit Div Element. Why: EntEdiCom's own weight/ease/vacation controls need their own slot below the name row. How: This wraps a single EntEdiCom instance. */ }


				<EntEdiCom
					key={ ediKeyStr }

					iteDatObj={ iteDatObj }
					picDatObj={ picDatObj }
					picIteArr={ picIteArr }

					onCanEdiFun={ onCanEdiFun }
					onPatIteFun={ onPatIteFun }
					onSavEdiFun={ onSavEdiFun }
				/>{ /* What: Entry Editor Component. Why: Adding or editing a pool item reuses the exact item editor Today and Data use. How: This is passed the item, its picker and pool, and the cancel, patch, and save handlers. */ }{ /* What: No-Ondelete Design Note. Why: EntEdiCom's own footer Delete button is already hidden by the lisIteDiv rule (its --ent-del-dis : none). How: Deleting an item stays solely the pool row's own trash icon + confirm flow, one delete affordance per item instead of two that could disagree with each other, so no onDelIteFun prop is passed. */ }{ /* What: Editor Key Design Note. Why: Without a key keyed to the item's id, switching straight from one item's editor to another can commit in a single React batch with no intervening null render, so this would stay the SAME EntEdiCom instance across the switch, carrying its own delete-confirm state over to the next item. How: The key above, ediKeyStr, forces React to unmount the old instance and mount a fresh one whenever the id changes, even within one commit. */ }


			</div>


		</div>


	);


}

// #endregion IteCarCom

// #endregion Components



export { IteCarCom }; // What: Named Export. Why: The picker view and the create form both open their add-item and edit-item cards with it. How: This exports IteCarCom by name.


