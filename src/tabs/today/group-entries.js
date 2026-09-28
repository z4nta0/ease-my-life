


// #region Imports

import { ONB_CHE_OBJ } from '../../state/onboarding-checklist.js'; // What: Onboarding Checklist Object. Why: A sample picker keeps its launcher card only until its tutorial is done. How: This is called via ONB_CHE_OBJ.entLooFun.
import { ONB_SPI_ARR } from '../../state/onboarding-seed-data.js'; // What: Onboarding Sample-Picker-Ids Array. Why: Sample pickers get launcher cards instead of picked entries. How: This is checked with .includes for each picker.

// #endregion Imports



/**
 * group-entries.js = Group Entries
 *
 * @summary
 * Builds the Today list's grouped structure. groEntFun buckets today's entries
 * (real picks, day-off cards, charging cards and mini-tour launcher cards) by
 * their picker's group in the user's saved group and picker order, and
 * merOrdFun merges a drag-reordered subset back into a fuller saved ordering
 * without disturbing groups or pickers that have no entries today.
 *
 * Sections:
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Helpers

// #region groEntFun

/**
 * groEntFun = Group Entries Function
 *
 * @summary
 * Buckets today's entries (real picks, day-off cards, charging cards,
 * and mini-tour launcher cards) by their own picker's group, in the
 * user's own saved group/picker order, falling back to encounter order
 * for anything not yet positioned. See this file's own header comment
 * for the overall Today tab layout this feeds.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param staAppObj - State App Object: The shared app state, read for
 *                    today.entries, pickers, groupOrder, pickerOrder, and
 *                    onboarding.
 *
 * @returns An array of { entArr, namStr } group objects, in display
 * order, each already internally sorted.
 *
 * @example
 * ```ts
 * groEntFun(staAppObj) // => array of { entArr, namStr } groups
 * ```
 *
*/

