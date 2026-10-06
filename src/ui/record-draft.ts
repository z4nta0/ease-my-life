


// #region Imports

import React from 'react'; // What: React. Why: The draft is held in React state so every edit re-renders the editor showing it. How: This is used directly (React.useState).


import type { ActStoTyp } from '../state/store.ts';     // What: Action Store Type. Why: Each draft commits through a few of the store's actions. How: This types each hook's tarActObj as just the actions it calls.
import type { IteRcdTyp } from '../core/data-model.ts'; // What: Item Record Type. Why: An item editor drafts an item. How: This types useIteDraFun's item and draft.
import type { TasRcdTyp } from '../core/data-model.ts'; // What: Task Record Type. Why: A reminder editor drafts a reminder. How: This types useTasDraFun's reminder and draft.

// #endregion Imports



/**
 * record-draft.ts = Record Draft
 *
 * @summary
 * The local working copy behind every item and reminder editor. An editor
 * edits this copy instead of the real record, so nothing reaches the store,
 * or storage, until the editor commits: an unsaved edit simply disappears on
 * Cancel, a tab switch, or a reload. Committing pushes only the fields that
 * actually changed, each through the same action that already owns that
 * field, so a rename is still de-duplicated, an item's Active toggle still
 * logs to the vacation log, and an item's value or ease change still clears a
 * stale pending mutation.
 *
 * Sections:
 *  - Hooks
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Hooks

// #region useRcdDraFun

/**
 * useRcdDraFun = Use Record Draft Function
 *
 * @summary
 * Holds a draft copy of whichever record is currently open for editing. The
 * draft starts as a copy of rcdDatObj and starts over whenever a different
 * record (or no record) is passed in, so a caller only has to pass the record
 * it currently has open. The record as it was when the draft started is kept
 * beside it, so a commit can compare against that starting copy rather than
 * the live record, and a value the app changed on its own while the editor
 * was open (a sibling entry's completion, say) is never overwritten by the
 * draft's stale copy of it.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param rcdDatObj - Record Data Object: The record open for editing, or
 *                    null when no record is open.
 *
 * @returns The draft record, the record it started from, and a function
 * merging fields into the draft.
 *
 * @example
 * ```ts
 * useRcdDraFun(curTasObj) // => { draRcdObj, oriRcdObj, patDraFun }
 * ```
 *
*/

function useRcdDraFun< T extends { id : string } > ( rcdDatObj : T | null ) : { draRcdObj : T | null, oriRcdObj : T | null, patDraFun : ( patRcdObj : Partial< T > ) => void } {


	const [ draStaObj, setDraStaObj ] = React.useState< { draRcdObj : T | null, oriRcdObj : T | null } >( { draRcdObj : null, oriRcdObj : null } ); // What: Draft State Object And Setter. Why: The draft and the record it started from must change together, in one update. How: This holds both, starting empty.

	const opeIdeStr = rcdDatObj ? rcdDatObj.id : null;                     // What: Open Identifier String. Why: A different open record must start a fresh draft. How: This reads rcdDatObj's own id, or null when nothing is open.
	const draIdeStr = draStaObj.oriRcdObj ? draStaObj.oriRcdObj.id : null; // What: Draft Identifier String. Why: The current draft must be tied to the record it started from. How: This reads the starting copy's own id, or null when there's no draft.


	const resDraObj = { // What: Restarted Draft Object. Why: A freshly opened record needs its own draft, copied from the record as it is now. How: This copies rcdDatObj into a new draft beside the record itself.


		draRcdObj : rcdDatObj ? { ...rcdDatObj } : null, // What: Draft Record Object. Why: The editor must change a copy, never the real record. How: This spreads rcdDatObj into a new object, or is null when nothing is open.
		oriRcdObj : rcdDatObj || null                    // What: Original Record Object. Why: A commit compares the draft against the record as it was when the draft started. How: This keeps rcdDatObj itself, or null when nothing is open.


	};


	const curStaObj = opeIdeStr === draIdeStr ? draStaObj : resDraObj; // What: Current State Object. Why: This render must already show the fresh draft, not wait for the update below. How: This picks the restarted draft whenever the open record changed.


	if ( curStaObj !== draStaObj ) setDraStaObj( curStaObj ); // What: Draft Restart Guard. Why: The restarted draft must also be kept for the renders after this one. How: This stores it, which React allows during render for state derived like this.



	const patDraFun = ( patRcdObj : Partial< T > ) => setDraStaObj( ( preStaObj ) => preStaObj.draRcdObj ? { ...preStaObj, draRcdObj : { ...preStaObj.draRcdObj, ...patRcdObj } } : preStaObj ); // What: Patch Draft Function. Why: Every editor control changes a field or two of the draft, while a click landing on an editor already closing has no draft left to change. How: This merges patRcdObj into the draft record, or leaves the state alone when there's no draft.



	return { draRcdObj : curStaObj.draRcdObj, oriRcdObj : curStaObj.oriRcdObj, patDraFun }; // What: Draft Handle Return. Why: The caller's own commit needs both copies, and its editor controls need the patch function. How: This returns the draft, its starting copy, and patDraFun.


}

