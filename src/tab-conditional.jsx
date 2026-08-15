import { normalizeConditionalName } from './pickers.js';
import { MODES } from './seed.js';
import { BoostReset, Btn, Collapse, FillButton, Icon, InfoTip, NumStepper } from './ui.jsx';

// Conditional controls — the reusable "type + settings" editor for a conditional,
// bound to a plain draft object via onChange. Used in the Pickers create-flow
// now, and (later) the Data tab conditional editor. Mirrors the per-item picker
// controls: mode radio (same options/copy as pickers), then per-mode controls —
// weight (weighted/dynamic), Boost + Reset (dynamic), Soonest/Latest + Fill/Refill
// (ease modes) — plus Name, day-off card text, and an Active toggle.
const THRESHOLD = 100;
const driftToSoonest = (easeMax) => Math.max(1, Math.round(THRESHOLD / (easeMax || 1)));
const driftToLatest = (easeMin) => Math.max(1, Math.round(THRESHOLD / (easeMin || 1)));
const daysToDrift = (days) => THRESHOLD / Math.max(1, days);

// Conditional-specific mode explanations (distinct from picker MODES hints).
const CND_HINTS = {
  random: ['Ruleset: This conditional\u2019s ruleset uses a non-adjustable, static value of 50% for triggering the conditional.', 'Explanation: This is a good choice for being truly random, but it also has some drawbacks. e.g. it can be triggered multiple times in a row or it can go a long time without being triggered.'],
  weighted: ['Ruleset: This conditional\u2019s ruleset uses an adjustable, weighted value that ranges from 10%\u201390%, with a default of 50%, for triggering the conditional.', 'Explanation: This is a good choice for mitigating some of the Truly random drawbacks by tuning the % chance to make it more (or less) likely to trigger. e.g. it can still be triggered multiple times in a row or it can go a long time without being triggered, although it is less likely to do so.'],
  dynamic: ['Ruleset: This conditional\u2019s ruleset is exactly the same as the Weighted conditional, but it also adds a second value that increments the weighted value every time it does not trigger and then resets its value every time that it does.', 'Explanation: This is a good choice for mitigating almost all of the Truly random drawbacks by tuning the % chance to make it more (or less) likely to trigger. Furthermore, by adding a dynamic value it makes it increasingly likely to trigger when it doesn\u2019t and less likely when it does. e.g. it can still be triggered multiple times in a row or it can go a long time without being triggered, although it is much less likely to do so.'],
  'ease-up': ['Ruleset: This conditional\u2019s ruleset makes it so that it is ineligible to be triggered until its value reaches 100, at which point it is guaranteed to trigger. Said value will start at 0 and is incremented every cycle by a random amount within a user defined range.', 'Explanation: This is a good choice for ensuring that the conditional can only be triggered once every X days and can never be triggered multiple times in a row. e.g. it can only be triggered at most once a week and must be triggered at least once every two weeks.'],
  'ease-down': ['Ruleset: This conditional\u2019s ruleset is the opposite of the Ease-up conditional. It makes it so that it is guaranteed to be triggered until its value reaches 0, at which point it will be ineligible for exactly one cycle. Said value will start at 100 and is decremented every cycle by a random amount within a user defined range.', 'Explanation: This is a good choice for ensuring that the conditional stays triggered for at least X days and then is not triggered for exactly one day. e.g. it must remain triggered for at least a week and must not remain triggered for more than two weeks.'],
};
const RANDOM_NOTE = 'Truly random conditionals have no options and function like a coin flip. e.g. it is 50/50 whether it gets triggered or not.';

