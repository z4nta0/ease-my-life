


// #region Imports

import { canJsoFun } from '../../src/state/sync-docs.ts';   // What: Canonical JSON Function. Why: States are compared by content, whatever their key order. How: This serializes with sorted keys.
import { expect    } from '@playwright/test';               // What: Expect. Why: Every flow asserts what synced. How: This makes the assertions.
import { fakBacFun } from './fake-backend.ts';              // What: Fake Backend Function. Why: Syncs run against an in-memory cloud copy. How: This creates one.
import { joiDocFun } from '../../src/state/sync-docs.ts';   // What: Join Documents Function. Why: The round trip rebuilds the state. How: This joins documents.
import { reaFixFun } from '../support/fixture.ts';          // What: Read Fixture Function. Why: The round trip runs on real data. How: This reads the backup.
import { splStaFun } from '../../src/state/sync-docs.ts';   // What: Split State Function. Why: States are compared document by document. How: This splits one.
import { synRunFun } from '../../src/state/sync-engine.ts'; // What: Sync Run Function. Why: Each flow runs syncs. How: This runs one.
import { test      } from '@playwright/test';               // What: Test. Why: Each flow is its own test. How: This declares them.


import type { RawSavTyp } from '../../src/core/data-model.ts'; // What: Raw Save Type. Why: Flows build small states of their own. How: This types them.

// #endregion Imports



/**
 * engine.spec.ts = Engine Spec
 *
 * @summary
 * Checks the sync engine in Node, with no browser, against the fake cloud
 * copy in fake-backend.ts. The real backup has to split into documents that
 * fit Firestore's limit and join back with every field and log row kept,
 * each month's rows in their order (the logs aren't kept in date order, so
 * joining groups them by month, which nothing in the app depends on, and
 * which leaves every document's hash unchanged). On small states of its
 * own, each flow then checks one rule: a second sync with nothing changed
 * uploads nothing, a change uploads only its own document, a device syncing
 * for the first time adopts the account's data while keeping its own past
 * history, two devices that changed the same month merge it with the later
 * save winning today's rows, an upload that loses the race starts over, and
 * a cloud copy from a newer schema is left alone.
 *
 * Sections:
 *  - Constants
 *  - Helpers
 *  - Module Init
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const DOC_MAX_NUM = 1048576 - 8192; // What: Document Maximum Number. Why: Firestore refuses a document over 1 MiB, including its field names and metadata. How: This is that limit in bytes, minus 8 KiB of room.
const TOD_DAY_STR = '2026-10-20';   // What: Today Day String. Why: Rows dated today follow the winner alone. How: This is the day every flow runs on.

// #endregion Constants



// #region Helpers

const docKeyFun = ( staAppObj : RawSavTyp ) : string => canJsoFun( splStaFun( staAppObj ) ); // What: Document Key Function. Why: Two states hold the same content when their documents match. How: This serializes a state's documents canonically.



const rowBuiFun = ( rowIdeStr : string, datValStr : string ) : RawSavTyp => ({ date : datValStr, id : rowIdeStr }); // What: Row Build Function. Why: Flows add pick log rows on chosen days. How: This builds one with an id and date.



// #region staBuiFun

/**
 * staBuiFun = State Build Function
 *
 * @summary
 * Builds a small app state: one item, whose name stands in for any change to
 * core, and a pick log, which stands in for every log.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param iteNamStr - Item Name String: The item's name.
 * @param picLogArr - Pick Log Array: The pick log's rows.
 *
 * @returns The state.
 *
 * @example
 * ```ts
 * staBuiFun('Dishes', [rowBuiFun('p1', '2026-10-19')]) // => state
 * ```
 *
*/

const staBuiFun = ( iteNamStr : string, picLogArr : RawSavTyp[] ) : RawSavTyp => ({ items : [ { id : 'ite1', name : iteNamStr } ], pickLog : picLogArr, v : 1 }); // What: State Build Function. Why: Each flow starts from a small, known state. How: This builds one.

