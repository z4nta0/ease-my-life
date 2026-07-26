import React from 'react';
import { CadenceControl } from './cadence-control.jsx';
import { CADENCE } from './cadence.js';
import { EntryEditor } from './tab-today.jsx';
import { emlTour, useEmlTour } from './onboarding.jsx';
import { PICKERS, normalizeConditionalName, normalizeGroupName } from './pickers.js';
import { MODES } from './seed.js';
import { ConditionalControls, conditionalDraftDefault } from './tab-conditional.jsx';
import { Btn, Collapse, Icon, InfoTip, Pill, ProgressBar, WeekdayChips, reduceMotion } from './ui.jsx';

// PickerView — the heart of the app. Choose a saved picker, hit "Pick",
// watch the cycle animation, and apply the result. Three animation styles
// driven by the `style` prop ('reel' | 'spotlight' | 'dissolve').

function PickerStrip({ candidates, picked, style, onDone, forceMotion }) {
  // The cycle visualisation. All three styles share the same timing curve:
  // a fixed number of switches that decelerate toward `picked`.
  const len = candidates.length;
  const pickedIdx = (picked && len) ? candidates.findIndex((c) => c.id === picked.id) : 0;
  const STEPS = 22;
  // `idx` is an ABSOLUTE, monotonically-increasing row position (not a
  // modulo index). Advancing it by a constant +1 each step keeps the reel
  // sliding in one direction the whole time — the old code took idx modulo
  // the list length, so every time it wrapped past the last item the reel
  // snapped backwards a full height, which was a big part of the stutter.
  //
  // We pre-pick a start offset so that after exactly STEPS constant steps the
  // reel lands on pickedIdx (mod len), with a couple of full loops of runway
  // above it.
  const startPos = len ? ((((pickedIdx - STEPS) % len) + len) % len) + len * 2 : 0;
  const [idx, setIdx] = React.useState(startPos);
  // Per-step transition duration. The key fix: each move animates over the
  // SAME time as the gap until the next move, so transitions are never cut
  // off mid-flight (fast start) and never sit idle waiting (slow end) — the
  // motion is one continuous, decelerating glide.
  const [dur, setDur] = React.useState(0);
  // Reduced motion skips the cycle entirely: the pick is already decided in
  // runPick before this component mounts, so the reel/spotlight/dissolve is pure
  // theatre. Mount straight into 'settled' — freezing the visuals via CSS alone
  // would still leave the 22-step timer running (~2.5s) before onDone fires,
  // which gates the Send button behind a static screen with no feedback.
  // `forceMotion` is set by the Settings preview: pressing Play is an explicit
  // request to see the animation, so it opts out of the reduced-motion skip.
  const reduce = !forceMotion && !!(reduceMotion && reduceMotion());
  const [phase, setPhase] = React.useState(reduce ? 'settled' : 'cycling'); // cycling | settled
  const wrapRef = React.useRef(null);

  React.useEffect(() => {
    if (!len || !picked) return;
    if (reduce) {
      // Hand control back on the next tick so the parent's phase transition
      // ('running' → 'done') doesn't happen mid-render.
      const t = setTimeout(() => { onDone && onDone(); }, 0);
      return () => clearTimeout(t);
    }
    let pos = startPos;
    let i = 0;
    let cancelled = false;
    const schedule = (gap) => {
      if (cancelled) return;
      setTimeout(() => {
        if (cancelled) return;
        i++;
        if (i > STEPS) {
          setPhase('settled');
          onDone && onDone();
          return;
        }
        pos += 1;
        // Decelerate: ~40ms → ~300ms. The transition into this position lasts
        // exactly until the next step fires, so segments butt up seamlessly.
        const t = i / STEPS;
        const gapNext = 40 + Math.pow(t, 2.2) * 260;
        setDur(gapNext);
        setIdx(pos);
        schedule(gapNext);
      }, gap);
    };
    const kick = setTimeout(() => schedule(40), 30);
    return () => { cancelled = true; clearTimeout(kick); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked]);

  // One calm end-state for every style: the chosen name, already landed. Matches
  // what PickerAnimStage shows for the Settings preview.
  if (reduce) {
    return (
      <div className="dissolve dissolve--settled">
        <span className="dissolve-name">{picked ? picked.name : ''}</span>
      </div>
    );
  }

  // ── Reel: vertical strip, shifts up
  if (style === 'reel') {
    const ROW = 56;
    const visible = 5; // odd, so picked sits in center
    const top = -(idx * ROW) + (Math.floor(visible / 2) * ROW);
    // Render enough rows (each mapped back to a candidate by modulo) to cover
    // the full monotonic travel plus the visible window above the landing.
    const rowCount = startPos + STEPS + visible + 4;
    return (
      <div className={`reel reel--${phase}`} style={{ height: ROW * visible }}>
        <div className="reel-track"
             style={{ transform: `translateY(${top}px)`, transitionDuration: `${dur}ms` }}>
          {Array.from({ length: rowCount }, (_, i) => (
            <div key={i}
                 className={`reel-row ${phase === 'settled' && i === idx ? 'is-on' : ''}`}>
              {candidates[i % len].name}
            </div>
          ))}
        </div>
        <div className="reel-mask" />
        <div className="reel-line" />
      </div>
    );
  }

  // ── Dissolve: a single name swaps with a soft cross-fade
  if (style === 'dissolve') {
    const cur = candidates[idx % len];
    return (
      <div className={`dissolve dissolve--${phase}`}>
        <span key={idx + '_' + cur.id} className="dissolve-name">
          {cur ? cur.name : ''}
        </span>
        {phase === 'settled' && <div className="dissolve-glow" />}
      </div>
    );
  }

  // ── Spotlight: vertical list of all candidates, the active one highlights
  const list = candidates.slice(0, 10); // cap visible list at 10
  return (
    <div ref={wrapRef} className={`spot spot--${phase}`}>
      {list.map((c, i) => {
        const isOn = (i === idx % list.length);  // eslint-disable-line
        return (
          <div key={c.id} className={`spot-row ${isOn ? 'is-on' : ''}`}>
            <span>{c.name}</span>
          </div>
        );
      })}
    </div>
  );
}

export { PickerStrip };

function PickerView({ picker, state, actions, animStyle }) {
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [phase, setPhase] = React.useState('idle'); // idle | running | done | sent | empty
  // Drives the exit animation on Re-roll / Done: hold the buttons mounted with
  // an out-animation for a beat, then run the real transition.
  const [leaving, setLeaving] = React.useState(false);
  const afterExit = (fn) => {
    if (reduceMotion()) { fn(); return; }
    setLeaving(true);
    setTimeout(() => { setLeaving(false); fn(); }, 180);
  };
  const [showState, setShowState] = React.useState(picker.mode !== 'random' && picker.mode !== 'weighted');
  // Add-new-items: held as a LOCAL draft (not committed to the store) until
  // Save, so a reload or tab-switch discards an in-progress item — matching the
  // new-picker create flow. `newDraft` is the editing item; a synthetic actions
  // object edits it; on Save it's committed via the real store actions.
  const [newDraft, setNewDraft] = React.useState(null);
  const [insertSavedId, setInsertSavedId] = React.useState(null);
  const [confirmDelId, setConfirmDelId] = React.useState(null);
  const [confirmLeaveId, setConfirmLeaveId] = React.useState(null);
  const cancelConfirm = () => {
    if (reduceMotion()) { setConfirmDelId(null); return; }
    setConfirmLeaveId(confirmDelId);
    setTimeout(() => { setConfirmLeaveId(null); setConfirmDelId(null); }, 150);
  };
  const [removingId, setRemovingId] = React.useState(null);
  const [sentId, setSentId] = React.useState(null);
  const sendToday = (id) => {
    // Full parity with "Pick one" → Send: run the engine forcing this item, then
    // stage the identical pending mutation (drift/weight + bumpPick) so marking
    // it done has the same consequence as a natural pick. Ease-down replaces the
    // picker's single entry; other modes add one (handled in addTodayEntry).
    const res = PICKERS.pick(picker, state.items, { forceItemId: id });
    if (!res || !res.picked) return;
    actions.addTodayEntry(picker.id, res.picked.id, {
      updates: res.updates, pickerPatch: res.pickerPatch,
      depletedEnd: res.depletedEnd, pickedId: res.picked.id, bumpPick: true });
    setSentId(id);
    setTimeout(() => setSentId((c) => (c === id ? null : c)), 1400);
  };
  const [newItemClosing, setNewItemClosing] = React.useState(false);
  const addWrapRef = React.useRef(null);
  const usesWeight = picker.mode === 'weighted' || picker.mode === 'dynamic';
  const isEaseMode = picker.mode === 'ease-up' || picker.mode === 'ease-down';
  const draftActions = {
    updateItem: (id, patch) => setNewDraft((d) => d && d.id === id ? { ...d, ...patch } : d),
    setItemWeight: (id, w) => setNewDraft((d) => d && d.id === id ? { ...d, weight: w } : d),
    replaceItem: (id, snap) => setNewDraft((d) => d && d.id === id ? snap : d),
    removeItem: () => setNewDraft(null),
    renameItem: (id, name) => setNewDraft((d) => d && d.id === id ? { ...d, name } : d),
    toggleVacation: (id) => setNewDraft((d) => d && d.id === id ? { ...d, vacation: !d.vacation } : d),
  };
  const commitDraft = (draft) => {
    actions.addItem(picker.id, draft.name, draft.id);
    const patch = {};
    if (usesWeight) patch.weight = draft.weight;
    if (isEaseMode) { patch.easeMin = draft.easeMin; patch.easeMax = draft.easeMax; patch.value = draft.value; }
    if (Object.keys(patch).length) actions.updateItem(draft.id, patch);
    actions.moveItemToEnd(draft.id);
    setInsertSavedId(draft.id);
  };
  const addNewItem = () => {
    if (newDraft) return;   // one draft at a time
    const id = 'it_' + Math.random().toString(36).slice(2, 8);
    setNewDraft({ id, name: 'New item', weight: 1, easeMin: 7, easeMax: 14,
      value: picker.mode === 'ease-down' ? (picker.threshold ?? 100) : 0, vacation: false });
    // Bring the just-opened creation UI fully into view.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const el = addWrapRef.current;
      const sc = el && el.closest('.main');
      if (!el || !sc) return;
      const overflowBelow = el.getBoundingClientRect().bottom - sc.getBoundingClientRect().bottom + 96;
      if (overflowBelow > 0) sc.scrollTo({ top: sc.scrollTop + overflowBelow, behavior: reduceMotion() ? 'auto' : 'smooth' });
    }));
  };

  const pickerItems = state.items.filter((it) => it.pickerId === picker.id);
  const eligibleItems = pickerItems.filter((it) => !it.vacation);
  // Item ids already live on Today — used to disable per-item Send and to keep
  // the "Pick one" spin from landing on a duplicate.
  const onTodayIds = React.useMemo(
    () => new Set((state.today.entries || []).filter((e) => e.itemId).map((e) => e.itemId)),
    [state.today.entries]);

  const mode = MODES[picker.mode];

  const runPick = () => {
    if (busy) return;
    const snapshot = state.items;
    // forceNew: this button is a manual "pick/roll again" action — for
    // ease-down it should offer a real choice, not just re-confirm whatever
    // item is already active (abandoning it recharges it, same as re-roll).
    const res = PICKERS.pick(picker, snapshot, { forceNew: true, excludeIds: onTodayIds });
    if (!res.picked) {
      setResult(res);
      setPhase('empty');
      return;
    }
    setResult(res);
    setBusy(true);
    setPhase('running');
  };

  const onAnimDone = () => {
    setBusy(false);
    setPhase('done');
    // The spin is a PREVIEW — it does NOT mutate item state. The chosen pick's
    // value/weight changes are staged and applied only when the resulting Today
    // entry is marked done (see sendToToday → addTodayEntry pending).
  };

  const reroll = () => {
    setPhase('idle');
    setResult(null);
    setTimeout(runPick, 50);
  };

  const sendToToday = () => {
    if (phase !== 'done' || !result || !result.picked) return;
    // Stage the spin's computed mutation on the entry; it applies on done.
    actions.addTodayEntry(picker.id, result.picked.id, {
      updates: result.updates, pickerPatch: result.pickerPatch,
      depletedEnd: result.depletedEnd, pickedId: result.picked.id, bumpPick: true });
    // Confirmation beat: the stage swaps to a “Added to Today” checkmark and
    // the button morphs to “Sent!”, then the picker resets to idle so it’s
    // ready for the next pick.
    setPhase('sent');
    setTimeout(() => { setPhase('idle'); setResult(null); }, 1500);
  };

  return (
    <div className="picker-view">
      <header className="picker-h">
        <div>
          <div className="kicker">Picker</div>
          <h2 className="picker-title">{picker.name}</h2>
        </div>
        <Pill tone="mode">{mode.label}</Pill>
      </header>
      {Array.isArray(mode.hint)
        ? mode.hint.map((para, pi) => <p key={pi} className="picker-hint">{para}</p>)
        : <p className="picker-hint">{mode.hint}</p>}
      <p className="picker-hint">Please note that any items in this picker's pool that are already included in the Today tab will be excluded from being selected.</p>

      <div className="picker-stage">
        {phase === 'idle' && (
          <div className="stage-idle">
            <div className="stage-idle-num">{eligibleItems.filter((it) => !onTodayIds.has(it.id)).length}</div>
            <div className="stage-idle-lbl">items in the pool</div>
          </div>
        )}
        {(phase === 'running' || phase === 'done') && result && result.picked && (
          <PickerStrip
            candidates={result.cycleCandidates}
            picked={result.picked}
            style={animStyle}
            onDone={onAnimDone}
          />
        )}
        {phase === 'sent' && result && result.picked && (
          <div className="stage-sent">
            <div className="stage-sent-check"><Icon name="check" size={26} /></div>
            <div className="stage-sent-name">{result.picked.name}</div>
            <div className="stage-idle-lbl">Added to Today</div>
          </div>
        )}
        {phase === 'empty' && (
          <div className="stage-empty">
            <div className="stage-idle-num">—</div>
            <div className="stage-idle-lbl">
              {picker.mode === 'ease-up'
                ? 'Nothing eligible yet. Run again to drift items closer.'
                : picker.mode === 'ease-down'
                ? 'Everything is depleted. Refill the picker to bring items back.'
                : 'No items in this picker.'}
            </div>
            {picker.mode === 'ease-down' && (
              <Btn kind="primary" size="sm" icon="refresh"
                   onClick={() => actions.refillPicker(picker.id)}>Refill</Btn>
            )}
          </div>
        )}
      </div>

      <div className="picker-actions">
        {(phase === 'done' || phase === 'sent') ? (
          <>
            <Btn kind="primary" icon="check" onClick={sendToToday}
                 className={`pv-act ${phase === 'sent' ? 'is-sent' : ''}`} style={{ animationDelay: '0ms' }}>
              <span className="pv-send-label set-sub-fade" key={phase === 'sent' ? 'sent' : 'send'}>
                {phase === 'sent' ? 'Sent!' : 'Send to Today'}
              </span>
            </Btn>
            <Btn kind="ghost" icon="refresh" onClick={() => afterExit(reroll)}
                 className={`pv-act ${(leaving || phase === 'sent') ? 'is-leaving' : ''}`} style={{ animationDelay: '60ms' }}>Re-roll</Btn>
            <Btn kind="ghost" size="sm" onClick={() => afterExit(() => { setPhase('idle'); setResult(null); })}
                 className={`pv-act ${(leaving || phase === 'sent') ? 'is-leaving' : ''}`} style={{ animationDelay: '120ms' }}>Done</Btn>
          </>
        ) : (
          <Btn kind="primary" icon="play" onClick={runPick} disabled={busy} className="pv-act">
            {busy ? 'Picking\u2026' : 'Pick one'}
          </Btn>
        )}
      </div>

      <div className="picker-pool">
        <div className="pool-h">
          <span className="kicker">Pool · {eligibleItems.filter((it) => !onTodayIds.has(it.id) && PICKERS.modeEligible(it, picker)).length} of {pickerItems.length} eligible</span>
          {(picker.mode !== 'random' && picker.mode !== 'weighted') && (
            <button className="ghost-link" onClick={() => setShowState((s) => !s)}>
              <Icon name={showState ? 'eye_off' : 'eye'} size={13} />
              {showState ? 'Hide drift' : 'Show drift'}
            </button>
          )}
        </div>
        <div className="pool-list">
          {pickerItems.map((it) => {
            const r = PICKERS.readiness(it, picker.mode, picker.threshold ?? 100);
            const eligibleHere = PICKERS.modeEligible(it, picker);
            // Plain-language explanation of the weight number for the hover
            // tooltip on the wN pill. (wN itself is fixed — it never drifts.)
            const w = it.weight;
            const weightTip = w === 1
              ? 'Weight 1 — the baseline pick rate.'
              : `Weight ${w} — ${w}× as likely to be picked as a w1 item.`;
            // Explanation of the drifting `value` shown to the left of wN.
            // This is the part that changes run-to-run; what it means depends
            // on the picker's mode.
            const thr = picker.threshold ?? 100;
            const valueTip =
              picker.mode === 'dynamic'
                ? `Drift bonus — climbs by ${w} (the item’s weight) every time it isn’t picked, and resets to 0 when it is.`
              : picker.mode === 'ease-up'
                ? `Progress toward eligibility — starts at 0 and rises by a random amount each run it isn’t picked. The item becomes pickable at ${thr}, then resets to 0.`
              : picker.mode === 'ease-down'
                ? `Remaining charge — starts at ${thr} and drops by a random amount each time it’s picked. At 0 it refills automatically and a new item is chosen; this one sits out the next pick.`
              : '';
            return (
              <div key={it.id} className={`pool-row ${it.vacation ? 'is-vac' : ''} ${!eligibleHere ? 'is-ineligible' : ''} ${insertSavedId === it.id ? 'pool-row--insert' : ''} ${confirmDelId === it.id ? 'pool-row--confirm' : ''} ${removingId === it.id ? 'pool-row--removing' : ''}`}
                   onAnimationEnd={(e) => {
                     if (insertSavedId === it.id) setInsertSavedId(null);
                     if (removingId === it.id && e.target === e.currentTarget) { actions.removeItem(it.id); setRemovingId(null); }
                   }}>
                {confirmDelId === it.id ? (
                  <div className={`pool-confirm ${confirmLeaveId === it.id ? 'is-leaving' : ''}`}>
                    <span className="pool-confirm-msg">Delete <strong>{it.name}</strong>?</span>
                    <div className="pool-confirm-actions">
                      <Btn kind="ghost" size="sm" onClick={cancelConfirm}>Cancel</Btn>
                      <Btn kind="danger" size="sm" icon="trash"
                           onClick={() => { setConfirmDelId(null); setRemovingId(it.id); }}>Delete</Btn>
                    </div>
                  </div>
                ) : (
                  <React.Fragment>
                    <div className="pool-name">
                      {it.name}
                      {it.vacation && <Pill tone="muted">vacation</Pill>}
                      {!eligibleHere && !it.vacation && <Pill tone="muted">{picker.mode === 'ease-up' ? 'not yet' : 'spent'}</Pill>}
                    </div>
                    <div className="pool-meta">
                      {showState && r != null && (
                        <InfoTip className="pool-prog" label={valueTip}>
                          <ProgressBar value={r} max={1} tone={picker.mode === 'ease-down' ? 'warm' : 'accent'} />
                          <span className="pool-val">{Math.round(it.value)}</span>
                        </InfoTip>
                      )}
                      {(picker.mode === 'weighted' || picker.mode === 'dynamic') && (
                        <InfoTip className="pool-weight" label={weightTip}>w{it.weight}</InfoTip>
                      )}
                    </div>
                    {sentId === it.id ? (
                      <button type="button" className="pool-send is-sent" disabled
                              aria-label={`${it.name} sent to Today`} title="Sent to Today">
                        <Icon name="check" size={15} />
                      </button>
                    ) : onTodayIds.has(it.id) ? (
                      <InfoTip className="pool-send is-disabled"
                               label="This item is already included in the Today tab.">
                        <Icon name="calendar" size={15} />
                      </InfoTip>
                    ) : (
                      <button type="button" className="pool-send"
                              aria-label={`Send ${it.name} to Today`}
                              title="Send to Today" onClick={() => sendToday(it.id)}>
                        <Icon name="calendar" size={15} />
                      </button>
                    )}
                    <button type="button" className="pool-del" aria-label={`Delete ${it.name}`}
                            onClick={() => setConfirmDelId(it.id)}>
                      <Icon name="trash" size={15} />
                    </button>
                  </React.Fragment>
                )}
              </div>
            );
          })}
        </div>
        <div className="pv-additem-wrap" ref={addWrapRef}>
          {(() => {
            const newItem = newDraft;
            if (!newItem) return (
              <button type="button" className="pv-additem-btn" onClick={addNewItem}>
                <Icon name="plus" size={14} /> Add item
              </button>
            );
            return (
              <div className={`pv-newitem rd-item is-editing ${newItemClosing ? 'is-closing' : ''}`}
                   onAnimationEnd={(e) => {
                     if (!newItemClosing || e.target !== e.currentTarget) return;
                     if (newItemClosing === 'save') commitDraft(newItem);
                     setNewItemClosing(false);
                     setNewDraft(null);
                   }}>
                <div className="rd-row" onClick={(e) => e.stopPropagation()}>
                  <span className="rd-main">
                    <input className="rd-name-input" type="text" value={newItem.name} maxLength={60}
                           placeholder="Item name" aria-label="Item name" autoFocus
                           onChange={(e) => draftActions.updateItem(newItem.id, { name: e.target.value })}
                           onBlur={(e) => { const n = e.target.value.trim(); if (n) draftActions.renameItem(newItem.id, n); }}
                           onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} />
                  </span>
                </div>
                <div className="rd-edit">
                  <EntryEditor item={newItem} picker={picker} actions={draftActions}
                               onClose={() => setNewItemClosing('save')}
                               onCancel={() => setNewItemClosing('cancel')} />
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

// AddItemForm — create new items for an EXISTING picker, from the Pickers tab.
// (Removed: the Pickers tab now reuses the shared EntryEditor inline, matching
// the Today/Data item-edit UI — see the pv-additem-wrap block in PickerView.)

// NewPickerForm — the setup view for a brand-new picker. Renders in the same
// slot a selected picker's PickerView would, so creating reuses the mental
//   1. Details — Name, Group, Mode.
//   2. Items   — build a fresh pool by typing item names (Option B).
// On "Create picker" it commits through actions.addPicker, which also spins up
// a category to hold the new items so the Data tab stays coherent.
//
// Every field carries plain-language helper copy: the goal is that someone
// who has never seen a "picker" before can fill this in without guessing.
function NewPickerForm({ existingGroups, initialGroup, conditionals = [], onCancel, onCreate, initial }) {
  const [step, setStep] = React.useState((initial && initial.step) || 1);
  const [name, setName] = React.useState((initial && initial.name) || '');
  // Focus the name input on mount when arriving from Today's empty-state card.
  const nameRef = React.useRef(null);
  React.useEffect(() => {
    if (initial && initial.focusName && nameRef.current) {
      nameRef.current.focus();
      nameRef.current.select();
    }
  }, []);
  const [group, setGroup] = React.useState(initialGroup || existingGroups[0] || '');
  const [addingGroup, setAddingGroup] = React.useState((initial && initial.group) ? true : existingGroups.length === 0);
  const [newGroup, setNewGroup] = React.useState((initial && initial.group) || '');
  const [mode, setMode] = React.useState((initial && initial.mode) || 'random');
  // Whether this picker is included when the user taps Regenerate on Today.
  // Defaults on — same as the existing behaviour for newly-created pickers.
  const [includeInDaily, setIncludeInDaily] = React.useState(true);
  const schedRef = React.useRef(null);
  const dailyUserToggled = React.useRef(false);
  // When the user re-enables the Daily section, bring the newly-revealed block
  // fully into view (it can unfurl below the fold), accounting for the tab bar.
  React.useEffect(() => {
    if (!includeInDaily || !dailyUserToggled.current) return;
    // Wait for the Collapse unfurl to finish so the block is at full height
    // before we measure how far it overflows the fold.
    const t = setTimeout(() => {
      const el = schedRef.current, sc = el && el.closest('.main');
      if (!el || !sc) return;
      const overflowBelow = el.getBoundingClientRect().bottom - sc.getBoundingClientRect().bottom + 96;
      if (overflowBelow > 0) sc.scrollTo({ top: sc.scrollTop + overflowBelow, behavior: reduceMotion() ? 'auto' : 'smooth' });
    }, reduceMotion() ? 0 : 320);
    return () => clearTimeout(t);
  }, [includeInDaily]);
  // When included, an optional schedule: which weekdays it may run, and whether
  // it sits out public holidays. Defaults match "runs every day".
  const [daysOfWeek, setDaysOfWeek] = React.useState([0, 1, 2, 3, 4, 5, 6]);
  const [skipHolidays, setSkipHolidays] = React.useState(false);
  // Picker Cadence: how often it surfaces + the anchor. Defaults to daily.
  const [cad, setCad] = React.useState(() => CADENCE.normalize({}));
  // Weekly cadence pins its anchor day ON in the Days control (and blocks the
  // presets from dropping it), so the two controls can't contradict each other.
  const lockedDow = cad.cadence === 'weekly' ? cad.anchorDow : null;
  const withLocked = (days) => CADENCE.enforceWeeklyDay({ ...cad, daysOfWeek: days });
  React.useEffect(() => {
    setDaysOfWeek((d) => {
      const next = CADENCE.enforceWeeklyDay({ ...cad, daysOfWeek: d });
      return next.length === d.length ? d : next;
    });
  }, [cad.cadence, cad.anchorDow]);
  // Optional conditional gate. Off by default; when on, the user attaches an
  // existing conditional or creates a new inline one (condSel = id | 'new').
  const [condOn, setCondOn] = React.useState(false);
  const [condSel, setCondSel] = React.useState(null);
  const [condDraft, setCondDraft] = React.useState(() => conditionalDraftDefault(''));
  const [condNameTouched, setCondNameTouched] = React.useState(false);
  // Create-new requires a UNIQUE name. Normalize first, then compare against
  // existing conditionals (which are stored normalized). Reuse is the deliberate
  // act of tapping an existing pill — not a silent name match.
  const condTidyName = normalizeConditionalName(condDraft.name) || '';
  const condNameCollides = condOn && condSel === 'new' &&
    conditionals.some((c) => (c.name || '').toLowerCase() === condTidyName.toLowerCase());
  const condNameError = condNameCollides
    ? `A conditional named \u201C${condTidyName}\u201D already exists. Choose a different name, or select it from the list above to reuse it.`
    : null;
  const condRailRef = React.useRef(null);
  // Edge-fade cue on the conditional rail (matches the other horizontal rails).
  React.useEffect(() => {
    const el = condRailRef.current;
    if (!el || !condOn) return;
    const update = () => {
      const scrollable = el.scrollWidth - el.clientWidth > 1;
      el.classList.toggle('at-start', !scrollable || el.scrollLeft <= 1);
      el.classList.toggle('at-end', !scrollable || el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [condOn, conditionals.length]);

  // Step 2 — the pool. Each item is { name, weight }; weight only matters for
  // weighted/dynamic modes (and is editable inline only then). A fresh pool
  // (Option B), not a pick-from-library. Other defaults (drift value, ease
  // knobs) are applied at commit time.
  const [items, setItems] = React.useState((initial && initial.items) || []);
  const [draft, setDraft] = React.useState('');
  const draftRef = React.useRef(null);
  const formRef = React.useRef(null);

  // Advancing to step 2 from the bottom-of-form button leaves the user scrolled
  // down; pull the form's scroll container back to the top so the add-item
  // field is in view without a manual scroll.
  const goToStep2 = () => {
    setStep(2);
    requestAnimationFrame(() => {
      let el = formRef.current;
      while (el && el !== document.body) {
        const oy = getComputedStyle(el).overflowY;
        if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight) {
          el.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' }); return;
        }
        el = el.parentElement;
      }
      const sc = document.querySelector('.main');
      if (sc) sc.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' });
    });
  };

  const effectiveGroup = addingGroup ? normalizeGroupName(newGroup, existingGroups) : group;
  const detailsReady = !!(name.trim() && effectiveGroup && mode);
  // Weight is a lever only for these two modes — random / ease-* ignore it, so
  // we keep the control hidden there to avoid asking for something irrelevant.
  const showWeights = mode === 'weighted' || mode === 'dynamic';
  const isEase = mode === 'ease-up' || mode === 'ease-down';

  // Ease cadence is PER-ITEM — a fridge-clean and a counter-wipe want different
  // rhythms. Each item carries its own drift band { easeMin, easeMax }. We ask
  // two human questions per item and convert:
  //   soonest days — least time before it CAN come up   → easeMax = 100/soonest
  //   latest  days — most time before it MUST come up    → easeMin = 100/latest
  // The engine moves an item across the 0–100 threshold by random(easeMin,
  // easeMax) each daily run, so maturing fastest (every roll = easeMax) takes
  // 100/easeMax days = the soonest, and slowest (every roll = easeMin) takes
  // 100/easeMin days = the latest. The gap between the two answers IS the
  // randomness. One picker-level toggle flips ALL rows to raw drift inputs for
  // power users. Drift values are the source of truth on each item.
  const THRESHOLD = 100;
  const DEFAULT_EASE = { easeMin: 7, easeMax: 14 }; // ≈ 7-day soonest / 14-day latest
  const [easeManual, setEaseManual] = React.useState(false);

  const driftToSoonest = (easeMax) => Math.max(1, Math.round(THRESHOLD / (easeMax || 1)));
  const driftToLatest  = (easeMin) => Math.max(1, Math.round(THRESHOLD / (easeMin || 1)));
  const daysToDrift    = (days)    => THRESHOLD / Math.max(1, days);

  const cap = (s) => s.length ? s[0].toUpperCase() + s.slice(1) : s;

  // ── Reused item editor (same UI as the live Pickers-tab add flow) ──
  // Draft items carry a stable id so the shared EntryEditor + a synthetic
  // `actions` object (backed by the draft array, not the store) can key off it.
  // Adding opens the editor inline at the bottom; Save/Cancel play the same
  // fade animations as the live flow.
  const [newDraftId, setNewDraftId] = React.useState(null);
  const [draftClosing, setDraftClosing] = React.useState(false); // 'save' | 'cancel'
  const [insertDraftId, setInsertDraftId] = React.useState(null);
  const [confirmDelDraftId, setConfirmDelDraftId] = React.useState(null);
  const [confirmLeaveDraftId, setConfirmLeaveDraftId] = React.useState(null);
  const cancelDraftConfirm = () => {
    if (reduceMotion()) { setConfirmDelDraftId(null); return; }
    setConfirmLeaveDraftId(confirmDelDraftId);
    setTimeout(() => { setConfirmLeaveDraftId(null); setConfirmDelDraftId(null); }, 150);
  };
  const [removingDraftId, setRemovingDraftId] = React.useState(null);
  const addWrapRef = React.useRef(null);
  // Count only COMMITTED items — exclude the row currently being edited (its
  // Save hasn't landed yet), so the count + Create button don't react early.
  // MUST be after newDraftId's declaration:  (now removed since the project is using Vite) hoists it as a var, so reading
  // it earlier in the body yields undefined and the filter excludes nothing.
  const committedCount = items.filter((it) => it.id !== newDraftId).length;
  const enoughItems = committedCount >= 2;
  const draftActions = {
    updateItem: (id, patch) => setItems((xs) => xs.map((it) => it.id === id ? { ...it, ...patch } : it)),
    setItemWeight: (id, w) => setItems((xs) => xs.map((it) => it.id === id ? { ...it, weight: w } : it)),
    replaceItem: (id, snap) => setItems((xs) => xs.map((it) => it.id === id ? snap : it)),
    removeItem: (id) => setItems((xs) => xs.filter((it) => it.id !== id)),
    renameItem: (id, name) => setItems((xs) => xs.map((it) => it.id === id ? { ...it, name } : it)),
    toggleVacation: (id) => setItems((xs) => xs.map((it) => it.id === id ? { ...it, vacation: !it.vacation } : it)),
  };
  const draftPicker = { mode, threshold: THRESHOLD, cadence: cad.cadence, easeMin: 10, easeMax: 20 };
  const addNewDraft = () => {
    if (newDraftId) return;
    setDraftClosing(false);   // clear any stale closing state from a prior editor
    const id = 'draft_' + Math.random().toString(36).slice(2, 8);
    let base = 'New item', nm = base, n = 1;
    const names = new Set(items.map((x) => x.name.toLowerCase()));
    while (names.has(nm.toLowerCase())) { n++; nm = `${base} ${n}`; }
    setItems((xs) => [...xs, { id, name: nm, weight: 1, ...DEFAULT_EASE }]);
    setNewDraftId(id);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const el = addWrapRef.current, sc = el && el.closest('.main');
      if (!el || !sc) return;
      const overflowBelow = el.getBoundingClientRect().bottom - sc.getBoundingClientRect().bottom + 96;
      if (overflowBelow > 0) sc.scrollTo({ top: sc.scrollTop + overflowBelow, behavior: reduceMotion() ? 'auto' : 'smooth' });
    }));
  };

  const goBackToStep1 = () => {
    // Discard any in-progress (unsaved) item so returning to step 2 isn't stuck
    // with a stale newDraftId (which would make + Add item a no-op). Disarm the
    // EntryEditor's deferred revert too, else it fires on the next macrotask and
    // re-sets draftClosing='cancel' — which would auto-close the NEXT added item.
    window.__editGuard.disarm();
    if (newDraftId) { draftActions.removeItem(newDraftId); setNewDraftId(null); }
    setDraftClosing(false);
    setStep(1);
  };
  const addDraft = () => {
    const v = cap(draft.trim());
    if (!v) return;
    // Ignore exact (case-insensitive) duplicates so the pool stays clean.
    if (items.some((it) => it.name.toLowerCase() === v.toLowerCase())) { setDraft(''); return; }
    setItems((xs) => [...xs, { name: v, weight: 1, ...DEFAULT_EASE }]);
    setDraft('');
    if (draftRef.current) draftRef.current.focus();
  };
  const removeItem = (i) => setItems((xs) => xs.filter((_, idx) => idx !== i));
  const setWeight = (i, w) => setItems((xs) =>
    xs.map((it, idx) => idx === i ? { ...it, weight: Math.max(1, Math.min(5, w)) } : it));

  // Simple mode — set an item's cadence by days, keeping soonest ≤ latest
  // (i.e. easeMin ≤ easeMax) after each change.
  const setItemSoonest = (i, days) => setItems((xs) => xs.map((it, idx) => {
    if (idx !== i) return it;
    const easeMax = daysToDrift(Math.max(1, Math.min(60, days)));
    return { ...it, easeMax, easeMin: Math.min(it.easeMin, easeMax) };
  }));
  const setItemLatest = (i, days) => setItems((xs) => xs.map((it, idx) => {
    if (idx !== i) return it;
    const easeMin = daysToDrift(Math.max(1, Math.min(90, days)));
    return { ...it, easeMin, easeMax: Math.max(it.easeMax, easeMin) };
  }));
  // Exact mode — edit the raw drift band directly, keeping easeMin ≤ easeMax.
  const setItemDrift = (i, which, val) => setItems((xs) => xs.map((it, idx) => {
    if (idx !== i) return it;
    const v = Math.max(1, Math.min(100, val || 1));
    if (which === 'min') return { ...it, easeMin: v, easeMax: Math.max(it.easeMax, v) };
    return { ...it, easeMax: v, easeMin: Math.min(it.easeMin, v) };
  }));

  const submit = () => {
    if (!detailsReady || !enoughItems) return;
    if (condOn && condSel === 'new' && condNameCollides) { setCondNameTouched(true); return; }
    const payload = { name: cap(name.trim()), group: effectiveGroup, mode, items, includeInDaily,
                      daysOfWeek, skipHolidays, ...cad };
    // Attach a conditional: an existing one (condSel = id) or a fresh inline one.
    // Create-new names are unique by validation above, so no silent reuse here.
    if (condOn && condSel === 'new') {
      payload.newConditional = { ...condDraft, name: condTidyName || 'Conditional' };
    } else if (condOn && condSel) {
      payload.conditionalId = condSel;
    }
    if (isEase) {
      // Picker-level span is just a fallback/summary; per-item bands drive the engine.
      payload.easeMin = Math.min(...items.map((it) => it.easeMin ?? DEFAULT_EASE.easeMin));
      payload.easeMax = Math.max(...items.map((it) => it.easeMax ?? DEFAULT_EASE.easeMax));
    }
    onCreate(payload);
  };

  return (
    <div className="picker-view np-form" ref={formRef}>
      <header className="picker-h">
        <div>
          <div className="kicker">New picker</div>
          <h2 className="picker-title">Create a picker</h2>
        </div>
      </header>

      <div className="np-steps">
        <button type="button" className={`np-step ${step === 1 ? 'is-on' : 'is-done'}`}
                onClick={() => setStep(1)}>
          <span className="np-step-num">{step > 1 ? <Icon name="check" size={12} /> : '1'}</span>
          <span className="np-step-lbl">Details</span>
        </button>
        <span className="np-step-line" />
        <button type="button" className={`np-step ${step === 2 ? 'is-on' : ''}`}
                disabled={!detailsReady} onClick={() => detailsReady && setStep(2)}>
          <span className="np-step-num">2</span>
          <span className="np-step-lbl">Items</span>
        </button>
      </div>

      {step === 1 ? (
      <div className="tab-fade" key="np-step1">
      <p className="picker-hint">
        A picker is a small machine that chooses one thing for you from a pool —
        a chore to do, a meal to make, a way to wind down. Give it a name and a
        group, then choose how it should pick. You&rsquo;ll fill its pool in the
        next step.
      </p>

      <div className="np-fields">
        <div className="np-field">
          <label className="np-label" htmlFor="np-name">Name</label>
          <p className="np-help">
            What you&rsquo;ll see on the picker bar above and on your Today list.
            Short and plain works best &mdash; &ldquo;Dinner&rdquo;,
            &ldquo;Weekly chore&rdquo;, &ldquo;Wind Down&rdquo;.
          </p>
          <input id="np-name" className="np-input" type="text" maxLength={40} ref={nameRef}
                 value={name} onChange={(e) => setName(e.target.value)}
                 placeholder="e.g. Dinner" autoComplete="off" />
        </div>

        <div className="np-field">
          <label className="np-label">Group</label>
          <p className="np-help">
            Pickers are clustered into groups on your Today list &mdash; like
            &ldquo;Food&rdquo; or &ldquo;Chores&rdquo; &mdash; so related picks
            sit together. Choose an existing group, or start a new one.
          </p>
          <div className="np-groups">
            {existingGroups.map((g) => (
              <button key={g} type="button"
                      className={`np-chip ${!addingGroup && group === g ? 'is-on' : ''}`}
                      onClick={() => { setAddingGroup(false); setGroup(g); }}>
                {g}
              </button>
            ))}
            <button type="button"
                    className={`np-chip np-chip--new ${addingGroup ? 'is-on' : ''}`}
                    onClick={() => setAddingGroup(true)}>
              <Icon name="plus" size={13} /> New group
            </button>
          </div>
          <Collapse open={addingGroup}>
            <input className="np-input np-input--sm" type="text" autoFocus maxLength={30}
                   value={newGroup} onChange={(e) => setNewGroup(e.target.value)}
                   placeholder="Name the new group" autoComplete="off" />
          </Collapse>
        </div>

        <div className="np-field">
          <label className="np-label">How should it choose?</label>
          <p className="np-help">
            This is the rule the picker follows each time it runs.
            &ldquo;Truly random&rdquo; is the simplest &mdash; every item has an
            equal chance. The others nudge the odds in different ways. Not sure?
            Start random &mdash; you can change it at any time.
          </p>
          <div className="mode-radio">
            {Object.entries(MODES).map(([key, m]) => (
              <label key={key} className={`mode-opt ${mode === key ? 'is-on' : ''}`}>
                <input type="radio" name="np-mode" checked={mode === key}
                       onChange={() => setMode(key)} />
                <div>
                  <div className="mode-opt-name">{m.label}</div>
                  {Array.isArray(m.hint)
                    ? m.hint.map((para, pi) => <div key={pi} className="mode-opt-hint">{para}</div>)
                    : <div className="mode-opt-hint">{m.hint}</div>}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="np-field np-cond">
          <div className="np-field--toggle">
            <div className="np-toggle-text">
              <label className="np-label">Attach a conditional</label>
              <p className="np-help">
                Conditionals can be attached to a picker that will determine whether a picker
                should be run on any given day during the auto generator phase for the Today tab.
                Run eligibility can be determined using the same rules that the pickers use &mdash;
                Truly random, Weighted, Dynamic weighted, Ease-up and Ease-down &mdash; each with
                their own pros and cons.
              </p>
              <p className="np-help">
                Example: you have a Chores picker that you attach a Weighted conditional to in order
                to determine whether a Day Off should should be triggered and therefore no Chores
                should be chosen.
              </p>
            </div>
            <button type="button"
                    className={`switch ${condOn ? 'is-on' : ''}`}
                    role="switch" aria-checked={condOn}
                    aria-label="Attach a conditional"
                    onClick={() => setCondOn((v) => !v)}>
              <i />
            </button>
          </div>
          <Collapse open={condOn}>
            <div className="cnd-attach">
              <div className="cnd-rail picker-groups at-start at-end" ref={condRailRef}>
                {conditionals.map((c) => (
                  <button key={c.id} type="button"
                          className={`cnd-pill ${condSel === c.id ? 'is-on' : ''}`}
                          onClick={() => setCondSel(c.id)}>
                    <span className="cnd-pill-name">{c.name}</span>
                    <span className="cnd-pill-mode">{(MODES[c.mode] || {}).label || c.mode}</span>
                  </button>
                ))}
                <button type="button"
                        className={`cnd-pill cnd-pill--new ${condSel === 'new' ? 'is-on' : ''}`}
                        onClick={() => { setCondSel('new'); setCondDraft(conditionalDraftDefault(name.trim(), conditionals.map((c) => c.name))); }}>
                  <Icon name="plus" size={16} />
                  <span className="cnd-pill-name">Add new conditional</span>
                </button>
              </div>
              <Collapse open={condSel === 'new'}>
                <ConditionalControls draft={condDraft} onChange={setCondDraft} nameError={condNameError} />
              </Collapse>
            </div>
          </Collapse>
        </div>

        <div className="np-field np-daily-group">
          <div className="np-field--toggle">
            <div className="np-toggle-text">
              <label className="np-label" htmlFor="np-daily">Include in the Daily generator</label>
              <p className="np-help set-sub-fade" key={includeInDaily ? 'on' : 'off'}>
                {includeInDaily
                  ? <>This picker <strong>will run</strong> automatically as part of your daily list or whenever you tap Regenerate in the Today tab.</>
                  : <>This picker <strong>will not run</strong> automatically, but you can still run it manually from this tab.</>}
              </p>
            </div>
            <button id="np-daily" type="button"
                    className={`switch ${includeInDaily ? 'is-on' : ''}`}
                    role="switch" aria-checked={includeInDaily}
                    aria-label="Include in the Daily generator"
                    onClick={() => { dailyUserToggled.current = true; setIncludeInDaily((v) => !v); }}>
              <i />
            </button>
          </div>

          <Collapse open={includeInDaily}>
          <div className="np-sched np-daily-anim" ref={schedRef}>
            <div className="np-sched-block">
              <CadenceControl value={cad} onChange={(patch) => setCad((c) => CADENCE.normalize({ ...c, ...patch }))} />
            </div>
            <div className="np-sched-block">
              <label className="np-label">Which days?</label>
              <p className="np-help">
                Pick the days this picker is allowed to run on. Tap a day to turn
                it off &mdash; handy for things like chores you&rsquo;d rather not
                see on weekends.
              </p>
              <div className="np-sched-row">
                <WeekdayChips value={daysOfWeek} onChange={setDaysOfWeek}
                              lockedDay={lockedDow}
                              lockedTip={lockedDow === null ? '' : CADENCE.lockedDayTip(lockedDow, 'On which day?')} />
                <div className="np-sched-presets">
                  <button type="button" className="np-preset" onClick={() => setDaysOfWeek(withLocked([0, 1, 2, 3, 4, 5, 6]))}>Every day</button>
                  <button type="button" className="np-preset" onClick={() => setDaysOfWeek(withLocked([1, 2, 3, 4, 5]))}>Weekdays</button>
                  <button type="button" className="np-preset" onClick={() => setDaysOfWeek(withLocked([0, 6]))}>Weekends</button>
                </div>
              </div>
            </div>

            <div className="np-sched-toggle">
              <div className="np-toggle-text">
                <label className="np-label" htmlFor="np-skiphol">Skip on holidays</label>
                <p className="np-help set-sub-fade" key={skipHolidays ? 'on' : 'off'}>
                  {skipHolidays
                    ? <>This picker <strong>will not run</strong> on major U.S. holidays. You can edit which days count as holidays — and add your own — in Settings.</>
                    : <>This picker <strong>will always run</strong>, even on major U.S. holidays.</>}
                </p>
              </div>
              <button id="np-skiphol" type="button"
                      className={`switch ${skipHolidays ? 'is-on' : ''}`}
                      role="switch" aria-checked={skipHolidays}
                      aria-label="Skip on holidays"
                      onClick={() => setSkipHolidays((v) => !v)}>
                <i />
              </button>
            </div>
          </div>
          </Collapse>
        </div>
      </div>

      <div className="np-footer np-footer--step1">
        <div className="np-footer-note">
          {(() => {
            const needName = !name.trim();
            const needGroup = !effectiveGroup;
            if (needName && needGroup) return 'A picker name and group are both required before advancing to the next step to create items for the picker’s pool.';
            if (needName) return 'A picker name is required before advancing to the next step to create items for the picker’s pool.';
            if (needGroup) return 'A group name is required before advancing to the next step to create items for the picker’s pool.';
            return <>Up next &mdash; create items to be included in this picker&rsquo;s pool.</>;
          })()}
        </div>
        <div className="np-footer-actions">
          <Btn kind="ghost" onClick={onCancel}>Cancel</Btn>
          <Btn kind="primary" icon="chev" className="ob-picker-next" disabled={!detailsReady || condNameCollides}
               onClick={goToStep2}>Add items</Btn>
        </div>
      </div>
      </div>
      ) : (
      <div className="tab-fade" key="np-step2">
      <p className="picker-hint">
        This is the <strong>pool</strong> &mdash; the set of items
        {' '}{name.trim() ? `“${name.trim()}”` : 'this picker'} chooses from.
        Each time it runs it picks <strong>one</strong> of these, following the
        {' '}&ldquo;{MODES[mode].label}&rdquo; rule you chose. Add items
        one at a time &mdash; there are no wrong answers, and you can always add,
        remove or edit items later.
      </p>
      {mode === 'random' && (
        <p className="picker-hint np-weight-note">
          Because you chose &ldquo;Truly random&rdquo;, there are no extra controls
          to tweak for items since they all have an equal chance of being picked.
        </p>
      )}
      {mode === 'weighted' && (
        <p className="picker-hint np-weight-note">
          Because you chose &ldquo;Weighted&rdquo;, each item also
          has a <strong>weight</strong> &mdash; a higher weight means a higher
          chance of being picked. A <strong>w2</strong> item is picked about twice as often
          as a <strong>w1</strong>. Leave them all at <strong>w1</strong> for an even start as you can
          always change these later.
        </p>
      )}
      {mode === 'dynamic' && (
        <p className="picker-hint np-weight-note">
          Because you chose &ldquo;{MODES[mode].label}&rdquo;, each item also
          has a <strong>weight</strong> &mdash; a higher weight means a higher
          chance of being picked. A <strong>w2</strong> item is picked about twice as often
          as a <strong>w1</strong>. Leave them all at <strong>w1</strong> for an even start as you can
          always change these later.
        </p>
      )}
      {mode === 'ease-up' && (
        <p className="picker-hint np-weight-note">
          Because you chose &ldquo;Ease-up&rdquo;, each item gets its
          own <strong>cadence</strong> &mdash; set per item below, since each might
          need a different timeout period. For each one you will need to pick a
          {' '}<strong>soonest</strong> and a <strong>latest</strong> value, which will be
          used to determine its new value as it charges towards being eligible again.
        </p>
      )}
      {mode === 'ease-down' && (
        <p className="picker-hint np-weight-note">
          Because you chose &ldquo;Ease-down&rdquo;, each item gets its
          own <strong>cadence</strong> &mdash; set per item below, since each might
          need a different selection period. For each one you will need to pick a
          {' '}<strong>soonest</strong> and a <strong>latest</strong> value, which will be
          used to determine its new value as it discharges towards deselection.
        </p>
      )}

      {initial && (
        <div className="np-field np-tour-name">
          <label className="np-label" htmlFor="np-tour-name">Picker name</label>
          <input id="np-tour-name" className="np-input" type="text" maxLength={40}
                 value={name} onChange={(e) => setName(e.target.value)}
                 placeholder="e.g. Chores" autoComplete="off" />
        </div>
      )}
      <div className="np-pool">
        {items.filter((it) => it.id !== newDraftId).length === 0 && !newDraftId && (
          <div className="np-pool-empty">
            Nothing here yet. Add a few things this picker can choose between &mdash;
            two or more so there&rsquo;s a real choice to make.
          </div>
        )}
        {items.filter((it) => it.id !== newDraftId).length > 0 && (
          <div className="pool-list">
            {items.filter((it) => it.id !== newDraftId).map((it) => {
              const soonest = driftToSoonest(it.easeMax);
              const latest = driftToLatest(it.easeMin);
              return (
                <div key={it.id} className={`pool-row ${insertDraftId === it.id ? 'pool-row--insert' : ''} ${confirmDelDraftId === it.id ? 'pool-row--confirm' : ''} ${removingDraftId === it.id ? 'pool-row--removing' : ''}`}
                     onAnimationEnd={(e) => {
                       if (insertDraftId === it.id) setInsertDraftId(null);
                       if (removingDraftId === it.id && e.target === e.currentTarget) { draftActions.removeItem(it.id); setRemovingDraftId(null); }
                     }}>
                  {confirmDelDraftId === it.id ? (
                    <div className={`pool-confirm ${confirmLeaveDraftId === it.id ? 'is-leaving' : ''}`}>
                      <span className="pool-confirm-msg">Delete <strong>{it.name}</strong>?</span>
                      <div className="pool-confirm-actions">
                        <Btn kind="ghost" size="sm" onClick={cancelDraftConfirm}>Cancel</Btn>
                        <Btn kind="danger" size="sm" icon="trash"
                             onClick={() => { setConfirmDelDraftId(null); setRemovingDraftId(it.id); }}>Delete</Btn>
                      </div>
                    </div>
                  ) : (
                    <React.Fragment>
                      <div className="pool-name">{it.name}</div>
                      <div className="pool-meta">
                        {isEase && <span className="pool-ease-meta">{soonest}&ndash;{latest} {CADENCE.unitWord(cad.cadence, latest)}</span>}
                        {showWeights && <span className="pool-weight">w{it.weight}</span>}
                      </div>
                      <div aria-hidden="true" />
                      <button type="button" className="pool-del" aria-label={`Delete ${it.name}`}
                              onClick={() => setConfirmDelDraftId(it.id)}>
                        <Icon name="trash" size={15} />
                      </button>
                    </React.Fragment>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <div className="pv-additem-wrap" ref={addWrapRef}>
          {(() => {
            const newItem = items.find((it) => it.id === newDraftId);
            if (!newItem) return (
              <button type="button" className="pv-additem-btn" onClick={addNewDraft}>
                <Icon name="plus" size={14} /> Add item
              </button>
            );
            return (
              <div className={`pv-newitem rd-item is-editing ${draftClosing ? 'is-closing' : ''}`}
                   onAnimationEnd={(e) => {
                     if (!draftClosing || e.target !== e.currentTarget) return;
                     const rid = newItem.id;
                     if (draftClosing === 'save') setInsertDraftId(rid);
                     else draftActions.removeItem(rid);
                     setDraftClosing(false);
                     setNewDraftId(null);
                   }}>
                <div className="rd-row" onClick={(e) => e.stopPropagation()}>
                  <span className="rd-main">
                    <input className="rd-name-input" type="text" value={newItem.name} maxLength={60}
                           placeholder="Item name" aria-label="Item name" autoFocus
                           onChange={(e) => draftActions.updateItem(newItem.id, { name: e.target.value })}
                           onBlur={(e) => { const n = e.target.value.trim(); if (n) draftActions.renameItem(newItem.id, n); }}
                           onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} />
                  </span>
                </div>
                <div className="rd-edit">
                  <EntryEditor item={newItem} picker={draftPicker} actions={draftActions}
                               onClose={() => setDraftClosing('save')}
                               onCancel={() => setDraftClosing('cancel')} />
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      <div className="np-footer">
        <div className="np-footer-note">
          {enoughItems
            ? (showWeights
                ? 'Looks good — set each item’s weight above, or leave them even.'
                : `Minimum number of items added (${committedCount} so far) — you can always add more items later.`)
            : `Add at least 2 items to create the picker${committedCount === 1 ? ' (1 so far)' : ''}.`}
        </div>
        <div className="np-footer-actions">
          <Btn kind="ghost" onClick={goBackToStep1}>Back</Btn>
          <Btn kind="primary" icon="check" className="ob-picker-create" disabled={!enoughItems || condNameCollides} onClick={submit}>Create picker</Btn>
        </div>
      </div>
      </div>
      )}
    </div>
  );
}

export function TabPicker({ state, actions, animStyle, onHome, onNavTab }) {
  const [activeId, setActiveId] = React.useState(state.pickers[0]?.id);
  const [creating, setCreating] = React.useState(false);
  const [groupFilter, setGroupFilter] = React.useState('all');
  const active = state.pickers.find((p) => p.id === activeId);
  // Onboarding tour: when it stages a prefill, open the create form for it.
  const tour = useEmlTour ? useEmlTour() : { prefill: null, startCreate: null };
  const [openedByTour, setOpenedByTour] = React.useState(false);
  // Prefill staged by Today's empty-state card (name focus + "Chores"), held
  // locally so it survives clearing the bus signal.
  const [emptyInitial, setEmptyInitial] = React.useState(null);
  React.useEffect(() => { if (tour.prefill && !creating) { setCreating(true); setOpenedByTour(true); } }, [tour.prefill]);
  // Empty-state entry (Today's "no pickers" card): open the create form with the
  // staged prefill, but WITHOUT openedByTour — this isn't the tour, so creating
  // the picker must not fire the tour's advance callback. Consume once, then clear.
  React.useEffect(() => {
    if (tour.startCreate && !creating) {
      // Prefill a "Chores" group too — but only when there are no groups to
      // auto-select. A group can technically exist with no pickers, so respect
      // an existing one (leave group unset → the form auto-selects it).
      const payload = existingGroups.length === 0
        ? { ...tour.startCreate, group: 'Chores' }
        : tour.startCreate;
      setEmptyInitial(payload);
      setCreating(true);
      emlTour.set({ startCreate: null });
    }
  }, [tour.startCreate]);

  // Distinct group names, in first-seen order — offered as chips in the form
  // and as the group filter bar above the picker strip.
  const existingGroups = React.useMemo(() => {
    const seen = [];
    for (const p of state.pickers) if (p.group && !seen.includes(p.group)) seen.push(p.group);
    return seen;
  }, [state.pickers]);

  // The picker strip is scoped to the selected group ("all" shows everything).
  const visiblePickers = React.useMemo(() => (
    groupFilter === 'all'
      ? state.pickers
      : state.pickers.filter((p) => p.group === groupFilter)
  ), [state.pickers, groupFilter]);

  // Keep the selection coherent with the filter: if the active picker falls
  // outside the chosen group, jump to the first picker that's in view.
  React.useEffect(() => {
    if (creating) return;
    if (!visiblePickers.some((p) => p.id === activeId)) {
      setActiveId(visiblePickers[0]?.id);
    }
  }, [groupFilter, visiblePickers, activeId, creating]);

  // Scroll-aware edge fades on the tab strip: toggle .at-start / .at-end
  // so the mask gradient only fades the side that has more content.
  const tabsRef = React.useRef(null);
  const groupsRef = React.useRef(null);
  React.useEffect(() => {
    const els = [tabsRef.current, groupsRef.current].filter(Boolean);
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
  }, [state.pickers.length, existingGroups.length, groupFilter, visiblePickers.length]);

  const scrollTop = () => {
    const sc = document.querySelector('.main');
    if (sc) sc.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' });
  };
  // Cancel-from-create: scroll up first (while the tall form is still mounted so
  // there's real distance to glide), then swap back to the picker view.
  const cancelCreate = () => {
    if (reduceMotion()) { setCreating(false); return; }
    scrollTop();
    setTimeout(() => setCreating(false), 240);
  };

  return (
    <div className="tab tab--picker">
      <header className="picker-h-head">
        <div className="kicker">Pickers</div>
        <div className="picker-h-lead">
          <button type="button" onClick={onHome} className="brand-mark" aria-label="Ease My Life — go to Today">
            {/* Same theme-wired logo as the Today + Stats headers so the tabs
                read as one product (currentColor → accent, grid → accent-soft). */}
            <svg viewBox="8 8 528 528" fill="none" aria-hidden="true">
              <defs>
                <clipPath id="brandMarkClipPicker" clipPathUnits="userSpaceOnUse">
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
                clipPath="url(#brandMarkClipPicker)"
                style={{ fill: 'currentColor', stroke: 'currentColor' }}
              />
            </svg>
          </button>
          <div className="section-h">
            <h1 className="section-title"><span className="picker-title-accent">Easing</span> your life, one pick at a time.</h1>
          </div>
        </div>
        <p className="section-sub picker-h-sub">Each picker has its own rule for how it chooses. Run a picker for a random item or just select a item manually and then push it to the Today tab. You can also create an entirely new picker here, along with new picker items but editing existing pickers and their items' settings must be done in the <button type="button" className="sub-tablink" onClick={() => onNavTab && onNavTab('data')}>Data tab</button>.</p>
      </header>
      <div className="stat-filters">
      {existingGroups.length > 1 && (
        <div className="stat-filter-row">
          <span className="stat-filter-lbl">Group</span>
          <div className="picker-groups" ref={groupsRef} role="tablist" aria-label="Filter pickers by group">
            <button type="button" role="tab" aria-selected={groupFilter === 'all'}
                    className={`picker-group-pill ${groupFilter === 'all' ? 'is-on' : ''}`}
                    onClick={() => { setGroupFilter('all'); setCreating(false); setActiveId(state.pickers[0]?.id); }}>
              All
              <span className="picker-group-count">{state.pickers.length}</span>
            </button>
            {existingGroups.map((g) => {
              const n = state.pickers.filter((p) => p.group === g).length;
              return (
                <button key={g} type="button" role="tab" aria-selected={groupFilter === g}
                        className={`picker-group-pill ${groupFilter === g ? 'is-on' : ''}`}
                        onClick={() => setGroupFilter(g)}>
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
        <div className="picker-tabs" ref={tabsRef} key={groupFilter}>
          {visiblePickers.map((p, i) => (
            <button key={p.id}
                    className={`picker-tab picker-tab--enter ${!creating && p.id === activeId ? 'is-on' : ''}`}
                    style={{ animationDelay: (i * 40) + 'ms' }}
                    onClick={() => { setCreating(false); setActiveId(p.id); }}>
            <span className="picker-tab-name">{p.name}</span>
            <span className="picker-tab-mode">{MODES[p.mode].label}</span>
          </button>
        ))}
        <button type="button"
                className={`picker-tab picker-tab--add picker-tab--enter ${creating ? 'is-on' : ''}`}
                style={{ animationDelay: (visiblePickers.length * 40) + 'ms' }}
                onClick={() => setCreating(true)}>
          <span className="picker-tab-add-icon" aria-hidden="true"><Icon name="plus" size={16} /></span>
          <span className="picker-tab-name">Add new picker</span>
        </button>
        </div>
      </div>
      </div>
      <div className="tab-fade" key={creating ? '__new' : (activeId || '__none')}>
      {creating
        ? <NewPickerForm existingGroups={existingGroups}
                         initialGroup={groupFilter === 'all' ? '' : groupFilter}
                         conditionals={state.conditionals || []}
                         initial={tour.prefill || emptyInitial || null}
                         onCancel={() => { setOpenedByTour(false); setEmptyInitial(null); cancelCreate(); }}
                         onCreate={(payload) => {
                           // During onboarding, never create a second copy of
                           // the example picker on a revisit — dedupe by name and
                           // just advance the tour instead.
                           if (openedByTour && state.pickers.some((p) => p.name === payload.name)) {
                             setOpenedByTour(false);
                             cancelCreate();
                             if (window.__emlPickerCreated) window.__emlPickerCreated();
                             return;
                           }
                           const id = actions.addPicker(payload);
                           if (openedByTour) { setOpenedByTour(false); if (window.__emlPickerCreated) window.__emlPickerCreated(); }
                           setEmptyInitial(null);
                           const finish = () => { setCreating(false); setActiveId(id); };
                           if (reduceMotion()) { finish(); return; }
                           scrollTop();
                           setTimeout(finish, 240);
                         }} />
        : (active && <PickerView picker={active} state={state} actions={actions} animStyle={animStyle} />)}
      </div>
    </div>
  );
}
