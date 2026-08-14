// Sample-picker + sample-reminder data seeded on a fresh install before the
// Welcome Tour begins (see the seeding effect in onboarding.jsx). Kept in its
// own plain-JS module (no JSX, no React import) so it can also be imported
// directly by scripts/build-onboarding-stats.mjs — a Node script that
// precomputes ~1yr of matching pick/reminder history offline. The ids below
// are load-bearing: they must exactly match what that script baked into
// src/onboarding-stats-data.js, or the precomputed history will reference
// pickers/items/tasks that don't exist.

// Sample "Daily Chores" picker. Also prefill data for the (currently
// stashed) create-a-picker form flow in onboarding.jsx, for whenever the
// future create-a-picker mini-tour reuses this same data.
export const OB_EXAMPLE = {
  id: 'pkr_ob_daily',
  name: 'Daily Chores', group: 'Chores', mode: 'ease-up', step: 1,
  items: [
    { id: 'ob_it_laundry', name: 'Do the laundry', weight: 1, easeMin: 7, easeMax: 14, value: 100 },
    { id: 'ob_it_bath', name: 'Clean the bathrooms', weight: 1, easeMin: 12.5, easeMax: 20, value: 100 },
    { id: 'ob_it_dust', name: 'Dust the main living area', weight: 1, easeMin: 9.0909, easeMax: 12.5, value: 100 },
    { id: 'ob_it_vacuum', name: 'Vacuum the floors', weight: 1, easeMin: 11.1111, easeMax: 16.6667, value: 100 },
    { id: 'ob_it_shower', name: 'Clean the shower', weight: 1, easeMin: 5.5556, easeMax: 8.3333, value: 100 },
    { id: 'ob_it_oven', name: 'Clean the oven', weight: 1, easeMin: 4.7619, easeMax: 7.1429, value: 100 },
  ],
};

