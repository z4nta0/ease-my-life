


// #region Imports

import type { PclRowTyp } from '../core/data-model.ts'; // What: Pick-Log Row Type. Why: Merging a partial mirror's pick log reads each row's date. How: This types the rows mirAdoFun filters.
import type { RawSavTyp } from '../core/data-model.ts'; // What: Raw Save Type. Why: A save read back from storage hasn't been migrated yet. How: This types the cached state and every read that returns one.
import type { StaAppTyp } from '../core/data-model.ts'; // What: State App Type. Why: Every write persists the current app state. How: This types each appStaObj parameter.

// #endregion Imports



/**
 * storage.ts = Storage Layer
 *
 * @summary
 * This is the actual persistence engine backing the whole app: IndexedDB
 * primary, localStorage fallback. Why IndexedDB at all:
 * navigator.storage.persist() exempts an origin from eviction, and what
 * it protects is the IDB/Cache bucket, not localStorage. localStorage is
 * the most eviction-prone tier and capped around 5MB, which the pick log
 * will eventually reach on its own. All data still lives only on this
 * device either way, there is no server component to any of it.
 *
 * The async/sync seam this file maintains: iniStoFun (exposed publicly
 * as STG_NAM_OBJ.iniStoFun) runs BEFORE React mounts and parks the
 * loaded state in memory, so store.ts's own loaStaFun() can stay
 * synchronous and no component ever had to become async just to read
 * persisted state. Writes made after that point are fire-and-forget
 * from the caller's own point of view.
 *
 * STG_NAM_OBJ is this file's whole public API, the single object every
 * consuming file imports and calls through, its own external names
 * swept to match the internal implementation exactly after checking
 * the blast radius across pwa.ts, main.tsx, store.ts, and
 * tab-settings.tsx.
 *
 * Sections:
 *  - Constants
 *  - Module State
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const ACC_SIG_STR = 'easemylife.signedin';         // What: Account Signed-In String. Why: The app loads Firebase only for a device that has signed in, so it needs to know that before loading it. How: The sync hook sets this localStorage key on sign-in and removes it on sign-out.
const BOO_DEA_NUM = 3500;                          // What: Boot Deadline Number. Why: A slow IndexedDB must never hold up the app's first paint, and the whole session must then run on localStorage rather than switch engines midway. How: iniStoFun gives up on IndexedDB this many milliseconds after boot starts.
const BOO_KEY_STR = 'easemylife.idbboots';         // What: Boots Key String. Why: This is the localStorage key counting how many times IDB has booted cleanly in a row. How: This is read and incremented inside iniStoFun to decide when the migration snapshot and dead pre-IDB generations can be safely swept.
const DAT_NAM_STR = 'easemylife';                  // What: Database Name String. Why: This is the fixed IndexedDB database name every browser profile opens under. How: This is passed as the first argument to indexedDB.open inside opeDatFun.
const DAT_VER_NUM = 1;                             // What: Database Version Number. Why: This is the fixed IndexedDB schema version, structural only, tracking which object stores exist rather than their contents. How: This is passed as the second argument to indexedDB.open inside opeDatFun.
const MIG_SNA_STR = 'easemylife.snapshot.pre-idb'; // What: Migration Snapshot String. Why: This is the bounded-lifetime rollback copy taken right before the very first IDB migration attempt. How: This is written once in iniStoFun and re-exported as-is on the STG_NAM_OBJ object below.
const MIR_KEY_STR = 'easemylife.v2';               // What: Mirror Key String. Why: This is the legacy live localStorage key that also doubles as the warm mirror's own key, read by every fallback-engine caller of this file. How: This is written by wriLocFun and read by reaLocFun, and re-exported as-is on the STG_NAM_OBJ object below.
const MIR_TIM_STR = 'easemylife.mirrorat';         // What: Mirror Time String. Why: Mirror freshness must survive a reload, not just live in memory, since the Settings storage panel reports it on a cold load before any tab-hide has happened this session. How: This is written by wriLocFun and read by staRepFun.
const PER_ASK_STR = 'easemylife.persistasked';     // What: Persist Ask String. Why: This is the localStorage key recording whether this device has already been asked for persistent storage once, so a denial is not re-requested on every later launch (browsers ignore a repeat request anyway). How: pwa.ts reads and writes it through STG_NAM_OBJ, and the boot sweep keeps it.
const PIC_LOG_STR = 'picklog';                     // What: Pick Log String. Why: This is the object store name holding the pick log alone, under key 'main', kept separate so writing it is not on the hot path of every other save. How: This is passed to traStoFun everywhere the pick log alone is read or written.
const SIG_EMA_STR = 'easemylife.signinemail';      // What: Sign-In Email String. Why: Finishing an emailed-link sign-in needs the address the link was sent to. How: The sync hook stores the address here when it sends a link and removes it once the link is used.
const STA_STO_STR = 'state';                       // What: State Store String. Why: This is the object store name holding everything except the pick log, under key 'main'. How: This is passed to traStoFun everywhere the non-log portion of state is read or written.
const SYN_MET_STR = 'easemylife.syncmeta';         // What: Sync Meta String. Why: Each sync compares against what this device last synced, and conflicts need the time of its last change. How: The sync hook keeps that record here as JSON.



const LIV_KEY_ARR = [ ACC_SIG_STR, BOO_KEY_STR, MIR_KEY_STR, MIR_TIM_STR, PER_ASK_STR, SIG_EMA_STR, SYN_MET_STR ]; // What: Live Key Array. Why: The boot sweep deletes every owned localStorage key from a dead generation, so every key still in use has to be named here or it's deleted too (the persistence prompt's key once was, so the app asked again). How: The sweep keeps every key in this list.



/**
 * OWN_KEY_REG = Own Key Regexp
 *
 * @summary
 * Matches every localStorage key this app has ever written, across
 * every past naming generation ('ease-my-life-v1', 'easemylife.v1',
 * 'easemylife.v2', ...). This is a prefix match rather than a fixed
 * list precisely so wipDatFun's "Delete all data" and iniStoFun's
 * dead-generation sweep both catch whatever future key generation
 * this app ever writes next, not just the ones already known about
 * today.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const OWN_KEY_REG = /^ease[-]?my[-]?life/i; // What: Own Key Regexp. Why: Every localStorage key this app owns, across every naming generation, must be found by pattern rather than by a fixed list. How: This is tested against each localStorage key inside ownKeyFun below.



/**
 * SNA_KEE_NUM = Snapshot Keep Number
 *
 * @summary
 * The migration snapshot (MIG_SNA_STR) exists purely to roll back a bad
 * migration, not to live forever. A permanent plaintext copy of
 * everything would survive "Delete all data" and break the app's own
 * on-device-only promise, so it is dropped once IDB has proven itself
 * over this many clean boots in a row.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const SNA_KEE_NUM = 3; // What: Snapshot Keep Number. Why: This is how many clean IDB boots in a row are required before the migration snapshot and every dead pre-IDB localStorage generation get swept. How: This is compared against BOO_KEY_STR's own stored count inside iniStoFun.

// #endregion Constants



// #region Module State

let booAbaBoo : boolean               = false;     // What: Boot Abandoned Boolean. Why: An IndexedDB boot that runs past the deadline must not open or use a connection afterward. How: This is set by iniStoFun's fallback and checked by idbBooFun once its open settles.
let cacStaObj : RawSavTyp             = null;      // What: Cached State Object. Why: This is the state iniStoFun loaded, held in memory so later synchronous reads (like STG_NAM_OBJ.cacStaFun()) do not need to touch storage again. How: This starts null (a fresh install) and is assigned inside iniStoFun.
let curEngStr : string                = 'memory';  // What: Current Engine String. Why: Every read/write in this file needs to know which backend is actually of record right now: 'idb', 'localStorage', or the fallback 'memory'. How: This starts at 'memory' and is updated by iniStoFun/savStaFun whenever the active engine changes.
let datConObj : IDBDatabase | null    = null;      // What: Database Connection Object. Why: Every other function in this file that talks to IndexedDB needs the same open connection. How: This starts null (no connection yet) and is assigned by iniStoFun once opeDatFun resolves.
let lplRefArr : unknown[] | undefined = undefined; // What: Last-Pick-Log Reference Array. Why: wriDatFun must know whether the pick log actually changed since the last write, to avoid re-serializing the largest and fastest-growing piece of state on every save. How: This holds the exact array reference last written, compared with !== inside wriDatFun.
let mirWriBoo : boolean               = true;      // What: Mirror Write Boolean. Why: The Settings storage panel needs to know whether the last localStorage mirror write actually succeeded. How: This is flipped by wriLocFun on every call, true on success, false on a quota (or similar) failure.



/**
 * logSusBoo = Log Suspect Boolean
 *
 * @summary
 * True when the in-memory state was adopted from the warm localStorage
 * mirror, which deliberately omits the pick log (see wriLocFun). Such a
 * state's own pickLog is therefore an artefact: an empty array standing
 * in for history that was simply never read, not real evidence that
 * history is actually empty. Writing that artefact back as-is would
 * erase the real log still sitting in IDB. This is exactly how an
 * export taken right after a fallback boot once came out with no
 * history in it at all.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

let logSusBoo = false; // What: Log Suspect Boolean. Why: wriDatFun must refuse to let a suspect empty pickLog overwrite real history in IDB. How: This is computed in iniStoFun from the loaded state's own __mirrorNoLog or __logPartial marker, checked in wriDatFun, read by wriLocFun to mark a full write's pick log partial, and cleared by logAutFun.

// #endregion Module State



// #region Helpers

// #region IndexedDB Access

// #region opeDatFun

/**
 * opeDatFun = Open Database Function
 *
 * @summary
 * Opens (or creates, on a first run) the app's own IndexedDB database,
 * ensuring both object stores exist, and settles once the connection is
 * actually ready. Safari can leave its own open() call hanging
 * indefinitely instead of ever firing onsuccess, onerror, or onblocked,
 * so this also races a fixed timeout against all three of those.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns A Promise resolving to the opened IDBDatabase instance, or
 * rejecting when IndexedDB is unavailable, blocked by another tab, or
 * hangs past its own open timeout.
 *
 * @example
 * ```ts
 * opeDatFun() // => Promise<IDBDatabase>
 * ```
 *
*/

