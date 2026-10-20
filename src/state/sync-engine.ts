


// #region Imports

import { canJsoFun   } from './sync-docs.ts';  // What: Canonical JSON Function. Why: Hashes and uploads both need one fixed text per document. How: This serializes a document with its keys sorted.
import { hasDocFun   } from './sync-docs.ts';  // What: Hash Document Function. Why: Documents are compared by fingerprint, not content. How: This hashes a document's canonical JSON.
import { joiDocFun   } from './sync-docs.ts';  // What: Join Documents Function. Why: A merged set of documents has to become app state again. How: This rebuilds the state from them.
import { merDocFun   } from './sync-merge.ts'; // What: Merge Document Function. Why: A document both sides changed has to be merged. How: This merges one such document.
import { SCH_VER_NUM } from './migrate.ts';    // What: Schema Version Number. Why: A cloud copy saved by a newer app can't be read safely. How: This is the newest schema this app knows.
import { splStaFun   } from './sync-docs.ts';  // What: Split State Function. Why: Local state is compared document by document. How: This splits the state into documents.


import type { StaAppTyp } from '../core/data-model.ts'; // What: State App Type. Why: Sync starts from, and may return, the whole app state. How: This types both.
import type { SynDocTyp } from './sync-docs.ts';        // What: Sync Document Type. Why: The merged documents are collected by id. How: This types that map.

// #endregion Imports



/**
 * sync-engine.ts = Sync Engine
 *
 * @summary
 * Runs one sync between this device and its cloud copy, without knowing
 * where the cloud copy lives: the backend (Firestore, or an in-memory fake in
 * the tests) only stores a manifest and the documents it lists. The manifest
 * holds each document's hash, a revision number, when its content was last
 * saved, and the schema it was saved under. This device remembers the hashes
 * and revision it last synced, so comparing the three sets of hashes says,
 * for every document, which side changed it: one side alone, and that side's
 * copy is taken; both sides, and the two are merged (see sync-merge.ts).
 * Only documents whose hashes differ are downloaded or uploaded.
 *
 * An upload commits only when the cloud's revision is still the one this
 * sync started from, so two devices syncing at once can't overwrite each
 * other: the one that loses the race starts over from the newer copy. A
 * device syncing for the first time adopts the cloud's copy as the winner,
 * keeping only its own history from before today, so signing in on a fresh
 * install never replaces an account's data with an empty one.
 *
 * Sections:
 *  - Types
 *  - Constants
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Types

type SynManTyp = { docs : Record< string, string >, rev : number, savedAt : number, v : number }; // What: Sync Manifest Type. Why: The cloud copy is described by one small record a sync reads first. How: This holds each document's hash, the revision, the last save time, and the schema version.
type SynMetTyp = { docs : Record< string, string >, rev : number };                               // What: Sync Meta Type. Why: A device has to know what it last synced to tell which side changed a document. How: This holds the hashes and revision of its last sync.

type SynBacTyp = { // What: Sync Backend Type. Why: The engine works against any store with these three calls. How: This types them.


	getDocFun : ( docIdeArr : string[] ) => Promise< Record< string, string > >,                                                 // What: Get Document Function. Why: Changed documents are downloaded by id. How: This resolves with each document's JSON text by id.
	getManFun : () => Promise< SynManTyp | null >,                                                                               // What: Get Manifest Function. Why: Every sync starts from the cloud's manifest. How: This resolves with it, or null before the first upload.
	putDocFun : ( basRevNum : number, docTexObj : Record< string, string | null >, manNewObj : SynManTyp ) => Promise< boolean > // What: Put Document Function. Why: An upload has to land whole, and only on the revision it was built from. How: This writes each document's JSON text (null deletes it) and the new manifest together if the cloud is still at basRevNum, resolving false otherwise.


};

type SynResTyp = { merStaObj : StaAppTyp | null, pusNeeBoo : boolean, synMetObj : SynMetTyp | null, synStaStr : 'busy' | 'newer' | 'synced' }; // What: Sync Result Type. Why: The caller needs the merged state, the new meta to save, and how the sync went. How: merStaObj is null when local state didn't change, and synStaStr is busy when every try lost the race, newer when the cloud's schema is too new.

// #endregion Types



// #region Constants

const TRY_MAX_NUM = 4; // What: Try Maximum Number. Why: Losing the upload race repeatedly means another device is syncing right now, so this sync gives up and tries again later. How: This caps how many times one sync starts over.

// #endregion Constants



// #region Helpers

// #region hasMapFun

/**
 * hasMapFun = Hash Map Function
 *
 * @summary
 * Fingerprints every document in a set, so two sets can be compared document
 * by document without comparing their content.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param docMapObj - Document Map Object: The documents, keyed by id.
 *
 * @returns Each document's hash, keyed by the same ids.
 *
 * @example
 * ```ts
 * hasMapFun(docMapObj) // => { core: '1a2b3c4d', ... }
 * ```
 *
*/