// #endregion staBuiFun

// #endregion Helpers



// #region Module Init

test( 'the real backup splits into documents under the size limit and joins back with every row kept', () => { // What: Round Trip Test. Why: Syncing must never change or lose data, and Firestore refuses large documents. How: This splits the backup, checks every document's size, and joins it back.


	const fixStaObj = reaFixFun();                                                                                    // What: Fixture State Object. Why: The check runs on real data. How: This reads the backup.
	const fixDocObj = splStaFun( fixStaObj );                                                                         // What: Fixture Document Object. Why: Every document is checked. How: This splits the backup.
	const docSizArr = Object.values( fixDocObj ).map( ( docCurObj ) => Buffer.byteLength( canJsoFun( docCurObj ) ) ); // What: Document Size Array. Why: Each document must fit Firestore's limit. How: This measures each one's canonical JSON in bytes.



	expect( Math.max( ...docSizArr ) ).toBeLessThan( DOC_MAX_NUM );                            // What: Size Assertion. Why: The largest document must fit. How: This compares it with the limit.
	expect( canJsoFun( splStaFun( joiDocFun( fixDocObj ) ) ) ).toBe( canJsoFun( fixDocObj ) ); // What: Round Trip Assertion. Why: Joining must keep every field and row, each month's rows in their order. How: This splits the joined state again and compares its documents with the originals.


} );



test( 'a second sync with nothing changed uploads nothing, and a change uploads only its document', async () => { // What: Upload Scope Test. Why: Syncing must spend writes only on what changed. How: This syncs a state three times, changing core before the third.


	const fakBacObj = fakBacFun();                                                                                 // What: Fake Backend Object. Why: The flow syncs against an empty cloud copy. How: This creates one.
	const locStaObj = staBuiFun( 'Dishes', [ rowBuiFun( 'p1', '2026-09-30' ), rowBuiFun( 'p2', '2026-10-19' ) ] ); // What: Local State Object. Why: The state spans two months. How: This builds it.
	const firResObj = await synRunFun( fakBacObj, locStaObj, 1000, null, TOD_DAY_STR );                            // What: First Result Object. Why: The first sync uploads everything. How: This runs it.
	const secResObj = await synRunFun( fakBacObj, locStaObj, 1000, firResObj.synMetObj, TOD_DAY_STR );             // What: Second Result Object. Why: Nothing changed since. How: This syncs again.



	expect( firResObj.merStaObj ).toBeNull(); // What: Unchanged State Assertion. Why: An empty cloud has nothing to merge in. How: This expects no new state.
	expect( fakBacObj.putIdeArr.map( ( putIdeArr ) => [ ...putIdeArr ].sort() ) ).toEqual( [ [ 'core', 'pickLog-2026-09', 'pickLog-2026-10' ] ] ); // What: First Upload Assertion. Why: Every document goes up once. How: This expects one upload of all three.
	expect( secResObj.pusNeeBoo ).toBe( false );                                                                                                   // What: No Upload Assertion. Why: Nothing changed. How: This expects no upload.
	expect( fakBacObj.getIdeArr ).toEqual( [] );                                                                                                   // What: No Download Assertion. Why: The cloud never changed. How: This expects no downloads.



	await synRunFun( fakBacObj, staBuiFun( 'Laundry', locStaObj.pickLog ), 2000, secResObj.synMetObj, TOD_DAY_STR ); // What: Core Change Sync. Why: Only core changed. How: This syncs a renamed item.



	expect( fakBacObj.putIdeArr[ 1 ] ).toEqual( [ 'core' ] ); // What: Core Upload Assertion. Why: The months didn't change. How: This expects only core uploaded.


} );



