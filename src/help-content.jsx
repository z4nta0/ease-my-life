import React from 'react';
import { Icon } from './ui.jsx';

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
    id: 'brandMark', sel: '.today-h-lead .brand-mark', title: 'Home Link',
    body: <>You can click this logo at any time to navigate back to the home page of the app, the Today page.</>,
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
    // padX: 4 — .foot-editmode sits right next to .ob-generate (Regenerate)
    // with only a 10px gap between them; the default 8px pad on each side
    // would overlap by 6px.
    id: 'editMode', sel: '.em-rail-btn, .foot-editmode', title: 'Edit Mode', padX: 4,
    body: <>This lets you rearrange the positions of the groups and items, as well as rename the groups.</>,
  },
  {
    // These three only exist in the DOM while Edit Mode is on — same
    // "findTargets returns nothing, item silently skipped" handling as the
    // side-placement rail handle (see help-mode.jsx). perElement: every
    // group's own grip gets its own badge, since a user editing a long
    // list could be looking at any one of them, not just the first.
    id: 'groupGrip', sel: '.group-grip', perElement: true, title: 'Reorder Group',
    body: <>While Edit Mode is on, drag this handle to change this group's position in your todo list.</>,
  },
  {
    id: 'cardGrip', sel: '.card-grip', perElement: true, title: 'Reorder Item',
    body: <>While Edit Mode is on, drag this handle to change this item's position within its group.</>,
  },
  {
    id: 'groupNameEdit', sel: '.group-name--editable', perElement: true, title: 'Rename Group',
    body: <>While Edit Mode is on, click a group's name to rename it.</>,
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
    // Icon + label column per button, same real icon name each button's
    // own <Icon> uses (tab-today.jsx) — mirrors help-mode.jsx's own
    // NAV_HELP_ITEM, reusing its .help-nav-item/.help-nav-label CSS.
    body: (
      <>
        <div className="help-nav-item">
          <div className="help-nav-label"><Icon name="refresh" size={14} /><b>Re-roll:</b></div>
          <p>This button swaps this item for a different one from the same picker, without waiting for the next generation.</p>
        </div>
        <div className="help-nav-item">
          <div className="help-nav-label"><Icon name="skip" size={14} /><b>Skip:</b></div>
          <p>This button removes this item from your todo list without completing it and updates the progress ring's total count accordingly.</p>
        </div>
        <div className="help-nav-item">
          <div className="help-nav-label"><Icon name="edit" size={14} /><b>Edit:</b></div>
          <p>This button adjusts this item's properties. That includes its name, schedule (reminders only), values (pickers only) and active toggle (pickers only).</p>
        </div>
      </>
    ),
  },
  {
    id: 'cardActionsReminder', sel: '.rem-card .today-card-actions', perElement: true, title: 'Card Actions',
    body: (
      <>
        <div className="help-nav-item">
          <div className="help-nav-label"><Icon name="skip" size={14} /><b>Skip:</b></div>
          <p>This button removes this item from your todo list without completing it and updates the progress ring's total count accordingly.</p>
        </div>
        <div className="help-nav-item">
          <div className="help-nav-label"><Icon name="edit" size={14} /><b>Edit:</b></div>
          <p>This button adjusts this item's properties. That includes its name, schedule (reminders only), values (pickers only) and active toggle (pickers only).</p>
        </div>
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
    // Function body (see help-mode.jsx's HelpTip) — reads the picker's own
    // cadence unit word (days/weeks/months/years) straight off the
    // already-rendered .np-ease-unit label instead of hardcoding "days",
    // which would be wrong for a non-daily cadence picker.
    id: 'itemChargeRangeUp', sel: '.entry-editor .pie-ease-up-row', padY: 0, title: 'Item Charge Controls',
    body: () => {
      const unit = document.querySelector('.entry-editor .pie-ease-up-row .np-ease-unit')?.textContent || 'days';
      return (
        <>
          <p><b>Soonest:</b> This controls the minimum number of {unit} that the item must wait before becoming eligible to be picked again.</p>
          <p><b>Latest:</b> This controls the maximum number of {unit} that the item must wait before becoming eligible to be picked again.</p>
          <p><b>Fill:</b> This will fill the item's charge to 100, making it eligible to be picked again.</p>
        </>
      );
    },
  },
  {
    id: 'itemChargeRangeDown', sel: '.entry-editor .pie-ease-down-row', padY: 0, title: 'Item Charge Controls',
    body: () => {
      const unit = document.querySelector('.entry-editor .pie-ease-down-row .np-ease-unit')?.textContent || 'days';
      return (
        <>
          <p><b>Shortest:</b> This controls the minimum number of {unit} that the item must stay as the active pick, after which a new item will be picked.</p>
          <p><b>Longest:</b> This controls the maximum number of {unit} that the item must stay as the active pick, after which a new item will be picked.</p>
          <p><b>Refill:</b> This will refill the item's charge back to 100, effectively resetting its active pick cadence.</p>
        </>
      );
    },
  },
  {
    id: 'itemWeight', sel: '.entry-editor .pie-row:has(.weight-stepper)', padY: 0, title: 'Item Weight',
    body: <>This adjusts this item's pick chance relative to the picker's other items. A higher weight makes it more likely to be picked and a lower weight makes it less likely.</>,
  },
  {
    id: 'itemBoost', sel: '.entry-editor .pie-row:has(.pie-boost-val)', padY: 0, title: 'Item Boost',
    body: <>This is the item's current boost, which climbs by 1 each time it isn't picked and resets to 0 the next time it is. A higher boost makes it more likely to be picked.</>,
  },
  {
    id: 'itemActive', sel: '.entry-editor .pie-row:has(.switch)', padY: 0, title: 'Item Active Toggle',
    body: <>This toggles whether this item is eligible to be picked. Turning it off sends the item on vacation, removing it from the picker's pool until it's turned back on.</>,
  },
  {
    // sel targets .rem-inline-foot (the shared wrapper), not .rd-edit-foot
    // specifically — Delete swaps that sibling out for .rem-foot-confirm
    // (its own Cancel/Delete pair), which a selector scoped to .rd-edit-foot
    // would miss entirely once that swap happens: no dim-mask hole, AND the
    // click-guard would treat its buttons as off-target and block them,
    // making the confirmation genuinely unreachable while help mode is on.
    id: 'itemFoot', sel: '.entry-editor .rem-inline-foot .btn', title: 'Delete / Cancel / Save',
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
    id: 'addReminderRepeat', sel: '.rem-quickadd-wrap .rem-editor', title: 'Reminder Schedule',
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
    // the Add Reminder quick-add form, an existing reminder's own editor
    // (this item), AND a picker item's EntryEditor (tab-today.jsx). The
    // picker-item case is excluded via :not(.entry-editor) (its root
    // carries that extra class) — but :not(.rem-quickadd-wrap *) is ALSO
    // required: .rem-quickadd-wrap merely WRAPS its own .rem-inline-editor,
    // it doesn't stop the bare :not(.entry-editor) check from still
    // matching that inner element too, which produced two overlapping
    // "Reminder Schedule" badges at once whenever the Add Reminder form was
    // open (found via live testing — addReminderRepeat's own comment above
    // claiming this was "already covered, doesn't conflict" was wrong).
    id: 'editReminderRepeat', sel: '.rem-inline-editor:not(.entry-editor):not(.rem-quickadd-wrap *) .rem-editor', title: 'Reminder Schedule',
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
    // reminder's editor. sel targets .rem-inline-foot (the shared wrapper),
    // not .rd-edit-foot specifically — Delete's own confirm prompt swaps in
    // a DIFFERENT sibling class (.rem-foot-confirm), which a selector
    // scoped to .rd-edit-foot would miss entirely: no dim-mask hole, AND
    // the click-guard would treat its Cancel/Delete buttons as off-target
    // and block them, making the confirmation genuinely unreachable while
    // help mode is on — this was wrongly assumed harmless ("gracefully has
    // nothing to highlight") until the user found it actually blocks the
    // click too, not just the highlight.
    // :not(.rem-quickadd-wrap *) — the Add Reminder quickadd form (Today
    // only) uses this exact same .rem-inline-editor > .rem-inline-foot
    // structure for its own Cancel/Add buttons (no rd-edit-foot/
    // rem-foot-confirm distinction there, since a brand-new draft has
    // nothing to delete yet) — widening from .rd-edit-foot to the shared
    // .rem-inline-foot wrapper (see the comment above) would otherwise
    // ALSO match those, duplicating this badge the same way
    // editReminderRepeat's own selector once did.
    id: 'editReminderFoot', sel: '.rem-inline-editor:not(.entry-editor):not(.rem-quickadd-wrap *) .rem-inline-foot .btn', title: 'Delete / Cancel / Save',
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
    // padX: 4 — see editMode's own comment; same gap, same fix, symmetric.
    id: 'regenerate', sel: '.ob-generate', title: 'Regenerate', padX: 4,
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
    id: 'brandMark', sel: '.picker-h-lead .brand-mark', title: 'Home Link',
    body: <>You can click this logo at any time to navigate back to the home page of the app, the Today page.</>,
  },
  {
    id: 'groupFilter', sel: '.picker-groups .picker-group-pill', title: 'Group Filter',
    body: <>This filters the pickers row below by group, which is extremely useful if you have created a lot of pickers.</>,
  },
  {
    // padX: 3 — the add button sits right before the first tab in the same
    // 8px-gap scrollable row; the default 8px pad on each side would
    // overlap by 8px otherwise (same bleed as Today's Edit Mode/Regenerate).
    id: 'pickerSelection', sel: '.picker-tabs .picker-tab:not(.picker-tab--add)', title: 'Picker Selection', padX: 3,
    body: <>This selects a specific picker, in order to initiate a manual picker generation down below as well as edit or delete its items.</>,
  },
  {
    // padX: 3 — see pickerSelection's own comment, same gap, same fix.
    id: 'createNewPickers', sel: '.picker-tab--add', title: 'Create New Pickers', padX: 3,
    body: <>This is where you can create new pickers. This button will open up a full page form with 2 parts, picker settings and picker items.</>,
  },
  {
    id: 'manualGeneration', sel: '.picker-run', title: 'Manual Generation',
    body: (
      <>
        <p>The Pick one button runs a manual pick generation for the selected picker, so that you don't have to completely rely on your todo list's auto generation.</p>
        <p>Once it resolves and generates a pick it is replaced by the Send to Today button, which will add the selected pick to your todo list. The Re-roll button will run the process again and the Done button will end the process without doing anything.</p>
      </>
    ),
  },
  {
    // padY: 4 — .picker-pool (the shared flex-column parent) only has a
    // 10px gap to the Add Picker Item button below; the default 8px pad on
    // each side would overlap by 6px otherwise.
    id: 'pickerItems', sel: '.pool-items', title: 'Picker Items', padY: 4,
    // Inline icons (not their own line, unlike NAV_HELP_ITEM/Card Actions —
    // this is flowing prose, not a list) — same real icon name each real
    // button's own <Icon> uses (tab-picker.jsx's .pool-send/.pool-edit/
    // .pool-del). Each wrapped in .help-inline-icon (styles2.css) — an
    // inline-flex box that centers the icon within itself — rather than
    // relying on vertical-align alone, which aligns the icon's OWN box
    // against text metrics (x-height/baseline) that don't actually match
    // where the icon's own content visually sits inside its box.
    body: (
      <>This lists all of the items that are in this picker's pool, including their values (if applicable). The <span className="help-inline-icon"><Icon name="calendar" size={13} /></span> Send to Today button will send the item to your todo list on the Today page, the <span className="help-inline-icon"><Icon name="edit" size={13} /></span> Edit button will allow you to edit the item's properties and the <span className="help-inline-icon"><Icon name="trash" size={13} /></span> Delete button will delete the item after asking for confirmation.</>
    ),
  },
  {
    // padY: 4 — see pickerItems' own comment, same gap, same fix.
    id: 'addPickerItem', sel: '.pv-additem-btn', title: 'Add Picker Item', padY: 4,
    body: <>This button will open a form that allows you to add a new item to the selected picker's pool.</>,
  },
  // Clicking Edit on a pool item opens the shared EntryEditor (same
  // component/markup as Today's and Data's item-editor coverage — see
  // those catalogs' own comments) — but it renders inside .pv-additem-wrap,
  // BELOW the pool list, not inline where the item's own row is. No
  // scroll-into-view step exists in help mode (unlike the guided tour), so
  // these badges simply appear wherever that section currently sits once
  // an edit is open; the user scrolls to find them like anything else
  // below the fold. This same markup/selector set is ALSO what Step 2 of
  // the Create a Picker form uses for each new item's editor (identical
  // .pv-newitem/.rd-item/.entry-editor structure) — one shared set of
  // entries covers editing an existing pool item, adding one from an
  // existing picker's own pool, and building a brand new picker's pool.
  {
    // .rd-name-input is also used by the Conditionals section elsewhere in
    // the app (same .rd-item wrapper shape) — :has(.entry-editor) picks out
    // only a .rd-item that's actually an ITEM editor.
    id: 'itemName', sel: '.rd-item:has(.entry-editor) .rd-name-input', title: 'Item Name',
    body: <>This is the name field for your new item, give it a short, descriptive name. This is what will show up on your todo list.</>,
  },
  {
    id: 'itemChargeRangeUp', sel: '.entry-editor .pie-ease-up-row', padY: 0, title: 'Item Charge Controls',
    body: () => {
      const unit = document.querySelector('.entry-editor .pie-ease-up-row .np-ease-unit')?.textContent || 'days';
      return (
        <>
          <p><b>Soonest:</b> This controls the minimum number of {unit} that the item must wait before becoming eligible to be picked again.</p>
          <p><b>Latest:</b> This controls the maximum number of {unit} that the item must wait before becoming eligible to be picked again.</p>
          <p><b>Fill:</b> This will fill the item's charge to 100, making it eligible to be picked again.</p>
        </>
      );
    },
  },
  {
    id: 'itemChargeRangeDown', sel: '.entry-editor .pie-ease-down-row', padY: 0, title: 'Item Charge Controls',
    body: () => {
      const unit = document.querySelector('.entry-editor .pie-ease-down-row .np-ease-unit')?.textContent || 'days';
      return (
        <>
          <p><b>Shortest:</b> This controls the minimum number of {unit} that the item must stay as the active pick, after which a new item will be picked.</p>
          <p><b>Longest:</b> This controls the maximum number of {unit} that the item must stay as the active pick, after which a new item will be picked.</p>
          <p><b>Refill:</b> This will refill the item's charge back to 100, effectively resetting its active pick cadence.</p>
        </>
      );
    },
  },
  {
    id: 'itemWeight', sel: '.entry-editor .pie-row:has(.weight-stepper)', padY: 0, title: 'Item Weight',
    body: <>This adjusts the item's pick chance relative to the picker's other items. For example, an item with a weight of w2 is twice as likely to be picked as an item with a weight of w1.</>,
  },
  {
    id: 'itemBoost', sel: '.entry-editor .pie-row:has(.pie-boost-val)', padY: 0, title: 'Item Boost',
    body: <>This is the item's current boost, which climbs by 1 each time it isn't picked and resets to 0 the next time it is. A higher boost makes it more likely to be picked.</>,
  },
  {
    id: 'itemActive', sel: '.entry-editor .pie-row:has(.switch)', padY: 0, title: 'Item Active Toggle',
    body: <>This toggles whether this item is eligible to be picked. Turning it off sends the item on vacation, removing it from the picker's pool until it's turned back on.</>,
  },
  {
    // Unlike Today/Data, the Delete button is CSS-hidden here
    // (.pv-newitem .rd-edit-foot > .btn--danger) — deleting an existing
    // item stays solely the pool row's own trash icon + confirm flow on
    // this tab, so the copy only covers Cancel/Save.
    id: 'itemFoot', sel: '.entry-editor .rd-edit-foot .btn', title: 'Cancel / Save',
    body: (
      <>
        <p><b>Cancel:</b> This button discards the form and closes the editor without saving the new item.</p>
        <p><b>Save:</b> This button saves the new item to the picker's pool.</p>
      </>
    ),
  },
  // ── Create a Picker form (NewPickerForm, Step 1) ──────────────────────
  {
    // :has(#np-name) scopes to just this field, since every field in the
    // form shares the plain .np-field wrapper class.
    id: 'newPickerName', sel: '.np-field:has(#np-name)', title: 'Picker Name',
    body: <>This is the name field for your new picker, and it should have a short, descriptive name.</>,
  },
  {
    // :has(.np-groups) scopes to just this field, same reasoning as
    // newPickerName's own comment.
    id: 'newPickerGroup', sel: '.np-field:has(.np-groups)', title: 'Picker Group',
    body: <>This will let you choose which group this new picker belongs to. Groups cluster related pickers together on your todo list, like "Food" or "Chores". You can select an existing group or create a new one.</>,
  },
  {
    // Deliberately doesn't re-explain each mode — every option already has
    // its own ruleset/explanation copy right there on the page, and there
    // isn't room for that much text in a tooltip anyway.
    id: 'newPickerMode', sel: '.np-field:has(.mode-radio)', title: 'Picker Type',
    body: <>This is where you choose the rule this picker follows each time it runs. Each option below explains its own ruleset, so have a read through them to see which one fits best.</>,
  },
  {
    // Scoped to just the toggle row, not the collapsed attach-flow below it
    // (the conditional pill rail + inline "create new conditional" form) —
    // that's its own whole nested interface, left for a future pass rather
    // than reaching into collapsed content on this first one.
    id: 'newPickerConditional', sel: '.np-cond .np-field--toggle', title: 'Picker Conditional',
    body: <>This lets you optionally gate this picker behind a conditional. When you attach a conditional, the picker will only run on days determined by that conditional's own rules. For example, giving yourself an occasional day off from chores. You can attach an existing conditional or create a new one.</>,
  },
  {
    // Only present once the toggle above is on (the whole .cnd-attach block
    // is a Collapse) — findTargets naturally won't match anything while
    // it's closed, no visibility check needed here.
    id: 'newPickerConditionalRail', sel: '.cnd-rail', title: 'Select a Conditional',
    body: <>This lets you select an existing conditional to attach to this picker. If you don't have one yet, or want to create another, use the Add new conditional button to build one inline.</>,
  },
  // ── Add new conditional (ConditionalControls, inline in the create flow) ──
  {
    id: 'newCondName', sel: '.cnd-controls .np-field:has(input[placeholder="Conditional name"])', title: 'Conditional Name',
    body: <>This is the name field for your new conditional, and it should have a short, descriptive name.</>,
  },
  {
    id: 'newCondCardText', sel: '.np-field--cardtext', title: 'Conditional Card Text',
    body: <>This is the text that will show on the card that appears in your todo list whenever this conditional suppresses any attached pickers.</>,
  },
  {
    // Deliberately doesn't re-explain each type — every option already has
    // its own ruleset/explanation copy right there on the page, same as
    // newPickerMode's own comment.
    // padY: 0 — this whole cluster (Type/Weight/Odds/Boost/Charge Controls/
    // Active) sits close enough together — .cnd-type-group's own gap to a
    // sibling block is only 6px, and Odds-to-Boost specifically share the
    // SAME block with next to no gap at all — that the default 8px pad
    // would overlap somewhere no matter which type is selected. Zero pad on
    // all of them relies on newCondActive's own padY to open a gap instead
    // (see its comment), same "let one side of the boundary do the work"
    // approach as EntryEditor's itemWeight/itemBoost.
    id: 'newCondType', sel: '.cnd-controls .np-field:has(.rd-mode-radio)', title: 'Conditional Type', padY: 0,
    body: <>This is where you choose the rule this conditional follows each time it runs. Each option below explains its own ruleset, so have a read through them to see which one fits best.</>,
  },
  {
    id: 'newCondRandom', sel: '.cnd-typectl:has(.pie-noweight)', title: 'Conditional Weight', padY: 0,
    body: <>Truly random conditionals have no adjustable settings. Every time this conditional runs, it has an equal 50/50 chance to trigger.</>,
  },
  {
    id: 'newCondOdds', sel: '.cnd-typectl .pie-row:has(.weight-stepper)', title: 'Conditional Trigger Odds', padY: 0,
    body: <>This adjusts the conditional's chance to trigger each time it runs. A higher percentage makes it more likely to trigger and a lower percentage makes it less likely.</>,
  },
  {
    id: 'newCondBoost', sel: '.cnd-typectl .pie-row:has(.pie-boost-val)', title: 'Conditional Boost', padY: 0,
    body: <>This is the conditional's current boost, which climbs by a percentage each time it doesn't trigger and resets to 0 the next time it does. A higher boost makes it more likely to trigger.</>,
  },
  {
    // cnd-ease-up-row / cnd-ease-down-row — see tab-conditional.jsx's own
    // comment; same split-by-direction pattern as EntryEditor's
    // itemChargeRangeUp/Down.
    id: 'newCondEaseUp', sel: '.cnd-typectl .cnd-ease-up-row', padY: 0, title: 'Conditional Charge Controls',
    body: (
      <>
        <p><b>Soonest:</b> This controls the minimum number of days that must pass before the conditional becomes eligible to trigger.</p>
        <p><b>Latest:</b> This controls the maximum number of days that must pass before the conditional is guaranteed to trigger.</p>
        <p><b>Fill:</b> This will fill the conditional's charge to 100, making it eligible to trigger.</p>
      </>
    ),
  },
  {
    id: 'newCondEaseDown', sel: '.cnd-typectl .cnd-ease-down-row', padY: 0, title: 'Conditional Charge Controls',
    body: (
      <>
        <p><b>Shortest:</b> This controls the minimum number of days that the conditional must stay triggered before it can stop.</p>
        <p><b>Longest:</b> This controls the maximum number of days that the conditional can stay triggered before it must stop.</p>
        <p><b>Refill:</b> This will refill the conditional's charge back to 100, effectively resetting how long it stays triggered.</p>
      </>
    ),
  },
  {
    // padY: 3 — opens a gap against whichever zero-pad block sits above it
    // (Weight/Odds/Boost/Charge Controls all now padY: 0 — see their own
    // comment), while staying comfortably under the real 6px gap so it
    // can't reach up into that block's own content.
    id: 'newCondActive', sel: '.cnd-controls .pie-row:has(.switch)', title: 'Conditional Active Toggle', padY: 3,
    body: <>This toggles whether this conditional is currently active. Turning it off effectively disables the conditional, so its attached picker will always run regardless of the conditional's own trigger state.</>,
  },
  // ── Daily Generator section (still Step 1 of the Create a Picker form) ──
  {
    id: 'newPickerDaily', sel: '.np-daily-group .np-field--toggle', title: 'Daily Generator Toggle',
    body: <>This determines whether the picker will be included in the app's daily auto-generator. When on, this picker's items will be automatically added to your todo list. When off, the picker won't run automatically, but you can still generate a pick manually from this tab.</>,
  },
  {
    // .cad-ctl wraps BOTH the pill row and whichever extra "which day/date"
    // field is currently showing below it, same "one editor, styled
    // together" shape as Today's own addReminderRepeat/.rem-editor — so one
    // highlight over the whole thing, growing/shrinking with the selection,
    // instead of a per-option split.
    id: 'newPickerCadence', sel: '.cad-ctl', title: 'Picker Cadence',
    body: (
      <>
        <p><b>Daily:</b> This is the picker's default cadence. It surfaces every day that it's scheduled to run, exactly like an ordinary picker.</p>
        <p><b>Weekly:</b> This surfaces the picker once a week, on whichever weekday you choose below. Once picked, that item stays on your todo list until you mark it as completed, even if that takes more than one day.</p>
        <p><b>Monthly:</b> This surfaces the picker once a month, on whichever day you choose below. Once picked, that item stays on your todo list until you mark it as completed, even if that takes more than one day.</p>
        <p><b>Yearly:</b> This surfaces the picker once a year, on whichever date you choose below. Once picked, that item stays on your todo list until you mark it as completed, even if that takes more than one day.</p>
      </>
    ),
  },
  {
    // :has(.np-sched-row) distinguishes this from the OTHER .np-sched-block
    // (CadenceControl's own wrapper), which shares the same bare class.
    id: 'newPickerWhichDays', sel: '.np-sched-block:has(.np-sched-row)', title: 'Picker Day Selection',
    body: <>This lets you choose which days of the week this picker is allowed to run on. Tap a day to toggle it on or off, or use the Every day/Weekdays/Weekends presets to quickly set a common pattern.</>,
  },
  {
    id: 'newPickerSkipHolidays', sel: '.np-sched-toggle', title: 'Picker Holidays Toggle',
    body: <>This determines whether this picker skips major U.S. holidays. When on, this picker won't run on those days. You can edit which days count as holidays, or add your own, in Settings.</>,
  },
  {
    // .np-footer--step1 scopes this to Step 1 specifically — Step 2's own
    // footer (see newPickerItemsFooterNote below) is a bare .np-footer with
    // no modifier class, so without this both steps' .np-footer-note would
    // match the same selector and only one entry could ever win.
    id: 'newPickerFooterNote', sel: '.np-footer--step1 .np-footer-note', title: 'Picker Form Status',
    body: <>This area lets you know if anything still needs to be filled out before you can advance to the next step, or confirms that you're ready to move on.</>,
  },
  {
    id: 'newPickerFooterActions', sel: '.np-footer--step1 .np-footer-actions .btn', title: 'Cancel / Add Items',
    body: (
      <>
        <p><b>Cancel:</b> This button discards the picker form without saving anything.</p>
        <p><b>Add Items:</b> This button advances to the next step, where you'll build this picker's item pool. Stays disabled until at least a name and group are set.</p>
      </>
    ),
  },
  // ── Create a Picker form, Step 2 (adding items to the pool) ────────────
  {
    // :not(.np-footer--step1) — see newPickerFooterNote's own comment.
    id: 'newPickerItemsFooterNote', sel: '.np-footer:not(.np-footer--step1) .np-footer-note', title: 'Add Items Form Status',
    body: <>This area lets you know if anything still needs to be filled out before you can submit the form, or confirms that the picker is ready to be created.</>,
  },
  {
    id: 'newPickerItemsFooterActions', sel: '.np-footer:not(.np-footer--step1) .np-footer-actions .btn', title: 'Back / Create Picker',
    body: (
      <>
        <p><b>Back:</b> This button will take you back to the first part of the form, allowing you to adjust the picker's settings.</p>
        <p><b>Create Picker:</b> This button will create the new picker. Stays disabled until at least 2 items are created.</p>
      </>
    ),
  },
];

