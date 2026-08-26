import React from 'react';
import { CADENCE } from './cadence.js';
import { CONDITIONALS } from './conditionals.js';
import { TASKS } from './tasks.js';
import { Collapse, InfoTip } from './ui.jsx';

// Day Log — a per-group, today-only audit of what the generator did.
//
// Surfaced by a "Log" chip on each group title (and the Reminders title). The
// panel shows, per picker, a table of every item's value AT GENERATION → after,
// plus status icons derived from the pick log (auto-picked / pushed / rolled
// off / skipped / completed). Conditionals attached to the group's pickers get
// their own blue section (same row shape, Triggered / Not-triggered pill, and a
// strip listing the pickers they affect). Reminders get a schedule-based log.
//
// All picker-event data already lives in state.pickLog (source: auto|manual|
// reroll, outcome: rejected|skipped, done). The only capture added for this
// feature is the per-generation value snapshot at state.today.genLog.

const isoDay = (d = new Date()) => {
  const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset());
  return x.toISOString().slice(0, 10);
};
const THRESHOLD = 100;
const hasValueMode = (m) => m === 'ease-up' || m === 'ease-down' || m === 'dynamic';

// ── Inline icons (self-contained so the log doesn't depend on the Icon set) ──
function Ico({ name, w = 2 }) {
  const p = {
    log: <><path d="M3 5h18M3 12h18M3 19h18" /></>,
    shuffle: <><path d="M16 3h5v5" /><path d="M4 20 21 3" /><path d="M21 16v5h-5" /><path d="m15 15 6 6" /><path d="m4 4 5 5" /></>,
    push: <><path d="M12 19V5M5 12l7-7 7 7" /></>,
    roll: <><path d="M3 2v6h6" /><path d="M3 8a9 9 0 1 0 3-5" /></>,
    x: <><path d="M18 6 6 18M6 6l12 12" /></>,
    check: <><path d="M20 6 9 17l-5-5" /></>,
    moon: <><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" /></>,
    branch: <><path d="M4 4v10a4 4 0 0 0 4 4h12" /><path d="m16 14 4 4-4 4" /></>,
    clock: <><path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="9" /></>,
    chevron: <><path d="m6 9 6 6 6-6" /></>,
  }[name];
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w}
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{p}</svg>
  );
}

// ── Chip shown on a group / reminders header to open its log ──
function DayLogChip({ open, onClick }) {
  return (
    <button type="button" className={`dl-chip ${open ? 'is-on' : ''}`}
            aria-pressed={open} aria-label={open ? 'Hide day log' : 'Show day log'}
            onClick={(e) => { e.stopPropagation(); onClick(); }}>
      <Ico name="log" /> Log
    </button>
  );
}

// ── Per-item status flags, derived from today's pick-log rows for a picker ──
function pickerDayIndex(pickLog, pickerId, day) {
  const m = new Map();
  for (const r of (pickLog || [])) {
    if (r.date !== day || r.pickerId !== pickerId) continue;
    let f = m.get(r.itemId);
    if (!f) { f = { auto: false, pushed: false, rolledOff: false, skipped: false, completed: false, any: false }; m.set(r.itemId, f); }
    f.any = true;
    if (r.source === 'auto') f.auto = true;
    if (r.source === 'manual' || r.source === 'reroll') f.pushed = true;
    if (r.outcome === 'rejected') f.rolledOff = true;
    else if (r.outcome === 'skipped') f.skipped = true;
    else if (r.done) f.completed = true;
  }
  return m;
}

function StatusChips({ flags }) {
  if (!flags || !flags.any) return <span className="dl-none dl-mk-status">—</span>;
  const chips = [];
  if (flags.auto) chips.push(['auto', 'shuffle', 'Auto-picked', 2]);
  if (flags.pushed) chips.push(['push', 'push', 'Pushed', 2.4]);
  if (flags.rolledOff) chips.push(['roll', 'roll', 'Rolled off', 2.2]);
  if (flags.skipped) chips.push(['skip', 'x', 'Skipped', 2.6]);
  if (flags.completed) chips.push(['done', 'check', 'Completed', 3]);
  return (
    <span className="dl-status dl-mk-status">
      {chips.map(([k, icon, title, w]) => (
        <span key={k} className={`dl-ico dl-c-${k}`} title={title}><Ico name={icon} w={w} /></span>
      ))}
    </span>
  );
}

