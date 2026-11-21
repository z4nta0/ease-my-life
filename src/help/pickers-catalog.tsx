


// #region Imports

import cssModObj from './pickers-catalog.module.css'; // What: CSS Module Object. Why: The item pool tip drops small inline icons into its prose. How: This maps each class name in pickers-catalog.module.css to its hashed module class.


import { IcoSvgCom } from '../ui/icon.tsx'; // What: Icon SVG Component. Why: The item pool tip's body names each row button beside a small inline icon, so a reader can match the tip back to the real control. How: This is rendered inside that tip's body JSX, wrapped in an inline icon span.


import type { HelIteTyp } from './catalog-item.ts'; // What: Help Item Type. Why: Every item in this catalog shares the one shape help mode reads. How: This types PIC_HEL_ARR.

// #endregion Imports



/**
 * pickers-catalog.tsx = Pickers Catalog
 *
 * @summary
 * The on-demand help catalog for the Pickers tab, which help mode (see
 * help/mode.tsx) highlights and explains one item at a time.
 *
 * Copy is largely forked from onboarding/page-steps.tsx's own PIC_TAR_OBJ
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

const PIC_HEL_ARR : HelIteTyp[] = [ // What: Picker Help Array. Why: This is the on-demand help catalog for the Pickers tab, one entry per distinct piece of functionality on that page rather than one per DOM element. How: This is imported by tab-picker.tsx and passed to HelOveCom as its own helIteArr prop.


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
		padYcoNum : 2, // padYcoNum: 2, the mode pill sits directly below with only a 6px margin-top (see picker-view.module.css's .heaTitDiv rule, which sets the pill's --pil-top-mar); the default 8px pad on each side would overlap by 10px otherwise, bleeding into the pill's own highlight.
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


		ideStr    : 'pickerItems',
		padYcoNum : 4, // padYcoNum: 4, picPooDiv (the shared flex-column parent) only has an 11px gap to the Add Picker Item button below; the default 8px pad on each side would overlap by 5px otherwise.
		selStr    : '[data-element-name-hook~="pooIteDiv"]',
		titStr    : 'Picker Items',

		bodEle : (


			<>This lists all of the items that are in this picker's pool, including their values (if applicable). The <span className={ cssModObj.inlIcoSpa }><IcoSvgCom className={ cssModObj.inlIcoSvg } icoNamStr='calEle' sizSteStr='bas' /></span> Send to Today button will send the item to your todo list on the Today page, the <span className={ cssModObj.inlIcoSpa }><IcoSvgCom className={ cssModObj.inlIcoSvg } icoNamStr='ediEle' sizSteStr='bas' /></span> Edit button will allow you to edit the item's properties and the <span className={ cssModObj.inlIcoSpa }><IcoSvgCom className={ cssModObj.inlIcoSvg } icoNamStr='traEle' sizSteStr='bas' /></span> Delete button will delete the item after asking for confirmation.</> // What: Body Fragment. Why: This tip's own body mixes text with inline icons. How: This wraps the whole run as one element. // Vertical Rhythm Base ~= 14.572px


		)


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

	{ // What: Cancel / Save Help Item. Why: This is the on-demand help tip for the Cancel / Save element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // Unlike Today/Data, the Delete button is CSS-hidden here (the lisIteDiv wrapper sets --ent-del-dis : none), deleting an existing item stays solely the pool row's own trash icon + confirm flow on this tab, so the copy only covers Cancel/Save.


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

	{ // What: Picker Name Help Item. Why: This is the on-demand help tip for the Picker Name element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // :has(#picNamInp) scopes to just this field, since every field in the form shares the same forFieDiv/forFieFie hooks.


		bodEle : <>This is the name field for your new picker, and it should have a short, descriptive name.</>,
		ideStr : 'newPickerName',
		selStr : ':is([data-element-name-hook~="forFieDiv"], [data-element-name-hook~="forFieFie"]):has(#picNamInp)',
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

	// Deliberately doesn't re-explain each type, every option already has its own ruleset/explanation copy right there on the page, same as newPickerMode's own comment. // padYcoNum: 0, this whole cluster (Type/Weight/Odds/Boost/Charge Controls/Active) sits close enough together, .typGroDiv's own gap to a sibling block is only 6px, and Odds-to-Boost specifically share the SAME block with next to no gap at all, that the default 8px pad would overlap somewhere no matter which type is selected. Zero pad on all of them relies on newCondActive's own padYcoNum to open a gap instead (see its comment), same "let one side of the boundary do the work" approach as EntEdiCom's itemWeight/itemBoost.
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

	// The ease rows are told apart by their own data-ease-up-active/data-ease-down-active state (see ui/conditional-controls.tsx), the same split-by-direction pattern as EntEdiCom's itemChargeRangeUp/Down.
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

	{ // What: Picker Cadence Help Item. Why: This is the on-demand help tip for the Picker Cadence element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // .cadConDiv wraps BOTH the pill row and whichever extra "which day/date" field is currently showing below it, same "one editor, styled together" shape as Today's own addReminderRepeat/.schEdiDiv, so one highlight over the whole thing, growing/shrinking with the selection, instead of a per-option split.


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

	{ // What: Picker Holidays Toggle Help Item. Why: This is the on-demand help tip for the Picker Holidays Toggle element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // :has(#skiHolBut) distinguishes this from the OTHER schTogDiv just below it (Picker Duplicate Items Toggle), both share the same hook.


		bodEle : <>This determines whether this picker skips major U.S. holidays. When on, this picker won't run on those days. You can edit which days count as holidays, or add your own, in Settings.</>,
		ideStr : 'newPickerSkipHolidays',
		selStr : '[data-element-name-hook~="schTogDiv"]:has(#skiHolBut)',
		titStr : 'Picker Holidays Toggle'


	},

	{ // What: Picker Duplicate Items Toggle Help Item. Why: This is the on-demand help tip for the Picker Duplicate Items Toggle element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This determines whether the picker is allowed to choose an item when another item with the same name already exists elsewhere in the generated daily todo list. If all items are ineligible due to duplication, then this setting is ignored and an item is chosen normally.</>,
		ideStr : 'newPickerAvoidDuplicates',
		selStr : '[data-element-name-hook~="schTogDiv"]:has(#avoDupBut)',
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


	}

	// #endregion Create A Picker Form Step 2


];

// #endregion Constants



// #region Exports

export { PIC_HEL_ARR }; // What: Named Export. Why: The Pickers tab renders its own help toggle and hands help mode this catalog. How: This exports the catalog by name.

// #endregion Exports


