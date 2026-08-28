import React from 'react';
import { CADENCE } from './cadence.js';
import { useEmlTour } from './onboarding.jsx';
import { MODES } from './seed.js';
import { TASKS } from './tasks.js';
import { Card, Icon, Pill } from './ui.jsx';
import { HelpButton, HelpOverlay } from './help-mode.jsx';
import { STATS_HELP_ITEMS } from './help-content.jsx';
import { unhideHelpStatsHistory, hideHelpStatsHistory } from './help-sample-data.js';

// Stats tab — everything is derived on the fly from the per-pick log
// (state.pickLog), so the picker + range filters apply uniformly to every
// card: heatmap, totals, completion rate, streak, most/least picked, and the
// auto / manual / re-roll source split. Reminders have their own completion
// log (state.reminderLog) and a dedicated "Reminders" scope that swaps the
// dashboard over to reminder-shaped metrics.

// Local calendar day (matches store.isoDay + seedIsoDay).
function statIso(d) {
  const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 10);
}

// Relative label for a completion timestamp. Today intentionally gets no
// special "Today · {time}" case of its own — that was a longer, differently
// shaped string than every other row's "{weekday}, {month} {day}", which
// misaligned the column it sits in; today just falls through to the same
// format as any other day.
function relWhen(iso) {
  const d = new Date(iso);
  const day = TASKS.isoOf(d);
  const yest = TASKS.isoOf(new Date(Date.now() - 86400000));
  if (day === yest) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

const STAT_RANGES = [
  { key: 'week',  label: 'Week',     days: 7   },
  { key: 'month', label: 'Month',    days: 30  },
  { key: '3m',    label: '3 months', days: 90  },
  { key: '6m',    label: '6 months', days: 182 },
  { key: 'year',  label: '1 year',   days: 365 },
  { key: 'all',   label: 'All time', days: Infinity },
];

// How each Today pick came to be — kept on-palette (accent + warm) so the bar
// reads as one family rather than a random spectrum.
const SOURCE_META = [
  { key: 'auto',   label: 'Auto-generated', color: 'var(--accent)' },
  { key: 'reroll', label: 'Re-rolled',      color: 'oklch(from var(--accent) calc(l + 0.22) calc(c - 0.05) h)' },
  { key: 'manual', label: 'Hand-picked',    color: 'var(--warm)' },
];
const TYPE_META = [
  { key: 'recurring', label: 'Recurring', color: 'var(--accent)' },
  { key: 'once',      label: 'One-time',  color: 'var(--warm)' },
];

// Count → heat level for reminder days (no "possible" denominator like picks,
// so it's a raw volume scale).
function countLevel(n) { return n <= 0 ? 0 : n >= 4 ? 4 : n; }

// Stacked proportion bar + legend. Used for the pick-source split and the
// reminder one-time/recurring split.
function BreakdownBar({ title, total, segments, empty, className = '' }) {
  return (
    <Card className={className}>
      <div className="kicker">{title}</div>
      {total > 0 ? (
        <div className="bd">
          <div className="bd-bar">
            {segments.filter((s) => s.n > 0).map((s) => (
              <span key={s.key} className="bd-seg"
                    style={{ width: `${(s.n / total) * 100}%`, background: s.color }}
                    title={`${s.label}: ${s.n}`} />
            ))}
          </div>
          <ul className="bd-legend">
            {segments.map((s) => (
              <li key={s.key}>
                <span className="bd-dot" style={{ background: s.color }} />
                <span className="bd-label">{s.label}</span>
                <span className="bd-val">{s.n}</span>
                <span className="bd-pct">{total ? Math.round((s.n / total) * 100) : 0}%</span>
              </li>
            ))}
          </ul>
        </div>
      ) : <div className="stat-empty">{empty}</div>}
    </Card>
  );
}

function HeatLegend() {
  return (
    <div className="heat-legend">
      <span>less</span>
      <i className="heat-cell heat-0" />
      <i className="heat-cell heat-1" />
      <i className="heat-cell heat-2" />
      <i className="heat-cell heat-3" />
      <i className="heat-cell heat-4" />
      <span>more</span>
    </div>
  );
}

// Reusable Gmail-style range pager: "1–10 of N  ‹ ›". Hides itself when the
// whole list fits on one page. `page` is 0-indexed; `onChange(nextPage)` fires
// on arrow taps. Callers own clamping/reset of `page` when the list changes.
function Pager({ page, pageSize, total, onChange, unit = 'items', alwaysShow = false }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  if (total <= pageSize && !alwaysShow) return null;
  const start = total === 0 ? 0 : page * pageSize + 1;
  const end = Math.min(total, (page + 1) * pageSize);
  return (
    <div className="pager">
      <span className="pager-range">
        {start}–{end} <span className="pager-of">of</span> {total}{unit ? ` ${unit}` : ''}
      </span>
      <div className="pager-arrows">
        <button type="button" className="pager-arrow" aria-label="Previous page"
                disabled={page <= 0} onClick={() => onChange(page - 1)}>‹</button>
        <button type="button" className="pager-arrow" aria-label="Next page"
                disabled={page >= pageCount - 1} onClick={() => onChange(page + 1)}>›</button>
      </div>
    </div>
  );
}

function TabStats({ state, actions, onHome, onNavTab }) {
  // Welcome Tour: reserves top-space above the page content when its own
  // coach card doesn't fit above/below the highlighted area — see the
  // reserve-space effect in onboarding.jsx (same mechanism as the Pickers tab).
  const tour = useEmlTour ? useEmlTour() : { reserveTop: 0 };
  // Help mode (see help-mode.jsx) — nothing here is editable, so unlike
  // Pickers/Data this doesn't seed a disposable copy: it borrows the REAL
  // hidden sample pickers directly (same reasoning as the page tour's own
  // unhideSampleHistory) so the heatmap/breakdown have genuine history to
  // show, and hides them again once help mode turns off.
  const [helpOn, setHelpOn] = React.useState(false);
  const helpExit = React.useCallback(() => setHelpOn(false), []);
  // Skipped while the Stats PAGE TOUR owns these same real samples (see
  // onboarding-page-tours.jsx's unhideSampleHistory) — this effect also
  // runs on mount (helpOn starts false), and without this guard it would
  // immediately re-hide the samples the instant the tour navigates onto
  // this page, right after the tour's own Step 1 just unhid them. Confirmed
  // as the cause of the Stats page tour going dim-with-nothing-then-ending:
  // the group filter's own `existingGroups.length > 1` never got the
  // chance to see any unhidden pickers before this ran the samples back to
  // hidden.
  const statsTourActive = !!(state.onboarding && state.onboarding.activeTour
    && state.onboarding.activeTour.id === 'page-explore_stats');
  React.useEffect(() => {
    if (statsTourActive) return;
    if (helpOn) unhideHelpStatsHistory(state, actions);
    else hideHelpStatsHistory(actions);
  }, [helpOn, statsTourActive]);
  React.useEffect(() => () => hideHelpStatsHistory(actions), []);
  // scope: 'all' | <pickerId> | 'reminders'
  const [scope, setScope] = React.useState('all');
  const [range, setRange] = React.useState('all');
  // Sort direction for the single-picker "Pick breakdown" list (shared across
  // all metric pills).
  const [sortDir, setSortDir] = React.useState('desc');
  // Which per-item metric the Pick breakdown shows: count | freq | auto |
  // manual | rejected (and 'spent' substitutes for 'freq' on ease-down).
  const [metric, setMetric] = React.useState('count');
  // Unit for the "Last picked" metric: calendar days vs the picker's eligible
  // (run) days — toggled inline in that metric's explanation.
  const [lastMode, setLastMode] = React.useState('calendar');
  // Same calendar/eligible toggle for the "Frequency" metric's average gap.
  const [freqMode, setFreqMode] = React.useState('eligible');
  // And for the ease-down "Spent" metric.
  const [spentMode, setSpentMode] = React.useState('eligible');
  // Count denominator mode: 'total' (share of all picks, sums 100%) vs
  // 'eligible' (share of picks while the item was not on vacation).
  const [countMode, setCountMode] = React.useState('total');
  // Reminders "Reminders breakdown" card: which metric (completions | skipped),
  // sort direction, and current pager page (0-indexed).
  const [remBdMetric, setRemBdMetric] = React.useState('recent');
  const [remBdSort, setRemBdSort] = React.useState('desc');
  const [remPage, setRemPage] = React.useState(0);
  // Conditionals scope breakdown: which metric the list pivots on + sort dir.
  const [condMetric, setCondMetric] = React.useState('rate');
  const [condSort, setCondSort] = React.useState('desc');
  // Heatmap: the day cell the user tapped (its detail shows below the grid).
  // Hover still uses the native title tooltip; tap drives this for touch.
  const [heatSel, setHeatSel] = React.useState(null);
  // Heatmap year pager — only used when "All time" spans multiple calendar
  // years (keeps the grid bounded to one year at a time). null = latest year.
  const [heatYear, setHeatYear] = React.useState(null);
  // Direction of the last year-page change ('next' | 'prev') so the grid can
  // slide in from the matching side. Cleared to '' on any non-paging change.
  const [heatDir, setHeatDir] = React.useState('');

  const rangeDef = STAT_RANGES.find((r) => r.key === range) || STAT_RANGES[5];
  const rangeNoun = range === 'all' ? 'all time' : `the last ${rangeDef.label.toLowerCase()}`;
  const rangeKicker = range === 'all' ? 'All time' : `Last ${rangeDef.label.toLowerCase()}`;

  const today = React.useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);
  const todayIso = statIso(today);
  const cutoffIso = React.useMemo(() => {
    if (rangeDef.days === Infinity) return null;
    const c = new Date(today); c.setDate(today.getDate() - (rangeDef.days - 1));
    return statIso(c);
  }, [rangeDef, today]);

  const log = state.pickLog || [];
  const pickers = state.pickers || [];
  // Hidden pickers/tasks (see store.jsx's `hidden` flag) keep their history
  // rows in pickLog/reminderLog/reminderSkipLog — nothing here is deleted —
  // but every rollup below excludes them by id so the numbers reflect only
  // what's currently visible, same as Today/Pickers/Data.
  const hiddenPickerIds = React.useMemo(() => (
    new Set(pickers.filter((p) => p.hidden).map((p) => p.id))
  ), [pickers]);
  const hiddenTaskIds = React.useMemo(() => (
    new Set((state.tasks || []).filter((t) => t.hidden).map((t) => t.id))
  ), [state.tasks]);

  // ── Conditionals: definitions + trigger history, summarized per conditional.
  const conditionalDefs = state.conditionals || [];
  const conditionalLog = state.conditionalLog || [];
  const hasConditionals = conditionalDefs.length > 0 || conditionalLog.length > 0;
  const isConditionals = scope === 'conditionals';
  const condStats = React.useMemo(() => {
    const rows = conditionalLog.filter((r) => !cutoffIso || r.date >= cutoffIso);
    const byId = new Map();
    for (const d of conditionalDefs) byId.set(d.id, {
      id: d.id, name: d.name, mode: d.mode, deleted: false,
      value: d.value ?? 0, threshold: d.threshold ?? 100, oddsPct: d.oddsPct ?? 50,
      easeMin: d.easeMin ?? 7, easeMax: d.easeMax ?? 14,
      active: d.active !== false, total: 0, fired: 0, lastFired: null, fireDates: [],
    });
    for (const r of rows) {
      let o = byId.get(r.condId);
      if (!o) { o = { id: r.condId, name: r.name || 'Deleted conditional', mode: r.mode, deleted: true, total: 0, fired: 0, lastFired: null, fireDates: [] }; byId.set(r.condId, o); }
      o.total++;
      if (r.triggered) { o.fired++; o.fireDates.push(r.date); if (!o.lastFired || r.date > o.lastFired) o.lastFired = r.date; }
    }
    for (const o of byId.values()) {
      if (o.fireDates.length >= 2) {
        const ds = o.fireDates.slice().sort();
        let sum = 0;
        for (let i = 1; i < ds.length; i++) sum += (new Date(ds[i]) - new Date(ds[i - 1])) / 86400000;
        o.avgInterval = Math.round(sum / (ds.length - 1));
      } else o.avgInterval = null;
      o.rate = o.total ? Math.round((o.fired / o.total) * 100) : null;
      // Configured trigger probability, where the mode has one.
      o.configured = o.mode === 'random' ? 50
        : (o.mode === 'weighted' || o.mode === 'dynamic') ? (o.oddsPct ?? 50) : null;
    }
    const out = [];
    for (const d of conditionalDefs) out.push(byId.get(d.id));
    for (const o of byId.values()) if (o.deleted) out.push(o);
    return out;
  }, [conditionalDefs, conditionalLog, cutoffIso]);
  const condTotals = React.useMemo(() => {
    const total = condStats.reduce((a, o) => a + o.total, 0);
    const fired = condStats.reduce((a, o) => a + o.fired, 0);
    const lastFired = condStats.reduce((m, o) => (o.lastFired && (!m || o.lastFired > m)) ? o.lastFired : m, null);
    return { total, fired, rate: total ? Math.round((fired / total) * 100) : 0, lastFired };
  }, [condStats]);
  // Conditionals breakdown list, sorted by the active metric. Null metric values
  // (no rate / no interval / never fired) always sink to the bottom.
  const condBreakdown = React.useMemo(() => {
    const val = (o) => condMetric === 'triggers' ? o.fired
      : condMetric === 'cycles' ? o.total
      : condMetric === 'interval' ? o.avgInterval
      : condMetric === 'last' ? (o.lastFired ? new Date(o.lastFired).getTime() : null)
      : o.rate; // 'rate'
    const dir = condSort === 'desc' ? 1 : -1;
    return condStats.slice().sort((a, b) => {
      const av = val(a), bv = val(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;   // nulls last regardless of dir
      if (bv == null) return -1;
      return (bv - av) * dir;
    });
  }, [condStats, condMetric, condSort]);

  // Distinct group names in first-seen order — drive the group selector that
  // narrows the "Show" picker row below it (mirrors the Pickers tab).
  const existingGroups = React.useMemo(() => {
    const seen = [];
    for (const p of pickers) if (p.group && !p.hidden && !seen.includes(p.group)) seen.push(p.group);
    return seen;
  }, [pickers]);
  // statGroup only scopes which pickers appear in the Show row; it never filters
  // the stats itself. 'all' also lets the All + Reminders options show. Hidden
  // pickers (see store.jsx's `hidden` flag) never appear here.
  const [statGroup, setStatGroup] = React.useState('all');
  const visiblePickers = React.useMemo(() => (
    pickers.filter((p) => !p.hidden && (statGroup === 'all' || p.group === statGroup))
  ), [pickers, statGroup]);

  // Which reminder types opt into Stats. If none, the Reminders scope is hidden.
  const opts = TASKS.normalizeOpts(state.reminderOpts);
  const enabledTypes = ['once', 'recurring'].filter((t) => opts[t].stats);
  const remEnabled = enabledTypes.length > 0;

  // Don't strand the view on a Reminders scope that's just been turned off.
  React.useEffect(() => {
    if (scope === 'reminders' && !remEnabled) setScope('all');
  }, [scope, remEnabled]);
  // Same for a Conditionals scope once all conditionals are gone.
  React.useEffect(() => {
    if (scope === 'conditionals' && !hasConditionals) setScope('all');
  }, [scope, hasConditionals]);

  // Keep scope coherent with the group filter: within a specific group, All /
  // Reminders aren't offered, so if the current scope isn't one of the group's
  // pickers, fall back to the first picker in the list.
  React.useEffect(() => {
    if (statGroup === 'all') return;
    if (!visiblePickers.some((p) => p.id === scope)) {
      setScope(visiblePickers[0] ? visiblePickers[0].id : 'all');
    }
  }, [statGroup, visiblePickers, scope]);

  const isReminders = scope === 'reminders';

  // Scroll-edge fades on the filter pill rows — same affordance as the Pickers
  // tab strip: a mask gradient that only fades the side with more content.
  const scopeRef = React.useRef(null);
  const groupsRef = React.useRef(null);
  const rangeRef = React.useRef(null);
  const metricsRef = React.useRef(null);
  const remMetricsRef = React.useRef(null);
  const condMetricsRef = React.useRef(null);
  React.useEffect(() => {
    const els = [scopeRef.current, groupsRef.current, rangeRef.current, metricsRef.current, remMetricsRef.current, condMetricsRef.current].filter(Boolean);
    const cleanups = els.map((el) => {
      const update = () => {
        const scrollable = el.scrollWidth - el.clientWidth > 1;
        const atStart = !scrollable || el.scrollLeft <= 1;
        const atEnd = !scrollable || el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
        el.classList.toggle('at-start', atStart);
        el.classList.toggle('at-end', atEnd);
      };
      update();
      el.addEventListener('scroll', update, { passive: true });
      const ro = new ResizeObserver(update);
      ro.observe(el);
      return () => { el.removeEventListener('scroll', update); ro.disconnect(); };
    });
    return () => cleanups.forEach((c) => c());
  }, [pickers.length, remEnabled, scope, metric, remBdMetric, condMetric, isConditionals, isReminders, statGroup, visiblePickers.length]);

  // ── Pick rows for the active scope ('all' or a single picker) ─────────────
  // Active picks only — rejected (re-rolled-away) and skipped rows are excluded
  // here so they never touch completion, totals, rankings, or the heatmap.
  const rows = React.useMemo(() => {
    if (isReminders) return [];
    return log.filter((r) =>
      !r.outcome &&
      !hiddenPickerIds.has(r.pickerId) &&
      (scope === 'all' || r.pickerId === scope) &&
      (!cutoffIso || r.date >= cutoffIso));
  }, [log, scope, cutoffIso, isReminders, hiddenPickerIds]);

  // Per-item count of re-rolled-away (rejected) rows, range + scope aware.
  const rejectedById = React.useMemo(() => {
    const m = new Map();
    if (isReminders) return m;
    for (const r of log) {
      if (r.outcome !== 'rejected') continue;
      if (hiddenPickerIds.has(r.pickerId)) continue;
      if (scope !== 'all' && r.pickerId !== scope) continue;
      if (cutoffIso && r.date < cutoffIso) continue;
      m.set(r.itemId, (m.get(r.itemId) || 0) + 1);
    }
    return m;
  }, [log, scope, cutoffIso, isReminders, hiddenPickerIds]);

  // Per-item count of skipped rows, range + scope aware.
  const skippedById = React.useMemo(() => {
    const m = new Map();
    if (isReminders) return m;
    for (const r of log) {
      if (r.outcome !== 'skipped') continue;
      if (hiddenPickerIds.has(r.pickerId)) continue;
      if (scope !== 'all' && r.pickerId !== scope) continue;
      if (cutoffIso && r.date < cutoffIso) continue;
      m.set(r.itemId, (m.get(r.itemId) || 0) + 1);
    }
    return m;
  }, [log, scope, cutoffIso, isReminders, hiddenPickerIds]);

  // ── Reminder rows for the active range ────────────────────────────────────
  const remRows = React.useMemo(() => (
    (state.reminderLog || [])
      .filter((r) => enabledTypes.includes(r.type))
      .filter((r) => !hiddenTaskIds.has(r.taskId))
      .filter((r) => !cutoffIso || statIso(new Date(r.completedAt)) >= cutoffIso)
  ), [state.reminderLog, enabledTypes.join(','), cutoffIso, hiddenTaskIds]);

  // Per-day aggregation. Picks → { done, total, items:[{name,done}] };
  // reminders → { done:count, total:count, items:[names] }.
  const byDay = React.useMemo(() => {
    const m = new Map();
    if (isReminders) {
      for (const r of remRows) {
        const k = statIso(new Date(r.completedAt));
        const e = m.get(k) || { done: 0, total: 0, items: [] };
        e.done++; e.total++; e.items.push({ name: r.name || 'Reminder', done: true }); m.set(k, e);
      }
    } else {
      for (const r of rows) {
        const e = m.get(r.date) || { done: 0, total: 0, items: [] };
        e.total++; if (r.done) e.done++;
        e.items.push({ name: r.itemName, done: !!r.done });
        m.set(r.date, e);
      }
    }
    return m;
  }, [rows, remRows, isReminders]);

  const totalDone = isReminders ? remRows.length : rows.reduce((a, r) => a + (r.done ? 1 : 0), 0);
  const totalPossible = rows.length;
  const rate = Math.round((totalDone / Math.max(1, totalPossible)) * 100);
  const activeDays = byDay.size;
  const fullDays = [...byDay.values()].filter((d) => d.total > 0 && d.done === d.total).length;
  const weekAgo = Date.now() - 7 * 86400000;
  const remWeek = remRows.filter((r) => new Date(r.completedAt).getTime() >= weekAgo).length;
  const busiest = [...byDay.values()].reduce((m, d) => Math.max(m, d.done), 0);

  // Streak — consecutive days (ending today) with at least one done. An empty
  // today doesn't break it (the day isn't over); a day with activity but none
  // done does.
  const streak = React.useMemo(() => {
    let n = 0;
    const d = new Date(today);
    if (!byDay.get(todayIso)) d.setDate(d.getDate() - 1);
    for (;;) {
      const e = byDay.get(statIso(d));
      if (e && e.done > 0) { n++; d.setDate(d.getDate() - 1); } else break;
    }
    return n;
  }, [byDay, today, todayIso]);

  // ── Heatmap: flat chronological run of fixed-size day cells. Wraps to as
  // many rows as the range needs (taller, never wider). For "All time" that
  // spans >1 calendar year, a year pager clamps the grid to one year at a time.
  const dataYears = React.useMemo(() => {
    const keys = [...byDay.keys()];
    if (!keys.length) return [today.getFullYear()];
    const minY = +keys.reduce((m, k) => (k < m ? k : m), keys[0]).slice(0, 4);
    const maxY = today.getFullYear();
    const out = [];
    for (let y = minY; y <= maxY; y++) out.push(y);
    return out;
  }, [byDay, today]);
  const yearPaging = range === 'all' && dataYears.length > 1;
  // Clamp the (possibly stale) selected year to what's available; default latest.
  const activeYear = yearPaging
    ? (dataYears.includes(heatYear) ? heatYear : dataYears[dataYears.length - 1])
    : null;

  const heatDays = React.useMemo(() => {
    let startIso = cutoffIso;
    if (!startIso) {
      const keys = [...byDay.keys()];
      startIso = keys.length ? keys.reduce((m, k) => (k < m ? k : m), keys[0]) : todayIso;
    }
    let endIso = todayIso;
    if (activeYear != null) {
      const yStart = `${activeYear}-01-01`;
      const yEnd = `${activeYear}-12-31`;
      if (startIso < yStart) startIso = yStart;   // clamp up to Jan 1 of the year
      endIso = yEnd < todayIso ? yEnd : todayIso; // current year caps at today
    }
    const start = new Date(startIso + 'T00:00:00');
    const out = [];
    for (let d = new Date(start); statIso(d) <= endIso; d.setDate(d.getDate() + 1)) {
      const k = statIso(d);
      out.push({ date: k, ...(byDay.get(k) || { done: 0, total: 0, items: [] }) });
    }
    return out;
  }, [byDay, cutoffIso, todayIso, activeYear]);

  // ── Rankings (picks only) ─────────────────────────────────────────────────
  const countById = React.useMemo(() => {
    const m = new Map();
    for (const r of rows) {
      const e = m.get(r.itemId) || { name: r.itemName, n: 0, auto: 0, manual: 0, reroll: 0 };
      e.n++; e.name = r.itemName;
      if (e[r.source] !== undefined) e[r.source]++;
      m.set(r.itemId, e);
    }
    return m;
  }, [rows]);

  const top = React.useMemo(() => (
    [...countById.values()].filter((x) => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 5)
  ), [countById]);

  const cold = React.useMemo(() => {
    const items = (state.items || []).filter((it) =>
      !hiddenPickerIds.has(it.pickerId) && (scope === 'all' || it.pickerId === scope) && !it.vacation);
    return items
      .map((it) => ({ name: it.name, n: (countById.get(it.id) || {}).n || 0 }))
      .sort((a, b) => a.n - b.n || a.name.localeCompare(b.name))
      .slice(0, 5);
  }, [state.items, scope, countById, hiddenPickerIds]);

  // Single-picker breakdown — EVERY item in the picker (incl. zero-pick and
  // vacation), with all per-item metrics on one object. The "Pick breakdown"
  // card pivots on `metric` to choose which value to show + sort by.
  const isPicker = scope !== 'all' && !isReminders && !isConditionals;
  const pickerObj = pickers.find((p) => p.id === scope);
  const isEaseDown = isPicker && pickerObj && pickerObj.mode === 'ease-down';
  const isEaseUp = isPicker && pickerObj && pickerObj.mode === 'ease-up';
  const usesWeight = isPicker && pickerObj && (pickerObj.mode === 'weighted' || pickerObj.mode === 'dynamic');
  const THRESHOLD = 100;

  // Vacation replay from the event log: onAt(item, date) = was it on vacation
  // that day; onAfter(item, date) = did an 'on' transition happen after `date`.
  const vac = React.useMemo(() => {
    const byItem = new Map();
    for (const r of (state.vacationLog || [])) {
      if (!byItem.has(r.itemId)) byItem.set(r.itemId, []);
      byItem.get(r.itemId).push(r);
    }
    for (const arr of byItem.values()) arr.sort((a, b) => (a.date < b.date ? -1 : 1));
    const onAt = (itemId, iso) => {
      const arr = byItem.get(itemId);
      if (!arr) return false;
      let on = false;
      for (const e of arr) { if (e.date <= iso) on = e.on; else break; }
      return on;
    };
    const onAfter = (itemId, iso) => {
      const arr = byItem.get(itemId);
      return !!arr && arr.some((e) => e.on && e.date > iso);
    };
    return { onAt, onAfter };
  }, [state.vacationLog]);

  // Picker run days in range (distinct active-pick dates).
  const activeDates = React.useMemo(() => [...new Set(rows.map((r) => r.date))].sort(), [rows]);

  // Eligible-day gap per item (used by the Frequency metric). The eligible index
  // is per-item: picker run days MINUS that item's vacation days, so a vacation
  // stretch can't inflate the gap. Calendar gap stays literal wall-clock time.
  const freqById = React.useMemo(() => {
    const m = new Map();
    if (!isPicker || isEaseDown) return m;
    const datesByItem = new Map();
    for (const r of rows) {
      if (!datesByItem.has(r.itemId)) datesByItem.set(r.itemId, new Set());
      datesByItem.get(r.itemId).add(r.date);
    }
    for (const [id, set] of datesByItem) {
      const dates = [...set].sort();
      const eligDates = activeDates.filter((d) => !vac.onAt(id, d));
      const idxOf = new Map(eligDates.map((d, i) => [d, i]));
      let avgGapElig = null, avgGapCal = null;
      if (dates.length >= 2) {
        let sumE = 0, sumC = 0;
        for (let i = 1; i < dates.length; i++) {
          sumE += (idxOf.get(dates[i]) ?? 0) - (idxOf.get(dates[i - 1]) ?? 0);
          sumC += Math.round((new Date(dates[i]) - new Date(dates[i - 1])) / 86400000);
        }
        avgGapElig = sumE / (dates.length - 1);
        avgGapCal = sumC / (dates.length - 1);
      }
      m.set(id, { avgGapElig, avgGapCal, count: dates.length });
    }
    return m;
  }, [isPicker, isEaseDown, rows, activeDates, vac]);

  // Ease-down "Spent" — measured from ACTUAL history: the average length of a
  // completed depletion streak (consecutive runs of the same active item that
  // ended when its charge hit 0, flagged depletedEnd). Abandoned streaks (re-
  // roll / vacation / manual) never reach 0, so they're excluded — which is why
  // recharging an abandoned item can't skew this. elig = runs; cal = calendar
  // days spanned. null when the item has no completed cycle in range.
  const spentById = React.useMemo(() => {
    const m = new Map();
    if (!isEaseDown) return m;
    const dayInfo = new Map(); // date -> { itemId, depletedEnd }
    for (const r of rows) dayInfo.set(r.date, { itemId: r.itemId, depletedEnd: !!r.depletedEnd });
    const dates = [...dayInfo.keys()].sort();
    const streaksByItem = new Map();
    let i = 0;
    while (i < dates.length) {
      const item = dayInfo.get(dates[i]).itemId;
      let j = i;
      while (j + 1 < dates.length && dayInfo.get(dates[j + 1]).itemId === item) j++;
      if (dayInfo.get(dates[j]).depletedEnd) { // completed cycle only
        const runs = j - i + 1;
        const calDays = Math.round((new Date(dates[j]) - new Date(dates[i])) / 86400000) + 1;
        if (!streaksByItem.has(item)) streaksByItem.set(item, []);
        streaksByItem.get(item).push({ runs, calDays });
      }
      i = j + 1;
    }
    for (const [id, arr] of streaksByItem) {
      if (!arr.length) continue;
      m.set(id, {
        elig: arr.reduce((a, s) => a + s.runs, 0) / arr.length,
        cal: arr.reduce((a, s) => a + s.calDays, 0) / arr.length,
        cycles: arr.length,
      });
    }
    return m;
  }, [isEaseDown, rows]);

  // Most-recent active pick date per item (used by the "Last picked" metric).
  // Range + scope aware via `rows`; rejected rows are already excluded there.
  const lastById = React.useMemo(() => {
    const m = new Map();
    for (const r of rows) {
      const prev = m.get(r.itemId);
      if (!prev || r.date > prev) m.set(r.itemId, r.date);
    }
    return m;
  }, [rows]);

  // One row per item with every metric attached. Includes "ghost" items —
  // ones that were deleted from the picker but still have history in the log for
  // the active range — so the breakdown totals stay consistent with the
  // aggregate cards. Ghosts are flagged `deleted` and labelled in the UI.
  const perItem = React.useMemo(() => {
    if (!isPicker) return [];
    const live = (state.items || []).filter((it) => it.pickerId === scope);
    const liveIds = new Set(live.map((it) => it.id));
    // Deleted-but-logged items: any itemId in this scope's log (within range)
    // that no longer exists live. Name comes from the log's denormalized label.
    const ghostNames = new Map();
    for (const r of (log || [])) {
      if (scope !== 'all' && r.pickerId !== scope) continue;
      if (cutoffIso && r.date < cutoffIso) continue;
      if (!liveIds.has(r.itemId)) ghostNames.set(r.itemId, r.itemName || '(deleted item)');
    }
    const ghosts = [...ghostNames].map(([id, name]) =>
      ({ id, name, pickerId: scope, vacation: false, __deleted: true }));
    const items = [...live, ...ghosts];
    return items.map((it) => {
      const c = countById.get(it.id) || { n: 0, auto: 0, manual: 0, reroll: 0 };
      const f = freqById.get(it.id) || { avgGapElig: null, avgGapCal: null, count: 0 };
      const avgGap = freqMode === 'calendar' ? f.avgGapCal : f.avgGapElig;
      const lastIso = lastById.get(it.id) || null;
      // Calendar days ago vs eligible days ago; eligible excludes days the
      // picker didn't run AND days this item was on vacation.
      const lastCal = lastIso ? Math.round((new Date(todayIso) - new Date(lastIso)) / 86400000) : null;
      const eligDates = activeDates.filter((d) => !vac.onAt(it.id, d));
      const eligIdx = eligDates.indexOf(lastIso);
      const lastElig = (lastIso != null && eligIdx >= 0) ? (eligDates.length - 1 - eligIdx) : null;
      const lastDays = lastMode === 'eligible' ? lastElig : lastCal;
      // Count denominator: total picks vs picks made while this item was eligible.
      const eligDenom = rows.reduce((a, r) => a + (vac.onAt(it.id, r.date) ? 0 : 1), 0);
      // Label: not currently on vacation, but went on vacation after its last
      // pick and hasn't been picked since returning. (Never for deleted items.)
      const wasOnVac = !it.__deleted && !it.vacation && vac.onAfter(it.id, lastIso || '');
      return {
        id: it.id, name: it.name, vacation: !!it.vacation, wasOnVac, deleted: !!it.__deleted,
        n: c.n, auto: c.auto, manual: c.manual,
        rejected: rejectedById.get(it.id) || 0,
        skipped: skippedById.get(it.id) || 0,
        eligDenom,
        avgGap, freqCount: f.count,
        spent: (() => {
          const sp = spentById.get(it.id);
          if (!sp) return null;
          return spentMode === 'calendar' ? sp.cal : sp.elig;
        })(),
        lastDays,
      };
    });
  }, [isPicker, state.items, scope, log, cutoffIso, countById, freqById, rejectedById, skippedById, spentById, lastById, activeDates, vac, rows, lastMode, freqMode, spentMode, todayIso]);

  // Active metric for ease-down swaps Frequency → Spent. Guard against a stale
  // 'spent'/'freq' selection when switching picker modes.
  const freqMetricKey = isEaseDown ? 'spent' : 'freq';
  const effMetric = (metric === 'freq' || metric === 'spent') ? freqMetricKey : metric;

  // Sort perItem by the active metric + direction. Frequency and Last-picked
  // pin their "no data" rows (never-picked) to the bottom.
  const breakdown = React.useMemo(() => {
    const dir = sortDir === 'desc' ? -1 : 1;
    const list = perItem.slice();
    if (effMetric === 'freq') {
      list.sort((a, b) => {
        if (a.avgGap == null && b.avgGap == null) return (b.freqCount - a.freqCount) || a.name.localeCompare(b.name);
        if (a.avgGap == null) return 1;
        if (b.avgGap == null) return -1;
        return dir * (a.avgGap - b.avgGap) || a.name.localeCompare(b.name);
      });
    } else if (effMetric === 'last') {
      list.sort((a, b) => {
        if (a.lastDays == null && b.lastDays == null) return a.name.localeCompare(b.name);
        if (a.lastDays == null) return 1;
        if (b.lastDays == null) return -1;
        return dir * (a.lastDays - b.lastDays) || a.name.localeCompare(b.name);
      });
    } else if (effMetric === 'spent') {
      // Pin items with no completed cycle to the bottom either way.
      list.sort((a, b) => {
        if (a.spent == null && b.spent == null) return a.name.localeCompare(b.name);
        if (a.spent == null) return 1;
        if (b.spent == null) return -1;
        return dir * (a.spent - b.spent) || a.name.localeCompare(b.name);
      });
    } else {
      const val = (x) => effMetric === 'auto' ? x.auto
        : effMetric === 'manual' ? x.manual
        : effMetric === 'rejected' ? x.rejected
        : effMetric === 'skipped' ? x.skipped
        : x.n;
      list.sort((a, b) => dir * (val(a) - val(b)) || a.name.localeCompare(b.name));
    }
    return list;
  }, [perItem, effMetric, sortDir]);

  // Cadence-aware unit words. A cadence picker runs once per period, so its
  // "eligible" (run-count) values ARE period counts — relabel days→week/month/
  // year in eligible mode. Calendar mode always stays in literal days.
  const statCadence = (pickerObj && pickerObj.cadence) || 'daily';
  const cadenced = statCadence !== 'daily';
  // Approx wall-clock days per cadence period — used to express CALENDAR-mode
  // day-counts in the picker's cadence unit (eligible-mode values are already
  // period counts and need no conversion).
  const PER_DAYS = { weekly: 7, monthly: 30, yearly: 365 };
  const per = PER_DAYS[statCadence] || 1;
  const unitFor = (mode, n) => cadenced
    ? CADENCE.unitWord(statCadence, n)
    : (n === 1 ? 'day' : 'days');
  // Plural unit word for the eligible-mode toggle labels (weeks/months/years).
  const eligUnit = cadenced ? CADENCE.unitWord(statCadence, 2) : 'days';
  // Toggle-button label for calendar mode (relabelled to the cadence unit).
  const calUnitLabel = cadenced ? `calendar ${eligUnit}` : 'calendar days';
  // Format a raw day-count metric for the value column. Cadence pickers convert
  // calendar days→periods and ALWAYS show one decimal (forced ".0") so eligible
  // and calendar line up; daily pickers keep their existing whole-day display
  // via `dailyNum`. Returns { num (string), word }.
  const cadDisplay = (rawDays, mode, dailyNum) => {
    if (!cadenced) return { num: String(dailyNum), word: (dailyNum === 1 ? 'day' : 'days') };
    const p = mode === 'calendar' ? rawDays / per : rawDays;
    return { num: (Math.round(p * 10) / 10).toFixed(1), word: CADENCE.unitWord(statCadence, p) };
  };

  // Human label for "last picked", in the active unit.
  const fmtLast = (d, mode) => {
    if (mode === 'eligible') {
      if (d === 0) return 'Most recent pick';
      if (cadenced) return `${(Math.round(d * 10) / 10).toFixed(1)} ${CADENCE.unitWord(statCadence, d)} ago`;
      return `${d} ${unitFor('eligible', d)} ago`;
    }
    if (d === 0) return 'Most recent pick';
    if (cadenced) { const p = d / per; return `${(Math.round(p * 10) / 10).toFixed(1)} ${CADENCE.unitWord(statCadence, p)} ago`; }
    return d === 1 ? 'Yesterday' : `${d} days ago`;
  };

  // Name suffixes, scoped to the metric being shown:
  //   • Count    → weight suffix (weighted / dynamic)
  //   • Freq/Spent → range suffix (ease modes), days from the drift band
  //     (soonest = 100/easeMax, latest = 100/easeMin)
  //   • Auto / Hand-picked / Re-rolled away → no suffix ("{name} {count}")
  const weightSuffix = React.useCallback((it) => {
    if (!it || !usesWeight) return null;
    return `weight ${it.weight ?? 1}`;
  }, [usesWeight]);
  const rangeSuffix = React.useCallback((it) => {
    if (!it || !(isEaseUp || isEaseDown)) return null;
    const eMin = it.easeMin ?? pickerObj.easeMin ?? 1;
    const eMax = it.easeMax ?? pickerObj.easeMax ?? 1;
    const soonest = Math.max(1, Math.round(THRESHOLD / (eMax || 1)));
    const latest = Math.max(1, Math.round(THRESHOLD / (eMin || 1)));
    // soonest/latest are period counts; relabel in the picker's cadence unit.
    const word = ((pickerObj && pickerObj.cadence) || 'daily') !== 'daily'
      ? CADENCE.unitWord(pickerObj.cadence, latest) : 'days';
    return `range ${soonest}\u2013${latest} ${word}`;
  }, [isEaseUp, isEaseDown, pickerObj]);

  // Suffix shown for the active metric (count → weight, freq/spent → range).
  const activeSuffix = React.useCallback((it) => {
    if (effMetric === 'count') return weightSuffix(it);
    if (effMetric === 'freq' || effMetric === 'spent') return rangeSuffix(it);
    return null;
  }, [effMetric, weightSuffix, rangeSuffix]);

  // Per-item lookup so the card can fetch the raw item for its suffix.
  const itemById = React.useMemo(() => {
    const m = new Map();
    for (const it of (state.items || [])) m.set(it.id, it);
    return m;
  }, [state.items]);

  const fmtGap = (g) => (g >= 10 ? Math.round(g) : Math.round(g * 10) / 10);

  // Metric pills for the Pick breakdown card (ease-down swaps Frequency→Spent).
  const metricPills = [
    { key: 'count', label: 'Count' },
    isEaseDown ? { key: 'spent', label: 'Spent' } : { key: 'freq', label: 'Frequency' },
    { key: 'last', label: 'Last picked' },
    { key: 'auto', label: 'Auto' },
    { key: 'manual', label: 'Hand-picked' },
    { key: 'rejected', label: 'Re-rolled away' },
    { key: 'skipped', label: 'Skipped' },
  ];

  // ── Source split (picks only) ─────────────────────────────────────────────
  const sourceSegments = React.useMemo(() => {
    const c = { auto: 0, manual: 0, reroll: 0 };
    for (const r of rows) if (c[r.source] !== undefined) c[r.source]++;
    return SOURCE_META.map((m) => ({ ...m, n: c[m.key] }));
  }, [rows]);

  // ── Reminder type split + log list ────────────────────────────────────────
  const typeSegments = React.useMemo(() => {
    const c = { once: 0, recurring: 0 };
    for (const r of remRows) if (c[r.type] !== undefined) c[r.type]++;
    return TYPE_META.map((m) => ({ ...m, n: c[m.key] }));
  }, [remRows]);
  const remLog = React.useMemo(() => (
    remRows.slice().sort((a, b) => (a.completedAt < b.completedAt ? 1 : -1))
  ), [remRows]);

  // ── "Reminders breakdown" card data ──────────────────────────────────────
  // Per-reminder COMPLETION totals in range (grouped by taskId, denormalized
  // name/type). Includes long-gone one-time reminders — the log row persists
  // after the task is purged, so its history stays counted.
  const remCompletionTotals = React.useMemo(() => {
    if (!isReminders) return [];
    const m = new Map();
    for (const r of remRows) {
      const e = m.get(r.taskId) || { name: r.name, type: r.type, n: 0 };
      e.n++; e.name = r.name; e.type = r.type;
      m.set(r.taskId, e);
    }
    const dir = remBdSort === 'desc' ? -1 : 1;
    return [...m.values()].sort((a, b) => dir * (a.n - b.n) || a.name.localeCompare(b.name));
  }, [isReminders, remRows, remBdSort]);

  // Per-reminder SKIP totals in range (same shape).
  const remSkipTotals = React.useMemo(() => {
    if (!isReminders) return [];
    const m = new Map();
    for (const r of (state.reminderSkipLog || [])) {
      if (!enabledTypes.includes(r.type)) continue;
      if (hiddenTaskIds.has(r.taskId)) continue;
      if (cutoffIso && statIso(new Date(r.skippedAt)) < cutoffIso) continue;
      const e = m.get(r.taskId) || { name: r.name, type: r.type, n: 0 };
      e.n++; e.name = r.name; e.type = r.type;
      m.set(r.taskId, e);
    }
    const dir = remBdSort === 'desc' ? -1 : 1;
    return [...m.values()].sort((a, b) => dir * (a.n - b.n) || a.name.localeCompare(b.name));
  }, [isReminders, state.reminderSkipLog, enabledTypes.join(','), cutoffIso, remBdSort, hiddenTaskIds]);

  // Active list for the card + paging. pageSize 10 like Gmail.
  const REM_PAGE_SIZE = 10;
  // "Recent" is the chronological completion event log (one row per check-off),
  // sorted by the shared sort dir: desc = newest first. Completions/Skipped are
  // per-reminder aggregate counts: desc = highest first.
  const remRecentList = React.useMemo(() => {
    const dir = remBdSort === 'desc' ? -1 : 1;
    return remRows.slice().sort((a, b) =>
      (a.completedAt < b.completedAt ? -1 : a.completedAt > b.completedAt ? 1 : 0) * dir);
  }, [remRows, remBdSort]);
  const remBdList = remBdMetric === 'skipped' ? remSkipTotals
    : remBdMetric === 'completions' ? remCompletionTotals
    : remRecentList;
  const remPageCount = Math.max(1, Math.ceil(remBdList.length / REM_PAGE_SIZE));
  const remSafePage = Math.min(remPage, remPageCount - 1); // clamp if list shrank
  const remPageItems = remBdList.slice(remSafePage * REM_PAGE_SIZE, (remSafePage + 1) * REM_PAGE_SIZE);
  // Reset to page 1 whenever the metric, sort, scope, or range filter changes.
  React.useEffect(() => { setRemPage(0); },
    [remBdMetric, remBdSort, scope, cutoffIso, enabledTypes.join(',')]);

  // Reminders summary card shown on the combined "All" view.
  const showRemCard = scope === 'all' && remEnabled;

  return (
    <div className="tab tab--stats">
      <HelpOverlay active={helpOn} items={STATS_HELP_ITEMS} onExit={helpExit} />
      <header className="stat-h">
        <div className="kicker-row">
          <div className="kicker stat-h-kicker">Stats</div>
          <HelpButton active={helpOn} onClick={() => setHelpOn((o) => !o)} />
        </div>
        <div className="stat-h-lead">
          <button type="button" onClick={onHome} className="brand-mark" aria-label="Ease My Life — go to Today">
            {/* Same theme-wired logo as the Today header (currentColor → accent,
                grid lines → accent-soft) so the two tabs read as one product. */}
            <svg viewBox="8 8 528 528" fill="none" aria-hidden="true">
              <defs>
                <clipPath id="brandMarkClipStats" clipPathUnits="userSpaceOnUse">
                  <rect width="512" height="512" y="16" x="16" rx="75" ry="75" />
                </clipPath>
              </defs>
              <g style={{ stroke: 'var(--accent-soft)', strokeWidth: 16 }}>
                <path d="M 528 112 L 16 112" />
                <path d="M 216 528 L 216 16" />
                <path d="M 320 528 L 320 16" />
                <path d="M 424 528 L 424 16" />
                <path d="M 112 528 L 112 16" />
                <path d="M 528 216 L 16 216" />
                <path d="M 528 320 L 16 320" />
                <path d="M 528 424 L 16 424" />
              </g>
              <rect width="512" height="512" y="16" x="16" rx="75" ry="75"
                style={{ strokeWidth: 16, strokeLinecap: 'round', strokeLinejoin: 'round', stroke: 'currentColor' }} />
              <path
                d="M 24.467 527.792 C 67.266 416.298 77.088 228.913 172.207 434.412 C 200.739 535.77 262.562 434.412 314.873 292.51 C 381.45 120.201 450.381 44.636 528.854 24.365 C 521.725 22.337 512.215 24.365 493.193 34.5 C 369.548 105.451 295.85 292.51 234.029 363.461 C 186.473 414.14 167.451 241.831 124.651 262.102 C 101.828 270.008 60.133 375.754 24.467 527.792 Z"
                strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"
                clipPath="url(#brandMarkClipStats)"
                style={{ fill: 'currentColor', stroke: 'currentColor' }}
              />
            </svg>
          </button>
          <div className="section-h">
            <h1 className="section-title">Your <span className="stat-title-accent">eased</span> life, according to the numbers.</h1>
          </div>
        </div>
        <p className="section-sub stat-h-sub">Filter by group, conditionals, reminders, pickers, and time below. This tab is best used in conjunction with the <button type="button" className="sub-tablink" onClick={() => onNavTab && onNavTab('data')}>Data tab</button>, so that you can view the statistics here in order to see if your created items' numbers line up with your expectations and then tweak them in the Data tab if they do not.</p>
      </header>

      <div className="stat-body-wrap" style={tour.reserveTop ? { paddingTop: tour.reserveTop } : undefined}>
      {/* ── Filters ── */}
      <div className="stat-filters ob-stat-content">
        {existingGroups.length > 1 && (
          <div className="stat-filter-row">
            <span className="stat-filter-lbl">Group</span>
            <div className="picker-groups stat-scope-groups" ref={groupsRef} role="tablist" aria-label="Filter pickers by group">
              <button type="button" role="tab" aria-selected={statGroup === 'all'}
                      className={`picker-group-pill ${statGroup === 'all' ? 'is-on' : ''}`}
                      onClick={() => { setStatGroup('all'); setScope('all'); }}>
                All
                <span className="picker-group-count">{pickers.filter((p) => !p.hidden).length}</span>
              </button>
              {existingGroups.map((g) => {
                const n = pickers.filter((p) => p.group === g && !p.hidden).length;
                return (
                  <button key={g} type="button" role="tab" aria-selected={statGroup === g}
                          className={`picker-group-pill ${statGroup === g ? 'is-on' : ''}`}
                          onClick={() => setStatGroup(g)}>
                    {g}
                    <span className="picker-group-count">{n}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <div className="stat-filter-row">
          <span className="stat-filter-lbl">Show</span>
          <div className="picker-tabs stat-scope-tabs" ref={scopeRef} key={statGroup}>
            {statGroup === 'all' && (
              <button type="button"
                      className={`picker-tab picker-tab--enter ${scope === 'all' ? 'is-on' : ''}`}
                      style={{ animationDelay: '0ms' }}
                      onClick={() => setScope('all')}>
                <span className="picker-tab-name">All</span>
                <span className="picker-tab-mode">Everything</span>
              </button>
            )}
            {statGroup === 'all' && hasConditionals && (
              <button type="button"
                      className={`picker-tab picker-tab--enter ${isConditionals ? 'is-on' : ''}`}
                      style={{ animationDelay: '40ms' }}
                      onClick={() => setScope('conditionals')}>
                <span className="picker-tab-name">Conditionals</span>
                <span className="picker-tab-mode">Gates</span>
              </button>
            )}
            {statGroup === 'all' && remEnabled && (
              <button type="button"
                      className={`picker-tab picker-tab--enter ${isReminders ? 'is-on' : ''}`}
                      style={{ animationDelay: (hasConditionals ? 80 : 40) + 'ms' }}
                      onClick={() => setScope('reminders')}>
                <span className="picker-tab-name">Reminders</span>
                <span className="picker-tab-mode">Tasks</span>
              </button>
            )}
            {visiblePickers.map((p, i) => (
              <button key={p.id} type="button" data-picker-id={p.id}
                      className={`picker-tab picker-tab--enter ${scope === p.id ? 'is-on' : ''}`}
                      style={{ animationDelay: ((statGroup === 'all' ? (1 + (hasConditionals ? 1 : 0) + (remEnabled ? 1 : 0)) : 0) + i) * 40 + 'ms' }}
                      onClick={() => setScope(p.id)}>
                <span className="picker-tab-name">{p.name}</span>
                <span className="picker-tab-mode">{MODES[p.mode].label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="stat-filter-row">
          <span className="stat-filter-lbl">Range</span>
          <div className="stat-filter-pills stat-filter-pills--seg" ref={rangeRef}>
            {STAT_RANGES.map((r) => (
              <button key={r.key} type="button"
                      className={`stat-pill ${range === r.key ? 'is-on' : ''}`}
                      onClick={() => setRange(r.key)}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="tab-fade stat-body ob-stat-content" key={scope + '|' + range}>
      {/* ── Picker identity (single-picker scope) — mirrors the Pickers tab
          header: "Picker" + colored mode pill, then name, then the mode's
          description. ── */}
      {isPicker && pickerObj && (
        <div className="stat-picker-id">
          <div className="stat-picker-id-top">
            <span className="kicker">Picker</span>
            <Pill tone="mode">{(MODES[pickerObj.mode] || {}).label || pickerObj.mode}</Pill>
          </div>
          <h2 className="picker-title">{pickerObj.name}</h2>
          {(() => { const h = (MODES[pickerObj.mode] || {}).hint; return Array.isArray(h)
            ? h.map((para, pi) => <p key={pi} className="picker-hint">{para}</p>)
            : <p className="picker-hint">{h}</p>; })()}
        </div>
      )}

      {/* ── Conditionals scope body ── */}
      {isConditionals && (() => {
        const fmtCondDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const isValueMode = (m) => m === 'ease-up' || m === 'ease-down' || m === 'dynamic';
        return (
          <>
            <div className="stat-row">
              <Card className="stat-card stat-mk-condfired">
                <div className="stat-num">{condTotals.fired}</div>
                <div className="stat-lbl">triggered</div>
              </Card>
              <Card className="stat-card stat-mk-condcycles">
                <div className="stat-num">{condTotals.total}</div>
                <div className="stat-lbl">cycles</div>
              </Card>
              <Card className="stat-card stat-mk-condrate">
                <div className="stat-num">{condTotals.rate}%</div>
                <div className="stat-lbl">fire rate</div>
              </Card>
              <Card className="stat-card stat-mk-condlast">
                <div className="stat-num">{condTotals.lastFired ? fmtCondDate(condTotals.lastFired) : '—'}</div>
                <div className="stat-lbl">last fired</div>
              </Card>
            </div>
            <Card className="stat-mk-condbreakdown">
              <div className="rank-head">
                <div className="kicker">Conditionals breakdown</div>
                <button type="button" className="rank-sort"
                        onClick={() => setCondSort((d) => (d === 'desc' ? 'asc' : 'desc'))}>
                  {condSort === 'desc' ? 'High → Low' : 'Low → High'}
                  <Icon name={condSort === 'desc' ? 'arrow_down' : 'arrow_up'} size={13} />
                </button>
              </div>
              <div className="bd-metrics" ref={condMetricsRef}>
                {[['rate', 'Fire rate'], ['triggers', 'Triggers'], ['cycles', 'Cycles'], ['interval', 'Interval'], ['last', 'Last fired']].map(([key, label]) => (
                  <button key={key} type="button"
                          className={`bd-metric ${condMetric === key ? 'is-on' : ''}`}
                          onClick={() => setCondMetric(key)}>
                    {label}
                  </button>
                ))}
              </div>
              <p className="rank-note">
                {condMetric === 'rate'
                  ? `How often each conditional fired versus the cycles it was actually evaluated over ${rangeNoun} — a cycle only counts once a dependent item or the replacement card is completed.`
                  : condMetric === 'triggers'
                  ? `Number of cycles each conditional fired (suppressed its picker) over ${rangeNoun}.`
                  : condMetric === 'cycles'
                  ? `Number of completed cycles each conditional was evaluated over ${rangeNoun}.`
                  : condMetric === 'interval'
                  ? 'Average number of days between subsequent triggers.'
                  : 'When each conditional last fired.'}
              </p>
              {condBreakdown.length ? (
                <ul className={`rank rank--breakdown bd-list-fade ${(condMetric === 'interval' || condMetric === 'last') ? 'rank--freq' : ''}`} key={condMetric + condSort}>
                  {condBreakdown.map((o) => {
                    // Mode-intrinsic "target" (what you configured), shown as a
                    // suffix under the name like the Pickers breakdown does.
                    // Probability modes → trigger %; ease modes → interval band.
                    const target = o.deleted ? null
                      : o.mode === 'random' ? 'set 50%'
                      : o.mode === 'weighted' ? `set ${o.oddsPct}%`
                      : o.mode === 'dynamic' ? `from ${o.oddsPct}%`
                      : (() => {
                          // Ease modes store drift; day band = 100 / drift.
                          const soonest = Math.max(1, Math.round(100 / (o.easeMax || 1)));
                          const latest = Math.max(1, Math.round(100 / (o.easeMin || 1)));
                          return `target ${soonest}–${latest}d`;
                        })();
                    return (
                    <li key={o.id} className={o.deleted ? 'is-deleted' : ''}>
                      <span className="rank-name">
                        <span className="rank-name-row">
                          <span className="rank-name-text">{o.name}</span>
                          {o.deleted && <span className="rank-tag rank-tag--deleted">deleted</span>}
                        </span>
                        {target && <span className="rank-meta">{target}</span>}
                      </span>
                      <span className="cnd-bd-vals">
                        {!o.deleted && o.active === false && <span className="rank-tag">vacation</span>}
                        <span className="rem-log-type">{(o.mode || '').replace('-', '‑')}</span>
                        {condMetric === 'rate' && (
                          <span className="rank-vals">
                            <span className="rank-pct">{o.rate == null ? '—' : o.rate + '%'}</span>
                            <span className="rank-frac">{o.fired} / {o.total}</span>
                          </span>
                        )}
                        {condMetric === 'triggers' && <span className="rank-metric-n">{o.fired}</span>}
                        {condMetric === 'cycles' && <span className="rank-metric-n">{o.total}</span>}
                        {condMetric === 'interval' && (
                          o.avgInterval != null
                            ? <span className="rank-freq-val cnd-bd-freq--interval">every {o.avgInterval} {o.avgInterval === 1 ? 'day' : 'days'}</span>
                            : <span className="rank-freq-val cnd-bd-freq--interval is-dim">{o.fired <= 1 ? 'Fired once' : 'Not fired'}</span>
                        )}
                        {condMetric === 'last' && (
                          o.lastFired
                            ? <span className="rank-freq-val cnd-bd-freq--last">{fmtCondDate(o.lastFired)}</span>
                            : <span className="rank-freq-val cnd-bd-freq--last is-dim">Never</span>
                        )}
                      </span>
                    </li>
                    );
                  })}
                </ul>
              ) : <div className="stat-empty">No conditional activity in {rangeNoun} yet.</div>}
            </Card>
          </>
        );
      })()}

      {/* ── Headline numbers ── */}
      {!isConditionals && (
      <div className="stat-row">
        {/* stat-mk-* — dedicated, zero-styling selector hooks for help mode
            (same idea as day-log.jsx's dl-mk-* classes), since every
            headline card here shares the plain .stat-card class with no
            other way to address one specifically. */}
        {isReminders ? (
          <>
            <Card className="stat-card stat-mk-remdone">
              <div className="stat-num">{totalDone}</div>
              <div className="stat-lbl">completed</div>
            </Card>
            <Card className="stat-card stat-mk-remweek">
              <div className="stat-num">{remWeek}</div>
              <div className="stat-lbl">this week</div>
            </Card>
            <Card className="stat-card stat-mk-remactive">
              <div className="stat-num">{activeDays}</div>
              <div className="stat-lbl">active days</div>
            </Card>
            <Card className="stat-card stat-mk-rembusiest">
              <div className="stat-num">{busiest}</div>
              <div className="stat-lbl">busiest day</div>
            </Card>
          </>
        ) : (
          <>
            {/* stat-mk-scope-{all,picker} — All and a specific picker both
                fall into this branch and share the exact same stat-mk-*
                classes above, so help mode needs an extra hook to give the
                two scopes their own separate tooltip copy. */}
            <Card className={`stat-card stat-mk-streak ${isPicker ? 'stat-mk-scope-picker' : 'stat-mk-scope-all'}`}>
              <div className="stat-num">{streak}</div>
              <div className="stat-lbl">day streak</div>
              <Icon name="flame" size={16} />
            </Card>
            <Card className={`stat-card stat-mk-fulldays ${isPicker ? 'stat-mk-scope-picker' : 'stat-mk-scope-all'}`}>
              <div className="stat-num">{fullDays}</div>
              <div className="stat-lbl">full days · {activeDays}</div>
            </Card>
            <Card className={`stat-card stat-mk-done ${isPicker ? 'stat-mk-scope-picker' : 'stat-mk-scope-all'}`}>
              <div className="stat-num">{totalDone}</div>
              <div className="stat-lbl">items done</div>
            </Card>
            <Card className={`stat-card stat-mk-rate ${isPicker ? 'stat-mk-scope-picker' : 'stat-mk-scope-all'}`}>
              <div className="stat-num">{rate}%</div>
              <div className="stat-lbl">completion</div>
            </Card>
          </>
        )}
      </div>
      )}

      {/* ── Heatmap ── */}
      {!isConditionals && (
      <Card className="stat-heatmap-card">
        <div className="heat-h">
          <div className="kicker">{rangeKicker}{isReminders ? ' · reminders' : ''}</div>
          <HeatLegend />
        </div>
        {yearPaging && (() => {
          const idx = dataYears.indexOf(activeYear);
          const goTo = (y, dir) => { setHeatDir(dir); setHeatYear(y); setHeatSel(null); };
          return (
            <div className="heat-year-nav">
              <button type="button" className="heat-year-arrow"
                      disabled={idx <= 0}
                      aria-label="Previous year"
                      onClick={() => goTo(dataYears[idx - 1], 'prev')}>‹</button>
              <span className="heat-year">{activeYear}</span>
              <button type="button" className="heat-year-arrow"
                      disabled={idx >= dataYears.length - 1}
                      aria-label="Next year"
                      onClick={() => goTo(dataYears[idx + 1], 'next')}>›</button>
            </div>
          );
        })()}
        {activeDays === 0 ? (
          <div className="stat-empty">
            {isReminders
              ? `No reminders completed in ${rangeNoun} yet.`
              : `No picks logged in ${rangeNoun}${scope !== 'all' ? ' for this picker' : ''} yet.`}
          </div>
        ) : (
          <React.Fragment>
          <div className={`heat${heatDir ? ' heat-slide-' + heatDir : ''}`} key={activeYear == null ? 'single' : activeYear}>
            {heatDays.map((d) => {
              let level;
              if (isReminders) {
                level = countLevel(d.done);
              } else {
                const ratio = d.done / Math.max(1, d.total);
                level = d.total === 0 ? 0
                  : ratio >= 1 ? 4 : ratio >= 0.66 ? 3 : ratio >= 0.33 ? 2 : ratio > 0 ? 1 : 0;
              }
              const head = isReminders
                ? `${d.date} · ${d.done} done`
                : `${d.date} · ${d.done}/${d.total}`;
              // Native (desktop) tooltip lists what was picked that day.
              const names = (d.items || []).map((it) =>
                isReminders ? `• ${it.name}` : `• ${it.name}${it.done ? ' ✓' : ''}`);
              const title = names.length ? `${head}\n${names.join('\n')}` : head;
              const sel = heatSel === d.date;
              return <button key={d.date} type="button"
                             className={`heat-cell heat-${level}${sel ? ' is-sel' : ''}`}
                             title={title}
                             aria-label={title}
                             onClick={() => setHeatSel(sel ? null : d.date)} />;
            })}
          </div>
          {(() => {
            const d = heatSel && heatDays.find((x) => x.date === heatSel);
            if (!d) return <p className="heat-tap-hint">Tap a day to see what was picked.</p>;
            const dObj = new Date(d.date + 'T00:00:00');
            const label = dObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
            return (
              <div className="heat-detail">
                <div className="heat-detail-h">
                  <span className="heat-detail-date">{label}</span>
                  <span className="heat-detail-count">
                    {isReminders ? `${d.done} done` : `${d.done}/${d.total} done`}
                  </span>
                </div>
                {(d.items || []).length ? (
                  <ul className="heat-detail-list">
                    {d.items.map((it, i) => (
                      <li key={i} className={it.done ? 'is-done' : ''}>
                        <span className="heat-detail-name">{it.name}</span>
                        {!isReminders && <span className="heat-detail-mark">{it.done ? '✓' : '—'}</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="heat-detail-empty">Nothing {isReminders ? 'completed' : 'picked'} this day.</p>
                )}
              </div>
            );
          })()}
          </React.Fragment>
        )}
      </Card>
      )}

      {/* ── Conditionals summary (All view) ── */}
      {scope === 'all' && hasConditionals && (
        <Card className="cnd-sum-card">
          <div className="rem-stats-head">
            <div className="kicker">Conditionals</div>
            <div className="rem-stats-nums">
              <span className="rem-stat"><strong>{condTotals.fired}</strong>&nbsp;triggered</span>
              <span className="rem-stat"><strong>{condTotals.rate}%</strong>&nbsp;fire rate</span>
            </div>
          </div>
          {condStats.length ? (
            <ul className="cnd-sum-list">
              {condStats.slice(0, 8).map((o) => (
                <li key={o.id}>
                  <span className="cnd-sum-name">
                    {o.name}
                    {o.deleted && <span className="rank-tag rank-tag--deleted">deleted</span>}
                    {!o.deleted && o.active === false && <span className="rank-tag">vacation</span>}
                  </span>
                  <span className="cnd-sum-meta">
                    <span className="rem-log-type">{(o.mode || '').replace('-', '‑')}</span>
                    <span className="cnd-sum-frac">{o.fired} / {o.total}</span>
                    <span className="cnd-sum-rate">{o.rate == null ? '—' : o.rate + '%'}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : <div className="rem-log-empty">No conditional activity in {rangeNoun} yet.</div>}
        </Card>
      )}

      {/* ── Reminders dashboard extras ── */}
      {isReminders && (
        <>
          <BreakdownBar title="By reminder type" total={totalDone} segments={typeSegments}
                        empty={`No reminders completed in ${rangeNoun} yet.`} className="stat-mk-remtype" />
          <Card className="stat-mk-rembreakdown">
            <div className="rank-head">
              <div className="kicker">Reminders breakdown</div>
              <button type="button" className="rank-sort"
                      onClick={() => setRemBdSort((d) => (d === 'desc' ? 'asc' : 'desc'))}>
                {remBdMetric === 'recent'
                  ? (remBdSort === 'desc' ? 'Newest → Oldest' : 'Oldest → Newest')
                  : (remBdSort === 'desc' ? 'High → Low' : 'Low → High')}
                <Icon name={remBdSort === 'desc' ? 'arrow_down' : 'arrow_up'} size={13} />
              </button>
            </div>
            <div className="bd-metrics" ref={remMetricsRef}>
              {[['recent', 'Recent'], ['completions', 'Completions'], ['skipped', 'Skipped']].map(([key, label]) => (
                <button key={key} type="button"
                        className={`bd-metric ${remBdMetric === key ? 'is-on' : ''}`}
                        onClick={() => setRemBdMetric(key)}>
                  {label}
                </button>
              ))}
            </div>
            <p className="rank-note">
              {remBdMetric === 'recent'
                ? 'Every Reminders completion, most recent first — check one off in the Today tab and it lands here.'
                : remBdMetric === 'completions'
                ? 'Total count for the number of times that a Reminders item was completed using the check-off in the Today tab.'
                : 'Total count for the number of times that a Reminders item was skipped using the skip button in the Today tab.'}
            </p>
            {remBdList.length ? (
              <>
                <ul className="rem-log bd-list-fade" key={remBdMetric + remBdSort + remSafePage}>
                  {remPageItems.map((r, i) => (
                    <li key={remBdMetric === 'recent' ? r.rowId : i}>
                      <span className="rem-log-name">{r.name}</span>
                      <span className="rem-log-meta">
                        <span className={`rem-log-type rem-log-type--${r.type}`}>{r.type === 'once' ? 'one-time' : 'recurring'}</span>
                        {remBdMetric === 'recent'
                          ? <span className="rem-log-when">{relWhen(r.completedAt)}</span>
                          : <span className="rank-metric-n">{r.n}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
                <Pager page={remSafePage} pageSize={REM_PAGE_SIZE} total={remBdList.length} alwaysShow
                       onChange={setRemPage} unit={remBdMetric === 'skipped' ? 'skipped' : 'completed'} />
              </>
            ) : (
              <div className="rem-log-empty">
                {remBdMetric === 'skipped'
                  ? `No skips in ${rangeNoun}. Skip one on Today and it lands here.`
                  : `No completions in ${rangeNoun}. Check one off on Today and it lands here.`}
              </div>
            )}
          </Card>
        </>
      )}
      {showRemCard && (
        <Card className="rem-stats-card">
          <div className="rem-stats-head">
            <div className="kicker">Reminders completed</div>
            <div className="rem-stats-nums">
              <span className="rem-stat"><strong>{remRows.length}</strong>&nbsp;{range === 'all' ? 'all time' : 'in range'}</span>
              <span className="rem-stat"><strong>{remWeek}</strong>&nbsp;this week</span>
            </div>
          </div>
          {remLog.length ? (
            <ul className="rem-log">
              {remLog.slice(0, 8).map((r) => (
                <li key={r.rowId}>
                  <span className="rem-log-name">{r.name}</span>
                  <span className="rem-log-meta">
                    <span className={`rem-log-type rem-log-type--${r.type}`}>{r.type === 'once' ? 'one-time' : 'recurring'}</span>
                    <span className="rem-log-when">{relWhen(r.completedAt)}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rem-log-empty">No completions in {rangeNoun}. Check one off on Today and it lands here.</div>
          )}
        </Card>
      )}

      {/* ── Source split (picks) — All view shows it last; picker scope too ── */}
      {!isReminders && !isConditionals && (
        <BreakdownBar title="How picks were chosen" total={totalPossible} segments={sourceSegments}
                      empty={`Nothing picked in ${rangeNoun} yet.`} className="stat-mk-source" />
      )}

      {/* ── Rankings (picks) ── */}
      {scope === 'all' && (
        <div className="stat-row stat-row--2">
          <Card className="stat-mk-mostpicked">
            <div className="kicker">Most picked</div>
            {top.length ? (
              <ul className="rank">
                {top.map((it, i) => (
                  <li key={i}>
                    <span>{it.name}</span>
                    <span className="rank-n">{it.n}</span>
                  </li>
                ))}
              </ul>
            ) : <div className="stat-empty">Nothing picked in {rangeNoun} yet.</div>}
          </Card>
          <Card className="stat-mk-coldest">
            <div className="kicker">Coldest items</div>
            {cold.length ? (
              <ul className="rank rank--cold">
                {cold.map((it, i) => (
                  <li key={i}>
                    <span>{it.name}</span>
                    <span className="rank-n">{it.n}</span>
                  </li>
                ))}
              </ul>
            ) : <div className="stat-empty">No items in this scope.</div>}
          </Card>
        </div>
      )}

      {/* ── Single-picker Pick breakdown: one card, metric switcher ── */}
      {isPicker && (
        <Card className="stat-breakdown-card">
          <div className="rank-head">
            <div className="kicker">Pick breakdown</div>
            <button type="button" className="rank-sort"
                    onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}>
              {sortDir === 'desc' ? 'High → Low' : 'Low → High'}
              <Icon name={sortDir === 'desc' ? 'arrow_down' : 'arrow_up'} size={13} />
            </button>
          </div>
          <div className="bd-metrics" role="tablist" aria-label="Breakdown metric" ref={metricsRef}>
            {metricPills.map((p) => (
              <button key={p.key} type="button" role="tab"
                      aria-selected={effMetric === p.key}
                      className={`bd-metric ${effMetric === p.key ? 'is-on' : ''}`}
                      onClick={() => setMetric(p.key)}>
                {p.label}
              </button>
            ))}
          </div>
          {effMetric === 'count' && (
            <p className="rank-note">
              Total count for the number of times that a {pickerObj.name} item was picked (rejections and skips are not included), counted in{' '}
              <button type="button" className={`note-link ${countMode === 'total' ? 'is-on' : ''}`}
                      onClick={() => setCountMode('total')}>total picks</button>
              {' '}or only{' '}
              <button type="button" className={`note-link ${countMode === 'eligible' ? 'is-on' : ''}`}
                      onClick={() => setCountMode('eligible')}>eligible picks</button>
              {' '}when an item was not on vacation.
            </p>
          )}
          {effMetric === 'freq' && (
            <p className="rank-note">
              Average number of days between subsequent picks, counted in total{' '}
              <button type="button" className={`note-link ${freqMode === 'calendar' ? 'is-on' : ''}`}
                      onClick={() => setFreqMode('calendar')}>{calUnitLabel}</button>
              {' '}or only{' '}
              <button type="button" className={`note-link ${freqMode === 'eligible' ? 'is-on' : ''}`}
                      onClick={() => setFreqMode('eligible')}>eligible {eligUnit}</button>
              {' '}when the {pickerObj.name} picker actually runs.
            </p>
          )}
          {effMetric === 'spent' && (
            <p className="rank-note">
              Average number of days before an item&rsquo;s charge runs out, counted in total{' '}
              <button type="button" className={`note-link ${spentMode === 'calendar' ? 'is-on' : ''}`}
                      onClick={() => setSpentMode('calendar')}>{calUnitLabel}</button>
              {' '}or only{' '}
              <button type="button" className={`note-link ${spentMode === 'eligible' ? 'is-on' : ''}`}
                      onClick={() => setSpentMode('eligible')}>eligible {eligUnit}</button>
              {' '}when the {pickerObj.name} picker actually runs.
            </p>
          )}
          {effMetric === 'auto' && (
            <p className="rank-note">Total count for the number of times that a {pickerObj.name} item was picked using the auto generator.</p>
          )}
          {effMetric === 'manual' && (
            <p className="rank-note">Total count for the number of times that a {pickerObj.name} item was picked manually using the Pickers tab.</p>
          )}
          {effMetric === 'rejected' && (
            <p className="rank-note">Total count for the number of times that a {pickerObj.name} item was rejected using the re-roll button in the Today tab.</p>
          )}
          {effMetric === 'skipped' && (
            <p className="rank-note">Total count for the number of times that a {pickerObj.name} item was skipped using the skip button in the Today tab.</p>
          )}
          {effMetric === 'last' && (
            <p className="rank-note">
              Days since each item was last picked, counted in total{' '}
              <button type="button" className={`note-link ${lastMode === 'calendar' ? 'is-on' : ''}`}
                      onClick={() => setLastMode('calendar')}>{calUnitLabel}</button>
              {' '}or only{' '}
              <button type="button" className={`note-link ${lastMode === 'eligible' ? 'is-on' : ''}`}
                      onClick={() => setLastMode('eligible')}>eligible {eligUnit}</button>
              {' '}when the {pickerObj.name} picker actually runs.
            </p>
          )}
          {breakdown.length ? (
            <ul className={`rank rank--breakdown bd-list-fade ${(effMetric === 'freq' || effMetric === 'last') ? 'rank--freq' : ''}`} key={effMetric + sortDir}>
              {breakdown.map((it) => {
                const suffix = activeSuffix(itemById.get(it.id));
                return (
                  <li key={it.id} className={`${it.vacation ? 'is-vacation' : ''}${it.deleted ? ' is-deleted' : ''}`}>
                    <span className="rank-name">
                      <span className="rank-name-row">
                        <span className="rank-name-text">{it.name}</span>
                        {it.deleted && <span className="rank-tag rank-tag--deleted">deleted</span>}
                      </span>
                      {suffix && <span className="rank-meta">{suffix}</span>}
                    </span>
                    <span className="rank-bd-vals">
                      {!it.deleted && it.vacation && <span className="rank-tag">vacation</span>}
                      {!it.deleted && effMetric === 'last' && !it.vacation && it.wasOnVac && (
                        <span className="rank-tag rank-tag--was">was on vacation</span>
                      )}
                      {effMetric === 'count' && (() => {
                        const denom = countMode === 'eligible' ? it.eligDenom : totalPossible;
                        return (
                          <span className="rank-vals">
                            <span className="rank-pct">{denom ? Math.round((it.n / denom) * 100) : 0}%</span>
                            <span className="rank-frac">{it.n} / {denom}</span>
                          </span>
                        );
                      })()}
                      {effMetric === 'freq' && (
                        it.avgGap != null
                          ? (() => { const d = cadDisplay(it.avgGap, freqMode, fmtGap(it.avgGap)); return <span className="rank-freq-val rank-bd-freq--freq">every {d.num} {d.word}</span>; })()
                          : <span className="rank-freq-val rank-bd-freq--freq is-dim">{it.freqCount === 1 ? 'Picked once' : 'Not picked'}</span>
                      )}
                      {effMetric === 'spent' && (
                        it.spent != null
                          ? (() => { const d = cadDisplay(it.spent, spentMode, Math.round(it.spent)); return <span className="rank-freq-val rank-bd-freq--freq">≈ {d.num} {d.word}</span>; })()
                          : <span className="rank-freq-val rank-bd-freq--freq is-dim">No full cycle yet</span>
                      )}
                      {effMetric === 'last' && (
                        it.lastDays != null
                          ? <span className="rank-freq-val rank-bd-freq--last">{fmtLast(it.lastDays, lastMode)}</span>
                          : <span className="rank-freq-val rank-bd-freq--last is-dim">Not picked</span>
                      )}
                      {(effMetric === 'auto' || effMetric === 'manual' || effMetric === 'rejected' || effMetric === 'skipped') && (
                        <span className="rank-metric-n">{it[effMetric]}</span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : <div className="stat-empty">This picker has no items yet.</div>}
        </Card>
      )}
      </div>
      </div>
    </div>
  );
}

export { TabStats };
