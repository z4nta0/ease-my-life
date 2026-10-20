


// #region Imports

import type { SynBacTyp } from '../../src/state/sync-engine.ts'; // What: Sync Backend Type. Why: The fake has to offer the same calls as the real backend. How: This types it.
import type { SynManTyp } from '../../src/state/sync-engine.ts'; // What: Sync Manifest Type. Why: The fake stores one manifest. How: This types it.

// #endregion Imports



/**
 * fake-backend.ts = Fake Backend
 *
 * @summary
 * An in-memory stand-in for the cloud copy, so the sync engine can be
 * tested without Firebase. It keeps one manifest and the documents it lists,
 * commits an upload only when the manifest's revision is still the one the
 * upload was built from, as the real backend's transaction will, and counts
 * every call, so a test can check what a sync downloaded and uploaded. A
 * test can also make the next uploads lose the race, as if another device
 * had committed first.
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

type FakBacTyp = SynBacTyp & { // What: Fake Backend Type. Why: Tests read what the fake holds and how it was called. How: This adds those to the backend's calls.


	docTexMap : Map< string, string >,  // What: Document Text Map. Why: Tests read the stored documents. How: This holds each document's JSON text by id.
	getIdeArr : string[][],             // What: Get Identifier Array. Why: Tests check which documents a sync downloaded. How: This records the ids of each download.
	manCurFun : () => SynManTyp | null, // What: Manifest Current Function. Why: Tests read the stored manifest. How: This returns it.
	putIdeArr : string[][],             // What: Put Identifier Array. Why: Tests check which documents a sync uploaded. How: This records the ids of each committed upload.
	rejCouObj : { couNum : number }     // What: Reject Count Object. Why: A test can make uploads lose the race. How: This counts how many of the next uploads are refused.


};

// #endregion Types



// #region Helpers

// #region fakBacFun

/**
 * fakBacFun = Fake Backend Function
 *
 * @summary
 * Creates an empty fake cloud copy. Its upload commits only when the stored
 * revision matches the one given, or when rejCouObj.couNum is above 0, in
 * which case it refuses the upload and counts down instead.
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


	const docTexMap = new Map< string, string >(); // What: Document Text Map. Why: The fake stores documents as the real one will, as JSON text. How: This maps each id to its text.
	const rejCouObj = { couNum : 0 };              // What: Reject Count Object. Why: Tests can fake a lost race. How: This counts the uploads still to refuse.

	const getIdeArr : string[][] = []; // What: Get Identifier Array. Why: Downloads are recorded for tests. How: Each entry is one download's ids.
	const putIdeArr : string[][] = []; // What: Put Identifier Array. Why: Uploads are recorded for tests. How: Each entry is one committed upload's ids.

	let manCurObj : SynManTyp | null = null; // What: Manifest Current Object. Why: The fake holds one manifest. How: This is null until the first upload.



	return { // What: Fake Backend Return. Why: Tests sync against these calls and read the records. How: This returns the calls and stores together.


		docTexMap,                                                         // What: Document Text Map. Why: Tests read the stored documents. How: This shares the store.
		getIdeArr,                                                         // What: Get Identifier Array. Why: Tests read the downloads. How: This shares the record.
		getManFun : async () => manCurObj && structuredClone( manCurObj ), // What: Get Manifest Function. Why: A sync starts from the manifest. How: This returns a copy, so the engine can't change the stored one.
		manCurFun : () => manCurObj,                                       // What: Manifest Current Function. Why: Tests read the stored manifest. How: This returns it.
		putIdeArr,                                                         // What: Put Identifier Array. Why: Tests read the uploads. How: This shares the record.
		rejCouObj,                                                         // What: Reject Count Object. Why: Tests fake a lost race through it. How: This shares the counter.

		getDocFun : async ( docIdeArr ) => { // What: Get Document Function. Why: A sync downloads the documents it needs. How: This records the ids and returns each stored text.


			getIdeArr.push( docIdeArr ); // What: Download Record. Why: Tests check what was downloaded. How: This adds the ids.



			return Object.fromEntries( docIdeArr.map( ( docIdeStr ) => [ docIdeStr, docTexMap.get( docIdeStr )! ] ) ); // What: Document Text Return. Why: The engine parses the texts. How: This maps each id to its text. // What: Non-Null Note. Why: The engine only downloads ids the manifest lists, and every listed id is stored. How: The ! tells TypeScript the text exists.


		},

		putDocFun : async ( basRevNum, docTexObj, manNewObj ) => { // What: Put Document Function. Why: A sync uploads its changes. How: This commits them only on the expected revision.


			const curRevNum = manCurObj ? manCurObj.rev : 0; // What: Current Revision Number. Why: An upload built on an older revision has to be refused. How: This reads the stored revision, 0 before the first upload.



			if ( rejCouObj.couNum > 0 || curRevNum !== basRevNum ) { rejCouObj.couNum = Math.max( 0, rejCouObj.couNum - 1 ); return false; } // What: Lost Race Guard. Why: Another device committed first, really or as a test fakes it. How: This counts down any faked refusal and refuses.



			for ( const [ docIdeStr, docTexStr ] of Object.entries( docTexObj ) ) { // What: Document Write Loop. Why: Each changed document is stored. How: This walks the upload.


				if ( docTexStr === null ) docTexMap.delete( docIdeStr ); // What: Delete Branch. Why: A null text removes the document. How: This deletes it.

				else docTexMap.set( docIdeStr, docTexStr ); // What: Write Branch. Why: Any other text replaces the document. How: This stores it.


			}



			manCurObj = structuredClone( manNewObj );   // What: Manifest Write. Why: The manifest commits with the documents. How: This stores a copy.
			putIdeArr.push( Object.keys( docTexObj ) ); // What: Upload Record. Why: Tests check what was uploaded. How: This adds the ids.



			return true; // What: Committed Return. Why: The engine finishes once an upload lands. How: This reports success.


		}


	};


}

// #endregion fakBacFun

// #endregion Helpers



// #region Exports

export { fakBacFun, type FakBacTyp }; // What: Named Exports. Why: The sync spec creates fakes through fakBacFun. How: This exports it and its type by name.

// #endregion Exports


