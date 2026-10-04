


// #region Imports

import cssModObj from './tab-today.module.css'; // What: CSS Module Object. Why: The Today tab's own styles live in its module. How: Each className and animation trigger reads its hashed class from here.
import React     from 'react';                  // What: React. Why: This is the UI library every component in this file is built on. How: This is used directly (React.useState, React.useRef, React.useEffect, React.useMemo, React.useCallback, React.forwardRef, React.useImperativeHandle, React.Fragment) throughout, instead of importing individual named hooks.


import { APP_FEA_ARR  } from '../../onboarding/app-features.jsx';   // What: App Feature Array. Why: This is the fixed catalog of App Features tutorial cards rendered once the checklist concludes. How: This is mapped over to render one AppFeaCom per entry and to compute the section's own done/total counts.
import { AppFeaCom    } from './app-feature-card.jsx';              // What: App Feature Card Component. Why: Each app feature gets a launcher card in the App Features group. How: This is rendered once per feature.
import { BacFloCom    } from '../../ui/bg-flourish.jsx';            // What: Background Flourish Component. Why: The decorative background glyphs render behind Today's own centered column too, same as every other tab. How: This is passed Today's own body ref and the fixed 'today' tab id.
import { ButBasCom    } from '../../ui/button.jsx';                 // What: Button Base Component. Why: Nearly every action in this file (confirm, cancel, save, merge, generate) is a shared styled button. How: This is used throughout instead of a bare <button> for anything that needs the app's own button styling.
import { CAD_NAM_OBJ  } from '../../core/cadence.js';               // What: Cadence Namespace Object. Why: Non-daily pickers need period-key math shared with the rest of the app. How: This is called for perKeyFun/comPerFun throughout generate() and the charging checks.
import { ColDisCom    } from '../../ui/collapse.jsx';               // What: Collapse Disclosure Component. Why: A group's Day Log panel and an entry's inline editor both need an animated expand/collapse wrapper. How: This wraps GroLogCom and EntEdiCom, gated on whichever key/eid currently owns the open state.
import { CON_NAM_OBJ  } from '../../core/conditionals.js';          // What: Conditionals Namespace Object. Why: Day-off suppression during generate() needs the shared conditional-evaluation logic. How: This is called via CON_NAM_OBJ.supGatFun against each picker's own resolved conditional.
import { createPortal } from 'react-dom';                           // What: Create Portal. Why: The completion celebration's confetti/sparkle overlay must escape the tabFadDiv wrapper's own containing block. How: This portals the celebration overlay straight onto document.body.
import { durMilFun    } from '../../utils/rhythm.js';               // What: Duration Millisecond Function. Why: Timers that wait on a CSS animation must end with it. How: This returns a duration step's length in milliseconds, matching the stylesheet's own --dur-* tokens.
import { emlTouObj    } from '../../state/tour-bus.js';             // What: Ease My Life Tour Object. Why: Several onboarding-adjacent features (checklist visibility, drag-hiding the tour coach, starting a create-picker flow) need to publish onto the shared tour event bus. How: This is written to directly (never read here) via its own .set method.
import { EntCarCom    } from './entry-card.jsx';                    // What: Entry Card Component. Why: Every Today entry renders as one card row. How: This is rendered once per entry inside its group.
import { EntEdiCom    } from '../../ui/entry-editor.jsx';           // What: Entry Editor Component. Why: A Today card's own item editor is the same shared editor the Pickers and Data tabs use. How: This is rendered inline under the card being edited.
import { FeaTipCom    } from '../../onboarding/app-features.jsx';   // What: Feature Tip Component. Why: The App Features section needs a one-time "One Last Thing..." intro the first time it is shown. How: This is rendered once shoIntBoo is true, passed actStoObj so it can mark itself seen.
import { forDatFun    } from '../../utils/date.js';                 // What: Format Date Function. Why: The header's own kicker line needs today's date in the app's shared display format. How: This formats the live now clock value shown next to the streak.
import { forLonFun    } from '../../utils/date.js';                 // What: Format Long Function. Why: The footer's "List generated on..." line needs the long-form date of the last generation. How: This formats staAppObj.today.generatedAt for that footer line.
import { forTimFun    } from '../../utils/date.js';                 // What: Format Time Function. Why: Both the header's kicker line and the footer's generated-on line need a formatted time of day. How: This formats the live now clock and staAppObj.today.generatedAt respectively.
import { groEntFun    } from './group-entries.js';                  // What: Group Entries Function. Why: The Today list renders its entries bucketed by group in the user's saved order. How: This is memoized over the app state to build the grouped list.
import { GroHeaCom    } from './group-header.jsx';                  // What: Group Header Component. Why: Every group, Page Tours and App Features included, opens with its own header. How: This is rendered above each group's cards.
import { GroLogCom    } from './day-log.jsx';                       // What: Group Log Component. Why: A group's Day Log panel needs to render that group's own picker audit rows. How: This is rendered inside a ColDisCom, scoped to one group's own name.
import { HelButCom    } from '../../help/button.jsx';               // What: Help Button Component. Why: Today needs the same help-mode toggle every other tab exposes. How: This is rendered in the header, toggling helModBoo.
import { HelOveCom    } from '../../help/mode.jsx';                 // What: Help Overlay Component. Why: Help mode needs its own coach-mark overlay driven by this tab's own catalog of targets. How: This is rendered once, passed TOD_HEL_ARR and the helModBoo/helExiFun pair.
import { HOL_NAM_OBJ  } from '../../core/holidays.js';              // What: Holidays Namespace Object. Why: Both generate()'s own skipHolidays gate and the no-run-today empty state need to know if today is an active holiday. How: This is called via HOL_NAM_OBJ.holDatFun against staAppObj.holidays.
import { IcoSvgCom    } from '../../ui/icon.jsx';                   // What: Icon Svg Component. Why: Nearly every card/button in this file needs a small named glyph alongside its label. How: This is rendered throughout, given a name and a size.
import { InfTipCom    } from '../../ui/info-tip.jsx';               // What: Info Tip Component. Why: A disabled action (a locked re-roll, a blocked tutorial, a disabled Regenerate) still needs to explain itself on hover/tap. How: This wraps whichever control needs an explanatory label throughout this file.
import { LoaCarCom    } from './regeneration-loader.jsx';           // What: Loader Card Component. Why: While a list generates, each picker's slot shows a cycling placeholder card. How: This is rendered once per slot until generation settles.
import { merOrdFun    } from './group-entries.js';                  // What: Merge Order Function. Why: An Edit Mode drag reorders only the groups or pickers present today. How: This merges that new order back into the full saved order before it is written.
import { norGroFun    } from '../../core/pickers.js';               // What: Normalize Group Function. Why: A typed group rename/Page Tours rename needs the same normalization real picker groups already get. How: This is called inside reqRenFun and pagColFun.
import { NOT_NAM_OBJ  } from '../../platform/notify.js';            // What: Notification Namespace Object. Why: An auto-generated list should still fire a best-effort system notification. How: This is called via NOT_NAM_OBJ.genNotFun() right after an auto run, its result deliberately ignored.
import { ONB_CHE_OBJ  } from '../../state/onboarding-checklist.js'; // What: Onboarding Checklist Object. Why: The whole mini-tour checklist phase (launcher cards, readiness, done/total counts) is driven by this shared namespace. How: This is called throughout for entLooFun/cheStaFun/reaPicFun/reaGenFun/othRemFun/tutProFun.
import { ONB_EPT_ARR  } from '../../state/onboarding-checklist.js'; // What: Onboarding Explore-Page-Tours Array. Why: The Page Tours section needs its own fixed manifest of tour cards, separate from sample pickers/tasks. How: This is mapped over to render one PagTouCom per entry and to compute that section's own counts.
import { ONB_GII_STR  } from '../../state/onboarding-checklist.js'; // What: Onboarding Generate-Item-Id String. Why: The closing "Generate a real list" card needs the checklist's own fixed key for that single card. How: This is passed to ONB_CHE_OBJ.entLooFun/setCarFun wherever that specific card is read or resolved.
import { ONB_SPI_ARR  } from '../../state/onboarding-seed-data.js'; // What: Onboarding Sample-Picker-Ids Array. Why: Every count/filter that distinguishes a real picker from a sample one needs this fixed id list. How: This is checked with .includes throughout TabTodCom's own counts.
import { ONB_STI_ARR  } from '../../state/onboarding-seed-data.js'; // What: Onboarding Sample-Task-Ids Array. Why: Every count/filter that distinguishes a real reminder from a sample one needs this fixed id list. How: This is checked with .includes throughout TabTodCom's own tutorial-task counts.
import { PagTouCom    } from './page-tour-card.jsx';                // What: Page Tour Card Component. Why: Each page tour gets a launcher card in the Page Tours group. How: This is rendered once per page tour.
import { PIC_NAM_OBJ  } from '../../core/pickers.js';               // What: Pickers Namespace Object. Why: Picking, re-rolling, and ease eligibility all funnel through this shared namespace. How: This is called for picIteFun/easEliFun throughout generate() and hanRerFun.
import { redMotFun    } from '../../utils/motion.js';               // What: Reduce Motion Function. Why: Nearly every animated sequence in this file (celebration, reel cascade, card flip, scroll) needs to skip or shorten itself for a user who prefers reduced motion. How: This is checked throughout as a plain function call.
import { RemSecCom    } from './reminders-section.jsx';             // What: Reminder Section Component. Why: The Reminders block is one whole section rendered alongside the picker groups. How: This is rendered once per the '__reminders' sentinel in genOrdArr.
import { RemTouCom    } from '../../onboarding/reminder-tours.jsx'; // What: Reminder Tour Component. Why: A reminder mini-tour never leaves Today, so it is rendered directly here rather than lifted to app.jsx. How: This is rendered while minTouObj holds a 'reminder' kind entry.
import { REO_NAM_OBJ  } from './reorder.js';                        // What: Reorder Namespace Object. Why: Edit Mode's group and item drag-to-reorder both need the shared pointer-drag mechanism. How: This is called via REO_NAM_OBJ.staDraFun inside groDraFun/iteDraFun.
import { rhyPxlFun    } from '../../utils/rhythm.js';               // What: Rhythm Pixel Function. Why: Pixel layout math here needs the same step sizes the stylesheet uses. How: This returns a vertical rhythm step in pixels at the current root font size.
import { TAS_NAM_OBJ  } from '../../core/tasks.js';                 // What: Tasks Namespace Object. Why: Reminders due today, their anchor date, and their ring/rail eligibility are all computed through this shared namespace. How: This is called throughout for ancDatFun/visTodFun/isaDonFun/optForFun/isaComFun.
import { TOD_HEL_ARR  } from '../../help/content.jsx';              // What: Today Help Array. Why: Help mode needs this tab's own catalog of coach-mark targets. How: This is passed straight to HelOveCom.
import { togFadFun    } from '../../ui/edge-fade.js';               // What: Toggle Fade Function. Why: Every scrolling rail in this file hides each edge fade once that edge is reached. How: This is called by each rail's own scroll and resize handlers.
import { useEmlTouFun } from '../../state/tour-bus.js';             // What: Use Ease My Life Tour. Why: The rendered tip/reserved-space fields the tour bus publishes need to be read reactively, not just written to. How: This is called to subscribe to the same bus emlTouObj writes onto.

// #endregion Imports



/**
 * tab-today.jsx = Tab Today
 *
 * @summary
 * The Today tab: the auto-generated daily list itself, grouped and reorderable
 * through Edit Mode's own drag system, with each entry's pick, skip, re-roll
 * and edit lifecycle, the loading state while a new list is generated, and the
 * checklist launcher cards for every onboarding tour kind.
 *
 * TabTodCom ties it all together. Its pieces live beside it in this folder:
 * group-entries.js builds the grouped list, group-header.jsx and
 * entry-card.jsx render each group and row, regeneration-loader.jsx the
 * generating placeholders, and page-tour-card.jsx and app-feature-card.jsx the
 * Today-specific launcher cards, which are not the same components as the real
 * PagTouCom and FeaTouCom tour overlays in onboarding/ despite sharing a
 * purpose. Each card's inline item editor is the shared EntEdiCom from
 * ui/entry-editor.jsx.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

// #region TabTodCom

/**
 * TabTodCom = Tab Today Component
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
 * @param props.actStoObj   - Action Store Object: {@link useAppStaFun}
 * @param props.onNavHomFun - On Navigate Home Function: Returns to the Today
 *                            tab (used by the brand mark).
 * @param props.onNavTabFun - On Navigate Tab Function: Switches to a
 *                            different tab by id.
 * @param props.onStaFeaFun - On Start Feature Function: Starts an App
 *                            Features tutorial at the app level.
 * @param props.onStaPagFun - On Start Page Function: Starts an "Explore the
 *                            page" tour at the app level.
 * @param props.onStaPicFun - On Start Picker Function: Starts a sample-picker
 *                            mini-tour at the app level (some steps navigate
 *                            away from Today).
 * @param props.staAppObj   - State App Object: {@link useAppStaFun}
 *
 * @returns The Today tab's entire rendered content: its header, its
 * grouped list (or empty-state CTAs), and any reminder mini-tour/App
 * Features intro overlay currently running.
 *
 * @example
 * ```tsx
 * TabTodCom({ actStoObj, onNavHomFun, onNavTabFun, ... }) // => <TabTodCom />
 * ```
 *
*/