// Extra sample pickers (Chores/Food/Self Care/Entertainment) meant to make a
// generated day look like a fuller, more realistic todo list instead of a
// single lonely item. Each uses the Create-a-picker form's own defaults
// (daily cadence, every day of the week, holidays not skipped, included in
// the daily generator) aside from what's specified here. Seeded alongside
// OB_EXAMPLE.
export const OB_EXTRA_PICKERS = [
  {
    id: 'pkr_ob_monthly',
    name: 'Monthly Chores', group: 'Chores', mode: 'ease-up',
    items: [
      { id: 'it_ob_oven2', name: 'Deep clean the oven', weight: 1, easeMin: 2.5, easeMax: 4.1667, value: 100 },
      { id: 'it_ob_dust2', name: 'Dust the entire house', weight: 1, easeMin: 3.7037, easeMax: 5.5556, value: 100 },
      { id: 'it_ob_fridge', name: 'Clean out the fridge', weight: 1, easeMin: 2.2222, easeMax: 3.0303, value: 100 },
      { id: 'it_ob_vacuum2', name: 'Vacuum under the furniture', weight: 1, easeMin: 1.6667, easeMax: 2.5, value: 100 },
      { id: 'it_ob_mop', name: 'Mop the floors', weight: 1, easeMin: 4.3478, easeMax: 6.6667, value: 100 },
    ],
  },
  {
    id: 'pkr_ob_coffee',
    name: 'Coffee Creamer', group: 'Food', mode: 'dynamic',
    items: [
      { id: 'it_ob_vanilla', name: 'French Vanilla', weight: 1 },
      { id: 'it_ob_caramel', name: 'Caramel', weight: 3 },
      { id: 'it_ob_sweetcream', name: 'Sweet Cream', weight: 2 },
      { id: 'it_ob_cinnamon', name: 'Cinnamon', weight: 1 },
      { id: 'it_ob_pumpkin', name: 'Pumpkin Spice', weight: 2 },
      { id: 'it_ob_hazelnut', name: 'Hazelnut', weight: 1 },
      { id: 'it_ob_mocha', name: 'Mocha', weight: 3 },
    ],
  },
  {
    id: 'pkr_ob_dinner',
    name: 'Dinner', group: 'Food', mode: 'ease-up',
    items: [
      { id: 'it_ob_spaghetti', name: 'Spaghetti and meatballs', weight: 1, easeMin: 8.3333, easeMax: 14.2857, value: 100 },
      { id: 'it_ob_meatloaf', name: 'Meatloaf', weight: 1, easeMin: 7.1429, easeMax: 10, value: 100 },
      { id: 'it_ob_tacos', name: 'Tacos', weight: 1, easeMin: 10, easeMax: 16.6667, value: 100 },
      { id: 'it_ob_pizza', name: 'Pizza', weight: 1, easeMin: 12.5, easeMax: 20, value: 100 },
      { id: 'it_ob_steak', name: 'Steak and potatoes', weight: 1, easeMin: 7.6923, easeMax: 11.1111, value: 100 },
      { id: 'it_ob_burger', name: 'Burger and fries', weight: 1, easeMin: 9.0909, easeMax: 12.5, value: 100 },
      { id: 'it_ob_lemonchicken', name: 'Lemon Chicken', weight: 1, easeMin: 7.1429, easeMax: 14.2857, value: 100 },
      { id: 'it_ob_friedchicken', name: 'Fried chicken', weight: 1, easeMin: 11.1111, easeMax: 16.6667, value: 100 },
    ],
  },
  {
    id: 'pkr_ob_workouts',
    name: 'Workouts', group: 'Self Care', mode: 'ease-up',
    items: [
      { id: 'it_ob_chest', name: 'Chest', weight: 1, easeMin: 14.2857, easeMax: 20, value: 100 },
      { id: 'it_ob_legs', name: 'Legs', weight: 1, easeMin: 12.5, easeMax: 16.6667, value: 100 },
      { id: 'it_ob_shoulders', name: 'Shoulders', weight: 1, easeMin: 11.1111, easeMax: 14.2857, value: 100 },
      { id: 'it_ob_arms', name: 'Arms', weight: 1, easeMin: 12.5, easeMax: 25, value: 100 },
      { id: 'it_ob_core', name: 'Core', weight: 1, easeMin: 12.5, easeMax: 20, value: 100 },
    ],
  },
  {
    id: 'pkr_ob_relax',
    name: 'Relax', group: 'Entertainment', mode: 'ease-down',
    items: [
      { id: 'it_ob_readbook', name: 'Read a book', weight: 1, easeMin: 14.2857, easeMax: 20, value: 100 },
      { id: 'it_ob_bingewatch', name: 'Binge watch a show', weight: 1, easeMin: 20, easeMax: 50, value: 100 },
      { id: 'it_ob_watchmovie', name: 'Watch a movie', weight: 1, easeMin: 16.6667, easeMax: 33.3333, value: 100 },
      { id: 'it_ob_youtube', name: 'Browse YouTube', weight: 1, easeMin: 25, easeMax: 50, value: 100 },
    ],
  },
];

// The two sample reminders seeded alongside the pickers above. "Pick up
// prescription" is a one-time reminder — it stays pending (no history makes
// sense for something not yet completed). "Take trash out for pickup" is
// weekly on Mondays and gets ~a year of completion history — see
// src/onboarding-stats-data.js.
export const OB_TASKS = [
  { id: 'tk_ob_meds', name: 'Pick up prescription', repeat: 'once' },
  { id: 'tk_ob_trash', name: 'Take trash out for pickup', repeat: 'weekly', daysOfWeek: [1] },
];

// Every sample picker/task id in one place — used to hide them once the
// Welcome Tour ends (see onboarding.jsx) and to recognize a still-hidden one
// as a mini-tour launcher card on Today (see tab-today.jsx/reminders.jsx).
export const OB_SAMPLE_PICKER_IDS = [OB_EXAMPLE, ...OB_EXTRA_PICKERS].map((p) => p.id);
export const OB_SAMPLE_TASK_IDS = OB_TASKS.map((t) => t.id);

