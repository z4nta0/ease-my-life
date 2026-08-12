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
    body: <>You can click this logo any time to jump back to the top of your todo list.</>,
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
    // perElement (see help-mode.jsx): every real entry card gets its own
    // badge — a user could be looking at any card on the page, not just
    // whichever one happened to be first, and the main help toggle can be
    // clicked from anywhere regardless of scroll position.
    id: 'cardCheck', sel: '.today-card:not(.today-card--tutorial) .check', perElement: true, title: 'Mark Complete',
    body: (
      <>
        <p>When you click this circle, it marks the item as completed and updates the progress ring's completed count. When all items are completed, your Day Streak increases and the celebration animations will play.</p>
        <p>For items that belong to a picker with updatable values, marking as complete will also apply updates to all of the pickers' items. Dynamic Weighted items wil have their boost value increased or reset to 0. Ease-up and Ease-down items will have their charge values increased or decreased, respectively.</p>
      </>
    ),
  },
  {
    // Reminders and picker-generated entries share the same .today-card-
    // actions markup but not the same buttons (reminders have no Re-roll —
    // there's nothing to re-roll TO, it's a fixed task, not a random pick),
    // so this needs two separate items rather than one shared description.
    // Also excludes day-off and charging cards — both render a
    // .today-card-actions row too, but with Re-roll and/or Edit genuinely
    // disabled (the app's own InfoTip there says "This action is disabled
    // for this type of item"), which this tip's copy doesn't describe.
    // perElement (see help-mode.jsx) so every OTHER card gets its own badge
    // — a single shared one could land on a card whose buttons happen to
    // be in an unusual state, or just not be near wherever the user
    // actually scrolled to.
    id: 'cardActionsPicker', sel: '.today-card:not(.rem-card):not(.today-card--tutorial):not(.today-card--dayoff):not(.today-card--charging) .today-card-actions', perElement: true, title: 'Card Actions',
    body: (
      <>
        <p><b>Re-roll:</b> This button swaps this item for a different one from the same picker, without waiting for the next generation.</p>
        <p><b>Skip:</b> This button removes this item from your todo list without completing it and updates the progress ring's total count accordingly.</p>
        <p><b>Edit:</b> This button adjusts this item's properties. That includes its name, schedule (reminders only), values (pickers only) and active toggle (pickers only).</p>
      </>
    ),
  },
  {
    id: 'cardActionsReminder', sel: '.rem-card .today-card-actions', perElement: true, title: 'Card Actions',
    body: (
      <>
        <p><b>Skip:</b> This button removes this item from your todo list without completing it and updates the progress ring's total count accordingly.</p>
        <p><b>Edit:</b> This button adjusts this item's properties. That includes its name, schedule (reminders only), values (pickers only) and active toggle (pickers only).</p>
      </>
    ),
  },
  {
    // A day-off card (a conditional's triggered "rest" state) is excluded
    // from cardActionsPicker above since it doesn't have the normal 3-
    // button set — but unlike a charging card (where Re-roll/Skip/Edit are
    // ALL genuinely disabled, nothing real to highlight), a day-off card's
    // own Skip IS a real, working button — only Re-roll and Edit are
    // disabled there. `button` (not .icon-btn generally) specifically
    // targets that one real button — the disabled Re-roll/Edit are
    // InfoTip's own <span> root, not a <button>, so this selector can't
    // accidentally catch them.
    id: 'cardActionsDayOff', sel: '.today-card--dayoff .today-card-actions button', perElement: true, title: 'Skip',
    body: <>This button removes this day off from your todo list without completing it and updates the progress ring's total count accordingly. Re-roll and Edit are disabled for this type of card.</>,
  },
  // ── Editing a picker item's full settings (EntryEditor) — reachable from
  // Today's own Edit button too, not just the Data tab (DATA_HELP_ITEMS has
  // its own copy of these same 6 items, scoped identically via
  // .entry-editor — that class is shared verbatim by both tabs since it's
  // literally the same EntryEditor component either way). Item Name is the
  // one exception: Today's own name field lives right on the card
  // (.entry-card-name-input, EntryCard's own markup), not inside
  // .entry-editor like Data's .rd-name-input does.
  {
    id: 'itemName', sel: '.entry-card-name-input', title: 'Item Name',
    body: <>This is the name field for this item, you can rename it here.</>,
  },
  {
    id: 'itemChargeRange', sel: '.entry-editor .pie-ease-row', title: 'Charge Range',
    body: <>This controls how quickly this item's charge builds up or drains, depending on the picker's mode. For Ease-up pickers, Soonest/Latest set the fewest/most days before this item becomes eligible to be picked. For Ease-down pickers, Shortest/Longest set the fewest/most days it stays picked once chosen. The Fill/Refill button instantly maxes out this item's charge.</>,
  },
  {
    id: 'itemWeight', sel: '.entry-editor .pie-row:has(.weight-stepper)', title: 'Weight',
    body: <>This adjusts this item's pick chance relative to the picker's other items. A higher weight makes it more likely to be picked; a lower weight makes it less likely.</>,
  },
  {
    id: 'itemBoost', sel: '.entry-editor .pie-row:has(.pie-boost-val)', title: 'Boost',
    body: <>This is the item's current boost, which climbs by 1 each time it isn't picked and resets to 0 the next time it is. A higher boost makes it more likely to be picked. Reset clears it back to 0.</>,
  },
  {
    id: 'itemActive', sel: '.entry-editor .pie-row:has(.switch)', title: 'Active',
    body: <>This toggles whether this item is eligible to be picked. Turning it off sends the item on vacation, removing it from the picker's pool until it's turned back on.</>,
  },
  {
    id: 'itemFoot', sel: '.entry-editor .rd-edit-foot .btn', title: 'Delete / Cancel / Save',
    body: (
      <>
        <p><b>Delete:</b> This button permanently deletes this item, after asking you to confirm.</p>
        <p><b>Cancel:</b> This button discards any changes and closes this editor without saving.</p>
        <p><b>Save:</b> This button saves your changes to this item.</p>
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
    body: <>This is the name field for your new reminder, give it a short, descriptive name. This is what will show up on your todo list.</>,
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
  // ── Editing an EXISTING reminder (ReminderCard's name input + the
  // ReminderInlineEdit/ReminderEditFoot pair it expands into) — same
  // underlying editor as Add a Reminder above, so these reuse its exact
  // copy where the content is identical (name field, repeat schedule).
  // The only real difference: Save replaces Add (no "stays disabled"
  // caveat — Save has no disabled state, unlike Add), and there's a
  // Delete button Add's form doesn't have.
  {
    id: 'editReminderName', sel: '.rem-card-name-input', title: 'Reminder Name',
    body: <>This is the name field for your reminder, give it a short, descriptive name. This is what will show up on your todo list.</>,
  },
  {
    // .rem-inline-editor is shared markup used by THREE different editors:
    // the Add Reminder quick-add form (already covered above, under its
    // own .rem-quickadd-wrap scope), an existing reminder's own editor
    // (this item), AND a picker item's EntryEditor (tab-today.jsx), whose
    // root carries an EXTRA entry-editor class specifically so it can be
    // excluded here — :not(.entry-editor) is what actually picks out "an
    // existing reminder's editor, not a picker item's".
    id: 'editReminderRepeat', sel: '.rem-inline-editor:not(.entry-editor) .rem-editor', title: 'Repeat Schedule',
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
    // BUG FIXED HERE: this used to be the unscoped '.rd-edit-foot .btn',
    // which — since .rd-edit-foot is the SAME class a picker item's own
    // EntryEditor footer uses — was ALSO matching that footer on the Today
    // tab, showing this reminder-specific copy ("this reminder...") on a
    // picker item's Delete/Cancel/Save instead of itemFoot's own "this
    // item..." copy just below. .rem-inline-editor:not(.entry-editor) (see
    // editReminderRepeat's own comment) properly scopes this to an actual
    // reminder's editor. Only matches in the NORMAL footer state — Delete's
    // own confirm prompt swaps in a different class (.rem-foot-confirm), so
    // this gracefully has nothing to highlight while that's up, same as
    // any other transient confirm state elsewhere in this catalog.
    id: 'editReminderFoot', sel: '.rem-inline-editor:not(.entry-editor) .rd-edit-foot .btn', title: 'Delete / Cancel / Save',
    body: (
      <>
        <p><b>Delete:</b> This button permanently deletes this reminder, after asking you to confirm.</p>
        <p><b>Cancel:</b> This button discards any changes and closes this editor without saving.</p>
        <p><b>Save:</b> This button saves your changes to this reminder and updates it on your todo list.</p>
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
    // perElement (see help-mode.jsx) gives each group's OWN Log button its
    // own badge, since the user could be scrolled to any one of them.
    id: 'dayLogPicker', sel: '.group-section:not(.rem-section):not(.pt-section) .dl-chip', perElement: true, title: 'Section Log',
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
  // drag data-row font styling onto the header labels. columnGroup (see
  // help-mode.jsx) makes the 3 highlights meet edge-to-edge with no gap or
  // overlap between them, rather than each shrinking to its own content.
  {
    id: 'logReminderName', sel: '.dl-mk-rname', columnGroup: 'reminderLogCols', title: 'Reminder Column',
    body: <>This lists every reminder you've created, whether it's due today or not.</>,
  },
  {
    id: 'logReminderWhen', sel: '.dl-mk-rwhen', columnGroup: 'reminderLogCols', title: 'When Column',
    body: <>This shows each reminder's schedule. That includes how often it repeats, or if it's only a one-time reminder.</>,
  },
  {
    id: 'logReminderStatus', sel: '.dl-mk-rst', columnGroup: 'reminderLogCols', title: 'Status Column',
    body: <>This shows whether this reminder is done, due today, skipped for today, or when it will next come due.</>,
  },
  // ── Picker/Conditional Log panel (day-log.jsx's GroupLog) — dl-mk-* here
  // are the same kind of dedicated hooks. Deliberately TWO separate column
  // groups (picker item rows vs. Conditionals section rows) rather than one
  // shared set: the Conditionals section has its own full-width "Rested:
  // .../Attached: ..." line between rows, which a single highlight spanning
  // BOTH sections would otherwise stretch across, making it look like that
  // unrelated text was part of the column.
  {
    id: 'logPickerKey', sel: '.dl-key', title: 'Key',
    body: (
      <>
        <p>This explains the icons that are used in the Status column below.</p>
        <p><b>Auto-picked:</b> This indicates that an item was chosen automatically by the daily generator.</p>
        <p><b>Pushed:</b> This indicates that an item was pushed onto your todo list manually from the Pickers page.</p>
        <p><b>Rolled off:</b> This indicates that an item was on your todo list but was then replaced by another item via the Re-roll button.</p>
        <p><b>Skipped:</b> This indicates that an item was on your todo list but was then removed via the Skip button.</p>
        <p><b>Completed:</b> This indicates that the item is on your todo list and has been marked as completed.</p>
      </>
    ),
  },
  {
    id: 'logPickerItem', sel: '.dl-block:not(.dl-cond-sec) .dl-mk-item', columnGroup: 'pickerLogCols', title: 'Item Column',
    body: <>This lists every item in this picker's pool. It also shows its weight (Weighted), weight + boost (Dynamic Weighted) or eligible range (Ease-up or Ease-down), depending on the picker's mode.</>,
  },
  {
    id: 'logPickerAtGen', sel: '.dl-block:not(.dl-cond-sec) .dl-mk-atgen', columnGroup: 'pickerLogCols', title: 'At Gen Column',
    body: <>This lists the item's value at the moment your todo list was generated. This only applies to Dynamic Weighted, Ease-up and Ease-down picker items, it shows N/A otherwise.</>,
  },
  {
    id: 'logPickerDelta', sel: '.dl-block:not(.dl-cond-sec) .dl-mk-delta', columnGroup: 'pickerLogCols', title: 'Δ Column',
    body: <>This shows how much this item's value changed since your todo list was generated. This only applies to Dynamic Weighted, Ease-up and Ease-down picker items.</>,
  },
  {
    id: 'logPickerAfter', sel: '.dl-block:not(.dl-cond-sec) .dl-mk-after', columnGroup: 'pickerLogCols', title: 'After Column',
    body: <>This shows the item's current value, reflecting updated values due to the current item being marked as completed in your todo list.</>,
  },
  {
    id: 'logPickerStatus', sel: '.dl-block:not(.dl-cond-sec) .dl-mk-status', columnGroup: 'pickerLogCols', title: 'Status Column',
    body: <>This shows any relevant icons that reflect what has happened to this item today. Please see the KEY row above for what each icon means.</>,
  },
  {
    id: 'logCondItem', sel: '.dl-cond-sec .dl-mk-item', columnGroup: 'condLogCols', title: 'Conditional Column',
    body: <>This lists every conditional attached to a picker in this group. It also shows its odds of being triggered or its charge range, depending on its mode.</>,
  },
  {
    id: 'logCondAtGen', sel: '.dl-cond-sec .dl-mk-atgen', columnGroup: 'condLogCols', title: 'At Gen Column',
    body: <>This lists the conditional's value at the moment your todo list was generated. This only applies to Dynamic Weighted, Ease-up and Ease-down conditionals, it shows N/A otherwise.</>,
  },
  {
    id: 'logCondDelta', sel: '.dl-cond-sec .dl-mk-delta', columnGroup: 'condLogCols', title: 'Δ Column',
    body: <>This shows how much this conditional's value changed since your todo list was generated. This only applies to Dynamic Weighted, Ease-up and Ease-down conditionals.</>,
  },
  {
    id: 'logCondAfter', sel: '.dl-cond-sec .dl-mk-after', columnGroup: 'condLogCols', title: 'After Column',
    body: <>This shows the conditional's current value, reflecting any change from a dependent picker's item being marked as completed in your todo list.</>,
  },
  {
    id: 'logCondStatus', sel: '.dl-cond-sec .dl-mk-status', columnGroup: 'condLogCols', title: 'Status Column',
    body: <>This shows whether this conditional is currently triggered (its dependent pickers are resting today) or not.</>,
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
  // ── Editing an individual picker item (EntryEditor, defined in
  // tab-today.jsx but reused here — see .entry-editor's own doc comment
  // there). Which of these actually renders depends on the OWNING
  // PICKER's mode, so most items below only ever show up for some modes:
  // Charge Range (Ease-up/Ease-down only), Weight (Weighted/Dynamic
  // Weighted), Boost (Dynamic Weighted only). Active and the footer
  // always render regardless of mode.
  {
    // .rd-name-input is also used by the Conditionals section's own name
    // field (same .rd-item wrapper shape) — :has(.entry-editor) picks out
    // only a .rd-item that's actually an ITEM editor, since .entry-editor
    // is unique to EntryEditor and never rendered for a conditional.
    id: 'itemName', sel: '.rd-item:has(.entry-editor) .rd-name-input', title: 'Item Name',
    body: <>This is the name field for this item, you can rename it here.</>,
  },
  {
    id: 'itemChargeRange', sel: '.entry-editor .pie-ease-row', title: 'Charge Range',
    body: <>This controls how quickly this item's charge builds up or drains, depending on the picker's mode. For Ease-up pickers, Soonest/Latest set the fewest/most days before this item becomes eligible to be picked. For Ease-down pickers, Shortest/Longest set the fewest/most days it stays picked once chosen. The Fill/Refill button instantly maxes out this item's charge.</>,
  },
  {
    id: 'itemWeight', sel: '.entry-editor .pie-row:has(.weight-stepper)', title: 'Weight',
    body: <>This adjusts this item's pick chance relative to the picker's other items. A higher weight makes it more likely to be picked; a lower weight makes it less likely.</>,
  },
  {
    id: 'itemBoost', sel: '.entry-editor .pie-row:has(.pie-boost-val)', title: 'Boost',
    body: <>This is the item's current boost, which climbs by 1 each time it isn't picked and resets to 0 the next time it is. A higher boost makes it more likely to be picked. Reset clears it back to 0.</>,
  },
  {
    id: 'itemActive', sel: '.entry-editor .pie-row:has(.switch)', title: 'Active',
    body: <>This toggles whether this item is eligible to be picked. Turning it off sends the item on vacation, removing it from the picker's pool until it's turned back on.</>,
  },
  {
    id: 'itemFoot', sel: '.entry-editor .rd-edit-foot .btn', title: 'Delete / Cancel / Save',
    body: (
      <>
        <p><b>Delete:</b> This button permanently deletes this item, after asking you to confirm.</p>
        <p><b>Cancel:</b> This button discards any changes and closes this editor without saving.</p>
        <p><b>Save:</b> This button saves your changes to this item.</p>
      </>
    ),
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
