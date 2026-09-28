


// #region Imports

import React from 'react'; // What: React. Why: TabPicCom is built directly on React's own APIs. How: This is used directly (React.useCallback, React.useEffect, React.useMemo, React.useRef, React.useState) instead of importing individual named hooks.


import { clePicFun    } from '../../help/sample-data.js';           // What: Clear Pickers Function. Why: Help mode's disposable sample pickers/conditionals must be torn down the moment help mode turns off or this tab unmounts. How: This is called from TabPicCom's own help-mode effect and its unmount cleanup.
import { emlTouObj    } from '../../state/tour-bus.js';             // What: Ease My Life Tour Object. Why: A couple of tour-driven behaviors need to read the shared tour bus's current value synchronously, not through React state. How: This is read via emlTouObj.get() when staging a new draft item's tour prefill, and written via emlTouObj.set() to clear a staged empty-state prefill.
import { HelButCom    } from '../../help/button.jsx';               // What: Help Button Component. Why: This page needs its own toggle for entering/exiting help mode. How: This is rendered in the page header, wired to the local helpOn boolean.
import { HelOveCom    } from '../../help/mode.jsx';                 // What: Help Overlay Component. Why: Help mode needs its own highlighted-tooltip overlay layered above the page. How: This is rendered once, fed this page's own PIC_HEL_ARR.
import { IcoSvgCom    } from '../../ui/icon.jsx';                   // What: Icon Svg Component. Why: The tab's header and add controls show small glyphs. How: This is rendered inside those controls.
import { InfTipCom    } from '../../ui/info-tip.jsx';               // What: Info Tip Component. Why: The Add New Picker button is disabled until the tutorials are complete and must say so. How: This wraps that button with the reason as its tip.
import { ONB_CHE_OBJ  } from '../../state/onboarding-checklist.js'; // What: Onboarding Checklist Object. Why: The Add New Picker button must stay disabled while the guided-tour checklist is still in progress. How: This is checked via ONB_CHE_OBJ.tutProFun against the shared state.
import { PIC_HEL_ARR  } from '../../help/content.jsx';              // What: Picker Help Array. Why: Help mode needs this page's own list of highlighted elements and their explanations. How: This is passed straight through to HelOveCom.
import { PicForCom    } from './picker-form.jsx';                   // What: Picker Form Component. Why: Creating a picker happens in the same slot a picker's view would occupy. How: This is rendered while the create form is open.
import { PicVieCom    } from './picker-view.jsx';                   // What: Picker View Component. Why: The selected picker's run stage and pool list render below the picker rails. How: This is rendered for the active picker whenever the create form is closed.
import { redMotFun    } from '../../utils/motion.js';               // What: Reduce Motion Function. Why: Several exit/scroll animations must be skipped for a user who prefers reduced motion. How: This is checked before every animated scroll, exit delay, or the reel/spotlight/dissolve cycle itself.
import { SED_NAM_OBJ  } from '../../state/seed.js';                 // What: Seed Namespace Object. Why: This is the canonical lookup of every picker mode's own label and hint text. How: This is read (MOD_DEF_OBJ) throughout to show the active mode's label/hint and to render the mode-choice radio list.
import { sedPicFun    } from '../../help/sample-data.js';           // What: Seed Pickers Function. Why: Help mode needs real pickers of every mode, plus a conditional-gated one, to point its tooltips at. How: This is called the moment help mode turns on.
import { useEmlTouFun } from '../../state/tour-bus.js';             // What: Use Ease My Life Tour Function. Why: Several behaviors here read the shared tour bus as React state. How: This is called once per component to subscribe to the picker mini-tour's nonces, the page tour's gating, and the empty-state create prefill.

// #endregion Imports



/**
 * tab-picker.jsx = Tab Picker
 *
 * @summary
 * The Pickers tab: browse, manually run, and create or edit every picker.
 * TabPicCom renders the Group and Type filter rails and the picker tabs, then
 * either the selected picker's PicVieCom (picker-view.jsx) or the create
 * form's PicForCom (picker-form.jsx), plus the disposable-sample machinery
 * help mode and the onboarding tours both rely on.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

// #region TabPicCom

/**
 * TabPicCom = Tab Picker Component
 *
 * @summary
 * The whole Pickers page: a header, Group/Type filter rows, a Show row of
 * per-picker tabs (plus an Add New Picker tab), and below it either
 * PicForCom (creating a fresh picker) or PicVieCom (running/editing the
 * selected one). Also owns this page's own help mode (seeding/tearing down
 * a disposable copy set of sample pickers) and the several tour/checklist
 * gates that narrow what a first-time user can click before they've
 * finished the guided walkthroughs.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actStoObj   - Action Store Object: {@link useAppStaFun}
 * @param props.aniStyStr   - Animation Style String: Which PicStrCom
 *                            animation style PicVieCom should play.
 * @param props.onNavHomFun - On Navigate Home Function: Navigates back to
 *                            the Today tab.
 * @param props.onNavTabFun - On Navigate Tab Function: Switches to an
 *                            arbitrary tab by id.
 * @param props.staAppObj   - State App Object: {@link useAppStaFun}
 *
 * @returns The whole Pickers page: its header, filter rows, the Show tab
 * row, and whichever of PicForCom/PicVieCom currently applies.
 *
 * @example
 * ```tsx
 * TabPicCom({ actStoObj, aniStyStr, onNavHomFun, ... }) // => <TabPicCom />
 * ```
 *
*/

