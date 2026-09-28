


// #region Imports

import React from 'react'; // What: React. Why: Every component in this file is built directly on React's own APIs. How: This is used directly (React.useEffect, React.useRef, React.useState) instead of importing individual named hooks.


import { ButBasCom    } from '../../ui/button.jsx';                 // What: Button Base Component. Why: ConEdiCom's own Save/Cancel/Delete footer and ConManCom's add button need consistently-styled buttons. How: This is rendered in both components below.
import { CodConCom    } from '../../ui/conditional-controls.jsx';   // What: Conditional Control Component. Why: ConEdiCom reuses the exact same "type + settings" editor the Pickers create-flow uses, so both stay in sync. How: This is rendered directly inside ConEdiCom below.
import { ColDisCom    } from '../../ui/collapse.jsx';               // What: Collapse Disclosure Component. Why: Each conditional row opens and closes with the same collapse-height animation as every other disclosure in the app. How: This wraps each row's editor body, driven by that row's open state.
import { conDraFun    } from '../../ui/conditional-controls.jsx';   // What: Conditional Draft Function. Why: A brand-new conditional started from ConManCom needs the same sensible starting draft the Pickers create-flow uses. How: This is called once when the "Add a conditional" button is clicked.
import { IcoSvgCom    } from '../../ui/icon.jsx';                   // What: Icon Svg Component. Why: The rows and buttons in this file need recognizable glyphs. How: This is rendered throughout both components below.
import { InfTipCom    } from '../../ui/info-tip.jsx';               // What: Info Tip Component. Why: A disabled add button or a truncated type label still needs to explain itself on demand. How: This wraps those controls in ConManCom.
import { norConFun    } from '../../core/pickers.js';               // What: Normalize Conditional Function. Why: A newly-typed conditional name needs the same tidy-casing rule pickers themselves already use. How: This is called on ConManCom's own in-progress draft name.
import { ONB_CHE_OBJ  } from '../../state/onboarding-checklist.js'; // What: Onboarding Checklist Object. Why: Adding a conditional must stay disabled while the Welcome Tour's own checklist is still in progress. How: This is checked via tutProFun in ConManCom.
import { redMotFun    } from '../../utils/motion.js';               // What: Reduce Motion Function. Why: A user who prefers reduced motion shouldn't see this section's own row open, close, save, or delete animations. How: This is checked before each of those animations in ConManCom.
import { SED_NAM_OBJ  } from '../../state/seed.js';                 // What: Seed Namespace Object. Why: Each conditional mode's own label comes from this shared catalog. How: This is read (MOD_DEF_OBJ) in ConManCom for each row's type label.
import { sorEntFun    } from './list-sorting.js';                   // What: Sort Entries Function. Why: The conditional list shares the app's own sort-key vocabulary. How: This is called once per comparison inside ConManCom's own sort.
import { SorSelCom    } from './sort-select.jsx';                   // What: Sort Select Component. Why: The conditional list needs the same sort control every other list uses. How: This is rendered in ConManCom's header with CIS_OPT_ARR as its options.
import { useEscCanFun } from '../../ui/escape-cancel.js';           // What: Use Escape Cancel Function. Why: ConEdiCom's Escape key must cancel the current edit (or back out of a delete confirm) the same way every other editor in the app does. How: This is called once inside ConEdiCom.

// #endregion Imports



/**
 * conditionals-manager.jsx = Conditionals Manager
 *
 * @summary
 * The Data tab's own Conditionals section: ConManCom lists every conditional
 * as a collapsible, sortable row (CIS_OPT_ARR holds its sort options), and
 * ConEdiCom is the editor body rendered inside an open row, reusing the same
 * CodConCom editor the Pickers create-flow uses.
 *
 * Sections:
 *  - Constants
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

// #region CIS_OPT_ARR

/**
 * CIS_OPT_ARR = Conditional-Item-Sort Options Array
 *
 * @summary
 * Sort options for ConManCom's own conditional list, extrapolated from
 * SEC_SOR_ARR's own vocabulary but adapted to what a single conditional
 * actually has. Odds (not "Weight", despite the picker-item-sort analog
 * being called that) because a conditional's own `weight` field is
 * vestigial; its real weighted/dynamic trigger-likelihood knob is
 * `oddsPct`, which its own editor calls Odds (see conOddFun in
 * ConManCom and conditionals.js' own truOddFun). Boost (dynamic only)
 * and Range (the ease band's soonest/shortest end) are each meaningful
 * for only some modes; on every other row they are irrelevant rather
 * than genuinely missing, so sorEntFun always sorts them to
 * the bottom regardless of direction instead of flipping to the top on
 * a "High to Low" sort the way a truly missing value would.
 *
 * Every entry below shares this exact shape, passed as SorSelCom's own
 * options prop from ConManCom's own sort bar; none of the 12 entries
 * repeat these same fields' own boilerplate comments (see the
 * "Repeated-shape object literals" comment exception in CLAUDE.md).
 * Each entry's own trailing comment instead just names which specific
 * sort option it represents.
 *
 * - `keyStr` (String): Key String is the sort key ConManCom compares
 *   against its own persisted iteSorStr and writes back on selection;
 *   SorSelCom reads this against its own value prop and passes it to
 *   onChange, and sorEntFun reads its field/direction halves to order
 *   the list.
 *
 * - `labStr` (String): Label String is the option's own visible menu
 *   text, rendered by SorSelCom as the option's own text content.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const CIS_OPT_ARR = [ // What: Conditional-Item-Sort Options Array. Why: ConManCom's own conditional list needs one sort entry per key a conditional actually supports. How: This is passed as SorSelCom's own options prop in ConManCom's own sort bar.


	{ keyStr : 'name-asc',    labStr : 'Name (A–Z)'          }, // What: Name Ascending Option. Why: This is the conditional list's own default sort. How: This orders conditionals by name, A to Z.
	{ keyStr : 'name-desc',   labStr : 'Name (Z–A)'          }, // What: Name Descending Option. Why: This is the reverse of the default sort. How: This orders conditionals by name, Z to A.
	{ keyStr : 'type-asc',    labStr : 'Type (A–Z)'          }, // What: Type Ascending Option. Why: Type is each conditional's own mode label. How: This orders conditionals by that label, A to Z.
	{ keyStr : 'type-desc',   labStr : 'Type (Z–A)'          }, // What: Type Descending Option. Why: This is the reverse of the type sort. How: This orders conditionals by mode label, Z to A.
	{ keyStr : 'odds-asc',    labStr : 'Odds (Low to High)'  }, // What: Odds Ascending Option. Why: Weighted and dynamic conditionals expose their real trigger likelihood as Odds. How: This orders them from lowest odds to highest, other modes last.
	{ keyStr : 'odds-desc',   labStr : 'Odds (High to Low)'  }, // What: Odds Descending Option. Why: This is the reverse of the odds sort. How: This orders them from highest odds to lowest, other modes still last.
	{ keyStr : 'boost-asc',   labStr : 'Boost (Low to High)' }, // What: Boost Ascending Option. Why: Only a dynamic conditional has a meaningful boost value. How: This orders dynamic conditionals from lowest boost to highest, other modes last.
	{ keyStr : 'boost-desc',  labStr : 'Boost (High to Low)' }, // What: Boost Descending Option. Why: This is the reverse of the boost sort. How: This orders dynamic conditionals from highest boost to lowest, other modes still last.
	{ keyStr : 'range-asc',   labStr : 'Range (Low to High)' }, // What: Range Ascending Option. Why: Only an ease-up or ease-down conditional has a meaningful soonest/shortest band. How: This orders ease conditionals from shortest range to longest, other modes last.
	{ keyStr : 'range-desc',  labStr : 'Range (High to Low)' }, // What: Range Descending Option. Why: This is the reverse of the range sort. How: This orders ease conditionals from longest range to shortest, other modes still last.
	{ keyStr : 'active-asc',  labStr : 'Active to Inactive'  }, // What: Active Ascending Option. Why: Every conditional has its own active/inactive state. How: This lists active conditionals before inactive ones.
	{ keyStr : 'active-desc', labStr : 'Inactive to Active'  }  // What: Active Descending Option. Why: This is the reverse of the active sort. How: This lists inactive conditionals before active ones.


];

// #endregion CIS_OPT_ARR

// #endregion Constants



// #region Components

// #region ConEdiCom

/**
 * ConEdiCom = Conditional Editor Component
 *
 * @summary
 * The editor body for one conditional, rendered inside ConManCom's own
 * collapsible row. The draft itself is owned by ConManCom (so the row
 * can host the inline name input the same way a picker item's own row
 * does); this component just renders CodConCom against it and
 * supplies Save/Cancel/Delete. Save normalizes the name (Title Case
 * tidy) and is blocked on a collision, mirroring the Pickers
 * create-flow's own guard. Cancel discards a brand-new conditional or
 * simply closes an existing one.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actStoObj    - Action Store Object: {@link useAppStaFun}
 * @param props.conDraObj    - Conditional Draft Object: The in-progress, not-
 *                             yet-committed field values for this conditional.
 * @param props.curConObj    - Current Conditional Object: The conditional
 *                             record this row belongs to.
 * @param props.isaNewBoo    - Is-A New Boolean: Whether this conditional is a
 *                             brand-new, not-yet-saved draft.
 * @param props.namErrStr    - Name Error String: The current validation
 *                             message for the draft's own name, or null when
 *                             it's valid.
 * @param props.onCloEdiFun  - On Close Editor Function: Closes this row
 *                             without discarding an existing conditional's
 *                             edits.
 * @param props.onDelConFun  - On Delete Conditional Function: Deletes this
 *                             existing conditional.
 * @param props.onDisDraFun  - On Discard Draft Function: Discards a brand-new
 *                             conditional entirely.
 * @param props.onSavNewFun  - On Save New Function: Commits a brand-new
 *                             conditional, when set; undefined for an existing
 *                             one.
 * @param props.setConDraObj - Set Conditional Draft Object: Replaces the in-
 *                             progress draft object.
 * @param props.tidNamStr    - Tidied Name String: The draft's own name,
 *                             already normalized to the app's tidy-casing
 *                             rule.
 *
 * @returns This conditional's own editor body: any name error, the
 * shared CodConCom fields, and the footer.
 *
 * @example
 * ```tsx
 * ConEdiCom({ actStoObj, conDraObj, curConObj, ... }) // => <ConEdiCom />
 * ```
 *
*/

