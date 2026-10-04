


// #region Imports

import { hydStaFun   } from './onboarding-seed-data.js'; // What: Hydrate Stats Function. Why: The borrowed sample history needs converting from its static template shape into real pickLog rows. How: This is called on the lazily imported ONB_STA_OBJ inside unhHisFun.
import { ONB_SPI_ARR } from './onboarding-seed-data.js'; // What: Onboarding Sample-Picker-Ids Array. Why: Every real sample picker (not a disposable copy) is unhidden and rehidden by id. How: This is iterated by both functions in this file.

// #endregion Imports



/**
 * sample-history.js = Sample History
 *
 * @summary
 * Borrows the real hidden onboarding sample pickers, with their year of
 * precomputed pick history, whenever the Stats page needs something genuine to
 * demonstrate (its own page tour, and help mode), and hides them again
 * afterward.
 *
 * Sections:
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Helpers

// #region hidHisFun

/**
 * hidHisFun = Hide History Function
 *
 * @summary
 * Hides every real sample picker again once whatever borrowed them through
 * unhHisFun (the Stats page tour, or help mode on the Stats page) ends. It is
 * the same hide mechanism the Welcome Tour itself uses.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param actStoObj - Action Store Object: The shared app actions object.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * hidHisFun( actStoObj ) // => void
 * ```
 *
*/

const hidHisFun = ( actStoObj ) => { // What: Hide History Function. Why: The real sample pickers borrowed for the Stats page must go back to hidden once that is over. How: This updates every ONB_SPI_ARR entry's own hidden field back to true.


	ONB_SPI_ARR.forEach( ( samIdeStr ) => actStoObj.updPicFun( samIdeStr, { hidden : true } ) ); // What: Hide Sample Picker Call. Why: This must run for every sample picker unhHisFun could have unhidden. How: This updates every ONB_SPI_ARR entry's own hidden field to true.


};

// #endregion hidHisFun



// #region unhHisFun

/**
 * unhHisFun = Unhide History Function
 *
 * @summary
 * Unhides every real onboarding sample picker so the Stats page has genuine
 * history to show, for both the Stats page tour and help mode. Neither needs a
 * disposable copy: Stats has no edit or delete controls, and a copy would
 * start with zero pick history, leaving the heatmap and breakdown empty, the
 * opposite of what either is trying to demonstrate. hidHisFun hides them again
 * afterward.
 *
 * The sample pickers normally already carry about a year of precomputed
 * pickLog history, seeded once on fresh install (see
 * onboarding/welcome-tour.jsx's own mount effect), but that effect only seeds
 * while no sample picker exists yet, so an account that already had a picker
 * of its own gets the sample pickers with none of their history. This
 * backfills the same precomputed history, lazily imported, guarded by
 * existence (any pickLog row already belonging to a sample picker), so a
 * repeat run can't duplicate rows.
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
 * unhHisFun( staAppObj, actStoObj ) // => void
 * ```
 *
*/

const unhHisFun = ( staAppObj, actStoObj ) => { // What: Unhide History Function. Why: The Stats page's own heatmap/breakdown need real sample history to demonstrate, not an empty disposable copy. How: This unhides every real sample picker, backfilling its own pickLog history if none exists yet.


	ONB_SPI_ARR.forEach( ( samIdeStr ) => actStoObj.updPicFun( samIdeStr, { hidden : false } ) ); // What: Unhide Sample Picker Call. Why: The Stats tour's own steps need every real sample picker visible for its own duration. How: This updates every ONB_SPI_ARR entry's own hidden field to false.


	if ( !( staAppObj.pickLog || [] ).some( ( curRowObj ) => ONB_SPI_ARR.includes( curRowObj.pickerId ) ) ) { // What: Missing History Check. Why: Only a genuinely virgin-install user (or a first run of this tour) is missing the precomputed sample history. How: This checks whether any existing pickLog row already belongs to a sample picker.


		import( './onboarding-stats-data.js' ).then( ( { ONB_STA_OBJ } ) => { // What: Stats Data Import. Why: The precomputed sample history template is large enough to warrant a lazy, on-demand import instead of a static one. How: This dynamically imports onboarding-stats-data.js, then seeds its own ONB_STA_OBJ export.


			actStoObj.sedHisFun( hydStaFun( ONB_STA_OBJ ) ); // What: Seed History Call. Why: The static template needs converting into real pickLog rows before it means anything to the Stats tab. How: This calls actStoObj.sedHisFun with hydStaFun's own converted result.


		} );


	}


};

// #endregion unhHisFun

// #endregion Helpers



// #region Exports

export { hidHisFun, unhHisFun }; // What: Named Exports. Why: The Stats page tour and help mode both borrow the sample pickers. How: This exports both functions by name.

// #endregion Exports


