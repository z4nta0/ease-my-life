// Picker Cadence — a per-picker gate controlling WHEN a picker surfaces on Today
// and (for display) which UNIT word the ease Soonest/Latest steppers use.
//
//   cadence: 'daily' (default) | 'weekly' | 'monthly' | 'yearly'
//     daily   — surfaces every day (today's original behavior); no anchor.
//     weekly  — surfaces on a chosen weekday (anchorDow: 0=Sun … 6=Sat).
//     monthly — surfaces on a chosen day-of-month (anchorDom: 1–31; clamps to the
//               month's last day for short months, e.g. 31 → Feb 28/29).
//     yearly  — surfaces on a chosen month+day (anchorMonth 1–12, anchorDay 1–31;
//               Feb 29 clamps to Feb 28 in common years).
//
// PERIOD MODEL: each cadence divides the calendar into consecutive periods whose
// boundary is the anchor. The period a date falls in is identified by its START
// date (`periodStart`) — the most recent anchor occurrence on or before the date.
// A picker's pick, once surfaced, persists across days until completed; the next
// anchor opens a fresh period. "Completed this period" = a done pick-log row dated
// on/after the current period's start.
//
// IMPORTANT: charging is per-RUN (done-gated), and a cadence picker runs once per
// period, so the stepper number is PERIODS-until-due in the cadence's own unit —
// NOT calendar days. No day conversion; drift = 100/periods as the engine already
// stores it.
const pad = (n) => String(n).padStart(2, '0');
const isoOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const daysInMonth = (year, month1) => new Date(year, month1, 0).getDate();
const atMidnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const CADENCES = ['daily', 'weekly', 'monthly', 'yearly'];
const isCadence = (c) => CADENCES.includes(c);

// The unit word for a cadence's ease Soonest/Latest steppers.
function unitWord(cadence, n) {
  switch (cadence) {
    case 'weekly':  return n === 1 ? 'week' : 'weeks';
    case 'monthly': return n === 1 ? 'month' : 'months';
    case 'yearly':  return n === 1 ? 'year' : 'years';
    default:        return n === 1 ? 'day' : 'days';
  }
}

// Normalize/default the cadence fields on a picker-like object.
function normalize(p = {}) {
  const now = new Date();
  const cadence = isCadence(p.cadence) ? p.cadence : 'daily';
  return {
    cadence,
    anchorDow: Number.isInteger(p.anchorDow) ? p.anchorDow : now.getDay(),
    anchorDom: Number.isInteger(p.anchorDom) ? p.anchorDom : now.getDate(),
    anchorMonth: Number.isInteger(p.anchorMonth) ? p.anchorMonth : now.getMonth() + 1,
    anchorDay: Number.isInteger(p.anchorDay) ? p.anchorDay : now.getDate(),
  };
}

// Is `date` an anchor day for this picker? (daily → always true.)
function isAnchorDay(picker, date = new Date()) {
  const c = picker.cadence || 'daily';
  if (c === 'daily') return true;
  if (c === 'weekly') return date.getDay() === (picker.anchorDow ?? date.getDay());
  if (c === 'monthly') {
    const target = Math.min(picker.anchorDom ?? 1, daysInMonth(date.getFullYear(), date.getMonth() + 1));
    return date.getDate() === target;
  }
  if (c === 'yearly') {
    const m = picker.anchorMonth ?? 1;
    if (date.getMonth() + 1 !== m) return false;
    const target = Math.min(picker.anchorDay ?? 1, daysInMonth(date.getFullYear(), m));
    return date.getDate() === target;
  }
  return true;
}

// The START date (Date at midnight) of the period `date` falls in — the most
// recent anchor on or before `date`. daily → `date` itself.
function periodStart(picker, date = new Date()) {
  const c = picker.cadence || 'daily';
  const d = atMidnight(date);
  if (c === 'daily') return d;
  if (c === 'weekly') {
    const anchor = picker.anchorDow ?? d.getDay();
    const back = (d.getDay() - anchor + 7) % 7;
    const s = new Date(d); s.setDate(d.getDate() - back); return s;
  }
  if (c === 'monthly') {
    const dom = picker.anchorDom ?? 1;
    // This month's clamped anchor; if we're before it, step to previous month.
    const thisTarget = Math.min(dom, daysInMonth(d.getFullYear(), d.getMonth() + 1));
    if (d.getDate() >= thisTarget) return new Date(d.getFullYear(), d.getMonth(), thisTarget);
    const pm = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    const pTarget = Math.min(dom, daysInMonth(pm.getFullYear(), pm.getMonth() + 1));
    return new Date(pm.getFullYear(), pm.getMonth(), pTarget);
  }
  if (c === 'yearly') {
    const m = (picker.anchorMonth ?? 1) - 1;
    const thisTarget = Math.min(picker.anchorDay ?? 1, daysInMonth(d.getFullYear(), m + 1));
    const thisAnchor = new Date(d.getFullYear(), m, thisTarget);
    if (d >= thisAnchor) return thisAnchor;
    const py = d.getFullYear() - 1;
    const pTarget = Math.min(picker.anchorDay ?? 1, daysInMonth(py, m + 1));
    return new Date(py, m, pTarget);
  }
  return d;
}

