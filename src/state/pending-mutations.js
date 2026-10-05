


// #region Imports

import { CON_NAM_OBJ } from '../core/conditionals.js'; // What: Conditionals Namespace Object. Why: A day-off card's completion advances or reverts its conditional through this module's own logic. How: This is aliased to conModObj inside cotAplFun.
import { isoDayFun   } from '../utils/date.js';        // What: Iso Day Function. Why: Dates are stored and compared as local-calendar YYYY-MM-DD keys. How: This formats a Date (or now) as that key.

// #endregion Imports



/**
 * pending-mutations.js = Pending Mutations
 *
 * @summary
 * A pick's own VALUE consequences (item value/weight changes, an activeItemId
 * patch, a non-daily run's lastRunPeriod, picks/lastPicked bumps, depletedEnd
 * on the log) are not applied when an entry is generated, re-rolled, or sent
 * to Today; only when the entry is marked DONE. Until then nothing about item
 * state changes, so an untouched item keeps its own charge and keeps
 * resurfacing. The staged mutation rides on the entry as entry.pending;
 * applying it records an entry.revert snapshot so unchecking restores exactly:
 *   pending = { updates:[{id,value?,weight?}], pickerPatch?,
 *               depletedEnd?, pickedId?, bumpPick? }
 *
 * A direct edit to an item's own value (Fill/Refill/Reset, all three living on
 * entry-editor.jsx's EntEdiCom, patched via store.js's own updIteFun) is meant
 * to win immediately, so it deliberately bypasses this staging. But
 * ease-up/dynamic pick()s stash an updates row for EVERY pool item on each
 * not-yet-done entry's own pending, not just the one actually picked (see
 * pick()'s own ease-up/dynamic cases in pickers.js), snapshotted from value at
 * generation time. Left alone, later completing a SIBLING entry for the same
 * picker would silently overwrite the fresh direct edit with that stale
 * snapshot via enpAplFun below, which is the actual bug spuDroFun exists to
 * prevent (items looked like they "lost" a manual Fill/Refill/Reset). It
 * strips the touched item's own stale row from every OTHER entry's pending; an
 * item's OWN entry is left alone on purpose, since its completion is still
 * supposed to perform its designed effect regardless of an interim Fill.
 *
 * Sections:
 *  - Module State
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Module State

let __cdlSeqNum = 0; // What: Conditional-Log Sequence Number. Why: nclIdeFun below needs its own shared counter, separate from newLogFun's, so ids minted in the same millisecond still differ. How: This starts at 0 and is incremented once per nclIdeFun call.

// #endregion Module State



// #region Helpers

// #region nclIdeFun

/**
 * nclIdeFun = New-Conditional-Log Identifier Function
 *
 * @summary
 * Mints a new, distinct id for one state.conditionalLog row, mirroring
 * newLogFun's own shape but with its own separate counter and prefix so
 * the two logs' ids can never collide with each other.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns A new conditional-log row id string, prefixed 'cl_'.
 *
 * @example
 * ```ts
 * nclIdeFun() // => 'cl_abc123xy'
 * ```
 *
*/

function nclIdeFun () {


	return 'cl_' + Date.now().toString( 36 ) + ( __cdlSeqNum++ ).toString( 36 ); // What: Conditional-Log Id Return. Why: The caller needs a short, sortable, collision-resistant id. How: This concatenates a fixed prefix, the current time base-36, and the incrementing counter base-36.


}

// #endregion nclIdeFun



// #region spuDroFun

/**
 * spuDroFun = Stale-Pending-Updates Drop Function
 *
 * @summary
 * Strips any stale updates row for the given item ids from every NOT-
 * YET-DONE entry's own pending, except an entry whose own itemId is one
 * of those ids (see the design-rationale comment above). See the
 * design-rationale comment above for why this exists at all.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param todEntArr - Today Entry Array: The today.entries array to scan.
 * @param iteIdeArr - Item Identifier Array: The item ids whose stale
 *                    pending rows should be dropped.
 *
 * @returns The same todEntArr reference when nothing changed, else a new
 * array with the affected entries' own pending.updates filtered.
 *
 * @example
 * ```ts
 * spuDroFun(state.today.entries, [itemId]) // => entries
 * ```
 *
*/

