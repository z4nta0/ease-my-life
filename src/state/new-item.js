


// #region Imports

import { PIC_NAM_OBJ } from '../core/pickers.js'; // What: Pickers Namespace Object. Why: An ease-mode item is stamped with its picker's average drift band. How: This is called via PIC_NAM_OBJ.aveEasFun.
import { uniNamFun   } from '../utils/format.js'; // What: Unique Name Function. Why: Two items in the same picker can't share a name. How: This de-duplicates the new item's name against its siblings.

// #endregion Imports



/**
 * new-item.js = New Item
 *
 * @summary
 * Builds a brand-new item with the defaults its picker's mode calls for,
 * without adding it anywhere. The store's own addIteFun adds what this
 * builds, and the Data tab uses the same build for a new item's local draft,
 * which only reaches the store once it's kept, so a draft and the item it
 * becomes always start from identical defaults.
 *
 * Sections:
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Helpers

// #region buiIteFun

/**
 * buiIteFun = Build Item Function
 *
 * @summary
 * Builds one brand-new item for picIdeStr's own pool. Ease Down items start
 * fully charged (value at threshold) and join the fairness rotation at the
 * AVERAGE weight of existing items (excluding the weight-0 active item, so a
 * fresh streak's own zero can't drag the newcomer down), rounded and floored
 * at 1 so it's never a second weight-0; with no peers yet, weight defaults to
 * 1. An ease-mode item is also stamped with this picker's own current average
 * drift band (see PIC_NAM_OBJ.aveEasFun). The name is de-duplicated against
 * the picker's other items.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param staAppObj - State App Object: The app state, read for the picker
 *                    and its existing items.
 * @param picIdeStr - Picker Identifier String: The picker gaining the item.
 * @param newNamStr - New Name String: The item's name.
 * @param optIdeStr - Optional Identifier String: An id to use instead of
 *                    minting a random one.
 *
 * @returns The new item, in state.items' own shape.
 * @see {@link newIteObj}
 *
 * @example
 * ```ts
 * buiIteFun( staAppObj, picIdeStr, 'New item' ) // => newIteObj
 * ```
 *
*/

function buiIteFun( staAppObj, picIdeStr, newNamStr, optIdeStr ) {




	const sibIteArr = staAppObj.items.filter( ( curIteObj ) => curIteObj.pickerId === picIdeStr );     // What: Sibling Item Array. Why: Both the name de-duplication and the ease-down weight averaging below need this picker's own existing items. How: This filters staAppObj.items to those owned by pickerId.
	const curPicObj = staAppObj.pickers.find( ( picFinObj ) => picFinObj.id === picIdeStr );           // What: Current Picker Object And Guard. Why: The mode checks below need this picker's own live mode. How: This looks up picIdeStr in staAppObj.pickers.
	const isaDowBoo = curPicObj && curPicObj.mode === 'ease-down';                                     // What: Is-A Down Boolean. Why: Only Ease Down needs the special charged-value/fairness-weight treatment below. How: This is true only when curPicObj exists and its own mode is 'ease-down'.
	const isaEasBoo = curPicObj && ( curPicObj.mode === 'ease-up' || curPicObj.mode === 'ease-down' ); // What: Is-An Ease Boolean. Why: Both ease modes need their own drift-band fields stamped below. How: This is true when curPicObj's own mode is either ease-up or ease-down.

	let weiValNum = 1; // What: Weight Value Number. Why: Every non-ease-down item just uses the plain default weight; only ease-down overrides it below. How: This starts at 1.
	let iniValNum = 0; // What: Initial Value Number. Why: Every non-ease-down item just uses the plain default value; only ease-down overrides it below. How: This starts at 0.


	if ( isaDowBoo ) { // What: Ease-Down Defaults Guard. Why: Only ease-down needs its own charged value and fairness-averaged weight computed. How: This overwrites iniValNum/weiValNum with the ease-down-specific computation below.


		iniValNum = curPicObj.threshold ?? 100; // What: Charged Value Set. Why: A new ease-down item starts fully charged, same as every other item in that mode. How: This reads curPicObj's own threshold, defaulting to 100.

		const perWeiArr = sibIteArr.map( ( curIteObj ) => curIteObj.weight ?? 1 ).filter( ( curWeiNum ) => curWeiNum > 0 ); // What: Peer Weight Array. Why: The average below must exclude the weight-0 active item, so a fresh streak's own zero can't drag the newcomer down. How: This maps sibIteArr to its own weights (defaulting 1), then drops any that are 0 or below.

		weiValNum = perWeiArr.length // What: Fairness Weight Average. Why: A brand-new item should join the rotation at roughly its peers' own average standing, not always at 1. How: This averages perWeiArr, rounds, and floors at 1, else falls back to 1 when there are no peers yet.
			? Math.max( 1, Math.round( perWeiArr.reduce( ( sumValNum, curValNum ) => sumValNum + curValNum, 0 ) / perWeiArr.length ) ) // What: Peer Average Branch. Why: Existing peers give a fair starting weight. How: This averages the peers' weights, rounded and floored at 1.
			: 1; // What: No Peers Branch. Why: A first item has no peers to average. How: This starts it at weight 1.


	}



	const newIteObj = { // What: New Item Object. Why: This is the actual item being added, in state.items' own shape. How: This bundles a fresh id, the de-duplicated name, pickerId, the resolved weight/value, and (for ease modes) a fresh drift band.


		id         : optIdeStr || ( 'it_' + Math.random().toString( 36 ).slice( 2, 8 ) ),      // What: Id. Why: Every item needs a stable id. How: This uses optIdeStr when given, else mints a random 'it_' id.
		lastPicked : null,                                                                     // What: Last Picked. Why: A brand-new item has never been picked. How: This is null.
		name       : uniNamFun( newNamStr, sibIteArr.map( ( curIteObj ) => curIteObj.name ) ), // What: Name. Why: Two items in the same picker can't share a name. How: This de-duplicates newNamStr against every sibling item's own name via uniNamFun.
		pickerId   : picIdeStr,                                                                // What: Picker Id. Why: Every item belongs to exactly one picker. How: This is picIdeStr.
		picks      : 0,                                                                        // What: Picks. Why: A brand-new item has never been picked. How: This is 0.
		vacation   : false,                                                                    // What: Vacation. Why: A brand-new item starts active. How: This is false.
		value      : iniValNum,                                                                // What: Value. Why: Ease Down items start fully charged while every other mode starts empty. How: This is iniValNum, resolved above.
		weight     : weiValNum,                                                                // What: Weight. Why: Ease Down items join at their peers' average weight while every other mode starts at 1. How: This is weiValNum, resolved above.

		...( isaEasBoo ? PIC_NAM_OBJ.aveEasFun( sibIteArr, picIdeStr ) : {} ) // What: Drift Band Spread. Why: An ease-mode item needs its own drift band stamped at creation, matching this picker's current average. How: This spreads PIC_NAM_OBJ.aveEasFun's easeMin/easeMax only when isaEasBoo is true.


	};



	return newIteObj; // What: New Item Return. Why: The caller adds this item to the store, or keeps it as a local draft. How: This returns newIteObj.


}

// #endregion buiIteFun

// #endregion Helpers



// #region Exports

export { buiIteFun }; // What: Named Export. Why: The store's addIteFun and the Data tab's new-item draft build an item the same way. How: This exports buiIteFun by name.

// #endregion Exports