function opeDatFun () : Promise< IDBDatabase > {


	return new Promise( ( resValFun, rejErrFun ) => { // What: Open Database Promise. Why: The caller needs a real Promise it can await, not indexedDB.open's own request-object callback style. How: This wraps the whole open/upgrade/timeout sequence below and settles resValFun/rejErrFun exactly once.


		if ( !window.indexedDB ) return rejErrFun( new Error( 'no indexedDB' ) ); // What: No IndexedDB Guard. Why: Some browsers/modes (very old browsers, some private-mode configurations) expose no indexedDB global at all. How: This rejects immediately rather than calling indexedDB.open on an object that does not exist.



		let opeReqObj; // What: Open Request Object. Why: The actual open() call can itself throw in some environments rather than returning a request object. How: This is declared here so the try/catch below can assign it without redeclaring it.



		try { opeReqObj = indexedDB.open( DAT_NAM_STR, DAT_VER_NUM ); } // What: Database Open Try. Why: This is the actual call that opens (or creates) the database, keyed by DAT_NAM_STR and DAT_VER_NUM. How: This assigns the resulting IDBOpenDBRequest to opeReqObj for the handlers below.

		catch ( errCatObj ) { return rejErrFun( errCatObj ); } // What: Database Open Guard. Why: A thrown open() call has nothing further to attach handlers to. How: This rejects immediately with whatever error indexedDB.open itself threw.



		opeReqObj.onupgradeneeded = () => { // What: Upgrade Needed Handler Assignment. Why: A first run (or a real version bump) needs both of this app's own object stores created before anything else can read or write them. How: This creates STA_STO_STR and PIC_LOG_STR whenever either is missing from the database being opened.


			const upgDatObj = opeReqObj.result; // What: Upgrade Database Object. Why: The object stores below must be created on the very database currently being upgraded. How: This reads opeReqObj's own result, which during onupgradeneeded is that in-progress IDBDatabase.


			if ( !upgDatObj.objectStoreNames.contains( STA_STO_STR ) ) upgDatObj.createObjectStore( STA_STO_STR ); // What: State Store Creation Check. Why: The state object store must exist before anything can be read from or written to it. How: This creates it only when it is not already present, so a later version bump never re-creates an existing store.



			if ( !upgDatObj.objectStoreNames.contains( PIC_LOG_STR ) ) upgDatObj.createObjectStore( PIC_LOG_STR ); // What: Pick Log Store Creation Check. Why: The pick log object store must exist before anything can be read from or written to it. How: This creates it only when it is not already present, so a later version bump never re-creates an existing store.


		};


		opeReqObj.onsuccess = () => resValFun( opeReqObj.result );           // What: Open Success Handler Assignment. Why: A successful open must resolve the wrapping Promise with the now-ready database connection. How: This calls resValFun with opeReqObj's own result.
		opeReqObj.onerror   = () => rejErrFun( opeReqObj.error );            // What: Open Error Handler Assignment. Why: A failed open must reject the wrapping Promise with that failure's own error. How: This calls rejErrFun with opeReqObj's own error.
		opeReqObj.onblocked = () => rejErrFun( new Error( 'idb blocked' ) ); // What: Open Blocked Handler Assignment. Why: A pending version change blocked by another open tab must not hang the caller forever. How: This rejects with a dedicated error the moment onblocked fires.


		setTimeout( () => rejErrFun( new Error( 'idb open timeout' ) ), 3000 ); // What: Open Hang Timeout Call. Why: Safari can leave open() hanging indefinitely rather than ever firing onsuccess, onerror, or onblocked. How: This rejects the wrapping Promise after 3 seconds if none of those handlers has fired by then.


	} );


}

// #endregion opeDatFun



const reqProFun = < T >( idbReqObj : IDBRequest< T > ) : Promise< T > => new Promise( ( resValFun, rejErrFun ) => { // What: Request Promise Function. Why: Every IndexedDB request needs to be awaited like a normal Promise rather than driven through its own onsuccess/onerror callbacks by hand at every call site. How: This wraps the given IDBRequest in a new Promise, resolving with its own result on success and rejecting with its own error on failure.


	idbReqObj.onsuccess = () => resValFun( idbReqObj.result ); // What: Success Handler Assignment. Why: A successful IndexedDB request must resolve the wrapping Promise with that request's own result. How: This assigns an onsuccess handler that calls resValFun with idbReqObj.result.

	idbReqObj.onerror   = () => rejErrFun( idbReqObj.error ); // What: Error Handler Assignment. Why: A failed IndexedDB request must reject the wrapping Promise with that request's own error. How: This assigns an onerror handler that calls rejErrFun with idbReqObj.error.


} );



// #region traStoFun

/**
 * traStoFun = Transaction Store Function
 *
 * @summary
 * Opens a fresh transaction on datConObj and returns the requested
 * object store from it, the one-line building block every other
 * IndexedDB read/write in this file is expressed in terms of.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param stoNamStr - Store Name String: Which object store to open,
 *                    STA_STO_STR or PIC_LOG_STR.
 * @param modValStr - Mode Value String: The transaction mode, 'readonly' or
 *                    'readwrite'.
 *
 * @returns The requested IDBObjectStore, opened within a brand new
 * transaction on datConObj.
 *
 * @example
 * ```ts
 * traStoFun(stoNamStr, modValStr) // => IDBObjectStore
 * ```
 *
*/

function traStoFun ( stoNamStr : string, modValStr : IDBTransactionMode ) : IDBObjectStore { return datConObj!.transaction( stoNamStr, modValStr ).objectStore( stoNamStr ); } // What: Transaction Store Body. Why: Every IndexedDB read/write elsewhere in this file needs a freshly-opened store to call get/put/clear on. How: This opens one transaction on datConObj in the given mode and returns its own named object store. // What: Non-Null Note. Why: Every caller checks that IndexedDB is the engine and its connection is open first. How: The ! tells TypeScript datConObj is set here.

// #endregion traStoFun



// #region reaDatFun

/**
 * reaDatFun = Read Database Function
 *
 * @summary
 * Reads the full persisted state back from IndexedDB, merging the
 * separately-stored pick log back onto the rest of state.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns A Promise resolving to the full persisted state object with
 * its own pickLog merged back in, or null when the state store has
 * nothing written to it yet (a fresh install).
 *
 * @example
 * ```ts
 * reaDatFun() // => persisted state object or null
 * ```
 *
*/

async function reaDatFun () : Promise< RawSavTyp > {


	const resStaObj = await reqProFun( traStoFun( STA_STO_STR, 'readonly' ).get( 'main' ) ); // What: Rest State Object. Why: The non-pickLog portion of state lives in its own object store, read independently from the log. How: This awaits reqProFun wrapping a get('main') request against the state object store.


	if ( !resStaObj ) return null; // What: No Rest State Guard. Why: A fresh install has nothing in the state store yet, so there is nothing to merge a pickLog onto at all. How: This returns null immediately when the state store's own 'main' record does not exist.



	const picLogArr = await reqProFun( traStoFun( PIC_LOG_STR, 'readonly' ).get( 'main' ) ); // What: Pick Log Array. Why: The append-only pick log lives in its own separate object store, read independently from the rest of state. How: This awaits reqProFun wrapping a get('main') request against the pick log object store.



	return { // What: Rest State Return. Why: The caller needs the two separately-stored pieces merged back into one full state object. How: This spreads resStaObj and reattaches picLogArr as its own pickLog field.


		...resStaObj, // What: Rest State Spread. Why: Every field but the pick log comes from the main store. How: This spreads resStaObj in first.

		pickLog : picLogArr || [] // What: Pick Log. Why: The pick log lives in its own store and has to rejoin the state. How: This reattaches picLogArr, or an empty array for a state store written before this split ever existed.


	};


}