function spuDroFun ( todEntArr, iteIdeArr ) {


	const iteIdeSet = new Set( iteIdeArr ); // What: Item Identifier Set. Why: The scan below needs fast membership checks against the touched ids. How: This wraps iteIdeArr in a Set.


	if ( !iteIdeSet.size ) return todEntArr; // What: No-Ids Guard. Why: Nothing was touched, so there's nothing stale to drop. How: This returns todEntArr unchanged when iteIdeSet is empty.



	let entChaBoo = false; // What: Entry Changed Boolean And Guard. Why: The caller only wants a new array reference when something actually changed. How: This starts false and flips true the first time a pending.updates row is actually dropped below.


	const nexEntArr = todEntArr.map( ( curEntObj ) => { // What: Next Entries Array. Why: Every entry must be checked for a stale pending row belonging to one of the touched items. How: This maps todEntArr, returning each entry unchanged unless it needs its own pending.updates filtered.


		if ( curEntObj.done || !curEntObj.pending || !curEntObj.pending.updates || !curEntObj.pending.updates.length ) return curEntObj; // What: Nothing-To-Strip Guard. Why: A done entry's pending no longer matters, and an entry with no pending.updates has nothing to filter. How: This returns curEntObj unchanged whenever any of those hold.



		if ( iteIdeSet.has( curEntObj.itemId ) ) return curEntObj; // What: Own-Entry Guard. Why: An item's OWN entry must keep its designed completion effect regardless of an interim Fill (see the design-rationale comment above). How: This returns curEntObj unchanged when its own itemId is one of the touched ids.



		const filUpdArr = curEntObj.pending.updates.filter( ( curUpdObj ) => !iteIdeSet.has( curUpdObj.id ) ); // What: Filtered Updates Array. Why: Only rows for OTHER touched items are the actual stale ones to drop. How: This keeps every update row whose own id isn't in iteIdeSet.


		if ( filUpdArr.length === curEntObj.pending.updates.length ) return curEntObj; // What: Unchanged-Length Guard. Why: Nothing was actually dropped for this entry, so its own reference can stay stable. How: This returns curEntObj unchanged when filUpdArr's own length matches the original.



		entChaBoo = true; // What: Entry Changed Flag Set. Why: At least one entry's own pending.updates was actually filtered. How: This flips entChaBoo to true.



		return { // What: Filtered Entry Return. Why: The caller needs this entry's own pending.updates replaced with the stale rows stripped. How: This spreads curEntObj and its own pending, overriding just updates.


			...curEntObj, // What: Current Entry Spread. Why: Every field of this entry other than pending must carry over unchanged. How: This spreads curEntObj before the pending override below.

			pending : { // What: Pending. Why: Only the updates list inside pending changes, so every other staged field must survive. How: This rebuilds pending from its own current fields plus the filtered updates.


				...curEntObj.pending, // What: Current Pending Spread. Why: Every other staged field (pickedId, ...) must carry over unchanged. How: This spreads curEntObj.pending before the updates override below.

				updates : filUpdArr // What: Updates. Why: This is the entry's own staged update list with the stale rows removed. How: This is filUpdArr.


			}


		};


	} );



	return entChaBoo ? nexEntArr : todEntArr; // What: Conditional Array Return. Why: The caller relies on reference equality to know nothing changed. How: This returns nexEntArr only when entChaBoo is true, else the original todEntArr.


}

// #endregion spuDroFun



// #region enpAplFun

/**
 * enpAplFun = Entry-Pending Apply Function
 *
 * @summary
 * Applies one Today entry's own staged entry.pending mutation (see the
 * design-rationale comment above) to items/pickers/pickLog, and returns
 * a revert snapshot so the exact reverse can be replayed later. A
 * completed non-daily pick or charging card also records its periodKey
 * on its picker as lastRunPeriod, since a charging card writes no
 * pick-log row for cadence.js's comPerFun to find; a day-off card never
 * counts as the picker's run.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curStaObj - Current State Object: The current state, read (not
 *                    mutated) for its own items/pickers/pickLog.
 * @param curEntObj - Current Entry Object: The Today entry whose own pending
 *                    is being applied.
 *
 * @returns { items, pickers, pickLog, revert } with pending applied, or
 * the same items/pickers/pickLog and revert:null when curEntObj has no
 * pending at all.
 *
 * @example
 * ```ts
 * enpAplFun(state, entry) // => { items, pickers, pickLog, revert }
 * ```
 *
*/

