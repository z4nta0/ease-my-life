


// #region Imports

import { IcoSvgCom } from './ui.jsx'; // What: Icon Svg Component. Why: Several items' own body copy renders a small inline icon next to a button's own label, so a reader can match the tip back to the real control. How: This is rendered inside body JSX throughout this file's own catalogs (e.g. Card Actions, Picker Items).

// #endregion Imports



/**
 * help-content.jsx = Help Content
 *
 * @summary
 * Per-page catalogs of help items for the on-demand help mode (see
 * help-mode.jsx). Copy is largely forked from
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
 * Every catalog item shares this exact shape, and none of the 210 items
 * below repeat these same fields' own boilerplate comments on their own
 * lines (see the "Repeated-shape object literals" comment exception in
 * CLAUDE.md); a leading comment directly above a specific item still
 * explains anything genuinely unique to that one item instead:
 * 
 * - `bodEle` (Element or Function): Body Element is the tip's own explanatory
 *   copy, rendered as-is by HelTipCom; a function is used for the same
 *   open-time-dependent reason titStr's own function form is.
 *
 * - `groStr` (String, optional): Group String marks this item as one column of
 *   a shared table-style row; HelOveCom groups every item sharing the same
 *   groStr and snaps their highlights flush edge-to-edge, with no gap or
 *   overlap between them.
 *
 * - `ideStr` (String): Identifier String is this item's own unique key,
 *   letting HelOveCom (help-mode.jsx) track which one is currently open;
 *   read back as part of the React key when rendering this item's own
 *   badge/tip, and compared against its own open-id state.
 *
 * - `labStr` (String, optional): Label String is a secondary selector read
 *   within the matched element to pull a live label (its own text, or an
 *   input's own value) into this item's own title function, rather than using
 *   one fixed string.
 *
 * - `mulBoo` (Boolean, optional): Multiple Boolean renders one badge per
 *   matched element instead of unioning them into a single highlight, for a
 *   selector that can match more than one element on the page at once.
 *
 * - `padXNum` / `padYNum` (Number, optional): Pad X Number and Pad Y Number
 *   override the default highlight padding on one axis, for a specific target
 *   whose highlight would otherwise overlap a neighboring element (see that
 *   item's own leading comment for the exact reasoning); read by
 *   help-mode.jsx's claPadFun/badRecFun.
 *
 * - `scrBoo` (Boolean, optional): Scroll Boolean caps the open tip's own
 *   height and scrolls its content internally instead of overflowing past the
 *   target, for a body tall enough to overlap it on a short viewport; read by
 *   help-mode.jsx's own placement math (plaTipFun).
 *
 * - `selStr` (String): Selector String determines which on-page element(s)
 *   this item highlights; passed through help-mode.jsx's own finTarFun, a
 *   comma-separated-fallback matcher tried left to right until one alternative
 *   matches a visible element.
 *
 * - `shaStr` (String or Function, optional): Shape String overrides the
 *   default CSS-border-radius shape detection, for a target whose round
 *   appearance comes from something else (an inner SVG shape, or a computed
 *   union with no single source element of its own); passed to help-mode.jsx's
 *   own shaRadFun, or called directly when it is a function.
 *
 * - `titStr` (String or Function): Title String is the tip's own heading; a
 *   function is used when the heading depends on something only known at open
 *   time (a live DOM value, or a matched element's own name), called by
 *   help-mode.jsx's HelTipCom with the item's own target rect.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



const TOD_HEL_ARR = [ // What: Today Help Array. Why: This is the on-demand help catalog for the Today tab, one entry per distinct piece of functionality on that page rather than one per DOM element. How: This is imported by tab-today.jsx and passed to HelOveCom as its own helIteArr prop, prepended there with the shared nav/rail items every page gets.


	// #region Today Header

	{


		bodEle : <>This tracks your current progress of completed / total tasks for today's todo list. Once filled completely, your Day Streak will increase and the celebration animations will play.</>,
		ideStr : 'progressRing',
		selStr : '.ring',
		shaStr : 'circle',
		titStr : 'Progress Ring'


	},

	{


		bodEle : <>You can click this logo at any time to navigate back to the home page of the app, the Today page.</>,
		ideStr : 'brandMark',
		selStr : '.today-h-lead .brand-mark',
		titStr : 'Home Link'


	},

	{


		bodEle : <>This counts how many days in a row you've completed everything on your todo list. Missing a day resets it back to zero.</>,
		ideStr : 'streak',
		selStr : '.streak',
		titStr : 'Day Streak'


	},

	{


		bodEle : <>This is the todo list's navigation, allowing you to jump directly to a group's section. Over time your list can grow quite long and this helps to eliminate any long scrolling.</>,
		ideStr : 'groupsNav',
		selStr : '.group-rail ul',
		titStr : 'List Navigation'


	},

	// #endregion Today Header



	// #region Edit Mode

	{


		bodEle : () => (document.querySelector('.em-rail-btn')?.classList.contains('is-on')
			? <>This button saves any edits that you have made and exits Edit Mode.</>
			: <>This lets you rearrange the positions of the groups and items, as well as rename the groups.</>), // title/body are functions (see help-mode.jsx's own comment on this pattern, e.g. the Charge Controls items) because .em-rail-btn is the SAME button throughout, relabeled "Done" once Edit Mode is on rather than being swapped for a different element, so a static "Edit Mode" tip would otherwise keep showing even after the button (and its real behavior) had already become Done; .foot-editmode only ever matches while NOT editing (it unmounts entirely once editMode is true, see the editmode-foot-actions item below for what replaces it), so reading .em-rail-btn's own is-on class here correctly reflects either case regardless of which of the two elements actually got matched.

		ideStr  : 'editMode',
		padXNum : 4, // padXNum: 4 exists because .foot-editmode sits right next to .ob-generate (Regenerate) with only a 10px gap between them, and the default 8px pad on each side would overlap by 6px.
		selStr  : '.em-rail-btn, .foot-editmode',

		titStr : () => (document.querySelector('.em-rail-btn')?.classList.contains('is-on') ? 'Done Button' : 'Edit Mode') // title/body are functions (see help-mode.jsx's own comment on this pattern, e.g. the Charge Controls items) because .em-rail-btn is the SAME button throughout, relabeled "Done" once Edit Mode is on rather than being swapped for a different element, so a static "Edit Mode" tip would otherwise keep showing even after the button (and its real behavior) had already become Done; .foot-editmode only ever matches while NOT editing (it unmounts entirely once editMode is true, see the editmode-foot-actions item below for what replaces it), so reading .em-rail-btn's own is-on class here correctly reflects either case regardless of which of the two elements actually got matched.


	},

	// .editmode-banner-actions is the Cancel/Done pair in Edit Mode's own sticky banner. .editmode-foot-actions (styles2.css/tab-today.jsx) is the identical pair repeated in the footer, distinguished from the OTHER (non-editing) footer actions row that shares .today-foot-actions with it, findTargets' comma syntax is fallback-only (see groupNameEdit's own comment in this file for why that distinction matters), so this needs its own class rather than reusing the shared one, and can't be combined with editmode-banner-actions into one selStr either, for the same reason (both are always present together while Edit Mode is on, so the first one found would always win).
	{


		bodEle : (


			<>
				<p><b>Cancel:</b> This button discards any reordering or renaming edits that you have made and exits Edit Mode.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Done:</b> This button saves any edits that you have made and exits Edit Mode.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
			</>


		),

		ideStr : 'editModeBannerActions',
		selStr : '.editmode-banner-actions',
		titStr : 'Cancel / Done'


	},

	{


		bodEle : (


			<>
				<p><b>Cancel:</b> This button discards any reordering or renaming edits that you have made and exits Edit Mode.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Done:</b> This button saves any edits that you have made and exits Edit Mode.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
			</>


		),

		ideStr : 'editModeFootActions',
		selStr : '.editmode-foot-actions',
		titStr : 'Cancel / Done'


	},

	// These three only exist in the DOM while Edit Mode is on, same "findTargets returns nothing, item silently skipped" handling as the side-placement rail handle (see help-mode.jsx). mulBoo is true on all three because every group's own grip/card/name gets its own badge, since a user editing a long list could be looking at any one of them, not just the first.
	{


		bodEle  : <>While Edit Mode is on, drag this handle to change this group's position in your todo list.</>,
		ideStr  : 'groupGrip',
		mulBoo  : true,
		padXNum : 1, // padXNum: 1 exists because .group-grip and .group-name--editable sit only 4px apart in practice (the negative margin on .group-grip eats into .group-h-l's own 10px gap); the default 8px pad on each side, and even editMode's own padXNum:4 fix above, both still overlap here, so 1px each side leaves 2px of real clearance instead.
		selStr  : '.group-grip',
		titStr  : 'Reorder Group'


	},

	{


		bodEle : <>While Edit Mode is on, drag this handle to change this item's position within its group.</>,
		ideStr : 'cardGrip',
		mulBoo : true,
		selStr : '.card-grip',
		titStr : 'Reorder Item'


	},

	// .group-name-slot is a shared class on BOTH the button (idle) and the input (mid-edit), findTargets' comma syntax is fallback-only (try the first selector, only try the next if it matched NOTHING at all), not a union, so '.group-name--editable, .group-name-input' silently dropped whichever group was actively being edited the moment any OTHER group's plain button still matched. One stable class sidesteps that entirely: clicking a name to rename it used to make this exact highlight vanish and leave the now-visible input hidden behind the dimmer, right when a user is actually interacting with it.
	{


		bodEle  : <>While Edit Mode is on, click a group's name to rename it.</>,
		ideStr  : 'groupNameEdit',
		mulBoo  : true,
		padXNum : 1,
		selStr  : '.group-name-slot',
		titStr  : 'Rename Group'


	},

	// #endregion Edit Mode



	// #region Card Actions

	{


		bodEle : (


			<>
				<p>When you click this circle, it marks the item as completed and updates the progress ring's completed count. When all items are completed, your Day Streak increases and the celebration animations will play.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p>For items that belong to a picker with updatable values, marking as complete will also apply updates to all of the pickers' items. Dynamic Weighted items wil have their boost value increased or reset to 0. Ease Up and Ease Down items will have their charge values increased or decreased, respectively.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
			</>


		),

		ideStr : 'cardCheck',
		mulBoo : true, // mulBoo is true because every real entry card gets its own badge, a user could be looking at any card on the page, not just whichever one happened to be first, and the main help toggle can be clicked from anywhere regardless of scroll position.
		selStr : '.today-card:not(.today-card--tutorial) .check',
		titStr : 'Mark Complete'


	},

	// Reminders and picker-generated entries share the same .today-card-actions markup but not the same buttons (reminders have no Re-Roll, there's nothing to re-roll TO, it's a fixed task, not a random pick), so this needs two separate items rather than one shared description. Also excludes day-off and charging cards, both render a .today-card-actions row too, but with Re-Roll and/or Edit genuinely disabled (the app's own InfTipCom there says "This action is disabled for this type of item"), which this tip's copy doesn't describe. mulBoo is true on both because every OTHER card gets its own badge; a single shared one could land on a card whose buttons happen to be in an unusual state, or just not be near wherever the user actually scrolled to.
	{


		bodEle : (


			<>
				<div className='help-nav-item'>{ /* What: Body Container Div Element. Why: This groups related lines of this help item's own explanatory copy into one visual block. How: This is rendered as-is inside the tip. */ }
					<div className='help-nav-label'><IcoSvgCom name='refresh' size={14} /><b>Re-Roll:</b></div>{ /* What: Body Label Div Element. Why: This pairs an icon with a bold action name inside its own group. How: This is rendered as-is inside the tip. */ }

					<p>This button swaps this item for a different one from the same picker, without waiting for the next generation.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
				</div>

				<div className='help-nav-item'>{ /* What: Body Container Div Element. Why: This groups related lines of this help item's own explanatory copy into one visual block. How: This is rendered as-is inside the tip. */ }
					<div className='help-nav-label'><IcoSvgCom name='skip' size={14} /><b>Skip:</b></div>{ /* What: Body Label Div Element. Why: This pairs an icon with a bold action name inside its own group. How: This is rendered as-is inside the tip. */ }

					<p>This button removes this item from your todo list without completing it and updates the progress ring's total count accordingly.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
				</div>

				<div className='help-nav-item'>{ /* What: Body Container Div Element. Why: This groups related lines of this help item's own explanatory copy into one visual block. How: This is rendered as-is inside the tip. */ }
					<div className='help-nav-label'><IcoSvgCom name='edit' size={14} /><b>Edit:</b></div>{ /* What: Body Label Div Element. Why: This pairs an icon with a bold action name inside its own group. How: This is rendered as-is inside the tip. */ }

					<p>This button adjusts this item's properties. That includes its name, schedule (reminders only), values (pickers only) and active toggle (pickers only).</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
				</div>
			</>


		),

		ideStr : 'cardActionsPicker',
		mulBoo : true,
		selStr : '.today-card:not(.rem-card):not(.today-card--tutorial):not(.today-card--dayoff):not(.today-card--charging) .today-card-actions',
		titStr : 'Card Actions'


	},

	{


		bodEle : (


			<>
				<div className='help-nav-item'>{ /* What: Body Container Div Element. Why: This groups related lines of this help item's own explanatory copy into one visual block. How: This is rendered as-is inside the tip. */ }
					<div className='help-nav-label'><IcoSvgCom name='skip' size={14} /><b>Skip:</b></div>{ /* What: Body Label Div Element. Why: This pairs an icon with a bold action name inside its own group. How: This is rendered as-is inside the tip. */ }

					<p>This button removes this item from your todo list without completing it and updates the progress ring's total count accordingly.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
				</div>

				<div className='help-nav-item'>{ /* What: Body Container Div Element. Why: This groups related lines of this help item's own explanatory copy into one visual block. How: This is rendered as-is inside the tip. */ }
					<div className='help-nav-label'><IcoSvgCom name='edit' size={14} /><b>Edit:</b></div>{ /* What: Body Label Div Element. Why: This pairs an icon with a bold action name inside its own group. How: This is rendered as-is inside the tip. */ }

					<p>This button adjusts this item's properties. That includes its name, schedule (reminders only), values (pickers only) and active toggle (pickers only).</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
				</div>
			</>


		),

		ideStr : 'cardActionsReminder',
		mulBoo : true,
		selStr : '.rem-card .today-card-actions',
		titStr : 'Card Actions'


	},

	// A day-off card (a conditional's triggered "rest" state) is excluded from cardActionsPicker above since it doesn't have the normal 3-button set, but unlike a charging card (where Re-Roll/Skip/Edit are ALL genuinely disabled, nothing real to highlight), a day-off card's own Skip IS a real, working button, only Re-Roll and Edit are disabled there. `button` (not .icon-btn generally) specifically targets that one real button, the disabled Re-Roll/Edit are InfTipCom's own <span> root, not a <button>, so this selector can't accidentally catch them.
	{


		bodEle : <>This button removes this day off from your todo list without completing it and updates the progress ring's total count accordingly. Re-Roll and Edit are disabled for this type of card.</>,
		ideStr : 'cardActionsDayOff',
		mulBoo : true,
		selStr : '.today-card--dayoff .today-card-actions button',
		titStr : 'Skip'


	},

	// #endregion Card Actions



	// #region Editing A Picker Item

	// This is reachable from Today's own Edit button too, not just the Data tab (DAT_HEL_ARR has its own copy of these same 6 items, scoped identically via .entry-editor, that class is shared verbatim by both tabs since it's literally the same EntryEditor component either way). // Item Name is the one exception: Today's own name field lives right on the card (.entry-card-name-input, EntryCard's own markup), not inside .entry-editor like Data's .rd-name-input does.
	{


		bodEle : <>This is the name field for this item, you can rename it here.</>,
		ideStr : 'itemName',
		selStr : '.entry-card-name-input',
		titStr : 'Item Name'


	},

	{


		bodEle : () => { // bodEle is a function (see help-mode.jsx's HelpTip) that reads the picker's own cadence unit word (days/weeks/months/years) straight off the already-rendered .np-ease-unit label instead of hardcoding "days", which would be wrong for a non-daily cadence picker.


			const unit = document.querySelector('.entry-editor .pie-ease-up-row .np-ease-unit')?.textContent || 'days'; // What: Unit String. Why: This item's own copy needs the real, currently-displayed unit label (e.g. "days"), not a hardcoded guess. How: This reads the matched row's own unit control text, falling back to 'days' if not found.



			return (


				<>
					<p><b>Soonest:</b> This controls the minimum number of {unit} that the item must wait before becoming eligible to be picked again.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

					<p><b>Latest:</b> This controls the maximum number of {unit} that the item must wait before becoming eligible to be picked again.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

					<p><b>Fill:</b> This will fill the item's charge to 100, making it eligible to be picked again.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
				</>


			);


		},

		ideStr  : 'itemChargeRangeUp',
		padYNum : 0,
		selStr  : '.entry-editor .pie-ease-up-row',
		titStr  : 'Item Charge Controls'


	},

	{


		bodEle : () => { // bodEle is a function (see help-mode.jsx's HelpTip) that reads the picker's own cadence unit word (days/weeks/months/years) straight off the already-rendered .np-ease-unit label instead of hardcoding "days", which would be wrong for a non-daily cadence picker.


			const unit = document.querySelector('.entry-editor .pie-ease-down-row .np-ease-unit')?.textContent || 'days'; // What: Unit String. Why: This item's own copy needs the real, currently-displayed unit label (e.g. "days"), not a hardcoded guess. How: This reads the matched row's own unit control text, falling back to 'days' if not found.



			return (


				<>
					<p><b>Shortest:</b> This controls the minimum number of {unit} that the item must stay as the active pick, after which a new item will be picked.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

					<p><b>Longest:</b> This controls the maximum number of {unit} that the item must stay as the active pick, after which a new item will be picked.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

					<p><b>Refill:</b> This will refill the item's charge back to 100, effectively resetting its active pick cadence.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
				</>


			);


		},

		ideStr  : 'itemChargeRangeDown',
		padYNum : 0,
		selStr  : '.entry-editor .pie-ease-down-row',
		titStr  : 'Item Charge Controls'


	},

	{


		bodEle  : <>This adjusts this item's pick chance relative to the picker's other items. A higher weight makes it more likely to be picked and a lower weight makes it less likely.</>,
		ideStr  : 'itemWeight',
		padYNum : 0,
		selStr  : '.entry-editor .pie-row:has(.weight-stepper)',
		titStr  : 'Item Weight'


	},

	{


		bodEle  : <>This is the item's current boost, which climbs by 1 each time it isn't picked and resets to 0 the next time it is. A higher boost makes it more likely to be picked.</>,
		ideStr  : 'itemBoost',
		padYNum : 0,
		selStr  : '.entry-editor .pie-row:has(.pie-boost-val)',
		titStr  : 'Item Boost'


	},

	{


		bodEle  : <>This toggles whether this item is eligible to be picked. Turning it off marks the item inactive, removing it from the picker's pool until it's turned back on.</>,
		ideStr  : 'itemActive',
		padYNum : 0,
		selStr  : '.entry-editor .pie-row:has(.switch)',
		titStr  : 'Item Active Toggle'


	},

	// selStr targets .rem-inline-foot (the shared wrapper), not .rd-edit-foot specifically, Delete swaps that sibling out for .rem-foot-confirm (its own Cancel/Delete pair), which a selector scoped to .rd-edit-foot would miss entirely once that swap happens: no dim-mask hole, AND the click-guard would treat its buttons as off-target and block them, making the confirmation genuinely unreachable while help mode is on.
	{


		bodEle : (


			<>
				<p><b>Delete:</b> This button permanently deletes this item, after asking you to confirm.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Cancel:</b> This button discards any changes and closes this editor without saving.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Save:</b> This button saves your changes to this item.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
			</>


		),

		ideStr : 'itemFoot',
		selStr : '.entry-editor .rem-inline-foot .btn',
		titStr : 'Delete / Cancel / Save'


	},

	// #endregion Editing A Picker Item



	// #region Add A Reminder

	{


		bodEle : <>This creates a new one-time or recurring reminder. Reminders are separate from pickers since some tasks cannot be randomly chosen and must be done on a schedule (recurring reminder) or are a one-time thing (one-time reminder).</>,
		ideStr : 'addReminder',
		selStr : '.rem-add-btn',
		titStr : 'Add a Reminder'


	},

	// Scoped to .rem-quickadd specifically, NOT the wider .rem-quickadd-wrap, .np-input is reused by the Repeat editor's own extra fields (the Every N Days number input, the Monthly/Yearly selects), so the wider scope was unioning the name field with whichever of those happened to be visible, stretching this highlight down into the Repeat section.
	{


		bodEle : <>This is the name field for your new reminder, give it a short, descriptive name. This is what will show up on your todo list.</>,
		ideStr : 'addReminderName',
		selStr : '.rem-quickadd .np-input',
		titStr : 'Reminder Name'


	},

	// .rem-editor (not just .seg, the pill row) so this always covers whatever extra fields the current selection reveals below the pills (the weekday chips for Weekly, the day/date pickers for the others), every option's own extra fields, not just whichever ones happened to share a class with the Reminder Name field above. No pinBelowSel here (unlike a first attempt at this), the highlighted rect IS .rem-editor itself, so the tip's normal "below the target" placement already tracks its own bottom edge as it grows/shrinks with the selection, without needing to pin to some other, unrelated element.
	{


		bodEle : (


			<>
				<p><b>Once:</b> This reminder stays on your todo list every day until you complete it, then it's gone for good.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Every N Days:</b> This reminder will show up on your todo list every N days, counted from the start date that you select below.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Weekly:</b> This reminder will show up on your todo list every N week(s) on the days that you select below.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Monthly:</b> This reminder will show up on your todo list every N month(s) on the day or weekday that you select below.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Yearly:</b> This reminder will show up on your todo list every N year(s) on the date or weekday that you select below.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
			</>


		),

		ideStr : 'addReminderRepeat',
		scrBoo : true, // scrBoo is true because the body now covers 5 schedule kinds including the every-N/weekday recurrence wording, tall enough to overlap the Repeat control/highlight on a short viewport without it; caps to whichever side (above/below) placeTip finds more room and scrolls internally there instead of overflowing into the target either way.
		selStr : '.rem-quickadd-wrap .rem-editor',
		titStr : 'Reminder Schedule'


	},

	// .btn, not the .rem-inline-foot row itself, that row is right-aligned/space-between and wider than its own buttons, which left a big empty gap included in the highlight.
	{


		bodEle : (


			<>
				<p><b>Cancel:</b> This button discards the reminder form without saving anything.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Add:</b> This button saves the reminder and adds it to your todo list, unless you selected a recurring reminder that is not due today. Stays disabled until at least a name is entered.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
			</>


		),

		ideStr : 'addReminderFoot',
		selStr : '.rem-quickadd-wrap .rem-inline-foot .btn',
		titStr : 'Cancel / Add'


	},

	// #endregion Add A Reminder



	// #region Editing An Existing Reminder

	// ReminderCard's name input + the ReminderInlineEdit/ReminderEditFoot pair it expands into, same underlying editor as Add a Reminder above, so these reuse its exact copy where the content is identical (name field, repeat schedule). The only real difference: Save replaces Add (no "stays disabled" caveat, Save has no disabled state, unlike Add), and there's a Delete button Add's form doesn't have.
	{


		bodEle : <>This is the name field for your reminder, give it a short, descriptive name. This is what will show up on your todo list.</>,
		ideStr : 'editReminderName',
		selStr : '.rem-card-name-input',
		titStr : 'Reminder Name'


	},

	// .rem-inline-editor is shared markup used by THREE different editors: the Add Reminder quick-add form, an existing reminder's own editor (this item), AND a picker item's EntryEditor (tab-today.jsx). The picker-item case is excluded via :not(.entry-editor) (its root carries that extra class), but :not(.rem-quickadd-wrap *) is ALSO required: .rem-quickadd-wrap merely WRAPS its own .rem-inline-editor, it doesn't stop the bare :not(.entry-editor) check from still matching that inner element too, which produced two overlapping "Reminder Schedule" badges at once whenever the Add Reminder form was open (found via live testing, addReminderRepeat's own comment above claiming this was "already covered, doesn't conflict" was wrong).
	{


		bodEle : (


			<>
				<p><b>Once:</b> This reminder stays on your todo list every day until you complete it, then it's gone for good.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Every N Days:</b> This reminder will show up on your todo list every N days, counted from the start date that you select below.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Weekly:</b> This reminder will show up on your todo list every N week(s) on the days that you select below.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Monthly:</b> This reminder will show up on your todo list every N month(s) on the day or weekday that you select below.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Yearly:</b> This reminder will show up on your todo list every N year(s) on the date or weekday that you select below.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
			</>


		),

		ideStr : 'editReminderRepeat',
		scrBoo : true, // scrBoo is true here too, same reasoning as addReminderRepeat above.
		selStr : '.rem-inline-editor:not(.entry-editor):not(.rem-quickadd-wrap *) .rem-editor',
		titStr : 'Reminder Schedule'


	},

	// BUG FIXED HERE: this used to be the unscoped '.rd-edit-foot .btn', which, since .rd-edit-foot is the SAME class a picker item's own EntryEditor footer uses, was ALSO matching that footer on the Today tab, showing this reminder-specific copy ("this reminder...") on a picker item's Delete/Cancel/Save instead of itemFoot's own "this item..." copy just below. .rem-inline-editor:not(.entry-editor) (see editReminderRepeat's own comment) properly scopes this to an actual reminder's editor. selStr targets .rem-inline-foot (the shared wrapper), not .rd-edit-foot specifically, Delete's own confirm prompt swaps in a DIFFERENT sibling class (.rem-foot-confirm), which a selector scoped to .rd-edit-foot would miss entirely: no dim-mask hole, AND the click-guard would treat its Cancel/Delete buttons as off-target and block them, making the confirmation genuinely unreachable while help mode is on, this was wrongly assumed harmless ("gracefully has nothing to highlight") until the user found it actually blocks the click too, not just the highlight. // :not(.rem-quickadd-wrap *) is also needed since the Add Reminder quickadd form (Today only) uses this exact same .rem-inline-editor > .rem-inline-foot structure for its own Cancel/Add buttons (no rd-edit-foot/rem-foot-confirm distinction there, since a brand-new draft has nothing to delete yet); widening from .rd-edit-foot to the shared .rem-inline-foot wrapper (see the comment above) would otherwise ALSO match those, duplicating this badge the same way editReminderRepeat's own selector once did.
	{


		bodEle : (


			<>
				<p><b>Delete:</b> This button permanently deletes this reminder, after asking you to confirm.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Cancel:</b> This button discards any changes and closes this editor without saving.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Save:</b> This button saves your changes to this reminder and updates it on your todo list.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
			</>


		),

		ideStr : 'editReminderFoot',
		selStr : '.rem-inline-editor:not(.entry-editor):not(.rem-quickadd-wrap *) .rem-inline-foot .btn',
		titStr : 'Delete / Cancel / Save'


	},

	// #endregion Editing An Existing Reminder



	// #region Footer Actions

	{


		bodEle : <>This opens a log of everything that has happened for this section today. Including what was auto-picked, skipped, manually selected, re-rolled, and completed. It will also show the new updated values, if applicable, once an item has been marked as completed.</>,
		ideStr : 'dayLog',
		selStr : '.rem-section .dl-chip',
		titStr : 'Section Log'


	},

	// Every OTHER group section (Chores, Food, ...) gets the same Log chip as Reminders, :not(.rem-section):not(.pt-section) excludes Reminders itself (already covered above) and the Page Tours onboarding section.
	{


		bodEle : <>This opens a log of everything that has happened for this section today. Including what was auto-picked, skipped, manually selected, re-rolled, and completed. It will also show the new updated values, if applicable, once an item has been marked as completed.</>,
		ideStr : 'dayLogPicker',
		mulBoo : true, // mulBoo is true (see help-mode.jsx) so each group's OWN Log button gets its own badge, since the user could be scrolled to any one of them.
		selStr : '.group-section:not(.rem-section):not(.pt-section) .dl-chip',
		titStr : 'Section Log'


	},

	{


		bodEle  : <>This re-runs the daily generator manually, replacing your todo list. Anything already marked complete will be replaced too and won't show up in the Stats tab.</>,
		ideStr  : 'regenerate',
		padXNum : 4, // padXNum: 4, see editMode's own comment; same gap, same fix, symmetric.
		selStr  : '.ob-generate',
		titStr  : 'Regenerate'


	},

	// #endregion Footer Actions



	// #region Reminders Log Panel

	// day-log.jsx's RemLogCom, dl-mk-r* classes are dedicated selector hooks, kept separate from the visually-styled .dl-r-name/.dl-r-when/.dl-r-st classes so adding them to the header row (alongside the data rows, for one column-spanning highlight) doesn't drag data-row font styling onto the header labels.
	{


		bodEle : <>This lists every reminder you've created, whether it's due today or not.</>,
		groStr : 'reminderLogCols', // groStr (see help-mode.jsx) makes the 3 highlights meet edge-to-edge with no gap or overlap between them, rather than each shrinking to its own content.
		ideStr : 'logReminderName',
		selStr : '.dl-mk-rname',
		titStr : 'Reminder Column'


	},

	{


		bodEle : <>This shows each reminder's schedule. That includes how often it repeats, or if it's only a one-time reminder.</>,
		groStr : 'reminderLogCols',
		ideStr : 'logReminderWhen',
		selStr : '.dl-mk-rwhen',
		titStr : 'When Column'


	},

	{


		bodEle : <>This shows whether this reminder is done, due today, skipped for today, or when it will next come due.</>,
		groStr : 'reminderLogCols',
		ideStr : 'logReminderStatus',
		selStr : '.dl-mk-rst',
		titStr : 'Status Column'


	},

	// #endregion Reminders Log Panel



	// #region Picker/Conditional Log Panel

	// day-log.jsx's GroLogCom, dl-mk-* here are the same kind of dedicated hooks. Deliberately TWO separate column groups (picker item rows vs. Conditionals section rows) rather than one shared set: the Conditionals section has its own full-width "Rested: .../Attached: ..." line between rows, which a single highlight spanning BOTH sections would otherwise stretch across, making it look like that unrelated text was part of the column.
	{


		bodEle : (


			<>
				<p>This explains the icons that are used in the Status column below.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Auto-picked:</b> This indicates that an item was chosen automatically by the daily generator.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Pushed:</b> This indicates that an item was pushed onto your todo list manually from the Pickers page.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Rolled off:</b> This indicates that an item was on your todo list but was then replaced by another item via the Re-Roll button.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Skipped:</b> This indicates that an item was on your todo list but was then removed via the Skip button.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Completed:</b> This indicates that the item is on your todo list and has been marked as completed.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
			</>


		),

		ideStr : 'logPickerKey',
		selStr : '.dl-key',
		titStr : 'Key'


	},

	{


		bodEle : <>This lists every item in this picker's pool. It also shows its weight (Weighted), weight + boost (Dynamic Weighted) or eligible range (Ease Up or Ease Down), depending on the picker's mode.</>,
		groStr : 'pickerLogCols',
		ideStr : 'logPickerItem',
		selStr : '.dl-block:not(.dl-cond-sec) .dl-mk-item',
		titStr : 'Item Column'


	},

	{


		bodEle : <>This lists the item's value at the moment your todo list was generated. This only applies to Dynamic Weighted, Ease Up and Ease Down picker items, it shows N/A otherwise.</>,
		groStr : 'pickerLogCols',
		ideStr : 'logPickerAtGen',
		selStr : '.dl-block:not(.dl-cond-sec) .dl-mk-atgen',
		titStr : 'At Gen Column'


	},

	{


		bodEle : <>This shows how much this item's value changed since your todo list was generated. This only applies to Dynamic Weighted, Ease Up and Ease Down picker items.</>,
		groStr : 'pickerLogCols',
		ideStr : 'logPickerDelta',
		selStr : '.dl-block:not(.dl-cond-sec) .dl-mk-delta',
		titStr : 'Δ Column'


	},

	{


		bodEle : <>This shows the item's current value, reflecting updated values due to the current item being marked as completed in your todo list.</>,
		groStr : 'pickerLogCols',
		ideStr : 'logPickerAfter',
		selStr : '.dl-block:not(.dl-cond-sec) .dl-mk-after',
		titStr : 'After Column'


	},

	{


		bodEle : <>This shows any relevant icons that reflect what has happened to this item today. Please see the KEY row above for what each icon means.</>,
		groStr : 'pickerLogCols',
		ideStr : 'logPickerStatus',
		selStr : '.dl-block:not(.dl-cond-sec) .dl-mk-status',
		titStr : 'Status Column'


	},

	{


		bodEle : <>This lists every conditional attached to a picker in this group. It also shows its odds of being triggered or its charge range, depending on its mode.</>,
		groStr : 'condLogCols',
		ideStr : 'logCondItem',
		selStr : '.dl-cond-sec .dl-mk-item',
		titStr : 'Conditional Column'


	},

	{


		bodEle : <>This lists the conditional's value at the moment your todo list was generated. This only applies to Dynamic Weighted, Ease Up and Ease Down conditionals, it shows N/A otherwise.</>,
		groStr : 'condLogCols',
		ideStr : 'logCondAtGen',
		selStr : '.dl-cond-sec .dl-mk-atgen',
		titStr : 'At Gen Column'


	},

	{


		bodEle : <>This shows how much this conditional's value changed since your todo list was generated. This only applies to Dynamic Weighted, Ease Up and Ease Down conditionals.</>,
		groStr : 'condLogCols',
		ideStr : 'logCondDelta',
		selStr : '.dl-cond-sec .dl-mk-delta',
		titStr : 'Δ Column'


	},

	{


		bodEle : <>This shows the conditional's current value, reflecting any change from a dependent picker's item being marked as completed in your todo list.</>,
		groStr : 'condLogCols',
		ideStr : 'logCondAfter',
		selStr : '.dl-cond-sec .dl-mk-after',
		titStr : 'After Column'


	},

	{


		bodEle : <>This shows whether this conditional is currently triggered (its dependent pickers are resting today) or not.</>,
		groStr : 'condLogCols',
		ideStr : 'logCondStatus',
		selStr : '.dl-cond-sec .dl-mk-status',
		titStr : 'Status Column'


	},

	// #endregion Picker/Conditional Log Panel


];



