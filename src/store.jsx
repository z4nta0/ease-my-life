import React from 'react';
import { CADENCE } from './cadence.js';
import { CONDITIONALS } from './conditionals.js';
import { HOLIDAYS } from './holidays.js';
import { normalizeConditionalName, normalizeGroupName, normalizePickerName } from './pickers.js';
import { PWA } from './pwa.js';
import { CLEAN_STATE } from './seed.js';
import { STORAGE } from './storage.js';
import { TASKS } from './tasks.js';

// Store: single useState in App, plus action helpers. Persisted to localStorage.
// Kept intentionally framework-light so each tab can call the same helpers.

const STORAGE_KEY = 'easemylife.v2';
// State schema version, stamped into the state by migrate() and therefore
// carried inside exported backup files. Distinct from the IndexedDB database
// version (structural, in storage.js) and from the eventual package.json release
// version. Bump when adding a migration below.
const SCHEMA_V = 1;

// Inverts a hex color's lightness (same hue/chroma) using the browser's own
// oklch math, then reads back a plain hex — so the result stays usable
// directly as an <input type="color"> value (which only accepts hex; a raw
// "oklch(from ...)" string would be rejected). Used to auto-derive a custom
// theme's dark/light counterpart from whichever one the user actually edited.
// Hex ↔ OKLab conversion (Björn Ottosson's reference formulas) — used to
// invert a custom theme color's lightness deterministically, in plain math,
// rather than round-tripping through the browser's CSS color parser (which
// proved unreliable for "oklch(from ...)" relative-color strings: both
// getComputedStyle and canvas fillStyle produced garbage in testing).
function hexToRgb01(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
}
function srgbToLinear(c) { return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
function linearToSrgb(c) { c = Math.max(0, Math.min(1, c)); return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055; }
function linearRgbToOklab([r, g, b]) {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  return [
    0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_,
  ];
}
function oklabToLinearRgb([L, a, b]) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ * l_ * l_, m = m_ * m_ * m_, s = s_ * s_ * s_;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
}
function invertColorForTheme(hex) {
  try {
    let [L, a, b] = linearRgbToOklab(hexToRgb01(hex).map(srgbToLinear));
    // Near-neutral colors carry a tiny residual a/b from floating-point noise
    // in the forward conversion; left alone, that noise gets amplified when
    // inverting an extreme lightness (e.g. a near-white bg inverts to a
    // visibly red-tinted near-black instead of neutral). Clamp negligible
    // chroma to true zero first.
    if (Math.hypot(a, b) < 0.02) { a = 0; b = 0; }
    const rgb = oklabToLinearRgb([1 - L, a, b]).map(linearToSrgb).map((c) => Math.round(c * 255));
    return '#' + rgb.map((n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0')).join('');
  } catch (e) { return hex; }
}

// Make `name` unique among `siblings` (an array of existing names), appending
// " (2)", " (3)", … as needed. Case-insensitive compare so "vacuum"/"Vacuum"
// collide. Used when adding/renaming items (per picker) and reminders so two
// entries in the same scope can't share a name the user can't tell apart.
function uniqueName(name, siblings) {
  const taken = new Set(siblings.map((n) => (n || '').trim().toLowerCase()));
  const base = (name || '').trim();
  if (!taken.has(base.toLowerCase())) return base;
  // If the base already ends in " (N)", strip it so we re-number cleanly.
  const stripped = base.replace(/\s*\(\d+\)$/, '');
  let n = 2;
  while (taken.has(`${stripped} (${n})`.toLowerCase())) n++;
  return `${stripped} (${n})`;
}

// ── Pick log ───────────────────────────────────────────────────────────────
// Append-only, per-pick history that powers the Stats tab. ONE flat list (not
// a table per picker); filter it by date / pickerId as needed. Each row is a
// single pick that landed on the Today list:
//   { id, eid, date, pickerId, itemId, itemName, pickerName, group,
//     done, completedAt, source }
// - date        — 'YYYY-MM-DD' the pick was placed on Today
// - eid         — links to a live today.entries row (null once the day rolls)
// - source      — 'auto'   placed by the Daily generator (Regenerate)
//                 'manual' pushed from the Pickers tab via "Send to Today"
// - name/group  — denormalized so the log survives item/picker rename+delete
//                 (same trick reminderLog uses)
// The old per-day aggregate `history` is gone; Stats derives daily totals,
// rankings, streak, etc. from this log on the fly.
let _plSeq = 0;
function newLogId() {
  return 'pl_' + Date.now().toString(36) + (_plSeq++).toString(36);
}
let _clSeq = 0;
function newCondLogId() {
  return 'cl_' + Date.now().toString(36) + (_clSeq++).toString(36);
}
const isoDay = (d = new Date()) => {
  const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 10);
};
// Build a fresh log row for `itemId` under `picker`, denormalizing labels.
function logRow(s, { eid = null, pickerId, itemId, source, date, depletedEnd = false }) {
  const it = s.items.find((x) => x.id === itemId);
  const pk = s.pickers.find((x) => x.id === pickerId);
  return {
    id: newLogId(), eid, date: date || isoDay(),
    pickerId, itemId,
    itemName: it ? it.name : '(removed)',
    pickerName: pk ? pk.name : '(removed)',
    group: pk ? pk.group : '',
    done: false, completedAt: null, source,
    ...(depletedEnd ? { depletedEnd: true } : {}),
  };
}

// ── Done-gated pick mutations ────────────────────────────────────────────
// A pick's VALUE consequences (item value/weight changes, activeItemId patch,
// picks/lastPicked bump, depletedEnd on the log) are NOT applied when an entry
// is generated/re-rolled/sent — only when the entry is marked DONE. Until then
// nothing about item state changes, so an untouched item keeps its charge and
// keeps resurfacing. The staged mutation rides on the entry as `entry.pending`;
// applying it records an `entry.revert` snapshot so unchecking restores exactly.
//   pending = { updates:[{id,value?,weight?}], pickerPatch?, depletedEnd?, pickedId?, bumpPick? }
function applyEntryPending(s, entry) {
  const p = entry.pending;
  if (!p) return { items: s.items, pickers: s.pickers, pickLog: s.pickLog || [], revert: null };
  const upd = new Map((p.updates || []).map((u) => [u.id, u]));
  const touched = new Set([...(p.updates || []).map((u) => u.id), p.pickedId].filter(Boolean));
  // Snapshot the pre-apply state of every touched item for exact undo.
  const revertItems = s.items.filter((it) => touched.has(it.id)).map((it) =>
    ({ id: it.id, value: it.value, weight: it.weight, picks: it.picks, lastPicked: it.lastPicked, chargeStep: it.chargeStep }));
  const now = new Date().toISOString();
  const items = s.items.map((it) => {
    if (!touched.has(it.id)) return it;
    const u = upd.get(it.id);
    const next = { ...it };
    if (u) { if ('value' in u) next.value = u.value; if ('weight' in u) next.weight = u.weight; if ('chargeStep' in u) next.chargeStep = u.chargeStep; }
    if (it.id === p.pickedId && p.bumpPick) { next.picks = (it.picks || 0) + 1; next.lastPicked = now; }
    return next;
  });
  const prevActive = p.pickerPatch
    ? (s.pickers.find((x) => x.id === entry.pickerId) || {}).activeItemId : undefined;
  const pickers = p.pickerPatch
    ? s.pickers.map((x) => x.id === entry.pickerId ? { ...x, ...p.pickerPatch } : x)
    : s.pickers;
  // depletedEnd is a value consequence → record it on the live log row now.
  const pickLog = p.depletedEnd
    ? (s.pickLog || []).map((r) => (r.eid === entry.eid && !r.outcome) ? { ...r, depletedEnd: true } : r)
    : (s.pickLog || []);
  return { items, pickers, pickLog,
    revert: { items: revertItems, activeItemId: prevActive, pickerId: entry.pickerId } };
}
function revertEntryPending(s, entry) {
  const rev = entry.revert;
  if (!rev) return { items: s.items, pickers: s.pickers, pickLog: s.pickLog || [] };
  const revMap = new Map(rev.items.map((r) => [r.id, r]));
  const items = s.items.map((it) => {
    const r = revMap.get(it.id);
    return r ? { ...it, value: r.value, weight: r.weight, picks: r.picks, lastPicked: r.lastPicked, chargeStep: r.chargeStep } : it;
  });
  const pickers = (rev.activeItemId !== undefined)
    ? s.pickers.map((x) => x.id === rev.pickerId ? { ...x, activeItemId: rev.activeItemId } : x)
    : s.pickers;
  // Strip the depletedEnd flag so a reverted day no longer counts as a streak end.
  const pickLog = (s.pickLog || []).map((r) =>
    (r.eid === entry.eid && !r.outcome) ? { ...r, depletedEnd: false } : r);
  return { items, pickers, pickLog };
}

// Conditional consequences of toggling a Today entry done/undone. Returns the
// updated conditionals array (or the same ref if nothing changes).
//   • Day-off CARD entry (kind:'dayoff'): completion drives cardComplete
//     (ease-up/dynamic reset, ease-down discharge); snapshot _cardPrev for undo.
//   • Dependent PICKER entry (its picker.conditionalId set): the FIRST dependent
//     completion of the day advances the value (0→1 count edge); reverts when the
//     count returns to 0. Randomness is rolled once at the charging edge and the
//     pre-state snapshotted in _chargePrev for exact undo.
function applyConditionalToggle(s, newEntries, toggled, nowDone) {
  const conds = s.conditionals || [];
  if (!conds.length) return conds;
  const C = CONDITIONALS;
  // Day-off card toggle.
  if (toggled.kind === 'dayoff' && toggled.conditionalId) {
    return conds.map((c) => {
      if (c.id !== toggled.conditionalId) return c;
      if (nowDone) {
        const patch = C.cardComplete(c);
        if (!patch) return c; // probability modes: informational only
        return { ...c, _cardPrev: { value: c.value, triggered: c.triggered }, ...patch };
      }
      const prev = c._cardPrev;
      if (!prev) return c;
      const { _cardPrev, ...rest } = c;
      return { ...rest, value: prev.value, triggered: prev.triggered };
    });
  }
  // Dependent picker entry toggle.
  const picker = s.pickers.find((p) => p.id === toggled.pickerId);
  const condId = picker && picker.conditionalId;
  if (!condId) return conds;
  // Count done dependent entries AFTER this toggle (exclude day-off cards).
  const depDone = newEntries.filter((e) => {
    if (e.kind === 'dayoff' || !e.done) return false;
    const pk = s.pickers.find((p) => p.id === e.pickerId);
    return pk && pk.conditionalId === condId;
  }).length;
  return conds.map((c) => {
    if (c.id !== condId || !C.isValue(c.mode)) return c;
    if (nowDone && depDone === 1 && !c.chargedToday) {
      const patch = C.advanceOnCompletion(c);
      if (!patch) return c;
      return { ...c, _chargePrev: { value: c.value, triggered: c.triggered, chargedToday: c.chargedToday }, ...patch };
    }
    if (!nowDone && depDone === 0 && c._chargePrev) {
      const prev = c._chargePrev;
      const { _chargePrev, ...rest } = c;
      return { ...rest, value: prev.value, triggered: prev.triggered, chargedToday: prev.chargedToday };
    }
    return c;
  });
}

// Conditional history log delta. Mirrors applyConditionalToggle's completion
// edges but records ONE row per conditional per cycle (keyed condId + ISO day):
//   • Day-off CARD completion  → triggered:true  (all modes — this is the
//     configured-vs-observed numerator; probability cards log too).
//   • FIRST dependent completion of an UNtriggered cycle → triggered:false
//     (the "evaluated but didn't fire" denominator).
// Vacationed conditionals (active:false) log nothing — no logic runs for them.
// Undo removes the cycle's row once the confirming completion is gone. Rows
// denormalize name + mode so the log survives edits/deletes.
function applyConditionalLog(s, newEntries, toggled, nowDone) {
  const log = s.conditionalLog || [];
  const conds = s.conditionals || [];
  if (!conds.length) return log;
  let condId = null, triggered = null;
  if (toggled.kind === 'dayoff' && toggled.conditionalId) {
    condId = toggled.conditionalId; triggered = true;
  } else if (toggled.pickerId) {
    const pk = s.pickers.find((p) => p.id === toggled.pickerId);
    if (pk && pk.conditionalId) { condId = pk.conditionalId; triggered = false; }
  }
  if (!condId) return log;
  const cond = conds.find((c) => c.id === condId);
  if (!cond || cond.active === false) return log; // vacationed → no logging
  const day = isoDay();
  const existing = log.find((r) => r.condId === condId && r.date === day);
  const depDoneCount = () => newEntries.filter((e) => {
    if (e.kind === 'dayoff' || !e.done) return false;
    const p = s.pickers.find((pp) => pp.id === e.pickerId);
    return p && p.conditionalId === condId;
  }).length;
  if (nowDone) {
    if (existing) return log;                         // one row per cycle
    if (!triggered && depDoneCount() !== 1) return log; // only first dependent
    return [...log, { id: newCondLogId(), condId, date: day, triggered,
      mode: cond.mode, name: cond.name }];
  }
  // Undo: drop the cycle's row once the confirming completion is gone.
  if (!existing) return log;
  if (!triggered && depDoneCount() > 0) return log;   // another dependent still done
  return log.filter((r) => !(r.condId === condId && r.date === day));
}

// Unique id for a single Today entry. Entries are keyed by this (not by
// pickerId) so the same picker can contribute more than one choice to Today,
// and check / skip / re-roll act on exactly one of them.
let _eidSeq = 0;
function newEid() {
  return 'e_' + Date.now().toString(36) + (_eidSeq++).toString(36);
}

// Synchronous by design: STORAGE.init() has already resolved before React
// mounts (see the boot gate in the HTML shell), so the loaded state is sitting in
// memory and no component had to become async. The localStorage read is kept as a
// fallback for the case where storage.js failed to load at all.
function loadState() {
  try {
    const pre = STORAGE && STORAGE.cached();
    if (pre) return migrate(pre);
  } catch (e) { /* fall through */ }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrate(JSON.parse(raw));
  } catch (e) { /* fall through */ }
  // Nothing stored: a brand-new user starts empty and is met by onboarding.
  // (The demo fixture in seed.js — buildSeed/SEED — is design-time only and is
  // deliberately not shipped. It stays exported for local experiments.)
  return migrate(CLEAN_STATE());
}