// Override copy for each sample reminder's mini-tour launcher card — the
// card's name always reads as an instruction ("Set up a ... reminder")
// rather than the sample's own real name. `kicker` is an explicit override
// only where the real schedule summary (TASKS.summary(task)) isn't what we
// want shown — the one-time reminder wants "One-Time" instead of
// TASKS.summary's "One-time". The recurring reminder has no kicker override
// here on purpose: its daysOfWeek is set dynamically at seed time (see
// onboarding.jsx) to whatever day the tour is taken on, so TASKS.summary
// already produces the right "Every {Day}" text for it. Sample pickers don't
// need an equivalent table: their card kicker is just the picker's own name,
// and the card name is "Set up a {picker name} picker".
// time is a real, user-confirmed estimate (manually timed 2026-08-14) shown
// on the card.
export const OB_REMINDER_CARD_TEXT = {
  tk_ob_meds: { kicker: 'One-Time', name: 'Set up a one time reminder', time: '< 1 min' },
  tk_ob_trash: { name: 'Set up a recurring reminder', time: '1 min' },
};

// Same idea as OB_REMINDER_CARD_TEXT's `time` above, but pickers have no
// equivalent card-text override table to hang it off of (their kicker/name
// are derived directly from the picker, not overridden) — a standalone map
// keyed by sample picker id. Real, user-confirmed estimates (manually timed
// 2026-08-14).
export const OB_PICKER_CARD_TIME = {
  pkr_ob_daily: '2.5 min',
  pkr_ob_monthly: '2.5 min',
  pkr_ob_coffee: '2.5 min',
  pkr_ob_dinner: '2.5 min',
  pkr_ob_workouts: '2.5 min',
  pkr_ob_relax: '2.5 min',
};

// Same local-timezone-adjusted ISO day string as store.jsx's isoDay /
// seed.js's seedIsoDay — kept as a local copy since this module has no
// dependency on either.
const isoDay = (d) => {
  const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 10);
};

// Converts the precomputed, day-offset-based ONBOARDING_STATS (see
// src/onboarding-stats-data.js and scripts/build-onboarding-stats.mjs) into
// real pickLog / reminderLog / reminderSkipLog rows, dated relative to the
// ACTUAL current date rather than whenever that file was generated. Pure
// date arithmetic over a few thousand rows — effectively instant, no
// perceptible delay for the tour that's about to start.
export function hydrateOnboardingStats(stats) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateOfDaysAgo = (daysAgo) => {
    const d = new Date(today);
    d.setDate(today.getDate() - daysAgo);
    return d;
  };
  let seq = 0;
  const pickLog = (stats.pickLog || []).map((r) => {
    const d = dateOfDaysAgo(r.daysAgo);
    let completedAt = null;
    if (r.done && r.h != null) {
      const ts = new Date(d);
      ts.setHours(r.h, r.m, 0, 0);
      completedAt = ts.toISOString();
    }
    return {
      id: 'pls_ob_' + (seq++).toString(36), eid: null, date: isoDay(d),
      pickerId: r.pickerId, itemId: r.itemId,
      itemName: r.itemName, pickerName: r.pickerName, group: r.group,
      done: r.done, completedAt, source: r.source,
      ...(r.outcome ? { outcome: r.outcome } : {}),
      ...(r.depletedEnd ? { depletedEnd: true } : {}),
    };
  });
  const reminderLog = (stats.reminderLog || []).map((r) => {
    const ts = dateOfDaysAgo(r.daysAgo);
    ts.setHours(r.h, r.m, 0, 0);
    return {
      rowId: 'rl_ob_' + (seq++).toString(36),
      taskId: r.taskId, name: r.name, type: r.type,
      completedAt: ts.toISOString(),
    };
  });
  const reminderSkipLog = (stats.reminderSkipLog || []).map((r) => {
    const ts = dateOfDaysAgo(r.daysAgo);
    ts.setHours(r.h, r.m, 0, 0);
    return {
      rowId: 'rs_ob_' + (seq++).toString(36),
      taskId: r.taskId, name: r.name, type: r.type,
      skippedAt: ts.toISOString(),
    };
  });
  return { pickLog, reminderLog, reminderSkipLog };
}
