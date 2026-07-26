// Holiday engine — local-compute, offline, no network.
//
// Most public holidays are rule-based: either a fixed calendar date
// (Dec 25), the Nth weekday of a month (Thanksgiving = 4th Thursday of
// November), or the last weekday of a month (Memorial Day = last Monday of
// May). We compute them for any year from a small ruleset, so the app never
// has to phone home and works the same in 2026 or 2046.
//
// Only the United States is supported for now. The shape is country-keyed so
// more regions can be added later without touching callers.
//
// State shape (lives at state.holidays):
//   { country: 'US', disabled: [holidayKey, …], custom: [{ id, name, month, day }] }
//   - disabled : computed holidays the user has switched OFF (won't trigger skip)
//   - custom   : user-added recurring days off, by month (1–12) + day (1–31)

// weekday encoding matches Date.getDay(): Sun=0 … Sat=6.
const MON = 1, THU = 4;

// US federal holidays. `month` is 1-based for readability.
//   fixed: [month, day]
//   nth:   [month, weekday, n]   → the n-th <weekday> of <month>
//   last:  [month, weekday]      → the last <weekday> of <month>
const US_DEFS = [
  { key: 'newyear',      name: "New Year's Day",            fixed: [1, 1] },
  { key: 'mlk',          name: 'Martin Luther King Jr. Day', nth: [1, MON, 3] },
  { key: 'presidents',   name: "Presidents' Day",            nth: [2, MON, 3] },
  { key: 'memorial',     name: 'Memorial Day',              last: [5, MON] },
  { key: 'juneteenth',   name: 'Juneteenth',                fixed: [6, 19] },
  { key: 'independence', name: 'Independence Day',          fixed: [7, 4] },
  { key: 'labor',        name: 'Labor Day',                  nth: [9, MON, 1] },
  { key: 'columbus',     name: 'Columbus Day',               nth: [10, MON, 2] },
  { key: 'veterans',     name: 'Veterans Day',              fixed: [11, 11] },
  { key: 'thanksgiving', name: 'Thanksgiving Day',           nth: [11, THU, 4] },
  { key: 'christmas',    name: 'Christmas Day',             fixed: [12, 25] },
];

const REGIONS = { US: { label: 'United States', defs: US_DEFS } };

const pad = (n) => String(n).padStart(2, '0');
const isoOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// n-th <weekday> of a month, e.g. nthWeekday(2026, 10, MON, 2) → 2nd Monday of Nov.
function nthWeekday(year, month1, weekday, n) {
  const first = new Date(year, month1 - 1, 1);
  const shift = (weekday - first.getDay() + 7) % 7;
  return new Date(year, month1 - 1, 1 + shift + (n - 1) * 7);
}
// last <weekday> of a month.
function lastWeekday(year, month1, weekday) {
  const last = new Date(year, month1, 0); // day 0 of next month = last day of this one
  const shift = (last.getDay() - weekday + 7) % 7;
  return new Date(year, month1 - 1, last.getDate() - shift);
}

function dateForDef(def, year) {
  if (def.fixed) return new Date(year, def.fixed[0] - 1, def.fixed[1]);
  if (def.nth)   return nthWeekday(year, def.nth[0], def.nth[1], def.nth[2]);
  if (def.last)  return lastWeekday(year, def.last[0], def.last[1]);
  return null;
}

// Federal "observed" shift, applied to fixed-date holidays only: a holiday
// landing on Saturday is observed the Friday before; on Sunday, the Monday
// after. Weekday-based holidays (nth / last) never need this.
function observedDate(actual) {
  const wd = actual.getDay();
  if (wd === 6) return new Date(actual.getFullYear(), actual.getMonth(), actual.getDate() - 1);
  if (wd === 0) return new Date(actual.getFullYear(), actual.getMonth(), actual.getDate() + 1);
  return actual;
}

// Every defined holiday for a country in a given year, with resolved dates.
// `date`/`iso` are the OBSERVED day (what people actually get off); `actual`
// is the true calendar date, and `observed` flags when the two differ.
// → [{ key, name, date, iso, actual, observed }]
function computeForYear(year, country = 'US') {
  const region = REGIONS[country] || REGIONS.US;
  return region.defs.map((def) => {
    const actual = dateForDef(def, year);
    const date = def.fixed ? observedDate(actual) : actual;
    return {
      key: def.key, name: def.name,
      date, iso: isoOf(date),
      actual, observed: isoOf(date) !== isoOf(actual),
    };
  });
}

function defaultState() {
  return { country: 'US', disabled: [], custom: [] };
}

// The ACTIVE days off in a year: computed holidays the user hasn't disabled,
// plus their custom recurring days resolved to this year.
function activeForYear(hstate, year) {
  const h = hstate || defaultState();
  const disabled = h.disabled || [];
  const computed = computeForYear(year, h.country)
    .filter((x) => !disabled.includes(x.key))
    .map((x) => ({ ...x, custom: false }));
  const custom = (h.custom || []).map((c) => {
    const date = new Date(year, c.month - 1, c.day);
    return { key: 'custom:' + c.id, name: c.name, date, iso: isoOf(date), custom: true };
  });
  return [...computed, ...custom];
}

// Is `date` an active day off? Returns the holiday name, or null. Checks the
// neighbouring years too, because an observed shift can push a holiday across
// a year boundary (New Year's Day on a Saturday is observed Dec 31 prior).
function holidayOn(hstate, date) {
  const target = isoOf(date);
  const y = date.getFullYear();
  for (const yy of [y - 1, y, y + 1]) {
    const hit = activeForYear(hstate, yy).find((x) => x.iso === target);
    if (hit) return hit.name;
  }
  return null;
}

// Same lookup as holidayOn, but returns the full record — { key, name, date,
// iso, custom } — so callers can tell a built-in holiday from a user-added one
// and word themselves accordingly. Returns null when the date is not a day off.
function holidayInfoOn(hstate, date) {
  const target = isoOf(date);
  const y = date.getFullYear();
  for (const yy of [y - 1, y, y + 1]) {
    const hit = activeForYear(hstate, yy).find((x) => x.iso === target);
    if (hit) return hit;
  }
  return null;
}

// Best-effort region guess from the browser. Only US is wired up today, so
// this is informational — callers fall back to US.
function guessCountry() {
  try {
    const loc = (navigator.language || '').split('-')[1];
    if (loc && REGIONS[loc.toUpperCase()]) return loc.toUpperCase();
  } catch (e) { /* ignore */ }
  return 'US';
}

function regionLabel(country) {
  return (REGIONS[country] || REGIONS.US).label;
}

export const HOLIDAYS = {
  computeForYear, activeForYear, holidayOn, holidayInfoOn,
  defaultState, guessCountry, regionLabel, isoOf,
};
