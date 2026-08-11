import React from 'react';

// Per-page { id, sel, shape?, title, body } catalogs for the on-demand help
// mode (see help-mode.jsx). Copy is largely forked from
// onboarding-page-tours.jsx's own PICKER_PAGE_TARGETS / STATS_PAGE_TARGETS /
// DATA_PAGE_TARGETS / SETTINGS_PAGE_TARGETS catalogs — same targets, same
// underlying explanation — with directive tour language ("click Next",
// "click Done when ready", "these buttons are disabled for this tutorial")
// stripped out, since a help-mode tip has no steps to advance through and
// nothing it points at is ever disabled. See the onboarding-engine-reuse-
// design memory's "Shared content unit" section for why this forking (not a
// shared import) was the intended plan once real content rollout began.
//
// One item per DISTINCT piece of functionality, not one per DOM element —
// e.g. a card's Re-roll/Skip/Edit icons share one tip (a numbered list)
// rather than three, and a group of filter pills gets one tip explaining
// what the whole row does rather than one per pill. Kept in its own module
// (rather than inline per-tab like the original 2-item Today test case) so
// every tab can import from one place and so future content edits don't
// require touching each tab file.

const TODAY_HELP_ITEMS = [
  {
    id: 'progressRing', sel: '.ring', shape: 'circle', title: 'Progress Ring',
    body: <>This tracks your current progress of completed / total tasks for today's todo list. Once filled completely, your Day Streak will increase and the celebration animations will play.</>,
  },
  {
    id: 'brandMark', sel: '.today-h-lead .brand-mark', title: 'Home',
    body: <>Click this logo any time to jump back to the top of your todo list.</>,
  },
  {
    id: 'streak', sel: '.streak', title: 'Day Streak',
    body: <>This counts how many days in a row you've completed everything on your todo list. Missing a day resets it back to zero.</>,
  },
  {
    id: 'groupsNav', sel: '.group-rail ul', title: 'List Navigation',
    body: <>This is the todo list's navigation, allowing you to jump directly to a group's section. Over time your list can grow quite long and this helps to eliminate any long scrolling.</>,
  },
  {
    id: 'editMode', sel: '.em-rail-btn, .foot-editmode', title: 'Edit Mode',
    body: <>This lets you rearrange the positions of the groups and items, as well as rename the groups.</>,
  },
  {
    id: 'cardCheck', sel: '.rem-section .today-card:first-of-type .check', title: 'Mark Complete',
    body: (
      <>
        <p>Clicking this circle marks an item as completed and updates the progress ring's completed count. When all items are completed, your Day Streak increase and celebration animations will play.</p>
        <p>For items that belong to a picker with updatable values, marking as complete will also apply updates to all of the pickers' items. Dynamic Weighted items wil have their boost value increased or reset to 0. Ease-up and Ease-down items will have their charge values increased or decreased, respectively.</p>
      </>
    ),
  },
  {
    // Reminders and picker-generated entries share the same .today-card-
    // actions markup but not the same buttons (reminders have no Re-roll —
    // there's nothing to re-roll TO, it's a fixed task, not a random pick),
    // so this needs two separate items rather than one shared description.
    // firstOnly (see help-mode.jsx) rather than :first-of-type here — picker
    // entries are scattered across however many group sections the user
    // has, and :first-of-type resets per section instead of picking one
    // overall.
    id: 'cardActionsPicker', sel: '.today-card:not(.rem-card):not(.today-card--tutorial) .today-card-actions', firstOnly: true, title: 'Card Actions',
    body: (
      <>
        <p><b>Re-roll:</b> swaps this item for a different one from the same picker, without waiting for the next generation.</p>
        <p><b>Skip:</b> removes this item from today's list without completing it and updates the progress ring's total count accordingly.</p>
        <p><b>Edit:</b> adjusts this item's properties. This includes its name, schedule (reminders only), values (pickers only) and active toggle (pickers only).</p>
      </>
    ),
  },
  {
    id: 'cardActionsReminder', sel: '.rem-card:first-of-type .today-card-actions', title: 'Card Actions',
    body: (
      <>
        <p><b>Skip:</b> removes this item from today's list without completing it and updates the progress ring's total count accordingly.</p>
        <p><b>Edit:</b> adjusts this item's properties. This includes its name, schedule (reminders only), values (pickers only) and active toggle (pickers only).</p>
      </>
    ),
  },
  {
    id: 'addReminder', sel: '.rem-add-btn', title: 'Add a Reminder',
    body: <>This creates a new one-time or recurring reminder. Reminders are separate from pickers since some tasks cannot be randomly chosen and must be done on a schedule (recurring reminder) or are a one-time thing (one-time reminder).</>,
  },
  {
    // Scoped to .rem-quickadd specifically, NOT the wider .rem-quickadd-wrap
    // — .np-input is reused by the Repeat editor's own extra fields (the
    // Every N Days number input, the Monthly/Yearly selects), so the wider
    // scope was unioning the name field with whichever of those happened to
    // be visible, stretching this highlight down into the Repeat section.
    id: 'addReminderName', sel: '.rem-quickadd .np-input', title: 'Reminder Name',
    body: <>Give your reminder a short, descriptive name. This is what will show up on your todo list.</>,
  },
  {
    // .rem-editor (not just .seg, the pill row) so this always covers
    // whatever extra fields the current selection reveals below the pills
    // (the weekday chips for Weekly, the day/date pickers for the others) —
    // every option's own extra fields, not just whichever ones happened to
    // share a class with the Reminder Name field above. No pinBelowSel here
    // (unlike a first attempt at this) — the highlighted rect IS .rem-editor
    // itself, so the tip's normal "below the target" placement already
    // tracks its own bottom edge as it grows/shrinks with the selection,
    // without needing to pin to some other, unrelated element.
    id: 'addReminderRepeat', sel: '.rem-quickadd-wrap .rem-editor', title: 'Repeat Schedule',
    body: (
      <>
        <p><b>Once:</b> This reminder stays on your todo list every day until you complete it, then it's gone for good.</p>
        <p><b>Every N Days:</b> This reminder will show up on your todo list every N days, counted from the start date that you select below.</p>
        <p><b>Weekly:</b> This reminder will show up on your todo list every week on the days that you select below.</p>
        <p><b>Monthly:</b> This reminder will show up on your todo list every month on the day that you select below.</p>
        <p><b>Yearly:</b> This reminder will show up on your todo list every year on the date that you select below.</p>
      </>
    ),
  },
  {
    // .btn, not the .rem-inline-foot row itself — that row is
    // right-aligned/space-between and wider than its own buttons, which
    // left a big empty gap included in the highlight.
    id: 'addReminderFoot', sel: '.rem-quickadd-wrap .rem-inline-foot .btn', title: 'Cancel / Add',
    body: (
      <>
        <p><b>Cancel:</b> This button discards the reminder form without saving anything.</p>
        <p><b>Add:</b> This button saves the reminder and adds it to your todo list, unless you selected a recurring reminder that is not due today. Stays disabled until at least a name is entered.</p>
      </>
    ),
  },
  {
    id: 'dayLog', sel: '.rem-section .dl-chip', title: 'Section Log',
    body: <>This opens a log of everything that has happened for this section today. Including what was auto-picked, skipped, manually selected, re-rolled, and completed. It will also show the new updated values, if applicable, once an item has been marked as completed.</>,
  },
  {
    // Every OTHER group section (Chores, Food, ...) gets the same Log chip
    // as Reminders — :not(.rem-section):not(.pt-section) excludes Reminders
    // itself (already covered above) and the Page Tours onboarding section.
    // firstOnly (see help-mode.jsx) since a user can have several such
    // groups; this just needs one representative example.
    id: 'dayLogPicker', sel: '.group-section:not(.rem-section):not(.pt-section) .dl-chip', firstOnly: true, title: 'Section Log',
    body: <>This opens a log of everything that has happened for this section today. Including what was auto-picked, skipped, manually selected, re-rolled, and completed. It will also show the new updated values, if applicable, once an item has been marked as completed.</>,
  },
  {
    id: 'regenerate', sel: '.ob-generate', title: 'Regenerate',
    body: <>This re-runs the daily generator manually, replacing your todo list. Anything already marked complete will be replaced too and won't show up in the Stats tab.</>,
  },
  // ── Reminders Log panel (day-log.jsx's RemindersLog) — dl-mk-r* classes
  // are dedicated selector hooks, kept separate from the visually-styled
  // .dl-r-name/.dl-r-when/.dl-r-st classes so adding them to the header row
  // (alongside the data rows, for one column-spanning highlight) doesn't
  // drag data-row font styling onto the header labels.
  {
    id: 'logReminderName', sel: '.dl-mk-rname', title: 'Reminder Column',
    body: <>Lists every reminder you've created, whether it's due today or not.</>,
  },
  {
    id: 'logReminderWhen', sel: '.dl-mk-rwhen', title: 'When Column',
    body: <>Shows each reminder's schedule — how often it repeats, or that it's a one-time reminder.</>,
  },
  {
    id: 'logReminderStatus', sel: '.dl-mk-rst', title: 'Status Column',
    body: <>Shows whether this reminder is done, due today, skipped for today, or not yet due — along with when it will next come due.</>,
  },
  // ── Picker/Conditional Log panel (day-log.jsx's GroupLog) — dl-mk-* here
  // are the same kind of dedicated hooks, shared by both a picker's own
  // item rows and the Conditionals section's rows (they reuse the same
  // ValueCells/.dl-item/.dl-status markup), so each column's highlight
  // naturally spans both.
  {
    id: 'logPickerKey', sel: '.dl-key', title: 'Key',
    body: (
      <>
        <p>This explains the icons used in the Status column below:</p>
        <p><b>Auto-picked:</b> chosen automatically by the daily generator.</p>
        <p><b>Pushed:</b> sent to Today manually, from the Pickers tab.</p>
        <p><b>Rolled off:</b> swapped away via Re-roll.</p>
        <p><b>Skipped:</b> removed from today's list without completing it.</p>
        <p><b>Completed:</b> marked as done.</p>
      </>
    ),
  },
  {
    id: 'logPickerItem', sel: '.dl-mk-item', title: 'Item Column',
    body: <>Lists every item in this picker's pool, along with its weight or eligible range depending on the picker's mode.</>,
  },
  {
    id: 'logPickerAtGen', sel: '.dl-mk-atgen', title: 'At Gen Column',
    body: <>This item's value at the moment today's list was generated. Only applies to Ease-up, Ease-down and Dynamic Weighted pickers — shows N/A otherwise.</>,
  },
  {
    id: 'logPickerDelta', sel: '.dl-mk-delta', title: 'Δ Column',
    body: <>How much this item's value changed since generation — positive when it climbed, negative when it dropped.</>,
  },
  {
    id: 'logPickerAfter', sel: '.dl-mk-after', title: 'After Column',
    body: <>This item's current value, reflecting any changes from being picked, re-rolled, skipped, or completed today.</>,
  },
  {
    id: 'logPickerStatus', sel: '.dl-mk-status', title: 'Status Column',
    body: <>Icons showing what happened to this item today — see the Key above for what each icon means.</>,
  },
];