const PIC_HEL_ARR = [ // What: Picker Help Array. Why: This is the on-demand help catalog for the Pickers tab, one entry per distinct piece of functionality on that page rather than one per DOM element. How: This is imported by tab-picker.jsx and passed to HelOveCom as its own helIteArr prop.


	// #region Pickers Header

	{


		bodEle : <>You can click this logo at any time to navigate back to the home page of the app, the Today page.</>,
		ideStr : 'brandMark',
		selStr : '.picker-h-lead .brand-mark',
		titStr : 'Home Link'


	},

	{


		bodEle : <>This filters the pickers row below by group, which is extremely useful if you have created a lot of pickers.</>,
		ideStr : 'groupFilter',
		selStr : '.picker-groups:not(.picker-groups--type) .picker-group-pill',
		titStr : 'Group Filter'


	},

	{


		bodEle : <>This filters the pickers row below by picker type (Truly Random, Weighted, Dynamic Weighted, Ease Up, Ease Down), independent of the Group filter above with both narrowing the row together.</>,
		ideStr : 'typeFilter',
		selStr : '.picker-groups--type .picker-group-pill',
		titStr : 'Type Filter'


	},

	// #endregion Pickers Header



	// #region Picker Details

	{


		bodEle  : <>This selects a specific picker, in order to initiate a manual picker generation down below as well as edit or delete its items.</>,
		ideStr  : 'pickerSelection',
		padXNum : 3, // padXNum: 3, the add button sits right before the first tab in the same 8px-gap scrollable row; the default 8px pad on each side would overlap by 8px otherwise (same bleed as Today's Edit Mode/Regenerate).
		selStr  : '.picker-tabs .picker-tab:not(.picker-tab--add)',
		titStr  : 'Picker Selection'


	},

	{


		bodEle  : <>This is where you can create new pickers. This button will open up a full page form with 2 parts, picker settings and picker items.</>,
		ideStr  : 'createNewPickers',
		padXNum : 3, // padXNum: 3, see pickerSelection's own comment, same gap, same fix.
		selStr  : '.picker-tab--add',
		titStr  : 'Create New Pickers'


	},

	// :not(.np-form) excludes the Edit/Create-picker form's own reused .picker-title header, same name, different element, only ever one or the other on screen at once, but the selector still needs to be unambiguous for whichever is actually showing.
	{


		bodEle  : <>This is the name of the currently selected picker.</>,
		ideStr  : 'pickerName',
		padYNum : 2, // padYNum: 2, the mode pill sits directly below with only a 6px margin-top (see styles2.css's .picker-h > div > .pill rule); the default 8px pad on each side would overlap by 10px otherwise, bleeding into the pill's own highlight.
		selStr  : '.picker-view:not(.np-form) .picker-title',
		titStr  : 'Picker Name'


	},

	{


		bodEle  : <>This shows the currently selected picker's type (Truly Random, Weighted, Dynamic Weighted, Ease Up, or Ease Down).</>,
		ideStr  : 'pickerTypePill',
		padYNum : 2, // padYNum: 2, see pickerName's own comment, same 6px gap, same fix.
		selStr  : '.picker-view:not(.np-form) .pill--mode',
		titStr  : 'Picker Type'


	},

	{


		bodEle : <>This opens the same form used to create a picker, pre-filled with this picker's current settings. You can adjust its name, group, type, daily generator schedule, or conditional attachment. Its items aren&rsquo;t edited here, but you can use this picker's own item list below or the Data tab for that.</>,
		ideStr : 'editPicker',
		selStr : '.picker-edit-btn',
		titStr : 'Edit Picker'


	},

	{


		bodEle : <>This explains the currently selected picker's ruleset, including how it chooses an item and why you might pick this type over another.</>,
		ideStr : 'pickerExplanation',
		selStr : '.picker-view:not(.np-form) .picker-hint',
		titStr : 'Picker Explanation'


	},

	{


		bodEle : (


			<>
				<p>The Pick One button runs a manual pick generation for the selected picker, so that you don't have to completely rely on your todo list's auto generation.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p>Once it resolves and generates a pick it is replaced by the Send to Today button, which will add the selected pick to your todo list. The Re-Roll button will run the process again and the Done button will end the process without doing anything.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
			</>


		),

		ideStr : 'manualGeneration',
		selStr : '.picker-run',
		titStr : 'Manual Generation'


	},

	// #endregion Picker Details



	// #region Picker Item Pool

	{


		bodEle : (


			<>This lists all of the items that are in this picker's pool, including their values (if applicable). The <span className='help-inline-icon'><IcoSvgCom name='calendar' size={13} /></span> Send to Today button will send the item to your todo list on the Today page, the <span className='help-inline-icon'><IcoSvgCom name='edit' size={13} /></span> Edit button will allow you to edit the item's properties and the <span className='help-inline-icon'><IcoSvgCom name='trash' size={13} /></span> Delete button will delete the item after asking for confirmation.</>


		),

		ideStr  : 'pickerItems',
		padYNum : 4, // padYNum: 4, .picker-pool (the shared flex-column parent) only has a 10px gap to the Add Picker Item button below; the default 8px pad on each side would overlap by 6px otherwise.
		selStr  : '.pool-items',
		titStr  : 'Picker Items'


	},

	{


		bodEle  : <>This button will open a form that allows you to add a new item to the selected picker's pool.</>,
		ideStr  : 'addPickerItem',
		padYNum : 4, // padYNum: 4, see pickerItems' own comment, same gap, same fix.
		selStr  : '.pv-additem-btn',
		titStr  : 'Add Picker Item'


	},

	// Clicking Edit on a pool item opens the shared EntryEditor (same component/markup as Today's and Data's item-editor coverage, see those catalogs' own comments), but it renders inside .pv-additem-wrap, BELOW the pool list, not inline where the item's own row is. No scroll-into-view step exists in help mode (unlike the guided tour), so these badges simply appear wherever that section currently sits once an edit is open; the user scrolls to find them like anything else below the fold. This same markup/selector set is ALSO what Step 2 of the Create a Picker form uses for each new item's editor (identical .pv-newitem/.rd-item/.entry-editor structure), one shared set of entries covers editing an existing pool item, adding one from an existing picker's own pool, and building a brand new picker's pool. .rd-name-input is also used by the Conditionals section elsewhere in the app (same .rd-item wrapper shape), :has(.entry-editor) picks out only a .rd-item that's actually an ITEM editor.
	{


		bodEle : <>This is the name field for your new item, give it a short, descriptive name. This is what will show up on your todo list.</>,
		ideStr : 'itemName',
		selStr : '.rd-item:has(.entry-editor) .rd-name-input',
		titStr : 'Item Name'


	},

	{


		bodEle : () => { // bodEle is a function (see help-mode.jsx's HelpTip) that reads the picker's own cadence unit word (days/weeks/months/years) straight off the already-rendered .np-ease-unit label instead of hardcoding "days", which would be wrong for a non-daily cadence picker.


			const unit = document.querySelector('.entry-editor .pie-ease-up-row .np-ease-unit')?.textContent || 'days'; // What: Unit String. Why: This item's own copy needs the real, currently-displayed unit label (e.g. "days"), not a hardcoded guess. How: This reads the matched row's own unit control text, falling back to 'days' if not found.



			return (


				<>
					<p><b>Soonest:</b> This controls the minimum number of {unit} that the item must wait before becoming eligible to be picked again.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

					<p><b>Latest:</b> This controls the maximum number of {unit} that the item must wait before becoming eligible to be picked again.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

					<p><b>Fill:</b> This will fill the item's charge to 100, making it eligible to be picked again.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
				</>


			);


		},

		ideStr  : 'itemChargeRangeUp',
		padYNum : 0,
		selStr  : '.entry-editor .pie-ease-up-row',
		titStr  : 'Item Charge Controls'


	},

	{


		bodEle : () => { // bodEle is a function (see help-mode.jsx's HelpTip) that reads the picker's own cadence unit word (days/weeks/months/years) straight off the already-rendered .np-ease-unit label instead of hardcoding "days", which would be wrong for a non-daily cadence picker.


			const unit = document.querySelector('.entry-editor .pie-ease-down-row .np-ease-unit')?.textContent || 'days'; // What: Unit String. Why: This item's own copy needs the real, currently-displayed unit label (e.g. "days"), not a hardcoded guess. How: This reads the matched row's own unit control text, falling back to 'days' if not found.



			return (


				<>
					<p><b>Shortest:</b> This controls the minimum number of {unit} that the item must stay as the active pick, after which a new item will be picked.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

					<p><b>Longest:</b> This controls the maximum number of {unit} that the item must stay as the active pick, after which a new item will be picked.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

					<p><b>Refill:</b> This will refill the item's charge back to 100, effectively resetting its active pick cadence.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
				</>


			);


		},

		ideStr  : 'itemChargeRangeDown',
		padYNum : 0,
		selStr  : '.entry-editor .pie-ease-down-row',
		titStr  : 'Item Charge Controls'


	},

	{


		bodEle  : <>This adjusts the item's pick chance relative to the picker's other items. For example, an item with a weight of w2 is twice as likely to be picked as an item with a weight of w1.</>,
		ideStr  : 'itemWeight',
		padYNum : 0,
		selStr  : '.entry-editor .pie-row:has(.weight-stepper)',
		titStr  : 'Item Weight'


	},

	{


		bodEle  : <>This is the item's current boost, which climbs by 1 each time it isn't picked and resets to 0 the next time it is. A higher boost makes it more likely to be picked.</>,
		ideStr  : 'itemBoost',
		padYNum : 0,
		selStr  : '.entry-editor .pie-row:has(.pie-boost-val)',
		titStr  : 'Item Boost'


	},

	{


		bodEle  : <>This toggles whether this item is eligible to be picked. Turning it off marks the item inactive, removing it from the picker's pool until it's turned back on.</>,
		ideStr  : 'itemActive',
		padYNum : 0,
		selStr  : '.entry-editor .pie-row:has(.switch)',
		titStr  : 'Item Active Toggle'


	},

	// Unlike Today/Data, the Delete button is CSS-hidden here (.pv-newitem .rd-edit-foot > .btn--danger), deleting an existing item stays solely the pool row's own trash icon + confirm flow on this tab, so the copy only covers Cancel/Save.
	{


		bodEle : (


			<>
				<p><b>Cancel:</b> This button discards the form and closes the editor without saving the new item.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Save:</b> This button saves the new item to the picker's pool.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
			</>


		),

		ideStr : 'itemFoot',
		selStr : '.entry-editor .rd-edit-foot .btn',
		titStr : 'Cancel / Save'


	},

	// #endregion Picker Item Pool



	// #region Create A Picker Form Step 1

	// :has(#np-name) scopes to just this field, since every field in the form shares the plain .np-field wrapper class.
	{


		bodEle : <>This is the name field for your new picker, and it should have a short, descriptive name.</>,
		ideStr : 'newPickerName',
		selStr : '.np-field:has(#np-name)',
		titStr : 'Picker Name'


	},

	// :has(.np-groups) scopes to just this field, same reasoning as newPickerName's own comment.
	{


		bodEle : <>This will let you choose which group this new picker belongs to. Groups cluster related pickers together on your todo list, like "Food" or "Chores". You can select an existing group or create a new one.</>,
		ideStr : 'newPickerGroup',
		selStr : '.np-field:has(.np-groups)',
		titStr : 'Picker Group'


	},

	// Deliberately doesn't re-explain each mode, every option already has its own ruleset/explanation copy right there on the page, and there isn't room for that much text in a tooltip anyway.
	{


		bodEle : <>This is where you choose the rule this picker follows each time it runs. Each option below explains its own ruleset, so have a read through them to see which one fits best.</>,
		ideStr : 'newPickerMode',
		selStr : '.np-field:has(.mode-radio)',
		titStr : 'Picker Type'


	},

	// Scoped to just the toggle row, not the collapsed attach-flow below it (the conditional pill rail + inline "create new conditional" form), that's its own whole nested interface, left for a future pass rather than reaching into collapsed content on this first one.
	{


		bodEle : <>This lets you optionally gate this picker behind a conditional. When you attach a conditional, the picker will only run on days determined by that conditional's own rules. For example, giving yourself an occasional day off from chores. You can attach an existing conditional or create a new one.</>,
		ideStr : 'newPickerConditional',
		selStr : '.np-cond .np-field--toggle',
		titStr : 'Picker Conditional'


	},

	// Only present once the toggle above is on (the whole .cnd-attach block is a ColDisCom), findTargets naturally won't match anything while it's closed, no visibility check needed here.
	{


		bodEle : <>This lets you select an existing conditional to attach to this picker. If you don't have one yet, or want to create another, use the Add New Conditional button to build one inline.</>,
		ideStr : 'newPickerConditionalRail',
		selStr : '.cnd-rail',
		titStr : 'Select a Conditional'


	},

	// -- Add New Conditional (CodConCom, inline in the create flow)
	{


		bodEle : <>This is the name field for your new conditional, and it should have a short, descriptive name.</>,
		ideStr : 'newCondName',
		selStr : '.cnd-controls .np-field:has(input[placeholder="Conditional name"])',
		titStr : 'Conditional Name'


	},

	{


		bodEle : <>This is the text that will show on the card that appears in your todo list whenever this conditional suppresses any attached pickers.</>,
		ideStr : 'newCondCardText',
		selStr : '.np-field--cardtext',
		titStr : 'Conditional Card Text'


	},

	// Deliberately doesn't re-explain each type, every option already has its own ruleset/explanation copy right there on the page, same as newPickerMode's own comment. // padYNum: 0, this whole cluster (Type/Weight/Odds/Boost/Charge Controls/Active) sits close enough together, .cnd-type-group's own gap to a sibling block is only 6px, and Odds-to-Boost specifically share the SAME block with next to no gap at all, that the default 8px pad would overlap somewhere no matter which type is selected. Zero pad on all of them relies on newCondActive's own padYNum to open a gap instead (see its comment), same "let one side of the boundary do the work" approach as EntryEditor's itemWeight/itemBoost.
	{


		bodEle  : <>This is where you choose the rule this conditional follows each time it runs. Each option below explains its own ruleset, so have a read through them to see which one fits best.</>,
		ideStr  : 'newCondType',
		padYNum : 0,
		selStr  : '.cnd-controls .np-field:has(.rd-mode-radio)',
		titStr  : 'Conditional Type'


	},

	{


		bodEle  : <>Truly Random conditionals have no adjustable settings. Every time this conditional runs, it has an equal 50/50 chance to trigger.</>,
		ideStr  : 'newCondRandom',
		padYNum : 0,
		selStr  : '.cnd-typectl:has(.pie-noweight)',
		titStr  : 'Conditional Weight'


	},

	{


		bodEle  : <>This adjusts the conditional's chance to trigger each time it runs. A higher percentage makes it more likely to trigger and a lower percentage makes it less likely.</>,
		ideStr  : 'newCondOdds',
		padYNum : 0,
		selStr  : '.cnd-typectl .pie-row:has(.weight-stepper)',
		titStr  : 'Conditional Trigger Odds'


	},

	{


		bodEle  : <>This is the conditional's current boost, which climbs by a percentage each time it doesn't trigger and resets to 0 the next time it does. A higher boost makes it more likely to trigger.</>,
		ideStr  : 'newCondBoost',
		padYNum : 0,
		selStr  : '.cnd-typectl .pie-row:has(.pie-boost-val)',
		titStr  : 'Conditional Boost'


	},

	// cnd-ease-up-row / cnd-ease-down-row, see tab-conditional.jsx's own comment; same split-by-direction pattern as EntryEditor's itemChargeRangeUp/Down.
	{


		bodEle : (


			<>
				<p><b>Soonest:</b> This controls the minimum number of days that must pass before the conditional becomes eligible to trigger.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Latest:</b> This controls the maximum number of days that must pass before the conditional is guaranteed to trigger.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Fill:</b> This will fill the conditional's charge to 100, making it eligible to trigger.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
			</>


		),

		ideStr  : 'newCondEaseUp',
		padYNum : 0,
		selStr  : '.cnd-typectl .cnd-ease-up-row',
		titStr  : 'Conditional Charge Controls'


	},

	{


		bodEle : (


			<>
				<p><b>Shortest:</b> This controls the minimum number of days that the conditional must stay triggered before it can stop.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Longest:</b> This controls the maximum number of days that the conditional can stay triggered before it must stop.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Refill:</b> This will refill the conditional's charge back to 100, effectively resetting how long it stays triggered.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
			</>


		),

		ideStr  : 'newCondEaseDown',
		padYNum : 0,
		selStr  : '.cnd-typectl .cnd-ease-down-row',
		titStr  : 'Conditional Charge Controls'


	},

	{


		bodEle  : <>This toggles whether this conditional is currently active. Turning it off effectively disables the conditional, so its attached picker will always run regardless of the conditional's own trigger state.</>,
		ideStr  : 'newCondActive',
		padYNum : 3, // padYNum: 3, opens a gap against whichever zero-pad block sits above it (Weight/Odds/Boost/Charge Controls all now padYNum: 0, see their own comment), while staying comfortably under the real 6px gap so it can't reach up into that block's own content.
		selStr  : '.cnd-controls .pie-row:has(.switch)',
		titStr  : 'Conditional Active Toggle'


	},

	// -- Daily Generator section (still Step 1 of the Create a Picker form)
	{


		bodEle : <>This determines whether the picker will be included in the app's daily auto-generator. When on, this picker's items will be automatically added to your todo list. When off, the picker won't run automatically, but you can still generate a pick manually from this tab.</>,
		ideStr : 'newPickerDaily',
		selStr : '.np-daily-group .np-field--toggle',
		titStr : 'Daily Generator Toggle'


	},

	// .cad-ctl wraps BOTH the pill row and whichever extra "which day/date" field is currently showing below it, same "one editor, styled together" shape as Today's own addReminderRepeat/.rem-editor, so one highlight over the whole thing, growing/shrinking with the selection, instead of a per-option split.
	{


		bodEle : (


			<>
				<p><b>Daily:</b> This is the picker's default cadence. It surfaces every day that it's scheduled to run, exactly like an ordinary picker.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Weekly:</b> This surfaces the picker once a week, on whichever weekday you choose below. Once picked, that item stays on your todo list until you mark it as completed, even if that takes more than one day.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Monthly:</b> This surfaces the picker once a month, on whichever day you choose below. Once picked, that item stays on your todo list until you mark it as completed, even if that takes more than one day.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Yearly:</b> This surfaces the picker once a year, on whichever date you choose below. Once picked, that item stays on your todo list until you mark it as completed, even if that takes more than one day.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
			</>


		),

		ideStr : 'newPickerCadence',
		selStr : '.cad-ctl',
		titStr : 'Picker Cadence'


	},

	// :has(.np-sched-row) distinguishes this from the OTHER .np-sched-block (CadConCom's own wrapper), which shares the same bare class.
	{


		bodEle : <>This lets you choose which days of the week this picker is allowed to run on. Tap a day to toggle it on or off, or use the Every day/Weekdays/Weekends presets to quickly set a common pattern.</>,
		ideStr : 'newPickerWhichDays',
		selStr : '.np-sched-block:has(.np-sched-row)',
		titStr : 'Picker Day Selection'


	},

	// :has(#np-skiphol) distinguishes this from the OTHER .np-sched-toggle just below it (Picker Duplicate Items Toggle), both share the same bare class.
	{


		bodEle : <>This determines whether this picker skips major U.S. holidays. When on, this picker won't run on those days. You can edit which days count as holidays, or add your own, in Settings.</>,
		ideStr : 'newPickerSkipHolidays',
		selStr : '.np-sched-toggle:has(#np-skiphol)',
		titStr : 'Picker Holidays Toggle'


	},

	{


		bodEle : <>This determines whether the picker is allowed to choose an item when another item with the same name already exists elsewhere in the generated daily todo list. If all items are ineligible due to duplication, then this setting is ignored and an item is chosen normally.</>,
		ideStr : 'newPickerAvoidDuplicates',
		selStr : '.np-sched-toggle:has(#np-avoiddupes)',
		titStr : 'Picker Duplicate Items Toggle'


	},

	// .np-footer--step1 scopes this to Step 1 specifically, Step 2's own footer (see newPickerItemsFooterNote below) is a bare .np-footer with no modifier class, so without this both steps' .np-footer-note would match the same selector and only one entry could ever win.
	{


		bodEle : <>This area lets you know if anything still needs to be filled out before you can advance to the next step, or confirms that you're ready to move on.</>,
		ideStr : 'newPickerFooterNote',
		selStr : '.np-footer--step1 .np-footer-note',
		titStr : 'Picker Form Status'


	},

	{


		bodEle : (


			<>
				<p><b>Cancel:</b> This button discards the picker form without saving anything.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Add Items:</b> This button advances to the next step, where you'll build this picker's item pool. Stays disabled until at least a name and group are set.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
			</>


		),

		ideStr : 'newPickerFooterActions',
		selStr : '.np-footer--step1 .np-footer-actions .btn',
		titStr : 'Cancel / Add Items'


	},

	// #endregion Create A Picker Form Step 1



	// #region Create A Picker Form Step 2

	// :not(.np-footer--step1), see newPickerFooterNote's own comment.
	{


		bodEle : <>This area lets you know if anything still needs to be filled out before you can submit the form, or confirms that the picker is ready to be created.</>,
		ideStr : 'newPickerItemsFooterNote',
		selStr : '.np-footer:not(.np-footer--step1) .np-footer-note',
		titStr : 'Add Items Form Status'


	},

	{


		bodEle : (


			<>
				<p><b>Back:</b> This button will take you back to the first part of the form, allowing you to adjust the picker's settings.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Create Picker:</b> This button will create the new picker. Stays disabled until at least 2 items are created.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
			</>


		),

		ideStr : 'newPickerItemsFooterActions',
		selStr : '.np-footer:not(.np-footer--step1) .np-footer-actions .btn',
		titStr : 'Back / Create Picker'


	},

	// #endregion Create A Picker Form Step 2


];