// #endregion reaDatFun



// #region wriDatFun

/**
 * wriDatFun = Write Database Function
 *
 * @summary
 * Writes state to IndexedDB, split across its two object stores. The
 * pick log is only ever re-serialized and rewritten when it actually
 * changed, since it is the largest and fastest-growing piece of data
 * and re-serializing it on every keystroke is exactly the write jank
 * this split exists to remove. A placeholder empty log is never allowed
 * to overwrite real history: only an explicit import or reset (via
 * logAutFun) may declare an empty pickLog authoritative.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param appStaObj - App State Object: The full app state object to persist.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * wriDatFun(appStaObj) // => void
 * ```
 *
*/

async function wriDatFun ( appStaObj : StaAppTyp ) : Promise< void > {


	const { pickLog : picLogArr, ...resStaObj } = appStaObj; // What: Rest State Object Destructure. Why: The pick log and the rest of state are written to two separate object stores and must be split apart before either write happens. How: This pulls pickLog out as picLogArr, leaving every other field in resStaObj.

	const cloStaObj = JSON.parse( JSON.stringify( resStaObj ) ); // What: Clone State Object. Why: Structured clone cannot take proxies or functions, and although state is meant to be plain JSON, round-tripping it here defensively means a stray non-clonable value cannot kill the whole write. How: This serializes resStaObj to JSON text and immediately parses it back into a plain object.


	delete cloStaObj.__mirrorNoLog; // What: Mirror Marker Strip. Why: The marker only describes one warm-mirror copy whose pickLog was left out, so IndexedDB must never keep it, not even when that copy is migrated in after a wipe. How: This deletes it from the clone before the write below.
	delete cloStaObj.__logPartial;  // What: Partial Log Marker Strip. Why: The marker only describes a localStorage copy whose pick log may be incomplete, so IndexedDB must never keep it. How: This deletes it from the clone before the write below.

	cloStaObj.__savedAt = Date.now(); // What: Saved At Stamp. Why: iniStoFun compares this against the localStorage mirror's own stamp to boot from whichever copy was saved last. How: This stamps the clone with the current time in milliseconds.


	await reqProFun( traStoFun( STA_STO_STR, 'readwrite' ).put( cloStaObj, 'main' ) ); // What: State Store Put Call. Why: This is the actual write of the non-pickLog portion of state into its own object store. How: This awaits reqProFun wrapping a put(cloStaObj, 'main') request against the state object store.



	const logEmpBoo = !picLogArr || !picLogArr.length; // What: Log Empty Boolean. Why: Later logic must tell an intentionally-empty pick log apart from one that is empty only because it was never actually read from the mirror. How: This is true whenever picLogArr is missing or has no entries.


	if ( logSusBoo && logEmpBoo ) return; // What: Suspect Empty Log Guard. Why: A placeholder empty log adopted from the warm mirror must never overwrite the real pick log history already sitting in IDB. How: This bails out before the pick log store is touched at all, whenever both logSusBoo and logEmpBoo hold.



	if ( picLogArr !== lplRefArr ) { // What: Pick Log Changed Check. Why: The pick log should only be re-serialized and rewritten when it has actually changed, not on every save. How: This compares picLogArr against the reference last written, skipping the whole block below when they are the exact same reference.


		await reqProFun( traStoFun( PIC_LOG_STR, 'readwrite' ).put( JSON.parse( JSON.stringify( picLogArr || [] ) ), 'main' ) ); // What: Pick Log Store Put Call. Why: This is the actual write of the pick log into its own object store, JSON round-tripped for the same defensive reason as cloStaObj above. How: This awaits reqProFun wrapping a put request against the pick log object store.

		lplRefArr = picLogArr; // What: Last-Pick-Log Reference Update. Why: The next call needs to compare against whatever was just written. How: This overwrites lplRefArr with the freshly-written picLogArr.

		if ( !logEmpBoo ) logSusBoo = false; // What: Log No Longer Suspect Check. Why: A real, non-empty pick log write proves the in-memory state was not a mirror artefact after all. How: This clears logSusBoo, but only when this write's own picLogArr was not itself empty.


	}


}

// #endregion wriDatFun

// #endregion IndexedDB Access



// #region Local Mirror

// #region ownKeyFun

/**
 * ownKeyFun = Own Key Function
 *
 * @summary
 * Enumerates every localStorage key this app currently owns, per
 * OWN_KEY_REG above. wipDatFun uses this so "Delete all data" really
 * does, and iniStoFun uses it to sweep dead pre-IDB generations once
 * IDB has proven itself over SNA_KEE_NUM clean boots.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns Every localStorage key this app currently owns, or an empty
 * array if localStorage itself cannot be read at all (private mode, a
 * blocked/opaque origin, ...).
 *
 * @example
 * ```ts
 * ownKeyFun() // => array of owned localStorage keys
 * ```
 *
*/

function ownKeyFun () : string[] {


	try { return Object.keys( localStorage ).filter( ( curKeyStr ) => OWN_KEY_REG.test( curKeyStr ) ); } // What: Owned Key Filter Try. Why: Every current localStorage key must be checked against OWN_KEY_REG to find the ones this app has ever written. How: This filters every key currently in localStorage down to the ones OWN_KEY_REG matches.

	catch { return []; } // What: Owned Key Read Guard. Why: A private-mode or otherwise inaccessible localStorage must not crash whichever caller invoked this. How: This returns an empty array instead of letting the read throw.


}

// #endregion ownKeyFun



// #region reaLocFun

/**
 * reaLocFun = Read Local Function
 *
 * @summary
 * Reads and parses the warm localStorage mirror (or legacy pre-IDB
 * data) back into a state object. The warm mirror deliberately omits
 * pickLog (see wriLocFun), while legacy pre-IDB data still has it;
 * either way the rest of this app needs the pickLog array present, so
 * a missing one is backfilled here.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns The parsed localStorage state object, or null when nothing
 * is stored under MIR_KEY_STR, or the stored value fails to parse.
 *
 * @example
 * ```ts
 * reaLocFun() // => parsed localStorage state or null
 * ```
 *
*/

function reaLocFun () : RawSavTyp {


	try { // What: Local Read Try. Why: Both localStorage.getItem and JSON.parse can throw (a blocked origin, corrupted data), and either failure should be treated the same way. How: This wraps the whole read-and-parse sequence below so any such error falls through to the catch's own null return.


		const rawJsoStr = localStorage.getItem( MIR_KEY_STR ); // What: Raw Json String. Why: The mirror's own raw text must be read before it can be parsed. How: This reads whatever is currently stored under MIR_KEY_STR.


		if ( !rawJsoStr ) return null; // What: No Raw Json Guard. Why: A fresh install (or one that has never fallen back to localStorage) has nothing stored under MIR_KEY_STR at all. How: This returns null immediately rather than attempting to parse an empty value.



		const parStaObj = JSON.parse( rawJsoStr ); // What: Parsed State Object. Why: The caller needs a real object, not the raw JSON text. How: This parses rawJsoStr into a plain JS object.


		if ( parStaObj && !Array.isArray( parStaObj.pickLog ) ) parStaObj.pickLog = []; // What: Pick Log Backfill Check. Why: Every reader of this state elsewhere in the app expects pickLog to be a real array, but the warm mirror deliberately omits it. How: This backfills an empty array onto parStaObj whenever its own pickLog is missing or not already an array.



		return parStaObj; // What: Parsed State Return. Why: The caller needs the fully-parsed, backfilled state object back. How: This returns the same object read and normalized above.


	}

	catch ( errCatObj ) { // What: Local Read Guard. Why: A blocked origin or corrupted stored value must not crash whichever caller invoked this. How: This returns null instead of letting the read or parse throw.


		console.warn( errCatObj ); // What: Error Warning Call. Why: A real failure here should stay visible to anyone debugging. How: This logs the caught error as a console warning.



		return null; // What: Null Fallback Return. Why: The caller treats null as nothing to read. How: This returns null after the warning.


	}


}

// #endregion reaLocFun



// #region wriLocFun

