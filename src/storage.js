// Storage layer — IndexedDB primary, localStorage fallback.
//
// Why IndexedDB: navigator.storage.persist() exempts an origin from eviction,
// and what it protects is the IDB/Cache bucket. localStorage is the most
// eviction-prone tier and capped around 5MB, which the pick log will eventually
// reach. All data still lives only on this device.
//
// The async/sync seam: init() runs BEFORE React mounts and parks the loaded
// state in memory, so store.jsx's loadState() stays synchronous and no component
// had to become async. Writes are fire-and-forget.
const DB_NAME = 'easemylife';
const DB_VERSION = 1;          // structural only — which stores exist
const S_STATE = 'state';       // everything except pickLog, under key 'main'
const S_PICKLOG = 'picklog';   // pickLog alone, under key 'main'
const LS_KEY = 'easemylife.v2';                 // legacy live key + warm mirror
const LS_SNAPSHOT = 'easemylife.snapshot.pre-idb'; // rollback, bounded lifetime
const LS_BOOTS = 'easemylife.idbboots';            // successful IDB boots seen
// The snapshot exists to roll back a bad migration, not to live forever — a
// permanent plaintext copy of everything would survive "Delete all data" and
// break the app's on-device-only promise. Drop it once IDB has proven itself
// over this many clean boots.
const SNAPSHOT_KEEP_BOOTS = 3;

let db = null;
let engine = 'memory';   // 'idb' | 'localStorage' | 'memory'
let cached = null;       // state loaded by init(), or null for a fresh install
let lastPickLog = undefined; // reference of the pickLog last written
let mirrorOk = true;         // did the last localStorage mirror write succeed?
// True when the in-memory state was adopted from the warm localStorage mirror,
// which deliberately omits pickLog (see writeLs). Its pickLog is therefore an
// ARTEFACT — an empty array standing in for history we simply didn't read —
// and writing it back would erase the real log in IDB. That is how an export
// taken after a fallback boot came out with no history in it.
let logSuspect = false;
const LS_MIRROR_AT = 'easemylife.mirrorat';  // mirror freshness, survives reload
// Every localStorage key this app has ever written, across naming generations
// ('ease-my-life-v1' → 'easemylife.v1' → 'easemylife.v2'). Used by wipe() so
// "Delete all data" really does, and by init() to clear orphans the current
// layer never reads.
const OWNED_KEY_RE = /^ease[-]?my[-]?life/i;
function ownedKeys() {
  try { return Object.keys(localStorage).filter((k) => OWNED_KEY_RE.test(k)); }
  catch (e) { return []; }
}

const req = (r) => new Promise((res, rej) => {
  r.onsuccess = () => res(r.result);
  r.onerror = () => rej(r.error);
});

function openDb() {
  return new Promise((res, rej) => {
    if (!window.indexedDB) return rej(new Error('no indexedDB'));
    let r;
    try { r = indexedDB.open(DB_NAME, DB_VERSION); } catch (e) { return rej(e); }
    r.onupgradeneeded = () => {
      const d = r.result;
      if (!d.objectStoreNames.contains(S_STATE)) d.createObjectStore(S_STATE);
      if (!d.objectStoreNames.contains(S_PICKLOG)) d.createObjectStore(S_PICKLOG);
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
    r.onblocked = () => rej(new Error('idb blocked'));
    // Safari can leave open() hanging indefinitely rather than erroring.
    setTimeout(() => rej(new Error('idb open timeout')), 3000);
  });
}

function tx(store, mode) {
  return db.transaction(store, mode).objectStore(store);
}

async function readIdb() {
  const rest = await req(tx(S_STATE, 'readonly').get('main'));
  if (!rest) return null;
  const pickLog = await req(tx(S_PICKLOG, 'readonly').get('main'));
  return { ...rest, pickLog: pickLog || [] };
}

async function writeIdb(state) {
  const { pickLog, ...rest } = state;
  // Structured clone can't take proxies/functions; state is plain JSON, but
  // round-trip defensively so a stray non-clonable value can't kill the write.
  const plain = JSON.parse(JSON.stringify(rest));
  await req(tx(S_STATE, 'readwrite').put(plain, 'main'));
  // Only rewrite the log when it actually changed — it is the largest and
  // fastest-growing data, and re-serializing it on every keystroke is the
  // write jank this split exists to remove.
  // Never let a placeholder empty log overwrite real history. Only an explicit
  // import or reset may clear it (both call logAuthoritative()).
  const logEmpty = !pickLog || !pickLog.length;
  if (logSuspect && logEmpty) return;
  if (pickLog !== lastPickLog) {
    await req(tx(S_PICKLOG, 'readwrite').put(JSON.parse(JSON.stringify(pickLog || [])), 'main'));
    lastPickLog = pickLog;
    if (!logEmpty) logSuspect = false;   // we have the real log again
  }
}

function readLs() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    // The warm mirror deliberately omits pickLog (see writeLs). Legacy
    // pre-IDB data has it. Either way the app needs the array present.
    if (obj && !Array.isArray(obj.pickLog)) obj.pickLog = [];
    return obj;
  } catch (e) { return null; }
}

// Synchronous, best-effort warm copy. pickLog is EXCLUDED: it is the bulk of
// the payload and the whole point of giving it its own IDB store was to stop
// re-serializing it, so mirroring it on every tab switch would undo that. It
// is also the most reconstructible and least critical data — losing history
// beats losing pickers. `full` forces everything (fallback-engine writes,
// where localStorage IS the store of record).
function writeLs(state, full) {
  try {
    let payload = state;
    if (!full) {
      const { pickLog, ...rest } = state;
      payload = { ...rest, __mirrorNoLog: true };
    }
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
    mirrorOk = true;
    // Persisted, not just in-memory: the Settings storage panel reports backup
    // freshness on a cold load, before any tab-hide has happened this session.
    try { localStorage.setItem(LS_MIRROR_AT, new Date().toISOString()); } catch (e) {}
    return true;
  } catch (e) {
    // Quota. Non-fatal — IDB is the real store — but the stale copy is now a
    // liability if IDB later fails, so surface it via status() instead of
    // swallowing it.
    mirrorOk = false;
    return false;
  }
}

