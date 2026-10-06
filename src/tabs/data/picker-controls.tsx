


// #region Imports

import cssModObj from './picker-controls.module.css'; // What: CSS Module Object. Why: PicConCom's own styles live in its module. How: Each className reads its hashed class from here.
import React     from 'react';                        // What: React. Why: PicConCom is built directly on React's own APIs. How: This is used directly (React.useCallback, React.useEffect, React.useLayoutEffect, React.useMemo, React.useRef, React.useState, React.Fragment) instead of importing individual named hooks.


import { ButBasCom    } from '../../ui/button.tsx';          // What: Button Base Component. Why: PicConCom's own footer and inline actions need consistently-styled buttons. How: This is rendered throughout PicConCom.
import { CAD_NAM_OBJ  } from '../../core/cadence.ts';        // What: Cadence Namespace Object. Why: PicConCom needs the shared cadence math/summary helpers to render its own "how often" tip and select options. How: This is called throughout PicConCom for tipMesFun/sumCadFun/dimCouFun/uniWorFun/locTipFun.
import { CAD_OPT_ARR  } from '../../ui/cadence-control.tsx'; // What: Cadence Options Array. Why: PicConCom's own daily-cadence summary needs the same daily-cadence sub-explanation CadConCom itself uses. How: This is looked up by key 'daily' inside PicConCom's cadence-summary block.
import { ColDisCom    } from '../../ui/collapse.tsx';        // What: Collapse Disclosure Component. Why: PicConCom's own sub-sections open and close with the same collapse-height animation as every other disclosure. How: This wraps each of those bodies, driven by the matching open boolean.
import { dimCouFun    } from '../../utils/date.ts';          // What: Days-In-Month Count Function. Why: Monthly and yearly clamping need a month's real length. How: This is called with a year and 1-based month.
import { durMilFun    } from '../../utils/rhythm.ts';        // What: Duration Millisecond Function. Why: Timers that wait on a CSS animation must end with it. How: This returns a duration step's length in milliseconds, matching the stylesheet's own --dur-* tokens.
import { FilButCom    } from '../../ui/fill-button.tsx';     // What: Fill Button Component. Why: An ease-up/ease-down picker's Item Controls need the same Fill/Refill-all control Today's own boost tools use. How: This is rendered inside PicConCom's Item Controls group.
import { IcoSvgCom    } from '../../ui/icon.tsx';            // What: Icon Svg Component. Why: PicConCom's own buttons and rows need recognizable glyphs. How: This is rendered throughout PicConCom.
import { InfTipCom    } from '../../ui/info-tip.tsx';        // What: Info Tip Component. Why: A disabled control or a truncated label still needs to explain itself on demand. How: This wraps those controls throughout PicConCom.
import { motEasFun    } from '../../utils/motion.ts';        // What: Motion Easing Function. Why: Element.animate curves should match the stylesheet. How: This reads a --mot-*-eas token as a CSS easing string.
import { norGroFun    } from '../../core/pickers.ts';        // What: Normalize Group Function. Why: A newly-typed picker group needs the same tidy-casing rule picker names already use. How: This is called when committing PicConCom's own "+ New Group" inline input.
import { ordSufFun    } from '../../utils/date.ts';          // What: Ordinal Suffix Function. Why: Schedule summaries read days as ordinals like 1st or 22nd. How: This is called with the day number.
import { redMotFun    } from '../../utils/motion.ts';        // What: Reduce Motion Function. Why: A user who prefers reduced motion shouldn't see PicConCom's own scroll or collapse animations. How: This is checked before each of those animations.
import { SED_NAM_OBJ  } from '../../state/seed.ts';          // What: Seed Namespace Object. Why: Every picker mode's own label and hint text comes from this shared catalog. How: This is read (MOD_DEF_OBJ) in PicConCom for the mode radio group.
import { togFadFun    } from '../../ui/edge-fade.ts';        // What: Toggle Fade Function. Why: Every scrolling rail in this file hides each edge fade once that edge is reached. How: This is called by each rail's own scroll and resize handlers.
import { UnmWatCom    } from '../../ui/unmount-watcher.ts';  // What: Unmount Watcher Component. Why: Controls that close without Save still keep their edits. How: This is rendered at the end of PicConCom's body with comPicFun.
import { useFliRaiFun } from '../../ui/flip-rail.ts';        // What: Use Flip Rail Function. Why: The conditional rail's pinned pill should glide to the front instead of snapping. How: This is called once with the rail ref and a trigger key.
import { WeeChiCom    } from '../../ui/weekday-chips.tsx';   // What: Weekday Chip Component. Why: PicConCom's own Days control needs the same weekday multi-select every other schedule editor uses. How: This is rendered inside PicConCom's "When it runs" group.


import type { ActStoTyp } from '../../state/store.ts';     // What: Action Store Type. Why: The Controls body changes the picker through the store's actions. How: This types PccProTyp's actStoObj.
import type { CadNamTyp } from '../../core/data-model.ts'; // What: Cadence Name Type. Why: The cadence select sets one of the saved cadences. How: This types its value.
import type { ConRcdTyp } from '../../core/data-model.ts'; // What: Conditional Record Type. Why: A picker can attach one of the existing conditionals. How: This types PccProTyp's conditional list.
import type { DatModTyp } from '../../core/data-model.ts'; // What: Date Mode Type. Why: The date mode select sets one of the saved date modes. How: This types its value.
import type { IteRcdTyp } from '../../core/data-model.ts'; // What: Item Record Type. Why: The Controls body reads the picker's own items. How: This types PccProTyp's item list.
import type { ModNamTyp } from '../../core/data-model.ts'; // What: Mode Name Type. Why: The mode radios set one of the five modes. How: This types the chosen mode.
import type { PicForTyp } from '../../core/data-model.ts'; // What: Picker Form Type. Why: A draft picker's changes and save carry its form fields, and a brand-new draft is created as a complete picker. How: This types the draft patch and save callbacks.
import type { PicRcdTyp } from '../../core/data-model.ts'; // What: Picker Record Type. Why: The Controls body edits one picker. How: This types PccProTyp's picker.

// #endregion Imports



