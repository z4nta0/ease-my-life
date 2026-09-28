


// #region Imports

import React from 'react'; // What: React. Why: This is the UI library EntEdiCom is built on. How: This is used directly (React.forwardRef, React.useState, React.useRef, React.useEffect, React.useImperativeHandle, ...) instead of importing individual named hooks.


import { BooResCom    } from './boost-reset.jsx';    // What: Boost Reset Component. Why: A dynamic-mode item's inline editor needs a control for resetting its boost value back to 0. How: This is rendered inside EntEdiCom's own Boost row.
import { ButBasCom    } from './button.jsx';         // What: Button Base Component. Why: The editor's own Save, Cancel and Delete actions are shared styled buttons. How: This is rendered for each footer action and the delete confirm.
import { CAD_NAM_OBJ  } from '../core/cadence.js';   // What: Cadence Namespace Object. Why: An ease item's day range reads in its picker's own cadence unit. How: This is called via CAD_NAM_OBJ.uniWorFun to word the Soonest/Latest range as days, weeks or months.
import { EUR_WAR_STR  } from '../constants.js';      // What: Ease-Up-Range Warning String. Why: An ease-up item's Soonest/Latest row needs its own explanatory warning text. How: This is passed as an InfTipCom's own label prop inside EntEdiCom.
import { FilButCom    } from './fill-button.jsx';    // What: Fill Button Component. Why: Ease-up and ease-down items each need a button that instantly fills the item to its threshold. How: This is rendered inside EntEdiCom's own Fill/Refill row, labeled per direction.
import { InfTipCom    } from './info-tip.jsx';       // What: Info Tip Component. Why: The ease range rows need an inline explanation of what their values mean. How: This renders an info bubble carrying EUR_WAR_STR next to those rows.
import { NumSteCom    } from './number-stepper.jsx'; // What: Numeric Stepper Component. Why: An ease-mode item's Soonest/Latest values need a shared plus/minus numeric control. How: This is rendered twice inside EntEdiCom's own ease rows.
import { PIC_NAM_OBJ  } from '../core/pickers.js';   // What: Pickers Namespace Object. Why: An item with no ease band of its own falls back to its picker's average band. How: This is called via PIC_NAM_OBJ.aveEasFun.
import { THR_VAL_NUM  } from '../constants.js';      // What: Threshold Value Number. Why: The ease day-range math divides by the shared full-charge ceiling. How: This is divided by an item's own easeMin/easeMax to get its Soonest/Latest day counts.
import { useEscCanFun } from './escape-cancel.js';   // What: Use Escape Cancel Function. Why: EntEdiCom's own Escape key needs to cancel the edit (or back out of a delete confirm) exactly like every other inline editor in the app. How: This is called once inside EntEdiCom with a handler that checks conDelBoo first.


import './edit-guard.js'; // What: Edit Guard Import. Why: This file arms and disarms window.__editGuard, which only exists once edit-guard.js has run. How: This is imported purely for that side effect.

// #endregion Imports



/**
 * entry-editor.jsx = Entry Editor
 *
 * @summary
 * The shared inline editor for one picker item, used by the Today, Pickers and
 * Data tabs so every tab edits an item through the same component. It mirrors
 * the Pickers tab's per-item controls (a weight stepper, the ease day range,
 * an Active/Inactive toggle and a confirm-gated delete), stages each edit
 * straight onto the real item, and snapshots the item on open so Cancel or an
 * implicit close can revert it.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

// #region EntEdiCom

/**
 * EntEdiCom = Entry Editor Component
 *
 * @summary
 * The shared inline editor for a picker item, reused by the Today, Pickers,
 * and Data tabs so every one of them edits an item identically: a weight
 * stepper for weighted/dynamic pickers, a cadence range for ease-up/
 * ease-down, a Boost row for dynamic, an Active/Inactive toggle, and a
 * confirm-gated Delete. Every edit is applied to the real item as it
 * happens; the item is snapshotted on mount so Cancel, Escape, or an
 * implicit close (a tab switch or reload) can put it back exactly as it
 * was, while Save or the exposed keeSavFun handle keeps the edits.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actStoObj   - Action Store Object: {@link useAppStaFun}, or a
 *                            caller's own actions-shaped stand-in for a
 *                            draft item.
 * @param props.isaNewBoo   - Is-A New Boolean: Whether the item is a
 *                            brand-new, unsaved draft, which hides the
 *                            Delete button.
 * @param props.iteCouNum   - Item Count Number: The picker's own current item
 *                            total, used to refuse a delete below 2 items.
 * @param props.iteDatObj   - Item Data Object: The item being edited.
 * @param props.onCanEdiFun - On Cancel Edit Function: An optional revert
 *                            handler for a caller that owns the item itself.
 * @param props.onCloEdiFun - On Close Edit Function: Closes the editor.
 * @param props.onDelIteFun - On Delete Item Function: An optional delete
 *                            handler, otherwise actStoObj.delIteFun is used.
 * @param props.picDatObj   - Picker Data Object: The item's own picker, read
 *                            for its mode, cadence, and threshold.
 * @param props.picIteArr   - Picker Item Array: Every item, used to average
 *                            a fallback ease band for an unstamped item.
 * @param forRefObj         - Forward Reference Object: The caller's own ref,
 *                            which receives the keeSavFun handle.
 *
 * @returns The editor's rows and footer, or the delete confirm prompt
 * while one is showing.
 *
 * @example
 * ```tsx
 * EntEdiCom({ actStoObj, isaNewBoo, iteCouNum, ... }) // => <EntEdiCom />
 * ```
 *
*/

