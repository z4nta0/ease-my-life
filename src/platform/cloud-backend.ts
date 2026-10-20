


// #region Imports

import { doc              } from 'firebase/firestore'; // What: Doc. Why: Every read and write names a document. How: This builds a reference to one.
import { firStoObj        } from './firebase.ts';      // What: Firebase Store Object. Why: The cloud copy lives in this database. How: This is its instance.
import { getDoc           } from 'firebase/firestore'; // What: Get Doc. Why: A document version never changes once written, so it can be read from anywhere. How: This reads one.
import { getDocFromServer } from 'firebase/firestore'; // What: Get Doc From Server. Why: A sync must compare against the cloud's current manifest, never a cached one. How: This reads it from the server.
import { runTransaction   } from 'firebase/firestore'; // What: Run Transaction. Why: The manifest only changes when it's still at the revision an upload was built on. How: This reads and writes it atomically.
import { writeBatch       } from 'firebase/firestore'; // What: Write Batch. Why: Versions are uploaded and cleaned up many at a time. How: This groups writes into one request.


import type { SynBacTyp } from '../state/sync-engine.ts'; // What: Sync Backend Type. Why: This file is the engine's real backend. How: This types what it returns.
import type { SynManTyp } from '../state/sync-engine.ts'; // What: Sync Manifest Type. Why: The manifest is read and written here. How: This types it.

// #endregion Imports



/**
 * cloud-backend.ts = Cloud Backend
 *
 * @summary
 * Stores an account's cloud copy in Firestore for the sync engine. The
 * account's own document, users/{uid}, is the manifest: each document's
 * hash, the revision, the save time, the schema version, and the previous
 * revision's hashes (prior). Each document's content lives at
 * users/{uid}/docs/{id}~{hash}, so a new version is written beside the old
 * one instead of over it. An upload writes its new versions first, then
 * commits the manifest in a transaction only if the revision hasn't moved,
 * so the manifest never lists a version that isn't there, and a lost race
 * leaves the cloud copy exactly as it was.
 *
 * Old versions are deleted one revision late: a commit removes the versions
 * the previous manifest's prior listed, unless they're still in use. Another
 * device that read the manifest just before the commit can still download
 * what it listed. A lost race deletes the versions it uploaded for nothing.
 * Cleanup is best effort, since a leftover version costs a little storage
 * and nothing else.
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

type CloManTyp = SynManTyp & { prior : Record< string, string > }; // What: Cloud Manifest Type. Why: The stored manifest also lists the previous revision's hashes, for cleanup. How: This adds prior to the engine's manifest.

// #endregion Types



// #region Constants

const BAT_BYT_NUM = 4194304; // What: Batch Byte Number. Why: Firestore caps one request at 10 MiB, and a log month can be large. How: This keeps each batch to about 4 MiB of text.
const BAT_WRI_NUM = 400;     // What: Batch Writes Number. Why: Firestore caps one batch at 500 writes. How: This keeps each batch below it.

// #endregion Constants



// #region Helpers

const verKeyFun = ( docIdeStr : string, docHasStr : string ) => `${ docIdeStr }~${ docHasStr }`; // What: Version Key Function. Why: Each version of a document has its own name. How: This joins the document's id and hash.



// #region wriBatFun

/**
 * wriBatFun = Write Batch Function
 *
 * @summary
 * Writes or deletes document versions in as few requests as Firestore
 * allows, starting a new batch whenever the current one reaches
 * BAT_WRI_NUM writes or BAT_BYT_NUM bytes of text.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param uidValStr - User Identifier Value String: The account's id.
 * @param verEntArr - Version Entry Array: Each version's key with its JSON
 *                    text, or null to delete it.
 *
 * @returns A promise that settles once every batch is committed, with no
 *          value.
 *
 * @example
 * ```ts
 * await wriBatFun(uidValStr, [['core~1a2b3c4d', '{...}']]) // => Promise<void>
 * ```
 *
*/