async function init() {
  try {
    db = await openDb();
    engine = 'idb';
    cached = await readIdb();
    if (!cached) {
      // First run under IDB. Adopt any existing localStorage data, keeping an
      // untouched snapshot as the rollback, and only release the live key once
      // the new store reads back.
      const legacy = readLs();
      if (legacy) {
        try {
          if (!localStorage.getItem(LS_SNAPSHOT)) {
            localStorage.setItem(LS_SNAPSHOT, localStorage.getItem(LS_KEY));
          }
        } catch (e) { /* snapshot is a nicety; migration continues */ }
        await writeIdb(legacy);
        const verify = await readIdb();
        if (verify && Array.isArray(verify.pickers)) {
          cached = verify;
        } else {
          // Migration didn't stick — stay on localStorage rather than risk it.
          engine = 'localStorage'; db = null; cached = legacy;
        }
      }
    }
  } catch (e) {
    // Private mode, opaque origin, or a blocked/hanging open. Keep working.
    db = null; engine = 'localStorage'; cached = readLs();
  }
  if (cached && cached.pickLog) lastPickLog = cached.pickLog;
  logSuspect = !!(cached && cached.__mirrorNoLog && !(cached.pickLog || []).length);
  // Retire the migration snapshot once IDB has booted cleanly enough times.
  if (engine === 'idb' && cached && Array.isArray(cached.pickers)) {
    try {
      const n = (parseInt(localStorage.getItem(LS_BOOTS), 10) || 0) + 1;
      localStorage.setItem(LS_BOOTS, String(n));
      if (n >= SNAPSHOT_KEEP_BOOTS) localStorage.removeItem(LS_SNAPSHOT);
      // Sweep dead pre-IDB generations once IDB is proven — the layer never
      // reads them, and they are full plaintext copies of user data.
      if (n >= SNAPSHOT_KEEP_BOOTS) {
        for (const k of ownedKeys()) {
          if (k !== LS_KEY && k !== LS_BOOTS && k !== LS_MIRROR_AT) localStorage.removeItem(k);
        }
      }
    } catch (e) { /* nothing critical depends on this */ }
  }
  return cached;
}

function save(state) {
  if (engine === 'idb' && db) {
    writeIdb(state).catch(() => {
      // A failed IDB write (quota, corruption) must not silently lose data.
      engine = 'localStorage'; db = null; writeLs(state, true);
    });
    return;
  }
  writeLs(state, true);
}

// Called on pagehide / tab hide. Mirrors synchronously to localStorage so a
// later IDB failure falls back to warm data instead of a seed, then kicks the
// async IDB write for good measure.
function flushSync(state) {
  writeLs(state, engine !== 'idb');
  if (engine === 'idb' && db) writeIdb(state).catch(() => {});
}

// Full teardown for "Delete all data": clears both IDB stores AND every
// localStorage key this layer owns, including the migration snapshot. Without
// this, reset left a complete plaintext copy of the user's data behind, which
// contradicts both the reset copy ("This can't be undone") and the app's
// on-device-only promise. Any future delete-account control must call this too.
async function wipe() {
  lastPickLog = undefined;
  // Prefix sweep, not a hardcoded list: older generations of this app wrote
  // 'easemylife.v1' and 'ease-my-life-v1', which are complete state blobs. A
  // fixed list silently leaves whatever it doesn't know about.
  try { for (const k of ownedKeys()) localStorage.removeItem(k); } catch (e) { /* ignore */ }
  if (engine === 'idb' && db) {
    try {
      await req(tx(S_STATE, 'readwrite').clear());
      await req(tx(S_PICKLOG, 'readwrite').clear());
    } catch (e) { /* the clean state overwrites it on the next save anyway */ }
  }
  cached = null;
}

async function status() {
  let mirrorAt = null;
  try { mirrorAt = localStorage.getItem(LS_MIRROR_AT); } catch (e) {}
  const out = { engine, persisted: false, usage: null, quota: null, mirrorOk, mirrorAt };
  try {
    if (navigator.storage && navigator.storage.persisted) out.persisted = await navigator.storage.persisted();
    if (navigator.storage && navigator.storage.estimate) {
      const est = await navigator.storage.estimate();
      out.usage = est.usage; out.quota = est.quota;
    }
  } catch (e) { /* unsupported */ }
  return out;
}

// Request eviction exemption. Call only after real engagement — Chromium will
// not re-prompt for the rest of the session once denied.
async function requestPersist() {
  try {
    if (!navigator.storage || !navigator.storage.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch (e) { return false; }
}

// The authoritative persisted state, re-read from the store of record. Export
// uses this so a backup can't inherit a truncated in-memory pickLog.
async function readPersisted() {
  if (engine === 'idb' && db) {
    try { return await readIdb(); } catch (e) { return null; }
  }
  return readLs();
}

// Declare that the caller's pickLog is intentional, empty or not (import,
// reset). Clears the mirror-artefact suspicion so the write goes through.
function logAuthoritative() { logSuspect = false; }

export const STORAGE = {
  init, save, flushSync, wipe, status, requestPersist, readPersisted, logAuthoritative,
  cached: () => cached,
  engine: () => engine,
  LS_KEY, LS_SNAPSHOT,
};
