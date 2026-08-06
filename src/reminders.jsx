import React from 'react';
import { DayLogChip, RemindersLog } from './day-log.jsx';
import { OB_REMINDER_CARD_TEXT, OB_SAMPLE_TASK_IDS } from './onboarding-seed-data.js';
import { TASKS } from './tasks.js';
import { Btn, Collapse, Icon, WeekdayChips, reduceMotion, useEscapeCancel } from './ui.jsx';

// Reminders UI — shared components for manual, statically-scheduled tasks.
// Rendered in two places:
//   • Today  → ReminderSection (the list atop Today) + quick-add
//   • Data   → ReminderManager (full management, with the scheduling editor)
//
// All scheduling logic lives in tasks.js (TASKS). These are presentation
// + small local form state only.

const REPEAT_OPTS = [
  { key: 'once',     label: 'Once',        sub: <>included in the Today tab <strong>until marked as completed</strong></> },
  { key: 'interval', label: 'Every N days', sub: <>included in the Today tab <strong>as often as specified below</strong></> },
  { key: 'weekly',   label: 'Weekly',      sub: <>included in the Today tab <strong>on the days specified below</strong></> },
  { key: 'monthly',  label: 'Monthly',     sub: <>included in the Today tab <strong>every month as specified below</strong></> },
  { key: 'annual',   label: 'Yearly',      sub: <>included in the Today tab <strong>every year as specified below</strong></> },
];

