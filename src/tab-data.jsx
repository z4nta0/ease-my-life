


// #region Imports

import React from 'react'; // What: React. Why: This is the UI library every component in this file is built on. How: This is used directly (React.useState, React.useRef, React.useMemo, React.useEffect, React.useCallback, React.useLayoutEffect, React.Fragment) throughout, instead of importing individual named hooks.


import { Btn                     } from './ui.jsx';                    // What: Btn. Why: Every inline confirm/cancel/save action in this file's editors needs a consistently-styled button. How: This is rendered throughout PicConCom, CndEdiCom, and TabData's own footers.
import { CAD_OPT_ARR                } from './cadence-control.jsx';       // What: Cadence Options Array. Why: PicConCom's own daily-cadence summary needs the same daily-cadence sub-explanation CadConCom itself uses. How: This is looked up by key 'daily' inside PicConCom's cadence-summary block.
import { CADENCE                 } from './cadence.js';                // What: Cadence. Why: PicConCom needs the shared cadence math/summary helpers to render its own "how often" tip and select options. How: This is called throughout PicConCom for tipFor/summary/daysInMonth/unitWord/lockedDayTip.
import { clearHelpPickers        } from './help-sample-data.js';       // What: Clear Help Pickers. Why: Help mode's disposable sample pickers must not survive past the help session or this tab unmounting. How: This is called whenever helpOnBoo turns off and on TabData's own unmount cleanup.
import { clearHelpTasks          } from './help-sample-data.js';       // What: Clear Help Tasks. Why: Help mode's disposable sample reminders must not survive past the help session or this tab unmounting. How: This is called whenever helpOnBoo turns off and on TabData's own unmount cleanup.
import { Collapse                } from './ui.jsx';                    // What: Collapse. Why: Nearly every disclosure in this file (picker cards, Controls, Items, conditional rows, item rows) shares the same collapse-height animation. How: This wraps each of those bodies, driven by the matching open boolean.
import { compareSortEntries      } from './ui.jsx';                    // What: Compare Sort Entries. Why: Every sortable list in this file (sections, conditional items, picker items) shares the same sort-key vocabulary. How: This is called once per comparison inside each list's own Array.prototype.sort.
import { ConditionalControls     } from './tab-conditional.jsx';       // What: Conditional Controls. Why: CndEdiCom reuses the exact same "type + settings" editor the Pickers create-flow uses, so both stay in sync. How: This is rendered inside CndEdiCom as its own Controls alias.
import { conditionalDraftDefault } from './tab-conditional.jsx';       // What: Conditional Draft Default. Why: A brand-new conditional started from CndManCom needs the same sensible starting draft the Pickers create-flow uses. How: This is called once when the "Add a conditional" button is clicked.
import { DATA_HELP_ITEMS         } from './help-content.jsx';          // What: Data Help Items. Why: Help mode needs this tab's own catalog of labeled elements to badge. How: This is passed straight through to HelpOverlay's own items prop.
import { EntryEditor             } from './tab-today.jsx';             // What: Entry Editor. Why: A picker's own item editor must stay an exact copy of Today's, so this file reuses it rather than a second implementation. How: This is aliased to IteEdiCom and rendered once per open item row.
import { FillButton              } from './ui.jsx';                    // What: Fill Button. Why: An ease-up/ease-down picker's Item Controls need the same Fill/Refill-all control Today's own boost tools use. How: This is rendered inside PicConCom's Item Controls group.
import { freezeEditedRow         } from './ui.jsx';                    // What: Freeze Edited Row. Why: An item mid-edit must not visually jump position if its own sort key changes underneath it. How: This is called once per picker's item list, given the sorted list and the currently-open item id.
import { HelpButton              } from './help-mode.jsx';             // What: Help Button. Why: This tab needs the same help-mode toggle every other tab exposes. How: This is rendered in the header, toggling helpOnBoo.
import { HelpOverlay             } from './help-mode.jsx';             // What: Help Overlay. Why: This tab needs the same help-mode badge overlay every other tab exposes. How: This is rendered once, driven by helpOnBoo and DATA_HELP_ITEMS.
import { Icon                    } from './ui.jsx';                    // What: Icon. Why: Nearly every button and row in this file needs a recognizable glyph. How: This is rendered throughout every component below.
import { InfoTip                 } from './ui.jsx';                    // What: Info Tip. Why: A disabled control or a truncated pill still needs to explain itself on demand. How: This wraps disabled add buttons and truncatable type/group labels throughout this file.
import { MODES                   } from './seed.js';                   // What: Modes. Why: Every picker/conditional mode's own label and hint text comes from this shared catalog. How: This is read throughout PicConCom, CndManCom, and TabData for mode labels and the mode radio group.
import { normalizeConditionalName} from './pickers.js';                // What: Normalize Conditional Name. Why: A newly-typed conditional name needs the same tidy-casing rule pickers themselves already use. How: This is called on CndManCom's own in-progress draft name.
import { normalizeGroupName      } from './pickers.js';                // What: Normalize Group Name. Why: A newly-typed picker group needs the same tidy-casing rule picker names already use. How: This is called when committing PicConCom's own "+ New Group" inline input.
import { OB_CHECKLIST            } from './onboarding-checklist.js';   // What: Onboarding Checklist. Why: Several add/edit controls in this file must stay disabled while the Welcome Tour's own checklist is still in progress. How: This is checked via tutorialsInProgress throughout TabData and CndManCom.
import { PICKERS                 } from './pickers.js';                // What: Pickers. Why: An ease-mode picker's item list needs the same fallback ease-band math the picking engine itself uses. How: This is called once per picker via PICKERS.avgEase.
import { reduceMotion            } from './ui.jsx';                    // What: Reduce Motion. Why: A user who prefers reduced motion shouldn't see any of this file's own FLIP/scroll/collapse animations. How: This is checked before every animation throughout this file.
import { ReminderManager         } from './reminders.jsx';             // What: Reminder Manager. Why: The Reminders section of this tab is a full, separately-maintained editor. How: This is rendered once, in place of a picker card, whenever the Reminders scope is shown.
import { seedHelpPickers         } from './help-sample-data.js';       // What: Seed Help Pickers. Why: Help mode needs a real picker of every mode to show a representative "view and edit" section. How: This is called whenever helpOnBoo turns on.
import { seedHelpTasks           } from './help-sample-data.js';       // What: Seed Help Tasks. Why: Help mode needs real reminders of every recurrence kind to show a representative "view and edit" section. How: This is called whenever helpOnBoo turns on.
import { SortSelect              } from './ui.jsx';                    // What: Sort Select. Why: Every sortable list in this file needs the same sort control. How: This is rendered for sections, conditional items, and each picker's own item list.
import { useEmlTouFun            } from './onboarding.jsx';            // What: Use Ease My Life Tour. Why: Several controls in this file must disable themselves or highlight during specific onboarding tour steps. How: This is called once to read the shared tour event bus's phase/tourId/step fields.
import { useEscapeCancel         } from './ui.jsx';                    // What: Use Escape Cancel. Why: CndEdiCom's Escape key must cancel the current edit (or back out of a delete confirm) the same way every other editor in the app does. How: This is called once inside CndEdiCom.
import { WeekdayChips            } from './ui.jsx';                    // What: Weekday Chips. Why: PicConCom's own Days control needs the same weekday multi-select every other schedule editor uses. How: This is rendered inside PicConCom's "When it runs" group.

// #endregion Imports



/**
 * tab-data.jsx = Tab Data
 *
 * @summary
 * The Data tab: every picker, conditional, and reminder in one place,
 * grouped by picker with its weights, active/inactive status, and
 * per-picker Daily-generator scheduling (weekday + skip-holiday gates).
 * A picker's own "how it picks / when it runs / item controls" settings
 * (PicConCom) live here rather than in a separate Settings screen, so
 * everything about one picker sits behind one card. Conditionals
 * (CndManCom/CndEdiCom) and Reminders (ReminderManager, a separately
 * maintained module) render as sibling sections above the picker cards.
 * The global "days off" holiday list itself still lives in Settings.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



const SEC_SOR_ARR = [ // What: Section Sort Array. Why: The top-level Conditionals/Reminders/picker-card list needs one sort entry per supported key. How: This is passed as SortSelect's own options prop in TabData's own data-sort-bar.


	{ keyStr : 'name-asc',    labStr : 'Name (A–Z)' },               // What: Key String. Why: This is the section list's own default sort. How: SortSelect reads this against TabData's own sectionSort and reports it via onChange. // What: Label String. Why: This is the option's own visible menu text. How: SortSelect renders this as the option's own text content.
	{ keyStr : 'name-desc',   labStr : 'Name (Z–A)' },               // What: Key String. Why: This is the reverse of the default sort. How: SortSelect reads this against TabData's own sectionSort and reports it via onChange. // What: Label String. Why: This is the option's own visible menu text. How: SortSelect renders this as the option's own text content.
	{ keyStr : 'type-asc',    labStr : 'Type (A–Z)' },               // What: Key String. Why: Type is each section's own mode/kind label. How: SortSelect reads this against TabData's own sectionSort and reports it via onChange. // What: Label String. Why: This is the option's own visible menu text. How: SortSelect renders this as the option's own text content.
	{ keyStr : 'type-desc',   labStr : 'Type (Z–A)' },               // What: Key String. Why: This is the reverse of the type sort. How: SortSelect reads this against TabData's own sectionSort and reports it via onChange. // What: Label String. Why: This is the option's own visible menu text. How: SortSelect renders this as the option's own text content.
	{ keyStr : 'group-asc',   labStr : 'Group (A–Z)' },              // What: Key String. Why: Group only applies to a picker card, not Conditionals/Reminders as a whole. How: SortSelect reads this against TabData's own sectionSort and reports it via onChange. // What: Label String. Why: This is the option's own visible menu text. How: SortSelect renders this as the option's own text content.
	{ keyStr : 'group-desc',  labStr : 'Group (Z–A)' },              // What: Key String. Why: This is the reverse of the group sort. How: SortSelect reads this against TabData's own sectionSort and reports it via onChange. // What: Label String. Why: This is the option's own visible menu text. How: SortSelect renders this as the option's own text content.
	{ keyStr : 'count-asc',   labStr : 'Item Count (Low to High)' }, // What: Key String. Why: Every section (Conditionals/Reminders/a picker) has some notion of how many entries it holds. How: SortSelect reads this against TabData's own sectionSort and reports it via onChange. // What: Label String. Why: This is the option's own visible menu text. How: SortSelect renders this as the option's own text content.
	{ keyStr : 'count-desc',  labStr : 'Item Count (High to Low)' }, // What: Key String. Why: This is the reverse of the item-count sort. How: SortSelect reads this against TabData's own sectionSort and reports it via onChange. // What: Label String. Why: This is the option's own visible menu text. How: SortSelect renders this as the option's own text content.
	{ keyStr : 'active-asc',  labStr : 'Active to Inactive' },       // What: Key String. Why: Only a picker card has a meaningful active/inactive state. How: SortSelect reads this against TabData's own sectionSort and reports it via onChange. // What: Label String. Why: This is the option's own visible menu text. How: SortSelect renders this as the option's own text content.
	{ keyStr : 'active-desc', labStr : 'Inactive to Active' }        // What: Key String. Why: This is the reverse of the active sort. How: SortSelect reads this against TabData's own sectionSort and reports it via onChange. // What: Label String. Why: This is the option's own visible menu text. How: SortSelect renders this as the option's own text content.


];



/**
 * CIS_OPT_ARR = Conditional-Item-Sort Options Array
 *
 * @summary
 * Sort options for CndManCom's own conditional list, extrapolated from
 * SEC_SOR_ARR's own vocabulary but adapted to what a single conditional
 * actually has. Odds (not "Weight", despite the picker-item-sort analog
 * being called that) because a conditional's own `weight` field is
 * vestigial; its real weighted/dynamic trigger-likelihood knob is
 * `oddsPct`, which its own editor calls Odds (see conditionalOdds in
 * CndManCom and conditionals.js' own trueOdds). Boost (dynamic only)
 * and Range (the ease band's soonest/shortest end) are each meaningful
 * for only some modes; on every other row they are irrelevant rather
 * than genuinely missing, so compareSortEntries always sorts them to
 * the bottom regardless of direction instead of flipping to the top on
 * a "High to Low" sort the way a truly missing value would.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const CIS_OPT_ARR = [


	{ keyStr : 'name-asc',    labStr : 'Name (A–Z)' },          // What: Key String. Why: This is the conditional list's own default sort. How: SortSelect reads this against CndManCom's own itemSort and reports it via onChange. // What: Label String. Why: This is the option's own visible menu text. How: SortSelect renders this as the option's own text content.
	{ keyStr : 'name-desc',   labStr : 'Name (Z–A)' },          // What: Key String. Why: This is the reverse of the default sort. How: SortSelect reads this against CndManCom's own itemSort and reports it via onChange. // What: Label String. Why: This is the option's own visible menu text. How: SortSelect renders this as the option's own text content.
	{ keyStr : 'type-asc',    labStr : 'Type (A–Z)' },          // What: Key String. Why: Type is each conditional's own mode label. How: SortSelect reads this against CndManCom's own itemSort and reports it via onChange. // What: Label String. Why: This is the option's own visible menu text. How: SortSelect renders this as the option's own text content.
	{ keyStr : 'type-desc',   labStr : 'Type (Z–A)' },          // What: Key String. Why: This is the reverse of the type sort. How: SortSelect reads this against CndManCom's own itemSort and reports it via onChange. // What: Label String. Why: This is the option's own visible menu text. How: SortSelect renders this as the option's own text content.
	{ keyStr : 'odds-asc',    labStr : 'Odds (Low to High)' },  // What: Key String. Why: Weighted/dynamic conditionals expose their real trigger-likelihood as Odds. How: SortSelect reads this against CndManCom's own itemSort and reports it via onChange. // What: Label String. Why: This is the option's own visible menu text. How: SortSelect renders this as the option's own text content.
	{ keyStr : 'odds-desc',   labStr : 'Odds (High to Low)' },  // What: Key String. Why: This is the reverse of the odds sort. How: SortSelect reads this against CndManCom's own itemSort and reports it via onChange. // What: Label String. Why: This is the option's own visible menu text. How: SortSelect renders this as the option's own text content.
	{ keyStr : 'boost-asc',   labStr : 'Boost (Low to High)' }, // What: Key String. Why: Only a dynamic conditional has a meaningful boost value. How: SortSelect reads this against CndManCom's own itemSort and reports it via onChange. // What: Label String. Why: This is the option's own visible menu text. How: SortSelect renders this as the option's own text content.
	{ keyStr : 'boost-desc',  labStr : 'Boost (High to Low)' }, // What: Key String. Why: This is the reverse of the boost sort. How: SortSelect reads this against CndManCom's own itemSort and reports it via onChange. // What: Label String. Why: This is the option's own visible menu text. How: SortSelect renders this as the option's own text content.
	{ keyStr : 'range-asc',   labStr : 'Range (Low to High)' }, // What: Key String. Why: Only an ease-up/ease-down conditional has a meaningful soonest/shortest band. How: SortSelect reads this against CndManCom's own itemSort and reports it via onChange. // What: Label String. Why: This is the option's own visible menu text. How: SortSelect renders this as the option's own text content.
	{ keyStr : 'range-desc',  labStr : 'Range (High to Low)' }, // What: Key String. Why: This is the reverse of the range sort. How: SortSelect reads this against CndManCom's own itemSort and reports it via onChange. // What: Label String. Why: This is the option's own visible menu text. How: SortSelect renders this as the option's own text content.
	{ keyStr : 'active-asc',  labStr : 'Active to Inactive' },  // What: Key String. Why: Every conditional has its own active/inactive state. How: SortSelect reads this against CndManCom's own itemSort and reports it via onChange. // What: Label String. Why: This is the option's own visible menu text. How: SortSelect renders this as the option's own text content.
	{ keyStr : 'active-desc', labStr : 'Inactive to Active' }   // What: Key String. Why: This is the reverse of the active sort. How: SortSelect reads this against CndManCom's own itemSort and reports it via onChange. // What: Label String. Why: This is the option's own visible menu text. How: SortSelect renders this as the option's own text content.


];



// #region pisOptFun

/**
 * pisOptFun = Picker-Item-Sort Options Function
 *
 * @summary
 * Builds the sort options for one picker's own item list, which vary by
 * mode: a picker's items have no per-item Type (every item in one
 * picker's pool is the same kind), so ease/weighted/dynamic modes get a
 * mode-specific numeric field (reusing the generic "count" comparator
 * field) in its place instead: charge for ease-up/ease-down, weight for
 * weighted/dynamic. Ease modes also get Range, the item's own
 * soonest-to-latest day band collapsed to its near end, labeled
 * "Soonest" for ease-up and "Shortest" for ease-down to match the
 * wording already used for that same value elsewhere. Dynamic also gets
 * Boost, the same `value` field ease modes reuse for charge, here
 * meaning the item's current weight bonus instead. Truly Random has
 * none of these, only Name/Active.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param modStr - Mode String: The picker's own current mode key.
 *
 * @returns An array of { keyStr, labStr } sort options for that mode.
 *
 * @example
 * ```ts
 * pisOptFun(modStr) // => array of { keyStr, labStr } sort options
 * ```
 *
*/

function pisOptFun ( modStr ) {


	const optArr = [ // What: Options Array. Why: Every mode shares at least the Name sort. How: This starts with the 2 Name entries every mode gets, then more are pushed below depending on modStr.


		{ keyStr : 'name-asc',  labStr : 'Name (A–Z)' }, // What: Key String. Why: This is every mode's own default sort. How: SortSelect reads this against the picker's own itemSort and reports it via onChange. // What: Label String. Why: This is the option's own visible menu text. How: SortSelect renders this as the option's own text content.
		{ keyStr : 'name-desc', labStr : 'Name (Z–A)' }  // What: Key String. Why: This is the reverse of the default sort. How: SortSelect reads this against the picker's own itemSort and reports it via onChange. // What: Label String. Why: This is the option's own visible menu text. How: SortSelect renders this as the option's own text content.


	];


	if ( modStr === 'ease-up' || modStr === 'ease-down' ) {


		const ranLblStr = modStr === 'ease-down' ? 'Shortest' : 'Soonest'; // What: Range Label String. Why: The Range sort's own label reads differently for ease-up vs ease-down, matching the item editor's own Soonest/Shortest wording. How: This picks 'Shortest' for ease-down, 'Soonest' otherwise.


		optArr.push( { keyStr : 'count-asc', labStr : 'Charge (Low to High)' }, { keyStr : 'count-desc', labStr : 'Charge (High to Low)' } ); // What: Charge Options Push. Why: Ease modes reuse the generic count field to mean charge. How: This appends both charge sort directions.
		optArr.push( { keyStr : 'range-asc', labStr : `${ ranLblStr } (Low to High)` }, { keyStr : 'range-desc', labStr : `${ ranLblStr } (High to Low)` } ); // What: Range Options Push. Why: Ease modes also expose their own soonest/latest band as a sortable Range value. How: This appends both range sort directions, labeled per ranLblStr.


	}

	else if ( modStr === 'weighted' || modStr === 'dynamic' ) {


		optArr.push( { keyStr : 'count-asc', labStr : 'Weight (Low to High)' }, { keyStr : 'count-desc', labStr : 'Weight (High to Low)' } ); // What: Weight Options Push. Why: Weighted/dynamic modes reuse the generic count field to mean weight. How: This appends both weight sort directions.


		if ( modStr === 'dynamic' ) optArr.push( { keyStr : 'boost-asc', labStr : 'Boost (Low to High)' }, { keyStr : 'boost-desc', labStr : 'Boost (High to Low)' } ); // What: Boost Options Guard. Why: Only dynamic (not plain weighted) has a meaningful boost value. How: This appends both boost sort directions only when modStr is 'dynamic'.


	}


	optArr.push( { keyStr : 'active-asc', labStr : 'Active to Inactive' }, { keyStr : 'active-desc', labStr : 'Inactive to Active' } ); // What: Active Options Push. Why: Every mode has a meaningful active/inactive state. How: This appends both active sort directions, common to every mode.



	return optArr; // What: Options Array Return. Why: The caller needs the full, mode-specific option list. How: This returns the same array built and pushed to above.


}

// #endregion pisOptFun



// #region PicConCom

/**
 * PicConCom = Picker Controls Component
 *
 * @summary
 * A picker's own "how it picks / when it runs / item controls" body,
 * rendered only while the Controls disclosure is open, so it snapshots
 * the picker's full state on mount, letting Cancel revert every change
 * (type, ease band, weekdays, holiday skip, daily-generator membership,
 * and any item values touched by a Refill) the way the item editor's own
 * Cancel does. Done keeps the changes. A brand-new draft picker (created
 * by TabData's own "Create Picker" button) swaps the normal Delete/
 * Cancel/Save footer for a no-Delete Cancel/Add-Items-then-Save one
 * instead.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.picker              - Picker: {@link picObj}
 * @param props.items               - Items: {@link iteArr}
 * @param props.inDaily             - In Daily: Whether this picker is
 *                                    currently a member of the daily
 *                                    generator.
 * @param props.dailyIds            - Daily Ids: Every picker id currently in
 *                                    the daily generator.
 * @param props.allGroups           - All Groups: Every existing group name,
 *                                    used to populate the Group selector.
 * @param props.conditionals        - Conditionals: Every existing conditional,
 *                                    used to populate the attach-a-
 *                                    conditional rail; defaults to an empty
 *                                    array.
 * @param props.actions             - Actions: {@link useStore}
 * @param props.onCollapse          - On Collapse: Collapses this picker's own
 *                                    Controls disclosure.
 * @param props.onRequestDelete     - On Request Delete: Deletes this picker,
 *                                    in place of the default
 *                                    actions.removePicker call, when the
 *                                    caller wants to animate the removal
 *                                    itself.
 * @param props.isNewDraft          - Is New Draft: Whether this is a
 *                                    brand-new, not-yet-saved draft picker.
 * @param props.itemsSectionOpen    - Items Section Open: Whether the draft's
 *                                    own Items section has been revealed yet.
 * @param props.hasOpenNewItem      - Has Open New Item: Whether a brand-new
 *                                    item's editor is still open, unsaved.
 * @param props.onOpenItemsSection  - On Open Items Section: Reveals the
 *                                    draft's own Items section.
 * @param props.onSaveNew           - On Save New: Commits a brand-new draft
 *                                    picker.
 * @param props.onCancelNew         - On Cancel New: Discards a brand-new draft
 *                                    picker.
 *
 * @returns This picker's own Controls body: Picker Details, How it
 * picks, When it runs, Item Controls, and the footer.
 *
 * @example
 * ```tsx
 * PicConCom({ picker, items, inDaily, dailyIds, ... }) // => <PicConCom />
 * ```
 *
*/

