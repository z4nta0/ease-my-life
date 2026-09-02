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
//   once     — no schedule; due every day (starting `onceDate`,
//              'YYYY-MM-DD', which defaults to today) until completed,
//              then gone. Set onceDate in the future to defer that window
//              instead of starting it immediately.
//   weekly   — due on the chosen weekdays (daysOfWeek: [0=Sun … 6=Sat]),
//              every `interval` weeks (default 1), counted from `anchor`
//   interval — due every N days, counted from `anchor`
//   monthly  — due every `interval` months (default 1), counted from
//              `anchor`, on either a day-of-month (dateMode: 'date',
//              dayOfMonth: 1–31; clamps to month length) or the Nth
//              occurrence of a weekday (dateMode: 'nthWeekday', nthOrdinal:
//              1–5, nthWeekday: 0–6; clamps to the 4th if a requested 5th
//              doesn't occur that month — every month has at least 4 of
//              any given weekday, only a 5th can be missing)
//   annual   — due every `interval` years (default 1), counted from
//              `anchor`, within `month` (1–12), on either a day-of-month
//              (dateMode: 'date', day: 1–31; clamps Feb 29) or the Nth
//              weekday within that month (dateMode: 'nthWeekday', same
//              nthOrdinal/nthWeekday fields and clamp as monthly)
//
// Shape (lives at state.tasks, an array of):
//   { id, name, repeat, daysOfWeek, interval, anchor, dateMode, dayOfMonth,
//     nthOrdinal, nthWeekday, month, day, onceDate, lastDone, createdAt }

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
// Calendar months between an anchor and `date` (ignores day-of-month —
// "every N months" only cares which month index this is, the day itself is
// resolved separately via dayOfMonth/nthWeekday).
const diffMonths = (aIso, date) => {
  const a = fromIso(aIso);
  return (date.getFullYear() - a.getFullYear()) * 12 + (date.getMonth() - a.getMonth());
};
const diffYears = (aIso, date) => date.getFullYear() - fromIso(aIso).getFullYear();
// Every-N-units check shared by weekly/monthly/annual: `n` defaults to 1 (no
// anchor needed — every week/month/year always qualifies, same as before
// this feature existed), and only actually consults the anchor once N > 1.
const everyN = (n, unitsSinceAnchor) => n <= 1 || (unitsSinceAnchor >= 0 && unitsSinceAnchor % n === 0);
// Day-of-month of the Nth (1–5) occurrence of `weekday` (0–6) in
// `year`/`month1` (1–12). Clamps down to the 4th if a requested 5th doesn't
// exist — every month has at least 4 of any weekday (the shortest month is
// 28 days = exactly 4 weeks), so only the 5th can ever be missing, and the
// 4th is always a valid fallback.
function nthWeekdayOfMonth(year, month1, nth, weekday) {
  const firstWeekday = new Date(year, month1 - 1, 1).getDay();
  const firstOccurrence = 1 + ((weekday - firstWeekday + 7) % 7);
  const dim = daysInMonth(year, month1);
  const date = firstOccurrence + (Math.max(1, Math.min(5, nth)) - 1) * 7;
  return date > dim ? date - 7 : date;
}

function defaultTask(p = {}) {
  const now = new Date();
  return {
    id: p.id || 'tk_' + Math.random().toString(36).slice(2, 8),
    name: p.name || '',
    repeat: p.repeat || 'once',
    daysOfWeek: Array.isArray(p.daysOfWeek) ? p.daysOfWeek : [now.getDay()],
    // `interval` is shared by interval/weekly/monthly/annual (each is its
    // own "every N ___"). Only the 'interval' repeat's default is 2 (a
    // deliberately non-1 starting example); every other kind defaults to 1
    // ("every week/month/year", the only behavior any of them had before
    // this field applied to them) — this matters for any caller that
    // constructs a weekly/monthly/annual task directly with no explicit
    // interval (onboarding samples, help-sample-data.js), not just the
    // interactive editor.
    interval: p.interval || (p.repeat === 'interval' ? 2 : 1),
    anchor: p.anchor || isoToday(),
    dateMode: p.dateMode === 'nthWeekday' ? 'nthWeekday' : 'date',
    dayOfMonth: p.dayOfMonth || now.getDate(),
    nthOrdinal: p.nthOrdinal || 1,
    nthWeekday: p.nthWeekday ?? now.getDay(),
    month: p.month || now.getMonth() + 1,
    day: p.day || now.getDate(),
    onceDate: p.onceDate || isoToday(),
    lastDone: p.lastDone ?? null,
    skipUntil: p.skipUntil ?? null,
    createdAt: p.createdAt || isoToday(),
    hidden: !!p.hidden,
    // Set only when created by finishing a mini-tour — links back to the
    // sample template it was built from (see onboarding-checklist.js).
    // Ignored everywhere else in the app.
    ...(p.createdFromSample ? { createdFromSample: p.createdFromSample } : {}),
  };
}