// Animated segmented control: a single accent "thumb" slides between options.
// The thumb tracks the active button's box (left/width/top/height, so it also
// follows a wrap to a second line). During a move the leading edge uses a fast
// slightly-overshooting curve while the trailing edge eases in — so the pill
// stretches in flight and settles with a small bounce, like real momentum.
function Segmented({ options, value, onChange, ariaLabel, describedBy }) {
  const segRef = React.useRef(null);
  const thumbRef = React.useRef(null);
  const prevIndex = React.useRef(options.findIndex((o) => o.key === value));

  const place = React.useCallback((animate) => {
    const seg = segRef.current, thumb = thumbRef.current;
    if (!seg || !thumb) return;
    const active = seg.querySelector('.seg-btn.is-on');
    if (!active) return;
    const idx = options.findIndex((o) => o.key === value);
    const dir = idx - prevIndex.current;   // >0 moving right, <0 moving left
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!animate || reduce) {
      thumb.style.transition = 'none';
    } else {
      // Leading edge fast (overshoot) · trailing edge slow (ease-in) → stretch.
      const lead = 'cubic-bezier(.22,.9,.24,1.12)';
      const trail = 'cubic-bezier(.65,0,.5,1)';
      const move = 'cubic-bezier(.5,0,.2,1)';   // vertical / same-slot ease-in-out
      const leftE = dir < 0 ? lead : trail;     // left edge leads when moving left
      const widthE = dir < 0 ? trail : lead;    // right edge leads when moving right
      thumb.style.transition =
        `left .36s ${leftE}, width .36s ${widthE}, top .3s ${move}, height .3s ${move}`;
    }
    thumb.style.left = active.offsetLeft + 'px';
    thumb.style.top = active.offsetTop + 'px';
    thumb.style.width = active.offsetWidth + 'px';
    thumb.style.height = active.offsetHeight + 'px';
    thumb.style.opacity = '1';
    prevIndex.current = idx;
  }, [value, options]);

  // Reposition (animated) whenever the selection changes.
  React.useLayoutEffect(() => { place(true); }, [value]);
  // Initial placement (no animation) + keep in sync on resize / reflow.
  React.useLayoutEffect(() => {
    place(false);
    const ro = new ResizeObserver(() => {
      const thumb = thumbRef.current; if (thumb) thumb.style.transition = 'none';
      place(false);
    });
    if (segRef.current) ro.observe(segRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="seg" role="group" aria-label={ariaLabel} aria-describedby={describedBy} ref={segRef}>
      <span className="seg-thumb" ref={thumbRef} aria-hidden="true"></span>
      {options.map((o) => (
        <button key={o.key} type="button"
                className={`seg-btn ${value === o.key ? 'is-on' : ''}`}
                aria-pressed={value === o.key} aria-describedby={describedBy}
                onClick={() => onChange(o.key)}>{o.label}</button>
      ))}
    </div>
  );
}

// Live "will this show today?" advisory, computed from the DRAFT as the user
// edits — so the answer is visible before the reminder is created, not after it
// silently fails to appear. Two placements, because the two causes belong next to
// different controls:
//   • cause 'weekends'/'holidays'/'skipUntil' → the Repeat row, since it comes
//     from the reminder-type participation settings, not from this schedule.
//   • cause 'schedule' → the specific schedule subsection whose values caused it.
// Always names the next day it WILL appear: for a schedule mismatch that is
// reassurance (the reminder is working), and for an exclusion it is the answer
// the user actually wants.

// Full weekday and month names — this is prose, not a compact label. The year is
// included whenever the date falls outside the current year, and ALWAYS for a
// yearly reminder, where "Monday, January 25" would otherwise read like a date
// days away rather than next year's occurrence.
function remNextDateLabel(d, alwaysYear) {
  if (!d) return null;
  const showYear = alwaysYear || d.getFullYear() !== new Date().getFullYear();
  return d.toLocaleDateString([], showYear
    ? { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
    : { weekday: 'long', month: 'long', day: 'numeric' });
}
// The settings-based reasons that apply right now, joined with "and", in the
// order the switches appear in the UI. Holidays name themselves and say which
// kind they are — "the Christmas Day holiday" vs "your Family Day custom
// holiday" — so the user knows where to go to change it.
function remReasonPhrase(v) {
  const parts = [];
  if (v.causes.includes('weekends')) parts.push('weekends');
  if (v.causes.includes('holidays')) {
    parts.push(v.holidayName
      ? (v.holidayCustom ? `your ${v.holidayName} custom holiday` : `the ${v.holidayName} holiday`)
      : 'holidays');
  }
  return parts.join(' and ');
}

function RemVisibilityNote({ task, state, kind, id }) {
  const v = task && TASKS.todayVisibility
    ? TASKS.todayVisibility(task, state.reminderOpts, state.holidays)
    : null;
  const never = !!v && !v.visible && !v.next;
  const note = (() => {
  if (!v || v.visible) return null;
  // No eligible day EVER (e.g. a weekly reminder set only to Sat/Sun while
  // weekends are excluded). That is a dead reminder, not a deferred one, so it
  // gets a red warning instead of the calm advisory — and it is routed to the
  // schedule subsection, because the day/date control is what the user can
  // actually change to fix it.
  const settingsCauses = v.causes.filter((c) => c === 'weekends' || c === 'holidays' || c === 'skipUntil');
  const fromSettings = !never && settingsCauses.length > 0;
  const placement = fromSettings ? 'settings' : 'schedule';
  if (kind !== placement) return null;
  if (never) {
    const why = <>Reminders items are currently set to <strong>not show on {remReasonPhrase(v) || 'weekends'}</strong></>;
    return (
      <p className="rem-vis-note is-never" id={id}>
        <strong>WARNING:</strong> Because of the values that you are using and because {why}, this
        item will <strong>never</strong> show in the Today list.
      </p>
    );
  }
  const when = remNextDateLabel(v.next, task.repeat === 'annual');
  const kindWord = TASKS.isRecurring(task) ? 'recurring' : 'one-time';
  let body;
  const phrase = remReasonPhrase(v);
  if (phrase) {
    // Covers weekends, holidays, or both — "…on weekends and Christmas Day".
    body = <>Because Reminders are set to <strong>not show {kindWord} items on {phrase}</strong>, this item will not show up in the list today.</>;
  } else if (v.cause === 'skipUntil') {
    body = <>This item is <strong>skipped</strong> until a later date, so it will not show up in the list today.</>;
  } else {
    body = <>Because of the values that you are using, this item will not show up in the list today.</>;
  }
  return (
    <p className="rem-vis-note" id={id}>
      {body}{when ? <> It will next appear on <strong>{when}</strong>.</> : null}
    </p>
  );
  })();
  // Live region, mounted even when there is nothing to say. These notes appear
  // and change as a direct result of the user editing a schedule control, and a
  // region that mounts together WITH its text is announced unreliably — a
  // stable, already-present one is not. Assertive only for the dead-config
  // "never shows" case; a deferral is advisory and shouldn't interrupt typing.
  return (
    <div className="rem-vis-live" role="status" aria-live={never ? 'assertive' : 'polite'}>{note}</div>
  );
}

// ── Scheduling editor ───────────────────────────────────────────────────────
// Live-edits an existing task via actions.updateTask. Repeat kind is a
// segmented control; the detail control below it swaps to match the kind.
function ReminderEditor({ task, actions, animateExtra = false, state }) {
  const set = (patch) => actions.updateTask(task.id, patch);
  // While collapsing back to "once", keep rendering the last non-once fields so
  // the subsection has content to animate out instead of blanking instantly.
  const lastExtraRepeat = React.useRef(task.repeat === 'once' ? 'interval' : task.repeat);
  if (task.repeat !== 'once') lastExtraRepeat.current = task.repeat;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayAbbr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  // Interval reminders count from a start date (`anchor`); the user can amend
  // it if they got it wrong. The link toggles an inline native date picker.
  const [editAnchor, setEditAnchor] = React.useState(false);
  const anchorIso = task.anchor || task.createdAt;
  const anchorLabel = (() => {
    const [y, m, d] = (anchorIso || '').split('-').map(Number);
    const dt = (y && m && d) ? new Date(y, m - 1, d) : new Date();
    return dt.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  })();

  // Ids so the advisory can double as the accessible DESCRIPTION of the control
  // that caused it: a live region alone is silent when the editor opens with the
  // note already present, and the note is not a tab stop. Only one schedule
  // subsection renders at a time, so one id each is enough.
  const schedNoteId = `rem-vis-sched-${task.id}`;
  const setNoteId = `rem-vis-set-${task.id}`;

  const extraFields = (() => {
  const rep = task.repeat === 'once' ? lastExtraRepeat.current : task.repeat;
  return (
    <React.Fragment>
      {rep === 'weekly' && (
        <div className="rem-field">
          <div className="rem-flabel-wrap">
            <label className="rem-flabel">On these days</label>
            <span className="rem-flabel-sub">
              {(task.daysOfWeek && task.daysOfWeek.length)
                ? <>shows on the Today tab <strong>every {[...task.daysOfWeek].sort((a, b) => a - b).map((d) => dayAbbr[d]).join(', ')}</strong></>
                : 'pick at least one day'}
            </span>
          </div>
          <WeekdayChips value={task.daysOfWeek || []} onChange={(d) => set({ daysOfWeek: d })} describedBy={schedNoteId} />
        {state && <RemVisibilityNote task={task} state={state} kind="schedule" id={schedNoteId} />}
        </div>
      )}

      {rep === 'interval' && (
        <div className="rem-field">
          <div className="rem-flabel-wrap">
            <label className="rem-flabel">Frequency</label>
            <span className="rem-flabel-sub">shows on the Today tab <strong>every {task.interval || 1} days</strong></span>
          </div>
          <div className="rem-inline">
            <span>Every</span>
            <input className="np-input rem-num" type="number" min="1" max="365"
                   aria-describedby={schedNoteId}
                   value={task.interval || 1}
                   onChange={(e) => set({ interval: Math.max(1, parseInt(e.target.value) || 1) })} />
            <span>days</span>
          </div>
          <p className="rem-hint">
            Counted from{' '}
            {editAnchor ? (
              <input className="rem-date-inline" type="date" value={anchorIso} autoFocus
                     onChange={(e) => { if (e.target.value) set({ anchor: e.target.value }); }}
                     onBlur={() => setEditAnchor(false)}
                     onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); setEditAnchor(false); } }} />
            ) : (
              <>
                <button type="button" className="rem-date-link" aria-describedby={schedNoteId} onClick={() => setEditAnchor(true)}>
                  {anchorLabel}
                </button>.
              </>
            )}
          </p>
        {state && <RemVisibilityNote task={task} state={state} kind="schedule" id={schedNoteId} />}
        </div>
      )}

      {rep === 'monthly' && (
        <div className="rem-field">
          <div className="rem-flabel-wrap">
            <label className="rem-flabel">Day of the month</label>
            <span className="rem-flabel-sub">shows on the Today tab <strong>every {ordinalLabel(task.dayOfMonth || 1)} of the month</strong></span>
          </div>
          <div className="rem-inline">
            <span>On the</span>
            <select className="np-input rem-sel" aria-describedby={schedNoteId} value={task.dayOfMonth || 1}
                    onChange={(e) => set({ dayOfMonth: parseInt(e.target.value) })}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>{ordinalLabel(d)}</option>
              ))}
            </select>
          </div>
          {(task.dayOfMonth || 1) > 28 && (
            <p className="rem-hint">In shorter months this falls on the last day.</p>
          )}
        {state && <RemVisibilityNote task={task} state={state} kind="schedule" id={schedNoteId} />}
        </div>
      )}

      {rep === 'annual' && (
        <div className="rem-field">
          <div className="rem-flabel-wrap">
            <label className="rem-flabel">Date each year</label>
            <span className="rem-flabel-sub">shows on the Today tab <strong>every {fullMonthNames[(task.month || 1) - 1]} {task.day || 1}</strong></span>
          </div>
          <div className="rem-inline">
            <select className="np-input rem-sel" aria-describedby={schedNoteId} value={task.month || 1}
                    onChange={(e) => set({ month: parseInt(e.target.value) })}>
              {monthNames.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
            <select className="np-input rem-sel" aria-describedby={schedNoteId} value={task.day || 1}
                    onChange={(e) => set({ day: parseInt(e.target.value) })}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        {state && <RemVisibilityNote task={task} state={state} kind="schedule" id={schedNoteId} />}
        </div>
      )}
    </React.Fragment>
  );
  })();

  return (
    <div className="rem-editor">
      <div className="rem-field">
        <div className="rem-flabel-wrap">
          <label className="rem-flabel">Repeat</label>
          <span className="rem-flabel-sub set-sub-fade" key={task.repeat}>{(REPEAT_OPTS.find((o) => o.key === task.repeat) || {}).sub}</span>
        </div>
        <Segmented options={REPEAT_OPTS} value={task.repeat}
                   onChange={(key) => set({ repeat: key })} ariaLabel="Repeat" describedBy={setNoteId} />
        {state && <RemVisibilityNote task={task} state={state} kind="settings" id={setNoteId} />}
      </div>

      {animateExtra
        ? <Collapse open={task.repeat !== 'once'}><div className="rem-extra-fade" key={task.repeat === 'once' ? lastExtraRepeat.current : task.repeat}>{extraFields}</div></Collapse>
        : extraFields}
    </div>
  );
}