const EntEdiCom = React.forwardRef( function EntEdiCom ( { actStoObj, isaNewBoo, iteCouNum, iteDatObj, onCanEdiFun, onCloEdiFun, onDelIteFun, picDatObj, picIteArr }, forRefObj ) { // What: Entry Editor Component. Why: This is the shared inline editor for a picker item, reused by the Today/Pickers/Data tabs so every one of them edits an item identically: mirrors the Pickers-tab per-item controls (a weight stepper for weighted/dynamic, cadence range for ease-up/ease-down, an Active/Inactive toggle, and a confirm-gated delete). How: This snapshots item on mount so Cancel/an implicit close can revert it, stages every live edit directly onto the real item via actStoObj.updIteFun, and exposes a keeSavFun() imperative handle so an external close affordance can mark a save as already-handled.


	// #region Delete Confirm

	const [ conDelBoo, setConDelBoo ] = React.useState( false ); // What: Confirm Delete Boolean And Setter. Why: Delete is confirm-gated, morphing the footer into a Delete/Cancel prompt instead of firing immediately. How: This toggles between the plain footer and the confirm prompt below.

	const minIteBoo = iteCouNum != null && iteCouNum <= 2; // What: Minimum Item Boolean. Why: A picker needs at least 2 items for a pick to be a real choice, so this one must be refused if deleting it would drop below that; iteCouNum is the picker's CURRENT total including this item, and a caller that never wires it up (undefined) is treated as unrestricted rather than silently blocking. How: This is true only when iteCouNum is actually known and already at or under 2.

	// #endregion Delete Confirm



	// #region Close And Revert Handling

	const oriIteRef = React.useRef( iteDatObj ); // What: Original Item Reference. Why: Cancel (or an implicit close) needs to restore the item exactly as it was when this editor opened. How: This snapshots item once, on mount, never updated afterward.
	const cloWayRef = React.useRef( null );      // What: Close Way Reference. Why: A caller with its OWN close affordance outside this component (e.g. the Data tab row's own collapse chevron) can call the exposed keeSavFun() first so that affordance reads as "done, keep this" rather than an implicit close; this distinguishes 'saved'/'cancel' (closed explicitly) from null (still open, so an implicit close such as a tab switch or reload should discard the unsaved live edits). How: This is written by every explicit action below and read by the pagehide/unmount effect further down.


	React.useImperativeHandle( forRefObj, () => ( { keeSavFun : () => { cloWayRef.current = 'saved'; } } ) ); // What: Imperative Handle Publish. Why: An external close affordance needs a way to mark this editor's own edits as already-handled before it closes. How: This exposes a single keeSavFun (Keep Saved Function) method that just flips cloWayRef to 'saved'.


	const revStaFun = () => { // What: Revert State Function. Why: Cancel and an implicit close both need to restore the item to its pre-edit snapshot. How: This calls onCanEdiFun with oriIteRef's own snapshot when the caller supplied one, otherwise writes the snapshot straight back via actStoObj.revIteFun.


		if ( onCanEdiFun ) onCanEdiFun( oriIteRef.current ); // What: Caller Revert Branch. Why: A caller that owns the item (a draft not yet in the store) must restore it itself. How: This hands oriIteRef's own snapshot to onCanEdiFun.

		else actStoObj.revIteFun( oriIteRef.current.id, oriIteRef.current ); // What: Store Revert Branch. Why: A real, stored item is restored through the store itself. How: This writes oriIteRef's own snapshot back via actStoObj.revIteFun.


	};


	const canEdiFun = () => { // What: Cancel Edit Function. Why: An explicit Cancel click needs to mark itself handled, actually revert the item, and (unless the caller owns its own close affordance via onCanEdiFun) close this editor. How: This flips cloWayRef, calls revStaFun, then conditionally calls onCloEdiFun.


		cloWayRef.current = 'cancel'; // What: Close Way Cancel. Why: The unmount guard below must not treat this close as an implicit one. How: This marks cloWayRef as 'cancel'.
		revStaFun();                  // What: Revert State Call. Why: Cancel must restore the item to its pre-edit snapshot. How: This calls revStaFun.



		if ( !onCanEdiFun ) onCloEdiFun(); // What: Close Editor Check. Why: A caller that owns its own close affordance (onCanEdiFun) closes the editor itself. How: This calls onCloEdiFun only when no onCanEdiFun was supplied.


	};


	useEscCanFun( true, () => { // What: Use Escape Cancel Function. Why: Escape should cancel the live edits, except while the delete confirm is up, where it should just back out of the confirm instead. How: This closes the confirm prompt when open, otherwise calls canEdiFun.


		if ( conDelBoo ) setConDelBoo( false ); // What: Close Confirm Branch. Why: While the delete confirm prompt is up, Escape should just back out of it instead of cancelling the whole edit. How: This closes the confirm by setting conDelBoo false.

		else canEdiFun(); // What: Cancel Edits Branch. Why: With no confirm prompt up, Escape should cancel the live edits like an explicit Cancel click. How: This calls canEdiFun.


	} );


	const savCloFun = () => { // What: Save Close Function. Why: An explicit Save click needs to mark itself handled and keep the live edits, which are already applied directly (see the header comment above). How: This flips cloWayRef, then calls onCloEdiFun.


		cloWayRef.current = 'saved'; // What: Close Way Saved. Why: The unmount guard below must keep these live edits rather than revert them. How: This marks cloWayRef as 'saved'.
		onCloEdiFun();               // What: Close Editor Call. Why: Save also closes the editor. How: This calls onCloEdiFun.


	};



	// #region resStoFun

	/**
	 * resStoFun = Restore Storage Function
	 *
	 * @summary
	 * A same-tick localStorage warm mirror (see storage.js) can otherwise
	 * go stale for the exact instant between a live edit and the next
	 * debounced save, so an implicit close restores it directly: either
	 * dropping a brand-new item entirely, or writing the pre-edit
	 * snapshot back over whatever live edits already landed.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const resStoFun = () => { // What: Restore Storage Function. Why: See the doc comment just above. How: This reads the warm-mirror key directly, patches its own items array, and writes it straight back, swallowing any error since a failed restore must never break the close itself.


		try { // What: Mirror Restore Attempt. Why: Reading or writing the localStorage mirror can throw (malformed JSON, disabled or full storage). How: This wraps the whole restore so the catch below can swallow any failure.


			const rawJsoStr = localStorage.getItem( 'easemylife.v2' ); // What: Raw Json String. Why: The warm mirror's own persisted blob needs to be read before it can be patched. How: This reads the fixed 'easemylife.v2' storage key.


			if ( !rawJsoStr ) return; // What: No Mirror Guard. Why: A brand-new install (or a cleared mirror) has nothing to patch. How: This bails out early when rawJsoStr is empty.



			const rawStaObj = JSON.parse( rawJsoStr ); // What: Raw State Object. Why: The mirror's own items array needs to be reachable as real data before it can be patched. How: This parses rawJsoStr.


			if ( !Array.isArray( rawStaObj.items ) ) return; // What: No Items Array Guard. Why: A malformed or very old mirror shape has nothing safe to patch. How: This bails out unless rawStaObj.items is a real array.



			rawStaObj.items = onCanEdiFun // What: Items Patch. Why: A brand-new item (onCanEdiFun supplied) never belonged in the mirror at all, while an existing one just needs its pre-edit snapshot restored. How: This filters the new item out entirely, or maps the existing one back to oriIteRef's own snapshot.
				? rawStaObj.items.filter( ( curIteObj ) => curIteObj.id !== oriIteRef.current.id )                               // What: New Item Drop Branch. Why: A brand-new item was never saved, so it must vanish from the mirror entirely. How: This keeps every item except the one being edited.
				: rawStaObj.items.map( ( curIteObj ) => curIteObj.id === oriIteRef.current.id ? oriIteRef.current : curIteObj ); // What: Snapshot Restore Branch. Why: An existing item must go back to exactly how it was before this edit. How: This swaps the edited item for oriIteRef's own snapshot.

			localStorage.setItem( 'easemylife.v2', JSON.stringify( rawStaObj ) ); // What: Mirror Write Back. Why: The patched snapshot needs to actually replace the stale mirror. How: This writes rawStaObj back under the same fixed key.


		}

		catch { } // What: Restore Failure Swallow. Why: A failed restore (a full/blocked storage quota, a private window, ...) must never break the close itself. How: This intentionally does nothing.


	};

	// #endregion resStoFun


	React.useEffect( () => { // What: Discard Guard Effect. Why: An editor left open through a tab switch or reload should discard its own unsaved live edits, matching the "nothing changes until you actually save" expectation every other inline editor in the app follows. How: This disarms window.__editGuard on mount, restores the warm mirror directly on pagehide, and arms __editGuard to revert on an ordinary unmount, in both cases only when cloWayRef is still null (nothing explicit already handled the close).


		window.__editGuard.disFun(); // What: Edit Guard Disarm. Why: A stale armed guard from a PREVIOUS editor instance must not fire against this fresh one. How: This clears whatever revert thunk __editGuard was last armed with.

		const onPagHidFun = () => { if ( !cloWayRef.current ) resStoFun(); }; // What: On Page Hide Function. Why: A pagehide (the tab closing or backgrounding) needs its own direct storage restore, since a React unmount effect may not get to run in time. How: This calls resStoFun only when cloWayRef is still null.


		window.addEventListener( 'pagehide', onPagHidFun ); // What: Pagehide Subscribe Call. Why: The discard needs to happen the moment the page is actually hidden, not on some later tick. How: This registers onPagHidFun to run on that event.



		return () => { // What: Effect Cleanup Function. Why: An ordinary unmount (navigating within the app, e.g. switching tabs) needs its own revert path, distinct from the pagehide case above. How: This removes the pagehide listener and arms __editGuard with revStaFun when nothing explicit already handled the close.


			window.removeEventListener( 'pagehide', onPagHidFun ); // What: Pagehide Listener Teardown. Why: This matches the addEventListener above so the listener does not outlive this effect run. How: This removes the same onPagHidFun reference that was added above.

			if ( !cloWayRef.current ) window.__editGuard.armFun( revStaFun ); // What: Edit Guard Arm. Why: The NEXT editor instance's own disarm (above) is what actually cancels this, so arming here is what makes an ordinary unmount revert at all. How: This arms __editGuard with revStaFun only when cloWayRef is still null.


		};


	}, [] ); // What: Effect Dependency Array. Why: This effect only ever needs to run once, on mount, since cloWayRef/oriIteRef/revStaFun are all stable for this editor instance's whole lifetime. How: An empty array means this never re-subscribes.

	// #endregion Close And Revert Handling



	// #region Mode-Derived Display Values

	const picModStr = picDatObj ? picDatObj.mode : 'random';                // What: Picker Mode String. Why: Nearly every row below renders differently depending on the picker's own mode. How: This reads picker.mode, falling back to 'random' when no picker was passed at all.
	const isaEasBoo = picModStr === 'ease-up' || picModStr === 'ease-down'; // What: Is-A Ease Boolean. Why: Ease-up/ease-down show a cadence range instead of a weight stepper, since weight is irrelevant to those modes. How: This is true for either ease mode.
	const hasWeiBoo = picModStr === 'weighted' || picModStr === 'dynamic';  // What: Has Weight Boolean. Why: Weight is only a real lever for weighted/dynamic; random picks uniformly and ease modes ignore it entirely. How: This is true for either of those two modes.
	const isaDynBoo = picModStr === 'dynamic';                              // What: Is-A Dynamic Boolean. Why: Only dynamic mode also shows the Boost row beneath its weight stepper. How: This is true only when picModStr is 'dynamic'.

	// #endregion Mode-Derived Display Values



	// #region Ease Band Resolution

	const driSooFun = ( maxValNum ) => Math.max( 1, Math.round( THR_VAL_NUM / ( maxValNum || 1 ) ) ); // What: Drift Soonest Function. Why: A "Soonest" day count is the human face of an item's own ease-max drift value. How: This converts maxValNum into a day count, matching the exact conversion the new-picker form itself uses.
	const driLatFun = ( minValNum ) => Math.max( 1, Math.round( THR_VAL_NUM / ( minValNum || 1 ) ) ); // What: Drift Latest Function. Why: A "Latest" day count is the human face of an item's own ease-min drift value. How: This converts minValNum into a day count, the same conversion as driSooFun, mirrored for the opposite bound.
	const dayDriFun = ( dayCouNum ) => THR_VAL_NUM / Math.max( 1, dayCouNum );                        // What: Day Drift Function. Why: Writing a user-typed day count back onto the item requires converting it back into a drift value. How: This is the inverse of driSooFun/driLatFun.

	const falEasObj = picDatObj ? PIC_NAM_OBJ.aveEasFun( picIteArr, picDatObj.id ) : null; // What: Fallback Ease Object. Why: An item with no ease band of its own (e.g. one added before per-item stamping existed, or from an old imported backup) needs the same fallback the picking engine itself uses. How: This calls PIC_NAM_OBJ.aveEasFun against this picker's own items.
	const easMinNum = iteDatObj.easeMin ?? falEasObj?.easeMin ?? 10;                       // What: Ease Minimum Number. Why: This is the item's own resolved lower drift bound, read once and reused throughout this region. How: This reads item.easeMin, falling back to falEasObj's own easeMin, then a fixed 10.
	const easMaxNum = iteDatObj.easeMax ?? falEasObj?.easeMax ?? 20;                       // What: Ease Maximum Number. Why: This is the item's own resolved upper drift bound, read once and reused throughout this region. How: This reads item.easeMax, falling back to falEasObj's own easeMax, then a fixed 20.
	const sooDayNum = driSooFun( easMaxNum );                                              // What: Soonest Day Number. Why: The Soonest/Shortest row needs this as a plain day count to display and edit. How: This converts easMaxNum via driSooFun.
	const latDayNum = driLatFun( easMinNum );                                              // What: Latest Day Number. Why: The Latest/Longest row needs this as a plain day count to display and edit. How: This converts easMinNum via driLatFun.


	// #region setSooFun

	/**
	 * setSooFun = Set Soonest Function
	 *
	 * @summary
	 * NumSteCom's handler for the Soonest (or Shortest) day count. It clamps the
	 * typed count, converts it back to a drift value and writes it to the item's
	 * easeMax field.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param dayCouNum - Day Count Number: The typed Soonest day count.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * setSooFun( 3 ) // => void
	 * ```
	 *
	*/

	const setSooFun = ( dayCouNum ) => { // What: Set Soonest Function. Why: NumSteCom's own onSetValFun needs a handler that writes a typed Soonest/Shortest day count back onto the item's own easeMax field. How: This clamps dayCouNum, converts it back to a drift value, and writes it via actStoObj.updIteFun.


		const newMaxNum = dayDriFun( Math.max( 1, Math.min( 60, dayCouNum ) ) ); // What: New Maximum Number. Why: The typed day count needs converting back into the drift value item.easeMax actually stores. How: This clamps dayCouNum to [1, 60] then converts it via dayDriFun.


		actStoObj.updIteFun( iteDatObj.id, { // What: Update Item Call. Why: Raising easeMax can push it below the existing easeMin, which would invert the band. How: This writes the new easeMax, clamping easeMin down to match if it would otherwise exceed the new easeMax.


			easeMax : newMaxNum,                       // What: Ease Max. Why: This is the new upper drift bound the user just typed. How: This writes newMaxNum.
			easeMin : Math.min( easMinNum, newMaxNum ) // What: Ease Min. Why: The band must never invert. How: This keeps the current easeMin unless it now exceeds newMaxNum.


		} );


	};

	// #endregion setSooFun


	// #region setLatFun

	/**
	 * setLatFun = Set Latest Function
	 *
	 * @summary
	 * NumSteCom's handler for the Latest (or Longest) day count. It clamps the
	 * typed count, converts it back to a drift value and writes it to the item's
	 * easeMin field.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param dayCouNum - Day Count Number: The typed Latest day count.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * setLatFun( 7 ) // => void
	 * ```
	 *
	*/

	const setLatFun = ( dayCouNum ) => { // What: Set Latest Function. Why: NumSteCom's own onSetValFun needs a handler that writes a typed Latest/Longest day count back onto the item's own easeMin field. How: This clamps dayCouNum, converts it back to a drift value, and writes it via actStoObj.updIteFun.


		const newMinNum = dayDriFun( Math.max( 1, Math.min( 90, dayCouNum ) ) ); // What: New Minimum Number. Why: The typed day count needs converting back into the drift value item.easeMin actually stores. How: This clamps dayCouNum to [1, 90] then converts it via dayDriFun.


		actStoObj.updIteFun( iteDatObj.id, { // What: Update Item Call. Why: Lowering easeMin can push it above the existing easeMax, which would invert the band. How: This writes the new easeMin, clamping easeMax up to match if it would otherwise fall under the new easeMin.


			easeMax : Math.max( easMaxNum, newMinNum ), // What: Ease Max. Why: The band must never invert. How: This keeps the current easeMax unless it now falls under newMinNum.
			easeMin : newMinNum                         // What: Ease Min. Why: This is the new lower drift bound the user just typed. How: This writes newMinNum.


		} );


	};

	// #endregion setLatFun


	const isaDowBoo = picModStr === 'ease-down';          // What: Is-A Down Boolean. Why: Ease-down uses different row labels/phrasing (Shortest/Longest/Refill) than ease-up (Soonest/Latest/Fill). How: This is true only when picModStr is 'ease-down'.
	const sooLabStr = isaDowBoo ? 'Shortest' : 'Soonest'; // What: Soonest Label String. Why: The Soonest row's own heading text differs by direction. How: This picks 'Shortest' for ease-down, 'Soonest' otherwise.
	const latLabStr = isaDowBoo ? 'Longest' : 'Latest';   // What: Latest Label String. Why: The Latest row's own heading text differs by direction. How: This picks 'Longest' for ease-down, 'Latest' otherwise.

	const uniWorFun = ( valCouNum ) => CAD_NAM_OBJ.uniWorFun( picDatObj && picDatObj.cadence, valCouNum ); // What: Unit Word Function. Why: Every day count below needs a correctly-pluralized cadence unit word next to it. How: This calls CAD_NAM_OBJ.uniWorFun with the picker's own cadence and valCouNum.


	const sooSubEle = isaDowBoo // What: Soonest Sub Element. Why: The Soonest/Shortest row's own subtitle phrasing differs by direction. How: This renders "stays picked N days minimum" for ease-down, or "N days until pickable again" otherwise.
		? <>stays picked <strong>{ sooDayNum } { uniWorFun( sooDayNum ) }</strong> minimum</>  // What: Ease-Down Soonest Branch. Why: Ease-down's lower bound is a minimum stay. How: This phrases it as "stays picked N days minimum".
		: <><strong>{ sooDayNum } { uniWorFun( sooDayNum ) }</strong> until pickable again</>; // What: Ease-Up Soonest Branch. Why: Ease-up's lower bound is a cooldown before the item can return. How: This phrases it as "N days until pickable again".


	const latSubEle = isaDowBoo // What: Latest Sub Element. Why: The Latest/Longest row's own subtitle phrasing differs by direction. How: This renders "stays picked N days maximum" for ease-down, or "N days until pick is mandatory" otherwise.
		? <>stays picked <strong>{ latDayNum } { uniWorFun( latDayNum ) }</strong> maximum</>     // What: Ease-Down Latest Branch. Why: Ease-down's upper bound is a maximum stay. How: This phrases it as "stays picked N days maximum".
		: <><strong>{ latDayNum } { uniWorFun( latDayNum ) }</strong> until pick is mandatory</>; // What: Ease-Up Latest Branch. Why: Ease-up's upper bound is when the item is forced back in. How: This phrases it as "N days until pick is mandatory".

	// #endregion Ease Band Resolution


	return (


		<div
			className='rem-inline-editor entry-editor'

			data-element-name-hook='entEdiDiv'
		>{ /* What: Entry Editor Div Element. Why: This is EntEdiCom's own root wrapper. How: This renders the mode-specific rows above a confirm-gated footer. Its data-element-name-hook is read by help mode's Today catalog and the help items' own unit-word lookups. */ }


			<div className='pie-rows'>{ /* What: Pie Rows Div Element. Why: Every mode-specific control row shares this one column. How: This renders exactly one of the ease/weight/no-weight branches, plus the optional Boost row and the always-present Active/Inactive row. */ }


				{ isaEasBoo ? ( // What: Ease Rows Branch. Why: Ease-up/ease-down show a cadence range instead of a weight stepper.


					// #region Ease Direction Split

					/**
					 * entry-editor.jsx = Ease Direction Split
					 *
					 * @summary
					 * pie-ease-up-row/pie-ease-down-row (on every relevant row
					 * below, alongside the row's own shared pie-row class) are
					 * pure selector hooks for help mode (see help/content.jsx's
					 * itemChargeRangeUp/Down), split by direction rather than one
					 * shared pie-ease-row, since Soonest/Latest/Fill (ease-up) and
					 * Shortest/Longest/Refill (ease-down) get entirely different
					 * tip copy, not just relabeled headings. FilButCom (ui.jsx)
					 * has no class of its own to distinguish it by, and it only
					 * renders for ONE direction at a time, so there is no existing
					 * class shared by exactly "this direction's ease rows" other
					 * than this pair.
					 *
					 * @author z4nta0 <https://github.com/z4nta0>
					 *
					*/

					<React.Fragment>{ /* What: Ease Rows Fragment Element. Why: The Soonest/Latest rows plus one direction-specific Fill/Refill row are true siblings with no shared wrapper of their own. How: This groups all 3 without adding an extra DOM node. */ }


						<div
							className={ ` pie-row   ${ isaDowBoo ? 'pie-ease-down-row' : 'pie-ease-up-row' } ` }

							data-ease-down-active={ isaDowBoo || undefined } // What: Ease Down Active Attribute. Why: Help mode finds this row as an ease-down row without reading its classes. How: This is present only while isaDowBoo is true, since undefined drops the attribute entirely.
							data-ease-up-active={ !isaDowBoo || undefined } // What: Ease Up Active Attribute. Why: Help mode finds this row as an ease-up row without reading its classes. How: This is present only while isaDowBoo is false, since undefined drops the attribute entirely.
							data-element-name-hook='ediRowDiv'
						>{ /* What: Soonest Row Div Element. Why: This is the Soonest/Shortest control row. How: This renders the row's own label/InfTipCom/subtitle plus its NumSteCom. Its data-element-name-hook is read by the picker mini-tours, help mode's Today catalog, and the help items' own unit-word lookups. */ }


							<div className='pie-rowlabel'>{ /* What: Row Label Div Element. Why: The label/InfTipCom pair and the live subtitle read as one stacked cluster. How: This wraps the label row and the subtitle span below. */ }


								<span className='pie-lbl-row'>{ /* What: Label Row Span Element. Why: The label text and its optional warning InfTipCom sit side by side. How: This wraps the label span and, for ease-up only, the warning InfTipCom. */ }


									<span className='pie-lbl'>{ sooLabStr }</span>{ /* What: Label Span Element. Why: This is the row's own heading text. How: This renders sooLabStr directly. */ }



									{ picModStr === 'ease-up' && ( // What: Ease-Up Warning Check. Why: Only ease-up needs its own inline warning about item competition at high item counts. How: This renders the InfTipCom only while picModStr is 'ease-up'.


										<InfTipCom
											className='pie-help'

											labTexStr={ EUR_WAR_STR }
										>?</InfTipCom> // What: Info Tip Component. Why: Ease-up specifically needs its own warning about item competition at high item counts. How: This renders only for ease-up, labeled with EUR_WAR_STR.


									) }


								</span>

								<span
									key={ `${ isaDowBoo }-${ sooDayNum }-${ uniWorFun( sooDayNum ) }` }

									className='pie-sub set-sub-fade'
								>{ sooSubEle }</span>{ /* What: Subtitle Span Element. Why: The live day count/unit-word combination needs its own fade-replace key so a change visibly refreshes. How: This renders sooSubEle, keyed by direction/value/unit-word together. */ }


							</div>

							<div className='pie-ctl'>{ /* What: Control Div Element. Why: The numeric stepper and its own unit-word suffix read as one control cluster. How: This wraps the NumSteCom and the unit-word span below. */ }


								<NumSteCom
									ariLabStr={ `${ sooLabStr } for ${ iteDatObj.name }` }
									maxValNum={ 60 }
									minValNum={ 1 }
									value={ sooDayNum }

									onSetValFun={ setSooFun }
								/>{ /* What: Number Stepper Component. Why: This is the actual editable control for the Soonest/Shortest day count. How: This is passed sooDayNum and setSooFun, clamped to [1, 60]. */ }



								<span
									className='np-ease-unit'

									data-element-name-hook='easUniSpa'
								>{ uniWorFun( sooDayNum ) }</span>{ /* What: Ease Unit Span Element. Why: A bare number needs its own unit word right next to the stepper. How: This renders uniWorFun's own result for sooDayNum. Its data-element-name-hook is read by the help items' own unit-word lookups. */ }


							</div>


						</div>


						<div
							className={ ` pie-row   ${ isaDowBoo ? 'pie-ease-down-row' : 'pie-ease-up-row' } ` }

							data-ease-down-active={ isaDowBoo || undefined } // What: Ease Down Active Attribute. Why: Help mode finds this row as an ease-down row without reading its classes. How: This is present only while isaDowBoo is true, since undefined drops the attribute entirely.
							data-ease-up-active={ !isaDowBoo || undefined } // What: Ease Up Active Attribute. Why: Help mode finds this row as an ease-up row without reading its classes. How: This is present only while isaDowBoo is false, since undefined drops the attribute entirely.
							data-element-name-hook='ediRowDiv'
						>{ /* What: Latest Row Div Element. Why: This is the Latest/Longest control row, the mirror of the Soonest row above. How: This renders the row's own label/InfTipCom/subtitle plus its NumSteCom. Its data-element-name-hook is read by the picker mini-tours, help mode's Today catalog, and the help items' own unit-word lookups. */ }


							<div className='pie-rowlabel'>{ /* What: Row Label Div Element. Why: The label/InfTipCom pair and the live subtitle read as one stacked cluster. How: This wraps the label row and the subtitle span below. */ }


								<span className='pie-lbl-row'>{ /* What: Label Row Span Element. Why: The label text and its optional warning InfTipCom sit side by side. How: This wraps the label span and, for ease-up only, the warning InfTipCom. */ }


									<span className='pie-lbl'>{ latLabStr }</span>{ /* What: Label Span Element. Why: This is the row's own heading text. How: This renders latLabStr directly. */ }



									{ picModStr === 'ease-up' && ( // What: Ease-Up Warning Check. Why: Only ease-up needs its own inline warning about item competition at high item counts. How: This renders the InfTipCom only while picModStr is 'ease-up'.


										<InfTipCom
											className='pie-help'

											labTexStr={ EUR_WAR_STR }
										>?</InfTipCom> // What: Info Tip Component. Why: Ease-up specifically needs its own warning about item competition at high item counts. How: This renders only for ease-up, labeled with EUR_WAR_STR.


									) }


								</span>

								<span
									key={ `${ isaDowBoo }-${ latDayNum }-${ uniWorFun( latDayNum ) }` }

									className='pie-sub set-sub-fade'
								>{ latSubEle }</span>{ /* What: Subtitle Span Element. Why: The live day count/unit-word combination needs its own fade-replace key so a change visibly refreshes. How: This renders latSubEle, keyed by direction/value/unit-word together. */ }


							</div>

							<div className='pie-ctl'>{ /* What: Control Div Element. Why: The numeric stepper and its own unit-word suffix read as one control cluster. How: This wraps the NumSteCom and the unit-word span below. */ }


								<NumSteCom
									ariLabStr={ `${ latLabStr } for ${ iteDatObj.name }` }
									maxValNum={ 90 }
									minValNum={ 1 }
									value={ latDayNum }

									onSetValFun={ setLatFun }
								/>{ /* What: Number Stepper Component. Why: This is the actual editable control for the Latest/Longest day count. How: This is passed latDayNum and setLatFun, clamped to [1, 90]. */ }



								<span
									className='np-ease-unit'

									data-element-name-hook='easUniSpa'
								>{ uniWorFun( latDayNum ) }</span>{ /* What: Ease Unit Span Element. Why: A bare number needs its own unit word right next to the stepper. How: This renders uniWorFun's own result for latDayNum. Its data-element-name-hook is read by the help items' own unit-word lookups. */ }


							</div>


						</div>


						{ picModStr === 'ease-up' && ( // What: Fill Row Visibility Check. Why: Only ease-up offers an instant-fill shortcut for its own charge. How: This renders the Fill row only while picModStr is 'ease-up'.


							<div
								className='pie-row pie-ease-up-row'

								data-ease-up-active // What: Ease Up Active Attribute. Why: Help mode finds this Fill row as an ease-up row without reading its classes. How: This is always present, since Fill only ever renders for an ease-up picker.
								data-element-name-hook='ediRowDiv'
							>{ /* What: Fill Row Div Element. Why: Ease-up specifically offers an instant-fill shortcut. How: This renders the Fill label/subtitle plus its FilButCom. Its data-element-name-hook is read by the picker mini-tours, help mode's Today catalog, and the help items' own unit-word lookups. */ }


								<div className='pie-rowlabel'>{ /* What: Row Label Div Element. Why: The label and the live fill-state subtitle read as one stacked cluster. How: This wraps the label span and the subtitle span below. */ }


									<span className='pie-lbl'>Fill</span>{ /* What: Label Span Element. Why: This is the row's own heading text. How: This renders the literal word "Fill". */ }

									<span
										key={ ( iteDatObj.value ?? 0 ) >= THR_VAL_NUM ? 'full' : 'part' }

										className='pie-sub set-sub-fade'
									>{ ( iteDatObj.value ?? 0 ) >= THR_VAL_NUM ? <>item is <strong>fully charged</strong> at { Math.round( iteDatObj.value ?? 0 ) }</> : <>item at <strong>{ Math.round( iteDatObj.value ?? 0 ) } charge</strong></> }</span>{ /* What: Subtitle Span Element. Why: The live charge subtitle needs its own fade-replace key so crossing the threshold visibly refreshes it. How: This renders one of two phrasings depending on whether item.value has reached THR_VAL_NUM, keyed by which one is showing. */ }


								</div>



								<FilButCom
									isaDisBoo={ ( iteDatObj.value ?? 0 ) >= ( picDatObj.threshold ?? 100 ) }
									labTexStr='Fill'

									onFilActFun={ () => actStoObj.updIteFun( iteDatObj.id, { value : Math.max( iteDatObj.value ?? 0, picDatObj.threshold ?? 100 ) } ) }
								/>{ /* What: Fill Button Component. Why: This is the actual instant-fill shortcut for an ease-up item. How: This is disabled once item.value already meets the picker's own threshold, otherwise writes value up to that threshold on click. */ }


							</div>


						) }


						{ picModStr === 'ease-down' && ( // What: Refill Row Visibility Check. Why: Only ease-down offers an instant-refill shortcut for its own charge. How: This renders the Refill row only while picModStr is 'ease-down'.


							<div
								className='pie-row pie-ease-down-row'

								data-ease-down-active // What: Ease Down Active Attribute. Why: Help mode finds this Refill row as an ease-down row without reading its classes. How: This is always present, since Refill only ever renders for an ease-down picker.
								data-element-name-hook='ediRowDiv'
							>{ /* What: Refill Row Div Element. Why: Ease-down specifically offers an instant-refill shortcut. How: This renders the Refill label/subtitle plus its FilButCom. Its data-element-name-hook is read by the picker mini-tours, help mode's Today catalog, and the help items' own unit-word lookups. */ }


								<div className='pie-rowlabel'>{ /* What: Row Label Div Element. Why: The label and the live fill-state subtitle read as one stacked cluster. How: This wraps the label span and the subtitle span below. */ }


									<span className='pie-lbl'>Refill</span>{ /* What: Label Span Element. Why: This is the row's own heading text. How: This renders the literal word "Refill". */ }

									<span
										key={ ( iteDatObj.value ?? 0 ) >= THR_VAL_NUM ? 'full' : 'part' }

										className='pie-sub set-sub-fade'
									>{ ( iteDatObj.value ?? 0 ) >= THR_VAL_NUM ? <>item is <strong>fully charged</strong></> : <>item at <strong>{ Math.round( iteDatObj.value ?? 0 ) } charge</strong></> }</span>{ /* What: Subtitle Span Element. Why: The live charge subtitle needs its own fade-replace key so crossing the threshold visibly refreshes it. How: This renders one of two phrasings depending on whether item.value has reached THR_VAL_NUM, keyed by which one is showing. */ }


								</div>



								<FilButCom
									isaDisBoo={ ( iteDatObj.value ?? 0 ) >= ( picDatObj.threshold ?? 100 ) }
									labTexStr='Refill'

									onFilActFun={ () => actStoObj.updIteFun( iteDatObj.id, { value : Math.max( iteDatObj.value ?? 0, picDatObj.threshold ?? 100 ) } ) }
								/>{ /* What: Fill Button Component. Why: This is the actual instant-refill shortcut for an ease-down item. How: This is disabled once item.value already meets the picker's own threshold, otherwise writes value up to that threshold on click. */ }


							</div>


						) }


					</React.Fragment>

					// #endregion Ease Direction Split


				) : hasWeiBoo ? ( // What: Weight Row Branch. Why: Weighted/dynamic show an editable weight stepper instead. How: This renders the weight label/subtitle plus a plain plus/minus control.


					<div
						className='pie-row'

						data-element-name-hook='ediRowDiv'
					>{ /* What: Weight Row Div Element. Why: This is the weighted/dynamic weight control row. How: This renders the label/subtitle plus the plus/minus weight-stepper below. Its data-element-name-hook is read by the picker mini-tours, help mode's Today catalog, and the help items' own unit-word lookups. */ }


						<div className='pie-rowlabel'>{ /* What: Row Label Div Element. Why: The label and the live weight subtitle read as one stacked cluster. How: This wraps the label span and the subtitle span below. */ }


							<span className='pie-lbl'>Weight</span>{ /* What: Label Span Element. Why: This is the row's own heading text. How: This renders the literal word "Weight". */ }

							<span
								key={ iteDatObj.weight }

								className='pie-sub set-sub-fade'
							>{ iteDatObj.weight === 1 ? <><strong>baseline</strong> pick chance</> : <><strong>{ iteDatObj.weight }&times;</strong> more likely than w1</> }</span>{ /* What: Subtitle Span Element. Why: The live weight subtitle needs its own fade-replace key so a change visibly refreshes it. How: This renders one of two phrasings depending on whether item.weight is the baseline 1, keyed by weight. */ }


						</div>

						<div
							className='weight-stepper'

							data-element-name-hook='weiSteDiv'
						>{ /* What: Weight Stepper Div Element. Why: The minus/value/plus trio reads as one compact control. How: This wraps both plus/minus buttons around the current weight display. Its data-element-name-hook is read by help mode's Today catalog. */ }


							<button
								disabled={ iteDatObj.weight <= 1 }

								aria-label='Less weight'

								onClick={ () => actStoObj.setWeiFun( iteDatObj.id, Math.max( 1, iteDatObj.weight - 1 ) ) }
							>&minus;</button>{ /* What: Less Weight Button Element. Why: This is the actual decrement control. How: This clamps item.weight down to a minimum of 1 via actStoObj.setWeiFun. */ }

							<span className='weight-val'>w{ iteDatObj.weight }</span>{ /* What: Weight Value Span Element. Why: The current weight needs a plain numeric display between the two buttons. How: This renders the literal "w" prefix plus item.weight. */ }

							<button
								disabled={ iteDatObj.weight >= 9 }

								aria-label='More weight'

								onClick={ () => actStoObj.setWeiFun( iteDatObj.id, Math.min( 9, iteDatObj.weight + 1 ) ) }
							>+</button>{ /* What: More Weight Button Element. Why: This is the actual increment control. How: This clamps item.weight up to a maximum of 9 via actStoObj.setWeiFun. */ }


						</div>


					</div>


				) : ( // What: No-Weight Row Branch. Why: Random mode ignores weight entirely (it picks uniformly), so this row is purely informational.


					<div
						className='pie-row'

						data-element-name-hook='ediRowDiv'
					>{ /* What: No Weight Row Div Element. Why: Random mode still needs a Weight row for layout parity, but with no editable control. How: This renders a fixed explanatory subtitle and a plain "No weight" note instead of any stepper. Its data-element-name-hook is read by the picker mini-tours, help mode's Today catalog, and the help items' own unit-word lookups. */ }


						<div className='pie-rowlabel'>{ /* What: Row Label Div Element. Why: The label and its fixed explanatory subtitle read as one stacked cluster. How: This wraps the label span and the subtitle span below. */ }


							<span className='pie-lbl'>Weight</span>{ /* What: Label Span Element. Why: This is the row's own heading text. How: This renders the literal word "Weight". */ }

							<span className='pie-sub'>truly random items have equal chance</span>{ /* What: Subtitle Span Element. Why: The user still deserves an explanation for why no weight control appears. How: This renders a fixed explanatory sentence. */ }


						</div>

						<span className='pie-note'>No weight</span>{ /* What: Note Span Element. Why: This row still needs SOME visible content where a control would otherwise sit. How: This renders the literal phrase "No weight". */ }


					</div>


				) }



				{ isaDynBoo && ( // What: Boost Row Visibility Check. Why: Only dynamic mode has a boost value worth showing/resetting. How: This renders the Boost row only while isaDynBoo is true.


					<div
						className='pie-row'

						data-element-name-hook='ediRowDiv'
					>{ /* What: Boost Row Div Element. Why: This is the dynamic-mode boost control row. How: This renders the label/subtitle plus a BooResCom control. Its data-element-name-hook is read by the picker mini-tours, help mode's Today catalog, and the help items' own unit-word lookups. */ }


						<div className='pie-rowlabel'>{ /* What: Row Label Div Element. Why: The label and the live boost subtitle read as one stacked cluster. How: This wraps the label span and the subtitle span below. */ }


							<span className='pie-lbl'>Boost</span>{ /* What: Label Span Element. Why: This is the row's own heading text. How: This renders the literal word "Boost". */ }

							<span
								key={ ( iteDatObj.value || 0 ) > 0 ? 'boost' : 'none' }

								className='pie-sub set-sub-fade'
							>{ ( iteDatObj.value || 0 ) > 0 ? <><strong>+{ iteDatObj.value }</strong> to weight, resets when picked</> : <><strong>no bonus</strong> to weight, will increase when not picked</> }</span>{ /* What: Subtitle Span Element. Why: The live boost subtitle needs its own fade-replace key so a change visibly refreshes it. How: This renders one of two phrasings depending on whether item.value is currently positive, keyed by which one is showing. */ }


						</div>

						<div className='pie-ctl'>{ /* What: Control Div Element. Why: The boost row's own reset control needs a consistent control-column slot, matching every other row. How: This wraps the BooResCom below. */ }


							<BooResCom
								booValNum={ iteDatObj.value || 0 }

								onResBooFun={ () => actStoObj.updIteFun( iteDatObj.id, { value : 0 } ) }
							/>{ /* What: Boost Reset Component. Why: This is the actual control for zeroing out a dynamic item's own accumulated boost. How: This is passed item.value and writes 0 back via actStoObj.updIteFun on reset. */ }


						</div>


					</div>


				) }


				<div
					className='pie-row'

					data-element-name-hook='ediRowDiv'
				>{ /* What: Active Row Div Element. Why: Every mode, regardless of the branches above, still needs the same Active/Inactive toggle row. How: This renders the label/subtitle plus a plain switch button. Its data-element-name-hook is read by the picker mini-tours, help mode's Today catalog, and the help items' own unit-word lookups. */ }


					<div className='pie-rowlabel'>{ /* What: Row Label Div Element. Why: The label and the live active-state subtitle read as one stacked cluster. How: This wraps the label span and the subtitle span below. */ }


						<span
							key={ `lbl-${ !!iteDatObj.vacation }` }

							className='pie-lbl set-sub-fade'
						>{ iteDatObj.vacation ? 'Inactive' : 'Active' }</span>{ /* What: Label Span Element. Why: The row's own heading text itself flips with the item's own current state. How: This renders "Inactive" or "Active" depending on item.vacation, keyed so the flip fades. */ }

						<span
							key={ `sub-${ !!iteDatObj.vacation }` }

							className='pie-sub set-sub-fade'
						>{ iteDatObj.vacation ? <><strong>not eligible</strong> to be picked</> : <><strong>eligible</strong> to be picked</> }</span>{ /* What: Subtitle Span Element. Why: The live eligibility subtitle needs its own fade-replace key so a toggle visibly refreshes it. How: This renders one of two phrasings depending on item.vacation, keyed the same way as the label above. */ }


					</div>

					<button
						className={ ` switch   ${ !iteDatObj.vacation ? 'is-on' : '' } ` }

						data-element-name-hook='togSwiBut'

						aria-label={ iteDatObj.vacation ? 'Activate' : 'Deactivate' }
						aria-pressed={ !iteDatObj.vacation }

						onClick={ () => actStoObj.togVacFun( iteDatObj.id, 'item' ) }
					><i /></button>{ /* What: Active Switch Button Element. Why: This is the actual Active/Inactive toggle control. How: This calls actStoObj.togVacFun, scoped to 'item'. Its data-element-name-hook is read by help mode's Today catalog. */ }


				</div>


			</div>



			{ conDelBoo ? ( // What: Confirm Delete Branch. Why: The delete confirm prompt replaces the plain footer entirely while it is up.


				<div
					key='confirm'

					className='rem-inline-foot rem-foot-confirm'

					data-element-name-hook='ediFooDiv'
				>{ /* What: Confirm Foot Div Element. Why: This is the delete-confirm prompt's own root, replacing the plain footer row. How: This renders the confirm message and its own Cancel/Delete actions. Its data-element-name-hook is read by help mode's Today catalog. */ }


					<span className='rem-del-msg'>Delete this item?</span>{ /* What: Delete Message Span Element. Why: This asks the user to confirm before anything is actually removed. How: This renders the literal confirmation question. */ }

					<div className='rem-del-actions'>{ /* What: Delete Actions Div Element. Why: The confirm's own Cancel/Delete buttons need to sit together. How: This wraps both ButBasCom elements below. */ }


						<ButBasCom
							kinValStr='ghost'
							sizValStr='sm'

							onClick={ () => setConDelBoo( false ) }
						>Cancel</ButBasCom>{ /* What: Button Base Component. Why: This backs out of the delete confirm without changing anything. How: This closes conDelBoo, returning to the plain footer. */ }



						<ButBasCom
							kinValStr='danger'
							sizValStr='sm'

							onClick={ () => ( onDelIteFun ? onDelIteFun() : actStoObj.delIteFun( iteDatObj.id ) ) }
						>Delete</ButBasCom>{ /* What: Button Base Component. Why: This is the actual, confirmed deletion trigger. How: This calls the caller's own onDelIteFun when supplied, otherwise removes the item directly via actStoObj.delIteFun. */ }


					</div>


				</div>


			) : ( // What: Plain Foot Branch. Why: The normal, non-confirming footer shows whenever conDelBoo is false.


				<div
					key='foot'

					className='rem-inline-foot rd-edit-foot'

					data-element-name-hook='ediFooDiv'
				>{ /* What: Plain Foot Div Element. Why: This is the normal footer, holding an optional Delete button (suppressed for a brand-new item) plus the Cancel/Save actions. The Pickers tab hides the Delete button entirely via a `.pv-newitem .rd-edit-foot > .btn--danger` direct-child selector and enforces the 2-item minimum on its own row-level trash icon instead, so it never passes iteCouNum here, keeping minIteBoo false and this branch's extra InfTipCom wrapper out of the way of that selector. How: This renders Delete (plain, or InfTipCom-wrapped and disabled while minIteBoo) unless isaNewBoo, then the Cancel/Save pair. Its data-element-name-hook is read by help mode's Today catalog. */ }


					{ !isaNewBoo && ( minIteBoo ? ( // What: Delete Visibility Check. Why: A brand-new item has nothing to delete yet, only to discard via Cancel/implicit-close; an existing item at the 2-item floor gets a disabled, explained Delete instead of a working one.


						<InfTipCom
							className='rd-del-disabled-tip'

							labTexStr='Pickers require at least 2 items in their list, you need to add another item first or delete the entire picker instead.'
						>{ /* What: Info Tip Component. Why: A blocked delete still needs to explain itself on hover/tap, not just silently refuse. How: This wraps the disabled Delete button with the fixed floor-explanation text. */ }


							<ButBasCom
								disabled
								icoNamStr='traEle'
								kinValStr='danger'
								sizValStr='sm'
							>Delete</ButBasCom>{ /* What: Button Base Component. Why: This shows the disabled Delete control the wrapping InfTipCom explains. How: This never fires, since disabled is always set in this branch. */ }


						</InfTipCom>


					) : ( // What: Working Delete Branch. Why: With more than 2 items still in the pool, a real working Delete button belongs here instead. How: This renders the else branch, taken while minIteBoo is false.


						<ButBasCom
							icoNamStr='traEle'
							kinValStr='danger'
							sizValStr='sm'

							onClick={ () => setConDelBoo( true ) }
						>Delete</ButBasCom> // What: Button Base Component. Why: This opens the delete confirm prompt above instead of deleting immediately. How: This sets conDelBoo to true.


					) ) }



					<div className='rem-foot-right'>{ /* What: Foot Right Div Element. Why: Cancel and Save read as a pair, right-aligned opposite Delete. How: This wraps both ButBasCom elements below. */ }


						<ButBasCom
							className='ob-item-cancel'

							data-element-name-hook='iteCanBut'

							kinValStr='ghost'
							sizValStr='sm'

							onClick={ canEdiFun }
						>Cancel</ButBasCom>{ /* What: Button Base Component. Why: This discards the live edits and reverts to the original snapshot. How: This calls canEdiFun. Its data-element-name-hook is read by the picker mini-tours. */ }



						<ButBasCom
							className='ob-item-save'

							data-element-name-hook='iteSavBut'

							kinValStr='ghost'
							sizValStr='sm'

							onClick={ savCloFun }
						>Save</ButBasCom>{ /* What: Button Base Component. Why: This keeps the live edits as-is. How: This calls savCloFun. Its data-element-name-hook is read by the picker mini-tours. */ }


					</div>


				</div>


			) }


		</div>


	);


} );

// #endregion EntEdiCom

// #endregion Components



// #region Exports

export { EntEdiCom }; // What: Named Export. Why: The Today, Pickers and Data tabs all render this editor for an item. How: This exports EntEdiCom by name.

// #endregion Exports