function enpAplFun ( curStaObj, curEntObj ) {


	const curPenObj = curEntObj.pending; // What: Current Pending Object And Guard. Why: Every mutation below is driven entirely by this entry's own staged pending payload. How: This reads curEntObj's own pending field.


	if ( !curPenObj ) return { // What: No-Pending Guard. Why: An entry with nothing staged has nothing to apply. How: This returns the state's own arrays untouched, with revert:null.


		items   : curStaObj.items,         // What: Items. Why: Nothing is applied, so the items stay as they are. How: This passes curStaObj's own items through.
		pickers : curStaObj.pickers,       // What: Pickers. Why: Nothing is applied, so the pickers stay as they are. How: This passes curStaObj's own pickers through.
		pickLog : curStaObj.pickLog || [], // What: Pick Log. Why: Callers always expect an array here. How: This passes the pick log through, defaulting to an empty array.
		revert  : null                     // What: Revert. Why: There is nothing to undo later. How: This is null.


	};



	const updIdeMap = new Map( ( curPenObj.updates || [] ).map( ( curUpdObj ) => [ curUpdObj.id, curUpdObj ] ) );                               // What: Update Identifier Map. Why: The items map below needs O(1) lookup of a touched item's own staged update. How: This maps every pending.updates row by its own id.
	const touIdeSet = new Set( [ ...( curPenObj.updates || [] ).map( ( curUpdObj ) => curUpdObj.id ), curPenObj.pickedId ].filter( Boolean ) ); // What: Touched Identifier Set. Why: Both the revert snapshot and the items map below need to know every item id this pending payload actually touches. How: This unions every updates row's own id with pickedId, dropping falsy entries.

	const revIteArr = curStaObj.items.filter( ( curIteObj ) => touIdeSet.has( curIteObj.id ) ).map( ( curIteObj ) => ( // What: Revert Item Array. Why: An exact undo later needs each touched item's own pre-apply snapshot. How: This filters to just the touched items and copies their own value/weight/picks/lastPicked/chargeStep.


		{ chargeStep : curIteObj.chargeStep, id : curIteObj.id, lastPicked : curIteObj.lastPicked, picks : curIteObj.picks, value : curIteObj.value, weight : curIteObj.weight } // What: Item Snapshot Object. Why: The revert needs each touched field exactly as it was. How: This copies the item's own id, value, weight, picks, lastPicked and chargeStep.


	) );

	const nowIsoStr = new Date().toISOString(); // What: Now Iso String. Why: A picked-and-bumped item needs a real completion timestamp. How: This reads the current instant as an ISO string.

	const nexIteArr = curStaObj.items.map( ( curIteObj ) => { // What: Next Item Array. Why: Every item must be checked for a staged update or a pick bump before the caller gets a fresh items array. How: This maps curStaObj.items, applying updIdeMap's own patch and/or the pick bump to a touched item, leaving everything else unchanged.


		if ( !touIdeSet.has( curIteObj.id ) ) return curIteObj; // What: Untouched-Item Guard. Why: An item this pending payload never mentions must pass through unchanged. How: This returns curIteObj unchanged when it isn't in touIdeSet.



		const matUpdObj = updIdeMap.get( curIteObj.id ); // What: Matched Update Object And Guard. Why: This item may or may not have its own staged value/weight/chargeStep patch. How: This looks up curIteObj's own id in updIdeMap, undefined when only pickedId touched it.
		const nexIteObj = { ...curIteObj };              // What: Next Item Object. Why: The patch below must not mutate curIteObj itself. How: This starts as a shallow copy of curIteObj.


		if ( matUpdObj ) { // What: Staged Patch Application. Why: Only the fields actually present on matUpdObj are meant to change. How: This conditionally overwrites value/weight/chargeStep on nexIteObj when each key is present on matUpdObj.


			if ( 'value' in matUpdObj ) nexIteObj.value = matUpdObj.value;                // What: Value Patch. Why: An updates row only sometimes carries a new value. How: This applies matUpdObj's own value only when the key is present.



			if ( 'weight' in matUpdObj ) nexIteObj.weight = matUpdObj.weight;             // What: Weight Patch. Why: An updates row only sometimes carries a new weight. How: This applies matUpdObj's own weight only when the key is present.



			if ( 'chargeStep' in matUpdObj ) nexIteObj.chargeStep = matUpdObj.chargeStep; // What: Charge Step Patch. Why: An updates row only sometimes carries a new chargeStep. How: This applies matUpdObj's own chargeStep only when the key is present.


		}



		if ( curIteObj.id === curPenObj.pickedId && curPenObj.bumpPick ) { // What: Pick Bump Guard. Why: Only the actually-picked item, and only when bumpPick was requested, gets its own picks/lastPicked bumped. How: This increments picks and stamps lastPicked on nexIteObj when both conditions hold.


			nexIteObj.picks = ( curIteObj.picks || 0 ) + 1; // What: Picks Increment. Why: The actually-picked item's own pick count must reflect this new pick. How: This increments nexIteObj.picks by 1.
			nexIteObj.lastPicked = nowIsoStr;               // What: Last Picked Stamp. Why: The actually-picked item's own last-picked timestamp must reflect this new pick. How: This sets nexIteObj.lastPicked to nowIsoStr.


		}



		return nexIteObj; // What: Next Item Return. Why: The caller needs this item's own patched copy. How: This returns nexIteObj, built above.


	} );


	const hasPipBoo = !!curPenObj.pickerPatch;                                                              // What: Has Picker-Patch Boolean. Why: The previous-active lookup below only snapshots activeItemId when a pickerPatch is actually being applied. How: This coerces curPenObj's own pickerPatch to a real boolean.
	const perRunStr = ( curEntObj.kind !== 'dayoff' && curEntObj.periodKey ) || null;                       // What: Period Run String. Why: Completing a non-daily pick or charging card is this picker's run for the period, which the cadence check must see even when no pick-log row exists. How: This is the entry's own periodKey, or null for a daily entry or a day-off card, whose completion never counts as a run.
	const curPicObj = curStaObj.pickers.find( ( picFinObj ) => picFinObj.id === curEntObj.pickerId ) || {}; // What: Current Picker Object. Why: Both revert snapshots below need the entry's own picker as it stands BEFORE this apply. How: This finds the picker by the entry's own pickerId, else an empty object.


	const praIdeStr = hasPipBoo // What: Previous-Active Identifier String. Why: The revert snapshot needs the picker's own activeItemId as it stood BEFORE this apply, but only when a pickerPatch is actually being applied. How: This looks up curEntObj's own picker and reads its current activeItemId, else stays undefined.
		? curPicObj.activeItemId // What: Picker Active Item Branch. Why: A pickerPatch is about to overwrite activeItemId, so its old value must be kept. How: This reads the entry's own picker's current activeItemId.
		: undefined;             // What: No Patch Branch. Why: Without a pickerPatch nothing about the picker changes. How: This leaves the value undefined, which enpRevFun reads as nothing to restore.


	const nexPatObj = { // What: Next Patch Object. Why: The staged pickerPatch and the recorded run period land on the picker together. How: This spreads pickerPatch (if any), then adds lastRunPeriod when perRunStr is set.


		...curPenObj.pickerPatch,                             // What: Picker Patch Spread. Why: The staged pickerPatch (e.g. Ease Down's activeItemId) is part of what the picker takes on completion. How: This spreads curPenObj's own pickerPatch, contributing nothing when there is none.
		...( perRunStr ? { lastRunPeriod : perRunStr } : {} ) // What: Run Period Spread. Why: A completed non-daily run must record its period on the picker. How: This adds lastRunPeriod only when perRunStr is set.


	};


	const nexPicArr = Object.keys( nexPatObj ).length // What: Next Picker Array. Why: Only a pending payload carrying pickerPatch (e.g. Ease Down's activeItemId) or a run period needs any picker actually rewritten. How: This patches curEntObj's own picker with nexPatObj's own fields, else passes pickers through unchanged.
		? curStaObj.pickers.map( ( picMapObj ) => picMapObj.id === curEntObj.pickerId ? { ...picMapObj, ...nexPatObj } : picMapObj ) // What: Patched Pickers Branch. Why: The entry's own picker takes the staged patch. How: This spreads nexPatObj onto the matching picker only.
		: curStaObj.pickers; // What: Unchanged Pickers Branch. Why: Without a patch nothing about the pickers changes. How: This passes the pickers through.


	const nexLogArr = curPenObj.depletedEnd // What: Next Log Array. Why: depletedEnd is a value consequence, so it's only recorded on the live log row once the pending payload is actually applied. How: This flags the live (no outcome) row sharing curEntObj's own eid, else passes pickLog through unchanged.
		? ( curStaObj.pickLog || [] ).map( ( curRowObj ) => ( curRowObj.eid === curEntObj.eid && !curRowObj.outcome ) ? { ...curRowObj, depletedEnd : true } : curRowObj ) // What: Depleted Flag Branch. Why: The live log row records that this pick ended a depletion streak. How: This flags only the entry's own live row.
		: ( curStaObj.pickLog || [] ); // What: Unchanged Log Branch. Why: Without depletedEnd the log stays as it is. How: This passes the pick log through, defaulting to an empty array.



	return { // What: Applied Pending Result Return. Why: The caller (togDonFun) needs the patched arrays plus a revert snapshot to stash on the entry. How: This bundles nexIteArr/nexPicArr/nexLogArr with a revert object capturing revIteArr/praIdeStr/the entry's own pickerId, plus the picker's previous lastRunPeriod when one was recorded.


		items   : nexIteArr, // What: Items. Why: The caller writes the patched items back to state. How: This is nexIteArr.
		pickers : nexPicArr, // What: Pickers. Why: The caller writes the patched pickers back to state. How: This is nexPicArr.
		pickLog : nexLogArr, // What: Pick Log. Why: The caller writes the updated pick log back to state. How: This is nexLogArr.

		revert : { // What: Revert. Why: The entry must be able to undo this apply exactly. How: This snapshots the touched items, the picker's previous activeItemId, and its previous lastRunPeriod when a run period was recorded.


			activeItemId : praIdeStr,          // What: Active Item Id. Why: An applied pickerPatch may have moved the picker's active item. How: This is praIdeStr, undefined when there was no pickerPatch.
			items        : revIteArr,          // What: Items. Why: Every touched item needs its own pre-apply fields back. How: This is revIteArr.
			pickerId     : curEntObj.pickerId, // What: Picker Id. Why: The revert must know which picker to restore. How: This is the entry's own pickerId.

			...( perRunStr ? { lastRunPeriod : curPicObj.lastRunPeriod || null } : {} ) // What: Last Run Period Spread. Why: Unchecking a non-daily run must restore the period the picker last ran in. How: This snapshots the previous lastRunPeriod, null when it never ran, only when this apply recorded one.


		}


	};


}