function ordinalLabel(n) {
  const s = ['th', 'st', 'nd', 'rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Shared editor footer for a saved reminder (Today + Data). Delete is confirm-
// gated inline: clicking it morphs just this footer row into a prompt, leaving
// the schedule editor above intact (so a tall editor doesn't collapse). Cancel
// reverts to a snapshot taken when the editor opened; Done keeps the changes.
// Kept in one place so both tabs stay exact copies.
function ReminderEditFoot({ task, onDelete, onDone, onCancel, isNew }) {
  // Snapshot the task as it was when the editor opened (this footer mounts with
  // the editor), so Cancel can restore it after live edits.
  const orig = React.useRef(task);
  const [confirm, setConfirm] = React.useState(false);
  // Set the instant Save/Cancel/Delete explicitly runs, so the implicit-close
  // effect below doesn't ALSO fire for an action that already handled itself.
  const doneRef = React.useRef(false);
  const cancelNow = () => { doneRef.current = true; onCancel(orig.current); };
  const doneNow = () => { doneRef.current = true; onDone(); };
  const deleteNow = () => { doneRef.current = true; onDelete(); };
  // A brand-new, not-yet-kept reminder (isNew) should be discarded if its
  // editor closes ANY other way — switching to a different reminder, the
  // Items list collapsing, navigating to another tab, ... — not just an
  // explicit Cancel. Mirrors the Today tab's "provisional until Save" editors.
  React.useEffect(() => () => { if (isNew && !doneRef.current) onCancel(orig.current); }, []);
  // Escape = Cancel (discards live edits), except while the delete confirm is up,
  // where it just backs out of the confirm.
  useEscapeCancel(true, () => { if (confirm) setConfirm(false); else cancelNow(); });
  if (confirm) {
    return (
      <div className="rem-inline-foot rem-foot-confirm" key="confirm">
        <span className="rem-del-msg">Delete this reminder?</span>
        <div className="rem-del-actions">
          <Btn kind="ghost" size="sm" onClick={() => setConfirm(false)}>Cancel</Btn>
          <Btn kind="danger" size="sm" onClick={deleteNow}>Delete</Btn>
        </div>
      </div>
    );
  }
  return (
    <div className="rem-inline-foot rd-edit-foot" key="foot">
      {!isNew && <Btn kind="danger" size="sm" icon="trash" onClick={() => setConfirm(true)}>Delete</Btn>}
      <div className="rem-foot-right">
        <Btn kind="ghost" size="sm" onClick={cancelNow}>Cancel</Btn>
        <Btn kind="ghost" size="sm" onClick={doneNow}>Save</Btn>
      </div>
    </div>
  );
}

// Today inline editor for a SAVED reminder. Edits a LOCAL draft (never the store)
// so changing the schedule — e.g. moving a weekly reminder off today — doesn't
// immediately filter the row out of the live list; the change only lands on Save.
function ReminderInlineEdit({ task, onClose, onDelete, commit, state }) {
  const [draft, setDraft] = React.useState(() => ({ ...task }));
  const draftActions = { updateTask: (_id, patch) => setDraft((d) => ({ ...d, ...patch })) };
  return (
    <div className="rem-inline-editor">
      <ReminderEditor task={draft} actions={draftActions} animateExtra state={state} />
      <ReminderEditFoot task={draft}
        onDelete={onDelete}
        onCancel={() => onClose()}
        onDone={() => { commit(draft); onClose(); }} />
    </div>
  );
}

// ── Today: a single reminder row ────────────────────────────────────────────
// Matches EntryCard's structure: the whole row toggles done; the actions area
// (edit / delete) is click-isolated. Schedule summary sits where a picker
// entry shows its picker name.
function ReminderCard({ task, actions, justChecked, isOpen, onEdit, onToggle, onRename, onSkip, isSkipping, extraClass = '', onAnimEnd, date, isTutorial, onPlayTutorial }) {
  // Mini-tour launcher: a still-hidden sample reminder from the Welcome Tour,
  // offered as a "try this" card. No skip/edit, and clicking it never marks
  // it done — Play (or the card itself) starts the mini-tour; X permanently
  // discards the sample.
  if (isTutorial) {
    const text = OB_REMINDER_CARD_TEXT[task.id] || { kicker: '', name: task.name };
    const onRowClick = (e) => {
      if (e.target.closest('.today-card-actions')) return;
      onPlayTutorial('reminder', task.id);
    };
    return (
      <article className="today-card rem-card today-card--tutorial" onClick={onRowClick}>
        <button type="button" className="check" aria-label={`Start the ${text.name} tutorial`}
                onClick={(e) => { e.stopPropagation(); onPlayTutorial('reminder', task.id); }}>
          <Icon name="play" size={13} />
        </button>
        <div className="today-card-body">
          <div className="today-card-meta rem-meta">
            <span className="meta-picker">{text.kicker}</span>
          </div>
          <div className="today-card-name">{text.name}</div>
        </div>
        <div className="today-card-actions">
          <button className="icon-btn" onClick={(e) => { e.stopPropagation(); actions.removeTask(task.id); }}
                  aria-label="Cancel tutorial" title="Cancel">
            <Icon name="x" size={15} />
          </button>
        </div>
      </article>
    );
  }
  const done = TASKS.isDoneToday(task, date);
  const fresh = justChecked === task.id && done;
  const handleRowClick = (e) => {
    if (e.target.closest('.today-card-actions')) return;
    if (e.target.closest('.rem-card-name-input')) return;
    onToggle(task);
  };
  return (
    <article className={`today-card rem-card ${done ? 'is-done' : ''} ${fresh ? 'is-fresh' : ''} ${isOpen ? 'is-editing' : ''} ${extraClass}`}
             onClick={handleRowClick} onAnimationEnd={onAnimEnd}>
      <button type="button" className="check" aria-pressed={!!done}
              aria-label={`${done ? 'Unmark' : 'Mark'} ${task.name} complete`}
              onClick={(e) => { e.stopPropagation(); onToggle(task); }}>
        <span className="check-ripple" aria-hidden="true" />
        {done && <Icon name="check" size={14} />}
      </button>
      <div className="today-card-body">
        <div className="today-card-meta rem-meta">
          <Icon name={task.repeat === 'once' ? 'pin' : 'calendar'} size={12} />
          <span className="meta-picker">{TASKS.summary(task)}</span>
        </div>
        {isOpen ? (
          <input className="rem-card-name-input" type="text" value={task.name} maxLength={60}
                 placeholder="Reminder name" autoComplete="off" aria-label="Reminder name"
                 autoFocus
                 onClick={(e) => e.stopPropagation()}
                 onChange={(e) => onRename(e.target.value)}
                 onBlur={(e) => { const n = e.target.value.trim(); if (n !== task.name) onRename(n); }}
                 onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} />
        ) : (
          <div className="today-card-name">{task.name}</div>
        )}
      </div>
      <div className="today-card-actions">
        <button className={`icon-btn ${isSkipping ? 'is-on' : ''}`} aria-label="Skip reminder" title="Skip"
                onClick={(e) => { e.stopPropagation(); onSkip(); }}>
          <Icon name="skip" size={15} />
        </button>
        <button className={`icon-btn ${isOpen ? 'is-on' : ''}`} aria-label="Edit reminder" title="Edit"
                aria-expanded={isOpen}
                onClick={(e) => { e.stopPropagation(); onEdit(); }}>
          <Icon name="edit" size={15} />
        </button>
      </div>
    </article>
  );
}

// ── Today: the Reminders section (list + inline edit + quick add) ───────────
function ReminderSection({ state, actions, sectionRef, editMode, onGripDown, logOpen, onToggleLog, leavingTaskIds, arrivingTaskIds, activeEditor, setActiveEditor, onPlayTutorial }) {
  // Pinned to the last generation, not live "now" — a reminder due on a new
  // day shouldn't appear until the generator (auto or manual Regenerate)
  // actually runs on/after that day. See TASKS.anchorDate.
  const anchor = TASKS.anchorDate(state.today && state.today.generatedAt);
  const due = TASKS.visibleToday(state.tasks, state.reminderOpts, state.holidays, anchor);
  // Mini-tour launcher cards: one per still-hidden sample reminder. Kept out
  // of `due` (and its "X of Y" count) since they're not real due reminders —
  // see the `hidden` flag + OB_SAMPLE_TASK_IDS.
  const tutorialTasks = (state.tasks || []).filter((t) => t.hidden && OB_SAMPLE_TASK_IDS.includes(t.id));
  // The quick-add form and each saved reminder's inline editor are both gated
  // off the tab-wide `activeEditor` slot (shared with the picker item editor
  // in tab-today.jsx) so opening any one of them collapses whichever of the
  // others was open. `draftTask` still lives here since it's just the local
  // in-progress data, not the "is this open" flag.
  const adding = activeEditor === 'reminder-add';
  const openId = (typeof activeEditor === 'string' && activeEditor.startsWith('reminder:'))
    ? activeEditor.slice('reminder:'.length) : null;
  // `visible` (not `adding`) gates whether the quick-add form is mounted, so
  // it can stay on-screen for the exit animation even after `activeEditor`
  // has already moved on to a different editor (forced closed from
  // elsewhere) — mirrors the animated close Cancel/Add already play.
  const [visible, setVisible] = React.useState(adding);
  const wasAddingRef = React.useRef(adding);
  const selfClosingRef = React.useRef(false);   // set just before OUR OWN cancel/commit starts the exit anim, so the effect below doesn't also re-trigger it
  const closeTimerRef = React.useRef(null);
  const [draftTask, setDraftTask] = React.useState(null);
  const [addClosing, setAddClosing] = React.useState(false);   // quick-add exit anim
  const [insertId, setInsertId] = React.useState(null);        // newly added card entrance
  const [removingId, setRemovingId] = React.useState(null);    // card collapsing out before delete/skip
  const removeActionRef = React.useRef(null);                  // what to run once the collapse-out ends
  const [skipId, setSkipId] = React.useState(null);
  const [justChecked, setJustChecked] = React.useState(null);
  const inputRef = React.useRef(null);

  React.useEffect(() => { if (adding && inputRef.current) inputRef.current.focus(); }, [adding]);

  React.useEffect(() => {
    if (adding) { setVisible(true); }
    else if (wasAddingRef.current && !selfClosingRef.current) {
      // Another editor opened elsewhere and forced this one closed — play the
      // same exit animation Cancel uses, then discard the in-progress draft.
      clearTimeout(closeTimerRef.current);
      if (reduceMotion()) { setDraftTask(null); setVisible(false); }
      else {
        setAddClosing(true);
        closeTimerRef.current = setTimeout(() => { setDraftTask(null); setAddClosing(false); setVisible(false); }, 180);
      }
    }
    selfClosingRef.current = false;
    wasAddingRef.current = adding;
  }, [adding]);

  // Quick-add holds a full draft task so the same scheduling editor used on an
  // existing reminder can configure recurrence *before* it's created. The
  // editor edits via actions.updateTask; here that just mutates local draft.
  const draftActions = { updateTask: (_id, patch) => setDraftTask((d) => ({ ...d, ...patch })) };
  const startAdd = () => {
    clearTimeout(closeTimerRef.current);   // a pending forced-close discard from a moment ago shouldn't wipe this fresh draft
    setDraftTask(TASKS.defaultTask({ repeat: 'once' }));
    setAddClosing(false);
    setActiveEditor('reminder-add');
  };
  // Only clear the shared slot if it's still ours — it may have already moved
  // on to a different editor (e.g. the animated close below finishes after
  // the user opened something else in the meantime).
  const closeAddSlot = () => setActiveEditor((cur) => cur === 'reminder-add' ? null : cur);
  const cancelAdd = () => {
    selfClosingRef.current = true;
    if (reduceMotion()) { setDraftTask(null); setVisible(false); closeAddSlot(); setAddClosing(false); return; }
    setAddClosing(true);
    closeTimerRef.current = setTimeout(() => { setDraftTask(null); setVisible(false); closeAddSlot(); setAddClosing(false); }, 180);
  };

  const onToggle = (task) => {
    const wasDone = TASKS.isDoneToday(task, anchor);
    actions.toggleTaskDone(task.id);
    if (!wasDone) {
      setJustChecked(task.id);
      setTimeout(() => setJustChecked((p) => p === task.id ? null : p), 700);
    }
  };

  // After a successful add, say what happened — especially when the new reminder
  // will NOT appear today, where silence is indistinguishable from a failed save.
  const [addedMsg, setAddedMsg] = React.useState(null);
  const addedTimer = React.useRef(null);
  React.useEffect(() => () => clearTimeout(addedTimer.current), []);
  const announceAdded = (task) => {
    const v = TASKS.todayVisibility(task, state.reminderOpts, state.holidays);
    const when = remNextDateLabel(v.next, task.repeat === 'annual');
    setAddedMsg(v.visible
      ? { ok: true, text: `"${task.name}" added.` }
      : { ok: false, text: `"${task.name}" added, but it will not show today${when ? ` — it will next appear on ${when}` : ''}.` });
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAddedMsg(null), v.visible ? 3000 : 9000);
  };

  const committingRef = React.useRef(false);
  const commit = () => {
    const name = (draftTask?.name || '').trim();
    if (!name || committingRef.current) return;   // guard: ignore rapid double-click
    committingRef.current = true;
    selfClosingRef.current = true;
    const newId = draftTask.id;
    const finish = () => {
      actions.addTask({ ...draftTask, name });
      announceAdded({ ...draftTask, name });
      setInsertId(newId);   // play the entrance on the new card
      setDraftTask(null);
      setVisible(false);
      closeAddSlot();
      setAddClosing(false);
      setTimeout(() => { committingRef.current = false; }, 500);
    };
    if (reduceMotion()) { finish(); return; }
    setAddClosing(true);   // collapse the quick-add out, then reveal the new card
    closeTimerRef.current = setTimeout(finish, 180);
  };

  // Escape discards the quick-add regardless of what's been typed or which of
  // its controls has focus.
  useEscapeCancel(visible && !addClosing, cancelAdd);

  const doneCount = due.filter((t) => TASKS.isDoneToday(t, anchor)).length;

  return (
    <section className="group-section rem-section" ref={sectionRef}>
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
          <h2 className="group-name">Reminders</h2>
          <span className="group-count">
            <span className="group-done">{doneCount}</span>
            <span className="group-of">of {due.length}</span>
          </span>
          {!editMode && onToggleLog && <DayLogChip open={logOpen} onClick={onToggleLog} />}
        </div>
        {!editMode && (
          <button className="rem-add-btn" onClick={() => { adding ? cancelAdd() : startAdd(); }}
                  aria-label="Add a reminder" title="Add a reminder">
            <Icon name="plus" size={16} />
          </button>
        )}
      </header>

      {!editMode && (
        <Collapse open={!!logOpen}>
          <RemindersLog state={state} onClose={onToggleLog} />
        </Collapse>
      )}

      <div className="today-list">
        {addedMsg && (
          <p className={`rem-added-msg ${addedMsg.ok ? 'is-ok' : 'is-warn'}`} role="status">{addedMsg.text}</p>
        )}
        {visible && draftTask && (
          <div className={`rem-quickadd-wrap ${addClosing ? 'is-closing' : ''}`}>
            <div className="rem-quickadd">
              <input ref={inputRef} className="np-input" type="text" value={draftTask.name} maxLength={60}
                     placeholder="Add a reminder, e.g. Call the dentist"
                     onChange={(e) => setDraftTask((d) => ({ ...d, name: e.target.value }))}
                     onKeyDown={(e) => { if (e.key === 'Enter') commit(); }} />
            </div>
            <div className="rem-inline-editor">
              <ReminderEditor task={draftTask} actions={draftActions} animateExtra state={state} />
              <div className="rem-inline-foot">
                <Btn kind="ghost" size="sm" onClick={cancelAdd}>Cancel</Btn>
                <Btn kind="primary" size="sm" onClick={commit} disabled={!draftTask.name.trim()}>Add</Btn>
              </div>
            </div>
          </div>
        )}
        {tutorialTasks.map((t) => (
          <ReminderCard key={t.id} task={t} actions={actions} isTutorial onPlayTutorial={onPlayTutorial} />
        ))}
        {due.map((t) => (
          <React.Fragment key={t.id}>
            <ReminderCard task={t} actions={actions} justChecked={justChecked} date={anchor}
                          isOpen={openId === t.id} isSkipping={skipId === t.id} onToggle={onToggle}
                          onRename={(name) => actions.renameTask(t.id, name)}
                          extraClass={insertId === t.id ? 'rem-card--insert'
                            : removingId === t.id ? 'rem-card--removing'
                            : (leavingTaskIds && leavingTaskIds.has(t.id)) ? 'rem-card--purging'
                            : (arrivingTaskIds && arrivingTaskIds.has(t.id)) ? 'rem-card--insert' : ''}
                          onAnimEnd={(e) => {
                            if (e.target !== e.currentTarget) return;
                            if (insertId === t.id) setInsertId(null);
                            if (removingId === t.id) {
                              (removeActionRef.current || (() => actions.removeTask(t.id)))();
                              removeActionRef.current = null;
                              setRemovingId(null);
                            }
                          }}
                          onEdit={() => { setActiveEditor((cur) => cur === `reminder:${t.id}` ? null : `reminder:${t.id}`); setSkipId(null); }}
                          onSkip={() => {
                            setSkipId((id) => id === t.id ? null : t.id);
                            setActiveEditor((cur) => (typeof cur === 'string' && cur.startsWith('reminder:')) ? null : cur);
                          }} />
            <Collapse open={openId === t.id}>
              <ReminderInlineEdit task={t} state={state}
                onClose={() => setActiveEditor((cur) => cur === `reminder:${t.id}` ? null : cur)}
                onDelete={() => {
                  setActiveEditor((cur) => cur === `reminder:${t.id}` ? null : cur);
                  if (reduceMotion()) { actions.removeTask(t.id); return; }
                  removeActionRef.current = () => actions.removeTask(t.id);
                  setRemovingId(t.id);   // card plays collapse-out, then removeTask on animEnd
                }}
                commit={(draft) => actions.updateTask(t.id, draft)} />
            </Collapse>
            <Collapse open={skipId === t.id}>
              {(() => {
              const next = TASKS.nextEligible(t, state.reminderOpts, state.holidays);
              const tomorrow = TASKS.isoOf(new Date(Date.now() + 86400000));
              const nextIso = next ? TASKS.isoOf(next) : null;
              const label = !next ? null
                : (nextIso === tomorrow ? 'tomorrow'
                   : next.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }));
              return (
                <div className="rem-skip-confirm">
                  {label ? (
                    <>
                      <div className="rem-skip-msg">Skip until <strong>{label}</strong>?</div>
                      <div className="rem-skip-actions">
                        <Btn kind="ghost" size="sm" onClick={() => setSkipId(null)}>Cancel</Btn>
                        <Btn kind="primary" size="sm"
                             onClick={() => {
                               setSkipId(null);
                               if (reduceMotion()) { actions.skipTask(t.id, nextIso); return; }
                               removeActionRef.current = () => actions.skipTask(t.id, nextIso);
                               setRemovingId(t.id);   // reuse the card collapse-out, then skip on animEnd
                             }}>Confirm</Btn>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="rem-skip-msg">No upcoming eligible day to skip to.</div>
                      <div className="rem-skip-actions">
                        <Btn kind="ghost" size="sm" onClick={() => setSkipId(null)}>Close</Btn>
                      </div>
                    </>
                  )}
                </div>
              );
              })()}
            </Collapse>
          </React.Fragment>
        ))}

        {due.length === 0 && !adding && (
          <button className="rem-empty" onClick={startAdd}>
            <Icon name="plus" size={14} />
            <span>Add a reminder &mdash; a one-off to-do or a recurring task.</span>
          </button>
        )}
      </div>
    </section>
  );
}

