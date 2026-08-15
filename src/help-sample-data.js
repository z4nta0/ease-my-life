// Disposable sample data for the on-demand help mode (see help-mode.jsx) —
// seeded when a page's help toggle turns on so there's always something
// concrete to point at (a real picker of each mode, a conditional-gated
// picker, reminders covering every recurrence type, a year of pick
// history for Stats), and torn back down the moment it turns off. Same
// "real, interactive, but disposable" idea as onboarding-page-tours.jsx's
// own PAGE_TOUR_SAMPLE_PICKERS — kept as an entirely separate `hlp_`-
// prefixed id namespace (rather than reusing that file's own `pt_` copies)
// so the two features can never collide even if both happened to be
// active at once.
import { OB_EXAMPLE, OB_EXTRA_PICKERS, OB_SAMPLE_PICKER_IDS, hydrateOnboardingStats } from './onboarding-seed-data.js';

const helpId = (id) => `hlp_${id}`;

// The real onboarding samples only cover ease-up/ease-down/dynamic — these
// two round out all 5 picker modes (see seed.js's own MODES) with a
// 'random' and a 'weighted' example.
const HELP_EXTRA_PICKERS = [
  {
    id: 'hlp_pkr_icebreaker',
    name: 'Ice Breaker Questions', group: 'Entertainment', mode: 'random',
    items: [
      { name: 'Would you rather...?', weight: 1 },
      { name: 'Two truths and a lie', weight: 1 },
      { name: 'Favorite childhood memory', weight: 1 },
      { name: 'Dream vacation spot', weight: 1 },
    ],
  },
  {
    id: 'hlp_pkr_movienight',
    name: 'Movie Night Pick', group: 'Entertainment', mode: 'weighted',
    items: [
      { name: 'Action', weight: 3 },
      { name: 'Comedy', weight: 3 },
      { name: 'Horror', weight: 1 },
      { name: 'Documentary', weight: 1 },
      { name: 'Sci-Fi', weight: 2 },
    ],
  },
];

// One conditional (a day-off gate — see conditionals.js's own header
// comment for the model) plus the one picker that depends on it, so
// help mode has a real example of the "this picker can be gated off for
// the day" feature to point at.
const HELP_CONDITIONAL_ID = 'cnd_hlp_restday';
const HELP_CONDITIONAL = {
  id: HELP_CONDITIONAL_ID, name: 'Rest Day', mode: 'ease-up',
  cardText: 'Take a rest day — no yard work today!',
};
const HELP_GATED_PICKER = {
  id: 'hlp_pkr_yardwork', name: 'Yard Work', group: 'Chores', mode: 'ease-up',
  conditionalId: HELP_CONDITIONAL_ID,
  items: [
    { name: 'Mow the lawn', weight: 1, easeMin: 7, easeMax: 10, value: 100 },
    { name: 'Trim the hedges', weight: 1, easeMin: 10, easeMax: 14, value: 100 },
    { name: 'Rake the leaves', weight: 1, easeMin: 5, easeMax: 8, value: 100 },
  ],
};

// One reminder per recurrence kind (see tasks.js's own header comment for
// the 5 `repeat` kinds) — the real onboarding samples only cover
// once/weekly. Data's reminder list shows every reminder regardless of
// whether it's due today, so these don't need engineered due-dates.
const HELP_TASKS = [
  { id: 'hlp_tk_once', name: 'Renew car registration', repeat: 'once' },
  { id: 'hlp_tk_weekly', name: 'Water the plants', repeat: 'weekly', daysOfWeek: [1, 4] },
  { id: 'hlp_tk_interval', name: 'Change the air filter', repeat: 'interval', interval: 30 },
  { id: 'hlp_tk_monthly', name: 'Pay rent', repeat: 'monthly', dayOfMonth: 1 },
  { id: 'hlp_tk_annual', name: 'Anniversary', repeat: 'annual', month: 6, day: 15 },
];

// Pickers + Data pages: real, editable copies of every mode plus the
// conditional-gated example, guarded by existence so re-toggling help mode
// on and off repeatedly can't create duplicate-id pickers.
const seedHelpPickers = (state, actions) => {
  actions.addConditional(HELP_CONDITIONAL);
  [OB_EXAMPLE, ...OB_EXTRA_PICKERS].forEach((p) => {
    const copyId = helpId(p.id);
    if (state.pickers.some((x) => x.id === copyId)) return;
    actions.addPicker({ id: copyId, name: p.name, group: p.group, mode: p.mode,
      items: p.items.map(({ id, ...rest }) => rest) });
  });
  [...HELP_EXTRA_PICKERS, HELP_GATED_PICKER].forEach((p) => {
    if (state.pickers.some((x) => x.id === p.id)) return;
    actions.addPicker(p);
  });
};
const clearHelpPickers = (actions) => {
  [OB_EXAMPLE, ...OB_EXTRA_PICKERS].forEach((p) => actions.removePicker(helpId(p.id)));
  [...HELP_EXTRA_PICKERS, HELP_GATED_PICKER].forEach((p) => actions.removePicker(p.id));
  actions.removeConditional(HELP_CONDITIONAL_ID);
};

// Data page: reminders covering every recurrence kind.
const seedHelpTasks = (state, actions) => {
  HELP_TASKS.forEach((t) => {
    if (state.tasks.some((x) => x.id === t.id)) return;
    actions.addTask(t);
  });
};
const clearHelpTasks = (actions) => {
  HELP_TASKS.forEach((t) => actions.removeTask(t.id));
};

// Stats page: no disposable copy needed (nothing there is editable) — same
// reasoning as the page tour's own unhideSampleHistory. Borrows the REAL
// hidden sample pickers directly so the heatmap/breakdown have a genuine
// year of history to show, and hides them again once help mode turns off.
const unhideHelpStatsHistory = (state, actions) => {
  OB_SAMPLE_PICKER_IDS.forEach((id) => actions.updatePicker(id, { hidden: false }));
  if (!(state.pickLog || []).some((r) => OB_SAMPLE_PICKER_IDS.includes(r.pickerId))) {
    import('./onboarding-stats-data.js').then(({ ONBOARDING_STATS }) => {
      actions.seedHistory(hydrateOnboardingStats(ONBOARDING_STATS));
    });
  }
};
const hideHelpStatsHistory = (actions) => {
  OB_SAMPLE_PICKER_IDS.forEach((id) => actions.updatePicker(id, { hidden: true }));
};

export {
  seedHelpPickers, clearHelpPickers,
  seedHelpTasks, clearHelpTasks,
  unhideHelpStatsHistory, hideHelpStatsHistory,
};
