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
//   'pageTour' — a future "Explore the {page}" tour, not tied to any sample
//                picker/reminder (no data to finish/skip/cancel, just the
//                same checklist bookkeeping). Add a manifest entry here
//                whenever one is built — nothing else changes.
//   'generate' — the single closing card. Fixed id below.
export const OB_GENERATE_ITEM_ID = 'ob_generate';

const CHECKLIST_ITEMS = [
  ...OB_SAMPLE_PICKER_IDS.map((id) => ({ id, kind: 'sample', entityKind: 'picker' })),
  ...OB_SAMPLE_TASK_IDS.map((id) => ({ id, kind: 'sample', entityKind: 'task' })),
  // Page-exploration tours land here as they're built, e.g.:
  // { id: 'explore_pickers', kind: 'pageTour' },
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

// How many sample pickers have been actually FINISHED (not skipped/
// cancelled) — the Generate card (and every still-open "Create a picker"
// card) stays gated on this being >= 1, so there's always at least one real
// picker for the real generate to draw from.
function finishedPickerCount(state) {
  return OB_SAMPLE_PICKER_IDS.filter((id) => {
    const e = entryFor(state, id);
    return e && e.status === 'finished';
  }).length;
}

// The Generate card is actionable once every OTHER item is resolved AND at
// least one picker was actually finished (not just skipped/cancelled) — see
// finishedPickerCount above. It's still visible before that, just blocked.
function readyToGenerate(state) {
  const othersRemaining = CHECKLIST_ITEMS
    .filter((item) => item.id !== OB_GENERATE_ITEM_ID && !entryFor(state, item.id)).length;
  return othersRemaining === 0 && finishedPickerCount(state) >= 1;
}

export const OB_CHECKLIST = {
  items: CHECKLIST_ITEMS,
  status: checklistStatus,
  entryFor,
  finishedPickerCount,
  readyToGenerate,
};