const STATS_HELP_ITEMS = [
  {
    id: 'brandMark', sel: '.stat-h-lead .brand-mark', title: 'Home Link',
    body: <>You can click this logo at any time to navigate back to the home page of the app, the Today page.</>,
  },
  {
    id: 'groupFilter', sel: '.stat-scope-groups .picker-group-pill', title: 'Group Filter',
    body: <>This filters the pickers row below by group, which is extremely useful if you have created a lot of pickers.</>,
  },
  {
    id: 'pickersFilter', sel: '.stat-scope-tabs .picker-tab', title: 'Type Filter',
    body: <>This further narrows your selection to conditionals, reminders or specific pickers, or you can view everything all at once.</>,
  },
  {
    id: 'rangeFilter', sel: '.stat-filter-pills--seg .stat-pill', title: 'Range Filter',
    body: <>This further narrows your selection by date range, with ranges from 1 week to 1 year to all time.</>,
  },
  // ── Headline numbers — three different card sets share the same position
  // (between the Range filter and the heatmap/breakdown below), one per
  // scope: All/a specific picker, Reminders, and Conditionals. Each card
  // needed its own stat-mk-* marker class in tab-stats.jsx first, since
  // they all otherwise share the plain .stat-card class with nothing to
  // distinguish one from another.
  {
    // padX/padY: 4 — these 4 cards sit in a CSS grid with only a 10px gap
    // (both row-gap and column-gap, since it's a single `gap: 10px` on
    // .stat-row), so the default 8px pad on each side would overlap a
    // neighbor's own pad by 6px, on whichever edge is shared (right/left
    // in the desktop single-row layout, all four edges in the mobile 2x2
    // grid). 4+4=8 leaves 2px of daylight in the 10px gap instead.
    //
    // All and a specific picker scope both render these same stat-mk-*
    // cards (see tab-stats.jsx's own comment on stat-mk-scope-*), so each
    // gets its own entry below scoped to stat-mk-scope-all/-picker, with
    // its own title/copy.
    id: 'statStreak', sel: '.stat-mk-scope-all.stat-mk-streak', title: 'Day Streak', padX: 4, padY: 4,
    body: <>This shows your current streak of consecutive days where you've completed all items in your todo list.</>,
  },
  {
    id: 'statFullDays', sel: '.stat-mk-scope-all.stat-mk-fulldays', title: 'Full Days', padX: 4, padY: 4,
    body: <>This shows the number of days where you completed everything in your todo list that day, compared to the number of total active days shown next to it.</>,
  },
  {
    id: 'statDone', sel: '.stat-mk-scope-all.stat-mk-done', title: 'Items Done', padX: 4, padY: 4,
    body: <>This shows the total number of items you've completed in this range.</>,
  },
  {
    id: 'statRate', sel: '.stat-mk-scope-all.stat-mk-rate', title: 'Completion Rate', padX: 4, padY: 4,
    body: <>This shows the percentage of items you've completed, out of every item that was in your todo list in this range.</>,
  },
  {
    id: 'statPickerStreak', sel: '.stat-mk-scope-picker.stat-mk-streak', title: 'Picker Day Streak', padX: 4, padY: 4,
    body: <>This shows your current streak of consecutive days where you've completed all items in your todo list.</>,
  },
  {
    id: 'statPickerFullDays', sel: '.stat-mk-scope-picker.stat-mk-fulldays', title: 'Picker Full Days', padX: 4, padY: 4,
    body: <>This shows the number of days where you've completed everything in your todo list for that day, compared to the number of total active days shown next to it.</>,
  },
  {
    id: 'statPickerDone', sel: '.stat-mk-scope-picker.stat-mk-done', title: 'Picker Items Done', padX: 4, padY: 4,
    body: <>This shows the total number of items that you've completed for your selected range.</>,
  },
  {
    id: 'statPickerRate', sel: '.stat-mk-scope-picker.stat-mk-rate', title: 'Picker Completion Rate', padX: 4, padY: 4,
    body: <>This shows the percentage of items that you've completed, out of every item that was in your todo list.</>,
  },
  {
    // padX/padY: 4 — same .stat-row (10px gap) bleed fix as the other
    // headline-card rows: default 8px pad on each side overlaps a
    // neighbor's own pad across the shared edge, side by side on wide
    // viewports and 2x2 on narrow ones.
    id: 'statRemDone', sel: '.stat-mk-remdone', title: 'Reminders Completed', padX: 4, padY: 4,
    body: <>This shows the total number of reminders that you've completed for your selected range.</>,
  },
  {
    id: 'statRemWeek', sel: '.stat-mk-remweek', title: 'Reminders This Week', padX: 4, padY: 4,
    body: <>This shows the number of reminders that you've completed in the last 7 days, regardless of your selected range.</>,
  },
  {
    id: 'statRemActive', sel: '.stat-mk-remactive', title: 'Reminders Active Days', padX: 4, padY: 4,
    body: <>This shows the total number of days for your selected range where you've completed at least one reminder.</>,
  },
  {
    id: 'statRemBusiest', sel: '.stat-mk-rembusiest', title: 'Reminders Busiest Day', padX: 4, padY: 4,
    body: <>This shows the highest number of reminders that you've completed in a single day for your selected range.</>,
  },
  {
    // padX/padY: 4 — same .stat-row (10px gap) bleed fix as the other
    // headline-card rows: default 8px pad on each side overlaps a
    // neighbor's own pad across the shared edge, side by side on wide
    // viewports and 2x2 on narrow ones.
    id: 'statCondFired', sel: '.stat-mk-condfired', title: 'Conditionals Triggered', padX: 4, padY: 4,
    body: <>This shows the total number of times that any conditional has been triggered for your selected range.</>,
  },
  {
    id: 'statCondCycles', sel: '.stat-mk-condcycles', title: 'Conditionals Cycles', padX: 4, padY: 4,
    body: <>This shows the total number of cycles that any conditional was evaluated over for your selected range, regardless of whether it was triggered or not.</>,
  },
  {
    id: 'statCondRate', sel: '.stat-mk-condrate', title: 'Conditionals Fire Rate', padX: 4, padY: 4,
    body: <>This shows the percentage of evaluated cycles that resulted in a triggered conditional for your selected range.</>,
  },
  {
    id: 'statCondLast', sel: '.stat-mk-condlast', title: 'Conditionals Last Fired', padX: 4, padY: 4,
    body: <>This shows the most recent data that any conditional in your selected range was triggered.</>,
  },
  {
    id: 'heatmap', sel: '.stat-heatmap-card', title: 'Activity Heatmap',
    body: <>This visualizes your completed activity over time, with each day shaded by how much you got done. If you click on any day, more details for it will be shown below the heatmap.</>,
  },
  // ── All-scope only ──────────────────────────────────────────────────────
  {
    id: 'statConditionalsSummary', sel: '.cnd-sum-card', title: 'Conditional Statistics',
    body: <>This summarizes your conditionals' activity for your selected range. It includes how many times they've triggered, their overall fire rate, and a per-conditional breakdown. It will only show if you have at least one conditional.</>,
  },
  {
    id: 'statRemindersSummary', sel: '.rem-stats-card', title: 'Reminders Statistics',
    body: <>This summarizes your completed reminders' activity for your selected range, along with a short recent-activity list. It will only show if you have the "Include in Stats" toggle enabled for reminders.</>,
  },
  {
    id: 'statSource', sel: '.stat-mk-source', title: 'Picker Items Chosen Type',
    body: <>This breaks down how your picker items made it onto your todo list. This includes auto-generated, re-rolled or hand-picked from the Pickers tab.</>,
  },
  {
    id: 'statMostPicked', sel: '.stat-mk-mostpicked', title: 'Picker Items Most Picked', padX: 4, padY: 4,
    body: <>This lists the 5 picker items that have been picked the most for your selected range.</>,
  },
  {
    id: 'statColdest', sel: '.stat-mk-coldest', title: 'Picker Items Least Picked', padX: 4, padY: 4,
    body: <>This lists the 5 picker items that have been picked the least for your selected range. This excludes any picker items that are currently on vacation.</>,
  },
  // ── Conditionals scope only ─────────────────────────────────────────────
  {
    id: 'statCondBreakdown', sel: '.stat-mk-condbreakdown', title: 'Conditionals Breakdown',
    body: <>This breaks down every conditional for your selected range individually. You can switch between fire rate, triggers, cycles, interval and last fired to see each conditional from a different angle.</>,
  },
  // ── Reminders scope only ────────────────────────────────────────────────
  {
    id: 'statRemType', sel: '.stat-mk-remtype', title: 'Reminders Completed Type',
    body: <>This breaks down your completed reminders by type, one-time versus recurring, for your selected range.</>,
  },
  {
    id: 'statRemBreakdown', sel: '.stat-mk-rembreakdown', title: 'Reminders Breakdown',
    body: <>This breaks down every reminder for your selected range individually. You can switch between recent completions, total completions and skips to see each reminder from a different angle.</>,
  },
  // ── Single-picker scope only ────────────────────────────────────────────
  {
    id: 'pickerIdentity', sel: '.stat-picker-id', title: 'Picker Identity',
    body: <>This shows which picker you're currently viewing stats for, along with its type and a short explanation of how it chooses.</>,
  },
  {
    id: 'pickerBreakdown', sel: '.stat-breakdown-card', title: 'Picker Breakdown',
    body: <>This breaks down every picker item for your selected range individually. You can switch between pick count, pick frequency, last picked date and more to see each picker item from a different angle.</>,
  },
];

