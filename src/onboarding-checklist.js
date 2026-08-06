import { OB_SAMPLE_PICKER_IDS, OB_SAMPLE_TASK_IDS } from './onboarding-seed-data.js';

// Onboarding checklist — replaces the old `onboarding.dismissed` flag as the
// signal for "is the user still mid-onboarding" (see tab-today.jsx's
// obShowCreate/obShowEmpty/obShowNoRun). Deliberately open-ended: every item
// below is either fully DERIVED from existing state (sample picker/reminder
// cards — no new persisted field needed) or backed by one small piece of
// state added for it (page-exploration tours — see `toursDone` below).
//
// Two item kinds:
//   'sample'   — one of the Welcome Tour's sample pickers/reminders (see
//                onboarding-seed-data.js). Built programmatically from
//                OB_SAMPLE_PICKER_IDS/OB_SAMPLE_TASK_IDS, so a new sample
//                card needs no changes here. "Done" means its mini-tour
//                launcher card is gone — either finished (unhidden) or X'd
//                (deleted); both are resolutions, tracked identically.
//   'pageTour' — a future "Explore the {page}" tour, not tied to any sample
//                picker/reminder. Nothing else marks these done, so they're
//                tracked in state.onboarding.toursDone (an array of tour
//                ids, set via actions.markTourDone). Add a manifest entry
//                here + one markTourDone(id) call at that tour's own finish
//                point whenever a new one is built — nothing else changes.
const CHECKLIST_ITEMS = [
  ...OB_SAMPLE_PICKER_IDS.map((id) => ({ id, kind: 'sample', entityKind: 'picker' })),
  ...OB_SAMPLE_TASK_IDS.map((id) => ({ id, kind: 'sample', entityKind: 'task' })),
  // Page-exploration tours land here as they're built, e.g.:
  // { id: 'explore_pickers', kind: 'pageTour' },
];

function isItemDone(item, state) {
  if (item.kind === 'pageTour') {
    return (state.onboarding && state.onboarding.toursDone || []).includes(item.id);
  }
  // 'sample': done once it's no longer a still-hidden sample — either
  // unhidden (mini-tour finished) or deleted entirely (X'd away).
  const list = item.entityKind === 'picker' ? state.pickers : state.tasks;
  const entity = (list || []).find((e) => e.id === item.id);
  return !entity || !entity.hidden;
}

// { total, done, remaining, complete } across every known checklist item.
function checklistStatus(state) {
  const total = CHECKLIST_ITEMS.length;
  const done = CHECKLIST_ITEMS.filter((item) => isItemDone(item, state)).length;
  return { total, done, remaining: total - done, complete: done === total };
}

export const OB_CHECKLIST = { items: CHECKLIST_ITEMS, status: checklistStatus };
