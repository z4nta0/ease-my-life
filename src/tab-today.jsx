import React from 'react';
import { createPortal } from 'react-dom';
import { CADENCE } from './cadence.js';
import { CONDITIONALS } from './conditionals.js';
import { EASE_UP_RANGE_WARN } from './constants.js';
import { DayLogChip, GroupLog } from './day-log.jsx';
import { HOLIDAYS } from './holidays.js';
import { HelpButton, HelpOverlay } from './help-mode.jsx';
import { NOTIFY } from './notify.js';
import { emlTour, useEmlTour } from './onboarding.jsx';
import { OB_CHECKLIST, OB_GENERATE_ITEM_ID, OB_PAGE_TOURS } from './onboarding-checklist.js';
import { OB_SAMPLE_PICKER_IDS, OB_SAMPLE_TASK_IDS } from './onboarding-seed-data.js';
import { ReminderTour } from './onboarding-reminder-tours.jsx';
import { PICKERS, normalizeGroupName } from './pickers.js';
import { ReminderSection } from './reminders.jsx';
import { REORDER } from './reorder.js';
import { TASKS } from './tasks.js';
import { BoostReset, Btn, Collapse, FillButton, Icon, InfoTip, NumStepper, fmtDate, fmtDateLong, fmtTime, reduceMotion, useEscapeCancel } from './ui.jsx';

// Today tab — daily generated list, grouped.
//
// Layout:
//   Mobile  → single column. Each group is a section with a title bar +
//             divider. Whole tab scrolls.
//   Desktop → 200px sidebar on the left lists each group as a tab. Clicking
//             scrolls the main pane to that group; a scroll spy keeps the
//             active tab synced as the user scrolls.
//
// Groups come from picker.group. Entries that reference a picker with no
// group fall into "Other".

// Merge a reordered subset of *present* keys back into a fuller ordering that
// may also contain absent keys (groups/pickers with no entries today). Present
// keys are dropped into their existing slots in new relative order; absent keys
// keep their positions; brand-new present keys append at the end.
function mergeOrder(fullOrder, presentInNewOrder) {
  // Dedupe present keys (a synthetic day-off/charging id could otherwise be
  // reintroduced twice), preserving first-seen order — this IS the new order.
  const present = [];
  const seen = new Set();
  for (const x of (presentInNewOrder || [])) if (!seen.has(x)) { seen.add(x); present.push(x); }
  const presentSet = new Set(present);
  const result = present.slice();
  // Splice any base-only key (in fullOrder but not displayed now — e.g. a picker
  // with no entry today) back in right after its nearest preceding present
  // "anchor", so its saved position is preserved without dropping or duplicating
  // anything. `offsets` keeps sibling base-only keys sharing an anchor in order.
  const full = fullOrder || [];
  const offsets = new Map();
  for (let i = 0; i < full.length; i++) {
    const key = full[i];
    if (presentSet.has(key) || result.includes(key)) continue;
    let anchor = null;
    for (let j = i - 1; j >= 0; j--) { if (presentSet.has(full[j])) { anchor = full[j]; break; } }
    const off = offsets.get(anchor) || 0;
    if (anchor === null) result.splice(off, 0, key);
    else result.splice(result.indexOf(anchor) + 1 + off, 0, key);
    offsets.set(anchor, off + 1);
  }
  return result;
}

function groupEntries(state) {
  const byGroup = new Map();
  for (const e of state.today.entries) {
    // Day-off cards have no picker — render via a synthetic picker-like row so
    // they slot into their group like any other entry (sorted to the top).
    if (e.kind === 'dayoff') {
      const g = e.group || 'Other';
      if (!byGroup.has(g)) byGroup.set(g, { name: g, entries: [] });
      byGroup.get(g).entries.push({ entry: e, picker: { id: 'dayoff_' + e.conditionalId, name: e.cardText, group: g, _dayoff: true } });
      continue;
    }
    const picker = state.pickers.find((p) => p.id === e.pickerId);
    if (!picker || picker.hidden) continue;
    const g = picker.group || 'Other';
    if (!byGroup.has(g)) byGroup.set(g, { name: g, entries: [] });
    byGroup.get(g).entries.push({ entry: e, picker });
  }
  // Mini-tour launcher cards: one per sample picker, slotted into its normal
  // group like any other card. `p.hidden` gates the timing — samples stay
  // visible/real for the main Welcome Tour and only flip hidden once, at
  // that tour's last step (see onboarding.jsx), which is when these start
  // rendering. They stay on screen — checked or not — until checklistDone,
  // set once the closing Generate card runs (see onboarding-checklist.js).
  if (!(state.onboarding && state.onboarding.checklistDone)) {
    for (const p of state.pickers) {
      if (!p.hidden || !OB_SAMPLE_PICKER_IDS.includes(p.id)) continue;
      const g = p.group || 'Other';
      if (!byGroup.has(g)) byGroup.set(g, { name: g, entries: [] });
      const done = !!OB_CHECKLIST.entryFor(state, p.id);
      byGroup.get(g).entries.push({ entry: { kind: 'tutorial', eid: 'tut_' + p.id, done }, picker: p });
    }
  }
  // Group order: user-defined (state.groupOrder from Edit Mode), then any group
  // not yet listed appended by first occurrence in state.pickers, Other last.
  const order = [];
  const go = Array.isArray(state.groupOrder) ? state.groupOrder : [];
  for (const g of go) if (byGroup.has(g) && !order.includes(g)) order.push(g);
  for (const p of state.pickers) {
    if (p.group && byGroup.has(p.group) && !order.includes(p.group)) order.push(p.group);
  }
  if (byGroup.has('Other') && !order.includes('Other')) order.push('Other');
  // Within each group, rows follow state.pickerOrder[group]; unknown pickers
  // sort to the end (keeping their existing relative order).
  const po = (state.pickerOrder && typeof state.pickerOrder === 'object') ? state.pickerOrder : {};
  return order.filter((g) => byGroup.has(g)).map((g) => {
    const grp = byGroup.get(g);
    const idx = {};
    (po[g] || []).forEach((id, i) => { idx[id] = i; });
    grp.entries.forEach((row, i) => { row._i = i; }); // stable tiebreaker
    // Position key: an explicit user order (idx) always wins so day-off / "no
    // eligible items" cards can be dragged anywhere. Only when a row has no
    // stored position do we fall back to a default — day-off / charging cards
    // to the top (-1), regular picks to the end (1e6).
    const posOf = (row) => {
      if (row.picker.id in idx) return idx[row.picker.id];
      return (row.entry.kind === 'dayoff' || row.entry.kind === 'charging' || row.entry.kind === 'tutorial') ? -1 : 1e6;
    };
    grp.entries.sort((a, b) => (posOf(a) - posOf(b)) || (a._i - b._i));
    return grp;
  });
}

function GroupHeader({ name, doneCount, total, editMode, onGripDown, onRenameGroup, mergePending, onConfirmMerge, onCancelMerge, logOpen, onToggleLog, validate }) {
  // Cascade: animate the dash that just turned on.
  const prev = React.useRef(doneCount);
  const [freshIdx, setFreshIdx] = React.useState(-1);
  // Inline name edit (Edit Mode only).
  const [editing, setEditing] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const [draft, setDraft] = React.useState(name);
  // Only set when `validate` rejects a commit (e.g. Page Tours blocking a
  // rename that collides with an existing group name — it has nothing to
  // merge into, unlike renameGroup, so it blocks instead of offering a
  // merge). Keeps the input open with the input un-committed until the user
  // edits again or cancels.
  const [nameError, setNameError] = React.useState('');
  const nameInputRef = React.useRef(null);
  React.useEffect(() => {
    if (doneCount > prev.current) {
      const idx = doneCount - 1;
      setFreshIdx(idx);
      const t = setTimeout(() => setFreshIdx((v) => (v === idx ? -1 : v)), 520);
      prev.current = doneCount;
      return () => clearTimeout(t);
    }
    prev.current = doneCount;
  }, [doneCount]);
  // Explicit focus (not the input's own autoFocus) so preventScroll can be
  // passed — autoFocus's default scroll-into-view fights any guided-tour
  // spotlight/coach already mid-positioning this same input (the tour's own
  // scroll-to-target math runs a tick later, in a passive effect, so it
  // sees this as a moving target and its own one-time adjustment gets
  // overridden once the native scroll settles). Already-focused elements
  // don't re-trigger a native scroll, so select() alone doesn't need this.
  React.useEffect(() => {
    if (!editing || !nameInputRef.current) return;
    nameInputRef.current.focus({ preventScroll: true });
    nameInputRef.current.select();
  }, [editing]);
  // Leaving Edit Mode cancels any in-progress name edit.
  React.useEffect(() => { if (!editMode) setEditing(false); }, [editMode]);
  const startEdit = () => { setDraft(name); setNameError(''); setEditing(true); };
  // Close = play the out animation (is-closing) for ~150ms, THEN unmount the
  // input and (for a real change) commit the rename. Guarded so the blur that
  // Enter triggers can't double-fire.
  const finishClose = (changed, val) => {
    setClosing(true);
    setTimeout(() => {
      setEditing(false);
      setClosing(false);
      if (changed) onRenameGroup(val);
      else setDraft(name);
    }, 150);
  };
  const commit = () => {
    if (closing) return;
    const val = draft.trim();
    const changed = !!val && val !== name;
    if (changed && validate) {
      const err = validate(val);
      // Stays open, doesn't close. commit() runs from onBlur too (Enter blurs
      // the input) so focus may already be gone — reclaim it so the user can
      // just keep typing to fix the collision.
      if (err) { setNameError(err); nameInputRef.current?.focus(); return; }
    }
    finishClose(changed, val);
  };
  const cancel = () => { if (closing) return; setNameError(''); finishClose(false); };
  return (
    <React.Fragment>
    <header className={`group-h ${editMode ? 'is-reorderable' : ''}`}>
      <div className="group-h-l">
        {editMode && (
          <span className="group-grip" aria-label="Drag to reorder group" role="button" tabIndex={0}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                onPointerDown={(e) => onGripDown(e)}>
            <Icon name="grip" size={16} />
          </span>
        )}
        {editMode && editing ? (
          <input ref={nameInputRef} className={`group-name-input ${closing ? 'is-closing' : ''} ${nameError ? 'is-invalid' : ''}`} type="text" value={draft} maxLength={30}
                 aria-label="Group name"
                 onChange={(e) => { setDraft(e.target.value); if (nameError) setNameError(''); }}
                 onBlur={commit}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter') e.currentTarget.blur();
                   else if (e.key === 'Escape') { e.preventDefault(); cancel(); }
                 }} />
        ) : editMode ? (
          <button type="button" className="group-name group-name--editable" onClick={startEdit}
                  aria-label={`Rename group ${name}`}>
            {name}
            <Icon name="edit" size={13} />
          </button>
        ) : (
          <h2 className="group-name">{name}</h2>
        )}
        <span className="group-count">
          <span className="group-done">{doneCount}</span>
          <span className="group-of">of {total}</span>
        </span>
        {!editMode && onToggleLog && <DayLogChip open={logOpen} onClick={onToggleLog} />}
      </div>
      <div className="group-progress">
        {Array(total).fill(0).map((_, i) => (
          <i key={i} className={`${i < doneCount ? 'is-done' : ''} ${i === freshIdx ? 'is-fresh' : ''}`} />
        ))}
      </div>
    </header>
    {mergePending && (
      <div className="group-merge-confirm">
        <span className="confirm-msg">
          A group named &ldquo;{mergePending.to}&rdquo; already exists — merge
          &ldquo;{mergePending.from}&rdquo;&rsquo;s pickers into it? This can&rsquo;t be undone.
        </span>
        <div className="rem-del-actions">
          <Btn kind="ghost" size="sm" onClick={onCancelMerge}>Cancel</Btn>
          <Btn kind="primary" size="sm" onClick={onConfirmMerge}>Merge</Btn>
        </div>
      </div>
    )}
    {editing && nameError && (
      <div className="group-merge-confirm group-name-conflict">
        <span className="confirm-msg">{nameError}</span>
      </div>
    )}
    </React.Fragment>
  );
}

// ── Loader (regeneration) ───────────────────────────────────────────────────
// Rapidly cycles item names in place; the card transitions to 'settled' and
// unmounts the reel from the outside, so the reel just keeps cycling.
function LoaderReel({ candidates }) {
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    if (!candidates || candidates.length < 2) return;
    const id = setInterval(() => {
      setIdx((prev) => (prev + 1 + Math.floor(Math.random() * 2)) % candidates.length);
    }, 90);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <span className="loader-reel-name" key={idx}>
      {candidates[idx]?.name || '\u00A0'}
    </span>
  );
}

function LoaderCard({ picker, info }) {
  const status = info?.status || 'pending';
  const kind = info?.kind || 'pick';
  // Non-pick slots (day-off / charging) have no candidate reel — they cycle the
  // pending dots, then settle into their fixed card text.
  const settledName = kind === 'dayoff'
    ? (info.cardText || picker.name)
    : kind === 'charging'
    ? 'No eligible items for today'
    : (info && info.candidates ? info.candidates.find((c) => c.id === info.pickedId)?.name : '');
  const hasReel = kind === 'pick' && info && info.candidates && info.candidates.length;
  return (
    <article className={`today-card today-card--loader is-${status}`}>
      <span className="check" aria-hidden="true" />
      <div className="today-card-body">
        <div className="today-card-meta">
          <span className="meta-picker">{picker.name}</span>
        </div>
        <div className="today-card-name">
          {status === 'pending'  && <span className="loader-pending">·  ·  ·</span>}
          {status === 'active'   && (hasReel
            ? <LoaderReel candidates={info.candidates} />
            : <span className="loader-pending">·  ·  ·</span>)}
          {status === 'settled'  && (
            <span className="loader-reel-name loader-settled">{settledName}</span>
          )}
        </div>
      </div>
      <div className="today-card-actions" />
    </article>
  );
}