// One-time migrations for old persisted state. Add fields here when the shape
// changes so users don't see "Invalid Date" or missing keys.
function migrate(s) {
  if (s && s.today && !s.today.generatedAt) {
    // Backfill to "this morning" so the footer reads sensibly until next regen.
    const d = new Date(); d.setHours(7, 12, 0, 0);
    s.today.generatedAt = d.toISOString();
  }
  if (s && s.today && s.today.streakClaimed === undefined) {
    // Today already counts toward the streak iff any entry is done.
    s.today.streakClaimed = (s.today.entries || []).some((e) => e.done);
  }
  // Backfill per-entry ids so older state (and the seed) supports multiple
  // entries per picker.
  if (s && s.today && Array.isArray(s.today.entries)) {
    for (const e of s.today.entries) { if (!e.eid) e.eid = newEid(); }
  }
  // Collapse the old category layer into pickers: each item gets a pickerId
  // (derived from whichever picker's itemIds listed it), and the categories
  // entity + picker.itemIds + item.categoryId are dropped. Detected by the
  // presence of itemIds on any picker.
  if (s && Array.isArray(s.pickers) && s.pickers.some((p) => Array.isArray(p.itemIds))) {
    const itemToPicker = {};
    for (const p of s.pickers) {
      if (Array.isArray(p.itemIds)) for (const id of p.itemIds) itemToPicker[id] = p.id;
    }
    if (Array.isArray(s.items)) {
      s.items = s.items.map((it) => {
        const pickerId = it.pickerId || itemToPicker[it.id] || null;
        const { categoryId, ...rest } = it;
        return { ...rest, pickerId };
      });
    }
    s.pickers = s.pickers.map((p) => { const { itemIds, ...rest } = p; return rest; });
    delete s.categories;
  }
  // Backfill the daily-schedule config introduced later: a global editable
  // holiday list, plus per-picker weekday + skip-holiday gates.
  if (s && !s.holidays && HOLIDAYS) s.holidays = HOLIDAYS.defaultState();
  // Daily generator auto-run time (added later); default 4:00 AM.
  if (s && s.daily && !s.daily.runTime) s.daily.runTime = '04:00';
  // Appearance (Settings tab, added later) — real persisted theme choice,
  // replacing the design-time Tweaks/EDITMODE palette default.
  if (s && !s.appearance) s.appearance = { theme: 'ink', customLight: null, customDark: null, autoSystem: false, pickAnim: 'reel', completionStyle: 'ripple', tabPlacement: 'bottom' };
  if (s && s.appearance && s.appearance.autoSystem === undefined) s.appearance.autoSystem = false;
  if (s && s.appearance && !s.appearance.pickAnim) s.appearance.pickAnim = 'reel';
  if (s && s.appearance && !s.appearance.completionStyle) s.appearance.completionStyle = 'ripple';
  if (s && s.appearance && !s.appearance.tabPlacement) s.appearance.tabPlacement = 'bottom';
  // Daily generator run mode (added later): 'auto' | 'manual'. Default auto.
  if (s && s.daily && !s.daily.mode) s.daily.mode = 'auto';
  // Manual reminders entity (added later). Backfill empty, and purge any
  // one-time reminders that were completed on a previous day.
  if (s && !Array.isArray(s.tasks)) s.tasks = [];
  if (s && Array.isArray(s.tasks) && TASKS) {
    s.tasks = s.tasks.filter((t) => !TASKS.isStaleOnce(t));
  }
  // Per-type reminder participation options (added later). Normalize so partial
  // or absent state gets the full default switch set.
  if (s && TASKS) s.reminderOpts = TASKS.normalizeOpts(s.reminderOpts);
  // Data-tab main sections (Conditionals, Reminders, each picker card) all
  // default COLLAPSED and read via `=== false` for expanded, so no seeding is
  // needed — see toggleControlsCollapsed's defaultCollapsed argument. Values
  // saved by the old inverted picker-card flag are dropped once so those cards
  // don't load pre-expanded under the new polarity.
  if (s && Array.isArray(s.pickers)) {
    const ui = s.ui || {};
    const cc = { ...(ui.controlsCollapsed || {}) };
    if (!cc.__collapseDefaultsV2) {
      cc.__collapseDefaultsV2 = true;
      delete cc.__sectionsSeeded;
      s.pickers.forEach((p) => { delete cc[p.id]; });
      delete cc.__reminders_main;
      delete cc.__conditionals;
    }
    s.ui = { ...ui, controlsCollapsed: cc };
  }
  // Reminders now count toward Stats by default. One-time flip for state saved
  // before that change (guarded by a flag so a user who later turns it off
  // isn't overridden on every load).
  if (s && !s._remStatsDefaultOn && s.reminderOpts) {
    s.reminderOpts.once.stats = true;
    s.reminderOpts.recurring.stats = true;
    s._remStatsDefaultOn = true;
  }
  // Onboarding (added later). Existing users must NOT be re-onboarded, so any
  // state that lacks the field is treated as already welcomed/dismissed. Fresh
  // clean state sets welcomed:false explicitly to trigger the first-run flow.
  if (s && !s.onboarding) s.onboarding = { welcomed: true, dismissed: true };
  // Reminder completion log (added later). Append-only history of check-offs.
  if (s && !Array.isArray(s.reminderLog)) s.reminderLog = [];
  // Reminder skip log (added later). Append-only history of skip actions.
  if (s && !Array.isArray(s.reminderSkipLog)) s.reminderSkipLog = [];
  // Vacation event log (added later). Append-only on/off transitions per item so
  // Stats can exclude days an item wasn't eligible. Empty for old state (past
  // treated as always-eligible); the live `item.vacation` bool is current truth.
  if (s && !Array.isArray(s.vacationLog)) s.vacationLog = [];
  // Conditionals (per-day picker gates, added later). Backfill empty; ensure
  // every picker has a conditionalId slot so gating code can read it uniformly.
  if (s && !Array.isArray(s.conditionals)) s.conditionals = [];
  // Split the old single `active` field into `active` (enabled/not-vacation) and
  // `triggered` (currently firing). Old `active` was the trigger, so migrate it.
  if (s && Array.isArray(s.conditionals)) {
    s.conditionals = s.conditionals.map((c) => {
      let n = ('triggered' in c) ? c : { ...c, triggered: !!c.active, active: true };
      // Migrate old weight-ratio odds (weight 1–9 via w/(w+1)) to a direct
      // percentage (oddsPct, 10–90 by 10). w1→50, w9→90.
      if (!('oddsPct' in n)) {
        const w = n.weight ?? 1;
        n = { ...n, oddsPct: Math.min(90, Math.max(10, Math.round((w / (w + 1)) * 10) * 10)) };
      }
      return n;
    });
  }
  if (s && Array.isArray(s.pickers)) {
    s.pickers = s.pickers.map((p) => ('conditionalId' in p ? p : { ...p, conditionalId: null }));
  }
  // Per-pick history log (added later). Backfill empty for old state; fresh
  // seeds ship a full ~1yr of rows.
  if (s && !Array.isArray(s.pickLog)) s.pickLog = [];
  // Conditional history log (added later). Append-only; one row per conditional
  // per completed cycle. Backfill empty for old state.
  if (s && !Array.isArray(s.conditionalLog)) s.conditionalLog = [];
  // Ease-down fair-rotation weights (added later). Older state carried arbitrary
  // static per-item weights; normalize each ease-down picker to the invariant:
  // its active item sits at weight 0 (barred from immediate re-pick) and every
  // other item at weight 1, so the fair rotation starts from a clean footing.
  // Guarded by a one-time flag so later accumulated weights aren't reset.
  if (s && !s._easeDownWeightsInit && Array.isArray(s.pickers) && Array.isArray(s.items)) {
    for (const p of s.pickers) {
      if (p.mode !== 'ease-down') continue;
      s.items = s.items.map((it) =>
        it.pickerId === p.id ? { ...it, weight: it.id === p.activeItemId ? 0 : 1 } : it);
    }
    s._easeDownWeightsInit = true;
  }
  if (s && Array.isArray(s.pickers)) {
    s.pickers = s.pickers.map((p) => {
      const np = { ...p };
      if (!Array.isArray(np.daysOfWeek)) np.daysOfWeek = [0, 1, 2, 3, 4, 5, 6];
      // Weekly cadence: the anchor day is always an allowed day (backfills state
      // saved before this rule existed).
      if (CADENCE) np.daysOfWeek = CADENCE.enforceWeeklyDay(np);
      if (typeof np.skipHolidays !== 'boolean') np.skipHolidays = false;
      // Picker Cadence (added later): surfacing anchor + display unit. Backfill
      // to 'daily' (original behavior) with sensible default anchors.
      if (!CADENCE.isCadence(np.cadence)) Object.assign(np, CADENCE.normalize(np));
      return np;
    });
  }
  // Persisted UI prefs (added later). `controlsCollapsed` maps a section id
  // ('__reminders' or a picker id) → true when the user has collapsed that
  // section's Controls sub-panel. Absent/false = open (the default).
  if (s && (!s.ui || typeof s.ui !== 'object')) s.ui = {};
  if (s && (!s.ui.controlsCollapsed || typeof s.ui.controlsCollapsed !== 'object')) s.ui.controlsCollapsed = {};
  // Today ordering (Edit Mode, added later). `groupOrder` = the display order of
  // the picker-based groups on Today; `pickerOrder` maps a group label → the
  // ordered picker ids within it (drives per-row order). Both are backfilled
  // from first-occurrence order in state.pickers so nothing shifts on upgrade,
  // and any newly-seen group/picker is appended to the end.
  if (s && Array.isArray(s.pickers)) {
    // Normalize any stored picker group names to the tidy Title-Case form so
    // pre-existing data (e.g. seeded "Self-care"/"Wind-down") matches names the
    // group selector now produces. Uses the same helper as the UI.
    if (normalizeGroupName) {
      s.pickers.forEach((p) => {
        if (p.group) {
          const n = normalizeGroupName(p.group);
          if (n) p.group = n;
        }
        // Tidy existing picker names to the same Title-Case form (transform
        // only — no mass de-dup, so we never silently rename a user's pickers).
        if (p.name && normalizePickerName) {
          const pn = normalizePickerName(p.name);
          if (pn) p.name = pn;
        }
      });
      // Bring stored order structures onto the normalized names too.
      if (Array.isArray(s.groupOrder)) {
        s.groupOrder = s.groupOrder.map((g) => g === '__reminders' ? g : (normalizeGroupName(g) || g));
      }
      if (s.pickerOrder && typeof s.pickerOrder === 'object') {
        const remapped = {};
        for (const [g, ids] of Object.entries(s.pickerOrder)) {
          const key = normalizeGroupName(g) || g;
          remapped[key] = (remapped[key] || []).concat(ids);
        }
        s.pickerOrder = remapped;
      }
    }
    const seenGroups = [];
    const idsByGroup = {};
    for (const p of s.pickers) {
      const g = p.group || 'Other';
      if (!seenGroups.includes(g)) seenGroups.push(g);
      (idsByGroup[g] = idsByGroup[g] || []).push(p.id);
    }
    if (!Array.isArray(s.groupOrder)) s.groupOrder = seenGroups.slice();
    else for (const g of seenGroups) if (!s.groupOrder.includes(g)) s.groupOrder.push(g);
    // The Reminders block participates in the same ordering (Edit Mode lets it be
    // dragged among the picker groups). Represented by the '__reminders' sentinel;
    // defaults to the front for anyone who hasn't reordered it.
    if (!s.groupOrder.includes('__reminders')) s.groupOrder.unshift('__reminders');
    if (!s.pickerOrder || typeof s.pickerOrder !== 'object') s.pickerOrder = {};
    for (const g of seenGroups) {
      // Keep real picker ids for this group PLUS any synthetic day-off / charging
      // ids (`dayoff_…` / a picker id carried by a charging card) the user has
      // reordered — those aren't in idsByGroup but their saved position must
      // survive a reload. Dedupe defensively (self-heals older corrupted order).
      const valid = new Set(idsByGroup[g]);
      const seenIds = new Set();
      const existing = (Array.isArray(s.pickerOrder[g]) ? s.pickerOrder[g] : [])
        .filter((id) => (valid.has(id) || String(id).startsWith('dayoff_')) && !seenIds.has(id) && seenIds.add(id));
      for (const id of idsByGroup[g]) if (!existing.includes(id)) existing.push(id);
      s.pickerOrder[g] = existing;
    }
  }
  if (s) s.v = SCHEMA_V;
  return s;
}

