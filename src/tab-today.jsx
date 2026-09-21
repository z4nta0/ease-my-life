


// #region Imports

import React from 'react'; // What: React. Why: This is the UI library every component in this file is built on. How: This is used directly (React.useState, React.useRef, React.useEffect, React.useMemo, React.useCallback, React.forwardRef, React.useImperativeHandle, React.Fragment) throughout, instead of importing individual named hooks.


import { APP_FEA_ARR  } from './onboarding-app-features.jsx';   // What: App Feature Array. Why: This is the fixed catalog of App Features tutorial cards rendered once the checklist concludes. How: This is mapped over to render one AppFeatureCard per entry and to compute the section's own done/total counts.
import { BacFloCom    } from './bg-flourish.jsx';               // What: Background Flourish Component. Why: The decorative background glyphs render behind Today's own centered column too, same as every other tab. How: This is passed Today's own body ref and the fixed 'today' tab id.
import { bloReaFun    } from './onboarding-app-features.jsx';   // What: Blocked Reason Function. Why: An App Feature tutorial can require an earlier one first, and the card needs to explain why it is not yet startable. How: This is called per feature id against state to get a blocking reason string, or null when it is startable.
import { BooResCom    } from './ui.jsx';                        // What: Boost Reset Component. Why: A dynamic-mode item's inline editor needs a control for resetting its boost value back to 0. How: This is rendered inside EntryEditor's own Boost row.
import { ButBasCom    } from './ui.jsx';                        // What: Button Base Component. Why: Nearly every action in this file (confirm, cancel, save, merge, generate) is a shared styled button. How: This is used throughout instead of a bare <button> for anything that needs the app's own button styling.
import { CAD_NAM_OBJ  } from './cadence.js';                    // What: Cadence Namespace Object. Why: Non-daily pickers need period-key math and unit-word phrasing shared with the rest of the app. How: This is called for perKeyFun/comPerFun/uniWorFun throughout generate() and EntryEditor.
import { ColDisCom    } from './ui.jsx';                        // What: Collapse Disclosure Component. Why: A group's Day Log panel and an entry's inline editor both need an animated expand/collapse wrapper. How: This wraps GroLogCom and EntryEditor, gated on whichever key/eid currently owns the open state.
import { CON_NAM_OBJ  } from './conditionals.js';               // What: Conditionals Namespace Object. Why: Day-off suppression during generate() needs the shared conditional-evaluation logic. How: This is called via CON_NAM_OBJ.supGatFun against each picker's own resolved conditional.
import { createPortal } from 'react-dom';                       // What: Create Portal. Why: The completion celebration's confetti/sparkle overlay must escape the tab-fade wrapper's own containing block. How: This portals the celebration overlay straight onto document.body.
import { DayLogChip   } from './day-log.jsx';                   // What: Day Log Chip. Why: Each group header needs a small toggle chip for its own Day Log panel. How: This is rendered inside GroHeaCom next to the group's own done/total count.
import { emlTouObj    } from './eml-tour-bus.js';                // What: Ease My Life Tour Object. Why: Several onboarding-adjacent features (checklist visibility, drag-hiding the tour coach, starting a create-picker flow) need to publish onto the shared tour event bus. How: This is written to directly (never read here) via its own .set method.
import { EUR_WAR_STR  } from './constants.js';                  // What: Ease-Up-Range Warning String. Why: An ease-up item's Soonest/Latest row needs its own explanatory warning text. How: This is passed as an InfTipCom's own label prop inside EntryEditor.
import { FeaTipCom    } from './onboarding-app-features.jsx';   // What: Feature Tip Component. Why: The App Features section needs a one-time "One Last Thing..." intro the first time it is shown. How: This is rendered once showAppFeaturesIntro is true, passed actStoObj so it can mark itself seen.
import { FilButCom    } from './ui.jsx';                        // What: Fill Button Component. Why: Ease-up and ease-down items each need a button that instantly fills the item to its threshold. How: This is rendered inside EntryEditor's own Fill/Refill row, labeled per direction.
import { forDatFun    } from './ui.jsx';                        // What: Format Date Function. Why: The header's own kicker line needs today's date in the app's shared display format. How: This formats the live now clock value shown next to the streak.
import { forLonFun    } from './ui.jsx';                        // What: Format Long Function. Why: The footer's "List generated on..." line needs the long-form date of the last generation. How: This formats state.today.generatedAt for that footer line.
import { forTimFun    } from './ui.jsx';                        // What: Format Time Function. Why: Both the header's kicker line and the footer's generated-on line need a formatted time of day. How: This formats the live now clock and state.today.generatedAt respectively.
import { GroLogCom    } from './day-log.jsx';                   // What: Group Log Component. Why: A group's Day Log panel needs to render that group's own picker audit rows. How: This is rendered inside a ColDisCom, scoped to one group's own name.
import { HelButCom    } from './help-mode.jsx';                 // What: Help Button Component. Why: Today needs the same help-mode toggle every other tab exposes. How: This is rendered in the header, toggling helpOn.
import { HelOveCom    } from './help-mode.jsx';                 // What: Help Overlay Component. Why: Help mode needs its own coach-mark overlay driven by this tab's own catalog of targets. How: This is rendered once, passed TOD_HEL_ARR and the helpOn/helpExit pair.
import { HOL_NAM_OBJ  } from './holidays.js';                   // What: Holidays Namespace Object. Why: Both generate()'s own skipHolidays gate and the no-run-today empty state need to know if today is an active holiday. How: This is called via HOL_NAM_OBJ.holDatFun against state.holidays.
import { IcoSvgCom    } from './ui.jsx';                        // What: Icon Svg Component. Why: Nearly every card/button in this file needs a small named glyph alongside its label. How: This is rendered throughout, given a name and a size.
import { InfTipCom    } from './ui.jsx';                        // What: Info Tip Component. Why: A disabled action (a locked re-roll, a blocked tutorial, a disabled Regenerate) still needs to explain itself on hover/tap. How: This wraps whichever control needs an explanatory label throughout this file.
import { norGroFun    } from './pickers.js';                    // What: Normalize Group Function. Why: A typed group rename/Page Tours rename needs the same normalization real picker groups already get. How: This is called inside requestRenameGroup and pageToursNameCollision.
import { NOT_NAM_OBJ  } from './notify.js';                     // What: Notification Namespace Object. Why: An auto-generated list should still fire a best-effort system notification. How: This is called via NOT_NAM_OBJ.genNotFun() right after an auto run, its result deliberately ignored.
import { NumSteCom    } from './ui.jsx';                        // What: Numeric Stepper Component. Why: An ease-mode item's Soonest/Latest values need a shared plus/minus numeric control. How: This is rendered twice inside EntryEditor's own ease rows.
import { ONB_CHE_OBJ  } from './onboarding-checklist.js';       // What: Onboarding Checklist Object. Why: The whole mini-tour checklist phase (launcher cards, readiness, done/total counts) is driven by this shared namespace. How: This is called throughout for entLooFun/cheStaFun/reaPicFun/reaGenFun/othRemFun/tutProFun.
import { ONB_GII_STR  } from './onboarding-checklist.js';       // What: Onboarding Generate-Item-Id String. Why: The closing "Generate a real list" card needs the checklist's own fixed key for that single card. How: This is passed to ONB_CHE_OBJ.entLooFun/setChecklistItem wherever that specific card is read or resolved.
import { ONB_EPT_ARR  } from './onboarding-checklist.js';       // What: Onboarding Explore-Page-Tours Array. Why: The Page Tours section needs its own fixed manifest of tour cards, separate from sample pickers/tasks. How: This is mapped over to render one PagTouCom per entry and to compute that section's own counts.
import { ONB_PCT_OBJ  } from './onboarding-seed-data.js';       // What: Onboarding Picker-Card-Time Object. Why: A still-hidden sample picker's launcher card needs a manually-timed estimate to show next to its own name. How: This is looked up by picker id inside EntCarCom's own tutorial branch.
import { ONB_SPI_ARR  } from './onboarding-seed-data.js';       // What: Onboarding Sample-Picker-Ids Array. Why: Every count/filter that distinguishes a real picker from a sample one needs this fixed id list. How: This is checked with .includes throughout groEntFun and TabToday's own counts.
import { ONB_STI_ARR  } from './onboarding-seed-data.js';       // What: Onboarding Sample-Task-Ids Array. Why: Every count/filter that distinguishes a real reminder from a sample one needs this fixed id list. How: This is checked with .includes throughout TabToday's own tutorial-task counts.
import { PAG_LAB_OBJ  } from './onboarding-app-features.jsx';   // What: Page Label Object. Why: Each App Features card needs the display name of the page it lives on. How: This looks up feature.page to label an AppFeatureCard's own meta row.
import { PIC_NAM_OBJ  } from './pickers.js';                    // What: Pickers Namespace Object. Why: Picking, re-rolling, and reading a picker's own eligibility/average-ease all funnel through this shared namespace. How: This is called throughout generate()/handleReroll/EntryEditor for picIteFun/easEliFun/aveEasFun.
import { redMotFun    } from './ui.jsx';                        // What: Reduce Motion Function. Why: Nearly every animated sequence in this file (celebration, reel cascade, card flip, scroll) needs to skip or shorten itself for a user who prefers reduced motion. How: This is checked throughout as a plain function call.
import { RemSecCom    } from './reminders.jsx';                 // What: Reminder Section Component. Why: The Reminders block is one whole section rendered alongside the picker groups. How: This is rendered once per the '__reminders' sentinel in genBlockOrder.
import { RemTouCom    } from './onboarding-reminder-tours.jsx'; // What: Reminder Tour Component. Why: A reminder mini-tour never leaves Today, so it is rendered directly here rather than lifted to app.jsx. How: This is rendered while actMinTouObj holds a 'reminder' kind entry.
import { REORDER      } from './reorder.js';                    // What: Reorder Namespace Object. Why: Edit Mode's group and item drag-to-reorder both need the shared pointer-drag mechanism. How: This is called via REORDER.startDrag inside startGroupDrag/startItemDrag.
import { TASKS        } from './tasks.js';                      // What: Tasks Namespace Object. Why: Reminders due today, their anchor date, and their ring/rail eligibility are all computed through this shared namespace. How: This is called throughout for anchorDate/visibleToday/isDoneToday/optsFor/isCompletedOnce.
import { TOD_HEL_ARR  } from './help-content.jsx';              // What: Today Help Array. Why: Help mode needs this tab's own catalog of coach-mark targets. How: This is passed straight to HelOveCom.
import { useEmlTouFun } from './eml-tour-bus.js';                // What: Use Ease My Life Tour. Why: The rendered tip/reserved-space fields the tour bus publishes need to be read reactively, not just written to. How: This is called to subscribe to the same bus emlTouObj writes onto.
import { useEscCanFun } from './ui.jsx';                        // What: Use Escape Cancel Function. Why: EntryEditor's own Escape key needs to cancel the edit (or back out of a delete confirm) exactly like every other inline editor in the app. How: This is called once inside EntryEditor with a handler that checks confirmDel first.

// #endregion Imports



/**
 * tab-today.jsx = Tab Today
 *
 * @summary
 * The Today tab, the app's largest file: the auto-generated daily list itself
 * (grouped, reorderable via Edit Mode's own drag system), each entry's own
 * pick/skip/reroll/edit lifecycle (EntCarCom, the big one), the loading/reveal
 * states while a new list is being generated (LoaReeCom/LoaCarCom), and the
 * checklist launcher cards for every onboarding tour kind, including this
 * file's own PagTouCom/AppFeaCom, which are Today-specific launcher CARDS, not
 * the same components as onboarding-page-tours.jsx's real PagTouCom overlay or
 * onboarding-app-features.jsx's real FeaTouCom overlay, despite sharing a
 * name.
 *
 * GroHeaCom is a group's own header (progress bar, Edit Mode grip/rename);
 * merOrdFun/groEntFun build the day's own group/entry structure. TabToday ties
 * every section together as the tab, and EntryEditor (this file's own
 * item-editing row) is exported for reuse by tab-picker.jsx and tab-data.jsx,
 * so all 3 tabs edit an item through the exact same component.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region merOrdFun

/**
 * merOrdFun = Merge Order Function
 *
 * @summary
 * Merges a reordered subset of *present* keys back into a fuller
 * ordering that may also contain absent keys (groups/pickers with no
 * entries today). Present keys are dropped into their existing slots in
 * the new relative order; absent keys keep their positions; brand-new
 * present keys append at the end.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param fulOrdArr - Full Ordinal Array: The fuller, previously-saved
 *                    ordering, which may hold keys that are absent from
 *                    preNewArr entirely.
 * @param preNewArr - Previous New Array: The subset of keys that are present
 *                    today, already in their new, just-dragged relative order.
 *
 * @returns A single merged ordering array combining both inputs, per the
 * rule described above.
 *
 * @example
 * ```ts
 * merOrdFun(fulOrdArr, preNewArr) // => merged ordering array
 * ```
 *
*/

function merOrdFun ( fulOrdArr, preNewArr ) {


	// #region Dedupe Present Keys

	const preArr    = [];        // What: Present Array. Why: A synthetic day-off/charging id could otherwise be reintroduced twice by preNewArr; this collects each one only once. How: This is pushed to by the loop below, in first-seen order, which becomes the new order.
	const seeKeySet = new Set(); // What: Seen Key Set. Why: The loop below needs a fast way to tell whether a key was already collected. How: This is checked and added to by that same loop.

	for ( const curKeyStr of ( preNewArr || [] ) ) { // What: Present Key Dedupe Loop. Why: preNewArr may repeat a key; only its first occurrence should count. How: This walks every candidate key, skipping any already seen.


		if ( seeKeySet.has( curKeyStr ) ) continue; // What: Already Seen Guard. Why: A repeated key must not be collected a second time. How: This skips straight to the next candidate once curKeyStr is already in seeKeySet.


		seeKeySet.add( curKeyStr ); // What: Seen Key Record. Why: Every later occurrence of this same key must now read as a repeat. How: This adds curKeyStr to seeKeySet.
		preArr.push( curKeyStr );   // What: Present Key Collect. Why: This key's own first-seen position is exactly where it belongs in the new order. How: This appends curKeyStr to preArr.


	}

	// #endregion Dedupe Present Keys



	const preKeySet = new Set( preArr ); // What: Present Key Set. Why: The splice loop below needs a fast membership check against every present key. How: This wraps preArr in a Set.
	const resArr    = preArr.slice();    // What: Result Array. Why: The final merged order starts as a copy of the present keys' own new order; absent keys are spliced back into this same array below. How: This copies preArr so the splices below never mutate preArr itself.


	// #region Splice Back Absent Keys

	const fulDefArr = fulOrdArr || []; // What: Full Default Array. Why: The caller may pass a nullish saved order. How: This falls back to an empty array so the loop below always has something safe to iterate.
	const offAncMap = new Map();       // What: Offset Anchor Map. Why: Several sibling absent keys can share the same preceding anchor, and each one must land right after the one before it, not all at the same spot. How: This tracks, per anchor, how many absent keys have already been spliced in after it.

	for ( let curIndNum = 0; curIndNum < fulDefArr.length; curIndNum++ ) { // What: Full Order Walk Loop. Why: Every key in the previously-saved order needs a chance to be restored if it is not already present. How: This walks fulDefArr by index so bacIndNum below can look backward from the same position.


		const baseKeyStr = fulDefArr[ curIndNum ]; // What: Base Key String. Why: This is the specific saved-order key this iteration considers restoring. How: This reads fulDefArr at curIndNum.

		if ( preKeySet.has( baseKeyStr ) || resArr.includes( baseKeyStr ) ) continue; // What: Already Placed Guard. Why: A present key was already collected above, and an absent key already spliced back in by an earlier iteration must not be duplicated. How: This skips baseKeyStr once it is already accounted for either way.


		let ancKeyStr = null; // What: Anchor Key String. Why: An absent key is restored relative to the nearest PRESENT key before it in the saved order, not an absolute index. How: This starts null (meaning "insert at the very front") and is set by the backward walk just below.

		for ( let bacIndNum = curIndNum - 1; bacIndNum >= 0; bacIndNum-- ) { // What: Anchor Search Loop. Why: The nearest preceding present key is found by walking backward from this position. How: This walks bacIndNum down from curIndNum - 1 until a present key is found or the start is reached.


			if ( !preKeySet.has( fulDefArr[ bacIndNum ] ) ) continue; // What: Non-Present Skip Guard. Why: Only a PRESENT key can serve as an anchor. How: This keeps walking backward past any key that isn't in preKeySet.


			ancKeyStr = fulDefArr[ bacIndNum ]; // What: Anchor Key Assignment. Why: The nearest present predecessor has just been found. How: This records it into ancKeyStr.
			break;                              // What: Anchor Search Break. Why: Only the NEAREST anchor matters, so the walk stops as soon as one is found. How: This exits the backward loop immediately.


		}

		const curOffNum = offAncMap.get( ancKeyStr ) || 0; // What: Current Offset Number. Why: A second sibling sharing the same anchor must land one slot further along than the first, not on top of it. How: This reads however many keys have already been spliced in after ancKeyStr so far, defaulting to 0.

		if ( ancKeyStr === null ) resArr.splice( curOffNum, 0, baseKeyStr ); // What: Front Insert Branch. Why: No present key precedes this one at all, so it belongs at the very front (plus whatever offset its own siblings already claimed there). How: This splices baseKeyStr into resArr at index curOffNum.

		else resArr.splice( resArr.indexOf( ancKeyStr ) + 1 + curOffNum, 0, baseKeyStr ); // What: Anchored Insert Branch. Why: This key belongs right after its nearest present anchor, offset past any sibling already placed there. How: This splices baseKeyStr into resArr right after ancKeyStr's own current position plus curOffNum.

		offAncMap.set( ancKeyStr, curOffNum + 1 ); // What: Offset Advance. Why: The NEXT sibling sharing this same anchor must land one slot further along still. How: This overwrites offAncMap's own entry for ancKeyStr with curOffNum plus 1.


	}

	// #endregion Splice Back Absent Keys



	return resArr; // What: Merged Order Return. Why: The caller needs the final combined ordering. How: This returns the same array built by the dedupe and splice steps above.


}

// #endregion merOrdFun



// #region groEntFun

/**
 * groEntFun = Group Entries Function
 *
 * @summary
 * Buckets today's entries (real picks, day-off cards, charging cards,
 * and mini-tour launcher cards) by their own picker's group, in the
 * user's own saved group/picker order, falling back to encounter order
 * for anything not yet positioned. See this file's own header comment
 * for the overall Today tab layout this feeds.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param staAppObj - State App Object: The shared app state, read for
 *                    today.entries, pickers, groupOrder, pickerOrder, and
 *                    onboarding.
 *
 * @returns An array of { name, entries } group objects, in display
 * order, each already internally sorted.
 *
 * @example
 * ```ts
 * groEntFun(staAppObj) // => array of { name, entries } groups
 * ```
 *
*/

function groEntFun ( staAppObj ) {


	// #region Bucket Picker/Day-Off Entries

	const byGroMap = new Map(); // What: By Group Map. Why: Every entry below needs to land in its own group's bucket, created the first time that group is seen. How: This is read and populated by both loops in this region, keyed by group name.

	for ( const curEntObj of staAppObj.today.entries ) { // What: Today Entry Bucket Loop. Why: Every real entry (pick, day-off, charging) needs to land in its own picker's group. How: This walks state.today.entries, resolving each one's own picker and group before pushing it into byGroMap.


		if ( curEntObj.kind === 'dayoff' ) { // What: Day-Off Branch. Why: A day-off card has no real picker of its own, so it needs a synthetic picker-like row to slot into its group like any other entry. How: This builds that synthetic row and pushes it, then skips the normal picker lookup below entirely.


			const groNamStr = curEntObj.group || 'Other'; // What: Group Name String. Why: A day-off card still needs a real group to bucket into. How: This reads curEntObj's own group, falling back to 'Other'.

			if ( !byGroMap.has( groNamStr ) ) byGroMap.set( groNamStr, { name : groNamStr, entries : [] } ); // What: Group Bucket Init Guard. Why: The very first entry seen for a group must create its own bucket. How: This sets a fresh { name, entries } bucket only when groNamStr has none yet.

			byGroMap.get( groNamStr ).entries.push( { entry : curEntObj, picker : { id : 'dayoff_' + curEntObj.conditionalId, name : curEntObj.cardText, group : groNamStr, _dayoff : true } } ); // What: Day-Off Row Push. Why: This is the synthetic row EntCarCom's own day-off branch renders. How: This pairs curEntObj with a picker-shaped stand-in carrying just enough fields (id/name/group/_dayoff) to sort and render like a real one.



			continue; // What: Day-Off Continue. Why: A day-off card has no real picker to look up below. How: This skips straight to the next entry.


		}

		const picRecObj = staAppObj.pickers.find( ( curPicObj ) => curPicObj.id === curEntObj.pickerId ); // What: Picker Record Object. Why: Every non-day-off entry needs its own picker resolved to know its group and to render its name. How: This finds the picker matching curEntObj's own pickerId.

		if ( !picRecObj || picRecObj.hidden ) continue; // What: Missing Or Hidden Picker Guard. Why: An entry whose picker was deleted, or is still hidden mid-onboarding, must not render at all. How: This skips curEntObj when picRecObj is missing or flagged hidden.


		const groNamStr = picRecObj.group || 'Other'; // What: Group Name String. Why: This entry needs a real group to bucket into. How: This reads picRecObj's own group, falling back to 'Other'.

		if ( !byGroMap.has( groNamStr ) ) byGroMap.set( groNamStr, { name : groNamStr, entries : [] } ); // What: Group Bucket Init Guard. Why: The very first entry seen for a group must create its own bucket. How: This sets a fresh { name, entries } bucket only when groNamStr has none yet.

		byGroMap.get( groNamStr ).entries.push( { entry : curEntObj, picker : picRecObj } ); // What: Entry Row Push. Why: This is the real row EntCarCom renders. How: This pairs curEntObj with its own resolved picRecObj.


	}

	// #endregion Bucket Picker/Day-Off Entries



	/**
	 * Mini-Tour Launcher Cards = Mini-Tour Launcher Card Injection
	 *
	 * @summary
	 * One launcher card per sample picker, slotted into its normal group
	 * like any other card. `p.hidden` gates the timing: samples stay
	 * visible/real for the main Welcome Tour and only flip hidden once, at
	 * that tour's last step (see onboarding-welcome-tour.jsx), which is
	 * when these start rendering. They stay on screen, checked or not,
	 * through the ORIGINAL first-time checklist, until checklistDone (set
	 * once the closing Generate card runs, see onboarding-checklist.js).
	 * Unlike checklistDone itself, this does NOT permanently stop once
	 * that happens: Settings' Replay Tour button (tab-settings.jsx) resets
	 * each item's own checklist entry (though never checklistDone), so a
	 * still-unresolved sample keeps offering its card afterward too,
	 * EXCLUDED if a real (non-sample) picker has since taken its exact
	 * name, since re-prompting "set up a Daily Chores picker" when the
	 * user already has their own real Daily Chores picker would be
	 * redundant, not helpful.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const cheDonBoo = !!( staAppObj.onboarding && staAppObj.onboarding.checklistDone ); // What: Checklist Done Boolean. Why: The collision exclusion described above only ever applies post-checklistDone. How: This reads staAppObj's own onboarding.checklistDone.

	for ( const curPicObj of staAppObj.pickers ) { // What: Sample Picker Card Loop. Why: One launcher card is needed per still-hidden, still-relevant sample picker. How: This walks every picker, skipping anything that isn't a currently-hidden sample.


		if ( !curPicObj.hidden || !ONB_SPI_ARR.includes( curPicObj.id ) ) continue; // What: Non-Sample Guard. Why: Only a hidden SAMPLE picker gets a launcher card at all. How: This skips any picker that is not hidden, or not one of the fixed sample ids.


		const isaDonBoo = !!ONB_CHE_OBJ.entLooFun( staAppObj, curPicObj.id ); // What: Is-A Done Boolean. Why: A card's own resolved/unresolved state decides both its own display and whether it should vanish post-checklistDone. How: This checks ONB_CHE_OBJ for an existing entry against this picker's own id.

		if ( cheDonBoo && isaDonBoo ) continue; // What: Replay Resolved Guard. Why: Post-checklistDone, a resolved card vanishes for good the moment it resolves instead of sticking around with an Undo toggle, since there is no closing Generate card left to synchronize a batch disappearance against. How: This drops curPicObj's own card once it is both post-checklistDone and already resolved.


		if ( cheDonBoo ) { // What: Replay Collision Branch. Why: Only matters post-checklistDone; during the ORIGINAL first-time checklist this must stay a no-op, since finishing this exact tutorial deliberately creates a real picker sharing the sample's own name (addPicker's own dedup skips hidden pickers for this reason, see store.jsx), and running this check then would immediately "collide" with its own result. How: This checks for a same-named real picker and drops the card if one already exists.


			const colBoo = staAppObj.pickers.some( ( othPicObj ) => !ONB_SPI_ARR.includes( othPicObj.id ) && othPicObj.name === curPicObj.name ); // What: Collision Boolean. Why: A real picker sharing this sample's exact name means re-prompting it would be redundant. How: This checks every non-sample picker's own name against curPicObj's own name.

			if ( colBoo ) continue; // What: Collision Skip. Why: A colliding real picker means this sample's own card should stop offering itself. How: This drops curPicObj's own card once colBoo is true.


		}

		const groNamStr = curPicObj.group || 'Other'; // What: Group Name String. Why: A launcher card still needs a real group to bucket into, same as any other row. How: This reads curPicObj's own group, falling back to 'Other'.

		if ( !byGroMap.has( groNamStr ) ) byGroMap.set( groNamStr, { name : groNamStr, entries : [] } ); // What: Group Bucket Init Guard. Why: The very first entry seen for a group must create its own bucket. How: This sets a fresh { name, entries } bucket only when groNamStr has none yet.

		byGroMap.get( groNamStr ).entries.push( { entry : { kind : 'tutorial', eid : 'tut_' + curPicObj.id, done : isaDonBoo }, picker : curPicObj } ); // What: Tutorial Row Push. Why: This is the synthetic row EntCarCom's own tutorial branch renders. How: This pairs a synthetic { kind, eid, done } entry with the real curPicObj.


	}



	// #region Compute Group Display Order

	const ordArr = []; // What: Order Array. Why: This collects the final group display order, built up by the three passes below. How: This is pushed to by each pass in turn, then filtered/mapped at the very end of this function.
	const savOrdArr = Array.isArray( staAppObj.groupOrder ) ? staAppObj.groupOrder : []; // What: Saved Order Array. Why: The user's own Edit Mode drags are the first, highest-priority source of group order. How: This reads state.groupOrder when it is a real array, otherwise an empty one.

	for ( const curGroStr of savOrdArr ) if ( byGroMap.has( curGroStr ) && !ordArr.includes( curGroStr ) ) ordArr.push( curGroStr ); // What: Saved Order Pass. Why: A group the user has already positioned keeps that position. How: This appends each saved group name that actually has a bucket and isn't already collected.

	for ( const curPicObj of staAppObj.pickers ) { // What: First-Occurrence Order Pass. Why: A group not yet in the saved order still needs a stable position, taken from wherever it first appears among the user's own pickers. How: This appends any not-yet-collected group the first time a picker names it.


		if ( curPicObj.group && byGroMap.has( curPicObj.group ) && !ordArr.includes( curPicObj.group ) ) ordArr.push( curPicObj.group ); // What: First-Occurrence Append. Why: This is the actual append this pass performs. How: This pushes curPicObj's own group once, the first time it is encountered.


	}

	if ( byGroMap.has( 'Other' ) && !ordArr.includes( 'Other' ) ) ordArr.push( 'Other' ); // What: Other Group Trailing Guard. Why: The catch-all "Other" group always sorts last when nothing else already positioned it. How: This appends 'Other' only when it has a bucket and isn't already in ordArr.

	// #endregion Compute Group Display Order



	// #region Sort Rows Within Each Group

	const savPicOrdObj = ( staAppObj.pickerOrder && typeof staAppObj.pickerOrder === 'object' ) ? staAppObj.pickerOrder : {}; // What: Saved Picker Order Object. Why: Within each group, rows follow the user's own saved per-group picker order. How: This reads state.pickerOrder when it is a real object, otherwise an empty one.

	return ordArr.filter( ( curGroStr ) => byGroMap.has( curGroStr ) ).map( ( curGroStr ) => { // What: Group Sort Map. Why: Every group in display order needs its own rows sorted before rendering. How: This maps each group name to its own bucket, sorted below.


		const groRecObj = byGroMap.get( curGroStr );      // What: Group Record Object. Why: This is the specific bucket being sorted in this iteration. How: This reads curGroStr's own bucket out of byGroMap.
		const posIndObj = {};                             // What: Position Index Object. Why: A row's own explicit saved position (if any) always wins, so it needs a fast lookup by picker id. How: This is populated just below from savPicOrdObj's own entry for this group.

		( savPicOrdObj[ curGroStr ] || [] ).forEach( ( curPicIdeStr, curIndNum ) => { posIndObj[ curPicIdeStr ] = curIndNum; } ); // What: Position Index Build. Why: Every saved picker id needs its own saved index recorded before the sort below can use it. How: This walks the saved per-group order, recording each picker id's own index.

		groRecObj.entries.forEach( ( curRowObj, curIndNum ) => { curRowObj._i = curIndNum; } ); // What: Stable Tiebreaker Stamp. Why: The sort below needs a stable tiebreaker for rows with no explicit position of their own. How: This stamps each row with its own current index before sorting.


		const posOfFun = ( curRowObj ) => { // What: Position Of Function. Why: Sorting needs one numeric position per row: an explicit saved order always wins, so day-off/charging/tutorial cards can still be dragged anywhere; only a row with no stored position falls back to a default. How: This looks up curRowObj's own picker id in posIndObj first, otherwise defaults day-off/charging/tutorial rows to the top and regular picks to the end.


			if ( curRowObj.picker.id in posIndObj ) return posIndObj[ curRowObj.picker.id ]; // What: Explicit Position Branch. Why: A row the user has already positioned must sort exactly there. How: This returns its own saved index.


			return ( curRowObj.entry.kind === 'dayoff' || curRowObj.entry.kind === 'charging' || curRowObj.entry.kind === 'tutorial' ) ? -1 : 1e6; // What: Default Position Branch. Why: An unpositioned special card defaults near the top; an unpositioned regular pick defaults to the end. How: This returns -1 for the three special kinds, otherwise a very large fallback number.


		};

		groRecObj.entries.sort( ( aRowObj, bRowObj ) => ( posOfFun( aRowObj ) - posOfFun( bRowObj ) ) || ( aRowObj._i - bRowObj._i ) ); // What: Row Sort Call. Why: This actually orders the group's own rows before rendering. How: This sorts by posOfFun's own numeric position, falling back to each row's own stable _i on a tie.


		return groRecObj; // What: Sorted Group Return. Why: The map above needs the now-sorted bucket back. How: This returns the same groRecObj object, mutated in place by the sort above.


	} );

	// #endregion Sort Rows Within Each Group


}

// #endregion groEntFun



// #region GroHeaCom

/**
 * GroHeaCom = Group Header Component
 *
 * @summary
 * Renders one group's own sticky header: its name (plain text, or an
 * inline-editable field/button while Edit Mode is on), its done/total
 * count, the dash-bar progress row, and (outside Edit Mode) its own Day
 * Log toggle chip. Also renders the group-merge confirm prompt and any
 * name-collision error banner beneath the header itself.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.groNamStr   - Group Name String: The group's own current
 *                            display name.
 * @param props.donCouNum   - Done Count Number: How many of this group's own
 *                            rows are done.
 * @param props.totCouNum   - Total Count Number: How many rows this group has
 *                            in total.
 * @param props.ediModBoo   - Edit Mode Boolean: Whether Edit Mode is currently
 *                            on.
 * @param props.onGriDowFun - On Grid Down Function: Starts a group-reorder
 *                            drag from this header's own grip handle.
 * @param props.onRenGroFun - On Rename Group Function: Commits a typed rename
 *                            of this group.
 * @param props.merPenObj   - Merge Pending Object: A pending rename that would
 *                            merge into an existing group, or null.
 * @param props.onConMerFun - On Confirm Merge Function: Confirms the pending
 *                            merge in merPenObj.
 * @param props.onCanMerFun - On Cancel Merge Function: Cancels the pending
 *                            merge in merPenObj.
 * @param props.logOpeBoo   - Log Open Boolean: Whether this group's own Day
 *                            Log panel is open.
 * @param props.onTogLogFun - On Toggle Log Function: Toggles this group's own
 *                            Day Log panel.
 * @param props.valNamFun   - Value Name Function: Validates a typed rename,
 *                            returning an error string on collision or null
 *                            when it is fine.
 *
 * @returns This group's own header element, plus any merge-confirm or
 * name-error banner beneath it.
 *
 * @example
 * ```tsx
 * GroHeaCom({ groNamStr, donCouNum, totCouNum, ediModBoo, ... }) // => <GroHeaCom />
 * ```
 *
*/

function GroHeaCom ( { name : groNamStr, doneCount : donCouNum, total : totCouNum, editMode : ediModBoo, onGripDown : onGriDowFun, onRenameGroup : onRenGroFun, mergePending : merPenObj, onConfirmMerge : onConMerFun, onCancelMerge : onCanMerFun, logOpen : logOpeBoo, onToggleLog : onTogLogFun, validate : valNamFun } ) {


	// #region Cascade Dash Animation

	const preDonRef              = React.useRef( donCouNum );      // What: Previous Done Reference. Why: The effect below needs last render's own donCouNum to detect a genuine increase, not just react to any change. How: This starts at the initial donCouNum and is overwritten at the end of that same effect.
	const [ freIndNum, setFreIndNum ] = React.useState( -1 );      // What: Fresh Index Number And Setter. Why: The dash that JUST turned on needs a brief animated cue, keyed by its own index. How: This is set by the effect below and read by the dash-row map further down.

	React.useEffect( () => { // What: Cascade Dash Effect. Why: A group's own done count climbing needs to animate the specific dash that just turned on, not the whole row at once. How: This detects donCouNum rising past preDonRef's own last value, flags the newly-lit dash, then clears that flag shortly after.


		if ( donCouNum > preDonRef.current ) { // What: Done Increase Branch. Why: Only a genuine rise in donCouNum should trigger the cascade cue, never a drop (an uncheck) or a no-op re-render. How: This compares the fresh donCouNum against preDonRef's own remembered prior value.


			const curIndNum = donCouNum - 1; // What: Current Index Number. Why: The freshly-lit dash is always the one at this position. How: This is one less than the new donCouNum.

			setFreIndNum( curIndNum ); // What: Fresh Index Set. Why: The dash-row map below needs to know which single dash to flag as freshly lit. How: This publishes curIndNum into freIndNum.

			const freTmoNum = setTimeout( () => setFreIndNum( ( curValNum ) => ( curValNum === curIndNum ? -1 : curValNum ) ), 520 ); // What: Fresh Timeout Number. Why: The fresh cue must clear itself shortly after lighting, but only if a newer cascade hasn't already claimed freIndNum in the meantime. How: This clears freIndNum back to -1 after 520ms, guarded so a stale timeout can't stomp a fresher one.

			preDonRef.current = donCouNum; // What: Previous Done Update. Why: The next run of this effect must compare against the count that is current now. How: This overwrites preDonRef with the fresh donCouNum.

			return () => clearTimeout( freTmoNum ); // What: Effect Cleanup Return. Why: A stale fresh-cue timeout must not fire after a newer effect run has already begun. How: This cancels freTmoNum.


		}

		preDonRef.current = donCouNum; // What: Previous Done Update. Why: Even a non-increase (a drop, or a no-op re-render) still needs preDonRef to track the latest value for next time. How: This overwrites preDonRef with the current donCouNum.


	}, [ donCouNum ] ); // What: Effect Dependency Array. Why: This effect only ever needs to re-run when donCouNum itself changes. How: donCouNum is the exact value preDonRef is compared against.

	// #endregion Cascade Dash Animation



	// #region Inline Name Edit

	const [ ediOpeBoo, setEdiOpeBoo ] = React.useState( false );      // What: Editing Open Boolean And Setter. Why: Edit Mode only, this tracks whether the inline name field currently replaces the plain heading/rename button. How: This is toggled by strEdiFun and finCloFun below.
	const [ cloOutBoo, setCloOutBoo ] = React.useState( false );      // What: Closing Out Boolean And Setter. Why: Closing the inline field plays a brief out-animation before it actually unmounts. How: This is toggled true right before that animation, then false once it finishes.
	const [ draNamStr, setDraNamStr ] = React.useState( groNamStr );  // What: Draft Name String And Setter. Why: The inline field edits a local draft, never groNamStr directly, until it is explicitly committed. How: This starts at groNamStr and is freely typed into while ediOpeBoo is true.
	const [ namErrStr, setNamErrStr ] = React.useState( '' );         // What: Name Error String And Setter. Why: Only set when valNamFun rejects a commit (e.g. a Page Tours rename colliding with an existing group name), since it has nothing to merge into, unlike onRenGroFun, so it blocks instead of offering a merge. How: This keeps the field open, un-committed, until the user edits again or cancels.
	const namInpRef                   = React.useRef( null );        // What: Name Input Reference. Why: Opening the field needs to both focus and select its own text. How: This is attached to the input's own ref prop below.


	React.useEffect( () => { // What: Explicit Focus Effect. Why: autoFocus's own default scroll-into-view would fight a guided-tour spotlight already mid-positioning this same input, since the tour's own scroll-to-target math runs a tick later and sees this as a moving target. How: This focuses namInpRef with preventScroll instead of relying on autoFocus, then selects its text.


		if ( !ediOpeBoo || !namInpRef.current ) return; // What: Not Editing Guard. Why: There is nothing to focus while the field isn't even open. How: This bails out early unless both ediOpeBoo is true and namInpRef is attached.


		namInpRef.current.focus( { preventScroll : true } ); // What: Explicit Focus Call. Why: preventScroll avoids fighting a tour's own scroll positioning, unlike the input's own autoFocus attribute would. How: This focuses namInpRef's own current node without letting the browser auto-scroll to it.
		namInpRef.current.select();                          // What: Text Select Call. Why: Opening the field should offer the whole current name ready to overtype, not just a caret. How: This selects namInpRef's own current text content.


	}, [ ediOpeBoo ] ); // What: Effect Dependency Array. Why: This effect only ever needs to re-run when ediOpeBoo itself changes. How: ediOpeBoo is the exact transition this effect reacts to.

	React.useEffect( () => { if ( !ediModBoo ) setEdiOpeBoo( false ); }, [ ediModBoo ] ); // What: Edit Mode Exit Effect. Why: Leaving Edit Mode entirely must cancel any in-progress name edit. How: This forces ediOpeBoo back to false whenever ediModBoo itself goes false.


	const strEdiFun = () => { setDraNamStr( groNamStr ); setNamErrStr( '' ); setEdiOpeBoo( true ); }; // What: Start Edit Function. Why: Opening the field should always begin from the real current name, with any stale error cleared. How: This resets draNamStr and namErrStr, then opens ediOpeBoo.

	/**
	 * finCloFun = Finish Close Function
	 *
	 * @summary
	 * Plays the out animation (is-closing) for ~150ms, then unmounts the
	 * field and, for a real change, commits the rename. Guarded so the
	 * blur that Enter triggers can't double-fire alongside an explicit
	 * commit/cancel already in flight.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/
	const finCloFun = ( chaValBoo, newValStr ) => { // What: Finish Close Function. Why: See the doc comment just above. How: This stages cloOutBoo, then after 150ms closes ediOpeBoo and either commits newValStr or reverts draNamStr.


		setCloOutBoo( true ); // What: Closing Flag Set. Why: The field's own out-animation needs to start immediately. How: This flips cloOutBoo to true.

		setTimeout( () => { // What: Close Settle Timeout. Why: The field must stay mounted through its own out-animation before this actually closes it. How: This runs 150ms later, matching that animation's own duration.


			setEdiOpeBoo( false ); // What: Editing Close. Why: The field itself is done animating out and can now unmount. How: This flips ediOpeBoo back to false.
			setCloOutBoo( false ); // What: Closing Flag Clear. Why: The out-animation flag must not persist once the field is already gone. How: This flips cloOutBoo back to false.

			if ( chaValBoo ) onRenGroFun( newValStr ); // What: Commit Branch. Why: A real, confirmed change needs to actually rename the group. How: This calls onRenGroFun with newValStr.

			else setDraNamStr( groNamStr ); // What: Revert Branch. Why: A cancel, or a no-op commit, should leave the draft matching the real name again for next time. How: This resets draNamStr back to groNamStr.


		}, 150 );


	};

	const comEdiFun = () => { // What: Commit Edit Function. Why: Both blur (Enter blurs the input) and an explicit commit path need this exact same validation-then-close sequence. How: This trims the draft, checks whether it actually changed, validates it, and either stages an error or finishes closing.


		if ( cloOutBoo ) return; // What: Already Closing Guard. Why: A commit already in flight must not be re-triggered by a second event (e.g. Enter's own blur firing after the click that started this). How: This bails out while cloOutBoo is already true.


		const newValStr = draNamStr.trim();               // What: New Value String. Why: A typed name needs its surrounding whitespace trimmed before it is compared or saved. How: This trims draNamStr.
		const chaValBoo = !!newValStr && newValStr !== groNamStr; // What: Changed Value Boolean. Why: An empty or unchanged draft should just close quietly rather than commit anything. How: This is true only when newValStr is non-empty and differs from groNamStr.

		if ( chaValBoo && valNamFun ) { // What: Validation Branch. Why: A real change needs to be checked against valNamFun before committing, since a collision should block rather than merge (Page Tours has nothing to merge into). How: This runs valNamFun against newValStr only when there is an actual change to validate.


			const errMesStr = valNamFun( newValStr ); // What: Error Message String. Why: This is the actual collision message, or null when newValStr is fine. How: This calls valNamFun with newValStr.

			if ( errMesStr ) { // What: Collision Branch. Why: A collision must keep the field open, un-committed, rather than close it. How: This stages namErrStr and reclaims focus instead of falling through to finCloFun below.


				setNamErrStr( errMesStr );       // What: Name Error Stage. Why: The banner beneath the header needs this exact message to display. How: This publishes errMesStr into namErrStr.
				namInpRef.current?.focus();      // What: Focus Reclaim. Why: commit() runs from onBlur too (Enter blurs the input), so focus may already be gone; reclaiming it lets the user just keep typing to fix the collision. How: This focuses namInpRef's own current node, if it still exists.
				return;                          // What: Validation Return. Why: A collision must not fall through to finCloFun below. How: This exits comEdiFun immediately.


			}


		}

		finCloFun( chaValBoo, newValStr ); // What: Finish Close Call. Why: Either an unvalidated no-op close or a validated real change needs to run the same close sequence. How: This calls finCloFun with the values computed above.


	};

	const canEdiFun = () => { if ( cloOutBoo ) return; setNamErrStr( '' ); finCloFun( false ); }; // What: Cancel Edit Function. Why: Escape should discard the draft and any staged error without committing anything. How: This clears namErrStr then calls finCloFun with chaValBoo false.

	// #endregion Inline Name Edit



	return (


		<React.Fragment>{ /* What: Group Header Fragment Element. Why: The header itself and its own merge/error banners are true siblings with no shared wrapper of their own. How: This groups the header, the merge-confirm banner, and the name-error banner without adding an extra DOM node. */ }


			<header className={ ` group-h   ${ ediModBoo ? 'is-reorderable' : '' } ` }>{ /* What: Group Header Header Element. Why: This is GroHeaCom's own root landmark, holding the name/count row and the progress dash row beneath it. How: This renders as a semantic <header>, tagged is-reorderable while Edit Mode is on. */ }


				<div className='group-h-l'>{ /* What: Header Left Div Element. Why: The name, count, and Day Log chip read as one left-aligned cluster. How: This wraps the grip (Edit Mode only), the name/rename control, the count, and the Day Log chip. */ }


					{ ediModBoo && ( // What: Grip Visibility Check. Why: The drag handle only makes sense while Edit Mode is on. How: This renders the grip span only while ediModBoo is true.


						<span
							className='group-grip'
							aria-label='Drag to reorder group'
							role='button'
							tabIndex={ 0 }
							draggable={ false }
							onDragStart={ ( dstEveObj ) => dstEveObj.preventDefault() }
							onPointerDown={ ( ptdEveObj ) => onGriDowFun( ptdEveObj ) }
						>{ /* What: Group Grip Span Element. Why: This is the actual pointer-drag handle for reordering this group. How: This forwards its own pointerdown to onGriDowFun and blocks the native HTML5 drag gesture entirely. */ }


							<IcoSvgCom
								name='grip'
								size={ 16 }
							/>{ /* What: Icon Svg Component. Why: The grip handle needs a recognizable drag-affordance glyph. How: This renders the 'grip' icon at a fixed size. */ }


						</span>


					) }
					{ ediModBoo && ediOpeBoo ? ( // What: Editing Field Branch. Why: While Edit Mode is on AND the field is open, the group's own name renders as an editable input instead of plain text or the rename button. How: This renders the inline input, wired to draNamStr/comEdiFun/canEdiFun.


						<input
							ref={ namInpRef }
							className={ ` group-name-input   group-name-slot   ${ cloOutBoo ? 'is-closing' : '' }   ${ namErrStr ? 'is-invalid' : '' } ` }
							type='text'
							value={ draNamStr }
							maxLength={ 30 }
							aria-label='Group name'
							onChange={ ( chaEveObj ) => { setDraNamStr( chaEveObj.target.value ); if ( namErrStr ) setNamErrStr( '' ); } }
							onBlur={ comEdiFun }
							onKeyDown={ ( keyEveObj ) => { // What: Key Down Handler. Why: Enter should commit (via a blur) and Escape should cancel, mirroring every other inline editor in the app. How: This blurs the input on Enter and calls canEdiFun on Escape.


								if ( keyEveObj.key === 'Enter' ) keyEveObj.currentTarget.blur();

								else if ( keyEveObj.key === 'Escape' ) { keyEveObj.preventDefault(); canEdiFun(); }


							} }
						/> // What: Group Name Input Element. Why: This is the actual editable field for renaming this group. How: This is a plain, maxLength-capped text input, committed on blur/Enter and cancelled on Escape.


					) : ediModBoo ? ( // What: Rename Button Branch. Why: While Edit Mode is on but the field is closed, the name itself acts as a button that opens it. How: This renders a button showing groNamStr plus an edit glyph, wired to strEdiFun.


						<button
							type='button'
							className='group-name group-name--editable group-name-slot'
							aria-label={ `Rename group ${ groNamStr }` }
							onClick={ strEdiFun }
						>{ /* What: Group Rename Button Element. Why: This is the actual affordance that opens the inline name field above. How: This renders groNamStr plus a small edit glyph, calling strEdiFun on click. */ }


							{ groNamStr }
							<IcoSvgCom
								name='edit'
								size={ 13 }
							/>{ /* What: Icon Svg Component. Why: The rename button needs a recognizable edit-affordance glyph next to the name. How: This renders the 'edit' icon at a fixed size. */ }


						</button>


					) : ( // What: Plain Heading Branch. Why: Outside Edit Mode the group's own name is just a plain, non-interactive heading. How: This renders a bare <h2> showing groNamStr.


						<h2 className='group-name'>{ groNamStr }</h2> // What: Group Name Heading Element. Why: This is the group's own plain, non-editable display name. How: This renders groNamStr directly.


					) }
					<span className='group-count'>{ /* What: Group Count Span Element. Why: The done/total pair reads as one small cluster next to the name. How: This wraps the done and "of total" spans below. */ }


						<span className='group-done'>{ donCouNum }</span>{ /* What: Group Done Span Element. Why: This is the group's own current done count. How: This renders donCouNum directly. */ }

						<span className='group-of'>of { totCouNum }</span>{ /* What: Group Of Span Element. Why: The done count alone is meaningless without the total it is out of. How: This renders the literal word "of" plus totCouNum. */ }


					</span>
					{ !ediModBoo && onTogLogFun && ( // What: Day Log Chip Check. Why: The chip only makes sense outside Edit Mode and only when a caller actually wired up onTogLogFun. How: This renders DayLogChip only while both conditions hold.

						<DayLogChip
							open={ logOpeBoo }
							onClick={ onTogLogFun }
						/> // What: Day Log Chip. Why: Outside Edit Mode, this group's own Day Log panel needs a visible toggle. How: This is passed logOpeBoo and onTogLogFun directly.

					) }


				</div>


				<div className='group-progress'>{ /* What: Group Progress Div Element. Why: The dash-bar row is its own visual band beneath the name/count row. How: This maps one dash per row in the group, flagging the done ones and whichever one just turned fresh. */ }


					{ Array( totCouNum ).fill( 0 ).map( ( _, curIndNum ) => ( // What: Dash Row Map. Why: One dash is needed per row in this group, regardless of what data backs it. How: This maps a totCouNum-length filler array to one <i> per index.


						<i
							key={ curIndNum }
							className={ ` ${ curIndNum < donCouNum ? 'is-done' : '' }   ${ curIndNum === freIndNum ? 'is-fresh' : '' } ` }
						/> // What: Progress Dash Element. Why: This is one single dash in the group's own progress bar. How: This flags itself is-done once its own index falls under donCouNum, and is-fresh for exactly one tick when it is the dash freIndNum names.

					) ) }


				</div>


			</header>


			{ merPenObj && ( // What: Merge Confirm Visibility Check. Why: The merge-confirm banner only exists while a same-name rename is actually pending. How: This renders the banner only while merPenObj holds a value.


				<div className='group-merge-confirm'>{ /* What: Merge Confirm Div Element. Why: This is the confirm-before-merging prompt's own root. How: This renders the explanatory message plus its own Cancel/Merge actions. */ }


					<span className='confirm-msg'>{ /* What: Confirm Message Span Element. Why: The user needs to understand exactly what merging will do before confirming it. How: This renders merPenObj's own to/from names inside the fixed explanatory copy. */ }

						A group named &ldquo;{ merPenObj.to }&rdquo; already exists. Merge
						&ldquo;{ merPenObj.from }&rdquo;&rsquo;s pickers into it? This can&rsquo;t be undone.

					</span>

					<div className='rem-del-actions'>{ /* What: Delete Actions Div Element. Why: The Cancel/Merge actions read as one paired cluster. How: This wraps both ButBasCom elements below. */ }


						<ButBasCom
							kind='ghost'
							size='sm'
							onClick={ onCanMerFun }
						>Cancel</ButBasCom>{ /* What: Button Base Component. Why: This backs out of the pending merge without changing anything. How: This calls onCanMerFun. */ }

						<ButBasCom
							kind='primary'
							size='sm'
							onClick={ onConMerFun }
						>Merge</ButBasCom>{ /* What: Button Base Component. Why: This is the actual, confirmed merge trigger. How: This calls onConMerFun. */ }


					</div>


				</div>


			) }
			{ ediOpeBoo && namErrStr && ( // What: Name Error Visibility Check. Why: The collision banner only exists while the field is open AND an error is actually staged. How: This renders the banner only while both conditions hold.


				<div className='group-merge-confirm group-name-conflict'>{ /* What: Name Conflict Div Element. Why: A rename collision needs the same visual treatment as the merge-confirm banner above. How: This renders namErrStr as the banner's own message. */ }


					<span className='confirm-msg'>{ namErrStr }</span>{ /* What: Confirm Message Span Element. Why: This is the actual collision message text. How: This renders namErrStr directly. */ }


				</div>


			) }


		</React.Fragment>


	);


}

// #endregion GroHeaCom



/**
 * Loader (Regeneration) = Loader Reel And Card Components
 *
 * @summary
 * Rapidly cycles item names in place while a picker's own daily slot is
 * being regenerated; the card transitions to 'settled' and unmounts the
 * reel from the outside, so the reel itself just keeps cycling until
 * that happens.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region LoaReeCom

/**
 * LoaReeCom = Loader Reel Component
 *
 * @summary
 * Cycles through canIteArr's own names at a fixed interval, advancing by
 * 1 or 2 each tick so the cycling reads as a genuine shuffle rather than
 * a plain round-robin.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.canIteArr - Cancel Item Array: The candidate pool this picker's
 *                          own slot is drawing from, cycled purely for visual
 *                          effect.
 *
 * @returns The currently-shown candidate's own name, in a span keyed by
 * its own index so each tick replays a fade.
 *
 * @example
 * ```tsx
 * LoaReeCom({ canIteArr }) // => <LoaReeCom />
 * ```
 *
*/

function LoaReeCom ( { candidates : canIteArr } ) {


	const [ curIndNum, setCurIndNum ] = React.useState( 0 ); // What: Current Index Number And Setter. Why: This tracks which candidate is currently shown. How: This starts at 0 and is advanced by the cycling effect below.

	React.useEffect( () => { // What: Cycle Effect. Why: The reel needs to keep advancing on its own for as long as it is mounted. How: This starts an interval advancing curIndNum by 1 or 2 (wrapping) every 90ms, and clears it on unmount.


		if ( !canIteArr || canIteArr.length < 2 ) return; // What: Too Few Candidates Guard. Why: Cycling makes no sense with fewer than 2 candidates to alternate between. How: This skips starting the interval at all when canIteArr is missing or too short.


		const cycTmrNum = setInterval( () => { // What: Cycle Timer Number. Why: This is the actual recurring advance. How: This holds the interval id so the cleanup below can clear it.


			setCurIndNum( ( preIndNum ) => ( preIndNum + 1 + Math.floor( Math.random() * 2 ) ) % canIteArr.length ); // What: Current Index Advance. Why: Advancing by a random 1 or 2 (rather than a flat 1) reads as a shuffle instead of a mechanical round-robin. How: This computes the next index modulo canIteArr's own length.


		}, 90 );


		return () => clearInterval( cycTmrNum ); // What: Effect Cleanup Return. Why: The interval must not keep firing after this reel unmounts. How: This clears cycTmrNum.

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] ); // What: Effect Dependency Array. Why: This effect only ever needs to start once, on mount; canIteArr itself is fixed for the reel's whole lifetime. How: An empty array means this never re-subscribes.


	return (


		<span
			className='loader-reel-name'
			key={ curIndNum }
		>{ /* What: Loader Reel Name Span Element. Why: The key on curIndNum forces a fresh mount every tick, replaying the fade-in. How: This renders the current candidate's own name, or a non-breaking space while none exists yet. */ }


			{ canIteArr[ curIndNum ]?.name || ' ' }


		</span>


	);


}

// #endregion LoaReeCom



// #region LoaCarCom

/**
 * LoaCarCom = Loader Card Component
 *
 * @summary
 * Renders one picker's own regeneration slot: a pending dots state, an
 * active cycling-reel (or dots, for a non-pick slot) state, and a
 * settled state showing the final picked/fixed name.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.picRecObj - Picker Record Object: The picker this loader slot
 *                          belongs to.
 * @param props.infRecObj - Info Record Object: The slot's own
 *                          generation-in-progress record: { status, kind,
 *                          candidates, pickedId, cardText }, built up in
 *                          TabToday's own generate().
 *
 * @returns This slot's own loader card, whose visible state follows
 * infRecObj.status.
 *
 * @example
 * ```tsx
 * LoaCarCom({ picRecObj, infRecObj }) // => <LoaCarCom />
 * ```
 *
*/

function LoaCarCom ( { picker : picRecObj, info : infRecObj } ) {


	const staStr = infRecObj?.status || 'pending'; // What: Status String. Why: Every branch below renders differently depending on this slot's own current phase. How: This reads infRecObj's own status, defaulting to 'pending' before the effect even sets one.
	const kndStr = infRecObj?.kind || 'pick';       // What: Kind String. Why: A non-pick slot (day-off/charging) has no candidate reel and a fixed settled name instead. How: This reads infRecObj's own kind, defaulting to 'pick'.

	const finNamStr = kndStr === 'dayoff' // What: Final Name String. Why: The settled state needs one final display name, computed differently per kind. How: This resolves a day-off's own cardText (or the picker's own name), a fixed charging message, or the actually-picked candidate's own name.
		? ( infRecObj.cardText || picRecObj.name )
		: kndStr === 'charging'
		? 'No eligible items for today'
		: ( infRecObj && infRecObj.candidates ? infRecObj.candidates.find( ( curCanObj ) => curCanObj.id === infRecObj.pickedId )?.name : '' );

	const hasReeBoo = kndStr === 'pick' && infRecObj && infRecObj.candidates && infRecObj.candidates.length; // What: Has Reel Boolean. Why: Only an actual pick slot with real candidates gets the cycling reel; day-off/charging slots just show dots while active. How: This is true only when every one of those conditions holds.


	return (


		<article className={ `today-card today-card--loader is-${ staStr }` }>{ /* What: Loader Card Article Element. Why: This is one picker's own regeneration slot, styled per its own current status. How: This renders a disabled-looking check spot, the body below, and an empty actions strip for layout parity with a real EntCarCom. */ }


			<span
				className='check'
				aria-hidden='true'
			/>{ /* What: Check Span Element. Why: A loader card still needs the same layout slot a real card's check button occupies. How: This renders an inert, unclickable placeholder. */ }


			<div className='today-card-body'>{ /* What: Loader Card Body Div Element. Why: The meta row and name row read as one grouped block, matching a real card's own layout. How: This wraps the meta row and the name row below. */ }


				<div className='today-card-meta'>{ /* What: Loader Card Meta Div Element. Why: The picker's own name needs a consistent meta-row slot, matching a real card's own layout. How: This wraps the picker-name span below. */ }


					<span className='meta-picker'>{ picRecObj.name }</span>{ /* What: Meta Picker Span Element. Why: The user needs to see which picker this slot belongs to while it is still generating. How: This renders picRecObj's own name. */ }


				</div>


				<div className='today-card-name'>{ /* What: Loader Card Name Div Element. Why: This is where the slot's own pending/active/settled visual actually renders. How: This renders exactly one of the three branches below, gated on staStr. */ }


					{ staStr === 'pending' && <span className='loader-pending'>·  ·  ·</span> }{ /* What: Pending Dots Span Element. Why: A slot not yet reached by the cascade shows plain waiting dots. How: This renders only while staStr is 'pending'. */ }
					{ staStr === 'active' && ( hasReeBoo // What: Active State Check. Why: An active PICK slot with real candidates gets the cycling reel; any other active slot (day-off/charging, or a pick with no candidates) just shows the same waiting dots. How: This renders LoaReeCom when hasReeBoo, otherwise the same dots span as the pending state.


						? <LoaReeCom candidates={ infRecObj.candidates } />
						: <span className='loader-pending'>·  ·  ·</span> ) }
					{ staStr === 'settled' && ( // What: Settled State Check. Why: Once this slot's own cascade step finishes, it shows the final resolved name instead of any dots/reel. How: This renders finNamStr only while staStr is 'settled'.


						<span className='loader-reel-name loader-settled'>{ finNamStr }</span> // What: Loader Reel Name Span Element. Why: This is the slot's own final, settled display name. How: This renders finNamStr directly.

					) }


				</div>


			</div>


			<div className='today-card-actions' />{ /* What: Loader Card Actions Div Element. Why: A loader card still needs the same layout slot a real card's actions strip occupies. How: This renders an empty placeholder, matching a real card's own layout. */ }


		</article>


	);


}

// #endregion LoaCarCom



// #region EntryEditor

const EntryEditor = React.forwardRef( function EntryEditor ( { item, picker, actions, onClose, onCancel, onDelete, isNew, itemCount, items }, forRefObj ) { // What: Entry Editor. Why: This is the shared inline editor for a picker item, reused by the Today/Pickers/Data tabs so every one of them edits an item identically: mirrors the Pickers-tab per-item controls (a weight stepper for weighted/dynamic, cadence range for ease-up/ease-down, an Active/Inactive toggle, and a confirm-gated delete). How: This snapshots item on mount so Cancel/an implicit close can revert it, stages every live edit directly onto the real item via actions.updateItem, and exposes a keep() imperative handle so an external close affordance can mark a save as already-handled.


	const [ conDelBoo, setConDelBoo ] = React.useState( false ); // What: Confirm Delete Boolean And Setter. Why: Delete is confirm-gated, morphing the footer into a Delete/Cancel prompt instead of firing immediately. How: This toggles between the plain footer and the confirm prompt below.
	const minIteBoo = itemCount != null && itemCount <= 2; // What: Minimum Item Boolean. Why: A picker needs at least 2 items for a pick to be a real choice, so this one must be refused if deleting it would drop below that; itemCount is the picker's CURRENT total including this item, and a caller that never wires it up (undefined) is treated as unrestricted rather than silently blocking. How: This is true only when itemCount is actually known and already at or under 2.


	const oriIteRef = React.useRef( item ); // What: Original Item Reference. Why: Cancel (or an implicit close) needs to restore the item exactly as it was when this editor opened. How: This snapshots item once, on mount, never updated afterward.
	const cloWayRef = React.useRef( null ); // What: Close Way Reference. Why: A caller with its OWN close affordance outside this component (e.g. the Data tab row's own collapse chevron) can call the exposed keep() first so that affordance reads as "done, keep this" rather than an implicit close; this distinguishes 'saved'/'cancel' (closed explicitly) from null (still open, so an implicit close such as a tab switch or reload should discard the unsaved live edits). How: This is written by every explicit action below and read by the pagehide/unmount effect further down.

	React.useImperativeHandle( forRefObj, () => ( { keep : () => { cloWayRef.current = 'saved'; } } ) ); // What: Imperative Handle Publish. Why: An external close affordance needs a way to mark this editor's own edits as already-handled before it closes. How: This exposes a single keep method that just flips cloWayRef to 'saved'.


	const revStaFun = () => { // What: Revert State Function. Why: Cancel and an implicit close both need to restore the item to its pre-edit snapshot. How: This calls onCancel with oriIteRef's own snapshot when the caller supplied one, otherwise writes the snapshot straight back via actions.replaceItem.


		if ( onCancel ) onCancel( oriIteRef.current );

		else actions.replaceItem( oriIteRef.current.id, oriIteRef.current );


	};

	const canEdiFun = () => { cloWayRef.current = 'cancel'; revStaFun(); if ( !onCancel ) onClose(); }; // What: Cancel Edit Function. Why: An explicit Cancel click needs to mark itself handled, actually revert the item, and (unless the caller owns its own close affordance via onCancel) close this editor. How: This flips cloWayRef, calls revStaFun, then conditionally calls onClose.

	useEscCanFun( true, () => { // What: Use Escape Cancel Function. Why: Escape should cancel the live edits, except while the delete confirm is up, where it should just back out of the confirm instead. How: This closes the confirm prompt when open, otherwise calls canEdiFun.


		if ( conDelBoo ) setConDelBoo( false ); // What: Close Confirm Branch. Why: While the delete confirm prompt is up, Escape should just back out of it instead of cancelling the whole edit. How: This closes the confirm by setting conDelBoo false.

		else canEdiFun(); // What: Cancel Edits Branch. Why: With no confirm prompt up, Escape should cancel the live edits like an explicit Cancel click. How: This calls canEdiFun.


	} );

	const savCloFun = () => { cloWayRef.current = 'saved'; onClose(); }; // What: Save Close Function. Why: An explicit Save click needs to mark itself handled and keep the live edits, which are already applied directly (see the header comment above). How: This flips cloWayRef, then calls onClose.


	/**
	 * resStoFun = Restore Storage Function
	 *
	 * @summary
	 * A same-tick localStorage warm mirror (see storage.js) can otherwise
	 * go stale for the exact instant between a live edit and the next
	 * debounced save, so an implicit close restores it directly: either
	 * dropping a brand-new item entirely, or writing the pre-edit
	 * snapshot back over whatever live edits already landed.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/
	const resStoFun = () => { // What: Restore Storage Function. Why: See the doc comment just above. How: This reads the warm-mirror key directly, patches its own items array, and writes it straight back, swallowing any error since a failed restore must never break the close itself.


		try {


			const rawJsnStr = localStorage.getItem( 'easemylife.v2' ); // What: Raw Json String. Why: The warm mirror's own persisted blob needs to be read before it can be patched. How: This reads the fixed 'easemylife.v2' storage key.

			if ( !rawJsnStr ) return; // What: No Mirror Guard. Why: A brand-new install (or a cleared mirror) has nothing to patch. How: This bails out early when rawJsnStr is empty.


			const rawStaObj = JSON.parse( rawJsnStr ); // What: Raw State Object. Why: The mirror's own items array needs to be reachable as real data before it can be patched. How: This parses rawJsnStr.

			if ( !Array.isArray( rawStaObj.items ) ) return; // What: No Items Array Guard. Why: A malformed or very old mirror shape has nothing safe to patch. How: This bails out unless rawStaObj.items is a real array.


			rawStaObj.items = onCancel // What: Items Patch. Why: A brand-new item (onCancel supplied) never belonged in the mirror at all, while an existing one just needs its pre-edit snapshot restored. How: This filters the new item out entirely, or maps the existing one back to oriIteRef's own snapshot.
				? rawStaObj.items.filter( ( curIteObj ) => curIteObj.id !== oriIteRef.current.id )
				: rawStaObj.items.map( ( curIteObj ) => curIteObj.id === oriIteRef.current.id ? oriIteRef.current : curIteObj );

			localStorage.setItem( 'easemylife.v2', JSON.stringify( rawStaObj ) ); // What: Mirror Write Back. Why: The patched snapshot needs to actually replace the stale mirror. How: This writes rawStaObj back under the same fixed key.


		}

		catch ( e ) { } // What: Restore Failure Swallow. Why: A failed restore (a full/blocked storage quota, a private window, ...) must never break the close itself. How: This intentionally does nothing.


	};

	React.useEffect( () => { // What: Discard Guard Effect. Why: An editor left open through a tab switch or reload should discard its own unsaved live edits, matching the "nothing changes until you actually save" expectation every other inline editor in the app follows. How: This disarms window.__editGuard on mount, restores the warm mirror directly on pagehide, and arms __editGuard to revert on an ordinary unmount, in both cases only when cloWayRef is still null (nothing explicit already handled the close).


		window.__editGuard.disarm(); // What: Edit Guard Disarm. Why: A stale armed guard from a PREVIOUS editor instance must not fire against this fresh one. How: This clears whatever revert thunk __editGuard was last armed with.

		const onHidFun = () => { if ( !cloWayRef.current ) resStoFun(); }; // What: On Hide Function. Why: A pagehide (the tab closing or backgrounding) needs its own direct storage restore, since a React unmount effect may not get to run in time. How: This calls resStoFun only when cloWayRef is still null.

		window.addEventListener( 'pagehide', onHidFun ); // What: Pagehide Subscribe Call. Why: The discard needs to happen the moment the page is actually hidden, not on some later tick. How: This registers onHidFun to run on that event.


		return () => { // What: Effect Cleanup Function. Why: An ordinary unmount (navigating within the app, e.g. switching tabs) needs its own revert path, distinct from the pagehide case above. How: This removes the pagehide listener and arms __editGuard with revStaFun when nothing explicit already handled the close.


			window.removeEventListener( 'pagehide', onHidFun ); // What: Pagehide Listener Teardown. Why: This matches the addEventListener above so the listener does not outlive this effect run. How: This removes the same onHidFun reference that was added above.

			if ( !cloWayRef.current ) window.__editGuard.arm( revStaFun ); // What: Edit Guard Arm. Why: The NEXT editor instance's own disarm (above) is what actually cancels this, so arming here is what makes an ordinary unmount revert at all. How: This arms __editGuard with revStaFun only when cloWayRef is still null.


		};


	}, [] ); // What: Effect Dependency Array. Why: This effect only ever needs to run once, on mount, since cloWayRef/oriIteRef/revStaFun are all stable for this editor instance's whole lifetime. How: An empty array means this never re-subscribes.


	// #region Mode-Derived Display Values

	const picModStr = picker ? picker.mode : 'random';                   // What: Picker Mode String. Why: Nearly every row below renders differently depending on the picker's own mode. How: This reads picker.mode, falling back to 'random' when no picker was passed at all.
	const isaEasBoo = picModStr === 'ease-up' || picModStr === 'ease-down'; // What: Is-A Ease Boolean. Why: Ease-up/ease-down show a cadence range instead of a weight stepper, since weight is irrelevant to those modes. How: This is true for either ease mode.
	const hasWgtBoo = picModStr === 'weighted' || picModStr === 'dynamic'; // What: Has Weight Boolean. Why: Weight is only a real lever for weighted/dynamic; random picks uniformly and ease modes ignore it entirely. How: This is true for either of those two modes.
	const isaDynBoo = picModStr === 'dynamic'; // What: Is-A Dynamic Boolean. Why: Only dynamic mode also shows the Boost row beneath its weight stepper. How: This is true only when picModStr is 'dynamic'.

	// #endregion Mode-Derived Display Values



	// #region Ease Band Resolution

	const thrValNum = 100; // What: Threshold Value Number. Why: Every drift/day conversion below shares this same fixed scale. How: This is read by every conversion function in this region.

	const drfSooFun = ( easMaxNum ) => Math.max( 1, Math.round( thrValNum / ( easMaxNum || 1 ) ) ); // What: Drift Soonest Function. Why: A "Soonest" day count is the human face of an item's own ease-max drift value. How: This converts easMaxNum into a day count, matching the exact conversion the new-picker form itself uses.
	const drfLatFun = ( easMinNum ) => Math.max( 1, Math.round( thrValNum / ( easMinNum || 1 ) ) ); // What: Drift Latest Function. Why: A "Latest" day count is the human face of an item's own ease-min drift value. How: This converts easMinNum into a day count, the same conversion as drfSooFun, mirrored for the opposite bound.
	const dayDrfFun = ( dayCouNum ) => thrValNum / Math.max( 1, dayCouNum ); // What: Day Drift Function. Why: Writing a user-typed day count back onto the item requires converting it back into a drift value. How: This is the inverse of drfSooFun/drfLatFun.

	const falEasObj = picker ? PIC_NAM_OBJ.aveEasFun( items, picker.id ) : null; // What: Fallback Ease Object. Why: An item with no ease band of its own (e.g. one added before per-item stamping existed, or from an old imported backup) needs the same fallback the picking engine itself uses. How: This calls PIC_NAM_OBJ.aveEasFun against this picker's own items.
	const curEasMinNum = item.easeMin ?? falEasObj?.easeMin ?? 10; // What: Current Ease Min Number. Why: This is the item's own resolved lower drift bound, read once and reused throughout this region. How: This reads item.easeMin, falling back to falEasObj's own easeMin, then a fixed 10.
	const curEasMaxNum = item.easeMax ?? falEasObj?.easeMax ?? 20; // What: Current Ease Max Number. Why: This is the item's own resolved upper drift bound, read once and reused throughout this region. How: This reads item.easeMax, falling back to falEasObj's own easeMax, then a fixed 20.
	const sooDayNum = drfSooFun( curEasMaxNum ); // What: Soonest Day Number. Why: The Soonest/Shortest row needs this as a plain day count to display and edit. How: This converts curEasMaxNum via drfSooFun.
	const latDayNum = drfLatFun( curEasMinNum ); // What: Latest Day Number. Why: The Latest/Longest row needs this as a plain day count to display and edit. How: This converts curEasMinNum via drfLatFun.

	const setSooFun = ( dayCouNum ) => { // What: Set Soonest Function. Why: NumSteCom's own onSet needs a handler that writes a typed Soonest/Shortest day count back onto the item's own easeMax field. How: This clamps dayCouNum, converts it back to a drift value, and writes it via actions.updateItem.


		const newEasMaxNum = dayDrfFun( Math.max( 1, Math.min( 60, dayCouNum ) ) ); // What: New Ease Max Number. Why: The typed day count needs converting back into the drift value item.easeMax actually stores. How: This clamps dayCouNum to [1, 60] then converts it via dayDrfFun.

		actions.updateItem( item.id, { easeMax : newEasMaxNum, easeMin : Math.min( curEasMinNum, newEasMaxNum ) } ); // What: Update Item Call. Why: Raising easeMax can push it below the existing easeMin, which would invert the band. How: This writes the new easeMax, clamping easeMin down to match if it would otherwise exceed the new easeMax.


	};

	const setLatFun = ( dayCouNum ) => { // What: Set Latest Function. Why: NumSteCom's own onSet needs a handler that writes a typed Latest/Longest day count back onto the item's own easeMin field. How: This clamps dayCouNum, converts it back to a drift value, and writes it via actions.updateItem.


		const newEasMinNum = dayDrfFun( Math.max( 1, Math.min( 90, dayCouNum ) ) ); // What: New Ease Min Number. Why: The typed day count needs converting back into the drift value item.easeMin actually stores. How: This clamps dayCouNum to [1, 90] then converts it via dayDrfFun.

		actions.updateItem( item.id, { easeMin : newEasMinNum, easeMax : Math.max( curEasMaxNum, newEasMinNum ) } ); // What: Update Item Call. Why: Lowering easeMin can push it above the existing easeMax, which would invert the band. How: This writes the new easeMin, clamping easeMax up to match if it would otherwise fall under the new easeMin.


	};

	const isaDowBoo = picModStr === 'ease-down'; // What: Is-A Down Boolean. Why: Ease-down uses different row labels/phrasing (Shortest/Longest/Refill) than ease-up (Soonest/Latest/Fill). How: This is true only when picModStr is 'ease-down'.
	const sooLabStr = isaDowBoo ? 'Shortest' : 'Soonest'; // What: Soonest Label String. Why: The Soonest row's own heading text differs by direction. How: This picks 'Shortest' for ease-down, 'Soonest' otherwise.
	const latLabStr = isaDowBoo ? 'Longest' : 'Latest';   // What: Latest Label String. Why: The Latest row's own heading text differs by direction. How: This picks 'Longest' for ease-down, 'Latest' otherwise.

	const uniWorFun = ( couNum ) => CAD_NAM_OBJ.uniWorFun( picker && picker.cadence, couNum ); // What: Unit Word Function. Why: Every day count below needs a correctly-pluralized cadence unit word next to it. How: This calls CAD_NAM_OBJ.uniWorFun with the picker's own cadence and couNum.

	const sooSubEle = isaDowBoo // What: Soonest Sub Element. Why: The Soonest/Shortest row's own subtitle phrasing differs by direction. How: This renders "stays picked N days minimum" for ease-down, or "N days until pickable again" otherwise.
		? <>stays picked <strong>{ sooDayNum } { uniWorFun( sooDayNum ) }</strong> minimum</>
		: <><strong>{ sooDayNum } { uniWorFun( sooDayNum ) }</strong> until pickable again</>;

	const latSubEle = isaDowBoo // What: Latest Sub Element. Why: The Latest/Longest row's own subtitle phrasing differs by direction. How: This renders "stays picked N days maximum" for ease-down, or "N days until pick is mandatory" otherwise.
		? <>stays picked <strong>{ latDayNum } { uniWorFun( latDayNum ) }</strong> maximum</>
		: <><strong>{ latDayNum } { uniWorFun( latDayNum ) }</strong> until pick is mandatory</>;

	// #endregion Ease Band Resolution


	return (


		<div className='rem-inline-editor entry-editor'>{ /* What: Entry Editor Div Element. Why: This is EntryEditor's own root wrapper. How: This renders the mode-specific rows above a confirm-gated footer. */ }


			<div className='pie-rows'>{ /* What: Pie Rows Div Element. Why: Every mode-specific control row shares this one column. How: This renders exactly one of the ease/weight/no-weight branches, plus the optional Boost row and the always-present Active/Inactive row. */ }


				{ isaEasBoo ? ( // What: Ease Rows Branch. Why: Ease-up/ease-down show a cadence range instead of a weight stepper.


					/**
					 * Ease Direction Split = Ease Direction Split Rationale
					 *
					 * @summary
					 * pie-ease-up-row/pie-ease-down-row (on every relevant row
					 * below, alongside the row's own shared pie-row class) are
					 * pure selector hooks for help mode (see help-content.jsx's
					 * itemChargeRangeUp/Down), split by direction rather than one
					 * shared pie-ease-row, since Soonest/Latest/Fill (ease-up) and
					 * Shortest/Longest/Refill (ease-down) get entirely different
					 * tip copy, not just relabeled headings. FilButCom (ui.jsx)
					 * has no class of its own to distinguish it by, and it only
					 * renders for ONE direction at a time, so there is no existing
					 * class shared by exactly "this direction's ease rows" other
					 * than this pair.
					 *
					 * @author z4nta0 <https://github.com/z4nta0>
					 *
					*/

					<React.Fragment>{ /* What: Ease Rows Fragment Element. Why: The Soonest/Latest rows plus one direction-specific Fill/Refill row are true siblings with no shared wrapper of their own. How: This groups all 3 without adding an extra DOM node. */ }


						<div className={ ` pie-row   ${ isaDowBoo ? 'pie-ease-down-row' : 'pie-ease-up-row' } ` }>{ /* What: Soonest Row Div Element. Why: This is the Soonest/Shortest control row. How: This renders the row's own label/InfTipCom/subtitle plus its NumSteCom. */ }


							<div className='pie-rowlabel'>{ /* What: Row Label Div Element. Why: The label/InfTipCom pair and the live subtitle read as one stacked cluster. How: This wraps the label row and the subtitle span below. */ }


								<span className='pie-lbl-row'>{ /* What: Label Row Span Element. Why: The label text and its optional warning InfTipCom sit side by side. How: This wraps the label span and, for ease-up only, the warning InfTipCom. */ }


									<span className='pie-lbl'>{ sooLabStr }</span>{ /* What: Label Span Element. Why: This is the row's own heading text. How: This renders sooLabStr directly. */ }


									{ picModStr === 'ease-up' && ( // What: Ease-Up Warning Check. Why: Only ease-up needs its own inline warning about item competition at high item counts. How: This renders the InfTipCom only while picModStr is 'ease-up'.

										<InfTipCom
											className='pie-help'
											label={ EUR_WAR_STR }
										>?</InfTipCom> // What: Info Tip Component. Why: Ease-up specifically needs its own warning about item competition at high item counts. How: This renders only for ease-up, labeled with EUR_WAR_STR.

									) }

								</span>

								<span
									className='pie-sub set-sub-fade'
									key={ `${ isaDowBoo }-${ sooDayNum }-${ uniWorFun( sooDayNum ) }` }
								>{ sooSubEle }</span>{ /* What: Subtitle Span Element. Why: The live day count/unit-word combination needs its own fade-replace key so a change visibly refreshes. How: This renders sooSubEle, keyed by direction/value/unit-word together. */ }


							</div>


							<div className='pie-ctl'>{ /* What: Control Div Element. Why: The numeric stepper and its own unit-word suffix read as one control cluster. How: This wraps the NumSteCom and the unit-word span below. */ }


								<NumSteCom
									value={ sooDayNum }
									min={ 1 }
									max={ 60 }
									onSet={ setSooFun }
									ariaLabel={ `${ sooLabStr } for ${ item.name }` }
								/>{ /* What: Number Stepper Component. Why: This is the actual editable control for the Soonest/Shortest day count. How: This is passed sooDayNum and setSooFun, clamped to [1, 60]. */ }

								<span className='np-ease-unit'>{ uniWorFun( sooDayNum ) }</span>{ /* What: Ease Unit Span Element. Why: A bare number needs its own unit word right next to the stepper. How: This renders uniWorFun's own result for sooDayNum. */ }


							</div>


						</div>

						<div className={ ` pie-row   ${ isaDowBoo ? 'pie-ease-down-row' : 'pie-ease-up-row' } ` }>{ /* What: Latest Row Div Element. Why: This is the Latest/Longest control row, the mirror of the Soonest row above. How: This renders the row's own label/InfTipCom/subtitle plus its NumSteCom. */ }


							<div className='pie-rowlabel'>{ /* What: Row Label Div Element. Why: The label/InfTipCom pair and the live subtitle read as one stacked cluster. How: This wraps the label row and the subtitle span below. */ }


								<span className='pie-lbl-row'>{ /* What: Label Row Span Element. Why: The label text and its optional warning InfTipCom sit side by side. How: This wraps the label span and, for ease-up only, the warning InfTipCom. */ }


									<span className='pie-lbl'>{ latLabStr }</span>{ /* What: Label Span Element. Why: This is the row's own heading text. How: This renders latLabStr directly. */ }


									{ picModStr === 'ease-up' && ( // What: Ease-Up Warning Check. Why: Only ease-up needs its own inline warning about item competition at high item counts. How: This renders the InfTipCom only while picModStr is 'ease-up'.

										<InfTipCom
											className='pie-help'
											label={ EUR_WAR_STR }
										>?</InfTipCom> // What: Info Tip Component. Why: Ease-up specifically needs its own warning about item competition at high item counts. How: This renders only for ease-up, labeled with EUR_WAR_STR.

									) }

								</span>

								<span
									className='pie-sub set-sub-fade'
									key={ `${ isaDowBoo }-${ latDayNum }-${ uniWorFun( latDayNum ) }` }
								>{ latSubEle }</span>{ /* What: Subtitle Span Element. Why: The live day count/unit-word combination needs its own fade-replace key so a change visibly refreshes. How: This renders latSubEle, keyed by direction/value/unit-word together. */ }


							</div>


							<div className='pie-ctl'>{ /* What: Control Div Element. Why: The numeric stepper and its own unit-word suffix read as one control cluster. How: This wraps the NumSteCom and the unit-word span below. */ }


								<NumSteCom
									value={ latDayNum }
									min={ 1 }
									max={ 90 }
									onSet={ setLatFun }
									ariaLabel={ `${ latLabStr } for ${ item.name }` }
								/>{ /* What: Number Stepper Component. Why: This is the actual editable control for the Latest/Longest day count. How: This is passed latDayNum and setLatFun, clamped to [1, 90]. */ }

								<span className='np-ease-unit'>{ uniWorFun( latDayNum ) }</span>{ /* What: Ease Unit Span Element. Why: A bare number needs its own unit word right next to the stepper. How: This renders uniWorFun's own result for latDayNum. */ }


							</div>


						</div>

						{ picModStr === 'ease-up' && ( // What: Fill Row Visibility Check. Why: Only ease-up offers an instant-fill shortcut for its own charge. How: This renders the Fill row only while picModStr is 'ease-up'.


							<div className='pie-row pie-ease-up-row'>{ /* What: Fill Row Div Element. Why: Ease-up specifically offers an instant-fill shortcut. How: This renders the Fill label/subtitle plus its FilButCom. */ }


								<div className='pie-rowlabel'>{ /* What: Row Label Div Element. Why: The label and the live fill-state subtitle read as one stacked cluster. How: This wraps the label span and the subtitle span below. */ }


									<span className='pie-lbl'>Fill</span>{ /* What: Label Span Element. Why: This is the row's own heading text. How: This renders the literal word "Fill". */ }

									<span
										className='pie-sub set-sub-fade'
										key={ ( item.value ?? 0 ) >= thrValNum ? 'full' : 'part' }
									>{ ( item.value ?? 0 ) >= thrValNum ? <>item is <strong>fully charged</strong> at { Math.round( item.value ?? 0 ) }</> : <>item at <strong>{ Math.round( item.value ?? 0 ) } charge</strong></> }</span>{ /* What: Subtitle Span Element. Why: The live charge subtitle needs its own fade-replace key so crossing the threshold visibly refreshes it. How: This renders one of two phrasings depending on whether item.value has reached thrValNum, keyed by which one is showing. */ }


								</div>


								<FilButCom
									label='Fill'
									disabled={ ( item.value ?? 0 ) >= ( picker.threshold ?? 100 ) }
									onClick={ () => actions.updateItem( item.id, { value : Math.max( item.value ?? 0, picker.threshold ?? 100 ) } ) }
								/>{ /* What: Fill Button Component. Why: This is the actual instant-fill shortcut for an ease-up item. How: This is disabled once item.value already meets the picker's own threshold, otherwise writes value up to that threshold on click. */ }


							</div>


						) }
						{ picModStr === 'ease-down' && ( // What: Refill Row Visibility Check. Why: Only ease-down offers an instant-refill shortcut for its own charge. How: This renders the Refill row only while picModStr is 'ease-down'.


							<div className='pie-row pie-ease-down-row'>{ /* What: Refill Row Div Element. Why: Ease-down specifically offers an instant-refill shortcut. How: This renders the Refill label/subtitle plus its FilButCom. */ }


								<div className='pie-rowlabel'>{ /* What: Row Label Div Element. Why: The label and the live fill-state subtitle read as one stacked cluster. How: This wraps the label span and the subtitle span below. */ }


									<span className='pie-lbl'>Refill</span>{ /* What: Label Span Element. Why: This is the row's own heading text. How: This renders the literal word "Refill". */ }

									<span
										className='pie-sub set-sub-fade'
										key={ ( item.value ?? 0 ) >= thrValNum ? 'full' : 'part' }
									>{ ( item.value ?? 0 ) >= thrValNum ? <>item is <strong>fully charged</strong></> : <>item at <strong>{ Math.round( item.value ?? 0 ) } charge</strong></> }</span>{ /* What: Subtitle Span Element. Why: The live charge subtitle needs its own fade-replace key so crossing the threshold visibly refreshes it. How: This renders one of two phrasings depending on whether item.value has reached thrValNum, keyed by which one is showing. */ }


								</div>


								<FilButCom
									label='Refill'
									disabled={ ( item.value ?? 0 ) >= ( picker.threshold ?? 100 ) }
									onClick={ () => actions.updateItem( item.id, { value : Math.max( item.value ?? 0, picker.threshold ?? 100 ) } ) }
								/>{ /* What: Fill Button Component. Why: This is the actual instant-refill shortcut for an ease-down item. How: This is disabled once item.value already meets the picker's own threshold, otherwise writes value up to that threshold on click. */ }


							</div>


						) }


					</React.Fragment>


				) : hasWgtBoo ? ( // What: Weight Row Branch. Why: Weighted/dynamic show an editable weight stepper instead. How: This renders the weight label/subtitle plus a plain plus/minus control.


					<div className='pie-row'>{ /* What: Weight Row Div Element. Why: This is the weighted/dynamic weight control row. How: This renders the label/subtitle plus the plus/minus weight-stepper below. */ }


						<div className='pie-rowlabel'>{ /* What: Row Label Div Element. Why: The label and the live weight subtitle read as one stacked cluster. How: This wraps the label span and the subtitle span below. */ }


							<span className='pie-lbl'>Weight</span>{ /* What: Label Span Element. Why: This is the row's own heading text. How: This renders the literal word "Weight". */ }

							<span
								className='pie-sub set-sub-fade'
								key={ item.weight }
							>{ item.weight === 1 ? <><strong>baseline</strong> pick chance</> : <><strong>{ item.weight }&times;</strong> more likely than w1</> }</span>{ /* What: Subtitle Span Element. Why: The live weight subtitle needs its own fade-replace key so a change visibly refreshes it. How: This renders one of two phrasings depending on whether item.weight is the baseline 1, keyed by weight. */ }


						</div>


						<div className='weight-stepper'>{ /* What: Weight Stepper Div Element. Why: The minus/value/plus trio reads as one compact control. How: This wraps both plus/minus buttons around the current weight display. */ }


							<button
								aria-label='Less weight'
								disabled={ item.weight <= 1 }
								onClick={ () => actions.setItemWeight( item.id, Math.max( 1, item.weight - 1 ) ) }
							>&minus;</button>{ /* What: Less Weight Button Element. Why: This is the actual decrement control. How: This clamps item.weight down to a minimum of 1 via actions.setItemWeight. */ }

							<span className='weight-val'>w{ item.weight }</span>{ /* What: Weight Value Span Element. Why: The current weight needs a plain numeric display between the two buttons. How: This renders the literal "w" prefix plus item.weight. */ }

							<button
								aria-label='More weight'
								disabled={ item.weight >= 9 }
								onClick={ () => actions.setItemWeight( item.id, Math.min( 9, item.weight + 1 ) ) }
							>+</button>{ /* What: More Weight Button Element. Why: This is the actual increment control. How: This clamps item.weight up to a maximum of 9 via actions.setItemWeight. */ }


						</div>


					</div>


				) : ( // What: No-Weight Row Branch. Why: Random mode ignores weight entirely (it picks uniformly), so this row is purely informational.


					<div className='pie-row'>{ /* What: No Weight Row Div Element. Why: Random mode still needs a Weight row for layout parity, but with no editable control. How: This renders a fixed explanatory subtitle and a plain "No weight" note instead of any stepper. */ }


						<div className='pie-rowlabel'>{ /* What: Row Label Div Element. Why: The label and its fixed explanatory subtitle read as one stacked cluster. How: This wraps the label span and the subtitle span below. */ }


							<span className='pie-lbl'>Weight</span>{ /* What: Label Span Element. Why: This is the row's own heading text. How: This renders the literal word "Weight". */ }

							<span className='pie-sub'>truly random items have equal chance</span>{ /* What: Subtitle Span Element. Why: The user still deserves an explanation for why no weight control appears. How: This renders a fixed explanatory sentence. */ }


						</div>


						<span className='pie-note'>No weight</span>{ /* What: Note Span Element. Why: This row still needs SOME visible content where a control would otherwise sit. How: This renders the literal phrase "No weight". */ }


					</div>


				) }
				{ isaDynBoo && ( // What: Boost Row Visibility Check. Why: Only dynamic mode has a boost value worth showing/resetting. How: This renders the Boost row only while isaDynBoo is true.


					<div className='pie-row'>{ /* What: Boost Row Div Element. Why: This is the dynamic-mode boost control row. How: This renders the label/subtitle plus a BooResCom control. */ }


						<div className='pie-rowlabel'>{ /* What: Row Label Div Element. Why: The label and the live boost subtitle read as one stacked cluster. How: This wraps the label span and the subtitle span below. */ }


							<span className='pie-lbl'>Boost</span>{ /* What: Label Span Element. Why: This is the row's own heading text. How: This renders the literal word "Boost". */ }

							<span
								className='pie-sub set-sub-fade'
								key={ ( item.value || 0 ) > 0 ? 'boost' : 'none' }
							>{ ( item.value || 0 ) > 0 ? <><strong>+{ item.value }</strong> to weight, resets when picked</> : <><strong>no bonus</strong> to weight, will increase when not picked</> }</span>{ /* What: Subtitle Span Element. Why: The live boost subtitle needs its own fade-replace key so a change visibly refreshes it. How: This renders one of two phrasings depending on whether item.value is currently positive, keyed by which one is showing. */ }


						</div>


						<div className='pie-ctl'>{ /* What: Control Div Element. Why: The boost row's own reset control needs a consistent control-column slot, matching every other row. How: This wraps the BooResCom below. */ }


							<BooResCom
								value={ item.value || 0 }
								onReset={ () => actions.updateItem( item.id, { value : 0 } ) }
							/>{ /* What: Boost Reset Component. Why: This is the actual control for zeroing out a dynamic item's own accumulated boost. How: This is passed item.value and writes 0 back via actions.updateItem on reset. */ }


						</div>


					</div>


				) }
				<div className='pie-row'>{ /* What: Active Row Div Element. Why: Every mode, regardless of the branches above, still needs the same Active/Inactive toggle row. How: This renders the label/subtitle plus a plain switch button. */ }


					<div className='pie-rowlabel'>{ /* What: Row Label Div Element. Why: The label and the live active-state subtitle read as one stacked cluster. How: This wraps the label span and the subtitle span below. */ }


						<span
							className='pie-lbl set-sub-fade'
							key={ `lbl-${ !!item.vacation }` }
						>{ item.vacation ? 'Inactive' : 'Active' }</span>{ /* What: Label Span Element. Why: The row's own heading text itself flips with the item's own current state. How: This renders "Inactive" or "Active" depending on item.vacation, keyed so the flip fades. */ }

						<span
							className='pie-sub set-sub-fade'
							key={ `sub-${ !!item.vacation }` }
						>{ item.vacation ? <><strong>not eligible</strong> to be picked</> : <><strong>eligible</strong> to be picked</> }</span>{ /* What: Subtitle Span Element. Why: The live eligibility subtitle needs its own fade-replace key so a toggle visibly refreshes it. How: This renders one of two phrasings depending on item.vacation, keyed the same way as the label above. */ }


					</div>


					<button
						className={ `switch ${ !item.vacation ? 'is-on' : '' }` }
						aria-pressed={ !item.vacation }
						aria-label={ item.vacation ? 'Activate' : 'Deactivate' }
						onClick={ () => actions.toggleVacation( item.id, 'item' ) }
					><i /></button>{ /* What: Active Switch Button Element. Why: This is the actual Active/Inactive toggle control. How: This calls actions.toggleVacation, scoped to 'item'. */ }


				</div>


			</div>


			{ conDelBoo ? ( // What: Confirm Delete Branch. Why: The delete confirm prompt replaces the plain footer entirely while it is up.


				<div
					className='rem-inline-foot rem-foot-confirm'
					key='confirm'
				>{ /* What: Confirm Foot Div Element. Why: This is the delete-confirm prompt's own root, replacing the plain footer row. How: This renders the confirm message and its own Cancel/Delete actions. */ }


					<span className='rem-del-msg'>Delete this item?</span>{ /* What: Delete Message Span Element. Why: This asks the user to confirm before anything is actually removed. How: This renders the literal confirmation question. */ }

					<div className='rem-del-actions'>{ /* What: Delete Actions Div Element. Why: The confirm's own Cancel/Delete buttons need to sit together. How: This wraps both ButBasCom elements below. */ }


						<ButBasCom
							kind='ghost'
							size='sm'
							onClick={ () => setConDelBoo( false ) }
						>Cancel</ButBasCom>{ /* What: Button Base Component. Why: This backs out of the delete confirm without changing anything. How: This closes conDelBoo, returning to the plain footer. */ }

						<ButBasCom
							kind='danger'
							size='sm'
							onClick={ () => ( onDelete ? onDelete() : actions.removeItem( item.id ) ) }
						>Delete</ButBasCom>{ /* What: Button Base Component. Why: This is the actual, confirmed deletion trigger. How: This calls the caller's own onDelete when supplied, otherwise removes the item directly via actions.removeItem. */ }


					</div>


				</div>


			) : ( // What: Plain Foot Branch. Why: The normal, non-confirming footer shows whenever conDelBoo is false.


				<div
					className='rem-inline-foot rd-edit-foot'
					key='foot'
				>{ /* What: Plain Foot Div Element. Why: This is the normal footer, holding an optional Delete button (suppressed for a brand-new item) plus the Cancel/Save actions. The Pickers tab hides the Delete button entirely via a `.pv-newitem .rd-edit-foot > .btn--danger` direct-child selector and enforces the 2-item minimum on its own row-level trash icon instead, so it never passes itemCount here, keeping minIteBoo false and this branch's extra InfTipCom wrapper out of the way of that selector. How: This renders Delete (plain, or InfTipCom-wrapped and disabled while minIteBoo) unless isNew, then the Cancel/Save pair. */ }


					{ !isNew && ( minIteBoo ? ( // What: Delete Visibility Check. Why: A brand-new item has nothing to delete yet, only to discard via Cancel/implicit-close; an existing item at the 2-item floor gets a disabled, explained Delete instead of a working one.


						<InfTipCom
							className='rd-del-disabled-tip'
							label='Pickers require at least 2 items in their list, you need to add another item first or delete the entire picker instead.'
						>

							<ButBasCom
								kind='danger'
								size='sm'
								icon='trash'
								disabled
							>Delete</ButBasCom>{ /* What: Button Base Component. Why: This shows the disabled Delete control the wrapping InfTipCom explains. How: This never fires, since disabled is always set in this branch. */ }

						</InfTipCom> // What: Info Tip Component. Why: A blocked delete still needs to explain itself on hover/tap, not just silently refuse. How: This wraps the disabled Delete button with the fixed floor-explanation text.


					) : ( // What: Working Delete Branch. Why: With more than 2 items still in the pool, a real working Delete button belongs here instead. How: This renders the else branch, taken while minIteBoo is false.


						<ButBasCom
							kind='danger'
							size='sm'
							icon='trash'
							onClick={ () => setConDelBoo( true ) }
						>Delete</ButBasCom> // What: Button Base Component. Why: This opens the delete confirm prompt above instead of deleting immediately. How: This sets conDelBoo to true.


					) ) }
					<div className='rem-foot-right'>{ /* What: Foot Right Div Element. Why: Cancel and Save read as a pair, right-aligned opposite Delete. How: This wraps both ButBasCom elements below. */ }


						<ButBasCom
							kind='ghost'
							size='sm'
							className='ob-item-cancel'
							onClick={ canEdiFun }
						>Cancel</ButBasCom>{ /* What: Button Base Component. Why: This discards the live edits and reverts to the original snapshot. How: This calls canEdiFun. */ }

						<ButBasCom
							kind='ghost'
							size='sm'
							className='ob-item-save'
							onClick={ savCloFun }
						>Save</ButBasCom>{ /* What: Button Base Component. Why: This keeps the live edits as-is. How: This calls savCloFun. */ }


					</div>


				</div>


			) }


		</div>


	);


} );

// #endregion EntryEditor



// #region EntCarCom

/**
 * EntCarCom = Entry Card Component
 *
 * @summary
 * Renders one row in the Today list: a real picked item, a mini-tour
 * launcher card (a hidden sample picker still offering its own
 * tutorial), a day-off card (a triggered conditional suppressing its
 * dependent pickers), or a charging card (an ease-up picker with
 * nothing charged to its own threshold today). Which of the four
 * renders is decided entirely by entRecObj.kind, checked in that order.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.entRecObj   - Entry Record Object: The entry (or synthetic
 *                            tutorial/day-off/ charging row) this card
 *                            renders.
 * @param props.picRecObj   - Picker Record Object: The entry's own resolved
 *                            picker (or a picker-shaped stand-in for a day-off
 *                            row).
 * @param props.staAppObj   - State App Object: The shared app state.
 * @param props.actStoObj   - Action Store Object: The shared app actions.
 * @param props.jusCheStr   - Just Check String: The eid of whichever entry was
 *                            just checked, for the brief "fresh" cue.
 * @param props.onCheFun    - On Check Function: Toggles this row's own done
 *                            state.
 * @param props.onSkiFun    - On Skip Function: Skips (removes) this row
 *                            entirely.
 * @param props.onRerFun    - On Reroll Function: Re-rolls this row to a
 *                            different item.
 * @param props.isaRemBoo   - Is-A Removal Boolean: Whether this row is
 *                            mid-removal animation.
 * @param props.isaRolBoo   - Is-A Rolling Boolean: Whether this row is
 *                            mid-reroll animation.
 * @param props.isaEdiBoo   - Is-An Edit Boolean: Whether this row's own inline
 *                            editor is open.
 * @param props.onEdiFun    - On Edit Function: Toggles this row's own inline
 *                            editor.
 * @param props.onRenFun    - On Rename Function: Renames this row's own item.
 * @param props.ediModBoo   - Edit Mode Boolean: Whether Edit Mode is currently
 *                            on.
 * @param props.onGriDowFun - On Grid Down Function: Starts a within-group drag
 *                            from this row's own grip handle.
 * @param props.onPlaTutFun - On Play Tutorial Function: Starts this row's own
 *                            mini-tour (tutorial rows only).
 * @param props.onUncTutFun - On Uncheck Tutorial Function: Un-resolves this
 *                            row's own mini-tour (tutorial rows only).
 * @param props.cheExiBoo   - Check Existing Boolean: Whether the checklist's
 *                            own closing exit animation is currently playing
 *                            (tutorial rows only).
 *
 * @returns Exactly one of the tutorial/day-off/charging/real-pick
 * article elements, chosen by entRecObj.kind, or null when the row's own
 * item can no longer be found at all.
 *
 * @example
 * ```tsx
 * EntCarCom({ entRecObj, picRecObj, staAppObj, ... }) // => <EntCarCom />
 * ```
 *
*/

function EntCarCom ( { entry : entRecObj, picker : picRecObj, state : staAppObj, actions : actStoObj, justChecked : jusCheStr, onCheck : onCheFun, onSkip : onSkiFun, onReroll : onRerFun, isRemoving : isaRemBoo, isRolling : isaRolBoo, isEditing : isaEdiBoo, onEdit : onEdiFun, onRename : onRenFun, editMode : ediModBoo, onGripDown : onGriDowFun, onPlayTutorial : onPlaTutFun, onUncheckTutorial : onUncTutFun, checklistExiting : cheExiBoo } ) {


	// #region Tutorial Branch

	if ( entRecObj.kind === 'tutorial' ) { // What: Tutorial Branch. Why: A mini-tour launcher card renders entirely differently from a real pick, with no item/reroll/skip of its own. How: This returns a dedicated article and skips every other branch below.


		const tutDonBoo = entRecObj.done; // What: Tutorial Done Boolean. Why: A resolved tutorial card renders/behaves differently from a pending one. How: This reads entRecObj's own done flag.
		const neeAttBoo = !tutDonBoo && ONB_CHE_OBJ.reaPicFun( staAppObj ) === 0; // What: Needs Attention Boolean. Why: Only picker cards participate in the "at least one real picker" gate that blocks the closing Generate card, flagged with a visible cue rather than requiring a tap to discover. How: This is true only while this card is unresolved and no real picker exists yet.

		const onRowCliFun = ( cliEveObj ) => { // What: On Row Click Function. Why: Clicking anywhere on the card (other than its own actions area) should start or un-resolve this sample's own mini-tour. How: This checks for a click inside the actions area first, then dispatches to onUncTutFun or onPlaTutFun based on tutDonBoo.


			if ( cliEveObj.target.closest( '.today-card-actions' ) ) return;

			if ( tutDonBoo ) onUncTutFun( 'picker', picRecObj.id );

			else onPlaTutFun( 'picker', picRecObj.id );


		};

		return (


			<article
				className={ ` today-card   today-card--tutorial   ${ tutDonBoo ? 'is-done' : '' }   ${ neeAttBoo ? 'is-needed' : '' }   ${ cheExiBoo ? 'is-removing' : '' } ` }
				onClick={ onRowCliFun }
			>{ /* What: Tutorial Card Article Element. Why: This is EntCarCom's own root for a mini-tour launcher row. How: This renders a Play/Undo check button, the meta/name body, and (while unresolved) a Cancel action. */ }


				{ tutDonBoo ? ( // What: Tutorial Done Check. Why: A resolved sample card's checkbox behaves differently from a pending one. How: This renders the undo-check button while tutDonBoo is true, the play-check button otherwise.


					<button
						type='button'
						className='check'
						aria-pressed='true'
						aria-label={ `Undo ${ picRecObj.name } tutorial` }
						onClick={ ( cliEveObj ) => { cliEveObj.stopPropagation(); onUncTutFun( 'picker', picRecObj.id ); } }
					>{ /* What: Undo Check Button Element. Why: A resolved tutorial card can be un-resolved directly from its own check button, unlike a pending one. How: This calls onUncTutFun, scoped to 'picker'. */ }


						<span
							className='check-ripple'
							aria-hidden='true'
						/>{ /* What: Check Ripple Span Element. Why: A completed check needs the same ripple flourish every other done row gets. How: This is a purely decorative, empty span. */ }

						<IcoSvgCom
							name='check'
							size={ 14 }
						/>{ /* What: Icon Svg Component. Why: A resolved card needs a checkmark glyph. How: This renders the 'check' icon at a fixed size. */ }


					</button>


				) : ( // What: Play Check Branch. Why: A pending sample needs its own play-to-start checkbox instead. How: This renders the else branch, taken while tutDonBoo is false.


					<button
						type='button'
						className='check'
						aria-label={ `Start the ${ picRecObj.name } tutorial` }
						onClick={ ( cliEveObj ) => { cliEveObj.stopPropagation(); onPlaTutFun( 'picker', picRecObj.id ); } }
					>{ /* What: Play Check Button Element. Why: A pending tutorial card's own check button starts its mini-tour instead of toggling done. How: This calls onPlaTutFun, scoped to 'picker'. */ }


						<IcoSvgCom
							name='play'
							size={ 13 }
						/>{ /* What: Icon Svg Component. Why: A pending card needs a play glyph inviting the user to start its tutorial. How: This renders the 'play' icon at a fixed size. */ }


					</button>


				) }
				<div className='today-card-body'>{ /* What: Card Body Div Element. Why: The meta row and name row read as one grouped block. How: This wraps the meta row and the name div below. */ }


					<div className='today-card-meta'>{ /* What: Card Meta Div Element. Why: The picker's own name and its optional time estimate sit together. How: This wraps the picker-name span and, when one exists, the time estimate. */ }


						<span className='meta-picker'>{ picRecObj.name }</span>{ /* What: Meta Picker Span Element. Why: The user needs to see which sample picker this card offers. How: This renders picRecObj's own name. */ }


						{ ONB_PCT_OBJ[ picRecObj.id ] && ( // What: Time Estimate Check. Why: Not every sample picker card has a manually-timed estimate. How: This renders the dot/time pair only while ONB_PCT_OBJ has an entry for picRecObj's own id.


							<React.Fragment>{ /* What: Time Estimate Fragment Element. Why: The separator dot and the time text are true siblings with no shared wrapper of their own. How: This groups both spans without adding an extra DOM node. */ }


								<span className='meta-dot'>&middot;</span>{ /* What: Meta Dot Span Element. Why: The picker name and the time estimate need a small visual separator between them. How: This renders a literal middle-dot character. */ }

								<span className='meta-time'>{ ONB_PCT_OBJ[ picRecObj.id ] }</span>{ /* What: Meta Time Span Element. Why: A manually-timed estimate helps the user judge how long this tutorial takes. How: This renders the looked-up estimate for picRecObj's own id. */ }


							</React.Fragment>


						) }

					</div>


					<div className='today-card-name'>Set up a { picRecObj.name } picker</div>{ /* What: Card Name Div Element. Why: This is the card's own call-to-action text. How: This renders the fixed phrasing with picRecObj's own name interpolated. */ }


				</div>
				{ !tutDonBoo && ( // What: Cancel Action Visibility Check. Why: A resolved card has nothing left to cancel. How: This renders the Cancel action only while tutDonBoo is false.


					<div className='today-card-actions'>{ /* What: Card Actions Div Element. Why: A pending card offers a Cancel action distinct from resolving it. How: This wraps the single Cancel icon-button below. */ }


						<button
							className='icon-btn'
							aria-label='Cancel tutorial'
							title='Cancel'
							onClick={ ( cliEveObj ) => { cliEveObj.stopPropagation(); actStoObj.setChecklistItem( picRecObj.id, { status : 'cancelled' } ); } }
						>{ /* What: Cancel Icon Button Element. Why: Cancelling marks this card resolved without actually finishing its tutorial. How: This calls actStoObj.setChecklistItem with a 'cancelled' status. */ }


							<IcoSvgCom
								name='x'
								size={ 15 }
							/>{ /* What: Icon Svg Component. Why: The Cancel action needs a recognizable dismiss glyph. How: This renders the 'x' icon at a fixed size. */ }


						</button>


					</div>


				) }


			</article>


		);


	}

	// #endregion Tutorial Branch



	// #region Day-Off Branch

	if ( entRecObj.kind === 'dayoff' ) { // What: Day-Off Branch. Why: A triggered conditional's own day-off card renders like a completable row, but with no item, no re-roll, and no editable name. How: This returns a dedicated article and skips every other branch below.


		const doFreBoo = jusCheStr === entRecObj.eid && entRecObj.done; // What: Day-Off Fresh Boolean. Why: This row's own brief "fresh" cue only plays right after IT specifically was just checked done. How: This compares jusCheStr against entRecObj's own eid, and requires done to already be true.
		const disTipStr = 'This action is disabled for this type of item.';                                                                       // What: Disabled Tip String. Why: Every disabled action icon on this row shares the exact same explanation. How: This is passed as every InfTipCom's own label below.
		const dofTitStr = entRecObj.pickerName ? `${ entRecObj.pickerName } · ${ entRecObj.condName || 'Day off' }` : 'Day off';              // What: Day-Off Title String. Why: The truncatable title tooltip needs the full "{picker} · {conditional}" text even when the visible row itself wraps or truncates it. How: This combines entRecObj's own pickerName/condName, falling back to a plain "Day off" when no picker name is recorded.

		const onRowCliFun = ( cliEveObj ) => { // What: On Row Click Function. Why: Clicking anywhere on the row (other than its own actions area) should toggle done, but only outside Edit Mode and while not mid-removal. How: This checks both exclusion conditions first, then calls onCheFun.


			if ( ediModBoo || isaRemBoo ) return;

			if ( cliEveObj.target.closest( '.today-card-actions' ) ) return;

			onCheFun( picRecObj, entRecObj );


		};

		return (


			<article
				className={ ` today-card   today-card--dayoff   ${ entRecObj.done ? 'is-done' : '' }   ${ doFreBoo ? 'is-fresh' : '' }   ${ isaRemBoo ? 'is-removing' : '' }   ${ ediModBoo ? 'is-reorderable' : '' } ` }
				onClick={ onRowCliFun }
			>{ /* What: Day-Off Card Article Element. Why: This is EntCarCom's own root for a day-off row. How: This renders a grip (Edit Mode) or check button, the meta/name body, and (outside Edit Mode) a disabled re-roll/edit plus a working Skip. */ }


				{ ediModBoo ? ( // What: Edit Mode Check. Why: The row's own leading control swaps between a drag grip and a check button depending on whether Edit Mode is active. How: This renders the grip handle while ediModBoo is true, the check button otherwise.


					<span
						className='card-grip'
						aria-label='Drag to reorder'
						role='button'
						tabIndex={ 0 }
						draggable={ false }
						onDragStart={ ( dstEveObj ) => dstEveObj.preventDefault() }
						onPointerDown={ ( ptdEveObj ) => onGriDowFun( ptdEveObj ) }
					>{ /* What: Card Grip Span Element. Why: This is the actual pointer-drag handle for reordering this row within its group. How: This forwards its own pointerdown to onGriDowFun and blocks the native HTML5 drag gesture entirely. */ }


						<IcoSvgCom
							name='grip'
							size={ 16 }
						/>{ /* What: Icon Svg Component. Why: The grip handle needs a recognizable drag-affordance glyph. How: This renders the 'grip' icon at a fixed size. */ }


					</span>


				) : ( // What: Check Button Branch. Why: Outside Edit Mode, the row needs its own working done-toggle checkbox instead. How: This renders the else branch, taken while ediModBoo is false.


					<button
						type='button'
						className='check'
						aria-pressed={ !!entRecObj.done }
						aria-label={ `${ entRecObj.done ? 'Unmark' : 'Mark' } day off complete` }
						onClick={ ( cliEveObj ) => { cliEveObj.stopPropagation(); onCheFun( picRecObj, entRecObj ); } }
					>{ /* What: Check Button Element. Why: This is the actual done-toggle control for a day-off row. How: This calls onCheFun, and shows a checkmark only once entRecObj.done is true. */ }


						<span
							className='check-ripple'
							aria-hidden='true'
						/>{ /* What: Check Ripple Span Element. Why: A completed check needs the same ripple flourish every other done row gets. How: This is a purely decorative, empty span. */ }


						{ entRecObj.done && ( // What: Done IcoSvgCom Check. Why: A completed day-off card's own checkbox needs a checkmark glyph, an undone one doesn't. How: This renders the IcoSvgCom only while entRecObj.done is true.

							<IcoSvgCom
								name='check'
								size={ 14 }
							/> // What: Icon Svg Component. Why: A completed day-off card needs a checkmark glyph. How: This renders the 'check' icon only while entRecObj.done is true.

						) }

					</button>


				) }
				<div className='today-card-body'>{ /* What: Card Body Div Element. Why: The meta row and name row read as one grouped block. How: This wraps the meta row and the name div below. */ }


					<div className='today-card-meta today-card-meta--dayoff'>{ /* What: Card Meta Div Element. Why: A day-off row's own truncatable title needs its own modifier class for layout. How: This wraps the InfTipCom-wrapped title below. */ }


						<InfTipCom
							className='meta-picker meta-dayoff-title'
							label={ dofTitStr }
							truncationOnly
						>{ /* What: Info Tip Component. Why: A visually-truncated title still needs its own full text reachable on hover/tap. How: This wraps the visible title text, only ever showing its own tooltip when the text is actually truncated (truncationOnly). */ }


							{ entRecObj.pickerName ? <>{ entRecObj.pickerName } &middot; <strong>{ entRecObj.condName || 'Day off' }</strong></> : 'Day off' }


						</InfTipCom>


					</div>


					<div className='today-card-name'>{ entRecObj.cardText || 'Enjoy your day off' }</div>{ /* What: Card Name Div Element. Why: This is the day-off card's own main display text. How: This renders entRecObj's own cardText, falling back to a fixed friendly phrase. */ }


				</div>
				{ !ediModBoo && ( // What: Card Actions Visibility Check. Why: Edit Mode replaces the whole actions strip with the drag grip above, so it has nothing left to show here. How: This renders the actions strip only while ediModBoo is false.


					<div className='today-card-actions'>{ /* What: Card Actions Div Element. Why: A day-off row still shows the full 3-icon action strip for layout parity, but re-roll/edit are disabled since neither concept applies. How: This wraps the disabled Re-Roll InfTipCom, a working Skip button, and the disabled Edit InfTipCom. */ }


						<InfTipCom
							className='icon-btn is-disabled'
							label={ disTipStr }
							action='Re-Roll'
						>

							<IcoSvgCom
								name='refresh'
								size={ 14 }
							/>{ /* What: Icon Svg Component. Why: The disabled Re-Roll action still needs its own recognizable glyph. How: This renders the 'refresh' icon at a fixed size. */ }

						</InfTipCom>{ /* What: Info Tip Component. Why: A day-off card has no items to re-roll between, so this action is explained rather than removed. How: This wraps a disabled-looking refresh icon with disTipStr. */ }

						<button
							className='icon-btn'
							aria-label='Skip'
							title='Skip'
							onClick={ ( cliEveObj ) => { cliEveObj.stopPropagation(); onSkiFun( entRecObj.eid ); } }
						>{ /* What: Skip Icon Button Element. Why: Skip is the one action that DOES still apply to a day-off row. How: This calls onSkiFun with entRecObj's own eid. */ }


							<IcoSvgCom
								name='skip'
								size={ 15 }
							/>{ /* What: Icon Svg Component. Why: The Skip action needs a recognizable glyph. How: This renders the 'skip' icon at a fixed size. */ }


						</button>

						<InfTipCom
							className='icon-btn is-disabled'
							label={ disTipStr }
							action='Edit'
						>

							<IcoSvgCom
								name='edit'
								size={ 15 }
							/>{ /* What: Icon Svg Component. Why: The disabled Edit action still needs its own recognizable glyph. How: This renders the 'edit' icon at a fixed size. */ }

						</InfTipCom>{ /* What: Info Tip Component. Why: A day-off card has no editable name of its own, so this action is explained rather than removed. How: This wraps a disabled-looking edit icon with disTipStr. */ }


					</div>


				) }


			</article>


		);


	}

	// #endregion Day-Off Branch



	// #region Charging Branch

	if ( entRecObj.kind === 'charging' ) { // What: Charging Branch. Why: An ease-up picker with nothing charged to its own threshold today still needs a completable placeholder row that applies the day's drift once checked. How: This returns a dedicated article and skips the real-pick branch below.


		const chrFreBoo = jusCheStr === entRecObj.eid && entRecObj.done; // What: Charging Fresh Boolean. Why: This row's own brief "fresh" cue only plays right after IT specifically was just checked done. How: This compares jusCheStr against entRecObj's own eid, and requires done to already be true.
		const disTipStr = 'This action is disabled for this type of item.'; // What: Disabled Tip String. Why: Every disabled action icon on this row shares the exact same explanation. How: This is passed as every InfTipCom's own label below.

		const onRowCliFun = ( cliEveObj ) => { // What: On Row Click Function. Why: Clicking anywhere on the row (other than its own actions area) should toggle done, but only outside Edit Mode and while not mid-removal. How: This checks both exclusion conditions first, then calls onCheFun.


			if ( ediModBoo || isaRemBoo ) return;

			if ( cliEveObj.target.closest( '.today-card-actions' ) ) return;

			onCheFun( picRecObj, entRecObj );


		};

		return (


			<article
				className={ ` today-card   today-card--charging   ${ entRecObj.done ? 'is-done' : '' }   ${ chrFreBoo ? 'is-fresh' : '' }   ${ isaRemBoo ? 'is-removing' : '' }   ${ ediModBoo ? 'is-reorderable' : '' } ` }
				onClick={ onRowCliFun }
			>{ /* What: Charging Card Article Element. Why: This is EntCarCom's own root for a charging row. How: This renders a grip (Edit Mode) or check button, the meta/name body, and (outside Edit Mode) 3 fully-disabled actions. */ }


				{ ediModBoo ? ( // What: Edit Mode Check. Why: The row's own leading control swaps between a drag grip and a check button depending on whether Edit Mode is active. How: This renders the grip handle while ediModBoo is true, the check button otherwise.


					<span
						className='card-grip'
						aria-label='Drag to reorder'
						role='button'
						tabIndex={ 0 }
						draggable={ false }
						onDragStart={ ( dstEveObj ) => dstEveObj.preventDefault() }
						onPointerDown={ ( ptdEveObj ) => onGriDowFun( ptdEveObj ) }
					>{ /* What: Card Grip Span Element. Why: This is the actual pointer-drag handle for reordering this row within its group. How: This forwards its own pointerdown to onGriDowFun and blocks the native HTML5 drag gesture entirely. */ }


						<IcoSvgCom
							name='grip'
							size={ 16 }
						/>{ /* What: Icon Svg Component. Why: The grip handle needs a recognizable drag-affordance glyph. How: This renders the 'grip' icon at a fixed size. */ }


					</span>


				) : ( // What: Check Button Branch. Why: Outside Edit Mode, the row needs its own working done-toggle checkbox instead. How: This renders the else branch, taken while ediModBoo is false.


					<button
						type='button'
						className='check'
						aria-pressed={ !!entRecObj.done }
						aria-label={ `${ entRecObj.done ? 'Unmark' : 'Mark' } ${ picRecObj.name } charging card complete` }
						onClick={ ( cliEveObj ) => { cliEveObj.stopPropagation(); onCheFun( picRecObj, entRecObj ); } }
					>{ /* What: Check Button Element. Why: This is the actual done-toggle control for a charging row, applying the day's own staged drift once checked. How: This calls onCheFun, and shows a checkmark only once entRecObj.done is true. */ }


						<span
							className='check-ripple'
							aria-hidden='true'
						/>{ /* What: Check Ripple Span Element. Why: A completed check needs the same ripple flourish every other done row gets. How: This is a purely decorative, empty span. */ }


						{ entRecObj.done && ( // What: Done IcoSvgCom Check. Why: A completed charging card's own checkbox needs a checkmark glyph, an undone one doesn't. How: This renders the IcoSvgCom only while entRecObj.done is true.

							<IcoSvgCom
								name='check'
								size={ 14 }
							/> // What: Icon Svg Component. Why: A completed charging card needs a checkmark glyph. How: This renders the 'check' icon only while entRecObj.done is true.

						) }

					</button>


				) }
				<div className='today-card-body'>{ /* What: Card Body Div Element. Why: The meta row and name row read as one grouped block. How: This wraps the meta row and the name div below. */ }


					<div className='today-card-meta'>{ /* What: Card Meta Div Element. Why: The picker's own name needs a consistent meta-row slot, matching a real card's own layout. How: This wraps the picker-name span below. */ }


						<span className='meta-picker'>{ picRecObj.name }</span>{ /* What: Meta Picker Span Element. Why: The user needs to see which picker this charging card belongs to. How: This renders picRecObj's own name. */ }


					</div>


					<div className='today-card-name'>No eligible items for today</div>{ /* What: Card Name Div Element. Why: This is the fixed explanatory text for a charging row. How: This renders a literal, fixed phrase. */ }


				</div>
				{ !ediModBoo && ( // What: Card Actions Visibility Check. Why: Edit Mode replaces the whole actions strip with the drag grip above, so it has nothing left to show here. How: This renders the actions strip only while ediModBoo is false.


					<div className='today-card-actions'>{ /* What: Card Actions Div Element. Why: A charging row still shows the full 3-icon action strip for layout parity, but every one of them is disabled since none of those concepts apply here. How: This wraps 3 disabled InfTipCom-wrapped icons. */ }


						<InfTipCom
							className='icon-btn is-disabled'
							label={ disTipStr }
							action='Re-Roll'
						>

							<IcoSvgCom
								name='refresh'
								size={ 14 }
							/>{ /* What: Icon Svg Component. Why: The disabled Re-Roll action still needs its own recognizable glyph. How: This renders the 'refresh' icon at a fixed size. */ }

						</InfTipCom>{ /* What: Info Tip Component. Why: A charging card has no items to re-roll between yet. How: This wraps a disabled-looking refresh icon with disTipStr. */ }

						<InfTipCom
							className='icon-btn is-disabled'
							label={ disTipStr }
							action='Skip'
						>

							<IcoSvgCom
								name='skip'
								size={ 15 }
							/>{ /* What: Icon Svg Component. Why: The disabled Skip action still needs its own recognizable glyph. How: This renders the 'skip' icon at a fixed size. */ }

						</InfTipCom>{ /* What: Info Tip Component. Why: Skipping a charging card would discard the day's own staged drift instead of applying it. How: This wraps a disabled-looking skip icon with disTipStr. */ }

						<InfTipCom
							className='icon-btn is-disabled'
							label={ disTipStr }
							action='Edit'
						>

							<IcoSvgCom
								name='edit'
								size={ 15 }
							/>{ /* What: Icon Svg Component. Why: The disabled Edit action still needs its own recognizable glyph. How: This renders the 'edit' icon at a fixed size. */ }

						</InfTipCom>{ /* What: Info Tip Component. Why: A charging card has no item of its own yet to edit. How: This wraps a disabled-looking edit icon with disTipStr. */ }


					</div>


				) }


			</article>


		);


	}

	// #endregion Charging Branch



	// #region Real Pick Branch

	const curIteObj = staAppObj.items.find( ( oneIteObj ) => oneIteObj.id === entRecObj.itemId ); // What: Current Item Object. Why: A real pick row needs its own live item resolved before anything else in this branch can render. How: This finds the item matching entRecObj's own itemId.

	if ( !curIteObj ) return null; // What: Missing Item Guard. Why: An item deleted out from under a still-listed entry has nothing left to render. How: This returns null early when curIteObj cannot be found at all.


	const freBoo = jusCheStr === entRecObj.eid && entRecObj.done; // What: Fresh Boolean. Why: This row's own brief "fresh" cue only plays right after IT specifically was just checked done. How: This compares jusCheStr against entRecObj's own eid, and requires done to already be true.

	/**
	 * Reroll Eligibility = Reroll Eligibility Rationale
	 *
	 * @summary
	 * Re-roll needs at least two candidates to land on a DIFFERENT item;
	 * with only one, the button is disabled and shows a tip (hover on
	 * desktop, tap on mobile). What counts as a candidate is per-mode:
	 * ease-up cycles items charged to the threshold, every other mode
	 * draws from the picker's own active (non-vacation) items.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const rerPooArr = staAppObj.items.filter( ( curIteObj ) => curIteObj.pickerId === picRecObj.id && !curIteObj.vacation ); // What: Reroll Pool Array. Why: See the doc comment just above. How: This filters state.items down to this picker's own active items.
	const eliCouNum = picRecObj.mode === 'ease-up'
		? rerPooArr.filter( ( curIteObj ) => PIC_NAM_OBJ.easEliFun( curIteObj, picRecObj.threshold ) ).length
		: rerPooArr.length; // What: Eligible Count Number. Why: This is the actual number of candidates re-roll could land on. How: This counts only threshold-eligible items for ease-up, or the whole active pool for every other mode.

	/**
	 * Completed Row Lockout = Completed Row Lockout Rationale
	 *
	 * @summary
	 * A completed entry can't be rolled away or skipped: re-roll would
	 * silently revoke the completion and revert the drift/boost mutation
	 * it applied (and leave a log row that is both done and rejected),
	 * and skip would discard the completion outright. Both are
	 * expressible without the footgun (push another item manually, or
	 * un-check first), so the buttons explain rather than act.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const entDonBoo = !!entRecObj.done;             // What: Entry Done Boolean. Why: See the doc comment just above. How: This reads entRecObj's own done flag.
	const canRerBoo = eliCouNum >= 2 && !entDonBoo; // What: Can Reroll Boolean. Why: Re-roll is only ever a live control when both enough candidates exist AND the row is not already completed. How: This combines eliCouNum's own floor with the negation of entDonBoo.

	const donRerStr = 'Item is completed and cannot be rolled away. If you want another item added, use the Pickers tab to manually push another item here.'; // What: Done Reroll String. Why: A completed row's own disabled re-roll needs its own specific explanation. How: This is passed as the InfTipCom's own label when entDonBoo blocks re-roll.
	const donSkiStr = 'Item is completed and cannot be skipped. If you want remove this item, uncheck it first.';                                            // What: Done Skip String. Why: A completed row's own disabled skip needs its own specific explanation. How: This is passed as the InfTipCom's own label when entDonBoo blocks skip.
	const rerTipStr = picRecObj.mode === 'ease-up' // What: Reroll Tip String. Why: A not-yet-completed row with too few candidates still needs an explanation, phrased differently per mode. How: This picks the ease-up-specific wording or the general "only one active item" wording.
		? 'Only one item is charged and ready, so there’s nothing to re-roll to. Another item becomes available once it reaches full charge.'
		: 'This picker has only one active item, so there’s nothing to re-roll to. Add or activate another item for this picker to enable re-rolls.';

	const actRerStr = entDonBoo ? donRerStr : rerTipStr; // What: Active Reroll String. Why: Completion takes precedence over the plain candidate-count explanation, since it applies regardless of how many candidates actually exist. How: This picks donRerStr once entDonBoo is true, otherwise rerTipStr.

	const onRowCliFun = ( cliEveObj ) => { // What: On Row Click Function. Why: Clicking anywhere on the card (other than its own actions area or the name field) should toggle done, but only outside Edit Mode and while not mid-removal/mid-reroll. How: This checks all 3 exclusion conditions first, then calls onCheFun.


		if ( ediModBoo || isaRemBoo || isaRolBoo ) return;

		if ( cliEveObj.target.closest( '.today-card-actions' ) ) return;

		if ( cliEveObj.target.closest( '.entry-card-name-input' ) ) return;

		onCheFun( picRecObj, entRecObj );


	};

	return (


		<article
			className={ ` today-card   ${ entRecObj.done ? 'is-done' : '' }   ${ freBoo ? 'is-fresh' : '' }   ${ isaRemBoo ? 'is-removing' : '' }   ${ isaRolBoo ? 'is-rolling' : '' }   ${ isaEdiBoo ? 'is-editing' : '' }   ${ ediModBoo ? 'is-reorderable' : '' } ` }
			onClick={ onRowCliFun }
		>{ /* What: Real Pick Card Article Element. Why: This is EntCarCom's own root for an ordinary picked-item row. How: This renders a grip (Edit Mode) or check button, the meta/name body (a text field while editing), and (outside Edit Mode) the re-roll/skip/edit actions. */ }


			{ ediModBoo ? ( // What: Edit Mode Check. Why: The row's own leading control swaps between a drag grip and a check button depending on whether Edit Mode is active. How: This renders the grip handle while ediModBoo is true, the check button otherwise.


				<span
					className='card-grip'
					aria-label='Drag to reorder'
					role='button'
					tabIndex={ 0 }
					draggable={ false }
					onDragStart={ ( dstEveObj ) => dstEveObj.preventDefault() }
					onPointerDown={ ( ptdEveObj ) => onGriDowFun( ptdEveObj ) }
				>{ /* What: Card Grip Span Element. Why: This is the actual pointer-drag handle for reordering this row within its group. How: This forwards its own pointerdown to onGriDowFun and blocks the native HTML5 drag gesture entirely. */ }


					<IcoSvgCom
						name='grip'
						size={ 16 }
					/>{ /* What: Icon Svg Component. Why: The grip handle needs a recognizable drag-affordance glyph. How: This renders the 'grip' icon at a fixed size. */ }


				</span>


			) : ( // What: Check Button Branch. Why: Outside Edit Mode, the row needs its own working done-toggle checkbox instead. How: This renders the else branch, taken while ediModBoo is false.


				<button
					type='button'
					className='check'
					aria-pressed={ !!entRecObj.done }
					aria-label={ `${ entRecObj.done ? 'Unmark' : 'Mark' } ${ curIteObj.name } complete` }
					onClick={ ( cliEveObj ) => { cliEveObj.stopPropagation(); onCheFun( picRecObj, entRecObj ); } }
				>{ /* What: Check Button Element. Why: This is the actual done-toggle control for an ordinary picked row. How: This calls onCheFun, and shows a checkmark only once entRecObj.done is true. */ }


					<span
						className='check-ripple'
						aria-hidden='true'
					/>{ /* What: Check Ripple Span Element. Why: A completed check needs the same ripple flourish every other done row gets. How: This is a purely decorative, empty span. */ }


					{ entRecObj.done && ( // What: Done IcoSvgCom Check. Why: A completed pick card's own checkbox needs a checkmark glyph, an undone one doesn't. How: This renders the IcoSvgCom only while entRecObj.done is true.

						<IcoSvgCom
							name='check'
							size={ 14 }
						/> // What: Icon Svg Component. Why: A completed pick card needs a checkmark glyph. How: This renders the 'check' icon only while entRecObj.done is true.

					) }

				</button>


			) }
			<div className='today-card-body'>{ /* What: Card Body Div Element. Why: The meta row and name row (or its editable field) read as one grouped block. How: This wraps the meta row and either the name field or the plain name div below. */ }


				<div className='today-card-meta'>{ /* What: Card Meta Div Element. Why: The picker's own name needs a consistent meta-row slot. How: This wraps the picker-name span below. */ }


					<span className='meta-picker'>{ picRecObj.name }</span>{ /* What: Meta Picker Span Element. Why: The user needs to see which picker produced this item. How: This renders picRecObj's own name. */ }


				</div>


				{ isaEdiBoo ? ( // What: Name Editing Check. Why: The name area swaps between a live input and plain text depending on whether the row is being renamed. How: This renders the input while isaEdiBoo is true, the plain name div otherwise.


					<input
						className='entry-card-name-input'
						type='text'
						value={ curIteObj.name }
						maxLength={ 60 }
						placeholder='Item name'
						autoComplete='off'
						aria-label='Item name'
						autoFocus
						onClick={ ( cliEveObj ) => cliEveObj.stopPropagation() }
						onChange={ ( chaEveObj ) => onRenFun( chaEveObj.target.value ) }
						onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Enter' ) keyEveObj.currentTarget.blur(); } }
					/> // What: Entry Card Name Input Element. Why: This is the actual editable field for renaming the item in place. How: This is wired to onRenFun on every change, committed by blurring on Enter.


				) : ( // What: Plain Name Branch. Why: Outside editing, the plain non-editable name div belongs here instead. How: This renders the else branch, taken while isaEdiBoo is false.


					<div className='today-card-name'>{ curIteObj.name }</div> // What: Card Name Div Element. Why: Outside the inline rename field, the item's own name just displays plainly. How: This renders curIteObj's own name.


				) }


			</div>
			{ !ediModBoo && ( // What: Card Actions Visibility Check. Why: Edit Mode replaces the whole actions strip with the drag grip above, so it has nothing left to show here. How: This renders the actions strip only while ediModBoo is false.


				<div className='today-card-actions'>{ /* What: Card Actions Div Element. Why: An ordinary pick row's own re-roll/skip/edit controls sit together. How: This wraps a working-or-disabled Re-Roll, a working-or-disabled Skip, and an always-working Edit toggle. */ }


					{ canRerBoo ? ( // What: Reroll Availability Check. Why: Re-Roll's own working control only makes sense while canRerBoo actually allows it. How: This renders the working button while canRerBoo is true, an explained disabled one otherwise.


						<button
							className={ `icon-btn ${ isaRolBoo ? 'is-spinning' : '' }` }
							aria-label='Re-Roll'
							title='Re-Roll'
							onClick={ ( cliEveObj ) => { cliEveObj.stopPropagation(); onRerFun( entRecObj, picRecObj ); } }
						>{ /* What: Reroll Icon Button Element. Why: This is the actual working re-roll control, available whenever canRerBoo allows it. How: This calls onRerFun, spinning its own icon while isaRolBoo is true. */ }


							<IcoSvgCom
								name='refresh'
								size={ 14 }
							/>{ /* What: Icon Svg Component. Why: The Re-Roll action needs a recognizable glyph. How: This renders the 'refresh' icon at a fixed size. */ }


						</button>


					) : ( // What: Disabled Reroll Branch. Why: A blocked re-roll needs an explained disabled control instead. How: This renders the else branch, taken while canRerBoo is false.


						<InfTipCom
							className='icon-btn is-disabled'
							label={ actRerStr }
							action='Re-Roll'
						>

							<IcoSvgCom
								name='refresh'
								size={ 14 }
							/>{ /* What: Icon Svg Component. Why: The disabled Re-Roll action still needs its own recognizable glyph. How: This renders the 'refresh' icon at a fixed size. */ }

						</InfTipCom> // What: Info Tip Component. Why: A blocked re-roll (too few candidates, or already completed) still needs to explain itself. How: This wraps a disabled-looking refresh icon with actRerStr.


					) }
					{ entDonBoo ? ( // What: Entry Done Check. Why: Skip only makes sense while the row isn't already completed. How: This renders an explained disabled Skip while entDonBoo is true, the working button otherwise.


						<InfTipCom
							className='icon-btn is-disabled'
							label={ donSkiStr }
							action='Skip'
						>

							<IcoSvgCom
								name='skip'
								size={ 15 }
							/>{ /* What: Icon Svg Component. Why: The disabled Skip action still needs its own recognizable glyph. How: This renders the 'skip' icon at a fixed size. */ }

						</InfTipCom> // What: Info Tip Component. Why: A completed row's own skip is explained rather than removed, matching re-roll's own lockout above. How: This wraps a disabled-looking skip icon with donSkiStr.


					) : ( // What: Working Skip Branch. Why: An uncompleted row needs its own real, working Skip control instead. How: This renders the else branch, taken while entDonBoo is false.


						<button
							className='icon-btn'
							aria-label='Skip'
							title='Skip'
							onClick={ ( cliEveObj ) => { cliEveObj.stopPropagation(); onSkiFun( entRecObj.eid ); } }
						>{ /* What: Skip Icon Button Element. Why: This is the actual working skip control, available whenever the row is not yet completed. How: This calls onSkiFun with entRecObj's own eid. */ }


							<IcoSvgCom
								name='skip'
								size={ 15 }
							/>{ /* What: Icon Svg Component. Why: The Skip action needs a recognizable glyph. How: This renders the 'skip' icon at a fixed size. */ }


						</button>


					) }
					<button
						className={ `icon-btn ${ isaEdiBoo ? 'is-on' : '' }` }
						aria-label='Edit'
						title='Edit'
						aria-expanded={ isaEdiBoo }
						onClick={ ( cliEveObj ) => { cliEveObj.stopPropagation(); onEdiFun(); } }
					>{ /* What: Edit Icon Button Element. Why: Edit always works, regardless of completion, unlike re-roll/skip. How: This calls onEdiFun, toggling isaEdiBoo. */ }


						<IcoSvgCom
							name='edit'
							size={ 15 }
						/>{ /* What: Icon Svg Component. Why: The Edit action needs a recognizable glyph. How: This renders the 'edit' icon at a fixed size. */ }


					</button>


				</div>


			) }


		</article>


	);

	// #endregion Real Pick Branch


}

// #endregion EntCarCom



// #region PagTouCom

/**
 * PagTouCom = Page Tour Card Component
 *
 * @summary
 * A "Page Tours" launcher card: same shape/behavior as a picker's
 * tutorial card (persistent, checked/unchecked toggle, Play/X, see
 * EntCarCom's own tutorial branch above), just with no sample picker/
 * task backing it: no data to finish/skip/cancel, only the checklist
 * bookkeeping itself.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.touRecObj   - Tour Record Object: The page-tour manifest entry
 *                            this card offers.
 * @param props.staAppObj   - State App Object: The shared app state.
 * @param props.actStoObj   - Action Store Object: The shared app actions.
 * @param props.onPlaTutFun - On Play Tutorial Function: Starts this page tour.
 * @param props.onUncTutFun - On Uncheck Tutorial Function: Un-resolves this
 *                            page tour's own checklist entry.
 * @param props.cheExiBoo   - Check Existing Boolean: Whether the checklist's
 *                            own closing exit animation is currently playing.
 *
 * @returns This card's own article element.
 *
 * @example
 * ```tsx
 * PagTouCom({ touRecObj, staAppObj, ... }) // => <PagTouCom />
 * ```
 *
*/

function PagTouCom ( { tour : touRecObj, state : staAppObj, actions : actStoObj, onPlayTutorial : onPlaTutFun, onUncheckTutorial : onUncTutFun, checklistExiting : cheExiBoo } ) {


	const tutDonBoo = !!ONB_CHE_OBJ.entLooFun( staAppObj, touRecObj.id ); // What: Tutorial Done Boolean. Why: A resolved page-tour card renders/behaves differently from a pending one. How: This checks ONB_CHE_OBJ for an existing entry against touRecObj's own id.

	const onRowCliFun = ( cliEveObj ) => { // What: On Row Click Function. Why: Clicking anywhere on the card (other than its own actions area) should start or un-resolve this tour. How: This checks for a click inside the actions area first, then dispatches to onUncTutFun or onPlaTutFun based on tutDonBoo.


		if ( cliEveObj.target.closest( '.today-card-actions' ) ) return;

		if ( tutDonBoo ) onUncTutFun( 'pageTour', touRecObj.id );

		else onPlaTutFun( 'pageTour', touRecObj.id );


	};

	return (


		<article
			className={ ` today-card   today-card--tutorial   ${ tutDonBoo ? 'is-done' : '' }   ${ cheExiBoo ? 'is-removing' : '' } ` }
			onClick={ onRowCliFun }
		>{ /* What: Page Tour Card Article Element. Why: This is PagTouCom's own root. How: This renders a Play/Undo check button, the meta/name body, and (while unresolved) a Cancel action. */ }


			{ tutDonBoo ? ( // What: Tutorial Done Check. Why: A resolved page-tour card's checkbox behaves differently from a pending one. How: This renders the undo-check button while tutDonBoo is true, the play-check button otherwise.


				<button
					type='button'
					className='check'
					aria-pressed='true'
					aria-label={ `Undo ${ touRecObj.label } tour` }
					onClick={ ( cliEveObj ) => { cliEveObj.stopPropagation(); onUncTutFun( 'pageTour', touRecObj.id ); } }
				>{ /* What: Undo Check Button Element. Why: A resolved page-tour card can be un-resolved directly from its own check button, unlike a pending one. How: This calls onUncTutFun, scoped to 'pageTour'. */ }


					<span
						className='check-ripple'
						aria-hidden='true'
					/>{ /* What: Check Ripple Span Element. Why: A completed check needs the same ripple flourish every other done row gets. How: This is a purely decorative, empty span. */ }

					<IcoSvgCom
						name='check'
						size={ 14 }
					/>{ /* What: Icon Svg Component. Why: A resolved card needs a checkmark glyph. How: This renders the 'check' icon at a fixed size. */ }


				</button>


			) : ( // What: Play Check Branch. Why: A pending page tour needs its own play-to-start checkbox instead. How: This renders the else branch, taken while tutDonBoo is false.


				<button
					type='button'
					className='check'
					aria-label={ `Start the ${ touRecObj.label } tour` }
					onClick={ ( cliEveObj ) => { cliEveObj.stopPropagation(); onPlaTutFun( 'pageTour', touRecObj.id ); } }
				>{ /* What: Play Check Button Element. Why: A pending page-tour card's own check button starts the tour instead of toggling done. How: This calls onPlaTutFun, scoped to 'pageTour'. */ }


					<IcoSvgCom
						name='play'
						size={ 13 }
					/>{ /* What: Icon Svg Component. Why: A pending card needs a play glyph inviting the user to start the tour. How: This renders the 'play' icon at a fixed size. */ }


				</button>


			) }
			<div className='today-card-body'>{ /* What: Card Body Div Element. Why: The meta row and name row read as one grouped block. How: This wraps the meta row and the name div below. */ }


				<div className='today-card-meta'>{ /* What: Card Meta Div Element. Why: The tour's own label and its optional time estimate sit together. How: This wraps the label span and, when one exists, the time estimate. */ }


					<span className='meta-picker'>{ touRecObj.label } Tour</span>{ /* What: Meta Picker Span Element. Why: The user needs to see which page tour this card offers. How: This renders touRecObj's own label plus the literal word "Tour". */ }


					{ touRecObj.time && ( // What: Time Estimate Check. Why: Not every page-tour card has a manually-timed estimate. How: This renders the dot/time pair only while touRecObj's own time is set.


						<React.Fragment>{ /* What: Time Estimate Fragment Element. Why: The separator dot and the time text are true siblings with no shared wrapper of their own. How: This groups both spans without adding an extra DOM node. */ }


							<span className='meta-dot'>&middot;</span>{ /* What: Meta Dot Span Element. Why: The label and the time estimate need a small visual separator between them. How: This renders a literal middle-dot character. */ }

							<span className='meta-time'>{ touRecObj.time }</span>{ /* What: Meta Time Span Element. Why: A time estimate helps the user judge how long this tour takes. How: This renders touRecObj's own time. */ }


						</React.Fragment>


					) }

				</div>


				<div className='today-card-name'>Take a quick tour of the { touRecObj.label } page</div>{ /* What: Card Name Div Element. Why: This is the card's own call-to-action text. How: This renders the fixed phrasing with touRecObj's own label interpolated. */ }


			</div>
			{ !tutDonBoo && ( // What: Cancel Action Visibility Check. Why: A resolved card has nothing left to cancel. How: This renders the Cancel action only while tutDonBoo is false.


				<div className='today-card-actions'>{ /* What: Card Actions Div Element. Why: A pending card offers a Cancel action distinct from resolving it. How: This wraps the single Cancel icon-button below. */ }


					<button
						className='icon-btn'
						aria-label='Cancel tutorial'
						title='Cancel'
						onClick={ ( cliEveObj ) => { cliEveObj.stopPropagation(); actStoObj.setChecklistItem( touRecObj.id, { status : 'cancelled' } ); } }
					>{ /* What: Cancel Icon Button Element. Why: Cancelling marks this card resolved without actually finishing the tour. How: This calls actStoObj.setChecklistItem with a 'cancelled' status. */ }


						<IcoSvgCom
							name='x'
							size={ 15 }
						/>{ /* What: Icon Svg Component. Why: The Cancel action needs a recognizable dismiss glyph. How: This renders the 'x' icon at a fixed size. */ }


					</button>


				</div>


			) }


		</article>


	);


}

// #endregion PagTouCom



// #region AppFeaCom

/**
 * AppFeaCom = App Feature Card Component
 *
 * @summary
 * An "App Features" launcher card: same shape/behavior as a PagTouCom
 * card above, but backed by its own state.onboarding.appFeatures map
 * instead of the checklist, and with no cheExiBoo celebration-exit
 * animation to key off (App Features isn't part of that "closing card"
 * flow at all, see showAppFeatures' own comment in TabToday for why).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.feaRecObj    - Feature Record Object: The App Features manifest
 *                             entry this card offers.
 * @param props.staAppObj    - State App Object: The shared app state.
 * @param props.actStoObj    - Action Store Object: The shared app actions.
 * @param props.onPlaTutFun  - On Play Tutorial Function: Starts this App
 *                             Feature's own tutorial.
 * @param props.onUncFeaFun  - On Uncheck Feature Function: Un-resolves this
 *                             App Feature.
 *
 * @returns This card's own article element.
 *
 * @example
 * ```tsx
 * AppFeaCom({ feaRecObj, staAppObj, ... }) // => <AppFeaCom />
 * ```
 *
*/

function AppFeaCom ( { feature : feaRecObj, state : staAppObj, actions : actStoObj, onPlayTutorial : onPlaTutFun, onUncheckAppFeature : onUncFeaFun } ) {


	const tutDonBoo = !!( staAppObj.onboarding && staAppObj.onboarding.appFeatures && staAppObj.onboarding.appFeatures[ feaRecObj.ideStr ] ); // What: Tutorial Done Boolean. Why: A resolved App Feature card renders/behaves differently from a pending one. How: This reads staAppObj's own onboarding.appFeatures map for feaRecObj's own ideStr.
	const blkRsnStr = !tutDonBoo ? bloReaFun( feaRecObj.ideStr, staAppObj ) : null; // What: Blocked Reason String. Why: A still-pending card can require an earlier one first, and needs its own explanation string when it does. How: This calls bloReaFun only while tutDonBoo is false, otherwise null.

	const onRowCliFun = ( cliEveObj ) => { // What: On Row Click Function. Why: Clicking anywhere on the card (other than its own actions area) should start or un-resolve this feature, unless it is currently blocked. How: This checks the actions-area exclusion and the blocked guard first, then dispatches to onUncFeaFun or onPlaTutFun based on tutDonBoo.


		if ( cliEveObj.target.closest( '.today-card-actions' ) ) return;

		if ( blkRsnStr ) return;

		if ( tutDonBoo ) onUncFeaFun( feaRecObj.ideStr );

		else onPlaTutFun( 'appFeature', feaRecObj.ideStr );


	};

	return (


		<article
			className={ ` today-card   today-card--tutorial   ${ tutDonBoo ? 'is-done' : '' }   ${ blkRsnStr ? 'is-needed' : '' } ` }
			onClick={ onRowCliFun }
		>{ /* What: App Feature Card Article Element. Why: This is AppFeaCom's own root. How: This renders a Play/Undo/blocked check button, the meta/name body, and (while unresolved) a Cancel action. */ }


			{ tutDonBoo ? ( // What: Tutorial Done Check. Why: A resolved App Feature card's checkbox behaves differently from a pending one. How: This renders the undo-check button while tutDonBoo is true, otherwise one of the 2 branches below.


				<button
					type='button'
					className='check'
					aria-pressed='true'
					aria-label={ `Undo ${ feaRecObj.labStr } tutorial` }
					onClick={ ( cliEveObj ) => { cliEveObj.stopPropagation(); onUncFeaFun( feaRecObj.ideStr ); } }
				>{ /* What: Undo Check Button Element. Why: A resolved App Feature card can be un-resolved directly from its own check button, unlike a pending one. How: This calls onUncFeaFun. */ }


					<span
						className='check-ripple'
						aria-hidden='true'
					/>{ /* What: Check Ripple Span Element. Why: A completed check needs the same ripple flourish every other done row gets. How: This is a purely decorative, empty span. */ }

					<IcoSvgCom
						name='check'
						size={ 14 }
					/>{ /* What: Icon Svg Component. Why: A resolved card needs a checkmark glyph. How: This renders the 'check' icon at a fixed size. */ }


				</button>


			) : blkRsnStr ? ( // What: Blocked Feature Check. Why: A pending, blocked feature needs an explained disabled control instead of a working one. How: This renders the disabled InfTipCom while blkRsnStr holds a reason, the real play-check button otherwise.


				<InfTipCom
					className='check is-disabled'
					action={ `Start the ${ feaRecObj.labStr } tutorial` }
					label={ blkRsnStr }
				>{ /* What: Info Tip Component. Why: A blocked feature's own disabled check button still needs to explain WHY it is blocked. How: This wraps a disabled-looking play icon with blkRsnStr. */ }


					<IcoSvgCom
						name='play'
						size={ 13 }
					/>{ /* What: Icon Svg Component. Why: The disabled check button still needs its own recognizable play glyph. How: This renders the 'play' icon at a fixed size. */ }


				</InfTipCom>


			) : ( // What: Play Check Branch. Why: A pending, unblocked feature needs its own real play-to-start checkbox instead. How: This renders the else branch, taken while blkRsnStr is falsy.


				<button
					type='button'
					className='check'
					aria-label={ `Start the ${ feaRecObj.labStr } tutorial` }
					onClick={ ( cliEveObj ) => { cliEveObj.stopPropagation(); onPlaTutFun( 'appFeature', feaRecObj.ideStr ); } }
				>{ /* What: Play Check Button Element. Why: A pending, unblocked App Feature card's own check button starts its tutorial instead of toggling done. How: This calls onPlaTutFun, scoped to 'appFeature'. */ }


					<IcoSvgCom
						name='play'
						size={ 13 }
					/>{ /* What: Icon Svg Component. Why: A pending card needs a play glyph inviting the user to start its tutorial. How: This renders the 'play' icon at a fixed size. */ }


				</button>


			) }
			<div className='today-card-body'>{ /* What: Card Body Div Element. Why: The meta row and name row read as one grouped block. How: This wraps the meta row and the name div below. */ }


				<div className='today-card-meta'>{ /* What: Card Meta Div Element. Why: The feature's own page label and its optional time estimate sit together. How: This wraps the page-label span and, when one exists, the time estimate. */ }


					<span className='meta-picker'>{ PAG_LAB_OBJ[ feaRecObj.pagStr ] }</span>{ /* What: Meta Picker Span Element. Why: The user needs to see which page this App Feature lives on. How: This looks up feaRecObj's own pagStr in PAG_LAB_OBJ. */ }


					{ feaRecObj.timStr && ( // What: Time Estimate Check. Why: Not every App Feature card has a manually-timed estimate. How: This renders the dot/time pair only while feaRecObj's own timStr is set.


						<React.Fragment>{ /* What: Time Estimate Fragment Element. Why: The separator dot and the time text are true siblings with no shared wrapper of their own. How: This groups both spans without adding an extra DOM node. */ }


							<span className='meta-dot'>&middot;</span>{ /* What: Meta Dot Span Element. Why: The page label and the time estimate need a small visual separator between them. How: This renders a literal middle-dot character. */ }

							<span className='meta-time'>{ feaRecObj.timStr }</span>{ /* What: Meta Time Span Element. Why: A time estimate helps the user judge how long this tutorial takes. How: This renders feaRecObj's own time. */ }


						</React.Fragment>


					) }

				</div>


				<div className='today-card-name'>{ feaRecObj.labStr }</div>{ /* What: Card Name Div Element. Why: This is the card's own main display text. How: This renders feaRecObj's own label directly. */ }


			</div>
			{ !tutDonBoo && ( // What: Cancel Action Visibility Check. Why: A resolved card has nothing left to cancel. How: This renders the Cancel action only while tutDonBoo is false.


				<div className='today-card-actions'>{ /* What: Card Actions Div Element. Why: A pending card offers a Cancel action distinct from resolving it. How: This wraps the single Cancel icon-button below. */ }


					<button
						className='icon-btn'
						aria-label='Cancel tutorial'
						title='Cancel'
						onClick={ ( cliEveObj ) => { cliEveObj.stopPropagation(); actStoObj.setAppFeatureItem( feaRecObj.ideStr, { status : 'cancelled' } ); } }
					>{ /* What: Cancel Icon Button Element. Why: Cancelling marks this card resolved without actually finishing its tutorial. How: This calls actStoObj.setAppFeatureItem with a 'cancelled' status. */ }


						<IcoSvgCom
							name='x'
							size={ 15 }
						/>{ /* What: Icon Svg Component. Why: The Cancel action needs a recognizable dismiss glyph. How: This renders the 'x' icon at a fixed size. */ }


					</button>


				</div>


			) }


		</article>


	);


}

// #endregion AppFeaCom



// #region TabToday

/**
 * TabToday = Tab Today
 *
 * @summary
 * The Today tab: a daily generated, grouped todo list built from every
 * daily picker plus manual reminders, alongside the onboarding mini-tour
 * checklist, Page Tours, and App Features sections. Owns the completion
 * ring/streak celebration, Edit Mode drag-to-reorder, the regenerate
 * reel-cascade animation, and the scheduled daily auto-generator. See
 * this file's own header comment for the overall layout this renders.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.state                  - State: The shared app state.
 * @param props.actions                - Actions: The shared app actions.
 * @param props.onHome                 - On Home: Returns to the Today tab
 *                                       (used by the brand mark).
 * @param props.onNavTab               - On Nav Tab: Switches to a different
 *                                       tab.
 * @param props.onStartPickerTour      - On Start Picker Tour: Starts a
 *                                       sample-picker mini-tour at the app
 *                                       level (some steps navigate away from
 *                                       Today).
 * @param props.onStartPageTour        - On Start Page Tour: Starts an "Explore
 *                                       the page" tour at the app level.
 * @param props.onStartAppFeatureTour  - On Start App Feature Tour: Starts an
 *                                       App Features tutorial at the app
 *                                       level.
 *
 * @returns The Today tab's entire rendered content: its header, its
 * grouped list (or empty-state CTAs), and any reminder mini-tour/App
 * Features intro overlay currently running.
 *
 * @example
 * ```tsx
 * TabToday({ state, actions, onHome, onNavTab, ... }) // => <TabToday />
 * ```
 *
*/

function TabToday ( { state, actions, onHome, onNavTab, onStartPickerTour, onStartPageTour, onStartAppFeatureTour } ) {


	const todBodRef = React.useRef( null ); // What: Today Body Reference. Why: Today does not share app.jsx's shared .main-inner wrapper (see .today-body's own comment below), so it measures/caches its own flourish instance instead of reusing a ref threaded down from there. How: This is attached to the .today-body div's own ref prop below and read by BacFloCom to measure it.

	/**
	 * Help Mode Setup = Help Mode Setup Rationale
	 *
	 * @summary
	 * Local, resets to off on every remount (tab switch), which is
	 * exactly the "navigating away closes it, the page you land on
	 * doesn't inherit it" behavior the design called for. Content lives
	 * in help-content.jsx's TOD_HEL_ARR rather than inline here,
	 * same as every other tab; Today needs no disposable sample data
	 * seeded for it, since every target it points at either is always-
	 * present UI chrome or gracefully renders no badge if the user has no
	 * entries yet, unlike Pickers/Data/Stats.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const [ hlpOnBoo, setHlpOnBoo ] = React.useState( false );            // What: Help On Boolean And Setter. Why: See the doc comment just above. How: This is toggled by the header's own HelButCom.
	const hlpExiFun                 = React.useCallback( () => setHlpOnBoo( false ), [] ); // What: Help Exit Function. Why: HelOveCom needs a stable exit handler that closes help mode. How: This calls setHlpOnBoo with false; an empty dependency array means this is created once.

	const groArr = React.useMemo( () => groEntFun( state ), [ state ] ); // What: Group Array. Why: This is the actual bucketed/sorted group list the content column and rail both render from. How: This calls groEntFun, recomputed whenever state itself changes.

	/**
	 * blkOrdArr = Block Order Array
	 *
	 * @summary
	 * The unified block order: the Reminders block (the '__reminders'
	 * sentinel) plus the picker groups, sequenced by state.groupOrder.
	 * Drives both the rail and the content column so Reminders can be
	 * dragged among the groups in Edit Mode.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/
	const blkOrdArr = React.useMemo( () => { // What: Block Order Memo. Why: See the doc comment just above. How: This walks state.groupOrder, keeping every recognized group/sentinel and appending anything new, then defaults Page Tours to right after Reminders the first time it appears.


		const savOrdArr = state.groupOrder || [];        // What: Saved Order Array. Why: The user's own Edit Mode drags are the primary source of block order. How: This reads state.groupOrder, falling back to an empty array.
		const groNamArr = groArr.map( ( curGroObj ) => curGroObj.name ); // What: Group Name Array. Why: The walk below needs a fast way to confirm a saved name still refers to a real, currently-rendered group. How: This maps groArr down to just each group's own name.
		const seeNamSet = new Set();                     // What: Seen Name Set. Why: The push helper below needs a fast way to avoid collecting the same block twice. How: This is checked and added to by pshFun.
		const ordArr    = [];                             // What: Order Array. Why: This collects the final block order built up by the passes below. How: This is pushed to by pshFun and returned at the end of this memo.

		const pshFun = ( curIdeStr ) => { if ( !seeNamSet.has( curIdeStr ) ) { seeNamSet.add( curIdeStr ); ordArr.push( curIdeStr ); } }; // What: Push Function. Why: Every pass below needs the exact same dedupe-then-collect step. How: This adds curIdeStr to both seeNamSet and ordArr only the first time it is seen.

		if ( !savOrdArr.includes( '__reminders' ) ) pshFun( '__reminders' ); // What: Reminders Default Guard. Why: A saved order predating the Reminders sentinel still needs Reminders to lead. How: This pushes '__reminders' up front only when savOrdArr doesn't already mention it.

		for ( const curOrdStr of savOrdArr ) { // What: Saved Order Pass. Why: Whatever the user has already positioned (Reminders, Page Tours, or a real group) keeps that position. How: This pushes each saved entry that is either a recognized sentinel or a currently-real group name.


			if ( curOrdStr === '__reminders' || curOrdStr === '__pageTours' ) pshFun( curOrdStr );

			else if ( groNamArr.includes( curOrdStr ) ) pshFun( curOrdStr );


		}

		for ( const curGroNamStr of groNamArr ) pshFun( curGroNamStr ); // What: First-Occurrence Pass. Why: A real group not yet in the saved order still needs a stable position. How: This appends any not-yet-collected group name in groArr's own order.

		pshFun( '__reminders' ); // What: Reminders Trailing Guard. Why: On the very first render (an empty savOrdArr), the front-guard above never ran, so this second call is what actually seeds Reminders at all; pshFun's own dedupe makes this a no-op on every later render. How: This pushes '__reminders' again, harmlessly, if it somehow still isn't collected.

		if ( !seeNamSet.has( '__pageTours' ) ) ordArr.splice( ordArr.indexOf( '__reminders' ) + 1, 0, '__pageTours' ); // What: Page Tours Default Splice. Why: Page Tours defaults to right after Reminders the first time it shows up (e.g. a saved order predating Page Tours entirely), so it needs no backfill in migrate(); once the user drags it in Edit Mode, its own saved position takes over like any other group. How: This splices '__pageTours' in right after '__reminders' only when it wasn't already collected above.


		return ordArr; // What: Block Order Return. Why: The rail and content column both need this final sequence. How: This returns the same array built by the passes above.


	}, [ state.groupOrder, groArr ] ); // What: Effect Dependency Array. Why: This only needs recomputing when the user's own saved order changes, or when the real group list itself changes shape. How: state.groupOrder is the saved-order source; groArr is the real-group source.

	const groByNamObj = React.useMemo( () => { // What: Group By Name Object. Why: The content column below needs to resolve a block id straight to its own group record, not re-scan groArr on every row. How: This builds a { name: group } lookup once per groArr change.


		const namMapObj = {};                                             // What: Name Map Object. Why: The forEach below needs a plain object to populate. How: This starts empty and is written to just below.
		groArr.forEach( ( curGroObj ) => { namMapObj[ curGroObj.name ] = curGroObj; } ); // What: Name Map Populate. Why: Every real group needs its own entry in the lookup. How: This keys namMapObj by curGroObj's own name.
		return namMapObj; // What: Name Map Return. Why: The caller needs the populated lookup. How: This returns the same object just populated above.


	}, [ groArr ] );

	const entArr = React.useMemo( () => { // What: Entry Array. Why: Every count below needs today's own entries with hidden-picker rows already excluded, matching groEntFun's own exclusion so counts and rendered rows never disagree. How: This filters state.today.entries against the current hidden-picker id set.


		const hidPicSet = new Set( state.pickers.filter( ( curPicObj ) => curPicObj.hidden ).map( ( curPicObj ) => curPicObj.id ) ); // What: Hidden Picker Set. Why: An entry belonging to a still-hidden picker (see the hidden flag in store.jsx's migrate()) must be excluded from every count here. How: This collects every currently-hidden picker's own id.
		return state.today.entries.filter( ( curEntObj ) => !curEntObj.pickerId || !hidPicSet.has( curEntObj.pickerId ) ); // What: Entry Filter Return. Why: This is the actual filtered list every count below reads from. How: This keeps a day-off entry (no pickerId) and any entry whose own pickerId isn't in hidPicSet.


	}, [ state.today.entries, state.pickers ] );

	/**
	 * Reminder Counts = Reminder Ring/Rail Count Rationale
	 *
	 * @summary
	 * Manual reminders due today join the picker entries in the ring +
	 * rail totals (they count toward completion + streak, but never
	 * toward Stats). Visibility honors each type's weekend/holiday
	 * exclusions; the ring only counts reminders whose type has "include
	 * in completion ring" on. Pinned to the last generation (not live
	 * "now"), via TASKS.anchorDate, so these totals always agree with
	 * what RemSecCom is actually showing.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const genAtStr    = state.today && state.today.generatedAt;                                                                   // What: Generated At String. Why: The anchor below needs to know the last real generation timestamp, not the live clock. How: This reads state.today.generatedAt.
	const remAncObj   = React.useMemo( () => TASKS.anchorDate( genAtStr ), [ genAtStr ] );                                        // What: Reminders Anchor Object. Why: See the doc comment just above. How: This calls TASKS.anchorDate with genAtStr.
	const dueTasArr   = React.useMemo( () => TASKS.visibleToday( state.tasks, state.reminderOpts, state.holidays, remAncObj ), [ state.tasks, state.reminderOpts, state.holidays, remAncObj ] ); // What: Due Task Array. Why: This is the real, currently-visible reminder list. How: This calls TASKS.visibleToday against remAncObj.
	const visDonNum   = dueTasArr.filter( ( curTasObj ) => TASKS.isDoneToday( curTasObj, remAncObj ) ).length;                     // What: Visible Done Number. Why: The rail's own Reminders pill needs a done count covering every VISIBLE due reminder, ring-eligible or not. How: This counts dueTasArr entries that TASKS.isDoneToday already reports done.
	const rngTasArr   = dueTasArr.filter( ( curTasObj ) => TASKS.optsFor( curTasObj, state.reminderOpts ).ring );                  // What: Ring Task Array. Why: Only a reminder type with "include in completion ring" on should ever affect the ring itself. How: This filters dueTasArr down to just those.
	const remDonNum   = rngTasArr.filter( ( curTasObj ) => TASKS.isDoneToday( curTasObj, remAncObj ) ).length;                     // What: Reminders Done Number. Why: The completion ring itself only ever counts ring-eligible reminders. How: This counts rngTasArr entries that TASKS.isDoneToday already reports done.

	/**
	 * Mini-Tour Checklist Gates = Mini-Tour Checklist Gate Rationale
	 *
	 * @summary
	 * Mini-tour launcher cards (pickers + reminders + Page Tours + the
	 * closing Generate card) join the ring/rail totals the whole time
	 * they're on screen, see groEntFun's own copy of this same gate. Kept
	 * additive/separate from entArr/dueTasArr (rather than merged in) so
	 * streak reconciliation and Stats stay untouched by tutorial-card
	 * completion, see store.jsx's reconcileStreak, which only ever reads
	 * state.today.entries/state.tasks.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const cheDonBoo   = !!( state.onboarding && state.onboarding.checklistDone ); // What: Checklist Done Boolean. Why: This decides whether the mini-tour checklist phase should still be showing at all. How: This reads state.onboarding.checklistDone.
	const mainEndBoo  = state.pickers.some( ( curPicObj ) => curPicObj.hidden && ONB_SPI_ARR.includes( curPicObj.id ) ) // What: Main Tour Ended Boolean. Why: Whether the main Welcome Tour has concluded (sample pickers/tasks flip hidden exactly once, at that tour's last step) decides whether the checklist phase should be considered at all, independent of cheDonBoo. How: This is true once any sample picker OR sample task is already flagged hidden.
		|| ( state.tasks || [] ).some( ( curTasObj ) => curTasObj.hidden && ONB_STI_ARR.includes( curTasObj.id ) );
	const shwCheBoo   = mainEndBoo && !cheDonBoo; // What: Show Checklist Boolean. Why: The whole checklist phase (launcher cards, Page Tours, the closing Generate card) should only show between the main tour ending and the checklist actually concluding. How: This combines mainEndBoo with the negation of cheDonBoo.

	/**
	 * rptVisBoo = Replay-Page-Tours Visible Boolean
	 *
	 * @summary
	 * Page Tours cards keep offering themselves post-checklistDone too,
	 * same "Replay Tour resets each item's own entry but never
	 * checklistDone itself" reasoning as groEntFun's own picker-sample
	 * cards; no name-collision concept applies here (a page tour isn't
	 * named after anything the user could "already have"), just whether
	 * it's still unresolved. Kept separate from shwCheBoo since shwCheBoo
	 * ALSO drives the closing Generate card's entire real side-effect
	 * chain (see the generateCardResolved effect further below); reusing
	 * it here would risk resurrecting that "auto-generate a fresh list"
	 * flow, which has nothing to run against a second time (the user
	 * already has a real list).
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const rptVisBoo = cheDonBoo && mainEndBoo && ONB_EPT_ARR.some( ( curTouObj ) => !ONB_CHE_OBJ.entLooFun( state, curTouObj.id ) ); // What: Replay-Page-Tours Visible Boolean. Why: See the doc comment just above. How: This is true only post-checklistDone, post-mainEndBoo, while at least one page tour is still unresolved.

	/**
	 * App Features Gates = App Features Section Gate Rationale
	 *
	 * @summary
	 * App Features (see onboarding-app-features.jsx) is a separate,
	 * later-stage set of tutorials shown only AFTER the user has
	 * generated their first real todo list; once resolved (Play-to-
	 * finish, X to cancel, same as any other tutorial card) it never
	 * comes back on its own, and the whole section just stops rendering
	 * once every one of them is resolved. Mutually exclusive with
	 * shwCheBoo by construction (cheDonBoo can only ever be true once
	 * shwCheBoo's own gate has already gone false), so there is no
	 * ordering conflict to resolve against Page Tours, but cheDonBoo
	 * itself, unlike shwCheBoo, never resets back to false on a Replay
	 * Tour (see onboarding-welcome-tour.jsx), which is exactly why these
	 * need Settings' replay button to explicitly clear appFeatures back to
	 * {} to reappear, rather than reappearing automatically the way the
	 * checklist-driven cards do.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const feaStaObj  = ( state.onboarding && state.onboarding.appFeatures ) || {}; // What: Feature State Object. Why: Every App Features check below needs this same resolved-or-empty map. How: This reads state.onboarding.appFeatures, falling back to an empty object.
	const fsrFlaBoo  = !!( state.onboarding && state.onboarding.appFeaturesSectionResolved ); // What: Feature-Section-Resolved Flag Boolean. Why: A persisted snapshot, only ever flipped true inside generate() itself, deliberately NOT a live check during the user's ORIGINAL first-ever pass, so finishing the last of the 8 tutorials doesn't yank the whole section out from under them mid-session with no natural boundary; it stays visible, fully checked, until their NEXT real generation. How: This reads state.onboarding.appFeaturesSectionResolved.
	const fecDonBoo  = !!( state.onboarding && state.onboarding.appFeaturesEverCompleted ); // What: Feature-Ever-Completed Done Boolean. Why: Unlike fsrFlaBoo, this is NEVER reset by Replay Tour, set once alongside it and staying true forever after, same "permanent, one-way" semantics as cheDonBoo itself; it distinguishes "this is the user's ORIGINAL, first-ever pass" from "this is a REPLAY", since both share the identical feaStaObj shape otherwise. How: This reads state.onboarding.appFeaturesEverCompleted.

	/**
	 * shwFeaBoo = Show App Features Boolean
	 *
	 * @summary
	 * The section (and its rail nav entry, gated on this same boolean
	 * further down) needs a DIFFERENT disappearance rule depending on
	 * which of the two phases above this is. First-time: fsrFlaBoo stays
	 * up, fully checked, until the next real generation, so the user gets
	 * to see it "all done" rather than have it vanish out from under them
	 * mid-click. Replay: a resolved card already vanishes from the LIST
	 * the instant it resolves (see the render map further down), one at a
	 * time, same as every other replay-continuation card, so the
	 * section/nav-button itself should follow the exact same live rule
	 * (some still unresolved), not wait for a snapshot that (unlike
	 * first-time) has no real "next generation" moment to hang off of
	 * during a replay. Mirrors rptVisBoo's own live "some still
	 * unresolved" check above.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const shwFeaBoo = cheDonBoo && ( fecDonBoo ? APP_FEA_ARR.some( ( curFeaObj ) => !feaStaObj[ curFeaObj.ideStr ] ) : !fsrFlaBoo ); // What: Show App Features Boolean. Why: See the doc comment just above. How: This branches on fecDonBoo to pick either the live "some still unresolved" check or the negation of the first-time snapshot.

	React.useEffect( () => { emlTouObj.set( { showChecklist : shwCheBoo } ); }, [ shwCheBoo ] ); // What: Checklist Bus Publish Effect. Why: reminders.jsx's startAdd needs to hide ANY reminder created while the checklist is up, not just ones a mini-tour itself creates, so a user manually clicking "+" mid-onboarding doesn't clutter the list alongside the still-open launcher cards either (see the unhide side in the generateCardResolved effect further below). How: This republishes shwCheBoo onto the shared tour bus under its own showChecklist field.

	const pagNamStr = ( state.onboarding && state.onboarding.pageToursName ) || 'Page Tours'; // What: Page Name String. Why: The Page Tours section header needs its own, possibly user-renamed, display name. How: This reads state.onboarding.pageToursName, falling back to the fixed default.

	const pagColFun = ( rawValStr ) => { // What: Page Collision Function. Why: Page Tours has no pickers to merge into on a name collision (unlike a real group's own rename), so a collision just blocks the rename outright, checked against every real group name plus the fixed "Reminders" label, the other section header that isn't itself a real group. How: This normalizes rawValStr and checks it against every existing group/Reminders name, case-insensitively.


		const trmValStr = String( rawValStr || '' ).trim(); // What: Trimmed Value String. Why: A typed rename needs its surrounding whitespace trimmed before it is checked at all. How: This trims rawValStr, coerced to a string first.

		if ( !trmValStr ) return null; // What: Empty Value Guard. Why: An empty rename has nothing to collide with. How: This returns null early when trmValStr is empty.


		const tarNamStr = norGroFun( trmValStr ) || trmValStr;                                             // What: Target Name String. Why: The typed name needs the same normalization a real group name would get before comparison. How: This calls norGroFun, falling back to the raw trimmed value if normalization returns nothing.
		const exiGroArr = [ ...new Set( state.pickers.filter( ( curPicObj ) => curPicObj.group ).map( ( curPicObj ) => curPicObj.group ) ) ]; // What: Existing Group Array. Why: The collision check needs every real group name currently in use. How: This deduplicates every picker's own group field via a Set.

		exiGroArr.push( 'Reminders' ); // What: Reminders Name Push. Why: "Reminders" is the other fixed section header that isn't itself a real group, and still must not collide. How: This appends the literal string 'Reminders' to exiGroArr.

		const hitGroStr = exiGroArr.find( ( curGroStr ) => curGroStr.toLowerCase() === tarNamStr.toLowerCase() ); // What: Hit Group String. Why: This is the actual matching existing name, if any. How: This finds a case-insensitive match for tarNamStr within exiGroArr.

		return hitGroStr ? `A group named “${ hitGroStr }” already exists.` : null; // What: Collision Message Return. Why: The caller needs either a real error message or a clean null. How: This formats hitGroStr into the fixed collision sentence, or returns null when there was no match.


	};

	/**
	 * Tutorial/Page-Tour Counts = Replay-Continuation Count Rationale
	 *
	 * @summary
	 * Mirrors rptVisBoo: once cheDonBoo, mini-tour picker/task cards keep
	 * offering themselves (per groEntFun's and reminders.jsx's own
	 * collision-filtered checks) even though shwCheBoo itself has gone
	 * false, so these ring/rail counts need to keep counting them too, or
	 * the ring and the Reminders rail pill (which reuses these) would
	 * silently stop matching what's actually rendered on screen. During
	 * that replay continuation, though, a resolved card is no longer
	 * rendered at all (see groEntFun's own comment), so unlike the first-
	 * time phase, resolved ones must drop out of these counts entirely
	 * rather than counting toward "done" the way an unresolved-but-
	 * checked first-time card does. Collision filtering only ever applies
	 * once cheDonBoo; during the first-time phase it must stay a no-op,
	 * or completing a picker/task tutorial (which deliberately creates a
	 * same-named real picker/task, see store.jsx's addPicker/addTask)
	 * would immediately "collide" with its own result and undercount the
	 * very card it just finished.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const repActBoo = cheDonBoo && mainEndBoo; // What: Replay Active Boolean. Why: This is the shared gate every count below branches on. How: This combines cheDonBoo with mainEndBoo.

	const tutPicCouNum = ( shwCheBoo || repActBoo ) // What: Tutorial Picker Count Number. Why: See the doc comment just above. How: This counts hidden sample pickers, collision-filtered only once cheDonBoo (repActBoo), 0 while neither gate is open.
		? state.pickers.filter( ( curPicObj ) => curPicObj.hidden && ONB_SPI_ARR.includes( curPicObj.id )
			&& ( shwCheBoo || !ONB_CHE_OBJ.entLooFun( state, curPicObj.id ) )
			&& ( shwCheBoo || !state.pickers.some( ( othPicObj ) => !ONB_SPI_ARR.includes( othPicObj.id ) && othPicObj.name === curPicObj.name ) ) ).length
		: 0;
	const tutPicDonNum = shwCheBoo // What: Tutorial Picker Done Number. Why: The first-time phase counts every resolved sample picker card as done. How: This counts hidden sample pickers with an existing checklist entry, 0 outside shwCheBoo.
		? state.pickers.filter( ( curPicObj ) => curPicObj.hidden && ONB_SPI_ARR.includes( curPicObj.id ) && ONB_CHE_OBJ.entLooFun( state, curPicObj.id ) ).length
		: 0;
	const tutTasCouNum = ( shwCheBoo || repActBoo ) // What: Tutorial Task Count Number. Why: Same reasoning as tutPicCouNum, for sample reminders. How: This counts hidden sample tasks, collision-filtered only once cheDonBoo (repActBoo), 0 while neither gate is open.
		? ( state.tasks || [] ).filter( ( curTasObj ) => curTasObj.hidden && ONB_STI_ARR.includes( curTasObj.id )
			&& ( shwCheBoo || !ONB_CHE_OBJ.entLooFun( state, curTasObj.id ) )
			&& ( shwCheBoo || !( state.tasks || [] ).some( ( othTasObj ) => !ONB_STI_ARR.includes( othTasObj.id ) && othTasObj.name === curTasObj.name ) ) ).length
		: 0;
	const tutTasDonNum = shwCheBoo // What: Tutorial Task Done Number. Why: The first-time phase counts every resolved sample task card as done. How: This counts hidden sample tasks with an existing checklist entry, 0 outside shwCheBoo.
		? ( state.tasks || [] ).filter( ( curTasObj ) => curTasObj.hidden && ONB_STI_ARR.includes( curTasObj.id ) && ONB_CHE_OBJ.entLooFun( state, curTasObj.id ) ).length
		: 0;
	const pagTouCouNum = shwCheBoo ? ONB_EPT_ARR.length // What: Page Tour Count Number. Why: Same replay-continuation treatment as the picker/task counts above: still counted while rptVisBoo cards are on screen, but (matching the render map's own resolved-cards-vanish behavior) only the still-unresolved ones. How: This is every tour during shwCheBoo, only the unresolved ones during rptVisBoo, 0 otherwise.
		: rptVisBoo ? ONB_EPT_ARR.filter( ( curTouObj ) => !ONB_CHE_OBJ.entLooFun( state, curTouObj.id ) ).length
		: 0;
	const pagTouDonNum = shwCheBoo ? ONB_EPT_ARR.filter( ( curTouObj ) => ONB_CHE_OBJ.entLooFun( state, curTouObj.id ) ).length : 0; // What: Page Tour Done Number. Why: The first-time phase counts every resolved page tour as done. How: This counts resolved ONB_EPT_ARR entries, 0 outside shwCheBoo.
	const genCarCouNum = shwCheBoo ? 1 : 0; // What: Generate Card Count Number. Why: The closing Generate card only ever contributes 1 slot to the total, and only during the first-time checklist phase. How: This is 1 while shwCheBoo, otherwise 0.
	const genCarDonNum = ( shwCheBoo && ONB_CHE_OBJ.entLooFun( state, ONB_GII_STR ) ) ? 1 : 0; // What: Generate Card Done Number. Why: The closing Generate card's own done contribution mirrors genCarCouNum. How: This is 1 only while shwCheBoo AND the Generate item already has a checklist entry.

	const donCouNum = entArr.filter( ( curEntObj ) => curEntObj.done ).length + remDonNum
		+ tutPicDonNum + tutTasDonNum + pagTouDonNum + genCarDonNum; // What: Done Count Number. Why: This is the ring's own numerator, combining every countable source of "done" on the page. How: This sums done picker/day-off entries, done ring reminders, and every tutorial-card category's own done count.
	const totCouNum = entArr.length + rngTasArr.length
		+ tutPicCouNum + tutTasCouNum + pagTouCouNum + genCarCouNum; // What: Total Count Number. Why: This is the ring's own denominator, combining every countable source on the page. How: This sums every category's own total count, mirroring donCouNum's own structure.



	// #region Live Clock

	const [ curNowDat, setCurNowDat ] = React.useState( () => new Date() ); // What: Current Now Date And Setter. Why: The header's own kicker line needs a live-updating clock, re-rendered at the top of every minute rather than spamming setState every second. How: This starts at the current Date and is advanced by the effect below.

	React.useEffect( () => { // What: Clock Tick Effect. Why: See the doc comment just above. How: This waits until the next exact minute boundary, ticks once, then ticks every 60 seconds after that.


		const tikFun     = () => setCurNowDat( new Date() );        // What: Tick Function. Why: Both the initial aligned tick and every later interval tick need this exact same update. How: This writes a fresh Date into curNowDat.
		const nexMinMsNum = 60000 - ( Date.now() % 60000 );          // What: Next Minute Ms Number. Why: The first tick should land exactly on the next minute boundary, not an arbitrary offset. How: This computes the milliseconds remaining until that boundary.

		let tikIntNum = null; // What: Tick Interval Number. Why: The recurring interval isn't started until the first aligned tick fires. How: This is assigned inside the alignment timeout below and read by the cleanup.

		const alnTmoNum = setTimeout( () => { // What: Align Timeout Number. Why: The very first tick must wait for nexMinMsNum before the regular 60-second cadence can begin. How: This fires tikFun once, then starts the recurring interval.


			tikFun();

			tikIntNum = setInterval( tikFun, 60000 );


		}, nexMinMsNum );


		return () => { clearTimeout( alnTmoNum ); if ( tikIntNum ) clearInterval( tikIntNum ); }; // What: Effect Cleanup Return. Why: Neither the alignment timeout nor the recurring interval may outlive this effect run. How: This clears both.


	}, [] ); // What: Effect Dependency Array. Why: This effect only ever needs to start once, on mount. How: An empty array means it never re-subscribes.

	// #endregion Live Clock



	/**
	 * Completion Celebration = Completion Celebration Rationale
	 *
	 * @summary
	 * Tracks which entry was just checked and pulses the ring when the
	 * total done-count climbs. When the climb completes the whole day,
	 * the richer "all done" animation plays instead of the per-tick
	 * pulse. The "becomes complete" check also handles the case where a
	 * skip drops the total such that the remaining done entries fill the
	 * ring.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const [ jusCheStr, setJusCheStr ] = React.useState( null ); // What: Just-Checked String And Setter. Why: A just-completed row needs a brief "fresh" cue, keyed by its own eid. How: This is set by onCheFun below and cleared 700ms later.

	// activeEditor/setActiveEditor: a picker item's inline editor
	// (`item:<eid>`), a reminder's inline editor, or its quick-add form
	// (owned by RemSecCom, passed down below) all read/write this
	// same lifted slot, so opening any one of them collapses whichever of
	// the others was open (each already discards its own unsaved edits on
	// collapse/unmount, see EntryEditor's own discard-guard effect and
	// RemSecCom's own plain local draft state).
	const [ activeEditor, setActiveEditor ] = React.useState( null ); // What: Active Editor String And Setter. Why: See the comment just above. How: This is read/written by every inline editor this tab renders, directly or via RemSecCom.

	const [ opeLogStr, setOpeLogStr ] = React.useState( null ); // What: Open Log String And Setter. Why: Only one group's (or the Reminders block's) Day Log panel may be open at a time. How: This holds whichever single key is currently open, or null.
	const togLogFun = ( logKeyStr ) => setOpeLogStr( ( curKeyStr ) => curKeyStr === logKeyStr ? null : logKeyStr ); // What: Toggle Log Function. Why: Clicking an already-open group's own chip should close it, not just re-open it. How: This flips opeLogStr to null when logKeyStr is already open, otherwise to logKeyStr.

	const rngEleRef  = React.useRef( null );                          // What: Ring Element Reference. Why: The celebration effect below needs a direct DOM handle to trigger CSS classes on. How: This is attached to the .ring div's own ref prop below.
	const strEleRef  = React.useRef( null );                          // What: Streak Element Reference. Why: The streak-pulse effect below needs a direct DOM handle to trigger its own CSS class on. How: This is attached to the .streak div's own ref prop below.
	const preDonRef  = React.useRef( donCouNum );                     // What: Previous Done Reference. Why: The celebration effect needs last render's own donCouNum to detect a genuine rise. How: This starts at the initial donCouNum and is overwritten at the end of that same effect.
	const preCplRef  = React.useRef( totCouNum > 0 && donCouNum === totCouNum ); // What: Previous Complete Reference. Why: The celebration effect needs last render's own completion state to detect a genuine 0-to-1 transition into "all done". How: This starts at the initial completion state and is overwritten at the end of that same effect.
	const preClmRef  = React.useRef( !!state.today.streakClaimed );   // What: Previous Claimed Reference. Why: The streak-pulse effect needs last render's own claimed state to detect a genuine false-to-true transition. How: This starts at the initial claimed state and is overwritten at the end of that same effect.
	const isaCplBoo  = totCouNum > 0 && donCouNum === totCouNum;      // What: Is-A Complete Boolean. Why: Both the header's title swap and the celebration effect need this same live completion check. How: This is true only once totCouNum is positive and donCouNum has reached it exactly.

	const [ cplNonNum, setCplNonNum ] = React.useState( 0 ); // What: Completion Nonce Number And Setter. Why: Bumped every time the day transitions into complete, so the celebratory title re-mounts and replays its per-word reveal. How: This is incremented by the celebration effect below.

	/**
	 * Celebration Particles = Celebration Particle Rationale
	 *
	 * @summary
	 * Confetti/sparkle particles for the completion celebration
	 * (Appearance -> Completion celebration). Ripple/Pulse/Cascade are
	 * pure CSS variants of the existing ring-ripple/card-exhale elements;
	 * these two styles use a genuinely different mechanism (small
	 * generated particles), so they need actual DOM nodes, generated
	 * fresh each celebration and cleared after.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const cplStyStr = ( state.appearance && state.appearance.completionStyle ) || 'confetti'; // What: Completion Style String. Why: Every branch below needs this same resolved celebration style. How: This reads state.appearance.completionStyle, falling back to 'confetti'.
	const [ parArr, setParArr ] = React.useState( [] ); // What: Particle Array And Setter. Why: See the doc comment just above. How: This is populated by the celebration effect below and cleared once the celebration ends.

	/**
	 * celRecObj = Celebration Rect Object
	 *
	 * @summary
	 * The confetti/sparkle overlay covers the viewable cards area (not
	 * the group rail), horizontally bounded to the cards column but
	 * vertically spanning the scroll container's own on-screen viewport
	 * (not the cards list's own, possibly-scrolled-away, bounding box) so
	 * the celebration always shows regardless of where the user is
	 * scrolled to within the list.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const [ celRecObj, setCelRecObj ] = React.useState( null ); // What: Celebration Rect Object And Setter. Why: See the doc comment just above. How: This is computed by the celebration effect below, right before the overlay portal renders from it.
	const carAreRef = React.useRef( null ); // What: Card Area Reference. Why: The celebration effect needs a DOM handle on the cards column itself to measure celRecObj's own horizontal bounds. How: This is attached to the .today-groups div's own ref prop further down.

	React.useEffect( () => { // What: Celebration Effect. Why: This is the actual celebration trigger, described in the doc comment above this whole region. How: This detects either a fresh transition into complete (the richer celebration) or an ordinary done-count rise (the plain pulse), fires the matching CSS/particle sequence, then cleans up after a fixed duration.


		const isaCplNowBoo = totCouNum > 0 && donCouNum === totCouNum; // What: Is-A Complete Now Boolean. Why: This effect's own fresh completion check must be computed here, not read from isaCplBoo, since it needs to compare against preCplRef before that ref is updated. How: This mirrors isaCplBoo's own computation.

		if ( isaCplNowBoo && !preCplRef.current && rngEleRef.current ) { // What: Fresh Completion Branch. Why: The richer "all done" celebration only plays on a genuine false-to-true transition, never on a re-render that was already complete. How: This checks isaCplNowBoo against preCplRef's own prior value.


			const rngCurEle = rngEleRef.current; // What: Ring Current Element. Why: Every DOM manipulation below targets this same node. How: This reads rngEleRef.current once and reuses it throughout this branch.

			rngCurEle.classList.remove( 'is-pulsing', 'is-celebrating' ); // What: Stale Class Clear. Why: A CSS animation class must be removed before being re-added, or the browser won't replay it. How: This removes both classes unconditionally before the reflow forcing line below.
			void rngCurEle.offsetWidth;                                   // What: Reflow Force. Why: Removing then immediately re-adding the same class needs a forced reflow in between, or the browser coalesces the two and never replays the animation. How: Reading offsetWidth forces a synchronous layout pass.
			setCplNonNum( ( curNonNum ) => curNonNum + 1 );               // What: Completion Nonce Bump. Why: The celebratory title needs to re-mount and replay its per-word reveal. How: This increments cplNonNum by 1.

			if ( cplStyStr === 'confetti' || cplStyStr === 'sparkle' ) { // What: Rect Measurement Branch. Why: Only the confetti/sparkle styles need a measured overlay rect at all. How: This measures the cards column and its scroller, falling back to the full viewport if either is missing.


				const carAreEle = carAreRef.current;             // What: Card Area Element. Why: This is the actual DOM node the overlay's own horizontal bounds are measured from. How: This reads carAreRef.current.
				const scrCurEle = carAreEle?.closest( '.main' ); // What: Scroller Current Element. Why: The overlay's own vertical bounds must span the scroll container's on-screen viewport, not the (possibly scrolled-away) cards list itself. How: This walks up from carAreEle to its nearest .main ancestor.

				if ( carAreEle && scrCurEle ) { // What: Both Elements Found Branch. Why: A real measurement is only possible once both elements exist. How: This computes celRecObj from their two bounding rects.


					const carRecObj = carAreEle.getBoundingClientRect(); // What: Cards Rect Object. Why: The overlay's own horizontal bounds come from the cards column itself. How: This reads carAreEle's own bounding rect.
					const scrRecObj = scrCurEle.getBoundingClientRect(); // What: Scroller Rect Object. Why: The overlay's own vertical bounds come from the scroll container instead. How: This reads scrCurEle's own bounding rect.

					setCelRecObj( { left : carRecObj.left, top : scrRecObj.top, width : carRecObj.width, height : scrRecObj.height } ); // What: Celebration Rect Set. Why: The portal below needs this exact shape to position the overlay. How: This combines carRecObj's own left/width with scrRecObj's own top/height.


				}

				else setCelRecObj( { left : 0, top : 0, width : window.innerWidth, height : window.innerHeight } ); // What: Fallback Rect Set. Why: Without both elements mounted, the overlay still needs SOME bounds to render into. How: This falls back to the full viewport.


			}

			if ( cplStyStr === 'confetti' ) { // What: Confetti Particle Build. Why: Confetti needs a batch of randomized piece descriptors to render. How: This builds 26 pieces, each with its own angle/distance/rotation/opacity/delay.


				setParArr( Array.from( { length : 26 }, ( _, curIndNum ) => ( {


					angle   : Math.round( Math.random() * 360 ),
					delay   : Math.round( Math.random() * 180 ),
					dist    : 90 + Math.random() * 220,
					id      : curIndNum,
					opacity : ( 0.7 + Math.random() * 0.3 ).toFixed( 2 ),
					rot     : Math.round( Math.random() * 360 )


				} ) ) );


			}

			else if ( cplStyStr === 'sparkle' ) { // What: Sparkle Particle Build. Why: Sparkle needs its own batch of randomized piece descriptors. How: This builds 22 pieces, each with its own random position and delay.


				setParArr( Array.from( { length : 22 }, () => ( {


					delay : Math.round( Math.random() * 700 ),
					id    : Math.random(),
					xPer  : Math.round( Math.random() * 100 ),
					yPer  : Math.round( Math.random() * 100 )


				} ) ) );


			}

			else setParArr( [] ); // What: No Particle Style Clear. Why: Ripple/Pulse/Cascade need no particle batch at all. How: This clears parArr for every other style.


			/**
			 * Celebration Fire = Celebration Fire Sequence
			 *
			 * @summary
			 * Fires everything together: the ring number pulse to accent
			 * plus a ripple from the ring (always plays, this part of the
			 * celebration doesn't vary by style) plus the per-card exhale
			 * cascade, which IS the "Ripple" style and so only plays when
			 * that style is selected. The title's own per-word reveal runs
			 * in parallel via the cplNonNum bump above.
			 *
			 * @author z4nta0 <https://github.com/z4nta0>
			 *
			*/

			rngCurEle.classList.add( 'is-celebrating' ); // What: Celebrating Class Add. Why: This is the actual CSS trigger for the ring's own celebration animation. How: This adds the is-celebrating class to rngCurEle.

			const cardEleLis = ( cplStyStr === 'ripple' && mnScrRef.current )
				? mnScrRef.current.querySelectorAll( '.today-card' )
				: []; // What: Card Element List. Why: Only the Ripple style needs the per-card exhale cascade at all. How: This queries every rendered card only under that style, otherwise an empty array.

			cardEleLis.forEach( ( curCarEle, curIndNum ) => { // What: Card Exhale Stagger Loop. Why: Each card's own exhale needs a slightly later delay than the one before it, so the cascade reads as a wave. How: This sets a CSS variable and adds the is-exhaling class to each card in turn.


				curCarEle.style.setProperty( '--exhale-delay', `${ curIndNum * 70 }ms` );

				curCarEle.classList.add( 'is-exhaling' );


			} );

			const celTotMsNum = cardEleLis.length * 70 + 900; // What: Celebration Total Ms Number. Why: The cleanup below must wait for the LONGEST-running piece of the celebration, whichever style is active. How: This adds the cascade's own total duration to a fixed base.

			const celEndTmo = setTimeout( () => { // What: Celebration End Timeout. Why: Every celebration effect (ring class, per-card exhale, particles) must clean itself up once its own animation has actually finished. How: This runs after the longer of a fixed floor or celTotMsNum, clearing every piece of state/CSS this branch set.


				if ( rngEleRef.current ) rngEleRef.current.classList.remove( 'is-celebrating' );

				cardEleLis.forEach( ( curCarEle ) => { curCarEle.classList.remove( 'is-exhaling' ); curCarEle.style.removeProperty( '--exhale-delay' ); } );

				setParArr( [] );
				setCelRecObj( null );


			}, Math.max( 1600, celTotMsNum + 100 ) );

			preDonRef.current = donCouNum;    // What: Previous Done Update. Why: The next run of this effect must compare against the count that is current now. How: This overwrites preDonRef with the fresh donCouNum.
			preCplRef.current = isaCplNowBoo; // What: Previous Complete Update. Why: The next run of this effect must compare against the completion state that is current now. How: This overwrites preCplRef with isaCplNowBoo.

			return () => clearTimeout( celEndTmo ); // What: Effect Cleanup Return. Why: A stale celebration-end timeout must not fire after a newer effect run has already begun. How: This cancels celEndTmo.


		}

		if ( donCouNum > preDonRef.current && !isaCplNowBoo && rngEleRef.current ) { // What: Plain Pulse Branch. Why: An ordinary done-count rise that doesn't complete the whole day still deserves a small per-tick pulse. How: This checks donCouNum against preDonRef's own prior value.


			const rngCurEle = rngEleRef.current; // What: Ring Current Element. Why: Every DOM manipulation below targets this same node. How: This reads rngEleRef.current once and reuses it throughout this branch.

			rngCurEle.classList.remove( 'is-pulsing', 'is-completing' ); // What: Stale Class Clear. Why: A CSS animation class must be removed before being re-added, or the browser won't replay it. How: This removes both classes unconditionally before the reflow forcing line below.
			void rngCurEle.offsetWidth;                                   // What: Reflow Force. Why: Same reasoning as the fresh-completion branch above. How: Reading offsetWidth forces a synchronous layout pass.
			rngCurEle.classList.add( 'is-pulsing' );                      // What: Pulsing Class Add. Why: This is the actual CSS trigger for the per-tick pulse. How: This adds the is-pulsing class to rngCurEle.

			const pulEndTmo = setTimeout( () => rngCurEle.classList.remove( 'is-pulsing' ), 700 ); // What: Pulse End Timeout. Why: The pulse class must clear itself once its own short animation finishes. How: This removes is-pulsing 700ms later.

			preDonRef.current = donCouNum;    // What: Previous Done Update. Why: The next run of this effect must compare against the count that is current now. How: This overwrites preDonRef with the fresh donCouNum.
			preCplRef.current = isaCplNowBoo; // What: Previous Complete Update. Why: The next run of this effect must compare against the completion state that is current now. How: This overwrites preCplRef with isaCplNowBoo.

			return () => clearTimeout( pulEndTmo ); // What: Effect Cleanup Return. Why: A stale pulse-end timeout must not fire after a newer effect run has already begun. How: This cancels pulEndTmo.


		}

		preDonRef.current = donCouNum;    // What: Previous Done Update. Why: Even a non-rise (a drop, or a no-op re-render) still needs preDonRef to track the latest value for next time. How: This overwrites preDonRef with the current donCouNum.
		preCplRef.current = isaCplNowBoo; // What: Previous Complete Update. Why: Same reasoning as preDonRef just above, for the completion state. How: This overwrites preCplRef with the current isaCplNowBoo.


	}, [ donCouNum, totCouNum ] ); // What: Effect Dependency Array. Why: This effect only ever needs to re-run when the ring's own numerator or denominator changes. How: donCouNum/totCouNum are exactly what preDonRef/preCplRef are compared against.

	React.useEffect( () => { // What: Streak Pulse Effect. Why: The streak badge needs its own brief pulse, firing once when today's first done is checked, i.e. when state.today.streakClaimed transitions false to true. How: This detects that transition and toggles a CSS class accordingly.


		const clmNowBoo = !!state.today.streakClaimed; // What: Claimed Now Boolean. Why: This effect's own fresh claimed check must be computed here, not read from a prop, since it needs to compare against preClmRef before that ref is updated. How: This reads state.today.streakClaimed directly.

		if ( clmNowBoo && !preClmRef.current && strEleRef.current ) { // What: Fresh Claim Branch. Why: The pulse only plays on a genuine false-to-true transition, never on a re-render that was already claimed. How: This checks clmNowBoo against preClmRef's own prior value.


			const strCurEle = strEleRef.current; // What: Streak Current Element. Why: Every DOM manipulation below targets this same node. How: This reads strEleRef.current once and reuses it below.

			strCurEle.classList.remove( 'is-bumped' ); // What: Stale Class Clear. Why: A CSS animation class must be removed before being re-added, or the browser won't replay it. How: This removes is-bumped unconditionally before the reflow forcing line below.
			void strCurEle.offsetWidth;                 // What: Reflow Force. Why: Removing then immediately re-adding the same class needs a forced reflow in between. How: Reading offsetWidth forces a synchronous layout pass.
			strCurEle.classList.add( 'is-bumped' );     // What: Bumped Class Add. Why: This is the actual CSS trigger for the streak's own pulse animation. How: This adds the is-bumped class to strCurEle.

			const bmpEndTmo = setTimeout( () => strCurEle.classList.remove( 'is-bumped' ), 900 ); // What: Bump End Timeout. Why: The bumped class must clear itself once its own short animation finishes. How: This removes is-bumped 900ms later.

			preClmRef.current = clmNowBoo; // What: Previous Claimed Update. Why: The next run of this effect must compare against the claimed state that is current now. How: This overwrites preClmRef with clmNowBoo.

			return () => clearTimeout( bmpEndTmo ); // What: Effect Cleanup Return. Why: A stale bump-end timeout must not fire after a newer effect run has already begun. How: This cancels bmpEndTmo.


		}

		preClmRef.current = clmNowBoo; // What: Previous Claimed Update. Why: Even a non-transition still needs preClmRef to track the latest value for next time. How: This overwrites preClmRef with the current clmNowBoo.


	}, [ state.today.streakClaimed ] ); // What: Effect Dependency Array. Why: This effect only ever needs to re-run when the persisted streakClaimed flag itself changes. How: state.today.streakClaimed is exactly what preClmRef is compared against.



	/**
	 * Sticky Offset Measurement = Sticky Offset Measurement Rationale
	 *
	 * @summary
	 * Measures the sticky header AND the rail (when it stacks above
	 * content on mobile) so the rail's own sticky-top sits flush beneath
	 * the header, and jmpGroFun/the scroll-spy effect below correctly
	 * account for both.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const heaEleRef  = React.useRef( null ); // What: Header Element Reference. Why: This effect needs a direct DOM handle on the sticky header to measure it. How: This is attached to the <header> element's own ref prop further down.
	const railEleRef = React.useRef( null ); // What: Rail Element Reference. Why: This effect needs a direct DOM handle on the group rail to measure it when it stacks horizontally. How: This is attached to the <aside> rail's own ref prop further down.

	React.useEffect( () => { // What: Sticky Offset Effect. Why: See the doc comment just above. How: This measures both elements on mount, on their own resize, and on window resize, publishing 3 CSS custom properties onto the tab root.


		const heaCurEle = heaEleRef.current; // What: Header Current Element. Why: This is the actual DOM node every measurement below reads from. How: This reads heaEleRef.current once.

		if ( !heaCurEle ) return; // What: No Header Guard. Why: Without the header mounted there is nothing to measure at all. How: This bails out of the effect early when heaCurEle is missing.


		const tabCurEle = heaCurEle.closest( '.tab--today' ); // What: Tab Current Element. Why: The 3 CSS custom properties this effect publishes must land on the tab's own root, not the header itself. How: This walks up from heaCurEle to its nearest .tab--today ancestor.

		if ( !tabCurEle ) return; // What: No Tab Root Guard. Why: Without the tab root there is nowhere to publish the measured values. How: This bails out of the effect early when tabCurEle is missing.


		const aplFun = () => { // What: Apply Function. Why: Every trigger below (mount, either ResizeObserver, window resize) needs this exact same measure-and-publish step. How: This measures heaCurEle/railEleRef, then writes 3 CSS custom properties onto tabCurEle.


			const heaHeiNum = heaCurEle.offsetHeight; // What: Header Height Number. Why: This is the header's own real rendered height. How: This reads heaCurEle.offsetHeight.

			const railCurEle  = railEleRef.current;                                                      // What: Rail Current Element. Why: The rail only contributes to the sticky offset while it is stacked horizontally, which needs its own live check below. How: This reads railEleRef.current.
			const railHorBoo  = railCurEle && getComputedStyle( railCurEle ).flexDirection === 'row';     // What: Rail Horizontal Boolean. Why: On mobile the rail flips to flex-direction: row and stacks below the header as a horizontal pill bar; this detects that state via computed style so it works whether triggered by the viewport breakpoint or the mobile-preview tweak. How: This reads railCurEle's own live computed flexDirection.
			const railHeiNum  = railHorBoo ? railCurEle.offsetHeight : 0;                                 // What: Rail Height Number. Why: Only a horizontally-stacked rail contributes its own height to the sticky offset. How: This reads railCurEle.offsetHeight only while railHorBoo, otherwise 0.

			tabCurEle.style.setProperty( '--today-h-h', `${ heaHeiNum }px` );             // What: Header Height Property. Why: CSS elsewhere needs the header's own real height as a custom property. How: This writes heaHeiNum in pixels.
			tabCurEle.style.setProperty( '--rail-h-h', `${ railHeiNum }px` );              // What: Rail Height Property. Why: CSS elsewhere needs the rail's own real height (when horizontal) as a custom property. How: This writes railHeiNum in pixels.
			tabCurEle.style.setProperty( '--sticky-top-h', `${ heaHeiNum + railHeiNum }px` ); // What: Sticky Top Height Property. Why: jmpGroFun and the scroll-spy effect below both need this exact combined offset. How: This writes the sum of heaHeiNum and railHeiNum in pixels.


		};

		aplFun(); // What: Initial Apply Call. Why: The offsets must be published immediately on mount, without waiting for a resize. How: This invokes aplFun once, synchronously.

		const resObsObj = new ResizeObserver( aplFun ); // What: Resize Observer Object. Why: Either element's own size can change independent of a window resize (e.g. text wrapping). How: This re-runs aplFun on every observed resize.

		resObsObj.observe( heaCurEle ); // What: Header Observe Call. Why: The header's own size must be watched directly. How: This starts observing heaCurEle.

		if ( railEleRef.current ) resObsObj.observe( railEleRef.current ); // What: Rail Observe Guard. Why: The rail should only be observed once it is actually mounted. How: This starts observing railEleRef.current only when it exists.


		window.addEventListener( 'resize', aplFun ); // What: Window Resize Listener. Why: A viewport-level resize can flip the rail between stacked/side layouts even without either element's own box changing size on its own. How: This re-runs aplFun on every window resize event.


		return () => { window.removeEventListener( 'resize', aplFun ); resObsObj.disconnect(); }; // What: Effect Cleanup Return. Why: Neither the resize listener nor the observer may outlive this effect run. How: This removes the listener and disconnects the observer.


	}, [] ); // What: Effect Dependency Array. Why: This effect only ever needs to set up its own observers once, on mount. How: An empty array means it never re-subscribes.



	const onCheFun = ( picRecObj, entRecObj ) => { // What: On Check Function. Why: Toggling done also needs to stage the brief "fresh" cue, but only on a genuine not-done-to-done transition, never on an uncheck. How: This calls actions.toggleDone, then stages jusCheStr only when wasDonBoo was false.


		const wasDonBoo = entRecObj.done; // What: Was Done Boolean. Why: The fresh-cue guard below needs to know the PRE-toggle state. How: This reads entRecObj.done before actions.toggleDone below flips it.

		actions.toggleDone( entRecObj.eid ); // What: Toggle Done Call. Why: This is the actual completion toggle, applying (or reverting) this entry's own pending mutation. How: This calls actions.toggleDone with entRecObj's own eid.

		if ( !wasDonBoo ) { // What: Fresh Cue Guard. Why: Only a genuine check (not an uncheck) deserves the brief fresh cue. How: This stages jusCheStr only while wasDonBoo was false.


			setJusCheStr( entRecObj.eid ); // What: Just-Checked Stage. Why: EntCarCom's own fresh-cue check needs this exact eid to compare against. How: This publishes entRecObj's own eid into jusCheStr.

			setTimeout( () => setJusCheStr( ( curValStr ) => curValStr === entRecObj.eid ? null : curValStr ), 700 ); // What: Just-Checked Clear Timeout. Why: The fresh cue must clear itself shortly after, but only if a newer check hasn't already claimed jusCheStr in the meantime. How: This clears jusCheStr back to null after 700ms, guarded so a stale timeout can't stomp a fresher one.


		}


	};

	/**
	 * skpAniMsNum = Skip Animation Ms Number
	 *
	 * @summary
	 * Skip removes the entry: first marks it as removing so the card can
	 * play a collapse animation, then drops it from state. The slide-out
	 * CSS uses this exact same duration as the timer below; changing one
	 * requires changing the other.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/
	const skpAniMsNum = 380;

	const [ remIdeSet, setRemIdeSet ] = React.useState( () => new Set() ); // What: Removing Id Set And Setter. Why: A skipped or deleted row needs to know it is mid-removal so it can play its own collapse animation. How: This is added to right before the animation starts and cleared once the underlying data actually changes.

	const hndSkiFun = ( entIdeStr ) => { // What: Handle Skip Function. Why: This is the actual skip trigger, shared by every EntCarCom's own onSkiFun prop. How: This stages entIdeStr as removing, then calls actions.skipEntry after skpAniMsNum.


		if ( remIdeSet.has( entIdeStr ) ) return; // What: Already Removing Guard. Why: A row already mid-removal must not be re-triggered by a second click. How: This bails out early when entIdeStr is already in remIdeSet.


		setRemIdeSet( ( curSetObj ) => { const nexSetObj = new Set( curSetObj ); nexSetObj.add( entIdeStr ); return nexSetObj; } ); // What: Removing Id Add. Why: The card needs to start its own collapse animation immediately. How: This adds entIdeStr into a fresh copy of remIdeSet.

		setTimeout( () => { // What: Skip Settle Timeout. Why: The actual data removal must wait for the collapse animation to finish playing. How: This runs after skpAniMsNum, matching the CSS animation's own duration.


			actions.skipEntry( entIdeStr ); // What: Skip Entry Call. Why: This is the actual removal, applied only once the animation has had time to play. How: This calls actions.skipEntry with entIdeStr.

			setRemIdeSet( ( curSetObj ) => { const nexSetObj = new Set( curSetObj ); nexSetObj.delete( entIdeStr ); return nexSetObj; } ); // What: Removing Id Delete. Why: The removing flag must clear once the row is actually gone. How: This deletes entIdeStr from a fresh copy of remIdeSet.


		}, skpAniMsNum );


	};

	const hndDelFun = ( entIdeStr, iteIdeStr ) => { // What: Handle Delete Function. Why: Deleting a picker item from its Today editor should play the same card slide-out as skip, then remove the item (which drops the entry too). How: This closes the item's own editor, then either removes immediately (reduced motion) or stages the same removal animation skip uses.


		setActiveEditor( ( curValStr ) => curValStr === `item:${ entIdeStr }` ? null : curValStr ); // What: Editor Close. Why: A deleted item's own editor must not stay open. How: This clears activeEditor only if it currently points at this exact item's own editor slot.

		if ( redMotFun() ) { actions.removeItem( iteIdeStr ); return; } // What: Reduced Motion Branch. Why: A user who prefers reduced motion should see the item removed immediately, not wait through an animation they won't see anyway. How: This removes iteIdeStr directly and returns early.


		if ( remIdeSet.has( entIdeStr ) ) return; // What: Already Removing Guard. Why: A row already mid-removal must not be re-triggered by a second click. How: This bails out early when entIdeStr is already in remIdeSet.


		setRemIdeSet( ( curSetObj ) => { const nexSetObj = new Set( curSetObj ); nexSetObj.add( entIdeStr ); return nexSetObj; } ); // What: Removing Id Add. Why: The card needs to start its own collapse animation immediately. How: This adds entIdeStr into a fresh copy of remIdeSet.

		setTimeout( () => { // What: Delete Settle Timeout. Why: The actual item removal must wait for the collapse animation to finish playing. How: This runs after skpAniMsNum, matching the CSS animation's own duration.


			actions.removeItem( iteIdeStr ); // What: Remove Item Call. Why: This is the actual removal, applied only once the animation has had time to play. How: This calls actions.removeItem with iteIdeStr.

			setRemIdeSet( ( curSetObj ) => { const nexSetObj = new Set( curSetObj ); nexSetObj.delete( entIdeStr ); return nexSetObj; } ); // What: Removing Id Delete. Why: The removing flag must clear once the row is actually gone. How: This deletes entIdeStr from a fresh copy of remIdeSet.


		}, skpAniMsNum );


	};

	/**
	 * Reroll Animation = Reroll Card-Flip Animation Rationale
	 *
	 * @summary
	 * Re-roll plays a card-flip animation. The card body does a full
	 * 360deg rotation on its X axis (single direction) so it reads as a
	 * tumble; the state update lands exactly at 180deg, the apex of the
	 * flip, so the new item name comes in upside-down for a moment, then
	 * rolls right-side up. Reduced motion keeps a SHORT deliberate beat
	 * rather than swapping instantly: with no flip to watch, an immediate
	 * swap can read as "nothing happened", especially when the two item
	 * names are similar in length. 200ms is still clearly a response and
	 * stays under the ~300ms mark where a delay starts to feel like lag.
	 * The full 760ms is the flip's own duration (the swap lands at its
	 * 380ms apex), so inheriting it here would just be the ghost of an
	 * animation that no longer plays.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const rolAniMsNum = ( redMotFun && redMotFun() ) ? 200 : 760; // What: Roll Animation Ms Number. Why: See the doc comment just above. How: This picks the short reduced-motion beat or the full flip duration.
	const [ rolIdeSet, setRolIdeSet ] = React.useState( () => new Set() ); // What: Rolling Id Set And Setter. Why: A re-rolling row needs to know it is mid-flip so it can play its own animation class. How: This is added to right before the flip starts and cleared once it finishes.

	const hndRerFun = ( entRecObj, picRecObj ) => { // What: Handle Reroll Function. Why: This is the actual re-roll trigger, shared by every EntCarCom's own onRerFun prop. How: This stages entRecObj's own eid as rolling, computes and stages a new pending pick at the flip's own apex, then clears the rolling flag once the flip finishes.


		if ( rolIdeSet.has( entRecObj.eid ) ) return; // What: Already Rolling Guard. Why: A row already mid-flip must not be re-triggered by a second click. How: This bails out early when entRecObj's own eid is already in rolIdeSet.


		setRolIdeSet( ( curSetObj ) => { const nexSetObj = new Set( curSetObj ); nexSetObj.add( entRecObj.eid ); return nexSetObj; } ); // What: Rolling Id Add. Why: The card needs to start its own flip animation immediately. How: This adds entRecObj's own eid into a fresh copy of rolIdeSet.

		setTimeout( () => { // What: Flip Apex Timeout. Why: The pick happens at the midpoint of the flip (when the card is fully upside-down), so the new content rolls in continuing the same direction. How: This runs at half of rolAniMsNum, computing and staging the new pick.


			if ( picRecObj.mode === 'ease-up' ) { // What: Ease-Up Reroll Branch. Why: Ease Up re-roll is a manual cycle through eligible (charged >= threshold) items, highest-to-lowest value, wrapping back to the highest, rather than a fresh random pick. How: This computes a deterministic ordering, finds the current item's own position, and steps to the next one.


				const thrNum   = picRecObj.threshold ?? 100;                                  // What: Threshold Number. Why: Eligibility below is judged against this picker's own resolved threshold. How: This reads picRecObj.threshold, falling back to 100.
				const tsOfFun  = ( curIteObj ) => ( curIteObj.lastPicked ? Date.parse( curIteObj.lastPicked ) : 0 ); // What: Timestamp Of Function. Why: The deterministic ordering below needs a numeric sort key for lastPicked. How: This parses curIteObj.lastPicked, or 0 when it has never been picked.

				const eliArr = state.items // What: Eligible Array. Why: This is the actual candidate pool re-roll cycles through; deterministic order (value desc, then oldest lastPicked, then id) is stable since done-gating freezes values between rolls. How: This filters state.items to this picker's own active, threshold-eligible items, then sorts them.
					.filter( ( curIteObj ) => curIteObj.pickerId === picRecObj.id && !curIteObj.vacation && PIC_NAM_OBJ.easEliFun( curIteObj, thrNum ) )
					.sort( ( aIteObj, bIteObj ) => ( bIteObj.value - aIteObj.value ) || ( tsOfFun( aIteObj ) - tsOfFun( bIteObj ) ) || ( aIteObj.id < bIteObj.id ? -1 : 1 ) );

				if ( eliArr.length >= 2 ) { // What: Enough Candidates Guard. Why: Fewer than 2 eligible candidates means the UI already disabled the button, so this is a safe no-op rather than a real error case. How: This only proceeds once eliArr has at least 2 entries.


					const curFouIndNum = eliArr.findIndex( ( curIteObj ) => curIteObj.id === entRecObj.itemId ); // What: Current Found Index Number. Why: The next candidate is found relative to whichever one is currently picked. How: This finds entRecObj's own itemId within eliArr.
					const nexIteObj    = eliArr[ ( curFouIndNum + 1 ) % eliArr.length ];                          // What: Next Item Object. Why: This is the actual next candidate to roll to, wrapping back to the front once the end is reached. How: This indexes eliArr one past curFouIndNum, modulo its own length.
					const resObj       = PIC_NAM_OBJ.picIteFun( picRecObj, state.items, { forceItemId : nexIteObj.id } );   // What: Result Object. Why: Forcing the specific next item still needs to run through the real picking engine so its own value/pending mutations compute correctly. How: This calls PIC_NAM_OBJ.picIteFun with forceItemId set to nexIteObj's own id.

					actions.setEntryItem( entRecObj.eid, nexIteObj.id, { // What: Set Entry Item Call. Why: This stages the new pick's own value/weight mutation as pending, applied only once the entry is marked done, preserving the "nothing changes until you actually do it" contract. How: This writes nexIteObj's own id plus resObj's own updArr/patObj/depBoo.


						bumpPick    : true,
						depletedEnd : resObj.depBoo,
						pickedId    : nexIteObj.id,
						pickerPatch : resObj.patObj,
						updates     : resObj.updArr


					} );


				}


			}

			else { // What: Other Mode Reroll Branch. Why: Every other mode re-rolls via a fresh forced-new pick instead of a manual cycle; forceNew makes ease-down specifically abandon its current active item (recharging it) and roll to a different one, while other modes simply ignore the flag. How: This calls PIC_NAM_OBJ.picIteFun with forceNew and stages whatever it returns as pending.


				const resObj = PIC_NAM_OBJ.picIteFun( picRecObj, state.items, { forceNew : true } ); // What: Result Object. Why: This is the actual fresh pick this branch draws. How: This calls PIC_NAM_OBJ.picIteFun with forceNew true.

				if ( resObj.picObj ) { // What: Picked Guard. Why: A pick can legitimately come back empty (no eligible candidates), in which case there is nothing to stage. How: This only proceeds once resObj.picObj exists.


					actions.setEntryItem( entRecObj.eid, resObj.picObj.id, { // What: Set Entry Item Call. Why: Same staging contract as the ease-up branch above: nothing changes until the entry is marked done. How: This writes resObj.picObj's own id plus resObj's own updArr/patObj/depBoo.


						bumpPick    : true,
						depletedEnd : resObj.depBoo,
						pickedId    : resObj.picObj.id,
						pickerPatch : resObj.patObj,
						updates     : resObj.updArr


					} );


				}


			}


		}, rolAniMsNum / 2 );

		setTimeout( () => { // What: Flip End Timeout. Why: The rolling flag must clear once the flip's own full animation has actually finished, not just at its apex. How: This runs after the full rolAniMsNum, clearing entRecObj's own eid from rolIdeSet.


			setRolIdeSet( ( curSetObj ) => { const nexSetObj = new Set( curSetObj ); nexSetObj.delete( entRecObj.eid ); return nexSetObj; } );


		}, rolAniMsNum );


	};



	/**
	 * Rail Edge Fades = Group Rail Edge Fade Rationale
	 *
	 * @summary
	 * Scroll-aware edge fades on the mobile group rail: toggles
	 * .at-start/.at-end so the mask gradient only fades the side that has
	 * more content, matching .picker-tabs' own behavior.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	React.useEffect( () => { // What: Rail Edge Fade Effect. Why: See the doc comment just above. How: This toggles both classes on scroll, on resize, and once immediately on mount/dependency change.


		const railCurEle = railEleRef.current; // What: Rail Current Element. Why: Every check below reads this same node's own scroll position. How: This reads railEleRef.current once.

		if ( !railCurEle ) return; // What: No Rail Guard. Why: Without the rail mounted there is nothing to measure at all. How: This bails out of the effect early when railCurEle is missing.


		const updFun = () => { // What: Update Function. Why: Both the scroll listener and the resize observer need this exact same recompute-and-toggle step. How: This computes atStrBoo/atEndBoo from railCurEle's own scroll metrics and toggles both classes.


			const atStrBoo = railCurEle.scrollLeft <= 1;                                              // What: At Start Boolean. Why: The left edge fade should hide once the rail is scrolled essentially all the way to its own start. How: This checks scrollLeft against a 1px tolerance.
			const atEndBoo = railCurEle.scrollLeft + railCurEle.clientWidth >= railCurEle.scrollWidth - 1; // What: At End Boolean. Why: The right edge fade should hide once the rail is scrolled essentially all the way to its own end. How: This checks the scrolled-plus-visible width against the rail's own full scrollWidth, with a 1px tolerance.

			railCurEle.classList.toggle( 'at-start', atStrBoo ); // What: At-Start Class Toggle. Why: This is the actual CSS hook the mask gradient reads. How: This toggles the at-start class per atStrBoo.
			railCurEle.classList.toggle( 'at-end', atEndBoo );   // What: At-End Class Toggle. Why: This is the actual CSS hook the mask gradient reads for the opposite edge. How: This toggles the at-end class per atEndBoo.


		};

		updFun(); // What: Initial Update Call. Why: The edge classes must be correct immediately on mount, without waiting for a scroll/resize event. How: This invokes updFun once, synchronously.

		railCurEle.addEventListener( 'scroll', updFun, { passive : true } ); // What: Scroll Listener Subscribe. Why: The rail's own horizontal scroll position is the primary trigger for re-evaluating the edge classes. How: This registers updFun as a passive scroll listener.

		const resObsObj = new ResizeObserver( updFun ); // What: Resize Observer Object. Why: The rail's own scrollable width can change without a scroll event firing at all (e.g. groups being added/removed). How: This re-runs updFun on every observed resize.

		resObsObj.observe( railCurEle ); // What: Resize Observe Call. Why: This is what actually starts the observation. How: This observes railCurEle.


		return () => { railCurEle.removeEventListener( 'scroll', updFun ); resObsObj.disconnect(); }; // What: Effect Cleanup Return. Why: Neither the scroll listener nor the observer may outlive this effect run. How: This removes the listener and disconnects the observer.


	}, [ groArr.length ] ); // What: Effect Dependency Array. Why: The number of groups changing can change whether the rail even overflows at all. How: groArr.length is the one value that actually drives that.



	/**
	 * Scroll Spy = Group Rail Scroll Spy Rationale
	 *
	 * @summary
	 * Tracks which group is currently most in view, syncing the rail's
	 * own active-button highlight as the user scrolls. A clicked group
	 * that can't scroll its own header up to the spy line (it's in the
	 * bottom cluster) gets pinned active until the user scrolls back up
	 * past it, otherwise the spy would snap the highlight to the last
	 * group that CAN reach the line. Mirrors the Settings rail's own fix.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const [ actGroStr, setActGroStr ] = React.useState( '__reminders' ); // What: Active Group String And Setter. Why: This is the single source of truth for which rail button is highlighted. How: This starts on the Reminders sentinel and is updated by the scroll-spy effect below.
	const secRefObj = React.useRef( {} );        // What: Section Reference Object. Why: The scroll-spy effect below needs a live handle on every rendered group/Reminders/Page-Tours section element. How: This is populated by each section's own ref callback further down and read here.
	const mnScrRef  = React.useRef( null );      // What: Main Scroll Reference. Why: Several handlers (scroll spy, generate's own scroll-to-top, jmpGroFun) all need a handle on the shared scroll layout wrapper. How: This is attached to the .today-layout div's own ref prop further down.
	const skpSpyRef = React.useRef( false );     // What: Skip Spy Reference. Why: A programmatic scroll (jmpGroFun, or generate's own scroll-to-top) must not have the scroll-spy effect immediately fight back and reassign actGroStr mid-animation. How: This is set true right before such a scroll starts and cleared shortly after it settles.
	const pinGroRef = React.useRef( null );      // What: Pinned Group Reference. Why: See the doc comment just above. How: This is set by jmpGroFun and read/cleared by the scroll-spy effect below.

	React.useEffect( () => { // What: Scroll Spy Effect. Why: See the doc comment just above. How: This computes, on every scroll, which section's own header sits closest to (without crossing) the sticky offset line, honoring any pinned bottom-cluster group first.


		const secArr = Object.entries( secRefObj.current ).filter( ( [ , curEle ] ) => curEle )
			.sort( ( aEntArr, bEntArr ) => aEntArr[ 1 ].offsetTop - bEntArr[ 1 ].offsetTop ); // What: Section Array. Why: Sorting by actual document position keeps the first/last entries (used for the top default and the bottomed-out case) matching the real on-screen order, even after groups/Reminders have been reordered in Edit Mode. How: This collects every mounted section ref and sorts by offsetTop.

		if ( !secArr.length ) return; // What: No Sections Guard. Why: Without any mounted sections there is nothing to spy on at all. How: This bails out of the effect early when secArr is empty.


		const onScrFun = () => { // What: On Scroll Function. Why: This is the actual recompute triggered by every scroll event. How: This resolves the sticky offset, checks the pinned-group/bottomed-out special cases first, then finds whichever section sits closest to the spy line.


			if ( skpSpyRef.current ) return; // What: Skip Spy Guard. Why: A programmatic scroll already in flight must not have this handler fight back. How: This bails out early while skpSpyRef is true.


			const tabCurEle = mnScrRef.current?.closest( '.tab--today' );                                                            // What: Tab Current Element. Why: The sticky offset custom property lives on the tab's own root. How: This walks up from mnScrRef.current to its nearest .tab--today ancestor.
			const stkHeiNum = tabCurEle ? ( parseInt( getComputedStyle( tabCurEle ).getPropertyValue( '--sticky-top-h' ) ) || 140 ) : 140; // What: Sticky Height Number. Why: This is the exact offset the sticky-offset effect above publishes. How: This reads the --sticky-top-h custom property, falling back to a fixed 140.
			const biaNum    = stkHeiNum + 20;                                                                                          // What: Bias Number. Why: A small extra margin beyond the raw sticky offset reads as more natural than snapping exactly at the pixel boundary. How: This adds a fixed 20px to stkHeiNum.
			const scrCurEle = mnScrRef.current?.closest( '.main' );                                                                    // What: Scroller Current Element. Why: The bottomed-out check below needs the real scroll container, not the window, whenever one exists. How: This walks up from mnScrRef.current to its nearest .main ancestor.

			const atBotBoo = scrCurEle // What: At Bottom Boolean. Why: A user scrolled all the way to the end should always spy the LAST section, even if its own header can never reach the spy line. How: This checks either the scroller's own metrics or, without one, the window's.
				? scrCurEle.scrollTop + scrCurEle.clientHeight >= scrCurEle.scrollHeight - 2
				: window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;

			if ( pinGroRef.current ) { // What: Pinned Group Branch. Why: A pinned bottom-cluster group should stay active while bottomed out or while its own header is still above the viewport midline. How: This releases the pin once neither condition holds any more, otherwise returns early to keep it active.


				const pinEle    = secRefObj.current[ pinGroRef.current ];                 // What: Pinned Element. Why: The release check below needs the pinned section's own live DOM node. How: This reads secRefObj.current at pinGroRef's own key.
				const viwTopNum = scrCurEle ? scrCurEle.getBoundingClientRect().top : 0;  // What: View Top Number. Why: The midline check below needs the scroller's own viewport top. How: This reads scrCurEle's own bounding rect top, or 0 without a scroller.
				const viwHeiNum = scrCurEle ? scrCurEle.clientHeight : window.innerHeight; // What: View Height Number. Why: The midline check below needs the scroller's own viewport height. How: This reads scrCurEle.clientHeight, or the window's own innerHeight without a scroller.
				const midLinNum = viwTopNum + viwHeiNum / 2;                              // What: Midline Number. Why: "Still in view" for a pinned group is judged against the viewport's own vertical middle. How: This adds half of viwHeiNum to viwTopNum.

				if ( pinEle && ( atBotBoo || pinEle.getBoundingClientRect().top <= midLinNum ) ) return; // What: Keep Pinned Guard. Why: The pin should hold while either condition still applies. How: This returns early, leaving actGroStr untouched, while pinEle exists and either atBotBoo or its own top is still above midLinNum.


				pinGroRef.current = null; // What: Pin Release. Why: Neither keep-condition held, so the pin is no longer warranted. How: This clears pinGroRef back to null.


			}

			if ( atBotBoo ) { setActGroStr( secArr[ secArr.length - 1 ][ 0 ] ); return; } // What: Bottomed Out Branch. Why: Bottomed out with no pin (e.g. a plain scroll to the end) still means the LAST group is what's actually in view, even though its header can't reach the line. How: This sets actGroStr to secArr's own last entry's own key and returns.


			let bstGroStr = secArr[ 0 ][ 0 ]; // What: Best Group String And Reassignment. Why: The search loop below needs a running best-match default, starting at the first section. How: This starts at secArr's own first entry's own key.
			let bstDisNum = Infinity;          // What: Best Distance Number And Reassignment. Why: The search loop below needs a running best-match distance, starting unbeaten. How: This starts at Infinity so the very first real candidate always replaces it.

			for ( const [ curNamStr, curEle ] of secArr ) { // What: Closest Section Search Loop. Why: The active group is whichever section's own header sits closest to (without crossing past) biaNum. How: This walks every section, tracking the smallest qualifying distance.


				const curRecObj = curEle.getBoundingClientRect(); // What: Current Rect Object. Why: This iteration's own distance check needs this section's own live position. How: This reads curEle's own bounding rect.
				const curDisNum = Math.abs( curRecObj.top - biaNum ); // What: Current Distance Number. Why: This is the actual comparison metric for this candidate. How: This is the absolute difference between curRecObj's own top and biaNum.

				if ( curRecObj.top - biaNum <= 16 && curDisNum < bstDisNum ) { // What: Better Candidate Guard. Why: Only a section whose own header has already crossed (within a small 16px tolerance) past the spy line, AND is closer than the current best, should replace it. How: This updates bstDisNum/bstGroStr only when both conditions hold.


					bstDisNum = curDisNum;
					bstGroStr = curNamStr;


				}


			}

			setActGroStr( bstGroStr ); // What: Active Group Set. Why: This is the actual highlight update every other branch above eventually falls through to. How: This publishes bstGroStr into actGroStr.


		};

		onScrFun(); // What: Initial Scroll Call. Why: The correct group must be highlighted immediately on mount/dependency change, without waiting for a scroll event. How: This invokes onScrFun once, synchronously.

		const conEle = mnScrRef.current?.closest( '.main' ) || window; // What: Container Element. Why: The scroll listener should attach to the real scroll container when one exists, falling back to the window. How: This walks up from mnScrRef.current, or defaults to window.

		conEle.addEventListener( 'scroll', onScrFun, { passive : true } ); // What: Container Scroll Subscribe. Why: This is the primary trigger for re-evaluating the active group. How: This registers onScrFun as a passive scroll listener on conEle.
		window.addEventListener( 'scroll', onScrFun, { passive : true } ); // What: Window Scroll Subscribe. Why: A window-level scroll listener is still needed as a fallback/supplement, matching the original dual-listener behavior. How: This registers onScrFun as a passive scroll listener on window too.


		return () => { conEle.removeEventListener( 'scroll', onScrFun ); window.removeEventListener( 'scroll', onScrFun ); }; // What: Effect Cleanup Return. Why: Neither listener may outlive this effect run. How: This removes both.


	}, [ groArr.length, blkOrdArr, shwFeaBoo ] ); // What: Effect Dependency Array. Why: A changed group count, block order, or App Features visibility can all change which sections even exist to spy on. How: Each of these 3 can add/remove a whole section.

	const jmpGroFun = ( namStr ) => { // What: Jump Group Function. Why: This is the actual click handler behind every rail button, smooth-scrolling the content column to the named section. How: This resolves the sticky offset, computes a target scroll position, pins the group if it can't reach the spy line, then scrolls.


		const tarEle = secRefObj.current[ namStr ]; // What: Target Element. Why: There is nothing to scroll to without a real mounted section. How: This reads secRefObj.current at namStr.

		if ( !tarEle ) return; // What: No Target Guard. Why: A stale or not-yet-mounted section must not attempt a scroll at all. How: This bails out early when tarEle is missing.


		setActGroStr( namStr );      // What: Active Group Set. Why: The clicked rail button should highlight immediately, without waiting for the scroll-spy effect to catch up. How: This publishes namStr into actGroStr directly.
		skpSpyRef.current = true;    // What: Skip Spy Set. Why: The scroll-spy effect must not fight this programmatic scroll while it is in flight. How: This flags skpSpyRef true for the duration of the scroll below.

		const mnScrEle  = tarEle.closest( '.main' );         // What: Main Scroll Element. Why: The scroll target depends on whether a real scroll container exists. How: This walks up from tarEle to its nearest .main ancestor.
		const tabCurEle = tarEle.closest( '.tab--today' );   // What: Tab Current Element. Why: The sticky offset custom property lives on the tab's own root. How: This walks up from tarEle to its nearest .tab--today ancestor.
		const stkHeiNum = parseInt( getComputedStyle( tabCurEle ).getPropertyValue( '--sticky-top-h' ) ) || 140; // What: Sticky Height Number. Why: The scroll target must land just beneath the sticky header/rail, not at the section's own raw offset. How: This reads the --sticky-top-h custom property, falling back to a fixed 140.
		const extPadNum = 16; // What: Extra Padding Number. Why: A small extra gap beyond the sticky offset reads as more natural than a section's header touching the sticky edge exactly. How: This is a fixed 16px added to the scroll target below.

		if ( mnScrEle ) { // What: Scroller Branch. Why: A real scroll container needs its own scrollTo call, distinct from the window fallback. How: This computes the target, checks whether it can even be reached, pins if not, then scrolls mnScrEle.


			const tarOffNum = tarEle.offsetTop - stkHeiNum - extPadNum; // What: Target Offset Number. Why: This is the actual scroll position that lands tarEle's own header just beneath the sticky offset. How: This subtracts stkHeiNum and extPadNum from tarEle's own offsetTop.
			const maxScrNum = mnScrEle.scrollHeight - mnScrEle.clientHeight; // What: Max Scroll Number. Why: A section near the very end of the list may not be able to scroll far enough to actually reach the spy line. How: This is the scroller's own maximum possible scrollTop.

			pinGroRef.current = tarOffNum > maxScrNum - 2 ? namStr : null; // What: Pin Group Set. Why: If this group can't reach the spy line at all, the scroll-spy effect needs to pin it active instead of reclaiming the highlight for whatever CAN reach the line. How: This pins namStr only when tarOffNum exceeds what the scroller can actually reach.

			mnScrEle.scrollTo( { top : tarOffNum, behavior : redMotFun() ? 'auto' : 'smooth' } ); // What: Scroll To Call. Why: This is the actual scroll. How: This scrolls mnScrEle to tarOffNum, smoothly unless reduced motion is preferred.


		}

		else { // What: Window Fallback Branch. Why: Without a real scroll container, the window itself must be scrolled instead. How: This computes the target against the window's own scroll position and scrolls it.


			pinGroRef.current = null; // What: Pin Group Clear. Why: The pin concept only applies to a real bounded scroller; the window fallback has no such ceiling to worry about. How: This clears pinGroRef.

			const winTopNum = tarEle.getBoundingClientRect().top + window.scrollY - stkHeiNum - extPadNum; // What: Window Top Number. Why: This is the actual scroll position that lands tarEle's own header just beneath the sticky offset, in window-scroll terms. How: This combines tarEle's own viewport-relative top with the current window.scrollY.

			window.scrollTo( { top : winTopNum, behavior : redMotFun() ? 'auto' : 'smooth' } ); // What: Scroll To Call. Why: This is the actual scroll. How: This scrolls the window to winTopNum, smoothly unless reduced motion is preferred.


		}

		setTimeout( () => { skpSpyRef.current = false; }, 600 ); // What: Skip Spy Release Timeout. Why: The scroll-spy effect may resume once the smooth scroll has had time to settle. How: This clears skpSpyRef back to false after 600ms.


	};



	// #region Regenerate

	const [ genActBoo, setGenActBoo ] = React.useState( false ); // What: Generate Active Boolean And Setter. Why: The footer's own Regenerate button, and Edit Mode's own toggle, both need to know whether a generation cascade is currently playing. How: This is set true for genFun's own whole duration below.
	const [ cfmGenBoo, setCfmGenBoo ] = React.useState( false ); // What: Confirm Generate Boolean And Setter. Why: Regenerate is confirm-gated, since it replaces any completed items. How: This toggles the footer between its plain actions and the confirm prompt.

	/**
	 * App Features Intro = App Features Intro Tip Timing Rationale
	 *
	 * @summary
	 * FeaTipCom is shown exactly once, the first time the App
	 * Features section is on screen with a real generation already
	 * behind it. shwFeaBoo alone (gated on cheDonBoo) already guarantees
	 * a generation happened, since the closing checklist item IS the
	 * generate() call, so no separate today.generatedAt check is needed
	 * here. Delayed a beat past genActBoo flipping back to false rather
	 * than firing the instant it does: genFun's own entrance animations
	 * (arriving reminders, etc.) are still settling for a few hundred ms
	 * after that, and starting this tip's own smooth-scroll immediately
	 * would fight them for the user's attention instead of waiting for
	 * the list to genuinely finish settling first.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const feaIntSeeBoo = !!( state.onboarding && state.onboarding.appFeaturesIntroSeen ); // What: Feature Intro Seen Boolean. Why: The tip must never show a second time once the user has already seen it. How: This reads state.onboarding.appFeaturesIntroSeen.
	const [ shwFeaIntBoo, setShwFeaIntBoo ] = React.useState( false ); // What: Show Feature Intro Boolean And Setter. Why: See the doc comment just above. How: This is set by the effect below.

	React.useEffect( () => { // What: Feature Intro Timing Effect. Why: See the doc comment just above. How: This stages shwFeaIntBoo true after a fixed delay, only while every gating condition holds, and clears it immediately whenever any of them stop holding.


		if ( !shwFeaBoo || feaIntSeeBoo || genActBoo ) { setShwFeaIntBoo( false ); return; } // What: Not Eligible Guard. Why: The tip must not show at all outside these 3 conditions. How: This clears shwFeaIntBoo and bails out early whenever any of them fails.


		const feaIntTmoNum = setTimeout( () => setShwFeaIntBoo( true ), 500 ); // What: Feature Intro Timeout Number. Why: This is the actual delayed reveal described in the doc comment above. How: This sets shwFeaIntBoo true 500ms later.

		return () => clearTimeout( feaIntTmoNum ); // What: Effect Cleanup Return. Why: A stale reveal must not fire after a newer effect run has already begun. How: This cancels feaIntTmoNum.


	}, [ shwFeaBoo, feaIntSeeBoo, genActBoo ] ); // What: Effect Dependency Array. Why: Any of these 3 changing can flip whether the tip should be showing at all. How: shwFeaBoo/feaIntSeeBoo/genActBoo are exactly the 3 conditions the guard above checks.

	/**
	 * Edit Mode = Edit Mode Toggle State
	 *
	 * @summary
	 * Toggles the list into a drag-to-reorder state. The banner stays
	 * mounted through its own collapse-out animation after Edit Mode
	 * ends, so Cancel/Done reverse the intro instead of vanishing
	 * instantly.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const [ ediModBoo, setEdiModBoo ]     = React.useState( false ); // What: Edit Mode Boolean And Setter. Why: This is the single source of truth for whether the list is currently in Edit Mode. How: This is toggled by togEdiFun/enterEdiFun/exitEdiFun below.
	const [ banCloBoo, setBanCloBoo ]     = React.useState( false ); // What: Banner Closing Boolean And Setter. Why: See the doc comment just above. How: This is set true right when Edit Mode ends and cleared once the collapse animation finishes.
	const groDndRef      = React.useRef( null ); // What: Group Dnd Reference. Why: startGroDraFun below needs a handle on the groups wrapper to scope the drag container to. How: This is attached to the .groups-dnd div's own ref prop further down.
	const shoOrdRef      = React.useRef( [] );   // What: Shown Order Reference. Why: Drop indices from REORDER are DOM positions, so they must resolve against whatever order the content column was LAST rendered from, not the unpadded blkOrdArr. How: This is written just before the return JSX below and read by startGroDraFun's own onDrop.
	const ordSnpRef      = React.useRef( null ); // What: Order Snapshot Reference. Why: A snapshot taken on entering Edit Mode lets Cancel/Escape discard every drag made during the whole session. How: This is populated by enterEdiFun and read/cleared by exitEdiFun.
	const [ merPmpObj, setMerPmpObj ] = React.useState( null ); // What: Merge Prompt Object And Setter. Why: A pending group-rename that would MERGE into an existing group is held here until the user confirms. How: This is set by reqRenFun below and read by GroHeaCom's own mergePending prop.

	const reqRenFun = ( oldNamStr, rawNewStr ) => { // What: Request Rename Function. Why: A group header's own rename entry point needs to normalize the typed name and, if it resolves to a DIFFERENT existing group, defer to a merge confirm rather than rename straight away. How: This normalizes rawNewStr, then either stages merPmpObj or calls actions.renameGroup directly.


		const othGroArr = [ ...new Set( state.pickers.filter( ( curPicObj ) => curPicObj.group && curPicObj.group !== oldNamStr ).map( ( curPicObj ) => curPicObj.group ) ) ]; // What: Other Group Array. Why: The collision check below needs every OTHER real group name, excluding the one being renamed. How: This deduplicates every non-matching picker's own group field via a Set.
		const tarNamStr = norGroFun( rawNewStr, othGroArr ); // What: Target Name String. Why: This is the actual normalized candidate name. How: This calls norGroFun with rawNewStr and othGroArr.

		if ( !tarNamStr || tarNamStr === oldNamStr ) return; // What: No-Op Guard. Why: An empty or unchanged normalized name has nothing to rename. How: This bails out early when either condition holds.


		if ( othGroArr.includes( tarNamStr ) ) setMerPmpObj( { from : oldNamStr, to : tarNamStr } ); // What: Merge Stage Branch. Why: A collision with another real group means this needs confirmation before merging. How: This stages merPmpObj instead of renaming immediately.

		else actions.renameGroup( oldNamStr, tarNamStr ); // What: Direct Rename Branch. Why: No collision means the rename can commit immediately. How: This calls actions.renameGroup with oldNamStr/tarNamStr.


	};

	const enterEdiFun = () => { // What: Enter Edit Function. Why: Entering Edit Mode needs to snapshot the current order first, so a later Cancel/Escape has something to revert to, and should close any open editor/confirm along the way. How: This stages ordSnpRef, then clears activeEditor/cfmGenBoo before flipping ediModBoo on.


		ordSnpRef.current = {


			groupOrder  : ( state.groupOrder || [] ).slice(),
			pickerOrder : JSON.parse( JSON.stringify( state.pickerOrder || {} ) )


		};

		setActiveEditor( null );
		setCfmGenBoo( false );
		setEdiModBoo( true );


	};

	const exitEdiFun = ( comBoo ) => { // What: Exit Edit Function. Why: Leaving Edit Mode needs to either keep or discard every drag made during the session, then play the banner's own collapse-out. How: This reverts to ordSnpRef's own snapshot unless comBoo, clears the snapshot, flips ediModBoo off, and stages banCloBoo.


		if ( banCloBoo ) return; // What: Already Closing Guard. Why: A close already in flight must not be re-triggered by a second call. How: This bails out early while banCloBoo is already true.


		if ( !comBoo && ordSnpRef.current ) actions.setTodayOrder( ordSnpRef.current.groupOrder, ordSnpRef.current.pickerOrder ); // What: Revert Branch. Why: Cancel/Escape must discard every drag made this session, restoring exactly what was snapshotted on entry. How: This writes ordSnpRef's own snapshot back via actions.setTodayOrder, only when comBoo is false.

		ordSnpRef.current = null; // What: Snapshot Clear. Why: The snapshot is no longer needed once this session has fully ended. How: This clears ordSnpRef back to null.

		setEdiModBoo( false ); // What: Edit Mode Off. Why: This is the actual mode exit. How: This flips ediModBoo to false.

		setBanCloBoo( true ); // What: Banner Closing Stage. Why: The banner needs to play its own collapse-out before unmounting. How: This flips banCloBoo to true.

		if ( redMotFun() ) setBanCloBoo( false ); // What: Reduced Motion Branch. Why: A user who prefers reduced motion should see the banner gone immediately rather than watch a collapse it won't perceive as smooth anyway. How: This clears banCloBoo back to false immediately.

		else setTimeout( () => setBanCloBoo( false ), 240 ); // What: Collapse Settle Timeout. Why: Everyone else needs the banner to stay mounted through its own real collapse animation. How: This clears banCloBoo 240ms later, matching that animation's own duration.


	};

	const togEdiFun = () => { ediModBoo ? exitEdiFun( true ) : enterEdiFun(); }; // What: Toggle Edit Function. Why: The rail's own Edit Mode button needs one handler that does the right thing either direction. How: This calls exitEdiFun(true) (treated as a commit) while already on, otherwise enterEdiFun.

	React.useEffect( () => { // What: Edit Mode Escape Effect. Why: Escape should cancel an active Edit Mode session, discarding its changes, matching every other inline editor's own Escape behavior. How: This subscribes a keydown listener only while ediModBoo is true.


		if ( !ediModBoo ) return; // What: Not Editing Guard. Why: There is nothing to cancel while Edit Mode isn't even on. How: This bails out of the effect entirely when ediModBoo is false.

		const onKeyFun = ( keyEveObj ) => { if ( keyEveObj.key === 'Escape' ) exitEdiFun( false ); }; // What: On Key Function. Why: This is the actual Escape handler. How: This calls exitEdiFun(false) (a discard) on the Escape key.

		window.addEventListener( 'keydown', onKeyFun ); // What: Keydown Subscribe Call. Why: Escape must be caught anywhere on the page while Edit Mode is on. How: This registers onKeyFun on window.

		return () => window.removeEventListener( 'keydown', onKeyFun ); // What: Effect Cleanup Return. Why: The listener must not outlive this effect run. How: This removes the same onKeyFun reference that was added above.


	}, [ ediModBoo ] ); // What: Effect Dependency Array. Why: This effect only ever needs to re-run when ediModBoo itself changes. How: ediModBoo is exactly what gates whether the listener should even be subscribed.

	const startGroDraFun = ( ptdEveObj ) => { // What: Start Group Drag Function. Why: This is the actual pointerdown handler behind every GroHeaCom's own grip. How: This resolves the drag container/handle, then hands off to REORDER.startDrag with the group-specific drop callback.


		const wrpCurEle = groDndRef.current;               // What: Wrapper Current Element. Why: This is the drag container REORDER needs. How: This reads groDndRef.current.
		const griCurEle = ptdEveObj.currentTarget;          // What: Grip Current Element. Why: REORDER needs the actual grip element that received the pointerdown. How: This reads ptdEveObj.currentTarget.
		const secCurEle = griCurEle.closest( '.group-section' ); // What: Section Current Element. Why: REORDER needs the whole draggable row (the group's own section), not just its grip. How: This walks up from griCurEle to its nearest .group-section ancestor.

		if ( !wrpCurEle || !secCurEle || !REORDER ) return; // What: Missing Prerequisite Guard. Why: A drag cannot start without all 3 of these. How: This bails out early unless every one of them exists.


		REORDER.startDrag( ptdEveObj, { // What: Start Drag Call. Why: This is the actual shared pointer-drag mechanism every reorderable list in the app uses. How: This is passed the container/handle plus 3 callbacks below.


			container    : wrpCurEle,
			gripEl       : griCurEle,
			handleEl     : secCurEle,
			itemSelector : '.group-section',

			onDrop  : ( ordNumArr ) => { // What: On Drop Callback. Why: The actual persisted group order needs to be recomputed from the drop's own DOM-position indices. How: This maps ordNumArr back through shoOrdRef's own shown order, then merges the result into state.groupOrder.


				const shoArr = shoOrdRef.current || [];                          // What: Shown Array. Why: A drop index is a DOM position, which only makes sense against whatever order was actually rendered. How: This reads shoOrdRef.current, falling back to an empty array.
				const preArr = ordNumArr.map( ( curIndNum ) => shoArr[ curIndNum ] ).filter( Boolean ); // What: Present Array. Why: This translates the drop's own numeric indices back into real block ids. How: This maps each index through shoArr, dropping any that resolve to nothing.

				actions.reorderGroups( merOrdFun( state.groupOrder || [], preArr ) ); // What: Reorder Groups Call. Why: This is the actual persisted write. How: This merges preArr's own new order back into the fuller saved order via merOrdFun.


			},

			onEnd    : () => emlTouObj.set( { dragging : false } ), // What: On End Callback. Why: The coach must reappear once the gesture ends. How: This publishes dragging:false onto the shared tour bus.
			onStart  : () => emlTouObj.set( { dragging : true } ),  // What: On Start Callback. Why: Dragging a group should hide the mini-tour coach for the gesture's own duration (see Today's own "Movable IcoSvgCom" tour step), since its tooltip card can sit right over the group being dragged. How: This publishes dragging:true onto the shared tour bus, a harmless no-op when no tour is mounted.
			scroller : mnScrRef.current?.closest( '.main' )


		} );


	};

	const startIteDraFun = ( ptdEveObj, curGroObj ) => { // What: Start Item Drag Function. Why: This is the actual pointerdown handler behind every EntCarCom's own grip within a group. How: This resolves the drag container/handle, then hands off to REORDER.startDrag with the item-specific drop callback.


		const griCurEle = ptdEveObj.currentTarget;         // What: Grip Current Element. Why: REORDER needs the actual grip element that received the pointerdown. How: This reads ptdEveObj.currentTarget.
		const lisCurEle = griCurEle.closest( '.today-list' ); // What: List Current Element. Why: This is the drag container REORDER needs, scoped to this one group's own list. How: This walks up from griCurEle to its nearest .today-list ancestor.
		const carCurEle = griCurEle.closest( '.today-card' ); // What: Card Current Element. Why: REORDER needs the whole draggable row (the item's own card), not just its grip. How: This walks up from griCurEle to its nearest .today-card ancestor.

		if ( !lisCurEle || !carCurEle || !REORDER ) return; // What: Missing Prerequisite Guard. Why: A drag cannot start without all 3 of these. How: This bails out early unless every one of them exists.


		REORDER.startDrag( ptdEveObj, { // What: Start Drag Call. Why: This is the actual shared pointer-drag mechanism every reorderable list in the app uses. How: This is passed the container/handle plus 3 callbacks below.


			container    : lisCurEle,
			gripEl       : griCurEle,
			handleEl     : carCurEle,
			itemSelector : '.today-card',

			onDrop  : ( ordNumArr ) => { // What: On Drop Callback. Why: The actual persisted per-group picker order needs to be recomputed from the drop's own DOM-position indices. How: This maps ordNumArr back through curGroObj's own current entries, then merges the result into state.pickerOrder for this group.


				const preArr = ordNumArr.map( ( curIndNum ) => curGroObj.entries[ curIndNum ].picker.id ); // What: Present Array. Why: This translates the drop's own numeric indices back into real picker ids. How: This maps each index through curGroObj's own entries array.

				actions.reorderPickersInGroup( curGroObj.name, merOrdFun( ( state.pickerOrder || {} )[ curGroObj.name ] || [], preArr ) ); // What: Reorder Pickers In Group Call. Why: This is the actual persisted write, scoped to this one group. How: This merges preArr's own new order back into this group's own fuller saved order via merOrdFun.


			},

			onEnd    : () => emlTouObj.set( { dragging : false } ), // What: On End Callback. Why: Same reasoning as startGroDraFun's own onEnd above. How: This publishes dragging:false onto the shared tour bus.
			onStart  : () => emlTouObj.set( { dragging : true } ),  // What: On Start Callback. Why: Same reasoning as startGroDraFun's own onStart above. How: This publishes dragging:true onto the shared tour bus.
			scroller : mnScrRef.current?.closest( '.main' )


		} );


	};

	const [ genMapObj, setGenMapObj ] = React.useState( null ); // What: Generate Map Object And Setter. Why: Every LoaCarCom rendered during a regeneration needs its own live { status, kind, candidates, ... } record to read from. How: This is populated by genFun below and cleared once the cascade finishes.

	const [ lvgEidArr, setLvgEidArr ] = React.useState( () => new Set() ); // What: Leaving Entry Id Array And Setter. Why: A regenerate can drop an entry entirely (its own picker produced no new pick, e.g. its last eligible item just went inactive) without a loader card to cover it, so without this it would sit untouched through the whole generation and then blink out; this flags it to play the normal removal animation instead. How: This is staged by genFun below right before the commit and cleared right after.
	const [ lvgTasSet, setLvgTasSet ] = React.useState( () => new Set() ); // What: Leaving Task Set And Setter. Why: A completed one-time reminder a Generate is about to purge needs the same played-out removal animation, on the reminder card itself, before actions.replaceTodayEntries actually removes it. How: This is staged by genFun below and cleared right after, and is passed straight through to RemSecCom as its own leavingTaskIds prop.
	const [ arvTasSet, setArvTasSet ] = React.useState( () => new Set() ); // What: Arriving Task Set And Setter. Why: A reminder a Generate just made newly visible (its day arrived but the generator hadn't run yet) needs to play an entrance instead of just popping in. How: This is staged by genFun below and cleared shortly after, and is passed straight through to RemSecCom as its own arrivingTaskIds prop.
	const genBusRef    = React.useRef( false ); // What: Generate Busy Reference. Why: genFun's own re-entrancy guard needs a value that updates synchronously, unlike React state. How: This is set true at genFun's own start and false at its own end.
	const genMapRef    = React.useRef( null );  // What: Generate Map Reference. Why: The departing-entry computation inside genFun needs to read the live generate map synchronously, without waiting for a state update to land. How: This mirrors genMapObj, written by genFun alongside every setGenMapObj call.

	const genTotMsNum = 3200; // What: Generate Total Ms Number. Why: The whole reel-cascade animation shares this one fixed total duration; per-step pace flexes with how many slots are in the list (8 slots -> 400ms each; fewer slots -> slower and savorable, more -> quicker), so the whole cascade always wraps at this exact total. How: This is divided by orderedSlots.length inside genFun below.

	/**
	 * genFun = Generate Function
	 *
	 * @summary
	 * Rolls every daily picker behind a sequential reel-cycle loader.
	 * Picks are computed up front so the loader shows the actual
	 * candidate pool and final pick for each, then commits to state at
	 * the end. Guarantees at least 1 second of loader time. optObj.auto
	 * is true only when the scheduled boundary-check effect below
	 * invokes this (never for the manual Regenerate button or the
	 * onboarding tour's simulated click); it is threaded straight into
	 * actions.replaceTodayEntries since only an auto-run resets today's
	 * own streak claim, see that action's own comment for why.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/
	const genFun = async ( optObj = {} ) => {


		const isaAutBoo = !!optObj.auto; // What: Is-A Auto Boolean. Why: Every branch below that behaves differently for a scheduled auto-run versus a manual/tour-triggered one needs this single flag. How: This reads optObj.auto, coerced to a real boolean.

		if ( genBusRef.current ) return; // What: Already Generating Guard. Why: A second call while one is already mid-cascade must be a no-op. How: This bails out early while genBusRef is already true.

		genBusRef.current = true; // What: Generate Busy Set. Why: Every call from here on, until this function's own end, must be treated as busy. How: This flags genBusRef true for the whole duration of this call.


		/**
		 * Scroll To Top = Pre-Cascade Scroll Rationale
		 *
		 * @summary
		 * Scrolls the list back to the top before the reel-cycle
		 * animation starts, since the "Generated on..." button sits at
		 * the bottom of the list and users would otherwise miss the
		 * cascade entirely. Waits briefly for the smooth scroll to settle
		 * before kicking off the loaders.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		*/

		const scrCurEle = mnScrRef.current?.closest( '.main' ); // What: Scroller Current Element. Why: The scroll-to-top below needs the real scroll container when one exists. How: This walks up from mnScrRef.current to its nearest .main ancestor.
		const atTopBoo  = scrCurEle ? scrCurEle.scrollTop <= 1 : window.scrollY <= 1; // What: At Top Boolean. Why: A list already at the top needs no scroll (and no settle wait) at all. How: This checks either the scroller's own scrollTop or the window's own scrollY.

		if ( !atTopBoo ) { // What: Needs Scroll Branch. Why: Only a list that isn't already at the top needs the scroll-and-wait sequence below. How: This flags skpSpyRef, scrolls, waits, then releases skpSpyRef.


			skpSpyRef.current = true; // What: Skip Spy Set. Why: The scroll-spy effect must not fight this programmatic scroll while it is in flight. How: This flags skpSpyRef true for the duration of the scroll below.

			if ( scrCurEle ) scrCurEle.scrollTo( { top : 0, behavior : redMotFun() ? 'auto' : 'smooth' } ); // What: Scroller Scroll Call. Why: A real scroll container needs its own scrollTo. How: This scrolls scrCurEle to the top, smoothly unless reduced motion is preferred.

			else window.scrollTo( { top : 0, behavior : redMotFun() ? 'auto' : 'smooth' } ); // What: Window Scroll Call. Why: Without a real scroll container, the window itself must be scrolled instead. How: This scrolls the window to the top, smoothly unless reduced motion is preferred.


			await new Promise( ( resFun ) => setTimeout( resFun, 450 ) ); // What: Settle Wait. Why: The smooth scroll needs time to actually finish before the cascade begins. How: This awaits a fixed 450ms.

			skpSpyRef.current = false; // What: Skip Spy Release. Why: The scroll-spy effect may resume once the scroll has settled. How: This clears skpSpyRef back to false.


		}


		/**
		 * Compute Picks Upfront = Compute Picks Upfront Rationale
		 *
		 * @summary
		 * Picks are computed up front so this function has stable
		 * candidate pools and final ids before any animation starts. A
		 * picker only runs today if its own schedule allows it: the
		 * current weekday must be in daysOfWeek, and if skipHolidays is
		 * on, today must not be an active holiday.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		*/

		const genNowDat   = new Date();                                            // What: Generate Now Date. Why: Every schedule/cadence/holiday check below needs one single, consistent "now" for this whole generation pass. How: This is a fresh Date, read once.
		const dowNum      = genNowDat.getDay();                                     // What: Day Of Week Number. Why: A picker's own daysOfWeek gate is checked against this. How: This reads genNowDat.getDay().
		const holTodBoo   = HOL_NAM_OBJ.holDatFun( state.holidays, genNowDat );      // What: Holiday Today Boolean. Why: A picker's own skipHolidays gate is checked against this. How: This calls HOL_NAM_OBJ.holDatFun with state.holidays and genNowDat.

		const conArr    = actions.resolveConditionalsForDay() || state.conditionals || []; // What: Conditional Array. Why: Phase A resolves every conditional's own `triggered` for today up front, before the per-picker loop below needs to read it. How: This calls actions.resolveConditionalsForDay, falling back to state.conditionals or an empty array.
		const conByIdMap = new Map( conArr.map( ( curConObj ) => [ curConObj.id, curConObj ] ) );   // What: Conditional By Id Map. Why: The per-picker loop below needs a fast lookup from a picker's own conditionalId to its resolved conditional. How: This maps conArr down to an id-keyed Map.

		const exiByPicMap = new Map(); // What: Existing By Picker Map. Why: Existing live pick/charging entries are the source of truth for cadence carry/suppress decisions, since they persist across days until a regenerate. How: This is populated by the loop just below.

		for ( const curEntObj of state.today.entries ) { // What: Existing Entry Index Loop. Why: Every current entry needs indexing by picker before the main per-picker loop below can consult it. How: This walks state.today.entries, keying exiByPicMap by pickerId (day-off cards, which have none, are excluded).


			if ( curEntObj.pickerId && curEntObj.kind !== 'dayoff' ) exiByPicMap.set( curEntObj.pickerId, curEntObj );


		}

		const dofCarArr    = [];        // What: Dayoff Card Array. Why: One card per triggered conditional (first hit wins) is collected here before the commit. How: This is pushed to inside the main loop below.
		const carShnSet    = new Set(); // What: Card Shown Set. Why: Only the FIRST suppressed picker for a given conditional should surface its own day-off card. How: This is checked and added to inside the main loop below.
		const empEasArr    = [];        // What: Empty Ease Array. Why: One card per ease-up picker with nothing eligible today is collected here before the commit. How: This is pushed to inside the main loop below.
		const newPicArr    = [];        // What: New Pick Array. Why: Every fresh pick this generation actually produced is collected here before the commit. How: This is pushed to inside the main loop below.

		const ordSltArr = []; // What: Ordered Slot Array. Why: Ordered animation slots (encounter order) let day-off/charging cards settle DURING the cascade alongside picks, instead of popping in at the final commit; each slot is keyed by the picker whose list position it occupies during the loader. How: This is pushed to inside the main loop below.
		const carEntArr = []; // What: Carried Entry Array. Why: A cadence pick persisting from a prior day still needs its own encounter-order slot, wrapped so the commit step below can tell it apart from a fresh pick. How: This is pushed to inside the main loop below.

		const picNamSet = new Set(); // What: Picked Name Set. Why: Item names already committed to today's list so far (lowercased) are fed to any avoidDuplicates picker below so it won't re-surface an item another picker already put on today's list; seeded with carried-over cadence picks (still "on the list" today, just not freshly picked), then grown as each fresh pick lands, in encounter order, matching "as it is being built" rather than checking against the final list. How: This is read by PIC_NAM_OBJ.picIteFun's own excludeNames option and added to throughout the loop below.
		const cadNsObj  = CAD_NAM_OBJ; // What: Cadence Namespace Object. Why: A short local alias reads more naturally throughout the dense loop below than the full import name repeated everywhere. How: This is just CAD_NAM_OBJ itself.

		for ( const curPicIdeStr of state.daily.pickerIds ) { // What: Daily Picker Loop. Why: This is the actual per-picker scheduling/picking pass every other collection above feeds from. How: This walks every picker id in state.daily.pickerIds, gating and picking (or suppressing) each one in turn.


			const picRecObj = state.pickers.find( ( curPicObj ) => curPicObj.id === curPicIdeStr ); // What: Picker Record Object. Why: Every check below needs the real picker record, not just its id. How: This finds the picker matching curPicIdeStr.

			if ( !picRecObj || picRecObj.hidden ) continue; // What: Missing Or Hidden Guard. Why: A deleted or still-hidden (mid-onboarding) picker must not run today at all. How: This skips curPicIdeStr when picRecObj is missing or flagged hidden.

			if ( Array.isArray( picRecObj.daysOfWeek ) && !picRecObj.daysOfWeek.includes( dowNum ) ) continue; // What: Weekday Gate. Why: A picker scoped to specific weekdays must not run on any other day. How: This skips curPicIdeStr when daysOfWeek is a real array that doesn't include dowNum.

			if ( picRecObj.skipHolidays && holTodBoo ) continue; // What: Holiday Gate. Why: A picker opted into skipping holidays must not run on an active one. How: This skips curPicIdeStr when both flags hold.


			/**
			 * Cadence Gate = Picker Cadence Gate Rationale
			 *
			 * @summary
			 * Non-daily pickers surface at most once per period. If this
			 * period is already satisfied (its surfaced card completed,
			 * or a done pick logged), nothing is emitted at all. If a
			 * not-done card from the current period exists, it is
			 * CARRIED verbatim (locked, persists). Otherwise this falls
			 * through to a fresh surface, tagged with this period.
			 *
			 * @author z4nta0 <https://github.com/z4nta0>
			 *
			*/

			const picCadStr = picRecObj.cadence || 'daily'; // What: Picker Cadence String. Why: Every branch in this region reads this same resolved cadence. How: This reads picRecObj.cadence, falling back to 'daily'.

			if ( picCadStr !== 'daily' ) { // What: Non-Daily Branch. Why: See the doc comment just above. How: This runs the period-key/carry/completed checks and, when none of them apply, falls through to the fresh-surface path below.


				const perKeyStr = cadNsObj.perKeyFun( picRecObj, genNowDat );  // What: Period Key String. Why: This identifies exactly which period (week/month/year) this picker's own card belongs to right now. How: This calls cadNsObj.perKeyFun.
				const exiEntObj = exiByPicMap.get( curPicIdeStr );             // What: Existing Entry Object. Why: A live entry already on screen for this exact period must be carried or recognized as satisfied. How: This reads exiByPicMap at curPicIdeStr.

				if ( exiEntObj && exiEntObj.periodKey === perKeyStr ) { // What: Same Period Branch. Why: An entry already logged against THIS exact period needs either carrying (still open) or skipping (already satisfied). How: This checks exiEntObj.done to choose between the two.


					if ( exiEntObj.done ) continue; // What: Period Satisfied Skip. Why: A completed entry for this period means nothing further should surface. How: This skips curPicIdeStr entirely.


					carEntArr.push( { _carry : true, entry : exiEntObj } ); // What: Carried Entry Push. Why: A not-yet-done entry from the current period must persist verbatim, locked, rather than being replaced. How: This wraps exiEntObj in a { _carry, entry } marker for the commit step below.

					const carIteObj = state.items.find( ( curIteObj ) => curIteObj.id === exiEntObj.itemId ); // What: Carried Item Object. Why: The carried item's own name still needs to join picNamSet, same as a fresh pick would. How: This finds the item matching exiEntObj's own itemId.

					if ( carIteObj ) picNamSet.add( carIteObj.name.toLowerCase() ); // What: Carried Name Add. Why: An avoidDuplicates picker elsewhere in this loop must not re-surface an item this carried card already shows. How: This adds carIteObj's own lowercased name to picNamSet.



					continue; // What: Carried Continue. Why: A carried card needs no fresh pick this generation. How: This skips the rest of the loop body for curPicIdeStr.


				}

				if ( cadNsObj.comPerFun( picRecObj, state.pickLog, genNowDat ) ) continue; // What: Completed This Period Skip. Why: A completed pick logged this period, even with the entry itself wiped, still satisfies the cadence. How: This skips curPicIdeStr when cadNsObj.comPerFun reports true.


			}

			/**
			 * Conditional Gate = Day-Off Conditional Gate
			 *
			 * @summary
			 * When the picker's own conditional is triggered it is
			 * suppressed; the FIRST suppressed picker for that
			 * conditional surfaces a single day-off card instead.
			 *
			 * @author z4nta0 <https://github.com/z4nta0>
			 *
			*/

			const conRecObj = picRecObj.conditionalId ? conByIdMap.get( picRecObj.conditionalId ) : null; // What: Conditional Record Object. Why: This is the resolved conditional this picker's own suppression check reads. How: This looks up picRecObj's own conditionalId in conByIdMap, or null when it has none.

			if ( CON_NAM_OBJ.supGatFun( conRecObj ) ) { // What: Suppressed Branch. Why: See the doc comment just above. How: This surfaces (or skips, if already shown) a day-off card, then always continues past the pick attempt below.


				if ( !carShnSet.has( conRecObj.id ) ) { // What: First Hit Guard. Why: Only the first picker suppressed by this exact conditional should surface its own card. How: This runs the push below only the first time conRecObj's own id is seen.


					carShnSet.add( conRecObj.id ); // What: Card Shown Add. Why: Every LATER picker suppressed by this same conditional must not surface a second card. How: This adds conRecObj's own id to carShnSet.

					const carTexStr = conRecObj.cardText || conRecObj.name; // What: Card Text String. Why: The day-off card needs its own display text. How: This reads conRecObj.cardText, falling back to its own name.

					dofCarArr.push( { kind : 'dayoff', conditionalId : conRecObj.id, cardText : carTexStr, group : picRecObj.group || 'Other',

						pickerName : picRecObj.name, condName : conRecObj.name,
						...( picCadStr !== 'daily' ? { periodKey : cadNsObj.perKeyFun( picRecObj, genNowDat ) } : {} )

					} ); // What: Dayoff Card Push. Why: This is the actual card the commit step below turns into a real entry. How: This builds the full day-off record, tagging a period key only for a non-daily picker.

					ordSltArr.push( { pickerId : curPicIdeStr, info : { kind : 'dayoff', candidates : [], cardText : carTexStr, conditionalId : conRecObj.id } } ); // What: Ordered Slot Push. Why: The day-off card still needs its own animation slot, in encounter order alongside every pick. How: This pushes a { pickerId, info } pair keyed by curPicIdeStr.


				}



				continue; // What: Suppressed Continue. Why: A suppressed picker never attempts a real pick. How: This skips the pick attempt below entirely.


			}

			const perKeyStr = picCadStr !== 'daily' ? cadNsObj.perKeyFun( picRecObj, genNowDat ) : null; // What: Period Key String. Why: A fresh non-daily pick still needs to be tagged with the period it belongs to, so a future generation can recognize it as already-current. How: This computes the period key only for a non-daily picker, otherwise null.
			const picResObj = PIC_NAM_OBJ.picIteFun( picRecObj, state.items, { excludeNames : picNamSet } ); // What: Pick Result Object. Why: This is the actual picking engine call for this picker. How: This calls PIC_NAM_OBJ.picIteFun, passing picNamSet so an avoidDuplicates picker won't re-surface an already-committed name.

			if ( picResObj.picObj ) { // What: Picked Branch. Why: A successful pick needs collecting into newPicArr plus its own animation slot. How: This adds the picked name to picNamSet, then pushes both records.


				picNamSet.add( picResObj.picObj.name.toLowerCase() ); // What: Picked Name Add. Why: A LATER avoidDuplicates picker in this same loop must not re-surface this exact name. How: This adds picResObj.picObj's own lowercased name to picNamSet.

				newPicArr.push( { // What: New Pick Push. Why: This is the actual pending-commit record for this fresh pick. How: This bundles curPicIdeStr, the full picResObj, its own cycle candidates, picked id, depletedEnd flag, and period key.


					candidates  : picResObj.cycArr || [],
					depletedEnd : !!picResObj.depBoo,
					periodKey   : perKeyStr,
					pickedId    : picResObj.picObj.id,
					pickerId    : curPicIdeStr,
					res         : picResObj


				} );

				ordSltArr.push( { pickerId : curPicIdeStr, info : { kind : 'pick', candidates : picResObj.cycArr || [], pickedId : picResObj.picObj.id } } ); // What: Ordered Slot Push. Why: This pick still needs its own animation slot, in encounter order. How: This pushes a { pickerId, info } pair keyed by curPicIdeStr.


			}

			else if ( picRecObj.mode === 'ease-up' && picResObj.updArr && picResObj.updArr.length ) { // What: Empty Ease-Up Branch. Why: An ease-up picker with nothing charged to threshold still needs a "charging" card so the day's own drift (picResObj.updArr) is applied only once the user checks it, consistent with done-gating; without this the drift would be dropped and the picker could never climb to eligibility. How: This collects a charging card plus its own animation slot.


				empEasArr.push( { kind : 'charging', pickerId : curPicIdeStr, group : picRecObj.group || 'Other',

					pending : { updates : picResObj.updArr }, ...( perKeyStr ? { periodKey : perKeyStr } : {} )

				} ); // What: Charging Card Push. Why: This is the actual pending-commit record for this charging card. How: This bundles curPicIdeStr, its own group, the staged drift updates, and an optional period key.

				ordSltArr.push( { pickerId : curPicIdeStr, info : { kind : 'charging', candidates : [] } } ); // What: Ordered Slot Push. Why: This charging card still needs its own animation slot, in encounter order. How: This pushes a { pickerId, info } pair keyed by curPicIdeStr.


			}


		}

		const iniSltMapObj = {}; // What: Initial Slot Map Object. Why: Every slot must start pending, before the loop below flips each to active then settled in turn. How: This is populated just below from ordSltArr.

		for ( const curSltObj of ordSltArr ) iniSltMapObj[ curSltObj.pickerId ] = { status : 'pending', ...curSltObj.info }; // What: Initial Slot Populate. Why: This is the actual per-slot seed every LoaCarCom reads from at the very start of the cascade. How: This writes one { status: 'pending', ...info } entry per ordSltArr member.

		genMapRef.current = iniSltMapObj; // What: Generate Map Reference Set. Why: The departing-entry computation further below needs to read this synchronously, before React has necessarily committed the matching state update. How: This mirrors iniSltMapObj into genMapRef.

		setGenMapObj( iniSltMapObj ); // What: Generate Map Set. Why: Every LoaCarCom needs this initial map to render its own pending state. How: This publishes iniSltMapObj into genMapObj.
		setOpeLogStr( null );        // What: Open Log Clear. Why: A Day Log panel left open during a regeneration would show stale data mid-cascade. How: This clears opeLogStr.
		setGenActBoo( true );        // What: Generate Active Set. Why: The footer/rail need to know a cascade is now playing. How: This flips genActBoo to true.


		if ( redMotFun && redMotFun() ) { // What: Reduced Motion Branch. Why: The picks are already fully computed above, so the pending-active-settled cascade is pure theatre for a user who won't perceive it as smooth anyway; this commits every slot straight to settled instead of making them wait genTotMsNum for a list that already exists. How: This builds and publishes an all-settled map immediately.


			const setSltMapObj = {}; // What: Settled Slot Map Object. Why: Every slot needs to land at 'settled' in one shot. How: This is populated just below from ordSltArr.

			for ( const curSltObj of ordSltArr ) setSltMapObj[ curSltObj.pickerId ] = { status : 'settled', ...curSltObj.info }; // What: Settled Slot Populate. Why: This is the actual all-settled map. How: This writes one { status: 'settled', ...info } entry per ordSltArr member.

			setGenMapObj( setSltMapObj ); // What: Generate Map Set. Why: Every LoaCarCom needs to render its own final settled state immediately. How: This publishes setSltMapObj into genMapObj.


		}

		else { // What: Full Cascade Branch. Why: Everyone else gets the real pending-active-settled reel cascade, one slot at a time. How: This awaits perStpMsNum between each slot's own active-then-settled transition.


			const perStpMsNum = ordSltArr.length > 0 ? genTotMsNum / ordSltArr.length : 0; // What: Per Step Ms Number. Why: The whole cascade must always wrap at genTotMsNum regardless of how many slots exist. How: This divides genTotMsNum by ordSltArr's own length.

			for ( const curSltObj of ordSltArr ) { // What: Cascade Step Loop. Why: This is the actual per-slot animation driver. How: This flips each slot to active, waits perStpMsNum, then flips it to settled, in encounter order.


				setGenMapObj( ( curMapObj ) => curMapObj ? ( { ...curMapObj, [ curSltObj.pickerId ] : { ...curMapObj[ curSltObj.pickerId ], status : 'active' } } ) : curMapObj ); // What: Slot Active Set. Why: This is the actual step-start transition for this one slot. How: This patches just this slot's own status to 'active', leaving every other slot's own record untouched.

				// eslint-disable-next-line no-await-in-loop
				await new Promise( ( resFun ) => setTimeout( resFun, perStpMsNum ) ); // What: Step Wait. Why: Each slot's own active phase needs to actually be visible for a beat before settling. How: This awaits perStpMsNum.

				setGenMapObj( ( curMapObj ) => curMapObj ? ( { ...curMapObj, [ curSltObj.pickerId ] : { ...curMapObj[ curSltObj.pickerId ], status : 'settled' } } ) : curMapObj ); // What: Slot Settled Set. Why: This is the actual step-end transition for this one slot. How: This patches just this slot's own status to 'settled'.


			}


		}

		/**
		 * Commit Picks = Commit Picks Rationale
		 *
		 * @summary
		 * Commits picks all at once, then hides the loader. Value
		 * mutations are staged as `pending` on each entry and applied
		 * only when the entry is marked done.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		*/

		const nexEntArr = [ // What: Next Entry Array. Why: This is the exact new today.entries this generation produces. How: This concatenates every carried entry, day-off card, empty-ease card, and fresh pick (staged as pending) into one array.

			...carEntArr,
			...dofCarArr,
			...empEasArr,
			...newPicArr.map( ( curPikObj ) => ( {

				pickerId : curPikObj.pickerId, itemId : curPikObj.pickedId,
				...( curPikObj.periodKey ? { periodKey : curPikObj.periodKey } : {} ),
				pending : { updates : curPikObj.res.updArr, pickerPatch : curPikObj.res.patObj,
					depletedEnd : curPikObj.res.depBoo, pickedId : curPikObj.pickedId, bumpPick : true }

			} ) )

		];

		/**
		 * Departing Rows = Departing Row Detection Rationale
		 *
		 * @summary
		 * Anything on screen that is neither carried nor covered by a
		 * loader card is about to vanish. Playing the removal animation
		 * first lets it leave the way a skipped or deleted card does. Two
		 * card types need care: a carried cadence entry (pushed as a
		 * `{ _carry, entry }` wrapper) keeps its own eid across the
		 * commit, so it is NOT departing; a day-off card has no pickerId
		 * (its own loader slot is registered under the suppressed
		 * picker's id instead), so it is matched by conditionalId:
		 * departing only when the conditional no longer produces a card.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		*/

		const kepEidSet = new Set( carEntArr.map( ( curCarObj ) => curCarObj._carry ? curCarObj.entry.eid : curCarObj.eid ) ); // What: Kept Eid Set. Why: A carried entry's own eid must never be treated as departing. How: This reads each carEntArr member's own eid (unwrapping the _carry marker where needed).
		const nexDofSet = new Set( dofCarArr.map( ( curDofObj ) => curDofObj.conditionalId ) ); // What: Next Dayoff Set. Why: A day-off card's own departure is judged by whether its conditional still produces one, not by eid. How: This collects every fresh day-off card's own conditionalId.

		const depEidArr = ( state.today.entries || [] ) // What: Departing Eid Array. Why: This is the actual list of eids about to be removed, needing their own exit animation first. How: This filters every current entry down to the ones matching neither exclusion above.
			.filter( ( curEntObj ) => {


				if ( kepEidSet.has( curEntObj.eid ) ) return false;

				if ( curEntObj.kind === 'dayoff' ) return !nexDofSet.has( curEntObj.conditionalId );

				return !( curEntObj.pickerId && genMapRef.current && genMapRef.current[ curEntObj.pickerId ] );


			} )
			.map( ( curEntObj ) => curEntObj.eid );

		/**
		 * Reminder Transitions = Reminder Departure/Arrival Detection
		 *
		 * @summary
		 * Completed one-time reminders are purged by
		 * actions.replaceTodayEntries below; playing their exit animation
		 * first, rather than letting them vanish instantly, uses the PRE-
		 * generate anchor (this genFun call hasn't bumped generatedAt
		 * yet), matching what's actually on screen right now. Reminders
		 * whose day arrived while the generator was overdue (this fix's
		 * whole point) weren't shown a moment ago under the old anchor,
		 * and are about to become visible under this genFun call's new
		 * one; diffing the two id sets lets them get the entrance
		 * animation instead of popping in.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		*/

		const oldDueArr = TASKS.visibleToday( state.tasks, state.reminderOpts, state.holidays, remAncObj ); // What: Old Due Array. Why: This is exactly what RemSecCom is showing right now, before this generation's own anchor shift. How: This calls TASKS.visibleToday with the PRE-generate remAncObj.
		const depTasArr = oldDueArr.filter( ( curTasObj ) => TASKS.isCompletedOnce( curTasObj ) ).map( ( curTasObj ) => curTasObj.id ); // What: Departing Task Array. Why: A completed one-time reminder is about to be purged and needs its own exit animation first. How: This filters oldDueArr down to completed-once entries, then maps to just their ids.

		const oldDueSet = new Set( oldDueArr.map( ( curTasObj ) => curTasObj.id ) );                                              // What: Old Due Set. Why: The arrival diff below needs a fast membership check against the PRE-generate visible set. How: This collects every oldDueArr entry's own id.
		const newDueArr = TASKS.visibleToday( state.tasks, state.reminderOpts, state.holidays, genNowDat );                       // What: New Due Array. Why: This is what becomes visible under the fresh, post-generate anchor. How: This calls TASKS.visibleToday with genNowDat as the anchor.
		const arrTasArr = newDueArr.filter( ( curTasObj ) => !oldDueSet.has( curTasObj.id ) ).map( ( curTasObj ) => curTasObj.id ); // What: Arriving Task Array. Why: This is exactly which reminders are newly visible and deserve an entrance animation. How: This filters newDueArr down to ids absent from oldDueSet.

		if ( ( depEidArr.length || depTasArr.length ) && !( redMotFun && redMotFun() ) ) { // What: Departure Animation Branch. Why: A departing row/reminder needs time to actually play its own exit animation before the underlying data changes out from under it. How: This stages both leaving sets, then awaits a fixed settle period.


			if ( depEidArr.length ) setLvgEidArr( new Set( depEidArr ) ); // What: Leaving Entry Stage. Why: EntCarCom's own isaRemBoo prop needs this set to know which rows are departing. How: This publishes depEidArr into lvgEidArr.

			if ( depTasArr.length ) setLvgTasSet( new Set( depTasArr ) ); // What: Leaving Task Stage. Why: RemSecCom's own leavingTaskIds prop needs this set to know which reminders are departing. How: This publishes depTasArr into lvgTasSet.

			await new Promise( ( resFun ) => setTimeout( resFun, 260 ) ); // What: Departure Settle Wait. Why: The exit animations above need real time to actually play before the commit below. How: This awaits a fixed 260ms.


		}

		actions.replaceTodayEntries( nexEntArr, { resetStreak : isaAutBoo } ); // What: Replace Today Entries Call. Why: This is the actual commit, writing nexEntArr as the new state.today.entries. How: This calls actions.replaceTodayEntries, resetting the streak claim only for an auto-run.
		actions.markGenerated(); // What: Mark Generated Call. Why: state.today.generatedAt (and every anchor/count derived from it) needs to reflect this fresh generation. How: This calls actions.markGenerated.

		if ( cheDonBoo && APP_FEA_ARR.every( ( curFeaObj ) => feaStaObj[ curFeaObj.ideStr ] ) ) { // What: Feature Section Resolve Guard. Why: The App Features section (see shwFeaBoo's own doc comment above) is only allowed to finally disappear here, at a real generation boundary, not the instant the last tutorial resolves; checked fresh on every genFun call (both manual Regenerate and the Daily Generator funnel through this same function) rather than only once, so a generation that happens to land after the very last tutorial finishes is what actually hides it. How: This flips both resolution flags only once every App Feature is already done.


			actions.setOnboarding( { appFeaturesSectionResolved : true, appFeaturesEverCompleted : true } ); // What: Set Onboarding Call. Why: fecDonBoo is the permanent half of this pair, see its own doc comment above for why it must never reset alongside fsrFlaBoo on a Replay Tour. How: This writes both flags true.


		}

		setLvgEidArr( new Set() ); // What: Leaving Entry Clear. Why: The commit above already applied, so nothing is departing any more. How: This clears lvgEidArr back to empty.
		setLvgTasSet( new Set() ); // What: Leaving Task Clear. Why: Same reasoning as leaving entries, for reminders. How: This clears lvgTasSet back to empty.

		if ( arrTasArr.length && !( redMotFun && redMotFun() ) ) { // What: Arrival Animation Branch. Why: A newly-visible reminder deserves its own brief entrance flourish instead of popping in silently. How: This stages arvTasSet, then clears it again shortly after.


			setArvTasSet( new Set( arrTasArr ) );

			setTimeout( () => setArvTasSet( new Set() ), 400 );


		}

		setGenActBoo( false );      // What: Generate Active Clear. Why: The cascade has now fully finished. How: This flips genActBoo back to false.
		setGenMapObj( null );       // What: Generate Map Clear. Why: No LoaCarCom needs to render any more once the commit has landed. How: This clears genMapObj back to null.
		genMapRef.current = null;   // What: Generate Map Reference Clear. Why: The synchronous mirror must clear alongside the state it mirrors. How: This clears genMapRef.
		genBusRef.current = false;  // What: Generate Busy Clear. Why: A future call is now free to proceed. How: This clears genBusRef.
		setCfmGenBoo( false );      // What: Confirm Generate Clear. Why: Any still-open confirm prompt is now moot, since the generation it was confirming has already run. How: This clears cfmGenBoo.


	};

	const genRefObj = React.useRef( genFun ); // What: Generate Reference Object. Why: The onboarding tour's own "Generate now" step needs to call the LATEST genFun closure directly, skipping the footer's own replace-confirmation dialog. How: This is kept in sync by the line just below on every render.

	genRefObj.current = genFun; // What: Generate Reference Update. Why: Every render's own fresh genFun closure must replace whatever this ref held before. How: This overwrites genRefObj.current unconditionally.

	React.useEffect( () => { window.__emlGenerate = () => genRefObj.current && genRefObj.current(); }, [] ); // What: Global Generate Expose Effect. Why: The onboarding tour drives generation through this documented window global (see this file's own "Runtime globals on window" convention). How: This assigns a thin wrapper calling genRefObj's own current function, once on mount.

	// #endregion Regenerate



	/**
	 * dlyAutFun = Daily Auto-Generator Effect
	 *
	 * @summary
	 * When the Daily generator is in 'auto' mode, builds the day on its
	 * own at or after the configured run time (default 4:00 AM). This is
	 * a catch-up check, not a fire-at-exactly-4:00 alarm: opening the app
	 * any time after the run time on a period that hasn't been generated
	 * yet triggers it. Uses the same reel animation as manual Regenerate.
	 * If the current period's list already exists it does nothing (the
	 * list simply shows, no animation). Checked on mount and once a
	 * minute, so an app left open across the run-time boundary still
	 * fires. genBusRef's own guard (set synchronously at the top of
	 * genFun) plus the boundary check prevent any double run.
	 *
	 * The period boundary is the RUN TIME, not midnight. That distinction
	 * matters: comparing calendar days meant a generation between
	 * midnight and the run time (the onboarding tour at 1am, say) marked
	 * the whole day as done and silently cancelled that day's auto-run.
	 * The app's day starts at the run time, so a 1am list belongs to the
	 * previous period and 4am should still refresh it.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	React.useEffect( () => {


		const dlyRecObj = state.daily || {}; // What: Daily Record Object. Why: Every check below reads this same resolved daily-generator config. How: This reads state.daily, falling back to an empty object.

		if ( ( dlyRecObj.mode || 'auto' ) !== 'auto' ) return; // What: Not Auto Mode Guard. Why: A manual-only daily generator must never run itself. How: This bails out of the effect entirely unless dlyRecObj.mode resolves to 'auto'.


		const cheFun = () => { // What: Check Function. Why: This is the actual boundary check, run both immediately and on a recurring interval below. How: This resolves the most recent run-time boundary and calls genRefObj's own current function only when this period hasn't been generated yet.


			if ( genBusRef.current ) return; // What: Already Generating Guard. Why: A cascade already in flight must not be double-triggered. How: This bails out early while genBusRef is already true.

			if ( !state.pickers || !state.pickers.length ) return; // What: No Pickers Guard. Why: Nothing runs daily at all without at least one picker. How: This bails out early when state.pickers is empty or missing.


			const curNowDat2 = new Date(); // What: Current Now Date. Why: The boundary math below needs "now" as a real Date. How: This is a fresh Date, read once.

			const [ runHouNum, runMinNum ] = ( dlyRecObj.runTime || '04:00' ).split( ':' ).map( Number ); // What: Run Hour/Minute Number. Why: The boundary below is built from the configured run time's own hour and minute. How: This splits dlyRecObj.runTime (or its '04:00' default) on ':' and parses both halves as numbers.
			const bndDatObj = new Date( curNowDat2 );                                                     // What: Boundary Date Object. Why: The most recent occurrence of the run time needs its own mutable Date to adjust below. How: This starts as a copy of curNowDat2.

			bndDatObj.setHours( runHouNum, runMinNum, 0, 0 ); // What: Boundary Hours Set. Why: This pins bndDatObj to TODAY's own run time, before the day-back adjustment below. How: This sets bndDatObj's own hours/minutes/seconds/ms.

			if ( bndDatObj > curNowDat2 ) bndDatObj.setDate( bndDatObj.getDate() - 1 ); // What: Day-Back Adjustment. Why: If today's own run time hasn't happened yet, the most recent occurrence was actually yesterday's. How: This subtracts 1 day from bndDatObj only when it is still in the future relative to curNowDat2.


			const genDatObj = state.today && state.today.generatedAt ? new Date( state.today.generatedAt ) : null; // What: Generated Date Object. Why: The already-generated check below needs the last real generation as a comparable Date. How: This reads state.today.generatedAt, or null when it has never been set.

			if ( genDatObj && genDatObj >= bndDatObj ) return; // What: Already Generated Guard. Why: A generation already at or after the current boundary means this period is already satisfied. How: This bails out early when genDatObj exists and is not older than bndDatObj.


			if ( genRefObj.current ) { // What: Trigger Branch. Why: Everything above has now confirmed this period genuinely needs generating. How: This calls genRefObj's own current function with auto:true, then fires a best-effort notification.


				genRefObj.current( { auto : true } ); // What: Auto Generate Call. Why: This is the actual trigger. How: This calls genRefObj.current with { auto: true }.

				try { if ( NOT_NAM_OBJ ) Promise.resolve( NOT_NAM_OBJ.genNotFun() ).catch( () => {} ); } catch ( e ) {} // What: Notification Attempt. Why: A post-hoc notice is enough since the list is already built by the time the user could ever see it; suppressed when the app is visible/focused, and a failed notification must never break the run. How: This calls NOT_NAM_OBJ.genNotFun(), swallowing any rejection/thrown error.


			}


		};

		cheFun(); // What: Initial Check Call. Why: An app opened well after the run time needs this checked immediately, not just on the next minute tick. How: This invokes cheFun once, synchronously.

		const cheIntNum = setInterval( cheFun, 60000 ); // What: Check Interval Number. Why: An app left open across the run-time boundary still needs to catch it. How: This re-runs cheFun once a minute.

		return () => clearInterval( cheIntNum ); // What: Effect Cleanup Return. Why: The interval must not outlive this effect run. How: This clears cheIntNum.


	}, [ state.daily, state.today && state.today.generatedAt, state.pickers.length ] ); // What: Effect Dependency Array. Why: A changed daily-generator config, a fresh generation, or the picker count itself all need this effect to re-evaluate. How: Each of these 3 can change whether/when the next auto-run should fire.



	/**
	 * Empty-State CTAs = Empty-State CTA Rationale
	 *
	 * @summary
	 * New-user empty-state calls to action for "no pickers at all" and
	 * "pickers exist but nothing runnable today".
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const newSltByGroObj = React.useMemo( () => { // What: New Slot By Group Object. Why: While generating, a group with no entries yet but an incoming slot still needs somewhere to host its own placeholder loader, or the card would only pop in at commit. How: This is only ever populated while genActBoo/genMapObj hold, keyed by group name.


		if ( !genActBoo || !genMapObj ) return {}; // What: Not Generating Guard. Why: Outside an active cascade there is nothing to compute here at all. How: This returns an empty object early unless both conditions hold.


		const curEntArr  = state.today.entries || [];                                                   // What: Current Entry Array. Why: The "already on screen" checks below need today's own current entries. How: This reads state.today.entries, falling back to an empty array.
		const havPicSet  = new Set( curEntArr.map( ( curEntObj ) => curEntObj.pickerId ).filter( Boolean ) ); // What: Have Picker Set. Why: A picker already represented by a real entry doesn't need a placeholder slot. How: This collects every current entry's own pickerId.
		const havDofSet  = new Set( curEntArr.filter( ( curEntObj ) => curEntObj.kind === 'dayoff' ).map( ( curEntObj ) => curEntObj.conditionalId ) ); // What: Have Dayoff Set. Why: A day-off card carries a conditionalId instead of a pickerId, so its own "already on screen" check needs its own set. How: This collects every current day-off entry's own conditionalId.
		const outMapObj  = {}; // What: Out Map Object. Why: This is the actual { groupName: [picker, ...] } result being built. How: This is populated by the loop below and returned at the end.

		for ( const curPicIdeStr of Object.keys( genMapObj ) ) { // What: Generating Picker Loop. Why: Every picker with an active generation slot is a candidate for a placeholder, unless it is already represented on screen. How: This walks every key in genMapObj, filtering out already-present pickers/day-offs.


			if ( havPicSet.has( curPicIdeStr ) ) continue; // What: Already Present Skip. Why: A picker already on screen needs no placeholder. How: This skips curPicIdeStr when havPicSet already has it.


			const curSltObj = genMapObj[ curPicIdeStr ]; // What: Current Slot Object. Why: The day-off special case below needs this slot's own info. How: This reads genMapObj at curPicIdeStr.

			if ( curSltObj && curSltObj.kind === 'dayoff' && havDofSet.has( curSltObj.conditionalId ) ) continue; // What: Already Present Dayoff Skip. Why: A day-off card already on screen (by conditional, not picker id) needs no placeholder either. How: This skips curPicIdeStr when both conditions hold.


			const picRecObj = ( state.pickers || [] ).find( ( curPicObj ) => curPicObj.id === curPicIdeStr ); // What: Picker Record Object. Why: The placeholder itself needs the real picker record to render against. How: This finds the picker matching curPicIdeStr.

			if ( !picRecObj ) continue; // What: Missing Picker Guard. Why: A picker id with no matching record has nothing to placeholder at all. How: This skips curPicIdeStr when picRecObj cannot be found.


			const groNamStr = picRecObj.group || 'Other'; // What: Group Name String. Why: The placeholder needs a real group to slot into, matching every other row's own grouping. How: This reads picRecObj.group, falling back to 'Other'.

			( outMapObj[ groNamStr ] = outMapObj[ groNamStr ] || [] ).push( picRecObj ); // What: Out Map Push. Why: This is the actual placeholder collection for this group. How: This pushes picRecObj into outMapObj's own array for groNamStr, creating it first if needed.


		}

		return outMapObj; // What: New Slot By Group Return. Why: The content column below needs this exact { groupName: [picker, ...] } shape. How: This returns the same object populated by the loop above.


	}, [ genActBoo, genMapObj, state.today.entries, state.pickers ] );

	const genBlkOrdArr = React.useMemo( () => { // What: Generate Block Order Array. Why: While generating, a group with no entries yet but an incoming slot (per newSltByGroObj) still needs its own section mounted to hold that placeholder. How: This appends any such group's own name onto blkOrdArr, when it isn't already present.


		const extGroArr = Object.keys( newSltByGroObj ).filter( ( curNamStr ) => !blkOrdArr.includes( curNamStr ) ); // What: Extra Group Array. Why: This is the actual set of groups blkOrdArr is missing but newSltByGroObj needs. How: This filters newSltByGroObj's own keys down to ones blkOrdArr doesn't already include.

		return extGroArr.length ? [ ...blkOrdArr, ...extGroArr ] : blkOrdArr; // What: Generate Block Order Return. Why: The content column below needs this padded order whenever a placeholder group exists. How: This appends extGroArr onto blkOrdArr, or just returns blkOrdArr unchanged when there is nothing to add.


	}, [ blkOrdArr, newSltByGroObj ] );

	shoOrdRef.current = genBlkOrdArr; // What: Shown Order Set. Why: startGroDraFun's own onDrop needs to resolve a drop's own DOM-position indices against whatever order was ACTUALLY rendered, which is genBlkOrdArr, not the unpadded blkOrdArr. How: This overwrites shoOrdRef on every render.

	const obEveBus = useEmlTouFun ? useEmlTouFun() : {}; // What: Onboarding Event Bus. Why: Several onboarding-adjacent empty-state/create-flow checks below need to read the shared tour bus's own live fields. How: This calls useEmlTouFun when it exists, otherwise falls back to an empty object.

	const onbCplBoo = ONB_CHE_OBJ.cheStaFun( state ).comBoo; // What: Onboarding Complete Boolean. Why: This replaces the old onboarding.dismissed flag (which only ever got set by the now-removed "Get started" checklist, so it was permanently stuck false); derived instead of stored, see onboarding-checklist.js for what counts as done. How: This calls ONB_CHE_OBJ.cheStaFun and reads its own comBoo field.
	const onbCreBoo = !onbCplBoo && state.pickers.length === 0; // What: Onboarding Create Boolean. Why: This force-shows the create-picker onboarding card whenever onboarding isn't complete and the user has no pickers yet; a future "Create your first picker" mini-tour will need an equivalent force-render once it exists, keyed off its own step numbering. How: This is true only while onboarding isn't complete AND the user has no pickers at all.

	/**
	 * onbEmpBoo = Onboarding Empty Boolean
	 *
	 * @summary
	 * The plain empty-state edge case: the user has no pickers and the
	 * tour isn't running. Distinct from the onboarding create card:
	 * plainer copy so it doesn't read as a bug, no coach highlight.
	 * Tapping it jumps to Pickers with the create form open and the name
	 * prefilled "Chores" (see begCreFun below, via the shared tour bus).
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const onbEmpBoo = !onbCreBoo && obEveBus.phase !== 'tour' && state.pickers.length === 0;

	/**
	 * onbNoRunBoo = Onboarding No-Run-Today Boolean
	 *
	 * @summary
	 * The second empty state: the user HAS pickers, but none of them can
	 * put anything here today, either because none are in the Daily
	 * generator at all, or the ones that are aren't scheduled for this
	 * weekday (or sit out today's holiday). Same two gates the generator
	 * itself applies, evaluated for the CURRENT day. Only surfaces when
	 * the picker list is genuinely empty; reminders may still be present.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const onbNoRunBoo = React.useMemo( () => {


		if ( state.pickers.length === 0 ) return false; // What: No Pickers Guard. Why: This specific empty state only applies once real pickers exist at all. How: This returns false early when state.pickers is empty.


		const cheNowDat = new Date();                                   // What: Check Now Date. Why: The weekday/holiday gates below both need a single consistent "now". How: This is a fresh Date, read once.
		const dowNum    = cheNowDat.getDay();                            // What: Day Of Week Number. Why: The weekday gate below is checked against this. How: This reads cheNowDat.getDay().
		const holNowBoo = HOL_NAM_OBJ.holDatFun( state.holidays, cheNowDat ); // What: Holiday Now Boolean. Why: The holiday gate below is checked against this. How: This calls HOL_NAM_OBJ.holDatFun with state.holidays and cheNowDat.

		return !state.pickers.some( ( curPicObj ) => (

			!curPicObj.hidden &&
			state.daily.pickerIds.includes( curPicObj.id ) &&
			( !Array.isArray( curPicObj.daysOfWeek ) || curPicObj.daysOfWeek.includes( dowNum ) ) &&
			!( curPicObj.skipHolidays && holNowBoo )

		) ); // What: No Runnable Picker Return. Why: This is the actual check every branch above feeds into. How: This is true only when NO picker satisfies every one of the 4 conditions (visible, in the daily generator, scheduled today, not sitting out today's holiday).


	}, [ state.pickers, state.daily.pickerIds, state.holidays ] );

	const hasTutCarBoo = shwCheBoo; // What: Has Tutorial Cards Boolean. Why: onbNoRunBoo's own visibility is suppressed while the mini-tour checklist is still up (any launcher card, checked or not, until cheDonBoo), since the page isn't actually empty then, it's full of tutorial cards instead of real picks; reappears normally once the checklist concludes and there's still genuinely nothing to run. How: This is just shwCheBoo, given its own name here for readability at the call site below.
	const onbShwNorBoo = !onbCreBoo && obEveBus.phase !== 'tour'
		&& onbNoRunBoo && entArr.length === 0 && !hasTutCarBoo; // What: Onboarding Show No-Run Boolean. Why: This is the actual final gate the JSX below renders from. How: This combines every condition above: not the create card, not mid-tour, no runnable picker, no entries at all, and no tutorial cards masking the emptiness.

	const begCreFun = () => { // What: Begin Create Function. Why: The empty-state's own CTA needs to jump to Pickers with the create form already open and prefilled. How: This publishes a startCreate request onto the shared tour bus, then navigates to the Pickers tab.


		emlTouObj.set( { startCreate : { name : 'Chores', step : 1, focusName : true } } );

		if ( onNavTab ) onNavTab( 'picker' );


	};

	/**
	 * actMinTouObj = Active Mini-Tour State
	 *
	 * @summary
	 * Which reminder mini-tour's intro modal (or walkthrough) is
	 * currently showing, null when none is. Reminder tours never leave
	 * Today, so this stays local here; picker tours AND page tours can
	 * navigate to another tab (a picker tour's Step 1 highlights the
	 * Pickers nav button; a page tour now can too, e.g. the Pickers page
	 * tour's own Step 2+), which would unmount this component along with
	 * them, so both live at the app level instead, see app.jsx's own
	 * activePickerTour/activePageTour and this component's own
	 * onStartPickerTour/onStartPageTour props. Seeded from a persisted
	 * activeTour on first mount (a reload) so the tour resumes instead of
	 * silently vanishing, mirroring app.jsx's own seeding. activeTour.id
	 * only encodes the variant ('reminder-once'/'reminder-recurring'),
	 * not the task id, so it is mapped back via the same taskId pairing
	 * RemTouCom's own varKeyStr prop uses below.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const [ actMinTouObj, setActMinTouObj ] = React.useState( () => {


		const savTouObj = state.onboarding && state.onboarding.activeTour; // What: Saved Tour Object. Why: This is the persisted record of whichever onboarding tour (if any) was mid-progress on last save. How: This reads state.onboarding.activeTour.

		if ( !savTouObj || typeof savTouObj.id !== 'string' || !savTouObj.id.startsWith( 'reminder-' ) ) return null; // What: Non-Reminder Guard. Why: Only a "reminder-" prefixed activeTour id belongs to this state. How: This returns null early unless savTouObj holds a real, "reminder-"-prefixed id.


		const varStr = savTouObj.id.slice( 'reminder-'.length ); // What: Variant String. Why: The specific reminder variant (once/recurring) still needs mapping back to a concrete sample task id below. How: This strips the 'reminder-' prefix off savTouObj's own id.

		return { kind : 'reminder', id : varStr === 'once' ? 'tk_ob_meds' : 'tk_ob_trash' }; // What: Resumed Mini-Tour Return. Why: The caller needs a real { kind, id } pair to resume against. How: This maps 'once' to the meds sample task, everything else to the trash sample task.


	} );

	const strMinFun = ( kndStr, ideStr ) => { // What: Start Mini-Tour Function. Why: Every launcher card's own Play button (or row click) funnels through this one dispatcher, since which state it actually starts depends on kndStr. How: This dispatches picker/pageTour/appFeature tours up to the app level, otherwise stages a local reminder mini-tour.


		if ( kndStr === 'picker' ) onStartPickerTour( ideStr );

		else if ( kndStr === 'pageTour' ) onStartPageTour( ideStr );

		else if ( kndStr === 'appFeature' ) onStartAppFeatureTour( ideStr );

		else setActMinTouObj( { kind : kndStr, id : ideStr } );


	};

	const uncTutFun = ( kndStr, ideStr ) => actions.setChecklistItem( ideStr, null ); // What: Uncheck Tutorial Function. Why: This un-resolves an already-resolved launcher card (skipped/cancelled/finished) back to pending, so its mini-tour can be redone; it never touches the sample itself, see onboarding-checklist.js. How: This calls actions.setChecklistItem with a null patch.
	const uncFeaFun = ( ideStr ) => actions.setAppFeatureItem( ideStr, null );        // What: Uncheck Feature Function. Why: Same idea as uncTutFun, but for App Features, which live in their own map rather than the checklist, see onboarding-app-features.jsx's own header comment for why. How: This calls actions.setAppFeatureItem with a null patch.

	/**
	 * Closing Generate Card = Closing Generate Card Rationale
	 *
	 * @summary
	 * The closing "Generate a real list" card, see onboarding-
	 * checklist.js. Actionable once every other checklist item is
	 * resolved AND at least one picker was actually finished
	 * (onbRdyBoo), so there's always something real for the generator to
	 * draw from.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const onbRdyBoo = ONB_CHE_OBJ.reaGenFun( state );                       // What: Onboarding Ready Boolean. Why: See the doc comment just above. How: This calls ONB_CHE_OBJ.reaGenFun.
	const genResBoo = !!ONB_CHE_OBJ.entLooFun( state, ONB_GII_STR );       // What: Generate Resolved Boolean. Why: Both the card's own visual state and the effect further below need to know whether the Generate item has already resolved. How: This checks ONB_CHE_OBJ for an existing entry against ONB_GII_STR.

	const onGenCarFun = () => { if ( onbRdyBoo ) actions.setChecklistItem( ONB_GII_STR, { status : 'finished' } ); }; // What: On Generate Card Function. Why: This is the actual click handler for the closing Generate card. How: This resolves the Generate item only while onbRdyBoo allows it.

	/**
	 * genExpStr = Generate Card Explanation String
	 *
	 * @summary
	 * Names exactly what's still missing, singular/plural and "and" both
	 * adjusted to whichever of the two requirements (tutorials, a real
	 * picker) is actually still outstanding, see ONB_CHE_OBJ's own
	 * othRemFun and reaPicFun. Once nothing is missing (onbRdyBoo), this
	 * "still missing" framing no longer applies at all, so it's a
	 * completely separate sentence, not a 0-item case of the same
	 * template.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const onbRemNum   = ONB_CHE_OBJ.othRemFun( state );     // What: Onboarding Remaining Number. Why: See the doc comment just above. How: This calls ONB_CHE_OBJ.othRemFun.
	const onbNeePicBoo = ONB_CHE_OBJ.reaPicFun( state ) < 1; // What: Onboarding Needs Picker Boolean. Why: See the doc comment just above. How: This checks ONB_CHE_OBJ.reaPicFun against a floor of 1.
	const genExpStr = onbRdyBoo
		? 'Everything is completed! Click this button to generate your first, real todo list.'
		: ( () => {


				const tutClaStr = onbRemNum > 0 ? `${ onbRemNum } more tutorial${ onbRemNum > 1 ? 's' : '' }` : null; // What: Tutorial Clause String. Why: This is the tutorials half of the combined "still missing" sentence, correctly pluralized. How: This formats onbRemNum, or null when nothing is outstanding on this side.
				const picClaStr = onbNeePicBoo ? 'at least 1 picker' : null;                                          // What: Picker Clause String. Why: This is the picker half of the combined sentence. How: This is a fixed phrase, or null when a real picker already exists.
				const comClaStr = tutClaStr && picClaStr ? `${ tutClaStr } and ${ picClaStr }` : ( tutClaStr || picClaStr ); // What: Combined Clause String. Why: Both halves may be missing at once, needing "and" to join them, or only one may be. How: This joins both clauses when both exist, otherwise falls back to whichever one does.

				return `Finish ${ comClaStr } to enable this functionality and create your first, real generated todo list.`; // What: Explanation Return. Why: The caller needs the final assembled sentence. How: This interpolates comClaStr into the fixed template.


			} )();

	/**
	 * Generate Card Scroll = Generate Card Auto-Scroll Rationale
	 *
	 * @summary
	 * Once every other checklist item is resolved, brings the now-
	 * pulsing Generate card into view on its own, since it's likely below
	 * the fold by the time the last tutorial finishes (every other card
	 * is still above it in the list). Same offset-scroll approach as
	 * jmpGroFun above (--sticky-top-h, which already accounts for the
	 * group rail stacking below the header on mobile) rather than
	 * scrollIntoView, so the card's own top lands just under the sticky
	 * header/rail on small viewports instead of scrollIntoView's
	 * block:'center' cutting it off behind them.
	 *
	 * Driven off state.onboarding.generateScrollPending (set in
	 * store.jsx's setChecklistItem the instant onbRdyBoo flips false to
	 * true), NOT a local "did I see it flip" ref: the last checklist item
	 * is very often resolved from a mini-tour or Page Tour running on a
	 * DIFFERENT tab, which unmounts this whole component for the tour's
	 * duration. A ref would miss that transition entirely (it only
	 * compares against whatever onbRdyBoo already IS on this fresh mount,
	 * never having seen the false state at all) and the scroll would
	 * silently never fire, confirmed via the user's own repro: skipping a
	 * tutorial from its OWN opening modal (still on Today, this component
	 * never unmounts) scrolled correctly, but skipping from any later
	 * step (which had already navigated away) didn't.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const genCarRef    = React.useRef( null );                                                          // What: Generate Card Reference. Why: The scroll effect below needs a direct DOM handle on the Generate card itself. How: This is attached to the card's own ref prop further down.
	const genScrPndBoo = !!( state.onboarding && state.onboarding.generateScrollPending );                // What: Generate Scroll Pending Boolean. Why: See the doc comment just above. How: This reads state.onboarding.generateScrollPending.

	React.useEffect( () => {


		if ( !genScrPndBoo ) return; // What: Not Pending Guard. Why: There is nothing to scroll to while nothing is actually pending. How: This bails out of the effect entirely when genScrPndBoo is false.


		/**
		 * Double RAF = Double Requestanimationframe Rationale
		 *
		 * @summary
		 * A double rAF, not a direct call, since the last checklist item
		 * is very often resolved by a tour's own Skip/Done, and EVERY
		 * tour funnels both through onboarding-tour-runner.jsx's
		 * TodTopFun, which forces main.scrollTop back to 0 via its OWN
		 * requestAnimationFrame, already queued by the time this effect
		 * runs. A single rAF here would land in the same frame and race
		 * it (losing, depending on exact scheduling); deferring one frame
		 * further guarantees this runs strictly after that reset has
		 * already applied, so this is the scroll position that sticks,
		 * the same "wait for the DOM to fully settle" idiom used
		 * elsewhere for post-commit timing (see the celebration
		 * overlay's own verification notes above).
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		*/

		let rafTwoNum = 0; // What: Raf Two Number. Why: The cleanup below needs to cancel the SECOND, nested rAF too, not just the first. How: This starts at 0 and is assigned inside the first rAF's own callback below.

		const rafOneNum = requestAnimationFrame( () => { // What: Raf One Number. Why: This is the first of the two deferred frames described above. How: This schedules the second rAF inside its own callback.


			rafTwoNum = requestAnimationFrame( () => { // What: Raf Two Assignment. Why: This is the second, actually-scrolling frame. How: This measures genCarRef and scrolls once both its scroller and tab ancestors are found.


				const curEle    = genCarRef.current;          // What: Current Element. Why: Every measurement below reads this same node. How: This reads genCarRef.current.
				const mnScrEle  = curEle?.closest( '.main' );        // What: Main Scroll Element. Why: The scroll target needs the real scroll container. How: This walks up from curEle to its nearest .main ancestor.
				const tabCurEle = curEle?.closest( '.tab--today' );  // What: Tab Current Element. Why: The sticky offset custom property lives on the tab's own root. How: This walks up from curEle to its nearest .tab--today ancestor.

				if ( curEle && mnScrEle && tabCurEle ) { // What: All Found Branch. Why: The scroll can only happen once every one of these 3 exists. How: This computes and applies the scroll only when all 3 are present.


					const stkHeiNum = parseInt( getComputedStyle( tabCurEle ).getPropertyValue( '--sticky-top-h' ) ) || 140; // What: Sticky Height Number. Why: The scroll target must land just beneath the sticky header/rail. How: This reads the --sticky-top-h custom property, falling back to a fixed 140.
					const tarOffNum = curEle.offsetTop - stkHeiNum - 16;                                                     // What: Target Offset Number. Why: This is the actual scroll position that lands the card's own top just beneath the sticky offset, with a small 16px pad. How: This subtracts stkHeiNum and 16 from curEle's own offsetTop.

					mnScrEle.scrollTo( { top : tarOffNum, behavior : redMotFun() ? 'auto' : 'smooth' } ); // What: Scroll To Call. Why: This is the actual scroll. How: This scrolls mnScrEle to tarOffNum, smoothly unless reduced motion is preferred.


				}

				actions.setOnboarding( { generateScrollPending : false } ); // What: Clear Pending Call. Why: This scroll must only ever fire once per pending flag. How: This writes generateScrollPending back to false regardless of whether the scroll itself actually ran.


			} );


		} );


		return () => { cancelAnimationFrame( rafOneNum ); cancelAnimationFrame( rafTwoNum ); }; // What: Effect Cleanup Return. Why: Neither queued frame may outlive this effect run. How: This cancels both.


	}, [ genScrPndBoo ] ); // What: Effect Dependency Array. Why: This effect only ever needs to re-run when genScrPndBoo itself flips. How: genScrPndBoo is exactly the flag this whole effect reacts to.

	/**
	 * Checklist Conclusion = Checklist Conclusion Rationale
	 *
	 * @summary
	 * Resolving the Generate item pushes donCouNum up to equal totCouNum
	 * (every other item was already resolved), which triggers the
	 * existing completion-celebration effect above automatically,
	 * nothing extra needed to fire it. This effect only owns what happens
	 * AFTER: let the celebration play, animate every checklist card out
	 * together, then conclude the checklist and hand off to a completely
	 * normal genFun call.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const [ cheExiBoo, setCheExiBoo ] = React.useState( false ); // What: Checklist Exiting Boolean And Setter. Why: See the doc comment just above. How: This is staged true by the effect below, played out on every launcher card, then cleared once the checklist actually concludes.
	const preGenResRef = React.useRef( genResBoo );              // What: Previous Generate Resolved Reference. Why: The effect below needs last render's own genResBoo to detect a genuine false-to-true transition. How: This starts at the initial genResBoo and is overwritten at the end of that same effect.

	React.useEffect( () => {


		if ( genResBoo && !preGenResRef.current ) { // What: Fresh Resolve Branch. Why: The whole conclusion sequence only ever plays on a genuine false-to-true transition. How: This checks genResBoo against preGenResRef's own prior value.


			const rdcBoo   = redMotFun && redMotFun();     // What: Reduced Boolean. Why: Every timing below needs to collapse almost to nothing for a user who prefers reduced motion. How: This checks redMotFun once, reused for both timeouts below.
			const celMsNum = rdcBoo ? 200 : 1700;                 // What: Celebrate Ms Number. Why: The exit animation must wait for the celebration to actually finish playing first. How: This is a short reduced-motion beat or the full celebration duration.
			const extMsNum = rdcBoo ? 0 : 380;                    // What: Exit Ms Number. Why: The checklist's own conclusion must wait for the card-exit animation to finish too. How: This is 0 under reduced motion or the real exit animation's own duration.

			const celTmoNum = setTimeout( () => setCheExiBoo( true ), celMsNum ); // What: Celebrate Timeout Number. Why: The exit animation should only start once the celebration has had its own moment first. How: This flips cheExiBoo true after celMsNum.

			const purTmoNum = setTimeout( () => { // What: Purge Timeout Number. Why: The actual checklist conclusion (unhiding real pickers/tasks, flipping checklistDone, and finally regenerating) must wait for both the celebration AND the exit animation to finish. How: This runs after celMsNum plus extMsNum combined.


				/**
				 * Unhide Real Items = Unhide Real Items Rationale
				 *
				 * @summary
				 * Any real reminder OR picker created while the checklist
				 * was up, whether by finishing a mini-tour or just the
				 * user clicking "+"/"Add New Picker" themselves (see
				 * reminders.jsx's startAdd and tab-picker.jsx's onCreate,
				 * both gated on the shwCheBoo bus field), was seeded
				 * hidden so it didn't clutter the list alongside the
				 * still-open launcher cards. Surfaces them all now, right
				 * before genFun actually runs. Excludes the eternal
				 * samples themselves by id, which stay hidden forever.
				 *
				 * @author z4nta0 <https://github.com/z4nta0>
				 *
				*/

				state.tasks.forEach( ( curTasObj ) => { if ( curTasObj.hidden && !ONB_STI_ARR.includes( curTasObj.id ) ) actions.updateTask( curTasObj.id, { hidden : false } ); } );

				state.pickers.forEach( ( curPicObj ) => { if ( curPicObj.hidden && !ONB_SPI_ARR.includes( curPicObj.id ) ) actions.updatePicker( curPicObj.id, { hidden : false } ); } );

				actions.setChecklistDone( true ); // What: Set Checklist Done Call. Why: This is the actual permanent conclusion flag. How: This calls actions.setChecklistDone with true.
				setCheExiBoo( false );            // What: Checklist Exiting Clear. Why: The exit animation has now fully played out. How: This flips cheExiBoo back to false.

				/**
				 * Deferred Regenerate = Deferred Regenerate Rationale
				 *
				 * @summary
				 * Deferred, and via genRefObj rather than calling genFun
				 * directly: the three actions.* calls just above are
				 * async state updates that haven't re-rendered yet at
				 * this point in the callback, so a bare genFun() here
				 * would run against THIS closure's stale snapshot, where
				 * every picker/task the loop above just unhid still reads
				 * hidden:true. genFun's own picker loop skips anything
				 * hidden, so the real (freshly un-hidden) pickers would
				 * silently produce nothing, only reminders would show,
				 * since those render live off state.tasks rather than
				 * being baked into entries by a one-time genFun run.
				 * genRefObj always points at the LATEST genFun closure
				 * (see its own comment above); scheduling this on a new
				 * macrotask gives React a chance to flush the batched
				 * updates from the three actions.* calls into a fresh
				 * render first, so by the time this fires, genRefObj's
				 * own current function sees the real state.
				 *
				 * @author z4nta0 <https://github.com/z4nta0>
				 *
				*/

				setTimeout( () => genRefObj.current(), 0 );


			}, celMsNum + extMsNum );

			preGenResRef.current = genResBoo; // What: Previous Generate Resolved Update. Why: The next run of this effect must compare against the state that is current now. How: This overwrites preGenResRef with genResBoo.

			return () => { clearTimeout( celTmoNum ); clearTimeout( purTmoNum ); }; // What: Effect Cleanup Return. Why: Neither scheduled step may outlive this effect run. How: This clears both.


		}

		preGenResRef.current = genResBoo; // What: Previous Generate Resolved Update. Why: Even a non-transition still needs preGenResRef to track the latest value for next time. How: This overwrites preGenResRef with the current genResBoo.


	}, [ genResBoo ] ); // What: Effect Dependency Array. Why: This effect only ever needs to re-run when genResBoo itself changes. How: genResBoo is exactly what preGenResRef is compared against.


	return (


		<div className={ `tab tab--today ${ ediModBoo ? 'is-editmode' : '' }` }>{ /* What: Today Tab Div Element. Why: This is TabToday's own root wrapper. How: This renders the sticky header, the scrollable body (rail + groups + footer), and any reminder mini-tour/App Features intro overlay currently running. */ }


			<HelOveCom
				actModBoo={ hlpOnBoo }
				helIteArr={ TOD_HEL_ARR }
				onCloAllFun={ hlpExiFun }
			/>{ /* What: Help Overlay Component. Why: Today needs its own coach-mark overlay driven by TOD_HEL_ARR. How: This is rendered whenever hlpOnBoo is true, closed via hlpExiFun. */ }


			<header
				ref={ heaEleRef }
				className='today-h'
			>{ /* What: Today Header Element. Why: This is the sticky header every scroll-spy/offset calculation in this file measures against. How: This renders the date/streak/help row and the brand mark/title/ring row beneath it. */ }


				<div className='today-h-inner'>{ /* What: Header Inner Div Element. Why: The header's own content needs an inner wrapper distinct from the sticky element itself. How: This wraps the header-left column below. */ }


					<div className='today-h-l'>{ /* What: Header Left Div Element. Why: Every piece of header content reads as one left-aligned column. How: This wraps the kicker row and the brand/title/ring row below. */ }


						<div className='kicker-row'>{ /* What: Kicker Row Div Element. Why: The date/time and the streak/help cluster sit on one shared row. How: This wraps the kicker span and the kicker-row-right div below. */ }


							<div className='kicker'>{ /* What: Kicker Div Element. Why: Today's own date and time read as one small cluster. How: This renders forDatFun and forTimFun against curNowDat. */ }

								{ forDatFun( curNowDat ) } <span className='kicker-time'>{ forTimFun( curNowDat ) }</span>

							</div>


							<div className='kicker-row-r'>{ /* What: Kicker Row Right Div Element. Why: The streak badge and the help toggle read as one right-aligned cluster. How: This wraps the streak div and HelButCom below. */ }


								<div
									ref={ strEleRef }
									className='streak'
								>{ /* What: Streak Div Element. Why: This is the badge the streak-pulse effect above targets directly. How: This renders a flame icon plus the current streak count. */ }


									<IcoSvgCom
										name='flame'
										size={ 12 }
									/>{ /* What: Icon Svg Component. Why: The streak badge needs a recognizable glyph. How: This renders the 'flame' icon at a fixed size. */ }

									<span>{ state.streak }-day streak</span>{ /* What: Streak Text Span Element. Why: The streak count needs its own plain text alongside the flame icon. How: This renders state.streak interpolated into the fixed phrase. */ }


								</div>

								<HelButCom
									actModBoo={ hlpOnBoo }
									onClick={ () => setHlpOnBoo( ( curBoo ) => !curBoo ) }
								/>{ /* What: Help Button Component. Why: Today needs the same help-mode toggle every other tab exposes. How: This toggles hlpOnBoo. */ }


							</div>


						</div>


						<div className='today-h-lead'>{ /* What: Header Lead Div Element. Why: The brand mark, the title, and the completion ring read as one shared row beneath the kicker. How: This wraps all 3 below. */ }


							<button
								type='button'
								className='brand-mark'
								aria-label='Ease My Life link to go to the Today page'
								onClick={ onHome }
							>{ /* What: Brand Mark Button Element. Why: The logo also works as a shortcut back to the top of Today. How: This calls onHome on click. Logo colors are wired to the UI theme: the border and easing-checkmark use currentColor, which .brand-mark sets to var(--accent); the grid lines use var(--accent-soft), the same color as the Today group-rail/tabbar selected backgrounds. */ }


								<svg
									viewBox='8 8 528 528'
									fill='none'
									aria-hidden='true'
								>{ /* What: Logo Svg Element. Why: This draws the small square "Ease My Life" logo mark. How: This is a fixed-viewBox icon composed of a grid, a rounded-square badge outline, and a clipped glyph path. */ }


									<defs>{ /* What: Clip Defs Element. Why: An SVG clipPath can only be applied via a defined, referenced id, not inline. How: This holds the one clipPath definition the glyph path below references. */ }


										<clipPath
											id='braMarCli'
											clipPathUnits='userSpaceOnUse'
										>{ /* What: Badge Clippath Element. Why: The glyph path's own curves slightly overshoot the rounded-square badge and need to be masked to it. How: This defines a rounded-square clip region; TabToday only ever mounts one instance of itself, so no ghost-copy id suffix is needed here, unlike TabBarCom's own equivalent. */ }


											<rect
												width='512'
												height='512'
												y='16'
												x='16'
												rx='75'
												ry='75'
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
										width='512'
										height='512'
										y='16'
										x='16'
										rx='75'
										ry='75'
										style={{ strokeWidth : 16, strokeLinecap : 'round', strokeLinejoin : 'round', stroke : 'currentColor' }}
									/>{ /* What: Badge Rect Element. Why: The logo needs a visible rounded-square border/badge behind the glyph. How: This draws the same rounded-square shape as the clip rect above, but stroked and visible instead of hidden in defs. */ }


									<path
										d='M 24.467 527.792 C 67.266 416.298 77.088 228.913 172.207 434.412 C 200.739 535.77 262.562 434.412 314.873 292.51 C 381.45 120.201 450.381 44.636 528.854 24.365 C 521.725 22.337 512.215 24.365 493.193 34.5 C 369.548 105.451 295.85 292.51 234.029 363.461 C 186.473 414.14 167.451 241.831 124.651 262.102 C 101.828 270.008 60.133 375.754 24.467 527.792 Z'
										strokeWidth='8'
										strokeLinecap='round'
										strokeLinejoin='round'
										clipPath='url(#braMarCli)'
										style={{ fill : 'currentColor', stroke : 'currentColor' }}
									/>{ /* What: Glyph Path Element. Why: This is the actual squiggly "Ease My Life" brand glyph drawn inside the badge. How: This path is clipped to the rounded-square badge so its curves never spill outside it. */ }


								</svg>


							</button>



							<h1 className='today-title'>{ /* What: Today Title Heading Element. Why: The default hero line and the "all done" celebratory line swap visibility based on isaCplBoo, but both stay mounted so the swap can animate. How: This renders both title-state spans below, keyed so the done state re-plays its per-word reveal on every fresh completion. */ }


								<span
									className={ `title-state title-state--default ${ isaCplBoo ? 'is-out' : 'is-in' }` }
									aria-hidden={ isaCplBoo }
								>{ /* What: Default Title State Span Element. Why: This is the everyday hero line, visible whenever the day isn't yet complete. How: This renders the fixed "Your day, eased just for you." copy. */ }

									Your day,<br />{ ' ' }<span style={{ color : 'var(--accent)' }}>eased</span> just for you.

								</span>

								<span
									key={ isaCplBoo ? cplNonNum : 'idle' }
									className={ `title-state title-state--done ${ isaCplBoo ? 'is-in' : 'is-out' }` }
									aria-hidden={ !isaCplBoo }
								>{ /* What: Done Title State Span Element. Why: This is the celebratory line, visible only once the whole day is complete, keyed on cplNonNum so it re-mounts and replays its per-word reveal on every fresh completion. How: This renders 3 individually-classed words. */ }


									<span className='title-word title-word--1'>Your</span>{ ' ' }
									<span className='title-word title-word--2'>life,</span><br />

									<span className='title-word title-word--3'>eased!</span>


								</span>


							</h1>


							<div
								ref={ rngEleRef }
								className='ring'
							>{ /* What: Ring Div Element. Why: This is the completion ring the celebration effect above targets directly. How: This renders the SVG ring itself, its numeric label, and 3 purely decorative overlay elements the celebration effect's own CSS classes animate. */ }


								<svg viewBox='0 0 36 36'>{ /* What: Ring Svg Element. Why: This draws the actual ring shape. How: This renders a background circle plus a foreground circle whose dash array reflects donCouNum over totCouNum. */ }


									<circle
										cx='18'
										cy='18'
										r='15.5'
										className='ring-bg'
									/>{ /* What: Ring Background Circle Element. Why: The foreground progress arc needs a full, dim track to sit on top of. How: This draws a plain full circle. */ }

									<circle
										cx='18'
										cy='18'
										r='15.5'
										className='ring-fg'
										strokeDasharray={ `${ ( donCouNum / Math.max( 1, totCouNum ) ) * 97.4 }, 97.4` }
									/>{ /* What: Ring Foreground Circle Element. Why: This is the actual visible progress arc. How: This sets its own dash array to donCouNum over totCouNum, scaled to the circle's own circumference. */ }


								</svg>


								<div className='ring-text'>{ /* What: Ring Text Div Element. Why: The numeric label needs to sit centered over the ring itself. How: This renders donCouNum and totCouNum as a fraction. */ }


									<span className='ring-num'>{ donCouNum }</span>{ /* What: Ring Numerator Span Element. Why: This is the ring's own live numerator. How: This renders donCouNum directly. */ }

									<span className='ring-den'>/ { totCouNum }</span>{ /* What: Ring Denominator Span Element. Why: The numerator alone is meaningless without its own total. How: This renders the literal "/" plus totCouNum. */ }


								</div>


								<i
									className='ring-glow'
									aria-hidden='true'
								/>{ /* What: Ring Glow Element. Why: The ring needs a purely decorative glow layer the celebration/pulse CSS classes animate. How: This is an empty, presentation-only element. */ }

								<i
									className='ring-ripple'
									aria-hidden='true'
								/>{ /* What: Ring Ripple Element. Why: The ring needs a purely decorative ripple layer for the per-tick pulse. How: This is an empty, presentation-only element. */ }

								<i
									className='celebration-ripple'
									aria-hidden='true'
								/>{ /* What: Celebration Ripple Element. Why: The ring needs its own separate ripple layer for the richer "all done" celebration, distinct from the per-tick pulse ripple above. How: This is an empty, presentation-only element. */ }


							</div>


						</div>


					</div>


				</div>


			</header>

			<div
				ref={ todBodRef }
				className='today-body'
			>{ /* What: Today Body Div Element. Why: Today manages its own centered-column body distinct from app.jsx's shared .main-inner, since it needs its own flourish measurement point. How: This renders the background flourish, the Edit Mode banner (while relevant), and the whole rail/groups/footer layout below. */ }


				<BacFloCom
					tabId='today'
					measureRef={ todBodRef }
				/>{ /* What: Background Flourish Component. Why: Today needs the same decorative background glyphs every other tab renders behind its own centered column. How: This is passed the fixed 'today' tab id and todBodRef. */ }
				{ ( ediModBoo || banCloBoo ) && ( // What: Edit Mode Banner Visibility Check. Why: The banner needs to stay mounted through its own close animation, not just while ediModBoo itself is true. How: This renders the banner while either flag holds.


					<div
						className={ `editmode-banner ${ banCloBoo ? 'is-closing' : '' }` }
						role='status'
					>{ /* What: Edit Mode Banner Div Element. Why: This is the explanatory banner shown while Edit Mode is active. How: This renders the fixed explanatory copy plus a Cancel/Done pair. */ }


						<span className='editmode-banner-msg'>{ /* What: Banner Message Span Element. Why: The icon and the explanatory text read as one inline cluster. How: This wraps the grip icon and the fixed copy below. */ }


							<IcoSvgCom
								name='grip'
								size={ 15 }
							/>{ /* What: Icon Svg Component. Why: The banner needs a recognizable drag-affordance glyph alongside its own copy. How: This renders the 'grip' icon at a fixed size. */ }
							Edit Mode allows you to drag groups and items to rearrange them or to click group names to edit them.

						</span>

						<span className='editmode-banner-actions'>{ /* What: Banner Actions Span Element. Why: The Cancel/Done pair reads as one right-aligned cluster. How: This wraps both ButBasCom elements below. */ }


							<ButBasCom
								kind='ghost'
								size='sm'
								onClick={ () => exitEdiFun( false ) }
							>Cancel</ButBasCom>{ /* What: Button Base Component. Why: This discards every drag made during the current Edit Mode session. How: This calls exitEdiFun(false). */ }

							<ButBasCom
								kind='primary'
								size='sm'
								icon='check'
								onClick={ () => exitEdiFun( true ) }
							>Done</ButBasCom>{ /* What: Button Base Component. Why: This keeps every drag made during the current Edit Mode session. How: This calls exitEdiFun(true). */ }


						</span>


					</div>


				) }
				<div
					ref={ mnScrRef }
					className='today-layout'
				>{ /* What: Today Layout Div Element. Why: This is the shared scroll wrapper the scroll-spy/generate/jmpGroFun logic above all measure against. How: This renders the group rail and the groups/footer column side by side. */ }


					<aside
						ref={ railEleRef }
						className='group-rail'
						aria-label='Groups'
					>{ /* What: Group Rail Aside Element. Why: This is the sticky sidebar (or, on mobile, the horizontal pill bar) listing every block. How: This renders one rail button per blkOrdArr entry, then the App Features entry (pinned last), then the Edit Mode toggle. */ }


						<div className='kicker rail-kicker'>Groups</div>{ /* What: Rail Kicker Div Element. Why: The rail needs its own small heading label. How: This renders the literal word "Groups". */ }


						<ul>{ /* What: Rail List Element. Why: Every rail button is one list item in this shared list. How: This maps blkOrdArr to one <li> per entry, dispatching by sentinel/real-group id. */ }


							{ blkOrdArr.map( ( curIdeStr ) => { // What: Rail Button Map. Why: One rail button is needed per block, dispatched by whichever sentinel or real group id curIdeStr holds. How: This returns the Reminders button, the Page Tours button (when relevant), or a real group's own button.


								if ( curIdeStr === '__reminders' ) {


									return (


										<li key='__reminders'>{ /* What: Reminders List Item Element. Why: The Reminders block always gets its own rail entry. How: This wraps the Reminders rail button below. */ }


											<button
												className={ `rail-btn rail-btn--rem ${ actGroStr === '__reminders' ? 'is-on' : '' }` }
												onClick={ () => jmpGroFun( '__reminders' ) }
											>{ /* What: Reminders Rail Button Element. Why: This is the actual clickable rail entry for the Reminders block. How: This scrolls to '__reminders' via jmpGroFun on click. */ }


												<span className='rail-name'>Reminders</span>{ /* What: Rail Name Span Element. Why: The rail entry needs its own visible label. How: This renders the literal word "Reminders". */ }

												<span className='rail-count'>{ /* What: Rail Count Span Element. Why: The done/total pair reads as one small cluster. How: This wraps the done and "of total" spans below. */ }

													<span>{ visDonNum + tutTasDonNum }</span><span className='rail-of'>/{ dueTasArr.length + tutTasCouNum }</span>

												</span>


											</button>


										</li>


									);


								}

								if ( curIdeStr === '__pageTours' ) { // What: Page Tours Rail Branch. Why: Page Tours only ever gets a rail entry while it is actually meant to be showing. How: This returns null unless either shwCheBoo or rptVisBoo holds, otherwise the Page Tours rail button.


									if ( !shwCheBoo && !rptVisBoo ) return null;


									const pagDonNum = ONB_EPT_ARR.filter( ( curTouObj ) => !!ONB_CHE_OBJ.entLooFun( state, curTouObj.id ) ).length; // What: Page Done Number. Why: The rail entry needs its own live done count. How: This counts resolved ONB_EPT_ARR entries.

									return (


										<li key='__pageTours'>{ /* What: Page Tours List Item Element. Why: Page Tours gets its own rail entry whenever it is visible at all. How: This wraps the Page Tours rail button below. */ }


											<button
												className={ `rail-btn ${ actGroStr === '__pageTours' ? 'is-on' : '' }` }
												onClick={ () => jmpGroFun( '__pageTours' ) }
											>{ /* What: Page Tours Rail Button Element. Why: This is the actual clickable rail entry for the Page Tours block. How: This scrolls to '__pageTours' via jmpGroFun on click. */ }


												<span className='rail-name'>{ pagNamStr }</span>{ /* What: Rail Name Span Element. Why: The rail entry needs its own visible (possibly user-renamed) label. How: This renders pagNamStr. */ }

												<span className='rail-count'>{ /* What: Rail Count Span Element. Why: The done/total pair reads as one small cluster. How: This wraps the done and "of total" spans below. */ }

													<span>{ pagDonNum }</span><span className='rail-of'>/{ ONB_EPT_ARR.length }</span>

												</span>


											</button>


										</li>


									);


								}

								const curGroObj = groByNamObj[ curIdeStr ]; // What: Current Group Object. Why: Every other id in blkOrdArr must resolve to a real group. How: This reads groByNamObj at curIdeStr.

								if ( !curGroObj ) return null; // What: Missing Group Guard. Why: A stale id with no matching group has nothing to render at all. How: This returns null when curGroObj cannot be found.


								const curDonNum = curGroObj.entries.filter( ( curRowObj ) => curRowObj.entry.done ).length; // What: Current Done Number. Why: The rail entry needs this group's own live done count; mini-tour launcher cards count toward this the whole time they're on screen, resolved (any of the 3 ways) counting as done, same as any other card. How: This counts curGroObj's own done rows.

								return (


									<li key={ curGroObj.name }>{ /* What: Group List Item Element. Why: Every real group gets its own rail entry. How: This wraps the group's own rail button below. */ }


										<button
											className={ `rail-btn ${ actGroStr === curGroObj.name ? 'is-on' : '' }` }
											onClick={ () => jmpGroFun( curGroObj.name ) }
										>{ /* What: Group Rail Button Element. Why: This is the actual clickable rail entry for this one group. How: This scrolls to curGroObj's own name via jmpGroFun on click. */ }


											<span className='rail-name'>{ curGroObj.name }</span>{ /* What: Rail Name Span Element. Why: The rail entry needs its own visible label. How: This renders curGroObj's own name. */ }

											<span className='rail-count'>{ /* What: Rail Count Span Element. Why: The done/total pair reads as one small cluster. How: This wraps the done and "of total" spans below. */ }

												<span>{ curDonNum }</span><span className='rail-of'>/{ curGroObj.entries.length }</span>

											</span>


										</button>


									</li>


								);


							} ) }
							{ shwFeaBoo && ( // What: App Features Rail Visibility Check. Why: Pinned last always, not part of blkOrdArr/state.groupOrder, so it can't be dragged around in Edit Mode and always renders after every real group; see shwFeaBoo's own doc comment above for the render gate. How: This renders the App Features rail entry only while shwFeaBoo is true.


								<li key='__appFeatures'>{ /* What: App Features List Item Element. Why: App Features gets its own pinned-last rail entry whenever it is visible at all. How: This wraps the App Features rail button below. */ }


									<button
										className={ `rail-btn ${ actGroStr === '__appFeatures' ? 'is-on' : '' }` }
										onClick={ () => jmpGroFun( '__appFeatures' ) }
									>{ /* What: App Features Rail Button Element. Why: This is the actual clickable rail entry for the App Features block. How: This scrolls to '__appFeatures' via jmpGroFun on click. */ }


										<span className='rail-name'>App Features</span>{ /* What: Rail Name Span Element. Why: The rail entry needs its own visible label. How: This renders the fixed literal "App Features". */ }

										<span className='rail-count'>{ /* What: Rail Count Span Element. Why: The done/total pair reads as one small cluster. How: This wraps the done and "of total" spans below. */ }

											<span>{ APP_FEA_ARR.filter( ( curFeaObj ) => feaStaObj[ curFeaObj.ideStr ] ).length }</span><span className='rail-of'>/{ APP_FEA_ARR.length }</span>

										</span>


									</button>


								</li>


							) }

						</ul>


						<div className='rail-editmode'>{ /* What: Rail Edit Mode Div Element. Why: The Edit Mode toggle sits pinned at the rail's own bottom. How: This wraps the toggle button below. */ }


							<button
								type='button'
								className={ `em-rail-btn ${ ediModBoo ? 'is-on' : '' }` }
								disabled={ genActBoo }
								onClick={ togEdiFun }
							>{ /* What: Edit Mode Rail Button Element. Why: This is the actual toggle control, disabled while a generation is in flight since dragging mid-cascade makes no sense. How: This calls togEdiFun, swapping its own label per ediModBoo. */ }


								<IcoSvgCom
									name='grip'
									size={ 15 }
								/>{ /* What: Icon Svg Component. Why: The toggle needs a recognizable drag-affordance glyph alongside its own label. How: This renders the 'grip' icon at a fixed size. */ }

								{ ediModBoo ? 'Done' : 'Edit Mode' }


							</button>


						</div>


					</aside>

					<div
						ref={ carAreRef }
						className='today-groups'
						style={ obEveBus.reserveTop ? { paddingTop : obEveBus.reserveTop } : undefined }
					>{ /* What: Today Groups Div Element. Why: This is the actual scrollable content column, reserving extra top space while a tour coach card asks for it. How: This renders the celebration overlay portal, every block in genBlkOrdArr, the App Features section, the checklist/empty-state CTAs, and the footer. */ }


						{ celRecObj && parArr.length > 0 && ( cplStyStr === 'confetti' || cplStyStr === 'sparkle' ) && createPortal(

							/**
							 * Celebration Portal = Celebration Portal Placement Rationale
							 *
							 * @summary
							 * Portaled straight to document.body: the tab-switch fade
							 * wrapper (.tab-fade) keeps a resolved (identity) transform
							 * for the life of its own enter animation, which makes it a
							 * containing block for any position:fixed descendant. Left
							 * in place, this overlay would be fixed to that scrolled
							 * ancestor instead of the viewport, so it would scroll out
							 * of view.
							 *
							 * @author z4nta0 <https://github.com/z4nta0>
							 *
							*/

							<div
								className={ `celeb-overlay celeb-overlay--${ cplStyStr }` }
								style={{ left : celRecObj.left, top : celRecObj.top, width : celRecObj.width, height : celRecObj.height }}
								aria-hidden='true'
							>{ /* What: Celebration Overlay Div Element. Why: This is the actual portaled overlay hosting either style's own particles. How: This renders either the confetti pieces or the sparkle pieces, per cplStyStr. */ }


								{ cplStyStr === 'confetti' && parArr.map( ( curParObj ) => ( // What: Confetti Particle List Render. Why: One piece is needed per entry in parArr, only for the confetti style. How: This maps parArr to one confetti piece per entry, keyed by its own id, only while cplStyStr is 'confetti'.


									<i
										key={ curParObj.id }
										className='confetti-piece'
										style={{
										'--angle'         : `${ curParObj.angle }deg`,
										'--dist'          : `${ curParObj.dist }px`,
											'--piece-opacity' : curParObj.opacity,
										'--rot'           : `${ curParObj.rot }deg`,
											animationDelay    : `${ curParObj.delay }ms`
										}}
									/> // What: Confetti Piece Element. Why: This is one single confetti piece, positioned/rotated/timed entirely via inline CSS custom properties. How: This renders curParObj's own randomized angle/distance/rotation/opacity/delay.

								) ) }
								{ cplStyStr === 'sparkle' && parArr.map( ( curParObj ) => ( // What: Sparkle Particle List Render. Why: One piece is needed per entry in parArr, only for the sparkle style. How: This maps parArr to one sparkle piece per entry, keyed by its own id, only while cplStyStr is 'sparkle'.


									<span
										key={ curParObj.id }
										style={{ left : `${ curParObj.xPer }%`, top : `${ curParObj.yPer }%`, animationDelay : `${ curParObj.delay }ms` }}
									>&#10022;</span> // What: Sparkle Piece Span Element. Why: This is one single sparkle piece, positioned/timed entirely via inline style. How: This renders a fixed glyph at curParObj's own randomized position/delay.

								) ) }


							</div>,

							document.body

						) }
						<div
							ref={ groDndRef }
							className='groups-dnd'
						>{ /* What: Groups Dnd Div Element. Why: This is the actual drag container REORDER scopes group drags to. How: This maps genBlkOrdArr to one Reminders/Page-Tours/group section per entry. */ }


							{ genBlkOrdArr.map( ( curIdeStr ) => { // What: Content Column Map. Why: One section is needed per block, dispatched by whichever sentinel or real group id curIdeStr holds. How: This returns the Reminders section, the Page Tours section (when relevant), or a real group's own section.


								if ( curIdeStr === '__reminders' ) {


									return (


										<RemSecCom
											key='__reminders'
											state={ state }
											actions={ actions }
											editMode={ ediModBoo }
											onGripDown={ startGroDraFun }
											logOpen={ opeLogStr === '__reminders' }
											onToggleLog={ () => togLogFun( '__reminders' ) }
											leavingTaskIds={ lvgTasSet }
											arrivingTaskIds={ arvTasSet }
											activeEditor={ activeEditor }
											setActiveEditor={ setActiveEditor }
											onPlayTutorial={ strMinFun }
											onUncheckTutorial={ uncTutFun }
											checklistExiting={ cheExiBoo }
											sectionRef={ ( curEle ) => { secRefObj.current[ '__reminders' ] = curEle; } }
										/> // What: Reminder Section Component. Why: This is the whole Reminders block, sharing every reorder/editor/mini-tour mechanism the rest of Today uses. How: This is passed every relevant piece of local state/handlers, keyed by the '__reminders' sentinel.

									);


								}

								if ( curIdeStr === '__pageTours' ) { // What: Page Tours Section Branch. Why: Page Tours only ever gets a section while it is actually meant to be showing. How: This returns null unless either shwCheBoo or rptVisBoo holds, otherwise the full Page Tours section.


									if ( !shwCheBoo && !rptVisBoo ) return null;


									const visTouArr = shwCheBoo ? ONB_EPT_ARR // What: Visible Tour Array. Why: Post-cheDonBoo (replay continuation, see rptVisBoo's own comment), only the still-unresolved tours keep showing; the ORIGINAL first-time checklist still shows every one of them, done or not, unchanged. How: This is every tour during shwCheBoo, only the unresolved ones during rptVisBoo.
										: ONB_EPT_ARR.filter( ( curTouObj ) => !ONB_CHE_OBJ.entLooFun( state, curTouObj.id ) );
									const pagDonNum = ONB_EPT_ARR.filter( ( curTouObj ) => !!ONB_CHE_OBJ.entLooFun( state, curTouObj.id ) ).length; // What: Page Done Number. Why: The section's own header needs this same live done count. How: This counts resolved ONB_EPT_ARR entries.

									return (


										<section
											key='__pageTours'
											ref={ ( curEle ) => { secRefObj.current[ '__pageTours' ] = curEle; } }
											className='group-section pt-section'
										>{ /* What: Page Tours Section Element. Why: This is the whole Page Tours block's own root. How: This renders GroHeaCom plus one PagTouCom per visTouArr entry. */ }


											<GroHeaCom
												name={ pagNamStr }
												doneCount={ pagDonNum }
												total={ ONB_EPT_ARR.length }
												editMode={ ediModBoo }
												onGripDown={ startGroDraFun }
												onRenameGroup={ ( newNamStr ) => actions.renamePageTours( newNamStr ) }
												validate={ pagColFun }
											/>{ /* What: Group Header Component. Why: Page Tours shares the exact same header chrome (name/rename, count, progress dashes) as a real group. How: This is passed pagNamStr as its own editable name, wired to actions.renamePageTours and pagColFun's own collision check. */ }


											<div className='today-list'>{ /* What: Page Tours List Div Element. Why: Every visible tour card shares this one list column. How: This maps visTouArr to one PagTouCom per entry. */ }


												{ visTouArr.map( ( curTouObj ) => ( // What: Page Tour Card List Render. Why: One card is needed per visible page tour. How: This maps visTouArr to one PagTouCom per entry, keyed by its own id.


													<PagTouCom
														key={ curTouObj.id }
														tour={ curTouObj }
														state={ state }
														actions={ actions }
														onPlayTutorial={ strMinFun }
														onUncheckTutorial={ uncTutFun }
														checklistExiting={ cheExiBoo }
													/> // What: Page Tour Card Component. Why: This is one page tour's own launcher card. How: This is passed curTouObj plus the shared mini-tour dispatchers.

												) ) }


											</div>


										</section>


									);


								}

								const curGroObj = groByNamObj[ curIdeStr ] || ( newSltByGroObj[ curIdeStr ] ? { name : curIdeStr, entries : [] } : null ); // What: Current Group Object. Why: A group with no entries yet, mounted only to host an incoming loader card during generation, still needs a { name, entries: [] } stand-in. How: This reads groByNamObj at curIdeStr, falling back to that stand-in only when newSltByGroObj has a pending slot for it.

								if ( !curGroObj ) return null; // What: Missing Group Guard. Why: A stale id with no matching group and no pending slot has nothing to render at all. How: This returns null when curGroObj cannot be found.


								const curDonNum = curGroObj.entries.filter( ( curRowObj ) => curRowObj.entry.done ).length; // What: Current Done Number. Why: The section's own header needs this same live done count; mini-tour launcher cards count toward this the whole time they're on screen, resolved (any of the 3 ways) counting as done, same as any other card. How: This counts curGroObj's own done rows.

								return (


									<section
										key={ curGroObj.name }
										ref={ ( curEle ) => { secRefObj.current[ curGroObj.name ] = curEle; } }
										className='group-section'
									>{ /* What: Group Section Element. Why: This is one whole group's own root, from its header down through its own card list. How: This renders GroHeaCom, an optional Day Log ColDisCom, then the group's own today-list. */ }


										<GroHeaCom
											name={ curGroObj.name }
											doneCount={ curDonNum }
											total={ curGroObj.entries.length }
											editMode={ ediModBoo }
											onGripDown={ startGroDraFun }
											logOpen={ opeLogStr === curGroObj.name && !ediModBoo }
											onToggleLog={ () => togLogFun( curGroObj.name ) }
											onRenameGroup={ ( newNamStr ) => reqRenFun( curGroObj.name, newNamStr ) }
											mergePending={ merPmpObj && merPmpObj.from === curGroObj.name ? merPmpObj : null }
											onConfirmMerge={ () => { actions.renameGroup( merPmpObj.from, merPmpObj.to ); setMerPmpObj( null ); } }
											onCancelMerge={ () => setMerPmpObj( null ) }
										/>{ /* What: Group Header Component. Why: Every group needs its own name/rename, count, and progress dashes. How: This is passed curGroObj's own name/counts plus every rename/merge/log handler. */ }


										<ColDisCom open={ opeLogStr === curGroObj.name && !ediModBoo }>{ /* What: Collapse Disclosure Component. Why: This group's own Day Log panel should only mount while it is actually open, outside Edit Mode. How: This wraps GroLogCom below. */ }


											<GroLogCom
												state={ state }
												groNamStr={ curGroObj.name }
												onClose={ () => togLogFun( curGroObj.name ) }
											/>{ /* What: Group Log. Why: This renders curGroObj's own picker audit rows. How: This is passed curGroObj's own name and a close handler that re-toggles it shut. */ }


										</ColDisCom>


										<div className='today-list'>{ /* What: Today List Div Element. Why: Every row in this group (real, loader, or tutorial) shares this one list column. How: This maps curGroObj's own entries to one EntCarCom (or LoaCarCom, mid-generation) per row, then any incoming placeholder slots. */ }


											{ curGroObj.entries.map( ( { entry : curEntObj, picker : curPicObj } ) => { // What: Group Row Map. Why: Every row in this group needs rendering, either as a live loader slot (mid-generation) or as a normal EntCarCom. How: This dispatches per genActBoo/genMapObj first, otherwise resolves the row's own item and renders EntCarCom plus its own inline editor.


												if ( genActBoo && genMapObj?.[ curPicObj.id ] ) { // What: Loader Slot Branch. Why: A picker currently mid-generation shows its own animated loader instead of a normal card. How: This returns LoaCarCom keyed by curEntObj's own eid.


													return (

														<LoaCarCom
															key={ curEntObj.eid }
															picker={ curPicObj }
															info={ genMapObj[ curPicObj.id ] }
														/> // What: Loader Card Component. Why: This is the actual mid-generation placeholder for curPicObj. How: This is passed curPicObj plus its own live genMapObj record.

													);


												}

												const curIteObj = state.items.find( ( oneIteObj ) => oneIteObj.id === curEntObj.itemId ); // What: Current Item Object. Why: A normal row's own EntCarCom and inline editor both need this same resolved item. How: This finds the item matching curEntObj's own itemId.

												return (


													<React.Fragment key={ curEntObj.eid }>{ /* What: Row Fragment Element. Why: The card itself and its own inline editor's ColDisCom are true siblings with no shared wrapper of their own. How: This groups both without adding an extra DOM node. */ }


														<EntCarCom
															entry={ curEntObj }
															picker={ curPicObj }
															state={ state }
															actions={ actions }
															justChecked={ jusCheStr }
															editMode={ ediModBoo }
															isRemoving={ remIdeSet.has( curEntObj.eid ) || lvgEidArr.has( curEntObj.eid ) }
															isRolling={ rolIdeSet.has( curEntObj.eid ) }
															isEditing={ activeEditor === `item:${ curEntObj.eid }` }
															checklistExiting={ cheExiBoo }
															onCheck={ onCheFun }
															onSkip={ hndSkiFun }
															onReroll={ hndRerFun }
															onEdit={ () => setActiveEditor( ( curValStr ) => curValStr === `item:${ curEntObj.eid }` ? null : `item:${ curEntObj.eid }` ) }
															onRename={ ( curNamStr ) => actions.renameItem( curEntObj.itemId, curNamStr ) }
															onGripDown={ ( ptdEveObj ) => startIteDraFun( ptdEveObj, curGroObj ) }
															onPlayTutorial={ strMinFun }
															onUncheckTutorial={ uncTutFun }
														/>{ /* What: Entry Card Component. Why: This is the actual row: a real pick, a day-off/charging card, or a mini-tour launcher, depending on curEntObj's own kind. How: This is passed curEntObj/curPicObj plus every shared handler/animation-state flag. */ }


														<ColDisCom open={ activeEditor === `item:${ curEntObj.eid }` && !!curIteObj }>{ /* What: Collapse Disclosure Component. Why: This row's own inline editor should only mount while it is actually open AND a real item still exists to edit. How: This wraps the editor wrapper div below. */ }


															{ curIteObj && ( // What: Item Exists Check. Why: The inline editor needs a real item to edit, which can briefly go missing right after a delete. How: This renders the editor wrapper only while curIteObj still resolves to something.


																<div className='today-entry-editor'>{ /* What: Entry Editor Wrapper Div Element. Why: The inline editor needs its own dedicated wrapper for layout/animation. How: This renders EntryEditor below. */ }


																	<EntryEditor
																		item={ curIteObj }
																		picker={ curPicObj }
																		actions={ actions }
																		items={ state.items }
																		itemCount={ state.items.filter( ( curIteObj ) => curIteObj.pickerId === curPicObj.id ).length }
																		onClose={ () => setActiveEditor( ( curValStr ) => curValStr === `item:${ curEntObj.eid }` ? null : curValStr ) }
																		onDelete={ () => hndDelFun( curEntObj.eid, curIteObj.id ) }
																	/>{ /* What: Entry Editor. Why: This is the actual shared item editor. How: This is passed curIteObj/curPicObj, this picker's own live item count, and a close/delete handler pair. */ }


																</div>


															) }


														</ColDisCom>


													</React.Fragment>


												);


											} ) }
											{ genActBoo && newSltByGroObj[ curGroObj.name ] && newSltByGroObj[ curGroObj.name ].map( ( curPicObj ) => ( // What: New Slot Loader List Render. Why: A group with no entries yet, but an incoming pending slot mid-generation, still needs its own placeholder loader cards. How: This maps newSltByGroObj's own entry for curGroObj's name to one LoaCarCom per pending picker, only while genActBoo is true and a slot list actually exists.


												<LoaCarCom
													key={ `newslot-${ curPicObj.id }` }
													picker={ curPicObj }
													info={ genMapObj[ curPicObj.id ] }
												/> // What: Loader Card Component. Why: A group with no entries yet, but an incoming slot, still needs its own placeholder loader during generation. How: This is passed curPicObj plus its own live genMapObj record.

											) ) }


										</div>


									</section>


								);


							} ) }


						</div>


						{ shwFeaBoo && ( // What: App Features Section Visibility Check. Why: Pinned last always, see shwFeaBoo's own doc comment above and the matching rail entry above for why this isn't part of genBlkOrdArr/state.groupOrder. How: This renders the whole App Features section only while shwFeaBoo is true.


							<section
								ref={ ( curEle ) => { secRefObj.current[ '__appFeatures' ] = curEle; } }
								className='group-section af-section'
							>{ /* What: App Features Section Element. Why: This is the whole App Features block's own root. How: This renders GroHeaCom plus one AppFeaCom per still-relevant APP_FEA_ARR entry. */ }


								<GroHeaCom
									name='App Features'
									doneCount={ APP_FEA_ARR.filter( ( curFeaObj ) => feaStaObj[ curFeaObj.ideStr ] ).length }
									total={ APP_FEA_ARR.length }
									editMode={ false }
								/>{ /* What: Group Header Component. Why: App Features shares the exact same header chrome as a real group, but is never itself reorderable. How: This is passed a fixed name plus its own live done/total counts. */ }


								<div className='today-list'>{ /* What: App Features List Div Element. Why: Every still-relevant feature card shares this one list column. How: This maps the filtered APP_FEA_ARR list to one AppFeaCom per entry. */ }

									{ /* During a replay (fecDonBoo), a resolved card drops out the
									    instant it resolves instead of sticking around with an Undo
									    toggle, same "no closing card to synchronize a batch
									    disappearance against anymore" reasoning as groEntFun's own
									    replay-continuation cards. The ORIGINAL first-time pass is
									    unaffected: every card stays until the whole section resolves
									    together at the next real generation. */ }
									{ APP_FEA_ARR.filter( ( curFeaObj ) => !( fecDonBoo && feaStaObj[ curFeaObj.ideStr ] ) ).map( ( curFeaObj ) => ( // What: App Feature Card List Render. Why: Every still-relevant feature needs its own card; a resolved one during replay drops out immediately instead of lingering with an Undo toggle. How: This maps APP_FEA_ARR, filtered per the design note above, to one AppFeaCom per entry, keyed by its own ideStr.


										<AppFeaCom
											key={ curFeaObj.ideStr }
											feature={ curFeaObj }
											state={ state }
											actions={ actions }
											onPlayTutorial={ strMinFun }
											onUncheckAppFeature={ uncFeaFun }
										/> // What: App Feature Card Component. Why: This is one App Feature's own launcher card. How: This is passed curFeaObj plus the shared mini-tour dispatchers.

									) ) }


								</div>


							</section>


						) }

						{ shwCheBoo && ( // What: Generate Card Visibility Check. Why: The closing checklist card only belongs while the guided checklist is still showing. How: This renders the Generate card only while shwCheBoo is true.


							<div
								ref={ genCarRef }
								className={ `ob-create ob-create--generate ${ cheExiBoo ? 'is-removing' : '' } ${ !onbRdyBoo ? 'is-needed' : '' } ${ onbRdyBoo ? 'ob-generate-pulse' : '' }` }
							>{ /* What: Generate Card Div Element. Why: This is the closing "Generate a real list" checklist card. How: This renders its own icon/heading/explanation plus either a working or a disabled Generate button, depending on onbRdyBoo. */ }


								<div className='ob-create-i'>{ /* What: Card Icon Div Element. Why: Every onboarding create-style card shares this same icon slot. How: This wraps a fixed check icon. */ }

									<IcoSvgCom
										name='check'
										size={ 22 }
									/>

								</div>

								<b>Generate your real list</b>{ /* What: Card Heading Element. Why: This is the card's own fixed heading. How: This renders the literal phrase directly. */ }

								<p>{ genExpStr }</p>{ /* What: Card Explanation Element. Why: The user needs to know exactly what's still missing (or that everything is ready). How: This renders genExpStr directly. */ }


								{ onbRdyBoo ? ( // What: Generate Ready Check. Why: Generate's own trigger swaps between a real working button and an explained disabled one depending on readiness. How: This renders the working ButBasCom while onbRdyBoo is true, the disabled InfTipCom otherwise.


									<ButBasCom
										kind='primary'
										size='sm'
										icon='check'
										onClick={ onGenCarFun }
									>Generate your list</ButBasCom> // What: Button Base Component. Why: This is the actual working trigger once every requirement is satisfied. How: This calls onGenCarFun.


								) : ( // What: Disabled Generate Branch. Why: Without every requirement satisfied, Generate needs an explained disabled control instead. How: This renders the else branch, taken while onbRdyBoo is false.


									<InfTipCom
										className='btn btn--primary btn--sm is-disabled'
										label='Complete at least one "Create a picker" tutorial above first.'
										action='Generate your list'
									>Generate your list</InfTipCom> // What: Info Tip Component. Why: A not-yet-ready Generate button still needs to explain itself. How: This wraps a disabled-looking button with a fixed explanation.


								) }


							</div>


						) }

						{ onbEmpBoo && ( // What: Empty State Visibility Check. Why: This CTA only belongs to a brand-new user with no pickers at all. How: This renders the empty-state card only while onbEmpBoo is true.


							<div className='ob-create ob-create--empty'>{ /* What: Empty State Div Element. Why: A brand-new user with no pickers at all needs a plain, non-tour empty-state CTA. How: This renders its own icon/heading/explanation plus a Create-a-picker button. */ }


								<div className='ob-create-i'>{ /* What: Card Icon Div Element. Why: Every onboarding create-style card shares this same icon slot. How: This wraps a fixed plus icon. */ }

									<IcoSvgCom
										name='plus'
										size={ 22 }
									/>

								</div>

								<b>You do not have any pickers yet</b>{ /* What: Card Heading Element. Why: This is the card's own fixed heading. How: This renders the literal phrase directly. */ }

								<p>At least one picker is required for any items to show up here. You will need to create one with at least two items for it to choose from.</p>{ /* What: Card Explanation Element. Why: The user needs to understand why the list is empty and what to do about it. How: This renders a fixed explanatory sentence. */ }


								<ButBasCom
									kind='primary'
									size='sm'
									icon='plus'
									onClick={ begCreFun }
								>Create a picker</ButBasCom>{ /* What: Button Base Component. Why: This is the actual shortcut into the Pickers tab's own create flow. How: This calls begCreFun. */ }


							</div>


						) }

						{ onbShwNorBoo && ( // What: No-Run Empty State Visibility Check. Why: This CTA only belongs to a user with real pickers but nothing runnable today. How: This renders the card only while onbShwNorBoo is true.


							<div className='ob-create ob-create--empty ob-create--norun'>{ /* What: No-Run Empty State Div Element. Why: A user with real pickers but nothing runnable today needs its own explanatory empty state, distinct from the "no pickers at all" one above. How: This renders its own icon/heading/explanation with links out to the Data and Pickers tabs. */ }


								<div className='ob-create-i'>{ /* What: Card Icon Div Element. Why: Every onboarding create-style card shares this same icon slot. How: This wraps a fixed calendar icon. */ }

									<IcoSvgCom
										name='calendar'
										size={ 22 }
									/>

								</div>

								<b>There are no items to display</b>{ /* What: Card Heading Element. Why: This is the card's own fixed heading. How: This renders the literal phrase directly. */ }

								<p>You either have no pickers that are set to run with the auto-generator, or you do have pickers set to run with the auto-generator but they are not set to run on this day.</p>{ /* What: Card Explanation Element. Why: The user needs to understand exactly why nothing shows up today. How: This renders a fixed explanatory sentence. */ }

								<p>{ /* What: Card Action Explanation Element. Why: The user still needs an actual path forward, not just an explanation. How: This renders 2 inline tab-switch buttons inside a fixed sentence. */ }

									You can either change your pickers&rsquo; settings in the <button
										type='button'
										className='sub-tablink'
										onClick={ () => onNavTab && onNavTab( 'data' ) }
									>Data tab</button> to change this behavior or you can run them manually via the <button
										type='button'
										className='sub-tablink'
										onClick={ () => onNavTab && onNavTab( 'picker' ) }
									>Pickers tab</button> and then push them here to the Today tab.

								</p>


							</div>


						) }

						<div className='today-footer'>{ /* What: Today Footer Div Element. Why: The footer's own content swaps between the confirm prompt, Edit Mode actions, and the normal Regenerate/generated-on pair. How: This renders exactly one of the 3 branches below. */ }


							{ cfmGenBoo && !genActBoo ? ( // What: Confirm Gated Check. Why: The footer's own content depends on which of 3 mutually-exclusive states currently applies. How: This renders the regenerate-confirm prompt while cfmGenBoo is true and no generation is in flight, otherwise one of the 2 branches below.


								<div className='gen-confirm'>{ /* What: Generate Confirm Div Element. Why: Regenerate is confirm-gated since it replaces any completed items. How: This renders the fixed warning message plus a Cancel/Continue pair. */ }


									<p className='gen-confirm-msg'>This will replace any items marked as completed and these will not show up in the Stats tab. Continue?</p>{ /* What: Confirm Message Element. Why: The user needs to understand the real consequence before confirming. How: This renders a fixed warning sentence. */ }

									<div className='gen-confirm-actions'>{ /* What: Confirm Actions Div Element. Why: The Cancel/Continue pair reads as one cluster. How: This wraps both ButBasCom elements below. */ }


										<ButBasCom
											kind='ghost'
											size='sm'
											onClick={ () => setCfmGenBoo( false ) }
										>Cancel</ButBasCom>{ /* What: Button Base Component. Why: This backs out of the confirm without regenerating anything. How: This clears cfmGenBoo. */ }

										<ButBasCom
											kind='primary'
											size='sm'
											icon='refresh'
											className='gen-confirm-continue'
											onClick={ () => genFun() }
										>Continue</ButBasCom>{ /* What: Button Base Component. Why: This is the actual, confirmed regeneration trigger. How: This calls genFun with no options (a manual, non-auto run). */ }


									</div>


								</div>


							) : ediModBoo ? ( // What: Edit Mode Branch. Why: Edit Mode replaces the normal footer with its own Cancel/Done pair. How: This renders the edit-mode actions while ediModBoo is true, the normal footer otherwise.


								<div className='today-foot-actions editmode-foot-actions'>{ /* What: Edit Mode Foot Actions Div Element. Why: Edit Mode replaces the normal footer actions with its own Cancel/Done pair. How: This wraps both ButBasCom elements below. */ }


									<ButBasCom
										kind='ghost'
										onClick={ () => exitEdiFun( false ) }
									>Cancel</ButBasCom>{ /* What: Button Base Component. Why: This discards every drag made during the current Edit Mode session. How: This calls exitEdiFun(false). */ }

									<ButBasCom
										kind='primary'
										icon='check'
										onClick={ () => exitEdiFun( true ) }
									>Done</ButBasCom>{ /* What: Button Base Component. Why: This keeps every drag made during the current Edit Mode session. How: This calls exitEdiFun(true). */ }


								</div>


							) : ( // What: Normal Footer Branch. Why: Outside both the confirm prompt and Edit Mode, the normal Regenerate/generated-on footer belongs here instead. How: This renders the else branch, taken while neither prior condition holds.


								<React.Fragment>{ /* What: Normal Footer Fragment Element. Why: The Edit Mode/Regenerate action row and the generated-on sub-line are true siblings with no shared wrapper of their own. How: This groups both without adding an extra DOM node. */ }


									<div className='today-foot-actions'>{ /* What: Foot Actions Div Element. Why: The Edit Mode and Regenerate buttons read as one row. How: This wraps both controls below. */ }


										<ButBasCom
											kind='secondary'
											icon='grip'
											className='foot-editmode'
											disabled={ genActBoo }
											onClick={ togEdiFun }
										>Edit Mode</ButBasCom>{ /* What: Button Base Component. Why: This is the actual Edit Mode entry point. How: This calls togEdiFun, disabled while a generation is in flight. */ }

										{ shwCheBoo ? ( // What: Checklist-Gated Regenerate Branch. Why: Every picker (sample AND any real one already created mid-checklist, see genResBoo's own comment on why those stay hidden too) is hidden until the closing Generate card runs, and genFun's own picker loop skips anything hidden, so this would always produce an empty list while still updating today.generatedAt, misleadingly showing a fresh "List generated on..." timestamp for a regenerate that couldn't actually draw anything. How: This renders a real, disabled-and-explained Regenerate instead of a working one.


											<InfTipCom
												className='btn btn--secondary btn--md ob-generate is-disabled'
												label='Complete every tutorial above and generate your real list first.'
												action='Regenerate'
											>{ /* What: Info Tip Component. Why: A blocked Regenerate still needs to explain itself. How: This wraps a disabled-looking button with a fixed explanation. */ }


												<IcoSvgCom
													name='refresh'
													size={ 16 }
												/>Regenerate

											</InfTipCom>


										) : ( // What: Working Regenerate Branch. Why: Outside the guided checklist, the real working Regenerate control belongs here instead. How: This renders the else branch, taken while shwCheBoo is false.


											<ButBasCom
												kind='secondary'
												icon='refresh'
												className='ob-generate'
												disabled={ genActBoo }
												onClick={ () => setCfmGenBoo( true ) }
											>{ genActBoo ? 'Generating…' : 'Regenerate' }</ButBasCom> // What: Button Base Component. Why: This is the actual working Regenerate trigger, opening the confirm prompt above. How: This sets cfmGenBoo, disabled and relabeled while a cascade is already in flight.


										) }

									</div>


									<div className='today-foot-sub'>List generated on { forLonFun( state.today.generatedAt ) } at { forTimFun( state.today.generatedAt ) }</div>{ /* What: Foot Sub Div Element. Why: The user still deserves to know exactly when the current list was built. How: This renders state.today.generatedAt formatted 2 ways. */ }


								</React.Fragment>


							) }


						</div>


					</div>


				</div>


			</div>


			{ actMinTouObj && actMinTouObj.kind === 'reminder' && ( // What: Reminder Mini-Tour Check. Why: A running mini-tour only mounts RemTouCom when it's actually a reminder-kind tour. How: This renders RemTouCom only while actMinTouObj holds a value and its own kind is 'reminder'.


				<RemTouCom
					varKeyStr={ actMinTouObj.id === 'tk_ob_meds' ? 'once' : 'recurring' }
					staAppObj={ state }
					actStoObj={ actions }
					onCloForFun={ () => setActiveEditor( ( curValStr ) => curValStr === 'reminder-add' ? null : curValStr ) }
					onCloTouFun={ () => setActMinTouObj( null ) }
				/> // What: Reminder Tour Component. Why: A reminder mini-tour never leaves Today, so it renders directly here. How: This is passed which variant to run plus a close handler that clears actMinTouObj.

			) }
			{ shwFeaIntBoo && ( // What: App Features Intro Check. Why: The one-time intro tip only belongs once, right when it first becomes relevant. How: This renders FeaTipCom only while shwFeaIntBoo is true.

				<FeaTipCom actStoObj={ actions } /> // What: App Features Intro Tip. Why: The App Features section needs its own one-time "One Last Thing..." intro. How: This renders only while shwFeaIntBoo is true.

			) }


		</div>


	);


}

// #endregion TabToday



export { TabToday, EntryEditor }; // What: Named Exports. Why: app.jsx renders TabToday as the Today tab itself, and tab-picker.jsx/tab-data.jsx both reuse EntryEditor as the shared item-editing row. How: This re-exports the 2 declared above; every other binding in this file is internal-only.