test( "a device's first sync adopts the account's data and keeps its own past history", async () => { // What: First Sync Test. Why: Signing in on a new device must never replace the account with that device's data. How: This syncs a second device with its own data and no sync history.


	const fakBacObj = fakBacFun();                                                                                 // What: Fake Backend Object. Why: The account starts empty. How: This creates one.
	const accStaObj = staBuiFun( 'Dishes', [ rowBuiFun( 'p1', '2026-10-19' ) ] );                                  // What: Account State Object. Why: The first device holds the account's data. How: This builds it.
	const devStaObj = staBuiFun( 'Unsaved', [ rowBuiFun( 'd1', '2026-10-05' ), rowBuiFun( 'd2', TOD_DAY_STR ) ] ); // What: Device State Object. Why: The new device has data of its own, saved later, with a past row and a row for today. How: This builds it.



	await synRunFun( fakBacObj, accStaObj, 1000, null, TOD_DAY_STR ); // What: Account Upload. Why: The account exists before the new device signs in. How: This uploads the first device's state.



	const devResObj = await synRunFun( fakBacObj, devStaObj, 5000, null, TOD_DAY_STR );                            // What: Device Result Object. Why: The new device syncs for the first time. How: This runs its sync.
	const expStaObj = staBuiFun( 'Dishes', [ rowBuiFun( 'd1', '2026-10-05' ), rowBuiFun( 'p1', '2026-10-19' ) ] ); // What: Expected State Object. Why: The account's core wins, its past row is kept, and its today row follows the account. How: This builds the expected merge.



	expect( docKeyFun( devResObj.merStaObj ) ).toBe( docKeyFun( expStaObj ) ); // What: Adopted State Assertion. Why: The device takes the account's data plus its own past rows. How: This compares the documents.
	expect( fakBacObj.putIdeArr[ 1 ] ).toEqual( [ 'pickLog-2026-10' ] );       // What: History Upload Assertion. Why: The device's past row joins the account. How: This expects only its month uploaded.


} );



test( 'two devices that changed the same month merge it, with the later save deciding today', async () => { // What: Conflict Merge Test. Why: Offline changes on two devices must both survive, without a removed row coming back. How: This changes one month on both devices and syncs each.


	const fakBacObj = fakBacFun(); // What: Fake Backend Object. Why: Both devices share one cloud copy. How: This creates one.
	const basStaObj = staBuiFun( 'Dishes', [ rowBuiFun( 'p1', '2026-10-19' ), rowBuiFun( 't1', TOD_DAY_STR ) ] );                       // What: Base State Object. Why: Both devices start in sync, with a row for today. How: This builds it.
	const basResObj = await synRunFun( fakBacObj, basStaObj, 1000, null, TOD_DAY_STR );                                                 // What: Base Result Object. Why: The shared starting point is uploaded. How: This syncs it.
	const oneStaObj = staBuiFun( 'Dishes', [ ...basStaObj.pickLog, rowBuiFun( 'a3', '2026-10-18' ), rowBuiFun( 'a4', TOD_DAY_STR ) ] ); // What: One State Object. Why: The first device logs a past row and a today row while offline. How: This extends the base.
	const twoStaObj = staBuiFun( 'Laundry', [ rowBuiFun( 'p1', '2026-10-19' ), rowBuiFun( 'b3', TOD_DAY_STR ) ] );                      // What: Two State Object. Why: The second device renames the item and regenerates today, replacing t1 with b3, and saves last. How: This builds it.



	const twoResObj = await synRunFun( fakBacObj, twoStaObj, 3000, basResObj.synMetObj, TOD_DAY_STR );                                              // What: Two Result Object. Why: The second device syncs first. How: This uploads its changes.
	const oneResObj = await synRunFun( fakBacObj, oneStaObj, 2000, basResObj.synMetObj, TOD_DAY_STR );                                              // What: One Result Object. Why: The first device then finds the cloud changed too. How: This merges and uploads.
	const finResObj = await synRunFun( fakBacObj, twoStaObj, 3000, twoResObj.synMetObj, TOD_DAY_STR );                                              // What: Final Result Object. Why: The second device picks up the merge. How: This syncs it again.
	const expStaObj = staBuiFun( 'Laundry', [ rowBuiFun( 'a3', '2026-10-18' ), rowBuiFun( 'p1', '2026-10-19' ), rowBuiFun( 'b3', TOD_DAY_STR ) ] ); // What: Expected State Object. Why: The later save's core and today rows win, and the past row from offline is kept in day order. How: This builds the expected merge.



	expect( docKeyFun( oneResObj.merStaObj ) ).toBe( docKeyFun( expStaObj ) ); // What: First Device Assertion. Why: It merges to the expected state. How: This compares the documents.
	expect( docKeyFun( finResObj.merStaObj ) ).toBe( docKeyFun( expStaObj ) ); // What: Second Device Assertion. Why: Both devices end up the same. How: This compares the documents.


} );



