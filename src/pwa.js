import { STORAGE } from './storage.js';

// PWA glue: install prompt, standalone detection, and the engagement-gated
// request for persistent storage.
//
// Why engagement-gated: Chromium will not re-prompt for storage persistence for
// the rest of the session once a request is denied, and a cold first load — no
// data, no engagement — is the likeliest denial. So the request waits until the
// user has actually made something worth protecting (their first picker), at
// which point the browser's heuristics (and any install) work in our favour.
const LS_ASKED = 'easemylife.persistasked';

let installEvent = null;   // captured beforeinstallprompt
const subs = new Set();
const notify = () => { for (const fn of subs) { try { fn(); } catch (e) {} } };

// iOS/iPadOS Safari never fires beforeinstallprompt — installation is a manual
// Share → Add to Home Screen. Detected so the UI can show instructions instead
// of a dead button. iPadOS 13+ reports as Mac, hence the touch check.
const isIOS = /iP(hone|ad|od)/.test(navigator.platform || '')
  || (/Mac/.test(navigator.userAgent) && navigator.maxTouchPoints > 1)
  || /iPhone|iPad|iPod/.test(navigator.userAgent);
const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent);

function isStandalone() {
  try {
    return window.matchMedia('(display-mode: standalone)').matches
      || window.matchMedia('(display-mode: fullscreen)').matches
      || window.navigator.standalone === true;
  } catch (e) { return false; }
}

window.addEventListener('beforeinstallprompt', (e) => {
  // Keep the event so the app can show its own button rather than relying on
  // the browser's mini-infobar.
  e.preventDefault();
  installEvent = e;
  notify();
});
window.addEventListener('appinstalled', () => {
  installEvent = null;
  // An install is the strongest possible engagement signal — take the chance.
  requestPersistOnce(true);
  notify();
});

// Returns 'accepted' | 'dismissed' | 'unavailable'.
async function promptInstall() {
  if (!installEvent) return 'unavailable';
  const e = installEvent;
  installEvent = null;
  notify();
  try {
    e.prompt();
    const res = await e.userChoice;
    return (res && res.outcome) || 'dismissed';
  } catch (err) { return 'unavailable'; }
}

// Ask at most once per device unless forced, so a denial isn't re-requested on
// every launch (which browsers ignore anyway).
async function requestPersistOnce(force) {
  try {
    if (!force && localStorage.getItem(LS_ASKED)) return false;
    localStorage.setItem(LS_ASKED, '1');
  } catch (e) { /* private mode — just try */ }
  if (!STORAGE) return false;
  const ok = await STORAGE.requestPersist();
  notify();
  return ok;
}

export const PWA = {
  isIOS, isSafari, isStandalone,
  canInstall: () => !!installEvent,
  promptInstall,
  requestPersistOnce,
  // Called when the user creates their first picker: the first moment there is
  // data worth protecting from eviction.
  noteFirstPicker: () => requestPersistOnce(false),
  subscribe: (fn) => { subs.add(fn); return () => subs.delete(fn); },
};