// ISO string of the current period's start — the "period key".
function periodKey(picker, date = new Date()) { return isoOf(periodStart(picker, date)); }

// Has an item from this picker been COMPLETED within the current period?
// `pickLog` rows carry { pickerId, date (ISO), done }. Skips/rejects don't count.
function completedThisPeriod(picker, pickLog, date = new Date()) {
  if ((picker.cadence || 'daily') === 'daily') return false; // daily handled by legacy path
  const startIso = periodKey(picker, date);
  return (pickLog || []).some((r) => r.pickerId === picker.id && r.done && r.date >= startIso);
}

// Short human label for a picker's cadence (for chips/summaries).
const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function summary(picker) {
  const c = picker.cadence || 'daily';
  if (c === 'daily') return 'Daily';
  if (c === 'weekly') return 'Weekly · ' + DAY_FULL[picker.anchorDow ?? 0];
  if (c === 'monthly') return 'Monthly · ' + ordinal(picker.anchorDom ?? 1);
  if (c === 'yearly') {
    return 'Yearly · ' + new Date(2001, (picker.anchorMonth ?? 1) - 1, picker.anchorDay ?? 1)
      .toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  return 'Daily';
}
function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Copy for the "?" InfoTip on each cadence, all of it about how the cadence
// interacts with the Days control:
//   daily            — no anchor, so Days is the only day filter (a hint).
//   weekly           — its anchor day is force-selected there (enforceWeeklyDay).
//   monthly/yearly   — an anchor landing on an excluded day is DEFERRED, not
//                      dropped: it surfaces on the next eligible day inside the
//                      same period. The tip makes that silent behavior legible.
// The weekday control is named differently per surface — "Days" in the Data tab,
// "Which days?" in the Pickers create form — so the caller passes its own label
// and the tip names the control the user is actually looking at.
const tipFor = (cadence, daysLabel = 'Days') => {
  switch (cadence || 'daily') {
    case 'weekly':
      return `WARNING: The day you select here will be auto-selected in the ${daysLabel} control below and cannot be deselected.`;
    case 'monthly':
    case 'yearly':
      return `WARNING: If the day that you select here falls on a day that is not selected in the ${daysLabel} control below, the picker will be deferred until the next eligible day.`;
    default:
      return `HINT: You can select which days it will run using the ${daysLabel} control below.`;
  }
};
// Tip shown when the user tries to turn OFF the locked weekly anchor day. The
// control that sets the anchor is named per surface — "How often?" in the Data
// tab, "On which day?" in the Pickers create form — so callers pass their own.
const lockedDayTip = (dow, srcLabel = 'How often?') => `Because you selected ${DAY_FULL[dow] || 'that day'} in the ${srcLabel} control, this day cannot be turned off.`;
// Weekly cadence and daysOfWeek could otherwise contradict each other (anchor
// Monday while Mondays are excluded → every run permanently deferred and every
// label wrong). So a weekly picker's anchor day is always in daysOfWeek. Takes
// a picker-shaped object, returns the corrected daysOfWeek (or the same array
// when nothing needs adding).
function enforceWeeklyDay(picker) {
  const days = Array.isArray(picker && picker.daysOfWeek) ? picker.daysOfWeek : [0, 1, 2, 3, 4, 5, 6];
  if (!picker || (picker.cadence || 'daily') !== 'weekly') return days;
  const dow = Number.isInteger(picker.anchorDow) ? picker.anchorDow : null;
  if (dow === null || days.includes(dow)) return days;
  return [...days, dow].sort((a, b) => a - b);
}

export const CADENCE = {
  CADENCES, isCadence, unitWord, normalize, tipFor, lockedDayTip, enforceWeeklyDay,
  isAnchorDay, periodStart, periodKey, completedThisPeriod, summary,
  isoOf, daysInMonth,
};
