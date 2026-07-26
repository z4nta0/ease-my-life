import { HOLIDAYS } from './holidays.js';
import { TASKS } from './tasks.js';

// Seed data + canonical types for Ease My Life.
//
// Data model:
//   item:     { id, name, pickerId, weight, value, vacation, picks, lastPicked, easeMin?, easeMax? }
//   picker:   { id, group, name, mode, easeMin, easeMax, threshold }
//             A picker owns its items: pool = items.filter(i => i.pickerId === picker.id).
//             `group` is a label that clusters pickers on Today; `name` is UI display only.
//             modes: 'random' | 'weighted' | 'dynamic' | 'ease-up' | 'ease-down'
//   today:    { date, entries: [{ pickerId, itemId, done, skipped }] }
//
// `value` is the per-item drift state used by dynamic / ease-up / ease-down modes.
//   - dynamic: value adds to base weight (effective = weight + value); picked → value=0
//   - ease-up: value grows from 0 by random(easeMin,easeMax) each tick missed;
//              eligible at value >= threshold; picked → value=0
//   - ease-down: value is the active item's charge; starts at threshold (100),
//                and on each run the active item's value -= random(easeMin,easeMax).
//                At <=0 it auto-recharges to full and releases; a new item is then
//                chosen by a system-managed `weight` (fairness counter): the picked
//                item resets to weight 0 (barred from the next pick), every other
//                item +1, so long-ignored items rise and picks stay fair.

const uid = (() => { let n = 0; return (p) => `${p}_${++n}`; })();

// Items are tied directly to their picker via pickerId (2nd tuple field).
const ITEMS = [
  // Daily chores
  ['Water the plants',         'pkr_chore_d', 1, 64],
  ['Wipe kitchen counters',    'pkr_chore_d', 2, 12],
  ['Take out compost',         'pkr_chore_d', 1, 88],
  ['Tidy entry table',         'pkr_chore_d', 1, 47],
  ['Sort the mail',            'pkr_chore_d', 1, 22],
  ['Wash a load of darks',     'pkr_chore_d', 1, 71],

  // Weekly chores
  ['Clean the bathroom',       'pkr_chore_w', 2, 30],
  ['Vacuum living room',       'pkr_chore_w', 2, 0,  true],  // vacation
  ['Mop the kitchen',          'pkr_chore_w', 1, 52],
  ['Change the bed sheets',    'pkr_chore_w', 1, 80],
  ['Fridge wipe-down',         'pkr_chore_w', 1, 18],

  // Monthly chores
  ['Dust the bookshelves',     'pkr_chore_m', 1, 40],
  ['Clean the oven',           'pkr_chore_m', 1, 12],
  ['Wash the windows',         'pkr_chore_m', 1, 35],
  ['Descale the kettle',       'pkr_chore_m', 1, 80],

  // Breakfast
  ['Oatmeal with berries',     'pkr_brk', 2, 0],
  ['Yoghurt and granola',      'pkr_brk', 2, 0],
  ['Eggs and toast',           'pkr_brk', 2, 0],
  ['Smoothie',                 'pkr_brk', 1, 0],
  ['Avocado on rye',           'pkr_brk', 1, 0],

  // Lunch
  ['Big green salad',          'pkr_lun', 2, 0],
  ['Soup and bread',           'pkr_lun', 1, 0],
  ['Leftovers, made nice',     'pkr_lun', 2, 0],
  ['Grain bowl',               'pkr_lun', 1, 0],
  ['Sandwich, properly',       'pkr_lun', 1, 0],

  // Self Care
  ['Ten-minute stretch',       'pkr_self',   2, 92],
  ['Phone call with a friend', 'pkr_self',   1, 64],
  ['Walk without headphones',  'pkr_self',   2, 100],
  ['Journal three lines',      'pkr_self',   1, 38],
  ['Skin care, properly',      'pkr_self',   1, 14],
  ['Read one paper chapter',   'pkr_self',   2, 76],
  ['Sit and do nothing',       'pkr_self',   1, 100],
  // Retired item — kept in ITEMS so it accrues ~1yr of history, then removed
  // from the live item list in buildSeed(). Demonstrates a "deleted" ghost row
  // in Stats: its picks still count, labelled as deleted.
  ['Five-minute meditation',   'pkr_self',   2, 60, false, true],

  // Work
  ['Inbox triage, 20 min',     'pkr_work',   3, 18],
  ['Write one short reply',    'pkr_work',   2, 5],
  ['Update the doc',           'pkr_work',   1, 42],
  ['Review one PR',            'pkr_work',   2, 0],
  ['Plan tomorrow',            'pkr_work',   3, 88],
  ['Note one open question',   'pkr_work',   1, 60],

  // Dinner
  ['Lentil dal + rice',        'pkr_din', 2, 0],
  ['Sheet-pan vegetables',     'pkr_din', 2, 0],
  ['Cacio e pepe',             'pkr_din', 1, 0],
  ['Tomato soup + grilled cheese', 'pkr_din', 1, 0],
  ['Stir-fry, anything green', 'pkr_din', 2, 0],
  ['Order in (be honest)',     'pkr_din', 1, 0],

  // Entertainment
  ['Watch a documentary',      'pkr_play',   1, 100],
  ['Long bath, no phone',      'pkr_play',   1, 64],
  ['Cook something new',       'pkr_play',   2, 88],
  ['Board game with company',  'pkr_play',   1, 100],
  ['Two episodes, then stop',  'pkr_play',   3, 32],
  ['Walk somewhere unfamiliar', 'pkr_play',  1, 100],
];