const PICKER_HELP_ITEMS = [
  {
    id: 'groupFilter', sel: '.picker-groups .picker-group-pill', title: 'Group Filter',
    body: <>This filters the pickers row below by group, which is extremely useful if you have created a lot of pickers.</>,
  },
  {
    id: 'pickerSelection', sel: '.picker-tabs .picker-tab:not(.picker-tab--add)', title: 'Picker Selection',
    body: <>This selects a specific picker, in order to initiate a manual picker generation down below as well as edit or delete its items.</>,
  },
  {
    id: 'createNewPickers', sel: '.picker-tab--add', title: 'Create New Pickers',
    body: <>This is where you can create new pickers.</>,
  },
  {
    id: 'manualGeneration', sel: '.picker-run', title: 'Manual Generation',
    body: <>Pick one runs a manual pick generation for the selected picker, so you don't have to completely rely on the todo list's auto generation. Once it resolves, Send to Today adds the result to your list, or Re-roll tries again.</>,
  },
  {
    id: 'pickerItems', sel: '.pool-items', title: 'Picker Items',
    body: <>Here you can view all items in this picker's pool, including each item's values (if applicable) and its own Send to Today, Edit and Delete buttons.</>,
  },
  {
    id: 'addPickerItem', sel: '.pv-additem-btn', title: 'Add Picker Item',
    body: <>This adds a new item to the selected picker's pool.</>,
  },
];