// ── Data tab: full reminder management ──────────────────────────────────────
// Per-type reminder participation switches, in display order. (Moved here from
// the Settings tab so all reminder editing lives together in the Data tab.)
// Dynamic sub-explanation for a paired one-time/recurring toggle row: reflects
// which of the two types the setting applies to. `verb` is the trailing clause.
const remPairSub = (verb, neitherConj = 'and') => (once, recur) =>
  once && recur ? <><strong>both</strong> one-time and recurring items will {verb}</>
  : once ? <><strong>only</strong> one-time items will {verb}</>
  : recur ? <><strong>only</strong> recurring items will {verb}</>
  : <><strong>neither</strong> one-time {neitherConj} recurring items will {verb}</>;

const REMINDER_OPT_DEFS = [
  { key: 'streak', label: 'Counts toward day streak', dyn: remPairSub('trigger the day streak in the Today tab', 'nor') },
  { key: 'ring', label: 'Include in completion ring', dyn: remPairSub('trigger the completion ring in the Today tab', 'nor') },
  { key: 'excludeWeekends', label: 'Exclude on weekends', dyn: remPairSub('show in the Today tab on weekends', 'nor') },
  { key: 'excludeHolidays', label: 'Exclude on holidays', dyn: remPairSub('show in the Today tab on holidays', 'nor') },
  { key: 'stats', label: 'Include in Stats', dyn: (once, recur) =>
    once && recur ? <><strong>both</strong> one-time and recurring item statistics will be shown in the Stats tab</>
    : once ? <><strong>only</strong> one-time item statistics will be shown in the Stats tab</>
    : recur ? <><strong>only</strong> recurring item statistics will be shown in the Stats tab</>
    : <><strong>neither</strong> one-time nor recurring item statistics will be shown in the Stats tab</> },
];
const REMINDER_TYPE_DEFS = [
  { type: 'once', label: 'One-time', icon: 'pin', blurb: 'A single to-do that sits on Today until done.' },
  { type: 'recurring', label: 'Recurring', icon: 'calendar', blurb: 'Weekly, interval, monthly or yearly tasks.' },
];

