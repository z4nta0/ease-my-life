


// #region Imports

import { ONB_ESP_ARR } from '../state/onboarding-seed-data.js'; // What: Onboarding Extra-Sample-Pickers Array. Why: This is every OTHER sample picker's own template, alongside ONB_EXA_OBJ the full set PAG_SAM_ARR below carries. How: This is spread into PAG_SAM_ARR below.
import { ONB_EXA_OBJ } from '../state/onboarding-seed-data.js'; // What: Onboarding Example Object. Why: This is the "Daily Chores" sample picker's own template, one of the entries PAG_SAM_ARR carries. How: This is spread into PAG_SAM_ARR below.
import { ONB_TAS_ARR } from '../state/onboarding-seed-data.js'; // What: Onboarding Task Array. Why: The Data tour needs real reminders to point at, seeded/cleared as disposable copies the same way PAG_SAM_ARR is for pickers. How: This is iterated by seeTasFun/cleTasFun below.

// #endregion Imports



/**
 * page-samples.js = Page Samples
 *
 * @summary
 * Disposable copies of the onboarding sample pickers and reminders for the
 * page mini-tours: the Pickers and Data tours edit and delete things, so they
 * work on pt_-prefixed copies (seePicFun, seeTasFun) that are torn back down
 * when the tour closes (clePicFun, cleTasFun), keeping the real hidden samples
 * untouched.
 *
 * Sections:
 *  - Constants
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

/**
 * PAG_SAM_ARR = Page Sample Array
 *
 * @summary
 * The Pickers/Data tours need real pickers on screen to point at (e.g. the
 * group filter row doesn't even render with fewer than 2 groups), but both
 * expose real edit/delete controls on whatever picker they highlight, so
 * reusing the Welcome Tour's own hidden sample pickers directly (the same ones
 * the Today mini-tour launcher cards and Replay Tour depend on) would let the
 * user's own interaction here (deleting one, editing an item, re-selecting a
 * scope, etc.) corrupt that shared reference data. Seeded as full COPIES
 * instead, under their own `pt_`-prefixed ids (never colliding with the real
 * `pkr_ob_*`/`it_ob_*` ones), and cleaned up again the moment whichever tour
 * used them ends (see clePicFun): real, interactive, but disposable. Shared
 * between the two tours rather than each maintaining its own copy set. Stats
 * does NOT use this, see unhHisFun below for why it borrows the real samples
 * instead.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const PAG_SAM_ARR = [ ONB_EXA_OBJ, ...ONB_ESP_ARR ]; // What: Page Sample Array. Why: seePicFun/clePicFun below need every sample picker's own template to seed/clear a disposable copy of. How: This flattens ONB_EXA_OBJ and every ONB_ESP_ARR entry into one array.

// #endregion Constants



// #region Helpers

const picCopFun = ( samIdeStr ) => `pt_${ samIdeStr }`; // What: Picker Copy Function. Why: Every disposable picker copy's own id needs deriving from its real sample's id, consistently. How: This prefixes samIdeStr with 'pt_'.



const tasCopFun = ( samIdeStr ) => `pt_${ samIdeStr }`; // What: Task Copy Function. Why: Every disposable reminder copy's own id needs deriving from its real sample's id, consistently. How: This prefixes samIdeStr with 'pt_'.



// #region clePicFun

/**
 * clePicFun = Clear Picker Function
 *
 * @summary
 * Discards the copies seePicFun makes, called whenever a tour that seeded them
 * ends (Skip or Done), so they never linger as clutter in the user's real
 * picker list. Harmless no-op for any copy that was never actually seeded
 * (e.g. Skip from the intro modal, before Step 1's own runFun ever fires).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param actStoObj - Action Store Object: The shared app actions object.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * clePicFun( actStoObj ) // => void
 * ```
 *
*/

const clePicFun = ( actStoObj ) => { // What: Clear Picker Function. Why: A disposable copy must never linger in the user's real picker list once its own tour ends. How: This removes every PAG_SAM_ARR entry's own copy id, a harmless no-op for one never seeded.


	PAG_SAM_ARR.forEach( ( samPicObj ) => actStoObj.delPicFun( picCopFun( samPicObj.id ) ) ); // What: Remove Picker Call. Why: Every seeded copy must be discarded, not just some. How: This removes a picker at picCopFun's own derived id for each PAG_SAM_ARR entry.


};

