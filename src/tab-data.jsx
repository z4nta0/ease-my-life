import React from 'react';
import { CAD_OPTS } from './cadence-control.jsx';
import { CADENCE } from './cadence.js';
import { PICKERS, normalizeConditionalName, normalizeGroupName } from './pickers.js';
import { useEmlTour } from './onboarding.jsx';
import { OB_CHECKLIST } from './onboarding-checklist.js';
import { ReminderManager } from './reminders.jsx';
import { MODES } from './seed.js';
import { ConditionalControls, conditionalDraftDefault } from './tab-conditional.jsx';
import { EntryEditor } from './tab-today.jsx';
import { Btn, Collapse, compareSortEntries, FillButton, freezeEditedRow, Icon, InfoTip, SortSelect, WeekdayChips, reduceMotion, useEscapeCancel } from './ui.jsx';
import { HelpButton, HelpOverlay } from './help-mode.jsx';
import { DATA_HELP_ITEMS } from './help-content.jsx';
import { seedHelpPickers, clearHelpPickers, seedHelpTasks, clearHelpTasks } from './help-sample-data.js';

// Data tab — items grouped by their owning picker, plus weights, vacation,
// picker deletion, and per-picker Daily-generator scheduling (weekday +
// skip-holiday gates). The global "days off" holiday list lives in Settings.

// Section-list sort options (Conditionals / Reminders / each picker card).
const SECTION_SORT_OPTIONS = [
  { key: 'name-asc', label: 'Name (A–Z)' },
  { key: 'name-desc', label: 'Name (Z–A)' },
  { key: 'type-asc', label: 'Type (A–Z)' },
  { key: 'type-desc', label: 'Type (Z–A)' },
  { key: 'group-asc', label: 'Group (A–Z)' },
  { key: 'group-desc', label: 'Group (Z–A)' },
  { key: 'count-asc', label: 'Item Count (Low to High)' },
  { key: 'count-desc', label: 'Item Count (High to Low)' },
  { key: 'active-asc', label: 'Active to Inactive' },
  { key: 'active-desc', label: 'Inactive to Active' },
];

// Item-list sort options — extrapolated from SECTION_SORT_OPTIONS' own
// vocabulary, adapted to what an individual item actually has. Group and
// (sub-)Item Count have no meaning for a single item, so neither is offered
// at this level, unlike the section list above. Odds (weighted/dynamic),
// Boost (dynamic only), and Range (the ease band's soonest/shortest end —
// see conditionalRange) are each meaningful for only some conditional modes,
// mixed into the same list as ones they don't apply to; on those other rows
// they're irrelevant (not just missing), so they always sort to the bottom
// regardless of direction (see compareSortEntries' numericAlwaysLast) rather
// than flipping to the top on a "High to Low" sort the way a genuinely
// missing value would. Their labels also stay generic here rather than
// switching wording per mode the way a single-mode picker's own item list
// can (see pickerItemSortOptions, e.g. Range's Soonest/Shortest). Odds (not
// "Weight", despite the picker-item-sort analog being called that) because
// a conditional's `weight` field is vestigial — its actual weighted/dynamic
// trigger-likelihood knob is `oddsPct`, which its own editor calls Odds (see
// conditionalOdds and conditionals.js' trueOdds).
const CONDITIONAL_ITEM_SORT_OPTIONS = [
  { key: 'name-asc', label: 'Name (A–Z)' },
  { key: 'name-desc', label: 'Name (Z–A)' },
  { key: 'type-asc', label: 'Type (A–Z)' },
  { key: 'type-desc', label: 'Type (Z–A)' },
  { key: 'odds-asc', label: 'Odds (Low to High)' },
  { key: 'odds-desc', label: 'Odds (High to Low)' },
  { key: 'boost-asc', label: 'Boost (Low to High)' },
  { key: 'boost-desc', label: 'Boost (High to Low)' },
  { key: 'range-asc', label: 'Range (Low to High)' },
  { key: 'range-desc', label: 'Range (High to Low)' },
  { key: 'active-asc', label: 'Active to Inactive' },
  { key: 'active-desc', label: 'Inactive to Active' },
];
// A picker's own items have no per-item Type (every item in one picker's
// pool is the same kind) — instead, ease/weighted/dynamic modes get a
// mode-specific numeric field (reusing the generic `count` comparator field)
// in its place: charge for ease-up/down, weight for weighted/dynamic. Ease
// modes also get Range — the item's own soonest-to-latest day band collapsed
// to its near end, labeled "Soonest" for ease-up and "Shortest" for ease-down
// to match the wording already used for that same value elsewhere (e.g. the
// item editor's own Soonest/Shortest stepper). Truly random has none of
// these, only Name/Active.
function pickerItemSortOptions(mode) {
  const opts = [
    { key: 'name-asc', label: 'Name (A–Z)' },
    { key: 'name-desc', label: 'Name (Z–A)' },
  ];
  if (mode === 'ease-up' || mode === 'ease-down') {
    const rangeLbl = mode === 'ease-down' ? 'Shortest' : 'Soonest';
    opts.push({ key: 'count-asc', label: 'Charge (Low to High)' }, { key: 'count-desc', label: 'Charge (High to Low)' });
    opts.push({ key: 'range-asc', label: `${rangeLbl} (Low to High)` }, { key: 'range-desc', label: `${rangeLbl} (High to Low)` });
  } else if (mode === 'weighted' || mode === 'dynamic') {
    opts.push({ key: 'count-asc', label: 'Weight (Low to High)' }, { key: 'count-desc', label: 'Weight (High to Low)' });
  }
  opts.push({ key: 'active-asc', label: 'Active to Inactive' }, { key: 'active-desc', label: 'Inactive to Active' });
  return opts;
}

// Shown in the (?) tip beside an ease-up picker's Soonest / Latest controls —
// warns that with many items the per-item range is a tendency, not a guarantee.