// #endregion useRcdDraFun



// #region useIteDraFun

/**
 * useIteDraFun = Use Item Draft Function
 *
 * @summary
 * An item editor's draft (see useRcdDraFun), plus comDraFun, which writes
 * every field that differs from the item as it was when the draft started
 * back through tarActObj.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tarActObj - Target Actions Object: {@link useAppStaFun}, or a
 *                    caller's own actions-shaped stand-in, exposing
 *                    renIteFun, setWeiFun, togVacFun, and updIteFun.
 * @param iteDatObj - Item Data Object: The item open for editing, or null
 *                    when no item is open.
 *
 * @returns The draft item, a function merging fields into it, and a
 * function committing it.
 *
 * @example
 * ```ts
 * useIteDraFun(actStoObj, curIteObj) // => { comDraFun, draIteObj, ... }
 * ```
 *
*/

function useIteDraFun ( tarActObj : Pick< ActStoTyp, 'renIteFun' | 'setWeiFun' | 'togVacFun' | 'updIteFun' >, iteDatObj : IteRcdTyp | null ) : { comDraFun : () => void, draIteObj : IteRcdTyp | null, patDraFun : ( patRcdObj : Partial< IteRcdTyp > ) => void } {


	const { draRcdObj, oriRcdObj, patDraFun } = useRcdDraFun( iteDatObj ); // What: Record Draft Destructure. Why: The item draft is a record draft with an item-specific commit. How: This calls useRcdDraFun with the open item.



	// #region comDraFun

	/**
	 * comDraFun = Commit Draft Function
	 *
	 * @summary
	 * Writes the draft back to the real item. Each field that differs from the
	 * item as it was when the draft started is sent through the action that
	 * owns it: the trimmed name through renIteFun (an emptied name is skipped,
	 * keeping the old one), the weight through setWeiFun, a changed Active
	 * state through togVacFun, and the ease band and value together through
	 * updIteFun. Nothing is sent when nothing changed.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * comDraFun() // => void
	 * ```
	 *
	*/

	const comDraFun = () => { // What: Commit Draft Function. Why: Save (or closing a Data tab row) must apply the draft's edits to the real item. How: This sends each changed field through the action that owns it.


		if ( !draRcdObj || !oriRcdObj ) return; // What: No Draft Guard. Why: With no item open there's nothing to commit. How: This bails out when either copy is missing.



		const namTriStr = String( draRcdObj.name || '' ).trim(); // What: Name Trimmed String. Why: A committed name never keeps stray spaces, and an emptied one must not replace the real name. How: This trims the draft's own name.

		const patValObj : Partial< IteRcdTyp > = {}; // What: Patch Value Object. Why: The ease band and value all commit through one updIteFun call. How: This starts empty and gains each changed field below.


		( [ 'easeMax', 'easeMin', 'value' ] as const ).forEach( ( fieKeyStr ) => { if ( draRcdObj[ fieKeyStr ] !== oriRcdObj[ fieKeyStr ] ) patValObj[ fieKeyStr ] = draRcdObj[ fieKeyStr ]; } ); // What: Changed Value Fields Loop. Why: Only fields the user actually changed may be written, leaving any the app changed meanwhile alone. How: This copies each differing field into patValObj, the names read as a constant tuple so each one indexes an item.



		if ( namTriStr && namTriStr !== oriRcdObj.name ) tarActObj.renIteFun( oriRcdObj.id, namTriStr ); // What: Rename Guard. Why: A changed, non-empty name must go through the de-duplicating rename. How: This calls renIteFun only then.



		if ( draRcdObj.weight !== oriRcdObj.weight ) tarActObj.setWeiFun( oriRcdObj.id, draRcdObj.weight ); // What: Weight Guard. Why: A changed weight must be written. How: This calls setWeiFun only then.



		if ( !!draRcdObj.vacation !== !!oriRcdObj.vacation ) tarActObj.togVacFun( oriRcdObj.id, 'item' ); // What: Active Guard. Why: A flipped Active state must go through the toggle that also logs it for Stats. How: This calls togVacFun only when the state actually differs.



		if ( Object.keys( patValObj ).length ) tarActObj.updIteFun( oriRcdObj.id, patValObj ); // What: Value Fields Guard. Why: Changed ease or value fields must be written together, clearing any stale pending mutation. How: This calls updIteFun only when patValObj holds something.


	};

	// #endregion comDraFun



	return { comDraFun, draIteObj : draRcdObj, patDraFun }; // What: Draft Handle Return. Why: The caller's name input and editor both read the draft, patch it, and commit it. How: This returns the three together.


}