function TabTodCom ( { actStoObj, onNavHomFun, onNavTabFun, onStaFeaFun, onStaPagFun, onStaPicFun, staAppObj } ) {


	const todBodRef = React.useRef( null ); // What: Today Body Reference. Why: Today does not share app.jsx's shared .maiInnDiv wrapper (see .todBodDiv's own comment below), so it measures/caches its own flourish instance instead of reusing a ref threaded down from there. How: This is attached to the .todBodDiv div's own ref prop below and read by BacFloCom to measure it.



	// #region Help Mode State

	/**
	 * tab-today.jsx = Help Mode State
	 *
	 * @summary
	 * Local, resets to off on every remount (tab switch), which is
	 * exactly the "navigating away closes it, the page you land on
	 * doesn't inherit it" behavior the design called for. Content lives
	 * in help/content.jsx's TOD_HEL_ARR rather than inline here,
	 * same as every other tab; Today needs no disposable sample data
	 * seeded for it, since every target it points at either is always-
	 * present UI chrome or gracefully renders no badge if the user has no
	 * entries yet, unlike Pickers/Data/Stats.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const [ helModBoo, setHelModBoo ] = React.useState( false ); // What: Help Mode Boolean And Setter. Why: See the doc comment just above. How: This is toggled by the header's own HelButCom.

	const helExiFun = React.useCallback( () => setHelModBoo( false ), [] ); // What: Help Exit Function. Why: HelOveCom needs a stable exit handler that closes help mode. How: This calls setHelModBoo with false; an empty dependency array means this is created once.

	// #endregion Help Mode State

	const groDisArr = React.useMemo( () => groEntFun( staAppObj ), [ staAppObj ] ); // What: Group Display Array. Why: This is the actual bucketed/sorted group list the content column and rail both render from. How: This calls groEntFun, recomputed whenever state itself changes.



	// #region bloOrdArr

	/**
	 * bloOrdArr = Block Order Array
	 *
	 * @summary
	 * The unified block order: the Reminders block (the '__reminders'
	 * sentinel) plus the picker groups, sequenced by staAppObj.groupOrder.
	 * Drives both the rail and the content column so Reminders can be
	 * dragged among the groups in Edit Mode.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const bloOrdArr = React.useMemo( () => { // What: Block Order Array. Why: See the doc comment just above. How: This walks staAppObj.groupOrder, keeping every recognized group/sentinel and appending anything new, then defaults Page Tours to right after Reminders the first time it appears.


		const savOrdArr = staAppObj.groupOrder || [];                         // What: Saved Order Array. Why: The user's own Edit Mode drags are the primary source of block order. How: This reads staAppObj.groupOrder, falling back to an empty array.
		const groNamArr = groDisArr.map( ( curGroObj ) => curGroObj.namStr ); // What: Group Name Array. Why: The walk below needs a fast way to confirm a saved name still refers to a real, currently-rendered group. How: This maps groDisArr down to just each group's own name.
		const seeNamSet = new Set();                                          // What: Seen Name Set. Why: The push helper below needs a fast way to avoid collecting the same block twice. How: This is checked and added to by pusIdeFun.
		const ideOrdArr = [];                                                 // What: Identifier Order Array. Why: This collects the final block order built up by the passes below. How: This is pushed to by pusIdeFun and returned at the end of this memo.


		const pusIdeFun = ( curIdeStr ) => { // What: Push Identifier Function. Why: Every pass below needs the exact same dedupe-then-collect step. How: This adds curIdeStr to both seeNamSet and ideOrdArr only the first time it is seen.


			if ( seeNamSet.has( curIdeStr ) ) return; // What: Already Collected Guard. Why: A block must only appear once in the order. How: This bails out when curIdeStr was already collected.



			seeNamSet.add( curIdeStr );  // What: Seen Record. Why: Every later push of this same id must now read as a repeat. How: This adds curIdeStr to seeNamSet.
			ideOrdArr.push( curIdeStr ); // What: Order Collect. Why: This id's own first push is exactly where it belongs in the order. How: This appends curIdeStr to ideOrdArr.


		};


		if ( !savOrdArr.includes( '__reminders' ) ) pusIdeFun( '__reminders' ); // What: Reminders Default Guard. Why: A saved order predating the Reminders sentinel still needs Reminders to lead. How: This pushes '__reminders' up front only when savOrdArr doesn't already mention it.



		for ( const curOrdStr of savOrdArr ) { // What: Saved Order Pass. Why: Whatever the user has already positioned (Reminders, Page Tours, or a real group) keeps that position. How: This pushes each saved entry that is either a recognized sentinel or a currently-real group name.


			if ( curOrdStr === '__reminders' || curOrdStr === '__pageTours' ) pusIdeFun( curOrdStr ); // What: Sentinel Branch. Why: The Reminders and Page Tours blocks are always valid saved-order entries. How: This pushes the sentinel id as-is.

			else if ( groNamArr.includes( curOrdStr ) ) pusIdeFun( curOrdStr ); // What: Live Group Branch. Why: A saved group name only belongs in the order while that group still exists today. How: This pushes curOrdStr only when groNamArr still holds it.


		}



		for ( const groCurStr of groNamArr ) pusIdeFun( groCurStr ); // What: First-Occurrence Pass. Why: A real group not yet in the saved order still needs a stable position. How: This appends any not-yet-collected group name in groDisArr's own order.



		pusIdeFun( '__reminders' ); // What: Reminders Trailing Guard. Why: On the very first render (an empty savOrdArr), the front-guard above never ran, so this second call is what actually seeds Reminders at all; pusIdeFun's own dedupe makes this a no-op on every later render. How: This pushes '__reminders' again, harmlessly, if it somehow still isn't collected.

		if ( !seeNamSet.has( '__pageTours' ) ) ideOrdArr.splice( ideOrdArr.indexOf( '__reminders' ) + 1, 0, '__pageTours' ); // What: Page Tours Default Splice. Why: Page Tours defaults to right after Reminders the first time it shows up (e.g. a saved order predating Page Tours entirely), so it needs no backfill in migStaFun(); once the user drags it in Edit Mode, its own saved position takes over like any other group. How: This splices '__pageTours' in right after '__reminders' only when it wasn't already collected above.



		return ideOrdArr; // What: Block Order Return. Why: The rail and content column both need this final sequence. How: This returns the same array built by the passes above.


	}, [ staAppObj.groupOrder, groDisArr ] ); // What: Effect Dependency Array. Why: This only needs recomputing when the user's own saved order changes, or when the real group list itself changes shape. How: staAppObj.groupOrder is the saved-order source; groDisArr is the real-group source.

	// #endregion bloOrdArr


	const groNamObj = React.useMemo( () => { // What: Group Name Object. Why: The content column below needs to resolve a block id straight to its own group record, not re-scan groDisArr on every row. How: This builds a { name: group } lookup once per groDisArr change.


		const namMapObj = {}; // What: Name Map Object. Why: The forEach below needs a plain object to populate. How: This starts empty and is written to just below.


		groDisArr.forEach( ( curGroObj ) => { namMapObj[ curGroObj.namStr ] = curGroObj; } ); // What: Name Map Populate. Why: Every real group needs its own entry in the lookup. How: This keys namMapObj by curGroObj's own name.



		return namMapObj; // What: Name Map Return. Why: The caller needs the populated lookup. How: This returns the same object just populated above.


	}, [ groDisArr ] ); // What: Memo Dependency Array. Why: The lookup only needs rebuilding when the group list itself changes. How: groDisArr is the only input the forEach above reads.


	const todEntArr = React.useMemo( () => { // What: Today Entry Array. Why: Every count below needs today's own entries with hidden-picker rows already excluded, matching groEntFun's own exclusion so counts and rendered rows never disagree. How: This filters staAppObj.today.entries against the current hidden-picker id set.


		const hidPicSet = new Set( staAppObj.pickers.filter( ( curPicObj ) => curPicObj.hidden ).map( ( curPicObj ) => curPicObj.id ) ); // What: Hidden Picker Set. Why: An entry belonging to a still-hidden picker (see the hidden flag in migrate.js's migStaFun()) must be excluded from every count here. How: This collects every currently-hidden picker's own id.



		return staAppObj.today.entries.filter( ( curEntObj ) => !curEntObj.pickerId || !hidPicSet.has( curEntObj.pickerId ) ); // What: Entry Filter Return. Why: This is the actual filtered list every count below reads from. How: This keeps a day-off entry (no pickerId) and any entry whose own pickerId isn't in hidPicSet.


	}, [ staAppObj.today.entries, staAppObj.pickers ] ); // What: Memo Dependency Array. Why: The filtered list only changes when today's entries or the pickers' hidden flags change. How: staAppObj.today.entries is the list being filtered, and staAppObj.pickers supplies hidPicSet.



	// #region Reminder Ring Counts

	/**
	 * tab-today.jsx = Reminder Ring Counts
	 *
	 * @summary
	 * Manual reminders due today join the picker entries in the ring +
	 * rail totals (they count toward completion + streak, but never
	 * toward Stats). Visibility honors each type's weekend/holiday
	 * exclusions; the ring only counts reminders whose type has "include
	 * in completion ring" on. Pinned to the last generation (not live
	 * "now"), via TAS_NAM_OBJ.ancDatFun, so these totals always agree with
	 * what RemSecCom is actually showing.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const genTimStr = staAppObj.today && staAppObj.today.generatedAt;                                                       // What: Generated Time String. Why: The anchor below needs to know the last real generation timestamp, not the live clock. How: This reads staAppObj.today.generatedAt.
	const remAncObj = React.useMemo( () => TAS_NAM_OBJ.ancDatFun( genTimStr ), [ genTimStr ] );                             // What: Reminders Anchor Object. Why: See the doc comment just above. How: This calls TAS_NAM_OBJ.ancDatFun with genTimStr.
	const dueTasArr = React.useMemo( () => TAS_NAM_OBJ.visTodFun( staAppObj.tasks, staAppObj.reminderOpts, staAppObj.holidays, remAncObj ), [ staAppObj.tasks, staAppObj.reminderOpts, staAppObj.holidays, remAncObj ] ); // What: Due Task Array. Why: This is the real, currently-visible reminder list. How: This calls TAS_NAM_OBJ.visTodFun against remAncObj.
	const visDonNum = dueTasArr.filter( ( curTasObj ) => TAS_NAM_OBJ.isaDonFun( curTasObj, remAncObj ) ).length;            // What: Visible Done Number. Why: The rail's own Reminders pill needs a done count covering every VISIBLE due reminder, ring-eligible or not. How: This counts dueTasArr entries that TAS_NAM_OBJ.isaDonFun already reports done.
	const rinTasArr = dueTasArr.filter( ( curTasObj ) => TAS_NAM_OBJ.optForFun( curTasObj, staAppObj.reminderOpts ).ring ); // What: Ring Task Array. Why: Only a reminder type with "include in completion ring" on should ever affect the ring itself. How: This filters dueTasArr down to just those.
	const remDonNum = rinTasArr.filter( ( curTasObj ) => TAS_NAM_OBJ.isaDonFun( curTasObj, remAncObj ) ).length;            // What: Reminders Done Number. Why: The completion ring itself only ever counts ring-eligible reminders. How: This counts rinTasArr entries that TAS_NAM_OBJ.isaDonFun already reports done.

	// #endregion Reminder Ring Counts



	// #region Checklist Visibility

	/**
	 * tab-today.jsx = Checklist Visibility
	 *
	 * @summary
	 * Mini-tour launcher cards (pickers + reminders + Page Tours + the
	 * closing Generate card) join the ring/rail totals the whole time
	 * they're on screen, see groEntFun's own copy of this same gate. Kept
	 * additive/separate from todEntArr/dueTasArr (rather than merged in) so
	 * streak reconciliation and Stats stay untouched by tutorial-card
	 * completion, see store.js's stkSynFun, which only ever reads
	 * staAppObj.today.entries/staAppObj.tasks.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const cheDonBoo = !!( staAppObj.onboarding && staAppObj.onboarding.checklistDone );                                            // What: Checklist Done Boolean. Why: This decides whether the mini-tour checklist phase should still be showing at all. How: This reads staAppObj.onboarding.checklistDone.
	const picHidBoo = staAppObj.pickers.some( ( curPicObj ) => curPicObj.hidden && ONB_SPI_ARR.includes( curPicObj.id ) );         // What: Picker Hidden Boolean. Why: Sample pickers flip hidden exactly once, at the main Welcome Tour's last step. How: This is true once any sample picker is hidden.
	const tasHidBoo = ( staAppObj.tasks || [] ).some( ( curTasObj ) => curTasObj.hidden && ONB_STI_ARR.includes( curTasObj.id ) ); // What: Task Hidden Boolean. Why: Sample reminders flip hidden at that same moment. How: This is true once any sample task is hidden.
	const maiEndBoo = picHidBoo || tasHidBoo;                                                                                      // What: Main Tour Ended Boolean. Why: Whether the main Welcome Tour has concluded decides whether the checklist phase should be considered at all, independent of cheDonBoo. How: This is true once either kind of sample has flipped hidden.
	const shoCheBoo = maiEndBoo && !cheDonBoo;                                                                                     // What: Show Checklist Boolean. Why: The whole checklist phase (launcher cards, Page Tours, the closing Generate card) should only show between the main tour ending and the checklist actually concluding. How: This combines maiEndBoo with the negation of cheDonBoo.

	// #endregion Checklist Visibility



	// #region rptVisBoo

	/**
	 * rptVisBoo = Replay-Page-Tours Visible Boolean
	 *
	 * @summary
	 * Page Tours cards keep offering themselves post-checklistDone too,
	 * same "Replay Tour resets each item's own entry but never
	 * checklistDone itself" reasoning as groEntFun's own picker-sample
	 * cards; no name-collision concept applies here (a page tour isn't
	 * named after anything the user could "already have"), just whether
	 * it's still unresolved. Kept separate from shoCheBoo since shoCheBoo
	 * ALSO drives the closing Generate card's entire real side-effect
	 * chain (see the genResBoo effect further below); reusing
	 * it here would risk resurrecting that "auto-generate a fresh list"
	 * flow, which has nothing to run against a second time (the user
	 * already has a real list).
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const rptVisBoo = cheDonBoo && maiEndBoo && ONB_EPT_ARR.some( ( curTouObj ) => !ONB_CHE_OBJ.entLooFun( staAppObj, curTouObj.ideStr ) ); // What: Replay-Page-Tours Visible Boolean. Why: See the doc comment just above. How: This is true only post-checklistDone, post-maiEndBoo, while at least one page tour is still unresolved.

	// #endregion rptVisBoo



	// #region App Features Gates

	/**
	 * tab-today.jsx = App Features Gates
	 *
	 * @summary
	 * App Features (see onboarding/app-features.jsx) is a separate,
	 * later-stage set of tutorials shown only AFTER the user has
	 * generated their first real todo list; once resolved (Play-to-
	 * finish, X to cancel, same as any other tutorial card) it never
	 * comes back on its own, and the whole section just stops rendering
	 * once every one of them is resolved. Mutually exclusive with
	 * shoCheBoo by construction (cheDonBoo can only ever be true once
	 * shoCheBoo's own gate has already gone false), so there is no
	 * ordering conflict to resolve against Page Tours, but cheDonBoo
	 * itself, unlike shoCheBoo, never resets back to false on a Replay
	 * Tour (see onboarding/welcome-tour.jsx), which is exactly why these
	 * need Settings' replay button to explicitly clear appFeatures back to
	 * {} to reappear, rather than reappearing automatically the way the
	 * checklist-driven cards do.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const feaStaObj = ( staAppObj.onboarding && staAppObj.onboarding.appFeatures ) || {};            // What: Feature State Object. Why: Every App Features check below needs this same resolved-or-empty map. How: This reads staAppObj.onboarding.appFeatures, falling back to an empty object.
	const fsrFlaBoo = !!( staAppObj.onboarding && staAppObj.onboarding.appFeaturesSectionResolved ); // What: Feature-Section-Resolved Flag Boolean. Why: A persisted snapshot, only ever flipped true inside generate() itself, deliberately NOT a live check during the user's ORIGINAL first-ever pass, so finishing the last of the 8 tutorials doesn't yank the whole section out from under them mid-session with no natural boundary; it stays visible, fully checked, until their NEXT real generation. How: This reads staAppObj.onboarding.appFeaturesSectionResolved.
	const fecDonBoo = !!( staAppObj.onboarding && staAppObj.onboarding.appFeaturesEverCompleted );   // What: Feature-Ever-Completed Done Boolean. Why: Unlike fsrFlaBoo, this is NEVER reset by Replay Tour, set once alongside it and staying true forever after, same "permanent, one-way" semantics as cheDonBoo itself; it distinguishes "this is the user's ORIGINAL, first-ever pass" from "this is a REPLAY", since both share the identical feaStaObj shape otherwise. How: This reads staAppObj.onboarding.appFeaturesEverCompleted.

	// #endregion App Features Gates



	// #region shoFeaBoo

	/**
	 * shoFeaBoo = Show Feature Boolean
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

	const shoFeaBoo = cheDonBoo && ( fecDonBoo ? APP_FEA_ARR.some( ( curFeaObj ) => !feaStaObj[ curFeaObj.ideStr ] ) : !fsrFlaBoo ); // What: Show App Features Boolean. Why: See the doc comment just above. How: This branches on fecDonBoo to pick either the live "some still unresolved" check or the negation of the first-time snapshot.

	// #endregion shoFeaBoo



	React.useEffect( () => { emlTouObj.set( { shoCheBoo : shoCheBoo } ); }, [ shoCheBoo ] ); // What: Checklist Bus Publish Effect. Why: reminders-section.jsx's staAddFun needs to hide ANY reminder created while the checklist is up, not just ones a mini-tour itself creates, so a user manually clicking "+" mid-onboarding doesn't clutter the list alongside the still-open launcher cards either (see the unhide side in the genResBoo effect further below). How: This republishes shoCheBoo onto the shared tour bus under its own shoCheBoo field.

	const pagNamStr = ( staAppObj.onboarding && staAppObj.onboarding.pageToursName ) || 'Page Tours'; // What: Page Name String. Why: The Page Tours section header needs its own, possibly user-renamed, display name. How: This reads staAppObj.onboarding.pageToursName, falling back to the fixed default.


	// #region pagColFun

	/**
	 * pagColFun = Page Collision Function
	 *
	 * @summary
	 * GroHeaCom's rename validator for the Page Tours section. Page Tours has no
	 * pickers to merge on a name collision, so a collision blocks the rename
	 * outright: the trimmed, normalized name is checked case-insensitively
	 * against every real group name and the fixed Reminders label.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param rawValStr - Raw Value String: The typed rename.
	 *
	 * @returns An error message naming the colliding group, or null when the name
	 * is empty or free.
	 *
	 * @example
	 * ```ts
	 * pagColFun( rawValStr ) // => message or null
	 * ```
	 *
	*/

	const pagColFun = ( rawValStr ) => { // What: Page Collision Function. Why: Page Tours has no pickers to merge into on a name collision (unlike a real group's own rename), so a collision just blocks the rename outright, checked against every real group name plus the fixed "Reminders" label, the other section header that isn't itself a real group. How: This normalizes rawValStr and checks it against every existing group/Reminders name, case-insensitively.


		const triValStr = String( rawValStr || '' ).trim(); // What: Trimmed Value String. Why: A typed rename needs its surrounding whitespace trimmed before it is checked at all. How: This trims rawValStr, coerced to a string first.


		if ( !triValStr ) return null; // What: Empty Value Guard. Why: An empty rename has nothing to collide with. How: This returns null early when triValStr is empty.



		const tarNamStr = norGroFun( triValStr ) || triValStr;                                                                                    // What: Target Name String. Why: The typed name needs the same normalization a real group name would get before comparison. How: This calls norGroFun, falling back to the raw trimmed value if normalization returns nothing.
		const exiGroArr = [ ...new Set( staAppObj.pickers.filter( ( curPicObj ) => curPicObj.group ).map( ( curPicObj ) => curPicObj.group ) ) ]; // What: Existing Group Array. Why: The collision check needs every real group name currently in use. How: This deduplicates every picker's own group field via a Set.


		exiGroArr.push( 'Reminders' ); // What: Reminders Name Push. Why: "Reminders" is the other fixed section header that isn't itself a real group, and still must not collide. How: This appends the literal string 'Reminders' to exiGroArr.

		const hitGroStr = exiGroArr.find( ( curGroStr ) => curGroStr.toLowerCase() === tarNamStr.toLowerCase() ); // What: Hit Group String. Why: This is the actual matching existing name, if any. How: This finds a case-insensitive match for tarNamStr within exiGroArr.



		return hitGroStr ? `A group named “${ hitGroStr }” already exists.` : null; // What: Collision Message Return. Why: The caller needs either a real error message or a clean null. How: This formats hitGroStr into the fixed collision sentence, or returns null when there was no match.


	};

	// #endregion pagColFun



	// #region Replay-Continuation Counts

	/**
	 * tab-today.jsx = Replay-Continuation Counts
	 *
	 * @summary
	 * Mirrors rptVisBoo: once cheDonBoo, mini-tour picker/task cards keep
	 * offering themselves (per groEntFun's and reminders-section.jsx's own
	 * collision-filtered checks) even though shoCheBoo itself has gone
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
	 * same-named real picker/task, see store.js's addPicFun/addTasFun)
	 * would immediately "collide" with its own result and undercount the
	 * very card it just finished.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const repActBoo = cheDonBoo && maiEndBoo; // What: Replay Active Boolean. Why: This is the shared gate every count below branches on. How: This combines cheDonBoo with maiEndBoo.


	const samVisFun = ( recCurObj, samIdeArr, allRecArr ) => { // What: Sample Visible Function. Why: A sample picker or task card only counts toward the ring while its own card is actually on screen, and that rule is identical for both kinds. How: This checks that recCurObj is a hidden sample, then (only once cheDonBoo) that it is still unresolved and not name-collided with a real record.


		const isaSamBoo = recCurObj.hidden && samIdeArr.includes( recCurObj.id );                                                                    // What: Is-A Sample Boolean. Why: Only a hidden sample offers a launcher card. How: This checks the hidden flag and samIdeArr membership.
		const isaOpeBoo = shoCheBoo || !ONB_CHE_OBJ.entLooFun( staAppObj, recCurObj.id );                                                            // What: Is-An Open Boolean. Why: During a replay a resolved card is no longer rendered, so it must drop out of the count. How: This is always true in the first-time phase, otherwise true only while the card has no checklist entry.
		const isaUniBoo = shoCheBoo || !allRecArr.some( ( othRecObj ) => !samIdeArr.includes( othRecObj.id ) && othRecObj.name === recCurObj.name ); // What: Is-A Unique Boolean. Why: During a replay a sample whose name a real record already took stops offering its card. How: This is always true in the first-time phase, otherwise true only when no real record shares the sample's own name.



		return isaSamBoo && isaOpeBoo && isaUniBoo; // What: Visible Return. Why: The card is on screen only when every one of those conditions holds. How: This returns their combination.


	};


	const samDonFun = ( recCurObj, samIdeArr ) => { // What: Sample Done Function. Why: The first-time phase counts a resolved sample card as done, the same way for pickers and tasks. How: This checks that recCurObj is a hidden sample that already has a checklist entry.


		const isaSamBoo = recCurObj.hidden && samIdeArr.includes( recCurObj.id ); // What: Is-A Sample Boolean. Why: Only a hidden sample offers a launcher card. How: This checks the hidden flag and samIdeArr membership.
		const hasEntBoo = !!ONB_CHE_OBJ.entLooFun( staAppObj, recCurObj.id );     // What: Has Entry Boolean. Why: A card with a checklist entry has been resolved. How: This looks the card up in the checklist.



		return isaSamBoo && hasEntBoo; // What: Done Return. Why: The card counts as done only when both hold. How: This returns their combination.


	};


	const tasAllArr = staAppObj.tasks || []; // What: Task All Array. Why: Every task count below reads the same possibly-missing task list. How: This falls back to an empty array.


	const picCarNum = ( shoCheBoo || repActBoo ) // What: Picker Card Number. Why: See the doc comment just above. How: This counts every visible sample picker card, or 0 while neither gate is open.
		? staAppObj.pickers.filter( ( curPicObj ) => samVisFun( curPicObj, ONB_SPI_ARR, staAppObj.pickers ) ).length // What: Visible Count Branch. Why: A gate is open, so on-screen picker cards count. How: This counts the pickers samVisFun accepts.
		: 0; // What: Closed Branch. Why: Neither gate is open, so no picker cards are showing. How: This returns 0.


	const picDonNum = shoCheBoo // What: Picker Done Number. Why: The first-time phase counts every resolved sample picker card as done. How: This counts resolved sample pickers, or 0 outside shoCheBoo.
		? staAppObj.pickers.filter( ( curPicObj ) => samDonFun( curPicObj, ONB_SPI_ARR ) ).length // What: Done Count Branch. Why: The checklist phase is showing. How: This counts the pickers samDonFun accepts.
		: 0;                                                                                      // What: Closed Branch. Why: Outside the first-time phase nothing counts as done here. How: This returns 0.


	const tasCarNum = ( shoCheBoo || repActBoo ) // What: Task Card Number. Why: Same reasoning as picCarNum, for sample reminders. How: This counts every visible sample task card, or 0 while neither gate is open.
		? tasAllArr.filter( ( curTasObj ) => samVisFun( curTasObj, ONB_STI_ARR, tasAllArr ) ).length // What: Visible Count Branch. Why: A gate is open, so on-screen task cards count. How: This counts the tasks samVisFun accepts.
		: 0;                                                                                         // What: Closed Branch. Why: Neither gate is open, so no task cards are showing. How: This returns 0.


	const tasDonNum = shoCheBoo // What: Task Done Number. Why: The first-time phase counts every resolved sample task card as done. How: This counts resolved sample tasks, or 0 outside shoCheBoo.
		? tasAllArr.filter( ( curTasObj ) => samDonFun( curTasObj, ONB_STI_ARR ) ).length // What: Done Count Branch. Why: The checklist phase is showing. How: This counts the tasks samDonFun accepts.
		: 0;                                                                              // What: Closed Branch. Why: Outside the first-time phase nothing counts as done here. How: This returns 0.


	const pagCarNum = shoCheBoo // What: Page Card Number. Why: Same replay-continuation treatment as the picker/task counts above: still counted while rptVisBoo cards are on screen, but (matching the render map's own resolved-cards-vanish behavior) only the still-unresolved ones. How: This is every tour during the first-time phase, only the unresolved ones during a replay, otherwise 0.
		? ONB_EPT_ARR.length                                                                                  // What: Checklist Branch. Why: The first-time phase shows every tour card. How: This counts all of ONB_EPT_ARR.
		: rptVisBoo                                                                                           // What: Replay Check. Why: A replay only shows the still-unresolved tours. How: This tests rptVisBoo next.
		? ONB_EPT_ARR.filter( ( curTouObj ) => !ONB_CHE_OBJ.entLooFun( staAppObj, curTouObj.ideStr ) ).length // What: Replay Branch. Why: Only unresolved tours are on screen. How: This counts the tours with no checklist entry.
		: 0;                                                                                                  // What: Hidden Branch. Why: No Page Tours cards are showing. How: This returns 0.


	const pagDonNum = shoCheBoo ? ONB_EPT_ARR.filter( ( curTouObj ) => ONB_CHE_OBJ.entLooFun( staAppObj, curTouObj.ideStr ) ).length : 0; // What: Page Done Number. Why: The first-time phase counts every resolved page tour as done. How: This counts resolved ONB_EPT_ARR entries, 0 outside shoCheBoo.
	const genCarNum = shoCheBoo ? 1 : 0;                                                                                                  // What: Generate Card Count Number. Why: The closing Generate card only ever contributes 1 slot to the total, and only during the first-time checklist phase. How: This is 1 while shoCheBoo, otherwise 0.
	const genDonNum = ( shoCheBoo && ONB_CHE_OBJ.entLooFun( staAppObj, ONB_GII_STR ) ) ? 1 : 0;                                           // What: Generate Card Done Number. Why: The closing Generate card's own done contribution mirrors genCarNum. How: This is 1 only while shoCheBoo AND the Generate item already has a checklist entry.

	// #endregion Replay-Continuation Counts



	// #region Completion Counts

	const entDonNum = todEntArr.filter( ( curEntObj ) => curEntObj.done ).length;                          // What: Entry Done Number. Why: Done picker and day-off entries are the ring's main source of progress. How: This counts todEntArr's own done entries.
	const donCouNum = entDonNum + remDonNum + picDonNum + tasDonNum + pagDonNum + genDonNum;               // What: Done Count Number. Why: This is the ring's own numerator, combining every countable source of "done" on the page. How: This sums done entries, done ring reminders, and every tutorial-card category's own done count.
	const totCouNum = todEntArr.length + rinTasArr.length + picCarNum + tasCarNum + pagCarNum + genCarNum; // What: Total Count Number. Why: This is the ring's own denominator, combining every countable source on the page. How: This sums every category's own total count, mirroring donCouNum's own structure.

	// #endregion Completion Counts



	// #region Live Clock

	const [ curNowDat, setCurNowDat ] = React.useState( () => new Date() ); // What: Current Now Date And Setter. Why: The header's own kicker line needs a live-updating clock, re-rendered at the top of every minute rather than spamming setState every second. How: This starts at the current Date and is advanced by the effect below.


	React.useEffect( () => { // What: Clock Tick Effect. Why: See the doc comment just above. How: This waits until the next exact minute boundary, ticks once, then ticks every 60 seconds after that.


		const ticCloFun = () => setCurNowDat( new Date() ); // What: Tick Clock Function. Why: Both the initial aligned tick and every later interval tick need this exact same update. How: This writes a fresh Date into curNowDat.
		const minDelNum = 60000 - ( Date.now() % 60000 );   // What: Minute Delay Number. Why: The first tick should land exactly on the next minute boundary, not an arbitrary offset. How: This computes the milliseconds remaining until that boundary.

		let ticIntNum = null; // What: Tick Interval Number. Why: The recurring interval isn't started until the first aligned tick fires. How: This is assigned inside the alignment timeout below and read by the cleanup.


		const aliTimNum = setTimeout( () => { // What: Align Timeout Number. Why: The very first tick must wait for minDelNum before the regular 60-second cadence can begin. How: This fires ticCloFun once, then starts the recurring interval.


			ticCloFun(); // What: Aligned Tick Call. Why: The clock should update right on the minute boundary it just reached. How: This calls ticCloFun once.

			ticIntNum = setInterval( ticCloFun, 60000 ); // What: Minute Interval Start. Why: Every later minute should tick on its own. How: This starts a 60 second interval, stored in ticIntNum for the cleanup below.


		}, minDelNum ); // What: Align Delay. Why: The first clock tick lands on the next minute boundary. How: This waits minDelNum before the regular cadence starts.



		return () => { // What: Effect Cleanup Return. Why: Neither the alignment timeout nor the recurring interval may outlive this effect run. How: This clears both.


			clearTimeout( aliTimNum );                   // What: Alignment Timeout Clear. Why: The first aligned tick must not fire after this effect ends. How: This clears aliTimNum.
			if ( ticIntNum ) clearInterval( ticIntNum ); // What: Interval Clear Check. Why: The minute interval only exists once the first aligned tick has run. How: This clears ticIntNum when it was started.


		};


	}, [] ); // What: Effect Dependency Array. Why: This effect only ever needs to start once, on mount. How: An empty array means it never re-subscribes.

	// #endregion Live Clock



	// #region Editor And Log State

	const [ actEdiStr, setActEdiStr ] = React.useState( null ); // What: Active Editor String And Setter. Why: Only one inline editor on this tab should be open at a time. How: This is read/written by every inline editor this tab renders, directly or via RemSecCom. // actEdiStr/setActEdiStr: a picker item's inline editor (`item:<eid>`), a reminder's inline editor, or its quick-add form (owned by RemSecCom, passed down below) all read/write this same lifted slot, so opening any one of them collapses whichever of the others was open (each already discards its own unsaved edits on collapse/unmount, see EntEdiCom's own discard-guard effect and RemSecCom's own plain local draft state).

	const [ opeLogStr, setOpeLogStr ] = React.useState( null ); // What: Open Log String And Setter. Why: Only one group's (or the Reminders block's) Day Log panel may be open at a time. How: This holds whichever single key is currently open, or null.

	const togLogFun = ( logKeyStr ) => setOpeLogStr( ( curKeyStr ) => curKeyStr === logKeyStr ? null : logKeyStr ); // What: Toggle Log Function. Why: Clicking an already-open group's own chip should close it, not just re-open it. How: This flips opeLogStr to null when logKeyStr is already open, otherwise to logKeyStr.

	// #endregion Editor And Log State



	// #region Completion Celebration

	/**
	 * tab-today.jsx = Completion Celebration
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

	const [ jusCheStr, setJusCheStr ] = React.useState( null ); // What: Just-Checked String And Setter. Why: A just-completed row needs a brief "fresh" cue, keyed by its own eid. How: This is set by hanCheFun below and cleared 700ms later.

	const rinEleRef = React.useRef( null );                                     // What: Ring Element Reference. Why: The celebration effect below needs a direct DOM handle to trigger CSS classes on. How: This is attached to the .ring div's own ref prop below.
	const stkEleRef = React.useRef( null );                                     // What: Streak Element Reference. Why: The streak-pulse effect below needs a direct DOM handle to trigger its own CSS class on. How: This is attached to the .streak div's own ref prop below.
	const preDonRef = React.useRef( donCouNum );                                // What: Previous Done Reference. Why: The celebration effect needs last render's own donCouNum to detect a genuine rise. How: This starts at the initial donCouNum and is overwritten at the end of that same effect.
	const preFulRef = React.useRef( totCouNum > 0 && donCouNum === totCouNum ); // What: Previous Full Reference. Why: The celebration effect needs last render's own completion state to detect a genuine 0-to-1 transition into "all done". How: This starts at the initial completion state and is overwritten at the end of that same effect.
	const preClaRef = React.useRef( !!staAppObj.today.streakClaimed );          // What: Previous Claimed Reference. Why: The streak-pulse effect needs last render's own claimed state to detect a genuine false-to-true transition. How: This starts at the initial claimed state and is overwritten at the end of that same effect.
	const isaFulBoo = totCouNum > 0 && donCouNum === totCouNum;                 // What: Is-A Full Boolean. Why: Both the header's title swap and the celebration effect need this same live completion check. How: This is true only once totCouNum is positive and donCouNum has reached it exactly.

	const [ celNonNum, setCelNonNum ] = React.useState( 0 ); // What: Celebration Nonce Number And Setter. Why: Bumped every time the day transitions into complete, so the celebratory title re-mounts and replays its per-word reveal. How: This is incremented by the celebration effect below.



	// #region Celebration Particles

	/**
	 * tab-today.jsx = Celebration Particles
	 *
	 * @summary
	 * Confetti/sparkle particles for the completion celebration
	 * (Appearance -> Completion celebration). Ripple/Pulse/Cascade are
	 * pure CSS variants of the existing rinRipIta/card-exhale elements;
	 * these two styles use a genuinely different mechanism (small
	 * generated particles), so they need actual DOM nodes, generated
	 * fresh each celebration and cleared after.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const celStyStr = ( staAppObj.appearance && staAppObj.appearance.completionStyle ) || 'confetti'; // What: Celebration Style String. Why: Every branch below needs this same resolved celebration style. How: This reads staAppObj.appearance.completionStyle, falling back to 'confetti'.

	const [ parIteArr, setParIteArr ] = React.useState( [] ); // What: Particle Item Array And Setter. Why: See the doc comment just above. How: This is populated by the celebration effect below and cleared once the celebration ends.

	// #endregion Celebration Particles



	// #region Celebration Overlay Rect

	/**
	 * tab-today.jsx = Celebration Overlay Rect
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

	const carAreRef = React.useRef( null ); // What: Card Area Reference. Why: The celebration effect needs a DOM handle on the cards column itself to measure celRecObj's own horizontal bounds. How: This is attached to the .todGroDiv div's own ref prop further down.

	// #endregion Celebration Overlay Rect


	React.useEffect( () => { // What: Celebration Effect. Why: This is the actual celebration trigger, described in the doc comment above this whole region. How: This detects either a fresh transition into complete (the richer celebration) or an ordinary done-count rise (the plain pulse), fires the matching CSS/particle sequence, then cleans up after a fixed duration.


		const fulNowBoo = totCouNum > 0 && donCouNum === totCouNum; // What: Full Now Boolean. Why: This effect's own fresh completion check must be computed here, not read from isaFulBoo, since it needs to compare against preFulRef before that ref is updated. How: This mirrors isaFulBoo's own computation.


		if ( fulNowBoo && !preFulRef.current && rinEleRef.current ) { // What: Fresh Completion Branch. Why: The richer "all done" celebration only plays on a genuine false-to-true transition, never on a re-render that was already complete. How: This checks fulNowBoo against preFulRef's own prior value.


			const rinCurEle = rinEleRef.current; // What: Ring Current Element. Why: Every DOM manipulation below targets this same node. How: This reads rinEleRef.current once and reuses it throughout this branch.


			rinCurEle.classList.remove( cssModObj.proRinDivPulsing, cssModObj.proRinDivCelebrating ); // What: Stale Class Clear. Why: A CSS animation class must be removed before being re-added, or the browser won't replay it. How: This removes both classes unconditionally before the reflow forcing line below.
			void rinCurEle.offsetWidth;                                                               // What: Reflow Force. Why: Removing then immediately re-adding the same class needs a forced reflow in between, or the browser coalesces the two and never replays the animation. How: Reading offsetWidth forces a synchronous layout pass.
			setCelNonNum( ( curNonNum ) => curNonNum + 1 );                                           // What: Completion Nonce Bump. Why: The celebratory title needs to re-mount and replay its per-word reveal. How: This increments celNonNum by 1.

			if ( celStyStr === 'confetti' || celStyStr === 'sparkle' ) { // What: Rect Measurement Branch. Why: Only the confetti/sparkle styles need a measured overlay rect at all. How: This measures the cards column and its scroller, falling back to the full viewport if either is missing.


				const carAreEle = carAreRef.current;                                             // What: Card Area Element. Why: This is the actual DOM node the overlay's own horizontal bounds are measured from. How: This reads carAreRef.current.
				const scrCurEle = carAreEle?.closest( '[data-element-name-hook~="appConMai"]' ); // What: Scroller Current Element. Why: The overlay's own vertical bounds must span the scroll container's on-screen viewport, not the (possibly scrolled-away) cards list itself. How: This walks up from carAreEle to its nearest .main ancestor.


				if ( carAreEle && scrCurEle ) { // What: Both Elements Found Branch. Why: A real measurement is only possible once both elements exist. How: This computes celRecObj from their two bounding rects.


					const carRecObj = carAreEle.getBoundingClientRect(); // What: Cards Rect Object. Why: The overlay's own horizontal bounds come from the cards column itself. How: This reads carAreEle's own bounding rect.
					const scrRecObj = scrCurEle.getBoundingClientRect(); // What: Scroller Rect Object. Why: The overlay's own vertical bounds come from the scroll container instead. How: This reads scrCurEle's own bounding rect.


					setCelRecObj( { height : scrRecObj.height, left : carRecObj.left, top : scrRecObj.top, width : carRecObj.width } ); // What: Celebration Rect Set. Why: The portal below needs this exact shape to position the overlay. How: This combines carRecObj's own left/width with scrRecObj's own top/height.


				}

				else setCelRecObj( { height : window.innerHeight, left : 0, top : 0, width : window.innerWidth } ); // What: Fallback Rect Set. Why: Without both elements mounted, the overlay still needs SOME bounds to render into. How: This falls back to the full viewport.


			}



			if ( celStyStr === 'confetti' ) { // What: Confetti Particle Build. Why: Confetti needs a batch of randomized piece descriptors to render. How: This builds 26 pieces, each with its own angle/distance/rotation/opacity/delay.


				setParIteArr( Array.from( Array( 26 ).keys(), ( curIndNum ) => ( { // What: Confetti Particle Set. Why: Each of the 26 pieces needs its own randomized flight. How: This maps every index from 0 to 25 (Array.keys yields the indices themselves) to one piece descriptor.


					angNum : Math.round( Math.random() * 360 ),          // What: Angle Number. Why: Each piece flies out in its own direction. How: This is a random whole angle in degrees, read into --con-dir-ang.
					delNum : Math.round( Math.random() * 180 ),          // What: Delay Number. Why: Staggered launches read as a burst instead of one flat pop. How: This is a random delay up to 180ms, read into animationDelay.
					disNum : 90 + Math.random() * 220,                   // What: Distance Number. Why: Pieces should travel different distances. How: This is a random 90 to 310px, read into --con-tra-off.
					ideNum : curIndNum,                                  // What: Identifier Number. Why: Each piece needs a stable React key. How: This reuses the piece's own index.
					opaStr : ( 0.7 + Math.random() * 0.3 ).toFixed( 2 ), // What: Opacity String. Why: Slightly varied opacity keeps the burst from looking uniform. How: This is a random 0.70 to 1.00, read into --con-pie-opa.
					rotNum : Math.round( Math.random() * 360 )           // What: Rotation Number. Why: Each piece spins to its own final angle. How: This is a random whole angle in degrees, read into --con-spi-ang.


				} ) ) );


			}

			else if ( celStyStr === 'sparkle' ) { // What: Sparkle Particle Build. Why: Sparkle needs its own batch of randomized piece descriptors. How: This builds 22 pieces, each with its own random position and delay.


				setParIteArr( Array.from( { length : 22 }, () => ( { // What: Sparkle Particle Set. Why: Each of the 22 sparkles needs its own random spot and timing. How: This builds one descriptor per slot of a 22-long array.


					delNum    : Math.round( Math.random() * 700 ), // What: Delay Number. Why: Sparkles should twinkle in one after another, not all at once. How: This is a random delay up to 700ms, read into animationDelay.
					ideNum    : Math.random(),                     // What: Identifier Number. Why: Each sparkle needs a React key. How: This is a random number, unique in practice.
					posXcoNum : Math.round( Math.random() * 100 ), // What: Position X-Coordinate Number. Why: Each sparkle lands at its own horizontal spot. How: This is a random 0 to 100 percent, read into left.
					posYcoNum : Math.round( Math.random() * 100 )  // What: Position Y-Coordinate Number. Why: Each sparkle lands at its own vertical spot. How: This is a random 0 to 100 percent, read into top.


				} ) ) );


			}

			else setParIteArr( [] ); // What: No Particle Style Clear. Why: Ripple/Pulse/Cascade need no particle batch at all. How: This clears parIteArr for every other style.



			// #region Celebration Fire Sequence

			/**
			 * tab-today.jsx = Celebration Fire Sequence
			 *
			 * @summary
			 * Fires everything together: the ring number pulse to accent
			 * plus a ripple from the ring (always plays, this part of the
			 * celebration doesn't vary by style) plus the per-card exhale
			 * cascade, which IS the "Ripple" style and so only plays when
			 * that style is selected. The title's own per-word reveal runs
			 * in parallel via the celNonNum bump above.
			 *
			 * @author z4nta0 <https://github.com/z4nta0>
			 *
			*/

			rinCurEle.classList.add( cssModObj.proRinDivCelebrating ); // What: Celebrating Class Add. Why: This is the actual CSS trigger for the ring's own celebration animation. How: This adds the proRinDiv--celebrating modifier to rinCurEle.


			const carEleLis = ( celStyStr === 'ripple' && maiScrRef.current ) // What: Card Element List. Why: Only the Ripple style needs the per-card exhale cascade at all. How: This queries every rendered card only under that style, otherwise an empty array.
				? maiScrRef.current.querySelectorAll( '[data-element-name-hook~="todCarArt"]' ) // What: Ripple Branch. Why: The ripple cascades across every rendered card. How: This queries them all from the scroll root.
				: [];                                                                           // What: No Ripple Branch. Why: Every other style has no per-card cascade. How: This returns an empty array, so the loop below does nothing.


			carEleLis.forEach( ( curCarEle, curIndNum ) => { // What: Card Exhale Stagger Loop. Why: Each card's own exhale needs a slightly later delay than the one before it, so the cascade reads as a wave. How: This sets a CSS variable and sets the data-card-exhale-active attribute on each card in turn.


				curCarEle.style.setProperty( '--exh-car-del', `${ curIndNum * durMilFun( 'm03' ) }ms` ); // What: Exhale Delay Set. Why: Each card starts its exhale a beat after the one before it. How: This sets --exh-car-del to one m03 duration step per card index. // Duration Base Minus 3 ~= 67.9ms

				curCarEle.setAttribute( 'data-card-exhale-active', '' ); // What: Exhale Attribute Set. Why: This is what actually starts the card's own exhale animation, in whichever module the card belongs to. How: This adds the presence-only data-card-exhale-active attribute.


			} );

			const celTotNum = carEleLis.length * durMilFun( 'm03' ) + durMilFun( 'p07' ); // What: Celebration Total Number. Why: The cleanup below must wait for the LONGEST-running piece of the celebration, whichever style is active. How: This adds the cascade's own total stagger to the card exhale's own p07 duration step. // Duration Base Minus 3 ~= 67.9ms, Duration Base Plus 7 ~= 1130.0ms


			const celEndTim = setTimeout( () => { // What: Celebration End Timeout. Why: Every celebration effect (ring class, per-card exhale, particles) must clean itself up once its own animation has actually finished. How: This runs after the longer of a fixed floor or celTotNum, clearing every piece of state/CSS this branch set.


				if ( rinEleRef.current ) rinEleRef.current.classList.remove( cssModObj.proRinDivCelebrating ); // What: Ring Celebration Clear. Why: The ring's own celebration class must not linger after the animation ends. How: This removes proRinDiv--celebrating when the ring is still mounted.



				carEleLis.forEach( ( curCarEle ) => { // What: Exhale Reset Loop. Why: Every card that played the ripple must go back to its resting state. How: This removes each card's own exhale attribute and delay.


					curCarEle.removeAttribute( 'data-card-exhale-active' ); // What: Exhale Attribute Remove. Why: The card's own ripple animation is finished. How: This removes data-card-exhale-active.
					curCarEle.style.removeProperty( '--exh-car-del' );      // What: Exhale Delay Remove. Why: The per-card stagger delay must not linger into the next celebration. How: This removes the --exh-car-del custom property.


				} );

				setParIteArr( [] );   // What: Particle Clear. Why: The confetti/sparkle nodes are only needed for the length of one celebration. How: This empties parIteArr.
				setCelRecObj( null ); // What: Overlay Rect Clear. Why: The portal overlay should unmount once the particles are gone. How: This resets celRecObj to null.


			}, Math.max( durMilFun( 'p09' ), celTotNum + 100 ) ); // What: Celebration End Delay. Why: Cleanup waits for the longest celebration effect to finish. How: This waits the total cascade time plus a margin, at least the p09 duration step that outlasts every particle and the ring's own ripple. // Duration Base Plus 9 ~= 1983.0ms

			// #endregion Celebration Fire Sequence


			preDonRef.current = donCouNum; // What: Previous Done Update. Why: The next run of this effect must compare against the count that is current now. How: This overwrites preDonRef with the fresh donCouNum.
			preFulRef.current = fulNowBoo; // What: Previous Complete Update. Why: The next run of this effect must compare against the completion state that is current now. How: This overwrites preFulRef with fulNowBoo.



			return () => clearTimeout( celEndTim ); // What: Effect Cleanup Return. Why: A stale celebration-end timeout must not fire after a newer effect run has already begun. How: This cancels celEndTim.


		}



		if ( donCouNum > preDonRef.current && !fulNowBoo && rinEleRef.current ) { // What: Plain Pulse Branch. Why: An ordinary done-count rise that doesn't complete the whole day still deserves a small per-tick pulse. How: This checks donCouNum against preDonRef's own prior value.


			const rinCurEle = rinEleRef.current; // What: Ring Current Element. Why: Every DOM manipulation below targets this same node. How: This reads rinEleRef.current once and reuses it throughout this branch.


			rinCurEle.classList.remove( cssModObj.proRinDivPulsing ); // What: Stale Class Clear. Why: A CSS animation class must be removed before being re-added, or the browser won't replay it. How: This removes the class unconditionally before the reflow forcing line below.
			void rinCurEle.offsetWidth;                               // What: Reflow Force. Why: Same reasoning as the fresh-completion branch above. How: Reading offsetWidth forces a synchronous layout pass.
			rinCurEle.classList.add( cssModObj.proRinDivPulsing );    // What: Pulsing Class Add. Why: This is the actual CSS trigger for the per-tick pulse. How: This adds the proRinDiv--pulsing modifier to rinCurEle.

			const pulEndTim = setTimeout( () => rinCurEle.classList.remove( cssModObj.proRinDivPulsing ), durMilFun( 'p06' ) ); // What: Pulse End Timeout. Why: The pulse class must clear itself once its own short animation finishes. How: This removes proRinDiv--pulsing after the glow pulse's own p06 duration step, the longest of the pulse's animations. // Duration Base Plus 6 ~= 853.0ms


			preDonRef.current = donCouNum; // What: Previous Done Update. Why: The next run of this effect must compare against the count that is current now. How: This overwrites preDonRef with the fresh donCouNum.
			preFulRef.current = fulNowBoo; // What: Previous Complete Update. Why: The next run of this effect must compare against the completion state that is current now. How: This overwrites preFulRef with fulNowBoo.



			return () => clearTimeout( pulEndTim ); // What: Effect Cleanup Return. Why: A stale pulse-end timeout must not fire after a newer effect run has already begun. How: This cancels pulEndTim.


		}



		preDonRef.current = donCouNum; // What: Previous Done Update. Why: Even a non-rise (a drop, or a no-op re-render) still needs preDonRef to track the latest value for next time. How: This overwrites preDonRef with the current donCouNum.
		preFulRef.current = fulNowBoo; // What: Previous Complete Update. Why: Same reasoning as preDonRef just above, for the completion state. How: This overwrites preFulRef with the current fulNowBoo.


	}, [ donCouNum, totCouNum ] ); // What: Effect Dependency Array. Why: This effect only ever needs to re-run when the ring's own numerator or denominator changes. How: donCouNum/totCouNum are exactly what preDonRef/preFulRef are compared against.

	// #endregion Completion Celebration

	React.useEffect( () => { // What: Streak Pulse Effect. Why: The streak badge needs its own brief pulse, firing once when today's first done is checked, i.e. when staAppObj.today.streakClaimed transitions false to true. How: This detects that transition and toggles a CSS class accordingly.


		const claNowBoo = !!staAppObj.today.streakClaimed; // What: Claimed Now Boolean. Why: This effect's own fresh claimed check must be computed here, not read from a prop, since it needs to compare against preClaRef before that ref is updated. How: This reads staAppObj.today.streakClaimed directly.


		if ( claNowBoo && !preClaRef.current && stkEleRef.current ) { // What: Fresh Claim Branch. Why: The pulse only plays on a genuine false-to-true transition, never on a re-render that was already claimed. How: This checks claNowBoo against preClaRef's own prior value.


			const stkCurEle = stkEleRef.current; // What: Streak Current Element. Why: Every DOM manipulation below targets this same node. How: This reads stkEleRef.current once and reuses it below.


			stkCurEle.classList.remove( cssModObj.todStrDivBumped ); // What: Stale Class Clear. Why: A CSS animation class must be removed before being re-added, or the browser won't replay it. How: This removes todStrDiv--bumped unconditionally before the reflow forcing line below.
			void stkCurEle.offsetWidth;                              // What: Reflow Force. Why: Removing then immediately re-adding the same class needs a forced reflow in between. How: Reading offsetWidth forces a synchronous layout pass.
			stkCurEle.classList.add( cssModObj.todStrDivBumped );    // What: Bumped Class Add. Why: This is the actual CSS trigger for the streak's own pulse animation. How: This adds the todStrDiv--bumped modifier to stkCurEle.

			const bumEndTim = setTimeout( () => stkCurEle.classList.remove( cssModObj.todStrDivBumped ), durMilFun( 'p06' ) ); // What: Bump End Timeout. Why: The bumped class must clear itself once its own short animation finishes. How: This removes todStrDiv--bumped after the bump's own p06 duration step. // Duration Base Plus 6 ~= 853.0ms


			preClaRef.current = claNowBoo; // What: Previous Claimed Update. Why: The next run of this effect must compare against the claimed state that is current now. How: This overwrites preClaRef with claNowBoo.



			return () => clearTimeout( bumEndTim ); // What: Effect Cleanup Return. Why: A stale bump-end timeout must not fire after a newer effect run has already begun. How: This cancels bumEndTim.


		}



		preClaRef.current = claNowBoo; // What: Previous Claimed Update. Why: Even a non-transition still needs preClaRef to track the latest value for next time. How: This overwrites preClaRef with the current claNowBoo.


	}, [ staAppObj.today.streakClaimed ] ); // What: Effect Dependency Array. Why: This effect only ever needs to re-run when the persisted streakClaimed flag itself changes. How: staAppObj.today.streakClaimed is exactly what preClaRef is compared against.



	// #region Sticky Offset Measurement

	/**
	 * tab-today.jsx = Sticky Offset Measurement
	 *
	 * @summary
	 * Measures the sticky header AND the rail (when it stacks above
	 * content on mobile) so the rail's own sticky-top sits flush beneath
	 * the header, and jumGroFun/the scroll-spy effect below correctly
	 * account for both.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const heaEleRef = React.useRef( null ); // What: Header Element Reference. Why: This effect needs a direct DOM handle on the sticky header to measure it. How: This is attached to the <header> element's own ref prop further down.
	const raiEleRef = React.useRef( null ); // What: Rail Element Reference. Why: This effect needs a direct DOM handle on the group rail to measure it when it stacks horizontally. How: This is attached to the <aside> rail's own ref prop further down.


	React.useEffect( () => { // What: Sticky Offset Effect. Why: See the doc comment just above. How: This measures both elements on mount, on their own resize, and on window resize, publishing 3 CSS custom properties onto the tab root.


		const heaCurEle = heaEleRef.current; // What: Header Current Element. Why: This is the actual DOM node every measurement below reads from. How: This reads heaEleRef.current once.


		if ( !heaCurEle ) return; // What: No Header Guard. Why: Without the header mounted there is nothing to measure at all. How: This bails out of the effect early when heaCurEle is missing.



		const tabCurEle = heaCurEle.closest( '[data-element-name-hook~="todTabDiv"]' ); // What: Tab Current Element. Why: The 3 CSS custom properties this effect publishes must land on the tab's own root, not the header itself. How: This walks up from heaCurEle to its nearest .tab--today ancestor.


		if ( !tabCurEle ) return; // What: No Tab Root Guard. Why: Without the tab root there is nowhere to publish the measured values. How: This bails out of the effect early when tabCurEle is missing.



		const aplVarFun = () => { // What: Apply Variables Function. Why: Every trigger below (mount, either ResizeObserver, window resize) needs this exact same measure-and-publish step. How: This measures heaCurEle/raiEleRef, then writes 3 CSS custom properties onto tabCurEle.


			const heaHeiNum = heaCurEle.offsetHeight; // What: Header Height Number. Why: This is the header's own real rendered height. How: This reads heaCurEle.offsetHeight.

			const raiCurEle = raiEleRef.current;                                                  // What: Rail Current Element. Why: The rail only contributes to the sticky offset while it is stacked horizontally, which needs its own live check below. How: This reads raiEleRef.current.
			const raiHorBoo = raiCurEle && getComputedStyle( raiCurEle ).flexDirection === 'row'; // What: Rail Horizontal Boolean. Why: On mobile the rail flips to flex-direction: row and stacks below the header as a horizontal pill bar; this detects that state via computed style so it works whether triggered by the viewport breakpoint or the mobile-preview tweak. How: This reads raiCurEle's own live computed flexDirection.
			const raiHeiNum = raiHorBoo ? raiCurEle.offsetHeight : 0;                             // What: Rail Height Number. Why: Only a horizontally-stacked rail contributes its own height to the sticky offset. How: This reads raiCurEle.offsetHeight only while raiHorBoo, otherwise 0.


			tabCurEle.style.setProperty( '--tod-hea-hei', `${ heaHeiNum }px` );             // What: Header Height Property. Why: CSS elsewhere needs the header's own real height as a custom property. How: This writes heaHeiNum in pixels.
			tabCurEle.style.setProperty( '--sti-top-hei', `${ heaHeiNum + raiHeiNum }px` ); // What: Sticky Top Height Property. Why: jumGroFun and the scroll-spy effect below both need this exact combined offset. How: This writes the sum of heaHeiNum and raiHeiNum in pixels.


		};


		aplVarFun(); // What: Initial Apply Call. Why: The offsets must be published immediately on mount, without waiting for a resize. How: This invokes aplVarFun once, synchronously.

		const resObsObj = new ResizeObserver( aplVarFun ); // What: Resize Observer Object. Why: Either element's own size can change independent of a window resize (e.g. text wrapping). How: This re-runs aplVarFun on every observed resize.


		resObsObj.observe( heaCurEle ); // What: Header Observe Call. Why: The header's own size must be watched directly. How: This starts observing heaCurEle.

		if ( raiEleRef.current ) resObsObj.observe( raiEleRef.current ); // What: Rail Observe Guard. Why: The rail should only be observed once it is actually mounted. How: This starts observing raiEleRef.current only when it exists.



		window.addEventListener( 'resize', aplVarFun ); // What: Window Resize Listener. Why: A viewport-level resize can flip the rail between stacked/side layouts even without either element's own box changing size on its own. How: This re-runs aplVarFun on every window resize event.



		return () => { // What: Effect Cleanup Return. Why: Neither the resize listener nor the observer may outlive this effect run. How: This removes the listener and disconnects the observer.


			window.removeEventListener( 'resize', aplVarFun ); // What: Resize Listener Remove. Why: The listener must not outlive this effect run. How: This removes aplVarFun from window's resize event.
			resObsObj.disconnect();                            // What: Observer Disconnect. Why: The observer must not outlive this effect run. How: This disconnects resObsObj.


		};


	}, [] ); // What: Effect Dependency Array. Why: This effect only ever needs to set up its own observers once, on mount. How: An empty array means it never re-subscribes.

	// #endregion Sticky Offset Measurement



	// #region hanCheFun

	/**
	 * hanCheFun = Handle Check Function
	 *
	 * @summary
	 * EntCarCom's done toggle. It toggles the entry through togDonFun and, only
	 * when the entry goes from not done to done, stages the brief fresh cue on
	 * that card; unchecking never shows it.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param entRecObj - Entry Record Object: The Today entry being toggled.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * hanCheFun( entRecObj ) // => void
	 * ```
	 *
	*/

	const hanCheFun = ( entRecObj ) => { // What: Handle Check Function. Why: Toggling done also needs to stage the brief "fresh" cue, but only on a genuine not-done-to-done transition, never on an uncheck. How: This calls actStoObj.togDonFun, then stages jusCheStr only when wasDonBoo was false.


		const wasDonBoo = entRecObj.done; // What: Was Done Boolean. Why: The fresh-cue guard below needs to know the PRE-toggle state. How: This reads entRecObj.done before actStoObj.togDonFun below flips it.


		actStoObj.togDonFun( entRecObj.eid ); // What: Toggle Done Call. Why: This is the actual completion toggle, applying (or reverting) this entry's own pending mutation. How: This calls actStoObj.togDonFun with entRecObj's own eid.

		if ( !wasDonBoo ) { // What: Fresh Cue Guard. Why: Only a genuine check (not an uncheck) deserves the brief fresh cue. How: This stages jusCheStr only while wasDonBoo was false.


			setJusCheStr( entRecObj.eid ); // What: Just-Checked Stage. Why: EntCarCom's own fresh-cue check needs this exact eid to compare against. How: This publishes entRecObj's own eid into jusCheStr.

			setTimeout( () => setJusCheStr( ( curValStr ) => curValStr === entRecObj.eid ? null : curValStr ), durMilFun( 'p05' ) ); // What: Just-Checked Clear Timeout. Why: The fresh cue must clear itself once its check ripple ends, but only if a newer check hasn't already claimed jusCheStr in the meantime. How: This clears jusCheStr back to null after the ripple's own p05 duration step, guarded so a stale timeout can't stomp a fresher one. // Duration Base Plus 5 ~= 643.9ms


		}


	};

	// #endregion hanCheFun



	// #region Skip Animation

	/**
	 * tab-today.jsx = Skip Animation
	 *
	 * @summary
	 * Skip removes the entry: first marks it as removing so the card can
	 * play a collapse animation, then drops it from state. The slide-out
	 * CSS and the timer below read the same p03 duration step, so the two
	 * always end together.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const skiAniNum = durMilFun( 'p03' ); // What: Skip Animation Number. Why: See the doc comment just above. How: This is the collapse animation's own p03 duration step in milliseconds, used to delay the real skip/delete. // Duration Base Plus 3 ~= 366.9ms

	const [ rmvIdeSet, setRmvIdeSet ] = React.useState( () => new Set() ); // What: Removing Identifier Set And Setter. Why: A skipped or deleted row needs to know it is mid-removal so it can play its own collapse animation. How: This is added to right before the animation starts and cleared once the underlying data actually changes.


	// #region hanSkiFun

	/**
	 * hanSkiFun = Handle Skip Function
	 *
	 * @summary
	 * EntCarCom's skip action. It flags the entry as removing so the card plays
	 * its collapse animation, then skips the entry in the store once that
	 * animation has finished.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param entIdeStr - Entry Identifier String: The id of the Today entry to
	 *                    skip.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * hanSkiFun( entIdeStr ) // => void
	 * ```
	 *
	*/

	const hanSkiFun = ( entIdeStr ) => { // What: Handle Skip Function. Why: This is the actual skip trigger, shared by every EntCarCom's own onSkiEntFun prop. How: This stages entIdeStr as removing, then calls actStoObj.skiEntFun after skiAniNum.


		if ( rmvIdeSet.has( entIdeStr ) ) return; // What: Already Removing Guard. Why: A row already mid-removal must not be re-triggered by a second click. How: This bails out early when entIdeStr is already in rmvIdeSet.



		setRmvIdeSet( ( curSetObj ) => new Set( [ ...curSetObj, entIdeStr ] ) ); // What: Removing Id Add. Why: The card needs to start its own collapse animation immediately. How: This adds entIdeStr into a fresh copy of rmvIdeSet.

		setTimeout( () => { // What: Skip Settle Timeout. Why: The actual data removal must wait for the collapse animation to finish playing. How: This runs after skiAniNum, matching the CSS animation's own duration.


			actStoObj.skiEntFun( entIdeStr ); // What: Skip Entry Call. Why: This is the actual removal, applied only once the animation has had time to play. How: This calls actStoObj.skiEntFun with entIdeStr.

			setRmvIdeSet( ( curSetObj ) => new Set( [ ...curSetObj ].filter( ( setIdeStr ) => setIdeStr !== entIdeStr ) ) ); // What: Removing Id Delete. Why: The removing flag must clear once the row is actually gone. How: This deletes entIdeStr from a fresh copy of rmvIdeSet.


		}, skiAniNum ); // What: Skip Settle Delay. Why: The removal waits for the collapse animation. How: This waits skiAniNum, matching the animation's duration.


	};

	// #endregion hanSkiFun


	// #region hanDelFun

	/**
	 * hanDelFun = Handle Delete Function
	 *
	 * @summary
	 * EntEdiCom's delete action on the Today tab. It closes the item's editor,
	 * then deletes the item, which drops its Today entry too, either at once
	 * under reduced motion or after the same collapse animation skip uses.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param entIdeStr - Entry Identifier String: The id of the Today entry
	 *                    showing the item.
	 * @param iteIdeStr - Item Identifier String: The id of the picker item to
	 *                    delete.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * hanDelFun( entIdeStr, iteIdeStr ) // => void
	 * ```
	 *
	*/

	const hanDelFun = ( entIdeStr, iteIdeStr ) => { // What: Handle Delete Function. Why: Deleting a picker item from its Today editor should play the same card slide-out as skip, then remove the item (which drops the entry too). How: This closes the item's own editor, then either removes immediately (reduced motion) or stages the same removal animation skip uses.


		setActEdiStr( ( curValStr ) => curValStr === `item:${ entIdeStr }` ? null : curValStr ); // What: Editor Close. Why: A deleted item's own editor must not stay open. How: This clears actEdiStr only if it currently points at this exact item's own editor slot.



		if ( redMotFun() ) { actStoObj.delIteFun( iteIdeStr ); return; } // What: Reduced Motion Branch. Why: A user who prefers reduced motion should see the item removed immediately, not wait through an animation they won't see anyway. How: This removes iteIdeStr directly and returns early.



		if ( rmvIdeSet.has( entIdeStr ) ) return; // What: Already Removing Guard. Why: A row already mid-removal must not be re-triggered by a second click. How: This bails out early when entIdeStr is already in rmvIdeSet.



		setRmvIdeSet( ( curSetObj ) => new Set( [ ...curSetObj, entIdeStr ] ) ); // What: Removing Id Add. Why: The card needs to start its own collapse animation immediately. How: This adds entIdeStr into a fresh copy of rmvIdeSet.

		setTimeout( () => { // What: Delete Settle Timeout. Why: The actual item removal must wait for the collapse animation to finish playing. How: This runs after skiAniNum, matching the CSS animation's own duration.


			actStoObj.delIteFun( iteIdeStr ); // What: Remove Item Call. Why: This is the actual removal, applied only once the animation has had time to play. How: This calls actStoObj.delIteFun with iteIdeStr.

			setRmvIdeSet( ( curSetObj ) => new Set( [ ...curSetObj ].filter( ( setIdeStr ) => setIdeStr !== entIdeStr ) ) ); // What: Removing Id Delete. Why: The removing flag must clear once the row is actually gone. How: This deletes entIdeStr from a fresh copy of rmvIdeSet.


		}, skiAniNum ); // What: Delete Settle Delay. Why: The removal waits for the collapse animation. How: This waits skiAniNum, matching the animation's duration.


	};

	// #endregion hanDelFun

	// #endregion Skip Animation



	// #region Reroll Card-Flip Animation

	/**
	 * tab-today.jsx = Reroll Card-Flip Animation
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
	 * The full p06 duration step is the flip's own duration (the swap lands
	 * at its halfway apex), so inheriting it here would just be the ghost of
	 * an animation that no longer plays.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const rolAniNum = redMotFun() ? 200 : durMilFun( 'p06' ); // What: Roll Animation Number. Why: See the doc comment just above. How: This picks the short reduced-motion beat or the flip's own full p06 duration step. // Duration Base Plus 6 ~= 853.0ms

	const [ rolIdeSet, setRolIdeSet ] = React.useState( () => new Set() ); // What: Rolling Identifier Set And Setter. Why: A re-rolling row needs to know it is mid-flip so it can play its own animation class. How: This is added to right before the flip starts and cleared once it finishes.


	// #region hanRerFun

	/**
	 * hanRerFun = Handle Reroll Function
	 *
	 * @summary
	 * EntCarCom's re-roll action. It flags the card as rolling so it plays its
	 * flip, computes and stages a new pending pick at the flip's midpoint so the
	 * new item rolls in mid-turn, then clears the rolling flag once the flip
	 * finishes.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param entRecObj - Entry Record Object: The Today entry being re-rolled.
	 * @param picRecObj - Picker Record Object: The picker the entry came from.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * hanRerFun( entRecObj, picRecObj ) // => void
	 * ```
	 *
	*/

	const hanRerFun = ( entRecObj, picRecObj ) => { // What: Handle Reroll Function. Why: This is the actual re-roll trigger, shared by every EntCarCom's own onRerEntFun prop. How: This stages entRecObj's own eid as rolling, computes and stages a new pending pick at the flip's own apex, then clears the rolling flag once the flip finishes.


		if ( rolIdeSet.has( entRecObj.eid ) ) return; // What: Already Rolling Guard. Why: A row already mid-flip must not be re-triggered by a second click. How: This bails out early when entRecObj's own eid is already in rolIdeSet.



		setRolIdeSet( ( curSetObj ) => new Set( [ ...curSetObj, entRecObj.eid ] ) ); // What: Rolling Id Add. Why: The card needs to start its own flip animation immediately. How: This adds entRecObj's own eid into a fresh copy of rolIdeSet.

		setTimeout( () => { // What: Flip Apex Timeout. Why: The pick happens at the midpoint of the flip (when the card is fully upside-down), so the new content rolls in continuing the same direction. How: This runs at half of rolAniNum, computing and staging the new pick.


			if ( picRecObj.mode === 'ease-up' ) { // What: Ease-Up Reroll Branch. Why: Ease Up re-roll is a manual cycle through eligible (charged >= threshold) items, highest-to-lowest value, wrapping back to the highest, rather than a fresh random pick. How: This computes a deterministic ordering, finds the current item's own position, and steps to the next one.


				const picThrNum = picRecObj.threshold ?? 100;                                                         // What: Picker Threshold Number. Why: Eligibility below is judged against this picker's own resolved threshold. How: This reads picRecObj.threshold, falling back to 100.
				const lasTimFun = ( curIteObj ) => ( curIteObj.lastPicked ? Date.parse( curIteObj.lastPicked ) : 0 ); // What: Last Timestamp Function. Why: The deterministic ordering below needs a numeric sort key for lastPicked. How: This parses curIteObj.lastPicked, treating a never-picked item as 0.


				const isaEliFun = ( curIteObj ) => { // What: Is-An Eligible Function. Why: Only this picker's own active, fully charged items can be rolled to. How: This combines the three checks below.


					const ownPicBoo = curIteObj.pickerId === picRecObj.id;           // What: Own Picker Boolean. Why: Items from other pickers are never candidates. How: This compares the item's own pickerId.
					const isaActBoo = !curIteObj.vacation;                           // What: Is-An Active Boolean. Why: An inactive item is never picked. How: This negates the item's own vacation flag.
					const isaChrBoo = PIC_NAM_OBJ.easEliFun( curIteObj, picThrNum ); // What: Is-A Charged Boolean. Why: Ease-up only rolls between items charged to the threshold. How: This calls PIC_NAM_OBJ.easEliFun against picThrNum.



					return ownPicBoo && isaActBoo && isaChrBoo; // What: Eligible Return. Why: The item is a candidate only when all three hold. How: This returns their combination.


				};


				const ordIteFun = ( iteOneObj, iteTwoObj ) => ( iteTwoObj.value - iteOneObj.value ) || ( lasTimFun( iteOneObj ) - lasTimFun( iteTwoObj ) ) || ( iteOneObj.id < iteTwoObj.id ? -1 : 1 ); // What: Order Item Function. Why: The cycle below needs a stable, deterministic order. How: This sorts by value descending, then oldest lastPicked, then id.


				const eliIteArr = staAppObj.items.filter( isaEliFun ).sort( ordIteFun ); // What: Eligible Item Array. Why: This is the actual candidate pool re-roll cycles through; deterministic order (value desc, then oldest lastPicked, then id) is stable since done-gating freezes values between rolls. How: This filters with isaEliFun and sorts with ordIteFun.


				if ( eliIteArr.length >= 2 ) { // What: Enough Candidates Guard. Why: Fewer than 2 eligible candidates means the UI already disabled the button, so this is a safe no-op rather than a real error case. How: This only proceeds once eliIteArr has at least 2 entries.


					const fouIndNum = eliIteArr.findIndex( ( curIteObj ) => curIteObj.id === entRecObj.itemId );           // What: Found Index Number. Why: The next candidate is found relative to whichever one is currently picked. How: This finds entRecObj's own itemId within eliIteArr.
					const nexIteObj = eliIteArr[ ( fouIndNum + 1 ) % eliIteArr.length ];                                   // What: Next Item Object. Why: This is the actual next candidate to roll to, wrapping back to the front once the end is reached. How: This indexes eliIteArr one past fouIndNum, modulo its own length.
					const picResObj = PIC_NAM_OBJ.picIteFun( picRecObj, staAppObj.items, { forceItemId : nexIteObj.id } ); // What: Pick Result Object. Why: Forcing the specific next item still needs to run through the real picking engine so its own value/pending mutations compute correctly. How: This calls PIC_NAM_OBJ.picIteFun with forceItemId set to nexIteObj's own id.


					actStoObj.swaIteFun( entRecObj.eid, nexIteObj.id, { // What: Set Entry Item Call. Why: This stages the new pick's own value/weight mutation as pending, applied only once the entry is marked done, preserving the "nothing changes until you actually do it" contract. How: This writes nexIteObj's own id plus picResObj's own updArr/patObj/depBoo.


						bumpPick    : true,             // What: Bump Pick. Why: A re-roll counts as a fresh pick once the entry is done. How: This asks the store to bump the item's own pick stats on completion.
						depletedEnd : picResObj.depBoo, // What: Depleted End. Why: An ease-down item may have just run out. How: This passes the pick result's own depletion flag.
						pickedId    : nexIteObj.id,     // What: Picked Id. Why: The store needs to know which item this pending mutation belongs to. How: This passes the newly picked item's own id.
						pickerPatch : picResObj.patObj, // What: Picker Patch. Why: Some modes update the picker itself on a pick. How: This passes the pick result's own picker patch.
						updates     : picResObj.updArr  // What: Updates. Why: The per-item value/weight changes stay pending until the entry is done. How: This passes the pick result's own update list.


					} );


				}


			}

			else { // What: Other Mode Reroll Branch. Why: Every other mode re-rolls via a fresh forced-new pick instead of a manual cycle; forceNew makes ease-down specifically abandon its current active item (recharging it) and roll to a different one, while other modes simply ignore the flag. How: This calls PIC_NAM_OBJ.picIteFun with forceNew and stages whatever it returns as pending.


				const picResObj = PIC_NAM_OBJ.picIteFun( picRecObj, staAppObj.items, { forceNew : true } ); // What: Pick Result Object. Why: This is the actual fresh pick this branch draws. How: This calls PIC_NAM_OBJ.picIteFun with forceNew true.


				if ( picResObj.picObj ) { // What: Picked Guard. Why: A pick can legitimately come back empty (no eligible candidates), in which case there is nothing to stage. How: This only proceeds once picResObj.picObj exists.


					actStoObj.swaIteFun( entRecObj.eid, picResObj.picObj.id, { // What: Set Entry Item Call. Why: Same staging contract as the ease-up branch above: nothing changes until the entry is marked done. How: This writes picResObj.picObj's own id plus picResObj's own updArr/patObj/depBoo.


						bumpPick    : true,                // What: Bump Pick. Why: A re-roll counts as a fresh pick once the entry is done. How: This asks the store to bump the item's own pick stats on completion.
						depletedEnd : picResObj.depBoo,    // What: Depleted End. Why: An ease-down item may have just run out. How: This passes the pick result's own depletion flag.
						pickedId    : picResObj.picObj.id, // What: Picked Id. Why: The store needs to know which item this pending mutation belongs to. How: This passes the newly picked item's own id.
						pickerPatch : picResObj.patObj,    // What: Picker Patch. Why: Some modes update the picker itself on a pick. How: This passes the pick result's own picker patch.
						updates     : picResObj.updArr     // What: Updates. Why: The per-item value/weight changes stay pending until the entry is done. How: This passes the pick result's own update list.


					} );


				}


			}


		}, rolAniNum / 2 ); // What: Flip Apex Delay. Why: The new pick lands at the flip's midpoint. How: This waits half of rolAniNum.

		setTimeout( () => { // What: Flip End Timeout. Why: The rolling flag must clear once the flip's own full animation has actually finished, not just at its apex. How: This runs after the full rolAniNum, clearing entRecObj's own eid from rolIdeSet.


			setRolIdeSet( ( curSetObj ) => new Set( [ ...curSetObj ].filter( ( setIdeStr ) => setIdeStr !== entRecObj.eid ) ) ); // What: Rolling Id Delete. Why: The flip has finished, so the rolling flag must clear. How: This removes entRecObj's own eid from a fresh copy of rolIdeSet.


		}, rolAniNum ); // What: Flip End Delay. Why: The rolling flag clears once the whole flip finishes. How: This waits the full rolAniNum.


	};

	// #endregion hanRerFun

	// #endregion Reroll Card-Flip Animation



	// #region Group Rail Edge Fades

	/**
	 * tab-today.jsx = Group Rail Edge Fades
	 *
	 * @summary
	 * Scroll-aware edge fades on the mobile group rail: toggles
	 * data-scroll-start-active/data-scroll-end-active so the mask gradient only
	 * fades the side that has more content, matching the Pickers tab's picTabDiv
	 * behavior.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	React.useEffect( () => { // What: Rail Edge Fade Effect. Why: See the doc comment just above. How: This toggles both classes on scroll, on resize, and once immediately on mount/dependency change.


		const raiCurEle = raiEleRef.current; // What: Rail Current Element. Why: Every check below reads this same node's own scroll position. How: This reads raiEleRef.current once.


		if ( !raiCurEle ) return; // What: No Rail Guard. Why: Without the rail mounted there is nothing to measure at all. How: This bails out of the effect early when raiCurEle is missing.



		const updEdgFun = () => togFadFun( raiCurEle ); // What: Update Edges Function. Why: Both the scroll listener and the resize observer need this exact same recompute-and-toggle step. How: This calls togFadFun on raiCurEle.


		updEdgFun(); // What: Initial Update Call. Why: The edge classes must be correct immediately on mount, without waiting for a scroll/resize event. How: This invokes updEdgFun once, synchronously.

		raiCurEle.addEventListener( 'scroll', updEdgFun, { passive : true } ); // What: Scroll Listener Subscribe. Why: The rail's own horizontal scroll position is the primary trigger for re-evaluating the edge classes. How: This registers updEdgFun as a passive scroll listener.

		const resObsObj = new ResizeObserver( updEdgFun ); // What: Resize Observer Object. Why: The rail's own scrollable width can change without a scroll event firing at all (e.g. groups being added/removed). How: This re-runs updEdgFun on every observed resize.


		resObsObj.observe( raiCurEle ); // What: Resize Observe Call. Why: This is what actually starts the observation. How: This observes raiCurEle.



		return () => { // What: Effect Cleanup Return. Why: Neither the scroll listener nor the observer may outlive this effect run. How: This removes the listener and disconnects the observer.


			raiCurEle.removeEventListener( 'scroll', updEdgFun ); // What: Scroll Listener Remove. Why: The listener must not outlive this effect run. How: This removes updEdgFun from the rail's scroll event.
			resObsObj.disconnect();                               // What: Observer Disconnect. Why: The observer must not outlive this effect run. How: This disconnects resObsObj.


		};


	}, [ groDisArr.length ] ); // What: Effect Dependency Array. Why: The number of groups changing can change whether the rail even overflows at all. How: groDisArr.length is the one value that actually drives that.

	// #endregion Group Rail Edge Fades



	// #region Group Rail Scroll Spy

	/**
	 * tab-today.jsx = Group Rail Scroll Spy
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

	const secRefObj = React.useRef( {} );    // What: Section Reference Object. Why: The scroll-spy effect below needs a live handle on every rendered group/Reminders/Page-Tours section element. How: This is populated by each section's own ref callback further down and read here.
	const maiScrRef = React.useRef( null );  // What: Main Scroll Reference. Why: Several handlers (scroll spy, generate's own scroll-to-top, jumGroFun) all need a handle on the shared scroll layout wrapper. How: This is attached to the .todLayDiv div's own ref prop further down.
	const skiSpyRef = React.useRef( false ); // What: Skip Spy Reference. Why: A programmatic scroll (jumGroFun, or generate's own scroll-to-top) must not have the scroll-spy effect immediately fight back and reassign actGroStr mid-animation. How: This is set true right before such a scroll starts and cleared shortly after it settles.
	const pinGroRef = React.useRef( null );  // What: Pinned Group Reference. Why: See the doc comment just above. How: This is set by jumGroFun and read/cleared by the scroll-spy effect below.


	React.useEffect( () => { // What: Scroll Spy Effect. Why: See the doc comment just above. How: This computes, on every scroll, which section's own header sits closest to (without crossing) the sticky offset line, honoring any pinned bottom-cluster group first.


		const secEntArr = Object.entries( secRefObj.current )                                         // What: Section Entry Array. Why: Sorting by actual document position keeps the first/last entries (used for the top default and the bottomed-out case) matching the real on-screen order, even after groups/Reminders have been reordered in Edit Mode. How: This collects every mounted section ref and sorts by offsetTop.
			.filter( ( [ , secCurEle ] ) => secCurEle )                                               // What: Mounted Section Filter. Why: A section that has unmounted leaves a null ref behind. How: This keeps only entries whose element still exists.
			.sort( ( entOneArr, entTwoArr ) => entOneArr[ 1 ].offsetTop - entTwoArr[ 1 ].offsetTop ); // What: Document Order Sort. Why: The spy walks sections top to bottom. How: This sorts entries by each element's own offsetTop.


		if ( !secEntArr.length ) return; // What: No Sections Guard. Why: Without any mounted sections there is nothing to spy on at all. How: This bails out of the effect early when secEntArr is empty.



		const onScrStiFun = () => { // What: On Scroll Sticky Function. Why: This is the actual recompute triggered by every scroll event. How: This resolves the sticky offset, checks the pinned-group/bottomed-out special cases first, then finds whichever section sits closest to the spy line.


			if ( skiSpyRef.current ) return; // What: Skip Spy Guard. Why: A programmatic scroll already in flight must not have this handler fight back. How: This bails out early while skiSpyRef is true.



			const tabCurEle = maiScrRef.current?.closest( '[data-element-name-hook~="todTabDiv"]' );                                                                    // What: Tab Current Element. Why: The sticky offset custom property lives on the tab's own root. How: This walks up from maiScrRef.current to its nearest .tab--today ancestor.
			const stiHeiNum = tabCurEle ? ( parseInt( getComputedStyle( tabCurEle ).getPropertyValue( '--sti-top-hei' ) ) || rhyPxlFun( 'p09' ) ) : rhyPxlFun( 'p09' ); // What: Sticky Height Number. Why: This is the exact offset the sticky-offset effect above publishes. How: This reads the --sti-top-hei custom property, falling back to the p09 rhythm step. // Vertical Rhythm Base Plus 9 ~= 183.074px
			const biaLinNum = stiHeiNum + 20; // What: Bias Line Number. Why: A small extra margin beyond the raw sticky offset reads as more natural than snapping exactly at the pixel boundary. How: This adds a fixed 20px to stiHeiNum.
			const scrCurEle = maiScrRef.current?.closest( '[data-element-name-hook~="appConMai"]' );                                                                    // What: Scroller Current Element. Why: The bottomed-out check below needs the real scroll container, not the window, whenever one exists. How: This walks up from maiScrRef.current to its nearest .main ancestor.


			const botEdgBoo = scrCurEle // What: Bottom Edge Boolean. Why: A user scrolled all the way to the end should always spy the LAST section, even if its own header can never reach the spy line. How: This checks either the scroller's own metrics or, without one, the window's.
				? scrCurEle.scrollTop + scrCurEle.clientHeight >= scrCurEle.scrollHeight - 2        // What: Scroller Bottom Branch. Why: The list normally scrolls inside .main. How: This checks whether that scroller is within 2px of its own end.
				: window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2; // What: Window Bottom Branch. Why: Without a scroll container the page itself scrolls. How: This checks whether the window is within 2px of the document end.


			if ( pinGroRef.current ) { // What: Pinned Group Branch. Why: A pinned bottom-cluster group should stay active while bottomed out or while its own header is still above the viewport midline. How: This releases the pin once neither condition holds any more, otherwise returns early to keep it active.


				const pinSecEle = secRefObj.current[ pinGroRef.current ];                  // What: Pinned Section Element. Why: The release check below needs the pinned section's own live DOM node. How: This reads secRefObj.current at pinGroRef's own key.
				const vieTopNum = scrCurEle ? scrCurEle.getBoundingClientRect().top : 0;   // What: View Top Number. Why: The midline check below needs the scroller's own viewport top. How: This reads scrCurEle's own bounding rect top, or 0 without a scroller.
				const vieHeiNum = scrCurEle ? scrCurEle.clientHeight : window.innerHeight; // What: View Height Number. Why: The midline check below needs the scroller's own viewport height. How: This reads scrCurEle.clientHeight, or the window's own innerHeight without a scroller.
				const midLinNum = vieTopNum + vieHeiNum / 2;                               // What: Midline Number. Why: "Still in view" for a pinned group is judged against the viewport's own vertical middle. How: This adds half of vieHeiNum to vieTopNum.


				if ( pinSecEle && ( botEdgBoo || pinSecEle.getBoundingClientRect().top <= midLinNum ) ) return; // What: Keep Pinned Guard. Why: The pin should hold while either condition still applies. How: This returns early, leaving actGroStr untouched, while pinSecEle exists and either botEdgBoo or its own top is still above midLinNum.



				pinGroRef.current = null; // What: Pin Release. Why: Neither keep-condition held, so the pin is no longer warranted. How: This clears pinGroRef back to null.


			}



			if ( botEdgBoo ) { setActGroStr( secEntArr[ secEntArr.length - 1 ][ 0 ] ); return; } // What: Bottomed Out Branch. Why: Bottomed out with no pin (e.g. a plain scroll to the end) still means the LAST group is what's actually in view, even though its header can't reach the line. How: This sets actGroStr to secEntArr's own last entry's own key and returns.



			let besGroStr = secEntArr[ 0 ][ 0 ]; // What: Best Group String And Reassignment. Why: The search loop below needs a running best-match default, starting at the first section. How: This starts at secEntArr's own first entry's own key.
			let besDisNum = Infinity;            // What: Best Distance Number And Reassignment. Why: The search loop below needs a running best-match distance, starting unbeaten. How: This starts at Infinity so the very first real candidate always replaces it.


			for ( const [ curNamStr, secCurEle ] of secEntArr ) { // What: Closest Section Search Loop. Why: The active group is whichever section's own header sits closest to (without crossing past) biaLinNum. How: This walks every section, tracking the smallest qualifying distance.


				const curRecObj = secCurEle.getBoundingClientRect();     // What: Current Rect Object. Why: This iteration's own distance check needs this section's own live position. How: This reads secCurEle's own bounding rect.
				const curDisNum = Math.abs( curRecObj.top - biaLinNum ); // What: Current Distance Number. Why: This is the actual comparison metric for this candidate. How: This is the absolute difference between curRecObj's own top and biaLinNum.


				if ( curRecObj.top - biaLinNum <= 16 && curDisNum < besDisNum ) { // What: Better Candidate Guard. Why: Only a section whose own header has already crossed (within a small 16px tolerance) past the spy line, AND is closer than the current best, should replace it. How: This updates besDisNum/besGroStr only when both conditions hold.


					besDisNum = curDisNum; // What: Best Distance Update. Why: This section is the closest to the bias line so far. How: This records its distance.
					besGroStr = curNamStr; // What: Best Group Update. Why: The closest section so far becomes the active candidate. How: This records its own group id.


				}


			}



			setActGroStr( besGroStr ); // What: Active Group Set. Why: This is the actual highlight update every other branch above eventually falls through to. How: This publishes besGroStr into actGroStr.


		};


		onScrStiFun(); // What: Initial Scroll Call. Why: The correct group must be highlighted immediately on mount/dependency change, without waiting for a scroll event. How: This invokes onScrStiFun once, synchronously.

		const conScrEle = maiScrRef.current?.closest( '[data-element-name-hook~="appConMai"]' ) || window; // What: Container Scroll Element. Why: The scroll listener should attach to the real scroll container when one exists, falling back to the window. How: This walks up from maiScrRef.current, or defaults to window.


		conScrEle.addEventListener( 'scroll', onScrStiFun, { passive : true } ); // What: Container Scroll Subscribe. Why: This is the primary trigger for re-evaluating the active group. How: This registers onScrStiFun as a passive scroll listener on conScrEle.
		window.addEventListener( 'scroll', onScrStiFun, { passive : true } );    // What: Window Scroll Subscribe. Why: A window-level scroll listener is still needed as a fallback/supplement, matching the original dual-listener behavior. How: This registers onScrStiFun as a passive scroll listener on window too.



		return () => { // What: Effect Cleanup Return. Why: Neither listener may outlive this effect run. How: This removes both.


			conScrEle.removeEventListener( 'scroll', onScrStiFun ); // What: Container Listener Remove. Why: The scroll container's listener must not outlive this effect run. How: This removes onScrStiFun from conScrEle.
			window.removeEventListener( 'scroll', onScrStiFun );    // What: Window Listener Remove. Why: The window listener must not outlive this effect run either. How: This removes onScrStiFun from window.


		};


	}, [ groDisArr.length, bloOrdArr, shoFeaBoo ] ); // What: Effect Dependency Array. Why: A changed group count, block order, or App Features visibility can all change which sections even exist to spy on. How: Each of these 3 can add/remove a whole section.


	const jumGroFun = ( groIdeStr ) => { // What: Jump Group Function. Why: This is the actual click handler behind every rail button, smooth-scrolling the content column to the named section. How: This resolves the sticky offset, computes a target scroll position, pins the group if it can't reach the spy line, then scrolls.


		const tarSecEle = secRefObj.current[ groIdeStr ]; // What: Target Section Element. Why: There is nothing to scroll to without a real mounted section. How: This reads secRefObj.current at groIdeStr.


		if ( !tarSecEle ) return; // What: No Target Guard. Why: A stale or not-yet-mounted section must not attempt a scroll at all. How: This bails out early when tarSecEle is missing.



		setActGroStr( groIdeStr ); // What: Active Group Set. Why: The clicked rail button should highlight immediately, without waiting for the scroll-spy effect to catch up. How: This publishes groIdeStr into actGroStr directly.
		skiSpyRef.current = true;  // What: Skip Spy Set. Why: The scroll-spy effect must not fight this programmatic scroll while it is in flight. How: This flags skiSpyRef true for the duration of the scroll below.

		const maiScrEle = tarSecEle.closest( '[data-element-name-hook~="appConMai"]' );                                        // What: Main Scroll Element. Why: The scroll target depends on whether a real scroll container exists. How: This walks up from tarSecEle to its nearest .main ancestor.
		const tabCurEle = tarSecEle.closest( '[data-element-name-hook~="todTabDiv"]' );                                        // What: Tab Current Element. Why: The sticky offset custom property lives on the tab's own root. How: This walks up from tarSecEle to its nearest .tab--today ancestor.
		const stiHeiNum = parseInt( getComputedStyle( tabCurEle ).getPropertyValue( '--sti-top-hei' ) ) || rhyPxlFun( 'p09' ); // What: Sticky Height Number. Why: The scroll target must land just beneath the sticky header/rail, not at the section's own raw offset. How: This reads the --sti-top-hei custom property, falling back to the p09 rhythm step. // Vertical Rhythm Base Plus 9 ~= 183.074px
		const extPadNum = rhyPxlFun( 'bas' );                                                                                  // What: Extra Padding Number. Why: A small extra gap beyond the sticky offset reads as more natural than a section's header touching the sticky edge exactly. How: This is a base rhythm step added to the scroll target below. // Vertical Rhythm Base ~= 14.572px
		const scrBehStr = redMotFun() ? 'auto' : 'smooth';                                                                     // What: Scroll Behavior String. Why: Reduced-motion users should jump instead of watching a smooth scroll. How: This is 'auto' under reduced motion, otherwise 'smooth'.


		if ( maiScrEle ) { // What: Scroller Branch. Why: A real scroll container needs its own scrollTo call, distinct from the window fallback. How: This computes the target, checks whether it can even be reached, pins if not, then scrolls maiScrEle.


			const tarOffNum = tarSecEle.offsetTop - stiHeiNum - extPadNum;     // What: Target Offset Number. Why: This is the actual scroll position that lands tarSecEle's own header just beneath the sticky offset. How: This subtracts stiHeiNum and extPadNum from tarSecEle's own offsetTop.
			const maxScrNum = maiScrEle.scrollHeight - maiScrEle.clientHeight; // What: Max Scroll Number. Why: A section near the very end of the list may not be able to scroll far enough to actually reach the spy line. How: This is the scroller's own maximum possible scrollTop.


			pinGroRef.current = tarOffNum > maxScrNum - 2 ? groIdeStr : null; // What: Pin Group Set. Why: If this group can't reach the spy line at all, the scroll-spy effect needs to pin it active instead of reclaiming the highlight for whatever CAN reach the line. How: This pins groIdeStr only when tarOffNum exceeds what the scroller can actually reach.

			maiScrEle.scrollTo( { behavior : scrBehStr, top : tarOffNum } ); // What: Scroll To Call. Why: This is the actual scroll. How: This scrolls maiScrEle to tarOffNum, smoothly unless reduced motion is preferred.


		}

		else { // What: Window Fallback Branch. Why: Without a real scroll container, the window itself must be scrolled instead. How: This computes the target against the window's own scroll position and scrolls it.


			pinGroRef.current = null; // What: Pin Group Clear. Why: The pin concept only applies to a real bounded scroller; the window fallback has no such ceiling to worry about. How: This clears pinGroRef.

			const winTopNum = tarSecEle.getBoundingClientRect().top + window.scrollY - stiHeiNum - extPadNum; // What: Window Top Number. Why: This is the actual scroll position that lands tarSecEle's own header just beneath the sticky offset, in window-scroll terms. How: This combines tarSecEle's own viewport-relative top with the current window.scrollY.


			window.scrollTo( { behavior : scrBehStr, top : winTopNum } ); // What: Scroll To Call. Why: This is the actual scroll. How: This scrolls the window to winTopNum, smoothly unless reduced motion is preferred.


		}



		setTimeout( () => { skiSpyRef.current = false; }, 600 ); // What: Skip Spy Release Timeout. Why: The scroll-spy effect may resume once the smooth scroll has had time to settle. How: This clears skiSpyRef back to false after 600ms.


	};

	// #endregion Group Rail Scroll Spy



	// #region Regenerate

	const [ genActBoo, setGenActBoo ] = React.useState( false ); // What: Generate Active Boolean And Setter. Why: The footer's own Regenerate button, and Edit Mode's own toggle, both need to know whether a generation cascade is currently playing. How: This is set true for genLisFun's own whole duration below.
	const [ conGenBoo, setConGenBoo ] = React.useState( false ); // What: Confirm Generate Boolean And Setter. Why: Regenerate is confirm-gated, since it replaces any completed items. How: This toggles the footer between its plain actions and the confirm prompt.



	// #region App Features Intro Timing

	/**
	 * tab-today.jsx = App Features Intro Timing
	 *
	 * @summary
	 * FeaTipCom is shown exactly once, the first time the App
	 * Features section is on screen with a real generation already
	 * behind it. shoFeaBoo alone (gated on cheDonBoo) already guarantees
	 * a generation happened, since the closing checklist item IS the
	 * generate() call, so no separate today.generatedAt check is needed
	 * here. Delayed a beat past genActBoo flipping back to false rather
	 * than firing the instant it does: genLisFun's own entrance animations
	 * (arriving reminders, etc.) are still settling for a few hundred ms
	 * after that, and starting this tip's own smooth-scroll immediately
	 * would fight them for the user's attention instead of waiting for
	 * the list to genuinely finish settling first.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const intSeeBoo = !!( staAppObj.onboarding && staAppObj.onboarding.appFeaturesIntroSeen ); // What: Feature Intro Seen Boolean. Why: The tip must never show a second time once the user has already seen it. How: This reads staAppObj.onboarding.appFeaturesIntroSeen.

	const [ shoIntBoo, setShoIntBoo ] = React.useState( false ); // What: Show Feature Intro Boolean And Setter. Why: See the doc comment just above. How: This is set by the effect below.


	React.useEffect( () => { // What: Feature Intro Timing Effect. Why: See the doc comment just above. How: This stages shoIntBoo true after a fixed delay, only while every gating condition holds, and clears it immediately whenever any of them stop holding.


		if ( !shoFeaBoo || intSeeBoo || genActBoo ) { setShoIntBoo( false ); return; } // What: Not Eligible Guard. Why: The tip must not show at all outside these 3 conditions. How: This clears shoIntBoo and bails out early whenever any of them fails.



		const intTimNum = setTimeout( () => setShoIntBoo( true ), 500 ); // What: Feature Intro Timeout Number. Why: This is the actual delayed reveal described in the doc comment above. How: This sets shoIntBoo true 500ms later.



		return () => clearTimeout( intTimNum ); // What: Effect Cleanup Return. Why: A stale reveal must not fire after a newer effect run has already begun. How: This cancels intTimNum.


	}, [ shoFeaBoo, intSeeBoo, genActBoo ] ); // What: Effect Dependency Array. Why: Any of these 3 changing can flip whether the tip should be showing at all. How: shoFeaBoo/intSeeBoo/genActBoo are exactly the 3 conditions the guard above checks.

	// #endregion App Features Intro Timing



	// #region Edit Mode

	/**
	 * tab-today.jsx = Edit Mode
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

	const [ ediModBoo, setEdiModBoo ] = React.useState( false ); // What: Edit Mode Boolean And Setter. Why: This is the single source of truth for whether the list is currently in Edit Mode. How: This is toggled by togModFun/opeModFun/cloModFun below.
	const [ banCloBoo, setBanCloBoo ] = React.useState( false ); // What: Banner Closing Boolean And Setter. Why: See the doc comment just above. How: This is set true right when Edit Mode ends and cleared once the collapse animation finishes.
	const [ merProObj, setMerProObj ] = React.useState( null );  // What: Merge Prompt Object And Setter. Why: A pending group-rename that would MERGE into an existing group is held here until the user confirms. How: This is set by reqRenFun below and read by GroHeaCom's own merPenObj prop.

	const groDndRef = React.useRef( null ); // What: Group Dnd Reference. Why: groDraFun below needs a handle on the groups wrapper to scope the drag container to. How: This is attached to the .groDraDiv div's own ref prop further down.
	const shoOrdRef = React.useRef( [] );   // What: Shown Order Reference. Why: Drop indices from REO_NAM_OBJ are DOM positions, so they must resolve against whatever order the content column was LAST rendered from, not the unpadded bloOrdArr. How: This is written just before the return JSX below and read by groDraFun's own onDroOrdFun.
	const ordSnaRef = React.useRef( null ); // What: Order Snapshot Reference. Why: A snapshot taken on entering Edit Mode lets Cancel/Escape discard every drag made during the whole session. How: This is populated by opeModFun and read/cleared by cloModFun.


	// #region reqRenFun

	/**
	 * reqRenFun = Request Rename Function
	 *
	 * @summary
	 * GroHeaCom's rename request for a real group. It normalizes the typed name;
	 * when that resolves to a different existing group it stages a merge
	 * confirmation instead of renaming, otherwise it renames the group straight
	 * away.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param oldNamStr - Old Name String: The group's current name.
	 * @param rawNewStr - Raw New String: The typed new name.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * reqRenFun( oldNamStr, rawNewStr ) // => void
	 * ```
	 *
	*/

	const reqRenFun = ( oldNamStr, rawNewStr ) => { // What: Request Rename Function. Why: A group header's own rename entry point needs to normalize the typed name and, if it resolves to a DIFFERENT existing group, defer to a merge confirm rather than rename straight away. How: This normalizes rawNewStr, then either stages merProObj or calls actStoObj.renGroFun directly.


		const othGroArr = [ ...new Set( staAppObj.pickers.filter( ( curPicObj ) => curPicObj.group && curPicObj.group !== oldNamStr ).map( ( curPicObj ) => curPicObj.group ) ) ]; // What: Other Group Array. Why: The collision check below needs every OTHER real group name, excluding the one being renamed. How: This deduplicates every non-matching picker's own group field via a Set.
		const tarNamStr = norGroFun( rawNewStr, othGroArr ); // What: Target Name String. Why: This is the actual normalized candidate name. How: This calls norGroFun with rawNewStr and othGroArr.


		if ( !tarNamStr || tarNamStr === oldNamStr ) return; // What: No-Op Guard. Why: An empty or unchanged normalized name has nothing to rename. How: This bails out early when either condition holds.



		if ( othGroArr.includes( tarNamStr ) ) setMerProObj( { from : oldNamStr, to : tarNamStr } ); // What: Merge Stage Branch. Why: A collision with another real group means this needs confirmation before merging. How: This stages merProObj instead of renaming immediately.

		else actStoObj.renGroFun( oldNamStr, tarNamStr ); // What: Direct Rename Branch. Why: No collision means the rename can commit immediately. How: This calls actStoObj.renGroFun with oldNamStr/tarNamStr.


	};

	// #endregion reqRenFun


	const opeModFun = () => { // What: Open Mode Function. Why: Entering Edit Mode needs to snapshot the current order first, so a later Cancel/Escape has something to revert to, and should close any open editor/confirm along the way. How: This stages ordSnaRef, then clears actEdiStr/conGenBoo before flipping ediModBoo on.


		ordSnaRef.current = { // What: Order Snapshot Store. Why: A later Cancel or Escape must be able to put every drag back exactly as it was. How: This saves independent copies of both saved orders.


			groArr : ( staAppObj.groupOrder || [] ).slice(),                     // What: Group Array. Why: The group order must be copied, not referenced, so later drags can't mutate the snapshot. How: This slices staAppObj.groupOrder.
			picObj : JSON.parse( JSON.stringify( staAppObj.pickerOrder || {} ) ) // What: Picker Object. Why: The per-group picker orders are nested arrays, so a shallow copy would still share them. How: This deep-copies staAppObj.pickerOrder through JSON.


		};

		setActEdiStr( null );  // What: Active Editor Close. Why: Entering Edit Mode must collapse any open inline editor first. How: This clears actEdiStr.
		setConGenBoo( false ); // What: Regenerate Confirm Close. Why: A pending regenerate confirm makes no sense once Edit Mode takes over the footer. How: This clears conGenBoo.
		setEdiModBoo( true );  // What: Edit Mode Enter. Why: This is the actual switch into Edit Mode. How: This flips ediModBoo to true.


	};


	const cloModFun = ( cmtEdiBoo ) => { // What: Close Mode Function. Why: Leaving Edit Mode needs to either keep or discard every drag made during the session, then play the banner's own collapse-out. How: This reverts to ordSnaRef's own snapshot unless cmtEdiBoo, clears the snapshot, flips ediModBoo off, and stages banCloBoo.


		if ( banCloBoo ) return; // What: Already Closing Guard. Why: A close already in flight must not be re-triggered by a second call. How: This bails out early while banCloBoo is already true.



		if ( !cmtEdiBoo && ordSnaRef.current ) actStoObj.setOrdFun( ordSnaRef.current.groArr, ordSnaRef.current.picObj ); // What: Revert Branch. Why: Cancel/Escape must discard every drag made this session, restoring exactly what was snapshotted on entry. How: This writes ordSnaRef's own snapshot back via actStoObj.setOrdFun, only when cmtEdiBoo is false.



		ordSnaRef.current = null; // What: Snapshot Clear. Why: The snapshot is no longer needed once this session has fully ended. How: This clears ordSnaRef back to null.

		setEdiModBoo( false ); // What: Edit Mode Off. Why: This is the actual mode exit. How: This flips ediModBoo to false.

		setBanCloBoo( true ); // What: Banner Closing Stage. Why: The banner needs to play its own collapse-out before unmounting. How: This flips banCloBoo to true.

		if ( redMotFun() ) setBanCloBoo( false ); // What: Reduced Motion Branch. Why: A user who prefers reduced motion should see the banner gone immediately rather than watch a collapse it won't perceive as smooth anyway. How: This clears banCloBoo back to false immediately.

		else setTimeout( () => setBanCloBoo( false ), durMilFun( 'p02' ) ); // What: Collapse Settle Timeout. Why: Everyone else needs the banner to stay mounted through its own real collapse animation. How: This clears banCloBoo after that animation's own p02 duration step. // Duration Base Plus 2 ~= 277.0ms


	};


	const togModFun = () => { ediModBoo ? cloModFun( true ) : opeModFun(); }; // What: Toggle Mode Function. Why: The rail's own Edit Mode button needs one handler that does the right thing either direction. How: This calls cloModFun(true) (treated as a commit) while already on, otherwise opeModFun.



	React.useEffect( () => { // What: Edit Mode Escape Effect. Why: Escape should cancel an active Edit Mode session, discarding its changes, matching every other inline editor's own Escape behavior. How: This subscribes a keydown listener only while ediModBoo is true.


		if ( !ediModBoo ) return; // What: Not Editing Guard. Why: There is nothing to cancel while Edit Mode isn't even on. How: This bails out of the effect entirely when ediModBoo is false.



		const onKeyEscFun = ( keyEveObj ) => { if ( keyEveObj.key === 'Escape' ) cloModFun( false ); }; // What: On Key Escape Function. Why: This is the actual Escape handler. How: This calls cloModFun(false) (a discard) on the Escape key.


		window.addEventListener( 'keydown', onKeyEscFun ); // What: Keydown Subscribe Call. Why: Escape must be caught anywhere on the page while Edit Mode is on. How: This registers onKeyEscFun on window.



		return () => window.removeEventListener( 'keydown', onKeyEscFun ); // What: Effect Cleanup Return. Why: The listener must not outlive this effect run. How: This removes the same onKeyEscFun reference that was added above.


	}, [ ediModBoo ] ); // What: Effect Dependency Array. Why: This effect only ever needs to re-run when ediModBoo itself changes. How: ediModBoo is exactly what gates whether the listener should even be subscribed.


	// #region groDraFun

	/**
	 * groDraFun = Group Drag Function
	 *
	 * @summary
	 * The pointerdown handler behind every group header's grip in Edit Mode. It
	 * resolves the drag container and handle, then starts REO_NAM_OBJ.staDraFun
	 * with a drop callback that merges the new group order into the saved one.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param poiEveObj - Pointer Event Object: The grip's pointerdown event.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * groDraFun( poiEveObj ) // => void
	 * ```
	 *
	*/

	const groDraFun = ( poiEveObj ) => { // What: Group Drag Function. Why: This is the actual pointerdown handler behind every GroHeaCom's own grip. How: This resolves the drag container/handle, then hands off to REO_NAM_OBJ.staDraFun with the group-specific drop callback.


		const wraCurEle = groDndRef.current;                                            // What: Wrapper Current Element. Why: This is the drag container REO_NAM_OBJ needs. How: This reads groDndRef.current.
		const griCurEle = poiEveObj.currentTarget;                                      // What: Grip Current Element. Why: REO_NAM_OBJ needs the actual grip element that received the pointerdown. How: This reads poiEveObj.currentTarget.
		const secCurEle = griCurEle.closest( '[data-element-name-hook~="todGroSec"]' ); // What: Section Current Element. Why: REO_NAM_OBJ needs the whole draggable row (the group's own section), not just its grip. How: This walks up from griCurEle to its nearest todGroSec ancestor.


		if ( !wraCurEle || !secCurEle || !REO_NAM_OBJ ) return; // What: Missing Prerequisite Guard. Why: A drag cannot start without all 3 of these. How: This bails out early unless every one of them exists.



		REO_NAM_OBJ.staDraFun( poiEveObj, { // What: Start Drag Call. Why: This is the actual shared pointer-drag mechanism every reorderable list in the app uses. How: This is passed the container/handle plus 3 callbacks below.


			conLisEle   : wraCurEle,                                                             // What: Container List Element. Why: The drag needs the element whose children are being reordered. How: This passes wraCurEle.
			griIcoEle   : griCurEle,                                                             // What: Grip Icon Element. Why: The drag starts from the grip that received the pointerdown. How: This passes griCurEle.
			hanDraEle   : secCurEle,                                                             // What: Handle Drag Element. Why: The whole row moves, not just its grip. How: This passes secCurEle.
			iteSelStr   : '[data-element-name-hook~="todGroSec"]',                               // What: Item Selector String. Why: The drag needs to know which children count as reorderable rows. How: This passes the todGroSec hook selector.
			onEndDraFun : () => emlTouObj.set( { draActBoo : false } ),                          // What: On End Drag Function. Why: The coach must reappear once the gesture ends. How: This publishes draActBoo : false onto the shared tour bus.
			onStaDraFun : () => emlTouObj.set( { draActBoo : true } ),                           // What: On Start Drag Function. Why: Dragging a group should hide the mini-tour coach for the gesture's own duration (see Today's own "Movable IcoSvgCom" tour step), since its tooltip card can sit right over the group being dragged. How: This publishes draActBoo : true onto the shared tour bus, a harmless no-op when no tour is mounted.
			scrConEle   : maiScrRef.current?.closest( '[data-element-name-hook~="appConMai"]' ), // What: Scroll Container Element. Why: Dragging near an edge should auto-scroll the real scroll container. How: This passes the nearest .main ancestor.

			onDroOrdFun : ( ordNumArr ) => { // What: On Drop Order Function. Why: The actual persisted group order needs to be recomputed from the drop's own DOM-position indices. How: This maps ordNumArr back through shoOrdRef's own shown order, then merges the result into staAppObj.groupOrder.


				const shoOrdArr = shoOrdRef.current || [];                                                    // What: Shown Order Array. Why: A drop index is a DOM position, which only makes sense against whatever order was actually rendered. How: This reads shoOrdRef.current, falling back to an empty array.
				const newOrdArr = ordNumArr.map( ( curIndNum ) => shoOrdArr[ curIndNum ] ).filter( Boolean ); // What: New Order Array. Why: This translates the drop's own numeric indices back into real block ids. How: This maps each index through shoOrdArr, dropping any that resolve to nothing.


				actStoObj.reoGroFun( merOrdFun( staAppObj.groupOrder || [], newOrdArr ) ); // What: Reorder Groups Call. Why: This is the actual persisted write. How: This merges newOrdArr's own new order back into the fuller saved order via merOrdFun.


			}


		} );


	};

	// #endregion groDraFun


	// #region iteDraFun

	/**
	 * iteDraFun = Item Drag Function
	 *
	 * @summary
	 * The pointerdown handler behind every card's grip within a group in Edit
	 * Mode. It resolves the drag container and handle, then starts
	 * REO_NAM_OBJ.staDraFun with a drop callback that merges the new card order
	 * into that group's saved picker order.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param poiEveObj - Pointer Event Object: The grip's pointerdown event.
	 * @param curGroObj - Current Group Object: The group the dragged card belongs
	 *                    to.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * iteDraFun( poiEveObj, curGroObj ) // => void
	 * ```
	 *
	*/

	const iteDraFun = ( poiEveObj, curGroObj ) => { // What: Item Drag Function. Why: This is the actual pointerdown handler behind every EntCarCom's own grip within a group. How: This resolves the drag container/handle, then hands off to REO_NAM_OBJ.staDraFun with the item-specific drop callback.


		const griCurEle = poiEveObj.currentTarget;                                      // What: Grip Current Element. Why: REO_NAM_OBJ needs the actual grip element that received the pointerdown. How: This reads poiEveObj.currentTarget.
		const lisCurEle = griCurEle.closest( '[data-element-name-hook~="todLisDiv"]' ); // What: List Current Element. Why: This is the drag container REO_NAM_OBJ needs, scoped to this one group's own list. How: This walks up from griCurEle to its nearest todLisDiv ancestor.
		const carCurEle = griCurEle.closest( '[data-element-name-hook~="todCarArt"]' ); // What: Card Current Element. Why: REO_NAM_OBJ needs the whole draggable row (the item's own card), not just its grip. How: This walks up from griCurEle to its nearest todCarArt ancestor.


		if ( !lisCurEle || !carCurEle || !REO_NAM_OBJ ) return; // What: Missing Prerequisite Guard. Why: A drag cannot start without all 3 of these. How: This bails out early unless every one of them exists.



		REO_NAM_OBJ.staDraFun( poiEveObj, { // What: Start Drag Call. Why: This is the actual shared pointer-drag mechanism every reorderable list in the app uses. How: This is passed the container/handle plus 3 callbacks below.


			conLisEle   : lisCurEle,                                                             // What: Container List Element. Why: The drag needs the element whose children are being reordered. How: This passes lisCurEle.
			griIcoEle   : griCurEle,                                                             // What: Grip Icon Element. Why: The drag starts from the grip that received the pointerdown. How: This passes griCurEle.
			hanDraEle   : carCurEle,                                                             // What: Handle Drag Element. Why: The whole row moves, not just its grip. How: This passes carCurEle.
			iteSelStr   : '[data-element-name-hook~="todCarArt"]',                               // What: Item Selector String. Why: The drag needs to know which children count as reorderable rows. How: This passes the todCarArt hook selector.
			onEndDraFun : () => emlTouObj.set( { draActBoo : false } ),                          // What: On End Drag Function. Why: Same reasoning as groDraFun's own onEndDraFun above. How: This publishes draActBoo : false onto the shared tour bus.
			onStaDraFun : () => emlTouObj.set( { draActBoo : true } ),                           // What: On Start Drag Function. Why: Same reasoning as groDraFun's own onStaDraFun above. How: This publishes draActBoo : true onto the shared tour bus.
			scrConEle   : maiScrRef.current?.closest( '[data-element-name-hook~="appConMai"]' ), // What: Scroll Container Element. Why: Dragging near an edge should auto-scroll the real scroll container. How: This passes the nearest .main ancestor.

			onDroOrdFun : ( ordNumArr ) => { // What: On Drop Order Function. Why: The actual persisted per-group picker order needs to be recomputed from the drop's own DOM-position indices. How: This maps ordNumArr back through curGroObj's own current entries, then merges the result into staAppObj.pickerOrder for this group.


				const newOrdArr = ordNumArr.map( ( curIndNum ) => curGroObj.entArr[ curIndNum ].picRecObj.id ); // What: New Order Array. Why: This translates the drop's own numeric indices back into real picker ids. How: This maps each index through curGroObj's own entries array.


				actStoObj.reoPicFun( curGroObj.namStr, merOrdFun( ( staAppObj.pickerOrder || {} )[ curGroObj.namStr ] || [], newOrdArr ) ); // What: Reorder Pickers In Group Call. Why: This is the actual persisted write, scoped to this one group. How: This merges newOrdArr's own new order back into this group's own fuller saved order via merOrdFun.


			}


		} );


	};

	// #endregion iteDraFun

	// #endregion Edit Mode


	const [ genMapObj, setGenMapObj ] = React.useState( null ); // What: Generate Map Object And Setter. Why: Every LoaCarCom rendered during a regeneration needs its own live { canArr, ideStr, kinStr, staStr, texStr } record to read from. How: This is populated by genLisFun below and cleared once the cascade finishes.

	const [ leaEntSet, setLeaEntSet ] = React.useState( () => new Set() ); // What: Leaving Entry Set And Setter. Why: A regenerate can drop an entry entirely (its own picker produced no new pick, e.g. its last eligible item just went inactive) without a loader card to cover it, so without this it would sit untouched through the whole generation and then blink out; this flags it to play the normal removal animation instead. How: This is staged by genLisFun below right before the commit and cleared right after.
	const [ leaTasSet, setLeaTasSet ] = React.useState( () => new Set() ); // What: Leaving Task Set And Setter. Why: A completed one-time reminder a Generate is about to purge needs the same played-out removal animation, on the reminder card itself, before actStoObj.setEntFun actually removes it. How: This is staged by genLisFun below and cleared right after, and is passed straight through to RemSecCom as its own leaTasSet prop.
	const [ ariTasSet, setAriTasSet ] = React.useState( () => new Set() ); // What: Arriving Task Set And Setter. Why: A reminder a Generate just made newly visible (its day arrived but the generator hadn't run yet) needs to play an entrance instead of just popping in. How: This is staged by genLisFun below and cleared shortly after, and is passed straight through to RemSecCom as its own ariTasSet prop.

	const genBusRef = React.useRef( false ); // What: Generate Busy Reference. Why: genLisFun's own re-entrancy guard needs a value that updates synchronously, unlike React state. How: This is set true at genLisFun's own start and false at its own end.
	const genMapRef = React.useRef( null );  // What: Generate Map Reference. Why: The departing-entry computation inside genLisFun needs to read the live generate map synchronously, without waiting for a state update to land. How: This mirrors genMapObj, written by genLisFun alongside every setGenMapObj call.

	const genTotNum = 3200; // What: Generate Total Number. Why: The whole reel-cascade animation shares this one fixed total duration; per-step pace flexes with how many slots are in the list (8 slots -> 400ms each; fewer slots -> slower and savorable, more -> quicker), so the whole cascade always wraps at this exact total. How: This is divided by ordSloArr.length inside genLisFun below.



	// #region genLisFun

	/**
	 * genLisFun = Generate List Function
	 *
	 * @summary
	 * Rolls every daily picker behind a sequential reel-cycle loader.
	 * Picks are computed up front so the loader shows the actual
	 * candidate pool and final pick for each, then commits to state at
	 * the end. Guarantees at least 1 second of loader time. genOptObj.autBoo
	 * is true only when the scheduled boundary-check effect below
	 * invokes this (never for the manual Regenerate button or the
	 * onboarding tour's simulated click); it is threaded straight into
	 * actStoObj.setEntFun since only an auto-run resets today's
	 * own streak claim, see that action's own comment for why.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const genLisFun = async ( genOptObj = {} ) => { // What: Generate List Function. Why: See the doc comment just above. How: This scrolls to the top, computes every pick up front, plays the reel cascade, then commits the new entries and reminder transitions.


		const isaAutBoo = !!genOptObj.autBoo; // What: Is-A Auto Boolean. Why: Every branch below that behaves differently for a scheduled auto-run versus a manual/tour-triggered one needs this single flag. How: This reads genOptObj.autBoo, coerced to a real boolean.



		if ( genBusRef.current ) return; // What: Already Generating Guard. Why: A second call while one is already mid-cascade must be a no-op. How: This bails out early while genBusRef is already true.



		genBusRef.current = true; // What: Generate Busy Set. Why: Every call from here on, until this function's own end, must be treated as busy. How: This flags genBusRef true for the whole duration of this call.



		// #region Pre-Cascade Scroll To Top

		/**
		 * tab-today.jsx = Pre-Cascade Scroll To Top
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

		const scrCurEle = maiScrRef.current?.closest( '[data-element-name-hook~="appConMai"]' ); // What: Scroller Current Element. Why: The scroll-to-top below needs the real scroll container when one exists. How: This walks up from maiScrRef.current to its nearest .main ancestor.
		const topEdgBoo = scrCurEle ? scrCurEle.scrollTop <= 1 : window.scrollY <= 1;            // What: Top Edge Boolean. Why: A list already at the top needs no scroll (and no settle wait) at all. How: This checks either the scroller's own scrollTop or the window's own scrollY.


		if ( !topEdgBoo ) { // What: Needs Scroll Branch. Why: Only a list that isn't already at the top needs the scroll-and-wait sequence below. How: This flags skiSpyRef, scrolls, waits, then releases skiSpyRef.


			skiSpyRef.current = true; // What: Skip Spy Set. Why: The scroll-spy effect must not fight this programmatic scroll while it is in flight. How: This flags skiSpyRef true for the duration of the scroll below.

			const scrBehStr = redMotFun() ? 'auto' : 'smooth'; // What: Scroll Behavior String. Why: Reduced-motion users should jump instead of watching a smooth scroll. How: This is 'auto' under reduced motion, otherwise 'smooth'.


			if ( scrCurEle ) scrCurEle.scrollTo( { behavior : scrBehStr, top : 0 } ); // What: Scroller Scroll Call. Why: A real scroll container needs its own scrollTo. How: This scrolls scrCurEle to the top, smoothly unless reduced motion is preferred.

			else window.scrollTo( { behavior : scrBehStr, top : 0 } ); // What: Window Scroll Call. Why: Without a real scroll container, the window itself must be scrolled instead. How: This scrolls the window to the top, smoothly unless reduced motion is preferred.



			await new Promise( ( resProFun ) => setTimeout( resProFun, 450 ) ); // What: Settle Wait. Why: The smooth scroll needs time to actually finish before the cascade begins. How: This awaits a fixed 450ms.

			skiSpyRef.current = false; // What: Skip Spy Release. Why: The scroll-spy effect may resume once the scroll has settled. How: This clears skiSpyRef back to false.


		}

		// #endregion Pre-Cascade Scroll To Top



		// #region Upfront Pick Computation

		/**
		 * tab-today.jsx = Upfront Pick Computation
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

		const genNowDat = new Date();                                             // What: Generate Now Date. Why: Every schedule/cadence/holiday check below needs one single, consistent "now" for this whole generation pass. How: This is a fresh Date, read once.
		const dowTodNum = genNowDat.getDay();                                     // What: Day-Of-Week Today Number. Why: A picker's own daysOfWeek gate is checked against this. How: This reads genNowDat.getDay().
		const holTodBoo = HOL_NAM_OBJ.holDatFun( staAppObj.holidays, genNowDat ); // What: Holiday Today Boolean. Why: A picker's own skipHolidays gate is checked against this. How: This calls HOL_NAM_OBJ.holDatFun with staAppObj.holidays and genNowDat.

		const conAllArr = actStoObj.resConFun() || staAppObj.conditionals || [];                    // What: Conditional All Array. Why: Phase A resolves every conditional's own `triggered` for today up front, before the per-picker loop below needs to read it. How: This calls actStoObj.resConFun, falling back to staAppObj.conditionals or an empty array.
		const conIdeMap = new Map( conAllArr.map( ( curConObj ) => [ curConObj.id, curConObj ] ) ); // What: Conditional Identifier Map. Why: The per-picker loop below needs a fast lookup from a picker's own conditionalId to its resolved conditional. How: This maps conAllArr down to an id-keyed Map.

		const exiPicMap = new Map(); // What: Existing By Picker Map. Why: Existing live pick/charging entries are the source of truth for cadence carry/suppress decisions, since they persist across days until a regenerate. How: This is populated by the loop just below.


		for ( const curEntObj of staAppObj.today.entries ) { // What: Existing Entry Index Loop. Why: Every current entry needs indexing by picker before the main per-picker loop below can consult it. How: This walks staAppObj.today.entries, keying exiPicMap by pickerId (day-off cards, which have none, are excluded).


			if ( curEntObj.pickerId && curEntObj.kind !== 'dayoff' ) exiPicMap.set( curEntObj.pickerId, curEntObj ); // What: Existing Entry Record. Why: A non-daily picker's still-open entry may carry over instead of being re-picked. How: This indexes every real (non-day-off) entry by its own picker id.


		}



		const daoCarArr = [];        // What: Day-Off Card Array. Why: One card per triggered conditional (first hit wins) is collected here before the commit. How: This is pushed to inside the main loop below.
		const carShoSet = new Set(); // What: Card Shown Set. Why: Only the FIRST suppressed picker for a given conditional should surface its own day-off card. How: This is checked and added to inside the main loop below.
		const empEasArr = [];        // What: Empty Ease Array. Why: One card per ease-up picker with nothing eligible today is collected here before the commit. How: This is pushed to inside the main loop below.
		const newPicArr = [];        // What: New Pick Array. Why: Every fresh pick this generation actually produced is collected here before the commit. How: This is pushed to inside the main loop below.

		const ordSloArr = []; // What: Ordered Slot Array. Why: Ordered animation slots (encounter order) let day-off/charging cards settle DURING the cascade alongside picks, instead of popping in at the final commit; each slot is keyed by the picker whose list position it occupies during the loader. How: This is pushed to inside the main loop below.
		const carEntArr = []; // What: Carried Entry Array. Why: A cadence pick persisting from a prior day still needs its own encounter-order slot, wrapped so the commit step below can tell it apart from a fresh pick. How: This is pushed to inside the main loop below.

		const picNamSet = new Set(); // What: Picked Name Set. Why: Item names already committed to today's list so far (lowercased) are fed to any avoidDuplicates picker below so it won't re-surface an item another picker already put on today's list; seeded with carried-over cadence picks (still "on the list" today, just not freshly picked), then grown as each fresh pick lands, in encounter order, matching "as it is being built" rather than checking against the final list. How: This is read by PIC_NAM_OBJ.picIteFun's own excludeNames option and added to throughout the loop below.


		for ( const picIdeStr of staAppObj.daily.pickerIds ) { // What: Daily Picker Loop. Why: This is the actual per-picker scheduling/picking pass every other collection above feeds from. How: This walks every picker id in staAppObj.daily.pickerIds, gating and picking (or suppressing) each one in turn.


			const picRecObj = staAppObj.pickers.find( ( curPicObj ) => curPicObj.id === picIdeStr ); // What: Picker Record Object. Why: Every check below needs the real picker record, not just its id. How: This finds the picker matching picIdeStr.


			if ( !picRecObj || picRecObj.hidden ) continue; // What: Missing Or Hidden Guard. Why: A deleted or still-hidden (mid-onboarding) picker must not run today at all. How: This skips picIdeStr when picRecObj is missing or flagged hidden.



			if ( Array.isArray( picRecObj.daysOfWeek ) && !picRecObj.daysOfWeek.includes( dowTodNum ) ) continue; // What: Weekday Gate. Why: A picker scoped to specific weekdays must not run on any other day. How: This skips picIdeStr when daysOfWeek is a real array that doesn't include dowTodNum.



			if ( picRecObj.skipHolidays && holTodBoo ) continue; // What: Holiday Gate. Why: A picker opted into skipping holidays must not run on an active one. How: This skips picIdeStr when both flags hold.



			// #region Picker Cadence Gate

			/**
			 * tab-today.jsx = Picker Cadence Gate
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


				const perKeyStr = CAD_NAM_OBJ.perKeyFun( picRecObj, genNowDat ); // What: Period Key String. Why: This identifies exactly which period (week/month/year) this picker's own card belongs to right now. How: This calls CAD_NAM_OBJ.perKeyFun.
				const exiEntObj = exiPicMap.get( picIdeStr );                    // What: Existing Entry Object. Why: A live entry already on screen for this exact period must be carried or recognized as satisfied. How: This reads exiPicMap at picIdeStr.


				if ( exiEntObj && exiEntObj.periodKey === perKeyStr ) { // What: Same Period Branch. Why: An entry already logged against THIS exact period needs either carrying (still open) or skipping (already satisfied). How: This checks exiEntObj.done to choose between the two.


					if ( exiEntObj.done ) continue; // What: Period Satisfied Skip. Why: A completed entry for this period means nothing further should surface. How: This skips picIdeStr entirely.



					carEntArr.push( { _carry : true, entry : exiEntObj } ); // What: Carried Entry Push. Why: A not-yet-done entry from the current period must persist verbatim, locked, rather than being replaced. How: This wraps exiEntObj in a { _carry, entry } marker for the commit step below.

					const carIteObj = staAppObj.items.find( ( curIteObj ) => curIteObj.id === exiEntObj.itemId ); // What: Carried Item Object. Why: The carried item's own name still needs to join picNamSet, same as a fresh pick would. How: This finds the item matching exiEntObj's own itemId.


					if ( carIteObj ) picNamSet.add( carIteObj.name.toLowerCase() ); // What: Carried Name Add. Why: An avoidDuplicates picker elsewhere in this loop must not re-surface an item this carried card already shows. How: This adds carIteObj's own lowercased name to picNamSet.



					continue; // What: Carried Continue. Why: A carried card needs no fresh pick this generation. How: This skips the rest of the loop body for picIdeStr.


				}



				if ( CAD_NAM_OBJ.comPerFun( picRecObj, staAppObj.pickLog, genNowDat ) ) continue; // What: Completed This Period Skip. Why: A completed pick logged this period, even with the entry itself wiped, still satisfies the cadence. How: This skips picIdeStr when CAD_NAM_OBJ.comPerFun reports true.


			}

			// #endregion Picker Cadence Gate



			// #region Day-Off Conditional Gate

			/**
			 * tab-today.jsx = Day-Off Conditional Gate
			 *
			 * @summary
			 * When the picker's own conditional is triggered it is
			 * suppressed; the FIRST suppressed picker for that
			 * conditional surfaces a single day-off card instead.
			 *
			 * @author z4nta0 <https://github.com/z4nta0>
			 *
			*/

			const conRecObj = picRecObj.conditionalId ? conIdeMap.get( picRecObj.conditionalId ) : null; // What: Conditional Record Object. Why: This is the resolved conditional this picker's own suppression check reads. How: This looks up picRecObj's own conditionalId in conIdeMap, or null when it has none.


			if ( CON_NAM_OBJ.supGatFun( conRecObj ) ) { // What: Suppressed Branch. Why: See the doc comment just above. How: This surfaces (or skips, if already shown) a day-off card, then always continues past the pick attempt below.


				if ( !carShoSet.has( conRecObj.id ) ) { // What: First Hit Guard. Why: Only the first picker suppressed by this exact conditional should surface its own card. How: This runs the push below only the first time conRecObj's own id is seen.


					carShoSet.add( conRecObj.id ); // What: Card Shown Add. Why: Every LATER picker suppressed by this same conditional must not surface a second card. How: This adds conRecObj's own id to carShoSet.

					const carTexStr = conRecObj.cardText || conRecObj.name; // What: Card Text String. Why: The day-off card needs its own display text. How: This reads conRecObj.cardText, falling back to its own name.


					daoCarArr.push({ // What: Dayoff Card Push. Why: This is the actual card the commit step below turns into a real entry. How: This builds the full day-off record, tagging a period key only for a non-daily picker.


						cardText      : carTexStr,                  // What: Card Text. Why: The card shows the conditional's own message. How: This passes carTexStr.
						conditionalId : conRecObj.id,               // What: Conditional Id. Why: The card must know which conditional produced it. How: This passes conRecObj's own id.
						condName      : conRecObj.name,             // What: Condition Name. Why: The card's title names the conditional. How: This passes conRecObj's own name.
						group         : picRecObj.group || 'Other', // What: Group. Why: The card sits in the suppressed picker's own group. How: This passes that group, falling back to Other.
						kind          : 'dayoff',                   // What: Kind. Why: The entry must render as a day-off card. How: This is the fixed 'dayoff' kind.
						pickerName    : picRecObj.name,             // What: Picker Name. Why: The card's title also names the suppressed picker. How: This passes picRecObj's own name.

						...( picCadStr !== 'daily' ? { periodKey : CAD_NAM_OBJ.perKeyFun( picRecObj, genNowDat ) } : {} ) // What: Period Key Spread. Why: A non-daily picker's card belongs to one specific period. How: This adds a periodKey only when the picker is not daily.


					});

					ordSloArr.push({ // What: Ordered Slot Push. Why: The day-off card still needs its own animation slot, in encounter order alongside every pick. How: This pushes a { pickerId, info } pair keyed by picIdeStr.


						picStr : picIdeStr, // What: Picker String. Why: Slots are keyed by the picker that produced them. How: This passes picIdeStr.

						infObj : { // What: Info Object. Why: This is the record LoaCarCom reads for this slot. How: This bundles the slot's own kind, candidates, and card text.


							canArr : [],           // What: Candidate Array. Why: LoaCarCom's reel cycles through these. How: This passes the slot's own candidate list.
							conStr : conRecObj.id, // What: Conditional String. Why: A day-off slot already on screen from an earlier generation must be recognized. How: This passes conRecObj's own id.
							kinStr : 'dayoff',     // What: Kind String. Why: LoaCarCom renders each kind differently. How: This is the fixed 'dayoff' kind.
							texStr : carTexStr     // What: Text String. Why: A settled day-off slot shows the card's own text. How: This passes carTexStr.


						}


					});


				}



				continue; // What: Suppressed Continue. Why: A suppressed picker never attempts a real pick. How: This skips the pick attempt below entirely.


			}

			// #endregion Day-Off Conditional Gate



			const perKeyStr = picCadStr !== 'daily' ? CAD_NAM_OBJ.perKeyFun( picRecObj, genNowDat ) : null;      // What: Period Key String. Why: A fresh non-daily pick still needs to be tagged with the period it belongs to, so a future generation can recognize it as already-current. How: This computes the period key only for a non-daily picker, otherwise null.
			const picResObj = PIC_NAM_OBJ.picIteFun( picRecObj, staAppObj.items, { excludeNames : picNamSet } ); // What: Pick Result Object. Why: This is the actual picking engine call for this picker. How: This calls PIC_NAM_OBJ.picIteFun, passing picNamSet so an avoidDuplicates picker won't re-surface an already-committed name.


			if ( picResObj.picObj ) { // What: Picked Branch. Why: A successful pick needs collecting into newPicArr plus its own animation slot. How: This adds the picked name to picNamSet, then pushes both records.


				picNamSet.add( picResObj.picObj.name.toLowerCase() ); // What: Picked Name Add. Why: A LATER avoidDuplicates picker in this same loop must not re-surface this exact name. How: This adds picResObj.picObj's own lowercased name to picNamSet.

				newPicArr.push({ // What: New Pick Push. Why: This is the actual pending-commit record for this fresh pick. How: This bundles the picked item's id, the period key, picIdeStr, and the full picResObj.


					ideStr : picResObj.picObj.id, // What: Identifier String. Why: The committed entry needs the picked item's own id. How: This passes it.
					perStr : perKeyStr,           // What: Period String. Why: A non-daily pick is tagged with its own period. How: This passes perKeyStr, null for a daily picker.
					picStr : picIdeStr,           // What: Picker String. Why: The committed entry needs its own picker's id. How: This passes picIdeStr.
					resObj : picResObj            // What: Result Object. Why: The committed entry's pending mutations come from the pick result. How: This passes the whole picResObj.


				});

				ordSloArr.push({ // What: Ordered Slot Push. Why: This pick still needs its own animation slot, in encounter order. How: This pushes a { pickerId, info } pair keyed by picIdeStr.


					picStr : picIdeStr, // What: Picker String. Why: Slots are keyed by the picker that produced them. How: This passes picIdeStr.

					infObj : { // What: Info Object. Why: This is the record LoaCarCom reads for this slot. How: This bundles the slot's own kind, candidates, and picked id.


						canArr : picResObj.cycArr || [], // What: Candidate Array. Why: LoaCarCom's reel cycles through these. How: This passes the slot's own candidate list.
						ideStr : picResObj.picObj.id,    // What: Identifier String. Why: A settled pick slot shows the item actually picked. How: This passes the picked item's own id.
						kinStr : 'pick'                  // What: Kind String. Why: LoaCarCom renders each kind differently. How: This is the fixed 'pick' kind.


					}


				});


			}

			else if ( picRecObj.mode === 'ease-up' && picResObj.updArr && picResObj.updArr.length ) { // What: Empty Ease-Up Branch. Why: An ease-up picker with nothing charged to threshold still needs a "charging" card so the day's own drift (picResObj.updArr) is applied only once the user checks it, consistent with done-gating; without this the drift would be dropped and the picker could never climb to eligibility. How: This collects a charging card plus its own animation slot.


				empEasArr.push({ // What: Charging Card Push. Why: This is the actual pending-commit record for this charging card. How: This bundles picIdeStr, its own group, the staged drift updates, and an optional period key.


					group    : picRecObj.group || 'Other',     // What: Group. Why: The card sits in its picker's own group. How: This passes that group, falling back to Other.
					kind     : 'charging',                     // What: Kind. Why: The entry must render as a charging card. How: This is the fixed 'charging' kind.
					pending  : { updates : picResObj.updArr }, // What: Pending. Why: Today's drift still applies once the card is checked off. How: This stages the pick result's own updates.
					pickerId : picIdeStr,                      // What: Picker Id. Why: The card belongs to one picker. How: This passes picIdeStr.

					...( perKeyStr ? { periodKey : perKeyStr } : {} ) // What: Period Key Spread. Why: A non-daily picker's card belongs to one specific period. How: This adds a periodKey only when perKeyStr is set.


				});

				ordSloArr.push({ // What: Ordered Slot Push. Why: This charging card still needs its own animation slot, in encounter order. How: This pushes a { pickerId, info } pair keyed by picIdeStr.


					picStr : picIdeStr, // What: Picker String. Why: Slots are keyed by the picker that produced them. How: This passes picIdeStr.

					infObj : { // What: Info Object. Why: This is the record LoaCarCom reads for this slot. How: This bundles the slot's own kind, candidates, and nothing else.


						canArr : [],        // What: Candidate Array. Why: LoaCarCom's reel cycles through these. How: This passes the slot's own candidate list.
						kinStr : 'charging' // What: Kind String. Why: LoaCarCom renders each kind differently. How: This is the fixed 'charging' kind.


					}


				});


			}


		}

		// #endregion Upfront Pick Computation



		const iniSloMap = {}; // What: Initial Slot Map. Why: Every slot must start pending, before the loop below flips each to active then settled in turn. How: This is populated just below from ordSloArr.


		for ( const curSloObj of ordSloArr ) iniSloMap[ curSloObj.picStr ] = { staStr : 'pending', ...curSloObj.infObj }; // What: Initial Slot Populate. Why: This is the actual per-slot seed every LoaCarCom reads from at the very start of the cascade. How: This writes one { status: 'pending', ...info } entry per ordSloArr member.



		genMapRef.current = iniSloMap; // What: Generate Map Reference Set. Why: The departing-entry computation further below needs to read this synchronously, before React has necessarily committed the matching state update. How: This mirrors iniSloMap into genMapRef.

		setGenMapObj( iniSloMap ); // What: Generate Map Set. Why: Every LoaCarCom needs this initial map to render its own pending state. How: This publishes iniSloMap into genMapObj.
		setOpeLogStr( null );      // What: Open Log Clear. Why: A Day Log panel left open during a regeneration would show stale data mid-cascade. How: This clears opeLogStr.
		setGenActBoo( true );      // What: Generate Active Set. Why: The footer/rail need to know a cascade is now playing. How: This flips genActBoo to true.


		if ( redMotFun() ) { // What: Reduced Motion Branch. Why: The picks are already fully computed above, so the pending-active-settled cascade is pure theatre for a user who won't perceive it as smooth anyway; this commits every slot straight to settled instead of making them wait genTotNum for a list that already exists. How: This builds and publishes an all-settled map immediately.


			const finSloMap = {}; // What: Final Slot Map. Why: Every slot needs to land at 'settled' in one shot. How: This is populated just below from ordSloArr.


			for ( const curSloObj of ordSloArr ) finSloMap[ curSloObj.picStr ] = { staStr : 'settled', ...curSloObj.infObj }; // What: Settled Slot Populate. Why: This is the actual all-settled map. How: This writes one { staStr: 'settled', ...infObj } entry per ordSloArr member.



			setGenMapObj( finSloMap ); // What: Generate Map Set. Why: Every LoaCarCom needs to render its own final settled state immediately. How: This publishes finSloMap into genMapObj.


		}

		else { // What: Full Cascade Branch. Why: Everyone else gets the real pending-active-settled reel cascade, one slot at a time. How: This awaits perSteNum between each slot's own active-then-settled transition.


			const perSteNum = ordSloArr.length > 0 ? genTotNum / ordSloArr.length : 0; // What: Per Step Ms Number. Why: The whole cascade must always wrap at genTotNum regardless of how many slots exist. How: This divides genTotNum by ordSloArr's own length.


			for ( const curSloObj of ordSloArr ) { // What: Cascade Step Loop. Why: This is the actual per-slot animation driver. How: This flips each slot to active, waits perSteNum, then flips it to settled, in encounter order.


				setGenMapObj( ( curMapObj ) => curMapObj ? ( { ...curMapObj, [ curSloObj.picStr ] : { ...curMapObj[ curSloObj.picStr ], staStr : 'active' } } ) : curMapObj ); // What: Slot Active Set. Why: This is the actual step-start transition for this one slot. How: This patches just this slot's own status to 'active', leaving every other slot's own record untouched.

				await new Promise( ( resProFun ) => setTimeout( resProFun, perSteNum ) ); // What: Step Wait. Why: Each slot's own active phase needs to actually be visible for a beat before settling. How: This awaits perSteNum.

				setGenMapObj( ( curMapObj ) => curMapObj ? ( { ...curMapObj, [ curSloObj.picStr ] : { ...curMapObj[ curSloObj.picStr ], staStr : 'settled' } } ) : curMapObj ); // What: Slot Settled Set. Why: This is the actual step-end transition for this one slot. How: This patches just this slot's own status to 'settled'.


			}



			await new Promise( ( resProFun ) => setTimeout( resProFun, durMilFun( 'p03' ) ) ); // What: Landing Wait. Why: The last slot's landing bounce must finish before the real cards replace the loaders, or its own bounce is cut short. How: This waits the same p03 duration step the bounce keyframes play over. // Duration Base Plus 3 ~= 366.9ms


		}



		// #region nexEntArr

		/**
		 * nexEntArr = Next Entry Array
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


			...carEntArr, // What: Carried Entries Spread. Why: A still-open non-daily entry persists verbatim (the store unwraps each _carry record). How: This spreads carEntArr in first.
			...daoCarArr, // What: Day-Off Cards Spread. Why: Every triggered conditional's own card becomes a real entry. How: This spreads daoCarArr in next.
			...empEasArr, // What: Charging Cards Spread. Why: Every empty ease-up picker's own charging card becomes a real entry. How: This spreads empEasArr in next.

			...newPicArr.map( ( curPikObj ) => ( { // What: Fresh Entries Spread. Why: Every fresh pick becomes a real entry, with its value/weight changes staged as pending until it is checked off. How: This maps each pick record to an entry-shaped object.


				itemId   : curPikObj.ideStr, // What: Item Id. Why: The entry shows the picked item. How: This passes the pick record's own item id.
				pickerId : curPikObj.picStr, // What: Picker Id. Why: The entry belongs to its picker. How: This passes the pick record's own picker id.

				pending : { // What: Pending. Why: Nothing about the item changes until the entry is marked done. How: This stages every mutation the pick produced.


					bumpPick    : true,                    // What: Bump Pick. Why: A checked-off pick counts toward the item's own pick stats. How: This asks the store to bump them on completion.
					depletedEnd : curPikObj.resObj.depBoo, // What: Depleted End. Why: An ease-down item may have just run out. How: This passes the pick result's own depletion flag.
					pickedId    : curPikObj.ideStr,        // What: Picked Id. Why: The store needs to know which item these mutations belong to. How: This passes the picked item's own id.
					pickerPatch : curPikObj.resObj.patObj, // What: Picker Patch. Why: Some modes update the picker itself on a pick. How: This passes the pick result's own picker patch.
					updates     : curPikObj.resObj.updArr  // What: Updates. Why: The per-item value/weight changes wait for completion. How: This passes the pick result's own update list.


				},

				...( curPikObj.perStr ? { periodKey : curPikObj.perStr } : {} ) // What: Period Key Spread. Why: A non-daily pick belongs to one specific period. How: This adds a periodKey only when the pick record has one.


			} ) )


		];

		// #endregion nexEntArr



		// #region Departing Row Detection

		/**
		 * tab-today.jsx = Departing Row Detection
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

		const keeIdeSet = new Set( carEntArr.map( ( curCarObj ) => curCarObj._carry ? curCarObj.entry.eid : curCarObj.eid ) ); // What: Keep Identifier Set. Why: A carried entry's own eid must never be treated as departing. How: This reads each carEntArr member's own eid (unwrapping the _carry marker where needed).
		const nexDaoSet = new Set( daoCarArr.map( ( curDaoObj ) => curDaoObj.conditionalId ) );                                // What: Next Day-Off Set. Why: A day-off card's own departure is judged by whether its conditional still produces one, not by eid. How: This collects every fresh day-off card's own conditionalId.


		const depIdeArr = ( staAppObj.today.entries || [] ) // What: Departing Identifier Array. Why: This is the actual list of eids about to be removed, needing their own exit animation first. How: This filters every current entry down to the ones matching neither exclusion above.
			.filter( ( curEntObj ) => {                     // What: Departing Filter. Why: Only entries this generation is about to replace should play an exit animation. How: This keeps carried entries, keeps still-produced day-off cards, and flags any other entry whose picker produced nothing this time.


				if ( keeIdeSet.has( curEntObj.eid ) ) return false; // What: Kept Entry Guard. Why: A carried entry survives the generation untouched. How: This keeps it out of the departing list.



				if ( curEntObj.kind === 'dayoff' ) return !nexDaoSet.has( curEntObj.conditionalId ); // What: Day-Off Departure Check. Why: A day-off card departs only when its conditional no longer produces one. How: This flags it when nexDaoSet lacks its own conditional id.



				return !( curEntObj.pickerId && genMapRef.current && genMapRef.current[ curEntObj.pickerId ] ); // What: No Slot Return. Why: Any other entry departs when its own picker produced no slot in this generation, so nothing will replace it. How: This flags the entry unless genMapRef holds a slot for its picker.


			} )
			.map( ( curEntObj ) => curEntObj.eid ); // What: Eid Map. Why: The leaving set is keyed by entry id. How: This maps each departing entry to its own eid.

		// #endregion Departing Row Detection



		// #region Reminder Departure And Arrival Detection

		/**
		 * tab-today.jsx = Reminder Departure And Arrival Detection
		 *
		 * @summary
		 * Completed one-time reminders are purged by
		 * actStoObj.setEntFun below; playing their exit animation
		 * first, rather than letting them vanish instantly, uses the PRE-
		 * generate anchor (this genLisFun call hasn't bumped generatedAt
		 * yet), matching what's actually on screen right now. Reminders
		 * whose day arrived while the generator was overdue (this fix's
		 * whole point) weren't shown a moment ago under the old anchor,
		 * and are about to become visible under this genLisFun call's new
		 * one; diffing the two id sets lets them get the entrance
		 * animation instead of popping in.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		*/

		const oldDueArr = TAS_NAM_OBJ.visTodFun( staAppObj.tasks, staAppObj.reminderOpts, staAppObj.holidays, remAncObj );              // What: Old Due Array. Why: This is exactly what RemSecCom is showing right now, before this generation's own anchor shift. How: This calls TAS_NAM_OBJ.visTodFun with the PRE-generate remAncObj.
		const depTasArr = oldDueArr.filter( ( curTasObj ) => TAS_NAM_OBJ.isaComFun( curTasObj ) ).map( ( curTasObj ) => curTasObj.id ); // What: Departing Task Array. Why: A completed one-time reminder is about to be purged and needs its own exit animation first. How: This filters oldDueArr down to completed-once entries, then maps to just their ids.

		const oldDueSet = new Set( oldDueArr.map( ( curTasObj ) => curTasObj.id ) );                                                // What: Old Due Set. Why: The arrival diff below needs a fast membership check against the PRE-generate visible set. How: This collects every oldDueArr entry's own id.
		const newDueArr = TAS_NAM_OBJ.visTodFun( staAppObj.tasks, staAppObj.reminderOpts, staAppObj.holidays, genNowDat );          // What: New Due Array. Why: This is what becomes visible under the fresh, post-generate anchor. How: This calls TAS_NAM_OBJ.visTodFun with genNowDat as the anchor.
		const ariTasArr = newDueArr.filter( ( curTasObj ) => !oldDueSet.has( curTasObj.id ) ).map( ( curTasObj ) => curTasObj.id ); // What: Arriving Task Array. Why: This is exactly which reminders are newly visible and deserve an entrance animation. How: This filters newDueArr down to ids absent from oldDueSet.



		if ( ( depIdeArr.length || depTasArr.length ) && !( redMotFun() ) ) { // What: Departure Animation Branch. Why: A departing row/reminder needs time to actually play its own exit animation before the underlying data changes out from under it. How: This stages both leaving sets, then awaits a fixed settle period.


			if ( depIdeArr.length ) setLeaEntSet( new Set( depIdeArr ) ); // What: Leaving Entry Stage. Why: EntCarCom's own isaRmvBoo prop needs this set to know which rows are departing. How: This publishes depIdeArr into leaEntSet.



			if ( depTasArr.length ) setLeaTasSet( new Set( depTasArr ) ); // What: Leaving Task Stage. Why: RemSecCom's own leaTasSet prop needs this set to know which reminders are departing. How: This publishes depTasArr into leaTasSet.



			await new Promise( ( resProFun ) => setTimeout( resProFun, durMilFun( 'p02' ) ) ); // What: Departure Settle Wait. Why: The exit animations above need real time to actually play before the commit below. How: This awaits the p02 duration step. // Duration Base Plus 2 ~= 277.0ms


		}

		// #endregion Reminder Departure And Arrival Detection



		actStoObj.setEntFun( nexEntArr, { resetStreak : isaAutBoo } ); // What: Replace Today Entries Call. Why: This is the actual commit, writing nexEntArr as the new staAppObj.today.entries. How: This calls actStoObj.setEntFun, resetting the streak claim only for an auto-run.
		actStoObj.marGenFun();                                         // What: Mark Generated Call. Why: staAppObj.today.generatedAt (and every anchor/count derived from it) needs to reflect this fresh generation. How: This calls actStoObj.marGenFun.

		if ( cheDonBoo && APP_FEA_ARR.every( ( curFeaObj ) => feaStaObj[ curFeaObj.ideStr ] ) ) { // What: Feature Section Resolve Guard. Why: The App Features section (see shoFeaBoo's own doc comment above) is only allowed to finally disappear here, at a real generation boundary, not the instant the last tutorial resolves; checked fresh on every genLisFun call (both manual Regenerate and the Daily Generator funnel through this same function) rather than only once, so a generation that happens to land after the very last tutorial finishes is what actually hides it. How: This flips both resolution flags only once every App Feature is already done.


			actStoObj.setOnbFun( { appFeaturesEverCompleted : true, appFeaturesSectionResolved : true } ); // What: Set Onboarding Call. Why: fecDonBoo is the permanent half of this pair, see its own doc comment above for why it must never reset alongside fsrFlaBoo on a Replay Tour. How: This writes both flags true.


		}



		setLeaEntSet( new Set() ); // What: Leaving Entry Clear. Why: The commit above already applied, so nothing is departing any more. How: This clears leaEntSet back to empty.
		setLeaTasSet( new Set() ); // What: Leaving Task Clear. Why: Same reasoning as leaving entries, for reminders. How: This clears leaTasSet back to empty.

		if ( ariTasArr.length && !( redMotFun() ) ) { // What: Arrival Animation Branch. Why: A newly-visible reminder deserves its own brief entrance flourish instead of popping in silently. How: This stages ariTasSet, then clears it again shortly after.


			setAriTasSet( new Set( ariTasArr ) ); // What: Arriving Task Set. Why: Newly-visible reminders play a brief arrival animation. How: This stores their ids in ariTasSet.

			setTimeout( () => setAriTasSet( new Set() ), durMilFun( 'p03' ) ); // What: Arrival Clear Timeout. Why: The arrival animation only lasts its own p03 duration step. How: This empties ariTasSet once it finishes. // Duration Base Plus 3 ~= 366.9ms


		}



		setGenActBoo( false );     // What: Generate Active Clear. Why: The cascade has now fully finished. How: This flips genActBoo back to false.
		setGenMapObj( null );      // What: Generate Map Clear. Why: No LoaCarCom needs to render any more once the commit has landed. How: This clears genMapObj back to null.
		genMapRef.current = null;  // What: Generate Map Reference Clear. Why: The synchronous mirror must clear alongside the state it mirrors. How: This clears genMapRef.
		genBusRef.current = false; // What: Generate Busy Clear. Why: A future call is now free to proceed. How: This clears genBusRef.
		setConGenBoo( false );     // What: Confirm Generate Clear. Why: Any still-open confirm prompt is now moot, since the generation it was confirming has already run. How: This clears conGenBoo.


	};

	// #endregion genLisFun


	const genRefObj = React.useRef( genLisFun ); // What: Generate Reference Object. Why: The onboarding tour's own "Generate now" step needs to call the LATEST genLisFun closure directly, skipping the footer's own replace-confirmation dialog. How: This is kept in sync by the line just below on every render.


	genRefObj.current = genLisFun; // What: Generate Reference Update. Why: Every render's own fresh genLisFun closure must replace whatever this ref held before. How: This overwrites genRefObj.current unconditionally.

	React.useEffect( () => { window.__emlGenerate = () => genRefObj.current && genRefObj.current(); }, [] ); // What: Global Generate Expose Effect. Why: The onboarding tour drives generation through this documented window global (see this file's own "Runtime globals on window" convention). How: This assigns a thin wrapper calling genRefObj's own current function, once on mount.

	// #endregion Regenerate



	// #region Daily Auto-Generator Effect

	/**
	 * tab-today.jsx = Daily Auto-Generator Effect
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
	 * genLisFun) plus the boundary check prevent any double run.
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

	React.useEffect( () => { // What: Daily Auto-Generator Effect. Why: See the doc comment just above. How: This checks the run-time boundary immediately and then once a minute, generating a fresh list whenever the last generation predates it.


		const daiRecObj = staAppObj.daily || {}; // What: Daily Record Object. Why: Every check below reads this same resolved daily-generator config. How: This reads staAppObj.daily, falling back to an empty object.


		if ( ( daiRecObj.mode || 'auto' ) !== 'auto' ) return; // What: Not Auto Mode Guard. Why: A manual-only daily generator must never run itself. How: This bails out of the effect entirely unless daiRecObj.mode resolves to 'auto'.



		const cheGenFun = () => { // What: Check Generate Function. Why: This is the actual boundary check, run both immediately and on a recurring interval below. How: This resolves the most recent run-time boundary and calls genRefObj's own current function only when this period hasn't been generated yet.


			if ( genBusRef.current ) return; // What: Already Generating Guard. Why: A cascade already in flight must not be double-triggered. How: This bails out early while genBusRef is already true.



			if ( !staAppObj.pickers || !staAppObj.pickers.length ) return; // What: No Pickers Guard. Why: Nothing runs daily at all without at least one picker. How: This bails out early when staAppObj.pickers is empty or missing.



			const cheNowDat = new Date(); // What: Check Now Date. Why: The boundary math below needs "now" as a real Date. How: This is a fresh Date, read once.

			const [ runHouNum, runMinNum ] = ( daiRecObj.runTime || '04:00' ).split( ':' ).map( Number ); // What: Run Hour/Minute Number. Why: The boundary below is built from the configured run time's own hour and minute. How: This splits daiRecObj.runTime (or its '04:00' default) on ':' and parses both halves as numbers.

			const bouDatObj = new Date( cheNowDat ); // What: Boundary Date Object. Why: The most recent occurrence of the run time needs its own mutable Date to adjust below. How: This starts as a copy of cheNowDat.


			bouDatObj.setHours( runHouNum, runMinNum, 0, 0 ); // What: Boundary Hours Set. Why: This pins bouDatObj to TODAY's own run time, before the day-back adjustment below. How: This sets bouDatObj's own hours/minutes/seconds/ms.

			if ( bouDatObj > cheNowDat ) bouDatObj.setDate( bouDatObj.getDate() - 1 ); // What: Day-Back Adjustment. Why: If today's own run time hasn't happened yet, the most recent occurrence was actually yesterday's. How: This subtracts 1 day from bouDatObj only when it is still in the future relative to cheNowDat.



			const genDatObj = staAppObj.today && staAppObj.today.generatedAt ? new Date( staAppObj.today.generatedAt ) : null; // What: Generated Date Object. Why: The already-generated check below needs the last real generation as a comparable Date. How: This reads staAppObj.today.generatedAt, or null when it has never been set.


			if ( genDatObj && genDatObj >= bouDatObj ) return; // What: Already Generated Guard. Why: A generation already at or after the current boundary means this period is already satisfied. How: This bails out early when genDatObj exists and is not older than bouDatObj.



			if ( genRefObj.current ) { // What: Trigger Branch. Why: Everything above has now confirmed this period genuinely needs generating. How: This calls genRefObj's own current function with autBoo true, then fires a best-effort notification.


				genRefObj.current( { autBoo : true } ); // What: Auto Generate Call. Why: This is the actual trigger. How: This calls genRefObj.current with { autBoo: true }.



				try { if ( NOT_NAM_OBJ ) Promise.resolve( NOT_NAM_OBJ.genNotFun() ).catch( () => {} ); } // What: Notification Attempt. Why: A post-hoc notice is enough since the list is already built by the time the user could ever see it; suppressed when the app is visible/focused, and a failed notification must never break the run. How: This calls NOT_NAM_OBJ.genNotFun(), swallowing any rejection/thrown error.

				catch { } // What: Notification Failure Swallow. Why: A failed notice must never break the generation it follows. How: This intentionally does nothing.


			}


		};


		cheGenFun(); // What: Initial Check Call. Why: An app opened well after the run time needs this checked immediately, not just on the next minute tick. How: This invokes cheGenFun once, synchronously.

		const cheIntNum = setInterval( cheGenFun, 60000 ); // What: Check Interval Number. Why: An app left open across the run-time boundary still needs to catch it. How: This re-runs cheGenFun once a minute.



		return () => clearInterval( cheIntNum ); // What: Effect Cleanup Return. Why: The interval must not outlive this effect run. How: This clears cheIntNum.


	}, [ staAppObj.daily, staAppObj.today && staAppObj.today.generatedAt, staAppObj.pickers.length ] ); // What: Effect Dependency Array. Why: A changed daily-generator config, a fresh generation, or the picker count itself all need this effect to re-evaluate. How: Each of these 3 can change whether/when the next auto-run should fire.

	// #endregion Daily Auto-Generator Effect



	// #region Generation Slot Order

	const sloGroObj = React.useMemo( () => { // What: Slot Group Object. Why: While generating, a group with no entries yet but an incoming slot still needs somewhere to host its own placeholder loader, or the card would only pop in at commit. How: This is only ever populated while genActBoo/genMapObj hold, keyed by group name.


		if ( !genActBoo || !genMapObj ) return {}; // What: Not Generating Guard. Why: Outside an active cascade there is nothing to compute here at all. How: This returns an empty object early unless both conditions hold.



		const curEntArr = staAppObj.today.entries || [];                                                                                               // What: Current Entry Array. Why: The "already on screen" checks below need today's own current entries. How: This reads staAppObj.today.entries, falling back to an empty array.
		const havPicSet = new Set( curEntArr.map( ( curEntObj ) => curEntObj.pickerId ).filter( Boolean ) );                                           // What: Have Picker Set. Why: A picker already represented by a real entry doesn't need a placeholder slot. How: This collects every current entry's own pickerId.
		const havDaoSet = new Set( curEntArr.filter( ( curEntObj ) => curEntObj.kind === 'dayoff' ).map( ( curEntObj ) => curEntObj.conditionalId ) ); // What: Have Day-Off Set. Why: A day-off card carries a conditionalId instead of a pickerId, so its own "already on screen" check needs its own set. How: This collects every current day-off entry's own conditionalId.
		const outMapObj = {}; // What: Out Map Object. Why: This is the actual { groupName: [picker, ...] } result being built. How: This is populated by the loop below and returned at the end.


		for ( const picIdeStr of Object.keys( genMapObj ) ) { // What: Generating Picker Loop. Why: Every picker with an active generation slot is a candidate for a placeholder, unless it is already represented on screen. How: This walks every key in genMapObj, filtering out already-present pickers/day-offs.


			if ( havPicSet.has( picIdeStr ) ) continue; // What: Already Present Skip. Why: A picker already on screen needs no placeholder. How: This skips picIdeStr when havPicSet already has it.



			const curSloObj = genMapObj[ picIdeStr ]; // What: Current Slot Object. Why: The day-off special case below needs this slot's own info. How: This reads genMapObj at picIdeStr.


			if ( curSloObj && curSloObj.kinStr === 'dayoff' && havDaoSet.has( curSloObj.conStr ) ) continue; // What: Already Present Dayoff Skip. Why: A day-off card already on screen (by conditional, not picker id) needs no placeholder either. How: This skips picIdeStr when both conditions hold.



			const picRecObj = ( staAppObj.pickers || [] ).find( ( curPicObj ) => curPicObj.id === picIdeStr ); // What: Picker Record Object. Why: The placeholder itself needs the real picker record to render against. How: This finds the picker matching picIdeStr.


			if ( !picRecObj ) continue; // What: Missing Picker Guard. Why: A picker id with no matching record has nothing to placeholder at all. How: This skips picIdeStr when picRecObj cannot be found.



			const groNamStr = picRecObj.group || 'Other'; // What: Group Name String. Why: The placeholder needs a real group to slot into, matching every other row's own grouping. How: This reads picRecObj.group, falling back to 'Other'.


			( outMapObj[ groNamStr ] = outMapObj[ groNamStr ] || [] ).push( picRecObj ); // What: Out Map Push. Why: This is the actual placeholder collection for this group. How: This pushes picRecObj into outMapObj's own array for groNamStr, creating it first if needed.


		}



		return outMapObj; // What: New Slot By Group Return. Why: The content column below needs this exact { groupName: [picker, ...] } shape. How: This returns the same object populated by the loop above.


	}, [ genActBoo, genMapObj, staAppObj.today.entries, staAppObj.pickers ] ); // What: Memo Dependency Array. Why: The placeholder slots only change while a generation is running or when the live entries/pickers change. How: genActBoo and genMapObj gate and supply the slots, while the entries and pickers decide which ones are already present.


	const genOrdArr = React.useMemo( () => { // What: Generate Block Order Array. Why: While generating, a group with no entries yet but an incoming slot (per sloGroObj) still needs its own section mounted to hold that placeholder, and this order must match the rendered sections exactly, since group drops resolve by position. How: This appends any such group's own name onto bloOrdArr, then drops the Page Tours block while it isn't showing.


		const extGroArr = Object.keys( sloGroObj ).filter( ( curNamStr ) => !bloOrdArr.includes( curNamStr ) ); // What: Extra Group Array. Why: This is the actual set of groups bloOrdArr is missing but sloGroObj needs. How: This filters sloGroObj's own keys down to ones bloOrdArr doesn't already include.
		const padOrdArr = extGroArr.length ? [ ...bloOrdArr, ...extGroArr ] : bloOrdArr;                        // What: Padded Order Array. Why: The content column needs the padded order whenever a placeholder group exists. How: This appends extGroArr onto bloOrdArr, or reuses bloOrdArr unchanged when there is nothing to add.
		const pagVisBoo = shoCheBoo || rptVisBoo;                                                               // What: Page Tours Visible Boolean. Why: A hidden Page Tours block renders nothing, so it must not hold a slot here, or every group drop past it would resolve to the wrong group. How: This is true while the checklist is up or a replay still has unresolved tours, the same condition as the content column's own Page Tours guard.



		return pagVisBoo ? padOrdArr : padOrdArr.filter( ( curIdeStr ) => curIdeStr !== '__pageTours' ); // What: Generate Block Order Return. Why: The content column and every group drop both need the blocks actually rendered, in order. How: This returns padOrdArr as is while Page Tours is showing, else without its own '__pageTours' sentinel.


	}, [ bloOrdArr, rptVisBoo, shoCheBoo, sloGroObj ] ); // What: Memo Dependency Array. Why: The rendered order changes when the base order, the placeholder groups, or the Page Tours block's own visibility changes. How: bloOrdArr is the base, sloGroObj supplies the extra groups, and shoCheBoo/rptVisBoo decide whether Page Tours keeps its slot.


	shoOrdRef.current = genOrdArr; // What: Shown Order Set. Why: groDraFun's own onDroOrdFun needs to resolve a drop's own DOM-position indices against whatever order was ACTUALLY rendered, which is genOrdArr, not the unpadded bloOrdArr. How: This overwrites shoOrdRef on every render.

	// #endregion Generation Slot Order



	// #region Empty-State Calls To Action

	/**
	 * tab-today.jsx = Empty-State Calls To Action
	 *
	 * @summary
	 * New-user empty-state calls to action for "no pickers at all" and
	 * "pickers exist but nothing runnable today".
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const touBusObj = useEmlTouFun(); // What: Tour Bus Object. Why: Several onboarding-adjacent empty-state/create-flow checks below need to read the shared tour bus's own live fields. How: This calls useEmlTouFun when it exists, otherwise falls back to an empty object.

	const onbDonBoo = ONB_CHE_OBJ.cheStaFun( staAppObj ).comBoo;    // What: Onboarding Done Boolean. Why: This replaces the old onboarding.dismissed flag (which only ever got set by the now-removed "Get started" checklist, so it was permanently stuck false); derived instead of stored, see onboarding-checklist.js for what counts as done. How: This calls ONB_CHE_OBJ.cheStaFun and reads its own cmtEdiBoo field.
	const onbCreBoo = !onbDonBoo && staAppObj.pickers.length === 0; // What: Onboarding Create Boolean. Why: This force-shows the create-picker onboarding card whenever onboarding isn't complete and the user has no pickers yet; a future "Create your first picker" mini-tour will need an equivalent force-render once it exists, keyed off its own step numbering. How: This is true only while onboarding isn't complete AND the user has no pickers at all.
	const notTouBoo = touBusObj.touPhaStr !== 'tour';               // What: Not Tour Boolean. Why: Every empty state below stays hidden while a guided tour is driving the page. How: This is true unless the tour bus reports the tour phase.
	const zerPicBoo = staAppObj.pickers.length === 0;               // What: Zero Picker Boolean. Why: The "no pickers yet" empty state only applies with zero pickers. How: This checks the picker count.



	// #region onbEmpBoo

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

	const onbEmpBoo = !onbCreBoo && notTouBoo && zerPicBoo; // What: Onboarding Empty Boolean. Why: See the doc comment just above. How: This is true when the create card isn't showing, no tour is running, and there are no pickers.

	// #endregion onbEmpBoo



	// #region idlTodBoo

	/**
	 * idlTodBoo = Idle Today Boolean
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

	const idlTodBoo = React.useMemo( () => { // What: Idle Today Boolean. Why: See the doc comment just above. How: This is true when pickers exist but none of them is set to run today.


		if ( staAppObj.pickers.length === 0 ) return false; // What: No Pickers Guard. Why: This specific empty state only applies once real pickers exist at all. How: This returns false early when staAppObj.pickers is empty.



		const cheNowDat = new Date();                                             // What: Check Now Date. Why: The weekday/holiday gates below both need a single consistent "now". How: This is a fresh Date, read once.
		const dowTodNum = cheNowDat.getDay();                                     // What: Day-Of-Week Today Number. Why: The weekday gate below is checked against this. How: This reads cheNowDat.getDay().
		const holNowBoo = HOL_NAM_OBJ.holDatFun( staAppObj.holidays, cheNowDat ); // What: Holiday Now Boolean. Why: The holiday gate below is checked against this. How: This calls HOL_NAM_OBJ.holDatFun with staAppObj.holidays and cheNowDat.



		return !staAppObj.pickers.some( ( curPicObj ) => { // What: Runnable Picker Check. Why: A single picker able to run today means this empty state doesn't apply. How: This tests every picker against the four gates below.


			const isaVisBoo = !curPicObj.hidden;                                                                    // What: Is-A Visible Boolean. Why: A still-hidden sample picker never runs. How: This negates the hidden flag.
			const isaDaiBoo = staAppObj.daily.pickerIds.includes( curPicObj.id );                                   // What: Is-A Daily Boolean. Why: Only pickers in the daily generator run on their own. How: This checks the daily picker list.
			const schTodBoo = !Array.isArray( curPicObj.daysOfWeek ) || curPicObj.daysOfWeek.includes( dowTodNum ); // What: Scheduled Today Boolean. Why: A picker limited to certain weekdays skips the others. How: This is true with no weekday list, or when today is in it.
			const holOkaBoo = !( curPicObj.skipHolidays && holNowBoo );                                             // What: Holiday Okay Boolean. Why: A picker set to skip holidays doesn't run on one. How: This is false only when the picker skips holidays and today is one.



			return isaVisBoo && isaDaiBoo && schTodBoo && holOkaBoo; // What: Runnable Return. Why: The picker runs today only when every gate passes. How: This returns their combination.


		} ); // What: No Runnable Picker Return. Why: This is the actual check every branch above feeds into. How: This is true only when NO picker satisfies every one of the 4 conditions (visible, in the daily generator, scheduled today, not sitting out today's holiday).


	}, [ staAppObj.pickers, staAppObj.daily.pickerIds, staAppObj.holidays ] ); // What: Memo Dependency Array. Why: The answer only changes when a picker, the daily picker list, or the holiday list changes. How: Each of the three feeds one of the gates above.

	// #endregion idlTodBoo


	const hasTutBoo = shoCheBoo;                                                       // What: Has Tutorial Cards Boolean. Why: idlTodBoo's own visibility is suppressed while the mini-tour checklist is still up (any launcher card, checked or not, until cheDonBoo), since the page isn't actually empty then, it's full of tutorial cards instead of real picks; reappears normally once the checklist concludes and there's still genuinely nothing to run. How: This is just shoCheBoo, given its own name here for readability at the call site below.
	const zerEntBoo = todEntArr.length === 0;                                          // What: Zero Entry Boolean. Why: The idle empty state only replaces an empty list. How: This checks the entry count.
	const shoIdlBoo = !onbCreBoo && notTouBoo && idlTodBoo && zerEntBoo && !hasTutBoo; // What: Show Idle Boolean. Why: This is the actual final gate the JSX below renders from. How: This combines every condition above: not the create card, not mid-tour, no runnable picker, no entries at all, and no tutorial cards masking the emptiness.


	const begCreFun = () => { // What: Begin Create Function. Why: The empty-state's own CTA needs to jump to Pickers with the create form already open and prefilled. How: This publishes a staCreObj request onto the shared tour bus, then navigates to the Pickers tab.


		emlTouObj.set( { staCreObj : { focusName : true, name : 'Chores', step : 1 } } ); // What: Start Create Publish. Why: The Pickers tab opens its create form when it sees this request. How: This asks for step 1, prefilled as Chores, with the name field focused.

		if ( onNavTabFun ) onNavTabFun( 'picker' ); // What: Pickers Tab Navigate. Why: Picker creation happens on the Pickers tab. How: This switches tabs when a navigator was supplied.


	};

	// #endregion Empty-State Calls To Action



	// #region Mini-Tour Launch State

	/**
	 * tab-today.jsx = Mini-Tour Launch State
	 *
	 * @summary
	 * Which reminder mini-tour's intro modal (or walkthrough) is
	 * currently showing, null when none is. Reminder tours never leave
	 * Today, so this stays local here; picker tours AND page tours can
	 * navigate to another tab (a picker tour's Step 1 highlights the
	 * Pickers nav button; a page tour now can too, e.g. the Pickers page
	 * tour's own Step 2+), which would unmount this component along with
	 * them, so both live at the app level instead, see app.jsx's own
	 * actPicStr/actPagStr and this component's own
	 * onStaPicFun/onStaPagFun props. Seeded from a persisted
	 * activeTour on first mount (a reload) so the tour resumes instead of
	 * silently vanishing, mirroring app.jsx's own seeding. activeTour.id
	 * only encodes the variant ('reminder-once'/'reminder-recurring'),
	 * not the task id, so it is mapped back via the same taskId pairing
	 * RemTouCom's own varKeyStr prop uses below.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const [ minTouObj, setMinTouObj ] = React.useState( () => { // What: Mini Tour Object And Setter. Why: See the doc comment just above. How: This lazily resumes a reminder mini-tour saved in onboarding.activeTour, otherwise starts null.


		const savTouObj = staAppObj.onboarding && staAppObj.onboarding.activeTour; // What: Saved Tour Object. Why: This is the persisted record of whichever onboarding tour (if any) was mid-progress on last save. How: This reads staAppObj.onboarding.activeTour.


		if ( !savTouObj || typeof savTouObj.id !== 'string' || !savTouObj.id.startsWith( 'reminder-' ) ) return null; // What: Non-Reminder Guard. Why: Only a "reminder-" prefixed activeTour id belongs to this state. How: This returns null early unless savTouObj holds a real, "reminder-"-prefixed id.



		const varKeyStr = savTouObj.id.slice( 'reminder-'.length ); // What: Variant Key String. Why: The specific reminder variant (once/recurring) still needs mapping back to a concrete sample task id below. How: This strips the 'reminder-' prefix off savTouObj's own id.



		return { ideStr : varKeyStr === 'once' ? 'tk_ob_meds' : 'tk_ob_trash', kinStr : 'reminder' }; // What: Resumed Mini-Tour Return. Why: The caller needs a real { ideStr, kinStr } pair to resume against. How: This maps 'once' to the meds sample task, everything else to the trash sample task.


	} );


	// #region staTouFun

	/**
	 * staTouFun = Start Mini-Tour Function
	 *
	 * @summary
	 * The single dispatcher behind every launcher card's Play button and row
	 * click. Picker, page and app-feature tours are started at the app level
	 * through their own props; a reminder mini-tour is staged locally on this tab
	 * instead.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param touKinStr - Tour Kind String: Which kind of tour to start, e.g.
	 *                    'picker' or 'pageTour'.
	 * @param touIdeStr - Tour Identifier String: The id of the tour to start.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * staTouFun( 'pageTour', touIdeStr ) // => void
	 * ```
	 *
	*/

	const staTouFun = ( touKinStr, touIdeStr ) => { // What: Start Mini-Tour Function. Why: Every launcher card's own Play button (or row click) funnels through this one dispatcher, since which state it actually starts depends on touKinStr. How: This dispatches picker/pageTour/appFeature tours up to the app level, otherwise stages a local reminder mini-tour.


		if ( touKinStr === 'picker' ) onStaPicFun( touIdeStr ); // What: Picker Tour Branch. Why: A picker mini-tour runs at the app level, since its steps leave the Today tab. How: This calls onStaPicFun with the tour's own id.

		else if ( touKinStr === 'pageTour' ) onStaPagFun( touIdeStr ); // What: Page Tour Branch. Why: A page tour also runs at the app level. How: This calls onStaPagFun with the tour's own id.

		else if ( touKinStr === 'appFeature' ) onStaFeaFun( touIdeStr ); // What: App Feature Branch. Why: An App Features tutorial also runs at the app level. How: This calls onStaFeaFun with the feature's own id.

		else setMinTouObj( { ideStr : touIdeStr, kinStr : touKinStr } ); // What: Local Tour Branch. Why: A reminder mini-tour runs inside Today itself. How: This stores the tour's own kind and id in minTouObj, which mounts RemTouCom.


	};

	// #endregion staTouFun

	// #endregion Mini-Tour Launch State



	// #region Launcher Uncheck Handlers

	const uncTutFun = ( touIdeStr ) => actStoObj.setCarFun( touIdeStr, null ); // What: Uncheck Tutorial Function. Why: This un-resolves an already-resolved launcher card (skipped/cancelled/finished) back to pending, so its mini-tour can be redone; it never touches the sample itself, see onboarding-checklist.js. How: This calls actStoObj.setCarFun with a null patch.
	const uncFeaFun = ( feaIdeStr ) => actStoObj.setFeaFun( feaIdeStr, null ); // What: Uncheck Feature Function. Why: Same idea as uncTutFun, but for App Features, which live in their own map rather than the checklist, see onboarding/app-features.jsx's own header comment for why. How: This calls actStoObj.setFeaFun with a null patch.

	// #endregion Launcher Uncheck Handlers



	// #region Closing Generate Card

	/**
	 * tab-today.jsx = Closing Generate Card
	 *
	 * @summary
	 * The closing "Generate a real list" card, see onboarding-
	 * checklist.js. Actionable once every other checklist item is
	 * resolved AND at least one picker was actually finished
	 * (onbReaBoo), so there's always something real for the generator to
	 * draw from.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const onbReaBoo = ONB_CHE_OBJ.reaGenFun( staAppObj );                // What: Onboarding Ready Boolean. Why: See the doc comment just above. How: This calls ONB_CHE_OBJ.reaGenFun.
	const genResBoo = !!ONB_CHE_OBJ.entLooFun( staAppObj, ONB_GII_STR ); // What: Generate Resolved Boolean. Why: Both the card's own visual state and the effect further below need to know whether the Generate item has already resolved. How: This checks ONB_CHE_OBJ for an existing entry against ONB_GII_STR.

	const onGenCarFun = () => { if ( onbReaBoo ) actStoObj.setCarFun( ONB_GII_STR, { status : 'finished' } ); }; // What: On Generate Card Function. Why: This is the actual click handler for the closing Generate card. How: This resolves the Generate item only while onbReaBoo allows it.

	// #endregion Closing Generate Card



	// #region Generate Card Explanation

	/**
	 * tab-today.jsx = Generate Card Explanation
	 *
	 * @summary
	 * Names exactly what's still missing, singular/plural and "and" both
	 * adjusted to whichever of the two requirements (tutorials, a real
	 * picker) is actually still outstanding, see ONB_CHE_OBJ's own
	 * othRemFun and reaPicFun. Once nothing is missing (onbReaBoo), this
	 * "still missing" framing no longer applies at all, so it's a
	 * completely separate sentence, not a 0-item case of the same
	 * template.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const onbRmnNum = ONB_CHE_OBJ.othRemFun( staAppObj );                                                        // What: Onboarding Remaining Number. Why: See the doc comment just above. How: This calls ONB_CHE_OBJ.othRemFun.
	const neePicBoo = ONB_CHE_OBJ.reaPicFun( staAppObj ) < 1;                                                    // What: Needs Picker Boolean. Why: See the doc comment just above. How: This checks ONB_CHE_OBJ.reaPicFun against a floor of 1.
	const tutClaStr = onbRmnNum > 0 ? `${ onbRmnNum } more tutorial${ onbRmnNum > 1 ? 's' : '' }` : null;        // What: Tutorial Clause String. Why: This is the tutorials half of the combined "still missing" sentence, correctly pluralized. How: This formats onbRmnNum, or null when nothing is outstanding on this side.
	const picClaStr = neePicBoo ? 'at least 1 picker' : null;                                                    // What: Picker Clause String. Why: This is the picker half of the combined sentence. How: This is a fixed phrase, or null when a real picker already exists.
	const joiClaStr = tutClaStr && picClaStr ? `${ tutClaStr } and ${ picClaStr }` : ( tutClaStr || picClaStr ); // What: Joined Clause String. Why: Both halves may be missing at once, needing "and" to join them, or only one may be. How: This joins both clauses when both exist, otherwise falls back to whichever one does.


	const genExpStr = onbReaBoo // What: Generate Explanation String. Why: The Generate card's own body text depends on whether the checklist is finished. How: This picks the ready message or the "still missing" sentence.
		? 'Everything is completed! Click this button to generate your first, real todo list.'                   // What: Ready Branch. Why: Every requirement is met. How: This invites the user to generate.
		: `Finish ${ joiClaStr } to enable this functionality and create your first, real generated todo list.`; // What: Not Ready Branch. Why: The Generate card must say exactly what is still missing. How: This interpolates joiClaStr into the fixed template.

	// #endregion Generate Card Explanation



	// #region Generate Card Auto-Scroll

	/**
	 * tab-today.jsx = Generate Card Auto-Scroll
	 *
	 * @summary
	 * Once every other checklist item is resolved, brings the now-
	 * pulsing Generate card into view on its own, since it's likely below
	 * the fold by the time the last tutorial finishes (every other card
	 * is still above it in the list). Same offset-scroll approach as
	 * jumGroFun above (--sti-top-hei, which already accounts for the
	 * group rail stacking below the header on mobile) rather than
	 * scrollIntoView, so the card's own top lands just under the sticky
	 * header/rail on small viewports instead of scrollIntoView's
	 * block:'center' cutting it off behind them.
	 *
	 * Driven off staAppObj.onboarding.generateScrollPending (set in
	 * store.js's setCarFun the instant onbReaBoo flips false to
	 * true), NOT a local "did I see it flip" ref: the last checklist item
	 * is very often resolved from a mini-tour or Page Tour running on a
	 * DIFFERENT tab, which unmounts this whole component for the tour's
	 * duration. A ref would miss that transition entirely (it only
	 * compares against whatever onbReaBoo already IS on this fresh mount,
	 * never having seen the false state at all) and the scroll would
	 * silently never fire, confirmed via the user's own repro: skipping a
	 * tutorial from its OWN opening modal (still on Today, this component
	 * never unmounts) scrolled correctly, but skipping from any later
	 * step (which had already navigated away) didn't.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const genCarRef = React.useRef( null );                                                     // What: Generate Card Reference. Why: The scroll effect below needs a direct DOM handle on the Generate card itself. How: This is attached to the card's own ref prop further down.
	const scrPenBoo = !!( staAppObj.onboarding && staAppObj.onboarding.generateScrollPending ); // What: Scroll Pending Boolean. Why: See the doc comment just above. How: This reads staAppObj.onboarding.generateScrollPending.


	React.useEffect( () => { // What: Generate Card Scroll Effect. Why: See the doc comment just above. How: This waits two animation frames for layout to settle, scrolls the Generate card under the sticky header, then clears the pending flag.


		if ( !scrPenBoo ) return; // What: Not Pending Guard. Why: There is nothing to scroll to while nothing is actually pending. How: This bails out of the effect entirely when scrPenBoo is false.



		// #region Double Animation Frame Wait

		/**
		 * tab-today.jsx = Double Animation Frame Wait
		 *
		 * @summary
		 * A double rAF, not a direct call, since the last checklist item
		 * is very often resolved by a tour's own Skip/Done, and EVERY
		 * tour funnels both through onboarding/tour-runner.jsx's
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


				const genCurEle = genCarRef.current;                                             // What: Generate Current Element. Why: Every measurement below reads this same node. How: This reads genCarRef.current.
				const maiScrEle = genCurEle?.closest( '[data-element-name-hook~="appConMai"]' ); // What: Main Scroll Element. Why: The scroll target needs the real scroll container. How: This walks up from genCurEle to its nearest .main ancestor.
				const tabCurEle = genCurEle?.closest( '[data-element-name-hook~="todTabDiv"]' ); // What: Tab Current Element. Why: The sticky offset custom property lives on the tab's own root. How: This walks up from genCurEle to its nearest .tab--today ancestor.


				if ( genCurEle && maiScrEle && tabCurEle ) { // What: All Found Branch. Why: The scroll can only happen once every one of these 3 exists. How: This computes and applies the scroll only when all 3 are present.


					const stiHeiNum = parseInt( getComputedStyle( tabCurEle ).getPropertyValue( '--sti-top-hei' ) ) || rhyPxlFun( 'p09' ); // What: Sticky Height Number. Why: The scroll target must land just beneath the sticky header/rail. How: This reads the --sti-top-hei custom property, falling back to the p09 rhythm step. // Vertical Rhythm Base Plus 9 ~= 183.074px
					const tarOffNum = genCurEle.offsetTop - stiHeiNum - rhyPxlFun( 'bas' );                                                // What: Target Offset Number. Why: This is the actual scroll position that lands the card's own top just beneath the sticky offset, with a small base-step pad. How: This subtracts stiHeiNum and a base rhythm step from genCurEle's own offsetTop. // Vertical Rhythm Base ~= 14.572px
					const scrBehStr = redMotFun() ? 'auto' : 'smooth';                                                                     // What: Scroll Behavior String. Why: Reduced-motion users should jump instead of watching a smooth scroll. How: This is 'auto' under reduced motion, otherwise 'smooth'.


					maiScrEle.scrollTo( { behavior : scrBehStr, top : tarOffNum } ); // What: Scroll To Call. Why: This is the actual scroll. How: This scrolls maiScrEle to tarOffNum, smoothly unless reduced motion is preferred.


				}



				actStoObj.setOnbFun( { generateScrollPending : false } ); // What: Clear Pending Call. Why: This scroll must only ever fire once per pending flag. How: This writes generateScrollPending back to false regardless of whether the scroll itself actually ran.


			} );


		} );

		// #endregion Double Animation Frame Wait



		return () => { // What: Effect Cleanup Return. Why: Neither queued frame may outlive this effect run. How: This cancels both.


			cancelAnimationFrame( rafOneNum ); // What: First Frame Cancel. Why: The outer queued frame must not run after this effect ends. How: This cancels rafOneNum.
			cancelAnimationFrame( rafTwoNum ); // What: Second Frame Cancel. Why: The inner queued frame must not run either. How: This cancels rafTwoNum.


		};


	}, [ scrPenBoo ] ); // What: Effect Dependency Array. Why: This effect only ever needs to re-run when scrPenBoo itself flips. How: scrPenBoo is exactly the flag this whole effect reacts to.

	// #endregion Generate Card Auto-Scroll



	// #region Checklist Conclusion

	/**
	 * tab-today.jsx = Checklist Conclusion
	 *
	 * @summary
	 * Resolving the Generate item pushes donCouNum up to equal totCouNum
	 * (every other item was already resolved), which triggers the
	 * existing completion-celebration effect above automatically,
	 * nothing extra needed to fire it. This effect only owns what happens
	 * AFTER: let the celebration play, animate every checklist card out
	 * together, then conclude the checklist and hand off to a completely
	 * normal genLisFun call.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	const [ cheExiBoo, setCheExiBoo ] = React.useState( false ); // What: Checklist Exiting Boolean And Setter. Why: See the doc comment just above. How: This is staged true by the effect below, played out on every launcher card, then cleared once the checklist actually concludes.

	const preResRef = React.useRef( genResBoo ); // What: Previous Resolved Reference. Why: The effect below needs last render's own genResBoo to detect a genuine false-to-true transition. How: This starts at the initial genResBoo and is overwritten at the end of that same effect.


	React.useEffect( () => { // What: Checklist Conclusion Effect. Why: See the doc comment just above. How: This plays the checklist's own exit, unhides every real item, concludes the checklist, then regenerates the list, all on a genuine false-to-true genResBoo transition.


		if ( genResBoo && !preResRef.current ) { // What: Fresh Resolve Branch. Why: The whole conclusion sequence only ever plays on a genuine false-to-true transition. How: This checks genResBoo against preResRef's own prior value.


			const redMotBoo = redMotFun();                          // What: Reduced Motion Boolean. Why: Every timing below needs to collapse almost to nothing for a user who prefers reduced motion. How: This checks redMotFun once, reused for both timeouts below.
			const celDelNum = redMotBoo ? 200 : durMilFun( 'p09' ); // What: Celebration Delay Number. Why: The exit animation must wait for the celebration to actually finish playing first. How: This is a short reduced-motion beat or the p09 duration step that outlasts the whole celebration. // Duration Base Plus 9 ~= 1983.0ms
			const exiDelNum = redMotBoo ? 0 : durMilFun( 'p03' );   // What: Exit Delay Number. Why: The checklist's own conclusion must wait for the card-exit animation to finish too. How: This is 0 under reduced motion or the exit animation's own p03 duration step. // Duration Base Plus 3 ~= 366.9ms

			const celTimNum = setTimeout( () => setCheExiBoo( true ), celDelNum ); // What: Celebrate Timeout Number. Why: The exit animation should only start once the celebration has had its own moment first. How: This flips cheExiBoo true after celDelNum.


			const purTimNum = setTimeout( () => { // What: Purge Timeout Number. Why: The actual checklist conclusion (unhiding real pickers/tasks, flipping checklistDone, and finally regenerating) must wait for both the celebration AND the exit animation to finish. How: This runs after celDelNum plus exiDelNum combined.


				// #region Unhide Real Items

				/**
				 * tab-today.jsx = Unhide Real Items
				 *
				 * @summary
				 * Any real reminder OR picker created while the checklist was
				 * up, whether by finishing a mini-tour or just the user
				 * clicking "+"/"Add New Picker" themselves (see
				 * reminders-section.jsx's staAddFun and tab-picker.jsx's
				 * onCrePicFun, both gated on the shoCheBoo bus field), was
				 * seeded hidden so it didn't clutter the list alongside the
				 * still-open launcher cards. Surfaces them all now, right
				 * before genLisFun actually runs. Excludes the eternal samples
				 * themselves by id, which stay hidden forever.
				 *
				 * @author z4nta0 <https://github.com/z4nta0>
				 *
				*/

				staAppObj.tasks.forEach( ( curTasObj ) => { if ( curTasObj.hidden && !ONB_STI_ARR.includes( curTasObj.id ) ) actStoObj.updTasFun( curTasObj.id, { hidden : false } ); } ); // What: Real Task Unhide. Why: Real reminders created during the tutorials stay hidden until the checklist concludes. How: This unhides every hidden task that isn't a sample.

				staAppObj.pickers.forEach( ( curPicObj ) => { if ( curPicObj.hidden && !ONB_SPI_ARR.includes( curPicObj.id ) ) actStoObj.updPicFun( curPicObj.id, { hidden : false } ); } ); // What: Real Picker Unhide. Why: Real pickers created during the tutorials stay hidden until the checklist concludes. How: This unhides every hidden picker that isn't a sample.

				// #endregion Unhide Real Items

				actStoObj.finCheFun( true ); // What: Set Checklist Done Call. Why: This is the actual permanent conclusion flag. How: This calls actStoObj.finCheFun with true.
				setCheExiBoo( false );       // What: Checklist Exiting Clear. Why: The exit animation has now fully played out. How: This flips cheExiBoo back to false.



				// #region Deferred Regenerate

				/**
				 * tab-today.jsx = Deferred Regenerate
				 *
				 * @summary
				 * Deferred, and via genRefObj rather than calling genLisFun
				 * directly: the three actStoObj.* calls just above are
				 * async state updates that haven't re-rendered yet at
				 * this point in the callback, so a bare genLisFun() here
				 * would run against THIS closure's stale snapshot, where
				 * every picker/task the loop above just unhid still reads
				 * hidden:true. genLisFun's own picker loop skips anything
				 * hidden, so the real (freshly un-hidden) pickers would
				 * silently produce nothing, only reminders would show,
				 * since those render live off staAppObj.tasks rather than
				 * being baked into entries by a one-time genLisFun run.
				 * genRefObj always points at the LATEST genLisFun closure
				 * (see its own comment above); scheduling this on a new
				 * macrotask gives React a chance to flush the batched
				 * updates from the three actStoObj.* calls into a fresh
				 * render first, so by the time this fires, genRefObj's
				 * own current function sees the real state.
				 *
				 * @author z4nta0 <https://github.com/z4nta0>
				 *
				*/

				setTimeout( () => genRefObj.current(), 0 ); // What: Deferred Regenerate Call. Why: The real list should generate only after this tick's state updates settle (see the comment just above). How: This schedules genRefObj's own current generator on the next task.

				// #endregion Deferred Regenerate


			}, celDelNum + exiDelNum ); // What: Purge Delay. Why: The conclusion waits for both the celebration and the exit animation. How: This waits celDelNum plus exiDelNum.


			preResRef.current = genResBoo; // What: Previous Generate Resolved Update. Why: The next run of this effect must compare against the state that is current now. How: This overwrites preResRef with genResBoo.



			return () => { // What: Effect Cleanup Return. Why: Neither scheduled step may outlive this effect run. How: This clears both.


				clearTimeout( celTimNum ); // What: Celebration Timeout Clear. Why: The exit animation must not start after this effect ends. How: This clears celTimNum.
				clearTimeout( purTimNum ); // What: Purge Timeout Clear. Why: The checklist conclusion must not run after this effect ends. How: This clears purTimNum.


			};


		}



		preResRef.current = genResBoo; // What: Previous Generate Resolved Update. Why: Even a non-transition still needs preResRef to track the latest value for next time. How: This overwrites preResRef with the current genResBoo.


	}, [ genResBoo ] ); // What: Effect Dependency Array. Why: This effect only ever needs to re-run when genResBoo itself changes. How: genResBoo is exactly what preResRef is compared against.

	// #endregion Checklist Conclusion



	return (


		<div
			className={ cssModObj.todTabDiv }

			data-element-name-hook='todTabDiv'
		>{ /* What: Today Tab Div Element. Why: This is TabTodCom's own root wrapper. How: This renders the sticky header, the scrollable body (rail + groups + footer), and any reminder mini-tour/App Features intro overlay currently running. Its data-element-name-hook is read by Today's own scroll code. */ }


			<HelOveCom
				actModBoo={ helModBoo }
				helIteArr={ TOD_HEL_ARR }

				onCloAllFun={ helExiFun }
			/>{ /* What: Help Overlay Component. Why: Today needs its own coach-mark overlay driven by TOD_HEL_ARR. How: This is rendered whenever helModBoo is true, closed via helExiFun. */ }



			<header
				ref={ heaEleRef }

				className={ cssModObj.todPagHea }

				data-element-name-hook='todPagHea'
			>{ /* What: Today Header Element. Why: This is the sticky header every scroll-spy/offset calculation in this file measures against. How: This renders the date/streak/help row and the brand mark/title/ring row beneath it. Its data-element-name-hook is read by the tour runner's safe-area math and outside-click checks and help mode's chrome clipping. */ }


				<div className={ cssModObj.heaInnDiv }>{ /* What: Header Inner Div Element. Why: The header's own content needs an inner wrapper distinct from the sticky element itself. How: This wraps the header-left column below. */ }


					<div className={ cssModObj.heaColDiv }>{ /* What: Header Left Div Element. Why: Every piece of header content reads as one left-aligned column. How: This wraps the kicker row and the brand/title/ring row below. */ }


						<div className={ cssModObj.kicRowDiv }>{ /* What: Kicker Row Div Element. Why: The date/time and the streak/help cluster sit on one shared row. How: This wraps the kicker span and the rowRigDiv div below. */ }


							<div className={ cssModObj.pagKicDiv }>{ /* What: Kicker Div Element. Why: Today's own date and time read as one small cluster. How: This renders forDatFun and forTimFun against curNowDat. */ }


								{ forDatFun( curNowDat ) }{ /* What: Kicker Date Expression. Why: The header leads with today's own date. How: This formats curNowDat through forDatFun. */ } <span className={ cssModObj.kicTimSpa }>{ forTimFun( curNowDat ) }</span>{ /* What: Kicker Time Span Element. Why: The current time sits beside the date in its own styled span. How: This formats curNowDat through forTimFun, re-rendered every minute by the Live Clock effect. */ }


							</div>


							<div className={ cssModObj.rowRigDiv }>{ /* What: Kicker Row Right Div Element. Why: The streak badge and the help toggle read as one right-aligned cluster. How: This wraps the streak div and HelButCom below. */ }


								<div
									ref={ stkEleRef }

									className={ cssModObj.todStrDiv }

									data-element-name-hook='todStrDiv'
								>{ /* What: Streak Div Element. Why: This is the badge the streak-pulse effect above targets directly. How: This renders a flame icon plus the current streak count. Its data-element-name-hook is read by help mode's Today catalog. */ }


									<IcoSvgCom
										className={ cssModObj.strFlaSvg }

										icoNamStr='flaEle'
										sizSteStr='m01' // Vertical Rhythm Base Minus 1 = 11px
									/>{ /* What: Icon Svg Component. Why: The streak badge needs a recognizable glyph. How: This renders the 'flaEle' icon at a fixed size. */ }

									<span className={ cssModObj.strCouSpa }>{ staAppObj.streak }-day streak</span>{ /* What: Streak Text Span Element. Why: The streak count needs its own plain text alongside the flame icon. How: This renders staAppObj.streak interpolated into the fixed phrase. */ }


								</div>



								<HelButCom
									actModBoo={ helModBoo }

									onTogModFun={ () => setHelModBoo( ( curModBoo ) => !curModBoo ) }
								/>{ /* What: Help Button Component. Why: Today needs the same help-mode toggle every other tab exposes. How: This toggles helModBoo. */ }


							</div>


						</div>



						<div
							className={ cssModObj.heaLeaDiv }

							data-element-name-hook='heaLeaDiv'
						>{ /* What: Header Lead Div Element. Why: The brand mark, the title, and the completion ring read as one shared row beneath the kicker. How: This wraps all 3 below. Its data-element-name-hook is read by help mode's Stats catalog, help mode's Settings catalog, help mode's Today catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


							<button
								className={ cssModObj.braMarBut }

								data-element-name-hook='braMarBut'

								type='button'

								aria-label='Ease My Life link to go to the Today page'

								onClick={ onNavHomFun }
							>{ /* What: Brand Mark Button Element. Why: The logo also works as a shortcut back to the top of Today. How: This calls onNavHomFun on click. Logo colors are wired to the UI theme: the border and easing-checkmark use currentColor, which braMarBut sets to var(--acc-mai-col); the grid lines use var(--acc-tin-col), the same color as the Today groRaiAsi/tabbar selected backgrounds. Its data-element-name-hook is read by help mode's Stats catalog, help mode's Settings catalog, help mode's Today catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }


								<svg
									className={ cssModObj.braMarSvg }

									fill='none'
									viewBox='8 8 528 528'

									aria-hidden='true'
								>{ /* What: Logo Svg Element. Why: This draws the small square "Ease My Life" logo mark. How: This is a fixed-viewBox icon composed of a grid, a rounded-square badge outline, and a clipped glyph path. */ }{ /* Same theme-wired logo as the Today header (currentColor -> accent, grid lines -> accent-soft) so the two tabs read as one product. */ }


									<defs>{ /* What: Clip Defs Element. Why: An SVG clipPath can only be applied via a defined, referenced id, not inline. How: This holds the one clipPath definition the glyph path below references. */ }


										<clipPath
											id='braMarCli--tod'

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
											stroke      : 'var(--acc-tin-col)', // Accent Tint Color = oklch( 0.95 0.025 250 )
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

										clipPath='url(#braMarCli--tod)'
										d='M 24.467 527.792 C 67.266 416.298 77.088 228.913 172.207 434.412 C 200.739 535.77 262.562 434.412 314.873 292.51 C 381.45 120.201 450.381 44.636 528.854 24.365 C 521.725 22.337 512.215 24.365 493.193 34.5 C 369.548 105.451 295.85 292.51 234.029 363.461 C 186.473 414.14 167.451 241.831 124.651 262.102 C 101.828 270.008 60.133 375.754 24.467 527.792 Z'
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth='8'
									/>{ /* What: Glyph Path Element. Why: This is the actual squiggly "Ease My Life" brand glyph drawn inside the badge. How: This path is clipped to the rounded-square badge so its curves never spill outside it. */ }


								</svg>


							</button>


							<h1 className={ cssModObj.todTitHea }>{ /* What: Today Title Heading Element. Why: The default hero line and the "all done" celebratory line swap visibility based on isaFulBoo, but both stay mounted so the swap can animate. How: This renders both titStaSpa spans below, keyed so the done state re-plays its per-word reveal on every fresh completion. */ }


								<span
									className={ cssModObj.titStaSpa }

									aria-hidden={ isaFulBoo }
								>{ /* What: Default Title State Span Element. Why: This is the everyday hero line, visible whenever the day isn't yet complete. How: This renders the fixed "Your day, eased just for you." copy. */ }


									Your day,<br />{ ' ' }<span style={{ color : 'var(--acc-mai-col)' }}>eased</span> just for you.{ /* Accent Main Color = oklch( 0.5 0.14 250 ) */ }


								</span>

								<span
									key={ isaFulBoo ? celNonNum : 'idle' }

									className={` ${ cssModObj.titStaSpa }   ${ cssModObj.titStaSpaDone } `}

									aria-hidden={ !isaFulBoo }
								>{ /* What: Done Title State Span Element. Why: This is the celebratory line, visible only once the whole day is complete, keyed on celNonNum so it re-mounts and replays its per-word reveal on every fresh completion. How: This renders 3 individually-classed words. */ }


									<span className={` ${ cssModObj.titWorSpa }   ${ cssModObj.titWorSpa1 } `}>Your</span>{ /* What: First Title Word Span Element. Why: Each word of the celebratory line reveals on its own beat. How: This renders "Your" with the first word's own animation delay. */ }{ ' ' }

									<span className={` ${ cssModObj.titWorSpa }   ${ cssModObj.titWorSpa2 } `}>life,</span>{ /* What: Second Title Word Span Element. Why: Each word of the celebratory line reveals on its own beat. How: This renders "life," with the second word's own animation delay, followed by the line break. */ }<br />

									<span className={` ${ cssModObj.titWorSpa }   ${ cssModObj.titWorSpa3 } `}>eased!</span>{ /* What: Third Title Word Span Element. Why: Each word of the celebratory line reveals on its own beat. How: This renders "eased!" with the third word's own animation delay. */ }


								</span>


							</h1>


							<div
								ref={ rinEleRef }

								className={ cssModObj.proRinDiv }

								data-element-name-hook='proRinDiv'
							>{ /* What: Ring Div Element. Why: This is the completion ring the celebration effect above targets directly. How: This renders the SVG ring itself, its numeric label, and 3 purely decorative overlay elements the celebration effect's own CSS classes animate. Its data-element-name-hook is read by the Today page tour and help mode's Today catalog. */ }


								<svg
									className={ cssModObj.rinGraSvg }

									viewBox='0 0 36 36'
								>{ /* What: Ring Svg Element. Why: This draws the actual ring shape. How: This renders a background circle plus a foreground circle whose dash array reflects donCouNum over totCouNum. */ }


									<circle
										className={ cssModObj.rinTraCir }

										cx='18'
										cy='18'
										r='15.5'
									/>{ /* What: Ring Background Circle Element. Why: The foreground progress arc needs a full, dim track to sit on top of. How: This draws a plain full circle. */ }

									<circle
										className={ cssModObj.rinProCir }

										cx='18'
										cy='18'
										r='15.5'
										strokeDasharray={ `${ ( donCouNum / Math.max( 1, totCouNum ) ) * 97.4 }, 97.4` }
									/>{ /* What: Ring Foreground Circle Element. Why: This is the actual visible progress arc. How: This sets its own dash array to donCouNum over totCouNum, scaled to the circle's own circumference. */ }


								</svg>

								<div className={ cssModObj.rinTexDiv }>{ /* What: Ring Text Div Element. Why: The numeric label needs to sit centered over the ring itself. How: This renders donCouNum and totCouNum as a fraction. */ }


									<span className={ cssModObj.rinNumSpa }>{ donCouNum }</span>{ /* What: Ring Numerator Span Element. Why: This is the ring's own live numerator. How: This renders donCouNum directly. */ }

									<span className={ cssModObj.rinDenSpa }>/ { totCouNum }</span>{ /* What: Ring Denominator Span Element. Why: The numerator alone is meaningless without its own total. How: This renders the literal "/" plus totCouNum. */ }


								</div>

								<i
									className={ cssModObj.rinGloIta }

									aria-hidden='true'
								/>{ /* What: Ring Glow Element. Why: The ring needs a purely decorative glow layer the celebration/pulse CSS classes animate. How: This is an empty, presentation-only element. */ }

								<i
									className={ cssModObj.rinRipIta }

									aria-hidden='true'
								/>{ /* What: Ring Ripple Element. Why: The ring needs a purely decorative ripple layer for the completion celebration. How: This is an empty, presentation-only element. */ }


							</div>


						</div>


					</div>


				</div>


			</header>



			<div
				ref={ todBodRef }

				className={ cssModObj.todBodDiv }
			>{ /* What: Today Body Div Element. Why: Today manages its own centered-column body distinct from app.jsx's shared .maiInnDiv, since it needs its own flourish measurement point. How: This renders the background flourish, the Edit Mode banner (while relevant), and the whole rail/groups/footer layout below. */ }


				<BacFloCom
					meaEleRef={ todBodRef }
					tabIdeStr='today'
				/>{ /* What: Background Flourish Component. Why: Today needs the same decorative background glyphs every other tab renders behind its own centered column. How: This is passed the fixed 'today' tab id and todBodRef. */ }



				{ ( ediModBoo || banCloBoo ) && ( // What: Edit Mode Banner Visibility Check. Why: The banner needs to stay mounted through its own close animation, not just while ediModBoo itself is true. How: This renders the banner while either flag holds.


					<div
						className={` ${ cssModObj.ediBanDiv }   ${ banCloBoo ? cssModObj.ediBanDivClosing : '' } `}

						data-element-name-hook='ediBanDiv'

						role='status'
					>{ /* What: Edit Mode Banner Div Element. Why: This is the explanatory banner shown while Edit Mode is active. How: This renders the fixed explanatory copy plus a Cancel/Done pair. Its data-element-name-hook is read by the tour runner's safe-area math and help mode's chrome clipping. */ }


						<span className={ cssModObj.banMesSpa }>{ /* What: Banner Message Span Element. Why: The icon and the explanatory text read as one inline cluster. How: This wraps the grip icon and the fixed copy below. */ }


							<IcoSvgCom
								className={ cssModObj.banIcoSvg }

								icoNamStr='griEle'
								sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
							/>{ /* What: Icon Svg Component. Why: The banner needs a recognizable drag-affordance glyph alongside its own copy. How: This renders the 'griEle' icon at a fixed size. */ }

							Edit Mode allows you to drag groups and items to rearrange them or to click group names to edit them.


						</span>

						<span
							className={ cssModObj.ediBanSpa }

							data-element-name-hook='ediBanSpa'
						>{ /* What: Banner Actions Span Element. Why: The Cancel/Done pair reads as one right-aligned cluster. How: This wraps both ButBasCom elements below. Its data-element-name-hook is read by the Today page tour and help mode's Today catalog. */ }


							<ButBasCom
								data-element-name-hook='ediCanBut'

								kinValStr='ghost'
								sizValStr='sm'

								onClick={ () => cloModFun( false ) }
							>Cancel</ButBasCom>{ /* What: Button Base Component. Why: This discards every drag made during the current Edit Mode session. How: This calls cloModFun(false). Its data-element-name-hook is read by the Today page tour. */ }



							<ButBasCom
								icoNamStr='cheEle'
								kinValStr='primary'
								sizValStr='sm'

								onClick={ () => cloModFun( true ) }
							>Done</ButBasCom>{ /* What: Button Base Component. Why: This keeps every drag made during the current Edit Mode session. How: This calls cloModFun(true). */ }


						</span>


					</div>


				) }



				<div
					ref={ maiScrRef }

					className={ cssModObj.todLayDiv }
				>{ /* What: Today Layout Div Element. Why: This is the shared scroll wrapper the scroll-spy/generate/jumGroFun logic above all measure against. How: This renders the group rail and the groups/footer column side by side. */ }


					<aside
						ref={ raiEleRef }

						className={ cssModObj.groRaiAsi }

						data-element-name-hook='groRaiAsi'

						aria-label='Groups'
					>{ /* What: Group Rail Aside Element. Why: This is the sticky sidebar (or, on mobile, the horizontal pill bar) listing every block. How: This renders one rail button per bloOrdArr entry, then the App Features entry (pinned last), then the Edit Mode toggle. Its data-element-name-hook is read by the tour runner's safe-area math and outside-click checks, help mode's chrome clipping, and help mode's Today catalog. */ }


						<div className={ cssModObj.raiKicDiv }>Groups</div>{ /* What: Rail Kicker Div Element. Why: The rail needs its own small heading label. How: This renders the literal word "Groups". */ }



						<ul className={ cssModObj.raiLisUno }>{ /* What: Rail List Element. Why: Every rail button is one list item in this shared list. How: This maps bloOrdArr to one <li> per entry, dispatching by sentinel/real-group id. */ }


							{ bloOrdArr.map( ( curIdeStr ) => { // What: Rail Button Map. Why: One rail button is needed per block, dispatched by whichever sentinel or real group id curIdeStr holds. How: This returns the Reminders button, the Page Tours button (when relevant), or a real group's own button.


								if ( curIdeStr === '__reminders' ) { // What: Reminders Rail Branch. Why: The Reminders block always gets its own rail entry. How: This returns its rail item, counting done reminders plus tutorial task cards.


									return (


										<li key='__reminders'>{ /* What: Reminders List Item Element. Why: The Reminders block always gets its own rail entry. How: This wraps the Reminders rail button below. */ }


											<button
												className={` ${ cssModObj.raiGroBut }   ${ cssModObj.raiGroButReminders } `}

												data-rail-select-active={ actGroStr === '__reminders' || undefined } // What: Rail Select Active Attribute. Why: The group in view should stand out in the rail. How: This sets the presence-only attribute while this entry is the active group.

												onClick={ () => jumGroFun( '__reminders' ) }
											>{ /* What: Reminders Rail Button Element. Why: This is the actual clickable rail entry for the Reminders block. How: This scrolls to '__reminders' via jumGroFun on click. */ }


												<span className={ cssModObj.raiNamSpa }>Reminders</span>{ /* What: Rail Name Span Element. Why: The rail entry needs its own visible label. How: This renders the literal word "Reminders". */ }

												<span className={ cssModObj.raiCouSpa }>{ /* What: Rail Count Span Element. Why: The done/total pair reads as one small cluster. How: This wraps the done and "of total" spans below. */ }


													<span>{ visDonNum + tasDonNum }</span>{ /* What: Rail Done Span Element. Why: The rail pill shows how many of this block's own items are done. How: This renders the done count. */ }<span className={ cssModObj.raiTotSpa }>/{ dueTasArr.length + tasCarNum }</span>{ /* What: Rail Total Span Element. Why: The done count needs its own total beside it. How: This renders a slash and the block's own total, styled dimmer via raiTotSpa. */ }


												</span>


											</button>


										</li>


									);


								}



								if ( curIdeStr === '__pageTours' ) { // What: Page Tours Rail Branch. Why: Page Tours only ever gets a rail entry while it is actually meant to be showing. How: This returns null unless either shoCheBoo or rptVisBoo holds, otherwise the Page Tours rail button.


									if ( !shoCheBoo && !rptVisBoo ) return null; // What: Page Tours Hidden Guard. Why: The Page Tours block only renders while the checklist is up or a replay still has unresolved tours. How: This returns null otherwise.



									const touDonNum = ONB_EPT_ARR.filter( ( curTouObj ) => !!ONB_CHE_OBJ.entLooFun( staAppObj, curTouObj.ideStr ) ).length; // What: Tour Done Number. Why: The rail entry needs its own live done count. How: This counts resolved ONB_EPT_ARR entries.



									return (


										<li key='__pageTours'>{ /* What: Page Tours List Item Element. Why: Page Tours gets its own rail entry whenever it is visible at all. How: This wraps the Page Tours rail button below. */ }


											<button
												className={ cssModObj.raiGroBut }

												data-rail-select-active={ actGroStr === '__pageTours' || undefined } // What: Rail Select Active Attribute. Why: The group in view should stand out in the rail. How: This sets the presence-only attribute while this entry is the active group.

												onClick={ () => jumGroFun( '__pageTours' ) }
											>{ /* What: Page Tours Rail Button Element. Why: This is the actual clickable rail entry for the Page Tours block. How: This scrolls to '__pageTours' via jumGroFun on click. */ }


												<span className={ cssModObj.raiNamSpa }>{ pagNamStr }</span>{ /* What: Rail Name Span Element. Why: The rail entry needs its own visible (possibly user-renamed) label. How: This renders pagNamStr. */ }

												<span className={ cssModObj.raiCouSpa }>{ /* What: Rail Count Span Element. Why: The done/total pair reads as one small cluster. How: This wraps the done and "of total" spans below. */ }


													<span>{ touDonNum }</span>{ /* What: Rail Done Span Element. Why: The rail pill shows how many of this block's own items are done. How: This renders the done count. */ }<span className={ cssModObj.raiTotSpa }>/{ ONB_EPT_ARR.length }</span>{ /* What: Rail Total Span Element. Why: The done count needs its own total beside it. How: This renders a slash and the block's own total, styled dimmer via raiTotSpa. */ }


												</span>


											</button>


										</li>


									);


								}



								const curGroObj = groNamObj[ curIdeStr ]; // What: Current Group Object. Why: Every other id in bloOrdArr must resolve to a real group. How: This reads groNamObj at curIdeStr.


								if ( !curGroObj ) return null; // What: Missing Group Guard. Why: A stale id with no matching group has nothing to render at all. How: This returns null when curGroObj cannot be found.



								const curDonNum = curGroObj.entArr.filter( ( curRowObj ) => curRowObj.entRecObj.done ).length; // What: Current Done Number. Why: The rail entry needs this group's own live done count; mini-tour launcher cards count toward this the whole time they're on screen, resolved (any of the 3 ways) counting as done, same as any other card. How: This counts curGroObj's own done rows.



								return (


									<li key={ curGroObj.namStr }>{ /* What: Group List Item Element. Why: Every real group gets its own rail entry. How: This wraps the group's own rail button below. */ }


										<button
											className={ cssModObj.raiGroBut }

											data-rail-select-active={ actGroStr === curGroObj.namStr || undefined } // What: Rail Select Active Attribute. Why: The group in view should stand out in the rail. How: This sets the presence-only attribute while this entry is the active group.

											onClick={ () => jumGroFun( curGroObj.namStr ) }
										>{ /* What: Group Rail Button Element. Why: This is the actual clickable rail entry for this one group. How: This scrolls to curGroObj's own name via jumGroFun on click. */ }


											<span className={ cssModObj.raiNamSpa }>{ curGroObj.namStr }</span>{ /* What: Rail Name Span Element. Why: The rail entry needs its own visible label. How: This renders curGroObj's own name. */ }

											<span className={ cssModObj.raiCouSpa }>{ /* What: Rail Count Span Element. Why: The done/total pair reads as one small cluster. How: This wraps the done and "of total" spans below. */ }


												<span>{ curDonNum }</span>{ /* What: Rail Done Span Element. Why: The rail pill shows how many of this block's own items are done. How: This renders the done count. */ }<span className={ cssModObj.raiTotSpa }>/{ curGroObj.entArr.length }</span>{ /* What: Rail Total Span Element. Why: The done count needs its own total beside it. How: This renders a slash and the block's own total, styled dimmer via raiTotSpa. */ }


											</span>


										</button>


									</li>


								);


							} ) }


							{ shoFeaBoo && ( // What: App Features Rail Visibility Check. Why: Pinned last always, not part of bloOrdArr/staAppObj.groupOrder, so it can't be dragged around in Edit Mode and always renders after every real group; see shoFeaBoo's own doc comment above for the render gate. How: This renders the App Features rail entry only while shoFeaBoo is true.


								<li key='__appFeatures'>{ /* What: App Features List Item Element. Why: App Features gets its own pinned-last rail entry whenever it is visible at all. How: This wraps the App Features rail button below. */ }


									<button
										className={ cssModObj.raiGroBut }

										data-rail-select-active={ actGroStr === '__appFeatures' || undefined } // What: Rail Select Active Attribute. Why: The group in view should stand out in the rail. How: This sets the presence-only attribute while this entry is the active group.

										onClick={ () => jumGroFun( '__appFeatures' ) }
									>{ /* What: App Features Rail Button Element. Why: This is the actual clickable rail entry for the App Features block. How: This scrolls to '__appFeatures' via jumGroFun on click. */ }


										<span className={ cssModObj.raiNamSpa }>App Features</span>{ /* What: Rail Name Span Element. Why: The rail entry needs its own visible label. How: This renders the fixed literal "App Features". */ }

										<span className={ cssModObj.raiCouSpa }>{ /* What: Rail Count Span Element. Why: The done/total pair reads as one small cluster. How: This wraps the done and "of total" spans below. */ }


											<span>{ APP_FEA_ARR.filter( ( curFeaObj ) => feaStaObj[ curFeaObj.ideStr ] ).length }</span>{ /* What: Rail Done Span Element. Why: The rail pill shows how many of this block's own items are done. How: This renders the done count. */ }<span className={ cssModObj.raiTotSpa }>/{ APP_FEA_ARR.length }</span>{ /* What: Rail Total Span Element. Why: The done count needs its own total beside it. How: This renders a slash and the block's own total, styled dimmer via raiTotSpa. */ }


										</span>


									</button>


								</li>


							) }


						</ul>



						<div className={ cssModObj.raiEdiDiv }>{ /* What: Rail Edit Mode Div Element. Why: The Edit Mode toggle sits pinned at the rail's own bottom. How: This wraps the toggle button below. */ }


							<button
								className={ cssModObj.ediRaiBut }

								data-edit-mode-active={ ediModBoo || undefined } // What: Edit Mode Active Attribute. Why: Code that needs to know whether Edit Mode is on reads it from this attribute rather than from the button's own classes. How: This is present only while ediModBoo is true, since undefined drops the attribute entirely.
								data-element-name-hook='ediRaiBut'

								disabled={ genActBoo }
								type='button'

								onClick={ togModFun }
							>{ /* What: Edit Mode Rail Button Element. Why: This is the actual toggle control, disabled while a generation is in flight since dragging mid-cascade makes no sense. How: This calls togModFun, swapping its own label per ediModBoo. Its data-element-name-hook is read by the Today page tour and help mode's Today catalog. */ }


								<IcoSvgCom
									icoNamStr='griEle'
									sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
								/>{ /* What: Icon Svg Component. Why: The toggle needs a recognizable drag-affordance glyph alongside its own label. How: This renders the 'griEle' icon at a fixed size. */ }

								{ ediModBoo ? 'Done' : 'Edit Mode' }{ /* What: Edit Mode Label Expression. Why: The same rail button enters and leaves Edit Mode. How: This reads "Done" while Edit Mode is on, otherwise "Edit Mode". */ }


							</button>


						</div>


					</aside>



					<div
						ref={ carAreRef }

						className={ cssModObj.todGroDiv }

						style={ touBusObj.resTopNum ? { paddingTop : touBusObj.resTopNum } : undefined }
					>{ /* What: Today Groups Div Element. Why: This is the actual scrollable content column, reserving extra top space while a tour coach card asks for it. How: This renders the celebration overlay portal, every block in genOrdArr, the App Features section, the checklist/empty-state CTAs, and the footer. */ }


						{ celRecObj && parIteArr.length > 0 && ( celStyStr === 'confetti' || celStyStr === 'sparkle' ) && createPortal( // What: Celebration Portal Call. Why: The particle overlay must escape the fading tab wrapper (see the comment just below). How: This renders the overlay into document.body, only while a particle style has particles and a measured rect.


							// #region Celebration Portal Placement

							/**
							 * tab-today.jsx = Celebration Portal Placement
							 *
							 * @summary
							 * Portaled straight to document.body: the tab-switch fade
							 * wrapper (.tabFadDiv) keeps a resolved (identity) transform
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
								className={ cssModObj.celOveDiv }

								style={{
									height : celRecObj.height,
									left   : celRecObj.left,
									top    : celRecObj.top,
									width  : celRecObj.width
								}}

								aria-hidden='true'
							>{ /* What: Celebration Overlay Div Element. Why: This is the actual portaled overlay hosting either style's own particles. How: This renders either the confetti pieces or the sparkle pieces, per celStyStr. */ }


								{ celStyStr === 'confetti' && parIteArr.map( ( curParObj ) => ( // What: Confetti Particle List Render. Why: One piece is needed per entry in parIteArr, only for the confetti style. How: This maps parIteArr to one confetti piece per entry, keyed by its own id, only while celStyStr is 'confetti'.


									<i
										key={ curParObj.ideNum }

										className={ cssModObj.conPieIta }

										style={{
											'--con-dir-ang' : `${ curParObj.angNum }deg`,
											'--con-pie-opa' : curParObj.opaStr,
											'--con-spi-ang' : `${ curParObj.rotNum }deg`,
											'--con-tra-off' : `${ curParObj.disNum }px`,
											animationDelay  : `${ curParObj.delNum }ms`
										}}
									/> // What: Confetti Piece Element. Why: This is one single confetti piece, positioned/rotated/timed entirely via inline CSS custom properties. How: This renders curParObj's own randomized angle/distance/rotation/opacity/delay.


								) ) }

								{ celStyStr === 'sparkle' && parIteArr.map( ( curParObj ) => ( // What: Sparkle Particle List Render. Why: One piece is needed per entry in parIteArr, only for the sparkle style. How: This maps parIteArr to one sparkle piece per entry, keyed by its own id, only while celStyStr is 'sparkle'.


									<span
										key={ curParObj.ideNum }

										className={ cssModObj.spaPieSpa }

										style={{
											animationDelay : `${ curParObj.delNum }ms`,
											left           : `${ curParObj.posXcoNum }%`,
											top            : `${ curParObj.posYcoNum }%`
										}}
									>&#10022;</span> // What: Sparkle Piece Span Element. Why: This is one single sparkle piece, positioned/timed entirely via inline style. How: This renders a fixed glyph at curParObj's own randomized position/delay.


								) ) }


							</div>,

							// #endregion Celebration Portal Placement

							document.body // What: Portal Target. Why: The overlay must be positioned against the viewport, not a transformed ancestor. How: This mounts it directly under document.body.

						) }



						<div
							ref={ groDndRef }

							className={ cssModObj.groDraDiv }

							data-element-name-hook='groDraDiv'
						>{ /* What: Groups Dnd Div Element. Why: This is the actual drag container REO_NAM_OBJ scopes group drags to. How: This maps genOrdArr to one Reminders/Page-Tours/group section per entry. Its data-element-name-hook is read by the Welcome Tour. */ }


							{ genOrdArr.map( ( curIdeStr ) => { // What: Content Column Map. Why: One section is needed per block, dispatched by whichever sentinel or real group id curIdeStr holds. How: This returns the Reminders section, the Page Tours section (when relevant), or a real group's own section.


								if ( curIdeStr === '__reminders' ) { // What: Reminders Section Branch. Why: The Reminders block renders through RemSecCom rather than a plain group. How: This returns RemSecCom wired to the shared state, Edit Mode, and tutorial handlers.


									return (


										<RemSecCom
											key='__reminders'

											actEdiStr={ actEdiStr }
											actStoObj={ actStoObj }
											ariTasSet={ ariTasSet }
											cheExiBoo={ cheExiBoo }
											ediModBoo={ ediModBoo }
											leaTasSet={ leaTasSet }
											logOpeBoo={ opeLogStr === '__reminders' }
											secRefFun={ ( secCurEle ) => { secRefObj.current[ '__reminders' ] = secCurEle; } }
											setActEdiStr={ setActEdiStr }
											staAppObj={ staAppObj }

											onGriDowFun={ groDraFun }
											onPlaTutFun={ staTouFun }
											onTogLogFun={ () => togLogFun( '__reminders' ) }
											onUncTutFun={ uncTutFun }
										/> // What: Reminder Section Component. Why: This is the whole Reminders block, sharing every reorder/editor/mini-tour mechanism the rest of Today uses. How: This is passed every relevant piece of local state/handlers, keyed by the '__reminders' sentinel.

									);


								}



								if ( curIdeStr === '__pageTours' ) { // What: Page Tours Section Branch. Why: Page Tours only ever gets a section while it is actually meant to be showing. How: This returns null unless either shoCheBoo or rptVisBoo holds, otherwise the full Page Tours section.


									if ( !shoCheBoo && !rptVisBoo ) return null; // What: Page Tours Hidden Guard. Why: The Page Tours block only renders while the checklist is up or a replay still has unresolved tours. How: This returns null otherwise.



									const visTouArr = shoCheBoo // What: Visible Tour Array. Why: Post-cheDonBoo (replay continuation, see rptVisBoo's own comment), only the still-unresolved tours keep showing; the ORIGINAL first-time checklist still shows every one of them, done or not, unchanged. How: This is every tour during shoCheBoo, only the unresolved ones during rptVisBoo.
										? ONB_EPT_ARR                                                                                   // What: Checklist Branch. Why: The first-time checklist shows every tour. How: This returns the whole ONB_EPT_ARR.
										: ONB_EPT_ARR.filter( ( curTouObj ) => !ONB_CHE_OBJ.entLooFun( staAppObj, curTouObj.ideStr ) ); // What: Replay Branch. Why: A replay only keeps the still-unresolved tours. How: This drops every tour with a checklist entry.


									const touDonNum = ONB_EPT_ARR.filter( ( curTouObj ) => !!ONB_CHE_OBJ.entLooFun( staAppObj, curTouObj.ideStr ) ).length; // What: Tour Done Number. Why: The section's own header needs this same live done count. How: This counts resolved ONB_EPT_ARR entries.



									return (


										<section
											key='__pageTours'
											ref={ ( secCurEle ) => { secRefObj.current[ '__pageTours' ] = secCurEle; } }

											className={ cssModObj.todGroSec }

											data-element-name-hook='pagTouSec todGroSec'
										>{ /* What: Page Tours Section Element. Why: This is the whole Page Tours block's own root. How: This renders GroHeaCom plus one PagTouCom per visTouArr entry. Its data-element-name-hook is read by the page tours' own group-rename steps, help mode's Today catalog, Today's own drag-to-reorder and scroll code, and the Welcome Tour. */ }


											<GroHeaCom
												donCouNum={ touDonNum }
												ediModBoo={ ediModBoo }
												groNamStr={ pagNamStr }
												totCouNum={ ONB_EPT_ARR.length }
												valNamFun={ pagColFun }

												onGriDowFun={ groDraFun }
												onRenGroFun={ ( newNamStr ) => actStoObj.renTouFun( newNamStr ) }
											/>{ /* What: Group Header Component. Why: Page Tours shares the exact same header chrome (name/rename, count, progress dashes) as a real group. How: This is passed pagNamStr as its own editable name, wired to actStoObj.renTouFun and pagColFun's own collision check. */ }



											<div
												className={ cssModObj.todLisDiv }

												data-element-name-hook='todLisDiv'
											>{ /* What: Page Tours List Div Element. Why: Every visible tour card shares this one list column. How: This maps visTouArr to one PagTouCom per entry. Its data-element-name-hook is read by Today's own drag-to-reorder code. */ }


												{ visTouArr.map( ( curTouObj ) => ( // What: Page Tour Card List Render. Why: One card is needed per visible page tour. How: This maps visTouArr to one PagTouCom per entry, keyed by its own id.


													<PagTouCom
														key={ curTouObj.ideStr }

														actStoObj={ actStoObj }
														cheExiBoo={ cheExiBoo }
														staAppObj={ staAppObj }
														touRecObj={ curTouObj }

														onPlaTutFun={ staTouFun }
														onUncTutFun={ uncTutFun }
													/> // What: Page Tour Card Component. Why: This is one page tour's own launcher card. How: This is passed curTouObj plus the shared mini-tour dispatchers.


												) ) }


											</div>


										</section>


									);


								}



								const curGroObj = groNamObj[ curIdeStr ] || ( sloGroObj[ curIdeStr ] ? { entArr : [], namStr : curIdeStr } : null ); // What: Current Group Object. Why: A group with no entries yet, mounted only to host an incoming loader card during generation, still needs a { name, entries: [] } stand-in. How: This reads groNamObj at curIdeStr, falling back to that stand-in only when sloGroObj has a pending slot for it.


								if ( !curGroObj ) return null; // What: Missing Group Guard. Why: A stale id with no matching group and no pending slot has nothing to render at all. How: This returns null when curGroObj cannot be found.



								const curDonNum = curGroObj.entArr.filter( ( curRowObj ) => curRowObj.entRecObj.done ).length; // What: Current Done Number. Why: The section's own header needs this same live done count; mini-tour launcher cards count toward this the whole time they're on screen, resolved (any of the 3 ways) counting as done, same as any other card. How: This counts curGroObj's own done rows.



								return (


									<section
										key={ curGroObj.namStr }
										ref={ ( secCurEle ) => { secRefObj.current[ curGroObj.namStr ] = secCurEle; } }

										className={ cssModObj.todGroSec }

										data-element-name-hook='todGroSec'
									>{ /* What: Group Section Element. Why: This is one whole group's own root, from its header down through its own card list. How: This renders GroHeaCom, an optional Day Log ColDisCom, then the group's own todLisDiv list. Its data-element-name-hook is read by Today's own drag-to-reorder and scroll code, the Welcome Tour, and help mode's Today catalog. */ }


										<GroHeaCom
											donCouNum={ curDonNum }
											ediModBoo={ ediModBoo }
											groNamStr={ curGroObj.namStr }
											logOpeBoo={ opeLogStr === curGroObj.namStr && !ediModBoo }
											merPenObj={ merProObj && merProObj.from === curGroObj.namStr ? merProObj : null }
											totCouNum={ curGroObj.entArr.length }

											onCanMerFun={ () => setMerProObj( null ) }
											onConMerFun={ () => { // What: Confirm Merge Handler. Why: Confirming both performs the merge and dismisses its own prompt. How: This renames the group into the existing one, then clears merProObj.


												actStoObj.renGroFun( merProObj.from, merProObj.to ); // What: Merge Rename Call. Why: Confirming the merge performs the rename into the existing group. How: This calls actStoObj.renGroFun with the prompt's own from/to names.
												setMerProObj( null );                                // What: Merge Prompt Clear. Why: The prompt is resolved. How: This clears merProObj.


											} }
											onGriDowFun={ groDraFun }
											onRenGroFun={ ( newNamStr ) => reqRenFun( curGroObj.namStr, newNamStr ) }
											onTogLogFun={ () => togLogFun( curGroObj.namStr ) }
										/>{ /* What: Group Header Component. Why: Every group needs its own name/rename, count, and progress dashes. How: This is passed curGroObj's own name/counts plus every rename/merge/log handler. */ }



										<ColDisCom open={ opeLogStr === curGroObj.namStr && !ediModBoo }>{ /* What: Collapse Disclosure Component. Why: This group's own Day Log panel should only mount while it is actually open, outside Edit Mode. How: This wraps GroLogCom below. */ }


											<GroLogCom
												groNamStr={ curGroObj.namStr }
												staAppObj={ staAppObj }

												onCloLogFun={ () => togLogFun( curGroObj.namStr ) }
											/>{ /* What: Group Log. Why: This renders curGroObj's own picker audit rows. How: This is passed curGroObj's own name and a close handler that re-toggles it shut. */ }


										</ColDisCom>



										<div
											className={ cssModObj.todLisDiv }

											data-element-name-hook='todLisDiv'
										>{ /* What: Today List Div Element. Why: Every row in this group (real, loader, or tutorial) shares this one list column. How: This maps curGroObj's own entries to one EntCarCom (or LoaCarCom, mid-generation) per row, then any incoming placeholder slots. Its data-element-name-hook is read by Today's own drag-to-reorder code. */ }


											{ curGroObj.entArr.map( ( { entRecObj, picRecObj } ) => { // What: Group Row Map. Why: Every row in this group needs rendering, either as a live loader slot (mid-generation) or as a normal EntCarCom. How: This dispatches per genActBoo/genMapObj first, otherwise resolves the row's own item and renders EntCarCom plus its own inline editor.


												if ( genActBoo && genMapObj?.[ picRecObj.id ] ) { // What: Loader Slot Branch. Why: A picker currently mid-generation shows its own animated loader instead of a normal card. How: This returns LoaCarCom keyed by entRecObj's own eid.


													return (

														<LoaCarCom
															key={ entRecObj.eid }

															infRecObj={ genMapObj[ picRecObj.id ] }
															picRecObj={ picRecObj }
														/> // What: Loader Card Component. Why: This is the actual mid-generation placeholder for picRecObj. How: This is passed picRecObj plus its own live genMapObj record.

													);


												}



												const curIteObj = staAppObj.items.find( ( pooIteObj ) => pooIteObj.id === entRecObj.itemId ); // What: Current Item Object. Why: A normal row's own EntCarCom and inline editor both need this same resolved item. How: This finds the item matching entRecObj's own itemId.



												return (


													<React.Fragment key={ entRecObj.eid }>{ /* What: Row Fragment Element. Why: The card itself and its own inline editor's ColDisCom are true siblings with no shared wrapper of their own. How: This groups both without adding an extra DOM node. */ }


														<EntCarCom
															actStoObj={ actStoObj }
															cheExiBoo={ cheExiBoo }
															ediModBoo={ ediModBoo }
															entRecObj={ entRecObj }
															isaEdiBoo={ actEdiStr === `item:${ entRecObj.eid }` }
															isaRmvBoo={ rmvIdeSet.has( entRecObj.eid ) || leaEntSet.has( entRecObj.eid ) }
															isaRolBoo={ rolIdeSet.has( entRecObj.eid ) }
															jusCheStr={ jusCheStr }
															picRecObj={ picRecObj }
															staAppObj={ staAppObj }

															onGriDowFun={ ( poiEveObj ) => iteDraFun( poiEveObj, curGroObj ) }
															onPlaTutFun={ staTouFun }
															onRenIteFun={ ( curNamStr ) => actStoObj.renIteFun( entRecObj.itemId, curNamStr ) }
															onRerEntFun={ hanRerFun }
															onSkiEntFun={ hanSkiFun }
															onTogDonFun={ hanCheFun }
															onTogEdiFun={ () => setActEdiStr( ( curValStr ) => curValStr === `item:${ entRecObj.eid }` ? null : `item:${ entRecObj.eid }` ) }
															onUncTutFun={ uncTutFun }
														/>{ /* What: Entry Card Component. Why: This is the actual row: a real pick, a day-off/charging card, or a mini-tour launcher, depending on entRecObj's own kind. How: This is passed entRecObj/picRecObj plus every shared handler/animation-state flag. */ }



														<ColDisCom open={ actEdiStr === `item:${ entRecObj.eid }` && !!curIteObj }>{ /* What: Collapse Disclosure Component. Why: This row's own inline editor should only mount while it is actually open AND a real item still exists to edit. How: This wraps the editor wrapper div below. */ }


															{ curIteObj && ( // What: Item Exists Check. Why: The inline editor needs a real item to edit, which can briefly go missing right after a delete. How: This renders the editor wrapper only while curIteObj still resolves to something.


																<div className={ cssModObj.entEdiDiv }>{ /* What: Entry Editor Wrapper Div Element. Why: The inline editor needs its own dedicated wrapper for layout/animation. How: This renders EntEdiCom below. */ }


																	<EntEdiCom
																		actStoObj={ actStoObj }
																		iteCouNum={ staAppObj.items.filter( ( pooIteObj ) => pooIteObj.pickerId === picRecObj.id ).length }
																		iteDatObj={ curIteObj }
																		picDatObj={ picRecObj }
																		picIteArr={ staAppObj.items }

																		onCloEdiFun={ () => setActEdiStr( ( curValStr ) => curValStr === `item:${ entRecObj.eid }` ? null : curValStr ) }
																		onDelIteFun={ () => hanDelFun( entRecObj.eid, curIteObj.id ) }
																	/>{ /* What: Entry Editor Component. Why: This is the actual shared item editor. How: This is passed curIteObj/picRecObj, this picker's own live item count, and a close/delete handler pair. */ }


																</div>


															) }


														</ColDisCom>


													</React.Fragment>


												);


											} ) }



											{ genActBoo && sloGroObj[ curGroObj.namStr ] && sloGroObj[ curGroObj.namStr ].map( ( curPicObj ) => ( // What: New Slot Loader List Render. Why: A group with no entries yet, but an incoming pending slot mid-generation, still needs its own placeholder loader cards. How: This maps sloGroObj's own entry for curGroObj's name to one LoaCarCom per pending picker, only while genActBoo is true and a slot list actually exists.


												<LoaCarCom
													key={ `newslot-${ curPicObj.id }` }

													infRecObj={ genMapObj[ curPicObj.id ] }
													picRecObj={ curPicObj }
												/> // What: Loader Card Component. Why: A group with no entries yet, but an incoming slot, still needs its own placeholder loader during generation. How: This is passed curPicObj plus its own live genMapObj record.


											) ) }


										</div>


									</section>


								);


							} ) }


						</div>



						{ shoFeaBoo && ( // What: App Features Section Visibility Check. Why: Pinned last always, see shoFeaBoo's own doc comment above and the matching rail entry above for why this isn't part of genOrdArr/staAppObj.groupOrder. How: This renders the whole App Features section only while shoFeaBoo is true.


							<section
								ref={ ( secCurEle ) => { secRefObj.current[ '__appFeatures' ] = secCurEle; } }

								className={ cssModObj.todGroSec }

								data-element-name-hook='todGroSec appFeaSec'
							>{ /* What: App Features Section Element. Why: This is the whole App Features block's own root. How: This renders GroHeaCom plus one AppFeaCom per still-relevant APP_FEA_ARR entry. Its data-element-name-hook is read by Today's own drag-to-reorder and scroll code, the Welcome Tour, help mode's Today catalog, and the App Features tours. */ }


								<GroHeaCom
									donCouNum={ APP_FEA_ARR.filter( ( curFeaObj ) => feaStaObj[ curFeaObj.ideStr ] ).length }
									ediModBoo={ false }
									groNamStr='App Features'
									totCouNum={ APP_FEA_ARR.length }
								/>{ /* What: Group Header Component. Why: App Features shares the exact same header chrome as a real group, but is never itself reorderable. How: This is passed a fixed name plus its own live done/total counts. */ }



								<div
									className={ cssModObj.todLisDiv }

									data-element-name-hook='todLisDiv'
								>{ /* What: App Features List Div Element. Why: Every still-relevant feature card shares this one list column. How: This maps the filtered APP_FEA_ARR list to one AppFeaCom per entry. Its data-element-name-hook is read by Today's own drag-to-reorder code. */ }


									{ APP_FEA_ARR.filter( ( curFeaObj ) => !( fecDonBoo && feaStaObj[ curFeaObj.ideStr ] ) ).map( ( curFeaObj ) => ( // What: App Feature Card List Render. Why: Every still-relevant feature needs its own card; a resolved one during replay drops out immediately instead of lingering with an Undo toggle. How: This maps APP_FEA_ARR, filtered per the design note above, to one AppFeaCom per entry, keyed by its own ideStr. // During a replay (fecDonBoo), a resolved card drops out the instant it resolves instead of sticking around with an Undo toggle, same "no closing card to synchronize a batch disappearance against anymore" reasoning as groEntFun's own replay-continuation cards. The ORIGINAL first-time pass is unaffected: every card stays until the whole section resolves together at the next real generation.


										<AppFeaCom
											key={ curFeaObj.ideStr }

											actStoObj={ actStoObj }
											feaRecObj={ curFeaObj }
											staAppObj={ staAppObj }

											onPlaTutFun={ staTouFun }
											onUncFeaFun={ uncFeaFun }
										/> // What: App Feature Card Component. Why: This is one App Feature's own launcher card. How: This is passed curFeaObj plus the shared mini-tour dispatchers.


									) ) }


								</div>


							</section>


						) }


						{ shoCheBoo && ( // What: Generate Card Visibility Check. Why: The closing checklist card only belongs while the guided checklist is still showing. How: This renders the Generate card only while shoCheBoo is true.


							<div
								ref={ genCarRef }

								className={` ${ cssModObj.onbCreDiv }   ${ cssModObj.onbCreDivGenerate }   ${ cheExiBoo ? cssModObj.onbCreDivRemoving : '' }   ${ onbReaBoo ? cssModObj.onbCreDivPulsing : '' } `}

								data-card-needed-active={ !onbReaBoo || undefined } // What: Card Needed Active Attribute. Why: A Generate card still waiting on its tutorials reads as unfinished. How: This sets the presence-only attribute while onbReaBoo is false.
							>{ /* What: Generate Card Div Element. Why: This is the closing "Generate a real list" checklist card. How: This renders its own icon/heading/explanation plus either a working or a disabled Generate button, depending on onbReaBoo. */ }


								<div className={ cssModObj.onbIcoDiv }>{ /* What: Card Icon Div Element. Why: Every onboarding create-style card shares this same icon slot. How: This wraps a fixed check icon. */ }


									<IcoSvgCom
										icoNamStr='cheEle'
										sizSteStr='p01' // Vertical Rhythm Base Plus 1 ~= 19.304px
									/>{ /* What: Icon Svg Component. Why: The Generate card leads with a check mark, matching the other onboarding create cards. How: This renders the check glyph at the p01 rhythm step. */ }


								</div>

								<b className={ cssModObj.onbTitBol }>Generate your real list</b>{ /* What: Card Heading Element. Why: This is the card's own fixed heading. How: This renders the literal phrase directly. */ }

								<p className={ cssModObj.onbTexPar }>{ genExpStr }</p>{ /* What: Card Explanation Element. Why: The user needs to know exactly what's still missing (or that everything is ready). How: This renders genExpStr directly. */ }



								{ onbReaBoo ? ( // What: Generate Ready Check. Why: Generate's own trigger swaps between a real working button and an explained disabled one depending on readiness. How: This renders the working ButBasCom while onbReaBoo is true, the disabled InfTipCom otherwise.


									<ButBasCom
										icoNamStr='cheEle'
										kinValStr='primary'
										sizValStr='sm'

										onClick={ onGenCarFun }
									>Generate your list</ButBasCom> // What: Button Base Component. Why: This is the actual working trigger once every requirement is satisfied. How: This calls onGenCarFun.


								) : ( // What: Disabled Generate Branch. Why: Without every requirement satisfied, Generate needs an explained disabled control instead. How: This renders the else branch, taken while onbReaBoo is false.


									<InfTipCom
										className={ cssModObj.onbGenSpa }

										actNamStr='Generate your list'
										labTexStr='Complete at least one "Create a picker" tutorial above first.'
									>Generate your list</InfTipCom> // What: Info Tip Component. Why: A not-yet-ready Generate button still needs to explain itself. How: This wraps a disabled-looking button with a fixed explanation.


								) }


							</div>


						) }


						{ onbEmpBoo && ( // What: Empty State Visibility Check. Why: This CTA only belongs to a brand-new user with no pickers at all. How: This renders the empty-state card only while onbEmpBoo is true.


							<div className={ cssModObj.onbCreDiv }>{ /* What: Empty State Div Element. Why: A brand-new user with no pickers at all needs a plain, non-tour empty-state CTA. How: This renders its own icon/heading/explanation plus a Create-a-picker button. */ }


								<div className={ cssModObj.onbIcoDiv }>{ /* What: Card Icon Div Element. Why: Every onboarding create-style card shares this same icon slot. How: This wraps a fixed plus icon. */ }


									<IcoSvgCom
										icoNamStr='pluEle'
										sizSteStr='p01' // Vertical Rhythm Base Plus 1 ~= 19.304px
									/>{ /* What: Icon Svg Component. Why: The no-pickers card leads with a plus, pointing at creating one. How: This renders the plus glyph at the p01 rhythm step. */ }


								</div>

								<b className={ cssModObj.onbTitBol }>You do not have any pickers yet</b>{ /* What: Card Heading Element. Why: This is the card's own fixed heading. How: This renders the literal phrase directly. */ }

								<p className={ cssModObj.onbTexPar }>At least one picker is required for any items to show up here. You will need to create one with at least two items for it to choose from.</p>{ /* What: Card Explanation Element. Why: The user needs to understand why the list is empty and what to do about it. How: This renders a fixed explanatory sentence. */ }



								<ButBasCom
									icoNamStr='pluEle'
									kinValStr='primary'
									sizValStr='sm'

									onClick={ begCreFun }
								>Create a picker</ButBasCom>{ /* What: Button Base Component. Why: This is the actual shortcut into the Pickers tab's own create flow. How: This calls begCreFun. */ }


							</div>


						) }


						{ shoIdlBoo && ( // What: No-Run Empty State Visibility Check. Why: This CTA only belongs to a user with real pickers but nothing runnable today. How: This renders the card only while shoIdlBoo is true.


							<div className={` ${ cssModObj.onbCreDiv }   ${ cssModObj.onbCreDivNorun } `}>{ /* What: No-Run Empty State Div Element. Why: A user with real pickers but nothing runnable today needs its own explanatory empty state, distinct from the "no pickers at all" one above. How: This renders its own icon/heading/explanation with links out to the Data and Pickers tabs. */ }


								<div className={ cssModObj.onbIcoDiv }>{ /* What: Card Icon Div Element. Why: Every onboarding create-style card shares this same icon slot. How: This wraps a fixed calendar icon. */ }


									<IcoSvgCom
										icoNamStr='calEle'
										sizSteStr='p01' // Vertical Rhythm Base Plus 1 ~= 19.304px
									/>{ /* What: Icon Svg Component. Why: The idle card leads with a calendar, since nothing is scheduled today. How: This renders the calendar glyph at the p01 rhythm step. */ }


								</div>

								<b className={ cssModObj.onbTitBol }>There are no items to display</b>{ /* What: Card Heading Element. Why: This is the card's own fixed heading. How: This renders the literal phrase directly. */ }

								<p className={ cssModObj.onbTexPar }>You either have no pickers that are set to run with the auto-generator, or you do have pickers set to run with the auto-generator but they are not set to run on this day.</p>{ /* What: Card Explanation Element. Why: The user needs to understand exactly why nothing shows up today. How: This renders a fixed explanatory sentence. */ }

								<p className={ cssModObj.onbTexPar }>{ /* What: Card Action Explanation Element. Why: The user still needs an actual path forward, not just an explanation. How: This renders 2 inline tab-switch buttons inside a fixed sentence. */ }


									You can either change your pickers&rsquo; settings in the <button
										className={ cssModObj.subLinBut }

										type='button'

										onClick={ () => onNavTabFun && onNavTabFun( 'data' ) }
									>Data tab</button> to change this behavior or you can run them manually via the <button
										className={ cssModObj.subLinBut }

										type='button'

										onClick={ () => onNavTabFun && onNavTabFun( 'picker' ) }
									>Pickers tab</button> and then push them here to the Today tab.


								</p>


							</div>


						) }



						<div className={ cssModObj.todFooDiv }>{ /* What: Today Footer Div Element. Why: The footer's own content swaps between the confirm prompt, Edit Mode actions, and the normal Regenerate/generated-on pair. How: This renders exactly one of the 3 branches below. */ }


							{ conGenBoo && !genActBoo ? ( // What: Confirm Gated Check. Why: The footer's own content depends on which of 3 mutually-exclusive states currently applies. How: This renders the regenerate-confirm prompt while conGenBoo is true and no generation is in flight, otherwise one of the 2 branches below.


								<div
									className={ cssModObj.genConDiv }

									data-element-name-hook='genConDiv'
								>{ /* What: Generate Confirm Div Element. Why: Regenerate is confirm-gated since it replaces any completed items. How: This renders the fixed warning message plus a Cancel/Continue pair. Its data-element-name-hook is read by the Welcome Tour. */ }


									<p className={ cssModObj.conMesPar }>This will replace any items marked as completed and these will not show up in the Stats tab. Continue?</p>{ /* What: Confirm Message Element. Why: The user needs to understand the real consequence before confirming. How: This renders a fixed warning sentence. */ }

									<div className={ cssModObj.conActDiv }>{ /* What: Confirm Actions Div Element. Why: The Cancel/Continue pair reads as one cluster. How: This wraps both ButBasCom elements below. */ }


										<ButBasCom
											kinValStr='ghost'
											sizValStr='sm'

											onClick={ () => setConGenBoo( false ) }
										>Cancel</ButBasCom>{ /* What: Button Base Component. Why: This backs out of the confirm without regenerating anything. How: This clears conGenBoo. */ }



										<ButBasCom
											data-element-name-hook='genConBut'

											icoNamStr='refEle'
											kinValStr='primary'
											sizValStr='sm'

											onClick={ () => genLisFun() }
										>Continue</ButBasCom>{ /* What: Button Base Component. Why: This is the actual, confirmed regeneration trigger. How: This calls genLisFun with no options (a manual, non-auto run). Its data-element-name-hook is read by the Welcome Tour. */ }


									</div>


								</div>


							) : ediModBoo ? ( // What: Edit Mode Branch. Why: Edit Mode replaces the normal footer with its own Cancel/Done pair. How: This renders the edit-mode actions while ediModBoo is true, the normal footer otherwise.


								<div
									className={ cssModObj.fooActDiv }

									data-element-name-hook='fooActDiv ediActDiv'
								>{ /* What: Edit Mode Foot Actions Div Element. Why: Edit Mode replaces the normal footer actions with its own Cancel/Done pair. How: This wraps both ButBasCom elements below. Its data-element-name-hook is read by the Today page tour and help mode's Today catalog. */ }


									<ButBasCom
										data-element-name-hook='ediCanBut'

										kinValStr='ghost'

										onClick={ () => cloModFun( false ) }
									>Cancel</ButBasCom>{ /* What: Button Base Component. Why: This discards every drag made during the current Edit Mode session. How: This calls cloModFun(false). Its data-element-name-hook is read by the Today page tour. */ }



									<ButBasCom
										icoNamStr='cheEle'
										kinValStr='primary'

										onClick={ () => cloModFun( true ) }
									>Done</ButBasCom>{ /* What: Button Base Component. Why: This keeps every drag made during the current Edit Mode session. How: This calls cloModFun(true). */ }


								</div>


							) : ( // What: Normal Footer Branch. Why: Outside both the confirm prompt and Edit Mode, the normal Regenerate/generated-on footer belongs here instead. How: This renders the else branch, taken while neither prior condition holds.


								<React.Fragment>{ /* What: Normal Footer Fragment Element. Why: The Edit Mode/Regenerate action row and the generated-on sub-line are true siblings with no shared wrapper of their own. How: This groups both without adding an extra DOM node. */ }


									<div
										className={ cssModObj.fooActDiv }

										data-element-name-hook='fooActDiv'
									>{ /* What: Foot Actions Div Element. Why: The Edit Mode and Regenerate buttons read as one row. How: This wraps both controls below. Its data-element-name-hook is read by the Today page tour. */ }


										<ButBasCom
											className={ cssModObj.fooEdiBut }

											data-element-name-hook='fooEdiBut'

											disabled={ genActBoo }
											icoNamStr='griEle'
											kinValStr='secondary'

											onClick={ togModFun }
										>Edit Mode</ButBasCom>{ /* What: Button Base Component. Why: This is the actual Edit Mode entry point. How: This calls togModFun, disabled while a generation is in flight. Its data-element-name-hook is read by the Today page tour and help mode's Today catalog. */ }



										{ shoCheBoo ? ( // What: Checklist-Gated Regenerate Branch. Why: Every picker (sample AND any real one already created mid-checklist, see genResBoo's own comment on why those stay hidden too) is hidden until the closing Generate card runs, and genLisFun's own picker loop skips anything hidden, so this would always produce an empty list while still updating today.generatedAt, misleadingly showing a fresh "List generated on..." timestamp for a regenerate that couldn't actually draw anything. How: This renders a real, disabled-and-explained Regenerate instead of a working one.


											<InfTipCom
												className={ cssModObj.genLisSpa }

												data-element-name-hook='genLisSpa'

												actNamStr='Regenerate'
												labTexStr='Complete every tutorial above and generate your real list first.'
											>{ /* What: Info Tip Component. Why: A blocked Regenerate still needs to explain itself. How: This wraps a disabled-looking button with a fixed explanation. Its data-element-name-hook is read by the Welcome Tour and help mode's Today catalog. */ }


												<IcoSvgCom
													icoNamStr='refEle'
													sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
												/>{ /* What: Icon Svg Component. Why: The disabled Regenerate control keeps the same refresh icon as the real button. How: This renders the refresh glyph at the bas rhythm step, followed by the label text. */ }Regenerate


											</InfTipCom>


										) : ( // What: Working Regenerate Branch. Why: Outside the guided checklist, the real working Regenerate control belongs here instead. How: This renders the else branch, taken while shoCheBoo is false.


											<ButBasCom
												data-element-name-hook='genLisBut'

												disabled={ genActBoo }
												icoNamStr='refEle'
												kinValStr='secondary'

												onClick={ () => setConGenBoo( true ) }
											>{ genActBoo ? 'Generating…' : 'Regenerate' }</ButBasCom> // What: Button Base Component. Why: This is the actual working Regenerate trigger, opening the confirm prompt above. How: This sets conGenBoo, disabled and relabeled while a cascade is already in flight. Its data-element-name-hook is read by the Welcome Tour and help mode's Today catalog.


										) }


									</div>

									<div className={ cssModObj.fooSubDiv }>List generated on { forLonFun( staAppObj.today.generatedAt ) } at { forTimFun( staAppObj.today.generatedAt ) }</div>{ /* What: Foot Sub Div Element. Why: The user still deserves to know exactly when the current list was built. How: This renders staAppObj.today.generatedAt formatted 2 ways. */ }


								</React.Fragment>


							) }


						</div>


					</div>


				</div>


			</div>



			{ minTouObj && minTouObj.kinStr === 'reminder' && ( // What: Reminder Mini-Tour Check. Why: A running mini-tour only mounts RemTouCom when it's actually a reminder-kind tour. How: This renders RemTouCom only while minTouObj holds a value and its own kind is 'reminder'.


				<RemTouCom
					actStoObj={ actStoObj }
					staAppObj={ staAppObj }
					varKeyStr={ minTouObj.ideStr === 'tk_ob_meds' ? 'once' : 'recurring' }

					onCloForFun={ () => setActEdiStr( ( curValStr ) => curValStr === 'reminder-add' ? null : curValStr ) }
					onCloTouFun={ () => setMinTouObj( null ) }
				/> // What: Reminder Tour Component. Why: A reminder mini-tour never leaves Today, so it renders directly here. How: This is passed which variant to run plus a close handler that clears minTouObj.


			) }



			{ shoIntBoo && ( // What: App Features Intro Check. Why: The one-time intro tip only belongs once, right when it first becomes relevant. How: This renders FeaTipCom only while shoIntBoo is true.


				<FeaTipCom actStoObj={ actStoObj } /> // What: App Features Intro Tip. Why: The App Features section needs its own one-time "One Last Thing..." intro. How: This renders only while shoIntBoo is true.


			) }


		</div>


	);


}

// #endregion TabTodCom

// #endregion Components



// #region Exports

export { TabTodCom }; // What: Named Export. Why: app.jsx renders this as the Today tab itself. How: This exports TabTodCom by name; every other binding in this file is internal-only.

// #endregion Exports


