


// #region Imports

import { oldVerFun } from '../../src/state/sync-versions.ts'; // What: Old Version Function. Why: The fake retires old versions by the real backend's rule. How: This lists the version keys to delete.
import { verKeyFun } from '../../src/state/sync-versions.ts'; // What: Version Key Function. Why: The fake stores versions under the real backend's names. How: This joins a document's id and hash.


import type { CldManTyp } from '../../src/state/sync-versions.ts'; // What: Cloud Manifest Type. Why: The fake hands the retirement rule the manifest with its prior, as the real backend does. How: This types it.
import type { SynBacTyp } from '../../src/state/sync-engine.ts';   // What: Sync Backend Type. Why: The fake has to offer the same calls as the real backend. How: This types it.
import type { SynManTyp } from '../../src/state/sync-engine.ts';   // What: Sync Manifest Type. Why: The fake stores one manifest. How: This types it.

// #endregion Imports



/**
 * fake-backend.ts = Fake Backend
 *
 * @summary
 * An in-memory stand-in for the cloud copy, so the sync engine can be tested
 * without Firebase. It keeps one manifest and the documents it lists, commits
 * an upload only when the manifest's revision is still the one the upload was
 * built from, as the real backend's transaction does, and records the ids of
 * each download and each committed upload, so a test can check what a sync
 * downloaded and uploaded. It also keeps every version beside the old ones
 * and retires them after each upload by the real backend's own rule, so a
 * test can check which versions remain. A test can also make the next
 * uploads lose the race, as if another device had committed first, or delete
 * the manifest, as if another device had deleted the cloud copy.
 *
 * Sections:
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Helpers

type FakBacTyp = SynBacTyp & { // What: Fake Backend Type. Why: Tests read what the fake holds and how it was called. How: This adds those to the backend's calls.


	docTexMap : Map< string, string >,  // What: Document Text Map. Why: Tests read the stored documents. How: This holds each document's JSON text by id.
	getIdeArr : string[][],             // What: Get Identifier Array. Why: Tests check which documents a sync downloaded. How: This records the ids of each download.
	manCurFun : () => SynManTyp | null, // What: Manifest Current Function. Why: Tests read the stored manifest. How: This returns it.
	manDelFun : () => void,             // What: Manifest Delete Function. Why: A test can delete the cloud copy from another device. How: This removes the stored manifest.
	putIdeArr : string[][],             // What: Put Identifier Array. Why: Tests check which documents a sync uploaded. How: This records the ids of each committed upload.
	rejCouObj : { couNum : number },    // What: Reject Count Object. Why: A test can make uploads lose the race. How: This counts how many of the next uploads are refused.

	verKeySet : Set< string >           // What: Version Key Set. Why: Tests check which stored versions remain after cleanup. How: This holds each stored version's key, the document id and hash.


};

// #region fakBacFun

/**
 * fakBacFun = Fake Backend Function
 *
 * @summary
 * Creates an empty fake cloud copy. Its upload commits only when the stored
 * revision matches the one given and rejCouObj.couNum is 0; otherwise it
 * refuses the upload and counts rejCouObj.couNum down toward 0.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns The fake backend, with its stores and call records.
 *
 * @example
 * ```ts
 * fakBacFun() // => fakBacObj
 * ```
 *
*/