const hasMapFun = ( docMapObj : SynDocTyp ) : Record< string, string > => Object.fromEntries( Object.entries( docMapObj ).map( ( [ docIdeStr, docCurObj ] ) => [ docIdeStr, hasDocFun( docCurObj ) ] ) ); // What: Hash Map Function. Why: Documents are compared by fingerprint. How: This maps each id to its document's hash.

// #endregion hasMapFun



// #region synRunFun

/**
 * synRunFun = Sync Run Function
 *
 * @summary
 * Runs one sync. It reads the cloud's manifest, compares every document's
 * hash on this device, in the cloud, and as of the last sync, downloads the
 * documents the cloud changed, merges any both sides changed (the side that
 * saved last wins, and a device's first sync lets the cloud win), and
 * uploads the documents whose merged content differs from the cloud's. When
 * another device committed first, it starts over, up to TRY_MAX_NUM times.
 * It never changes anything when the cloud was saved by a newer schema. The
 * caller saves the merged state, when there is one, and the new meta.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param synBacObj - Sync Backend Object: The store holding the cloud copy.
 * @param locStaObj - Local State Object: This device's current state.
 * @param locSavNum - Local Saved Number: When this device last saved its
 *                    state, in milliseconds.
 * @param synMetObj - Sync Meta Object: The hashes and revision of this
 *                    device's last sync, or null before its first.
 * @param todDayStr - Today Day String: Today's local 'YYYY-MM-DD', the first
 *                    day whose log rows follow the winning side alone.
 *
 * @returns A promise that settles with the sync's result.
 *
 * @example
 * ```ts
 * synRunFun(synBacObj, locStaObj, ...) // => Promise<SynResTyp>
 * ```
 *
*/