// A picker's Controls body (how it picks · when it runs · delete). Rendered only
// while the Controls disclosure is open, so it snapshots the picker's full state
// on mount — letting Cancel revert every change (type, ease band, weekdays,
// holiday skip, daily-generator membership, and any item values touched by a
// Refill) the way the item editor's Cancel does. Done keeps the changes.
function PickerControls({ picker, items, inDaily, dailyIds, allGroups, conditionals = [], actions, onCollapse, onRequestDelete }) {
  const pk = picker;
  const isEase = pk.mode === 'ease-up' || pk.mode === 'ease-down';
  const isDown = pk.mode === 'ease-down';
  const notFull = items.filter((it) => (it.value ?? 0) < (pk.threshold ?? 100)).length;
  const fillSub = notFull === 0
    ? <><strong>all items</strong> are fully charged</>
    : <><strong>{notFull} {notFull === 1 ? 'item' : 'items'}</strong> {notFull === 1 ? 'is' : 'are'} not at full charge</>;
  const [confirmDel, setConfirmDel] = React.useState(false);
  // Attach-a-conditional (ported from the Pickers create-flow). Toggle reflects
  // whether a conditional is currently attached; selecting a pill sets it, and
  // turning the toggle off detaches. No "+ create new" here — that lives in the
  // Conditionals section.
  const [condOn, setCondOn] = React.useState(!!pk.conditionalId);
  // Callback ref: fires when the rail node attaches (inside the <Collapse>,
  // which mounts it after the parent effect would run). Wires scroll/resize +
  // a ResizeObserver so the edge-fade classes track real layout width.
  const condRailCleanup = React.useRef(null);
  const condRailNode = React.useRef(null);
  const condRailRef = React.useCallback((el) => {
    if (condRailCleanup.current) { condRailCleanup.current(); condRailCleanup.current = null; }
    condRailNode.current = el;
    if (!el) return;
    const update = () => {
      const scrollable = el.scrollWidth - el.clientWidth > 1;
      el.classList.toggle('at-start', !scrollable || el.scrollLeft <= 1);
      el.classList.toggle('at-end', !scrollable || el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
    };
    update();
    requestAnimationFrame(update);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    condRailCleanup.current = () => {
      ro.disconnect();
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  const attachedCond = conditionals.find((c) => c.id === pk.conditionalId) || null;
  // FLIP reorder animation: when the attached conditional changes, the pinned
  // pill jumps to the front. Capture each pill's old x, let React reorder, then
  // invert+play so they glide into place; the newly-pinned pill fades in.
  const condFlipFirst = React.useRef(new Map());
  React.useLayoutEffect(() => {
    const el = condRailNode.current;
    if (!el) return;
    const first = condFlipFirst.current;
    const pills = [...el.querySelectorAll('.cnd-pill')];
    const reduce = reduceMotion();
    pills.forEach((p) => {
      const id = p.dataset.cid;
      const prevX = first.get(id);
      const newX = p.offsetLeft;
      if (reduce) return;   // honor reduced motion: no FLIP tween
      if (prevX == null) { // just mounted / newly pinned: fade + rise in
        p.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }],
          { duration: 260, easing: 'cubic-bezier(.2,.7,.3,1)' });
      } else {
        const dx = prevX - newX;
        if (Math.abs(dx) > 1) {
          p.animate([{ transform: `translateX(${dx}px)` }, { transform: 'none' }],
            { duration: 320, easing: 'cubic-bezier(.2,.7,.3,1)' });
        }
      }
    });
    // Record current positions for the next reorder.
    first.clear();
    pills.forEach((p) => first.set(p.dataset.cid, p.offsetLeft));
    // A pin-to-front reorder means the top pill is now at the start — glide the
    // rail back to the left so it's visible.
    if (el.scrollLeft > 1) el.scrollTo({ left: 0, behavior: reduceMotion() ? 'auto' : 'smooth' });
  }, [pk.conditionalId, condOn, conditionals.length]);
  // "+ New group" inline-create state for the Group selector.
  const [newGroupMode, setNewGroupMode] = React.useState(false);
  const [pillReturning, setPillReturning] = React.useState(false);
  const [newGroupName, setNewGroupName] = React.useState('');
  const newGroupRef = React.useRef(null);
  const groupPillsRef = React.useRef(null);
  // FLIP glide for the group pills: selecting a group moves its pill to the front
  // (groupChoices sorts selected-first) — animate the shuffle instead of snapping.
  // Guarded so we never capture positions while the panel is collapsed/hidden
  // (offsetParent null), which would animate from stale coordinates.
  const groupFlipFirst = React.useRef(null);
  React.useLayoutEffect(() => {
    const el = groupPillsRef.current;
    if (!el || el.offsetParent === null) return;   // hidden: don't measure
    const pills = [...el.querySelectorAll('.picker-group-pill')];
    const prev = groupFlipFirst.current;
    if (prev && !reduceMotion()) {
      pills.forEach((p) => {
        const oldX = prev.get(p.dataset.g);
        if (oldX == null) return;
        const dx = oldX - p.offsetLeft;
        if (Math.abs(dx) > 1) {
          p.animate([{ transform: `translateX(${dx}px)` }, { transform: 'none' }],
            { duration: 320, easing: 'cubic-bezier(.2,.7,.3,1)' });
        }
      });
    }
    const next = new Map();
    pills.forEach((p) => next.set(p.dataset.g, p.offsetLeft));
    groupFlipFirst.current = next;
  }, [pk.group]);
  // Scroll-edge fade on the group pills (only visible when they scroll on small
  // screens) — toggles .at-start/.at-end like the filter-bar pill rails.
  React.useEffect(() => {
    const el = groupPillsRef.current;
    if (!el) return;
    const update = () => {
      const scrollable = el.scrollWidth - el.clientWidth > 1;
      const atStart = !scrollable || el.scrollLeft <= 1;
      const atEnd = !scrollable || el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
      el.classList.toggle('at-start', atStart);
      el.classList.toggle('at-end', atEnd);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);
  React.useEffect(() => {
    if (newGroupMode && newGroupRef.current) {
      newGroupRef.current.focus();
      // Keep the growing input's right edge pinned to the row's right edge for
      // the duration of its unfurl animation: re-scroll to the end on every
      // frame so the existing pills slide left *in sync* with the growth (one
      // continuous motion) instead of a jump after the animation finishes.
      const el = groupPillsRef.current;
      if (el) {
        let raf;
        const start = performance.now();
        const pin = (now) => {
          el.scrollLeft = el.scrollWidth;
          if (now - start < 280) raf = requestAnimationFrame(pin);
        };
        raf = requestAnimationFrame(pin);
        return () => cancelAnimationFrame(raf);
      }
    }
  }, [newGroupMode]);
  // Existing groups plus the picker's own (in case it's the only member).
  const origGroupRef = React.useRef(pk.group);
  const groupChoices = React.useMemo(() => {
    const set = [...(allGroups || [])];
    if (pk.group && !set.includes(pk.group)) set.push(pk.group);
    // Keep the picker's original group listed even if this (its only member) has
    // been moved away mid-edit, so a stray click is recoverable until Save.
    if (origGroupRef.current && !set.includes(origGroupRef.current)) set.push(origGroupRef.current);
    return set.sort((a, b) => (b === pk.group ? 1 : 0) - (a === pk.group ? 1 : 0));
  }, [allGroups, pk.group]);
  // Close symmetrically to open: the input unmounts immediately and the
  // returning "+ New group" pill animates IN (same as opening, where the pill
  // vanishes at once and the input animates in). Both commit and cancel route
  // through here.
  const closeNewGroup = () => {
    setNewGroupMode(false);
    setNewGroupName('');
    setPillReturning(true);
    setTimeout(() => setPillReturning(false), 200);
  };
  const commitNewGroup = () => {
    const name = normalizeGroupName(newGroupName, groupChoices);
    if (name) actions.updatePicker(pk.id, { group: name });
    closeNewGroup();
  };
  const cancelNewGroup = () => { closeNewGroup(); };
  // Snapshot taken when Controls opened (this component mounts then).
  const snap = React.useRef({
    picker: { ...pk },
    items: items.map((i) => ({ ...i })),
    inDaily,
  });

  const revertState = () => {
    actions.replacePicker(pk.id, snap.current.picker);
    snap.current.items.forEach((it) => actions.replaceItem(it.id, it));
    const has = dailyIds.includes(pk.id);
    if (snap.current.inDaily && !has) actions.setDailyPickers([...dailyIds, pk.id]);
    else if (!snap.current.inDaily && has) actions.setDailyPickers(dailyIds.filter((x) => x !== pk.id));
  };
  // 'saved' | 'cancel' once the user closes explicitly; null = still open, so an
  // implicit close (tab-switch / reload) should discard the unsaved edits.
  const doneRef = React.useRef(null);
  const cancel = () => { doneRef.current = 'cancel'; revertState(); onCollapse(); };
  const saveClose = () => { doneRef.current = 'saved'; onCollapse(); };
  // Synchronously roll the snapshot back into localStorage on reload/close, so
  // unsaved edits don't survive a refresh (the store already persisted them live).
  const restoreToStorage = () => {
    try {
      const raw = localStorage.getItem('easemylife.v2');
      if (!raw) return;
      const s = JSON.parse(raw);
      if (Array.isArray(s.pickers)) s.pickers = s.pickers.map((p) => p.id === pk.id ? snap.current.picker : p);
      const im = new Map(snap.current.items.map((i) => [i.id, i]));
      if (Array.isArray(s.items)) s.items = s.items.map((it) => im.has(it.id) ? im.get(it.id) : it);
      if (s.daily) {
        const ids = s.daily.pickerIds || [];
        const has = ids.includes(pk.id);
        if (snap.current.inDaily && !has) s.daily.pickerIds = [...ids, pk.id];
        else if (!snap.current.inDaily && has) s.daily.pickerIds = ids.filter((x) => x !== pk.id);
      }
      localStorage.setItem('easemylife.v2', JSON.stringify(s));
    } catch (e) {}
  };
  React.useEffect(() => {
    window.__editGuard.disarm();   // cancel a pending revert from the editor we replaced
    const onHide = () => { if (!doneRef.current) restoreToStorage(); };
    window.addEventListener('pagehide', onHide);
    return () => {
      window.removeEventListener('pagehide', onHide);
      if (!doneRef.current) window.__editGuard.arm(revertState);   // implicit close → discard
    };
  }, []);

  return (
    <div className="rd-ctl-body">
      <div className="rd-ctl-group rd-ctl-group--basics">
        <div className="rd-ctl-subhead">Picker Details</div>
        <div className="rd-basics-row">
          <span className="rd-basics-lbl">Name</span>
          <input className="rd-basics-name" type="text" value={pk.name} maxLength={40}
                 placeholder="Picker name" aria-label="Picker name"
                 onChange={(e) => actions.updatePicker(pk.id, { name: e.target.value })}
                 onBlur={(e) => { const n = e.target.value.trim(); if (n) actions.renamePicker(pk.id, n); }}
                 onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} />
        </div>
        <div className="rd-basics-row rd-basics-row--group">
          <span className="rd-basics-lbl">Group</span>
          <div className="rd-group-pills" ref={groupPillsRef} role="radiogroup" aria-label="Picker group">
            {groupChoices.map((g) => (
              <button key={g} type="button" role="radio" aria-checked={pk.group === g} data-g={g}
                      className={`picker-group-pill ${pk.group === g ? 'is-on' : ''}`}
                      onClick={() => actions.updatePicker(pk.id, { group: g })}>
                {g}
              </button>
            ))}
            {newGroupMode ? (
              <span className="rd-group-new">
                <input ref={newGroupRef} type="text" className="rd-group-new-input"
                       value={newGroupName} placeholder="Group name" aria-label="Group name" maxLength={30}
                       onChange={(e) => setNewGroupName(e.target.value)}
                       onKeyDown={(e) => {
                         if (e.key === 'Enter') commitNewGroup();
                         else if (e.key === 'Escape') cancelNewGroup();
                       }} />
                <button type="button" className="rd-group-new-ok" onClick={commitNewGroup}
                        aria-label="Create group" disabled={!newGroupName.trim()}>
                  <Icon name="check" size={14} />
                </button>
                <button type="button" className="rd-group-new-cancel" onClick={cancelNewGroup}
                        aria-label="Cancel">
                  <Icon name="x" size={14} />
                </button>
              </span>
            ) : (
              <button type="button" className={`picker-group-pill picker-group-pill--new ${pillReturning ? 'is-returning' : ''}`}
                      onClick={() => setNewGroupMode(true)}>
                <Icon name="plus" size={13} /> New group
              </button>
            )}
          </div>
        </div>
      </div>
      <fieldset className="rd-ctl-group rd-ctl-group--picks">
        <legend className="rd-ctl-subhead">How it picks</legend>
        <div className="rd-mode-radio">
          {Object.entries(MODES).map(([key, m]) => {
            const on = pk.mode === key;
            return (
              <label key={key} className={`rd-mode-opt ${on ? 'is-on' : ''}`}>
                <input type="radio" name={`mode_${pk.id}`} checked={on}
                       onChange={() => actions.updatePicker(pk.id, { mode: key })} />
                <span className="rd-mode-dot" aria-hidden="true"></span>
                <span className="rd-mode-text">
                  <span className="rd-mode-name">{m.label}</span>
                  {/* Hint expands/collapses on selection change — the old row's
                      hint folds away while the new one grows, one synchronized
                      reflow (shares the app's Collapse height mechanism). */}
                  <Collapse open={on}>
                    {Array.isArray(m.hint)
                      ? m.hint.map((para, pi) => <span key={pi} className="rd-mode-hint">{para}</span>)
                      : <span className="rd-mode-hint">{m.hint}</span>}
                  </Collapse>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* When it runs — Daily-generator membership + weekday / holiday gates. */}
      <div className="rd-ctl-group rd-ctl-group--sched">
        <div className="rd-ctl-subhead">When it runs</div>
        <div className="sched-line">
          <span className="sched-line-label">
            <span className="sched-line-lbl">Attach a conditional</span>
            <span className="sched-line-sub">
              {attachedCond
                ? <>triggering rules provided by <strong>{attachedCond.name}</strong> will prevent this picker from running</>
                : <>picker <strong>will always run</strong>, attaching a conditional will provide a trigger to prevent it from running</>}
            </span>
          </span>
          <button className={`switch ${condOn ? 'is-on' : ''}`} role="switch" aria-checked={condOn}
                  aria-label="Attach a conditional"
                  onClick={() => setCondOn((v) => {
                    const nv = !v;
                    if (!nv && pk.conditionalId) actions.updatePicker(pk.id, { conditionalId: null });
                    return nv;
                  })}><i /></button>
        </div>
        <Collapse open={condOn}>
          <div className="rd-cnd-rail-row">
            {conditionals.length ? (
              <div className="cnd-rail picker-groups" ref={condRailRef}>
                {[...conditionals].sort((a, b) =>
                  (b.id === pk.conditionalId ? 1 : 0) - (a.id === pk.conditionalId ? 1 : 0)
                ).map((c) => (
                  <button key={c.id} type="button" data-cid={c.id}
                          className={`cnd-pill ${pk.conditionalId === c.id ? 'is-on' : ''}`}
                          onClick={() => actions.updatePicker(pk.id, { conditionalId: c.id })}>
                    <span className="cnd-pill-name">{c.name}</span>
                    <span className="cnd-pill-mode">{(MODES[c.mode] || {}).label || c.mode}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="rd-cnd-empty">No conditionals yet. Create one in the Conditionals section below, then attach it here.</p>
            )}
          </div>
        </Collapse>
        <div className="sched-line">
          <span className="sched-line-label">
            <span className="sched-line-lbl">In the Daily generator</span>
            <span className="sched-line-sub set-sub-fade" key={inDaily ? 'on' : 'off'}>
              {inDaily
                ? <>will run <strong>every time</strong> the Today tab's Daily generator is run</>
                : <>can only be <strong>run manually</strong> in the Pickers tab</>}
            </span>
          </span>
          <button className={`switch ${inDaily ? 'is-on' : ''}`} aria-pressed={inDaily}
                  aria-label={`${inDaily ? 'Remove from' : 'Add to'} the Daily generator`}
                  onClick={() => {
                    const ids = inDaily
                      ? dailyIds.filter((x) => x !== pk.id)
                      : [...dailyIds, pk.id];
                    actions.setDailyPickers(ids);
                  }}><i /></button>
        </div>
        <Collapse open={inDaily}>
          <React.Fragment>
            <div className="sched-line">
              <span className="sched-line-label">
                <span className="sched-line-lbl pie-lbl-row">How often?
                  <InfoTip className="pie-help pie-help--sm" label={CADENCE.tipFor(pk.cadence)}>?</InfoTip>
                </span>
                <span className="sched-line-sub set-sub-fade" key={(pk.cadence || 'daily') + (pk.anchorDow ?? '') + (pk.anchorDom ?? '') + (pk.anchorMonth ?? '') + (pk.anchorDay ?? '')}>{(() => {
                  const cad = pk.cadence || 'daily';
                  if (cad === 'daily') return (CAD_OPTS.find((o) => o.key === 'daily') || {}).sub;
                  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                  const ord = (n) => { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };
                  const tail = ' — pick will persist until marked as completed';
                  if (cad === 'weekly') return <>surfaces once a week, <strong>every {DAYS[pk.anchorDow ?? 0]}</strong>{tail}</>;
                  if (cad === 'monthly') return <>surfaces once a month, <strong>on the {ord(pk.anchorDom ?? 1)}</strong>{tail}</>;
                  return <>surfaces once a year, <strong>on {MONTHS[(pk.anchorMonth ?? 1) - 1]} {ord(pk.anchorDay ?? 1)}</strong>{tail}</>;
                })()}</span>
              </span>
              <div className="sched-cad-ctls">
                <select className="np-input rd-cad-sel" value={pk.cadence || 'daily'}
                        aria-label="Cadence"
                        onChange={(e) => actions.updatePicker(pk.id, { cadence: e.target.value })}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                {pk.cadence === 'weekly' && (
                  <select className="np-input rd-cad-sel" value={pk.anchorDow ?? 0} aria-label="Anchor weekday"
                          onChange={(e) => actions.updatePicker(pk.id, { anchorDow: parseInt(e.target.value) })}>
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d, i) => (
                      <option key={i} value={i}>{d}</option>
                    ))}
                  </select>
                )}
                {pk.cadence === 'monthly' && (
                  <select className="np-input rd-cad-sel" value={pk.anchorDom ?? 1} aria-label="Anchor day of month"
                          onChange={(e) => actions.updatePicker(pk.id, { anchorDom: parseInt(e.target.value) })}>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>{CADENCE.summary({ cadence: 'monthly', anchorDom: d }).split('· ')[1]}</option>
                    ))}
                  </select>
                )}
                {pk.cadence === 'yearly' && (
                  <React.Fragment>
                    <select className="np-input rd-cad-sel" value={pk.anchorMonth ?? 1} aria-label="Anchor month"
                            onChange={(e) => actions.updatePicker(pk.id, { anchorMonth: parseInt(e.target.value) })}>
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                        <option key={i} value={i + 1}>{m}</option>
                      ))}
                    </select>
                    <select className="np-input rd-cad-sel" value={Math.min(pk.anchorDay ?? 1, CADENCE.daysInMonth(2024, pk.anchorMonth ?? 1))} aria-label="Anchor day"
                            onChange={(e) => actions.updatePicker(pk.id, { anchorDay: parseInt(e.target.value) })}>
                      {Array.from({ length: CADENCE.daysInMonth(2024, pk.anchorMonth ?? 1) }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </React.Fragment>
                )}
              </div>
            </div>
            <div className="sched-line">
              <span className="sched-line-label">
                <span className="sched-line-lbl">Days</span>
                <span className="sched-line-sub set-sub-fade" key={(pk.daysOfWeek || []).join(',')}>
                  {(pk.daysOfWeek && pk.daysOfWeek.length)
                    ? <>runs in the Daily generator every <strong>{[...pk.daysOfWeek].sort((a, b) => a - b).map((d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}</strong></>
                    : 'pick at least one day'}
                </span>
              </span>
              <WeekdayChips value={pk.daysOfWeek || [0, 1, 2, 3, 4, 5, 6]} size="sm"
                            lockedDay={pk.cadence === 'weekly' ? (pk.anchorDow ?? 0) : null}
                            lockedTip={pk.cadence === 'weekly' ? CADENCE.lockedDayTip(pk.anchorDow ?? 0) : ''}
                            onChange={(d) => actions.updatePicker(pk.id, { daysOfWeek: d })} />
            </div>
            <div className="sched-line">
              <span className="sched-line-label">
                <span className="sched-line-lbl">Skip on holidays</span>
                <span className="sched-line-sub set-sub-fade" key={pk.skipHolidays ? 'on' : 'off'}>
                  {pk.skipHolidays
                    ? <><strong>will not run</strong> in the Daily generator on holidays</>
                    : <><strong>will run</strong> in the Daily generator on holidays</>}
                </span>
              </span>
              <button className={`switch ${pk.skipHolidays ? 'is-on' : ''}`} aria-pressed={!!pk.skipHolidays}
                      aria-label="Skip on holidays"
                      onClick={() => actions.updatePicker(pk.id, { skipHolidays: !pk.skipHolidays })}><i /></button>
            </div>
          </React.Fragment>
        </Collapse>
        <Collapse open={!inDaily}>
          <div className="sched-off-note">Runs on demand only &mdash; not in the Daily generator.</div>
        </Collapse>
      </div>

      {/* Item Controls — things that act on this picker's ITEMS rather than
          the picker's own type/schedule: avoiding duplicate names across
          today's whole list, and (ease modes only) manually filling every
          item's charge at once. Neither belongs under "How it picks" (that's
          about the ruleset itself) or "When it runs" (that's about the
          Daily generator/schedule) — this is its own thing, placed last
          since it's the one section that isn't really a "picker control". */}
      <div className="rd-ctl-group rd-ctl-group--items">
        <div className="rd-ctl-subhead">Item Controls</div>
        <div className="sched-line">
          <span className="sched-line-label">
            <span className="sched-line-lbl">Avoid duplicate items</span>
            <span className="sched-line-sub set-sub-fade" key={pk.avoidDuplicates ? 'on' : 'off'}>
              {pk.avoidDuplicates
                ? <><strong>won't pick</strong> an item whose name is already on today's todo list</>
                : <><strong>may pick</strong> an item even if its name is already on today's todo list</>}
            </span>
          </span>
          <button className={`switch ${pk.avoidDuplicates ? 'is-on' : ''}`} aria-pressed={!!pk.avoidDuplicates}
                  aria-label="Avoid duplicate items"
                  onClick={() => actions.updatePicker(pk.id, { avoidDuplicates: !pk.avoidDuplicates })}><i /></button>
        </div>
        {/* Fill/Refill expands/collapses when Ease-up/Ease-down is (de)selected,
            sharing the app's Collapse height animation. */}
        <Collapse open={isEase}>
          {/* ease-config--up/--down — pure selector hook so help-mode can
              give this section mode-specific copy (Fill vs. Refill), same
              idea as EntryEditor's own pie-ease-up-row/pie-ease-down-row
              split. */}
          <div className={`ease-config ${isDown ? 'ease-config--down' : 'ease-config--up'}`}>
            {pk.mode === 'ease-up' && (
              <div className="pie-row">
                <div className="pie-rowlabel">
                  <span className="pie-lbl">Fill</span>
                  <span className="pie-sub">{fillSub}</span>
                </div>
                <FillButton label="Fill all"
                     disabled={items.length > 0 && items.every((it) => (it.value ?? 0) >= (pk.threshold ?? 100))}
                     onClick={() => actions.refillPicker(pk.id)} />
              </div>
            )}
            {pk.mode === 'ease-down' && (
              <div className="pie-row">
                <div className="pie-rowlabel">
                  <span className="pie-lbl">Refill</span>
                  <span className="pie-sub">{fillSub}</span>
                </div>
                <FillButton label="Refill all"
                     disabled={items.length > 0 && items.every((it) => (it.value ?? 0) >= (pk.threshold ?? 100))}
                     onClick={() => actions.refillPicker(pk.id)} />
              </div>
            )}
          </div>
        </Collapse>
      </div>

      {/* Footer — Delete (left) · Cancel + Done (right), mirroring the item
          editor. Delete morphs the footer into a confirm that reuses the
          "also delete its N items" message. */}
      <div className="rd-ctl-group rd-ctl-group--foot pk-ctl-foot">
        {confirmDel ? (
          <div className="rd-pk-del-confirm" key="confirm">
            <div className="confirm-msg">Delete the &ldquo;{pk.name}&rdquo; picker? This will also delete its {items.length} {items.length === 1 ? 'item' : 'items'}. This can&rsquo;t be undone.</div>
            <div className="rem-del-actions">
              <Btn kind="ghost" size="sm" onClick={() => setConfirmDel(false)}>Cancel</Btn>
              <Btn kind="danger" size="sm" onClick={() => (onRequestDelete ? onRequestDelete() : actions.removePicker(pk.id))}>Delete</Btn>
            </div>
          </div>
        ) : (
          <div className="rd-ctl-foot-row" key="foot">
            <Btn kind="danger" size="sm" icon="trash" onClick={() => setConfirmDel(true)}>Delete</Btn>
            <div className="rem-foot-right">
              <Btn kind="ghost" size="sm" onClick={cancel}>Cancel</Btn>
              <Btn kind="ghost" size="sm" onClick={saveClose}>Save</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Conditionals manager (Data tab) ──────────────────────────────────────
// Lists every conditional as a collapsible card whose body is the shared
// ConditionalControls editor (same one used in the Pickers create-flow). Edits
// are live (updateConditional). Add creates a fresh one; delete detaches it from
// any pickers (store handles the cleanup).
// Editor body for one conditional. The draft is owned by ConditionalsManager
// (so the row can host the inline name input, like the picker item editor). Save
// commits via updateConditional, Cancel discards (removing a brand-new one).
function ConditionalEditor({ cond, draft, setDraft, actions, isNew, nameError, tidyName, onClose, onDiscard, onSaveNew, onDelete }) {
  const Controls = ConditionalControls;
  const [confirmDel, setConfirmDel] = React.useState(false);
  // Save normalizes the name (Title Case tidy) and is blocked on a collision —
  // same policy as the Pickers create-flow.
  const save = () => {
    if (nameError) return;
    if (onSaveNew) { onSaveNew(); return; }   // manager owns the animated collapse+add
    actions.updateConditional(cond.id, { ...draft, name: tidyName }); onClose();
  };
  const cancel = () => { if (isNew) onDiscard(); else onClose(); };
  // Escape = Cancel (discards a brand-new conditional), or backs out of the
  // delete confirm when that's showing.
  useEscapeCancel(true, () => { if (confirmDel) setConfirmDel(false); else cancel(); });
  return (
    <div className="rd-edit rd-edit--cnd">
      <div className="rd-ctl-body">
        {nameError && <p className="np-error rd-cnd-name-err">{nameError}</p>}
        <Controls draft={draft} onChange={setDraft} variant="inline" hideName />
        <div className="rd-ctl-group rd-ctl-group--foot">
          {confirmDel ? (
            <div className="rd-ctl-confirm" key="confirm">
              <div className="confirm-msg">Delete the &ldquo;{cond.name}&rdquo; conditional? Pickers using it will be detached. This can&rsquo;t be undone.</div>
              <div className="rem-del-actions">
                <Btn kind="ghost" size="sm" onClick={() => setConfirmDel(false)}>Cancel</Btn>
                <Btn kind="danger" size="sm" onClick={() => onDelete()}>Delete</Btn>
              </div>
            </div>
          ) : (
            <div className="rd-ctl-foot-row" key="foot">
              {!isNew && <Btn kind="danger" size="sm" icon="trash" onClick={() => setConfirmDel(true)}>Delete</Btn>}
              <div className="rem-foot-right">
                <Btn kind="ghost" size="sm" onClick={cancel}>Cancel</Btn>
                <Btn kind="ghost" size="sm" onClick={save} disabled={!!nameError}>Save</Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ConditionalsManager({ state, actions }) {
  const conditionals = state.conditionals || [];
  const pickers = state.pickers || [];
  const [openId, setOpenId] = React.useState(null);
  const [draft, setDraft] = React.useState(null);
  // A brand-new conditional is held LOCALLY (not written to the store) until
  // Save, so a reload or tab-switch mid-create discards it.
  const [pending, setPending] = React.useState(null);
  // Row currently playing its collapse-shut animation before removal (delete).
  const [closingId, setClosingId] = React.useState(null);
  const usingCount = (cid) => pickers.filter((p) => p.conditionalId === cid && !p.hidden).length;
  // Section collapse — same persisted mechanism + chevron as the picker cards.
  // Defaults COLLAPSED: absent = collapsed, explicit false = expanded.
  const collapsedMap = (state.ui && state.ui.controlsCollapsed) || {};
  const open = collapsedMap['__conditionals'] === false;
  // Item sort — each conditional has its own mode (Type) and active/on-
  // vacation state, same concepts as a picker card's own Type/Active fields
  // at the section level; Group and Item Count don't apply to a single
  // conditional, so those options aren't offered here. Weighted/dynamic
  // conditionals get an Odds value — `oddsPct`, the actual trigger-likelihood
  // knob those modes use (see conditionals.js' trueOdds); the conditional's
  // own `weight` field is never read anywhere and always sits at its default,
  // so it isn't a meaningful sort key the way a picker item's real `weight`
  // is. Dynamic ones also get a Boost value (the same `value` field ease
  // modes reuse for Range/charge — its meaning depends entirely on mode,
  // hence the separate descriptor fields), and ease-up/ease-down
  // conditionals get a Range value — same soonest/latest-band math the
  // conditional's own editor uses (see tab-conditional.jsx), collapsed to
  // its near end. Any mode a given field doesn't apply to gets null for it.
  const conditionalRange = (c) => (c.mode === 'ease-up' || c.mode === 'ease-down')
    ? Math.max(1, Math.round((c.threshold ?? 100) / (c.easeMax ?? 14)))
    : null;
  const conditionalOdds = (c) => (c.mode === 'weighted' || c.mode === 'dynamic') ? (c.oddsPct ?? 50) : null;
  const conditionalBoost = (c) => (c.mode === 'dynamic') ? (c.value ?? 0) : null;
  const itemSort = (state.ui && state.ui.dataSort && state.ui.dataSort.conditionals) || 'name-asc';
  const sortedConditionals = [...conditionals].sort((a, b) => compareSortEntries(
    { name: a.name, type: (MODES[a.mode] || {}).label || a.mode, group: null, count: null,
      range: conditionalRange(a), odds: conditionalOdds(a), boost: conditionalBoost(a), isActive: a.active !== false },
    { name: b.name, type: (MODES[b.mode] || {}).label || b.mode, group: null, count: null,
      range: conditionalRange(b), odds: conditionalOdds(b), boost: conditionalBoost(b), isActive: b.active !== false },
    itemSort,
  ));
  const openEditor = (c) => { setPending(null); setDraft({ ...c }); setOpenId(c.id); };
  const closeEditor = () => { setPending(null); setDraft(null); setOpenId(null); };
  // Cancelling a brand-new conditional: collapse the row first (so it animates
  // shut) THEN drop the pending row, instead of unmounting it instantly.
  const closeNewAnimated = () => {
    if (reduceMotion()) { setOpenId(null); setDraft(null); setPending(null); return; }
    setOpenId(null);   // collapse the row (editor stays mounted so it animates shut)
    setTimeout(() => { setDraft(null); setPending(null); }, 300);
  };
  // Deleting an existing conditional: collapse the card shut first, then remove
  // it from the store after the animation (editor kept mounted via closingId).
  const deleteAnimated = (id) => {
    const done = () => { actions.removeConditional(id); setClosingId(null); setDraft(null); setOpenId(null); };
    if (reduceMotion()) { done(); return; }
    setClosingId(id); setOpenId(null);
    setTimeout(done, 300);
  };
  // commit it to the store (same id + name, so the closed row stays in place).
  const saveNewAnimated = (finalName) => {
    const payload = { ...draft, name: finalName };
    const commit = () => { actions.addConditional(payload); setDraft(null); setPending(null); };
    if (reduceMotion()) { setOpenId(null); commit(); return; }
    setOpenId(null);
    setTimeout(commit, 300);
  };
  // Normalize the in-progress name and flag a collision against every OTHER
  // conditional (case-insensitive) — mirrors the Pickers create-flow guard.
  const tidyName = (draft && normalizeConditionalName(draft.name)) || '';
  const nameError = draft && !tidyName
    ? 'Enter a name for this conditional.'
    : draft && conditionals.some((c) => c.id !== openId && (c.name || '').toLowerCase() === tidyName.toLowerCase())
    ? `A conditional named \u201C${tidyName}\u201D already exists. Choose a different name.`
    : null;

  return (
    <section className="cat cat--enter cnd-manager">
      <header className="cat-h">
        <button type="button" className="cat-h-l" aria-expanded={open}
                onClick={() => actions.toggleControlsCollapsed('__conditionals', true)}>
          <span className={`chev ${open ? 'is-open' : ''}`}><Icon name="chev" size={14} /></span>
          <h2 className="cat-name">Conditionals</h2>
          <span className="cat-count">{conditionals.filter((c) => c.active !== false).length} of {conditionals.length}</span>
        </button>
      </header>
      <Collapse open={open}>
      <div className="cat-body">
        {OB_CHECKLIST.tutorialsInProgress(state) ? (
          <InfoTip className="rd-add is-tour-disabled" action="Add a conditional"
                   label="This button is disabled until all tutorials are completed.">
            <Icon name="plus" size={13} /> Add a conditional
          </InfoTip>
        ) : (
          <button className="rd-add" onClick={() => {
            if (pending) return;   // one draft at a time
            const nd = conditionalDraftDefault('', conditionals.map((c) => c.name));
            const id = 'cnd_' + Math.random().toString(36).slice(2, 8);
            const obj = { ...nd, id };
            setPending(obj); setDraft(obj); setOpenId(id);   // held locally, not in store
          }}>
            <Icon name="plus" size={13} /> Add a conditional
          </button>
        )}
        {!conditionals.length && !pending && (
          <p className="rd-cnd-empty">No conditionals yet. Add one here, then attach it to any picker.</p>
        )}
        {conditionals.length > 1 && (
          <SortSelect id="cnd-item-sort" label="Sort" options={CONDITIONAL_ITEM_SORT_OPTIONS}
                      value={itemSort} onChange={(key) => actions.setDataSort('conditionals', key)} />
        )}
        {(pending ? [pending, ...sortedConditionals] : sortedConditionals).map((c) => {
          const isPending = !!pending && c.id === pending.id;
          const isOpen = openId === c.id;
          const uses = usingCount(c.id);
          return (
            <div key={c.id} className={`rd-item ${isOpen ? 'is-editing' : ''}`}>
              {isOpen && draft ? (
                // Plain div, not a button, while editing — a <button> can't
                // legally contain the <input> below it (interactive-in-
                // interactive), which was also why it had no accessible name
                // of its own (browsers exclude a focusable descendant's value
                // from the parent's name computation). The chevron is its own
                // real button instead (same collapse behavior the row button
                // used to provide), rather than a leftover decoration that
                // looks clickable but does nothing.
                <div className="rd-row">
                  <span className="rd-main">
                    <input className={`rd-name-input ${nameError ? 'is-error' : ''}`} type="text" value={draft.name} maxLength={40}
                           placeholder="Conditional name" aria-label="Conditional name" aria-invalid={!!nameError} autoFocus
                           onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                           onBlur={() => { if (tidyName) setDraft({ ...draft, name: tidyName }); }}
                           onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} />
                  </span>
                  <button type="button" className="rd-chev" aria-label="Collapse" onClick={closeEditor}>
                    <span className="chev is-open"><Icon name="chev" size={14} /></span>
                  </button>
                </div>
              ) : (
                <button type="button" className="rd-row" aria-expanded={isOpen}
                     onClick={() => { if (isOpen) closeEditor(); else openEditor(c); }}>
                  <span className="rd-main">
                    <span className="rd-name">{c.name}</span>
                    <span className="rd-sched">{(MODES[c.mode] || {}).label || c.mode}
                      {' · '}{uses} {uses === 1 ? 'picker' : 'pickers'}
                      {c.active === false ? ' · on vacation' : ''}</span>
                  </span>
                  <span className="rd-chev"><span className={`chev ${isOpen ? 'is-open' : ''}`}><Icon name="chev" size={14} /></span></span>
                </button>
              )}
              <Collapse open={isOpen}>
                {draft && (isOpen || isPending || closingId === c.id) && (
                  <ConditionalEditor cond={c} draft={draft} setDraft={setDraft} actions={actions}
                                     isNew={isPending}
                                     nameError={nameError} tidyName={tidyName}
                                     onClose={closeEditor}
                                     onDelete={() => deleteAnimated(c.id)}
                                     onSaveNew={isPending ? (() => saveNewAnimated(tidyName)) : undefined}
                                     onDiscard={isPending
                                       ? closeNewAnimated
                                       : (() => { const id = c.id; closeEditor(); actions.removeConditional(id); })} />
                )}
              </Collapse>
            </div>
          );
        })}
      </div>
      </Collapse>
    </section>
  );
}

function TabData({ state, actions, onHome, onNavTab }) {
  // Group Filter / Pickers Filter are disabled while their own Data page
  // tour step is up — narrating what they do is the point; letting the user
  // actually change statGroup/scope mid-tour would leave a LATER step's own
  // target (Reminders, which only renders at scope 'all') unable to find
  // anything, since nothing resets it back afterward. Same tourId+step
  // gating pattern as tab-picker.jsx's own disableTourAddPicker.
  const tour = useEmlTour();
  const disableGroupFilter = tour.phase === 'tour' && tour.tourId === 'page-explore_data' && tour.step === 1;
  const disablePickersFilter = tour.phase === 'tour' && tour.tourId === 'page-explore_data' && tour.step === 2;
  // "Edit your first item" tour's own Step 4 (Edit Picker Settings,
  // Controls expanded), Step 6 (Picker Items, an item row about to be
  // clicked), and Step 7 (Edit Item Settings, an item expanded) all want
  // the user genuinely free to explore/edit everything inside whichever
  // section is current, but collapsing the picker's own header would pull
  // any of these steps' own target out from under it (the highlighted box
  // depends on this exact picker staying expanded) — guarded during all
  // three. Expanding the OTHER top-level section (Items during Step 4,
  // Controls during Steps 6/7) is guarded too: not strictly
  // target-breaking the way the picker header is, but it'd let the
  // highlighted box balloon to include content these steps were never
  // about. Narrating that these are off-limits for their step is the
  // point, same tourId+step gating pattern as disableGroupFilter/
  // disablePickersFilter above.
  const disableEditTourPickerHeader = tour.phase === 'tour' && tour.tourId === 'appfeature-feat_edit_item' && (tour.step === 3 || tour.step === 5 || tour.step === 6);
  const disableEditTourControlsToggle = tour.phase === 'tour' && tour.tourId === 'appfeature-feat_edit_item' && (tour.step === 5 || tour.step === 6);
  // Items header itself is ALSO guarded during Steps 6/7 (not just
  // blocked from expanding during Step 4) — collapsing it there would
  // hide the item rows/Add button those two steps depend on, same
  // target-preservation reasoning as the picker header above.
  const disableEditTourItemsToggle = tour.phase === 'tour' && tour.tourId === 'appfeature-feat_edit_item' && (tour.step === 3 || tour.step === 5 || tour.step === 6);
  // Step 6's own body text says outright that this button is disabled for
  // the tutorial — narrating what it does is the point, not inviting a
  // brand-new item mid-tutorial that would shift every item row's
  // position out from under Step 6's own "click any of these" framing.
  // Stays disabled through Step 7 too, for the same reason.
  const disableEditTourAddItem = tour.phase === 'tour' && tour.tourId === 'appfeature-feat_edit_item' && (tour.step === 5 || tour.step === 6);
  // Separately, disabled anywhere from the Welcome Tour's first step through
  // the closing Generate card's flow completing — see
  // OB_CHECKLIST.tutorialsInProgress. Distinct from disableEditTourAddItem
  // above: that one's own tour only ever runs AFTER checklistDone (App
  // Feature tutorials are gated on it), when tutorialsInProgress is always
  // false, so the two never overlap.
  const tutorialsInProgress = OB_CHECKLIST.tutorialsInProgress(state);
  // Fading accent highlight (.ob-tour-pulse, styles2.css) on top of the
  // tour engine's own bigger spotlight box — points at the SPECIFIC
  // element a requireClick step wants clicked, since the spotlight alone
  // highlights the whole picker section (header + Controls + Items
  // together, see onboarding-app-features.jsx's own sel comment) without
  // distinguishing which part inside it is actually actionable. Step 2
  // targets EVERY picker's own .cat section (clicking any one's header
  // satisfies it) — applied to the whole card, not just its header
  // button, so the outline reads as "this card" rather than singling out
  // one control inside it; safe as a per-element outline since picker
  // cards sit with real gaps between them, no touching-siblings doubling
  // risk. Steps 3/5 target a single header each, same outline treatment.
  // Step 6 targets each item row's own .rd-item wrapper (not just its
  // inner .rd-row button) — .rd-item.is-tour-target already exists for
  // exactly this element, using per-side BORDERS rather than one outline
  // (touching item rows can't share an outline without doubling — see
  // that class's own comment in styles2.css), so .ob-tour-pulse pairs
  // with it there instead of standing alone, and fades border-color
  // instead of outline-color (see .ob-tour-pulse's own comment for the
  // override). The step's own sel in onboarding-app-features.jsx covers a
  // much bigger box (the whole picker card, or every card in Step 2's
  // case) than what's actually clickable, so the tour engine's default
  // requireClick pulse — one ring around that whole box — reads as
  // "pulse the entire group/section," not "click here specifically."
  // Each of these steps sets pulseSel to something that never matches,
  // suppressing that default pulse outright, so only this per-element
  // fade shows.
  const highlightEditTourPickerHeaders = tour.phase === 'tour' && tour.tourId === 'appfeature-feat_edit_item' && tour.step === 1;
  const highlightEditTourControlsHeader = tour.phase === 'tour' && tour.tourId === 'appfeature-feat_edit_item' && tour.step === 2;
  const highlightEditTourItemsHeader = tour.phase === 'tour' && tour.tourId === 'appfeature-feat_edit_item' && tour.step === 4;
  const highlightEditTourItemRows = tour.phase === 'tour' && tour.tourId === 'appfeature-feat_edit_item' && tour.step === 5;
  // Help mode (see help-mode.jsx) — needs real pickers of every mode (with a
  // conditional-gated one) AND reminders of every recurrence kind to show a
  // representative "view and edit" section, so both disposable seed sets
  // are seeded together while it's on and cleared when it turns off or this
  // tab unmounts.
  const [helpOn, setHelpOn] = React.useState(false);
  const helpExit = React.useCallback(() => setHelpOn(false), []);
  React.useEffect(() => {
    if (helpOn) { seedHelpPickers(state, actions); seedHelpTasks(state, actions); }
    else { clearHelpPickers(actions); clearHelpTasks(actions); }
  }, [helpOn]);
  React.useEffect(() => () => { clearHelpPickers(actions); clearHelpTasks(actions); }, []);
  // Which picker item is expanded for editing (mirrors the Reminders list).
  const [openItemId, setOpenItemId] = React.useState(null);
  // Tracks a brand-new picker item whose edits aren't kept yet. Cancel on such
  // an item discards the whole add (removes it) rather than reverting to the
  // empty snapshot; cleared once the item is kept (row click / save / delete).
  const justAddedItemRef = React.useRef(null);
  // Id of a just-inserted row, so it plays the slide-in entrance once.
  const [insertItemId, setInsertItemId] = React.useState(null);
  // Frozen render-position for whichever item is open — see freezeEditedRow.
  // One ref shared across every picker's item list (only one item can be
  // open at a time, and the helper no-ops for any list that doesn't hold it).
  const frozenItemIndexRef = React.useRef(null);
  // Replays the insert entrance animation once an item's editor closes, so it
  // settles into its (possibly new, now-unfrozen) sorted position with the
  // same visual treatment a freshly-created row gets, instead of silently
  // snapping there. Fires on ANY close (Done, Cancel-revert, delete, or the
  // row's own collapse chevron) since they all just change openItemId.
  const prevOpenItemIdRef = React.useRef(null);
  React.useEffect(() => {
    const prev = prevOpenItemIdRef.current;
    if (prev != null && prev !== openItemId) setInsertItemId(prev);
    prevOpenItemIdRef.current = openItemId;
  }, [openItemId]);
  // Inline delete confirmation, shared by items and pickers:
  //   { kind: 'item' | 'picker', id }
  const [confirmDel, setConfirmDel] = React.useState(null);

  // Filter selection — mirrors the Pickers + Stats tabs. Both default to 'All'.
  //   statGroup: which group's pickers appear in the box row ('all' | groupName)
  //   scope:     the active box ('all' | 'reminders' | <pickerId>)
  // Click behavior is stubbed for now (onSelectScope) — ready to wire up later.
  const [statGroup, setStatGroup] = React.useState('all');
  const [scope, setScope] = React.useState('all');
  // Conditionals filter — narrows pickers to those gated by a chosen conditional
  // (or 'all'). Independent of the group filter; both apply together.
  const [condFilter, setCondFilter] = React.useState('all');

  const pickers = state.pickers || [];
  // Picker card currently playing its collapse+fade-out before removal (delete).
  const [removingPickerId, setRemovingPickerId] = React.useState(null);
  const deletePickerAnimated = (id) => {
    if (reduceMotion()) { actions.removePicker(id); return; }
    setRemovingPickerId(id);
  };
  // Shared picker-item editor (defined in tab-today, reused here so Today and
  // Data stay exact copies — same pattern as the Reminders editor).
  const ItemEditor = EntryEditor;
  // Persisted collapse state. Uniform polarity: true = collapsed, false =
  // expanded. Picker cards are keyed by picker id and default COLLAPSED (absent
  // = collapsed), so they read `=== false` for open; the nested Controls /
  // Items disclosures ('<pickerId>:controls' / ':items') default open.
  const collapsedMap = (state.ui && state.ui.controlsCollapsed) || {};

  // Distinct group names, alphabetical — drive the group selector that
  // narrows the picker box row below it (mirrors the Pickers + Stats tabs;
  // "All" itself is a separate, always-first pill rendered outside this list).
  const existingGroups = React.useMemo(() => {
    const seen = [];
    for (const p of pickers) if (p.group && !p.hidden && !seen.includes(p.group)) seen.push(p.group);
    return seen.sort((a, b) => a.localeCompare(b));
  }, [pickers]);
  const visiblePickers = React.useMemo(() => (
    pickers.filter((p) =>
      !p.hidden &&
      (statGroup === 'all' || p.group === statGroup) &&
      (condFilter === 'all' || p.conditionalId === condFilter))
  ), [pickers, statGroup, condFilter]);
  const conditionals = state.conditionals || [];
  const condPickerCount = (cid) => pickers.filter((p) => p.conditionalId === cid && !p.hidden).length;

  // Keep scope coherent with the group filter: 'all' is always valid; a specific
  // picker scope is only valid if that picker is in the current group. When it
  // isn't (e.g. the group just changed), fall back to 'all' so the group shows
  // all of its pickers by default. 'reminders' is only valid in the "All" group.
  React.useEffect(() => {
    if (statGroup === 'all') {
      // 'all', 'reminders', 'conditionals', or any picker are all valid here.
      if (scope !== 'all' && scope !== 'reminders' && scope !== 'conditionals' && !visiblePickers.some((p) => p.id === scope)) setScope('all');
    } else if (!visiblePickers.some((p) => p.id === scope)) {
      // Within a group there's no All/Reminders box — default to the first picker.
      setScope(visiblePickers[0] ? visiblePickers[0].id : 'all');
    }
  }, [statGroup, visiblePickers, scope]);

  // Stub click handler for the boxes — selection state updates, functionality
  // to be attached later.
  const onSelectScope = (next) => setScope(next);

  // Scroll-edge fades on the group + box rows — same affordance as the Stats
  // tab: a mask gradient that only fades the side with more content.
  const groupsRef = React.useRef(null);
  const scopeRef = React.useRef(null);
  const condRowRef = React.useRef(null);
  React.useEffect(() => {
    const els = [groupsRef.current, scopeRef.current, condRowRef.current].filter(Boolean);
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
  }, [pickers.length, statGroup, visiblePickers.length, scope, conditionals.length, condFilter]);

  // Picker-card toggle — cards default collapsed, hence defaultCollapsed=true.
  const toggle = (id) => actions.toggleControlsCollapsed(id, true);

  // Apply the two filters to what renders. Reminders is its own scope and isn't
  // part of any picker group, so it only appears when the group filter is "All"
  // and the scope is All or Reminders. Pickers are group-filtered (visiblePickers)
  // then narrowed by scope: All → every visible picker, Reminders → none, or a
  // single picker id → just that one.
  const showReminders = statGroup === 'all' && condFilter === 'all' && (scope === 'all' || scope === 'reminders');
  // Conditionals manager shows above Reminders when unfiltered by group/cond, at
  // scope All or the dedicated Conditionals box. Shown even with none created —
  // it's the only place to create one, so gating on existence made it
  // unreachable from a clean state.
  const showConditionals = statGroup === 'all' && condFilter === 'all'
    && (scope === 'all' || scope === 'conditionals');
  const shownPickers = (scope === 'reminders' || scope === 'conditionals')
    ? []
    : (scope === 'all' ? visiblePickers : visiblePickers.filter((p) => p.id === scope));

  // Section sort — orders the top-level Conditionals / Reminders / picker
  // cards. "Type" for Conditionals/Reminders is just their own section name
  // (there's only ever one of each); a picker's is its mode label. Group and
  // Active/Inactive have no meaning for Conditionals/Reminders as a WHOLE
  // section (individual conditionals/reminders have their own states, but
  // the section itself doesn't) — those sort as "N/A", always at the top for
  // the forward sort and the bottom for its reverse, per instruction, rather
  // than being force-fit into a fake group/active value.
  const remindersCount = (state.tasks || []).filter((t) => !t.hidden).length;
  const pickerSectionMeta = React.useMemo(() => {
    const m = new Map();
    for (const p of shownPickers) {
      const its = state.items.filter((i) => i.pickerId === p.id);
      m.set(p.id, { count: its.length, isActive: !(its.length > 0 && its.every((i) => i.vacation)) });
    }
    return m;
  }, [shownPickers, state.items]);
  const sectionSort = (state.ui && state.ui.dataSort && state.ui.dataSort.sections) || 'name-asc';
  const sectionEntries = React.useMemo(() => {
    const entries = [];
    if (showConditionals) entries.push({ kind: 'conditionals', name: 'Conditionals', type: 'Conditionals', group: null, count: conditionals.length, isActive: null });
    if (showReminders) entries.push({ kind: 'reminders', name: 'Reminders', type: 'Reminders', group: null, count: remindersCount, isActive: null });
    for (const p of shownPickers) {
      const meta = pickerSectionMeta.get(p.id) || { count: 0, isActive: true };
      entries.push({ kind: 'picker', pk: p, name: p.name, type: MODES[p.mode].label, group: p.group || null, count: meta.count, isActive: meta.isActive });
    }
    return entries.sort((a, b) => compareSortEntries(a, b, sectionSort));
  }, [showConditionals, showReminders, shownPickers, pickerSectionMeta, conditionals.length, remindersCount, sectionSort]);

  return (
    <div className="tab tab--data">
      <HelpOverlay active={helpOn} items={DATA_HELP_ITEMS} onExit={helpExit} />
      <header className="stat-h">
        <div className="kicker-row">
          <div className="kicker stat-h-kicker">Data</div>
          <HelpButton active={helpOn} onClick={() => setHelpOn((o) => !o)} />
        </div>
        <div className="stat-h-lead">
          <button type="button" onClick={onHome} className="brand-mark" aria-label="Ease My Life — go to Today">
            {/* Same theme-wired logo as the Today + Stats headers (currentColor →
                accent, grid lines → accent-soft) so every tab reads as one product. */}
            <svg viewBox="8 8 528 528" fill="none" aria-hidden="true">
              <defs>
                <clipPath id="brandMarkClipData" clipPathUnits="userSpaceOnUse">
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
                clipPath="url(#brandMarkClipData)"
                style={{ fill: 'currentColor', stroke: 'currentColor' }}
              />
            </svg>
          </button>
          <div className="section-h">
            <h1 className="section-title">The knobs and levers, that <span className="stat-title-accent">ease</span> your life.</h1>
          </div>
        </div>
        <p className="section-sub">All your created items can be edited here, including conditionals, reminders, pickers and all of their items. You can use the <button type="button" className="sub-tablink" onClick={() => onNavTab && onNavTab('stats')}>Stats tab</button> to view how they are performing and then adjust their numbers here to get them exactly where you want them.</p>
        <p className="section-sub"><strong>WARNING:</strong> Manually changing any of these values will affect the Stats tab's accuracy. Minor or infrequent changes will have an almost negligible effect but major or frequent changes will definitely skew the Stats tab's accuracy.</p>
      </header>

      {/* ── Filters: group pills + picker boxes (mirrors the Pickers + Stats
          tabs). Both default to "All"; the box row also carries a Reminders box
          when the group filter is "All". Click behavior is stubbed for now. ── */}
      <div className="stat-filters">
        {existingGroups.length > 1 && (
          <div className="stat-filter-row">
            <span className="stat-filter-lbl">Group</span>
            <div className="picker-groups stat-scope-groups" ref={groupsRef} role="tablist" aria-label="Filter pickers by group">
              <button type="button" role="tab" aria-selected={statGroup === 'all'}
                      className={`picker-group-pill ${statGroup === 'all' ? 'is-on' : ''}`}
                      disabled={disableGroupFilter}
                      onClick={() => { setStatGroup('all'); setScope('all'); }}>
                All
                <span className="picker-group-count">{pickers.filter((p) => !p.hidden).length}</span>
              </button>
              {existingGroups.map((g) => {
                const n = pickers.filter((p) => p.group === g && !p.hidden).length;
                return (
                  <button key={g} type="button" role="tab" aria-selected={statGroup === g}
                          className={`picker-group-pill ${statGroup === g ? 'is-on' : ''}`}
                          disabled={disableGroupFilter}
                          onClick={() => setStatGroup(g)}>
                    {g}
                    <span className="picker-group-count">{n}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {conditionals.length > 0 && (
          <div className="stat-filter-row">
            <span className="stat-filter-lbl">Conditionals</span>
            <div className="picker-groups stat-scope-groups stat-scope-groups--cond" ref={condRowRef} role="tablist" aria-label="Filter pickers by conditional">
              <button type="button" role="tab" aria-selected={condFilter === 'all'}
                      className={`picker-group-pill ${condFilter === 'all' ? 'is-on' : ''}`}
                      disabled={disableGroupFilter}
                      onClick={() => { setCondFilter('all'); if (scope !== 'all' && scope !== 'reminders' && scope !== 'conditionals') setScope('all'); }}>
                All
                <span className="picker-group-count">{pickers.length}</span>
              </button>
              {[...conditionals].sort((a, b) => a.name.localeCompare(b.name)).map((c) => (
                <button key={c.id} type="button" role="tab" aria-selected={condFilter === c.id}
                        className={`picker-group-pill ${condFilter === c.id ? 'is-on' : ''}`}
                        disabled={disableGroupFilter}
                        onClick={() => { setCondFilter(c.id); setScope('all'); setStatGroup('all'); }}>
                  {c.name}
                  <span className="picker-group-count">{condPickerCount(c.id)}</span>
                </button>
              ))}
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
                      disabled={disablePickersFilter}
                      onClick={() => onSelectScope('all')}>
                <span className="picker-tab-name">All</span>
                <span className="picker-tab-mode">Everything</span>
              </button>
            )}
            {/* Everything after "All" — Conditionals, Reminders, and every
                visible picker — sorts together alphabetically by its own
                displayed name, rather than Conditionals/Reminders being
                pinned right after All. */}
            {[
              ...(statGroup === 'all' && conditionals.length > 0
                ? [{ key: 'conditionals', name: 'Conditionals', modeLabel: 'Gates', isOn: scope === 'conditionals', onClick: () => onSelectScope('conditionals') }]
                : []),
              ...(statGroup === 'all'
                ? [{ key: 'reminders', name: 'Reminders', modeLabel: 'Tasks', isOn: scope === 'reminders', onClick: () => onSelectScope('reminders') }]
                : []),
              ...visiblePickers.map((p) => ({ key: p.id, name: p.name, modeLabel: MODES[p.mode].label, isOn: scope === p.id, onClick: () => onSelectScope(p.id), pickerId: p.id })),
            ]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((entry, i) => (
                <button key={entry.key} type="button" data-picker-id={entry.pickerId}
                        className={`picker-tab picker-tab--enter ${entry.isOn ? 'is-on' : ''}`}
                        style={{ animationDelay: (i + 1) * 40 + 'ms' }}
                        disabled={disablePickersFilter}
                        onClick={entry.onClick}>
                  <span className="picker-tab-name">{entry.name}</span>
                  <span className="picker-tab-mode">{entry.modeLabel}</span>
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Section sort — orders Conditionals / Reminders / each picker card
          below. Only meaningful with more than one section in view, but
          left visible either way rather than popping in/out as filters
          change. */}
      <div className="data-sort-bar">
        <SortSelect id="data-section-sort" label="Sort" options={SECTION_SORT_OPTIONS}
                    value={sectionSort} onChange={(key) => actions.setDataSort('sections', key)} />
      </div>

      <div className="data-list" key={statGroup + '::' + scope + '::' + condFilter}>
        {!showConditionals && !showReminders && shownPickers.length === 0 && (
          <div className="data-empty">
            <p className="data-empty-title">Nothing matches these filters</p>
            <p className="data-empty-sub">No items match the current Group, Conditionals, and Show selections. Try widening a filter to “All”.</p>
          </div>
        )}
        {sectionEntries.map((entry, pkIndex) => {
          if (entry.kind === 'conditionals') return <ConditionalsManager state={state} actions={actions} key="cnd-shown" />;
          if (entry.kind === 'reminders') return <ReminderManager state={state} actions={actions} key="rem-shown" />;
          const pk = entry.pk;
          const items = state.items.filter((i) => i.pickerId === pk.id);
          const eligible = items.filter((i) => !i.vacation).length;
          const allVac = items.length > 0 && items.every((i) => i.vacation);
          const open = collapsedMap[pk.id] === false;
          const isEase = pk.mode === 'ease-up' || pk.mode === 'ease-down';
          const usesWeight = pk.mode === 'weighted' || pk.mode === 'dynamic';
          const inDaily = state.daily.pickerIds.includes(pk.id);
          const ctlCollapsed = !!collapsedMap[pk.id + ':controls'];
          const itemsCollapsed = !!collapsedMap[pk.id + ':items'];
          // Item sort — see pickerItemSortOptions for why the available
          // options vary by mode (a mode-specific numeric field standing in
          // for the generic 'count' comparator field: charge for ease modes,
          // weight for weighted/dynamic; truly random has neither). Ease
          // modes also get Range, from the same soonest/latest band math the
          // item rows below render (hoisted here so both share one
          // PICKERS.avgEase call instead of computing it per item twice).
          const itemSort = (state.ui && state.ui.dataSort && state.ui.dataSort[pk.id]) || 'name-asc';
          const fallbackEase = isEase ? PICKERS.avgEase(items, pk.id) : null;
          const itemSortEntry = (it) => {
            const eMax = it.easeMax ?? fallbackEase?.easeMax ?? 20;
            return {
              name: it.name, type: null, group: null,
              count: isEase ? (it.value ?? 0) : (usesWeight ? (it.weight ?? 1) : null),
              range: isEase ? Math.max(1, Math.round(100 / (eMax || 1))) : null,
              isActive: !it.vacation,
            };
          };
          const sortedItems = [...items].sort((a, b) => compareSortEntries(itemSortEntry(a), itemSortEntry(b), itemSort));
          const displayItems = freezeEditedRow(sortedItems, openItemId, justAddedItemRef.current, frozenItemIndexRef);
          return (
            <section key={pk.id} data-picker-id={pk.id} className={`cat cat--enter ${allVac ? 'is-vac' : ''} ${removingPickerId === pk.id ? 'cat--removing' : ''} ${highlightEditTourPickerHeaders ? 'ob-tour-pulse' : ''}`}
                     onAnimationEnd={(e) => {
                       if (e.target === e.currentTarget && removingPickerId === pk.id) {
                         actions.removePicker(pk.id); setRemovingPickerId(null);
                       }
                     }}
                     style={{ animationDelay: (pkIndex * 45) + 'ms' }}>
              <header className="cat-h"
                      onClick={(e) => { if (!disableEditTourPickerHeader && !e.target.closest('button')) toggle(pk.id); }}>
                <button type="button" className="cat-h-l" aria-expanded={open}
                        disabled={disableEditTourPickerHeader}
                        onClick={() => toggle(pk.id)}>
                  <span className={`chev ${open ? 'is-open' : ''}`}><Icon name="chev" size={14} /></span>
                  <h2 className="cat-name">{pk.name}</h2>
                  <span className="cat-group">{pk.group}</span>
                  {/* Each part its own element (not one text run) so a narrow
                      viewport can stack them into 3 centered rows — see
                      .cat-count's own @container rule in styles2.css. */}
                  <span className="cat-count">
                    <span className="cat-count-n">{eligible}</span>
                    <span className="cat-count-of">of</span>
                    <span className="cat-count-n">{items.length}</span>
                  </span>
                  {/* Not shown — read by help-mode's pickerRow entry via
                      labelSel to build "{type} Picker" per-picker badge
                      titles; the type itself isn't otherwise surfaced
                      anywhere in the collapsed header. */}
                  <span className="cat-mode-label" hidden>{MODES[pk.mode].label}</span>
                </button>
                <button className="vac-toggle" aria-pressed={!!allVac}
                        aria-label={`${allVac ? 'End vacation for' : 'Start vacation for'} all items in ${pk.name}`}
                        onClick={(e) => { e.stopPropagation(); actions.toggleVacation(pk.id, 'picker'); }}
                        title="Vacation for all items in this picker">
                  <Icon name={allVac ? 'moon' : 'sparkle'} size={14} />
                  <span>{allVac ? 'On vacation' : 'Active'}</span>
                </button>
              </header>
              <Collapse open={open}>
                <div className="cat-body">
                  {/* Controls — nested collapsible (open by default, remembered per
                      picker). Holds the pick-algorithm config moved here from
                      Settings, so all of a picker's setup lives in one place. */}
                  <button type="button" className={`rd-ctl ${highlightEditTourControlsHeader ? 'ob-tour-pulse' : ''}`} aria-expanded={!ctlCollapsed}
                       disabled={disableEditTourControlsToggle}
                       onClick={() => actions.toggleControlsCollapsed(pk.id + ':controls')}>
                    <span className="rd-ctl-l">
                      <span className={`chev ${ctlCollapsed ? '' : 'is-open'}`}><Icon name="chev" size={12} /></span>
                      <span className="kicker">Controls</span>
                    </span>
                    {ctlCollapsed && <span className="rd-ctl-sum">{Object.keys(MODES).length} options</span>}
                  </button>
                  <Collapse open={!ctlCollapsed}>
                    <PickerControls picker={pk} items={items} inDaily={inDaily}
                                    allGroups={existingGroups}
                                    conditionals={state.conditionals || []}
                                    dailyIds={state.daily.pickerIds} actions={actions}
                                    onCollapse={() => actions.toggleControlsCollapsed(pk.id + ':controls')}
                                    onRequestDelete={() => deletePickerAnimated(pk.id)} />
                  </Collapse>

                  {/* Items — nested collapsible (open by default, remembered per
                      picker); collapsed shows the item count. */}
                  <button type="button" className={`rd-ctl ${highlightEditTourItemsHeader ? 'ob-tour-pulse' : ''}`} aria-expanded={!itemsCollapsed}
                       disabled={disableEditTourItemsToggle}
                       onClick={() => actions.toggleControlsCollapsed(pk.id + ':items')}>
                    <span className="rd-ctl-l">
                      <span className={`chev ${itemsCollapsed ? '' : 'is-open'}`}><Icon name="chev" size={12} /></span>
                      <span className="kicker">Items</span>
                    </span>
                    {itemsCollapsed && <span className="rd-ctl-sum">{items.length} items</span>}
                  </button>
                  <Collapse open={!itemsCollapsed}>
                    <React.Fragment>
                      {tutorialsInProgress ? (
                        <InfoTip className="rd-add is-tour-disabled" action={`Add to ${pk.name.toLowerCase()}`}
                                 label="This button is disabled until all tutorials are completed.">
                          <Icon name="plus" size={13} /> Add to {pk.name.toLowerCase()}
                        </InfoTip>
                      ) : (
                        <button className="rd-add" disabled={disableEditTourAddItem} onClick={() => {
                          if (justAddedItemRef.current) return;   // guard: ignore rapid double-click
                          const id = 'it_' + Math.random().toString(36).slice(2, 8);
                          actions.addItem(pk.id, 'New item', id);
                          justAddedItemRef.current = id;   // Cancel discards it
                          setInsertItemId(id);
                          setOpenItemId(id);
                        }}>
                          <Icon name="plus" size={13} /> Add to {pk.name.toLowerCase()}
                        </button>
                      )}
                      {items.length > 1 && (
                        <SortSelect id={`item-sort-${pk.id}`} label="Sort" options={pickerItemSortOptions(pk.mode)}
                                    value={itemSort} onChange={(key) => actions.setDataSort(pk.id, key)} />
                      )}
                      {displayItems.map((it) => {
                        const itemOpen = openItemId === it.id;
                        // Same fallback the picking engine itself uses for an
                        // item with no ease band of its own (see
                        // PICKERS.avgEase) — hoisted above (with itemSortEntry)
                        // rather than recomputed per item here.
                        const eMin = it.easeMin ?? fallbackEase?.easeMin ?? 10;
                        const eMax = it.easeMax ?? fallbackEase?.easeMax ?? 20;
                        const soonest = Math.max(1, Math.round(100 / (eMax || 1)));
                        const latest = Math.max(1, Math.round(100 / (eMin || 1)));
                        const meta = it.vacation
                          ? 'On vacation'
                          : (isEase ? `${soonest}\u2013${latest} ${CADENCE.unitWord(pk.cadence, latest)}`
                             : (usesWeight ? `Weight w${it.weight}` : 'Equal chance'));
                        return (
                          <div key={it.id} className={`rd-item ${it.vacation ? 'is-vac' : ''} ${itemOpen ? 'is-editing' : ''} ${insertItemId === it.id ? 'rd-item--insert' : ''} ${highlightEditTourItemRows ? 'is-tour-target ob-tour-pulse' : ''}`}
                               onAnimationEnd={() => { if (insertItemId === it.id) setInsertItemId(null); }}>
                            {itemOpen ? (
                              // Plain div, not a button, while editing — see the
                              // matching Conditionals row above for why (a
                              // <button> can't legally contain the <input>
                              // below it, and loses its own accessible name
                              // as a result). The chevron is its own real
                              // button instead of a leftover decoration.
                              <div className="rd-row">
                                <span className="rd-main">
                                  <input className="rd-name-input" type="text" value={it.name} maxLength={60}
                                         placeholder="Item name" aria-label="Item name" autoFocus
                                         onChange={(e) => actions.updateItem(it.id, { name: e.target.value })}
                                         onBlur={(e) => { const n = e.target.value.trim(); if (n) actions.renameItem(it.id, n); }}
                                         onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} />
                                </span>
                                <button type="button" className="rd-chev chev is-open" aria-label="Collapse"
                                        onClick={() => setOpenItemId(null)}>
                                  <Icon name="chev" size={16} />
                                </button>
                              </div>
                            ) : (
                              <button type="button" className="rd-row" aria-expanded={itemOpen}
                                    onClick={() => setOpenItemId(itemOpen ? null : it.id)}>
                                <span className="rd-main">
                                  <span className="rd-name">{it.name}</span>
                                  <span className="rd-sched">{meta}</span>
                                </span>
                                <span className="rd-chev chev" aria-hidden="true">
                                  <Icon name="chev" size={16} />
                                </span>
                              </button>
                            )}
                            <Collapse open={itemOpen}>
                              <div className="rd-edit">
                                <ItemEditor item={it} picker={pk} actions={actions} items={items}
                                            isNew={justAddedItemRef.current === it.id}
                                            itemCount={items.length}
                                            onClose={() => {
                                              if (justAddedItemRef.current === it.id) justAddedItemRef.current = null;
                                              // Only close OUR row — this can fire well after the user
                                              // has already switched to a different item's editor (this
                                              // callback is invoked from a deferred implicit-close), so a
                                              // bare setOpenItemId(null) would clobber whichever item is
                                              // now open.
                                              setOpenItemId((cur) => cur === it.id ? null : cur);
                                            }}
                                            onCancel={(snap) => {
                                              if (justAddedItemRef.current === it.id) {
                                                // Discard a brand-new item, but let the editor play
                                                // the same collapse-close animation as Save first,
                                                // then remove the row once it's closed.
                                                justAddedItemRef.current = null;
                                                const rid = it.id;
                                                setOpenItemId((cur) => cur === it.id ? null : cur);
                                                setTimeout(() => actions.removeItem(rid), 280);
                                              } else {
                                                actions.replaceItem(it.id, snap);
                                                setOpenItemId((cur) => cur === it.id ? null : cur);
                                              }
                                            }}
                                            onDelete={() => {
                                              if (justAddedItemRef.current === it.id) justAddedItemRef.current = null;
                                              const rid = it.id;
                                              setOpenItemId((cur) => cur === it.id ? null : cur);
                                              if (reduceMotion()) { actions.removeItem(rid); return; }
                                              setTimeout(() => actions.removeItem(rid), 280);
                                            }} />
                              </div>
                            </Collapse>
                          </div>
                        );
                      })}
                    </React.Fragment>
                  </Collapse>
                </div>
              </Collapse>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export { TabData };