async function wriBatFun ( uidValStr : string, verEntArr : [ string, string | null ][] ) : Promise< void > {


	let batCurObj = writeBatch( firStoObj ); // What: Batch Current Object. Why: Writes collect into one batch at a time. How: This starts the first.
	let batBytNum = 0;                       // What: Batch Bytes Number. Why: A batch must stay under the request size cap. How: This counts its text.
	let batWriNum = 0;                       // What: Batch Writes Number. Why: A batch must stay under the write cap. How: This counts its writes.


	for ( const [ verKeyStr, verTexStr ] of verEntArr ) { // What: Version Loop. Why: Each version is written or deleted. How: This walks them in order.


		const verBytNum = verTexStr ? verTexStr.length * 3 : 0; // What: Version Bytes Number. Why: A batch is closed before it grows too large. How: This takes a safe upper bound of the text's UTF-8 size.



		if ( batWriNum && ( batWriNum >= BAT_WRI_NUM || batBytNum + verBytNum > BAT_BYT_NUM ) ) { // What: Full Batch Check. Why: A full batch is sent before adding more. How: This commits it and starts a new one.


			await batCurObj.commit();            // What: Batch Commit Call. Why: The full batch has to land. How: This sends it.
			batCurObj = writeBatch( firStoObj ); // What: New Batch Assignment. Why: Later writes need a fresh batch. How: This starts one.
			batBytNum = 0;                       // What: Byte Reset. Why: The new batch is empty. How: This zeroes its bytes.
			batWriNum = 0;                       // What: Write Count Reset. Why: The new batch is empty. How: This zeroes its writes.


		}



		const verRefObj = doc( firStoObj, 'users', uidValStr, 'docs', verKeyStr ); // What: Version Reference Object. Why: The write names the version's document. How: This builds its reference.


		if ( verTexStr === null ) batCurObj.delete( verRefObj ); // What: Delete Branch. Why: A null text removes the version. How: This deletes it.

		else batCurObj.set( verRefObj, { text : verTexStr } ); // What: Write Branch. Why: Any other text is stored. How: This writes it.



		batBytNum += verBytNum; // What: Byte Count. Why: The batch's size is tracked. How: This adds the version's bytes.
		batWriNum += 1;         // What: Write Count. Why: The batch's writes are tracked. How: This adds one.


	}



	if ( batWriNum ) await batCurObj.commit(); // What: Last Batch Commit. Why: The final, partly full batch has to land too. How: This sends it when it holds anything.


}

// #endregion wriBatFun



// #region cloBacFun

/**
 * cloBacFun = Cloud Backend Function
 *
 * @summary
 * Returns the sync engine's backend for one account's cloud copy. Downloads
 * read the exact versions the manifest lists, and fail when one is missing,
 * so the sync stops and runs again later rather than merging half a copy.
 * An upload writes its new versions, commits the manifest only on the
 * revision it was built from, and then deletes versions nothing lists
 * anymore (see the file summary).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param uidValStr - User Identifier Value String: The account's id.
 *
 * @returns The backend.
 *
 * @example
 * ```ts
 * cloBacFun(uidValStr) // => synBacObj
 * ```
 *
*/