const STA_HEL_ARR = [ // What: Stats Help Array. Why: This is the on-demand help catalog for the Stats tab, one entry per distinct piece of functionality on that page rather than one per DOM element. How: This is imported by tab-stats.jsx and passed to HelOveCom as its own helIteArr prop.


	// #region Stats Header

	{


		bodEle : <>You can click this logo at any time to navigate back to the home page of the app, the Today page.</>,
		ideStr : 'brandMark',
		selStr : '.stat-h-lead .brand-mark',
		titStr : 'Home Link'


	},

	{


		bodEle : <>This filters the pickers row below by group, which is extremely useful if you have created a lot of pickers.</>,
		ideStr : 'groupFilter',
		selStr : '.stat-scope-groups:not(.stat-scope-groups--type) .picker-group-pill',
		titStr : 'Group Filter'


	},

	{


		bodEle : <>This filters the pickers row below by type. You can select picker mode (Truly Random, Weighted, Dynamic Weighted, Ease Up, Ease Down), Conditionals or Reminders, independent of the Group filter above with both narrowing the row together.</>,
		ideStr : 'typeFilter',
		selStr : '.stat-scope-groups--type .picker-group-pill',
		titStr : 'Type Filter'


	},

	{


		bodEle : <>This selects what the rest of the page shows: conditionals, reminders, a specific picker, or everything all at once.</>,
		ideStr : 'pickersFilter',
		selStr : '.stat-scope-tabs .picker-tab',
		titStr : 'Show Selector'


	},

	{


		bodEle : <>This further narrows your selection by date range, with ranges from 1 week to 1 year to all time.</>,
		ideStr : 'rangeFilter',
		selStr : '.stat-filter-pills--seg .stat-pill',
		titStr : 'Range Filter'


	},

	// #endregion Stats Header



	// #region Headline Numbers

	// Three different card sets share the same position (between the Range filter and the heatmap/breakdown below), one per scope: All/a specific picker, Reminders, and Conditionals. Each card needed its own stat-mk-* marker class in tab-stats.jsx first, since they all otherwise share the plain .stat-card class with nothing to distinguish one from another. // padXNum/padYNum: 4, these 4 cards sit in a CSS grid with only a 10px gap (both row-gap and column-gap, since it's a single `gap: 10px` on .stat-row), so the default 8px pad on each side would overlap a neighbor's own pad by 6px, on whichever edge is shared (right/left in the desktop single-row layout, all four edges in the mobile 2x2 grid). 4+4=8 leaves 2px of daylight in the 10px gap instead. // All and a specific picker scope both render these same stat-mk-* cards (see tab-stats.jsx's own comment on stat-mk-scope-*), so each gets its own entry below scoped to stat-mk-scope-all/-picker, with its own title/copy.
	{


		bodEle  : <>This shows your current streak of consecutive days where you've completed all items in your todo list.</>,
		ideStr  : 'statStreak',
		padXNum : 4,
		padYNum : 4,
		selStr  : '.stat-mk-scope-all.stat-mk-streak',
		titStr  : 'Day Streak'


	},

	{


		bodEle  : <>This shows the number of days where you completed everything in your todo list that day, compared to the number of total active days shown next to it.</>,
		ideStr  : 'statFullDays',
		padXNum : 4,
		padYNum : 4,
		selStr  : '.stat-mk-scope-all.stat-mk-fulldays',
		titStr  : 'Full Days'


	},

	{


		bodEle  : <>This shows the total number of items you've completed in this range.</>,
		ideStr  : 'statDone',
		padXNum : 4,
		padYNum : 4,
		selStr  : '.stat-mk-scope-all.stat-mk-done',
		titStr  : 'Items Done'


	},

	{


		bodEle  : <>This shows the percentage of items you've completed, out of every item that was in your todo list in this range.</>,
		ideStr  : 'statRate',
		padXNum : 4,
		padYNum : 4,
		selStr  : '.stat-mk-scope-all.stat-mk-rate',
		titStr  : 'Completion Rate'


	},

	{


		bodEle  : <>This shows your current streak of consecutive days where you've completed all items in your todo list.</>,
		ideStr  : 'statPickerStreak',
		padXNum : 4,
		padYNum : 4,
		selStr  : '.stat-mk-scope-picker.stat-mk-streak',
		titStr  : 'Picker Day Streak'


	},

	{


		bodEle  : <>This shows the number of days where you've completed everything in your todo list for that day, compared to the number of total active days shown next to it.</>,
		ideStr  : 'statPickerFullDays',
		padXNum : 4,
		padYNum : 4,
		selStr  : '.stat-mk-scope-picker.stat-mk-fulldays',
		titStr  : 'Picker Full Days'


	},

	{


		bodEle  : <>This shows the total number of items that you've completed for your selected range.</>,
		ideStr  : 'statPickerDone',
		padXNum : 4,
		padYNum : 4,
		selStr  : '.stat-mk-scope-picker.stat-mk-done',
		titStr  : 'Picker Items Done'


	},

	{


		bodEle  : <>This shows the percentage of items that you've completed, out of every item that was in your todo list.</>,
		ideStr  : 'statPickerRate',
		padXNum : 4,
		padYNum : 4,
		selStr  : '.stat-mk-scope-picker.stat-mk-rate',
		titStr  : 'Picker Completion Rate'


	},

	// padXNum/padYNum: 4, same .stat-row (10px gap) bleed fix as the other headline-card rows: default 8px pad on each side overlaps a neighbor's own pad across the shared edge, side by side on wide viewports and 2x2 on narrow ones.
	{


		bodEle  : <>This shows the total number of reminders that you've completed for your selected range.</>,
		ideStr  : 'statRemDone',
		padXNum : 4,
		padYNum : 4,
		selStr  : '.stat-mk-remdone',
		titStr  : 'Reminders Completed'


	},

	{


		bodEle  : <>This shows the number of reminders that you've completed in the last 7 days, regardless of your selected range.</>,
		ideStr  : 'statRemWeek',
		padXNum : 4,
		padYNum : 4,
		selStr  : '.stat-mk-remweek',
		titStr  : 'Reminders This Week'


	},

	{


		bodEle  : <>This shows the total number of days for your selected range where you've completed at least one reminder.</>,
		ideStr  : 'statRemActive',
		padXNum : 4,
		padYNum : 4,
		selStr  : '.stat-mk-remactive',
		titStr  : 'Reminders Active Days'


	},

	{


		bodEle  : <>This shows the highest number of reminders that you've completed in a single day for your selected range.</>,
		ideStr  : 'statRemBusiest',
		padXNum : 4,
		padYNum : 4,
		selStr  : '.stat-mk-rembusiest',
		titStr  : 'Reminders Busiest Day'


	},

	// padXNum/padYNum: 4, same .stat-row (10px gap) bleed fix as the other headline-card rows: default 8px pad on each side overlaps a neighbor's own pad across the shared edge, side by side on wide viewports and 2x2 on narrow ones.
	{


		bodEle  : <>This shows the total number of times that any conditional has been triggered for your selected range.</>,
		ideStr  : 'statCondFired',
		padXNum : 4,
		padYNum : 4,
		selStr  : '.stat-mk-condfired',
		titStr  : 'Conditionals Triggered'


	},

	{


		bodEle  : <>This shows the total number of cycles that any conditional was evaluated over for your selected range, regardless of whether it was triggered or not.</>,
		ideStr  : 'statCondCycles',
		padXNum : 4,
		padYNum : 4,
		selStr  : '.stat-mk-condcycles',
		titStr  : 'Conditionals Cycles'


	},

	{


		bodEle  : <>This shows the percentage of evaluated cycles that resulted in a triggered conditional for your selected range.</>,
		ideStr  : 'statCondRate',
		padXNum : 4,
		padYNum : 4,
		selStr  : '.stat-mk-condrate',
		titStr  : 'Conditionals Fire Rate'


	},

	{


		bodEle  : <>This shows the most recent data that any conditional in your selected range was triggered.</>,
		ideStr  : 'statCondLast',
		padXNum : 4,
		padYNum : 4,
		selStr  : '.stat-mk-condlast',
		titStr  : 'Conditionals Last Fired'


	},

	{


		bodEle : <>This visualizes your completed activity over time, with each day shaded by how much you got done. If you click on any day, more details for it will be shown below the heatmap.</>,
		ideStr : 'heatmap',
		selStr : '.stat-heatmap-card',
		titStr : 'Activity Heatmap'


	},

	// #endregion Headline Numbers



	// #region All Scope Only

	{


		bodEle : <>This summarizes your conditionals' activity for your selected range. It includes how many times they've triggered, their overall fire rate, and a per-conditional breakdown. It will only show if you have at least one conditional.</>,
		ideStr : 'statConditionalsSummary',
		selStr : '.cnd-sum-card',
		titStr : 'Conditional Statistics'


	},

	{


		bodEle : <>This summarizes your completed reminders' activity for your selected range, along with a short recent-activity list. It will only show if you have the "Include in Stats" toggle enabled for reminders.</>,
		ideStr : 'statRemindersSummary',
		selStr : '.rem-stats-card',
		titStr : 'Reminders Statistics'


	},

	{


		bodEle : <>This breaks down how your picker items made it onto your todo list. This includes auto-generated, re-rolled or hand-picked from the Pickers tab.</>,
		ideStr : 'statSource',
		selStr : '.stat-mk-source',
		titStr : 'Picker Items Chosen Type'


	},

	{


		bodEle  : <>This lists the 5 picker items that have been picked the most for your selected range.</>,
		ideStr  : 'statMostPicked',
		padXNum : 4,
		padYNum : 4,
		selStr  : '.stat-mk-mostpicked',
		titStr  : 'Picker Items Most Picked'


	},

	{


		bodEle  : <>This lists the 5 picker items that have been picked the least for your selected range. This excludes any picker items that are currently inactive.</>,
		ideStr  : 'statColdest',
		padXNum : 4,
		padYNum : 4,
		selStr  : '.stat-mk-coldest',
		titStr  : 'Picker Items Least Picked'


	},

	// #endregion All Scope Only



	// #region Conditionals Scope Only

	{


		bodEle : <>This breaks down every conditional for your selected range individually. You can switch between fire rate, triggers, cycles, interval and last fired to see each conditional from a different angle.</>,
		ideStr : 'statCondBreakdown',
		selStr : '.stat-mk-condbreakdown',
		titStr : 'Conditionals Breakdown'


	},

	// #endregion Conditionals Scope Only



	// #region Reminders Scope Only

	{


		bodEle : <>This breaks down your completed reminders by type, one-time versus recurring, for your selected range.</>,
		ideStr : 'statRemType',
		selStr : '.stat-mk-remtype',
		titStr : 'Reminders Completed Type'


	},

	{


		bodEle : <>This breaks down every reminder for your selected range individually. You can switch between recent completions, total completions and skips to see each reminder from a different angle.</>,
		ideStr : 'statRemBreakdown',
		selStr : '.stat-mk-rembreakdown',
		titStr : 'Reminders Breakdown'


	},

	// #endregion Reminders Scope Only



	// #region Single-Picker Scope Only

	// Same 3-way split as the Pickers page's own Picker Name/Picker Type/Picker Explanation (see those entries' own comments), not a single combined highlight, Conditionals/Reminders scope has no equivalent block, so there's nothing to split there.
	{


		bodEle  : <>This is the name of the currently selected picker.</>,
		ideStr  : 'pickerName',
		padYNum : 2, // padYNum: 2, same 6px gap to the pill below as the Pickers page (see .stat-picker-id > .pill's own margin-top in styles2.css); the default 8px pad on each side would overlap by 10px otherwise.
		selStr  : '.stat-picker-id .picker-title',
		titStr  : 'Picker Name'


	},

	{


		bodEle  : <>This shows the currently selected picker's type (Truly Random, Weighted, Dynamic Weighted, Ease Up, or Ease Down).</>,
		ideStr  : 'pickerTypePill',
		padYNum : 2, // padYNum: 2, see pickerName's own comment, same 6px gap, same fix.
		selStr  : '.stat-picker-id .pill--mode',
		titStr  : 'Picker Type'


	},

	{


		bodEle : <>This explains the currently selected picker's ruleset, including how it chooses an item and why you might pick this type over another.</>,
		ideStr : 'pickerExplanation',
		selStr : '.stat-picker-id .picker-hint',
		titStr : 'Picker Explanation'


	},

	{


		bodEle : <>This breaks down every picker item for your selected range individually. You can switch between pick count, pick frequency, last picked date and more to see each picker item from a different angle.</>,
		ideStr : 'pickerBreakdown',
		selStr : '.stat-breakdown-card',
		titStr : 'Picker Breakdown'


	},

	// #endregion Single-Picker Scope Only


];