function ConditionalControls({ draft, onChange, nameError, variant = 'card', hideName = false }) {
  const set = (patch) => onChange({ ...draft, ...patch });
  const mode = draft.mode || 'random';
  const isEase = mode === 'ease-up' || mode === 'ease-down';
  const isDown = mode === 'ease-down';
  const usesWeight = mode === 'weighted' || mode === 'dynamic';
  const isDynamic = mode === 'dynamic';
  const inline = variant === 'inline';

  const eMin = draft.easeMin ?? 7, eMax = draft.easeMax ?? 14;
  const soonest = driftToSoonest(eMax), latest = driftToLatest(eMin);
  const setSoonest = (days) => {
    const easeMax = daysToDrift(Math.max(1, Math.min(100, days)));
    set({ easeMax, easeMin: Math.min(eMin, easeMax) });
  };
  const setLatest = (days) => {
    const easeMin = daysToDrift(Math.max(1, Math.min(100, days)));
    set({ easeMin, easeMax: Math.max(eMax, easeMin) });
  };
  const soonestLbl = isDown ? 'Shortest' : 'Soonest';
  const latestLbl = isDown ? 'Longest' : 'Latest';
  const soonestSub = isDown
    ? `stays triggered ${soonest} ${soonest === 1 ? 'day' : 'days'} minimum`
    : `${soonest} ${soonest === 1 ? 'day' : 'days'} until it can trigger`;
  const latestSub = isDown
    ? `stays triggered ${latest} ${latest === 1 ? 'day' : 'days'} maximum`
    : `${latest} ${latest === 1 ? 'day' : 'days'} until it must trigger`;
  const threshold = draft.threshold ?? 100;

  return (
    <div className={`cnd-controls ${inline ? 'cnd-controls--inline' : ''}`}>
      {!hideName && (
      <div className="np-field">
        <label className="np-label">Conditional name</label>
        <input className={`np-input ${nameError ? 'is-error' : ''}`} type="text" value={draft.name} maxLength={40}
               placeholder="Conditional name" aria-invalid={!!nameError}
               onChange={(e) => set({ name: e.target.value })}
               onBlur={(e) => { const n = normalizeConditionalName(e.target.value); if (n) set({ name: n }); }}
               onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} />
        {nameError && <p className="np-error">{nameError}</p>}
      </div>
      )}
      <div className="np-field np-field--cardtext">
        <div className="np-cardtext-text">
          <label className="np-label">Replacement card text</label>
          <p className="np-help">Shown on the card that appears in Today when this conditional suppresses its picker.</p>
        </div>
        <input className="np-input" type="text" value={draft.cardText} maxLength={60}
               placeholder="Picker suppressed for today"
               onChange={(e) => set({ cardText: e.target.value })} />
      </div>

      <div className="cnd-type-group">
      <div className="np-field">
        <label className="np-label">How should it decide?</label>
        <div className={inline ? '' : 'cnd-mode-card style-radio-card'}>
          <div className="rd-mode-radio">
            {Object.entries(MODES).map(([key, m]) => {
              const on = mode === key;
              return (
                <label key={key} className={`rd-mode-opt ${on ? 'is-on' : ''}`}>
                  <input type="radio" name="cnd-mode" checked={on}
                         onChange={() => set({ mode: key,
                           value: key === 'ease-down' ? threshold : 0,
                           triggered: key === 'ease-down' })} />
                  <span className="rd-mode-dot" aria-hidden="true"></span>
                  <span className="rd-mode-text">
                    <span className="rd-mode-name">{m.label}</span>
                    {/* Hint expands/collapses on selection change, matching the
                        Data tab's picker mode radio. */}
                    <Collapse open={on}>
                      {Array.isArray(CND_HINTS[key])
                        ? CND_HINTS[key].map((para, pi) => <span key={pi} className="rd-mode-hint">{para}</span>)
                        : <span className="rd-mode-hint">{CND_HINTS[key] || m.hint}</span>}
                    </Collapse>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <Collapse open={mode === 'random'}>
        <div className="cnd-typectl pie-rows">
          <div className="pie-row">
            <div className="pie-rowlabel">
              <span className="pie-lbl">Weight</span>
              <span className="pie-sub">{RANDOM_NOTE}</span>
            </div>
            <span className="pie-noweight">No weight</span>
          </div>
        </div>
      </Collapse>
      <Collapse open={usesWeight}>
        <div className="cnd-typectl pie-rows">
          <div className="pie-row">
            <div className="pie-rowlabel">
              <span className="pie-lbl">Odds</span>
              <span className="pie-sub"><strong>{draft.oddsPct ?? 50}%</strong>{` chance to trigger${isDynamic ? ' (before boost)' : ''}`}</span>
            </div>
            <div className="weight-stepper">
              <button onClick={() => set({ oddsPct: Math.max(10, (draft.oddsPct ?? 50) - 10) })} disabled={(draft.oddsPct ?? 50) <= 10} aria-label="Lower odds">−</button>
              <span className="weight-val">{draft.oddsPct ?? 50}%</span>
              <button onClick={() => set({ oddsPct: Math.min(90, (draft.oddsPct ?? 50) + 10) })} disabled={(draft.oddsPct ?? 50) >= 90} aria-label="Raise odds">+</button>
            </div>
          </div>
          <Collapse open={isDynamic}>
            <div className="pie-row">
              <div className="pie-rowlabel">
                <span className="pie-lbl">Boost</span>
                <span className="pie-sub set-sub-fade" key={(draft.value || 0) === 0 ? 'none' : 'boost'}>{(draft.value || 0) === 0 ? <><strong>no bonus</strong> to odds, will increase when not triggered</> : <><strong>+{draft.value}%</strong> to odds, resets when triggered</>}</span>
              </div>
              <div className="pie-ctl">
                <BoostReset value={draft.value || 0} suffix="%" onReset={() => set({ value: 0 })} />
              </div>
            </div>
          </Collapse>
        </div>
      </Collapse>
      <Collapse open={isEase}>
        <div className="cnd-typectl pie-rows">
          {/* cnd-ease-up-row / cnd-ease-down-row (in addition to the shared
              pie-row) are pure selector hooks for help mode — see
              help-content.jsx's newCondEaseUp/newCondEaseDown — split by
              direction the same way EntryEditor's own pie-ease-up-row/
              pie-ease-down-row are, since Soonest/Latest/Fill and Shortest/
              Longest/Refill need entirely different tip copy. */}
          <div className={`pie-row ${isDown ? 'cnd-ease-down-row' : 'cnd-ease-up-row'}`}>
            <div className="pie-rowlabel">
              <span className="pie-lbl-row"><span className="pie-lbl">{soonestLbl}</span></span>
              <span className="pie-sub set-sub-fade" key={soonest}>{isDown ? <>stays triggered <strong>{soonest} {soonest === 1 ? 'day' : 'days'}</strong> minimum</> : <><strong>{soonest} {soonest === 1 ? 'day' : 'days'}</strong> until it can trigger</>}</span>
            </div>
            <div className="pie-ctl">
              <NumStepper value={soonest} min={1} max={100} onSet={setSoonest} ariaLabel={soonestLbl} />
              <span className="np-ease-unit">{soonest === 1 ? 'day' : 'days'}</span>
            </div>
          </div>
          <div className={`pie-row ${isDown ? 'cnd-ease-down-row' : 'cnd-ease-up-row'}`}>
            <div className="pie-rowlabel">
              <span className="pie-lbl-row"><span className="pie-lbl">{latestLbl}</span></span>
              <span className="pie-sub set-sub-fade" key={latest}>{isDown ? <>stays triggered <strong>{latest} {latest === 1 ? 'day' : 'days'}</strong> maximum</> : <><strong>{latest} {latest === 1 ? 'day' : 'days'}</strong> until it must trigger</>}</span>
            </div>
            <div className="pie-ctl">
              <NumStepper value={latest} min={1} max={100} onSet={setLatest} ariaLabel={latestLbl} />
              <span className="np-ease-unit">{latest === 1 ? 'day' : 'days'}</span>
            </div>
          </div>
          {!isDown && (
            <div className="pie-row cnd-ease-up-row">
              <div className="pie-rowlabel">
                <span className="pie-lbl">Fill</span>
                <span className="pie-sub set-sub-fade" key={(draft.value ?? 0) >= threshold ? 'full' : 'part'}>{(draft.value ?? 0) >= threshold ? <>conditional is <strong>fully charged</strong></> : <>conditional at <strong>{Math.round(draft.value ?? 0)} charge</strong></>}</span>
              </div>
              <FillButton label="Fill"
                   disabled={(draft.value ?? 0) >= threshold}
                   onClick={() => set({ value: threshold, triggered: true })} />
            </div>
          )}
          {isDown && (
            <div className="pie-row cnd-ease-down-row">
              <div className="pie-rowlabel">
                <span className="pie-lbl">Refill</span>
                <span className="pie-sub set-sub-fade" key={(draft.value ?? 0) >= threshold ? 'full' : 'part'}>{(draft.value ?? 0) >= threshold ? <>conditional is <strong>fully charged</strong></> : <>conditional at <strong>{Math.round(draft.value ?? 0)} charge</strong></>}</span>
              </div>
              <FillButton label="Refill"
                   disabled={(draft.value ?? 0) >= threshold}
                   onClick={() => set({ value: threshold, triggered: true })} />
            </div>
          )}
        </div>
      </Collapse>
      <div className="cnd-typectl pie-rows">
        <div className="pie-row">
          <div className="pie-rowlabel">
            <span className="pie-lbl">Active</span>
            <span className="pie-sub set-sub-fade" key={draft.active !== false ? (isDown ? 'on-down' : 'on') : 'off'}>{draft.active !== false
              ? (isDown
                  ? <>conditional <strong>is active</strong>, picker will not run until conditional fully discharges</>
                  : <>conditional <strong>is active</strong>, if triggered picker will not run for one cycle</>)
              : <>conditional is <strong>not active</strong>, picker will always run</>}</span>
          </div>
          <button type="button" className={`switch ${draft.active !== false ? 'is-on' : ''}`}
                  role="switch" aria-checked={draft.active !== false} aria-label="Active"
                  onClick={() => set({ active: draft.active === false })}><i /></button>
        </div>
      </div>
      </div>
    </div>
  );
}

export { ConditionalControls };
// Default draft. Name follows "{Picker} Conditional N", incrementing N past any
// existing conditional with that name (case-insensitive).
export const conditionalDraftDefault = (pickerName, existingNames = []) => {
  const pn = (normalizeConditionalName(pickerName) || '').trim();
  const base = (pn ? pn + ' ' : '') + 'Conditional';
  const taken = new Set(existingNames.map((n) => (n || '').trim().toLowerCase()));
  let n = 1;
  while (taken.has(`${base} ${n}`.toLowerCase())) n++;
  return {
    name: `${base} ${n}`, cardText: 'Picker suppressed for today',
    mode: 'random', weight: 1, oddsPct: 50, easeMin: 7, easeMax: 14, value: 0, active: true, triggered: false, threshold: 100,
  };
};
