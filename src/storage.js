


/**
 * storage.js = Storage Layer
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
 * loaded state in memory, so store.jsx's own loadState() can stay
 * synchronous and no component ever had to become async just to read
 * persisted state. Writes made after that point are fire-and-forget
 * from the caller's own point of view.
 *
 * STG_NAM_OBJ is this file's whole public API, the single object every
 * consuming file imports and calls through, its own external names
 * swept to match the internal implementation exactly after checking
 * the blast radius across pwa.js, main.jsx, store.jsx, and
 * tab-settings.jsx.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



const DAT_NAM_STR = 'easemylife';                  // What: Database Name String. Why: This is the fixed IndexedDB database name every browser profile opens under. How: This is passed as the first argument to indexedDB.open inside opeDatFun.
const DAT_VER_NUM = 1;                             // What: Database Version Number. Why: This is the fixed IndexedDB schema version, structural only, tracking which object stores exist rather than their contents. How: This is passed as the second argument to indexedDB.open inside opeDatFun.
const STA_STO_STR = 'state';                       // What: State Store String. Why: This is the object store name holding everything except the pick log, under key 'main'. How: This is passed to traStoFun everywhere the non-log portion of state is read or written.
const PIC_LOG_STR = 'picklog';                     // What: Pick Log String. Why: This is the object store name holding the pick log alone, under key 'main', kept separate so writing it is not on the hot path of every other save. How: This is passed to traStoFun everywhere the pick log alone is read or written.
const MIR_KEY_STR = 'easemylife.v2';               // What: Mirror Key String. Why: This is the legacy live localStorage key that also doubles as the warm mirror's own key, read by every fallback-engine caller of this file. How: This is written by wriLocFun and read by reaLocFun, and re-exported as-is on the STG_NAM_OBJ object below.
const MIG_SNA_STR = 'easemylife.snapshot.pre-idb'; // What: Migration Snapshot String. Why: This is the bounded-lifetime rollback copy taken right before the very first IDB migration attempt. How: This is written once in iniStoFun and re-exported as-is on the STG_NAM_OBJ object below.
const BOO_KEY_STR = 'easemylife.idbboots';         // What: Boots Key String. Why: This is the localStorage key counting how many times IDB has booted cleanly in a row. How: This is read and incremented inside iniStoFun to decide when the migration snapshot and dead pre-IDB generations can be safely swept.



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



let datConObj = null;      // What: Database Connection Object. Why: Every other function in this file that talks to IndexedDB needs the same open connection. How: This starts null (no connection yet) and is assigned by iniStoFun once opeDatFun resolves.
let curEngStr = 'memory';  // What: Current Engine String. Why: Every read/write in this file needs to know which backend is actually of record right now: 'idb', 'localStorage', or the fallback 'memory'. How: This starts at 'memory' and is updated by iniStoFun/savStaFun whenever the active engine changes.
let cacStaObj = null;      // What: Cached State Object. Why: This is the state iniStoFun loaded, held in memory so later synchronous reads (like STG_NAM_OBJ.cacStaFun()) do not need to touch storage again. How: This starts null (a fresh install) and is assigned inside iniStoFun.
let lplRefArr = undefined; // What: Last-Pick-Log Reference Array. Why: wriDatFun must know whether the pick log actually changed since the last write, to avoid re-serializing the largest and fastest-growing piece of state on every save. How: This holds the exact array reference last written, compared with !== inside wriDatFun.
let mirWriBoo = true;      // What: Mirror Write Boolean. Why: The Settings storage panel needs to know whether the last localStorage mirror write actually succeeded. How: This is flipped by wriLocFun on every call, true on success, false on a quota (or similar) failure.



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

let logSusBoo = false; // What: Log Suspect Boolean. Why: wriDatFun must refuse to let a suspect empty pickLog overwrite real history in IDB. How: This is computed in iniStoFun from the loaded state's own __mirrorNoLog marker, checked in wriDatFun, and cleared by logAutFun.



const MIR_TIM_STR = 'easemylife.mirrorat'; // What: Mirror Time String. Why: Mirror freshness must survive a reload, not just live in memory, since the Settings storage panel reports it on a cold load before any tab-hide has happened this session. How: This is written by wriLocFun and read by staRepFun.



/**
 * OWN_KEY_REX = Own Key Regexp
 *
 * @summary
 * Matches every localStorage key this app has ever written, across
 * every past naming generation ('ease-my-life-v1', 'easemylife.v1',
 * 'easemylife.v2', ...). This is a prefix match rather than a fixed
 * list precisely so wipeDatFun's "Delete all data" and iniStoFun's
 * dead-generation sweep both catch whatever future key generation
 * this app ever writes next, not just the ones already known about
 * today.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const OWN_KEY_REX = /^ease[-]?my[-]?life/i; // What: Own Key Regexp. Why: Every localStorage key this app owns, across every naming generation, must be found by pattern rather than by a fixed list. How: This is tested against each localStorage key inside ownKeyFun below.



// #region ownKeyFun

/**
 * ownKeyFun = Own Key Function
 *
 * @summary
 * Enumerates every localStorage key this app currently owns, per
 * OWN_KEY_REX above. wipDatFun uses this so "Delete all data" really
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

function ownKeyFun() {


	try { return Object.keys( localStorage ).filter( ( curKeyStr ) => OWN_KEY_REX.test( curKeyStr ) ); } // What: Owned Key Filter Try. Why: Every current localStorage key must be checked against OWN_KEY_REX to find the ones this app has ever written. How: This filters every key currently in localStorage down to the ones OWN_KEY_REX matches.

	catch ( e ) { return []; } // What: Owned Key Read Guard. Why: A private-mode or otherwise inaccessible localStorage must not crash whichever caller invoked this. How: This returns an empty array instead of letting the read throw.


}

// #endregion ownKeyFun



const reqProFun = ( idbReqObj ) => new Promise( ( resValFun, rejErrFun ) => { // What: Request Promise Function. Why: Every IndexedDB request needs to be awaited like a normal Promise rather than driven through its own onsuccess/onerror callbacks by hand at every call site. How: This wraps the given IDBRequest in a new Promise, resolving with its own result on success and rejecting with its own error on failure.


	idbReqObj.onsuccess = () => resValFun( idbReqObj.result ); // What: Success Handler Assignment. Why: A successful IndexedDB request must resolve the wrapping Promise with that request's own result. How: This assigns an onsuccess handler that calls resValFun with idbReqObj.result.

	idbReqObj.onerror   = () => rejErrFun( idbReqObj.error ); // What: Error Handler Assignment. Why: A failed IndexedDB request must reject the wrapping Promise with that request's own error. How: This assigns an onerror handler that calls rejErrFun with idbReqObj.error.


} );



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

function opeDatFun() {


	return new Promise( ( resValFun, rejErrFun ) => { // What: Open Database Promise. Why: The caller needs a real Promise it can await, not indexedDB.open's own request-object callback style. How: This wraps the whole open/upgrade/timeout sequence below and settles resValFun/rejErrFun exactly once.


		if ( !window.indexedDB ) return rejErrFun( new Error( 'no indexedDB' ) ); // What: No IndexedDB Guard. Why: Some browsers/modes (very old browsers, some private-mode configurations) expose no indexedDB global at all. How: This rejects immediately rather than calling indexedDB.open on an object that does not exist.



		let opeReqObj; // What: Open Request Object. Why: The actual open() call can itself throw in some environments rather than returning a request object. How: This is declared here so the try/catch below can assign it without redeclaring it.



		try { opeReqObj = indexedDB.open( DAT_NAM_STR, DAT_VER_NUM ); } // What: Database Open Try. Why: This is the actual call that opens (or creates) the database, keyed by DAT_NAM_STR and DAT_VER_NUM. How: This assigns the resulting IDBOpenDBRequest to opeReqObj for the handlers below.

		catch ( e ) { return rejErrFun( e ); } // What: Database Open Guard. Why: A thrown open() call has nothing further to attach handlers to. How: This rejects immediately with whatever error indexedDB.open itself threw.



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

function traStoFun( stoNamStr, modValStr ) { return datConObj.transaction( stoNamStr, modValStr ).objectStore( stoNamStr ); } // What: Transaction Store Body. Why: Every IndexedDB read/write elsewhere in this file needs a freshly-opened store to call get/put/clear on. How: This opens one transaction on datConObj in the given mode and returns its own named object store.

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

async function reaDatFun() {


	const resStaObj = await reqProFun( traStoFun( STA_STO_STR, 'readonly' ).get( 'main' ) ); // What: Rest State Object. Why: The non-pickLog portion of state lives in its own object store, read independently from the log. How: This awaits reqProFun wrapping a get('main') request against the state object store.


	if ( !resStaObj ) return null; // What: No Rest State Guard. Why: A fresh install has nothing in the state store yet, so there is nothing to merge a pickLog onto at all. How: This returns null immediately when the state store's own 'main' record does not exist.



	const picLogArr = await reqProFun( traStoFun( PIC_LOG_STR, 'readonly' ).get( 'main' ) ); // What: Pick Log Array. Why: The append-only pick log lives in its own separate object store, read independently from the rest of state. How: This awaits reqProFun wrapping a get('main') request against the pick log object store.



	return { ...resStaObj, pickLog: picLogArr || [] }; // What: Rest State Return. Why: The caller needs the two separately-stored pieces merged back into one full state object. How: This spreads resStaObj and reattaches picLogArr (or an empty array, for a state store written before this split ever existed) as its own pickLog field.


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

async function wriDatFun( appStaObj ) {


	const { pickLog: picLogArr, ...resStaObj } = appStaObj; // What: Rest State Object Destructure. Why: The pick log and the rest of state are written to two separate object stores and must be split apart before either write happens. How: This pulls pickLog out as picLogArr, leaving every other field in resStaObj.

	const cloStaObj = JSON.parse( JSON.stringify( resStaObj ) ); // What: Clone State Object. Why: Structured clone cannot take proxies or functions, and although state is meant to be plain JSON, round-tripping it here defensively means a stray non-clonable value cannot kill the whole write. How: This serializes resStaObj to JSON text and immediately parses it back into a plain object.


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

function reaLocFun() {


	try { // What: Local Read Try. Why: Both localStorage.getItem and JSON.parse can throw (a blocked origin, corrupted data), and either failure should be treated the same way. How: This wraps the whole read-and-parse sequence below so any such error falls through to the catch's own null return.


		const rawJsoStr = localStorage.getItem( MIR_KEY_STR ); // What: Raw Json String. Why: The mirror's own raw text must be read before it can be parsed. How: This reads whatever is currently stored under MIR_KEY_STR.


		if ( !rawJsoStr ) return null; // What: No Raw Json Guard. Why: A fresh install (or one that has never fallen back to localStorage) has nothing stored under MIR_KEY_STR at all. How: This returns null immediately rather than attempting to parse an empty value.



		const parStaObj = JSON.parse( rawJsoStr ); // What: Parsed State Object. Why: The caller needs a real object, not the raw JSON text. How: This parses rawJsoStr into a plain JS object.


		if ( parStaObj && !Array.isArray( parStaObj.pickLog ) ) parStaObj.pickLog = []; // What: Pick Log Backfill Check. Why: Every reader of this state elsewhere in the app expects pickLog to be a real array, but the warm mirror deliberately omits it. How: This backfills an empty array onto parStaObj whenever its own pickLog is missing or not already an array.



		return parStaObj; // What: Parsed State Return. Why: The caller needs the fully-parsed, backfilled state object back. How: This returns the same object read and normalized above.


	}

	catch ( e ) { return null; } // What: Local Read Guard. Why: A blocked origin or corrupted stored value must not crash whichever caller invoked this. How: This returns null instead of letting the read or parse throw.


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

function wriLocFun( appStaObj, fulWriBoo ) {


	try { // What: Local Write Try. Why: localStorage.setItem can throw on quota, and that failure must be surfaced rather than crash the caller. How: This wraps the whole build-and-write sequence below so a quota failure falls through to the catch below instead.


		let payDatObj = appStaObj; // What: Payload Data Object. Why: The value actually written depends on fulWriBoo, computed just below. How: This starts as appStaObj itself and is only replaced when fulWriBoo is false.


		if ( !fulWriBoo ) { // What: Not Full Write Check. Why: A warm-mirror write (as opposed to a fallback-engine write) must exclude pickLog entirely. How: This rebuilds payDatObj without pickLog, flagged with __mirrorNoLog, whenever fulWriBoo is false.


			const { pickLog: picLogArr, ...resStaObj } = appStaObj; // What: Rest State Object Destructure. Why: pickLog must be pulled out before the remaining fields become the actual mirror payload. How: This pulls pickLog out as picLogArr (discarded below) and keeps every other field in resStaObj.

			payDatObj = { ...resStaObj, __mirrorNoLog: true }; // What: Payload Data Object Rebuild. Why: A later reader (reaLocFun/iniStoFun) needs to know this specific copy's own pickLog is a stand-in, not real history. How: This spreads resStaObj and adds the __mirrorNoLog marker field.


		}



		localStorage.setItem( MIR_KEY_STR, JSON.stringify( payDatObj ) ); // What: Local Storage Set Call. Why: This is the actual mirror write every caller of wriLocFun exists to perform. How: This serializes payDatObj to JSON text and writes it under MIR_KEY_STR.

		mirWriBoo = true; // What: Mirror Write Boolean Update. Why: A successful write here means the mirror is now trustworthy again after any earlier failure. How: This sets mirWriBoo true unconditionally, reached only once setItem above has not thrown.



		try { localStorage.setItem( MIR_TIM_STR, new Date().toISOString() ); } // What: Mirror Time Set Try. Why: The Settings storage panel reports backup freshness on a cold load, before any tab-hide has happened this session, so this timestamp must be persisted rather than kept only in memory. How: This writes the current time under MIR_TIM_STR.

		catch ( e ) {} // What: Mirror Time Set Guard. Why: A failure to record the freshness timestamp is a cosmetic loss, not a reason to fail the whole mirror write. How: This silently ignores any error from the inner setItem call above.



		return true; // What: Local Write Success Return. Why: The caller needs to know the mirror write actually went through. How: This returns true once every step above has completed without throwing.


	}

	catch ( e ) { // What: Local Write Guard. Why: A quota failure is non-fatal (IDB is the real store of record when it is available), but the resulting stale mirror is a liability if IDB later fails, so it must be surfaced rather than silently swallowed. How: This flips mirWriBoo false and returns false instead of letting the quota error propagate.


		mirWriBoo = false; // What: Mirror Write Boolean Failure Update. Why: staRepFun's own status report must reflect that the last mirror write did not actually succeed. How: This sets mirWriBoo false.



		return false; // What: Local Write Failure Return. Why: The caller needs to know the mirror write did not go through. How: This returns false to signal the failure caught above.


	}


}

// #endregion wriLocFun



// #region iniStoFun

/**
 * iniStoFun = Init Storage Function
 *
 * @summary
 * Boots the whole storage layer: opens IndexedDB, migrates any existing
 * localStorage data into it on a first run (keeping an untouched
 * rollback snapshot until the new store has proven it can read its own
 * data back), and falls back to localStorage entirely when IndexedDB is
 * unavailable, private-mode-restricted, or hangs. Also retires the
 * migration snapshot and sweeps dead pre-IDB localStorage generations
 * once IDB has booted cleanly SNA_KEE_NUM times in a row. This is
 * awaited in main.jsx before React ever mounts, which is what lets
 * store.jsx's own loadState() stay synchronous.
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

async function iniStoFun() {


	try { // What: Storage Boot Try. Why: Opening IndexedDB at all can fail outright (private mode, an opaque origin, a blocked/hanging open), and that whole path must fall back to localStorage instead of crashing boot. How: This wraps the full IDB-open-and-migrate sequence below, falling back in the catch beneath it.


		datConObj = await opeDatFun(); // What: Database Connection Object Assignment. Why: Every later IDB read/write in this boot sequence (and in every other function in this file) needs this same open connection. How: This awaits opeDatFun and stores its resolved IDBDatabase.
		curEngStr = 'idb';             // What: Current Engine String Assignment. Why: A successful open means IndexedDB is now the engine of record for the rest of this session. How: This sets curEngStr to 'idb'.
		cacStaObj = await reaDatFun(); // What: Cached State Object Assignment. Why: An already-migrated install has its real state sitting in IDB already, which must be loaded before any migration logic below even considers running. How: This awaits reaDatFun and stores whatever it resolves, including null for a fresh IDB.


		if ( !cacStaObj ) { // What: No Cached State Check. Why: A null cacStaObj means this is either a genuinely fresh install, or one with existing localStorage data still waiting to be migrated into the new IDB store. How: This gates the whole migration block below so it only ever runs once, on that first IDB boot.


			const legStaObj = reaLocFun(); // What: Legacy State Object. Why: Any pre-IDB installation would have its real data sitting in localStorage under MIR_KEY_STR, which must be found before it can be migrated. How: This calls reaLocFun, resolving to null for a genuinely fresh install.


			if ( legStaObj ) { // What: Legacy State Check. Why: The migration below must only run when there is actually something in localStorage worth migrating. How: This gates the whole migration attempt on legStaObj being non-null.


				try { if ( !localStorage.getItem( MIG_SNA_STR ) ) localStorage.setItem( MIG_SNA_STR, localStorage.getItem( MIR_KEY_STR ) ); } // What: Snapshot Set Try. Why: A rollback copy must be taken before the migration below touches anything, in case the new IDB store turns out not to read back correctly. How: This writes the current MIR_KEY_STR contents under MIG_SNA_STR, but only if no snapshot already exists there.

				catch ( e ) {} // What: Snapshot Set Guard. Why: The snapshot is a nicety, not a requirement, so a failure to write it must not abort the migration itself. How: This silently ignores any error from the inner setItem call above.



				await wriDatFun( legStaObj ); // What: Legacy State Write Call. Why: This is the actual migration write, moving the legacy data into the new IDB stores. How: This awaits wriDatFun with legStaObj as the state to persist.

				const verStaObj = await reaDatFun(); // What: Verify State Object. Why: The migration must be confirmed by reading the data back, not merely assumed to have worked because the write call did not throw. How: This awaits reaDatFun again, immediately after the migration write above.


				if ( verStaObj && Array.isArray( verStaObj.pickers ) ) { cacStaObj = verStaObj; } // What: Verify State Success Check. Why: A readable pickers array is the concrete evidence that the migration actually stuck. How: This adopts verStaObj as the live cacStaObj once that check passes.

				else { // What: Verify State Failure Fallback. Why: A migration that did not stick must not be trusted, so this session stays on localStorage rather than risk it. How: This reverts curEngStr/datConObj and adopts the original legStaObj as cacStaObj instead.


					curEngStr = 'localStorage'; // What: Current Engine String Revert. Why: An unverified migration must not leave this session trusting the new IDB store. How: This demotes curEngStr back to 'localStorage'.
					datConObj = null;           // What: Database Connection Object Clear. Why: An unverified connection must not be reused by any later read/write in this session. How: This clears datConObj back to null.
					cacStaObj = legStaObj;      // What: Cached State Object Fallback Adoption. Why: The original, still-intact legacy data is the only trustworthy state left once the migration itself could not be verified. How: This adopts legStaObj as the live cacStaObj instead of the unverified verStaObj.


				}


			}


		}


	}

	catch ( e ) { // What: Storage Boot Guard. Why: Private mode, an opaque origin, or a blocked/hanging open must still leave the app able to boot. How: This falls all the way back to the localStorage engine and whatever reaLocFun can read.


		datConObj = null;           // What: Database Connection Object Clear. Why: Whatever partial connection state the failed boot sequence above may have left behind must not be reused. How: This clears datConObj back to null.
		curEngStr = 'localStorage'; // What: Current Engine String Fallback. Why: IndexedDB has failed outright, so this whole session must use localStorage as the engine of record instead. How: This sets curEngStr to 'localStorage'.
		cacStaObj = reaLocFun();    // What: Cached State Object Fallback Read. Why: The app still needs whatever state it can get, and localStorage is the only remaining place to read it from. How: This calls reaLocFun and adopts its own result (or null) as cacStaObj.


	}



	if ( cacStaObj && cacStaObj.pickLog ) lplRefArr = cacStaObj.pickLog; // What: Last-Pick-Log Reference Seed. Why: wriDatFun's own change-detection needs a starting reference so it does not treat the very first save after boot as a change. How: This seeds lplRefArr from whatever pickLog cacStaObj already has, if any.

	logSusBoo = !!( cacStaObj && cacStaObj.__mirrorNoLog && !( cacStaObj.pickLog || [] ).length ); // What: Log Suspect Boolean Seed. Why: A state adopted from the warm mirror with an empty pickLog must be flagged before the very first save could otherwise let that empty array overwrite real IDB history. How: This is true only when cacStaObj carries the __mirrorNoLog marker and its own pickLog is empty.



	if ( curEngStr === 'idb' && cacStaObj && Array.isArray( cacStaObj.pickers ) ) { // What: Clean Idb Boot Check. Why: The migration snapshot and dead pre-IDB generations should only ever be retired once IDB itself has proven trustworthy, not on a fallback boot. How: This gates the whole boot-counting and sweep block below on IDB actually being the live engine with real, readable state.


		try { // What: Boot Count Try. Why: Reading and writing the boot counter can itself throw (a blocked origin), and that must not abort boot. How: This wraps the counting and sweeping sequence below, silently giving up in its own catch.


			const booCouNum = ( parseInt( localStorage.getItem( BOO_KEY_STR ), 10 ) || 0 ) + 1; // What: Boot Count Number. Why: This is how many clean IDB boots in a row have now happened, one more than whatever was already recorded. How: This parses the existing BOO_KEY_STR value (0 if missing or unparseable) and adds 1.

			localStorage.setItem( BOO_KEY_STR, String( booCouNum ) ); // What: Boot Count Set Call. Why: The freshly-incremented count must actually be persisted for the next boot to read. How: This writes booCouNum back under BOO_KEY_STR as a string.


			if ( booCouNum >= SNA_KEE_NUM ) localStorage.removeItem( MIG_SNA_STR ); // What: Snapshot Retirement Check. Why: The migration snapshot only exists to roll back a bad migration, not to live forever as a permanent plaintext copy. How: This removes it once booCouNum reaches SNA_KEE_NUM.


			if ( booCouNum >= SNA_KEE_NUM ) { // What: Dead Generation Sweep Check. Why: Every pre-IDB localStorage generation is a full plaintext copy of user data that the current layer never reads again once IDB is proven. How: This sweeps them, gated on the same booCouNum threshold as the snapshot retirement above.


				for ( const curKeyStr of ownKeyFun() ) { // What: Owned Key Sweep Loop. Why: Every owned key must be checked individually, since some (the live mirror, the boot counter, the mirror timestamp) must survive this sweep. How: This iterates every key ownKeyFun finds.


					if ( curKeyStr !== MIR_KEY_STR && curKeyStr !== BOO_KEY_STR && curKeyStr !== MIR_TIM_STR ) localStorage.removeItem( curKeyStr ); // What: Dead Generation Removal Check. Why: Only a genuinely dead pre-IDB key should be removed, never the three keys this layer still actively reads and writes. How: This removes curKeyStr unless it matches one of those three survivors.


				}


			}


		}

		catch ( e ) {} // What: Boot Count Guard. Why: Nothing critical depends on the boot counter or the sweep succeeding on any given boot. How: This silently ignores any error from the whole try block above.


	}



	return cacStaObj; // What: Cached State Object Return. Why: main.jsx awaits this before React mounts, and store.jsx's own loadState() reads it back synchronously afterward. How: This returns the same cacStaObj populated throughout this function.


}

// #endregion iniStoFun



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

function savStaFun( appStaObj ) {


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

function fluSynFun( appStaObj ) {


	wriLocFun( appStaObj, curEngStr !== 'idb' ); // What: Sync Local Write Call. Why: A tab about to be hidden or torn down needs a synchronous mirror write it cannot risk missing. How: This calls wriLocFun immediately, writing pickLog too whenever IDB is not the current engine of record.


	if ( curEngStr === 'idb' && datConObj ) wriDatFun( appStaObj ).catch( () => {} ); // What: Async Database Write Call. Why: The real IDB write should still be attempted alongside the synchronous mirror above, for good measure. How: This fires wriDatFun without awaiting it, swallowing any failure since the sync mirror above is already the safety net.


}

// #endregion fluSynFun



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

async function wipDatFun() {


	lplRefArr = undefined; // What: Last-Pick-Log Reference Reset. Why: A wiped store has nothing to compare a future write's own pickLog against. How: This resets lplRefArr back to its own initial undefined value.



	try { for ( const curKeyStr of ownKeyFun() ) localStorage.removeItem( curKeyStr ); } // What: Owned Key Removal Try. Why: Older generations of this app wrote keys like 'easemylife.v1' and 'ease-my-life-v1', which are complete state blobs a fixed list would silently leave behind. How: This removes every key ownKeyFun finds, a prefix sweep rather than a hardcoded list.

	catch ( e ) {} // What: Owned Key Removal Guard. Why: A blocked or inaccessible localStorage must not abort the rest of this teardown. How: This silently ignores any error from the removal loop above.



	if ( curEngStr === 'idb' && datConObj ) { // What: Idb Clear Check. Why: The two IDB object stores only need clearing when IDB is actually the engine currently in use. How: This gates the clear calls below on that condition.


		try { // What: Idb Clear Try. Why: A clear() call can itself fail (a torn-down connection, a blocked transaction), and that must not abort the rest of this teardown either. How: This wraps both store clears below in one try/catch.


			await reqProFun( traStoFun( STA_STO_STR, 'readwrite' ).clear() ); // What: State Store Clear Call. Why: This is the actual clear of the non-pickLog portion of state. How: This awaits reqProFun wrapping a clear() request against the state object store.
			await reqProFun( traStoFun( PIC_LOG_STR, 'readwrite' ).clear() ); // What: Pick Log Store Clear Call. Why: This is the actual clear of the pick log. How: This awaits reqProFun wrapping a clear() request against the pick log object store.


		}

		catch ( e ) {} // What: Idb Clear Guard. Why: The clean state written by the very next save overwrites whatever is left either way, so a failed clear here is not fatal. How: This silently ignores any error from the two clear calls above.


	}



	cacStaObj = null; // What: Cached State Object Reset. Why: The next read of STG_NAM_OBJ.cacStaFun() must reflect the wipe, not stale pre-wipe state. How: This resets cacStaObj back to null.


}

// #endregion wipDatFun



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

async function datBytFun() {


	try { // What: Data Bytes Try. Why: readPersisted and JSON.stringify can both throw, and either failure should resolve to null rather than reject the caller. How: This wraps the whole measure sequence below, falling back to null in its own catch.


		const curStaObj = ( await reaPerFun() ) || cacStaObj; // What: Current State Object. Why: The freshest available state must be measured, preferring the authoritative persisted copy over the in-memory one. How: This awaits reaPerFun and falls back to cacStaObj only when that resolves to nothing.


		if ( !curStaObj ) return null; // What: No Current State Guard. Why: A genuinely fresh install has nothing to measure at all. How: This returns null immediately when neither reaPerFun nor cacStaObj has anything.



		const jsoTexStr = JSON.stringify( curStaObj ); // What: Json Text String. Why: The byte-size measurement below needs the exact serialized text that would actually be written to storage. How: This serializes curStaObj to JSON text.



		if ( typeof Blob === 'function' ) return new Blob( [ jsoTexStr ] ).size; // What: Blob Size Return. Why: Blob gives an exact byte count and is the preferred measurement wherever it is available. How: This wraps jsoTexStr in a Blob and returns its own size.



		if ( typeof TextEncoder === 'function' ) return new TextEncoder().encode( jsoTexStr ).length; // What: Text Encoder Size Return. Why: Some environments lack Blob but still support TextEncoder, which covers the same measurement. How: This encodes jsoTexStr and returns the resulting byte array's own length.



		return null; // What: No Measurement Return. Why: An environment with neither Blob nor TextEncoder has no way to measure this at all. How: This returns null as the last resort.


	}

	catch ( e ) { return null; } // What: Data Bytes Guard. Why: A measurement failure must not surface as an error to whichever caller (typically staRepFun) invoked this. How: This returns null instead of letting the error propagate.


}

// #endregion datBytFun



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

async function staRepFun() {


	let mirTimStr = null; // What: Mirror Time String. Why: The mirror freshness timestamp is read from localStorage, which can itself throw. How: This starts null and is only assigned inside the try block below.



	try { mirTimStr = localStorage.getItem( MIR_TIM_STR ); } // What: Mirror Time Read Try. Why: The mirror freshness timestamp must actually be read from localStorage before it can be reported. How: This assigns mirTimStr from whatever is currently stored under MIR_TIM_STR.

	catch ( e ) {} // What: Mirror Time Read Guard. Why: A blocked or inaccessible localStorage must not abort the rest of this status report. How: This silently leaves mirTimStr at its own null default instead of letting the read throw.



	const outStaObj = { engine : curEngStr, persisted : false, dataBytes : null, usage : null, quota : null, mirrorOk : mirWriBoo, mirrorAt : mirTimStr }; // What: Output Status Object. Why: This is the full report shape the Settings storage panel expects, seeded with everything already known synchronously. How: This is built once here and then filled in further by the awaited calls below.

	outStaObj.dataBytes = await datBytFun(); // What: Output Data Bytes Assignment. Why: The exact persisted byte size can only be known after an async measurement. How: This awaits datBytFun and assigns its result onto outStaObj.



	try { // What: Storage Estimate Try. Why: navigator.storage itself, or its persisted/estimate methods, may not exist in every browser. How: This wraps both optional calls below so an unsupported environment simply leaves outStaObj's own defaults in place.


		if ( navigator.storage && navigator.storage.persisted ) outStaObj.persisted = await navigator.storage.persisted(); // What: Output Persisted Assignment Check. Why: The Settings panel needs to know whether eviction-exempt persistence has already been granted. How: This awaits navigator.storage.persisted() only when that API exists, assigning its result onto outStaObj.


		if ( navigator.storage && navigator.storage.estimate ) { // What: Storage Estimate Check. Why: The Settings panel's headroom display needs the browser's own approximate usage/quota figures. How: This gates the estimate call and its two assignments below on that API existing at all.


			const estResObj = await navigator.storage.estimate(); // What: Estimate Result Object. Why: Both usage and quota come from the same single estimate() call. How: This awaits navigator.storage.estimate() once and reuses its result for both assignments below.

			outStaObj.usage = estResObj.usage; // What: Output Usage Assignment. Why: This figure needs to reach the final report even though only headroom, not exact size, should ever be read from it. How: This copies estResObj's own usage straight onto outStaObj.
			outStaObj.quota = estResObj.quota; // What: Output Quota Assignment. Why: This figure needs to reach the final report even though only headroom, not exact size, should ever be read from it. How: This copies estResObj's own quota straight onto outStaObj.


		}


	}

	catch ( e ) {} // What: Storage Estimate Guard. Why: An unsupported or throwing storage API must not abort the rest of this status report. How: This silently ignores any error from the two optional calls above.



	return outStaObj; // What: Output Status Return. Why: The caller (typically the Settings storage panel) needs the fully-assembled report. How: This returns the same outStaObj built and filled in throughout this function.


}

// #endregion staRepFun



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

async function reqPerFun() {


	try { // What: Request Persist Try. Why: navigator.storage itself, or its persist/persisted methods, may not exist in every browser. How: This wraps the whole check-then-request sequence below, falling back to false in its own catch.


		if ( !navigator.storage || !navigator.storage.persist ) return false; // What: No Persist Api Guard. Why: There is nothing to request at all in a browser without this API. How: This returns false immediately when either navigator.storage or its own persist method is missing.



		if ( await navigator.storage.persisted() ) return true; // What: Already Persisted Guard. Why: A repeat call should not re-prompt when persistence was already granted earlier. How: This returns true immediately without ever calling persist() again.



		return await navigator.storage.persist(); // What: Persist Request Return. Why: The caller needs to know whether this actual request was granted. How: This awaits navigator.storage.persist() and returns its own boolean result.


	}

	catch ( e ) { return false; } // What: Request Persist Guard. Why: A throwing storage API must not crash whichever caller invoked this. How: This returns false instead of letting the error propagate.


}

// #endregion reqPerFun



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

async function reaPerFun() {


	if ( curEngStr === 'idb' && datConObj ) { // What: Idb Engine Check. Why: IDB is the actual store of record whenever it is the current engine, so it must be read directly rather than relying on any in-memory copy. How: This gates the direct reaDatFun read below on that condition.


		try { return await reaDatFun(); } // What: Database Read Try. Why: The actual IDB read must be attempted before any fallback can be considered. How: This awaits reaDatFun and returns its own resolved value directly.

		catch ( e ) { return null; } // What: Database Read Guard. Why: A read failure here must resolve to null rather than reject whichever caller (typically an export) invoked this. How: This returns null instead of letting the error propagate.


	}



	return reaLocFun(); // What: Local Read Return. Why: Whenever IDB is not the engine of record, localStorage itself is the actual store of record. How: This returns reaLocFun's own result directly.


}

// #endregion reaPerFun



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

function logAutFun() { logSusBoo = false; } // What: Log Authoritative Body. Why: A caller that just imported or reset the pick log knows its own emptiness (or non-emptiness) is real, not a mirror artefact. How: This clears logSusBoo unconditionally.

// #endregion logAutFun



const cacStaFun = () => cacStaObj; // What: Cached State Function. Why: store.jsx's own loadState() reads this synchronously to seed React state before any save has happened yet. How: This closes over the module-private cacStaObj rather than exposing it directly.
const curEngFun = () => curEngStr; // What: Current Engine Function. Why: Nothing outside this file currently reads which engine is active, but this stays exported as part of STG_NAM_OBJ's own stable public shape. How: This closes over the module-private curEngStr rather than exposing it directly.



export const STG_NAM_OBJ = { // What: Storage Namespace Object. Why: This is the single public entry point every other file in this app imports by name. How: This maps each of this file's own internal function/variable names onto an external property name matching it exactly.


	cacStaFun   : cacStaFun,   // What: Cached State Function. Why: store.jsx's own loadState() reads this synchronously to seed React state before any save has happened yet. How: This re-exports cacStaFun under its own matching name.
	curEngFun   : curEngFun,   // What: Current Engine Function. Why: Nothing outside this file currently reads which engine is active, but this stays exported as part of STG_NAM_OBJ's own stable public shape. How: This re-exports curEngFun under its own matching name.
	fluSynFun   : fluSynFun,   // What: Flush Sync Function. Why: store.jsx calls this synchronously on pagehide/tab-hide, where an async save could be lost. How: This re-exports fluSynFun under its own matching name.
	iniStoFun   : iniStoFun,   // What: Init Storage Function. Why: main.jsx awaits this before React ever mounts, and store.jsx's own loadState() reads its result back synchronously afterward. How: This re-exports iniStoFun under its own matching name.
	logAutFun   : logAutFun,   // What: Log Authoritative Function. Why: store.jsx calls this right after an import or a reset, before the next save writes the fresh pickLog. How: This re-exports logAutFun under its own matching name.
	MIG_SNA_STR : MIG_SNA_STR, // What: Migration Snapshot String. Why: This stays exported as part of STG_NAM_OBJ's own stable public shape, even though nothing outside this file currently reads it. How: This re-exports the module-level MIG_SNA_STR constant unchanged.
	MIR_KEY_STR : MIR_KEY_STR, // What: Mirror Key String. Why: This stays exported as part of STG_NAM_OBJ's own stable public shape, even though nothing outside this file currently reads it. How: This re-exports the module-level MIR_KEY_STR constant unchanged.
	reaPerFun   : reaPerFun,   // What: Read Persisted Function. Why: tab-settings.jsx calls this so an export can never inherit a truncated in-memory pickLog. How: This re-exports reaPerFun under its own matching name.
	reqPerFun   : reqPerFun,   // What: Request Persist Function. Why: pwa.js calls this after real user engagement to request eviction-exempt storage. How: This re-exports reqPerFun under its own matching name.
	savStaFun   : savStaFun,   // What: Save State Function. Why: store.jsx calls this on every debounced state change. How: This re-exports savStaFun under its own matching name.
	staRepFun   : staRepFun,   // What: Status Report Function. Why: tab-settings.jsx polls this to render the storage panel. How: This re-exports staRepFun under its own matching name.
	wipDatFun   : wipDatFun    // What: Wipe Data Function. Why: store.jsx calls this from the Settings "Delete all data" flow. How: This re-exports wipDatFun under its own matching name.


};