function buildItems() {
  return ITEMS.map(([name, pickerId, weight, value, vacation, deleted]) => ({
    id: uid('it'),
    name, pickerId,
    weight, value,
    vacation: !!vacation,
    __deleted: !!deleted,
    picks: Math.floor(Math.random() * 8),
    lastPicked: null,
  }));
}

function buildPickers() {
  // A picker's pool is derived from items.pickerId — no itemIds list to maintain.
  // daysOfWeek / skipHolidays gate WHEN a picker runs in the Daily generator
  // (0=Sun … 6=Sat). Defaults below are full-week / keep-holidays; a few are
  // pre-tuned to showcase the schedule feature (chores skip holidays, the work
  // picker is weekdays-only).
  const ALL = [0, 1, 2, 3, 4, 5, 6];
  const WEEKDAYS = [1, 2, 3, 4, 5];
  const sched = {
    pkr_chore_d: { daysOfWeek: ALL,      skipHolidays: true  },
    pkr_chore_w: { daysOfWeek: WEEKDAYS, skipHolidays: true  },
    pkr_chore_m: { daysOfWeek: ALL,      skipHolidays: true  },
    pkr_work:    { daysOfWeek: WEEKDAYS, skipHolidays: true  },
  };
  return [
    // Chores group
    { id: 'pkr_chore_d', group: 'Chores',    name: 'Daily Chore',    mode: 'dynamic',   easeMin: 8,  easeMax: 18, threshold: 100 },
    { id: 'pkr_chore_w', group: 'Chores',    name: 'Weekly Chore',   mode: 'ease-up',   easeMin: 12, easeMax: 22, threshold: 100 },
    { id: 'pkr_chore_m', group: 'Chores',    name: 'Monthly Task',   mode: 'dynamic',   easeMin: 6,  easeMax: 14, threshold: 100 },

    // Food group
    { id: 'pkr_brk',     group: 'Food',      name: 'Breakfast',      mode: 'random',    easeMin: 10, easeMax: 20, threshold: 100 },
    { id: 'pkr_lun',     group: 'Food',      name: 'Lunch',          mode: 'random',    easeMin: 10, easeMax: 20, threshold: 100 },
    { id: 'pkr_din',     group: 'Food',      name: 'Dinner',         mode: 'random',    easeMin: 10, easeMax: 20, threshold: 100 },

    // Standalone groups
    { id: 'pkr_self',    group: 'Self Care', name: 'Care Moment',    mode: 'ease-up',   easeMin: 12, easeMax: 24, threshold: 100 },
    { id: 'pkr_work',    group: 'Work',      name: 'Quick Win',      mode: 'weighted',  easeMin: 5,  easeMax: 15, threshold: 100 },
    { id: 'pkr_play',    group: 'Wind Down', name: 'Evening Pick',   mode: 'ease-down', easeMin: 18, easeMax: 30, threshold: 100 },
  ].map((p) => ({
    daysOfWeek: (sched[p.id] || {}).daysOfWeek || [0, 1, 2, 3, 4, 5, 6],
    skipHolidays: !!(sched[p.id] || {}).skipHolidays,
    // Ease-down: id of the item currently being worked down (null = none).
    activeItemId: null,
    // Optional conditional gate (suppresses this picker when active).
    conditionalId: p.id === 'pkr_chore_w' ? 'cnd_chorefree' : null,
    ...p,
  }));
}

