


// #region Imports

import cssModObj from './today-catalog.module.css'; // What: CSS Module Object. Why: The card actions tips' button blocks are styled from their own module. How: This maps each class name in today-catalog.module.css to its hashed module class.


import { IcoSvgCom } from '../ui/icon.tsx'; // What: Icon SVG Component. Why: The card actions tips explain each button under a heading that carries its real icon, so a reader can match the tip back to the real control. How: This is rendered inside those tips' body JSX, beside each button's bold name.


import type { HelIteTyp } from './catalog-item.ts'; // What: Help Item Type. Why: Every item in this catalog shares the one shape help mode reads. How: This types TOD_HEL_ARR.

// #endregion Imports



/**
 * today-catalog.tsx = Today Catalog
 *
 * @summary
 * The on-demand help catalog for the Today tab, which help mode (see
 * help/mode.tsx) highlights and explains one item at a time.
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

const TOD_HEL_ARR : HelIteTyp[] = [ // What: Today Help Array. Why: This is the on-demand help catalog for the Today tab, one entry per distinct piece of functionality on that page rather than one per DOM element. How: This is the item list help mode reads for the Today tab.


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
		selStr : '[data-element-name-hook~="todStkDiv"]',
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
		padXcoNum : 4, // padXcoNum: 4 exists because fooEdiBut sits right next to genLisBut (Regenerate) with only an 11px gap between them, and the default 8px pad on each side would overlap by 5px.
		selStr    : '[data-element-name-hook~="ediRaiBut"], [data-element-name-hook~="fooEdiBut"]',

		titStr : () => document.querySelector( '[data-element-name-hook~="ediRaiBut"]' )?.hasAttribute( 'data-edit-mode-active' ) ? 'Done Button' : 'Edit Mode', // title/body are functions (see help/tooltip.tsx's HelTipCom for this pattern, e.g. the Charge Controls items) because ediRaiBut is the SAME button throughout, relabeled "Done" once Edit Mode is on rather than being swapped for a different element, so a static "Edit Mode" tip would otherwise keep showing even after the button (and its real behavior) had already become Done; fooEdiBut only ever matches while NOT editing (it unmounts entirely once editMode is true, see the editModeFootActions item below for what replaces it), so reading ediRaiBut's own data-edit-mode-active attribute here correctly reflects either case regardless of which of the two elements actually got matched.

		bodEle : () => document.querySelector( '[data-element-name-hook~="ediRaiBut"]' )?.hasAttribute( 'data-edit-mode-active' ) // title/body are functions (see help/tooltip.tsx's HelTipCom for this pattern, e.g. the Charge Controls items) because ediRaiBut is the SAME button throughout, relabeled "Done" once Edit Mode is on rather than being swapped for a different element, so a static "Edit Mode" tip would otherwise keep showing even after the button (and its real behavior) had already become Done; fooEdiBut only ever matches while NOT editing (it unmounts entirely once editMode is true, see the editModeFootActions item below for what replaces it), so reading ediRaiBut's own data-edit-mode-active attribute here correctly reflects either case regardless of which of the two elements actually got matched.
			? <>This button saves any edits that you have made and exits Edit Mode.</>                          // What: Done Body Branch. Why: With Edit Mode on, this same button saves and exits instead. How: This renders the Done copy.
			: <>This lets you rearrange the positions of the groups and items, as well as rename the groups.</> // What: Edit Mode Body Branch. Why: With Edit Mode off, this button opens it. How: This renders the Edit Mode copy.


	},

	// ediBanSpa is the Cancel/Done pair in Edit Mode's own sticky banner. ediActDiv (tab-today.tsx) is the identical pair repeated in the footer, distinguished from the OTHER (non-editing) footer actions row that shares fooActDiv with it, finTarFun's comma syntax is fallback-only (see groupNameEdit's own comment in this file for why that distinction matters), so this needs its own hook rather than reusing the shared one, and can't be combined with ediBanSpa into one selStr either, for the same reason (both are always present together while Edit Mode is on, so the first one found would always win).
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

	// These three only exist in the DOM while Edit Mode is on, same "finTarFun returns nothing, item silently skipped" handling as the side-placement rail handle (see help/mode.tsx). mulBoo is true on all three because every group's own grip/card/name gets its own badge, since a user editing a long list could be looking at any one of them, not just the first.
	{ // What: Reorder Group Help Item. Why: This is the on-demand help tip for the Reorder Group element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>While Edit Mode is on, drag this handle to change this group's position in your todo list.</>,
		ideStr    : 'groupGrip',
		mulBoo    : true,
		padXcoNum : 1, // padXcoNum: 1 exists because groGriSpa and groNamBut sit only about 5px apart in practice (the negative margin on groNamBut eats into heaLefDiv's own 11px gap); the default 8px pad on each side, and even editMode's own padXcoNum:4 fix above, both still overlap here, so 1px each side leaves about 3px of real clearance instead.
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

	{ // What: Rename Group Help Item. Why: This is the on-demand help tip for the Rename Group element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // :is() joins the button (idle) and the input (mid-edit), since finTarFun's comma syntax is fallback-only (try the first selector, only try the next if it matched NOTHING at all), not a union, so '.groNamBut, .groNamInp' silently dropped whichever group was actively being edited the moment any OTHER group's plain button still matched. Matching both at once sidesteps that entirely: clicking a name to rename it used to make this exact highlight vanish and leave the now-visible input hidden behind the dimmer, right when a user is actually interacting with it.


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

	// Reminders and picker-generated entries share the same carActDiv markup but not the same buttons (reminders have no Re-Roll, there's nothing to re-roll TO, it's a fixed task, not a random pick), so this needs two separate items rather than one shared description. Also excludes day-off and charging cards, both render a carActDiv row too, but with Re-Roll and/or Edit genuinely disabled (the app's own InfTipCom there says "This action is disabled for this type of item"), which this tip's copy doesn't describe. mulBoo is true on both because every OTHER card gets its own badge; a single shared one could land on a card whose buttons happen to be in an unusual state, or just not be near wherever the user actually scrolled to.
	{ // What: Card Actions Help Item. Why: This is the on-demand help tip for the Card Actions element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		ideStr : 'cardActionsPicker',
		mulBoo : true,
		selStr : '[data-element-name-hook~="todCarArt"]:not([data-element-name-hook~="remCarArt"]):not([data-element-name-hook~="tutCarArt"]):not([data-element-name-hook~="daoCarArt"]):not([data-element-name-hook~="chrCarArt"]) [data-element-name-hook~="carActDiv"]',
		titStr : 'Card Actions',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<div className={ cssModObj.butIteDiv }>{ /* What: Button Item Div Element. Why: This groups related lines of this help item's own explanatory copy into one visual block. How: This is rendered as-is inside the tip. */ }


					<div className={ cssModObj.butLabDiv }><IcoSvgCom className={ cssModObj.butLabSvg } icoNamStr='refEle' sizSteStr='bas' /><b>Re-Roll:</b></div>{ /* What: Button Label Div Element. Why: This pairs an icon with a bold action name inside its own group. How: This is rendered as-is inside the tip. */ }{ /* Vertical Rhythm Base ~= 14.572px */ }

					<p>This button swaps this item for a different one from the same picker, without waiting for the next generation.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


				</div>


				<div className={ cssModObj.butIteDiv }>{ /* What: Button Item Div Element. Why: This groups related lines of this help item's own explanatory copy into one visual block. How: This is rendered as-is inside the tip. */ }


					<div className={ cssModObj.butLabDiv }><IcoSvgCom className={ cssModObj.butLabSvg } icoNamStr='skiEle' sizSteStr='bas' /><b>Skip:</b></div>{ /* What: Button Label Div Element. Why: This pairs an icon with a bold action name inside its own group. How: This is rendered as-is inside the tip. */ }{ /* Vertical Rhythm Base ~= 14.572px */ }

					<p>This button removes this item from your todo list without completing it and updates the progress ring's total count accordingly.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


				</div>


				<div className={ cssModObj.butIteDiv }>{ /* What: Button Item Div Element. Why: This groups related lines of this help item's own explanatory copy into one visual block. How: This is rendered as-is inside the tip. */ }


					<div className={ cssModObj.butLabDiv }><IcoSvgCom className={ cssModObj.butLabSvg } icoNamStr='ediEle' sizSteStr='bas' /><b>Edit:</b></div>{ /* What: Button Label Div Element. Why: This pairs an icon with a bold action name inside its own group. How: This is rendered as-is inside the tip. */ }{ /* Vertical Rhythm Base ~= 14.572px */ }

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


				<div className={ cssModObj.butIteDiv }>{ /* What: Button Item Div Element. Why: This groups related lines of this help item's own explanatory copy into one visual block. How: This is rendered as-is inside the tip. */ }


					<div className={ cssModObj.butLabDiv }><IcoSvgCom className={ cssModObj.butLabSvg } icoNamStr='skiEle' sizSteStr='bas' /><b>Skip:</b></div>{ /* What: Button Label Div Element. Why: This pairs an icon with a bold action name inside its own group. How: This is rendered as-is inside the tip. */ }{ /* Vertical Rhythm Base ~= 14.572px */ }

					<p>This button removes this item from your todo list without completing it and updates the progress ring's total count accordingly.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


				</div>


				<div className={ cssModObj.butIteDiv }>{ /* What: Button Item Div Element. Why: This groups related lines of this help item's own explanatory copy into one visual block. How: This is rendered as-is inside the tip. */ }


					<div className={ cssModObj.butLabDiv }><IcoSvgCom className={ cssModObj.butLabSvg } icoNamStr='ediEle' sizSteStr='bas' /><b>Edit:</b></div>{ /* What: Button Label Div Element. Why: This pairs an icon with a bold action name inside its own group. How: This is rendered as-is inside the tip. */ }{ /* Vertical Rhythm Base ~= 14.572px */ }

					<p>This button adjusts this item's properties. That includes its name, schedule (reminders only), values (pickers only) and active toggle (pickers only).</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


				</div>


			</>


		)


	},

	{ // What: Skip Help Item. Why: This is the on-demand help tip for the Skip element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // A day-off card (a conditional's triggered "rest" state) is excluded from cardActionsPicker above since it doesn't have the normal 3-button set, but unlike a charging card (where Re-Roll/Skip/Edit are ALL genuinely disabled, nothing real to highlight), a day-off card's own Skip IS a real, working button, only Re-Roll and Edit are disabled there. `button` (not actIcoBut generally) specifically targets that one real button, the disabled Re-Roll/Edit are InfTipCom's own <span> root, not a <button>, so this selector can't accidentally catch them.


		bodEle : <>This button removes this day off from your todo list without completing it and updates the progress ring's total count accordingly. Re-Roll and Edit are disabled for this type of card.</>,
		ideStr : 'cardActionsDayOff',
		mulBoo : true,
		selStr : '[data-element-name-hook~="daoCarArt"] [data-element-name-hook~="carActDiv"] button',
		titStr : 'Skip'


	},

	// #endregion Card Actions



	// #region Editing A Picker Item

	// This is reachable from Today's own Edit button too, not just the Data tab (DAT_HEL_ARR has its own copy of these same 6 items, scoped identically via .entEdiDiv, that class is shared verbatim by both tabs since it's literally the same EntEdiCom component either way). // Item Name is the one exception: Today's own name field lives right on the card (.entNamInp, EntCarCom's own markup), not inside .entEdiDiv like Data's .rowNamInp does.
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

	{ // What: Delete / Cancel / Save Help Item. Why: This is the on-demand help tip for the Delete / Cancel / Save element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // selStr targets .ediFooDiv (the shared wrapper), not the plain footer alone, Delete swaps that sibling out for .ediFooDiv--confirm (its own Cancel/Delete pair), which a selector scoped to the plain footer would miss entirely once that swap happens: no dim-mask hole, AND the click-guard would treat its buttons as off-target and block them, making the confirmation genuinely unreachable while help mode is on.


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

	{ // What: Reminder Name Help Item. Why: This is the on-demand help tip for the Reminder Name element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // Scoped to remFieDiv specifically, NOT the wider remAddDiv, since addNamInp's old shared class was reused by the Repeat editor's own extra fields (the Every N Days number input, the Monthly/Yearly selects), so the wider scope was unioning the name field with whichever of those happened to be visible, stretching this highlight down into the Repeat section.


		bodEle : <>This is the name field for your new reminder, give it a short, descriptive name. This is what will show up on your todo list.</>,
		ideStr : 'addReminderName',
		selStr : '[data-element-name-hook~="remFieDiv"] [data-element-name-hook~="addNamInp"]',
		titStr : 'Reminder Name'


	},

	{ // What: Reminder Schedule Help Item. Why: This is the on-demand help tip for the Reminder Schedule element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // .schEdiDiv (not just segConDiv, the pill row) so this always covers whatever extra fields the current selection reveals below the pills (the weekday chips for Weekly, the day/date pickers for the others), every option's own extra fields, not just whichever ones happened to share a class with the Reminder Name field above. No pinning to a separate element here (unlike a first attempt at this), the highlighted rect IS .schEdiDiv itself, so the tip's normal "below the target" placement already tracks its own bottom edge as it grows/shrinks with the selection, without needing to pin to some other, unrelated element.


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

	{ // What: Cancel / Add Help Item. Why: This is the on-demand help tip for the Cancel / Add element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // The buttons themselves, not the ediFooDiv row, since that row is right-aligned/space-between and wider than its own buttons, which left a big empty gap included in the highlight.


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

	// RemCarCom's name input + the InlEdiCom/EdiFooCom pair it expands into, same underlying editor as Add a Reminder above, so these reuse its exact copy where the content is identical (name field, repeat schedule). The only real difference: Save replaces Add (no "stays disabled" caveat, Save has no disabled state, unlike Add), and there's a Delete button Add's form doesn't have.
	{ // What: Reminder Name Help Item. Why: This is the on-demand help tip for the Reminder Name element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This is the name field for your reminder, give it a short, descriptive name. This is what will show up on your todo list.</>,
		ideStr : 'editReminderName',
		selStr : '[data-element-name-hook~="remNamInp"]',
		titStr : 'Reminder Name'


	},

	{ // What: Reminder Schedule Help Item. Why: This is the on-demand help tip for the Reminder Schedule element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // inlEdiDiv is shared markup used by the Add Reminder quick-add form and by an existing reminder's own editor (this item). :not([data-element-name-hook~="remAddDiv"] *) excludes the quick-add form, since remAddDiv wraps its own inlEdiDiv and would otherwise show a second "Reminder Schedule" badge whenever that form is open.


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

	{ // What: Delete / Cancel / Save Help Item. Why: This is the on-demand help tip for the Delete / Cancel / Save element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // selStr targets the ediFooDiv hook (the shared wrapper), not the plain footer alone: Delete's confirm prompt swaps in a different footer (with the .ediFooDiv--confirm modifier), which a selector scoped to the plain footer would miss, leaving no dim-mask hole and letting the click-guard block its Cancel/Delete buttons while help mode is on. // :not([data-element-name-hook~="remAddDiv"] *) excludes the Add Reminder quick-add form, which uses the same inlEdiDiv > ediFooDiv structure for its own Cancel/Add buttons, so widening to the shared wrapper would otherwise duplicate this badge.


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

	{ // What: Section Log Help Item. Why: This is the on-demand help tip for the Section Log element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // Every OTHER group section (Chores, say) gets the same Log chip as Reminders, :not(remGroSec):not(pagTouSec) excludes Reminders itself (already covered above) and the Page Tours onboarding section.


		bodEle : <>This opens a log of everything that has happened for this section today. Including what was auto-picked, skipped, manually selected, re-rolled, and completed. It will also show the new updated values, if applicable, once an item has been marked as completed.</>,
		ideStr : 'dayLogPicker',
		mulBoo : true, // mulBoo is true (see help/mode.tsx) so each group's OWN Log button gets its own badge, since the user could be scrolled to any one of them.
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

	// day-log.tsx's RemLogCom, each column's header cell and data cells share one data-element-name-hook value, so one selector highlights the whole column without the header borrowing the data rows' font styling.
	{ // What: Reminder Column Help Item. Why: This is the on-demand help tip for the Reminder Column element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This lists every reminder you've created, whether it's due today or not.</>,
		groStr : 'reminderLogCols', // groStr (see help/mode.tsx) makes the 3 highlights meet edge-to-edge with no gap or overlap between them, rather than each shrinking to its own content.
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

	// day-log.tsx's GroLogCom, these column hooks work the same way. Deliberately TWO separate column groups (picker item rows vs. Conditionals section rows) rather than one shared set: the Conditionals section has its own full-width "Rested: .../Attached: ..." line between rows, which a single highlight spanning BOTH sections would otherwise stretch across, making it look like that unrelated text was part of the column.
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


	}

	// #endregion Picker/Conditional Log Panel


];

// #endregion Constants



// #region Exports

export { TOD_HEL_ARR }; // What: Named Export. Why: This catalog is the file's one public binding. How: This exports the catalog by name.

// #endregion Exports


