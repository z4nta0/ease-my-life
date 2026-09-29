


// #region Imports

import cssModObj from './picker-controls.module.css'; // What: CSS Module Object. Why: PicConCom's own styles live in its module. How: Each className reads its hashed class from here.
import React     from 'react';                       // What: React. Why: PicConCom is built directly on React's own APIs. How: This is used directly (React.useCallback, React.useEffect, React.useLayoutEffect, React.useMemo, React.useRef, React.useState, React.Fragment) instead of importing individual named hooks.


import { ButBasCom   } from '../../ui/button.jsx';          // What: Button Base Component. Why: PicConCom's own footer and inline actions need consistently-styled buttons. How: This is rendered throughout PicConCom.
import { CAD_NAM_OBJ } from '../../core/cadence.js';        // What: Cadence. Why: PicConCom needs the shared cadence math/summary helpers to render its own "how often" tip and select options. How: This is called throughout PicConCom for tipMesFun/sumCadFun/dimCouFun/uniWorFun/locTipFun.
import { CAD_OPT_ARR } from '../../ui/cadence-control.jsx'; // What: Cadence Options Array. Why: PicConCom's own daily-cadence summary needs the same daily-cadence sub-explanation CadConCom itself uses. How: This is looked up by key 'daily' inside PicConCom's cadence-summary block.
import { ColDisCom   } from '../../ui/collapse.jsx';        // What: Collapse Disclosure Component. Why: PicConCom's own sub-sections open and close with the same collapse-height animation as every other disclosure. How: This wraps each of those bodies, driven by the matching open boolean.
import { dimCouFun   } from '../../utils/date.js';          // What: Days-In-Month Count Function. Why: Monthly and yearly clamping need a month's real length. How: This is called with a year and 1-based month.
import { FilButCom   } from '../../ui/fill-button.jsx';     // What: Fill Button Component. Why: An ease-up/ease-down picker's Item Controls need the same Fill/Refill-all control Today's own boost tools use. How: This is rendered inside PicConCom's Item Controls group.
import { IcoSvgCom   } from '../../ui/icon.jsx';            // What: Icon Svg Component. Why: PicConCom's own buttons and rows need recognizable glyphs. How: This is rendered throughout PicConCom.
import { InfTipCom   } from '../../ui/info-tip.jsx';        // What: Info Tip Component. Why: A disabled control or a truncated label still needs to explain itself on demand. How: This wraps those controls throughout PicConCom.
import { norGroFun   } from '../../core/pickers.js';        // What: Normalize Group Function. Why: A newly-typed picker group needs the same tidy-casing rule picker names already use. How: This is called when committing PicConCom's own "+ New Group" inline input.
import { ordSufFun   } from '../../utils/date.js';          // What: Ordinal Suffix Function. Why: Schedule summaries read days as ordinals like 1st or 22nd. How: This is called with the day number.
import { redMotFun   } from '../../utils/motion.js';        // What: Reduce Motion Function. Why: A user who prefers reduced motion shouldn't see PicConCom's own scroll or collapse animations. How: This is checked before each of those animations.
import { SED_NAM_OBJ } from '../../state/seed.js';          // What: Seed Namespace Object. Why: Every picker mode's own label and hint text comes from this shared catalog. How: This is read (MOD_DEF_OBJ) in PicConCom for the mode radio group.
import { togFadFun   } from '../../ui/edge-fade.js';        // What: Toggle Fade Function. Why: Every scrolling rail in this file hides each edge fade once that edge is reached. How: This is called by each rail's own scroll and resize handlers.
import { WeeChiCom   } from '../../ui/weekday-chips.jsx';   // What: Weekday Chip Component. Why: PicConCom's own Days control needs the same weekday multi-select every other schedule editor uses. How: This is rendered inside PicConCom's "When it runs" group.


import '../../ui/edit-guard.js'; // What: Edit Guard Import. Why: This file arms and disarms window.__editGuard, which only exists once edit-guard.js has run. How: This is imported purely for that side effect.

// #endregion Imports



