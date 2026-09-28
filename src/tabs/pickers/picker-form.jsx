


// #region Imports

import React from 'react'; // What: React. Why: PicForCom is built directly on React's own APIs. How: This is used directly (React.useCallback, React.useEffect, React.useRef, React.useState, React.Fragment) instead of importing individual named hooks.


import { ButBasCom    } from '../../ui/button.jsx';               // What: Button Base Component. Why: The form's step, add, save and cancel actions need consistently-styled controls. How: This is rendered for each of those actions.
import { CAD_NAM_OBJ  } from '../../core/cadence.js';             // What: Cadence. Why: This is the namespace of pure functions this file uses to normalize and edit a picker's own cadence. How: This is called for CAD_NAM_OBJ.norCadFun/enfWeeFun/locTipFun/uniWorFun throughout PicForCom.
import { CadConCom    } from '../../ui/cadence-control.jsx';      // What: Cadence Control. Why: This is the shared editor for a picker's cadence settings. How: This is rendered inside PicForCom's daily-schedule block, wired to the local cadence state.
import { CodConCom    } from '../../ui/conditional-controls.jsx'; // What: Conditional Control Component. Why: Attaching a brand-new inline conditional needs the same editor the Data tab uses. How: This is rendered inside PicForCom's conditional-attach block, wired to the local condDraft state.
import { ColDisCom    } from '../../ui/collapse.jsx';             // What: Collapse Disclosure Component. Why: Several optional sections need an animated expand/collapse instead of an abrupt show/hide. How: This wraps the add-group input, the conditional-attach block, and the daily-schedule block, each gated on its own open boolean.
import { conDraFun    } from '../../ui/conditional-controls.jsx'; // What: Conditional Draft Function. Why: Starting a new inline conditional needs a sensible starting draft shape. How: This is called whenever the user opens the Add New Conditional pill, seeded from the picker's own name.
import { emlTouObj    } from '../../state/tour-bus.js';           // What: Ease My Life Tour Object. Why: A couple of tour-driven behaviors need to read the shared tour bus's current value synchronously, not through React state. How: This is read via emlTouObj.get() when staging a new draft item's tour prefill, and written via emlTouObj.set() to clear a staged empty-state prefill.
import { EntEdiCom    } from '../../ui/entry-editor.jsx';         // What: Entry Editor Component. Why: Adding or editing a pool item reuses the exact same weight/ease editor the Today tab uses. How: This is rendered inline below the pool list, wired to either the real store actions or a local draft-item actions object.
import { IcoSvgCom    } from '../../ui/icon.jsx';                 // What: Icon Svg Component. Why: Buttons and status rows throughout this file need a small recognizable glyph. How: This is rendered wherever an icon is needed, given a name and a size.
import { InfTipCom    } from '../../ui/info-tip.jsx';             // What: Info Tip Component. Why: A disabled Create button must explain that a picker needs at least 2 items. How: This wraps that button with the requirement as its tip.
import { norConFun    } from '../../core/pickers.js';             // What: Normalize Conditional Function. Why: A new inline conditional's name must be compared against existing ones the same way the store itself normalizes them. How: This is called on the conditional draft's own name before checking it for a collision.
import { norGroFun    } from '../../core/pickers.js';             // What: Normalize Group Function. Why: A newly-typed group name must be normalized the same way the store itself normalizes group names. How: This is called on the new-group input's value to compute the picker's effective group.
import { redMotFun    } from '../../utils/motion.js';             // What: Reduce Motion Function. Why: Several exit/scroll animations must be skipped for a user who prefers reduced motion. How: This is checked before every animated scroll, exit delay, or the reel/spotlight/dissolve cycle itself.
import { SED_NAM_OBJ  } from '../../state/seed.js';               // What: Seed Namespace Object. Why: This is the canonical lookup of every picker mode's own label and hint text. How: This is read (MOD_DEF_OBJ) throughout to show the active mode's label/hint and to render the mode-choice radio list.
import { togFadFun    } from '../../ui/edge-fade.js';             // What: Toggle Fade Function. Why: Every scrolling rail in this file hides each edge fade once that edge is reached. How: This is called by each rail's own scroll and resize handlers.
import { useEmlTouFun } from '../../state/tour-bus.js';           // What: Use Ease My Life Tour Function. Why: Several behaviors here read the shared tour bus as React state. How: This is called once per component to subscribe to the picker mini-tour's nonces, the page tour's gating, and the empty-state create prefill.
import { WeeChiCom    } from '../../ui/weekday-chips.jsx';        // What: Weekday Chip Component. Why: The daily-schedule block needs a 7-day picker for which weekdays a picker may run on. How: This is rendered in PicForCom's schedule block, wired to the local daysOfWeek state.


import '../../ui/edit-guard.js'; // What: Edit Guard Import. Why: This file arms and disarms window.__editGuard, which only exists once edit-guard.js has run. How: This is imported purely for that side effect.

// #endregion Imports



/**
 * picker-form.jsx = Picker Form
 *
 * @summary
 * The two-step create form for a brand-new picker, and the Details-only editor
 * for an existing one. Step 1 (Details) covers the name, group, mode,
 * conditional and daily schedule; Step 2 (Items) builds the first pool by
 * typing item names. Editing shows only Step 1, since an existing picker's
 * items are edited in its own pool or on the Data tab. On submit it calls
 * onCrePicFun for a new picker or onSavEdiFun for an edit.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

// #region PicForCom

/**
 * PicForCom = Picker Form Component
 *
 * @summary
 * The setup view for a brand-new picker, and (via isaEdiBoo) the shared
 * Details-only editor for an existing one. Renders in the same slot a
 * selected picker's own PicVieCom would, so creating a picker reuses the
 * mental model of "this is what a picker looks like" the whole app
 * already teaches: Step 1 (Details) covers Name/Group/Mode/Conditional/
 * Daily schedule, Step 2 (Items) builds a fresh pool by typing item
 * names. Editing only ever shows Step 1, since an existing picker's own
 * items are edited via the Data tab or PicVieCom's own live pool instead.
 * On submit this calls onCrePicFun (a fresh picker, which store.js's
 * addPicFun also spins up a matching Data-tab category for) or onSavEdiFun
 * (an in-place edit via savEdiFun), depending on isaEdiBoo.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.conObjArr   - Conditional Object Array: Every existing
 *                            conditional, offered for attachment; defaults to
 *                            an empty array.
 * @param props.exiGroArr   - Existing Group Array: Every distinct group name
 *                            already in use, offered as chips.
 * @param props.iniForObj   - Initial Form Object: A prefilled starting shape
 *                            (edit values, a tour's staged sample, or an
 *                            empty-state quick-start prefill); optional.
 * @param props.iniGroStr   - Initial Group String: A group name to prefill the
 *                            picker onto, without opening the add-a-new-group
 *                            sub-form.
 * @param props.isaEdiBoo   - Is-An Edit Boolean: Switches between the create
 *                            flow (both steps, onCrePicFun) and the edit flow
 *                            (Step 1 only, onSavEdiFun); defaults to undefined
 *                            (falsy).
 * @param props.onCanForFun - On Cancel Form Function: Called when the user
 *                            backs out without creating/saving anything.
 * @param props.onCrePicFun - On Create Picker Function: Called with the
 *                            finished payload when a new picker is submitted
 *                            (isaEdiBoo false).
 * @param props.onSavEdiFun - On Save Edit Function: Called with the finished
 *                            payload when an edit is submitted (isaEdiBoo
 *                            true).
 * @param props.opeTouBoo   - Open Tour Boolean: Marks this instance as opened
 *                            by a guided tour, so advSteFun skips its own
 *                            scroll-to-top (a tour step's own highlight target
 *                            can sit further down this same Items sub-step);
 *                            defaults to undefined (falsy).
 *
 * @returns The form's own current step (Details or Items), or, while
 * isaEdiBoo is true, only ever the Details step.
 *
 * @example
 * ```tsx
 * PicForCom({ conObjArr, exiGroArr, iniForObj, ... }) // => <PicForCom />
 * ```
 *
*/