// #endregion enpAplFun



// #region enpRevFun

/**
 * enpRevFun = Entry-Pending Revert Function
 *
 * @summary
 * Exactly undoes enpAplFun's own effect using the entry.revert
 * snapshot it recorded, restoring each touched item's own pre-apply
 * value/weight/picks/lastPicked/chargeStep and, when a pickerPatch was
 * applied, the picker's own prior activeItemId, plus its prior
 * lastRunPeriod when the apply recorded one.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curStaObj - Current State Object: The current state, read (not
 *                    mutated) for its own items/pickers/pickLog.
 * @param curEntObj - Current Entry Object: The Today entry being un-done,
 *                    whose own revert snapshot drives the restoration.
 *
 * @returns { items, pickers, pickLog } restored to their pre-apply
 * values, or the state's own arrays untouched when curEntObj has no
 * revert snapshot at all.
 *
 * @example
 * ```ts
 * enpRevFun(state, entry) // => { items, pickers, pickLog }
 * ```
 *
*/

function enpRevFun ( curStaObj, curEntObj ) {


	const curRevObj = curEntObj.revert; // What: Current Revert Object And Guard. Why: Every restoration below is driven entirely by this entry's own recorded snapshot. How: This reads curEntObj's own revert field.


	if ( !curRevObj ) return { // What: No-Revert Guard. Why: An entry that was never applied (or already reverted) has nothing to restore. How: This returns the state's own arrays untouched.


		items   : curStaObj.items,        // What: Items. Why: Nothing is reverted, so the items stay as they are. How: This passes curStaObj's own items through.
		pickers : curStaObj.pickers,      // What: Pickers. Why: Nothing is reverted, so the pickers stay as they are. How: This passes curStaObj's own pickers through.
		pickLog : curStaObj.pickLog || [] // What: Pick Log. Why: Callers always expect an array here. How: This passes the pick log through, defaulting to an empty array.


	};



	const revIdeMap = new Map( curRevObj.items.map( ( curSnaObj ) => [ curSnaObj.id, curSnaObj ] ) ); // What: Revert Identifier Map. Why: The items map below needs O(1) lookup of each item's own pre-apply snapshot. How: This maps every curRevObj.items row by its own id.

	const nexIteArr = curStaObj.items.map( ( curIteObj ) => { // What: Next Item Array. Why: Every item must be checked for a matching snapshot to restore. How: This maps curStaObj.items, restoring a matched item's own value/weight/picks/lastPicked/chargeStep, else leaving it unchanged.


		const matRevObj = revIdeMap.get( curIteObj.id ); // What: Matched Revert Object And Guard. Why: Only items this snapshot actually covers get restored. How: This looks up curIteObj's own id in revIdeMap, undefined when it wasn't touched.



		return matRevObj // What: Restored Item Return. Why: The caller needs either the restored copy or the item untouched. How: This spreads curIteObj with matRevObj's own fields when matched, else returns curIteObj as-is.
			? { ...curIteObj, chargeStep : matRevObj.chargeStep, lastPicked : matRevObj.lastPicked, picks : matRevObj.picks, value : matRevObj.value, weight : matRevObj.weight } // What: Restored Item Branch. Why: A matched item gets its snapshot fields back. How: This spreads the snapshot's own fields over curIteObj.
			: curIteObj; // What: Untouched Item Branch. Why: An item with no snapshot never changed. How: This returns curIteObj as it is.


	} );


	const resPatObj = { // What: Restore Patch Object. Why: Each picker field the apply snapshotted must come back, and only those. How: This collects activeItemId when it was recorded and lastRunPeriod when the snapshot carries one, so a snapshot saved before lastRunPeriod existed restores exactly as it did.


		...( curRevObj.activeItemId !== undefined ? { activeItemId : curRevObj.activeItemId } : {} ), // What: Active Item Spread. Why: A recorded previous activeItemId must be restored. How: This adds activeItemId only when the snapshot recorded one.
		...( 'lastRunPeriod' in curRevObj ? { lastRunPeriod : curRevObj.lastRunPeriod } : {} )        // What: Last Run Period Spread. Why: A recorded previous run period must be restored, including null for a picker that had never run. How: This adds lastRunPeriod only when the snapshot carries the key.


	};


	const nexPicArr = Object.keys( resPatObj ).length // What: Next Picker Array. Why: Only a snapshot that actually recorded a picker field needs any picker rewritten back. How: This restores resPatObj onto curRevObj's own pickerId, else passes pickers through unchanged.
		? curStaObj.pickers.map( ( picMapObj ) => picMapObj.id === curRevObj.pickerId ? { ...picMapObj, ...resPatObj } : picMapObj ) // What: Restored Pickers Branch. Why: The entry's own picker gets its previous fields back. How: This spreads resPatObj onto the matching picker only.
		: curStaObj.pickers; // What: Unchanged Pickers Branch. Why: With nothing recorded there is nothing to restore. How: This passes the pickers through.


	const nexLogArr = ( curStaObj.pickLog || [] ).map( ( curRowObj ) => // What: Next Log Array. Why: A reverted day no longer counts as ending an Ease Down depletion streak. How: This strips depletedEnd back to false on the live (no outcome) row sharing curEntObj's own eid.
		( curRowObj.eid === curEntObj.eid && !curRowObj.outcome ) ? { ...curRowObj, depletedEnd : false } : curRowObj ); // What: Depleted Flag Clear. Why: Only the entry's own live row carried the flag. How: This sets depletedEnd back to false on that row and passes every other row through.



	return { items : nexIteArr, pickers : nexPicArr, pickLog : nexLogArr }; // What: Reverted Result Return. Why: The caller (togDonFun/skiEntFun/swaIteFun) needs the restored arrays. How: This bundles nexIteArr/nexPicArr/nexLogArr together.


}

