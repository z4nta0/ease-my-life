


// #region Imports

import type { SynManTyp } from './sync-engine.ts'; // What: Sync Manifest Type. Why: The cleanup reads the manifests an upload replaced and wrote. How: This types them.

// #endregion Imports



/**
 * sync-versions.ts = Sync Versions
 *
 * @summary
 * Names the stored versions of the cloud copy's documents and decides which
 * of them an upload retires. A version is stored under its document's id and
 * hash, so a new version sits beside the old one. This file holds that
 * naming and the retirement rule on their own, with nothing from Firebase, so
 * the real backend and the fake one the tests use apply the same rule.
 *
 * Sections:
 *  - Types
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Types

type CldManTyp = SynManTyp & { prior : Record< string, string > }; // What: Cloud Manifest Type. Why: The stored manifest also lists the previous revision's hashes, for cleanup. How: This adds prior to the engine's manifest.

// #endregion Types



// #region Helpers

const verKeyFun = ( docIdeStr : string, docHasStr : string ) => `${ docIdeStr }~${ docHasStr }`; // What: Version Key Function. Why: Each version of a document has its own name. How: This joins the document's id and hash.



// #region oldVerFun

/**
 * oldVerFun = Old Version Function
 *
 * @summary
 * Lists the version keys an upload deletes once it has landed or lost its
 * race. A commit retires what the replaced manifest's prior listed, keeping
 * whatever the replaced manifest (now the new prior) or the new manifest
 * still lists, since another device may yet download them. A lost race
 * retires the versions it uploaded for nothing, keeping any the winner's
 * manifest or its prior lists.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curManObj - Current Manifest Object: The manifest the cloud held
 *                    when the upload ended, or null before the first upload.
 * @param manNewObj - Manifest New Object: The manifest the upload built.
 * @param cmtNowBoo - Commit Now Boolean: Whether the upload's manifest landed.
 * @param newKeyArr - New Key Array: The version keys the upload wrote.
 *
 * @returns The version keys to delete.
 *
 * @example
 * ```ts
 * oldVerFun(curManObj, manNewObj, true, newKeyArr) // => ['core~1a2b3c4d']
 * ```
 *
*/

const oldVerFun = ( curManObj : CldManTyp | null, manNewObj : SynManTyp, cmtNowBoo : boolean, newKeyArr : string[] ) : string[] => { // What: Old Version Function. Why: Versions nothing lists only cost storage, but one a manifest lists may still be downloaded. How: This picks the candidates for the outcome and drops every one a kept manifest lists.


	const keeHasArr = cmtNowBoo ? [ curManObj?.docs, manNewObj.docs ] : [ curManObj?.docs, curManObj?.prior ];                                                                  // What: Keep Hash Array. Why: A commit's new prior is the replaced docs, so the older prior is what it retires, while a lost race retires only its own uploads and must leave what the winner lists. How: This lists the replaced and new hashes after a commit, and the current and prior hashes after a lost race.
	const keeKeySet = new Set( keeHasArr.flatMap( ( hasMapObj ) => Object.entries( hasMapObj || {} ).map( ( [ docIdeStr, docHasStr ] ) => verKeyFun( docIdeStr, docHasStr ) ) ) ); // What: Keep Key Set. Why: Cleanup must not delete a version still listed. How: This collects their keys.



	const garKeyArr = cmtNowBoo ? Object.entries( curManObj?.prior || {} ).map( ( [ docIdeStr, docHasStr ] ) => verKeyFun( docIdeStr, docHasStr ) ) : newKeyArr; // What: Garbage Key Array. Why: A commit retires what the replaced manifest's prior listed, and a lost race retires what it uploaded. How: This lists those candidates.



	return garKeyArr.filter( ( verKeyStr ) => !keeKeySet.has( verKeyStr ) ); // What: Deletion Return. Why: Only a version no kept manifest lists may go. How: This drops every kept key from the candidates.


};

// #endregion oldVerFun

// #endregion Helpers



// #region Exports

export { type CldManTyp, oldVerFun, verKeyFun }; // What: Named Exports. Why: The real and fake backends share the version naming, the retirement rule, and the manifest type. How: This exports them by name.

// #endregion Exports