function PicConCom ( { picker : picObj, items : iteArr, inDaily : inDaiBoo, dailyIds : daiIdeArr, allGroups : allGroArr, conditionals : cndIteArr = [], actions : actObj, onCollapse : onColFun, onRequestDelete : onReqDelFun, isNewDraft : isaNewBoo, itemsSectionOpen : iteSecBoo, hasOpenNewItem : hasNewBoo, onOpenItemsSection : onOpnSecFun, onSaveNew : onSavNewFun, onCancelNew : onCanNewFun } ) {


	const isaEasBoo = picObj.mode === 'ease-up' || picObj.mode === 'ease-down'; // What: Is-A Ease Boolean. Why: Several sections below (Item Controls' own Fill/Refill, the item sort options) only apply to an ease-mode picker. How: This is true whenever picObj.mode is 'ease-up' or 'ease-down'.
	const isaDowBoo = picObj.mode === 'ease-down';                              // What: Is-A Down Boolean. Why: Ease-up and ease-down share most UI but need opposite Fill/Refill wording. How: This is true only for 'ease-down'.
	const notFulNum = iteArr.filter( ( iteCurObj ) => ( iteCurObj.value ?? 0 ) < ( picObj.threshold ?? 100 ) ).length; // What: Not Full Number. Why: The Fill/Refill row's own summary needs to know how many items still aren't at full charge. How: This counts every item whose own value falls short of the picker's own threshold.


	const filSubEle = notFulNum === 0 // What: Fill Sub Element. Why: The Item Controls' own Fill/Refill row needs a live one-line summary of how many items still need charging. How: This picks a fully-charged message when notFulNum is 0, otherwise pluralizes the remaining count.
		? <><strong>all items</strong> are fully charged</>
		: <><strong>{ notFulNum } { notFulNum === 1 ? 'item' : 'items' }</strong> { notFulNum === 1 ? 'is' : 'are' } not at full charge</>;

	const [ conDelBoo, setConDelBoo ] = React.useState( false ); // What: Confirm Delete Boolean And Setter. Why: Deleting a real picker needs an inline confirm step before it actually happens. How: This is flipped true by the Delete button and read by the footer to swap in the confirm row.


	const neeNamBoo = !picObj.name.trim();                                                    // What: Need Name Boolean. Why: A new draft's footer must know whether the picker still lacks a name. How: This is true whenever picObj.name is empty once trimmed.
	const neeGroBoo = !picObj.group;                                                           // What: Need Group Boolean. Why: A new draft's footer must also know whether the picker still lacks a group. How: This is true whenever picObj.group is falsy.
	const shoSavBoo = isaNewBoo && iteSecBoo && iteArr.length >= 2 && !hasNewBoo;               // What: Show Save Boolean. Why: The footer button only becomes a real "Save" once the Items section is open, holds at least 2 items, and none is still an unsaved brand-new row. How: This combines all 4 conditions with &&.
	const ftrLblStr = shoSavBoo ? 'Save' : 'Add Items';                                        // What: Footer Label String. Why: The footer button's own visible text depends on whether it's ready to save yet. How: This picks 'Save' once shoSavBoo is true, 'Add Items' otherwise.
	const ftrDisBoo = shoSavBoo ? false : ( neeNamBoo || neeGroBoo || iteSecBoo );              // What: Footer Disabled Boolean. Why: The footer button stays disabled until every prerequisite for its current label is satisfied. How: This is never disabled once shoSavBoo is true, otherwise disabled while name/group is missing or the Items section is already open.
	const ftrTipStr = neeNamBoo && neeGroBoo ? 'A picker name and group are both required.' // What: Footer Tip String. Why: The disabled button's own InfoTip needs a specific reason for whichever prerequisite is still unmet. How: This chains through every prerequisite in the same priority order the footer itself checks them.
		: neeNamBoo ? 'A picker name is required.'
		: neeGroBoo ? 'A group name is required.'
		: ( iteSecBoo && iteArr.length < 2 ) ? `${ 2 - iteArr.length } more ${ 2 - iteArr.length === 1 ? 'item' : 'items' } needed.`
		: ( iteSecBoo && hasNewBoo ) ? 'Finish saving this item first.'
		: shoSavBoo ? 'Everything looks good, click Save to create this picker.'
		: 'Everything looks good, click Add Items to continue.';
	const ftrActFun = shoSavBoo ? onSavNewFun : onOpnSecFun; // What: Footer Action Function. Why: The footer button's own click handler depends on whether it currently reads "Save" or "Add Items". How: This picks onSavNewFun once shoSavBoo is true, onOpnSecFun otherwise.

	const [ cndOnBoo, setCndOnBoo ] = React.useState( !!picObj.conditionalId ); // What: Conditional On Boolean And Setter. Why: The "Attach a conditional" toggle needs its own on/off state, seeded from whether this picker already has one attached. How: This starts true when picObj.conditionalId is already set, and is flipped by the switch button below.


	const raiCleRef = React.useRef( null ); // What: Rail Cleanup Reference. Why: The rail's own scroll/resize wiring needs to be torn down and rebuilt on every reattach. How: This holds whichever cleanup function the last attachment registered.
	const raiNodRef = React.useRef( null ); // What: Rail Node Reference. Why: The FLIP reorder effect below needs a stable handle on the rail's own live DOM node. How: This is written by raiRefFun below and read by the FLIP effect.


	const raiRefFun = React.useCallback( ( raiCurEle ) => { // What: Rail Reference Function. Why: The conditional pill rail needs its own scroll/resize wiring set up on attach and torn down on every reattach or detach. How: This is passed directly as the rail div's own ref prop.


		if ( raiCleRef.current ) { raiCleRef.current(); raiCleRef.current = null; } // What: Previous Cleanup Guard. Why: A prior attachment's own listeners must not leak past this new attach/detach. How: This calls and clears whatever cleanup function the last attachment registered, if any.

		raiNodRef.current = raiCurEle; // What: Rail Node Update. Why: The FLIP effect below needs the freshly-attached (or newly-null, on detach) node. How: This writes the callback's own argument into raiNodRef.

		if ( !raiCurEle ) return; // What: No Element Guard. Why: A detach (raiCurEle is null) has nothing left to wire up. How: This bails out before touching any DOM APIs.



		const updFadFun = () => { // What: Update Fade Function. Why: The rail's own edge-fade classes must reflect whether it can currently scroll, and how far. How: This toggles at-start/at-end based on the rail's own scrollWidth/clientWidth/scrollLeft.


			const canScrBoo = raiCurEle.scrollWidth - raiCurEle.clientWidth > 1; // What: Can Scroll Boolean. Why: A rail that doesn't overflow at all should never show either fade edge. How: This is true only when the rail's own content is wider than its own visible box by more than a rounding pixel.

			raiCurEle.classList.toggle( 'at-start', !canScrBoo || raiCurEle.scrollLeft <= 1 ); // What: At Start Toggle. Why: The left fade should hide once the rail can't scroll at all or is already at its own start. How: This applies the 'at-start' class per canScrBoo and the rail's own current scrollLeft.
			raiCurEle.classList.toggle( 'at-end', !canScrBoo || raiCurEle.scrollLeft + raiCurEle.clientWidth >= raiCurEle.scrollWidth - 1 ); // What: At End Toggle. Why: The right fade should hide once the rail can't scroll at all or is already at its own end. How: This applies the 'at-end' class per canScrBoo and the rail's own current scroll position.


		};


		updFadFun(); // What: Initial Fade Call. Why: The fade classes need to reflect the rail's own real layout immediately on attach. How: This invokes updFadFun once, synchronously.

		requestAnimationFrame( updFadFun ); // What: Next Frame Fade Call. Why: The rail's own real scrollWidth may not be final until after this same paint settles. How: This re-runs updFadFun one frame later to catch any late layout change.


		const resObsObj = new ResizeObserver( updFadFun ); // What: Resize Observer Object. Why: The rail's own fade state depends on its measured width, which can change independent of a window resize. How: This re-runs updFadFun whenever the rail's own box size changes.

		resObsObj.observe( raiCurEle ); // What: Resize Observer Start. Why: The observer above does nothing until it's told what to watch. How: This begins watching raiCurEle for size changes.

		raiCurEle.addEventListener( 'scroll', updFadFun, { passive : true } ); // What: Rail Scroll Listener. Why: Scrolling the rail itself is the most common way its own edges change. How: This re-runs updFadFun on every scroll event, passively so it never blocks the scroll itself.

		window.addEventListener( 'resize', updFadFun ); // What: Window Resize Listener. Why: A viewport resize can also change how much of the rail is visible. How: This re-runs updFadFun on every window resize event.


		raiCleRef.current = () => { // What: Cleanup Assignment. Why: The next attach (or this callback ref's own unmount) must be able to tear down everything just wired up. How: This stores a function that disconnects the observer and removes both listeners.


			resObsObj.disconnect(); // What: Resize Observer Teardown. Why: This observer must not outlive the attachment that created it. How: This stops watching raiCurEle for size changes.

			raiCurEle.removeEventListener( 'scroll', updFadFun ); // What: Rail Scroll Listener Teardown. Why: This matches the addEventListener above so the listener does not outlive this attachment. How: This removes the exact same updFadFun reference that was added.

			window.removeEventListener( 'resize', updFadFun ); // What: Window Resize Listener Teardown. Why: Same reasoning as the scroll listener, for the window-level one. How: This removes the exact same updFadFun reference that was added.


		};


	}, [] ); // What: Effect Dependency Array. Why: raiRefFun only closes over refs and stable functions it defines itself, none of which ever change identity. How: An empty array means React never needs to recreate this callback.

	const attCndObj = cndIteArr.find( ( cndCurObj ) => cndCurObj.id === picObj.conditionalId ) || null; // What: Attached Conditional Object. Why: The schedule summary below needs the actual conditional record this picker currently points at. How: This looks up picObj.conditionalId in cndIteArr, or null when none matches.


	const flpFirRef = React.useRef( new Map() ); // What: Flip First Reference. Why: The FLIP reorder animation below needs each pill's PREVIOUS x position to compute how far it moved. How: This starts as an empty map and is repopulated every time the layout effect runs.

	React.useLayoutEffect( () => { // What: Conditional Rail Flip Effect. Why: When the attached conditional changes, the pinned pill jumps to the front; this plays a FLIP tween instead of a silent snap. How: This captures each pill's old x, lets React reorder, then inverts and plays the transform so they glide into place.


		const raiCurEle = raiNodRef.current; // What: Rail Current Element. Why: There is nothing to animate before the rail itself has mounted. How: This reads the live node raiRefFun last wrote.

		if ( !raiCurEle ) return; // What: No Rail Guard. Why: The rail may not be mounted yet, such as while its own Collapse is still closed. How: This bails out of the effect early when there is no rail element to measure.



		const firMapObj = flpFirRef.current;                               // What: First Map Object. Why: This is the map of each pill's own previous x position, read and then overwritten below. How: This is read once from flpFirRef.current and reused throughout this effect run.
		const pilNodArr = [ ...raiCurEle.querySelectorAll( '.cnd-pill' ) ]; // What: Pill Node Array. Why: Every currently-rendered pill needs to be measured and possibly animated. How: This queries every '.cnd-pill' element inside the rail and spreads the NodeList into a real array.
		const redMotBoo = reduceMotion();                                  // What: Reduce Motion Boolean. Why: A user who prefers reduced motion should never see this FLIP tween. How: This is checked once per run and read by every pill below.


		pilNodArr.forEach( ( pilCurEle ) => { // What: Pill Animate Loop. Why: Every pill needs its own individual FLIP tween (or fade-in, if newly pinned), since each may have moved a different distance. How: This computes each pill's own delta from firMapObj and plays the matching animation.


			const pilIdStr = pilCurEle.dataset.cid;   // What: Pill Id String. Why: firMapObj is keyed by each pill's own conditional id, not the DOM node itself. How: This reads the pill's own data-cid attribute.
			const preXNum  = firMapObj.get( pilIdStr ); // What: Previous X Number. Why: A FLIP tween needs to know where this exact pill sat before the reorder. How: This looks up pilIdStr in firMapObj, undefined if this pill is brand new.
			const newXNum  = pilCurEle.offsetLeft;      // What: New X Number. Why: The tween's own end point is wherever the pill actually landed after the reorder. How: This reads the pill's own current offsetLeft.


			if ( redMotBoo ) return; // What: Reduced Motion Guard. Why: This pill should snap silently instead of tweening. How: This skips straight to the next pill without animating.



			if ( preXNum == null ) { // What: Newly Pinned Guard. Why: A pill with no recorded previous position was just pinned to the front for the first time. How: This plays a fade-and-rise-in animation instead of a horizontal FLIP tween.


				pilCurEle.animate( [ { opacity : 0, transform : 'translateY(4px)' }, { opacity : 1, transform : 'none' } ], { duration : 260, easing : 'cubic-bezier(.2,.7,.3,1)' } ); // What: Pin Animation Call. Why: A brand-new front position deserves its own entrance rather than a slide from nowhere. How: This fades and rises the pill into place over 260ms.


			}

			else {


				const difXNum = preXNum - newXNum; // What: Diff X Number. Why: The FLIP tween's own starting transform is the distance this pill needs to travel back from its new position. How: This subtracts the new x from the previous x.


				if ( Math.abs( difXNum ) > 1 ) pilCurEle.animate( [ { transform : `translateX(${ difXNum }px)` }, { transform : 'none' } ], { duration : 320, easing : 'cubic-bezier(.2,.7,.3,1)' } ); // What: Flip Animation Guard. Why: A pill that didn't actually move by more than a rounding pixel needs no tween at all. How: This plays the invert-then-play transform over 320ms only when difXNum is meaningfully non-zero.


			}


		} );



		firMapObj.clear(); // What: First Map Clear. Why: The map must not accumulate stale positions from a pill that no longer exists. How: This empties firMapObj before it's repopulated just below.

		pilNodArr.forEach( ( pilCurEle ) => firMapObj.set( pilCurEle.dataset.cid, pilCurEle.offsetLeft ) ); // What: First Map Populate. Why: The NEXT reorder's own FLIP tween needs this run's final positions as its own "previous" baseline. How: This records every pill's own current offsetLeft, keyed by its own conditional id.


		if ( raiCurEle.scrollLeft > 1 ) raiCurEle.scrollTo( { left : 0, behavior : redMotBoo ? 'auto' : 'smooth' } ); // What: Rail Scroll Reset Guard. Why: A pin-to-front reorder means the top pill is now at the rail's own start, which should be visible. How: This glides the rail back to its own left edge whenever it wasn't already there.


	}, [ picObj.conditionalId, cndOnBoo, cndIteArr.length ] ); // What: Effect Dependency Array. Why: This effect must re-run whenever the attached conditional changes, the toggle flips, or the available conditionals themselves change count. How: picObj.conditionalId is the actual reorder trigger; cndOnBoo covers the rail appearing/disappearing; cndIteArr.length covers a conditional being added or removed elsewhere.


	const [ newGroBoo, setNewGroBoo ] = React.useState( false ); // What: New Group Boolean And Setter. Why: The Group selector's own inline "+ New Group" create mode needs an on/off flag. How: This is flipped true by the "+ New Group" pill and closed by closeNewGroup below.
	const [ pilRetBoo, setPilRetBoo ] = React.useState( false ); // What: Pill Returning Boolean And Setter. Why: The "+ New Group" pill needs to know when it's mid-return-animation after the input closes. How: This is set true by clsGroFun and cleared 200ms later.
	const [ newGroStr, setNewGroStr ] = React.useState( '' );    // What: New Group String And Setter. Why: The inline input needs its own in-progress text, separate from any real group name. How: This is read on blur/Enter and normalized into a real group by cmtGroFun.
	const newGroRef                   = React.useRef( null );    // What: New Group Reference. Why: The inline input must be focused the instant it mounts. How: This is attached to the input's own ref prop and focused by the effect below.
	const groPilRef                   = React.useRef( null );    // What: Group Pill Reference. Why: Both the scroll-edge-fade effect and the "keep scrolled to the end while growing" effect below need the live pill row element. How: This is attached to the pill row's own ref prop.


	const groFlpRef = React.useRef( null ); // What: Group Flip Reference. Why: Selecting a group re-sorts its pill to the front, and this needs each pill's own previous x to animate that shuffle instead of snapping. How: This starts null and is populated by the layout effect below.

	React.useLayoutEffect( () => { // What: Group Pills Flip Effect. Why: Re-sorting the group pills on selection should glide, not snap, matching the conditional rail's own FLIP treatment. How: This is guarded against measuring while the panel is hidden, then tweens each pill by its own previous-to-new x delta.


		const groCurEle = groPilRef.current; // What: Group Current Element. Why: There is nothing to animate before the group pill row itself has mounted. How: This reads the live node from groPilRef.

		if ( !groCurEle || groCurEle.offsetParent === null ) return; // What: Hidden Guard. Why: Measuring a hidden (offsetParent null) row would capture stale, meaningless coordinates. How: This bails out of the effect when the row isn't actually mounted or is currently hidden.



		const pilNodArr = [ ...groCurEle.querySelectorAll( '.picker-group-pill' ) ]; // What: Pill Node Array. Why: Every currently-rendered group pill needs to be checked for movement. How: This queries every '.picker-group-pill' element inside the row and spreads the NodeList into a real array.
		const preMapObj = groFlpRef.current;                                        // What: Previous Map Object. Why: A FLIP tween needs each pill's own position from before this render's reorder. How: This reads whatever the previous run of this effect recorded.


		if ( preMapObj && !reduceMotion() ) { // What: Has Previous Guard. Why: The very first run has nothing to compare against, and a reduced-motion user should never see this tween. How: This only attempts to animate once a previous snapshot exists and motion isn't reduced.


			pilNodArr.forEach( ( pilCurEle ) => { // What: Pill Animate Loop. Why: Every pill needs its own individual tween, since each may have moved a different distance (or none at all). How: This computes each pill's own delta from preMapObj and plays a matching transform.


				const oldXNum = preMapObj.get( pilCurEle.dataset.g ); // What: Old X Number. Why: This pill's own previous position is keyed by its own group name. How: This looks up the pill's own data-g attribute in preMapObj.

				if ( oldXNum == null ) return; // What: New Pill Guard. Why: A pill with no recorded previous position is brand new and has nothing to tween from. How: This skips straight to the next pill.


				const difXNum = oldXNum - pilCurEle.offsetLeft; // What: Diff X Number. Why: The tween's own starting transform is the distance this pill needs to travel back from its new position. How: This subtracts the pill's own current offsetLeft from oldXNum.

				if ( Math.abs( difXNum ) > 1 ) pilCurEle.animate( [ { transform : `translateX(${ difXNum }px)` }, { transform : 'none' } ], { duration : 320, easing : 'cubic-bezier(.2,.7,.3,1)' } ); // What: Flip Animation Guard. Why: A pill that didn't actually move by more than a rounding pixel needs no tween at all. How: This plays the invert-then-play transform over 320ms only when difXNum is meaningfully non-zero.


			} );


		}


		const nexMapObj = new Map();                                                                    // What: Next Map Object. Why: The NEXT run of this effect needs this run's own final positions as its own "previous" baseline. How: This starts empty and is filled by the loop just below.
		pilNodArr.forEach( ( pilCurEle ) => nexMapObj.set( pilCurEle.dataset.g, pilCurEle.offsetLeft ) ); // What: Next Map Populate. Why: Every pill's own current position must be recorded for next time. How: This records each pill's own current offsetLeft, keyed by its own group name.
		groFlpRef.current = nexMapObj; // What: Group Flip Update. Why: This run's own positions must replace whatever the previous run recorded. How: This overwrites groFlpRef.current with nexMapObj.


		if ( groCurEle.scrollLeft > 1 ) groCurEle.scrollTo( { left : 0, behavior : reduceMotion() ? 'auto' : 'smooth' } ); // What: Group Scroll Reset Guard. Why: A pin-to-front reorder means the selected group is now the leftmost pill, which should be visible. How: This glides the row back to its own left edge whenever it wasn't already there.


	}, [ picObj.group ] ); // What: Effect Dependency Array. Why: The group pills only ever need to reorder when the picker's own selected group actually changes. How: picObj.group is the single value this effect's own change-detection is built around.

	React.useEffect( () => { // What: Group Pills Fade Effect. Why: The group pill row's own scroll-edge fades (only visible once it actually overflows on small screens) need to track its live scroll position. How: This toggles at-start/at-end the same way every other pill rail in this file does, and re-checks on scroll/resize.


		const groCurEle = groPilRef.current; // What: Group Current Element. Why: There is nothing to wire up before the row itself has mounted. How: This reads the live node from groPilRef.

		if ( !groCurEle ) return; // What: No Element Guard. Why: The row may not be mounted yet. How: This bails out of the effect early when there is no row to wire up.


		const updFadFun = () => { // What: Update Fade Function. Why: The fade classes need recomputing on every relevant change. How: This toggles at-start/at-end based on the row's own scrollWidth/clientWidth/scrollLeft.


			const canScrBoo = groCurEle.scrollWidth - groCurEle.clientWidth > 1;                                  // What: Can Scroll Boolean. Why: A row that doesn't overflow at all should never show either fade edge. How: This is true only when the row's own content is wider than its own visible box by more than a rounding pixel.
			const atStrBoo  = !canScrBoo || groCurEle.scrollLeft <= 1;                                            // What: At Start Boolean. Why: The left fade should hide once the row can't scroll at all or is already at its own start. How: This combines canScrBoo with the row's own current scrollLeft.
			const atEndBoo  = !canScrBoo || groCurEle.scrollLeft + groCurEle.clientWidth >= groCurEle.scrollWidth - 1; // What: At End Boolean. Why: The right fade should hide once the row can't scroll at all or is already at its own end. How: This combines canScrBoo with the row's own current scroll position.

			groCurEle.classList.toggle( 'at-start', atStrBoo ); // What: At Start Toggle. Why: This is the actual class CSS reads to hide the left fade. How: This applies atStrBoo.
			groCurEle.classList.toggle( 'at-end', atEndBoo );   // What: At End Toggle. Why: This is the actual class CSS reads to hide the right fade. How: This applies atEndBoo.


		};


		updFadFun(); // What: Initial Fade Call. Why: The fade classes need to reflect the row's own real layout immediately on mount. How: This invokes updFadFun once, synchronously.

		groCurEle.addEventListener( 'scroll', updFadFun, { passive : true } ); // What: Group Scroll Listener. Why: Scrolling the row itself is the most common way its own edges change. How: This re-runs updFadFun on every scroll event, passively so it never blocks the scroll itself.

		window.addEventListener( 'resize', updFadFun ); // What: Window Resize Listener. Why: A viewport resize can also change how much of the row is visible. How: This re-runs updFadFun on every window resize event.



		return () => { // What: Effect Cleanup Function. Why: Both listeners must not outlive this effect run. How: This removes the exact same updFadFun reference from both the row and the window.


			groCurEle.removeEventListener( 'scroll', updFadFun ); // What: Group Scroll Listener Teardown. Why: This matches the addEventListener above. How: This removes updFadFun from groCurEle.

			window.removeEventListener( 'resize', updFadFun ); // What: Window Resize Listener Teardown. Why: This matches the addEventListener above. How: This removes updFadFun from window.


		};


	}, [] ); // What: Effect Dependency Array. Why: This effect only ever needs to wire up once, on mount, since it reads groPilRef.current directly rather than depending on any reactive value. How: An empty array means it never re-subscribes.

	React.useEffect( () => { // What: New Group Focus Effect. Why: The inline "+ New Group" input must be focused the instant it appears, and the growing row must stay scrolled to its own end throughout the unfurl animation. How: This focuses newGroRef and, while newGroBoo is true, re-pins the row's own scrollLeft on every animation frame for 280ms.


		if ( !newGroBoo || !newGroRef.current ) return; // What: Not Open Guard. Why: There is nothing to focus or pin while the inline input isn't showing. How: This bails out of the effect early whenever newGroBoo is false or the input hasn't mounted yet.



		newGroRef.current.focus(); // What: New Group Focus Call. Why: A user opening this control expects to type immediately. How: This focuses the freshly-mounted input.


		const groCurEle = groPilRef.current; // What: Group Current Element. Why: The scroll-pin loop below needs the live pill row element. How: This reads the live node from groPilRef.

		if ( !groCurEle ) return; // What: No Row Guard. Why: There is nothing to scroll-pin without the row itself. How: This bails out of the rest of the effect when the row hasn't mounted.



		let rafIdeNum; // What: Raf Identifier Number. Why: The pin loop below needs to be cancellable on cleanup. How: This is assigned by every requestAnimationFrame call below and read by the cleanup return.

		const staTimNum = performance.now(); // What: Start Time Number. Why: The pin loop must stop after a fixed duration matching the unfurl animation, not run forever. How: This records the loop's own start time to compare against on every frame.

		const pinScrFun = ( curTimNum ) => { // What: Pin Scroll Function. Why: The existing pills must slide left IN SYNC with the input's own growth, one continuous motion, instead of a jump once the animation finishes. How: This re-scrolls the row to its own full width every frame for 280ms.


			groCurEle.scrollLeft = groCurEle.scrollWidth; // What: Scroll Pin Write. Why: This is the actual pin: keeping the row scrolled all the way to its own end. How: This sets scrollLeft to scrollWidth every frame.

			if ( curTimNum - staTimNum < 280 ) rafIdeNum = requestAnimationFrame( pinScrFun ); // What: Next Frame Guard. Why: The pin loop must stop once the unfurl animation's own duration has elapsed. How: This schedules another frame only while under 280ms have passed since staTimNum.


		};

		rafIdeNum = requestAnimationFrame( pinScrFun ); // What: Pin Loop Start. Why: The loop above does nothing until it's actually scheduled. How: This kicks off the first frame of pinScrFun.



		return () => cancelAnimationFrame( rafIdeNum ); // What: Effect Cleanup Return. Why: A stale pin loop must not keep running after newGroBoo flips false or the component unmounts. How: This cancels whichever frame rafIdeNum currently points at.


	}, [ newGroBoo ] ); // What: Effect Dependency Array. Why: This effect's own focus-and-pin sequence only needs to run when the inline input actually opens. How: newGroBoo is the single value this effect's own guard is built around.


	const orgGroRef = React.useRef( picObj.group ); // What: Original Group Reference. Why: The group choice list below must keep listing the picker's ORIGINAL group even if it's since been moved away mid-edit, so a stray click is recoverable until Save. How: This snapshots picObj.group once, on mount, and is never reassigned.

	const groChoArr = React.useMemo( () => { // What: Group Choices Array. Why: The Group selector needs every existing group, plus this picker's own current and original group in case either isn't otherwise represented. How: This builds the combined list and sorts the picker's own current group to the front.


		const choArr = [ ...( allGroArr || [] ) ]; // What: Choice Array. Why: The full choice list starts from every group already in use elsewhere. How: This copies allGroArr so the pushes below never mutate the caller's own array.

		if ( picObj.group && !choArr.includes( picObj.group ) ) choArr.push( picObj.group ); // What: Current Group Guard. Why: A picker's own current group might be the only member of a group not otherwise listed. How: This appends picObj.group when it's set and not already present.

		if ( orgGroRef.current && !choArr.includes( orgGroRef.current ) ) choArr.push( orgGroRef.current ); // What: Original Group Guard. Why: The picker's ORIGINAL group must stay listed even if this (its only member) has been moved away mid-edit. How: This appends orgGroRef.current when it's set and not already present.



		return choArr.sort( ( aStrArg, bStrArg ) => ( bStrArg === picObj.group ? 1 : 0 ) - ( aStrArg === picObj.group ? 1 : 0 ) ); // What: Choice Array Return. Why: The picker's own current group should sort first, ahead of every other choice. How: This sorts by whichever of the two sides equals picObj.group.


	}, [ allGroArr, picObj.group ] ); // What: Effect Dependency Array. Why: The choice list only needs recomputing when the available groups or the picker's own current group changes. How: allGroArr covers a group being added/removed elsewhere; picObj.group covers this picker's own selection changing.


	const clsGroFun = () => { // What: Close Group Function. Why: Both a commit and a cancel need the exact same teardown: unmount the input, clear its text, and play the "+ New Group" pill's own return animation. How: This closes newGroBoo, clears newGroStr, and flags pilRetBoo for 200ms.


		setNewGroBoo( false );                          // What: New Group Close Call. Why: This unmounts the inline input immediately. How: This sets newGroBoo to false.
		setNewGroStr( '' );                             // What: New Group Text Clear. Why: A future reopen should start from an empty input, not leftover text. How: This resets newGroStr to an empty string.
		setPilRetBoo( true );                            // What: Pill Returning Start. Why: The "+ New Group" pill needs to visibly animate back in, symmetric with how it vanished on open. How: This flags pilRetBoo true, applying the returning class.
		setTimeout( () => setPilRetBoo( false ), 200 );   // What: Pill Returning End. Why: The returning class only needs to apply for the duration of its own animation. How: This clears pilRetBoo 200ms later.


	};

	const cmtGroFun = () => { // What: Commit Group Function. Why: Pressing Enter (or clicking the checkmark) should actually create/select the typed group, not just close the input. How: This normalizes the typed name and, if valid, updates the picker's own group before closing.


		const tidNamStr = normalizeGroupName( newGroStr, groChoArr ); // What: Tidy Name String. Why: A typed group name needs the same tidy-casing/collision handling every other group name gets. How: This calls the shared normalizeGroupName helper against the current choice list.

		if ( tidNamStr ) actObj.updatePicker( picObj.id, { group : tidNamStr } ); // What: Update Picker Guard. Why: An empty or otherwise invalid typed name should not create a group at all. How: This only commits the picker's own group when tidNamStr is truthy.

		clsGroFun(); // What: Close Group Call. Why: A commit still needs the same teardown every close does. How: This runs the shared close routine after the update above.


	};

	const canGroFun = () => { clsGroFun(); }; // What: Cancel Group Function. Why: Escape (or the cancel button) should discard the typed text without creating anything. How: This just runs the shared close routine, with no update call.


	const snpRef = React.useRef( { // What: Snapshot Reference. Why: Controls opening (this component mounting) is the moment every field must be remembered, so Cancel can revert every change made while it was open. How: This freezes a shallow copy of the picker, every one of its items, and its own daily-generator membership, captured once on mount.


		picker  : { ...picObj },                                       // What: Picker. Why: The picker's own fields (name, mode, schedule, etc.) all need to be revertible. How: This is a shallow copy of picObj as it existed the instant Controls opened.
		items   : iteArr.map( ( iteCurObj ) => ( { ...iteCurObj } ) ), // What: Items. Why: A Refill/Fill performed while Controls is open must also be revertible. How: This is a shallow copy of every item as it existed the instant Controls opened.
		inDaily : inDaiBoo                                             // What: In Daily. Why: Toggling daily-generator membership while Controls is open must also be revertible. How: This is inDaiBoo as it existed the instant Controls opened.


	} );

	const revStaFun = () => { // What: Revert State Function. Why: Cancel must put the picker, every one of its items, and its daily-generator membership back exactly as they were when Controls opened. How: This replaces the picker and every item from snpRef.current, then reconciles daily-generator membership.


		actObj.replacePicker( picObj.id, snpRef.current.picker ); // What: Replace Picker Call. Why: Every field edited while Controls was open must be rolled back. How: This overwrites the live picker with the snapshot taken on mount.

		snpRef.current.items.forEach( ( iteCurObj ) => actObj.replaceItem( iteCurObj.id, iteCurObj ) ); // What: Replace Items Loop. Why: Every item touched (e.g. by a Refill) while Controls was open must also be rolled back. How: This overwrites each live item with its own snapshot.


		const hasDaiBoo = daiIdeArr.includes( picObj.id ); // What: Has Daily Boolean. Why: Reconciling membership needs to know the picker's CURRENT daily-generator status before deciding whether to add or remove it. How: This checks whether picObj.id is currently in daiIdeArr.

		if ( snpRef.current.inDaily && !hasDaiBoo ) actObj.setDailyPickers( [ ...daiIdeArr, picObj.id ] ); // What: Re-Add Daily Guard. Why: The picker was in the daily generator when Controls opened but has since been removed. How: This adds picObj.id back into the daily-generator list.

		else if ( !snpRef.current.inDaily && hasDaiBoo ) actObj.setDailyPickers( daiIdeArr.filter( ( curIdeStr ) => curIdeStr !== picObj.id ) ); // What: Re-Remove Daily Guard. Why: The picker was NOT in the daily generator when Controls opened but has since been added. How: This filters picObj.id back out of the daily-generator list.


	};


	const donRef = React.useRef( null ); // What: Done Reference. Why: The mount-cleanup effect below needs to know, at unmount time, whether the user already closed explicitly (Cancel or Save) or is closing implicitly (tab-switch/reload). How: This starts null and is set to 'cancel' or 'saved' by the matching handler.
	const canFun    = () => { donRef.current = 'cancel'; revStaFun(); onColFun(); }; // What: Cancel Function. Why: Cancel is an explicit close that must also revert every change. How: This marks donRef, reverts state, then collapses Controls.
	const savClsFun = () => { donRef.current = 'saved'; onColFun(); };              // What: Save Close Function. Why: Save is an explicit close that keeps every change already committed live. How: This marks donRef, then simply collapses Controls without reverting anything.

	const resStoFun = () => { // What: Restore Storage Function. Why: An implicit close (reload) must not let unsaved edits survive in the warm localStorage mirror, even though the live store already has them. How: This synchronously rewrites the mirrored picker/items/daily entry back to the snapshot taken on mount.


		try {


			const rawStr = localStorage.getItem( 'easemylife.v2' ); // What: Raw String. Why: The mirror must actually exist before there's anything to roll back. How: This reads the same key the storage layer's own warm mirror uses.

			if ( !rawStr ) return; // What: No Mirror Guard. Why: A brand-new install or a wiped mirror has nothing to restore. How: This bails out of the whole restore when rawStr is falsy.


			const staObj = JSON.parse( rawStr ); // What: State Object. Why: The mirror's own fields need to be read and selectively rewritten. How: This parses the raw JSON string into a plain object.

			if ( Array.isArray( staObj.pickers ) ) staObj.pickers = staObj.pickers.map( ( picCurObj ) => picCurObj.id === picObj.id ? snpRef.current.picker : picCurObj ); // What: Pickers Rollback Guard. Why: Only this one picker's own entry needs replacing. How: This maps every picker through unchanged except a match on picObj.id, which is replaced by the snapshot.


			const iteMapObj = new Map( snpRef.current.items.map( ( iteCurObj ) => [ iteCurObj.id, iteCurObj ] ) ); // What: Item Map Object. Why: Rolling back every touched item needs an id-keyed lookup, not a linear scan per item. How: This builds a Map from the snapshot's own items, keyed by id.

			if ( Array.isArray( staObj.items ) ) staObj.items = staObj.items.map( ( iteCurObj ) => iteMapObj.has( iteCurObj.id ) ? iteMapObj.get( iteCurObj.id ) : iteCurObj ); // What: Items Rollback Guard. Why: Every item the snapshot covers needs replacing; anything else stays untouched. How: This maps every item through unchanged except an id found in iteMapObj, which is replaced by the snapshot's own copy.


			if ( staObj.daily ) { // What: Daily Rollback Guard. Why: Daily-generator membership is its own separate field and needs its own reconciliation, mirroring revStaFun's own logic. How: This only runs when the mirror actually has a daily object at all.


				const idsArr    = staObj.daily.pickerIds || []; // What: Ids Array. Why: Membership reconciliation needs the mirror's own current list of daily picker ids. How: This reads staObj.daily.pickerIds, falling back to an empty array.
				const hasDaiBoo = idsArr.includes( picObj.id ); // What: Has Daily Boolean. Why: Same reasoning as revStaFun's own check, applied to the mirror instead of the live store. How: This checks whether picObj.id is currently in idsArr.


				if ( snpRef.current.inDaily && !hasDaiBoo ) staObj.daily.pickerIds = [ ...idsArr, picObj.id ]; // What: Re-Add Daily Guard. Why: The mirror must match whatever revStaFun would also restore. How: This adds picObj.id back into the mirrored list.

				else if ( !snpRef.current.inDaily && hasDaiBoo ) staObj.daily.pickerIds = idsArr.filter( ( curIdeStr ) => curIdeStr !== picObj.id ); // What: Re-Remove Daily Guard. Why: Same reasoning as the guard above, for the opposite direction. How: This filters picObj.id back out of the mirrored list.


			}


			localStorage.setItem( 'easemylife.v2', JSON.stringify( staObj ) ); // What: Mirror Write Call. Why: The rolled-back object above only takes effect once it's actually written back. How: This overwrites the same mirror key with the freshly-stringified staObj.


		}

		catch ( errObj ) {} // What: Restore Error Guard. Why: A malformed or unavailable mirror must never crash the app on close. How: This silently swallows any parse/storage error, leaving the mirror as it was.


	};

	React.useEffect( () => { // What: Mount Cleanup Effect. Why: Controls opening replaces whichever item editor was previously open, and closing (implicitly or not) must revert unsaved edits exactly like the item editor's own guard does. How: This disarms any pending revert from the replaced editor on mount, then arms its own revert (or restores the mirror) on unmount.


		window.__editGuard.disarm(); // What: Edit Guard Disarm Call. Why: A pending revert from whichever editor Controls just replaced must not fire later and clobber this component's own state. How: This cancels that pending revert.


		const onHidFun = () => { if ( !donRef.current ) resStoFun(); }; // What: On Hide Function. Why: A reload/tab-hide is an implicit close and must roll back the warm mirror synchronously, since there's no time for React's own unmount cleanup. How: This only restores when donRef.current is still null, meaning neither Cancel nor Save ever ran.

		window.addEventListener( 'pagehide', onHidFun ); // What: Pagehide Subscribe Call. Why: This is the actual event that fires just before the page is torn down. How: This registers onHidFun to run on pagehide.


		return () => { // What: Effect Cleanup Function. Why: Both the listener and (on an implicit unmount) the revert-arming must happen exactly once, when this component actually goes away. How: This removes the pagehide listener and, if still undone, arms window.__editGuard with revStaFun.


			window.removeEventListener( 'pagehide', onHidFun ); // What: Pagehide Unsubscribe Call. Why: This listener must not outlive this component. How: This removes the exact same onHidFun reference that was added.

			if ( !donRef.current ) window.__editGuard.arm( revStaFun ); // What: Implicit Close Guard. Why: An unmount with no explicit Cancel/Save (e.g. switching tabs) must still discard unsaved edits. How: This arms the shared edit guard with revStaFun only when donRef.current is still null.


		};


	}, [] ); // What: Effect Dependency Array. Why: This effect only ever needs to run its setup/teardown once, on mount and unmount. How: An empty array means it never re-subscribes.


	return (


		<div className='rd-ctl-body'>{ /* What: Controls Body Div Element. Why: This is PicConCom's own root element, holding Picker Details, How it picks, When it runs, Item Controls, and the footer. How: This renders as a plain div; every field below commits through actObj. */ }


			<div className='rd-ctl-group rd-ctl-group--basics'>{ /* What: Basics Group Div Element. Why: Name and Group are grouped as the picker's own basic identity fields. How: This wraps the subhead and the name/group rows below. */ }


				<div className='rd-ctl-subhead'>Picker Details</div>{ /* What: Basics Subhead Div Element. Why: Every Controls group needs its own labeled subhead. How: This renders the literal text "Picker Details". */ }

				<div className='rd-basics-row'>{ /* What: Name Row Div Element. Why: The Name field needs its own labeled row. How: This wraps the label span and the name input. */ }


					<span className='rd-basics-lbl'>Name</span>{ /* What: Name Label Span Element. Why: The name input needs a visible label beside it. How: This renders the literal text "Name". */ }

					<input
						className='rd-basics-name'
						type='text'
						value={ picObj.name }
						placeholder='Picker name'
						maxLength={ 40 }
						aria-label='Picker name'
						onChange={ ( chgEveObj ) => actObj.updatePicker( picObj.id, { name : chgEveObj.target.value } ) }
						onBlur={ ( blrEveObj ) => {

							const namTriStr = blrEveObj.target.value.trim(); // What: Name Trimmed String. Why: A blur commit should tidy the name, not commit stray whitespace. How: This trims blrEveObj's own current value.

							if ( namTriStr ) actObj.renamePicker( picObj.id, namTriStr ); // What: Rename Picker Guard. Why: Blurring on an emptied field should not commit a blank name. How: This only calls renamePicker when namTriStr is non-empty.

						} }
						onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Enter' ) keyEveObj.currentTarget.blur(); } }
					/>{ /* What: Name Input Element. Why: A picker's own name is edited live rather than through a separate form. How: This commits every keystroke immediately, tidies/commits the final name on blur, and blurs on Enter. */ }


				</div>

				<div className='rd-basics-row rd-basics-row--group'>{ /* What: Group Row Div Element. Why: The Group field needs its own labeled row. How: This wraps the label span and the group pill selector below. */ }


					<span className='rd-basics-lbl'>Group</span>{ /* What: Group Label Span Element. Why: The group selector needs a visible label beside it. How: This renders the literal text "Group". */ }

					<div
						className='rd-group-pills'
						ref={ groPilRef }
						role='radiogroup'
						aria-label='Picker group'
					>{ /* What: Group Pills Div Element. Why: This is the actual radiogroup of every existing group plus the inline "+ New Group" control. How: This maps groChoArr to one pill each, then either the inline input or the "+ New Group" pill. */ }


						{ groChoArr.map( ( groCurStr ) => ( // What: Group Choice Map. Why: One pill is needed per existing group choice. How: This maps groChoArr to one radio-role button each, keyed by its own name.


							<button
								key={ groCurStr }
								type='button'
								role='radio'
								data-g={ groCurStr }
								className={ ` picker-group-pill   ${ picObj.group === groCurStr ? 'is-on' : '' } ` }
								aria-checked={ picObj.group === groCurStr }
								onClick={ () => actObj.updatePicker( picObj.id, { group : groCurStr } ) }
							>{ groCurStr }</button> // What: Group Pill Button Element. Why: Clicking a pill selects that group for this picker. How: This marks itself checked when it matches picObj.group and commits groCurStr on click.


						) ) }

						{ newGroBoo ? ( // What: New Group Mode Check. Why: The inline create control replaces the "+ New Group" pill entirely while active. How: This renders the input+confirm+cancel trio while newGroBoo is true, otherwise the trigger pill.


							<span className='rd-group-new'>{ /* What: New Group Span Element. Why: The inline input and its 2 icon buttons need one wrapper to lay out together. How: This groups the text input with its own confirm and cancel buttons. */ }


								<input
									ref={ newGroRef }
									className='rd-group-new-input'
									type='text'
									value={ newGroStr }
									placeholder='Group name'
									maxLength={ 30 }
									aria-label='Group name'
									onChange={ ( chgEveObj ) => setNewGroStr( chgEveObj.target.value ) }
									onKeyDown={ ( keyEveObj ) => {

										if ( keyEveObj.key === 'Enter' ) cmtGroFun(); // What: Enter Commit Guard. Why: Enter should commit the typed group name immediately. How: This calls cmtGroFun when keyEveObj.key is 'Enter'.

										else if ( keyEveObj.key === 'Escape' ) canGroFun(); // What: Escape Cancel Guard. Why: Escape should discard the typed text instead. How: This calls canGroFun when keyEveObj.key is 'Escape'.

									} }
								/>{ /* What: New Group Input Element. Why: A brand-new group needs its own typed name before it can be created. How: This is a plain controlled text input, committed via cmtGroFun on Enter/checkmark, discarded via canGroFun on Escape/cancel. */ }

								<button
									className='rd-group-new-ok'
									type='button'
									disabled={ !newGroStr.trim() }
									aria-label='Create group'
									onClick={ cmtGroFun }
								>
									<Icon name='check' size={ 14 } />{ /* What: Icon. Why: The confirm button needs a recognizable checkmark glyph. How: This renders the 'check' icon at a fixed size. */ }
								</button>{ /* What: New Group Ok Button Element. Why: This is the explicit "create this group" affordance beside the input. How: This is disabled while newGroStr is empty and calls cmtGroFun on click. */ }

								<button
									className='rd-group-new-cancel'
									type='button'
									aria-label='Cancel'
									onClick={ canGroFun }
								>
									<Icon name='x' size={ 14 } />{ /* What: Icon. Why: The cancel button needs a recognizable close glyph. How: This renders the 'x' icon at a fixed size. */ }
								</button>{ /* What: New Group Cancel Button Element. Why: This is the explicit "discard this group" affordance beside the input. How: This calls canGroFun on click. */ }


							</span>


						) : ( // What: New Group Trigger Branch. Why: With no create-in-progress, the row just needs its own plain trigger pill instead of the input. How: This renders the else branch, taken while newGroBoo is false.


							<button
								type='button'
								className={ ` picker-group-pill   picker-group-pill--new   ${ pilRetBoo ? 'is-returning' : '' } ` }
								onClick={ () => setNewGroBoo( true ) }
							>
								<Icon name='plus' size={ 13 } />{ /* What: Icon. Why: The trigger pill needs a recognizable "add" glyph beside its own label. How: This renders the 'plus' icon at a fixed size. */ } New Group
							</button> // What: New Group Trigger Button Element. Why: This is the affordance that opens the inline create control. How: This opens newGroBoo on click, and plays its own return animation via pilRetBoo after a prior close.


						) }


					</div>


				</div>


			</div>

			<fieldset className='rd-ctl-group rd-ctl-group--picks'>{ /* What: Picks Group Fieldset Element. Why: The mode radio group is a real form control set and belongs in a fieldset. How: This wraps the legend and the mode radio group below. */ }


				<legend className='rd-ctl-subhead'>How it picks</legend>{ /* What: Picks Legend Element. Why: A fieldset needs its own legend to label the radio group it contains. How: This renders the literal text "How it picks". */ }

				<div className='rd-mode-radio'>{ /* What: Mode Radio Div Element. Why: Every supported mode needs its own selectable row. How: This maps Object.entries(MODES) to one label+radio+hint per mode. */ }


					{ Object.entries( MODES ).map( ( [ modKeyStr, modValObj ] ) => { // What: Mode Entries Map. Why: One row is needed per supported picking mode. How: This maps every [key, definition] pair in MODES to one label below.


						const modOnBoo = picObj.mode === modKeyStr; // What: Mode On Boolean. Why: The row's own selected state and its hint's open state both depend on whether this mode is the picker's current one. How: This compares modKeyStr against picObj.mode.


						return (


							<label
								key={ modKeyStr }
								className={ ` rd-mode-opt   ${ modOnBoo ? 'is-on' : '' } ` }
							>{ /* What: Mode Option Label Element. Why: Each mode is a real radio option, so its own label must wrap the input for a clickable hit area. How: This marks itself "is-on" when modOnBoo is true. */ }


								<input
									type='radio'
									name={ `mode_${ picObj.id }` }
									checked={ modOnBoo }
									onChange={ () => actObj.updatePicker( picObj.id, { mode : modKeyStr } ) }
								/>{ /* What: Mode Radio Input Element. Why: This is the actual selectable control for this mode. How: This is checked when modOnBoo is true and commits modKeyStr as the picker's own mode on change. */ }

								<span className='rd-mode-dot' aria-hidden='true'></span>{ /* What: Mode Dot Span Element. Why: The custom radio dot is drawn purely with CSS rather than the native control. How: This is an empty, decorative, screen-reader-hidden span. */ }

								<span className='rd-mode-text'>{ /* What: Mode Text Span Element. Why: The mode's own name and its expandable hint need to sit together beside the radio dot. How: This wraps the name span and the Collapse-wrapped hint below. */ }


									<span className='rd-mode-name'>{ modValObj.label }</span>{ /* What: Mode Name Span Element. Why: Every mode needs its own visible name. How: This renders modValObj's own label. */ }

									<Collapse open={ modOnBoo } instant={ isaNewBoo }>{ /* What: Collapse. Why: The hint expands/collapses on selection change, so the old row's hint folds away while the new one grows. How: This opens only for the currently-selected mode, instant (no animation) for a brand-new draft. */ }

										{ Array.isArray( modValObj.hint ) // What: Hint Content Check. Why: A mode's own hint can be either one paragraph or several. How: This maps every paragraph to its own span when hint is an array, otherwise renders the single hint directly.
											? modValObj.hint.map( ( parCurStr, parIndNum ) => <span key={ parIndNum } className='rd-mode-hint'>{ parCurStr }</span> )
											: <span className='rd-mode-hint'>{ modValObj.hint }</span> }

									</Collapse>


								</span>


							</label>


						);


					} ) }


				</div>


			</fieldset>

			<div className='rd-ctl-group rd-ctl-group--sched'>{ /* What: Schedule Group Div Element. Why: Attach-a-conditional and daily-generator membership + weekday/holiday gates all describe "when it runs". How: This wraps the subhead and every schedule row below. */ }


				<div className='rd-ctl-subhead'>When it runs</div>{ /* What: Schedule Subhead Div Element. Why: Every Controls group needs its own labeled subhead. How: This renders the literal text "When it runs". */ }

				<div className='sched-line'>{ /* What: Conditional Line Div Element. Why: The attach-a-conditional toggle needs its own labeled row. How: This wraps the label/sub text and the switch button below. */ }


					<span className='sched-line-label'>{ /* What: Conditional Label Span Element. Why: The toggle's own name and live explanation belong together. How: This wraps the lbl and sub spans below. */ }

						<span className='sched-line-lbl'>Attach a conditional</span>{ /* What: Conditional Lbl Span Element. Why: The row needs its own literal name. How: This renders the literal text "Attach a conditional". */ }

						<span className='sched-line-sub'>{ /* What: Conditional Sub Span Element. Why: The row needs a live one-line explanation of the current state. How: This renders whichever of the 2 explanations below matches whether a conditional is attached. */ }
							{ attCndObj
								? <>triggering rules provided by <strong>{ attCndObj.name }</strong> will prevent this picker from running</>
								: <>picker <strong>will always run</strong>, attaching a conditional will provide a trigger to prevent it from running</> }
						</span>

					</span>

					<button
						className={ ` switch   ${ cndOnBoo ? 'is-on' : '' } ` }
						role='switch'
						aria-checked={ cndOnBoo }
						aria-label='Attach a conditional'
						onClick={ () => setCndOnBoo( ( preValBoo ) => {

							const nexValBoo = !preValBoo; // What: Next Value Boolean. Why: The toggle's own next state is simply the opposite of its current one. How: This negates preValBoo.

							if ( !nexValBoo && picObj.conditionalId ) actObj.updatePicker( picObj.id, { conditionalId : null } ); // What: Detach Conditional Guard. Why: Turning the toggle off must also actually detach whatever conditional was attached. How: This clears conditionalId only when the toggle is turning off and one was actually set.

							return nexValBoo; // What: Next Value Return. Why: setCndOnBoo needs the toggle's own new state back. How: This returns nexValBoo.

						} ) }
					><i /></button>{ /* What: Conditional Switch Button Element. Why: This is the actual on/off control for attaching a conditional. How: This flips cndOnBoo and, when turning off, clears the picker's own conditionalId. */ }


				</div>

				<Collapse open={ cndOnBoo }>{ /* What: Collapse. Why: The conditional rail only needs to exist while the toggle is on. How: This opens only while cndOnBoo is true. */ }

					<div className='rd-cnd-rail-row'>{ /* What: Rail Row Div Element. Why: The conditional rail (or its empty-state message) needs its own row. How: This wraps whichever of the 2 branches below applies. */ }


						{ cndIteArr.length ? ( // What: Has Conditionals Check. Why: The rail only makes sense once at least one conditional exists. How: This renders the rail when cndIteArr has entries, otherwise an empty-state message.


							<div
								className='cnd-rail picker-groups'
								ref={ raiRefFun }
							>{ /* What: Conditional Rail Div Element. Why: This is the actual scrollable pill rail, alphabetical except the attached conditional pins to the front. How: This maps every conditional (sorted per pk.conditionalId first, then by name) to one pill each. */ }


								{ [ ...cndIteArr ].sort( ( aCndObj, bCndObj ) => {

									if ( aCndObj.id === picObj.conditionalId ) return -1; // What: Attached First Guard. Why: The currently-attached conditional always pins to the front. How: This sorts aCndObj ahead whenever it's the attached one.

									if ( bCndObj.id === picObj.conditionalId ) return 1; // What: Attached First Guard. Why: Same reasoning as above, for the other comparison side. How: This sorts bCndObj ahead whenever it's the attached one.

									return aCndObj.name.localeCompare( bCndObj.name ); // What: Alphabetical Fallback Return. Why: Every other pair sorts alphabetically by name. How: This compares aCndObj.name against bCndObj.name.

								} ).map( ( cndCurObj ) => ( // What: Conditional Pill Map. Why: One pill is needed per existing conditional. How: This maps the sorted list to one button each, keyed by its own id.


									<button
										key={ cndCurObj.id }
										type='button'
										data-cid={ cndCurObj.id }
										className={ ` cnd-pill   ${ picObj.conditionalId === cndCurObj.id ? 'is-on' : '' } ` }
										onClick={ () => actObj.updatePicker( picObj.id, { conditionalId : cndCurObj.id } ) }
									>
										<span className='cnd-pill-name'>{ cndCurObj.name }</span>{ /* What: Pill Name Span Element. Why: Every conditional pill needs its own visible name. How: This renders cndCurObj's own name. */ }

										<span className='cnd-pill-mode'>{ ( MODES[ cndCurObj.mode ] || {} ).label || cndCurObj.mode }</span>{ /* What: Pill Mode Span Element. Why: Every conditional pill also shows its own mode label. How: This looks up cndCurObj's own mode in MODES, falling back to the raw mode key. */ }

									</button> // What: Conditional Pill Button Element. Why: Clicking a pill attaches that conditional to this picker. How: This marks itself "is-on" when it matches picObj.conditionalId and commits cndCurObj.id on click.


								) ) }


							</div>


						) : ( // What: No Conditionals Branch. Why: With no conditionals to attach, the rail is replaced by a plain explanatory message. How: This renders the else branch, taken while cndIteArr is empty.


							<p className='rd-cnd-empty'>No conditionals yet. Create one in the Conditionals section below, then attach it here.</p>


						) }


					</div>

				</Collapse>

				<div className='sched-line'>{ /* What: Daily Line Div Element. Why: The daily-generator membership toggle needs its own labeled row. How: This wraps the label/sub text and the switch button below. */ }


					<span className='sched-line-label'>{ /* What: Daily Label Span Element. Why: The toggle's own name and live explanation belong together. How: This wraps the lbl and sub spans below. */ }

						<span className='sched-line-lbl'>In the daily generator</span>{ /* What: Daily Lbl Span Element. Why: The row needs its own literal name. How: This renders the literal text "In the daily generator". */ }

						<span
							key={ inDaiBoo ? 'on' : 'off' }
							className='sched-line-sub set-sub-fade'
						>{ /* What: Daily Sub Span Element. Why: The row needs a live one-line explanation, cross-faded via its own key change. How: This renders whichever of the 2 explanations below matches inDaiBoo. */ }
							{ inDaiBoo
								? <>will run <strong>every time</strong> the Today page's daily generator is run</>
								: <>can only be <strong>run manually</strong> in the Pickers tab</> }
						</span>

					</span>

					<button
						className={ ` switch   ${ inDaiBoo ? 'is-on' : '' } ` }
						aria-pressed={ inDaiBoo }
						aria-label={ `${ inDaiBoo ? 'Remove from' : 'Add to' } the daily generator` }
						onClick={ () => {

							const nexIdsArr = inDaiBoo ? daiIdeArr.filter( ( curIdeStr ) => curIdeStr !== picObj.id ) : [ ...daiIdeArr, picObj.id ]; // What: Next Ids Array. Why: Toggling membership means either removing or adding this picker's own id. How: This filters picObj.id out when currently a member, or appends it when not.

							actObj.setDailyPickers( nexIdsArr ); // What: Set Daily Pickers Call. Why: The toggle only takes effect once the new membership list is actually committed. How: This writes nexIdsArr as the app's own daily-generator membership.

						} }
					><i /></button>{ /* What: Daily Switch Button Element. Why: This is the actual on/off control for daily-generator membership. How: This adds or removes picObj.id from daiIdeArr on click. */ }


				</div>

				<Collapse open={ inDaiBoo }>{ /* What: Collapse. Why: The full cadence/days/holiday schedule only makes sense while this picker is actually in the daily generator. How: This opens only while inDaiBoo is true. */ }

					<React.Fragment>{ /* What: Schedule Fragment Element. Why: The 3 schedule rows below are true siblings with no shared wrapper of their own. How: This groups the cadence, days, and holiday rows without adding an extra DOM node. */ }


						<div className='sched-line'>{ /* What: Cadence Line Div Element. Why: The cadence (how often) control needs its own labeled row. How: This wraps the label/sub text and the cadence selects below. */ }


							<span className='sched-line-label'>{ /* What: Cadence Label Span Element. Why: The row's own name/help tip and live explanation belong together. How: This wraps the lbl row and sub span below. */ }

								<span className='sched-line-lbl pie-lbl-row'>How often?
									<InfoTip className='pie-help pie-help--sm' label={ CADENCE.tipFor( picObj.cadence ) }>?</InfoTip>{ /* What: Info Tip. Why: The cadence choice needs a fuller explanation available on demand. How: This shows CADENCE's own tip text for the picker's current cadence. */ }
								</span>

								<span
									key={ ( picObj.cadence || 'daily' ) + ( picObj.anchorDow ?? '' ) + ( picObj.anchorDom ?? '' ) + ( picObj.anchorMonth ?? '' ) + ( picObj.anchorDay ?? '' ) + ( picObj.dateMode ?? '' ) + ( picObj.nthOrdinal ?? '' ) + ( picObj.nthWeekday ?? '' ) }
									className='sched-line-sub set-sub-fade'
								>{ ( () => { // What: Cadence Sub Span Element. Why: The row needs a live one-line summary of the exact configured schedule, cross-faded via its own composite key. How: This computes and returns the matching summary JSX for the picker's current cadence/anchor fields.


									const cadStr    = picObj.cadence || 'daily';                                                                                                 // What: Cadence String. Why: Every branch below needs the picker's own resolved cadence. How: This reads picObj.cadence, defaulting to 'daily'.
									const dayFulArr = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];                                       // What: Day Full Array. Why: The weekly/monthly/yearly branches below all need full weekday names. How: This is indexed by anchorDow/nthWeekday below.
									const monFulArr = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]; // What: Month Full Array. Why: The yearly branch below needs the full month name. How: This is indexed by anchorMonth below.
									const ordSufFun = ( ordValNum ) => { const sufArr = [ 'th', 'st', 'nd', 'rd' ], remNum = ordValNum % 100; return ordValNum + ( sufArr[ ( remNum - 20 ) % 10 ] || sufArr[ remNum ] || sufArr[ 0 ] ); }; // What: Ordinal Suffix Function. Why: Every date-based branch below needs its own day number spelled with the correct "1st/2nd/3rd/4th" suffix. How: This picks the matching suffix from sufArr, handling the 11th/12th/13th exception via the mod-100 remainder.
									const isaNthBoo = picObj.dateMode === 'nthWeekday';                                                                                          // What: Is-A Nth Boolean. Why: Monthly/yearly cadences can anchor either to a fixed date or to an "nth weekday", which read very differently. How: This checks picObj.dateMode.
									const tailEndStr = ', and the pick will persist until marked as completed';                                                                 // What: Tail End String. Why: Every non-daily branch below ends with the same trailing clause. How: This is appended to each branch's own JSX below.


									if ( cadStr === 'daily' ) return ( CAD_OPT_ARR.find( ( optCurObj ) => optCurObj.keyStr === 'daily' ) || {} ).subEle; // What: Daily Branch Return. Why: The daily case reuses CadConCom's own canonical sub-explanation rather than duplicating it. How: This looks up the 'daily' entry in CAD_OPT_ARR.

									if ( cadStr === 'weekly' ) return <>surfaces once a week, <strong>every { dayFulArr[ picObj.anchorDow ?? 0 ] }</strong>{ tailEndStr }</>; // What: Weekly Branch Return. Why: A weekly cadence just needs its own anchor weekday named. How: This reads picObj.anchorDow into dayFulArr.

									if ( cadStr === 'monthly' ) { // What: Monthly Branch Guard. Why: A monthly cadence reads differently depending on whether it's anchored to a date or an nth weekday. How: This returns one of 2 summaries based on isaNthBoo.


										return isaNthBoo
											? <>surfaces once a month, <strong>on the { ordSufFun( picObj.nthOrdinal ?? 1 ) } { dayFulArr[ picObj.nthWeekday ?? 0 ] }</strong>{ tailEndStr }</>
											: <>surfaces once a month, <strong>on the { ordSufFun( picObj.anchorDom ?? 1 ) }</strong>{ tailEndStr }</>;


									}


									return isaNthBoo // What: Yearly Branch Return. Why: The only remaining cadence is yearly, which also reads differently anchored to a date vs. an nth weekday. How: This returns one of 2 summaries based on isaNthBoo.
										? <>surfaces once a year, <strong>on the { ordSufFun( picObj.nthOrdinal ?? 1 ) } { dayFulArr[ picObj.nthWeekday ?? 0 ] } of { monFulArr[ ( picObj.anchorMonth ?? 1 ) - 1 ] }</strong>{ tailEndStr }</>
										: <>surfaces once a year, <strong>on { monFulArr[ ( picObj.anchorMonth ?? 1 ) - 1 ] } { ordSufFun( picObj.anchorDay ?? 1 ) }</strong>{ tailEndStr }</>;


								} )() }</span>

							</span>

							<div className='sched-cad-ctls'>{ /* What: Cadence Controls Div Element. Why: The cadence dropdown plus every mode-specific anchor select need their own grouped row. How: This renders the cadence select, then whichever anchor selects match the current cadence/dateMode. */ }


								<select
									className='np-input rd-cad-sel'
									value={ picObj.cadence || 'daily' }
									aria-label='Cadence'
									onChange={ ( chgEveObj ) => actObj.updatePicker( picObj.id, { cadence : chgEveObj.target.value } ) }
								>
									<option value='daily'>Daily</option>
									<option value='weekly'>Weekly</option>
									<option value='monthly'>Monthly</option>
									<option value='yearly'>Yearly</option>
								</select>{ /* What: Cadence Select Element. Why: This is the top-level "how often" choice. How: This commits its own value directly as the picker's own cadence field. */ }

								{ picObj.cadence === 'weekly' && ( // What: Weekly Anchor Check. Why: Only a weekly cadence has a single anchor-weekday select. How: This renders the select only while picObj.cadence is 'weekly'.


									<select
										className='np-input rd-cad-sel'
										value={ picObj.anchorDow ?? 0 }
										aria-label='Anchor weekday'
										onChange={ ( chgEveObj ) => actObj.updatePicker( picObj.id, { anchorDow : parseInt( chgEveObj.target.value ) } ) }
									>
										{ [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ].map( ( dayNamStr, dayIndNum ) => ( // What: Weekday Option List Render. Why: One option is needed per real weekday. How: This maps the fixed weekday-name array to one option per entry, keyed by its own dayIndNum.

											<option key={ dayIndNum } value={ dayIndNum }>{ dayNamStr }</option>

										) ) }
									</select> // What: Anchor Weekday Select Element. Why: A weekly cadence needs exactly one weekday to anchor to. How: This commits the chosen index as picObj.anchorDow.


								) }

								{ ( picObj.cadence === 'monthly' || picObj.cadence === 'yearly' ) && ( // What: Date Mode Check. Why: Only monthly/yearly cadences let the user choose between a fixed date and an nth weekday. How: This renders the select only while picObj.cadence is 'monthly' or 'yearly'.


									<select
										className='np-input rd-cad-sel'
										value={ picObj.dateMode === 'nthWeekday' ? 'nthWeekday' : 'date' }
										aria-label='Day selection'
										onChange={ ( chgEveObj ) => actObj.updatePicker( picObj.id, { dateMode : chgEveObj.target.value } ) }
									>
										<option value='date'>Date</option>
										<option value='nthWeekday'>Weekday</option>
									</select> // What: Date Mode Select Element. Why: This is the switch between anchoring to a fixed date vs. an nth weekday. How: This commits its own value directly as the picker's own dateMode field.


								) }

								{ picObj.cadence === 'monthly' && ( picObj.dateMode === 'nthWeekday' ? ( // What: Monthly Anchor Check. Why: A monthly cadence's own anchor selects differ entirely depending on dateMode. How: This renders the nth-weekday pair when dateMode is 'nthWeekday', otherwise the single date-of-month select.


									<React.Fragment>{ /* What: Nth Weekday Fragment Element. Why: The week-of-month and weekday selects are true siblings with no shared wrapper of their own. How: This groups both selects without adding an extra DOM node. */ }


										<select
											className='np-input rd-cad-sel'
											value={ picObj.nthOrdinal ?? 1 }
											aria-label='Week of the month'
											onChange={ ( chgEveObj ) => actObj.updatePicker( picObj.id, { nthOrdinal : parseInt( chgEveObj.target.value ) } ) }
										>
											{ [ 1, 2, 3, 4, 5 ].map( ( ordValNum ) => ( // What: Ordinal Option List Render. Why: One option is needed per possible occurrence, 1st through 5th. How: This maps the fixed [1..5] array to one option per entry, keyed by its own ordValNum, labeled via CADENCE.summary.

												<option key={ ordValNum } value={ ordValNum }>{ CADENCE.summary( { cadence : 'monthly', anchorDom : ordValNum } ).split( '· ' )[ 1 ] }</option>

											) ) }
										</select>{ /* What: Nth Ordinal Select Element. Why: An nth-weekday monthly cadence needs its own "first/second/.../last" ordinal. How: This commits the chosen number as picObj.nthOrdinal. */ }

										<select
											className='np-input rd-cad-sel'
											value={ picObj.nthWeekday ?? 0 }
											aria-label='Weekday'
											onChange={ ( chgEveObj ) => actObj.updatePicker( picObj.id, { nthWeekday : parseInt( chgEveObj.target.value ) } ) }
										>
											{ [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ].map( ( dayNamStr, dayIndNum ) => ( // What: Weekday Option List Render. Why: One option is needed per real weekday. How: This maps the fixed weekday-name array to one option per entry, keyed by its own dayIndNum.

												<option key={ dayIndNum } value={ dayIndNum }>{ dayNamStr }</option>

											) ) }
										</select>{ /* What: Nth Weekday Select Element. Why: An nth-weekday monthly cadence also needs its own target weekday. How: This commits the chosen index as picObj.nthWeekday. */ }


									</React.Fragment>


								) : ( // What: Anchor Dom Branch. Why: A date-anchored monthly cadence needs its own plain day-of-month select instead. How: This renders the else branch, taken while dateMode isn't 'nthWeekday'.


									<select
										className='np-input rd-cad-sel'
										value={ picObj.anchorDom ?? 1 }
										aria-label='Anchor day of month'
										onChange={ ( chgEveObj ) => actObj.updatePicker( picObj.id, { anchorDom : parseInt( chgEveObj.target.value ) } ) }
									>
										{ Array.from( { length : 31 }, ( _, arrIndNum ) => arrIndNum + 1 ).map( ( domValNum ) => ( // What: Day Of Month Option List Render. Why: One option is needed per possible day of month, 1 through 31. How: This maps a generated 1-31 array to one option per entry, keyed by its own domValNum, labeled via CADENCE.summary.

											<option key={ domValNum } value={ domValNum }>{ CADENCE.summary( { cadence : 'monthly', anchorDom : domValNum } ).split( '· ' )[ 1 ] }</option>

										) ) }
									</select> // What: Anchor Dom Select Element. Why: A date-anchored monthly cadence needs its own day-of-month. How: This commits the chosen number as picObj.anchorDom.


								) ) }

								{ picObj.cadence === 'yearly' && ( picObj.dateMode === 'nthWeekday' ? ( // What: Yearly Anchor Check. Why: A yearly cadence's own anchor selects also differ entirely depending on dateMode. How: This renders the nth-weekday trio when dateMode is 'nthWeekday', otherwise the month+day pair.


									<React.Fragment>{ /* What: Nth Weekday Fragment Element. Why: The week-of-month, weekday, and month selects are true siblings with no shared wrapper of their own. How: This groups all 3 selects without adding an extra DOM node. */ }


										<select
											className='np-input rd-cad-sel'
											value={ picObj.nthOrdinal ?? 1 }
											aria-label='Week of the month'
											onChange={ ( chgEveObj ) => actObj.updatePicker( picObj.id, { nthOrdinal : parseInt( chgEveObj.target.value ) } ) }
										>
											{ [ 1, 2, 3, 4, 5 ].map( ( ordValNum ) => ( // What: Ordinal Option List Render. Why: One option is needed per possible occurrence, 1st through 5th. How: This maps the fixed [1..5] array to one option per entry, keyed by its own ordValNum, labeled via CADENCE.summary.

												<option key={ ordValNum } value={ ordValNum }>{ CADENCE.summary( { cadence : 'monthly', anchorDom : ordValNum } ).split( '· ' )[ 1 ] }</option>

											) ) }
										</select>{ /* What: Nth Ordinal Select Element. Why: An nth-weekday yearly cadence needs its own "first/second/.../last" ordinal. How: This commits the chosen number as picObj.nthOrdinal. */ }

										<select
											className='np-input rd-cad-sel'
											value={ picObj.nthWeekday ?? 0 }
											aria-label='Weekday'
											onChange={ ( chgEveObj ) => actObj.updatePicker( picObj.id, { nthWeekday : parseInt( chgEveObj.target.value ) } ) }
										>
											{ [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ].map( ( dayNamStr, dayIndNum ) => ( // What: Weekday Option List Render. Why: One option is needed per real weekday. How: This maps the fixed weekday-name array to one option per entry, keyed by its own dayIndNum.

												<option key={ dayIndNum } value={ dayIndNum }>{ dayNamStr }</option>

											) ) }
										</select>{ /* What: Nth Weekday Select Element. Why: An nth-weekday yearly cadence also needs its own target weekday. How: This commits the chosen index as picObj.nthWeekday. */ }

										<select
											className='np-input rd-cad-sel'
											value={ picObj.anchorMonth ?? 1 }
											aria-label='Anchor month'
											onChange={ ( chgEveObj ) => actObj.updatePicker( picObj.id, { anchorMonth : parseInt( chgEveObj.target.value ) } ) }
										>
											{ [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ].map( ( monNamStr, monIndNum ) => ( // What: Month Option List Render. Why: One option is needed per real month. How: This maps the fixed month-abbreviation array to one option per entry, keyed by its own 1-indexed monIndNum.

												<option key={ monIndNum } value={ monIndNum + 1 }>{ monNamStr }</option>

											) ) }
										</select>{ /* What: Anchor Month Select Element. Why: An nth-weekday yearly cadence also needs its own target month. How: This commits the chosen 1-based month number as picObj.anchorMonth. */ }


									</React.Fragment>


								) : ( // What: Date Anchor Branch. Why: A date-anchored yearly cadence needs its own plain month-and-day selects instead. How: This renders the else branch, taken while dateMode isn't 'nthWeekday'.


									<React.Fragment>{ /* What: Date Anchor Fragment Element. Why: The month and day-of-month selects are true siblings with no shared wrapper of their own. How: This groups both selects without adding an extra DOM node. */ }


										<select
											className='np-input rd-cad-sel'
											value={ picObj.anchorMonth ?? 1 }
											aria-label='Anchor month'
											onChange={ ( chgEveObj ) => actObj.updatePicker( picObj.id, { anchorMonth : parseInt( chgEveObj.target.value ) } ) }
										>
											{ [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ].map( ( monNamStr, monIndNum ) => ( // What: Month Option List Render. Why: One option is needed per real month. How: This maps the fixed month-abbreviation array to one option per entry, keyed by its own 1-indexed monIndNum.

												<option key={ monIndNum } value={ monIndNum + 1 }>{ monNamStr }</option>

											) ) }
										</select>{ /* What: Anchor Month Select Element. Why: A date-anchored yearly cadence needs its own target month. How: This commits the chosen 1-based month number as picObj.anchorMonth. */ }

										<select
											className='np-input rd-cad-sel'
											value={ Math.min( picObj.anchorDay ?? 1, CADENCE.daysInMonth( 2024, picObj.anchorMonth ?? 1 ) ) }
											aria-label='Anchor day'
											onChange={ ( chgEveObj ) => actObj.updatePicker( picObj.id, { anchorDay : parseInt( chgEveObj.target.value ) } ) }
										>
											{ Array.from( { length : CADENCE.daysInMonth( 2024, picObj.anchorMonth ?? 1 ) }, ( _, arrIndNum ) => arrIndNum + 1 ).map( ( domValNum ) => ( // What: Anchor Day Option List Render. Why: One option is needed per possible day within the anchor month's own real length. How: This maps a generated array sized by CADENCE.daysInMonth to one option per entry, keyed by its own domValNum.

												<option key={ domValNum } value={ domValNum }>{ domValNum }</option>

											) ) }
										</select>{ /* What: Anchor Day Select Element. Why: A date-anchored yearly cadence also needs its own day-of-month, clamped to whatever the chosen month actually allows. How: This commits the chosen number as picObj.anchorDay. */ }


									</React.Fragment>


								) ) }


							</div>

						</div>

						<div className='sched-line'>{ /* What: Days Line Div Element. Why: The weekday multi-select needs its own labeled row. How: This wraps the label/sub text and the WeekdayChips control below. */ }


							<span className='sched-line-label'>{ /* What: Days Label Span Element. Why: The row's own name and live explanation belong together. How: This wraps the lbl and sub spans below. */ }

								<span className='sched-line-lbl'>Days</span>{ /* What: Days Lbl Span Element. Why: The row needs its own literal name. How: This renders the literal text "Days". */ }

								<span
									key={ ( picObj.daysOfWeek || [] ).join( ',' ) }
									className='sched-line-sub set-sub-fade'
								>{ /* What: Days Sub Span Element. Why: The row needs a live one-line summary of the chosen weekdays, cross-faded via its own key. How: This lists every chosen day, or a prompt when none are chosen. */ }
									{ ( picObj.daysOfWeek && picObj.daysOfWeek.length )
										? <>runs in the daily generator every <strong>{ [ ...picObj.daysOfWeek ].sort( ( aDayNum, bDayNum ) => aDayNum - bDayNum ).map( ( dayNumVal ) => [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ][ dayNumVal ] ).join( ', ' ) }</strong></>
										: 'pick at least one day' }
								</span>

							</span>

							<WeekdayChips
								value={ picObj.daysOfWeek || [ 0, 1, 2, 3, 4, 5, 6 ] }
								size='sm'
								lockedDay={ picObj.cadence === 'weekly' ? ( picObj.anchorDow ?? 0 ) : null }
								lockedTip={ picObj.cadence === 'weekly' ? CADENCE.lockedDayTip( picObj.anchorDow ?? 0 ) : '' }
								onChange={ ( dayArrArg ) => actObj.updatePicker( picObj.id, { daysOfWeek : dayArrArg } ) }
							/>{ /* What: Weekday Chips. Why: This is the actual multi-select for which weekdays this picker runs on. How: This locks the anchor weekday when picObj.cadence is 'weekly', otherwise every day is freely toggleable. */ }


						</div>

						<div className='sched-line'>{ /* What: Holiday Line Div Element. Why: The skip-on-holidays toggle needs its own labeled row. How: This wraps the label/sub text and the switch button below. */ }


							<span className='sched-line-label'>{ /* What: Holiday Label Span Element. Why: The toggle's own name and live explanation belong together. How: This wraps the lbl and sub spans below. */ }

								<span className='sched-line-lbl'>Skip on holidays</span>{ /* What: Holiday Lbl Span Element. Why: The row needs its own literal name. How: This renders the literal text "Skip on holidays". */ }

								<span
									key={ picObj.skipHolidays ? 'on' : 'off' }
									className='sched-line-sub set-sub-fade'
								>{ /* What: Holiday Sub Span Element. Why: The row needs a live one-line explanation, cross-faded via its own key change. How: This renders whichever of the 2 explanations below matches picObj.skipHolidays. */ }
									{ picObj.skipHolidays
										? <><strong>will not run</strong> in the daily generator on holidays</>
										: <><strong>will run</strong> in the daily generator on holidays</> }
								</span>

							</span>

							<button
								className={ ` switch   ${ picObj.skipHolidays ? 'is-on' : '' } ` }
								aria-pressed={ !!picObj.skipHolidays }
								aria-label='Skip on holidays'
								onClick={ () => actObj.updatePicker( picObj.id, { skipHolidays : !picObj.skipHolidays } ) }
							><i /></button>{ /* What: Holiday Switch Button Element. Why: This is the actual on/off control for skipping holidays. How: This flips picObj.skipHolidays on click. */ }


						</div>


					</React.Fragment>

				</Collapse>

				<Collapse open={ !inDaiBoo }>{ /* What: Collapse. Why: The "runs on demand only" note only makes sense while this picker is NOT in the daily generator. How: This opens only while inDaiBoo is false. */ }

					<div className='sched-off-note'>Runs on demand only &mdash; not in the daily generator.</div>

				</Collapse>


			</div>

			<div className='rd-ctl-group rd-ctl-group--items'>{ /* What: Item Controls Group Div Element. Why: Avoid-duplicates and Fill/Refill both act on this picker's ITEMS rather than its own type/schedule, so they get their own separate group. How: This wraps the subhead, the avoid-duplicates row, and the Fill/Refill row below. */ }


				<div className='rd-ctl-subhead'>Item Controls</div>{ /* What: Item Controls Subhead Div Element. Why: Every Controls group needs its own labeled subhead. How: This renders the literal text "Item Controls". */ }

				<div className='sched-line'>{ /* What: Duplicates Line Div Element. Why: The avoid-duplicate-items toggle needs its own labeled row. How: This wraps the label/sub text and the switch button below. */ }


					<span className='sched-line-label'>{ /* What: Duplicates Label Span Element. Why: The toggle's own name and live explanation belong together. How: This wraps the lbl and sub spans below. */ }

						<span className='sched-line-lbl'>Avoid duplicate items</span>{ /* What: Duplicates Lbl Span Element. Why: The row needs its own literal name. How: This renders the literal text "Avoid duplicate items". */ }

						<span
							key={ picObj.avoidDuplicates ? 'on' : 'off' }
							className='sched-line-sub set-sub-fade'
						>{ /* What: Duplicates Sub Span Element. Why: The row needs a live one-line explanation, cross-faded via its own key change. How: This renders whichever of the 2 explanations below matches picObj.avoidDuplicates. */ }
							{ picObj.avoidDuplicates
								? <><strong>won't pick</strong> an item whose name is already on today's todo list</>
								: <><strong>may pick</strong> an item even if its name is already on today's todo list</> }
						</span>

					</span>

					<button
						className={ ` switch   ${ picObj.avoidDuplicates ? 'is-on' : '' } ` }
						aria-pressed={ !!picObj.avoidDuplicates }
						aria-label='Avoid duplicate items'
						onClick={ () => actObj.updatePicker( picObj.id, { avoidDuplicates : !picObj.avoidDuplicates } ) }
					><i /></button>{ /* What: Duplicates Switch Button Element. Why: This is the actual on/off control for avoiding duplicate items. How: This flips picObj.avoidDuplicates on click. */ }


				</div>

				<Collapse open={ isaEasBoo }>{ /* What: Collapse. Why: Fill/Refill only makes sense for an ease-mode picker. How: This opens only while isaEasBoo is true. */ }

					<div className={ ` ease-config   ${ isaDowBoo ? 'ease-config--down' : 'ease-config--up' } ` }>{ /* What: Ease Config Div Element. Why: Help mode needs a pure selector hook to give this section mode-specific copy (Fill vs. Refill). How: This wraps whichever of the 2 mode-specific rows below matches picObj.mode. */ }


						{ picObj.mode === 'ease-up' && ( // What: Ease Up Check. Why: Only ease-up gets the "Fill" wording and action. How: This renders the Fill row only while picObj.mode is 'ease-up'.


							<div className='pie-row'>{ /* What: Fill Row Div Element. Why: The Fill label/summary and its button need their own row. How: This wraps the rowlabel div and the FillButton below. */ }


								<div className='pie-rowlabel'>{ /* What: Fill Rowlabel Div Element. Why: The Fill label and its live summary belong together. How: This wraps the lbl and sub spans below. */ }

									<span className='pie-lbl'>Fill</span>{ /* What: Fill Lbl Span Element. Why: The row needs its own literal name. How: This renders the literal text "Fill". */ }

									<span className='pie-sub'>{ filSubEle }</span>{ /* What: Fill Sub Span Element. Why: The row needs a live summary of how many items still need charging. How: This renders filSubEle. */ }

								</div>

								<FillButton
									label='Fill all'
									disabled={ iteArr.length > 0 && iteArr.every( ( iteCurObj ) => ( iteCurObj.value ?? 0 ) >= ( picObj.threshold ?? 100 ) ) }
									onClick={ () => actObj.refillPicker( picObj.id ) }
								/>{ /* What: Fill Button. Why: This is the actual bulk-charge action for an ease-up picker. How: This is disabled once every item is already at threshold, and calls refillPicker on click. */ }


							</div>


						) }

						{ picObj.mode === 'ease-down' && ( // What: Ease Down Check. Why: Only ease-down gets the "Refill" wording and action. How: This renders the Refill row only while picObj.mode is 'ease-down'.


							<div className='pie-row'>{ /* What: Refill Row Div Element. Why: The Refill label/summary and its button need their own row. How: This wraps the rowlabel div and the FillButton below. */ }


								<div className='pie-rowlabel'>{ /* What: Refill Rowlabel Div Element. Why: The Refill label and its live summary belong together. How: This wraps the lbl and sub spans below. */ }

									<span className='pie-lbl'>Refill</span>{ /* What: Refill Lbl Span Element. Why: The row needs its own literal name. How: This renders the literal text "Refill". */ }

									<span className='pie-sub'>{ filSubEle }</span>{ /* What: Refill Sub Span Element. Why: The row needs a live summary of how many items still need charging. How: This renders filSubEle. */ }

								</div>

								<FillButton
									label='Refill all'
									disabled={ iteArr.length > 0 && iteArr.every( ( iteCurObj ) => ( iteCurObj.value ?? 0 ) >= ( picObj.threshold ?? 100 ) ) }
									onClick={ () => actObj.refillPicker( picObj.id ) }
								/>{ /* What: Fill Button. Why: This is the actual bulk-charge action for an ease-down picker. How: This is disabled once every item is already at threshold, and calls refillPicker on click. */ }


							</div>


						) }


					</div>

				</Collapse>


			</div>

			<div className='rd-ctl-group rd-ctl-group--foot pk-ctl-foot'>{ /* What: Footer Group Div Element. Why: Delete/Cancel/Save (or the new-draft Cancel/Add-Items/Save variant) needs its own bottom group. How: This renders whichever of the 3 footer states below matches conDelBoo/isaNewBoo. */ }


				{ conDelBoo ? ( // What: Confirm Delete Check. Why: A real picker's Delete morphs the footer into an inline confirm before actually deleting. How: This renders the confirm row while conDelBoo is true.


					<div key='confirm' className='rd-pk-del-confirm'>{ /* What: Delete Confirm Div Element. Why: The confirm message and its own Cancel/Delete buttons need their own grouped row. How: This wraps the confirm message and the rem-del-actions row below. */ }


						<div className='confirm-msg'>Delete the &ldquo;{ picObj.name }&rdquo; picker? This will also delete its { iteArr.length } { iteArr.length === 1 ? 'item' : 'items' }. This can&rsquo;t be undone.</div>{ /* What: Confirm Msg Div Element. Why: A destructive action needs an explicit, specific warning before it happens. How: This names the picker and states exactly how many items will also be deleted. */ }

						<div className='rem-del-actions'>{ /* What: Delete Actions Div Element. Why: The confirm's own Cancel and Delete buttons need their own row. How: This wraps both Btn instances below. */ }

							<Btn kind='ghost' size='sm' onClick={ () => setConDelBoo( false ) }>Cancel</Btn>{ /* What: Btn. Why: Backing out of the confirm should not delete anything. How: This just closes the confirm row. */ }

							<Btn kind='danger' size='sm' onClick={ () => ( onReqDelFun ? onReqDelFun() : actObj.removePicker( picObj.id ) ) }>Delete</Btn>{ /* What: Btn. Why: This is the actual, final destructive action. How: This calls onReqDelFun when the caller wants to animate the removal itself, otherwise removes the picker directly. */ }

						</div>


					</div>


				) : isaNewBoo ? ( // What: Is-A New Draft Check. Why: A brand-new draft picker gets a no-Delete Cancel/Add-Items-then-Save footer instead of the normal one. How: This renders the new-draft row while isaNewBoo is true (and conDelBoo is false).


					<div key='foot-new' className='rd-ctl-foot-row rd-ctl-foot-row--new'>{ /* What: New Footer Row Div Element. Why: The new-draft footer's own Cancel/Save buttons need their own row. How: This wraps the rem-foot-right div below. */ }


						<div className='rem-foot-right'>{ /* What: Foot Right Div Element. Why: The Cancel and Save buttons anchor to the footer's own right edge. How: This wraps the Btn and InfoTip-wrapped Btn below. */ }


							<Btn
								kind='ghost'
								size='sm'
								onClick={ () => { donRef.current = 'cancel'; onCanNewFun(); } }
							>Cancel</Btn>{ /* What: Btn. Why: A brand-new draft's Cancel discards the whole thing rather than reverting to a blank snapshot; donRef is marked first so the implicit-close guard doesn't ALSO try to revert it. How: This marks donRef then calls onCanNewFun. */ }

							<InfoTip label={ ftrTipStr }>{ /* What: Info Tip. Why: The footer button's own current disabled reason (or confirmation once ready) needs to be available on demand. How: This shows ftrTipStr, wrapping the Btn below. */ }

								<Btn
									kind='primary'
									size='sm'
									disabled={ ftrDisBoo }
									onClick={ ftrDisBoo ? undefined : () => { donRef.current = 'saved'; ftrActFun(); } }
								>{ ftrLblStr }</Btn>{ /* What: Btn. Why: This is the new-draft footer's own primary action, reading "Add Items" or "Save" depending on progress. How: This marks donRef then calls ftrActFun, disabled per ftrDisBoo. */ }

							</InfoTip>


						</div>


					</div>


				) : ( // What: Normal Footer Check. Why: An existing, non-draft picker gets the full Delete/Cancel/Save footer. How: This is the fallback branch once neither conDelBoo nor isaNewBoo applies.


					<div key='foot' className='rd-ctl-foot-row'>{ /* What: Foot Row Div Element. Why: Delete (left) and Cancel/Save (right) both belong in the same footer row. How: This wraps the Delete Btn and the rem-foot-right div below. */ }


						<Btn kind='danger' size='sm' icon='trash' onClick={ () => setConDelBoo( true ) }>Delete</Btn>{ /* What: Btn. Why: This opens the inline delete confirm rather than deleting immediately. How: This sets conDelBoo true on click. */ }

						<div className='rem-foot-right'>{ /* What: Foot Right Div Element. Why: Cancel and Save anchor to the footer's own right edge. How: This wraps both Btn instances below. */ }

							<Btn kind='ghost' size='sm' onClick={ canFun }>Cancel</Btn>{ /* What: Btn. Why: This discards every change made since Controls opened. How: This calls canFun on click. */ }

							<Btn kind='ghost' size='sm' onClick={ savClsFun }>Save</Btn>{ /* What: Btn. Why: This keeps every change made since Controls opened. How: This calls savClsFun on click. */ }

						</div>


					</div>


				) }


			</div>


		</div>


	);


}

