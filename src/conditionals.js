// Conditionals — per-day boolean gates that suppress pickers.
//
// A conditional is a single-slot mechanism that resolves to `active` (true) or
// not each day. When active, every picker that depends on it SKIPS for the day
// (suppress-only: there is no "run only when true" direction). The picker that
// would otherwise run instead surfaces a single "day-off" card (custom text),
// whose completion drives the conditional's reset/discharge.
//
// Data model:
//   conditional: {
//     id, name, mode, cardText,
//     value,        // drift/charge state for value modes (ease-up/-down/dynamic)
//     weight,       // odds knob for weighted/dynamic (probability modes)
//     active,       // current resolved boolean (persisted across days)
//     easeMin, easeMax,  // per-day drift band for value modes
//     threshold,    // charge ceiling (default 100)
//     chargedToday, // guard so value advances at most once per day
//   }
//   picker.conditionalId  → id of the conditional that gates it (or null)
//
// Two timing families (mirrors pickers):
//   • PROBABILITY (random, weighted): `active` is ROLLED fresh at generate time,
//     effect same-day. No value, no charging. random = 50/50; weighted = odds
//     from `weight` (weight:1 → 50%, higher → likelier). The day-off card is
//     purely informational — completing it changes no conditional state.
//   • VALUE (ease-up, ease-down, dynamic): completion-driven. `value` advances
//     only on the first completion of an item from a dependent picker that day.
//     - ease-up:  value climbs to threshold → active=true (effect NEXT generate);
//                 card done → reset (value 0, active false).
//     - ease-down: starts active=true (value=threshold); card shows daily; each
//                 card-done discharges value by the ease amount; ≤0 → active=false
//                 (ONE-SHOT). After empty, dependents run; first dependent
//                 completion refills (value=threshold, active=true) → discharge
//                 cycle repeats.
//     - dynamic:  odds coin-flip DECIDED AT GENERATE (like weighted), but the odds
//                 climb: value += 1 on each day's first dependent completion (a
//                 "miss" makes tomorrow likelier); fires (active=true) via the
//                 roll; card done → reset (value 0, active false).

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const rng = (min, max) => {
  const a = Math.max(1, min | 0), b = Math.max(a, max | 0);
  return a + Math.floor(Math.random() * (b - a + 1));
};
const isProbability = (mode) => mode === 'random' || mode === 'weighted';
const isValue = (mode) => mode === 'ease-up' || mode === 'ease-down' || mode === 'dynamic';

// Odds that a probability/dynamic conditional resolves TRUE this run, as a
// direct percentage. random = fixed 50%. weighted = oddsPct (10–90 by 10).
// dynamic = oddsPct + boost `value` (+10 per miss), clamped to 100%.
function trueOdds(cond) {
  if (cond.mode === 'random') return 0.5;
  const base = cond.oddsPct ?? 50;
  const pct = cond.mode === 'dynamic' ? base + (cond.value || 0) : base;
  return clamp(pct, 0, 100) / 100;
}

// Phase A of generate: resolve the day's `active` for every conditional.
// Returns a patch map { [id]: { active, value? } } to apply before gating.
// Probability modes roll now; dynamic rolls now (odds include value); ease-up
// and ease-down carry their persisted `active` (set by completion, effect is
// deferred to this next generate). Also clears the per-day charge guard.
// Phase A of generate: resolve the day's `triggered` for every conditional.
// Returns a patch map { [id]: { triggered, value? } } to apply before gating.
// Probability modes roll now; dynamic rolls now (odds include value); ease-up
// and ease-down carry their persisted `triggered` (set by completion, effect
// deferred to this next generate). Also clears the per-day charge guard.
// `active` (enabled / not-on-vacation) is separate and never changes here.
function resolveForDay(conditionals) {
  const patch = {};
  for (const c of conditionals || []) {
    // Vacationed (active:false) → frozen: no roll, no state change at all.
    if (c.active === false) { patch[c.id] = { chargedToday: false }; continue; }
    let triggered = c.triggered;
    if (c.mode === 'random' || c.mode === 'weighted' || c.mode === 'dynamic') {
      triggered = Math.random() < trueOdds(c);
    }
    // ease-up / ease-down keep their persisted triggered state.
    patch[c.id] = { triggered, chargedToday: false };
  }
  return patch;
}

// A dependent picker is suppressed today iff its conditional is ENABLED
// (`active` — off means "on vacation", so it never suppresses) AND currently
// `triggered`.
function suppresses(cond) { return !!(cond && cond.active !== false && cond.triggered); }

// First-dependent-completion charge step (value modes only). Advances value
// once per day. Returns a patch (may set `triggered`) or null if nothing
// changes. Handles ease-down's one-shot refill after it has emptied.
function advanceOnCompletion(cond) {
  if (!cond || cond.active === false || !isValue(cond.mode)) return null;
  if (cond.chargedToday) return null;
  const thr = cond.threshold ?? 100;
  if (cond.mode === 'ease-up') {
    const v = clamp((cond.value || 0) + rng(cond.easeMin ?? 7, cond.easeMax ?? 14), 0, thr);
    return { value: v, triggered: v >= thr, chargedToday: true };
  }
  if (cond.mode === 'dynamic') {
    // Miss accrual: +10 percentage points so tomorrow's roll is likelier.
    return { value: (cond.value || 0) + 10, chargedToday: true };
  }
  if (cond.mode === 'ease-down') {
    // One-shot refill: only re-arms when currently emptied (not triggered).
    if (!cond.triggered) return { value: thr, triggered: true, chargedToday: true };
    return { chargedToday: true };
  }
  return null;
}

// Day-off card completion. Drives reset (ease-up/dynamic) or discharge
// (ease-down). Probability modes: informational, no state change → null.
function cardComplete(cond) {
  if (!cond) return null;
  const thr = cond.threshold ?? 100;
  if (cond.mode === 'ease-up' || cond.mode === 'dynamic') {
    return { value: 0, triggered: false };
  }
  if (cond.mode === 'ease-down') {
    const decay = rng(cond.easeMin ?? 7, cond.easeMax ?? 14);
    const v = clamp((cond.value ?? thr) - decay, 0, thr);
    return { value: v, triggered: v > 0 }; // ≤0 → not triggered (one-shot ends)
  }
  return null; // random / weighted
}

export const CONDITIONALS = {
  isProbability, isValue, trueOdds, resolveForDay,
  suppresses, advanceOnCompletion, cardComplete, rng, clamp,
};
