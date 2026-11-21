


// #region Imports

import type { HelIteTyp } from './catalog-item.ts'; // What: Help Item Type. Why: Every item in this catalog shares the one shape help mode reads. How: This types STA_HEL_ARR.

// #endregion Imports



/**
 * stats-catalog.tsx = Stats Catalog
 *
 * @summary
 * The on-demand help catalog for the Stats tab, which help mode (see
 * help/mode.tsx) highlights and explains one item at a time.
 *
 * Copy is largely forked from onboarding/page-steps.tsx's own STA_TAR_OBJ
 * catalog, same targets, same underlying explanation, with directive tour
 * language ("click Next", "click Done when ready", "these buttons are
 * disabled for this tutorial") stripped out, since a help-mode tip has no
 * steps to advance through and nothing it points at is ever disabled.
 *
 * One item per DISTINCT piece of functionality, not one per DOM element, so
 * a row of related controls gets one tip explaining what the whole row does
 * rather than one per control. Every item is a HelIteTyp, whose fields are
 * documented once on the type in catalog-item.ts, so no item repeats their
 * comments; each item's opening line carries its identity comment instead.
 *
 * Sections:
 *  - Constants
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const STA_HEL_ARR : HelIteTyp[] = [ // What: Stats Help Array. Why: This is the on-demand help catalog for the Stats tab, one entry per distinct piece of functionality on that page rather than one per DOM element. How: This is imported by tab-stats.tsx and passed to HelOveCom as its own helIteArr prop.


	// #region Stats Header

	{ // What: Home Link Help Item. Why: This is the on-demand help tip for the Home Link element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>You can click this logo at any time to navigate back to the home page of the app, the Today page.</>,
		ideStr : 'brandMark',
		selStr : '[data-element-name-hook~="heaLeaDiv"] [data-element-name-hook~="braMarBut"]',
		titStr : 'Home Link'


	},

	{ // What: Group Filter Help Item. Why: This is the on-demand help tip for the Group Filter element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This filters the pickers row below by group, which is extremely useful if you have created a lot of pickers.</>,
		ideStr : 'groupFilter',
		selStr : '[data-element-name-hook~="groFilDiv"] [data-element-name-hook~="filPilBut"]',
		titStr : 'Group Filter'


	},

	{ // What: Type Filter Help Item. Why: This is the on-demand help tip for the Type Filter element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This filters the pickers row below by type. You can select picker mode (Truly Random, Weighted, Dynamic Weighted, Ease Up, Ease Down), Conditionals or Reminders, independent of the Group filter above with both narrowing the row together.</>,
		ideStr : 'typeFilter',
		selStr : '[data-element-name-hook~="typFilDiv"] [data-element-name-hook~="filPilBut"]',
		titStr : 'Type Filter'


	},

	{ // What: Show Selector Help Item. Why: This is the on-demand help tip for the Show Selector element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This selects what the rest of the page shows: conditionals, reminders, a specific picker, or everything all at once.</>,
		ideStr : 'pickersFilter',
		selStr : '[data-element-name-hook~="scoTabDiv"] [data-element-name-hook~="scoTabBut"]',
		titStr : 'Show Selector'


	},

	{ // What: Range Filter Help Item. Why: This is the on-demand help tip for the Range Filter element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This further narrows your selection by date range, with ranges from 1 week to 1 year to all time.</>,
		ideStr : 'rangeFilter',
		selStr : '[data-element-name-hook~="ranPilDiv"] [data-element-name-hook~="ranPilBut"]',
		titStr : 'Range Filter'


	},

	// #endregion Stats Header



	// #region Headline Numbers

	// Three different card sets share the same position (between the Range filter and the heatmap/breakdown below), one per scope: All/a specific picker, Reminders, and Conditionals. Each card needed its own stat-mk-* marker class in tab-stats.tsx first, since they all otherwise share the plain .staCarDiv class with nothing to distinguish one from another. // padXcoNum/padYcoNum: 4, these 4 cards sit in a CSS grid with only a 10px gap (both row-gap and column-gap, since it's a single `gap: 10px` on .staRowDiv), so the default 8px pad on each side would overlap a neighbor's own pad by 6px, on whichever edge is shared (right/left in the desktop single-row layout, all four edges in the mobile 2x2 grid). 4+4=8 leaves 2px of daylight in the 10px gap instead. // All and a specific picker scope both render these same stat-mk-* cards (see tab-stats.tsx's own comment on stat-mk-scope-*), so each gets its own entry below scoped to stat-mk-scope-all/-picker, with its own title/copy.
	{ // What: Day Streak Help Item. Why: This is the on-demand help tip for the Day Streak element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This shows your current streak of consecutive days where you've completed all items in your todo list.</>,
		ideStr    : 'statStreak',
		padXcoNum : 4,
		padYcoNum : 4,
		selStr    : '[data-element-name-hook~="staStkDiv"]:not([data-picker-scope-active])',
		titStr    : 'Day Streak'


	},

	{ // What: Full Days Help Item. Why: This is the on-demand help tip for the Full Days element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This shows the number of days where you completed everything in your todo list that day, compared to the number of total active days shown next to it.</>,
		ideStr    : 'statFullDays',
		padXcoNum : 4,
		padYcoNum : 4,
		selStr    : '[data-element-name-hook~="staFulDiv"]:not([data-picker-scope-active])',
		titStr    : 'Full Days'


	},

	{ // What: Items Done Help Item. Why: This is the on-demand help tip for the Items Done element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This shows the total number of items you've completed in this range.</>,
		ideStr    : 'statDone',
		padXcoNum : 4,
		padYcoNum : 4,
		selStr    : '[data-element-name-hook~="staDonDiv"]:not([data-picker-scope-active])',
		titStr    : 'Items Done'


	},

	{ // What: Completion Rate Help Item. Why: This is the on-demand help tip for the Completion Rate element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This shows the percentage of items you've completed, out of every item that was in your todo list in this range.</>,
		ideStr    : 'statRate',
		padXcoNum : 4,
		padYcoNum : 4,
		selStr    : '[data-element-name-hook~="staRatDiv"]:not([data-picker-scope-active])',
		titStr    : 'Completion Rate'


	},

	{ // What: Picker Day Streak Help Item. Why: This is the on-demand help tip for the Picker Day Streak element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This shows your current streak of consecutive days where you've completed all items in your todo list.</>,
		ideStr    : 'statPickerStreak',
		padXcoNum : 4,
		padYcoNum : 4,
		selStr    : '[data-element-name-hook~="staStkDiv"][data-picker-scope-active]',
		titStr    : 'Picker Day Streak'


	},

	{ // What: Picker Full Days Help Item. Why: This is the on-demand help tip for the Picker Full Days element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This shows the number of days where you've completed everything in your todo list for that day, compared to the number of total active days shown next to it.</>,
		ideStr    : 'statPickerFullDays',
		padXcoNum : 4,
		padYcoNum : 4,
		selStr    : '[data-element-name-hook~="staFulDiv"][data-picker-scope-active]',
		titStr    : 'Picker Full Days'


	},

	{ // What: Picker Items Done Help Item. Why: This is the on-demand help tip for the Picker Items Done element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This shows the total number of items that you've completed for your selected range.</>,
		ideStr    : 'statPickerDone',
		padXcoNum : 4,
		padYcoNum : 4,
		selStr    : '[data-element-name-hook~="staDonDiv"][data-picker-scope-active]',
		titStr    : 'Picker Items Done'


	},

	{ // What: Picker Completion Rate Help Item. Why: This is the on-demand help tip for the Picker Completion Rate element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This shows the percentage of items that you've completed, out of every item that was in your todo list.</>,
		ideStr    : 'statPickerRate',
		padXcoNum : 4,
		padYcoNum : 4,
		selStr    : '[data-element-name-hook~="staRatDiv"][data-picker-scope-active]',
		titStr    : 'Picker Completion Rate'


	},

	// padXcoNum/padYcoNum: 4, same .staRowDiv (10px gap) bleed fix as the other headline-card rows: default 8px pad on each side overlaps a neighbor's own pad across the shared edge, side by side on wide viewports and 2x2 on narrow ones.
	{ // What: Reminders Completed Help Item. Why: This is the on-demand help tip for the Reminders Completed element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This shows the total number of reminders that you've completed for your selected range.</>,
		ideStr    : 'statRemDone',
		padXcoNum : 4,
		padYcoNum : 4,
		selStr    : '[data-element-name-hook~="remDonDiv"]',
		titStr    : 'Reminders Completed'


	},

	{ // What: Reminders This Week Help Item. Why: This is the on-demand help tip for the Reminders This Week element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This shows the number of reminders that you've completed in the last 7 days, regardless of your selected range.</>,
		ideStr    : 'statRemWeek',
		padXcoNum : 4,
		padYcoNum : 4,
		selStr    : '[data-element-name-hook~="remWeeDiv"]',
		titStr    : 'Reminders This Week'


	},

	{ // What: Reminders Active Days Help Item. Why: This is the on-demand help tip for the Reminders Active Days element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This shows the total number of days for your selected range where you've completed at least one reminder.</>,
		ideStr    : 'statRemActive',
		padXcoNum : 4,
		padYcoNum : 4,
		selStr    : '[data-element-name-hook~="remActDiv"]',
		titStr    : 'Reminders Active Days'


	},

	{ // What: Reminders Busiest Day Help Item. Why: This is the on-demand help tip for the Reminders Busiest Day element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This shows the highest number of reminders that you've completed in a single day for your selected range.</>,
		ideStr    : 'statRemBusiest',
		padXcoNum : 4,
		padYcoNum : 4,
		selStr    : '[data-element-name-hook~="remBusDiv"]',
		titStr    : 'Reminders Busiest Day'


	},

	// padXcoNum/padYcoNum: 4, same .staRowDiv (10px gap) bleed fix as the other headline-card rows: default 8px pad on each side overlaps a neighbor's own pad across the shared edge, side by side on wide viewports and 2x2 on narrow ones.
	{ // What: Conditionals Triggered Help Item. Why: This is the on-demand help tip for the Conditionals Triggered element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This shows the total number of times that any conditional has been triggered for your selected range.</>,
		ideStr    : 'statCondFired',
		padXcoNum : 4,
		padYcoNum : 4,
		selStr    : '[data-element-name-hook~="conFirDiv"]',
		titStr    : 'Conditionals Triggered'


	},

	{ // What: Conditionals Cycles Help Item. Why: This is the on-demand help tip for the Conditionals Cycles element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This shows the total number of cycles that any conditional was evaluated over for your selected range, regardless of whether it was triggered or not.</>,
		ideStr    : 'statCondCycles',
		padXcoNum : 4,
		padYcoNum : 4,
		selStr    : '[data-element-name-hook~="conCycDiv"]',
		titStr    : 'Conditionals Cycles'


	},

	{ // What: Conditionals Fire Rate Help Item. Why: This is the on-demand help tip for the Conditionals Fire Rate element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This shows the percentage of evaluated cycles that resulted in a triggered conditional for your selected range.</>,
		ideStr    : 'statCondRate',
		padXcoNum : 4,
		padYcoNum : 4,
		selStr    : '[data-element-name-hook~="conRatDiv"]',
		titStr    : 'Conditionals Fire Rate'


	},

	{ // What: Conditionals Last Fired Help Item. Why: This is the on-demand help tip for the Conditionals Last Fired element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This shows the most recent data that any conditional in your selected range was triggered.</>,
		ideStr    : 'statCondLast',
		padXcoNum : 4,
		padYcoNum : 4,
		selStr    : '[data-element-name-hook~="conLasDiv"]',
		titStr    : 'Conditionals Last Fired'


	},

	{ // What: Activity Heatmap Help Item. Why: This is the on-demand help tip for the Activity Heatmap element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This visualizes your completed activity over time, with each day shaded by how much you got done. If you click on any day, more details for it will be shown below the heatmap.</>,
		ideStr : 'heatmap',
		selStr : '[data-element-name-hook~="heaMapDiv"]',
		titStr : 'Activity Heatmap'


	},

	// #endregion Headline Numbers



	// #region All Scope Only

	{ // What: Conditional Statistics Help Item. Why: This is the on-demand help tip for the Conditional Statistics element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This summarizes your conditionals' activity for your selected range. It includes how many times they've triggered, their overall fire rate, and a per-conditional breakdown. It will only show if you have at least one conditional.</>,
		ideStr : 'statConditionalsSummary',
		selStr : '[data-element-name-hook~="conSumDiv"]',
		titStr : 'Conditional Statistics'


	},

	{ // What: Reminders Statistics Help Item. Why: This is the on-demand help tip for the Reminders Statistics element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This summarizes your completed reminders' activity for your selected range, along with a short recent-activity list. It will only show if you have the "Include in Stats" toggle enabled for reminders.</>,
		ideStr : 'statRemindersSummary',
		selStr : '[data-element-name-hook~="remSumDiv"]',
		titStr : 'Reminders Statistics'


	},

	{ // What: Picker Items Chosen Type Help Item. Why: This is the on-demand help tip for the Picker Items Chosen Type element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This breaks down how your picker items made it onto your todo list. This includes auto-generated, re-rolled or hand-picked from the Pickers tab.</>,
		ideStr : 'statSource',
		selStr : '[data-element-name-hook~="souBreDiv"]',
		titStr : 'Picker Items Chosen Type'


	},

	{ // What: Picker Items Most Picked Help Item. Why: This is the on-demand help tip for the Picker Items Most Picked element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This lists the 5 picker items that have been picked the most for your selected range.</>,
		ideStr    : 'statMostPicked',
		padXcoNum : 4,
		padYcoNum : 4,
		selStr    : '[data-element-name-hook~="mosPicDiv"]',
		titStr    : 'Picker Items Most Picked'


	},

	{ // What: Picker Items Least Picked Help Item. Why: This is the on-demand help tip for the Picker Items Least Picked element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This lists the 5 picker items that have been picked the least for your selected range. This excludes any picker items that are currently inactive.</>,
		ideStr    : 'statColdest',
		padXcoNum : 4,
		padYcoNum : 4,
		selStr    : '[data-element-name-hook~="colIteDiv"]',
		titStr    : 'Picker Items Least Picked'


	},

	// #endregion All Scope Only



	// #region Conditionals Scope Only

	{ // What: Conditionals Breakdown Help Item. Why: This is the on-demand help tip for the Conditionals Breakdown element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This breaks down every conditional for your selected range individually. You can switch between fire rate, triggers, cycles, interval and last fired to see each conditional from a different angle.</>,
		ideStr : 'statCondBreakdown',
		selStr : '[data-element-name-hook~="conBreDiv"]',
		titStr : 'Conditionals Breakdown'


	},

	// #endregion Conditionals Scope Only



	// #region Reminders Scope Only

	{ // What: Reminders Completed Type Help Item. Why: This is the on-demand help tip for the Reminders Completed Type element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This breaks down your completed reminders by type, one-time versus recurring, for your selected range.</>,
		ideStr : 'statRemType',
		selStr : '[data-element-name-hook~="remTypDiv"]',
		titStr : 'Reminders Completed Type'


	},

	{ // What: Reminders Breakdown Help Item. Why: This is the on-demand help tip for the Reminders Breakdown element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This breaks down every reminder for your selected range individually. You can switch between recent completions, total completions and skips to see each reminder from a different angle.</>,
		ideStr : 'statRemBreakdown',
		selStr : '[data-element-name-hook~="remBreDiv"]',
		titStr : 'Reminders Breakdown'


	},

	// #endregion Reminders Scope Only



	// #region Single-Picker Scope Only

	// Same 3-way split as the Pickers page's own Picker Name/Picker Type/Picker Explanation (see those entries' own comments), not a single combined highlight, Conditionals/Reminders scope has no equivalent block, so there's nothing to split there.
	{ // What: Picker Name Help Item. Why: This is the on-demand help tip for the Picker Name element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This is the name of the currently selected picker.</>,
		ideStr    : 'pickerName',
		padYcoNum : 2, // padYcoNum: 2, the mode pill sits only 4px below, a little tighter than the Pickers page's 6px (see .picIdeDiv's own --pil-top-mar in tab-stats.module.css); the default 8px pad on each side would overlap by 12px otherwise.
		selStr    : '[data-element-name-hook~="picIdeDiv"] [data-element-name-hook~="picTitHea"]',
		titStr    : 'Picker Name'


	},

	{ // What: Picker Type Help Item. Why: This is the on-demand help tip for the Picker Type element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This shows the currently selected picker's type (Truly Random, Weighted, Dynamic Weighted, Ease Up, or Ease Down).</>,
		ideStr    : 'pickerTypePill',
		padYcoNum : 2, // padYcoNum: 2, see pickerName's own comment, same 6px gap, same fix.
		selStr    : '[data-element-name-hook~="picIdeDiv"] [data-element-name-hook~="modPilSpa"]',
		titStr    : 'Picker Type'


	},

	{ // What: Picker Explanation Help Item. Why: This is the on-demand help tip for the Picker Explanation element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This explains the currently selected picker's ruleset, including how it chooses an item and why you might pick this type over another.</>,
		ideStr : 'pickerExplanation',
		selStr : '[data-element-name-hook~="picIdeDiv"] [data-element-name-hook~="picHinPar"]',
		titStr : 'Picker Explanation'


	},

	{ // What: Picker Breakdown Help Item. Why: This is the on-demand help tip for the Picker Breakdown element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This breaks down every picker item for your selected range individually. You can switch between pick count, pick frequency, last picked date and more to see each picker item from a different angle.</>,
		ideStr : 'pickerBreakdown',
		selStr : '[data-element-name-hook~="breCarDiv"]',
		titStr : 'Picker Breakdown'


	}

	// #endregion Single-Picker Scope Only


];

// #endregion Constants



// #region Exports

export { STA_HEL_ARR }; // What: Named Export. Why: The Stats tab renders its own help toggle and hands help mode this catalog. How: This exports the catalog by name.

// #endregion Exports