// Reminders Controls body (the participation matrix). Rendered only while the
// Controls disclosure is open, so it snapshots the options on mount — Cancel
// reverts every toggle changed since opening; Save keeps them. Mirrors the
// picker Controls' Cancel/Save (no Delete — these are global settings).
function ReminderControls({ opts, actions, onCollapse }) {
  const snap = React.useRef({ once: { ...opts.once }, recurring: { ...opts.recurring } });
  const cancel = () => { actions.setReminderOpts(snap.current); onCollapse(); };
  return (
    <div className="rd-matrix">
      <div className="rd-mx-head">
        <span></span>
        <span className="rd-mx-col">One-time</span>
        <span className="rd-mx-col">Recurring</span>
      </div>
      {REMINDER_OPT_DEFS.map((o) => (
        <div key={o.key} className="rd-mx-row">
          <span className="rd-mx-name">
            {o.label}
            {o.dyn
              ? <span className="rd-mx-sub set-sub-fade" key={(opts.once[o.key] ? 1 : 0) + '' + (opts.recurring[o.key] ? 1 : 0)}>{o.dyn(!!opts.once[o.key], !!opts.recurring[o.key])}</span>
              : (o.sub && <span className="rd-mx-sub">{o.sub}</span>)}
          </span>
          {['once', 'recurring'].map((type) => {
            const on = !!opts[type][o.key];
            return (
              <span key={type} className="rd-mx-cell">
                <button className={`switch ${on ? 'is-on' : ''}`} aria-pressed={on}
                        aria-label={`${type === 'once' ? 'One-time' : 'Recurring'}: ${o.label}`}
                        onClick={() => actions.setReminderOpt(type, o.key, !on)}><i /></button>
              </span>
            );
          })}
        </div>
      ))}
      <div className="rd-mx-foot">
        <div className="rem-foot-right">
          <Btn kind="ghost" size="sm" onClick={cancel}>Cancel</Btn>
          <Btn kind="ghost" size="sm" onClick={onCollapse}>Save</Btn>
        </div>
      </div>
    </div>
  );
}