// Name subline: weight (weighted/dynamic), range (ease), no weight (random).
// Dynamic also appends its boost — the drift value that was ADDED to the base
// weight for today's roll (effective weight = weight + boost, pickers.js). It
// carries the same green as a positive Δ so it reads as the same quantity the
// value columns are tracking. `boost` is the at-generation value. "(+0)" is
// shown explicitly — a blank there reads as broken rather than as "no boost" —
// but in muted grey like a flat Δ, so zero doesn't compete with real boosts.
function itemSub(picker, it, boost) {
  const m = picker.mode;
  if (m === 'dynamic') {
    const b = boost == null ? null : Math.round(boost);
    return (
      <React.Fragment>
        {`weight ${it.weight ?? 1}`}
        {b == null ? null : <span className={`dl-boost ${b ? '' : 'is-zero'}`}> (+{b})</span>}
      </React.Fragment>
    );
  }
  if (m === 'weighted') return `weight ${it.weight ?? 1}`;
  if (m === 'ease-up' || m === 'ease-down') {
    const eMin = it.easeMin ?? picker.easeMin ?? 1;
    const eMax = it.easeMax ?? picker.easeMax ?? 1;
    const so = Math.max(1, Math.round(THRESHOLD / eMax));
    const la = Math.max(so, Math.round(THRESHOLD / eMin));
    const word = (picker.cadence && picker.cadence !== 'daily')
      ? CADENCE.unitWord(picker.cadence, la) : 'days';
    return `range ${so}\u2013${la} ${word}`;
  }
  return 'no weight';
}
function condSub(c) {
  if (c.mode === 'ease-up' || c.mode === 'ease-down') {
    const T = c.threshold ?? THRESHOLD;
    const so = Math.max(1, Math.round(T / (c.easeMax ?? 14)));
    const la = Math.max(so, Math.round(T / (c.easeMin ?? 7)));
    return `range ${so}\u2013${la} days`;
  }
  if (c.mode === 'dynamic') return `${c.oddsPct ?? 50}%+ odds`;
  if (c.mode === 'weighted') return `${c.oddsPct ?? 50}% odds`;
  return '50% odds';
}

// Three value cells (At gen / Δ / After). N/A when the mode has no value or
// the item wasn't present at generation.
//
// `offset` (dynamic only) is the item's base weight, added to BOTH value cells
// so they read as effective pick weight (weight + boost) rather than the bare
// boost — that is the number that actually drove the roll. It is added to both,
// not just After, so the columns stay arithmetically honest: After − At gen
// still equals Δ. Δ itself is untouched, since a constant base weight cancels
// out of the difference — it remains the change in boost (+1 per cycle an item
// sits out, negative when a completion resets it).
function ValueCells({ hasValue, atGen, after, offset = 0 }) {
  // dl-mk-* classes below (here and in TableHead) are pure selector hooks
  // for help mode (see help-content.jsx's log-panel items) — deliberately
  // NOT the same classes as .dl-item/.dl-delta/.dl-after/.dl-status, which
  // carry their own font/layout rules meant for data cells; reusing those
  // directly on a header label would visually reflow/restyle it away from
  // the small-caps look every other header cell has.
  if (!hasValue || atGen == null) {
    return (
      <React.Fragment>
        <span className="dl-val dl-mk-atgen r"><span className="dl-na">N/A</span></span>
        <span className="dl-delta dl-mk-delta flat r">—</span>
        <span className="dl-val dl-mk-after r"><span className="dl-na">N/A</span></span>
      </React.Fragment>
    );
  }
  const g = Math.round(atGen) + offset, a = Math.round(after) + offset, d = a - g;
  const cls = d > 0 ? 'up' : d < 0 ? 'down' : 'flat';
  const txt = d === 0 ? '—' : (d > 0 ? `+${d}` : `${d}`);
  return (
    <React.Fragment>
      <span className="dl-val dl-mk-atgen r">{g}</span>
      <span className={`dl-delta dl-mk-delta ${cls} r`}>{txt}</span>
      <span className="dl-val dl-after dl-mk-after r">{a}</span>
    </React.Fragment>
  );
}

const fmtTime = (iso) => {
  try { return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); }
  catch (e) { return ''; }
};