function saveState(s) {
  try {
    if (STORAGE) return STORAGE.save(s);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {}
}

// Teardown path (pagehide / tab hide): an async IDB write may not survive, so
// this also mirrors synchronously to localStorage.
function flushState(s) {
  try {
    if (STORAGE) return STORAGE.flushSync(s);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {}
}

// Today "counts" toward the streak if ANY picker entry is done OR any manual
// reminder was completed today. Given the next entries + tasks, reconcile the
// streak count against whether it was already claimed (so toggling the last
// done item back off un-claims, and never double-counts).
function reconcileStreak(s, entries, tasks) {
  const entriesList = entries || [];
  // Only reminders that are visible today AND whose type counts toward the
  // streak participate. (Skipped picker entries are already removed from the
  // entries list, so they can't block the day; re-rolled entries keep one live
  // entry that must be completed.)
  const visible = TASKS.visibleToday(tasks, s.reminderOpts, s.holidays);
  const streakTasks = visible.filter((t) => TASKS.optsFor(t, s.reminderOpts).streak);
  // The day is claimed only when EVERYTHING on Today is done — every picker
  // entry AND every streak-counting reminder. A day with nothing to do can't
  // claim a streak.
  const hasAny = entriesList.length > 0 || streakTasks.length > 0;
  const allEntriesDone = entriesList.every((e) => e.done);
  const allTasksDone = streakTasks.every((t) => TASKS.isDoneToday(t));
  const nowDone = hasAny && allEntriesDone && allTasksDone;
  const wasClaimed = !!s.today.streakClaimed;
  let streak = s.streak;
  let streakClaimed = wasClaimed;
  if (nowDone && !wasClaimed) { streak = streak + 1; streakClaimed = true; }
  else if (!nowDone && wasClaimed) { streak = Math.max(0, streak - 1); streakClaimed = false; }
  return { streak, streakClaimed };
}

function useStore(opts) {
  const [state, setState] = React.useState(() => (opts && opts.initial ? migrate(opts.initial) : loadState()));
  const persist = !(opts && opts.persist === false);
  // Persistence is a synchronous localStorage.setItem(JSON.stringify(state)) and
  // the state carries a long pick log, so writing on every setState blocked the
  // main thread — it janked the Regenerate loader (the write landed mid-animation
  // whenever a store update fired around it). Schedule the write during idle time
  // and coalesce rapid updates so it no longer competes with animation frames;
  // flush synchronously on hide/unload (and on unmount) so nothing is ever lost.
  const latestRef = React.useRef(state);
  latestRef.current = state;
  const idleRef = React.useRef(null);
  const cancelPending = React.useCallback(() => {
    if (idleRef.current == null) return;
    (window.cancelIdleCallback || clearTimeout)(idleRef.current);
    idleRef.current = null;
  }, []);
  React.useEffect(() => {
    if (!persist) return;
    cancelPending();
    const schedule = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
    idleRef.current = schedule(() => { idleRef.current = null; saveState(latestRef.current); }, { timeout: 2000 });
  }, [state, persist]);
  React.useEffect(() => {
    if (!persist) return;
    const flush = () => { cancelPending(); flushState(latestRef.current); };
    const onVis = () => { if (document.visibilityState === 'hidden') flush(); };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVis);
    return () => { flush(); window.removeEventListener('pagehide', flush); document.removeEventListener('visibilitychange', onVis); };
  }, [persist]);

  const actions = React.useMemo(() => ({
    // Wipe persisted storage as well as in-memory state — including the
    // pre-IDB migration snapshot, which would otherwise survive a "delete all
    // data" as a full plaintext copy. The clean state is written back by the
    // normal persist effect right after.
    reset: () => {
      try { if (STORAGE) { STORAGE.wipe(); STORAGE.logAuthoritative(); } } catch (e) {}
      setState(migrate(CLEAN_STATE()));
    },

    // Onboarding progress (welcome modal / get-started checklist). Merges a
    // partial patch so callers can flip one flag at a time.
    setOnboarding: (patch) => setState((s) => ({ ...s, onboarding: { ...(s.onboarding || {}), ...patch } })),

    // Replace the whole store from an imported JSON blob (Settings → Data
    // control → Import). Runs through migrate() so older/partial exports get
    // the same backfills a fresh load would.
    // An imported backup's pickLog is authoritative even when empty — it
    // replaces all data, so stale local history must not survive it.
    importData: (obj) => {
      try { if (STORAGE) STORAGE.logAuthoritative(); } catch (e) {}
      setState(migrate(obj));
    },

    // Apply picker `updates` (value mutations) + optional picker patch
    // (ease-down activeItemId) + bookkeeping.
    applyPickResult: (pickerId, result) => setState((s) => {
      // Each update may patch `value` (drift/charge) and/or `weight` (ease-down's
      // system-managed fairness counter). Only apply the fields present.
      const map = new Map(result.updates.map((u) => [u.id, u]));
      const items = s.items.map((it) => {
        const u = map.get(it.id);
        if (!u) return it;
        const next = { ...it };
        if ('value' in u) next.value = u.value;
        if ('weight' in u) next.weight = u.weight;
        if (result.picked && result.picked.id === it.id) {
          next.picks = (it.picks || 0) + 1;
          next.lastPicked = new Date().toISOString();
        }
        return next;
      });
      const pickers = result.pickerPatch
        ? s.pickers.map((p) => p.id === pickerId ? { ...p, ...result.pickerPatch } : p)
        : s.pickers;
      return { ...s, items, pickers };
    }),

    // Add a NEW today entry for `pickerId` showing `itemId`. Multiple entries
    // per picker are allowed for other modes — the Pickers tab uses this to ADD
    // a choice; the user prunes any they don't want with each entry's own Skip
    // button. Ease-down is the one exception: since it's a single ongoing
    // "active item", sending a new pick REPLACES today's existing entry for
    // that picker rather than stacking a second one.
    addTodayEntry: (pickerId, itemId, pendingArg) => setState((s) => {
      const pk = s.pickers.find((p) => p.id === pickerId);
      const isEaseDown = pk && pk.mode === 'ease-down';
      const eid = isEaseDown
        ? (s.today.entries.find((e) => e.pickerId === pickerId)?.eid || newEid())
        : newEid();
      // Manual send stages its value mutation as `pending` (applied on DONE), so
      // sending an item doesn't change picker state until it's completed. The
      // caller (Pickers-tab spin) passes the full staged pick result; if it
      // doesn't, fall back to the ease-down default (make this item active and
      // recharge the previously-active one on done). Other modes: no mutation.
      let pending = pendingArg;
      if (pending === undefined) {
        pending = null;
        if (isEaseDown && pk.activeItemId !== itemId) {
          const threshold = pk.threshold ?? 100;
          pending = {
            updates: pk.activeItemId ? [{ id: pk.activeItemId, value: threshold }] : [],
            pickerPatch: { activeItemId: itemId },
            pickedId: itemId, bumpPick: false,
          };
        }
      }
      const entry = { eid, pickerId, itemId, done: false, skipped: false, pending, revert: null };
      const row = logRow(s, { eid, pickerId, itemId, source: 'manual' });
      // Ease-down keeps a single entry per picker — a manual push normally
      // replaces it. EXCEPTION: if the picker was suppressed and its conditional's
      // day-off card is showing, ADD an extra card instead (leave the day-off
      // card intact) so the override sits alongside it.
      const condId = pk && pk.conditionalId;
      const hasDayoff = isEaseDown && condId &&
        s.today.entries.some((e) => e.kind === 'dayoff' && e.conditionalId === condId);
      const entries = (isEaseDown && !hasDayoff)
        ? [...s.today.entries.filter((e) => e.pickerId !== pickerId), entry]
        : [...s.today.entries, entry];
      // Drop any earlier log row for the entry we're replacing so the log
      // doesn't carry a stale duplicate under the same eid.
      const pickLog = isEaseDown
        ? [...(s.pickLog || []).filter((r) => r.eid !== eid), row]
        : [...(s.pickLog || []), row];
      return { ...s, today: { ...s.today, entries }, pickLog };
    }),

    // Replace the item shown by ONE entry (used by Today's Re-roll). Option B:
    // instead of overwriting the row, MARK the rolled-away row outcome:'rejected'
    // (keeping its itemId so we know WHAT was rejected) and APPEND a fresh
    // 'reroll' row for the item we land on. Consecutive re-rolls leave a chain
    // of rejected rows + one live row, all sharing the eid. Rejected rows never
    // count toward day totals; they power the per-item "re-rolled away" metric.
    setEntryItem: (eid, itemId, pending) => setState((s) => {
      const entry = s.today.entries.find((e) => e.eid === eid);
      let items = s.items, pickers = s.pickers, pickLog = s.pickLog || [];
      // If this entry was already completed, undo its applied mutation before
      // restaging the new pick (re-roll always lands not-done).
      if (entry && entry.done && entry.revert) {
        const r = revertEntryPending({ ...s }, entry);
        items = r.items; pickers = r.pickers; pickLog = r.pickLog;
      }
      const cur = pickLog.find((r) => r.eid === eid && !r.outcome);
      const pickerId = cur ? cur.pickerId
        : (s.today.entries.find((e) => e.eid === eid) || {}).pickerId;
      let newLog = pickLog.map((r) =>
        (r.eid === eid && !r.outcome) ? { ...r, outcome: 'rejected' } : r);
      if (pickerId) newLog.push(logRow({ ...s, items }, { eid, pickerId, itemId, source: 'reroll' }));
      return { ...s, items, pickers,
        today: { ...s.today, entries: s.today.entries.map((e) =>
          e.eid === eid ? { ...e, itemId, done: false, skipped: false, pending: pending || null, revert: null } : e) },
        pickLog: newLog };
    }),

    // Rebuild the entire entries list from scratch (used by Generate). Each
    // gets a fresh eid and starts not-done.
    // `opts.resetStreak` — when true, clears today.streakClaimed so the new
    // period starts unclaimed (the just-finished period's point, if any, was
    // already banked into `streak` and is never touched here). Only the
    // scheduled auto-run passes this; a manual Regenerate does NOT, so a user
    // can't "farm" extra streak points by repeatedly regenerating + completing
    // within the same calendar day. Deliberately NOT derived from the date —
    // it's purely which caller asked for it.
    replaceTodayEntries: (list, opts) => setState((s) => {
      const day = isoDay();
      // Two kinds of items in `list`:
      //  • carried  — a fully-formed prior entry (has _carry + entry) to keep
      //    VERBATIM (same eid/itemId/pending/done/revert/periodKey) so a cadence
      //    pick persists across days until completed. Its pick-log row is kept.
      //  • fresh    — a descriptor (no eid) → new eid, fresh 'auto' log row.
      const carried = list.filter((e) => e._carry).map((e) => e.entry);
      const carriedEids = new Set(carried.map((e) => e.eid));
      const fresh = list.filter((e) => !e._carry).map((e) => ({
        eid: newEid(), pickerId: e.pickerId || null, itemId: e.itemId || null,
        done: false, skipped: false, pending: e.pending || null, revert: null,
        ...(e.periodKey ? { periodKey: e.periodKey } : {}),
        // Day-off card entries carry a kind + conditional link + display text and
        // have no itemId; they never write to the pick log (excluded from stats).
        ...(e.kind ? { kind: e.kind, conditionalId: e.conditionalId || null, cardText: e.cardText || '', group: e.group || 'Other' } : {}) }));
      const entries = [...carried, ...fresh];
      // The generator owns today: drop any of today's existing log rows (auto
      // OR manual) EXCEPT carried entries' rows, and write fresh 'auto' rows for
      // the new set. `depletedEnd` is NOT written here — it's a value consequence,
      // recorded only when the entry is marked done. Day-off cards are skipped.
      const rows = fresh.filter((e) => !e.kind && e.pickerId).map((e) =>
        logRow(s, { eid: e.eid, pickerId: e.pickerId, itemId: e.itemId, source: 'auto', date: day }));
      const pickLog = (s.pickLog || []).filter((r) => r.date !== day || carriedEids.has(r.eid)).concat(rows);
      const today = { ...s.today, entries };
      if (opts && opts.resetStreak) today.streakClaimed = false;
      // Every Generate (manual Regenerate or scheduled auto-run) also drops
      // completed one-time reminders outright — Generate is the refresh point
      // for the whole Today list, so a checked-off once reminder shouldn't
      // wait for a future reload/day-change to disappear.
      const tasks = (s.tasks || []).filter((t) => !TASKS.isCompletedOnce(t));
      return { ...s, today, pickLog, tasks };
    }),

    // Phase A of Generate: resolve each conditional's `active` for the new day
    // (roll probability/dynamic modes; carry persisted active for ease modes),
    // and clear the per-day charge guard. Returns the resolved conditionals so
    // the generator can gate pickers off fresh values in the same pass.
    resolveConditionalsForDay: () => {
      let resolved = null;
      setState((s) => {
        const patch = CONDITIONALS.resolveForDay(s.conditionals || []);
        const conditionals = (s.conditionals || []).map((c) => ({ ...c, ...patch[c.id] }));
        resolved = conditionals;
        return { ...s, conditionals };
      });
      return resolved;
    },

    addConditional: (cond) => setState((s) => ({
      ...s, conditionals: [{
        id: cond.id || ('cnd_' + Math.random().toString(36).slice(2, 8)),
        name: cond.name || 'Conditional', mode: cond.mode || 'ease-up',
        cardText: cond.cardText || 'Day off', value: cond.mode === 'ease-down' ? (cond.threshold ?? 100) : 0,
        weight: cond.weight ?? 1, oddsPct: cond.oddsPct ?? 50,
        // `active` = enabled (not on vacation); `triggered` = currently firing.
        active: cond.active !== undefined ? cond.active : true,
        triggered: cond.triggered !== undefined ? cond.triggered : (cond.mode === 'ease-down'),
        easeMin: cond.easeMin ?? 7, easeMax: cond.easeMax ?? 14,
        threshold: cond.threshold ?? 100, chargedToday: false,
      }, ...(s.conditionals || [])] })),

    updateConditional: (id, patch) => setState((s) => ({
      ...s, conditionals: (s.conditionals || []).map((c) => c.id === id ? { ...c, ...patch } : c) })),

    removeConditional: (id) => setState((s) => ({
      ...s, conditionals: (s.conditionals || []).filter((c) => c.id !== id),
      pickers: s.pickers.map((p) => p.conditionalId === id ? { ...p, conditionalId: null } : p) })),

    toggleDone: (eid) => setState((s) => {
      const entry = s.today.entries.find((e) => e.eid === eid);
      if (!entry) return s;
      const nowDone = !entry.done;
      // Apply the staged pick mutation on DONE; revert it on UNDONE.
      let items = s.items, pickers = s.pickers, pickLog = s.pickLog || [], revert = null;
      if (nowDone) {
        const r = applyEntryPending({ ...s }, entry);
        items = r.items; pickers = r.pickers; pickLog = r.pickLog; revert = r.revert;
      } else {
        const r = revertEntryPending({ ...s }, entry);
        items = r.items; pickers = r.pickers; pickLog = r.pickLog; revert = null;
      }
      const newEntries = s.today.entries.map((e) =>
        e.eid === eid ? { ...e, done: nowDone, skipped: false, revert } : e);
      // Conditional consequences (charge on first dependent completion, or
      // day-off card reset/discharge).
      const conditionals = applyConditionalToggle({ ...s, items, pickers }, newEntries, entry, nowDone);
      const conditionalLog = applyConditionalLog({ ...s, items, pickers }, newEntries, entry, nowDone);
      // Only the live (active) row for this eid toggles — never rejected/skipped.
      pickLog = pickLog.map((r) => (r.eid === eid && !r.outcome)
        ? { ...r, done: nowDone, completedAt: nowDone ? new Date().toISOString() : null }
        : r);
      const { streak, streakClaimed } = reconcileStreak({ ...s, items, pickers }, newEntries, s.tasks);
      return { ...s, items, pickers, conditionals, conditionalLog, streak, today: { ...s.today, entries: newEntries, streakClaimed }, pickLog };
    }),

    skipEntry: (eid) => setState((s) => {
      // Skip removes the entry from today, but its live log row is KEPT and
      // marked outcome:'skipped' (like re-roll's 'rejected') so Stats can count
      // per-item skips. Skipped rows never count toward pick totals. Rejected
      // rows for the same eid stay as they are. If the entry had been completed,
      // undo its applied mutation first (it's no longer a completion).
      const entry = s.today.entries.find((e) => e.eid === eid);
      let items = s.items, pickers = s.pickers, pickLog = s.pickLog || [];
      if (entry && entry.done && entry.revert) {
        const r = revertEntryPending({ ...s }, entry);
        items = r.items; pickers = r.pickers; pickLog = r.pickLog;
      }
      const newEntries = s.today.entries.filter((e) => e.eid !== eid);
      // If a completed entry is skipped it's no longer a completion — revert any
      // conditional charge it drove (day-off card discharge / dependent charge).
      const conditionals = (entry && entry.done)
        ? applyConditionalToggle({ ...s, items, pickers }, newEntries, entry, false)
        : (s.conditionals || []);
      const conditionalLog = (entry && entry.done)
        ? applyConditionalLog({ ...s, items, pickers }, newEntries, entry, false)
        : (s.conditionalLog || []);
      pickLog = pickLog.map((r) =>
        (r.eid === eid && r.outcome !== 'rejected') ? { ...r, outcome: 'skipped', done: false, completedAt: null } : r);
      const { streak, streakClaimed } = reconcileStreak({ ...s, items, pickers }, newEntries, s.tasks);
      return { ...s, items, pickers, conditionals, conditionalLog, streak, today: { ...s.today, entries: newEntries, streakClaimed }, pickLog };
    }),

    toggleVacation: (id, kind) => setState((s) => {
      const day = isoDay();
      // When an item that is a picker's active ease-down item goes ON vacation,
      // abandon it: null the picker's activeItemId and recharge the item to full
      // (an abandoned streak never reached 0, so it won't count toward Spent).
      const abandonIfActive = (pickers, items, itemIds) => {
        let nextP = pickers, nextI = items;
        for (const itemId of itemIds) {
          const pk = nextP.find((p) => p.mode === 'ease-down' && p.activeItemId === itemId);
          if (!pk) continue;
          const threshold = pk.threshold ?? 100;
          nextP = nextP.map((p) => p.id === pk.id ? { ...p, activeItemId: null } : p);
          nextI = nextI.map((it) => it.id === itemId ? { ...it, value: threshold } : it);
        }
        return { pickers: nextP, items: nextI };
      };
      if (kind === 'item') {
        const it = s.items.find((x) => x.id === id);
        const on = it ? !it.vacation : true;
        let items = s.items.map((it) => it.id === id ? { ...it, vacation: !it.vacation } : it);
        let pickers = s.pickers;
        if (on) ({ pickers, items } = abandonIfActive(pickers, items, [id]));
        return { ...s, items, pickers,
          vacationLog: [...(s.vacationLog || []), { itemId: id, date: day, on }] };
      }
      // picker — flip all items owned by the picker to match the new state
      const owned = s.items.filter((it) => it.pickerId === id);
      const next = !(owned.length && owned.every((it) => it.vacation));
      const changed = owned.filter((it) => it.vacation !== next);
      let items = s.items.map((it) => it.pickerId === id ? { ...it, vacation: next } : it);
      let pickers = s.pickers;
      if (next) ({ pickers, items } = abandonIfActive(pickers, items, changed.map((it) => it.id)));
      return {
        ...s,
        items,
        pickers,
        vacationLog: [...(s.vacationLog || []), ...changed.map((it) => ({ itemId: it.id, date: day, on: next }))],
      };
    }),

    setItemWeight: (id, weight) => setState((s) => ({
      ...s,
      items: s.items.map((it) => it.id === id ? { ...it, weight } : it),
    })),

    updateItem: (id, patch) => setState((s) => ({
      ...s,
      items: s.items.map((it) => it.id === id ? { ...it, ...patch } : it),
    })),

    // Move an item to the end of the global items array (Pickers-tab add flow
    // renders a picker's items in array order, so this lands a just-saved item
    // at the bottom of that picker's list).
    moveItemToEnd: (id) => setState((s) => {
      const it = s.items.find((x) => x.id === id);
      if (!it) return s;
      return { ...s, items: [...s.items.filter((x) => x.id !== id), it] };
    }),

    // Commit-time rename with de-duplication (used on blur/Enter/Save, NOT on
    // every keystroke) so two items in the same picker can't share a name.
    renameItem: (id, name) => setState((s) => {
      const target = s.items.find((it) => it.id === id);
      const siblings = s.items.filter((it) => it.pickerId === (target && target.pickerId) && it.id !== id).map((it) => it.name);
      const unique = uniqueName(name, siblings);
      return { ...s, items: s.items.map((it) => it.id === id ? { ...it, name: unique } : it) };
    }),

    // Full replace — used to revert an item to a snapshot on editor Cancel.
    replaceItem: (id, item) => setState((s) => ({
      ...s,
      items: s.items.map((it) => it.id === id ? { ...item } : it),
    })),

    addItem: (pickerId, name, id) => setState((s) => {
      const siblings = s.items.filter((it) => it.pickerId === pickerId);
      const pk = s.pickers.find((p) => p.id === pickerId);
      const isDown = pk && pk.mode === 'ease-down';
      // Ease-down items start fully charged and join the fairness rotation at the
      // AVERAGE weight of existing items (excluding the weight-0 active item, so a
      // fresh streak's zero can't drag the newcomer down), rounded, floored at 1
      // so it's never a second weight-0. No peers yet → weight 1.
      let weight = 1, value = 0;
      if (isDown) {
        value = pk.threshold ?? 100;
        const peers = siblings.map((it) => it.weight ?? 1).filter((w) => w > 0);
        weight = peers.length
          ? Math.max(1, Math.round(peers.reduce((a, b) => a + b, 0) / peers.length))
          : 1;
      }
      const it = {
        id: id || ('it_' + Math.random().toString(36).slice(2, 8)),
        name: uniqueName(name, siblings.map((x) => x.name)), pickerId,
        weight, value, vacation: false, picks: 0, lastPicked: null,
      };
      return { ...s, items: [it, ...s.items] };
    }),

    // Create a brand-new picker from the Add-picker flow. Builds a fresh pool
    // (Option B): each typed item becomes a new item owned by this picker via
    // pickerId. `items` is an array of { name, weight, easeMin?, easeMax? }. For
    // ease modes each item carries its OWN drift band; the picker-level
    // easeMin/easeMax is just a fallback span. Returns the new picker id.
    // Initial drift `value` depends on mode — ease-down items start "charged"
    // at the threshold; else 0.
    addPicker: ({ name, group, mode, items, easeMin, easeMax, includeInDaily = true, daysOfWeek, skipHolidays = false, conditionalId = null, newConditional = null, cadence = 'daily', anchorDow, anchorDom, anchorMonth, anchorDay }) => {
      // First picker = the first data worth protecting from eviction. Ask the
      // browser for persistent storage now rather than on a cold first load,
      // where a denial would be sticky for the session.
      try {
        const cur = latestRef.current;
        if (PWA && cur && (cur.pickers || []).length === 0) PWA.noteFirstPicker();
      } catch (e) {}
      const pid = 'pkr_' + Math.random().toString(36).slice(2, 8);
      const initialValue = mode === 'ease-down' ? 100 : 0;
      const isEase = mode === 'ease-up' || mode === 'ease-down';
      const isDown = mode === 'ease-down';
      const newItems = (items || []).map((it) => ({
        id: 'it_' + Math.random().toString(36).slice(2, 8),
        name: it.name, pickerId: pid,
        // Ease-down: every item starts at fairness-weight 1 (system-managed), so
        // the first pick is uniform; user-supplied weights don't apply to it.
        weight: isDown ? 1 : (it.weight || 1),
        // Honor a value the create form already set (e.g. Fill/Refill charging an
        // ease item to threshold); otherwise fall back to the mode's default.
        value: it.value != null ? it.value : initialValue,
        // Per-item drift band for ease modes; omitted otherwise.
        ...(isEase ? { easeMin: it.easeMin ?? 7, easeMax: it.easeMax ?? 14 } : {}),
        vacation: !!it.vacation, picks: 0, lastPicked: null,
      }));
      // A brand-new inline conditional gets a fresh id here so we can attach it.
      const madeCond = newConditional ? {
        id: 'cnd_' + Math.random().toString(36).slice(2, 8),
        name: (normalizeConditionalName && normalizeConditionalName(newConditional.name)) || newConditional.name || 'Conditional', mode: newConditional.mode || 'random',
        cardText: newConditional.cardText || 'Day off',
        value: newConditional.mode === 'ease-down' ? (newConditional.threshold ?? 100) : (newConditional.value ?? 0),
        weight: newConditional.weight ?? 1, oddsPct: newConditional.oddsPct ?? 50,
        active: newConditional.active !== undefined ? newConditional.active : true,
        triggered: newConditional.triggered !== undefined ? newConditional.triggered : (newConditional.mode === 'ease-down'),
        easeMin: newConditional.easeMin ?? 7, easeMax: newConditional.easeMax ?? 14,
        threshold: newConditional.threshold ?? 100, chargedToday: false,
      } : null;
      const picker = {
        id: pid, group, name, mode,
        easeMin: easeMin ?? 10, easeMax: easeMax ?? 20, threshold: 100,
        // Daily-generator schedule: which weekdays it may run on, and whether
        // it sits out public holidays.
        daysOfWeek: CADENCE.enforceWeeklyDay({
          ...CADENCE.normalize({ cadence, anchorDow, anchorDom, anchorMonth, anchorDay }),
          daysOfWeek: Array.isArray(daysOfWeek) && daysOfWeek.length ? daysOfWeek : [0, 1, 2, 3, 4, 5, 6],
        }),
        skipHolidays: !!skipHolidays,
        // Picker Cadence: surfacing anchor + display unit (normalized/defaulted).
        ...CADENCE.normalize({ cadence, anchorDow, anchorDom, anchorMonth, anchorDay }),
        // Optional conditional gate (existing id, or the freshly-made one).
        conditionalId: madeCond ? madeCond.id : (conditionalId || null),
      };
      setState((s) => {
        // Tidy + de-duplicate the picker name against existing pickers (same
        // policy as items/reminders, but scoped globally since picker names are
        // container-style identifiers shown across every tab).
        const finalName = uniqueName(
          normalizePickerName(name) || name,
          s.pickers.map((p) => p.name),
        );
        return {
          ...s,
          items: [...s.items, ...newItems],
          pickers: [...s.pickers, { ...picker, name: finalName }],
          conditionals: madeCond ? [...(s.conditionals || []), madeCond] : (s.conditionals || []),
          // Honour the create-form toggle; included by default like the seed pickers.
          daily: { ...s.daily, pickerIds: includeInDaily
            ? [...s.daily.pickerIds, pid]
            : s.daily.pickerIds },
        };
      });
      return pid;
    },

    removeItem: (id) => setState((s) => {
      const items = s.items.filter((it) => it.id !== id);
      // Drop any of today's entries that pointed at this item so the ring +
      // group totals stay honest, then reconcile the streak as a removal would.
      const newEntries = (s.today.entries || []).filter((e) => e.itemId !== id);
      // Drop today's live log rows for the item; KEEP historical rows (their
      // denormalized name preserves past stats, like reminderLog does).
      const day = isoDay();
      const pickLog = (s.pickLog || []).filter((r) => !(r.itemId === id && r.date === day));
      const { streak, streakClaimed } = reconcileStreak(s, newEntries, s.tasks);
      // If this item was a picker's active ease-down item, clear the pointer.
      const pickers = s.pickers.map((p) => p.activeItemId === id ? { ...p, activeItemId: null } : p);
      return { ...s, items, pickers, streak, pickLog, today: { ...s.today, entries: newEntries, streakClaimed } };
    }),

    // Delete a picker AND the items it owns (items are tied to one picker).
    // Also unhooks it from the daily generator and today's list.
    removePicker: (pickerId) => setState((s) => {
      const day = isoDay();
      return { ...s,
        items: s.items.filter((it) => it.pickerId !== pickerId),
        pickers: s.pickers.filter((p) => p.id !== pickerId),
        daily: { ...s.daily, pickerIds: (s.daily.pickerIds || []).filter((id) => id !== pickerId) },
        today: { ...s.today, entries: (s.today.entries || []).filter((e) => e.pickerId !== pickerId) },
        // Keep historical rows (denormalized); drop only today's live ones.
        pickLog: (s.pickLog || []).filter((r) => !(r.pickerId === pickerId && r.date === day)),
      };
    }),

    refillPicker: (pickerId) => setState((s) => {
      const p = s.pickers.find((x) => x.id === pickerId);
      if (!p) return s;
      const threshold = p.threshold ?? 100;
      return {
        ...s,
        // Fill RAISES to the threshold; it must never pull a value down. Ease-up
        // items keep charging past the threshold while they wait, and that
        // overshoot is what orders them — highest value is picked first, and
        // re-roll cycles highest→lowest. Assigning the threshold flat-out erased
        // that ordering and reset every waiting item to a tie. (Ease-down values
        // only ever decay from the threshold, so max() is a no-op there.)
        items: s.items.map((it) =>
          it.pickerId === pickerId ? { ...it, value: Math.max(it.value ?? 0, threshold) } : it),
        // Full recharge clears any in-progress ease-down item.
        pickers: s.pickers.map((x) => x.id === pickerId ? { ...x, activeItemId: null } : x),
      };
    }),

    // ── Manual reminders (statically-scheduled tasks shown atop Today) ──
    addTask: (fields) => setState((s) => {
      const t = TASKS.defaultTask(fields);
      return { ...s, tasks: [{ ...t, name: uniqueName(t.name, s.tasks.map((x) => x.name)) }, ...s.tasks] };
    }),

    updateTask: (id, patch) => setState((s) => ({
      ...s, tasks: s.tasks.map((t) => t.id === id ? { ...t, ...patch } : t),
    })),

    // Commit-time reminder rename with de-duplication (blur/Enter/Save only).
    renameTask: (id, name) => setState((s) => {
      const siblings = s.tasks.filter((t) => t.id !== id).map((t) => t.name);
      const unique = uniqueName(name, siblings);
      return { ...s, tasks: s.tasks.map((t) => t.id === id ? { ...t, name: unique } : t) };
    }),

    // Full replace — used to revert a reminder to a snapshot on editor Cancel.
    replaceTask: (id, task) => setState((s) => ({
      ...s, tasks: s.tasks.map((t) => t.id === id ? { ...task } : t),
    })),

    removeTask: (id) => setState((s) => ({
      ...s, tasks: s.tasks.filter((t) => t.id !== id),
    })),

    // Hide a reminder until its next eligible day (computed by the caller from
    // the reminder's own rules). Does not mark done or log a completion, but
    // DOES append a skip row so Stats can tally per-reminder skips.
    skipTask: (id, untilIso) => setState((s) => {
      const task = s.tasks.find((t) => t.id === id);
      const skipRow = task ? [{
        rowId: 'rs_' + Math.random().toString(36).slice(2, 9),
        taskId: id,
        name: task.name,
        type: TASKS.isRecurring(task) ? 'recurring' : 'once',
        skippedAt: new Date().toISOString(),
      }] : [];
      return {
        ...s,
        tasks: s.tasks.map((t) => t.id === id ? { ...t, skipUntil: untilIso } : t),
        reminderSkipLog: [...(s.reminderSkipLog || []), ...skipRow],
      };
    }),

    // Flip one participation switch for a reminder type ('once' | 'recurring').
    setReminderOpt: (type, key, value) => setState((s) => {
      const opts = TASKS.normalizeOpts(s.reminderOpts);
      return { ...s, reminderOpts: { ...opts, [type]: { ...opts[type], [key]: value } } };
    }),

    // Full replace of the participation options — used to revert on Controls Cancel.
    setReminderOpts: (opts) => setState((s) => ({ ...s, reminderOpts: { ...opts } })),

    // "System preference" (Appearance): when on, the app auto-swaps between
    // the current theme and its light/dark counterpart to match the OS's
    // prefers-color-scheme, rather than always applying whichever was picked.
    setAppearanceAutoSystem: (on) => setState((s) => ({
      ...s, appearance: { ...(s.appearance || {}), autoSystem: on },
    })),

    // Picker animation style (Today tab's pick reveal) — 'reel' | 'spotlight' | 'dissolve'.
    setPickAnim: (style) => setState((s) => ({
      ...s, appearance: { ...(s.appearance || {}), pickAnim: style },
    })),

    // Completion-celebration style (Today tab's ring-fill moment) — 'ripple' | 'confetti' | 'sparkle'.
    setCompletionStyle: (style) => setState((s) => ({
      ...s, appearance: { ...(s.appearance || {}), completionStyle: style },
    })),

    // Tab bar placement (Appearance → Layout) — 'bottom' | 'side' | 'top'.
    setTabPlacement: (placement) => setState((s) => ({
      ...s, appearance: { ...(s.appearance || {}), tabPlacement: placement },
    })),

    // Appearance (Settings tab) — pick a built-in theme by key ('ink' | 'sage'
    // | 'sand' | 'night' | 'moss' | 'ember'), or 'customLight' / 'customDark'
    // once the matching custom colors have been set via setCustomTheme.
    setAppearanceTheme: (theme) => setState((s) => ({
      ...s, appearance: { ...(s.appearance || {}), theme },
    })),

    // Save the 3 user-picked colors (bg/text/accent) for the light or dark
    // custom slot, and immediately make it the active theme. Also auto-
    // generates/updates the OTHER mode's custom slot as an inverted
    // counterpart (same hue, flipped lightness) — so creating one custom
    // palette gives you both for free. That auto-fill stops the moment the
    // user edits the counterpart directly (its own `derived` flag flips to
    // false), so we never clobber a real manual edit.
    setCustomTheme: (mode, colors) => setState((s) => {
      const key = mode === 'dark' ? 'customDark' : 'customLight';
      const counterKey = mode === 'dark' ? 'customLight' : 'customDark';
      const counterMode = mode === 'dark' ? 'light' : 'dark';
      const saved = { ...colors, derived: false };
      const appearance = {
        ...(s.appearance || {}),
        [key]: saved,
        theme: key,
      };
      const counter = appearance[counterKey];
      if (!counter || counter.derived !== false) {
        appearance[counterKey] = {
          ...(counter || {}), // keep an existing name if any
          bg: invertColorForTheme(colors.bg),
          text: invertColorForTheme(colors.text),
          accent: invertColorForTheme(colors.accent),
          derived: true,
        };
      }
      return { ...s, appearance };
    }),

    // Rename a custom theme slot without touching its colors or activating it
    // (renaming while just browsing shouldn't force-switch the live theme).
    // Mirrors the color auto-derive: renaming one slot also renames its
    // counterpart, UNLESS the counterpart's name has since been edited
    // directly (tracked separately from the color `derived` flag, since a
    // user might customize one without touching the other).
    setCustomThemeName: (mode, name) => setState((s) => {
      const key = mode === 'dark' ? 'customDark' : 'customLight';
      const counterKey = mode === 'dark' ? 'customLight' : 'customDark';
      const seedDefaults = mode === 'dark'
        ? { bg: '#fcfbf9', text: '#242629', accent: '#3360a8' }   // counterpart is light
        : { bg: '#1e2230', text: '#f2f3f6', accent: '#7da4ff' };  // counterpart is dark
      const cur = (s.appearance || {})[key] || (mode === 'dark'
        ? { bg: '#1e2230', text: '#f2f3f6', accent: '#7da4ff' }
        : { bg: '#fcfbf9', text: '#242629', accent: '#3360a8' });
      const appearance = { ...(s.appearance || {}), [key]: { ...cur, name, nameDerived: false } };
      const counter = appearance[counterKey];
      if (!counter || counter.nameDerived !== false) {
        appearance[counterKey] = { ...(counter || seedDefaults), name, nameDerived: true };
      }
      return { ...s, appearance };
    }),

    // Check/uncheck today's occurrence. Completing stamps lastDone with today
    // AND appends a row to the completion log; un-checking clears lastDone and
    // voids today's log row for that reminder. Either way the streak is
    // reconciled — reminders count toward the daily streak (per their type's
    // switch), but the Stats log is kept regardless of the Stats toggle.
    toggleTaskDone: (id) => setState((s) => {
      const task = s.tasks.find((t) => t.id === id);
      if (!task) return s;
      const today = TASKS.isoToday();
      const wasDone = TASKS.isDoneToday(task);
      const tasks = s.tasks.map((t) =>
        t.id === id ? { ...t, lastDone: wasDone ? null : today } : t);

      let reminderLog = s.reminderLog || [];
      if (wasDone) {
        // Void today's completion row for this reminder.
        reminderLog = reminderLog.filter((r) =>
          !(r.taskId === id && TASKS.isoOf(new Date(r.completedAt)) === today));
      } else {
        reminderLog = [...reminderLog, {
          rowId: 'rl_' + Math.random().toString(36).slice(2, 9),
          taskId: id,
          name: task.name,
          type: TASKS.isRecurring(task) ? 'recurring' : 'once',
          completedAt: new Date().toISOString(),
        }];
      }

      const { streak, streakClaimed } = reconcileStreak(s, s.today.entries, tasks);
      return { ...s, streak, tasks, reminderLog, today: { ...s.today, streakClaimed } };
    }),

    // Any patch touching cadence / anchorDow / daysOfWeek is re-run through
    // enforceWeeklyDay, so switching to Weekly (or changing its day) selects that
    // day in the Days control automatically.
    updatePicker: (pickerId, patch) => setState((s) => ({
      ...s,
      pickers: s.pickers.map((p) => {
        if (p.id !== pickerId) return p;
        const np = { ...p, ...patch };
        np.daysOfWeek = CADENCE.enforceWeeklyDay(np);
        return np;
      }),
    })),

    // Full replace — used to revert a picker to a snapshot on Controls Cancel.
    replacePicker: (pickerId, picker) => setState((s) => ({
      ...s,
      pickers: s.pickers.map((p) => p.id === pickerId ? { ...picker } : p),
    })),

    // Commit-time picker rename (blur/Enter/Save only): tidy to Title Case and
    // de-duplicate against the OTHER pickers so two can't share a display name.
    renamePicker: (pickerId, name) => setState((s) => {
      const siblings = s.pickers.filter((p) => p.id !== pickerId).map((p) => p.name);
      const tidy = (normalizePickerName && normalizePickerName(name)) || name;
      const unique = uniqueName(tidy, siblings);
      return { ...s, pickers: s.pickers.map((p) => p.id === pickerId ? { ...p, name: unique } : p) };
    }),

    // Rename a group everywhere: rewrite every member picker's `group`, and
    // remap the groupOrder slot + pickerOrder key. If the new name matches an
    // existing group (case-insensitively, via the normalizer's collision reuse)
    // this becomes a MERGE — the two groups fold together. Caller (Edit Mode)
    // confirms the merge before invoking.
    renameGroup: (oldName, rawNew) => setState((s) => {
      const others = [...new Set(s.pickers.filter((p) => p.group && p.group !== oldName).map((p) => p.group))];
      const newName = (normalizeGroupName && normalizeGroupName(rawNew, others)) || String(rawNew || '').trim();
      if (!newName || newName === oldName) return s;
      const pickers = s.pickers.map((p) => p.group === oldName ? { ...p, group: newName } : p);
      let groupOrder = (s.groupOrder || []).map((g) => g === oldName ? newName : g);
      groupOrder = groupOrder.filter((g, i) => groupOrder.indexOf(g) === i); // dedupe on merge
      const pickerOrder = { ...s.pickerOrder };
      if (pickerOrder[oldName]) {
        const existing = pickerOrder[newName] || [];
        pickerOrder[newName] = existing.concat(pickerOrder[oldName].filter((id) => !existing.includes(id)));
        delete pickerOrder[oldName];
      }
      return { ...s, pickers, groupOrder, pickerOrder };
    }),

    setDailyPickers: (pickerIds) => setState((s) => ({
      ...s, daily: { ...s.daily, pickerIds },
    })),

    // Time of day the Daily generator auto-runs (HH:MM, 24h).
    setDailyRunTime: (runTime) => setState((s) => ({
      ...s, daily: { ...s.daily, runTime },
    })),

    // Whether the Daily generator runs on its own each day, or only when the
    // user triggers it: 'auto' | 'manual'.
    setDailyMode: (mode) => setState((s) => ({
      ...s, daily: { ...s.daily, mode },
    })),

    // ── Holiday list (global "days off" the skip-on-holidays gate reads) ──
    // Turn a computed holiday on/off (off = listed in `disabled`).
    toggleHoliday: (key) => setState((s) => {
      const cur = s.holidays || HOLIDAYS.defaultState();
      const disabled = cur.disabled.includes(key)
        ? cur.disabled.filter((k) => k !== key)
        : [...cur.disabled, key];
      return { ...s, holidays: { ...cur, disabled } };
    }),
    addCustomHoliday: ({ name, month, day }) => setState((s) => {
      const cur = s.holidays || HOLIDAYS.defaultState();
      const entry = { id: 'h_' + Math.random().toString(36).slice(2, 7), name, month, day };
      return { ...s, holidays: { ...cur, custom: [...(cur.custom || []), entry] } };
    }),
    removeCustomHoliday: (id) => setState((s) => {
      const cur = s.holidays || HOLIDAYS.defaultState();
      return { ...s, holidays: { ...cur, custom: (cur.custom || []).filter((c) => c.id !== id) } };
    }),

    // Stamp the generation time AND snapshot every item's + conditional's value
    // at that moment, so the Day Log can show "value at generation → after".
    // Today-only: overwritten on each Regenerate. Values are done-gated so the
    // live values only diverge from this snapshot once entries are completed.
    markGenerated: () => setState((s) => {
      const items = {}; (s.items || []).forEach((it) => { items[it.id] = it.value; });
      const conds = {}; (s.conditionals || []).forEach((c) => { conds[c.id] = { value: c.value, triggered: c.triggered }; });
      return { ...s, today: { ...s.today, generatedAt: new Date().toISOString(), genLog: { items, conds } } };
    }),

    // ── Today "Edit Mode" reordering ──────────────────────────────────────
    // Group display order (array of group labels). Unknown groups fall back to
    // first-occurrence order in the render layer.
    reorderGroups: (order) => setState((s) => ({ ...s, groupOrder: order.slice() })),
    // Per-group row order (array of picker ids for one group label).
    reorderPickersInGroup: (group, ids) => setState((s) => ({
      ...s, pickerOrder: { ...s.pickerOrder, [group]: ids.slice() },
    })),
    // Bulk restore used by Edit Mode "Cancel" (revert to the entry snapshot).
    setTodayOrder: (groupOrder, pickerOrder) => setState((s) => ({
      ...s, groupOrder: groupOrder.slice(),
      pickerOrder: JSON.parse(JSON.stringify(pickerOrder)),
    })),

    // Persisted collapse state for the Data tab's disclosures. Uniform polarity
    // everywhere: true = COLLAPSED, false = expanded. Sub-panels (Controls /
    // Items) default open, so absent = open; the main sections (Conditionals,
    // Reminders, picker cards) default collapsed and pass defaultCollapsed=true
    // so the first click expands rather than re-collapsing.
    toggleControlsCollapsed: (id, defaultCollapsed = false) => setState((s) => {
      const cur = (s.ui && s.ui.controlsCollapsed) || {};
      const now = cur[id] === undefined ? defaultCollapsed : cur[id];
      const next = { ...cur, [id]: !now };
      return { ...s, ui: { ...(s.ui || {}), controlsCollapsed: next } };
    }),
  }), []);

  return [state, actions];
}

export { useStore };