test( 'display settings stay on each device and never upload', async () => { // What: Device Settings Test. Why: Theme, tab bar placement, and the Data tab's layout suit one screen. How: This changes them on one device and merges a change from another.


	const fakBacObj = fakBacFun(); // What: Fake Backend Object. Why: Two devices share one cloud copy. How: This creates one.
	const oneStaObj = { ...staBuiFun( 'Dishes', [] ), appearance : { theme : 'ink' }, ui : { dataSort : {} } };                                  // What: One State Object. Why: The first device has its own settings. How: This adds them to a small state.
	const oneResObj = await synRunFun( fakBacObj, oneStaObj, 1000, null, TOD_DAY_STR );                                                          // What: One Result Object. Why: The first device uploads. How: This syncs it.
	const thmResObj = await synRunFun( fakBacObj, { ...oneStaObj, appearance : { theme : 'sage' } }, 2000, oneResObj.synMetObj, TOD_DAY_STR );   // What: Theme Result Object. Why: A theme change alone must not upload. How: This syncs a new theme.
	const twoResObj = await synRunFun( fakBacObj, { ...staBuiFun( 'Laundry', [] ), appearance : { theme : 'dusk' } }, 3000, null, TOD_DAY_STR ); // What: Two Result Object. Why: A second device with its own theme joins the account. How: This syncs it for the first time.



	expect( thmResObj.pusNeeBoo ).toBe( false );                               // What: No Upload Assertion. Why: Settings stay local. How: This expects no upload.
	expect( fakBacObj.docTexMap.get( 'core' ) ).not.toContain( 'appearance' ); // What: Cloud Core Assertion. Why: The cloud never holds settings. How: This checks core's text.
	expect( twoResObj.merStaObj?.appearance ).toEqual( { theme : 'dusk' } );   // What: Kept Theme Assertion. Why: Adopting the account keeps this device's theme. How: This reads the merged state's appearance, failing when there's none.


} );



test( 'a device finding its cloud copy deleted uploads its data again rather than wiping itself', async () => { // What: Deleted Copy Test. Why: Deleting the cloud copy from one device must never delete another device's data. How: This syncs, empties the cloud, and syncs again.


	const fakBacObj = fakBacFun();                                                      // What: Fake Backend Object. Why: The flow deletes the cloud copy. How: This creates one.
	const locStaObj = staBuiFun( 'Dishes', [ rowBuiFun( 'p1', '2026-10-19' ) ] );       // What: Local State Object. Why: The device holds data. How: This builds it.
	const firResObj = await synRunFun( fakBacObj, locStaObj, 1000, null, TOD_DAY_STR ); // What: First Result Object. Why: The copy exists before it's deleted. How: This uploads it.


	fakBacObj.docTexMap.clear(); // What: Document Clear. Why: Another device deleted the cloud copy. How: This empties the stored documents.

	fakBacObj.manDelFun(); // What: Manifest Delete. Why: A deleted copy has no manifest either. How: This removes it.


	const secResObj = await synRunFun( fakBacObj, locStaObj, 2000, firResObj.synMetObj, TOD_DAY_STR ); // What: Second Result Object. Why: The device syncs after the deletion. How: This runs it.



	expect( secResObj.merStaObj ).toBeNull();                                                // What: Kept State Assertion. Why: The device's data is untouched. How: This expects no new state.
	expect( fakBacObj.putIdeArr.at( -1 )?.sort() ).toEqual( [ 'core', 'pickLog-2026-10' ] ); // What: Upload Assertion. Why: The device's data goes back up. How: This expects every document uploaded.


} );



