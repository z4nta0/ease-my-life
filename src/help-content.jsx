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
    id: 'cardCheck', sel: '.today-card:first-of-type .check', title: 'Mark Complete',
    body: <>Click this circle to mark an item as done. Doing so applies that item's value/weight consequences and, once everything for the day is checked off, increases your Day Streak.</>,
  },
  {
    id: 'cardActions', sel: '.today-card:first-of-type .today-card-actions', title: 'Card Actions',
    body: (
      <ol className="help-tip-list">
        <li><b>Re-roll</b> — swap this item for a different one from the same picker, without waiting for the next generation.</li>
        <li><b>Skip</b> — remove this item from today's list without completing it.</li>
        <li><b>Edit</b> — rename this item on the spot.</li>
      </ol>
    ),
  },
  {
    id: 'addReminder', sel: '.rem-add-btn', title: 'Add a Reminder',
    body: <>This creates a new one-time or recurring reminder — a task with a fixed schedule, distinct from a picker's randomly-chosen items.</>,
  },
  {
    id: 'dayLog', sel: '.rem-section .dl-chip', title: 'Day Log',
    body: <>This opens a log of everything the daily generator did for this section today — what was auto-picked, what was skipped, and why.</>,
  },
  {
    id: 'regenerate', sel: '.ob-generate', title: 'Regenerate',
    body: <>This re-runs the daily generator by hand, replacing today's list. Anything already marked complete will be replaced too, and won't show up in the Stats tab.</>,
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