// #endregion clePicFun



// #region cleTasFun

/**
 * cleTasFun = Clear Task Function
 *
 * @summary
 * Discards the reminder copies seeTasFun makes, called whenever the Data tour
 * ends (Skip or Done), so they never linger in the user's real reminder list.
 * Harmless no-op for any copy that was never actually seeded.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param actStoObj - Action Store Object: The shared app actions object.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * cleTasFun( actStoObj ) // => void
 * ```
 *
*/

const cleTasFun = ( actStoObj ) => { // What: Clear Task Function. Why: A disposable reminder copy must never linger in the user's real reminder list once its own tour ends. How: This removes every ONB_TAS_ARR entry's own copy id, a harmless no-op for one never seeded.


	ONB_TAS_ARR.forEach( ( samTasObj ) => actStoObj.delTasFun( tasCopFun( samTasObj.id ) ) ); // What: Remove Task Call. Why: Every seeded copy must be discarded, not just some. How: This removes a task at tasCopFun's own derived id for each ONB_TAS_ARR entry.


};

// #endregion cleTasFun



const neeCopFun = ( pagIdeStr ) => pagIdeStr === 'explore_pickers' || pagIdeStr === 'explore_data'; // What: Needs Copies Function. Why: Only the Pickers/Data tours seed/clear disposable picker copies at all. How: This checks pagIdeStr against both of those page ids.



// #region seePicFun

/**
 * seePicFun = Seed Picker Function
 *
 * @summary
 * Fired from Step 1's runFun (see PagTouCom below), between the nav click and
 * Step 2 ever mounting, the same "prepare what the NEXT step needs" timing
 * already used elsewhere in this file (e.g. Today's own Step 5 staging Step
 * 6's rename input). Guarded by existence so navigating back to Step 1 and
 * forward again (re-firing this runFun) can't create duplicate-id pickers.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param staAppObj - State App Object: The entire app's own persisted state,
 *                    checked so nothing already seeded is seeded twice.
 * @param actStoObj - Action Store Object: The shared app actions object.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * seePicFun( staAppObj, actStoObj ) // => void
 * ```
 *
*/

const seePicFun = ( staAppObj, actStoObj ) => { // What: Seed Picker Function. Why: The Pickers/Data tours need real, disposable copies of every sample picker seeded before their own steps can point at them. How: This adds one copy per PAG_SAM_ARR entry, skipping any already seeded.


	PAG_SAM_ARR.forEach( ( samPicObj ) => { // What: Sample Picker Object Loop. Why: Every sample picker's own template needs its own disposable copy. How: This iterates PAG_SAM_ARR, seeding one copy per entry.


		const copIdeStr = picCopFun( samPicObj.id ); // What: (Picker) Copy Identifier String. Why: This copy's own id must never collide with the real hidden picker's own id. How: This derives it from samPicObj's own id via picCopFun.


		if ( staAppObj.pickers.some( ( exiPicObj ) => exiPicObj.id === copIdeStr ) ) return; // What: Existing Copy Guard. Why: Re-firing this runFun (Back then Forward again) must not create a duplicate-id picker. How: This returns early whenever a picker with this exact copy id already exists.



		actStoObj.addPicFun({ // What: Add Picker Call. Why: This is the real, interactive disposable copy the tour's own steps point at. How: This adds a picker under copIdeStr, copying samPicObj's own name/group/mode/items.


			group : samPicObj.group,                                                          // What: Group Field. Why: The disposable copy must sit in the same group as the real sample picker. How: This copies samPicObj's own group verbatim.
			id    : copIdeStr,                                                                // What: Id Field. Why: This copy's own id must be copIdeStr, not the real sample's own id, so it can never collide with it. How: This uses the already-derived copIdeStr.
			items : samPicObj.items.map( ( { id : oldIdeStr, ...iteResObj } ) => iteResObj ), // What: Items Field. Why: Items keep their own name/weight/ease fields but must drop their real id, passing the real sample's own item ids through would collide with the real hidden picker's own items in state.items. How: This destructures each item, discarding its own id and keeping the rest.
			mode  : samPicObj.mode,                                                           // What: Mode Field. Why: The disposable copy must use the same picker mode as the real sample. How: This copies samPicObj's own mode verbatim.
			name  : samPicObj.name                                                            // What: Name Field. Why: The disposable copy should display with the real sample's own name. How: This copies samPicObj's own name verbatim.


		});


	});


};