function PicForCom ( { conObjArr = [], exiGroArr, iniForObj, iniGroStr, isaEdiBoo, onCanForFun, onCrePicFun, onSavEdiFun, opeTouBoo } ) {


	// #region Form Step And Name

	const touBusObj = useEmlTouFun();       // What: Tour Bus Object. Why: advSteFun needs to know whether a guided tour (of any kind) is currently driving the page, so it can skip its own scroll-to-top when a picker mini-tour is mid-flight. How: This subscribes to the shared tour event bus.
	const namInpRef = React.useRef( null ); // What: Name Input Reference. Why: The focus effect right below needs a handle on the real input DOM node. How: This is attached to the name input's own ref prop, below.

	const [ forSteNum, setForSteNum ] = React.useState( ( iniForObj && iniForObj.step ) || 1 );  // What: Form Step Number And Setter. Why: This is the whole form's own current sub-step (1 Details, 2 Items). How: This starts from a prefilled step (a tour resuming mid-form) or 1.
	const [ newNamStr, setNewNamStr ] = React.useState( ( iniForObj && iniForObj.name ) || '' ); // What: New Name String And Setter. Why: This is the picker's own live-typed name field. How: This starts from a prefilled name, or empty.


	React.useEffect( () => { // What: Focus Name Effect. Why: Arriving from Today's empty-state card should land the cursor directly in the name field, ready to type. How: This focuses and selects the name input, once, only when iniForObj explicitly asks for it.


		if ( iniForObj && iniForObj.focusName && namInpRef.current ) { // What: Focus Request Guard. Why: Only an explicit focusName request should steal focus on mount. How: This checks both that a prefill exists and that it actually asked for focus.


			namInpRef.current.focus(); // What: Focus Call. Why: The cursor needs to land in the name field. How: This calls the native focus() on the input DOM node.

			namInpRef.current.select(); // What: Select Call. Why: A pre-filled placeholder value (if any) should be fully selected, ready to be typed over. How: This calls the native select() on the input DOM node.


		}


	}, [] ); // What: Effect Dependency Array. Why: This only ever needs to run once, on mount. How: An empty array means it never re-runs.

	// #endregion Form Step And Name



	// #region Group Mode And Daily

	const [ selGroStr, setSelGroStr ] = React.useState( iniGroStr || exiGroArr[ 0 ] || '' );                                                // What: Selected Group String And Setter. Why: This is which existing group chip is currently chosen. How: This starts from iniGroStr, or the first existing group, or empty.
	const [ addGroBoo, setAddGroBoo ] = React.useState( ( iniForObj && iniForObj.group ) ? true : exiGroArr.length === 0 );                 // What: Adding Group Boolean And Setter. Why: The inline "New Group" sub-form is its own mode, distinct from picking an existing chip. How: This starts open when a prefill explicitly stages a new group name, or when there are no existing groups to choose from at all.
	const [ newGroStr, setNewGroStr ] = React.useState( ( iniForObj && iniForObj.group ) || '' );                                           // What: New Group String And Setter. Why: This is the live-typed value of the inline "New Group" sub-form. How: This starts from a prefilled group name, or empty.
	const [ selModStr, setSelModStr ] = React.useState( ( iniForObj && iniForObj.mode ) || 'random' );                                      // What: Selected Mode String And Setter. Why: This is which picker mode is currently chosen. How: This starts from a prefilled mode, or 'random'.
	const [ incDaiBoo, setIncDaiBoo ] = React.useState( ( iniForObj && 'includeInDaily' in iniForObj ) ? iniForObj.includeInDaily : true ); // What: Include Daily Boolean And Setter. Why: Whether this picker is included when the user taps Regenerate on Today. How: This defaults on, matching existing behavior for newly-created pickers, unless editing an existing one, which prefills its own current membership.

	const daiBloRef = React.useRef( null );  // What: Daily Block Reference. Why: The reveal effect right below needs a handle on the schedule block's own DOM node. How: This is attached to the schedule block's own ref prop, below.
	const daiTogRef = React.useRef( false ); // What: Daily Toggled Reference. Why: The reveal effect below must only fire when the USER actually flipped the switch, not on an initial prefilled-true render. How: This is set true by the switch's own onClick and read (but never itself triggers a re-render) by the effect below.


	React.useEffect( () => { // What: Daily Reveal Effect. Why: Re-enabling the Daily section should bring the newly-revealed block fully into view, since it can unfurl below the fold. How: This waits for the ColDisCom unfurl to finish, then scrolls the shared .main container just enough to bring the block fully into view.


		if ( !incDaiBoo || !daiTogRef.current ) return; // What: Not User-Toggled Guard. Why: Only a genuine user toggle-on should trigger this scroll, not a prefilled initial value. How: This bails out unless both incDaiBoo is true and daiTogRef.current is true.



		const scrTimNum = setTimeout( () => { // What: Scroll Timeout Number. Why: The block must be measured only after ColDisCom's own unfurl animation has actually finished expanding it to full height. How: This waits redMotFun() ? 0 : 320ms before measuring and scrolling.


			const daiBloEle = daiBloRef.current;                                                        // What: Daily Block Element. Why: The scroll calculation needs the actual DOM node. How: This reads daiBloRef.current once and reuses it below.
			const scrConEle = daiBloEle && daiBloEle.closest( '[data-element-name-hook="appConMai"]' ); // What: Scroll Container Element. Why: The shared scrollable container is what actually needs to move. How: This walks up from daiBloEle to the nearest .main ancestor.


			if ( !daiBloEle || !scrConEle ) return; // What: Missing Element Guard. Why: Either element may not exist yet if this fires after an unrelated unmount. How: This bails out of the scroll calculation entirely when either is missing.



			const oveBelNum = daiBloEle.getBoundingClientRect().bottom - scrConEle.getBoundingClientRect().bottom + 96; // What: Overflow Below Number. Why: This is how far below the visible fold the block actually sits, plus a small comfort margin. How: This subtracts the container's own bottom edge from the block's own bottom edge.


			if ( oveBelNum > 0 ) scrConEle.scrollTo({ // What: Scroll Adjust Guard. Why: Only an actually-overflowing block needs to be scrolled into view at all. How: This scrolls the container down by exactly the overflow amount.


				behavior : redMotFun() ? 'auto' : 'smooth', // What: Behavior. Why: A user who prefers reduced motion gets an instant jump instead of a glide. How: This picks 'auto' under reduced motion, otherwise 'smooth'.
				top      : scrConEle.scrollTop + oveBelNum  // What: Top. Why: The page scrolls just enough to reveal the editor's bottom edge. How: This adds oveBelNum to the current scroll.


			});


		}, redMotFun() ? 0 : 320 ); // What: Reveal Delay. Why: The scroll should wait for the Daily section's own expand animation, except under reduced motion. How: This waits 320ms, or 0 under reduced motion.



		return () => clearTimeout( scrTimNum ); // What: Effect Cleanup Return. Why: A stale scroll must not fire after this effect re-runs or unmounts. How: This cancels the scheduled scrTimNum timeout.


	}, [ incDaiBoo ] ); // What: Effect Dependency Array. Why: This only needs re-evaluating when the Daily toggle itself changes. How: incDaiBoo is the sole value this effect's own guard checks.

	// #endregion Group Mode And Daily



	// #region Schedule Options

	const [ runDowArr, setRunDowArr ] = React.useState( ( iniForObj && iniForObj.daysOfWeek ) || [ 0, 1, 2, 3, 4, 5, 6 ] ); // What: Run Dow Array And Setter. Why: When included, an optional schedule of which weekdays the picker may run on. How: This defaults to every day, unless a prefill (e.g. a picker mini-tour's sample data) specifies otherwise.
	const [ skiHolBoo, setSkiHolBoo ] = React.useState( ( iniForObj && iniForObj.skipHolidays ) || false );                 // What: Skip Holidays Boolean And Setter. Why: Whether this picker sits out major U.S. holidays. How: This starts from a prefilled value, or false.
	const [ avoDupBoo, setAvoDupBoo ] = React.useState( ( iniForObj && iniForObj.avoidDuplicates ) || false );              // What: Avoid Duplicates Boolean And Setter. Why: Excludes an item from this picker's own pool for the day if its name (case-insensitive) is already present elsewhere on today's list, for pickers that intentionally share items with another picker and don't want the same one to surface twice. How: This defaults off, since most pickers don't share a pool with anything else, so this should stay opt-in.
	const [ cadCurObj, setCadCurObj ] = React.useState( () => CAD_NAM_OBJ.norCadFun( iniForObj || {} ) );                   // What: Cadence Current Object And Setter. Why: How often this picker surfaces, plus its anchor. How: This defaults to daily, unless editing an existing picker (which prefills its current cadence): CAD_NAM_OBJ.norCadFun's accepted shape matches the same fields addPicFun/savEdiFun read off iniForObj here, so passing it straight through picks up any of them that are present and falls back to daily defaults for the rest.

	const locDowNum = cadCurObj.cadence === 'weekly' ? cadCurObj.anchorDow : null;                      // What: Locked Dow Number. Why: Weekly cadence pins its anchor day ON in the Days control (and blocks the presets from dropping it), so the two controls can't contradict each other. How: This is the anchor day while weekly, otherwise null.
	const witLocFun = ( dayInpArr ) => CAD_NAM_OBJ.enfWeeFun({ ...cadCurObj, daysOfWeek : dayInpArr }); // What: With Locked Function. Why: Every preset button below needs to apply the same locked-day enforcement the effect below already applies to manual edits. How: This calls the shared CAD_NAM_OBJ helper with the candidate days merged into the current cadence.


	React.useEffect( () => { // What: Enforce Weekly Day Effect. Why: A cadence change (e.g. switching into weekly, or changing which day is anchored) must also keep runDowArr consistent with the new anchor. How: This re-applies CAD_NAM_OBJ.enfWeeFun whenever the cadence or its anchor day changes.


		setRunDowArr( ( curDayArr ) => { // What: Days Reconcile Call. Why: Only a genuinely different result should trigger a re-render. How: This computes the enforced days and returns the previous array unchanged if nothing actually changed.


			const nexDayArr = CAD_NAM_OBJ.enfWeeFun({ ...cadCurObj, daysOfWeek : curDayArr }); // What: Next Day Array. Why: This is the actual enforced result to compare against. How: This calls the shared CAD_NAM_OBJ helper with the current days.



			return nexDayArr.length === curDayArr.length ? curDayArr : nexDayArr; // What: Unchanged Guard Return. Why: Returning the SAME array reference when nothing changed avoids a pointless extra render. How: This compares lengths as a cheap proxy for "did enforcement actually add the missing anchor day".


		});


	}, [ cadCurObj.cadence, cadCurObj.anchorDow ] ); // What: Effect Dependency Array. Why: Only these two fields of cadCurObj can ever change which day must be locked on. How: cadCurObj.cadence decides whether locking applies at all, and cadCurObj.anchorDow decides which day.

	// #endregion Schedule Options



	// #region Conditional Attachment

	const [ conAttBoo, setConAttBoo ] = React.useState( !!( iniForObj && iniForObj.conditionalId ) );       // What: Conditional Attach Boolean And Setter. Why: An optional conditional gate; when on, the user attaches an existing conditional or creates a fresh inline one. How: This starts on only when editing an existing picker that already has one attached.
	const [ conSelStr, setConSelStr ] = React.useState( ( iniForObj && iniForObj.conditionalId ) || null ); // What: Conditional Selected String And Setter. Why: This holds which conditional is chosen: an existing id, the literal 'new', or null. How: This starts from a prefilled conditionalId, or null.
	const [ conDraObj, setConDraObj ] = React.useState( () => conDraFun( '' ) );                            // What: Conditional Draft Object And Setter. Why: Creating a fresh inline conditional needs its own draft shape to edit. How: This starts from the shared default, seeded with an empty name until the user actually opens the "Add New Conditional" pill.

	const conTidStr = norConFun( conDraObj.name ) || ''; // What: Conditional Tidy String. Why: Create-new requires a UNIQUE name; normalizing first, then comparing against existing conditionals (which are stored normalized), is what actually detects a real collision, not just a surface-level text match. How: This runs conDraObj's own name through the shared normalizer.


	const conColBoo = conAttBoo && conSelStr === 'new' && conObjArr.some( ( conCurObj ) => ( conCurObj.name || '' ).toLowerCase() === conTidStr.toLowerCase() ); // What: Conditional Collides Boolean. Why: Reuse is the deliberate act of tapping an existing pill, not a silent name match, so only the create-new path can ever collide. How: This checks conTidStr against every existing conditional's own name, case-insensitively.


	const conErrStr = conColBoo // What: Conditional Error String. Why: The name field needs a concrete, actionable message once a collision is actually detected. How: This names the colliding conditional directly and suggests reusing it instead.
		? `A conditional named “${ conTidStr }” already exists. Choose a different name, or select it from the list above to reuse it.` // What: Collision Message Branch. Why: A colliding name needs a concrete, actionable message. How: This names the colliding conditional and suggests reusing it.
		: null; // What: No Collision Branch. Why: A unique name has no error. How: This returns null.


	const raiCleRef = React.useRef( null ); // What: Rail Cleanup Reference. Why: The edge-fade cue on the conditional rail (matching the app's other horizontal rails) needs its own teardown function remembered across callback-ref re-invocations. How: This holds whatever cleanup function raiCalFun most recently registered, run and cleared at the top of every subsequent call.
	const raiNodRef = React.useRef( null ); // What: Rail Node Reference. Why: The scroll-to-start effect below needs to read back the same DOM node raiCalFun most recently attached to. How: This mirrors whatever element is currently mounted, or null while the rail itself isn't rendered.


	// #region raiCalFun

	/**
	 * raiCalFun = Rail Callback Function
	 *
	 * @summary
	 * The callback ref for the create form's conditional pill rail. ColDisCom
	 * mounts the rail a render after the conditional toggle turns on, so a plain
	 * effect would run while the ref is still empty; this ref runs exactly when
	 * the node attaches. Every call first tears down the previous attachment's
	 * listeners, records the new node in raiNodRef, and wires the rail's
	 * edge-fade classes to its own scroll and a ResizeObserver.
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
	 * raiCalFun( raiCurEle ) // => void
	 * ```
	 *
	*/

	const raiCalFun = React.useCallback( ( raiCurEle ) => { // What: Rail Callback Function. Why: ColDisCom (below) mounts this rail one render AFTER conAttBoo flips true (it stages its own `render` state first), so a plain useEffect keyed on conAttBoo would fire while the ref is still null and never get another chance to run once the rail actually appears; a callback ref, which fires exactly when the DOM node attaches, plus a ResizeObserver, which re-fires whenever conditionals are added/removed and the rail's content width changes, sidesteps that race entirely. How: This registers a scroll listener and a ResizeObserver on whatever element the rail's own ref prop attaches to below, tearing down the previous ones first.


		if ( raiCleRef.current ) { // What: Previous Cleanup Guard. Why: A remount (or unmount) must not leave the prior element's own listeners dangling. How: This runs and clears whatever teardown function was registered for the previous element, if any.


			raiCleRef.current();      // What: Previous Cleanup Call. Why: The old rail's listeners must not outlive it. How: This runs the stored cleanup.
			raiCleRef.current = null; // What: Cleanup Clear. Why: The stored cleanup has run and must not run again. How: This resets raiCleRef to null.


		}



		raiNodRef.current = raiCurEle; // What: Node Mirror Write. Why: The scroll-to-start effect below needs to read back the current node outside of this callback's own closure. How: This mirrors raiCurEle into raiNodRef.current.



		if ( !raiCurEle ) return; // What: Unmount Guard. Why: A null element means the rail just unmounted, with nothing left to observe. How: This bails out before registering anything.



		const updRaiFun = () => togFadFun( raiCurEle ); // What: Update Rail Function. Why: The at-start/at-end edge-fade classes need recomputing every time the rail scrolls or resizes. How: This calls togFadFun on raiCurEle.


		updRaiFun(); // What: Initial Update Call. Why: The classes need to be correct immediately on mount, without waiting for a scroll or resize event. How: This invokes updRaiFun once, synchronously.

		raiCurEle.addEventListener( 'scroll', updRaiFun, { passive : true } ); // What: Scroll Listener Call. Why: The classes must stay correct as the user actually scrolls the rail. How: This re-runs updRaiFun on every scroll event.


		const resObsObj = new ResizeObserver( updRaiFun ); // What: Resize Observer Object. Why: Adding or removing a conditional pill can change the rail's own scrollable width without the rail itself scrolling. How: This re-runs updRaiFun whenever the observed element's size changes.


		resObsObj.observe( raiCurEle ); // What: Resize Observer Start Call. Why: The observer above does nothing until it's actually told what to watch. How: This starts watching raiCurEle for size changes.

		raiCleRef.current = () => { // What: Cleanup Registration. Why: The next callback-ref invocation (a remount or unmount) needs a teardown function ready to run. How: This stores a closure removing the scroll listener and disconnecting the observer.


			raiCurEle.removeEventListener( 'scroll', updRaiFun ); // What: Scroll Unsubscribe Call. Why: The listener must not outlive this rail. How: This removes updRaiFun from raiCurEle.
			resObsObj.disconnect();                               // What: Observer Disconnect Call. Why: The observer must not outlive this rail either. How: This disconnects resObsObj.


		};


	}, [] ); // What: Effect Dependency Array. Why: This callback ref never needs to change identity; the element it receives is a normal parameter, not a dependency. How: An empty array means React never has to detach and reattach it across renders.

	// #endregion raiCalFun


	React.useEffect( () => { // What: Scroll To Start Effect. Why: Selecting a conditional pins it to the front of the rail (see the sort in the render below), so the rail should scroll back to the start to bring it into view, same idea as the Data tab's own attached-conditional pin. How: This scrolls raiNodRef's own current element back to its start whenever conSelStr changes to a real, non-'new' selection.


		const raiCurEle = raiNodRef.current; // What: Rail Current Element. Why: The scroll call below needs the actual live DOM node. How: This reads raiNodRef.current once.

		const notRaiBoo = !raiCurEle;          // What: Not Rail Boolean. Why: An unmounted rail has nothing to scroll. How: This negates raiCurEle.
		const notSelBoo = conSelStr == null;   // What: Not Selected Boolean. Why: With nothing selected there's no pill to scroll to. How: This checks conSelStr is null or undefined.
		const newSelBoo = conSelStr === 'new'; // What: New Selected Boolean. Why: The 'new' pill already sits at the rail's start. How: This checks conSelStr is 'new'.

		const skiScrBoo = notRaiBoo || notSelBoo || newSelBoo; // What: Skip Scroll Boolean. Why: Any one of these means there's no real selection to scroll to. How: This ORs the 3 checks above.


		if ( skiScrBoo ) return; // What: No Real Selection Guard. Why: Only picking a REAL existing conditional should trigger this scroll; neither an unmounted rail nor the 'new' pill (which has nothing to scroll to) should. How: This bails out unless a real element exists and conSelStr is a genuine id.



		if ( raiCurEle.scrollLeft > 1 ) raiCurEle.scrollTo({ // What: Scroll Adjust Guard. Why: A rail that's already at its start needs no animation at all. How: This scrolls back to the start only when it's actually scrolled away from it.


			behavior : redMotFun() ? 'auto' : 'smooth', // What: Behavior. Why: A user who prefers reduced motion gets an instant jump instead of a glide. How: This picks 'auto' under reduced motion, otherwise 'smooth'.
			left     : 0                                // What: Left. Why: The rail's start is its left edge. How: This scrolls to x 0.


		});


	}, [ conSelStr ] ); // What: Effect Dependency Array. Why: Only a genuine change to which conditional is selected should trigger this scroll. How: conSelStr is the sole value this effect's own guard checks.

	// #endregion Conditional Attachment



	// #region Item Pool And Step Advance

	const [ pooIteArr, setPooIteArr ] = React.useState( ( iniForObj && iniForObj.items ) || [] ); // What: Pool Item Array And Setter. Why: Step 2's own pool; each item is { name, weight }, weight only mattering for weighted/dynamic modes and only editable inline then. How: This is a fresh pool (Option B, not a pick-from-library), starting from a prefilled items list, or empty; other defaults (drift value, ease knobs) are applied at commit time.

	const forWraRef = React.useRef( null ); // What: Form Wrap Reference. Why: advSteFun needs a handle on this form's own root so it can walk up to whichever ancestor actually scrolls. How: This is attached to the form's own root div, below.


	const advSteFun = () => { // What: Advance Step Function. Why: Moving to Step 2 from the bottom-of-form button leaves the user scrolled down; the form's own scroll container should be pulled back to the top so the add-item field is in view without a manual scroll. How: This is skipped while a guided tour is active, since a picker mini-tour's own next step highlights something further down this same Items sub-step, and this scroll-to-top fought that positioning.


		setForSteNum( 2 ); // What: Step Advance Call. Why: This is the actual step transition. How: This writes 2 into forSteNum.



		if ( touBusObj.touPhaStr === 'tour' ) return; // What: Tour Active Guard. Why: A running tour's own positioning must not be fought by this scroll-to-top. How: This bails out before scheduling any scroll at all.



		requestAnimationFrame( () => { // What: Scroll To Top Call. Why: The add-item field should be visible without a manual scroll. How: This walks up from forWraRef looking for the nearest genuinely-scrollable ancestor, falling back to the shared .main container.


			let curWalEle = forWraRef.current; // What: Current Walk Element. Why: The loop below needs a mutable pointer to walk up the DOM tree with. How: This starts at the form's own root and is reassigned to each ancestor in turn.


			while ( curWalEle && curWalEle !== document.body ) { // What: Ancestor Walk Loop. Why: The nearest ACTUALLY-scrollable ancestor (not just any parent) is what needs scrolling. How: This checks each ancestor's own computed overflow-y and real scroll height before deciding it's the one.


				const oveStyStr = getComputedStyle( curWalEle ).overflowY; // What: Overflow Style String. Why: Only an ancestor whose own CSS actually allows scrolling is a real candidate. How: This reads the computed overflowY value for curWalEle.


				if ( ( oveStyStr === 'auto' || oveStyStr === 'scroll' ) && curWalEle.scrollHeight > curWalEle.clientHeight ) { // What: Scrollable Ancestor Found Guard. Why: The first genuinely-scrollable ancestor found is the one that actually needs resetting. How: This scrolls it to the top and returns immediately, skipping every further ancestor.


					curWalEle.scrollTo({ // What: Ancestor Scroll Call. Why: This is the actual reset of the found ancestor. How: This scrolls curWalEle to its top.


						behavior : redMotFun() ? 'auto' : 'smooth', // What: Behavior. Why: A user who prefers reduced motion gets an instant jump instead of a glide. How: This picks 'auto' under reduced motion, otherwise 'smooth'.
						top      : 0                                // What: Top. Why: The form's start is the top of the page. How: This scrolls to y 0.


					});



					return; // What: Early Return. Why: The nearest scrollable ancestor was handled, so no fallback is needed. How: This exits the frame callback.


				}



				curWalEle = curWalEle.parentElement; // What: Walk Advance. Why: No scrollable ancestor was found yet, so the search continues one level up. How: This reassigns curWalEle to its own parent.


			}


			const scrConEle = document.querySelector( '[data-element-name-hook="appConMai"]' ); // What: Scroll Container Element. Why: No scrollable ancestor was found in the walk above, so the shared app-wide scroller is the fallback target. How: This queries for the .main element directly.


			if ( scrConEle ) { // What: Fallback Scroll Guard. Why: Only a genuinely-found fallback container should be scrolled. How: This scrolls .main to the top if it exists.


				scrConEle.scrollTo({ // What: Fallback Scroll Call. Why: This is the actual reset of the main container. How: This scrolls scrConEle to its top.


					behavior : redMotFun() ? 'auto' : 'smooth', // What: Behavior. Why: A user who prefers reduced motion gets an instant jump instead of a glide. How: This picks 'auto' under reduced motion, otherwise 'smooth'.
					top      : 0                                // What: Top. Why: The form's start is the top of the page. How: This scrolls to y 0.


				});


			}


		});


	};

	// #endregion Item Pool And Step Advance



	// #region Mode Derivations

	const effGroStr = addGroBoo ? norGroFun( newGroStr, exiGroArr ) : selGroStr; // What: Effective Group String. Why: The picker's own real group is whichever of the two group controls (existing chip or new-group input) is currently active. How: This normalizes newGroStr when addGroBoo is on, otherwise it's just selGroStr directly.
	const detReaBoo = !!( newNamStr.trim() && effGroStr && selModStr );          // What: Details Ready Boolean. Why: Both steps' own footer buttons need to know whether Step 1's own required fields are actually complete. How: This requires a non-blank trimmed name, a real effective group, and a chosen mode.
	const shoWeiBoo = selModStr === 'weighted' || selModStr === 'dynamic';       // What: Show Weight Boolean. Why: Weight is a lever only for these two modes; random/ease-* ignore it entirely, so the control stays hidden elsewhere to avoid asking for something irrelevant. How: This gates the weight column throughout Step 2.
	const isaEasBoo = selModStr === 'ease-up' || selModStr === 'ease-down';      // What: Is-An Ease Boolean. Why: Only these two modes use the easeMin/easeMax drift band at all. How: This gates the ease controls throughout Step 2.

	const easThrNum = 100;                           // What: Ease Threshold Number. Why: This is the fixed 0-100 scale every item's own drift value moves across. How: This is used throughout the conversion helpers right below. // What: Ease Cadence Design Note. Why: Ease cadence is PER-ITEM, since a fridge-clean and a counter-wipe want different rhythms; each item carries its own drift band { easeMin, easeMax }. How: Two human questions are asked per item and converted: soonest days (least time before it CAN come up) -> easeMax = 100/soonest; latest days (most time before it MUST come up) -> easeMin = 100/latest. The engine moves an item across the 0-100 threshold by random(easeMin, easeMax) each daily run, so maturing fastest (every roll = easeMax) takes 100/easeMax days = the soonest, and slowest (every roll = easeMin) takes 100/easeMin days = the latest; the gap between the two answers IS the randomness. One picker-level toggle (easManBoo below) flips ALL rows to raw drift inputs for power users. Drift values are the source of truth on each item.
	const defEasObj = { easeMax : 14, easeMin : 7 }; // What: Default Ease Object. Why: A freshly-added item needs a sensible starting drift band before the user tunes it. How: This seeds addDraFun's own new-item shape below. // What: Default Band Note. Why: The raw numbers are easier to picture as days. How: This band works out to roughly a 7-day soonest and a 14-day latest.

	const covSooFun = ( easMaxNum ) => Math.max( 1, Math.round( easThrNum / ( easMaxNum || 1 ) ) ); // What: Convert Soonest Function. Why: The soonest-days question is really just easThrNum divided by an item's own easeMax, floored at 1 day. How: This rounds the division and clamps it to at least 1.
	const covLatFun = ( easMinNum ) => Math.max( 1, Math.round( easThrNum / ( easMinNum || 1 ) ) ); // What: Convert Latest Function. Why: The latest-days question is really just easThrNum divided by an item's own easeMin, floored at 1 day. How: This rounds the division and clamps it to at least 1.

	const capStrFun = ( souTexStr ) => souTexStr.length ? souTexStr[ 0 ].toUpperCase() + souTexStr.slice( 1 ) : souTexStr; // What: Capitalize String Function. Why: Every item/picker name this form commits should read with a capitalized first letter, regardless of how the user actually typed it. How: This upper-cases just the first character and leaves the rest untouched.

	// #endregion Mode Derivations



	// #region Draft Item Editing

	const [ actNewStr, setActNewStr ] = React.useState( null );  // What: Active New String And Setter. Why: This holds the id of whichever draft item is currently being newly added (as opposed to an already-committed row being edited). How: This is set by addDraFun and cleared once its own closing animation finishes. // What: Reused Item Editor Design Note. Why: This is the same UI as the live Pickers-tab add flow; draft items carry a stable id so the shared EntEdiCom plus a synthetic actions object (backed by the draft array, not the store) can key off it. How: Adding opens the editor inline at the bottom; Save/Cancel play the same fade animations as the live flow.
	const [ actCloStr, setActCloStr ] = React.useState( false ); // What: Active Closing String And Setter. Why: The new-item draft's own editor needs to play a closing animation before it's actually torn down. How: This holds 'save', 'cancel', or false, consumed by the draft wrap's own onAnimationEnd handler below. // What: Closing Values Note. Why: The close reason decides whether the draft is kept. How: It is false while open, otherwise 'save' or 'cancel'.
	const [ insDraStr, setInsDraStr ] = React.useState( null );  // What: Insert Draft String And Setter. Why: A freshly-committed pool row needs its own insert animation, keyed to its own id. How: This is set once a new-item draft's own closing animation reports 'save'.
	const [ conDelStr, setConDelStr ] = React.useState( null );  // What: Confirm Delete String And Setter. Why: Deleting a pool item asks for confirmation inline. How: This holds the id currently showing its own delete-confirm row.
	const [ conLeaStr, setConLeaStr ] = React.useState( null );  // What: Confirm Leaving String And Setter. Why: Cancelling a delete confirmation needs its own out-animation before the row reverts to normal. How: This holds the id currently playing that leaving animation, cleared once it finishes.


	// #region canConFun

	/**
	 * canConFun = Cancel Confirm Function
	 *
	 * @summary
	 * Backs out of a pending item delete. Under reduced motion it clears the
	 * confirm state at once; otherwise it flags the confirm row as leaving so it
	 * plays its exit animation, then clears both 150ms later.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * canConFun() // => void
	 * ```
	 *
	*/

	const canConFun = () => { // What: Cancel Confirm Function. Why: Cancelling a pending delete needs to play the same leaving animation as everywhere else in this file, unless reduced motion applies. How: This either clears conDelStr immediately, or stages conLeaStr for 150ms first.


		if ( redMotFun() ) { setConDelStr( null ); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion shouldn't wait through a skipped animation. How: This clears the confirm state immediately and returns.



		setConLeaStr( conDelStr ); // What: Leaving Stage Call. Why: The confirm row needs to actually play its own out-animation now. How: This copies the current conDelStr into conLeaStr.

		setTimeout( () => { // What: Delayed Clear Call. Why: The confirm row must not fully disappear until its own out-animation has had time to actually play. How: This clears both conLeaStr and conDelStr 150ms later.


			setConLeaStr( null ); // What: Leaving Clear Call. Why: The confirm row has finished its exit animation. How: This resets conLeaStr to null.
			setConDelStr( null ); // What: Confirm Clear Call. Why: No row stays in its delete-confirm state. How: This resets conDelStr to null.


		}, 150 ); // What: Leaving Animation Delay. Why: The confirm row must finish leaving before it clears. How: This 150ms matches the leaving animation's duration.


	};

	// #endregion canConFun


	const [ rmvIdeStr, setRmvIdeStr ] = React.useState( null ); // What: Removing Identifier String And Setter. Why: A deleted pool row needs its own removal animation to finish before it's actually taken out of pooIteArr. How: This holds the id currently playing that removal animation.

	const addWraRef = React.useRef( null ); // What: Add Wrap Reference. Why: Both the new-item and edit-item flows render into this same below-the-list slot, which needs a stable handle so it can be scrolled into view. How: This is attached to the .pv-additem-wrap div's own ref prop, below.

	const [ ediIteStr, setEdiIteStr ] = React.useState( null );  // What: Editing Item String And Setter. Why: Editing an already-added draft item mirrors the live Pickers tab's own ediIteStr/opeEdiFun/staEdiFun exactly (see PicVieCom above), just bound to pooIteArr + draActObj instead of the real store. How: This holds the id of whichever committed draft item currently has its editor open, or null.
	const [ ediCloBoo, setEdiCloBoo ] = React.useState( false ); // What: Editing Closing Boolean And Setter. Why: Closing a committed draft item's editor needs its own out-animation before it's actually torn down. How: This is flipped true to start that animation.

	const penEdiRef = React.useRef( null );                                                   // What: Pending Edit Reference. Why: Switching straight from the new-item form (or a different item's editor) into this one must not silently drop the request. How: This holds the target id to reopen once whatever's currently closing finishes.
	const ediSnaRef = React.useRef( null );                                                   // What: Editing Snapshot Reference. Why: Switching directly between two draft items' editors needs an explicit revert, for the exact same reason PicVieCom's own ediSnaRef does (EntEdiCom's own unmount-triggered revert would be disarmed by the very next EntEdiCom's mount effect before it ever fires). How: This holds a snapshot of whichever draft item opeDraFun last opened.
	const comCouNum = pooIteArr.filter( ( iteCurObj ) => iteCurObj.id !== actNewStr ).length; // What: Committed Count Number. Why: The count and the Create button must not react early to a row still being edited, so its own Save hasn't landed yet. How: This is deliberately computed AFTER actNewStr's own declaration above; referencing it earlier in the body would (since this project targets Vite, not a var-hoisting build) read as undefined and this filter would exclude nothing.
	const enoIteBoo = comCouNum >= 2;                                                         // What: Enough Item Boolean. Why: A picker must have at least 2 real, committed items before it can be created. How: This is true once comCouNum reaches 2.


	const draActObj = { // What: Draft Actions Object. Why: EntEdiCom expects a real actions-shaped object to call as the user edits a draft pool item, but pooIteArr isn't the real store. How: Every method below mirrors the real store action's own name and signature, but writes into pooIteArr instead of dispatching a real store update.


		delIteFun : ( tarIdeStr ) => setPooIteArr( ( preIteArr ) => preIteArr.filter( ( iteCurObj ) => iteCurObj.id !== tarIdeStr ) ),                                                            // What: Delete Item Function. Why: EntEdiCom's own footer Delete button (hidden here via CSS, same as the live flow) still expects this method to exist. How: This filters the matching entry out entirely.
		renIteFun : ( tarIdeStr, newNamStr ) => setPooIteArr( ( preIteArr ) => preIteArr.map( ( iteCurObj ) => iteCurObj.id === tarIdeStr ? { ...iteCurObj, name : newNamStr } : iteCurObj ) ),   // What: Rename Item Function. Why: The name input's own onBlur calls this exactly like the real store action. How: This overwrites just the name field on the matching entry.
		revIteFun : ( tarIdeStr, snaIteObj ) => setPooIteArr( ( preIteArr ) => preIteArr.map( ( iteCurObj ) => iteCurObj.id === tarIdeStr ? snaIteObj : iteCurObj ) ),                            // What: Revert Item Function. Why: EntEdiCom's own Cancel/Escape handling calls this to revert to a prior snapshot. How: This replaces the matching entry wholesale with snaIteObj.
		setWeiFun : ( tarIdeStr, weiValNum ) => setPooIteArr( ( preIteArr ) => preIteArr.map( ( iteCurObj ) => iteCurObj.id === tarIdeStr ? { ...iteCurObj, weight : weiValNum } : iteCurObj ) ), // What: Set Weight Function. Why: EntEdiCom's own weight stepper calls this exactly like the real store action. How: This overwrites just the weight field on the matching entry.
		updIteFun : ( tarIdeStr, patIteObj ) => setPooIteArr( ( preIteArr ) => preIteArr.map( ( iteCurObj ) => iteCurObj.id === tarIdeStr ? { ...iteCurObj, ...patIteObj } : iteCurObj ) ),       // What: Update Item Function. Why: EntEdiCom calls this exactly like the real store action to apply a field patch. How: This merges patIteObj into whichever pooIteArr entry matches tarIdeStr.

		togVacFun : ( tarIdeStr ) => setPooIteArr( ( preIteArr ) => preIteArr.map( ( iteCurObj ) => iteCurObj.id === tarIdeStr ? { // What: Toggle Vacation Function. Why: EntEdiCom's own Active switch calls this exactly like the real store action. How: This flips just the vacation field on the matching entry.


			...iteCurObj, // What: Current Item Spread. Why: Every other field stays as it was. How: This copies iteCurObj.

			vacation : !iteCurObj.vacation // What: Vacation. Why: This is the flag being toggled. How: This inverts the item's current vacation value.


		} : iteCurObj ) ) // What: Unchanged Item Fallback. Why: Every other item keeps its own vacation flag. How: This returns iteCurObj unchanged.


	};


	const draPicObj = { cadence : cadCurObj.cadence, mode : selModStr, threshold : easThrNum }; // What: Draft Picker Object. Why: EntEdiCom still expects a picker-shaped object to read mode/threshold/cadence off of, even though the real picker doesn't exist yet. How: No `id` -- deliberately, since draft items carry no pickerId either (both undefined), so EntEdiCom's own PIC_NAM_OBJ.aveEasFun(items, picDatObj.id) fallback still matches every draft item against this pseudo-picker's undefined id and averages them correctly, not a coincidence to "fix" by inventing ids here. No easeMin/easeMax here either, since EntEdiCom no longer reads those off the picker directly.


	// #region addDraFun

	/**
	 * addDraFun = Add Draft Function
	 *
	 * @summary
	 * Opens a brand-new draft item in the create form's items step. It does
	 * nothing while another editor is open; otherwise it creates a draft with a
	 * fresh id and default values, applying any name and ease band a guided tour
	 * has staged, then scrolls the new slot into view.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * addDraFun() // => void
	 * ```
	 *
	*/

	const addDraFun = () => { // What: Add Draft Function. Why: Starting a brand-new draft item opens the same slot the edit flow uses, seeded with sensible defaults (including any staged tour prefill), then scrolls it into view. How: This bails out if another editor is already open, otherwise generates a fresh id, resolves the tour's own staged name/ease if one applies, then seeds and scrolls the new slot into view.


		if ( actNewStr || ediIteStr ) return; // What: One Editor Guard. Why: Only one item editor (new or existing) may be open at a time. How: This bails out if either a new draft or an existing edit is already in progress.



		setActCloStr( false ); // What: Stale Closing Clear Call. Why: A prior editor's own closing state must not carry over onto this fresh one. How: This clears any stale closing state left behind by whatever was open before.


		const newIdeStr = 'draft_' + Math.random().toString( 36 ).slice( 2, 8 ); // What: New Identifier String. Why: The new draft item needs a stable, unique-enough id before it's ever committed. How: This builds a short random suffix onto the conventional 'draft_' item-id prefix.

		const curBusObj = emlTouObj.get();                                       // What: Current Bus Object. Why: The synchronous read described above needs the bus's own live snapshot. How: This calls emlTouObj.get() directly. // What: Tour Prefill Read Note. Why: This reads straight off the bus (emlTouObj.get()), not the React-state touBusObj, since this fires as the NATIVE bubble-phase handler of the same click whose CAPTURE-phase handling just ran a picker-tour step's own run() (which sets itePreStr on the bus synchronously), but useEmlTouFun's subscriber-driven setState is batched and hasn't actually landed in this component's own render yet, so touBusObj here would still be the PREVIOUS render's snapshot, from before itePreStr was set. How: Reading the bus's own synchronous getter instead (the same fix reminders-section.jsx's own prefill already uses) is what actually lands the tour's staged name/ease on the item it creates.
		const curTouBoo = curBusObj.touPhaStr === 'tour' && curBusObj.itePreStr; // What: Current Tour Boolean. Why: Only an actively-running tour that staged a specific item name should override the generated default below. How: This checks both the bus's own phase and its itePreStr field.

		let newNamStr; // What: New Name String. Why: The actual name to seed the draft with depends on which branch below resolves it. How: This is declared here and assigned in exactly one of the two branches that follow.


		if ( curTouBoo ) { // What: Tour Name Branch. Why: A tour stages a specific name for its own walkthrough item (see the picker tour's own run()), rather than falling back to a generic default. How: This takes the staged name directly off the bus.


			newNamStr = curBusObj.itePreStr; // What: Tour Name Assign. Why: This is the actual staged value described above. How: This reads curBusObj.itePreStr.


		}

		else { // What: Generated Name Branch. Why: Outside a tour, a fresh item needs a sensible, non-colliding default name. How: This starts from "New item" and appends an incrementing number until it no longer collides with an existing name.


			const basNamStr = 'New item'; // What: Base Name String. Why: This is the starting point every generated name is built from. How: This is reused below both as the bare default and as the prefix for a numbered variant.

			let dupCouNum = 1; // What: Duplicate Count Number. Why: The loop below needs a running counter to append once the bare name collides. How: This starts at 1 and increments each time the candidate name still collides.


			newNamStr = basNamStr; // What: Candidate Name Seed. Why: The loop below needs a starting candidate to test. How: This starts as the bare basNamStr before any numbering is applied.


			const lowNamSet = new Set( pooIteArr.map( ( iteCurObj ) => iteCurObj.name.toLowerCase() ) ); // What: Lowercase Name Set. Why: The collision check must be case-insensitive. How: This lowercases every existing draft item's own name into a Set for fast lookup.


			while ( lowNamSet.has( newNamStr.toLowerCase() ) ) { // What: Collision Loop. Why: The candidate name must keep incrementing until it's genuinely unique. How: This appends the next dupCouNum onto basNamStr each time the current candidate still collides.


				dupCouNum++;                                 // What: Duplicate Count Increment. Why: Each collision tries the next number. How: This adds 1 to dupCouNum.
				newNamStr = `${ basNamStr } ${ dupCouNum }`; // What: Numbered Name Assignment. Why: A numbered suffix makes the name unique. How: This appends dupCouNum to basNamStr.


			}


		}



		const fulChaBoo = selModStr === 'ease-down' || ( curTouBoo && selModStr === 'ease-up' ); // What: Full Charge Boolean. Why: Ease Down items start fully charged (mirrors addPicFun's own initialValue), otherwise the editor would show a spent item needing a Refill it never needed; the tour's own Ease Up item is also given a full charge (like the rest of the sample pool) so the later generation demo step has something eligible to pick, but this doesn't apply to Weighted/Dynamic/Random tour samples, since those modes have no eligibility gate at all (value there is a weight boost, not a charge), so forcing 100 would just unfairly skew the new item's odds against its siblings for no reason.


		const easBanObj = curTouBoo && curBusObj.iteMinNum != null && curBusObj.iteMaxNum != null // What: Ease Band Object. Why: A tour can override the generic 7/14-day defEasObj for its own added item (e.g. a monthly-cadence sample's own item shouldn't look like a daily one). How: This uses the bus's own staged easeMin/easeMax when a tour supplied both, otherwise defEasObj.
			? { easeMax : curBusObj.iteMaxNum, easeMin : curBusObj.iteMinNum } // What: Tour Band Branch. Why: A tour can stage its own ease band for the added item. How: This uses the bus's itemEaseMin/itemEaseMax.
			: defEasObj;                                                       // What: Default Band Branch. Why: Every other add uses the generic defaults. How: This returns defEasObj.


		setPooIteArr( ( preIteArr ) => [ ...preIteArr, { // What: Seed Item Call. Why: The freshly-opened editor needs a complete, sensible item already sitting in pooIteArr to edit. How: This appends the new item with every field resolved above.


			id     : newIdeStr,                 // What: Id. Why: The pool item needs its own id. How: This uses newIdeStr.
			name   : newNamStr,                 // What: Name. Why: The item starts with its de-duplicated name. How: This uses newNamStr.
			value  : fulChaBoo ? easThrNum : 0, // What: Value. Why: An item that should start full begins at the threshold, otherwise at 0. How: This uses easThrNum when fulChaBoo, otherwise 0.
			weight : 1,                         // What: Weight. Why: Every item starts at the baseline weight. How: This is 1.

			...easBanObj // What: Ease Band Spread. Why: The item carries the tour's or the default drift band. How: This spreads in easeMin and easeMax.


		} ] );

		setActNewStr( newIdeStr ); // What: Open Editor Call. Why: This is the actual state change that shows the new-item editor. How: This writes newIdeStr into actNewStr.

		requestAnimationFrame( () => requestAnimationFrame( () => { // What: Scroll Into View Call. Why: The just-opened creation slot can be well out of view at the bottom of a long pool. How: This waits two animation frames for layout to settle, then scrolls the shared .main container just enough to bring the slot fully into view.


			const addWraEle = addWraRef.current;                                                        // What: Add Wrap Element. Why: The scroll calculation needs the actual DOM node, not just the ref object. How: This reads addWraRef.current once and reuses it below.
			const scrConEle = addWraEle && addWraEle.closest( '[data-element-name-hook="appConMai"]' ); // What: Scroll Container Element. Why: The shared scrollable container is what actually needs to move, not the slot itself. How: This walks up from addWraEle to the nearest .main ancestor.


			if ( !addWraEle || !scrConEle ) return; // What: Missing Element Guard. Why: Either element may not exist yet if this fires after an unrelated unmount. How: This bails out of the scroll calculation entirely when either is missing.



			const oveBelNum = addWraEle.getBoundingClientRect().bottom - scrConEle.getBoundingClientRect().bottom + 96; // What: Overflow Below Number. Why: This is how far below the visible fold the new slot actually sits, plus a small comfort margin. How: This subtracts the container's own bottom edge from the slot's own bottom edge.


			if ( oveBelNum > 0 ) scrConEle.scrollTo({ // What: Scroll Adjust Guard. Why: Only an actually-overflowing slot needs to be scrolled into view at all. How: This scrolls the container down by exactly the overflow amount.


				behavior : redMotFun() ? 'auto' : 'smooth', // What: Behavior. Why: A user who prefers reduced motion gets an instant jump instead of a glide. How: This picks 'auto' under reduced motion, otherwise 'smooth'.
				top      : scrConEle.scrollTop + oveBelNum  // What: Top. Why: The page scrolls just enough to reveal the editor's bottom edge. How: This adds oveBelNum to the current scroll.


			});


		}) );


	};

	// #endregion addDraFun


	// #region opeDraFun

	/**
	 * opeDraFun = Open Draft Function
	 *
	 * @summary
	 * Opens the editor for an item already added to the create form. It snapshots
	 * the item first, so staDraFun can revert it when the user switches straight
	 * to another editor, and scrolls the editor into view. It does nothing if the
	 * item is gone.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param tarIdeStr - Target Identifier String: The id of the draft item to
	 *                    edit.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * opeDraFun( tarIdeStr ) // => void
	 * ```
	 *
	*/

	const opeDraFun = ( tarIdeStr ) => { // What: Open Draft Function. Why: Opening an already-committed draft item's editor needs to snapshot it first (for staDraFun's own revert-on-switch below) and scroll it into view. How: This looks up the item, bails out if it's already gone, then opens the editor and scrolls it into view.


		const fouIteObj = pooIteArr.find( ( iteCurObj ) => iteCurObj.id === tarIdeStr ); // What: Found Item Object. Why: The editor needs the real, current draft item record to open against. How: This looks up tarIdeStr in pooIteArr.


		if ( !fouIteObj ) return; // What: Missing Item Guard. Why: A stale id (already deleted) must not open an editor with nothing to show. How: This bails out before touching any state.



		ediSnaRef.current = { ...fouIteObj }; // What: Snapshot Write. Why: staDraFun needs a snapshot of this exact item, taken right now, in case it later has to revert this edit to switch to a different one. How: This shallow-copies fouIteObj into ediSnaRef.

		setEdiIteStr( tarIdeStr ); // What: Open Editor Call. Why: This is the actual state change that shows the editor. How: This writes tarIdeStr into ediIteStr.

		requestAnimationFrame( () => requestAnimationFrame( () => { // What: Scroll Into View Call. Why: The editor renders in the same below-the-list slot, which can be well out of view from wherever in a long pool the Edit button that opened it was. How: This waits two animation frames for layout to settle, then scrolls the shared .main container just enough to bring the slot fully into view.


			const addWraEle = addWraRef.current;                                                        // What: Add Wrap Element. Why: The scroll calculation needs the actual DOM node, not just the ref object. How: This reads addWraRef.current once and reuses it below.
			const scrConEle = addWraEle && addWraEle.closest( '[data-element-name-hook="appConMai"]' ); // What: Scroll Container Element. Why: The shared scrollable container is what actually needs to move, not the slot itself. How: This walks up from addWraEle to the nearest .main ancestor.


			if ( !addWraEle || !scrConEle ) return; // What: Missing Element Guard. Why: Either element may not exist yet if this fires after an unrelated unmount. How: This bails out of the scroll calculation entirely when either is missing.



			const oveBelNum = addWraEle.getBoundingClientRect().bottom - scrConEle.getBoundingClientRect().bottom + 96; // What: Overflow Below Number. Why: This is how far below the visible fold the slot actually sits, plus a small comfort margin. How: This subtracts the container's own bottom edge from the slot's own bottom edge.


			if ( oveBelNum > 0 ) scrConEle.scrollTo({ // What: Scroll Adjust Guard. Why: Only an actually-overflowing slot needs to be scrolled into view at all. How: This scrolls the container down by exactly the overflow amount.


				behavior : redMotFun() ? 'auto' : 'smooth', // What: Behavior. Why: A user who prefers reduced motion gets an instant jump instead of a glide. How: This picks 'auto' under reduced motion, otherwise 'smooth'.
				top      : scrConEle.scrollTop + oveBelNum  // What: Top. Why: The page scrolls just enough to reveal the editor's bottom edge. How: This adds oveBelNum to the current scroll.


			});


		}) );


	};

	// #endregion opeDraFun


	// #region staDraFun

	/**
	 * staDraFun = Start Draft Function
	 *
	 * @summary
	 * Starts editing a create-form item from any state. When another item's
	 * editor or the new-item form is open, it closes that one first (reverting an
	 * edited item to its snapshot) and stages tarIdeStr so the requested editor
	 * opens once the closing animation finishes; otherwise it opens the editor
	 * directly.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param tarIdeStr - Target Identifier String: The id of the draft item to
	 *                    edit.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * staDraFun( tarIdeStr ) // => void
	 * ```
	 *
	*/

	const staDraFun = ( tarIdeStr ) => { // What: Start Draft Function. Why: Switching straight from one open editor to another (or from the new-item form) needs to close whatever's currently open first, reverting it, before this edit can actually open. How: This closes an existing editor (with an explicit revert) or the new-item form, staging tarIdeStr to reopen once that closing animation finishes; otherwise it opens directly.


		if ( ediIteStr === tarIdeStr ) return; // What: Already Open Guard. Why: Re-clicking Edit on the exact same row that's already open should do nothing. How: This bails out when tarIdeStr matches the currently-open editor.



		if ( ediIteStr ) { // What: Other Editor Open Branch. Why: Another item's editor is already open and must be closed (with its own explicit revert) before this one can open. How: This reverts the currently-open item, stages tarIdeStr, and starts that editor's own closing animation.


			if ( ediSnaRef.current ) draActObj.revIteFun( ediIteStr, ediSnaRef.current ); // What: Revert Call Guard. Why: Only a genuine snapshot can be reverted to. How: This restores the currently-open item back to its pre-edit snapshot.



			penEdiRef.current = tarIdeStr; // What: Stage Reopen Call. Why: The requested edit must still open once the current one finishes closing. How: This stores tarIdeStr for the closing editor's own onAnimationEnd handler to pick up.

			setEdiCloBoo( true ); // What: Start Closing Call. Why: This is what actually plays the current editor's own out-animation. How: This flips ediCloBoo.



			return; // What: Early Return. Why: The requested edit must wait for the closing animation, not open immediately. How: This exits staDraFun without calling opeDraFun yet.


		}



		if ( actNewStr ) { // What: New Draft Open Branch. Why: A brand-new item's own form is in progress and must be closed (without saving) instead of silently no-oping. How: This stages tarIdeStr and starts the new-item form's own closing animation.


			penEdiRef.current = tarIdeStr; // What: Stage Reopen Call. Why: The requested edit must still open once the new-item form finishes closing. How: This stores tarIdeStr for the new-item wrap's own onAnimationEnd handler to pick up.

			setActCloStr( 'cancel' ); // What: Cancel New Call. Why: Switching away from an in-progress new item discards it rather than silently saving it. How: This starts the new-item wrap's own closing animation in its 'cancel' shape.



			return; // What: Early Return. Why: The requested edit must wait for the closing animation, not open immediately. How: This exits staDraFun without calling opeDraFun yet.


		}



		opeDraFun( tarIdeStr ); // What: Direct Open Call. Why: Neither another editor nor the new-item form was in the way, so the requested edit can open immediately. How: This calls opeDraFun with the same tarIdeStr.


	};

	// #endregion staDraFun

	// #endregion Draft Item Editing



	// #region Step Navigation And Submit

	React.useEffect( () => { // What: Reopen Tour Item Effect. Why: Back from a picker tour's own Step 12 (Create Picker) to Step 11 (Save this task item) needs that item's editor open again, since its own Save already committed it into pooIteArr (there's no separate "draft" vs "committed" state once saved, just actNewStr no longer pointing at it), so Step 11's own target has nothing left to click; there's no real DOM control left that would reverse this, which is why this needs a bus nonce at all. How: This reopens the SAME item, found by matching the tour's own itePreStr name (still sitting on the bus since nothing clears it until the whole tour closes), rather than creating a fresh one, preserving whatever the user actually edited in the earlier steps instead of resetting it.


		if ( !touBusObj.reoNonNum ) return; // What: No Bump Guard. Why: A fresh mount's own initial nonce value must not trigger a reopen. How: This bails out unless the nonce is genuinely truthy.



		const matIteObj = pooIteArr.find( ( iteCurObj ) => iteCurObj.name === touBusObj.itePreStr ); // What: Matched Item Object. Why: The exact item the tour walked the user through creating needs to be found again by name. How: This searches pooIteArr for an entry whose own name matches the bus's own staged itePreStr.


		if ( matIteObj ) { // What: Reopen Guard. Why: Only a genuinely-found match should be reopened. How: This clears any stale closing state and writes the matched item's own id into actNewStr.


			setActCloStr( false );        // What: Closing Clear Call. Why: The matched item's editor must not be mid-close. How: This resets actCloStr to false.
			setActNewStr( matIteObj.id ); // What: Active New Set Call. Why: The tour's prefilled item opens in the editor. How: This writes the matched item's id into actNewStr.


		}


		// eslint-disable-next-line react-hooks/exhaustive-deps -- What: Deliberate Dependency Omission. Why: The reopen must run only on a genuine nonce bump, so the values it reads fresh stay out of the array. How: This silences the react-hooks exhaustive-deps warning for the dependency array below.
	}, [ touBusObj.reoNonNum ] ); // What: Effect Dependency Array. Why: Only a genuine bump of this exact nonce should re-run this reopen. How: touBusObj.reoNonNum is the sole trigger; pooIteArr/touBusObj.itePreStr are read fresh from the closure each time it fires.


	// #region bacSteFun

	/**
	 * bacSteFun = Back Step Function
	 *
	 * @summary
	 * Returns the create form from its items step to its details step. It first
	 * disarms EntEdiCom's deferred revert, which would otherwise close whatever
	 * gets added next, and discards any in-progress item so + Add Item still
	 * works afterward.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * bacSteFun() // => void
	 * ```
	 *
	*/

	const bacSteFun = () => { // What: Back Step Function. Why: Returning to Step 1 must not leave Step 2 stuck with a stale actNewStr (which would make + Add Item a no-op), so any in-progress item is discarded first. How: This disarms EntEdiCom's own deferred revert (else it would fire on the next macrotask and re-set actCloStr='cancel', auto-closing whatever gets added next), removes an in-progress item if there is one, then steps back.


		window.__editGuard.disFun(); // What: Edit Guard Disarm Call. Why: A deferred revert firing after this navigation would corrupt whatever item gets added next. How: This calls the shared global editor guard's own disarm method.

		if ( actNewStr ) { // What: Discard In-Progress Guard. Why: An unsaved in-progress item must not linger once the user navigates away from it. How: This removes it from pooIteArr and clears actNewStr, only if one was actually open.


			draActObj.delIteFun( actNewStr ); // What: Remove Draft Call. Why: The unfinished new item is discarded. How: This removes actNewStr from the draft pool.
			setActNewStr( null );             // What: Active New Clear Call. Why: No new item is being added anymore. How: This resets actNewStr to null.


		}



		setActCloStr( false ); // What: Closing Reset Call. Why: A stale closing flag must not carry over into Step 1. How: This resets actCloStr to false.

		setForSteNum( 1 ); // What: Step Back Call. Why: This is the actual navigation back to Step 1. How: This writes 1 into forSteNum.


	};

	// #endregion bacSteFun



	// #region subForFun

	/**
	 * subForFun = Submit Form Function
	 *
	 * @summary
	 * Creates or saves the picker. It builds the shared payload from both steps,
	 * attaches the chosen or newly named conditional (or detaches one when
	 * editing), adds the ease summary fields on create only, then calls
	 * onSavEdiFun in edit mode or onCrePicFun otherwise.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * subForFun() // => void
	 * ```
	 *
	*/

	const subForFun = () => { // What: Submit Form Function. Why: This is the actual create/save commit, gated on both steps' own readiness and a resolved name collision. How: This builds the shared payload shape, attaches a conditional (or detaches one, on edit), attaches the legacy ease summary fields (create only), then routes to onSavEdiFun or onCrePicFun.


		if ( !detReaBoo || ( !isaEdiBoo && !enoIteBoo ) ) return; // What: Not Ready Guard. Why: Neither flow can submit until Step 1's own fields are complete, and creating additionally needs at least 2 real items. How: This bails out unless both conditions hold for the active flow.



		if ( conAttBoo && conSelStr === 'new' && conColBoo ) return; // What: Name Collision Guard. Why: A colliding new-conditional name must surface its own error instead of silently submitting. How: This bails out of the submit while conColBoo holds, leaving conErrStr visible on the name field.



		const payForObj = { // What: Payload Form Object. Why: Both onCrePicFun and onSavEdiFun expect this exact shared shape. How: This gathers every Step 1 field that both flows always send.


			avoidDuplicates : avoDupBoo,                     // What: Avoid Duplicates. Why: The picker saves the duplicates toggle. How: This passes avoDupBoo.
			daysOfWeek      : runDowArr,                     // What: Days Of Week. Why: The picker saves its chosen run days. How: This passes runDowArr.
			group           : effGroStr,                     // What: Group. Why: The picker saves its chosen or newly-typed group. How: This passes effGroStr.
			includeInDaily  : incDaiBoo,                     // What: Include In Daily. Why: The store adds or removes the picker from the daily generator. How: This passes incDaiBoo.
			mode            : selModStr,                     // What: Mode. Why: The picker saves its chosen mode. How: This passes selModStr.
			name            : capStrFun( newNamStr.trim() ), // What: Name. Why: The picker saves a tidied, capitalized name. How: This trims newNamStr and capitalizes it.
			skipHolidays    : skiHolBoo,                     // What: Skip Holidays. Why: The picker saves the holiday toggle. How: This passes skiHolBoo.

			...cadCurObj // What: Cadence Spread. Why: Every cadence field the control produced is saved alongside. How: This spreads in cadCurObj.


		};


		if ( !isaEdiBoo ) payForObj.items = pooIteArr; // What: Items Attach Guard. Why: Only a fresh create actually needs to send a full items array; an edit's own items are managed elsewhere. How: This attaches pooIteArr to payForObj only while isaEdiBoo is false.



		if ( conAttBoo && conSelStr === 'new' ) { // What: Conditional Attach Note. Why: Create-new names are unique by validation above, so no silent reuse happens here; edit explicitly clears the field (conditionalId: null) when turned off, since unlike a fresh create, this can also DETACH one the picker already had, so there's no bare "just omit the field" default to fall back on. How: The three branches below cover attaching an existing conditional, attaching a fresh inline one, or explicitly detaching on edit.


			payForObj.newConditional = { // What: New Conditional Attach. Why: A freshly-created inline conditional needs its own draft shape sent through, under its own tidied name. How: This spreads conDraObj and overwrites its name with conTidStr (or a bare fallback).


				...conDraObj, // What: Conditional Draft Spread. Why: The new conditional keeps every field the inline editor set. How: This copies conDraObj.

				name : conTidStr || 'Conditional' // What: Name. Why: The saved conditional needs a tidy name, even if the field was left blank. How: This uses conTidStr, falling back to 'Conditional'.


			};


		}

		else if ( conAttBoo && conSelStr ) { // What: Existing Conditional Branch. Why: Attaching an existing conditional only needs its id. How: This sets conditionalId to conSelStr.


			payForObj.conditionalId = conSelStr; // What: Existing Conditional Attach. Why: Reusing an existing conditional only needs its own id sent through. How: This writes conSelStr directly onto payForObj.conditionalId.


		}

		else if ( isaEdiBoo ) { // What: Detach On Edit Branch. Why: Turning the attach toggle off while editing must clear the old attachment. How: This sets conditionalId to null.


			payForObj.conditionalId = null; // What: Conditional Detach. Why: Turning the toggle off while editing must actively clear whatever conditional was previously attached, not just omit the field. How: This writes an explicit null onto payForObj.conditionalId.


		}



		if ( isaEasBoo && !isaEdiBoo ) { // What: Legacy Ease Summary Guard. Why: Nothing reads picker.easeMin/easeMax anymore (pick(), the Data tab, and the item editor all compute a live per-picker average from the items themselves instead, see PIC_NAM_OBJ.aveEasFun), so this is kept only so store.js's addPicFun still has a value to accept; harmless dead data on the created picker otherwise. How: This is skipped for edit, since there's no items array here to compute a fresh average from, and the field is inert anyway.


			payForObj.easeMin = Math.min( ...pooIteArr.map( ( iteCurObj ) => iteCurObj.easeMin ?? defEasObj.easeMin ) ); // What: Legacy Ease Min Attach. Why: A summary value is still expected on the created payload. How: This takes the smallest easeMin across every committed item.

			payForObj.easeMax = Math.max( ...pooIteArr.map( ( iteCurObj ) => iteCurObj.easeMax ?? defEasObj.easeMax ) ); // What: Legacy Ease Max Attach. Why: A summary value is still expected on the created payload. How: This takes the largest easeMax across every committed item.


		}



		if ( isaEdiBoo ) onSavEdiFun( payForObj ); // What: Edit Route Branch. Why: An in-progress edit of an existing picker must reach the save flow. How: This calls onSavEdiFun with payForObj.

		else onCrePicFun( payForObj ); // What: Create Route Branch. Why: A brand-new picker must reach the create flow instead. How: This calls onCrePicFun with payForObj.


	};

	// #endregion subForFun

	// #endregion Step Navigation And Submit



	return (


		<div
			ref={ forWraRef }

			className='picker-view np-form'
		>{ /* What: Picker Form Div Element. Why: This is PicForCom's own root, holding the header, the step indicator (create only), and whichever step's own content is active. How: This wraps every piece of the create/edit form. */ }


			<header className='picker-h'>{ /* What: Picker Header Element. Why: The kicker and heading read as one title block. How: This wraps those two pieces. */ }


				<div>{ /* What: Header Text Div Element. Why: The form's kicker and title belong together. How: This wraps the two lines below. */ }


					<div className='kicker'>{ isaEdiBoo ? 'Editing' : 'New picker' }</div>{ /* What: Kicker Div Element. Why: A small eyebrow label orients the reader before the heading below. How: This renders "Editing" or "New picker" depending on isaEdiBoo. */ }

					<h2 className='picker-title'>{ isaEdiBoo ? ( newNamStr.trim() || 'Editing picker' ) : 'Create a picker' }</h2>{ /* What: Title Heading Element. Why: This form's own main heading should reflect whatever the user has typed so far while editing. How: This shows the live-typed name (or a fallback) while editing, otherwise a fixed create-mode heading. */ }


				</div>


			</header>


			{ !isaEdiBoo && ( // What: Step Indicator Check. Why: Only the create flow ever has a second step to indicate. How: This renders the whole step indicator only while isaEdiBoo is false. // What: Edit Steps Design Note. Why: Edit reuses only the Details step, since this picker's items already exist and are edited via the Data tab or PicVieCom's own live pool instead. How: There's no Items step to switch to here, so the step indicator below is skipped entirely while isaEdiBoo is true.


				<div className='np-steps'>{ /* What: Steps Div Element. Why: Details and Items need a shared two-step indicator row. How: This wraps both step buttons and the connecting line between them. */ }


					<button
						className={ ` np-step   ob-picker-details   ${ forSteNum === 1 ? 'is-on' : 'is-done' } ` }

						data-element-name-hook='detSteBut'

						type='button'

						onClick={ () => setForSteNum( 1 ) }
					>{ /* What: Details Step Button Element. Why: The user needs a way to jump back to Step 1 at any time. How: This marks itself "is-on" while forSteNum is 1, otherwise "is-done", and always allows navigating back. Its data-element-name-hook is read by the picker mini-tours. */ }


						<span className='np-step-num'>{ /* What: Step Number Span Element. Why: A completed step shows a checkmark instead of its own number. How: This renders a check icon once forSteNum has advanced past 1, otherwise the literal "1". */ }


							{ forSteNum > 1 ? ( // What: Step Done Check. Why: A completed Details step shows a checkmark in place of its number. How: This renders the check icon once forSteNum is past 1.


								<IcoSvgCom
									icoNamStr='cheEle'
									sizValNum={ 12 }
								/> // What: Icon Svg Component. Why: The finished step needs a recognizable checkmark. How: This renders the 'cheEle' icon at a fixed size.


							) : ( // What: Step Number Branch. Why: An unfinished step shows its own number. How: This renders the else branch while forSteNum is 1.


								'1' // What: Step Number Literal. Why: This is the Details step's own position. How: This renders the literal text "1".


							) }


						</span>

						<span className='np-step-lbl'>Details</span>{ /* What: Step Label Span Element. Why: The step needs a readable name alongside its number. How: This renders the fixed literal text. */ }


					</button>

					<span className='np-step-line' />{ /* What: Step Line Span Element. Why: The two step buttons need a visible connecting line between them. How: This is a purely decorative element, styled entirely via CSS. */ }

					<button
						className={ ` np-step   ${ forSteNum === 2 ? 'is-on' : '' } ` }

						disabled={ !detReaBoo }
						type='button'

						onClick={ () => detReaBoo && setForSteNum( 2 ) }
					>{ /* What: Items Step Button Element. Why: The user needs a way to jump to Step 2 once it's actually reachable. How: This stays disabled until detReaBoo is true, and marks itself "is-on" while forSteNum is 2. */ }


						<span className='np-step-num'>2</span>{ /* What: Step Number Span Element. Why: The step needs its own visible number. How: This renders the literal "2". */ }

						<span className='np-step-lbl'>Items</span>{ /* What: Step Label Span Element. Why: The step needs a readable name alongside its number. How: This renders the fixed literal text. */ }


					</button>


				</div>


			) }



			{ forSteNum === 1 ? ( // What: Step One Check. Why: Exactly one step's own content shows at a time. How: This renders the Details step below while forSteNum is 1, otherwise the Items step further down.


				<div
					key='np-step1'

					className='tab-fade'
				>{ /* What: Step One Fade Div Element. Why: Switching steps should play a fade transition, and React needs a stable key to treat each step as a distinct mounted instance. How: This wraps the whole Details step's own fields and footer. */ }


					<p className='picker-hint'>{ /* What: Intro Hint Paragraph Element. Why: A first-time user needs a plain-language orientation before the fields below. How: This shows a slightly different phrasing for edit versus create. */ }


						{ isaEdiBoo // What: Edit Mode Check. Why: Editing and creating need different intro text. How: This picks one of the two paragraphs below based on isaEdiBoo.


							? <React.Fragment>Pickers are the heart of the Ease My Life app. They are small machines that chooses one item for you from a list, e.g. a chore to do, a meal to make, a way to wind down. Adjust its name, group, how it should pick and when it should run below.</React.Fragment> // What: Editing Intro Phrase. Why: An existing picker's own intro reads slightly differently since it's being adjusted rather than created for the first time. How: This renders while isaEdiBoo is true.

							: <React.Fragment>Pickers are the heart of the Ease My Life app. They are small machines that chooses one item for you from a list, e.g. a chore to do, a meal to make, a way to wind down. Give it a name, attach a group, choose how it should pick and when it should run. You&rsquo;ll fill its list of items in the next step.</React.Fragment> // What: Create Intro Phrase. Why: A brand-new picker's own intro needs to set up the next Items step too. How: This renders while isaEdiBoo is false.


						}


					</p>



					<div
						className='np-fields'

						data-element-name-hook='picFieDiv'
					>{ /* What: Fields Div Element. Why: Every Details field (Name, Group, Picker type, conditional attach, daily schedule) belongs in one shared column. How: This wraps every np-field block below. Its data-element-name-hook is read by the picker mini-tours. */ }


						<div
							className='np-field'

							data-element-name-hook='forFieDiv'
						>{ /* What: Name Field Div Element. Why: The label, its help text, and the input itself form one field unit. How: This wraps those three pieces. Its data-element-name-hook is read by the picker mini-tours. */ }


							<label
								className='np-label'

								htmlFor='np-name'
							>Name</label>{ /* What: Name Label Element. Why: The input below needs an associated, readable label. How: This is linked to the input via the shared 'np-name' id. */ }

							<p className='np-help'>What you&rsquo;ll see on the picker bar above and on your todo list cards. Short and plain works best, e.g. &ldquo;Daily Chore&rdquo;, &ldquo;Dinner&rdquo;, &ldquo;Coffee Creamer&rdquo;.</p>{ /* What: Name Help Paragraph Element. Why: A first-time user needs guidance on what makes a good picker name. How: This renders a fixed explanatory sentence with a couple of worked examples. */ }

							<input
								ref={ namInpRef }

								id='np-name'

								className='np-input'

								autoComplete='off'
								maxLength={ 40 }
								placeholder='e.g. Daily Chore'
								type='text'
								value={ newNamStr }

								onChange={ ( chaEveObj ) => setNewNamStr( chaEveObj.target.value ) }
							/>{ /* What: Name Input Element. Why: This is the actual live-typed name field. How: This writes into newNamStr on every change. */ }


						</div>


						<div
							className='np-field'

							data-element-name-hook='forFieDiv'
						>{ /* What: Group Field Div Element. Why: The label, help text, group chips, and the inline new-group input form one field unit. How: This wraps those pieces. Its data-element-name-hook is read by the picker mini-tours. */ }


							<span className='np-label'>Group</span>{ /* What: Group Label Span Element. Why: The controls below need a readable label. How: This renders the literal word "Group". */ }

							<p className='np-help'>Pickers are clustered into groups on your todo list, like &ldquo;Chores&rdquo; or &ldquo;Food&rdquo;, so that related picks sit together. You may choose an existing group or create a new one.</p>{ /* What: Group Help Paragraph Element. Why: A first-time user needs to understand what a group actually does before choosing one. How: This renders a fixed explanatory sentence. */ }

							<div className='np-groups'>{ /* What: Groups Div Element. Why: Every existing group chip plus the "New Group" chip sit in one row. How: This maps exiGroArr to one chip each, then appends the fixed "New Group" chip. */ }


								{ exiGroArr.map( ( curGroStr ) => ( // What: Group Chip List Render. Why: Every existing group needs its own selectable chip. How: This maps exiGroArr to one button per curGroStr.


									<button
										key={ curGroStr }

										className={ ` np-chip   ${ !addGroBoo && selGroStr === curGroStr ? 'is-on' : '' } ` }

										type='button'

										onClick={ () => { // What: On Click Handler. Why: Tapping an existing group selects it. How: This closes the new-group sub-form and selects this chip's group.


											setAddGroBoo( false );     // What: Add Group Close Call. Why: Picking an existing group closes the new-group sub-form. How: This resets addGroBoo to false.
											setSelGroStr( curGroStr ); // What: Group Select Call. Why: This chip's group becomes the picker's group. How: This writes curGroStr into selGroStr.


										} }
									>{ /* What: Group Chip Button Element. Why: Tapping an existing group chip should select it and close the new-group sub-form. How: This clears addGroBoo and writes curGroStr into selGroStr. */ }


										{ curGroStr }{ /* What: Chip Name Expression. Why: Every group chip needs its own visible label. How: This renders curGroStr. */ }


									</button>


								)) }

								<button
									className={ ` np-chip   np-chip--new   ${ addGroBoo ? 'is-on' : '' } ` }

									type='button'

									onClick={ () => setAddGroBoo( true ) }
								>{ /* What: New Group Chip Button Element. Why: The user needs an explicit way to open the inline new-group sub-form. How: This flips addGroBoo true. */ }


									<IcoSvgCom
										icoNamStr='pluEle'
										sizValNum={ 13 }
									/>{ /* What: Icon Svg Component. Why: The button needs a recognizable "add" glyph beside its own label. How: This renders the 'pluEle' icon at a fixed size. */ } New Group


								</button>


							</div>



							<ColDisCom open={ addGroBoo }>{ /* What: Collapse Disclosure Component. Why: The new-group input only needs to exist while addGroBoo is actually on. How: This animates the input open/closed around that boolean. */ }


								<input
									className='np-input np-input--sm'

									autoComplete='off'
									autoFocus
									maxLength={ 30 }
									placeholder='Name the new group'
									type='text'
									value={ newGroStr }

									aria-label='New group name'

									onChange={ ( chaEveObj ) => setNewGroStr( chaEveObj.target.value ) }
								/>{ /* What: New Group Input Element. Why: A brand-new group needs its own typed name. How: This is a controlled text input committing on Enter or the checkmark. */ }


							</ColDisCom>


						</div>


						<fieldset
							className='np-field'

							data-element-name-hook='forFieFie'
						>{ /* What: Mode Field Fieldset Element. Why: The picker-type radio group needs its own labelled fieldset. How: This wraps the legend, help text, and the radio list below. Its data-element-name-hook is read by the picker mini-tours. */ }


							<legend className='np-label'>Picker type</legend>{ /* What: Mode Legend Element. Why: A fieldset needs its own accessible legend. How: This renders the literal text "Picker type". */ }

							<p className='np-help'>This is the ruleset that the picker follows each time it runs. &ldquo;Truly Random&rdquo; is the simplest where every item has an equal chance. The others nudge the odds in different ways. Not sure? We recommend the Dynamic Weighted type but you can change a picker&rsquo;s type at any time.</p>{ /* What: Mode Help Paragraph Element. Why: A first-time user needs to understand what a "mode" even means before picking one. How: This renders a fixed explanatory sentence with a recommendation. */ }

							<div className='mode-radio'>{ /* What: Mode Radio Div Element. Why: Every mode in SED_NAM_OBJ.MOD_DEF_OBJ needs its own selectable radio row. How: This maps Object.entries(SED_NAM_OBJ.MOD_DEF_OBJ) to one label per entry. */ }


								{ Object.entries( SED_NAM_OBJ.MOD_DEF_OBJ ).map( ( [ modKeyStr, modInfObj ] ) => ( // What: Mode Option List Render. Why: The picker's own mode choice must be built from the shared SED_NAM_OBJ.MOD_DEF_OBJ table, not hardcoded. How: This maps each [key, info] pair to one radio label.


									<label
										key={ modKeyStr }

										className={ ` mode-opt   ${ selModStr === modKeyStr ? 'is-on' : '' } ` }

										data-element-name-hook='modOptLab'
										data-mode={ modKeyStr }
									>{ /* What: Mode Option Label Element. Why: The radio input and its own name/hint text must all be one clickable label. How: This wraps the radio input and its description block. Its data-element-name-hook is read by the picker mini-tours. */ }


										<input
											name='np-mode'

											checked={ selModStr === modKeyStr }
											type='radio'

											onChange={ () => setSelModStr( modKeyStr ) }
										/>{ /* What: Mode Radio Input Element. Why: This is the actual selectable control. How: This is checked when selModStr matches modKeyStr, and selects it on change. */ }

										<div>{ /* What: Mode Text Div Element. Why: The mode's own name and hint text need to sit beside the radio input. How: This wraps mode-opt-name and mode-opt-hint. */ }


											<div className='mode-opt-name'>{ modInfObj.labStr }</div>{ /* What: Mode Name Div Element. Why: The mode needs its own readable name. How: This renders modInfObj.labStr. */ }

											{ Array.isArray( modInfObj.hinArr ) // What: Hint Content Check. Why: A mode's own hint can be one paragraph or several. How: This maps every paragraph when hint is an array, otherwise renders the single hint.


												? modInfObj.hinArr.map( ( parTexStr, parIndNum ) => ( // What: Multi-Paragraph Hint Render. Why: Some modes explain themselves across more than one short paragraph. How: This maps modInfObj.hinArr to one div per entry when it's an array.


													<div
														key={ parIndNum }

														className='mode-opt-hint'
													>{ parTexStr }</div> // What: Hint Paragraph Element. Why: Each paragraph renders as its own hint line. How: This renders parTexStr, keyed by its index.


												) )

												: <div className='mode-opt-hint'>{ modInfObj.hinArr }</div> // What: Single-Paragraph Hint Render. Why: Most modes only need one short explanation. How: This renders modInfObj.hinArr directly when it's a plain string.


											}


										</div>


									</label>


								)) }


							</div>


						</fieldset>



						<div
							className='np-field np-cond'

							data-element-name-hook='forFieDiv'
						>{ /* What: Conditional Field Div Element. Why: The attach-a-conditional toggle and its own collapsible content form one field unit. How: This wraps np-field--toggle and the ColDisCom below it. Its data-element-name-hook is read by the picker mini-tours. */ }


							<div className='np-field--toggle'>{ /* What: Toggle Div Element. Why: The label/help text block and the switch control sit side by side. How: This wraps np-toggle-text and the switch button. */ }


								<div className='np-toggle-text'>{ /* What: Toggle Text Div Element. Why: The label and its two help paragraphs read as one block. How: This wraps those three pieces. */ }


									<span className='np-label'>Attach a conditional</span>{ /* What: Conditional Label Span Element. Why: The toggle below needs a readable label. How: This renders the literal text. */ }

									<p className='np-help'>Conditionals can be attached to a picker that will determine whether a picker should be run on any given day during the auto generator phase for the Today page. Run eligibility can be determined using the same rules that the pickers use, e.g. Truly Random, Weighted, Dynamic Weighted, Ease Up and Ease Down.</p>{ /* What: Conditional Help Paragraph Element. Why: A first-time user needs to understand what a conditional even does. How: This renders a fixed explanatory sentence. */ }

									<p className='np-help'>Example: You have a Daily Chore picker that you attach a Weighted conditional to in order to determine whether a Day Off should should be triggered and therefore no chores should be chosen for that day.</p>{ /* What: Conditional Example Paragraph Element. Why: A concrete example lands faster than the abstract explanation above alone. How: This renders a fixed worked example sentence. */ }


								</div>

								<button
									className={ ` switch   ${ conAttBoo ? 'is-on' : '' } ` }

									data-element-name-hook='togSwiBut'

									type='button'

									aria-checked={ conAttBoo }
									aria-label='Attach a conditional'
									role='switch'

									onClick={ () => setConAttBoo( ( preValBoo ) => !preValBoo ) }
								>{ /* What: Conditional Switch Button Element. Why: This is the actual on/off control for the conditional attachment. How: This flips conAttBoo on click. Its data-element-name-hook is read by help mode's Today catalog. */ }


									<i />{ /* What: Switch Dot Element. Why: This is the switch's own purely decorative sliding knob. How: This renders empty, positioned entirely via CSS off the "is-on" class on its parent button. */ }


								</button>


							</div>



							<ColDisCom open={ conAttBoo }>{ /* What: Collapse Disclosure Component. Why: The whole conditional-attach block only needs to exist while conAttBoo is actually on. How: This animates cnd-attach open/closed around that boolean. */ }


								<div className='cnd-attach'>{ /* What: Conditional Attach Div Element. Why: The pill rail and the inline new-conditional editor form one block. How: This wraps cnd-rail and the ColDisCom around CodConCom. */ }


									<div
										ref={ raiCalFun }

										className='cnd-rail picker-groups at-start at-end'
									>{ /* What: Conditional Rail Div Element. Why: Every existing conditional plus the "Add New" pill need a horizontally-scrolling rail. How: This wraps one pill per sorted entry in conObjArr, then the fixed "Add New Conditional" pill. */ }


										{ [ ...conObjArr ].sort( ( conOneObj, conTwoObj ) => { // What: Sorted Conditional List Render. Why: The rail needs a stable order with the active selection pinned to the front. How: This sorts alphabetically, except a or b matching conSelStr is forced to the very front. // What: Conditional Sort Design Note. Why: The rail reads alphabetically, except the currently-selected conditional (once the user has picked one) pins to the front. How: This is the same "selected stays first" convention as the Data tab's own rail.


											if ( conOneObj.id === conSelStr ) return -1; // What: First Pinned Guard. Why: The currently-selected conditional must sort before everything else. How: This returns -1 whenever conOneObj is the selection.



											if ( conTwoObj.id === conSelStr ) return 1; // What: Second Pinned Guard. Why: Same reasoning as above, for the other comparison side. How: This returns 1 whenever conTwoObj is the selection.



											return conOneObj.name.localeCompare( conTwoObj.name ); // What: Alphabetical Fallback Return. Why: Every other pair sorts by plain alphabetical name. How: This delegates to String.localeCompare.


										} ).map( ( curConObj ) => ( // What: Conditional Pill Map. Why: Every sorted conditional renders as one pill. How: This maps the sorted list to one pill per conditional.


											<button
												key={ curConObj.id }

												className={ ` cnd-pill   ${ conSelStr === curConObj.id ? 'is-on' : '' } ` }

												type='button'

												onClick={ () => setConSelStr( curConObj.id ) }
											>{ /* What: Conditional Pill Button Element. Why: Every existing conditional needs its own selectable pill showing its name and mode. How: This selects curConObj.id on click. */ }


												<span className='cnd-pill-name'>{ curConObj.name }</span>{ /* What: Pill Name Span Element. Why: The pill needs its own readable name. How: This renders curConObj.name. */ }

												<span className='cnd-pill-mode'>{ ( SED_NAM_OBJ.MOD_DEF_OBJ[ curConObj.mode ] || {} ).labStr || curConObj.mode }</span>{ /* What: Pill Mode Span Element. Why: The pill also needs to show which mode the conditional itself runs under. How: This looks up the mode's own label in SED_NAM_OBJ.MOD_DEF_OBJ, falling back to the raw mode string. */ }


											</button>


										)) }

										<button
											className={ ` cnd-pill   cnd-pill--new   ${ conSelStr === 'new' ? 'is-on' : '' } ` }

											type='button'

											onClick={ () => { // What: On Click Handler. Why: Tapping New opens the inline conditional editor with a fresh draft. How: This selects 'new' and seeds conDraObj.


												setConSelStr( 'new' );                                                                           // What: New Conditional Select Call. Why: The new-conditional pill becomes the selected one. How: This writes 'new' into conSelStr.
												setConDraObj( conDraFun( newNamStr.trim(), conObjArr.map( ( conCurObj ) => conCurObj.name ) ) ); // What: Conditional Draft Seed Call. Why: The inline editor needs a sensible starting draft whose name won't collide. How: This builds one from the picker's name and every existing conditional name.


											} }
										>{ /* What: New Conditional Pill Button Element. Why: The user needs an explicit way to open the inline new-conditional editor. How: This selects the 'new' pill and seeds conDraObj from the shared default, pre-filled with this picker's own name. */ }


											<IcoSvgCom
												icoNamStr='pluEle'
												sizValNum={ 16 }
											/>{ /* What: Icon Svg Component. Why: The new-conditional pill needs a recognizable "add" glyph. How: This renders the 'pluEle' icon at a fixed size. */ }

											<span className='cnd-pill-name'>Add New Conditional</span>{ /* What: Pill Name Span Element. Why: The new-conditional pill needs its own visible label. How: This renders the literal text "Add New Conditional". */ }


										</button>


									</div>



									<ColDisCom open={ conSelStr === 'new' }>{ /* What: Collapse Disclosure Component. Why: The inline new-conditional editor only needs to exist while conSelStr is actually 'new'. How: This animates CodConCom open/closed around that check. */ }


										<CodConCom
											conDraObj={ conDraObj }
											namErrStr={ conErrStr }

											onChange={ setConDraObj }
										/>{ /* What: Conditional Control Component. Why: A new inline conditional is edited through the same control the Data tab uses. How: This is passed the draft and its own name error. */ }


									</ColDisCom>


								</div>


							</ColDisCom>


						</div>



						<div
							className='np-field np-daily-group'

							data-element-name-hook='forFieDiv'
						>{ /* What: Daily Field Div Element. Why: The daily-generator toggle and its own collapsible schedule content form one field unit. How: This wraps np-field--toggle and the ColDisCom below it. Its data-element-name-hook is read by the picker mini-tours. */ }


							<div className='np-field--toggle'>{ /* What: Toggle Div Element. Why: The label/help text block and the switch control sit side by side. How: This wraps np-toggle-text and the switch button. */ }


								<div className='np-toggle-text'>{ /* What: Toggle Text Div Element. Why: The label and its own live-updating help text read as one block. How: This wraps those two pieces. */ }


									<label
										className='np-label'

										htmlFor='np-daily'
									>Include in the daily generator</label>{ /* What: Daily Label Element. Why: The switch below needs an associated, readable label. How: This is linked to the switch via the shared 'np-daily' id. */ }

									<p
										key={ incDaiBoo ? 'on' : 'off' }

										className='np-help set-sub-fade'
									>{ /* What: Daily Help Paragraph Element. Why: The user should immediately see the practical consequence of the toggle's own current state. How: This is re-keyed by incDaiBoo so the text cross-fades on every change. */ }


										{ incDaiBoo // What: Daily Membership Check. Why: The explanation depends on whether the picker joins the daily generator. How: This picks one of the two phrases below based on incDaiBoo.


											? <React.Fragment>This picker <strong>will run</strong> automatically as part of your daily list or whenever you tap Regenerate in the Today tab.</React.Fragment> // What: Daily Enabled Phrase. Why: The daily-generator note needs its own live wording for the enabled state. How: This renders while incDaiBoo is true.

											: <React.Fragment>This picker <strong>will not run</strong> automatically, but you can still run it manually from this tab.</React.Fragment> // What: Daily Disabled Phrase. Why: The daily-generator note needs its own live wording for the disabled state. How: This renders while incDaiBoo is false.


										}


									</p>


								</div>


								<button
									id='np-daily'

									className={ ` switch   ${ incDaiBoo ? 'is-on' : '' } ` }

									data-element-name-hook='togSwiBut'

									type='button'

									aria-checked={ incDaiBoo }
									aria-label='Include in the daily generator'
									role='switch'

									onClick={ () => { // What: On Click Handler. Why: The daily switch should also let the schedule scroll into view. How: This marks the toggle as user-driven, then flips incDaiBoo.


										daiTogRef.current = true;                    // What: Daily Toggled Mark. Why: The schedule's scroll-into-view should only follow a real user toggle. How: This flags daiTogRef.
										setIncDaiBoo( ( preValBoo ) => !preValBoo ); // What: Daily Toggle Call. Why: This is the actual daily-generator switch. How: This flips incDaiBoo.


									} }
								>{ /* What: Daily Switch Button Element. Why: This is the actual on/off control for daily-generator membership. How: This marks daiTogRef true (so the reveal effect above knows this was a genuine user toggle) and flips incDaiBoo. Its data-element-name-hook is read by help mode's Today catalog. */ }


									<i />{ /* What: Switch Dot Element. Why: This is the switch's own purely decorative sliding knob. How: This renders empty, positioned entirely via CSS off the "is-on" class on its parent button. */ }


								</button>


							</div>



							<ColDisCom open={ incDaiBoo }>{ /* What: Collapse Disclosure Component. Why: The whole schedule block only needs to exist while incDaiBoo is actually on. How: This animates np-sched open/closed around that boolean. */ }


								<div
									ref={ daiBloRef }

									className='np-sched np-daily-anim'
								>{ /* What: Schedule Div Element. Why: The cadence control, the weekday picker, and the two schedule toggles form one collapsible block. How: This wraps np-sched-block/np-sched-toggle sections below. */ }


									<div className='np-sched-block'>{ /* What: Cadence Block Div Element. Why: The shared cadence editor needs its own labelled block. How: This wraps a single CadConCom, wired to cadCurObj. */ }


										<CadConCom
											value={ cadCurObj }

											onChange={ ( patCadObj ) => setCadCurObj( ( preCadObj ) => CAD_NAM_OBJ.norCadFun({ ...preCadObj, ...patCadObj }) ) }
										/>{ /* What: Cadence Control Component. Why: The schedule's own cadence is edited through the shared cadence control. How: This normalizes every patch into cadCurObj. */ }


									</div>



									<div className='np-sched-block'>{ /* What: Days Block Div Element. Why: The weekday picker and its own presets form one block. How: This wraps the label, help text, chips, and preset buttons below. */ }


										<span className='np-label'>Which days?</span>{ /* What: Days Label Span Element. Why: The weekday picker below needs a readable label. How: This renders the literal text. */ }

										<p className='np-help'>Pick the days that this picker is allowed to run on. Tap a day to turn it off. This is handy for things like chores, that you&rsquo;d rather not see on weekends.</p>{ /* What: Days Help Paragraph Element. Why: A first-time user needs to understand what tapping a day chip actually does. How: This renders a fixed explanatory sentence. */ }


										<div className='np-sched-row'>{ /* What: Schedule Row Div Element. Why: The weekday chips and their preset shortcuts sit side by side. How: This wraps WeeChiCom and np-sched-presets. */ }


											<WeeChiCom
												locDayNum={ locDowNum }
												locTipStr={ locDowNum === null ? '' : CAD_NAM_OBJ.locTipFun( locDowNum, 'On which day?' ) }
												value={ runDowArr }

												onChange={ setRunDowArr }
											/>{ /* What: Weekday Chips Component. Why: The user needs a direct way to toggle individual weekdays on or off. How: This is passed runDowArr and locDowNum so a weekly cadence's own anchor day can't be turned off here. */ }



											<div className='np-sched-presets'>{ /* What: Presets Div Element. Why: Three common day patterns deserve one-tap shortcuts instead of manual chip-tapping every time. How: This wraps the Every day/Weekdays/Weekends buttons. */ }


												<button
													className='np-preset'

													type='button'

													onClick={ () => setRunDowArr( witLocFun( [ 0, 1, 2, 3, 4, 5, 6 ] ) ) }
												>Every day</button>{ /* What: Every Day Preset Button Element. Why: This is the fastest way to select every day at once. How: This calls witLocFun with the full week, keeping any locked anchor day intact. */ }

												<button
													className='np-preset'

													type='button'

													onClick={ () => setRunDowArr( witLocFun( [ 1, 2, 3, 4, 5 ] ) ) }
												>Weekdays</button>{ /* What: Weekdays Preset Button Element. Why: This is a common one-tap pattern for chore-like pickers. How: This calls witLocFun with Monday through Friday. */ }

												<button
													className='np-preset'

													type='button'

													onClick={ () => setRunDowArr( witLocFun( [ 0, 6 ] ) ) }
												>Weekends</button>{ /* What: Weekends Preset Button Element. Why: This is the inverse common one-tap pattern. How: This calls witLocFun with Saturday and Sunday. */ }


											</div>


										</div>


									</div>



									<div className='np-sched-toggle'>{ /* What: Skip Holidays Toggle Div Element. Why: The label/help text block and its own switch sit side by side. How: This wraps np-toggle-text and the switch button. */ }


										<div className='np-toggle-text'>{ /* What: Toggle Text Div Element. Why: The toggle's own label and live explanation belong together. How: This wraps the label and sub text below. */ }


											<label
												className='np-label'

												htmlFor='np-skiphol'
											>Skip on holidays</label>{ /* What: Skip Holidays Label Element. Why: The switch below needs an associated, readable label. How: This is linked to the switch via the shared 'np-skiphol' id. */ }

											<p
												key={ skiHolBoo ? 'on' : 'off' }

												className='np-help set-sub-fade'
											>{ /* What: Skip Holidays Help Paragraph Element. Why: The user should immediately see the practical consequence of the toggle's own current state. How: This is re-keyed by skiHolBoo so the text cross-fades on every change. */ }


												{ skiHolBoo // What: Skip Holidays Check. Why: The explanation depends on the holiday setting. How: This picks one of the two phrases below based on skiHolBoo.


													? <React.Fragment>This picker <strong>will not run</strong> on major U.S. holidays. You can edit which days count as holidays, or even add your own, on the Settings page.</React.Fragment> // What: Holidays Skip Phrase. Why: The holiday note needs its own live wording for the skip-enabled state. How: This renders while skiHolBoo is true.

													: <React.Fragment>This picker <strong>will always run</strong>, even on major U.S. holidays.</React.Fragment> // What: Holidays Run Phrase. Why: The holiday note needs its own live wording for the always-run state. How: This renders while skiHolBoo is false.


												}


											</p>


										</div>


										<button
											id='np-skiphol'

											className={ ` switch   ${ skiHolBoo ? 'is-on' : '' } ` }

											data-element-name-hook='togSwiBut'

											type='button'

											aria-checked={ skiHolBoo }
											aria-label='Skip on holidays'
											role='switch'

											onClick={ () => setSkiHolBoo( ( preValBoo ) => !preValBoo ) }
										>{ /* What: Holiday Switch Button Element. Why: This is the actual on/off control for skipping holidays. How: This flips skiHolBoo on click. Its data-element-name-hook is read by help mode's Today catalog. */ }


											<i />{ /* What: Switch Dot Element. Why: This is the switch's own purely decorative sliding knob. How: This renders empty, positioned entirely via CSS off the "is-on" class on its parent button. */ }


										</button>


									</div>



									<div className='np-sched-toggle'>{ /* What: Avoid Duplicates Toggle Div Element. Why: The label/help text block and its own switch sit side by side. How: This wraps np-toggle-text and the switch button. */ }


										<div className='np-toggle-text'>{ /* What: Toggle Text Div Element. Why: The toggle's own label and live explanation belong together. How: This wraps the label and sub text below. */ }


											<label
												className='np-label'

												htmlFor='np-avoiddupes'
											>Avoid duplicate items</label>{ /* What: Avoid Duplicates Label Element. Why: The switch below needs an associated, readable label. How: This is linked to the switch via the shared 'np-avoiddupes' id. */ }

											<p
												key={ avoDupBoo ? 'on' : 'off' }

												className='np-help set-sub-fade'
											>{ /* What: Avoid Duplicates Help Paragraph Element. Why: The user should immediately see the practical consequence of the toggle's own current state. How: This is re-keyed by avoDupBoo so the text cross-fades on every change. */ }


												{ avoDupBoo // What: Avoid Duplicates Check. Why: The explanation depends on the duplicates setting. How: This picks one of the two phrases below based on avoDupBoo.


													? <React.Fragment>This picker <strong>won&rsquo;t pick</strong> an item whose name is already on today&rsquo;s todo list.</React.Fragment> // What: Avoid Duplicates On Phrase. Why: The duplicate-avoidance note needs its own live wording for the enabled state. How: This renders while avoDupBoo is true.

													: <React.Fragment>This picker <strong>may pick</strong> an item even if its name is already on today&rsquo;s todo list.</React.Fragment> // What: Avoid Duplicates Off Phrase. Why: The duplicate-avoidance note needs its own live wording for the disabled state. How: This renders while avoDupBoo is false.


												}


											</p>


										</div>


										<button
											id='np-avoiddupes'

											className={ ` switch   ${ avoDupBoo ? 'is-on' : '' } ` }

											data-element-name-hook='togSwiBut'

											type='button'

											aria-checked={ avoDupBoo }
											aria-label='Avoid duplicate items'
											role='switch'

											onClick={ () => setAvoDupBoo( ( preValBoo ) => !preValBoo ) }
										>{ /* What: Duplicates Switch Button Element. Why: This is the actual on/off control for avoiding duplicate items. How: This flips avoDupBoo on click. Its data-element-name-hook is read by help mode's Today catalog. */ }


											<i />{ /* What: Switch Dot Element. Why: This is the switch's own purely decorative sliding knob. How: This renders empty, positioned entirely via CSS off the "is-on" class on its parent button. */ }


										</button>


									</div>


								</div>


							</ColDisCom>


						</div>


					</div>



					<div className='np-footer np-footer--step1'>{ /* What: Footer Div Element. Why: The step's own guidance note and its Cancel/Next actions sit in one footer row. How: This wraps np-footer-note and np-footer-actions. */ }


						<div className='np-footer-note'>{ /* What: Footer Note Div Element. Why: The Step 1 footer explains what's still missing before Next works. How: This renders the note text below. */ }


							{ ( () => { // What: Footer Note Render. Why: The exact guidance sentence depends on which required field (if any) is still missing, and whether this is a create or an edit. How: This checks name/group completeness first, branching separately for edit versus create phrasing.


								const neeNamBoo = !newNamStr.trim(); // What: Need Name Boolean. Why: The guidance text needs to know specifically whether the name field is the one still missing. How: This is true whenever the trimmed name is empty.
								const neeGroBoo = !effGroStr;        // What: Need Group Boolean. Why: The guidance text needs to know specifically whether the group field is the one still missing. How: This is true whenever effGroStr resolves to nothing.


								if ( isaEdiBoo ) { // What: Edit Guidance Branch. Why: An edit's own missing-field wording differs slightly from create's. How: This covers the (ordinarily unreachable, since an existing picker already has both) case of the user clearing either field while editing.


									if ( neeNamBoo && neeGroBoo ) return 'A picker name and group are both required.'; // What: Both Missing Return. Why: Both fields being blank needs its own combined sentence. How: This is the first, most specific case checked.



									if ( neeNamBoo ) return 'A picker name is required.'; // What: Name Missing Return. Why: Only the name being blank needs its own sentence. How: This is checked once the combined case above is ruled out.



									if ( neeGroBoo ) return 'A group name is required.'; // What: Group Missing Return. Why: Only the group being blank needs its own sentence. How: This is checked once both prior cases are ruled out.



									return 'Everything looks good, click Save to save this picker’s new settings.'; // What: Ready Return. Why: Neither field is missing, so the user is ready to save. How: This is the final fallback once every missing-field case above is ruled out.


								}



								if ( neeNamBoo && neeGroBoo ) return 'A picker name and group are both required before advancing to the next step to create items for the picker’s list.'; // What: Both Missing Return. Why: Both fields being blank needs its own combined sentence for the create flow. How: This is the first, most specific case checked.



								if ( neeNamBoo ) return 'A picker name is required before advancing to the next step to create items for the picker’s list.'; // What: Name Missing Return. Why: Only the name being blank needs its own sentence for the create flow. How: This is checked once the combined case above is ruled out.



								if ( neeGroBoo ) return 'A group name is required before advancing to the next step to create items for the picker’s list.'; // What: Group Missing Return. Why: Only the group being blank needs its own sentence for the create flow. How: This is checked once both prior cases are ruled out.



								return <React.Fragment>Up next, create items to be included in this picker&rsquo;s list.</React.Fragment>; // What: Ready Return. Why: Neither field is missing, so the user is ready to advance to Step 2. How: This is the final fallback once every missing-field case above is ruled out.


							} )() }


						</div>

						<div className='np-footer-actions'>{ /* What: Footer Actions Div Element. Why: Cancel and the Save/Add Items button sit side by side. How: This wraps those two controls. */ }


							<ButBasCom
								kinValStr='ghost'

								onClick={ onCanForFun }
							>Cancel</ButBasCom>{ /* What: Button Base Component. Why: The user needs a way to back out of this form entirely. How: This calls onCanForFun. */ }



							{ isaEdiBoo ? ( // What: Edit Mode Check. Why: Editing saves right away, while creating still has an Items step. How: This picks the Save or Next button based on isaEdiBoo.


								<ButBasCom
									disabled={ !detReaBoo || conColBoo }
									icoNamStr='cheEle'
									kinValStr='primary'

									onClick={ subForFun }
								>Save</ButBasCom> // What: Button Base Component. Why: Editing only ever has one step, so this button both validates and commits. How: This calls subForFun directly, disabled until detReaBoo holds and no conditional name collides.


							) : ( // What: Add Items Branch. Why: Creating still has an Items step to fill in. How: This renders the else branch while isaEdiBoo is false.


								<ButBasCom
									className='ob-picker-next'

									data-element-name-hook='forNexBut'

									disabled={ !detReaBoo || conColBoo }
									icoNamStr='chvEle'
									kinValStr='primary'

									onClick={ advSteFun }
								>Add Items</ButBasCom> // What: Button Base Component. Why: Creating still has an Items step to fill in. How: This calls advSteFun to advance, disabled under the same conditions as the edit Save button above. Its data-element-name-hook is read by the picker mini-tours.


							) }


						</div>


					</div>


				</div>


			) : ( // What: Step Two Branch. Why: With forSteNum at 2, the Items step's own content shows instead. How: This renders the else branch, taken while forSteNum isn't 1.


				<div
					key='np-step2'

					className='tab-fade'
				>{ /* What: Step Two Fade Div Element. Why: Switching steps should play a fade transition, and React needs a stable key to treat each step as a distinct mounted instance. How: This wraps the whole Items step's own hint text, pool, and footer. */ }


					<p className='picker-hint'>{ /* What: Items Intro Hint Paragraph Element. Why: A first-time user needs to be reminded which picker/mode they're building items for. How: This renders the live-typed name (or a fallback) and the chosen mode's own label. */ }


						This is the list of items that your
						{ ' ' }{ newNamStr.trim() ? `“${ newNamStr.trim() }”` : 'this picker' } picker chooses from.
						Each time it runs it picks one of these items, following the
						{ ' ' }&ldquo;{ SED_NAM_OBJ.MOD_DEF_OBJ[ selModStr ].labStr }&rdquo; rule that you chose. You will need
						to add at least 2 items before you can finish creating this picker. You
						can always add, edit or remove items later.


					</p>

					{ selModStr === 'random' && ( // What: Random Note Check. Why: Only Truly Random has literally nothing extra to explain about its own items. How: This renders the note only for that mode.


						<p className='picker-hint np-weight-note'>Because you chose &ldquo;Truly Random&rdquo;, there are no extra controls to tweak for these items since they all have an equal chance of being picked.</p> // What: Random Note Paragraph Element. Why: A Truly Random picker has no per-item controls, which is worth saying. How: This renders a fixed explanation.


					) }

					{ selModStr === 'weighted' && ( // What: Weighted Note Check. Why: Weighted and Dynamic both introduce the per-item weight concept, worth explaining once items are being added. How: This renders the note only for that mode.


						<p className='picker-hint np-weight-note'>Because you chose &ldquo;Weighted&rdquo;, each item also has a weight. A higher weight means an item has a higher chance of being picked. e.g. a w2 item will be picked about twice as often as a w1. Leave them all at w1 for an even start, you can always change these later.</p> // What: Weighted Note Paragraph Element. Why: Weighted items carry a weight the user should understand. How: This renders a fixed explanation.


					) }

					{ selModStr === 'dynamic' && ( // What: Dynamic Note Check. Why: Same reasoning as the Weighted note above, worded to also quote the mode's own live label. How: This renders the note only for that mode.


						<p className='picker-hint np-weight-note'>Because you chose &ldquo;{ SED_NAM_OBJ.MOD_DEF_OBJ[ selModStr ].labStr }&rdquo;, each item also has a weight. A higher weight means an item has a higher chance of being picked. e.g. a w2 item will be picked about twice as often as a w1. Leave them all at w1 for an even start, you can always change these later.</p> // What: Dynamic Note Paragraph Element. Why: Dynamic items carry a weight plus a drift bonus the user should understand. How: This renders an explanation naming the chosen mode.


					) }

					{ selModStr === 'ease-up' && ( // What: Ease Up Note Check. Why: Ease Up/Ease Down both introduce the per-item drift-cadence concept, worth explaining once items are being added. How: This renders the note only for that mode.


						<p className='picker-hint np-weight-note'>Because you chose &ldquo;Ease Up&rdquo;, each item gets its own cadence. This is set per item below, since each item might need a different timeout period. For each one you will need to pick a soonest and a latest value, which will be used to determine its new value as it charges towards becoming eligible again.</p> // What: Ease Up Note Paragraph Element. Why: Ease Up items each need their own timeout band. How: This renders a fixed explanation.


					) }

					{ selModStr === 'ease-down' && ( // What: Ease Down Note Check. Why: Same reasoning as the Ease Up note above, worded for discharging instead of charging. How: This renders the note only for that mode.


						<p className='picker-hint np-weight-note'>Because you chose &ldquo;Ease Down&rdquo;, each item gets its own cadence. This is set per item below, since each item might need a different selection period. For each one you will need to pick a soonest and a latest value, which will be used to determine its new value as it discharges towards deselection.</p> // What: Ease Down Note Paragraph Element. Why: Ease Down items each need their own selection band. How: This renders a fixed explanation.


					) }

					{ iniForObj && !opeTouBoo && ( // What: Tour Name Field Check. Why: Only the empty-state quick-start prefill (not a real tour walkthrough) ever needs this redundant name field this deep into the form. How: This renders the field only when a prefill exists and it wasn't opened by a tour. // What: Tour Name Field Design Note. Why: The guided tour now walks through the Details sub-step normally (where the real name input already lives) before reaching Items, so this redundant field is only needed for the OTHER initial-prefill path. How: Today's "no pickers yet" quick-start card jumps straight here, which is the sole real remaining reason iniForObj can reach Step 2 without opeTouBoo.


						<div
							className='np-field np-tour-name'

							data-element-name-hook='forFieDiv'
						>{ /* What: Tour Name Field Div Element. Why: The label and input form one field unit. How: This wraps those two pieces. Its data-element-name-hook is read by the picker mini-tours. */ }


							<label
								className='np-label'

								htmlFor='np-tour-name'
							>Picker name</label>{ /* What: Picker Name Label Element. Why: The tour name field needs its own visible label, tied to the input below. How: This renders the literal text "Picker name" and points at np-tour-name through htmlFor. */ }

							<input
								id='np-tour-name'

								className='np-input'

								autoComplete='off'
								maxLength={ 40 }
								placeholder='e.g. Chores'
								type='text'
								value={ newNamStr }

								onChange={ ( chaEveObj ) => setNewNamStr( chaEveObj.target.value ) }
							/>{ /* What: Picker Name Input Element. Why: The tour-prefilled form still needs a real, editable name field. How: This is a controlled text input bound to newNamStr. */ }


						</div>


					) }



					<div className='np-pool'>{ /* What: Pool Div Element. Why: The empty-state message, the real pool list, and the add/edit slot below it all share this one section. How: This wraps whichever of those currently applies. */ }


						{ pooIteArr.filter( ( iteCurObj ) => iteCurObj.id !== actNewStr ).length === 0 && !actNewStr && ( // What: Empty Pool Check. Why: A pool with no committed items yet (and nothing currently being added) needs its own placeholder message. How: This renders the placeholder only under both conditions.


							<div className='np-pool-empty'>Nothing here yet. Add at least 2 items that this picker can choose between, so that there&rsquo;s a real choice to make.</div> // What: Empty Pool Div Element. Why: An empty draft pool needs a nudge toward adding items. How: This renders a fixed message.


						) }



						{ pooIteArr.filter( ( iteCurObj ) => iteCurObj.id !== actNewStr ).length > 0 && ( // What: Non-Empty Pool Check. Why: The real list only needs to render once at least one committed item actually exists. How: This renders pool-list only while that count is above 0.


							<div className='pool-list'>{ /* What: Pool List Div Element. Why: One row per committed draft item needs a shared list container. How: This maps every committed entry of pooIteArr to one row below. */ }


								{ pooIteArr.filter( ( iteCurObj ) => iteCurObj.id !== actNewStr ).map( ( curIteObj ) => { // What: Pool Row List Render. Why: Every committed draft item needs its own row, showing its own cadence/weight summary. How: This maps the filtered list to one row per curIteObj.


									const sooDayNum = covSooFun( curIteObj.easeMax ); // What: Soonest Day Number. Why: The row's own ease-meta text needs a human-readable soonest value. How: This converts curIteObj.easeMax back into days.
									const latDayNum = covLatFun( curIteObj.easeMin ); // What: Latest Day Number. Why: The row's own ease-meta text needs a human-readable latest value. How: This converts curIteObj.easeMin back into days.



									return (


										<div
											key={ curIteObj.id }

											className={ ` pool-row   ${ insDraStr === curIteObj.id ? 'pool-row--insert' : '' }   ${ conDelStr === curIteObj.id ? 'pool-row--confirm' : '' }   ${ rmvIdeStr === curIteObj.id ? 'pool-row--removing' : '' } ` }

											onAnimationEnd={ ( aniEveObj ) => { // What: On Animation End Handler. Why: A new row's slide-in and a deleted row's removal both finish on this row's own animation end. How: This clears the insert flag, and removes the draft item once its removal animation is done.


												if ( insDraStr === curIteObj.id ) setInsDraStr( null ); // What: Insert Clear Guard. Why: A just-added row's slide-in plays only once. How: This clears insDraStr when its animation belongs to this row.



												if ( rmvIdeStr === curIteObj.id && aniEveObj.target === aniEveObj.currentTarget ) { // What: Removal Finished Guard. Why: The item leaves the draft pool only after its own row finishes the removal animation. How: This checks the row is the one being removed and the event came from the row itself.


													draActObj.delIteFun( curIteObj.id ); // What: Remove Item Call. Why: The row's removal animation has finished, so the draft pool can drop it. How: This calls delIteFun with this row's id.
													setRmvIdeStr( null );                // What: Removing Clear Call. Why: The removal is finished. How: This resets rmvIdeStr to null.


												}


											} }
										>{ /* What: Row Div Element. Why: Every committed draft item needs one row, whichever of its own name/meta/actions or delete-confirm content currently applies. How: This carries this row's own transient animation classes, and commits the real removal once its own leaving keyframe finishes. */ }


											{ conDelStr === curIteObj.id ? ( // What: Delete Confirm Check. Why: A row pending delete confirmation replaces its own normal content entirely. How: This renders the confirm row while conDelStr matches this item, otherwise the row's real content below.


												<div className={ ` pool-confirm   ${ conLeaStr === curIteObj.id ? 'is-leaving' : '' } ` }>{ /* What: Confirm Div Element. Why: The delete question and its Cancel/Delete buttons form one block. How: This wraps pool-confirm-msg and pool-confirm-actions. */ }


													<span className='pool-confirm-msg'>Delete <strong>{ curIteObj.name }</strong>?</span>{ /* What: Confirm Message Span Element. Why: The user must see exactly which item they're about to remove from the draft. How: This renders curIteObj.name inside the fixed question text. */ }

													<div className='pool-confirm-actions'>{ /* What: Confirm Actions Div Element. Why: Cancel and Delete need to sit side by side. How: This wraps those two buttons. */ }


														<ButBasCom
															kinValStr='ghost'
															sizValStr='sm'

															onClick={ canConFun }
														>Cancel</ButBasCom>{ /* What: Button Base Component. Why: The user needs a clear way to back out of a delete they didn't mean to start. How: This calls canConFun. */ }



														<ButBasCom
															icoNamStr='traEle'
															kinValStr='danger'
															sizValStr='sm'

															onClick={ () => { // What: On Click Handler. Why: Confirming a delete starts the row's removal animation. How: This clears the confirm state and marks the row as removing.


																setConDelStr( null );         // What: Confirm Clear Call. Why: No row stays in its delete-confirm state. How: This resets conDelStr to null.
																setRmvIdeStr( curIteObj.id ); // What: Removing Set Call. Why: The row plays its removal animation before the item is dropped. How: This writes this row's id into rmvIdeStr.


															} }
														>Delete</ButBasCom>{ /* What: Button Base Component. Why: This is the actual confirmed removal action. How: This clears the confirm state and starts the row's own removal animation. */ }


													</div>


												</div>


											) : ( // What: Row Content Branch. Why: A row not pending delete confirmation shows its own normal name/meta/actions content instead. How: This renders the else branch, taken while conDelStr doesn't match this item.


												<React.Fragment>{ /* What: Row Content Fragment Element. Why: The name/meta block and the edit/delete actions below are true siblings with no shared wrapper of their own. How: This groups all of this draft row's own real content without adding an extra DOM node. */ }


													<div className='pool-name'>{ curIteObj.name }</div>{ /* What: Name Div Element. Why: Every row needs its own visible item name. How: This renders curIteObj.name. */ }

													<div className='pool-meta'>{ /* What: Meta Div Element. Why: The optional cadence summary and the optional weight pill sit side by side. How: This wraps both, each independently gated. */ }


														{ isaEasBoo && <span className='pool-ease-meta'>{ sooDayNum }&ndash;{ latDayNum } { CAD_NAM_OBJ.uniWorFun( cadCurObj.cadence, latDayNum ) }</span> }{ /* What: Ease Meta Span Check. Why: Only ease-up/ease-down items have a cadence summary worth showing. How: This renders the soonest-latest range, unit-worded per the picker's own cadence, only while isaEasBoo is true. */ }

														{ shoWeiBoo && <span className='pool-weight'>w{ curIteObj.weight }</span> }{ /* What: Weight Span Check. Why: Only weighted/dynamic items have a weight worth showing. How: This renders the raw weight only while shoWeiBoo is true. */ }


													</div>

													<div aria-hidden='true' />{ /* What: Spacer Div Element. Why: The row's own CSS grid still expects a cell in this column, even though the live pool's own drift/status pills have no equivalent here yet. How: This is an empty, hidden placeholder cell. */ }

													<button
														className='pool-edit'

														type='button'

														aria-label={ `Edit ${ curIteObj.name }` }
														title='Edit'

														onClick={ () => staDraFun( curIteObj.id ) }
													>{ /* What: Edit Pool Button Element. Why: Every row needs a way to open its own item in the shared editor slot below. How: This calls staDraFun with this row's own item id. */ }


														<IcoSvgCom
															icoNamStr='ediEle'
															sizValNum={ 15 }
														/>{ /* What: Icon Svg Component. Why: The edit action needs a recognizable pencil glyph. How: This renders the 'ediEle' icon at a fixed size. */ }


													</button>



													{ pooIteArr.filter( ( iteCurObj ) => iteCurObj.id !== actNewStr ).length <= 2 ? ( // What: Delete Guard Check. Why: A picker must always keep at least 2 committed items, so the last two rows can't offer a real delete button at all. How: This renders a disabled, explanatory InfTipCom instead of a working Delete button whenever the pool is at that floor.


														<InfTipCom
															className='pool-del is-disabled'

															actNamStr='Delete'
															labTexStr='Pickers require at least 2 items in their list, you need to add another item first or delete the entire picker instead.'
														>{ /* What: Info Tip Component. Why: The user should understand why Delete is unavailable rather than it just silently not working. How: This wraps the trash glyph with the explanatory tooltip above. */ }


															<IcoSvgCom
																icoNamStr='traEle'
																sizValNum={ 15 }
															/>{ /* What: Icon Svg Component. Why: The delete action needs a recognizable trash glyph. How: This renders the 'traEle' icon at a fixed size. */ }


														</InfTipCom>


													) : ( // What: Delete Button Branch. Why: With more than 2 committed items in the draft, a real working Delete button belongs here instead. How: This renders the else branch, taken while the draft pool is above that floor.


														<button
															className='pool-del'

															type='button'

															aria-label={ `Delete ${ curIteObj.name }` }

															onClick={ () => setConDelStr( curIteObj.id ) }
														>{ /* What: Delete Pool Button Element. Why: This starts this row's own delete-confirm flow. How: This writes curIteObj.id into conDelStr. */ }


															<IcoSvgCom
																icoNamStr='traEle'
																sizValNum={ 15 }
															/>{ /* What: Icon Svg Component. Why: The delete action needs a recognizable trash glyph. How: This renders the 'traEle' icon at a fixed size. */ }


														</button>


													) }


												</React.Fragment>


											) }


										</div>


									);


								}) }


							</div>


						) }



						<div
							ref={ addWraRef }

							className='pv-additem-wrap'

							data-element-name-hook='iteAddDiv'
						>{ /* What: Add Item Wrap Div Element. Why: The new-item form, an already-committed item's editor, and the plain "+ Add Item" button all share this one below-the-list slot. How: This wraps whichever of those three the IIFE below currently resolves to. Its data-element-name-hook is read by the picker mini-tours. */ }


							{ ( () => { // What: Additem Slot Render. Why: Exactly one of three things belongs in this slot at a time, easier to express as a small function than as a nested ternary. How: This checks ediIteStr first, then actNewStr, falling back to the plain button.


								if ( ediIteStr ) { // What: Committed Item Editor Branch. Why: An already-committed draft item's own editor takes priority whenever one is open. How: This looks up the item and renders its editor, or nothing if it vanished out from under itself.


									const ediLivObj = pooIteArr.find( ( iteCurObj ) => iteCurObj.id === ediIteStr ); // What: Editing Live Object. Why: The editor needs the exact current draft item record to open against. How: This looks up ediIteStr in pooIteArr.


									if ( !ediLivObj ) return null; // What: Missing Item Guard. Why: The item may have been removed via the row's own trash icon while this was open; that confirm flow already owns closing this out. How: This renders nothing rather than crashing against a missing item.



									return (


										<div
											className={ ` pv-newitem   rd-item   is-editing   ${ ediCloBoo ? 'is-closing' : '' } ` }

											onAnimationEnd={ ( aniEveObj ) => { // What: On Animation End Handler. Why: The draft item editor's own close animation must finish before its state clears. How: This clears the closing and open flags, then opens any editor requested meanwhile.


												if ( !ediCloBoo || aniEveObj.target !== aniEveObj.currentTarget ) return; // What: Not Closing Guard. Why: Only the editor's own closing animation should finish the close. How: This bails out unless ediCloBoo is set and the event came from this element.



												setEdiCloBoo( false ); // What: Closing Clear Call. Why: The close animation is over. How: This resets ediCloBoo to false.

												setEdiIteStr( null ); // What: Editor Clear Call. Why: No item's editor stays open. How: This resets ediIteStr to null.

												if ( penEdiRef.current ) { // What: Pending Editor Guard. Why: A different item's editor may have been requested while this one was closing. How: This opens it once this editor has finished closing.


													const tarIdeStr = penEdiRef.current; // What: Target Identifier String. Why: The pending editor request must be read before it's cleared. How: This copies penEdiRef.current.


													penEdiRef.current = null; // What: Pending Clear. Why: The request is being handled now, so it must not run twice. How: This resets penEdiRef to null.
													opeDraFun( tarIdeStr );   // What: Open Draft Call. Why: The editor the user asked for opens once the previous one has closed. How: This calls opeDraFun with tarIdeStr.


												}


											} }
										>{ /* What: Editing Item Wrap Div Element. Why: This is the whole committed-item editor slot, playing its own closing animation before actually unmounting. How: This reopens whatever edit staDraFun staged in penEdiRef once its own closing keyframe finishes. */ }


											<div
												className='rd-row'

												onClick={ ( clkEveObj ) => clkEveObj.stopPropagation() }
											>{ /* What: Row Div Element. Why: A click inside the name row must not bubble up to whatever the pool wrap itself listens for. How: This stops propagation on every click. */ }


												<span className='rd-main'>{ /* What: Main Span Element. Why: The name input needs the same wrapper the closed row's name uses. How: This wraps the input below. */ }


													<input
														className='rd-name-input'

														data-element-name-hook='rowNamInp'

														autoFocus
														maxLength={ 60 }
														placeholder='Item name'
														type='text'
														value={ ediLivObj.name }

														aria-label='Item name'

														onBlur={ ( bluEveObj ) => { // What: On Blur Handler. Why: Leaving the name field commits a tidied name. How: This trims the value and renames the draft item when it's non-empty.


															const newNamStr = bluEveObj.target.value.trim(); // What: New Name String. Why: A blur commit should tidy the name, not keep stray whitespace. How: This trims the input's current value.


															if ( newNamStr ) draActObj.renIteFun( ediLivObj.id, newNamStr ); // What: Rename Item Guard. Why: A blank name must never be committed. How: This renames the draft item only when newNamStr is non-empty.


														} }
														onChange={ ( chaEveObj ) => draActObj.updIteFun( ediLivObj.id, { name : chaEveObj.target.value } ) }
														onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Enter' ) keyEveObj.currentTarget.blur(); } }
													/>{ /* What: Name Input Element. Why: This is the actual live-typed name field for the item being edited. How: This writes into draActObj on every change, and commits the rename on blur. Its data-element-name-hook is read by the picker mini-tours. */ }


												</span>


											</div>

											<div className='rd-edit'>{ /* What: Edit Div Element. Why: EntEdiCom's own weight/ease/vacation controls need their own slot below the name row, wired to the draft instead of the real store. How: This wraps a single EntEdiCom instance bound to draActObj. */ }


												<EntEdiCom
													key={ ediLivObj.id }

													actStoObj={ draActObj }
													iteDatObj={ ediLivObj }
													picDatObj={ draPicObj }
													picIteArr={ pooIteArr }

													onCloEdiFun={ () => setEdiCloBoo( true ) }
												/>{ /* What: Entry Editor Component. Why: Editing a pool item reuses the exact item editor Today and Data use. How: This is passed the live item, the picker, and the actions it edits through. */ }{ /* What: Editor Key Design Note. Why: See PicVieCom's own EntEdiCom for why a key on ediLivObj.id matters when switching directly between two items' editors. How: No onCancel is passed below, matching the live tab too: this item already exists (within the draft), so EntEdiCom's own internal Cancel/Escape handling (revert via draActObj.revIteFun, then close) is correct as-is with no extra bookkeeping needed here. */ }


											</div>


										</div>


									);


								}



								const newIteObj = pooIteArr.find( ( iteCurObj ) => iteCurObj.id === actNewStr ); // What: New Item Object. Why: The branch below needs a stable local alias to check and render from. How: This looks up actNewStr in pooIteArr.


								if ( !newIteObj ) return ( // What: No Draft Branch. Why: When neither a committed edit nor a new draft is open, the plain add button belongs in this slot. How: This returns the "+ Add Item" button directly.


									<button
										className='pv-additem-btn'

										data-element-name-hook='iteAddBut'

										type='button'

										onClick={ addDraFun }
									>{ /* What: Add Item Button Element. Why: This starts a brand-new item draft in the pool. How: This calls the add handler on click, disabled during the matching tour step. Its data-element-name-hook is read by the Pickers page tour and the picker mini-tours. */ }


										<IcoSvgCom
											icoNamStr='pluEle'
											sizValNum={ 14 }
										/>{ /* What: Icon Svg Component. Why: The button needs a recognizable "add" glyph beside its own label. How: This renders the 'pluEle' icon at a fixed size. */ } Add Item


									</button>


								);



								return (


									<div
										className={ ` pv-newitem   rd-item   is-editing   ${ actCloStr ? 'is-closing' : '' } ` }

										onAnimationEnd={ ( aniEveObj ) => { // What: On Animation End Handler. Why: The new draft item's own close animation must finish before the add is kept or dropped. How: This keeps or discards the draft, clears the add state, then opens any editor requested meanwhile.


											if ( !actCloStr || aniEveObj.target !== aniEveObj.currentTarget ) return; // What: Not Closing Guard. Why: Only the new item's own closing animation should finish the add. How: This bails out unless actCloStr is set and the event came from this element.



											const savIdeStr = newIteObj.id; // What: Saved Identifier String. Why: The new item's id is needed after the draft state below is cleared. How: This copies newIteObj.id.


											if ( actCloStr === 'save' ) setInsDraStr( savIdeStr ); // What: Commit Save Branch. Why: A successful save should commit the newly-inserted item's own draft id so later UI can find it. How: This calls setInsDraStr with savIdeStr.

											else draActObj.delIteFun( savIdeStr ); // What: Discard Draft Branch. Why: Any other closing reason (cancel, etc.) should just discard the in-progress draft item entirely. How: This calls draActObj.delIteFun with savIdeStr.



											setActCloStr( false ); // What: Closing Clear Call. Why: The close animation is over. How: This resets actCloStr to false.

											setActNewStr( null ); // What: Active New Clear Call. Why: No new item is being added anymore. How: This resets actNewStr to null.

											if ( penEdiRef.current ) { // What: Pending Editor Guard. Why: A different item's editor may have been requested while this one was closing. How: This opens it once this editor has finished closing.


												const tarIdeStr = penEdiRef.current; // What: Target Identifier String. Why: The pending editor request must be read before it's cleared. How: This copies penEdiRef.current.


												penEdiRef.current = null; // What: Pending Clear. Why: The request is being handled now, so it must not run twice. How: This resets penEdiRef to null.
												opeDraFun( tarIdeStr );   // What: Open Draft Call. Why: The editor the user asked for opens once the previous one has closed. How: This calls opeDraFun with tarIdeStr.


											}


										} }
									>{ /* What: New Item Wrap Div Element. Why: This is the whole new-item draft editor slot, playing its own closing animation before actually keeping or discarding it. How: This flags the row for its own insert animation only when actCloStr is 'save', otherwise removes it, then reopens whatever staDraFun staged in penEdiRef. */ }


										<div
											className='rd-row'

											onClick={ ( clkEveObj ) => clkEveObj.stopPropagation() }
										>{ /* What: Row Div Element. Why: A click inside the name row must not bubble up to whatever the pool wrap itself listens for. How: This stops propagation on every click. */ }


											<span className='rd-main'>{ /* What: Main Span Element. Why: The name input needs the same wrapper the closed row's name uses. How: This wraps the input below. */ }


												<input
													className='rd-name-input'

													data-element-name-hook='rowNamInp'

													autoFocus
													maxLength={ 60 }
													placeholder='Item name'
													type='text'
													value={ newIteObj.name }

													aria-label='Item name'

													onBlur={ ( bluEveObj ) => { // What: On Blur Handler. Why: Leaving the name field commits a tidied name. How: This trims the value and renames the draft item when it's non-empty.


														const newNamStr = bluEveObj.target.value.trim(); // What: New Name String. Why: A blur commit should tidy the name, not keep stray whitespace. How: This trims the input's current value.


														if ( newNamStr ) draActObj.renIteFun( newIteObj.id, newNamStr ); // What: Rename Item Guard. Why: A blank name must never be committed. How: This renames the draft item only when newNamStr is non-empty.


													} }
													onChange={ ( chaEveObj ) => draActObj.updIteFun( newIteObj.id, { name : chaEveObj.target.value } ) }
													onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Enter' ) keyEveObj.currentTarget.blur(); } }
												/>{ /* What: Name Input Element. Why: This is the actual live-typed name field for the item being newly added. How: This writes into draActObj on every change, and commits the rename on blur. Its data-element-name-hook is read by the picker mini-tours. */ }


											</span>


										</div>

										<div className='rd-edit'>{ /* What: Edit Div Element. Why: EntEdiCom's own weight/ease/vacation controls need their own slot below the name row. How: This wraps a single EntEdiCom instance bound to draActObj. */ }


											<EntEdiCom
												actStoObj={ draActObj }
												iteDatObj={ newIteObj }
												picDatObj={ draPicObj }
												picIteArr={ pooIteArr }

												onCanEdiFun={ () => setActCloStr( 'cancel' ) }
												onCloEdiFun={ () => setActCloStr( 'save' ) }
											/>{ /* What: Entry Editor Component. Why: The new-item draft reuses the exact item editor Today and Data use. How: This is passed the draft item, the picker, and the draft actions. */ }


										</div>


									</div>


								);


							} )() }


						</div>


					</div>



					<div className='np-footer'>{ /* What: Footer Div Element. Why: The step's own guidance note and its Back/Create actions sit in one footer row. How: This wraps np-footer-note and np-footer-actions. */ }


						<div className='np-footer-note'>{ /* What: Footer Note Div Element. Why: The exact guidance sentence depends on how many committed items exist and whether weight is relevant. How: This branches on enoIteBoo first, then shoWeiBoo, otherwise counting toward the 2-item minimum. */ }


							{ !enoIteBoo // What: Not Enough Items Check. Why: The footer note either says how many more items are needed or confirms the minimum is met. How: This picks the add-more message first, then the weight or minimum message.


								? `Add at least 2 items to create this picker${ comCouNum === 1 ? ' (1 so far)' : '' }.` // What: Add More Message. Why: A picker needs at least 2 items to be a real choice. How: This notes the one item added so far, when there is one.

								: shoWeiBoo // What: Show Weight Check. Why: Weighted pools get a hint about setting weights. How: This checks shoWeiBoo.

								? 'Looks good, set each item’s weight above, or leave them even.' // What: Weight Hint Message. Why: The minimum is met and weights are worth a look. How: This renders a fixed sentence.

								: `Minimum number of items added (${ comCouNum } so far). You can always add more items later.` // What: Minimum Met Message. Why: The minimum is met with no weights to set. How: This names the item count so far.


							}


						</div>

						<div className='np-footer-actions'>{ /* What: Footer Actions Div Element. Why: Back and Create Picker sit side by side. How: This wraps those two buttons. */ }


							<ButBasCom
								kinValStr='ghost'

								onClick={ bacSteFun }
							>Back</ButBasCom>{ /* What: Button Base Component. Why: The user needs a way to return to Step 1 without losing their in-progress items. How: This calls bacSteFun. */ }



							<ButBasCom
								className='ob-picker-create'

								data-element-name-hook='forCreBut'

								disabled={ !enoIteBoo || conColBoo }
								icoNamStr='cheEle'
								kinValStr='primary'

								onClick={ subForFun }
							>Create Picker</ButBasCom>{ /* What: Button Base Component. Why: This is the actual final commit for a brand-new picker. How: This calls subForFun, disabled until enoIteBoo holds and no conditional name collides. Its data-element-name-hook is read by the picker mini-tours. */ }


						</div>


					</div>


				</div>


			) }


		</div>


	);


}

// #endregion PicForCom

// #endregion Components



// #region Exports

export { PicForCom }; // What: Named Export. Why: The Pickers tab renders this form to create a picker, and a picker's own view renders it to edit that picker's details. How: This exports PicForCom by name.

// #endregion Exports


