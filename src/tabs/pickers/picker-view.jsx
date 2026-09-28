


// #region Imports

import React from 'react'; // What: React. Why: PicVieCom is built directly on React's own APIs. How: This is used directly (React.useEffect, React.useMemo, React.useRef, React.useState, React.Fragment) instead of importing individual named hooks.


import { ButBasCom    } from '../../ui/button.jsx';       // What: Button Base Component. Why: Pick One, Re-roll, Done and the pool actions need consistently-styled controls. How: This is rendered for each of those actions.
import { EntEdiCom    } from '../../ui/entry-editor.jsx'; // What: Entry Editor Component. Why: Adding or editing a pool item reuses the exact same weight/ease editor the Today tab uses. How: This is rendered inline below the pool list, wired to either the real store actions or a local draft-item actions object.
import { IcoSvgCom    } from '../../ui/icon.jsx';         // What: Icon Svg Component. Why: Buttons and status rows throughout this file need a small recognizable glyph. How: This is rendered wherever an icon is needed, given a name and a size.
import { InfTipCom    } from '../../ui/info-tip.jsx';     // What: Info Tip Component. Why: Several controls need an explanatory tooltip on hover/focus. How: This wraps the weight/value pills and the disabled Send/Delete buttons, given the tooltip's own label text.
import { PIC_NAM_OBJ  } from '../../core/pickers.js';     // What: Pickers Namespace Object. Why: This is the namespace of pure picking-engine functions this file drives every actual pick through. How: This is called throughout for PIC_NAM_OBJ.picIteFun/reaValFun/modEliFun/aveEasFun.
import { PicForCom    } from './picker-form.jsx';         // What: Picker Form Component. Why: Editing a picker's details reuses the create form's Details step. How: This is rendered in place of the view while ediOpeBoo is on.
import { PicStrCom    } from '../../ui/picker-strip.jsx'; // What: Picker Strip Component. Why: Pick One plays the shared reel, spotlight, or dissolve reveal before showing its result. How: This is rendered in the run stage while a pick is cycling.
import { PilTagCom    } from '../../ui/pill-tag.jsx';     // What: Pill Tag Component. Why: Small status labels need a consistent pill styling. How: This wraps the mode name, the 'inactive' tag, and the 'not yet'/'spent' tag.
import { ProBarCom    } from './progress-bar.jsx';        // What: Progress Bar Component. Why: A pool item's drift value needs a visual readiness bar, not just a raw number. How: This is rendered inside the pool row's InfTipCom alongside the raw value.
import { redMotFun    } from '../../utils/motion.js';     // What: Reduce Motion Function. Why: Several exit/scroll animations must be skipped for a user who prefers reduced motion. How: This is checked before every animated scroll, exit delay, or the reel/spotlight/dissolve cycle itself.
import { SED_NAM_OBJ  } from '../../state/seed.js';       // What: Seed Namespace Object. Why: This is the canonical lookup of every picker mode's own label and hint text. How: This is read (MOD_DEF_OBJ) throughout to show the active mode's label/hint and to render the mode-choice radio list.
import { useEmlTouFun } from '../../state/tour-bus.js';   // What: Use Ease My Life Tour Function. Why: Several behaviors here read the shared tour bus as React state. How: This is called once per component to subscribe to the picker mini-tour's nonces, the page tour's gating, and the empty-state create prefill.

// #endregion Imports



/**
 * picker-view.jsx = Picker View
 *
 * @summary
 * One picker's own view on the Pickers tab: a random Pick One that plays the
 * shared PicStrCom reveal before offering Re-roll or Send to Today, the pool
 * list with each item's own drift or weight, and per-item send, edit and
 * delete. Several flags narrow specific buttons while a guided tour is walking
 * the user through this screen.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

// #region PicVieCom

/**
 * PicVieCom = Picker View Component
 *
 * @summary
 * The heart of the app: shows the currently-selected picker, lets the user
 * either run a random "Pick One" (playing the reel/spotlight/dissolve cycle
 * from PicStrCom) or manually send/edit/delete individual pool items, and
 * renders the pool list itself with each item's own drift/weight state.
 * Several of its own flags exist purely to narrow or disable specific
 * buttons while either the Pickers page tour or the App Features manual-
 * pick tour is walking a user through this exact screen, without those
 * concerns leaking into the tours' own files.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actStoObj - Action Store Object: {@link useAppStaFun}
 * @param props.aniStyStr - Animation Style String: Which PicStrCom animation
 *                          style to play: 'reel', 'spotlight', or
 *                          'dissolve'.
 * @param props.picDatObj - Picker Data Object: The currently-selected
 *                          picker record this view renders.
 * @param props.staAppObj - State App Object: {@link useAppStaFun}
 *
 * @returns Either the picker's own edit form (PicForCom, while ediOpeBoo
 * is true) or the full picker view: its run stage, its action buttons,
 * and its pool list.
 *
 * @example
 * ```tsx
 * PicVieCom({ actStoObj, aniStyStr, picDatObj, ... }) // => <PicVieCom />
 * ```
 *
*/