// #endregion enpRevFun



// #region cotAplFun

/**
 * cotAplFun = Conditional-Toggle Apply Function
 *
 * @summary
 * Resolves the conditional consequences of toggling one Today entry
 * done/undone. A day-off CARD entry (kind:'dayoff') drives its own
 * conditional's carComFun (ease-up/dynamic reset, ease-down
 * discharge) with an undo snapshot in _cardPrev. A dependent PICKER
 * entry (whose own picker.conditionalId is set) advances its
 * conditional's own value on the FIRST dependent completion of the day
 * (the 0-to-1 count edge), and reverts when the count returns to 0,
 * with an undo snapshot in _chargePrev. _cardPrev/_chargePrev are real
 * persisted fields on the conditional, not local bookkeeping.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curStaObj - Current State Object: The current state, read (not
 *                    mutated) for its own pickers/conditionals.
 * @param nexEntArr - Next Entry Array: today.entries AFTER this toggle has
 *                    already been applied to it, used to count dependent
 *                    completions.
 * @param togEntObj - Toggle Entry Object: The entry that was just toggled.
 * @param nowDonBoo - Now Done Boolean: Whether togEntObj is now done (true)
 *                     or was just un-done (false).
 *
 * @returns The updated conditionals array, or the same reference when
 * nothing about it actually changes.
 *
 * @example
 * ```ts
 * cotAplFun(state, nextEntries, entry, true) // => conditionals
 * ```
 *
*/