/**
 * wriLocFun = Write Local Function
 *
 * @summary
 * Synchronous, best-effort warm copy of state to localStorage. pickLog
 * is excluded by default: it is the bulk of the payload, and the whole
 * point of giving it its own IDB store was to stop re-serializing it,
 * so mirroring it on every tab switch would undo that. It is also the
 * most reconstructible and least critical data of everything this app
 * stores; losing history beats losing pickers. fulWriBoo forces
 * everything to be written anyway, for the fallback-engine case where
 * localStorage itself is the actual store of record.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param appStaObj - App State Object: The full app state object to mirror.
 * @param fulWriBoo - Full Writer Boolean: Whether to write pickLog too,
 *                    instead of excluding it. True whenever localStorage is
 *                    the store of record rather than just a warm mirror of
 *                    IDB.
 *
 * @returns Whether the localStorage write succeeded.
 *
 * @example
 * ```ts
 * wriLocFun(appStaObj, fulWriBoo) // => true or false
 * ```
 *
*/

function wriLocFun ( appStaObj : StaAppTyp, fulWriBoo : boolean ) : boolean {


	try { // What: Local Write Try. Why: localStorage.setItem can throw on quota, and that failure must be surfaced rather than crash the caller. How: This wraps the whole build-and-write sequence below so a quota failure falls through to the catch below instead.


		let payDatObj : StaAppTyp | ( Omit< StaAppTyp, 'pickLog' > & { __mirrorNoLog : true } ) = appStaObj; // What: Payload Data Object. Why: The value actually written depends on fulWriBoo, computed just below. How: This starts as appStaObj itself and is only replaced when fulWriBoo is false.


		if ( !fulWriBoo ) { // What: Not Full Write Check. Why: A warm-mirror write (as opposed to a fallback-engine write) must exclude pickLog entirely. How: This rebuilds payDatObj without pickLog, flagged with __mirrorNoLog, whenever fulWriBoo is false.


			const { pickLog : picLogArr, ...resStaObj } = appStaObj; // What: Rest State Object Destructure. Why: pickLog must be pulled out before the remaining fields become the actual mirror payload. How: This pulls pickLog out as picLogArr (discarded below) and keeps every other field in resStaObj.

			payDatObj = { ...resStaObj, __mirrorNoLog : true }; // What: Payload Data Object Rebuild. Why: A later reader (reaLocFun/iniStoFun) needs to know this specific copy's own pickLog is a stand-in, not real history. How: This spreads resStaObj and adds the __mirrorNoLog marker field.


		}



		const staDatObj = { // What: Stamped Data Object. Why: iniStoFun needs to know when this copy was saved, and whether its pick log is complete, to decide whether it should replace an older IndexedDB copy. How: This adds the save time, plus a partial-log marker on a full write whose pick log started from the warm mirror.


			...payDatObj,                                                // What: Payload Data Spread. Why: Every field being written carries over unchanged. How: This spreads payDatObj before the markers below.
			...( fulWriBoo && logSusBoo ? { __logPartial : true } : {} ), // What: Partial Log Marker Spread. Why: A localStorage session that booted from the warm mirror only holds the picks made since, so its pick log must never replace the full history in IndexedDB. How: This adds __logPartial to a full write while logSusBoo still holds.

			__savedAt : Date.now() // What: Saved At. Why: iniStoFun compares this against IndexedDB's own stamp. How: This is the current time in milliseconds.


		};



		localStorage.setItem( MIR_KEY_STR, JSON.stringify( staDatObj ) ); // What: Local Storage Set Call. Why: This is the actual mirror write every caller of wriLocFun exists to perform. How: This serializes staDatObj to JSON text and writes it under MIR_KEY_STR.

		mirWriBoo = true; // What: Mirror Write Boolean Update. Why: A successful write here means the mirror is now trustworthy again after any earlier failure. How: This sets mirWriBoo true unconditionally, reached only once setItem above has not thrown.



		try { localStorage.setItem( MIR_TIM_STR, new Date().toISOString() ); } // What: Mirror Time Set Try. Why: The Settings storage panel reports backup freshness on a cold load, before any tab-hide has happened this session, so this timestamp must be persisted rather than kept only in memory. How: This writes the current time under MIR_TIM_STR.

		catch {} // What: Mirror Time Set Guard. Why: A failure to record the freshness timestamp is a cosmetic loss, not a reason to fail the whole mirror write. How: This silently ignores any error from the inner setItem call above.



		return true; // What: Local Write Success Return. Why: The caller needs to know the mirror write actually went through. How: This returns true once every step above has completed without throwing.


	}

	catch ( errCatObj ) { // What: Local Write Guard. Why: A quota failure is non-fatal (IDB is the real store of record when it is available), but the resulting stale mirror is a liability if IDB later fails, so it must be surfaced rather than silently swallowed. How: This flips mirWriBoo false and returns false instead of letting the quota error propagate.


		console.warn( errCatObj ); // What: Error Warning Call. Why: A real failure here should stay visible to anyone debugging. How: This logs the caught error as a console warning.


		mirWriBoo = false; // What: Mirror Write Boolean Failure Update. Why: staRepFun's own status report must reflect that the last mirror write did not actually succeed. How: This sets mirWriBoo false.



		return false; // What: Local Write Failure Return. Why: The caller needs to know the mirror write did not go through. How: This returns false to signal the failure caught above.


	}


}

// #endregion wriLocFun

// #endregion Local Mirror



// #region Lifecycle

// #region cacStaFun

/**
 * cacStaFun = Cached State Function
 *
 * @summary
 * The state iniStoFun loaded before React mounted, handed back
 * synchronously so store.ts's own loaStaFun never has to await. It is
 * null until iniStoFun has run, and after that it is the same object
 * reference, not a copy.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns The loaded state object, or null before iniStoFun has run.
 *
 * @example
 * ```ts
 * cacStaFun() // => loaded state object
 * ```
 *
*/

const cacStaFun = () : RawSavTyp => cacStaObj; // What: Cached State Function. Why: store.ts's own loaStaFun() reads this synchronously to seed React state before any save has happened yet. How: This closes over the module-private cacStaObj rather than exposing it directly.

// #endregion cacStaFun



// #region fluSynFun

/**
 * fluSynFun = Flush Sync Function
 *
 * @summary
 * Called on pagehide/tab-hide. Mirrors synchronously to localStorage
 * first, so a later IDB failure on the very next boot still falls back
 * to warm data instead of a seed, then kicks the async IDB write too
 * for good measure.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param appStaObj - App State Object: The full app state object to persist.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * fluSynFun(appStaObj) // => void
 * ```
 *
*/

function fluSynFun ( appStaObj : StaAppTyp ) : void {


	wriLocFun( appStaObj, curEngStr !== 'idb' ); // What: Sync Local Write Call. Why: A tab about to be hidden or torn down needs a synchronous mirror write it cannot risk missing. How: This calls wriLocFun immediately, writing pickLog too whenever IDB is not the current engine of record.


	if ( curEngStr === 'idb' && datConObj ) wriDatFun( appStaObj ).catch( () => {} ); // What: Async Database Write Call. Why: The real IDB write should still be attempted alongside the synchronous mirror above, for good measure. How: This fires wriDatFun without awaiting it, swallowing any failure since the sync mirror above is already the safety net.


}

// #endregion fluSynFun



// #region mirAdoFun

/**
 * mirAdoFun = Mirror Adopt Function
 *
 * @summary
 * Decides whether the localStorage copy is newer than IndexedDB's, and if so
 * builds the state to boot from. Both copies carry a __savedAt stamp, and the
 * mirror can end up newer in two ways: a whole session ran on localStorage
 * because IndexedDB hung at boot, or the async IndexedDB write fired as the
 * tab hid never finished. Before this check, IndexedDB always won, so every
 * change in such a session (custom holidays included) was silently rolled
 * back on the next launch and then overwritten in the mirror too.
 *
 * The pick log needs care, since the mirror's may not be the whole history.
 * A warm mirror (__mirrorNoLog) has none at all, so IndexedDB's is kept. A
 * full write marked __logPartial came from a session that booted from the
 * warm mirror, so it only holds that session's picks: IndexedDB's history is
 * kept, plus the session's rows for any day IndexedDB has none for. Any
 * other full write is the complete log and is adopted as is. A copy without
 * a stamp (one written before stamps existed) never replaces IndexedDB.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param idbStaObj - IndexedDB State Object: The state read back from
 *                    IndexedDB.
 * @param mirStaObj - Mirror State Object: The state read back from the
 *                    localStorage mirror, or null when there is none.
 *
 * @returns The state to adopt in place of IndexedDB's, or null when
 * IndexedDB's copy should be kept.
 * @see {@link adoStaObj}
 *
 * @example
 * ```ts
 * mirAdoFun(idbStaObj, reaLocFun()) // => adopted state or null
 * ```
 *
*/

