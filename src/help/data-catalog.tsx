


// #region Imports

import type { HelIteTyp } from './catalog-item.ts'; // What: Help Item Type. Why: Every item in this catalog shares the one shape help mode reads. How: This types DAT_HEL_ARR.

// #endregion Imports



/**
 * data-catalog.tsx = Data Catalog
 *
 * @summary
 * The on-demand help catalog for the Data tab, which help mode (see
 * help/mode.tsx) highlights and explains one item at a time.
 *
 * Copy is largely forked from onboarding/page-steps.tsx's own DAT_TAR_OBJ
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

const DAT_HEL_ARR : HelIteTyp[] = [ // What: Data Help Array. Why: This is the on-demand help catalog for the Data tab, one entry per distinct piece of functionality on that page rather than one per DOM element. How: This is imported by tab-data.tsx and passed to HelOveCom as its own helIteArr prop.


	// #region Data Header

	{ // What: Home Link Help Item. Why: This is the on-demand help tip for the Home Link element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>You can click this logo at any time to navigate back to the home page of the app, the Today page.</>,
		ideStr : 'brandMark',
		selStr : '[data-element-name-hook~="heaLeaDiv"] [data-element-name-hook~="braMarBut"]',
		titStr : 'Home Link'


	},

	// The Conditionals and Type filter rows below render the same filPilBut pills inside their own conFilDiv/typFilDiv hooks (see their own conditionalsFilter/typeFilter entries), so unscoped, this selector matched both of those rows' pills too, unioning the highlight all the way down through them.
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

	// Each conditional gets its own highlight/tooltip, not just the section as a whole. The per-type controls (Type/Weight/Odds/Boost/Charge Controls/Active) reuse the EXACT same selectors as the Pickers-page create-flow verbatim: CodConCom is the same shared component either way (this tab passes variant="inline" instead of the default 'card', but that only swaps a wrapper class neither selector touches), so there was nothing to re-derive, see PIC_HEL_ARR's own newCondName through newCondActive entries for the original comments on each of these.
	{ // What: Conditionals Help Item. Why: This is the on-demand help tip for the Conditionals element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This is where you can view and edit all of your conditionals. Tap the header to expand or collapse the section.</>,
		ideStr    : 'conditionalsManager',
		padYcoNum : 0, // padYcoNum:0, .catHeaHed has no border/gap of its own below it, but .catBodDiv (wrapping the Add button and every row) sits directly against it with only a hairline border, same zero-gap stacking as the rest of this card. The roughly 19px flex gap above the conCatSec section itself (from .tabPagDiv) easily absorbs losing the default pad on that side too.
		selStr    : '[data-element-name-hook~="conCatSec"] [data-element-name-hook~="catHeaHed"]',
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

	// Reused verbatim from PIC_HEL_ARR's newCondCardText, same CodConCom markup either way, missed when the other newCondName through newCondActive entries were copied over for this pass. // padYcoNum:0, .conConDiv--inline (the variant used here, unlike the Pickers-page card variant) has gap:0 between fields, so this bleeds into its neighbors above/below without it.
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

	{ // What: Delete / Cancel / Save Help Item. Why: This is the on-demand help tip for the Delete / Cancel / Save element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // .conEdiDiv scopes this to ConEdiCom's own footer. Delete is only rendered when !isaNewBoo (see conditionals-manager.tsx's ConEdiCom), so :has(delActBut) splits this from dataCondFootNew below rather than always mentioning Delete.


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

	{ // What: Cancel / Save Help Item. Why: This is the on-demand help tip for the Cancel / Save element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // New (unsaved) conditionals never render a Delete button, see ConEdiCom's `!isaNewBoo &&` guard, so this covers that footer state with its own Cancel/Save-only copy.


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

	// The participation-settings matrix is new content (not present anywhere else); the per-reminder row + its editor reuse Today's own editReminderRepeat/editReminderFoot verbatim, since this is the exact same .inlEdiDiv markup either way.
	{ // What: Reminders Help Item. Why: This is the on-demand help tip for the Reminders element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This is where you can view and edit all of your reminders. Tap the header to expand or collapse the section.</>,
		ideStr    : 'remindersManager',
		padYcoNum : 0, // padYcoNum:0, same .catHeaHed/.catBodDiv zero-gap stacking as conditionalsManager.
		selStr    : '[data-element-name-hook~="remCatSec"] [data-element-name-hook~="catHeaHed"]',
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
		padYcoNum : 0, // padYcoNum:0, .remMatDiv sits flush against the Controls header above and the Items header below (no .ediBodDiv padding wrapper here, unlike PicConCom), so the default pad bled 8px into both.
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

	// Reused verbatim from TOD_HEL_ARR's editReminderRepeat/editReminderFoot same .inlEdiDiv markup, and this tab has no quickadd form for that selector's own :not(.remAddDiv *) exclusion to worry about.
	{ // What: Reminder Schedule Help Item. Why: This is the on-demand help tip for the Reminder Schedule element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		ideStr    : 'dataReminderRepeat',
		padYcoNum : 0, // padYcoNum:0, unlike Today's card-based editor, this tab's .iteEdiDiv wrapper overrides .ediFooDiv's margin-top to 0 (through --edi-foo-mar in tabs/data/tab-data.module.css), so .schEdiDiv touches the footer row with zero gap.
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

	{ // What: Delete / Cancel / Save Help Item. Why: This is the on-demand help tip for the Delete / Cancel / Save element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // selStr targets .ediFooDiv (the shared wrapper), not the plain footer alone, see editReminderFoot's own comment (TOD_HEL_ARR) for why: Delete's own confirm prompt swaps in a different sibling class (.ediFooDiv--confirm), which the plain footer alone would miss, leaving its Cancel/Delete buttons genuinely unreachable (no dim-mask hole, blocked by the click-guard) while help mode is on. // Delete is only rendered when !isaNewBoo (see editor-footer.tsx's EdiFooCom), :has() on the delActBut hook splits this from dataReminderFootNew below rather than always mentioning Delete, same fix as dataCondFoot/dataCondFootNew.


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

	{ // What: Cancel / Save Help Item. Why: This is the on-demand help tip for the Cancel / Save element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // New (unsaved) reminders never render a Delete button, see EdiFooCom's `!isaNewBoo &&` guard, so this covers that footer state with its own Cancel/Save-only copy.


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

	// Each picker gets its own highlight, plus each of its own settings controls individually (PicConCom) and each of its items individually (reusing the shared item-editor entries below). Scoped via the direct .datLisDiv > .datCatSec > .catHeaHed chain since .catHeaHed is also reused by the Conditionals/Reminders managers' own outer headers (which render outside .datLisDiv entirely).
	{ // What: Picker Row Help Item. Why: This is the on-demand help tip for the Picker Row element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This is one of your pickers. Tap it to view and edit its settings and items.</>,
		ideStr    : 'pickerRow',
		labStr    : '[data-element-name-hook~="catModSpa"]',                               // labStr reads the visible .catModSpa pill (tab-data.tsx) in the header's catTagSpa cluster.
		mulBoo    : true,                                            // mulBoo is true because every picker gets its own badge.
		padYcoNum : 0,                                               // padYcoNum:0, same .catHeaHed/.catBodDiv zero-gap stacking as conditionalsManager; matters once a picker is expanded and .catBodDiv renders beneath it.
		selStr    : '[data-element-name-hook~="datLisDiv"] > [data-element-name-hook~="datCatSec"][data-picker-row-identifier] > [data-element-name-hook~="catHeaHed"]',
		titStr    : ( tarRecObj ) => tarRecObj?.labStr ? `${ tarRecObj.labStr } Picker` : 'Picker' // titStr is dynamic by TYPE, not name (unlike conditionalRow/pickerRow's own precedent).


	},

	// mulBoo is true because each expanded picker gets its own Controls/Items pair (more than one can be open at once). Same .catTogBut class and :nth-of-type split as the Reminders manager's own pair above. .catBodDiv is a descendant, not a direct child, of .datCatSec, it's wrapped in its own <ColDisCom> div (unlike .catHeaHed, which isn't). // padYcoNum:0, .catTogBut touches its neighbor with only a hairline border.
	{ // What: Picker Controls Help Item. Why: This is the on-demand help tip for the Picker Controls element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>Tap this to expand or collapse this picker's settings. This includes its name, its group, how it picks, its conditional gate and when it runs. Collapsed, it shows how many setting options exist.</>,
		ideStr    : 'dataPickerControlsHeader',
		mulBoo    : true,
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="datLisDiv"] > [data-element-name-hook~="datCatSec"][data-picker-row-identifier] [data-element-name-hook~="catBodDiv"] > [data-element-name-hook~="catTogBut"]:nth-of-type(1)',
		titStr    : 'Picker Controls'


	},

	{ // What: Picker Items Help Item. Why: This is the on-demand help tip for the Picker Items element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>Tap this to expand or collapse this picker's list of items below. Collapsed, it shows how many items are in the picker.</>,
		ideStr    : 'dataPickerItemsHeader',
		mulBoo    : true,
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="datLisDiv"] > [data-element-name-hook~="datCatSec"][data-picker-row-identifier] [data-element-name-hook~="catBodDiv"] > [data-element-name-hook~="catTogBut"]:nth-of-type(2)',
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

	{ // What: Picker Type Help Item. Why: This is the on-demand help tip for the Picker Type element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // Scoped to PicConCom's own "How it picks" group, ConEdiCom has its own separate .conModDiv inside .conConDiv, which doesn't live under .picConFie.


		bodEle    : <>This is where you choose the rule this picker follows each time it runs. Each option below explains its own ruleset, so have a read through them to see which one fits best.</>,
		ideStr    : 'dataPickerType',
		padYcoNum : 0, // padYcoNum:0, .picConFie (this group's own wrapper) touches "When it runs" below with zero gap.
		selStr    : '[data-element-name-hook~="picConFie"] [data-element-name-hook~="modRadDiv"]',
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
		padYcoNum : 0, // padYcoNum:0, .conGroDiv--items (this group's own wrapper) touches "Item Controls" kicker above with zero gap.
		selStr    : '[data-element-name-hook~="schLinDiv"]:has(button[aria-label="Avoid duplicate items"])',
		titStr    : 'Picker Duplicate Items Toggle'


	},

	// Fill/Refill acts on every item in this picker at once (actions.filPicFun), not just one. Moved out of "How it picks" into "Item Controls" alongside Avoid Duplicate Items above (see that entry's own comment), filling every item's charge is an items operation, not part of the picker's own ruleset. // padYcoNum:0, touches Picker Duplicate Items Toggle above with zero gap. // Split by mode (easConDiv's own ease-up/ease-down state, tabs/data/picker-controls.tsx) rather than one combined Fill/Refill entry, same idea as itemChargeRangeUp/Down below (the per-item equivalent, which also covers each item's own Soonest/Latest controls, this picker level no longer has any of its own to prefill new items with; see PIC_NAM_OBJ.aveEasFun in pickers.ts).
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

	{ // What: Create New Picker Item Help Item. Why: This is the on-demand help tip for the Create New Picker Item element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // Scoped to a picker card (its own data-picker-row-identifier) so this doesn't also match the Conditionals/Reminders managers' own "Add" buttons, which share the rowAddBut hook and render in the same list.


		bodEle    : <>This adds a new item to this picker's pool.</>,
		ideStr    : 'dataAddItem',
		padYcoNum : 0, // padYcoNum:0, .rowAddBut has the same zero-gap stacking as .lisIteDiv, touching the first item row below it.
		selStr    : '[data-element-name-hook~="datLisDiv"] [data-element-name-hook~="datCatSec"][data-picker-row-identifier] :is([data-element-name-hook~="rowAddBut"], [data-element-name-hook~="rowAddSpa"])',
		titStr    : 'Create New Picker Item'


	},

	// Split by section type (three separate entries, each named for its own context) rather than one shared "Item Sort", Conditionals/Reminders/pickers all render the exact same SorSelCom markup (sort-select.tsx) inside their own .catBodDiv, so the selectors below key off each section's own distinguishing hook/attribute instead: the conCatSec hook (Conditionals), the remCatSec hook (Reminders), and a picker section's own data-picker-row-identifier (set only there, unlike a plain className check, which would need :not() exclusions against the other two instead). // mulBoo is true because every expanded section's own sort control gets its own badge, since more than one can be visible (and set to a different order) at once, matters most for pickers, where several can be expanded together.
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
		selStr : '[data-element-name-hook~="datLisDiv"] [data-element-name-hook~="datCatSec"][data-picker-row-identifier] [data-element-name-hook~="sorDroSel"]',
		titStr : 'Picker Items Sort'


	},

	{ // What: Picker Item Help Item. Why: This is the on-demand help tip for the Picker Item element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This is one of this picker's items. Tap it to view and edit its settings.</>,
		ideStr    : 'dataItemRow',
		mulBoo    : true, // mulBoo is true because every item in every expanded picker gets its own badge.
		padYcoNum : 0,    // padYcoNum:0, .lisIteDiv rows stack with zero gap (touching, separated only by a hairline border), same as conditionalRow/reminderRowOnce/reminderRowRecurring.
		selStr    : '[data-element-name-hook~="datLisDiv"] [data-element-name-hook~="datCatSec"][data-picker-row-identifier] [data-element-name-hook~="lisIteDiv"] > :is([data-element-name-hook~="lisRowBut"], [data-element-name-hook~="lisRowDiv"])',
		titStr    : 'Picker Item'


	},

	// #endregion Item Rows / Sorting



	// #region Editing A Picker Item

	// EntEdiCom, defined in tab-today.tsx but reused here, see .entEdiDiv's own doc comment there. Which of these actually renders depends on the OWNING PICKER's mode, so most items below only ever show up for some modes: Charge Range (Ease Up/Ease Down only), Weight (Weighted/Dynamic Weighted), Boost (Dynamic Weighted only). Active and the footer always render regardless of mode. // .rowNamInp is also used by the Conditionals section's own name field (same .lisIteDiv wrapper shape), :has(.entEdiDiv) picks out only a .lisIteDiv that's actually an ITEM editor, since .entEdiDiv is unique to EntEdiCom and never rendered for a conditional.
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

		bodEle : () => { // bodEle is a function (see help/tooltip.tsx's HelTipCom) that reads the picker's own cadence unit word (days/weeks/months/years) straight off the already-rendered unit label (its easUniSpa hook) instead of hardcoding "days", which would be wrong for a non-daily cadence picker.


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

		bodEle : () => { // bodEle is a function (see help/tooltip.tsx's HelTipCom) that reads the picker's own cadence unit word (days/weeks/months/years) straight off the already-rendered unit label (its easUniSpa hook) instead of hardcoding "days", which would be wrong for a non-daily cadence picker.


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

	{ // What: Delete / Cancel / Save Help Item. Why: This is the on-demand help tip for the Delete / Cancel / Save element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // selStr targets .ediFooDiv (the shared wrapper), not the plain footer alone, Delete swaps that sibling out for .ediFooDiv--confirm (its own Cancel/Delete pair), which a selector scoped to the plain footer would miss entirely once that swap happens: no dim-mask hole, AND the click-guard would treat its buttons as off-target and block them, making the confirmation genuinely unreachable while help mode is on. // Delete is only rendered when !isaNewBoo (see EntEdiCom in ui/entry-editor.tsx), :has() on the delActBut hook splits this from itemFootNew below rather than always mentioning Delete, same fix as dataCondFoot/dataReminderFoot.


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


	}

	// #endregion Editing A Picker Item


];

// #endregion Constants



// #region Exports

export { DAT_HEL_ARR }; // What: Named Export. Why: The Data tab renders its own help toggle and hands help mode this catalog. How: This exports the catalog by name.

// #endregion Exports