// Local calendar day (matches store.isoDay) so seeded dates line up with rows
// the running app writes.
function seedIsoDay(d) {
  const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 10);
}

// Weighted random pick from a pool of items (respects item.weight).
function weightedPick(pool) {
  const total = pool.reduce((a, it) => a + (it.weight || 1), 0);
  let r = Math.random() * total;
  for (const it of pool) { r -= (it.weight || 1); if (r <= 0) return it; }
  return pool[pool.length - 1];
}

// Seeded vacation event log — a few on/off transitions so Stats can exclude
// days an item wasn't eligible. Three scenarios worth demonstrating:
//   • currently on vacation (open interval) — Vacuum living room
//   • past closed vacation, picked since (no label) — Mop the kitchen
//   • past vacation, NOT picked since returning ("Was on vacation" label) —
//     Fridge wipe-down
function buildVacationLog(items) {
  const byName = (n) => items.find((it) => it.name === n);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const at = (back) => { const d = new Date(today); d.setDate(today.getDate() - back); return seedIsoDay(d); };
  const rows = [];
  let seq = 0;
  const mk = (item, back, on) => { if (item) rows.push({ rowId: 'vac_' + (seq++).toString(36), itemId: item.id, date: at(back), on }); };
  mk(byName('Vacuum living room'), 24, true);            // still on vacation
  mk(byName('Mop the kitchen'), 180, true);
  mk(byName('Mop the kitchen'), 150, false);             // returned long ago, picked since
  mk(byName('Fridge wipe-down'), 20, true);
  mk(byName('Fridge wipe-down'), 5, false);              // returned recently, not picked since
  return rows;
}

// Build an onVac(itemId, iso) predicate by replaying vacation events.
function makeOnVac(vacRows) {
  const byItem = new Map();
  for (const r of vacRows) {
    if (!byItem.has(r.itemId)) byItem.set(r.itemId, []);
    byItem.get(r.itemId).push(r);
  }
  for (const arr of byItem.values()) arr.sort((a, b) => (a.date < b.date ? -1 : 1));
  return (itemId, iso) => {
    const arr = byItem.get(itemId);
    if (!arr) return false;
    let on = false;
    for (const e of arr) { if (e.date <= iso) on = e.on; else break; }
    return on;
  };
}

