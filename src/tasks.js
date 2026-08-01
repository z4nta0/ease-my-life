import { HOLIDAYS } from './holidays.js';

// Reminders engine — manual, statically-scheduled tasks that live alongside
// the random pickers. Unlike a picker (which chooses ONE item from many), a
// reminder is an explicit task you either do once or on a fixed schedule.
//
// A reminder shows on Today only when it's DUE today, and completing it sets
// `lastDone` to today's date. Recurring reminders come back fresh on their
// next scheduled day; a one-time reminder is done for good (and gets purged
// the next day).
//
// Schedule kinds (`repeat`):
//   once     — no schedule; due every day until completed, then gone
//   weekly   — due on the chosen weekdays (daysOfWeek: [0=Sun … 6=Sat])
//   interval — due every N days, counted from `anchor`
//   monthly  — due on a day-of-month (dayOfMonth: 1–31; clamps to month length)
//   annual   — due on a day-of-year (month: 1–12, day: 1–31; clamps Feb 29)
//
// Shape (lives at state.tasks, an array of):
//   { id, name, repeat, daysOfWeek, interval, anchor, dayOfMonth, month, day,
//     lastDone, createdAt }

const pad = (n) => String(n).padStart(2, '0');
const isoOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const isoToday = () => isoOf(new Date());

// The Today tab's reminders list is generator-driven, not calendar-driven:
// a reminder due on a new day shouldn't appear until the daily generator
// (auto or manual Regenerate) actually runs on/after that day, exactly like
// picker entries only change on generation. Callers computing what's
// CURRENTLY shown on Today (visibility, done-state, streak) should pass this
// as their `date` instead of letting it default to live `new Date()`; callers
// doing schedule advisories (Data tab, "will this show today" notes) should
// keep using the real current date.
const anchorDate = (generatedAt) => generatedAt ? new Date(generatedAt) : new Date();

