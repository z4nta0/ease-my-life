


// #region Imports

import cssModObj from './tab-data.module.css'; // What: CSS Module Object. Why: The Data tab's own styles live in its module. How: Each className reads its hashed class from here.
import React     from 'react';                // What: React. Why: TabDatCom is built directly on React's own APIs. How: This is used directly (React.useCallback, React.useEffect, React.useMemo, React.useRef, React.useState, React.Fragment) instead of importing individual named hooks.


import { CAD_NAM_OBJ  } from '../../core/cadence.js';               // What: Cadence. Why: Each picker card's own header needs the shared cadence summary helpers. How: This is called in TabDatCom's picker cards.
import { clePicFun    } from '../../help/sample-data.js';           // What: Clear Pickers Function. Why: Help mode's disposable sample pickers must not survive past the help session or this tab unmounting. How: This is called whenever helpOnBoo turns off and on TabDatCom's own unmount cleanup.
import { cleTasFun    } from '../../help/sample-data.js';           // What: Clear Tasks Function. Why: Help mode's disposable sample reminders must not survive past the help session or this tab unmounting. How: This is called whenever helpOnBoo turns off and on TabDatCom's own unmount cleanup.
import { ColDisCom    } from '../../ui/collapse.jsx';               // What: Collapse Disclosure Component. Why: Picker cards, their Controls and Items disclosures, and item rows share the same collapse-height animation. How: This wraps each of those bodies, driven by the matching open boolean.
import { ConManCom    } from './conditionals-manager.jsx';          // What: Conditional Manager Component. Why: The Data tab lists every conditional in its own section above the picker cards. How: This is rendered once in TabDatCom whenever the Conditionals scope is shown.
import { DAT_HEL_ARR  } from '../../help/content.jsx';              // What: Data Help Array. Why: Help mode needs this tab's own catalog of labeled elements to badge. How: This is passed straight through to HelOveCom's own items prop.
import { durMilFun    } from '../../utils/rhythm.js';               // What: Duration Millisecond Function. Why: Timers that wait on a CSS animation must end with it. How: This returns a duration step's length in milliseconds, matching the stylesheet's own --dur-* tokens.
import { EntEdiCom    } from '../../ui/entry-editor.jsx';           // What: Entry Editor Component. Why: A picker's own item editor must stay an exact copy of Today's, so this file reuses it rather than a second implementation. How: This is aliased to IteEdiCom and rendered once per open item row.
import { freEdiFun    } from './list-sorting.js';                   // What: Freeze Edited Function. Why: An item mid-edit must not visually jump position if its own sort key changes underneath it. How: This is called once per picker's item list, given the sorted list and the currently-open item id.
import { HelButCom    } from '../../help/button.jsx';               // What: Help Button Component. Why: This tab needs the same help-mode toggle every other tab exposes. How: This is rendered in the header, toggling helpOnBoo.
import { HelOveCom    } from '../../help/mode.jsx';                 // What: Help Overlay Component. Why: This tab needs the same help-mode badge overlay every other tab exposes. How: This is rendered once, driven by helpOnBoo and DAT_HEL_ARR.
import { IcoSvgCom    } from '../../ui/icon.jsx';                   // What: Icon Svg Component. Why: Nearly every button and row in this tab needs a recognizable glyph. How: This is rendered throughout TabDatCom.
import { InfTipCom    } from '../../ui/info-tip.jsx';               // What: Info Tip Component. Why: A disabled control or a truncated pill still needs to explain itself on demand. How: This wraps disabled add buttons and truncatable type/group labels throughout TabDatCom.
import { ONB_CHE_OBJ  } from '../../state/onboarding-checklist.js'; // What: Onboarding Checklist Object. Why: Several add/edit controls in this tab must stay disabled while the Welcome Tour's own checklist is still in progress. How: This is checked via tutProFun throughout TabDatCom.
import { PIC_NAM_OBJ  } from '../../core/pickers.js';               // What: Pickers Namespace Object. Why: An ease-mode picker's item list needs the same fallback ease-band math the picking engine itself uses. How: This is called once per picker via PIC_NAM_OBJ.aveEasFun.
import { PicConCom    } from './picker-controls.jsx';               // What: Picker Controls Component. Why: Each picker card's Controls disclosure needs its own how-it-picks/when-it-runs/item-controls body. How: This is rendered inside TabDatCom's picker card whenever that card's Controls disclosure is open.
import { redMotFun    } from '../../utils/motion.js';               // What: Reduce Motion Function. Why: A user who prefers reduced motion shouldn't see any of this tab's own FLIP, scroll, or collapse animations. How: This is checked before every animation in TabDatCom.
import { RemManCom    } from './reminders-manager.jsx';             // What: Reminder Manager Component. Why: The Reminders section of this tab is a full, separately-maintained editor. How: This is rendered once, in place of a picker card, whenever the Reminders scope is shown.
import { SED_NAM_OBJ  } from '../../state/seed.js';                 // What: Seed Namespace Object. Why: Every picker mode's own label and hint text comes from this shared catalog. How: This is read (MOD_DEF_OBJ) in TabDatCom for mode labels and the new-picker mode radio group.
import { sedPicFun    } from '../../help/sample-data.js';           // What: Seed Pickers Function. Why: Help mode needs a real picker of every mode to show a representative "view and edit" section. How: This is called whenever helpOnBoo turns on.
import { sedTasFun    } from '../../help/sample-data.js';           // What: Seed Tasks Function. Why: Help mode needs real reminders of every recurrence kind to show a representative "view and edit" section. How: This is called whenever helpOnBoo turns on.
import { sorEntFun    } from './list-sorting.js';                   // What: Sort Entries Function. Why: Sections and picker items share the app's own sort-key vocabulary. How: This is called once per comparison inside each list's own sort.
import { SorSelCom    } from './sort-select.jsx';                   // What: Sort Select Component. Why: Every sortable list in this tab needs the same sort control. How: This is rendered for sections and each picker's own item list.
import { togFadFun    } from '../../ui/edge-fade.js';               // What: Toggle Fade Function. Why: Every scrolling rail in this file hides each edge fade once that edge is reached. How: This is called by each rail's own scroll and resize handlers.
import { useEmlTouFun } from '../../state/tour-bus.js';             // What: Use Ease My Life Tour. Why: Several controls in this file must disable themselves or highlight during specific onboarding tour steps. How: This is called once to read the shared tour event bus's touPhaStr/touIdeStr/touSteNum fields.

// #endregion Imports