// Build ~1 year of per-pick history (the Stats tab reads this, not an
// aggregate). For each past day, each scheduled picker contributes one pick
// (its weighted choice), marked done with high-but-imperfect probability.
// A sprinkling of fully "off" days breaks up streaks so they read honestly;
// the most recent 10 days are forced active so the headline streak (~11) holds.
function buildPickLog(items, pickers, onVac, days = 365) {
  const rows = [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const byPicker = {};
  for (const it of items) (byPicker[it.pickerId] = byPicker[it.pickerId] || []).push(it);
  let seq = 0;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const mk = (d, pk, it, done, source, outcome, depletedEnd) => {
    const ts = new Date(d);
    ts.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60), 0, 0);
    rows.push({
      id: 'pls_' + (seq++).toString(36),
      eid: null,
      date: seedIsoDay(d),
      pickerId: pk.id, itemId: it.id,
      itemName: it.name, pickerName: pk.name, group: pk.group,
      done: outcome === 'rejected' ? false : done,
      completedAt: (outcome !== 'rejected' && done) ? ts.toISOString() : null,
      source,
      ...(outcome ? { outcome } : {}),
      ...(depletedEnd ? { depletedEnd: true } : {}),
    });
  };
  const isOffDay = (i) => i === 11 ? true : (i <= 10 ? false : Math.random() < 0.13);
  // i = days-1 … 1 (today, i=0, is added from today.entries separately).
  for (let i = days - 1; i >= 1; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const dow = d.getDay();
    if (isOffDay(i)) continue;
    for (const pk of pickers) {
      if (pk.mode === 'ease-down') continue; // handled statefully below
      if (Array.isArray(pk.daysOfWeek) && !pk.daysOfWeek.includes(dow)) continue;
      const dIso = seedIsoDay(d);
      // Eligible pool = items not on vacation THAT day (per the vacation log),
      // so historical picks stop while an item is away and resume on return.
      const pool = (byPicker[pk.id] || []).filter((it) => !onVac(it.id, dIso));
      if (!pool.length) continue;
      const it = weightedPick(pool);
      // ~20% of days the user re-rolled 1–2 times before settling — log each
      // discarded item as a rejected row (Option B), then the final pick.
      if (pool.length > 1 && Math.random() < 0.2) {
        const tossCount = Math.random() < 0.7 ? 1 : 2;
        for (let t = 0; t < tossCount; t++) {
          let tossed;
          do { tossed = pool[Math.floor(Math.random() * pool.length)]; }
          while (tossed.id === it.id && pool.length > 1);
          if (tossed.id !== it.id) mk(d, pk, tossed, false, 'auto', 'rejected');
        }
      }
      const done = Math.random() < 0.82;
      // Source mix: mostly the daily generator, some hand-pushed, a few re-rolled.
      const sr = Math.random();
      const source = sr < 0.10 ? 'manual' : sr < 0.16 ? 'reroll' : 'auto';
      // ~9% of the time the generated pick was skipped (marked, not completed) —
      // a deliberate "not today" that Stats tallies per item.
      if (Math.random() < 0.09) { mk(d, pk, it, false, source, 'skipped'); continue; }
      mk(d, pk, it, done, source);
    }
  }

  // Ease-down pickers: an item, once chosen, stays picked every run and decays
  // until its charge hits 0 (a completed depletion streak → depletedEnd), then
  // a new item is chosen. A few streaks are abandoned early (no depletedEnd) to
  // prove Stats' "Spent" counts only completed cycles. Returns per-picker final
  // active state so the live app resumes the in-progress item.
  const easeState = {};
  for (const pk of pickers) {
    if (pk.mode !== 'ease-down') continue;
    const threshold = pk.threshold ?? 100;
    let active = null, charge = 0;
    for (let i = days - 1; i >= 1; i--) {
      const d = new Date(today); d.setDate(today.getDate() - i);
      const dow = d.getDay();
      if (Array.isArray(pk.daysOfWeek) && !pk.daysOfWeek.includes(dow)) continue;
      if (isOffDay(i)) continue;
      const dIso = seedIsoDay(d);
      const pool = (byPicker[pk.id] || []).filter((it) => !onVac(it.id, dIso));
      if (!pool.length) { active = null; continue; }
      if (active && onVac(active.id, dIso)) active = null;          // vacation abandons
      if (active && Math.random() < 0.05) active = null;            // ~5% re-roll/manual abandon
      if (!active) { active = weightedPick(pool); charge = threshold; }
      const decay = rnd(active.easeMin ?? pk.easeMin ?? 20, active.easeMax ?? pk.easeMax ?? 34);
      charge = Math.max(0, charge - decay);
      const depletedEnd = charge <= 0;
      mk(d, pk, active, Math.random() < 0.82, 'auto', null, depletedEnd);
      if (depletedEnd) active = null;
    }
    easeState[pk.id] = active ? { activeItemId: active.id, charge } : { activeItemId: null, charge: 0 };
  }

  return { rows, easeState };
}