function cotAplFun ( curStaObj, nexEntArr, togEntObj, nowDonBoo ) {


	const curConArr = curStaObj.conditionals || []; // What: Current Conditionals Array And Guard. Why: Every branch below reads/maps over the live conditionals list. How: This reads curStaObj's own conditionals, defaulting to empty.


	if ( !curConArr.length ) return curConArr; // What: No-Conditionals Guard. Why: An app with no conditionals at all has nothing to resolve. How: This returns curConArr unchanged when it's empty.



	const conModObj = CON_NAM_OBJ; // What: Conditional Module Object. Why: Every branch below repeatedly calls into this module's own resolution helpers. How: This aliases the imported CON_NAM_OBJ namespace for brevity below.


	if ( togEntObj.kind === 'dayoff' && togEntObj.conditionalId ) { // What: Day-Off Card Branch. Why: A day-off card entry's own completion drives its conditional's carComFun instead of the dependent-picker charging logic below. How: This maps curConArr, resolving only the one matching conditional.


		return curConArr.map( ( curConObj ) => { // What: Card Toggle Conditionals Map. Why: Every conditional except the one matching togEntObj.conditionalId must pass through untouched, while the matching one needs its own day-off completion/reversion resolved. How: This maps curConArr, guarding on id first, then branching on nowDonBoo to apply carComFun's own patch (completion) or restore the earlier _cardPrev snapshot (reversion).


			if ( curConObj.id !== togEntObj.conditionalId ) return curConObj; // What: Non-Matching Guard. Why: Every other conditional is untouched by this card's own toggle. How: This returns curConObj unchanged when its own id doesn't match.



			if ( nowDonBoo ) { // What: Now-Done Branch. Why: Completing the card is what actually drives its own mode-specific completion effect. How: This calls carComFun and snapshots the pre-effect fields into _cardPrev before applying its own patch.


				const patValObj = conModObj.carComFun( curConObj ); // What: Patch Value Object And Guard. Why: Some modes (probability) treat completion as informational only, returning no patch. How: This calls conModObj's own carComFun on curConObj.


				if ( !patValObj ) return curConObj; // What: No-Patch Guard. Why: A probability-mode card has nothing to actually mutate on completion. How: This returns curConObj unchanged when patValObj is falsy.



				return { ...curConObj, _cardPrev : { chargeStep : curConObj.chargeStep, triggered : curConObj.triggered, value : curConObj.value }, ...patValObj }; // What: Applied Card Patch Return. Why: The caller needs curConObj patched, with its own pre-effect fields snapshotted for undo. How: This spreads curConObj, its own _cardPrev snapshot, then patValObj's own fields.


			}



			const preSnaObj = curConObj._cardPrev; // What: Previous Snapshot Object And Guard. Why: Un-completing the card only makes sense if it actually recorded a snapshot to restore. How: This reads curConObj's own _cardPrev field.


			if ( !preSnaObj ) return curConObj; // What: No-Snapshot Guard. Why: A card that was never completed (or already reverted) has nothing to restore. How: This returns curConObj unchanged when preSnaObj is falsy.



			const { _cardPrev : carPreObj, ...remFieObj } = curConObj; // What: Remaining Fields Object. Why: The restored object below must drop the now-consumed _cardPrev snapshot. How: This destructures _cardPrev off curConObj as carPreObj, which goes unused, keeping every other field in remFieObj.



			return { ...remFieObj, chargeStep : preSnaObj.chargeStep, triggered : preSnaObj.triggered, value : preSnaObj.value }; // What: Restored Card Return. Why: The caller needs curConObj's own pre-completion fields restored exactly. How: This spreads remFieObj, overriding value/triggered/chargeStep from preSnaObj.


		} );


	}



	const curPicObj = curStaObj.pickers.find( ( picFinObj ) => picFinObj.id === togEntObj.pickerId ); // What: Current Picker Object And Guard. Why: A dependent entry's own conditional is looked up through its picker, not the entry itself. How: This looks up togEntObj's own pickerId in curStaObj.pickers.
	const conIdeStr = curPicObj && curPicObj.conditionalId;                                           // What: Conditional Identifier String And Guard. Why: An entry whose picker has no conditionalId gates nothing. How: This reads curPicObj's own conditionalId, or stays falsy when curPicObj is missing.


	if ( !conIdeStr ) return curConArr; // What: No-Conditional Guard. Why: An ungated picker's entry has no dependent conditional to charge. How: This returns curConArr unchanged when conIdeStr is falsy.



	const depDonNum = nexEntArr.filter( ( curEntObj ) => { // What: Dependent Done Number. Why: The charging edge below only fires on the FIRST dependent completion of the day, so every OTHER done dependent entry for this same conditional must be counted. How: This counts entries (excluding day-off cards) whose own picker shares conIdeStr and are done.


		if ( curEntObj.kind === 'dayoff' || !curEntObj.done ) return false; // What: Non-Dependent Guard. Why: A day-off card, or an entry that isn't done, never counts as a dependent completion. How: This excludes both cases from the count.



		const matPicObj = curStaObj.pickers.find( ( picFinObj ) => picFinObj.id === curEntObj.pickerId ); // What: Matched Picker Object And Guard. Why: Only an entry whose own picker shares this exact conditional counts. How: This looks up curEntObj's own pickerId in curStaObj.pickers.



		return matPicObj && matPicObj.conditionalId === conIdeStr; // What: Dependent Match Return. Why: The filter above needs a plain boolean verdict. How: This is true only when matPicObj exists and shares conIdeStr.


	} ).length; // What: Match Count Read. Why: The caller only needs how many entries matched. How: This reads the filtered array's own length.



	return curConArr.map( ( curConObj ) => { // What: Charged Conditionals Return. Why: Only the one matching value-mode conditional can advance or revert here. How: This maps curConArr, resolving the charging/reverting edges for the matching conditional only.


		if ( curConObj.id !== conIdeStr || !conModObj.modValFun( curConObj.mode ) ) return curConObj; // What: Non-Matching Guard. Why: Every other conditional, and a non-value-mode match, is untouched here. How: This returns curConObj unchanged when either condition holds.



		if ( nowDonBoo && depDonNum === 1 && !curConObj.chargedToday ) { // What: Charging-Edge Branch. Why: The FIRST dependent completion of an as-yet-uncharged day is what actually advances the conditional's own value. How: This calls advValFun and snapshots the pre-effect fields into _chargePrev before applying its own patch.


			const patValObj = conModObj.advValFun( curConObj ); // What: Patch Value Object And Guard. Why: Some modes may decline to advance at all. How: This calls conModObj's own advValFun on curConObj.


			if ( !patValObj ) return curConObj; // What: No-Patch Guard. Why: A decline to advance leaves curConObj with nothing to mutate. How: This returns curConObj unchanged when patValObj is falsy.



			return { ...curConObj, _chargePrev : { chargedToday : curConObj.chargedToday, chargeStep : curConObj.chargeStep, triggered : curConObj.triggered, value : curConObj.value }, ...patValObj }; // What: Applied Charge Patch Return. Why: The caller needs curConObj patched, with its own pre-effect fields snapshotted for undo. How: This spreads curConObj, its own _chargePrev snapshot, then patValObj's own fields.


		}



		const nowUndBoo = !nowDonBoo;            // What: Now Undone Boolean. Why: Only an un-done toggle can revert an earlier charge. How: This negates nowDonBoo.
		const depZerBoo = depDonNum === 0;       // What: Dependents Zero Boolean. Why: The charge only reverts once the LAST dependent completion of the day is un-done. How: This is true when depDonNum is 0.
		const hasPreBoo = curConObj._chargePrev; // What: Has Previous Boolean. Why: There's nothing to restore unless the charge left its own snapshot. How: This reads curConObj's own _chargePrev, truthy when a snapshot exists.

		const revEdgBoo = nowUndBoo && depZerBoo && hasPreBoo; // What: Reverting Edge Boolean. Why: The earlier charge must be undone only when all three checks above hold at once. How: This combines nowUndBoo, depZerBoo and hasPreBoo.


		if ( revEdgBoo ) { // What: Reverting-Edge Branch. Why: Once the LAST dependent completion of the day is un-done, the earlier charge must be undone too. How: This restores curConObj's own pre-charge fields from _chargePrev.


			const preSnaObj = curConObj._chargePrev; // What: Previous Snapshot Object. Why: The restoration below needs the exact pre-charge fields recorded earlier. How: This reads curConObj's own _chargePrev field.

			const { _chargePrev : chrPreObj, ...remFieObj } = curConObj; // What: Remaining Fields Object. Why: The restored object below must drop the now-consumed _chargePrev snapshot. How: This destructures _chargePrev off curConObj as chrPreObj, which goes unused, keeping every other field in remFieObj.



			return { ...remFieObj, chargedToday : preSnaObj.chargedToday, chargeStep : preSnaObj.chargeStep, triggered : preSnaObj.triggered, value : preSnaObj.value }; // What: Restored Charge Return. Why: The caller needs curConObj's own pre-charge fields restored exactly. How: This spreads remFieObj, overriding value/triggered/chargedToday/chargeStep from preSnaObj.


		}



		return curConObj; // What: Unchanged Conditional Return. Why: Neither edge condition applied, so curConObj passes through untouched. How: This returns curConObj as-is.


	} );


}

