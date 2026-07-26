// Picker algorithms. Each runs against a snapshot of items and returns:
//   { picked: item|null, updates: [{id, value}], cycleCandidates: [item, item, ...] }
//
// `updates` is the list of items whose `value` changed as a side-effect (drift,
// reset, decay). `cycleCandidates` is the pool the cycle animation flashes
// through before settling on `picked` — it's just the eligible set.

// Tidy a user-typed container-style name: collapse any separator run (dashes,
// underscores, extra spaces) to a single space, trim, then Title Case every
// word. Any run of non-alphanumeric characters becomes a single space:
// "wind_down" / "WIND-DOWN!" / "wind  down" → "Wind Down". Shared by the
// group and picker normalizers (both are short, container-type names).
function titleCaseName(raw) {
  const cleaned = String(raw || '')
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .replace(/\s+/g, ' ');
  if (!cleaned) return '';
  return cleaned.split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

// Group name: title-case, and if it case-insensitively matches an existing
// group, return that existing spelling so we never create a near-duplicate.
function normalizeGroupName(raw, existing) {
  const titled = titleCaseName(raw);
  if (!titled) return '';
  if (Array.isArray(existing)) {
    const hit = existing.find((g) => g.toLowerCase() === titled.toLowerCase());
    if (hit) return hit;
  }
  return titled;
}
// Picker name: same title-case tidy, but NO collision reuse — pickers are
// distinct entities (dedup to a "(2)" suffix happens in the store instead).
function normalizePickerName(raw) { return titleCaseName(raw); }
// Conditional name: same title-case tidy as pickers. Collision handling
// (reuse an existing conditional on an exact case-insensitive match) is done
// at the call site, mirroring group-name reuse.
function normalizeConditionalName(raw) { return titleCaseName(raw); }
export { normalizeGroupName };
export { normalizePickerName };
export { normalizeConditionalName };

function rng(min, max) { return min + Math.random() * (max - min); }

function weightedPick(items, weightFn) {
  const ws = items.map(weightFn);
  const total = ws.reduce((a, b) => a + b, 0);
  if (total <= 0) return items[Math.floor(Math.random() * items.length)] || null;
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= ws[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function eligible(items) {
  return items.filter((it) => !it.vacation);
}

function pick(picker, items, opts) {
  let pool = eligible(items.filter((it) => it.pickerId === picker.id));
  // `excludeIds` (a Set) drops items that are already live on Today, so a
  // manual "Pick one" spin can't land on a duplicate. A direct `forceItemId`
  // send bypasses this (its button is disabled in the UI when on Today).
  const excludeIds = opts && opts.excludeIds;
  if (excludeIds && excludeIds.size && !(opts && opts.forceItemId)) {
    pool = pool.filter((it) => !excludeIds.has(it.id));
  }
  if (!pool.length) return { picked: null, updates: [], cycleCandidates: [] };

  switch (picker.mode) {
    case 'random': {
      const forceId = opts && opts.forceItemId;
      const picked = (forceId && pool.find((it) => it.id === forceId)) || pool[Math.floor(Math.random() * pool.length)];
      return { picked, updates: [], cycleCandidates: pool };
    }
    case 'weighted': {
      const forceId = opts && opts.forceItemId;
      const picked = (forceId && pool.find((it) => it.id === forceId)) || weightedPick(pool, (it) => Math.max(0.0001, it.weight));
      return { picked, updates: [], cycleCandidates: pool };
    }
    case 'dynamic': {
      // Effective pick weight = base weight + drift value, chosen weighted-random.
      // Drift `value` = cycles since last picked: every eligible item that
      // ISN'T picked gains +1 (flat, not its weight) so low-weight items reliably
      // catch up over time instead of starving; the picked item resets to 0.
      const forceId = opts && opts.forceItemId;
      const picked = (forceId && pool.find((it) => it.id === forceId)) || weightedPick(pool, (it) => Math.max(0.0001, it.weight + it.value));
      const updates = [];
      for (const it of pool) {
        if (it.id === picked.id) updates.push({ id: it.id, value: 0 });
        else updates.push({ id: it.id, value: it.value + 1 });
      }
      return { picked, updates, cycleCandidates: pool };
    }
    case 'ease-up': {
      // "Most overdue wins." Instead of a fresh random drift each run, each item
      // rolls a TARGET number of cycles uniformly in its [soonest, latest] range
      // when it resets to 0, then charges by a FIXED step (100/N) so it lands in
      // exactly N cycles — giving every duration in the range equal odds (the
      // reciprocal drift-band collapse is gone). `chargeStep` persists that plan
      // across cycles; legacy items with none lazily roll one. Among eligible
      // items we pick the MOST overdue (highest value); ties break on oldest
      // lastPicked. Weight is deliberately NOT used (ease-up is a cadence system).
      const threshold = picker.threshold ?? 100;
      const rollStep = (it) => {
        const so = Math.max(1, Math.round(threshold / (it.easeMax ?? picker.easeMax)));
        const la = Math.max(so, Math.round(threshold / (it.easeMin ?? picker.easeMin)));
        const N = so + Math.floor(Math.random() * (la - so + 1));
        return threshold / N;
      };
      const stepFor = (it) => (it.chargeStep && it.chargeStep > 0 ? it.chargeStep : rollStep(it));
      // Charge by the fixed step, persisting it so the plan holds across cycles.
      const chargeUpdate = (it) => { const s = stepFor(it); return { id: it.id, value: it.value + s, chargeStep: s }; };
      // Half-unit tolerance so a 100/3-type step never spills into an extra cycle.
      const elig = pool.filter((it) => easeEligible(it, threshold));
      // A manual send (`forceItemId`) may target ANY item — search the whole
      // pool and bypass the eligibility gate, since the user chose it directly.
      const forceId = opts && opts.forceItemId;
      const forced = forceId && pool.find((it) => it.id === forceId);
      if (!elig.length && !forced) {
        const updates = pool.map(chargeUpdate);
        return { picked: null, updates, cycleCandidates: pool };
      }
      const ts = (it) => (it.lastPicked ? Date.parse(it.lastPicked) : 0);
      // Today's Re-roll cycles ease-up manually: it passes `forceItemId` to
      // land on a specific eligible item (highest→lowest value, wrapping). The
      // completion consequence is identical to a natural pick — the forced item
      // resets, others charge — so done-handling never diverges.
      const picked = forced || elig.reduce((best, it) => {
        if (!best) return it;
        if (it.value !== best.value) return it.value > best.value ? it : best;
        return ts(it) < ts(best) ? it : best; // tie → waited longest
      }, null);
      // Picked item resets to 0 AND rolls a fresh plan for its next charge cycle.
      const updates = pool.map((it) =>
        it.id === picked.id ? { id: it.id, value: 0, chargeStep: rollStep(it) } : chargeUpdate(it));

      // Inflation guard: values overshoot the threshold while waiting, and with
      // many items that overshoot can drift into the hundreds over time. Compress
      // it by pulling every still-waiting item (value > threshold) down by the
      // smallest overshoot in that group — so the least-overdue waiter lands back
      // at the threshold and the rest keep their relative order. Sub-threshold
      // charging items are untouched, so each item's time-to-eligible (its
      // cadence) is preserved exactly; only the unbounded slack is removed.
      const overshoots = updates.filter((u) => u.value > threshold).map((u) => u.value - threshold);
      if (overshoots.length) {
        const minOver = Math.min(...overshoots);
        if (minOver > 0) {
          for (const u of updates) if (u.value > threshold) u.value -= minOver;
        }
      }
      return { picked, updates, cycleCandidates: elig };
    }
    case 'ease-down': {
      // Perpetual fair-rotation model. Two things drive it, tracked separately:
      //   • value  — the active item's remaining CHARGE. Decays each run while
      //              active; at <=0 the item auto-recharges to full and is
      //              released back into the pool (never depletes permanently).
      //   • weight — a system-managed FAIRNESS counter (NOT a user preference,
      //              not surfaced in the UI). It changes ONLY when a NEW active
      //              item is chosen — never on the intermediate decay runs. At
      //              that moment the chosen item resets to 0 and every OTHER
      //              item gains +1. A weight of 0 is excluded from selection,
      //              so exactly one item (the most-recently-picked) is barred
      //              from being re-picked on the very next draw; it re-enters
      //              at weight 1 on the following pick. Long-ignored items climb
      //              and grow steadily more likely — fixing truly-random's
      //              "an item can be ignored forever / picked twice in a row".
      const threshold = picker.threshold ?? 100;
      // Option-1 steady decay: a newly-chosen item rolls a target N cycles
      // uniformly in its [shortest, longest] range and decays by a FIXED step
      // (100/N), emptying in exactly N cycles. `chargeStep` persists that plan
      // across the streak; legacy items lazily roll one.
      const rollStep = (it) => {
        const so = Math.max(1, Math.round(threshold / (it.easeMax ?? picker.easeMax)));
        const la = Math.max(so, Math.round(threshold / (it.easeMin ?? picker.easeMin)));
        const N = so + Math.floor(Math.random() * (la - so + 1));
        return threshold / N;
      };
      const forceId = opts && opts.forceItemId;
      // A manual send of a specific item starts a NEW streak on that item
      // (unless it's already the active one) — same as re-roll's forceNew.
      const forceNew = !!(opts && opts.forceNew) || !!(forceId && forceId !== picker.activeItemId);
      const updates = [];

      // 1) CONTINUE the current active item's depletion. No weight changes on
      //    these runs. On hitting 0 the item auto-recharges and is released
      //    (weight stays 0 → excluded from the very next new-pick draw).
      let active = null;
      if (picker.activeItemId && !forceNew) {
        active = pool.find((it) => it.id === picker.activeItemId && it.value > 0);
      }
      if (active) {
        const decay = (active.chargeStep && active.chargeStep > 0) ? active.chargeStep : rollStep(active);
        const newValue = Math.max(0, active.value - decay);
        const depletedEnd = newValue <= 0.5;
        updates.push({ id: active.id, value: depletedEnd ? threshold : newValue, chargeStep: decay });
        return {
          picked: active,
          updates,
          cycleCandidates: [active],
          depletedEnd,
          pickerPatch: { activeItemId: depletedEnd ? null : active.id },
        };
      }

      // 2) START A NEW STREAK. Re-roll (forceNew) abandons the current active
      //    item, recharging it to full; like a naturally-released item its
      //    weight is 0, so it's excluded from THIS draw and re-enters next time.
      const abandoned = forceNew ? picker.activeItemId : null;
      if (abandoned) {
        const old = items.find((it) => it.id === abandoned);
        if (old) updates.push({ id: old.id, value: threshold });
      }
      // Draw among weight > 0 items (excludes the single most-recently-picked
      // item, at 0). Degenerate fallbacks: a lone item, or an all-zero pool.
      let candidates = pool.filter((it) => (it.weight ?? 1) > 0 && it.id !== abandoned);
      if (!candidates.length) candidates = pool.filter((it) => it.id !== abandoned);
      if (!candidates.length) candidates = pool;
      // Manual send forces the chosen item (bypassing weighted draw); it still
      // takes the identical fairness + decay consequences below.
      const chosen = (forceId && pool.find((it) => it.id === forceId)) || weightedPick(candidates, (it) => Math.max(0, it.weight ?? 1));

      // Fairness bookkeeping (happens ONLY here): every other item +1 (incl.
      // the just-released 0-weight one → 1); the chosen item resets to 0.
      for (const it of pool) {
        if (it.id === chosen.id) continue;
        updates.push({ id: it.id, weight: (it.weight ?? 1) + 1 });
      }
      // Decay the freshly-chosen item from full charge, on a fresh steady plan.
      const base = chosen.value > 0 ? chosen.value : threshold;
      const decay = rollStep(chosen);
      const newValue = Math.max(0, base - decay);
      const depletedEnd = newValue <= 0.5;
      updates.push({ id: chosen.id, value: depletedEnd ? threshold : newValue, weight: 0, chargeStep: decay });
      return {
        picked: chosen,
        updates,
        cycleCandidates: candidates,
        depletedEnd,
        pickerPatch: { activeItemId: depletedEnd ? null : chosen.id },
      };
    }
    default:
      return { picked: null, updates: [], cycleCandidates: [] };
  }
}

// For modes that maintain `value`, this is the visualization helper used by
// the picker view's "current state" rows. It returns a 0–1 readiness number.
function readiness(item, mode, threshold = 100) {
  if (mode === 'ease-up')   return Math.min(1, item.value / threshold);
  if (mode === 'ease-down') return Math.max(0, item.value / threshold);
  if (mode === 'dynamic')   return Math.min(1, item.value / 50); // soft cap for vis
  return null;
}

// Ease-up eligibility, in ONE place. The half-unit tolerance matters: a
// threshold/N charge step (100/3, say) can land a hair under the threshold on
// the very cycle it was planned to become eligible. The engine has always used
// it; Today's re-roll did not, so an item at 99.7 could be picked by the
// generator yet be invisible to re-roll cycling (and to the count that enables
// the button). Callers must use this rather than comparing values themselves.
const EASE_TOL = 0.5;
const easeEligible = (item, threshold) => (item.value ?? 0) >= ((threshold ?? 100) - EASE_TOL);

// Whether an item could be picked RIGHT NOW under its picker's mode. Vacation
// is deliberately not considered here — callers that care combine it, and the
// Pickers pool shows vacation as its own row state.
const modeEligible = (item, picker) => {
  if (!picker) return true;
  if (picker.mode === 'ease-up') return easeEligible(item, picker.threshold);
  if (picker.mode === 'ease-down') return (item.value ?? 0) > 0;
  return true;
};

export const PICKERS = { pick, readiness, easeEligible, modeEligible, EASE_TOL };