// Seeded reminder completion log — a few past completions across the seeded
// recurring reminders, plus one from a since-deleted one-time reminder (to
// prove history persists past deletion). Dates are relative to today.
function buildReminderLog() {
  const now = new Date();
  const rows = [];
  const mk = (taskId, name, type, date) => rows.push({
    rowId: 'rl_seed_' + Math.random().toString(36).slice(2, 8),
    taskId, name, type, completedAt: date.toISOString(),
  });
  const at = (backDays, h = 9, m = 0) => {
    const d = new Date(now); d.setDate(now.getDate() - backDays); d.setHours(h, m, 0, 0); return d;
  };
  // ── Recurring reminders: many completions each over the past year, so they
  // dominate a High → Low completions sort. ──
  // Weekly trash run (Tuesdays), ~9 months back.
  let found = 0;
  for (let back = 1; back <= 300 && found < 38; back++) {
    const d = at(back, 8, 10);
    if (d.getDay() === 2) { mk('tk_trash', 'Take out the trash for pickup', 'recurring', d); found++; }
  }
  // Weekly plant watering (Saturdays).
  found = 0;
  for (let back = 1; back <= 300 && found < 30; back++) {
    const d = at(back, 10, 0);
    if (d.getDay() === 6) { mk('tk_plants', 'Water the plants', 'recurring', d); found++; }
  }
  // Weekly budget review (Sundays), started ~5 months ago.
  found = 0;
  for (let back = 1; back <= 150 && found < 18; back++) {
    const d = at(back, 19, 30);
    if (d.getDay() === 0) { mk('tk_budget', 'Weekly budget review', 'recurring', d); found++; }
  }
  // Monthly prescription refill.
  for (let i = 1; i <= 8; i++) mk('tk_meds', 'Refill prescription', 'recurring', at(i * 30 + 2, 9, 0));
  // Monthly HVAC filter change.
  for (let i = 1; i <= 5; i++) mk('tk_filter', 'Change the HVAC filter', 'recurring', at(i * 30 + 12, 17, 0));

  // ── One-time reminders: each completed once, spread across the year. Several
  // are long past and their tasks have since been purged — history persists via
  // these denormalized rows (no "deleted" treatment, just older completions). ──
  const onceDone = [
    ['tk_landlord', 'Email the landlord about the lease', 6],
    ['tk_passport', 'Renew passport', 40],
    ['tk_dentist',  'Book dentist appointment', 22],
    ['tk_faucet',   'Fix the leaky faucet', 95],
    ['tk_taxes',    'Submit tax documents', 130],
    ['tk_library',  'Return library books', 17],
    ['tk_carserv',  'Schedule car service', 58],
    ['tk_resume',   'Update resume', 210],
    ['tk_subcancel','Cancel unused subscription', 74],
    ['tk_bday',     'Send birthday card to Mom', 160],
    ['tk_backup',   'Back up the laptop', 33],
    ['tk_conf',     'Register for the conference', 118],
    ['tk_smoke',    'Replace smoke detector battery', 250],
    ['tk_drycln',   'Pick up dry cleaning', 9],
  ];
  for (const [id, name, back] of onceDone) mk(id, name, 'once', at(back, 12 + (back % 8), 15));
  return rows;
}

// Seeded reminder skip log — past skips across recurring + one-time reminders
// (enough distinct entries to exercise the breakdown pager). Denormalized
// name/type like the completion log so it survives rename/deletion.
function buildReminderSkipLog() {
  const now = new Date();
  const rows = [];
  const mk = (taskId, name, type, backDays) => {
    const d = new Date(now); d.setDate(now.getDate() - backDays); d.setHours(7, 45, 0, 0);
    rows.push({
      rowId: 'rs_seed_' + Math.random().toString(36).slice(2, 8),
      taskId, name, type, skippedAt: d.toISOString(),
    });
  };
  // Recurring reminders skipped repeatedly (high counts, sort to top).
  [4, 11, 25, 46, 88].forEach((b) => mk('tk_trash', 'Take out the trash for pickup', 'recurring', b));
  [9, 39, 69].forEach((b) => mk('tk_meds', 'Refill prescription', 'recurring', b));
  [13, 55].forEach((b) => mk('tk_plants', 'Water the plants', 'recurring', b));
  mk('tk_budget', 'Weekly budget review', 'recurring', 21);
  // One-time reminders put off (each once or twice).
  mk('tk_call', 'Call the plumber back', 'once', 2);
  mk('tk_call', 'Call the plumber back', 'once', 5);
  mk('tk_dentist', 'Book dentist appointment', 'once', 30);
  mk('tk_carserv', 'Schedule car service', 'once', 62);
  mk('tk_resume', 'Update resume', 'once', 190);
  mk('tk_conf', 'Register for the conference', 'once', 124);
  return rows;
}