function TableHead({ first = 'Item' }) {
  return (
    <div className="dl-thead">
      <span className="dl-mk-item">{first}</span><span className="r dl-mk-atgen">At gen</span><span className="r dl-mk-delta">Δ</span>
      <span className="r dl-mk-after">After</span><span className="r dl-mk-status">Status</span>
    </div>
  );
}

// ── One picker's collapsible table ──
function PickerBlock({ state, picker, day, suppressed }) {
  const [open, setOpen] = React.useState(true);
  const items = state.items.filter((it) => it.pickerId === picker.id);
  const idx = pickerDayIndex(state.pickLog, picker.id, day);
  const genItems = (state.today.genLog && state.today.genLog.items) || {};
  const hasRows = idx.size > 0;
  const modeLabel = { 'ease-up': 'Ease-up', 'ease-down': 'Ease-down', dynamic: 'Dynamic Weighted', weighted: 'Weighted', random: 'Truly Random' }[picker.mode] || picker.mode;
  const neutral = picker.mode === 'weighted' || picker.mode === 'random';

  // Suppressed today (conditional fired) and no manual override → rest row.
  if (!hasRows && suppressed) {
    const cond = (state.conditionals || []).find((c) => c.id === picker.conditionalId);
    return (
      <div className="dl-block">
        <div className="dl-block-h dl-block-h--static">
          <span className="dl-name-mode">
            <span className="dl-block-name">{picker.name}</span>
            <InfoTip className={`dl-mode ${neutral ? 'neutral' : ''}`} label={modeLabel}>{modeLabel}</InfoTip>
          </span>
          <span className="dl-rest"><Ico name="moon" /><span>Rested{cond ? ` · ${cond.name}` : ''}</span></span>
        </div>
      </div>
    );
  }

  const doneCount = items.filter((it) => (idx.get(it.id) || {}).completed).length;
  return (
    <div className={`dl-block ${open ? '' : 'is-closed'}`}>
      <button type="button" className="dl-block-h" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className="dl-chev"><Ico name="chevron" /></span>
        <span className="dl-name-mode">
          <span className="dl-block-name">{picker.name}</span>
          <InfoTip className={`dl-mode ${neutral ? 'neutral' : ''}`} label={modeLabel}>{modeLabel}</InfoTip>
        </span>
        <span className="dl-sum"><span>{items.length} item{items.length === 1 ? '' : 's'}</span>
          {doneCount > 0 && <span className="dl-dchip"><Ico name="check" w={3} /><span>{doneCount} done</span></span>}
        </span>
      </button>
      <Collapse open={open}>
        <div className="dl-table">
          <TableHead />
          {items.length === 0 && <div className="dl-empty">This picker has no items.</div>}
          {items.map((it) => {
            const f = idx.get(it.id);
            const done = f && f.completed;
            const hv = hasValueMode(picker.mode) && !it.vacation;
            return (
              <div key={it.id} className={`dl-trow ${done ? 'is-done' : ''} ${it.vacation ? 'is-dim' : ''}`}>
                <span className="dl-item dl-mk-item">
                  <InfoTip className="dl-name" label={it.name}>{it.name}</InfoTip>
                  <span className="dl-sub">{itemSub(picker, it, hv ? genItems[it.id] : null)}</span>
                </span>
                <ValueCells hasValue={hv} atGen={genItems[it.id]} after={it.value}
                            offset={picker.mode === 'dynamic' ? (it.weight ?? 1) : 0} />
                {it.vacation
                  ? <span className="dl-status dl-mk-status"><span className="dl-vac">Vacation</span></span>
                  : <StatusChips flags={f} />}
              </div>
            );
          })}
        </div>
      </Collapse>
    </div>
  );
}