/**
 * picker-controls.tsx = Picker Controls
 *
 * @summary
 * A Data tab picker card's own Controls body: how the picker picks (its type
 * and ease band), when it runs (its weekdays, holiday skip, and
 * daily-generator membership), and its item controls (Fill/Refill). Every
 * field edits a local draft, committed on Save or when Controls closes and
 * dropped on Cancel, and a brand-new draft picker gets a no-Delete footer.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

type PccProTyp = { actStoObj : ActStoTyp, allGroArr : string[], conIteArr? : ConRcdTyp[], hasNewBoo? : boolean, incDaiBoo : boolean, isaNewBoo? : boolean, iteSecBoo? : boolean, onCanNewFun : () => void, onColConFun : () => void, onOpeSecFun? : () => void, onPatNewFun? : ( patPicObj : Partial< PicForTyp > ) => void, onReqDelFun? : () => void, onSavNewFun : ( draPicObj : PicForTyp, filAllBoo : boolean ) => void, picDatObj : PicRcdTyp, picIteArr : IteRcdTyp[] }; // What: Picker-Controls-Component Props Type. Why: A picker's Controls body edits one picker, real or a brand-new draft, and hands a draft's changes, save, and cancel to its card. How: This types PicConCom's props.

// #region PicConCom

/**
 * PicConCom = Picker Controls Component
 *
 * @summary
 * A picker's own "how it picks / when it runs / item controls" body,
 * rendered only while the Controls disclosure is open. Every field edits a
 * local draft of the picker (its type, schedule, holiday skip, daily-
 * generator membership, and any pending Fill all), so nothing reaches the
 * picker until Controls is saved or closed: Cancel drops the draft, while
 * Save, or Controls closing any other way (collapsing, a tab switch), commits
 * it through savEdiFun, the Pickers tab's own edit save, which also resets
 * the items when the type changes. A brand-new draft picker (started by
 * TabDatCom's own "Create Picker" button) swaps the normal Delete/Cancel/Save
 * footer for a no-Delete Cancel/Add-Items-then-Save one, mirrors each change
 * up through onPatNewFun, and hands its draft to onSavNewFun to create.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actStoObj   - Action Store Object: {@link useAppStaFun}
 * @param props.allGroArr   - All Group Array: Every existing group name, used
 *                            to populate the Group selector.
 * @param props.conIteArr   - Conditional Item Array: Every existing
 *                            conditional, used to populate the attach-a-
 *                            conditional rail; defaults to an empty array.
 * @param props.hasNewBoo   - Has New Boolean: Whether a brand-new item's
 *                            editor is still open, unsaved.
 * @param props.incDaiBoo   - Included Daily Boolean: Whether this picker is
 *                            currently a member of the daily generator, the
 *                            draft's starting membership.
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
 * @param props.onPatNewFun - On Patch New Function: Passes each change to a
 *                            brand-new draft picker up to its card.
 * @param props.onReqDelFun - On Request Delete Function: Deletes this picker,
 *                            in place of the default actStoObj.delPicFun call,
 *                            when the caller wants to animate the removal
 *                            itself.
 * @param props.onSavNewFun - On Save New Function: Creates a brand-new draft
 *                            picker from the draft and whether a Fill all is
 *                            pending.
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

function PicConCom ( { actStoObj, allGroArr, conIteArr = [], hasNewBoo, incDaiBoo, isaNewBoo, iteSecBoo, onCanNewFun, onColConFun, onOpeSecFun, onPatNewFun, onReqDelFun, onSavNewFun, picDatObj, picIteArr } : PccProTyp ) : React.JSX.Element {


	// #region Picker Draft

	const [ draPicObj, setDraPicObj ] = React.useState( () => ( { ...picDatObj, includeInDaily : incDaiBoo } ) ); // What: Draft Picker Object And Setter. Why: Every Controls field edits this local copy, so nothing reaches the picker until Controls is saved or closed. How: This starts as a copy of the picker plus its current daily-generator membership.
	const [ filAllBoo, setFilAllBoo ] = React.useState( false );                                                  // What: Fill All Boolean And Setter. Why: A Fill all or Refill all press is part of the draft too, applied to the items only when the draft is committed. How: This flips true on that press.

	const oriPicRef = React.useRef( { ...picDatObj, includeInDaily : incDaiBoo } ); // What: Original Picker Reference. Why: Closing an untouched Controls must not rewrite the picker at all. How: This keeps the draft's starting copy to compare against.
	const hanCloRef = React.useRef( false );                                        // What: Handled Close Reference. Why: A Controls already saved, cancelled, or deleted must not commit again when it unmounts. How: This flips true on any of those.



	// #region patPicFun

	/**
	 * patPicFun = Patch Picker Function
	 *
	 * @summary
	 * Merges a field or two into the local draft, the one way every Controls
	 * field writes. For a brand-new draft picker it also passes the same change
	 * up through onPatNewFun, since that picker's card header and new items read
	 * its draft from the parent.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param patPicObj - Patch Picker Object: The fields to merge into the
	 *                    draft.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * patPicFun({ group : 'Chores' }) // => void
	 * ```
	 *
	*/

	const patPicFun = ( patPicObj : Partial< PicForTyp > ) => { // What: Patch Picker Function. Why: Every Controls field changes a field or two of the draft, and a brand-new picker's card also shows its draft as it's typed. How: This merges patPicObj into the draft, passing it up to onPatNewFun for a new picker.


		setDraPicObj( ( preDraObj ) => ( { ...preDraObj, ...patPicObj } ) ); // What: Draft Merge Call. Why: The field change lands in the draft. How: This merges patPicObj into draPicObj.


		if ( isaNewBoo && onPatNewFun ) onPatNewFun( patPicObj ); // What: New Picker Mirror Guard. Why: A brand-new picker's card header and new items read its draft from the parent. How: This passes the same change to onPatNewFun.


	};

	// #endregion patPicFun

	// #endregion Picker Draft



	// #region Fill Summary

	const isaEasBoo = draPicObj.mode === 'ease-up' || draPicObj.mode === 'ease-down';                                                        // What: Is-A Ease Boolean. Why: Several sections below (Item Controls' own Fill/Refill, the item sort options) only apply to an ease-mode picker. How: This is true whenever draPicObj.mode is 'ease-up' or 'ease-down'.
	const isaDowBoo = draPicObj.mode === 'ease-down';                                                                                        // What: Is-A Down Boolean. Why: Ease-up and ease-down share most UI but need opposite Fill/Refill wording. How: This is true only for 'ease-down'.
	const notFulNum = filAllBoo ? 0 : picIteArr.filter( ( iteCurObj ) => ( iteCurObj.value ?? 0 ) < ( draPicObj.threshold ?? 100 ) ).length; // What: Not Full Number. Why: The Fill/Refill row's own summary needs to know how many items still aren't at full charge. How: This counts none once Fill all is pending in the draft, otherwise every item whose own value falls short of the picker's own threshold.


	const filSubEle = notFulNum === 0 // What: Fill Sub Element. Why: The Item Controls' own Fill/Refill row needs a live one-line summary of how many items still need charging. How: This picks a fully-charged message when notFulNum is 0, otherwise pluralizes the remaining count.
		? <><strong>all items</strong> are fully charged</>                                                                                 // What: All Full Branch. Why: Nothing is left to charge. How: This says every item is fully charged.
		: <><strong>{ notFulNum } { notFulNum === 1 ? 'item' : 'items' }</strong> { notFulNum === 1 ? 'is' : 'are' } not at full charge</>; // What: Some Short Branch. Why: The user needs to know how many items still fall short. How: This names notFulNum, pluralizing item/is to match.

	// #endregion Fill Summary



	const [ conDelBoo, setConDelBoo ] = React.useState( false ); // What: Confirm Delete Boolean And Setter. Why: Deleting a real picker needs an inline confirm step before it actually happens. How: This is flipped true by the Delete button and read by the footer to swap in the confirm row.



	// #region Footer Button

	const neeNamBoo = !draPicObj.name.trim();                                        // What: Need Name Boolean. Why: A new draft's footer must know whether the picker still lacks a name. How: This is true whenever draPicObj.name is empty once trimmed.
	const neeGroBoo = !draPicObj.group;                                              // What: Need Group Boolean. Why: A new draft's footer must also know whether the picker still lacks a group. How: This is true whenever draPicObj.group is falsy.
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


	const fooActFun = shoSavBoo ? () => onSavNewFun( draPicObj, filAllBoo ) : onOpeSecFun; // What: Footer Action Function. Why: The footer button's own click handler depends on whether it currently reads "Save" or "Add Items". How: This hands the draft and any pending Fill all to onSavNewFun once shoSavBoo is true, onOpeSecFun otherwise.

	// #endregion Footer Button



	// #region Conditional Rail

	const [ conAttBoo, setConAttBoo ] = React.useState( !!draPicObj.conditionalId ); // What: Conditional Attached Boolean And Setter. Why: The "Attach a conditional" toggle needs its own on/off state, seeded from whether this picker already has one attached. How: This starts true when draPicObj.conditionalId is already set, and is flipped by the switch button below.

	const raiCleRef = React.useRef< ( () => void ) | null >( null ); // What: Rail Cleanup Reference. Why: The rail's own scroll/resize wiring needs to be torn down and rebuilt on every reattach. How: This holds whichever cleanup function the last attachment registered.
	const raiNodRef = React.useRef< HTMLElement | null >( null );    // What: Rail Node Reference. Why: The shared reorder animation and the scroll reset effect below need a stable handle on the rail's own live DOM node. How: This is written by raiRefFun below and read by useFliRaiFun and the scroll reset effect.


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
	 * raiRefFun(raiCurEle) // => void
	 * ```
	 *
	*/

	const raiRefFun = React.useCallback( ( raiCurEle : HTMLElement | null ) => { // What: Rail Reference Function. Why: The conditional pill rail needs its own scroll/resize wiring set up on attach and torn down on every reattach or detach. How: This is passed directly as the rail div's own ref prop.


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



	const attConObj = conIteArr.find( ( conCurObj ) => conCurObj.id === draPicObj.conditionalId ) || null; // What: Attached Conditional Object. Why: The schedule summary below needs the actual conditional record this picker currently points at. How: This looks up draPicObj.conditionalId in conIteArr, or null when none matches.



	useFliRaiFun( raiNodRef, `${ draPicObj.conditionalId }|${ conAttBoo }|${ conIteArr.length }` ); // What: Use Flip Rail Call. Why: When the attached conditional changes, the pinned pill jumps to the front, and this plays the shared glide instead of a silent snap. How: This passes the rail ref and a trigger key built from the attached conditional, the toggle, and the conditional count, the same values the scroll reset below re-runs on.


	React.useLayoutEffect( () => { // What: Conditional Rail Scroll Reset Effect. Why: When the attached conditional changes, the pinned pill moves to the rail's start, which should be scrolled into view. How: This glides the rail back to its left edge after every reorder, right after the shared reorder animation has run.


		const raiCurEle = raiNodRef.current; // What: Rail Current Element. Why: There is nothing to scroll before the rail itself has mounted. How: This reads the live node raiRefFun last wrote.


		if ( !raiCurEle ) return; // What: No Rail Guard. Why: The rail may not be mounted yet, such as while its own ColDisCom is still closed. How: This bails out of the effect early when there is no rail element to scroll.



		if ( raiCurEle.scrollLeft > 1 ) { // What: Rail Scroll Reset Guard. Why: A pin-to-front reorder means the top pill is now at the rail's own start, which should be visible. How: This glides the rail back to its own left edge whenever it wasn't already there.


			raiCurEle.scrollTo({ // What: Rail Scroll Call. Why: This is the actual glide back to the rail's start. How: This scrolls raiCurEle to its left edge.


				behavior : redMotFun() ? 'auto' : 'smooth', // What: Behavior. Why: A user who prefers reduced motion gets an instant jump instead of a glide. How: This picks 'auto' under reduced motion, otherwise 'smooth'.
				left     : 0                                // What: Left. Why: The rail's start is its left edge. How: This scrolls to x 0.


			});


		}


	}, [ draPicObj.conditionalId, conAttBoo, conIteArr.length ] ); // What: Effect Dependency Array. Why: This effect must re-run whenever the attached conditional changes, the toggle flips, or the available conditionals themselves change count, the same values as the reorder animation's own trigger key. How: draPicObj.conditionalId is the actual reorder trigger; conAttBoo covers the rail appearing/disappearing; conIteArr.length covers a conditional being added or removed elsewhere.

	// #endregion Conditional Rail



	// #region Group Picker

	const [ newGroBoo, setNewGroBoo ] = React.useState( false ); // What: New Group Boolean And Setter. Why: The Group selector's own inline "+ New Group" create mode needs an on/off flag. How: This is flipped true by the "+ New Group" pill and closed by cloGroFun below.
	const [ pilRetBoo, setPilRetBoo ] = React.useState( false ); // What: Pill Returning Boolean And Setter. Why: The "+ New Group" pill needs to know when it's mid-return-animation after the input closes. How: This is set true by cloGroFun and cleared 200ms later.
	const [ newGroStr, setNewGroStr ] = React.useState( '' );    // What: New Group String And Setter. Why: The inline input needs its own in-progress text, separate from any real group name. How: This is read on blur/Enter and normalized into a real group by cmtGroFun.

	const newGroRef = React.useRef< HTMLInputElement | null >( null ); // What: New Group Reference. Why: The inline input must be focused the instant it mounts. How: This is attached to the input's own ref prop and focused by the effect below.
	const groPilRef = React.useRef< HTMLDivElement | null >( null );   // What: Group Pill Reference. Why: Both the scroll-edge-fade effect and the "keep scrolled to the end while growing" effect below need the live pill row element. How: This is attached to the pill row's own ref prop.


	const groFliRef = React.useRef< Map< string, number > | null >( null ); // What: Group Flip Reference. Why: Selecting a group re-sorts its pill to the front, and this needs each pill's own previous x to animate that shuffle instead of snapping. How: This starts null and is populated by the layout effect below.


	React.useLayoutEffect( () => { // What: Group Pills Flip Effect. Why: Re-sorting the group pills on selection should glide, not snap, matching the conditional rail's own FLIP treatment. How: This is guarded against measuring while the panel is hidden, then tweens each pill by its own previous-to-new x delta.


		const groCurEle = groPilRef.current; // What: Group Current Element. Why: There is nothing to animate before the group pill row itself has mounted. How: This reads the live node from groPilRef.


		if ( !groCurEle || groCurEle.offsetParent === null ) return; // What: Hidden Guard. Why: Measuring a hidden (offsetParent null) row would capture stale, meaningless coordinates. How: This bails out of the effect when the row isn't actually mounted or is currently hidden.



		const pilNodArr = [ ...groCurEle.querySelectorAll< HTMLElement >( '[data-element-name-hook~="groPilBut"]' ) ]; // What: Pill Node Array. Why: Every currently-rendered group pill needs to be checked for movement. How: This queries every groPilBut element inside the row and spreads the NodeList into a real array.
		const preMapObj = groFliRef.current;                                                            // What: Previous Map Object. Why: A FLIP tween needs each pill's own position from before this render's reorder. How: This reads whatever the previous run of this effect recorded.


		if ( preMapObj && !redMotFun() ) { // What: Has Previous Guard. Why: The very first run has nothing to compare against, and a reduced-motion user should never see this tween. How: This only attempts to animate once a previous snapshot exists and motion isn't reduced.


			pilNodArr.forEach( ( pilCurEle ) => { // What: Pill Animate Loop. Why: Every pill needs its own individual tween, since each may have moved a different distance (or none at all). How: This computes each pill's own delta from preMapObj and plays a matching transform.


				const oldXcoNum = preMapObj.get( pilCurEle.dataset.g! ); // What: Old X-Coordinate Number. Why: This pill's own previous position is keyed by its own group name. How: This looks up the pill's own data-g attribute in preMapObj. // What: Non-Null Note. Why: Every group pill renders with its own data-g group name. How: The ! tells TypeScript the key is set.


				if ( oldXcoNum == null ) return; // What: New Pill Guard. Why: A pill with no recorded previous position is brand new and has nothing to tween from. How: This skips straight to the next pill.



				const difXcoNum = oldXcoNum - pilCurEle.offsetLeft; // What: Difference X-Coordinate Number. Why: The tween's own starting transform is the distance this pill needs to travel back from its new position. How: This subtracts the pill's own current offsetLeft from oldXcoNum.


				if ( Math.abs( difXcoNum ) > 1 ) pilCurEle.animate( [ { transform : `translateX(${ difXcoNum }px)` }, { transform : 'none' } ], { // What: Flip Animation Guard. Why: A pill that didn't actually move by more than a rounding pixel needs no tween at all. How: This plays the invert-then-play transform over the p03 duration step only when difXcoNum is meaningfully non-zero.


					duration : durMilFun( 'p03' ), // What: Duration. Why: The slide back into place must match the app's own motion scale. How: This reads the p03 duration step through durMilFun. // Duration Base Plus 3 ~= 366.9ms
					easing   : motEasFun( 'dec' )  // What: Easing. Why: A pill arriving at its new spot should start fast and land softly. How: This reads the decelerate easing curve through motEasFun. // Motion Decelerate Easing = cubic-bezier( .2, .7, .3, 1 )


				} );


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


	}, [ draPicObj.group ] ); // What: Effect Dependency Array. Why: The group pills only ever need to reorder when the picker's own selected group actually changes. How: draPicObj.group is the single value this effect's own change-detection is built around.


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



		let rafIdeNum : number; // What: Raf Identifier Number. Why: The pin loop below needs to be cancellable on cleanup. How: This is assigned by every requestAnimationFrame call below and read by the cleanup return.

		const staTimNum = performance.now(); // What: Start Time Number. Why: The pin loop must stop after a fixed duration matching the unfurl animation, not run forever. How: This records the loop's own start time to compare against on every frame.


		const pinScrFun = ( curTimNum : number ) => { // What: Pin Scroll Function. Why: The existing pills must slide left IN SYNC with the input's own growth, one continuous motion, instead of a jump once the animation finishes. How: This re-scrolls the row to its own full width every frame for 280ms.


			groCurEle.scrollLeft = groCurEle.scrollWidth; // What: Scroll Pin Write. Why: This is the actual pin: keeping the row scrolled all the way to its own end. How: This sets scrollLeft to scrollWidth every frame.


			if ( curTimNum - staTimNum < 280 ) rafIdeNum = requestAnimationFrame( pinScrFun ); // What: Next Frame Guard. Why: The pin loop must stop once the unfurl animation's own duration has elapsed. How: This schedules another frame only while under 280ms have passed since staTimNum.


		};


		rafIdeNum = requestAnimationFrame( pinScrFun ); // What: Pin Loop Start. Why: The loop above does nothing until it's actually scheduled. How: This kicks off the first frame of pinScrFun.



		return () => cancelAnimationFrame( rafIdeNum ); // What: Effect Cleanup Return. Why: A stale pin loop must not keep running after newGroBoo flips false or the component unmounts. How: This cancels whichever frame rafIdeNum currently points at.


	}, [ newGroBoo ] ); // What: Effect Dependency Array. Why: This effect's own focus-and-pin sequence only needs to run when the inline input actually opens. How: newGroBoo is the single value this effect's own guard is built around.


	const oriGroRef = React.useRef( picDatObj.group ); // What: Original Group Reference. Why: The group choice list below must keep listing the picker's ORIGINAL group even if it's since been moved away mid-edit, so a stray click is recoverable until Save. How: This snapshots picDatObj.group once, on mount, and is never reassigned.


	const groChoArr = React.useMemo( () => { // What: Group Choices Array. Why: The Group selector needs every existing group, plus this picker's own current and original group in case either isn't otherwise represented. How: This builds the combined list and sorts the picker's own current group to the front.


		const allChoArr = [ ...( allGroArr || [] ) ]; // What: All Choice Array. Why: The full choice list starts from every group already in use elsewhere. How: This copies allGroArr so the pushes below never mutate the caller's own array.


		if ( draPicObj.group && !allChoArr.includes( draPicObj.group ) ) allChoArr.push( draPicObj.group ); // What: Current Group Guard. Why: A picker's own current group might be the only member of a group not otherwise listed. How: This appends draPicObj.group when it's set and not already present.



		if ( oriGroRef.current && !allChoArr.includes( oriGroRef.current ) ) allChoArr.push( oriGroRef.current ); // What: Original Group Guard. Why: The picker's ORIGINAL group must stay listed even if this (its only member) has been moved away mid-edit. How: This appends oriGroRef.current when it's set and not already present.



		return allChoArr.sort( ( groOneStr, groTwoStr ) => ( groTwoStr === draPicObj.group ? 1 : 0 ) - ( groOneStr === draPicObj.group ? 1 : 0 ) ); // What: Choice Array Return. Why: The picker's own current group should sort first, ahead of every other choice. How: This sorts by whichever of the two sides equals draPicObj.group.


	}, [ allGroArr, draPicObj.group ] ); // What: Memo Dependency Array. Why: The choice list only needs recomputing when the available groups or the picker's own current group changes. How: allGroArr covers a group being added/removed elsewhere; draPicObj.group covers this picker's own selection changing.


	const cloGroFun = () => { // What: Close Group Function. Why: Both a commit and a cancel need the exact same teardown: unmount the input, clear its text, and play the "+ New Group" pill's own return animation. How: This closes newGroBoo, clears newGroStr, and flags pilRetBoo for 200ms.


		setNewGroBoo( false ); // What: New Group Close Call. Why: This unmounts the inline input immediately. How: This sets newGroBoo to false.
		setNewGroStr( '' );    // What: New Group Text Clear. Why: A future reopen should start from an empty input, not leftover text. How: This resets newGroStr to an empty string.
		setPilRetBoo( true );  // What: Pill Returning Start. Why: The "+ New Group" pill needs to visibly animate back in, symmetric with how it vanished on open. How: This flags pilRetBoo true, applying the returning class.

		setTimeout( () => setPilRetBoo( false ), durMilFun( 'p01' ) ); // What: Pill Returning End. Why: The returning class only needs to apply for the duration of its own animation. How: This clears pilRetBoo after that animation's own p01 duration step. // Duration Base Plus 1 ~= 209.1ms


	};


	const cmtGroFun = () => { // What: Commit Group Function. Why: Pressing Enter (or clicking the checkmark) should actually create/select the typed group, not just close the input. How: This normalizes the typed name and, if valid, updates the picker's own group before closing.


		const tidNamStr = norGroFun( newGroStr, groChoArr ); // What: Tidy Name String. Why: A typed group name needs the same tidy-casing/collision handling every other group name gets. How: This calls the shared norGroFun helper against the current choice list.


		if ( tidNamStr ) patPicFun( { group : tidNamStr } ); // What: Update Picker Guard. Why: An empty or otherwise invalid typed name should not create a group at all. How: This only commits the picker's own group when tidNamStr is truthy.



		cloGroFun(); // What: Close Group Call. Why: A commit still needs the same teardown every close does. How: This runs the shared close routine after the update above.


	};


	const canGroFun = () => { cloGroFun(); }; // What: Cancel Group Function. Why: Escape (or the cancel button) should discard the typed text without creating anything. How: This just runs the shared close routine, with no update call.

	// #endregion Group Picker



	// #region Close Handling

	// #region comPicFun

	/**
	 * comPicFun = Commit Picker Function
	 *
	 * @summary
	 * Commits an existing picker's draft, once, through the same savEdiFun the
	 * Pickers tab's own edit form uses, so a type change resets the items to the
	 * new type's defaults exactly as it does there. A pressed Fill all or Refill
	 * all then charges the items. Does nothing for a brand-new draft picker
	 * (its own Save creates it), for a Controls already saved, cancelled, or
	 * deleted, or when nothing changed. An emptied name keeps the old one.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * comPicFun() // => void
	 * ```
	 *
	*/

	const comPicFun = () => { // What: Commit Picker Function. Why: Saving or closing Controls keeps its edits. How: This sends a changed draft through savEdiFun, then applies a pending Fill all.


		if ( isaNewBoo || hanCloRef.current ) return; // What: Not Applicable Guard. Why: A new draft commits through its own Save, and a handled close has nothing left to commit. How: This bails out in either case.



		hanCloRef.current = true; // What: Handled Close Mark. Why: Any later unmount must not commit this draft twice. How: This flips hanCloRef.



		const chaPicBoo = JSON.stringify( draPicObj ) !== JSON.stringify( oriPicRef.current ); // What: Changed Picker Boolean. Why: An untouched draft must not rewrite the picker. How: This compares the draft with its starting copy.


		if ( chaPicBoo ) actStoObj.savEdiFun( picDatObj.id, { // What: Save Edit Guard. Why: A changed draft is saved the same way the Pickers tab's edit form saves, and a blank name must never replace the real one. How: This calls savEdiFun with the draft, keeping the original name when the draft's is empty.


			...draPicObj, // What: Draft Picker Spread. Why: Every drafted field must be saved as edited. How: This spreads draPicObj first, so only the name below is overridden.

			name : draPicObj.name.trim() || oriPicRef.current.name // What: Name. Why: A saved picker never keeps stray spaces or a blank name. How: This trims the drafted name, falling back to the original name when it's empty.


		} );



		if ( filAllBoo ) actStoObj.filPicFun( picDatObj.id ); // What: Fill All Guard. Why: A pressed Fill all or Refill all charges the items only on commit. How: This calls filPicFun when filAllBoo is set.


	};

	// #endregion comPicFun



	const canConFun = () => { // What: Cancel Controls Function. Why: Cancel drops the draft and closes Controls. How: This marks the close handled, then collapses Controls.


		hanCloRef.current = true; // What: Handled Close Mark. Why: The unmount must not commit a draft Cancel dropped. How: This flips hanCloRef.

		onColConFun(); // What: Collapse Controls Call. Why: Cancel also closes the Controls disclosure. How: This calls the parent's own collapse callback.


	};


	const savCloFun = () => { // What: Save Close Function. Why: Save keeps the draft and closes Controls. How: This commits the draft, then collapses Controls.


		comPicFun(); // What: Commit Picker Call. Why: Save keeps every change. How: This calls comPicFun.

		onColConFun(); // What: Collapse Controls Call. Why: Save closes the Controls disclosure. How: This calls the parent's own collapse callback.


	};

	// #endregion Close Handling



	return (


		<div className={ cssModObj.ediBodDiv }>{ /* What: Editor Body Div Element. Why: This is PicConCom's own root element, holding Picker Details, How it picks, When it runs, Item Controls, and the footer. How: This renders as a plain div; every field below commits through actStoObj. */ }


			<div className={` ${ cssModObj.conGroDiv }   ${ cssModObj.conGroDivBasics } `}>{ /* What: Basics Group Div Element. Why: Name and Group are grouped as the picker's own basic identity fields. How: This wraps the subhead and the name/group rows below. */ }


				<div className={ cssModObj.conSubDiv }>Picker Details</div>{ /* What: Basics Subhead Div Element. Why: Every Controls group needs its own labeled subhead. How: This renders the literal text "Picker Details". */ }

				<div
					className={ cssModObj.basRowDiv }

					data-element-name-hook='basRowDiv'
				>{ /* What: Name Row Div Element. Why: The Name field needs its own labeled row. How: This wraps the label span and the name input. Its data-element-name-hook is read by help mode's Data catalog. */ }


					<span className={ cssModObj.basLabSpa }>Name</span>{ /* What: Name Label Span Element. Why: The name input needs a visible label beside it. How: This renders the literal text "Name". */ }

					<input
						className={ cssModObj.basNamInp }

						data-element-name-hook='basNamInp'

						maxLength={ 40 }
						placeholder='Picker name'
						type='text'
						value={ draPicObj.name }

						aria-label='Picker name'

						onChange={ ( chaEveObj ) => patPicFun( { name : chaEveObj.target.value } ) }
						onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Enter' ) keyEveObj.currentTarget.blur(); } }
					/>{ /* What: Name Input Element. Why: A picker's own name is edited right in Controls rather than through a separate form. How: This writes every keystroke into the draft, tidied when the draft is committed, and blurs on Enter. Its data-element-name-hook is read by help mode's Data catalog. */ }


				</div>


				<div
					className={` ${ cssModObj.basRowDiv }   ${ cssModObj.basRowDivGroup } `}

					data-element-name-hook='basGroDiv'
				>{ /* What: Group Row Div Element. Why: The Group field needs its own labeled row. How: This wraps the label span and the group pill selector below. Its data-element-name-hook is read by help mode's Data catalog. */ }


					<span className={ cssModObj.basLabSpa }>Group</span>{ /* What: Group Label Span Element. Why: The group selector needs a visible label beside it. How: This renders the literal text "Group". */ }

					<div
						ref={ groPilRef }

						className={ cssModObj.groPilDiv }

						aria-label='Picker group'
						role='radiogroup'
					>{ /* What: Group Pills Div Element. Why: This is the actual radiogroup of every existing group plus the inline "+ New Group" control. How: This maps groChoArr to one pill each, then either the inline input or the "+ New Group" pill. */ }


						{ groChoArr.map( ( groCurStr ) => ( // What: Group Choice Map. Why: One pill is needed per existing group choice. How: This maps groChoArr to one radio-role button each, keyed by its own name.


							<button
								key={ groCurStr }

								className={ cssModObj.groPilBut }

								data-element-name-hook='groPilBut'
								data-g={ groCurStr }

								type='button'

								aria-checked={ draPicObj.group === groCurStr }
								role='radio'

								onClick={ () => patPicFun( { group : groCurStr } ) }
							>{ groCurStr }</button> // What: Group Pill Button Element. Why: Clicking a pill selects that group for this picker. How: This marks itself checked when it matches draPicObj.group and commits groCurStr on click. Its data-element-name-hook is read by PicConCom's own group-rail scrolling.


						) ) }

						{ newGroBoo ? ( // What: New Group Mode Check. Why: The inline create control replaces the "+ New Group" pill entirely while active. How: This renders the input+confirm+cancel trio while newGroBoo is true, otherwise the trigger pill.


							<span className={ cssModObj.groNewSpa }>{ /* What: New Group Span Element. Why: The inline input and its 2 icon buttons need one wrapper to lay out together. How: This groups the text input with its own confirm and cancel buttons. */ }


								<input
									ref={ newGroRef }

									className={ cssModObj.groNewInp }

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
									className={ cssModObj.groOkaBut }

									disabled={ !newGroStr.trim() }
									type='button'

									aria-label='Create group'

									onClick={ cmtGroFun }
								>{ /* What: New Group Ok Button Element. Why: This is the explicit "create this group" affordance beside the input. How: This is disabled while newGroStr is empty and calls cmtGroFun on click. */ }


									<IcoSvgCom
										icoNamStr='cheEle'
										sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
									/>{ /* What: Icon Svg Component. Why: The confirm button needs a recognizable checkmark glyph. How: This renders the 'cheEle' icon at a fixed size. */ }


								</button>

								<button
									className={ cssModObj.groCanBut }

									type='button'

									aria-label='Cancel'

									onClick={ canGroFun }
								>{ /* What: New Group Cancel Button Element. Why: This is the explicit "discard this group" affordance beside the input. How: This calls canGroFun on click. */ }


									<IcoSvgCom
										icoNamStr='croEle'
										sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
									/>{ /* What: Icon Svg Component. Why: The cancel button needs a recognizable close glyph. How: This renders the 'croEle' icon at a fixed size. */ }


								</button>


							</span>


						) : ( // What: New Group Trigger Branch. Why: With no create-in-progress, the row just needs its own plain trigger pill instead of the input. How: This renders the else branch, taken while newGroBoo is false.


							<button
								className={` ${ cssModObj.groPilBut }   ${ cssModObj.groPilButNew }   ${ pilRetBoo ? cssModObj.groPilButReturning : '' } `}

								data-element-name-hook='groPilBut'

								type='button'

								onClick={ () => setNewGroBoo( true ) }
							>{ /* What: New Group Trigger Button Element. Why: This is the affordance that opens the inline create control. How: This opens newGroBoo on click, and plays its own return animation via pilRetBoo after a prior close. Its data-element-name-hook is read by PicConCom's own group-rail scrolling. */ }


								<IcoSvgCom
									icoNamStr='pluEle'
									sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
								/>{ /* What: Icon Svg Component. Why: The trigger pill needs a recognizable "add" glyph beside its own label. How: This renders the 'pluEle' icon at a fixed size. */ } New Group


							</button>


						) }


					</div>


				</div>


			</div>



			<fieldset
				className={` ${ cssModObj.conGroFie }   ${ cssModObj.conGroFiePicks } `}

				data-element-name-hook='picConFie'
			>{ /* What: Picks Group Fieldset Element. Why: The mode radio group is a real form control set and belongs in a fieldset. How: This wraps the legend and the mode radio group below. Its data-element-name-hook is read by help mode's Data catalog. */ }


				<legend className={ cssModObj.conSubLeg }>How it picks</legend>{ /* What: Picks Legend Element. Why: A fieldset needs its own legend to label the radio group it contains. How: This renders the literal text "How it picks". */ }

				<div
					className={ cssModObj.modRadDiv }

					data-element-name-hook='modRadDiv'
				>{ /* What: Mode Radio Div Element. Why: Every supported mode needs its own selectable row. How: This maps Object.entries(SED_NAM_OBJ.MOD_DEF_OBJ) to one label+radio+hint per mode. Its data-element-name-hook is read by help mode's Pickers catalog and help mode's Data catalog. */ }


					{ Object.entries( SED_NAM_OBJ.MOD_DEF_OBJ ).map( ( [ modKeyStr, modValObj ] ) => { // What: Mode Entries Map. Why: One row is needed per supported picking mode. How: This maps every [key, definition] pair in SED_NAM_OBJ.MOD_DEF_OBJ to one label below.


						const modSelBoo = draPicObj.mode === modKeyStr; // What: Mode Selected Boolean. Why: The row's own selected state and its hint's open state both depend on whether this mode is the picker's current one. How: This compares modKeyStr against draPicObj.mode.



						return (


							<label
								key={ modKeyStr }

								className={ cssModObj.modOptLab }

								data-option-select-active={ modSelBoo || undefined }
							>{ /* What: Mode Option Label Element. Why: Each mode is a real radio option, so its own label must wrap the input for a clickable hit area. How: This marks itself with data-option-select-active when modSelBoo is true. */ }


								<input
									className={ cssModObj.modOptInp }

									name={ `mode_${ picDatObj.id }` }

									checked={ modSelBoo }
									type='radio'

									onChange={ () => patPicFun( { mode : modKeyStr as ModNamTyp } ) } // What: On Change Handler. Why: Choosing a mode radio selects that mode on the draft. How: This patches mode with modKeyStr, asserted as a mode name since Object.entries types its keys as plain strings.
								/>{ /* What: Mode Option Input Element. Why: This is the actual selectable control for this mode. How: This is checked when modSelBoo is true and commits modKeyStr as the picker's own mode on change. */ }

								<span
									className={ cssModObj.modDotSpa }

									aria-hidden='true'
								></span>{ /* What: Mode Dot Span Element. Why: The custom radio dot is drawn purely with CSS rather than the native control. How: This is an empty, decorative, screen-reader-hidden span. */ }

								<span className={ cssModObj.modTexSpa }>{ /* What: Mode Text Span Element. Why: The mode's own name and its expandable hint need to sit together beside the radio dot. How: This wraps the name span and the ColDisCom-wrapped hint below. */ }


									<span className={ cssModObj.modNamSpa }>{ modValObj.labStr }</span>{ /* What: Mode Name Span Element. Why: Every mode needs its own visible name. How: This renders modValObj's own label. */ }



									<ColDisCom
										isaInsBoo={ isaNewBoo }
										open={ modSelBoo }
									>{ /* What: Collapse Disclosure Component. Why: The hint expands/collapses on selection change, so the old row's hint folds away while the new one grows. How: This opens only for the currently-selected mode, instant (no animation) for a brand-new draft. */ }


										{ Array.isArray( modValObj.hinArr ) // What: Hint Content Check. Why: A mode's own hint can be either one paragraph or several. How: This maps every paragraph to its own span when hint is an array, otherwise renders the single hint directly.


											? modValObj.hinArr.map( ( parCurStr, parIndNum ) => ( // What: Paragraph Hints Branch. Why: A multi-paragraph hint needs one span per paragraph. How: This maps each paragraph string to its own hint span.


												<span
													key={ parIndNum }

													className={ cssModObj.modHinSpa }
												>{ parCurStr }</span> // What: Hint Paragraph Span Element. Why: Each paragraph renders as its own hint line. How: This renders parCurStr, keyed by its index.


											) )

											: <span className={ cssModObj.modHinSpa }>{ modValObj.hinArr }</span> // What: Single Hint Branch. Why: A one-paragraph hint needs just one span. How: This renders modValObj.hinArr directly.


										}


									</ColDisCom>


								</span>


							</label>


						);


					} ) }


				</div>


			</fieldset>


			<div className={` ${ cssModObj.conGroDiv }   ${ cssModObj.conGroDivSched } `}>{ /* What: Schedule Group Div Element. Why: Attach-a-conditional and daily-generator membership + weekday/holiday gates all describe "when it runs". How: This wraps the subhead and every schedule row below. */ }


				<div className={ cssModObj.conSubDiv }>When it runs</div>{ /* What: Schedule Subhead Div Element. Why: Every Controls group needs its own labeled subhead. How: This renders the literal text "When it runs". */ }

				<div
					className={ cssModObj.schLinDiv }

					data-element-name-hook='schLinDiv'
				>{ /* What: Conditional Line Div Element. Why: The attach-a-conditional toggle needs its own labeled row. How: This wraps the label/sub text and the switch button below. Its data-element-name-hook is read by help mode's Data catalog. */ }


					<span className={ cssModObj.schLabSpa }>{ /* What: Conditional Label Span Element. Why: The toggle's own name and live explanation belong together. How: This wraps the lbl and sub spans below. */ }


						<span className={ cssModObj.schNamSpa }>Attach a conditional</span>{ /* What: Conditional Label Span Element. Why: The row needs its own literal name. How: This renders the literal text "Attach a conditional". */ }

						<span className={ cssModObj.schSubSpa }>{ /* What: Conditional Sub Span Element. Why: The row needs a live one-line explanation of the current state. How: This renders whichever of the 2 explanations below matches whether a conditional is attached. */ }


							{ attConObj // What: Attached Conditional Check. Why: The explanation depends on whether a conditional is attached. How: This picks one of the 2 phrases below based on attConObj.


								? <>triggering rules provided by <strong>{ attConObj.name }</strong> will prevent this picker from running</> // What: Attached Phrase. Why: With a conditional attached, its own triggering rules can stop this picker. How: This names the attached conditional.

								: <>picker <strong>will always run</strong>, attaching a conditional will provide a trigger to prevent it from running</> // What: Unattached Phrase. Why: With nothing attached, the picker always runs, so the phrase suggests attaching one. How: This renders a fixed explanation.


							}


						</span>


					</span>

					<button
						className={ cssModObj.togSwiBut }

						data-element-name-hook='togSwiBut'

						aria-checked={ conAttBoo }
						aria-label='Attach a conditional'
						role='switch'

						onClick={ () => { // What: On Click Handler. Why: Flipping the switch off must also detach whatever conditional is attached. How: This toggles conAttBoo, clearing the draft's conditionalId when the new state is off.


							setConAttBoo( !conAttBoo ); // What: Toggle Set Call. Why: The switch shows its new state. How: This flips conAttBoo.


							if ( conAttBoo && draPicObj.conditionalId ) patPicFun( { conditionalId : null } ); // What: Detach Conditional Guard. Why: Turning the toggle off must also actually detach whatever conditional was attached. How: This clears the draft's conditionalId only when the toggle is turning off with one attached.


						} }
					><i className={ cssModObj.swiKnoIta } />{ /* What: Switch Knob Italic Element. Why: This is the switch's own purely decorative sliding knob. How: This renders empty, positioned entirely via CSS off its parent button's own aria-checked or aria-pressed. */ }</button>{ /* What: Conditional Switch Button Element. Why: This is the actual on/off control for attaching a conditional. How: This flips conAttBoo and, when turning off, clears the picker's own conditionalId. Its data-element-name-hook is read by help mode's Today catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


				</div>



				<ColDisCom open={ conAttBoo }>{ /* What: Collapse Disclosure Component. Why: The conditional rail only needs to exist while the toggle is on. How: This opens only while conAttBoo is true. */ }


					<div
						className={ cssModObj.conRowDiv }

						data-element-name-hook='conRowDiv'
					>{ /* What: Rail Row Div Element. Why: The conditional rail (or its empty-state message) needs its own row. How: This wraps whichever of the 2 branches below applies. Its data-element-name-hook is read by help mode's Data catalog. */ }


						{ conIteArr.length ? ( // What: Has Conditionals Check. Why: The rail only makes sense once at least one conditional exists. How: This renders the rail when conIteArr has entries, otherwise an empty-state message.


							<div
								ref={ raiRefFun }

								className={ cssModObj.conRaiDiv }

								data-element-name-hook='conRaiDiv'
							>{ /* What: Conditional Rail Div Element. Why: This is the actual scrollable pill rail, alphabetical except the attached conditional pins to the front. How: This maps every conditional (sorted per pk.conditionalId first, then by name) to one pill each. Its data-element-name-hook is read by help mode's Pickers catalog and help mode's Data catalog. */ }


								{ [ ...conIteArr ].sort( ( conOneObj, conTwoObj ) => { // What: Attached-First Sort Comparator. Why: The rail pins the attached conditional first, then lists the rest alphabetically. How: This sorts a copy of conIteArr with the rules below.


									if ( conOneObj.id === draPicObj.conditionalId ) return -1; // What: Attached First Guard. Why: The currently-attached conditional always pins to the front. How: This sorts conOneObj ahead whenever it's the attached one.



									if ( conTwoObj.id === draPicObj.conditionalId ) return 1; // What: Attached First Guard. Why: Same reasoning as above, for the other comparison side. How: This sorts conTwoObj ahead whenever it's the attached one.



									return conOneObj.name.localeCompare( conTwoObj.name ); // What: Alphabetical Fallback Return. Why: Every other pair sorts alphabetically by name. How: This compares conOneObj.name against conTwoObj.name.


								} ).map( ( conCurObj ) => ( // What: Conditional Pill Map. Why: One pill is needed per existing conditional. How: This maps the sorted list to one button each, keyed by its own id.


									<button
										key={ conCurObj.id }

										className={ cssModObj.conPilBut }

										data-flip-item-key={ conCurObj.id } // What: Flip Item Key Attribute. Why: The shared reorder animation slides each pill from its old spot to its new one. How: This gives useFliRaiFun the pill's own conditional id to track it by.
										data-pill-select-active={ draPicObj.conditionalId === conCurObj.id || undefined } // What: Pill Select Active Attribute. Why: The attached conditional's pill should stand out. How: This sets the presence-only attribute while this conditional is the picker's own.

										type='button'

										onClick={ () => patPicFun( { conditionalId : conCurObj.id } ) }
									>{ /* What: Conditional Pill Button Element. Why: Clicking a pill attaches that conditional to this picker. How: This marks itself with data-pill-select-active when it matches draPicObj.conditionalId and commits conCurObj.id on click. Its data-flip-item-key is read by useFliRaiFun. */ }


										<span className={ cssModObj.conNamSpa }>{ conCurObj.name }</span>{ /* What: Pill Name Span Element. Why: Every conditional pill needs its own visible name. How: This renders conCurObj's own name. */ }

										<span className={ cssModObj.conModSpa }>{ ( SED_NAM_OBJ.MOD_DEF_OBJ[ conCurObj.mode ] || {} ).labStr || conCurObj.mode }</span>{ /* What: Pill Mode Span Element. Why: Every conditional pill also shows its own mode label. How: This looks up conCurObj's own mode in SED_NAM_OBJ.MOD_DEF_OBJ, falling back to the raw mode key. */ }


									</button>


								) ) }


							</div>


						) : ( // What: No Conditionals Branch. Why: With no conditionals to attach, the rail is replaced by a plain explanatory message. How: This renders the else branch, taken while conIteArr is empty.


							<p className={ cssModObj.conEmpPar }>No conditionals yet. Create one in the Conditionals section below, then attach it here.</p> // What: Empty Rail Paragraph Element. Why: With no conditionals yet, the rail explains where to create one. How: This renders a fixed message pointing at the Conditionals section.


						) }


					</div>


				</ColDisCom>



				<div
					className={ cssModObj.schLinDiv }

					data-element-name-hook='schLinDiv'
				>{ /* What: Daily Line Div Element. Why: The daily-generator membership toggle needs its own labeled row. How: This wraps the label/sub text and the switch button below. Its data-element-name-hook is read by help mode's Data catalog. */ }


					<span className={ cssModObj.schLabSpa }>{ /* What: Daily Label Span Element. Why: The toggle's own name and live explanation belong together. How: This wraps the lbl and sub spans below. */ }


						<span className={ cssModObj.schNamSpa }>In the daily generator</span>{ /* What: Daily Label Span Element. Why: The row needs its own literal name. How: This renders the literal text "In the daily generator". */ }

						<span
							key={ draPicObj.includeInDaily ? 'on' : 'off' }

							className={` ${ cssModObj.schSubSpa }   ${ cssModObj.schSubSpaFade } `}
						>{ /* What: Daily Sub Span Element. Why: The row needs a live one-line explanation, cross-faded via its own key change. How: This renders whichever of the 2 explanations below matches draPicObj.includeInDaily. */ }


							{ draPicObj.includeInDaily // What: Daily Membership Check. Why: The explanation depends on whether the picker is in the daily generator. How: This picks one of the 2 phrases below based on draPicObj.includeInDaily.


								? <>will run <strong>every time</strong> the Today page's daily generator is run</> // What: Daily Phrase. Why: A member picker runs every time the generator does. How: This renders a fixed explanation.

								: <>can only be <strong>run manually</strong> in the Pickers tab</> // What: Manual Phrase. Why: A non-member picker can only be run by hand. How: This renders a fixed explanation pointing at the Pickers tab.


							}


						</span>


					</span>

					<button
						className={ cssModObj.togSwiBut }

						data-element-name-hook='togSwiBut'

						aria-label={ `${ draPicObj.includeInDaily ? 'Remove from' : 'Add to' } the daily generator` }
						aria-pressed={ draPicObj.includeInDaily }

						onClick={ () => patPicFun( { includeInDaily : !draPicObj.includeInDaily } ) } // What: On Click Handler. Why: The switch adds or removes this picker from the daily generator, as part of the draft. How: This flips the draft's includeInDaily.
					><i className={ cssModObj.swiKnoIta } />{ /* What: Switch Knob Italic Element. Why: This is the switch's own purely decorative sliding knob. How: This renders empty, positioned entirely via CSS off its parent button's own aria-checked or aria-pressed. */ }</button>{ /* What: Daily Switch Button Element. Why: This is the actual on/off control for daily-generator membership. How: This flips the draft's includeInDaily on click. Its data-element-name-hook is read by help mode's Today catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


				</div>



				<ColDisCom open={ draPicObj.includeInDaily }>{ /* What: Collapse Disclosure Component. Why: The full cadence/days/holiday schedule only makes sense while this picker is actually in the daily generator. How: This opens only while draPicObj.includeInDaily is true. */ }


					<React.Fragment>{ /* What: Schedule Fragment Element. Why: The 3 schedule rows below are true siblings with no shared wrapper of their own. How: This groups the cadence, days, and holiday rows without adding an extra DOM node. */ }


						<div
							className={ cssModObj.schLinDiv }

							data-element-name-hook='schLinDiv'
						>{ /* What: Cadence Line Div Element. Why: The cadence (how often) control needs its own labeled row. How: This wraps the label/sub text and the cadence selects below. Its data-element-name-hook is read by help mode's Data catalog. */ }


							<span className={ cssModObj.schLabSpa }>{ /* What: Cadence Label Span Element. Why: The row's own name/help tip and live explanation belong together. How: This wraps the lbl row and sub span below. */ }


								<span className={` ${ cssModObj.schNamSpa }   ${ cssModObj.schNamSpaHelp } `}>{ /* What: Cadence Label Span Element. Why: The row needs its own literal name plus a help tip beside it. How: This renders the text "How often?" followed by the InfTipCom below. */ }How often?


									<InfTipCom
										className={ cssModObj.cadHelSpa }

										labTexStr={ CAD_NAM_OBJ.tipMesFun( draPicObj.cadence ) }
									>?</InfTipCom>{ /* What: Info Tip Component. Why: The cadence choice needs a fuller explanation available on demand. How: This shows CAD_NAM_OBJ's own tip text for the picker's current cadence. */ }


								</span>

								<span
									key={ ( draPicObj.cadence || 'daily' ) + ( draPicObj.anchorDow ?? '' ) + ( draPicObj.anchorDom ?? '' ) + ( draPicObj.anchorMonth ?? '' ) + ( draPicObj.anchorDay ?? '' ) + ( draPicObj.dateMode ?? '' ) + ( draPicObj.nthOrdinal ?? '' ) + ( draPicObj.nthWeekday ?? '' ) }

									className={` ${ cssModObj.schSubSpa }   ${ cssModObj.schSubSpaFade } `}
								>{ /* What: Cadence Sub Span Element. Why: The row needs a live one-line summary of the exact configured schedule, cross-faded via its own composite key. How: This computes and returns the matching summary JSX for the picker's current cadence/anchor fields. */ }


									{ ( () => { // What: Cadence Summary Function. Why: The summary depends on cadence, anchor and date mode, which is too much branching for one inline expression. How: This immediately invokes an arrow function that returns the matching phrase.


										const curCadStr = draPicObj.cadence || 'daily';                                                                                                 // What: Current Cadence String. Why: Every branch below needs the picker's own resolved cadence. How: This reads draPicObj.cadence, defaulting to 'daily'.
										const dayFulArr = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ];                                             // What: Day Full Array. Why: The weekly/monthly/yearly branches below all need full weekday names. How: This is indexed by anchorDow/nthWeekday below.
										const monFulArr = [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]; // What: Month Full Array. Why: The yearly branch below needs the full month name. How: This is indexed by anchorMonth below.
										const isaNthBoo = draPicObj.dateMode === 'nthWeekday';                                                                                          // What: Is-A Nth Boolean. Why: Monthly/yearly cadences can anchor either to a fixed date or to an "nth weekday", which read very differently. How: This checks draPicObj.dateMode.
										const taiEndStr = ', and the pick will persist until marked as completed';                                                                      // What: Tail End String. Why: Every non-daily branch below ends with the same trailing clause. How: This is appended to each branch's own JSX below.



										if ( curCadStr === 'daily' ) return ( CAD_OPT_ARR.find( ( optCurObj ) => optCurObj.keyStr === 'daily' ) || {} ).subEle; // What: Daily Branch Return. Why: The daily case reuses CadConCom's own canonical sub-explanation rather than duplicating it. How: This looks up the 'daily' entry in CAD_OPT_ARR.



										if ( curCadStr === 'weekly' ) return <>surfaces once a week, <strong>every { dayFulArr[ draPicObj.anchorDow ?? 0 ] }</strong>{ taiEndStr }</>; // What: Weekly Branch Return. Why: A weekly cadence just needs its own anchor weekday named. How: This reads draPicObj.anchorDow into dayFulArr.



										if ( curCadStr === 'monthly' ) { // What: Monthly Branch Guard. Why: A monthly cadence reads differently depending on whether it's anchored to a date or an nth weekday. How: This returns one of 2 summaries based on isaNthBoo.


											return isaNthBoo // What: Monthly Summary Return. Why: A monthly cadence reads differently anchored to a date vs. an nth weekday. How: This returns one of the 2 summaries below based on isaNthBoo.
												? <>surfaces once a month, <strong>on the { ordSufFun( draPicObj.nthOrdinal ?? 1 ) } { dayFulArr[ draPicObj.nthWeekday ?? 0 ] }</strong>{ taiEndStr }</> // What: Nth-Weekday Monthly Phrase. Why: An nth-weekday anchor names its ordinal and weekday, e.g. "the 2nd Tuesday". How: This reads nthOrdinal and nthWeekday.
												: <>surfaces once a month, <strong>on the { ordSufFun( draPicObj.anchorDom ?? 1 ) }</strong>{ taiEndStr }</>;                                            // What: Date Monthly Phrase. Why: A date anchor names its day of the month, e.g. "the 15th". How: This reads anchorDom.


										}



										return isaNthBoo // What: Yearly Branch Return. Why: The only remaining cadence is yearly, which also reads differently anchored to a date vs. an nth weekday. How: This returns one of 2 summaries based on isaNthBoo.
											? <>surfaces once a year, <strong>on the { ordSufFun( draPicObj.nthOrdinal ?? 1 ) } { dayFulArr[ draPicObj.nthWeekday ?? 0 ] } of { monFulArr[ ( draPicObj.anchorMonth ?? 1 ) - 1 ] }</strong>{ taiEndStr }</> // What: Nth-Weekday Yearly Phrase. Why: An nth-weekday anchor names its ordinal, weekday and month, e.g. "the 2nd Tuesday of June". How: This reads nthOrdinal, nthWeekday and anchorMonth.
											: <>surfaces once a year, <strong>on { monFulArr[ ( draPicObj.anchorMonth ?? 1 ) - 1 ] } { ordSufFun( draPicObj.anchorDay ?? 1 ) }</strong>{ taiEndStr }</>;                                                   // What: Date Yearly Phrase. Why: A date anchor names its month and day, e.g. "June 15th". How: This reads anchorMonth and anchorDay.


									} )() }


								</span>


							</span>

							<div className={ cssModObj.cadConDiv }>{ /* What: Cadence Controls Div Element. Why: The cadence dropdown plus every mode-specific anchor select need their own grouped row. How: This renders the cadence select, then whichever anchor selects match the current cadence/dateMode. */ }


								<select
									className={ cssModObj.cadOptSel }

									value={ draPicObj.cadence || 'daily' }

									aria-label='Cadence'

									onChange={ ( chaEveObj ) => patPicFun( { cadence : chaEveObj.target.value as CadNamTyp } ) } // What: On Change Handler. Why: Choosing a cadence option sets the draft's cadence. How: This patches cadence with the select's value, asserted as a cadence name since a select's value is a plain string.
								>{ /* What: Cadence Select Element. Why: This is the top-level "how often" choice. How: This commits its own value directly as the picker's own cadence field. */ }


									<option value='daily'>Daily</option>{ /* What: Daily Option Element. Why: This choice means the picker surfaces every day. How: Selecting it commits 'daily'. */ }

									<option value='weekly'>Weekly</option>{ /* What: Weekly Option Element. Why: This choice means the picker surfaces once a week. How: Selecting it commits 'weekly'. */ }

									<option value='monthly'>Monthly</option>{ /* What: Monthly Option Element. Why: This choice means the picker surfaces once a month. How: Selecting it commits 'monthly'. */ }

									<option value='yearly'>Yearly</option>{ /* What: Yearly Option Element. Why: This choice means the picker surfaces once a year. How: Selecting it commits 'yearly'. */ }


								</select>

								{ draPicObj.cadence === 'weekly' && ( // What: Weekly Anchor Check. Why: Only a weekly cadence has a single anchor-weekday select. How: This renders the select only while draPicObj.cadence is 'weekly'.


									<select
										className={ cssModObj.cadOptSel }

										value={ draPicObj.anchorDow ?? 0 }

										aria-label='Anchor weekday'

										onChange={ ( chaEveObj ) => patPicFun( { anchorDow : parseInt( chaEveObj.target.value ) } ) }
									>{ /* What: Anchor Weekday Select Element. Why: A weekly cadence needs exactly one weekday to anchor to. How: This commits the chosen index as draPicObj.anchorDow. */ }


										{ [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ].map( ( dayNamStr, dayIndNum ) => ( // What: Weekday Option List Render. Why: One option is needed per real weekday. How: This maps the fixed weekday-name array to one option per entry, keyed by its own dayIndNum.


											<option
												key={ dayIndNum }

												value={ dayIndNum }
											>{ dayNamStr }</option> // What: Weekday Option Element. Why: Each weekday needs its own selectable option. How: This renders dayNamStr, valued by its weekday index.


										) ) }


									</select>


								) }

								{ ( draPicObj.cadence === 'monthly' || draPicObj.cadence === 'yearly' ) && ( // What: Date Mode Check. Why: Only monthly/yearly cadences let the user choose between a fixed date and an nth weekday. How: This renders the select only while draPicObj.cadence is 'monthly' or 'yearly'.


									<select
										className={ cssModObj.cadOptSel }

										value={ draPicObj.dateMode === 'nthWeekday' ? 'nthWeekday' : 'date' }

										aria-label='Day selection'

										onChange={ ( chaEveObj ) => patPicFun( { dateMode : chaEveObj.target.value as DatModTyp } ) } // What: On Change Handler. Why: Choosing a date mode sets how the draft's day is counted. How: This patches dateMode with the select's value, asserted as a date mode since a select's value is a plain string.
									>{ /* What: Date Mode Select Element. Why: This is the switch between anchoring to a fixed date vs. an nth weekday. How: This commits its own value directly as the picker's own dateMode field. */ }


										<option value='date'>Date</option>{ /* What: Date Option Element. Why: This choice means the anchor is a fixed date. How: Selecting it commits 'date'. */ }

										<option value='nthWeekday'>Weekday</option>{ /* What: Weekday Option Element. Why: This choice means the anchor is an nth weekday, e.g. the 2nd Tuesday. How: Selecting it commits 'nthWeekday'. */ }


									</select>


								) }



								{ draPicObj.cadence === 'monthly' && ( draPicObj.dateMode === 'nthWeekday' ? ( // What: Monthly Anchor Check. Why: A monthly cadence's own anchor selects differ entirely depending on dateMode. How: This renders the nth-weekday pair when dateMode is 'nthWeekday', otherwise the single date-of-month select.


									<React.Fragment>{ /* What: Nth Weekday Fragment Element. Why: The week-of-month and weekday selects are true siblings with no shared wrapper of their own. How: This groups both selects without adding an extra DOM node. */ }


										<select
											className={ cssModObj.cadOptSel }

											value={ draPicObj.nthOrdinal ?? 1 }

											aria-label='Week of the month'

											onChange={ ( chaEveObj ) => patPicFun( { nthOrdinal : parseInt( chaEveObj.target.value ) } ) }
										>{ /* What: Nth Ordinal Select Element. Why: An nth-weekday monthly cadence needs its own "first/second/.../last" ordinal. How: This commits the chosen number as draPicObj.nthOrdinal. */ }


											{ [ 1, 2, 3, 4, 5 ].map( ( ordValNum ) => ( // What: Ordinal Option List Render. Why: One option is needed per possible occurrence, 1st through 5th. How: This maps the fixed [1..5] array to one option per entry, keyed by its own ordValNum, labeled via CAD_NAM_OBJ.sumCadFun.


												<option
													key={ ordValNum }

													value={ ordValNum }
												>{ CAD_NAM_OBJ.sumCadFun( { anchorDom : ordValNum, cadence : 'monthly' } ).split( '· ' )[ 1 ] }</option> // What: Ordinal Option Element. Why: Each week-of-month ordinal needs its own selectable option. How: This reuses sumCadFun to spell the ordinal, e.g. "2nd".


											) ) }


										</select>

										<select
											className={ cssModObj.cadOptSel }

											value={ draPicObj.nthWeekday ?? 0 }

											aria-label='Weekday'

											onChange={ ( chaEveObj ) => patPicFun( { nthWeekday : parseInt( chaEveObj.target.value ) } ) }
										>{ /* What: Nth Weekday Select Element. Why: An nth-weekday monthly cadence also needs its own target weekday. How: This commits the chosen index as draPicObj.nthWeekday. */ }


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
										className={ cssModObj.cadOptSel }

										value={ draPicObj.anchorDom ?? 1 }

										aria-label='Anchor day of month'

										onChange={ ( chaEveObj ) => patPicFun( { anchorDom : parseInt( chaEveObj.target.value ) } ) }
									>{ /* What: Anchor Dom Select Element. Why: A date-anchored monthly cadence needs its own day-of-month. How: This commits the chosen number as draPicObj.anchorDom. */ }


										{ Array.from( Array( 31 ).keys(), ( arrIndNum ) => arrIndNum + 1 ).map( ( domValNum ) => ( // What: Day Of Month Option List Render. Why: One option is needed per possible day of month, 1 through 31. How: This maps a generated 1-31 array to one option per entry, keyed by its own domValNum, labeled via CAD_NAM_OBJ.sumCadFun.


											<option
												key={ domValNum }

												value={ domValNum }
											>{ CAD_NAM_OBJ.sumCadFun( { anchorDom : domValNum, cadence : 'monthly' } ).split( '· ' )[ 1 ] }</option> // What: Day Option Element. Why: Each day of the month needs its own selectable option. How: This reuses sumCadFun to spell the ordinal day, e.g. "15th".


										) ) }


									</select>


								) ) }



								{ draPicObj.cadence === 'yearly' && ( draPicObj.dateMode === 'nthWeekday' ? ( // What: Yearly Anchor Check. Why: A yearly cadence's own anchor selects also differ entirely depending on dateMode. How: This renders the nth-weekday trio when dateMode is 'nthWeekday', otherwise the month+day pair.


									<React.Fragment>{ /* What: Nth Weekday Fragment Element. Why: The week-of-month, weekday, and month selects are true siblings with no shared wrapper of their own. How: This groups all 3 selects without adding an extra DOM node. */ }


										<select
											className={ cssModObj.cadOptSel }

											value={ draPicObj.nthOrdinal ?? 1 }

											aria-label='Week of the month'

											onChange={ ( chaEveObj ) => patPicFun( { nthOrdinal : parseInt( chaEveObj.target.value ) } ) }
										>{ /* What: Nth Ordinal Select Element. Why: An nth-weekday yearly cadence needs its own "first/second/.../last" ordinal. How: This commits the chosen number as draPicObj.nthOrdinal. */ }


											{ [ 1, 2, 3, 4, 5 ].map( ( ordValNum ) => ( // What: Ordinal Option List Render. Why: One option is needed per possible occurrence, 1st through 5th. How: This maps the fixed [1..5] array to one option per entry, keyed by its own ordValNum, labeled via CAD_NAM_OBJ.sumCadFun.


												<option
													key={ ordValNum }

													value={ ordValNum }
												>{ CAD_NAM_OBJ.sumCadFun( { anchorDom : ordValNum, cadence : 'monthly' } ).split( '· ' )[ 1 ] }</option> // What: Ordinal Option Element. Why: Each week-of-month ordinal needs its own selectable option. How: This reuses sumCadFun to spell the ordinal, e.g. "2nd".


											) ) }


										</select>

										<select
											className={ cssModObj.cadOptSel }

											value={ draPicObj.nthWeekday ?? 0 }

											aria-label='Weekday'

											onChange={ ( chaEveObj ) => patPicFun( { nthWeekday : parseInt( chaEveObj.target.value ) } ) }
										>{ /* What: Nth Weekday Select Element. Why: An nth-weekday yearly cadence also needs its own target weekday. How: This commits the chosen index as draPicObj.nthWeekday. */ }


											{ [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ].map( ( dayNamStr, dayIndNum ) => ( // What: Weekday Option List Render. Why: One option is needed per real weekday. How: This maps the fixed weekday-name array to one option per entry, keyed by its own dayIndNum.


												<option
													key={ dayIndNum }

													value={ dayIndNum }
												>{ dayNamStr }</option> // What: Weekday Option Element. Why: Each weekday needs its own selectable option. How: This renders dayNamStr, valued by its weekday index.


											) ) }


										</select>

										<select
											className={ cssModObj.cadOptSel }

											value={ draPicObj.anchorMonth ?? 1 }

											aria-label='Anchor month'

											onChange={ ( chaEveObj ) => patPicFun( { anchorMonth : parseInt( chaEveObj.target.value ) } ) }
										>{ /* What: Anchor Month Select Element. Why: An nth-weekday yearly cadence also needs its own target month. How: This commits the chosen 1-based month number as draPicObj.anchorMonth. */ }


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
											className={ cssModObj.cadOptSel }

											value={ draPicObj.anchorMonth ?? 1 }

											aria-label='Anchor month'

											onChange={ ( chaEveObj ) => patPicFun( { anchorMonth : parseInt( chaEveObj.target.value ) } ) }
										>{ /* What: Anchor Month Select Element. Why: A date-anchored yearly cadence needs its own target month. How: This commits the chosen 1-based month number as draPicObj.anchorMonth. */ }


											{ [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ].map( ( monNamStr, monIndNum ) => ( // What: Month Option List Render. Why: One option is needed per real month. How: This maps the fixed month-abbreviation array to one option per entry, keyed by its own 1-indexed monIndNum.


												<option
													key={ monIndNum }

													value={ monIndNum + 1 }
												>{ monNamStr }</option> // What: Month Option Element. Why: Each month needs its own selectable option. How: This renders monNamStr, valued by its 1-based month number.


											) ) }


										</select>

										<select
											className={ cssModObj.cadOptSel }

											value={ Math.min( draPicObj.anchorDay ?? 1, dimCouFun( 2024, draPicObj.anchorMonth ?? 1 ) ) }

											aria-label='Anchor day'

											onChange={ ( chaEveObj ) => patPicFun( { anchorDay : parseInt( chaEveObj.target.value ) } ) }
										>{ /* What: Anchor Day Select Element. Why: A date-anchored yearly cadence also needs its own day-of-month, clamped to whatever the chosen month actually allows. How: This commits the chosen number as draPicObj.anchorDay. */ }


											{ Array.from( Array( dimCouFun( 2024, draPicObj.anchorMonth ?? 1 ) ).keys(), ( arrIndNum ) => arrIndNum + 1 ).map( ( domValNum ) => ( // What: Anchor Day Option List Render. Why: One option is needed per possible day within the anchor month's own real length. How: This maps a generated array sized by dimCouFun to one option per entry, keyed by its own domValNum.


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
							className={ cssModObj.schLinDiv }

							data-element-name-hook='schLinDiv'
						>{ /* What: Days Line Div Element. Why: The weekday multi-select needs its own labeled row. How: This wraps the label/sub text and the WeeChiCom control below. Its data-element-name-hook is read by help mode's Data catalog. */ }


							<span className={ cssModObj.schLabSpa }>{ /* What: Days Label Span Element. Why: The row's own name and live explanation belong together. How: This wraps the lbl and sub spans below. */ }


								<span className={ cssModObj.schNamSpa }>Days</span>{ /* What: Days Label Span Element. Why: The row needs its own literal name. How: This renders the literal text "Days". */ }

								<span
									key={ ( draPicObj.daysOfWeek || [] ).join( ',' ) }

									className={` ${ cssModObj.schSubSpa }   ${ cssModObj.schSubSpaFade } `}
								>{ /* What: Days Sub Span Element. Why: The row needs a live one-line summary of the chosen weekdays, cross-faded via its own key. How: This lists every chosen day, or a prompt when none are chosen. */ }


									{ ( draPicObj.daysOfWeek && draPicObj.daysOfWeek.length ) // What: Chosen Days Check. Why: The summary depends on whether any weekday is chosen. How: This picks one of the 2 phrases below based on daysOfWeek having entries.


										? <>runs in the daily generator every <strong>{ [ ...draPicObj.daysOfWeek ].sort( ( dayOneNum, dayTwoNum ) => dayOneNum - dayTwoNum ).map( ( dayNumVal ) => [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ][ dayNumVal ] ).join( ', ' ) }</strong></> // What: Chosen Days Phrase. Why: At least one day is chosen, so the summary lists them in week order. How: This sorts a copy of daysOfWeek, maps each to its abbreviation, and joins them.

										: 'pick at least one day' // What: No Days Phrase. Why: With no day chosen the picker never runs, so the row prompts for one. How: This renders a fixed prompt.


									}


								</span>


							</span>



							<WeeChiCom
								locDayNum={ draPicObj.cadence === 'weekly' ? ( draPicObj.anchorDow ?? 0 ) : null }
								locTipStr={ draPicObj.cadence === 'weekly' ? CAD_NAM_OBJ.locTipFun( draPicObj.anchorDow ?? 0 ) : '' }
								sizValStr='sm'
								value={ draPicObj.daysOfWeek || [ 0, 1, 2, 3, 4, 5, 6 ] }

								onChange={ ( dayValArr ) => patPicFun( { daysOfWeek : dayValArr } ) }
							/>{ /* What: Weekday Chips Component. Why: This is the actual multi-select for which weekdays this picker runs on. How: This locks the anchor weekday when draPicObj.cadence is 'weekly', otherwise every day is freely toggleable. */ }


						</div>

						<div
							className={ cssModObj.schLinDiv }

							data-element-name-hook='schLinDiv'
						>{ /* What: Holiday Line Div Element. Why: The skip-on-holidays toggle needs its own labeled row. How: This wraps the label/sub text and the switch button below. Its data-element-name-hook is read by help mode's Data catalog. */ }


							<span className={ cssModObj.schLabSpa }>{ /* What: Holiday Label Span Element. Why: The toggle's own name and live explanation belong together. How: This wraps the lbl and sub spans below. */ }


								<span className={ cssModObj.schNamSpa }>Skip on holidays</span>{ /* What: Holiday Label Span Element. Why: The row needs its own literal name. How: This renders the literal text "Skip on holidays". */ }

								<span
									key={ draPicObj.skipHolidays ? 'on' : 'off' }

									className={` ${ cssModObj.schSubSpa }   ${ cssModObj.schSubSpaFade } `}
								>{ /* What: Holiday Sub Span Element. Why: The row needs a live one-line explanation, cross-faded via its own key change. How: This renders whichever of the 2 explanations below matches draPicObj.skipHolidays. */ }


									{ draPicObj.skipHolidays // What: Skip Holidays Check. Why: The explanation depends on the holiday setting. How: This picks one of the 2 phrases below based on skipHolidays.


										? <><strong>will not run</strong> in the daily generator on holidays</> // What: Skip Holidays Phrase. Why: The picker sits out holidays. How: This renders a fixed explanation.

										: <><strong>will run</strong> in the daily generator on holidays</> // What: Run Holidays Phrase. Why: The picker runs on holidays like any other day. How: This renders a fixed explanation.


									}


								</span>


							</span>

							<button
								className={ cssModObj.togSwiBut }

								data-element-name-hook='togSwiBut'

								aria-label='Skip on holidays'
								aria-pressed={ !!draPicObj.skipHolidays }

								onClick={ () => patPicFun( { skipHolidays : !draPicObj.skipHolidays } ) }
							><i className={ cssModObj.swiKnoIta } />{ /* What: Switch Knob Italic Element. Why: This is the switch's own purely decorative sliding knob. How: This renders empty, positioned entirely via CSS off its parent button's own aria-checked or aria-pressed. */ }</button>{ /* What: Holiday Switch Button Element. Why: This is the actual on/off control for skipping holidays. How: This flips draPicObj.skipHolidays on click. Its data-element-name-hook is read by help mode's Today catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


						</div>


					</React.Fragment>


				</ColDisCom>



				<ColDisCom open={ !draPicObj.includeInDaily }>{ /* What: Collapse Disclosure Component. Why: The "runs on demand only" note only makes sense while this picker is NOT in the daily generator. How: This opens only while draPicObj.includeInDaily is false. */ }


					<div className={ cssModObj.offNotDiv }>Runs on demand only, not in the daily generator.</div>{ /* What: Off Note Div Element. Why: A picker outside the daily generator gets a short reminder that it only runs by hand. How: This renders a fixed note. */ }


				</ColDisCom>


			</div>


			<div className={` ${ cssModObj.conGroDiv }   ${ cssModObj.conGroDivItems } `}>{ /* What: Item Controls Group Div Element. Why: Avoid-duplicates and Fill/Refill both act on this picker's ITEMS rather than its own type/schedule, so they get their own separate group. How: This wraps the subhead, the avoid-duplicates row, and the Fill/Refill row below. */ }


				<div className={ cssModObj.conSubDiv }>Item Controls</div>{ /* What: Item Controls Subhead Div Element. Why: Every Controls group needs its own labeled subhead. How: This renders the literal text "Item Controls". */ }

				<div
					className={ cssModObj.schLinDiv }

					data-element-name-hook='schLinDiv'
				>{ /* What: Duplicates Line Div Element. Why: The avoid-duplicate-items toggle needs its own labeled row. How: This wraps the label/sub text and the switch button below. Its data-element-name-hook is read by help mode's Data catalog. */ }


					<span className={ cssModObj.schLabSpa }>{ /* What: Duplicates Label Span Element. Why: The toggle's own name and live explanation belong together. How: This wraps the lbl and sub spans below. */ }


						<span className={ cssModObj.schNamSpa }>Avoid duplicate items</span>{ /* What: Duplicates Label Span Element. Why: The row needs its own literal name. How: This renders the literal text "Avoid duplicate items". */ }

						<span
							key={ draPicObj.avoidDuplicates ? 'on' : 'off' }

							className={` ${ cssModObj.schSubSpa }   ${ cssModObj.schSubSpaFade } `}
						>{ /* What: Duplicates Sub Span Element. Why: The row needs a live one-line explanation, cross-faded via its own key change. How: This renders whichever of the 2 explanations below matches draPicObj.avoidDuplicates. */ }


							{ draPicObj.avoidDuplicates // What: Avoid Duplicates Check. Why: The explanation depends on the duplicates setting. How: This picks one of the 2 phrases below based on avoidDuplicates.


								? <><strong>won't pick</strong> an item whose name is already on today's todo list</> // What: Avoid Duplicates Phrase. Why: The picker skips items already on today's list. How: This renders a fixed explanation.

								: <><strong>may pick</strong> an item even if its name is already on today's todo list</> // What: Allow Duplicates Phrase. Why: The picker may repeat an item already on today's list. How: This renders a fixed explanation.


							}


						</span>


					</span>

					<button
						className={ cssModObj.togSwiBut }

						data-element-name-hook='togSwiBut'

						aria-label='Avoid duplicate items'
						aria-pressed={ !!draPicObj.avoidDuplicates }

						onClick={ () => patPicFun( { avoidDuplicates : !draPicObj.avoidDuplicates } ) }
					><i className={ cssModObj.swiKnoIta } />{ /* What: Switch Knob Italic Element. Why: This is the switch's own purely decorative sliding knob. How: This renders empty, positioned entirely via CSS off its parent button's own aria-checked or aria-pressed. */ }</button>{ /* What: Duplicates Switch Button Element. Why: This is the actual on/off control for avoiding duplicate items. How: This flips draPicObj.avoidDuplicates on click. Its data-element-name-hook is read by help mode's Today catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


				</div>



				<ColDisCom open={ isaEasBoo }>{ /* What: Collapse Disclosure Component. Why: Fill/Refill only makes sense for an ease-mode picker. How: This opens only while isaEasBoo is true. */ }


					<div
						className={ cssModObj.easConDiv }

						data-ease-down-active={ isaDowBoo || undefined } // What: Ease Down Active Attribute. Why: Help mode finds this section as the ease-down one without reading its classes. How: This is present only while isaDowBoo is true, since undefined drops the attribute entirely.
						data-ease-up-active={ !isaDowBoo || undefined } // What: Ease Up Active Attribute. Why: Help mode finds this section as the ease-up one without reading its classes. How: This is present only while isaDowBoo is false, since undefined drops the attribute entirely.
						data-element-name-hook='easConDiv'
					>{ /* What: Ease Config Div Element. Why: Help mode gives this section mode-specific copy (Fill vs. Refill), telling the two apart by its ease-up/ease-down state attributes. How: This wraps whichever of the 2 mode-specific rows below matches draPicObj.mode. Its data-element-name-hook is read by help mode's Data catalog. */ }


						{ draPicObj.mode === 'ease-up' && ( // What: Ease Up Check. Why: Only ease-up gets the "Fill" wording and action. How: This renders the Fill row only while draPicObj.mode is 'ease-up'.


							<div
								className={ cssModObj.ediRowDiv }

								data-element-name-hook='ediRowDiv'
							>{ /* What: Fill Row Div Element. Why: The Fill label/summary and its button need their own row. How: This wraps the rowlabel div and the FilButCom below. Its data-element-name-hook is read by the picker mini-tours, help mode's Today catalog, the help items' own unit-word lookups, help mode's Pickers catalog, and help mode's Data catalog. */ }


								<div className={ cssModObj.ediLabDiv }>{ /* What: Fill Rowlabel Div Element. Why: The Fill label and its live summary belong together. How: This wraps the lbl and sub spans below. */ }


									<span className={ cssModObj.ediNamSpa }>Fill</span>{ /* What: Fill Label Span Element. Why: The row needs its own literal name. How: This renders the literal text "Fill". */ }

									<span className={ cssModObj.ediSubSpa }>{ filSubEle }</span>{ /* What: Fill Sub Span Element. Why: The row needs a live summary of how many items still need charging. How: This renders filSubEle. */ }


								</div>



								<FilButCom
									isaDisBoo={ picIteArr.length > 0 && notFulNum === 0 } // What: Is-A Disabled Boolean. Why: Fill has nothing left to do once every item is charged, or once a Fill all is already pending in the draft. How: This disables the button when notFulNum is 0.
									labTexStr='Fill all'

									onFilActFun={ () => setFilAllBoo( true ) } // What: On Fill Action Function. Why: Fill all is part of the draft, applied to the items only when Controls is committed. How: This flips filAllBoo.
								/>{ /* What: Fill Button Component. Why: This is the actual bulk-charge action for an ease-up picker. How: This is disabled once every item is already at threshold or a Fill all is pending, and marks a Fill all in the draft on click. */ }


							</div>


						) }


						{ draPicObj.mode === 'ease-down' && ( // What: Ease Down Check. Why: Only ease-down gets the "Refill" wording and action. How: This renders the Refill row only while draPicObj.mode is 'ease-down'.


							<div
								className={ cssModObj.ediRowDiv }

								data-element-name-hook='ediRowDiv'
							>{ /* What: Refill Row Div Element. Why: The Refill label/summary and its button need their own row. How: This wraps the rowlabel div and the FilButCom below. Its data-element-name-hook is read by the picker mini-tours, help mode's Today catalog, the help items' own unit-word lookups, help mode's Pickers catalog, and help mode's Data catalog. */ }


								<div className={ cssModObj.ediLabDiv }>{ /* What: Refill Rowlabel Div Element. Why: The Refill label and its live summary belong together. How: This wraps the lbl and sub spans below. */ }


									<span className={ cssModObj.ediNamSpa }>Refill</span>{ /* What: Refill Label Span Element. Why: The row needs its own literal name. How: This renders the literal text "Refill". */ }

									<span className={ cssModObj.ediSubSpa }>{ filSubEle }</span>{ /* What: Refill Sub Span Element. Why: The row needs a live summary of how many items still need charging. How: This renders filSubEle. */ }


								</div>



								<FilButCom
									isaDisBoo={ picIteArr.length > 0 && notFulNum === 0 } // What: Is-A Disabled Boolean. Why: Refill has nothing left to do once every item is charged, or once a Refill all is already pending in the draft. How: This disables the button when notFulNum is 0.
									labTexStr='Refill all'

									onFilActFun={ () => setFilAllBoo( true ) } // What: On Fill Action Function. Why: Refill all is part of the draft, applied to the items only when Controls is committed. How: This flips filAllBoo.
								/>{ /* What: Fill Button Component. Why: This is the actual bulk-charge action for an ease-down picker. How: This is disabled once every item is already at threshold or a Fill all is pending, and marks a Fill all in the draft on click. */ }


							</div>


						) }


					</div>


				</ColDisCom>


			</div>



			<div
				className={` ${ cssModObj.conGroDiv }   ${ cssModObj.conGroDivFoot } `}

				data-element-name-hook='picFooDiv'
			>{ /* What: Footer Group Div Element. Why: Delete/Cancel/Save (or the new-draft Cancel/Add-Items/Save variant) needs its own bottom group. How: This renders whichever of the 3 footer states below matches conDelBoo/isaNewBoo. Its data-element-name-hook is read by help mode's Data catalog. */ }


				{ conDelBoo ? ( // What: Confirm Delete Check. Why: A real picker's Delete morphs the footer into an inline confirm before actually deleting. How: This renders the confirm row while conDelBoo is true.


					<div
						key='confirm'

						className={ cssModObj.delConDiv }
					>{ /* What: Delete Confirm Div Element. Why: The confirm message and its own Cancel/Delete buttons need their own grouped row. How: This wraps the confirm message and the delActDiv row below. */ }


						<div className={ cssModObj.delMesDiv }>Delete the &ldquo;{ draPicObj.name }&rdquo; picker? This will also delete its { picIteArr.length } { picIteArr.length === 1 ? 'item' : 'items' }. This can&rsquo;t be undone.</div>{ /* What: Delete Message Div Element. Why: A destructive action needs an explicit, specific warning before it happens. How: This names the picker and states exactly how many items will also be deleted. */ }

						<div className={ cssModObj.delActDiv }>{ /* What: Delete Actions Div Element. Why: The confirm's own Cancel and Delete buttons need their own row. How: This wraps both ButBasCom instances below. */ }


							<ButBasCom
								kinValStr='ghost'
								sizValStr='sm'

								onClick={ () => setConDelBoo( false ) }
							>Cancel</ButBasCom>{ /* What: Button Base Component. Why: Backing out of the confirm should not delete anything. How: This just closes the confirm row. */ }



							<ButBasCom
								kinValStr='danger'
								sizValStr='sm'

								onClick={ () => { // What: On Click Handler. Why: Deleting the picker ends this Controls, so its unmount must not commit the draft. How: This marks the close handled, then deletes through onReqDelFun or delPicFun.


									hanCloRef.current = true; // What: Handled Close Mark. Why: A deleted picker's draft must never be committed. How: This flips hanCloRef.



									if ( onReqDelFun ) onReqDelFun(); // What: Request Delete Branch. Why: The caller may animate the removal itself. How: This calls onReqDelFun when supplied.

									else actStoObj.delPicFun( picDatObj.id ); // What: Direct Delete Branch. Why: Without a caller handler the picker is removed directly. How: This calls delPicFun.


								} }
							>Delete</ButBasCom>{ /* What: Button Base Component. Why: This is the actual, final destructive action. How: This calls onReqDelFun when the caller wants to animate the removal itself, otherwise removes the picker directly. */ }


						</div>


					</div>


				) : isaNewBoo ? ( // What: Is-A New Draft Check. Why: A brand-new draft picker gets a no-Delete Cancel/Add-Items-then-Save footer instead of the normal one. How: This renders the new-draft row while isaNewBoo is true (and conDelBoo is false).


					<div
						key='foot-new'

						className={` ${ cssModObj.fooRowDiv }   ${ cssModObj.fooRowDivNew } `}
					>{ /* What: New Footer Row Div Element. Why: The new-draft footer's own Cancel/Save buttons need their own row. How: This wraps the fooRigDiv div below. */ }


						<div className={ cssModObj.fooRigDiv }>{ /* What: Footer Right Div Element. Why: The Cancel and Save buttons anchor to the footer's own right edge. How: This wraps the ButBasCom and InfTipCom-wrapped ButBasCom below. */ }


							<ButBasCom
								kinValStr='ghost'
								sizValStr='sm'

								onClick={ () => { // What: On Click Handler. Why: Cancelling a brand-new draft discards it, so the unmount that follows must not commit anything. How: This marks the close handled, then calls onCanNewFun.


									hanCloRef.current = true; // What: Handled Close Mark. Why: The unmount must not commit a discarded draft. How: This flips hanCloRef.

									onCanNewFun(); // What: Cancel New Call. Why: A brand-new draft's Cancel discards the whole picker. How: This calls the parent's own onCanNewFun.


								} }
							>Cancel</ButBasCom>{ /* What: Button Base Component. Why: A brand-new draft's Cancel discards the whole thing. How: This marks the close handled, then calls onCanNewFun. */ }



							<InfTipCom labTexStr={ fooTipStr }>{ /* What: Info Tip Component. Why: The footer button's own current disabled reason (or confirmation once ready) needs to be available on demand. How: This shows fooTipStr, wrapping the ButBasCom below. */ }


								<ButBasCom
									disabled={ fooDisBoo }
									kinValStr='primary'
									sizValStr='sm'

									onClick={ fooDisBoo ? undefined : fooActFun } // What: On Click Handler. Why: The primary footer button only acts while it's enabled. How: This is undefined while fooDisBoo, otherwise fooActFun.
								>{ fooLabStr }</ButBasCom>{ /* What: Button Base Component. Why: This is the new-draft footer's own primary action, reading "Add Items" or "Save" depending on progress. How: This calls fooActFun, disabled until its current step's prerequisites are met. */ }


							</InfTipCom>


						</div>


					</div>


				) : ( // What: Normal Footer Check. Why: An existing, non-draft picker gets the full Delete/Cancel/Save footer. How: This is the fallback branch once neither conDelBoo nor isaNewBoo applies.


					<div
						key='foot'

						className={ cssModObj.fooRowDiv }
					>{ /* What: Foot Row Div Element. Why: Delete (left) and Cancel/Save (right) both belong in the same footer row. How: This wraps the Delete ButBasCom and the fooRigDiv div below. */ }


						<ButBasCom
							icoNamStr='traEle'
							kinValStr='danger'
							sizValStr='sm'

							onClick={ () => setConDelBoo( true ) }
						>Delete</ButBasCom>{ /* What: Button Base Component. Why: This opens the inline delete confirm rather than deleting immediately. How: This sets conDelBoo true on click. */ }



						<div className={ cssModObj.fooRigDiv }>{ /* What: Footer Right Div Element. Why: Cancel and Save anchor to the footer's own right edge. How: This wraps both ButBasCom instances below. */ }


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



			<UnmWatCom onUnmWatFun={ comPicFun } />{ /* What: Unmount Watcher Component. Why: Controls that close without Save (collapsing Controls or its card, a filter hiding the picker, a tab switch) still keep their edits. How: This calls comPicFun when Controls unmounts, which skips a draft already saved, cancelled, or deleted. */ }


		</div>


	);


}

// #endregion PicConCom

// #endregion Components



// #region Exports

export { PicConCom }; // What: Named Export. Why: TabDatCom renders this body inside each picker card's Controls disclosure. How: This exports PicConCom by name.

// #endregion Exports