function buildSeed() {
  const items = buildItems();
  const pickers = buildPickers();
  const pickerById = Object.fromEntries(pickers.map((p) => [p.id, p]));
  const itemNamed = (n) => items.find((i) => i.name === n);
  const todayIso = seedIsoDay(new Date());
  let _e = 0;
  const mkEid = () => 'eseed_' + (_e++).toString(36);

  // Vacation history + the pick log that honors it. buildPickLog also returns
  // per-picker ease-down end state (which item is mid-depletion + its charge).
  const vacationLog = buildVacationLog(items);
  const onVac = makeOnVac(vacationLog);
  const { rows: histRows, easeState } = buildPickLog(items, pickers, onVac);

  // Apply ease-down end state to the live snapshot: every item in an ease-down
  // picker is recharged to full, except the in-progress one (partial charge),
  // and the picker points at it via activeItemId.
  for (const p of pickers) {
    if (p.mode !== 'ease-down') continue;
    const st = easeState[p.id] || { activeItemId: null, charge: 0 };
    const threshold = p.threshold ?? 100;
    for (const it of items) if (it.pickerId === p.id) it.value = threshold;
    p.activeItemId = st.activeItemId;
    if (st.activeItemId) {
      const a = items.find((it) => it.id === st.activeItemId);
      if (a) a.value = st.charge;
    }
  }

  // Today's picks. Ease-down pickers continue their active item as an 'auto'
  // daily pick (so today's list matches the in-progress streak).
  const playActive = (() => {
    const id = (easeState['pkr_play'] || {}).activeItemId;
    return id ? items.find((it) => it.id === id) : null;
  })();
  const todayPicks = [
    // Chores group
    { pickerId: 'pkr_chore_d', item: 'Wipe kitchen counters',   done: true,  source: 'auto'   },
    { pickerId: 'pkr_chore_w', item: 'Mop the kitchen',         done: false, source: 'auto'   },
    { pickerId: 'pkr_chore_m', item: 'Dust the bookshelves',    done: false, source: 'auto'   },
    // Food group
    { pickerId: 'pkr_brk',     item: 'Oatmeal with berries',    done: true,  source: 'auto'   },
    { pickerId: 'pkr_lun',     item: 'Grain bowl',              done: true,  source: 'auto'   },
    { pickerId: 'pkr_din',     item: 'Sheet-pan vegetables',    done: false, source: 'auto'   },
    // Singletons — a couple were hand-picked from the Pickers tab.
    { pickerId: 'pkr_self',    item: 'Walk without headphones', done: true,  source: 'manual' },
    { pickerId: 'pkr_work',    item: 'Inbox triage, 20 min',    done: false, source: 'auto'   },
    { pickerId: 'pkr_play',    item: (playActive ? playActive.name : 'Long bath, no phone'), done: false, source: 'auto' },
  ].map((p) => ({ ...p, eid: mkEid(), itemId: itemNamed(p.item).id }));

  const todayRows = todayPicks.map((p) => {
    const pk = pickerById[p.pickerId];
    const ts = new Date(); ts.setHours(8, 30, 0, 0);
    return {
      id: 'pls_today_' + p.eid, eid: p.eid, date: todayIso,
      pickerId: p.pickerId, itemId: p.itemId,
      itemName: p.item, pickerName: pk.name, group: pk.group,
      done: p.done, completedAt: p.done ? ts.toISOString() : null, source: p.source,
    };
  });

  // Deterministically make "Fridge wipe-down" the "returned but not picked
  // since" case: drop its active picks on/after its return date.
  const fridge = items.find((it) => it.name === 'Fridge wipe-down');
  const fridgeReturnIso = (() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - 5); return seedIsoDay(d);
  })();
  const pickLog = histRows
    .filter((r) => !(fridge && r.itemId === fridge.id && !r.outcome && r.date >= fridgeReturnIso))
    .concat(todayRows);

  return {
    // Drop retired items from the LIVE list but keep their pickLog rows above —
    // Stats renders them as "deleted" ghosts so their history stays consistent.
    items: items.filter((it) => !it.__deleted),
    pickers,
    // Demo conditional: an ease-up "Chore-Free Day" gate attached to Weekly
    // Chore. It charges toward a day off as chores get completed; when it fires,
    // Weekly Chore rests and a day-off card shows. Seeded partway so it's easy
    // to exercise. (Attached below via conditionalId on pkr_chore_w.)
    conditionals: [
      { id: 'cnd_chorefree', name: 'Chore Free Day', mode: 'ease-up',
        cardText: 'Chore-free day — enjoy the break!', value: 60, weight: 1,
        active: true, triggered: false, easeMin: 18, easeMax: 30, threshold: 100, chargedToday: false },
    ],
    daily: { pickerIds: pickers.map((p) => p.id), runTime: '04:00', mode: 'auto' }, // every picker runs daily, auto-run 4am
    holidays: HOLIDAYS.defaultState(),
    appearance: { theme: 'ink', customLight: null, customDark: null, autoSystem: false, pickAnim: 'reel', completionStyle: 'confetti', tabPlacement: 'bottom' },
    // Manual reminders — statically scheduled tasks shown atop Today.
    tasks: [
      TASKS.defaultTask({ id: 'tk_trash', name: 'Take out the trash for pickup', repeat: 'weekly', daysOfWeek: [2] }),
      TASKS.defaultTask({ id: 'tk_rent',  name: 'Pay the rent',                  repeat: 'monthly', dayOfMonth: 1 }),
      TASKS.defaultTask({ id: 'tk_meds',  name: 'Refill prescription',           repeat: 'interval', interval: 30 }),
      TASKS.defaultTask({ id: 'tk_call',  name: 'Call the plumber back',          repeat: 'once' }),
    ],
    reminderOpts: TASKS.defaultOpts(),
    // Completion history for reminders (append-only; a row is voided when the
    // user un-checks that day's completion). Denormalized name + type so the
    // log survives renames and deletions of the underlying reminder. Seeded
    // with a few past completions so Stats shows something once a reminder
    // type's "Include in Stats" switch is turned on.
    reminderLog: buildReminderLog(),
    reminderSkipLog: buildReminderSkipLog(),
    today: {
      date: todayIso,
      generatedAt: (() => {
        const d = new Date(); d.setHours(7, 12, 0, 0); return d.toISOString();
      })(),
      streakClaimed: true,  // seed has done entries → today already counts
      entries: todayPicks.map((p) => ({
        eid: p.eid, pickerId: p.pickerId, itemId: p.itemId, done: p.done, skipped: false })),
    },
    // Per-pick history (~1yr) + today's rows. The Stats tab derives everything
    // from this; there is no separate aggregate `history` anymore. Vacation days
    // are honored (no picks while an item was away).
    pickLog: pickLog,
    vacationLog: vacationLog,
    // Conditional trigger history (~1yr) for the demo gate. One row per
    // completed cycle; Stats derives Total/Frequency/Last-Triggered from it.
    conditionalLog: buildConditionalLog(),
    streak: 11,
    // The sample-data build already has pickers/history — never onboard it.
    onboarding: { welcomed: true, dismissed: true },
  };
}