// Is this reminder due on `date`?
function isDueToday(task, date = new Date()) {
  const today = isoOf(date);
  switch (task.repeat) {
    case 'once':
      // Due until completed; the day it's completed it still shows (checked).
      // An optional onceDate defers that window to start on a future date —
      // string comparison is safe here since both sides are 'YYYY-MM-DD'.
      if (task.onceDate && today < task.onceDate) return false;
      return !task.lastDone || task.lastDone === today;
    case 'weekly': {
      if (!(task.daysOfWeek || []).includes(date.getDay())) return false;
      const n = Math.max(1, task.interval || 1);
      // Weeks are counted as rolling 7-day blocks from the anchor, not
      // calendar (Sun–Sat) weeks — every day within the same block counts as
      // the same "week", same non-calendar-aligned convention `interval`
      // (days) already uses.
      return everyN(n, Math.floor(diffDays(task.anchor || task.createdAt, date) / 7));
    }
    case 'interval': {
      const n = Math.max(1, task.interval || 1);
      const delta = diffDays(task.anchor || task.createdAt, date);
      return delta >= 0 && delta % n === 0;
    }
    case 'monthly': {
      const n = Math.max(1, task.interval || 1);
      if (!everyN(n, diffMonths(task.anchor || task.createdAt, date))) return false;
      if (task.dateMode === 'nthWeekday') {
        return date.getDate() === nthWeekdayOfMonth(date.getFullYear(), date.getMonth() + 1, task.nthOrdinal || 1, task.nthWeekday ?? 0);
      }
      const dim = daysInMonth(date.getFullYear(), date.getMonth() + 1);
      const target = Math.min(task.dayOfMonth || 1, dim);
      return date.getDate() === target;
    }
    case 'annual': {
      if (date.getMonth() + 1 !== task.month) return false;
      const n = Math.max(1, task.interval || 1);
      if (!everyN(n, diffYears(task.anchor || task.createdAt, date))) return false;
      if (task.dateMode === 'nthWeekday') {
        return date.getDate() === nthWeekdayOfMonth(date.getFullYear(), task.month, task.nthOrdinal || 1, task.nthWeekday ?? 0);
      }
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
    case 'once': {
      // onceDate defaults to today (defaultTask), so only a genuinely
      // future date changes the label — today-or-past reads as plain
      // "One-time", same as before this control existed.
      if (!task.onceDate || task.onceDate <= isoToday()) return 'One-time';
      const [y, m, d] = task.onceDate.split('-').map(Number);
      const dateLabel = new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `One-time · starts ${dateLabel}`;
    }
    case 'weekly': {
      const d = [...(task.daysOfWeek || [])].sort((a, b) => a - b);
      const n = Math.max(1, task.interval || 1);
      if (n === 1) {
        if (d.length === 0) return 'Weekly';
        if (d.length === 7) return 'Every day';
        if (d.length === 5 && [1, 2, 3, 4, 5].every((x) => d.includes(x))) return 'Every weekday';
        if (d.length === 2 && d.includes(0) && d.includes(6)) return 'Weekends';
        if (d.length === 1) return 'Every ' + DAY_FULL[d[0]];
        return 'Every ' + d.map((x) => DAY_ABBR[x]).join(', ');
      }
      const unit = `Every ${n} weeks`;
      if (d.length === 0) return unit;
      const dayLabel =
        d.length === 7 ? 'every day' :
        (d.length === 5 && [1, 2, 3, 4, 5].every((x) => d.includes(x))) ? 'weekdays' :
        (d.length === 2 && d.includes(0) && d.includes(6)) ? 'weekends' :
        d.length === 1 ? DAY_FULL[d[0]] :
        d.map((x) => DAY_ABBR[x]).join(', ');
      return `${unit} · ${dayLabel}`;
    }
    case 'interval': {
      const n = Math.max(1, task.interval || 1);
      return n === 1 ? 'Every day' : `Every ${n} days`;
    }
    case 'monthly': {
      const n = Math.max(1, task.interval || 1);
      const unit = n === 1 ? 'Monthly' : `Every ${n} months`;
      const dayLabel = task.dateMode === 'nthWeekday'
        ? `${ordinal(task.nthOrdinal || 1)} ${DAY_FULL[task.nthWeekday ?? 0]}`
        : ordinal(task.dayOfMonth || 1);
      return `${unit} · ${dayLabel}`;
    }
    case 'annual': {
      const n = Math.max(1, task.interval || 1);
      const unit = n === 1 ? 'Yearly' : `Every ${n} years`;
      const monthAbbr = new Date(2001, (task.month || 1) - 1, 1).toLocaleDateString('en-US', { month: 'short' });
      const dayLabel = task.dateMode === 'nthWeekday'
        ? `${ordinal(task.nthOrdinal || 1)} ${DAY_ABBR[task.nthWeekday ?? 0]} of ${monthAbbr}`
        : new Date(2001, (task.month || 1) - 1, task.day || 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${unit} · ${dayLabel}`;
    }
    default:
      return '';
  }
}

// Reminders due today, in a stable order (one-time first, then newest-added).
// Hidden reminders (see the store.jsx migrate() comment on the `hidden`
// flag) are excluded here so every downstream consumer — Today, Stats,
// streak reconciliation — never has to filter them out separately.
function dueToday(tasks, date = new Date()) {
  return (tasks || [])
    .filter((t) => !t.hidden && isDueToday(t, date))
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
  // 1100 days (~3 years) comfortably covers the old max (annual, interval 1)
  // but not a large "every N weeks/months/years" — scale the horizon up so a
  // sparse schedule doesn't fail to find its own next occurrence.
  const n = Math.max(1, task.interval || 1);
  // A one-time reminder's onceDate has no upper bound (a plain date picker),
  // so a far-future pick needs its own horizon or nextEligible falsely comes
  // back null — which the caller reads as "this will never show" and shows a
  // scary warning for a perfectly valid future reminder.
  const horizonDays = task.repeat === 'annual' ? n * 366 + 366
    : task.repeat === 'monthly' ? n * 31 + 31
    : task.repeat === 'weekly' ? n * 7 + 7
    : (task.repeat === 'once' && task.onceDate) ? Math.round((fromIso(task.onceDate) - base) / 86400000) + 30
    : 1100;
  const horizon = Math.max(1100, horizonDays);
  for (let i = 1; i <= horizon; i++) {
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
