


// #region Imports

import React from 'react'; // What: React. Why: This is the UI library every component in this file is built on. How: This is used directly (React.useState, React.useRef, React.useMemo, React.useEffect, React.useCallback, React.useLayoutEffect, React.Fragment) throughout, instead of importing individual named hooks.


import { ButBasCom    } from '../../ui/ui.jsx';                     // What: Button Base Component. Why: Every inline confirm/cancel/save action in this file's editors needs a consistently-styled button. How: This is rendered throughout PicConCom, ConEdiCom, and TabDatCom's own footers.
import { CAD_NAM_OBJ  } from '../../core/cadence.js';               // What: Cadence. Why: PicConCom needs the shared cadence math/summary helpers to render its own "how often" tip and select options. How: This is called throughout PicConCom for tipMesFun/sumCadFun/dimCouFun/uniWorFun/locTipFun.
import { CAD_OPT_ARR  } from '../../ui/cadence-control.jsx';        // What: Cadence Options Array. Why: PicConCom's own daily-cadence summary needs the same daily-cadence sub-explanation CadConCom itself uses. How: This is looked up by key 'daily' inside PicConCom's cadence-summary block.
import { clePicFun    } from '../../help/sample-data.js';           // What: Clear Pickers Function. Why: Help mode's disposable sample pickers must not survive past the help session or this tab unmounting. How: This is called whenever helpOnBoo turns off and on TabDatCom's own unmount cleanup.
import { cleTasFun    } from '../../help/sample-data.js';           // What: Clear Tasks Function. Why: Help mode's disposable sample reminders must not survive past the help session or this tab unmounting. How: This is called whenever helpOnBoo turns off and on TabDatCom's own unmount cleanup.
import { CodConCom    } from '../../ui/conditional-controls.jsx';   // What: Conditional Control Component. Why: ConEdiCom reuses the exact same "type + settings" editor the Pickers create-flow uses, so both stay in sync. How: This is rendered directly inside ConEdiCom below.
import { ColDisCom    } from '../../ui/ui.jsx';                     // What: Collapse Disclosure Component. Why: Nearly every disclosure in this file (picker cards, Controls, Items, conditional rows, item rows) shares the same collapse-height animation. How: This wraps each of those bodies, driven by the matching open boolean.
import { conDraFun    } from '../../ui/conditional-controls.jsx';   // What: Conditional Draft Function. Why: A brand-new conditional started from ConManCom needs the same sensible starting draft the Pickers create-flow uses. How: This is called once when the "Add a conditional" button is clicked.
import { DAT_HEL_ARR  } from '../../help/content.jsx';              // What: Data Help Array. Why: Help mode needs this tab's own catalog of labeled elements to badge. How: This is passed straight through to HelOveCom's own items prop.
import { EntEdiCom    } from '../../ui/entry-editor.jsx';           // What: Entry Editor Component. Why: A picker's own item editor must stay an exact copy of Today's, so this file reuses it rather than a second implementation. How: This is aliased to IteEdiCom and rendered once per open item row.
import { FilButCom    } from '../../ui/ui.jsx';                     // What: Fill Button Component. Why: An ease-up/ease-down picker's Item Controls need the same Fill/Refill-all control Today's own boost tools use. How: This is rendered inside PicConCom's Item Controls group.
import { freEdiFun    } from '../../ui/ui.jsx';                     // What: Freeze Edited Function. Why: An item mid-edit must not visually jump position if its own sort key changes underneath it. How: This is called once per picker's item list, given the sorted list and the currently-open item id.
import { HelButCom    } from '../../help/mode.jsx';                 // What: Help Button Component. Why: This tab needs the same help-mode toggle every other tab exposes. How: This is rendered in the header, toggling helpOnBoo.
import { HelOveCom    } from '../../help/mode.jsx';                 // What: Help Overlay Component. Why: This tab needs the same help-mode badge overlay every other tab exposes. How: This is rendered once, driven by helpOnBoo and DAT_HEL_ARR.
import { IcoSvgCom    } from '../../ui/ui.jsx';                     // What: Icon Svg Component. Why: Nearly every button and row in this file needs a recognizable glyph. How: This is rendered throughout every component below.
import { InfTipCom    } from '../../ui/ui.jsx';                     // What: Info Tip Component. Why: A disabled control or a truncated pill still needs to explain itself on demand. How: This wraps disabled add buttons and truncatable type/group labels throughout this file.
import { norConFun    } from '../../core/pickers.js';               // What: Normalize Conditional Function. Why: A newly-typed conditional name needs the same tidy-casing rule pickers themselves already use. How: This is called on ConManCom's own in-progress draft name.
import { norGroFun    } from '../../core/pickers.js';               // What: Normalize Group Function. Why: A newly-typed picker group needs the same tidy-casing rule picker names already use. How: This is called when committing PicConCom's own "+ New Group" inline input.
import { ONB_CHE_OBJ  } from '../../state/onboarding-checklist.js'; // What: Onboarding Checklist Object. Why: Several add/edit controls in this file must stay disabled while the Welcome Tour's own checklist is still in progress. How: This is checked via tutProFun throughout TabDatCom and ConManCom.
import { PIC_NAM_OBJ  } from '../../core/pickers.js';               // What: Pickers Namespace Object. Why: An ease-mode picker's item list needs the same fallback ease-band math the picking engine itself uses. How: This is called once per picker via PIC_NAM_OBJ.aveEasFun.
import { redMotFun    } from '../../ui/ui.jsx';                     // What: Reduce Motion Function. Why: A user who prefers reduced motion shouldn't see any of this file's own FLIP/scroll/collapse animations. How: This is checked before every animation throughout this file.
import { RemManCom    } from '../../ui/reminders.jsx';              // What: Reminder Manager Component. Why: The Reminders section of this tab is a full, separately-maintained editor. How: This is rendered once, in place of a picker card, whenever the Reminders scope is shown.
import { SED_NAM_OBJ  } from '../../state/seed.js';                 // What: Seed Namespace Object. Why: Every picker/conditional mode's own label and hint text comes from this shared catalog. How: This is read (MOD_DEF_OBJ) throughout PicConCom, ConManCom, and TabDatCom for mode labels and the mode radio group.
import { sedPicFun    } from '../../help/sample-data.js';           // What: Seed Pickers Function. Why: Help mode needs a real picker of every mode to show a representative "view and edit" section. How: This is called whenever helpOnBoo turns on.
import { sedTasFun    } from '../../help/sample-data.js';           // What: Seed Tasks Function. Why: Help mode needs real reminders of every recurrence kind to show a representative "view and edit" section. How: This is called whenever helpOnBoo turns on.
import { sorEntFun    } from '../../ui/ui.jsx';                     // What: Sort Entries Function. Why: Every sortable list in this file (sections, conditional items, picker items) shares the same sort-key vocabulary. How: This is called once per comparison inside each list's own Array.prototype.sort.
import { SorSelCom    } from '../../ui/ui.jsx';                     // What: Sort Select Component. Why: Every sortable list in this file needs the same sort control. How: This is rendered for sections, conditional items, and each picker's own item list.
import { useEmlTouFun } from '../../state/tour-bus.js';             // What: Use Ease My Life Tour. Why: Several controls in this file must disable themselves or highlight during specific onboarding tour steps. How: This is called once to read the shared tour event bus's touPhaStr/touIdeStr/touSteNum fields.
import { useEscCanFun } from '../../ui/ui.jsx';                     // What: Use Escape Cancel Function. Why: ConEdiCom's Escape key must cancel the current edit (or back out of a delete confirm) the same way every other editor in the app does. How: This is called once inside ConEdiCom.
import { WeeChiCom    } from '../../ui/ui.jsx';                     // What: Weekday Chip Component. Why: PicConCom's own Days control needs the same weekday multi-select every other schedule editor uses. How: This is rendered inside PicConCom's "When it runs" group.

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
 * (ConManCom/ConEdiCom) and Reminders (RemManCom, a separately
 * maintained module) render as sibling sections above the picker cards.
 * The global "days off" holiday list itself still lives in Settings.
 *
 * Sections:
 *  - Constants
 *  - Helpers
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

// #region CIS_OPT_ARR

/**
 * CIS_OPT_ARR = Conditional-Item-Sort Options Array
 *
 * @summary
 * Sort options for ConManCom's own conditional list, extrapolated from
 * SEC_SOR_ARR's own vocabulary but adapted to what a single conditional
 * actually has. Odds (not "Weight", despite the picker-item-sort analog
 * being called that) because a conditional's own `weight` field is
 * vestigial; its real weighted/dynamic trigger-likelihood knob is
 * `oddsPct`, which its own editor calls Odds (see conOddFun in
 * ConManCom and conditionals.js' own truOddFun). Boost (dynamic only)
 * and Range (the ease band's soonest/shortest end) are each meaningful
 * for only some modes; on every other row they are irrelevant rather
 * than genuinely missing, so sorEntFun always sorts them to
 * the bottom regardless of direction instead of flipping to the top on
 * a "High to Low" sort the way a truly missing value would.
 *
 * Every entry below shares this exact shape, passed as SorSelCom's own
 * options prop from ConManCom's own sort bar; none of the 12 entries
 * repeat these same fields' own boilerplate comments (see the
 * "Repeated-shape object literals" comment exception in CLAUDE.md).
 * Each entry's own trailing comment instead just names which specific
 * sort option it represents.
 *
 * - `keyStr` (String): Key String is the sort key ConManCom compares
 *   against its own persisted iteSorStr and writes back on selection;
 *   SorSelCom reads this against its own value prop and passes it to
 *   onChange, and sorEntFun reads its field/direction halves to order
 *   the list.
 *
 * - `labStr` (String): Label String is the option's own visible menu
 *   text, rendered by SorSelCom as the option's own text content.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const CIS_OPT_ARR = [ // What: Conditional-Item-Sort Options Array. Why: ConManCom's own conditional list needs one sort entry per key a conditional actually supports. How: This is passed as SorSelCom's own options prop in ConManCom's own sort bar.


	{ keyStr : 'name-asc',    labStr : 'Name (A–Z)'          }, // What: Name Ascending Option. Why: This is the conditional list's own default sort. How: This orders conditionals by name, A to Z.
	{ keyStr : 'name-desc',   labStr : 'Name (Z–A)'          }, // What: Name Descending Option. Why: This is the reverse of the default sort. How: This orders conditionals by name, Z to A.
	{ keyStr : 'type-asc',    labStr : 'Type (A–Z)'          }, // What: Type Ascending Option. Why: Type is each conditional's own mode label. How: This orders conditionals by that label, A to Z.
	{ keyStr : 'type-desc',   labStr : 'Type (Z–A)'          }, // What: Type Descending Option. Why: This is the reverse of the type sort. How: This orders conditionals by mode label, Z to A.
	{ keyStr : 'odds-asc',    labStr : 'Odds (Low to High)'  }, // What: Odds Ascending Option. Why: Weighted and dynamic conditionals expose their real trigger likelihood as Odds. How: This orders them from lowest odds to highest, other modes last.
	{ keyStr : 'odds-desc',   labStr : 'Odds (High to Low)'  }, // What: Odds Descending Option. Why: This is the reverse of the odds sort. How: This orders them from highest odds to lowest, other modes still last.
	{ keyStr : 'boost-asc',   labStr : 'Boost (Low to High)' }, // What: Boost Ascending Option. Why: Only a dynamic conditional has a meaningful boost value. How: This orders dynamic conditionals from lowest boost to highest, other modes last.
	{ keyStr : 'boost-desc',  labStr : 'Boost (High to Low)' }, // What: Boost Descending Option. Why: This is the reverse of the boost sort. How: This orders dynamic conditionals from highest boost to lowest, other modes still last.
	{ keyStr : 'range-asc',   labStr : 'Range (Low to High)' }, // What: Range Ascending Option. Why: Only an ease-up or ease-down conditional has a meaningful soonest/shortest band. How: This orders ease conditionals from shortest range to longest, other modes last.
	{ keyStr : 'range-desc',  labStr : 'Range (High to Low)' }, // What: Range Descending Option. Why: This is the reverse of the range sort. How: This orders ease conditionals from longest range to shortest, other modes still last.
	{ keyStr : 'active-asc',  labStr : 'Active to Inactive'  }, // What: Active Ascending Option. Why: Every conditional has its own active/inactive state. How: This lists active conditionals before inactive ones.
	{ keyStr : 'active-desc', labStr : 'Inactive to Active'  }  // What: Active Descending Option. Why: This is the reverse of the active sort. How: This lists inactive conditionals before active ones.


];

// #endregion CIS_OPT_ARR



// #region SEC_SOR_ARR

/**
 * SEC_SOR_ARR = Section Sort Array
 *
 * @summary
 * Every entry below shares this exact shape, passed as SorSelCom's own
 * options prop from TabDatCom's own data-sort-bar; none of the 10
 * entries repeat these same fields' own boilerplate comments (see the
 * "Repeated-shape object literals" comment exception in CLAUDE.md).
 * Each entry's own trailing comment instead just names which specific
 * sort option it represents.
 *
 * - `keyStr` (String): Key String is the sort key TabDatCom compares
 *   against its own persisted secSorStr and writes back on selection;
 *   SorSelCom reads this against its own value prop and passes it to
 *   onChange, and sorEntFun reads its field/direction halves to order
 *   the list.
 *
 * - `labStr` (String): Label String is the option's own visible menu
 *   text, rendered by SorSelCom as the option's own text content.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const SEC_SOR_ARR = [ // What: Section Sort Array. Why: The top-level Conditionals/Reminders/picker-card list needs one sort entry per supported key. How: This is passed as SorSelCom's own options prop in TabDatCom's own data-sort-bar.


	{ keyStr : 'name-asc',    labStr : 'Name (A–Z)'               }, // What: Name Ascending Option. Why: This is the section list's own default sort. How: This orders sections by name, A to Z.
	{ keyStr : 'name-desc',   labStr : 'Name (Z–A)'               }, // What: Name Descending Option. Why: This is the reverse of the default sort. How: This orders sections by name, Z to A.
	{ keyStr : 'type-asc',    labStr : 'Type (A–Z)'               }, // What: Type Ascending Option. Why: Type is each section's own mode or kind label. How: This orders sections by that label, A to Z.
	{ keyStr : 'type-desc',   labStr : 'Type (Z–A)'               }, // What: Type Descending Option. Why: This is the reverse of the type sort. How: This orders sections by type label, Z to A.
	{ keyStr : 'group-asc',   labStr : 'Group (A–Z)'              }, // What: Group Ascending Option. Why: Group only applies to a picker card, not to Conditionals or Reminders as a whole. How: This orders picker cards by group, A to Z, with the group-less sections last.
	{ keyStr : 'group-desc',  labStr : 'Group (Z–A)'              }, // What: Group Descending Option. Why: This is the reverse of the group sort. How: This orders picker cards by group, Z to A, with the group-less sections still last.
	{ keyStr : 'count-asc',   labStr : 'Item Count (Low to High)' }, // What: Count Ascending Option. Why: Every section (Conditionals, Reminders, or a picker) holds some number of entries. How: This orders sections from fewest entries to most.
	{ keyStr : 'count-desc',  labStr : 'Item Count (High to Low)' }, // What: Count Descending Option. Why: This is the reverse of the item-count sort. How: This orders sections from most entries to fewest.
	{ keyStr : 'active-asc',  labStr : 'Active to Inactive'       }, // What: Active Ascending Option. Why: Only a picker card has a meaningful active/inactive state. How: This lists active picker cards before inactive ones.
	{ keyStr : 'active-desc', labStr : 'Inactive to Active'       }  // What: Active Descending Option. Why: This is the reverse of the active sort. How: This lists inactive picker cards before active ones.


];

// #endregion SEC_SOR_ARR

// #endregion Constants



// #region Helpers

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
 * Every option it builds shares this exact shape; none of them repeat
 * these same fields' own boilerplate comments (see the "Repeated-shape
 * object literals" comment exception in CLAUDE.md). Each row's or push
 * call's own comment instead just names which specific options it adds.
 *
 * - `keyStr` (String): Key String is the sort key TabDatCom compares
 *   against the picker's own persisted iteSorStr and writes back on
 *   selection; SorSelCom reads this against its own value prop and
 *   passes it to onChange, and sorEntFun reads its field/direction
 *   halves to order the list.
 *
 * - `labStr` (String): Label String is the option's own visible menu
 *   text, rendered by SorSelCom as the option's own text content.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param picModStr - Picker Mode String: The picker's own current mode key.
 *
 * @returns An array of { keyStr, labStr } sort options for that mode.
 *
 * @example
 * ```ts
 * pisOptFun(picModStr) // => array of { keyStr, labStr } sort options
 * ```
 *
*/

function pisOptFun ( picModStr ) {


	const sorOptArr = [ // What: Sort Options Array. Why: Every mode shares at least the Name sort. How: This starts with the 2 Name entries every mode gets, then more are pushed below depending on picModStr.


		{ keyStr : 'name-asc',  labStr : 'Name (A–Z)' }, // What: Name Ascending Option. Why: This is every mode's own default sort. How: This orders items by name, A to Z.
		{ keyStr : 'name-desc', labStr : 'Name (Z–A)' }  // What: Name Descending Option. Why: This is the reverse of the default sort. How: This orders items by name, Z to A.


	];


	if ( picModStr === 'ease-up' || picModStr === 'ease-down' ) { // What: Ease Modes Branch. Why: Ease modes sort by charge and by their own soonest/shortest band. How: This pushes the Charge and Range options.


		const ranLabStr = picModStr === 'ease-down' ? 'Shortest' : 'Soonest'; // What: Range Label String. Why: The Range sort's own label reads differently for ease-up vs ease-down, matching the item editor's own Soonest/Shortest wording. How: This picks 'Shortest' for ease-down, 'Soonest' otherwise.


		sorOptArr.push( { keyStr : 'count-asc', labStr : 'Charge (Low to High)' }, { keyStr : 'count-desc', labStr : 'Charge (High to Low)' } );                 // What: Charge Options Push. Why: Ease modes reuse the generic count field to mean charge. How: This appends both charge sort directions.
		sorOptArr.push( { keyStr : 'range-asc', labStr : `${ ranLabStr } (Low to High)` }, { keyStr : 'range-desc', labStr : `${ ranLabStr } (High to Low)` } ); // What: Range Options Push. Why: Ease modes also expose their own soonest/latest band as a sortable Range value. How: This appends both range sort directions, labeled per ranLabStr.


	}

	else if ( picModStr === 'weighted' || picModStr === 'dynamic' ) { // What: Weighted Modes Branch. Why: Weighted and dynamic modes sort by weight, and dynamic also by boost. How: This pushes the Weight options, plus Boost for dynamic.


		sorOptArr.push( { keyStr : 'count-asc', labStr : 'Weight (Low to High)' }, { keyStr : 'count-desc', labStr : 'Weight (High to Low)' } ); // What: Weight Options Push. Why: Weighted/dynamic modes reuse the generic count field to mean weight. How: This appends both weight sort directions.


		if ( picModStr === 'dynamic' ) sorOptArr.push( { keyStr : 'boost-asc', labStr : 'Boost (Low to High)' }, { keyStr : 'boost-desc', labStr : 'Boost (High to Low)' } ); // What: Boost Options Guard. Why: Only dynamic (not plain weighted) has a meaningful boost value. How: This appends both boost sort directions only when picModStr is 'dynamic'.


	}



	sorOptArr.push( { keyStr : 'active-asc', labStr : 'Active to Inactive' }, { keyStr : 'active-desc', labStr : 'Inactive to Active' } ); // What: Active Options Push. Why: Every mode has a meaningful active/inactive state. How: This appends both active sort directions, common to every mode.



	return sorOptArr; // What: Options Array Return. Why: The caller needs the full, mode-specific option list. How: This returns the same array built and pushed to above.


}

// #endregion pisOptFun

// #endregion Helpers



// #region Components

// #region ConEdiCom

/**
 * ConEdiCom = Conditional Editor Component
 *
 * @summary
 * The editor body for one conditional, rendered inside ConManCom's own
 * collapsible row. The draft itself is owned by ConManCom (so the row
 * can host the inline name input the same way a picker item's own row
 * does); this component just renders CodConCom against it and
 * supplies Save/Cancel/Delete. Save normalizes the name (Title Case
 * tidy) and is blocked on a collision, mirroring the Pickers
 * create-flow's own guard. Cancel discards a brand-new conditional or
 * simply closes an existing one.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actStoObj    - Action Store Object: {@link useAppStaFun}
 * @param props.conDraObj    - Conditional Draft Object: The in-progress, not-
 *                             yet-committed field values for this conditional.
 * @param props.curConObj    - Current Conditional Object: The conditional
 *                             record this row belongs to.
 * @param props.isaNewBoo    - Is-A New Boolean: Whether this conditional is a
 *                             brand-new, not-yet-saved draft.
 * @param props.namErrStr    - Name Error String: The current validation
 *                             message for the draft's own name, or null when
 *                             it's valid.
 * @param props.onCloEdiFun  - On Close Editor Function: Closes this row
 *                             without discarding an existing conditional's
 *                             edits.
 * @param props.onDelConFun  - On Delete Conditional Function: Deletes this
 *                             existing conditional.
 * @param props.onDisDraFun  - On Discard Draft Function: Discards a brand-new
 *                             conditional entirely.
 * @param props.onSavNewFun  - On Save New Function: Commits a brand-new
 *                             conditional, when set; undefined for an existing
 *                             one.
 * @param props.setConDraObj - Set Conditional Draft Object: Replaces the in-
 *                             progress draft object.
 * @param props.tidNamStr    - Tidied Name String: The draft's own name,
 *                             already normalized to the app's tidy-casing
 *                             rule.
 *
 * @returns This conditional's own editor body: any name error, the
 * shared CodConCom fields, and the footer.
 *
 * @example
 * ```tsx
 * ConEdiCom({ actStoObj, conDraObj, curConObj, ... }) // => <ConEdiCom />
 * ```
 *
*/

function ConEdiCom ( { actStoObj, conDraObj, curConObj, isaNewBoo, namErrStr, onCloEdiFun, onDelConFun, onDisDraFun, onSavNewFun, setConDraObj, tidNamStr } ) {


	const [ conDelBoo, setConDelBoo ] = React.useState( false ); // What: Confirm Delete Boolean And Setter. Why: Deleting an existing conditional needs an inline confirm step before it actually happens. How: This is flipped true by the Delete button and read below to swap in the confirm row.


	const savConFun = () => { // What: Save Conditional Function. Why: Save must normalize the name and route through whichever commit path applies (a brand-new conditional vs. an existing one). How: This blocks on a name error, delegates to onSavNewFun for a brand-new conditional, otherwise updates the existing one directly.


		if ( namErrStr ) return; // What: Name Error Guard. Why: An invalid or colliding name must never be committed. How: This bails out of Save entirely while namErrStr holds a message.



		if ( onSavNewFun ) { onSavNewFun(); return; } // What: New Save Guard. Why: A brand-new conditional's own commit (including its animated collapse+add) is owned by ConManCom, not this component. How: This delegates to onSavNewFun and returns early when it's set.



		actStoObj.updConFun( curConObj.id, { ...conDraObj, name : tidNamStr } ); // What: Update Conditional Call. Why: An existing conditional's edits only take effect once actually committed. How: This writes every draft field, with name replaced by its tidied form.

		onCloEdiFun(); // What: Close Call. Why: A successful save should also close this row. How: This calls onCloEdiFun after the update above.


	};


	const canConFun = () => { // What: Cancel Controls Function. Why: Cancelling a brand-new conditional must discard it entirely, while cancelling an existing one just closes without saving. How: This calls onDisDraFun when isaNewBoo, otherwise onCloEdiFun.


		if ( isaNewBoo ) onDisDraFun(); // What: Discard Branch. Why: A brand-new, not-yet-saved conditional has nothing worth keeping, so cancelling it should discard it entirely. How: This calls onDisDraFun.

		else onCloEdiFun(); // What: Close Branch. Why: An existing conditional's edits should simply be dropped, leaving the saved version untouched. How: This calls onCloEdiFun.


	};


	useEscCanFun( true, () => { // What: Use Escape Cancel Function. Why: Escape should back out of the delete confirm if it's showing, otherwise cancel the edit itself. How: This is always active while this row is mounted.


		if ( conDelBoo ) setConDelBoo( false ); // What: Close Confirm Branch. Why: While the delete confirm prompt is showing, Escape should just back out of it instead of cancelling the whole edit. How: This closes the confirm by setting conDelBoo false.

		else canConFun(); // What: Cancel Edit Branch. Why: With no confirm prompt up, Escape should cancel the edit like canConFun's own explicit Cancel button. How: This calls canConFun.


	} );



	return (


		<div className='rd-edit rd-edit--cnd'>{ /* What: Editor Div Element. Why: This is ConEdiCom's own root element. How: This wraps the rd-ctl-body div below. */ }


			<div className='rd-ctl-body'>{ /* What: Controls Body Div Element. Why: The name error, the shared Controls fields, and the footer all belong in one grouped body. How: This wraps the 3 pieces below. */ }


				{ namErrStr && <p className='np-error rd-cnd-name-err'>{ namErrStr }</p> }{ /* What: Name Error Check. Why: An invalid/colliding name needs an inline warning right above the fields. How: This renders the message only while namErrStr holds one. */ }



				<CodConCom
					conDraObj={ conDraObj }
					hidNamBoo
					layVarStr='inline'

					onChange={ setConDraObj }
				/>{ /* What: Conditional Control Component. Why: Every non-name field (type + settings) is edited through the exact same control the Pickers create-flow uses. How: This is passed the current draft, committing every change back via setConDraObj. */ }



				<div className='rd-ctl-group rd-ctl-group--foot'>{ /* What: Footer Group Div Element. Why: Delete/Cancel/Save (or the delete confirm) needs its own bottom group. How: This renders whichever of the 2 footer states below matches conDelBoo. */ }


					{ conDelBoo ? ( // What: Confirm Delete Check. Why: Delete morphs the footer into an inline confirm before actually deleting. How: This renders the confirm row while conDelBoo is true.


						<div
							key='confirm'

							className='rd-ctl-confirm'
						>{ /* What: Delete Confirm Div Element. Why: The confirm message and its own Cancel/Delete buttons need their own grouped row. How: This wraps the confirm message and the rem-del-actions row below. */ }


							<div className='confirm-msg'>Delete the &ldquo;{ curConObj.name }&rdquo; conditional? Pickers using it will be detached. This can&rsquo;t be undone.</div>{ /* What: Confirm Msg Div Element. Why: A destructive action needs an explicit, specific warning before it happens. How: This names the conditional and states that any picker using it will be detached. */ }

							<div className='rem-del-actions'>{ /* What: Delete Actions Div Element. Why: The confirm's own Cancel and Delete buttons need their own row. How: This wraps both ButBasCom instances below. */ }


								<ButBasCom
									kinValStr='ghost'
									sizValStr='sm'

									onClick={ () => setConDelBoo( false ) }
								>Cancel</ButBasCom>{ /* What: Button Base Component. Why: Backing out of the confirm should not delete anything. How: This just closes the confirm row. */ }



								<ButBasCom
									kinValStr='danger'
									sizValStr='sm'

									onClick={ () => onDelConFun() }
								>Delete</ButBasCom>{ /* What: Button Base Component. Why: This is the actual, final destructive action. How: This calls onDelConFun on click. */ }


							</div>


						</div>


					) : ( // What: Plain Foot Branch. Why: With no delete confirmation pending, the normal Delete/Cancel/Save footer belongs here instead. How: This renders the else branch, taken while conDelBoo is false.


						<div
							key='foot'

							className='rd-ctl-foot-row'
						>{ /* What: Foot Row Div Element. Why: Delete (left, existing conditionals only) and Cancel/Save (right) both belong in the same footer row. How: This conditionally renders the Delete ButBasCom, then the rem-foot-right div below. */ }


							{ !isaNewBoo && ( // What: Existing Conditional Check. Why: A brand-new conditional has nothing saved to delete. How: This renders the Delete button only while isaNewBoo is false.


								<ButBasCom
									icoNamStr='traEle'
									kinValStr='danger'
									sizValStr='sm'

									onClick={ () => setConDelBoo( true ) }
								>Delete</ButBasCom> // What: Button Base Component. Why: A brand-new, not-yet-saved conditional has nothing to delete yet. How: This opens the inline delete confirm, rendered only while isaNewBoo is false.


							) }



							<div className='rem-foot-right'>{ /* What: Foot Right Div Element. Why: Cancel and Save anchor to the footer's own right edge. How: This wraps both ButBasCom instances below. */ }


								<ButBasCom
									kinValStr='ghost'
									sizValStr='sm'

									onClick={ canConFun }
								>Cancel</ButBasCom>{ /* What: Button Base Component. Why: This discards a brand-new conditional or closes an existing one's edits. How: This calls canConFun on click. */ }



								<ButBasCom
									disabled={ !!namErrStr }
									kinValStr='ghost'
									sizValStr='sm'

									onClick={ savConFun }
								>Save</ButBasCom>{ /* What: Button Base Component. Why: This commits the draft's own fields. How: This calls savConFun on click, disabled while namErrStr holds a message. */ }


							</div>


						</div>


					) }


				</div>


			</div>


		</div>


	);


}

// #endregion ConEdiCom



// #region ConManCom

/**
 * ConManCom = Conditionals Manager Component
 *
 * @summary
 * Lists every conditional as a collapsible card whose body is ConEdiCom.
 * Edits are live (updConFun). A brand-new conditional is held
 * LOCALLY (not written to the store) until Save, so a reload or
 * tab-switch mid-create discards it, mirroring the "nothing committed
 * until Save" contract TabDatCom's own new-picker draft flow uses (that
 * one is backed by a real hidden picker instead, since PicConCom's own
 * fields already write straight to the store). Delete detaches the
 * conditional from any pickers that reference it (the store itself
 * handles that cleanup).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actStoObj - Action Store Object: {@link useAppStaFun}
 * @param props.staAppObj - State App Object: {@link useAppStaFun}
 *
 * @returns The Conditionals section: its own header, the "Add a
 * conditional" control, and every conditional's own collapsible row.
 *
 * @example
 * ```tsx
 * ConManCom({ actStoObj, staAppObj }) // => <ConManCom />
 * ```
 *
*/