const DAT_HEL_ARR = [ // What: Data Help Array. Why: This is the on-demand help catalog for the Data tab, one entry per distinct piece of functionality on that page rather than one per DOM element. How: This is imported by tab-data.jsx and passed to HelOveCom as its own helIteArr prop.


	// #region Data Header

	{


		bodEle : <>You can click this logo at any time to navigate back to the home page of the app, the Today page.</>,
		ideStr : 'brandMark',
		selStr : '.stat-h-lead .brand-mark',
		titStr : 'Home Link'


	},

	// The Conditionals filter row below carries BOTH .stat-scope-groups AND .stat-scope-groups--cond, and the Type row carries BOTH .stat-scope-groups AND .stat-scope-groups--type (each an additional modifier, not a replacement, see their own conditionalsFilter/typeFilter entries), unscoped, this selector matched both of those rows' pills too, unioning the highlight all the way down through them.
	{


		bodEle : <>This filters the pickers row below by group, which is extremely useful if you have created a lot of pickers.</>,
		ideStr : 'groupFilter',
		selStr : '.stat-scope-groups:not(.stat-scope-groups--cond):not(.stat-scope-groups--type) .picker-group-pill',
		titStr : 'Group Filter'


	},

	{


		bodEle : <>This filters the pickers row below by type. You can select picker mode (Truly Random, Weighted, Dynamic Weighted, Ease Up, Ease Down), Conditionals or Reminders, independent of the Group and Conditional filters with all three narrowing the row together.</>,
		ideStr : 'typeFilter',
		selStr : '.stat-scope-groups--type .picker-group-pill',
		titStr : 'Type Filter'


	},

	{


		bodEle : <>This selects what the rest of the page shows: conditionals, reminders, a specific picker, or everything all at once.</>,
		ideStr : 'pickersFilter',
		selStr : '.stat-scope-tabs .picker-tab',
		titStr : 'Show Selector'


	},

	// Only rendered once at least one conditional exists, a third filter row alongside Group and Type, narrowing the pickers list to whichever conditional gates them.
	{


		bodEle : <>This filters the pickers list below by conditional, showing only pickers gated by the conditional you select.</>,
		ideStr : 'conditionalsFilter',
		selStr : '.stat-scope-groups--cond .picker-group-pill',
		titStr : 'Conditionals Filter'


	},

	{


		bodEle : <>This changes the order that Conditionals, Reminders and your pickers are listed in below.</>,
		ideStr : 'dataSectionSort',
		selStr : '.data-sort-bar .data-sort-sel',
		titStr : 'Section Sort'


	},

	// #endregion Data Header



	// #region Conditionals Manager

	// Each conditional gets its own highlight/tooltip, not just the section as a whole. The per-type controls (Type/Weight/Odds/Boost/Charge Controls/Active) reuse the EXACT same selectors as the Pickers-page create-flow verbatim: CodConCom is the same shared component either way (this tab passes variant="inline" instead of the default 'card', but that only swaps a wrapper class neither selector touches), so there was nothing to re-derive, see PIC_HEL_ARR's own newCond* entries for the original comments on each of these.
	{


		bodEle  : <>This is where you can view and edit all of your conditionals. Tap the header to expand or collapse the section.</>,
		ideStr  : 'conditionalsManager',
		padYNum : 0, // padYNum:0, .cat-h has no border/gap of its own below it, but .cat-body (wrapping the Add button and every row) sits directly against it with only a hairline border, same zero-gap stacking as the rest of this card. The 20px flex gap above .cnd-manager itself (from .tab--data) easily absorbs losing the default pad on that side too.
		selStr  : '.cnd-manager .cat-h',
		titStr  : 'Conditionals'


	},

	{


		bodEle  : <>You can tap this conditional to expand and collapse this section. Expand it in order to view and edit its settings.</>,
		ideStr  : 'conditionalRow',
		labStr  : '.rd-name, .rd-name-input',
		mulBoo  : true,                                      // mulBoo is true because every conditional gets its own badge, not one for the whole list, since a user could be looking at any of them.
		padYNum : 0,                                         // padYNum:0, .rd-item rows stack with zero gap (touching, separated only by a hairline border), so the default 8px pad bled a highlight box into both neighboring rows above and below it.
		selStr  : '.cnd-manager .rd-item > .rd-row',
		titStr  : (r) => `${r?.label || 'This'} Conditional` // titStr is a function because each row's own heading should read as "{its own name} Conditional" rather than one generic title shared by every conditional, falling back to "This Conditional" while labStr hasn't resolved a live name yet.


	},

	{


		bodEle  : <>This creates a new conditional, letting you gate a picker behind a rule of your choosing so it only runs on days that rule allows.</>,
		ideStr  : 'dataCondAdd',
		padYNum : 0, // padYNum:0, .rd-add has the same zero-gap stacking as .rd-item (a hairline border, no margin), touching both the header above it and the first conditional row below it.
		selStr  : '.cnd-manager .rd-add',
		titStr  : 'Create New Conditional'


	},

	// hideName is set on CodConCom here, so the name field lives on the ROW itself (same .rd-name-input shape as a picker item's own row), not inside the shared controls component.
	{


		bodEle  : <>This is the name field for this conditional, you can rename it here.</>,
		ideStr  : 'dataCondName',
		padYNum : 0, // padYNum:0, the row and whatever's directly below it (the first CodConCom field) stack with zero gap, same as everywhere else on this page.
		selStr  : '.cnd-manager .rd-item.is-editing .rd-name-input',
		titStr  : 'Conditional Name'


	},

	// Reused verbatim from PIC_HEL_ARR's newCondCardText, same CodConCom markup either way, missed when the other newCond* entries were copied over for this pass. // padYNum:0, .cnd-controls--inline (the variant used here, unlike the Pickers-page card variant) has gap:0 between fields, so this bleeds into its neighbors above/below without it.
	{


		bodEle  : <>This is the text that will show on the card that appears in your todo list whenever this conditional suppresses any attached pickers.</>,
		ideStr  : 'dataCondCardText',
		padYNum : 0,
		selStr  : '.np-field--cardtext',
		titStr  : 'Conditional Card Text'


	},

	{


		bodEle  : <>This is where you choose the rule this conditional follows each time it runs. Each option below explains its own ruleset, so have a read through them to see which one fits best.</>,
		ideStr  : 'dataCondType',
		padYNum : 0,
		selStr  : '.cnd-controls .np-field:has(.rd-mode-radio)',
		titStr  : 'Conditional Type'


	},

	{


		bodEle  : <>Truly Random conditionals have no adjustable settings. Every time this conditional runs, it has an equal 50/50 chance to trigger.</>,
		ideStr  : 'dataCondRandom',
		padYNum : 0,
		selStr  : '.cnd-typectl:has(.pie-noweight)',
		titStr  : 'Conditional Weight'


	},

	{


		bodEle  : <>This adjusts the conditional's chance to trigger each time it runs. A higher percentage makes it more likely to trigger and a lower percentage makes it less likely.</>,
		ideStr  : 'dataCondOdds',
		padYNum : 0,
		selStr  : '.cnd-typectl .pie-row:has(.weight-stepper)',
		titStr  : 'Conditional Trigger Odds'


	},

	{


		bodEle  : <>This is the conditional's current boost, which climbs by a percentage each time it doesn't trigger and resets to 0 the next time it does. A higher boost makes it more likely to trigger.</>,
		ideStr  : 'dataCondBoost',
		padYNum : 0,
		selStr  : '.cnd-typectl .pie-row:has(.pie-boost-val)',
		titStr  : 'Conditional Boost'


	},

	{


		bodEle : (


			<>
				<p><b>Soonest:</b> This controls the minimum number of days that must pass before the conditional becomes eligible to trigger.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Latest:</b> This controls the maximum number of days that must pass before the conditional is guaranteed to trigger.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Fill:</b> This will fill the conditional's charge to 100, making it eligible to trigger.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
			</>


		),

		ideStr  : 'dataCondEaseUp',
		padYNum : 0,
		selStr  : '.cnd-typectl .cnd-ease-up-row',
		titStr  : 'Conditional Charge Controls'


	},

	{


		bodEle : (


			<>
				<p><b>Shortest:</b> This controls the minimum number of days that the conditional must stay triggered before it can stop.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Longest:</b> This controls the maximum number of days that the conditional can stay triggered before it must stop.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Refill:</b> This will refill the conditional's charge back to 100, effectively resetting how long it stays triggered.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
			</>


		),

		ideStr  : 'dataCondEaseDown',
		padYNum : 0,
		selStr  : '.cnd-typectl .cnd-ease-down-row',
		titStr  : 'Conditional Charge Controls'


	},

	{


		bodEle  : <>This toggles whether this conditional is currently active. Turning it off effectively disables the conditional, so its attached picker will always run regardless of the conditional's own trigger state.</>,
		ideStr  : 'dataCondActive',
		padYNum : 3,
		selStr  : '.cnd-controls .pie-row:has(.switch)',
		titStr  : 'Conditional Active Toggle'


	},

	// .rd-edit--cnd scopes this to ConditionalEditor's own footer, its .rd-ctl-group--foot wrapper class is shared with PickerControls' footer below, which lives in a differently-rooted tree (.rd-edit--cnd is unique to this one). Delete is only rendered when !isNew (see tab-data.jsx's ConditionalEditor), so :has(.btn--danger) splits this from dataCondFootNew below rather than always mentioning Delete.
	{


		bodEle : (


			<>
				<p><b>Delete:</b> This button permanently deletes this conditional, after asking you to confirm. Any pickers using it will be detached.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Cancel:</b> This button discards any changes and closes this editor without saving.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Save:</b> This button saves your changes to this conditional.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
			</>


		),

		ideStr : 'dataCondFoot',
		selStr : '.rd-edit--cnd .rd-ctl-group--foot:has(.btn--danger) .btn',
		titStr : 'Delete / Cancel / Save'


	},

	// New (unsaved) conditionals never render a Delete button, see ConditionalEditor's `!isNew &&` guard, so this covers that footer state with its own Cancel/Save-only copy.
	{


		bodEle : (


			<>
				<p><b>Cancel:</b> This button discards the new conditional without saving it.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Save:</b> This button saves the new conditional.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
			</>


		),

		ideStr : 'dataCondFootNew',
		selStr : '.rd-edit--cnd .rd-ctl-group--foot:not(:has(.btn--danger)) .btn',
		titStr : 'Cancel / Save'


	},

	// #endregion Conditionals Manager



	// #region Reminders Manager

	// The participation-settings matrix is new content (not present anywhere else); the per-reminder row + its editor reuse Today's own editReminderRepeat/editReminderFoot verbatim, since this is the exact same .rem-inline-editor markup either way.
	{


		bodEle  : <>This is where you can view and edit all of your reminders. Tap the header to expand or collapse the section.</>,
		ideStr  : 'remindersManager',
		padYNum : 0, // padYNum:0, same .cat-h/.cat-body zero-gap stacking as conditionalsManager.
		selStr  : '.cat--reminders .cat-h',
		titStr  : 'Reminders'


	},

	// The Controls/Items disclosures share the .rd-ctl class (see the matching pair on each picker below), so :nth-of-type splits them, Controls always renders first in .cat-body, Items second. // padYNum:0, .rd-ctl touches its neighbor with only a hairline border, same zero-gap stacking as everywhere else on this page.
	{


		bodEle  : <>Tap this to expand or collapse the reminders settings below. Collapsed, it shows how many settings there are.</>,
		ideStr  : 'remindersControlsHeader',
		padYNum : 0,
		selStr  : '.cat--reminders .cat-body > button.rd-ctl:nth-of-type(1)',
		titStr  : 'Reminder Controls'


	},

	{


		bodEle  : <>This controls whether one-time and recurring reminders are included in the day streak, completion ring or the Stats page. There are also controls to exclude those same types from weekends or holidays. Each type of reminder can be toggled independently.</>,
		ideStr  : 'remControlsMatrix',
		padYNum : 0, // padYNum:0, .rd-matrix sits flush against the Controls header above and the Items header below (no .rd-ctl-body padding wrapper here, unlike PickerControls), so the default pad bled 8px into both.
		selStr  : '.rd-matrix',
		titStr  : 'Reminders Settings'


	},

	// No Delete, unlike dataPickerFoot's own Delete/Cancel/Save, these are global settings, not a single deletable picker.
	{


		bodEle : (


			<>
				<p><b>Cancel:</b> This button discards any changes and closes this section without saving.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Save:</b> This button saves your changes to the Reminders controls.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
			</>


		),

		ideStr : 'remControlsFoot',
		selStr : '.rd-matrix .rd-mx-foot .btn',
		titStr : 'Cancel / Save'


	},

	{


		bodEle  : <>Tap this to expand or collapse the list of your reminders below. Collapsed, it shows how many reminders you have.</>,
		ideStr  : 'remindersItemsHeader',
		padYNum : 0,
		selStr  : '.cat--reminders .cat-body > button.rd-ctl:nth-of-type(2)',
		titStr  : 'Reminders Items'


	},

	{


		bodEle  : <>This creates a new one-time or recurring reminder. Reminders are separate from pickers since some tasks cannot be randomly chosen and must be done on a schedule (recurring reminder) or are a one-time thing (one-time reminder).</>,
		ideStr  : 'remAddButton',
		padYNum : 0, // padYNum:0, .rd-add has the same zero-gap stacking as .rd-item (a hairline border, no margin), touching both the header above it and the first reminder row below it.
		selStr  : '.cat--reminders .rd-add',
		titStr  : 'Create New Reminder'


	},

	// mulBoo is true because every reminder gets its own badge, not one for the whole list. Split by type (rather than by name, like conditionalRow/pickerRow) via the row's own .rd-ico.is-once marker, set per user request instead of the name-based labStr pattern. // padYNum:0, .rd-item rows stack with zero gap (touching, separated only by a hairline border), same as conditionalRow/pickerRow.
	{


		bodEle  : <>This is one of your reminders. Tap it to view and edit its settings.</>,
		ideStr  : 'reminderRowOnce',
		mulBoo  : true,
		padYNum : 0,
		selStr  : '.cat--reminders .rd-item > .rd-row:has(.rd-ico.is-once)',
		titStr  : 'One-Time Reminder Item'


	},

	{


		bodEle  : <>This is one of your reminders. Tap it to view and edit its settings.</>,
		ideStr  : 'reminderRowRecurring',
		mulBoo  : true,
		padYNum : 0,
		selStr  : '.cat--reminders .rd-item > .rd-row:not(:has(.rd-ico.is-once))',
		titStr  : 'Recurring Reminder Item'


	},

	{


		bodEle : <>This is the name field for your reminder, give it a short, descriptive name. This is what will show up on your todo list.</>,
		ideStr : 'dataReminderName',
		selStr : '.cat--reminders .rd-name-input',
		titStr : 'Reminder Name'


	},

	// Reused verbatim from TOD_HEL_ARR's editReminderRepeat/editReminderFoot same .rem-inline-editor markup, and this tab has no quickadd form for that selector's own :not(.rem-quickadd-wrap *) exclusion to worry about.
	{


		bodEle : (


			<>
				<p><b>Once:</b> This reminder stays on your todo list every day until you complete it, then it's gone for good.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Every N Days:</b> This reminder will show up on your todo list every N days, counted from the start date that you select below.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Weekly:</b> This reminder will show up on your todo list every N week(s) on the days that you select below.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Monthly:</b> This reminder will show up on your todo list every N month(s) on the day or weekday that you select below.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Yearly:</b> This reminder will show up on your todo list every N year(s) on the date or weekday that you select below.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
			</>


		),

		ideStr  : 'dataReminderRepeat',
		padYNum : 0,    // padYNum:0, unlike Today's card-based editor, this tab's .rd-edit wrapper overrides .rem-inline-foot's margin-top to 0 (see .rd-edit .rd-edit-foot in styles2.css), so .rem-editor touches the footer row with zero gap.
		scrBoo  : true, // scrBoo is true here too, same reasoning as Today's addReminderRepeat.
		selStr  : '.rem-inline-editor:not(.entry-editor):not(.rem-quickadd-wrap *) .rem-editor',
		titStr  : 'Reminder Schedule'


	},

	// selStr targets .rem-inline-foot (the shared wrapper), not .rd-edit-foot specifically, see editReminderFoot's own comment (TOD_HEL_ARR) for why: Delete's own confirm prompt swaps in a different sibling class (.rem-foot-confirm), which .rd-edit-foot alone would miss, leaving its Cancel/Delete buttons genuinely unreachable (no dim-mask hole, blocked by the click-guard) while help mode is on. // Delete is only rendered when !isNew (see reminders.jsx's ReminderEditFoot), :has(.btn--danger) splits this from dataReminderFootNew below rather than always mentioning Delete, same fix as dataCondFoot/dataCondFootNew.
	{


		bodEle : (


			<>
				<p><b>Delete:</b> This button permanently deletes this reminder, after asking you to confirm.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Cancel:</b> This button discards any changes and closes this editor without saving.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Save:</b> This button saves your changes to this reminder.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
			</>


		),

		ideStr : 'dataReminderFoot',
		selStr : '.rem-inline-editor:not(.entry-editor) .rem-inline-foot:has(.btn--danger) .btn',
		titStr : 'Delete / Cancel / Save'


	},

	// New (unsaved) reminders never render a Delete button, see ReminderEditFoot's `!isNew &&` guard, so this covers that footer state with its own Cancel/Save-only copy.
	{


		bodEle : (


			<>
				<p><b>Cancel:</b> This button discards the new reminder without saving it.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Save:</b> This button saves the new reminder.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
			</>


		),

		ideStr : 'dataReminderFootNew',
		selStr : '.rem-inline-editor:not(.entry-editor) .rem-inline-foot:not(:has(.btn--danger)) .btn',
		titStr : 'Cancel / Save'


	},

	// #endregion Reminders Manager



	// #region Pickers Manager

	// Each picker gets its own highlight, plus each of its own settings controls individually (PickerControls) and each of its items individually (reusing the shared item-editor entries below). Scoped via the direct .data-list > .cat > .cat-h chain since .cat-h is also reused by the Conditionals/Reminders managers' own outer headers (which render outside .data-list entirely).
	{


		bodEle  : <>This is one of your pickers. Tap it to view and edit its settings and items.</>,
		ideStr  : 'pickerRow',
		labStr  : '.cat-mode-label',                               // labStr reads the visible .cat-mode-label pill (tab-data.jsx) in the header's cat-h-tags cluster.
		mulBoo  : true,                                            // mulBoo is true because every picker gets its own badge.
		padYNum : 0,                                               // padYNum:0, same .cat-h/.cat-body zero-gap stacking as conditionalsManager; matters once a picker is expanded and .cat-body renders beneath it.
		selStr  : '.data-list > .cat > .cat-h',
		titStr  : (r) => r?.label ? `${r.label} Picker` : 'Picker' // titStr is dynamic by TYPE, not name (unlike conditionalRow/pickerRow's own precedent).


	},

	// mulBoo is true because each expanded picker gets its own Controls/Items pair (more than one can be open at once). Same .rd-ctl class and :nth-of-type split as the Reminders manager's own pair above. .cat-body is a descendant, not a direct child, of .cat, it's wrapped in its own <ColDisCom> div (unlike .cat-h, which isn't). // padYNum:0, .rd-ctl touches its neighbor with only a hairline border.
	{


		bodEle  : <>Tap this to expand or collapse this picker's settings. This includes its name, its group, how it picks, its conditional gate and when it runs. Collapsed, it shows how many setting options exist.</>,
		ideStr  : 'dataPickerControlsHeader',
		mulBoo  : true,
		padYNum : 0,
		selStr  : '.data-list > .cat .cat-body > button.rd-ctl:nth-of-type(1)',
		titStr  : 'Picker Controls'


	},

	{


		bodEle  : <>Tap this to expand or collapse this picker's list of items below. Collapsed, it shows how many items are in the picker.</>,
		ideStr  : 'dataPickerItemsHeader',
		mulBoo  : true,
		padYNum : 0,
		selStr  : '.data-list > .cat .cat-body > button.rd-ctl:nth-of-type(2)',
		titStr  : 'Picker Items'


	},

	// padYNum:0, .rd-basics-row has no margin, just its own padding + a border-top, so consecutive rows (this one and Group below) touch with zero gap.
	{


		bodEle  : <>This is the name field for this picker, you can rename it here.</>,
		ideStr  : 'dataPickerName',
		padYNum : 0,
		selStr  : '.rd-basics-row:has(.rd-basics-name)',
		titStr  : 'Picker Name'


	},

	{


		bodEle  : <>This lets you choose which group this picker belongs to. Groups cluster related pickers together on your todo list, like "Food" or "Chores". You can select an existing group or create a new one.</>,
		ideStr  : 'dataPickerGroup',
		padYNum : 0,
		selStr  : '.rd-basics-row--group',
		titStr  : 'Picker Group'


	},

	// Scoped to PickerControls' own "How it picks" group, ConditionalEditor has its own separate .rd-mode-radio inside .cnd-controls, which doesn't live under .rd-ctl-group--picks.
	{


		bodEle  : <>This is where you choose the rule this picker follows each time it runs. Each option below explains its own ruleset, so have a read through them to see which one fits best.</>,
		ideStr  : 'dataPickerType',
		padYNum : 0, // padYNum:0, .rd-ctl-group--picks (this group's own wrapper) touches "When it runs" below with zero gap.
		selStr  : '.rd-ctl-group--picks .rd-mode-radio',
		titStr  : 'Picker Type'


	},

	// padYNum:0, .sched-line rows stack with zero gap (same pattern as .rd-basics-row above), touching Daily Generator Toggle below.
	{


		bodEle  : <>This lets you optionally gate this picker behind a conditional. When you attach a conditional, the picker will only run on days determined by that conditional's own rules. For example, giving yourself an occasional day off from chores. You can attach any existing conditional below, but if you want to create a new one you will need to use the Conditionals section above.</>,
		ideStr  : 'dataPickerConditionalToggle',
		padYNum : 0,
		selStr  : '.sched-line:has(button[aria-label="Attach a conditional"])',
		titStr  : 'Picker Conditional'


	},

	{


		bodEle  : <>This lets you select an existing conditional to attach to this picker. If you don't have one yet, create one in the Conditionals section above.</>,
		ideStr  : 'dataPickerConditionalRail',
		padYNum : 0,
		selStr  : '.rd-cnd-rail-row .cnd-rail',
		titStr  : 'Select a Conditional'


	},

	{


		bodEle  : <>This determines whether the picker will be included in the app's daily auto-generator. When on, this picker's items will be automatically added to your todo list. When off, the picker won't run automatically, but you can still generate a pick manually from the Pickers tab.</>,
		ideStr  : 'dataPickerDailyToggle',
		padYNum : 0, // padYNum:0, same .sched-line zero-gap stacking, touching Picker Cadence below.
		selStr  : '.sched-line:has(button[aria-label*="daily generator"])',
		titStr  : 'Daily Generator Toggle'


	},

	{


		bodEle : (


			<>
				<p><b>Daily:</b> This is the picker's default cadence. It surfaces every day that it's scheduled to run, exactly like an ordinary picker.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Weekly:</b> This surfaces the picker once a week, on whichever weekday you choose below. Once picked, that item stays on your todo list until you mark it as completed, even if that takes more than one day.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Monthly:</b> This surfaces the picker once a month, on whichever day you choose below. Once picked, that item stays on your todo list until you mark it as completed, even if that takes more than one day.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Yearly:</b> This surfaces the picker once a year, on whichever date you choose below. Once picked, that item stays on your todo list until you mark it as completed, even if that takes more than one day.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
			</>


		),

		ideStr  : 'dataPickerCadence',
		padYNum : 0, // padYNum:0, same .sched-line zero-gap stacking, touching Picker Day Selection below.
		selStr  : '.sched-line:has(select[aria-label="Cadence"])',
		titStr  : 'Picker Cadence'


	},

	{


		bodEle  : <>This lets you choose which days of the week this picker is allowed to run on. Tap a day to toggle it on or off.</>,
		ideStr  : 'dataPickerDays',
		padYNum : 0, // padYNum:0, same .sched-line zero-gap stacking, touching Picker Holidays Toggle below.
		selStr  : '.sched-line:has(.dow-chips)',
		titStr  : 'Picker Day Selection'


	},

	// This is the LAST "When it runs" row now, Avoid Duplicate Items moved out to its own "Item Controls" section below (see that entry's own comment), so nothing follows this one here.
	{


		bodEle  : <>This determines whether this picker skips major U.S. holidays. When on, this picker won't run on those days. You can edit which days count as holidays, or add your own, in Settings.</>,
		ideStr  : 'dataPickerSkipHolidays',
		padYNum : 0, // padYNum:0, same .sched-line zero-gap stacking, touching Picker Day Selection above.
		selStr  : '.sched-line:has(button[aria-label="Skip on holidays"])',
		titStr  : 'Picker Holidays Toggle'


	},

	// Moved out of "When it runs" into its own "Item Controls" section (alongside Fill/Refill below), avoiding duplicate item names has nothing to do with the Daily generator/schedule that section is about.
	{


		bodEle  : <>This determines whether the picker is allowed to choose an item when another item with the same name already exists elsewhere in the generated daily todo list. If all items are ineligible due to duplication, then this setting is ignored and an item is chosen normally.</>,
		ideStr  : 'dataPickerAvoidDuplicates',
		padYNum : 0, // padYNum:0, .rd-ctl-group--items (this group's own wrapper) touches "Item Controls" kicker above with zero gap.
		selStr  : '.sched-line:has(button[aria-label="Avoid duplicate items"])',
		titStr  : 'Picker Duplicate Items Toggle'


	},

	// Fill/Refill acts on every item in this picker at once (actions.refillPicker), not just one. Moved out of "How it picks" into "Item Controls" alongside Avoid Duplicate Items above (see that entry's own comment), filling every item's charge is an items operation, not part of the picker's own ruleset. // padYNum:0, touches Picker Duplicate Items Toggle above with zero gap. // Split by mode (ease-config--up/--down, tab-data.jsx) rather than one combined Fill/Refill entry, same idea as itemChargeRangeUp/Down below (the per-item equivalent, which also covers each item's own Soonest/Latest controls, this picker level no longer has any of its own to prefill new items with; see PICKERS.avgEase in pickers.js).
	{


		bodEle  : <>This fills the charge of every item in this picker at once.</>,
		ideStr  : 'dataPickerFillUp',
		padYNum : 0,
		selStr  : '.ease-config.ease-config--up',
		titStr  : 'Fill All'


	},

	{


		bodEle  : <>This refills the charge of every item in this picker at once.</>,
		ideStr  : 'dataPickerFillDown',
		padYNum : 0,
		selStr  : '.ease-config.ease-config--down',
		titStr  : 'Refill All'


	},

	{


		bodEle : (


			<>
				<p><b>Delete:</b> This button permanently deletes this picker, after asking you to confirm. This will also delete all of its items.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Cancel:</b> This button discards any changes and closes this editor without saving.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Save:</b> This button saves your changes to this picker.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
			</>


		),

		ideStr : 'dataPickerFoot',
		selStr : '.pk-ctl-foot .btn',
		titStr : 'Delete / Cancel / Save'


	},

	{


		bodEle : <>This creates a new picker directly from this list, respecting the group, type and conditional filters if they are used. Fill in its name and group, then use the Add Items button to add at least two items. Once it has them, the Save button adds it to the list with all other pickers.</>,
		ideStr : 'dataCreatePicker',
		selStr : '.cat-create-btn',
		titStr : 'Create New Picker'


	},

	// #endregion Pickers Manager



	// #region Item Rows / Sorting

	// Scoped to .data-list so this doesn't also match the Conditionals/Reminders managers' own "Add" buttons, which share the plain .rd-add class but render outside .data-list entirely.
	{


		bodEle  : <>This adds a new item to this picker's pool.</>,
		ideStr  : 'dataAddItem',
		padYNum : 0, // padYNum:0, .rd-add has the same zero-gap stacking as .rd-item, touching the first item row below it.
		selStr  : '.data-list .rd-add',
		titStr  : 'Create New Picker Item'


	},

	// Split by section type (three separate entries, each named for its own context) rather than one shared "Item Sort", Conditionals/Reminders/pickers all render the exact same SorSelCom markup (ui.jsx) inside their own .cat-body, so the selectors below key off each section's own distinguishing class/attribute instead: .cnd-manager (Conditionals), .cat--reminders (Reminders), and a picker section's own data-picker-id (set only there, unlike a plain className check, which would need :not() exclusions against the other two instead). // mulBoo is true because every expanded section's own sort control gets its own badge, since more than one can be visible (and set to a different order) at once, matters most for pickers, where several can be expanded together.
	{


		bodEle : <>This changes the order that the items in this section are listed in below.</>,
		ideStr : 'dataCondItemSort',
		mulBoo : true,
		selStr : '.cnd-manager .data-sort-sel',
		titStr : 'Conditional Items Sort'


	},

	{


		bodEle : <>This changes the order that the items in this section are listed in below.</>,
		ideStr : 'dataRemItemSort',
		mulBoo : true,
		selStr : '.cat--reminders .data-sort-sel',
		titStr : 'Reminder Items Sort'


	},

	{


		bodEle : <>This changes the order that the items in this section are listed in below.</>,
		ideStr : 'dataPickerItemSort',
		mulBoo : true,
		selStr : '.data-list .cat[data-picker-id] .data-sort-sel',
		titStr : 'Picker Items Sort'


	},

	{


		bodEle  : <>This is one of this picker's items. Tap it to view and edit its settings.</>,
		ideStr  : 'dataItemRow',
		mulBoo  : true, // mulBoo is true because every item in every expanded picker gets its own badge.
		padYNum : 0,    // padYNum:0, .rd-item rows stack with zero gap (touching, separated only by a hairline border), same as conditionalRow/reminderRow.
		selStr  : '.data-list .rd-item > .rd-row',
		titStr  : 'Picker Item'


	},

	// #endregion Item Rows / Sorting



	// #region Editing A Picker Item

	// EntryEditor, defined in tab-today.jsx but reused here, see .entry-editor's own doc comment there. Which of these actually renders depends on the OWNING PICKER's mode, so most items below only ever show up for some modes: Charge Range (Ease Up/Ease Down only), Weight (Weighted/Dynamic Weighted), Boost (Dynamic Weighted only). Active and the footer always render regardless of mode. // .rd-name-input is also used by the Conditionals section's own name field (same .rd-item wrapper shape), :has(.entry-editor) picks out only a .rd-item that's actually an ITEM editor, since .entry-editor is unique to EntryEditor and never rendered for a conditional.
	{


		bodEle : <>This is the name field for this item, you can rename it here.</>,
		ideStr : 'itemName',
		selStr : '.rd-item:has(.entry-editor) .rd-name-input',
		titStr : 'Item Name'


	},

	{


		bodEle : () => { // bodEle is a function (see help-mode.jsx's HelpTip) that reads the picker's own cadence unit word (days/weeks/months/years) straight off the already-rendered .np-ease-unit label instead of hardcoding "days", which would be wrong for a non-daily cadence picker.


			const unit = document.querySelector('.entry-editor .pie-ease-up-row .np-ease-unit')?.textContent || 'days'; // What: Unit String. Why: This item's own copy needs the real, currently-displayed unit label (e.g. "days"), not a hardcoded guess. How: This reads the matched row's own unit control text, falling back to 'days' if not found.



			return (


				<>
					<p><b>Soonest:</b> This controls the minimum number of {unit} that the item must wait before becoming eligible to be picked again.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

					<p><b>Latest:</b> This controls the maximum number of {unit} that the item must wait before becoming eligible to be picked again.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

					<p><b>Fill:</b> This will fill the item's charge to 100, making it eligible to be picked again.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
				</>


			);


		},

		ideStr  : 'itemChargeRangeUp',
		padYNum : 0,
		selStr  : '.entry-editor .pie-ease-up-row',
		titStr  : 'Item Charge Controls'


	},

	{


		bodEle : () => { // bodEle is a function (see help-mode.jsx's HelpTip) that reads the picker's own cadence unit word (days/weeks/months/years) straight off the already-rendered .np-ease-unit label instead of hardcoding "days", which would be wrong for a non-daily cadence picker.


			const unit = document.querySelector('.entry-editor .pie-ease-down-row .np-ease-unit')?.textContent || 'days'; // What: Unit String. Why: This item's own copy needs the real, currently-displayed unit label (e.g. "days"), not a hardcoded guess. How: This reads the matched row's own unit control text, falling back to 'days' if not found.



			return (


				<>
					<p><b>Shortest:</b> This controls the minimum number of {unit} that the item must stay as the active pick, after which a new item will be picked.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

					<p><b>Longest:</b> This controls the maximum number of {unit} that the item must stay as the active pick, after which a new item will be picked.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

					<p><b>Refill:</b> This will refill the item's charge back to 100, effectively resetting its active pick cadence.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
				</>


			);


		},

		ideStr  : 'itemChargeRangeDown',
		padYNum : 0,
		selStr  : '.entry-editor .pie-ease-down-row',
		titStr  : 'Item Charge Controls'


	},

	{


		bodEle  : <>This adjusts this item's pick chance relative to the picker's other items. A higher weight makes it more likely to be picked and a lower weight makes it less likely.</>,
		ideStr  : 'itemWeight',
		padYNum : 0,
		selStr  : '.entry-editor .pie-row:has(.weight-stepper)',
		titStr  : 'Item Weight'


	},

	{


		bodEle  : <>This is the item's current boost, which climbs by 1 each time it isn't picked and resets to 0 the next time it is. A higher boost makes it more likely to be picked.</>,
		ideStr  : 'itemBoost',
		padYNum : 0,
		selStr  : '.entry-editor .pie-row:has(.pie-boost-val)',
		titStr  : 'Item Boost'


	},

	{


		bodEle  : <>This toggles whether this item is eligible to be picked. Turning it off marks the item inactive, removing it from the picker's pool until it's turned back on.</>,
		ideStr  : 'itemActive',
		padYNum : 0,
		selStr  : '.entry-editor .pie-row:has(.switch)',
		titStr  : 'Item Active Toggle'


	},

	// selStr targets .rem-inline-foot (the shared wrapper), not .rd-edit-foot specifically, Delete swaps that sibling out for .rem-foot-confirm (its own Cancel/Delete pair), which a selector scoped to .rd-edit-foot would miss entirely once that swap happens: no dim-mask hole, AND the click-guard would treat its buttons as off-target and block them, making the confirmation genuinely unreachable while help mode is on. // Delete is only rendered when !isNew (see EntryEditor in tab-today.jsx), :has(.btn--danger) splits this from itemFootNew below rather than always mentioning Delete, same fix as dataCondFoot/dataReminderFoot.
	{


		bodEle : (


			<>
				<p><b>Delete:</b> This button permanently deletes this item, after asking you to confirm.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Cancel:</b> This button discards any changes and closes this editor without saving.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Save:</b> This button saves your changes to this item.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
			</>


		),

		ideStr : 'itemFoot',
		selStr : '.entry-editor .rem-inline-foot:has(.btn--danger) .btn',
		titStr : 'Delete / Cancel / Save'


	},

	// New (unsaved) items never render a Delete button, see EntryEditor's `!isNew &&` guard, so this covers that footer state with its own Cancel/Save-only copy.
	{


		bodEle : (


			<>
				<p><b>Cancel:</b> This button discards the new item without saving it.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Save:</b> This button saves the new item.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
			</>


		),

		ideStr : 'itemFootNew',
		selStr : '.entry-editor .rem-inline-foot:not(:has(.btn--danger)) .btn',
		titStr : 'Cancel / Save'


	},

	// #endregion Editing A Picker Item


];



