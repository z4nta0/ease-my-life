


// #region Imports

import React from 'react'; // What: React. Why: The draft is held in React state so every edit re-renders the editor showing it. How: This is used directly (React.useState).

// #endregion Imports



/**
 * item-draft.js = Item Draft
 *
 * @summary
 * The local working copy behind every item editor. An editor edits this copy
 * instead of the real item, so nothing reaches the store, or storage, until
 * the editor commits: an unsaved edit simply disappears on Cancel, a tab
 * switch, or a reload. Committing pushes only the fields that actually
 * changed, each through the same action that already owns that field, so a
 * rename is still de-duplicated, an Active toggle still logs to the
 * vacation log, and a value or ease change still clears a stale pending
 * mutation.
 *
 * Sections:
 *  - Hooks
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Hooks

// #region useIteDraFun

/**
 * useIteDraFun = Use Item Draft Function
 *
 * @summary
 * Holds a draft copy of whichever item is currently open for editing. The
 * draft starts as a copy of iteDatObj and starts over whenever a different
 * item (or no item) is passed in, so a caller only has to pass the item it
 * currently has open. patDraFun merges fields into the draft, and comDraFun
 * writes every field that differs from the item as it was when the draft
 * started back through tarActObj. Fields are compared against that starting
 * copy rather than the live item, so a value the app changed on its own while
 * the editor was open (a sibling entry's completion, say) is never overwritten
 * by the draft's stale copy of it.
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
 * useIteDraFun( actStoObj, curIteObj ) // => { comDraFun, draIteObj, patDraFun }
 * ```
 *
*/

function useIteDraFun( tarActObj, iteDatObj ) {


	const [ draStaObj, setDraStaObj ] = React.useState( { draIteObj : null, oriIteObj : null } ); // What: Draft State Object And Setter. Why: The draft and the item it started from must change together, in one update. How: This holds both, starting empty.



	// #region Draft Restart

	const opeIdeStr = iteDatObj ? iteDatObj.id : null;                                                    // What: Open Identifier String. Why: A different open item must start a fresh draft. How: This reads iteDatObj's own id, or null when nothing is open.
	const draIdeStr = draStaObj.oriIteObj ? draStaObj.oriIteObj.id : null;                                // What: Draft Identifier String. Why: The current draft must be tied to the item it started from. How: This reads the starting copy's own id, or null when there's no draft.
	const resDraObj = { draIteObj : iteDatObj ? { ...iteDatObj } : null, oriIteObj : iteDatObj || null }; // What: Restarted Draft Object. Why: A freshly opened item needs its own draft, copied from the item as it is now. How: This copies iteDatObj into a new draft beside the item itself.
	const curStaObj = opeIdeStr === draIdeStr ? draStaObj : resDraObj;                                    // What: Current State Object. Why: This render must already show the fresh draft, not wait for the update below. How: This picks the restarted draft whenever the open item changed.


	if ( curStaObj !== draStaObj ) setDraStaObj( curStaObj ); // What: Draft Restart Guard. Why: The restarted draft must also be kept for the renders after this one. How: This stores it, which React allows during render for state derived like this.

	// #endregion Draft Restart



	const patDraFun = ( patIteObj ) => setDraStaObj( ( preStaObj ) => preStaObj.draIteObj ? { ...preStaObj, draIteObj : { ...preStaObj.draIteObj, ...patIteObj } } : preStaObj ); // What: Patch Draft Function. Why: Every editor control changes a field or two of the draft, while a click landing on an editor already closing has no draft left to change. How: This merges patIteObj into the draft item, or leaves the state alone when there's no draft.



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


		const { draIteObj, oriIteObj } = curStaObj; // What: Draft And Original Destructure. Why: The comparison below needs both copies. How: This reads them from this render's own draft state.


		if ( !draIteObj || !oriIteObj ) return; // What: No Draft Guard. Why: With no item open there's nothing to commit. How: This bails out when either copy is missing.



		const namTriStr = String( draIteObj.name || '' ).trim(); // What: Name Trimmed String. Why: A committed name never keeps stray spaces, and an emptied one must not replace the real name. How: This trims the draft's own name.
		const patValObj = {};                                    // What: Patch Value Object. Why: The ease band and value all commit through one updIteFun call. How: This starts empty and gains each changed field below.


		[ 'easeMax', 'easeMin', 'value' ].forEach( ( fieKeyStr ) => { if ( draIteObj[ fieKeyStr ] !== oriIteObj[ fieKeyStr ] ) patValObj[ fieKeyStr ] = draIteObj[ fieKeyStr ]; } ); // What: Changed Value Fields Loop. Why: Only fields the user actually changed may be written, leaving any the app changed meanwhile alone. How: This copies each differing field into patValObj.



		if ( namTriStr && namTriStr !== oriIteObj.name ) tarActObj.renIteFun( oriIteObj.id, namTriStr ); // What: Rename Guard. Why: A changed, non-empty name must go through the de-duplicating rename. How: This calls renIteFun only then.



		if ( draIteObj.weight !== oriIteObj.weight ) tarActObj.setWeiFun( oriIteObj.id, draIteObj.weight ); // What: Weight Guard. Why: A changed weight must be written. How: This calls setWeiFun only then.



		if ( !!draIteObj.vacation !== !!oriIteObj.vacation ) tarActObj.togVacFun( oriIteObj.id, 'item' ); // What: Active Guard. Why: A flipped Active state must go through the toggle that also logs it for Stats. How: This calls togVacFun only when the state actually differs.



		if ( Object.keys( patValObj ).length ) tarActObj.updIteFun( oriIteObj.id, patValObj ); // What: Value Fields Guard. Why: Changed ease or value fields must be written together, clearing any stale pending mutation. How: This calls updIteFun only when patValObj holds something.


	};

	// #endregion comDraFun



	return { comDraFun, draIteObj : curStaObj.draIteObj, patDraFun }; // What: Draft Handle Return. Why: The caller's name input and editor both read the draft, patch it, and commit it. How: This returns the three together.


}

// #endregion useIteDraFun

// #endregion Hooks



// #region Exports

export { useIteDraFun }; // What: Named Export. Why: Every item editor (Today, Pickers, Data, the new-picker form) shares this draft. How: This exports useIteDraFun by name.

// #endregion Exports


