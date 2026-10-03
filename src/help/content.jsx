


// #region Imports

import cssModObj from './content.module.css'; // What: CSS Module Object. Why: The tip bodies' button blocks and inline icons are styled from their own module. How: This maps each class name in content.module.css to its hashed module class.


import { IcoSvgCom } from '../ui/icon.jsx'; // What: Icon Svg Component. Why: Several items' own body copy renders a small inline icon next to a button's own label, so a reader can match the tip back to the real control. How: This is rendered inside body JSX throughout this file's own catalogs (e.g. Card Actions, Picker Items).

// #endregion Imports



/**
 * content.jsx = Content
 *
 * @summary
 * Per-page catalogs of help items for the on-demand help mode (see
 * help/mode.jsx). Copy is largely forked from onboarding/page-steps.jsx's own
 * PIC_TAR_OBJ / STA_TAR_OBJ / DAT_TAR_OBJ / SET_TAR_OBJ catalogs, same
 * targets, same underlying explanation, with directive tour language ("click
 * Next", "click Done when ready", "these buttons are disabled for this
 * tutorial") stripped out, since a help-mode tip has no steps to advance
 * through and nothing it points at is ever disabled.
 *
 * One item per DISTINCT piece of functionality, not one per DOM element, e.g.
 * a card's Re-Roll/Skip/Edit icons share one tip (a numbered list) rather than
 * three, and a group of filter pills gets one tip explaining what the whole
 * row does rather than one per pill. Kept in its own module (rather than
 * inline per-tab like the original 2-item Today test case) so every tab can
 * import from one place and so future content edits don't require touching
 * each tab file.
 *
 * Sections:
 *  - Constants
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

// #region Help Catalogs Subsystem

/**
 * content.jsx = Help Catalogs Subsystem
 *
 * @summary
 * Every item in the 5 catalogs below (DAT_HEL_ARR, PIC_HEL_ARR, SET_HEL_ARR,
 * STA_HEL_ARR, TOD_HEL_ARR) shares this exact shape, and none of the 210 items
 * repeat these same fields' own boilerplate comments on their own lines (see
 * the "Repeated-shape object literals" comment exception in CLAUDE.md); each
 * item's own opening line carries its identity comment instead, and a note
 * about one specific item follows that comment on the same line:
 *
 * - `groStr` (String, optional): Group String marks this item as one column of
 *   a shared table-style row; HelOveCom groups every item sharing the same
 *   groStr and snaps their highlights flush edge-to-edge, with no gap or
 *   overlap between them.
 *
 * - `ideStr` (String): Identifier String is this item's own unique key,
 *   letting HelOveCom (help/mode.jsx) track which one is currently open;
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
 * - `padXcoNum` / `padYcoNum` (Number, optional): Pad X-Coordinate Number
 *   and Pad Y-Coordinate Number override the default highlight padding on
 *   one axis, for a specific target whose highlight would otherwise overlap
 *   a neighboring element (see that item's own leading comment for the
 *   exact reasoning); read by help/geometry.js's claPadFun/badRecFun.
 *
 * - `scrBoo` (Boolean, optional): Scroll Boolean caps the open tip's own
 *   height and scrolls its content internally instead of overflowing past the
 *   target, for a body tall enough to overlap it on a short viewport; read by
 *   help/tooltip.jsx's own placement math (plaTipFun).
 *
 * - `selStr` (String): Selector String determines which on-page element(s)
 *   this item highlights; passed through help/geometry.js's own finTarFun, a
 *   comma-separated-fallback matcher tried left to right until one alternative
 *   matches a visible element.
 *
 * - `shaStr` (String or Function, optional): Shape String overrides the
 *   default CSS-border-radius shape detection, for a target whose round
 *   appearance comes from something else (an inner SVG shape, or a computed
 *   union with no single source element of its own); passed to
 *   help/geometry.js's own shaRadFun, or called directly when it is a
 *   function.
 *
 * - `titStr` (String or Function): Title String is the tip's own heading; a
 *   function is used when the heading depends on something only known at open
 *   time (a live DOM value, or a matched element's own name), called by
 *   help/tooltip.jsx's HelTipCom with the item's own target rect.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



const DAT_HEL_ARR = [ // What: Data Help Array. Why: This is the on-demand help catalog for the Data tab, one entry per distinct piece of functionality on that page rather than one per DOM element. How: This is imported by tab-data.jsx and passed to HelOveCom as its own helIteArr prop.


	// #region Data Header

	{ // What: Home Link Help Item. Why: This is the on-demand help tip for the Home Link element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>You can click this logo at any time to navigate back to the home page of the app, the Today page.</>,
		ideStr : 'brandMark',
		selStr : '[data-element-name-hook~="heaLeaDiv"] [data-element-name-hook~="braMarBut"]',
		titStr : 'Home Link'


	},

	// The Conditionals filter row below carries BOTH .stat-scope-groups AND .stat-scope-groups--cond, and the Type row carries BOTH .stat-scope-groups AND .stat-scope-groups--type (each an additional modifier, not a replacement, see their own conditionalsFilter/typeFilter entries), unscoped, this selector matched both of those rows' pills too, unioning the highlight all the way down through them.
	{ // What: Group Filter Help Item. Why: This is the on-demand help tip for the Group Filter element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This filters the pickers row below by group, which is extremely useful if you have created a lot of pickers.</>,
		ideStr : 'groupFilter',
		selStr : '[data-element-name-hook~="groFilDiv"] [data-element-name-hook~="filPilBut"]',
		titStr : 'Group Filter'


	},

	{ // What: Type Filter Help Item. Why: This is the on-demand help tip for the Type Filter element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This filters the pickers row below by type. You can select picker mode (Truly Random, Weighted, Dynamic Weighted, Ease Up, Ease Down), Conditionals or Reminders, independent of the Group and Conditional filters with all three narrowing the row together.</>,
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

	{ // What: Conditionals Filter Help Item. Why: This is the on-demand help tip for the Conditionals Filter element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // Only rendered once at least one conditional exists, a third filter row alongside Group and Type, narrowing the pickers list to whichever conditional gates them.


		bodEle : <>This filters the pickers list below by conditional, showing only pickers gated by the conditional you select.</>,
		ideStr : 'conditionalsFilter',
		selStr : '[data-element-name-hook~="conFilDiv"] [data-element-name-hook~="filPilBut"]',
		titStr : 'Conditionals Filter'


	},

	{ // What: Section Sort Help Item. Why: This is the on-demand help tip for the Section Sort element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This changes the order that Conditionals, Reminders and your pickers are listed in below.</>,
		ideStr : 'dataSectionSort',
		selStr : '[data-element-name-hook~="sorBarDiv"] [data-element-name-hook~="sorDroSel"]',
		titStr : 'Section Sort'


	},

	// #endregion Data Header



	// #region Conditionals Manager

	// Each conditional gets its own highlight/tooltip, not just the section as a whole. The per-type controls (Type/Weight/Odds/Boost/Charge Controls/Active) reuse the EXACT same selectors as the Pickers-page create-flow verbatim: CodConCom is the same shared component either way (this tab passes variant="inline" instead of the default 'card', but that only swaps a wrapper class neither selector touches), so there was nothing to re-derive, see PIC_HEL_ARR's own newCond* entries for the original comments on each of these.
	{ // What: Conditionals Help Item. Why: This is the on-demand help tip for the Conditionals element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This is where you can view and edit all of your conditionals. Tap the header to expand or collapse the section.</>,
		ideStr    : 'conditionalsManager',
		padYcoNum : 0, // padYcoNum:0, .catHeaHea has no border/gap of its own below it, but .catBodDiv (wrapping the Add button and every row) sits directly against it with only a hairline border, same zero-gap stacking as the rest of this card. The 20px flex gap above .cnd-manager itself (from .tab--data) easily absorbs losing the default pad on that side too.
		selStr    : '[data-element-name-hook~="conCatSec"] [data-element-name-hook~="catHeaHea"]',
		titStr    : 'Conditionals'


	},

	{ // What: Conditional Row Help Item. Why: This is the on-demand help tip for the Conditional Row element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>You can tap this conditional to expand and collapse this section. Expand it in order to view and edit its settings.</>,
		ideStr    : 'conditionalRow',
		labStr    : '[data-element-name-hook~="rowNamSpa"], [data-element-name-hook~="rowNamInp"]',
		mulBoo    : true,                                      // mulBoo is true because every conditional gets its own badge, not one for the whole list, since a user could be looking at any of them.
		padYcoNum : 0,                                         // padYcoNum:0, .lisIteDiv rows stack with zero gap (touching, separated only by a hairline border), so the default 8px pad bled a highlight box into both neighboring rows above and below it.
		selStr    : '[data-element-name-hook~="conCatSec"] [data-element-name-hook~="lisIteDiv"] > :is([data-element-name-hook~="lisRowBut"], [data-element-name-hook~="lisRowDiv"])',
		titStr    : ( tarRecObj ) => `${ tarRecObj?.labStr || 'This' } Conditional` // titStr is a function because each row's own heading should read as "{its own name} Conditional" rather than one generic title shared by every conditional, falling back to "This Conditional" while labStr hasn't resolved a live name yet.


	},

	{ // What: Create New Conditional Help Item. Why: This is the on-demand help tip for the Create New Conditional element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This creates a new conditional, letting you gate a picker behind a rule of your choosing so it only runs on days that rule allows.</>,
		ideStr    : 'dataCondAdd',
		padYcoNum : 0, // padYcoNum:0, .rowAddBut has the same zero-gap stacking as .lisIteDiv (a hairline border, no margin), touching both the header above it and the first conditional row below it.
		selStr    : '[data-element-name-hook~="conCatSec"] :is([data-element-name-hook~="rowAddBut"], [data-element-name-hook~="rowAddSpa"])',
		titStr    : 'Create New Conditional'


	},

	{ // What: Conditional Name Help Item. Why: This is the on-demand help tip for the Conditional Name element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // hidNamBoo is set on CodConCom here, so the name field lives on the ROW itself (same .rowNamInp shape as a picker item's own row), not inside the shared controls component.


		bodEle    : <>This is the name field for this conditional, you can rename it here.</>,
		ideStr    : 'dataCondName',
		padYcoNum : 0, // padYcoNum:0, the row and whatever's directly below it (the first CodConCom field) stack with zero gap, same as everywhere else on this page.
		selStr    : '[data-element-name-hook~="conCatSec"] [data-element-name-hook~="lisIteDiv"] [data-element-name-hook~="rowNamInp"]',
		titStr    : 'Conditional Name'


	},

	// Reused verbatim from PIC_HEL_ARR's newCondCardText, same CodConCom markup either way, missed when the other newCond* entries were copied over for this pass. // padYcoNum:0, .cnd-controls--inline (the variant used here, unlike the Pickers-page card variant) has gap:0 between fields, so this bleeds into its neighbors above/below without it.
	{ // What: Conditional Card Text Help Item. Why: This is the on-demand help tip for the Conditional Card Text element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This is the text that will show on the card that appears in your todo list whenever this conditional suppresses any attached pickers.</>,
		ideStr    : 'dataCondCardText',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="forFieDiv"]:has(> [data-element-name-hook~="carTexDiv"])',
		titStr    : 'Conditional Card Text'


	},

	{ // What: Conditional Type Help Item. Why: This is the on-demand help tip for the Conditional Type element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This is where you choose the rule this conditional follows each time it runs. Each option below explains its own ruleset, so have a read through them to see which one fits best.</>,
		ideStr    : 'dataCondType',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="conConDiv"] :is([data-element-name-hook~="forFieDiv"], [data-element-name-hook~="forFieFie"]):has([data-element-name-hook~="conModDiv"])',
		titStr    : 'Conditional Type'


	},

	{ // What: Conditional Weight Help Item. Why: This is the on-demand help tip for the Conditional Weight element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>Truly Random conditionals have no adjustable settings. Every time this conditional runs, it has an equal 50/50 chance to trigger.</>,
		ideStr    : 'dataCondRandom',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="conTypDiv"]:has([data-element-name-hook~="weiNonSpa"])',
		titStr    : 'Conditional Weight'


	},

	{ // What: Conditional Trigger Odds Help Item. Why: This is the on-demand help tip for the Conditional Trigger Odds element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This adjusts the conditional's chance to trigger each time it runs. A higher percentage makes it more likely to trigger and a lower percentage makes it less likely.</>,
		ideStr    : 'dataCondOdds',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="conTypDiv"] [data-element-name-hook~="ediRowDiv"]:has([data-element-name-hook~="weiSteDiv"])',
		titStr    : 'Conditional Trigger Odds'


	},

	{ // What: Conditional Boost Help Item. Why: This is the on-demand help tip for the Conditional Boost element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This is the conditional's current boost, which climbs by a percentage each time it doesn't trigger and resets to 0 the next time it does. A higher boost makes it more likely to trigger.</>,
		ideStr    : 'dataCondBoost',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="conTypDiv"] [data-element-name-hook~="ediRowDiv"]:has([data-element-name-hook~="booValSpa"])',
		titStr    : 'Conditional Boost'


	},

	{ // What: Conditional Charge Controls Help Item. Why: This is the on-demand help tip for the Conditional Charge Controls element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		ideStr    : 'dataCondEaseUp',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="conTypDiv"] [data-element-name-hook~="ediRowDiv"][data-ease-up-active]',
		titStr    : 'Conditional Charge Controls',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<p><b>Soonest:</b> This controls the minimum number of days that must pass before the conditional becomes eligible to trigger.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Latest:</b> This controls the maximum number of days that must pass before the conditional is guaranteed to trigger.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Fill:</b> This will fill the conditional's charge to 100, making it eligible to trigger.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


			</>


		)


	},

	{ // What: Conditional Charge Controls Help Item. Why: This is the on-demand help tip for the Conditional Charge Controls element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		ideStr    : 'dataCondEaseDown',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="conTypDiv"] [data-element-name-hook~="ediRowDiv"][data-ease-down-active]',
		titStr    : 'Conditional Charge Controls',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<p><b>Shortest:</b> This controls the minimum number of days that the conditional must stay triggered before it can stop.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Longest:</b> This controls the maximum number of days that the conditional can stay triggered before it must stop.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Refill:</b> This will refill the conditional's charge back to 100, effectively resetting how long it stays triggered.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


			</>


		)


	},

	{ // What: Conditional Active Toggle Help Item. Why: This is the on-demand help tip for the Conditional Active Toggle element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This toggles whether this conditional is currently active. Turning it off effectively disables the conditional, so its attached picker will always run regardless of the conditional's own trigger state.</>,
		ideStr    : 'dataCondActive',
		padYcoNum : 3,
		selStr    : '[data-element-name-hook~="conConDiv"] [data-element-name-hook~="ediRowDiv"]:has([data-element-name-hook~="togSwiBut"])',
		titStr    : 'Conditional Active Toggle'


	},

	{ // What: Delete / Cancel / Save Help Item. Why: This is the on-demand help tip for the Delete / Cancel / Save element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // .conEdiDiv scopes this to ConditionalEditor's own footer, its .conFooDiv wrapper class is shared with PickerControls' footer below, which lives in a differently-rooted tree (.conEdiDiv is unique to this one). Delete is only rendered when !isNew (see tab-data.jsx's ConditionalEditor), so :has(.btn--danger) splits this from dataCondFootNew below rather than always mentioning Delete.


		ideStr : 'dataCondFoot',
		selStr : '[data-element-name-hook~="conEdiDiv"] [data-element-name-hook~="conFooDiv"]:has([data-element-name-hook~="delActBut"]) button',
		titStr : 'Delete / Cancel / Save',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<p><b>Delete:</b> This button permanently deletes this conditional, after asking you to confirm. Any pickers using it will be detached.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Cancel:</b> This button discards any changes and closes this editor without saving.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Save:</b> This button saves your changes to this conditional.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


			</>


		)


	},

	{ // What: Cancel / Save Help Item. Why: This is the on-demand help tip for the Cancel / Save element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // New (unsaved) conditionals never render a Delete button, see ConditionalEditor's `!isaNewBoo &&` guard, so this covers that footer state with its own Cancel/Save-only copy.


		ideStr : 'dataCondFootNew',
		selStr : '[data-element-name-hook~="conEdiDiv"] [data-element-name-hook~="conFooDiv"]:not(:has([data-element-name-hook~="delActBut"])) button',
		titStr : 'Cancel / Save',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<p><b>Cancel:</b> This button discards the new conditional without saving it.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Save:</b> This button saves the new conditional.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


			</>


		)


	},

	// #endregion Conditionals Manager



	// #region Reminders Manager

	// The participation-settings matrix is new content (not present anywhere else); the per-reminder row + its editor reuse Today's own editReminderRepeat/editReminderFoot verbatim, since this is the exact same .rem-inline-editor markup either way.
	{ // What: Reminders Help Item. Why: This is the on-demand help tip for the Reminders element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This is where you can view and edit all of your reminders. Tap the header to expand or collapse the section.</>,
		ideStr    : 'remindersManager',
		padYcoNum : 0, // padYcoNum:0, same .catHeaHea/.catBodDiv zero-gap stacking as conditionalsManager.
		selStr    : '[data-element-name-hook~="remCatSec"] [data-element-name-hook~="catHeaHea"]',
		titStr    : 'Reminders'


	},

	// The Controls/Items disclosures share the .catTogBut class (see the matching pair on each picker below), so :nth-of-type splits them, Controls always renders first in .catBodDiv, Items second. // padYcoNum:0, .catTogBut touches its neighbor with only a hairline border, same zero-gap stacking as everywhere else on this page.
	{ // What: Reminder Controls Help Item. Why: This is the on-demand help tip for the Reminder Controls element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>Tap this to expand or collapse the reminders settings below. Collapsed, it shows how many settings there are.</>,
		ideStr    : 'remindersControlsHeader',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="remCatSec"] [data-element-name-hook~="catBodDiv"] > [data-element-name-hook~="catTogBut"]:nth-of-type(1)',
		titStr    : 'Reminder Controls'


	},

	{ // What: Reminders Settings Help Item. Why: This is the on-demand help tip for the Reminders Settings element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This controls whether one-time and recurring reminders are included in the day streak, completion ring or the Stats page. There are also controls to exclude those same types from weekends or holidays. Each type of reminder can be toggled independently.</>,
		ideStr    : 'remControlsMatrix',
		padYcoNum : 0, // padYcoNum:0, .remMatDiv sits flush against the Controls header above and the Items header below (no .ediBodDiv padding wrapper here, unlike PickerControls), so the default pad bled 8px into both.
		selStr    : '[data-element-name-hook~="remMatDiv"]',
		titStr    : 'Reminders Settings'


	},

	{ // What: Cancel / Save Help Item. Why: This is the on-demand help tip for the Cancel / Save element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // No Delete, unlike dataPickerFoot's own Delete/Cancel/Save, these are global settings, not a single deletable picker.


		ideStr : 'remControlsFoot',
		selStr : '[data-element-name-hook~="remMatDiv"] [data-element-name-hook~="matFooDiv"] button',
		titStr : 'Cancel / Save',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<p><b>Cancel:</b> This button discards any changes and closes this section without saving.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Save:</b> This button saves your changes to the Reminders controls.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


			</>


		)


	},

	{ // What: Reminders Items Help Item. Why: This is the on-demand help tip for the Reminders Items element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>Tap this to expand or collapse the list of your reminders below. Collapsed, it shows how many reminders you have.</>,
		ideStr    : 'remindersItemsHeader',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="remCatSec"] [data-element-name-hook~="catBodDiv"] > [data-element-name-hook~="catTogBut"]:nth-of-type(2)',
		titStr    : 'Reminders Items'


	},

	{ // What: Create New Reminder Help Item. Why: This is the on-demand help tip for the Create New Reminder element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This creates a new one-time or recurring reminder. Reminders are separate from pickers since some tasks cannot be randomly chosen and must be done on a schedule (recurring reminder) or are a one-time thing (one-time reminder).</>,
		ideStr    : 'remAddButton',
		padYcoNum : 0, // padYcoNum:0, .rowAddBut has the same zero-gap stacking as .lisIteDiv (a hairline border, no margin), touching both the header above it and the first reminder row below it.
		selStr    : '[data-element-name-hook~="remCatSec"] :is([data-element-name-hook~="rowAddBut"], [data-element-name-hook~="rowAddSpa"])',
		titStr    : 'Create New Reminder'


	},

	// mulBoo is true because every reminder gets its own badge, not one for the whole list. Split by type (rather than by name, like conditionalRow/pickerRow) via the row's own .rowIcoSpa[data-reminder-once-active] marker, set per user request instead of the name-based labStr pattern. // padYcoNum:0, .lisIteDiv rows stack with zero gap (touching, separated only by a hairline border), same as conditionalRow/pickerRow.
	{ // What: One-Time Reminder Item Help Item. Why: This is the on-demand help tip for the One-Time Reminder Item element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This is one of your reminders. Tap it to view and edit its settings.</>,
		ideStr    : 'reminderRowOnce',
		mulBoo    : true,
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="remCatSec"] [data-element-name-hook~="lisIteDiv"] > :is([data-element-name-hook~="lisRowBut"], [data-element-name-hook~="lisRowDiv"]):has([data-element-name-hook~="rowIcoSpa"][data-reminder-once-active])',
		titStr    : 'One-Time Reminder Item'


	},

	{ // What: Recurring Reminder Item Help Item. Why: This is the on-demand help tip for the Recurring Reminder Item element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This is one of your reminders. Tap it to view and edit its settings.</>,
		ideStr    : 'reminderRowRecurring',
		mulBoo    : true,
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="remCatSec"] [data-element-name-hook~="lisIteDiv"] > :is([data-element-name-hook~="lisRowBut"], [data-element-name-hook~="lisRowDiv"]):not(:has([data-element-name-hook~="rowIcoSpa"][data-reminder-once-active]))',
		titStr    : 'Recurring Reminder Item'


	},

	{ // What: Reminder Name Help Item. Why: This is the on-demand help tip for the Reminder Name element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This is the name field for your reminder, give it a short, descriptive name. This is what will show up on your todo list.</>,
		ideStr : 'dataReminderName',
		selStr : '[data-element-name-hook~="remCatSec"] [data-element-name-hook~="rowNamInp"]',
		titStr : 'Reminder Name'


	},

	// Reused verbatim from TOD_HEL_ARR's editReminderRepeat/editReminderFoot same .rem-inline-editor markup, and this tab has no quickadd form for that selector's own :not(.rem-quickadd-wrap *) exclusion to worry about.
	{ // What: Reminder Schedule Help Item. Why: This is the on-demand help tip for the Reminder Schedule element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		ideStr    : 'dataReminderRepeat',
		padYcoNum : 0, // padYcoNum:0, unlike Today's card-based editor, this tab's .iteEdiDiv wrapper overrides .rem-inline-foot's margin-top to 0 (see .rd-edit .rd-edit-foot in ui/entry-editor.module.css), so .rem-editor touches the footer row with zero gap.
		scrBoo    : true, // scrBoo is true here too, same reasoning as Today's addReminderRepeat.
		selStr    : '[data-element-name-hook~="inlEdiDiv"]:not([data-element-name-hook~="remAddDiv"] *) [data-element-name-hook~="schEdiDiv"]',
		titStr    : 'Reminder Schedule',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<p><b>Once:</b> This reminder stays on your todo list every day until you complete it, then it's gone for good.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>N Days:</b> This reminder will show up on your todo list every N days, counted from the start date that you select below.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Weekly:</b> This reminder will show up on your todo list every N week(s) on the days that you select below.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Monthly:</b> This reminder will show up on your todo list every N month(s) on the day or weekday that you select below.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Yearly:</b> This reminder will show up on your todo list every N year(s) on the date or weekday that you select below.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


			</>


		)


	},

	{ // What: Delete / Cancel / Save Help Item. Why: This is the on-demand help tip for the Delete / Cancel / Save element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // selStr targets .rem-inline-foot (the shared wrapper), not .rd-edit-foot specifically, see editReminderFoot's own comment (TOD_HEL_ARR) for why: Delete's own confirm prompt swaps in a different sibling class (.rem-foot-confirm), which .rd-edit-foot alone would miss, leaving its Cancel/Delete buttons genuinely unreachable (no dim-mask hole, blocked by the click-guard) while help mode is on. // Delete is only rendered when !isNew (see editor-footer.jsx's EdiFooCom), :has(.btn--danger) splits this from dataReminderFootNew below rather than always mentioning Delete, same fix as dataCondFoot/dataCondFootNew.


		ideStr : 'dataReminderFoot',
		selStr : '[data-element-name-hook~="inlEdiDiv"] [data-element-name-hook~="ediFooDiv"]:has([data-element-name-hook~="delActBut"]) button',
		titStr : 'Delete / Cancel / Save',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<p><b>Delete:</b> This button permanently deletes this reminder, after asking you to confirm.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Cancel:</b> This button discards any changes and closes this editor without saving.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Save:</b> This button saves your changes to this reminder.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


			</>


		)


	},

	{ // What: Cancel / Save Help Item. Why: This is the on-demand help tip for the Cancel / Save element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // New (unsaved) reminders never render a Delete button, see ReminderEditFoot's `!isaNewBoo &&` guard, so this covers that footer state with its own Cancel/Save-only copy.


		ideStr : 'dataReminderFootNew',
		selStr : '[data-element-name-hook~="inlEdiDiv"] [data-element-name-hook~="ediFooDiv"]:not(:has([data-element-name-hook~="delActBut"])) button',
		titStr : 'Cancel / Save',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<p><b>Cancel:</b> This button discards the new reminder without saving it.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Save:</b> This button saves the new reminder.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


			</>


		)


	},

	// #endregion Reminders Manager



	// #region Pickers Manager

	// Each picker gets its own highlight, plus each of its own settings controls individually (PickerControls) and each of its items individually (reusing the shared item-editor entries below). Scoped via the direct .datLisDiv > .datCatSec > .catHeaHea chain since .catHeaHea is also reused by the Conditionals/Reminders managers' own outer headers (which render outside .datLisDiv entirely).
	{ // What: Picker Row Help Item. Why: This is the on-demand help tip for the Picker Row element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This is one of your pickers. Tap it to view and edit its settings and items.</>,
		ideStr    : 'pickerRow',
		labStr    : '[data-element-name-hook~="catModSpa"]',                               // labStr reads the visible .catModSpa pill (tab-data.jsx) in the header's catTagSpa cluster.
		mulBoo    : true,                                            // mulBoo is true because every picker gets its own badge.
		padYcoNum : 0,                                               // padYcoNum:0, same .catHeaHea/.catBodDiv zero-gap stacking as conditionalsManager; matters once a picker is expanded and .catBodDiv renders beneath it.
		selStr    : '[data-element-name-hook~="datLisDiv"] > [data-element-name-hook~="datCatSec"] > [data-element-name-hook~="catHeaHea"]',
		titStr    : ( tarRecObj ) => tarRecObj?.labStr ? `${ tarRecObj.labStr } Picker` : 'Picker' // titStr is dynamic by TYPE, not name (unlike conditionalRow/pickerRow's own precedent).


	},

	// mulBoo is true because each expanded picker gets its own Controls/Items pair (more than one can be open at once). Same .catTogBut class and :nth-of-type split as the Reminders manager's own pair above. .catBodDiv is a descendant, not a direct child, of .datCatSec, it's wrapped in its own <ColDisCom> div (unlike .catHeaHea, which isn't). // padYcoNum:0, .catTogBut touches its neighbor with only a hairline border.
	{ // What: Picker Controls Help Item. Why: This is the on-demand help tip for the Picker Controls element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>Tap this to expand or collapse this picker's settings. This includes its name, its group, how it picks, its conditional gate and when it runs. Collapsed, it shows how many setting options exist.</>,
		ideStr    : 'dataPickerControlsHeader',
		mulBoo    : true,
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="datLisDiv"] > [data-element-name-hook~="datCatSec"] [data-element-name-hook~="catBodDiv"] > [data-element-name-hook~="catTogBut"]:nth-of-type(1)',
		titStr    : 'Picker Controls'


	},

	{ // What: Picker Items Help Item. Why: This is the on-demand help tip for the Picker Items element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>Tap this to expand or collapse this picker's list of items below. Collapsed, it shows how many items are in the picker.</>,
		ideStr    : 'dataPickerItemsHeader',
		mulBoo    : true,
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="datLisDiv"] > [data-element-name-hook~="datCatSec"] [data-element-name-hook~="catBodDiv"] > [data-element-name-hook~="catTogBut"]:nth-of-type(2)',
		titStr    : 'Picker Items'


	},

	// padYcoNum:0, .basRowDiv has no margin, just its own padding + a border-top, so consecutive rows (this one and Group below) touch with zero gap.
	{ // What: Picker Name Help Item. Why: This is the on-demand help tip for the Picker Name element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This is the name field for this picker, you can rename it here.</>,
		ideStr    : 'dataPickerName',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="basRowDiv"]:has([data-element-name-hook~="basNamInp"])',
		titStr    : 'Picker Name'


	},

	{ // What: Picker Group Help Item. Why: This is the on-demand help tip for the Picker Group element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This lets you choose which group this picker belongs to. Groups cluster related pickers together on your todo list, like "Food" or "Chores". You can select an existing group or create a new one.</>,
		ideStr    : 'dataPickerGroup',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="basGroDiv"]',
		titStr    : 'Picker Group'


	},

	{ // What: Picker Type Help Item. Why: This is the on-demand help tip for the Picker Type element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // Scoped to PickerControls' own "How it picks" group, ConditionalEditor has its own separate .rd-mode-radio inside .cnd-controls, which doesn't live under .ctlGroFie--picks.


		bodEle    : <>This is where you choose the rule this picker follows each time it runs. Each option below explains its own ruleset, so have a read through them to see which one fits best.</>,
		ideStr    : 'dataPickerType',
		padYcoNum : 0, // padYcoNum:0, .ctlGroFie--picks (this group's own wrapper) touches "When it runs" below with zero gap.
		selStr    : '[data-element-name-hook~="picCtlFie"] [data-element-name-hook~="modRadDiv"]',
		titStr    : 'Picker Type'


	},

	// padYcoNum:0, .schLinDiv rows stack with zero gap (same pattern as .basRowDiv above), touching Daily Generator Toggle below.
	{ // What: Picker Conditional Help Item. Why: This is the on-demand help tip for the Picker Conditional element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This lets you optionally gate this picker behind a conditional. When you attach a conditional, the picker will only run on days determined by that conditional's own rules. For example, giving yourself an occasional day off from chores. You can attach any existing conditional below, but if you want to create a new one you will need to use the Conditionals section above.</>,
		ideStr    : 'dataPickerConditionalToggle',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="schLinDiv"]:has(button[aria-label="Attach a conditional"])',
		titStr    : 'Picker Conditional'


	},

	{ // What: Select a Conditional Help Item. Why: This is the on-demand help tip for the Select a Conditional element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This lets you select an existing conditional to attach to this picker. If you don't have one yet, create one in the Conditionals section above.</>,
		ideStr    : 'dataPickerConditionalRail',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="conRowDiv"] [data-element-name-hook~="conRaiDiv"]',
		titStr    : 'Select a Conditional'


	},

	{ // What: Daily Generator Toggle Help Item. Why: This is the on-demand help tip for the Daily Generator Toggle element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This determines whether the picker will be included in the app's daily auto-generator. When on, this picker's items will be automatically added to your todo list. When off, the picker won't run automatically, but you can still generate a pick manually from the Pickers tab.</>,
		ideStr    : 'dataPickerDailyToggle',
		padYcoNum : 0, // padYcoNum:0, same .schLinDiv zero-gap stacking, touching Picker Cadence below.
		selStr    : '[data-element-name-hook~="schLinDiv"]:has(button[aria-label*="daily generator"])',
		titStr    : 'Daily Generator Toggle'


	},

	{ // What: Picker Cadence Help Item. Why: This is the on-demand help tip for the Picker Cadence element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		ideStr    : 'dataPickerCadence',
		padYcoNum : 0, // padYcoNum:0, same .schLinDiv zero-gap stacking, touching Picker Day Selection below.
		selStr    : '[data-element-name-hook~="schLinDiv"]:has(select[aria-label="Cadence"])',
		titStr    : 'Picker Cadence',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<p><b>Daily:</b> This is the picker's default cadence. It surfaces every day that it's scheduled to run, exactly like an ordinary picker.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Weekly:</b> This surfaces the picker once a week, on whichever weekday you choose below. Once picked, that item stays on your todo list until you mark it as completed, even if that takes more than one day.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Monthly:</b> This surfaces the picker once a month, on whichever day you choose below. Once picked, that item stays on your todo list until you mark it as completed, even if that takes more than one day.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Yearly:</b> This surfaces the picker once a year, on whichever date you choose below. Once picked, that item stays on your todo list until you mark it as completed, even if that takes more than one day.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


			</>


		)


	},

	{ // What: Picker Day Selection Help Item. Why: This is the on-demand help tip for the Picker Day Selection element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This lets you choose which days of the week this picker is allowed to run on. Tap a day to toggle it on or off.</>,
		ideStr    : 'dataPickerDays',
		padYcoNum : 0, // padYcoNum:0, same .schLinDiv zero-gap stacking, touching Picker Holidays Toggle below.
		selStr    : '[data-element-name-hook~="schLinDiv"]:has([data-element-name-hook~="dowChiDiv"])',
		titStr    : 'Picker Day Selection'


	},

	{ // What: Picker Holidays Toggle Help Item. Why: This is the on-demand help tip for the Picker Holidays Toggle element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // This is the LAST "When it runs" row now, Avoid Duplicate Items moved out to its own "Item Controls" section below (see that entry's own comment), so nothing follows this one here.


		bodEle    : <>This determines whether this picker skips major U.S. holidays. When on, this picker won't run on those days. You can edit which days count as holidays, or add your own, in Settings.</>,
		ideStr    : 'dataPickerSkipHolidays',
		padYcoNum : 0, // padYcoNum:0, same .schLinDiv zero-gap stacking, touching Picker Day Selection above.
		selStr    : '[data-element-name-hook~="schLinDiv"]:has(button[aria-label="Skip on holidays"])',
		titStr    : 'Picker Holidays Toggle'


	},

	{ // What: Picker Duplicate Items Toggle Help Item. Why: This is the on-demand help tip for the Picker Duplicate Items Toggle element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // Moved out of "When it runs" into its own "Item Controls" section (alongside Fill/Refill below), avoiding duplicate item names has nothing to do with the Daily generator/schedule that section is about.


		bodEle    : <>This determines whether the picker is allowed to choose an item when another item with the same name already exists elsewhere in the generated daily todo list. If all items are ineligible due to duplication, then this setting is ignored and an item is chosen normally.</>,
		ideStr    : 'dataPickerAvoidDuplicates',
		padYcoNum : 0, // padYcoNum:0, .ctlGroDiv--items (this group's own wrapper) touches "Item Controls" kicker above with zero gap.
		selStr    : '[data-element-name-hook~="schLinDiv"]:has(button[aria-label="Avoid duplicate items"])',
		titStr    : 'Picker Duplicate Items Toggle'


	},

	// Fill/Refill acts on every item in this picker at once (actions.filPicFun), not just one. Moved out of "How it picks" into "Item Controls" alongside Avoid Duplicate Items above (see that entry's own comment), filling every item's charge is an items operation, not part of the picker's own ruleset. // padYcoNum:0, touches Picker Duplicate Items Toggle above with zero gap. // Split by mode (easConDiv's own ease-up/ease-down state, tabs/data/picker-controls.jsx) rather than one combined Fill/Refill entry, same idea as itemChargeRangeUp/Down below (the per-item equivalent, which also covers each item's own Soonest/Latest controls, this picker level no longer has any of its own to prefill new items with; see PIC_NAM_OBJ.aveEasFun in pickers.js).
	{ // What: Fill All Help Item. Why: This is the on-demand help tip for the Fill All element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This fills the charge of every item in this picker at once.</>,
		ideStr    : 'dataPickerFillUp',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="easConDiv"][data-ease-up-active]',
		titStr    : 'Fill All'


	},

	{ // What: Refill All Help Item. Why: This is the on-demand help tip for the Refill All element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This refills the charge of every item in this picker at once.</>,
		ideStr    : 'dataPickerFillDown',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="easConDiv"][data-ease-down-active]',
		titStr    : 'Refill All'


	},

	{ // What: Delete / Cancel / Save Help Item. Why: This is the on-demand help tip for the Delete / Cancel / Save element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		ideStr : 'dataPickerFoot',
		selStr : '[data-element-name-hook~="picFooDiv"] button',
		titStr : 'Delete / Cancel / Save',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<p><b>Delete:</b> This button permanently deletes this picker, after asking you to confirm. This will also delete all of its items.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Cancel:</b> This button discards any changes and closes this editor without saving.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Save:</b> This button saves your changes to this picker.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


			</>


		)


	},

	{ // What: Create New Picker Help Item. Why: This is the on-demand help tip for the Create New Picker element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This creates a new picker directly from this list, respecting the group, type and conditional filters if they are used. Fill in its name and group, then use the Add Items button to add at least two items. Once it has them, the Save button adds it to the list with all other pickers.</>,
		ideStr : 'dataCreatePicker',
		selStr : '[data-element-name-hook~="datCreBut"]',
		titStr : 'Create New Picker'


	},

	// #endregion Pickers Manager



	// #region Item Rows / Sorting

	{ // What: Create New Picker Item Help Item. Why: This is the on-demand help tip for the Create New Picker Item element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // Scoped to .datLisDiv so this doesn't also match the Conditionals/Reminders managers' own "Add" buttons, which share the plain .rowAddBut class but render outside .datLisDiv entirely.


		bodEle    : <>This adds a new item to this picker's pool.</>,
		ideStr    : 'dataAddItem',
		padYcoNum : 0, // padYcoNum:0, .rowAddBut has the same zero-gap stacking as .lisIteDiv, touching the first item row below it.
		selStr    : '[data-element-name-hook~="datLisDiv"] :is([data-element-name-hook~="rowAddBut"], [data-element-name-hook~="rowAddSpa"])',
		titStr    : 'Create New Picker Item'


	},

	// Split by section type (three separate entries, each named for its own context) rather than one shared "Item Sort", Conditionals/Reminders/pickers all render the exact same SorSelCom markup (ui.jsx) inside their own .catBodDiv, so the selectors below key off each section's own distinguishing class/attribute instead: .cnd-manager (Conditionals), .cat--reminders (Reminders), and a picker section's own data-picker-id (set only there, unlike a plain className check, which would need :not() exclusions against the other two instead). // mulBoo is true because every expanded section's own sort control gets its own badge, since more than one can be visible (and set to a different order) at once, matters most for pickers, where several can be expanded together.
	{ // What: Conditional Items Sort Help Item. Why: This is the on-demand help tip for the Conditional Items Sort element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This changes the order that the items in this section are listed in below.</>,
		ideStr : 'dataCondItemSort',
		mulBoo : true,
		selStr : '[data-element-name-hook~="conCatSec"] [data-element-name-hook~="sorDroSel"]',
		titStr : 'Conditional Items Sort'


	},

	{ // What: Reminder Items Sort Help Item. Why: This is the on-demand help tip for the Reminder Items Sort element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This changes the order that the items in this section are listed in below.</>,
		ideStr : 'dataRemItemSort',
		mulBoo : true,
		selStr : '[data-element-name-hook~="remCatSec"] [data-element-name-hook~="sorDroSel"]',
		titStr : 'Reminder Items Sort'


	},

	{ // What: Picker Items Sort Help Item. Why: This is the on-demand help tip for the Picker Items Sort element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This changes the order that the items in this section are listed in below.</>,
		ideStr : 'dataPickerItemSort',
		mulBoo : true,
		selStr : '[data-element-name-hook~="datLisDiv"] [data-element-name-hook~="datCatSec"][data-picker-id] [data-element-name-hook~="sorDroSel"]',
		titStr : 'Picker Items Sort'


	},

	{ // What: Picker Item Help Item. Why: This is the on-demand help tip for the Picker Item element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This is one of this picker's items. Tap it to view and edit its settings.</>,
		ideStr    : 'dataItemRow',
		mulBoo    : true, // mulBoo is true because every item in every expanded picker gets its own badge.
		padYcoNum : 0,    // padYcoNum:0, .lisIteDiv rows stack with zero gap (touching, separated only by a hairline border), same as conditionalRow/reminderRow.
		selStr    : '[data-element-name-hook~="datLisDiv"] [data-element-name-hook~="lisIteDiv"] > :is([data-element-name-hook~="lisRowBut"], [data-element-name-hook~="lisRowDiv"])',
		titStr    : 'Picker Item'


	},

	// #endregion Item Rows / Sorting



	// #region Editing A Picker Item

	// EntEdiCom, defined in tab-today.jsx but reused here, see .entry-editor's own doc comment there. Which of these actually renders depends on the OWNING PICKER's mode, so most items below only ever show up for some modes: Charge Range (Ease Up/Ease Down only), Weight (Weighted/Dynamic Weighted), Boost (Dynamic Weighted only). Active and the footer always render regardless of mode. // .rowNamInp is also used by the Conditionals section's own name field (same .lisIteDiv wrapper shape), :has(.entry-editor) picks out only a .lisIteDiv that's actually an ITEM editor, since .entry-editor is unique to EntEdiCom and never rendered for a conditional.
	{ // What: Item Name Help Item. Why: This is the on-demand help tip for the Item Name element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This is the name field for this item, you can rename it here.</>,
		ideStr : 'itemName',
		selStr : '[data-element-name-hook~="lisIteDiv"]:has([data-element-name-hook~="entEdiDiv"]) [data-element-name-hook~="rowNamInp"]',
		titStr : 'Item Name'


	},

	{ // What: Item Charge Controls Help Item. Why: This is the on-demand help tip for the Item Charge Controls element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		ideStr    : 'itemChargeRangeUp',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="entEdiDiv"] [data-element-name-hook~="ediRowDiv"][data-ease-up-active]',
		titStr    : 'Item Charge Controls',

		bodEle : () => { // bodEle is a function (see help/tooltip.jsx's HelTipCom) that reads the picker's own cadence unit word (days/weeks/months/years) straight off the already-rendered unit label (its easUniSpa hook) instead of hardcoding "days", which would be wrong for a non-daily cadence picker.


			const uniWorStr = document.querySelector( '[data-element-name-hook~="entEdiDiv"] [data-element-name-hook~="ediRowDiv"][data-ease-up-active] [data-element-name-hook~="easUniSpa"]' )?.textContent || 'days'; // What: Unit Word String. Why: This item's own copy needs the real, currently-displayed unit label (e.g. "days"), not a hardcoded guess. How: This reads the matched row's own unit control text, falling back to 'days' if not found.



			return (


				<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


					<p><b>Soonest:</b> This controls the minimum number of { uniWorStr } that the item must wait before becoming eligible to be picked again.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

					<p><b>Latest:</b> This controls the maximum number of { uniWorStr } that the item must wait before becoming eligible to be picked again.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

					<p><b>Fill:</b> This will fill the item's charge to 100, making it eligible to be picked again.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


				</>


			);


		}


	},

	{ // What: Item Charge Controls Help Item. Why: This is the on-demand help tip for the Item Charge Controls element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		ideStr    : 'itemChargeRangeDown',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="entEdiDiv"] [data-element-name-hook~="ediRowDiv"][data-ease-down-active]',
		titStr    : 'Item Charge Controls',

		bodEle : () => { // bodEle is a function (see help/tooltip.jsx's HelTipCom) that reads the picker's own cadence unit word (days/weeks/months/years) straight off the already-rendered unit label (its easUniSpa hook) instead of hardcoding "days", which would be wrong for a non-daily cadence picker.


			const uniWorStr = document.querySelector( '[data-element-name-hook~="entEdiDiv"] [data-element-name-hook~="ediRowDiv"][data-ease-down-active] [data-element-name-hook~="easUniSpa"]' )?.textContent || 'days'; // What: Unit Word String. Why: This item's own copy needs the real, currently-displayed unit label (e.g. "days"), not a hardcoded guess. How: This reads the matched row's own unit control text, falling back to 'days' if not found.



			return (


				<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


					<p><b>Shortest:</b> This controls the minimum number of { uniWorStr } that the item must stay as the active pick, after which a new item will be picked.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

					<p><b>Longest:</b> This controls the maximum number of { uniWorStr } that the item must stay as the active pick, after which a new item will be picked.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

					<p><b>Refill:</b> This will refill the item's charge back to 100, effectively resetting its active pick cadence.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


				</>


			);


		}


	},

	{ // What: Item Weight Help Item. Why: This is the on-demand help tip for the Item Weight element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This adjusts this item's pick chance relative to the picker's other items. A higher weight makes it more likely to be picked and a lower weight makes it less likely.</>,
		ideStr    : 'itemWeight',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="entEdiDiv"] [data-element-name-hook~="ediRowDiv"]:has([data-element-name-hook~="weiSteDiv"])',
		titStr    : 'Item Weight'


	},

	{ // What: Item Boost Help Item. Why: This is the on-demand help tip for the Item Boost element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This is the item's current boost, which climbs by 1 each time it isn't picked and resets to 0 the next time it is. A higher boost makes it more likely to be picked.</>,
		ideStr    : 'itemBoost',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="entEdiDiv"] [data-element-name-hook~="ediRowDiv"]:has([data-element-name-hook~="booValSpa"])',
		titStr    : 'Item Boost'


	},

	{ // What: Item Active Toggle Help Item. Why: This is the on-demand help tip for the Item Active Toggle element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This toggles whether this item is eligible to be picked. Turning it off marks the item inactive, removing it from the picker's pool until it's turned back on.</>,
		ideStr    : 'itemActive',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="entEdiDiv"] [data-element-name-hook~="ediRowDiv"]:has([data-element-name-hook~="togSwiBut"])',
		titStr    : 'Item Active Toggle'


	},

	{ // What: Delete / Cancel / Save Help Item. Why: This is the on-demand help tip for the Delete / Cancel / Save element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // selStr targets .rem-inline-foot (the shared wrapper), not .rd-edit-foot specifically, Delete swaps that sibling out for .rem-foot-confirm (its own Cancel/Delete pair), which a selector scoped to .rd-edit-foot would miss entirely once that swap happens: no dim-mask hole, AND the click-guard would treat its buttons as off-target and block them, making the confirmation genuinely unreachable while help mode is on. // Delete is only rendered when !isNew (see EntEdiCom in tab-today.jsx), :has(.btn--danger) splits this from itemFootNew below rather than always mentioning Delete, same fix as dataCondFoot/dataReminderFoot.


		ideStr : 'itemFoot',
		selStr : '[data-element-name-hook~="entEdiDiv"] [data-element-name-hook~="ediFooDiv"]:has([data-element-name-hook~="delActBut"]) button',
		titStr : 'Delete / Cancel / Save',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<p><b>Delete:</b> This button permanently deletes this item, after asking you to confirm.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Cancel:</b> This button discards any changes and closes this editor without saving.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Save:</b> This button saves your changes to this item.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


			</>


		)


	},

	{ // What: Cancel / Save Help Item. Why: This is the on-demand help tip for the Cancel / Save element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // New (unsaved) items never render a Delete button, see EntEdiCom's `!isaNewBoo &&` guard, so this covers that footer state with its own Cancel/Save-only copy.


		ideStr : 'itemFootNew',
		selStr : '[data-element-name-hook~="entEdiDiv"] [data-element-name-hook~="ediFooDiv"]:not(:has([data-element-name-hook~="delActBut"])) button',
		titStr : 'Cancel / Save',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<p><b>Cancel:</b> This button discards the new item without saving it.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Save:</b> This button saves the new item.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


			</>


		)


	},

	// #endregion Editing A Picker Item


];



const PIC_HEL_ARR = [ // What: Picker Help Array. Why: This is the on-demand help catalog for the Pickers tab, one entry per distinct piece of functionality on that page rather than one per DOM element. How: This is imported by tab-picker.jsx and passed to HelOveCom as its own helIteArr prop.


	// #region Pickers Header

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


		bodEle : <>This filters the pickers row below by picker type (Truly Random, Weighted, Dynamic Weighted, Ease Up, Ease Down), independent of the Group filter above with both narrowing the row together.</>,
		ideStr : 'typeFilter',
		selStr : '[data-element-name-hook~="typFilDiv"] [data-element-name-hook~="filPilBut"]',
		titStr : 'Type Filter'


	},

	// #endregion Pickers Header



	// #region Picker Details

	{ // What: Picker Selection Help Item. Why: This is the on-demand help tip for the Picker Selection element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This selects a specific picker, in order to initiate a manual picker generation down below as well as edit or delete its items.</>,
		ideStr    : 'pickerSelection',
		padXcoNum : 3, // padXcoNum: 3, the add button sits right before the first tab in the same 8px-gap scrollable row; the default 8px pad on each side would overlap by 8px otherwise (same bleed as Today's Edit Mode/Regenerate).
		selStr    : '[data-element-name-hook~="picTabDiv"] [data-element-name-hook~="picTabBut"]',
		titStr    : 'Picker Selection'


	},

	{ // What: Create New Pickers Help Item. Why: This is the on-demand help tip for the Create New Pickers element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This is where you can create new pickers. This button will open up a full page form with 2 parts, picker settings and picker items.</>,
		ideStr    : 'createNewPickers',
		padXcoNum : 3, // padXcoNum: 3, see pickerSelection's own comment, same gap, same fix.
		selStr    : ':is([data-element-name-hook~="picAddBut"], [data-element-name-hook~="picAddSpa"])',
		titStr    : 'Create New Pickers'


	},

	{ // What: Picker Name Help Item. Why: This is the on-demand help tip for the Picker Name element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // Scoping the picTitHea hook under picVieDiv keeps this to the picker view's own title, never the Edit/Create-picker form's heading, only ever one or the other on screen at once, but the selector still needs to be unambiguous for whichever is actually showing.


		bodEle    : <>This is the name of the currently selected picker.</>,
		ideStr    : 'pickerName',
		padYcoNum : 2, // padYcoNum: 2, the mode pill sits directly below with only a 6px margin-top (see picker-view.module.css's .heaTitDiv rule, which sets the pill's --pill-margin-top); the default 8px pad on each side would overlap by 10px otherwise, bleeding into the pill's own highlight.
		selStr    : '[data-element-name-hook~="picVieDiv"] [data-element-name-hook~="picTitHea"]',
		titStr    : 'Picker Name'


	},

	{ // What: Picker Type Help Item. Why: This is the on-demand help tip for the Picker Type element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This shows the currently selected picker's type (Truly Random, Weighted, Dynamic Weighted, Ease Up, or Ease Down).</>,
		ideStr    : 'pickerTypePill',
		padYcoNum : 2, // padYcoNum: 2, see pickerName's own comment, same 6px gap, same fix.
		selStr    : '[data-element-name-hook~="picVieDiv"] [data-element-name-hook~="modPilSpa"]',
		titStr    : 'Picker Type'


	},

	{ // What: Edit Picker Help Item. Why: This is the on-demand help tip for the Edit Picker element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This opens the same form used to create a picker, pre-filled with this picker's current settings. You can adjust its name, group, type, daily generator schedule, or conditional attachment. Its items aren&rsquo;t edited here, but you can use this picker's own item list below or the Data tab for that.</>,
		ideStr : 'editPicker',
		selStr : '[data-element-name-hook~="picEdiBut"]',
		titStr : 'Edit Picker'


	},

	{ // What: Picker Explanation Help Item. Why: This is the on-demand help tip for the Picker Explanation element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This explains the currently selected picker's ruleset, including how it chooses an item and why you might pick this type over another.</>,
		ideStr : 'pickerExplanation',
		selStr : '[data-element-name-hook~="picVieDiv"] [data-element-name-hook~="picHinPar"]',
		titStr : 'Picker Explanation'


	},

	{ // What: Manual Generation Help Item. Why: This is the on-demand help tip for the Manual Generation element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		ideStr : 'manualGeneration',
		selStr : '[data-element-name-hook~="picRunDiv"]',
		titStr : 'Manual Generation',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<p>The Pick One button runs a manual pick generation for the selected picker, so that you don't have to completely rely on your todo list's auto generation.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p>Once it resolves and generates a pick it is replaced by the Send to Today button, which will add the selected pick to your todo list. The Re-Roll button will run the process again and the Done button will end the process without doing anything.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


			</>


		)


	},

	// #endregion Picker Details



	// #region Picker Item Pool

	{ // What: Picker Items Help Item. Why: This is the on-demand help tip for the Picker Items element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : (


			<>This lists all of the items that are in this picker's pool, including their values (if applicable). The <span className={ cssModObj.inlIcoSpa }><IcoSvgCom icoNamStr='calEle' sizSteStr='bas' /></span> Send to Today button will send the item to your todo list on the Today page, the <span className={ cssModObj.inlIcoSpa }><IcoSvgCom icoNamStr='ediEle' sizSteStr='bas' /></span> Edit button will allow you to edit the item's properties and the <span className={ cssModObj.inlIcoSpa }><IcoSvgCom icoNamStr='traEle' sizSteStr='bas' /></span> Delete button will delete the item after asking for confirmation.</> // What: Body Fragment. Why: This tip's own body mixes text with inline icons. How: This wraps the whole run as one element. // Vertical Rhythm Base ~= 14.572px


		),

		ideStr    : 'pickerItems',
		padYcoNum : 4, // padYcoNum: 4, picPooDiv (the shared flex-column parent) only has an 11px gap to the Add Picker Item button below; the default 8px pad on each side would overlap by 5px otherwise.
		selStr    : '[data-element-name-hook~="pooIteDiv"]',
		titStr    : 'Picker Items'


	},

	{ // What: Add Picker Item Help Item. Why: This is the on-demand help tip for the Add Picker Item element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This button will open a form that allows you to add a new item to the selected picker's pool.</>,
		ideStr    : 'addPickerItem',
		padYcoNum : 4, // padYcoNum: 4, see pickerItems' own comment, same gap, same fix.
		selStr    : '[data-element-name-hook~="iteAddBut"]',
		titStr    : 'Add Picker Item'


	},

	// Clicking Edit on a pool item opens the shared EntEdiCom (same component/markup as Today's and Data's item-editor coverage, see those catalogs' own comments), but it renders inside iteAddDiv, BELOW the pool list, not inline where the item's own row is. No scroll-into-view step exists in help mode (unlike the guided tour), so these badges simply appear wherever that section currently sits once an edit is open; the user scrolls to find them like anything else below the fold. This same markup/selector set is ALSO what Step 2 of the Create a Picker form uses for each new item's editor (identical lisIteDiv/entEdiDiv structure), one shared set of entries covers editing an existing pool item, adding one from an existing picker's own pool, and building a brand new picker's pool. The rowNamInp hook is also used by the Conditionals section elsewhere in the app (same lisIteDiv wrapper shape), so :has() on the entEdiDiv hook picks out only a lisIteDiv that's actually an ITEM editor.
	{ // What: Item Name Help Item. Why: This is the on-demand help tip for the Item Name element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This is the name field for your new item, give it a short, descriptive name. This is what will show up on your todo list.</>,
		ideStr : 'itemName',
		selStr : '[data-element-name-hook~="lisIteDiv"]:has([data-element-name-hook~="entEdiDiv"]) [data-element-name-hook~="rowNamInp"]',
		titStr : 'Item Name'


	},

	{ // What: Item Charge Controls Help Item. Why: This is the on-demand help tip for the Item Charge Controls element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		ideStr    : 'itemChargeRangeUp',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="entEdiDiv"] [data-element-name-hook~="ediRowDiv"][data-ease-up-active]',
		titStr    : 'Item Charge Controls',

		bodEle : () => { // bodEle is a function (see help/tooltip.jsx's HelTipCom) that reads the picker's own cadence unit word (days/weeks/months/years) straight off the already-rendered unit label (its easUniSpa hook) instead of hardcoding "days", which would be wrong for a non-daily cadence picker.


			const uniWorStr = document.querySelector( '[data-element-name-hook~="entEdiDiv"] [data-element-name-hook~="ediRowDiv"][data-ease-up-active] [data-element-name-hook~="easUniSpa"]' )?.textContent || 'days'; // What: Unit Word String. Why: This item's own copy needs the real, currently-displayed unit label (e.g. "days"), not a hardcoded guess. How: This reads the matched row's own unit control text, falling back to 'days' if not found.



			return (


				<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


					<p><b>Soonest:</b> This controls the minimum number of { uniWorStr } that the item must wait before becoming eligible to be picked again.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

					<p><b>Latest:</b> This controls the maximum number of { uniWorStr } that the item must wait before becoming eligible to be picked again.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

					<p><b>Fill:</b> This will fill the item's charge to 100, making it eligible to be picked again.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


				</>


			);


		}


	},

	{ // What: Item Charge Controls Help Item. Why: This is the on-demand help tip for the Item Charge Controls element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		ideStr    : 'itemChargeRangeDown',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="entEdiDiv"] [data-element-name-hook~="ediRowDiv"][data-ease-down-active]',
		titStr    : 'Item Charge Controls',

		bodEle : () => { // bodEle is a function (see help/tooltip.jsx's HelTipCom) that reads the picker's own cadence unit word (days/weeks/months/years) straight off the already-rendered unit label (its easUniSpa hook) instead of hardcoding "days", which would be wrong for a non-daily cadence picker.


			const uniWorStr = document.querySelector( '[data-element-name-hook~="entEdiDiv"] [data-element-name-hook~="ediRowDiv"][data-ease-down-active] [data-element-name-hook~="easUniSpa"]' )?.textContent || 'days'; // What: Unit Word String. Why: This item's own copy needs the real, currently-displayed unit label (e.g. "days"), not a hardcoded guess. How: This reads the matched row's own unit control text, falling back to 'days' if not found.



			return (


				<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


					<p><b>Shortest:</b> This controls the minimum number of { uniWorStr } that the item must stay as the active pick, after which a new item will be picked.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

					<p><b>Longest:</b> This controls the maximum number of { uniWorStr } that the item must stay as the active pick, after which a new item will be picked.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

					<p><b>Refill:</b> This will refill the item's charge back to 100, effectively resetting its active pick cadence.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


				</>


			);


		}


	},

	{ // What: Item Weight Help Item. Why: This is the on-demand help tip for the Item Weight element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This adjusts the item's pick chance relative to the picker's other items. For example, an item with a weight of w2 is twice as likely to be picked as an item with a weight of w1.</>,
		ideStr    : 'itemWeight',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="entEdiDiv"] [data-element-name-hook~="ediRowDiv"]:has([data-element-name-hook~="weiSteDiv"])',
		titStr    : 'Item Weight'


	},

	{ // What: Item Boost Help Item. Why: This is the on-demand help tip for the Item Boost element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This is the item's current boost, which climbs by 1 each time it isn't picked and resets to 0 the next time it is. A higher boost makes it more likely to be picked.</>,
		ideStr    : 'itemBoost',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="entEdiDiv"] [data-element-name-hook~="ediRowDiv"]:has([data-element-name-hook~="booValSpa"])',
		titStr    : 'Item Boost'


	},

	{ // What: Item Active Toggle Help Item. Why: This is the on-demand help tip for the Item Active Toggle element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This toggles whether this item is eligible to be picked. Turning it off marks the item inactive, removing it from the picker's pool until it's turned back on.</>,
		ideStr    : 'itemActive',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="entEdiDiv"] [data-element-name-hook~="ediRowDiv"]:has([data-element-name-hook~="togSwiBut"])',
		titStr    : 'Item Active Toggle'


	},

	{ // What: Cancel / Save Help Item. Why: This is the on-demand help tip for the Cancel / Save element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // Unlike Today/Data, the Delete button is CSS-hidden here (the lisIteDiv wrapper sets --entry-editor-delete-display : none), deleting an existing item stays solely the pool row's own trash icon + confirm flow on this tab, so the copy only covers Cancel/Save.


		ideStr : 'itemFoot',
		selStr : '[data-element-name-hook~="entEdiDiv"] [data-element-name-hook~="ediFooDiv"] button',
		titStr : 'Cancel / Save',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<p><b>Cancel:</b> This button discards the form and closes the editor without saving the new item.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Save:</b> This button saves the new item to the picker's pool.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


			</>


		)


	},

	// #endregion Picker Item Pool



	// #region Create A Picker Form Step 1

	{ // What: Picker Name Help Item. Why: This is the on-demand help tip for the Picker Name element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // :has(#np-name) scopes to just this field, since every field in the form shares the same forFieDiv/forFieFie hooks.


		bodEle : <>This is the name field for your new picker, and it should have a short, descriptive name.</>,
		ideStr : 'newPickerName',
		selStr : ':is([data-element-name-hook~="forFieDiv"], [data-element-name-hook~="forFieFie"]):has(#np-name)',
		titStr : 'Picker Name'


	},

	{ // What: Picker Group Help Item. Why: This is the on-demand help tip for the Picker Group element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // :has() on the forGroDiv hook scopes to just this field, same reasoning as newPickerName's own comment.


		bodEle : <>This will let you choose which group this new picker belongs to. Groups cluster related pickers together on your todo list, like "Food" or "Chores". You can select an existing group or create a new one.</>,
		ideStr : 'newPickerGroup',
		selStr : ':is([data-element-name-hook~="forFieDiv"], [data-element-name-hook~="forFieFie"]):has([data-element-name-hook~="forGroDiv"])',
		titStr : 'Picker Group'


	},

	{ // What: Picker Type Help Item. Why: This is the on-demand help tip for the Picker Type element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // Deliberately doesn't re-explain each mode, every option already has its own ruleset/explanation copy right there on the page, and there isn't room for that much text in a tooltip anyway.


		bodEle : <>This is where you choose the rule this picker follows each time it runs. Each option below explains its own ruleset, so have a read through them to see which one fits best.</>,
		ideStr : 'newPickerMode',
		selStr : ':is([data-element-name-hook~="forFieDiv"], [data-element-name-hook~="forFieFie"]):has([data-element-name-hook~="modRadDiv"])',
		titStr : 'Picker Type'


	},

	{ // What: Picker Conditional Help Item. Why: This is the on-demand help tip for the Picker Conditional element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // Scoped to just the toggle row, not the collapsed attach-flow below it (the conditional pill rail + inline "create new conditional" form), that's its own whole nested interface, left for a future pass rather than reaching into collapsed content on this first one.


		bodEle : <>This lets you optionally gate this picker behind a conditional. When you attach a conditional, the picker will only run on days determined by that conditional's own rules. For example, giving yourself an occasional day off from chores. You can attach an existing conditional or create a new one.</>,
		ideStr : 'newPickerConditional',
		selStr : '[data-element-name-hook~="conTogDiv"]',
		titStr : 'Picker Conditional'


	},

	{ // What: Select a Conditional Help Item. Why: This is the on-demand help tip for the Select a Conditional element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // Only present once the toggle above is on (the whole conAttDiv block is a ColDisCom), finTarFun naturally won't match anything while it's closed, no visibility check needed here.


		bodEle : <>This lets you select an existing conditional to attach to this picker. If you don't have one yet, or want to create another, use the Add New Conditional button to build one inline.</>,
		ideStr : 'newPickerConditionalRail',
		selStr : '[data-element-name-hook~="conRaiDiv"]',
		titStr : 'Select a Conditional'


	},

	{ // What: Conditional Name Help Item. Why: This is the on-demand help tip for the Conditional Name element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This is the name field for your new conditional, and it should have a short, descriptive name.</>,
		ideStr : 'newCondName',
		selStr : '[data-element-name-hook~="conConDiv"] :is([data-element-name-hook~="forFieDiv"], [data-element-name-hook~="forFieFie"]):has(input[placeholder="Conditional name"])',
		titStr : 'Conditional Name'


	},

	{ // What: Conditional Card Text Help Item. Why: This is the on-demand help tip for the Conditional Card Text element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This is the text that will show on the card that appears in your todo list whenever this conditional suppresses any attached pickers.</>,
		ideStr : 'newCondCardText',
		selStr : '[data-element-name-hook~="forFieDiv"]:has(> [data-element-name-hook~="carTexDiv"])',
		titStr : 'Conditional Card Text'


	},

	// Deliberately doesn't re-explain each type, every option already has its own ruleset/explanation copy right there on the page, same as newPickerMode's own comment. // padYcoNum: 0, this whole cluster (Type/Weight/Odds/Boost/Charge Controls/Active) sits close enough together, .cnd-type-group's own gap to a sibling block is only 6px, and Odds-to-Boost specifically share the SAME block with next to no gap at all, that the default 8px pad would overlap somewhere no matter which type is selected. Zero pad on all of them relies on newCondActive's own padYcoNum to open a gap instead (see its comment), same "let one side of the boundary do the work" approach as EntEdiCom's itemWeight/itemBoost.
	{ // What: Conditional Type Help Item. Why: This is the on-demand help tip for the Conditional Type element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This is where you choose the rule this conditional follows each time it runs. Each option below explains its own ruleset, so have a read through them to see which one fits best.</>,
		ideStr    : 'newCondType',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="conConDiv"] :is([data-element-name-hook~="forFieDiv"], [data-element-name-hook~="forFieFie"]):has([data-element-name-hook~="conModDiv"])',
		titStr    : 'Conditional Type'


	},

	{ // What: Conditional Weight Help Item. Why: This is the on-demand help tip for the Conditional Weight element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>Truly Random conditionals have no adjustable settings. Every time this conditional runs, it has an equal 50/50 chance to trigger.</>,
		ideStr    : 'newCondRandom',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="conTypDiv"]:has([data-element-name-hook~="weiNonSpa"])',
		titStr    : 'Conditional Weight'


	},

	{ // What: Conditional Trigger Odds Help Item. Why: This is the on-demand help tip for the Conditional Trigger Odds element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This adjusts the conditional's chance to trigger each time it runs. A higher percentage makes it more likely to trigger and a lower percentage makes it less likely.</>,
		ideStr    : 'newCondOdds',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="conTypDiv"] [data-element-name-hook~="ediRowDiv"]:has([data-element-name-hook~="weiSteDiv"])',
		titStr    : 'Conditional Trigger Odds'


	},

	{ // What: Conditional Boost Help Item. Why: This is the on-demand help tip for the Conditional Boost element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This is the conditional's current boost, which climbs by a percentage each time it doesn't trigger and resets to 0 the next time it does. A higher boost makes it more likely to trigger.</>,
		ideStr    : 'newCondBoost',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="conTypDiv"] [data-element-name-hook~="ediRowDiv"]:has([data-element-name-hook~="booValSpa"])',
		titStr    : 'Conditional Boost'


	},

	// The ease rows are told apart by their own data-ease-up-active/data-ease-down-active state (see ui/conditional-controls.jsx), the same split-by-direction pattern as EntEdiCom's itemChargeRangeUp/Down.
	{ // What: Conditional Charge Controls Help Item. Why: This is the on-demand help tip for the Conditional Charge Controls element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		ideStr    : 'newCondEaseUp',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="conTypDiv"] [data-element-name-hook~="ediRowDiv"][data-ease-up-active]',
		titStr    : 'Conditional Charge Controls',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<p><b>Soonest:</b> This controls the minimum number of days that must pass before the conditional becomes eligible to trigger.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Latest:</b> This controls the maximum number of days that must pass before the conditional is guaranteed to trigger.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Fill:</b> This will fill the conditional's charge to 100, making it eligible to trigger.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


			</>


		)


	},

	{ // What: Conditional Charge Controls Help Item. Why: This is the on-demand help tip for the Conditional Charge Controls element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		ideStr    : 'newCondEaseDown',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="conTypDiv"] [data-element-name-hook~="ediRowDiv"][data-ease-down-active]',
		titStr    : 'Conditional Charge Controls',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<p><b>Shortest:</b> This controls the minimum number of days that the conditional must stay triggered before it can stop.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Longest:</b> This controls the maximum number of days that the conditional can stay triggered before it must stop.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Refill:</b> This will refill the conditional's charge back to 100, effectively resetting how long it stays triggered.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


			</>


		)


	},

	{ // What: Conditional Active Toggle Help Item. Why: This is the on-demand help tip for the Conditional Active Toggle element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This toggles whether this conditional is currently active. Turning it off effectively disables the conditional, so its attached picker will always run regardless of the conditional's own trigger state.</>,
		ideStr    : 'newCondActive',
		padYcoNum : 3, // padYcoNum: 3, opens a gap against whichever zero-pad block sits above it (Weight/Odds/Boost/Charge Controls all now padYcoNum: 0, see their own comment), while staying comfortably under the real 6px gap so it can't reach up into that block's own content.
		selStr    : '[data-element-name-hook~="conConDiv"] [data-element-name-hook~="ediRowDiv"]:has([data-element-name-hook~="togSwiBut"])',
		titStr    : 'Conditional Active Toggle'


	},

	{ // What: Daily Generator Toggle Help Item. Why: This is the on-demand help tip for the Daily Generator Toggle element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This determines whether the picker will be included in the app's daily auto-generator. When on, this picker's items will be automatically added to your todo list. When off, the picker won't run automatically, but you can still generate a pick manually from this tab.</>,
		ideStr : 'newPickerDaily',
		selStr : '[data-element-name-hook~="daiTogDiv"]',
		titStr : 'Daily Generator Toggle'


	},

	{ // What: Picker Cadence Help Item. Why: This is the on-demand help tip for the Picker Cadence element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // .cad-ctl wraps BOTH the pill row and whichever extra "which day/date" field is currently showing below it, same "one editor, styled together" shape as Today's own addReminderRepeat/.rem-editor, so one highlight over the whole thing, growing/shrinking with the selection, instead of a per-option split.


		ideStr : 'newPickerCadence',
		selStr : '[data-element-name-hook~="cadConDiv"]',
		titStr : 'Picker Cadence',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<p><b>Daily:</b> This is the picker's default cadence. It surfaces every day that it's scheduled to run, exactly like an ordinary picker.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Weekly:</b> This surfaces the picker once a week, on whichever weekday you choose below. Once picked, that item stays on your todo list until you mark it as completed, even if that takes more than one day.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Monthly:</b> This surfaces the picker once a month, on whichever day you choose below. Once picked, that item stays on your todo list until you mark it as completed, even if that takes more than one day.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Yearly:</b> This surfaces the picker once a year, on whichever date you choose below. Once picked, that item stays on your todo list until you mark it as completed, even if that takes more than one day.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


			</>


		)


	},

	{ // What: Picker Day Selection Help Item. Why: This is the on-demand help tip for the Picker Day Selection element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // :has() on the schRowDiv hook distinguishes this from the OTHER schBloDiv (CadConCom's own wrapper), which shares the same hook.


		bodEle : <>This lets you choose which days of the week this picker is allowed to run on. Tap a day to toggle it on or off, or use the Every day/Weekdays/Weekends presets to quickly set a common pattern.</>,
		ideStr : 'newPickerWhichDays',
		selStr : '[data-element-name-hook~="schBloDiv"]:has([data-element-name-hook~="schRowDiv"])',
		titStr : 'Picker Day Selection'


	},

	{ // What: Picker Holidays Toggle Help Item. Why: This is the on-demand help tip for the Picker Holidays Toggle element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // :has(#np-skiphol) distinguishes this from the OTHER schTogDiv just below it (Picker Duplicate Items Toggle), both share the same hook.


		bodEle : <>This determines whether this picker skips major U.S. holidays. When on, this picker won't run on those days. You can edit which days count as holidays, or add your own, in Settings.</>,
		ideStr : 'newPickerSkipHolidays',
		selStr : '[data-element-name-hook~="schTogDiv"]:has(#np-skiphol)',
		titStr : 'Picker Holidays Toggle'


	},

	{ // What: Picker Duplicate Items Toggle Help Item. Why: This is the on-demand help tip for the Picker Duplicate Items Toggle element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This determines whether the picker is allowed to choose an item when another item with the same name already exists elsewhere in the generated daily todo list. If all items are ineligible due to duplication, then this setting is ignored and an item is chosen normally.</>,
		ideStr : 'newPickerAvoidDuplicates',
		selStr : '[data-element-name-hook~="schTogDiv"]:has(#np-avoiddupes)',
		titStr : 'Picker Duplicate Items Toggle'


	},

	{ // What: Picker Form Status Help Item. Why: This is the on-demand help tip for the Picker Form Status element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // The detFooDiv hook scopes this to Step 1 specifically, Step 2's own footer (see newPickerItemsFooterNote below) is iteFooDiv, so without it both steps' fooNotDiv would match the same selector and only one entry could ever win.


		bodEle : <>This area lets you know if anything still needs to be filled out before you can advance to the next step, or confirms that you're ready to move on.</>,
		ideStr : 'newPickerFooterNote',
		selStr : '[data-element-name-hook~="detFooDiv"] [data-element-name-hook~="fooNotDiv"]',
		titStr : 'Picker Form Status'


	},

	{ // What: Cancel / Add Items Help Item. Why: This is the on-demand help tip for the Cancel / Add Items element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		ideStr : 'newPickerFooterActions',
		selStr : '[data-element-name-hook~="detFooDiv"] [data-element-name-hook~="forActDiv"] button',
		titStr : 'Cancel / Add Items',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<p><b>Cancel:</b> This button discards the picker form without saving anything.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Add Items:</b> This button advances to the next step, where you'll build this picker's item pool. Stays disabled until at least a name and group are set.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


			</>


		)


	},

	// #endregion Create A Picker Form Step 1



	// #region Create A Picker Form Step 2

	{ // What: Add Items Form Status Help Item. Why: This is the on-demand help tip for the Add Items Form Status element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // The iteFooDiv hook, see newPickerFooterNote's own comment.


		bodEle : <>This area lets you know if anything still needs to be filled out before you can submit the form, or confirms that the picker is ready to be created.</>,
		ideStr : 'newPickerItemsFooterNote',
		selStr : '[data-element-name-hook~="iteFooDiv"] [data-element-name-hook~="fooNotDiv"]',
		titStr : 'Add Items Form Status'


	},

	{ // What: Back / Create Picker Help Item. Why: This is the on-demand help tip for the Back / Create Picker element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		ideStr : 'newPickerItemsFooterActions',
		selStr : '[data-element-name-hook~="iteFooDiv"] [data-element-name-hook~="forActDiv"] button',
		titStr : 'Back / Create Picker',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<p><b>Back:</b> This button will take you back to the first part of the form, allowing you to adjust the picker's settings.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Create Picker:</b> This button will create the new picker. Stays disabled until at least 2 items are created.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


			</>


		)


	},

	// #endregion Create A Picker Form Step 2


];



const SET_HEL_ARR = [ // What: Settings Help Array. Why: This is the on-demand help catalog for the Settings tab, one entry per distinct piece of functionality on that page rather than one per DOM element. How: This is imported by tab-settings.jsx and passed to HelOveCom as its own helIteArr prop.


	// #region Settings Header

	{ // What: Home Link Help Item. Why: This is the on-demand help tip for the Home Link element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>You can click this logo at any time to navigate back to the home page of the app, the Today page.</>,
		ideStr : 'brandMark',
		selStr : '[data-element-name-hook~="heaLeaDiv"] [data-element-name-hook~="braMarBut"]',
		titStr : 'Home Link'


	},

	{ // What: Sections Navigation Help Item. Why: This is the on-demand help tip for the Sections Navigation element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // Section rail, on mobile this collapses into a horizontal sticky pill bar pinned above the sections (see .settings-rail's own @container rule in tab-settings.module.css); on desktop it's a vertical sidebar. One combined highlight over the whole rail rather than per-button, matching the nav bar's own precedent.


		bodEle    : <>This will let you jump straight to any section of the Settings page. On mobile devices, this will stay pinned to the top of the page no matter how far down you have scrolled.</>,
		ideStr    : 'settingsRail',
		padYcoNum : 0, // padYcoNum:0, on narrow viewports this is sticky (position:sticky; top:0) with its own opaque background; the default pad extended the mask cutout past the rail's own real bottom edge, revealing whatever page content had scrolled underneath it in that gap (nothing there covers it, the dim overlay sits above the rail's own z-index:18, and the cutout hole doesn't care that the rail's own box doesn't reach that far).
		selStr    : '[data-element-name-hook~="setRaiAsi"]',
		titStr    : 'Sections Navigation'


	},

	// #endregion Settings Header



	// #region Appearance

	{ // What: System Theme Preference Help Item. Why: This is the on-demand help tip for the System Theme Preference element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>When on, the app follows your system's own light/dark setting and automatically switches between your chosen light and dark themes (e.g. Ink &rarr; Night) whenever your system does. When off, only your manually selected theme below applies.</>,
		ideStr : 'appearanceSystemPref',
		selStr : '[data-element-name-hook~="setAppSec"] [data-element-name-hook~="setRowDiv"]:has(button[aria-label="System preference"])',
		titStr : 'System Theme Preference'


	},

	{ // What: Light Theme Help Item. Why: This is the on-demand help tip for the Light Theme element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This is where you choose the theme that's used when the app is in light mode. Pick any of the presets, or use the Custom row to mix your own colors. Custom themes will automatically generate a matching dark theme, which you're then free to edit separately.</>,
		ideStr : 'appearanceThemeLight',
		selStr : '[data-element-name-hook~="theLigDiv"]',
		titStr : 'Light Theme'


	},

	// padYcoNum:4 (not the default 8), consecutive .set-subsection blocks have a real but modest 12px gap (.set-section's own flex gap), and 8+8 exceeds that by 4px; 4+4 stays safely inside it.
	{ // What: Dark Theme Help Item. Why: This is the on-demand help tip for the Dark Theme element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This is where you choose the theme that's used when the app is in dark mode. Pick any of the presets, or use the Custom row to mix your own colors. Custom themes will automatically generate a matching light theme, which you're then free to edit separately.</>,
		ideStr    : 'appearanceThemeDark',
		padYcoNum : 4,
		selStr    : '[data-element-name-hook~="theDarDiv"]',
		titStr    : 'Dark Theme'


	},

	{ // What: Completion Celebration Help Item. Why: This is the on-demand help tip for the Completion Celebration element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This is where you choose which animation plays in the Today page when every item in your todo list is marked as done. Use Preview to watch any of them play out before picking one.</>,
		ideStr    : 'appearanceCelebration',
		padYcoNum : 4,
		selStr    : '[data-element-name-hook~="celStyDiv"]',
		titStr    : 'Completion Celebration'


	},

	{ // What: Picker Animation Help Item. Why: This is the on-demand help tip for the Picker Animation element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This is where you choose which animation plays in the Pickers tab when the manual picker functionality is triggered via the "Pick One" button. Use Preview to watch any of them play out before picking one.</>,
		ideStr    : 'appearancePickAnim',
		padYcoNum : 4,
		selStr    : '[data-element-name-hook~="picAniDiv"]',
		titStr    : 'Picker Animation'


	},

	{ // What: Tab Bar Placement Help Item. Why: This is the on-demand help tip for the Tab Bar Placement element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This controls where the app's main navigation is positioned on screen: a floating bar at the bottom, a sidebar on the left, or a bar along the top.</>,
		ideStr    : 'appearanceLayout',
		padYcoNum : 4,
		selStr    : '[data-element-name-hook~="setLayDiv"]',
		titStr    : 'Tab Bar Placement'


	},

	// #endregion Appearance



	// #region Daily Generator

	// padYcoNum:0 on all three below, .set-data-row rows have no margin between them, just their own padding + a border-bottom (Card is a plain div, not a flex/grid gap container), so they touch with zero gap.
	{ // What: Run Generator Automatically Help Item. Why: This is the on-demand help tip for the Run Generator Automatically element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This toggles whether the Daily generator runs on its own each day. When off, you'll need to run it manually using the Regenerate button at the bottom of the Today page.</>,
		ideStr    : 'dailyAutoToggle',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="setDaiSec"] [data-element-name-hook~="setRowDiv"]:has(button[aria-label="Run the Daily generator automatically"])',
		titStr    : 'Run Generator Automatically'


	},

	{ // What: Run Generator Time Help Item. Why: This is the on-demand help tip for the Run Generator Time element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This sets what time of day the Daily generator runs automatically. A quiet, early hour works best so your list is ready first thing in the morning.</>,
		ideStr    : 'dailyRunTime',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="setDaiSec"] [data-element-name-hook~="runTimDiv"]',
		titStr    : 'Run Generator Time'


	},

	{ // What: Run Generator Notification Help Item. Why: This is the on-demand help tip for the Run Generator Notification element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This lets you get a notification once your todo list has been generated for the day. This is the only notification the app will ever send and only once a day. It only works while the app is open in a tab or window, but always push notifications are coming in a future release.</>,
		ideStr    : 'dailyNotify',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="notRowDiv"]',
		titStr    : 'Run Generator Notification'


	},

	// #endregion Daily Generator



	// #region Holidays

	// padYcoNum:4, .holiday-add has a real but modest 14px margin-top from .holiday-list above it, and default 8+8 pad exceeds that by 2px.
	{ // What: Edit Observed Holidays Help Item. Why: This is the on-demand help tip for the Edit Observed Holidays element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This lists every computed holiday for the current year. Toggle any of them off if you don't observe it, any picker set to "Skip on holidays" will respect these settings.</>,
		ideStr    : 'holidayList',
		padYcoNum : 4,
		selStr    : '[data-element-name-hook~="holLisUno"]',
		titStr    : 'Edit Observed Holidays'


	},

	{ // What: Add Custom Holiday Help Item. Why: This is the on-demand help tip for the Add Custom Holiday element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This lets you add your own custom holiday, like a birthday or anniversary, which pickers will respect if their "Skip on holidays" toggle is turned on.</>,
		ideStr    : 'holidayAdd',
		padYcoNum : 4,
		selStr    : '[data-element-name-hook~="holAddDiv"]',
		titStr    : 'Add Custom Holiday'


	},

	// #endregion Holidays



	// #region Data Control

	// padYcoNum:0 on the whole group below, same zero-gap .set-data-row stacking as Daily generator above.
	{ // What: Protect Your Data Help Item. Why: This is the on-demand help tip for the Protect Your Data element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This shows how your data is currently being stored, whether the browser has promised not to clear it, and roughly how much data you are storing in the app. Installing the app or granting persistent storage both help protect it from being cleared automatically.</>,
		ideStr    : 'dataStorageStatus',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="stoRowDiv"]',
		titStr    : 'Protect Your Data'


	},

	{ // What: Install Instructions Help Item. Why: This is the on-demand help tip for the Install Instructions element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // Exactly one of these four mutually-exclusive rows ever renders at a time (already installed / can't install here / iOS Add to Home Screen / Mac Add to Dock, see tab-settings.jsx), all sharing this one class, so this covers whichever is actually showing.


		bodEle    : <>This shows device and browser specific information about how to install the app. Installing the app has many benefits, but you can always keep using the app as a website if you prefer.</>,
		ideStr    : 'dataInstallInstructions',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="insRowDiv"]',
		titStr    : 'Install Instructions'


	},

	{ // What: Export Your Data Help Item. Why: This is the on-demand help tip for the Export Your Data element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This downloads a file containing all of your data: pickers, items, reminders, history and app settings. Since all app data lives on your device, you alone are responsible for taking care of it. It is also handy for moving your data to a new, or second, device.</>,
		ideStr    : 'dataExport',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="expRowDiv"]',
		titStr    : 'Export Your Data'


	},

	{ // What: Import Your Data Help Item. Why: This is the on-demand help tip for the Import Your Data element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This restores your data from a previously exported backup file. Importing a backup <b>replaces all data</b> currently stored in the app, so make sure that's what you want first.</>,
		ideStr    : 'dataImport',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="impRowDiv"]',
		titStr    : 'Import Your Data'


	},

	{ // What: Reset All Data Help Item. Why: This is the on-demand help tip for the Reset All Data element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This wipes everything and restores the app to a clean, first-run state. <b>This can't be undone</b>, so export a backup first if there's any chance you'll want this data again.</>,
		ideStr    : 'dataReset',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="resRowDiv"]',
		titStr    : 'Reset All Data'


	},

	// #endregion Data Control



	// #region Account

	{ // What: Your Account Help Item. Why: This is the on-demand help tip for the Your Account element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>Ease My Life runs entirely on this device with no account required. Syncing your data across devices is planned as a future paid feature (a one-time fee, not a subscription).</>,
		ideStr : 'account',
		selStr : '[data-element-name-hook~="setAccSec"]',
		titStr : 'Your Account'


	},

	// #endregion Account



	// #region About

	{ // What: App Info Help Item. Why: This is the on-demand help tip for the App Info element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This shows the app's current version, along with links to the creator's website and this app's source code on GitHub.</>,
		ideStr : 'aboutInfo',
		selStr : '[data-element-name-hook~="aboInfDiv"]',
		titStr : 'App Info'


	},

	{ // What: Support the Project Help Item. Why: This is the on-demand help tip for the Support the Project element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>A planned way to support development of the app directly, coming in a future release.</>,
		ideStr : 'aboutSupportProject',
		selStr : '[data-element-name-hook~="supProDiv"]',
		titStr : 'Support the Project'


	},

	{ // What: Replay the Welcome Tour Help Item. Why: This is the on-demand help tip for the Replay the Welcome Tour element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This replays the first-run walkthrough from the very beginning, including the welcome message and all of the tutorials.</>,
		ideStr : 'aboutReplayTour',
		selStr : '[data-element-name-hook~="repTouDiv"]',
		titStr : 'Replay the Welcome Tour'


	},

	{ // What: Contact Support Help Item. Why: This is the on-demand help tip for the Contact Support element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This opens a short form for sending a message directly to the developer. Your app version and browser are attached automatically, so there's no back-and-forth needed to track those down.</>,
		ideStr : 'aboutContactTrigger',
		selStr : '[data-element-name-hook~="supTriDiv"]',
		titStr : 'Contact Support'


	},

	{ // What: Support Message Help Item. Why: This is the on-demand help tip for the Support Message element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>Fill in a subject and message describing your problem or suggestion. Your app version and browser are already filled in below for reference.</>,
		ideStr : 'aboutContactForm',
		selStr : '[data-element-name-hook~="supForDiv"]',
		titStr : 'Support Message'


	},

	{ // What: Cancel / Send Help Item. Why: This is the on-demand help tip for the Cancel / Send element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		ideStr : 'aboutContactFormFoot',
		selStr : '[data-element-name-hook~="supFooDiv"]',
		titStr : 'Cancel / Send',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<p><b>Cancel:</b> This discards your message and closes the form without sending.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Send:</b> This sends your message. If it can't go through (for example, if you're offline), you'll be shown an email address to reach out to instead, and your message will be kept so you can try again.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


			</>


		)


	},

	// #endregion About



	// #region Legal

	// padYcoNum:0 on both, same zero-gap .set-data-row stacking as above.
	{ // What: Privacy Policy Help Item. Why: This is the on-demand help tip for the Privacy Policy element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This opens the Privacy Policy, which explains how your data is collected, used, and stored.</>,
		ideStr    : 'legalPrivacy',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="priRowDiv"]',
		titStr    : 'Privacy Policy'


	},

	{ // What: Terms of Service Help Item. Why: This is the on-demand help tip for the Terms of Service element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This opens the Terms of Service, which covers the rules for using Ease My Life, including any paid features.</>,
		ideStr    : 'legalTerms',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="terRowDiv"]',
		titStr    : 'Terms of Service'


	},

	// #endregion Legal


];



const STA_HEL_ARR = [ // What: Stats Help Array. Why: This is the on-demand help catalog for the Stats tab, one entry per distinct piece of functionality on that page rather than one per DOM element. How: This is imported by tab-stats.jsx and passed to HelOveCom as its own helIteArr prop.


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

	// Three different card sets share the same position (between the Range filter and the heatmap/breakdown below), one per scope: All/a specific picker, Reminders, and Conditionals. Each card needed its own stat-mk-* marker class in tab-stats.jsx first, since they all otherwise share the plain .stat-card class with nothing to distinguish one from another. // padXcoNum/padYcoNum: 4, these 4 cards sit in a CSS grid with only a 10px gap (both row-gap and column-gap, since it's a single `gap: 10px` on .stat-row), so the default 8px pad on each side would overlap a neighbor's own pad by 6px, on whichever edge is shared (right/left in the desktop single-row layout, all four edges in the mobile 2x2 grid). 4+4=8 leaves 2px of daylight in the 10px gap instead. // All and a specific picker scope both render these same stat-mk-* cards (see tab-stats.jsx's own comment on stat-mk-scope-*), so each gets its own entry below scoped to stat-mk-scope-all/-picker, with its own title/copy.
	{ // What: Day Streak Help Item. Why: This is the on-demand help tip for the Day Streak element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This shows your current streak of consecutive days where you've completed all items in your todo list.</>,
		ideStr    : 'statStreak',
		padXcoNum : 4,
		padYcoNum : 4,
		selStr    : '[data-element-name-hook~="staStrDiv"]:not([data-picker-scope-active])',
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
		selStr    : '[data-element-name-hook~="staStrDiv"][data-picker-scope-active]',
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

	// padXcoNum/padYcoNum: 4, same .stat-row (10px gap) bleed fix as the other headline-card rows: default 8px pad on each side overlaps a neighbor's own pad across the shared edge, side by side on wide viewports and 2x2 on narrow ones.
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

	// padXcoNum/padYcoNum: 4, same .stat-row (10px gap) bleed fix as the other headline-card rows: default 8px pad on each side overlaps a neighbor's own pad across the shared edge, side by side on wide viewports and 2x2 on narrow ones.
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
		padYcoNum : 2, // padYcoNum: 2, the mode pill sits only 4px below, a little tighter than the Pickers page's 6px (see .stat-picker-id's own --pill-margin-top in tab-stats.module.css); the default 8px pad on each side would overlap by 12px otherwise.
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


	},

	// #endregion Single-Picker Scope Only


];



const TOD_HEL_ARR = [ // What: Today Help Array. Why: This is the on-demand help catalog for the Today tab, one entry per distinct piece of functionality on that page rather than one per DOM element. How: This is imported by tab-today.jsx and passed to HelOveCom as its own helIteArr prop, prepended there with the shared nav/rail items every page gets.


	// #region Today Header

	{ // What: Progress Ring Help Item. Why: This is the on-demand help tip for the Progress Ring element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This tracks your current progress of completed / total tasks for today's todo list. Once filled completely, your Day Streak will increase and the celebration animations will play.</>,
		ideStr : 'progressRing',
		selStr : '[data-element-name-hook~="proRinDiv"]',
		shaStr : 'circle',
		titStr : 'Progress Ring'


	},

	{ // What: Home Link Help Item. Why: This is the on-demand help tip for the Home Link element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>You can click this logo at any time to navigate back to the home page of the app, the Today page.</>,
		ideStr : 'brandMark',
		selStr : '[data-element-name-hook~="heaLeaDiv"] [data-element-name-hook~="braMarBut"]',
		titStr : 'Home Link'


	},

	{ // What: Day Streak Help Item. Why: This is the on-demand help tip for the Day Streak element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This counts how many days in a row you've completed everything on your todo list. Missing a day resets it back to zero.</>,
		ideStr : 'streak',
		selStr : '[data-element-name-hook~="todStrDiv"]',
		titStr : 'Day Streak'


	},

	{ // What: List Navigation Help Item. Why: This is the on-demand help tip for the List Navigation element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This is the todo list's navigation, allowing you to jump directly to a group's section. Over time your list can grow quite long and this helps to eliminate any long scrolling.</>,
		ideStr : 'groupsNav',
		selStr : '[data-element-name-hook~="groRaiAsi"] ul',
		titStr : 'List Navigation'


	},

	// #endregion Today Header



	// #region Edit Mode

	{ // What: Edit Mode Help Item. Why: This is the on-demand help tip for the Edit Mode element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		ideStr    : 'editMode',
		padXcoNum : 4, // padXcoNum: 4 exists because .foot-editmode sits right next to .ob-generate (Regenerate) with only a 10px gap between them, and the default 8px pad on each side would overlap by 6px.
		selStr    : '[data-element-name-hook~="ediRaiBut"], [data-element-name-hook~="fooEdiBut"]',

		titStr : () => document.querySelector( '[data-element-name-hook~="ediRaiBut"]' )?.hasAttribute( 'data-edit-mode-active' ) ? 'Done Button' : 'Edit Mode', // title/body are functions (see help/tooltip.jsx's HelTipCom for this pattern, e.g. the Charge Controls items) because .em-rail-btn is the SAME button throughout, relabeled "Done" once Edit Mode is on rather than being swapped for a different element, so a static "Edit Mode" tip would otherwise keep showing even after the button (and its real behavior) had already become Done; .foot-editmode only ever matches while NOT editing (it unmounts entirely once editMode is true, see the editmode-foot-actions item below for what replaces it), so reading .em-rail-btn's own is-on class here correctly reflects either case regardless of which of the two elements actually got matched.

		bodEle : () => document.querySelector( '[data-element-name-hook~="ediRaiBut"]' )?.hasAttribute( 'data-edit-mode-active' ) // title/body are functions (see help/tooltip.jsx's HelTipCom for this pattern, e.g. the Charge Controls items) because .em-rail-btn is the SAME button throughout, relabeled "Done" once Edit Mode is on rather than being swapped for a different element, so a static "Edit Mode" tip would otherwise keep showing even after the button (and its real behavior) had already become Done; .foot-editmode only ever matches while NOT editing (it unmounts entirely once editMode is true, see the editmode-foot-actions item below for what replaces it), so reading .em-rail-btn's own is-on class here correctly reflects either case regardless of which of the two elements actually got matched.
			? <>This button saves any edits that you have made and exits Edit Mode.</> // What: Done Body Branch. Why: With Edit Mode on, this same button saves and exits instead. How: This renders the Done copy.
			: <>This lets you rearrange the positions of the groups and items, as well as rename the groups.</> // What: Edit Mode Body Branch. Why: With Edit Mode off, this button opens it. How: This renders the Edit Mode copy.


	},

	// .editmode-banner-actions is the Cancel/Done pair in Edit Mode's own sticky banner. .editmode-foot-actions (tab-today.jsx) is the identical pair repeated in the footer, distinguished from the OTHER (non-editing) footer actions row that shares .today-foot-actions with it, finTarFun's comma syntax is fallback-only (see groupNameEdit's own comment in this file for why that distinction matters), so this needs its own class rather than reusing the shared one, and can't be combined with editmode-banner-actions into one selStr either, for the same reason (both are always present together while Edit Mode is on, so the first one found would always win).
	{ // What: Cancel / Done Help Item. Why: This is the on-demand help tip for the Cancel / Done element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		ideStr : 'editModeBannerActions',
		selStr : '[data-element-name-hook~="ediBanSpa"]',
		titStr : 'Cancel / Done',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<p><b>Cancel:</b> This button discards any reordering or renaming edits that you have made and exits Edit Mode.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Done:</b> This button saves any edits that you have made and exits Edit Mode.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


			</>


		)


	},

	{ // What: Cancel / Done Help Item. Why: This is the on-demand help tip for the Cancel / Done element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		ideStr : 'editModeFootActions',
		selStr : '[data-element-name-hook~="ediActDiv"]',
		titStr : 'Cancel / Done',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<p><b>Cancel:</b> This button discards any reordering or renaming edits that you have made and exits Edit Mode.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Done:</b> This button saves any edits that you have made and exits Edit Mode.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


			</>


		)


	},

	// These three only exist in the DOM while Edit Mode is on, same "finTarFun returns nothing, item silently skipped" handling as the side-placement rail handle (see help/mode.jsx). mulBoo is true on all three because every group's own grip/card/name gets its own badge, since a user editing a long list could be looking at any one of them, not just the first.
	{ // What: Reorder Group Help Item. Why: This is the on-demand help tip for the Reorder Group element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>While Edit Mode is on, drag this handle to change this group's position in your todo list.</>,
		ideStr    : 'groupGrip',
		mulBoo    : true,
		padXcoNum : 1, // padXcoNum: 1 exists because .group-grip and .group-name--editable sit only 4px apart in practice (the negative margin on .group-grip eats into .group-h-l's own 10px gap); the default 8px pad on each side, and even editMode's own padXcoNum:4 fix above, both still overlap here, so 1px each side leaves 2px of real clearance instead.
		selStr    : '[data-element-name-hook~="groGriSpa"]',
		titStr    : 'Reorder Group'


	},

	{ // What: Reorder Item Help Item. Why: This is the on-demand help tip for the Reorder Item element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>While Edit Mode is on, drag this handle to change this item's position within its group.</>,
		ideStr : 'cardGrip',
		mulBoo : true,
		selStr : '[data-element-name-hook~="carGriSpa"]',
		titStr : 'Reorder Item'


	},

	{ // What: Rename Group Help Item. Why: This is the on-demand help tip for the Rename Group element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // .group-name-slot is a shared class on BOTH the button (idle) and the input (mid-edit), finTarFun's comma syntax is fallback-only (try the first selector, only try the next if it matched NOTHING at all), not a union, so '.group-name--editable, .group-name-input' silently dropped whichever group was actively being edited the moment any OTHER group's plain button still matched. One stable class sidesteps that entirely: clicking a name to rename it used to make this exact highlight vanish and leave the now-visible input hidden behind the dimmer, right when a user is actually interacting with it.


		bodEle    : <>While Edit Mode is on, click a group's name to rename it.</>,
		ideStr    : 'groupNameEdit',
		mulBoo    : true,
		padXcoNum : 1,
		selStr    : ':is([data-element-name-hook~="groNamBut"], [data-element-name-hook~="groNamInp"])',
		titStr    : 'Rename Group'


	},

	// #endregion Edit Mode



	// #region Card Actions

	{ // What: Mark Complete Help Item. Why: This is the on-demand help tip for the Mark Complete element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		ideStr : 'cardCheck',
		mulBoo : true, // mulBoo is true because every real entry card gets its own badge, a user could be looking at any card on the page, not just whichever one happened to be first, and the main help toggle can be clicked from anywhere regardless of scroll position.
		selStr : '[data-element-name-hook~="todCarArt"]:not([data-element-name-hook~="tutCarArt"]) :is([data-element-name-hook~="carCheBut"], [data-element-name-hook~="carCheSpa"])',
		titStr : 'Mark Complete',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<p>When you click this circle, it marks the item as completed and updates the progress ring's completed count. When all items are completed, your Day Streak increases and the celebration animations will play.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p>For items that belong to a picker with updatable values, marking as complete will also apply updates to all of the pickers' items. Dynamic Weighted items wil have their boost value increased or reset to 0. Ease Up and Ease Down items will have their charge values increased or decreased, respectively.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


			</>


		)


	},

	// Reminders and picker-generated entries share the same .today-card-actions markup but not the same buttons (reminders have no Re-Roll, there's nothing to re-roll TO, it's a fixed task, not a random pick), so this needs two separate items rather than one shared description. Also excludes day-off and charging cards, both render a .today-card-actions row too, but with Re-Roll and/or Edit genuinely disabled (the app's own InfTipCom there says "This action is disabled for this type of item"), which this tip's copy doesn't describe. mulBoo is true on both because every OTHER card gets its own badge; a single shared one could land on a card whose buttons happen to be in an unusual state, or just not be near wherever the user actually scrolled to.
	{ // What: Card Actions Help Item. Why: This is the on-demand help tip for the Card Actions element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		ideStr : 'cardActionsPicker',
		mulBoo : true,
		selStr : '[data-element-name-hook~="todCarArt"]:not([data-element-name-hook~="remCarArt"]):not([data-element-name-hook~="tutCarArt"]):not([data-element-name-hook~="daoCarArt"]):not([data-element-name-hook~="chrCarArt"]) [data-element-name-hook~="carActDiv"]',
		titStr : 'Card Actions',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<div className={ cssModObj.navIteDiv }>{ /* What: Body Container Div Element. Why: This groups related lines of this help item's own explanatory copy into one visual block. How: This is rendered as-is inside the tip. */ }


					<div className={ cssModObj.navLabDiv }><IcoSvgCom icoNamStr='refEle' sizSteStr='bas' /><b>Re-Roll:</b></div>{ /* What: Body Label Div Element. Why: This pairs an icon with a bold action name inside its own group. How: This is rendered as-is inside the tip. */ }{ /* Vertical Rhythm Base ~= 14.572px */ }

					<p>This button swaps this item for a different one from the same picker, without waiting for the next generation.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


				</div>


				<div className={ cssModObj.navIteDiv }>{ /* What: Body Container Div Element. Why: This groups related lines of this help item's own explanatory copy into one visual block. How: This is rendered as-is inside the tip. */ }


					<div className={ cssModObj.navLabDiv }><IcoSvgCom icoNamStr='skiEle' sizSteStr='bas' /><b>Skip:</b></div>{ /* What: Body Label Div Element. Why: This pairs an icon with a bold action name inside its own group. How: This is rendered as-is inside the tip. */ }{ /* Vertical Rhythm Base ~= 14.572px */ }

					<p>This button removes this item from your todo list without completing it and updates the progress ring's total count accordingly.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


				</div>


				<div className={ cssModObj.navIteDiv }>{ /* What: Body Container Div Element. Why: This groups related lines of this help item's own explanatory copy into one visual block. How: This is rendered as-is inside the tip. */ }


					<div className={ cssModObj.navLabDiv }><IcoSvgCom icoNamStr='ediEle' sizSteStr='bas' /><b>Edit:</b></div>{ /* What: Body Label Div Element. Why: This pairs an icon with a bold action name inside its own group. How: This is rendered as-is inside the tip. */ }{ /* Vertical Rhythm Base ~= 14.572px */ }

					<p>This button adjusts this item's properties. That includes its name, schedule (reminders only), values (pickers only) and active toggle (pickers only).</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


				</div>


			</>


		)


	},

	{ // What: Card Actions Help Item. Why: This is the on-demand help tip for the Card Actions element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		ideStr : 'cardActionsReminder',
		mulBoo : true,
		selStr : '[data-element-name-hook~="remCarArt"] [data-element-name-hook~="carActDiv"]',
		titStr : 'Card Actions',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<div className={ cssModObj.navIteDiv }>{ /* What: Body Container Div Element. Why: This groups related lines of this help item's own explanatory copy into one visual block. How: This is rendered as-is inside the tip. */ }


					<div className={ cssModObj.navLabDiv }><IcoSvgCom icoNamStr='skiEle' sizSteStr='bas' /><b>Skip:</b></div>{ /* What: Body Label Div Element. Why: This pairs an icon with a bold action name inside its own group. How: This is rendered as-is inside the tip. */ }{ /* Vertical Rhythm Base ~= 14.572px */ }

					<p>This button removes this item from your todo list without completing it and updates the progress ring's total count accordingly.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


				</div>


				<div className={ cssModObj.navIteDiv }>{ /* What: Body Container Div Element. Why: This groups related lines of this help item's own explanatory copy into one visual block. How: This is rendered as-is inside the tip. */ }


					<div className={ cssModObj.navLabDiv }><IcoSvgCom icoNamStr='ediEle' sizSteStr='bas' /><b>Edit:</b></div>{ /* What: Body Label Div Element. Why: This pairs an icon with a bold action name inside its own group. How: This is rendered as-is inside the tip. */ }{ /* Vertical Rhythm Base ~= 14.572px */ }

					<p>This button adjusts this item's properties. That includes its name, schedule (reminders only), values (pickers only) and active toggle (pickers only).</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


				</div>


			</>


		)


	},

	{ // What: Skip Help Item. Why: This is the on-demand help tip for the Skip element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // A day-off card (a conditional's triggered "rest" state) is excluded from cardActionsPicker above since it doesn't have the normal 3-button set, but unlike a charging card (where Re-Roll/Skip/Edit are ALL genuinely disabled, nothing real to highlight), a day-off card's own Skip IS a real, working button, only Re-Roll and Edit are disabled there. `button` (not .icon-btn generally) specifically targets that one real button, the disabled Re-Roll/Edit are InfTipCom's own <span> root, not a <button>, so this selector can't accidentally catch them.


		bodEle : <>This button removes this day off from your todo list without completing it and updates the progress ring's total count accordingly. Re-Roll and Edit are disabled for this type of card.</>,
		ideStr : 'cardActionsDayOff',
		mulBoo : true,
		selStr : '[data-element-name-hook~="daoCarArt"] [data-element-name-hook~="carActDiv"] button',
		titStr : 'Skip'


	},

	// #endregion Card Actions



	// #region Editing A Picker Item

	// This is reachable from Today's own Edit button too, not just the Data tab (DAT_HEL_ARR has its own copy of these same 6 items, scoped identically via .entry-editor, that class is shared verbatim by both tabs since it's literally the same EntEdiCom component either way). // Item Name is the one exception: Today's own name field lives right on the card (.entry-card-name-input, EntryCard's own markup), not inside .entry-editor like Data's .rowNamInp does.
	{ // What: Item Name Help Item. Why: This is the on-demand help tip for the Item Name element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This is the name field for this item, you can rename it here.</>,
		ideStr : 'itemName',
		selStr : '[data-element-name-hook~="entNamInp"]',
		titStr : 'Item Name'


	},

	{ // What: Item Charge Controls Help Item. Why: This is the on-demand help tip for the Item Charge Controls element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		ideStr    : 'itemChargeRangeUp',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="entEdiDiv"] [data-element-name-hook~="ediRowDiv"][data-ease-up-active]',
		titStr    : 'Item Charge Controls',

		bodEle : () => { // bodEle is a function (see help/tooltip.jsx's HelTipCom) that reads the picker's own cadence unit word (days/weeks/months/years) straight off the already-rendered unit label (its easUniSpa hook) instead of hardcoding "days", which would be wrong for a non-daily cadence picker.


			const uniWorStr = document.querySelector( '[data-element-name-hook~="entEdiDiv"] [data-element-name-hook~="ediRowDiv"][data-ease-up-active] [data-element-name-hook~="easUniSpa"]' )?.textContent || 'days'; // What: Unit Word String. Why: This item's own copy needs the real, currently-displayed unit label (e.g. "days"), not a hardcoded guess. How: This reads the matched row's own unit control text, falling back to 'days' if not found.



			return (


				<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


					<p><b>Soonest:</b> This controls the minimum number of { uniWorStr } that the item must wait before becoming eligible to be picked again.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

					<p><b>Latest:</b> This controls the maximum number of { uniWorStr } that the item must wait before becoming eligible to be picked again.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

					<p><b>Fill:</b> This will fill the item's charge to 100, making it eligible to be picked again.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


				</>


			);


		}


	},

	{ // What: Item Charge Controls Help Item. Why: This is the on-demand help tip for the Item Charge Controls element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		ideStr    : 'itemChargeRangeDown',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="entEdiDiv"] [data-element-name-hook~="ediRowDiv"][data-ease-down-active]',
		titStr    : 'Item Charge Controls',

		bodEle : () => { // bodEle is a function (see help/tooltip.jsx's HelTipCom) that reads the picker's own cadence unit word (days/weeks/months/years) straight off the already-rendered unit label (its easUniSpa hook) instead of hardcoding "days", which would be wrong for a non-daily cadence picker.


			const uniWorStr = document.querySelector( '[data-element-name-hook~="entEdiDiv"] [data-element-name-hook~="ediRowDiv"][data-ease-down-active] [data-element-name-hook~="easUniSpa"]' )?.textContent || 'days'; // What: Unit Word String. Why: This item's own copy needs the real, currently-displayed unit label (e.g. "days"), not a hardcoded guess. How: This reads the matched row's own unit control text, falling back to 'days' if not found.



			return (


				<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


					<p><b>Shortest:</b> This controls the minimum number of { uniWorStr } that the item must stay as the active pick, after which a new item will be picked.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

					<p><b>Longest:</b> This controls the maximum number of { uniWorStr } that the item must stay as the active pick, after which a new item will be picked.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

					<p><b>Refill:</b> This will refill the item's charge back to 100, effectively resetting its active pick cadence.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


				</>


			);


		}


	},

	{ // What: Item Weight Help Item. Why: This is the on-demand help tip for the Item Weight element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This adjusts this item's pick chance relative to the picker's other items. A higher weight makes it more likely to be picked and a lower weight makes it less likely.</>,
		ideStr    : 'itemWeight',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="entEdiDiv"] [data-element-name-hook~="ediRowDiv"]:has([data-element-name-hook~="weiSteDiv"])',
		titStr    : 'Item Weight'


	},

	{ // What: Item Boost Help Item. Why: This is the on-demand help tip for the Item Boost element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This is the item's current boost, which climbs by 1 each time it isn't picked and resets to 0 the next time it is. A higher boost makes it more likely to be picked.</>,
		ideStr    : 'itemBoost',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="entEdiDiv"] [data-element-name-hook~="ediRowDiv"]:has([data-element-name-hook~="booValSpa"])',
		titStr    : 'Item Boost'


	},

	{ // What: Item Active Toggle Help Item. Why: This is the on-demand help tip for the Item Active Toggle element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This toggles whether this item is eligible to be picked. Turning it off marks the item inactive, removing it from the picker's pool until it's turned back on.</>,
		ideStr    : 'itemActive',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="entEdiDiv"] [data-element-name-hook~="ediRowDiv"]:has([data-element-name-hook~="togSwiBut"])',
		titStr    : 'Item Active Toggle'


	},

	{ // What: Delete / Cancel / Save Help Item. Why: This is the on-demand help tip for the Delete / Cancel / Save element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // selStr targets .rem-inline-foot (the shared wrapper), not .rd-edit-foot specifically, Delete swaps that sibling out for .rem-foot-confirm (its own Cancel/Delete pair), which a selector scoped to .rd-edit-foot would miss entirely once that swap happens: no dim-mask hole, AND the click-guard would treat its buttons as off-target and block them, making the confirmation genuinely unreachable while help mode is on.


		ideStr : 'itemFoot',
		selStr : '[data-element-name-hook~="entEdiDiv"] [data-element-name-hook~="ediFooDiv"] button',
		titStr : 'Delete / Cancel / Save',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<p><b>Delete:</b> This button permanently deletes this item, after asking you to confirm.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Cancel:</b> This button discards any changes and closes this editor without saving.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Save:</b> This button saves your changes to this item.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


			</>


		)


	},

	// #endregion Editing A Picker Item



	// #region Add A Reminder

	{ // What: Add a Reminder Help Item. Why: This is the on-demand help tip for the Add a Reminder element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This creates a new one-time or recurring reminder. Reminders are separate from pickers since some tasks cannot be randomly chosen and must be done on a schedule (recurring reminder) or are a one-time thing (one-time reminder).</>,
		ideStr : 'addReminder',
		selStr : ':is([data-element-name-hook~="remAddBut"], [data-element-name-hook~="remAddSpa"])',
		titStr : 'Add a Reminder'


	},

	{ // What: Reminder Name Help Item. Why: This is the on-demand help tip for the Reminder Name element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // Scoped to .rem-quickadd specifically, NOT the wider .rem-quickadd-wrap, .np-input is reused by the Repeat editor's own extra fields (the Every N Days number input, the Monthly/Yearly selects), so the wider scope was unioning the name field with whichever of those happened to be visible, stretching this highlight down into the Repeat section.


		bodEle : <>This is the name field for your new reminder, give it a short, descriptive name. This is what will show up on your todo list.</>,
		ideStr : 'addReminderName',
		selStr : '[data-element-name-hook~="remFieDiv"] [data-element-name-hook~="addNamInp"]',
		titStr : 'Reminder Name'


	},

	{ // What: Reminder Schedule Help Item. Why: This is the on-demand help tip for the Reminder Schedule element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // .rem-editor (not just .seg, the pill row) so this always covers whatever extra fields the current selection reveals below the pills (the weekday chips for Weekly, the day/date pickers for the others), every option's own extra fields, not just whichever ones happened to share a class with the Reminder Name field above. No pinBelowSel here (unlike a first attempt at this), the highlighted rect IS .rem-editor itself, so the tip's normal "below the target" placement already tracks its own bottom edge as it grows/shrinks with the selection, without needing to pin to some other, unrelated element.


		ideStr : 'addReminderRepeat',
		scrBoo : true, // scrBoo is true because the body now covers 5 schedule kinds including the every-N/weekday recurrence wording, tall enough to overlap the Repeat control/highlight on a short viewport without it; caps to whichever side (above/below) plaTipFun finds more room and scrolls internally there instead of overflowing into the target either way.
		selStr : '[data-element-name-hook~="remAddDiv"] [data-element-name-hook~="schEdiDiv"]',
		titStr : 'Reminder Schedule',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<p><b>Once:</b> This reminder stays on your todo list every day until you complete it, then it's gone for good.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>N Days:</b> This reminder will show up on your todo list every N days, counted from the start date that you select below.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Weekly:</b> This reminder will show up on your todo list every N week(s) on the days that you select below.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Monthly:</b> This reminder will show up on your todo list every N month(s) on the day or weekday that you select below.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Yearly:</b> This reminder will show up on your todo list every N year(s) on the date or weekday that you select below.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


			</>


		)


	},

	{ // What: Cancel / Add Help Item. Why: This is the on-demand help tip for the Cancel / Add element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // .btn, not the .rem-inline-foot row itself, that row is right-aligned/space-between and wider than its own buttons, which left a big empty gap included in the highlight.


		ideStr : 'addReminderFoot',
		selStr : '[data-element-name-hook~="remAddDiv"] [data-element-name-hook~="ediFooDiv"] button',
		titStr : 'Cancel / Add',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<p><b>Cancel:</b> This button discards the reminder form without saving anything.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Add:</b> This button saves the reminder and adds it to your todo list, unless you selected a recurring reminder that is not due today. Stays disabled until at least a name is entered.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


			</>


		)


	},

	// #endregion Add A Reminder



	// #region Editing An Existing Reminder

	// ReminderCard's name input + the ReminderInlineEdit/ReminderEditFoot pair it expands into, same underlying editor as Add a Reminder above, so these reuse its exact copy where the content is identical (name field, repeat schedule). The only real difference: Save replaces Add (no "stays disabled" caveat, Save has no disabled state, unlike Add), and there's a Delete button Add's form doesn't have.
	{ // What: Reminder Name Help Item. Why: This is the on-demand help tip for the Reminder Name element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This is the name field for your reminder, give it a short, descriptive name. This is what will show up on your todo list.</>,
		ideStr : 'editReminderName',
		selStr : '[data-element-name-hook~="remNamInp"]',
		titStr : 'Reminder Name'


	},

	{ // What: Reminder Schedule Help Item. Why: This is the on-demand help tip for the Reminder Schedule element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // .rem-inline-editor is shared markup used by THREE different editors: the Add Reminder quick-add form, an existing reminder's own editor (this item), AND a picker item's EntEdiCom (tab-today.jsx). The picker-item case is excluded via :not(.entry-editor) (its root carries that extra class), but :not(.rem-quickadd-wrap *) is ALSO required: .rem-quickadd-wrap merely WRAPS its own .rem-inline-editor, it doesn't stop the bare :not(.entry-editor) check from still matching that inner element too, which produced two overlapping "Reminder Schedule" badges at once whenever the Add Reminder form was open (found via live testing, addReminderRepeat's own comment above claiming this was "already covered, doesn't conflict" was wrong).


		ideStr : 'editReminderRepeat',
		scrBoo : true, // scrBoo is true here too, same reasoning as addReminderRepeat above.
		selStr : '[data-element-name-hook~="inlEdiDiv"]:not([data-element-name-hook~="remAddDiv"] *) [data-element-name-hook~="schEdiDiv"]',
		titStr : 'Reminder Schedule',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<p><b>Once:</b> This reminder stays on your todo list every day until you complete it, then it's gone for good.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>N Days:</b> This reminder will show up on your todo list every N days, counted from the start date that you select below.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Weekly:</b> This reminder will show up on your todo list every N week(s) on the days that you select below.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Monthly:</b> This reminder will show up on your todo list every N month(s) on the day or weekday that you select below.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Yearly:</b> This reminder will show up on your todo list every N year(s) on the date or weekday that you select below.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


			</>


		)


	},

	{ // What: Delete / Cancel / Save Help Item. Why: This is the on-demand help tip for the Delete / Cancel / Save element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // BUG FIXED HERE: this used to be the unscoped '.rd-edit-foot .btn', which, since .rd-edit-foot is the SAME class a picker item's own EntEdiCom footer uses, was ALSO matching that footer on the Today tab, showing this reminder-specific copy ("this reminder...") on a picker item's Delete/Cancel/Save instead of itemFoot's own "this item..." copy just below. .rem-inline-editor:not(.entry-editor) (see editReminderRepeat's own comment) properly scopes this to an actual reminder's editor. selStr targets .rem-inline-foot (the shared wrapper), not .rd-edit-foot specifically, Delete's own confirm prompt swaps in a DIFFERENT sibling class (.rem-foot-confirm), which a selector scoped to .rd-edit-foot would miss entirely: no dim-mask hole, AND the click-guard would treat its Cancel/Delete buttons as off-target and block them, making the confirmation genuinely unreachable while help mode is on, this was wrongly assumed harmless ("gracefully has nothing to highlight") until the user found it actually blocks the click too, not just the highlight. // :not(.rem-quickadd-wrap *) is also needed since the Add Reminder quickadd form (Today only) uses this exact same .rem-inline-editor > .rem-inline-foot structure for its own Cancel/Add buttons (no rd-edit-foot/rem-foot-confirm distinction there, since a brand-new draft has nothing to delete yet); widening from .rd-edit-foot to the shared .rem-inline-foot wrapper (see the comment above) would otherwise ALSO match those, duplicating this badge the same way editReminderRepeat's own selector once did.


		ideStr : 'editReminderFoot',
		selStr : '[data-element-name-hook~="inlEdiDiv"]:not([data-element-name-hook~="remAddDiv"] *) [data-element-name-hook~="ediFooDiv"] button',
		titStr : 'Delete / Cancel / Save',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<p><b>Delete:</b> This button permanently deletes this reminder, after asking you to confirm.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Cancel:</b> This button discards any changes and closes this editor without saving.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Save:</b> This button saves your changes to this reminder and updates it on your todo list.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


			</>


		)


	},

	// #endregion Editing An Existing Reminder



	// #region Footer Actions

	{ // What: Section Log Help Item. Why: This is the on-demand help tip for the Section Log element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This opens a log of everything that has happened for this section today. Including what was auto-picked, skipped, manually selected, re-rolled, and completed. It will also show the new updated values, if applicable, once an item has been marked as completed.</>,
		ideStr : 'dayLog',
		selStr : '[data-element-name-hook~="remGroSec"] [data-element-name-hook~="logChiBut"]',
		titStr : 'Section Log'


	},

	{ // What: Section Log Help Item. Why: This is the on-demand help tip for the Section Log element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // Every OTHER group section (Chores, Food, ...) gets the same Log chip as Reminders, :not(.rem-section):not(.pt-section) excludes Reminders itself (already covered above) and the Page Tours onboarding section.


		bodEle : <>This opens a log of everything that has happened for this section today. Including what was auto-picked, skipped, manually selected, re-rolled, and completed. It will also show the new updated values, if applicable, once an item has been marked as completed.</>,
		ideStr : 'dayLogPicker',
		mulBoo : true, // mulBoo is true (see help/mode.jsx) so each group's OWN Log button gets its own badge, since the user could be scrolled to any one of them.
		selStr : '[data-element-name-hook~="todGroSec"]:not([data-element-name-hook~="remGroSec"]):not([data-element-name-hook~="pagTouSec"]) [data-element-name-hook~="logChiBut"]',
		titStr : 'Section Log'


	},

	{ // What: Regenerate Help Item. Why: This is the on-demand help tip for the Regenerate element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This re-runs the daily generator manually, replacing your todo list. Anything already marked complete will be replaced too and won't show up in the Stats tab.</>,
		ideStr    : 'regenerate',
		padXcoNum : 4, // padXcoNum: 4, see editMode's own comment; same gap, same fix, symmetric.
		selStr    : ':is([data-element-name-hook~="genLisBut"], [data-element-name-hook~="genLisSpa"])',
		titStr    : 'Regenerate'


	},

	// #endregion Footer Actions



	// #region Reminders Log Panel

	// day-log.jsx's RemLogCom, each column's header cell and data cells share one data-element-name-hook value, so one selector highlights the whole column without the header borrowing the data rows' font styling.
	{ // What: Reminder Column Help Item. Why: This is the on-demand help tip for the Reminder Column element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This lists every reminder you've created, whether it's due today or not.</>,
		groStr : 'reminderLogCols', // groStr (see help/mode.jsx) makes the 3 highlights meet edge-to-edge with no gap or overlap between them, rather than each shrinking to its own content.
		ideStr : 'logReminderName',
		selStr : '[data-element-name-hook~="remNamSpa"]',
		titStr : 'Reminder Column'


	},

	{ // What: When Column Help Item. Why: This is the on-demand help tip for the When Column element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This shows each reminder's schedule. That includes how often it repeats, or if it's only a one-time reminder.</>,
		groStr : 'reminderLogCols',
		ideStr : 'logReminderWhen',
		selStr : '[data-element-name-hook~="remWheSpa"]',
		titStr : 'When Column'


	},

	{ // What: Status Column Help Item. Why: This is the on-demand help tip for the Status Column element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This shows whether this reminder is done, due today, skipped for today, or when it will next come due.</>,
		groStr : 'reminderLogCols',
		ideStr : 'logReminderStatus',
		selStr : '[data-element-name-hook~="remStaSpa"]',
		titStr : 'Status Column'


	},

	// #endregion Reminders Log Panel



	// #region Picker/Conditional Log Panel

	// day-log.jsx's GroLogCom, these column hooks work the same way. Deliberately TWO separate column groups (picker item rows vs. Conditionals section rows) rather than one shared set: the Conditionals section has its own full-width "Rested: .../Attached: ..." line between rows, which a single highlight spanning BOTH sections would otherwise stretch across, making it look like that unrelated text was part of the column.
	{ // What: Key Help Item. Why: This is the on-demand help tip for the Key element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		ideStr : 'logPickerKey',
		selStr : '[data-element-name-hook~="logKeyDiv"]',
		titStr : 'Key',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<p>This explains the icons that are used in the Status column below.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Auto-picked:</b> This indicates that an item was chosen automatically by the daily generator.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Pushed:</b> This indicates that an item was pushed onto your todo list manually from the Pickers page.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Rolled off:</b> This indicates that an item was on your todo list but was then replaced by another item via the Re-Roll button.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Skipped:</b> This indicates that an item was on your todo list but was then removed via the Skip button.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Completed:</b> This indicates that the item is on your todo list and has been marked as completed.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


			</>


		)


	},

	{ // What: Item Column Help Item. Why: This is the on-demand help tip for the Item Column element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This lists every item in this picker's pool. It also shows its weight (Weighted), weight + boost (Dynamic Weighted) or eligible range (Ease Up or Ease Down), depending on the picker's mode.</>,
		groStr : 'pickerLogCols',
		ideStr : 'logPickerItem',
		selStr : '[data-element-name-hook~="logBloDiv"] [data-element-name-hook~="logIteSpa"]',
		titStr : 'Item Column'


	},

	{ // What: At Gen Column Help Item. Why: This is the on-demand help tip for the At Gen Column element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This lists the item's value at the moment your todo list was generated. This only applies to Dynamic Weighted, Ease Up and Ease Down picker items, it shows N/A otherwise.</>,
		groStr : 'pickerLogCols',
		ideStr : 'logPickerAtGen',
		selStr : '[data-element-name-hook~="logBloDiv"] [data-element-name-hook~="logGenSpa"]',
		titStr : 'At Gen Column'


	},

	{ // What: Δ Column Help Item. Why: This is the on-demand help tip for the Δ Column element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This shows how much this item's value changed since your todo list was generated. This only applies to Dynamic Weighted, Ease Up and Ease Down picker items.</>,
		groStr : 'pickerLogCols',
		ideStr : 'logPickerDelta',
		selStr : '[data-element-name-hook~="logBloDiv"] [data-element-name-hook~="logDelSpa"]',
		titStr : 'Δ Column'


	},

	{ // What: After Column Help Item. Why: This is the on-demand help tip for the After Column element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This shows the item's current value, reflecting updated values due to the current item being marked as completed in your todo list.</>,
		groStr : 'pickerLogCols',
		ideStr : 'logPickerAfter',
		selStr : '[data-element-name-hook~="logBloDiv"] [data-element-name-hook~="logAftSpa"]',
		titStr : 'After Column'


	},

	{ // What: Status Column Help Item. Why: This is the on-demand help tip for the Status Column element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This shows any relevant icons that reflect what has happened to this item today. Please see the KEY row above for what each icon means.</>,
		groStr : 'pickerLogCols',
		ideStr : 'logPickerStatus',
		selStr : '[data-element-name-hook~="logBloDiv"] [data-element-name-hook~="logStaSpa"]',
		titStr : 'Status Column'


	},

	{ // What: Conditional Column Help Item. Why: This is the on-demand help tip for the Conditional Column element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This lists every conditional attached to a picker in this group. It also shows its odds of being triggered or its charge range, depending on its mode.</>,
		groStr : 'condLogCols',
		ideStr : 'logCondItem',
		selStr : '[data-element-name-hook~="logConDiv"] [data-element-name-hook~="logIteSpa"]',
		titStr : 'Conditional Column'


	},

	{ // What: At Gen Column Help Item. Why: This is the on-demand help tip for the At Gen Column element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This lists the conditional's value at the moment your todo list was generated. This only applies to Dynamic Weighted, Ease Up and Ease Down conditionals, it shows N/A otherwise.</>,
		groStr : 'condLogCols',
		ideStr : 'logCondAtGen',
		selStr : '[data-element-name-hook~="logConDiv"] [data-element-name-hook~="logGenSpa"]',
		titStr : 'At Gen Column'


	},

	{ // What: Δ Column Help Item. Why: This is the on-demand help tip for the Δ Column element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This shows how much this conditional's value changed since your todo list was generated. This only applies to Dynamic Weighted, Ease Up and Ease Down conditionals.</>,
		groStr : 'condLogCols',
		ideStr : 'logCondDelta',
		selStr : '[data-element-name-hook~="logConDiv"] [data-element-name-hook~="logDelSpa"]',
		titStr : 'Δ Column'


	},

	{ // What: After Column Help Item. Why: This is the on-demand help tip for the After Column element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This shows the conditional's current value, reflecting any change from a dependent picker's item being marked as completed in your todo list.</>,
		groStr : 'condLogCols',
		ideStr : 'logCondAfter',
		selStr : '[data-element-name-hook~="logConDiv"] [data-element-name-hook~="logAftSpa"]',
		titStr : 'After Column'


	},

	{ // What: Status Column Help Item. Why: This is the on-demand help tip for the Status Column element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This shows whether this conditional is currently triggered (its dependent pickers are resting today) or not.</>,
		groStr : 'condLogCols',
		ideStr : 'logCondStatus',
		selStr : '[data-element-name-hook~="logConDiv"] [data-element-name-hook~="logStaSpa"]',
		titStr : 'Status Column'


	},

	// #endregion Picker/Conditional Log Panel


];

// #endregion Help Catalogs Subsystem

// #endregion Constants



// #region Exports

export { DAT_HEL_ARR, PIC_HEL_ARR, SET_HEL_ARR, STA_HEL_ARR, TOD_HEL_ARR }; // What: Named Exports. Why: Every tab file that renders its own help toggle imports its own one of these by name. How: This re-exports the 5 catalogs declared above; nothing else in this file is used outside it.

// #endregion Exports


