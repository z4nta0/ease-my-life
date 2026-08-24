import { OB_SAMPLE_PICKER_IDS, OB_SAMPLE_TASK_IDS } from './onboarding-seed-data.js';

// Onboarding checklist — the full "todo list" of mini-tour launcher cards
// shown on Today after the main Welcome Tour ends, plus the one closing
// "Generate a real list" card. Every item's resolution lives in one place,
// state.onboarding.checklist: { [itemId]: { status, createdId? } }, where
// status is 'finished' | 'skipped' | 'cancelled' — set instantly by X
// (cancelled), by skipping mid-mini-tour (skipped), or by finishing a
// mini-tour (finished, with createdId pointing at the real picker/task it
// produced, for sample items only). state.onboarding.checklistDone flips
// true once the Generate card's own flow completes — every card here stops
// rendering at that point, in one shot.
//
// Sample data (see onboarding-seed-data.js) is never deleted or re-hidden by
// any of this — it's hidden exactly once, at the main tour's last step, and
// stays that way forever. Resolving/unresolving a card only ever touches
// this checklist map, never the sample itself, which is what makes
// unchecking a card (to redo its mini-tour) free — nothing needs restoring.
//
// Three item kinds:
//   'sample'   — one of the Welcome Tour's sample pickers/reminders. Built
//                programmatically from OB_SAMPLE_PICKER_IDS/
//                OB_SAMPLE_TASK_IDS, so a new sample card needs no changes
//                here.
//   'pageTour' — an "Explore the {page}" tour, not tied to any sample
//                picker/reminder — no data to finish/skip/cancel, just the
//                same checklist bookkeeping. Rendered in their own "Page
//                Tours" section on Today (see tab-today.jsx), between
//                Reminders and the picker groups.
//   'generate' — the single closing card. Fixed id below.
export const OB_GENERATE_ITEM_ID = 'ob_generate';

// One entry per page tour, in the order their cards/tours should appear.
// `page` matches the `data-tab` value on that page's nav button (see
// app.jsx's TabBar) — not used yet, but it's what each tour's own "explore"
// step will target once built.
// time is a real, user-confirmed estimate (manually timed 2026-08-14) shown
// on the tour's Today launcher card (see tab-today.jsx's PageTourCard).
export const OB_PAGE_TOURS = [
  { id: 'explore_today', page: 'today', label: 'Today', time: '1 min' },
  { id: 'explore_pickers', page: 'picker', label: 'Pickers', time: '1.5 min' },
  { id: 'explore_stats', page: 'stats', label: 'Stats', time: '1 min' },
  { id: 'explore_data', page: 'data', label: 'Data', time: '< 1 min' },
  { id: 'explore_settings', page: 'settings', label: 'Settings', time: '1 min' },
];

const CHECKLIST_ITEMS = [
  ...OB_SAMPLE_PICKER_IDS.map((id) => ({ id, kind: 'sample', entityKind: 'picker' })),
  ...OB_SAMPLE_TASK_IDS.map((id) => ({ id, kind: 'sample', entityKind: 'task' })),
  ...OB_PAGE_TOURS.map((t) => ({ id: t.id, kind: 'pageTour' })),
  { id: OB_GENERATE_ITEM_ID, kind: 'generate' },
];

const entryFor = (state, id) => (state.onboarding && state.onboarding.checklist || {})[id] || null;

// { total, done, remaining, complete } across every known checklist item —
// "done" means resolved (any status), regardless of which of the 3 paths.
function checklistStatus(state) {
  const total = CHECKLIST_ITEMS.length;
  const done = CHECKLIST_ITEMS.filter((item) => !!entryFor(state, item.id)).length;
  return { total, done, remaining: total - done, complete: done === total };
}

// How many real (non-sample) pickers currently exist — the Generate card
// (and every still-open "Create a picker" card's amber "needs attention"
// cue) stays gated on this being >= 1, so there's always at least one real
// picker for the real generate to draw from. Checks actual EXISTENCE in
// state.pickers, not checklist status — a picker's own checklist entry can
// go from 'finished' back to unresolved (uncheck) or to 'cancelled'/
// 'skipped' (X, or Skip on a replay) without the real picker it already
// created ever being deleted (see store.jsx's addPicker replaceId comment),
// so checking status here would wrongly re-flag cards as needing attention
// even though real data already exists. Counts hidden ones too — a picker
// created while the mini-tour checklist is still up stays hidden only until
// the closing Generate step (see tab-today.jsx's generateItemResolved
// effect), at which point it becomes exactly the real data this is asking
// about.
function realPickerCount(state) {
  return state.pickers.filter((p) => !OB_SAMPLE_PICKER_IDS.includes(p.id)).length;
}

// How many checklist items OTHER than the Generate card itself are still
// unresolved — used both by readyToGenerate below and by the Generate
// card's own dynamic explanation text (see tab-today.jsx).
function othersRemaining(state) {
  return CHECKLIST_ITEMS.filter((item) => item.id !== OB_GENERATE_ITEM_ID && !entryFor(state, item.id)).length;
}

// The Generate card is actionable once every OTHER item is resolved AND at
// least one real picker exists — see realPickerCount above. It's still
// visible before that, just blocked.
function readyToGenerate(state) {
  return othersRemaining(state) === 0 && realPickerCount(state) >= 1;
}

// Whether we're anywhere between the Welcome Tour's very first step and the
// closing Generate card's flow actually completing — used to gate every
// "add new X" control (reminders, pickers, conditionals, picker items) that
// would otherwise let a user create real data mid-tutorial, before the
// sample data every step is narrating has even finished being reviewed. True
// for the tour's ENTIRE run (checked via activeTour, since mainTourEnded
// below doesn't flip until the tour's next-to-last step hides the samples),
// then true again straight through the mini-tour checklist phase until
// checklistDone. False afterward, including for a Replay (checklistDone
// never resets, see tab-today.jsx) and false for any existing user who
// upgraded into a build with onboarding and so never had sample data seeded
// at all — mainTourEnded requires actual hidden samples to exist, which
// protects that case independent of checklistDone's own backfilled-false
// default for legacy saves (see store.jsx's migrate).
function tutorialsInProgress(state) {
  const ob = state.onboarding;
  if (!ob) return false;
  if (ob.activeTour && ob.activeTour.id === 'welcome') return true;
  const mainTourEnded = state.pickers.some((p) => p.hidden && OB_SAMPLE_PICKER_IDS.includes(p.id))
    || (state.tasks || []).some((t) => t.hidden && OB_SAMPLE_TASK_IDS.includes(t.id));
  return mainTourEnded && !ob.checklistDone;
}

export const OB_CHECKLIST = {
  items: CHECKLIST_ITEMS,
  status: checklistStatus,
  entryFor,
  realPickerCount,
  othersRemaining,
  readyToGenerate,
  tutorialsInProgress,
};
