


// #region Imports

import React from 'react'; // What: React. Why: This is the UI library every JSX fragment/element in this file's own catalogs is written against. How: This is reached indirectly, through the <> fragments and elements used in each item's own title/body.


import { Icon } from './ui.jsx'; // What: Icon. Why: Several items' own body copy renders a small inline icon next to a button's own label, so a reader can match the tip back to the real control. How: This is rendered inside body JSX throughout this file's own catalogs (e.g. Card Actions, Picker Items).

// #endregion Imports



/**
 * help-content.jsx = Help Content
 *
 * @summary
 * Per-page { id, sel, shape?, title, body } catalogs for the on-demand help
 * mode (see help-mode.jsx). Copy is largely forked from
 * onboarding-page-tours.jsx's own PICKER_PAGE_TARGETS / STATS_PAGE_TARGETS /
 * DATA_PAGE_TARGETS / SETTINGS_PAGE_TARGETS catalogs, same targets, same
 * underlying explanation, with directive tour language ("click Next", "click
 * Done when ready", "these buttons are disabled for this tutorial") stripped
 * out, since a help-mode tip has no steps to advance through and nothing it
 * points at is ever disabled. See the onboarding-engine-reuse-design memory's
 * "Shared content unit" section for why this forking (not a shared import) was
 * the intended plan once real content rollout began.
 *
 * One item per DISTINCT piece of functionality, not one per DOM element, e.g.
 * a card's Re-Roll/Skip/Edit icons share one tip (a numbered list) rather than
 * three, and a group of filter pills gets one tip explaining what the whole
 * row does rather than one per pill. Kept in its own module (rather than
 * inline per-tab like the original 2-item Today test case) so every tab can
 * import from one place and so future content edits don't require touching
 * each tab file.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



const TODAY_HELP_ITEMS = [ // What: Today Help Items Array. Why: This is the on-demand help catalog for the Today tab, one entry per distinct piece of functionality on that page rather than one per DOM element. How: This is imported by tab-today.jsx and passed to HelpOverlay as its own items prop, prepended there with the shared nav/rail items every page gets.


	{


		id    : 'progressRing', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.ring', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		shape : 'circle', // What: Shape Override String. Why: This target's round appearance does not come from its own CSS border-radius. How: This is passed to help-mode.jsx's own shaRadFun, which skips reading CSS entirely and forces a perfect ellipse instead.
		title : 'Progress Ring', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This tracks your current progress of completed / total tasks for today's todo list. Once filled completely, your Day Streak will increase and the celebration animations will play.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'brandMark', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.today-h-lead .brand-mark', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Home Link', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>You can click this logo at any time to navigate back to the home page of the app, the Today page.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'streak', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.streak', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Day Streak', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This counts how many days in a row you've completed everything on your todo list. Missing a day resets it back to zero.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'groupsNav', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.group-rail ul', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'List Navigation', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This is the todo list's navigation, allowing you to jump directly to a group's section. Over time your list can grow quite long and this helps to eliminate any long scrolling.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// padX: 4, .foot-editmode sits right next to .ob-generate (Regenerate)
	// with only a 10px gap between them; the default 8px pad on each side
	// would overlap by 6px.
	// title/body as functions (see help-mode.jsx's own comment on this
	// pattern, e.g. the Charge Controls items): .em-rail-btn is the SAME
	// button throughout, relabeled "Done" once Edit Mode is on rather than
	// being swapped for a different element, a static "Edit Mode" tip
	// used to keep showing even while the button (and its real behavior)
	// had already become Done. .foot-editmode only ever matches while NOT
	// editing (it unmounts entirely once editMode is true, see the
	// editmode-foot-actions item below for what replaces it), so reading
	// .em-rail-btn's own is-on class here correctly reflects either case
	// regardless of which of the two elements actually got matched.
	{


		id    : 'editMode', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.em-rail-btn, .foot-editmode', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		padX  : 4, // What: Horizontal Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin horizontally only, read by claPadFun/badRecFun.
		title : () => (document.querySelector('.em-rail-btn')?.classList.contains('is-on') ? 'Done Button' : 'Edit Mode'), // What: Title Function. Why: This item's own heading depends on something only known at open time, a live DOM value or a matched element's own name. How: help-mode.jsx's HelTipCom calls this with the item's own target rect and renders the returned string.

		body  : () => (document.querySelector('.em-rail-btn')?.classList.contains('is-on') // What: Body Function. Why: This item's own explanatory copy depends on something only known at open time, a live DOM value read off the matched element. How: help-mode.jsx's HelTipCom calls this and renders the returned JSX.
			? <>This button saves any edits that you have made and exits Edit Mode.</>
			: <>This lets you rearrange the positions of the groups and items, as well as rename the groups.</>),


	},

	// .editmode-banner-actions is the Cancel/Done pair in Edit Mode's own
	// sticky banner. .editmode-foot-actions (styles2.css/tab-today.jsx) is
	// the identical pair repeated in the footer, distinguished from the
	// OTHER (non-editing) footer actions row that shares .today-foot-
	// actions with it, findTargets' comma syntax is fallback-only (see
	// groupNameEdit's own comment in this file for why that distinction
	// matters), so this needs its own class rather than reusing the shared
	// one, and can't be combined with editmode-banner-actions into one
	// sel either, for the same reason (both are always present together
	// while Edit Mode is on, so the first one found would always win).
	{


		id    : 'editModeBannerActions', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.editmode-banner-actions', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Cancel / Done', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body  : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>
				<p><b>Cancel:</b> This button discards any reordering or renaming edits that you have made and exits Edit Mode.</p>
				<p><b>Done:</b> This button saves any edits that you have made and exits Edit Mode.</p>
			</>


		),


	},

	{


		id    : 'editModeFootActions', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.editmode-foot-actions', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Cancel / Done', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body  : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>
				<p><b>Cancel:</b> This button discards any reordering or renaming edits that you have made and exits Edit Mode.</p>
				<p><b>Done:</b> This button saves any edits that you have made and exits Edit Mode.</p>
			</>


		),


	},

	// These three only exist in the DOM while Edit Mode is on, same
	// "findTargets returns nothing, item silently skipped" handling as the
	// side-placement rail handle (see help-mode.jsx). perElement: every
	// group's own grip gets its own badge, since a user editing a long
	// list could be looking at any one of them, not just the first.
	// padX: 1, .group-grip and .group-name--editable sit only 4px apart in
	// practice (the negative margin on .group-grip eats into .group-h-l's
	// own 10px gap), the default 8px pad on each side, and even editMode's
	// own padX:4 fix above, both still overlap here. 1px each side leaves
	// 2px of real clearance instead.
	{


		id         : 'groupGrip', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel        : '.group-grip', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		perElement : true, // What: Per Element Boolean. Why: More than one element on the page can match this item's own selector at once, and a user could be looking at any of them, not just the first. How: This tells HelpOverlay to render one badge per matched element instead of unioning them into a single highlight.
		title      : 'Reorder Group', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padX       : 1, // What: Horizontal Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin horizontally only, read by claPadFun/badRecFun.
		body       : <>While Edit Mode is on, drag this handle to change this group's position in your todo list.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id         : 'cardGrip', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel        : '.card-grip', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		perElement : true, // What: Per Element Boolean. Why: More than one element on the page can match this item's own selector at once, and a user could be looking at any of them, not just the first. How: This tells HelpOverlay to render one badge per matched element instead of unioning them into a single highlight.
		title      : 'Reorder Item', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body       : <>While Edit Mode is on, drag this handle to change this item's position within its group.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// .group-name-slot is a shared class on BOTH the button (idle) and the
	// input (mid-edit), findTargets' comma syntax is fallback-only (try
	// the first selector, only try the next if it matched NOTHING at all),
	// not a union, so '.group-name--editable, .group-name-input' silently
	// dropped whichever group was actively being edited the moment any
	// OTHER group's plain button still matched. One stable class sidesteps
	// that entirely: clicking a name to rename it used to make this exact
	// highlight vanish and leave the now-visible input hidden behind the
	// dimmer, right when a user is actually interacting with it.
	{


		id         : 'groupNameEdit', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel        : '.group-name-slot', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		perElement : true, // What: Per Element Boolean. Why: More than one element on the page can match this item's own selector at once, and a user could be looking at any of them, not just the first. How: This tells HelpOverlay to render one badge per matched element instead of unioning them into a single highlight.
		title      : 'Rename Group', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padX       : 1, // What: Horizontal Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin horizontally only, read by claPadFun/badRecFun.
		body       : <>While Edit Mode is on, click a group's name to rename it.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// perElement (see help-mode.jsx): every real entry card gets its own
	// badge, a user could be looking at any card on the page, not just
	// whichever one happened to be first, and the main help toggle can be
	// clicked from anywhere regardless of scroll position.
	{


		id         : 'cardCheck', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel        : '.today-card:not(.today-card--tutorial) .check', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		perElement : true, // What: Per Element Boolean. Why: More than one element on the page can match this item's own selector at once, and a user could be looking at any of them, not just the first. How: This tells HelpOverlay to render one badge per matched element instead of unioning them into a single highlight.
		title      : 'Mark Complete', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body       : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>
				<p>When you click this circle, it marks the item as completed and updates the progress ring's completed count. When all items are completed, your Day Streak increases and the celebration animations will play.</p>
				<p>For items that belong to a picker with updatable values, marking as complete will also apply updates to all of the pickers' items. Dynamic Weighted items wil have their boost value increased or reset to 0. Ease Up and Ease Down items will have their charge values increased or decreased, respectively.</p>
			</>


		),


	},

	// Reminders and picker-generated entries share the same .today-card-
	// actions markup but not the same buttons (reminders have no Re-Roll,
	// there's nothing to re-roll TO, it's a fixed task, not a random pick),
	// so this needs two separate items rather than one shared description.
	// Also excludes day-off and charging cards, both render a
	// .today-card-actions row too, but with Re-Roll and/or Edit genuinely
	// disabled (the app's own InfoTip there says "This action is disabled
	// for this type of item"), which this tip's copy doesn't describe.
	// perElement (see help-mode.jsx) so every OTHER card gets its own badge
	// a single shared one could land on a card whose buttons happen to
	// be in an unusual state, or just not be near wherever the user
	// actually scrolled to.
	{


		id         : 'cardActionsPicker', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel        : '.today-card:not(.rem-card):not(.today-card--tutorial):not(.today-card--dayoff):not(.today-card--charging) .today-card-actions', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		perElement : true, // What: Per Element Boolean. Why: More than one element on the page can match this item's own selector at once, and a user could be looking at any of them, not just the first. How: This tells HelpOverlay to render one badge per matched element instead of unioning them into a single highlight.
		title      : 'Card Actions', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body       : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>
				<div className='help-nav-item'>
					<div className='help-nav-label'><Icon name='refresh' size={14} /><b>Re-Roll:</b></div>
					<p>This button swaps this item for a different one from the same picker, without waiting for the next generation.</p>
				</div>
				<div className='help-nav-item'>
					<div className='help-nav-label'><Icon name='skip' size={14} /><b>Skip:</b></div>
					<p>This button removes this item from your todo list without completing it and updates the progress ring's total count accordingly.</p>
				</div>
				<div className='help-nav-item'>
					<div className='help-nav-label'><Icon name='edit' size={14} /><b>Edit:</b></div>
					<p>This button adjusts this item's properties. That includes its name, schedule (reminders only), values (pickers only) and active toggle (pickers only).</p>
				</div>
			</>


		),


	},

	{


		id         : 'cardActionsReminder', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel        : '.rem-card .today-card-actions', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		perElement : true, // What: Per Element Boolean. Why: More than one element on the page can match this item's own selector at once, and a user could be looking at any of them, not just the first. How: This tells HelpOverlay to render one badge per matched element instead of unioning them into a single highlight.
		title      : 'Card Actions', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body       : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>
				<div className='help-nav-item'>
					<div className='help-nav-label'><Icon name='skip' size={14} /><b>Skip:</b></div>
					<p>This button removes this item from your todo list without completing it and updates the progress ring's total count accordingly.</p>
				</div>
				<div className='help-nav-item'>
					<div className='help-nav-label'><Icon name='edit' size={14} /><b>Edit:</b></div>
					<p>This button adjusts this item's properties. That includes its name, schedule (reminders only), values (pickers only) and active toggle (pickers only).</p>
				</div>
			</>


		),


	},

	// A day-off card (a conditional's triggered "rest" state) is excluded
	// from cardActionsPicker above since it doesn't have the normal 3-
	// button set, but unlike a charging card (where Re-Roll/Skip/Edit are
	// ALL genuinely disabled, nothing real to highlight), a day-off card's
	// own Skip IS a real, working button, only Re-Roll and Edit are
	// disabled there. `button` (not .icon-btn generally) specifically
	// targets that one real button, the disabled Re-Roll/Edit are
	// InfoTip's own <span> root, not a <button>, so this selector can't
	// accidentally catch them.
	{


		id         : 'cardActionsDayOff', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel        : '.today-card--dayoff .today-card-actions button', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		perElement : true, // What: Per Element Boolean. Why: More than one element on the page can match this item's own selector at once, and a user could be looking at any of them, not just the first. How: This tells HelpOverlay to render one badge per matched element instead of unioning them into a single highlight.
		title      : 'Skip', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body       : <>This button removes this day off from your todo list without completing it and updates the progress ring's total count accordingly. Re-Roll and Edit are disabled for this type of card.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// -- Editing a picker item's full settings (EntryEditor), reachable from
	// Today's own Edit button too, not just the Data tab (DATA_HELP_ITEMS has
	// its own copy of these same 6 items, scoped identically via
	// .entry-editor, that class is shared verbatim by both tabs since it's
	// literally the same EntryEditor component either way). Item Name is the
	// one exception: Today's own name field lives right on the card
	// (.entry-card-name-input, EntryCard's own markup), not inside
	// .entry-editor like Data's .rd-name-input does.
	{


		id    : 'itemName', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.entry-card-name-input', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Item Name', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This is the name field for this item, you can rename it here.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// Function body (see help-mode.jsx's HelpTip), reads the picker's own
	// cadence unit word (days/weeks/months/years) straight off the
	// already-rendered .np-ease-unit label instead of hardcoding "days",
	// which would be wrong for a non-daily cadence picker.
	{


		id    : 'itemChargeRangeUp', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.entry-editor .pie-ease-up-row', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		title : 'Item Charge Controls', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body  : () => { // What: Body Function. Why: This item's own explanatory copy depends on something only known at open time, a live DOM value read off the matched element. How: help-mode.jsx's HelTipCom calls this and renders the returned JSX.


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


		id    : 'itemChargeRangeDown', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.entry-editor .pie-ease-down-row', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		title : 'Item Charge Controls', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body  : () => { // What: Body Function. Why: This item's own explanatory copy depends on something only known at open time, a live DOM value read off the matched element. How: help-mode.jsx's HelTipCom calls this and renders the returned JSX.


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


		id    : 'itemWeight', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.entry-editor .pie-row:has(.weight-stepper)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		title : 'Item Weight', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This adjusts this item's pick chance relative to the picker's other items. A higher weight makes it more likely to be picked and a lower weight makes it less likely.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'itemBoost', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.entry-editor .pie-row:has(.pie-boost-val)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		title : 'Item Boost', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This is the item's current boost, which climbs by 1 each time it isn't picked and resets to 0 the next time it is. A higher boost makes it more likely to be picked.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'itemActive', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.entry-editor .pie-row:has(.switch)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		title : 'Item Active Toggle', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This toggles whether this item is eligible to be picked. Turning it off marks the item inactive, removing it from the picker's pool until it's turned back on.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// sel targets .rem-inline-foot (the shared wrapper), not .rd-edit-foot
	// specifically, Delete swaps that sibling out for .rem-foot-confirm
	// (its own Cancel/Delete pair), which a selector scoped to .rd-edit-foot
	// would miss entirely once that swap happens: no dim-mask hole, AND the
	// click-guard would treat its buttons as off-target and block them,
	// making the confirmation genuinely unreachable while help mode is on.
	{


		id    : 'itemFoot', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.entry-editor .rem-inline-foot .btn', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Delete / Cancel / Save', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body  : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>
				<p><b>Delete:</b> This button permanently deletes this item, after asking you to confirm.</p>
				<p><b>Cancel:</b> This button discards any changes and closes this editor without saving.</p>
				<p><b>Save:</b> This button saves your changes to this item.</p>
			</>


		),


	},

	{


		id    : 'addReminder', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.rem-add-btn', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Add a Reminder', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This creates a new one-time or recurring reminder. Reminders are separate from pickers since some tasks cannot be randomly chosen and must be done on a schedule (recurring reminder) or are a one-time thing (one-time reminder).</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// Scoped to .rem-quickadd specifically, NOT the wider .rem-quickadd-wrap
	// .np-input is reused by the Repeat editor's own extra fields (the
	// Every N Days number input, the Monthly/Yearly selects), so the wider
	// scope was unioning the name field with whichever of those happened to
	// be visible, stretching this highlight down into the Repeat section.
	{


		id    : 'addReminderName', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.rem-quickadd .np-input', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Reminder Name', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This is the name field for your new reminder, give it a short, descriptive name. This is what will show up on your todo list.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// .rem-editor (not just .seg, the pill row) so this always covers
	// whatever extra fields the current selection reveals below the pills
	// (the weekday chips for Weekly, the day/date pickers for the others),
	// every option's own extra fields, not just whichever ones happened to
	// share a class with the Reminder Name field above. No pinBelowSel here
	// (unlike a first attempt at this), the highlighted rect IS .rem-editor
	// itself, so the tip's normal "below the target" placement already
	// tracks its own bottom edge as it grows/shrinks with the selection,
	// without needing to pin to some other, unrelated element.
	// scrollable: true, the body now covers 5 schedule kinds including the
	// every-N/weekday recurrence wording, tall enough to overlap the
	// Repeat control/highlight on a short viewport without it; caps to
	// whichever side (above/below) placeTip finds more room and scrolls
	// internally there instead of overflowing into the target either way.
	{


		id         : 'addReminderRepeat', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel        : '.rem-quickadd-wrap .rem-editor', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title      : 'Reminder Schedule', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		scrollable : true, // What: Scrollable Boolean. Why: This item's own body can grow tall enough to overlap its target on a short viewport. How: This tells help-mode.jsx's own placement math (plaTipFun) to cap this tip's height and scroll its content internally instead of overflowing past the target.

		body       : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>
				<p><b>Once:</b> This reminder stays on your todo list every day until you complete it, then it's gone for good.</p>
				<p><b>Every N Days:</b> This reminder will show up on your todo list every N days, counted from the start date that you select below.</p>
				<p><b>Weekly:</b> This reminder will show up on your todo list every N week(s) on the days that you select below.</p>
				<p><b>Monthly:</b> This reminder will show up on your todo list every N month(s) on the day or weekday that you select below.</p>
				<p><b>Yearly:</b> This reminder will show up on your todo list every N year(s) on the date or weekday that you select below.</p>
			</>


		),


	},

	// .btn, not the .rem-inline-foot row itself, that row is
	// right-aligned/space-between and wider than its own buttons, which
	// left a big empty gap included in the highlight.
	{


		id    : 'addReminderFoot', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.rem-quickadd-wrap .rem-inline-foot .btn', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Cancel / Add', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body  : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>
				<p><b>Cancel:</b> This button discards the reminder form without saving anything.</p>
				<p><b>Add:</b> This button saves the reminder and adds it to your todo list, unless you selected a recurring reminder that is not due today. Stays disabled until at least a name is entered.</p>
			</>


		),


	},

	// -- Editing an EXISTING reminder (ReminderCard's name input + the
	// ReminderInlineEdit/ReminderEditFoot pair it expands into), same
	// underlying editor as Add a Reminder above, so these reuse its exact
	// copy where the content is identical (name field, repeat schedule).
	// The only real difference: Save replaces Add (no "stays disabled"
	// caveat, Save has no disabled state, unlike Add), and there's a
	// Delete button Add's form doesn't have.
	{


		id    : 'editReminderName', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.rem-card-name-input', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Reminder Name', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This is the name field for your reminder, give it a short, descriptive name. This is what will show up on your todo list.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// .rem-inline-editor is shared markup used by THREE different editors:
	// the Add Reminder quick-add form, an existing reminder's own editor
	// (this item), AND a picker item's EntryEditor (tab-today.jsx). The
	// picker-item case is excluded via :not(.entry-editor) (its root
	// carries that extra class), but :not(.rem-quickadd-wrap *) is ALSO
	// required: .rem-quickadd-wrap merely WRAPS its own .rem-inline-editor,
	// it doesn't stop the bare :not(.entry-editor) check from still
	// matching that inner element too, which produced two overlapping
	// "Reminder Schedule" badges at once whenever the Add Reminder form was
	// open (found via live testing, addReminderRepeat's own comment above
	// claiming this was "already covered, doesn't conflict" was wrong).
	// scrollable, same reasoning as addReminderRepeat above.
	{


		id         : 'editReminderRepeat', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel        : '.rem-inline-editor:not(.entry-editor):not(.rem-quickadd-wrap *) .rem-editor', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title      : 'Reminder Schedule', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		scrollable : true, // What: Scrollable Boolean. Why: This item's own body can grow tall enough to overlap its target on a short viewport. How: This tells help-mode.jsx's own placement math (plaTipFun) to cap this tip's height and scroll its content internally instead of overflowing past the target.

		body       : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>
				<p><b>Once:</b> This reminder stays on your todo list every day until you complete it, then it's gone for good.</p>
				<p><b>Every N Days:</b> This reminder will show up on your todo list every N days, counted from the start date that you select below.</p>
				<p><b>Weekly:</b> This reminder will show up on your todo list every N week(s) on the days that you select below.</p>
				<p><b>Monthly:</b> This reminder will show up on your todo list every N month(s) on the day or weekday that you select below.</p>
				<p><b>Yearly:</b> This reminder will show up on your todo list every N year(s) on the date or weekday that you select below.</p>
			</>


		),


	},

	// BUG FIXED HERE: this used to be the unscoped '.rd-edit-foot .btn',
	// which, since .rd-edit-foot is the SAME class a picker item's own
	// EntryEditor footer uses, was ALSO matching that footer on the Today
	// tab, showing this reminder-specific copy ("this reminder...") on a
	// picker item's Delete/Cancel/Save instead of itemFoot's own "this
	// item..." copy just below. .rem-inline-editor:not(.entry-editor) (see
	// editReminderRepeat's own comment) properly scopes this to an actual
	// reminder's editor. sel targets .rem-inline-foot (the shared wrapper),
	// not .rd-edit-foot specifically, Delete's own confirm prompt swaps in
	// a DIFFERENT sibling class (.rem-foot-confirm), which a selector
	// scoped to .rd-edit-foot would miss entirely: no dim-mask hole, AND
	// the click-guard would treat its Cancel/Delete buttons as off-target
	// and block them, making the confirmation genuinely unreachable while
	// help mode is on, this was wrongly assumed harmless ("gracefully has
	// nothing to highlight") until the user found it actually blocks the
	// click too, not just the highlight.
	// :not(.rem-quickadd-wrap *), the Add Reminder quickadd form (Today
	// only) uses this exact same .rem-inline-editor > .rem-inline-foot
	// structure for its own Cancel/Add buttons (no rd-edit-foot/
	// rem-foot-confirm distinction there, since a brand-new draft has
	// nothing to delete yet), widening from .rd-edit-foot to the shared
	// .rem-inline-foot wrapper (see the comment above) would otherwise
	// ALSO match those, duplicating this badge the same way
	// editReminderRepeat's own selector once did.
	{


		id    : 'editReminderFoot', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.rem-inline-editor:not(.entry-editor):not(.rem-quickadd-wrap *) .rem-inline-foot .btn', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Delete / Cancel / Save', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body  : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>
				<p><b>Delete:</b> This button permanently deletes this reminder, after asking you to confirm.</p>
				<p><b>Cancel:</b> This button discards any changes and closes this editor without saving.</p>
				<p><b>Save:</b> This button saves your changes to this reminder and updates it on your todo list.</p>
			</>


		),


	},

	{


		id    : 'dayLog', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.rem-section .dl-chip', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Section Log', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This opens a log of everything that has happened for this section today. Including what was auto-picked, skipped, manually selected, re-rolled, and completed. It will also show the new updated values, if applicable, once an item has been marked as completed.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// Every OTHER group section (Chores, Food, ...) gets the same Log chip
	// as Reminders, :not(.rem-section):not(.pt-section) excludes Reminders
	// itself (already covered above) and the Page Tours onboarding section.
	// perElement (see help-mode.jsx) gives each group's OWN Log button its
	// own badge, since the user could be scrolled to any one of them.
	{


		id         : 'dayLogPicker', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel        : '.group-section:not(.rem-section):not(.pt-section) .dl-chip', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		perElement : true, // What: Per Element Boolean. Why: More than one element on the page can match this item's own selector at once, and a user could be looking at any of them, not just the first. How: This tells HelpOverlay to render one badge per matched element instead of unioning them into a single highlight.
		title      : 'Section Log', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body       : <>This opens a log of everything that has happened for this section today. Including what was auto-picked, skipped, manually selected, re-rolled, and completed. It will also show the new updated values, if applicable, once an item has been marked as completed.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// padX: 4, see editMode's own comment; same gap, same fix, symmetric.
	{


		id    : 'regenerate', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.ob-generate', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Regenerate', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padX  : 4, // What: Horizontal Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin horizontally only, read by claPadFun/badRecFun.
		body  : <>This re-runs the daily generator manually, replacing your todo list. Anything already marked complete will be replaced too and won't show up in the Stats tab.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// -- Reminders Log panel (day-log.jsx's RemindersLog), dl-mk-r* classes
	// are dedicated selector hooks, kept separate from the visually-styled
	// .dl-r-name/.dl-r-when/.dl-r-st classes so adding them to the header row
	// (alongside the data rows, for one column-spanning highlight) doesn't
	// drag data-row font styling onto the header labels. columnGroup (see
	// help-mode.jsx) makes the 3 highlights meet edge-to-edge with no gap or
	// overlap between them, rather than each shrinking to its own content.
	{


		id          : 'logReminderName', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel         : '.dl-mk-rname', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		columnGroup : 'reminderLogCols', // What: Column Group String. Why: This item is one column of a shared table-style row whose sibling columns must all line up edge to edge. How: HelpOverlay groups every item sharing this same string and snaps their highlights flush together, with no gap or overlap between them.
		title       : 'Reminder Column', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body        : <>This lists every reminder you've created, whether it's due today or not.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id          : 'logReminderWhen', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel         : '.dl-mk-rwhen', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		columnGroup : 'reminderLogCols', // What: Column Group String. Why: This item is one column of a shared table-style row whose sibling columns must all line up edge to edge. How: HelpOverlay groups every item sharing this same string and snaps their highlights flush together, with no gap or overlap between them.
		title       : 'When Column', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body        : <>This shows each reminder's schedule. That includes how often it repeats, or if it's only a one-time reminder.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id          : 'logReminderStatus', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel         : '.dl-mk-rst', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		columnGroup : 'reminderLogCols', // What: Column Group String. Why: This item is one column of a shared table-style row whose sibling columns must all line up edge to edge. How: HelpOverlay groups every item sharing this same string and snaps their highlights flush together, with no gap or overlap between them.
		title       : 'Status Column', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body        : <>This shows whether this reminder is done, due today, skipped for today, or when it will next come due.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// -- Picker/Conditional Log panel (day-log.jsx's GroupLog), dl-mk-* here
	// are the same kind of dedicated hooks. Deliberately TWO separate column
	// groups (picker item rows vs. Conditionals section rows) rather than one
	// shared set: the Conditionals section has its own full-width "Rested:
	// .../Attached: ..." line between rows, which a single highlight spanning
	// BOTH sections would otherwise stretch across, making it look like that
	// unrelated text was part of the column.
	{


		id    : 'logPickerKey', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.dl-key', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Key', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body  : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>
				<p>This explains the icons that are used in the Status column below.</p>
				<p><b>Auto-picked:</b> This indicates that an item was chosen automatically by the daily generator.</p>
				<p><b>Pushed:</b> This indicates that an item was pushed onto your todo list manually from the Pickers page.</p>
				<p><b>Rolled off:</b> This indicates that an item was on your todo list but was then replaced by another item via the Re-Roll button.</p>
				<p><b>Skipped:</b> This indicates that an item was on your todo list but was then removed via the Skip button.</p>
				<p><b>Completed:</b> This indicates that the item is on your todo list and has been marked as completed.</p>
			</>


		),


	},

	{


		id          : 'logPickerItem', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel         : '.dl-block:not(.dl-cond-sec) .dl-mk-item', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		columnGroup : 'pickerLogCols', // What: Column Group String. Why: This item is one column of a shared table-style row whose sibling columns must all line up edge to edge. How: HelpOverlay groups every item sharing this same string and snaps their highlights flush together, with no gap or overlap between them.
		title       : 'Item Column', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body        : <>This lists every item in this picker's pool. It also shows its weight (Weighted), weight + boost (Dynamic Weighted) or eligible range (Ease Up or Ease Down), depending on the picker's mode.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id          : 'logPickerAtGen', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel         : '.dl-block:not(.dl-cond-sec) .dl-mk-atgen', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		columnGroup : 'pickerLogCols', // What: Column Group String. Why: This item is one column of a shared table-style row whose sibling columns must all line up edge to edge. How: HelpOverlay groups every item sharing this same string and snaps their highlights flush together, with no gap or overlap between them.
		title       : 'At Gen Column', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body        : <>This lists the item's value at the moment your todo list was generated. This only applies to Dynamic Weighted, Ease Up and Ease Down picker items, it shows N/A otherwise.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id          : 'logPickerDelta', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel         : '.dl-block:not(.dl-cond-sec) .dl-mk-delta', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		columnGroup : 'pickerLogCols', // What: Column Group String. Why: This item is one column of a shared table-style row whose sibling columns must all line up edge to edge. How: HelpOverlay groups every item sharing this same string and snaps their highlights flush together, with no gap or overlap between them.
		title       : 'Δ Column', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body        : <>This shows how much this item's value changed since your todo list was generated. This only applies to Dynamic Weighted, Ease Up and Ease Down picker items.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id          : 'logPickerAfter', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel         : '.dl-block:not(.dl-cond-sec) .dl-mk-after', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		columnGroup : 'pickerLogCols', // What: Column Group String. Why: This item is one column of a shared table-style row whose sibling columns must all line up edge to edge. How: HelpOverlay groups every item sharing this same string and snaps their highlights flush together, with no gap or overlap between them.
		title       : 'After Column', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body        : <>This shows the item's current value, reflecting updated values due to the current item being marked as completed in your todo list.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id          : 'logPickerStatus', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel         : '.dl-block:not(.dl-cond-sec) .dl-mk-status', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		columnGroup : 'pickerLogCols', // What: Column Group String. Why: This item is one column of a shared table-style row whose sibling columns must all line up edge to edge. How: HelpOverlay groups every item sharing this same string and snaps their highlights flush together, with no gap or overlap between them.
		title       : 'Status Column', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body        : <>This shows any relevant icons that reflect what has happened to this item today. Please see the KEY row above for what each icon means.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id          : 'logCondItem', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel         : '.dl-cond-sec .dl-mk-item', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		columnGroup : 'condLogCols', // What: Column Group String. Why: This item is one column of a shared table-style row whose sibling columns must all line up edge to edge. How: HelpOverlay groups every item sharing this same string and snaps their highlights flush together, with no gap or overlap between them.
		title       : 'Conditional Column', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body        : <>This lists every conditional attached to a picker in this group. It also shows its odds of being triggered or its charge range, depending on its mode.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id          : 'logCondAtGen', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel         : '.dl-cond-sec .dl-mk-atgen', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		columnGroup : 'condLogCols', // What: Column Group String. Why: This item is one column of a shared table-style row whose sibling columns must all line up edge to edge. How: HelpOverlay groups every item sharing this same string and snaps their highlights flush together, with no gap or overlap between them.
		title       : 'At Gen Column', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body        : <>This lists the conditional's value at the moment your todo list was generated. This only applies to Dynamic Weighted, Ease Up and Ease Down conditionals, it shows N/A otherwise.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id          : 'logCondDelta', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel         : '.dl-cond-sec .dl-mk-delta', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		columnGroup : 'condLogCols', // What: Column Group String. Why: This item is one column of a shared table-style row whose sibling columns must all line up edge to edge. How: HelpOverlay groups every item sharing this same string and snaps their highlights flush together, with no gap or overlap between them.
		title       : 'Δ Column', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body        : <>This shows how much this conditional's value changed since your todo list was generated. This only applies to Dynamic Weighted, Ease Up and Ease Down conditionals.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id          : 'logCondAfter', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel         : '.dl-cond-sec .dl-mk-after', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		columnGroup : 'condLogCols', // What: Column Group String. Why: This item is one column of a shared table-style row whose sibling columns must all line up edge to edge. How: HelpOverlay groups every item sharing this same string and snaps their highlights flush together, with no gap or overlap between them.
		title       : 'After Column', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body        : <>This shows the conditional's current value, reflecting any change from a dependent picker's item being marked as completed in your todo list.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id          : 'logCondStatus', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel         : '.dl-cond-sec .dl-mk-status', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		columnGroup : 'condLogCols', // What: Column Group String. Why: This item is one column of a shared table-style row whose sibling columns must all line up edge to edge. How: HelpOverlay groups every item sharing this same string and snaps their highlights flush together, with no gap or overlap between them.
		title       : 'Status Column', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body        : <>This shows whether this conditional is currently triggered (its dependent pickers are resting today) or not.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},


];



const PICKER_HELP_ITEMS = [ // What: Picker Help Items Array. Why: This is the on-demand help catalog for the Pickers tab, one entry per distinct piece of functionality on that page rather than one per DOM element. How: This is imported by tab-picker.jsx and passed to HelpOverlay as its own items prop.


	{


		id    : 'brandMark', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.picker-h-lead .brand-mark', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Home Link', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>You can click this logo at any time to navigate back to the home page of the app, the Today page.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'groupFilter', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.picker-groups:not(.picker-groups--type) .picker-group-pill', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Group Filter', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This filters the pickers row below by group, which is extremely useful if you have created a lot of pickers.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'typeFilter', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.picker-groups--type .picker-group-pill', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Type Filter', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This filters the pickers row below by picker type (Truly Random, Weighted, Dynamic Weighted, Ease Up, Ease Down), independent of the Group filter above with both narrowing the row together.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// padX: 3, the add button sits right before the first tab in the same
	// 8px-gap scrollable row; the default 8px pad on each side would
	// overlap by 8px otherwise (same bleed as Today's Edit Mode/Regenerate).
	{


		id    : 'pickerSelection', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.picker-tabs .picker-tab:not(.picker-tab--add)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Selection', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padX  : 3, // What: Horizontal Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin horizontally only, read by claPadFun/badRecFun.
		body  : <>This selects a specific picker, in order to initiate a manual picker generation down below as well as edit or delete its items.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// padX: 3, see pickerSelection's own comment, same gap, same fix.
	{


		id    : 'createNewPickers', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.picker-tab--add', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Create New Pickers', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padX  : 3, // What: Horizontal Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin horizontally only, read by claPadFun/badRecFun.
		body  : <>This is where you can create new pickers. This button will open up a full page form with 2 parts, picker settings and picker items.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// :not(.np-form) excludes the Edit/Create-picker form's own reused
	// .picker-title header, same name, different element, only ever one
	// or the other on screen at once, but the selector still needs to be
	// unambiguous for whichever is actually showing.
	// padY: 2, the mode pill sits directly below with only a 6px margin-
	// top (see styles2.css's .picker-h > div > .pill rule); the default 8px
	// pad on each side would overlap by 10px otherwise, bleeding into the
	// pill's own highlight.
	{


		id    : 'pickerName', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.picker-view:not(.np-form) .picker-title', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Name', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 2, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This is the name of the currently selected picker.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// padY: 2, see pickerName's own comment, same 6px gap, same fix.
	{


		id    : 'pickerTypePill', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.picker-view:not(.np-form) .pill--mode', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Type', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 2, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This shows the currently selected picker's type (Truly Random, Weighted, Dynamic Weighted, Ease Up, or Ease Down).</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'editPicker', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.picker-edit-btn', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Edit Picker', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This opens the same form used to create a picker, pre-filled with this picker's current settings. You can adjust its name, group, type, daily generator schedule, or conditional attachment. Its items aren&rsquo;t edited here, but you can use this picker's own item list below or the Data tab for that.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'pickerExplanation', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.picker-view:not(.np-form) .picker-hint', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Explanation', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This explains the currently selected picker's ruleset, including how it chooses an item and why you might pick this type over another.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'manualGeneration', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.picker-run', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Manual Generation', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body  : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>
				<p>The Pick One button runs a manual pick generation for the selected picker, so that you don't have to completely rely on your todo list's auto generation.</p>
				<p>Once it resolves and generates a pick it is replaced by the Send to Today button, which will add the selected pick to your todo list. The Re-Roll button will run the process again and the Done button will end the process without doing anything.</p>
			</>


		),


	},

	// padY: 4, .picker-pool (the shared flex-column parent) only has a
	// 10px gap to the Add Picker Item button below; the default 8px pad on
	// each side would overlap by 6px otherwise.
	{


		id    : 'pickerItems', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.pool-items', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Items', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 4, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.

		body  : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>This lists all of the items that are in this picker's pool, including their values (if applicable). The <span className='help-inline-icon'><Icon name='calendar' size={13} /></span> Send to Today button will send the item to your todo list on the Today page, the <span className='help-inline-icon'><Icon name='edit' size={13} /></span> Edit button will allow you to edit the item's properties and the <span className='help-inline-icon'><Icon name='trash' size={13} /></span> Delete button will delete the item after asking for confirmation.</>


		),


	},

	// padY: 4, see pickerItems' own comment, same gap, same fix.
	{


		id    : 'addPickerItem', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.pv-additem-btn', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Add Picker Item', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 4, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This button will open a form that allows you to add a new item to the selected picker's pool.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// Clicking Edit on a pool item opens the shared EntryEditor (same
	// component/markup as Today's and Data's item-editor coverage, see
	// those catalogs' own comments), but it renders inside .pv-additem-wrap,
	// BELOW the pool list, not inline where the item's own row is. No
	// scroll-into-view step exists in help mode (unlike the guided tour), so
	// these badges simply appear wherever that section currently sits once
	// an edit is open; the user scrolls to find them like anything else
	// below the fold. This same markup/selector set is ALSO what Step 2 of
	// the Create a Picker form uses for each new item's editor (identical
	// .pv-newitem/.rd-item/.entry-editor structure), one shared set of
	// entries covers editing an existing pool item, adding one from an
	// existing picker's own pool, and building a brand new picker's pool.
	// .rd-name-input is also used by the Conditionals section elsewhere in
	// the app (same .rd-item wrapper shape), :has(.entry-editor) picks out
	// only a .rd-item that's actually an ITEM editor.
	{


		id    : 'itemName', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.rd-item:has(.entry-editor) .rd-name-input', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Item Name', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This is the name field for your new item, give it a short, descriptive name. This is what will show up on your todo list.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'itemChargeRangeUp', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.entry-editor .pie-ease-up-row', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		title : 'Item Charge Controls', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body  : () => { // What: Body Function. Why: This item's own explanatory copy depends on something only known at open time, a live DOM value read off the matched element. How: help-mode.jsx's HelTipCom calls this and renders the returned JSX.


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


		id    : 'itemChargeRangeDown', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.entry-editor .pie-ease-down-row', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		title : 'Item Charge Controls', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body  : () => { // What: Body Function. Why: This item's own explanatory copy depends on something only known at open time, a live DOM value read off the matched element. How: help-mode.jsx's HelTipCom calls this and renders the returned JSX.


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


		id    : 'itemWeight', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.entry-editor .pie-row:has(.weight-stepper)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		title : 'Item Weight', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This adjusts the item's pick chance relative to the picker's other items. For example, an item with a weight of w2 is twice as likely to be picked as an item with a weight of w1.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'itemBoost', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.entry-editor .pie-row:has(.pie-boost-val)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		title : 'Item Boost', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This is the item's current boost, which climbs by 1 each time it isn't picked and resets to 0 the next time it is. A higher boost makes it more likely to be picked.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'itemActive', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.entry-editor .pie-row:has(.switch)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		title : 'Item Active Toggle', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This toggles whether this item is eligible to be picked. Turning it off marks the item inactive, removing it from the picker's pool until it's turned back on.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// Unlike Today/Data, the Delete button is CSS-hidden here
	// (.pv-newitem .rd-edit-foot > .btn--danger), deleting an existing
	// item stays solely the pool row's own trash icon + confirm flow on
	// this tab, so the copy only covers Cancel/Save.
	{


		id    : 'itemFoot', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.entry-editor .rd-edit-foot .btn', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Cancel / Save', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body  : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>
				<p><b>Cancel:</b> This button discards the form and closes the editor without saving the new item.</p>
				<p><b>Save:</b> This button saves the new item to the picker's pool.</p>
			</>


		),


	},

	// -- Create a Picker form (NewPickerForm, Step 1) ──────────────────────
	// :has(#np-name) scopes to just this field, since every field in the
	// form shares the plain .np-field wrapper class.
	{


		id    : 'newPickerName', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.np-field:has(#np-name)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Name', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This is the name field for your new picker, and it should have a short, descriptive name.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// :has(.np-groups) scopes to just this field, same reasoning as
	// newPickerName's own comment.
	{


		id    : 'newPickerGroup', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.np-field:has(.np-groups)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Group', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This will let you choose which group this new picker belongs to. Groups cluster related pickers together on your todo list, like "Food" or "Chores". You can select an existing group or create a new one.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// Deliberately doesn't re-explain each mode, every option already has
	// its own ruleset/explanation copy right there on the page, and there
	// isn't room for that much text in a tooltip anyway.
	{


		id    : 'newPickerMode', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.np-field:has(.mode-radio)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Type', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This is where you choose the rule this picker follows each time it runs. Each option below explains its own ruleset, so have a read through them to see which one fits best.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// Scoped to just the toggle row, not the collapsed attach-flow below it
	// (the conditional pill rail + inline "create new conditional" form),
	// that's its own whole nested interface, left for a future pass rather
	// than reaching into collapsed content on this first one.
	{


		id    : 'newPickerConditional', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.np-cond .np-field--toggle', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Conditional', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This lets you optionally gate this picker behind a conditional. When you attach a conditional, the picker will only run on days determined by that conditional's own rules. For example, giving yourself an occasional day off from chores. You can attach an existing conditional or create a new one.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// Only present once the toggle above is on (the whole .cnd-attach block
	// is a Collapse), findTargets naturally won't match anything while
	// it's closed, no visibility check needed here.
	{


		id    : 'newPickerConditionalRail', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.cnd-rail', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Select a Conditional', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This lets you select an existing conditional to attach to this picker. If you don't have one yet, or want to create another, use the Add New Conditional button to build one inline.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// -- Add New Conditional (ConditionalControls, inline in the create flow)
	{


		id    : 'newCondName', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.cnd-controls .np-field:has(input[placeholder="Conditional name"])', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Conditional Name', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This is the name field for your new conditional, and it should have a short, descriptive name.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'newCondCardText', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.np-field--cardtext', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Conditional Card Text', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This is the text that will show on the card that appears in your todo list whenever this conditional suppresses any attached pickers.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// Deliberately doesn't re-explain each type, every option already has
	// its own ruleset/explanation copy right there on the page, same as
	// newPickerMode's own comment.
	// padY: 0, this whole cluster (Type/Weight/Odds/Boost/Charge Controls/
	// Active) sits close enough together, .cnd-type-group's own gap to a
	// sibling block is only 6px, and Odds-to-Boost specifically share the
	// SAME block with next to no gap at all, that the default 8px pad
	// would overlap somewhere no matter which type is selected. Zero pad on
	// all of them relies on newCondActive's own padY to open a gap instead
	// (see its comment), same "let one side of the boundary do the work"
	// approach as EntryEditor's itemWeight/itemBoost.
	{


		id    : 'newCondType', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.cnd-controls .np-field:has(.rd-mode-radio)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Conditional Type', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This is where you choose the rule this conditional follows each time it runs. Each option below explains its own ruleset, so have a read through them to see which one fits best.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'newCondRandom', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.cnd-typectl:has(.pie-noweight)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Conditional Weight', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>Truly Random conditionals have no adjustable settings. Every time this conditional runs, it has an equal 50/50 chance to trigger.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'newCondOdds', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.cnd-typectl .pie-row:has(.weight-stepper)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Conditional Trigger Odds', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This adjusts the conditional's chance to trigger each time it runs. A higher percentage makes it more likely to trigger and a lower percentage makes it less likely.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'newCondBoost', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.cnd-typectl .pie-row:has(.pie-boost-val)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Conditional Boost', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This is the conditional's current boost, which climbs by a percentage each time it doesn't trigger and resets to 0 the next time it does. A higher boost makes it more likely to trigger.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// cnd-ease-up-row / cnd-ease-down-row, see tab-conditional.jsx's own
	// comment; same split-by-direction pattern as EntryEditor's
	// itemChargeRangeUp/Down.
	{


		id    : 'newCondEaseUp', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.cnd-typectl .cnd-ease-up-row', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		title : 'Conditional Charge Controls', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body  : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>
				<p><b>Soonest:</b> This controls the minimum number of days that must pass before the conditional becomes eligible to trigger.</p>
				<p><b>Latest:</b> This controls the maximum number of days that must pass before the conditional is guaranteed to trigger.</p>
				<p><b>Fill:</b> This will fill the conditional's charge to 100, making it eligible to trigger.</p>
			</>


		),


	},

	{


		id    : 'newCondEaseDown', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.cnd-typectl .cnd-ease-down-row', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		title : 'Conditional Charge Controls', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body  : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>
				<p><b>Shortest:</b> This controls the minimum number of days that the conditional must stay triggered before it can stop.</p>
				<p><b>Longest:</b> This controls the maximum number of days that the conditional can stay triggered before it must stop.</p>
				<p><b>Refill:</b> This will refill the conditional's charge back to 100, effectively resetting how long it stays triggered.</p>
			</>


		),


	},

	// padY: 3, opens a gap against whichever zero-pad block sits above it
	// (Weight/Odds/Boost/Charge Controls all now padY: 0, see their own
	// comment), while staying comfortably under the real 6px gap so it
	// can't reach up into that block's own content.
	{


		id    : 'newCondActive', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.cnd-controls .pie-row:has(.switch)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Conditional Active Toggle', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 3, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This toggles whether this conditional is currently active. Turning it off effectively disables the conditional, so its attached picker will always run regardless of the conditional's own trigger state.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// -- Daily Generator section (still Step 1 of the Create a Picker form)
	{


		id    : 'newPickerDaily', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.np-daily-group .np-field--toggle', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Daily Generator Toggle', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This determines whether the picker will be included in the app's daily auto-generator. When on, this picker's items will be automatically added to your todo list. When off, the picker won't run automatically, but you can still generate a pick manually from this tab.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// .cad-ctl wraps BOTH the pill row and whichever extra "which day/date"
	// field is currently showing below it, same "one editor, styled
	// together" shape as Today's own addReminderRepeat/.rem-editor, so one
	// highlight over the whole thing, growing/shrinking with the selection,
	// instead of a per-option split.
	{


		id    : 'newPickerCadence', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.cad-ctl', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Cadence', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body  : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>
				<p><b>Daily:</b> This is the picker's default cadence. It surfaces every day that it's scheduled to run, exactly like an ordinary picker.</p>
				<p><b>Weekly:</b> This surfaces the picker once a week, on whichever weekday you choose below. Once picked, that item stays on your todo list until you mark it as completed, even if that takes more than one day.</p>
				<p><b>Monthly:</b> This surfaces the picker once a month, on whichever day you choose below. Once picked, that item stays on your todo list until you mark it as completed, even if that takes more than one day.</p>
				<p><b>Yearly:</b> This surfaces the picker once a year, on whichever date you choose below. Once picked, that item stays on your todo list until you mark it as completed, even if that takes more than one day.</p>
			</>


		),


	},

	// :has(.np-sched-row) distinguishes this from the OTHER .np-sched-block
	// (CadenceControl's own wrapper), which shares the same bare class.
	{


		id    : 'newPickerWhichDays', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.np-sched-block:has(.np-sched-row)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Day Selection', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This lets you choose which days of the week this picker is allowed to run on. Tap a day to toggle it on or off, or use the Every day/Weekdays/Weekends presets to quickly set a common pattern.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// :has(#np-skiphol) distinguishes this from the OTHER .np-sched-toggle
	// just below it (Picker Duplicate Items Toggle), both share the same
	// bare class.
	{


		id    : 'newPickerSkipHolidays', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.np-sched-toggle:has(#np-skiphol)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Holidays Toggle', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This determines whether this picker skips major U.S. holidays. When on, this picker won't run on those days. You can edit which days count as holidays, or add your own, in Settings.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'newPickerAvoidDuplicates', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.np-sched-toggle:has(#np-avoiddupes)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Duplicate Items Toggle', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This determines whether the picker is allowed to choose an item when another item with the same name already exists elsewhere in the generated daily todo list. If all items are ineligible due to duplication, then this setting is ignored and an item is chosen normally.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// .np-footer--step1 scopes this to Step 1 specifically, Step 2's own
	// footer (see newPickerItemsFooterNote below) is a bare .np-footer with
	// no modifier class, so without this both steps' .np-footer-note would
	// match the same selector and only one entry could ever win.
	{


		id    : 'newPickerFooterNote', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.np-footer--step1 .np-footer-note', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Form Status', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This area lets you know if anything still needs to be filled out before you can advance to the next step, or confirms that you're ready to move on.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'newPickerFooterActions', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.np-footer--step1 .np-footer-actions .btn', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Cancel / Add Items', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body  : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>
				<p><b>Cancel:</b> This button discards the picker form without saving anything.</p>
				<p><b>Add Items:</b> This button advances to the next step, where you'll build this picker's item pool. Stays disabled until at least a name and group are set.</p>
			</>


		),


	},

	// -- Create a Picker form, Step 2 (adding items to the pool) ────────────
	// :not(.np-footer--step1), see newPickerFooterNote's own comment.
	{


		id    : 'newPickerItemsFooterNote', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.np-footer:not(.np-footer--step1) .np-footer-note', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Add Items Form Status', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This area lets you know if anything still needs to be filled out before you can submit the form, or confirms that the picker is ready to be created.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'newPickerItemsFooterActions', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.np-footer:not(.np-footer--step1) .np-footer-actions .btn', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Back / Create Picker', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body  : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>
				<p><b>Back:</b> This button will take you back to the first part of the form, allowing you to adjust the picker's settings.</p>
				<p><b>Create Picker:</b> This button will create the new picker. Stays disabled until at least 2 items are created.</p>
			</>


		),


	},


];



const STATS_HELP_ITEMS = [ // What: Stats Help Items Array. Why: This is the on-demand help catalog for the Stats tab, one entry per distinct piece of functionality on that page rather than one per DOM element. How: This is imported by tab-stats.jsx and passed to HelpOverlay as its own items prop.


	{


		id    : 'brandMark', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-h-lead .brand-mark', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Home Link', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>You can click this logo at any time to navigate back to the home page of the app, the Today page.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'groupFilter', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-scope-groups:not(.stat-scope-groups--type) .picker-group-pill', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Group Filter', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This filters the pickers row below by group, which is extremely useful if you have created a lot of pickers.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'typeFilter', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-scope-groups--type .picker-group-pill', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Type Filter', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This filters the pickers row below by type. You can select picker mode (Truly Random, Weighted, Dynamic Weighted, Ease Up, Ease Down), Conditionals or Reminders, independent of the Group filter above with both narrowing the row together.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'pickersFilter', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-scope-tabs .picker-tab', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Show Selector', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This selects what the rest of the page shows: conditionals, reminders, a specific picker, or everything all at once.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'rangeFilter', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-filter-pills--seg .stat-pill', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Range Filter', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This further narrows your selection by date range, with ranges from 1 week to 1 year to all time.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// -- Headline numbers, three different card sets share the same position
	// (between the Range filter and the heatmap/breakdown below), one per
	// scope: All/a specific picker, Reminders, and Conditionals. Each card
	// needed its own stat-mk-* marker class in tab-stats.jsx first, since
	// they all otherwise share the plain .stat-card class with nothing to
	// distinguish one from another.
	// padX/padY: 4, these 4 cards sit in a CSS grid with only a 10px gap
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
	{


		id    : 'statStreak', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-mk-scope-all.stat-mk-streak', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Day Streak', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padX  : 4, // What: Horizontal Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin horizontally only, read by claPadFun/badRecFun.
		padY  : 4, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This shows your current streak of consecutive days where you've completed all items in your todo list.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'statFullDays', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-mk-scope-all.stat-mk-fulldays', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Full Days', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padX  : 4, // What: Horizontal Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin horizontally only, read by claPadFun/badRecFun.
		padY  : 4, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This shows the number of days where you completed everything in your todo list that day, compared to the number of total active days shown next to it.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'statDone', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-mk-scope-all.stat-mk-done', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Items Done', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padX  : 4, // What: Horizontal Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin horizontally only, read by claPadFun/badRecFun.
		padY  : 4, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This shows the total number of items you've completed in this range.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'statRate', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-mk-scope-all.stat-mk-rate', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Completion Rate', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padX  : 4, // What: Horizontal Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin horizontally only, read by claPadFun/badRecFun.
		padY  : 4, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This shows the percentage of items you've completed, out of every item that was in your todo list in this range.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'statPickerStreak', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-mk-scope-picker.stat-mk-streak', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Day Streak', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padX  : 4, // What: Horizontal Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin horizontally only, read by claPadFun/badRecFun.
		padY  : 4, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This shows your current streak of consecutive days where you've completed all items in your todo list.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'statPickerFullDays', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-mk-scope-picker.stat-mk-fulldays', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Full Days', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padX  : 4, // What: Horizontal Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin horizontally only, read by claPadFun/badRecFun.
		padY  : 4, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This shows the number of days where you've completed everything in your todo list for that day, compared to the number of total active days shown next to it.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'statPickerDone', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-mk-scope-picker.stat-mk-done', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Items Done', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padX  : 4, // What: Horizontal Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin horizontally only, read by claPadFun/badRecFun.
		padY  : 4, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This shows the total number of items that you've completed for your selected range.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'statPickerRate', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-mk-scope-picker.stat-mk-rate', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Completion Rate', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padX  : 4, // What: Horizontal Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin horizontally only, read by claPadFun/badRecFun.
		padY  : 4, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This shows the percentage of items that you've completed, out of every item that was in your todo list.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// padX/padY: 4, same .stat-row (10px gap) bleed fix as the other
	// headline-card rows: default 8px pad on each side overlaps a
	// neighbor's own pad across the shared edge, side by side on wide
	// viewports and 2x2 on narrow ones.
	{


		id    : 'statRemDone', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-mk-remdone', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Reminders Completed', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padX  : 4, // What: Horizontal Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin horizontally only, read by claPadFun/badRecFun.
		padY  : 4, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This shows the total number of reminders that you've completed for your selected range.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'statRemWeek', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-mk-remweek', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Reminders This Week', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padX  : 4, // What: Horizontal Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin horizontally only, read by claPadFun/badRecFun.
		padY  : 4, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This shows the number of reminders that you've completed in the last 7 days, regardless of your selected range.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'statRemActive', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-mk-remactive', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Reminders Active Days', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padX  : 4, // What: Horizontal Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin horizontally only, read by claPadFun/badRecFun.
		padY  : 4, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This shows the total number of days for your selected range where you've completed at least one reminder.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'statRemBusiest', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-mk-rembusiest', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Reminders Busiest Day', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padX  : 4, // What: Horizontal Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin horizontally only, read by claPadFun/badRecFun.
		padY  : 4, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This shows the highest number of reminders that you've completed in a single day for your selected range.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// padX/padY: 4, same .stat-row (10px gap) bleed fix as the other
	// headline-card rows: default 8px pad on each side overlaps a
	// neighbor's own pad across the shared edge, side by side on wide
	// viewports and 2x2 on narrow ones.
	{


		id    : 'statCondFired', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-mk-condfired', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Conditionals Triggered', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padX  : 4, // What: Horizontal Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin horizontally only, read by claPadFun/badRecFun.
		padY  : 4, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This shows the total number of times that any conditional has been triggered for your selected range.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'statCondCycles', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-mk-condcycles', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Conditionals Cycles', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padX  : 4, // What: Horizontal Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin horizontally only, read by claPadFun/badRecFun.
		padY  : 4, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This shows the total number of cycles that any conditional was evaluated over for your selected range, regardless of whether it was triggered or not.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'statCondRate', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-mk-condrate', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Conditionals Fire Rate', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padX  : 4, // What: Horizontal Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin horizontally only, read by claPadFun/badRecFun.
		padY  : 4, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This shows the percentage of evaluated cycles that resulted in a triggered conditional for your selected range.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'statCondLast', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-mk-condlast', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Conditionals Last Fired', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padX  : 4, // What: Horizontal Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin horizontally only, read by claPadFun/badRecFun.
		padY  : 4, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This shows the most recent data that any conditional in your selected range was triggered.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'heatmap', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-heatmap-card', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Activity Heatmap', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This visualizes your completed activity over time, with each day shaded by how much you got done. If you click on any day, more details for it will be shown below the heatmap.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// -- All-scope only ──────────────────────────────────────────────────────
	{


		id    : 'statConditionalsSummary', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.cnd-sum-card', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Conditional Statistics', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This summarizes your conditionals' activity for your selected range. It includes how many times they've triggered, their overall fire rate, and a per-conditional breakdown. It will only show if you have at least one conditional.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'statRemindersSummary', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.rem-stats-card', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Reminders Statistics', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This summarizes your completed reminders' activity for your selected range, along with a short recent-activity list. It will only show if you have the "Include in Stats" toggle enabled for reminders.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'statSource', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-mk-source', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Items Chosen Type', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This breaks down how your picker items made it onto your todo list. This includes auto-generated, re-rolled or hand-picked from the Pickers tab.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'statMostPicked', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-mk-mostpicked', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Items Most Picked', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padX  : 4, // What: Horizontal Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin horizontally only, read by claPadFun/badRecFun.
		padY  : 4, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This lists the 5 picker items that have been picked the most for your selected range.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'statColdest', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-mk-coldest', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Items Least Picked', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padX  : 4, // What: Horizontal Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin horizontally only, read by claPadFun/badRecFun.
		padY  : 4, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This lists the 5 picker items that have been picked the least for your selected range. This excludes any picker items that are currently inactive.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// -- Conditionals scope only ─────────────────────────────────────────────
	{


		id    : 'statCondBreakdown', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-mk-condbreakdown', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Conditionals Breakdown', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This breaks down every conditional for your selected range individually. You can switch between fire rate, triggers, cycles, interval and last fired to see each conditional from a different angle.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// -- Reminders scope only ────────────────────────────────────────────────
	{


		id    : 'statRemType', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-mk-remtype', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Reminders Completed Type', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This breaks down your completed reminders by type, one-time versus recurring, for your selected range.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'statRemBreakdown', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-mk-rembreakdown', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Reminders Breakdown', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This breaks down every reminder for your selected range individually. You can switch between recent completions, total completions and skips to see each reminder from a different angle.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// -- Single-picker scope only, same 3-way split as the Pickers page's own
	// Picker Name/Picker Type/Picker Explanation (see those entries' own
	// comments), not a single combined highlight, Conditionals/Reminders
	// scope has no equivalent block, so there's nothing to split there.
	// padY: 2, same 6px gap to the pill below as the Pickers page (see
	// .stat-picker-id > .pill's own margin-top in styles2.css); the default
	// 8px pad on each side would overlap by 10px otherwise.
	{


		id    : 'pickerName', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-picker-id .picker-title', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Name', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 2, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This is the name of the currently selected picker.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// padY: 2, see pickerName's own comment, same 6px gap, same fix.
	{


		id    : 'pickerTypePill', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-picker-id .pill--mode', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Type', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 2, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This shows the currently selected picker's type (Truly Random, Weighted, Dynamic Weighted, Ease Up, or Ease Down).</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'pickerExplanation', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-picker-id .picker-hint', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Explanation', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This explains the currently selected picker's ruleset, including how it chooses an item and why you might pick this type over another.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'pickerBreakdown', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-breakdown-card', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Breakdown', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This breaks down every picker item for your selected range individually. You can switch between pick count, pick frequency, last picked date and more to see each picker item from a different angle.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},


];



const DATA_HELP_ITEMS = [ // What: Data Help Items Array. Why: This is the on-demand help catalog for the Data tab, one entry per distinct piece of functionality on that page rather than one per DOM element. How: This is imported by tab-data.jsx and passed to HelpOverlay as its own items prop.


	{


		id    : 'brandMark', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-h-lead .brand-mark', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Home Link', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>You can click this logo at any time to navigate back to the home page of the app, the Today page.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// The Conditionals filter row below carries BOTH .stat-scope-groups
	// AND .stat-scope-groups--cond, and the Type row carries BOTH
	// .stat-scope-groups AND .stat-scope-groups--type (each an additional
	// modifier, not a replacement, see their own conditionalsFilter/
	// typeFilter entries), unscoped, this selector matched both of those
	// rows' pills too, unioning the highlight all the way down through them.
	{


		id    : 'groupFilter', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-scope-groups:not(.stat-scope-groups--cond):not(.stat-scope-groups--type) .picker-group-pill', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Group Filter', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This filters the pickers row below by group, which is extremely useful if you have created a lot of pickers.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'typeFilter', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-scope-groups--type .picker-group-pill', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Type Filter', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This filters the pickers row below by type. You can select picker mode (Truly Random, Weighted, Dynamic Weighted, Ease Up, Ease Down), Conditionals or Reminders, independent of the Group and Conditional filters with all three narrowing the row together.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'pickersFilter', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-scope-tabs .picker-tab', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Show Selector', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This selects what the rest of the page shows: conditionals, reminders, a specific picker, or everything all at once.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// Only rendered once at least one conditional exists, a third filter
	// row alongside Group and Type, narrowing the pickers list to whichever
	// conditional gates them.
	{


		id    : 'conditionalsFilter', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-scope-groups--cond .picker-group-pill', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Conditionals Filter', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This filters the pickers list below by conditional, showing only pickers gated by the conditional you select.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'dataSectionSort', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.data-sort-bar .data-sort-sel', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Section Sort', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This changes the order that Conditionals, Reminders and your pickers are listed in below.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// -- Conditionals manager, each conditional gets its own highlight/
	// tooltip, not just the section as a whole. The per-type controls
	// (Type/Weight/Odds/Boost/Charge Controls/Active) reuse the EXACT same
	// selectors as the Pickers-page create-flow verbatim: ConditionalControls
	// is the same shared component either way (this tab passes
	// variant="inline" instead of the default 'card', but that only swaps a
	// wrapper class neither selector touches), so there was nothing to
	// re-derive, see PICKER_HELP_ITEMS' own newCond* entries for the
	// original comments on each of these.
	// padY:0, .cat-h has no border/gap of its own below it, but .cat-body
	// (wrapping the Add button and every row) sits directly against it with
	// only a hairline border, same zero-gap stacking as the rest of this
	// card. The 20px flex gap above .cnd-manager itself (from .tab--data)
	// easily absorbs losing the default pad on that side too.
	{


		id    : 'conditionalsManager', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.cnd-manager .cat-h', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Conditionals', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This is where you can view and edit all of your conditionals. Tap the header to expand or collapse the section.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// perElement, every conditional gets its own badge, not one for the
	// whole list, since a user could be looking at any of them. padY:0,
	// .rd-item rows stack with zero gap (touching, separated only by a
	// hairline border), so the default 8px pad bled a highlight box into
	// both neighboring rows above and below it.
	{


		id         : 'conditionalRow', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel        : '.cnd-manager .rd-item > .rd-row', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		perElement : true, // What: Per Element Boolean. Why: More than one element on the page can match this item's own selector at once, and a user could be looking at any of them, not just the first. How: This tells HelpOverlay to render one badge per matched element instead of unioning them into a single highlight.
		padY       : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		labelSel   : '.rd-name, .rd-name-input', // What: Label Selector String. Why: This item's own title needs to read a live name off the matched element itself rather than use one fixed string. How: HelpOverlay reads text (or an input's own value) from within the matched element using this selector, then passes it into this item's own title function.
		title      : (r) => `${r?.label || 'This'} Conditional`, // What: Title Function. Why: This item's own heading depends on something only known at open time, a live DOM value or a matched element's own name. How: help-mode.jsx's HelTipCom calls this with the item's own target rect and renders the returned string.
		body       : <>You can tap this conditional to expand and collapse this section. Expand it in order to view and edit its settings.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// padY:0, .rd-add has the same zero-gap stacking as .rd-item (a
	// hairline border, no margin), touching both the header above it and
	// the first conditional row below it.
	{


		id    : 'dataCondAdd', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.cnd-manager .rd-add', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Create New Conditional', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This creates a new conditional, letting you gate a picker behind a rule of your choosing so it only runs on days that rule allows.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// hideName is set on ConditionalControls here, so the name field lives
	// on the ROW itself (same .rd-name-input shape as a picker item's own
	// row), not inside the shared controls component. padY:0, the row and
	// whatever's directly below it (the first ConditionalControls field)
	// stack with zero gap, same as everywhere else on this page.
	{


		id    : 'dataCondName', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.cnd-manager .rd-item.is-editing .rd-name-input', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Conditional Name', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This is the name field for this conditional, you can rename it here.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// Reused verbatim from PICKER_HELP_ITEMS' newCondCardText, same
	// ConditionalControls markup either way, missed when the other newCond*
	// entries were copied over for this pass. padY:0, .cnd-controls--inline
	// (the variant used here, unlike the Pickers-page card variant) has
	// gap:0 between fields, so this bleeds into its neighbors above/below
	// without it.
	{


		id    : 'dataCondCardText', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.np-field--cardtext', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Conditional Card Text', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This is the text that will show on the card that appears in your todo list whenever this conditional suppresses any attached pickers.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'dataCondType', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.cnd-controls .np-field:has(.rd-mode-radio)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Conditional Type', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This is where you choose the rule this conditional follows each time it runs. Each option below explains its own ruleset, so have a read through them to see which one fits best.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'dataCondRandom', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.cnd-typectl:has(.pie-noweight)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Conditional Weight', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>Truly Random conditionals have no adjustable settings. Every time this conditional runs, it has an equal 50/50 chance to trigger.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'dataCondOdds', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.cnd-typectl .pie-row:has(.weight-stepper)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Conditional Trigger Odds', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This adjusts the conditional's chance to trigger each time it runs. A higher percentage makes it more likely to trigger and a lower percentage makes it less likely.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'dataCondBoost', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.cnd-typectl .pie-row:has(.pie-boost-val)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Conditional Boost', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This is the conditional's current boost, which climbs by a percentage each time it doesn't trigger and resets to 0 the next time it does. A higher boost makes it more likely to trigger.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'dataCondEaseUp', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.cnd-typectl .cnd-ease-up-row', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		title : 'Conditional Charge Controls', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body  : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>
				<p><b>Soonest:</b> This controls the minimum number of days that must pass before the conditional becomes eligible to trigger.</p>
				<p><b>Latest:</b> This controls the maximum number of days that must pass before the conditional is guaranteed to trigger.</p>
				<p><b>Fill:</b> This will fill the conditional's charge to 100, making it eligible to trigger.</p>
			</>


		),


	},

	{


		id    : 'dataCondEaseDown', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.cnd-typectl .cnd-ease-down-row', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		title : 'Conditional Charge Controls', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body  : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>
				<p><b>Shortest:</b> This controls the minimum number of days that the conditional must stay triggered before it can stop.</p>
				<p><b>Longest:</b> This controls the maximum number of days that the conditional can stay triggered before it must stop.</p>
				<p><b>Refill:</b> This will refill the conditional's charge back to 100, effectively resetting how long it stays triggered.</p>
			</>


		),


	},

	{


		id    : 'dataCondActive', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.cnd-controls .pie-row:has(.switch)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Conditional Active Toggle', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 3, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This toggles whether this conditional is currently active. Turning it off effectively disables the conditional, so its attached picker will always run regardless of the conditional's own trigger state.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// .rd-edit--cnd scopes this to ConditionalEditor's own footer, its
	// .rd-ctl-group--foot wrapper class is shared with PickerControls'
	// footer below, which lives in a differently-rooted tree (.rd-edit--cnd
	// is unique to this one). Delete is only rendered when !isNew (see
	// tab-data.jsx's ConditionalEditor), so :has(.btn--danger) splits this
	// from dataCondFootNew below rather than always mentioning Delete.
	{


		id    : 'dataCondFoot', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.rd-edit--cnd .rd-ctl-group--foot:has(.btn--danger) .btn', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Delete / Cancel / Save', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body  : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>
				<p><b>Delete:</b> This button permanently deletes this conditional, after asking you to confirm. Any pickers using it will be detached.</p>
				<p><b>Cancel:</b> This button discards any changes and closes this editor without saving.</p>
				<p><b>Save:</b> This button saves your changes to this conditional.</p>
			</>


		),


	},

	// New (unsaved) conditionals never render a Delete button, see
	// ConditionalEditor's `!isNew &&` guard, so this covers that footer
	// state with its own Cancel/Save-only copy.
	{


		id    : 'dataCondFootNew', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.rd-edit--cnd .rd-ctl-group--foot:not(:has(.btn--danger)) .btn', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Cancel / Save', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body  : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>
				<p><b>Cancel:</b> This button discards the new conditional without saving it.</p>
				<p><b>Save:</b> This button saves the new conditional.</p>
			</>


		),


	},

	// -- Reminders manager, the participation-settings matrix is new content
	// (not present anywhere else); the per-reminder row + its editor reuse
	// Today's own editReminderRepeat/editReminderFoot verbatim, since this is
	// the exact same .rem-inline-editor markup either way.
	// padY:0, same .cat-h/.cat-body zero-gap stacking as conditionalsManager.
	{


		id    : 'remindersManager', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.cat--reminders .cat-h', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Reminders', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This is where you can view and edit all of your reminders. Tap the header to expand or collapse the section.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// The Controls/Items disclosures share the .rd-ctl class (see the
	// matching pair on each picker below), so :nth-of-type splits them,
	// Controls always renders first in .cat-body, Items second. padY:0,
	// .rd-ctl touches its neighbor with only a hairline border, same
	// zero-gap stacking as everywhere else on this page.
	{


		id    : 'remindersControlsHeader', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.cat--reminders .cat-body > button.rd-ctl:nth-of-type(1)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Reminder Controls', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>Tap this to expand or collapse the reminders settings below. Collapsed, it shows how many settings there are.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// padY:0, .rd-matrix sits flush against the Controls header above and
	// the Items header below (no .rd-ctl-body padding wrapper here, unlike
	// PickerControls), so the default pad bled 8px into both.
	{


		id    : 'remControlsMatrix', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.rd-matrix', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Reminders Settings', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This controls whether one-time and recurring reminders are included in the day streak, completion ring or the Stats page. There are also controls to exclude those same types from weekends or holidays. Each type of reminder can be toggled independently.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// No Delete, unlike dataPickerFoot's own Delete/Cancel/Save, these are
	// global settings, not a single deletable picker.
	{


		id    : 'remControlsFoot', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.rd-matrix .rd-mx-foot .btn', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Cancel / Save', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body  : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>
				<p><b>Cancel:</b> This button discards any changes and closes this section without saving.</p>
				<p><b>Save:</b> This button saves your changes to the Reminders controls.</p>
			</>


		),


	},

	{


		id    : 'remindersItemsHeader', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.cat--reminders .cat-body > button.rd-ctl:nth-of-type(2)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Reminders Items', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>Tap this to expand or collapse the list of your reminders below. Collapsed, it shows how many reminders you have.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// padY:0, .rd-add has the same zero-gap stacking as .rd-item (a
	// hairline border, no margin), touching both the header above it and
	// the first reminder row below it.
	{


		id    : 'remAddButton', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.cat--reminders .rd-add', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Create New Reminder', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This creates a new one-time or recurring reminder. Reminders are separate from pickers since some tasks cannot be randomly chosen and must be done on a schedule (recurring reminder) or are a one-time thing (one-time reminder).</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// perElement, every reminder gets its own badge, not one for the whole
	// list. Split by type (rather than by name, like conditionalRow/
	// pickerRow) via the row's own .rd-ico.is-once marker, set per user
	// request instead of the name-based labelSel pattern. padY:0, .rd-item
	// rows stack with zero gap (touching, separated only by a hairline
	// border), same as conditionalRow/pickerRow.
	{


		id         : 'reminderRowOnce', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel        : '.cat--reminders .rd-item > .rd-row:has(.rd-ico.is-once)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		perElement : true, // What: Per Element Boolean. Why: More than one element on the page can match this item's own selector at once, and a user could be looking at any of them, not just the first. How: This tells HelpOverlay to render one badge per matched element instead of unioning them into a single highlight.
		padY       : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		title      : 'One-Time Reminder Item', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body       : <>This is one of your reminders. Tap it to view and edit its settings.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id         : 'reminderRowRecurring', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel        : '.cat--reminders .rd-item > .rd-row:not(:has(.rd-ico.is-once))', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		perElement : true, // What: Per Element Boolean. Why: More than one element on the page can match this item's own selector at once, and a user could be looking at any of them, not just the first. How: This tells HelpOverlay to render one badge per matched element instead of unioning them into a single highlight.
		padY       : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		title      : 'Recurring Reminder Item', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body       : <>This is one of your reminders. Tap it to view and edit its settings.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'dataReminderName', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.cat--reminders .rd-name-input', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Reminder Name', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This is the name field for your reminder, give it a short, descriptive name. This is what will show up on your todo list.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// Reused verbatim from TODAY_HELP_ITEMS' editReminderRepeat/editReminderFoot
	// same .rem-inline-editor markup, and this tab has no quickadd form for
	// that selector's own :not(.rem-quickadd-wrap *) exclusion to worry about.
	// padY:0, unlike Today's card-based editor, this tab's .rd-edit wrapper
	// overrides .rem-inline-foot's margin-top to 0 (see .rd-edit .rd-edit-foot
	// in styles2.css), so .rem-editor touches the footer row with zero gap.
	// scrollable, same reasoning as Today's addReminderRepeat.
	{


		id         : 'dataReminderRepeat', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel        : '.rem-inline-editor:not(.entry-editor):not(.rem-quickadd-wrap *) .rem-editor', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title      : 'Reminder Schedule', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY       : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		scrollable : true, // What: Scrollable Boolean. Why: This item's own body can grow tall enough to overlap its target on a short viewport. How: This tells help-mode.jsx's own placement math (plaTipFun) to cap this tip's height and scroll its content internally instead of overflowing past the target.

		body       : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>
				<p><b>Once:</b> This reminder stays on your todo list every day until you complete it, then it's gone for good.</p>
				<p><b>Every N Days:</b> This reminder will show up on your todo list every N days, counted from the start date that you select below.</p>
				<p><b>Weekly:</b> This reminder will show up on your todo list every N week(s) on the days that you select below.</p>
				<p><b>Monthly:</b> This reminder will show up on your todo list every N month(s) on the day or weekday that you select below.</p>
				<p><b>Yearly:</b> This reminder will show up on your todo list every N year(s) on the date or weekday that you select below.</p>
			</>


		),


	},

	// sel targets .rem-inline-foot (the shared wrapper), not .rd-edit-foot
	// specifically, see editReminderFoot's own comment (TODAY_HELP_ITEMS)
	// for why: Delete's own confirm prompt swaps in a different sibling
	// class (.rem-foot-confirm), which .rd-edit-foot alone would miss,
	// leaving its Cancel/Delete buttons genuinely unreachable (no dim-mask
	// hole, blocked by the click-guard) while help mode is on.
	// Delete is only rendered when !isNew (see reminders.jsx's
	// ReminderEditFoot), :has(.btn--danger) splits this from
	// dataReminderFootNew below rather than always mentioning Delete,
	// same fix as dataCondFoot/dataCondFootNew.
	{


		id    : 'dataReminderFoot', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.rem-inline-editor:not(.entry-editor) .rem-inline-foot:has(.btn--danger) .btn', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Delete / Cancel / Save', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body  : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>
				<p><b>Delete:</b> This button permanently deletes this reminder, after asking you to confirm.</p>
				<p><b>Cancel:</b> This button discards any changes and closes this editor without saving.</p>
				<p><b>Save:</b> This button saves your changes to this reminder.</p>
			</>


		),


	},

	// New (unsaved) reminders never render a Delete button, see
	// ReminderEditFoot's `!isNew &&` guard, so this covers that footer
	// state with its own Cancel/Save-only copy.
	{


		id    : 'dataReminderFootNew', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.rem-inline-editor:not(.entry-editor) .rem-inline-foot:not(:has(.btn--danger)) .btn', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Cancel / Save', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body  : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>
				<p><b>Cancel:</b> This button discards the new reminder without saving it.</p>
				<p><b>Save:</b> This button saves the new reminder.</p>
			</>


		),


	},

	// -- Pickers list, each picker gets its own highlight, plus each of its
	// own settings controls individually (PickerControls) and each of its
	// items individually (reusing the shared item-editor entries below).
	// perElement, every picker gets its own badge. Scoped via the direct
	// .data-list > .cat > .cat-h chain since .cat-h is also reused by the
	// Conditionals/Reminders managers' own outer headers (which render
	// outside .data-list entirely).
	// padY:0, same .cat-h/.cat-body zero-gap stacking as conditionalsManager;
	// matters once a picker is expanded and .cat-body renders beneath it.
	// title is dynamic by TYPE, not name (unlike conditionalRow/pickerRow's
	// own precedent), labelSel reads the visible .cat-mode-label pill
	// (tab-data.jsx) in the header's cat-h-tags cluster.
	{


		id         : 'pickerRow', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel        : '.data-list > .cat > .cat-h', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		perElement : true, // What: Per Element Boolean. Why: More than one element on the page can match this item's own selector at once, and a user could be looking at any of them, not just the first. How: This tells HelpOverlay to render one badge per matched element instead of unioning them into a single highlight.
		padY       : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		labelSel   : '.cat-mode-label', // What: Label Selector String. Why: This item's own title needs to read a live name off the matched element itself rather than use one fixed string. How: HelpOverlay reads text (or an input's own value) from within the matched element using this selector, then passes it into this item's own title function.
		title      : (r) => r?.label ? `${r.label} Picker` : 'Picker', // What: Title Function. Why: This item's own heading depends on something only known at open time, a live DOM value or a matched element's own name. How: help-mode.jsx's HelTipCom calls this with the item's own target rect and renders the returned string.
		body       : <>This is one of your pickers. Tap it to view and edit its settings and items.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// perElement, each expanded picker gets its own Controls/Items pair
	// (more than one can be open at once). Same .rd-ctl class and
	// :nth-of-type split as the Reminders manager's own pair above.
	// .cat-body is a descendant, not a direct child, of .cat, it's wrapped
	// in its own <Collapse> div (unlike .cat-h, which isn't). padY:0,
	// .rd-ctl touches its neighbor with only a hairline border.
	{


		id         : 'dataPickerControlsHeader', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel        : '.data-list > .cat .cat-body > button.rd-ctl:nth-of-type(1)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		perElement : true, // What: Per Element Boolean. Why: More than one element on the page can match this item's own selector at once, and a user could be looking at any of them, not just the first. How: This tells HelpOverlay to render one badge per matched element instead of unioning them into a single highlight.
		padY       : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		title      : 'Picker Controls', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body       : <>Tap this to expand or collapse this picker's settings. This includes its name, its group, how it picks, its conditional gate and when it runs. Collapsed, it shows how many setting options exist.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id         : 'dataPickerItemsHeader', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel        : '.data-list > .cat .cat-body > button.rd-ctl:nth-of-type(2)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		perElement : true, // What: Per Element Boolean. Why: More than one element on the page can match this item's own selector at once, and a user could be looking at any of them, not just the first. How: This tells HelpOverlay to render one badge per matched element instead of unioning them into a single highlight.
		padY       : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		title      : 'Picker Items', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body       : <>Tap this to expand or collapse this picker's list of items below. Collapsed, it shows how many items are in the picker.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// padY:0, .rd-basics-row has no margin, just its own padding + a
	// border-top, so consecutive rows (this one and Group below) touch
	// with zero gap.
	{


		id    : 'dataPickerName', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.rd-basics-row:has(.rd-basics-name)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Name', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This is the name field for this picker, you can rename it here.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'dataPickerGroup', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.rd-basics-row--group', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Group', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This lets you choose which group this picker belongs to. Groups cluster related pickers together on your todo list, like "Food" or "Chores". You can select an existing group or create a new one.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// Scoped to PickerControls' own "How it picks" group, ConditionalEditor
	// has its own separate .rd-mode-radio inside .cnd-controls, which
	// doesn't live under .rd-ctl-group--picks. padY:0, .rd-ctl-group--picks
	// (this group's own wrapper) touches "When it runs" below with zero gap.
	{


		id    : 'dataPickerType', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.rd-ctl-group--picks .rd-mode-radio', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Type', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This is where you choose the rule this picker follows each time it runs. Each option below explains its own ruleset, so have a read through them to see which one fits best.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// padY:0, .sched-line rows stack with zero gap (same pattern as
	// .rd-basics-row above), touching Daily Generator Toggle below.
	{


		id    : 'dataPickerConditionalToggle', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.sched-line:has(button[aria-label="Attach a conditional"])', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Conditional', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This lets you optionally gate this picker behind a conditional. When you attach a conditional, the picker will only run on days determined by that conditional's own rules. For example, giving yourself an occasional day off from chores. You can attach any existing conditional below, but if you want to create a new one you will need to use the Conditionals section above.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'dataPickerConditionalRail', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.rd-cnd-rail-row .cnd-rail', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Select a Conditional', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This lets you select an existing conditional to attach to this picker. If you don't have one yet, create one in the Conditionals section above.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// padY:0, same .sched-line zero-gap stacking, touching Picker Cadence
	// below.
	{


		id    : 'dataPickerDailyToggle', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.sched-line:has(button[aria-label*="daily generator"])', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Daily Generator Toggle', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This determines whether the picker will be included in the app's daily auto-generator. When on, this picker's items will be automatically added to your todo list. When off, the picker won't run automatically, but you can still generate a pick manually from the Pickers tab.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// padY:0, same .sched-line zero-gap stacking, touching Picker Day
	// Selection below.
	{


		id    : 'dataPickerCadence', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.sched-line:has(select[aria-label="Cadence"])', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Cadence', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.

		body  : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>
				<p><b>Daily:</b> This is the picker's default cadence. It surfaces every day that it's scheduled to run, exactly like an ordinary picker.</p>
				<p><b>Weekly:</b> This surfaces the picker once a week, on whichever weekday you choose below. Once picked, that item stays on your todo list until you mark it as completed, even if that takes more than one day.</p>
				<p><b>Monthly:</b> This surfaces the picker once a month, on whichever day you choose below. Once picked, that item stays on your todo list until you mark it as completed, even if that takes more than one day.</p>
				<p><b>Yearly:</b> This surfaces the picker once a year, on whichever date you choose below. Once picked, that item stays on your todo list until you mark it as completed, even if that takes more than one day.</p>
			</>


		),


	},

	// padY:0, same .sched-line zero-gap stacking, touching Picker
	// Holidays Toggle below.
	{


		id    : 'dataPickerDays', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.sched-line:has(.dow-chips)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Day Selection', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This lets you choose which days of the week this picker is allowed to run on. Tap a day to toggle it on or off.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// padY:0, same .sched-line zero-gap stacking, touching Picker Day
	// Selection above. This is the LAST "When it runs" row now, Avoid
	// Duplicate Items moved out to its own "Item Controls" section below
	// (see that entry's own comment), so nothing follows this one here.
	{


		id    : 'dataPickerSkipHolidays', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.sched-line:has(button[aria-label="Skip on holidays"])', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Holidays Toggle', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This determines whether this picker skips major U.S. holidays. When on, this picker won't run on those days. You can edit which days count as holidays, or add your own, in Settings.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// Moved out of "When it runs" into its own "Item Controls" section
	// (alongside Fill/Refill below), avoiding duplicate item names has
	// nothing to do with the Daily generator/schedule that section is
	// about. padY:0, .rd-ctl-group--items (this group's own wrapper)
	// touches "Item Controls" kicker above with zero gap.
	{


		id    : 'dataPickerAvoidDuplicates', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.sched-line:has(button[aria-label="Avoid duplicate items"])', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Duplicate Items Toggle', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This determines whether the picker is allowed to choose an item when another item with the same name already exists elsewhere in the generated daily todo list. If all items are ineligible due to duplication, then this setting is ignored and an item is chosen normally.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// Fill/Refill acts on every item in this picker at once
	// (actions.refillPicker), not just one. Moved out of "How it picks"
	// into "Item Controls" alongside Avoid Duplicate Items above (see that
	// entry's own comment), filling every item's charge is an items
	// operation, not part of the picker's own ruleset. padY:0, touches
	// Picker Duplicate Items Toggle above with zero gap. Split by mode
	// (ease-config--up/--down, tab-data.jsx) rather than one combined
	// Fill/Refill entry, same idea as itemChargeRangeUp/Down below (the
	// per-item equivalent, which also covers each item's own Soonest/Latest
	// controls, this picker level no longer has any of its own to prefill
	// new items with; see PICKERS.avgEase in pickers.js).
	{


		id    : 'dataPickerFillUp', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.ease-config.ease-config--up', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Fill All', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This fills the charge of every item in this picker at once.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'dataPickerFillDown', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.ease-config.ease-config--down', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Refill All', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This refills the charge of every item in this picker at once.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'dataPickerFoot', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.pk-ctl-foot .btn', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Delete / Cancel / Save', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body  : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>
				<p><b>Delete:</b> This button permanently deletes this picker, after asking you to confirm. This will also delete all of its items.</p>
				<p><b>Cancel:</b> This button discards any changes and closes this editor without saving.</p>
				<p><b>Save:</b> This button saves your changes to this picker.</p>
			</>


		),


	},

	{


		id    : 'dataCreatePicker', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.cat-create-btn', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Create New Picker', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This creates a new picker directly from this list, respecting the group, type and conditional filters if they are used. Fill in its name and group, then use the Add Items button to add at least two items. Once it has them, the Save button adds it to the list with all other pickers.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// Scoped to .data-list so this doesn't also match the Conditionals/
	// Reminders managers' own "Add" buttons, which share the plain .rd-add
	// class but render outside .data-list entirely. padY:0, .rd-add has
	// the same zero-gap stacking as .rd-item, touching the first item row
	// below it.
	{


		id    : 'dataAddItem', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.data-list .rd-add', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Create New Picker Item', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This adds a new item to this picker's pool.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// Split by section type (three separate entries, each named for its own
	// context) rather than one shared "Item Sort", Conditionals/Reminders/
	// pickers all render the exact same SortSelect markup (ui.jsx) inside
	// their own .cat-body, so the selectors below key off each section's own
	// distinguishing class/attribute instead: .cnd-manager (Conditionals),
	// .cat--reminders (Reminders), and a picker section's own data-picker-id
	// (set only there, unlike a plain className check, which would need
	// :not() exclusions against the other two instead). perElement, every
	// expanded section's own sort control gets its own badge, since more
	// than one can be visible (and set to a different order) at once,
	// matters most for pickers, where several can be expanded together.
	{


		id         : 'dataCondItemSort', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel        : '.cnd-manager .data-sort-sel', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		perElement : true, // What: Per Element Boolean. Why: More than one element on the page can match this item's own selector at once, and a user could be looking at any of them, not just the first. How: This tells HelpOverlay to render one badge per matched element instead of unioning them into a single highlight.
		title      : 'Conditional Items Sort', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body       : <>This changes the order that the items in this section are listed in below.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id         : 'dataRemItemSort', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel        : '.cat--reminders .data-sort-sel', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		perElement : true, // What: Per Element Boolean. Why: More than one element on the page can match this item's own selector at once, and a user could be looking at any of them, not just the first. How: This tells HelpOverlay to render one badge per matched element instead of unioning them into a single highlight.
		title      : 'Reminder Items Sort', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body       : <>This changes the order that the items in this section are listed in below.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id         : 'dataPickerItemSort', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel        : '.data-list .cat[data-picker-id] .data-sort-sel', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		perElement : true, // What: Per Element Boolean. Why: More than one element on the page can match this item's own selector at once, and a user could be looking at any of them, not just the first. How: This tells HelpOverlay to render one badge per matched element instead of unioning them into a single highlight.
		title      : 'Picker Items Sort', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body       : <>This changes the order that the items in this section are listed in below.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// perElement, every item in every expanded picker gets its own badge.
	// padY:0, .rd-item rows stack with zero gap (touching, separated only
	// by a hairline border), same as conditionalRow/reminderRow.
	{


		id         : 'dataItemRow', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel        : '.data-list .rd-item > .rd-row', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		perElement : true, // What: Per Element Boolean. Why: More than one element on the page can match this item's own selector at once, and a user could be looking at any of them, not just the first. How: This tells HelpOverlay to render one badge per matched element instead of unioning them into a single highlight.
		padY       : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		title      : 'Picker Item', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body       : <>This is one of this picker's items. Tap it to view and edit its settings.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// -- Editing an individual picker item (EntryEditor, defined in
	// tab-today.jsx but reused here, see .entry-editor's own doc comment
	// there). Which of these actually renders depends on the OWNING
	// PICKER's mode, so most items below only ever show up for some modes:
	// Charge Range (Ease Up/Ease Down only), Weight (Weighted/Dynamic
	// Weighted), Boost (Dynamic Weighted only). Active and the footer
	// always render regardless of mode.
	// .rd-name-input is also used by the Conditionals section's own name
	// field (same .rd-item wrapper shape), :has(.entry-editor) picks out
	// only a .rd-item that's actually an ITEM editor, since .entry-editor
	// is unique to EntryEditor and never rendered for a conditional.
	{


		id    : 'itemName', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.rd-item:has(.entry-editor) .rd-name-input', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Item Name', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This is the name field for this item, you can rename it here.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// Function body (see help-mode.jsx's HelpTip), reads the picker's own
	// cadence unit word (days/weeks/months/years) straight off the
	// already-rendered .np-ease-unit label instead of hardcoding "days",
	// which would be wrong for a non-daily cadence picker.
	{


		id    : 'itemChargeRangeUp', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.entry-editor .pie-ease-up-row', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		title : 'Item Charge Controls', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body  : () => { // What: Body Function. Why: This item's own explanatory copy depends on something only known at open time, a live DOM value read off the matched element. How: help-mode.jsx's HelTipCom calls this and renders the returned JSX.


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


		id    : 'itemChargeRangeDown', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.entry-editor .pie-ease-down-row', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		title : 'Item Charge Controls', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body  : () => { // What: Body Function. Why: This item's own explanatory copy depends on something only known at open time, a live DOM value read off the matched element. How: help-mode.jsx's HelTipCom calls this and renders the returned JSX.


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


		id    : 'itemWeight', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.entry-editor .pie-row:has(.weight-stepper)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		title : 'Item Weight', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This adjusts this item's pick chance relative to the picker's other items. A higher weight makes it more likely to be picked and a lower weight makes it less likely.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'itemBoost', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.entry-editor .pie-row:has(.pie-boost-val)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		title : 'Item Boost', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This is the item's current boost, which climbs by 1 each time it isn't picked and resets to 0 the next time it is. A higher boost makes it more likely to be picked.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'itemActive', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.entry-editor .pie-row:has(.switch)', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		title : 'Item Active Toggle', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This toggles whether this item is eligible to be picked. Turning it off marks the item inactive, removing it from the picker's pool until it's turned back on.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// sel targets .rem-inline-foot (the shared wrapper), not .rd-edit-foot
	// specifically, Delete swaps that sibling out for .rem-foot-confirm
	// (its own Cancel/Delete pair), which a selector scoped to .rd-edit-foot
	// would miss entirely once that swap happens: no dim-mask hole, AND the
	// click-guard would treat its buttons as off-target and block them,
	// making the confirmation genuinely unreachable while help mode is on.
	// Delete is only rendered when !isNew (see EntryEditor in
	// tab-today.jsx), :has(.btn--danger) splits this from itemFootNew
	// below rather than always mentioning Delete, same fix as
	// dataCondFoot/dataReminderFoot.
	{


		id    : 'itemFoot', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.entry-editor .rem-inline-foot:has(.btn--danger) .btn', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Delete / Cancel / Save', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body  : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>
				<p><b>Delete:</b> This button permanently deletes this item, after asking you to confirm.</p>
				<p><b>Cancel:</b> This button discards any changes and closes this editor without saving.</p>
				<p><b>Save:</b> This button saves your changes to this item.</p>
			</>


		),


	},

	// New (unsaved) items never render a Delete button, see EntryEditor's
	// `!isNew &&` guard, so this covers that footer state with its own
	// Cancel/Save-only copy.
	{


		id    : 'itemFootNew', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.entry-editor .rem-inline-foot:not(:has(.btn--danger)) .btn', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Cancel / Save', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body  : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>
				<p><b>Cancel:</b> This button discards the new item without saving it.</p>
				<p><b>Save:</b> This button saves the new item.</p>
			</>


		),


	},


];



const SETTINGS_HELP_ITEMS = [ // What: Settings Help Items Array. Why: This is the on-demand help catalog for the Settings tab, one entry per distinct piece of functionality on that page rather than one per DOM element. How: This is imported by tab-settings.jsx and passed to HelpOverlay as its own items prop.


	{


		id    : 'brandMark', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.stat-h-lead .brand-mark', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Home Link', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>You can click this logo at any time to navigate back to the home page of the app, the Today page.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// -- Section rail, on mobile this collapses into a horizontal sticky
	// pill bar pinned above the sections (see .settings-rail's own
	// @container rule in styles2.css); on desktop it's a vertical sidebar.
	// One combined highlight over the whole rail rather than per-button,
	// matching the nav bar's own precedent.
	// padY:0, on narrow viewports this is sticky (position:sticky; top:0)
	// with its own opaque background; the default pad extended the mask
	// cutout past the rail's own real bottom edge, revealing whatever
	// page content had scrolled underneath it in that gap (nothing there
	// covers it, the dim overlay sits above the rail's own z-index:18,
	// and the cutout hole doesn't care that the rail's own box doesn't
	// reach that far).
	{


		id    : 'settingsRail', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.settings-rail', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Sections Navigation', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This will let you jump straight to any section of the Settings page. On mobile devices, this will stay pinned to the top of the page no matter how far down you have scrolled.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// -- Appearance ─────────────────────────────────────────────────────────
	{


		id    : 'appearanceSystemPref', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.set-section--appearance .set-data-row:has(button[aria-label="System preference"])', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'System Theme Preference', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>When on, the app follows your system's own light/dark setting and automatically switches between your chosen light and dark themes (e.g. Ink &rarr; Night) whenever your system does. When off, only your manually selected theme below applies.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'appearanceThemeLight', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.set-subsection--theme-light', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Light Theme', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This is where you choose the theme that's used when the app is in light mode. Pick any of the presets, or use the Custom row to mix your own colors. Custom themes will automatically generate a matching dark theme, which you're then free to edit separately.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// padY:4 (not the default 8), consecutive .set-subsection blocks have
	// a real but modest 12px gap (.set-section's own flex gap), and 8+8
	// exceeds that by 4px; 4+4 stays safely inside it.
	{


		id    : 'appearanceThemeDark', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.set-subsection--theme-dark', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Dark Theme', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 4, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This is where you choose the theme that's used when the app is in dark mode. Pick any of the presets, or use the Custom row to mix your own colors. Custom themes will automatically generate a matching light theme, which you're then free to edit separately.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'appearanceCelebration', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.set-subsection--celebration', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Completion Celebration', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 4, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This is where you choose which animation plays in the Today page when every item in your todo list is marked as done. Use Preview to watch any of them play out before picking one.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'appearancePickAnim', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.set-subsection--pickanim', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Picker Animation', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 4, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This is where you choose which animation plays in the Pickers tab when the manual picker functionality is triggered via the "Pick One" button. Use Preview to watch any of them play out before picking one.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'appearanceLayout', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.set-subsection--layout', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Tab Bar Placement', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 4, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This controls where the app's main navigation is positioned on screen: a floating bar at the bottom, a sidebar on the left, or a bar along the top.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// -- Daily generator ────────────────────────────────────────────────────
	// padY:0 on all three below, .set-data-row rows have no margin between
	// them, just their own padding + a border-bottom (Card is a plain div,
	// not a flex/grid gap container), so they touch with zero gap.
	{


		id    : 'dailyAutoToggle', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.set-section--daily .set-data-row:has(button[aria-label="Run the Daily generator automatically"])', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Run Generator Automatically', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This toggles whether the Daily generator runs on its own each day. When off, you'll need to run it manually using the Regenerate button at the bottom of the Today page.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'dailyRunTime', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.set-section--daily .set-data-row--sub', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Run Generator Time', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This sets what time of day the Daily generator runs automatically. A quiet, early hour works best so your list is ready first thing in the morning.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'dailyNotify', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.set-notify-row', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Run Generator Notification', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This lets you get a notification once your todo list has been generated for the day. This is the only notification the app will ever send and only once a day. It only works while the app is open in a tab or window, but always push notifications are coming in a future release.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// -- Holidays ───────────────────────────────────────────────────────────
	// padY:4, .holiday-add has a real but modest 14px margin-top from
	// .holiday-list above it, and default 8+8 pad exceeds that by 2px.
	{


		id    : 'holidayList', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.holiday-list', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Edit Observed Holidays', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 4, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This lists every computed holiday for the current year. Toggle any of them off if you don't observe it, any picker set to "Skip on holidays" will respect these settings.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'holidayAdd', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.holiday-add', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Add Custom Holiday', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 4, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This lets you add your own custom holiday, like a birthday or anniversary, which pickers will respect if their "Skip on holidays" toggle is turned on.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// -- Data control ───────────────────────────────────────────────────────
	// padY:0 on the whole group below, same zero-gap .set-data-row stacking
	// as Daily generator above.
	{


		id    : 'dataStorageStatus', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.set-store-row', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Protect Your Data', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This shows how your data is currently being stored, whether the browser has promised not to clear it, and roughly how much data you are storing in the app. Installing the app or granting persistent storage both help protect it from being cleared automatically.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// Exactly one of these four mutually-exclusive rows ever renders at a
	// time (already installed / can't install here / iOS Add to Home
	// Screen / Mac Add to Dock, see tab-settings.jsx), all sharing this
	// one class, so this covers whichever is actually showing.
	{


		id    : 'dataInstallInstructions', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.set-store-ios', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Install Instructions', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This shows device and browser specific information about how to install the app. Installing the app has many benefits, but you can always keep using the app as a website if you prefer.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'dataExport', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.set-export-row', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Export Your Data', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This downloads a file containing all of your data: pickers, items, reminders, history and app settings. Since all app data lives on your device, you alone are responsible for taking care of it. It is also handy for moving your data to a new, or second, device.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'dataImport', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.set-import-row', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Import Your Data', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This restores your data from a previously exported backup file. Importing a backup <b>replaces all data</b> currently stored in the app, so make sure that's what you want first.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'dataReset', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.set-reset-row', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Reset All Data', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This wipes everything and restores the app to a clean, first-run state. <b>This can't be undone</b>, so export a backup first if there's any chance you'll want this data again.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// -- Account ────────────────────────────────────────────────────────────
	{


		id    : 'account', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.set-section--account', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Your Account', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>Ease My Life runs entirely on this device with no account required. Syncing your data across devices is planned as a future paid feature (a one-time fee, not a subscription).</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	// -- About ──────────────────────────────────────────────────────────────
	{


		id    : 'aboutInfo', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.set-about', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'App Info', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This shows the app's current version, along with links to the creator's website and this app's source code on GitHub.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'aboutSupportProject', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.set-support-project-row', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Support the Project', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>A planned way to support development of the app directly, coming in a future release.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'aboutReplayTour', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.set-replay-tour-row', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Replay the Welcome Tour', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This replays the first-run walkthrough from the very beginning, including the welcome message and all of the tutorials.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'aboutContactTrigger', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.set-contact-trigger', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Contact Support', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>This opens a short form for sending a message directly to the developer. Your app version and browser are attached automatically, so there's no back-and-forth needed to track those down.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'aboutContactForm', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.support-form', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Support Message', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		body  : <>Fill in a subject and message describing your problem or suggestion. Your app version and browser are already filled in below for reference.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'aboutContactFormFoot', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.support-form-foot', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Cancel / Send', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.

		body  : ( // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


			<>
				<p><b>Cancel:</b> This discards your message and closes the form without sending.</p>
				<p><b>Send:</b> This sends your message. If it can't go through (for example, if you're offline), you'll be shown an email address to reach out to instead, and your message will be kept so you can try again.</p>
			</>


		),


	},

	// -- Legal ──────────────────────────────────────────────────────────────
	// padY:0 on both, same zero-gap .set-data-row stacking as above.
	{


		id    : 'legalPrivacy', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.set-privacy-row', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Privacy Policy', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This opens the Privacy Policy, which explains how your data is collected, used, and stored.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},

	{


		id    : 'legalTerms', // What: Identifier String. Why: This is this help item's own unique key, letting HelpOverlay (help-mode.jsx) track which one is currently open. How: This is read back as part of the React key when HelpOverlay renders this item's own badge/tip, and compared against its own open-id state.
		sel   : '.set-terms-row', // What: Selector String. Why: This tells HelpOverlay which on-page element(s) this help item highlights. How: This is passed through help-mode.jsx's own finTarFun, a comma-separated-fallback matcher tried left to right until an alternative matches a visible element.
		title : 'Terms of Service', // What: Title String. Why: This is the heading shown at the top of this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.
		padY  : 0, // What: Vertical Pad Number. Why: The default highlight padding overlaps a neighboring element on this axis for this specific target (see the comment above this entry for the exact gap). How: This overrides help-mode.jsx's own default pad margin vertically only, read by claPadFun/badRecFun.
		body  : <>This opens the Terms of Service, which covers the rules for using Ease My Life, including any paid features.</>, // What: Body Element. Why: This is the explanatory copy shown inside this help item's own tip. How: This is rendered as-is by help-mode.jsx's HelTipCom.


	},


];



export { TODAY_HELP_ITEMS, PICKER_HELP_ITEMS, STATS_HELP_ITEMS, DATA_HELP_ITEMS, SETTINGS_HELP_ITEMS }; // What: Named Exports. Why: Every tab file that renders its own help toggle imports its own one of these by name. How: This re-exports the 5 catalogs declared above; nothing else in this file is used outside it.