function groEntFun ( staAppObj ) {


	// #region Bucket Picker/Day-Off Entries

	const groBucMap = new Map(); // What: Group Bucket Map. Why: Every entry below needs to land in its own group's bucket, created the first time that group is seen. How: This is read and populated by both loops in this region, keyed by group name.


	for ( const curEntObj of staAppObj.today.entries ) { // What: Today Entry Bucket Loop. Why: Every real entry (pick, day-off, charging) needs to land in its own picker's group. How: This walks staAppObj.today.entries, resolving each one's own picker and group before pushing it into groBucMap.


		if ( curEntObj.kind === 'dayoff' ) { // What: Day-Off Branch. Why: A day-off card has no real picker of its own, so it needs a synthetic picker-like row to slot into its group like any other entry. How: This builds that synthetic row and pushes it, then skips the normal picker lookup below entirely.


			const groNamStr = curEntObj.group || 'Other'; // What: Group Name String. Why: A day-off card still needs a real group to bucket into. How: This reads curEntObj's own group, falling back to 'Other'.


			if ( !groBucMap.has( groNamStr ) ) groBucMap.set( groNamStr, { entArr : [], namStr : groNamStr } ); // What: Group Bucket Init Guard. Why: The very first entry seen for a group must create its own bucket. How: This sets a fresh { name, entries } bucket only when groNamStr has none yet.



			groBucMap.get( groNamStr ).entArr.push( { entRecObj : curEntObj, picRecObj : { group : groNamStr, id : 'dayoff_' + curEntObj.conditionalId, name : curEntObj.cardText } } ); // What: Day-Off Row Push. Why: This is the synthetic row EntCarCom's own day-off branch renders. How: This pairs curEntObj with a picker-shaped stand-in carrying just enough fields (id/name/group/_dayoff) to sort and render like a real one.



			continue; // What: Day-Off Continue. Why: A day-off card has no real picker to look up below. How: This skips straight to the next entry.


		}



		const picRecObj = staAppObj.pickers.find( ( curPicObj ) => curPicObj.id === curEntObj.pickerId ); // What: Picker Record Object. Why: Every non-day-off entry needs its own picker resolved to know its group and to render its name. How: This finds the picker matching curEntObj's own pickerId.


		if ( !picRecObj || picRecObj.hidden ) continue; // What: Missing Or Hidden Picker Guard. Why: An entry whose picker was deleted, or is still hidden mid-onboarding, must not render at all. How: This skips curEntObj when picRecObj is missing or flagged hidden.



		const groNamStr = picRecObj.group || 'Other'; // What: Group Name String. Why: This entry needs a real group to bucket into. How: This reads picRecObj's own group, falling back to 'Other'.


		if ( !groBucMap.has( groNamStr ) ) groBucMap.set( groNamStr, { entArr : [], namStr : groNamStr } ); // What: Group Bucket Init Guard. Why: The very first entry seen for a group must create its own bucket. How: This sets a fresh { name, entries } bucket only when groNamStr has none yet.



		groBucMap.get( groNamStr ).entArr.push( { entRecObj : curEntObj, picRecObj : picRecObj } ); // What: Entry Row Push. Why: This is the real row EntCarCom renders. How: This pairs curEntObj with its own resolved picRecObj.


	}

	// #endregion Bucket Picker/Day-Off Entries



	// #region Mini-Tour Launcher Card Injection

	/**
	 * group-entries.js = Mini-Tour Launcher Card Injection
	 *
	 * @summary
	 * One launcher card per sample picker, slotted into its normal group
	 * like any other card. `p.hidden` gates the timing: samples stay
	 * visible/real for the main Welcome Tour and only flip hidden once, at
	 * that tour's last step (see onboarding/welcome-tour.jsx), which is
	 * when these start rendering. They stay on screen, checked or not,
	 * through the ORIGINAL first-time checklist, until checklistDone (set
	 * once the closing Generate card runs, see onboarding-checklist.js).
	 * Unlike checklistDone itself, this does NOT permanently stop once
	 * that happens: Settings' Replay Tour button (tab-settings.jsx) resets
	 * each item's own checklist entry (though never checklistDone), so a
	 * still-unresolved sample keeps offering its card afterward too,
	 * EXCLUDED if a real (non-sample) picker has since taken its exact
	 * name, since re-prompting "set up a Daily Chores picker" when the
	 * user already has their own real Daily Chores picker would be
	 * redundant, not helpful.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const cheDonBoo = !!( staAppObj.onboarding && staAppObj.onboarding.checklistDone ); // What: Checklist Done Boolean. Why: The collision exclusion described above only ever applies post-checklistDone. How: This reads staAppObj's own onboarding.checklistDone.


	for ( const curPicObj of staAppObj.pickers ) { // What: Sample Picker Card Loop. Why: One launcher card is needed per still-hidden, still-relevant sample picker. How: This walks every picker, skipping anything that isn't a currently-hidden sample.


		if ( !curPicObj.hidden || !ONB_SPI_ARR.includes( curPicObj.id ) ) continue; // What: Non-Sample Guard. Why: Only a hidden SAMPLE picker gets a launcher card at all. How: This skips any picker that is not hidden, or not one of the fixed sample ids.



		const isaDonBoo = !!ONB_CHE_OBJ.entLooFun( staAppObj, curPicObj.id ); // What: Is-A Done Boolean. Why: A card's own resolved/unresolved state decides both its own display and whether it should vanish post-checklistDone. How: This checks ONB_CHE_OBJ for an existing entry against this picker's own id.


		if ( cheDonBoo && isaDonBoo ) continue; // What: Replay Resolved Guard. Why: Post-checklistDone, a resolved card vanishes for good the moment it resolves instead of sticking around with an Undo toggle, since there is no closing Generate card left to synchronize a batch disappearance against. How: This drops curPicObj's own card once it is both post-checklistDone and already resolved.



		if ( cheDonBoo ) { // What: Replay Collision Branch. Why: Only matters post-checklistDone; during the ORIGINAL first-time checklist this must stay a no-op, since finishing this exact tutorial deliberately creates a real picker sharing the sample's own name (addPicFun's own dedup skips hidden pickers for this reason, see store.js), and running this check then would immediately "collide" with its own result. How: This checks for a same-named real picker and drops the card if one already exists.


			const namTakBoo = staAppObj.pickers.some( ( othPicObj ) => !ONB_SPI_ARR.includes( othPicObj.id ) && othPicObj.name === curPicObj.name ); // What: Name Taken Boolean. Why: A real picker sharing this sample's exact name means re-prompting it would be redundant. How: This checks every non-sample picker's own name against curPicObj's own name.


			if ( namTakBoo ) continue; // What: Collision Skip. Why: A colliding real picker means this sample's own card should stop offering itself. How: This drops curPicObj's own card once namTakBoo is true.


		}



		const groNamStr = curPicObj.group || 'Other'; // What: Group Name String. Why: A launcher card still needs a real group to bucket into, same as any other row. How: This reads curPicObj's own group, falling back to 'Other'.


		if ( !groBucMap.has( groNamStr ) ) groBucMap.set( groNamStr, { entArr : [], namStr : groNamStr } ); // What: Group Bucket Init Guard. Why: The very first entry seen for a group must create its own bucket. How: This sets a fresh { name, entries } bucket only when groNamStr has none yet.



		groBucMap.get( groNamStr ).entArr.push( { entRecObj : { done : isaDonBoo, eid : 'tut_' + curPicObj.id, kind : 'tutorial' }, picRecObj : curPicObj } ); // What: Tutorial Row Push. Why: This is the synthetic row EntCarCom's own tutorial branch renders. How: This pairs a synthetic { kind, eid, done } entry with the real curPicObj.


	}

	// #endregion Mini-Tour Launcher Card Injection



	// #region Compute Group Display Order

	const disOrdArr = [];                                                                // What: Display Order Array. Why: This collects the final group display order, built up by the three passes below. How: This is pushed to by each pass in turn, then filtered/mapped at the very end of this function.
	const savOrdArr = Array.isArray( staAppObj.groupOrder ) ? staAppObj.groupOrder : []; // What: Saved Order Array. Why: The user's own Edit Mode drags are the first, highest-priority source of group order. How: This reads staAppObj.groupOrder when it is a real array, otherwise an empty one.


	for ( const curGroStr of savOrdArr ) if ( groBucMap.has( curGroStr ) && !disOrdArr.includes( curGroStr ) ) disOrdArr.push( curGroStr ); // What: Saved Order Pass. Why: A group the user has already positioned keeps that position. How: This appends each saved group name that actually has a bucket and isn't already collected.



	for ( const curPicObj of staAppObj.pickers ) { // What: First-Occurrence Order Pass. Why: A group not yet in the saved order still needs a stable position, taken from wherever it first appears among the user's own pickers. How: This appends any not-yet-collected group the first time a picker names it.


		if ( curPicObj.group && groBucMap.has( curPicObj.group ) && !disOrdArr.includes( curPicObj.group ) ) disOrdArr.push( curPicObj.group ); // What: First-Occurrence Append. Why: This is the actual append this pass performs. How: This pushes curPicObj's own group once, the first time it is encountered.


	}



	if ( groBucMap.has( 'Other' ) && !disOrdArr.includes( 'Other' ) ) disOrdArr.push( 'Other' ); // What: Other Group Trailing Guard. Why: The catch-all "Other" group always sorts last when nothing else already positioned it. How: This appends 'Other' only when it has a bucket and isn't already in disOrdArr.

	// #endregion Compute Group Display Order



	// #region Sort Rows Within Each Group

	const savPioObj = ( staAppObj.pickerOrder && typeof staAppObj.pickerOrder === 'object' ) ? staAppObj.pickerOrder : {}; // What: Saved Picker-Order Object. Why: Within each group, rows follow the user's own saved per-group picker order. How: This reads staAppObj.pickerOrder when it is a real object, otherwise an empty one.



	return disOrdArr.filter( ( curGroStr ) => groBucMap.has( curGroStr ) ).map( ( curGroStr ) => { // What: Group Sort Map. Why: Every group in display order needs its own rows sorted before rendering. How: This maps each group name to its own bucket, sorted below.


		const groBucObj = groBucMap.get( curGroStr ); // What: Group Bucket Object. Why: This is the specific bucket being sorted in this iteration. How: This reads curGroStr's own bucket out of groBucMap.
		const posIndObj = {};                         // What: Position Index Object. Why: A row's own explicit saved position (if any) always wins, so it needs a fast lookup by picker id. How: This is populated just below from savPioObj's own entry for this group.


		( savPioObj[ curGroStr ] || [] ).forEach( ( picIdeStr, curIndNum ) => { posIndObj[ picIdeStr ] = curIndNum; } ); // What: Position Index Build. Why: Every saved picker id needs its own saved index recorded before the sort below can use it. How: This walks the saved per-group order, recording each picker id's own index.


		const posOrdFun = ( curRowObj ) => { // What: Position Order Function. Why: Sorting needs one numeric position per row: an explicit saved order always wins, so day-off/charging/tutorial cards can still be dragged anywhere; only a row with no stored position falls back to a default. How: This looks up curRowObj's own picker id in posIndObj first, otherwise defaults day-off/charging/tutorial rows to the top and regular picks to the end.


			if ( curRowObj.picRecObj.id in posIndObj ) return posIndObj[ curRowObj.picRecObj.id ]; // What: Explicit Position Branch. Why: A row the user has already positioned must sort exactly there. How: This returns its own saved index.



			return ( curRowObj.entRecObj.kind === 'dayoff' || curRowObj.entRecObj.kind === 'charging' || curRowObj.entRecObj.kind === 'tutorial' ) ? -1 : 1e6; // What: Default Position Branch. Why: An unpositioned special card defaults near the top; an unpositioned regular pick defaults to the end. How: This returns -1 for the three special kinds, otherwise a very large fallback number.


		};


		groBucObj.entArr.sort( ( rowOneObj, rowTwoObj ) => posOrdFun( rowOneObj ) - posOrdFun( rowTwoObj ) ); // What: Row Sort Call. Why: This actually orders the group's own rows before rendering. How: This sorts by posOrdFun's own numeric position; Array.prototype.sort is stable, so tied rows keep their original encounter order.



		return groBucObj; // What: Sorted Group Return. Why: The map above needs the now-sorted bucket back. How: This returns the same groBucObj object, mutated in place by the sort above.


	} );

	// #endregion Sort Rows Within Each Group


}

// #endregion groEntFun



// #region merOrdFun

/**
 * merOrdFun = Merge Order Function
 *
 * @summary
 * Merges a reordered subset of *present* keys back into a fuller
 * ordering that may also contain absent keys (groups/pickers with no
 * entries today). Present keys are dropped into their existing slots in
 * the new relative order; absent keys keep their positions; brand-new
 * present keys append at the end.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param fulOrdArr - Full Ordinal Array: The fuller, previously-saved
 *                    ordering, which may hold keys that are absent from
 *                    preNewArr entirely.
 * @param preNewArr - Previous New Array: The subset of keys that are present
 *                    today, already in their new, just-dragged relative order.
 *
 * @returns A single merged ordering array combining both inputs, per the
 * rule described above.
 *
 * @example
 * ```ts
 * merOrdFun(fulOrdArr, preNewArr) // => merged ordering array
 * ```
 *
*/

function merOrdFun ( fulOrdArr, preNewArr ) {


	// #region Dedupe Present Keys

	const preKeyArr = [];        // What: Present Key Array. Why: A synthetic day-off/charging id could otherwise be reintroduced twice by preNewArr; this collects each one only once. How: This is pushed to by the loop below, in first-seen order, which becomes the new order.
	const seeKeySet = new Set(); // What: Seen Key Set. Why: The loop below needs a fast way to tell whether a key was already collected. How: This is checked and added to by that same loop.


	for ( const curKeyStr of ( preNewArr || [] ) ) { // What: Present Key Dedupe Loop. Why: preNewArr may repeat a key; only its first occurrence should count. How: This walks every candidate key, skipping any already seen.


		if ( seeKeySet.has( curKeyStr ) ) continue; // What: Already Seen Guard. Why: A repeated key must not be collected a second time. How: This skips straight to the next candidate once curKeyStr is already in seeKeySet.



		seeKeySet.add( curKeyStr );  // What: Seen Key Record. Why: Every later occurrence of this same key must now read as a repeat. How: This adds curKeyStr to seeKeySet.
		preKeyArr.push( curKeyStr ); // What: Present Key Collect. Why: This key's own first-seen position is exactly where it belongs in the new order. How: This appends curKeyStr to preKeyArr.


	}

	// #endregion Dedupe Present Keys



	const preKeySet = new Set( preKeyArr ); // What: Present Key Set. Why: The splice loop below needs a fast membership check against every present key. How: This wraps preKeyArr in a Set.
	const resKeyArr = preKeyArr.slice();    // What: Result Key Array. Why: The final merged order starts as a copy of the present keys' own new order; absent keys are spliced back into this same array below. How: This copies preKeyArr so the splices below never mutate preKeyArr itself.


	// #region Splice Back Absent Keys

	const fulDefArr = fulOrdArr || []; // What: Full Default Array. Why: The caller may pass a nullish saved order. How: This falls back to an empty array so the loop below always has something safe to iterate.
	const offAncMap = new Map();       // What: Offset Anchor Map. Why: Several sibling absent keys can share the same preceding anchor, and each one must land right after the one before it, not all at the same spot. How: This tracks, per anchor, how many absent keys have already been spliced in after it.


	for ( let curIndNum = 0; curIndNum < fulDefArr.length; curIndNum++ ) { // What: Full Order Walk Loop. Why: Every key in the previously-saved order needs a chance to be restored if it is not already present. How: This walks fulDefArr by index so bacIndNum below can look backward from the same position.


		const basKeyStr = fulDefArr[ curIndNum ]; // What: Base Key String. Why: This is the specific saved-order key this iteration considers restoring. How: This reads fulDefArr at curIndNum.


		if ( preKeySet.has( basKeyStr ) || resKeyArr.includes( basKeyStr ) ) continue; // What: Already Placed Guard. Why: A present key was already collected above, and an absent key already spliced back in by an earlier iteration must not be duplicated. How: This skips basKeyStr once it is already accounted for either way.



		let ancKeyStr = null; // What: Anchor Key String. Why: An absent key is restored relative to the nearest PRESENT key before it in the saved order, not an absolute index. How: This starts null (meaning "insert at the very front") and is set by the backward walk just below.


		for ( let bacIndNum = curIndNum - 1; bacIndNum >= 0; bacIndNum-- ) { // What: Anchor Search Loop. Why: The nearest preceding present key is found by walking backward from this position. How: This walks bacIndNum down from curIndNum - 1 until a present key is found or the start is reached.


			if ( !preKeySet.has( fulDefArr[ bacIndNum ] ) ) continue; // What: Non-Present Skip Guard. Why: Only a PRESENT key can serve as an anchor. How: This keeps walking backward past any key that isn't in preKeySet.



			ancKeyStr = fulDefArr[ bacIndNum ]; // What: Anchor Key Assignment. Why: The nearest present predecessor has just been found. How: This records it into ancKeyStr.
			break;                              // What: Anchor Search Break. Why: Only the NEAREST anchor matters, so the walk stops as soon as one is found. How: This exits the backward loop immediately.


		}



		const curOffNum = offAncMap.get( ancKeyStr ) || 0; // What: Current Offset Number. Why: A second sibling sharing the same anchor must land one slot further along than the first, not on top of it. How: This reads however many keys have already been spliced in after ancKeyStr so far, defaulting to 0.


		if ( ancKeyStr === null ) resKeyArr.splice( curOffNum, 0, basKeyStr ); // What: Front Insert Branch. Why: No present key precedes this one at all, so it belongs at the very front (plus whatever offset its own siblings already claimed there). How: This splices basKeyStr into resKeyArr at index curOffNum.

		else resKeyArr.splice( resKeyArr.indexOf( ancKeyStr ) + 1 + curOffNum, 0, basKeyStr ); // What: Anchored Insert Branch. Why: This key belongs right after its nearest present anchor, offset past any sibling already placed there. How: This splices basKeyStr into resKeyArr right after ancKeyStr's own current position plus curOffNum.



		offAncMap.set( ancKeyStr, curOffNum + 1 ); // What: Offset Advance. Why: The NEXT sibling sharing this same anchor must land one slot further along still. How: This overwrites offAncMap's own entry for ancKeyStr with curOffNum plus 1.


	}

	// #endregion Splice Back Absent Keys



	return resKeyArr; // What: Merged Order Return. Why: The caller needs the final combined ordering. How: This returns the same array built by the dedupe and splice steps above.


}

// #endregion merOrdFun

// #endregion Helpers



// #region Exports

export { groEntFun, merOrdFun }; // What: Named Exports. Why: The Today tab builds its grouped list with groEntFun and saves Edit Mode reorders with merOrdFun. How: This exports both helpers by name.

// #endregion Exports