function mirAdoFun ( idbStaObj : RawSavTyp, mirStaObj : RawSavTyp ) : RawSavTyp {


	const idbTimNum = idbStaObj.__savedAt;                                            // What: IndexedDB Time Number. Why: IndexedDB's copy is kept unless the mirror was saved after it. How: This is IndexedDB's own save stamp, undefined for a copy saved before stamps existed.
	const mirTimNum = mirStaObj ? mirStaObj.__savedAt : null;                         // What: Mirror Time Number. Why: The mirror only wins when it was saved later. How: This is the mirror's own save stamp, or null when there is no mirror.
	const bthStaBoo = typeof idbTimNum === 'number' && typeof mirTimNum === 'number'; // What: Both Stamped Boolean. Why: Two copies can only be compared when both carry a stamp. How: This is true when both stamps are numbers.


	if ( !bthStaBoo || mirTimNum <= idbTimNum ) return null; // What: Keep IndexedDB Guard. Why: An unstamped or older mirror must never replace IndexedDB's copy. How: This returns null so the caller keeps IndexedDB's state.



	const idbLogArr = idbStaObj.pickLog || [];                                                                             // What: IndexedDB Log Array. Why: IndexedDB's pick log is the full history whenever the mirror's isn't. How: This reads it, defaulting to an empty array.
	const idbDatSet = new Set( idbLogArr.map( ( logRowObj : PclRowTyp ) => logRowObj.date ) );                             // What: IndexedDB Date Set. Why: A partial mirror only adds rows for days IndexedDB has none for, so a day is never counted twice. How: This collects every date IndexedDB's log covers.
	const newLogArr = ( mirStaObj.pickLog || [] ).filter( ( logRowObj : PclRowTyp ) => !idbDatSet.has( logRowObj.date ) ); // What: New Log Array. Why: A partial mirror's rows for days IndexedDB never saw are the fallback session's own history. How: This keeps the mirror rows whose date isn't in idbDatSet.

	const adoLogArr = mirStaObj.__mirrorNoLog // What: Adopted Log Array. Why: The adopted state needs the most complete pick log available. How: This picks IndexedDB's log, IndexedDB's log plus the new days, or the mirror's own log.
		? idbLogArr                         // What: Warm Mirror Branch. Why: A warm mirror holds no pick log at all. How: This keeps IndexedDB's.
		: mirStaObj.__logPartial           // What: Partial Log Check. Why: A partial log only holds one fallback session's picks. How: This branches on the marker.
			? [ ...idbLogArr, ...newLogArr ] // What: Partial Log Branch. Why: The full history must survive, with the session's new days added. How: This appends newLogArr to IndexedDB's log.
			: mirStaObj.pickLog;             // What: Full Log Branch. Why: An unmarked full write holds the complete log. How: This adopts the mirror's own.

	const adoStaObj = { ...mirStaObj, pickLog : adoLogArr }; // What: Adopted State Object. Why: This is the newer state the app boots from. How: This spreads the mirror and sets the chosen pick log.



	delete adoStaObj.__logPartial;  // What: Partial Log Marker Strip. Why: The adopted pick log is now complete. How: This deletes the marker.
	delete adoStaObj.__mirrorNoLog; // What: Mirror Marker Strip. Why: The adopted pick log is now complete. How: This deletes the marker.



	return adoStaObj; // What: Adopted State Return. Why: The caller boots from the newer copy. How: This returns adoStaObj.


}

// #endregion mirAdoFun



// #region idbBooFun

/**
 * idbBooFun = IndexedDB Boot Function
 *
 * @summary
 * Opens IndexedDB and loads the state iniStoFun should boot from: the stored
 * copy, the localStorage mirror when mirAdoFun finds it newer (written back
 * to IndexedDB at once), or, on a first IndexedDB run, the migrated legacy
 * localStorage data, keeping an untouched rollback snapshot until the new
 * store has proven it can read its own data back. It never sets curEngStr
 * or cacStaObj itself: iniStoFun races it against BOO_DEA_NUM and commits
 * the result only when it wins, so a boot that runs late can't switch an
 * app already running on localStorage over to IndexedDB. A connection that
 * opens after the deadline is closed again.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns A Promise resolving to the state to boot from, or null for a
 * fresh install. It rejects when IndexedDB can't be opened or read, or a
 * first migration can't be verified.
 *
 * @example
 * ```ts
 * idbBooFun() // => Promise<state or null>
 * ```
 *
*/

async function idbBooFun () : Promise< RawSavTyp > {


	const opeConObj = await opeDatFun(); // What: Open Connection Object. Why: Every read and write below needs an open connection. How: This awaits opeDatFun.


	if ( booAbaBoo ) { // What: Abandoned Boot Check. Why: A connection that opens after iniStoFun gave up must not be used or left open. How: This closes it and rejects.


		opeConObj.close(); // What: Connection Close Call. Why: Nothing will use this connection. How: This closes it.

		throw new Error( 'idb boot abandoned' ); // What: Abandoned Boot Error. Why: The caller has already moved on to localStorage. How: This rejects the boot.


	}



	datConObj = opeConObj; // What: Database Connection Object Assignment. Why: Every IndexedDB read and write in this file goes through datConObj. How: This stores the open connection.



	const idbStaObj = await reaDatFun(); // What: IndexedDB State Object. Why: An install that already moved to IndexedDB has its state stored there. How: This awaits reaDatFun, null for an empty store.


	if ( !idbStaObj ) { // What: Empty Store Check. Why: An empty store is either a fresh install or one whose localStorage data still waits to be migrated. How: This runs the one-time migration below.


		const legStaObj = reaLocFun(); // What: Legacy State Object. Why: A pre-IDB install keeps its data in localStorage under MIR_KEY_STR. How: This calls reaLocFun, null for a fresh install.


		if ( !legStaObj ) return null; // What: Fresh Install Guard. Why: There is nothing to migrate. How: This resolves null.



		try { if ( !localStorage.getItem( MIG_SNA_STR ) ) localStorage.setItem( MIG_SNA_STR, localStorage.getItem( MIR_KEY_STR )! ); } // What: Snapshot Set Try. Why: A rollback copy must be taken before the migration below touches anything, in case the new IDB store turns out not to read back correctly. How: This writes the current MIR_KEY_STR contents under MIG_SNA_STR, but only if no snapshot already exists there. // What: Non-Null Note. Why: legStaObj was just parsed from this same key, so it holds text. How: The ! tells TypeScript the mirror read is set here.

		catch {} // What: Snapshot Set Guard. Why: The snapshot is a nicety, not a requirement, so a failure to write it must not abort the migration itself. How: This silently ignores any error from the inner setItem call above.



		await wriDatFun( legStaObj ); // What: Legacy State Write Call. Why: This is the actual migration write, moving the legacy data into the new IDB stores. How: This awaits wriDatFun with legStaObj as the state to persist.

		const verStaObj = await reaDatFun(); // What: Verify State Object. Why: The migration must be confirmed by reading the data back, not merely assumed to have worked because the write call did not throw. How: This awaits reaDatFun again, immediately after the migration write above.



		if ( !verStaObj || !Array.isArray( verStaObj.pickers ) ) throw new Error( 'idb migration unverified' ); // What: Verify State Guard. Why: A migration that didn't stick must not be trusted, so the session stays on localStorage. How: This rejects, sending iniStoFun to its localStorage fallback.



		return verStaObj; // What: Verified State Return. Why: The migrated data is now IndexedDB's own. How: This returns the state read back.


	}



	const adoStaObj = mirAdoFun( idbStaObj, reaLocFun() ); // What: Adopted State Object. Why: A newer localStorage copy must win over IndexedDB's. How: This calls mirAdoFun with the mirror, null when IndexedDB's copy should be kept.


	if ( !adoStaObj ) return idbStaObj; // What: Keep IndexedDB Guard. Why: IndexedDB's copy is the newest. How: This resolves it.



	await wriDatFun( adoStaObj ); // What: Adopted State Write Call. Why: The newer copy must be in IndexedDB before anything else reads it. How: This awaits wriDatFun with adoStaObj.



	return adoStaObj; // What: Adopted State Return. Why: The newer copy is now IndexedDB's own. How: This returns adoStaObj.


}

// #endregion idbBooFun



// #region iniStoFun

/**
 * iniStoFun = Init Storage Function
 *
 * @summary
 * Boots the whole storage layer: loads state through idbBooFun, and falls
 * back to localStorage entirely when IndexedDB is unavailable,
 * private-mode-restricted, fails, or hasn't finished within BOO_DEA_NUM.
 * The deadline belongs here rather than in main.tsx, so the whole session
 * runs on one engine: a late IndexedDB boot is abandoned instead of taking
 * over after the app has already mounted from the mirror. Also retires the
 * migration snapshot and sweeps dead pre-IDB localStorage generations once
 * IDB has booted cleanly SNA_KEE_NUM times in a row. This is awaited in
 * main.tsx before React ever mounts, which is what lets store.ts's own
 * loaStaFun() stay synchronous, and it always settles within BOO_DEA_NUM.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns A Promise resolving to the loaded state object, or null for
 * a genuinely fresh install with nothing persisted anywhere yet.
 * @see {@link cacStaObj}
 *
 * @example
 * ```ts
 * iniStoFun() // => loaded state object or null
 * ```
 *
*/