// Inline editor shown under a picker entry when its pencil is toggled. Mirrors
// the Pickers-tab per-item controls: for weighted/dynamic pickers a weight
// stepper; for ease-up/ease-down the item's cadence range (soonest/latest, the
// human face of its drift band) since weight is irrelevant to those modes.
// Plus a vacation toggle and a confirm-gated delete (delete behaves exactly as
// Data — actions.removeItem).
function EntryEditor({ item, picker, actions, onClose, onCancel, onDelete }) {
  const [confirmDel, setConfirmDel] = React.useState(false);
  // Snapshot the item as it was when this editor opened, so Cancel can revert
  // the live weight / cadence / vacation / name edits. Data passes onCancel to
  // discard a brand-new item instead of reverting it.
  const orig = React.useRef(item);
  // 'saved' | 'cancel' once closed explicitly; null = still open → an implicit
  // close (tab-switch / reload) should discard the unsaved live edits.
  const doneRef = React.useRef(null);
  const revertState = () => {
    if (onCancel) onCancel(orig.current);
    else actions.replaceItem(orig.current.id, orig.current);
  };
  const cancel = () => { doneRef.current = 'cancel'; revertState(); if (!onCancel) onClose(); };
  // Escape = Cancel. While the delete confirm is open it backs out of that instead.
  useEscapeCancel(true, () => { if (confirmDel) setConfirmDel(false); else cancel(); });
  const saveClose = () => { doneRef.current = 'saved'; onClose(); };
  const restoreToStorage = () => {
    try {
      const raw = localStorage.getItem('easemylife.v2');
      if (!raw) return;
      const s = JSON.parse(raw);
      if (!Array.isArray(s.items)) return;
      s.items = onCancel
        ? s.items.filter((i) => i.id !== orig.current.id)   // brand-new item → drop it
        : s.items.map((i) => i.id === orig.current.id ? orig.current : i);
      localStorage.setItem('easemylife.v2', JSON.stringify(s));
    } catch (e) {}
  };
  React.useEffect(() => {
    window.__editGuard.disarm();
    const onHide = () => { if (!doneRef.current) restoreToStorage(); };
    window.addEventListener('pagehide', onHide);
    return () => {
      window.removeEventListener('pagehide', onHide);
      if (!doneRef.current) window.__editGuard.arm(revertState);
    };
  }, []);
  const mode = picker ? picker.mode : 'random';
  const isEase = mode === 'ease-up' || mode === 'ease-down';
  // Weight is a lever only for weighted / dynamic; random and ease modes ignore
  // it (random picks uniformly), so we don't show a weight stepper there.
  const usesWeight = mode === 'weighted' || mode === 'dynamic';
  const isDynamic = mode === 'dynamic';

  // Same drift↔days conversion the new-picker form uses, so the numbers a user
  // sets here read identically to where the item was created.
  const THRESHOLD = 100;
  const driftToSoonest = (easeMax) => Math.max(1, Math.round(THRESHOLD / (easeMax || 1)));
  const driftToLatest = (easeMin) => Math.max(1, Math.round(THRESHOLD / (easeMin || 1)));
  const daysToDrift = (days) => THRESHOLD / Math.max(1, days);
  const eMin = item.easeMin ?? (picker && picker.easeMin) ?? 10;
  const eMax = item.easeMax ?? (picker && picker.easeMax) ?? 20;
  const soonest = driftToSoonest(eMax);
  const latest = driftToLatest(eMin);
  const setSoonest = (days) => {
    const easeMax = daysToDrift(Math.max(1, Math.min(60, days)));
    actions.updateItem(item.id, { easeMax, easeMin: Math.min(eMin, easeMax) });
  };
  const setLatest = (days) => {
    const easeMin = daysToDrift(Math.max(1, Math.min(90, days)));
    actions.updateItem(item.id, { easeMin, easeMax: Math.max(eMax, easeMin) });
  };
  const isDown = mode === 'ease-down';
  const soonestLbl = isDown ? 'Shortest' : 'Soonest';
  const latestLbl = isDown ? 'Longest' : 'Latest';
  const uw = (n) => CADENCE.unitWord(picker && picker.cadence, n);
  const soonestSub = isDown
    ? <>stays picked <strong>{soonest} {uw(soonest)}</strong> minimum</>
    : <><strong>{soonest} {uw(soonest)}</strong> until pickable again</>;
  const latestSub = isDown
    ? <>stays picked <strong>{latest} {uw(latest)}</strong> maximum</>
    : <><strong>{latest} {uw(latest)}</strong> until pick is mandatory</>;

  return (
    <div className="rem-inline-editor entry-editor">
      <div className="pie-rows">
        {isEase ? (
          <React.Fragment>
            <div className="pie-row">
              <div className="pie-rowlabel">
                <span className="pie-lbl-row">
                  <span className="pie-lbl">{soonestLbl}</span>
                  {mode === 'ease-up' && (
                    <InfoTip className="pie-help" label={EASE_UP_RANGE_WARN}>?</InfoTip>
                  )}
                </span>
                <span className="pie-sub set-sub-fade" key={`${isDown}-${soonest}-${uw(soonest)}`}>{soonestSub}</span>
              </div>
              <div className="pie-ctl">
                <NumStepper value={soonest} min={1} max={60} onSet={setSoonest}
                            ariaLabel={`${soonestLbl} for ${item.name}`} />
                <span className="np-ease-unit">{uw(soonest)}</span>
              </div>
            </div>
            <div className="pie-row">
              <div className="pie-rowlabel">
                <span className="pie-lbl-row">
                  <span className="pie-lbl">{latestLbl}</span>
                  {mode === 'ease-up' && (
                    <InfoTip className="pie-help" label={EASE_UP_RANGE_WARN}>?</InfoTip>
                  )}
                </span>
                <span className="pie-sub set-sub-fade" key={`${isDown}-${latest}-${uw(latest)}`}>{latestSub}</span>
              </div>
              <div className="pie-ctl">
                <NumStepper value={latest} min={1} max={90} onSet={setLatest}
                            ariaLabel={`${latestLbl} for ${item.name}`} />
                <span className="np-ease-unit">{uw(latest)}</span>
              </div>
            </div>
            {mode === 'ease-up' && (
              <div className="pie-row">
                <div className="pie-rowlabel">
                  <span className="pie-lbl">Fill</span>
                  <span className="pie-sub set-sub-fade" key={(item.value ?? 0) >= THRESHOLD ? 'full' : 'part'}>{(item.value ?? 0) >= THRESHOLD ? <>item is <strong>fully charged</strong> at {Math.round(item.value ?? 0)}</> : <>item at <strong>{Math.round(item.value ?? 0)} charge</strong></>}</span>
                </div>
                <FillButton label="Fill"
                     disabled={(item.value ?? 0) >= (picker.threshold ?? 100)}
                     onClick={() => actions.updateItem(item.id, { value: Math.max(item.value ?? 0, picker.threshold ?? 100) })} />
              </div>
            )}
            {mode === 'ease-down' && (
              <div className="pie-row">
                <div className="pie-rowlabel">
                  <span className="pie-lbl">Refill</span>
                  <span className="pie-sub set-sub-fade" key={(item.value ?? 0) >= THRESHOLD ? 'full' : 'part'}>{(item.value ?? 0) >= THRESHOLD ? <>item is <strong>fully charged</strong></> : <>item at <strong>{Math.round(item.value ?? 0)} charge</strong></>}</span>
                </div>
                <FillButton label="Refill"
                     disabled={(item.value ?? 0) >= (picker.threshold ?? 100)}
                     onClick={() => actions.updateItem(item.id, { value: Math.max(item.value ?? 0, picker.threshold ?? 100) })} />
              </div>
            )}
          </React.Fragment>
        ) : usesWeight ? (
          <div className="pie-row">
            <div className="pie-rowlabel">
              <span className="pie-lbl">Weight</span>
              <span className="pie-sub set-sub-fade" key={item.weight}>{item.weight === 1 ? <><strong>baseline</strong> pick chance</> : <><strong>{item.weight}×</strong> more likely than w1</>}</span>
            </div>
            <div className="weight-stepper">
              <button onClick={() => actions.setItemWeight(item.id, Math.max(1, item.weight - 1))} disabled={item.weight <= 1} aria-label="Less weight">−</button>
              <span className="weight-val">w{item.weight}</span>
              <button onClick={() => actions.setItemWeight(item.id, Math.min(9, item.weight + 1))} disabled={item.weight >= 9} aria-label="More weight">+</button>
            </div>
          </div>
        ) : (
          <div className="pie-row">
            <div className="pie-rowlabel">
              <span className="pie-lbl">Weight</span>
              <span className="pie-sub">truly random items have equal chance</span>
            </div>
            <span className="pie-note">No weight</span>
          </div>
        )}
        {isDynamic && (
          <div className="pie-row">
            <div className="pie-rowlabel">
              <span className="pie-lbl">Boost</span>
              <span className="pie-sub set-sub-fade" key={(item.value || 0) > 0 ? 'boost' : 'none'}>{(item.value || 0) > 0 ? <><strong>+{item.value}</strong> to weight, resets when picked</> : <><strong>no bonus</strong> to weight, will increase when not picked</>}</span>
            </div>
            <div className="pie-ctl">
              <BoostReset value={item.value || 0} onReset={() => actions.updateItem(item.id, { value: 0 })} />
            </div>
          </div>
        )}
        <div className="pie-row">
          <div className="pie-rowlabel">
            <span className="pie-lbl">Active</span>
            <span className="pie-sub set-sub-fade" key={String(!!item.vacation)}>{item.vacation ? <><strong>not eligible</strong> to be picked</> : <><strong>eligible</strong> to be picked</>}</span>
          </div>
          <button className={`switch ${!item.vacation ? 'is-on' : ''}`} aria-pressed={!item.vacation}
                  aria-label={item.vacation ? 'Bring back into rotation' : 'Send on vacation'}
                  onClick={() => actions.toggleVacation(item.id, 'item')}><i /></button>
        </div>
      </div>
      {confirmDel ? (
        <div className="rem-inline-foot rem-foot-confirm" key="confirm">
          <span className="rem-del-msg">Delete this item?</span>
          <div className="rem-del-actions">
            <Btn kind="ghost" size="sm" onClick={() => setConfirmDel(false)}>Cancel</Btn>
            <Btn kind="danger" size="sm" onClick={() => (onDelete ? onDelete() : actions.removeItem(item.id))}>Delete</Btn>
          </div>
        </div>
      ) : (
        <div className="rem-inline-foot rd-edit-foot" key="foot">
          <Btn kind="danger" size="sm" icon="trash" onClick={() => setConfirmDel(true)}>Delete</Btn>
          <div className="rem-foot-right">
            <Btn kind="ghost" size="sm" className="ob-item-cancel" onClick={cancel}>Cancel</Btn>
            <Btn kind="ghost" size="sm" className="ob-item-save" onClick={saveClose}>Save</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

function EntryCard({ entry, picker, state, actions, justChecked, onCheck, onSkip, onReroll, isRemoving, isRolling, isEditing, onEdit, onRename, editMode, onGripDown, onPlayTutorial, onUncheckTutorial, checklistExiting }) {
  // Mini-tour launcher: a sample picker from the Welcome Tour, offered as a
  // "try this" card in its normal group. Stays on screen resolved or not —
  // Play (or the card itself) starts the mini-tour; X marks it cancelled
  // without touching the sample. Once resolved (any of the 3 ways — see
  // onboarding-checklist.js) it shows checked, and — unlike a pending card,
  // which can only be resolved via Play/X, never by clicking the checkbox
  // directly — clicking it (or the row) then un-resolves it, same as a
  // normal completed card toggling back off, so the tutorial can be redone.
  if (entry.kind === 'tutorial') {
    const done = entry.done;
    // Only picker cards participate in the "at least one real picker" gate
    // (see OB_CHECKLIST.realPickerCount) — flagged with a visible cue
    // rather than requiring a tap to discover, since it blocks the closing
    // Generate card.
    const needsAttention = !done && OB_CHECKLIST.realPickerCount(state) === 0;
    const onRowClick = (e) => {
      if (e.target.closest('.today-card-actions')) return;
      if (done) onUncheckTutorial('picker', picker.id);
      else onPlayTutorial('picker', picker.id);
    };
    return (
      <article className={`today-card today-card--tutorial ${done ? 'is-done' : ''} ${needsAttention ? 'is-needed' : ''} ${checklistExiting ? 'is-removing' : ''}`}
                onClick={onRowClick}>
        {done ? (
          <button type="button" className="check" aria-pressed="true"
                  aria-label={`Undo ${picker.name} tutorial`}
                  onClick={(e) => { e.stopPropagation(); onUncheckTutorial('picker', picker.id); }}>
            <span className="check-ripple" aria-hidden="true" />
            <Icon name="check" size={14} />
          </button>
        ) : (
          <button type="button" className="check" aria-label={`Start the ${picker.name} tutorial`}
                  onClick={(e) => { e.stopPropagation(); onPlayTutorial('picker', picker.id); }}>
            <Icon name="play" size={13} />
          </button>
        )}
        <div className="today-card-body">
          <div className="today-card-meta">
            <span className="meta-picker">{picker.name}</span>
          </div>
          <div className="today-card-name">Set up a {picker.name} picker</div>
        </div>
        {!done && (
          <div className="today-card-actions">
            <button className="icon-btn" onClick={(e) => { e.stopPropagation(); actions.setChecklistItem(picker.id, { status: 'cancelled' }); }}
                    aria-label="Cancel tutorial" title="Cancel">
              <Icon name="x" size={15} />
            </button>
          </div>
        )}
      </article>
    );
  }
  // Day-off card: a conditional is active and its dependent pickers are
  // suppressed. Renders like a completable card (drives the conditional's
  // reset/discharge) but has no item, no re-roll, and no editable name.
  if (entry.kind === 'dayoff') {
    const dofresh = justChecked === entry.eid && entry.done;
    const disabledTip = 'This action is disabled for this type of item.';
    const onRowClick = (e) => {
      if (editMode || isRemoving) return;
      if (e.target.closest('.today-card-actions')) return;
      onCheck(picker, entry);
    };
    return (
      <article className={`today-card today-card--dayoff ${entry.done ? 'is-done' : ''} ${dofresh ? 'is-fresh' : ''} ${isRemoving ? 'is-removing' : ''} ${editMode ? 'is-reorderable' : ''}`}
               onClick={onRowClick}>
        {editMode ? (
          <span className="card-grip" aria-label="Drag to reorder" role="button" tabIndex={0}
                draggable={false} onDragStart={(e) => e.preventDefault()}
                onPointerDown={(e) => onGripDown(e)}>
            <Icon name="grip" size={16} />
          </span>
        ) : (
          <button type="button" className="check" aria-pressed={!!entry.done}
                  aria-label={`${entry.done ? 'Unmark' : 'Mark'} day off complete`}
                  onClick={(e) => { e.stopPropagation(); onCheck(picker, entry); }}>
            <span className="check-ripple" aria-hidden="true" />
            {entry.done && <Icon name="check" size={14} />}
          </button>
        )}
        <div className="today-card-body">
          <div className="today-card-meta today-card-meta--dayoff">
            <span className="meta-picker meta-dayoff-title">
              {entry.pickerName ? <>{entry.pickerName} — <strong>{entry.condName || 'Day off'}</strong></> : 'Day off'}
            </span>
          </div>
          <div className="today-card-name">{entry.cardText || 'Enjoy your day off'}</div>
        </div>
        {!editMode && (
          <div className="today-card-actions">
            <InfoTip className="icon-btn is-disabled" label={disabledTip} action="Re-roll">
              <Icon name="refresh" size={14} />
            </InfoTip>
            <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onSkip(entry.eid); }}
                    aria-label="Skip" title="Skip">
              <Icon name="skip" size={15} />
            </button>
            <InfoTip className="icon-btn is-disabled" label={disabledTip} action="Edit">
              <Icon name="edit" size={15} />
            </InfoTip>
          </div>
        )}
      </article>
    );
  }
  // Charging card: an ease-up picker had nothing charged to its threshold today.
  // Completable check applies that day's drift to all its items; Skip/Edit/Re-roll
  // are shown but disabled with a tip (hover + tap).
  if (entry.kind === 'charging') {
    const chfresh = justChecked === entry.eid && entry.done;
    const disabledTip = 'This action is disabled for this type of item.';
    const onRowClick = (e) => {
      if (editMode || isRemoving) return;
      if (e.target.closest('.today-card-actions')) return;
      onCheck(picker, entry);
    };
    return (
      <article className={`today-card today-card--charging ${entry.done ? 'is-done' : ''} ${chfresh ? 'is-fresh' : ''} ${isRemoving ? 'is-removing' : ''} ${editMode ? 'is-reorderable' : ''}`}
               onClick={onRowClick}>
        {editMode ? (
          <span className="card-grip" aria-label="Drag to reorder" role="button" tabIndex={0}
                draggable={false} onDragStart={(e) => e.preventDefault()}
                onPointerDown={(e) => onGripDown(e)}>
            <Icon name="grip" size={16} />
          </span>
        ) : (
          <button type="button" className="check" aria-pressed={!!entry.done}
                  aria-label={`${entry.done ? 'Unmark' : 'Mark'} ${picker.name} charging card complete`}
                  onClick={(e) => { e.stopPropagation(); onCheck(picker, entry); }}>
            <span className="check-ripple" aria-hidden="true" />
            {entry.done && <Icon name="check" size={14} />}
          </button>
        )}
        <div className="today-card-body">
          <div className="today-card-meta">
            <span className="meta-picker">{picker.name}</span>
          </div>
          <div className="today-card-name">No eligible items for today</div>
        </div>
        {!editMode && (
          <div className="today-card-actions">
            <InfoTip className="icon-btn is-disabled" label={disabledTip} action="Re-roll">
              <Icon name="refresh" size={14} />
            </InfoTip>
            <InfoTip className="icon-btn is-disabled" label={disabledTip} action="Skip">
              <Icon name="skip" size={15} />
            </InfoTip>
            <InfoTip className="icon-btn is-disabled" label={disabledTip} action="Edit">
              <Icon name="edit" size={15} />
            </InfoTip>
          </div>
        )}
      </article>
    );
  }
  const item = state.items.find((it) => it.id === entry.itemId);
  if (!item) return null;
  const fresh = justChecked === entry.eid && entry.done;
  // Re-roll needs at least two candidates to land on a DIFFERENT item; with only
  // one the button is disabled and shows a tip (hover on desktop, tap on mobile).
  // What counts as a candidate is per-mode: ease-up cycles items charged to the
  // threshold; every other mode draws from the picker's non-vacation items.
  const rerollPool = state.items.filter((it) => it.pickerId === picker.id && !it.vacation);
  const eligCount = picker.mode === 'ease-up'
    ? rerollPool.filter((it) => PICKERS.easeEligible(it, picker.threshold)).length
    : rerollPool.length;
  // A completed entry can't be rolled away or skipped: re-roll would silently
  // revoke the completion and revert the drift/boost mutation it applied (and
  // leave a log row that is both done and rejected), and skip would discard the
  // completion outright. Both are expressible without the footgun — push another
  // item manually, or un-check first — so the buttons explain rather than act.
  const isDone = !!entry.done;
  const canReroll = eligCount >= 2 && !isDone;
  const doneRerollTip = 'Item is completed and cannot be rolled away. If you want another item added, use the Pickers tab to manually push another item here.';
  const doneSkipTip = 'Item is completed and cannot be skipped. If you want remove this item, uncheck it first.';
  const rerollTip = picker.mode === 'ease-up'
    ? 'Only one item is charged and ready — nothing to re-roll to. Another item becomes available once it reaches full charge.'
    : 'This picker has only one active item — nothing to re-roll to. Add or activate another item for this picker to enable re-rolls.';
  // Completion takes precedence: it applies regardless of candidate count.
  const activeRerollTip = isDone ? doneRerollTip : rerollTip;
  const handleRowClick = (e) => {
    if (editMode || isRemoving || isRolling) return;
    // Don't toggle when the user clicks Skip / Re-roll / Edit or the name field.
    if (e.target.closest('.today-card-actions')) return;
    if (e.target.closest('.entry-card-name-input')) return;
    onCheck(picker, entry);
  };
  return (
    <article className={`today-card ${entry.done ? 'is-done' : ''} ${fresh ? 'is-fresh' : ''} ${isRemoving ? 'is-removing' : ''} ${isRolling ? 'is-rolling' : ''} ${isEditing ? 'is-editing' : ''} ${editMode ? 'is-reorderable' : ''}`}
             onClick={handleRowClick}>
      {editMode ? (
        <span className="card-grip" aria-label="Drag to reorder" role="button" tabIndex={0}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
              onPointerDown={(e) => onGripDown(e)}>
          <Icon name="grip" size={16} />
        </span>
      ) : (
        <button type="button" className="check" aria-pressed={!!entry.done}
                aria-label={`${entry.done ? 'Unmark' : 'Mark'} ${item.name} complete`}
                onClick={(e) => { e.stopPropagation(); onCheck(picker, entry); }}>
          <span className="check-ripple" aria-hidden="true" />
          {entry.done && <Icon name="check" size={14} />}
        </button>
      )}
      <div className="today-card-body">
        <div className="today-card-meta">
          <span className="meta-picker">{picker.name}</span>
        </div>
        {isEditing ? (
          <input className="entry-card-name-input" type="text" value={item.name} maxLength={60}
                 placeholder="Item name" autoComplete="off" aria-label="Item name" autoFocus
                 onClick={(e) => e.stopPropagation()}
                 onChange={(e) => onRename(e.target.value)}
                 onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} />
        ) : (
          <div className="today-card-name">{item.name}</div>
        )}
      </div>
      {!editMode && (
        <div className="today-card-actions">
          {canReroll ? (
            <button className={`icon-btn ${isRolling ? 'is-spinning' : ''}`}
                    onClick={(e) => { e.stopPropagation(); onReroll(entry, picker); }}
                    aria-label="Re-roll" title="Re-roll">
              <Icon name="refresh" size={14} />
            </button>
          ) : (
            <InfoTip className="icon-btn is-disabled" label={activeRerollTip} action="Re-roll">
              <Icon name="refresh" size={14} />
            </InfoTip>
          )}
          {isDone ? (
            <InfoTip className="icon-btn is-disabled" label={doneSkipTip} action="Skip">
              <Icon name="skip" size={15} />
            </InfoTip>
          ) : (
            <button className="icon-btn" onClick={(e) => { e.stopPropagation(); onSkip(entry.eid); }}
                    aria-label="Skip" title="Skip">
              <Icon name="skip" size={15} />
            </button>
          )}
          <button className={`icon-btn ${isEditing ? 'is-on' : ''}`}
                  onClick={(e) => { e.stopPropagation(); onEdit(); }}
                  aria-label="Edit" title="Edit" aria-expanded={isEditing}>
            <Icon name="edit" size={15} />
          </button>
        </div>
      )}
    </article>
  );
}

// A "Page Tours" launcher card — same shape/behavior as a picker's tutorial
// card (persistent, checked/unchecked toggle, Play/X — see EntryCard's
// 'tutorial' branch above), just with no sample picker/task backing it: no
// data to finish/skip/cancel, only the checklist bookkeeping itself.
function PageTourCard({ tour, state, actions, onPlayTutorial, onUncheckTutorial, checklistExiting }) {
  const done = !!OB_CHECKLIST.entryFor(state, tour.id);
  const onRowClick = (e) => {
    if (e.target.closest('.today-card-actions')) return;
    if (done) onUncheckTutorial('pageTour', tour.id);
    else onPlayTutorial('pageTour', tour.id);
  };
  return (
    <article className={`today-card today-card--tutorial ${done ? 'is-done' : ''} ${checklistExiting ? 'is-removing' : ''}`}
              onClick={onRowClick}>
      {done ? (
        <button type="button" className="check" aria-pressed="true"
                aria-label={`Undo ${tour.label} tour`}
                onClick={(e) => { e.stopPropagation(); onUncheckTutorial('pageTour', tour.id); }}>
          <span className="check-ripple" aria-hidden="true" />
          <Icon name="check" size={14} />
        </button>
      ) : (
        <button type="button" className="check" aria-label={`Start the ${tour.label} tour`}
                onClick={(e) => { e.stopPropagation(); onPlayTutorial('pageTour', tour.id); }}>
          <Icon name="play" size={13} />
        </button>
      )}
      <div className="today-card-body">
        <div className="today-card-meta">
          <span className="meta-picker">{tour.label} Tour</span>
        </div>
        <div className="today-card-name">Take a quick tour of the {tour.label} page</div>
      </div>
      {!done && (
        <div className="today-card-actions">
          <button className="icon-btn" onClick={(e) => { e.stopPropagation(); actions.setChecklistItem(tour.id, { status: 'cancelled' }); }}
                  aria-label="Cancel tutorial" title="Cancel">
            <Icon name="x" size={15} />
          </button>
        </div>
      )}
    </article>
  );
}

function TabToday({ state, actions, onHome, onNavTab, onStartPickerTour, onStartPageTour }) {
  // Help mode engine test case (see help-mode.jsx's own header comment) —
  // local, resets to off on every remount (tab switch), which is exactly
  // the "navigating away closes it, the page you land on doesn't inherit
  // it" behavior the design called for. Two targets specifically to prove
  // the "several highlights, independent badges, one shared open tooltip"
  // mechanics work before rolling real content out to every page.
  const [helpOn, setHelpOn] = React.useState(false);
  const helpItems = React.useMemo(() => [
    {
      id: 'progressRing', sel: '.ring', title: 'Progress Ring',
      body: <>This tracks your current progress of completed / total tasks for today's todo list. Once filled completely, your Day Streak will increase and the celebration animations will play.</>,
    },
    {
      id: 'brandMark', sel: '.brand-mark', title: 'Home',
      body: <>Click this logo any time to jump back to the top of your todo list.</>,
    },
  ], []);
  const groups = React.useMemo(() => groupEntries(state), [state]);
  // Unified block order: the Reminders block ('__reminders' sentinel) plus the
  // picker groups, sequenced by state.groupOrder. Drives both the rail and the
  // content column so Reminders can be dragged among the groups in Edit Mode.
  const blockOrder = React.useMemo(() => {
    const go = state.groupOrder || [];
    const names = groups.map((g) => g.name);
    const seen = new Set();
    const order = [];
    const push = (id) => { if (!seen.has(id)) { seen.add(id); order.push(id); } };
    if (!go.includes('__reminders')) push('__reminders');
    for (const x of go) {
      if (x === '__reminders' || x === '__pageTours') push(x);
      else if (names.includes(x)) push(x);
    }
    for (const n of names) push(n);
    push('__reminders');
    // Page Tours defaults to right after Reminders the first time it shows up
    // (e.g. state.groupOrder saved before Page Tours existed) so it doesn't
    // need a backfill in migrate(); once the user drags it in Edit Mode, its
    // saved position in state.groupOrder takes over like any other group.
    if (!seen.has('__pageTours')) order.splice(order.indexOf('__reminders') + 1, 0, '__pageTours');
    return order;
  }, [state.groupOrder, groups]);
  const groupByName = React.useMemo(() => {
    const m = {}; groups.forEach((g) => { m[g.name] = g; }); return m;
  }, [groups]);
  // Entries belonging to a hidden picker (see the `hidden` flag in
  // store.jsx's migrate()) are excluded from every count here, same as
  // groupEntries() already excludes them from the rendered groups above.
  const entries = React.useMemo(() => {
    const hiddenPickerIds = new Set(state.pickers.filter((p) => p.hidden).map((p) => p.id));
    return state.today.entries.filter((e) => !e.pickerId || !hiddenPickerIds.has(e.pickerId));
  }, [state.today.entries, state.pickers]);
  // Manual reminders due today join the picker entries in the ring + rail
  // totals (they count toward completion + streak, but never toward Stats).
  // Visibility honors each type's weekend / holiday exclusions; the ring only
  // counts reminders whose type has "include in completion ring" on. Pinned
  // to the last generation (not live "now") — see TASKS.anchorDate — so these
  // totals always agree with what ReminderSection is actually showing.
  const generatedAt = state.today && state.today.generatedAt;
  const remindersAnchor = React.useMemo(() => TASKS.anchorDate(generatedAt), [generatedAt]);
  const dueReminders = React.useMemo(
    () => TASKS.visibleToday(state.tasks, state.reminderOpts, state.holidays, remindersAnchor),
    [state.tasks, state.reminderOpts, state.holidays, remindersAnchor]);
  const remindersDoneVisible = dueReminders.filter((t) => TASKS.isDoneToday(t, remindersAnchor)).length;
  const ringReminders = dueReminders.filter((t) => TASKS.optsFor(t, state.reminderOpts).ring);
  const remindersDone = ringReminders.filter((t) => TASKS.isDoneToday(t, remindersAnchor)).length;
  // Mini-tour launcher cards (pickers + reminders + Page Tours + the closing
  // Generate card) join the ring/rail totals the whole time they're on
  // screen — see groupEntries()'s own copy of this same gate. Kept
  // additive/separate from `entries`/`dueReminders` (rather than merged in)
  // so streak reconciliation and Stats stay untouched by tutorial-card
  // completion — see store.jsx's reconcileStreak, which only ever reads
  // state.today.entries/state.tasks.
  const checklistDone = !!(state.onboarding && state.onboarding.checklistDone);
  // Whether the main Welcome Tour has concluded (sample pickers/tasks flip
  // hidden exactly once, at that tour's last step) — i.e. whether the
  // mini-tour checklist phase (launcher cards + Page Tours + the closing
  // Generate card) should be showing at all, independent of checklistDone.
  const mainTourEnded = state.pickers.some((p) => p.hidden && OB_SAMPLE_PICKER_IDS.includes(p.id))
    || (state.tasks || []).some((t) => t.hidden && OB_SAMPLE_TASK_IDS.includes(t.id));
  const showChecklist = mainTourEnded && !checklistDone;
  // Published so reminders.jsx's startAdd can hide ANY reminder created
  // while the checklist is up — not just ones a mini-tour itself creates —
  // so a user manually clicking "+" mid-onboarding doesn't clutter the list
  // alongside the still-open launcher cards either. See the unhide side in
  // the generateItemResolved effect below.
  React.useEffect(() => { emlTour.set({ showChecklist }); }, [showChecklist]);
  const pageToursName = (state.onboarding && state.onboarding.pageToursName) || 'Page Tours';
  // Page Tours has no pickers to merge into on a name collision (unlike
  // renameGroup), so a collision just blocks the rename outright — checked
  // against every real group name plus the fixed "Reminders" label, the
  // other section header that isn't itself a real group.
  const pageToursNameCollision = (raw) => {
    const val = String(raw || '').trim();
    if (!val) return null;
    const target = normalizeGroupName(val) || val;
    const existing = [...new Set(state.pickers.filter((p) => p.group).map((p) => p.group))];
    existing.push('Reminders');
    const hit = existing.find((g) => g.toLowerCase() === target.toLowerCase());
    return hit ? `A group named “${hit}” already exists.` : null;
  };
  const tutorialPickerCount = showChecklist
    ? state.pickers.filter((p) => p.hidden && OB_SAMPLE_PICKER_IDS.includes(p.id)).length : 0;
  const tutorialPickerDone = showChecklist
    ? state.pickers.filter((p) => p.hidden && OB_SAMPLE_PICKER_IDS.includes(p.id) && OB_CHECKLIST.entryFor(state, p.id)).length : 0;
  const tutorialTaskCount = showChecklist
    ? (state.tasks || []).filter((t) => t.hidden && OB_SAMPLE_TASK_IDS.includes(t.id)).length : 0;
  const tutorialTaskDone = showChecklist
    ? (state.tasks || []).filter((t) => t.hidden && OB_SAMPLE_TASK_IDS.includes(t.id) && OB_CHECKLIST.entryFor(state, t.id)).length : 0;
  const pageTourCount = showChecklist ? OB_PAGE_TOURS.length : 0;
  const pageTourDone = showChecklist
    ? OB_PAGE_TOURS.filter((t) => OB_CHECKLIST.entryFor(state, t.id)).length : 0;
  const generateCardCount = showChecklist ? 1 : 0;
  const generateCardDone = (showChecklist && OB_CHECKLIST.entryFor(state, OB_GENERATE_ITEM_ID)) ? 1 : 0;
  const doneCount = entries.filter((e) => e.done).length + remindersDone
    + tutorialPickerDone + tutorialTaskDone + pageTourDone + generateCardDone;
  const total = entries.length + ringReminders.length
    + tutorialPickerCount + tutorialTaskCount + pageTourCount + generateCardCount;

  // Live clock — re-render at the top of every minute so the displayed time
  // stays accurate without spamming setState every second.
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const tick = () => setNow(new Date());
    const msToNextMinute = 60000 - (Date.now() % 60000);
    let intervalId = null;
    const t = setTimeout(() => {
      tick();
      intervalId = setInterval(tick, 60000);
    }, msToNextMinute);
    return () => { clearTimeout(t); if (intervalId) clearInterval(intervalId); };
  }, []);

  // Celebration: track which entry was just checked + pulse the ring when
  // the total done-count climbs. When the climb completes the whole day,
  // play the richer "all done" animation instead of the per-tick pulse.
  // The "becomes complete" check also handles the case where a skip drops
  // the total such that the remaining done entries fill the ring.
  const [justChecked, setJustChecked] = React.useState(null);
  // Single lifted "which editor is open" slot shared across the whole tab —
  // a picker item's inline editor (`item:<eid>`), a reminder's inline editor
  // or its quick-add form (owned by ReminderSection, passed down below) all
  // read/write this same value, so opening any one of them collapses
  // whichever of the others was open (each already discards its own unsaved
  // edits on collapse/unmount — see EntryEditor's __editGuard revert and
  // ReminderInlineEdit/quick-add's plain local draft state).
  const [activeEditor, setActiveEditor] = React.useState(null);
  // Day Log: which single group's (or the Reminders block's) log panel is
  // open — opening one closes whichever other was open.
  const [openLogKey, setOpenLogKey] = React.useState(null);
  const toggleLog = (key) => setOpenLogKey((cur) => cur === key ? null : key);
  const ringRef = React.useRef(null);
  const streakRef = React.useRef(null);
  const prevDone = React.useRef(doneCount);
  const prevComplete = React.useRef(total > 0 && doneCount === total);
  const prevClaimed = React.useRef(!!state.today.streakClaimed);
  const isComplete = total > 0 && doneCount === total;
  // Bumped every time we transition into complete, so the celebratory title
  // re-mounts and replays its per-word reveal.
  const [completionNonce, setCompletionNonce] = React.useState(0);
  // Confetti/sparkle particles for the completion celebration (Appearance →
  // Completion celebration). Ripple/Pulse/Cascade are pure CSS variants of the
  // existing ring-ripple/card-exhale elements; these two styles use a
  // genuinely different mechanism (small generated particles), so they need
  // actual DOM nodes — generated fresh each celebration, cleared after.
  const completionStyle = (state.appearance && state.appearance.completionStyle) || 'confetti';
  const [particles, setParticles] = React.useState([]);
  // Confetti/Sparkle overlay the viewable cards area (not the group rail) —
  // horizontally bounded to the cards column, but vertically spanning the
  // scroll container's own on-screen viewport (not the cards list's own,
  // possibly-scrolled-away, bounding box) so the celebration always shows
  // regardless of where the user is scrolled to within the list.
  const [celebRect, setCelebRect] = React.useState(null);
  const cardsAreaRef = React.useRef(null);
  React.useEffect(() => {
    const isCompleteNow = total > 0 && doneCount === total;
    if (isCompleteNow && !prevComplete.current && ringRef.current) {
      const el = ringRef.current;
      el.classList.remove('is-pulsing', 'is-celebrating');
      void el.offsetWidth;
      setCompletionNonce((n) => n + 1);
      if (completionStyle === 'confetti' || completionStyle === 'sparkle') {
        const cardsEl = cardsAreaRef.current;
        const scroller = cardsEl?.closest('.main');
        if (cardsEl && scroller) {
          const cardsRect = cardsEl.getBoundingClientRect();
          const scrollerRect = scroller.getBoundingClientRect();
          setCelebRect({ left: cardsRect.left, top: scrollerRect.top, width: cardsRect.width, height: scrollerRect.height });
        } else {
          setCelebRect({ left: 0, top: 0, width: window.innerWidth, height: window.innerHeight });
        }
      }
      if (completionStyle === 'confetti') {
        setParticles(Array.from({ length: 26 }, (_, i) => ({
          id: i, angle: Math.round(Math.random() * 360), dist: 90 + Math.random() * 220,
          rot: Math.round(Math.random() * 360), opacity: (0.7 + Math.random() * 0.3).toFixed(2),
          delay: Math.round(Math.random() * 180),
        })));
      } else if (completionStyle === 'sparkle') {
        setParticles(Array.from({ length: 22 }, () => ({
          id: Math.random(), xPct: Math.round(Math.random() * 100), yPct: Math.round(Math.random() * 100),
          delay: Math.round(Math.random() * 700),
        })));
      } else {
        setParticles([]);
      }
      // Fire everything together: ring number pulse to accent + ripple from
      // the ring (always plays — this part of the celebration doesn't vary
      // by style) + the per-card exhale cascade, which IS the "Ripple" style
      // and so only plays when that style is selected. The title's per-word
      // reveal runs in parallel via the completionNonce re-mount above.
      el.classList.add('is-celebrating');
      const cards = (completionStyle === 'ripple' && mainRef.current)
        ? mainRef.current.querySelectorAll('.today-card')
        : [];
      cards.forEach((card, i) => {
        card.style.setProperty('--exhale-delay', `${i * 70}ms`);
        card.classList.add('is-exhaling');
      });
      const totalCel = cards.length * 70 + 900;
      const t = setTimeout(() => {
        if (ringRef.current) ringRef.current.classList.remove('is-celebrating');
        cards.forEach((card) => {
          card.classList.remove('is-exhaling');
          card.style.removeProperty('--exhale-delay');
        });
        setParticles([]);
        setCelebRect(null);
      }, Math.max(1600, totalCel + 100));
      prevDone.current = doneCount;
      prevComplete.current = isCompleteNow;
      return () => clearTimeout(t);
    }
    if (doneCount > prevDone.current && !isCompleteNow && ringRef.current) {
      const el = ringRef.current;
      el.classList.remove('is-pulsing', 'is-completing');
      void el.offsetWidth;
      el.classList.add('is-pulsing');
      const t = setTimeout(() => el.classList.remove('is-pulsing'), 700);
      prevDone.current = doneCount;
      prevComplete.current = isCompleteNow;
      return () => clearTimeout(t);
    }
    prevDone.current = doneCount;
    prevComplete.current = isCompleteNow;
  }, [doneCount, total]);

  // Streak pulse: fires once when today's first done is checked, i.e. when
  // streakClaimed transitions false → true.
  const claimedNow = !!state.today.streakClaimed;
  React.useEffect(() => {
    if (claimedNow && !prevClaimed.current && streakRef.current) {
      const el = streakRef.current;
      el.classList.remove('is-bumped');
      void el.offsetWidth;
      el.classList.add('is-bumped');
      const t = setTimeout(() => el.classList.remove('is-bumped'), 900);
      prevClaimed.current = claimedNow;
      return () => clearTimeout(t);
    }
    prevClaimed.current = claimedNow;
  }, [claimedNow]);

  // Measure the sticky header AND the rail (when it stacks above content on
  // mobile) so the rail's sticky-top sits flush beneath the header and
  // jumpToGroup / scroll-spy correctly account for both.
  const headerRef = React.useRef(null);
  const railRef = React.useRef(null);
  React.useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const tab = header.closest('.tab--today');
    if (!tab) return;
    const apply = () => {
      const headerH = header.offsetHeight;
      const rail = railRef.current;
      // On mobile the rail flips to flex-direction: row and stacks below the
      // header as a horizontal pill bar. Detect that state via computed style
      // so this works whether triggered by the viewport breakpoint or the
      // mobile-preview tweak.
      const isRailHorizontal = rail && getComputedStyle(rail).flexDirection === 'row';
      const railH = isRailHorizontal ? rail.offsetHeight : 0;
      tab.style.setProperty('--today-h-h', `${headerH}px`);
      tab.style.setProperty('--rail-h-h', `${railH}px`);
      tab.style.setProperty('--sticky-top-h', `${headerH + railH}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(header);
    if (railRef.current) ro.observe(railRef.current);
    window.addEventListener('resize', apply);
    return () => { ro.disconnect(); window.removeEventListener('resize', apply); };
  }, []);

  const onCheck = (picker, entry) => {
    const wasDone = entry.done;
    actions.toggleDone(entry.eid);
    if (!wasDone) {
      setJustChecked(entry.eid);
      setTimeout(() => setJustChecked((prev) => prev === entry.eid ? null : prev), 700);
    }
  };

  // Skip removes the entry — first mark it as removing so the card can play a
  // collapse animation, then drop it from state. The slide-out CSS uses the
  // same duration as the timer; if you change one, change the other.
  const SKIP_ANIM_MS = 380;
  const [removingIds, setRemovingIds] = React.useState(() => new Set());
  const handleSkip = (eid) => {
    if (removingIds.has(eid)) return;
    setRemovingIds((prev) => { const n = new Set(prev); n.add(eid); return n; });
    setTimeout(() => {
      actions.skipEntry(eid);
      setRemovingIds((prev) => { const n = new Set(prev); n.delete(eid); return n; });
    }, SKIP_ANIM_MS);
  };
  // Deleting a picker item from its Today editor: play the same card slide-out
  // as skip, then remove the item (which drops the entry).
  const handleDeleteItem = (eid, itemId) => {
    setActiveEditor((cur) => cur === `item:${eid}` ? null : cur);
    if (reduceMotion()) { actions.removeItem(itemId); return; }
    if (removingIds.has(eid)) return;
    setRemovingIds((prev) => { const n = new Set(prev); n.add(eid); return n; });
    setTimeout(() => {
      actions.removeItem(itemId);
      setRemovingIds((prev) => { const n = new Set(prev); n.delete(eid); return n; });
    }, SKIP_ANIM_MS);
  };

  // Re-roll plays a card-flip animation. The card body does a full 360°
  // rotation on its X axis (single direction) so it reads as a tumble; the
  // state update lands exactly at 180° — the apex of the flip — so the new
  // item name comes in upside-down for a moment, then rolls right-side up.
  // Reduced motion keeps a SHORT deliberate beat rather than swapping instantly:
  // with no flip to watch, an immediate swap can read as "nothing happened",
  // especially when the two item names are similar in length. 200ms is still
  // clearly a response and stays under the ~300ms mark where a delay starts to
  // feel like lag. (The full 760ms is the flip's own duration — the swap lands at
  // its 380ms apex — so inheriting it here would just be the ghost of an
  // animation that no longer plays.)
  const ROLL_ANIM_MS = (reduceMotion && reduceMotion()) ? 200 : 760;
  const [rollingIds, setRollingIds] = React.useState(() => new Set());
  const handleReroll = (entry, picker) => {
    if (rollingIds.has(entry.eid)) return;
    setRollingIds((prev) => { const n = new Set(prev); n.add(entry.eid); return n; });
    // Pick happens at the midpoint of the flip (when the card is fully
    // upside-down) — same direction continues, so the new content rolls in.
    setTimeout(() => {
      if (picker.mode === 'ease-up') {
        // Ease-up re-roll = manual cycle through eligible (charged ≥ threshold)
        // items, highest→lowest value, wrapping back to the highest. Deterministic
        // order: value desc, then oldest lastPicked, then id (stable because
        // done-gating freezes values between rolls). Fewer than 2 eligible → the
        // UI disables the button, so this is a safe no-op.
        const thr = picker.threshold ?? 100;
        const ts = (it) => (it.lastPicked ? Date.parse(it.lastPicked) : 0);
        const elig = state.items
          .filter((it) => it.pickerId === picker.id && !it.vacation && PICKERS.easeEligible(it, thr))
          .sort((a, b) => (b.value - a.value) || (ts(a) - ts(b)) || (a.id < b.id ? -1 : 1));
        if (elig.length >= 2) {
          const i = elig.findIndex((it) => it.id === entry.itemId);
          const next = elig[(i + 1) % elig.length];
          const res = PICKERS.pick(picker, state.items, { forceItemId: next.id });
          actions.setEntryItem(entry.eid, next.id, {
            updates: res.updates, pickerPatch: res.pickerPatch,
            depletedEnd: res.depletedEnd, pickedId: next.id, bumpPick: true });
        }
      } else {
        // forceNew so ease-down abandons the current active item (recharges it)
        // and rolls to a different one; other modes ignore the flag.
        const res = PICKERS.pick(picker, state.items, { forceNew: true });
        if (res.picked) {
          // Stage the mutation as pending — it applies only when the entry is
          // marked done (re-roll lands not-done, so nothing changes yet).
          actions.setEntryItem(entry.eid, res.picked.id, {
            updates: res.updates, pickerPatch: res.pickerPatch,
            depletedEnd: res.depletedEnd, pickedId: res.picked.id, bumpPick: true });
        }
      }
    }, ROLL_ANIM_MS / 2);
    setTimeout(() => {
      setRollingIds((prev) => { const n = new Set(prev); n.delete(entry.eid); return n; });
    }, ROLL_ANIM_MS);
  };

  // Scroll-aware edge fades on the mobile group rail: toggle
  // .at-start / .at-end so the mask gradient only fades the side that
  // has more content. Matches the .picker-tabs behaviour.
  React.useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const update = () => {
      const atStart = el.scrollLeft <= 1;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
      el.classList.toggle('at-start', atStart);
      el.classList.toggle('at-end', atEnd);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      ro.disconnect();
    };
  }, [groups.length]);

  // Scroll spy: track which group is currently most in view.
  const [activeGroup, setActiveGroup] = React.useState('__reminders');
  const sectionRefs = React.useRef({});
  const mainRef = React.useRef(null);
  const skipSpy = React.useRef(false);
  // A clicked group that can't scroll its header up to the spy line (it's in the
  // bottom cluster) gets pinned active until the user scrolls back up past it —
  // otherwise the spy would snap the highlight to the last group that CAN reach
  // the line. Mirrors the Settings rail fix.
  const pinnedGroup = React.useRef(null);

  React.useEffect(() => {
    const sections = Object.entries(sectionRefs.current).filter(([, el]) => el)
      // Sort by actual document position so first/last (used for the top default
      // and the bottomed-out case) always match the on-screen order, even after
      // groups/Reminders have been reordered in Edit Mode.
      .sort((a, b) => a[1].offsetTop - b[1].offsetTop);
    if (!sections.length) return;
    const onScroll = () => {
      if (skipSpy.current) return;
      const tab = mainRef.current?.closest('.tab--today');
      const stickyH = tab ? (parseInt(getComputedStyle(tab).getPropertyValue('--sticky-top-h')) || 140) : 140;
      const bias = stickyH + 20;
      const sc = mainRef.current?.closest('.main');
      const atBottom = sc
        ? sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 2
        : window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      // Honour a pinned bottom-cluster group: keep it active while bottomed out
      // or while its header is still above the viewport midline (i.e. still in
      // view). Release once the user scrolls up past it.
      if (pinnedGroup.current) {
        const pel = sectionRefs.current[pinnedGroup.current];
        const viewTop = sc ? sc.getBoundingClientRect().top : 0;
        const viewH = sc ? sc.clientHeight : window.innerHeight;
        const midline = viewTop + viewH / 2;
        if (pel && (atBottom || pel.getBoundingClientRect().top <= midline)) return;
        pinnedGroup.current = null;
      }
      // Bottomed out with no pin (e.g. plain scroll to the end): the last group
      // is what's in view even though its header can't reach the line.
      if (atBottom) { setActiveGroup(sections[sections.length - 1][0]); return; }
      let best = sections[0][0];
      let bestDist = Infinity;
      for (const [name, el] of sections) {
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top - bias);
        if (r.top - bias <= 16 && d < bestDist) {
          bestDist = d;
          best = name;
        }
      }
      setActiveGroup(best);
    };
    onScroll();
    const container = mainRef.current?.closest('.main') || window;
    container.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onScroll);
    };
  }, [groups.length, blockOrder]);

  const jumpToGroup = (name) => {
    const el = sectionRefs.current[name];
    if (!el) return;
    setActiveGroup(name);
    skipSpy.current = true;
    const main = el.closest('.main');
    const tab = el.closest('.tab--today');
    const stickyH = parseInt(getComputedStyle(tab).getPropertyValue('--sticky-top-h')) || 140;
    const extra = 16;
    if (main) {
      const target = el.offsetTop - stickyH - extra;
      // If the target scroll exceeds the max, this group can't reach the spy
      // line — pin it so it stays highlighted instead of the spy reclaiming it.
      const maxScroll = main.scrollHeight - main.clientHeight;
      pinnedGroup.current = target > maxScroll - 2 ? name : null;
      main.scrollTo({ top: target, behavior: reduceMotion() ? 'auto' : 'smooth' });
    } else {
      pinnedGroup.current = null;
      const top = el.getBoundingClientRect().top + window.scrollY - stickyH - extra;
      window.scrollTo({ top, behavior: reduceMotion() ? 'auto' : 'smooth' });
    }
    setTimeout(() => { skipSpy.current = false; }, 600);
  };

  // Regenerate: rolls every daily picker behind a sequential reel-cycle
  // loader. Picks are computed up front so the loader shows the actual
  // candidate pool + final pick for each, then commits to state at the end.
  // Guarantees at least 1 second of loader time.
  const [generating, setGenerating] = React.useState(false);
  const [confirmGen, setConfirmGen] = React.useState(false);
  // Reorder / "Edit Mode": toggles the list into a drag-to-reorder state.
  const [editMode, setEditMode] = React.useState(false);
  // Keeps the banner mounted through its collapse-out animation after Edit Mode
  // ends, so Cancel/Done reverse the intro instead of vanishing instantly.
  const [bannerClosing, setBannerClosing] = React.useState(false);
  const groupsDndRef = React.useRef(null);
  // The block order the content column was last rendered from. Drop indices are
  // DOM positions, so they must resolve against this, not the unpadded order.
  const renderedOrderRef = React.useRef([]);
  // Snapshot of the order taken on entering Edit Mode so "Cancel" / Escape can
  // discard every drag made during the session.
  const orderSnapshot = React.useRef(null);
  // Pending group-rename that would MERGE into an existing group — held until
  // the user confirms (renaming to an existing name folds the two together).
  const [mergePrompt, setMergePrompt] = React.useState(null);

  // Group rename entry point from a group header. Normalizes the typed name and,
  // if it resolves to a DIFFERENT existing group, defers to a merge confirm;
  // otherwise renames straight away.
  const requestRenameGroup = (oldName, rawNew) => {
    const others = [...new Set(state.pickers.filter((p) => p.group && p.group !== oldName).map((p) => p.group))];
    const target = normalizeGroupName(rawNew, others);
    if (!target || target === oldName) return;
    if (others.includes(target)) setMergePrompt({ from: oldName, to: target });
    else actions.renameGroup(oldName, target);
  };

  const enterEditMode = () => {
    orderSnapshot.current = {
      groupOrder: (state.groupOrder || []).slice(),
      pickerOrder: JSON.parse(JSON.stringify(state.pickerOrder || {})),
    };
    setActiveEditor(null);
    setConfirmGen(false);
    setEditMode(true);
  };
  const exitEditMode = (commit) => {
    if (bannerClosing) return;
    if (!commit && orderSnapshot.current) {
      actions.setTodayOrder(orderSnapshot.current.groupOrder, orderSnapshot.current.pickerOrder);
    }
    orderSnapshot.current = null;
    setEditMode(false);
    setBannerClosing(true);   // play the collapse-out before unmounting the banner
    if (reduceMotion()) setBannerClosing(false);
    else setTimeout(() => setBannerClosing(false), 240);
  };
  const toggleEditMode = () => { editMode ? exitEditMode(true) : enterEditMode(); };
  // Escape cancels an active Edit Mode session (discards changes).
  React.useEffect(() => {
    if (!editMode) return;
    const onKey = (e) => { if (e.key === 'Escape') exitEditMode(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editMode]);

  const startGroupDrag = (e) => {
    const wrapper = groupsDndRef.current;
    const gripEl = e.currentTarget;
    const sectionEl = gripEl.closest('.group-section');
    if (!wrapper || !sectionEl || !REORDER) return;
    REORDER.startDrag(e, {
      container: wrapper,
      itemSelector: '.group-section',
      handleEl: sectionEl,
      gripEl,
      scroller: mainRef.current?.closest('.main'),
      // Hides the mini-tour coach for the gesture's duration (see Today
      // page tour's own Movable Icon step) — its own tooltip card can sit
      // right over the group being dragged, making it hard to see where to
      // drop. A no-op harmless bus write when no tour is active/mounted.
      onStart: () => emlTour.set({ dragging: true }),
      onEnd: () => emlTour.set({ dragging: false }),
      onDrop: (order) => {
        const rendered = renderedOrderRef.current || [];
        const present = order.map((i) => rendered[i]).filter(Boolean);
        actions.reorderGroups(mergeOrder(state.groupOrder || [], present));
      },
    });
  };
  const startItemDrag = (e, g) => {
    const gripEl = e.currentTarget;
    const listEl = gripEl.closest('.today-list');
    const cardEl = gripEl.closest('.today-card');
    if (!listEl || !cardEl || !REORDER) return;
    REORDER.startDrag(e, {
      container: listEl,
      itemSelector: '.today-card',
      handleEl: cardEl,
      gripEl,
      scroller: mainRef.current?.closest('.main'),
      // Same reasoning as startGroupDrag's own onStart/onEnd above.
      onStart: () => emlTour.set({ dragging: true }),
      onEnd: () => emlTour.set({ dragging: false }),
      onDrop: (order) => {
        const present = order.map((i) => g.entries[i].picker.id);
        actions.reorderPickersInGroup(g.name, mergeOrder((state.pickerOrder || {})[g.name] || [], present));
      },
    });
  };
  const [generatingMap, setGeneratingMap] = React.useState(null);
  // Entries a regenerate is about to drop entirely (their picker produced no new
  // pick — e.g. its last eligible item just went on vacation). They get no loader
  // card, so without this they sat untouched through the whole generation and
  // then blinked out. Marked here so they play the normal removal animation.
  const [leavingEids, setLeavingEids] = React.useState(() => new Set());
  // Completed one-time reminders a Generate is about to purge — same idea,
  // played out on the reminder card before replaceTodayEntries removes it.
  const [leavingTaskIds, setLeavingTaskIds] = React.useState(() => new Set());
  // Reminders a Generate just made newly visible (their day arrived but the
  // generator hadn't run yet) — played as an entrance instead of popping in.
  const [arrivingTaskIds, setArrivingTaskIds] = React.useState(() => new Set());
  const generatingRef = React.useRef(false);
  const generatingMapRef = React.useRef(null);
  // Total animation duration is fixed; per-step pace flexes with how many
  // tasks are in the list. 8 tasks → 400ms each; fewer tasks → slower &
  // savorable, more → quicker so the whole cascade still wraps at TOTAL_MS.
  const TOTAL_MS = 3200;

  // `opts.auto` — true only when the scheduled boundary-check effect below
  // invokes this (never for the manual "Regenerate" button or the onboarding
  // tour's simulated click). Threaded straight into replaceTodayEntries so
  // only an auto-run resets today's streak claim — see its comment for why.
  const generate = async (opts = {}) => {
    const isAuto = !!opts.auto;
    if (generatingRef.current) return;
    generatingRef.current = true;

    // Scroll the list back to the top before the reel-cycle animation starts —
    // the "Generated on…" button sits at the bottom of the list, so users
    // would otherwise miss the cascade entirely. Wait briefly for the smooth
    // scroll to settle before kicking off the loaders.
    const scroller = mainRef.current?.closest('.main');
    const alreadyAtTop = scroller
      ? scroller.scrollTop <= 1
      : window.scrollY <= 1;
    if (!alreadyAtTop) {
      skipSpy.current = true;
      if (scroller) scroller.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' });
      else window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' });
      await new Promise((r) => setTimeout(r, 450));
      skipSpy.current = false;
    }

    // Compute picks upfront so we have stable candidate pools + final ids.
    // A picker only runs today if its schedule allows it: the current weekday
    // must be in daysOfWeek, and if skipHolidays is on, today must not be an
    // active holiday.
    const now = new Date();
    const dow = now.getDay();
    const holidayToday = HOLIDAYS.holidayOn(state.holidays, now);
    // Phase A: resolve every conditional's `triggered` for today up front.
    const conds = actions.resolveConditionalsForDay() || state.conditionals || [];
    const condById = new Map(conds.map((c) => [c.id, c]));
    // Existing live pick/charging entries keyed by picker — the source of truth
    // for cadence carry/suppress decisions (they persist across days until a
    // regenerate). Day-off cards (no pickerId) are excluded.
    const existingByPicker = new Map();
    for (const e of state.today.entries) {
      if (e.pickerId && e.kind !== 'dayoff') existingByPicker.set(e.pickerId, e);
    }
    const dayOffCards = [];   // one card per triggered conditional, first hit wins
    const cardShown = new Set();
    const emptyEaseUpCards = [];  // one per ease-up picker with nothing eligible
    const newPicks = [];
    // Ordered animation slots (encounter order) so day-off / charging cards
    // settle DURING the cascade alongside picks, instead of popping in at the
    // final commit. Each slot is keyed by the picker whose list position it
    // occupies during the loader.
    const orderedSlots = [];
    const carriedEntries = [];    // cadence picks persisting from a prior day
    const CAD = CADENCE;
    for (const pid of state.daily.pickerIds) {
      const picker = state.pickers.find((p) => p.id === pid);
      if (!picker || picker.hidden) continue;
      if (Array.isArray(picker.daysOfWeek) && !picker.daysOfWeek.includes(dow)) continue;
      if (picker.skipHolidays && holidayToday) continue;
      // Phase B: Picker Cadence gate (early-out). Non-daily pickers surface at
      // most once per period. If this period is already satisfied (its surfaced
      // card completed, or a done pick logged), emit NOTHING. If a not-done card
      // from the current period exists, CARRY it verbatim (locked, persists).
      const cadence = picker.cadence || 'daily';
      if (cadence !== 'daily') {
        const periodK = CAD.periodKey(picker, now);
        const existing = existingByPicker.get(pid);
        if (existing && existing.periodKey === periodK) {
          if (existing.done) continue;                 // period satisfied → nothing
          carriedEntries.push({ _carry: true, entry: existing });
          continue;                                     // persist the locked card
        }
        // No current-period card yet; a completed pick logged this period also
        // satisfies it (robust to wiped entries).
        if (CAD.completedThisPeriod(picker, state.pickLog, now)) continue;
        // Otherwise fall through to a FRESH surface, tagged with this period.
      }
      // Phase C: conditional gate. When the picker's conditional is triggered it
      // is suppressed; the FIRST suppressed picker for that conditional surfaces a
      // single day-off card instead.
      const cond = picker.conditionalId ? condById.get(picker.conditionalId) : null;
      if (CONDITIONALS.suppresses(cond)) {
        if (!cardShown.has(cond.id)) {
          cardShown.add(cond.id);
          const cardText = cond.cardText || cond.name;
          dayOffCards.push({ kind: 'dayoff', conditionalId: cond.id, cardText, group: picker.group || 'Other',
            pickerName: picker.name, condName: cond.name,
            ...(cadence !== 'daily' ? { periodKey: CAD.periodKey(picker, now) } : {}) });
          orderedSlots.push({ pickerId: pid, info: { kind: 'dayoff', candidates: [], cardText, conditionalId: cond.id } });
        }
        continue;
      }
      const periodKey = cadence !== 'daily' ? CAD.periodKey(picker, now) : null;
      const res = PICKERS.pick(picker, state.items);
      if (res.picked) {
        newPicks.push({
          pickerId: pid, res,
          candidates: res.cycleCandidates || [],
          pickedId: res.picked.id,
          depletedEnd: !!res.depletedEnd,
          periodKey,
        });
        orderedSlots.push({ pickerId: pid, info: { kind: 'pick', candidates: res.cycleCandidates || [], pickedId: res.picked.id } });
      } else if (picker.mode === 'ease-up' && res.updates && res.updates.length) {
        // Ease-up with nothing charged to threshold: surface a "charging" card so
        // the day's drift (res.updates) is applied only when the user checks it —
        // consistent with done-gating. Without this the drift would be dropped and
        // the picker could never climb to eligibility.
        emptyEaseUpCards.push({ kind: 'charging', pickerId: pid, group: picker.group || 'Other',
          pending: { updates: res.updates }, ...(periodKey ? { periodKey } : {}) });
        orderedSlots.push({ pickerId: pid, info: { kind: 'charging', candidates: [] } });
      }
    }

    // All start as pending; the loop below flips each to active → settled.
    const initialMap = {};
    for (const s of orderedSlots) {
      initialMap[s.pickerId] = { status: 'pending', ...s.info };
    }
    generatingMapRef.current = initialMap;
    setGeneratingMap(initialMap);
    setOpenLogKey(null);
    setGenerating(true);

    // Reduced motion: the picks are already computed above, so the pending →
    // active → settled cascade is pure theatre. Skip it and commit immediately
    // rather than making the user wait 3.2s for a list that already exists.
    if (reduceMotion && reduceMotion()) {
      const settledMap = {};
      for (const s of orderedSlots) settledMap[s.pickerId] = { status: 'settled', ...s.info };
      setGeneratingMap(settledMap);
    } else {
      const perStep = orderedSlots.length > 0 ? TOTAL_MS / orderedSlots.length : 0;
      for (const s of orderedSlots) {
        setGeneratingMap((prev) => prev ? ({ ...prev, [s.pickerId]: { ...prev[s.pickerId], status: 'active' } }) : prev);
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, perStep));
        setGeneratingMap((prev) => prev ? ({ ...prev, [s.pickerId]: { ...prev[s.pickerId], status: 'settled' } }) : prev);
      }
    }

    // Commit picks all at once, then hide the loader. Value mutations are staged
    // as `pending` on each entry and applied only when the entry is marked done.
    const nextEntries = [
      ...carriedEntries,
      ...dayOffCards,
      ...emptyEaseUpCards,
      ...newPicks.map((p) => ({
        pickerId: p.pickerId, itemId: p.pickedId,
        ...(p.periodKey ? { periodKey: p.periodKey } : {}),
        pending: { updates: p.res.updates, pickerPatch: p.res.pickerPatch,
          depletedEnd: p.res.depletedEnd, pickedId: p.pickedId, bumpPick: true } })),
    ];

    // Anything on screen that is neither carried nor covered by a loader card is
    // about to vanish. Play the removal animation first so it leaves the way a
    // skipped or deleted card does. Two card types need care:
    //   • carried cadence entries are pushed as { _carry, entry } wrappers and
    //     keep their eid across the commit — they are NOT departing;
    //   • day-off cards have no pickerId (their loader slot is registered under
    //     the suppressed picker's id), so they are matched by conditionalId:
    //     departing only when the conditional no longer produces a card.
    const keptEids = new Set(carriedEntries.map((e) => (e._carry ? e.entry.eid : e.eid)));
    const nextDayoff = new Set(dayOffCards.map((c) => c.conditionalId));
    const departing = (state.today.entries || [])
      .filter((e) => {
        if (keptEids.has(e.eid)) return false;
        if (e.kind === 'dayoff') return !nextDayoff.has(e.conditionalId);
        return !(e.pickerId && generatingMapRef.current && generatingMapRef.current[e.pickerId]);
      })
      .map((e) => e.eid);
    // Completed one-time reminders are purged by replaceTodayEntries below;
    // play their exit animation first instead of letting them vanish instantly.
    // Uses the PRE-generate anchor (this generate() call hasn't bumped
    // generatedAt yet), matching what's actually on screen right now.
    const oldDueReminders = TASKS.visibleToday(state.tasks, state.reminderOpts, state.holidays, remindersAnchor);
    const departingTaskIds = oldDueReminders.filter((t) => TASKS.isCompletedOnce(t)).map((t) => t.id);
    // Reminders whose day arrived while the generator was overdue (this fix's
    // whole point) — they weren't shown a moment ago under the old anchor, and
    // are about to become visible under this generate()'s new one. Diff the
    // two id sets so they get the entrance animation instead of popping in.
    const oldDueIds = new Set(oldDueReminders.map((t) => t.id));
    const newDueReminders = TASKS.visibleToday(state.tasks, state.reminderOpts, state.holidays, new Date());
    const arrivingIds = newDueReminders.filter((t) => !oldDueIds.has(t.id)).map((t) => t.id);

    if ((departing.length || departingTaskIds.length) && !(reduceMotion && reduceMotion())) {
      if (departing.length) setLeavingEids(new Set(departing));
      if (departingTaskIds.length) setLeavingTaskIds(new Set(departingTaskIds));
      await new Promise((r) => setTimeout(r, 260));
    }

    actions.replaceTodayEntries(nextEntries, { resetStreak: isAuto });
    actions.markGenerated();
    setLeavingEids(new Set());
    setLeavingTaskIds(new Set());
    if (arrivingIds.length && !(reduceMotion && reduceMotion())) {
      setArrivingTaskIds(new Set(arrivingIds));
      setTimeout(() => setArrivingTaskIds(new Set()), 400);
    }

    setGenerating(false);
    setGeneratingMap(null);
    generatingMapRef.current = null;
    generatingRef.current = false;
    setConfirmGen(false);
  };

  // Expose the generator to the onboarding tour so its "Generate now" step can
  // run it directly, skipping the footer's replace-confirmation dialog.
  const generateRef = React.useRef(generate);
  generateRef.current = generate;
  React.useEffect(() => { window.__emlGenerate = () => generateRef.current && generateRef.current(); }, []);

  // ── Daily auto-generator ──────────────────────────────────────────────
  // When the Daily generator is in 'auto' mode, build the day on its own at or
  // after the configured run time (default 4:00 AM). It's a catch-up check, not
  // a fire-at-exactly-4:00 alarm: opening the app any time after the run time on
  // a period that hasn't been generated yet triggers it. Uses the same reel
  // animation as manual Regenerate. If the current period's list already exists
  // it does nothing (the list simply shows, no animation). Checked on mount and
  // once a minute, so an app left open across the run-time boundary still fires.
  // The generatingRef guard (set synchronously at the top of generate) plus the
  // boundary check prevent any double run.
  //
  // The period boundary is the RUN TIME, not midnight. That distinction matters:
  // comparing calendar days meant a generation between midnight and the run time
  // (the onboarding tour at 1am, say) marked the whole day as done and silently
  // cancelled that day's auto-run. The app's day starts at the run time, so a
  // 1am list belongs to the previous period and 4am should still refresh it.
  React.useEffect(() => {
    const daily = state.daily || {};
    if ((daily.mode || 'auto') !== 'auto') return;
    const check = () => {
      if (generatingRef.current) return;
      if (!state.pickers || !state.pickers.length) return; // nothing runs daily
      const now = new Date();
      // Most recent occurrence of the run time: today's if we've passed it,
      // otherwise yesterday's.
      const [rh, rm] = (daily.runTime || '04:00').split(':').map(Number);
      const boundary = new Date(now);
      boundary.setHours(rh, rm, 0, 0);
      if (boundary > now) boundary.setDate(boundary.getDate() - 1);
      // Already generated within the current period?
      const genAt = state.today && state.today.generatedAt ? new Date(state.today.generatedAt) : null;
      if (genAt && genAt >= boundary) return;
      if (generateRef.current) {
        generateRef.current({ auto: true });
        // Post-hoc notice only: the list is already built, so clicking the
        // notification just focuses the app — it can never generate twice. Also
        // suppressed when the app is visible and focused. Async; the result is
        // deliberately ignored, a failed notification must never break the run.
        try { if (NOTIFY) Promise.resolve(NOTIFY.generated()).catch(() => {}); } catch (e) {}
      }
    };
    check();
    const iv = setInterval(check, 60000);
    return () => clearInterval(iv);
  }, [state.daily, state.today && state.today.generatedAt, state.pickers.length]);

  // ── Empty-state CTAs for new users (no pickers / nothing runnable today) ──
  const newSlotsByGroup = React.useMemo(() => {
    if (!generating || !generatingMap) return {};
    const entries = state.today.entries || [];
    const havePicker = new Set(entries.map((e) => e.pickerId).filter(Boolean));
    // Day-off cards carry a conditionalId instead of a pickerId, so a day-off
    // slot is "already on screen" when its conditional has a card.
    const haveDayoff = new Set(entries.filter((e) => e.kind === 'dayoff').map((e) => e.conditionalId));
    const out = {};
    for (const pid of Object.keys(generatingMap)) {
      if (havePicker.has(pid)) continue;
      const slot = generatingMap[pid];
      if (slot && slot.kind === 'dayoff' && haveDayoff.has(slot.conditionalId)) continue;
      const pk = (state.pickers || []).find((p) => p.id === pid);
      if (!pk) continue;
      const gname = pk.group || 'Other';
      (out[gname] = out[gname] || []).push(pk);
    }
    return out;
  }, [generating, generatingMap, state.today.entries, state.pickers]);

  // Block order for the content column. While generating it also includes groups
  // that have no entries yet but do have an incoming slot — otherwise the section
  // doesn't exist to hold the placeholder and the card still pops in at commit.
  const genBlockOrder = React.useMemo(() => {
    const extra = Object.keys(newSlotsByGroup).filter((n) => !blockOrder.includes(n));
    return extra.length ? [...blockOrder, ...extra] : blockOrder;
  }, [blockOrder, newSlotsByGroup]);
  renderedOrderRef.current = genBlockOrder;

  const obBus = useEmlTour ? useEmlTour() : {};
  // Whether the user is still mid-onboarding at all — replaces the old
  // onboarding.dismissed flag (which only ever got set by the now-removed
  // "Get started" checklist, so it was permanently stuck false). Derived
  // instead of stored: see onboarding-checklist.js for what counts as done.
  const obChecklistComplete = OB_CHECKLIST.status(state).complete;
  // Used to also force-show while the tour's own step 0 was up (that step
  // anchored on this card) — see the "STASHED: create-a-picker tour content"
  // block atop onboarding.jsx. The future "Create your first picker"
  // mini-tour will need an equivalent force-render once it exists, keyed off
  // its own step numbering.
  const obShowCreate = !obChecklistComplete && state.pickers.length === 0;
  // Empty state (edge case): user has no pickers and the tour isn't running.
  // Distinct from the onboarding create card — plainer copy so it doesn't read
  // as a bug, no coach highlight. Tapping it jumps to Pickers with the create
  // form open + name prefilled "Chores" (see startCreate on the bus).
  const obShowEmpty = !obShowCreate && obBus.phase !== 'tour' && state.pickers.length === 0;
  // Second empty state: the user HAS pickers, but none of them can put anything
  // here today — either none are in the Daily generator at all, or the ones that
  // are aren't scheduled for this weekday (or sit out today's holiday). Same two
  // gates the generator applies, evaluated for the CURRENT day. Only surfaces
  // when the picker list is genuinely empty; reminders may still be present.
  const obNoRunToday = React.useMemo(() => {
    if (state.pickers.length === 0) return false;
    const now = new Date();
    const dow = now.getDay();
    const holiday = HOLIDAYS.holidayOn(state.holidays, now);
    return !state.pickers.some((p) => (
      !p.hidden &&
      state.daily.pickerIds.includes(p.id) &&
      (!Array.isArray(p.daysOfWeek) || p.daysOfWeek.includes(dow)) &&
      !(p.skipHolidays && holiday)
    ));
  }, [state.pickers, state.daily.pickerIds, state.holidays]);
  // Suppressed while the mini-tour checklist is still up (any launcher card,
  // checked or not, until checklistDone) — the page isn't actually empty
  // then, it's full of tutorial cards instead of real picks. Reappears
  // normally once the checklist concludes and there's still genuinely
  // nothing to run.
  const hasTutorialCards = showChecklist;
  const obShowNoRun = !obShowCreate && obBus.phase !== 'tour'
    && obNoRunToday && entries.length === 0 && !hasTutorialCards;
  const startCreatePicker = () => {
    emlTour.set({ startCreate: { name: 'Chores', step: 1, focusName: true } });
    if (onNavTab) onNavTab('picker');
  };

  // Which reminder mini-tour's intro modal (or walkthrough) is currently
  // showing — null when none is. Reminder tours never leave Today, so this
  // stays local here; picker tours AND page tours can navigate to another
  // tab (a picker tour's Step 1 highlights the Pickers nav button; a page
  // tour now can too, e.g. the Pickers page tour's own Step 2+), which would
  // unmount this component along with them, so both live at the app level
  // instead — see app.jsx's activePickerTour/activePageTour and this
  // component's own onStartPickerTour/onStartPageTour props. Seeded from a
  // persisted activeTour on first mount (a reload) so the tour resumes
  // instead of silently vanishing — mirrors app.jsx's own seeding.
  // activeTour.id only encodes the variant ('reminder-once'/
  // 'reminder-recurring'), not the task id, so map it back via the same
  // taskId pairing ReminderTour's own variant prop uses below.
  const [activeMiniTour, setActiveMiniTour] = React.useState(() => {
    const at = state.onboarding && state.onboarding.activeTour;
    if (!at || typeof at.id !== 'string' || !at.id.startsWith('reminder-')) return null;
    const variant = at.id.slice('reminder-'.length);
    return { kind: 'reminder', id: variant === 'once' ? 'tk_ob_meds' : 'tk_ob_trash' };
  });
  // Mini-tour launcher cards' Play button / row click. `kind` is 'picker',
  // 'reminder', or 'pageTour'; `id` is the sample picker/task/page-tour id.
  const startMiniTour = (kind, id) => {
    if (kind === 'picker') onStartPickerTour(id);
    else if (kind === 'pageTour') onStartPageTour(id);
    else setActiveMiniTour({ kind, id });
  };
  // Unchecks an already-resolved launcher card (skipped/cancelled/finished)
  // back to pending, so its mini-tour can be redone. Never touches the
  // sample itself — see onboarding-checklist.js.
  const uncheckTutorial = (kind, id) => actions.setChecklistItem(id, null);

  // The closing "Generate a real list" card — see onboarding-checklist.js.
  // Actionable once every other checklist item is resolved AND at least one
  // picker was actually finished (readyToGenerate), so there's always
  // something real for the generator to draw from.
  const obReadyToGenerate = OB_CHECKLIST.readyToGenerate(state);
  const generateItemResolved = !!OB_CHECKLIST.entryFor(state, OB_GENERATE_ITEM_ID);
  const onGenerateCardClick = () => {
    if (!obReadyToGenerate) return;
    actions.setChecklistItem(OB_GENERATE_ITEM_ID, { status: 'finished' });
  };
  // Resolving the Generate item pushes doneCount up to equal total (every
  // other item was already resolved), which triggers the existing
  // completion-celebration effect above automatically — nothing extra
  // needed to fire it. This effect only owns what happens AFTER: let the
  // celebration play, animate every checklist card out together, then
  // conclude the checklist and hand off to a completely normal generate().
  const [checklistExiting, setChecklistExiting] = React.useState(false);
  const prevGenerateResolved = React.useRef(generateItemResolved);
  React.useEffect(() => {
    if (generateItemResolved && !prevGenerateResolved.current) {
      const reduced = reduceMotion && reduceMotion();
      const celebrateMs = reduced ? 200 : 1700;
      const exitMs = reduced ? 0 : 380;
      const t1 = setTimeout(() => setChecklistExiting(true), celebrateMs);
      const t2 = setTimeout(() => {
        // Any real reminder OR picker created while the checklist was up —
        // whether by finishing a mini-tour or just the user clicking "+"/
        // "Add new picker" themselves (see reminders.jsx's startAdd and
        // tab-picker.jsx's onCreate, both gated on the showChecklist bus
        // field) — was seeded hidden so it didn't clutter the list alongside
        // the still-open launcher cards. Surface them all now, right before
        // generate() actually runs. Excludes the eternal samples themselves
        // by id, which stay hidden forever.
        state.tasks.forEach((t) => {
          if (t.hidden && !OB_SAMPLE_TASK_IDS.includes(t.id)) actions.updateTask(t.id, { hidden: false });
        });
        state.pickers.forEach((p) => {
          if (p.hidden && !OB_SAMPLE_PICKER_IDS.includes(p.id)) actions.updatePicker(p.id, { hidden: false });
        });
        actions.setChecklistDone(true);
        setChecklistExiting(false);
        // Deferred, and via the ref rather than calling generate() directly
        // — the three actions.* calls just above are async state updates
        // that haven't re-rendered yet at this point in the callback, so a
        // bare generate() here would run against THIS closure's stale
        // snapshot, where every picker/task the loop above just unhid still
        // reads hidden:true. generate()'s own picker loop skips anything
        // hidden, so the real (freshly un-hidden) pickers would silently
        // produce nothing — only reminders would show, since those render
        // live off state.tasks rather than being baked into entries by a
        // one-time generate() run. generateRef always points at the LATEST
        // generate closure (see its own comment above); scheduling this on
        // a new macrotask gives React a chance to flush the batched updates
        // from the three actions.* calls into a fresh render first, so by
        // the time this fires, generateRef.current() sees the real state.
        setTimeout(() => generateRef.current(), 0);
      }, celebrateMs + exitMs);
      prevGenerateResolved.current = generateItemResolved;
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    prevGenerateResolved.current = generateItemResolved;
  }, [generateItemResolved]);

  return (
    <div className={`tab tab--today ${editMode ? 'is-editmode' : ''}`}>
      <HelpOverlay active={helpOn} items={helpItems} />
      <header className="today-h" ref={headerRef}>
        <div className="today-h-inner">
          <div className="today-h-l">
            <div className="kicker-row">
              <div className="kicker">{fmtDate(now)} <span className="kicker-time">{fmtTime(now)}</span></div>
              <div className="kicker-row-r">
                <div className="streak" ref={streakRef}>
                  <Icon name="flame" size={12} />
                  <span>{state.streak}-day streak</span>
                </div>
                <HelpButton active={helpOn} onClick={() => setHelpOn((o) => !o)} />
              </div>
            </div>
            <div className="today-h-lead">
              <button type="button" onClick={onHome} className="brand-mark" aria-label="Ease My Life — go to Today">
                {/* Logo colors are wired to the UI theme:
                    – border + easing-checkmark use currentColor, which the
                      .brand-mark sets to var(--accent).
                    – Grid lines use var(--accent-soft) — the same colour as
                      the Today group-rail / tabbar selected backgrounds. */}
                <svg viewBox="8 8 528 528" fill="none" aria-hidden="true">
                  <defs>
                    <clipPath id="brandMarkClip" clipPathUnits="userSpaceOnUse">
                      <rect width="512" height="512" y="16" x="16" rx="75" ry="75" />
                    </clipPath>
                  </defs>
                  <g style={{stroke:'var(--accent-soft)', strokeWidth:16}}>
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
                    style={{strokeWidth:16, strokeLinecap:'round', strokeLinejoin:'round', stroke:'currentColor'}} />
                  <path
                    d="M 24.467 527.792 C 67.266 416.298 77.088 228.913 172.207 434.412 C 200.739 535.77 262.562 434.412 314.873 292.51 C 381.45 120.201 450.381 44.636 528.854 24.365 C 521.725 22.337 512.215 24.365 493.193 34.5 C 369.548 105.451 295.85 292.51 234.029 363.461 C 186.473 414.14 167.451 241.831 124.651 262.102 C 101.828 270.008 60.133 375.754 24.467 527.792 Z"
                    strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"
                    clipPath="url(#brandMarkClip)"
                    style={{fill:'currentColor', stroke:'currentColor'}}
                  />
                </svg>
              </button>
              <h1 className="today-title">
                <span className={`title-state title-state--default ${isComplete ? 'is-out' : 'is-in'}`} aria-hidden={isComplete}>
                  Your day,<br/><span style={{ color: 'var(--accent)' }}>eased</span> just for you.
                </span>
                <span className={`title-state title-state--done ${isComplete ? 'is-in' : 'is-out'}`} aria-hidden={!isComplete} key={isComplete ? completionNonce : 'idle'}>
                  <span className="title-word title-word--1">Your</span>{' '}
                  <span className="title-word title-word--2">life,</span><br/>
                  <span className="title-word title-word--3">eased!</span>
                </span>
              </h1>
              <div className="ring" ref={ringRef}>
                <svg viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.5" className="ring-bg" />
                  <circle cx="18" cy="18" r="15.5" className="ring-fg"
                          strokeDasharray={`${(doneCount / Math.max(1,total)) * 97.4}, 97.4`} />
                </svg>
                <div className="ring-text">
                  <span className="ring-num">{doneCount}</span>
                  <span className="ring-den">/ {total}</span>
                </div>
                <i className="ring-glow" aria-hidden="true" />
                <i className="ring-ripple" aria-hidden="true" />
                <i className="celebration-ripple" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="today-body">
        {(editMode || bannerClosing) && (
          <div className={`editmode-banner ${bannerClosing ? 'is-closing' : ''}`} role="status">
            <span className="editmode-banner-msg">
              <Icon name="grip" size={15} />
              Edit Mode — drag groups and items to rearrange or click group names to edit them
            </span>
            <span className="editmode-banner-actions">
              <Btn kind="ghost" size="sm" onClick={() => exitEditMode(false)}>Cancel</Btn>
              <Btn kind="primary" size="sm" icon="check" onClick={() => exitEditMode(true)}>Done</Btn>
            </span>
          </div>
        )}
        <div className="today-layout" ref={mainRef}>
          <aside className="group-rail" aria-label="Groups" ref={railRef}>
            <div className="kicker rail-kicker">Groups</div>
            <ul>
              {blockOrder.map((id) => {
                if (id === '__reminders') {
                  return (
                    <li key="__reminders">
                      <button className={`rail-btn rail-btn--rem ${activeGroup === '__reminders' ? 'is-on' : ''}`}
                              onClick={() => jumpToGroup('__reminders')}>
                        <span className="rail-name">Reminders</span>
                        <span className="rail-count">
                          <span>{remindersDoneVisible + tutorialTaskDone}</span><span className="rail-of">/{dueReminders.length + tutorialTaskCount}</span>
                        </span>
                      </button>
                    </li>
                  );
                }
                if (id === '__pageTours') {
                  if (!showChecklist) return null;
                  const pDone = OB_PAGE_TOURS.filter((t) => !!OB_CHECKLIST.entryFor(state, t.id)).length;
                  return (
                    <li key="__pageTours">
                      <button className={`rail-btn ${activeGroup === '__pageTours' ? 'is-on' : ''}`}
                              onClick={() => jumpToGroup('__pageTours')}>
                        <span className="rail-name">{pageToursName}</span>
                        <span className="rail-count">
                          <span>{pDone}</span><span className="rail-of">/{OB_PAGE_TOURS.length}</span>
                        </span>
                      </button>
                    </li>
                  );
                }
                const g = groupByName[id];
                if (!g) return null;
                // Mini-tour launcher cards count toward this the whole time
                // they're on screen — resolved (any of the 3 ways) counts as
                // done, same as any other card.
                const gDone = g.entries.filter((e) => e.entry.done).length;
                return (
                  <li key={g.name}>
                    <button className={`rail-btn ${activeGroup === g.name ? 'is-on' : ''}`}
                            onClick={() => jumpToGroup(g.name)}>
                      <span className="rail-name">{g.name}</span>
                      <span className="rail-count">
                        <span>{gDone}</span><span className="rail-of">/{g.entries.length}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="rail-editmode">
              <button type="button"
                      className={`em-rail-btn ${editMode ? 'is-on' : ''}`}
                      disabled={generating}
                      onClick={toggleEditMode}>
                <Icon name="grip" size={15} />
                {editMode ? 'Done' : 'Edit Mode'}
              </button>
            </div>
          </aside>

          <div className="today-groups" ref={cardsAreaRef}
               style={obBus.reserveTop ? { paddingTop: obBus.reserveTop } : undefined}>
            {celebRect && particles.length > 0 && (completionStyle === 'confetti' || completionStyle === 'sparkle') && createPortal(
              // Portaled straight to <body> — the tab-switch fade wrapper
              // (.tab-fade) keeps a resolved (identity) transform for the
              // life of its enter animation, which makes it a containing
              // block for any `position: fixed` descendant. Left in place,
              // this overlay would be fixed to that scrolled ancestor
              // instead of the viewport, so it'd scroll out of view.
              <div className={`celeb-overlay celeb-overlay--${completionStyle}`} aria-hidden="true"
                   style={{ left: celebRect.left, top: celebRect.top, width: celebRect.width, height: celebRect.height }}>
                {completionStyle === 'confetti' && particles.map((p) => (
                  <i key={p.id} className="confetti-piece"
                     style={{ '--angle': `${p.angle}deg`, '--dist': `${p.dist}px`, '--rot': `${p.rot}deg`,
                              '--piece-opacity': p.opacity, animationDelay: `${p.delay}ms` }} />
                ))}
                {completionStyle === 'sparkle' && particles.map((p) => (
                  <span key={p.id} className="sparkle-piece"
                        style={{ left: `${p.xPct}%`, top: `${p.yPct}%`, animationDelay: `${p.delay}ms` }}>&#10022;</span>
                ))}
              </div>,
              document.body
            )}
            <div className="groups-dnd" ref={groupsDndRef}>
            {genBlockOrder.map((id) => {
              if (id === '__reminders') {
                return (
                  <ReminderSection key="__reminders" state={state} actions={actions}
                                   editMode={editMode} onGripDown={startGroupDrag}
                                   logOpen={openLogKey === '__reminders'}
                                   onToggleLog={() => toggleLog('__reminders')}
                                   leavingTaskIds={leavingTaskIds} arrivingTaskIds={arrivingTaskIds}
                                   activeEditor={activeEditor} setActiveEditor={setActiveEditor}
                                   onPlayTutorial={startMiniTour}
                                   onUncheckTutorial={uncheckTutorial}
                                   checklistExiting={checklistExiting}
                                   sectionRef={(el) => { sectionRefs.current['__reminders'] = el; }} />
                );
              }
              if (id === '__pageTours') {
                if (!showChecklist) return null;
                const pDone = OB_PAGE_TOURS.filter((t) => !!OB_CHECKLIST.entryFor(state, t.id)).length;
                return (
                  <section key="__pageTours" className="group-section pt-section"
                           ref={(el) => { sectionRefs.current['__pageTours'] = el; }}>
                    <GroupHeader name={pageToursName} doneCount={pDone} total={OB_PAGE_TOURS.length}
                                 editMode={editMode} onGripDown={startGroupDrag}
                                 onRenameGroup={(newName) => actions.renamePageTours(newName)}
                                 validate={pageToursNameCollision} />
                    <div className="today-list">
                      {OB_PAGE_TOURS.map((t) => (
                        <PageTourCard key={t.id} tour={t} state={state} actions={actions}
                                      onPlayTutorial={startMiniTour} onUncheckTutorial={uncheckTutorial}
                                      checklistExiting={checklistExiting} />
                      ))}
                    </div>
                  </section>
                );
              }
              // A group with no entries yet, mounted only to host an incoming
              // loader card during generation.
              const g = groupByName[id] || (newSlotsByGroup[id] ? { name: id, entries: [] } : null);
              if (!g) return null;
              // Mini-tour launcher cards count toward this the whole time
              // they're on screen — resolved (any of the 3 ways) counts as
              // done, same as any other card.
              const gDone = g.entries.filter((e) => e.entry.done).length;
              return (
                <section key={g.name}
                         className="group-section"
                         ref={(el) => { sectionRefs.current[g.name] = el; }}>
                  <GroupHeader name={g.name} doneCount={gDone} total={g.entries.length}
                               editMode={editMode} onGripDown={startGroupDrag}
                               logOpen={openLogKey === g.name}
                               onToggleLog={() => toggleLog(g.name)}
                               onRenameGroup={(newName) => requestRenameGroup(g.name, newName)}
                               mergePending={mergePrompt && mergePrompt.from === g.name ? mergePrompt : null}
                               onConfirmMerge={() => { actions.renameGroup(mergePrompt.from, mergePrompt.to); setMergePrompt(null); }}
                               onCancelMerge={() => setMergePrompt(null)} />
                  <Collapse open={openLogKey === g.name && !editMode}>
                    <GroupLog state={state} group={g.name} onClose={() => toggleLog(g.name)} />
                  </Collapse>
                  <div className="today-list">
                    {g.entries.map(({ entry, picker }) => {
                      if (generating && generatingMap?.[picker.id]) {
                        return <LoaderCard key={entry.eid} picker={picker}
                                           info={generatingMap[picker.id]} />;
                      }
                      const item = state.items.find((it) => it.id === entry.itemId);
                      return (
                        <React.Fragment key={entry.eid}>
                          <EntryCard entry={entry} picker={picker}
                                     state={state} actions={actions}
                                     justChecked={justChecked} onCheck={onCheck}
                                     onSkip={handleSkip} onReroll={handleReroll}
                                     isRemoving={removingIds.has(entry.eid) || leavingEids.has(entry.eid)}
                                     isRolling={rollingIds.has(entry.eid)}
                                     isEditing={activeEditor === `item:${entry.eid}`}
                                     editMode={editMode}
                                     onGripDown={(ev) => startItemDrag(ev, g)}
                                     onEdit={() => setActiveEditor((cur) => cur === `item:${entry.eid}` ? null : `item:${entry.eid}`)}
                                     onRename={(name) => actions.renameItem(entry.itemId, name)}
                                     onPlayTutorial={startMiniTour}
                                     onUncheckTutorial={uncheckTutorial}
                                     checklistExiting={checklistExiting} />
                          <Collapse open={activeEditor === `item:${entry.eid}` && !!item}>
                            {item && (
                              <div className="today-entry-editor">
                                <EntryEditor item={item} picker={picker} actions={actions}
                                             onClose={() => setActiveEditor((cur) => cur === `item:${entry.eid}` ? null : cur)}
                                             onDelete={() => handleDeleteItem(entry.eid, item.id)} />
                              </div>
                            )}
                          </Collapse>
                        </React.Fragment>
                      );
                    })}
                    {generating && newSlotsByGroup[g.name] && newSlotsByGroup[g.name].map((pk) => (
                      <LoaderCard key={`newslot-${pk.id}`} picker={pk} info={generatingMap[pk.id]} />
                    ))}
                  </div>
                </section>
              );
            })}
            </div>

            {showChecklist && (
              <div className={`ob-create ob-create--generate ${checklistExiting ? 'is-removing' : ''} ${!obReadyToGenerate ? 'is-needed' : ''}`}>
                <div className="ob-create-i"><Icon name="check" size={22} /></div>
                <b>Generate your real list</b>
                <p>Once every tutorial above is checked off, this replaces all of them with your own real, generated list.</p>
                {obReadyToGenerate ? (
                  <Btn kind="primary" size="sm" icon="check" onClick={onGenerateCardClick}>Generate your list</Btn>
                ) : (
                  <InfoTip className="btn btn--primary btn--sm is-disabled" action="Generate your list"
                           label='Complete at least one "Create a picker" tutorial above first.'>
                    Generate your list
                  </InfoTip>
                )}
              </div>
            )}

            {obShowEmpty && (
              <div className="ob-create ob-create--empty">
                <div className="ob-create-i"><Icon name="plus" size={22} /></div>
                <b>You do not have any pickers yet</b>
                <p>At least one picker is required for any items to show up here. You will need to create one with at least two items for it to choose from.</p>
                <Btn kind="primary" size="sm" icon="plus" onClick={startCreatePicker}>Create a picker</Btn>
              </div>
            )}

            {obShowNoRun && (
              <div className="ob-create ob-create--empty ob-create--norun">
                <div className="ob-create-i"><Icon name="calendar" size={22} /></div>
                <b>There are no items to display</b>
                <p>You either have no pickers that are set to run with the auto-generator, or you do have pickers set to run with the auto-generator but they are not set to run on this day.</p>
                <p>You can either change your pickers&rsquo; settings in the <button type="button" className="sub-tablink" onClick={() => onNavTab && onNavTab('data')}>Data tab</button> to change this behavior or you can run them manually via the <button type="button" className="sub-tablink" onClick={() => onNavTab && onNavTab('picker')}>Pickers tab</button> and then push them here to the Today tab.</p>
              </div>
            )}

            <div className="today-footer">
              {confirmGen && !generating ? (
                <div className="gen-confirm">
                  <p className="gen-confirm-msg">This will replace any items marked as completed and these will not show up in the Stats tab. Continue?</p>
                  <div className="gen-confirm-actions">
                    <Btn kind="ghost" size="sm" onClick={() => setConfirmGen(false)}>Cancel</Btn>
                    <Btn kind="primary" size="sm" icon="refresh" onClick={() => generate()}>Continue</Btn>
                  </div>
                </div>
              ) : editMode ? (
                <div className="today-foot-actions">
                  <Btn kind="ghost" onClick={() => exitEditMode(false)}>Cancel</Btn>
                  <Btn kind="primary" icon="check" onClick={() => exitEditMode(true)}>Done</Btn>
                </div>
              ) : (
                <>
                  <div className="today-foot-actions">
                    <Btn kind="secondary" icon="grip" className="foot-editmode" onClick={toggleEditMode} disabled={generating}>
                      Edit Mode
                    </Btn>
                    <Btn kind="secondary" icon="refresh" className="ob-generate" onClick={() => setConfirmGen(true)} disabled={generating}>
                      {generating ? 'Generating\u2026' : 'Regenerate'}
                    </Btn>
                  </div>
                  <div className="today-foot-sub">
                    List generated on {fmtDateLong(state.today.generatedAt)} at {fmtTime(state.today.generatedAt)}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {activeMiniTour && activeMiniTour.kind === 'reminder' && (
        <ReminderTour
          variant={activeMiniTour.id === 'tk_ob_meds' ? 'once' : 'recurring'}
          state={state}
          actions={actions}
          closeReminderForm={() => setActiveEditor((cur) => cur === 'reminder-add' ? null : cur)}
          onClose={() => setActiveMiniTour(null)}
        />
      )}
    </div>
  );
}

export { TabToday };
export { EntryEditor };