function ConEdiCom ( { actStoObj, conDraObj, curConObj, isaNewBoo, namErrStr, onCloEdiFun, onDelConFun, onDisDraFun, onSavNewFun, setConDraObj, tidNamStr } ) {


	const [ conDelBoo, setConDelBoo ] = React.useState( false ); // What: Confirm Delete Boolean And Setter. Why: Deleting an existing conditional needs an inline confirm step before it actually happens. How: This is flipped true by the Delete button and read below to swap in the confirm row.


	const savConFun = () => { // What: Save Conditional Function. Why: Save must normalize the name and route through whichever commit path applies (a brand-new conditional vs. an existing one). How: This blocks on a name error, delegates to onSavNewFun for a brand-new conditional, otherwise updates the existing one directly.


		if ( namErrStr ) return; // What: Name Error Guard. Why: An invalid or colliding name must never be committed. How: This bails out of Save entirely while namErrStr holds a message.



		if ( onSavNewFun ) { onSavNewFun(); return; } // What: New Save Guard. Why: A brand-new conditional's own commit (including its animated collapse+add) is owned by ConManCom, not this component. How: This delegates to onSavNewFun and returns early when it's set.



		actStoObj.updConFun( curConObj.id, { ...conDraObj, name : tidNamStr } ); // What: Update Conditional Call. Why: An existing conditional's edits only take effect once actually committed. How: This writes every draft field, with name replaced by its tidied form.

		onCloEdiFun(); // What: Close Call. Why: A successful save should also close this row. How: This calls onCloEdiFun after the update above.


	};


	const canConFun = () => { // What: Cancel Controls Function. Why: Cancelling a brand-new conditional must discard it entirely, while cancelling an existing one just closes without saving. How: This calls onDisDraFun when isaNewBoo, otherwise onCloEdiFun.


		if ( isaNewBoo ) onDisDraFun(); // What: Discard Branch. Why: A brand-new, not-yet-saved conditional has nothing worth keeping, so cancelling it should discard it entirely. How: This calls onDisDraFun.

		else onCloEdiFun(); // What: Close Branch. Why: An existing conditional's edits should simply be dropped, leaving the saved version untouched. How: This calls onCloEdiFun.


	};


	useEscCanFun( true, () => { // What: Use Escape Cancel Function. Why: Escape should back out of the delete confirm if it's showing, otherwise cancel the edit itself. How: This is always active while this row is mounted.


		if ( conDelBoo ) setConDelBoo( false ); // What: Close Confirm Branch. Why: While the delete confirm prompt is showing, Escape should just back out of it instead of cancelling the whole edit. How: This closes the confirm by setting conDelBoo false.

		else canConFun(); // What: Cancel Edit Branch. Why: With no confirm prompt up, Escape should cancel the edit like canConFun's own explicit Cancel button. How: This calls canConFun.


	} );



	return (


		<div
			className='rd-edit rd-edit--cnd'

			data-element-name-hook='conEdiDiv'
		>{ /* What: Editor Div Element. Why: This is ConEdiCom's own root element. How: This wraps the rd-ctl-body div below. Its data-element-name-hook is read by help mode's Data catalog. */ }


			<div className='rd-ctl-body'>{ /* What: Controls Body Div Element. Why: The name error, the shared Controls fields, and the footer all belong in one grouped body. How: This wraps the 3 pieces below. */ }


				{ namErrStr && <p className='np-error rd-cnd-name-err'>{ namErrStr }</p> }{ /* What: Name Error Check. Why: An invalid/colliding name needs an inline warning right above the fields. How: This renders the message only while namErrStr holds one. */ }



				<CodConCom
					conDraObj={ conDraObj }
					hidNamBoo
					layVarStr='inline'

					onChange={ setConDraObj }
				/>{ /* What: Conditional Control Component. Why: Every non-name field (type + settings) is edited through the exact same control the Pickers create-flow uses. How: This is passed the current draft, committing every change back via setConDraObj. */ }



				<div
					className='rd-ctl-group rd-ctl-group--foot'

					data-element-name-hook='conFooDiv'
				>{ /* What: Footer Group Div Element. Why: Delete/Cancel/Save (or the delete confirm) needs its own bottom group. How: This renders whichever of the 2 footer states below matches conDelBoo. Its data-element-name-hook is read by help mode's Data catalog. */ }


					{ conDelBoo ? ( // What: Confirm Delete Check. Why: Delete morphs the footer into an inline confirm before actually deleting. How: This renders the confirm row while conDelBoo is true.


						<div
							key='confirm'

							className='rd-ctl-confirm'
						>{ /* What: Delete Confirm Div Element. Why: The confirm message and its own Cancel/Delete buttons need their own grouped row. How: This wraps the confirm message and the rem-del-actions row below. */ }


							<div className='confirm-msg'>Delete the &ldquo;{ curConObj.name }&rdquo; conditional? Pickers using it will be detached. This can&rsquo;t be undone.</div>{ /* What: Confirm Msg Div Element. Why: A destructive action needs an explicit, specific warning before it happens. How: This names the conditional and states that any picker using it will be detached. */ }

							<div className='rem-del-actions'>{ /* What: Delete Actions Div Element. Why: The confirm's own Cancel and Delete buttons need their own row. How: This wraps both ButBasCom instances below. */ }


								<ButBasCom
									kinValStr='ghost'
									sizValStr='sm'

									onClick={ () => setConDelBoo( false ) }
								>Cancel</ButBasCom>{ /* What: Button Base Component. Why: Backing out of the confirm should not delete anything. How: This just closes the confirm row. */ }



								<ButBasCom
									data-element-name-hook='delActBut'

									kinValStr='danger'
									sizValStr='sm'

									onClick={ () => onDelConFun() }
								>Delete</ButBasCom>{ /* What: Button Base Component. Why: This is the actual, final destructive action. How: This calls onDelConFun on click. Its data-element-name-hook is read by help mode's Data catalog. */ }


							</div>


						</div>


					) : ( // What: Plain Foot Branch. Why: With no delete confirmation pending, the normal Delete/Cancel/Save footer belongs here instead. How: This renders the else branch, taken while conDelBoo is false.


						<div
							key='foot'

							className='rd-ctl-foot-row'
						>{ /* What: Foot Row Div Element. Why: Delete (left, existing conditionals only) and Cancel/Save (right) both belong in the same footer row. How: This conditionally renders the Delete ButBasCom, then the rem-foot-right div below. */ }


							{ !isaNewBoo && ( // What: Existing Conditional Check. Why: A brand-new conditional has nothing saved to delete. How: This renders the Delete button only while isaNewBoo is false.


								<ButBasCom
									data-element-name-hook='delActBut'

									icoNamStr='traEle'
									kinValStr='danger'
									sizValStr='sm'

									onClick={ () => setConDelBoo( true ) }
								>Delete</ButBasCom> // What: Button Base Component. Why: A brand-new, not-yet-saved conditional has nothing to delete yet. How: This opens the inline delete confirm, rendered only while isaNewBoo is false. Its data-element-name-hook is read by help mode's Data catalog.


							) }



							<div className='rem-foot-right'>{ /* What: Foot Right Div Element. Why: Cancel and Save anchor to the footer's own right edge. How: This wraps both ButBasCom instances below. */ }


								<ButBasCom
									kinValStr='ghost'
									sizValStr='sm'

									onClick={ canConFun }
								>Cancel</ButBasCom>{ /* What: Button Base Component. Why: This discards a brand-new conditional or closes an existing one's edits. How: This calls canConFun on click. */ }



								<ButBasCom
									disabled={ !!namErrStr }
									kinValStr='ghost'
									sizValStr='sm'

									onClick={ savConFun }
								>Save</ButBasCom>{ /* What: Button Base Component. Why: This commits the draft's own fields. How: This calls savConFun on click, disabled while namErrStr holds a message. */ }


							</div>


						</div>


					) }


				</div>


			</div>


		</div>


	);


}