test( 'an upload that loses the race starts over, and gives up as busy after four tries', async () => { // What: Race Retry Test. Why: Two devices syncing at once must not overwrite each other. How: This makes uploads lose the race.


	const fakBacObj = fakBacFun(); // What: Fake Backend Object. Why: The flow controls the race. How: This creates one.


	fakBacObj.rejCouObj.couNum = 1; // What: One Lost Race. Why: The first upload loses, as if another device committed. How: This refuses one upload.



	const retResObj = await synRunFun( fakBacObj, staBuiFun( 'Dishes', [] ), 1000, null, TOD_DAY_STR ); // What: Retry Result Object. Why: The sync tries again. How: This runs it.



	fakBacObj.rejCouObj.couNum = 10; // What: Many Lost Races. Why: A sync that keeps losing has to stop. How: This refuses every upload it tries.



	const busResObj = await synRunFun( fakBacObj, staBuiFun( 'Laundry', [] ), 2000, retResObj.synMetObj, TOD_DAY_STR ); // What: Busy Result Object. Why: Every try loses. How: This runs the sync.



	expect( retResObj.synStaStr ).toBe( 'synced' ); // What: Retry Status Assertion. Why: The second try commits. How: This expects synced.
	expect( fakBacObj.putIdeArr.length ).toBe( 1 ); // What: One Commit Assertion. Why: Only the retry landed. How: This counts commits.
	expect( busResObj.synStaStr ).toBe( 'busy' );   // What: Busy Status Assertion. Why: The sync gave up. How: This expects busy.
	expect( fakBacObj.rejCouObj.couNum ).toBe( 6 ); // What: Try Count Assertion. Why: It stops after four tries. How: This expects four of the ten refusals used.


} );



test( 'a cloud copy saved by a newer schema is left alone', async () => { // What: Newer Schema Test. Why: An older app must not merge a shape it doesn't know. How: This marks the cloud's manifest as newer and syncs.


	const fakBacObj = fakBacFun(); // What: Fake Backend Object. Why: The flow edits the stored manifest. How: This creates one.



	await synRunFun( fakBacObj, staBuiFun( 'Dishes', [] ), 1000, null, TOD_DAY_STR ); // What: First Upload. Why: The cloud needs a manifest to mark. How: This uploads a state.



	fakBacObj.manCurFun()!.v = 99; // What: Newer Version Write. Why: The cloud now claims a schema this app doesn't know. How: This raises its version. // What: Non-Null Note. Why: The upload above stored a manifest. How: The ! tells TypeScript it exists.



	const newResObj = await synRunFun( fakBacObj, staBuiFun( 'Laundry', [] ), 2000, null, TOD_DAY_STR ); // What: Newer Result Object. Why: The sync must stop. How: This runs it.



	expect( newResObj.synStaStr ).toBe( 'newer' );  // What: Newer Status Assertion. Why: The caller has to know to wait for an update. How: This expects newer.
	expect( newResObj.merStaObj ).toBeNull();       // What: Unchanged State Assertion. Why: Nothing local changes. How: This expects no new state.
	expect( fakBacObj.putIdeArr.length ).toBe( 1 ); // What: No Upload Assertion. Why: Nothing in the cloud changes. How: This counts commits.


} );

// #endregion Module Init