// #endregion PicConCom



// #region CndEdiCom

/**
 * CndEdiCom = Conditional Editor Component
 *
 * @summary
 * The editor body for one conditional, rendered inside CndManCom's own
 * collapsible row. The draft itself is owned by CndManCom (so the row
 * can host the inline name input the same way a picker item's own row
 * does); this component just renders ConditionalControls against it and
 * supplies Save/Cancel/Delete. Save normalizes the name (Title Case
 * tidy) and is blocked on a collision, mirroring the Pickers
 * create-flow's own guard. Cancel discards a brand-new conditional or
 * simply closes an existing one.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.cond      - Conditional: The conditional record this row
 *                          belongs to.
 * @param props.draft     - Draft: The in-progress, not-yet-committed field
 *                          values for this conditional.
 * @param props.setDraft  - Setter Draft: Replaces the in-progress draft
 *                          object.
 * @param props.actions   - Actions: {@link useStore}
 * @param props.isNew     - Is New: Whether this conditional is a brand-new,
 *                          not-yet-saved draft.
 * @param props.nameError - Name Error: The current validation message for the
 *                          draft's own name, or null when it's valid.
 * @param props.tidyName  - Tidy Name: The draft's own name, already normalized
 *                          to the app's tidy-casing rule.
 * @param props.onClose   - On Close: Closes this row without discarding an
 *                          existing conditional's edits.
 * @param props.onDiscard - On Discard: Discards a brand-new conditional
 *                          entirely.
 * @param props.onSaveNew - On Save New: Commits a brand-new conditional, when
 *                          set; undefined for an existing one.
 * @param props.onDelete  - On Delete: Deletes this existing conditional.
 *
 * @returns This conditional's own editor body: any name error, the
 * shared ConditionalControls fields, and the footer.
 *
 * @example
 * ```tsx
 * CndEdiCom({ cond, draft, setDraft, actions, ... }) // => <CndEdiCom />
 * ```
 *
*/