/**
 * picker-controls.jsx = Picker Controls
 *
 * @summary
 * A Data tab picker card's own Controls body: how the picker picks (its type
 * and ease band), when it runs (its weekdays, holiday skip, and
 * daily-generator membership), and its item controls (Fill/Refill). It
 * snapshots the picker on mount so Cancel can revert every change, and swaps
 * in a no-Delete footer for a brand-new draft picker.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

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



		const updFadFun = () => togFadFun( raiCurEle ); // What: Update Fade Function. Why: The rail's own edge-fade classes must reflect whether it can currently scroll, and how far. How: This calls togFadFun on raiCurEle.


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



		const firMapObj = fliFirRef.current;                                                            // What: First Map Object. Why: This is the map of each pill's own previous x position, read and then overwritten below. How: This is read once from fliFirRef.current and reused throughout this effect run.
		const pilNodArr = [ ...raiCurEle.querySelectorAll( '[data-element-name-hook~="conPilBut"]' ) ]; // What: Pill Node Array. Why: Every currently-rendered pill needs to be measured and possibly animated. How: This queries every '.cnd-pill' element inside the rail and spreads the NodeList into a real array.
		const redMotBoo = redMotFun();                                                                  // What: Reduce Motion Boolean. Why: A user who prefers reduced motion should never see this FLIP tween. How: This is checked once per run and read by every pill below.


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



		const pilNodArr = [ ...groCurEle.querySelectorAll( '[data-element-name-hook~="groPilBut"]' ) ]; // What: Pill Node Array. Why: Every currently-rendered group pill needs to be checked for movement. How: This queries every '.picker-group-pill' element inside the row and spreads the NodeList into a real array.
		const preMapObj = groFliRef.current;                                                            // What: Previous Map Object. Why: A FLIP tween needs each pill's own position from before this render's reorder. How: This reads whatever the previous run of this effect recorded.


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


	React.useEffect( () => { // What: Group Pills Fade Effect. Why: The group pill row's own scroll-edge fades (only visible once it actually overflows on small screens) need to track its live scroll position. How: This toggles the scroll-edge attributes the same way every other pill rail in this file does, and re-checks on scroll/resize.


		const groCurEle = groPilRef.current; // What: Group Current Element. Why: There is nothing to wire up before the row itself has mounted. How: This reads the live node from groPilRef.


		if ( !groCurEle ) return; // What: No Element Guard. Why: The row may not be mounted yet. How: This bails out of the effect early when there is no row to wire up.



		const updFadFun = () => togFadFun( groCurEle ); // What: Update Fade Function. Why: The fade classes need recomputing on every relevant change. How: This calls togFadFun on groCurEle.


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


		<div className={ cssModObj.rdCtlBody }>{ /* What: Controls Body Div Element. Why: This is PicConCom's own root element, holding Picker Details, How it picks, When it runs, Item Controls, and the footer. How: This renders as a plain div; every field below commits through actStoObj. */ }


			<div className={` ${ cssModObj.rdCtlGroup }   ${ cssModObj.rdCtlGroupBasics } `}>{ /* What: Basics Group Div Element. Why: Name and Group are grouped as the picker's own basic identity fields. How: This wraps the subhead and the name/group rows below. */ }


				<div className={ cssModObj.rdCtlSubhead }>Picker Details</div>{ /* What: Basics Subhead Div Element. Why: Every Controls group needs its own labeled subhead. How: This renders the literal text "Picker Details". */ }

				<div
					className={ cssModObj.rdBasicsRow }

					data-element-name-hook='basRowDiv'
				>{ /* What: Name Row Div Element. Why: The Name field needs its own labeled row. How: This wraps the label span and the name input. Its data-element-name-hook is read by help mode's Data catalog. */ }


					<span className={ cssModObj.rdBasicsLbl }>Name</span>{ /* What: Name Label Span Element. Why: The name input needs a visible label beside it. How: This renders the literal text "Name". */ }

					<input
						className={ cssModObj.rdBasicsName }

						data-element-name-hook='basNamInp'

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
					/>{ /* What: Name Input Element. Why: A picker's own name is edited live rather than through a separate form. How: This commits every keystroke immediately, tidies/commits the final name on blur, and blurs on Enter. Its data-element-name-hook is read by help mode's Data catalog. */ }


				</div>


				<div
					className={` ${ cssModObj.rdBasicsRow }   ${ cssModObj.rdBasicsRowGroup } `}

					data-element-name-hook='basGroDiv'
				>{ /* What: Group Row Div Element. Why: The Group field needs its own labeled row. How: This wraps the label span and the group pill selector below. Its data-element-name-hook is read by help mode's Data catalog. */ }


					<span className={ cssModObj.rdBasicsLbl }>Group</span>{ /* What: Group Label Span Element. Why: The group selector needs a visible label beside it. How: This renders the literal text "Group". */ }

					<div
						ref={ groPilRef }

						className={ cssModObj.rdGroupPills }

						aria-label='Picker group'
						role='radiogroup'
					>{ /* What: Group Pills Div Element. Why: This is the actual radiogroup of every existing group plus the inline "+ New Group" control. How: This maps groChoArr to one pill each, then either the inline input or the "+ New Group" pill. */ }


						{ groChoArr.map( ( groCurStr ) => ( // What: Group Choice Map. Why: One pill is needed per existing group choice. How: This maps groChoArr to one radio-role button each, keyed by its own name.


							<button
								key={ groCurStr }

								className={ cssModObj.pickerGroupPill }

								data-element-name-hook='groPilBut'
								data-g={ groCurStr }

								type='button'

								aria-checked={ picDatObj.group === groCurStr }
								role='radio'

								onClick={ () => actStoObj.updPicFun( picDatObj.id, { group : groCurStr } ) }
							>{ groCurStr }</button> // What: Group Pill Button Element. Why: Clicking a pill selects that group for this picker. How: This marks itself checked when it matches picDatObj.group and commits groCurStr on click. Its data-element-name-hook is read by PicConCom's own group-rail scrolling.


						) ) }

						{ newGroBoo ? ( // What: New Group Mode Check. Why: The inline create control replaces the "+ New Group" pill entirely while active. How: This renders the input+confirm+cancel trio while newGroBoo is true, otherwise the trigger pill.


							<span className={ cssModObj.rdGroupNew }>{ /* What: New Group Span Element. Why: The inline input and its 2 icon buttons need one wrapper to lay out together. How: This groups the text input with its own confirm and cancel buttons. */ }


								<input
									ref={ newGroRef }

									className={ cssModObj.rdGroupNewInput }

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
									className={ cssModObj.rdGroupNewOk }

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
									className={ cssModObj.rdGroupNewCancel }

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
								className={` ${ cssModObj.pickerGroupPill }   ${ cssModObj.pickerGroupPillNew }   ${ pilRetBoo ? cssModObj.isReturning : '' } `}

								data-element-name-hook='groPilBut'

								type='button'

								onClick={ () => setNewGroBoo( true ) }
							>{ /* What: New Group Trigger Button Element. Why: This is the affordance that opens the inline create control. How: This opens newGroBoo on click, and plays its own return animation via pilRetBoo after a prior close. Its data-element-name-hook is read by PicConCom's own group-rail scrolling. */ }


								<IcoSvgCom
									icoNamStr='pluEle'
									sizValNum={ 13 }
								/>{ /* What: Icon Svg Component. Why: The trigger pill needs a recognizable "add" glyph beside its own label. How: This renders the 'pluEle' icon at a fixed size. */ } New Group


							</button>


						) }


					</div>


				</div>


			</div>



			<fieldset
				className={` ${ cssModObj.rdCtlGroup }   ${ cssModObj.rdCtlGroupPicks } `}

				data-element-name-hook='picCtlFie'
			>{ /* What: Picks Group Fieldset Element. Why: The mode radio group is a real form control set and belongs in a fieldset. How: This wraps the legend and the mode radio group below. Its data-element-name-hook is read by help mode's Data catalog. */ }


				<legend className={ cssModObj.rdCtlSubhead }>How it picks</legend>{ /* What: Picks Legend Element. Why: A fieldset needs its own legend to label the radio group it contains. How: This renders the literal text "How it picks". */ }

				<div
					className={ cssModObj.rdModeRadio }

					data-element-name-hook='modRadDiv'
				>{ /* What: Mode Radio Div Element. Why: Every supported mode needs its own selectable row. How: This maps Object.entries(SED_NAM_OBJ.MOD_DEF_OBJ) to one label+radio+hint per mode. Its data-element-name-hook is read by help mode's Pickers catalog and help mode's Data catalog. */ }


					{ Object.entries( SED_NAM_OBJ.MOD_DEF_OBJ ).map( ( [ modKeyStr, modValObj ] ) => { // What: Mode Entries Map. Why: One row is needed per supported picking mode. How: This maps every [key, definition] pair in SED_NAM_OBJ.MOD_DEF_OBJ to one label below.


						const modSelBoo = picDatObj.mode === modKeyStr; // What: Mode Selected Boolean. Why: The row's own selected state and its hint's open state both depend on whether this mode is the picker's current one. How: This compares modKeyStr against picDatObj.mode.



						return (


							<label
								key={ modKeyStr }

								className={ cssModObj.rdModeOpt }

								data-option-select-active={ modSelBoo || undefined }
							>{ /* What: Mode Option Label Element. Why: Each mode is a real radio option, so its own label must wrap the input for a clickable hit area. How: This marks itself with data-option-select-active when modSelBoo is true. */ }


								<input
									name={ `mode_${ picDatObj.id }` }

									checked={ modSelBoo }
									type='radio'

									onChange={ () => actStoObj.updPicFun( picDatObj.id, { mode : modKeyStr } ) }
								/>{ /* What: Mode Radio Input Element. Why: This is the actual selectable control for this mode. How: This is checked when modSelBoo is true and commits modKeyStr as the picker's own mode on change. */ }

								<span
									className={ cssModObj.rdModeDot }

									aria-hidden='true'
								></span>{ /* What: Mode Dot Span Element. Why: The custom radio dot is drawn purely with CSS rather than the native control. How: This is an empty, decorative, screen-reader-hidden span. */ }

								<span className={ cssModObj.rdModeText }>{ /* What: Mode Text Span Element. Why: The mode's own name and its expandable hint need to sit together beside the radio dot. How: This wraps the name span and the ColDisCom-wrapped hint below. */ }


									<span className={ cssModObj.rdModeName }>{ modValObj.labStr }</span>{ /* What: Mode Name Span Element. Why: Every mode needs its own visible name. How: This renders modValObj's own label. */ }



									<ColDisCom
										isaInsBoo={ isaNewBoo }
										open={ modSelBoo }
									>{ /* What: Collapse Disclosure Component. Why: The hint expands/collapses on selection change, so the old row's hint folds away while the new one grows. How: This opens only for the currently-selected mode, instant (no animation) for a brand-new draft. */ }


										{ Array.isArray( modValObj.hinArr ) // What: Hint Content Check. Why: A mode's own hint can be either one paragraph or several. How: This maps every paragraph to its own span when hint is an array, otherwise renders the single hint directly.


											? modValObj.hinArr.map( ( parCurStr, parIndNum ) => ( // What: Paragraph Hints Branch. Why: A multi-paragraph hint needs one span per paragraph. How: This maps each paragraph string to its own hint span.


												<span
													key={ parIndNum }

													className={ cssModObj.rdModeHint }
												>{ parCurStr }</span> // What: Hint Paragraph Span Element. Why: Each paragraph renders as its own hint line. How: This renders parCurStr, keyed by its index.


											) )

											: <span className={ cssModObj.rdModeHint }>{ modValObj.hinArr }</span> // What: Single Hint Branch. Why: A one-paragraph hint needs just one span. How: This renders modValObj.hinArr directly.


										}


									</ColDisCom>


								</span>


							</label>


						);


					} ) }


				</div>


			</fieldset>


			<div className={` ${ cssModObj.rdCtlGroup }   ${ cssModObj.rdCtlGroupSched } `}>{ /* What: Schedule Group Div Element. Why: Attach-a-conditional and daily-generator membership + weekday/holiday gates all describe "when it runs". How: This wraps the subhead and every schedule row below. */ }


				<div className={ cssModObj.rdCtlSubhead }>When it runs</div>{ /* What: Schedule Subhead Div Element. Why: Every Controls group needs its own labeled subhead. How: This renders the literal text "When it runs". */ }

				<div
					className={ cssModObj.schedLine }

					data-element-name-hook='schLinDiv'
				>{ /* What: Conditional Line Div Element. Why: The attach-a-conditional toggle needs its own labeled row. How: This wraps the label/sub text and the switch button below. Its data-element-name-hook is read by help mode's Data catalog. */ }


					<span className={ cssModObj.schedLineLabel }>{ /* What: Conditional Label Span Element. Why: The toggle's own name and live explanation belong together. How: This wraps the lbl and sub spans below. */ }


						<span className={ cssModObj.schedLineLbl }>Attach a conditional</span>{ /* What: Conditional Label Span Element. Why: The row needs its own literal name. How: This renders the literal text "Attach a conditional". */ }

						<span className={ cssModObj.schedLineSub }>{ /* What: Conditional Sub Span Element. Why: The row needs a live one-line explanation of the current state. How: This renders whichever of the 2 explanations below matches whether a conditional is attached. */ }


							{ attConObj // What: Attached Conditional Check. Why: The explanation depends on whether a conditional is attached. How: This picks one of the 2 phrases below based on attConObj.


								? <>triggering rules provided by <strong>{ attConObj.name }</strong> will prevent this picker from running</> // What: Attached Phrase. Why: With a conditional attached, its own triggering rules can stop this picker. How: This names the attached conditional.

								: <>picker <strong>will always run</strong>, attaching a conditional will provide a trigger to prevent it from running</> // What: Unattached Phrase. Why: With nothing attached, the picker always runs, so the phrase suggests attaching one. How: This renders a fixed explanation.


							}


						</span>


					</span>

					<button
						className={ cssModObj.switch }

						data-element-name-hook='togSwiBut'

						aria-checked={ conAttBoo }
						aria-label='Attach a conditional'
						role='switch'

						onClick={ () => setConAttBoo( ( preValBoo ) => { // What: On Click Handler. Why: Flipping the switch off must also detach whatever conditional is attached. How: This toggles conAttBoo through its functional setter, clearing conditionalId when the new state is off.


							const nexValBoo = !preValBoo; // What: Next Value Boolean. Why: The toggle's own next state is simply the opposite of its current one. How: This negates preValBoo.


							if ( !nexValBoo && picDatObj.conditionalId ) actStoObj.updPicFun( picDatObj.id, { conditionalId : null } ); // What: Detach Conditional Guard. Why: Turning the toggle off must also actually detach whatever conditional was attached. How: This clears conditionalId only when the toggle is turning off and one was actually set.



							return nexValBoo; // What: Next Value Return. Why: setConAttBoo needs the toggle's own new state back. How: This returns nexValBoo.


						} ) }
					><i />{ /* What: Switch Dot Element. Why: This is the switch's own purely decorative sliding knob. How: This renders empty, positioned entirely via CSS off its parent button's own aria-checked or aria-pressed. */ }</button>{ /* What: Conditional Switch Button Element. Why: This is the actual on/off control for attaching a conditional. How: This flips conAttBoo and, when turning off, clears the picker's own conditionalId. Its data-element-name-hook is read by help mode's Today catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


				</div>



				<ColDisCom open={ conAttBoo }>{ /* What: Collapse Disclosure Component. Why: The conditional rail only needs to exist while the toggle is on. How: This opens only while conAttBoo is true. */ }


					<div
						className={ cssModObj.rdCndRailRow }

						data-element-name-hook='conRowDiv'
					>{ /* What: Rail Row Div Element. Why: The conditional rail (or its empty-state message) needs its own row. How: This wraps whichever of the 2 branches below applies. Its data-element-name-hook is read by help mode's Data catalog. */ }


						{ conIteArr.length ? ( // What: Has Conditionals Check. Why: The rail only makes sense once at least one conditional exists. How: This renders the rail when conIteArr has entries, otherwise an empty-state message.


							<div
								ref={ raiRefFun }

								className={ cssModObj.cndRail }

								data-element-name-hook='conRaiDiv'
							>{ /* What: Conditional Rail Div Element. Why: This is the actual scrollable pill rail, alphabetical except the attached conditional pins to the front. How: This maps every conditional (sorted per pk.conditionalId first, then by name) to one pill each. Its data-element-name-hook is read by help mode's Pickers catalog and help mode's Data catalog. */ }


								{ [ ...conIteArr ].sort( ( conOneObj, conTwoObj ) => { // What: Attached-First Sort Comparator. Why: The rail pins the attached conditional first, then lists the rest alphabetically. How: This sorts a copy of conIteArr with the rules below.


									if ( conOneObj.id === picDatObj.conditionalId ) return -1; // What: Attached First Guard. Why: The currently-attached conditional always pins to the front. How: This sorts conOneObj ahead whenever it's the attached one.



									if ( conTwoObj.id === picDatObj.conditionalId ) return 1; // What: Attached First Guard. Why: Same reasoning as above, for the other comparison side. How: This sorts conTwoObj ahead whenever it's the attached one.



									return conOneObj.name.localeCompare( conTwoObj.name ); // What: Alphabetical Fallback Return. Why: Every other pair sorts alphabetically by name. How: This compares conOneObj.name against conTwoObj.name.


								} ).map( ( conCurObj ) => ( // What: Conditional Pill Map. Why: One pill is needed per existing conditional. How: This maps the sorted list to one button each, keyed by its own id.


									<button
										key={ conCurObj.id }

										className={ cssModObj.cndPill }

										data-cid={ conCurObj.id }
										data-element-name-hook='conPilBut'
										data-pill-select-active={ picDatObj.conditionalId === conCurObj.id || undefined } // What: Pill Select Active Attribute. Why: The attached conditional's pill should stand out. How: This sets the presence-only attribute while this conditional is the picker's own.

										type='button'

										onClick={ () => actStoObj.updPicFun( picDatObj.id, { conditionalId : conCurObj.id } ) }
									>{ /* What: Conditional Pill Button Element. Why: Clicking a pill attaches that conditional to this picker. How: This marks itself with data-pill-select-active when it matches picDatObj.conditionalId and commits conCurObj.id on click. Its data-element-name-hook is read by PicConCom's own conditional-rail scrolling. */ }


										<span className={ cssModObj.cndPillName }>{ conCurObj.name }</span>{ /* What: Pill Name Span Element. Why: Every conditional pill needs its own visible name. How: This renders conCurObj's own name. */ }

										<span className={ cssModObj.cndPillMode }>{ ( SED_NAM_OBJ.MOD_DEF_OBJ[ conCurObj.mode ] || {} ).labStr || conCurObj.mode }</span>{ /* What: Pill Mode Span Element. Why: Every conditional pill also shows its own mode label. How: This looks up conCurObj's own mode in SED_NAM_OBJ.MOD_DEF_OBJ, falling back to the raw mode key. */ }


									</button>


								) ) }


							</div>


						) : ( // What: No Conditionals Branch. Why: With no conditionals to attach, the rail is replaced by a plain explanatory message. How: This renders the else branch, taken while conIteArr is empty.


							<p className={ cssModObj.rdCndEmpty }>No conditionals yet. Create one in the Conditionals section below, then attach it here.</p> // What: Empty Rail Paragraph Element. Why: With no conditionals yet, the rail explains where to create one. How: This renders a fixed message pointing at the Conditionals section.


						) }


					</div>


				</ColDisCom>



				<div
					className={ cssModObj.schedLine }

					data-element-name-hook='schLinDiv'
				>{ /* What: Daily Line Div Element. Why: The daily-generator membership toggle needs its own labeled row. How: This wraps the label/sub text and the switch button below. Its data-element-name-hook is read by help mode's Data catalog. */ }


					<span className={ cssModObj.schedLineLabel }>{ /* What: Daily Label Span Element. Why: The toggle's own name and live explanation belong together. How: This wraps the lbl and sub spans below. */ }


						<span className={ cssModObj.schedLineLbl }>In the daily generator</span>{ /* What: Daily Label Span Element. Why: The row needs its own literal name. How: This renders the literal text "In the daily generator". */ }

						<span
							key={ incDaiBoo ? 'on' : 'off' }

							className={` ${ cssModObj.schedLineSub }   ${ cssModObj.setSubFade } `}
						>{ /* What: Daily Sub Span Element. Why: The row needs a live one-line explanation, cross-faded via its own key change. How: This renders whichever of the 2 explanations below matches incDaiBoo. */ }


							{ incDaiBoo // What: Daily Membership Check. Why: The explanation depends on whether the picker is in the daily generator. How: This picks one of the 2 phrases below based on incDaiBoo.


								? <>will run <strong>every time</strong> the Today page's daily generator is run</> // What: Daily Phrase. Why: A member picker runs every time the generator does. How: This renders a fixed explanation.

								: <>can only be <strong>run manually</strong> in the Pickers tab</> // What: Manual Phrase. Why: A non-member picker can only be run by hand. How: This renders a fixed explanation pointing at the Pickers tab.


							}


						</span>


					</span>

					<button
						className={ cssModObj.switch }

						data-element-name-hook='togSwiBut'

						aria-label={ `${ incDaiBoo ? 'Remove from' : 'Add to' } the daily generator` }
						aria-pressed={ incDaiBoo }

						onClick={ () => { // What: On Click Handler. Why: The switch adds or removes this picker from the daily generator. How: This builds the next membership list, then commits it through daiPicFun.


							const nexIdeArr = incDaiBoo ? daiIdeArr.filter( ( curIdeStr ) => curIdeStr !== picDatObj.id ) : [ ...daiIdeArr, picDatObj.id ]; // What: Next Identifier Array. Why: Toggling membership means either removing or adding this picker's own id. How: This filters picDatObj.id out when currently a member, or appends it when not.


							actStoObj.daiPicFun( nexIdeArr ); // What: Set Daily Pickers Call. Why: The toggle only takes effect once the new membership list is actually committed. How: This writes nexIdeArr as the app's own daily-generator membership.


						} }
					><i />{ /* What: Switch Dot Element. Why: This is the switch's own purely decorative sliding knob. How: This renders empty, positioned entirely via CSS off its parent button's own aria-checked or aria-pressed. */ }</button>{ /* What: Daily Switch Button Element. Why: This is the actual on/off control for daily-generator membership. How: This adds or removes picDatObj.id from daiIdeArr on click. Its data-element-name-hook is read by help mode's Today catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


				</div>



				<ColDisCom open={ incDaiBoo }>{ /* What: Collapse Disclosure Component. Why: The full cadence/days/holiday schedule only makes sense while this picker is actually in the daily generator. How: This opens only while incDaiBoo is true. */ }


					<React.Fragment>{ /* What: Schedule Fragment Element. Why: The 3 schedule rows below are true siblings with no shared wrapper of their own. How: This groups the cadence, days, and holiday rows without adding an extra DOM node. */ }


						<div
							className={ cssModObj.schedLine }

							data-element-name-hook='schLinDiv'
						>{ /* What: Cadence Line Div Element. Why: The cadence (how often) control needs its own labeled row. How: This wraps the label/sub text and the cadence selects below. Its data-element-name-hook is read by help mode's Data catalog. */ }


							<span className={ cssModObj.schedLineLabel }>{ /* What: Cadence Label Span Element. Why: The row's own name/help tip and live explanation belong together. How: This wraps the lbl row and sub span below. */ }


								<span className={` ${ cssModObj.schedLineLbl }   ${ cssModObj.pieLblRow } `}>{ /* What: Cadence Label Span Element. Why: The row needs its own literal name plus a help tip beside it. How: This renders the text "How often?" followed by the InfTipCom below. */ }How often?


									<InfTipCom
										className={ cssModObj.pieHelp }

										labTexStr={ CAD_NAM_OBJ.tipMesFun( picDatObj.cadence ) }
									>?</InfTipCom>{ /* What: Info Tip Component. Why: The cadence choice needs a fuller explanation available on demand. How: This shows CAD_NAM_OBJ's own tip text for the picker's current cadence. */ }


								</span>

								<span
									key={ ( picDatObj.cadence || 'daily' ) + ( picDatObj.anchorDow ?? '' ) + ( picDatObj.anchorDom ?? '' ) + ( picDatObj.anchorMonth ?? '' ) + ( picDatObj.anchorDay ?? '' ) + ( picDatObj.dateMode ?? '' ) + ( picDatObj.nthOrdinal ?? '' ) + ( picDatObj.nthWeekday ?? '' ) }

									className={` ${ cssModObj.schedLineSub }   ${ cssModObj.setSubFade } `}
								>{ /* What: Cadence Sub Span Element. Why: The row needs a live one-line summary of the exact configured schedule, cross-faded via its own composite key. How: This computes and returns the matching summary JSX for the picker's current cadence/anchor fields. */ }


									{ ( () => { // What: Cadence Summary Function. Why: The summary depends on cadence, anchor and date mode, which is too much branching for one inline expression. How: This immediately invokes an arrow function that returns the matching phrase.


										const curCadStr = picDatObj.cadence || 'daily';                                                                                                 // What: Current Cadence String. Why: Every branch below needs the picker's own resolved cadence. How: This reads picDatObj.cadence, defaulting to 'daily'.
										const dayFulArr = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];                                             // What: Day Full Array. Why: The weekly/monthly/yearly branches below all need full weekday names. How: This is indexed by anchorDow/nthWeekday below.
										const monFulArr = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]; // What: Month Full Array. Why: The yearly branch below needs the full month name. How: This is indexed by anchorMonth below.
										const isaNthBoo = picDatObj.dateMode === 'nthWeekday';                                                                                          // What: Is-A Nth Boolean. Why: Monthly/yearly cadences can anchor either to a fixed date or to an "nth weekday", which read very differently. How: This checks picDatObj.dateMode.
										const taiEndStr = ', and the pick will persist until marked as completed';                                                                      // What: Tail End String. Why: Every non-daily branch below ends with the same trailing clause. How: This is appended to each branch's own JSX below.



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

							<div className={ cssModObj.schedCadCtls }>{ /* What: Cadence Controls Div Element. Why: The cadence dropdown plus every mode-specific anchor select need their own grouped row. How: This renders the cadence select, then whichever anchor selects match the current cadence/dateMode. */ }


								<select
									className={ cssModObj.rdCadSel }

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
										className={ cssModObj.rdCadSel }

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
										className={ cssModObj.rdCadSel }

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
											className={ cssModObj.rdCadSel }

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
											className={ cssModObj.rdCadSel }

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
										className={ cssModObj.rdCadSel }

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
											className={ cssModObj.rdCadSel }

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
											className={ cssModObj.rdCadSel }

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
											className={ cssModObj.rdCadSel }

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
											className={ cssModObj.rdCadSel }

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
											className={ cssModObj.rdCadSel }

											value={ Math.min( picDatObj.anchorDay ?? 1, dimCouFun( 2024, picDatObj.anchorMonth ?? 1 ) ) }

											aria-label='Anchor day'

											onChange={ ( chaEveObj ) => actStoObj.updPicFun( picDatObj.id, { anchorDay : parseInt( chaEveObj.target.value ) } ) }
										>{ /* What: Anchor Day Select Element. Why: A date-anchored yearly cadence also needs its own day-of-month, clamped to whatever the chosen month actually allows. How: This commits the chosen number as picDatObj.anchorDay. */ }


											{ Array.from( Array( dimCouFun( 2024, picDatObj.anchorMonth ?? 1 ) ).keys(), ( arrIndNum ) => arrIndNum + 1 ).map( ( domValNum ) => ( // What: Anchor Day Option List Render. Why: One option is needed per possible day within the anchor month's own real length. How: This maps a generated array sized by dimCouFun to one option per entry, keyed by its own domValNum.


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


						<div
							className={ cssModObj.schedLine }

							data-element-name-hook='schLinDiv'
						>{ /* What: Days Line Div Element. Why: The weekday multi-select needs its own labeled row. How: This wraps the label/sub text and the WeeChiCom control below. Its data-element-name-hook is read by help mode's Data catalog. */ }


							<span className={ cssModObj.schedLineLabel }>{ /* What: Days Label Span Element. Why: The row's own name and live explanation belong together. How: This wraps the lbl and sub spans below. */ }


								<span className={ cssModObj.schedLineLbl }>Days</span>{ /* What: Days Label Span Element. Why: The row needs its own literal name. How: This renders the literal text "Days". */ }

								<span
									key={ ( picDatObj.daysOfWeek || [] ).join( ',' ) }

									className={` ${ cssModObj.schedLineSub }   ${ cssModObj.setSubFade } `}
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

						<div
							className={ cssModObj.schedLine }

							data-element-name-hook='schLinDiv'
						>{ /* What: Holiday Line Div Element. Why: The skip-on-holidays toggle needs its own labeled row. How: This wraps the label/sub text and the switch button below. Its data-element-name-hook is read by help mode's Data catalog. */ }


							<span className={ cssModObj.schedLineLabel }>{ /* What: Holiday Label Span Element. Why: The toggle's own name and live explanation belong together. How: This wraps the lbl and sub spans below. */ }


								<span className={ cssModObj.schedLineLbl }>Skip on holidays</span>{ /* What: Holiday Label Span Element. Why: The row needs its own literal name. How: This renders the literal text "Skip on holidays". */ }

								<span
									key={ picDatObj.skipHolidays ? 'on' : 'off' }

									className={` ${ cssModObj.schedLineSub }   ${ cssModObj.setSubFade } `}
								>{ /* What: Holiday Sub Span Element. Why: The row needs a live one-line explanation, cross-faded via its own key change. How: This renders whichever of the 2 explanations below matches picDatObj.skipHolidays. */ }


									{ picDatObj.skipHolidays // What: Skip Holidays Check. Why: The explanation depends on the holiday setting. How: This picks one of the 2 phrases below based on skipHolidays.


										? <><strong>will not run</strong> in the daily generator on holidays</> // What: Skip Holidays Phrase. Why: The picker sits out holidays. How: This renders a fixed explanation.

										: <><strong>will run</strong> in the daily generator on holidays</> // What: Run Holidays Phrase. Why: The picker runs on holidays like any other day. How: This renders a fixed explanation.


									}


								</span>


							</span>

							<button
								className={ cssModObj.switch }

								data-element-name-hook='togSwiBut'

								aria-label='Skip on holidays'
								aria-pressed={ !!picDatObj.skipHolidays }

								onClick={ () => actStoObj.updPicFun( picDatObj.id, { skipHolidays : !picDatObj.skipHolidays } ) }
							><i />{ /* What: Switch Dot Element. Why: This is the switch's own purely decorative sliding knob. How: This renders empty, positioned entirely via CSS off its parent button's own aria-checked or aria-pressed. */ }</button>{ /* What: Holiday Switch Button Element. Why: This is the actual on/off control for skipping holidays. How: This flips picDatObj.skipHolidays on click. Its data-element-name-hook is read by help mode's Today catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


						</div>


					</React.Fragment>


				</ColDisCom>



				<ColDisCom open={ !incDaiBoo }>{ /* What: Collapse Disclosure Component. Why: The "runs on demand only" note only makes sense while this picker is NOT in the daily generator. How: This opens only while incDaiBoo is false. */ }


					<div className={ cssModObj.schedOffNote }>Runs on demand only, not in the daily generator.</div>{ /* What: Off Note Div Element. Why: A picker outside the daily generator gets a short reminder that it only runs by hand. How: This renders a fixed note. */ }


				</ColDisCom>


			</div>


			<div className={` ${ cssModObj.rdCtlGroup }   ${ cssModObj.rdCtlGroupItems } `}>{ /* What: Item Controls Group Div Element. Why: Avoid-duplicates and Fill/Refill both act on this picker's ITEMS rather than its own type/schedule, so they get their own separate group. How: This wraps the subhead, the avoid-duplicates row, and the Fill/Refill row below. */ }


				<div className={ cssModObj.rdCtlSubhead }>Item Controls</div>{ /* What: Item Controls Subhead Div Element. Why: Every Controls group needs its own labeled subhead. How: This renders the literal text "Item Controls". */ }

				<div
					className={ cssModObj.schedLine }

					data-element-name-hook='schLinDiv'
				>{ /* What: Duplicates Line Div Element. Why: The avoid-duplicate-items toggle needs its own labeled row. How: This wraps the label/sub text and the switch button below. Its data-element-name-hook is read by help mode's Data catalog. */ }


					<span className={ cssModObj.schedLineLabel }>{ /* What: Duplicates Label Span Element. Why: The toggle's own name and live explanation belong together. How: This wraps the lbl and sub spans below. */ }


						<span className={ cssModObj.schedLineLbl }>Avoid duplicate items</span>{ /* What: Duplicates Label Span Element. Why: The row needs its own literal name. How: This renders the literal text "Avoid duplicate items". */ }

						<span
							key={ picDatObj.avoidDuplicates ? 'on' : 'off' }

							className={` ${ cssModObj.schedLineSub }   ${ cssModObj.setSubFade } `}
						>{ /* What: Duplicates Sub Span Element. Why: The row needs a live one-line explanation, cross-faded via its own key change. How: This renders whichever of the 2 explanations below matches picDatObj.avoidDuplicates. */ }


							{ picDatObj.avoidDuplicates // What: Avoid Duplicates Check. Why: The explanation depends on the duplicates setting. How: This picks one of the 2 phrases below based on avoidDuplicates.


								? <><strong>won't pick</strong> an item whose name is already on today's todo list</> // What: Avoid Duplicates Phrase. Why: The picker skips items already on today's list. How: This renders a fixed explanation.

								: <><strong>may pick</strong> an item even if its name is already on today's todo list</> // What: Allow Duplicates Phrase. Why: The picker may repeat an item already on today's list. How: This renders a fixed explanation.


							}


						</span>


					</span>

					<button
						className={ cssModObj.switch }

						data-element-name-hook='togSwiBut'

						aria-label='Avoid duplicate items'
						aria-pressed={ !!picDatObj.avoidDuplicates }

						onClick={ () => actStoObj.updPicFun( picDatObj.id, { avoidDuplicates : !picDatObj.avoidDuplicates } ) }
					><i />{ /* What: Switch Dot Element. Why: This is the switch's own purely decorative sliding knob. How: This renders empty, positioned entirely via CSS off its parent button's own aria-checked or aria-pressed. */ }</button>{ /* What: Duplicates Switch Button Element. Why: This is the actual on/off control for avoiding duplicate items. How: This flips picDatObj.avoidDuplicates on click. Its data-element-name-hook is read by help mode's Today catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


				</div>



				<ColDisCom open={ isaEasBoo }>{ /* What: Collapse Disclosure Component. Why: Fill/Refill only makes sense for an ease-mode picker. How: This opens only while isaEasBoo is true. */ }


					<div
						className={ cssModObj.easeConfig }

						data-ease-down-active={ isaDowBoo || undefined } // What: Ease Down Active Attribute. Why: Help mode finds this section as the ease-down one without reading its classes. How: This is present only while isaDowBoo is true, since undefined drops the attribute entirely.
						data-ease-up-active={ !isaDowBoo || undefined } // What: Ease Up Active Attribute. Why: Help mode finds this section as the ease-up one without reading its classes. How: This is present only while isaDowBoo is false, since undefined drops the attribute entirely.
						data-element-name-hook='easConDiv'
					>{ /* What: Ease Config Div Element. Why: Help mode gives this section mode-specific copy (Fill vs. Refill), telling the two apart by its ease-up/ease-down state attributes. How: This wraps whichever of the 2 mode-specific rows below matches picDatObj.mode. Its data-element-name-hook is read by help mode's Data catalog. */ }


						{ picDatObj.mode === 'ease-up' && ( // What: Ease Up Check. Why: Only ease-up gets the "Fill" wording and action. How: This renders the Fill row only while picDatObj.mode is 'ease-up'.


							<div
								className={ cssModObj.pieRow }

								data-element-name-hook='ediRowDiv'
							>{ /* What: Fill Row Div Element. Why: The Fill label/summary and its button need their own row. How: This wraps the rowlabel div and the FilButCom below. Its data-element-name-hook is read by the picker mini-tours, help mode's Today catalog, the help items' own unit-word lookups, help mode's Pickers catalog, and help mode's Data catalog. */ }


								<div className={ cssModObj.pieRowlabel }>{ /* What: Fill Rowlabel Div Element. Why: The Fill label and its live summary belong together. How: This wraps the lbl and sub spans below. */ }


									<span className={ cssModObj.pieLbl }>Fill</span>{ /* What: Fill Label Span Element. Why: The row needs its own literal name. How: This renders the literal text "Fill". */ }

									<span className={ cssModObj.pieSub }>{ filSubEle }</span>{ /* What: Fill Sub Span Element. Why: The row needs a live summary of how many items still need charging. How: This renders filSubEle. */ }


								</div>



								<FilButCom
									isaDisBoo={ picIteArr.length > 0 && picIteArr.every( ( iteCurObj ) => ( iteCurObj.value ?? 0 ) >= ( picDatObj.threshold ?? 100 ) ) }
									labTexStr='Fill all'

									onFilActFun={ () => actStoObj.filPicFun( picDatObj.id ) }
								/>{ /* What: Fill Button Component. Why: This is the actual bulk-charge action for an ease-up picker. How: This is disabled once every item is already at threshold, and calls filPicFun on click. */ }


							</div>


						) }


						{ picDatObj.mode === 'ease-down' && ( // What: Ease Down Check. Why: Only ease-down gets the "Refill" wording and action. How: This renders the Refill row only while picDatObj.mode is 'ease-down'.


							<div
								className={ cssModObj.pieRow }

								data-element-name-hook='ediRowDiv'
							>{ /* What: Refill Row Div Element. Why: The Refill label/summary and its button need their own row. How: This wraps the rowlabel div and the FilButCom below. Its data-element-name-hook is read by the picker mini-tours, help mode's Today catalog, the help items' own unit-word lookups, help mode's Pickers catalog, and help mode's Data catalog. */ }


								<div className={ cssModObj.pieRowlabel }>{ /* What: Refill Rowlabel Div Element. Why: The Refill label and its live summary belong together. How: This wraps the lbl and sub spans below. */ }


									<span className={ cssModObj.pieLbl }>Refill</span>{ /* What: Refill Label Span Element. Why: The row needs its own literal name. How: This renders the literal text "Refill". */ }

									<span className={ cssModObj.pieSub }>{ filSubEle }</span>{ /* What: Refill Sub Span Element. Why: The row needs a live summary of how many items still need charging. How: This renders filSubEle. */ }


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



			<div
				className={` ${ cssModObj.rdCtlGroup }   ${ cssModObj.rdCtlGroupFoot } `}

				data-element-name-hook='picFooDiv'
			>{ /* What: Footer Group Div Element. Why: Delete/Cancel/Save (or the new-draft Cancel/Add-Items/Save variant) needs its own bottom group. How: This renders whichever of the 3 footer states below matches conDelBoo/isaNewBoo. Its data-element-name-hook is read by help mode's Data catalog. */ }


				{ conDelBoo ? ( // What: Confirm Delete Check. Why: A real picker's Delete morphs the footer into an inline confirm before actually deleting. How: This renders the confirm row while conDelBoo is true.


					<div
						key='confirm'

						className={ cssModObj.rdPkDelConfirm }
					>{ /* What: Delete Confirm Div Element. Why: The confirm message and its own Cancel/Delete buttons need their own grouped row. How: This wraps the confirm message and the rem-del-actions row below. */ }


						<div className={ cssModObj.confirmMsg }>Delete the &ldquo;{ picDatObj.name }&rdquo; picker? This will also delete its { picIteArr.length } { picIteArr.length === 1 ? 'item' : 'items' }. This can&rsquo;t be undone.</div>{ /* What: Confirm Msg Div Element. Why: A destructive action needs an explicit, specific warning before it happens. How: This names the picker and states exactly how many items will also be deleted. */ }

						<div className={ cssModObj.remDelActions }>{ /* What: Delete Actions Div Element. Why: The confirm's own Cancel and Delete buttons need their own row. How: This wraps both ButBasCom instances below. */ }


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

						className={` ${ cssModObj.rdCtlFootRow }   ${ cssModObj.rdCtlFootRowNew } `}
					>{ /* What: New Footer Row Div Element. Why: The new-draft footer's own Cancel/Save buttons need their own row. How: This wraps the rem-foot-right div below. */ }


						<div className={ cssModObj.remFootRight }>{ /* What: Foot Right Div Element. Why: The Cancel and Save buttons anchor to the footer's own right edge. How: This wraps the ButBasCom and InfTipCom-wrapped ButBasCom below. */ }


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

						className={ cssModObj.rdCtlFootRow }
					>{ /* What: Foot Row Div Element. Why: Delete (left) and Cancel/Save (right) both belong in the same footer row. How: This wraps the Delete ButBasCom and the rem-foot-right div below. */ }


						<ButBasCom
							icoNamStr='traEle'
							kinValStr='danger'
							sizValStr='sm'

							onClick={ () => setConDelBoo( true ) }
						>Delete</ButBasCom>{ /* What: Button Base Component. Why: This opens the inline delete confirm rather than deleting immediately. How: This sets conDelBoo true on click. */ }



						<div className={ cssModObj.remFootRight }>{ /* What: Foot Right Div Element. Why: Cancel and Save anchor to the footer's own right edge. How: This wraps both ButBasCom instances below. */ }


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

// #endregion Components



// #region Exports

export { PicConCom }; // What: Named Export. Why: TabDatCom renders this body inside each picker card's Controls disclosure. How: This exports PicConCom by name.

// #endregion Exports