const DATA_HELP_ITEMS = [
  {
    id: 'brandMark', sel: '.stat-h-lead .brand-mark', title: 'Home Link',
    body: <>You can click this logo at any time to navigate back to the home page of the app, the Today page.</>,
  },
  {
    // The Conditionals filter row below carries BOTH .stat-scope-groups
    // AND .stat-scope-groups--cond (it's an additional modifier, not a
    // replacement — see its own conditionalsFilter entry) — unscoped, this
    // selector matched that row's pills too, unioning the highlight all
    // the way down through the Conditionals row.
    id: 'groupFilter', sel: '.stat-scope-groups:not(.stat-scope-groups--cond) .picker-group-pill', title: 'Group Filter',
    body: <>This filters the pickers row below by group, which is extremely useful if you have created a lot of pickers.</>,
  },
  {
    id: 'pickersFilter', sel: '.stat-scope-tabs .picker-tab', title: 'Type Filter',
    body: <>This further narrows your selection to conditionals, reminders or specific pickers, or you can view everything all at once.</>,
  },
  {
    // Only rendered once at least one conditional exists — a second filter
    // row alongside Group, narrowing the pickers list to whichever
    // conditional gates them.
    id: 'conditionalsFilter', sel: '.stat-scope-groups--cond .picker-group-pill', title: 'Conditionals Filter',
    body: <>This filters the pickers list below by conditional, showing only pickers gated by the conditional you select.</>,
  },
  // ── Conditionals manager — each conditional gets its own highlight/
  // tooltip, not just the section as a whole. The per-type controls
  // (Type/Weight/Odds/Boost/Charge Controls/Active) reuse the EXACT same
  // selectors as the Pickers-page create-flow verbatim: ConditionalControls
  // is the same shared component either way (this tab passes
  // variant="inline" instead of the default 'card', but that only swaps a
  // wrapper class neither selector touches), so there was nothing to
  // re-derive — see PICKER_HELP_ITEMS' own newCond* entries for the
  // original comments on each of these.
  {
    // padY:0 — .cat-h has no border/gap of its own below it, but .cat-body
    // (wrapping the Add button and every row) sits directly against it with
    // only a hairline border, same zero-gap stacking as the rest of this
    // card. The 20px flex gap above .cnd-manager itself (from .tab--data)
    // easily absorbs losing the default pad on that side too.
    id: 'conditionalsManager', sel: '.cnd-manager .cat-h', title: 'Conditionals', padY: 0,
    body: <>This is where you can view and edit all of your conditionals. Tap the header to expand or collapse the section.</>,
  },
  {
    // perElement — every conditional gets its own badge, not one for the
    // whole list, since a user could be looking at any of them. padY:0 —
    // .rd-item rows stack with zero gap (touching, separated only by a
    // hairline border), so the default 8px pad bled a highlight box into
    // both neighboring rows above and below it.
    id: 'conditionalRow', sel: '.cnd-manager .rd-item > .rd-row', perElement: true, padY: 0,
    labelSel: '.rd-name, .rd-name-input',
    title: (r) => `${r?.label || 'This'} Conditional`,
    body: <>You can tap this conditional to expand and collapse this section. Expand it in order to view and edit its settings.</>,
  },
  {
    // padY:0 — .rd-add has the same zero-gap stacking as .rd-item (a
    // hairline border, no margin), touching both the header above it and
    // the first conditional row below it.
    id: 'dataCondAdd', sel: '.cnd-manager .rd-add', title: 'Create New Conditional', padY: 0,
    body: <>This creates a new conditional, letting you gate a picker behind a rule of your choosing so it only runs on days that rule allows.</>,
  },
  {
    // hideName is set on ConditionalControls here, so the name field lives
    // on the ROW itself (same .rd-name-input shape as a picker item's own
    // row), not inside the shared controls component. padY:0 — the row and
    // whatever's directly below it (the first ConditionalControls field)
    // stack with zero gap, same as everywhere else on this page.
    id: 'dataCondName', sel: '.cnd-manager .rd-item.is-editing .rd-name-input', title: 'Conditional Name', padY: 0,
    body: <>This is the name field for this conditional, you can rename it here.</>,
  },
  {
    // Reused verbatim from PICKER_HELP_ITEMS' newCondCardText — same
    // ConditionalControls markup either way, missed when the other newCond*
    // entries were copied over for this pass. padY:0 — .cnd-controls--inline
    // (the variant used here, unlike the Pickers-page card variant) has
    // gap:0 between fields, so this bleeds into its neighbors above/below
    // without it.
    id: 'dataCondCardText', sel: '.np-field--cardtext', title: 'Conditional Card Text', padY: 0,
    body: <>This is the text that will show on the card that appears in your todo list whenever this conditional suppresses any attached pickers.</>,
  },
  {
    id: 'dataCondType', sel: '.cnd-controls .np-field:has(.rd-mode-radio)', title: 'Conditional Type', padY: 0,
    body: <>This is where you choose the rule this conditional follows each time it runs. Each option below explains its own ruleset, so have a read through them to see which one fits best.</>,
  },
  {
    id: 'dataCondRandom', sel: '.cnd-typectl:has(.pie-noweight)', title: 'Conditional Weight', padY: 0,
    body: <>Truly random conditionals have no adjustable settings. Every time this conditional runs, it has an equal 50/50 chance to trigger.</>,
  },
  {
    id: 'dataCondOdds', sel: '.cnd-typectl .pie-row:has(.weight-stepper)', title: 'Conditional Trigger Odds', padY: 0,
    body: <>This adjusts the conditional's chance to trigger each time it runs. A higher percentage makes it more likely to trigger and a lower percentage makes it less likely.</>,
  },
  {
    id: 'dataCondBoost', sel: '.cnd-typectl .pie-row:has(.pie-boost-val)', title: 'Conditional Boost', padY: 0,
    body: <>This is the conditional's current boost, which climbs by a percentage each time it doesn't trigger and resets to 0 the next time it does. A higher boost makes it more likely to trigger.</>,
  },
  {
    id: 'dataCondEaseUp', sel: '.cnd-typectl .cnd-ease-up-row', padY: 0, title: 'Conditional Charge Controls',
    body: (
      <>
        <p><b>Soonest:</b> This controls the minimum number of days that must pass before the conditional becomes eligible to trigger.</p>
        <p><b>Latest:</b> This controls the maximum number of days that must pass before the conditional is guaranteed to trigger.</p>
        <p><b>Fill:</b> This will fill the conditional's charge to 100, making it eligible to trigger.</p>
      </>
    ),
  },
  {
    id: 'dataCondEaseDown', sel: '.cnd-typectl .cnd-ease-down-row', padY: 0, title: 'Conditional Charge Controls',
    body: (
      <>
        <p><b>Shortest:</b> This controls the minimum number of days that the conditional must stay triggered before it can stop.</p>
        <p><b>Longest:</b> This controls the maximum number of days that the conditional can stay triggered before it must stop.</p>
        <p><b>Refill:</b> This will refill the conditional's charge back to 100, effectively resetting how long it stays triggered.</p>
      </>
    ),
  },
  {
    id: 'dataCondActive', sel: '.cnd-controls .pie-row:has(.switch)', title: 'Conditional Active Toggle', padY: 3,
    body: <>This toggles whether this conditional is currently active. Turning it off effectively disables the conditional, so its attached picker will always run regardless of the conditional's own trigger state.</>,
  },
  {
    // .rd-edit--cnd scopes this to ConditionalEditor's own footer — its
    // .rd-ctl-group--foot wrapper class is shared with PickerControls'
    // footer below, which lives in a differently-rooted tree (.rd-edit--cnd
    // is unique to this one). Delete is only rendered when !isNew (see
    // tab-data.jsx's ConditionalEditor), so :has(.btn--danger) splits this
    // from dataCondFootNew below rather than always mentioning Delete.
    id: 'dataCondFoot', sel: '.rd-edit--cnd .rd-ctl-group--foot:has(.btn--danger) .btn', title: 'Delete / Cancel / Save',
    body: (
      <>
        <p><b>Delete:</b> This button permanently deletes this conditional, after asking you to confirm. Any pickers using it will be detached.</p>
        <p><b>Cancel:</b> This button discards any changes and closes this editor without saving.</p>
        <p><b>Save:</b> This button saves your changes to this conditional.</p>
      </>
    ),
  },
  {
    // New (unsaved) conditionals never render a Delete button — see
    // ConditionalEditor's `!isNew &&` guard — so this covers that footer
    // state with its own Cancel/Save-only copy.
    id: 'dataCondFootNew', sel: '.rd-edit--cnd .rd-ctl-group--foot:not(:has(.btn--danger)) .btn', title: 'Cancel / Save',
    body: (
      <>
        <p><b>Cancel:</b> This button discards the new conditional without saving it.</p>
        <p><b>Save:</b> This button saves the new conditional.</p>
      </>
    ),
  },
  // ── Reminders manager — the participation-settings matrix is new content
  // (not present anywhere else); the per-reminder row + its editor reuse
  // Today's own editReminderRepeat/editReminderFoot verbatim, since this is
  // the exact same .rem-inline-editor markup either way.
  {
    // padY:0 — same .cat-h/.cat-body zero-gap stacking as conditionalsManager.
    id: 'remindersManager', sel: '.cat--reminders .cat-h', title: 'Reminders', padY: 0,
    body: <>This is where you can view and edit all of your reminders. Tap the header to expand or collapse the section.</>,
  },
  {
    // The Controls/Items disclosures share the .rd-ctl class (see the
    // matching pair on each picker below), so :nth-of-type splits them —
    // Controls always renders first in .cat-body, Items second. padY:0 —
    // .rd-ctl touches its neighbor with only a hairline border, same
    // zero-gap stacking as everywhere else on this page.
    id: 'remindersControlsHeader', sel: '.cat--reminders .cat-body > button.rd-ctl:nth-of-type(1)', title: 'Reminder Controls', padY: 0,
    body: <>Tap this to expand or collapse the reminders settings below. Collapsed, it shows how many settings there are.</>,
  },
  {
    // padY:0 — .rd-matrix sits flush against the Controls header above and
    // the Items header below (no .rd-ctl-body padding wrapper here, unlike
    // PickerControls), so the default pad bled 8px into both.
    id: 'remControlsMatrix', sel: '.rd-matrix', title: 'Reminders Settings', padY: 0,
    body: <>This controls whether one-time and recurring reminders are included in the day streak, completion ring or the Stats page. There are also controls to exclude those same types from weekends or holidays. Each type of reminder can be toggled independently.</>,
  },
  {
    // No Delete, unlike dataPickerFoot's own Delete/Cancel/Save — these are
    // global settings, not a single deletable picker.
    id: 'remControlsFoot', sel: '.rd-matrix .rd-mx-foot .btn', title: 'Cancel / Save',
    body: (
      <>
        <p><b>Cancel:</b> This button discards any changes and closes this section without saving.</p>
        <p><b>Save:</b> This button saves your changes to the Reminders controls.</p>
      </>
    ),
  },
  {
    id: 'remindersItemsHeader', sel: '.cat--reminders .cat-body > button.rd-ctl:nth-of-type(2)', title: 'Reminders Items', padY: 0,
    body: <>Tap this to expand or collapse the list of your reminders below. Collapsed, it shows how many reminders you have.</>,
  },
  {
    // padY:0 — .rd-add has the same zero-gap stacking as .rd-item (a
    // hairline border, no margin), touching both the header above it and
    // the first reminder row below it.
    id: 'remAddButton', sel: '.cat--reminders .rd-add', title: 'Create New Reminder', padY: 0,
    body: <>This creates a new one-time or recurring reminder. Reminders are separate from pickers since some tasks cannot be randomly chosen and must be done on a schedule (recurring reminder) or are a one-time thing (one-time reminder).</>,
  },
  {
    // perElement — every reminder gets its own badge, not one for the whole
    // list. Split by type (rather than by name, like conditionalRow/
    // pickerRow) via the row's own .rd-ico.is-once marker — set per user
    // request instead of the name-based labelSel pattern. padY:0 — .rd-item
    // rows stack with zero gap (touching, separated only by a hairline
    // border), same as conditionalRow/pickerRow.
    id: 'reminderRowOnce', sel: '.cat--reminders .rd-item > .rd-row:has(.rd-ico.is-once)', perElement: true, padY: 0, title: 'One-Time Reminder Item',
    body: <>This is one of your reminders. Tap it to view and edit its settings.</>,
  },
  {
    id: 'reminderRowRecurring', sel: '.cat--reminders .rd-item > .rd-row:not(:has(.rd-ico.is-once))', perElement: true, padY: 0, title: 'Recurring Reminder Item',
    body: <>This is one of your reminders. Tap it to view and edit its settings.</>,
  },
  {
    id: 'dataReminderName', sel: '.cat--reminders .rd-name-input', title: 'Reminder Name',
    body: <>This is the name field for your reminder, give it a short, descriptive name. This is what will show up on your todo list.</>,
  },
  {
    // Reused verbatim from TODAY_HELP_ITEMS' editReminderRepeat/editReminderFoot
    // — same .rem-inline-editor markup, and this tab has no quickadd form for
    // that selector's own :not(.rem-quickadd-wrap *) exclusion to worry about.
    // padY:0 — unlike Today's card-based editor, this tab's .rd-edit wrapper
    // overrides .rem-inline-foot's margin-top to 0 (see .rd-edit .rd-edit-foot
    // in styles2.css), so .rem-editor touches the footer row with zero gap.
    id: 'dataReminderRepeat', sel: '.rem-inline-editor:not(.entry-editor):not(.rem-quickadd-wrap *) .rem-editor', title: 'Reminder Schedule', padY: 0,
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
    // sel targets .rem-inline-foot (the shared wrapper), not .rd-edit-foot
    // specifically — see editReminderFoot's own comment (TODAY_HELP_ITEMS)
    // for why: Delete's own confirm prompt swaps in a different sibling
    // class (.rem-foot-confirm), which .rd-edit-foot alone would miss,
    // leaving its Cancel/Delete buttons genuinely unreachable (no dim-mask
    // hole, blocked by the click-guard) while help mode is on.
    // Delete is only rendered when !isNew (see reminders.jsx's
    // ReminderEditFoot) — :has(.btn--danger) splits this from
    // dataReminderFootNew below rather than always mentioning Delete,
    // same fix as dataCondFoot/dataCondFootNew.
    id: 'dataReminderFoot', sel: '.rem-inline-editor:not(.entry-editor) .rem-inline-foot:has(.btn--danger) .btn', title: 'Delete / Cancel / Save',
    body: (
      <>
        <p><b>Delete:</b> This button permanently deletes this reminder, after asking you to confirm.</p>
        <p><b>Cancel:</b> This button discards any changes and closes this editor without saving.</p>
        <p><b>Save:</b> This button saves your changes to this reminder.</p>
      </>
    ),
  },
  {
    // New (unsaved) reminders never render a Delete button — see
    // ReminderEditFoot's `!isNew &&` guard — so this covers that footer
    // state with its own Cancel/Save-only copy.
    id: 'dataReminderFootNew', sel: '.rem-inline-editor:not(.entry-editor) .rem-inline-foot:not(:has(.btn--danger)) .btn', title: 'Cancel / Save',
    body: (
      <>
        <p><b>Cancel:</b> This button discards the new reminder without saving it.</p>
        <p><b>Save:</b> This button saves the new reminder.</p>
      </>
    ),
  },
  // ── Pickers list — each picker gets its own highlight, plus each of its
  // own settings controls individually (PickerControls) and each of its
  // items individually (reusing the shared item-editor entries below).
  {
    // perElement — every picker gets its own badge. Scoped via the direct
    // .data-list > .cat > .cat-h chain since .cat-h is also reused by the
    // Conditionals/Reminders managers' own outer headers (which render
    // outside .data-list entirely).
    // padY:0 — same .cat-h/.cat-body zero-gap stacking as conditionalsManager;
    // matters once a picker is expanded and .cat-body renders beneath it.
    // title is dynamic by TYPE, not name (unlike conditionalRow/pickerRow's
    // own precedent) — labelSel reads the hidden .cat-mode-label marker
    // (tab-data.jsx), since the picker's mode isn't otherwise shown
    // anywhere in the collapsed header.
    id: 'pickerRow', sel: '.data-list > .cat > .cat-h', perElement: true, padY: 0,
    labelSel: '.cat-mode-label',
    title: (r) => r?.label ? `${r.label} Picker` : 'Picker',
    body: <>This is one of your pickers. Tap it to view and edit its settings and items.</>,
  },
  {
    // perElement — each expanded picker gets its own Controls/Items pair
    // (more than one can be open at once). Same .rd-ctl class and
    // :nth-of-type split as the Reminders manager's own pair above.
    // .cat-body is a descendant, not a direct child, of .cat — it's wrapped
    // in its own <Collapse> div (unlike .cat-h, which isn't). padY:0 —
    // .rd-ctl touches its neighbor with only a hairline border.
    id: 'dataPickerControlsHeader', sel: '.data-list > .cat .cat-body > button.rd-ctl:nth-of-type(1)', perElement: true, padY: 0, title: 'Picker Controls',
    body: <>Tap this to expand or collapse this picker's settings. This includes its name, its group, how it picks, its conditional gate and when it runs. Collapsed, it shows how many setting options exist.</>,
  },
  {
    id: 'dataPickerItemsHeader', sel: '.data-list > .cat .cat-body > button.rd-ctl:nth-of-type(2)', perElement: true, padY: 0, title: 'Picker Items',
    body: <>Tap this to expand or collapse this picker's list of items below. Collapsed, it shows how many items are in the picker.</>,
  },
  {
    // padY:0 — .rd-basics-row has no margin, just its own padding + a
    // border-top, so consecutive rows (this one and Group below) touch
    // with zero gap.
    id: 'dataPickerName', sel: '.rd-basics-row:has(.rd-basics-name)', title: 'Picker Name', padY: 0,
    body: <>This is the name field for this picker, you can rename it here.</>,
  },
  {
    id: 'dataPickerGroup', sel: '.rd-basics-row--group', title: 'Picker Group', padY: 0,
    body: <>This lets you choose which group this picker belongs to. Groups cluster related pickers together on your todo list, like "Food" or "Chores". You can select an existing group or create a new one.</>,
  },
  {
    // Scoped to PickerControls' own "How it picks" group — ConditionalEditor
    // has its own separate .rd-mode-radio inside .cnd-controls, which
    // doesn't live under .rd-ctl-group--picks. padY:0 — .rd-ctl-group--picks
    // (this group's own wrapper) touches .ease-config (Default Charge
    // Controls) below with zero gap.
    id: 'dataPickerType', sel: '.rd-ctl-group--picks .rd-mode-radio', title: 'Picker Type', padY: 0,
    body: <>This is where you choose the rule this picker follows each time it runs. Each option below explains its own ruleset, so have a read through them to see which one fits best.</>,
  },
  {
    // New content — this picker-level default charge range (Ease-up/down
    // only) has no equivalent on the Pickers-page create flow, which only
    // sets charge ranges per item, not a picker-wide default. Prefills new
    // items added to this picker; Fill/Refill here acts on every item at
    // once (actions.refillPicker), not just one. padY:0 — touches Picker
    // Type above with zero gap (see that entry's own comment). Split by
    // mode (ease-config--up/--down, tab-data.jsx) rather than one combined
    // Soonest/Shortest-Latest/Longest-Fill/Refill entry, same idea as
    // itemChargeRangeUp/Down below.
    id: 'dataPickerDefaultCadenceUp', sel: '.ease-config.ease-config--up', title: 'Default Charge Controls', padY: 0,
    body: (
      <>
        <p><b>Soonest:</b> This sets the picker's own default minimum, used to prefill new items you add to this picker.</p>
        <p><b>Latest:</b> This sets the picker's own default maximum, used to prefill new items you add to this picker.</p>
        <p><b>Fill:</b> This fills the charge of every item in this picker at once.</p>
      </>
    ),
  },
  {
    id: 'dataPickerDefaultCadenceDown', sel: '.ease-config.ease-config--down', title: 'Default Charge Controls', padY: 0,
    body: (
      <>
        <p><b>Shortest:</b> This sets the picker's own default minimum, used to prefill new items you add to this picker.</p>
        <p><b>Longest:</b> This sets the picker's own default maximum, used to prefill new items you add to this picker.</p>
        <p><b>Refill:</b> This refills the charge of every item in this picker at once.</p>
      </>
    ),
  },
  {
    // padY:0 — .sched-line rows stack with zero gap (same pattern as
    // .rd-basics-row above), touching Daily Generator Toggle below.
    id: 'dataPickerConditionalToggle', sel: '.sched-line:has(button[aria-label="Attach a conditional"])', title: 'Picker Conditional', padY: 0,
    body: <>This lets you optionally gate this picker behind a conditional. When you attach a conditional, the picker will only run on days determined by that conditional's own rules. For example, giving yourself an occasional day off from chores. You can attach any existing conditional below, but if you want to create a new one you will need to use the Conditionals section above.</>,
  },
  {
    id: 'dataPickerConditionalRail', sel: '.rd-cnd-rail-row .cnd-rail', title: 'Select a Conditional', padY: 0,
    body: <>This lets you select an existing conditional to attach to this picker. If you don't have one yet, create one in the Conditionals section above.</>,
  },
  {
    // padY:0 — same .sched-line zero-gap stacking, touching Picker Cadence
    // below.
    id: 'dataPickerDailyToggle', sel: '.sched-line:has(button[aria-label*="Daily generator"])', title: 'Daily Generator Toggle', padY: 0,
    body: <>This determines whether the picker will be included in the app's daily auto-generator. When on, this picker's items will be automatically added to your todo list. When off, the picker won't run automatically, but you can still generate a pick manually from the Pickers tab.</>,
  },
  {
    // padY:0 — same .sched-line zero-gap stacking, touching Picker Day
    // Selection below.
    id: 'dataPickerCadence', sel: '.sched-line:has(select[aria-label="Cadence"])', title: 'Picker Cadence', padY: 0,
    body: (
      <>
        <p><b>Daily:</b> This is the picker's default cadence. It surfaces every day that it's scheduled to run, exactly like an ordinary picker.</p>
        <p><b>Weekly:</b> This surfaces the picker once a week, on whichever weekday you choose below. Once picked, that item stays on your todo list until you mark it as completed, even if that takes more than one day.</p>
        <p><b>Monthly:</b> This surfaces the picker once a month, on whichever day you choose below. Once picked, that item stays on your todo list until you mark it as completed, even if that takes more than one day.</p>
        <p><b>Yearly:</b> This surfaces the picker once a year, on whichever date you choose below. Once picked, that item stays on your todo list until you mark it as completed, even if that takes more than one day.</p>
      </>
    ),
  },
  {
    // padY:0 — same .sched-line zero-gap stacking, touching Picker
    // Holidays Toggle below.
    id: 'dataPickerDays', sel: '.sched-line:has(.dow-chips)', title: 'Picker Day Selection', padY: 0,
    body: <>This lets you choose which days of the week this picker is allowed to run on. Tap a day to toggle it on or off.</>,
  },
  {
    // padY:0 — same .sched-line zero-gap stacking, touching Picker Day
    // Selection above.
    id: 'dataPickerSkipHolidays', sel: '.sched-line:has(button[aria-label="Skip on holidays"])', title: 'Picker Holidays Toggle', padY: 0,
    body: <>This determines whether this picker skips major U.S. holidays. When on, this picker won't run on those days. You can edit which days count as holidays, or add your own, in Settings.</>,
  },
  {
    id: 'dataPickerFoot', sel: '.pk-ctl-foot .btn', title: 'Delete / Cancel / Save',
    body: (
      <>
        <p><b>Delete:</b> This button permanently deletes this picker, after asking you to confirm. This will also delete all of its items.</p>
        <p><b>Cancel:</b> This button discards any changes and closes this editor without saving.</p>
        <p><b>Save:</b> This button saves your changes to this picker.</p>
      </>
    ),
  },
  {
    // Scoped to .data-list so this doesn't also match the Conditionals/
    // Reminders managers' own "Add" buttons, which share the plain .rd-add
    // class but render outside .data-list entirely. padY:0 — .rd-add has
    // the same zero-gap stacking as .rd-item, touching the first item row
    // below it.
    id: 'dataAddItem', sel: '.data-list .rd-add', title: 'Create New Picker Item', padY: 0,
    body: <>This adds a new item to this picker's pool.</>,
  },
  {
    // perElement — every item in every expanded picker gets its own badge.
    // padY:0 — .rd-item rows stack with zero gap (touching, separated only
    // by a hairline border), same as conditionalRow/reminderRow.
    id: 'dataItemRow', sel: '.data-list .rd-item > .rd-row', perElement: true, padY: 0, title: 'Picker Item',
    body: <>This is one of this picker's items. Tap it to view and edit its settings.</>,
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
    // Function body (see help-mode.jsx's HelpTip) — reads the picker's own
    // cadence unit word (days/weeks/months/years) straight off the
    // already-rendered .np-ease-unit label instead of hardcoding "days",
    // which would be wrong for a non-daily cadence picker.
    id: 'itemChargeRangeUp', sel: '.entry-editor .pie-ease-up-row', padY: 0, title: 'Item Charge Controls',
    body: () => {
      const unit = document.querySelector('.entry-editor .pie-ease-up-row .np-ease-unit')?.textContent || 'days';
      return (
        <>
          <p><b>Soonest:</b> This controls the minimum number of {unit} that the item must wait before becoming eligible to be picked again.</p>
          <p><b>Latest:</b> This controls the maximum number of {unit} that the item must wait before becoming eligible to be picked again.</p>
          <p><b>Fill:</b> This will fill the item's charge to 100, making it eligible to be picked again.</p>
        </>
      );
    },
  },
  {
    id: 'itemChargeRangeDown', sel: '.entry-editor .pie-ease-down-row', padY: 0, title: 'Item Charge Controls',
    body: () => {
      const unit = document.querySelector('.entry-editor .pie-ease-down-row .np-ease-unit')?.textContent || 'days';
      return (
        <>
          <p><b>Shortest:</b> This controls the minimum number of {unit} that the item must stay as the active pick, after which a new item will be picked.</p>
          <p><b>Longest:</b> This controls the maximum number of {unit} that the item must stay as the active pick, after which a new item will be picked.</p>
          <p><b>Refill:</b> This will refill the item's charge back to 100, effectively resetting its active pick cadence.</p>
        </>
      );
    },
  },
  {
    id: 'itemWeight', sel: '.entry-editor .pie-row:has(.weight-stepper)', padY: 0, title: 'Item Weight',
    body: <>This adjusts this item's pick chance relative to the picker's other items. A higher weight makes it more likely to be picked and a lower weight makes it less likely.</>,
  },
  {
    id: 'itemBoost', sel: '.entry-editor .pie-row:has(.pie-boost-val)', padY: 0, title: 'Item Boost',
    body: <>This is the item's current boost, which climbs by 1 each time it isn't picked and resets to 0 the next time it is. A higher boost makes it more likely to be picked.</>,
  },
  {
    id: 'itemActive', sel: '.entry-editor .pie-row:has(.switch)', padY: 0, title: 'Item Active Toggle',
    body: <>This toggles whether this item is eligible to be picked. Turning it off sends the item on vacation, removing it from the picker's pool until it's turned back on.</>,
  },
  {
    // sel targets .rem-inline-foot (the shared wrapper), not .rd-edit-foot
    // specifically — Delete swaps that sibling out for .rem-foot-confirm
    // (its own Cancel/Delete pair), which a selector scoped to .rd-edit-foot
    // would miss entirely once that swap happens: no dim-mask hole, AND the
    // click-guard would treat its buttons as off-target and block them,
    // making the confirmation genuinely unreachable while help mode is on.
    // Delete is only rendered when !isNew (see EntryEditor in
    // tab-today.jsx) — :has(.btn--danger) splits this from itemFootNew
    // below rather than always mentioning Delete, same fix as
    // dataCondFoot/dataReminderFoot.
    id: 'itemFoot', sel: '.entry-editor .rem-inline-foot:has(.btn--danger) .btn', title: 'Delete / Cancel / Save',
    body: (
      <>
        <p><b>Delete:</b> This button permanently deletes this item, after asking you to confirm.</p>
        <p><b>Cancel:</b> This button discards any changes and closes this editor without saving.</p>
        <p><b>Save:</b> This button saves your changes to this item.</p>
      </>
    ),
  },
  {
    // New (unsaved) items never render a Delete button — see EntryEditor's
    // `!isNew &&` guard — so this covers that footer state with its own
    // Cancel/Save-only copy.
    id: 'itemFootNew', sel: '.entry-editor .rem-inline-foot:not(:has(.btn--danger)) .btn', title: 'Cancel / Save',
    body: (
      <>
        <p><b>Cancel:</b> This button discards the new item without saving it.</p>
        <p><b>Save:</b> This button saves the new item.</p>
      </>
    ),
  },
];