function TabPicCom ( { actStoObj, aniStyStr, onNavHomFun, onNavTabFun, staAppObj } ) {


	// #region Picker Selection And Filters

	const [ actPicStr, setActPicStr ] = React.useState( () => ( // What: Active Picker String And Setter. Why: This defaults to the first picker the Show row itself will display (see sorPicArr below), alphabetical, not pickers' own storage-array order, which the row's own render is sorted by too. How: This duplicates sorPicArr's own filter+sort inline, since that memo isn't declared yet at this point in the component, purely for this one initial value.


		[ ...staAppObj.pickers ].filter( ( picCurObj ) => !picCurObj.hidden ).sort( ( picOneObj, picTwoObj ) => picOneObj.name.localeCompare( picTwoObj.name ) )[ 0 ]?.id // What: First Visible Picker Expression. Why: The page opens on the first picker the Show row lists. How: This sorts the visible pickers by name and takes the first id.


	) );


	const [ creOpeBoo, setCreOpeBoo ] = React.useState( false ); // What: Create Open Boolean And Setter. Why: This is whether PicForCom is currently showing in place of PicVieCom. How: This is flipped by the Add New Picker tab and cleared once a picker is created or the form is cancelled.
	const [ groFilStr, setGroFilStr ] = React.useState( 'all' ); // What: Group Filter String And Setter. Why: This is which group pill is currently narrowing the Show row. How: This starts on 'all' and is set by the Group filter row below.
	const [ typFilStr, setTypFilStr ] = React.useState( 'all' ); // What: Type Filter String And Setter. Why: This is which mode pill is currently narrowing the Show row. How: This starts on 'all' and is set by the Type filter row below.

	const actPicObj = staAppObj.pickers.find( ( picCurObj ) => picCurObj.id === actPicStr ); // What: Active Picker Object. Why: PicVieCom needs the actual current picker record, not just its id. How: This looks up actPicStr in staAppObj.pickers.

	// #endregion Picker Selection And Filters



	// #region Help Mode

	const [ helOpeBoo, setHelOpeBoo ] = React.useState( false ); // What: Help Open Boolean And Setter. Why: Help mode (see help/mode.jsx) needs real pickers of every mode plus a conditional-gated one to point at, so a disposable copy set is seeded the moment it turns on and torn down the moment it turns off (see help/sample-data.js's own header comment for why this is a SEPARATE disposable namespace from the page tour's own `pt_`-prefixed copies). How: This is toggled by HelButCom below.

	const helExiFun = React.useCallback( () => setHelOpeBoo( false ), [] ); // What: Help Exit Function. Why: HelOveCom needs a stable callback to close itself with. How: This just sets helOpeBoo false.


	React.useEffect( () => { // What: Help Seed Effect. Why: Help mode needs disposable sample pickers only while it's on. How: This seeds them when helOpeBoo turns on and clears them when it turns off.


		if ( helOpeBoo ) sedPicFun( staAppObj, actStoObj ); // What: Seed Branch. Why: The disposable help-mode sample set must exist the instant help mode turns on. How: This calls sedPicFun with the live state/actions.

		else clePicFun( actStoObj ); // What: Clear Branch. Why: The disposable sample set must not linger once help mode turns back off. How: This calls clePicFun with actions.


	}, [ helOpeBoo ] ); // What: Effect Dependency Array. Why: This only needs re-running when help mode itself is toggled. How: helOpeBoo is the sole trigger.

	React.useEffect( () => () => clePicFun( actStoObj ), [] ); // What: Unmount Cleanup Effect. Why: A tab switch away from Pickers with help mode still on needs its own cleanup, since the effect above's own cleanup only fires on a DEPENDENCY change, not on unmount. How: This is unconditional and harmless if nothing was ever seeded, since clePicFun's own delPicFun/delConFun calls are no-ops against ids that don't exist.

	// #endregion Help Mode



	// #region Tour Gating And Prefill

	const touBusObj = useEmlTouFun ? useEmlTouFun() : { preFilObj : null, staCreObj : null }; // What: Tour Bus Object. Why: This page needs the shared tour bus to stage a prefilled create form and to gate several buttons during the guided walkthroughs. How: This subscribes via useEmlTouFun, or falls back to an inert stub if that hook somehow isn't available.
	const isaTouBoo = touBusObj.touPhaStr === 'tour';                                         // What: Is-A Tour Boolean. Why: Every gate below needs to know a tour is actually running before it even checks which one. How: This is reused as the shared first operand of every tour-gating boolean that follows.

	const disAddBoo = isaTouBoo && touBusObj.touIdeStr === 'page-explore_pickers' && touBusObj.touSteNum === 3;            // What: Disable Add Boolean. Why: The Pickers page tour's own Step 4 highlights "Add New Picker" but explicitly doesn't want the user opening the real create form from it, since that flow is what the separate picker mini-tours already cover. How: This is gated on tourId, not just step index alone, since some OTHER tour could just as easily be sitting on step index 3 for its own unrelated reason.
	const picTouBoo = isaTouBoo && typeof touBusObj.touIdeStr === 'string' && touBusObj.touIdeStr.startsWith( 'picker-' ); // What: Picker Tour Active Boolean. Why: A running picker mini-tour's own Step 2 wants the user to click the real Add New Picker button themselves, not a simulated click, exempting it from tutProBoo's own gate below for its whole run (later steps' own cirBoo targets are elsewhere, so the click-guard already keeps a stray click on this button from doing anything by then anyway). How: This checks the shared tourId prefix convention picker mini-tours use.
	const tutProBoo = ONB_CHE_OBJ.tutProFun( staAppObj ) && !picTouBoo;                                                    // What: Tutorials Progress Boolean. Why: This button is separately disabled anywhere from the Welcome Tour's first step through the closing Generate card's flow completing. How: This is distinct from disAddBoo above (still needed on its own: a Replay of the Pickers page tour runs AFTER the checklist finishes, when this is always false), and is exempted for the whole run of a picker mini-tour via picTouBoo.

	const [ opeTouBoo, setOpeTouBoo ] = React.useState( false ); // What: Opened Tour Boolean And Setter. Why: Prefill staged by Today's empty-state card (name focus + "Chores") needs to know NOT to fire the tour's own advance callback, unlike a real tour walkthrough. How: This is set true only by the tour-prefill effect below, never by the empty-state entry effect.
	const [ empIniObj, setEmpIniObj ] = React.useState( null );  // What: Empty Initial Object And Setter. Why: Prefill staged by Today's empty-state card needs to survive clearing the bus signal that carried it. How: This is set once by the empty-state effect below and consumed as PicForCom's own iniForObj prop.


	React.useEffect( () => { // What: Tour Prefill Effect. Why: When the tour stages a prefill, the create form should open for it automatically. How: This opens creOpeBoo and flags opeTouBoo, but only when nothing is already open and the tour hasn't explicitly suppressed this auto-open (see touBusObj.supAutBoo's own comment at its use site in onboarding/picker-tours.jsx: that tour always opens this form via a real click on the button below, which sets creOpeBoo itself; without this flag, that same click's prefill can reach this effect on an earlier render than the one where creOpeBoo turns true, since the bus's subscriber callback isn't part of the click's own React batch, making this effect wrongly claim credit and flip opeTouBoo to true).


		const hasPreBoo = !!touBusObj.preFilObj; // What: Has Prefill Boolean. Why: The chain below combines 3 real-expression operands, so each is named individually per this project's long-boolean-expression rule. How: This is true whenever the bus is currently staging a prefill.
		const notCreBoo = !creOpeBoo;            // What: Not Creating Boolean. Why: See hasPreBoo's own comment. How: This is true whenever the create form isn't already open.
		const skiAutBoo = !touBusObj.supAutBoo;  // What: Skip Auto-Open Boolean. Why: See hasPreBoo's own comment. How: This is true whenever the tour hasn't explicitly suppressed this auto-open.


		if ( hasPreBoo && notCreBoo && skiAutBoo ) { // What: Auto-Open Guard. Why: All 3 conditions must hold before this effect may claim credit for opening the form. How: This opens creOpeBoo and flags opeTouBoo together.


			setCreOpeBoo( true ); // What: Create Open Call. Why: The tour's prefill needs the create form open. How: This sets creOpeBoo to true.
			setOpeTouBoo( true ); // What: Tour Open Mark Call. Why: The form must know a tour opened it. How: This sets opeTouBoo to true.


		}


	}, [ touBusObj.preFilObj ] ); // What: Effect Dependency Array. Why: Only a genuine change to the staged prefill should re-evaluate this. How: touBusObj.preFilObj is the sole trigger.

	React.useEffect( () => { // What: Empty-State Create Effect. Why: Today's "no pickers" empty-state card should open the create form with its own staged prefill, but WITHOUT opeTouBoo, since this isn't the tour and creating the picker must not fire the tour's own advance callback. How: This consumes touBusObj.staCreObj once, then clears it, prefilling a "Chores" group only when there are no groups to auto-select (a group can technically exist with no pickers, so an existing one is respected by leaving group unset, letting the form auto-select it).


		if ( touBusObj.staCreObj && !creOpeBoo ) { // What: Start Create Guard. Why: Only a genuinely-staged empty-state prefill, with nothing already open, should trigger this. How: This checks both conditions before doing anything.


			const staPayObj = exiGroArr.length === 0 ? { ...touBusObj.staCreObj, group : 'Chores' } : touBusObj.staCreObj; // What: Staged Payload Object. Why: A brand-new install with no groups at all should land the empty-state picker in a sensible default group. How: This adds group:'Chores' only when exiGroArr is empty, otherwise passing the staged prefill through unchanged.


			setEmpIniObj( staPayObj ); // What: Prefill Store Call. Why: PicForCom needs this exact shape as its own iniForObj prop. How: This writes staPayObj into empIniObj.

			setCreOpeBoo( true ); // What: Open Form Call. Why: The create form must actually show for the staged prefill to matter at all. How: This flips creOpeBoo true.

			emlTouObj.set({ staCreObj : null }); // What: Bus Clear Call. Why: This staged signal must only ever be consumed once. How: This writes staCreObj : null back onto the shared bus.


		}


	}, [ touBusObj.staCreObj ] ); // What: Effect Dependency Array. Why: Only a genuine change to this exact staged signal should re-run this. How: touBusObj.staCreObj is the sole trigger; exiGroArr/creOpeBoo are read fresh from the closure each time it fires.

	// #endregion Tour Gating And Prefill



	// #region Filter Rows

	const exiGroArr = React.useMemo( () => { // What: Existing Group Array. Why: Distinct group names, alphabetical, offered as chips in the form and as the group filter bar above the picker strip ("All" itself is a separate, always-first pill rendered outside this list). How: This walks staAppObj.pickers collecting each visible picker's own group name once, then alphabetizes them.


		const seeGroArr = []; // What: Seen Group Array. Why: The loop below needs an accumulator to collect each distinct group name into. How: This starts empty and is pushed to by the loop.


		for ( const curPicObj of staAppObj.pickers ) { // What: Collect Groups Loop. Why: Every visible picker's own group name (if it has one, and isn't already collected) belongs in the result. How: This walks staAppObj.pickers, pushing each new group name onto seeGroArr.


			const hasGroBoo = Boolean( curPicObj.group );             // What: Has Group Boolean. Why: A picker with no group adds nothing to the list. How: This coerces curPicObj.group to a boolean.
			const notHidBoo = !curPicObj.hidden;                      // What: Not Hidden Boolean. Why: A hidden picker's group shouldn't surface. How: This negates curPicObj.hidden.
			const unsGroBoo = !seeGroArr.includes( curPicObj.group ); // What: Unseen Group Boolean. Why: Each group name is collected once. How: This checks seeGroArr doesn't hold it yet.

			const addGroBoo = hasGroBoo && notHidBoo && unsGroBoo; // What: Add Group Boolean. Why: Only a real, visible, not-yet-collected group is added. How: This ANDs the 3 checks above.


			if ( addGroBoo ) seeGroArr.push( curPicObj.group ); // What: Group Push Guard. Why: This is the actual collection step. How: This pushes the group name when addGroBoo is true.


		}



		return seeGroArr.sort( ( groOneStr, groTwoStr ) => groOneStr.localeCompare( groTwoStr ) ); // What: Sorted Groups Return. Why: The group chips should read in a stable, predictable order. How: This returns seeGroArr sorted alphabetically.


	}, [ staAppObj.pickers ] ); // What: Memo Dependency Array. Why: The group list only needs recomputing when the pickers list itself changes. How: staAppObj.pickers is what the loop above actually reads.


	const exiModArr = React.useMemo( () => { // What: Existing Mode Array. Why: Distinct modes actually in use, alphabetical by their own display label, are this page's own Type filter bar pills ("All" is pinned first, same as Group); unlike Stats/Data, this page has no management section for Conditionals/Reminders, so Type here is purely a picker-mode filter. How: This walks staAppObj.pickers collecting each visible picker's own mode once, then alphabetizes by SED_NAM_OBJ.MOD_DEF_OBJ's own label.


		const seeModSet = new Set(); // What: Seen Mode Set. Why: The loop below needs a Set to collect each distinct mode into, deduplicating for free. How: This starts empty and gains entries from the loop.


		for ( const curPicObj of staAppObj.pickers ) if ( !curPicObj.hidden ) seeModSet.add( curPicObj.mode ); // What: Collect Modes Loop. Why: Every visible picker's own mode belongs in the result. How: This walks staAppObj.pickers, adding each one's own mode into seeModSet.



		return [ ...seeModSet ].sort( ( modOneStr, modTwoStr ) => SED_NAM_OBJ.MOD_DEF_OBJ[ modOneStr ].labStr.localeCompare( SED_NAM_OBJ.MOD_DEF_OBJ[ modTwoStr ].labStr ) ); // What: Sorted Modes Return. Why: The mode chips should read in a stable order matching their own display labels, not their raw internal keys. How: This spreads seeModSet into an array and sorts by each key's own SED_NAM_OBJ.MOD_DEF_OBJ label.


	}, [ staAppObj.pickers ] ); // What: Memo Dependency Array. Why: The mode list only needs recomputing when the pickers list itself changes. How: staAppObj.pickers is what the loop above actually reads.


	const visPicArr = React.useMemo( () => staAppObj.pickers.filter( ( picCurObj ) => { // What: Visible Picker Array. Why: The picker strip is scoped to the selected group AND type, independent filters ("all" on either leaves that axis unfiltered); hidden pickers (see store.js's `hidden` flag) never appear here. How: This filters staAppObj.pickers against groFilStr/typFilStr, each independently gated by its own "all" check.


		const notHidBoo = !picCurObj.hidden;                                    // What: Not Hidden Boolean. Why: A hidden picker (a draft or a help sample) never lists here. How: This negates picCurObj.hidden.
		const groMatBoo = groFilStr === 'all' || picCurObj.group === groFilStr; // What: Group Match Boolean. Why: The Group filter narrows by group. How: This passes every picker while it's 'all', otherwise only a matching group.
		const typMatBoo = typFilStr === 'all' || picCurObj.mode === typFilStr;  // What: Type Match Boolean. Why: The Type filter narrows by mode. How: This passes every picker while it's 'all', otherwise only a matching mode.

		const incPicBoo = notHidBoo && groMatBoo && typMatBoo; // What: Include Picker Boolean. Why: A picker lists only when every filter passes it. How: This ANDs the 3 checks above.



		return incPicBoo; // What: Include Picker Return. Why: filter() needs a yes/no per picker. How: This returns incPicBoo.


	} ), [ staAppObj.pickers, groFilStr, typFilStr ] ); // What: Memo Dependency Array. Why: The visible list only changes when the pickers or either filter change. How: Each of these values independently affects which pickers pass.


	const sorPicArr = React.useMemo( () => ( // What: Sorted Visible Picker Array. Why: This is the same alphabetical order the Show row itself renders in below, reused so "jump to the first card" always agrees with what's actually shown first, not visPicArr's own storage-array order. How: This sorts a copy of visPicArr by name.


		[ ...visPicArr ].sort( ( picOneObj, picTwoObj ) => picOneObj.name.localeCompare( picTwoObj.name ) ) // What: Name Sort Expression. Why: The Show row lists pickers alphabetically. How: This sorts a copy of visPicArr by name.


	), [ visPicArr ] ); // What: Memo Dependency Array. Why: The sorted list only changes when the visible list does. How: visPicArr is the single value it sorts.


	const preFilRef = React.useRef( { groStr : groFilStr, typStr : typFilStr } ); // What: Previous Filters Reference. Why: The selection-coherence effect below needs to remember the last-seen filter values across renders to detect an actual filter change, distinct from the picker list itself changing for some unrelated reason. How: This starts at the current filters and is updated by that effect whenever either one changes.


	React.useEffect( () => { // What: Selection Coherence Effect. Why: Either filter itself just changing should always land on the first card in the new Show row, matching it exactly rather than only reacting once the OLD selection happens to fall out of view (e.g. switching from a wide group to a narrower one that still happens to contain the same active picker used to leave it stranded, not jumped to the new first card); the picker list changing for some unrelated reason (e.g. the active picker got deleted) should only jump when the current selection actually became invalid. How: This computes filChaBoo by comparing against preFilRef, then jumps to sorPicArr's own first entry whenever either that or an invalid selection applies.


		if ( creOpeBoo ) return; // What: Creating Guard. Why: The create form has no "selection" of its own to keep coherent. How: This bails out entirely while creOpeBoo is true.



		const filChaBoo = preFilRef.current.groStr !== groFilStr || preFilRef.current.typStr !== typFilStr; // What: Filter Changed Boolean. Why: The jump-to-first behavior below depends specifically on whether a filter itself just changed. How: This compares both current filter values against what preFilRef last recorded.


		preFilRef.current = { groStr : groFilStr, typStr : typFilStr }; // What: Previous Filters Update. Why: The next run of this effect needs to compare against the filters that are current now. How: This overwrites preFilRef with both current filter values.

		if ( filChaBoo || !visPicArr.some( ( picCurObj ) => picCurObj.id === actPicStr ) ) setActPicStr( sorPicArr[ 0 ]?.id ); // What: Jump To First Guard. Why: Either a genuine filter change, or the current selection no longer being visible at all, should land on the new first card. How: This writes sorPicArr's own first entry's id into actPicStr.


	}, [ groFilStr, typFilStr, visPicArr, sorPicArr, actPicStr, creOpeBoo ] ); // What: Effect Dependency Array. Why: This must re-check whenever any of these could change what "coherent" means. How: groFilStr/typFilStr are the filters themselves, visPicArr/sorPicArr are what they produce, actPicStr is the current selection, and creOpeBoo gates whether this applies at all.


	const tabRaiRef = React.useRef( null ); // What: Tab Rail Reference. Why: The scroll-edge fade effect below needs the Show row's own element. How: This is attached to that rail's ref prop. // What: Scroll-Aware Edge Fades Design Note. Why: The tab strip, and the Group/Type filter rails, all need the same at-start/at-end mask-gradient behavior so each one's own fade only shows on the side that has more content. How: tabRaiRef/groRaiRef/typRaiRef below are attached to those three rails; the effect right after wires up a shared scroll+resize listener for whichever of them are actually mounted.
	const groRaiRef = React.useRef( null ); // What: Group Rail Reference. Why: The scroll-edge fade effect below needs the Group rail's own element. How: This is attached to that rail's ref prop.
	const typRaiRef = React.useRef( null ); // What: Type Rail Reference. Why: Same reasoning as groRaiRef, for the Type rail. How: This is attached to that rail's ref prop.


	React.useEffect( () => { // What: Rail Fade Effect. Why: Every filter rail shares the same scroll-edge fade affordance. How: This wires at-start/at-end tracking for each mounted rail and tears it down on change.


		const valRaiArr = [ tabRaiRef.current, groRaiRef.current, typRaiRef.current ].filter( Boolean ); // What: Valid Rail Array. Why: Only whichever rails are actually mounted right now (the Group/Type rows can be entirely absent) should get listeners. How: This filters out any null ref.


		const cleFunArr = valRaiArr.map( ( curRaiEle ) => { // What: Cleanup Function Array. Why: Each rail needs its own independent listener/observer pair, and its own independent teardown. How: This maps each element to a closure removing exactly its own listener and disconnecting its own observer.


			const updFadFun = () => { // What: Update Fade Function. Why: The at-start/at-end classes need recomputing every time this rail scrolls or resizes. How: This toggles both classes based on the rail's own current scroll position versus its scrollable width.


				const canScrBoo = curRaiEle.scrollWidth - curRaiEle.clientWidth > 1;                                       // What: Can Scroll Boolean. Why: A rail that doesn't actually overflow should just show both fades as "at rest" rather than neither. How: This compares the rail's own full content width against its visible width.
				const reaStaBoo = !canScrBoo || curRaiEle.scrollLeft <= 1;                                                 // What: Reached Start Boolean. Why: The left edge fade should hide once the rail can't scroll left any further. How: This is true whenever the rail can't scroll at all, or is already scrolled to (near) its start.
				const reaEndBoo = !canScrBoo || curRaiEle.scrollLeft + curRaiEle.clientWidth >= curRaiEle.scrollWidth - 1; // What: Reached End Boolean. Why: The right edge fade should hide once the rail can't scroll right any further. How: This is true whenever the rail can't scroll at all, or is already scrolled to (near) its end.


				curRaiEle.classList.toggle( 'at-start', reaStaBoo ); // What: At-Start Toggle Call. Why: This is the actual class application described above. How: This applies reaStaBoo onto curRaiEle's own classList.

				curRaiEle.classList.toggle( 'at-end', reaEndBoo ); // What: At-End Toggle Call. Why: This is the actual class application described above. How: This applies reaEndBoo onto curRaiEle's own classList.


			};


			updFadFun(); // What: Initial Update Call. Why: The classes need to be correct immediately on mount, without waiting for a scroll or resize event. How: This invokes updFadFun once, synchronously.

			curRaiEle.addEventListener( 'scroll', updFadFun, { passive : true } ); // What: Scroll Listener Call. Why: The classes must stay correct as the user actually scrolls this rail. How: This re-runs updFadFun on every scroll event.


			const resObsObj = new ResizeObserver( updFadFun ); // What: Resize Observer Object. Why: The filter rows/Show row's own content can change width (a group added/removed, a picker created/deleted) without the rail itself scrolling. How: This re-runs updFadFun whenever the observed element's size changes.


			resObsObj.observe( curRaiEle ); // What: Resize Observer Start Call. Why: The observer above does nothing until it's actually told what to watch. How: This starts watching curRaiEle for size changes.



			return () => { // What: Per-Rail Cleanup Return. Why: This exact rail's own listener/observer must not outlive this effect run. How: This removes the scroll listener and disconnects the observer for curRaiEle specifically.


				curRaiEle.removeEventListener( 'scroll', updFadFun ); // What: Scroll Unsubscribe Call. Why: The listener must not outlive this effect run. How: This removes updFadFun from curRaiEle.
				resObsObj.disconnect();                               // What: Observer Disconnect Call. Why: The observer must not outlive this rail either. How: This disconnects resObsObj.


			};


		});



		return () => cleFunArr.forEach( ( curCleFun ) => curCleFun() ); // What: Effect Cleanup Return. Why: Every rail's own cleanup must actually run when this effect re-runs or unmounts. How: This calls every function collected in cleFunArr.


	}, [ staAppObj.pickers.length, exiGroArr.length, exiModArr.length, groFilStr, typFilStr, visPicArr.length ] ); // What: Effect Dependency Array. Why: Any of these can change whether a rail's own content actually overflows, requiring the fades to be recomputed. How: staAppObj.pickers.length/exiGroArr.length/exiModArr.length/visPicArr.length all reflect content-size changes, and groFilStr/typFilStr reflect the Show row's own content changing under a new filter.

	// #endregion Filter Rows



	// #region Create Form Closing

	const scrTopFun = () => { // What: Scroll Top Function. Why: Both canCreFun below and the successful-create flow need to scroll the shared .main container back to the top. How: This queries for .main directly and scrolls it, if found.


		const scrConEle = document.querySelector( '.main' ); // What: Scroll Container Element. Why: The scroll call below needs the actual live DOM node. How: This queries for the .main element directly.


		if ( scrConEle ) scrConEle.scrollTo({ // What: Scroll Call Guard. Why: Only a genuinely-found container should be scrolled. How: This scrolls .main to the top if it exists.


			behavior : redMotFun() ? 'auto' : 'smooth', // What: Behavior. Why: A user who prefers reduced motion gets an instant jump instead of a glide. How: This picks 'auto' under reduced motion, otherwise 'smooth'.
			top      : 0                                // What: Top. Why: The page's start is its top. How: This scrolls to y 0.


		});


	};


	// #region canCreFun

	/**
	 * canCreFun = Cancel Create Function
	 *
	 * @summary
	 * Backs out of the create form. It scrolls the page to the top first, while
	 * the tall form is still mounted so the scroll has real distance to glide,
	 * then swaps back to the picker view 240ms later; under reduced motion it
	 * scrolls and closes at once.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * canCreFun() // => void
	 * ```
	 *
	*/

	const canCreFun = () => { // What: Cancel Create Function. Why: Backing out of the create form should scroll up first (while the tall form is still mounted, so there's real distance to glide), then swap back to the picker view. How: This scrolls to top immediately under reduced motion (closing right away), otherwise scrolling first and closing 240ms later once the glide has had time to play.


		if ( redMotFun() ) { setCreOpeBoo( false ); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion shouldn't wait through a skipped scroll animation. How: This closes the form immediately and returns.



		scrTopFun(); // What: Scroll Up Call. Why: The tall form needs to still be mounted while this scroll actually plays, or there's nothing to glide past. How: This calls scrTopFun while creOpeBoo is still true.

		setTimeout( () => setCreOpeBoo( false ), 240 ); // What: Delayed Close Call. Why: The form must not vanish until the scroll-up glide has had time to actually finish. How: This closes the form 240ms later.


	};

	// #endregion canCreFun

	// #endregion Create Form Closing



	return (


		<div className='tab tab--picker'>{ /* What: Tab Picker Div Element. Why: This is TabPicCom's own root, holding the help overlay, the header, and the body (filters, Show row, and the active create/view content). How: This wraps every piece of the whole Pickers page. */ }


			<HelOveCom
				actModBoo={ helOpeBoo }
				helIteArr={ PIC_HEL_ARR }

				onCloAllFun={ helExiFun }
			/>{ /* What: Help Overlay Component. Why: This page needs its own highlighted-tooltip walkthrough. How: This is fed PIC_HEL_ARR and stays mounted regardless of helOpeBoo, gating its own visibility internally. */ }



			<header className='picker-h-head'>{ /* What: Header Element. Why: The kicker/help row, the brand lead, and the intro paragraph form one page header. How: This wraps those three pieces. */ }


				<div className='kicker-row'>{ /* What: Kicker Row Div Element. Why: The page kicker and the Help toggle sit side by side. How: This wraps those two pieces. */ }


					<div className='kicker'>Pickers</div>{ /* What: Kicker Div Element. Why: A small eyebrow label orients the reader before the page's own heading below. How: This renders the literal word "Pickers". */ }



					<HelButCom
						actModBoo={ helOpeBoo }

						onClick={ () => setHelOpeBoo( ( preOpeBoo ) => !preOpeBoo ) }
					/>{ /* What: Help Button Component. Why: The user needs a way to toggle this page's own help mode. How: This flips helOpeBoo on click. */ }


				</div>



				<div className='picker-h-lead'>{ /* What: Lead Div Element. Why: The brand mark and the page's own main heading sit side by side. How: This wraps those two pieces. */ }


					<button
						className='brand-mark'

						type='button'

						aria-label='Ease My Life link to go to the Today page'

						onClick={ onNavHomFun }
					>{ /* What: Brand Button Element. Why: The logo also works as a shortcut back to the Today tab. How: This wraps the logo svg and calls onHome on click. */ }


						<svg
							fill='none'
							viewBox='8 8 528 528'

							aria-hidden='true'
						>{ /* What: Logo Svg Element. Why: This draws the same small square "Ease My Life" logo mark app.jsx's own TabBarCom uses, so every page's own header reads as one product. How: This is a fixed-viewBox icon composed of a grid, a rounded-square badge outline, and a clipped glyph path. */ }


							<defs>{ /* What: Clip Defs Element. Why: An SVG clipPath can only be applied via a defined, referenced id, not inline. How: This holds the one clipPath definition the glyph path below references. */ }


								<clipPath
									id='braMarCli--pic'

									clipPathUnits='userSpaceOnUse'
								>{ /* What: Badge Clippath Element. Why: The glyph path's own curves slightly overshoot the rounded-square badge and need to be masked to it. How: This defines a rounded-square clip region under a fixed id local to this one page's own logo instance. */ }


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
								style={{ fill : 'currentColor', stroke : 'currentColor' }}

								clipPath='url(#braMarCli--pic)'
								d='M 24.467 527.792 C 67.266 416.298 77.088 228.913 172.207 434.412 C 200.739 535.77 262.562 434.412 314.873 292.51 C 381.45 120.201 450.381 44.636 528.854 24.365 C 521.725 22.337 512.215 24.365 493.193 34.5 C 369.548 105.451 295.85 292.51 234.029 363.461 C 186.473 414.14 167.451 241.831 124.651 262.102 C 101.828 270.008 60.133 375.754 24.467 527.792 Z'
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth='8'
							/>{ /* What: Glyph Path Element. Why: This is the actual squiggly "Ease My Life" brand glyph drawn inside the badge. How: This path is clipped to the rounded-square badge so its curves never spill outside it. */ }


						</svg>


					</button>


					<div className='section-h'>{ /* What: Section Header Div Element. Why: The page's own main heading needs its own wrapper for layout. How: This wraps section-title. */ }


						<h1 className='section-title'><span className='picker-title-accent'>Easing</span> your life, one pick at a time.</h1>{ /* What: Title Heading Element. Why: Every tab needs its own main heading. How: This renders a fixed heading with its first word given its own accent-colored span. */ }


					</div>


				</div>



				<p className='section-sub picker-h-sub'>Each picker has its own rule for how it chooses. Run a picker for a random item or just select an item manually and then push it to the Today tab. You can also create an entirely new picker here, add to its list of items, or edit an existing picker and its items&rsquo; settings. Conditionals and reminders can be managed in the <button type='button' className='sub-tablink' onClick={ () => onNavTabFun && onNavTabFun( 'data' ) }>Data page</button>.</p>{ /* What: Intro Paragraph Element. Why: A first-time user needs a plain-language orientation to the whole page before touching anything. How: This renders a fixed explanatory sentence with an inline link that switches to the Data tab. */ }


			</header>



			<div
				className='picker-body'

				style={ touBusObj.resTopNum ? { paddingTop : touBusObj.resTopNum } : undefined }
			>{ /* What: Body Div Element. Why: A running tour can reserve extra top padding to keep its own coach clear of the header. How: This wraps every filter row, the Show row, and the active create/view content below. */ }


				<div className='stat-filters ob-picker-content'>{ /* What: Filters Div Element. Why: The Group row, the Type row, and the Show row all belong to one shared filter block the Pickers page tour can target together. How: This wraps every stat-filter-row below. */ }


					{ exiGroArr.length > 1 && ( // What: Group Row Check. Why: A single-group install has nothing to actually filter by. How: This renders the whole Group filter row only once more than one distinct group exists.


						<div className='stat-filter-row'>{ /* What: Group Filter Row Div Element. Why: The "Group" label and its own pill rail sit side by side. How: This wraps stat-filter-lbl and the picker-groups rail. */ }


							<span className='stat-filter-lbl'>Group</span>{ /* What: Group Filter Label Span Element. Why: The rail below needs a readable label. How: This renders the literal word "Group". */ }

							<div
								ref={ groRaiRef }

								className='picker-groups'

								aria-label='Filter pickers by group'
								role='tablist'
							>{ /* What: Group Rail Div Element. Why: Every distinct group plus the fixed "All" pill need a horizontally-scrolling tab list. How: This wraps the "All" pill and one pill per entry in exiGroArr. */ }


								<button
									className={ ` picker-group-pill   ${ groFilStr === 'all' ? 'is-on' : '' } ` }

									type='button'

									aria-selected={ groFilStr === 'all' }
									role='tab'

									onClick={ () => { // What: On Click Handler. Why: The All pill clears the group filter. How: This resets the filter, closes the create form, and selects the first visible picker.


										setGroFilStr( 'all' );                                                            // What: Group Filter Reset Call. Why: The All pill clears the group filter. How: This writes 'all' into groFilStr.
										setCreOpeBoo( false );                                                            // What: Create Close Call. Why: Choosing a filter or picker closes the create form. How: This resets creOpeBoo to false.
										setActPicStr( staAppObj.pickers.find( ( picCurObj ) => !picCurObj.hidden )?.id ); // What: Active Picker Reset Call. Why: The Show row should land on a real picker. How: This selects the first visible picker's id.


									} }
								>{ /* What: All Group Pill Button Element. Why: The user needs a way to clear the Group filter back to unfiltered. How: This resets groFilStr to 'all', closes the create form, and jumps to the first visible picker. */ }


									All

									<span className='picker-group-count'>{ staAppObj.pickers.filter( ( picCurObj ) => !picCurObj.hidden ).length }</span>{ /* What: Count Span Element. Why: The "All" pill needs its own total count. How: This counts every visible picker regardless of group. */ }


								</button>

								{ exiGroArr.map( ( curGroStr ) => { // What: Group Pill List Render. Why: Every existing group needs its own selectable filter pill with its own count. How: This maps exiGroArr to one button per curGroStr.


									const picCouNum = staAppObj.pickers.filter( ( picCurObj ) => picCurObj.group === curGroStr && !picCurObj.hidden ).length; // What: Picker Count Number. Why: Each group pill needs to show how many visible pickers actually belong to it. How: This counts staAppObj.pickers matching both curGroStr and visibility.



									return (


										<button
											key={ curGroStr }

											className={ ` picker-group-pill   ${ groFilStr === curGroStr ? 'is-on' : '' } ` }

											type='button'

											aria-selected={ groFilStr === curGroStr }
											role='tab'

											onClick={ () => setGroFilStr( curGroStr ) }
										>{ /* What: Group Pill Button Element. Why: Tapping a group pill should narrow the Show row down to just that group. How: This writes curGroStr into groFilStr. */ }


											{ curGroStr }{ /* What: Pill Name Expression. Why: Every group pill needs its own visible label. How: This renders curGroStr. */ }

											<span className='picker-group-count'>{ picCouNum }</span>{ /* What: Pill Count Span Element. Why: Each pill shows how many pickers it holds. How: This renders picCouNum. */ }


										</button>


									);


								}) }


							</div>


						</div>


					) }


					{ exiModArr.length > 1 && ( // What: Type Row Check. Why: A single-mode install has nothing to actually filter by. How: This renders the whole Type filter row only once more than one distinct mode exists.


						<div className='stat-filter-row'>{ /* What: Type Filter Row Div Element. Why: The "Type" label and its own pill rail sit side by side. How: This wraps stat-filter-lbl and the picker-groups--type rail. */ }


							<span className='stat-filter-lbl'>Type</span>{ /* What: Type Filter Label Span Element. Why: The rail below needs a readable label. How: This renders the literal word "Type". */ }

							<div
								ref={ typRaiRef }

								className='picker-groups picker-groups--type'

								aria-label='Filter pickers by type'
								role='tablist'
							>{ /* What: Type Rail Div Element. Why: Every distinct mode plus the fixed "All" pill need a horizontally-scrolling tab list. How: This wraps the "All" pill and one pill per entry in exiModArr. */ }


								<button
									className={ ` picker-group-pill   ${ typFilStr === 'all' ? 'is-on' : '' } ` }

									type='button'

									aria-selected={ typFilStr === 'all' }
									role='tab'

									onClick={ () => { // What: On Click Handler. Why: The All pill clears the type filter. How: This resets the filter, closes the create form, and selects the first visible picker.


										setTypFilStr( 'all' );                                                            // What: Type Filter Reset Call. Why: The All pill clears the type filter. How: This writes 'all' into typFilStr.
										setCreOpeBoo( false );                                                            // What: Create Close Call. Why: Choosing a filter or picker closes the create form. How: This resets creOpeBoo to false.
										setActPicStr( staAppObj.pickers.find( ( picCurObj ) => !picCurObj.hidden )?.id ); // What: Active Picker Reset Call. Why: The Show row should land on a real picker. How: This selects the first visible picker's id.


									} }
								>{ /* What: All Type Pill Button Element. Why: The user needs a way to clear the Type filter back to unfiltered. How: This resets typFilStr to 'all', closes the create form, and jumps to the first visible picker. */ }


									All

									<span className='picker-group-count'>{ staAppObj.pickers.filter( ( picCurObj ) => !picCurObj.hidden ).length }</span>{ /* What: Count Span Element. Why: The "All" pill needs its own total count. How: This counts every visible picker regardless of mode. */ }


								</button>

								{ exiModArr.map( ( curModStr ) => { // What: Type Pill List Render. Why: Every existing mode needs its own selectable filter pill with its own count. How: This maps exiModArr to one button per curModStr.


									const picCouNum = staAppObj.pickers.filter( ( picCurObj ) => picCurObj.mode === curModStr && !picCurObj.hidden ).length; // What: Picker Count Number. Why: Each type pill needs to show how many visible pickers actually use that mode. How: This counts staAppObj.pickers matching both curModStr and visibility.



									return (


										<button
											key={ curModStr }

											className={ ` picker-group-pill   ${ typFilStr === curModStr ? 'is-on' : '' } ` }

											type='button'

											aria-selected={ typFilStr === curModStr }
											role='tab'

											onClick={ () => setTypFilStr( curModStr ) }
										>{ /* What: Type Pill Button Element. Why: Tapping a type pill should narrow the Show row down to just that mode. How: This writes curModStr into typFilStr. */ }


											{ SED_NAM_OBJ.MOD_DEF_OBJ[ curModStr ].labStr }{ /* What: Pill Name Expression. Why: Every type pill needs its mode's visible label. How: This renders the mode's label. */ }

											<span className='picker-group-count'>{ picCouNum }</span>{ /* What: Pill Count Span Element. Why: Each pill shows how many pickers it holds. How: This renders picCouNum. */ }


										</button>


									);


								}) }


							</div>


						</div>


					) }



					<div className='stat-filter-row'>{ /* What: Show Filter Row Div Element. Why: The "Show" label and the actual per-picker tab rail sit side by side. How: This wraps stat-filter-lbl and the picker-tabs rail. */ }


						<span className='stat-filter-lbl'>Show</span>{ /* What: Show Filter Label Span Element. Why: The rail below needs a readable label. How: This renders the literal word "Show". */ }


						<div
							key={ groFilStr + '|' + typFilStr }
							ref={ tabRaiRef }

							className='picker-tabs'
						>{ /* What: Picker Tabs Div Element. Why: The Add New Picker tab plus one tab per currently-visible picker need a horizontally-scrolling rail; re-keying by the two filters together replays each tab's own stagger-in animation whenever the filtered set changes. How: This wraps the Add New Picker tab and one tab per entry in sorPicArr. */ }


							{ tutProBoo ? ( // What: Tutorials In Progress Check. Why: Distinct from disAddBoo below, this tooltip's wording ("until all tutorials are completed") would be misleading during a Replay of the Pickers page tour, which runs AFTER the checklist finishes, when tutProBoo is always false, so that case still falls through to the plain disabled button with no tooltip. How: This renders a disabled, explanatory InfTipCom instead of the real button while the guided checklist is still in progress.


								<InfTipCom
									className={ ` picker-tab   picker-tab--add   picker-tab--enter   is-tour-disabled   ${ creOpeBoo ? 'is-on' : '' } ` }

									actNamStr='Add New Picker'
									labTexStr='This button is disabled until all tutorials are completed.'
								>{ /* What: Info Tip Component. Why: A disabled add tab still needs to explain why it can't be clicked yet. How: This wraps the same visible label the real tab uses. */ }


									<span
										className='picker-tab-add-icon'

										aria-hidden='true'
									>{ /* What: Add Icon Span Element. Why: The add tab leads with a decorative plus glyph. How: This is hidden from screen readers and wraps the icon. */ }


										<IcoSvgCom
											icoNamStr='pluEle'
											sizValNum={ 16 }
										/>{ /* What: Icon Svg Component. Why: The add tab needs a recognizable "add" glyph. How: This renders the 'pluEle' icon at a fixed size. */ }


									</span>

									<span className='picker-tab-name'>Add New Picker</span>{ /* What: Tab Name Span Element. Why: The add tab needs its own visible label. How: This renders the literal text "Add New Picker". */ }


								</InfTipCom>


							) : ( // What: Add Button Branch. Why: Outside the guided checklist, the real working Add New Picker button belongs here instead. How: This renders the else branch, taken while tutProBoo is false.


								<button
									className={ ` picker-tab   picker-tab--add   picker-tab--enter   ${ creOpeBoo ? 'is-on' : '' } ` }

									style={{ animationDelay : '0ms' }}

									disabled={ disAddBoo }
									type='button'

									onClick={ () => setCreOpeBoo( true ) }
								>{ /* What: Add Picker Tab Button Element. Why: This is the real entry point into PicForCom's own create flow. How: This opens creOpeBoo, disabled only during the page tour's own intercepted step. */ }


									<span
										className='picker-tab-add-icon'

										aria-hidden='true'
									>{ /* What: Add Icon Span Element. Why: The add tab leads with a decorative plus glyph. How: This is hidden from screen readers and wraps the icon. */ }


										<IcoSvgCom
											icoNamStr='pluEle'
											sizValNum={ 16 }
										/>{ /* What: Icon Svg Component. Why: The add tab needs a recognizable "add" glyph. How: This renders the 'pluEle' icon at a fixed size. */ }


									</span>

									<span className='picker-tab-name'>Add New Picker</span>{ /* What: Tab Name Span Element. Why: The add tab needs its own visible label. How: This renders the literal text "Add New Picker". */ }


								</button>


							) }



							{ sorPicArr.map( ( curPicObj, picIndNum ) => ( // What: Picker Tab List Render. Why: Every currently-visible picker needs its own selectable tab, staggered in by its own position. How: This maps sorPicArr to one button per curPicObj.


								<button
									key={ curPicObj.id }

									className={ ` picker-tab   picker-tab--enter   ${ !creOpeBoo && curPicObj.id === actPicStr ? 'is-on' : '' } ` }

									style={{ animationDelay : ( ( picIndNum + 1 ) * 40 ) + 'ms' }}

									onClick={ () => { // What: On Click Handler. Why: Tapping a picker's tab shows that picker. How: This closes the create form and selects the picker.


										setCreOpeBoo( false );        // What: Create Close Call. Why: Choosing a filter or picker closes the create form. How: This resets creOpeBoo to false.
										setActPicStr( curPicObj.id ); // What: Active Picker Set Call. Why: This tab's picker becomes the shown one. How: This writes curPicObj.id into actPicStr.


									} }
								>{ /* What: Picker Tab Button Element. Why: Tapping a picker's own tab should select it and close the create form. How: This writes curPicObj.id into actPicStr. */ }


									<span className='picker-tab-name'>{ curPicObj.name }</span>{ /* What: Tab Name Span Element. Why: Every tab needs its own picker name. How: This renders curPicObj.name. */ }

									<span className='picker-tab-mode'>{ SED_NAM_OBJ.MOD_DEF_OBJ[ curPicObj.mode ].labStr }</span>{ /* What: Tab Mode Span Element. Why: Every tab also names its picker's mode. How: This renders the mode's label. */ }


								</button>


							)) }


						</div>


					</div>


				</div>



				<div
					key={ creOpeBoo ? '__new' : ( actPicStr || '__none' ) }

					className='tab-fade ob-picker-content'
				>{ /* What: Content Fade Div Element. Why: Switching between create/view (or between two different pickers) should play a fade transition, and React needs a stable key to treat each as a distinct mounted instance. How: This wraps whichever of PicForCom/PicVieCom currently applies. */ }


					{ creOpeBoo ? ( // What: Create Open Check. Why: The body shows either the create form or the selected picker's view. How: This picks PicForCom while creOpeBoo is on, otherwise PicVieCom.


						<PicForCom
							conObjArr={ staAppObj.conditionals || [] }
							exiGroArr={ exiGroArr }
							iniForObj={ touBusObj.preFilObj || empIniObj || null }
							iniGroStr={ groFilStr === 'all' ? '' : groFilStr }
							opeTouBoo={ opeTouBoo }

							onCanForFun={ () => { // What: On Cancel Form Handler. Why: Cancelling the create form must also drop any tour state and prefill. How: This clears the tour flag and the prefill, then runs canCreFun.


								setOpeTouBoo( false ); // What: Tour Open Clear Call. Why: The form is no longer tour-driven. How: This resets opeTouBoo to false.
								setEmpIniObj( null );  // What: Empty Prefill Clear Call. Why: A cancelled form should not reopen with the old prefill. How: This resets empIniObj to null.
								canCreFun();           // What: Cancel Create Call. Why: The rest of the cancel teardown is shared. How: This calls canCreFun.


							} }
							onCrePicFun={ ( payForObj ) => { // What: On Create Function. Why: A successful create must reconcile with whatever the guided-tour checklist expects, then land the user on the freshly-made picker. How: This dedupes an onboarding revisit by name, tags a tour-created picker for later replay matching, then advances the selection once the created id comes back.


								if ( opeTouBoo && !touBusObj.exiIdeStr && staAppObj.pickers.some( ( picCurObj ) => picCurObj.name === payForObj.name ) ) { // What: Onboarding Dedupe Guard. Why: During onboarding, a revisit must never create a second copy of the example picker; instead it should just dedupe by name and advance the tour. How: This is skipped when touBusObj.exiIdeStr is set, since that's an INTENTIONAL replay of an already-finished tutorial (see the picker tour's own Step 2 run()), where payForObj.name matching the prior picker is expected, not a same-session double-fire to guard against.


									setOpeTouBoo( false ); // What: Tour Flag Clear Call. Why: This branch is itself the tour's own completion path, so the flag must not linger. How: This resets opeTouBoo to false.

									canCreFun(); // What: Cancel Create Call. Why: The form must close exactly the same way a manual cancel would. How: This calls the shared canCreFun.

									if ( window.__emlPickerCreated ) window.__emlPickerCreated(); // What: Tour Advance Guard. Why: The tour still needs to advance past its own "create the picker" step, even though nothing new was actually created this time. How: This calls the global tour hook only if it's actually registered.



									return; // What: Early Return. Why: A genuine duplicate must not fall through into the real actions.addPicFun call below. How: This exits the handler immediately.


								}



								const newPicStr = actStoObj.addPicFun({ // What: New Picker String. Why: This is the actual created (or replayed-in-place) picker's own id. How: This calls actions.addPicFun with the payload plus the tour-driven fields above. // What: Replay Update Note. Why: A replay updates the SAME picker in place (via replaceId) instead of creating a duplicate, see store.js's own addPicFun; createdFromSample tags this run's picker either way, so a LATER replay can find it too. How: This is gated on touBusObj.preFilObj, not opeTouBoo, since this tour walks the form via a real click (opeTouBoo only ever gets set by the OTHER, dormant-auto-open prefill entry point above), so opeTouBoo is always false here. // What: Hidden Field Note. Why: While the mini-tour checklist is up, ANY picker created here (via a tutorial's own walkthrough OR the user just clicking this same real button themselves) stays out of the real list until the closing Generate step (mirrors reminders-section.jsx's own staAddFun). How: This is driven by touBusObj.shoCheBoo below.


									...payForObj, // What: Payload Spread. Why: Every field the form collected goes into the new picker. How: This spreads in payForObj.

									hidden : !!touBusObj.shoCheBoo, // What: Hidden. Why: A picker made while the tour checklist is up stays out of sight until the tour finishes. How: This is true while the bus shows the checklist.

									...( touBusObj.preFilObj ? { createdFromSample : touBusObj.samIdeStr } : {} ), // What: Sample Tag Spread. Why: A tour-prefilled picker records which sample it came from. How: This adds createdFromSample only while a prefill is active.
									...( touBusObj.exiIdeStr ? { replaceId : touBusObj.exiIdeStr } : {} )          // What: Replace Id Spread. Why: A tour replay updates its earlier picker in place instead of adding a duplicate. How: This adds replaceId only while the bus names an existing picker.


								});


								if ( opeTouBoo ) { // What: Tour Advance Guard. Why: A genuine tour-driven create (not the dedupe branch above) still needs to advance the tour once it lands. How: This clears opeTouBoo and calls the global tour hook, only while opeTouBoo was actually true.


									setOpeTouBoo( false ); // What: Tour Open Clear Call. Why: The form is no longer tour-driven. How: This resets opeTouBoo to false.

									if ( window.__emlPickerCreated ) window.__emlPickerCreated(); // What: Picker Created Guard. Why: A waiting tour needs to know the picker now exists. How: This calls the registered global callback when there is one.


								}



								setEmpIniObj( null ); // What: Empty Prefill Clear Call. Why: A consumed empty-state prefill must not linger for the next time this form opens. How: This resets empIniObj to null.


								const finAniFun = () => { // What: Finish Animation Function. Why: Both the reduced-motion and animated paths below need the same final state change. How: This closes the form and selects the freshly-created picker.


									setCreOpeBoo( false );     // What: Create Close Call. Why: A successful create closes the form. How: This resets creOpeBoo to false.
									setActPicStr( newPicStr ); // What: Active Picker Set Call. Why: The newly created picker becomes the shown one. How: This writes newPicStr into actPicStr.


								};



								if ( redMotFun() ) { finAniFun(); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion shouldn't wait through a skipped scroll animation. How: This finishes immediately and returns.



								scrTopFun(); // What: Scroll Up Call. Why: The tall form needs to still be mounted while this scroll actually plays, or there's nothing to glide past. How: This calls the shared scrTopFun while creOpeBoo is still true.

								setTimeout( finAniFun, 240 ); // What: Delayed Finish Call. Why: The form must not vanish until the scroll-up glide has had time to actually finish. How: This calls finAniFun 240ms later.


							} }
						/> // What: Picker Form Component. Why: Creating a picker uses the full two-step form. How: This is passed the prefill, the existing groups and conditionals, and the create/cancel handlers.


					) : actPicObj ? ( // What: Picker View Check. Why: With the form closed, the selected picker's own view shows, when there is one. How: This renders PicVieCom only while actPicObj exists.


						<PicVieCom
							actStoObj={ actStoObj }
							aniStyStr={ aniStyStr }
							picDatObj={ actPicObj }
							staAppObj={ staAppObj }
						/> // What: Picker View Component. Why: This is the selected picker's own run stage and pool. How: This is passed the picker plus the shared state, actions, and animation style.


					) : null }


				</div>


			</div>


		</div>


	);


}

// #endregion TabPicCom

// #endregion Components



// #region Exports

export { TabPicCom }; // What: Named Export. Why: app.jsx renders this as the Pickers tab itself. How: This exports TabPicCom by name; every other binding in this file is internal-only.

// #endregion Exports