const SET_HEL_ARR = [ // What: Settings Help Array. Why: This is the on-demand help catalog for the Settings tab, one entry per distinct piece of functionality on that page rather than one per DOM element. How: This is imported by tab-settings.jsx and passed to HelOveCom as its own helIteArr prop.


	// #region Settings Header

	{


		bodEle : <>You can click this logo at any time to navigate back to the home page of the app, the Today page.</>,
		ideStr : 'brandMark',
		selStr : '.stat-h-lead .brand-mark',
		titStr : 'Home Link'


	},

	// -- Section rail, on mobile this collapses into a horizontal sticky pill bar pinned above the sections (see .settings-rail's own @container rule in styles2.css); on desktop it's a vertical sidebar. One combined highlight over the whole rail rather than per-button, matching the nav bar's own precedent.
	{


		bodEle  : <>This will let you jump straight to any section of the Settings page. On mobile devices, this will stay pinned to the top of the page no matter how far down you have scrolled.</>,
		ideStr  : 'settingsRail',
		padYNum : 0, // padYNum:0, on narrow viewports this is sticky (position:sticky; top:0) with its own opaque background; the default pad extended the mask cutout past the rail's own real bottom edge, revealing whatever page content had scrolled underneath it in that gap (nothing there covers it, the dim overlay sits above the rail's own z-index:18, and the cutout hole doesn't care that the rail's own box doesn't reach that far).
		selStr  : '.settings-rail',
		titStr  : 'Sections Navigation'


	},

	// #endregion Settings Header



	// #region Appearance

	{


		bodEle : <>When on, the app follows your system's own light/dark setting and automatically switches between your chosen light and dark themes (e.g. Ink &rarr; Night) whenever your system does. When off, only your manually selected theme below applies.</>,
		ideStr : 'appearanceSystemPref',
		selStr : '.set-section--appearance .set-data-row:has(button[aria-label="System preference"])',
		titStr : 'System Theme Preference'


	},

	{


		bodEle : <>This is where you choose the theme that's used when the app is in light mode. Pick any of the presets, or use the Custom row to mix your own colors. Custom themes will automatically generate a matching dark theme, which you're then free to edit separately.</>,
		ideStr : 'appearanceThemeLight',
		selStr : '.set-subsection--theme-light',
		titStr : 'Light Theme'


	},

	// padYNum:4 (not the default 8), consecutive .set-subsection blocks have a real but modest 12px gap (.set-section's own flex gap), and 8+8 exceeds that by 4px; 4+4 stays safely inside it.
	{


		bodEle  : <>This is where you choose the theme that's used when the app is in dark mode. Pick any of the presets, or use the Custom row to mix your own colors. Custom themes will automatically generate a matching light theme, which you're then free to edit separately.</>,
		ideStr  : 'appearanceThemeDark',
		padYNum : 4,
		selStr  : '.set-subsection--theme-dark',
		titStr  : 'Dark Theme'


	},

	{


		bodEle  : <>This is where you choose which animation plays in the Today page when every item in your todo list is marked as done. Use Preview to watch any of them play out before picking one.</>,
		ideStr  : 'appearanceCelebration',
		padYNum : 4,
		selStr  : '.set-subsection--celebration',
		titStr  : 'Completion Celebration'


	},

	{


		bodEle  : <>This is where you choose which animation plays in the Pickers tab when the manual picker functionality is triggered via the "Pick One" button. Use Preview to watch any of them play out before picking one.</>,
		ideStr  : 'appearancePickAnim',
		padYNum : 4,
		selStr  : '.set-subsection--pickanim',
		titStr  : 'Picker Animation'


	},

	{


		bodEle  : <>This controls where the app's main navigation is positioned on screen: a floating bar at the bottom, a sidebar on the left, or a bar along the top.</>,
		ideStr  : 'appearanceLayout',
		padYNum : 4,
		selStr  : '.set-subsection--layout',
		titStr  : 'Tab Bar Placement'


	},

	// #endregion Appearance



	// #region Daily Generator

	// padYNum:0 on all three below, .set-data-row rows have no margin between them, just their own padding + a border-bottom (Card is a plain div, not a flex/grid gap container), so they touch with zero gap.
	{


		bodEle  : <>This toggles whether the Daily generator runs on its own each day. When off, you'll need to run it manually using the Regenerate button at the bottom of the Today page.</>,
		ideStr  : 'dailyAutoToggle',
		padYNum : 0,
		selStr  : '.set-section--daily .set-data-row:has(button[aria-label="Run the Daily generator automatically"])',
		titStr  : 'Run Generator Automatically'


	},

	{


		bodEle  : <>This sets what time of day the Daily generator runs automatically. A quiet, early hour works best so your list is ready first thing in the morning.</>,
		ideStr  : 'dailyRunTime',
		padYNum : 0,
		selStr  : '.set-section--daily .set-data-row--sub',
		titStr  : 'Run Generator Time'


	},

	{


		bodEle  : <>This lets you get a notification once your todo list has been generated for the day. This is the only notification the app will ever send and only once a day. It only works while the app is open in a tab or window, but always push notifications are coming in a future release.</>,
		ideStr  : 'dailyNotify',
		padYNum : 0,
		selStr  : '.set-notify-row',
		titStr  : 'Run Generator Notification'


	},

	// #endregion Daily Generator



	// #region Holidays

	// padYNum:4, .holiday-add has a real but modest 14px margin-top from .holiday-list above it, and default 8+8 pad exceeds that by 2px.
	{


		bodEle  : <>This lists every computed holiday for the current year. Toggle any of them off if you don't observe it, any picker set to "Skip on holidays" will respect these settings.</>,
		ideStr  : 'holidayList',
		padYNum : 4,
		selStr  : '.holiday-list',
		titStr  : 'Edit Observed Holidays'


	},

	{


		bodEle  : <>This lets you add your own custom holiday, like a birthday or anniversary, which pickers will respect if their "Skip on holidays" toggle is turned on.</>,
		ideStr  : 'holidayAdd',
		padYNum : 4,
		selStr  : '.holiday-add',
		titStr  : 'Add Custom Holiday'


	},

	// #endregion Holidays



	// #region Data Control

	// padYNum:0 on the whole group below, same zero-gap .set-data-row stacking as Daily generator above.
	{


		bodEle  : <>This shows how your data is currently being stored, whether the browser has promised not to clear it, and roughly how much data you are storing in the app. Installing the app or granting persistent storage both help protect it from being cleared automatically.</>,
		ideStr  : 'dataStorageStatus',
		padYNum : 0,
		selStr  : '.set-store-row',
		titStr  : 'Protect Your Data'


	},

	// Exactly one of these four mutually-exclusive rows ever renders at a time (already installed / can't install here / iOS Add to Home Screen / Mac Add to Dock, see tab-settings.jsx), all sharing this one class, so this covers whichever is actually showing.
	{


		bodEle  : <>This shows device and browser specific information about how to install the app. Installing the app has many benefits, but you can always keep using the app as a website if you prefer.</>,
		ideStr  : 'dataInstallInstructions',
		padYNum : 0,
		selStr  : '.set-store-ios',
		titStr  : 'Install Instructions'


	},

	{


		bodEle  : <>This downloads a file containing all of your data: pickers, items, reminders, history and app settings. Since all app data lives on your device, you alone are responsible for taking care of it. It is also handy for moving your data to a new, or second, device.</>,
		ideStr  : 'dataExport',
		padYNum : 0,
		selStr  : '.set-export-row',
		titStr  : 'Export Your Data'


	},

	{


		bodEle  : <>This restores your data from a previously exported backup file. Importing a backup <b>replaces all data</b> currently stored in the app, so make sure that's what you want first.</>,
		ideStr  : 'dataImport',
		padYNum : 0,
		selStr  : '.set-import-row',
		titStr  : 'Import Your Data'


	},

	{


		bodEle  : <>This wipes everything and restores the app to a clean, first-run state. <b>This can't be undone</b>, so export a backup first if there's any chance you'll want this data again.</>,
		ideStr  : 'dataReset',
		padYNum : 0,
		selStr  : '.set-reset-row',
		titStr  : 'Reset All Data'


	},

	// #endregion Data Control



	// #region Account

	{


		bodEle : <>Ease My Life runs entirely on this device with no account required. Syncing your data across devices is planned as a future paid feature (a one-time fee, not a subscription).</>,
		ideStr : 'account',
		selStr : '.set-section--account',
		titStr : 'Your Account'


	},

	// #endregion Account



	// #region About

	{


		bodEle : <>This shows the app's current version, along with links to the creator's website and this app's source code on GitHub.</>,
		ideStr : 'aboutInfo',
		selStr : '.set-about',
		titStr : 'App Info'


	},

	{


		bodEle : <>A planned way to support development of the app directly, coming in a future release.</>,
		ideStr : 'aboutSupportProject',
		selStr : '.set-support-project-row',
		titStr : 'Support the Project'


	},

	{


		bodEle : <>This replays the first-run walkthrough from the very beginning, including the welcome message and all of the tutorials.</>,
		ideStr : 'aboutReplayTour',
		selStr : '.set-replay-tour-row',
		titStr : 'Replay the Welcome Tour'


	},

	{


		bodEle : <>This opens a short form for sending a message directly to the developer. Your app version and browser are attached automatically, so there's no back-and-forth needed to track those down.</>,
		ideStr : 'aboutContactTrigger',
		selStr : '.set-contact-trigger',
		titStr : 'Contact Support'


	},

	{


		bodEle : <>Fill in a subject and message describing your problem or suggestion. Your app version and browser are already filled in below for reference.</>,
		ideStr : 'aboutContactForm',
		selStr : '.support-form',
		titStr : 'Support Message'


	},

	{


		bodEle : (


			<>
				<p><b>Cancel:</b> This discards your message and closes the form without sending.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Send:</b> This sends your message. If it can't go through (for example, if you're offline), you'll be shown an email address to reach out to instead, and your message will be kept so you can try again.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }
			</>


		),

		ideStr : 'aboutContactFormFoot',
		selStr : '.support-form-foot',
		titStr : 'Cancel / Send'


	},

	// #endregion About



	// #region Legal

	// padYNum:0 on both, same zero-gap .set-data-row stacking as above.
	{


		bodEle  : <>This opens the Privacy Policy, which explains how your data is collected, used, and stored.</>,
		ideStr  : 'legalPrivacy',
		padYNum : 0,
		selStr  : '.set-privacy-row',
		titStr  : 'Privacy Policy'


	},

	{


		bodEle  : <>This opens the Terms of Service, which covers the rules for using Ease My Life, including any paid features.</>,
		ideStr  : 'legalTerms',
		padYNum : 0,
		selStr  : '.set-terms-row',
		titStr  : 'Terms of Service'


	},

	// #endregion Legal


];



export { TOD_HEL_ARR, PIC_HEL_ARR, STA_HEL_ARR, DAT_HEL_ARR, SET_HEL_ARR }; // What: Named Exports. Why: Every tab file that renders its own help toggle imports its own one of these by name. How: This re-exports the 5 catalogs declared above; nothing else in this file is used outside it.