/**
 * tab-data.jsx = Tab Data
 *
 * @summary
 * The Data tab: every picker, conditional, and reminder in one place, grouped
 * by picker with its weights, active/inactive status, and per-picker
 * Daily-generator scheduling (weekday + skip-holiday gates). A picker's own
 * "how it picks / when it runs / item controls" settings (PicConCom, in
 * picker-controls.jsx) open inside its card rather than in a separate Settings
 * screen, so everything about one picker sits behind one card. Conditionals
 * (ConManCom, in conditionals-manager.jsx) and Reminders (RemManCom, a
 * separately maintained module) render as sibling sections above the picker
 * cards. The global "days off" holiday list itself still lives in Settings.
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



		const scrTimNum = setTimeout( () => rowCurEle.scrollIntoView( { behavior : 'smooth', block : 'nearest' } ), durMilFun( 'p02' ) ); // What: Scroll Timeout Number. Why: The ColDisCom open animation needs to finish growing the editor before the scroll starts. How: This schedules the smooth scroll after that animation's own p02 duration step.



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

	const [ rmvHeiNum, setRmvHeiNum ] = React.useState( 0 );    // What: Removing Height Number And Setter. Why: A deleted picker's open card can be any height, so its collapse needs its real height as the starting ceiling. How: delPicFun measures the card just before flagging it, and the card passes this to its keyframes as --cat-rem-hei.
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



		const catCurEle = document.querySelector( `[data-element-name-hook~="datCatSec"][data-picker-id="${ picIdeStr }"]` ); // What: Category Current Element. Why: The card's real height has to be read before its removal animation starts. How: This finds the picker's card by its hook and picker id.


		setRmvHeiNum( catCurEle ? catCurEle.getBoundingClientRect().height : 0 ); // What: Removing Height Set Call. Why: The collapse should start from the card's real height, open or closed. How: This stores the card's measured height, or 0 when it can't be found, which leaves the keyframes on their fallback.
		setRmvPicStr( picIdeStr );                                                // What: Removing Set Call. Why: The card plays its removal animation before the store drops it. How: This flags picIdeStr, and the card's onAnimationEnd does the actual removal.


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


	React.useEffect( () => { // What: Filter Rows Fade Effect. Why: Every filter row shares the same scroll-edge-fade affordance as the Stats tab. How: This wires up scroll-edge tracking for whichever of the 4 rows are currently mounted, and tears every one down on cleanup.


		const rowEleArr = [ groRowRef.current, typRowRef.current, scoRowRef.current, conRowRef.current ].filter( Boolean ); // What: Row Element Array. Why: Not every row is always mounted (e.g. a single-group app has no Group row at all). How: This collects only the currently-mounted refs.


		const cleFunArr = rowEleArr.map( ( rowCurEle ) => { // What: Cleanup Function Array. Why: Every row needs its own independent wiring and its own independent teardown. How: This maps each row element to its own cleanup function, collected for the effect's own return below.


			const updFadFun = () => togFadFun( rowCurEle ); // What: Update Fade Function. Why: Each row's own fade classes need recomputing on every relevant change. How: This calls togFadFun on rowCurEle.


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


		<div className={ cssModObj.tabData }>{ /* What: Tab Div Element. Why: This is TabDatCom's own root element. How: This wraps the help overlay, header, filters, sort bar, and list below. */ }


			<HelOveCom
				actModBoo={ helOpeBoo }
				helIteArr={ DAT_HEL_ARR }

				onCloAllFun={ helExiFun }
			/>{ /* What: Help Overlay Component. Why: This tab needs the same help-mode badge overlay every other tab exposes. How: This is driven by helOpeBoo and this tab's own DAT_HEL_ARR catalog. */ }



			<header className={ cssModObj.statH }>{ /* What: Header Element. Why: This tab's own kicker, brand link, and lead paragraphs all belong in one landmark. How: This wraps the kicker row and the lead/warning paragraphs below. */ }


				<div className={ cssModObj.kickerRow }>{ /* What: Kicker Row Div Element. Why: The kicker label and the help toggle belong on the same line. How: This wraps the kicker div and HelButCom below. */ }


					<div className={ cssModObj.kicker }>Data</div>{ /* What: Kicker Div Element. Why: Every tab needs its own small kicker label above the title. How: This renders the literal text "Data". */ }



					<HelButCom
						actModBoo={ helOpeBoo }

						onClick={ () => setHelOpeBoo( ( preOpeBoo ) => !preOpeBoo ) }
					/>{ /* What: Help Button Component. Why: This tab needs the same help-mode toggle every other tab exposes. How: This flips helOpeBoo on click. */ }


				</div>



				<div
					className={ cssModObj.statHLead }

					data-element-name-hook='heaLeaDiv'
				>{ /* What: Lead Div Element. Why: The brand link and the page title belong together at the top of the header. How: This wraps the brand button and the section-h div below. Its data-element-name-hook is read by help mode's Stats catalog, help mode's Settings catalog, help mode's Today catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


					<button
						className={ cssModObj.brandMark }

						data-element-name-hook='braMarBut'

						type='button'

						aria-label='Ease My Life link to go to the Today page'

						onClick={ onNavHomFun }
					>{ /* What: Brand Button Element. Why: The logo/wordmark also works as a shortcut back to the Today tab. How: This wraps the theme-wired logo svg below and jumps to Today on click. Its data-element-name-hook is read by help mode's Stats catalog, help mode's Settings catalog, help mode's Today catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


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
									stroke      : 'var(--acc-tin-col)',
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


					<div className={ cssModObj.sectionH }>{ /* What: Section Header Div Element. Why: The page's own title needs its own wrapper. How: This wraps the h1 below. */ }


						<h1 className={ cssModObj.sectionTitle }>The knobs and levers, that <span className={ cssModObj.statTitleAccent }>ease</span> your life.</h1>{ /* What: Section Title Element. Why: Every tab needs its own page title. How: This renders the literal title text, with "ease" set off in its own accent span. */ }


					</div>


				</div>



				<p className={ cssModObj.sectionSub }>All your created items can be edited here, including conditionals, reminders, pickers and all of their items. You can use the <button className={ cssModObj.subTablink } type='button' onClick={ () => onNavTabFun && onNavTabFun( 'stats' ) }>Stats page</button> to view how they are performing and then adjust their numbers here to get them exactly where you want them.</p>{ /* What: Lead Paragraph Element. Why: The header needs a short explanation of what this tab is for, plus a shortcut to Stats. How: This renders the lead text with an inline link that switches to the Stats tab when onNavTabFun is available. */ }

				<p className={ cssModObj.sectionSub }><strong>WARNING:</strong> Manually changing any of these values will affect the Stats page's accuracy. Minor or infrequent changes will have an almost negligible effect but major or frequent changes will definitely skew the Stats page's accuracy.</p>{ /* What: Warning Paragraph Element. Why: Manually editing these values has a real, disclosed side effect on Stats. How: This renders the literal warning text. */ }


			</header>



			<div className={ cssModObj.statFilters }>{ /* What: Filters Div Element. Why: The Group/Type/Conditionals/Show filter rows all belong in one wrapper. How: This conditionally renders each row below, per whether it has more than one real choice. */ }


				{ exiGroArr.length > 1 && ( // What: Group Row Check. Why: A single-group app has nothing to filter by group. How: This renders the Group row only while exiGroArr has 2 or more entries.


					<div className={ cssModObj.statFilterRow }>{ /* What: Group Filter Row Div Element. Why: The Group label and its own pill rail belong together. How: This wraps the lbl span and the pill rail below. */ }


						<span className={ cssModObj.statFilterLbl }>Group</span>{ /* What: Group Label Span Element. Why: The row needs its own literal name. How: This renders the literal text "Group". */ }

						<div
							ref={ groRowRef }

							className={ cssModObj.pickerGroups }

							data-element-name-hook='groFilDiv'

							aria-label='Filter pickers by group'
							role='tablist'
						>{ /* What: Group Pills Div Element. Why: This is the actual scrollable tablist of "All" plus every existing group. How: This renders the All pill, then maps exiGroArr to one pill each. Its data-element-name-hook is read by the Stats page tour, the Pickers page tour, help mode's Stats catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


							<button
								className={ cssModObj.pickerGroupPill }

								data-element-name-hook='filPilBut'

								disabled={ disGroBoo }
								type='button'

								aria-selected={ filGroStr === 'all' }
								role='tab'

								onClick={ () => setFilGroStr( 'all' ) }
							>{ /* What: All Pill Button Element. Why: This is the always-first choice, clearing the group filter entirely. How: This sets filGroStr to 'all' on click, disabled during the matching tour step. Its data-element-name-hook is read by the Stats page tour, the Pickers page tour, help mode's Stats catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


								All

								<span className={ cssModObj.pickerGroupCount }>{ allPicArr.filter( ( picCurObj ) => !picCurObj.hidden ).length }</span>{ /* What: Group Count Span Element. Why: The All pill needs its own live total. How: This counts every non-hidden picker. */ }


							</button>

							{ exiGroArr.map( ( groCurStr ) => ( // What: Group Pill Map. Why: One pill is needed per existing group. How: This maps exiGroArr to one tab-role button each, keyed by its own name.


								<button
									key={ groCurStr }

									className={ cssModObj.pickerGroupPill }

									data-element-name-hook='filPilBut'

									disabled={ disGroBoo }
									type='button'

									aria-selected={ filGroStr === groCurStr }
									role='tab'

									onClick={ () => setFilGroStr( groCurStr ) }
								>{ /* What: Group Pill Button Element. Why: Clicking a pill narrows the list to just that group. How: This sets filGroStr to groCurStr on click, disabled during the matching tour step. Its data-element-name-hook is read by the Stats page tour, the Pickers page tour, help mode's Stats catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


									{ groCurStr }{ /* What: Pill Name Expression. Why: Every group pill needs its own visible label. How: This renders groCurStr. */ }

									<span className={ cssModObj.pickerGroupCount }>{ allPicArr.filter( ( picCurObj ) => picCurObj.group === groCurStr && !picCurObj.hidden ).length }</span>{ /* What: Group Count Span Element. Why: Every group pill needs its own live count. How: This counts every non-hidden picker whose own group matches groCurStr. */ }


								</button>


							) ) }


						</div>


					</div>


				) }


				{ ( exiModArr.length > 1 || conIteArr.length > 0 ) && ( // What: Type Row Check. Why: A single-mode app with no conditionals has nothing meaningful to filter by type. How: This renders the Type row only while there's more than one mode or at least one conditional.


					<div className={ cssModObj.statFilterRow }>{ /* What: Type Filter Row Div Element. Why: The Type label and its own pill rail belong together. How: This wraps the lbl span and the pill rail below. */ }


						<span className={ cssModObj.statFilterLbl }>Type</span>{ /* What: Type Label Span Element. Why: The row needs its own literal name. How: This renders the literal text "Type". */ }

						<div
							ref={ typRowRef }

							className={ cssModObj.pickerGroups }

							data-element-name-hook='typFilDiv'

							aria-label='Filter pickers by type'
							role='tablist'
						>{ /* What: Type Pills Div Element. Why: This is the actual scrollable tablist of "All" plus every mode/Conditionals/Reminders pill, sorted together alphabetically. How: This renders the All pill, then maps the combined, sorted entry list to one pill each. Its data-element-name-hook is read by the Stats page tour, the Pickers page tour, help mode's Stats catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


							<button
								className={ cssModObj.pickerGroupPill }

								data-element-name-hook='filPilBut'

								disabled={ disGroBoo }
								type='button'

								aria-selected={ filTypStr === 'all' }
								role='tab'

								onClick={ () => setFilTypStr( 'all' ) }
							>{ /* What: All Pill Button Element. Why: This is the always-first choice, clearing the type filter entirely. How: This sets filTypStr to 'all' on click, disabled during the matching tour step. Its data-element-name-hook is read by the Stats page tour, the Pickers page tour, help mode's Stats catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


								All

								<span className={ cssModObj.pickerGroupCount }>{ allPicArr.filter( ( picCurObj ) => !picCurObj.hidden ).length }</span>{ /* What: Type Count Span Element. Why: The All pill needs its own live total. How: This counts every non-hidden picker. */ }


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

										className={ cssModObj.pickerGroupPill }

										data-element-name-hook='filPilBut'

										disabled={ disGroBoo }
										type='button'

										aria-selected={ filEntObj.selBoo }
										role='tab'

										onClick={ filEntObj.cliFun }
									>{ /* What: Type Pill Button Element. Why: Clicking a pill narrows the list to that type. How: This marks itself selected when filEntObj.selBoo and runs filEntObj.cliFun. Its data-element-name-hook is read by the Stats page tour, the Pickers page tour, help mode's Stats catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


										{ filEntObj.namStr }{ /* What: Pill Name Expression. Why: Every pill needs its own visible label. How: This renders filEntObj.namStr. */ }

										<span className={ cssModObj.pickerGroupCount }>{ filEntObj.couNum }</span>{ /* What: Pill Count Span Element. Why: Each pill shows how many entries it holds. How: This renders filEntObj.couNum. */ }


									</button>


								) ) }


						</div>


					</div>


				) }


				{ conIteArr.length > 0 && ( // What: Conditional Row Check. Why: A conditional-free app has nothing to filter by conditional. How: This renders the Conditionals row only while conIteArr has at least one entry.


					<div className={ cssModObj.statFilterRow }>{ /* What: Conditional Filter Row Div Element. Why: The Conditionals label and its own pill rail belong together. How: This wraps the lbl span and the pill rail below. */ }


						<span className={ cssModObj.statFilterLbl }>Conditionals</span>{ /* What: Conditional Label Span Element. Why: The row needs its own literal name. How: This renders the literal text "Conditionals". */ }

						<div
							ref={ conRowRef }

							className={ cssModObj.pickerGroups }

							data-element-name-hook='conFilDiv'

							aria-label='Filter pickers by conditional'
							role='tablist'
						>{ /* What: Conditional Pills Div Element. Why: This is the actual scrollable tablist of "All" plus every conditional. How: This renders the All pill, then maps the alphabetized conditional list to one pill each. Its data-element-name-hook is read by help mode's Data catalog. */ }


							<button
								className={ cssModObj.pickerGroupPill }

								data-element-name-hook='filPilBut'

								disabled={ disGroBoo }
								type='button'

								aria-selected={ filConStr === 'all' }
								role='tab'

								onClick={ () => setFilConStr( 'all' ) }
							>{ /* What: All Pill Button Element. Why: This is the always-first choice, clearing the conditional filter entirely. How: This sets filConStr to 'all' on click, disabled during the matching tour step. Its data-element-name-hook is read by the Stats page tour, the Pickers page tour, help mode's Stats catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


								All

								<span className={ cssModObj.pickerGroupCount }>{ allPicArr.length }</span>{ /* What: Conditional Count Span Element. Why: The All pill needs its own live total. How: This is allPicArr's own total length. */ }


							</button>

							{ [ ...conIteArr ].sort( ( conOneObj, conTwoObj ) => conOneObj.name.localeCompare( conTwoObj.name ) ).map( ( conCurObj ) => ( // What: Conditional Pill Map. Why: One pill is needed per existing conditional, alphabetical. How: This maps the sorted list to one tab-role button each, keyed by its own id.


								<button
									key={ conCurObj.id }

									className={ cssModObj.pickerGroupPill }

									data-element-name-hook='filPilBut'

									disabled={ disGroBoo }
									type='button'

									aria-selected={ filConStr === conCurObj.id }
									role='tab'

									onClick={ () => { // What: On Click Handler. Why: Picking a conditional pill switches the list to that conditional alone. How: This sets the conditional filter and resets the group and type filters.


										setFilConStr( conCurObj.id ); // What: Conditional Filter Set Call. Why: The pill narrows the list to pickers using this conditional. How: This sets filConStr to conCurObj.id.
										setFilGroStr( 'all' );        // What: Group Filter Reset Call. Why: A conditional filter shouldn't stack on an old group filter. How: This resets filGroStr to 'all'.
										setFilTypStr( 'all' );        // What: Type Filter Reset Call. Why: A conditional filter shouldn't stack on an old type filter either. How: This resets filTypStr to 'all'.


									} }
								>{ /* What: Conditional Pill Button Element. Why: Clicking a pill narrows the list to pickers gated by just that conditional, resetting the other 2 filters. How: This commits filConStr, resets filGroStr/filTypStr, disabled during the matching tour step. Its data-element-name-hook is read by the Stats page tour, the Pickers page tour, help mode's Stats catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


									{ conCurObj.name }{ /* What: Pill Name Expression. Why: Every conditional pill needs its own visible label. How: This renders conCurObj.name. */ }

									<span className={ cssModObj.pickerGroupCount }>{ conCouFun( conCurObj.id ) }</span>{ /* What: Conditional Count Span Element. Why: Every conditional pill needs its own live usage count. How: This calls conCouFun for conCurObj.id. */ }


								</button>


							) ) }


						</div>


					</div>


				) }


				<div className={ cssModObj.statFilterRow }>{ /* What: Show Filter Row Div Element. Why: The Show label and its own box rail belong together. How: This wraps the lbl span and the box rail below. */ }


					<span className={ cssModObj.statFilterLbl }>Show</span>{ /* What: Show Label Span Element. Why: The row needs its own literal name. How: This renders the literal text "Show". */ }

					<div
						key={ filGroStr + '|' + filTypStr }
						ref={ scoRowRef }

						className={ cssModObj.pickerTabs }

						data-element-name-hook='scoTabDiv'
					>{ /* What: Show Boxes Div Element. Why: This is the actual box rail, re-keyed on filter change so its own entrance animation replays. How: This renders the All box (when present) then maps shoEntArr's own remaining entries to one box each. Its data-element-name-hook is read by the Stats page tour, help mode's Stats catalog, and help mode's Data catalog. */ }


						{ shoAllBoo && ( // What: All Box Check. Why: "All" only renders when shoEntArr itself decided to include it. How: This renders the All box only while shoAllBoo is true.


							<button
								className={ cssModObj.pickerTab }

								style={{ animationDelay : '0ms' }}

								data-element-name-hook='scoTabBut'
								data-tab-select-active={ curScoStr === 'all' || undefined } // What: Tab Select Active Attribute. Why: The showing scope's tab should stand out in the strip. How: This sets the presence-only attribute while curScoStr === 'all' is true.

								disabled={ disShoBoo }
								type='button'

								onClick={ () => selScoFun( 'all' ) }
							>{ /* What: All Box Button Element. Why: Selecting this box shows every visible section at once. How: This calls selScoFun('all') on click, disabled during the matching tour step. Its data-element-name-hook is read by the Stats page tour, help mode's Stats catalog, and help mode's Data catalog. */ }


								<span className={ cssModObj.pickerTabName }>All</span>{ /* What: Box Name Span Element. Why: Every box needs its own visible name. How: This renders the literal text "All". */ }

								<span className={ cssModObj.pickerTabMode }>Everything</span>{ /* What: Box Mode Span Element. Why: Every box also shows its own kind. How: This renders the literal text "Everything". */ }


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

									className={ cssModObj.pickerTab }

									style={{ animationDelay : ( filIndNum + 1 ) * 40 + 'ms' }}

									data-element-name-hook='scoTabBut'
									data-tab-select-active={ filEntObj.selBoo || undefined } // What: Tab Select Active Attribute. Why: The showing scope's tab should stand out in the strip. How: This sets the presence-only attribute while filEntObj.selBoo is true.
									data-picker-id={ filEntObj.ideStr }

									disabled={ disShoBoo }
									type='button'

									onClick={ filEntObj.cliFun }
								>{ /* What: Picker Tab Button Element. Why: Each tab narrows the list to one picker. How: This marks itself selected when filEntObj.selBoo and runs filEntObj.cliFun. Its data-element-name-hook is read by the Stats page tour, help mode's Stats catalog, and help mode's Data catalog. */ }


									<span className={ cssModObj.pickerTabName }>{ filEntObj.namStr }</span>{ /* What: Tab Name Span Element. Why: Every tab needs its own visible picker name. How: This renders filEntObj.namStr. */ }

									<span className={ cssModObj.pickerTabMode }>{ filEntObj.labStr }</span>{ /* What: Tab Mode Span Element. Why: Every tab also names its picker's mode. How: This renders filEntObj.labStr. */ }


								</button>


							) ) }


					</div>


				</div>


			</div>



			<div
				className={ cssModObj.dataSortBar }

				data-element-name-hook='sorBarDiv'
			>{ /* What: Sort Bar Div Element. Why: The section sort control needs its own row, separate from the filter rows above. How: This wraps SorSelCom below. Its data-element-name-hook is read by help mode's Data catalog. */ }


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

				className={ cssModObj.dataList }

				data-element-name-hook='datLisDiv'
			>{ /* What: Data List Div Element. Why: This is the actual rendered list, re-keyed on filter/scope change so section entrance animations replay. How: This renders an empty-state message when nothing matches, otherwise every entry in shoSecArr plus the Create Picker trigger. Its data-element-name-hook is read by the App Features tours, the Data page tour, and help mode's Data catalog. */ }


				{ shoEmpBoo && ( // What: Empty State Check. Why: Every filter combined leaving nothing at all needs its own explanatory message. How: This renders only while all 3 sections are absent.


					<div className={ cssModObj.dataEmpty }>{ /* What: Empty Div Element. Why: The empty-state title and its own explanation belong together. How: This wraps both paragraphs below. */ }


						<p className={ cssModObj.dataEmptyTitle }>Nothing matches these filters</p>{ /* What: Empty Title Paragraph Element. Why: The empty state needs its own short headline. How: This renders the literal text. */ }

						<p className={ cssModObj.dataEmptySub }>No items match the current Group, Conditionals, and Show selections. Try widening a filter to “All”.</p>{ /* What: Empty Sub Paragraph Element. Why: The empty state also needs a suggested next action. How: This renders the literal text. */ }


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

							className={` ${ cssModObj.cat }   ${ rmvPicStr === picCurObj.id ? cssModObj.catRemoving : '' }   ${ hetPicBoo ? cssModObj.obTourPulse : '' } `}

							style={{
								animationDelay : ( isaDraBoo ? 0 : entIndNum * 45 ) + 'ms',
								...( isaDraBoo ? { scrollMarginTop : 'var( --spa-ver-bas )' } : {} ),
								...( rmvPicStr === picCurObj.id && rmvHeiNum ? { '--cat-rem-hei' : rmvHeiNum + 'px' } : {} ) // What: Removing Height Spread. Why: A removing card's collapse must start from its own measured height. How: This sets --cat-rem-hei for the catRemove keyframes only while this card is the one being removed.
							}}

							data-card-vacation-active={ allVacBoo || undefined } // What: Card Vacation Active Attribute. Why: A picker with every item on vacation fades back. How: This sets the presence-only attribute while allVacBoo is true.
							data-element-name-hook='datCatSec'
							data-picker-id={ picCurObj.id }

							onAnimationEnd={ ( aniEveObj ) => { // What: On Animation End Handler. Why: A removed picker must leave the store only after its exit animation has played. How: This deletes the picker and clears rmvPicStr once the card itself (not a child) finishes animating while marked for removal.


								if ( aniEveObj.target === aniEveObj.currentTarget && rmvPicStr === picCurObj.id ) { // What: Removal Finished Guard. Why: The card must actually be removed from the store only once its own removal animation (not a child's) has genuinely finished. How: This checks the event's own target/currentTarget match and that this card is still the one marked removing.


									actStoObj.delPicFun( picCurObj.id ); // What: Remove Picker Call. Why: This is the actual, final destructive action, deferred until the animation finished. How: This removes picCurObj.id from the store.
									setRmvPicStr( null );                // What: Removing Clear Call. Why: The removal-animation flag must clear once it's actually done its job. How: This resets rmvPicStr to null.


								}


							} }
						>{ /* What: Category Section Element. Why: This is one picker's own top-level card, matching every other Data tab category's own outer landmark. How: This plays the removal animation via rmvPicStr/onAnimationEnd, and renders the header + ColDisCom-wrapped body below. Its data-element-name-hook is read by the App Features tours, the Data page tour, and help mode's Data catalog. */ }


							<header
								className={ cssModObj.catH }

								data-element-name-hook='catHeaHea'

								onClick={ ( clkEveObj ) => { // What: On Click Handler. Why: Clicking anywhere on the header outside a real button toggles the card. How: This toggles the section unless it's a draft, the tour is guarding the header, or the click landed on a button.


									const notDraBoo = !isaDraBoo;                            // What: Not Draft Boolean. Why: A draft card is always expanded. How: This negates isaDraBoo.
									const notDetBoo = !detPicBoo;                            // What: Not Disable-Edit-Tour Boolean. Why: The Edit Items tour guards the header during some steps. How: This negates detPicBoo.
									const notButBoo = !clkEveObj.target.closest( 'button' ); // What: Not Button Boolean. Why: A click on a real button inside the header has its own action. How: This checks the click target isn't inside a button.

									const togSecBoo = notDraBoo && notDetBoo && notButBoo; // What: Toggle Section Boolean. Why: The header only toggles when all 3 checks pass. How: This ANDs them.


									if ( togSecBoo ) togSecFun( picCurObj.id ); // What: Toggle Section Guard. Why: This is the actual toggle. How: This calls togSecFun when togSecBoo is true.


								} }
							>{ /* What: Category Header Element. Why: Clicking anywhere on the header (outside a real button) should toggle the card. How: This calls togSecFun unless this is a draft, the tour is guarding the header, or the click actually landed on a button. Its data-element-name-hook is read by help mode's Data catalog. */ }


								<button
									className={ cssModObj.catHL }

									data-element-name-hook='catHeaBut'

									disabled={ isaDraBoo || detPicBoo }
									type='button'

									aria-expanded={ secOpeBoo }

									onClick={ () => togSecFun( picCurObj.id ) }
								>{ /* What: Header Left Button Element. Why: This is the actual clickable control for expanding/collapsing the card. How: This is disabled for a draft (always expanded) or during the guarded tour step. Its data-element-name-hook is read by the App Features tours. */ }


									<span
										className={ cssModObj.chev }

										data-chevron-open-active={ secOpeBoo || undefined } // What: Chevron Open Active Attribute. Why: An open disclosure points its chevron down. How: This sets the presence-only attribute while secOpeBoo is true.
									>{ /* What: Chevron Span Element. Why: The card's own open/closed state needs a visible directional indicator. How: This rotates via data-chevron-open-active and renders the shared chevron icon. */ }


										<IcoSvgCom
											icoNamStr='chvEle'
											sizStpStr='bas'
										/>{ /* What: Icon Svg Component. Why: The chevron span needs its own recognizable directional glyph. How: This renders the 'chvEle' icon at a fixed size. */ }


									</span>

									<span className={ cssModObj.catHMain }>{ /* What: Header Main Span Element. Why: The picker's own name and live count belong together. How: This wraps the h2 and the count span below. */ }


										<h2 className={ cssModObj.catName }>{ picCurObj.name }</h2>{ /* What: Category Name Element. Why: Every card needs its own visible name. How: This renders picCurObj's own name. */ }

										<span className={ cssModObj.catCount }>{ /* What: Category Count Span Element. Why: The eligible/total count needs 3 separate elements (see tab-data.module.css) rather than one text run. How: This wraps the eligible count, the "of" separator, and the total count below. */ }


											<span>{ eliCouNum }</span>{ /* What: Eligible Count Span Element. Why: The count leads with how many items are currently eligible. How: This renders eliCouNum. */ }

											<span>of</span>{ /* What: Of Span Element. Why: The two counts need a joining word between them. How: This renders the literal text "of". */ }

											<span>{ picIteArr.length }</span>{ /* What: Total Count Span Element. Why: The count ends with the picker's total item count. How: This renders picIteArr.length. */ }


										</span>


									</span>


								</button>

								<span className={ cssModObj.catHRight }>{ /* What: Header Right Span Element. Why: The type/group tags and the active toggle need one grouped slot so a narrow viewport can stack them together in place, freeing width for the name. How: This wraps the tags span and the vac-toggle button below. */ }


									<span className={ cssModObj.catHTags }>{ /* What: Header Tags Span Element. Why: The type and group pills need their own fixed-width columns so they line up across every card regardless of text length. How: This wraps 2 InfTipCom-wrapped labels below. */ }


										<InfTipCom
											className={ cssModObj.catModeLabel }

											data-element-name-hook='catModSpa'

											labTexStr={ SED_NAM_OBJ.MOD_DEF_OBJ[ picCurObj.mode ].labStr }
											trnOnlBoo
										>{ SED_NAM_OBJ.MOD_DEF_OBJ[ picCurObj.mode ].labStr }</InfTipCom>{ /* What: Info Tip Component. Why: A long mode label like "Dynamic Weighted" can still truncate at this width; also read by help-mode's own pickerRow entry to build its "{type} Picker" badge title. How: This reveals the full label on demand only when it's actually truncated. Its data-element-name-hook is read by help mode's Data catalog. */ }



										<InfTipCom
											className={ cssModObj.catGroup }

											labTexStr={ picCurObj.group }
											trnOnlBoo
										>{ picCurObj.group }</InfTipCom>{ /* What: Info Tip Component. Why: A long group name can also still truncate at this width. How: This reveals the full name on demand only when it's actually truncated. */ }


									</span>

									<button
										className={ cssModObj.vacToggle }

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
											sizStpStr='bas'
										/>{ /* What: Icon Svg Component. Why: The bulk active/inactive toggle needs a recognizable glyph reflecting its own current state. How: This renders 'moon' while allVacBoo, 'sparkle' otherwise. */ }

										<span
											key={ allVacBoo ? 'inactive' : 'active' }

											className={ cssModObj.setSubFade }
										>{ allVacBoo ? 'Inactive' : 'Active' }</span>{ /* What: Toggle Label Span Element. Why: The toggle also needs its own live text, cross-faded via its own key change. How: This renders "Inactive" while allVacBoo, "Active" otherwise. */ }


									</button>


								</span>


							</header>



							<ColDisCom
								isaInsBoo={ isaDraBoo }
								open={ secOpeBoo }
							>{ /* What: Collapse Disclosure Component. Why: The card's own body (Controls + Items) only needs to exist while it's actually expanded, instant (no animation) for a brand-new draft. How: This opens per secOpeBoo. */ }


								<div
									className={ cssModObj.catBody }

									data-element-name-hook='catBodDiv'
								>{ /* What: Category Body Div Element. Why: The Controls and Items disclosures both belong in one grouped body. How: This wraps both nested disclosures below. Its data-element-name-hook is read by the App Features tours and help mode's Data catalog. */ }


									<button
										className={` ${ cssModObj.rdCtl }   ${ hetConBoo ? cssModObj.obTourPulse : '' } `}

										data-element-name-hook='catTogBut'

										disabled={ detConBoo }
										type='button'

										aria-expanded={ !conColBoo }

										onClick={ () => actStoObj.togColFun( picCurObj.id + ':controls' ) }
									>{ /* What: Controls Toggle Button Element. Why: This picker's own pick-algorithm/schedule config moved here from Settings, so it needs its own nested disclosure toggle. How: This toggles the persisted ':controls' entry, disabled during the guarded tour step. Its data-element-name-hook is read by the App Features tours and help mode's Data catalog. */ }


										<span className={ cssModObj.rdCtlL }>{ /* What: Controls Left Span Element. Why: The chevron and the "Controls" kicker belong together. How: This wraps both spans below. */ }


											<span
												className={ cssModObj.chev }

												data-chevron-open-active={ !conColBoo || undefined } // What: Chevron Open Active Attribute. Why: An open disclosure points its chevron down. How: This sets the presence-only attribute while conColBoo is false.
											>{ /* What: Chevron Span Element. Why: The disclosure's own open/closed state needs a visible directional indicator. How: This wraps the chevron icon, rotated via data-chevron-open-active. */ }


												<IcoSvgCom
													icoNamStr='chvEle'
													sizStpStr='m01'
												/>{ /* What: Icon Svg Component. Why: The chevron span needs its own recognizable directional glyph. How: This renders the 'chvEle' icon at a fixed size. */ }


											</span>

											<span className={ cssModObj.kicker }>Controls</span>{ /* What: Controls Kicker Span Element. Why: The disclosure needs its own visible label. How: This renders the literal text "Controls". */ }


										</span>

										{ conColBoo && <span className={ cssModObj.rdCtlSum }>{ Object.keys( SED_NAM_OBJ.MOD_DEF_OBJ ).length } options</span> }{ /* What: Controls Summary Check. Why: A collapsed disclosure still needs a hint of what's inside. How: This renders only while conColBoo is true. */ }


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
										className={` ${ cssModObj.rdCtl }   ${ hetIteBoo ? cssModObj.obTourPulse : '' } `}

										data-element-name-hook='catTogBut'

										disabled={ detIteBoo }
										type='button'

										aria-expanded={ !iteColBoo }

										onClick={ () => isaDraBoo ? setDraIteBoo( ( preOpeBoo ) => !preOpeBoo ) : actStoObj.togColFun( picCurObj.id + ':items' ) }
									>{ /* What: Items Toggle Button Element. Why: The item list needs its own nested disclosure toggle, defaulting open except for a fresh draft. How: This toggles draIteBoo for a draft, otherwise the persisted ':items' entry, disabled during the guarded tour step. Its data-element-name-hook is read by the App Features tours and help mode's Data catalog. */ }


										<span className={ cssModObj.rdCtlL }>{ /* What: Controls Left Span Element. Why: The chevron and the label sit together on the toggle's left side. How: This wraps the chevron span and the kicker. */ }


											<span
												className={ cssModObj.chev }

												data-chevron-open-active={ !iteColBoo || undefined } // What: Chevron Open Active Attribute. Why: An open disclosure points its chevron down. How: This sets the presence-only attribute while iteColBoo is false.
											>{ /* What: Chevron Span Element. Why: The disclosure's own open/closed state needs a visible directional indicator. How: This wraps the chevron icon, rotated via data-chevron-open-active. */ }


												<IcoSvgCom
													icoNamStr='chvEle'
													sizStpStr='m01'
												/>{ /* What: Icon Svg Component. Why: The chevron span needs its own recognizable directional glyph. How: This renders the 'chvEle' icon at a fixed size. */ }


											</span>

											<span className={ cssModObj.kicker }>Items</span>{ /* What: Items Kicker Span Element. Why: The disclosure needs its own visible label. How: This renders the literal text "Items". */ }


										</span>

										{ iteColBoo && <span className={ cssModObj.rdCtlSum }>{ picIteArr.length } items</span> }{ /* What: Items Summary Check. Why: A collapsed disclosure still needs a hint of what's inside. How: This renders only while iteColBoo is true. */ }


									</button>



									<ColDisCom open={ !iteColBoo }>{ /* What: Collapse Disclosure Component. Why: The item rows themselves only need to exist while the Items disclosure is actually open. How: This opens per !iteColBoo. */ }


										<React.Fragment>{ /* What: Items Fragment Element. Why: The add button, the sort control, and every item row are true siblings with no shared wrapper of their own. How: This groups all 3 pieces without adding an extra DOM node. */ }


											{ tutProBoo ? ( // What: Tutorial Progress Check. Why: The add control must stay disabled (with an explanatory tip) while the Welcome Tour's own checklist is still in progress. How: This renders a disabled InfTipCom-wrapped control in that state, otherwise the real button.


												<InfTipCom
													className={ cssModObj.rdAdd }

													data-element-name-hook='rowAddSpa'
													data-tour-disabled-active // What: Tour Disabled Active Attribute. Why: This add control only renders while the tutorials hold it disabled, so it always reads dimmed. How: This sets the presence-only attribute unconditionally, which InfTipCom forwards to its trigger.

													actNamStr={ `Add to ${ picCurObj.name.toLowerCase() }` }
													labTexStr='This button is disabled until all tutorials are completed.'
												>{ /* What: Info Tip Component. Why: A disabled control still needs to explain why it can't be clicked yet. How: This wraps the same visible label/icon the real button uses. Its data-element-name-hook is read by help mode's Data catalog. */ }


													<IcoSvgCom
														icoNamStr='pluEle'
														sizStpStr='bas'
													/>{ /* What: Icon Svg Component. Why: The disabled add control still needs a recognizable "add" glyph beside its own label. How: This renders the 'pluEle' icon at a fixed size. */ } Add to { picCurObj.name.toLowerCase() }


												</InfTipCom>


											) : ( // What: Add Button Branch. Why: Outside the guided checklist, the real working Add-item control belongs here instead. How: This renders the else branch, taken while tutProBoo is false.


												<button
													className={ cssModObj.rdAdd }

													data-element-name-hook='rowAddBut'

													disabled={ detAddBoo }

													onClick={ staAddFun }
												>{ /* What: Add Button Element. Why: This is the actual "create a brand-new item" affordance. How: This calls staAddFun on click, disabled during the guarded tour step. Its data-element-name-hook is read by help mode's Data catalog. */ }


													<IcoSvgCom
														icoNamStr='pluEle'
														sizStpStr='bas'
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

														className={` ${ cssModObj.rdItem }   ${ insIteStr === iteCurObj.id ? cssModObj.rdItemInsert : '' }   ${ hetRowBoo ? cssModObj.obTourPulse : '' } `}

														data-element-name-hook='lisIteDiv'
														data-row-edit-active={ iteOpeBoo || undefined } // What: Row Edit Active Attribute. Why: An open row's header stops reacting like a button and its chevron turns the accent color. How: This sets the presence-only attribute while iteOpeBoo is true.
														data-row-vacation-active={ iteCurObj.vacation || undefined } // What: Row Vacation Active Attribute. Why: An item on vacation reads quieter than the rest. How: This sets the presence-only attribute while the item is on vacation.

														onAnimationEnd={ () => { if ( insIteStr === iteCurObj.id ) setInsIteStr( null ); } }
													>{ /* What: Row Div Element. Why: Every item needs its own collapsible row wrapper, capturing the entrance/insert animation and the tour highlight. How: This clears insIteStr once this row's own insert animation finishes. Its data-element-name-hook is read by the App Features tours, help mode's Pickers catalog, and help mode's Data catalog. */ }


														{ iteOpeBoo ? ( // What: Editing Check. Why: The open row swaps its own header for a live name input, since a real button can't legally contain that input. How: This renders the editing header while iteOpeBoo is true, otherwise the normal clickable row.


															<div
																className={ cssModObj.rdRow }

																data-element-name-hook='lisRowDiv'
															>{ /* What: Row Div Element. Why: The name input and its own chevron button need their own row. How: This wraps the rd-main span and the chevron button below. Its data-element-name-hook is read by the App Features tours and help mode's Data catalog. */ }


																<span className={ cssModObj.rdMain }>{ /* What: Main Span Element. Why: The name input needs its own wrapper matching the closed row's own layout. How: This wraps the input below. */ }


																	<input
																		ref={ ( inpCurEle ) => { // What: Focus Reference Callback. Why: The input should focus once when it mounts, without the page jumping. How: This focuses a newly attached input with preventScroll and remembers it in focInpRef so re-renders don't refocus it.


																			if ( inpCurEle && focInpRef.current !== inpCurEle ) { // What: New Input Guard. Why: Only a freshly attached input should take focus. How: This skips null detaches and the input already focused before.


																				inpCurEle.focus( { preventScroll : true } ); // What: Focus Call. Why: The user can type the name right away. How: This focuses inpCurEle without scrolling the page.

																				focInpRef.current = inpCurEle; // What: Focused Input Record. Why: A later re-render must not steal focus back. How: This stores inpCurEle in focInpRef.


																			}


																		} }

																		className={ cssModObj.rdNameInput }

																		data-element-name-hook='rowNamInp'

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
																	/>{ /* What: Name Input Element. Why: An item's own name is edited live, right in the row header. How: This commits every keystroke immediately, and tidies the name on blur. Its data-element-name-hook is read by the picker mini-tours, help mode's Pickers catalog, and help mode's Data catalog. */ }


																</span>

																<button
																	className={` ${ cssModObj.rdChev }   ${ cssModObj.chev } `}

																	data-chevron-open-active // What: Chevron Open Active Attribute. Why: This chevron only renders on an open row, so it always points down. How: This sets the presence-only attribute unconditionally.

																	type='button'

																	aria-label='Collapse'

																	onClick={ () => keeCloFun( iteCurObj.id ) }
																>{ /* What: Chevron Button Element. Why: The chevron is its own real button (not a decoration) since the row itself can no longer be one while editing. How: This calls keeCloFun, the same "deliberate close" handler IteEdiCom's own Save uses. */ }


																	<IcoSvgCom
																		icoNamStr='chvEle'
																		sizStpStr='bas'
																	/>{ /* What: Icon Svg Component. Why: The chevron button needs its own recognizable directional glyph. How: This renders the 'chvEle' icon at a fixed size. */ }


																</button>


															</div>


														) : ( // What: Normal Row Branch. Why: A closed row just needs the plain clickable header instead. How: This renders the else branch, taken while iteOpeBoo is false.


															<button
																className={ cssModObj.rdRow }

																data-element-name-hook='lisRowBut'

																type='button'

																aria-expanded={ iteOpeBoo }

																onClick={ () => setOpeIteStr( iteOpeBoo ? null : iteCurObj.id ) }
															>{ /* What: Row Button Element. Why: A closed row is a plain clickable control that opens (or closes) its own editor. How: This toggles opeIteStr between null and iteCurObj.id. Its data-element-name-hook is read by the App Features tours and help mode's Data catalog. */ }


																<span className={ cssModObj.rdMain }>{ /* What: Main Span Element. Why: The name and its own meta line belong together. How: This wraps the name and sched spans below. */ }


																	<span
																		className={ cssModObj.rdName }

																		data-element-name-hook='rowNamSpa'
																	>{ iteCurObj.name }</span>{ /* What: Name Span Element. Why: Every item row needs its own visible name. How: This renders iteCurObj.name. Its data-element-name-hook is read by help mode's Data catalog. */ }

																	<span className={ cssModObj.rdSched }>{ rowSumStr }</span>{ /* What: Sched Span Element. Why: The closed row's meta line summarizes the item's state. How: This renders rowSumStr. */ }


																</span>

																<span
																	className={` ${ cssModObj.rdChev }   ${ cssModObj.chev } `}

																	aria-hidden='true'
																>{ /* What: Chevron Span Element. Why: The open row shows a decorative chevron at its end. How: This is hidden from screen readers and wraps the chev icon. */ }


																	<IcoSvgCom
																		icoNamStr='chvEle'
																		sizStpStr='bas'
																	/>{ /* What: Icon Svg Component. Why: The chevron span needs its own recognizable directional glyph. How: This renders the 'chvEle' icon at a fixed size. */ }


																</span>


															</button>


														) }



														<ColDisCom open={ iteOpeBoo }>{ /* What: Collapse Disclosure Component. Why: This row's own editor only needs to exist while it's actually open. How: This opens only while iteOpeBoo is true. */ }


															<div className={ cssModObj.rdEdit }>{ /* What: Edit Div Element. Why: IteEdiCom needs its own wrapper matching every other editor body in this file. How: This wraps IteEdiCom below. */ }


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

																			setTimeout( () => actStoObj.delIteFun( rmvIdeStr ), durMilFun( 'p02' ) ); // What: Deferred Remove Call. Why: The actual store removal must wait until the row's own collapse animation finishes. How: This calls delIteFun after that animation's own p02 duration step.


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



																		setTimeout( () => actStoObj.delIteFun( rmvIdeStr ), durMilFun( 'p02' ) ); // What: Deferred Remove Call. Why: The actual store removal must wait until the row's own collapse animation finishes. How: This calls delIteFun after that animation's own p02 duration step.


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
						className={ cssModObj.catCreateBtn }

						data-element-name-hook='datCreBut'

						disabled={ disCreBoo }
						type='button'

						onClick={ staNewFun }
					>{ /* What: Create Button Element. Why: This is the only place a brand-new picker can be started from this tab. How: This calls staNewFun on click, disabled during the guarded tour step. Its data-element-name-hook is read by the Data page tour and help mode's Data catalog. */ }


						<IcoSvgCom
							icoNamStr='pluEle'
							sizStpStr='bas'
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


