import { CADENCE } from './cadence.js';
import { Segmented } from './reminders.jsx';
import { Collapse, InfoTip } from './ui.jsx';

// CadenceControl — shared editor for a picker's surfacing cadence + anchor.
// Used by the picker create-flow (tab-picker) and the Data-tab picker controls
// (tab-data). Emits patches via `onChange(patch)`; the caller owns storage.
//
// value: { cadence, anchorDow, anchorDom, anchorMonth, anchorDay }
// Reuses the Segmented control + the Reminders scheduling styles (rem-*).
const CAD_OPTS = [
  { key: 'daily',   label: 'Daily',   sub: <>surfaces <strong>every day</strong> it runs (the standard behavior)</> },
  { key: 'weekly',  label: 'Weekly',  sub: <>surfaces <strong>once a week</strong>, on the weekday you choose below — pick will persist until marked as completed</> },
  { key: 'monthly', label: 'Monthly', sub: <>surfaces <strong>once a month</strong>, on the day you choose below — pick will persist until marked as completed</> },
  { key: 'yearly',  label: 'Yearly',  sub: <>surfaces <strong>once a year</strong>, on the date you choose below — pick will persist until marked as completed</> },
];
const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const ord = (n) => { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };
const daysInMonth = (m1) => new Date(2024, m1, 0).getDate(); // leap year → allows Feb 29

function CadenceControl({ value, onChange }) {
  const v = CADENCE.normalize(value || {});
  const set = (patch) => onChange(patch);
  const sub = (CAD_OPTS.find((o) => o.key === v.cadence) || {}).sub;
  return (
    <div className="cad-ctl">
      <div className="rem-field">
        <div className="rem-flabel-wrap">
          <span className="rem-flabel pie-lbl-row">How often?
            {v.cadence === 'daily' && (
              <InfoTip className="pie-help pie-help--sm" label={CADENCE.tipFor('daily', 'Which days?')}>?</InfoTip>
            )}
          </span>
          <span className="rem-flabel-sub set-sub-fade" key={v.cadence}>{sub}</span>
        </div>
        <Segmented options={CAD_OPTS} value={v.cadence}
                          onChange={(key) => set({ cadence: key })} ariaLabel="Cadence" />
      </div>

      <Collapse open={v.cadence !== 'daily'}>
      <div className="cad-anchor-fade" key={v.cadence}>
      {v.cadence === 'weekly' && (
        <div className="rem-field">
          <div className="rem-flabel-wrap">
            <span className="rem-flabel pie-lbl-row">On which day?
              <InfoTip className="pie-help" label={CADENCE.tipFor('weekly', 'Which days?')}>?</InfoTip>
            </span>
            <span className="rem-flabel-sub">surfaces <strong>every {DAY_FULL[v.anchorDow]}</strong></span>
          </div>
          <div className="rem-inline">
            <span>Every</span>
            <select className="np-input rem-sel" value={v.anchorDow}
                    onChange={(e) => set({ anchorDow: parseInt(e.target.value) })}
                    aria-label="Anchor weekday">
              {DAY_FULL.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>
        </div>
      )}

      {v.cadence === 'monthly' && (
        <div className="rem-field">
          <div className="rem-flabel-wrap">
            <span className="rem-flabel pie-lbl-row">On which day?
              <InfoTip className="pie-help" label={CADENCE.tipFor('monthly', 'Which days?')}>?</InfoTip>
            </span>
            <span className="rem-flabel-sub">surfaces the <strong>{ord(v.anchorDom)} of every month</strong></span>
          </div>
          <div className="rem-inline">
            <span>On the</span>
            <select className="np-input rem-sel" value={v.anchorDom}
                    onChange={(e) => set({ anchorDom: parseInt(e.target.value) })}
                    aria-label="Anchor day of month">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>{ord(d)}</option>
              ))}
            </select>
          </div>
          {v.anchorDom > 28 && (
            <p className="rem-hint">In shorter months this falls on the last day.</p>
          )}
        </div>
      )}

      {v.cadence === 'yearly' && (
        <div className="rem-field">
          <div className="rem-flabel-wrap">
            <span className="rem-flabel pie-lbl-row">On which date?
              <InfoTip className="pie-help" label={CADENCE.tipFor('yearly', 'Which days?')}>?</InfoTip>
            </span>
            <span className="rem-flabel-sub">
              surfaces <strong>every {MONTHS[v.anchorMonth - 1]} {ord(Math.min(v.anchorDay, daysInMonth(v.anchorMonth)))}</strong>
            </span>
          </div>
          <div className="rem-inline">
            <span>Every</span>
            <select className="np-input rem-sel" value={v.anchorMonth}
                    onChange={(e) => set({ anchorMonth: parseInt(e.target.value) })}
                    aria-label="Anchor month">
              {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
            <select className="np-input rem-sel" value={Math.min(v.anchorDay, daysInMonth(v.anchorMonth))}
                    onChange={(e) => set({ anchorDay: parseInt(e.target.value) })}
                    aria-label="Anchor day">
              {Array.from({ length: daysInMonth(v.anchorMonth) }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>{ord(d)}</option>
              ))}
            </select>
          </div>
          {v.anchorMonth === 2 && v.anchorDay === 29 && (
            <p className="rem-hint">In common (non-leap) years this falls on Feb 28.</p>
          )}
        </div>
      )}
      </div>
      </Collapse>
    </div>
  );
}

export { CadenceControl, CAD_OPTS };