// #endregion useIteDraFun



// #region useTasDraFun

/**
 * useTasDraFun = Use Task Draft Function
 *
 * @summary
 * A reminder editor's draft (see useRcdDraFun), plus comDraFun, which writes
 * every field that differs from the reminder as it was when the draft
 * started back through tarActObj: the trimmed name through renTasFun, which
 * de-duplicates it (an emptied name is skipped, keeping the old one), and
 * every other changed field together through updTasFun.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tarActObj - Target Actions Object: {@link useAppStaFun}, exposing
 *                    renTasFun and updTasFun.
 * @param tasDatObj - Task Data Object: The reminder open for editing, or null
 *                    when no reminder is open.
 *
 * @returns The draft reminder, a function merging fields into it, and a
 * function committing it.
 *
 * @example
 * ```ts
 * useTasDraFun(actStoObj, curTasObj) // => { comDraFun, draTasObj, ... }
 * ```
 *
*/

function useTasDraFun ( tarActObj : Pick< ActStoTyp, 'renTasFun' | 'updTasFun' >, tasDatObj : TasRcdTyp | null ) : { comDraFun : () => void, draTasObj : TasRcdTyp | null, patDraFun : ( patRcdObj : Partial< TasRcdTyp > ) => void } {


	const { draRcdObj, oriRcdObj, patDraFun } = useRcdDraFun( tasDatObj ); // What: Record Draft Destructure. Why: The reminder draft is a record draft with a reminder-specific commit. How: This calls useRcdDraFun with the open reminder.



	// #region comDraFun

	/**
	 * comDraFun = Commit Draft Function
	 *
	 * @summary
	 * Writes the draft back to the real reminder: a changed, non-empty trimmed
	 * name through renTasFun, then every other field that differs from the
	 * reminder's starting copy together through updTasFun. Nothing is sent when
	 * nothing changed.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * comDraFun() // => void
	 * ```
	 *
	*/

	const comDraFun = () => { // What: Commit Draft Function. Why: Save (or closing a Data tab row) must apply the draft's edits to the real reminder. How: This sends a changed name through renTasFun and every other changed field through updTasFun.


		if ( !draRcdObj || !oriRcdObj ) return; // What: No Draft Guard. Why: With no reminder open there's nothing to commit. How: This bails out when either copy is missing.



		const namTriStr = String( draRcdObj.name || '' ).trim(); // What: Name Trimmed String. Why: A committed name never keeps stray spaces, and an emptied one must not replace the real name. How: This trims the draft's own name.

		const patValObj : Record< string, unknown > = {}; // What: Patch Value Object. Why: Every changed field other than the name commits through one updTasFun call. How: This starts empty and gains each changed field below.


		( Object.keys( draRcdObj ) as ( keyof TasRcdTyp )[] ).forEach( ( fieKeyStr ) => { if ( fieKeyStr !== 'name' && JSON.stringify( draRcdObj[ fieKeyStr ] ) !== JSON.stringify( oriRcdObj[ fieKeyStr ] ) ) patValObj[ fieKeyStr ] = draRcdObj[ fieKeyStr ]; } ); // What: Changed Fields Loop. Why: Only fields the user actually changed may be written, leaving any the app changed meanwhile alone. How: This copies each differing field (arrays such as the weekdays compared by value) into patValObj, reading the draft's keys as reminder keys since Object.keys types them as plain strings.



		if ( namTriStr && namTriStr !== oriRcdObj.name ) tarActObj.renTasFun( oriRcdObj.id, namTriStr ); // What: Rename Guard. Why: A changed, non-empty name must go through the de-duplicating rename. How: This calls renTasFun only then.



		if ( Object.keys( patValObj ).length ) tarActObj.updTasFun( oriRcdObj.id, patValObj as Partial< TasRcdTyp > ); // What: Changed Fields Guard. Why: The schedule edits must be written together. How: This calls updTasFun only when patValObj holds something, passing it as a reminder patch since it was copied field by field from the draft.


	};

	// #endregion comDraFun



	return { comDraFun, draTasObj : draRcdObj, patDraFun }; // What: Draft Handle Return. Why: The caller's name input and schedule editor both read the draft, patch it, and commit it. How: This returns the three together.


}

// #endregion useTasDraFun

// #endregion Hooks



// #region Exports

export { useIteDraFun, useTasDraFun }; // What: Named Exports. Why: Every item editor and every reminder editor edits through a draft like this. How: This exports both hooks by name.

// #endregion Exports