async function iniStoFun () : Promise< RawSavTyp > {


	try { // What: Storage Boot Try. Why: IndexedDB can fail outright, hang, or run past the deadline, and every one of those must fall back to localStorage instead of crashing or splitting the session across engines. How: This races idbBooFun against BOO_DEA_NUM, falling back in the catch beneath it.


		cacStaObj = await Promise.race( [ // What: IndexedDB Boot Race. Why: A slow IndexedDB must never hold up the app's first paint. How: This adopts idbBooFun's state if it settles first, and rejects once BOO_DEA_NUM passes.


			idbBooFun(),                                                                                                           // What: IndexedDB Boot Call. Why: This is the real boot. How: This resolves with the state to boot from.
			new Promise( ( resValFun ) => setTimeout( resValFun, BOO_DEA_NUM ) ).then( () => { throw new Error( 'idb boot timeout' ); } ) // What: Boot Deadline Promise. Why: The boot must give up on IndexedDB in time. How: This rejects BOO_DEA_NUM milliseconds after boot starts.


		] );

		curEngStr = 'idb'; // What: Current Engine String Assignment. Why: A boot that won the race makes IndexedDB the engine of record for the rest of this session. How: This sets curEngStr to 'idb'.


	}

	catch ( errCatObj ) { // What: Storage Boot Guard. Why: Private mode, an opaque origin, a blocked, hanging, or late open, or an unverified migration must still leave the app able to boot. How: This falls all the way back to the localStorage engine and whatever reaLocFun can read.


		console.warn( errCatObj ); // What: Error Warning Call. Why: A real failure here should stay visible to anyone debugging. How: This logs the caught error as a console warning.



		booAbaBoo = true; // What: Boot Abandoned Boolean Assignment. Why: An idbBooFun still running must not use a connection that opens later. How: This flags the boot as abandoned.

		if ( datConObj ) datConObj.close(); // What: Connection Close Check. Why: A connection idbBooFun already opened must not stay open, or let it write after this session moved to localStorage. How: This closes it when there is one.



		datConObj = null;           // What: Database Connection Object Clear. Why: Whatever partial connection state the failed boot sequence above may have left behind must not be reused. How: This clears datConObj back to null.
		curEngStr = 'localStorage'; // What: Current Engine String Fallback. Why: IndexedDB has failed outright, so this whole session must use localStorage as the engine of record instead. How: This sets curEngStr to 'localStorage'.
		cacStaObj = reaLocFun();    // What: Cached State Object Fallback Read. Why: The app still needs whatever state it can get, and localStorage is the only remaining place to read it from. How: This calls reaLocFun and adopts its own result (or null) as cacStaObj.


	}



	if ( cacStaObj && cacStaObj.pickLog ) lplRefArr = cacStaObj.pickLog; // What: Last-Pick-Log Reference Seed. Why: wriDatFun's own change-detection needs a starting reference so it does not treat the very first save after boot as a change. How: This seeds lplRefArr from whatever pickLog cacStaObj already has, if any.



	logSusBoo = !!( cacStaObj && ( cacStaObj.__logPartial || ( cacStaObj.__mirrorNoLog && !( cacStaObj.pickLog || [] ).length ) ) ); // What: Log Suspect Boolean Seed. Why: A state adopted from localStorage whose pick log is a stand-in must be flagged, so it never overwrites real IDB history and its own full writes stay marked partial. How: This is true for a partial-log copy, or for a warm mirror copy with an empty pickLog.



	if ( cacStaObj ) { // What: Storage Marker Strip Check. Why: Once read, the storage layer's own markers have done their job and must not ride along into the app's own state. How: This deletes each of them from cacStaObj when there is one.


		delete cacStaObj.__logPartial;  // What: Partial Log Marker Strip. Why: logSusBoo now carries what it said. How: This deletes it.
		delete cacStaObj.__mirrorNoLog; // What: Mirror Marker Strip. Why: logSusBoo now carries what it said. How: This deletes it.
		delete cacStaObj.__savedAt;     // What: Saved At Strip. Why: Each write stamps its own copy afresh. How: This deletes it.


	}



	if ( curEngStr === 'idb' && cacStaObj && Array.isArray( cacStaObj.pickers ) ) { // What: Clean Idb Boot Check. Why: The migration snapshot and dead pre-IDB generations should only ever be retired once IDB itself has proven trustworthy, not on a fallback boot. How: This gates the whole boot-counting and sweep block below on IDB actually being the live engine with real, readable state.


		try { // What: Boot Count Try. Why: Reading and writing the boot counter can itself throw (a blocked origin), and that must not abort boot. How: This wraps the counting and sweeping sequence below, silently giving up in its own catch.


			const booCouNum = ( parseInt( localStorage.getItem( BOO_KEY_STR ) ?? '', 10 ) || 0 ) + 1; // What: Boot Count Number. Why: This is how many clean IDB boots in a row have now happened, one more than whatever was already recorded. How: This parses the existing BOO_KEY_STR value (0 if missing or unparseable) and adds 1.

			localStorage.setItem( BOO_KEY_STR, String( booCouNum ) ); // What: Boot Count Set Call. Why: The freshly-incremented count must actually be persisted for the next boot to read. How: This writes booCouNum back under BOO_KEY_STR as a string.


			if ( booCouNum >= SNA_KEE_NUM ) localStorage.removeItem( MIG_SNA_STR ); // What: Snapshot Retirement Check. Why: The migration snapshot only exists to roll back a bad migration, not to live forever as a permanent plaintext copy. How: This removes it once booCouNum reaches SNA_KEE_NUM.



			if ( booCouNum >= SNA_KEE_NUM ) { // What: Dead Generation Sweep Check. Why: Every pre-IDB localStorage generation is a full plaintext copy of user data that the current layer never reads again once IDB is proven. How: This sweeps them, gated on the same booCouNum threshold as the snapshot retirement above.


				for ( const curKeyStr of ownKeyFun() ) { // What: Owned Key Sweep Loop. Why: Every owned key must be checked individually, since some (the keys in LIV_KEY_ARR) must survive this sweep. How: This iterates every key ownKeyFun finds.


					const isaDeaBoo = !LIV_KEY_ARR.includes( curKeyStr ); // What: Is-A Dead Boolean. Why: Only a key nothing still uses is a genuinely dead generation. How: This is true when curKeyStr isn't in LIV_KEY_ARR.


					if ( isaDeaBoo ) localStorage.removeItem( curKeyStr ); // What: Dead Generation Removal Check. Why: Only a genuinely dead pre-IDB key should be removed, never a key in LIV_KEY_ARR that this app still actively reads and writes. How: This removes curKeyStr unless it matches one of those three survivors.


				}


			}


		}

		catch {} // What: Boot Count Guard. Why: Nothing critical depends on the boot counter or the sweep succeeding on any given boot. How: This silently ignores any error from the whole try block above.


	}



	return cacStaObj; // What: Cached State Object Return. Why: main.tsx awaits this before React mounts, and store.ts's own loaStaFun() reads it back synchronously afterward. How: This returns the same cacStaObj populated throughout this function.


}

// #endregion iniStoFun



// #region logAutFun

/**
 * logAutFun = Log Authoritative Function
 *
 * @summary
 * Declares that the caller's own pickLog is intentional, whether empty
 * or not (an import, or a reset). Clears the mirror-artefact suspicion
 * so the very next wriDatFun call is allowed to actually write it,
 * even if it happens to be empty.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * logAutFun() // => void
 * ```
 *
*/

function logAutFun () : void { logSusBoo = false; } // What: Log Authoritative Body. Why: A caller that just imported or reset the pick log knows its own emptiness (or non-emptiness) is real, not a mirror artefact. How: This clears logSusBoo unconditionally.

// #endregion logAutFun



// #region savStaFun

/**
 * savStaFun = Save State Function
 *
 * @summary
 * Fire-and-forget save, called on every debounced state change. Writes
 * to IndexedDB when it is the engine of record, falling back to a full
 * localStorage write (including pickLog) if that write itself fails,
 * since a failed IDB write (quota, corruption) must not silently lose
 * data.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param appStaObj - App State Object: The full app state object to persist.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * savStaFun(appStaObj) // => void
 * ```
 *
*/