function cloBacFun ( uidValStr : string ) : SynBacTyp {


	const manRefObj = doc( firStoObj, 'users', uidValStr ); // What: Manifest Reference Object. Why: The manifest is the account's own document. How: This builds its reference.



	return { // What: Backend Return. Why: The engine syncs through these three calls. How: This returns them.


		getDocFun : async ( docHasObj ) => { // What: Get Document Function. Why: A sync downloads the versions the manifest lists. How: This reads each one, failing when one is missing.


			const docEntArr = await Promise.all( Object.entries( docHasObj ).map( async ( [ docIdeStr, docHasStr ] ) => { // What: Document Entry Array. Why: Versions download at once rather than one by one. How: This reads each and pairs it with its id.


				const verSnaObj = await getDoc( doc( firStoObj, 'users', uidValStr, 'docs', verKeyFun( docIdeStr, docHasStr ) ) ); // What: Version Snapshot Object. Why: The version holds the document's text. How: This reads it.



				if ( !verSnaObj.exists() ) throw new Error( `Cloud copy is missing ${ docIdeStr }` ); // What: Missing Version Guard. Why: A sync must never merge an incomplete copy. How: This fails the download, so the sync runs again later.



				return [ docIdeStr, verSnaObj.data().text ]; // What: Entry Return. Why: The engine reads text by id. How: This pairs them.


			} ) );



			return Object.fromEntries( docEntArr ); // What: Text Map Return. Why: The engine parses each text. How: This maps each id to its text.


		},

		getManFun : async () => { // What: Get Manifest Function. Why: Every sync starts from the cloud's current manifest. How: This reads it from the server, null before the first upload.


			const manSnaObj = await getDocFromServer( manRefObj ); // What: Manifest Snapshot Object. Why: Only the server's copy is current. How: This reads it.



			if ( !manSnaObj.exists() ) return null; // What: No Manifest Guard. Why: An account that never uploaded has no cloud copy. How: This returns null.



			const { docs, rev, savedAt, v } = manSnaObj.data() as CloManTyp; // What: Manifest Fields. Why: The engine doesn't need prior. How: This reads the other fields. // What: Type Assertion Note. Why: The security rules only let this app write the manifest in this shape. How: The as types the stored data.



			return { docs, rev, savedAt, v }; // What: Manifest Return. Why: The engine compares against it. How: This returns the engine's fields.


		},

		putDocFun : async ( basRevNum, docTexObj, manNewObj ) => { // What: Put Document Function. Why: A sync uploads its changes. How: This writes the new versions, commits the manifest on the expected revision, and cleans up.


			const newEntArr = Object.entries( docTexObj ).flatMap( ( [ docIdeStr, docTexStr ] ) : [ string, string ][] => docTexStr === null ? [] : [ [ verKeyFun( docIdeStr, manNewObj.docs[ docIdeStr ] ), docTexStr ] ] ); // What: New Entry Array. Why: Only changed documents are uploaded, and a deleted one has nothing to write. How: This pairs each new version's key with its text.


			await wriBatFun( uidValStr, newEntArr ); // What: Version Upload. Why: The manifest may only list versions that exist. How: This writes them before the commit.



			const traResObj = await runTransaction( firStoObj, async ( traCurObj ) => { // What: Transaction Result Object. Why: The commit has to be atomic with its revision check. How: This reads the manifest and writes the new one only on the expected revision.


				const manSnaObj = await traCurObj.get( manRefObj );                          // What: Manifest Snapshot Object. Why: The revision is checked inside the transaction. How: This reads the manifest.
				const curManObj = manSnaObj.exists() ? manSnaObj.data() as CloManTyp : null; // What: Current Manifest Object. Why: Cleanup needs what the cloud listed. How: This reads it, null before the first upload. // What: Type Assertion Note. Why: The security rules only let this app write the manifest in this shape. How: The as types the stored data.
				const comNowBoo = ( curManObj ? curManObj.rev : 0 ) === basRevNum;           // What: Commit Now Boolean. Why: An upload built on an older revision must not land. How: This is true when the cloud is still at basRevNum.


				if ( comNowBoo ) traCurObj.set( manRefObj, { ...manNewObj, prior : curManObj ? curManObj.docs : {} } ); // What: Manifest Commit. Why: The new versions become the cloud copy. How: This writes the manifest, keeping the replaced hashes as prior.



				return { comNowBoo, curManObj }; // What: Transaction Return. Why: Cleanup depends on whether the commit landed and what it replaced. How: This returns both.


			} );



			const curManObj = traResObj.curManObj; // What: Current Manifest Object. Why: Cleanup keeps every version it lists. How: This reads it from the transaction.
			const keeHasArr = [ curManObj?.docs, curManObj?.prior, traResObj.comNowBoo ? manNewObj.docs : undefined ];                                                                                                   // What: Keep Hash Array. Why: A version any of these manifests lists may still be downloaded. How: This lists the current, prior, and newly committed hashes.
			const keeKeySet = new Set( keeHasArr.flatMap( ( hasMapObj ) => Object.entries( hasMapObj || {} ).map( ( [ docIdeStr, docHasStr ] ) => verKeyFun( docIdeStr, docHasStr ) ) ) );                               // What: Keep Key Set. Why: Cleanup must not delete a version still listed. How: This collects their keys.
			const garKeyArr = traResObj.comNowBoo ? Object.entries( curManObj?.prior || {} ).map( ( [ docIdeStr, docHasStr ] ) => verKeyFun( docIdeStr, docHasStr ) ) : newEntArr.map( ( [ verKeyStr ] ) => verKeyStr ); // What: Garbage Key Array. Why: A commit retires what the replaced manifest's prior listed, and a lost race retires what it uploaded. How: This lists those candidates.



			try { await wriBatFun( uidValStr, garKeyArr.filter( ( verKeyStr ) => !keeKeySet.has( verKeyStr ) ).map( ( verKeyStr ) : [ string, null ] => [ verKeyStr, null ] ) ); } // What: Cleanup Try. Why: Versions nothing lists only cost storage. How: This deletes every candidate no manifest still lists.

			catch ( errCatObj ) { console.warn( errCatObj ); } // What: Cleanup Catch. Why: A failed cleanup must not fail a sync that already landed. How: This logs it, leaving at most a little unused storage.



			return traResObj.comNowBoo; // What: Commit Return. Why: The engine starts over when the race was lost. How: This reports whether the manifest landed.


		}


	};


}

// #endregion cloBacFun

// #endregion Helpers



// #region Exports

export { cloBacFun }; // What: Named Export. Why: The sync scheduler gets an account's backend through it. How: This exports cloBacFun by name.

// #endregion Exports