// Local-midnight Date from a 'YYYY-MM-DD' string (avoids UTC drift).
const fromIso = (s) => {
  const [y, m, d] = (s || '').split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
const daysInMonth = (year, month1) => new Date(year, month1, 0).getDate();
const diffDays = (aIso, date) => {
  const a = fromIso(aIso);
  const b = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((b - a) / 86400000);
};

function defaultTask(p = {}) {
  const now = new Date();
  return {
    id: p.id || 'tk_' + Math.random().toString(36).slice(2, 8),
    name: p.name || '',
    repeat: p.repeat || 'once',
    daysOfWeek: Array.isArray(p.daysOfWeek) ? p.daysOfWeek : [now.getDay()],
    interval: p.interval || 2,
    anchor: p.anchor || isoToday(),
    dayOfMonth: p.dayOfMonth || now.getDate(),
    month: p.month || now.getMonth() + 1,
    day: p.day || now.getDate(),
    lastDone: p.lastDone ?? null,
    skipUntil: p.skipUntil ?? null,
    createdAt: p.createdAt || isoToday(),
  };
}

// Is this reminder due on `date`?
function isDueToday(task, date = new Date()) {
  const today = isoOf(date);
  switch (task.repeat) {
    case 'once':
      // Due until completed; the day it's completed it still shows (checked).
      return !task.lastDone || task.lastDone === today;
    case 'weekly':
      return (task.daysOfWeek || []).includes(date.getDay());
    case 'interval': {
      const n = Math.max(1, task.interval || 1);
      const delta = diffDays(task.anchor || task.createdAt, date);
      return delta >= 0 && delta % n === 0;
    }
    case 'monthly': {
      const dim = daysInMonth(date.getFullYear(), date.getMonth() + 1);
      const target = Math.min(task.dayOfMonth || 1, dim);
      return date.getDate() === target;
    }
    case 'annual': {
      if (date.getMonth() + 1 !== task.month) return false;
      const dim = daysInMonth(date.getFullYear(), task.month);
      const target = Math.min(task.day || 1, dim); // Feb 29 → Feb 28 in common years
      return date.getDate() === target;
    }
    default:
      return false;
  }
}

// Has today's occurrence been completed?
function isDoneToday(task, date = new Date()) {
  return !!task.lastDone && task.lastDone === isoOf(date);
}

// A completed one-time reminder from a previous day — safe to purge.
function isStaleOnce(task, date = new Date()) {
  return task.repeat === 'once' && task.lastDone && task.lastDone !== isoOf(date);
}

// A completed one-time reminder, any day including today — Generate purges
// these outright rather than waiting for isStaleOnce (next day).
function isCompletedOnce(task) {
  return task.repeat === 'once' && !!task.lastDone;
}

const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// Short human label for a reminder's schedule.
function summary(task) {
  switch (task.repeat) {
    case 'once':
      return 'One-time';
    case 'weekly': {
      const d = [...(task.daysOfWeek || [])].sort((a, b) => a - b);
      if (d.length === 0) return 'Weekly';
      if (d.length === 7) return 'Every day';
      if (d.length === 5 && [1, 2, 3, 4, 5].every((x) => d.includes(x))) return 'Every weekday';
      if (d.length === 2 && d.includes(0) && d.includes(6)) return 'Weekends';
      if (d.length === 1) return 'Every ' + DAY_FULL[d[0]];
      return 'Every ' + d.map((x) => DAY_ABBR[x]).join(', ');
    }
    case 'interval': {
      const n = Math.max(1, task.interval || 1);
      return n === 1 ? 'Every day' : `Every ${n} days`;
    }
    case 'monthly':
      return `Monthly · ${ordinal(task.dayOfMonth || 1)}`;
    case 'annual':
      return 'Yearly · ' + new Date(2001, (task.month || 1) - 1, task.day || 1)
        .toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    default:
      return '';
  }
}

// Reminders due today, in a stable order (one-time first, then newest-added).
function dueToday(tasks, date = new Date()) {
  return (tasks || [])
    .filter((t) => isDueToday(t, date))
    .sort((a, b) => {
      if (a.repeat === 'once' && b.repeat !== 'once') return -1;
      if (b.repeat === 'once' && a.repeat !== 'once') return 1;
      return a.createdAt < b.createdAt ? 1 : -1;
    });
}

// ── Per-type participation options ─────────────────────────────────────────
// Reminders split into two classes — one-time vs recurring — each with its
// own switches for how it participates app-wide. Defaults: count toward
// streak + ring, appear in Stats, and never auto-skip weekends or holidays.
function defaultOpts() {
  const base = { streak: true, ring: true, stats: true, excludeWeekends: false, excludeHolidays: false };
  return { once: { ...base }, recurring: { ...base } };
}
// Merge stored opts over defaults so older/partial state stays valid.
function normalizeOpts(opts) {
  const d = defaultOpts();
  if (!opts) return d;
  return {
    once: { ...d.once, ...(opts.once || {}) },
    recurring: { ...d.recurring, ...(opts.recurring || {}) },
  };
}
const isRecurring = (task) => task.repeat !== 'once';
// The option set governing a given task (by its type).
function optsFor(task, opts) {
  const o = normalizeOpts(opts);
  return isRecurring(task) ? o.recurring : o.once;
}

// Reminders that should actually SHOW on Today: due, minus any excluded by
// their type's weekend / holiday switches.
function visibleToday(tasks, opts, holidayState, date = new Date()) {
  const weekend = date.getDay() === 0 || date.getDay() === 6;
  const holiday = !!(HOLIDAYS && HOLIDAYS.holidayOn(holidayState, date));
  const todayIso = isoOf(date);
  return dueToday(tasks, date).filter((t) => {
    const o = optsFor(t, opts);
    if (o.excludeWeekends && weekend) return false;
    if (o.excludeHolidays && holiday) return false;
    // Manually skipped until a future date — hidden until that day arrives.
    if (t.skipUntil && todayIso < t.skipUntil) return false;
    return true;
  });
}

// Will this reminder show on Today, and if not, WHY and when will it?
// Separates the two causes because they mean different things to the user:
//   'schedule' — the repeat rule simply doesn't land on today. Nothing is
//                wrong; it will appear on its day.
//   'weekends' / 'holidays' — the reminder IS due today but its type's
//                participation switch hides it. Surprising, especially for a
//                one-time reminder, which has no later occurrence of its own.
//   'skipUntil' — the user manually skipped it.
// `next` is the first day it will actually appear (schedule AND exclusions
// honored), or null if nothing qualifies within the search horizon.
function todayVisibility(task, opts, holidayState, date = new Date()) {
  const o = optsFor(task, opts);
  const weekend = date.getDay() === 0 || date.getDay() === 6;
  // Full record (not just the name) so the advisory can distinguish "the
  // Christmas Day holiday" from "your Family Day custom holiday".
  const hol = HOLIDAYS && HOLIDAYS.holidayInfoOn
    ? HOLIDAYS.holidayInfoOn(holidayState, date)
    : (HOLIDAYS && HOLIDAYS.holidayOn(holidayState, date) ? { name: HOLIDAYS.holidayOn(holidayState, date), custom: false } : null);
  const holiday = !!hol;
  const todayIso = isoOf(date);
  // ALL applicable reasons, not just the first: a day can be both an excluded
  // weekend and an excluded holiday, and naming only one means the user turns
  // that setting off and the reminder still doesn't appear, with no explanation.
  // `cause` stays the primary reason (used for routing the note to the right
  // control); `causes` carries the full set for the wording.
  const causes = [];
  if (!isDueToday(task, date)) causes.push('schedule');
  else {
    if (o.excludeWeekends && weekend) causes.push('weekends');
    if (o.excludeHolidays && holiday) causes.push('holidays');
    if (task.skipUntil && todayIso < task.skipUntil) causes.push('skipUntil');
  }
  const cause = causes[0] || null;
  return {
    visible: !cause,
    cause,
    causes,
    holidayName: hol ? hol.name : null,
    holidayCustom: hol ? !!hol.custom : false,
    next: cause ? nextEligible(task, opts, holidayState, date, true) : null,
  };
}

// The first date on/after tomorrow when this reminder would naturally appear
// again — honoring its schedule AND its weekend/holiday exclusions. Powers
// the "Skip until …" action. Returns a Date, or null if nothing qualifies
// within the search horizon (e.g. an annual task that always lands on an
// excluded holiday).
// `respectSkipUntil` — when true, days before an active skipUntil are skipped
// too. OFF by default: the "Skip until…" action calls this to find the next
// natural occurrence to skip TO, and there the current skipUntil must be
// ignored or it could never advance. Callers describing when a reminder will
// actually REAPPEAR (the editor advisory, the day log) must pass true.
function nextEligible(task, opts, holidayState, from = new Date(), respectSkipUntil = false) {
  const o = optsFor(task, opts);
  const base = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  for (let i = 1; i <= 1100; i++) {
    const d = new Date(base); d.setDate(base.getDate() + i);
    if (!isDueToday(task, d)) continue;
    if (respectSkipUntil && task.skipUntil && isoOf(d) < task.skipUntil) continue;
    const weekend = d.getDay() === 0 || d.getDay() === 6;
    if (o.excludeWeekends && weekend) continue;
    if (o.excludeHolidays && HOLIDAYS && HOLIDAYS.holidayOn(holidayState, d)) continue;
    return d;
  }
  return null;
}

export const TASKS = {
  defaultTask, isDueToday, isDoneToday, isStaleOnce, isCompletedOnce, summary, dueToday,
  defaultOpts, normalizeOpts, isRecurring, optsFor, visibleToday, nextEligible, todayVisibility,
  isoToday, isoOf, anchorDate, REPEATS: ['once', 'weekly', 'interval', 'monthly', 'annual'],
};