async function synRunFun ( synBacObj : SynBacTyp, locStaObj : StaAppTyp, locSavNum : number, synMetObj : SynMetTyp | null, todDayStr : string ) : Promise< SynResTyp > {


	for ( let tryIndNum = 0; tryIndNum < TRY_MAX_NUM; tryIndNum++ ) { // What: Try Loop. Why: An upload that loses the race starts over from the newer cloud copy. How: This runs the sync up to TRY_MAX_NUM times.


		const remManObj = await synBacObj.getManFun(); // What: Remote Manifest Object. Why: The cloud's hashes say what it holds. How: This reads its manifest, null before the first upload.



		if ( remManObj && remManObj.v > SCH_VER_NUM ) return { merStaObj : null, pusNeeBoo : false, synMetObj, synStaStr : 'newer' }; // What: Newer Schema Guard. Why: This app can't read or safely merge a shape it doesn't know yet, so the device waits for its own update. How: This returns without changing anything.



		// #region Document Comparison

		const locDocObj = splStaFun( locStaObj );                                                         // What: Local Document Object. Why: Local state is compared document by document. How: This splits it.
		const locHasObj = hasMapFun( locDocObj );                                                         // What: Local Hash Object. Why: Each local document's fingerprint is compared. How: This hashes them.
		const basHasObj = synMetObj ? synMetObj.docs : {};                                                // What: Base Hash Object. Why: A document that still matches the last sync wasn't changed on that side. How: This reads the last sync's hashes, or none before the first.
		const remHasObj = remManObj ? remManObj.docs : {};                                                // What: Remote Hash Object. Why: Each cloud document's fingerprint is compared. How: This reads the manifest's hashes, or none before the first upload.
		const locWinBoo = !!synMetObj && ( !remManObj || locSavNum >= remManObj.savedAt );                // What: Local Winner Boolean. Why: A document both sides changed follows the side that saved last, and a first sync follows the cloud. How: This is true when this device has synced before and saved no earlier than the cloud.
		const docIdeArr = [ ...new Set( [ ...Object.keys( locHasObj ), ...Object.keys( remHasObj ) ] ) ]; // What: Document Identifier Array. Why: Every document either side holds is compared. How: This lists both sides' ids once each.
		const fetIdeArr = docIdeArr.filter( ( docIdeStr ) => remHasObj[ docIdeStr ] !== undefined && remHasObj[ docIdeStr ] !== locHasObj[ docIdeStr ] && remHasObj[ docIdeStr ] !== basHasObj[ docIdeStr ] ); // What: Fetch Identifier Array. Why: Only documents the cloud changed, and that differ here, are downloaded. How: This keeps the ids whose cloud hash differs from both the local and last synced ones.

		// #endregion Document Comparison



		// #region Document Merge

		const remTexObj = fetIdeArr.length ? await synBacObj.getDocFun( fetIdeArr ) : {}; // What: Remote Text Object. Why: Changed cloud documents are needed to adopt or merge them. How: This downloads their JSON text, or skips the call when nothing changed.

		const merDocObj : SynDocTyp = {}; // What: Merged Document Object. Why: The merge result is collected by id. How: The loop below fills it.


		for ( const docIdeStr of docIdeArr ) { // What: Document Loop. Why: Each document is resolved on its own. How: This walks every id either side holds.


			const locHasStr = locHasObj[ docIdeStr ];                                        // What: Local Hash String. Why: It tells whether this device changed the document. How: This reads its local hash.
			const remHasStr = remHasObj[ docIdeStr ];                                        // What: Remote Hash String. Why: It tells whether the cloud changed the document. How: This reads its cloud hash.
			const basHasStr = basHasObj[ docIdeStr ];                                        // What: Base Hash String. Why: Both sides are compared against what they last agreed on. How: This reads the last sync's hash.
			const remTexStr = remTexObj[ docIdeStr ];                                        // What: Remote Text String. Why: A downloaded document is parsed before it's used. How: This reads its JSON text, undefined when it wasn't downloaded.
			const remDocObj = remTexStr === undefined ? undefined : JSON.parse( remTexStr ); // What: Remote Document Object. Why: The cloud's content is merged as data. How: This parses the downloaded text.



			const merCurObj = remHasStr === locHasStr || remHasStr === basHasStr // What: Merged Current Object. Why: A document only one side changed is taken from that side, and one both changed is merged. How: This picks the local copy when the cloud didn't change it, the cloud's when only it did, and merges otherwise.
				? locDocObj[ docIdeStr ]                                                               // What: Local Branch. Why: The cloud matches this device or hasn't changed since the last sync. How: This keeps the local copy, undefined when this device deleted it.
				: locHasStr === basHasStr                                                              // What: Remote Only Check. Why: A document this device left alone follows the cloud. How: This checks whether the local copy still matches the last sync.
					? remDocObj                                                                        // What: Remote Branch. Why: Only the cloud changed it. How: This takes the cloud's copy, undefined when the cloud deleted it.
					: merDocFun( docIdeStr, locDocObj[ docIdeStr ], remDocObj, locWinBoo, todDayStr ); // What: Merge Branch. Why: Both sides changed it. How: This merges the two copies.


			if ( merCurObj !== undefined && !( Array.isArray( merCurObj ) && !merCurObj.length ) ) merDocObj[ docIdeStr ] = merCurObj; // What: Merged Document Store. Why: A deleted document, or a month left with no rows, isn't kept. How: This stores every other merged document by id.


		}

		// #endregion Document Merge



		// #region Upload

		const merHasObj = hasMapFun( merDocObj );                                                            // What: Merged Hash Object. Why: The merged documents are compared with both sides. How: This hashes them.
		const merStaObj = canJsoFun( merHasObj ) === canJsoFun( locHasObj ) ? null : joiDocFun( merDocObj ); // What: Merged State Object. Why: The caller only saves a state when the merge changed something here. How: This joins the merged documents when their hashes differ from the local ones, and is null otherwise.
		const basRevNum = remManObj ? remManObj.rev : 0;                                                     // What: Base Revision Number. Why: The upload only commits on the revision it was built from. How: This reads the cloud's revision, 0 before the first upload.



		if ( canJsoFun( merHasObj ) === canJsoFun( remHasObj ) ) return { merStaObj, pusNeeBoo : false, synMetObj : { docs : merHasObj, rev : basRevNum }, synStaStr : 'synced' }; // What: Nothing To Upload Guard. Why: The cloud already holds the merged content. How: This returns the new meta without an upload.



		const putTexObj : Record< string, string | null > = {}; // What: Put Text Object. Why: Only changed documents are uploaded, and documents gone from the merge are deleted. How: The two loops below fill it.


		for ( const docIdeStr of Object.keys( merHasObj ) ) if ( merHasObj[ docIdeStr ] !== remHasObj[ docIdeStr ] ) putTexObj[ docIdeStr ] = canJsoFun( merDocObj[ docIdeStr ] ); // What: Changed Document Loop. Why: A document the cloud doesn't hold in this form is uploaded. How: This adds its canonical JSON.



		for ( const docIdeStr of Object.keys( remHasObj ) ) if ( !( docIdeStr in merHasObj ) ) putTexObj[ docIdeStr ] = null; // What: Deleted Document Loop. Why: A document the merge dropped is removed from the cloud too. How: This marks it null.



		const manNewObj : SynManTyp = { // What: Manifest New Object. Why: The cloud's manifest has to describe what's uploaded. How: This lists the merged hashes, the next revision, the later save time, and this app's schema.


			docs    : merHasObj,                                                // What: Documents. Why: The cloud has to list what it holds. How: This is every merged document's hash.
			rev     : basRevNum + 1,                                            // What: Revision. Why: The next upload has to know it's building on this one. How: This counts one past the revision this upload started from.
			savedAt : Math.max( locSavNum, remManObj ? remManObj.savedAt : 0 ), // What: Saved At. Why: The next conflict is won by whichever side saved after this. How: This is the later of the two sides' save times.
			v       : SCH_VER_NUM                                               // What: Version. Why: An older app must not merge a shape it doesn't know. How: This is the schema this app saves.


		};



		if ( await synBacObj.putDocFun( basRevNum, putTexObj, manNewObj ) ) return { merStaObj, pusNeeBoo : true, synMetObj : { docs : merHasObj, rev : manNewObj.rev }, synStaStr : 'synced' }; // What: Committed Upload Guard. Why: An upload that landed finishes the sync. How: This returns the merged state and the new meta.

		// #endregion Upload


	}



	return { merStaObj : null, pusNeeBoo : false, synMetObj, synStaStr : 'busy' }; // What: Busy Return. Why: Every try lost the race to another device, so nothing changed here and the next sync tries again. How: This returns the old meta with a busy status.


}

// #endregion synRunFun

// #endregion Helpers



// #region Exports

export { type SynBacTyp, type SynManTyp, type SynMetTyp, type SynResTyp, synRunFun }; // What: Named Exports. Why: The store runs syncs through synRunFun, and each backend implements SynBacTyp. How: This exports the function and its types by name.

// #endregion Exports