// ── Conditionals attached to any picker in this group ──
function CondSection({ state, pickersInGroup, day }) {
  const condIds = [...new Set(pickersInGroup.filter((p) => p.conditionalId).map((p) => p.conditionalId))];
  const conds = (state.conditionals || []).filter((c) => condIds.includes(c.id));
  if (!conds.length) return null;
  const genConds = (state.today.genLog && state.today.genLog.conds) || {};
  return (
    <div className="dl-block dl-cond-sec">
      <div className="dl-block-h dl-block-h--static">
        <span className="dl-block-name dl-cond-title">Conditionals</span>
        <span className="dl-mode">{conds.length}</span>
      </div>
      <div className="dl-table">
        <TableHead first="Conditional" />
        {conds.map((c) => {
          const attached = state.pickers.filter((p) => p.conditionalId === c.id && !p.hidden).map((p) => p.name);
          const trig = !!(c.active !== false && c.triggered);
          const hv = CONDITIONALS.isValue(c.mode);
          const snap = genConds[c.id];
          const neutral = c.mode === 'weighted' || c.mode === 'random';
          const modeLabel = { 'ease-up': 'Ease-up', 'ease-down': 'Ease-down', dynamic: 'Dynamic Weighted', weighted: 'Weighted', random: 'Truly Random' }[c.mode] || c.mode;
          return (
            <React.Fragment key={c.id}>
              <div className="dl-trow dl-cond-row">
                <span className="dl-item dl-mk-item">
                  <span className="dl-nrow">
                    <InfoTip className="dl-name" label={c.name}>{c.name}</InfoTip>
                    <InfoTip className={`dl-mode dl-mode--cond ${neutral ? 'is-neutral' : ''}`} label={modeLabel}>{modeLabel}</InfoTip>
                  </span>
                  <span className="dl-sub">{condSub(c)}</span>
                </span>
                <ValueCells hasValue={hv} atGen={snap ? snap.value : (hv ? c.value : null)} after={c.value} />
                <span className="dl-status dl-mk-status">
                  <span className={`dl-st-pill ${trig ? 'dl-st-trig' : 'dl-st-nottrig'}`}>{trig ? 'Triggered' : 'Not triggered'}</span>
                </span>
              </div>
              <div className="dl-cond-aff">
                <Ico name="branch" />
                {trig
                  ? <span>Rested: {attached.map((n, i) => <React.Fragment key={n}>{i ? ', ' : ''}<b>{n}</b></React.Fragment>)}</span>
                  : <span>Attached: {attached.map((n, i) => <React.Fragment key={n}>{i ? ', ' : ''}<b>{n}</b></React.Fragment>)} — ran normally</span>}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

// ── The whole group log panel (opens inline under the group header) ──
function GroupLog({ state, group, onClose }) {
  const day = isoDay();
  const inGroup = state.pickers.filter((p) => (p.group || 'Other') === group && !p.hidden);
  const order = (state.pickerOrder && state.pickerOrder[group]) || [];
  const pickers = inGroup.slice().sort((a, b) => {
    const ia = order.indexOf(a.id), ib = order.indexOf(b.id);
    return (ia === -1 ? 1e6 : ia) - (ib === -1 ? 1e6 : ib);
  });
  const suppressed = (p) => {
    if (!p.conditionalId) return false;
    const c = (state.conditionals || []).find((x) => x.id === p.conditionalId);
    return !!(c && c.active !== false && c.triggered);
  };
  return (
    <div className="dl-panel">
      <div className="dl-panel-h">
        <span className="dl-kicker"><Ico name="log" /><span>{group} log · generated {fmtTime(state.today.generatedAt)}</span></span>
        {onClose && <button type="button" className="dl-close" aria-label="Close log" onClick={onClose}><Ico name="x" w={2} /></button>}
      </div>
      <div className="dl-key">
        <span className="dl-kicker">Key</span>
        <span className="dl-key-items">
        <span className="dl-ki"><span className="dl-ico dl-c-auto"><Ico name="shuffle" /></span><b>Auto-picked</b></span>
        <span className="dl-ki"><span className="dl-ico dl-c-push"><Ico name="push" w={2.4} /></span><b>Pushed</b></span>
        <span className="dl-ki"><span className="dl-ico dl-c-roll"><Ico name="roll" w={2.2} /></span><b>Rolled off</b></span>
        <span className="dl-ki"><span className="dl-ico dl-c-skip"><Ico name="x" w={2.6} /></span><b>Skipped</b></span>
        <span className="dl-ki"><span className="dl-ico dl-c-done"><Ico name="check" w={3} /></span><b>Completed</b></span>
        </span>
      </div>
      <div className="dl-body">
        <CondSection state={state} pickersInGroup={pickers} day={day} />
        {pickers.map((p) => (
          <PickerBlock key={p.id} state={state} picker={p} day={day} suppressed={suppressed(p)} />
        ))}
      </div>
    </div>
  );
}

// ── Reminders log (schedule-derived; no value snapshot needed) ──
function fmtDue(next, day) {
  if (!next) return 'No upcoming';
  const [y, m, d] = day.split('-').map(Number);
  const today0 = new Date(y, m - 1, d);
  const next0 = new Date(next.getFullYear(), next.getMonth(), next.getDate());
  const days = Math.round((next0 - today0) / 86400000);
  if (days <= 1) return 'Due tomorrow';
  if (days <= 13) return `Due in ${days} days`;
  return 'Due ' + next.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function RemindersLog({ state, onClose }) {
  // Pinned to the last generation, not live "now" (TASKS.anchorDate) — this
  // panel is a snapshot of the Reminders section right above it, which is
  // itself frozen to the last generate() until the next one runs.
  const anchor = TASKS.anchorDate(state.today && state.today.generatedAt);
  const day = isoDay(anchor);
  const tasks = (state.tasks || []).filter((t) => !t.hidden);
  const visible = TASKS.visibleToday(state.tasks, state.reminderOpts, state.holidays, anchor);
  const visibleIds = new Set(visible.map((t) => t.id));
  const skippedIds = new Set((state.reminderSkipLog || [])
    .filter((r) => isoDay(new Date(r.skippedAt)) === day).map((r) => r.taskId));

  const rows = tasks.map((t) => {
    const done = TASKS.isDoneToday(t, anchor);
    let status = 'notdue';
    if (done) status = 'done';
    else if (skippedIds.has(t.id)) status = 'skip';
    else if (visibleIds.has(t.id)) status = 'due';
    let dueLabel = null;
    if (status === 'notdue') {
      // respectSkipUntil: this label says when the reminder will REAPPEAR, so a
      // manual skip has to be honored or the date lands inside the skip window.
      const next = TASKS.nextEligible(t, state.reminderOpts, state.holidays, anchor, true);
      dueLabel = fmtDue(next, day);
    }
    return { t, status, dueLabel, when: TASKS.summary(t) };
  });
  const rank = { done: 0, due: 1, skip: 2, notdue: 3 };
  rows.sort((a, b) => (rank[a.status] - rank[b.status]) || (a.t.name < b.t.name ? -1 : 1));

  return (
    <div className="dl-panel">
      <div className="dl-panel-h">
        <span className="dl-kicker"><Ico name="clock" /><span>Reminders log · {anchor.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span></span>
        {onClose && <button type="button" className="dl-close" aria-label="Close log" onClick={onClose}><Ico name="x" w={2} /></button>}
      </div>
      <div className="dl-body dl-body--rem">
        {/* dl-mk-r* below are pure selector hooks for help mode (see
            help-content.jsx) — kept separate from .dl-r-name/.dl-r-when/
            .dl-r-st, which carry their own font styling meant for data
            rows; reusing those directly on the header would restyle it
            away from the small-caps look every other header cell has. */}
        <div className="dl-rt-head"><span className="dl-mk-rname">Reminder</span><span className="dl-mk-rwhen">When</span><span className="r dl-mk-rst">Status</span></div>
        {rows.length === 0 && <div className="dl-empty">No reminders yet.</div>}
        {rows.map(({ t, status, dueLabel, when }) => (
          <div key={t.id} className={`dl-rt-row ${status === 'done' ? 'is-done' : status === 'due' ? 'is-due' : status === 'notdue' ? 'is-notdue' : ''}`}>
            <InfoTip className="dl-r-name dl-mk-rname" label={t.name}>{t.name}</InfoTip>
            <span className="dl-r-when dl-mk-rwhen">{when}</span>
            <span className="dl-r-st dl-mk-rst">
              {status === 'done' && <><span className="dl-ico dl-c-done"><Ico name="check" w={3} /></span><span className="dl-st-pill dl-st-done">Done</span></>}
              {status === 'due' && <span className="dl-st-pill dl-st-due">Due today</span>}
              {status === 'skip' && <><span className="dl-ico dl-c-skip"><Ico name="x" w={2.6} /></span><span className="dl-st-pill dl-st-skip">Skipped</span></>}
              {status === 'notdue' && <span className="dl-st-not">{dueLabel}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export { DayLogChip, GroupLog, RemindersLog };