function savStaFun ( appStaObj : StaAppTyp ) : void {


	if ( curEngStr === 'idb' && datConObj ) { // What: Idb Engine Check. Why: The IDB write path and the localStorage-only path are mutually exclusive; only one of them should run per call. How: This gates the IDB write attempt below, falling through to the plain wriLocFun call at the end when it does not hold.


		wriDatFun( appStaObj ).catch( () => { // What: State Write Catch. Why: A failed IDB write must not silently lose data. How: This falls back to a full localStorage write, and also demotes curEngStr so every later call goes straight to localStorage instead of retrying a broken IDB connection.


			curEngStr = 'localStorage'; // What: Current Engine String Demotion. Why: A failed IDB write means this session must stop trusting the broken connection. How: This demotes curEngStr to 'localStorage'.
			datConObj = null;           // What: Database Connection Object Clear. Why: A connection that just failed to write must not be reused by any later call. How: This clears datConObj back to null.


			wriLocFun( appStaObj, true ); // What: Full Local Write Call. Why: A failed IDB write must not silently lose data. How: This calls wriLocFun with fulWriBoo true, writing pickLog along with everything else.


		} );



		return; // What: Idb Path Return. Why: The IDB write above is already in flight (or has already failed and fallen back), so the plain localStorage call below must not also run. How: This exits before reaching wriLocFun's own unconditional call.


	}



	wriLocFun( appStaObj, true ); // What: Full Local Write Call. Why: This is the plain fallback-engine path, reached whenever IDB is not the current engine of record at all. How: This calls wriLocFun with fulWriBoo true, writing pickLog along with everything else.


}

// #endregion savStaFun



// #region wipDatFun

/**
 * wipDatFun = Wipe Data Function
 *
 * @summary
 * Full teardown for "Delete all data": clears both IDB object stores
 * and every localStorage key this layer owns, including the migration
 * snapshot. Without this, a reset would leave a complete plaintext copy
 * of the user's data behind, contradicting both the reset copy ("This
 * can't be undone") and the app's own on-device-only promise. Any
 * future delete-account control must call this too.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * wipDatFun() // => void
 * ```
 *
*/

async function wipDatFun () : Promise< void > {


	lplRefArr = undefined; // What: Last-Pick-Log Reference Reset. Why: A wiped store has nothing to compare a future write's own pickLog against. How: This resets lplRefArr back to its own initial undefined value.



	try { for ( const curKeyStr of ownKeyFun() ) localStorage.removeItem( curKeyStr ); } // What: Owned Key Removal Try. Why: Older generations of this app wrote keys like 'easemylife.v1' and 'ease-my-life-v1', which are complete state blobs a fixed list would silently leave behind. How: This removes every key ownKeyFun finds, a prefix sweep rather than a hardcoded list.

	catch {} // What: Owned Key Removal Guard. Why: A blocked or inaccessible localStorage must not abort the rest of this teardown. How: This silently ignores any error from the removal loop above.



	if ( curEngStr === 'idb' && datConObj ) { // What: Idb Clear Check. Why: The two IDB object stores only need clearing when IDB is actually the engine currently in use. How: This gates the clear calls below on that condition.


		try { // What: Idb Clear Try. Why: A clear() call can itself fail (a torn-down connection, a blocked transaction), and that must not abort the rest of this teardown either. How: This wraps both store clears below in one try/catch.


			await reqProFun( traStoFun( STA_STO_STR, 'readwrite' ).clear() ); // What: State Store Clear Call. Why: This is the actual clear of the non-pickLog portion of state. How: This awaits reqProFun wrapping a clear() request against the state object store.
			await reqProFun( traStoFun( PIC_LOG_STR, 'readwrite' ).clear() ); // What: Pick Log Store Clear Call. Why: This is the actual clear of the pick log. How: This awaits reqProFun wrapping a clear() request against the pick log object store.


		}

		catch ( errCatObj ) { console.warn( errCatObj ); } // What: Idb Clear Guard. Why: The clean state written by the very next save overwrites whatever is left either way, so a failed clear here is not fatal. How: This silently ignores any error from the two clear calls above. It logs the error as a warning so the failure stays visible in the console.


	}



	cacStaObj = null; // What: Cached State Object Reset. Why: The next read of STG_NAM_OBJ.cacStaFun() must reflect the wipe, not stale pre-wipe state. How: This resets cacStaObj back to null.


}

// #endregion wipDatFun

// #endregion Lifecycle



// #region Status And Persistence

// #region reaPerFun

/**
 * reaPerFun = Read Persisted Function
 *
 * @summary
 * Reads the authoritative persisted state, fresh from whichever store
 * is currently of record, rather than from the in-memory cacStaObj.
 * Export uses this specifically so a backup can never inherit a
 * truncated in-memory pickLog.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns A Promise resolving to the authoritative persisted state
 * object, or null when it cannot be read at all.
 *
 * @example
 * ```ts
 * reaPerFun() // => persisted state object or null
 * ```
 *
*/

async function reaPerFun () : Promise< RawSavTyp > {


	if ( curEngStr === 'idb' && datConObj ) { // What: Idb Engine Check. Why: IDB is the actual store of record whenever it is the current engine, so it must be read directly rather than relying on any in-memory copy. How: This gates the direct reaDatFun read below on that condition.


		try { return await reaDatFun(); } // What: Database Read Try. Why: The actual IDB read must be attempted before any fallback can be considered. How: This awaits reaDatFun and returns its own resolved value directly.

		catch ( errCatObj ) { // What: Database Read Guard. Why: A read failure here must resolve to null rather than reject whichever caller (typically an export) invoked this. How: This returns null instead of letting the error propagate.


			console.warn( errCatObj ); // What: Error Warning Call. Why: A real failure here should stay visible to anyone debugging. How: This logs the caught error as a console warning.



			return null; // What: Null Fallback Return. Why: The caller treats null as nothing to read. How: This returns null after the warning.


		}


	}



	return reaLocFun(); // What: Local Read Return. Why: Whenever IDB is not the engine of record, localStorage itself is the actual store of record. How: This returns reaLocFun's own result directly.


}

// #endregion reaPerFun



// #region datBytFun

/**
 * datBytFun = Data Bytes Function
 *
 * @summary
 * Measures the exact byte size of the actual saved data.
 * navigator.storage.estimate() cannot answer this on its own: it is
 * origin-wide (IDB, localStorage, and the service worker precache all
 * combined), and browsers deliberately distort it besides, Chromium
 * pads opaque cached responses by roughly 7MB each, and Firefox has
 * been observed returning a usage figure three orders of magnitude
 * above both its own site-data figure and the real bytes (1838MB
 * reported against 1.3MB actual). Presenting that to a user as "used"
 * would read as a bug in the app, so this measures what was actually
 * written instead, keeping estimate() only for headroom, where an
 * enforced approximation is the right input.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns A Promise resolving to the exact byte size of the persisted
 * state's own JSON serialization, or null when there is nothing
 * persisted yet or no way to measure it in this environment.
 *
 * @example
 * ```ts
 * datBytFun() // => byte size number or null
 * ```
 *
*/

async function datBytFun () : Promise< number | null > {


	try { // What: Data Bytes Try. Why: reaPerFun and JSON.stringify can both throw, and either failure should resolve to null rather than reject the caller. How: This wraps the whole measure sequence below, falling back to null in its own catch.


		const curStaObj = ( await reaPerFun() ) || cacStaObj; // What: Current State Object. Why: The freshest available state must be measured, preferring the authoritative persisted copy over the in-memory one. How: This awaits reaPerFun and falls back to cacStaObj only when that resolves to nothing.


		if ( !curStaObj ) return null; // What: No Current State Guard. Why: A genuinely fresh install has nothing to measure at all. How: This returns null immediately when neither reaPerFun nor cacStaObj has anything.



		const jsoTexStr = JSON.stringify( curStaObj ); // What: Json Text String. Why: The byte-size measurement below needs the exact serialized text that would actually be written to storage. How: This serializes curStaObj to JSON text.



		if ( typeof Blob === 'function' ) return new Blob( [ jsoTexStr ] ).size; // What: Blob Size Return. Why: Blob gives an exact byte count and is the preferred measurement wherever it is available. How: This wraps jsoTexStr in a Blob and returns its own size.



		if ( typeof TextEncoder === 'function' ) return new TextEncoder().encode( jsoTexStr ).length; // What: Text Encoder Size Return. Why: Some environments lack Blob but still support TextEncoder, which covers the same measurement. How: This encodes jsoTexStr and returns the resulting byte array's own length.



		return null; // What: No Measurement Return. Why: An environment with neither Blob nor TextEncoder has no way to measure this at all. How: This returns null as the last resort.


	}

	catch { return null; } // What: Data Bytes Guard. Why: A measurement failure must not surface as an error to whichever caller (typically staRepFun) invoked this. How: This returns null instead of letting the error propagate.


}

// #endregion datBytFun



// #region reqPerFun