const STATS_HELP_ITEMS = [
  {
    id: 'groupFilter', sel: '.stat-scope-groups .picker-group-pill', title: 'Group Filter',
    body: <>This filters the pickers row below by group, which is extremely useful if you have created a lot of pickers.</>,
  },
  {
    id: 'pickersFilter', sel: '.stat-scope-tabs .picker-tab', title: 'Pickers Filter',
    body: <>This narrows your selection to specific pickers or reminders, or you can view everything all at once.</>,
  },
  {
    id: 'rangeFilter', sel: '.stat-filter-pills--seg .stat-pill', title: 'Range Filter',
    body: <>This further narrows your selection by date range, with ranges from 1 week to 1 year to all time.</>,
  },
  {
    id: 'heatmap', sel: '.stat-heatmap-card', title: 'Activity Heatmap',
    body: <>This visualizes your completed activity over time, with each day shaded by how much you got done. Click on any day for more details.</>,
  },
  {
    id: 'pickerBreakdown', sel: '.stat-breakdown-card', title: 'Picker Breakdown',
    body: <>Once a specific picker is selected as the scope above, its individual items are broken down here — pick count, pick frequency, last picked date, and more.</>,
  },
];

const DATA_HELP_ITEMS = [
  {
    id: 'groupFilter', sel: '.stat-scope-groups .picker-group-pill', title: 'Group Filter',
    body: <>This filters the pickers row below by group, which is extremely useful if you have created a lot of pickers.</>,
  },
  {
    id: 'pickersFilter', sel: '.stat-scope-tabs .picker-tab', title: 'Pickers Filter',
    body: <>This further narrows exactly what you want to view and edit.</>,
  },
  {
    id: 'remindersManager', sel: '.cat--reminders', title: 'View and Edit Reminders',
    body: <>This is where you can view and edit all of your reminders, as well as create new ones.</>,
  },
  {
    id: 'pickersManager', sel: '.data-list', title: 'View and Edit Pickers',
    body: <>This is where you can view and edit all of your pickers, as well as their containing items. You can also create new picker items here.</>,
  },
];

