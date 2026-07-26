// Local notifications. These fire only while the app is RUNNING (foreground or
// backgrounded tab) — the page is what decides to show them. Delivery to a
// fully closed app needs Web Push + a backend (see PWA-PLAN.md).
//
// Deliberate constraints:
//  • Fires only AFTER the Daily generator has already run, never as a prompt to
//    run it — so clicking can never trigger a second generation.
//  • Silent when the app is visible and focused: a notification for a page the
//    user is already looking at is pure noise.
//  • Once per local day, tracked in localStorage so a reload can't re-notify.
//  • Permission is requested exactly once, and only from a user gesture (the
//    Settings run-time change) — a denial is effectively permanent, so it is
//    never asked for on load.
const LS_DAY = 'easemylife.notifiedday';   // last local day we notified
const LS_ASKED = 'easemylife.notifyasked'; // permission requested once
const subs = new Set();
const notify = () => { for (const fn of subs) { try { fn(); } catch (e) {} } };

const supported = () => typeof window.Notification === 'function';
const permission = () => (supported() ? Notification.permission : 'unsupported');
const pad = (n) => String(n).padStart(2, '0');
const localDay = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const get = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };

const asked = () => !!get(LS_ASKED);

// Called from the run-time input's onChange — a real user gesture, and the
// moment the user has shown they care when the generator runs.
async function askOnce() {
  if (!supported() || Notification.permission !== 'default' || asked()) return permission();
  let res = 'default';
  try { res = await Notification.requestPermission(); } catch (e) { /* older API */ }
  // Only burn the one-time flag once the user has actually ANSWERED. Dismissing
  // the prompt (or a context that blocks it outright) leaves permission at
  // 'default', and in that case we should still be allowed to ask again later.
  if (res !== 'default') set(LS_ASKED, '1');
  notify();
  return res;
}

// Re-ask path for the Settings button (browsers ignore this once denied, but
// the user may have cleared the block themselves).
async function request() {
  if (!supported()) return 'unsupported';
  set(LS_ASKED, '1');
  let res = Notification.permission;
  try { if (res === 'default') res = await Notification.requestPermission(); } catch (e) {}
  notify();
  return res;
}

// Fired by the Today scheduler immediately after an AUTOMATIC generation.
// Async, but callers can ignore the promise — failures are never surfaced.
//
// Prefers the service worker's showNotification() over the page-level
// Notification constructor. This matters: on Android Chrome the constructor
// THROWS (`Failed to construct 'Notification'`) and always has — it requires a
// service worker registration. That was the reason notifications appeared to do
// nothing on mobile. The click behaviour for this path lives in
// public/sw-notify.js, since SW-owned notifications don't reach page handlers.
async function generated() {
  if (!supported() || Notification.permission !== 'granted') return false;
  // Don't interrupt someone who is already looking at the app.
  const visible = document.visibilityState === 'visible' && document.hasFocus();
  if (visible) return false;
  const today = localDay(new Date());
  if (get(LS_DAY) === today) return false;
  // Claim the day BEFORE the await, so two near-simultaneous calls can't both
  // get past the guard.
  set(LS_DAY, today);

  const title = 'Your life is ready to be eased!';
  const opts = {
    body: 'Your personalized list for today is ready. Click here to open it.',
    icon: 'assets/icon-192.png',
    badge: 'assets/icon-192.png',
    tag: 'eml-daily-' + today,   // collapses duplicates across tabs
    requireInteraction: false,
  };

  try {
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, opts);
        return true;
      }
    }
  } catch (e) { /* fall through to the page-level constructor */ }

  try {
    const n = new Notification(title, opts);
    // Click focuses the existing window — it never regenerates, because the
    // list this notification is about has already been built.
    n.onclick = () => {
      try { window.focus(); } catch (e) {}
      try { n.close(); } catch (e) {}
    };
    return true;
  } catch (e) {
    // Both paths failed — release the day so a later attempt can still notify.
    if (get(LS_DAY) === today) set(LS_DAY, '');
    return false;
  }
}

export const NOTIFY = {
  supported, permission, askOnce, request, generated, asked,
  subscribe: (fn) => { subs.add(fn); return () => subs.delete(fn); },
};