function ReminderManager({ state, actions, hidden }) {
  const [openId, setOpenId] = React.useState(null);
  // Tracks a reminder that was just created via “New reminder” and hasn't been
  // kept yet. Cancel on such an item discards the whole add (removes it) rather
  // than reverting to the empty snapshot; cleared once the item is kept.
  const justAddedRef = React.useRef(null);
  // Id of a just-inserted reminder row, so it plays the slide-in entrance once.
  const [insertId, setInsertId] = React.useState(null);
  const tasks = (state.tasks || []).filter((t) => !t.hidden);
  const opts = TASKS.normalizeOpts(state.reminderOpts);
  // Main section collapse persists (like the pickers) so it survives tab
  // switches. Reserved key '__reminders_main'; defaults COLLAPSED, so absent =
  // collapsed and explicit false = expanded.
  const collapsedMainMap = (state.ui && state.ui.controlsCollapsed) || {};
  const open = collapsedMainMap['__reminders_main'] === false;
  const setOpen = () => actions.toggleControlsCollapsed('__reminders_main', true);
  // Controls sub-panel collapse is remembered per section (persisted). Reminders
  // uses the reserved id '__reminders'; the Items list uses '__reminders:items'.
  // Absent = open (default).
  const collapsedMap = (state.ui && state.ui.controlsCollapsed) || {};
  const ctlCollapsed = !!collapsedMap['__reminders'];
  const itemsCollapsed = !!collapsedMap['__reminders:items'];

  const addAndEdit = () => {
    if (justAddedRef.current) return;   // guard: ignore rapid double-click
    const id = 'tk_' + Math.random().toString(36).slice(2, 8);
    actions.addTask({ id, name: 'New reminder', repeat: 'once' });
    justAddedRef.current = id;   // Cancel on a brand-new reminder removes it
    setInsertId(id);
    setOpenId(id);
    if (!open) actions.toggleControlsCollapsed('__reminders_main', true);
  };

  return (
    <section className="cat cat--reminders cat--enter" style={hidden ? { display: 'none' } : undefined}>
      <header className="cat-h">
        <button type="button" className="cat-h-l" aria-expanded={open} onClick={setOpen}>
          <span className={`chev ${open ? 'is-open' : ''}`}><Icon name="chev" size={14} /></span>
          <h3 className="cat-name">Reminders</h3>
          <span className="cat-count">{tasks.length}</span>
        </button>
      </header>
      <Collapse open={open}>
        <div className="cat-body">
          {/* Controls — nested collapsible; open by default, collapse remembered
              per section. The matrix pivots the 5 participation settings across
              the two reminder types (moved here from Settings). */}
          <button type="button" className="rd-ctl" aria-expanded={!ctlCollapsed}
               onClick={() => actions.toggleControlsCollapsed('__reminders')}>
            <span className="rd-ctl-l">
              <span className={`chev ${ctlCollapsed ? '' : 'is-open'}`}><Icon name="chev" size={12} /></span>
              <span className="kicker">Controls</span>
            </span>
            {ctlCollapsed && <span className="rd-ctl-sum">{REMINDER_OPT_DEFS.length} settings</span>}
          </button>
          <Collapse open={!ctlCollapsed}>
            <ReminderControls opts={opts} actions={actions}
                              onCollapse={() => actions.toggleControlsCollapsed('__reminders')} />
          </Collapse>

          {/* Items — collapsible (open by default, remembered per section), same
              disclosure as Controls. Full-bleed rows (type icon + name +
              schedule); the whole row expands into the exact Today editor. */}
          <button type="button" className="rd-ctl" aria-expanded={!itemsCollapsed}
               onClick={() => actions.toggleControlsCollapsed('__reminders:items')}>
            <span className="rd-ctl-l">
              <span className={`chev ${itemsCollapsed ? '' : 'is-open'}`}><Icon name="chev" size={12} /></span>
              <span className="kicker">Items</span>
            </span>
            {itemsCollapsed && <span className="rd-ctl-sum">{tasks.length} items</span>}
          </button>
          <Collapse open={!itemsCollapsed}>
            <React.Fragment>
              <button className="rd-add" onClick={addAndEdit}>
                <Icon name="plus" size={13} /> New reminder
              </button>
              {tasks.length === 0 ? (
                <div className="rd-empty">No reminders yet. Add one to see it on Today.</div>
              ) : (
                tasks.map((t) => {
              const cardOpen = openId === t.id;
              const once = t.repeat === 'once';
              return (
                <div key={t.id} className={`rd-item ${cardOpen ? 'is-editing' : ''} ${insertId === t.id ? 'rd-item--insert' : ''}`}
                     onAnimationEnd={() => { if (insertId === t.id) setInsertId(null); }}>
                  <button type="button" className="rd-row" aria-expanded={cardOpen}
                       onClick={() => setOpenId(cardOpen ? null : t.id)}>
                    <span className={`rd-ico ${once ? 'is-once' : ''}`}>
                      <Icon name={once ? 'pin' : 'calendar'} size={15} />
                    </span>
                    <span className="rd-main">
                      {cardOpen ? (
                        <input className="rd-name-input" type="text" value={t.name} maxLength={60}
                               placeholder="Reminder name" aria-label="Reminder name" autoFocus
                               onClick={(e) => e.stopPropagation()}
                               onChange={(e) => actions.updateTask(t.id, { name: e.target.value })}
                               onBlur={(e) => { const n = e.target.value.trim(); if (n) actions.renameTask(t.id, n); }}
                               onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} />
                      ) : (
                        <React.Fragment>
                          <span className="rd-name">{t.name}</span>
                          <span className="rd-sched">{TASKS.summary(t)}</span>
                        </React.Fragment>
                      )}
                    </span>
                    <span className={`rd-chev chev ${cardOpen ? 'is-open' : ''}`} aria-hidden="true">
                      <Icon name="chev" size={16} />
                    </span>
                  </button>
                  <Collapse open={cardOpen}>
                    <div className="rd-edit">
                      <div className="rem-inline-editor">
                        <ReminderEditor task={t} actions={actions} animateExtra state={state} />
                        <ReminderEditFoot task={t} isNew={justAddedRef.current === t.id}
                          onDelete={() => {
                            if (justAddedRef.current === t.id) justAddedRef.current = null;
                            const rid = t.id;
                            // Only close OUR row — this can fire well after the user has
                            // already switched to a different reminder's editor (isNew's
                            // implicit-close discard is deferred to unmount), so a bare
                            // setOpenId(null) would clobber whichever one is now open.
                            setOpenId((cur) => cur === t.id ? null : cur);
                            if (reduceMotion()) { actions.removeTask(rid); return; }
                            setTimeout(() => actions.removeTask(rid), 280);
                          }}
                          onCancel={(snap) => {
                            if (justAddedRef.current === t.id) {
                              // Discard a brand-new reminder, but let the editor play the
                              // collapse-close animation (as Save does) before removing it.
                              justAddedRef.current = null;
                              const rid = t.id;
                              setOpenId((cur) => cur === t.id ? null : cur);
                              setTimeout(() => actions.removeTask(rid), 280);
                            } else {
                              actions.replaceTask(t.id, snap);
                              setOpenId((cur) => cur === t.id ? null : cur);
                            }
                          }}
                          onDone={() => {
                            if (justAddedRef.current === t.id) justAddedRef.current = null;
                            setOpenId((cur) => cur === t.id ? null : cur);
                          }} />
                      </div>
                    </div>
                  </Collapse>
                </div>
              );
            })
          )}
            </React.Fragment>
          </Collapse>
        </div>
      </Collapse>
    </section>
  );
}

export { ReminderSection, ReminderManager, Segmented };