// #endregion ConEdiCom



// #region ConManCom

/**
 * ConManCom = Conditionals Manager Component
 *
 * @summary
 * Lists every conditional as a collapsible card whose body is ConEdiCom.
 * Edits are live (updConFun). A brand-new conditional is held
 * LOCALLY (not written to the store) until Save, so a reload or
 * tab-switch mid-create discards it, mirroring the "nothing committed
 * until Save" contract TabDatCom's own new-picker draft flow uses (that
 * one is backed by a real hidden picker instead, since PicConCom's own
 * fields already write straight to the store). Delete detaches the
 * conditional from any pickers that reference it (the store itself
 * handles that cleanup).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actStoObj - Action Store Object: {@link useAppStaFun}
 * @param props.staAppObj - State App Object: {@link useAppStaFun}
 *
 * @returns The Conditionals section: its own header, the "Add a
 * conditional" control, and every conditional's own collapsible row.
 *
 * @example
 * ```tsx
 * ConManCom({ actStoObj, staAppObj }) // => <ConManCom />
 * ```
 *
*/

function ConManCom ( { actStoObj, staAppObj } ) {


	// #region List Data

	const conIteArr = staAppObj.conditionals || []; // What: Conditional Item Array. Why: Every render needs the current list of conditionals to display. How: This reads staAppObj.conditionals, falling back to an empty array.
	const allPicArr = staAppObj.pickers || [];      // What: All Picker Array. Why: The "N pickers" usage count per conditional needs every picker to check against. How: This reads staAppObj.pickers, falling back to an empty array.

	// #endregion List Data



	// #region Editor State

	const [ opeIdeStr, setOpeIdeStr ] = React.useState( null ); // What: Open Identifier String And Setter. Why: Only one conditional's own row can be expanded for editing at a time. How: This holds whichever conditional's own id is currently open, or null.
	const [ conDraObj, setConDraObj ] = React.useState( null ); // What: Conditional Draft Object And Setter. Why: The open row's own in-progress, not-yet-committed field values need somewhere to live. How: This is populated by opeEdiFun and cleared by cloEdiFun.
	const [ penConObj, setPenConObj ] = React.useState( null ); // What: Pending Conditional Object And Setter. Why: A brand-new conditional is held locally, not written to the store, until Save. How: This holds the brand-new conditional's own object while it's still unsaved.
	const [ cloIdeStr, setCloIdeStr ] = React.useState( null ); // What: Closing Identifier String And Setter. Why: A deleted conditional's own row must finish its collapse-shut animation before actually being removed. How: This holds whichever conditional's own id is currently mid-delete-animation.

	// #endregion Editor State



	// #region Row Values And Sorting

	const useCouFun = ( conIdeStr ) => allPicArr.filter( ( picCurObj ) => picCurObj.conditionalId === conIdeStr && !picCurObj.hidden ).length; // What: Use Count Function. Why: Every conditional's own row needs to show how many (non-hidden) pickers currently use it. How: This counts every picker whose own conditionalId matches conIdeStr.


	const colMapObj = ( staAppObj.ui && staAppObj.ui.controlsCollapsed ) || {}; // What: Collapsed Map Object. Why: The section's own collapse state is persisted the same way every picker card's own Controls/Items disclosures are. How: This reads staAppObj.ui.controlsCollapsed, falling back to an empty object.
	const secOpeBoo = colMapObj[ '__conditionals' ] === false;                  // What: Section Open Boolean. Why: This section defaults COLLAPSED (absent means collapsed), unlike its own nested disclosures. How: This is true only when the persisted entry is explicitly false.


	const conRanFun = ( conCurObj ) => ( conCurObj.mode === 'ease-up' || conCurObj.mode === 'ease-down' ) // What: Conditional Range Function. Why: Ease-mode conditionals expose a sortable Range value, the same soonest/latest-band math their own editor uses, collapsed to its near end. How: This computes it only for ease-up/ease-down, null otherwise.
		? Math.max( 1, Math.round( ( conCurObj.threshold ?? 100 ) / ( conCurObj.easeMax ?? 14 ) ) ) // What: Ease Range Branch. Why: An ease-mode conditional's range is roughly how many days it takes to fully charge. How: This divides threshold by easeMax, never below 1.
		: null;                                                                                     // What: No Range Branch. Why: Every other mode has no range to sort by. How: This returns null.


	const conOddFun = ( conCurObj ) => ( conCurObj.mode === 'weighted' || conCurObj.mode === 'dynamic' ) ? ( conCurObj.oddsPct ?? 50 ) : null; // What: Conditional Odds Function. Why: Weighted/dynamic conditionals expose their real trigger-likelihood as Odds, not their own vestigial weight field. How: This reads conCurObj.oddsPct only for those 2 modes, null otherwise.
	const conBooFun = ( conCurObj ) => ( conCurObj.mode === 'dynamic' ) ? ( conCurObj.value ?? 0 ) : null;                                     // What: Conditional Boost Function. Why: Only a dynamic conditional has a meaningful boost value, the same value field ease modes reuse for charge. How: This reads conCurObj.value only for 'dynamic', null otherwise.

	const iteSorStr = staAppObj.ui?.dataSort?.conditionals || 'name-asc'; // What: Item Sort String. Why: This section's own list needs its own persisted sort choice. How: This reads staAppObj.ui.dataSort.conditionals, falling back to 'name-asc'.


	const sorConArr = [ ...conIteArr ].sort( ( conOneObj, conTwoObj ) => sorEntFun( // What: Sorted Conditional Array. Why: The rendered list needs to actually be in iteSorStr's own order. How: This builds a matching sort-entry shape for both sides and delegates the comparison to sorEntFun.

		{ // What: First Sort Entry Object. Why: sorEntFun compares 2 entries of one shared sortable shape. How: This maps the left-hand conditional onto that shape.


			boost    : conBooFun( conOneObj ),                                                      // What: Boost. Why: The Boost sort needs a dynamic conditional's boost value. How: This calls conBooFun.
			count    : null,                                                                        // What: Count. Why: Conditionals have no item count to sort by. How: This is always null.
			group    : null,                                                                        // What: Group. Why: Conditionals have no group to sort by. How: This is always null.
			isActive : conOneObj.active !== false,                                                  // What: Is Active. Why: The Active sort needs each conditional's on/off state. How: This treats anything but an explicit false as active.
			name     : conOneObj.name,                                                              // What: Name. Why: The Name sort needs each conditional's name. How: This reads the name directly.
			odds     : conOddFun( conOneObj ),                                                      // What: Odds. Why: The Odds sort needs a weighted/dynamic conditional's odds. How: This calls conOddFun.
			range    : conRanFun( conOneObj ),                                                      // What: Range. Why: The Range sort needs an ease-mode conditional's range. How: This calls conRanFun.
			type     : ( SED_NAM_OBJ.MOD_DEF_OBJ[ conOneObj.mode ] || {} ).labStr || conOneObj.mode // What: Type. Why: The Type sort needs each conditional's mode label. How: This reads the mode's label, falling back to its raw id.


		},

		{ // What: Second Sort Entry Object. Why: sorEntFun compares 2 entries of one shared sortable shape. How: This maps the right-hand conditional onto that shape.


			boost    : conBooFun( conTwoObj ),                                                      // What: Boost. Why: The Boost sort needs a dynamic conditional's boost value. How: This calls conBooFun.
			count    : null,                                                                        // What: Count. Why: Conditionals have no item count to sort by. How: This is always null.
			group    : null,                                                                        // What: Group. Why: Conditionals have no group to sort by. How: This is always null.
			isActive : conTwoObj.active !== false,                                                  // What: Is Active. Why: The Active sort needs each conditional's on/off state. How: This treats anything but an explicit false as active.
			name     : conTwoObj.name,                                                              // What: Name. Why: The Name sort needs each conditional's name. How: This reads the name directly.
			odds     : conOddFun( conTwoObj ),                                                      // What: Odds. Why: The Odds sort needs a weighted/dynamic conditional's odds. How: This calls conOddFun.
			range    : conRanFun( conTwoObj ),                                                      // What: Range. Why: The Range sort needs an ease-mode conditional's range. How: This calls conRanFun.
			type     : ( SED_NAM_OBJ.MOD_DEF_OBJ[ conTwoObj.mode ] || {} ).labStr || conTwoObj.mode // What: Type. Why: The Type sort needs each conditional's mode label. How: This reads the mode's label, falling back to its raw id.


		},

		iteSorStr // What: Item Sort String Argument. Why: sorEntFun needs to know which sort is active. How: This passes iteSorStr straight through.


	) );

	// #endregion Row Values And Sorting



	// #region Row Open And Close

	const opeEdiFun = ( conCurObj ) => { // What: Open Editor Function. Why: Opening an existing conditional's row needs a fresh draft copy and no pending flag. How: This seeds conDraObj from conCurObj and opens its own row.


		setPenConObj( null );             // What: Pending Clear Call. Why: Opening an existing conditional abandons any pending new one. How: This resets penConObj to null.
		setConDraObj( { ...conCurObj } ); // What: Draft Seed Call. Why: The editor works on a copy so edits stay uncommitted until kept. How: This sets conDraObj to a shallow copy of conCurObj.
		setOpeIdeStr( conCurObj.id );     // What: Open Set Call. Why: The chosen row must expand. How: This sets opeIdeStr to conCurObj.id.


	};


	const cloEdiFun = () => { // What: Close Editor Function. Why: Closing a row (without any special animation) just clears every piece of open-row state. How: This clears penConObj, conDraObj, and opeIdeStr together.


		setPenConObj( null ); // What: Pending Clear Call. Why: A closed row has no pending new conditional. How: This resets penConObj to null.
		setConDraObj( null ); // What: Draft Clear Call. Why: A closed row has no editor draft. How: This resets conDraObj to null.
		setOpeIdeStr( null ); // What: Open Clear Call. Why: No row stays open. How: This resets opeIdeStr to null.


	};


	// #region cloAniFun

	/**
	 * cloAniFun = Close Animated Function
	 *
	 * @summary
	 * Cancels a brand-new conditional so its row visibly collapses before the
	 * draft is dropped: it closes the row at once, then clears the draft and
	 * pending state 300ms later, once the collapse animation has finished. Under
	 * reduced motion it clears everything immediately.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * cloAniFun() // => void
	 * ```
	 *
	*/

	const cloAniFun = () => { // What: Close Animated Function. Why: Cancelling a brand-new conditional should collapse its row first (so it visibly animates shut) before actually dropping it, rather than unmounting it instantly. How: This closes the row immediately when motion is reduced, otherwise defers the state drop by 300ms.


		if ( redMotFun() ) { // What: Reduced Motion Guard. Why: A user who prefers reduced motion should see this happen instantly, not mid-animation. How: This clears every piece of state synchronously and returns early.


			setOpeIdeStr( null ); // What: Open Clear Call. Why: The row closes at once. How: This resets opeIdeStr to null.
			setConDraObj( null ); // What: Draft Clear Call. Why: The draft is dropped at once too. How: This resets conDraObj to null.
			setPenConObj( null ); // What: Pending Clear Call. Why: The pending new conditional is dropped at once too. How: This resets penConObj to null.



			return; // What: Early Return. Why: Nothing is left to animate. How: This skips the deferred drop below.


		}



		setOpeIdeStr( null ); // What: Row Collapse Call. Why: The editor itself must stay mounted (still holding conDraObj/penConObj) so its own ColDisCom can actually animate shut. How: This only closes the row's own open flag, not the draft/pending state yet.

		setTimeout( () => { // What: Deferred Drop Call. Why: The draft/pending state must survive until the collapse animation actually finishes. How: This clears both 300ms later, matching the collapse animation's own duration.


			setConDraObj( null ); // What: Draft Clear Call. Why: The draft only goes away once the collapse has finished. How: This resets conDraObj to null.
			setPenConObj( null ); // What: Pending Clear Call. Why: The pending new conditional goes away at the same moment. How: This resets penConObj to null.


		}, 300 ); // What: Collapse Animation Delay. Why: The draft must outlive the row's own collapse. How: This 300ms matches the collapse animation's duration.


	};

	// #endregion cloAniFun


	// #region delAniFun

	/**
	 * delAniFun = Delete Animated Function
	 *
	 * @summary
	 * Deletes an existing conditional after its row collapses: it marks the row
	 * as closing so the editor stays mounted through its own collapse, then
	 * removes the conditional from the store and clears every piece of open-row
	 * state 300ms later. Under reduced motion it removes it immediately.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param conIdeStr - Conditional Identifier String: The id of the conditional
	 *                    to delete.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * delAniFun( conIdeStr ) // => void
	 * ```
	 *
	*/

	const delAniFun = ( conIdeStr ) => { // What: Delete Animated Function. Why: Deleting an existing conditional should collapse its card shut before actually removing it from the store. How: This runs the removal immediately when motion is reduced, otherwise defers it by 300ms while the row plays its own collapse.


		const delFinFun = () => { // What: Delete Finish Function. Why: The actual removal and every piece of open/closing state need to clear together, whenever this finally runs. How: This is called either immediately or after the deferred timeout below.


			actStoObj.delConFun( conIdeStr ); // What: Remove Conditional Call. Why: This is the actual store removal. How: This calls delConFun with conIdeStr.

			setCloIdeStr( null ); // What: Closing Clear Call. Why: The closing animation is over. How: This resets cloIdeStr to null.
			setConDraObj( null ); // What: Draft Clear Call. Why: The removed conditional's draft is no longer needed. How: This resets conDraObj to null.
			setOpeIdeStr( null ); // What: Open Clear Call. Why: No row stays open after the removal. How: This resets opeIdeStr to null.


		};



		if ( redMotFun() ) { delFinFun(); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion should see this happen instantly. How: This calls delFinFun synchronously and returns early.



		setCloIdeStr( conIdeStr ); // What: Closing Id Set. Why: The editor must stay mounted (via closingId) through its own collapse animation instead of unmounting immediately. How: This flags conIdeStr as the row currently mid-delete-animation.

		setOpeIdeStr( null ); // What: Row Collapse Call. Why: Collapsing the row's own open state is what actually triggers its ColDisCom to animate shut. How: This clears opeIdeStr.

		setTimeout( delFinFun, 300 ); // What: Deferred Removal Call. Why: The actual store removal must wait until the collapse animation finishes. How: This calls delFinFun 300ms later, matching the collapse animation's own duration.


	};

	// #endregion delAniFun


	// #region savAniFun

	/**
	 * savAniFun = Save Animated Function
	 *
	 * @summary
	 * Commits a brand-new conditional after its row collapses, so the row stays
	 * in place with the same id and name rather than visibly jumping: it closes
	 * the row at once, then adds the conditional to the store under its tidied
	 * final name and clears the draft and pending state 300ms later. Under
	 * reduced motion it commits immediately.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param finNamStr - Final Name String: The tidied name the conditional is
	 *                    saved under.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * savAniFun( finNamStr ) // => void
	 * ```
	 *
	*/

	const savAniFun = ( finNamStr ) => { // What: Save Animated Function. Why: Committing a brand-new conditional to the store should happen after the row's own collapse, so the row stays in place (same id/name) rather than visibly jumping. How: This commits immediately when motion is reduced, otherwise defers the commit by 300ms.


		const finDraObj = { ...conDraObj, name : finNamStr }; // What: Final Draft Object. Why: The committed conditional needs its own name replaced by the freshly-tidied final one. How: This spreads conDraObj with name overridden by finNamStr.


		const wriConFun = () => { // What: Write Conditional Function. Why: The actual store write and clearing the local-only draft/pending state need to happen together. How: This is called either immediately or after the deferred timeout below.


			actStoObj.addConFun( finDraObj ); // What: Add Conditional Call. Why: This is the actual store write of the new conditional. How: This calls addConFun with finDraObj.

			setConDraObj( null ); // What: Draft Clear Call. Why: The saved draft is no longer needed. How: This resets conDraObj to null.
			setPenConObj( null ); // What: Pending Clear Call. Why: The conditional is real now, not pending. How: This resets penConObj to null.


		};



		if ( redMotFun() ) { // What: Reduced Motion Guard. Why: A user who prefers reduced motion should see this happen instantly. How: This closes the row and commits synchronously, then returns early.


			setOpeIdeStr( null ); // What: Open Clear Call. Why: The row closes at once. How: This resets opeIdeStr to null.

			wriConFun(); // What: Write Conditional Call. Why: The commit happens at once too. How: This calls wriConFun synchronously.



			return; // What: Early Return. Why: Nothing is left to animate. How: This skips the deferred commit below.


		}



		setOpeIdeStr( null ); // What: Row Collapse Call. Why: Collapsing the row's own open state is what actually triggers its ColDisCom to animate shut before the commit below lands. How: This clears opeIdeStr.

		setTimeout( wriConFun, 300 ); // What: Deferred Commit Call. Why: The actual store write must wait until the collapse animation finishes. How: This calls wriConFun 300ms later, matching the collapse animation's own duration.


	};

	// #endregion savAniFun


	const tidNamStr = ( conDraObj && norConFun( conDraObj.name ) ) || ''; // What: Tidy Name String. Why: Every save/collision-check below needs the draft's own name already normalized to the app's tidy-casing rule. How: This calls norConFun on conDraObj.name when a draft exists, empty string otherwise.


	const namErrStr = conDraObj && !tidNamStr // What: Name Error String. Why: The open row's own editor needs a specific validation message whenever its name is empty or collides with another conditional. How: This checks emptiness first, then a case-insensitive collision against every OTHER conditional, null when the name is valid.
		? 'Enter a name for this conditional.'                                            // What: Empty Name Message. Why: A blank name can't be saved. How: This asks for a name.
		: conDraObj && conIteArr.some( ( conCurObj ) => conCurObj.id !== opeIdeStr && ( conCurObj.name || '' ).toLowerCase() === tidNamStr.toLowerCase() ) // What: Duplicate Name Check. Why: A name matching another conditional (ignoring case) can't be saved either. How: This compares tidNamStr against every other conditional's name.
		? `A conditional named “${ tidNamStr }” already exists. Choose a different name.` // What: Duplicate Name Message. Why: The user needs to know why the name was rejected. How: This names the colliding value.
		: null;                                                                           // What: Valid Name Branch. Why: A unique, non-empty name has no error. How: This returns null.


	const keeCloFun = () => { // What: Keep Close Function. Why: The row's own collapse chevron is a deliberate close, not an accidental one; a plain cloEdiFun there would discard a brand-new conditional or revert an edited existing one back to its pre-edit values. How: This commits the current draft (new or existing) unless the name itself is invalid, in which case it falls back to a plain (discarding) close.


		if ( namErrStr ) { cloEdiFun(); return; } // What: Invalid Name Guard. Why: An empty or colliding name can't be committed at all. How: This falls back to a plain close when namErrStr holds a message.



		if ( penConObj ) { savAniFun( tidNamStr ); return; } // What: Pending Guard. Why: A brand-new conditional's own "keep" means actually saving it, the animated way. How: This delegates to savAniFun and returns early when penConObj is set.



		actStoObj.updConFun( opeIdeStr, { ...conDraObj, name : tidNamStr } ); // What: Update Conditional Call. Why: An existing conditional's own "keep" means committing its edited fields. How: This writes every draft field, with name replaced by its tidied form.

		cloEdiFun(); // What: Close Editor Call. Why: A successful keep should also close the row. How: This calls cloEdiFun after the update above.


	};

	// #endregion Row Open And Close



	// #region New Row Scroll

	const opeRowRef = React.useRef( null ); // What: Open Row Reference. Why: A brand-new conditional's own "+ Add a conditional" click needs a handle on the resulting row so it can be scrolled into view. How: This is attached to whichever row is currently open.


	React.useEffect( () => { // What: Scroll Into View Effect. Why: A freshly-created conditional's own form should scroll into view once its ColDisCom has actually finished opening. How: This waits 300ms (matching the ColDisCom open animation) before scrolling, or scrolls instantly under reduced motion.


		const notOpeBoo = !opeIdeStr;         // What: Not Open Boolean. Why: No row is open, so there is nothing to scroll to. How: This negates opeIdeStr.
		const notPenBoo = !penConObj;         // What: Not Pending Boolean. Why: Only a brand-new pending row needs this scroll. How: This negates penConObj.
		const notRowBoo = !opeRowRef.current; // What: Not Row Boolean. Why: The row's node must be mounted before it can scroll. How: This negates opeRowRef.current.

		const skiScrBoo = notOpeBoo || notPenBoo || notRowBoo; // What: Skip Scroll Boolean. Why: Any one missing piece means this effect has nothing to do. How: This ORs the 3 checks above.


		if ( skiScrBoo ) return; // What: Not Applicable Guard. Why: Only a brand-new (pending), currently-open row with a mounted ref needs this scroll. How: This bails out whenever any of the 3 conditions isn't met.



		const rowCurEle = opeRowRef.current; // What: Row Current Element. Why: The scroll call below needs a stable local reference to the live row node. How: This reads opeRowRef.current once and reuses it.



		if ( redMotFun() ) { rowCurEle.scrollIntoView( { behavior : 'auto', block : 'nearest' } ); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion should see this scroll happen instantly, not after a delay. How: This scrolls immediately and returns early.



		const scrTimNum = setTimeout( () => rowCurEle.scrollIntoView( { behavior : 'smooth', block : 'nearest' } ), 300 ); // What: Scroll Timeout Number. Why: The ColDisCom open animation (.26s) needs to finish growing the editor before the scroll starts, or it would scroll to the wrong final position. How: This schedules the smooth scroll 300ms out.



		return () => clearTimeout( scrTimNum ); // What: Effect Cleanup Return. Why: A stale scroll must not fire after this effect re-runs (e.g. a different row opens) or the component unmounts. How: This cancels scrTimNum.


	}, [ opeIdeStr ] ); // What: Effect Dependency Array. Why: This scroll only ever needs to reconsider itself when which row is open actually changes. How: opeIdeStr is the single value this effect's own guard is built around.

	// #endregion New Row Scroll



	const focInpRef = React.useRef( null ); // What: Focused Input Reference. Why: The name input focuses itself via a ref callback (below, inline) instead of the plain autoFocus attribute, so it can pass preventScroll and avoid fighting the deliberate smooth scroll above. How: This is guarded by node identity so a later re-render of the SAME input doesn't refocus it repeatedly.



	return (


		<section
			className='cat cat--enter cnd-manager'

			data-element-name-hook='datCatSec conCatSec'
		>{ /* What: Category Section Element. Why: This is ConManCom's own root element, matching every other Data tab category's own outer landmark. How: This renders the header, then the ColDisCom-wrapped body below. Its data-element-name-hook is read by the App Features tours, the Data page tour, and help mode's Data catalog. */ }


			<header
				className='cat-h'

				data-element-name-hook='catHeaHea'
			>{ /* What: Category Header Element. Why: Every section shares the same header shape (chevron + name + count). How: This wraps the collapse-toggle button below. Its data-element-name-hook is read by help mode's Data catalog. */ }


				<button
					className='cat-h-l'

					data-element-name-hook='catHeaBut'

					type='button'

					aria-expanded={ secOpeBoo }

					onClick={ () => actStoObj.togColFun( '__conditionals', true ) }
				>{ /* What: Header Left Button Element. Why: This is the actual clickable control for expanding/collapsing the whole section. How: This toggles the section's own persisted collapse state, defaulting collapsed. Its data-element-name-hook is read by the App Features tours. */ }


					<span className={ ` chev   ${ secOpeBoo ? 'is-open' : '' } ` }>{ /* What: Chevron Span Element. Why: The section's own open/closed state needs a visible directional indicator. How: This rotates via the 'is-open' class and renders the shared chevron icon. */ }


						<IcoSvgCom
							icoNamStr='chvEle'
							sizValNum={ 14 }
						/>{ /* What: Icon Svg Component. Why: The chevron span needs its own recognizable directional glyph. How: This renders the 'chvEle' icon at a fixed size. */ }


					</span>

					<span className='cat-h-main'>{ /* What: Header Main Span Element. Why: The section's own name and live count belong together. How: This wraps the h2 and the count span below. */ }


						<h2 className='cat-name'>Conditionals</h2>{ /* What: Category Name Element. Why: Every section needs its own visible name. How: This renders the literal text "Conditionals". */ }

						<span className='cat-count'>{ /* What: Category Count Span Element. Why: The active/total count needs 3 separate elements (see styles2.css) rather than one text run. How: This wraps the active count, the "of" separator, and the total count below. */ }


							<span className='cat-count-n'>{ conIteArr.filter( ( conCurObj ) => conCurObj.active !== false ).length }</span>{ /* What: Count N Span Element. Why: The active conditional count needs its own element. How: This counts every conditional whose own active field isn't explicitly false. */ }

							<span className='cat-count-of'>of</span>{ /* What: Count Of Span Element. Why: The separator between the active and total counts needs its own element. How: This renders the literal text "of". */ }

							<span className='cat-count-n'>{ conIteArr.length }</span>{ /* What: Count N Span Element. Why: The total conditional count needs its own element. How: This renders conIteArr's own length. */ }


						</span>


					</span>


				</button>


			</header>



			<ColDisCom open={ secOpeBoo }>{ /* What: Collapse Disclosure Component. Why: The whole section's own body only needs to exist while it's actually expanded. How: This opens only while secOpeBoo is true. */ }


				<div
					className='cat-body'

					data-element-name-hook='catBodDiv'
				>{ /* What: Category Body Div Element. Why: The add control, the empty-state message, the sort control, and every conditional row all belong in one body. How: This wraps every piece below. Its data-element-name-hook is read by the App Features tours and help mode's Data catalog. */ }


					{ ONB_CHE_OBJ.tutProFun( staAppObj ) ? ( // What: Tutorials In Progress Check. Why: The add control must stay disabled (with an explanatory tip) while the Welcome Tour's own checklist is still in progress. How: This renders a disabled InfTipCom-wrapped control in that state, otherwise the real button.


						<InfTipCom
							className='rd-add is-tour-disabled'

							data-element-name-hook='rowAddSpa'

							actNamStr='Add a conditional'
							labTexStr='This button is disabled until all tutorials are completed.'
						>{ /* What: Info Tip Component. Why: A disabled control still needs to explain why it can't be clicked yet. How: This wraps the same visible label/icon the real button uses. Its data-element-name-hook is read by help mode's Data catalog. */ }


							<IcoSvgCom
								icoNamStr='pluEle'
								sizValNum={ 13 }
							/>{ /* What: Icon Svg Component. Why: The disabled add control still needs a recognizable "add" glyph beside its own label. How: This renders the 'pluEle' icon at a fixed size. */ } Add a conditional


						</InfTipCom>


					) : ( // What: Add Button Branch. Why: Outside the guided checklist, the real working Add control belongs here instead. How: This renders the else branch, taken while the checklist isn't in progress.


						<button
							className='rd-add'

							data-element-name-hook='rowAddBut'

							onClick={ () => { // What: On Click Handler. Why: Adding a conditional starts a local-only draft that nothing else sees until Save. How: This builds a draft with a fresh id, then holds it as pending, as the editor draft, and as the open row.


								if ( penConObj ) return; // What: One Draft Guard. Why: Only one brand-new conditional can be in progress at a time. How: This bails out of the click entirely while penConObj already holds one.



								const basDraObj = conDraFun( '', conIteArr.map( ( conCurObj ) => conCurObj.name ) ); // What: Base Draft Object. Why: A brand-new conditional needs a sensible starting draft, with a name that won't collide with any existing one. How: This calls the shared conDraFun helper.
								const nexIdeStr = 'cnd_' + Math.random().toString( 36 ).slice( 2, 8 );               // What: Next Identifier String. Why: The brand-new draft needs its own id immediately, even before it's ever written to the store. How: This generates a short random id with a 'cnd_' prefix.
								const nexDraObj = { ...basDraObj, id : nexIdeStr };                                  // What: Next Draft Object. Why: The draft object itself needs to carry its own freshly-generated id. How: This spreads basDraObj with id set to nexIdeStr.


								setPenConObj( nexDraObj ); // What: Pending Set Call. Why: This is held locally, not written to the store, until Save. How: This sets penConObj to nexDraObj.
								setConDraObj( nexDraObj ); // What: Draft Set Call. Why: The editor below needs the same object as its own in-progress draft. How: This sets conDraObj to the same nexDraObj.
								setOpeIdeStr( nexIdeStr ); // What: Open Set Call. Why: The brand-new row must open immediately so its own editor is visible. How: This sets opeIdeStr to nexIdeStr.


							} }
						>{ /* What: Add Button Element. Why: This is the only place a brand-new conditional can be started. How: This seeds a fresh local-only draft and opens its own row. Its data-element-name-hook is read by help mode's Data catalog. */ }


							<IcoSvgCom
								icoNamStr='pluEle'
								sizValNum={ 13 }
							/>{ /* What: Icon Svg Component. Why: The add control needs a recognizable "add" glyph beside its own label. How: This renders the 'pluEle' icon at a fixed size. */ } Add a conditional


						</button>


					) }



					{ !conIteArr.length && !penConObj && ( // What: Empty State Check. Why: A genuinely empty list needs its own explanatory message instead of an empty body. How: This renders only while there are no conditionals at all and none is currently being created.


						<p className='rd-cnd-empty'>No conditionals yet. Add one here, then attach it to any picker.</p> // What: Empty List Paragraph Element. Why: A genuinely empty list needs its own explanatory message. How: This renders a fixed message.


					) }



					{ conIteArr.length > 1 && ( // What: Multiple Conditionals Check. Why: A sort control is only useful once there's more than one conditional to sort. How: This renders SorSelCom only while conIteArr has 2 or more entries.


						<SorSelCom
							labTexStr='Sort'
							optLisArr={ CIS_OPT_ARR }
							selIdeStr='cnd-item-sort'
							value={ iteSorStr }

							onChange={ ( keyValStr ) => actStoObj.setSorFun( 'conditionals', keyValStr ) }
						/> // What: Sort Select Component. Why: This is the actual control for reordering the conditional list. How: This commits the chosen key as this section's own persisted conditionals sort.


					) }



					{ ( penConObj ? [ penConObj, ...sorConArr ] : sorConArr ).map( ( conCurObj ) => { // What: Conditional Row Map. Why: A brand-new pending conditional renders first, ahead of every sorted existing one. How: This maps the combined list to one collapsible row each.


						const isaPenBoo = !!penConObj && conCurObj.id === penConObj.id; // What: Is-A Pending Boolean. Why: The pending row needs slightly different editor treatment (isaNewBoo) than an existing one. How: This is true only for the one row matching penConObj's own id.
						const isaOpeBoo = opeIdeStr === conCurObj.id;                   // What: Is-An Open Boolean. Why: Every row needs to know whether IT SPECIFICALLY is the currently-open one. How: This compares conCurObj.id against opeIdeStr.
						const useCouNum = useCouFun( conCurObj.id );                    // What: Use Count Number. Why: Every row's own closed-state summary shows how many pickers currently use it. How: This calls useCouFun for conCurObj.id.



						return (


							<div
								key={ conCurObj.id }
								ref={ isaOpeBoo ? opeRowRef : undefined }

								className={ ` rd-item   ${ isaOpeBoo ? 'is-editing' : '' } ` }

								data-element-name-hook='lisIteDiv'
							>{ /* What: Row Div Element. Why: Every conditional needs its own collapsible row wrapper. How: This marks itself "is-editing" while isaOpeBoo is true, and captures opeRowRef only while it's the open row. Its data-element-name-hook is read by the App Features tours, help mode's Pickers catalog, and help mode's Data catalog. */ }


								{ isaOpeBoo && conDraObj ? ( // What: Editing Check. Why: The open row swaps its own header for a live name input, since a real button can't legally contain that input (interactive-in-interactive) and would otherwise lose its own accessible name. How: This renders the editing header while isaOpeBoo is true and a draft exists, otherwise the normal clickable row.


									<div
										className='rd-row'

										data-element-name-hook='lisRowDiv'
									>{ /* What: Row Div Element. Why: The name input and its own chevron button need their own row. How: This wraps the rd-main span and the chevron button below. Its data-element-name-hook is read by the App Features tours and help mode's Data catalog. */ }


										<span className='rd-main'>{ /* What: Main Span Element. Why: The name input needs its own wrapper matching the closed row's own layout. How: This wraps the input below. */ }


											<input
												ref={ ( inpCurEle ) => { // What: Focus Reference Callback. Why: The input should focus once when it mounts, without the page jumping. How: This focuses a newly attached input with preventScroll and remembers it in focInpRef so re-renders don't refocus it.


													if ( inpCurEle && focInpRef.current !== inpCurEle ) { // What: New Input Guard. Why: Only a freshly attached input should take focus. How: This skips null detaches and the input already focused before.


														inpCurEle.focus( { preventScroll : true } ); // What: Focus Call. Why: The user can type the name right away. How: This focuses inpCurEle without scrolling the page.

														focInpRef.current = inpCurEle; // What: Focused Input Record. Why: A later re-render must not steal focus back. How: This stores inpCurEle in focInpRef.


													}


												} }

												className={ ` rd-name-input   ${ namErrStr ? 'is-error' : '' } ` }

												data-element-name-hook='rowNamInp'

												maxLength={ 40 }
												placeholder='Conditional name'
												type='text'
												value={ conDraObj.name }

												aria-invalid={ !!namErrStr }
												aria-label='Conditional name'

												onBlur={ () => { if ( tidNamStr ) setConDraObj( { ...conDraObj, name : tidNamStr } ); } }
												onChange={ ( chaEveObj ) => setConDraObj( { ...conDraObj, name : chaEveObj.target.value } ) }
												onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Enter' ) keyEveObj.currentTarget.blur(); } }
											/>{ /* What: Name Input Element. Why: A conditional's own name is edited live, right in the row header. How: This commits every keystroke immediately, and tidies the name on blur. Its data-element-name-hook is read by the picker mini-tours, help mode's Pickers catalog, and help mode's Data catalog. */ }


										</span>

										<button
											className='rd-chev'

											type='button'

											aria-label='Collapse'

											onClick={ keeCloFun }
										>{ /* What: Chevron Button Element. Why: The chevron is its own real button (not a decoration) since the row itself can no longer be one while editing. How: This calls keeCloFun, the same "deliberate close" handler used elsewhere. */ }


											<span className='chev is-open'>{ /* What: Chevron Span Element. Why: The disclosure's own open/closed state needs a visible directional indicator. How: This wraps the chevron icon, rotated via its own is-open class. */ }


												<IcoSvgCom
													icoNamStr='chvEle'
													sizValNum={ 14 }
												/>{ /* What: Icon Svg Component. Why: The chevron span needs its own recognizable directional glyph. How: This renders the 'chvEle' icon at a fixed size. */ }


											</span>


										</button>


									</div>


								) : ( // What: Normal Row Branch. Why: A closed row just needs the plain clickable header instead. How: This renders the else branch, taken while isaOpeBoo is false or conDraObj is missing.


									<button
										className='rd-row'

										data-element-name-hook='lisRowBut'

										type='button'

										aria-expanded={ isaOpeBoo }

										onClick={ () => { // What: On Click Handler. Why: A row click toggles its own editor open or closed. How: This calls cloEdiFun when the row is open, otherwise opeEdiFun.


											if ( isaOpeBoo ) cloEdiFun(); // What: Close Branch. Why: An already-open row's own click should collapse it back down. How: This calls cloEdiFun.

											else opeEdiFun( conCurObj ); // What: Open Branch. Why: A closed row's own click should expand its editor. How: This calls opeEdiFun with conCurObj.


										} }
									>{ /* What: Row Button Element. Why: A closed row is a plain clickable control that opens (or closes) its own editor. How: This toggles between opeEdiFun and cloEdiFun based on isaOpeBoo. Its data-element-name-hook is read by the App Features tours and help mode's Data catalog. */ }


										<span className='rd-main'>{ /* What: Main Span Element. Why: The name and its own summary line belong together. How: This wraps the name and sched spans below. */ }


											<span
												className='rd-name'

												data-element-name-hook='rowNamSpa'
											>{ conCurObj.name }</span>{ /* What: Name Span Element. Why: Every row needs its own visible name. How: This renders conCurObj's own name. Its data-element-name-hook is read by help mode's Data catalog. */ }

											<span className='rd-sched'>{ /* What: Sched Span Element. Why: The closed row's own summary needs mode, usage count, and active state in one line. How: This joins the mode label, the picker count, and an inactive suffix when applicable. */ }


												{ ( SED_NAM_OBJ.MOD_DEF_OBJ[ conCurObj.mode ] || {} ).labStr || conCurObj.mode }{ /* What: Mode Label Expression. Why: The summary leads with the conditional's mode. How: This renders the mode's label, falling back to its raw id. */ }

												{ ' · ' }{ useCouNum } { useCouNum === 1 ? 'picker' : 'pickers' }{ /* What: Usage Count Expression. Why: The summary says how many pickers use this conditional. How: This renders useCouNum with a singular or plural noun. */ }

												{ conCurObj.active === false ? ' · inactive' : '' }{ /* What: Inactive Flag Expression. Why: An inactive conditional says so in its summary. How: This appends ' · inactive' only when active is false. */ }


											</span>


										</span>

										<span className='rd-chev'>{ /* What: Chevron Holder Span Element. Why: The row's chevron needs its own fixed-width slot at the row's end. How: This wraps the rotating chevron span. */ }


											<span className={ ` chev   ${ isaOpeBoo ? 'is-open' : '' } ` }>{ /* What: Chevron Span Element. Why: The closed row's own open/closed state needs a visible directional indicator. How: This rotates via the 'is-open' class and renders the shared chevron icon. */ }


												<IcoSvgCom
													icoNamStr='chvEle'
													sizValNum={ 14 }
												/>{ /* What: Icon Svg Component. Why: The chevron span needs its own recognizable directional glyph. How: This renders the 'chvEle' icon at a fixed size. */ }


											</span>


										</span>


									</button>


								) }



								<ColDisCom open={ isaOpeBoo }>{ /* What: Collapse Disclosure Component. Why: This row's own editor only needs to exist while it's actually open (or animating shut). How: This opens only while isaOpeBoo is true. */ }


									{ conDraObj && ( isaOpeBoo || isaPenBoo || cloIdeStr === conCurObj.id ) && ( // What: Editor Mount Check. Why: The editor must also stay mounted while pending or mid-delete-animation, not only while strictly open. How: This renders ConEdiCom only while a draft exists and one of the 3 conditions holds.


										<ConEdiCom
											actStoObj={ actStoObj }
											conDraObj={ conDraObj }
											curConObj={ conCurObj }
											isaNewBoo={ isaPenBoo }
											namErrStr={ namErrStr }
											setConDraObj={ setConDraObj }
											tidNamStr={ tidNamStr }

											onCloEdiFun={ cloEdiFun }
											onDelConFun={ () => delAniFun( conCurObj.id ) }
											onDisDraFun={ isaPenBoo ? cloAniFun : ( () => { // What: On Discard Draft Handler. Why: A pending row discards with its collapse animation, while any other row just closes and removes the conditional. How: This passes cloAniFun for a pending row, otherwise an arrow that closes the editor and deletes by id.


												const rmvIdeStr = conCurObj.id; // What: Remove Identifier String. Why: The removal below needs a stable copy of this row's id. How: This reads conCurObj.id once.


												cloEdiFun(); // What: Close Editor Call. Why: The row closes before its conditional goes away. How: This calls cloEdiFun.

												actStoObj.delConFun( rmvIdeStr ); // What: Remove Conditional Call. Why: This is the actual store removal. How: This calls delConFun with rmvIdeStr.


											} ) }
											onSavNewFun={ isaPenBoo ? ( () => savAniFun( tidNamStr ) ) : undefined }
										/> // What: Conditional Editor Component. Why: This is the actual editor body for this one conditional. How: This is passed the live conditional, its draft, and every handler this row needs.


									) }


								</ColDisCom>


							</div>


						);


					} ) }


				</div>


			</ColDisCom>


		</section>


	);


}

// #endregion ConManCom

// #endregion Components



// #region Exports

export { ConManCom }; // What: Named Export. Why: TabDatCom renders the Conditionals section. How: This exports ConManCom by name; ConEdiCom and CIS_OPT_ARR stay private to this file.

// #endregion Exports