function CndEdiCom ( { cond : cndObj, draft : drfObj, setDraft : setDrfObj, actions : actObj, isNew : isaNewBoo, nameError : namErrStr, tidyName : tidNamStr, onClose : onCloFun, onDiscard : onDisFun, onSaveNew : onSavNewFun, onDelete : onDelFun } ) {


	const CndConCom = ConditionalControls; // What: Conditional Control Component. Why: This scopes ConditionalControls under a name matching this file's own component-naming convention, without renaming the actual import. How: This is rendered directly as a JSX tag below.
	const [ conDelBoo, setConDelBoo ] = React.useState( false ); // What: Confirm Delete Boolean And Setter. Why: Deleting an existing conditional needs an inline confirm step before it actually happens. How: This is flipped true by the Delete button and read below to swap in the confirm row.


	const savFun = () => { // What: Save Function. Why: Save must normalize the name and route through whichever commit path applies (a brand-new conditional vs. an existing one). How: This blocks on a name error, delegates to onSavNewFun for a brand-new conditional, otherwise updates the existing one directly.


		if ( namErrStr ) return; // What: Name Error Guard. Why: An invalid or colliding name must never be committed. How: This bails out of Save entirely while namErrStr holds a message.

		if ( onSavNewFun ) { onSavNewFun(); return; } // What: New Save Guard. Why: A brand-new conditional's own commit (including its animated collapse+add) is owned by CndManCom, not this component. How: This delegates to onSavNewFun and returns early when it's set.


		actObj.updateConditional( cndObj.id, { ...drfObj, name : tidNamStr } ); // What: Update Conditional Call. Why: An existing conditional's edits only take effect once actually committed. How: This writes every draft field, with name replaced by its tidied form.

		onCloFun(); // What: Close Call. Why: A successful save should also close this row. How: This calls onCloFun after the update above.


	};

	const canFun = () => { if ( isaNewBoo ) onDisFun(); else onCloFun(); }; // What: Cancel Function. Why: Cancelling a brand-new conditional must discard it entirely, while cancelling an existing one just closes without saving. How: This calls onDisFun when isaNewBoo, otherwise onCloFun.

	useEscapeCancel( true, () => { if ( conDelBoo ) setConDelBoo( false ); else canFun(); } ); // What: Use Escape Cancel. Why: Escape should back out of the delete confirm if it's showing, otherwise cancel the edit itself. How: This is always active while this row is mounted.


	return (


		<div className='rd-edit rd-edit--cnd'>{ /* What: Editor Div Element. Why: This is CndEdiCom's own root element. How: This wraps the rd-ctl-body div below. */ }


			<div className='rd-ctl-body'>{ /* What: Controls Body Div Element. Why: The name error, the shared Controls fields, and the footer all belong in one grouped body. How: This wraps the 3 pieces below. */ }


				{ namErrStr && <p className='np-error rd-cnd-name-err'>{ namErrStr }</p> }{ /* What: Name Error Check. Why: An invalid/colliding name needs an inline warning right above the fields. How: This renders the message only while namErrStr holds one. */ }

				<CndConCom draft={ drfObj } onChange={ setDrfObj } variant='inline' hideName />{ /* What: Conditional Control Component. Why: Every non-name field (type + settings) is edited through the exact same control the Pickers create-flow uses. How: This is passed the current draft, committing every change back via setDrfObj. */ }

				<div className='rd-ctl-group rd-ctl-group--foot'>{ /* What: Footer Group Div Element. Why: Delete/Cancel/Save (or the delete confirm) needs its own bottom group. How: This renders whichever of the 2 footer states below matches conDelBoo. */ }


					{ conDelBoo ? ( // What: Confirm Delete Check. Why: Delete morphs the footer into an inline confirm before actually deleting. How: This renders the confirm row while conDelBoo is true.


						<div key='confirm' className='rd-ctl-confirm'>{ /* What: Delete Confirm Div Element. Why: The confirm message and its own Cancel/Delete buttons need their own grouped row. How: This wraps the confirm message and the rem-del-actions row below. */ }


							<div className='confirm-msg'>Delete the &ldquo;{ cndObj.name }&rdquo; conditional? Pickers using it will be detached. This can&rsquo;t be undone.</div>{ /* What: Confirm Msg Div Element. Why: A destructive action needs an explicit, specific warning before it happens. How: This names the conditional and states that any picker using it will be detached. */ }

							<div className='rem-del-actions'>{ /* What: Delete Actions Div Element. Why: The confirm's own Cancel and Delete buttons need their own row. How: This wraps both Btn instances below. */ }

								<Btn kind='ghost' size='sm' onClick={ () => setConDelBoo( false ) }>Cancel</Btn>{ /* What: Btn. Why: Backing out of the confirm should not delete anything. How: This just closes the confirm row. */ }

								<Btn kind='danger' size='sm' onClick={ () => onDelFun() }>Delete</Btn>{ /* What: Btn. Why: This is the actual, final destructive action. How: This calls onDelFun on click. */ }

							</div>


						</div>


					) : ( // What: Plain Foot Branch. Why: With no delete confirmation pending, the normal Delete/Cancel/Save footer belongs here instead. How: This renders the else branch, taken while conDelBoo is false.


						<div key='foot' className='rd-ctl-foot-row'>{ /* What: Foot Row Div Element. Why: Delete (left, existing conditionals only) and Cancel/Save (right) both belong in the same footer row. How: This conditionally renders the Delete Btn, then the rem-foot-right div below. */ }


							{ !isaNewBoo && <Btn kind='danger' size='sm' icon='trash' onClick={ () => setConDelBoo( true ) }>Delete</Btn> }{ /* What: Btn. Why: A brand-new, not-yet-saved conditional has nothing to delete yet. How: This opens the inline delete confirm, rendered only while isaNewBoo is false. */ }

							<div className='rem-foot-right'>{ /* What: Foot Right Div Element. Why: Cancel and Save anchor to the footer's own right edge. How: This wraps both Btn instances below. */ }

								<Btn kind='ghost' size='sm' onClick={ canFun }>Cancel</Btn>{ /* What: Btn. Why: This discards a brand-new conditional or closes an existing one's edits. How: This calls canFun on click. */ }

								<Btn kind='ghost' size='sm' disabled={ !!namErrStr } onClick={ savFun }>Save</Btn>{ /* What: Btn. Why: This commits the draft's own fields. How: This calls savFun on click, disabled while namErrStr holds a message. */ }

							</div>


						</div>


					) }


				</div>


			</div>


		</div>


	);


}

// #endregion CndEdiCom



// #region CndManCom

/**
 * CndManCom = Conditionals Manager Component
 *
 * @summary
 * Lists every conditional as a collapsible card whose body is CndEdiCom.
 * Edits are live (updateConditional). A brand-new conditional is held
 * LOCALLY (not written to the store) until Save, so a reload or
 * tab-switch mid-create discards it, mirroring the "nothing committed
 * until Save" contract TabData's own new-picker draft flow uses (that
 * one is backed by a real hidden picker instead, since PicConCom's own
 * fields already write straight to the store). Delete detaches the
 * conditional from any pickers that reference it (the store itself
 * handles that cleanup).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.state   - State: {@link useStore}
 * @param props.actions - Actions: {@link useStore}
 *
 * @returns The Conditionals section: its own header, the "Add a
 * conditional" control, and every conditional's own collapsible row.
 *
 * @example
 * ```tsx
 * CndManCom({ state, actions }) // => <CndManCom />
 * ```
 *
*/