const SETTINGS_HELP_ITEMS = [
  {
    id: 'brandMark', sel: '.stat-h-lead .brand-mark', title: 'Home Link',
    body: <>You can click this logo at any time to navigate back to the home page of the app, the Today page.</>,
  },
  // ── Section rail — on mobile this collapses into a horizontal sticky
  // pill bar pinned above the sections (see .settings-rail's own
  // @container rule in styles2.css); on desktop it's a vertical sidebar.
  // One combined highlight over the whole rail rather than per-button,
  // matching the nav bar's own precedent.
  {
    // padY:0 — on narrow viewports this is sticky (position:sticky; top:0)
    // with its own opaque background; the default pad extended the mask
    // cutout past the rail's own real bottom edge, revealing whatever
    // page content had scrolled underneath it in that gap (nothing there
    // covers it — the dim overlay sits above the rail's own z-index:18,
    // and the cutout hole doesn't care that the rail's own box doesn't
    // reach that far).
    id: 'settingsRail', sel: '.settings-rail', title: 'Sections Navigation', padY: 0,
    body: <>This will let you jump straight to any section of the Settings page. On mobile devices, this will stay pinned to the top of the page no matter how far down you have scrolled.</>,
  },
  // ── Appearance ─────────────────────────────────────────────────────────
  {
    id: 'appearanceSystemPref', sel: '.set-section--appearance .set-data-row:has(button[aria-label="System preference"])', title: 'System Theme Preference',
    body: <>When on, the app follows your system's own light/dark setting and automatically switches between your chosen light and dark themes (e.g. Ink &rarr; Night) whenever your system does. When off, only your manually selected theme below applies.</>,
  },
  {
    id: 'appearanceThemeLight', sel: '.set-subsection--theme-light', title: 'Light Theme',
    body: <>This is where you choose the theme that's used when the app is in light mode. Pick any of the presets, or use the Custom row to mix your own colors. Custom themes will automatically generate a matching dark theme, which you're then free to edit separately.</>,
  },
  {
    // padY:4 (not the default 8) — consecutive .set-subsection blocks have
    // a real but modest 12px gap (.set-section's own flex gap), and 8+8
    // exceeds that by 4px; 4+4 stays safely inside it.
    id: 'appearanceThemeDark', sel: '.set-subsection--theme-dark', title: 'Dark Theme', padY: 4,
    body: <>This is where you choose the theme that's used when the app is in dark mode. Pick any of the presets, or use the Custom row to mix your own colors. Custom themes will automatically generate a matching light theme, which you're then free to edit separately.</>,
  },
  {
    id: 'appearanceCelebration', sel: '.set-subsection--celebration', title: 'Completion Celebration', padY: 4,
    body: <>This is where you choose which animation plays in the Today page when every item in your todo list is marked as done. Use Preview to watch any of them play out before picking one.</>,
  },
  {
    id: 'appearancePickAnim', sel: '.set-subsection--pickanim', title: 'Picker Animation', padY: 4,
    body: <>This is where you choose which animation plays in the Pickers tab when the manual picker functionality is triggered via the "Pick one" button. Use Preview to watch any of them play out before picking one.</>,
  },
  {
    id: 'appearanceLayout', sel: '.set-subsection--layout', title: 'Tab Bar Placement', padY: 4,
    body: <>This controls where the app's main navigation is positioned on screen: a floating bar at the bottom, a sidebar on the left, or a bar along the top.</>,
  },
  // ── Daily generator ────────────────────────────────────────────────────
  // padY:0 on all three below — .set-data-row rows have no margin between
  // them, just their own padding + a border-bottom (Card is a plain div,
  // not a flex/grid gap container), so they touch with zero gap.
  {
    id: 'dailyAutoToggle', sel: '.set-section--daily .set-data-row:has(button[aria-label="Run the Daily generator automatically"])', title: 'Run Generator Automatically', padY: 0,
    body: <>This toggles whether the Daily generator runs on its own each day. When off, you'll need to run it manually using the Regenerate button at the bottom of the Today page.</>,
  },
  {
    id: 'dailyRunTime', sel: '.set-section--daily .set-data-row--sub', title: 'Run Generator Time', padY: 0,
    body: <>This sets what time of day the Daily generator runs automatically. A quiet, early hour works best so your list is ready first thing in the morning.</>,
  },
  {
    id: 'dailyNotify', sel: '.set-notify-row', title: 'Run Generator Notification', padY: 0,
    body: <>This lets you get a notification once your todo list has been generated for the day. This is the only notification the app will ever send and only once a day. It only works while the app is open in a tab or window, but always push notifications are coming in a future release.</>,
  },
  // ── Holidays ───────────────────────────────────────────────────────────
  // padY:4 — .holiday-add has a real but modest 14px margin-top from
  // .holiday-list above it, and default 8+8 pad exceeds that by 2px.
  {
    id: 'holidayList', sel: '.holiday-list', title: 'Edit Observed Holidays', padY: 4,
    body: <>This lists every computed holiday for the current year. Toggle any of them off if you don't observe it, any picker set to "Skip on holidays" will respect these settings.</>,
  },
  {
    id: 'holidayAdd', sel: '.holiday-add', title: 'Add Custom Holiday', padY: 4,
    body: <>This lets you add your own custom holiday, like a birthday or anniversary, which pickers will respect if their "Skip on holidays" toggle is turned on.</>,
  },
  // ── Data control ───────────────────────────────────────────────────────
  // padY:0 on the whole group below — same zero-gap .set-data-row stacking
  // as Daily generator above.
  {
    id: 'dataStorageStatus', sel: '.set-store-row', title: 'Protect Your Data', padY: 0,
    body: <>This shows how your data is currently being stored, whether the browser has promised not to clear it, and roughly how much data you are storing in the app. Installing the app or granting persistent storage both help protect it from being cleared automatically.</>,
  },
  {
    // Exactly one of these four mutually-exclusive rows ever renders at a
    // time (already installed / can't install here / iOS Add to Home
    // Screen / Mac Add to Dock — see tab-settings.jsx), all sharing this
    // one class, so this covers whichever is actually showing.
    id: 'dataInstallInstructions', sel: '.set-store-ios', title: 'Install Instructions', padY: 0,
    body: <>This shows device and browser specific information about how to install the app. Installing the app has many benefits, but you can always keep using the app as a website if you prefer.</>,
  },
  {
    id: 'dataExport', sel: '.set-export-row', title: 'Export Your Data', padY: 0,
    body: <>This downloads a file containing all of your data: pickers, items, reminders, history and app settings. Since all app data lives on your device, you alone are responsible for taking care of it. It is also handy for moving your data to a new, or second, device.</>,
  },
  {
    id: 'dataImport', sel: '.set-import-row', title: 'Import Your Data', padY: 0,
    body: <>This restores your data from a previously exported backup file. Importing a backup <b>replaces all data</b> currently stored in the app, so make sure that's what you want first.</>,
  },
  {
    id: 'dataReset', sel: '.set-reset-row', title: 'Reset All Data', padY: 0,
    body: <>This wipes everything and restores the app to a clean, first-run state. <b>This can't be undone</b>, so export a backup first if there's any chance you'll want this data again.</>,
  },
  // ── Account ────────────────────────────────────────────────────────────
  {
    id: 'account', sel: '.set-section--account', title: 'Your Account',
    body: <>Ease My Life runs entirely on this device with no account required. Syncing your data across devices is planned as a future paid feature (a one-time fee, not a subscription).</>,
  },
  // ── About ──────────────────────────────────────────────────────────────
  {
    id: 'aboutInfo', sel: '.set-about', title: 'App Info',
    body: <>This shows the app's current version, along with links to the creator's website and this app's source code on GitHub.</>,
  },
  {
    id: 'aboutSupportProject', sel: '.set-support-project-row', title: 'Support the Project',
    body: <>A planned way to support development of the app directly, coming in a future release.</>,
  },
  {
    id: 'aboutReplayTour', sel: '.set-replay-tour-row', title: 'Replay the Welcome Tour',
    body: <>This replays the first-run walkthrough from the very beginning, including the welcome message and all of the tutorials.</>,
  },
  {
    id: 'aboutContactTrigger', sel: '.set-contact-trigger', title: 'Contact Support',
    body: <>This opens a short form for sending a message directly to the developer. Your app version and browser are attached automatically, so there's no back-and-forth needed to track those down.</>,
  },
  {
    id: 'aboutContactForm', sel: '.support-form', title: 'Support Message',
    body: <>Fill in a subject and message describing your problem or suggestion. Your app version and browser are already filled in below for reference.</>,
  },
  {
    id: 'aboutContactFormFoot', sel: '.support-form-foot', title: 'Cancel / Send',
    body: (
      <>
        <p><b>Cancel:</b> This discards your message and closes the form without sending.</p>
        <p><b>Send:</b> This sends your message. If it can't go through &mdash; for example if you're offline &mdash; you'll be shown an email address to reach out to instead, and your message will be kept so you can try again.</p>
      </>
    ),
  },
  // ── Legal ──────────────────────────────────────────────────────────────
  // padY:0 on both — same zero-gap .set-data-row stacking as above.
  {
    id: 'legalPrivacy', sel: '.set-privacy-row', title: 'Privacy Policy', padY: 0,
    body: <>This opens the Privacy Policy, which explains how your data is collected, used, and stored.</>,
  },
  {
    id: 'legalTerms', sel: '.set-terms-row', title: 'Terms of Service', padY: 0,
    body: <>This opens the Terms of Service, which covers the rules for using Ease My Life, including any paid features.</>,
  },
];

export { TODAY_HELP_ITEMS, PICKER_HELP_ITEMS, STATS_HELP_ITEMS, DATA_HELP_ITEMS, SETTINGS_HELP_ITEMS };
