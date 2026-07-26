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
// Whether we have waited long enough to conclude that beforeinstallprompt is
// never coming. There is no synchronous way to ask a browser "do you support
// installing?" — the only signal is the event firing, so absence has to be
// inferred from a grace period. Chromium also needs its own criteria met first
// (served over HTTPS, manifest parsed, service worker activated), which is why
// this waits on serviceWorker.ready before starting the clock rather than
// declaring the browser incapable while the SW is still installing.
let installProbeDone = false;
const subs = new Set();
const notify = () => { for (const fn of subs) { try { fn(); } catch (e) {} } };

(function probeInstallSupport() {
  const START_GRACE = 2500;
  const finish = () => {
    setTimeout(() => { installProbeDone = true; notify(); }, START_GRACE);
  };
  try {
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      // Cap the wait: a worker that never activates must not leave the UI
      // stuck on "checking" forever.
      Promise.race([
        navigator.serviceWorker.ready,
        new Promise((res) => setTimeout(res, 3000)),
      ]).then(finish, finish);
    } else {
      finish();
    }
  } catch (e) { finish(); }
})();

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

// One value for the UI to switch on, so the "can't install here" case is
// feature-detected rather than sniffed for Firefox by name — the same answer
// then covers any browser that doesn't implement the install prompt.
//
//   'standalone'  already running as an installed app
//   'ready'       beforeinstallprompt captured; the in-app button will work
//   'ios'         iOS/iPadOS Safari — manual Share → Add to Home Screen
//   'pending'     still waiting to find out; show nothing definitive yet
//   'unsupported' no prompt after the grace period
//
// Caveat worth knowing: Chromium also withholds beforeinstallprompt when the
// app is ALREADY installed and you open the site in a normal tab, so
// 'unsupported' can mean "already installed elsewhere". The copy keyed to it
// should stay neutral rather than asserting the browser is incapable.
function installState() {
  if (isStandalone()) return 'standalone';
  if (installEvent) return 'ready';
  if (isIOS && isSafari) return 'ios';
  return installProbeDone ? 'unsupported' : 'pending';
}

export const PWA = {
  isIOS, isSafari, isStandalone,
  canInstall: () => !!installEvent,
  installState,
  promptInstall,
  requestPersistOnce,
  // Called when the user creates their first picker: the first moment there is
  // data worth protecting from eviction.
  noteFirstPicker: () => requestPersistOnce(false),
  subscribe: (fn) => { subs.add(fn); return () => subs.delete(fn); },
};