const SETTINGS_HELP_ITEMS = [
  {
    id: 'appearance', sel: '.set-section--appearance', title: 'App Customization',
    body: <>This is where you can customize the app's look and feel: light, dark and custom theme colors, completion celebration animations, picker pick animations, and tab bar placement.</>,
  },
  {
    id: 'daily', sel: '.set-section--daily', title: 'Daily Generator',
    body: <>This is where you can control the daily generator: turn auto generation on or off, what time it runs, and enabling notifications for when it does.</>,
  },
  {
    id: 'holidays', sel: '.set-section--holidays', title: 'Holiday Controls',
    body: <>This is where you can toggle which holiday observances the pickers and reminders option uses. You can even add your own custom holidays, like your birthday!</>,
  },
  {
    id: 'data', sel: '.set-section--data', title: 'Data Control',
    body: <>This is where you can protect your data from browser deletion, install the app directly to your device, back up your data (export), restore your data (import), or erase all of your data.</>,
  },
  {
    id: 'about', sel: '.set-section--about', title: 'About Ease My Life',
    body: <>This is where you can find information about this app and its developer, replay the welcome tour and all of these tutorials at any time, and contact the developer if you have any problems or suggestions.</>,
  },
  {
    id: 'legal', sel: '.set-section--legal', title: 'Legal Information',
    body: <>This is where you can view the Privacy Policy and Terms of Service.</>,
  },
];

export { TODAY_HELP_ITEMS, PICKER_HELP_ITEMS, STATS_HELP_ITEMS, DATA_HELP_ITEMS, SETTINGS_HELP_ITEMS };