function ConManCom ( { actStoObj, staAppObj } ) {


	// #region List Data

	const conIteArr = staAppObj.conditionals || []; // What: Conditional Item Array. Why: Every render needs the current list of conditionals to display. How: This reads staAppObj.conditionals, falling back to an empty array.
	const allPicArr = staAppObj.pickers || [];      // What: All Picker Array. Why: The "N pickers" usage count per conditional needs every picker to check against. How: This reads staAppObj.pickers, falling back to an empty array.

	// #endregion List Data



	// #region Editor State

	const [ opeIdeStr, setOpeIdeStr ] = React.useState( null ); // What: Open Identifier String And Setter. Why: Only one conditional's own row can be expanded for editing at a time. How: This holds whichever conditional's own id is currently open, or null.
	const [ conDraObj, setConDraObj ] = React.useState( null ); // What: Conditional Draft Object And Setter. Why: The open row's own in-progress, not-yet-committed field values need somewhere to live. How: This is populated by opeEdiFun and cleared by cloEdiFun.
	const [ penConObj, setPenConObj ] = React.useState( null ); // What: Pending Conditional Object And Setter. Why: A brand-new conditional is held locally, not written to the store, until Save. How: This holds the brand-new conditional's own object while it's still unsaved.
	const [ cloIdeStr, setCloIdeStr ] = React.useState( null ); // What: Closing Identifier String And Setter. Why: A deleted conditional's own row must finish its collapse-shut animation before actually being removed. How: This holds whichever conditional's own id is currently mid-delete-animation.

	// #endregion Editor State



	// #region Row Values And Sorting

	const useCouFun = ( conIdeStr ) => allPicArr.filter( ( picCurObj ) => picCurObj.conditionalId === conIdeStr && !picCurObj.hidden ).length; // What: Use Count Function. Why: Every conditional's own row needs to show how many (non-hidden) pickers currently use it. How: This counts every picker whose own conditionalId matches conIdeStr.


	const colMapObj = ( staAppObj.ui && staAppObj.ui.controlsCollapsed ) || {}; // What: Collapsed Map Object. Why: The section's own collapse state is persisted the same way every picker card's own Controls/Items disclosures are. How: This reads staAppObj.ui.controlsCollapsed, falling back to an empty object.
	const secOpeBoo = colMapObj[ '__conditionals' ] === false;                  // What: Section Open Boolean. Why: This section defaults COLLAPSED (absent means collapsed), unlike its own nested disclosures. How: This is true only when the persisted entry is explicitly false.


	const conRanFun = ( conCurObj ) => ( conCurObj.mode === 'ease-up' || conCurObj.mode === 'ease-down' ) // What: Conditional Range Function. Why: Ease-mode conditionals expose a sortable Range value, the same soonest/latest-band math their own editor uses, collapsed to its near end. How: This computes it only for ease-up/ease-down, null otherwise.
		? Math.max( 1, Math.round( ( conCurObj.threshold ?? 100 ) / ( conCurObj.easeMax ?? 14 ) ) ) // What: Ease Range Branch. Why: An ease-mode conditional's range is roughly how many days it takes to fully charge. How: This divides threshold by easeMax, never below 1.
		: null;                                                                                     // What: No Range Branch. Why: Every other mode has no range to sort by. How: This returns null.


	const conOddFun = ( conCurObj ) => ( conCurObj.mode === 'weighted' || conCurObj.mode === 'dynamic' ) ? ( conCurObj.oddsPct ?? 50 ) : null; // What: Conditional Odds Function. Why: Weighted/dynamic conditionals expose their real trigger-likelihood as Odds, not their own vestigial weight field. How: This reads conCurObj.oddsPct only for those 2 modes, null otherwise.
	const conBooFun = ( conCurObj ) => ( conCurObj.mode === 'dynamic' ) ? ( conCurObj.value ?? 0 ) : null;                                     // What: Conditional Boost Function. Why: Only a dynamic conditional has a meaningful boost value, the same value field ease modes reuse for charge. How: This reads conCurObj.value only for 'dynamic', null otherwise.

	const iteSorStr = staAppObj.ui?.dataSort?.conditionals || 'name-asc'; // What: Item Sort String. Why: This section's own list needs its own persisted sort choice. How: This reads staAppObj.ui.dataSort.conditionals, falling back to 'name-asc'.


	const sorConArr = [ ...conIteArr ].sort( ( conOneObj, conTwoObj ) => sorEntFun( // What: Sorted Conditional Array. Why: The rendered list needs to actually be in iteSorStr's own order. How: This builds a matching sort-entry shape for both sides and delegates the comparison to sorEntFun.

		{ // What: First Sort Entry Object. Why: sorEntFun compares 2 entries of one shared sortable shape. How: This maps the left-hand conditional onto that shape.


			boost    : conBooFun( conOneObj ),                                                      // What: Boost. Why: The Boost sort needs a dynamic conditional's boost value. How: This calls conBooFun.
			count    : null,                                                                        // What: Count. Why: Conditionals have no item count to sort by. How: This is always null.
			group    : null,                                                                        // What: Group. Why: Conditionals have no group to sort by. How: This is always null.
			isActive : conOneObj.active !== false,                                                  // What: Is Active. Why: The Active sort needs each conditional's on/off state. How: This treats anything but an explicit false as active.
			name     : conOneObj.name,                                                              // What: Name. Why: The Name sort needs each conditional's name. How: This reads the name directly.
			odds     : conOddFun( conOneObj ),                                                      // What: Odds. Why: The Odds sort needs a weighted/dynamic conditional's odds. How: This calls conOddFun.
			range    : conRanFun( conOneObj ),                                                      // What: Range. Why: The Range sort needs an ease-mode conditional's range. How: This calls conRanFun.
			type     : ( SED_NAM_OBJ.MOD_DEF_OBJ[ conOneObj.mode ] || {} ).labStr || conOneObj.mode // What: Type. Why: The Type sort needs each conditional's mode label. How: This reads the mode's label, falling back to its raw id.


		},

		{ // What: Second Sort Entry Object. Why: sorEntFun compares 2 entries of one shared sortable shape. How: This maps the right-hand conditional onto that shape.


			boost    : conBooFun( conTwoObj ),                                                      // What: Boost. Why: The Boost sort needs a dynamic conditional's boost value. How: This calls conBooFun.
			count    : null,                                                                        // What: Count. Why: Conditionals have no item count to sort by. How: This is always null.
			group    : null,                                                                        // What: Group. Why: Conditionals have no group to sort by. How: This is always null.
			isActive : conTwoObj.active !== false,                                                  // What: Is Active. Why: The Active sort needs each conditional's on/off state. How: This treats anything but an explicit false as active.
			name     : conTwoObj.name,                                                              // What: Name. Why: The Name sort needs each conditional's name. How: This reads the name directly.
			odds     : conOddFun( conTwoObj ),                                                      // What: Odds. Why: The Odds sort needs a weighted/dynamic conditional's odds. How: This calls conOddFun.
			range    : conRanFun( conTwoObj ),                                                      // What: Range. Why: The Range sort needs an ease-mode conditional's range. How: This calls conRanFun.
			type     : ( SED_NAM_OBJ.MOD_DEF_OBJ[ conTwoObj.mode ] || {} ).labStr || conTwoObj.mode // What: Type. Why: The Type sort needs each conditional's mode label. How: This reads the mode's label, falling back to its raw id.


		},

		iteSorStr // What: Item Sort String Argument. Why: sorEntFun needs to know which sort is active. How: This passes iteSorStr straight through.


	) );

	// #endregion Row Values And Sorting



	// #region Row Open And Close

	const opeEdiFun = ( conCurObj ) => { // What: Open Editor Function. Why: Opening an existing conditional's row needs a fresh draft copy and no pending flag. How: This seeds conDraObj from conCurObj and opens its own row.


		setPenConObj( null );             // What: Pending Clear Call. Why: Opening an existing conditional abandons any pending new one. How: This resets penConObj to null.
		setConDraObj( { ...conCurObj } ); // What: Draft Seed Call. Why: The editor works on a copy so edits stay uncommitted until kept. How: This sets conDraObj to a shallow copy of conCurObj.
		setOpeIdeStr( conCurObj.id );     // What: Open Set Call. Why: The chosen row must expand. How: This sets opeIdeStr to conCurObj.id.


	};


	const cloEdiFun = () => { // What: Close Editor Function. Why: Closing a row (without any special animation) just clears every piece of open-row state. How: This clears penConObj, conDraObj, and opeIdeStr together.


		setPenConObj( null ); // What: Pending Clear Call. Why: A closed row has no pending new conditional. How: This resets penConObj to null.
		setConDraObj( null ); // What: Draft Clear Call. Why: A closed row has no editor draft. How: This resets conDraObj to null.
		setOpeIdeStr( null ); // What: Open Clear Call. Why: No row stays open. How: This resets opeIdeStr to null.


	};


	// #region cloAniFun

	/**
	 * cloAniFun = Close Animated Function
	 *
	 * @summary
	 * Cancels a brand-new conditional so its row visibly collapses before the
	 * draft is dropped: it closes the row at once, then clears the draft and
	 * pending state 300ms later, once the collapse animation has finished. Under
	 * reduced motion it clears everything immediately.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * cloAniFun() // => void
	 * ```
	 *
	*/

	const cloAniFun = () => { // What: Close Animated Function. Why: Cancelling a brand-new conditional should collapse its row first (so it visibly animates shut) before actually dropping it, rather than unmounting it instantly. How: This closes the row immediately when motion is reduced, otherwise defers the state drop by 300ms.


		if ( redMotFun() ) { // What: Reduced Motion Guard. Why: A user who prefers reduced motion should see this happen instantly, not mid-animation. How: This clears every piece of state synchronously and returns early.


			setOpeIdeStr( null ); // What: Open Clear Call. Why: The row closes at once. How: This resets opeIdeStr to null.
			setConDraObj( null ); // What: Draft Clear Call. Why: The draft is dropped at once too. How: This resets conDraObj to null.
			setPenConObj( null ); // What: Pending Clear Call. Why: The pending new conditional is dropped at once too. How: This resets penConObj to null.



			return; // What: Early Return. Why: Nothing is left to animate. How: This skips the deferred drop below.


		}



		setOpeIdeStr( null ); // What: Row Collapse Call. Why: The editor itself must stay mounted (still holding conDraObj/penConObj) so its own ColDisCom can actually animate shut. How: This only closes the row's own open flag, not the draft/pending state yet.

		setTimeout( () => { // What: Deferred Drop Call. Why: The draft/pending state must survive until the collapse animation actually finishes. How: This clears both 300ms later, matching the collapse animation's own duration.


			setConDraObj( null ); // What: Draft Clear Call. Why: The draft only goes away once the collapse has finished. How: This resets conDraObj to null.
			setPenConObj( null ); // What: Pending Clear Call. Why: The pending new conditional goes away at the same moment. How: This resets penConObj to null.


		}, 300 ); // What: Collapse Animation Delay. Why: The draft must outlive the row's own collapse. How: This 300ms matches the collapse animation's duration.


	};

	// #endregion cloAniFun


	// #region delAniFun

	/**
	 * delAniFun = Delete Animated Function
	 *
	 * @summary
	 * Deletes an existing conditional after its row collapses: it marks the row
	 * as closing so the editor stays mounted through its own collapse, then
	 * removes the conditional from the store and clears every piece of open-row
	 * state 300ms later. Under reduced motion it removes it immediately.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param conIdeStr - Conditional Identifier String: The id of the conditional
	 *                    to delete.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * delAniFun( conIdeStr ) // => void
	 * ```
	 *
	*/

	const delAniFun = ( conIdeStr ) => { // What: Delete Animated Function. Why: Deleting an existing conditional should collapse its card shut before actually removing it from the store. How: This runs the removal immediately when motion is reduced, otherwise defers it by 300ms while the row plays its own collapse.


		const delFinFun = () => { // What: Delete Finish Function. Why: The actual removal and every piece of open/closing state need to clear together, whenever this finally runs. How: This is called either immediately or after the deferred timeout below.


			actStoObj.delConFun( conIdeStr ); // What: Remove Conditional Call. Why: This is the actual store removal. How: This calls delConFun with conIdeStr.

			setCloIdeStr( null ); // What: Closing Clear Call. Why: The closing animation is over. How: This resets cloIdeStr to null.
			setConDraObj( null ); // What: Draft Clear Call. Why: The removed conditional's draft is no longer needed. How: This resets conDraObj to null.
			setOpeIdeStr( null ); // What: Open Clear Call. Why: No row stays open after the removal. How: This resets opeIdeStr to null.


		};



		if ( redMotFun() ) { delFinFun(); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion should see this happen instantly. How: This calls delFinFun synchronously and returns early.



		setCloIdeStr( conIdeStr ); // What: Closing Id Set. Why: The editor must stay mounted (via closingId) through its own collapse animation instead of unmounting immediately. How: This flags conIdeStr as the row currently mid-delete-animation.

		setOpeIdeStr( null ); // What: Row Collapse Call. Why: Collapsing the row's own open state is what actually triggers its ColDisCom to animate shut. How: This clears opeIdeStr.

		setTimeout( delFinFun, 300 ); // What: Deferred Removal Call. Why: The actual store removal must wait until the collapse animation finishes. How: This calls delFinFun 300ms later, matching the collapse animation's own duration.


	};

	// #endregion delAniFun


	// #region savAniFun

	/**
	 * savAniFun = Save Animated Function
	 *
	 * @summary
	 * Commits a brand-new conditional after its row collapses, so the row stays
	 * in place with the same id and name rather than visibly jumping: it closes
	 * the row at once, then adds the conditional to the store under its tidied
	 * final name and clears the draft and pending state 300ms later. Under
	 * reduced motion it commits immediately.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param finNamStr - Final Name String: The tidied name the conditional is
	 *                    saved under.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * savAniFun( finNamStr ) // => void
	 * ```
	 *
	*/

	const savAniFun = ( finNamStr ) => { // What: Save Animated Function. Why: Committing a brand-new conditional to the store should happen after the row's own collapse, so the row stays in place (same id/name) rather than visibly jumping. How: This commits immediately when motion is reduced, otherwise defers the commit by 300ms.


		const finDraObj = { ...conDraObj, name : finNamStr }; // What: Final Draft Object. Why: The committed conditional needs its own name replaced by the freshly-tidied final one. How: This spreads conDraObj with name overridden by finNamStr.


		const wriConFun = () => { // What: Write Conditional Function. Why: The actual store write and clearing the local-only draft/pending state need to happen together. How: This is called either immediately or after the deferred timeout below.


			actStoObj.addConFun( finDraObj ); // What: Add Conditional Call. Why: This is the actual store write of the new conditional. How: This calls addConFun with finDraObj.

			setConDraObj( null ); // What: Draft Clear Call. Why: The saved draft is no longer needed. How: This resets conDraObj to null.
			setPenConObj( null ); // What: Pending Clear Call. Why: The conditional is real now, not pending. How: This resets penConObj to null.


		};



		if ( redMotFun() ) { // What: Reduced Motion Guard. Why: A user who prefers reduced motion should see this happen instantly. How: This closes the row and commits synchronously, then returns early.


			setOpeIdeStr( null ); // What: Open Clear Call. Why: The row closes at once. How: This resets opeIdeStr to null.

			wriConFun(); // What: Write Conditional Call. Why: The commit happens at once too. How: This calls wriConFun synchronously.



			return; // What: Early Return. Why: Nothing is left to animate. How: This skips the deferred commit below.


		}



		setOpeIdeStr( null ); // What: Row Collapse Call. Why: Collapsing the row's own open state is what actually triggers its ColDisCom to animate shut before the commit below lands. How: This clears opeIdeStr.

		setTimeout( wriConFun, 300 ); // What: Deferred Commit Call. Why: The actual store write must wait until the collapse animation finishes. How: This calls wriConFun 300ms later, matching the collapse animation's own duration.


	};

	// #endregion savAniFun


	const tidNamStr = ( conDraObj && norConFun( conDraObj.name ) ) || ''; // What: Tidy Name String. Why: Every save/collision-check below needs the draft's own name already normalized to the app's tidy-casing rule. How: This calls norConFun on conDraObj.name when a draft exists, empty string otherwise.


	const namErrStr = conDraObj && !tidNamStr // What: Name Error String. Why: The open row's own editor needs a specific validation message whenever its name is empty or collides with another conditional. How: This checks emptiness first, then a case-insensitive collision against every OTHER conditional, null when the name is valid.
		? 'Enter a name for this conditional.'                                            // What: Empty Name Message. Why: A blank name can't be saved. How: This asks for a name.
		: conDraObj && conIteArr.some( ( conCurObj ) => conCurObj.id !== opeIdeStr && ( conCurObj.name || '' ).toLowerCase() === tidNamStr.toLowerCase() ) // What: Duplicate Name Check. Why: A name matching another conditional (ignoring case) can't be saved either. How: This compares tidNamStr against every other conditional's name.
		? `A conditional named “${ tidNamStr }” already exists. Choose a different name.` // What: Duplicate Name Message. Why: The user needs to know why the name was rejected. How: This names the colliding value.
		: null;                                                                           // What: Valid Name Branch. Why: A unique, non-empty name has no error. How: This returns null.


	const keeCloFun = () => { // What: Keep Close Function. Why: The row's own collapse chevron is a deliberate close, not an accidental one; a plain cloEdiFun there would discard a brand-new conditional or revert an edited existing one back to its pre-edit values. How: This commits the current draft (new or existing) unless the name itself is invalid, in which case it falls back to a plain (discarding) close.


		if ( namErrStr ) { cloEdiFun(); return; } // What: Invalid Name Guard. Why: An empty or colliding name can't be committed at all. How: This falls back to a plain close when namErrStr holds a message.



		if ( penConObj ) { savAniFun( tidNamStr ); return; } // What: Pending Guard. Why: A brand-new conditional's own "keep" means actually saving it, the animated way. How: This delegates to savAniFun and returns early when penConObj is set.



		actStoObj.updConFun( opeIdeStr, { ...conDraObj, name : tidNamStr } ); // What: Update Conditional Call. Why: An existing conditional's own "keep" means committing its edited fields. How: This writes every draft field, with name replaced by its tidied form.

		cloEdiFun(); // What: Close Editor Call. Why: A successful keep should also close the row. How: This calls cloEdiFun after the update above.


	};

	// #endregion Row Open And Close



	// #region New Row Scroll

	const opeRowRef = React.useRef( null ); // What: Open Row Reference. Why: A brand-new conditional's own "+ Add a conditional" click needs a handle on the resulting row so it can be scrolled into view. How: This is attached to whichever row is currently open.


	React.useEffect( () => { // What: Scroll Into View Effect. Why: A freshly-created conditional's own form should scroll into view once its ColDisCom has actually finished opening. How: This waits 300ms (matching the ColDisCom open animation) before scrolling, or scrolls instantly under reduced motion.


		const notOpeBoo = !opeIdeStr;         // What: Not Open Boolean. Why: No row is open, so there is nothing to scroll to. How: This negates opeIdeStr.
		const notPenBoo = !penConObj;         // What: Not Pending Boolean. Why: Only a brand-new pending row needs this scroll. How: This negates penConObj.
		const notRowBoo = !opeRowRef.current; // What: Not Row Boolean. Why: The row's node must be mounted before it can scroll. How: This negates opeRowRef.current.

		const skiScrBoo = notOpeBoo || notPenBoo || notRowBoo; // What: Skip Scroll Boolean. Why: Any one missing piece means this effect has nothing to do. How: This ORs the 3 checks above.


		if ( skiScrBoo ) return; // What: Not Applicable Guard. Why: Only a brand-new (pending), currently-open row with a mounted ref needs this scroll. How: This bails out whenever any of the 3 conditions isn't met.



		const rowCurEle = opeRowRef.current; // What: Row Current Element. Why: The scroll call below needs a stable local reference to the live row node. How: This reads opeRowRef.current once and reuses it.



		if ( redMotFun() ) { rowCurEle.scrollIntoView( { behavior : 'auto', block : 'nearest' } ); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion should see this scroll happen instantly, not after a delay. How: This scrolls immediately and returns early.



		const scrTimNum = setTimeout( () => rowCurEle.scrollIntoView( { behavior : 'smooth', block : 'nearest' } ), 300 ); // What: Scroll Timeout Number. Why: The ColDisCom open animation (.26s) needs to finish growing the editor before the scroll starts, or it would scroll to the wrong final position. How: This schedules the smooth scroll 300ms out.



		return () => clearTimeout( scrTimNum ); // What: Effect Cleanup Return. Why: A stale scroll must not fire after this effect re-runs (e.g. a different row opens) or the component unmounts. How: This cancels scrTimNum.


	}, [ opeIdeStr ] ); // What: Effect Dependency Array. Why: This scroll only ever needs to reconsider itself when which row is open actually changes. How: opeIdeStr is the single value this effect's own guard is built around.

	// #endregion New Row Scroll



	const focInpRef = React.useRef( null ); // What: Focused Input Reference. Why: The name input focuses itself via a ref callback (below, inline) instead of the plain autoFocus attribute, so it can pass preventScroll and avoid fighting the deliberate smooth scroll above. How: This is guarded by node identity so a later re-render of the SAME input doesn't refocus it repeatedly.



	return (


		<section className='cat cat--enter cnd-manager'>{ /* What: Category Section Element. Why: This is ConManCom's own root element, matching every other Data tab category's own outer landmark. How: This renders the header, then the ColDisCom-wrapped body below. */ }


			<header className='cat-h'>{ /* What: Category Header Element. Why: Every section shares the same header shape (chevron + name + count). How: This wraps the collapse-toggle button below. */ }


				<button
					className='cat-h-l'

					type='button'

					aria-expanded={ secOpeBoo }

					onClick={ () => actStoObj.togColFun( '__conditionals', true ) }
				>{ /* What: Header Left Button Element. Why: This is the actual clickable control for expanding/collapsing the whole section. How: This toggles the section's own persisted collapse state, defaulting collapsed. */ }


					<span className={ ` chev   ${ secOpeBoo ? 'is-open' : '' } ` }>{ /* What: Chevron Span Element. Why: The section's own open/closed state needs a visible directional indicator. How: This rotates via the 'is-open' class and renders the shared chevron icon. */ }


						<IcoSvgCom
							icoNamStr='chvEle'
							sizValNum={ 14 }
						/>{ /* What: Icon Svg Component. Why: The chevron span needs its own recognizable directional glyph. How: This renders the 'chvEle' icon at a fixed size. */ }


					</span>

					<span className='cat-h-main'>{ /* What: Header Main Span Element. Why: The section's own name and live count belong together. How: This wraps the h2 and the count span below. */ }


						<h2 className='cat-name'>Conditionals</h2>{ /* What: Category Name Element. Why: Every section needs its own visible name. How: This renders the literal text "Conditionals". */ }

						<span className='cat-count'>{ /* What: Category Count Span Element. Why: The active/total count needs 3 separate elements (see styles2.css) rather than one text run. How: This wraps the active count, the "of" separator, and the total count below. */ }


							<span className='cat-count-n'>{ conIteArr.filter( ( conCurObj ) => conCurObj.active !== false ).length }</span>{ /* What: Count N Span Element. Why: The active conditional count needs its own element. How: This counts every conditional whose own active field isn't explicitly false. */ }

							<span className='cat-count-of'>of</span>{ /* What: Count Of Span Element. Why: The separator between the active and total counts needs its own element. How: This renders the literal text "of". */ }

							<span className='cat-count-n'>{ conIteArr.length }</span>{ /* What: Count N Span Element. Why: The total conditional count needs its own element. How: This renders conIteArr's own length. */ }


						</span>


					</span>


				</button>


			</header>



			<ColDisCom open={ secOpeBoo }>{ /* What: Collapse Disclosure Component. Why: The whole section's own body only needs to exist while it's actually expanded. How: This opens only while secOpeBoo is true. */ }


				<div className='cat-body'>{ /* What: Category Body Div Element. Why: The add control, the empty-state message, the sort control, and every conditional row all belong in one body. How: This wraps every piece below. */ }


					{ ONB_CHE_OBJ.tutProFun( staAppObj ) ? ( // What: Tutorials In Progress Check. Why: The add control must stay disabled (with an explanatory tip) while the Welcome Tour's own checklist is still in progress. How: This renders a disabled InfTipCom-wrapped control in that state, otherwise the real button.


						<InfTipCom
							className='rd-add is-tour-disabled'

							actNamStr='Add a conditional'
							labTexStr='This button is disabled until all tutorials are completed.'
						>{ /* What: Info Tip Component. Why: A disabled control still needs to explain why it can't be clicked yet. How: This wraps the same visible label/icon the real button uses. */ }


							<IcoSvgCom
								icoNamStr='pluEle'
								sizValNum={ 13 }
							/>{ /* What: Icon Svg Component. Why: The disabled add control still needs a recognizable "add" glyph beside its own label. How: This renders the 'pluEle' icon at a fixed size. */ } Add a conditional


						</InfTipCom>


					) : ( // What: Add Button Branch. Why: Outside the guided checklist, the real working Add control belongs here instead. How: This renders the else branch, taken while the checklist isn't in progress.


						<button
							className='rd-add'

							onClick={ () => { // What: On Click Handler. Why: Adding a conditional starts a local-only draft that nothing else sees until Save. How: This builds a draft with a fresh id, then holds it as pending, as the editor draft, and as the open row.


								if ( penConObj ) return; // What: One Draft Guard. Why: Only one brand-new conditional can be in progress at a time. How: This bails out of the click entirely while penConObj already holds one.



								const basDraObj = conDraFun( '', conIteArr.map( ( conCurObj ) => conCurObj.name ) ); // What: Base Draft Object. Why: A brand-new conditional needs a sensible starting draft, with a name that won't collide with any existing one. How: This calls the shared conDraFun helper.
								const nexIdeStr = 'cnd_' + Math.random().toString( 36 ).slice( 2, 8 );               // What: Next Identifier String. Why: The brand-new draft needs its own id immediately, even before it's ever written to the store. How: This generates a short random id with a 'cnd_' prefix.
								const nexDraObj = { ...basDraObj, id : nexIdeStr };                                  // What: Next Draft Object. Why: The draft object itself needs to carry its own freshly-generated id. How: This spreads basDraObj with id set to nexIdeStr.


								setPenConObj( nexDraObj ); // What: Pending Set Call. Why: This is held locally, not written to the store, until Save. How: This sets penConObj to nexDraObj.
								setConDraObj( nexDraObj ); // What: Draft Set Call. Why: The editor below needs the same object as its own in-progress draft. How: This sets conDraObj to the same nexDraObj.
								setOpeIdeStr( nexIdeStr ); // What: Open Set Call. Why: The brand-new row must open immediately so its own editor is visible. How: This sets opeIdeStr to nexIdeStr.


							} }
						>{ /* What: Add Button Element. Why: This is the only place a brand-new conditional can be started. How: This seeds a fresh local-only draft and opens its own row. */ }


							<IcoSvgCom
								icoNamStr='pluEle'
								sizValNum={ 13 }
							/>{ /* What: Icon Svg Component. Why: The add control needs a recognizable "add" glyph beside its own label. How: This renders the 'pluEle' icon at a fixed size. */ } Add a conditional


						</button>


					) }



					{ !conIteArr.length && !penConObj && ( // What: Empty State Check. Why: A genuinely empty list needs its own explanatory message instead of an empty body. How: This renders only while there are no conditionals at all and none is currently being created.


						<p className='rd-cnd-empty'>No conditionals yet. Add one here, then attach it to any picker.</p> // What: Empty List Paragraph Element. Why: A genuinely empty list needs its own explanatory message. How: This renders a fixed message.


					) }



					{ conIteArr.length > 1 && ( // What: Multiple Conditionals Check. Why: A sort control is only useful once there's more than one conditional to sort. How: This renders SorSelCom only while conIteArr has 2 or more entries.


						<SorSelCom
							labTexStr='Sort'
							optLisArr={ CIS_OPT_ARR }
							selIdeStr='cnd-item-sort'
							value={ iteSorStr }

							onChange={ ( keyValStr ) => actStoObj.setSorFun( 'conditionals', keyValStr ) }
						/> // What: Sort Select Component. Why: This is the actual control for reordering the conditional list. How: This commits the chosen key as this section's own persisted conditionals sort.


					) }



					{ ( penConObj ? [ penConObj, ...sorConArr ] : sorConArr ).map( ( conCurObj ) => { // What: Conditional Row Map. Why: A brand-new pending conditional renders first, ahead of every sorted existing one. How: This maps the combined list to one collapsible row each.


						const isaPenBoo = !!penConObj && conCurObj.id === penConObj.id; // What: Is-A Pending Boolean. Why: The pending row needs slightly different editor treatment (isaNewBoo) than an existing one. How: This is true only for the one row matching penConObj's own id.
						const isaOpeBoo = opeIdeStr === conCurObj.id;                   // What: Is-An Open Boolean. Why: Every row needs to know whether IT SPECIFICALLY is the currently-open one. How: This compares conCurObj.id against opeIdeStr.
						const useCouNum = useCouFun( conCurObj.id );                    // What: Use Count Number. Why: Every row's own closed-state summary shows how many pickers currently use it. How: This calls useCouFun for conCurObj.id.



						return (


							<div
								key={ conCurObj.id }
								ref={ isaOpeBoo ? opeRowRef : undefined }

								className={ ` rd-item   ${ isaOpeBoo ? 'is-editing' : '' } ` }
							>{ /* What: Row Div Element. Why: Every conditional needs its own collapsible row wrapper. How: This marks itself "is-editing" while isaOpeBoo is true, and captures opeRowRef only while it's the open row. */ }


								{ isaOpeBoo && conDraObj ? ( // What: Editing Check. Why: The open row swaps its own header for a live name input, since a real button can't legally contain that input (interactive-in-interactive) and would otherwise lose its own accessible name. How: This renders the editing header while isaOpeBoo is true and a draft exists, otherwise the normal clickable row.


									<div className='rd-row'>{ /* What: Row Div Element. Why: The name input and its own chevron button need their own row. How: This wraps the rd-main span and the chevron button below. */ }


										<span className='rd-main'>{ /* What: Main Span Element. Why: The name input needs its own wrapper matching the closed row's own layout. How: This wraps the input below. */ }


											<input
												ref={ ( inpCurEle ) => { // What: Focus Reference Callback. Why: The input should focus once when it mounts, without the page jumping. How: This focuses a newly attached input with preventScroll and remembers it in focInpRef so re-renders don't refocus it.


													if ( inpCurEle && focInpRef.current !== inpCurEle ) { // What: New Input Guard. Why: Only a freshly attached input should take focus. How: This skips null detaches and the input already focused before.


														inpCurEle.focus( { preventScroll : true } ); // What: Focus Call. Why: The user can type the name right away. How: This focuses inpCurEle without scrolling the page.

														focInpRef.current = inpCurEle; // What: Focused Input Record. Why: A later re-render must not steal focus back. How: This stores inpCurEle in focInpRef.


													}


												} }

												className={ ` rd-name-input   ${ namErrStr ? 'is-error' : '' } ` }

												maxLength={ 40 }
												placeholder='Conditional name'
												type='text'
												value={ conDraObj.name }

												aria-invalid={ !!namErrStr }
												aria-label='Conditional name'

												onBlur={ () => { if ( tidNamStr ) setConDraObj( { ...conDraObj, name : tidNamStr } ); } }
												onChange={ ( chaEveObj ) => setConDraObj( { ...conDraObj, name : chaEveObj.target.value } ) }
												onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Enter' ) keyEveObj.currentTarget.blur(); } }
											/>{ /* What: Name Input Element. Why: A conditional's own name is edited live, right in the row header. How: This commits every keystroke immediately, and tidies the name on blur. */ }


										</span>

										<button
											className='rd-chev'

											type='button'

											aria-label='Collapse'

											onClick={ keeCloFun }
										>{ /* What: Chevron Button Element. Why: The chevron is its own real button (not a decoration) since the row itself can no longer be one while editing. How: This calls keeCloFun, the same "deliberate close" handler used elsewhere. */ }


											<span className='chev is-open'>{ /* What: Chevron Span Element. Why: The disclosure's own open/closed state needs a visible directional indicator. How: This wraps the chevron icon, rotated via its own is-open class. */ }


												<IcoSvgCom
													icoNamStr='chvEle'
													sizValNum={ 14 }
												/>{ /* What: Icon Svg Component. Why: The chevron span needs its own recognizable directional glyph. How: This renders the 'chvEle' icon at a fixed size. */ }


											</span>


										</button>


									</div>


								) : ( // What: Normal Row Branch. Why: A closed row just needs the plain clickable header instead. How: This renders the else branch, taken while isaOpeBoo is false or conDraObj is missing.


									<button
										className='rd-row'

										type='button'

										aria-expanded={ isaOpeBoo }

										onClick={ () => { // What: On Click Handler. Why: A row click toggles its own editor open or closed. How: This calls cloEdiFun when the row is open, otherwise opeEdiFun.


											if ( isaOpeBoo ) cloEdiFun(); // What: Close Branch. Why: An already-open row's own click should collapse it back down. How: This calls cloEdiFun.

											else opeEdiFun( conCurObj ); // What: Open Branch. Why: A closed row's own click should expand its editor. How: This calls opeEdiFun with conCurObj.


										} }
									>{ /* What: Row Button Element. Why: A closed row is a plain clickable control that opens (or closes) its own editor. How: This toggles between opeEdiFun and cloEdiFun based on isaOpeBoo. */ }


										<span className='rd-main'>{ /* What: Main Span Element. Why: The name and its own summary line belong together. How: This wraps the name and sched spans below. */ }


											<span className='rd-name'>{ conCurObj.name }</span>{ /* What: Name Span Element. Why: Every row needs its own visible name. How: This renders conCurObj's own name. */ }

											<span className='rd-sched'>{ /* What: Sched Span Element. Why: The closed row's own summary needs mode, usage count, and active state in one line. How: This joins the mode label, the picker count, and an inactive suffix when applicable. */ }


												{ ( SED_NAM_OBJ.MOD_DEF_OBJ[ conCurObj.mode ] || {} ).labStr || conCurObj.mode }{ /* What: Mode Label Expression. Why: The summary leads with the conditional's mode. How: This renders the mode's label, falling back to its raw id. */ }

												{ ' · ' }{ useCouNum } { useCouNum === 1 ? 'picker' : 'pickers' }{ /* What: Usage Count Expression. Why: The summary says how many pickers use this conditional. How: This renders useCouNum with a singular or plural noun. */ }

												{ conCurObj.active === false ? ' · inactive' : '' }{ /* What: Inactive Flag Expression. Why: An inactive conditional says so in its summary. How: This appends ' · inactive' only when active is false. */ }


											</span>


										</span>

										<span className='rd-chev'>{ /* What: Chevron Holder Span Element. Why: The row's chevron needs its own fixed-width slot at the row's end. How: This wraps the rotating chevron span. */ }


											<span className={ ` chev   ${ isaOpeBoo ? 'is-open' : '' } ` }>{ /* What: Chevron Span Element. Why: The closed row's own open/closed state needs a visible directional indicator. How: This rotates via the 'is-open' class and renders the shared chevron icon. */ }


												<IcoSvgCom
													icoNamStr='chvEle'
													sizValNum={ 14 }
												/>{ /* What: Icon Svg Component. Why: The chevron span needs its own recognizable directional glyph. How: This renders the 'chvEle' icon at a fixed size. */ }


											</span>


										</span>


									</button>


								) }



								<ColDisCom open={ isaOpeBoo }>{ /* What: Collapse Disclosure Component. Why: This row's own editor only needs to exist while it's actually open (or animating shut). How: This opens only while isaOpeBoo is true. */ }


									{ conDraObj && ( isaOpeBoo || isaPenBoo || cloIdeStr === conCurObj.id ) && ( // What: Editor Mount Check. Why: The editor must also stay mounted while pending or mid-delete-animation, not only while strictly open. How: This renders ConEdiCom only while a draft exists and one of the 3 conditions holds.


										<ConEdiCom
											actStoObj={ actStoObj }
											conDraObj={ conDraObj }
											curConObj={ conCurObj }
											isaNewBoo={ isaPenBoo }
											namErrStr={ namErrStr }
											setConDraObj={ setConDraObj }
											tidNamStr={ tidNamStr }

											onCloEdiFun={ cloEdiFun }
											onDelConFun={ () => delAniFun( conCurObj.id ) }
											onDisDraFun={ isaPenBoo ? cloAniFun : ( () => { // What: On Discard Draft Handler. Why: A pending row discards with its collapse animation, while any other row just closes and removes the conditional. How: This passes cloAniFun for a pending row, otherwise an arrow that closes the editor and deletes by id.


												const rmvIdeStr = conCurObj.id; // What: Remove Identifier String. Why: The removal below needs a stable copy of this row's id. How: This reads conCurObj.id once.


												cloEdiFun(); // What: Close Editor Call. Why: The row closes before its conditional goes away. How: This calls cloEdiFun.

												actStoObj.delConFun( rmvIdeStr ); // What: Remove Conditional Call. Why: This is the actual store removal. How: This calls delConFun with rmvIdeStr.


											} ) }
											onSavNewFun={ isaPenBoo ? ( () => savAniFun( tidNamStr ) ) : undefined }
										/> // What: Conditional Editor Component. Why: This is the actual editor body for this one conditional. How: This is passed the live conditional, its draft, and every handler this row needs.


									) }


								</ColDisCom>


							</div>


						);


					} ) }


				</div>


			</ColDisCom>


		</section>


	);


}

// #endregion ConManCom



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
 * by TabDatCom's own "Create Picker" button) swaps the normal Delete/
 * Cancel/Save footer for a no-Delete Cancel/Add-Items-then-Save one
 * instead.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actStoObj   - Action Store Object: {@link useAppStaFun}
 * @param props.allGroArr   - All Group Array: Every existing group name, used
 *                            to populate the Group selector.
 * @param props.conIteArr   - Conditional Item Array: Every existing
 *                            conditional, used to populate the attach-a-
 *                            conditional rail; defaults to an empty array.
 * @param props.daiIdeArr   - Daily Identifier Array: Every picker id currently
 *                            in the daily generator.
 * @param props.hasNewBoo   - Has New Boolean: Whether a brand-new item's
 *                            editor is still open, unsaved.
 * @param props.incDaiBoo   - Included Daily Boolean: Whether this picker is
 *                            currently a member of the daily generator.
 * @param props.isaNewBoo   - Is-A New Boolean: Whether this is a brand-new,
 *                            not-yet-saved draft picker.
 * @param props.iteSecBoo   - Item Section Boolean: Whether the draft's own
 *                            Items section has been revealed yet.
 * @param props.onCanNewFun - On Cancel New Function: Discards a brand-new
 *                            draft picker.
 * @param props.onColConFun - On Collapse Controls Function: Collapses this
 *                            picker's own Controls disclosure.
 * @param props.onOpeSecFun - On Open Section Function: Reveals the draft's own
 *                            Items section.
 * @param props.onReqDelFun - On Request Delete Function: Deletes this picker,
 *                            in place of the default actStoObj.delPicFun call,
 *                            when the caller wants to animate the removal
 *                            itself.
 * @param props.onSavNewFun - On Save New Function: Commits a brand-new draft
 *                            picker.
 * @param props.picDatObj   - Picker Data Object: The picker record this
 *                            Controls body edits.
 * @param props.picIteArr   - Picker Item Array: This picker's own items.
 *
 * @returns This picker's own Controls body: Picker Details, How it
 * picks, When it runs, Item Controls, and the footer.
 *
 * @example
 * ```tsx
 * PicConCom({ actStoObj, allGroArr, conIteArr, ... }) // => <PicConCom />
 * ```
 *
*/

function PicConCom ( { actStoObj, allGroArr, conIteArr = [], daiIdeArr, hasNewBoo, incDaiBoo, isaNewBoo, iteSecBoo, onCanNewFun, onColConFun, onOpeSecFun, onReqDelFun, onSavNewFun, picDatObj, picIteArr } ) {


	// #region Fill Summary

	const isaEasBoo = picDatObj.mode === 'ease-up' || picDatObj.mode === 'ease-down';                                        // What: Is-A Ease Boolean. Why: Several sections below (Item Controls' own Fill/Refill, the item sort options) only apply to an ease-mode picker. How: This is true whenever picDatObj.mode is 'ease-up' or 'ease-down'.
	const isaDowBoo = picDatObj.mode === 'ease-down';                                                                        // What: Is-A Down Boolean. Why: Ease-up and ease-down share most UI but need opposite Fill/Refill wording. How: This is true only for 'ease-down'.
	const notFulNum = picIteArr.filter( ( iteCurObj ) => ( iteCurObj.value ?? 0 ) < ( picDatObj.threshold ?? 100 ) ).length; // What: Not Full Number. Why: The Fill/Refill row's own summary needs to know how many items still aren't at full charge. How: This counts every item whose own value falls short of the picker's own threshold.


	const filSubEle = notFulNum === 0 // What: Fill Sub Element. Why: The Item Controls' own Fill/Refill row needs a live one-line summary of how many items still need charging. How: This picks a fully-charged message when notFulNum is 0, otherwise pluralizes the remaining count.
		? <><strong>all items</strong> are fully charged</>                                                                                 // What: All Full Branch. Why: Nothing is left to charge. How: This says every item is fully charged.
		: <><strong>{ notFulNum } { notFulNum === 1 ? 'item' : 'items' }</strong> { notFulNum === 1 ? 'is' : 'are' } not at full charge</>; // What: Some Short Branch. Why: The user needs to know how many items still fall short. How: This names notFulNum, pluralizing item/is to match.

	// #endregion Fill Summary



	const [ conDelBoo, setConDelBoo ] = React.useState( false ); // What: Confirm Delete Boolean And Setter. Why: Deleting a real picker needs an inline confirm step before it actually happens. How: This is flipped true by the Delete button and read by the footer to swap in the confirm row.



	// #region Footer Button

	const neeNamBoo = !picDatObj.name.trim();                                        // What: Need Name Boolean. Why: A new draft's footer must know whether the picker still lacks a name. How: This is true whenever picDatObj.name is empty once trimmed.
	const neeGroBoo = !picDatObj.group;                                              // What: Need Group Boolean. Why: A new draft's footer must also know whether the picker still lacks a group. How: This is true whenever picDatObj.group is falsy.
	const shoSavBoo = isaNewBoo && iteSecBoo && picIteArr.length >= 2 && !hasNewBoo; // What: Show Save Boolean. Why: The footer button only becomes a real "Save" once the Items section is open, holds at least 2 items, and none is still an unsaved brand-new row. How: This combines all 4 conditions with &&.
	const fooLabStr = shoSavBoo ? 'Save' : 'Add Items';                              // What: Footer Label String. Why: The footer button's own visible text depends on whether it's ready to save yet. How: This picks 'Save' once shoSavBoo is true, 'Add Items' otherwise.
	const fooDisBoo = shoSavBoo ? false : ( neeNamBoo || neeGroBoo || iteSecBoo );   // What: Footer Disabled Boolean. Why: The footer button stays disabled until every prerequisite for its current label is satisfied. How: This is never disabled once shoSavBoo is true, otherwise disabled while name/group is missing or the Items section is already open.


	const fooTipStr = neeNamBoo && neeGroBoo // What: Footer Tip String. Why: The disabled button's own InfTipCom needs a specific reason for whichever prerequisite is still unmet. How: This chains through every prerequisite in the same priority order the footer itself checks them.
		? 'A picker name and group are both required.'                                                // What: Both Missing Branch. Why: Neither required field has been filled in yet. How: This names both at once.
		: neeNamBoo                                                                                   // What: Name Missing Check. Why: Only the name may still be missing. How: This tests neeNamBoo next.
		? 'A picker name is required.'                                                                // What: Name Missing Branch. Why: The group is set but the name isn't. How: This asks for the name.
		: neeGroBoo                                                                                   // What: Group Missing Check. Why: Only the group may still be missing. How: This tests neeGroBoo next.
		? 'A group name is required.'                                                                 // What: Group Missing Branch. Why: The name is set but the group isn't. How: This asks for the group.
		: ( iteSecBoo && picIteArr.length < 2 )                                                       // What: Too Few Items Check. Why: An open Items section may still hold fewer than 2 items. How: This tests the item count once the section is open.
		? `${ 2 - picIteArr.length } more ${ 2 - picIteArr.length === 1 ? 'item' : 'items' } needed.` // What: Too Few Items Branch. Why: The user needs to know how many more items are required. How: This names the remaining count, pluralizing item to match.
		: ( iteSecBoo && hasNewBoo )                                                                  // What: Unsaved Item Check. Why: A brand-new item row may still be open and unsaved. How: This tests hasNewBoo once the section is open.
		? 'Finish saving this item first.'                                                            // What: Unsaved Item Branch. Why: Saving the picker would drop that unsaved item. How: This asks the user to finish it first.
		: shoSavBoo                                                                                   // What: Ready To Save Check. Why: Every prerequisite may already be met. How: This tests shoSavBoo.
		? 'Everything looks good, click Save to create this picker.'                                  // What: Ready To Save Branch. Why: The picker can be created now. How: This points the user at Save.
		: 'Everything looks good, click Add Items to continue.';                                      // What: Ready For Items Branch. Why: The details are complete and the Items section comes next. How: This points the user at Add Items.


	const fooActFun = shoSavBoo ? onSavNewFun : onOpeSecFun; // What: Footer Action Function. Why: The footer button's own click handler depends on whether it currently reads "Save" or "Add Items". How: This picks onSavNewFun once shoSavBoo is true, onOpeSecFun otherwise.

	// #endregion Footer Button



	// #region Conditional Rail

	const [ conAttBoo, setConAttBoo ] = React.useState( !!picDatObj.conditionalId ); // What: Conditional Attached Boolean And Setter. Why: The "Attach a conditional" toggle needs its own on/off state, seeded from whether this picker already has one attached. How: This starts true when picDatObj.conditionalId is already set, and is flipped by the switch button below.

	const raiCleRef = React.useRef( null ); // What: Rail Cleanup Reference. Why: The rail's own scroll/resize wiring needs to be torn down and rebuilt on every reattach. How: This holds whichever cleanup function the last attachment registered.
	const raiNodRef = React.useRef( null ); // What: Rail Node Reference. Why: The FLIP reorder effect below needs a stable handle on the rail's own live DOM node. How: This is written by raiRefFun below and read by the FLIP effect.


	// #region raiRefFun

	/**
	 * raiRefFun = Rail Reference Function
	 *
	 * @summary
	 * The callback ref for the conditional pill rail. Every attach first tears
	 * down whatever the previous attachment wired up, then records the new node
	 * in raiNodRef for the FLIP effect and wires the rail's edge-fade classes to
	 * its own scroll, a ResizeObserver, and window resizes, storing the teardown
	 * in raiCleRef. A detach (null) only runs that teardown and clears the node.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param raiCurEle - Rail Current Element: The rail's DOM node on attach, or
	 *                    null on detach.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * raiRefFun( raiCurEle ) // => void
	 * ```
	 *
	*/

	const raiRefFun = React.useCallback( ( raiCurEle ) => { // What: Rail Reference Function. Why: The conditional pill rail needs its own scroll/resize wiring set up on attach and torn down on every reattach or detach. How: This is passed directly as the rail div's own ref prop.


		if ( raiCleRef.current ) { // What: Previous Cleanup Guard. Why: A prior attachment's own listeners must not leak past this new attach/detach. How: This calls and clears whatever cleanup function the last attachment registered, if any.


			raiCleRef.current(); // What: Previous Cleanup Call. Why: The last attachment's observer and listeners must be torn down first. How: This invokes the stored cleanup function.

			raiCleRef.current = null; // What: Cleanup Reference Clear. Why: The same cleanup must never run twice. How: This nulls raiCleRef once it has run.


		}



		raiNodRef.current = raiCurEle; // What: Rail Node Update. Why: The FLIP effect below needs the freshly-attached (or newly-null, on detach) node. How: This writes the callback's own argument into raiNodRef.



		if ( !raiCurEle ) return; // What: No Element Guard. Why: A detach (raiCurEle is null) has nothing left to wire up. How: This bails out before touching any DOM APIs.



		const updFadFun = () => { // What: Update Fade Function. Why: The rail's own edge-fade classes must reflect whether it can currently scroll, and how far. How: This toggles at-start/at-end based on the rail's own scrollWidth/clientWidth/scrollLeft.


			const canScrBoo = raiCurEle.scrollWidth - raiCurEle.clientWidth > 1; // What: Can Scroll Boolean. Why: A rail that doesn't overflow at all should never show either fade edge. How: This is true only when the rail's own content is wider than its own visible box by more than a rounding pixel.


			raiCurEle.classList.toggle( 'at-start', !canScrBoo || raiCurEle.scrollLeft <= 1 );                                               // What: At Start Toggle. Why: The left fade should hide once the rail can't scroll at all or is already at its own start. How: This applies the 'at-start' class per canScrBoo and the rail's own current scrollLeft.
			raiCurEle.classList.toggle( 'at-end', !canScrBoo || raiCurEle.scrollLeft + raiCurEle.clientWidth >= raiCurEle.scrollWidth - 1 ); // What: At End Toggle. Why: The right fade should hide once the rail can't scroll at all or is already at its own end. How: This applies the 'at-end' class per canScrBoo and the rail's own current scroll position.


		};


		updFadFun(); // What: Initial Fade Call. Why: The fade classes need to reflect the rail's own real layout immediately on attach. How: This invokes updFadFun once, synchronously.

		requestAnimationFrame( updFadFun ); // What: Next Frame Fade Call. Why: The rail's own real scrollWidth may not be final until after this same paint settles. How: This re-runs updFadFun one frame later to catch any late layout change.


		const resObsObj = new ResizeObserver( updFadFun ); // What: Resize Observer Object. Why: The rail's own fade state depends on its measured width, which can change independent of a window resize. How: This re-runs updFadFun whenever the rail's own box size changes.


		resObsObj.observe( raiCurEle ); // What: Resize Observer Start. Why: The observer above does nothing until it's told what to watch. How: This begins watching raiCurEle for size changes.


		raiCurEle.addEventListener( 'scroll', updFadFun, { passive : true } ); // What: Rail Scroll Listener. Why: Scrolling the rail itself is the most common way its own edges change. How: This re-runs updFadFun on every scroll event, passively so it never blocks the scroll itself.
		window.addEventListener( 'resize', updFadFun );                        // What: Window Resize Listener. Why: A viewport resize can also change how much of the rail is visible. How: This re-runs updFadFun on every window resize event.


		raiCleRef.current = () => { // What: Cleanup Assignment. Why: The next attach (or this callback ref's own unmount) must be able to tear down everything just wired up. How: This stores a function that disconnects the observer and removes both listeners.


			resObsObj.disconnect(); // What: Resize Observer Teardown. Why: This observer must not outlive the attachment that created it. How: This stops watching raiCurEle for size changes.


			raiCurEle.removeEventListener( 'scroll', updFadFun ); // What: Rail Scroll Listener Teardown. Why: This matches the addEventListener above so the listener does not outlive this attachment. How: This removes the exact same updFadFun reference that was added.
			window.removeEventListener( 'resize', updFadFun );    // What: Window Resize Listener Teardown. Why: Same reasoning as the scroll listener, for the window-level one. How: This removes the exact same updFadFun reference that was added.


		};


	}, [] ); // What: Callback Dependency Array. Why: raiRefFun only closes over refs and stable functions it defines itself, none of which ever change identity. How: An empty array means React never needs to recreate this callback.

	// #endregion raiRefFun



	const attConObj = conIteArr.find( ( conCurObj ) => conCurObj.id === picDatObj.conditionalId ) || null; // What: Attached Conditional Object. Why: The schedule summary below needs the actual conditional record this picker currently points at. How: This looks up picDatObj.conditionalId in conIteArr, or null when none matches.


	const fliFirRef = React.useRef( new Map() ); // What: Flip First Reference. Why: The FLIP reorder animation below needs each pill's PREVIOUS x position to compute how far it moved. How: This starts as an empty map and is repopulated every time the layout effect runs.


	React.useLayoutEffect( () => { // What: Conditional Rail Flip Effect. Why: When the attached conditional changes, the pinned pill jumps to the front; this plays a FLIP tween instead of a silent snap. How: This captures each pill's old x, lets React reorder, then inverts and plays the transform so they glide into place.


		const raiCurEle = raiNodRef.current; // What: Rail Current Element. Why: There is nothing to animate before the rail itself has mounted. How: This reads the live node raiRefFun last wrote.


		if ( !raiCurEle ) return; // What: No Rail Guard. Why: The rail may not be mounted yet, such as while its own ColDisCom is still closed. How: This bails out of the effect early when there is no rail element to measure.



		const firMapObj = fliFirRef.current;                                // What: First Map Object. Why: This is the map of each pill's own previous x position, read and then overwritten below. How: This is read once from fliFirRef.current and reused throughout this effect run.
		const pilNodArr = [ ...raiCurEle.querySelectorAll( '.cnd-pill' ) ]; // What: Pill Node Array. Why: Every currently-rendered pill needs to be measured and possibly animated. How: This queries every '.cnd-pill' element inside the rail and spreads the NodeList into a real array.
		const redMotBoo = redMotFun();                                      // What: Reduce Motion Boolean. Why: A user who prefers reduced motion should never see this FLIP tween. How: This is checked once per run and read by every pill below.


		pilNodArr.forEach( ( pilCurEle ) => { // What: Pill Animate Loop. Why: Every pill needs its own individual FLIP tween (or fade-in, if newly pinned), since each may have moved a different distance. How: This computes each pill's own delta from firMapObj and plays the matching animation.


			const pilIdeStr = pilCurEle.dataset.cid;      // What: Pill Identifier String. Why: firMapObj is keyed by each pill's own conditional id, not the DOM node itself. How: This reads the pill's own data-cid attribute.
			const preXcoNum = firMapObj.get( pilIdeStr ); // What: Previous X-Coordinate Number. Why: A FLIP tween needs to know where this exact pill sat before the reorder. How: This looks up pilIdeStr in firMapObj, undefined if this pill is brand new.
			const newXcoNum = pilCurEle.offsetLeft;       // What: New X-Coordinate Number. Why: The tween's own end point is wherever the pill actually landed after the reorder. How: This reads the pill's own current offsetLeft.



			if ( redMotBoo ) return; // What: Reduced Motion Guard. Why: This pill should snap silently instead of tweening. How: This skips straight to the next pill without animating.



			if ( preXcoNum == null ) { // What: Newly Pinned Guard. Why: A pill with no recorded previous position was just pinned to the front for the first time. How: This plays a fade-and-rise-in animation instead of a horizontal FLIP tween.


				pilCurEle.animate( [ { opacity : 0, transform : 'translateY(4px)' }, { opacity : 1, transform : 'none' } ], { duration : 260, easing : 'cubic-bezier(.2,.7,.3,1)' } ); // What: Pin Animation Call. Why: A brand-new front position deserves its own entrance rather than a slide from nowhere. How: This fades and rises the pill into place over 260ms.


			}

			else { // What: Already Pinned Branch. Why: A pill that was already in the row before this render just moved sideways. How: This plays a horizontal FLIP slide from its previous x back to its new one.


				const difXcoNum = preXcoNum - newXcoNum; // What: Difference X-Coordinate Number. Why: The FLIP tween's own starting transform is the distance this pill needs to travel back from its new position. How: This subtracts the new x from the previous x.


				if ( Math.abs( difXcoNum ) > 1 ) pilCurEle.animate( [ { transform : `translateX(${ difXcoNum }px)` }, { transform : 'none' } ], { duration : 320, easing : 'cubic-bezier(.2,.7,.3,1)' } ); // What: Flip Animation Guard. Why: A pill that didn't actually move by more than a rounding pixel needs no tween at all. How: This plays the invert-then-play transform over 320ms only when difXcoNum is meaningfully non-zero.


			}


		} );



		firMapObj.clear(); // What: First Map Clear. Why: The map must not accumulate stale positions from a pill that no longer exists. How: This empties firMapObj before it's repopulated just below.

		pilNodArr.forEach( ( pilCurEle ) => firMapObj.set( pilCurEle.dataset.cid, pilCurEle.offsetLeft ) ); // What: First Map Populate. Why: The NEXT reorder's own FLIP tween needs this run's final positions as its own "previous" baseline. How: This records every pill's own current offsetLeft, keyed by its own conditional id.


		if ( raiCurEle.scrollLeft > 1 ) { // What: Rail Scroll Reset Guard. Why: A pin-to-front reorder means the top pill is now at the rail's own start, which should be visible. How: This glides the rail back to its own left edge whenever it wasn't already there.


			raiCurEle.scrollTo({ // What: Rail Scroll Call. Why: This is the actual glide back to the rail's start. How: This scrolls raiCurEle to its left edge.


				behavior : redMotBoo ? 'auto' : 'smooth', // What: Behavior. Why: A user who prefers reduced motion gets an instant jump instead of a glide. How: This picks 'auto' under reduced motion, otherwise 'smooth'.
				left     : 0                              // What: Left. Why: The rail's start is its left edge. How: This scrolls to x 0.


			});


		}


	}, [ picDatObj.conditionalId, conAttBoo, conIteArr.length ] ); // What: Effect Dependency Array. Why: This effect must re-run whenever the attached conditional changes, the toggle flips, or the available conditionals themselves change count. How: picDatObj.conditionalId is the actual reorder trigger; conAttBoo covers the rail appearing/disappearing; conIteArr.length covers a conditional being added or removed elsewhere.

	// #endregion Conditional Rail



	// #region Group Picker

	const [ newGroBoo, setNewGroBoo ] = React.useState( false ); // What: New Group Boolean And Setter. Why: The Group selector's own inline "+ New Group" create mode needs an on/off flag. How: This is flipped true by the "+ New Group" pill and closed by closeNewGroup below.
	const [ pilRetBoo, setPilRetBoo ] = React.useState( false ); // What: Pill Returning Boolean And Setter. Why: The "+ New Group" pill needs to know when it's mid-return-animation after the input closes. How: This is set true by cloGroFun and cleared 200ms later.
	const [ newGroStr, setNewGroStr ] = React.useState( '' );    // What: New Group String And Setter. Why: The inline input needs its own in-progress text, separate from any real group name. How: This is read on blur/Enter and normalized into a real group by cmtGroFun.

	const newGroRef = React.useRef( null ); // What: New Group Reference. Why: The inline input must be focused the instant it mounts. How: This is attached to the input's own ref prop and focused by the effect below.
	const groPilRef = React.useRef( null ); // What: Group Pill Reference. Why: Both the scroll-edge-fade effect and the "keep scrolled to the end while growing" effect below need the live pill row element. How: This is attached to the pill row's own ref prop.


	const groFliRef = React.useRef( null ); // What: Group Flip Reference. Why: Selecting a group re-sorts its pill to the front, and this needs each pill's own previous x to animate that shuffle instead of snapping. How: This starts null and is populated by the layout effect below.


	React.useLayoutEffect( () => { // What: Group Pills Flip Effect. Why: Re-sorting the group pills on selection should glide, not snap, matching the conditional rail's own FLIP treatment. How: This is guarded against measuring while the panel is hidden, then tweens each pill by its own previous-to-new x delta.


		const groCurEle = groPilRef.current; // What: Group Current Element. Why: There is nothing to animate before the group pill row itself has mounted. How: This reads the live node from groPilRef.


		if ( !groCurEle || groCurEle.offsetParent === null ) return; // What: Hidden Guard. Why: Measuring a hidden (offsetParent null) row would capture stale, meaningless coordinates. How: This bails out of the effect when the row isn't actually mounted or is currently hidden.



		const pilNodArr = [ ...groCurEle.querySelectorAll( '.picker-group-pill' ) ]; // What: Pill Node Array. Why: Every currently-rendered group pill needs to be checked for movement. How: This queries every '.picker-group-pill' element inside the row and spreads the NodeList into a real array.
		const preMapObj = groFliRef.current;                                         // What: Previous Map Object. Why: A FLIP tween needs each pill's own position from before this render's reorder. How: This reads whatever the previous run of this effect recorded.


		if ( preMapObj && !redMotFun() ) { // What: Has Previous Guard. Why: The very first run has nothing to compare against, and a reduced-motion user should never see this tween. How: This only attempts to animate once a previous snapshot exists and motion isn't reduced.


			pilNodArr.forEach( ( pilCurEle ) => { // What: Pill Animate Loop. Why: Every pill needs its own individual tween, since each may have moved a different distance (or none at all). How: This computes each pill's own delta from preMapObj and plays a matching transform.


				const oldXcoNum = preMapObj.get( pilCurEle.dataset.g ); // What: Old X-Coordinate Number. Why: This pill's own previous position is keyed by its own group name. How: This looks up the pill's own data-g attribute in preMapObj.


				if ( oldXcoNum == null ) return; // What: New Pill Guard. Why: A pill with no recorded previous position is brand new and has nothing to tween from. How: This skips straight to the next pill.



				const difXcoNum = oldXcoNum - pilCurEle.offsetLeft; // What: Difference X-Coordinate Number. Why: The tween's own starting transform is the distance this pill needs to travel back from its new position. How: This subtracts the pill's own current offsetLeft from oldXcoNum.


				if ( Math.abs( difXcoNum ) > 1 ) pilCurEle.animate( [ { transform : `translateX(${ difXcoNum }px)` }, { transform : 'none' } ], { duration : 320, easing : 'cubic-bezier(.2,.7,.3,1)' } ); // What: Flip Animation Guard. Why: A pill that didn't actually move by more than a rounding pixel needs no tween at all. How: This plays the invert-then-play transform over 320ms only when difXcoNum is meaningfully non-zero.


			} );


		}



		const nexMapObj = new Map(); // What: Next Map Object. Why: The NEXT run of this effect needs this run's own final positions as its own "previous" baseline. How: This starts empty and is filled by the loop just below.


		pilNodArr.forEach( ( pilCurEle ) => nexMapObj.set( pilCurEle.dataset.g, pilCurEle.offsetLeft ) ); // What: Next Map Populate. Why: Every pill's own current position must be recorded for next time. How: This records each pill's own current offsetLeft, keyed by its own group name.

		groFliRef.current = nexMapObj; // What: Group Flip Update. Why: This run's own positions must replace whatever the previous run recorded. How: This overwrites groFliRef.current with nexMapObj.


		if ( groCurEle.scrollLeft > 1 ) { // What: Group Scroll Reset Guard. Why: A pin-to-front reorder means the selected group is now the leftmost pill, which should be visible. How: This glides the row back to its own left edge whenever it wasn't already there.


			groCurEle.scrollTo({ // What: Group Scroll Call. Why: This is the actual glide back to the row's start. How: This scrolls groCurEle to its left edge.


				behavior : redMotFun() ? 'auto' : 'smooth', // What: Behavior. Why: A user who prefers reduced motion gets an instant jump instead of a glide. How: This picks 'auto' under reduced motion, otherwise 'smooth'.
				left     : 0                                // What: Left. Why: The row's start is its left edge. How: This scrolls to x 0.


			});


		}


	}, [ picDatObj.group ] ); // What: Effect Dependency Array. Why: The group pills only ever need to reorder when the picker's own selected group actually changes. How: picDatObj.group is the single value this effect's own change-detection is built around.


	React.useEffect( () => { // What: Group Pills Fade Effect. Why: The group pill row's own scroll-edge fades (only visible once it actually overflows on small screens) need to track its live scroll position. How: This toggles at-start/at-end the same way every other pill rail in this file does, and re-checks on scroll/resize.


		const groCurEle = groPilRef.current; // What: Group Current Element. Why: There is nothing to wire up before the row itself has mounted. How: This reads the live node from groPilRef.


		if ( !groCurEle ) return; // What: No Element Guard. Why: The row may not be mounted yet. How: This bails out of the effect early when there is no row to wire up.



		const updFadFun = () => { // What: Update Fade Function. Why: The fade classes need recomputing on every relevant change. How: This toggles at-start/at-end based on the row's own scrollWidth/clientWidth/scrollLeft.


			const canScrBoo = groCurEle.scrollWidth - groCurEle.clientWidth > 1;                                       // What: Can Scroll Boolean. Why: A row that doesn't overflow at all should never show either fade edge. How: This is true only when the row's own content is wider than its own visible box by more than a rounding pixel.
			const reaStaBoo = !canScrBoo || groCurEle.scrollLeft <= 1;                                                 // What: Reached Start Boolean. Why: The left fade should hide once the row can't scroll at all or is already at its own start. How: This combines canScrBoo with the row's own current scrollLeft.
			const reaEndBoo = !canScrBoo || groCurEle.scrollLeft + groCurEle.clientWidth >= groCurEle.scrollWidth - 1; // What: Reached End Boolean. Why: The right fade should hide once the row can't scroll at all or is already at its own end. How: This combines canScrBoo with the row's own current scroll position.


			groCurEle.classList.toggle( 'at-start', reaStaBoo ); // What: At Start Toggle. Why: This is the actual class CSS reads to hide the left fade. How: This applies reaStaBoo.
			groCurEle.classList.toggle( 'at-end', reaEndBoo );   // What: At End Toggle. Why: This is the actual class CSS reads to hide the right fade. How: This applies reaEndBoo.


		};


		updFadFun(); // What: Initial Fade Call. Why: The fade classes need to reflect the row's own real layout immediately on mount. How: This invokes updFadFun once, synchronously.


		groCurEle.addEventListener( 'scroll', updFadFun, { passive : true } ); // What: Group Scroll Listener. Why: Scrolling the row itself is the most common way its own edges change. How: This re-runs updFadFun on every scroll event, passively so it never blocks the scroll itself.
		window.addEventListener( 'resize', updFadFun );                        // What: Window Resize Listener. Why: A viewport resize can also change how much of the row is visible. How: This re-runs updFadFun on every window resize event.



		return () => { // What: Effect Cleanup Function. Why: Both listeners must not outlive this effect run. How: This removes the exact same updFadFun reference from both the row and the window.


			groCurEle.removeEventListener( 'scroll', updFadFun ); // What: Group Scroll Listener Teardown. Why: This matches the addEventListener above. How: This removes updFadFun from groCurEle.
			window.removeEventListener( 'resize', updFadFun );    // What: Window Resize Listener Teardown. Why: This matches the addEventListener above. How: This removes updFadFun from window.


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


	const oriGroRef = React.useRef( picDatObj.group ); // What: Original Group Reference. Why: The group choice list below must keep listing the picker's ORIGINAL group even if it's since been moved away mid-edit, so a stray click is recoverable until Save. How: This snapshots picDatObj.group once, on mount, and is never reassigned.


	const groChoArr = React.useMemo( () => { // What: Group Choices Array. Why: The Group selector needs every existing group, plus this picker's own current and original group in case either isn't otherwise represented. How: This builds the combined list and sorts the picker's own current group to the front.


		const allChoArr = [ ...( allGroArr || [] ) ]; // What: All Choice Array. Why: The full choice list starts from every group already in use elsewhere. How: This copies allGroArr so the pushes below never mutate the caller's own array.


		if ( picDatObj.group && !allChoArr.includes( picDatObj.group ) ) allChoArr.push( picDatObj.group ); // What: Current Group Guard. Why: A picker's own current group might be the only member of a group not otherwise listed. How: This appends picDatObj.group when it's set and not already present.



		if ( oriGroRef.current && !allChoArr.includes( oriGroRef.current ) ) allChoArr.push( oriGroRef.current ); // What: Original Group Guard. Why: The picker's ORIGINAL group must stay listed even if this (its only member) has been moved away mid-edit. How: This appends oriGroRef.current when it's set and not already present.



		return allChoArr.sort( ( groOneStr, groTwoStr ) => ( groTwoStr === picDatObj.group ? 1 : 0 ) - ( groOneStr === picDatObj.group ? 1 : 0 ) ); // What: Choice Array Return. Why: The picker's own current group should sort first, ahead of every other choice. How: This sorts by whichever of the two sides equals picDatObj.group.


	}, [ allGroArr, picDatObj.group ] ); // What: Memo Dependency Array. Why: The choice list only needs recomputing when the available groups or the picker's own current group changes. How: allGroArr covers a group being added/removed elsewhere; picDatObj.group covers this picker's own selection changing.


	const cloGroFun = () => { // What: Close Group Function. Why: Both a commit and a cancel need the exact same teardown: unmount the input, clear its text, and play the "+ New Group" pill's own return animation. How: This closes newGroBoo, clears newGroStr, and flags pilRetBoo for 200ms.


		setNewGroBoo( false ); // What: New Group Close Call. Why: This unmounts the inline input immediately. How: This sets newGroBoo to false.
		setNewGroStr( '' );    // What: New Group Text Clear. Why: A future reopen should start from an empty input, not leftover text. How: This resets newGroStr to an empty string.
		setPilRetBoo( true );  // What: Pill Returning Start. Why: The "+ New Group" pill needs to visibly animate back in, symmetric with how it vanished on open. How: This flags pilRetBoo true, applying the returning class.

		setTimeout( () => setPilRetBoo( false ), 200 ); // What: Pill Returning End. Why: The returning class only needs to apply for the duration of its own animation. How: This clears pilRetBoo 200ms later.


	};


	const cmtGroFun = () => { // What: Commit Group Function. Why: Pressing Enter (or clicking the checkmark) should actually create/select the typed group, not just close the input. How: This normalizes the typed name and, if valid, updates the picker's own group before closing.


		const tidNamStr = norGroFun( newGroStr, groChoArr ); // What: Tidy Name String. Why: A typed group name needs the same tidy-casing/collision handling every other group name gets. How: This calls the shared norGroFun helper against the current choice list.


		if ( tidNamStr ) actStoObj.updPicFun( picDatObj.id, { group : tidNamStr } ); // What: Update Picker Guard. Why: An empty or otherwise invalid typed name should not create a group at all. How: This only commits the picker's own group when tidNamStr is truthy.



		cloGroFun(); // What: Close Group Call. Why: A commit still needs the same teardown every close does. How: This runs the shared close routine after the update above.


	};


	const canGroFun = () => { cloGroFun(); }; // What: Cancel Group Function. Why: Escape (or the cancel button) should discard the typed text without creating anything. How: This just runs the shared close routine, with no update call.

	// #endregion Group Picker



	// #region Close And Revert Handling

	const snaStaRef = React.useRef( { // What: Snapshot State Reference. Why: Controls opening (this component mounting) is the moment every field must be remembered, so Cancel can revert every change made while it was open. How: This freezes a shallow copy of the picker, every one of its items, and its own daily-generator membership, captured once on mount.


		daiBoo : incDaiBoo,                                              // What: Daily Boolean. Why: Toggling daily-generator membership while Controls is open must also be revertible. How: This is incDaiBoo as it existed the instant Controls opened.
		iteArr : picIteArr.map( ( iteCurObj ) => ( { ...iteCurObj } ) ), // What: Item Array. Why: A Refill/Fill performed while Controls is open must also be revertible. How: This is a shallow copy of every item as it existed the instant Controls opened.
		picObj : { ...picDatObj }                                        // What: Picker Object. Why: The picker's own fields (name, mode, schedule, etc.) all need to be revertible. How: This is a shallow copy of picDatObj as it existed the instant Controls opened.


	} );


	// #region revStaFun

	/**
	 * revStaFun = Revert State Function
	 *
	 * @summary
	 * Rolls the live store back to the snapshot taken when Controls opened: the
	 * picker itself, every one of its items, and its daily-generator membership,
	 * which is re-added or removed to match whatever it was at that moment.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * revStaFun() // => void
	 * ```
	 *
	*/

	const revStaFun = () => { // What: Revert State Function. Why: Cancel must put the picker, every one of its items, and its daily-generator membership back exactly as they were when Controls opened. How: This replaces the picker and every item from snaStaRef.current, then reconciles daily-generator membership.


		actStoObj.revPicFun( picDatObj.id, snaStaRef.current.picObj ); // What: Replace Picker Call. Why: Every field edited while Controls was open must be rolled back. How: This overwrites the live picker with the snapshot taken on mount.

		snaStaRef.current.iteArr.forEach( ( iteCurObj ) => actStoObj.revIteFun( iteCurObj.id, iteCurObj ) ); // What: Replace Items Loop. Why: Every item touched (e.g. by a Refill) while Controls was open must also be rolled back. How: This overwrites each live item with its own snapshot.


		const hasDaiBoo = daiIdeArr.includes( picDatObj.id ); // What: Has Daily Boolean. Why: Reconciling membership needs to know the picker's CURRENT daily-generator status before deciding whether to add or remove it. How: This checks whether picDatObj.id is currently in daiIdeArr.


		if ( snaStaRef.current.daiBoo && !hasDaiBoo ) actStoObj.daiPicFun( [ ...daiIdeArr, picDatObj.id ] ); // What: Re-Add Daily Guard. Why: The picker was in the daily generator when Controls opened but has since been removed. How: This adds picDatObj.id back into the daily-generator list.

		else if ( !snaStaRef.current.daiBoo && hasDaiBoo ) actStoObj.daiPicFun( daiIdeArr.filter( ( curIdeStr ) => curIdeStr !== picDatObj.id ) ); // What: Re-Remove Daily Guard. Why: The picker was NOT in the daily generator when Controls opened but has since been added. How: This filters picDatObj.id back out of the daily-generator list.


	};

	// #endregion revStaFun



	const cloWayRef = React.useRef( null ); // What: Close Way Reference. Why: The mount-cleanup effect below needs to know, at unmount time, whether the user already closed explicitly (Cancel or Save) or is closing implicitly (tab-switch/reload). How: This starts null and is set to 'cancel' or 'saved' by the matching handler.


	const canConFun = () => { // What: Cancel Controls Function. Why: Cancel is an explicit close that must also revert every change. How: This marks cloWayRef, reverts state, then collapses Controls.


		cloWayRef.current = 'cancel'; // What: Close Way Mark. Why: The unmount cleanup must know this close was an explicit Cancel. How: This records 'cancel' on cloWayRef.

		revStaFun(); // What: Revert State Call. Why: Cancel must undo every change made while Controls was open. How: This restores the snapshot taken on mount.

		onColConFun(); // What: Collapse Controls Call. Why: Cancel also closes the Controls disclosure. How: This calls the parent's own collapse callback.


	};


	const savCloFun = () => { // What: Save Close Function. Why: Save is an explicit close that keeps every change already committed live. How: This marks cloWayRef, then simply collapses Controls without reverting anything.


		cloWayRef.current = 'saved'; // What: Close Way Mark. Why: The unmount cleanup must know this close was an explicit Save. How: This records 'saved' on cloWayRef.

		onColConFun(); // What: Collapse Controls Call. Why: Save closes the Controls disclosure while keeping every change. How: This calls the parent's own collapse callback.


	};



	// #region resStoFun

	/**
	 * resStoFun = Restore Storage Function
	 *
	 * @summary
	 * Rewrites the localStorage warm mirror to the snapshot taken when Controls
	 * opened, for an implicit close (a reload or tab close) where the live
	 * store's own unsaved edits would otherwise survive in the mirror. It rolls
	 * back the picker, its items, and its daily-generator membership the same way
	 * revStaFun does, and silently does nothing when the mirror is missing or
	 * unreadable.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * resStoFun() // => void
	 * ```
	 *
	*/

	const resStoFun = () => { // What: Restore Storage Function. Why: An implicit close (reload) must not let unsaved edits survive in the warm localStorage mirror, even though the live store already has them. How: This synchronously rewrites the mirrored picker/items/daily entry back to the snapshot taken on mount.


		try { // What: Mirror Restore Attempt. Why: Reading or writing the localStorage mirror can throw (malformed JSON, disabled storage). How: This does the whole rollback inside one try so the catch below can swallow any failure.


			const rawJsoStr = localStorage.getItem( 'easemylife.v2' ); // What: Raw Json String. Why: The mirror must actually exist before there's anything to roll back. How: This reads the same key the storage layer's own warm mirror uses.


			if ( !rawJsoStr ) return; // What: No Mirror Guard. Why: A brand-new install or a wiped mirror has nothing to restore. How: This bails out of the whole restore when rawJsoStr is falsy.



			const mirStaObj = JSON.parse( rawJsoStr ); // What: Mirror State Object. Why: The mirror's own fields need to be read and selectively rewritten. How: This parses the raw JSON string into a plain object.


			if ( Array.isArray( mirStaObj.pickers ) ) mirStaObj.pickers = mirStaObj.pickers.map( ( picCurObj ) => picCurObj.id === picDatObj.id ? snaStaRef.current.picObj : picCurObj ); // What: Pickers Rollback Guard. Why: Only this one picker's own entry needs replacing. How: This maps every picker through unchanged except a match on picDatObj.id, which is replaced by the snapshot.



			const iteMapObj = new Map( snaStaRef.current.iteArr.map( ( iteCurObj ) => [ iteCurObj.id, iteCurObj ] ) ); // What: Item Map Object. Why: Rolling back every touched item needs an id-keyed lookup, not a linear scan per item. How: This builds a Map from the snapshot's own items, keyed by id.


			if ( Array.isArray( mirStaObj.items ) ) mirStaObj.items = mirStaObj.items.map( ( iteCurObj ) => iteMapObj.has( iteCurObj.id ) ? iteMapObj.get( iteCurObj.id ) : iteCurObj ); // What: Items Rollback Guard. Why: Every item the snapshot covers needs replacing; anything else stays untouched. How: This maps every item through unchanged except an id found in iteMapObj, which is replaced by the snapshot's own copy.



			if ( mirStaObj.daily ) { // What: Daily Rollback Guard. Why: Daily-generator membership is its own separate field and needs its own reconciliation, mirroring revStaFun's own logic. How: This only runs when the mirror actually has a daily object at all.


				const mirIdeArr = mirStaObj.daily.pickerIds || [];    // What: Mirror Identifier Array. Why: Membership reconciliation needs the mirror's own current list of daily picker ids. How: This reads mirStaObj.daily.pickerIds, falling back to an empty array.
				const hasDaiBoo = mirIdeArr.includes( picDatObj.id ); // What: Has Daily Boolean. Why: Same reasoning as revStaFun's own check, applied to the mirror instead of the live store. How: This checks whether picDatObj.id is currently in mirIdeArr.


				if ( snaStaRef.current.daiBoo && !hasDaiBoo ) mirStaObj.daily.pickerIds = [ ...mirIdeArr, picDatObj.id ]; // What: Re-Add Daily Guard. Why: The mirror must match whatever revStaFun would also restore. How: This adds picDatObj.id back into the mirrored list.

				else if ( !snaStaRef.current.daiBoo && hasDaiBoo ) mirStaObj.daily.pickerIds = mirIdeArr.filter( ( curIdeStr ) => curIdeStr !== picDatObj.id ); // What: Re-Remove Daily Guard. Why: Same reasoning as the guard above, for the opposite direction. How: This filters picDatObj.id back out of the mirrored list.


			}



			localStorage.setItem( 'easemylife.v2', JSON.stringify( mirStaObj ) ); // What: Mirror Write Call. Why: The rolled-back object above only takes effect once it's actually written back. How: This overwrites the same mirror key with the freshly-stringified mirStaObj.


		}

		catch {} // What: Restore Error Guard. Why: A malformed or unavailable mirror must never crash the app on close. How: This silently swallows any parse/storage error, leaving the mirror as it was.


	};

	// #endregion resStoFun


	React.useEffect( () => { // What: Mount Cleanup Effect. Why: Controls opening replaces whichever item editor was previously open, and closing (implicitly or not) must revert unsaved edits exactly like the item editor's own guard does. How: This disarms any pending revert from the replaced editor on mount, then arms its own revert (or restores the mirror) on unmount.


		window.__editGuard.disFun(); // What: Edit Guard Disarm Call. Why: A pending revert from whichever editor Controls just replaced must not fire later and clobber this component's own state. How: This cancels that pending revert.


		const onPagHidFun = () => { if ( !cloWayRef.current ) resStoFun(); }; // What: On Page Hide Function. Why: A reload/tab-hide is an implicit close and must roll back the warm mirror synchronously, since there's no time for React's own unmount cleanup. How: This only restores when cloWayRef.current is still null, meaning neither Cancel nor Save ever ran.


		window.addEventListener( 'pagehide', onPagHidFun ); // What: Pagehide Subscribe Call. Why: This is the actual event that fires just before the page is torn down. How: This registers onPagHidFun to run on pagehide.



		return () => { // What: Effect Cleanup Function. Why: Both the listener and (on an implicit unmount) the revert-arming must happen exactly once, when this component actually goes away. How: This removes the pagehide listener and, if still undone, arms window.__editGuard with revStaFun.


			window.removeEventListener( 'pagehide', onPagHidFun ); // What: Pagehide Unsubscribe Call. Why: This listener must not outlive this component. How: This removes the exact same onPagHidFun reference that was added.


			if ( !cloWayRef.current ) window.__editGuard.armFun( revStaFun ); // What: Implicit Close Guard. Why: An unmount with no explicit Cancel/Save (e.g. switching tabs) must still discard unsaved edits. How: This arms the shared edit guard with revStaFun only when cloWayRef.current is still null.


		};


	}, [] ); // What: Effect Dependency Array. Why: This effect only ever needs to run its setup/teardown once, on mount and unmount. How: An empty array means it never re-subscribes.

	// #endregion Close And Revert Handling



	return (


		<div className='rd-ctl-body'>{ /* What: Controls Body Div Element. Why: This is PicConCom's own root element, holding Picker Details, How it picks, When it runs, Item Controls, and the footer. How: This renders as a plain div; every field below commits through actStoObj. */ }


			<div className='rd-ctl-group rd-ctl-group--basics'>{ /* What: Basics Group Div Element. Why: Name and Group are grouped as the picker's own basic identity fields. How: This wraps the subhead and the name/group rows below. */ }


				<div className='rd-ctl-subhead'>Picker Details</div>{ /* What: Basics Subhead Div Element. Why: Every Controls group needs its own labeled subhead. How: This renders the literal text "Picker Details". */ }

				<div className='rd-basics-row'>{ /* What: Name Row Div Element. Why: The Name field needs its own labeled row. How: This wraps the label span and the name input. */ }


					<span className='rd-basics-lbl'>Name</span>{ /* What: Name Label Span Element. Why: The name input needs a visible label beside it. How: This renders the literal text "Name". */ }

					<input
						className='rd-basics-name'

						maxLength={ 40 }
						placeholder='Picker name'
						type='text'
						value={ picDatObj.name }

						aria-label='Picker name'

						onBlur={ ( bluEveObj ) => { // What: On Blur Handler. Why: Leaving the name field should commit a tidied final name. How: This trims the typed value and renames the picker only when the result is non-empty.


							const namTriStr = bluEveObj.target.value.trim(); // What: Name Trimmed String. Why: A blur commit should tidy the name, not commit stray whitespace. How: This trims bluEveObj's own current value.


							if ( namTriStr ) actStoObj.renPicFun( picDatObj.id, namTriStr ); // What: Rename Picker Guard. Why: Blurring on an emptied field should not commit a blank name. How: This only calls renPicFun when namTriStr is non-empty.


						} }
						onChange={ ( chaEveObj ) => actStoObj.updPicFun( picDatObj.id, { name : chaEveObj.target.value } ) }
						onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Enter' ) keyEveObj.currentTarget.blur(); } }
					/>{ /* What: Name Input Element. Why: A picker's own name is edited live rather than through a separate form. How: This commits every keystroke immediately, tidies/commits the final name on blur, and blurs on Enter. */ }


				</div>


				<div className='rd-basics-row rd-basics-row--group'>{ /* What: Group Row Div Element. Why: The Group field needs its own labeled row. How: This wraps the label span and the group pill selector below. */ }


					<span className='rd-basics-lbl'>Group</span>{ /* What: Group Label Span Element. Why: The group selector needs a visible label beside it. How: This renders the literal text "Group". */ }

					<div
						ref={ groPilRef }

						className='rd-group-pills'

						aria-label='Picker group'
						role='radiogroup'
					>{ /* What: Group Pills Div Element. Why: This is the actual radiogroup of every existing group plus the inline "+ New Group" control. How: This maps groChoArr to one pill each, then either the inline input or the "+ New Group" pill. */ }


						{ groChoArr.map( ( groCurStr ) => ( // What: Group Choice Map. Why: One pill is needed per existing group choice. How: This maps groChoArr to one radio-role button each, keyed by its own name.


							<button
								key={ groCurStr }

								className={ ` picker-group-pill   ${ picDatObj.group === groCurStr ? 'is-on' : '' } ` }

								data-g={ groCurStr }

								type='button'

								aria-checked={ picDatObj.group === groCurStr }
								role='radio'

								onClick={ () => actStoObj.updPicFun( picDatObj.id, { group : groCurStr } ) }
							>{ groCurStr }</button> // What: Group Pill Button Element. Why: Clicking a pill selects that group for this picker. How: This marks itself checked when it matches picDatObj.group and commits groCurStr on click.


						) ) }

						{ newGroBoo ? ( // What: New Group Mode Check. Why: The inline create control replaces the "+ New Group" pill entirely while active. How: This renders the input+confirm+cancel trio while newGroBoo is true, otherwise the trigger pill.


							<span className='rd-group-new'>{ /* What: New Group Span Element. Why: The inline input and its 2 icon buttons need one wrapper to lay out together. How: This groups the text input with its own confirm and cancel buttons. */ }


								<input
									ref={ newGroRef }

									className='rd-group-new-input'

									maxLength={ 30 }
									placeholder='Group name'
									type='text'
									value={ newGroStr }

									aria-label='Group name'

									onChange={ ( chaEveObj ) => setNewGroStr( chaEveObj.target.value ) }
									onKeyDown={ ( keyEveObj ) => { // What: On Key Down Handler. Why: Enter and Escape are the keyboard shortcuts for committing or discarding the typed group name. How: This calls cmtGroFun on Enter and canGroFun on Escape.


										if ( keyEveObj.key === 'Enter' ) cmtGroFun(); // What: Enter Commit Guard. Why: Enter should commit the typed group name immediately. How: This calls cmtGroFun when keyEveObj.key is 'Enter'.

										else if ( keyEveObj.key === 'Escape' ) canGroFun(); // What: Escape Cancel Guard. Why: Escape should discard the typed text instead. How: This calls canGroFun when keyEveObj.key is 'Escape'.


									} }
								/>{ /* What: New Group Input Element. Why: A brand-new group needs its own typed name before it can be created. How: This is a plain controlled text input, committed via cmtGroFun on Enter/checkmark, discarded via canGroFun on Escape/cancel. */ }

								<button
									className='rd-group-new-ok'

									disabled={ !newGroStr.trim() }
									type='button'

									aria-label='Create group'

									onClick={ cmtGroFun }
								>{ /* What: New Group Ok Button Element. Why: This is the explicit "create this group" affordance beside the input. How: This is disabled while newGroStr is empty and calls cmtGroFun on click. */ }


									<IcoSvgCom
										icoNamStr='cheEle'
										sizValNum={ 14 }
									/>{ /* What: Icon Svg Component. Why: The confirm button needs a recognizable checkmark glyph. How: This renders the 'cheEle' icon at a fixed size. */ }


								</button>

								<button
									className='rd-group-new-cancel'

									type='button'

									aria-label='Cancel'

									onClick={ canGroFun }
								>{ /* What: New Group Cancel Button Element. Why: This is the explicit "discard this group" affordance beside the input. How: This calls canGroFun on click. */ }


									<IcoSvgCom
										icoNamStr='croEle'
										sizValNum={ 14 }
									/>{ /* What: Icon Svg Component. Why: The cancel button needs a recognizable close glyph. How: This renders the 'croEle' icon at a fixed size. */ }


								</button>


							</span>


						) : ( // What: New Group Trigger Branch. Why: With no create-in-progress, the row just needs its own plain trigger pill instead of the input. How: This renders the else branch, taken while newGroBoo is false.


							<button
								className={ ` picker-group-pill   picker-group-pill--new   ${ pilRetBoo ? 'is-returning' : '' } ` }

								type='button'

								onClick={ () => setNewGroBoo( true ) }
							>{ /* What: New Group Trigger Button Element. Why: This is the affordance that opens the inline create control. How: This opens newGroBoo on click, and plays its own return animation via pilRetBoo after a prior close. */ }


								<IcoSvgCom
									icoNamStr='pluEle'
									sizValNum={ 13 }
								/>{ /* What: Icon Svg Component. Why: The trigger pill needs a recognizable "add" glyph beside its own label. How: This renders the 'pluEle' icon at a fixed size. */ } New Group


							</button>


						) }


					</div>


				</div>


			</div>



			<fieldset className='rd-ctl-group rd-ctl-group--picks'>{ /* What: Picks Group Fieldset Element. Why: The mode radio group is a real form control set and belongs in a fieldset. How: This wraps the legend and the mode radio group below. */ }


				<legend className='rd-ctl-subhead'>How it picks</legend>{ /* What: Picks Legend Element. Why: A fieldset needs its own legend to label the radio group it contains. How: This renders the literal text "How it picks". */ }

				<div className='rd-mode-radio'>{ /* What: Mode Radio Div Element. Why: Every supported mode needs its own selectable row. How: This maps Object.entries(SED_NAM_OBJ.MOD_DEF_OBJ) to one label+radio+hint per mode. */ }


					{ Object.entries( SED_NAM_OBJ.MOD_DEF_OBJ ).map( ( [ modKeyStr, modValObj ] ) => { // What: Mode Entries Map. Why: One row is needed per supported picking mode. How: This maps every [key, definition] pair in SED_NAM_OBJ.MOD_DEF_OBJ to one label below.


						const modSelBoo = picDatObj.mode === modKeyStr; // What: Mode Selected Boolean. Why: The row's own selected state and its hint's open state both depend on whether this mode is the picker's current one. How: This compares modKeyStr against picDatObj.mode.



						return (


							<label
								key={ modKeyStr }

								className={ ` rd-mode-opt   ${ modSelBoo ? 'is-on' : '' } ` }
							>{ /* What: Mode Option Label Element. Why: Each mode is a real radio option, so its own label must wrap the input for a clickable hit area. How: This marks itself "is-on" when modSelBoo is true. */ }


								<input
									name={ `mode_${ picDatObj.id }` }

									checked={ modSelBoo }
									type='radio'

									onChange={ () => actStoObj.updPicFun( picDatObj.id, { mode : modKeyStr } ) }
								/>{ /* What: Mode Radio Input Element. Why: This is the actual selectable control for this mode. How: This is checked when modSelBoo is true and commits modKeyStr as the picker's own mode on change. */ }

								<span
									className='rd-mode-dot'

									aria-hidden='true'
								></span>{ /* What: Mode Dot Span Element. Why: The custom radio dot is drawn purely with CSS rather than the native control. How: This is an empty, decorative, screen-reader-hidden span. */ }

								<span className='rd-mode-text'>{ /* What: Mode Text Span Element. Why: The mode's own name and its expandable hint need to sit together beside the radio dot. How: This wraps the name span and the ColDisCom-wrapped hint below. */ }


									<span className='rd-mode-name'>{ modValObj.labStr }</span>{ /* What: Mode Name Span Element. Why: Every mode needs its own visible name. How: This renders modValObj's own label. */ }



									<ColDisCom
										isaInsBoo={ isaNewBoo }
										open={ modSelBoo }
									>{ /* What: Collapse Disclosure Component. Why: The hint expands/collapses on selection change, so the old row's hint folds away while the new one grows. How: This opens only for the currently-selected mode, instant (no animation) for a brand-new draft. */ }


										{ Array.isArray( modValObj.hinArr ) // What: Hint Content Check. Why: A mode's own hint can be either one paragraph or several. How: This maps every paragraph to its own span when hint is an array, otherwise renders the single hint directly.


											? modValObj.hinArr.map( ( parCurStr, parIndNum ) => ( // What: Paragraph Hints Branch. Why: A multi-paragraph hint needs one span per paragraph. How: This maps each paragraph string to its own hint span.


												<span
													key={ parIndNum }

													className='rd-mode-hint'
												>{ parCurStr }</span> // What: Hint Paragraph Span Element. Why: Each paragraph renders as its own hint line. How: This renders parCurStr, keyed by its index.


											) )

											: <span className='rd-mode-hint'>{ modValObj.hinArr }</span> // What: Single Hint Branch. Why: A one-paragraph hint needs just one span. How: This renders modValObj.hinArr directly.


										}


									</ColDisCom>


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


						<span className='sched-line-lbl'>Attach a conditional</span>{ /* What: Conditional Label Span Element. Why: The row needs its own literal name. How: This renders the literal text "Attach a conditional". */ }

						<span className='sched-line-sub'>{ /* What: Conditional Sub Span Element. Why: The row needs a live one-line explanation of the current state. How: This renders whichever of the 2 explanations below matches whether a conditional is attached. */ }


							{ attConObj // What: Attached Conditional Check. Why: The explanation depends on whether a conditional is attached. How: This picks one of the 2 phrases below based on attConObj.


								? <>triggering rules provided by <strong>{ attConObj.name }</strong> will prevent this picker from running</> // What: Attached Phrase. Why: With a conditional attached, its own triggering rules can stop this picker. How: This names the attached conditional.

								: <>picker <strong>will always run</strong>, attaching a conditional will provide a trigger to prevent it from running</> // What: Unattached Phrase. Why: With nothing attached, the picker always runs, so the phrase suggests attaching one. How: This renders a fixed explanation.


							}


						</span>


					</span>

					<button
						className={ ` switch   ${ conAttBoo ? 'is-on' : '' } ` }

						aria-checked={ conAttBoo }
						aria-label='Attach a conditional'
						role='switch'

						onClick={ () => setConAttBoo( ( preValBoo ) => { // What: On Click Handler. Why: Flipping the switch off must also detach whatever conditional is attached. How: This toggles conAttBoo through its functional setter, clearing conditionalId when the new state is off.


							const nexValBoo = !preValBoo; // What: Next Value Boolean. Why: The toggle's own next state is simply the opposite of its current one. How: This negates preValBoo.


							if ( !nexValBoo && picDatObj.conditionalId ) actStoObj.updPicFun( picDatObj.id, { conditionalId : null } ); // What: Detach Conditional Guard. Why: Turning the toggle off must also actually detach whatever conditional was attached. How: This clears conditionalId only when the toggle is turning off and one was actually set.



							return nexValBoo; // What: Next Value Return. Why: setConAttBoo needs the toggle's own new state back. How: This returns nexValBoo.


						} ) }
					><i />{ /* What: Switch Dot Element. Why: This is the switch's own purely decorative sliding knob. How: This renders empty, positioned entirely via CSS off the "is-on" class on its parent button. */ }</button>{ /* What: Conditional Switch Button Element. Why: This is the actual on/off control for attaching a conditional. How: This flips conAttBoo and, when turning off, clears the picker's own conditionalId. */ }


				</div>



				<ColDisCom open={ conAttBoo }>{ /* What: Collapse Disclosure Component. Why: The conditional rail only needs to exist while the toggle is on. How: This opens only while conAttBoo is true. */ }


					<div className='rd-cnd-rail-row'>{ /* What: Rail Row Div Element. Why: The conditional rail (or its empty-state message) needs its own row. How: This wraps whichever of the 2 branches below applies. */ }


						{ conIteArr.length ? ( // What: Has Conditionals Check. Why: The rail only makes sense once at least one conditional exists. How: This renders the rail when conIteArr has entries, otherwise an empty-state message.


							<div
								ref={ raiRefFun }

								className='cnd-rail picker-groups'
							>{ /* What: Conditional Rail Div Element. Why: This is the actual scrollable pill rail, alphabetical except the attached conditional pins to the front. How: This maps every conditional (sorted per pk.conditionalId first, then by name) to one pill each. */ }


								{ [ ...conIteArr ].sort( ( conOneObj, conTwoObj ) => { // What: Attached-First Sort Comparator. Why: The rail pins the attached conditional first, then lists the rest alphabetically. How: This sorts a copy of conIteArr with the rules below.


									if ( conOneObj.id === picDatObj.conditionalId ) return -1; // What: Attached First Guard. Why: The currently-attached conditional always pins to the front. How: This sorts conOneObj ahead whenever it's the attached one.



									if ( conTwoObj.id === picDatObj.conditionalId ) return 1; // What: Attached First Guard. Why: Same reasoning as above, for the other comparison side. How: This sorts conTwoObj ahead whenever it's the attached one.



									return conOneObj.name.localeCompare( conTwoObj.name ); // What: Alphabetical Fallback Return. Why: Every other pair sorts alphabetically by name. How: This compares conOneObj.name against conTwoObj.name.


								} ).map( ( conCurObj ) => ( // What: Conditional Pill Map. Why: One pill is needed per existing conditional. How: This maps the sorted list to one button each, keyed by its own id.


									<button
										key={ conCurObj.id }

										className={ ` cnd-pill   ${ picDatObj.conditionalId === conCurObj.id ? 'is-on' : '' } ` }

										data-cid={ conCurObj.id }

										type='button'

										onClick={ () => actStoObj.updPicFun( picDatObj.id, { conditionalId : conCurObj.id } ) }
									>{ /* What: Conditional Pill Button Element. Why: Clicking a pill attaches that conditional to this picker. How: This marks itself "is-on" when it matches picDatObj.conditionalId and commits conCurObj.id on click. */ }


										<span className='cnd-pill-name'>{ conCurObj.name }</span>{ /* What: Pill Name Span Element. Why: Every conditional pill needs its own visible name. How: This renders conCurObj's own name. */ }

										<span className='cnd-pill-mode'>{ ( SED_NAM_OBJ.MOD_DEF_OBJ[ conCurObj.mode ] || {} ).labStr || conCurObj.mode }</span>{ /* What: Pill Mode Span Element. Why: Every conditional pill also shows its own mode label. How: This looks up conCurObj's own mode in SED_NAM_OBJ.MOD_DEF_OBJ, falling back to the raw mode key. */ }


									</button>


								) ) }


							</div>


						) : ( // What: No Conditionals Branch. Why: With no conditionals to attach, the rail is replaced by a plain explanatory message. How: This renders the else branch, taken while conIteArr is empty.


							<p className='rd-cnd-empty'>No conditionals yet. Create one in the Conditionals section below, then attach it here.</p> // What: Empty Rail Paragraph Element. Why: With no conditionals yet, the rail explains where to create one. How: This renders a fixed message pointing at the Conditionals section.


						) }


					</div>


				</ColDisCom>



				<div className='sched-line'>{ /* What: Daily Line Div Element. Why: The daily-generator membership toggle needs its own labeled row. How: This wraps the label/sub text and the switch button below. */ }


					<span className='sched-line-label'>{ /* What: Daily Label Span Element. Why: The toggle's own name and live explanation belong together. How: This wraps the lbl and sub spans below. */ }


						<span className='sched-line-lbl'>In the daily generator</span>{ /* What: Daily Label Span Element. Why: The row needs its own literal name. How: This renders the literal text "In the daily generator". */ }

						<span
							key={ incDaiBoo ? 'on' : 'off' }

							className='sched-line-sub set-sub-fade'
						>{ /* What: Daily Sub Span Element. Why: The row needs a live one-line explanation, cross-faded via its own key change. How: This renders whichever of the 2 explanations below matches incDaiBoo. */ }


							{ incDaiBoo // What: Daily Membership Check. Why: The explanation depends on whether the picker is in the daily generator. How: This picks one of the 2 phrases below based on incDaiBoo.


								? <>will run <strong>every time</strong> the Today page's daily generator is run</> // What: Daily Phrase. Why: A member picker runs every time the generator does. How: This renders a fixed explanation.

								: <>can only be <strong>run manually</strong> in the Pickers tab</> // What: Manual Phrase. Why: A non-member picker can only be run by hand. How: This renders a fixed explanation pointing at the Pickers tab.


							}


						</span>


					</span>

					<button
						className={ ` switch   ${ incDaiBoo ? 'is-on' : '' } ` }

						aria-label={ `${ incDaiBoo ? 'Remove from' : 'Add to' } the daily generator` }
						aria-pressed={ incDaiBoo }

						onClick={ () => { // What: On Click Handler. Why: The switch adds or removes this picker from the daily generator. How: This builds the next membership list, then commits it through daiPicFun.


							const nexIdeArr = incDaiBoo ? daiIdeArr.filter( ( curIdeStr ) => curIdeStr !== picDatObj.id ) : [ ...daiIdeArr, picDatObj.id ]; // What: Next Identifier Array. Why: Toggling membership means either removing or adding this picker's own id. How: This filters picDatObj.id out when currently a member, or appends it when not.


							actStoObj.daiPicFun( nexIdeArr ); // What: Set Daily Pickers Call. Why: The toggle only takes effect once the new membership list is actually committed. How: This writes nexIdeArr as the app's own daily-generator membership.


						} }
					><i />{ /* What: Switch Dot Element. Why: This is the switch's own purely decorative sliding knob. How: This renders empty, positioned entirely via CSS off the "is-on" class on its parent button. */ }</button>{ /* What: Daily Switch Button Element. Why: This is the actual on/off control for daily-generator membership. How: This adds or removes picDatObj.id from daiIdeArr on click. */ }


				</div>



				<ColDisCom open={ incDaiBoo }>{ /* What: Collapse Disclosure Component. Why: The full cadence/days/holiday schedule only makes sense while this picker is actually in the daily generator. How: This opens only while incDaiBoo is true. */ }


					<React.Fragment>{ /* What: Schedule Fragment Element. Why: The 3 schedule rows below are true siblings with no shared wrapper of their own. How: This groups the cadence, days, and holiday rows without adding an extra DOM node. */ }


						<div className='sched-line'>{ /* What: Cadence Line Div Element. Why: The cadence (how often) control needs its own labeled row. How: This wraps the label/sub text and the cadence selects below. */ }


							<span className='sched-line-label'>{ /* What: Cadence Label Span Element. Why: The row's own name/help tip and live explanation belong together. How: This wraps the lbl row and sub span below. */ }


								<span className='sched-line-lbl pie-lbl-row'>{ /* What: Cadence Label Span Element. Why: The row needs its own literal name plus a help tip beside it. How: This renders the text "How often?" followed by the InfTipCom below. */ }How often?


									<InfTipCom
										className='pie-help pie-help--sm'

										labTexStr={ CAD_NAM_OBJ.tipMesFun( picDatObj.cadence ) }
									>?</InfTipCom>{ /* What: Info Tip Component. Why: The cadence choice needs a fuller explanation available on demand. How: This shows CAD_NAM_OBJ's own tip text for the picker's current cadence. */ }


								</span>

								<span
									key={ ( picDatObj.cadence || 'daily' ) + ( picDatObj.anchorDow ?? '' ) + ( picDatObj.anchorDom ?? '' ) + ( picDatObj.anchorMonth ?? '' ) + ( picDatObj.anchorDay ?? '' ) + ( picDatObj.dateMode ?? '' ) + ( picDatObj.nthOrdinal ?? '' ) + ( picDatObj.nthWeekday ?? '' ) }

									className='sched-line-sub set-sub-fade'
								>{ /* What: Cadence Sub Span Element. Why: The row needs a live one-line summary of the exact configured schedule, cross-faded via its own composite key. How: This computes and returns the matching summary JSX for the picker's current cadence/anchor fields. */ }


									{ ( () => { // What: Cadence Summary Function. Why: The summary depends on cadence, anchor and date mode, which is too much branching for one inline expression. How: This immediately invokes an arrow function that returns the matching phrase.


										const curCadStr = picDatObj.cadence || 'daily';                                                                                                 // What: Current Cadence String. Why: Every branch below needs the picker's own resolved cadence. How: This reads picDatObj.cadence, defaulting to 'daily'.
										const dayFulArr = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];                                             // What: Day Full Array. Why: The weekly/monthly/yearly branches below all need full weekday names. How: This is indexed by anchorDow/nthWeekday below.
										const monFulArr = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]; // What: Month Full Array. Why: The yearly branch below needs the full month name. How: This is indexed by anchorMonth below.


										const ordSufFun = ( ordValNum ) => { // What: Ordinal Suffix Function. Why: Every date-based branch below needs its own day number spelled with the correct "1st/2nd/3rd/4th" suffix. How: This picks the matching suffix from ordSufArr, handling the 11th/12th/13th exception via the mod-100 remainder.


											const sufTexArr = [ 'th', 'st', 'nd', 'rd' ]; // What: Suffix Text Array. Why: Every English ordinal suffix boils down to one of just these 4 words. How: This is indexed by the mod-100 remainder below.
											const lasTwoNum = ordValNum % 100;            // What: Last Two Number. Why: English ordinal suffixes are decided by a number's own last two digits (11th/12th/13th are the exceptions). How: This takes ordValNum mod 100.



											return ordValNum + ( sufTexArr[ ( lasTwoNum - 20 ) % 10 ] || sufTexArr[ lasTwoNum ] || sufTexArr[ 0 ] ); // What: Ordinal Suffix Return. Why: The caller needs the number with its own suffix attached. How: This tries the 20+ remainder rule first, then the teen/low-number lookup, falling back to 'th'.


										};


										const isaNthBoo = picDatObj.dateMode === 'nthWeekday';                     // What: Is-A Nth Boolean. Why: Monthly/yearly cadences can anchor either to a fixed date or to an "nth weekday", which read very differently. How: This checks picDatObj.dateMode.
										const taiEndStr = ', and the pick will persist until marked as completed'; // What: Tail End String. Why: Every non-daily branch below ends with the same trailing clause. How: This is appended to each branch's own JSX below.



										if ( curCadStr === 'daily' ) return ( CAD_OPT_ARR.find( ( optCurObj ) => optCurObj.keyStr === 'daily' ) || {} ).subEle; // What: Daily Branch Return. Why: The daily case reuses CadConCom's own canonical sub-explanation rather than duplicating it. How: This looks up the 'daily' entry in CAD_OPT_ARR.



										if ( curCadStr === 'weekly' ) return <>surfaces once a week, <strong>every { dayFulArr[ picDatObj.anchorDow ?? 0 ] }</strong>{ taiEndStr }</>; // What: Weekly Branch Return. Why: A weekly cadence just needs its own anchor weekday named. How: This reads picDatObj.anchorDow into dayFulArr.



										if ( curCadStr === 'monthly' ) { // What: Monthly Branch Guard. Why: A monthly cadence reads differently depending on whether it's anchored to a date or an nth weekday. How: This returns one of 2 summaries based on isaNthBoo.


											return isaNthBoo // What: Monthly Summary Return. Why: A monthly cadence reads differently anchored to a date vs. an nth weekday. How: This returns one of the 2 summaries below based on isaNthBoo.
												? <>surfaces once a month, <strong>on the { ordSufFun( picDatObj.nthOrdinal ?? 1 ) } { dayFulArr[ picDatObj.nthWeekday ?? 0 ] }</strong>{ taiEndStr }</> // What: Nth-Weekday Monthly Phrase. Why: An nth-weekday anchor names its ordinal and weekday, e.g. "the 2nd Tuesday". How: This reads nthOrdinal and nthWeekday.
												: <>surfaces once a month, <strong>on the { ordSufFun( picDatObj.anchorDom ?? 1 ) }</strong>{ taiEndStr }</>;                                            // What: Date Monthly Phrase. Why: A date anchor names its day of the month, e.g. "the 15th". How: This reads anchorDom.


										}



										return isaNthBoo // What: Yearly Branch Return. Why: The only remaining cadence is yearly, which also reads differently anchored to a date vs. an nth weekday. How: This returns one of 2 summaries based on isaNthBoo.
											? <>surfaces once a year, <strong>on the { ordSufFun( picDatObj.nthOrdinal ?? 1 ) } { dayFulArr[ picDatObj.nthWeekday ?? 0 ] } of { monFulArr[ ( picDatObj.anchorMonth ?? 1 ) - 1 ] }</strong>{ taiEndStr }</> // What: Nth-Weekday Yearly Phrase. Why: An nth-weekday anchor names its ordinal, weekday and month, e.g. "the 2nd Tuesday of June". How: This reads nthOrdinal, nthWeekday and anchorMonth.
											: <>surfaces once a year, <strong>on { monFulArr[ ( picDatObj.anchorMonth ?? 1 ) - 1 ] } { ordSufFun( picDatObj.anchorDay ?? 1 ) }</strong>{ taiEndStr }</>;                                                   // What: Date Yearly Phrase. Why: A date anchor names its month and day, e.g. "June 15th". How: This reads anchorMonth and anchorDay.


									} )() }


								</span>


							</span>

							<div className='sched-cad-ctls'>{ /* What: Cadence Controls Div Element. Why: The cadence dropdown plus every mode-specific anchor select need their own grouped row. How: This renders the cadence select, then whichever anchor selects match the current cadence/dateMode. */ }


								<select
									className='np-input rd-cad-sel'

									value={ picDatObj.cadence || 'daily' }

									aria-label='Cadence'

									onChange={ ( chaEveObj ) => actStoObj.updPicFun( picDatObj.id, { cadence : chaEveObj.target.value } ) }
								>{ /* What: Cadence Select Element. Why: This is the top-level "how often" choice. How: This commits its own value directly as the picker's own cadence field. */ }


									<option value='daily'>Daily</option>{ /* What: Daily Option Element. Why: This choice means the picker surfaces every day. How: Selecting it commits 'daily'. */ }

									<option value='weekly'>Weekly</option>{ /* What: Weekly Option Element. Why: This choice means the picker surfaces once a week. How: Selecting it commits 'weekly'. */ }

									<option value='monthly'>Monthly</option>{ /* What: Monthly Option Element. Why: This choice means the picker surfaces once a month. How: Selecting it commits 'monthly'. */ }

									<option value='yearly'>Yearly</option>{ /* What: Yearly Option Element. Why: This choice means the picker surfaces once a year. How: Selecting it commits 'yearly'. */ }


								</select>

								{ picDatObj.cadence === 'weekly' && ( // What: Weekly Anchor Check. Why: Only a weekly cadence has a single anchor-weekday select. How: This renders the select only while picDatObj.cadence is 'weekly'.


									<select
										className='np-input rd-cad-sel'

										value={ picDatObj.anchorDow ?? 0 }

										aria-label='Anchor weekday'

										onChange={ ( chaEveObj ) => actStoObj.updPicFun( picDatObj.id, { anchorDow : parseInt( chaEveObj.target.value ) } ) }
									>{ /* What: Anchor Weekday Select Element. Why: A weekly cadence needs exactly one weekday to anchor to. How: This commits the chosen index as picDatObj.anchorDow. */ }


										{ [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ].map( ( dayNamStr, dayIndNum ) => ( // What: Weekday Option List Render. Why: One option is needed per real weekday. How: This maps the fixed weekday-name array to one option per entry, keyed by its own dayIndNum.


											<option
												key={ dayIndNum }

												value={ dayIndNum }
											>{ dayNamStr }</option> // What: Weekday Option Element. Why: Each weekday needs its own selectable option. How: This renders dayNamStr, valued by its weekday index.


										) ) }


									</select>


								) }

								{ ( picDatObj.cadence === 'monthly' || picDatObj.cadence === 'yearly' ) && ( // What: Date Mode Check. Why: Only monthly/yearly cadences let the user choose between a fixed date and an nth weekday. How: This renders the select only while picDatObj.cadence is 'monthly' or 'yearly'.


									<select
										className='np-input rd-cad-sel'

										value={ picDatObj.dateMode === 'nthWeekday' ? 'nthWeekday' : 'date' }

										aria-label='Day selection'

										onChange={ ( chaEveObj ) => actStoObj.updPicFun( picDatObj.id, { dateMode : chaEveObj.target.value } ) }
									>{ /* What: Date Mode Select Element. Why: This is the switch between anchoring to a fixed date vs. an nth weekday. How: This commits its own value directly as the picker's own dateMode field. */ }


										<option value='date'>Date</option>{ /* What: Date Option Element. Why: This choice means the anchor is a fixed date. How: Selecting it commits 'date'. */ }

										<option value='nthWeekday'>Weekday</option>{ /* What: Weekday Option Element. Why: This choice means the anchor is an nth weekday, e.g. the 2nd Tuesday. How: Selecting it commits 'nthWeekday'. */ }


									</select>


								) }



								{ picDatObj.cadence === 'monthly' && ( picDatObj.dateMode === 'nthWeekday' ? ( // What: Monthly Anchor Check. Why: A monthly cadence's own anchor selects differ entirely depending on dateMode. How: This renders the nth-weekday pair when dateMode is 'nthWeekday', otherwise the single date-of-month select.


									<React.Fragment>{ /* What: Nth Weekday Fragment Element. Why: The week-of-month and weekday selects are true siblings with no shared wrapper of their own. How: This groups both selects without adding an extra DOM node. */ }


										<select
											className='np-input rd-cad-sel'

											value={ picDatObj.nthOrdinal ?? 1 }

											aria-label='Week of the month'

											onChange={ ( chaEveObj ) => actStoObj.updPicFun( picDatObj.id, { nthOrdinal : parseInt( chaEveObj.target.value ) } ) }
										>{ /* What: Nth Ordinal Select Element. Why: An nth-weekday monthly cadence needs its own "first/second/.../last" ordinal. How: This commits the chosen number as picDatObj.nthOrdinal. */ }


											{ [ 1, 2, 3, 4, 5 ].map( ( ordValNum ) => ( // What: Ordinal Option List Render. Why: One option is needed per possible occurrence, 1st through 5th. How: This maps the fixed [1..5] array to one option per entry, keyed by its own ordValNum, labeled via CAD_NAM_OBJ.sumCadFun.


												<option
													key={ ordValNum }

													value={ ordValNum }
												>{ CAD_NAM_OBJ.sumCadFun( { anchorDom : ordValNum, cadence : 'monthly' } ).split( '· ' )[ 1 ] }</option> // What: Ordinal Option Element. Why: Each week-of-month ordinal needs its own selectable option. How: This reuses sumCadFun to spell the ordinal, e.g. "2nd".


											) ) }


										</select>

										<select
											className='np-input rd-cad-sel'

											value={ picDatObj.nthWeekday ?? 0 }

											aria-label='Weekday'

											onChange={ ( chaEveObj ) => actStoObj.updPicFun( picDatObj.id, { nthWeekday : parseInt( chaEveObj.target.value ) } ) }
										>{ /* What: Nth Weekday Select Element. Why: An nth-weekday monthly cadence also needs its own target weekday. How: This commits the chosen index as picDatObj.nthWeekday. */ }


											{ [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ].map( ( dayNamStr, dayIndNum ) => ( // What: Weekday Option List Render. Why: One option is needed per real weekday. How: This maps the fixed weekday-name array to one option per entry, keyed by its own dayIndNum.


												<option
													key={ dayIndNum }

													value={ dayIndNum }
												>{ dayNamStr }</option> // What: Weekday Option Element. Why: Each weekday needs its own selectable option. How: This renders dayNamStr, valued by its weekday index.


											) ) }


										</select>


									</React.Fragment>


								) : ( // What: Anchor Dom Branch. Why: A date-anchored monthly cadence needs its own plain day-of-month select instead. How: This renders the else branch, taken while dateMode isn't 'nthWeekday'.


									<select
										className='np-input rd-cad-sel'

										value={ picDatObj.anchorDom ?? 1 }

										aria-label='Anchor day of month'

										onChange={ ( chaEveObj ) => actStoObj.updPicFun( picDatObj.id, { anchorDom : parseInt( chaEveObj.target.value ) } ) }
									>{ /* What: Anchor Dom Select Element. Why: A date-anchored monthly cadence needs its own day-of-month. How: This commits the chosen number as picDatObj.anchorDom. */ }


										{ Array.from( Array( 31 ).keys(), ( arrIndNum ) => arrIndNum + 1 ).map( ( domValNum ) => ( // What: Day Of Month Option List Render. Why: One option is needed per possible day of month, 1 through 31. How: This maps a generated 1-31 array to one option per entry, keyed by its own domValNum, labeled via CAD_NAM_OBJ.sumCadFun.


											<option
												key={ domValNum }

												value={ domValNum }
											>{ CAD_NAM_OBJ.sumCadFun( { anchorDom : domValNum, cadence : 'monthly' } ).split( '· ' )[ 1 ] }</option> // What: Day Option Element. Why: Each day of the month needs its own selectable option. How: This reuses sumCadFun to spell the ordinal day, e.g. "15th".


										) ) }


									</select>


								) ) }



								{ picDatObj.cadence === 'yearly' && ( picDatObj.dateMode === 'nthWeekday' ? ( // What: Yearly Anchor Check. Why: A yearly cadence's own anchor selects also differ entirely depending on dateMode. How: This renders the nth-weekday trio when dateMode is 'nthWeekday', otherwise the month+day pair.


									<React.Fragment>{ /* What: Nth Weekday Fragment Element. Why: The week-of-month, weekday, and month selects are true siblings with no shared wrapper of their own. How: This groups all 3 selects without adding an extra DOM node. */ }


										<select
											className='np-input rd-cad-sel'

											value={ picDatObj.nthOrdinal ?? 1 }

											aria-label='Week of the month'

											onChange={ ( chaEveObj ) => actStoObj.updPicFun( picDatObj.id, { nthOrdinal : parseInt( chaEveObj.target.value ) } ) }
										>{ /* What: Nth Ordinal Select Element. Why: An nth-weekday yearly cadence needs its own "first/second/.../last" ordinal. How: This commits the chosen number as picDatObj.nthOrdinal. */ }


											{ [ 1, 2, 3, 4, 5 ].map( ( ordValNum ) => ( // What: Ordinal Option List Render. Why: One option is needed per possible occurrence, 1st through 5th. How: This maps the fixed [1..5] array to one option per entry, keyed by its own ordValNum, labeled via CAD_NAM_OBJ.sumCadFun.


												<option
													key={ ordValNum }

													value={ ordValNum }
												>{ CAD_NAM_OBJ.sumCadFun( { anchorDom : ordValNum, cadence : 'monthly' } ).split( '· ' )[ 1 ] }</option> // What: Ordinal Option Element. Why: Each week-of-month ordinal needs its own selectable option. How: This reuses sumCadFun to spell the ordinal, e.g. "2nd".


											) ) }


										</select>

										<select
											className='np-input rd-cad-sel'

											value={ picDatObj.nthWeekday ?? 0 }

											aria-label='Weekday'

											onChange={ ( chaEveObj ) => actStoObj.updPicFun( picDatObj.id, { nthWeekday : parseInt( chaEveObj.target.value ) } ) }
										>{ /* What: Nth Weekday Select Element. Why: An nth-weekday yearly cadence also needs its own target weekday. How: This commits the chosen index as picDatObj.nthWeekday. */ }


											{ [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ].map( ( dayNamStr, dayIndNum ) => ( // What: Weekday Option List Render. Why: One option is needed per real weekday. How: This maps the fixed weekday-name array to one option per entry, keyed by its own dayIndNum.


												<option
													key={ dayIndNum }

													value={ dayIndNum }
												>{ dayNamStr }</option> // What: Weekday Option Element. Why: Each weekday needs its own selectable option. How: This renders dayNamStr, valued by its weekday index.


											) ) }


										</select>

										<select
											className='np-input rd-cad-sel'

											value={ picDatObj.anchorMonth ?? 1 }

											aria-label='Anchor month'

											onChange={ ( chaEveObj ) => actStoObj.updPicFun( picDatObj.id, { anchorMonth : parseInt( chaEveObj.target.value ) } ) }
										>{ /* What: Anchor Month Select Element. Why: An nth-weekday yearly cadence also needs its own target month. How: This commits the chosen 1-based month number as picDatObj.anchorMonth. */ }


											{ [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ].map( ( monNamStr, monIndNum ) => ( // What: Month Option List Render. Why: One option is needed per real month. How: This maps the fixed month-abbreviation array to one option per entry, keyed by its own 1-indexed monIndNum.


												<option
													key={ monIndNum }

													value={ monIndNum + 1 }
												>{ monNamStr }</option> // What: Month Option Element. Why: Each month needs its own selectable option. How: This renders monNamStr, valued by its 1-based month number.


											) ) }


										</select>


									</React.Fragment>


								) : ( // What: Date Anchor Branch. Why: A date-anchored yearly cadence needs its own plain month-and-day selects instead. How: This renders the else branch, taken while dateMode isn't 'nthWeekday'.


									<React.Fragment>{ /* What: Date Anchor Fragment Element. Why: The month and day-of-month selects are true siblings with no shared wrapper of their own. How: This groups both selects without adding an extra DOM node. */ }


										<select
											className='np-input rd-cad-sel'

											value={ picDatObj.anchorMonth ?? 1 }

											aria-label='Anchor month'

											onChange={ ( chaEveObj ) => actStoObj.updPicFun( picDatObj.id, { anchorMonth : parseInt( chaEveObj.target.value ) } ) }
										>{ /* What: Anchor Month Select Element. Why: A date-anchored yearly cadence needs its own target month. How: This commits the chosen 1-based month number as picDatObj.anchorMonth. */ }


											{ [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ].map( ( monNamStr, monIndNum ) => ( // What: Month Option List Render. Why: One option is needed per real month. How: This maps the fixed month-abbreviation array to one option per entry, keyed by its own 1-indexed monIndNum.


												<option
													key={ monIndNum }

													value={ monIndNum + 1 }
												>{ monNamStr }</option> // What: Month Option Element. Why: Each month needs its own selectable option. How: This renders monNamStr, valued by its 1-based month number.


											) ) }


										</select>

										<select
											className='np-input rd-cad-sel'

											value={ Math.min( picDatObj.anchorDay ?? 1, CAD_NAM_OBJ.dimCouFun( 2024, picDatObj.anchorMonth ?? 1 ) ) }

											aria-label='Anchor day'

											onChange={ ( chaEveObj ) => actStoObj.updPicFun( picDatObj.id, { anchorDay : parseInt( chaEveObj.target.value ) } ) }
										>{ /* What: Anchor Day Select Element. Why: A date-anchored yearly cadence also needs its own day-of-month, clamped to whatever the chosen month actually allows. How: This commits the chosen number as picDatObj.anchorDay. */ }


											{ Array.from( Array( CAD_NAM_OBJ.dimCouFun( 2024, picDatObj.anchorMonth ?? 1 ) ).keys(), ( arrIndNum ) => arrIndNum + 1 ).map( ( domValNum ) => ( // What: Anchor Day Option List Render. Why: One option is needed per possible day within the anchor month's own real length. How: This maps a generated array sized by CAD_NAM_OBJ.dimCouFun to one option per entry, keyed by its own domValNum.


												<option
													key={ domValNum }

													value={ domValNum }
												>{ domValNum }</option> // What: Day Option Element. Why: Each day of the month needs its own selectable option. How: This renders domValNum as both label and value.


											) ) }


										</select>


									</React.Fragment>


								) ) }


							</div>


						</div>


						<div className='sched-line'>{ /* What: Days Line Div Element. Why: The weekday multi-select needs its own labeled row. How: This wraps the label/sub text and the WeeChiCom control below. */ }


							<span className='sched-line-label'>{ /* What: Days Label Span Element. Why: The row's own name and live explanation belong together. How: This wraps the lbl and sub spans below. */ }


								<span className='sched-line-lbl'>Days</span>{ /* What: Days Label Span Element. Why: The row needs its own literal name. How: This renders the literal text "Days". */ }

								<span
									key={ ( picDatObj.daysOfWeek || [] ).join( ',' ) }

									className='sched-line-sub set-sub-fade'
								>{ /* What: Days Sub Span Element. Why: The row needs a live one-line summary of the chosen weekdays, cross-faded via its own key. How: This lists every chosen day, or a prompt when none are chosen. */ }


									{ ( picDatObj.daysOfWeek && picDatObj.daysOfWeek.length ) // What: Chosen Days Check. Why: The summary depends on whether any weekday is chosen. How: This picks one of the 2 phrases below based on daysOfWeek having entries.


										? <>runs in the daily generator every <strong>{ [ ...picDatObj.daysOfWeek ].sort( ( dayOneNum, dayTwoNum ) => dayOneNum - dayTwoNum ).map( ( dayNumVal ) => [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ][ dayNumVal ] ).join( ', ' ) }</strong></> // What: Chosen Days Phrase. Why: At least one day is chosen, so the summary lists them in week order. How: This sorts a copy of daysOfWeek, maps each to its abbreviation, and joins them.

										: 'pick at least one day' // What: No Days Phrase. Why: With no day chosen the picker never runs, so the row prompts for one. How: This renders a fixed prompt.


									}


								</span>


							</span>



							<WeeChiCom
								locDayNum={ picDatObj.cadence === 'weekly' ? ( picDatObj.anchorDow ?? 0 ) : null }
								locTipStr={ picDatObj.cadence === 'weekly' ? CAD_NAM_OBJ.locTipFun( picDatObj.anchorDow ?? 0 ) : '' }
								sizValStr='sm'
								value={ picDatObj.daysOfWeek || [ 0, 1, 2, 3, 4, 5, 6 ] }

								onChange={ ( dayValArr ) => actStoObj.updPicFun( picDatObj.id, { daysOfWeek : dayValArr } ) }
							/>{ /* What: Weekday Chips Component. Why: This is the actual multi-select for which weekdays this picker runs on. How: This locks the anchor weekday when picDatObj.cadence is 'weekly', otherwise every day is freely toggleable. */ }


						</div>

						<div className='sched-line'>{ /* What: Holiday Line Div Element. Why: The skip-on-holidays toggle needs its own labeled row. How: This wraps the label/sub text and the switch button below. */ }


							<span className='sched-line-label'>{ /* What: Holiday Label Span Element. Why: The toggle's own name and live explanation belong together. How: This wraps the lbl and sub spans below. */ }


								<span className='sched-line-lbl'>Skip on holidays</span>{ /* What: Holiday Label Span Element. Why: The row needs its own literal name. How: This renders the literal text "Skip on holidays". */ }

								<span
									key={ picDatObj.skipHolidays ? 'on' : 'off' }

									className='sched-line-sub set-sub-fade'
								>{ /* What: Holiday Sub Span Element. Why: The row needs a live one-line explanation, cross-faded via its own key change. How: This renders whichever of the 2 explanations below matches picDatObj.skipHolidays. */ }


									{ picDatObj.skipHolidays // What: Skip Holidays Check. Why: The explanation depends on the holiday setting. How: This picks one of the 2 phrases below based on skipHolidays.


										? <><strong>will not run</strong> in the daily generator on holidays</> // What: Skip Holidays Phrase. Why: The picker sits out holidays. How: This renders a fixed explanation.

										: <><strong>will run</strong> in the daily generator on holidays</> // What: Run Holidays Phrase. Why: The picker runs on holidays like any other day. How: This renders a fixed explanation.


									}


								</span>


							</span>

							<button
								className={ ` switch   ${ picDatObj.skipHolidays ? 'is-on' : '' } ` }

								aria-label='Skip on holidays'
								aria-pressed={ !!picDatObj.skipHolidays }

								onClick={ () => actStoObj.updPicFun( picDatObj.id, { skipHolidays : !picDatObj.skipHolidays } ) }
							><i />{ /* What: Switch Dot Element. Why: This is the switch's own purely decorative sliding knob. How: This renders empty, positioned entirely via CSS off the "is-on" class on its parent button. */ }</button>{ /* What: Holiday Switch Button Element. Why: This is the actual on/off control for skipping holidays. How: This flips picDatObj.skipHolidays on click. */ }


						</div>


					</React.Fragment>


				</ColDisCom>



				<ColDisCom open={ !incDaiBoo }>{ /* What: Collapse Disclosure Component. Why: The "runs on demand only" note only makes sense while this picker is NOT in the daily generator. How: This opens only while incDaiBoo is false. */ }


					<div className='sched-off-note'>Runs on demand only, not in the daily generator.</div>{ /* What: Off Note Div Element. Why: A picker outside the daily generator gets a short reminder that it only runs by hand. How: This renders a fixed note. */ }


				</ColDisCom>


			</div>


			<div className='rd-ctl-group rd-ctl-group--items'>{ /* What: Item Controls Group Div Element. Why: Avoid-duplicates and Fill/Refill both act on this picker's ITEMS rather than its own type/schedule, so they get their own separate group. How: This wraps the subhead, the avoid-duplicates row, and the Fill/Refill row below. */ }


				<div className='rd-ctl-subhead'>Item Controls</div>{ /* What: Item Controls Subhead Div Element. Why: Every Controls group needs its own labeled subhead. How: This renders the literal text "Item Controls". */ }

				<div className='sched-line'>{ /* What: Duplicates Line Div Element. Why: The avoid-duplicate-items toggle needs its own labeled row. How: This wraps the label/sub text and the switch button below. */ }


					<span className='sched-line-label'>{ /* What: Duplicates Label Span Element. Why: The toggle's own name and live explanation belong together. How: This wraps the lbl and sub spans below. */ }


						<span className='sched-line-lbl'>Avoid duplicate items</span>{ /* What: Duplicates Label Span Element. Why: The row needs its own literal name. How: This renders the literal text "Avoid duplicate items". */ }

						<span
							key={ picDatObj.avoidDuplicates ? 'on' : 'off' }

							className='sched-line-sub set-sub-fade'
						>{ /* What: Duplicates Sub Span Element. Why: The row needs a live one-line explanation, cross-faded via its own key change. How: This renders whichever of the 2 explanations below matches picDatObj.avoidDuplicates. */ }


							{ picDatObj.avoidDuplicates // What: Avoid Duplicates Check. Why: The explanation depends on the duplicates setting. How: This picks one of the 2 phrases below based on avoidDuplicates.


								? <><strong>won't pick</strong> an item whose name is already on today's todo list</> // What: Avoid Duplicates Phrase. Why: The picker skips items already on today's list. How: This renders a fixed explanation.

								: <><strong>may pick</strong> an item even if its name is already on today's todo list</> // What: Allow Duplicates Phrase. Why: The picker may repeat an item already on today's list. How: This renders a fixed explanation.


							}


						</span>


					</span>

					<button
						className={ ` switch   ${ picDatObj.avoidDuplicates ? 'is-on' : '' } ` }

						aria-label='Avoid duplicate items'
						aria-pressed={ !!picDatObj.avoidDuplicates }

						onClick={ () => actStoObj.updPicFun( picDatObj.id, { avoidDuplicates : !picDatObj.avoidDuplicates } ) }
					><i />{ /* What: Switch Dot Element. Why: This is the switch's own purely decorative sliding knob. How: This renders empty, positioned entirely via CSS off the "is-on" class on its parent button. */ }</button>{ /* What: Duplicates Switch Button Element. Why: This is the actual on/off control for avoiding duplicate items. How: This flips picDatObj.avoidDuplicates on click. */ }


				</div>



				<ColDisCom open={ isaEasBoo }>{ /* What: Collapse Disclosure Component. Why: Fill/Refill only makes sense for an ease-mode picker. How: This opens only while isaEasBoo is true. */ }


					<div className={ ` ease-config   ${ isaDowBoo ? 'ease-config--down' : 'ease-config--up' } ` }>{ /* What: Ease Config Div Element. Why: Help mode needs a pure selector hook to give this section mode-specific copy (Fill vs. Refill). How: This wraps whichever of the 2 mode-specific rows below matches picDatObj.mode. */ }


						{ picDatObj.mode === 'ease-up' && ( // What: Ease Up Check. Why: Only ease-up gets the "Fill" wording and action. How: This renders the Fill row only while picDatObj.mode is 'ease-up'.


							<div className='pie-row'>{ /* What: Fill Row Div Element. Why: The Fill label/summary and its button need their own row. How: This wraps the rowlabel div and the FilButCom below. */ }


								<div className='pie-rowlabel'>{ /* What: Fill Rowlabel Div Element. Why: The Fill label and its live summary belong together. How: This wraps the lbl and sub spans below. */ }


									<span className='pie-lbl'>Fill</span>{ /* What: Fill Label Span Element. Why: The row needs its own literal name. How: This renders the literal text "Fill". */ }

									<span className='pie-sub'>{ filSubEle }</span>{ /* What: Fill Sub Span Element. Why: The row needs a live summary of how many items still need charging. How: This renders filSubEle. */ }


								</div>



								<FilButCom
									isaDisBoo={ picIteArr.length > 0 && picIteArr.every( ( iteCurObj ) => ( iteCurObj.value ?? 0 ) >= ( picDatObj.threshold ?? 100 ) ) }
									labTexStr='Fill all'

									onFilActFun={ () => actStoObj.filPicFun( picDatObj.id ) }
								/>{ /* What: Fill Button Component. Why: This is the actual bulk-charge action for an ease-up picker. How: This is disabled once every item is already at threshold, and calls filPicFun on click. */ }


							</div>


						) }


						{ picDatObj.mode === 'ease-down' && ( // What: Ease Down Check. Why: Only ease-down gets the "Refill" wording and action. How: This renders the Refill row only while picDatObj.mode is 'ease-down'.


							<div className='pie-row'>{ /* What: Refill Row Div Element. Why: The Refill label/summary and its button need their own row. How: This wraps the rowlabel div and the FilButCom below. */ }


								<div className='pie-rowlabel'>{ /* What: Refill Rowlabel Div Element. Why: The Refill label and its live summary belong together. How: This wraps the lbl and sub spans below. */ }


									<span className='pie-lbl'>Refill</span>{ /* What: Refill Label Span Element. Why: The row needs its own literal name. How: This renders the literal text "Refill". */ }

									<span className='pie-sub'>{ filSubEle }</span>{ /* What: Refill Sub Span Element. Why: The row needs a live summary of how many items still need charging. How: This renders filSubEle. */ }


								</div>



								<FilButCom
									isaDisBoo={ picIteArr.length > 0 && picIteArr.every( ( iteCurObj ) => ( iteCurObj.value ?? 0 ) >= ( picDatObj.threshold ?? 100 ) ) }
									labTexStr='Refill all'

									onFilActFun={ () => actStoObj.filPicFun( picDatObj.id ) }
								/>{ /* What: Fill Button Component. Why: This is the actual bulk-charge action for an ease-down picker. How: This is disabled once every item is already at threshold, and calls filPicFun on click. */ }


							</div>


						) }


					</div>


				</ColDisCom>


			</div>



			<div className='rd-ctl-group rd-ctl-group--foot pk-ctl-foot'>{ /* What: Footer Group Div Element. Why: Delete/Cancel/Save (or the new-draft Cancel/Add-Items/Save variant) needs its own bottom group. How: This renders whichever of the 3 footer states below matches conDelBoo/isaNewBoo. */ }


				{ conDelBoo ? ( // What: Confirm Delete Check. Why: A real picker's Delete morphs the footer into an inline confirm before actually deleting. How: This renders the confirm row while conDelBoo is true.


					<div
						key='confirm'

						className='rd-pk-del-confirm'
					>{ /* What: Delete Confirm Div Element. Why: The confirm message and its own Cancel/Delete buttons need their own grouped row. How: This wraps the confirm message and the rem-del-actions row below. */ }


						<div className='confirm-msg'>Delete the &ldquo;{ picDatObj.name }&rdquo; picker? This will also delete its { picIteArr.length } { picIteArr.length === 1 ? 'item' : 'items' }. This can&rsquo;t be undone.</div>{ /* What: Confirm Msg Div Element. Why: A destructive action needs an explicit, specific warning before it happens. How: This names the picker and states exactly how many items will also be deleted. */ }

						<div className='rem-del-actions'>{ /* What: Delete Actions Div Element. Why: The confirm's own Cancel and Delete buttons need their own row. How: This wraps both ButBasCom instances below. */ }


							<ButBasCom
								kinValStr='ghost'
								sizValStr='sm'

								onClick={ () => setConDelBoo( false ) }
							>Cancel</ButBasCom>{ /* What: Button Base Component. Why: Backing out of the confirm should not delete anything. How: This just closes the confirm row. */ }



							<ButBasCom
								kinValStr='danger'
								sizValStr='sm'

								onClick={ () => ( onReqDelFun ? onReqDelFun() : actStoObj.delPicFun( picDatObj.id ) ) }
							>Delete</ButBasCom>{ /* What: Button Base Component. Why: This is the actual, final destructive action. How: This calls onReqDelFun when the caller wants to animate the removal itself, otherwise removes the picker directly. */ }


						</div>


					</div>


				) : isaNewBoo ? ( // What: Is-A New Draft Check. Why: A brand-new draft picker gets a no-Delete Cancel/Add-Items-then-Save footer instead of the normal one. How: This renders the new-draft row while isaNewBoo is true (and conDelBoo is false).


					<div
						key='foot-new'

						className='rd-ctl-foot-row rd-ctl-foot-row--new'
					>{ /* What: New Footer Row Div Element. Why: The new-draft footer's own Cancel/Save buttons need their own row. How: This wraps the rem-foot-right div below. */ }


						<div className='rem-foot-right'>{ /* What: Foot Right Div Element. Why: The Cancel and Save buttons anchor to the footer's own right edge. How: This wraps the ButBasCom and InfTipCom-wrapped ButBasCom below. */ }


							<ButBasCom
								kinValStr='ghost'
								sizValStr='sm'

								onClick={ () => { // What: On Click Handler. Why: Cancelling a brand-new draft must mark the close as explicit before discarding it. How: This marks cloWayRef, then calls onCanNewFun.


									cloWayRef.current = 'cancel'; // What: Close Way Mark. Why: The implicit-close guard must know this close was an explicit Cancel. How: This records 'cancel' on cloWayRef.

									onCanNewFun(); // What: Cancel New Call. Why: A brand-new draft's Cancel discards the whole picker. How: This calls the parent's own onCanNewFun.


								} }
							>Cancel</ButBasCom>{ /* What: Button Base Component. Why: A brand-new draft's Cancel discards the whole thing rather than reverting to a blank snapshot; cloWayRef is marked first so the implicit-close guard doesn't ALSO try to revert it. How: This marks cloWayRef then calls onCanNewFun. */ }



							<InfTipCom labTexStr={ fooTipStr }>{ /* What: Info Tip Component. Why: The footer button's own current disabled reason (or confirmation once ready) needs to be available on demand. How: This shows fooTipStr, wrapping the ButBasCom below. */ }


								<ButBasCom
									disabled={ fooDisBoo }
									kinValStr='primary'
									sizValStr='sm'

									onClick={ fooDisBoo ? undefined : () => { // What: On Click Handler. Why: The primary footer button only acts while it's enabled. How: This is undefined while fooDisBoo, otherwise it marks cloWayRef and runs fooActFun.


										cloWayRef.current = 'saved'; // What: Close Way Mark. Why: The implicit-close guard must know this close was an explicit Save. How: This records 'saved' on cloWayRef.

										fooActFun(); // What: Footer Action Call. Why: This runs the footer's current step, Add Items or Save. How: This calls fooActFun.


									} }
								>{ fooLabStr }</ButBasCom>{ /* What: Button Base Component. Why: This is the new-draft footer's own primary action, reading "Add Items" or "Save" depending on progress. How: This marks cloWayRef then calls fooActFun, disabled per fooDisBoo. */ }


							</InfTipCom>


						</div>


					</div>


				) : ( // What: Normal Footer Check. Why: An existing, non-draft picker gets the full Delete/Cancel/Save footer. How: This is the fallback branch once neither conDelBoo nor isaNewBoo applies.


					<div
						key='foot'

						className='rd-ctl-foot-row'
					>{ /* What: Foot Row Div Element. Why: Delete (left) and Cancel/Save (right) both belong in the same footer row. How: This wraps the Delete ButBasCom and the rem-foot-right div below. */ }


						<ButBasCom
							icoNamStr='traEle'
							kinValStr='danger'
							sizValStr='sm'

							onClick={ () => setConDelBoo( true ) }
						>Delete</ButBasCom>{ /* What: Button Base Component. Why: This opens the inline delete confirm rather than deleting immediately. How: This sets conDelBoo true on click. */ }



						<div className='rem-foot-right'>{ /* What: Foot Right Div Element. Why: Cancel and Save anchor to the footer's own right edge. How: This wraps both ButBasCom instances below. */ }


							<ButBasCom
								kinValStr='ghost'
								sizValStr='sm'

								onClick={ canConFun }
							>Cancel</ButBasCom>{ /* What: Button Base Component. Why: This discards every change made since Controls opened. How: This calls canConFun on click. */ }



							<ButBasCom
								kinValStr='ghost'
								sizValStr='sm'

								onClick={ savCloFun }
							>Save</ButBasCom>{ /* What: Button Base Component. Why: This keeps every change made since Controls opened. How: This calls savCloFun on click. */ }


						</div>


					</div>


				) }


			</div>


		</div>


	);


}

// #endregion PicConCom



// #region TabDatCom

/**
 * TabDatCom = Tab Data Component
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
 * @param props.actStoObj   - Action Store Object: {@link useAppStaFun}
 * @param props.onNavHomFun - On Navigate Home Function: Navigates back to the
 *                            Today tab.
 * @param props.onNavTabFun - On Navigate Tab Function: Switches to another tab
 *                            by id.
 * @param props.staAppObj   - State App Object: {@link useAppStaFun}
 *
 * @returns The Data tab's entire rendered content: its header, its
 * filters, the section sort bar, and the list of sections.
 *
 * @example
 * ```tsx
 * TabDatCom({ actStoObj, onNavHomFun, onNavTabFun, ... }) // => <TabDatCom />
 * ```
 *
*/

function TabDatCom ( { actStoObj, onNavHomFun, onNavTabFun, staAppObj } ) {


	// #region Tour Gating

	const touBusObj = useEmlTouFun();                                                   // What: Tour Bus Object. Why: Several controls below must disable themselves or highlight during specific onboarding tour steps. How: This reads the shared tour event bus's own touPhaStr/touIdeStr/touSteNum fields.
	const touActBoo = touBusObj.touPhaStr === 'tour';                                   // What: Tour Active Boolean. Why: Every tour-driven flag below only applies while a tour is actually running. How: This checks touBusObj.touPhaStr.
	const expTouBoo = touActBoo && touBusObj.touIdeStr === 'page-explore_data';         // What: Explore Tour Boolean. Why: The disable flags just below belong to the Data page tour. How: This checks the running tour's id.
	const ediTouBoo = touActBoo && touBusObj.touIdeStr === 'appfeature-feat_edit_item'; // What: Edit Tour Boolean. Why: The detXxx and hetXxx flags below belong to the Edit Items feature tour. How: This checks the running tour's id.


	const disGroBoo = expTouBoo && touBusObj.touSteNum === 1; // What: Disable Group Boolean. Why: Narrating what the Group filter does is the point of this tour step; letting it actually change would strand a later step's own target. How: This is true only during page-explore_data's own Step 1.
	const disShoBoo = expTouBoo && touBusObj.touSteNum === 3; // What: Disable Show Boolean. Why: Same reasoning as disGroBoo, for the Show filter row. How: This is true only during page-explore_data's own Step 3.
	const disCreBoo = expTouBoo && touBusObj.touSteNum === 6; // What: Disable Create Boolean. Why: Step 7 only points at the Create Picker button; actually clicking it would open a whole new draft form the tour knows nothing about and never cleans up. How: This is true only during page-explore_data's own Step 6.


	const detPicBoo = ediTouBoo && [ 3, 5, 6 ].includes( touBusObj.touSteNum ); // What: Disable-Edit-Tour Picker Boolean. Why: Steps 4/6/7 of the "edit your first item" tour all depend on this exact picker staying expanded as their own target. How: This guards the picker header's own collapse toggle during those 3 steps.
	const detConBoo = ediTouBoo && [ 5, 6 ].includes( touBusObj.touSteNum );    // What: Disable-Edit-Tour Control Boolean. Why: Steps 6/7 would let the highlighted box balloon to include Controls, which those steps were never about. How: This guards the Controls header's own toggle during those 2 steps.
	const detIteBoo = ediTouBoo && [ 3, 5, 6 ].includes( touBusObj.touSteNum ); // What: Disable-Edit-Tour Items Boolean. Why: Collapsing Items during steps 6/7 would hide the item rows/Add button those steps depend on. How: This guards the Items header's own toggle during all 3 steps.
	const detAddBoo = ediTouBoo && [ 5, 6 ].includes( touBusObj.touSteNum );    // What: Disable-Edit-Tour Add Boolean. Why: Step 6's own body text says this button is disabled for the tutorial, and a brand-new item would shift every row's position out from under its "click any of these" framing. How: This guards the Add button during steps 6/7.

	const tutProBoo = ONB_CHE_OBJ.tutProFun( staAppObj ); // What: Tutorial Progress Boolean. Why: Several add/edit controls (distinct from the detAddBoo tour above, which only runs AFTER this is always false) must stay disabled until the Welcome Tour's own checklist finishes. How: This calls the shared ONB_CHE_OBJ helper against the whole app state.

	const hetPicBoo = ediTouBoo && touBusObj.touSteNum === 1; // What: Highlight-Edit-Tour Picker Boolean. Why: Step 2 targets EVERY picker's own .cat section; a per-element fade (rather than the tour engine's default single-box pulse) is needed to show "any of these" rather than "this one group". How: This is true only during Step 1 (the step BEFORE the click it's preparing for).
	const hetConBoo = ediTouBoo && touBusObj.touSteNum === 2; // What: Highlight-Edit-Tour Control Boolean. Why: Step 3 targets a single Controls header. How: This is true only during Step 2.
	const hetIteBoo = ediTouBoo && touBusObj.touSteNum === 4; // What: Highlight-Edit-Tour Items Boolean. Why: Step 5 targets a single Items header. How: This is true only during Step 4.
	const hetRowBoo = ediTouBoo && touBusObj.touSteNum === 5; // What: Highlight-Edit-Tour Row Boolean. Why: Step 6 targets each item row's own .rd-item wrapper, using per-side borders rather than a shared outline. How: This is true only during Step 5.

	// #endregion Tour Gating



	// #region Help Mode

	const [ helOpeBoo, setHelOpeBoo ] = React.useState( false ); // What: Help Open Boolean And Setter. Why: Help mode needs its own on/off state, matching every other tab's own help toggle. How: This is flipped by HelButCom and read by HelOveCom/the seed effect below.

	const helExiFun = React.useCallback( () => setHelOpeBoo( false ), [] ); // What: Help Exit Function. Why: HelOveCom needs a stable close handler that doesn't change identity on every render. How: This just sets helOpeBoo false.


	React.useEffect( () => { // What: Help Seed Effect. Why: Help mode needs real pickers of every mode and reminders of every recurrence kind to show a representative "view and edit" section, but only while it's actually on. How: This seeds both disposable sample sets on, and clears both off.


		if ( helOpeBoo ) { // What: Seed Guard. Why: Turning help mode on should populate both sample sets together. How: This calls both seed helpers when helOpeBoo is true.


			sedPicFun( staAppObj, actStoObj ); // What: Seed Pickers Call. Why: Help mode needs sample pickers of every mode. How: This adds the hidden sample pickers.
			sedTasFun( staAppObj, actStoObj ); // What: Seed Tasks Call. Why: Help mode needs sample reminders of every recurrence kind. How: This adds the hidden sample reminders.


		}

		else { // What: Clear Guard. Why: Turning help mode off must remove both sample sets so they never leak into the user's real data view. How: This calls both clear helpers otherwise.


			clePicFun( actStoObj ); // What: Clear Pickers Call. Why: The sample pickers must not leak into the real data view. How: This removes them.
			cleTasFun( actStoObj ); // What: Clear Tasks Call. Why: The sample reminders must not leak either. How: This removes them.


		}


	}, [ helOpeBoo ] ); // What: Effect Dependency Array. Why: This only ever needs to reconsider itself when help mode's own on/off state changes. How: helOpeBoo is the single value this effect's own guard is built around.


	React.useEffect( () => () => { // What: Unmount Cleanup Effect. Why: Navigating away from this tab entirely must not leave help mode's own sample data behind. How: This returns a cleanup that clears both sample sets, run once on unmount.


		clePicFun( actStoObj ); // What: Clear Pickers Call. Why: Leaving the tab must not strand sample pickers. How: This removes them on unmount.
		cleTasFun( actStoObj ); // What: Clear Tasks Call. Why: Leaving the tab must not strand sample reminders. How: This removes them on unmount.


	}, [] ); // What: Effect Dependency Array. Why: This cleanup only needs to run once, on unmount. How: An empty array means the returned cleanup runs only when the tab goes away.

	// #endregion Help Mode



	// #region Item Editor State

	const [ opeIteStr, setOpeIteStr ] = React.useState( null ); // What: Open Item String And Setter. Why: Only one picker item across the whole page can be expanded for editing at a time, mirroring the Reminders list. How: This holds whichever item's own id is currently open, or null.
	const [ insIteStr, setInsIteStr ] = React.useState( null ); // What: Insert Item String And Setter. Why: A just-inserted row needs to play its own slide-in entrance exactly once. How: This holds whichever item's own id should currently play that entrance.

	const newIteRef = React.useRef( null ); // What: New Item Reference. Why: A brand-new, not-yet-kept item needs to be tracked so Cancel can discard the whole add instead of reverting to an empty snapshot. How: This holds whichever item's own id was just created, cleared once it's kept.
	const opeEdiRef = React.useRef( null ); // What: Open Editor Reference. Why: The open item's own row header (outside IteEdiCom) needs to call its own .keeSavFun() before closing, so an explicit close never gets treated as an implicit revert. How: This holds whichever IteEdiCom instance is currently open.
	const froIndRef = React.useRef( null ); // What: Frozen Index Reference. Why: freEdiFun needs one shared ref across every picker's own item list (only one item can be open at a time). How: This is passed straight through to freEdiFun below.


	const preOpeRef = React.useRef( null ); // What: Previous Open Reference. Why: The insert-entrance replay effect below needs to compare against whichever item was open on the PREVIOUS render. How: This starts null and is updated by the effect below on every change.


	React.useEffect( () => { // What: Insert Replay Effect. Why: Whenever an item's editor closes (Done, Cancel-revert, delete, or the row's own collapse chevron), it should replay the same insert-entrance treatment a freshly-created row gets, instead of silently snapping into its new sorted position. How: This detects the transition and flags the previously-open item's own id for insIteStr.


		const preIteStr = preOpeRef.current; // What: Previous Item String. Why: Detecting an actual close requires comparing against what was open before this render. How: This reads preOpeRef.current once.


		if ( preIteStr != null && preIteStr !== opeIteStr ) setInsIteStr( preIteStr ); // What: Replay Guard. Why: Only an item that WAS open and no longer is should replay its own entrance. How: This flags preIteStr for insIteStr only when both conditions hold.



		preOpeRef.current = opeIteStr; // What: Previous Open Update. Why: The next run of this effect needs to compare against whatever is open now. How: This overwrites preOpeRef with opeIteStr.


	}, [ opeIteStr ] ); // What: Effect Dependency Array. Why: This only ever needs to reconsider itself when which item is open actually changes. How: opeIteStr is the single value this effect's own guard is built around.



	const opeRowRef = React.useRef( null ); // What: Open Row Reference. Why: A brand-new item's own "+ Add" click needs a handle on the resulting row so it can be scrolled into view. How: This is attached to whichever row is currently open.


	React.useEffect( () => { // What: Scroll Into View Effect. Why: A freshly-created item's own form should scroll into view once its ColDisCom has actually finished opening, pinned right below the sort control rather than the top of a possibly-tall list. How: This waits 300ms (matching the ColDisCom open animation) before scrolling, or scrolls instantly under reduced motion.


		const notOpeBoo = !opeIteStr;                      // What: Not Open Boolean. Why: No item is open, so there is nothing to scroll to. How: This negates opeIteStr.
		const notNewBoo = newIteRef.current !== opeIteStr; // What: Not New Boolean. Why: Only a brand-new item needs this scroll. How: This checks the open item isn't the one newIteRef marks.
		const notRowBoo = !opeRowRef.current;              // What: Not Row Boolean. Why: The row's node must be mounted before it can scroll. How: This negates opeRowRef.current.

		const skiScrBoo = notOpeBoo || notNewBoo || notRowBoo; // What: Skip Scroll Boolean. Why: Any one missing piece means this effect has nothing to do. How: This ORs the 3 checks above.


		if ( skiScrBoo ) return; // What: Not Applicable Guard. Why: Only a brand-new, currently-open item with a mounted ref needs this scroll. How: This bails out whenever any of the 3 conditions isn't met.



		const rowCurEle = opeRowRef.current; // What: Row Current Element. Why: The scroll call below needs a stable local reference to the live row node. How: This reads opeRowRef.current once and reuses it.



		if ( redMotFun() ) { rowCurEle.scrollIntoView( { behavior : 'auto', block : 'nearest' } ); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion should see this scroll happen instantly. How: This scrolls immediately and returns early.



		const scrTimNum = setTimeout( () => rowCurEle.scrollIntoView( { behavior : 'smooth', block : 'nearest' } ), 300 ); // What: Scroll Timeout Number. Why: The ColDisCom open animation (.26s) needs to finish growing the editor before the scroll starts. How: This schedules the smooth scroll 300ms out.



		return () => clearTimeout( scrTimNum ); // What: Effect Cleanup Return. Why: A stale scroll must not fire after this effect re-runs or the component unmounts. How: This cancels scrTimNum.


	}, [ opeIteStr ] ); // What: Effect Dependency Array. Why: This scroll only ever needs to reconsider itself when which item is open actually changes. How: opeIteStr is the single value this effect's own guard is built around.



	const focInpRef = React.useRef( null ); // What: Focused Input Reference. Why: The name input focuses itself via a ref callback (inline, below) instead of the plain autoFocus attribute, so it can pass preventScroll and avoid fighting the deliberate smooth scroll above. How: This is guarded by node identity so a later re-render of the SAME input doesn't refocus it repeatedly.

	// #endregion Item Editor State



	// #region Filter State

	const [ filGroStr, setFilGroStr ] = React.useState( 'all' ); // What: Filter Group String And Setter. Why: The Group filter row narrows which pickers appear below, mirroring the Pickers + Stats tabs; both default to "All". How: This is committed by the Group pill row and read throughout this component.
	const [ filTypStr, setFilTypStr ] = React.useState( 'all' ); // What: Filter Type String And Setter. Why: The Type filter row narrows by picker mode, and also carries the Conditionals/Reminders sentinel scope values. How: This is committed by the Type pill row and read throughout this component.
	const [ curScoStr, setCurScoStr ] = React.useState( 'all' ); // What: Current Scope String And Setter. Why: The Show row's own active box needs its own selection state, independent of (but reconciled with) the other 2 filters. How: This is committed by onSelect below and read throughout this component.
	const [ filConStr, setFilConStr ] = React.useState( 'all' ); // What: Filter Conditional String And Setter. Why: The Conditionals filter row narrows pickers to those gated by one chosen conditional. How: This is committed by the Conditionals pill row and read throughout this component.

	const allPicArr = staAppObj.pickers || []; // What: All Picker Array. Why: Nearly every filter/list computation below needs the full picker list to start from. How: This reads staAppObj.pickers, falling back to an empty array.

	// #endregion Filter State



	// #region Picker Removal

	const [ rmvPicStr, setRmvPicStr ] = React.useState( null ); // What: Removing Picker String And Setter. Why: A deleted picker's own card needs to finish its collapse+fade-out animation before actually being removed. How: This holds whichever picker's own id is currently mid-removal-animation.


	// #region delPicFun

	/**
	 * delPicFun = Delete Picker Function
	 *
	 * @summary
	 * Deletes a picker from the Data list. Under reduced motion it removes the
	 * picker from the store immediately; otherwise it only flags the card as
	 * removing, and the card's own onAnimationEnd does the actual removal once
	 * its exit animation has played.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param picIdeStr - Picker Identifier String: The id of the picker to
	 *                    delete.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * delPicFun( picIdeStr ) // => void
	 * ```
	 *
	*/

	const delPicFun = ( picIdeStr ) => { // What: Delete Picker Function. Why: A user who prefers reduced motion should see the removal happen instantly instead of animating. How: This removes the picker directly under reduced motion, otherwise just flags it for the animated removal (finished by the card's own onAnimationEnd below).


		if ( redMotFun() ) { actStoObj.delPicFun( picIdeStr ); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion should see the picker disappear instantly. How: This removes it right away and returns.



		setRmvPicStr( picIdeStr ); // What: Removing Set Call. Why: The card plays its removal animation before the store drops it. How: This flags picIdeStr, and the card's onAnimationEnd does the actual removal.


	};

	// #endregion delPicFun

	// #endregion Picker Removal



	// #region Picker Draft

	const [ newDraStr, setNewDraStr ] = React.useState( null );  // What: New Draft String And Setter. Why: The "Create Picker" trigger creates a REAL (but hidden) picker immediately; only its id is held here, since the card below always reads the LIVE picker from staAppObj.pickers, same as any other card. How: This is set by staNewFun and cleared by canNewFun/savNewFun.
	const [ draIteBoo, setDraIteBoo ] = React.useState( false ); // What: Draft Items Boolean And Setter. Why: The draft's own Items section starts closed, unlike a real picker's default-open one, since there's nothing to add to yet. How: This is toggled by the footer's "Add Items" button or the Items section's own header.
	const [ penAutBoo, setPenAutBoo ] = React.useState( false ); // What: Pending Auto Boolean And Setter. Why: The footer's first "Add Items" click should ALSO land straight in a ready-to-type new-item form, but PicConCom's own Items ColDisCom only starts mounting children one render after draIteBoo flips, so this defers the auto-add by one effect tick. How: This is flagged true by onOpeSecFun and consumed by the effect below.


	React.useEffect( () => { // What: Pending Auto Add Effect. Why: Deferring the auto-add by one render lets both the reveal and the new item's own open state land in the SAME next render, instead of racing the ColDisCom's own child-mount delay. How: This creates a brand-new item and opens it, exactly once per penAutBoo flip.


		if ( !penAutBoo ) return; // What: Not Pending Guard. Why: This effect should do nothing until specifically flagged. How: This bails out early while penAutBoo is false.



		setPenAutBoo( false ); // What: Pending Clear Call. Why: This is a strictly one-shot flag. How: This resets penAutBoo to false immediately.



		if ( !newDraStr || newIteRef.current ) return; // What: Not Applicable Guard. Why: There must be an actual draft picker, and no other brand-new item already in progress. How: This bails out when either condition fails.



		const nexIdeStr = 'it_' + Math.random().toString( 36 ).slice( 2, 8 ); // What: Next Identifier String. Why: The brand-new item needs its own id immediately. How: This generates a short random id with an 'it_' prefix.


		actStoObj.addIteFun( newDraStr, 'New item', nexIdeStr ); // What: Add Item Call. Why: This is the actual creation of the draft's own first item. How: This adds an item named 'New item' under newDraStr, with the freshly-generated id.

		newIteRef.current = nexIdeStr; // What: New Item Mark. Why: Cancel must discard this exact item, not revert it to a snapshot. How: This flags nexIdeStr as the brand-new, not-yet-kept item.
		setInsIteStr( nexIdeStr );     // What: Insert Item Set Call. Why: The freshly-created row should play the slide-in entrance. How: This sets insIteStr to nexIdeStr.
		setOpeIteStr( nexIdeStr );     // What: Open Item Set Call. Why: The freshly-created item's own editor should open immediately. How: This sets opeIteStr to nexIdeStr.


	}, [ penAutBoo ] ); // What: Effect Dependency Array. Why: This only ever needs to run when the one-shot flag itself is set. How: penAutBoo is the single value this effect's own guard is built around.


	// #region staNewFun

	/**
	 * staNewFun = Start New Function
	 *
	 * @summary
	 * Starts a new picker draft from the Create Picker button. It creates a real
	 * but hidden picker right away, pre-filled from whichever Group, Type, and
	 * Conditionals filters are active (a Type filter only counts when it names a
	 * real picker mode), then marks it as the in-progress draft with its Items
	 * section closed.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * staNewFun() // => void
	 * ```
	 *
	*/

	const staNewFun = () => { // What: Start New Function. Why: The "Create Picker" button creates a real, hidden picker immediately, pre-filled from whichever Group/Type/Conditional filter is currently active. How: This calls addPicFun with those defaults and opens the resulting id as the new draft.


		const isaReaBoo = !!SED_NAM_OBJ.MOD_DEF_OBJ[ filTypStr ]; // What: Is-A Real Boolean. Why: filTypStr can hold a Conditionals/Reminders sentinel value that isn't an actual picker mode. How: This checks whether filTypStr is a genuine key in SED_NAM_OBJ.MOD_DEF_OBJ.


		const newIdeStr = actStoObj.addPicFun({ // What: New Identifier String. Why: The freshly-created picker's own id is needed immediately to become the new draft. How: This calls addPicFun, pre-filled per the active filters, and returns its own new id.


			conditionalId : filConStr !== 'all' ? filConStr : null, // What: Conditional Id. Why: An active Conditionals filter pre-attaches that conditional. How: This uses filConStr unless it's 'all'.
			group         : filGroStr !== 'all' ? filGroStr : '',   // What: Group. Why: An active Group filter pre-fills the group. How: This uses filGroStr unless it's 'all'.
			hidden        : true,                                   // What: Hidden. Why: The draft must stay out of every other tab until Save. How: This starts the picker hidden.
			items         : [],                                     // What: Items. Why: A new picker starts with no items. How: This is an empty array.
			mode          : isaReaBoo ? filTypStr : 'random',       // What: Mode. Why: An active Type filter pre-fills the mode when it's a real picker mode. How: This uses filTypStr when isaReaBoo, otherwise 'random'.
			name          : ''                                      // What: Name. Why: The draft's name is typed in its own card. How: This starts empty.


		});


		setNewDraStr( newIdeStr ); // What: New Draft Set Call. Why: The card below needs to know which live picker is the in-progress draft. How: This sets newDraStr to newIdeStr.
		setDraIteBoo( false );     // What: Draft Items Reset Call. Why: A brand-new draft always starts with its own Items section closed. How: This resets draIteBoo to false.


	};

	// #endregion staNewFun


	// #region canNewFun

	/**
	 * canNewFun = Cancel New Function
	 *
	 * @summary
	 * Discards the in-progress picker draft. It deletes the hidden draft picker,
	 * which already cascades to its items and daily-generator membership, then
	 * clears the draft state so the draft card disappears.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * canNewFun() // => void
	 * ```
	 *
	*/

	const canNewFun = () => { // What: Cancel New Function. Why: Cancel discards the whole draft; delPicFun already cascades to its own items and daily-generator membership, so there's nothing else to clean up. How: This removes the draft picker (if one exists) and clears both draft-tracking states.


		if ( newDraStr ) actStoObj.delPicFun( newDraStr ); // What: Remove Draft Guard. Why: Only an actual draft picker needs removing. How: This only calls delPicFun when newDraStr is set.



		setNewDraStr( null );  // What: New Draft Clear Call. Why: The draft card must disappear once cancelled. How: This resets newDraStr to null.
		setDraIteBoo( false ); // What: Draft Items Reset Call. Why: A future new draft should start fresh, not carry over this one's Items-open state. How: This resets draIteBoo to false.


	};

	// #endregion canNewFun


	// #region savNewFun

	/**
	 * savNewFun = Save New Function
	 *
	 * @summary
	 * Saves the in-progress picker draft. Every field was already written live
	 * while editing, so saving only clears the picker's hidden flag to reveal it
	 * on every other tab, then clears the draft state.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * savNewFun() // => void
	 * ```
	 *
	*/

	const savNewFun = () => { // What: Save New Function. Why: Save reveals the picker everywhere else by clearing its own hidden flag; every other field was already committed live via the same actStoObj.updPicFun calls a real picker's own Controls uses. How: This clears hidden on the draft picker and clears both draft-tracking states.


		if ( newDraStr ) actStoObj.updPicFun( newDraStr, { hidden : false } ); // What: Reveal Draft Guard. Why: Only an actual draft picker needs revealing. How: This only calls updPicFun when newDraStr is set.



		setNewDraStr( null );  // What: New Draft Clear Call. Why: This is no longer a "draft" once saved; it's just a normal picker now. How: This resets newDraStr to null.
		setDraIteBoo( false ); // What: Draft Items Reset Call. Why: A future new draft should start fresh. How: This resets draIteBoo to false.


	};

	// #endregion savNewFun



	const draCarRef = React.useRef( null ); // What: Draft Card Reference. Why: The freshly-created draft's own card needs to scroll all the way to the viewport's own top, since its form is tall enough that "nearest" would still leave most of it below the fold. How: This is attached to the draft card's own ref prop.


	React.useEffect( () => { // What: Draft Scroll Effect. Why: The draft's own final layout height is already correct by the time this runs (its own Collapses are forced instant), so there's no animation to wait for first, unlike the item/conditional row scrolls above. How: This scrolls draCarRef into view at the viewport's own top.


		if ( !newDraStr || !draCarRef.current ) return; // What: Not Applicable Guard. Why: Only an actual, mounted draft card needs this scroll. How: This bails out when either condition fails.



		draCarRef.current.scrollIntoView({ // What: Draft Scroll Call. Why: This is the actual scroll-to-top-of-viewport action. How: This scrolls instantly under reduced motion, smoothly otherwise.


			behavior : redMotFun() ? 'auto' : 'smooth', // What: Behavior. Why: A user who prefers reduced motion gets an instant jump instead of a glide. How: This picks 'auto' under reduced motion, otherwise 'smooth'.
			block    : 'start'                          // What: Block. Why: The draft's tall form should start at the viewport's top. How: This aligns the card's top edge with the viewport's top.


		});


	}, [ newDraStr ] ); // What: Effect Dependency Array. Why: This only ever needs to run when a brand-new draft actually appears. How: newDraStr is the single value this effect's own guard is built around.

	// #endregion Picker Draft



	const IteEdiCom = EntEdiCom; // What: Item Editor Component. Why: This scopes EntEdiCom under a name matching this file's own component-naming convention, without renaming the actual import. How: This is reused so Today and Data stay exact copies, same pattern as the Reminders editor.

	const colMapObj = ( staAppObj.ui && staAppObj.ui.controlsCollapsed ) || {}; // What: Collapsed Map Object. Why: Every picker card's own open/closed state, plus its nested Controls/Items disclosures, are all persisted through this one map. How: This reads staAppObj.ui.controlsCollapsed, falling back to an empty object.



	// #region Filter Rows

	const exiGroArr = React.useMemo( () => { // What: Existing Group Array. Why: The Group filter row needs every distinct, non-hidden group name, alphabetical. How: This walks allPicArr once, collecting each group name the first time it's seen.


		const seeGroArr = []; // What: Seen Group Array. Why: The walk below needs to track which group names have already been collected, preserving nothing about order (the final sort handles that). How: This starts empty and is pushed to below.


		for ( const picCurObj of allPicArr ) { // What: Group Collect Loop. Why: Every non-hidden picker's own group needs collecting exactly once. How: This pushes picCurObj.group whenever it's set, the picker isn't hidden, and it isn't already collected.


			const hasGroBoo = Boolean( picCurObj.group );             // What: Has Group Boolean. Why: A picker with no group adds nothing to the row. How: This coerces picCurObj.group to a boolean.
			const notHidBoo = !picCurObj.hidden;                      // What: Not Hidden Boolean. Why: A hidden picker's group shouldn't surface as a filter. How: This negates picCurObj.hidden.
			const unsGroBoo = !seeGroArr.includes( picCurObj.group ); // What: Unseen Group Boolean. Why: Each group name is collected once. How: This checks seeGroArr doesn't hold it yet.

			const addGroBoo = hasGroBoo && notHidBoo && unsGroBoo; // What: Add Group Boolean. Why: Only a real, visible, not-yet-collected group is added. How: This ANDs the 3 checks above.


			if ( addGroBoo ) seeGroArr.push( picCurObj.group ); // What: Group Push Guard. Why: This is the actual collection step. How: This pushes the group name when addGroBoo is true.


		}



		return seeGroArr.sort( ( groOneStr, groTwoStr ) => groOneStr.localeCompare( groTwoStr ) ); // What: Seen Array Return. Why: The filter row needs these alphabetized. How: This sorts seeGroArr via localeCompare.


	}, [ allPicArr ] ); // What: Memo Dependency Array. Why: This only ever needs recomputing when the picker list itself changes. How: allPicArr is the single value this memo's own recompute is built around.


	const exiModArr = React.useMemo( () => { // What: Existing Mode Array. Why: The Type filter row needs every distinct mode actually in use, alphabetical by its own display label. How: This walks allPicArr once, collecting each mode the first time it's seen.


		const seeModSet = new Set(); // What: Seen Mode Set. Why: A Set naturally de-duplicates modes without a manual includes() check. How: This starts empty and is added to below.


		for ( const picCurObj of allPicArr ) if ( !picCurObj.hidden ) seeModSet.add( picCurObj.mode ); // What: Mode Collect Loop. Why: Every non-hidden picker's own mode needs collecting. How: This adds picCurObj.mode to seeModSet whenever the picker isn't hidden.



		return [ ...seeModSet ].sort( ( modOneStr, modTwoStr ) => SED_NAM_OBJ.MOD_DEF_OBJ[ modOneStr ].labStr.localeCompare( SED_NAM_OBJ.MOD_DEF_OBJ[ modTwoStr ].labStr ) ); // What: Seen Set Return. Why: The filter row needs these alphabetized by their own display label, not their raw key. How: This spreads seeModSet into an array and sorts by each mode's own SED_NAM_OBJ.MOD_DEF_OBJ label.


	}, [ allPicArr ] ); // What: Memo Dependency Array. Why: This only ever needs recomputing when the picker list itself changes. How: allPicArr is the single value this memo's own recompute is built around.



	const visPicArr = React.useMemo( () => allPicArr.filter( ( picCurObj ) => { // What: Visible Picker Array. Why: The Show row and every section below need pickers already narrowed by every active filter. How: This filters allPicArr by hidden state and the Group, Conditionals and Type filters together.


		const notHidBoo = !picCurObj.hidden;                                            // What: Not Hidden Boolean. Why: A hidden picker (a draft or a help sample) never lists here. How: This negates picCurObj.hidden.
		const groMatBoo = filGroStr === 'all' || picCurObj.group === filGroStr;         // What: Group Match Boolean. Why: The Group filter narrows by group. How: This passes every picker while it's 'all', otherwise only a matching group.
		const conMatBoo = filConStr === 'all' || picCurObj.conditionalId === filConStr; // What: Conditional Match Boolean. Why: The Conditionals filter narrows by attached conditional. How: This passes every picker while it's 'all', otherwise only a matching conditionalId.
		const typMatBoo = filTypStr === 'all' || picCurObj.mode === filTypStr;          // What: Type Match Boolean. Why: The Type filter narrows by mode. How: This passes every picker while it's 'all', otherwise only a matching mode.

		const incPicBoo = notHidBoo && groMatBoo && conMatBoo && typMatBoo; // What: Include Picker Boolean. Why: A picker lists only when every filter passes it. How: This ANDs the 4 checks above.



		return incPicBoo; // What: Include Picker Return. Why: filter() needs a yes/no per picker. How: This returns incPicBoo.


	} ), [ allPicArr, filGroStr, filConStr, filTypStr ] ); // What: Memo Dependency Array. Why: This only ever needs recomputing when the picker list or any one of the 3 active filters changes. How: Each of these 4 values independently affects which pickers pass the filter above.



	const conIteArr = staAppObj.conditionals || [];                                                                                            // What: Conditional Item Array. Why: Several filter rows and section counts below need the full conditional list. How: This reads staAppObj.conditionals, falling back to an empty array.
	const conCouFun = ( conIdeStr ) => allPicArr.filter( ( picCurObj ) => picCurObj.conditionalId === conIdeStr && !picCurObj.hidden ).length; // What: Conditional Count Function. Why: The Conditionals filter row's own per-pill count needs how many (non-hidden) pickers use each one. How: This counts every picker whose own conditionalId matches conIdeStr.


	const shoEntArr = React.useMemo( () => { // What: Show Entry Array. Why: The Show row's own actual rendered order (and "jump to the first card" logic below) both need one shared source of truth. How: This builds Conditionals/Reminders/every visible picker, sorted together, then optionally pins an "All" entry first.


		const resEntArr = [ // What: Rest Entry Array. Why: Conditionals/Reminders/every visible picker all sort together alphabetically, after any pinned "All" entry. How: This spreads in a Conditionals entry, a Reminders entry, and every visPicArr entry, each only when applicable, then sorts the combined list.


			...( ( filTypStr === 'all' || filTypStr === 'conditionals' ) && conIteArr.length > 0 ? [ { name : 'Conditionals', scope : 'conditionals' } ] : [] ), // What: Conditionals Entry Spread. Why: The Conditionals box shows when the Type filter allows it and at least one conditional exists. How: This spreads in one entry or nothing.
			...( filTypStr === 'all' || filTypStr === 'reminders' ? [ { name : 'Reminders', scope : 'reminders' } ] : [] ),                                      // What: Reminders Entry Spread. Why: The Reminders box shows whenever the Type filter allows it. How: This spreads in one entry or nothing.
			...visPicArr.map( ( picCurObj ) => ( { name : picCurObj.name, scope : picCurObj.id } ) )                                                             // What: Picker Entries Spread. Why: Every visible picker gets its own box. How: This maps visPicArr to one name/scope entry each.


		].sort( ( entOneObj, entTwoObj ) => entOneObj.name.localeCompare( entTwoObj.name ) ); // What: Entry Sort Call. Why: The boxes list alphabetically by name. How: This sorts the combined entries with localeCompare.


		const defFilBoo = filGroStr === 'all' && filTypStr === 'all'; // What: Default Filter Boolean. Why: "All" only needs pinning first when every filter is still at its default, or (see below) a real filter still leaves 2+ entries in view. How: This checks both filGroStr and filTypStr are 'all'.



		return ( defFilBoo || resEntArr.length >= 2 ) ? [ { name : 'All', scope : 'all' }, ...resEntArr ] : resEntArr; // What: Show Entry Return. Why: A lone remaining entry would make "All" a redundant duplicate of that one card. How: This pins "All" first whenever defFilBoo holds or resEntArr still has 2+ entries, otherwise returns resEntArr as-is.


	}, [ filGroStr, filTypStr, conIteArr.length, visPicArr ] ); // What: Memo Dependency Array. Why: This only ever needs recomputing when a filter changes or the underlying conditional/picker lists themselves change. How: Each of these 4 values independently affects which entries appear or how many there are.


	const shoAllBoo = shoEntArr.some( ( entCurObj ) => entCurObj.scope === 'all' ); // What: Show All Boolean. Why: The Show row's own render needs to know whether an "All" card is actually present this render. How: This checks shoEntArr for a 'all' scope entry.


	const preFilRef = React.useRef( { conStr : filConStr, groStr : filGroStr, typStr : filTypStr } ); // What: Previous Filter Reference. Why: Landing on the Show row's own first card needs to detect an ACTUAL filter change, not just any render. How: This starts at the initial filter values and is updated by the effect below.


	React.useEffect( () => { // What: Scope Coherence Effect. Why: The active scope must always land on the Show row's own first card whenever any filter changes, not only once the OLD scope happens to fall out of view entirely. How: This detects a filter change (or the current scope no longer being a valid entry) and resets curScoStr to shoEntArr's own first entry.


		const conChaBoo = preFilRef.current.conStr !== filConStr; // What: Conditional Changed Boolean. Why: A new Conditionals filter counts as a filter change. How: This compares the stored conStr to filConStr.
		const groChaBoo = preFilRef.current.groStr !== filGroStr; // What: Group Changed Boolean. Why: A new Group filter counts as a filter change. How: This compares the stored groStr to filGroStr.
		const typChaBoo = preFilRef.current.typStr !== filTypStr; // What: Type Changed Boolean. Why: A new Type filter counts as a filter change. How: This compares the stored typStr to filTypStr.

		const filChaBoo = conChaBoo || groChaBoo || typChaBoo; // What: Filter Changed Boolean. Why: This is the actual "did a filter change since last render" check. How: This compares every one of the 3 tracked filters against their own previous values.


		preFilRef.current = { conStr : filConStr, groStr : filGroStr, typStr : filTypStr }; // What: Previous Filter Update. Why: The next run of this effect needs to compare against the filters that are current now. How: This overwrites preFilRef with the freshly-read values.


		if ( filChaBoo || !shoEntArr.some( ( entCurObj ) => entCurObj.scope === curScoStr ) ) setCurScoStr( shoEntArr[ 0 ] ? shoEntArr[ 0 ].scope : 'all' ); // What: Reset Scope Guard. Why: Either an actual filter change, or the current scope simply no longer existing in the row, both call for landing on the first card. How: This sets curScoStr to shoEntArr's own first entry (or 'all' if the row is somehow empty).


	}, [ filGroStr, filConStr, filTypStr, shoEntArr, curScoStr ] ); // What: Effect Dependency Array. Why: This must re-run whenever any filter changes, the entry list itself changes, or the current scope changes (so its own no-longer-valid check stays accurate). How: Every one of these 5 values can affect whether curScoStr needs resetting.


	const selScoFun = ( nexScoStr ) => setCurScoStr( nexScoStr ); // What: Select Scope Function. Why: The boxes' own click behavior is a stub for now, ready to wire up later; selection state itself still needs to update. How: This just commits nexScoStr as the new curScoStr.


	const groRowRef = React.useRef( null ); // What: Group Row Reference. Why: The scroll-edge-fade effect below needs a handle on the Group filter row's own scrollable element. How: This is attached to that row's own ref prop.
	const typRowRef = React.useRef( null ); // What: Type Row Reference. Why: Same reasoning as groRowRef, for the Type filter row. How: This is attached to that row's own ref prop.
	const scoRowRef = React.useRef( null ); // What: Scope Row Reference. Why: Same reasoning as groRowRef, for the Show row. How: This is attached to that row's own ref prop.
	const conRowRef = React.useRef( null ); // What: Conditional Row Reference. Why: Same reasoning as groRowRef, for the Conditionals filter row. How: This is attached to that row's own ref prop.


	React.useEffect( () => { // What: Filter Rows Fade Effect. Why: Every filter row shares the same scroll-edge-fade affordance as the Stats tab. How: This wires up at-start/at-end tracking for whichever of the 4 rows are currently mounted, and tears every one down on cleanup.


		const rowEleArr = [ groRowRef.current, typRowRef.current, scoRowRef.current, conRowRef.current ].filter( Boolean ); // What: Row Element Array. Why: Not every row is always mounted (e.g. a single-group app has no Group row at all). How: This collects only the currently-mounted refs.


		const cleFunArr = rowEleArr.map( ( rowCurEle ) => { // What: Cleanup Function Array. Why: Every row needs its own independent wiring and its own independent teardown. How: This maps each row element to its own cleanup function, collected for the effect's own return below.


			const updFadFun = () => { // What: Update Fade Function. Why: Each row's own fade classes need recomputing on every relevant change. How: This toggles at-start/at-end based on the row's own scrollWidth/clientWidth/scrollLeft.


				const canScrBoo = rowCurEle.scrollWidth - rowCurEle.clientWidth > 1;                                       // What: Can Scroll Boolean. Why: A row that doesn't overflow at all should never show either fade edge. How: This is true only when the row's own content is wider than its own visible box by more than a rounding pixel.
				const reaStaBoo = !canScrBoo || rowCurEle.scrollLeft <= 1;                                                 // What: Reached Start Boolean. Why: The left fade should hide once the row can't scroll at all or is already at its own start. How: This combines canScrBoo with the row's own current scrollLeft.
				const reaEndBoo = !canScrBoo || rowCurEle.scrollLeft + rowCurEle.clientWidth >= rowCurEle.scrollWidth - 1; // What: Reached End Boolean. Why: The right fade should hide once the row can't scroll at all or is already at its own end. How: This combines canScrBoo with the row's own current scroll position.


				rowCurEle.classList.toggle( 'at-start', reaStaBoo ); // What: At Start Toggle. Why: This is the actual class CSS reads to hide the left fade. How: This applies reaStaBoo.
				rowCurEle.classList.toggle( 'at-end', reaEndBoo );   // What: At End Toggle. Why: This is the actual class CSS reads to hide the right fade. How: This applies reaEndBoo.


			};


			updFadFun(); // What: Initial Fade Call. Why: The fade classes need to reflect this row's own real layout immediately. How: This invokes updFadFun once, synchronously.

			rowCurEle.addEventListener( 'scroll', updFadFun, { passive : true } ); // What: Row Scroll Listener. Why: Scrolling the row itself is the most common way its own edges change. How: This re-runs updFadFun on every scroll event, passively so it never blocks the scroll itself.


			const resObsObj = new ResizeObserver( updFadFun ); // What: Resize Observer Object. Why: A row's own fade state also depends on its measured width, which can change independent of scrolling. How: This re-runs updFadFun whenever the row's own box size changes.


			resObsObj.observe( rowCurEle ); // What: Resize Observer Start. Why: The observer above does nothing until it's told what to watch. How: This begins watching rowCurEle for size changes.



			return () => { // What: Row Cleanup Return. Why: Both the listener and the observer must not outlive this effect run. How: This removes updFadFun from rowCurEle and disconnects resObsObj.


				rowCurEle.removeEventListener( 'scroll', updFadFun ); // What: Scroll Unsubscribe Call. Why: The listener must not outlive this effect run. How: This removes updFadFun from rowCurEle.

				resObsObj.disconnect(); // What: Observer Disconnect Call. Why: The observer must not outlive this effect run either. How: This disconnects resObsObj.


			};


		} );



		return () => cleFunArr.forEach( ( cleCurFun ) => cleCurFun() ); // What: Effect Cleanup Return. Why: Every row's own individual cleanup must actually run. How: This calls every function collected in cleFunArr.


	}, [ allPicArr.length, filGroStr, filTypStr, exiModArr.length, visPicArr.length, curScoStr, conIteArr.length, filConStr ] ); // What: Effect Dependency Array. Why: Any of these changing can add, remove, or resize a row, which can change whether it overflows at all. How: Each value independently affects one or more of the 4 rows' own layout.

	// #endregion Filter Rows



	const togSecFun = ( secIdeStr ) => actStoObj.togColFun( secIdeStr, true ); // What: Toggle Section Function. Why: Every picker card defaults collapsed, so its own toggle needs that default baked in. How: This calls togColFun with defaultCollapsed true.



	// #region Section List

	const remTypBoo = filTypStr === 'all' || filTypStr === 'reminders'; // What: Reminders Type Boolean. Why: The Type filter must allow reminders. How: This passes 'all' and 'reminders'.
	const allConBoo = filConStr === 'all';                              // What: All Conditionals Boolean. Why: Reminders and the Conditionals manager both hide while a single conditional is filtered. How: This checks the Conditionals filter is at its default.
	const remScoBoo = curScoStr === 'all' || curScoStr === 'reminders'; // What: Reminders Scope Boolean. Why: The Show row's scope must include reminders. How: This passes 'all' and 'reminders'.

	const shoRemBoo = remTypBoo && allConBoo && remScoBoo; // What: Show Reminders Boolean. Why: Reminders is its own scope and isn't part of any picker group/mode, so it only appears when the type filter is "All" (or itself), unfiltered by conditional, at the matching scope. How: This combines all 3 conditions with &&.


	const conTypBoo = filTypStr === 'all' || filTypStr === 'conditionals'; // What: Conditionals Type Boolean. Why: The Type filter must allow conditionals. How: This passes 'all' and 'conditionals'.
	const conScoBoo = curScoStr === 'all' || curScoStr === 'conditionals'; // What: Conditionals Scope Boolean. Why: The Show row's scope must include conditionals. How: This passes 'all' and 'conditionals'.

	const shoConBoo = conTypBoo && allConBoo && conScoBoo; // What: Show Conditionals Boolean. Why: The Conditionals manager is shown even with none created, since it's the only place to create one; gating on existence would make it unreachable from a clean state. How: This combines the same 3-condition shape as shoRemBoo.


	const shoPicArr = ( curScoStr === 'reminders' || curScoStr === 'conditionals' ) // What: Shown Picker Array. Why: The rendered picker cards are visPicArr narrowed once more by the active scope. How: This is empty at the Reminders/Conditionals scopes, every visPicArr entry at 'all', or just the one matching picker otherwise.
		? []                                                                                                     // What: Special Scope Branch. Why: The Reminders or Conditionals scope shows no picker cards. How: This returns an empty array.
		: ( curScoStr === 'all' ? visPicArr : visPicArr.filter( ( picCurObj ) => picCurObj.id === curScoStr ) ); // What: Picker Scope Branch. Why: The All scope shows every visible picker, a picker scope shows just that one. How: This returns visPicArr or its single matching picker.



	const remCouNum = ( staAppObj.tasks || [] ).filter( ( tasCurObj ) => !tasCurObj.hidden ).length; // What: Reminders Count Number. Why: The Reminders section entry below needs its own live count, the same as every picker card's own item count. How: This counts every non-hidden task.



	const picSecMap = React.useMemo( () => { // What: Picker Section Map. Why: The section sort needs each shown picker's own item count and active state, computed once rather than per sort comparison. How: This builds an id-keyed map of { count, isActive } for every entry in shoPicArr.


		const picMetMap = new Map(); // What: Picker Meta Map. Why: The loop below needs somewhere to collect each picker's own computed metadata. How: This starts empty and is set on below.


		for ( const picCurObj of shoPicArr ) { // What: Picker Meta Loop. Why: Every shown picker needs its own count/active metadata computed once. How: This filters staAppObj.items per picker and derives both fields from that filtered list.


			const ownIteArr = staAppObj.items.filter( ( iteCurObj ) => iteCurObj.pickerId === picCurObj.id ); // What: Owned Item Array. Why: Both fields below depend on this exact picker's own items. How: This filters the whole app's items down to just this picker's own.


			picMetMap.set( picCurObj.id, { // What: Map Set Call. Why: This picker's own computed metadata needs to be recorded under its own id. How: This sets count to the item count, and isActive false only when every item (and there's at least one) is on vacation.


				count    : ownIteArr.length,                                                                   // What: Count. Why: The Count sort needs this picker's item total. How: This is ownIteArr's length.
				isActive : !( ownIteArr.length > 0 && ownIteArr.every( ( iteCurObj ) => iteCurObj.vacation ) ) // What: Is Active. Why: The Active sort treats a picker whose every item is on vacation as inactive. How: This is false only when there are items and all of them are on vacation.


			} );


		}



		return picMetMap; // What: Map Object Return. Why: The section sort below needs this whole map back. How: This returns the same picMetMap built and set on above.


	}, [ shoPicArr, staAppObj.items ] ); // What: Memo Dependency Array. Why: This only ever needs recomputing when the shown pickers or the app's own items change. How: Both values independently affect the computed metadata.


	const secSorStr = staAppObj.ui?.dataSort?.sections || 'name-asc'; // What: Section Sort String. Why: The top-level section list needs its own persisted sort choice. How: This reads staAppObj.ui.dataSort.sections, falling back to 'name-asc'.


	const secEntArr = React.useMemo( () => { // What: Section Entry Array. Why: Conditionals/Reminders/every shown picker all need a common comparable shape before they can be sorted together. How: This builds one entry per visible section, then sorts the combined list via sorEntFun.


		const colEntArr = []; // What: Collected Entry Array. Why: The pushes below need somewhere to collect one entry per visible section. How: This starts empty and is conditionally pushed to just below.


		if ( shoConBoo ) { // What: Conditionals Entry Push. Why: Group/Active have no meaning for Conditionals as a WHOLE section. How: This pushes a null group/isActive entry, with count as the total conditional count.


			colEntArr.push({ // What: Conditionals Entry Push. Why: The Conditionals section joins the sort as one entry. How: This pushes its comparable shape.


				count    : conIteArr.length, // What: Count. Why: The Count sort needs this section's size. How: This is the conditional count.
				group    : null,             // What: Group. Why: The Group sort needs this section's group. How: This is always null.
				isActive : null,             // What: Is Active. Why: The Active sort needs this section's on/off state. How: This is always null.
				kinStr   : 'conditionals',   // What: Kind String. Why: The render below picks a component by kind. How: This is 'conditionals'.
				name     : 'Conditionals',   // What: Name. Why: The Name sort and the section heading need this name. How: This is the literal "Conditionals".
				type     : 'Conditionals'    // What: Type. Why: The Type sort needs this section's type label. How: This is the literal "Conditionals".


			});


		}



		if ( shoRemBoo ) { // What: Reminders Entry Push. Why: Same reasoning as the Conditionals entry above, for Reminders. How: This pushes a null group/isActive entry, with count as remCouNum.


			colEntArr.push({ // What: Reminders Entry Push. Why: The Reminders section joins the sort as one entry. How: This pushes its comparable shape.


				count    : remCouNum,   // What: Count. Why: The Count sort needs this section's size. How: This is the visible reminder count.
				group    : null,        // What: Group. Why: The Group sort needs this section's group. How: This is always null.
				isActive : null,        // What: Is Active. Why: The Active sort needs this section's on/off state. How: This is always null.
				kinStr   : 'reminders', // What: Kind String. Why: The render below picks a component by kind. How: This is 'reminders'.
				name     : 'Reminders', // What: Name. Why: The Name sort and the section heading need this name. How: This is the literal "Reminders".
				type     : 'Reminders'  // What: Type. Why: The Type sort needs this section's type label. How: This is the literal "Reminders".


			});


		}



		for ( const picCurObj of shoPicArr ) { // What: Picker Entry Loop. Why: Every shown picker needs its own entry in the same comparable shape. How: This looks up each picker's own precomputed metadata from picSecMap.


			const picMetObj = picSecMap.get( picCurObj.id ) || { count : 0, isActive : true }; // What: Picker Meta Object. Why: This picker's own count/active fields were already computed above. How: This reads picSecMap, falling back to a safe default if somehow missing.


			colEntArr.push({ // What: Picker Entry Push. Why: A picker's own entry needs its own name/type/group alongside the precomputed count/active fields. How: This pushes one entry per picCurObj.


				count    : picMetObj.count,                                 // What: Count. Why: The Count sort needs this section's size. How: This is picMetObj's precomputed count.
				group    : picCurObj.group || null,                         // What: Group. Why: The Group sort needs this section's group. How: This is the picker's group, or null.
				isActive : picMetObj.isActive,                              // What: Is Active. Why: The Active sort needs this section's on/off state. How: This is picMetObj's precomputed state.
				kinStr   : 'picker',                                        // What: Kind String. Why: The render below picks a component by kind. How: This is 'picker'.
				name     : picCurObj.name,                                  // What: Name. Why: The Name sort and the section heading need this name. How: This is the picker's name.
				picObj   : picCurObj,                                       // What: Picker Object. Why: A picker card renders straight from its live record. How: This is picCurObj itself.
				type     : SED_NAM_OBJ.MOD_DEF_OBJ[ picCurObj.mode ].labStr // What: Type. Why: The Type sort needs this section's type label. How: This is the mode's label.


			});


		}



		return colEntArr.sort( ( entOneObj, entTwoObj ) => sorEntFun( entOneObj, entTwoObj, secSorStr ) ); // What: Entry Array Return. Why: The rendered list needs to actually be in secSorStr's own order. How: This sorts colEntArr via sorEntFun.


	}, [ shoConBoo, shoRemBoo, shoPicArr, picSecMap, conIteArr.length, remCouNum, secSorStr ] ); // What: Memo Dependency Array. Why: Any of these changing can add, remove, or reorder a section. How: Each value independently affects the entry list or its own sort order.


	const draPicObj = newDraStr ? allPicArr.find( ( picCurObj ) => picCurObj.id === newDraStr ) : null; // What: Draft Picker Object. Why: The draft's own card, appended last below, needs the live picker record itself, not just its id. How: This looks up newDraStr in allPicArr, or null when there's no draft.
	const draEntObj = draPicObj ? { draBoo : true, kinStr : 'picker', picObj : draPicObj } : null;      // What: Draft Entry Object. Why: The draft card is deliberately NOT part of secEntArr/its sort, so it always renders last regardless of sort order and never shows up filtered out by an unrelated group/type/conditional filter. How: This is null unless a real draft picker exists.
	const shoSecArr = draEntObj ? [ ...secEntArr, draEntObj ] : secEntArr;                              // What: Shown Section Array. Why: The list below needs the sorted sections plus, when present, the draft appended after them. How: This appends draEntObj only when it exists.


	const notConBoo = !shoConBoo;             // What: Not Conditionals Boolean. Why: The empty state only applies while the Conditionals section is hidden. How: This negates shoConBoo.
	const notRemBoo = !shoRemBoo;             // What: Not Reminders Boolean. Why: The empty state only applies while the Reminders section is hidden too. How: This negates shoRemBoo.
	const zerPicBoo = shoPicArr.length === 0; // What: Zero Picker Boolean. Why: The empty state only applies while no picker card shows either. How: This checks shoPicArr is empty.

	const shoEmpBoo = notConBoo && notRemBoo && zerPicBoo; // What: Show Empty Boolean. Why: Every filter combined leaving nothing at all needs its own explanatory message. How: This ANDs the 3 checks above.


	const notDraBoo = !newDraStr;                   // What: Not Draft Boolean. Why: Only one picker draft can be in progress at a time. How: This negates newDraStr.
	const nonConBoo = filTypStr !== 'conditionals'; // What: Non Conditionals Boolean. Why: A picker draft has nothing to belong to while Type is filtered to Conditionals. How: This compares filTypStr against 'conditionals'.
	const nonRemBoo = filTypStr !== 'reminders';    // What: Non Reminders Boolean. Why: A picker draft has nothing to belong to while Type is filtered to Reminders either. How: This compares filTypStr against 'reminders'.

	const shoCreBoo = notDraBoo && nonConBoo && nonRemBoo; // What: Show Create Boolean. Why: The Create Picker button only shows when a new draft makes sense. How: This ANDs the 3 checks above.

	// #endregion Section List



	return (


		<div className='tab tab--data'>{ /* What: Tab Div Element. Why: This is TabDatCom's own root element. How: This wraps the help overlay, header, filters, sort bar, and list below. */ }


			<HelOveCom
				actModBoo={ helOpeBoo }
				helIteArr={ DAT_HEL_ARR }

				onCloAllFun={ helExiFun }
			/>{ /* What: Help Overlay Component. Why: This tab needs the same help-mode badge overlay every other tab exposes. How: This is driven by helOpeBoo and this tab's own DAT_HEL_ARR catalog. */ }



			<header className='stat-h'>{ /* What: Header Element. Why: This tab's own kicker, brand link, and lead paragraphs all belong in one landmark. How: This wraps the kicker row and the lead/warning paragraphs below. */ }


				<div className='kicker-row'>{ /* What: Kicker Row Div Element. Why: The kicker label and the help toggle belong on the same line. How: This wraps the kicker div and HelButCom below. */ }


					<div className='kicker stat-h-kicker'>Data</div>{ /* What: Kicker Div Element. Why: Every tab needs its own small kicker label above the title. How: This renders the literal text "Data". */ }



					<HelButCom
						actModBoo={ helOpeBoo }

						onClick={ () => setHelOpeBoo( ( preOpeBoo ) => !preOpeBoo ) }
					/>{ /* What: Help Button Component. Why: This tab needs the same help-mode toggle every other tab exposes. How: This flips helOpeBoo on click. */ }


				</div>



				<div className='stat-h-lead'>{ /* What: Lead Div Element. Why: The brand link and the page title belong together at the top of the header. How: This wraps the brand button and the section-h div below. */ }


					<button
						className='brand-mark'

						type='button'

						aria-label='Ease My Life link to go to the Today page'

						onClick={ onNavHomFun }
					>{ /* What: Brand Button Element. Why: The logo/wordmark also works as a shortcut back to the Today tab. How: This wraps the theme-wired logo svg below and jumps to Today on click. */ }


						<svg
							fill='none'
							viewBox='8 8 528 528'

							aria-hidden='true'
						>{ /* What: Logo Svg Element. Why: This draws the small square "Ease My Life" logo mark, matching the Today/Stats headers (currentColor to accent, grid lines to accent-soft) so every tab reads as one product. How: This is a fixed-viewBox icon composed of a grid, a rounded-square badge outline, and a clipped glyph path. */ }


							<defs>{ /* What: Clip Defs Element. Why: An SVG clipPath can only be applied via a defined, referenced id, not inline. How: This holds the one clipPath definition the glyph path below references. */ }


								<clipPath
									id='braMarCli--dat'

									clipPathUnits='userSpaceOnUse'
								>{ /* What: Badge Clippath Element. Why: The glyph path's own curves slightly overshoot the rounded-square badge and need to be masked to it. How: This defines a rounded-square clip region, given a unique id so it can be referenced via url(#...). */ }


									<rect
										height='512'
										rx='75'
										ry='75'
										width='512'
										x='16'
										y='16'
									/>{ /* What: Clip Rect Element. Why: The clip region itself needs a concrete shape to clip to. How: This draws the rounded-square shape that the clipPath above exposes for reference. */ }


								</clipPath>


							</defs>

							<g
								style={{
									stroke      : 'var(--accent-soft)',
									strokeWidth : 16
								}}
							>{ /* What: Grid Group Element. Why: Groups the 8 decorative background lines so they can share one stroke style instead of repeating it 8 times. How: This sets the shared stroke/strokeWidth once, applied to every child path below. */ }


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
								style={{
									stroke         : 'currentColor',
									strokeLinecap  : 'round',
									strokeLinejoin : 'round',
									strokeWidth    : 16
								}}

								height='512'
								rx='75'
								ry='75'
								width='512'
								x='16'
								y='16'
							/>{ /* What: Badge Rect Element. Why: The logo needs a visible rounded-square border/badge behind the glyph. How: This draws the same rounded-square shape as the clip rect above, but stroked and visible instead of hidden in defs. */ }

							<path
								style={{
									fill   : 'currentColor',
									stroke : 'currentColor'
								}}

								clipPath='url(#braMarCli--dat)'
								d='M 24.467 527.792 C 67.266 416.298 77.088 228.913 172.207 434.412 C 200.739 535.77 262.562 434.412 314.873 292.51 C 381.45 120.201 450.381 44.636 528.854 24.365 C 521.725 22.337 512.215 24.365 493.193 34.5 C 369.548 105.451 295.85 292.51 234.029 363.461 C 186.473 414.14 167.451 241.831 124.651 262.102 C 101.828 270.008 60.133 375.754 24.467 527.792 Z'
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth='8'
							/>{ /* What: Glyph Path Element. Why: This is the actual squiggly "Ease My Life" brand glyph drawn inside the badge. How: This path is clipped to the rounded-square badge so its curves never spill outside it. */ }


						</svg>


					</button>


					<div className='section-h'>{ /* What: Section Header Div Element. Why: The page's own title needs its own wrapper. How: This wraps the h1 below. */ }


						<h1 className='section-title'>The knobs and levers, that <span className='stat-title-accent'>ease</span> your life.</h1>{ /* What: Section Title Element. Why: Every tab needs its own page title. How: This renders the literal title text, with "ease" set off in its own accent span. */ }


					</div>


				</div>



				<p className='section-sub'>All your created items can be edited here, including conditionals, reminders, pickers and all of their items. You can use the <button className='sub-tablink' type='button' onClick={ () => onNavTabFun && onNavTabFun( 'stats' ) }>Stats page</button> to view how they are performing and then adjust their numbers here to get them exactly where you want them.</p>{ /* What: Lead Paragraph Element. Why: The header needs a short explanation of what this tab is for, plus a shortcut to Stats. How: This renders the lead text with an inline link that switches to the Stats tab when onNavTabFun is available. */ }

				<p className='section-sub'><strong>WARNING:</strong> Manually changing any of these values will affect the Stats page's accuracy. Minor or infrequent changes will have an almost negligible effect but major or frequent changes will definitely skew the Stats page's accuracy.</p>{ /* What: Warning Paragraph Element. Why: Manually editing these values has a real, disclosed side effect on Stats. How: This renders the literal warning text. */ }


			</header>



			<div className='stat-filters'>{ /* What: Filters Div Element. Why: The Group/Type/Conditionals/Show filter rows all belong in one wrapper. How: This conditionally renders each row below, per whether it has more than one real choice. */ }


				{ exiGroArr.length > 1 && ( // What: Group Row Check. Why: A single-group app has nothing to filter by group. How: This renders the Group row only while exiGroArr has 2 or more entries.


					<div className='stat-filter-row'>{ /* What: Group Filter Row Div Element. Why: The Group label and its own pill rail belong together. How: This wraps the lbl span and the pill rail below. */ }


						<span className='stat-filter-lbl'>Group</span>{ /* What: Group Label Span Element. Why: The row needs its own literal name. How: This renders the literal text "Group". */ }

						<div
							ref={ groRowRef }

							className='picker-groups stat-scope-groups'

							aria-label='Filter pickers by group'
							role='tablist'
						>{ /* What: Group Pills Div Element. Why: This is the actual scrollable tablist of "All" plus every existing group. How: This renders the All pill, then maps exiGroArr to one pill each. */ }


							<button
								className={ ` picker-group-pill   ${ filGroStr === 'all' ? 'is-on' : '' } ` }

								disabled={ disGroBoo }
								type='button'

								aria-selected={ filGroStr === 'all' }
								role='tab'

								onClick={ () => setFilGroStr( 'all' ) }
							>{ /* What: All Pill Button Element. Why: This is the always-first choice, clearing the group filter entirely. How: This sets filGroStr to 'all' on click, disabled during the matching tour step. */ }


								All

								<span className='picker-group-count'>{ allPicArr.filter( ( picCurObj ) => !picCurObj.hidden ).length }</span>{ /* What: Group Count Span Element. Why: The All pill needs its own live total. How: This counts every non-hidden picker. */ }


							</button>

							{ exiGroArr.map( ( groCurStr ) => ( // What: Group Pill Map. Why: One pill is needed per existing group. How: This maps exiGroArr to one tab-role button each, keyed by its own name.


								<button
									key={ groCurStr }

									className={ ` picker-group-pill   ${ filGroStr === groCurStr ? 'is-on' : '' } ` }

									disabled={ disGroBoo }
									type='button'

									aria-selected={ filGroStr === groCurStr }
									role='tab'

									onClick={ () => setFilGroStr( groCurStr ) }
								>{ /* What: Group Pill Button Element. Why: Clicking a pill narrows the list to just that group. How: This sets filGroStr to groCurStr on click, disabled during the matching tour step. */ }


									{ groCurStr }{ /* What: Pill Name Expression. Why: Every group pill needs its own visible label. How: This renders groCurStr. */ }

									<span className='picker-group-count'>{ allPicArr.filter( ( picCurObj ) => picCurObj.group === groCurStr && !picCurObj.hidden ).length }</span>{ /* What: Group Count Span Element. Why: Every group pill needs its own live count. How: This counts every non-hidden picker whose own group matches groCurStr. */ }


								</button>


							) ) }


						</div>


					</div>


				) }


				{ ( exiModArr.length > 1 || conIteArr.length > 0 ) && ( // What: Type Row Check. Why: A single-mode app with no conditionals has nothing meaningful to filter by type. How: This renders the Type row only while there's more than one mode or at least one conditional.


					<div className='stat-filter-row'>{ /* What: Type Filter Row Div Element. Why: The Type label and its own pill rail belong together. How: This wraps the lbl span and the pill rail below. */ }


						<span className='stat-filter-lbl'>Type</span>{ /* What: Type Label Span Element. Why: The row needs its own literal name. How: This renders the literal text "Type". */ }

						<div
							ref={ typRowRef }

							className='picker-groups stat-scope-groups stat-scope-groups--type'

							aria-label='Filter pickers by type'
							role='tablist'
						>{ /* What: Type Pills Div Element. Why: This is the actual scrollable tablist of "All" plus every mode/Conditionals/Reminders pill, sorted together alphabetically. How: This renders the All pill, then maps the combined, sorted entry list to one pill each. */ }


							<button
								className={ ` picker-group-pill   ${ filTypStr === 'all' ? 'is-on' : '' } ` }

								disabled={ disGroBoo }
								type='button'

								aria-selected={ filTypStr === 'all' }
								role='tab'

								onClick={ () => setFilTypStr( 'all' ) }
							>{ /* What: All Pill Button Element. Why: This is the always-first choice, clearing the type filter entirely. How: This sets filTypStr to 'all' on click, disabled during the matching tour step. */ }


								All

								<span className='picker-group-count'>{ allPicArr.filter( ( picCurObj ) => !picCurObj.hidden ).length }</span>{ /* What: Type Count Span Element. Why: The All pill needs its own live total. How: This counts every non-hidden picker. */ }


							</button>

							{ [ // What: Type Entry Build. Why: Conditionals/Reminders sort in alphabetically alongside the real modes instead of being pinned, matching the Show row's own vocabulary. How: This builds one entry per mode plus (when applicable) Conditionals and Reminders, then sorts and maps them below.


								...exiModArr.map( ( modCurStr ) => ( { // What: Mode Entries Spread. Why: Every mode in use gets its own pill. How: This maps exiModArr to one entry each.


									cliFun : () => setFilTypStr( modCurStr ),                                                               // What: Click Function. Why: Clicking the pill applies this type filter. How: This sets filTypStr to modCurStr.
									couNum : allPicArr.filter( ( picCurObj ) => picCurObj.mode === modCurStr && !picCurObj.hidden ).length, // What: Count Number. Why: The pill shows how many visible pickers use this mode. How: This counts non-hidden pickers with a matching mode.
									keyStr : modCurStr,                                                                                     // What: Key String. Why: React needs a stable key per pill. How: This is the mode id.
									namStr : SED_NAM_OBJ.MOD_DEF_OBJ[ modCurStr ].labStr,                                                   // What: Name String. Why: The pill shows the mode's display name. How: This reads the mode's label.
									selBoo : filTypStr === modCurStr                                                                        // What: Selected Boolean. Why: The active pill is highlighted. How: This checks filTypStr against the mode.


								} ) ),

								...( conIteArr.length > 0 ? [ { // What: Conditionals Entry Spread. Why: The Conditionals pill only shows once a conditional exists. How: This spreads in one entry or nothing.


									couNum : conIteArr.length,             // What: Count Number. Why: The pill shows how many conditionals exist. How: This is conIteArr's length.
									keyStr : 'conditionals',               // What: Key String. Why: React needs a stable key per pill. How: This is the literal 'conditionals'.
									namStr : 'Conditionals',               // What: Name String. Why: The pill needs its own label. How: This is the literal "Conditionals".
									selBoo : filTypStr === 'conditionals', // What: Selected Boolean. Why: The active pill is highlighted. How: This checks filTypStr against 'conditionals'.

									cliFun : () => { // What: Click Function. Why: The Conditionals pill applies its type filter and jumps the Show row to the Conditionals box. How: This sets both in one click.


										setFilTypStr( 'conditionals' ); // What: Type Filter Set Call. Why: The pill filters to conditionals. How: This sets filTypStr to 'conditionals'.
										selScoFun( 'conditionals' );    // What: Scope Select Call. Why: The Show row should land on the Conditionals box too. How: This selects the 'conditionals' scope.


									}


								} ] : [] ),

								{ // What: Reminders Entry Object. Why: The Reminders pill always shows. How: This is one entry for the Reminders section.


									couNum : ( staAppObj.tasks || [] ).filter( ( tasCurObj ) => !tasCurObj.hidden ).length, // What: Count Number. Why: The pill shows how many visible reminders exist. How: This counts non-hidden tasks.
									keyStr : 'reminders',                                                                   // What: Key String. Why: React needs a stable key per pill. How: This is the literal 'reminders'.
									namStr : 'Reminders',                                                                   // What: Name String. Why: The pill needs its own label. How: This is the literal "Reminders".
									selBoo : filTypStr === 'reminders',                                                     // What: Selected Boolean. Why: The active pill is highlighted. How: This checks filTypStr against 'reminders'.

									cliFun : () => { // What: Click Function. Why: The Reminders pill applies its type filter and jumps the Show row to the Reminders box. How: This sets both in one click.


										setFilTypStr( 'reminders' ); // What: Type Filter Set Call. Why: The pill filters to reminders. How: This sets filTypStr to 'reminders'.
										selScoFun( 'reminders' );    // What: Scope Select Call. Why: The Show row should land on the Reminders box too. How: This selects the 'reminders' scope.


									}


								}


							]
								.sort( ( entOneObj, entTwoObj ) => entOneObj.namStr.localeCompare( entTwoObj.namStr ) ) // What: Entry Sort Call. Why: The pills list alphabetically by name. How: This sorts the entries with localeCompare.
								.map( ( filEntObj ) => (                                                                // What: Type Pill Map. Why: Every entry renders as one pill. How: This maps each sorted entry to a tab-role button.


									<button
										key={ filEntObj.keyStr }

										className={ ` picker-group-pill   ${ filEntObj.selBoo ? 'is-on' : '' } ` }

										disabled={ disGroBoo }
										type='button'

										aria-selected={ filEntObj.selBoo }
										role='tab'

										onClick={ filEntObj.cliFun }
									>{ /* What: Type Pill Button Element. Why: Clicking a pill narrows the list to that type. How: This marks itself selected when filEntObj.selBoo and runs filEntObj.cliFun. */ }


										{ filEntObj.namStr }{ /* What: Pill Name Expression. Why: Every pill needs its own visible label. How: This renders filEntObj.namStr. */ }

										<span className='picker-group-count'>{ filEntObj.couNum }</span>{ /* What: Pill Count Span Element. Why: Each pill shows how many entries it holds. How: This renders filEntObj.couNum. */ }


									</button>


								) ) }


						</div>


					</div>


				) }


				{ conIteArr.length > 0 && ( // What: Conditional Row Check. Why: A conditional-free app has nothing to filter by conditional. How: This renders the Conditionals row only while conIteArr has at least one entry.


					<div className='stat-filter-row'>{ /* What: Conditional Filter Row Div Element. Why: The Conditionals label and its own pill rail belong together. How: This wraps the lbl span and the pill rail below. */ }


						<span className='stat-filter-lbl'>Conditionals</span>{ /* What: Conditional Label Span Element. Why: The row needs its own literal name. How: This renders the literal text "Conditionals". */ }

						<div
							ref={ conRowRef }

							className='picker-groups stat-scope-groups stat-scope-groups--cond'

							aria-label='Filter pickers by conditional'
							role='tablist'
						>{ /* What: Conditional Pills Div Element. Why: This is the actual scrollable tablist of "All" plus every conditional. How: This renders the All pill, then maps the alphabetized conditional list to one pill each. */ }


							<button
								className={ ` picker-group-pill   ${ filConStr === 'all' ? 'is-on' : '' } ` }

								disabled={ disGroBoo }
								type='button'

								aria-selected={ filConStr === 'all' }
								role='tab'

								onClick={ () => setFilConStr( 'all' ) }
							>{ /* What: All Pill Button Element. Why: This is the always-first choice, clearing the conditional filter entirely. How: This sets filConStr to 'all' on click, disabled during the matching tour step. */ }


								All

								<span className='picker-group-count'>{ allPicArr.length }</span>{ /* What: Conditional Count Span Element. Why: The All pill needs its own live total. How: This is allPicArr's own total length. */ }


							</button>

							{ [ ...conIteArr ].sort( ( conOneObj, conTwoObj ) => conOneObj.name.localeCompare( conTwoObj.name ) ).map( ( conCurObj ) => ( // What: Conditional Pill Map. Why: One pill is needed per existing conditional, alphabetical. How: This maps the sorted list to one tab-role button each, keyed by its own id.


								<button
									key={ conCurObj.id }

									className={ ` picker-group-pill   ${ filConStr === conCurObj.id ? 'is-on' : '' } ` }

									disabled={ disGroBoo }
									type='button'

									aria-selected={ filConStr === conCurObj.id }
									role='tab'

									onClick={ () => { // What: On Click Handler. Why: Picking a conditional pill switches the list to that conditional alone. How: This sets the conditional filter and resets the group and type filters.


										setFilConStr( conCurObj.id ); // What: Conditional Filter Set Call. Why: The pill narrows the list to pickers using this conditional. How: This sets filConStr to conCurObj.id.
										setFilGroStr( 'all' );        // What: Group Filter Reset Call. Why: A conditional filter shouldn't stack on an old group filter. How: This resets filGroStr to 'all'.
										setFilTypStr( 'all' );        // What: Type Filter Reset Call. Why: A conditional filter shouldn't stack on an old type filter either. How: This resets filTypStr to 'all'.


									} }
								>{ /* What: Conditional Pill Button Element. Why: Clicking a pill narrows the list to pickers gated by just that conditional, resetting the other 2 filters. How: This commits filConStr, resets filGroStr/filTypStr, disabled during the matching tour step. */ }


									{ conCurObj.name }{ /* What: Pill Name Expression. Why: Every conditional pill needs its own visible label. How: This renders conCurObj.name. */ }

									<span className='picker-group-count'>{ conCouFun( conCurObj.id ) }</span>{ /* What: Conditional Count Span Element. Why: Every conditional pill needs its own live usage count. How: This calls conCouFun for conCurObj.id. */ }


								</button>


							) ) }


						</div>


					</div>


				) }


				<div className='stat-filter-row'>{ /* What: Show Filter Row Div Element. Why: The Show label and its own box rail belong together. How: This wraps the lbl span and the box rail below. */ }


					<span className='stat-filter-lbl'>Show</span>{ /* What: Show Label Span Element. Why: The row needs its own literal name. How: This renders the literal text "Show". */ }

					<div
						key={ filGroStr + '|' + filTypStr }
						ref={ scoRowRef }

						className='picker-tabs stat-scope-tabs'
					>{ /* What: Show Boxes Div Element. Why: This is the actual box rail, re-keyed on filter change so its own entrance animation replays. How: This renders the All box (when present) then maps shoEntArr's own remaining entries to one box each. */ }


						{ shoAllBoo && ( // What: All Box Check. Why: "All" only renders when shoEntArr itself decided to include it. How: This renders the All box only while shoAllBoo is true.


							<button
								className={ ` picker-tab   picker-tab--enter   ${ curScoStr === 'all' ? 'is-on' : '' } ` }

								style={{ animationDelay : '0ms' }}

								disabled={ disShoBoo }
								type='button'

								onClick={ () => selScoFun( 'all' ) }
							>{ /* What: All Box Button Element. Why: Selecting this box shows every visible section at once. How: This calls selScoFun('all') on click, disabled during the matching tour step. */ }


								<span className='picker-tab-name'>All</span>{ /* What: Box Name Span Element. Why: Every box needs its own visible name. How: This renders the literal text "All". */ }

								<span className='picker-tab-mode'>Everything</span>{ /* What: Box Mode Span Element. Why: Every box also shows its own kind. How: This renders the literal text "Everything". */ }


							</button>


						) }

						{ [ // What: Show Entry Build. Why: Everything after "All" sorts together alphabetically by its own displayed name, rather than Conditionals/Reminders being pinned. How: This builds one entry per applicable Conditionals/Reminders/picker, then sorts and maps them below.


							...( ( filTypStr === 'all' || filTypStr === 'conditionals' ) && conIteArr.length > 0 ? [ { // What: Conditionals Box Spread. Why: The Conditionals box shows when the Type filter allows it and at least one conditional exists. How: This spreads in one entry or nothing.


								cliFun : () => selScoFun( 'conditionals' ), // What: Click Function. Why: Clicking the box selects the Conditionals scope. How: This calls selScoFun with 'conditionals'.
								keyStr : 'conditionals',                    // What: Key String. Why: React needs a stable key per box. How: This is the literal 'conditionals'.
								labStr : 'Gates',                           // What: Label String. Why: The box's second line names what kind of section it is. How: This is the literal "Gates".
								namStr : 'Conditionals',                    // What: Name String. Why: The box needs its own name. How: This is the literal "Conditionals".
								selBoo : curScoStr === 'conditionals'       // What: Selected Boolean. Why: The active box is highlighted. How: This checks curScoStr against 'conditionals'.


							} ] : [] ),

							...( filTypStr === 'all' || filTypStr === 'reminders' ? [ { // What: Reminders Box Spread. Why: The Reminders box shows whenever the Type filter allows it. How: This spreads in one entry or nothing.


								cliFun : () => selScoFun( 'reminders' ), // What: Click Function. Why: Clicking the box selects the Reminders scope. How: This calls selScoFun with 'reminders'.
								keyStr : 'reminders',                    // What: Key String. Why: React needs a stable key per box. How: This is the literal 'reminders'.
								labStr : 'Tasks',                        // What: Label String. Why: The box's second line names what kind of section it is. How: This is the literal "Tasks".
								namStr : 'Reminders',                    // What: Name String. Why: The box needs its own name. How: This is the literal "Reminders".
								selBoo : curScoStr === 'reminders'       // What: Selected Boolean. Why: The active box is highlighted. How: This checks curScoStr against 'reminders'.


							} ] : [] ),

							...visPicArr.map( ( picCurObj ) => ( { // What: Picker Boxes Spread. Why: Every visible picker gets its own box. How: This maps visPicArr to one entry each.


								cliFun : () => selScoFun( picCurObj.id ),                  // What: Click Function. Why: Clicking the box selects this picker's scope. How: This calls selScoFun with the picker's id.
								ideStr : picCurObj.id,                                     // What: Identifier String. Why: The tour and help mode find a picker's box by its data-picker-id. How: This is the picker's id.
								keyStr : picCurObj.id,                                     // What: Key String. Why: React needs a stable key per box. How: This is the picker's id.
								labStr : SED_NAM_OBJ.MOD_DEF_OBJ[ picCurObj.mode ].labStr, // What: Label String. Why: The box's second line names the picker's mode. How: This reads the mode's label.
								namStr : picCurObj.name,                                   // What: Name String. Why: The box shows the picker's name. How: This reads picCurObj.name.
								selBoo : curScoStr === picCurObj.id                        // What: Selected Boolean. Why: The active box is highlighted. How: This checks curScoStr against the picker's id.


							} ) )


						]
							.sort( ( entOneObj, entTwoObj ) => entOneObj.namStr.localeCompare( entTwoObj.namStr ) ) // What: Entry Sort Call. Why: The boxes list alphabetically by name. How: This sorts the entries with localeCompare.
							.map( ( filEntObj, filIndNum ) => (                                                     // What: Show Box Map. Why: Every entry renders as one box, staggered by its index. How: This maps each sorted entry and its index to a button.


								<button
									key={ filEntObj.keyStr }

									className={ ` picker-tab   picker-tab--enter   ${ filEntObj.selBoo ? 'is-on' : '' } ` }

									style={{ animationDelay : ( filIndNum + 1 ) * 40 + 'ms' }}

									data-picker-id={ filEntObj.ideStr }

									disabled={ disShoBoo }
									type='button'

									onClick={ filEntObj.cliFun }
								>{ /* What: Picker Tab Button Element. Why: Each tab narrows the list to one picker. How: This marks itself selected when filEntObj.selBoo and runs filEntObj.cliFun. */ }


									<span className='picker-tab-name'>{ filEntObj.namStr }</span>{ /* What: Tab Name Span Element. Why: Every tab needs its own visible picker name. How: This renders filEntObj.namStr. */ }

									<span className='picker-tab-mode'>{ filEntObj.labStr }</span>{ /* What: Tab Mode Span Element. Why: Every tab also names its picker's mode. How: This renders filEntObj.labStr. */ }


								</button>


							) ) }


					</div>


				</div>


			</div>



			<div className='data-sort-bar'>{ /* What: Sort Bar Div Element. Why: The section sort control needs its own row, separate from the filter rows above. How: This wraps SorSelCom below. */ }


				<SorSelCom
					labTexStr='Sort'
					optLisArr={ SEC_SOR_ARR }
					selIdeStr='data-section-sort'
					value={ secSorStr }

					onChange={ ( keyValStr ) => actStoObj.setSorFun( 'sections', keyValStr ) }
				/>{ /* What: Sort Select Component. Why: This is the actual control for reordering Conditionals/Reminders/every picker card below. How: This commits the chosen key as this page's own persisted sections sort. */ }


			</div>



			<div
				key={ filGroStr + '::' + curScoStr + '::' + filConStr }

				className='data-list'
			>{ /* What: Data List Div Element. Why: This is the actual rendered list, re-keyed on filter/scope change so section entrance animations replay. How: This renders an empty-state message when nothing matches, otherwise every entry in shoSecArr plus the Create Picker trigger. */ }


				{ shoEmpBoo && ( // What: Empty State Check. Why: Every filter combined leaving nothing at all needs its own explanatory message. How: This renders only while all 3 sections are absent.


					<div className='data-empty'>{ /* What: Empty Div Element. Why: The empty-state title and its own explanation belong together. How: This wraps both paragraphs below. */ }


						<p className='data-empty-title'>Nothing matches these filters</p>{ /* What: Empty Title Paragraph Element. Why: The empty state needs its own short headline. How: This renders the literal text. */ }

						<p className='data-empty-sub'>No items match the current Group, Conditionals, and Show selections. Try widening a filter to “All”.</p>{ /* What: Empty Sub Paragraph Element. Why: The empty state also needs a suggested next action. How: This renders the literal text. */ }


					</div>


				) }



				{ shoSecArr.map( ( entCurObj, entIndNum ) => { // What: Shown Section Map. Why: One card is needed per section entry, plus (last) the in-progress draft. How: This branches on entCurObj.kinStr, rendering ConManCom/RemManCom directly or a full picker card otherwise.


					if ( entCurObj.kinStr === 'conditionals' ) { // What: Conditionals Branch Guard. Why: The Conditionals section is its own separately-maintained manager, not a picker card. How: This renders ConManCom directly, keyed statically since only one can ever exist.


						return (


							<ConManCom
								key='cnd-shown'

								actStoObj={ actStoObj }
								staAppObj={ staAppObj }
							/> // What: Conditional Manager Component. Why: The Conditionals section renders as its own manager card. How: This is passed the app state and actions.


						);


					}



					if ( entCurObj.kinStr === 'reminders' ) { // What: Reminders Branch Guard. Why: The Reminders section is its own separately-maintained manager, not a picker card. How: This renders RemManCom directly, keyed statically since only one can ever exist.


						return (


							<RemManCom
								key='rem-shown'

								actStoObj={ actStoObj }
								staAppObj={ staAppObj }
							/> // What: Reminder Manager Component. Why: The Reminders section renders as its own manager card. How: This is passed the app state and actions.


						);


					}



					const picCurObj = entCurObj.picObj;                                                               // What: Picker Current Object. Why: Every remaining branch below is a real picker card and needs its own record. How: This reads entCurObj.pk.
					const isaDraBoo = !!entCurObj.draBoo;                                                             // What: Is-A Draft Boolean. Why: The draft's own card renders slightly differently (always expanded, no collapse toggle, Items starts closed). How: This checks entCurObj.isDraft.
					const picIteArr = staAppObj.items.filter( ( iteCurObj ) => iteCurObj.pickerId === picCurObj.id ); // What: Picker Item Array. Why: This card's own header count and Items section both need this picker's own items. How: This filters the whole app's items down to just this picker's own.
					const eliCouNum = picIteArr.filter( ( iteCurObj ) => !iteCurObj.vacation ).length;                // What: Eligible Count Number. Why: The header's own count reads as "N of M", N being how many are actually eligible. How: This counts every item that isn't on vacation.
					const allVacBoo = picIteArr.length > 0 && picIteArr.every( ( iteCurObj ) => iteCurObj.vacation ); // What: All Vacation Boolean. Why: A card whose every item is on vacation gets its own visual "inactive" treatment. How: This is true only when there's at least one item and every one of them is on vacation.
					const secOpeBoo = isaDraBoo || colMapObj[ picCurObj.id ] === false;                               // What: Section Open Boolean. Why: A draft is always expanded (no toggle at all, see the header button's disabled prop below); an existing picker reads its own persisted state. How: This is true for a draft, or when the persisted entry is explicitly false.
					const isaEasBoo = picCurObj.mode === 'ease-up' || picCurObj.mode === 'ease-down';                 // What: Is-A Ease Boolean. Why: The item sort options and the meta text per item both depend on this. How: This is true whenever picCurObj.mode is 'ease-up' or 'ease-down'.
					const useWeiBoo = picCurObj.mode === 'weighted' || picCurObj.mode === 'dynamic';                  // What: Uses Weight Boolean. Why: Same reasoning as isaEasBoo, for the weighted/dynamic modes. How: This is true whenever picCurObj.mode is 'weighted' or 'dynamic'.
					const incDaiBoo = staAppObj.daily.pickerIds.includes( picCurObj.id );                             // What: Included Daily Boolean. Why: PicConCom needs to know this picker's own current daily-generator membership. How: This checks staAppObj.daily.pickerIds for picCurObj.id.
					const conColBoo = !!colMapObj[ picCurObj.id + ':controls' ];                                      // What: Controls Collapsed Boolean. Why: The Controls disclosure's own persisted state is keyed separately from the card's own open/closed state. How: This reads colMapObj at the ':controls' suffix key.
					const iteColBoo = isaDraBoo ? !draIteBoo : !!colMapObj[ picCurObj.id + ':items' ];                // What: Items Collapsed Boolean. Why: A draft's own Items section tracks draIteBoo instead of the normal persisted map. How: This reads draIteBoo for a draft, otherwise the persisted entry at the ':items' suffix key.


					const opeSetBoo = opeIteStr != null;                                             // What: Open Set Boolean. Why: Some item has to be open for a new one to be in progress. How: This checks opeIteStr isn't null.
					const newOpeBoo = newIteRef.current === opeIteStr;                               // What: New Open Boolean. Why: The open item must be the brand-new one. How: This compares newIteRef to opeIteStr.
					const ownOpeBoo = picIteArr.some( ( iteCurObj ) => iteCurObj.id === opeIteStr ); // What: Own Open Boolean. Why: The new item must belong to this picker. How: This checks picIteArr for the open id.

					const ownNewBoo = opeSetBoo && newOpeBoo && ownOpeBoo; // What: Own New Boolean. Why: PicConCom's footer must know when this picker has an unsaved new item open. How: This ANDs the 3 checks above.


					const iteSorStr = staAppObj.ui?.dataSort?.[ picCurObj.id ] || 'name-asc';              // What: Item Sort String. Why: Every picker's own item list needs its own persisted sort choice. How: This reads staAppObj.ui.dataSort at this picker's own id, falling back to 'name-asc'.
					const falEasObj = isaEasBoo ? PIC_NAM_OBJ.aveEasFun( picIteArr, picCurObj.id ) : null; // What: Fallback Ease Object. Why: An item with no ease band of its own falls back to the same average the picking engine itself uses. How: This is computed once per card, shared by both the sort entries and every item row below.


					const iteEntFun = ( iteCurObj ) => { // What: Item Entry Function. Why: Every item needs the same comparable shape before sorEntFun can sort them. How: This builds a { name, type, group, count, range, boost, isActive } entry per item, mode-dependent per pickerItemSortOptions.


						const easMaxNum = iteCurObj.easeMax ?? falEasObj?.easeMax ?? 20; // What: Ease Max Number. Why: The Range field below needs this item's own (or the fallback) ease-max value. How: This reads iteCurObj.easeMax, falling back to falEasObj's own easeMax, then a hardcoded 20.



						return { // What: Item Entry Return. Why: sorEntFun needs one comparable shape per item, mode-dependent fields included. How: This builds that entry from iteCurObj plus the resolved isaEasBoo/useWeiBoo/easMaxNum context above.


							boost    : picCurObj.mode === 'dynamic' ? ( iteCurObj.value ?? 0 ) : null,                          // What: Boost. Why: The Boost sort needs a dynamic item's boost value. How: This is the item's value for a dynamic picker, otherwise null.
							count    : isaEasBoo ? ( iteCurObj.value ?? 0 ) : ( useWeiBoo ? ( iteCurObj.weight ?? 1 ) : null ), // What: Count. Why: The Count sort needs each item's charge or weight. How: This is the value for ease modes, the weight for weighted/dynamic, otherwise null.
							group    : null,                                                                                    // What: Group. Why: Items have no group to sort by. How: This is always null.
							isActive : !iteCurObj.vacation,                                                                     // What: Is Active. Why: The Active sort puts vacationing items apart. How: This is true unless the item is on vacation.
							name     : iteCurObj.name,                                                                          // What: Name. Why: The Name sort needs each item's name. How: This reads the name directly.
							range    : isaEasBoo ? Math.max( 1, Math.round( 100 / ( easMaxNum || 1 ) ) ) : null,                // What: Range. Why: The Range sort needs an ease item's range in days. How: This divides 100 by easMaxNum, never below 1, or is null outside ease modes.
							type     : null                                                                                     // What: Type. Why: Items have no type to sort by. How: This is always null.


						};


					};


					const sorIteArr = [ ...picIteArr ].sort( ( iteOneObj, iteTwoObj ) => sorEntFun( iteEntFun( iteOneObj ), iteEntFun( iteTwoObj ), iteSorStr ) ); // What: Sorted Item Array. Why: The rendered item list needs to actually be in iteSorStr's own order. How: This sorts a copy of picIteArr via sorEntFun.
					const disIteArr = freEdiFun( sorIteArr, opeIteStr, newIteRef.current, froIndRef );                                                             // What: Display Item Array. Why: An item mid-edit must not visually jump position if its own sort key changes underneath it. How: This calls the shared freEdiFun helper.



					const staAddFun = () => { // What: Start Add Function. Why: This is the "+ Add to X" button's own action, factored out so a brand-new draft's "Add Items" footer button can trigger the exact same first-item flow. How: This creates a fresh item and opens its own editor.


						if ( newIteRef.current ) return; // What: Rapid Click Guard. Why: A rapid double-click must not create 2 items at once. How: This bails out while a brand-new item is already in progress.



						const nexIdeStr = 'it_' + Math.random().toString( 36 ).slice( 2, 8 ); // What: Next Identifier String. Why: The brand-new item needs its own id immediately. How: This generates a short random id with an 'it_' prefix.


						actStoObj.addIteFun( picCurObj.id, 'New item', nexIdeStr ); // What: Add Item Call. Why: This is the actual creation of the item. How: This adds an item named 'New item' under picCurObj.id, with the freshly-generated id.

						newIteRef.current = nexIdeStr; // What: New Item Mark. Why: Cancel must discard this exact item, not revert it to a snapshot. How: This flags nexIdeStr as the brand-new, not-yet-kept item.
						setInsIteStr( nexIdeStr );     // What: Insert Item Set Call. Why: The freshly-created row should play the slide-in entrance. How: This sets insIteStr to nexIdeStr.
						setOpeIteStr( nexIdeStr );     // What: Open Item Set Call. Why: The freshly-created item's own editor should open immediately. How: This sets opeIteStr to nexIdeStr.


					};


					const keeCloFun = ( iteIdeStr ) => { // What: Keep Close Function. Why: The row's own collapse chevron and IteEdiCom's own Save both mean "keep this, I'm done", so both need the exact same cleanup, kept in one place so neither can drift out of sync with the other. How: This calls the open editor's own keep(), clears the new-item flag, and closes only if this item is still the open one.


						opeEdiRef.current?.keeSavFun(); // What: Keep Call Guard. Why: The currently-open IteEdiCom instance needs to mark itself already-handled before this closes it, so its own implicit-close guard doesn't ALSO try to revert/discard it. How: This calls .keep() on whatever opeEdiRef currently points at, if anything.

						if ( newIteRef.current === iteIdeStr ) newIteRef.current = null; // What: New Item Clear Guard. Why: A kept item is no longer "brand new and undiscarded". How: This clears newIteRef only when it currently points at this exact item.



						setOpeIteStr( ( opeCurStr ) => opeCurStr === iteIdeStr ? null : opeCurStr ); // What: Open Item Close Guard. Why: Only close if this item is STILL the open one (it might already have changed). How: This nulls opeIteStr only when it currently equals iteIdeStr.


					};



					return (


						<section
							key={ picCurObj.id }
							ref={ isaDraBoo ? draCarRef : undefined }

							className={ ` cat cat--enter   ${ allVacBoo ? 'is-vac' : '' }   ${ rmvPicStr === picCurObj.id ? 'cat--removing' : '' }   ${ hetPicBoo ? 'ob-tour-pulse' : '' } ` }

							style={{
								animationDelay : ( isaDraBoo ? 0 : entIndNum * 45 ) + 'ms',
								...( isaDraBoo ? { scrollMarginTop : 14 } : {} )
							}}

							data-picker-id={ picCurObj.id }

							onAnimationEnd={ ( aniEveObj ) => { // What: On Animation End Handler. Why: A removed picker must leave the store only after its exit animation has played. How: This deletes the picker and clears rmvPicStr once the card itself (not a child) finishes animating while marked for removal.


								if ( aniEveObj.target === aniEveObj.currentTarget && rmvPicStr === picCurObj.id ) { // What: Removal Finished Guard. Why: The card must actually be removed from the store only once its own removal animation (not a child's) has genuinely finished. How: This checks the event's own target/currentTarget match and that this card is still the one marked removing.


									actStoObj.delPicFun( picCurObj.id ); // What: Remove Picker Call. Why: This is the actual, final destructive action, deferred until the animation finished. How: This removes picCurObj.id from the store.
									setRmvPicStr( null );                // What: Removing Clear Call. Why: The removal-animation flag must clear once it's actually done its job. How: This resets rmvPicStr to null.


								}


							} }
						>{ /* What: Category Section Element. Why: This is one picker's own top-level card, matching every other Data tab category's own outer landmark. How: This plays the removal animation via rmvPicStr/onAnimationEnd, and renders the header + ColDisCom-wrapped body below. */ }


							<header
								className='cat-h'

								onClick={ ( clkEveObj ) => { // What: On Click Handler. Why: Clicking anywhere on the header outside a real button toggles the card. How: This toggles the section unless it's a draft, the tour is guarding the header, or the click landed on a button.


									const notDraBoo = !isaDraBoo;                            // What: Not Draft Boolean. Why: A draft card is always expanded. How: This negates isaDraBoo.
									const notDetBoo = !detPicBoo;                            // What: Not Disable-Edit-Tour Boolean. Why: The Edit Items tour guards the header during some steps. How: This negates detPicBoo.
									const notButBoo = !clkEveObj.target.closest( 'button' ); // What: Not Button Boolean. Why: A click on a real button inside the header has its own action. How: This checks the click target isn't inside a button.

									const togSecBoo = notDraBoo && notDetBoo && notButBoo; // What: Toggle Section Boolean. Why: The header only toggles when all 3 checks pass. How: This ANDs them.


									if ( togSecBoo ) togSecFun( picCurObj.id ); // What: Toggle Section Guard. Why: This is the actual toggle. How: This calls togSecFun when togSecBoo is true.


								} }
							>{ /* What: Category Header Element. Why: Clicking anywhere on the header (outside a real button) should toggle the card. How: This calls togSecFun unless this is a draft, the tour is guarding the header, or the click actually landed on a button. */ }


								<button
									className='cat-h-l'

									disabled={ isaDraBoo || detPicBoo }
									type='button'

									aria-expanded={ secOpeBoo }

									onClick={ () => togSecFun( picCurObj.id ) }
								>{ /* What: Header Left Button Element. Why: This is the actual clickable control for expanding/collapsing the card. How: This is disabled for a draft (always expanded) or during the guarded tour step. */ }


									<span className={ ` chev   ${ secOpeBoo ? 'is-open' : '' } ` }>{ /* What: Chevron Span Element. Why: The card's own open/closed state needs a visible directional indicator. How: This rotates via the 'is-open' class and renders the shared chevron icon. */ }


										<IcoSvgCom
											icoNamStr='chvEle'
											sizValNum={ 14 }
										/>{ /* What: Icon Svg Component. Why: The chevron span needs its own recognizable directional glyph. How: This renders the 'chvEle' icon at a fixed size. */ }


									</span>

									<span className='cat-h-main'>{ /* What: Header Main Span Element. Why: The picker's own name and live count belong together. How: This wraps the h2 and the count span below. */ }


										<h2 className='cat-name'>{ picCurObj.name }</h2>{ /* What: Category Name Element. Why: Every card needs its own visible name. How: This renders picCurObj's own name. */ }

										<span className='cat-count'>{ /* What: Category Count Span Element. Why: The eligible/total count needs 3 separate elements (see styles2.css) rather than one text run. How: This wraps the eligible count, the "of" separator, and the total count below. */ }


											<span className='cat-count-n'>{ eliCouNum }</span>{ /* What: Eligible Count Span Element. Why: The count leads with how many items are currently eligible. How: This renders eliCouNum. */ }

											<span className='cat-count-of'>of</span>{ /* What: Of Span Element. Why: The two counts need a joining word between them. How: This renders the literal text "of". */ }

											<span className='cat-count-n'>{ picIteArr.length }</span>{ /* What: Total Count Span Element. Why: The count ends with the picker's total item count. How: This renders picIteArr.length. */ }


										</span>


									</span>


								</button>

								<span className='cat-h-right'>{ /* What: Header Right Span Element. Why: The type/group tags and the active toggle need one grouped slot so a narrow viewport can stack them together in place, freeing width for the name. How: This wraps the tags span and the vac-toggle button below. */ }


									<span className='cat-h-tags'>{ /* What: Header Tags Span Element. Why: The type and group pills need their own fixed-width columns so they line up across every card regardless of text length. How: This wraps 2 InfTipCom-wrapped labels below. */ }


										<InfTipCom
											className='cat-mode-label'

											labTexStr={ SED_NAM_OBJ.MOD_DEF_OBJ[ picCurObj.mode ].labStr }
											trnOnlBoo
										>{ SED_NAM_OBJ.MOD_DEF_OBJ[ picCurObj.mode ].labStr }</InfTipCom>{ /* What: Info Tip Component. Why: A long mode label like "Dynamic Weighted" can still truncate at this width; also read by help-mode's own pickerRow entry to build its "{type} Picker" badge title. How: This reveals the full label on demand only when it's actually truncated. */ }



										<InfTipCom
											className='cat-group'

											labTexStr={ picCurObj.group }
											trnOnlBoo
										>{ picCurObj.group }</InfTipCom>{ /* What: Info Tip Component. Why: A long group name can also still truncate at this width. How: This reveals the full name on demand only when it's actually truncated. */ }


									</span>

									<button
										className='vac-toggle'

										aria-label={ `${ allVacBoo ? 'Activate' : 'Deactivate' } all items in ${ picCurObj.name }` }
										aria-pressed={ !!allVacBoo }
										title='Active toggle for all items in this picker'

										onClick={ ( clkEveObj ) => { // What: On Click Handler. Why: The vacation button sits inside the clickable header, so it must act alone. How: This stops propagation, then toggles the picker's vacation.


											clkEveObj.stopPropagation(); // What: Propagation Stop Call. Why: The click must not also toggle the card header underneath. How: This stops clkEveObj from bubbling.

											actStoObj.togVacFun( picCurObj.id, 'picker' ); // What: Toggle Vacation Call. Why: This is the actual vacation toggle for the whole picker. How: This calls togVacFun with the picker's id and kind.


										} }
									>{ /* What: Vacation Toggle Button Element. Why: This is the actual bulk active/inactive control for every item in this picker at once. How: This stops the click from also toggling the card's own collapse, then calls togVacFun. */ }


										<IcoSvgCom
											icoNamStr={ allVacBoo ? 'mooEle' : 'spaEle' }
											sizValNum={ 14 }
										/>{ /* What: Icon Svg Component. Why: The bulk active/inactive toggle needs a recognizable glyph reflecting its own current state. How: This renders 'moon' while allVacBoo, 'sparkle' otherwise. */ }

										<span
											key={ allVacBoo ? 'inactive' : 'active' }

											className='set-sub-fade'
										>{ allVacBoo ? 'Inactive' : 'Active' }</span>{ /* What: Toggle Label Span Element. Why: The toggle also needs its own live text, cross-faded via its own key change. How: This renders "Inactive" while allVacBoo, "Active" otherwise. */ }


									</button>


								</span>


							</header>



							<ColDisCom
								isaInsBoo={ isaDraBoo }
								open={ secOpeBoo }
							>{ /* What: Collapse Disclosure Component. Why: The card's own body (Controls + Items) only needs to exist while it's actually expanded, instant (no animation) for a brand-new draft. How: This opens per secOpeBoo. */ }


								<div className='cat-body'>{ /* What: Category Body Div Element. Why: The Controls and Items disclosures both belong in one grouped body. How: This wraps both nested disclosures below. */ }


									<button
										className={ ` rd-ctl   ${ hetConBoo ? 'ob-tour-pulse' : '' } ` }

										disabled={ detConBoo }
										type='button'

										aria-expanded={ !conColBoo }

										onClick={ () => actStoObj.togColFun( picCurObj.id + ':controls' ) }
									>{ /* What: Controls Toggle Button Element. Why: This picker's own pick-algorithm/schedule config moved here from Settings, so it needs its own nested disclosure toggle. How: This toggles the persisted ':controls' entry, disabled during the guarded tour step. */ }


										<span className='rd-ctl-l'>{ /* What: Controls Left Span Element. Why: The chevron and the "Controls" kicker belong together. How: This wraps both spans below. */ }


											<span className={ ` chev   ${ conColBoo ? '' : 'is-open' } ` }>{ /* What: Chevron Span Element. Why: The disclosure's own open/closed state needs a visible directional indicator. How: This wraps the chevron icon, rotated via its own is-open class. */ }


												<IcoSvgCom
													icoNamStr='chvEle'
													sizValNum={ 12 }
												/>{ /* What: Icon Svg Component. Why: The chevron span needs its own recognizable directional glyph. How: This renders the 'chvEle' icon at a fixed size. */ }


											</span>

											<span className='kicker'>Controls</span>{ /* What: Controls Kicker Span Element. Why: The disclosure needs its own visible label. How: This renders the literal text "Controls". */ }


										</span>

										{ conColBoo && <span className='rd-ctl-sum'>{ Object.keys( SED_NAM_OBJ.MOD_DEF_OBJ ).length } options</span> }{ /* What: Controls Summary Check. Why: A collapsed disclosure still needs a hint of what's inside. How: This renders only while conColBoo is true. */ }


									</button>



									<ColDisCom
										isaInsBoo={ isaDraBoo }
										open={ !conColBoo }
									>{ /* What: Collapse Disclosure Component. Why: PicConCom itself is expensive/stateful enough that it only needs to exist while the Controls disclosure is actually open. How: This opens per !conColBoo. */ }


										<PicConCom
											actStoObj={ actStoObj }
											allGroArr={ exiGroArr }
											conIteArr={ staAppObj.conditionals || [] }
											daiIdeArr={ staAppObj.daily.pickerIds }
											hasNewBoo={ ownNewBoo }
											incDaiBoo={ incDaiBoo }
											isaNewBoo={ isaDraBoo }
											iteSecBoo={ draIteBoo }
											picDatObj={ picCurObj }
											picIteArr={ picIteArr }

											onCanNewFun={ canNewFun }
											onColConFun={ () => actStoObj.togColFun( picCurObj.id + ':controls' ) }
											onOpeSecFun={ () => { // What: On Open Section Handler. Why: The draft's first "Add Items" click must open the Items section and also queue a ready-to-type new item. How: This opens draIteBoo and arms penAutBoo together.


												setDraIteBoo( true ); // What: Draft Items Open Call. Why: The draft's own Items section starts closed and must open here. How: This sets draIteBoo to true.
												setPenAutBoo( true ); // What: Pending Auto Set Call. Why: The first new item should be created once the section finishes opening. How: This sets penAutBoo to true.


											} }
											onReqDelFun={ () => delPicFun( picCurObj.id ) }
											onSavNewFun={ savNewFun }
										/>{ /* What: Picker Controls Component. Why: This is this picker's own full Controls body. How: This is passed the live picker/items/schedule fields and every handler this card's own draft lifecycle needs. */ }


									</ColDisCom>



									<button
										className={ ` rd-ctl   ${ hetIteBoo ? 'ob-tour-pulse' : '' } ` }

										disabled={ detIteBoo }
										type='button'

										aria-expanded={ !iteColBoo }

										onClick={ () => isaDraBoo ? setDraIteBoo( ( preOpeBoo ) => !preOpeBoo ) : actStoObj.togColFun( picCurObj.id + ':items' ) }
									>{ /* What: Items Toggle Button Element. Why: The item list needs its own nested disclosure toggle, defaulting open except for a fresh draft. How: This toggles draIteBoo for a draft, otherwise the persisted ':items' entry, disabled during the guarded tour step. */ }


										<span className='rd-ctl-l'>{ /* What: Controls Left Span Element. Why: The chevron and the label sit together on the toggle's left side. How: This wraps the chevron span and the kicker. */ }


											<span className={ ` chev   ${ iteColBoo ? '' : 'is-open' } ` }>{ /* What: Chevron Span Element. Why: The disclosure's own open/closed state needs a visible directional indicator. How: This wraps the chevron icon, rotated via its own is-open class. */ }


												<IcoSvgCom
													icoNamStr='chvEle'
													sizValNum={ 12 }
												/>{ /* What: Icon Svg Component. Why: The chevron span needs its own recognizable directional glyph. How: This renders the 'chvEle' icon at a fixed size. */ }


											</span>

											<span className='kicker'>Items</span>{ /* What: Items Kicker Span Element. Why: The disclosure needs its own visible label. How: This renders the literal text "Items". */ }


										</span>

										{ iteColBoo && <span className='rd-ctl-sum'>{ picIteArr.length } items</span> }{ /* What: Items Summary Check. Why: A collapsed disclosure still needs a hint of what's inside. How: This renders only while iteColBoo is true. */ }


									</button>



									<ColDisCom open={ !iteColBoo }>{ /* What: Collapse Disclosure Component. Why: The item rows themselves only need to exist while the Items disclosure is actually open. How: This opens per !iteColBoo. */ }


										<React.Fragment>{ /* What: Items Fragment Element. Why: The add button, the sort control, and every item row are true siblings with no shared wrapper of their own. How: This groups all 3 pieces without adding an extra DOM node. */ }


											{ tutProBoo ? ( // What: Tutorial Progress Check. Why: The add control must stay disabled (with an explanatory tip) while the Welcome Tour's own checklist is still in progress. How: This renders a disabled InfTipCom-wrapped control in that state, otherwise the real button.


												<InfTipCom
													className='rd-add is-tour-disabled'

													actNamStr={ `Add to ${ picCurObj.name.toLowerCase() }` }
													labTexStr='This button is disabled until all tutorials are completed.'
												>{ /* What: Info Tip Component. Why: A disabled control still needs to explain why it can't be clicked yet. How: This wraps the same visible label/icon the real button uses. */ }


													<IcoSvgCom
														icoNamStr='pluEle'
														sizValNum={ 13 }
													/>{ /* What: Icon Svg Component. Why: The disabled add control still needs a recognizable "add" glyph beside its own label. How: This renders the 'pluEle' icon at a fixed size. */ } Add to { picCurObj.name.toLowerCase() }


												</InfTipCom>


											) : ( // What: Add Button Branch. Why: Outside the guided checklist, the real working Add-item control belongs here instead. How: This renders the else branch, taken while tutProBoo is false.


												<button
													className='rd-add'

													disabled={ detAddBoo }

													onClick={ staAddFun }
												>{ /* What: Add Button Element. Why: This is the actual "create a brand-new item" affordance. How: This calls staAddFun on click, disabled during the guarded tour step. */ }


													<IcoSvgCom
														icoNamStr='pluEle'
														sizValNum={ 13 }
													/>{ /* What: Icon Svg Component. Why: The add control needs a recognizable "add" glyph beside its own label. How: This renders the 'pluEle' icon at a fixed size. */ } Add to { picCurObj.name.toLowerCase() }


												</button>


											) }



											{ picIteArr.length > 1 && ( // What: Multiple Items Check. Why: A sort control is only useful once there's more than one item to sort. How: This renders SorSelCom only while picIteArr has 2 or more entries.


												<SorSelCom
													labTexStr='Sort'
													optLisArr={ pisOptFun( picCurObj.mode ) }
													selIdeStr={ `item-sort-${ picCurObj.id }` }
													value={ iteSorStr }

													onChange={ ( keyValStr ) => actStoObj.setSorFun( picCurObj.id, keyValStr ) }
												/> // What: Sort Select Component. Why: This is the actual control for reordering this picker's own item list, mode-dependent per pisOptFun. How: This commits the chosen key as this picker's own persisted item sort.


											) }



											{ disIteArr.map( ( iteCurObj ) => { // What: Item Row Map. Why: One collapsible row is needed per item, in disIteArr's own (freeze-aware) order. How: This computes this item's own meta text, then renders its closed/open row and editor below.


												const iteOpeBoo = opeIteStr === iteCurObj.id;                            // What: Item Open Boolean. Why: This specific row needs to know whether IT is the currently-open one. How: This compares iteCurObj.id against opeIteStr.
												const easMinNum = iteCurObj.easeMin ?? falEasObj?.easeMin ?? 10;         // What: Ease Min Number. Why: The meta text below needs this item's own (or the fallback) ease-min value, same fallback the picking engine itself uses. How: This reads iteCurObj.easeMin, falling back to falEasObj's own easeMin, then a hardcoded 10.
												const easMaxNum = iteCurObj.easeMax ?? falEasObj?.easeMax ?? 20;         // What: Ease Max Number. Why: Same reasoning as easMinNum, for the max end. How: This reads iteCurObj.easeMax, falling back to falEasObj's own easeMax, then a hardcoded 20.
												const sooValNum = Math.max( 1, Math.round( 100 / ( easMaxNum || 1 ) ) ); // What: Soonest Value Number. Why: The meta text's own day-band needs its own near end. How: This converts easMaxNum into a day count.
												const latValNum = Math.max( 1, Math.round( 100 / ( easMinNum || 1 ) ) ); // What: Latest Value Number. Why: Same reasoning as sooValNum, for the far end. How: This converts easMinNum into a day count.


												const rowSumStr = iteCurObj.vacation // What: Row Summary String. Why: The closed row's own summary line depends entirely on whether the item is on vacation, then on the picker's own mode. How: This picks 'Inactive', an ease-band range, a weight, or "Equal chance".
													? 'Inactive'                                                                                 // What: Vacation Summary Branch. Why: An item on vacation just says so. How: This returns the literal "Inactive".
													: isaEasBoo                                                                                  // What: Ease Mode Check. Why: An ease item summarizes its day band instead of a weight. How: This checks isaEasBoo.
													? `${ sooValNum }–${ latValNum } ${ CAD_NAM_OBJ.uniWorFun( picCurObj.cadence, latValNum ) }` // What: Day Band Branch. Why: An ease item reads as its soonest-to-latest range. How: This joins both ends with the cadence's unit word.
													: useWeiBoo                                                                                  // What: Weighted Mode Check. Why: A weighted or dynamic item summarizes its weight. How: This checks useWeiBoo.
													? `Weight w${ iteCurObj.weight }`                                                            // What: Weight Branch. Why: A weighted item shows its weight. How: This prefixes the weight with "w".
													: 'Equal chance';                                                                            // What: Equal Chance Branch. Why: A plain random item has no weight to show. How: This returns the literal "Equal chance".



												return (


													<div
														key={ iteCurObj.id }
														ref={ iteOpeBoo ? opeRowRef : undefined }

														className={ ` rd-item   ${ iteCurObj.vacation ? 'is-vac' : '' }   ${ iteOpeBoo ? 'is-editing' : '' }   ${ insIteStr === iteCurObj.id ? 'rd-item--insert' : '' }   ${ hetRowBoo ? 'is-tour-target ob-tour-pulse' : '' } ` }

														onAnimationEnd={ () => { if ( insIteStr === iteCurObj.id ) setInsIteStr( null ); } }
													>{ /* What: Row Div Element. Why: Every item needs its own collapsible row wrapper, capturing the entrance/insert animation and the tour highlight. How: This clears insIteStr once this row's own insert animation finishes. */ }


														{ iteOpeBoo ? ( // What: Editing Check. Why: The open row swaps its own header for a live name input, since a real button can't legally contain that input. How: This renders the editing header while iteOpeBoo is true, otherwise the normal clickable row.


															<div className='rd-row'>{ /* What: Row Div Element. Why: The name input and its own chevron button need their own row. How: This wraps the rd-main span and the chevron button below. */ }


																<span className='rd-main'>{ /* What: Main Span Element. Why: The name input needs its own wrapper matching the closed row's own layout. How: This wraps the input below. */ }


																	<input
																		ref={ ( inpCurEle ) => { // What: Focus Reference Callback. Why: The input should focus once when it mounts, without the page jumping. How: This focuses a newly attached input with preventScroll and remembers it in focInpRef so re-renders don't refocus it.


																			if ( inpCurEle && focInpRef.current !== inpCurEle ) { // What: New Input Guard. Why: Only a freshly attached input should take focus. How: This skips null detaches and the input already focused before.


																				inpCurEle.focus( { preventScroll : true } ); // What: Focus Call. Why: The user can type the name right away. How: This focuses inpCurEle without scrolling the page.

																				focInpRef.current = inpCurEle; // What: Focused Input Record. Why: A later re-render must not steal focus back. How: This stores inpCurEle in focInpRef.


																			}


																		} }

																		className='rd-name-input'

																		maxLength={ 60 }
																		placeholder='Item name'
																		type='text'
																		value={ iteCurObj.name }

																		aria-label='Item name'

																		onBlur={ ( bluEveObj ) => { // What: On Blur Handler. Why: Leaving the name field should commit a tidied final name. How: This trims the typed value and renames the item only when the result is non-empty.


																			const namTriStr = bluEveObj.target.value.trim(); // What: Name Trimmed String. Why: A blur commit should tidy the name, not commit stray whitespace. How: This trims bluEveObj's own current value.


																			if ( namTriStr ) actStoObj.renIteFun( iteCurObj.id, namTriStr ); // What: Rename Item Guard. Why: Blurring on an emptied field should not commit a blank name. How: This only calls renIteFun when namTriStr is non-empty.


																		} }
																		onChange={ ( chaEveObj ) => actStoObj.updIteFun( iteCurObj.id, { name : chaEveObj.target.value } ) }
																		onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Enter' ) keyEveObj.currentTarget.blur(); } }
																	/>{ /* What: Name Input Element. Why: An item's own name is edited live, right in the row header. How: This commits every keystroke immediately, and tidies the name on blur. */ }


																</span>

																<button
																	className='rd-chev chev is-open'

																	type='button'

																	aria-label='Collapse'

																	onClick={ () => keeCloFun( iteCurObj.id ) }
																>{ /* What: Chevron Button Element. Why: The chevron is its own real button (not a decoration) since the row itself can no longer be one while editing. How: This calls keeCloFun, the same "deliberate close" handler IteEdiCom's own Save uses. */ }


																	<IcoSvgCom
																		icoNamStr='chvEle'
																		sizValNum={ 16 }
																	/>{ /* What: Icon Svg Component. Why: The chevron button needs its own recognizable directional glyph. How: This renders the 'chvEle' icon at a fixed size. */ }


																</button>


															</div>


														) : ( // What: Normal Row Branch. Why: A closed row just needs the plain clickable header instead. How: This renders the else branch, taken while iteOpeBoo is false.


															<button
																className='rd-row'

																type='button'

																aria-expanded={ iteOpeBoo }

																onClick={ () => setOpeIteStr( iteOpeBoo ? null : iteCurObj.id ) }
															>{ /* What: Row Button Element. Why: A closed row is a plain clickable control that opens (or closes) its own editor. How: This toggles opeIteStr between null and iteCurObj.id. */ }


																<span className='rd-main'>{ /* What: Main Span Element. Why: The name and its own meta line belong together. How: This wraps the name and sched spans below. */ }


																	<span className='rd-name'>{ iteCurObj.name }</span>{ /* What: Name Span Element. Why: Every item row needs its own visible name. How: This renders iteCurObj.name. */ }

																	<span className='rd-sched'>{ rowSumStr }</span>{ /* What: Sched Span Element. Why: The closed row's meta line summarizes the item's state. How: This renders rowSumStr. */ }


																</span>

																<span
																	className='rd-chev chev'

																	aria-hidden='true'
																>{ /* What: Chevron Span Element. Why: The open row shows a decorative chevron at its end. How: This is hidden from screen readers and wraps the chev icon. */ }


																	<IcoSvgCom
																		icoNamStr='chvEle'
																		sizValNum={ 16 }
																	/>{ /* What: Icon Svg Component. Why: The chevron span needs its own recognizable directional glyph. How: This renders the 'chvEle' icon at a fixed size. */ }


																</span>


															</button>


														) }



														<ColDisCom open={ iteOpeBoo }>{ /* What: Collapse Disclosure Component. Why: This row's own editor only needs to exist while it's actually open. How: This opens only while iteOpeBoo is true. */ }


															<div className='rd-edit'>{ /* What: Edit Div Element. Why: IteEdiCom needs its own wrapper matching every other editor body in this file. How: This wraps IteEdiCom below. */ }


																<IteEdiCom
																	ref={ iteOpeBoo ? opeEdiRef : undefined }

																	actStoObj={ actStoObj }
																	isaNewBoo={ newIteRef.current === iteCurObj.id }
																	iteCouNum={ picIteArr.length }
																	iteDatObj={ iteCurObj }
																	picDatObj={ picCurObj }
																	picIteArr={ picIteArr }

																	onCanEdiFun={ ( snaIteObj ) => { // What: On Cancel Handler. Why: Cancelling a brand-new item discards it, while cancelling an existing one reverts it. How: This removes a new item after its collapse animation, otherwise restores the pre-edit snapshot, closing the row either way.


																		if ( newIteRef.current === iteCurObj.id ) { // What: Discard New Guard. Why: A brand-new, unsaved item's own Cancel must remove it entirely, not revert it to a snapshot; the row still gets to play the same collapse-close animation as Save first. How: This clears newIteRef, closes the row, then defers the actual removal.


																			newIteRef.current = null; // What: New Item Clear. Why: This item is no longer "brand new and undiscarded" once its own discard is underway. How: This clears newIteRef.


																			const rmvIdeStr = iteCurObj.id; // What: Remove Identifier String. Why: The deferred removal below needs a stable copy of this item's own id. How: This reads iteCurObj.id once, before the closure captures anything else.


																			setOpeIteStr( ( opeCurStr ) => opeCurStr === iteCurObj.id ? null : opeCurStr ); // What: Open Item Close Guard. Why: Only close if this item is STILL the open one. How: This nulls opeIteStr only when it currently equals iteCurObj.id.

																			setTimeout( () => actStoObj.delIteFun( rmvIdeStr ), 280 ); // What: Deferred Remove Call. Why: The actual store removal must wait until the row's own collapse animation finishes. How: This calls delIteFun 280ms later.


																		}

																		else { // What: Revert Existing Branch. Why: An existing item's Cancel keeps the item but drops the edits. How: This restores the pre-edit snapshot and closes the row.


																			actStoObj.revIteFun( iteCurObj.id, snaIteObj ); // What: Replace Item Call. Why: An existing item's own Cancel must revert every field back to its pre-edit snapshot. How: This overwrites the live item with snaIteObj.

																			setOpeIteStr( ( opeCurStr ) => opeCurStr === iteCurObj.id ? null : opeCurStr ); // What: Open Item Close Guard. Why: Only close if this item is STILL the open one. How: This nulls opeIteStr only when it currently equals iteCurObj.id.


																		}


																	} }
																	onCloEdiFun={ () => keeCloFun( iteCurObj.id ) }
																	onDelIteFun={ () => { // What: On Delete Handler. Why: Deleting an item should let its row collapse before the store drops it. How: This closes the row, then removes the item right away under reduced motion or after the 280ms collapse otherwise.


																		if ( newIteRef.current === iteCurObj.id ) newIteRef.current = null; // What: New Item Clear Guard. Why: A deleted brand-new item is no longer "undiscarded" either. How: This clears newIteRef only when it currently points at this exact item.



																		const rmvIdeStr = iteCurObj.id; // What: Remove Identifier String. Why: The (possibly deferred) removal below needs a stable copy of this item's own id. How: This reads iteCurObj.id once.


																		setOpeIteStr( ( opeCurStr ) => opeCurStr === iteCurObj.id ? null : opeCurStr ); // What: Open Item Close Guard. Why: Only close if this item is STILL the open one. How: This nulls opeIteStr only when it currently equals iteCurObj.id.



																		if ( redMotFun() ) { actStoObj.delIteFun( rmvIdeStr ); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion should see this happen instantly. How: This removes the item directly and returns early.



																		setTimeout( () => actStoObj.delIteFun( rmvIdeStr ), 280 ); // What: Deferred Remove Call. Why: The actual store removal must wait until the row's own collapse animation finishes. How: This calls delIteFun 280ms later.


																	} }
																/>{ /* What: Item Editor Component. Why: This is the shared picker-item editor, reused so Today and Data stay exact copies. How: This is passed the live item/picker/items plus every handler this row's own lifecycle needs. */ }


															</div>


														</ColDisCom>


													</div>


												);


											} ) }


										</React.Fragment>


									</ColDisCom>


								</div>


							</ColDisCom>


						</section>


					);


				} ) }



				{ shoCreBoo && ( // What: Create Picker Check. Why: A new PICKER draft has nothing to belong to while Type is filtered to Conditionals/Reminders, and only one draft can be in progress at a time. How: This renders the trigger only while neither condition applies.


					<button
						className='cat-create-btn'

						disabled={ disCreBoo }
						type='button'

						onClick={ staNewFun }
					>{ /* What: Create Button Element. Why: This is the only place a brand-new picker can be started from this tab. How: This calls staNewFun on click, disabled during the guarded tour step. */ }


						<IcoSvgCom
							icoNamStr='pluEle'
							sizValNum={ 14 }
						/>{ /* What: Icon Svg Component. Why: The create control needs a recognizable "add" glyph beside its own label. How: This renders the 'pluEle' icon at a fixed size. */ } Create Picker


					</button>


				) }


			</div>


		</div>


	);


}

// #endregion TabDatCom

// #endregion Components



// #region Exports

export { TabDatCom }; // What: Named Export. Why: app.jsx renders this as the Data tab itself. How: This exports TabDatCom by name; every other binding in this file is internal-only.

// #endregion Exports