function PicVieCom ( { actStoObj, aniStyStr, picDatObj, staAppObj } ) {


	// #region Tour Gating

	const touBusObj = useEmlTouFun();                 // What: Tour Bus Object. Why: Several buttons on this view must narrow or disable themselves while a guided tour is walking through this exact screen. How: This subscribes to the shared tour event bus, read via its own touPhaStr/touIdeStr/touSteNum fields below.
	const isaTouBoo = touBusObj.touPhaStr === 'tour'; // What: Is-A Tour Boolean. Why: Every gate below needs to know a tour is actually running before it even checks which one. How: This is reused as the shared first operand of every tour-gating boolean that follows.

	const intSenBoo = isaTouBoo && touBusObj.touIdeStr === 'page-explore_pickers' && touBusObj.touSteNum === 7;                         // What: Intercept Send Boolean. Why: The Pickers page tour's own "Add to Todo List" step wants the real Send to Today -> Sent! animation to play, so the user sees what the button actually does, but explicitly does NOT want a real entry landing on Today from it, since this is a tutorial pick on a disposable sample picker, not something the user meant to act on. How: This gates on the exact tourId and step that step is shown at.
	const disDonBoo = intSenBoo || ( isaTouBoo && touBusObj.touIdeStr === 'appfeature-feat_manual_pick' && touBusObj.touSteNum === 3 ); // What: Disable Done Boolean. Why: Done needs the same visual and functional disabling during App Features' own "Make your first manual pick" tour's equivalent step (buildAppFeatureSteps, feat_manual_pick's Step 4, index 3: Step 1 is the shared nav-click, Step 2 is Picker Selection, Step 3 is Manual Generation), since leaving would discard the very pick that tour just walked the user through making, and would also make the step's own target (this whole done/sent view) vanish. How: Re-roll is deliberately NOT included here, unlike intSenBoo above: App Features wants Re-roll to stay genuinely usable without counting as this step's own advancing click; this is deliberately a SEPARATE flag from intSenBoo, since that one also skips the real actions.addEntFun call in senTodFun below, which is correct for the page tour's disposable sample pick but wrong here.
	const disIteBoo = isaTouBoo && touBusObj.touIdeStr === 'page-explore_pickers' && touBusObj.touSteNum === 8;                         // What: Disable Item Boolean. Why: Step 9 ("Picker Items") highlights the pool's per-item Send to Today/Edit/Delete buttons but explicitly doesn't want any of them actually usable from there, since narrating what they do is the point, not inviting the user to act on a disposable tutorial picker's real items. How: This gates on the exact tourId and step that step is shown at.
	const disEdiBoo = disIteBoo || ( isaTouBoo && touBusObj.touIdeStr === 'appfeature-feat_manual_pick' && touBusObj.touSteNum === 4 ); // What: Disable Edit-Delete Boolean. Why: App Features' own "Make your first manual pick" tour reaches this same pool at its own Step 5 (index 4), but unlike the page tour above, Send to Today should stay genuinely usable there (real data, a second valid way to land a pick besides Manual Generation), only Edit/Delete stay narrated-not-usable. How: This deliberately only gates the pool-edit/pool-del buttons below, NOT pool-send's own disabled prop (still disIteBoo alone, naturally unaffected/enabled during this tour).
	const higSenBoo = isaTouBoo && touBusObj.touIdeStr === 'appfeature-feat_manual_pick' && touBusObj.touSteNum === 4;                  // What: Highlight Send Boolean. Why: The same fading-outline pulse (.ob-tour-pulse) tab-data.jsx's own Edit Item tour uses on its own per-element targets draws the eye to the still-genuinely-usable Send to Today buttons specifically, not just the whole .pool-items box the step's own coach already frames. How: This is only ever applied to the real, enabled button below, since disIteBoo is false here and this never touches the is-sent/is-disabled branches.
	const disAddBoo = isaTouBoo && touBusObj.touIdeStr === 'page-explore_pickers' && touBusObj.touSteNum === 9;                         // What: Disable Add Boolean. Why: Step 10 ("Add Picker Item") highlights "+ Add Item" but explicitly doesn't want the user opening the real create-item form from a disposable tutorial picker. How: This gates on the exact tourId and step that step is shown at.

	// #endregion Tour Gating



	// #region Pick Run State

	const [ busPicBoo, setBusPicBoo ] = React.useState( false );  // What: Busy Picking Boolean And Setter. Why: The Pick One button must disable itself and show a busy label while the cycle animation is actually running. How: This is set true by runPicFun and cleared once onAniDonFun fires.
	const [ picResObj, setPicResObj ] = React.useState( null );   // What: Pick Result Object And Setter. Why: The stage and action buttons both need the most recent PIC_NAM_OBJ.picIteFun() outcome to render from. How: This is written by runPicFun/rerActFun and read throughout the render below.
	const [ runPhaStr, setRunPhaStr ] = React.useState( 'idle' ); // What: Run Phase String And Setter. Why: Every part of this view's stage and action row renders differently depending on where the current run actually is. How: This starts on 'idle' and is advanced by runPicFun, onAniDonFun, senTodFun, and the tour-driven effect below. // What: Run Phase Values Note. Why: The phase drives every stage render, so its possible values are worth listing. How: It is one of 'idle', 'running', 'done', 'sent' or 'empty'.


	React.useEffect( () => { // What: Tour Reset Effect. Why: Resets this view back to idle whenever the Pickers page tour's own onBacTouFun bumps touBusObj.resNonNum: a Back from its "Add to Todo List" step to "Manual Generation" needs Pick One showing again, not whatever real Send to Today/Re-roll/Done state a completed pick left behind. How: This is guarded on truthiness (not just present in the deps array) so the unset/0 starting value doesn't also reset on every fresh mount, only a genuine bump does anything.


		if ( !touBusObj.resNonNum ) return; // What: No Bump Guard. Why: A fresh mount's own initial nonce value must not trigger a reset. How: This bails out unless the nonce is genuinely truthy.



		setBusPicBoo( false ); setPicResObj( null ); setRunPhaStr( 'idle' ); // What: Reset Call. Why: The tour's own Back navigation needs this view showing its pre-pick state again. How: This clears every piece of in-progress pick state back to idle.


	}, [ touBusObj.resNonNum ] ); // What: Effect Dependency Array. Why: Only a genuine bump of this exact nonce should re-run this reset. How: touBusObj.resNonNum is the sole trigger; deliberately excluded from a broader deps list since this must NOT re-run for any other reason.

	// #endregion Pick Run State



	// #region Button Exit Animation

	const [ butLeaBoo, setButLeaBoo ] = React.useState( false ); // What: Button Leaving Boolean And Setter. Why: Re-roll and Done both need their own out-animation to play for a beat before the real state transition happens underneath them. How: This is flipped true by aftExiFun and cleared 180ms later, right before the real action actually runs.


	// #region aftExiFun

	/**
	 * aftExiFun = After Exit Function
	 *
	 * @summary
	 * The shared follow-through for Re-roll and Done. It runs runActFun straight
	 * away under reduced motion; otherwise it flags the result buttons as leaving
	 * so they play their exit animation, then clears that flag and runs runActFun
	 * 180ms later.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param runActFun - Run Action Function: What to do once the buttons have
	 *                    left, e.g. rerActFun or senTodFun.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * aftExiFun( rerActFun ) // => void
	 * ```
	 *
	*/

	const aftExiFun = ( runActFun ) => { // What: After Exit Function. Why: Re-roll/Done need a shared helper that plays the exit animation (unless reduced motion applies) before running whatever the caller actually wants to happen. How: This either runs runActFun immediately, or stages butLeaBoo for 180ms first.


		if ( redMotFun() ) { runActFun(); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion shouldn't wait through a skipped animation. How: This runs the caller's action immediately and returns, skipping the staged delay below.



		setButLeaBoo( true ); // What: Leaving Stage Call. Why: The buttons need to actually play their own out-animation now. How: This flips butLeaBoo, which the render below applies as a className modifier.

		setTimeout( () => { // What: Delayed Action Call. Why: The real action must not run until the out-animation has had time to actually play. How: This clears butLeaBoo and runs the caller's action 180ms later.


			setButLeaBoo( false ); // What: Leaving Clear Call. Why: The buttons stop playing their exit once the delay is up. How: This resets butLeaBoo to false.
			runActFun();           // What: Run Action Call. Why: The deferred action runs only after the exit animation. How: This calls the runActFun the caller passed in.


		}, 180 ); // What: Exit Animation Delay. Why: runActFun must wait for the button's exit animation. How: This 180ms matches that animation's duration.


	};

	// #endregion aftExiFun

	// #endregion Button Exit Animation



	// #region Pool Row State

	const [ shoDriBoo, setShoDriBoo ] = React.useState( picDatObj.mode !== 'random' && picDatObj.mode !== 'weighted' ); // What: Show Drift Boolean And Setter. Why: A non-random/weighted picker's pool rows can optionally reveal each item's own drift/readiness bar, hidden by default to keep the list simple. How: This starts true whenever the picker's mode isn't 'random' or 'weighted', and is toggled by the pool header's own "Show/Hide drift" link.
	const [ newDraObj, setNewDraObj ] = React.useState( null );                                                         // What: New Draft Object And Setter. Why: Adding a new pool item is held as a LOCAL draft, not committed to the store, until Save, so a reload or tab-switch discards an in-progress item, matching the new-picker create flow. How: This is the editing item; draActObj (below) edits it locally, and cmtDraFun commits it via the real store actions on Save.
	const [ insSavStr, setInsSavStr ] = React.useState( null );                                                         // What: Insert Saved String And Setter. Why: A freshly-committed pool row needs its own insert animation, keyed to its own id. How: This is set by cmtDraFun and cleared once the row's own insert keyframe finishes.
	const [ conDelStr, setConDelStr ] = React.useState( null );                                                         // What: Confirm Delete String And Setter. Why: Deleting a pool item asks for confirmation inline, in place of that row's own normal content. How: This holds the id currently showing its own delete-confirm row.
	const [ conLeaStr, setConLeaStr ] = React.useState( null );                                                         // What: Confirm Leaving String And Setter. Why: Cancelling a delete confirmation needs its own out-animation before the row reverts to normal. How: This holds the id currently playing that leaving animation, cleared once it finishes.

	const penEdiRef = React.useRef( null ); // What: Pending Edit Reference. Why: Set by staEdiFun when it has to close an in-progress new-item draft OR another item's open editor out of the way first, this is picked back up once that draft's/editor's own closing animation ends, so the edit opens right after instead of being silently dropped. How: This holds the target item id to reopen, consumed by the relevant onAnimationEnd handler below.
	const ediSnaRef = React.useRef( null ); // What: Editing Snapshot Reference. Why: A snapshot of whatever item opeEdiFun last opened, taken at that exact moment, used ONLY by staEdiFun to explicitly revert live edits when jumping straight from one item's editor to a different item's, bypassing EntEdiCom's own internal revert-on-unmount. How: That mechanism alone isn't enough here: it arms window.__editGuard's revert via a 0ms setTimeout on unmount, but the very next EntEdiCom's mount effect unconditionally disarms it (so a stale pending revert can't clobber an unrelated fresh edit session), and both the unmount and the next mount happen in the same synchronous effect-flush, well before that timeout would ever fire, so the disarm always wins unless this reverts directly instead.


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



		setConLeaStr( conDelStr ); // What: Leaving Stage Call. Why: The confirm row needs to actually play its own out-animation now. How: This copies the current conDelStr into conLeaStr, which the render below applies as a className modifier.

		setTimeout( () => { // What: Delayed Clear Call. Why: The confirm row must not fully disappear until its own out-animation has had time to actually play. How: This clears both conLeaStr and conDelStr 150ms later.


			setConLeaStr( null ); // What: Leaving Clear Call. Why: The confirm row has finished its exit animation. How: This resets conLeaStr to null.
			setConDelStr( null ); // What: Confirm Clear Call. Why: No row stays in its delete-confirm state. How: This resets conDelStr to null.


		}, 150 ); // What: Leaving Animation Delay. Why: The confirm row must finish leaving before it clears. How: This 150ms matches the leaving animation's duration.


	};

	// #endregion canConFun

	// #endregion Pool Row State



	// #region Item Removal And Sending

	const [ rmvIdeStr, setRmvIdeStr ] = React.useState( null ); // What: Removing Identifier String And Setter. Why: A deleted pool row needs its own removal animation to finish before it's actually taken out of the store. How: This holds the id currently playing that removal animation; the row's own onAnimationEnd handler below both clears it and calls actions.delIteFun.
	const [ senIdeStr, setSenIdeStr ] = React.useState( null ); // What: Sent Identifier String And Setter. Why: A pool item just sent to Today via its own per-row button needs a brief checkmark confirmation on that exact row. How: This holds the id currently showing that confirmation, cleared 1400ms later by senIteFun.


	// #region senIteFun

	/**
	 * senIteFun = Send Item Function
	 *
	 * @summary
	 * Sends one pool item straight to Today with the same consequence as a
	 * natural pick: it runs the pick engine forced onto this exact item, stages
	 * the identical pending drift, weight and pick-count change on a new Today
	 * entry through addEntFun, and flags the row for its Sent confirmation.
	 * Ease-down replaces the picker's single Today entry, while every other mode
	 * adds one.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param iteIdeStr - Item Identifier String: The id of the pool item to send.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * senIteFun( iteIdeStr ) // => void
	 * ```
	 *
	*/

	const senIteFun = ( iteIdeStr ) => { // What: Send Item Function. Why: This is full parity with "Pick One" -> Send: it runs the engine forcing this exact item, then stages the identical pending mutation (drift/weight plus bumpPick) so marking it done has the same consequence as a natural pick. How: Ease Down replaces the picker's single entry; other modes add one, both handled inside actions.addEntFun.


		const senResObj = PIC_NAM_OBJ.picIteFun( picDatObj, staAppObj.items, { forceItemId : iteIdeStr } ); // What: Send Result Object. Why: Forcing the pick engine onto this exact item still needs to compute the same pending updates a natural pick would. How: This calls PIC_NAM_OBJ.picIteFun with forceItemId set to the item being sent.


		if ( !senResObj || !senResObj.picObj ) return; // What: No Result Guard. Why: An item that's somehow no longer pickable (already removed, say) must not commit a phantom Today entry. How: This bails out before touching the store at all.



		actStoObj.addEntFun( picDatObj.id, senResObj.picObj.id, { // What: Add Today Entry Call. Why: This is the actual commit that lands the forced pick as a real Today entry, staged exactly like a natural pick. How: This passes through every computed update alongside the forced pick's own id.


			bumpPick    : true,                // What: Bump Pick. Why: A manual send still counts as a pick. How: This is always true here.
			depletedEnd : senResObj.depBoo,    // What: Depleted End. Why: An ease-down pick can empty the pool. How: This passes senResObj.depBoo.
			pickedId    : senResObj.picObj.id, // What: Picked Id. Why: The entry records which item was chosen. How: This passes the picked item's id.
			pickerPatch : senResObj.patObj,    // What: Picker Patch. Why: Some modes also stage picker-level changes. How: This passes senResObj.patObj.
			updates     : senResObj.updArr     // What: Updates. Why: The pick's item mutations are staged, not applied yet. How: This passes senResObj.updArr.


		} );

		setSenIdeStr( iteIdeStr ); // What: Sent Row Flag Call. Why: The exact row just sent needs its own brief confirmation state. How: This writes iteIdeStr into senIdeStr.

		setTimeout( () => setSenIdeStr( ( preIdeStr ) => ( preIdeStr === iteIdeStr ? null : preIdeStr ) ), 1400 ); // What: Sent Row Clear Timeout. Why: The confirmation must not linger forever, but also must not clear a DIFFERENT row's own more recent confirmation. How: This clears senIdeStr 1400ms later, only if it still matches this exact item.


	};

	// #endregion senIteFun

	// #endregion Item Removal And Sending



	// #region New Item Draft

	const [ newCloStr, setNewCloStr ] = React.useState( false ); // What: New Closing String And Setter. Why: The new-item draft's own editor needs to play a closing animation before it's actually torn down, distinguishing a Save close from a Cancel close. How: This holds 'save', 'cancel', or false, consumed by the draft wrap's own onAnimationEnd handler below.

	const addWraRef = React.useRef( null );                                           // What: Add Wrap Reference. Why: Both the new-item and edit-item flows render into this same below-the-list slot, which needs a stable handle so it can be scrolled into view. How: This is attached to the .pv-additem-wrap div's own ref prop, below.
	const useWeiBoo = picDatObj.mode === 'weighted' || picDatObj.mode === 'dynamic';  // What: Uses Weight Boolean. Why: Only these two modes treat an item's weight as a real lever; the others ignore it entirely. How: This gates whether weight fields are carried over/shown throughout this view.
	const isaEasBoo = picDatObj.mode === 'ease-up' || picDatObj.mode === 'ease-down'; // What: Is-An Ease Boolean. Why: Only these two modes use the easeMin/easeMax drift band at all. How: This gates whether ease fields are carried over/shown throughout this view.


	const draActObj = { // What: Draft Actions Object. Why: EntEdiCom expects a real actions-shaped object to call as the user edits the in-progress new-item draft, but that draft isn't committed to the store yet. How: Every method below mirrors the real store action's own name and signature, but writes into newDraObj instead of dispatching a real store update.


		delIteFun : () => setNewDraObj( null ), // What: Delete Item Function. Why: EntEdiCom's own footer Delete button (hidden here via CSS, see the render below) still expects this method to exist. How: This clears newDraObj entirely.
		renIteFun : ( tarIdeStr, newNamStr ) => setNewDraObj( ( preDraObj ) => preDraObj && preDraObj.id === tarIdeStr ? { ...preDraObj, name : newNamStr } : preDraObj ),   // What: Rename Item Function. Why: The name input's own onBlur calls this exactly like the real store action. How: This overwrites just the name field on newDraObj, if the ids still match.
		revIteFun : ( tarIdeStr, snaIteObj ) => setNewDraObj( ( preDraObj ) => preDraObj && preDraObj.id === tarIdeStr ? snaIteObj : preDraObj ),                            // What: Revert Item Function. Why: EntEdiCom's own Cancel/Escape handling calls this to revert to a prior snapshot. How: This replaces newDraObj wholesale with snaIteObj, if the ids still match.
		setWeiFun : ( tarIdeStr, weiValNum ) => setNewDraObj( ( preDraObj ) => preDraObj && preDraObj.id === tarIdeStr ? { ...preDraObj, weight : weiValNum } : preDraObj ), // What: Set Weight Function. Why: EntEdiCom's own weight stepper calls this exactly like the real store action. How: This overwrites just the weight field on newDraObj, if the ids still match.
		updIteFun : ( tarIdeStr, patIteObj ) => setNewDraObj( ( preDraObj ) => preDraObj && preDraObj.id === tarIdeStr ? { ...preDraObj, ...patIteObj } : preDraObj ),       // What: Update Item Function. Why: EntEdiCom calls this exactly like the real store action to apply a field patch. How: This merges patIteObj into newDraObj only if the ids still match.

		togVacFun : ( tarIdeStr ) => setNewDraObj( ( preDraObj ) => preDraObj && preDraObj.id === tarIdeStr ? { // What: Toggle Vacation Function. Why: EntEdiCom's own Active switch calls this exactly like the real store action. How: This flips just the vacation field on newDraObj, if the ids still match.


			...preDraObj, // What: Previous Draft Spread. Why: Every other field stays as it was. How: This copies preDraObj.

			vacation : !preDraObj.vacation // What: Vacation. Why: This is the flag being toggled. How: This inverts the draft's current vacation value.


		} : preDraObj ) // What: Unchanged Draft Fallback. Why: A toggle for any other id leaves the draft alone. How: This returns preDraObj unchanged.


	};


	// #region cmtDraFun

	/**
	 * cmtDraFun = Commit Draft Function
	 *
	 * @summary
	 * Saves the new-item draft as a real item: it creates the item through
	 * addIteFun, patches in the vacation, weight and ease fields the draft editor
	 * changed, moves the new item to the end of the pool, and flags it for its
	 * insert animation.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param draIteObj - Draft Item Object: The new-item draft being saved.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * cmtDraFun( draIteObj ) // => void
	 * ```
	 *
	*/

	const cmtDraFun = ( draIteObj ) => { // What: Commit Draft Function. Why: Saving the new-item draft must create the real store item and then carry over every field the draft flow itself edited. How: This calls actions.addIteFun, then patches in vacation/weight/ease fields, moves the new item to the end of the pool, and flags it for its own insert animation.


		actStoObj.addIteFun( picDatObj.id, draIteObj.name, draIteObj.id ); // What: Add Item Call. Why: The draft only exists locally until this point; this is what actually creates it in the store. How: This passes the draft's own id through so the created item keeps the same id the draft UI was already using.


		const patIteObj = { vacation : draIteObj.vacation }; // What: Patch Item Object. Why: actions.addIteFun always creates the item active, so the draft's own Active toggle must be carried over too, not just weight/ease fields, or turning it off is silently lost. How: This starts from just the vacation field and gains weight/ease fields below when relevant.


		if ( useWeiBoo ) patIteObj.weight = draIteObj.weight; // What: Weight Patch Guard. Why: Weight only matters for weighted/dynamic modes. How: This adds the draft's own weight into patIteObj only when useWeiBoo is true.



		if ( isaEasBoo ) { // What: Ease Patch Guard. Why: The drift band and starting charge only matter for ease-up/ease-down modes. How: This adds the draft's own easeMin/easeMax/value into patIteObj only when isaEasBoo is true.


			patIteObj.easeMin = draIteObj.easeMin; // What: Ease Min Copy. Why: An ease item keeps the soonest end of its drift band. How: This copies easeMin from the draft.
			patIteObj.easeMax = draIteObj.easeMax; // What: Ease Max Copy. Why: An ease item keeps the latest end of its drift band. How: This copies easeMax from the draft.
			patIteObj.value = draIteObj.value;     // What: Value Copy. Why: An ease item keeps its starting charge. How: This copies value from the draft.


		}



		actStoObj.updIteFun( draIteObj.id, patIteObj ); // What: Update Item Call. Why: actions.addIteFun alone doesn't accept these extra fields, so a follow-up patch is needed to apply them. How: This applies patIteObj to the freshly-created item.

		actStoObj.movIteFun( draIteObj.id ); // What: Move To End Call. Why: A newly-added item should land at the end of the pool's own display order, not wherever the store happened to insert it. How: This reorders the freshly-created item to the end.

		setInsSavStr( draIteObj.id ); // What: Insert Saved Flag Call. Why: The freshly-committed row needs its own insert animation. How: This writes the new item's id into insSavStr, consumed by that row's own onAnimationEnd handler.


	};

	// #endregion cmtDraFun


	// #region addIteFun

	/**
	 * addIteFun = Add Item Function
	 *
	 * @summary
	 * Opens a brand-new pool item in the same slot the edit flow uses. It does
	 * nothing while another editor is open; otherwise it creates a draft with a
	 * fresh id and default values for this picker's mode, then scrolls the new
	 * slot into view across two animation frames.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * addIteFun() // => void
	 * ```
	 *
	*/

	const addIteFun = () => { // What: Add Item Function. Why: Starting a brand-new pool item opens the same slot the edit flow uses, seeded with sensible defaults, then scrolls it into view. How: This bails out if another editor is already open, otherwise generates a fresh id and default draft, then scrolls the new slot into view across two animation frames.


		if ( newDraObj || ediIteStr ) return; // What: One Editor Guard. Why: Only one item editor (new or existing) may be open at a time. How: This bails out if either a new draft or an existing edit is already in progress.



		const newIdeStr = 'it_' + Math.random().toString( 36 ).slice( 2, 8 ); // What: New Identifier String. Why: The new draft item needs a stable, unique-enough id before it's ever committed to the store. How: This builds a short random suffix onto the conventional 'it_' item-id prefix.


		setNewDraObj({ // What: New Draft Seed Call. Why: The freshly-opened editor needs a complete, sensible default item shape to start from. How: This seeds a full charge default for Ease Down (matching addPicFun's own initialValue) and a zeroed one otherwise.


			easeMax  : 14,                                                                  // What: Ease Max. Why: Ease items start with a default latest end. How: This is 14.
			easeMin  : 7,                                                                   // What: Ease Min. Why: Ease items start with a default soonest end. How: This is 7.
			id       : newIdeStr,                                                           // What: Id. Why: The draft needs its own id before it's saved. How: This uses newIdeStr.
			name     : 'New item',                                                          // What: Name. Why: The editor opens with a placeholder name. How: This is the literal 'New item'.
			vacation : false,                                                               // What: Vacation. Why: A new item starts active. How: This is false.
			value    : picDatObj.mode === 'ease-down' ? ( picDatObj.threshold ?? 100 ) : 0, // What: Value. Why: An ease-down item starts fully charged, everything else at 0. How: This uses the picker's threshold for ease-down, otherwise 0.
			weight   : 1                                                                    // What: Weight. Why: Every item starts at the baseline weight. How: This is 1.


		});

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

	// #endregion addIteFun

	// #endregion New Item Draft



	// #region Item Editor

	const [ ediIteStr, setEdiIteStr ] = React.useState( null );  // What: Editing Item String And Setter. Why: An existing pool item's own edit slot reuses the exact same below-the-list interface as "+ Add Item", just populated from a real item and wired to the REAL actions instead of a draft. How: This holds the id of whichever existing item currently has its editor open, or null.
	const [ ediCloBoo, setEdiCloBoo ] = React.useState( false ); // What: Editing Closing Boolean And Setter. Why: Closing an existing item's editor needs its own out-animation before it's actually torn down. How: This is flipped true to start that animation and consumed by the editor's own onAnimationEnd handler below.
	const [ ediNamStr, setEdiNamStr ] = React.useState( '' );    // What: Editing Name String And Setter. Why: The name input inside the existing-item editor needs its own live-typed value. How: This is seeded from the item's own name in opeEdiFun and written to the store on blur.


	React.useEffect( () => { // What: Deleted-Under-Editor Effect. Why: An item can be deleted out from under its own open editor (the row's own trash icon stays reachable while editing, see the render's own null-guard below), and that guard alone only stops THIS render from crashing; without also clearing ediIteStr here, it would stay set forever, permanently tripping staEdiFun's own "one editor at a time" guard against ever opening another. How: This watches for the currently-edited item vanishing from staAppObj.items and clears both ediIteStr and ediCloBoo the moment it does.


		if ( ediIteStr && !staAppObj.items.some( ( iteCurObj ) => iteCurObj.id === ediIteStr ) ) { // What: Vanished Item Guard. Why: Only an item that's genuinely gone needs this cleanup. How: This checks whether ediIteStr still resolves to a real item in staAppObj.items.


			setEdiIteStr( null ); // What: Clear Editing Call. Why: There's nothing left to edit once the item itself is gone. How: This resets ediIteStr to null.

			setEdiCloBoo( false ); // What: Clear Closing Call. Why: A stale closing flag must not linger for whatever opens next. How: This resets ediCloBoo to false.


		}


	}, [ ediIteStr, staAppObj.items ] ); // What: Effect Dependency Array. Why: This must re-check whenever either the edited id or the items list itself changes. How: ediIteStr identifies which item to check for, and staAppObj.items is what's actually checked against.


	// #region opeEdiFun

	/**
	 * opeEdiFun = Open Edit Function
	 *
	 * @summary
	 * Opens an existing item's editor. It snapshots the item first, so staEdiFun
	 * can revert it when the user switches straight to another editor, seeds the
	 * local name input, and scrolls the editor into view. It does nothing if the
	 * item has since been deleted.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param tarIdeStr - Target Identifier String: The id of the item to edit.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * opeEdiFun( tarIdeStr ) // => void
	 * ```
	 *
	*/

	const opeEdiFun = ( tarIdeStr ) => { // What: Open Edit Function. Why: Opening an existing item's editor needs to snapshot it first (for staEdiFun's own revert-on-switch below) and seed the local name input. How: This looks up the item, bails out if it's already gone, then opens the editor and scrolls it into view.


		const fouIteObj = staAppObj.items.find( ( iteCurObj ) => iteCurObj.id === tarIdeStr ); // What: Found Item Object. Why: The editor needs the real, current item record to open against. How: This looks up tarIdeStr in staAppObj.items.


		if ( !fouIteObj ) return; // What: Missing Item Guard. Why: A stale id (already deleted) must not open an editor with nothing to show. How: This bails out before touching any state.



		ediSnaRef.current = { ...fouIteObj }; // What: Snapshot Write. Why: staEdiFun needs a snapshot of this exact item, taken right now, in case it later has to revert this edit to switch to a different one. How: This shallow-copies fouIteObj into ediSnaRef.

		setEdiIteStr( tarIdeStr ); // What: Open Editor Call. Why: This is the actual state change that shows the editor. How: This writes tarIdeStr into ediIteStr.

		setEdiNamStr( fouIteObj.name ); // What: Seed Name Call. Why: The name input needs its own starting value. How: This writes the found item's own current name into ediNamStr.

		requestAnimationFrame( () => requestAnimationFrame( () => { // What: Scroll Into View Call. Why: This is the same below-the-list reveal as addIteFun's own, since the editor renders in the same slot, which can be well out of view from wherever in a long pool the Edit button that opened it was. How: This waits two animation frames for layout to settle, then scrolls the shared .main container just enough to bring the slot fully into view.


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

	// #endregion opeEdiFun


	// #region staEdiFun

	/**
	 * staEdiFun = Start Edit Function
	 *
	 * @summary
	 * Starts editing an item from any state. When another item's editor or the
	 * new-item draft is open, it closes that one first (reverting an edited item
	 * to its snapshot) and stages tarIdeStr so the requested editor opens once
	 * the closing animation finishes; otherwise it opens the editor directly.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param tarIdeStr - Target Identifier String: The id of the item to edit.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * staEdiFun( tarIdeStr ) // => void
	 * ```
	 *
	*/

	const staEdiFun = ( tarIdeStr ) => { // What: Start Edit Function. Why: Switching straight from one open editor to another (or from the new-item draft) needs to close whatever's currently open first, reverting it, before this edit can actually open. How: This closes an existing editor (with an explicit revert) or the new-item draft, staging tarIdeStr to reopen once that closing animation finishes; otherwise it opens directly.


		if ( ediIteStr === tarIdeStr ) return; // What: Already Open Guard. Why: Re-clicking Edit on the exact same row that's already open should do nothing. How: This bails out when tarIdeStr matches the currently-open editor.



		if ( ediIteStr ) { // What: Other Editor Open Branch. Why: Another item's editor is already open and must be closed (with its own explicit revert, see ediSnaRef's own comment above) before this one can open. How: This reverts the currently-open item, stages tarIdeStr, and starts that editor's own closing animation.


			if ( ediSnaRef.current ) actStoObj.revIteFun( ediIteStr, ediSnaRef.current ); // What: Revert Call Guard. Why: Only a genuine snapshot can be reverted to. How: This restores the currently-open item back to its pre-edit snapshot.



			penEdiRef.current = tarIdeStr; // What: Stage Reopen Call. Why: The requested edit must still open once the current one finishes closing. How: This stores tarIdeStr for the closing editor's own onAnimationEnd handler to pick up.

			setEdiCloBoo( true ); // What: Start Closing Call. Why: This is what actually plays the current editor's own out-animation. How: This flips ediCloBoo, consumed by the editor's own onAnimationEnd handler below.



			return; // What: Early Return. Why: The requested edit must wait for the closing animation, not open immediately. How: This exits staEdiFun without calling opeEdiFun yet.


		}



		if ( newDraObj ) { // What: New Draft Open Branch. Why: A new-item draft is in progress and must be closed (without saving) instead of silently no-oping, since the reverse never needs this: the "+ Add Item" button that starts a new draft isn't rendered while an existing item's edit form is open. How: This stages tarIdeStr and starts the draft's own closing animation.


			penEdiRef.current = tarIdeStr; // What: Stage Reopen Call. Why: The requested edit must still open once the draft finishes closing. How: This stores tarIdeStr for the draft wrap's own onAnimationEnd handler to pick up.

			setNewCloStr( 'cancel' ); // What: Cancel Draft Call. Why: Switching away from an in-progress new-item draft discards it rather than silently saving it. How: This starts the draft wrap's own closing animation in its 'cancel' shape.



			return; // What: Early Return. Why: The requested edit must wait for the closing animation, not open immediately. How: This exits staEdiFun without calling opeEdiFun yet.


		}



		opeEdiFun( tarIdeStr ); // What: Direct Open Call. Why: Neither another editor nor a draft was in the way, so the requested edit can open immediately. How: This calls opeEdiFun with the same tarIdeStr.


	};

	// #endregion staEdiFun

	// #endregion Item Editor



	// #region Pool Data

	const picIteArr = staAppObj.items.filter( ( iteCurObj ) => iteCurObj.pickerId === picDatObj.id ); // What: Picker Item Array. Why: The pool list only ever shows items that actually belong to this picker. How: This filters staAppObj.items down to those whose pickerId matches picDatObj.id.
	const eliIteArr = picIteArr.filter( ( iteCurObj ) => !iteCurObj.vacation );                       // What: Eligible Item Array. Why: An inactive (vacationing) item still counts toward the pool but never toward what's actually pickable. How: This filters picIteArr down to those not flagged vacation.


	const todIdeSet = React.useMemo( // What: Today Identifier Set. Why: Item ids already on Today are used to disable per-item Send and to keep the "Pick One" spin from landing on a duplicate. How: This is memoized off state.today.entries, recomputed only when the entries themselves change.

		() => new Set( ( staAppObj.today.entries || [] ).filter( ( entCurObj ) => entCurObj.itemId ).map( ( entCurObj ) => entCurObj.itemId ) ), // What: Today Ids Build. Why: Only entries actually tied to an item (not a reminder or conditional row) belong in this set. How: This filters to entries with an itemId, then maps to just that id.

		[ staAppObj.today.entries ] // What: Effect Dependency Array. Why: The set only needs recomputing when today's own entries list changes. How: state.today.entries is the sole source this memo reads.

	);


	const modInfObj = SED_NAM_OBJ.MOD_DEF_OBJ[ picDatObj.mode ]; // What: Mode Info Object. Why: The header, hint text, and stage all need this picker's own mode's label/hint. How: This looks up picDatObj.mode in the shared SED_NAM_OBJ.MOD_DEF_OBJ table.

	// #endregion Pool Data



	// #region Picker Details Edit

	const [ ediOpeBoo, setEdiOpeBoo ] = React.useState( false ); // What: Editing Open Boolean And Setter. Why: Editing this picker's own Details reuses PicForCom's Details step, pre-filled from its current settings, in place of the normal run/pool view. How: This is NOT an early return: every hook above still needs to run every render regardless of ediOpeBoo, so the branch only happens at the very end, where this component actually returns its JSX.


	const ediGroArr = React.useMemo( () => { // What: Edit Existing Groups Array. Why: This is the same distinct-groups memo TabPicCom itself computes, duplicated here rather than threaded down as a prop, since it's only needed while this one picker's own edit form is open. How: This walks staAppObj.pickers collecting each visible picker's own group name once, then alphabetizes them.


		const seeGroArr = []; // What: Seen Group Array. Why: The loop below needs an accumulator to collect each distinct group name into. How: This starts empty and is pushed to by the loop.


		for ( const curPicObj of staAppObj.pickers ) { // What: Collect Groups Loop. Why: Every visible picker's own group name (if it has one, and isn't already collected) belongs in the result. How: This walks staAppObj.pickers, pushing each new group name onto seeGroArr.


			const hasGroBoo = Boolean( curPicObj.group );             // What: Has Group Boolean. Why: A picker with no group adds nothing to the list. How: This coerces curPicObj.group to a boolean.
			const notHidBoo = !curPicObj.hidden;                      // What: Not Hidden Boolean. Why: A hidden picker's group shouldn't surface. How: This negates curPicObj.hidden.
			const unsGroBoo = !seeGroArr.includes( curPicObj.group ); // What: Unseen Group Boolean. Why: Each group name is collected once. How: This checks seeGroArr doesn't hold it yet.

			const addGroBoo = hasGroBoo && notHidBoo && unsGroBoo; // What: Add Group Boolean. Why: Only a real, visible, not-yet-collected group is added. How: This ANDs the 3 checks above.


			if ( addGroBoo ) seeGroArr.push( curPicObj.group ); // What: Group Push Guard. Why: This is the actual collection step. How: This pushes the group name when addGroBoo is true.


		}



		return seeGroArr.sort( ( groOneStr, groTwoStr ) => groOneStr.localeCompare( groTwoStr ) ); // What: Sorted Groups Return. Why: The group chips should read in a stable, predictable order. How: This returns seeGroArr sorted alphabetically.


	}, [ staAppObj.pickers ] ); // What: Effect Dependency Array. Why: The group list only needs recomputing when the pickers list itself changes. How: staAppObj.pickers is what the loop above actually reads.


	const ediIniObj = { // What: Edit Initial Object. Why: PicForCom's own edit mode needs every one of this picker's current settings prefilled, so Save can round-trip them through savEdiFun unchanged unless the user actually edits a field. How: This maps every relevant picker field onto the same shape PicForCom's own initial prop expects. // What: Deliberately Omitted Group Field. Why: `group` specifically means "prefill the inline ADD-A-NEW-GROUP sub-form" (see PicForCom's own addGroBoo/newGroStr state), which would be wrong here: this picker's group already exists (it's necessarily in ediGroArr, since that list is derived from staAppObj.pickers including this picker itself), so it should land on that EXISTING pill instead. How: initialGroup (passed at the return below) is the prop that does that, same as the create flow's own group-filter prefill.


		anchorDay       : picDatObj.anchorDay,                                                                 // What: Anchor Day. Why: A yearly date-mode picker prefills its day. How: This copies picDatObj.anchorDay.
		anchorDom       : picDatObj.anchorDom,                                                                 // What: Anchor Day Of Month. Why: A monthly date-mode picker prefills its day of the month. How: This copies picDatObj.anchorDom.
		anchorDow       : picDatObj.anchorDow,                                                                 // What: Anchor Day Of Week. Why: A weekly picker prefills its weekday. How: This copies picDatObj.anchorDow.
		anchorMonth     : picDatObj.anchorMonth,                                                               // What: Anchor Month. Why: A yearly picker prefills its month. How: This copies picDatObj.anchorMonth.
		avoidDuplicates : picDatObj.avoidDuplicates,                                                           // What: Avoid Duplicates. Why: The toggle prefills to the picker's current setting. How: This copies picDatObj.avoidDuplicates.
		cadence         : picDatObj.cadence,                                                                   // What: Cadence. Why: The cadence control prefills to the picker's current cadence. How: This copies picDatObj.cadence.
		conditionalId   : picDatObj.conditionalId || null,                                                     // What: Conditional Id. Why: The attach toggle and rail prefill to the attached conditional. How: This copies picDatObj.conditionalId, or null.
		dateMode        : picDatObj.dateMode,                                                                  // What: Date Mode. Why: A monthly/yearly picker prefills whether it anchors to a date or an nth weekday. How: This copies picDatObj.dateMode.
		daysOfWeek      : picDatObj.daysOfWeek,                                                                // What: Days Of Week. Why: The weekday picker prefills to the picker's run days. How: This copies picDatObj.daysOfWeek.
		includeInDaily  : ( ( staAppObj.daily && staAppObj.daily.pickerIds ) || [] ).includes( picDatObj.id ), // What: Include In Daily. Why: The daily switch prefills to the picker's real membership, which lives outside the picker record. How: This checks the daily generator's own id list.
		mode            : picDatObj.mode,                                                                      // What: Mode. Why: The mode picker prefills to the picker's current mode. How: This copies picDatObj.mode.
		name            : picDatObj.name,                                                                      // What: Name. Why: The name field prefills to the picker's current name. How: This copies picDatObj.name.
		nthOrdinal      : picDatObj.nthOrdinal,                                                                // What: Nth Ordinal. Why: An nth-weekday picker prefills its ordinal. How: This copies picDatObj.nthOrdinal.
		nthWeekday      : picDatObj.nthWeekday,                                                                // What: Nth Weekday. Why: An nth-weekday picker prefills its weekday. How: This copies picDatObj.nthWeekday.
		skipHolidays    : picDatObj.skipHolidays                                                               // What: Skip Holidays. Why: The holiday toggle prefills to the picker's current setting. How: This copies picDatObj.skipHolidays.


	};

	// #endregion Picker Details Edit



	// #region Pick Run Actions

	// #region runPicFun

	/**
	 * runPicFun = Run Pick Function
	 *
	 * @summary
	 * Runs the Pick One button: it asks the pick engine for a forced-new pick
	 * that skips items already on Today. An empty result shows the empty state;
	 * otherwise it stores the result and starts the running cycle animation.
	 * Nothing is written to the store here.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * runPicFun() // => void
	 * ```
	 *
	*/

	const runPicFun = () => { // What: Run Pick Function. Why: The Pick One button needs to execute a real, forced-new pick against the engine and stage its result for the cycle animation. How: This calls PIC_NAM_OBJ.picIteFun with forceNew and the current Today-excluded ids, then either shows the empty state or starts the running cycle.


		if ( busPicBoo ) return; // What: Already Busy Guard. Why: A second pick must not start while one is already running. How: This bails out entirely while busPicBoo is true.



		const iteSnaArr = staAppObj.items;                                                                            // What: Item Snapshot Array. Why: The pick engine needs a stable snapshot of items to compute against. How: This is just staAppObj.items, captured under a clearer local name for the call below.
		const runResObj = PIC_NAM_OBJ.picIteFun( picDatObj, iteSnaArr, { excludeIds : todIdeSet, forceNew : true } ); // What: Run Result Object. Why: This is the actual computed outcome the rest of this function and the stage below render from. How: This calls the shared picking engine with this picker's own current pool. // What: Force New Note. Why: This button is a manual "pick/roll again" action, so for ease-down it should offer a real choice, not just re-confirm whatever item is already active; abandoning it recharges it, same as re-roll. How: forceNew is passed through to PIC_NAM_OBJ.picIteFun below.


		if ( !runResObj.picObj ) { // What: Nothing Picked Guard. Why: An exhausted or empty pool has nothing left to cycle through. How: This stores the empty result and switches straight to the 'empty' stage, skipping the cycle animation entirely.


			setPicResObj( runResObj ); // What: Result Store Call. Why: The stage needs the empty result to show its own message. How: This writes runResObj into picResObj.
			setRunPhaStr( 'empty' );   // What: Empty Phase Call. Why: The stage switches to its nothing-to-pick state. How: This writes 'empty' into runPhaStr.



			return; // What: Early Return. Why: There is nothing to cycle through. How: This skips the running-phase setup below.


		}



		setPicResObj( runResObj ); // What: Result Store Call. Why: The stage and Send/Re-roll buttons both need this exact outcome once the cycle settles. How: This writes runResObj into picResObj.

		setBusPicBoo( true ); // What: Busy Start Call. Why: The button must disable itself and show a busy label while the cycle plays. How: This flips busPicBoo true.

		setRunPhaStr( 'running' ); // What: Running Phase Call. Why: The stage must switch to rendering PicStrCom's own cycle animation. How: This writes 'running' into runPhaStr.


	};

	// #endregion runPicFun


	// #region onAniDonFun

	/**
	 * onAniDonFun = On Animation Done Function
	 *
	 * @summary
	 * PicStrCom calls this once its cycle settles on the decided pick. It clears
	 * the busy flag and moves the view to its done phase, where Re-roll and Done
	 * appear.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * onAniDonFun() // => void
	 * ```
	 *
	*/

	const onAniDonFun = () => { // What: On Animation Done Function. Why: PicStrCom calls this once its own cycle settles on the decided pick. How: This clears busPicBoo and advances runPhaStr to 'done'. // What: Preview-Only Note. Why: The spin itself is a PREVIEW; it does NOT mutate item state. How: The chosen pick's value/weight changes are staged and applied only when the resulting Today entry is marked done, see senTodFun below and store.js's own addEntFun pending mechanism.


		setBusPicBoo( false ); // What: Busy Clear Call. Why: The button no longer needs to show a busy state once the cycle has settled. How: This flips busPicBoo false.

		setRunPhaStr( 'done' ); // What: Done Phase Call. Why: The stage must switch to showing the settled pick alongside the Send/Re-roll/Done buttons. How: This writes 'done' into runPhaStr.


	};

	// #endregion onAniDonFun


	const seeRedRef = React.useRef( touBusObj.redNonNum ); // What: Seen Redo Nonce Reference. Why: Whenever the Pickers page tour's own onBacTouFun bumps touBusObj.redNonNum (Back from its "Picker Items" step to "Add to Todo List"), a fresh 'done' result must be synthesized directly instead of going through runPicFun's own animated 'running' phase, since Step 8's own target (.pv-act--send) needs runPhaStr to genuinely be 'done'/'sent', and by the time this fires the earlier real pick has already run its full course and reverted; skipping the spin is deliberate, this is a revisit. How: Unlike touBusObj.resNonNum above, a plain truthiness guard isn't enough here, since this bus value outlives any one PicVieCom instance (it's a module-level singleton, not component state); tracking the last-seen value (initialized to whatever's already on the bus at mount) makes this only fire on a genuine increment that happens while mounted.


	React.useEffect( () => { // What: Tour Redo Effect. Why: Going Back to the tour's Add to Todo List step needs a fresh settled pick to point at. How: This synthesizes a new 'done' pick whenever pickerTourRedoNonce genuinely changes.


		if ( touBusObj.redNonNum === seeRedRef.current ) return; // What: No Change Guard. Why: Only a genuine increment counts as a new bump. How: This bails out when the current bus value still matches what was last seen.



		seeRedRef.current = touBusObj.redNonNum; // What: Seen Value Update. Why: The next run of this effect needs to compare against the value that's current now. How: This overwrites seeRedRef with the newly-seen nonce.



		if ( !touBusObj.redNonNum ) return; // What: Falsy Bus Value Guard. Why: A fresh mount that happens to see an unset/0 starting value must not synthesize a bogus result. How: This bails out unless the nonce is genuinely truthy.



		const runResObj = PIC_NAM_OBJ.picIteFun( picDatObj, staAppObj.items, { excludeIds : todIdeSet, forceNew : true } ); // What: Run Result Object. Why: The revisited step still needs a real, current pick result to show. How: This calls the shared picking engine exactly like runPicFun does.


		if ( !runResObj.picObj ) { // What: Nothing Picked Guard. Why: An exhausted or empty pool still has nothing to synthesize a 'done' result from. How: This stores the empty result and switches to the 'empty' stage instead.


			setPicResObj( runResObj ); // What: Result Store Call. Why: The stage needs the empty result to show its own message. How: This writes runResObj into picResObj.
			setRunPhaStr( 'empty' );   // What: Empty Phase Call. Why: The stage switches to its nothing-to-pick state. How: This writes 'empty' into runPhaStr.



			return; // What: Early Return. Why: There is nothing to cycle through. How: This skips the running-phase setup below.


		}



		setPicResObj( runResObj ); // What: Result Store Call. Why: The stage needs this exact synthesized outcome to render the revisited 'done' state from. How: This writes runResObj into picResObj.

		setBusPicBoo( false ); // What: Busy Clear Call. Why: This is a synthesized revisit, not a real spin, so nothing should ever appear busy. How: This keeps busPicBoo false.

		setRunPhaStr( 'done' ); // What: Done Phase Call. Why: Step 8's own target needs runPhaStr to genuinely be 'done'. How: This writes 'done' into runPhaStr directly, skipping 'running' entirely.


		// eslint-disable-next-line react-hooks/exhaustive-deps -- What: Deliberate Dependency Omission. Why: The redo pick must run only on a genuine nonce bump, so the values it reads fresh stay out of the array. How: This silences the react-hooks exhaustive-deps warning for the dependency array below.
	}, [ touBusObj.redNonNum ] ); // What: Effect Dependency Array. Why: Only a genuine change to this exact bus value should re-run this synthesis. How: touBusObj.redNonNum is the sole trigger; deliberately excluded from a broader deps list since picker/staAppObj.items/todIdeSet are read fresh from the closure each time it fires.


	const rerActFun = () => { // What: Reroll Action Function. Why: Re-roll needs to reset back to idle and then immediately kick off a fresh pick. How: This clears the phase and result, then schedules runPicFun on the next tick.


		setRunPhaStr( 'idle' ); // What: Idle Reset Call. Why: The stage must briefly show its idle state before the next pick starts. How: This writes 'idle' into runPhaStr.

		setPicResObj( null ); // What: Result Clear Call. Why: The previous outcome must not linger while a new pick is about to run. How: This clears picResObj.

		setTimeout( runPicFun, 50 ); // What: Delayed Repick Call. Why: A brief pause reads more naturally than an instant re-spin. How: This calls runPicFun again 50ms later.


	};


	// #region senTodFun

	/**
	 * senTodFun = Send Today Function
	 *
	 * @summary
	 * Confirms the settled pick. Unless the Pickers page tour is intercepting
	 * this exact step, it adds the Today entry with the pick's staged pending
	 * change through addEntFun; either way it shows the Sent! confirmation, then
	 * resets the view to idle 1500ms later.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * senTodFun() // => void
	 * ```
	 *
	*/

	const senTodFun = () => { // What: Send Today Function. Why: Committing the settled pick's staged mutation only happens once the user actually confirms it, and this is deliberately skipped when the Pickers page tour is intercepting this exact step. How: This applies the pending update via actions.addEntFun (unless intSenBoo), then plays the Sent! confirmation before resetting back to idle.


		const notDonBoo = runPhaStr !== 'done'; // What: Not Done Boolean. Why: A pick can only be sent once its cycle has settled. How: This checks runPhaStr isn't 'done'.
		const notResBoo = !picResObj;           // What: Not Result Boolean. Why: There must be a stored pick result. How: This negates picResObj.
		const notPicBoo = !picResObj.picObj;    // What: Not Picked Boolean. Why: The result must hold a real picked item. How: This negates picResObj.picObj.

		const notReaBoo = notDonBoo || notResBoo || notPicBoo; // What: Not Ready Boolean. Why: Any one missing piece means there's nothing to send. How: This ORs the 3 checks above.


		if ( notReaBoo ) return; // What: Not Ready Guard. Why: There is nothing to send unless the cycle has actually settled on a real pick. How: This bails out unless runPhaStr is 'done' and picResObj holds a real outcome.



		if ( !intSenBoo ) actStoObj.addEntFun( picDatObj.id, picResObj.picObj.id, { // What: Real Commit Guard. Why: The Pickers page tour's own "Add to Todo List" step wants the Sent! animation to play without a real entry landing on Today, see intSenBoo's own comment above. How: This skips the real store commit only during that exact tour step, otherwise landing the settled pick as a real Today entry.


			bumpPick    : true,                // What: Bump Pick. Why: A run from this view counts as a pick. How: This is always true here.
			depletedEnd : picResObj.depBoo,    // What: Depleted End. Why: An ease-down pick can empty the pool. How: This passes picResObj.depBoo.
			pickedId    : picResObj.picObj.id, // What: Picked Id. Why: The entry records which item was chosen. How: This passes the picked item's id.
			pickerPatch : picResObj.patObj,    // What: Picker Patch. Why: Some modes also stage picker-level changes. How: This passes picResObj.patObj.
			updates     : picResObj.updArr     // What: Updates. Why: The pick's item mutations are staged, not applied yet. How: This passes picResObj.updArr.


		} );



		setRunPhaStr( 'sent' ); // What: Sent Phase Call. Why: The stage and button both need to show their own "sent" confirmation state. How: This writes 'sent' into runPhaStr. // What: Confirmation Beat Note. Why: The stage swaps to an "Added to Today" checkmark and the button morphs to "Sent!", then the picker resets to idle so it's ready for the next pick. How: setRunPhaStr('sent') below drives that swap; the timeout resets everything 1500ms later.

		setTimeout( () => { // What: Delayed Reset Call. Why: The confirmation must not linger forever before the view is ready for another pick. How: This resets both runPhaStr and picResObj 1500ms later.


			setRunPhaStr( 'idle' ); // What: Idle Phase Call. Why: The stage returns to its starting state. How: This writes 'idle' into runPhaStr.
			setPicResObj( null );   // What: Result Clear Call. Why: The previous pick no longer applies. How: This resets picResObj to null.


		}, 1500 ); // What: Sent Confirmation Delay. Why: The Sent! confirmation needs time to be read before the view resets. How: This holds it for 1500ms.


	};

	// #endregion senTodFun

	// #endregion Pick Run Actions



	if ( ediOpeBoo ) { // What: Edit Form Render Guard. Why: While editing this picker's own Details, the normal run/pool view must be replaced entirely by PicForCom's own edit form. How: This returns PicForCom directly, pre-filled from ediIniObj, before the normal JSX below is ever reached.


		return (


			<PicForCom
				conObjArr={ staAppObj.conditionals || [] }
				exiGroArr={ ediGroArr }
				iniForObj={ ediIniObj }
				iniGroStr={ picDatObj.group }
				isaEdiBoo

				onCanForFun={ () => setEdiOpeBoo( false ) }
				onSavEdiFun={ ( payForObj ) => { // What: On Save Edit Handler. Why: Saving the edit form commits its fields and closes it. How: This calls savEdiFun, then closes the form.


					actStoObj.savEdiFun( picDatObj.id, payForObj ); // What: Save Edit Call. Why: This commits the edited Details fields to the picker. How: This calls savEdiFun with the picker's id and the form payload.
					setEdiOpeBoo( false );                          // What: Edit Close Call. Why: The edit form closes once saved. How: This resets ediOpeBoo to false.


				} }
			/> // What: Picker Form Component. Why: Editing reuses PicForCom's own Details step instead of a separate edit form. How: This is passed this picker's own current settings as ediIniObj, and routes Save through actions.savEdiFun.


		);


	}



	return (


		<div
			className='picker-view'

			data-element-name-hook='picVieDiv'
		>{ /* What: Picker View Div Element. Why: This is PicVieCom's own root, holding the header, the run stage/actions, and the pool. How: This wraps every piece of the selected picker's own live view. Its data-element-name-hook is read by help mode's Pickers catalog. */ }


			<header className='picker-h'>{ /* What: Picker Header Element. Why: The picker's own name/mode and its Edit button both belong in one header row. How: This wraps the title block and the Edit button. */ }


				<div>{ /* What: Title Block Div Element. Why: The kicker, name, and mode pill read as one grouped title. How: This wraps those three pieces so the header's own flex layout can place the Edit button beside them. */ }


					<div className='kicker'>Picker</div>{ /* What: Kicker Div Element. Why: A small eyebrow label orients the reader before the picker's own name. How: This renders the literal word "Picker". */ }

					<h2
						className='picker-title'

						data-element-name-hook='picTitHea'
					>{ picDatObj.name }</h2>{ /* What: Title Heading Element. Why: The picker's own name is this view's main heading. How: This renders picker.name. Its data-element-name-hook is read by help mode's Stats catalog and help mode's Pickers catalog. */ }



					<PilTagCom
						data-element-name-hook='modPilSpa'

						tonValStr='mode'
					>{ modInfObj.labStr }</PilTagCom>{ /* What: Pill Tag Component. Why: The picker's own mode reads as a small status pill beside its name. How: This renders modInfObj.labStr inside the shared PilTagCom component. Its data-element-name-hook is read by help mode's Stats catalog and help mode's Pickers catalog. */ }


				</div>



				<ButBasCom
					className='picker-edit-btn'

					data-element-name-hook='picEdiBut'

					icoNamStr='ediEle'
					kinValStr='secondary'
					sizValStr='sm'

					onClick={ () => setEdiOpeBoo( true ) }
				>Edit</ButBasCom>{ /* What: Button Base Component. Why: The user needs a way to open PicForCom's own Details step against this exact picker. How: This flips ediOpeBoo true on click. Its data-element-name-hook is read by the Pickers page tour and help mode's Pickers catalog. */ }


			</header>


			{ Array.isArray( modInfObj.hinArr ) // What: Hint Content Check. Why: A mode's own hint can be one paragraph or several. How: This maps every paragraph when hint is an array, otherwise renders the single hint.


				? modInfObj.hinArr.map( ( parTexStr, parIndNum ) => ( // What: Multi-Paragraph Hint Render. Why: Some modes explain themselves across more than one short paragraph. How: This maps modInfObj.hinArr to one <p> per entry when it's an array.


					<p
						key={ parIndNum }

						className='picker-hint'

						data-element-name-hook='picHinPar'
					>{ parTexStr }</p> // What: Hint Paragraph Element. Why: Each paragraph renders as its own hint line. How: This renders parTexStr, keyed by its index. Its data-element-name-hook is read by help mode's Stats catalog and help mode's Pickers catalog.


				) )

				: ( // What: Single-Paragraph Hint Render. Why: Most modes only need one short explanation. How: This renders modInfObj.hinArr directly when it's a plain string.


					<p
						className='picker-hint'

						data-element-name-hook='picHinPar'
					>{ modInfObj.hinArr }</p> // What: Hint Paragraph Element. Why: A single-paragraph hint renders as one hint line. How: This renders modInfObj.hinArr directly. Its data-element-name-hook is read by help mode's Stats catalog and help mode's Pickers catalog.


				)


			}

			<p
				className='picker-hint'

				data-element-name-hook='picHinPar'
			>Please note that any items in this picker&rsquo;s pool that are already included in the Today tab will be excluded from being selected.</p>{ /* What: Exclusion Hint Paragraph Element. Why: The pool's own eligible count can otherwise look wrong to someone who doesn't know Today-listed items are excluded from picking. How: This renders a fixed explanatory sentence under every mode's own hint. Its data-element-name-hook is read by help mode's Stats catalog and help mode's Pickers catalog. */ }



			<div
				className='picker-run'

				data-element-name-hook='picRunDiv'
			>{ /* What: Run Div Element. Why: The stage and its action buttons form one visual unit. How: This wraps picker-stage and picker-actions together. Its data-element-name-hook is read by the Pickers page tour, the App Features tours, and help mode's Pickers catalog. */ }


				<div className='picker-stage'>{ /* What: Stage Div Element. Why: Exactly one of five states (idle/running-or-done/sent/empty) is showing at any moment. How: This wraps whichever of the branches below currently matches runPhaStr. */ }


					{ runPhaStr === 'idle' && ( // What: Idle Stage Check. Why: The idle state shows a simple eligible-count readout. How: This renders only while runPhaStr is 'idle'.


						<div className='stage-idle'>{ /* What: Idle Stage Div Element. Why: This groups the eligible count and its own label. How: This wraps stage-idle-num and stage-idle-lbl. */ }


							<div className='stage-idle-num'>{ eliIteArr.filter( ( iteCurObj ) => !todIdeSet.has( iteCurObj.id ) ).length }</div>{ /* What: Idle Number Div Element. Why: The user needs to see how many items are actually eligible right now. How: This counts eliIteArr minus whatever's already on Today. */ }

							<div className='stage-idle-lbl'>items in the pool</div>{ /* What: Idle Label Div Element. Why: The bare number above needs a caption. How: This renders the fixed literal text. */ }


						</div>


					) }



					{ ( runPhaStr === 'running' || runPhaStr === 'done' ) && picResObj && picResObj.picObj && ( // What: Running-Or-Done Stage Check. Why: The cycle animation itself spans both the running and just-settled done states. How: This renders PicStrCom only while a real pick result exists in either of those two phases.


						<PicStrCom
							canIteArr={ picResObj.cycArr }
							picIteObj={ picResObj.picObj }
							styKeyStr={ aniStyStr }

							onCycDonFun={ onAniDonFun }
						/> // What: Picker Strip Component. Why: This is the actual reel/spotlight/dissolve cycle animation. How: This is passed the computed cycle candidates and the settled pick, and calls onAniDonFun once it lands.


					) }



					{ runPhaStr === 'sent' && picResObj && picResObj.picObj && ( // What: Sent Stage Check. Why: A brief confirmation replaces the stage right after Send to Today commits. How: This renders only while runPhaStr is 'sent' and a real pick result still exists.


						<div className='stage-sent'>{ /* What: Sent Stage Div Element. Why: The checkmark, the sent item's own name, and its caption read as one confirmation block. How: This wraps those three pieces. */ }


							<div className='stage-sent-check'>{ /* What: Sent Check Div Element. Why: A checkmark icon needs its own small badge to sit in. How: This wraps a single IcoSvgCom. */ }


								<IcoSvgCom
									icoNamStr='cheEle'
									sizValNum={ 26 }
								/>{ /* What: Icon Svg Component. Why: A checkmark is the clearest possible confirmation glyph. How: This renders the shared check icon at a fixed size. */ }


							</div>

							<div className='stage-sent-name'>{ picResObj.picObj.name }</div>{ /* What: Sent Name Div Element. Why: The user should see exactly which item just landed on Today. How: This renders picResObj.picObj.name. */ }

							<div className='stage-idle-lbl'>Added to Today</div>{ /* What: Sent Label Div Element. Why: The confirmation needs a short caption. How: This renders the fixed literal text. */ }


						</div>


					) }


					{ runPhaStr === 'empty' && ( // What: Empty Stage Check. Why: A pool with nothing eligible needs its own explanatory state instead of a blank stage. How: This renders only while runPhaStr is 'empty'.


						<div className='stage-empty'>{ /* What: Empty Stage Div Element. Why: The placeholder number, its explanation, and (for Ease Down) a Refill button read as one block. How: This wraps those pieces. */ }


							<div className='stage-idle-num'>&mdash;</div>{ /* What: Empty Number Div Element. Why: A dash stands in for "nothing to count" in the same slot the idle count normally uses. How: This renders a literal em dash glyph, the documented display-character exception to the no-em-dash copy rule. */ }

							<div className='stage-idle-lbl'>{ /* What: Empty Label Div Element. Why: Each mode empties out for a different reason and needs its own explanation. How: This picks one of three fixed sentences based on picDatObj.mode. */ }


								{ picDatObj.mode === 'ease-up' // What: Ease Up Check. Why: An ease-up picker empties because nothing has drifted to eligibility yet. How: This picks the ease-up sentence when the mode matches.
									? 'Nothing eligible yet. Run again to drift items closer.'          // What: Ease Up Message. Why: Nothing in an ease-up pool has drifted to eligibility yet. How: This tells the user to run again.
									: picDatObj.mode === 'ease-down'                                    // What: Ease Down Check. Why: An ease-down picker empties because everything is depleted. How: This picks the ease-down sentence when the mode matches.
										? 'Everything is depleted. Refill the picker to bring items back.' // What: Ease Down Message. Why: Every item in an ease-down pool is depleted. How: This points the user at Refill.
										: 'No items in this picker.'                                       // What: Empty Pool Branch. Why: Every other mode only empties when it has no items at all. How: This renders a fixed sentence.
								}


							</div>



							{ picDatObj.mode === 'ease-down' && ( // What: Refill Button Check. Why: Only Ease Down can ever be depleted in a way a Refill actually fixes. How: This renders the Refill button only for that mode.


								<ButBasCom
									icoNamStr='refEle'
									kinValStr='primary'
									sizValStr='sm'

									onClick={ () => actStoObj.filPicFun( picDatObj.id ) }
								>Refill</ButBasCom> // What: Button Base Component. Why: The user needs a direct way to bring every item back to full charge. How: This calls actions.filPicFun with this picker's own id.


							) }


						</div>


					) }


				</div>



				<div className='picker-actions'>{ /* What: Actions Div Element. Why: Exactly one action row (the done/sent trio, or the single Pick One button) shows at a time. How: This wraps whichever branch below currently matches runPhaStr. */ }


					{ ( runPhaStr === 'done' || runPhaStr === 'sent' ) ? ( // What: Done-Or-Sent Actions Check. Why: Send to Today, Re-Roll, and Done only make sense once a pick has actually settled. How: This renders that trio while runPhaStr is 'done' or 'sent', otherwise the single Pick One button below.


						<React.Fragment>{ /* What: Done-Or-Sent Fragment Element. Why: Send to Today, Re-Roll, and Done are true siblings with no shared wrapper of their own. How: This groups all 3 buttons without adding an extra DOM node. */ }


							<ButBasCom
								className={ ` pv-act   pv-act--send   ${ runPhaStr === 'sent' ? 'is-sent' : '' } ` }

								style={{ animationDelay : '0ms' }}

								data-element-name-hook='picSenBut'
								data-pick-sent-active={ runPhaStr === 'sent' || undefined } // What: Pick Sent Active Attribute. Why: The tours need to know whether this pick has already been sent to Today without reading the button's own classes. How: This is present only while runPhaStr is 'sent', since undefined drops the attribute entirely.

								icoNamStr='cheEle'
								kinValStr='primary'

								onClick={ senTodFun }
							>{ /* What: Button Base Component. Why: This is the primary confirm action for a settled pick. How: This calls senTodFun, then re-labels itself "Sent!" once runPhaStr flips to 'sent'. Its data-element-name-hook is read by the Pickers page tour and the App Features tours. */ }


								<span
									key={ runPhaStr === 'sent' ? 'sent' : 'send' }

									className='pv-send-label set-sub-fade'
								>{ /* What: Send Label Span Element. Why: The label itself needs to cross-fade between its two states. How: This is re-keyed by runPhaStr so React replays the fade on every change. */ }


									{ runPhaStr === 'sent' ? 'Sent!' : 'Send to Today' }{ /* What: Send Label Expression. Why: The label confirms the send once it happens. How: This reads 'Sent!' while runPhaStr is 'sent', otherwise 'Send to Today'. */ }


								</span>


							</ButBasCom>



							<ButBasCom
								className={ ` pv-act   pv-act--reroll   ${ ( butLeaBoo || runPhaStr === 'sent' ) ? 'is-leaving' : '' }   ${ intSenBoo ? 'is-tour-disabled' : '' } ` }

								style={{ animationDelay : '60ms' }}

								data-element-name-hook='picRerBut'

								disabled={ intSenBoo }
								icoNamStr='refEle'
								kinValStr='ghost'

								onClick={ () => aftExiFun( rerActFun ) }
							>Re-Roll</ButBasCom>{ /* What: Button Base Component. Why: The user needs a way to abandon this exact pick and get a fresh one, playing the shared exit animation first. How: This calls aftExiFun(rerActFun), disabled only during the page tour's own intercepted step. */ }{ /* What: Reroll Classname Design Note. Why: The pv-act--reroll class lets App Features' own manual-pick tour target this specific button (cptSelStr, see onboarding/app-features.jsx) without also matching Send to Today or Done. How: disabled/is-tour-disabled below still only ever check intSenBoo (the ORIGINAL Pickers page tour), unchanged; App Features leaves Re-Roll fully usable on purpose, see disDonBoo's own comment above. Its data-element-name-hook is read by the App Features tours. */ }



							<ButBasCom
								className={ ` pv-act   ${ ( butLeaBoo || runPhaStr === 'sent' ) ? 'is-leaving' : '' }   ${ disDonBoo ? 'is-tour-disabled' : '' } ` }

								style={{ animationDelay : '120ms' }}

								disabled={ disDonBoo }
								kinValStr='ghost'
								sizValStr='sm'

								onClick={ () => aftExiFun( () => { // What: On Click Handler. Why: Done plays the buttons' exit before clearing the pick. How: This runs aftExiFun with a reset of the phase and the result.


									setRunPhaStr( 'idle' ); // What: Idle Phase Call. Why: The stage returns to its starting state. How: This writes 'idle' into runPhaStr.
									setPicResObj( null );   // What: Result Clear Call. Why: The previous pick no longer applies. How: This resets picResObj to null.


								} ) }
							>Done</ButBasCom>{ /* What: Button Base Component. Why: The user needs a way to walk away from this pick without sending or re-rolling it, playing the shared exit animation first. How: This calls aftExiFun with a callback resetting straight back to idle. */ }


						</React.Fragment>


					) : ( // What: Pick One Branch. Why: Before a pick has settled, only the initial trigger belongs here. How: This renders the else branch, taken while runPhaStr is neither 'done' nor 'sent'.


						<ButBasCom
							className={ ` pv-act   pv-act--pick   ${ busPicBoo ? 'is-busy' : '' } ` }

							data-element-name-hook='picOneBut'

							disabled={ busPicBoo }
							icoNamStr='plaEle'
							kinValStr='primary'

							onClick={ runPicFun }
						>{ busPicBoo ? 'Picking…' : 'Pick One' }</ButBasCom> // What: Button Base Component. Why: This is the sole entry point into a fresh cycle. How: This calls runPicFun, disabling and relabeling itself while busPicBoo is true. Its data-element-name-hook is read by the Pickers page tour and the App Features tours.


					) }


				</div>


			</div>



			<div className='picker-pool'>{ /* What: Pool Div Element. Why: The item list and the add/edit slot below it form one visual section. How: This wraps pool-items and pv-additem-wrap. */ }


				<div
					className='pool-items'

					data-element-name-hook='pooIteDiv'
				>{ /* What: Pool Items Div Element. Why: The pool's own header and its list of rows need one shared box the tour can highlight together. How: This wraps pool-h and pool-list. */ }{ /* What: Pool Items Wrap Design Note. Why: This wrapper is purely structural, letting the Pickers page tour highlight the header + item list as one combined box without also catching "+ Add Item" below (a step of its own, see .pv-additem-wrap further down). How: This mirrors .picker-pool's own flex/gap so wrapping these two doesn't change their spacing. Its data-element-name-hook is read by the Pickers page tour, the App Features tours, and help mode's Pickers catalog. */ }


					<div className='pool-h'>{ /* What: Pool Header Div Element. Why: The eligible-count kicker and the drift-toggle link sit on one row. How: This wraps those two pieces. */ }


						<span className='kicker'>Pool &middot; { eliIteArr.filter( ( iteCurObj ) => !todIdeSet.has( iteCurObj.id ) && PIC_NAM_OBJ.modEliFun( iteCurObj, picDatObj ) ).length } of { picIteArr.length } eligible</span>{ /* What: Kicker Span Element. Why: The user needs a quick sense of how many of the pool's own items are actually pickable right now. How: This renders both the mode-eligible-and-not-on-Today count and the pool's own total size. */ }

						{ ( picDatObj.mode !== 'random' && picDatObj.mode !== 'weighted' ) && ( // What: Drift Toggle Check. Why: Only a mode that actually tracks a drifting value has anything to show or hide here. How: This renders the Show/Hide drift link only for those modes.


							<button
								className='ghost-link'

								onClick={ () => setShoDriBoo( ( preValBoo ) => !preValBoo ) }
							>{ /* What: Drift Toggle Button Element. Why: The user needs a way to reveal or hide each row's own drift/readiness bar. How: This flips shoDriBoo on click. */ }


								<IcoSvgCom
									icoNamStr={ shoDriBoo ? 'eyoEle' : 'eyeEle' }
									sizValNum={ 13 }
								/>{ /* What: Icon Svg Component. Why: An eye/eye-off glyph reads faster than text alone for a show/hide toggle. How: This switches icon name based on shoDriBoo. */ }

								{ shoDriBoo ? 'Hide drift' : 'Show drift' }{ /* What: Drift Label Expression. Why: The toggle's text names what clicking it will do. How: This reads 'Hide drift' while shoDriBoo is on, otherwise 'Show drift'. */ }


							</button>


						) }


					</div>



					<div className='pool-list'>{ /* What: Pool List Div Element. Why: One row per pool item needs a shared list container. How: This maps picIteArr to one row per item below. */ }


						{ picIteArr.map( ( curIteObj ) => { // What: Pool Row List Render. Why: Every item in this picker's own pool needs its own row, computed fresh each render from its current readiness/eligibility. How: This maps picIteArr to one row per curIteObj, deriving each row's own tooltip text from its mode-specific meaning.


							const reaValNum = PIC_NAM_OBJ.reaValFun( curIteObj, picDatObj.mode, picDatObj.threshold ?? 100 ); // What: Readiness Value Number. Why: The drift bar (when shown) needs a normalized 0..1 progress value. How: This calls the shared readiness helper for this exact item/mode/threshold.
							const eliHerBoo = PIC_NAM_OBJ.modEliFun( curIteObj, picDatObj );                                  // What: Eligible Here Boolean. Why: The row needs to know whether this item is currently pickable under this picker's own mode rules. How: This calls the shared mode-eligibility helper.
							const weiValNum = curIteObj.weight;                                                               // What: Weight Value Number. Why: The tooltip text needs the item's own current weight. How: This is read directly off curIteObj.weight. // What: Weight Tooltip String. Why: The wN pill (itself fixed, it never drifts) benefits from a plain-language hover explanation of what the number means. How: This is computed from curIteObj's own weight below.


							const weiTipStr = weiValNum === 1 // What: Weight Tip String. Why: The weight pill's tooltip explains what this item's weight means. How: This picks the baseline sentence for w1, otherwise a multiplier sentence.
								? 'Weight 1, the baseline pick rate.'                                            // What: Baseline Weight Branch. Why: A w1 item is the reference point. How: This returns a fixed sentence.
								: `Weight ${ weiValNum }, ${ weiValNum }× as likely to be picked as a w1 item.`; // What: Multiplied Weight Branch. Why: A heavier item is picked proportionally more often. How: This names the weight as a multiple of w1.


							const thrValNum = picDatObj.threshold ?? 100; // What: Threshold Value Number. Why: Two of the three explanations below need to quote the picker's own threshold. How: This falls back to 100 when the picker has no explicit threshold set. // What: Value Tooltip String. Why: The drifting `value` shown beside wN changes run-to-run, and what it means depends entirely on the picker's own mode. How: This picks one of three explanations, or an empty string for modes with no such meaning.


							const valTipStr = picDatObj.mode === 'dynamic' // What: Value Tip String. Why: The value pill's tooltip explains what the drifting number means for this picker's mode. How: This picks one sentence per mode, empty for modes with no drifting value.
								? `Drift bonus, climbs by ${ weiValNum } (the item’s weight) every time it isn’t picked, and resets to 0 when it is.`                                                                       // What: Dynamic Value Branch. Why: A dynamic item's value is its drift bonus. How: This explains how the bonus climbs and resets.
								: picDatObj.mode === 'ease-up' // What: Ease Up Check. Why: Ease Up's value means progress toward eligibility. How: This checks the picker's mode.
								? `Progress toward eligibility, starts at 0 and rises by a random amount each run it isn’t picked. The item becomes pickable at ${ thrValNum }, then resets to 0.`                          // What: Ease Up Value Branch. Why: An ease-up item's value climbs toward the threshold. How: This explains how it rises and resets.
								: picDatObj.mode === 'ease-down' // What: Ease Down Check. Why: Ease Down's value means remaining charge. How: This checks the picker's mode.
								? `Remaining charge, starts at ${ thrValNum } and drops by a random amount each time it’s picked. At 0 it refills automatically and a new item is chosen; this one sits out the next pick.` // What: Ease Down Value Branch. Why: An ease-down item's value is its remaining charge. How: This explains how it drains and refills.
								: ''; // What: Empty Value Branch. Why: Random and Weighted have no drifting value at all. How: This returns an empty string.



							return (


								<div
									key={ curIteObj.id }

									className={ ` pool-row   ${ curIteObj.vacation ? 'is-vac' : '' }   ${ !eliHerBoo ? 'is-ineligible' : '' }   ${ insSavStr === curIteObj.id ? 'pool-row--insert' : '' }   ${ conDelStr === curIteObj.id ? 'pool-row--confirm' : '' }   ${ rmvIdeStr === curIteObj.id ? 'pool-row--removing' : '' } ` }

									onAnimationEnd={ ( aniEveObj ) => { // What: On Animation End Handler. Why: A saved row's slide-in and a deleted row's removal both finish on this row's own animation end. How: This clears the insert flag, and removes the item once its removal animation is done.


										if ( insSavStr === curIteObj.id ) setInsSavStr( null ); // What: Insert Clear Guard. Why: A just-saved row's slide-in plays only once. How: This clears insSavStr when its animation belongs to this row.



										if ( rmvIdeStr === curIteObj.id && aniEveObj.target === aniEveObj.currentTarget ) { // What: Removal Finished Guard. Why: The item leaves the store only after its own row finishes the removal animation. How: This checks the row is the one being removed and the event came from the row itself.


											actStoObj.delIteFun( curIteObj.id ); // What: Remove Item Call. Why: The row's removal animation has finished, so the store can drop it. How: This calls delIteFun with this row's id.
											setRmvIdeStr( null );                // What: Removing Clear Call. Why: The removal is finished. How: This resets rmvIdeStr to null.


										}


									} }
								>{ /* What: Row Div Element. Why: Every pool item needs one row, whichever of its own name/meta/actions or delete-confirm content currently applies. How: This carries every one of this row's own transient animation classes, and commits the real delete/removal once its own leaving keyframe finishes. */ }


									{ conDelStr === curIteObj.id ? ( // What: Delete Confirm Check. Why: A row pending delete confirmation replaces its own normal content entirely. How: This renders the confirm row while conDelStr matches this item, otherwise the row's real content below.


										<div className={ ` pool-confirm   ${ conLeaStr === curIteObj.id ? 'is-leaving' : '' } ` }>{ /* What: Confirm Div Element. Why: The delete question and its Cancel/Delete buttons form one block. How: This wraps pool-confirm-msg and pool-confirm-actions. */ }


											<span className='pool-confirm-msg'>Delete <strong>{ curIteObj.name }</strong>?</span>{ /* What: Confirm Message Span Element. Why: The user must see exactly which item they're about to delete. How: This renders curIteObj.name inside the fixed question text. */ }

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
												>Delete</ButBasCom>{ /* What: Button Base Component. Why: This is the actual confirmed delete action. How: This clears the confirm state and starts the row's own removal animation. */ }


											</div>


										</div>


									) : ( // What: Row Content Branch. Why: A row not pending delete confirmation shows its own normal name/meta/actions content instead. How: This renders the else branch, taken while conDelStr doesn't match this item.


										<React.Fragment>{ /* What: Row Content Fragment Element. Why: The name/meta block and the send/edit/delete actions below are true siblings with no shared wrapper of their own. How: This groups all of this row's own real content without adding an extra DOM node. */ }


											<div className='pool-name'>{ /* What: Name Div Element. Why: The item's own name and its status pills (inactive/not yet/spent) belong together. How: This wraps the name span and its conditional pills. */ }


												<span className='pool-item-name'>{ curIteObj.name }</span>{ /* What: Name Span Element. Why: Every row needs its own visible item name. How: This renders curIteObj.name. */ }



												{ curIteObj.vacation && <PilTagCom tonValStr='muted'>inactive</PilTagCom> }{ /* What: Inactive PilTagCom Check. Why: A vacationing item needs a clear status label. How: This renders the pill only while curIteObj.vacation is true. */ }



												{ !eliHerBoo && !curIteObj.vacation && <PilTagCom tonValStr='muted'>{ picDatObj.mode === 'ease-up' ? 'not yet' : 'spent' }</PilTagCom> }{ /* What: Ineligible PilTagCom Check. Why: An active-but-currently-ineligible item needs a status label distinct from "inactive". How: This renders only while eliHerBoo is false and curIteObj.vacation is also false, wording itself per mode. */ }


											</div>

											<div className='pool-meta'>{ /* What: Meta Div Element. Why: The optional drift bar and the optional weight pill sit side by side. How: This wraps both, each independently gated. */ }


												{ shoDriBoo && reaValNum != null && ( // What: Drift Bar Check. Why: The drift bar only makes sense once the toggle is on and this mode actually has a readiness value at all. How: This renders the InfTipCom-wrapped bar only when both conditions hold.


													<InfTipCom
														className='pool-prog'

														labTexStr={ valTipStr }
													>{ /* What: Info Tip Component. Why: The drift bar benefits from an on-demand explanation of what its value means. How: This shows valTipStr on hover or focus. */ }


														<ProBarCom
															curValNum={ reaValNum }
															maxValNum={ 1 }
															tonValStr={ picDatObj.mode === 'ease-down' ? 'warm' : 'accent' }
														/>{ /* What: Progress Bar Component. Why: A visual bar reads faster than the raw number alone. How: This renders reaValNum against a max of 1, tinted warm for Ease Down and accent otherwise. */ }



														<span className='pool-val'>{ Math.round( curIteObj.value ) }</span>{ /* What: Value Span Element. Why: The exact underlying number is still useful alongside the bar. How: This renders curIteObj.value, rounded. */ }


													</InfTipCom>


												) }



												{ ( picDatObj.mode === 'weighted' || picDatObj.mode === 'dynamic' ) && ( // What: Weight Pill Check. Why: Only these two modes treat weight as a real lever worth showing. How: This renders the weight pill only for those modes.


													<InfTipCom
														className='pool-weight'

														labTexStr={ weiTipStr }
													>w{ curIteObj.weight }</InfTipCom> // What: Info Tip Component. Why: The weight number benefits from the same hover explanation every other tooltip in this row gets. How: This renders "w" plus the raw weight, tipped with weiTipStr.


												) }


											</div>



											{ senIdeStr === curIteObj.id ? ( // What: Sent Row Check. Why: A row just sent via its own per-item button needs its own brief confirmation in place of the normal Send button. How: This renders the disabled checkmark button while senIdeStr matches this item.


												<button
													className='pool-send is-sent'

													disabled
													type='button'

													aria-label={ `${ curIteObj.name } sent to Today` }
													title='Sent to Today'
												>{ /* What: Sent Pool Button Element. Why: A brief, disabled confirmation reads clearer than the button just vanishing. How: This is disabled and shows a checkmark instead of the calendar glyph. */ }


													<IcoSvgCom
														icoNamStr='cheEle'
														sizValNum={ 15 }
													/>{ /* What: Icon Svg Component. Why: A sent row shows a checkmark instead of the send glyph. How: This renders the 'cheEle' icon at a fixed size. */ }


												</button>


											) : todIdeSet.has( curIteObj.id ) ? ( // What: Already On Today Check. Why: An item already sent to Today can't be sent again and needs an explained disabled state instead. How: This renders the disabled InfTipCom while todIdeSet has this item's own id, the real Send button otherwise.


												<InfTipCom
													className='pool-send is-disabled'

													labTexStr='This item is already included in the Today tab.'
												>{ /* What: Info Tip Component. Why: An item already on Today can't be sent again, and the user should know why the button is inert. How: This wraps the calendar glyph with an explanatory tooltip instead of a real button. */ }


													<IcoSvgCom
														icoNamStr='calEle'
														sizValNum={ 15 }
													/>{ /* What: Icon Svg Component. Why: The send action needs a recognizable "to Today" glyph. How: This renders the 'calEle' icon at a fixed size. */ }


												</InfTipCom>


											) : ( // What: Send Button Branch. Why: An item that's neither just-sent nor already on Today gets the real, working Send button. How: This renders the else branch, taken while neither prior condition holds.


												<button
													className={ ` pool-send   ${ higSenBoo ? 'ob-tour-pulse' : '' } ` }

													disabled={ disIteBoo }
													type='button'

													aria-label={ `Send ${ curIteObj.name } to Today` }
													title='Send to Today'

													onClick={ () => senIteFun( curIteObj.id ) }
												>{ /* What: Send Pool Button Element. Why: This is the actual per-item Send to Today action. How: This calls senIteFun with this row's own item id. */ }


													<IcoSvgCom
														icoNamStr='calEle'
														sizValNum={ 15 }
													/>{ /* What: Icon Svg Component. Why: The send action needs a recognizable "to Today" glyph. How: This renders the 'calEle' icon at a fixed size. */ }


												</button>


											) }



											<button
												className='pool-edit'

												disabled={ disEdiBoo }
												type='button'

												aria-label={ `Edit ${ curIteObj.name }` }
												title='Edit'

												onClick={ () => staEdiFun( curIteObj.id ) }
											>{ /* What: Edit Pool Button Element. Why: Every row needs a way to open its own item in the shared editor slot below. How: This calls staEdiFun with this row's own item id. */ }


												<IcoSvgCom
													icoNamStr='ediEle'
													sizValNum={ 15 }
												/>{ /* What: Icon Svg Component. Why: The edit action needs a recognizable pencil glyph. How: This renders the 'ediEle' icon at a fixed size. */ }


											</button>



											{ picIteArr.length <= 2 ? ( // What: Delete Guard Check. Why: A picker must always keep at least 2 items, so the last two rows can't offer a real delete button at all. How: This renders a disabled, explanatory InfTipCom instead of a working Delete button whenever the pool is at that floor.


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


											) : ( // What: Delete Button Branch. Why: With more than 2 items in the pool, a real working Delete button belongs here instead. How: This renders the else branch, taken while picIteArr.length is above 2.


												<button
													className='pool-del'

													disabled={ disEdiBoo }
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


				</div>



				<div
					ref={ addWraRef }

					className='pv-additem-wrap'

					data-element-name-hook='iteAddDiv'
				>{ /* What: Add Item Wrap Div Element. Why: The new-item form, the existing-item editor, and the plain "+ Add Item" button all share this one below-the-list slot. How: This wraps whichever of those three the IIFE below currently resolves to. Its data-element-name-hook is read by the picker mini-tours. */ }


					{ ( () => { // What: Additem Slot Render. Why: Exactly one of three things belongs in this slot at a time (an open existing-item editor, an open new-item draft editor, or the plain add button), and that choice is easier to express as a small function than as a nested ternary. How: This checks ediIteStr first, then newDraObj, falling back to the plain button.


						if ( ediIteStr ) { // What: Existing Item Editor Branch. Why: An existing item's own editor takes priority whenever one is open. How: This looks up the live item (not a snapshot, so EntEdiCom's own direct store calls stay reflected immediately) and renders its editor, or nothing if it vanished out from under itself.


							const ediLivObj = staAppObj.items.find( ( iteCurObj ) => iteCurObj.id === ediIteStr ); // What: Editing Live Object. Why: Weight/ease stepper clicks inside EntEdiCom call the REAL actions.updIteFun/setWeiFun directly, so this must be looked up live, not snapshotted, same as the pool row itself. How: This looks up ediIteStr fresh in staAppObj.items on every render.


							if ( !ediLivObj ) return null; // What: Vanished Item Guard. Why: The item may have been deleted via the row's own trash icon while this was open; that confirm flow already owns closing this out. How: This renders nothing rather than crashing against a missing item.



							return (


								<div
									className={ ` pv-newitem   rd-item   is-editing   ${ ediCloBoo ? 'is-closing' : '' } ` }

									data-element-name-hook='lisIteDiv'

									onAnimationEnd={ ( aniEveObj ) => { // What: On Animation End Handler. Why: The item editor's own close animation must finish before its state clears. How: This clears the closing and open flags, then opens any editor requested meanwhile.


										if ( !ediCloBoo || aniEveObj.target !== aniEveObj.currentTarget ) return; // What: Not Closing Guard. Why: Only the editor's own closing animation should finish the close. How: This bails out unless ediCloBoo is set and the event came from this element.



										setEdiCloBoo( false ); // What: Closing Clear Call. Why: The close animation is over. How: This resets ediCloBoo to false.

										setEdiIteStr( null ); // What: Editor Clear Call. Why: No item's editor stays open. How: This resets ediIteStr to null.

										if ( penEdiRef.current ) { // What: Pending Editor Guard. Why: A different item's editor may have been requested while this one was closing. How: This opens it once this editor has finished closing.


											const tarIdeStr = penEdiRef.current; // What: Target Identifier String. Why: The pending editor request must be read before it's cleared. How: This copies penEdiRef.current.


											penEdiRef.current = null; // What: Pending Clear. Why: The request is being handled now, so it must not run twice. How: This resets penEdiRef to null.
											opeEdiFun( tarIdeStr );   // What: Open Editor Call. Why: The editor the user asked for opens once the previous one has closed. How: This calls opeEdiFun with tarIdeStr.


										}


									} }
								>{ /* What: Editing Item Wrap Div Element. Why: This is the whole existing-item editor slot, playing its own closing animation before actually unmounting. How: This reopens whatever edit staEdiFun staged in penEdiRef once its own closing keyframe finishes. Its data-element-name-hook is read by the App Features tours, help mode's Pickers catalog, and help mode's Data catalog. */ }


									<div
										className='rd-row'

										onClick={ ( clkEveObj ) => clkEveObj.stopPropagation() }
									>{ /* What: Row Div Element. Why: A click inside the name row must not bubble up to whatever the pool row itself listens for. How: This stops propagation on every click. */ }


										<span className='rd-main'>{ /* What: Main Span Element. Why: The name input needs the same wrapper the closed row's name uses. How: This wraps the input below. */ }


											<input
												className='rd-name-input'

												data-element-name-hook='rowNamInp'

												autoFocus
												maxLength={ 60 }
												placeholder='Item name'
												type='text'
												value={ ediNamStr }

												aria-label='Item name'

												onBlur={ ( bluEveObj ) => { // What: On Blur Handler. Why: Leaving the name field commits a tidied name. How: This trims the value and renames the item when it's non-empty.


													const newNamStr = bluEveObj.target.value.trim(); // What: New Name String. Why: A blur commit should tidy the name, not keep stray whitespace. How: This trims the input's current value.


													if ( newNamStr ) actStoObj.renIteFun( ediLivObj.id, newNamStr ); // What: Rename Item Guard. Why: A blank name must never be committed. How: This renames the item only when newNamStr is non-empty.


												} }
												onChange={ ( chaEveObj ) => setEdiNamStr( chaEveObj.target.value ) }
												onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Enter' ) keyEveObj.currentTarget.blur(); } }
											/>{ /* What: Name Input Element. Why: This is the actual live-typed name field for the item being edited. How: This commits via actions.renIteFun on blur, and blurs itself on Enter. Its data-element-name-hook is read by the picker mini-tours, help mode's Pickers catalog, and help mode's Data catalog. */ }


										</span>


									</div>

									<div className='rd-edit'>{ /* What: Edit Div Element. Why: EntEdiCom's own weight/ease/vacation controls need their own slot below the name row. How: This wraps a single EntEdiCom instance. */ }


										<EntEdiCom
											key={ ediLivObj.id }

											actStoObj={ actStoObj }
											iteDatObj={ ediLivObj }
											picDatObj={ picDatObj }

											onCloEdiFun={ () => setEdiCloBoo( true ) }
										/>{ /* What: Entry Editor Component. Why: Editing a pool item reuses the exact item editor Today and Data use. How: This is passed the live item, the picker, and the actions it edits through. */ }{ /* What: No-Ondelete Design Note. Why: EntEdiCom's own footer Delete button is already hidden by the existing .pv-newitem CSS rule (".rd-edit-foot > .btn--danger { display: none }"), same as the new-item flow below. How: Deleting an existing item stays solely the row's own trash icon + confirm flow, one delete affordance per item instead of two that could disagree with each other, so no onDelete prop is passed below. */ }{ /* What: Editor Key Design Note. Why: Without a key keyed to ediLivObj.id, switching ediIteStr straight from one item to another (see staEdiFun) can commit in a single React batch with no intervening null render, so this would stay the SAME EntEdiCom instance across the switch: its internal `orig` snapshot ref (captured once, on mount) would keep pointing at the FIRST item, and its unmount effect, which is what discards live edits via window.__editGuard when a close wasn't an explicit Save/Cancel, would never run at all. How: The key below forces React to unmount the old instance and mount a fresh one whenever the id changes, even within one commit. */ }


									</div>


								</div>


							);


						}



						const newIteObj = newDraObj; // What: New Item Object. Why: The branch below needs a stable local alias to check and render from. How: This is just newDraObj, read once for this render.


						if ( !newIteObj ) return ( // What: No Draft Branch. Why: When neither an existing edit nor a new draft is open, the plain add button belongs in this slot. How: This returns the "+ Add Item" button directly.


							<button
								className='pv-additem-btn'

								data-element-name-hook='iteAddBut'

								disabled={ disAddBoo }
								type='button'

								onClick={ addIteFun }
							>{ /* What: Add Item Button Element. Why: This starts a brand-new item draft in the pool. How: This calls the add handler on click, disabled during the matching tour step. Its data-element-name-hook is read by the Pickers page tour, the picker mini-tours, and help mode's Pickers catalog. */ }


								<IcoSvgCom
									icoNamStr='pluEle'
									sizValNum={ 14 }
								/>{ /* What: Icon Svg Component. Why: The button needs a recognizable "add" glyph beside its own label. How: This renders the 'pluEle' icon at a fixed size. */ } Add Item


							</button>


						);



						return (


							<div
								className={ ` pv-newitem   rd-item   is-editing   ${ newCloStr ? 'is-closing' : '' } ` }

								data-element-name-hook='lisIteDiv'

								onAnimationEnd={ ( aniEveObj ) => { // What: On Animation End Handler. Why: The new-item editor's own close animation must finish before the add is committed or dropped. How: This commits a saved draft, clears the draft state, then opens any editor requested meanwhile.


									if ( !newCloStr || aniEveObj.target !== aniEveObj.currentTarget ) return; // What: Not Closing Guard. Why: Only the new item's own closing animation should finish the add. How: This bails out unless newCloStr is set and the event came from this element.



									if ( newCloStr === 'save' ) cmtDraFun( newIteObj ); // What: Save Commit Guard. Why: A saved new item becomes a real item, while a cancelled one is just dropped. How: This commits the draft only when newCloStr is 'save'.



									setNewCloStr( false ); // What: Closing Clear Call. Why: The close animation is over. How: This resets newCloStr to false.

									setNewDraObj( null ); // What: Draft Clear Call. Why: The new-item draft is finished either way. How: This resets newDraObj to null.

									if ( penEdiRef.current ) { // What: Pending Editor Guard. Why: A different item's editor may have been requested while this one was closing. How: This opens it once this editor has finished closing.


										const tarIdeStr = penEdiRef.current; // What: Target Identifier String. Why: The pending editor request must be read before it's cleared. How: This copies penEdiRef.current.


										penEdiRef.current = null; // What: Pending Clear. Why: The request is being handled now, so it must not run twice. How: This resets penEdiRef to null.
										opeEdiFun( tarIdeStr );   // What: Open Editor Call. Why: The editor the user asked for opens once the previous one has closed. How: This calls opeEdiFun with tarIdeStr.


									}


								} }
							>{ /* What: New Item Wrap Div Element. Why: This is the whole new-item draft editor slot, playing its own closing animation before actually committing or discarding. How: This commits the draft via cmtDraFun only when newCloStr is 'save', then reopens whatever staEdiFun staged in penEdiRef. Its data-element-name-hook is read by the App Features tours, help mode's Pickers catalog, and help mode's Data catalog. */ }


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
										/>{ /* What: Name Input Element. Why: This is the actual live-typed name field for the draft being created. How: This writes into draActObj (not the real store) on every change, and commits the rename on blur. Its data-element-name-hook is read by the picker mini-tours, help mode's Pickers catalog, and help mode's Data catalog. */ }


									</span>


								</div>

								<div className='rd-edit'>{ /* What: Edit Div Element. Why: EntEdiCom's own weight/ease/vacation controls need their own slot below the name row, wired to the draft instead of the real store. How: This wraps a single EntEdiCom instance bound to draActObj. */ }


									<EntEdiCom
										actStoObj={ draActObj }
										iteDatObj={ newIteObj }
										picDatObj={ picDatObj }

										onCanEdiFun={ () => setNewCloStr( 'cancel' ) }
										onCloEdiFun={ () => setNewCloStr( 'save' ) }
									/>{ /* What: Entry Editor Component. Why: The new-item draft reuses the exact item editor Today and Data use. How: This is passed the draft item, the picker, and the draft actions. */ }


								</div>


							</div>


						);


					} )() }


				</div>


			</div>


		</div>


	);


}

// #endregion PicVieCom

// #endregion Components



// #region Exports

export { PicVieCom }; // What: Named Export. Why: The Pickers tab renders this view for the selected picker. How: This exports PicVieCom by name.

// #endregion Exports