function fakBacFun () : FakBacTyp {


	const docTexMap = new Map< string, string >(); // What: Document Text Map. Why: The fake stores documents as the real one does, as JSON text. How: This maps each id to its text.
	const rejCouObj = { couNum : 0 };              // What: Reject Count Object. Why: Tests can fake a lost race. How: This counts the uploads still to refuse.

	const getIdeArr : string[][] = []; // What: Get Identifier Array. Why: Downloads are recorded for tests. How: Each entry is one download's ids.
	const putIdeArr : string[][] = []; // What: Put Identifier Array. Why: Uploads are recorded for tests. How: Each entry is one committed upload's ids.

	const verKeySet = new Set< string >(); // What: Version Key Set. Why: The real backend keeps every version beside the old ones until cleanup deletes it. How: This holds each stored version's key.

	let manCurObj : SynManTyp | null = null;       // What: Manifest Current Object. Why: The fake holds one manifest. How: This is null until the first upload.
	let priHasObj : Record< string, string > = {}; // What: Prior Hash Object. Why: The real manifest lists the replaced revision's hashes as prior, for cleanup. How: This holds them, empty before the first commit.



	return { // What: Fake Backend Return. Why: Tests sync against these calls and read the records. How: This returns the calls and stores together.


		docTexMap,                                                         // What: Document Text Map. Why: Tests read the stored documents. How: This shares the store.
		getIdeArr,                                                         // What: Get Identifier Array. Why: Tests read the downloads. How: This shares the record.
		getManFun : async () => manCurObj && structuredClone( manCurObj ), // What: Get Manifest Function. Why: A sync starts from the manifest. How: This returns a copy, so the engine can't change the stored one.
		manCurFun : () => manCurObj,                                       // What: Manifest Current Function. Why: Tests read the stored manifest. How: This returns it.
		manDelFun : () => { manCurObj = null; },                           // What: Manifest Delete Function. Why: Tests delete the cloud copy. How: This removes the manifest.
		putIdeArr,                                                         // What: Put Identifier Array. Why: Tests read the uploads. How: This shares the record.
		rejCouObj,                                                         // What: Reject Count Object. Why: Tests fake a lost race through it. How: This shares the counter.
		verKeySet,                                                         // What: Version Key Set. Why: Tests read the stored versions. How: This shares the set.

		getDocFun : async ( docHasObj ) => { // What: Get Document Function. Why: A sync downloads the documents it needs. How: This records the ids and returns each stored text.


			const docIdeArr = Object.keys( docHasObj ); // What: Document Identifier Array. Why: The fake keeps one version per id, so only the ids matter. How: This lists them.


			getIdeArr.push( docIdeArr ); // What: Download Record. Why: Tests check what was downloaded. How: This adds the ids.



			return Object.fromEntries( docIdeArr.map( ( docIdeStr ) => [ docIdeStr, docTexMap.get( docIdeStr )! ] ) ); // What: Document Text Return. Why: The engine parses the texts. How: This maps each id to its text. // What: Non-Null Note. Why: A sync is expected to download only ids that are stored. How: The ! tells TypeScript the text exists.


		},

		putDocFun : async ( basRevNum, docTexObj, manNewObj ) => { // What: Put Document Function. Why: A sync uploads its changes. How: This commits them only on the expected revision.


			const curRevNum = manCurObj ? manCurObj.rev : 0; // What: Current Revision Number. Why: An upload built on an older revision has to be refused. How: This reads the stored revision, 0 before the first upload.



			const newKeyArr = Object.entries( docTexObj ).flatMap( ( [ docIdeStr, docTexStr ] ) : string[] => docTexStr === null ? [] : [ verKeyFun( docIdeStr, manNewObj.docs[ docIdeStr ] ) ] ); // What: New Key Array. Why: The real backend writes each new version before it tries to commit. How: This names the version of every uploaded document.
			const curCldObj : CldManTyp | null = manCurObj && { ...manCurObj, prior : priHasObj };                                                                                                    // What: Current Cloud Object. Why: The retirement rule reads the stored manifest with its prior. How: This adds the prior hashes to the stored manifest.



			const losRacBoo = rejCouObj.couNum > 0 || curRevNum !== basRevNum; // What: Lost Race Boolean. Why: Another device committed first, really or as a test fakes it. How: This is true when the upload is refused.



			for ( const verKeyStr of newKeyArr ) verKeySet.add( verKeyStr ); // What: Version Write Loop. Why: The new versions are stored even when the commit then loses. How: This adds each key.



			if ( losRacBoo ) { // What: Lost Race Guard. Why: A lost race deletes the versions it uploaded for nothing, and refuses the upload. How: This retires them by the real rule, counts the refusal down, and returns false.


				for ( const garKeyStr of oldVerFun( curCldObj, manNewObj, false, newKeyArr ) ) verKeySet.delete( garKeyStr ); // What: Lost Race Cleanup. Why: Only versions no kept manifest lists may go. How: This deletes what the rule returns.


				rejCouObj.couNum = Math.max( 0, rejCouObj.couNum - 1 ); // What: Reject Count Decrement. Why: One refusal is used up. How: This counts down toward 0.


				return false; // What: Refused Return. Why: The engine starts over when the race was lost. How: This reports the refusal.


			}



			for ( const [ docIdeStr, docTexStr ] of Object.entries( docTexObj ) ) { // What: Document Write Loop. Why: Each changed document is stored. How: This walks the upload.


				if ( docTexStr === null ) docTexMap.delete( docIdeStr ); // What: Delete Branch. Why: A null text removes the document. How: This deletes it.

				else docTexMap.set( docIdeStr, docTexStr ); // What: Write Branch. Why: Any other text replaces the document. How: This stores it.


			}



			for ( const garKeyStr of oldVerFun( curCldObj, manNewObj, true, newKeyArr ) ) verKeySet.delete( garKeyStr ); // What: Commit Cleanup. Why: A commit retires what the replaced manifest's prior listed. How: This deletes what the rule returns.



			priHasObj = manCurObj ? manCurObj.docs : {}; // What: Prior Write. Why: The replaced hashes become the new prior. How: This keeps the replaced manifest's hashes.
			manCurObj = structuredClone( manNewObj );    // What: Manifest Write. Why: The manifest commits with the documents. How: This stores a copy.
			putIdeArr.push( Object.keys( docTexObj ) ); // What: Upload Record. Why: Tests check what was uploaded. How: This adds the ids.



			return true; // What: Committed Return. Why: The engine finishes once an upload lands. How: This reports success.


		}


	};


}

// #endregion fakBacFun

// #endregion Helpers



// #region Exports

export { fakBacFun }; // What: Named Export. Why: In-memory backends are created through fakBacFun. How: This exports it by name.

// #endregion Exports