// #endregion cotAplFun



// #region cdlAplFun

/**
 * cdlAplFun = Conditional-Log Apply Function
 *
 * @summary
 * Mirrors cotAplFun's own completion edges, but records ONE
 * row per conditional per cycle (keyed condId + ISO day) in
 * state.conditionalLog instead of mutating the conditional itself. A
 * day-off CARD completion always logs triggered:true; the FIRST
 * dependent completion of an untriggered cycle logs triggered:false
 * (the "evaluated but didn't fire" denominator). An inactive
 * conditional (active:false) logs nothing. Undo removes the cycle's own
 * row once the confirming completion is gone. Rows denormalize name and
 * mode so the log survives edits/deletes.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curStaObj - Current State Object: The current state, read (not
 *                    mutated) for its own pickers/conditionals/conditionalLog.
 * @param nexEntArr - Next Entry Array: today.entries AFTER this toggle has
 *                    already been applied to it, used to count dependent
 *                    completions.
 * @param togEntObj - Toggle Entry Object: The entry that was just toggled.
 * @param nowDonBoo - Now Done Boolean: Whether togEntObj is now done (true)
 *                     or was just un-done (false).
 *
 * @returns The updated conditionalLog array, or the same reference when
 * nothing about it actually changes.
 *
 * @example
 * ```ts
 * cdlAplFun(state, nextEntries, entry, true) // => conditionalLog
 * ```
 *
*/