// #endregion seePicFun



// #region seeTasFun

/**
 * seeTasFun = Seed Task Function
 *
 * @summary
 * The Data tour's own Reminders step needs real reminders to point at, same
 * reasoning as PAG_SAM_ARR above (real edit/delete controls are exposed there
 * too, so a disposable copy protects the real hidden samples), just for
 * ONB_TAS_ARR instead of pickers. Data-only, the Pickers tour never touches
 * reminders at all.
 *
 * Fired from the Data tour's own Step 1 runFun alongside seePicFun, guarded by
 * existence so navigating back to Step 1 and forward again can't create
 * duplicate-id reminders. A weekly sample's copy is pinned to today's weekday,
 * the same way the Welcome Tour seeds the real one.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param staAppObj - State App Object: The entire app's own persisted state,
 *                    checked so nothing already seeded is seeded twice.
 * @param actStoObj - Action Store Object: The shared app actions object.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * seeTasFun( staAppObj, actStoObj ) // => void
 * ```
 *
*/

const seeTasFun = ( staAppObj, actStoObj ) => { // What: Seed Task Function. Why: The Data tour needs real, disposable copies of every sample reminder seeded before its Reminders step can point at them. How: This adds one copy per ONB_TAS_ARR entry, skipping any already seeded.


	ONB_TAS_ARR.forEach( ( samTasObj ) => { // What: Sample Task Object Loop. Why: Every sample reminder's own template needs its own disposable copy. How: This iterates ONB_TAS_ARR, seeding one copy per entry.


		const copIdeStr = tasCopFun( samTasObj.id ); // What: Task Copy Identifier String. Why: This copy's own id must never collide with the real hidden reminder's own id. How: This derives it from samTasObj's own id via tasCopFun.


		if ( staAppObj.tasks.some( ( exiTasObj ) => exiTasObj.id === copIdeStr ) ) return; // What: Existing Copy Guard. Why: Re-firing this runFun must not create a duplicate-id reminder. How: This returns early whenever a task with this exact copy id already exists.



		actStoObj.addTasFun({ // What: Add Task Call. Why: This is the real, interactive disposable copy the Data tour's own Reminders step points at. How: This adds a task under copIdeStr, copying samTasObj's own name/repeat, and this weekday when it recurs weekly.


			id     : copIdeStr,        // What: Id Field. Why: This copy's own id must be copIdeStr, not the real sample's own id, so it can never collide with it. How: This uses the already-derived copIdeStr.
			name   : samTasObj.name,   // What: Name Field. Why: The disposable copy should display with the real sample's own name. How: This copies samTasObj's own name verbatim.
			repeat : samTasObj.repeat, // What: Repeat Field. Why: The disposable copy must use the same repeat schedule as the real sample. How: This copies samTasObj's own repeat verbatim.

			...( samTasObj.repeat === 'weekly' ? { daysOfWeek : [ new Date().getDay() ] } : {} ) // What: Days Of Week Spread. Why: Mirrors the real Welcome Tour's own seeding (see onboarding/welcome-tour.jsx's Generate step): the recurring sample's own daysOfWeek should read as "due today", not the base template's hardcoded Monday. How: This spreads today's own weekday in only when this sample recurs weekly.


		});


	});


};

// #endregion seeTasFun

// #endregion Helpers



// #region Exports

export { clePicFun, cleTasFun, neeCopFun, seePicFun, seeTasFun }; // What: Named Exports. Why: PagTouCom seeds and clears the copies as a page tour opens and closes. How: This exports the seed, clear, and needs-copies functions by name; the id helpers and PAG_SAM_ARR stay private to this file.

// #endregion Exports