function CndManCom ( { state : staAppObj, actions : actObj } ) {


	const cndIteArr = staAppObj.conditionals || []; // What: Conditional Item Array. Why: Every render needs the current list of conditionals to display. How: This reads staAppObj.conditionals, falling back to an empty array.
	const picArr    = staAppObj.pickers || [];       // What: Picker Array. Why: The "N pickers" usage count per conditional needs every picker to check against. How: This reads staAppObj.pickers, falling back to an empty array.


	const [ opnIdeStr, setOpnIdeStr ] = React.useState( null ); // What: Open Identifier String And Setter. Why: Only one conditional's own row can be expanded for editing at a time. How: This holds whichever conditional's own id is currently open, or null.
	const [ drfObj, setDrfObj ]       = React.useState( null ); // What: Draft Object And Setter. Why: The open row's own in-progress, not-yet-committed field values need somewhere to live. How: This is populated by openEdiFun and cleared by closEdiFun.
	const [ penObj, setPenObj ]       = React.useState( null ); // What: Pending Object And Setter. Why: A brand-new conditional is held locally, not written to the store, until Save. How: This holds the brand-new conditional's own object while it's still unsaved.
	const [ clsIdeStr, setClsIdeStr ] = React.useState( null ); // What: Closing Identifier String And Setter. Why: A deleted conditional's own row must finish its collapse-shut animation before actually being removed. How: This holds whichever conditional's own id is currently mid-delete-animation.


	const useCouFun = ( cidStr ) => picArr.filter( ( picCurObj ) => picCurObj.conditionalId === cidStr && !picCurObj.hidden ).length; // What: Use Count Function. Why: Every conditional's own row needs to show how many (non-hidden) pickers currently use it. How: This counts every picker whose own conditionalId matches cidStr.


	const colMapObj = ( staAppObj.ui && staAppObj.ui.controlsCollapsed ) || {}; // What: Collapsed Map Object. Why: The section's own collapse state is persisted the same way every picker card's own Controls/Items disclosures are. How: This reads staAppObj.ui.controlsCollapsed, falling back to an empty object.
	const secOpnBoo = colMapObj[ '__conditionals' ] === false;                 // What: Section Open Boolean. Why: This section defaults COLLAPSED (absent means collapsed), unlike its own nested disclosures. How: This is true only when the persisted entry is explicitly false.


	const cndRngFun = ( cndCurObj ) => ( cndCurObj.mode === 'ease-up' || cndCurObj.mode === 'ease-down' ) // What: Conditional Range Function. Why: Ease-mode conditionals expose a sortable Range value, the same soonest/latest-band math their own editor uses, collapsed to its near end. How: This computes it only for ease-up/ease-down, null otherwise.
		? Math.max( 1, Math.round( ( cndCurObj.threshold ?? 100 ) / ( cndCurObj.easeMax ?? 14 ) ) )
		: null;
	const cndOddFun = ( cndCurObj ) => ( cndCurObj.mode === 'weighted' || cndCurObj.mode === 'dynamic' ) ? ( cndCurObj.oddsPct ?? 50 ) : null; // What: Conditional Odds Function. Why: Weighted/dynamic conditionals expose their real trigger-likelihood as Odds, not their own vestigial weight field. How: This reads cndCurObj.oddsPct only for those 2 modes, null otherwise.
	const cndBstFun = ( cndCurObj ) => ( cndCurObj.mode === 'dynamic' ) ? ( cndCurObj.value ?? 0 ) : null;                                    // What: Conditional Boost Function. Why: Only a dynamic conditional has a meaningful boost value, the same value field ease modes reuse for charge. How: This reads cndCurObj.value only for 'dynamic', null otherwise.

	const iteSorStr = ( staAppObj.ui && staAppObj.ui.dataSort && staAppObj.ui.dataSort.conditionals ) || 'name-asc'; // What: Item Sort String. Why: This section's own list needs its own persisted sort choice. How: This reads staAppObj.ui.dataSort.conditionals, falling back to 'name-asc'.
	const sorCndArr = [ ...cndIteArr ].sort( ( aCndObj, bCndObj ) => compareSortEntries( // What: Sorted Conditional Array. Why: The rendered list needs to actually be in iteSorStr's own order. How: This builds a matching sort-entry shape for both sides and delegates the comparison to compareSortEntries.

		{ name : aCndObj.name, type : ( MODES[ aCndObj.mode ] || {} ).label || aCndObj.mode, group : null, count : null,
			range : cndRngFun( aCndObj ), odds : cndOddFun( aCndObj ), boost : cndBstFun( aCndObj ), isActive : aCndObj.active !== false },
		{ name : bCndObj.name, type : ( MODES[ bCndObj.mode ] || {} ).label || bCndObj.mode, group : null, count : null,
			range : cndRngFun( bCndObj ), odds : cndOddFun( bCndObj ), boost : cndBstFun( bCndObj ), isActive : bCndObj.active !== false },
		iteSorStr

	) );


	const openEdiFun  = ( cndCurObj ) => { setPenObj( null ); setDrfObj( { ...cndCurObj } ); setOpnIdeStr( cndCurObj.id ); };   // What: Open Editor Function. Why: Opening an existing conditional's row needs a fresh draft copy and no pending flag. How: This seeds drfObj from cndCurObj and opens its own row.
	const closEdiFun  = () => { setPenObj( null ); setDrfObj( null ); setOpnIdeStr( null ); };                                 // What: Close Editor Function. Why: Closing a row (without any special animation) just clears every piece of open-row state. How: This clears penObj, drfObj, and opnIdeStr together.


	const closNewAniFun = () => { // What: Close New Animated Function. Why: Cancelling a brand-new conditional should collapse its row first (so it visibly animates shut) before actually dropping it, rather than unmounting it instantly. How: This closes the row immediately when motion is reduced, otherwise defers the state drop by 300ms.


		if ( reduceMotion() ) { setOpnIdeStr( null ); setDrfObj( null ); setPenObj( null ); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion should see this happen instantly, not mid-animation. How: This clears every piece of state synchronously and returns early.


		setOpnIdeStr( null ); // What: Row Collapse Call. Why: The editor itself must stay mounted (still holding drfObj/penObj) so its own Collapse can actually animate shut. How: This only closes the row's own open flag, not the draft/pending state yet.

		setTimeout( () => { setDrfObj( null ); setPenObj( null ); }, 300 ); // What: Deferred Drop Call. Why: The draft/pending state must survive until the collapse animation actually finishes. How: This clears both 300ms later, matching the collapse animation's own duration.


	};

	const delAniFun = ( cidStr ) => { // What: Delete Animated Function. Why: Deleting an existing conditional should collapse its card shut before actually removing it from the store. How: This runs the removal immediately when motion is reduced, otherwise defers it by 300ms while the row plays its own collapse.


		const donFun = () => { actObj.removeConditional( cidStr ); setClsIdeStr( null ); setDrfObj( null ); setOpnIdeStr( null ); }; // What: Done Function. Why: The actual removal and every piece of open/closing state need to clear together, whenever this finally runs. How: This is called either immediately or after the deferred timeout below.

		if ( reduceMotion() ) { donFun(); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion should see this happen instantly. How: This calls donFun synchronously and returns early.


		setClsIdeStr( cidStr ); // What: Closing Id Set. Why: The editor must stay mounted (via closingId) through its own collapse animation instead of unmounting immediately. How: This flags cidStr as the row currently mid-delete-animation.

		setOpnIdeStr( null ); // What: Row Collapse Call. Why: Collapsing the row's own open state is what actually triggers its Collapse to animate shut. How: This clears opnIdeStr.

		setTimeout( donFun, 300 ); // What: Deferred Removal Call. Why: The actual store removal must wait until the collapse animation finishes. How: This calls donFun 300ms later, matching the collapse animation's own duration.


	};

	const saveNewAniFun = ( finNamStr ) => { // What: Save New Animated Function. Why: Committing a brand-new conditional to the store should happen after the row's own collapse, so the row stays in place (same id/name) rather than visibly jumping. How: This commits immediately when motion is reduced, otherwise defers the commit by 300ms.


		const payObj = { ...drfObj, name : finNamStr }; // What: Payload Object. Why: The committed conditional needs its own name replaced by the freshly-tidied final one. How: This spreads drfObj with name overridden by finNamStr.
		const cmtFun = () => { actObj.addConditional( payObj ); setDrfObj( null ); setPenObj( null ); }; // What: Commit Function. Why: The actual store write and clearing the local-only draft/pending state need to happen together. How: This is called either immediately or after the deferred timeout below.


		if ( reduceMotion() ) { setOpnIdeStr( null ); cmtFun(); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion should see this happen instantly. How: This closes the row and commits synchronously, then returns early.


		setOpnIdeStr( null ); // What: Row Collapse Call. Why: Collapsing the row's own open state is what actually triggers its Collapse to animate shut before the commit below lands. How: This clears opnIdeStr.

		setTimeout( cmtFun, 300 ); // What: Deferred Commit Call. Why: The actual store write must wait until the collapse animation finishes. How: This calls cmtFun 300ms later, matching the collapse animation's own duration.


	};


	const tidNamStr = ( drfObj && normalizeConditionalName( drfObj.name ) ) || ''; // What: Tidy Name String. Why: Every save/collision-check below needs the draft's own name already normalized to the app's tidy-casing rule. How: This calls normalizeConditionalName on drfObj.name when a draft exists, empty string otherwise.
	const namErrStr = drfObj && !tidNamStr // What: Name Error String. Why: The open row's own editor needs a specific validation message whenever its name is empty or collides with another conditional. How: This checks emptiness first, then a case-insensitive collision against every OTHER conditional, null when the name is valid.
		? 'Enter a name for this conditional.'
		: drfObj && cndIteArr.some( ( cndCurObj ) => cndCurObj.id !== opnIdeStr && ( cndCurObj.name || '' ).toLowerCase() === tidNamStr.toLowerCase() )
		? `A conditional named “${ tidNamStr }” already exists. Choose a different name.`
		: null;

	const keeCloFun = () => { // What: Keep Close Function. Why: The row's own collapse chevron is a deliberate close, not an accidental one; a plain closEdiFun there would discard a brand-new conditional or revert an edited existing one back to its pre-edit values. How: This commits the current draft (new or existing) unless the name itself is invalid, in which case it falls back to a plain (discarding) close.


		if ( namErrStr ) { closEdiFun(); return; } // What: Invalid Name Guard. Why: An empty or colliding name can't be committed at all. How: This falls back to a plain close when namErrStr holds a message.

		if ( penObj ) { saveNewAniFun( tidNamStr ); return; } // What: Pending Guard. Why: A brand-new conditional's own "keep" means actually saving it, the animated way. How: This delegates to saveNewAniFun and returns early when penObj is set.


		actObj.updateConditional( opnIdeStr, { ...drfObj, name : tidNamStr } ); // What: Update Conditional Call. Why: An existing conditional's own "keep" means committing its edited fields. How: This writes every draft field, with name replaced by its tidied form.

		closEdiFun(); // What: Close Editor Call. Why: A successful keep should also close the row. How: This calls closEdiFun after the update above.


	};


	const opnRowRef = React.useRef( null ); // What: Open Row Reference. Why: A brand-new conditional's own "+ Add a conditional" click needs a handle on the resulting row so it can be scrolled into view. How: This is attached to whichever row is currently open.

	React.useEffect( () => { // What: Scroll Into View Effect. Why: A freshly-created conditional's own form should scroll into view once its Collapse has actually finished opening. How: This waits 300ms (matching the Collapse open animation) before scrolling, or scrolls instantly under reduced motion.


		if ( !opnIdeStr || !penObj || !opnRowRef.current ) return; // What: Not Applicable Guard. Why: Only a brand-new (pending), currently-open row with a mounted ref needs this scroll. How: This bails out whenever any of the 3 conditions isn't met.


		const rowCurEle = opnRowRef.current; // What: Row Current Element. Why: The scroll call below needs a stable local reference to the live row node. How: This reads opnRowRef.current once and reuses it.

		if ( reduceMotion() ) { rowCurEle.scrollIntoView( { behavior : 'auto', block : 'nearest' } ); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion should see this scroll happen instantly, not after a delay. How: This scrolls immediately and returns early.


		const scrTimNum = setTimeout( () => rowCurEle.scrollIntoView( { behavior : 'smooth', block : 'nearest' } ), 300 ); // What: Scroll Timeout Number. Why: The Collapse open animation (.26s) needs to finish growing the editor before the scroll starts, or it would scroll to the wrong final position. How: This schedules the smooth scroll 300ms out.


		return () => clearTimeout( scrTimNum ); // What: Effect Cleanup Return. Why: A stale scroll must not fire after this effect re-runs (e.g. a different row opens) or the component unmounts. How: This cancels scrTimNum.


	}, [ opnIdeStr ] ); // What: Effect Dependency Array. Why: This scroll only ever needs to reconsider itself when which row is open actually changes. How: opnIdeStr is the single value this effect's own guard is built around.

	const focInpRef = React.useRef( null ); // What: Focused Input Reference. Why: The name input focuses itself via a ref callback (below, inline) instead of the plain autoFocus attribute, so it can pass preventScroll and avoid fighting the deliberate smooth scroll above. How: This is guarded by node identity so a later re-render of the SAME input doesn't refocus it repeatedly.


	return (


		<section className='cat cat--enter cnd-manager'>{ /* What: Category Section Element. Why: This is CndManCom's own root element, matching every other Data tab category's own outer landmark. How: This renders the header, then the Collapse-wrapped body below. */ }


			<header className='cat-h'>{ /* What: Category Header Element. Why: Every section shares the same header shape (chevron + name + count). How: This wraps the collapse-toggle button below. */ }


				<button
					type='button'
					className='cat-h-l'
					aria-expanded={ secOpnBoo }
					onClick={ () => actObj.toggleControlsCollapsed( '__conditionals', true ) }
				>{ /* What: Header Left Button Element. Why: This is the actual clickable control for expanding/collapsing the whole section. How: This toggles the section's own persisted collapse state, defaulting collapsed. */ }


					<span className={ ` chev   ${ secOpnBoo ? 'is-open' : '' } ` }><Icon name='chev' size={ 14 } /></span>{ /* What: Chevron Span Element. Why: The section's own open/closed state needs a visible directional indicator. How: This rotates via the 'is-open' class and renders the shared chevron icon. */ }

					<span className='cat-h-main'>{ /* What: Header Main Span Element. Why: The section's own name and live count belong together. How: This wraps the h2 and the count span below. */ }

						<h2 className='cat-name'>Conditionals</h2>{ /* What: Category Name Element. Why: Every section needs its own visible name. How: This renders the literal text "Conditionals". */ }

						<span className='cat-count'>{ /* What: Category Count Span Element. Why: The active/total count needs 3 separate elements (see styles2.css) rather than one text run. How: This wraps the active count, the "of" separator, and the total count below. */ }

							<span className='cat-count-n'>{ cndIteArr.filter( ( cndCurObj ) => cndCurObj.active !== false ).length }</span>{ /* What: Count N Span Element. Why: The active conditional count needs its own element. How: This counts every conditional whose own active field isn't explicitly false. */ }
							<span className='cat-count-of'>of</span>{ /* What: Count Of Span Element. Why: The separator between the active and total counts needs its own element. How: This renders the literal text "of". */ }
							<span className='cat-count-n'>{ cndIteArr.length }</span>{ /* What: Count N Span Element. Why: The total conditional count needs its own element. How: This renders cndIteArr's own length. */ }

						</span>

					</span>


				</button>


			</header>

			<Collapse open={ secOpnBoo }>{ /* What: Collapse. Why: The whole section's own body only needs to exist while it's actually expanded. How: This opens only while secOpnBoo is true. */ }

				<div className='cat-body'>{ /* What: Category Body Div Element. Why: The add control, the empty-state message, the sort control, and every conditional row all belong in one body. How: This wraps every piece below. */ }


					{ OB_CHECKLIST.tutorialsInProgress( staAppObj ) ? ( // What: Tutorials In Progress Check. Why: The add control must stay disabled (with an explanatory tip) while the Welcome Tour's own checklist is still in progress. How: This renders a disabled InfoTip-wrapped control in that state, otherwise the real button.


						<InfoTip
							className='rd-add is-tour-disabled'
							action='Add a conditional'
							label='This button is disabled until all tutorials are completed.'
						>
							<Icon name='plus' size={ 13 } />{ /* What: Icon. Why: The disabled add control still needs a recognizable "add" glyph beside its own label. How: This renders the 'plus' icon at a fixed size. */ } Add a conditional
						</InfoTip> // What: Info Tip. Why: A disabled control still needs to explain why it can't be clicked yet. How: This wraps the same visible label/icon the real button uses.


					) : ( // What: Add Button Branch. Why: Outside the guided checklist, the real working Add control belongs here instead. How: This renders the else branch, taken while the checklist isn't in progress.


						<button
							className='rd-add'
							onClick={ () => {

								if ( penObj ) return; // What: One Draft Guard. Why: Only one brand-new conditional can be in progress at a time. How: This bails out of the click entirely while penObj already holds one.



								const nexDrfObj = conditionalDraftDefault( '', cndIteArr.map( ( cndCurObj ) => cndCurObj.name ) ); // What: Next Draft Object. Why: A brand-new conditional needs a sensible starting draft, with a name that won't collide with any existing one. How: This calls the shared conditionalDraftDefault helper.
								const nexIdeStr = 'cnd_' + Math.random().toString( 36 ).slice( 2, 8 );                                // What: Next Identifier String. Why: The brand-new draft needs its own id immediately, even before it's ever written to the store. How: This generates a short random id with a 'cnd_' prefix.
								const nexObj    = { ...nexDrfObj, id : nexIdeStr };                                                     // What: Next Object. Why: The draft object itself needs to carry its own freshly-generated id. How: This spreads nexDrfObj with id set to nexIdeStr.


								setPenObj( nexObj );      // What: Pending Set Call. Why: This is held locally, not written to the store, until Save. How: This sets penObj to nexObj.
								setDrfObj( nexObj );       // What: Draft Set Call. Why: The editor below needs the same object as its own in-progress draft. How: This sets drfObj to the same nexObj.
								setOpnIdeStr( nexIdeStr ); // What: Open Set Call. Why: The brand-new row must open immediately so its own editor is visible. How: This sets opnIdeStr to nexIdeStr.

							} }
						>
							<Icon name='plus' size={ 13 } />{ /* What: Icon. Why: The add control needs a recognizable "add" glyph beside its own label. How: This renders the 'plus' icon at a fixed size. */ } Add a conditional
						</button> // What: Add Button Element. Why: This is the only place a brand-new conditional can be started. How: This seeds a fresh local-only draft and opens its own row.


					) }

					{ !cndIteArr.length && !penObj && ( // What: Empty State Check. Why: A genuinely empty list needs its own explanatory message instead of an empty body. How: This renders only while there are no conditionals at all and none is currently being created.


						<p className='rd-cnd-empty'>No conditionals yet. Add one here, then attach it to any picker.</p>


					) }

					{ cndIteArr.length > 1 && ( // What: Multiple Conditionals Check. Why: A sort control is only useful once there's more than one conditional to sort. How: This renders SortSelect only while cndIteArr has 2 or more entries.


						<SortSelect
							id='cnd-item-sort'
							label='Sort'
							options={ CIS_OPT_ARR }
							value={ iteSorStr }
							onChange={ ( keyValStr ) => actObj.setDataSort( 'conditionals', keyValStr ) }
						/> // What: Sort Select. Why: This is the actual control for reordering the conditional list. How: This commits the chosen key as this section's own persisted conditionals sort.


					) }

					{ ( penObj ? [ penObj, ...sorCndArr ] : sorCndArr ).map( ( cndCurObj ) => { // What: Conditional Row Map. Why: A brand-new pending conditional renders first, ahead of every sorted existing one. How: This maps the combined list to one collapsible row each.


						const isaPenBoo = !!penObj && cndCurObj.id === penObj.id;                                     // What: Is-A Pending Boolean. Why: The pending row needs slightly different editor treatment (isNew) than an existing one. How: This is true only for the one row matching penObj's own id.
						const isaOpnBoo = opnIdeStr === cndCurObj.id;                                                 // What: Is-A Open Boolean. Why: Every row needs to know whether IT SPECIFICALLY is the currently-open one. How: This compares cndCurObj.id against opnIdeStr.
						const useCouNum = useCouFun( cndCurObj.id );                                                  // What: Use Count Number. Why: Every row's own closed-state summary shows how many pickers currently use it. How: This calls useCouFun for cndCurObj.id.


						return (


							<div
								key={ cndCurObj.id }
								ref={ isaOpnBoo ? opnRowRef : undefined }
								className={ ` rd-item   ${ isaOpnBoo ? 'is-editing' : '' } ` }
							>{ /* What: Row Div Element. Why: Every conditional needs its own collapsible row wrapper. How: This marks itself "is-editing" while isaOpnBoo is true, and captures opnRowRef only while it's the open row. */ }


								{ isaOpnBoo && drfObj ? ( // What: Editing Check. Why: The open row swaps its own header for a live name input, since a real button can't legally contain that input (interactive-in-interactive) and would otherwise lose its own accessible name. How: This renders the editing header while isaOpnBoo is true and a draft exists, otherwise the normal clickable row.


									<div className='rd-row'>{ /* What: Row Div Element. Why: The name input and its own chevron button need their own row. How: This wraps the rd-main span and the chevron button below. */ }


										<span className='rd-main'>{ /* What: Main Span Element. Why: The name input needs its own wrapper matching the closed row's own layout. How: This wraps the input below. */ }

											<input
												className={ ` rd-name-input   ${ namErrStr ? 'is-error' : '' } ` }
												type='text'
												value={ drfObj.name }
												placeholder='Conditional name'
												maxLength={ 40 }
												aria-label='Conditional name'
												aria-invalid={ !!namErrStr }
												ref={ ( inpCurEle ) => { if ( inpCurEle && focInpRef.current !== inpCurEle ) { inpCurEle.focus( { preventScroll : true } ); focInpRef.current = inpCurEle; } } }
												onChange={ ( chgEveObj ) => setDrfObj( { ...drfObj, name : chgEveObj.target.value } ) }
												onBlur={ () => { if ( tidNamStr ) setDrfObj( { ...drfObj, name : tidNamStr } ); } }
												onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Enter' ) keyEveObj.currentTarget.blur(); } }
											/>{ /* What: Name Input Element. Why: A conditional's own name is edited live, right in the row header. How: This commits every keystroke immediately, and tidies the name on blur. */ }

										</span>

										<button type='button' className='rd-chev' aria-label='Collapse' onClick={ keeCloFun }>{ /* What: Chevron Button Element. Why: The chevron is its own real button (not a decoration) since the row itself can no longer be one while editing. How: This calls keeCloFun, the same "deliberate close" handler used elsewhere. */ }

											<span className='chev is-open'><Icon name='chev' size={ 14 } />{ /* What: Icon. Why: The chevron span needs its own recognizable directional glyph. How: This renders the 'chev' icon at a fixed size. */ }</span>

										</button>


									</div>


								) : ( // What: Normal Row Branch. Why: A closed row just needs the plain clickable header instead. How: This renders the else branch, taken while isaOpnBoo is false or drfObj is missing.


									<button
										type='button'
										className='rd-row'
										aria-expanded={ isaOpnBoo }
										onClick={ () => { if ( isaOpnBoo ) closEdiFun(); else openEdiFun( cndCurObj ); } }
									>{ /* What: Row Button Element. Why: A closed row is a plain clickable control that opens (or closes) its own editor. How: This toggles between openEdiFun and closEdiFun based on isaOpnBoo. */ }


										<span className='rd-main'>{ /* What: Main Span Element. Why: The name and its own summary line belong together. How: This wraps the name and sched spans below. */ }

											<span className='rd-name'>{ cndCurObj.name }</span>{ /* What: Name Span Element. Why: Every row needs its own visible name. How: This renders cndCurObj's own name. */ }
											<span className='rd-sched'>{ ( MODES[ cndCurObj.mode ] || {} ).label || cndCurObj.mode }
												{ ' · ' }{ useCouNum } { useCouNum === 1 ? 'picker' : 'pickers' }
												{ cndCurObj.active === false ? ' · inactive' : '' }</span>{ /* What: Sched Span Element. Why: The closed row's own summary needs mode, usage count, and active state in one line. How: This joins the mode label, the picker count, and an inactive suffix when applicable. */ }

										</span>

										<span className='rd-chev'><span className={ ` chev   ${ isaOpnBoo ? 'is-open' : '' } ` }><Icon name='chev' size={ 14 } /></span></span>{ /* What: Chevron Span Element. Why: The closed row's own open/closed state needs a visible directional indicator. How: This rotates via the 'is-open' class and renders the shared chevron icon. */ }


									</button>


								) }

								<Collapse open={ isaOpnBoo }>{ /* What: Collapse. Why: This row's own editor only needs to exist while it's actually open (or animating shut). How: This opens only while isaOpnBoo is true. */ }

									{ drfObj && ( isaOpnBoo || isaPenBoo || clsIdeStr === cndCurObj.id ) && ( // What: Editor Mount Check. Why: The editor must also stay mounted while pending or mid-delete-animation, not only while strictly open. How: This renders CndEdiCom only while a draft exists and one of the 3 conditions holds.


										<CndEdiCom
											cond={ cndCurObj }
											draft={ drfObj }
											setDraft={ setDrfObj }
											actions={ actObj }
											isNew={ isaPenBoo }
											nameError={ namErrStr }
											tidyName={ tidNamStr }
											onClose={ closEdiFun }
											onDelete={ () => delAniFun( cndCurObj.id ) }
											onSaveNew={ isaPenBoo ? ( () => saveNewAniFun( tidNamStr ) ) : undefined }
											onDiscard={ isaPenBoo ? closNewAniFun : ( () => { const remIdeStr = cndCurObj.id; closEdiFun(); actObj.removeConditional( remIdeStr ); } ) }
										/> // What: CndEdiCom. Why: This is the actual editor body for this one conditional. How: This is passed the live conditional, its draft, and every handler this row needs.


									) }

								</Collapse>


							</div>


						);


					} ) }


				</div>

			</Collapse>


		</section>


	);


}

// #endregion CndManCom



// #region TabData

/**
 * TabData = Tab Data
 *
 * @summary
 * The Data tab's own top-level component: filters (Group/Type/
 * Conditionals/Show), the section sort control, and the rendered list
 * itself (Conditionals, Reminders, then every picker card, plus the
 * in-progress "Create Picker" draft appended last). Also owns help
 * mode's own disposable sample-data lifecycle and every onboarding-tour
 * disable/highlight gate this page's own controls need.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.state     - State: {@link useStore}
 * @param props.actions   - Actions: {@link useStore}
 * @param props.onHome    - On Home: Navigates back to the Today tab.
 * @param props.onNavTab  - On Nav Tab: Switches to another tab by id.
 *
 * @returns The Data tab's entire rendered content: its header, its
 * filters, the section sort bar, and the list of sections.
 *
 * @example
 * ```tsx
 * TabData({ state, actions, onHome, onNavTab }) // => <TabData />
 * ```
 *
*/

function TabData ( { state : staAppObj, actions : actObj, onHome : onHomFun, onNavTab : onNavTabFun } ) {


	const touObj    = useEmlTouFun();                                                                  // What: Tour Object. Why: Several controls below must disable themselves or highlight during specific onboarding tour steps. How: This reads the shared tour event bus's own phase/tourId/step fields.
	const disGrpBoo = touObj.phase === 'tour' && touObj.tourId === 'page-explore_data' && touObj.step === 1; // What: Disable Group Boolean. Why: Narrating what the Group filter does is the point of this tour step; letting it actually change would strand a later step's own target. How: This is true only during page-explore_data's own Step 1.
	const disShwBoo = touObj.phase === 'tour' && touObj.tourId === 'page-explore_data' && touObj.step === 3; // What: Disable Show Boolean. Why: Same reasoning as disGrpBoo, for the Show filter row. How: This is true only during page-explore_data's own Step 3.
	const disCrtBoo = touObj.phase === 'tour' && touObj.tourId === 'page-explore_data' && touObj.step === 6; // What: Disable Create Boolean. Why: Step 7 only points at the Create Picker button; actually clicking it would open a whole new draft form the tour knows nothing about and never cleans up. How: This is true only during page-explore_data's own Step 6.


	const detPicBoo = touObj.phase === 'tour' && touObj.tourId === 'appfeature-feat_edit_item' && ( touObj.step === 3 || touObj.step === 5 || touObj.step === 6 ); // What: Disable Edit-Tour Picker Boolean. Why: Steps 4/6/7 of the "edit your first item" tour all depend on this exact picker staying expanded as their own target. How: This guards the picker header's own collapse toggle during those 3 steps.
	const detConBoo = touObj.phase === 'tour' && touObj.tourId === 'appfeature-feat_edit_item' && ( touObj.step === 5 || touObj.step === 6 );                     // What: Disable-Edit-Tour Control Boolean. Why: Steps 6/7 would let the highlighted box balloon to include Controls, which those steps were never about. How: This guards the Controls header's own toggle during those 2 steps.
	const detIteBoo = touObj.phase === 'tour' && touObj.tourId === 'appfeature-feat_edit_item' && ( touObj.step === 3 || touObj.step === 5 || touObj.step === 6 ); // What: Disable Edit-Tour Items Boolean. Why: Collapsing Items during steps 6/7 would hide the item rows/Add button those steps depend on. How: This guards the Items header's own toggle during all 3 steps.
	const detAddBoo = touObj.phase === 'tour' && touObj.tourId === 'appfeature-feat_edit_item' && ( touObj.step === 5 || touObj.step === 6 );                     // What: Disable Edit-Tour Add Boolean. Why: Step 6's own body text says this button is disabled for the tutorial, and a brand-new item would shift every row's position out from under its "click any of these" framing. How: This guards the Add button during steps 6/7.

	const tutProBoo = OB_CHECKLIST.tutorialsInProgress( staAppObj ); // What: Tutorial Progress Boolean. Why: Several add/edit controls (distinct from the detAddBoo tour above, which only runs AFTER this is always false) must stay disabled until the Welcome Tour's own checklist finishes. How: This calls the shared OB_CHECKLIST helper against the whole app state.

	const hetPicBoo = touObj.phase === 'tour' && touObj.tourId === 'appfeature-feat_edit_item' && touObj.step === 1; // What: Highlight Edit-Tour Picker Boolean. Why: Step 2 targets EVERY picker's own .cat section; a per-element fade (rather than the tour engine's default single-box pulse) is needed to show "any of these" rather than "this one group". How: This is true only during Step 1 (the step BEFORE the click it's preparing for).
	const hetConBoo = touObj.phase === 'tour' && touObj.tourId === 'appfeature-feat_edit_item' && touObj.step === 2; // What: Highlight-Edit-Tour Control Boolean. Why: Step 3 targets a single Controls header. How: This is true only during Step 2.
	const hetIteBoo = touObj.phase === 'tour' && touObj.tourId === 'appfeature-feat_edit_item' && touObj.step === 4; // What: Highlight Edit-Tour Items Boolean. Why: Step 5 targets a single Items header. How: This is true only during Step 4.
	const hetRowBoo = touObj.phase === 'tour' && touObj.tourId === 'appfeature-feat_edit_item' && touObj.step === 5; // What: Highlight Edit-Tour Row Boolean. Why: Step 6 targets each item row's own .rd-item wrapper, using per-side borders rather than a shared outline. How: This is true only during Step 5.


	const [ helOpnBoo, setHelOpnBoo ] = React.useState( false );          // What: Help Open Boolean And Setter. Why: Help mode needs its own on/off state, matching every other tab's own help toggle. How: This is flipped by HelpButton and read by HelpOverlay/the seed effect below.
	const helExiFun                   = React.useCallback( () => setHelOpnBoo( false ), [] ); // What: Help Exit Function. Why: HelpOverlay needs a stable close handler that doesn't change identity on every render. How: This just sets helOpnBoo false.

	React.useEffect( () => { // What: Help Seed Effect. Why: Help mode needs real pickers of every mode and reminders of every recurrence kind to show a representative "view and edit" section, but only while it's actually on. How: This seeds both disposable sample sets on, and clears both off.


		if ( helOpnBoo ) { seedHelpPickers( staAppObj, actObj ); seedHelpTasks( staAppObj, actObj ); } // What: Seed Guard. Why: Turning help mode on should populate both sample sets together. How: This calls both seed helpers when helOpnBoo is true.

		else { clearHelpPickers( actObj ); clearHelpTasks( actObj ); } // What: Clear Guard. Why: Turning help mode off must remove both sample sets so they never leak into the user's real data view. How: This calls both clear helpers otherwise.


	}, [ helOpnBoo ] ); // What: Effect Dependency Array. Why: This only ever needs to reconsider itself when help mode's own on/off state changes. How: helOpnBoo is the single value this effect's own guard is built around.

	React.useEffect( () => () => { clearHelpPickers( actObj ); clearHelpTasks( actObj ); }, [] ); // What: Unmount Cleanup Effect. Why: Navigating away from this tab entirely must not leave help mode's own sample data behind. How: This returns a cleanup that clears both sample sets, run once on unmount.


	const [ opnIteStr, setOpnIteStr ] = React.useState( null ); // What: Open Item String And Setter. Why: Only one picker item across the whole page can be expanded for editing at a time, mirroring the Reminders list. How: This holds whichever item's own id is currently open, or null.
	const newIteRef                   = React.useRef( null );   // What: New Item Reference. Why: A brand-new, not-yet-kept item needs to be tracked so Cancel can discard the whole add instead of reverting to an empty snapshot. How: This holds whichever item's own id was just created, cleared once it's kept.
	const [ insIteStr, setInsIteStr ] = React.useState( null ); // What: Insert Item String And Setter. Why: A just-inserted row needs to play its own slide-in entrance exactly once. How: This holds whichever item's own id should currently play that entrance.
	const opnEdiRef                   = React.useRef( null );   // What: Open Editor Reference. Why: The open item's own row header (outside IteEdiCom) needs to call its own .keep() before closing, so an explicit close never gets treated as an implicit revert. How: This holds whichever IteEdiCom instance is currently open.
	const frzIndRef                   = React.useRef( null );   // What: Frozen Index Reference. Why: freezeEditedRow needs one shared ref across every picker's own item list (only one item can be open at a time). How: This is passed straight through to freezeEditedRow below.


	const preOpnRef = React.useRef( null ); // What: Previous Open Reference. Why: The insert-entrance replay effect below needs to compare against whichever item was open on the PREVIOUS render. How: This starts null and is updated by the effect below on every change.

	React.useEffect( () => { // What: Insert Replay Effect. Why: Whenever an item's editor closes (Done, Cancel-revert, delete, or the row's own collapse chevron), it should replay the same insert-entrance treatment a freshly-created row gets, instead of silently snapping into its new sorted position. How: This detects the transition and flags the previously-open item's own id for insIteStr.


		const preIteStr = preOpnRef.current; // What: Previous Item String. Why: Detecting an actual close requires comparing against what was open before this render. How: This reads preOpnRef.current once.

		if ( preIteStr != null && preIteStr !== opnIteStr ) setInsIteStr( preIteStr ); // What: Replay Guard. Why: Only an item that WAS open and no longer is should replay its own entrance. How: This flags preIteStr for insIteStr only when both conditions hold.

		preOpnRef.current = opnIteStr; // What: Previous Open Update. Why: The next run of this effect needs to compare against whatever is open now. How: This overwrites preOpnRef with opnIteStr.


	}, [ opnIteStr ] ); // What: Effect Dependency Array. Why: This only ever needs to reconsider itself when which item is open actually changes. How: opnIteStr is the single value this effect's own guard is built around.

	const opnRowRef = React.useRef( null ); // What: Open Row Reference. Why: A brand-new item's own "+ Add" click needs a handle on the resulting row so it can be scrolled into view. How: This is attached to whichever row is currently open.

	React.useEffect( () => { // What: Scroll Into View Effect. Why: A freshly-created item's own form should scroll into view once its Collapse has actually finished opening, pinned right below the sort control rather than the top of a possibly-tall list. How: This waits 300ms (matching the Collapse open animation) before scrolling, or scrolls instantly under reduced motion.


		if ( !opnIteStr || newIteRef.current !== opnIteStr || !opnRowRef.current ) return; // What: Not Applicable Guard. Why: Only a brand-new, currently-open item with a mounted ref needs this scroll. How: This bails out whenever any of the 3 conditions isn't met.


		const rowCurEle = opnRowRef.current; // What: Row Current Element. Why: The scroll call below needs a stable local reference to the live row node. How: This reads opnRowRef.current once and reuses it.

		if ( reduceMotion() ) { rowCurEle.scrollIntoView( { behavior : 'auto', block : 'nearest' } ); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion should see this scroll happen instantly. How: This scrolls immediately and returns early.


		const scrTimNum = setTimeout( () => rowCurEle.scrollIntoView( { behavior : 'smooth', block : 'nearest' } ), 300 ); // What: Scroll Timeout Number. Why: The Collapse open animation (.26s) needs to finish growing the editor before the scroll starts. How: This schedules the smooth scroll 300ms out.


		return () => clearTimeout( scrTimNum ); // What: Effect Cleanup Return. Why: A stale scroll must not fire after this effect re-runs or the component unmounts. How: This cancels scrTimNum.


	}, [ opnIteStr ] ); // What: Effect Dependency Array. Why: This scroll only ever needs to reconsider itself when which item is open actually changes. How: opnIteStr is the single value this effect's own guard is built around.

	const focInpRef = React.useRef( null ); // What: Focused Input Reference. Why: The name input focuses itself via a ref callback (inline, below) instead of the plain autoFocus attribute, so it can pass preventScroll and avoid fighting the deliberate smooth scroll above. How: This is guarded by node identity so a later re-render of the SAME input doesn't refocus it repeatedly.

	const [ conDelObj, setConDelObj ] = React.useState( null ); // What: Confirm Delete Object And Setter. Why: Both items and pickers share one inline delete-confirmation slot. How: This holds a { kind : 'item' | 'picker', id } shape, or null when nothing is confirming.


	const [ filGrpStr, setFilGrpStr ] = React.useState( 'all' ); // What: Filter Group String And Setter. Why: The Group filter row narrows which pickers appear below, mirroring the Pickers + Stats tabs; both default to "All". How: This is committed by the Group pill row and read throughout this component.
	const [ filTypStr, setFilTypStr ] = React.useState( 'all' ); // What: Filter Type String And Setter. Why: The Type filter row narrows by picker mode, and also carries the Conditionals/Reminders sentinel scope values. How: This is committed by the Type pill row and read throughout this component.
	const [ curScoStr, setCurScoStr ] = React.useState( 'all' ); // What: Current Scope String And Setter. Why: The Show row's own active box needs its own selection state, independent of (but reconciled with) the other 2 filters. How: This is committed by onSelect below and read throughout this component.
	const [ filCndStr, setFilCndStr ] = React.useState( 'all' ); // What: Filter Conditional String And Setter. Why: The Conditionals filter row narrows pickers to those gated by one chosen conditional. How: This is committed by the Conditionals pill row and read throughout this component.

	const picArr = staAppObj.pickers || []; // What: Picker Array. Why: Nearly every filter/list computation below needs the full picker list to start from. How: This reads staAppObj.pickers, falling back to an empty array.

	const [ remPicStr, setRemPicStr ] = React.useState( null ); // What: Removing Picker String And Setter. Why: A deleted picker's own card needs to finish its collapse+fade-out animation before actually being removed. How: This holds whichever picker's own id is currently mid-removal-animation.
	const delPicFun = ( pikIdeStr ) => { if ( reduceMotion() ) { actObj.removePicker( pikIdeStr ); return; } setRemPicStr( pikIdeStr ); }; // What: Delete Picker Function. Why: A user who prefers reduced motion should see the removal happen instantly instead of animating. How: This removes the picker directly under reduced motion, otherwise just flags it for the animated removal (finished by the card's own onAnimationEnd below).


	const [ newDrfStr, setNewDrfStr ]   = React.useState( null );  // What: New Draft String And Setter. Why: The "Create Picker" trigger creates a REAL (but hidden) picker immediately; only its id is held here, since the card below always reads the LIVE picker from staAppObj.pickers, same as any other card. How: This is set by strNewFun and cleared by canNewFun/savNewFun.
	const [ drfIteBoo, setDrfIteBoo ]   = React.useState( false ); // What: Draft Items Boolean And Setter. Why: The draft's own Items section starts closed, unlike a real picker's default-open one, since there's nothing to add to yet. How: This is toggled by the footer's "Add Items" button or the Items section's own header.
	const [ penAutBoo, setPenAutBoo ]   = React.useState( false ); // What: Pending Auto Boolean And Setter. Why: The footer's first "Add Items" click should ALSO land straight in a ready-to-type new-item form, but PicConCom's own Items Collapse only starts mounting children one render after drfIteBoo flips, so this defers the auto-add by one effect tick. How: This is flagged true by onOpnSecFun and consumed by the effect below.

	React.useEffect( () => { // What: Pending Auto Add Effect. Why: Deferring the auto-add by one render lets both the reveal and the new item's own open state land in the SAME next render, instead of racing the Collapse's own child-mount delay. How: This creates a brand-new item and opens it, exactly once per penAutBoo flip.


		if ( !penAutBoo ) return; // What: Not Pending Guard. Why: This effect should do nothing until specifically flagged. How: This bails out early while penAutBoo is false.

		setPenAutBoo( false ); // What: Pending Clear Call. Why: This is a strictly one-shot flag. How: This resets penAutBoo to false immediately.

		if ( !newDrfStr || newIteRef.current ) return; // What: Not Applicable Guard. Why: There must be an actual draft picker, and no other brand-new item already in progress. How: This bails out when either condition fails.



		const nexIdeStr = 'it_' + Math.random().toString( 36 ).slice( 2, 8 ); // What: Next Identifier String. Why: The brand-new item needs its own id immediately. How: This generates a short random id with an 'it_' prefix.

		actObj.addItem( newDrfStr, 'New item', nexIdeStr ); // What: Add Item Call. Why: This is the actual creation of the draft's own first item. How: This adds an item named 'New item' under newDrfStr, with the freshly-generated id.

		newIteRef.current = nexIdeStr; // What: New Item Mark. Why: Cancel must discard this exact item, not revert it to a snapshot. How: This flags nexIdeStr as the brand-new, not-yet-kept item.
		setInsIteStr( nexIdeStr );      // What: Insert Item Set Call. Why: The freshly-created row should play the slide-in entrance. How: This sets insIteStr to nexIdeStr.
		setOpnIteStr( nexIdeStr );      // What: Open Item Set Call. Why: The freshly-created item's own editor should open immediately. How: This sets opnIteStr to nexIdeStr.


	}, [ penAutBoo ] ); // What: Effect Dependency Array. Why: This only ever needs to run when the one-shot flag itself is set. How: penAutBoo is the single value this effect's own guard is built around.

	const strNewFun = () => { // What: Start New Function. Why: The "Create Picker" button creates a real, hidden picker immediately, pre-filled from whichever Group/Type/Conditional filter is currently active. How: This calls addPicker with those defaults and opens the resulting id as the new draft.


		const isaRelBoo = !!MODES[ filTypStr ]; // What: Is-A Real Mode Boolean. Why: filTypStr can hold a Conditionals/Reminders sentinel value that isn't an actual picker mode. How: This checks whether filTypStr is a genuine key in MODES.

		const newIdeStr = actObj.addPicker( { // What: New Identifier String. Why: The freshly-created picker's own id is needed immediately to become the new draft. How: This calls addPicker, pre-filled per the active filters, and returns its own new id.


			name          : '',
			group         : filGrpStr !== 'all' ? filGrpStr : '',
			mode          : isaRelBoo ? filTypStr : 'random',
			conditionalId : filCndStr !== 'all' ? filCndStr : null,
			items         : [],
			hidden        : true

		} );


		setNewDrfStr( newIdeStr ); // What: New Draft Set Call. Why: The card below needs to know which live picker is the in-progress draft. How: This sets newDrfStr to newIdeStr.
		setDrfIteBoo( false );     // What: Draft Items Reset Call. Why: A brand-new draft always starts with its own Items section closed. How: This resets drfIteBoo to false.


	};

	const canNewFun = () => { // What: Cancel New Function. Why: Cancel discards the whole draft; removePicker already cascades to its own items and daily-generator membership, so there's nothing else to clean up. How: This removes the draft picker (if one exists) and clears both draft-tracking states.


		if ( newDrfStr ) actObj.removePicker( newDrfStr ); // What: Remove Draft Guard. Why: Only an actual draft picker needs removing. How: This only calls removePicker when newDrfStr is set.

		setNewDrfStr( null );  // What: New Draft Clear Call. Why: The draft card must disappear once cancelled. How: This resets newDrfStr to null.
		setDrfIteBoo( false );  // What: Draft Items Reset Call. Why: A future new draft should start fresh, not carry over this one's Items-open state. How: This resets drfIteBoo to false.


	};

	const savNewFun = () => { // What: Save New Function. Why: Save reveals the picker everywhere else by clearing its own hidden flag; every other field was already committed live via the same actObj.updatePicker calls a real picker's own Controls uses. How: This clears hidden on the draft picker and clears both draft-tracking states.


		if ( newDrfStr ) actObj.updatePicker( newDrfStr, { hidden : false } ); // What: Reveal Draft Guard. Why: Only an actual draft picker needs revealing. How: This only calls updatePicker when newDrfStr is set.

		setNewDrfStr( null );  // What: New Draft Clear Call. Why: This is no longer a "draft" once saved; it's just a normal picker now. How: This resets newDrfStr to null.
		setDrfIteBoo( false );  // What: Draft Items Reset Call. Why: A future new draft should start fresh. How: This resets drfIteBoo to false.


	};

	const drfCrdRef = React.useRef( null ); // What: Draft Card Reference. Why: The freshly-created draft's own card needs to scroll all the way to the viewport's own top, since its form is tall enough that "nearest" would still leave most of it below the fold. How: This is attached to the draft card's own ref prop.

	React.useEffect( () => { // What: Draft Scroll Effect. Why: The draft's own final layout height is already correct by the time this runs (its own Collapses are forced instant), so there's no animation to wait for first, unlike the item/conditional row scrolls above. How: This scrolls drfCrdRef into view at the viewport's own top.


		if ( !newDrfStr || !drfCrdRef.current ) return; // What: Not Applicable Guard. Why: Only an actual, mounted draft card needs this scroll. How: This bails out when either condition fails.

		drfCrdRef.current.scrollIntoView( { behavior : reduceMotion() ? 'auto' : 'smooth', block : 'start' } ); // What: Draft Scroll Call. Why: This is the actual scroll-to-top-of-viewport action. How: This scrolls instantly under reduced motion, smoothly otherwise.


	}, [ newDrfStr ] ); // What: Effect Dependency Array. Why: This only ever needs to run when a brand-new draft actually appears. How: newDrfStr is the single value this effect's own guard is built around.

	const IteEdiCom = EntryEditor; // What: Item Editor Component. Why: This scopes EntryEditor under a name matching this file's own component-naming convention, without renaming the actual import. How: This is reused so Today and Data stay exact copies, same pattern as the Reminders editor.

	const colMapObj = ( staAppObj.ui && staAppObj.ui.controlsCollapsed ) || {}; // What: Collapsed Map Object. Why: Every picker card's own open/closed state, plus its nested Controls/Items disclosures, are all persisted through this one map. How: This reads staAppObj.ui.controlsCollapsed, falling back to an empty object.


	const exiGroArr = React.useMemo( () => { // What: Existing Group Array. Why: The Group filter row needs every distinct, non-hidden group name, alphabetical. How: This walks picArr once, collecting each group name the first time it's seen.


		const seenArr = []; // What: Seen Array. Why: The walk below needs to track which group names have already been collected, preserving nothing about order (the final sort handles that). How: This starts empty and is pushed to below.

		for ( const picCurObj of picArr ) if ( picCurObj.group && !picCurObj.hidden && !seenArr.includes( picCurObj.group ) ) seenArr.push( picCurObj.group ); // What: Group Collect Loop. Why: Every non-hidden picker's own group needs collecting exactly once. How: This pushes picCurObj.group whenever it's set, the picker isn't hidden, and it isn't already collected.


		return seenArr.sort( ( aGroStr, bGroStr ) => aGroStr.localeCompare( bGroStr ) ); // What: Seen Array Return. Why: The filter row needs these alphabetized. How: This sorts seenArr via localeCompare.


	}, [ picArr ] ); // What: Effect Dependency Array. Why: This only ever needs recomputing when the picker list itself changes. How: picArr is the single value this memo's own recompute is built around.

	const exiModArr = React.useMemo( () => { // What: Existing Mode Array. Why: The Type filter row needs every distinct mode actually in use, alphabetical by its own display label. How: This walks picArr once, collecting each mode the first time it's seen.


		const seenSetObj = new Set(); // What: Seen Set Object. Why: A Set naturally de-duplicates modes without a manual includes() check. How: This starts empty and is added to below.

		for ( const picCurObj of picArr ) if ( !picCurObj.hidden ) seenSetObj.add( picCurObj.mode ); // What: Mode Collect Loop. Why: Every non-hidden picker's own mode needs collecting. How: This adds picCurObj.mode to seenSetObj whenever the picker isn't hidden.


		return [ ...seenSetObj ].sort( ( aModStr, bModStr ) => MODES[ aModStr ].label.localeCompare( MODES[ bModStr ].label ) ); // What: Seen Set Return. Why: The filter row needs these alphabetized by their own display label, not their raw key. How: This spreads seenSetObj into an array and sorts by each mode's own MODES label.


	}, [ picArr ] ); // What: Effect Dependency Array. Why: This only ever needs recomputing when the picker list itself changes. How: picArr is the single value this memo's own recompute is built around.

	const visPicArr = React.useMemo( () => ( // What: Visible Picker Array. Why: The Show row and every section below need pickers already narrowed by every active filter. How: This filters picArr by hidden/statGroup/condFilter/typeFilter together.


		picArr.filter( ( picCurObj ) =>
			!picCurObj.hidden &&
			( filGrpStr === 'all' || picCurObj.group === filGrpStr ) &&
			( filCndStr === 'all' || picCurObj.conditionalId === filCndStr ) &&
			( filTypStr === 'all' || picCurObj.mode === filTypStr ) )


	), [ picArr, filGrpStr, filCndStr, filTypStr ] ); // What: Effect Dependency Array. Why: This only ever needs recomputing when the picker list or any one of the 3 active filters changes. How: Each of these 4 values independently affects which pickers pass the filter above.

	const cndIteArr = staAppObj.conditionals || []; // What: Conditional Item Array. Why: Several filter rows and section counts below need the full conditional list. How: This reads staAppObj.conditionals, falling back to an empty array.
	const cndCouFun = ( cidStr ) => picArr.filter( ( picCurObj ) => picCurObj.conditionalId === cidStr && !picCurObj.hidden ).length; // What: Conditional Count Function. Why: The Conditionals filter row's own per-pill count needs how many (non-hidden) pickers use each one. How: This counts every picker whose own conditionalId matches cidStr.


	const shwEntArr = React.useMemo( () => { // What: Show Entry Array. Why: The Show row's own actual rendered order (and "jump to the first card" logic below) both need one shared source of truth. How: This builds Conditionals/Reminders/every visible picker, sorted together, then optionally pins an "All" entry first.


		const resArr = [ // What: Rest Array. Why: Conditionals/Reminders/every visible picker all sort together alphabetically, after any pinned "All" entry. How: This spreads in a Conditionals entry, a Reminders entry, and every visPicArr entry, each only when applicable, then sorts the combined list.

			...( ( filTypStr === 'all' || filTypStr === 'conditionals' ) && cndIteArr.length > 0 ? [ { scope : 'conditionals', name : 'Conditionals' } ] : []),
			...( filTypStr === 'all' || filTypStr === 'reminders' ? [ { scope : 'reminders', name : 'Reminders' } ] : []),
			...visPicArr.map( ( picCurObj ) => ( { scope : picCurObj.id, name : picCurObj.name } ) )

		].sort( ( aEntObj, bEntObj ) => aEntObj.name.localeCompare( bEntObj.name ) );

		const dfltFilBoo = filGrpStr === 'all' && filTypStr === 'all'; // What: Default Filter Boolean. Why: "All" only needs pinning first when every filter is still at its default, or (see below) a real filter still leaves 2+ entries in view. How: This checks both filGrpStr and filTypStr are 'all'.


		return ( dfltFilBoo || resArr.length >= 2 ) ? [ { scope : 'all', name : 'All' }, ...resArr ] : resArr; // What: Show Entry Return. Why: A lone remaining entry would make "All" a redundant duplicate of that one card. How: This pins "All" first whenever dfltFilBoo holds or resArr still has 2+ entries, otherwise returns resArr as-is.


	}, [ filGrpStr, filTypStr, cndIteArr.length, visPicArr ] ); // What: Effect Dependency Array. Why: This only ever needs recomputing when a filter changes or the underlying conditional/picker lists themselves change. How: Each of these 4 values independently affects which entries appear or how many there are.

	const shwAllBoo = shwEntArr.some( ( entCurObj ) => entCurObj.scope === 'all' ); // What: Show All Boolean. Why: The Show row's own render needs to know whether an "All" card is actually present this render. How: This checks shwEntArr for a 'all' scope entry.


	const preFilRef = React.useRef( { statGroup : filGrpStr, condFilter : filCndStr, typeFilter : filTypStr } ); // What: Previous Filter Reference. Why: Landing on the Show row's own first card needs to detect an ACTUAL filter change, not just any render. How: This starts at the initial filter values and is updated by the effect below.

	React.useEffect( () => { // What: Scope Coherence Effect. Why: The active scope must always land on the Show row's own first card whenever any filter changes, not only once the OLD scope happens to fall out of view entirely. How: This detects a filter change (or the current scope no longer being a valid entry) and resets curScoStr to shwEntArr's own first entry.


		const chgBoo = preFilRef.current.statGroup !== filGrpStr || preFilRef.current.condFilter !== filCndStr || preFilRef.current.typeFilter !== filTypStr; // What: Changed Boolean. Why: This is the actual "did a filter change since last render" check. How: This compares every one of the 3 tracked filters against their own previous values.

		preFilRef.current = { statGroup : filGrpStr, condFilter : filCndStr, typeFilter : filTypStr }; // What: Previous Filter Update. Why: The next run of this effect needs to compare against the filters that are current now. How: This overwrites preFilRef with the freshly-read values.

		if ( chgBoo || !shwEntArr.some( ( entCurObj ) => entCurObj.scope === curScoStr ) ) setCurScoStr( shwEntArr[ 0 ] ? shwEntArr[ 0 ].scope : 'all' ); // What: Reset Scope Guard. Why: Either an actual filter change, or the current scope simply no longer existing in the row, both call for landing on the first card. How: This sets curScoStr to shwEntArr's own first entry (or 'all' if the row is somehow empty).


	}, [ filGrpStr, filCndStr, filTypStr, shwEntArr, curScoStr ] ); // What: Effect Dependency Array. Why: This must re-run whenever any filter changes, the entry list itself changes, or the current scope changes (so its own no-longer-valid check stays accurate). How: Every one of these 5 values can affect whether curScoStr needs resetting.


	const selScoFun = ( nexScoStr ) => setCurScoStr( nexScoStr ); // What: Select Scope Function. Why: The boxes' own click behavior is a stub for now, ready to wire up later; selection state itself still needs to update. How: This just commits nexScoStr as the new curScoStr.


	const grpRowRef = React.useRef( null ); // What: Group Row Reference. Why: The scroll-edge-fade effect below needs a handle on the Group filter row's own scrollable element. How: This is attached to that row's own ref prop.
	const typRowRef = React.useRef( null ); // What: Type Row Reference. Why: Same reasoning as grpRowRef, for the Type filter row. How: This is attached to that row's own ref prop.
	const scoRowRef = React.useRef( null ); // What: Scope Row Reference. Why: Same reasoning as grpRowRef, for the Show row. How: This is attached to that row's own ref prop.
	const cndRowRef = React.useRef( null ); // What: Conditional Row Reference. Why: Same reasoning as grpRowRef, for the Conditionals filter row. How: This is attached to that row's own ref prop.

	React.useEffect( () => { // What: Filter Rows Fade Effect. Why: Every filter row shares the same scroll-edge-fade affordance as the Stats tab. How: This wires up at-start/at-end tracking for whichever of the 4 rows are currently mounted, and tears every one down on cleanup.


		const rowEleArr = [ grpRowRef.current, typRowRef.current, scoRowRef.current, cndRowRef.current ].filter( Boolean ); // What: Row Element Array. Why: Not every row is always mounted (e.g. a single-group app has no Group row at all). How: This collects only the currently-mounted refs.

		const clnFunArr = rowEleArr.map( ( rowCurEle ) => { // What: Cleanup Function Array. Why: Every row needs its own independent wiring and its own independent teardown. How: This maps each row element to its own cleanup function, collected for the effect's own return below.


			const updFadFun = () => { // What: Update Fade Function. Why: Each row's own fade classes need recomputing on every relevant change. How: This toggles at-start/at-end based on the row's own scrollWidth/clientWidth/scrollLeft.


				const canScrBoo = rowCurEle.scrollWidth - rowCurEle.clientWidth > 1;                                             // What: Can Scroll Boolean. Why: A row that doesn't overflow at all should never show either fade edge. How: This is true only when the row's own content is wider than its own visible box by more than a rounding pixel.
				const atStrBoo  = !canScrBoo || rowCurEle.scrollLeft <= 1;                                                       // What: At Start Boolean. Why: The left fade should hide once the row can't scroll at all or is already at its own start. How: This combines canScrBoo with the row's own current scrollLeft.
				const atEndBoo  = !canScrBoo || rowCurEle.scrollLeft + rowCurEle.clientWidth >= rowCurEle.scrollWidth - 1;       // What: At End Boolean. Why: The right fade should hide once the row can't scroll at all or is already at its own end. How: This combines canScrBoo with the row's own current scroll position.

				rowCurEle.classList.toggle( 'at-start', atStrBoo ); // What: At Start Toggle. Why: This is the actual class CSS reads to hide the left fade. How: This applies atStrBoo.
				rowCurEle.classList.toggle( 'at-end', atEndBoo );   // What: At End Toggle. Why: This is the actual class CSS reads to hide the right fade. How: This applies atEndBoo.


			};


			updFadFun(); // What: Initial Fade Call. Why: The fade classes need to reflect this row's own real layout immediately. How: This invokes updFadFun once, synchronously.

			rowCurEle.addEventListener( 'scroll', updFadFun, { passive : true } ); // What: Row Scroll Listener. Why: Scrolling the row itself is the most common way its own edges change. How: This re-runs updFadFun on every scroll event, passively so it never blocks the scroll itself.

			const resObsObj = new ResizeObserver( updFadFun ); // What: Resize Observer Object. Why: A row's own fade state also depends on its measured width, which can change independent of scrolling. How: This re-runs updFadFun whenever the row's own box size changes.

			resObsObj.observe( rowCurEle ); // What: Resize Observer Start. Why: The observer above does nothing until it's told what to watch. How: This begins watching rowCurEle for size changes.


			return () => { rowCurEle.removeEventListener( 'scroll', updFadFun ); resObsObj.disconnect(); }; // What: Row Cleanup Return. Why: Both the listener and the observer must not outlive this effect run. How: This removes updFadFun from rowCurEle and disconnects resObsObj.


		} );


		return () => clnFunArr.forEach( ( clnCurFun ) => clnCurFun() ); // What: Effect Cleanup Return. Why: Every row's own individual cleanup must actually run. How: This calls every function collected in clnFunArr.


	}, [ picArr.length, filGrpStr, filTypStr, exiModArr.length, visPicArr.length, curScoStr, cndIteArr.length, filCndStr ] ); // What: Effect Dependency Array. Why: Any of these changing can add, remove, or resize a row, which can change whether it overflows at all. How: Each value independently affects one or more of the 4 rows' own layout.


	const togSecFun = ( secIdeStr ) => actObj.toggleControlsCollapsed( secIdeStr, true ); // What: Toggle Section Function. Why: Every picker card defaults collapsed, so its own toggle needs that default baked in. How: This calls toggleControlsCollapsed with defaultCollapsed true.


	const shwRemBoo = ( filTypStr === 'all' || filTypStr === 'reminders' ) && filCndStr === 'all' && ( curScoStr === 'all' || curScoStr === 'reminders' ); // What: Show Reminders Boolean. Why: Reminders is its own scope and isn't part of any picker group/mode, so it only appears when the type filter is "All" (or itself), unfiltered by conditional, at the matching scope. How: This combines all 3 conditions with &&.
	const shwCndBoo = ( filTypStr === 'all' || filTypStr === 'conditionals' ) && filCndStr === 'all' // What: Show Conditionals Boolean. Why: The Conditionals manager is shown even with none created, since it's the only place to create one; gating on existence would make it unreachable from a clean state. How: This combines the same 3-condition shape as shwRemBoo.
		&& ( curScoStr === 'all' || curScoStr === 'conditionals' );
	const shwPicArr = ( curScoStr === 'reminders' || curScoStr === 'conditionals' ) // What: Shown Picker Array. Why: The rendered picker cards are visPicArr narrowed once more by the active scope. How: This is empty at the Reminders/Conditionals scopes, every visPicArr entry at 'all', or just the one matching picker otherwise.
		? []
		: ( curScoStr === 'all' ? visPicArr : visPicArr.filter( ( picCurObj ) => picCurObj.id === curScoStr ) );

	const remCouNum = ( staAppObj.tasks || [] ).filter( ( tasCurObj ) => !tasCurObj.hidden ).length; // What: Reminders Count Number. Why: The Reminders section entry below needs its own live count, the same as every picker card's own item count. How: This counts every non-hidden task.
	const picSecMap = React.useMemo( () => { // What: Picker Section Map. Why: The section sort needs each shown picker's own item count and active state, computed once rather than per sort comparison. How: This builds an id-keyed map of { count, isActive } for every entry in shwPicArr.


		const mapObj = new Map(); // What: Map Object. Why: The loop below needs somewhere to collect each picker's own computed metadata. How: This starts empty and is set on below.

		for ( const picCurObj of shwPicArr ) { // What: Picker Meta Loop. Why: Every shown picker needs its own count/active metadata computed once. How: This filters staAppObj.items per picker and derives both fields from that filtered list.


			const itsArr = staAppObj.items.filter( ( iteCurObj ) => iteCurObj.pickerId === picCurObj.id ); // What: Items Array. Why: Both fields below depend on this exact picker's own items. How: This filters the whole app's items down to just this picker's own.

			mapObj.set( picCurObj.id, { count : itsArr.length, isActive : !( itsArr.length > 0 && itsArr.every( ( iteCurObj ) => iteCurObj.vacation ) ) } ); // What: Map Set Call. Why: This picker's own computed metadata needs to be recorded under its own id. How: This sets count to the item count, and isActive false only when every item (and there's at least one) is on vacation.


		}


		return mapObj; // What: Map Object Return. Why: The section sort below needs this whole map back. How: This returns the same mapObj built and set on above.


	}, [ shwPicArr, staAppObj.items ] ); // What: Effect Dependency Array. Why: This only ever needs recomputing when the shown pickers or the app's own items change. How: Both values independently affect the computed metadata.

	const secSorStr = ( staAppObj.ui && staAppObj.ui.dataSort && staAppObj.ui.dataSort.sections ) || 'name-asc'; // What: Section Sort String. Why: The top-level section list needs its own persisted sort choice. How: This reads staAppObj.ui.dataSort.sections, falling back to 'name-asc'.
	const secEntArr = React.useMemo( () => { // What: Section Entry Array. Why: Conditionals/Reminders/every shown picker all need a common comparable shape before they can be sorted together. How: This builds one entry per visible section, then sorts the combined list via compareSortEntries.


		const entArr = []; // What: Entry Array. Why: The pushes below need somewhere to collect one entry per visible section. How: This starts empty and is conditionally pushed to just below.

		if ( shwCndBoo ) entArr.push( { kind : 'conditionals', name : 'Conditionals', type : 'Conditionals', group : null, count : cndIteArr.length, isActive : null } ); // What: Conditionals Entry Push. Why: Group/Active have no meaning for Conditionals as a WHOLE section. How: This pushes a null group/isActive entry, with count as the total conditional count.
		if ( shwRemBoo ) entArr.push( { kind : 'reminders', name : 'Reminders', type : 'Reminders', group : null, count : remCouNum, isActive : null } );        // What: Reminders Entry Push. Why: Same reasoning as the Conditionals entry above, for Reminders. How: This pushes a null group/isActive entry, with count as remCouNum.

		for ( const picCurObj of shwPicArr ) { // What: Picker Entry Loop. Why: Every shown picker needs its own entry in the same comparable shape. How: This looks up each picker's own precomputed metadata from picSecMap.


			const metObj = picSecMap.get( picCurObj.id ) || { count : 0, isActive : true }; // What: Meta Object. Why: This picker's own count/active fields were already computed above. How: This reads picSecMap, falling back to a safe default if somehow missing.

			entArr.push( { kind : 'picker', pk : picCurObj, name : picCurObj.name, type : MODES[ picCurObj.mode ].label, group : picCurObj.group || null, count : metObj.count, isActive : metObj.isActive } ); // What: Picker Entry Push. Why: A picker's own entry needs its own name/type/group alongside the precomputed count/active fields. How: This pushes one entry per picCurObj.


		}


		return entArr.sort( ( aEntObj, bEntObj ) => compareSortEntries( aEntObj, bEntObj, secSorStr ) ); // What: Entry Array Return. Why: The rendered list needs to actually be in secSorStr's own order. How: This sorts entArr via compareSortEntries.


	}, [ shwCndBoo, shwRemBoo, shwPicArr, picSecMap, cndIteArr.length, remCouNum, secSorStr ] ); // What: Effect Dependency Array. Why: Any of these changing can add, remove, or reorder a section. How: Each value independently affects the entry list or its own sort order.


	const drfPicObj = newDrfStr ? picArr.find( ( picCurObj ) => picCurObj.id === newDrfStr ) : null;                      // What: Draft Picker Object. Why: The draft's own card, appended last below, needs the live picker record itself, not just its id. How: This looks up newDrfStr in picArr, or null when there's no draft.
	const drfEntObj = drfPicObj ? { kind : 'picker', pk : drfPicObj, isDraft : true } : null;                             // What: Draft Entry Object. Why: The draft card is deliberately NOT part of secEntArr/its sort, so it always renders last regardless of sort order and never shows up filtered out by an unrelated group/type/conditional filter. How: This is null unless a real draft picker exists.
	const rdrEntArr = drfEntObj ? [ ...secEntArr, drfEntObj ] : secEntArr; // What: Rendered Entry Array. Why: The list below needs the sorted sections plus, when present, the draft appended after them. How: This appends drfEntObj only when it exists.


	return (


		<div className='tab tab--data'>{ /* What: Tab Div Element. Why: This is TabData's own root element. How: This wraps the help overlay, header, filters, sort bar, and list below. */ }


			<HelpOverlay active={ helOpnBoo } items={ DATA_HELP_ITEMS } onExit={ helExiFun } />{ /* What: Help Overlay. Why: This tab needs the same help-mode badge overlay every other tab exposes. How: This is driven by helOpnBoo and this tab's own DATA_HELP_ITEMS catalog. */ }

			<header className='stat-h'>{ /* What: Header Element. Why: This tab's own kicker, brand link, and lead paragraphs all belong in one landmark. How: This wraps the kicker row and the lead/warning paragraphs below. */ }


				<div className='kicker-row'>{ /* What: Kicker Row Div Element. Why: The kicker label and the help toggle belong on the same line. How: This wraps the kicker div and HelpButton below. */ }

					<div className='kicker stat-h-kicker'>Data</div>{ /* What: Kicker Div Element. Why: Every tab needs its own small kicker label above the title. How: This renders the literal text "Data". */ }
					<HelpButton active={ helOpnBoo } onClick={ () => setHelOpnBoo( ( preBoo ) => !preBoo ) } />{ /* What: Help Button. Why: This tab needs the same help-mode toggle every other tab exposes. How: This flips helOpnBoo on click. */ }

				</div>

				<div className='stat-h-lead'>{ /* What: Lead Div Element. Why: The brand link and the page title belong together at the top of the header. How: This wraps the brand button and the section-h div below. */ }


					<button
						type='button'
						className='brand-mark'
						aria-label='Ease My Life link to go to the Today page'
						onClick={ onHomFun }
					>{ /* What: Brand Button Element. Why: The logo/wordmark also works as a shortcut back to the Today tab. How: This wraps the theme-wired logo svg below and jumps to Today on click. */ }


						<svg
							viewBox='8 8 528 528'
							fill='none'
							aria-hidden='true'
						>{ /* What: Logo Svg Element. Why: This draws the small square "Ease My Life" logo mark, matching the Today/Stats headers (currentColor to accent, grid lines to accent-soft) so every tab reads as one product. How: This is a fixed-viewBox icon composed of a grid, a rounded-square badge outline, and a clipped glyph path. */ }


							<defs>{ /* What: Clip Defs Element. Why: An SVG clipPath can only be applied via a defined, referenced id, not inline. How: This holds the one clipPath definition the glyph path below references. */ }

								<clipPath id='brandMarkClipData' clipPathUnits='userSpaceOnUse'>{ /* What: Badge Clippath Element. Why: The glyph path's own curves slightly overshoot the rounded-square badge and need to be masked to it. How: This defines a rounded-square clip region, given a unique id so it can be referenced via url(#...). */ }

									<rect width='512' height='512' x='16' y='16' rx='75' ry='75' />{ /* What: Clip Rect Element. Why: The clip region itself needs a concrete shape to clip to. How: This draws the rounded-square shape that the clipPath above exposes for reference. */ }

								</clipPath>

							</defs>

							<g style={{ stroke : 'var(--accent-soft)', strokeWidth : 16 }}>{ /* What: Grid Group Element. Why: Groups the 8 decorative background lines so they can share one stroke style instead of repeating it 8 times. How: This sets the shared stroke/strokeWidth once, applied to every child path below. */ }

								<path d='M 528 112 L 16 112' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment; its siblings below draw the rest of the grid. */ }
								<path d='M 216 528 L 216 16' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment; its siblings draw the rest of the grid. */ }
								<path d='M 320 528 L 320 16' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment; its siblings draw the rest of the grid. */ }
								<path d='M 424 528 L 424 16' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment; its siblings draw the rest of the grid. */ }
								<path d='M 112 528 L 112 16' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment; its siblings draw the rest of the grid. */ }
								<path d='M 528 216 L 16 216' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment; its siblings draw the rest of the grid. */ }
								<path d='M 528 320 L 16 320' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment; its siblings draw the rest of the grid. */ }
								<path d='M 528 424 L 16 424' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment, completing the grid. */ }

							</g>

							<rect
								width='512'
								height='512'
								x='16'
								y='16'
								rx='75'
								ry='75'
								style={{ strokeWidth : 16, strokeLinecap : 'round', strokeLinejoin : 'round', stroke : 'currentColor' }}
							/>{ /* What: Badge Rect Element. Why: The logo needs a visible rounded-square border/badge behind the glyph. How: This draws the same rounded-square shape as the clip rect above, but stroked and visible instead of hidden in defs. */ }

							<path
								d='M 24.467 527.792 C 67.266 416.298 77.088 228.913 172.207 434.412 C 200.739 535.77 262.562 434.412 314.873 292.51 C 381.45 120.201 450.381 44.636 528.854 24.365 C 521.725 22.337 512.215 24.365 493.193 34.5 C 369.548 105.451 295.85 292.51 234.029 363.461 C 186.473 414.14 167.451 241.831 124.651 262.102 C 101.828 270.008 60.133 375.754 24.467 527.792 Z'
								strokeWidth='8'
								strokeLinecap='round'
								strokeLinejoin='round'
								clipPath='url(#brandMarkClipData)'
								style={{ fill : 'currentColor', stroke : 'currentColor' }}
							/>{ /* What: Glyph Path Element. Why: This is the actual squiggly "Ease My Life" brand glyph drawn inside the badge. How: This path is clipped to the rounded-square badge so its curves never spill outside it. */ }


						</svg>


					</button>

					<div className='section-h'>{ /* What: Section Header Div Element. Why: The page's own title needs its own wrapper. How: This wraps the h1 below. */ }

						<h1 className='section-title'>The knobs and levers, that <span className='stat-title-accent'>ease</span> your life.</h1>{ /* What: Section Title Element. Why: Every tab needs its own page title. How: This renders the literal title text, with "ease" set off in its own accent span. */ }

					</div>


				</div>

				<p className='section-sub'>All your created items can be edited here, including conditionals, reminders, pickers and all of their items. You can use the <button type='button' className='sub-tablink' onClick={ () => onNavTabFun && onNavTabFun( 'stats' ) }>Stats page</button> to view how they are performing and then adjust their numbers here to get them exactly where you want them.</p>{ /* What: Lead Paragraph Element. Why: The header needs a short explanation of what this tab is for, plus a shortcut to Stats. How: This renders the lead text with an inline link that switches to the Stats tab when onNavTabFun is available. */ }

				<p className='section-sub'><strong>WARNING:</strong> Manually changing any of these values will affect the Stats page's accuracy. Minor or infrequent changes will have an almost negligible effect but major or frequent changes will definitely skew the Stats page's accuracy.</p>{ /* What: Warning Paragraph Element. Why: Manually editing these values has a real, disclosed side effect on Stats. How: This renders the literal warning text. */ }


			</header>

			<div className='stat-filters'>{ /* What: Filters Div Element. Why: The Group/Type/Conditionals/Show filter rows all belong in one wrapper. How: This conditionally renders each row below, per whether it has more than one real choice. */ }


				{ exiGroArr.length > 1 && ( // What: Group Row Check. Why: A single-group app has nothing to filter by group. How: This renders the Group row only while exiGroArr has 2 or more entries.


					<div className='stat-filter-row'>{ /* What: Group Filter Row Div Element. Why: The Group label and its own pill rail belong together. How: This wraps the lbl span and the pill rail below. */ }


						<span className='stat-filter-lbl'>Group</span>{ /* What: Group Lbl Span Element. Why: The row needs its own literal name. How: This renders the literal text "Group". */ }

						<div
							className='picker-groups stat-scope-groups'
							ref={ grpRowRef }
							role='tablist'
							aria-label='Filter pickers by group'
						>{ /* What: Group Pills Div Element. Why: This is the actual scrollable tablist of "All" plus every existing group. How: This renders the All pill, then maps exiGroArr to one pill each. */ }


							<button
								type='button'
								role='tab'
								className={ ` picker-group-pill   ${ filGrpStr === 'all' ? 'is-on' : '' } ` }
								disabled={ disGrpBoo }
								aria-selected={ filGrpStr === 'all' }
								onClick={ () => setFilGrpStr( 'all' ) }
							>
								All
								<span className='picker-group-count'>{ picArr.filter( ( picCurObj ) => !picCurObj.hidden ).length }</span>{ /* What: Group Count Span Element. Why: The All pill needs its own live total. How: This counts every non-hidden picker. */ }
							</button>{ /* What: All Pill Button Element. Why: This is the always-first choice, clearing the group filter entirely. How: This sets filGrpStr to 'all' on click, disabled during the matching tour step. */ }

							{ exiGroArr.map( ( groCurStr ) => ( // What: Group Pill Map. Why: One pill is needed per existing group. How: This maps exiGroArr to one tab-role button each, keyed by its own name.


								<button
									key={ groCurStr }
									type='button'
									role='tab'
									className={ ` picker-group-pill   ${ filGrpStr === groCurStr ? 'is-on' : '' } ` }
									disabled={ disGrpBoo }
									aria-selected={ filGrpStr === groCurStr }
									onClick={ () => setFilGrpStr( groCurStr ) }
								>
									{ groCurStr }
									<span className='picker-group-count'>{ picArr.filter( ( picCurObj ) => picCurObj.group === groCurStr && !picCurObj.hidden ).length }</span>{ /* What: Group Count Span Element. Why: Every group pill needs its own live count. How: This counts every non-hidden picker whose own group matches groCurStr. */ }
								</button> // What: Group Pill Button Element. Why: Clicking a pill narrows the list to just that group. How: This sets filGrpStr to groCurStr on click, disabled during the matching tour step.


							) ) }


						</div>


					</div>


				) }

				{ ( exiModArr.length > 1 || cndIteArr.length > 0 ) && ( // What: Type Row Check. Why: A single-mode app with no conditionals has nothing meaningful to filter by type. How: This renders the Type row only while there's more than one mode or at least one conditional.


					<div className='stat-filter-row'>{ /* What: Type Filter Row Div Element. Why: The Type label and its own pill rail belong together. How: This wraps the lbl span and the pill rail below. */ }


						<span className='stat-filter-lbl'>Type</span>{ /* What: Type Lbl Span Element. Why: The row needs its own literal name. How: This renders the literal text "Type". */ }

						<div
							className='picker-groups stat-scope-groups stat-scope-groups--type'
							ref={ typRowRef }
							role='tablist'
							aria-label='Filter pickers by type'
						>{ /* What: Type Pills Div Element. Why: This is the actual scrollable tablist of "All" plus every mode/Conditionals/Reminders pill, sorted together alphabetically. How: This renders the All pill, then maps the combined, sorted entry list to one pill each. */ }


							<button
								type='button'
								role='tab'
								className={ ` picker-group-pill   ${ filTypStr === 'all' ? 'is-on' : '' } ` }
								disabled={ disGrpBoo }
								aria-selected={ filTypStr === 'all' }
								onClick={ () => setFilTypStr( 'all' ) }
							>
								All
								<span className='picker-group-count'>{ picArr.filter( ( picCurObj ) => !picCurObj.hidden ).length }</span>{ /* What: Type Count Span Element. Why: The All pill needs its own live total. How: This counts every non-hidden picker. */ }
							</button>{ /* What: All Pill Button Element. Why: This is the always-first choice, clearing the type filter entirely. How: This sets filTypStr to 'all' on click, disabled during the matching tour step. */ }

							{ [ // What: Type Entry Build. Why: Conditionals/Reminders sort in alphabetically alongside the real modes instead of being pinned, matching the Show row's own vocabulary. How: This builds one entry per mode plus (when applicable) Conditionals and Reminders, then sorts and maps them below.

								...exiModArr.map( ( modCurStr ) => ( {
									key     : modCurStr,
									name    : MODES[ modCurStr ].label,
									count   : picArr.filter( ( picCurObj ) => picCurObj.mode === modCurStr && !picCurObj.hidden ).length,
									isOn    : filTypStr === modCurStr,
									onClick : () => setFilTypStr( modCurStr )
								} ) ),
								...( cndIteArr.length > 0 ? [ {
									key     : 'conditionals',
									name    : 'Conditionals',
									count   : cndIteArr.length,
									isOn    : filTypStr === 'conditionals',
									onClick : () => { setFilTypStr( 'conditionals' ); selScoFun( 'conditionals' ); }
								} ] : []),
								{
									key     : 'reminders',
									name    : 'Reminders',
									count   : ( staAppObj.tasks || [] ).filter( ( tasCurObj ) => !tasCurObj.hidden ).length,
									isOn    : filTypStr === 'reminders',
									onClick : () => { setFilTypStr( 'reminders' ); selScoFun( 'reminders' ); }
								}

							]
								.sort( ( aEntObj, bEntObj ) => aEntObj.name.localeCompare( bEntObj.name ) )
								.map( ( filEntObj ) => (

									<button
										key={ filEntObj.key }
										type='button'
										role='tab'
										className={ ` picker-group-pill   ${ filEntObj.isOn ? 'is-on' : '' } ` }
										disabled={ disGrpBoo }
										aria-selected={ filEntObj.isOn }
										onClick={ filEntObj.onClick }
									>
										{ filEntObj.name }
										<span className='picker-group-count'>{ filEntObj.count }</span>
									</button>

								) ) }


						</div>


					</div>


				) }

				{ cndIteArr.length > 0 && ( // What: Conditional Row Check. Why: A conditional-free app has nothing to filter by conditional. How: This renders the Conditionals row only while cndIteArr has at least one entry.


					<div className='stat-filter-row'>{ /* What: Conditional Filter Row Div Element. Why: The Conditionals label and its own pill rail belong together. How: This wraps the lbl span and the pill rail below. */ }


						<span className='stat-filter-lbl'>Conditionals</span>{ /* What: Conditional Lbl Span Element. Why: The row needs its own literal name. How: This renders the literal text "Conditionals". */ }

						<div
							className='picker-groups stat-scope-groups stat-scope-groups--cond'
							ref={ cndRowRef }
							role='tablist'
							aria-label='Filter pickers by conditional'
						>{ /* What: Conditional Pills Div Element. Why: This is the actual scrollable tablist of "All" plus every conditional. How: This renders the All pill, then maps the alphabetized conditional list to one pill each. */ }


							<button
								type='button'
								role='tab'
								className={ ` picker-group-pill   ${ filCndStr === 'all' ? 'is-on' : '' } ` }
								disabled={ disGrpBoo }
								aria-selected={ filCndStr === 'all' }
								onClick={ () => setFilCndStr( 'all' ) }
							>
								All
								<span className='picker-group-count'>{ picArr.length }</span>{ /* What: Conditional Count Span Element. Why: The All pill needs its own live total. How: This is picArr's own total length. */ }
							</button>{ /* What: All Pill Button Element. Why: This is the always-first choice, clearing the conditional filter entirely. How: This sets filCndStr to 'all' on click, disabled during the matching tour step. */ }

							{ [ ...cndIteArr ].sort( ( aCndObj, bCndObj ) => aCndObj.name.localeCompare( bCndObj.name ) ).map( ( cndCurObj ) => ( // What: Conditional Pill Map. Why: One pill is needed per existing conditional, alphabetical. How: This maps the sorted list to one tab-role button each, keyed by its own id.


								<button
									key={ cndCurObj.id }
									type='button'
									role='tab'
									className={ ` picker-group-pill   ${ filCndStr === cndCurObj.id ? 'is-on' : '' } ` }
									disabled={ disGrpBoo }
									aria-selected={ filCndStr === cndCurObj.id }
									onClick={ () => { setFilCndStr( cndCurObj.id ); setFilGrpStr( 'all' ); setFilTypStr( 'all' ); } }
								>
									{ cndCurObj.name }
									<span className='picker-group-count'>{ cndCouFun( cndCurObj.id ) }</span>{ /* What: Conditional Count Span Element. Why: Every conditional pill needs its own live usage count. How: This calls cndCouFun for cndCurObj.id. */ }
								</button> // What: Conditional Pill Button Element. Why: Clicking a pill narrows the list to pickers gated by just that conditional, resetting the other 2 filters. How: This commits filCndStr, resets filGrpStr/filTypStr, disabled during the matching tour step.


							) ) }


						</div>


					</div>


				) }

				<div className='stat-filter-row'>{ /* What: Show Filter Row Div Element. Why: The Show label and its own box rail belong together. How: This wraps the lbl span and the box rail below. */ }


					<span className='stat-filter-lbl'>Show</span>{ /* What: Show Lbl Span Element. Why: The row needs its own literal name. How: This renders the literal text "Show". */ }

					<div
						key={ filGrpStr + '|' + filTypStr }
						className='picker-tabs stat-scope-tabs'
						ref={ scoRowRef }
					>{ /* What: Show Boxes Div Element. Why: This is the actual box rail, re-keyed on filter change so its own entrance animation replays. How: This renders the All box (when present) then maps shwEntArr's own remaining entries to one box each. */ }


						{ shwAllBoo && ( // What: All Box Check. Why: "All" only renders when shwEntArr itself decided to include it. How: This renders the All box only while shwAllBoo is true.


							<button
								type='button'
								className={ ` picker-tab   picker-tab--enter   ${ curScoStr === 'all' ? 'is-on' : '' } ` }
								style={{ animationDelay : '0ms' }}
								disabled={ disShwBoo }
								onClick={ () => selScoFun( 'all' ) }
							>
								<span className='picker-tab-name'>All</span>{ /* What: Box Name Span Element. Why: Every box needs its own visible name. How: This renders the literal text "All". */ }
								<span className='picker-tab-mode'>Everything</span>{ /* What: Box Mode Span Element. Why: Every box also shows its own kind. How: This renders the literal text "Everything". */ }
							</button> // What: All Box Button Element. Why: Selecting this box shows every visible section at once. How: This calls selScoFun('all') on click, disabled during the matching tour step.


						) }

						{ [ // What: Show Entry Build. Why: Everything after "All" sorts together alphabetically by its own displayed name, rather than Conditionals/Reminders being pinned. How: This builds one entry per applicable Conditionals/Reminders/picker, then sorts and maps them below.

							...( ( filTypStr === 'all' || filTypStr === 'conditionals' ) && cndIteArr.length > 0
								? [ { key : 'conditionals', name : 'Conditionals', modLblStr : 'Gates', isOn : curScoStr === 'conditionals', onClick : () => selScoFun( 'conditionals' ) } ]
								: []),
							...( filTypStr === 'all' || filTypStr === 'reminders'
								? [ { key : 'reminders', name : 'Reminders', modLblStr : 'Tasks', isOn : curScoStr === 'reminders', onClick : () => selScoFun( 'reminders' ) } ]
								: []),
							...visPicArr.map( ( picCurObj ) => ( { key : picCurObj.id, name : picCurObj.name, modLblStr : MODES[ picCurObj.mode ].label, isOn : curScoStr === picCurObj.id, onClick : () => selScoFun( picCurObj.id ), pikIdeStr : picCurObj.id } ) )

						]
							.sort( ( aEntObj, bEntObj ) => aEntObj.name.localeCompare( bEntObj.name ) )
							.map( ( filEntObj, filIndNum ) => (

								<button
									key={ filEntObj.key }
									type='button'
									data-picker-id={ filEntObj.pikIdeStr }
									className={ ` picker-tab   picker-tab--enter   ${ filEntObj.isOn ? 'is-on' : '' } ` }
									style={{ animationDelay : ( filIndNum + 1 ) * 40 + 'ms' }}
									disabled={ disShwBoo }
									onClick={ filEntObj.onClick }
								>
									<span className='picker-tab-name'>{ filEntObj.name }</span>
									<span className='picker-tab-mode'>{ filEntObj.modLblStr }</span>
								</button>

							) ) }


					</div>


				</div>


			</div>

			<div className='data-sort-bar'>{ /* What: Sort Bar Div Element. Why: The section sort control needs its own row, separate from the filter rows above. How: This wraps SortSelect below. */ }

				<SortSelect
					id='data-section-sort'
					label='Sort'
					options={ SEC_SOR_ARR }
					value={ secSorStr }
					onChange={ ( keyValStr ) => actObj.setDataSort( 'sections', keyValStr ) }
				/>{ /* What: Sort Select. Why: This is the actual control for reordering Conditionals/Reminders/every picker card below. How: This commits the chosen key as this page's own persisted sections sort. */ }

			</div>

			<div
				key={ filGrpStr + '::' + curScoStr + '::' + filCndStr }
				className='data-list'
			>{ /* What: Data List Div Element. Why: This is the actual rendered list, re-keyed on filter/scope change so section entrance animations replay. How: This renders an empty-state message when nothing matches, otherwise every entry in rdrEntArr plus the Create Picker trigger. */ }


				{ !shwCndBoo && !shwRemBoo && shwPicArr.length === 0 && ( // What: Empty State Check. Why: Every filter combined leaving nothing at all needs its own explanatory message. How: This renders only while all 3 sections are absent.


					<div className='data-empty'>{ /* What: Empty Div Element. Why: The empty-state title and its own explanation belong together. How: This wraps both paragraphs below. */ }

						<p className='data-empty-title'>Nothing matches these filters</p>{ /* What: Empty Title Paragraph Element. Why: The empty state needs its own short headline. How: This renders the literal text. */ }
						<p className='data-empty-sub'>No items match the current Group, Conditionals, and Show selections. Try widening a filter to “All”.</p>{ /* What: Empty Sub Paragraph Element. Why: The empty state also needs a suggested next action. How: This renders the literal text. */ }

					</div>


				) }

				{ rdrEntArr.map( ( entCurObj, pkIndNum ) => { // What: Rendered Entry Map. Why: One card is needed per section entry, plus (last) the in-progress draft. How: This branches on entCurObj.kind, rendering CndManCom/ReminderManager directly or a full picker card otherwise.


					if ( entCurObj.kind === 'conditionals' ) return <CndManCom key='cnd-shown' state={ staAppObj } actions={ actObj } />; // What: Conditionals Branch Return. Why: The Conditionals section is its own separately-maintained manager, not a picker card. How: This renders CndManCom directly, keyed statically since only one can ever exist.

					if ( entCurObj.kind === 'reminders' ) return <ReminderManager key='rem-shown' state={ staAppObj } actions={ actObj } />; // What: Reminders Branch Return. Why: The Reminders section is its own separately-maintained manager, not a picker card. How: This renders ReminderManager directly, keyed statically since only one can ever exist.


					const picCurObj  = entCurObj.pk;                                                                    // What: Picker Current Object. Why: Every remaining branch below is a real picker card and needs its own record. How: This reads entCurObj.pk.
					const isaDrfBoo  = !!entCurObj.isDraft;                                                             // What: Is-A Draft Boolean. Why: The draft's own card renders slightly differently (always expanded, no collapse toggle, Items starts closed). How: This checks entCurObj.isDraft.
					const iteArr     = staAppObj.items.filter( ( iteCurObj ) => iteCurObj.pickerId === picCurObj.id );  // What: Item Array. Why: This card's own header count and Items section both need this picker's own items. How: This filters the whole app's items down to just this picker's own.
					const eleNum     = iteArr.filter( ( iteCurObj ) => !iteCurObj.vacation ).length;                    // What: Eligible Number. Why: The header's own count reads as "N of M", N being how many are actually eligible. How: This counts every item that isn't on vacation.
					const allVacBoo  = iteArr.length > 0 && iteArr.every( ( iteCurObj ) => iteCurObj.vacation );        // What: All Vacation Boolean. Why: A card whose every item is on vacation gets its own visual "inactive" treatment. How: This is true only when there's at least one item and every one of them is on vacation.
					const secOpnBoo  = isaDrfBoo || colMapObj[ picCurObj.id ] === false;                                // What: Section Open Boolean. Why: A draft is always expanded (no toggle at all, see the header button's disabled prop below); an existing picker reads its own persisted state. How: This is true for a draft, or when the persisted entry is explicitly false.
					const isaEasBoo  = picCurObj.mode === 'ease-up' || picCurObj.mode === 'ease-down';                   // What: Is-A Ease Boolean. Why: The item sort options and the meta text per item both depend on this. How: This is true whenever picCurObj.mode is 'ease-up' or 'ease-down'.
					const useWgtBoo  = picCurObj.mode === 'weighted' || picCurObj.mode === 'dynamic';                    // What: Uses Weight Boolean. Why: Same reasoning as isaEasBoo, for the weighted/dynamic modes. How: This is true whenever picCurObj.mode is 'weighted' or 'dynamic'.
					const inDaiBoo   = staAppObj.daily.pickerIds.includes( picCurObj.id );                              // What: In Daily Boolean. Why: PicConCom needs to know this picker's own current daily-generator membership. How: This checks staAppObj.daily.pickerIds for picCurObj.id.
					const conColBoo  = !!colMapObj[ picCurObj.id + ':controls' ];                                        // What: Controls Collapsed Boolean. Why: The Controls disclosure's own persisted state is keyed separately from the card's own open/closed state. How: This reads colMapObj at the ':controls' suffix key.
					const iteColBoo  = isaDrfBoo ? !drfIteBoo : !!colMapObj[ picCurObj.id + ':items' ];                  // What: Items Collapsed Boolean. Why: A draft's own Items section tracks drfIteBoo instead of the normal persisted map. How: This reads drfIteBoo for a draft, otherwise the persisted entry at the ':items' suffix key.


					const iteSorStr = ( staAppObj.ui && staAppObj.ui.dataSort && staAppObj.ui.dataSort[ picCurObj.id ] ) || 'name-asc'; // What: Item Sort String. Why: Every picker's own item list needs its own persisted sort choice. How: This reads staAppObj.ui.dataSort at this picker's own id, falling back to 'name-asc'.
					const flbEasObj = isaEasBoo ? PICKERS.avgEase( iteArr, picCurObj.id ) : null;                                       // What: Fallback Ease Object. Why: An item with no ease band of its own falls back to the same average the picking engine itself uses. How: This is computed once per card, shared by both the sort entries and every item row below.

					const iteEntFun = ( iteCurObj ) => { // What: Item Entry Function. Why: Every item needs the same comparable shape before compareSortEntries can sort them. How: This builds a { name, type, group, count, range, boost, isActive } entry per item, mode-dependent per pickerItemSortOptions.


						const easMaxNum = iteCurObj.easeMax ?? flbEasObj?.easeMax ?? 20; // What: Ease Max Number. Why: The Range field below needs this item's own (or the fallback) ease-max value. How: This reads iteCurObj.easeMax, falling back to flbEasObj's own easeMax, then a hardcoded 20.


						return {

							name     : iteCurObj.name,
							type     : null,
							group    : null,
							count    : isaEasBoo ? ( iteCurObj.value ?? 0 ) : ( useWgtBoo ? ( iteCurObj.weight ?? 1 ) : null ),
							range    : isaEasBoo ? Math.max( 1, Math.round( 100 / ( easMaxNum || 1 ) ) ) : null,
							boost    : picCurObj.mode === 'dynamic' ? ( iteCurObj.value ?? 0 ) : null,
							isActive : !iteCurObj.vacation

						};


					};

					const sorIteArr = [ ...iteArr ].sort( ( aIteObj, bIteObj ) => compareSortEntries( iteEntFun( aIteObj ), iteEntFun( bIteObj ), iteSorStr ) ); // What: Sorted Item Array. Why: The rendered item list needs to actually be in iteSorStr's own order. How: This sorts a copy of iteArr via compareSortEntries.
					const dspIteArr = freezeEditedRow( sorIteArr, opnIteStr, newIteRef.current, frzIndRef );                                                     // What: Display Item Array. Why: An item mid-edit must not visually jump position if its own sort key changes underneath it. How: This calls the shared freezeEditedRow helper.

					const strAddFun = () => { // What: Start Add Function. Why: This is the "+ Add to X" button's own action, factored out so a brand-new draft's "Add Items" footer button can trigger the exact same first-item flow. How: This creates a fresh item and opens its own editor.


						if ( newIteRef.current ) return; // What: Rapid Click Guard. Why: A rapid double-click must not create 2 items at once. How: This bails out while a brand-new item is already in progress.


						const nexIdeStr = 'it_' + Math.random().toString( 36 ).slice( 2, 8 ); // What: Next Identifier String. Why: The brand-new item needs its own id immediately. How: This generates a short random id with an 'it_' prefix.

						actObj.addItem( picCurObj.id, 'New item', nexIdeStr ); // What: Add Item Call. Why: This is the actual creation of the item. How: This adds an item named 'New item' under picCurObj.id, with the freshly-generated id.

						newIteRef.current = nexIdeStr; // What: New Item Mark. Why: Cancel must discard this exact item, not revert it to a snapshot. How: This flags nexIdeStr as the brand-new, not-yet-kept item.
						setInsIteStr( nexIdeStr );      // What: Insert Item Set Call. Why: The freshly-created row should play the slide-in entrance. How: This sets insIteStr to nexIdeStr.
						setOpnIteStr( nexIdeStr );      // What: Open Item Set Call. Why: The freshly-created item's own editor should open immediately. How: This sets opnIteStr to nexIdeStr.


					};

					const keeCloFun = ( iteIdeStr ) => { // What: Keep Close Function. Why: The row's own collapse chevron and IteEdiCom's own Save both mean "keep this, I'm done", so both need the exact same cleanup, kept in one place so neither can drift out of sync with the other. How: This calls the open editor's own keep(), clears the new-item flag, and closes only if this item is still the open one.


						opnEdiRef.current?.keep(); // What: Keep Call Guard. Why: The currently-open IteEdiCom instance needs to mark itself already-handled before this closes it, so its own implicit-close guard doesn't ALSO try to revert/discard it. How: This calls .keep() on whatever opnEdiRef currently points at, if anything.

						if ( newIteRef.current === iteIdeStr ) newIteRef.current = null; // What: New Item Clear Guard. Why: A kept item is no longer "brand new and undiscarded". How: This clears newIteRef only when it currently points at this exact item.

						setOpnIteStr( ( curStr ) => curStr === iteIdeStr ? null : curStr ); // What: Open Item Close Guard. Why: Only close if this item is STILL the open one (it might already have changed). How: This nulls opnIteStr only when it currently equals iteIdeStr.


					};


					return (


						<section
							key={ picCurObj.id }
							ref={ isaDrfBoo ? drfCrdRef : undefined }
							data-picker-id={ picCurObj.id }
							className={ ` cat cat--enter   ${ allVacBoo ? 'is-vac' : '' }   ${ remPicStr === picCurObj.id ? 'cat--removing' : '' }   ${ hetPicBoo ? 'ob-tour-pulse' : '' } ` }
							style={{

								animationDelay : ( isaDrfBoo ? 0 : pkIndNum * 45 ) + 'ms',

								...( isaDrfBoo ? { scrollMarginTop : 14 } : {} )

							}}
							onAnimationEnd={ ( aniEveObj ) => {

								if ( aniEveObj.target === aniEveObj.currentTarget && remPicStr === picCurObj.id ) { // What: Removal Finished Guard. Why: The card must actually be removed from the store only once its own removal animation (not a child's) has genuinely finished. How: This checks the event's own target/currentTarget match and that this card is still the one marked removing.

									actObj.removePicker( picCurObj.id ); // What: Remove Picker Call. Why: This is the actual, final destructive action, deferred until the animation finished. How: This removes picCurObj.id from the store.
									setRemPicStr( null ); // What: Removing Clear Call. Why: The removal-animation flag must clear once it's actually done its job. How: This resets remPicStr to null.

								}

							} }
						>{ /* What: Category Section Element. Why: This is one picker's own top-level card, matching every other Data tab category's own outer landmark. How: This plays the removal animation via remPicStr/onAnimationEnd, and renders the header + Collapse-wrapped body below. */ }


							<header
								className='cat-h'
								onClick={ ( clkEveObj ) => { if ( !isaDrfBoo && !detPicBoo && !clkEveObj.target.closest( 'button' ) ) togSecFun( picCurObj.id ); } }
							>{ /* What: Category Header Element. Why: Clicking anywhere on the header (outside a real button) should toggle the card. How: This calls togSecFun unless this is a draft, the tour is guarding the header, or the click actually landed on a button. */ }


								<button
									type='button'
									className='cat-h-l'
									disabled={ isaDrfBoo || detPicBoo }
									aria-expanded={ secOpnBoo }
									onClick={ () => togSecFun( picCurObj.id ) }
								>{ /* What: Header Left Button Element. Why: This is the actual clickable control for expanding/collapsing the card. How: This is disabled for a draft (always expanded) or during the guarded tour step. */ }


									<span className={ ` chev   ${ secOpnBoo ? 'is-open' : '' } ` }><Icon name='chev' size={ 14 } /></span>{ /* What: Chevron Span Element. Why: The card's own open/closed state needs a visible directional indicator. How: This rotates via the 'is-open' class and renders the shared chevron icon. */ }

									<span className='cat-h-main'>{ /* What: Header Main Span Element. Why: The picker's own name and live count belong together. How: This wraps the h2 and the count span below. */ }

										<h2 className='cat-name'>{ picCurObj.name }</h2>{ /* What: Category Name Element. Why: Every card needs its own visible name. How: This renders picCurObj's own name. */ }

										<span className='cat-count'>{ /* What: Category Count Span Element. Why: The eligible/total count needs 3 separate elements (see styles2.css) rather than one text run. How: This wraps the eligible count, the "of" separator, and the total count below. */ }
											<span className='cat-count-n'>{ eleNum }</span>
											<span className='cat-count-of'>of</span>
											<span className='cat-count-n'>{ iteArr.length }</span>
										</span>

									</span>


								</button>

								<span className='cat-h-right'>{ /* What: Header Right Span Element. Why: The type/group tags and the active toggle need one grouped slot so a narrow viewport can stack them together in place, freeing width for the name. How: This wraps the tags span and the vac-toggle button below. */ }


									<span className='cat-h-tags'>{ /* What: Header Tags Span Element. Why: The type and group pills need their own fixed-width columns so they line up across every card regardless of text length. How: This wraps 2 InfoTip-wrapped labels below. */ }

										<InfoTip className='cat-mode-label' label={ MODES[ picCurObj.mode ].label } truncationOnly>{ MODES[ picCurObj.mode ].label }</InfoTip>{ /* What: Info Tip. Why: A long mode label like "Dynamic Weighted" can still truncate at this width; also read by help-mode's own pickerRow entry to build its "{type} Picker" badge title. How: This reveals the full label on demand only when it's actually truncated. */ }
										<InfoTip className='cat-group' label={ picCurObj.group } truncationOnly>{ picCurObj.group }</InfoTip>{ /* What: Info Tip. Why: A long group name can also still truncate at this width. How: This reveals the full name on demand only when it's actually truncated. */ }

									</span>

									<button
										className='vac-toggle'
										aria-pressed={ !!allVacBoo }
										aria-label={ `${ allVacBoo ? 'Activate' : 'Deactivate' } all items in ${ picCurObj.name }` }
										title='Active toggle for all items in this picker'
										onClick={ ( clkEveObj ) => { clkEveObj.stopPropagation(); actObj.toggleVacation( picCurObj.id, 'picker' ); } }
									>
										<Icon name={ allVacBoo ? 'moon' : 'sparkle' } size={ 14 } />{ /* What: Icon. Why: The bulk active/inactive toggle needs a recognizable glyph reflecting its own current state. How: This renders 'moon' while allVacBoo, 'sparkle' otherwise. */ }
										<span key={ allVacBoo ? 'inactive' : 'active' } className='set-sub-fade'>{ allVacBoo ? 'Inactive' : 'Active' }</span>{ /* What: Toggle Label Span Element. Why: The toggle also needs its own live text, cross-faded via its own key change. How: This renders "Inactive" while allVacBoo, "Active" otherwise. */ }
									</button>{ /* What: Vacation Toggle Button Element. Why: This is the actual bulk active/inactive control for every item in this picker at once. How: This stops the click from also toggling the card's own collapse, then calls toggleVacation. */ }


								</span>


							</header>

							<Collapse open={ secOpnBoo } instant={ isaDrfBoo }>{ /* What: Collapse. Why: The card's own body (Controls + Items) only needs to exist while it's actually expanded, instant (no animation) for a brand-new draft. How: This opens per secOpnBoo. */ }

								<div className='cat-body'>{ /* What: Category Body Div Element. Why: The Controls and Items disclosures both belong in one grouped body. How: This wraps both nested disclosures below. */ }


									<button
										type='button'
										className={ ` rd-ctl   ${ hetConBoo ? 'ob-tour-pulse' : '' } ` }
										disabled={ detConBoo }
										aria-expanded={ !conColBoo }
										onClick={ () => actObj.toggleControlsCollapsed( picCurObj.id + ':controls' ) }
									>{ /* What: Controls Toggle Button Element. Why: This picker's own pick-algorithm/schedule config moved here from Settings, so it needs its own nested disclosure toggle. How: This toggles the persisted ':controls' entry, disabled during the guarded tour step. */ }


										<span className='rd-ctl-l'>{ /* What: Controls Left Span Element. Why: The chevron and the "Controls" kicker belong together. How: This wraps both spans below. */ }
											<span className={ ` chev   ${ conColBoo ? '' : 'is-open' } ` }><Icon name='chev' size={ 12 } />{ /* What: Icon. Why: The chevron span needs its own recognizable directional glyph. How: This renders the 'chev' icon at a fixed size. */ }</span>
											<span className='kicker'>Controls</span>
										</span>

										{ conColBoo && <span className='rd-ctl-sum'>{ Object.keys( MODES ).length } options</span> }{ /* What: Controls Summary Check. Why: A collapsed disclosure still needs a hint of what's inside. How: This renders only while conColBoo is true. */ }


									</button>

									<Collapse open={ !conColBoo } instant={ isaDrfBoo }>{ /* What: Collapse. Why: PicConCom itself is expensive/stateful enough that it only needs to exist while the Controls disclosure is actually open. How: This opens per !conColBoo. */ }

										<PicConCom
											picker={ picCurObj }
											items={ iteArr }
											inDaily={ inDaiBoo }
											allGroups={ exiGroArr }
											conditionals={ staAppObj.conditionals || [] }
											dailyIds={ staAppObj.daily.pickerIds }
											actions={ actObj }
											onCollapse={ () => actObj.toggleControlsCollapsed( picCurObj.id + ':controls' ) }
											onRequestDelete={ () => delPicFun( picCurObj.id ) }
											isNewDraft={ isaDrfBoo }
											itemsSectionOpen={ drfIteBoo }
											hasOpenNewItem={ opnIteStr != null && newIteRef.current === opnIteStr && iteArr.some( ( iteCurObj ) => iteCurObj.id === opnIteStr ) }
											onOpenItemsSection={ () => { setDrfIteBoo( true ); setPenAutBoo( true ); } }
											onSaveNew={ savNewFun }
											onCancelNew={ canNewFun }
										/>{ /* What: PicConCom. Why: This is this picker's own full Controls body. How: This is passed the live picker/items/schedule fields and every handler this card's own draft lifecycle needs. */ }

									</Collapse>

									<button
										type='button'
										className={ ` rd-ctl   ${ hetIteBoo ? 'ob-tour-pulse' : '' } ` }
										disabled={ detIteBoo }
										aria-expanded={ !iteColBoo }
										onClick={ () => isaDrfBoo ? setDrfIteBoo( ( preBoo ) => !preBoo ) : actObj.toggleControlsCollapsed( picCurObj.id + ':items' ) }
									>{ /* What: Items Toggle Button Element. Why: The item list needs its own nested disclosure toggle, defaulting open except for a fresh draft. How: This toggles drfIteBoo for a draft, otherwise the persisted ':items' entry, disabled during the guarded tour step. */ }


										<span className='rd-ctl-l'>
											<span className={ ` chev   ${ iteColBoo ? '' : 'is-open' } ` }><Icon name='chev' size={ 12 } />{ /* What: Icon. Why: The chevron span needs its own recognizable directional glyph. How: This renders the 'chev' icon at a fixed size. */ }</span>
											<span className='kicker'>Items</span>
										</span>

										{ iteColBoo && <span className='rd-ctl-sum'>{ iteArr.length } items</span> }{ /* What: Items Summary Check. Why: A collapsed disclosure still needs a hint of what's inside. How: This renders only while iteColBoo is true. */ }


									</button>

									<Collapse open={ !iteColBoo }>{ /* What: Collapse. Why: The item rows themselves only need to exist while the Items disclosure is actually open. How: This opens per !iteColBoo. */ }

										<React.Fragment>{ /* What: Items Fragment Element. Why: The add button, the sort control, and every item row are true siblings with no shared wrapper of their own. How: This groups all 3 pieces without adding an extra DOM node. */ }


											{ tutProBoo ? ( // What: Tutorial Progress Check. Why: The add control must stay disabled (with an explanatory tip) while the Welcome Tour's own checklist is still in progress. How: This renders a disabled InfoTip-wrapped control in that state, otherwise the real button.


												<InfoTip
													className='rd-add is-tour-disabled'
													action={ `Add to ${ picCurObj.name.toLowerCase() }` }
													label='This button is disabled until all tutorials are completed.'
												>
													<Icon name='plus' size={ 13 } />{ /* What: Icon. Why: The disabled add control still needs a recognizable "add" glyph beside its own label. How: This renders the 'plus' icon at a fixed size. */ } Add to { picCurObj.name.toLowerCase() }
												</InfoTip> // What: Info Tip. Why: A disabled control still needs to explain why it can't be clicked yet. How: This wraps the same visible label/icon the real button uses.


											) : ( // What: Add Button Branch. Why: Outside the guided checklist, the real working Add-item control belongs here instead. How: This renders the else branch, taken while tutProBoo is false.


												<button className='rd-add' disabled={ detAddBoo } onClick={ strAddFun }>
													<Icon name='plus' size={ 13 } />{ /* What: Icon. Why: The add control needs a recognizable "add" glyph beside its own label. How: This renders the 'plus' icon at a fixed size. */ } Add to { picCurObj.name.toLowerCase() }
												</button> // What: Add Button Element. Why: This is the actual "create a brand-new item" affordance. How: This calls strAddFun on click, disabled during the guarded tour step.


											) }

											{ iteArr.length > 1 && ( // What: Multiple Items Check. Why: A sort control is only useful once there's more than one item to sort. How: This renders SortSelect only while iteArr has 2 or more entries.


												<SortSelect
													id={ `item-sort-${ picCurObj.id }` }
													label='Sort'
													options={ pisOptFun( picCurObj.mode ) }
													value={ iteSorStr }
													onChange={ ( keyValStr ) => actObj.setDataSort( picCurObj.id, keyValStr ) }
												/> // What: Sort Select. Why: This is the actual control for reordering this picker's own item list, mode-dependent per pisOptFun. How: This commits the chosen key as this picker's own persisted item sort.


											) }

											{ dspIteArr.map( ( iteCurObj ) => { // What: Item Row Map. Why: One collapsible row is needed per item, in dspIteArr's own (freeze-aware) order. How: This computes this item's own meta text, then renders its closed/open row and editor below.


												const iteOpnBoo  = opnIteStr === iteCurObj.id;                                                                  // What: Item Open Boolean. Why: This specific row needs to know whether IT is the currently-open one. How: This compares iteCurObj.id against opnIteStr.
												const easMinNum  = iteCurObj.easeMin ?? flbEasObj?.easeMin ?? 10;                                               // What: Ease Min Number. Why: The meta text below needs this item's own (or the fallback) ease-min value, same fallback the picking engine itself uses. How: This reads iteCurObj.easeMin, falling back to flbEasObj's own easeMin, then a hardcoded 10.
												const easMaxNum  = iteCurObj.easeMax ?? flbEasObj?.easeMax ?? 20;                                                // What: Ease Max Number. Why: Same reasoning as easMinNum, for the max end. How: This reads iteCurObj.easeMax, falling back to flbEasObj's own easeMax, then a hardcoded 20.
												const sonValNum  = Math.max( 1, Math.round( 100 / ( easMaxNum || 1 ) ) );                                        // What: Soonest Value Number. Why: The meta text's own day-band needs its own near end. How: This converts easMaxNum into a day count.
												const latValNum  = Math.max( 1, Math.round( 100 / ( easMinNum || 1 ) ) );                                        // What: Latest Value Number. Why: Same reasoning as sonValNum, for the far end. How: This converts easMinNum into a day count.
												const metStr     = iteCurObj.vacation // What: Meta String. Why: The closed row's own summary line depends entirely on whether the item is on vacation, then on the picker's own mode. How: This picks 'Inactive', an ease-band range, a weight, or "Equal chance".
													? 'Inactive'
													: ( isaEasBoo ? `${ sonValNum }–${ latValNum } ${ CADENCE.unitWord( picCurObj.cadence, latValNum ) }`
														: ( useWgtBoo ? `Weight w${ iteCurObj.weight }` : 'Equal chance' ) );


												return (


													<div
														key={ iteCurObj.id }
														ref={ iteOpnBoo ? opnRowRef : undefined }
														className={ ` rd-item   ${ iteCurObj.vacation ? 'is-vac' : '' }   ${ iteOpnBoo ? 'is-editing' : '' }   ${ insIteStr === iteCurObj.id ? 'rd-item--insert' : '' }   ${ hetRowBoo ? 'is-tour-target ob-tour-pulse' : '' } ` }
														onAnimationEnd={ () => { if ( insIteStr === iteCurObj.id ) setInsIteStr( null ); } }
													>{ /* What: Row Div Element. Why: Every item needs its own collapsible row wrapper, capturing the entrance/insert animation and the tour highlight. How: This clears insIteStr once this row's own insert animation finishes. */ }


														{ iteOpnBoo ? ( // What: Editing Check. Why: The open row swaps its own header for a live name input, since a real button can't legally contain that input. How: This renders the editing header while iteOpnBoo is true, otherwise the normal clickable row.


															<div className='rd-row'>{ /* What: Row Div Element. Why: The name input and its own chevron button need their own row. How: This wraps the rd-main span and the chevron button below. */ }


																<span className='rd-main'>{ /* What: Main Span Element. Why: The name input needs its own wrapper matching the closed row's own layout. How: This wraps the input below. */ }

																	<input
																		className='rd-name-input'
																		type='text'
																		value={ iteCurObj.name }
																		placeholder='Item name'
																		maxLength={ 60 }
																		aria-label='Item name'
																		ref={ ( inpCurEle ) => { if ( inpCurEle && focInpRef.current !== inpCurEle ) { inpCurEle.focus( { preventScroll : true } ); focInpRef.current = inpCurEle; } } }
																		onChange={ ( chgEveObj ) => actObj.updateItem( iteCurObj.id, { name : chgEveObj.target.value } ) }
																		onBlur={ ( blrEveObj ) => {

																			const namTriStr = blrEveObj.target.value.trim(); // What: Name Trimmed String. Why: A blur commit should tidy the name, not commit stray whitespace. How: This trims blrEveObj's own current value.

																			if ( namTriStr ) actObj.renameItem( iteCurObj.id, namTriStr ); // What: Rename Item Guard. Why: Blurring on an emptied field should not commit a blank name. How: This only calls renameItem when namTriStr is non-empty.

																		} }
																		onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Enter' ) keyEveObj.currentTarget.blur(); } }
																	/>{ /* What: Name Input Element. Why: An item's own name is edited live, right in the row header. How: This commits every keystroke immediately, and tidies the name on blur. */ }

																</span>

																<button
																	type='button'
																	className='rd-chev chev is-open'
																	aria-label='Collapse'
																	onClick={ () => keeCloFun( iteCurObj.id ) }
																>
																	<Icon name='chev' size={ 16 } />{ /* What: Icon. Why: The chevron button needs its own recognizable directional glyph. How: This renders the 'chev' icon at a fixed size. */ }
																</button>{ /* What: Chevron Button Element. Why: The chevron is its own real button (not a decoration) since the row itself can no longer be one while editing. How: This calls keeCloFun, the same "deliberate close" handler IteEdiCom's own Save uses. */ }


															</div>


														) : ( // What: Normal Row Branch. Why: A closed row just needs the plain clickable header instead. How: This renders the else branch, taken while iteOpnBoo is false.


															<button
																type='button'
																className='rd-row'
																aria-expanded={ iteOpnBoo }
																onClick={ () => setOpnIteStr( iteOpnBoo ? null : iteCurObj.id ) }
															>{ /* What: Row Button Element. Why: A closed row is a plain clickable control that opens (or closes) its own editor. How: This toggles opnIteStr between null and iteCurObj.id. */ }


																<span className='rd-main'>{ /* What: Main Span Element. Why: The name and its own meta line belong together. How: This wraps the name and sched spans below. */ }
																	<span className='rd-name'>{ iteCurObj.name }</span>
																	<span className='rd-sched'>{ metStr }</span>
																</span>

																<span className='rd-chev chev' aria-hidden='true'>
																	<Icon name='chev' size={ 16 } />{ /* What: Icon. Why: The chevron span needs its own recognizable directional glyph. How: This renders the 'chev' icon at a fixed size. */ }
																</span>


															</button>


														) }

														<Collapse open={ iteOpnBoo }>{ /* What: Collapse. Why: This row's own editor only needs to exist while it's actually open. How: This opens only while iteOpnBoo is true. */ }

															<div className='rd-edit'>{ /* What: Edit Div Element. Why: IteEdiCom needs its own wrapper matching every other editor body in this file. How: This wraps IteEdiCom below. */ }

																<IteEdiCom
																	ref={ iteOpnBoo ? opnEdiRef : undefined }
																	item={ iteCurObj }
																	picker={ picCurObj }
																	actions={ actObj }
																	items={ iteArr }
																	isNew={ newIteRef.current === iteCurObj.id }
																	itemCount={ iteArr.length }
																	onClose={ () => keeCloFun( iteCurObj.id ) }
																	onCancel={ ( snpIteObj ) => {

																		if ( newIteRef.current === iteCurObj.id ) { // What: Discard New Guard. Why: A brand-new, unsaved item's own Cancel must remove it entirely, not revert it to a snapshot; the row still gets to play the same collapse-close animation as Save first. How: This clears newIteRef, closes the row, then defers the actual removal.


																			newIteRef.current = null; // What: New Item Clear. Why: This item is no longer "brand new and undiscarded" once its own discard is underway. How: This clears newIteRef.

																			const remIdeStr = iteCurObj.id; // What: Remove Identifier String. Why: The deferred removal below needs a stable copy of this item's own id. How: This reads iteCurObj.id once, before the closure captures anything else.

																			setOpnIteStr( ( curStr ) => curStr === iteCurObj.id ? null : curStr ); // What: Open Item Close Guard. Why: Only close if this item is STILL the open one. How: This nulls opnIteStr only when it currently equals iteCurObj.id.

																			setTimeout( () => actObj.removeItem( remIdeStr ), 280 ); // What: Deferred Remove Call. Why: The actual store removal must wait until the row's own collapse animation finishes. How: This calls removeItem 280ms later.


																		}

																		else {


																			actObj.replaceItem( iteCurObj.id, snpIteObj ); // What: Replace Item Call. Why: An existing item's own Cancel must revert every field back to its pre-edit snapshot. How: This overwrites the live item with snpIteObj.

																			setOpnIteStr( ( curStr ) => curStr === iteCurObj.id ? null : curStr ); // What: Open Item Close Guard. Why: Only close if this item is STILL the open one. How: This nulls opnIteStr only when it currently equals iteCurObj.id.


																		}

																	} }
																	onDelete={ () => {

																		if ( newIteRef.current === iteCurObj.id ) newIteRef.current = null; // What: New Item Clear Guard. Why: A deleted brand-new item is no longer "undiscarded" either. How: This clears newIteRef only when it currently points at this exact item.

																		const remIdeStr = iteCurObj.id; // What: Remove Identifier String. Why: The (possibly deferred) removal below needs a stable copy of this item's own id. How: This reads iteCurObj.id once.

																		setOpnIteStr( ( curStr ) => curStr === iteCurObj.id ? null : curStr ); // What: Open Item Close Guard. Why: Only close if this item is STILL the open one. How: This nulls opnIteStr only when it currently equals iteCurObj.id.

																		if ( reduceMotion() ) { actObj.removeItem( remIdeStr ); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion should see this happen instantly. How: This removes the item directly and returns early.

																		setTimeout( () => actObj.removeItem( remIdeStr ), 280 ); // What: Deferred Remove Call. Why: The actual store removal must wait until the row's own collapse animation finishes. How: This calls removeItem 280ms later.

																	} }
																/>{ /* What: IteEdiCom. Why: This is the shared picker-item editor, reused so Today and Data stay exact copies. How: This is passed the live item/picker/items plus every handler this row's own lifecycle needs. */ }

															</div>

														</Collapse>


													</div>


												);


											} ) }


										</React.Fragment>

									</Collapse>


								</div>

							</Collapse>


						</section>


					);


				} ) }

				{ !newDrfStr && filTypStr !== 'conditionals' && filTypStr !== 'reminders' && ( // What: Create Picker Check. Why: A new PICKER draft has nothing to belong to while Type is filtered to Conditionals/Reminders, and only one draft can be in progress at a time. How: This renders the trigger only while neither condition applies.


					<button type='button' className='cat-create-btn' disabled={ disCrtBoo } onClick={ strNewFun }>
						<Icon name='plus' size={ 14 } />{ /* What: Icon. Why: The create control needs a recognizable "add" glyph beside its own label. How: This renders the 'plus' icon at a fixed size. */ } Create Picker
					</button> // What: Create Button Element. Why: This is the only place a brand-new picker can be started from this tab. How: This calls strNewFun on click, disabled during the guarded tour step.


				) }


			</div>


		</div>


	);


}

// #endregion TabData



export { TabData }; // What: Named Exports. Why: app.jsx imports this by this exact name; every other binding in this file is internal-only. How: This re-exports the TabData function declared above, unrenamed since app.jsx already depends on it.