function cdlAplFun ( curStaObj, nexEntArr, togEntObj, nowDonBoo ) {


	const curLogArr = curStaObj.conditionalLog || []; // What: Current Log Array. Why: Every branch below either returns this untouched or derives a new array from it. How: This reads curStaObj's own conditionalLog, defaulting to empty.
	const curConArr = curStaObj.conditionals || [];   // What: Current Conditionals Array And Guard. Why: The lookups below need the live conditionals list. How: This reads curStaObj's own conditionals, defaulting to empty.


	if ( !curConArr.length ) return curLogArr; // What: No-Conditionals Guard. Why: An app with no conditionals at all has nothing to log. How: This returns curLogArr unchanged when curConArr is empty.



	let conIdeStr = null; // What: Conditional Identifier String And Guard. Why: Both branches below need somewhere to record which conditional (if any) this toggle concerns. How: This starts null and is set by whichever branch below actually matches.
	let trgValBoo = null; // What: Triggered Value Boolean And Guard. Why: Both branches below need somewhere to record whether this toggle counts as triggered. How: This starts null and is set alongside conIdeStr by whichever branch below actually matches.


	if ( togEntObj.kind === 'dayoff' && togEntObj.conditionalId ) { // What: Day-Off Card Branch. Why: A day-off card's own completion always logs as triggered. How: This sets conIdeStr/trgValBoo directly from togEntObj.


		conIdeStr = togEntObj.conditionalId; // What: Conditional Id String Set. Why: A day-off card's own log entry names the exact conditional it belongs to. How: This sets conIdeStr to togEntObj's own conditionalId.
		trgValBoo = true;                    // What: Trigger Value Boolean Set. Why: A day-off card's own completion always counts as triggered. How: This sets trgValBoo true.


	}

	else if ( togEntObj.pickerId ) { // What: Dependent Picker Branch. Why: A dependent entry's own conditional is looked up through its picker, and always logs as not-yet-triggered. How: This looks up the picker and, if gated, sets conIdeStr/trgValBoo.


		const curPicObj = curStaObj.pickers.find( ( picFinObj ) => picFinObj.id === togEntObj.pickerId ); // What: Current Picker Object And Guard. Why: Only a gated picker's entry logs anything at all. How: This looks up togEntObj's own pickerId in curStaObj.pickers.


		if ( curPicObj && curPicObj.conditionalId ) { // What: Gated-Picker Guard. Why: An ungated picker's entry logs nothing. How: This sets conIdeStr/trgValBoo only when curPicObj exists and carries a conditionalId.


			conIdeStr = curPicObj.conditionalId; // What: Conditional Id String Set. Why: The log entry needs to know which conditional this dependent picker is actually gated by. How: This sets conIdeStr to curPicObj's own conditionalId.
			trgValBoo = false;                   // What: Trigger Value Boolean Set. Why: A dependent entry always logs as not-yet-triggered. How: This sets trgValBoo false.


		}


	}



	if ( !conIdeStr ) return curLogArr; // What: No-Match Guard. Why: Neither branch above found a conditional to log against. How: This returns curLogArr unchanged when conIdeStr is still null.



	const curConObj = curConArr.find( ( conFinObj ) => conFinObj.id === conIdeStr ); // What: Current Conditional Object And Guard. Why: An inactive conditional must log nothing at all. How: This looks up conIdeStr in curConArr.


	if ( !curConObj || curConObj.active === false ) return curLogArr; // What: Inactive Guard. Why: An inactive conditional (or one that vanished) runs no logic and logs nothing. How: This returns curLogArr unchanged when curConObj is missing or explicitly inactive.



	const curDayStr = isoDayFun();                                                                                       // What: Current Day String. Why: A conditionalLog row is keyed by conditional id plus this exact calendar day. How: This reads today's own isoDayFun().
	const exiRowObj = curLogArr.find( ( curRowObj ) => curRowObj.condId === conIdeStr && curRowObj.date === curDayStr ); // What: Existing Row Object And Guard. Why: Only one row per conditional per cycle is ever kept. How: This looks up an existing row sharing conIdeStr and curDayStr.


	const depDonFun = () => nexEntArr.filter( ( curEntObj ) => { // What: Dependent Done Function. Why: Both branches below need to know how many dependent entries for this exact conditional are currently done. How: This counts entries (excluding day-off cards) whose own picker shares conIdeStr and are done.


		if ( curEntObj.kind === 'dayoff' || !curEntObj.done ) return false; // What: Non-Dependent Guard. Why: A day-off card, or an entry that isn't done, never counts as a dependent completion. How: This excludes both cases from the count.



		const matPicObj = curStaObj.pickers.find( ( picFinObj ) => picFinObj.id === curEntObj.pickerId ); // What: Matched Picker Object And Guard. Why: Only an entry whose own picker shares this exact conditional counts. How: This looks up curEntObj's own pickerId in curStaObj.pickers.



		return matPicObj && matPicObj.conditionalId === conIdeStr; // What: Dependent Match Return. Why: The filter above needs a plain boolean verdict. How: This is true only when matPicObj exists and shares conIdeStr.


	} ).length; // What: Match Count Read. Why: The caller only needs how many entries matched. How: This reads the filtered array's own length.


	if ( nowDonBoo ) { // What: Now-Done Branch. Why: A completion may add a new row, subject to the one-row-per-cycle and first-dependent rules. How: This either returns curLogArr unchanged or appends one fresh row.


		if ( exiRowObj ) return curLogArr; // What: One-Row-Per-Cycle Guard. Why: This cycle already has its own row; a second completion mustn't duplicate it. How: This returns curLogArr unchanged when exiRowObj already exists.



		if ( !trgValBoo && depDonFun() !== 1 ) return curLogArr; // What: First-Dependent Guard. Why: An untriggered cycle only logs on its FIRST dependent completion, not every subsequent one. How: This returns curLogArr unchanged when trgValBoo is false and depDonFun() isn't exactly 1.



		return [ // What: Appended Row Return. Why: The caller needs this cycle's own new row appended. How: This appends one row shaped to state.conditionalLog's own contract.


			...curLogArr, // What: Current Log Spread. Why: Every earlier row must stay in place. How: This spreads curLogArr first.

			{ // What: New Row Object. Why: This is the cycle's own new conditional-log row. How: Its fields below follow state.conditionalLog's contract.


				condId    : conIdeStr,      // What: Conditional Identifier. Why: The row must name the conditional it belongs to. How: This is conIdeStr.
				date      : curDayStr,      // What: Date. Why: The Stats tab groups conditional history by day. How: This is today's own ISO date.
				id        : nclIdeFun(),    // What: Identifier. Why: Every log row needs its own unique id. How: This draws the next conditional-log id.
				mode      : curConObj.mode, // What: Mode. Why: Log rows denormalize the mode so history survives a later mode change. How: This copies the conditional's own mode.
				name      : curConObj.name, // What: Name. Why: Log rows denormalize the name so history survives a rename. How: This copies the conditional's own name.
				triggered : trgValBoo       // What: Triggered. Why: This records whether the gate fired this cycle. How: This is trgValBoo.


			}


		];


	}



	if ( !exiRowObj ) return curLogArr; // What: No-Existing-Row Guard. Why: Un-doing a completion that never actually logged a row has nothing to remove. How: This returns curLogArr unchanged when exiRowObj is missing.



	if ( !trgValBoo && depDonFun() > 0 ) return curLogArr; // What: Still-Confirmed Guard. Why: Another dependent completion still stands, so this cycle's own row must stay. How: This returns curLogArr unchanged when trgValBoo is false and depDonFun() is still above 0.



	return curLogArr.filter( ( curRowObj ) => !( curRowObj.condId === conIdeStr && curRowObj.date === curDayStr ) ); // What: Row-Removed Return. Why: The confirming completion is gone, so this cycle's own row must be dropped. How: This filters out the one row sharing conIdeStr and curDayStr.


}

// #endregion cdlAplFun

// #endregion Helpers



// #region Exports

export { cdlAplFun, cotAplFun, enpAplFun, enpRevFun, spuDroFun }; // What: Named Exports. Why: The Today and item actions stage, apply, and revert pick consequences through these. How: This exports the 5 mechanism functions by name; the conditional-log id generator stays private to this file.

// #endregion Exports