/**
 * reqPerFun = Request Persist Function
 *
 * @summary
 * Requests eviction exemption from the browser. This should only ever
 * be called after real user engagement, since Chromium will not
 * re-prompt for the rest of the session once denied once.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns A Promise resolving to whether persistent storage was
 * already granted, or was just successfully requested.
 *
 * @example
 * ```ts
 * reqPerFun() // => true or false
 * ```
 *
*/

async function reqPerFun () : Promise< boolean > {


	try { // What: Request Persist Try. Why: navigator.storage itself, or its persist/persisted methods, may not exist in every browser. How: This wraps the whole check-then-request sequence below, falling back to false in its own catch.


		if ( !navigator.storage || !navigator.storage.persist ) return false; // What: No Persist Api Guard. Why: There is nothing to request at all in a browser without this API. How: This returns false immediately when either navigator.storage or its own persist method is missing.



		if ( await navigator.storage.persisted() ) return true; // What: Already Persisted Guard. Why: A repeat call should not re-prompt when persistence was already granted earlier. How: This returns true immediately without ever calling persist() again.



		return await navigator.storage.persist(); // What: Persist Request Return. Why: The caller needs to know whether this actual request was granted. How: This awaits navigator.storage.persist() and returns its own boolean result.


	}

	catch { return false; } // What: Request Persist Guard. Why: A throwing storage API must not crash whichever caller invoked this. How: This returns false instead of letting the error propagate.


}

// #endregion reqPerFun



type StoRepTyp = { dataBytes : number | null, engine : string, mirrorAt : string | null, mirrorOk : boolean, persisted : boolean, quota : number | null, usage : number | null }; // What: Storage Report Type. Why: The Settings storage panel shows which engine is active, how much is saved, whether the mirror and persistence are working, and the browser's headroom. How: This describes staRepFun's report, with null for anything the browser couldn't measure.

// #region staRepFun

/**
 * staRepFun = Status Report Function
 *
 * @summary
 * Builds the full status report the Settings storage panel reads:
 * which engine is active, how many bytes are actually persisted,
 * whether the browser has granted eviction-exempt persistence, and the
 * browser's own (approximate) usage/quota estimate for headroom.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns A Promise resolving to the full status report object.
 * @see {@link outStaObj}
 *
 * @example
 * ```ts
 * staRepFun() // => status report object
 * ```
 *
*/

async function staRepFun () : Promise< StoRepTyp > {


	let mirTimStr = null; // What: Mirror Time String. Why: The mirror freshness timestamp is read from localStorage, which can itself throw. How: This starts null and is only assigned inside the try block below.



	try { mirTimStr = localStorage.getItem( MIR_TIM_STR ); } // What: Mirror Time Read Try. Why: The mirror freshness timestamp must actually be read from localStorage before it can be reported. How: This assigns mirTimStr from whatever is currently stored under MIR_TIM_STR.

	catch {} // What: Mirror Time Read Guard. Why: A blocked or inaccessible localStorage must not abort the rest of this status report. How: This silently leaves mirTimStr at its own null default instead of letting the read throw.



	const outStaObj : StoRepTyp = { dataBytes : null, engine : curEngStr, mirrorAt : mirTimStr, mirrorOk : mirWriBoo, persisted : false, quota : null, usage : null }; // What: Output Status Object. Why: This is the full report shape the Settings storage panel expects, seeded with everything already known synchronously. How: This is built once here and then filled in further by the awaited calls below.

	outStaObj.dataBytes = await datBytFun(); // What: Output Data Bytes Assignment. Why: The exact persisted byte size can only be known after an async measurement. How: This awaits datBytFun and assigns its result onto outStaObj.



	try { // What: Storage Estimate Try. Why: navigator.storage itself, or its persisted/estimate methods, may not exist in every browser. How: This wraps both optional calls below so an unsupported environment simply leaves outStaObj's own defaults in place.


		if ( navigator.storage && navigator.storage.persisted ) outStaObj.persisted = await navigator.storage.persisted(); // What: Output Persisted Assignment Check. Why: The Settings panel needs to know whether eviction-exempt persistence has already been granted. How: This awaits navigator.storage.persisted() only when that API exists, assigning its result onto outStaObj.



		if ( navigator.storage && navigator.storage.estimate ) { // What: Storage Estimate Check. Why: The Settings panel's headroom display needs the browser's own approximate usage/quota figures. How: This gates the estimate call and its two assignments below on that API existing at all.


			const estResObj = await navigator.storage.estimate(); // What: Estimate Result Object. Why: Both usage and quota come from the same single estimate() call. How: This awaits navigator.storage.estimate() once and reuses its result for both assignments below.

			outStaObj.usage = estResObj.usage ?? null; // What: Output Usage Assignment. Why: This figure needs to reach the final report even though only headroom, not exact size, should ever be read from it. How: This copies estResObj's own usage onto outStaObj, or null when the browser leaves it out.
			outStaObj.quota = estResObj.quota ?? null; // What: Output Quota Assignment. Why: This figure needs to reach the final report even though only headroom, not exact size, should ever be read from it. How: This copies estResObj's own quota onto outStaObj, or null when the browser leaves it out.


		}


	}

	catch {} // What: Storage Estimate Guard. Why: An unsupported or throwing storage API must not abort the rest of this status report. How: This silently ignores any error from the two optional calls above.



	return outStaObj; // What: Output Status Return. Why: The caller (typically the Settings storage panel) needs the fully-assembled report. How: This returns the same outStaObj built and filled in throughout this function.


}

// #endregion staRepFun

// #endregion Status And Persistence

// #endregion Helpers



// #region Exports

const STG_NAM_OBJ = { // What: Storage Namespace Object. Why: This is the single public entry point every other file in this app imports by name. How: This maps each of this file's own internal function/variable names onto an external property name matching it exactly.


	ACC_SIG_STR : ACC_SIG_STR, // What: Account Signed-In String. Why: The sync hook records whether this device has signed in under a key the boot sweep keeps. How: This re-exports ACC_SIG_STR under its own matching name.
	cacStaFun   : cacStaFun,   // What: Cached State Function. Why: store.ts's own loaStaFun() reads this synchronously to seed React state before any save has happened yet. How: This re-exports cacStaFun under its own matching name.
	fluSynFun   : fluSynFun,   // What: Flush Sync Function. Why: store.ts calls this synchronously on pagehide/tab-hide, where an async save could be lost. How: This re-exports fluSynFun under its own matching name.
	iniStoFun   : iniStoFun,   // What: Init Storage Function. Why: main.tsx awaits this before React ever mounts, and store.ts's own loaStaFun() reads its result back synchronously afterward. How: This re-exports iniStoFun under its own matching name.
	logAutFun   : logAutFun,   // What: Log Authoritative Function. Why: store.ts calls this right after an import or a reset, before the next save writes the fresh pickLog. How: This re-exports logAutFun under its own matching name.
	PER_ASK_STR : PER_ASK_STR, // What: Persist Ask String. Why: pwa.ts records the persistence prompt under a key the boot sweep must keep, so the key lives here beside LIV_KEY_ARR. How: This re-exports PER_ASK_STR under its own matching name.
	reaPerFun   : reaPerFun,   // What: Read Persisted Function. Why: tab-settings.tsx calls this so an export can never inherit a truncated in-memory pickLog. How: This re-exports reaPerFun under its own matching name.
	reqPerFun   : reqPerFun,   // What: Request Persist Function. Why: pwa.ts calls this after real user engagement to request eviction-exempt storage. How: This re-exports reqPerFun under its own matching name.
	savStaFun   : savStaFun,   // What: Save State Function. Why: store.ts calls this on every debounced state change. How: This re-exports savStaFun under its own matching name.
	SIG_EMA_STR : SIG_EMA_STR, // What: Sign-In Email String. Why: The sync hook remembers a link's address under a key the boot sweep keeps. How: This re-exports SIG_EMA_STR under its own matching name.
	staRepFun   : staRepFun,   // What: Status Report Function. Why: tab-settings.tsx polls this to render the storage panel. How: This re-exports staRepFun under its own matching name.
	SYN_MET_STR : SYN_MET_STR, // What: Sync Meta String. Why: The sync hook keeps its record under a key the boot sweep keeps. How: This re-exports SYN_MET_STR under its own matching name.
	wipDatFun   : wipDatFun    // What: Wipe Data Function. Why: store.ts calls this from the Settings "Delete all data" flow. How: This re-exports wipDatFun under its own matching name.


};



export { STG_NAM_OBJ, type StoRepTyp }; // What: Storage Namespace Object And Report Type Export. Why: main.tsx, store.ts, pwa.ts and tab-settings.tsx reach every persistence operation through the one namespace object, and Settings holds the storage report it returns. How: This exports STG_NAM_OBJ and StoRepTyp by name at the very end of the file.

// #endregion Exports