// Conditional history (~1yr) for the demo ease-up "Chore Free Day" gate. One
// row per completed weekly cycle: mostly triggered:false (chores got done and
// the gate didn't fire), with the gate firing every ~4-6 weeks once it charges
// to 100 → triggered:true. Row shape mirrors the store: {id,condId,date,
// triggered,mode,name}. Weekly cadence → one row every 7 days back from today.
function buildConditionalLog() {
  const rows = [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let sinceFire = 2; // weeks since last fire; fires when it reaches 5-6
  let _c = 0;
  const mk = (backDays, triggered) => {
    const d = new Date(today); d.setDate(today.getDate() - backDays);
    rows.push({ id: 'clseed_' + (_c++).toString(36), condId: 'cnd_chorefree',
      date: seedIsoDay(d), triggered, mode: 'ease-up', name: 'Chore Free Day' });
  };
  // Walk backwards ~52 weeks. A row exists for a week only if that cycle was
  // completed; skip a few weeks entirely (ignored cycle → no row).
  for (let w = 51; w >= 1; w--) {
    const back = w * 7;
    if (w % 9 === 0) continue; // occasional un-completed cycle: no row
    sinceFire++;
    const fire = sinceFire >= 5 && (sinceFire >= 6 || w % 2 === 0);
    if (fire) { mk(back, true); sinceFire = 0; }
    else { mk(back, false); }
  }
  return rows;
}

export const SEED = buildSeed;

// Clean state — what a brand-new user sees: no pickers, no items, no reminders,
// and every app setting at its default. Reset restores exactly this (NOT the
// sample data, which is only for development/first-run demoing).
function buildClean() {
  const todayIso = seedIsoDay(new Date());
  return {
    items: [],
    pickers: [],
    conditionals: [],
    daily: { pickerIds: [], runTime: '04:00', mode: 'auto' },
    holidays: HOLIDAYS.defaultState(),
    appearance: { theme: 'ink', customLight: null, customDark: null, autoSystem: false, pickAnim: 'reel', completionStyle: 'confetti', tabPlacement: 'bottom' },
    tasks: [],
    reminderOpts: TASKS.defaultOpts(),
    reminderLog: [],
    reminderSkipLog: [],
    today: { date: todayIso, generatedAt: null, streakClaimed: false, entries: [] },
    pickLog: [],
    vacationLog: [],
    conditionalLog: [],
    streak: 0,
    // Brand-new users see the onboarding (welcome modal + tour + checklist).
    onboarding: { welcomed: false, dismissed: false },
  };
}
export const CLEAN_STATE = buildClean;
export const MODES = {
  'random':    { label: 'Truly random',     hint: ['Ruleset: This picker\u2019s ruleset makes it so that all of its items have an equally likely chance of being picked.', 'Explanation: This is a good choice for being truly random, but it also has some drawbacks. e.g. it can pick the exact same item multiple times in a row or an item can go a long time without being picked.'] },
  'weighted':  { label: 'Weighted',         hint: ['Ruleset: This picker\u2019s ruleset uses adjustable, weighted per-item values that can make them more (or less) likely to be picked.', 'Explanation: This is a good choice for mitigating some of the Truly random drawbacks by tuning individual items\u2019 % chance to make them more (or less) likely to be picked. e.g. it can still pick the exact same item multiple times in a row or an item can go a long time without being picked, although it is less likely to do so.'] },
  'dynamic':   { label: 'Dynamic weighted', hint: ['Ruleset: This picker\u2019s ruleset is exactly the same as the Weighted picker, but it also adds a second per-item value that increments the weighted value every time an item is not picked and then resets its value every time that it is.', 'Explanation: This is a good choice for mitigating almost all of the Truly random drawbacks by tuning individual items\u2019 % chance to make them more (or less) likely to be picked. Furthermore, by adding a dynamic per-item value it makes it increasingly likely to be picked when it isn\u2019t and less likely when it is. e.g. it can still pick the exact same item multiple times in a row or an item can go a long time without being picked, although it is much less likely to do so.'] },
  'ease-up':   { label: 'Ease-up',          hint: ['Ruleset: This picker\u2019s ruleset makes it so that all items are ineligible to be picked until their individual values reach 100, at which point they are put into a pool of eligible items to be picked. Said values will start at 0 and are incremented every cycle by a random amount within a user defined range.', 'Explanation: This is a good choice for ensuring that picker items can only be picked once every X days and can never be picked multiple times in a row. e.g. an item can only be picked at most once a week and must be picked at least once every two weeks.'] },
  'ease-down': { label: 'Ease-down',        hint: ['Ruleset: This picker\u2019s ruleset is the opposite of the Ease-up picker. It makes it so that all items are eligible to be picked and once an item is picked it will stay picked until its value reaches 0, at which point a new item is picked. Said value will start at 100 and is decremented every cycle by a random amount within a user defined range.', 'Explanation: This is a good choice for ensuring that an item stays picked for at least X days and then is not picked again for at least one cycle afterwards. e.g. it must remain picked for at least a week and must not remain picked for more than two weeks.'] },
};
