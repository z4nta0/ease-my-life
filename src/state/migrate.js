


// #region Imports

import { CAD_NAM_OBJ } from '../core/cadence.js';  // What: Cadence. Why: A picker's own saved cadence must be normalized to the current shape. How: This is called (enfWeeFun/norCadFun/isaCadFun) from migStaFun.
import { HOL_NAM_OBJ } from '../core/holidays.js'; // What: Holidays Namespace Object. Why: A save with no holiday list gets the canonical empty holidays shape. How: This is called (defStaFun) from migStaFun.
import { newEidFun   } from './ids.js';            // What: New Entry-Id Function. Why: Migrated entries and new Today entries both need unique ids. How: This is called once per entry that needs one.
import { norGroFun   } from '../core/pickers.js';  // What: Normalize Group Function. Why: Every saved picker's group label is tidied and de-duplicated on load. How: This is called from migStaFun.
import { norPicFun   } from '../core/pickers.js';  // What: Normalize Picker Function. Why: Every saved picker's display name is tidied on load. How: This is called from migStaFun.
import { TAS_NAM_OBJ } from '../core/tasks.js';    // What: Tasks Namespace Object. Why: Saved reminders and reminder options are normalized by the reminders engine, not this file. How: This is called (isaStaFun/norOptFun) from migStaFun.

// #endregion Imports



/**
 * migrate.js = Migrate
 *
 * @summary
 * The schema-evolution point for persisted state: every state passes through
 * migStaFun on load and on import, which backfills missing fields for old
 * saves one block at a time and stamps SCH_VER_NUM onto the result. A new
 * persisted field gets its backfill here rather than assuming a fresh shape.
 *
 * Sections:
 *  - Constants
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

/**
 * SCH_VER_NUM = Schema Version Number
 *
 * @summary
 * The state schema version, stamped into state.v by migStaFun() and
 * therefore carried inside exported backup files. Distinct from the
 * IndexedDB database version (a structural concern of storage.js) and
 * from the eventual package.json release version. Bump this whenever a
 * new migration is added below, so an exported backup's own state.v
 * always reflects the shape it was actually migrated to.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const SCH_VER_NUM = 1; // What: Schema Version Number. Why: migStaFun() stamps this onto every loaded/imported state so an exported backup records the shape it was migrated to. How: This is read once, at the very end of migStaFun() below.

// #endregion Constants



// #region Helpers

// #region migStaFun

/**
 * migStaFun = Migrate State Function
 *
 * @summary
 * The one-time migration point for old persisted state: every save
 * loaded from disk, and every imported backup, passes through here so
 * a missing field gets backfilled one `if` block at a time instead of
 * the rest of the app seeing "Invalid Date" or a missing key. Every
 * check below tests/writes a REAL persisted field by its own exact
 * property name; those names are the actual schema and must never be
 * "helpfully" renamed, only their surrounding code reformatted. New
 * migrations get added here as the state shape grows; state.v is
 * stamped with SCH_VER_NUM at the very end.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curStaObj - Current State Object: The raw, possibly-old-shaped state
 *                    to migStaFun in place.
 *
 * @returns curStaObj itself, mutated in place with every missing field
 * backfilled and state.v stamped.
 *
 * @example
 * ```ts
 * migStaFun(rawState) // => state
 * ```
 *
*/

function migStaFun ( curStaObj ) {


	if ( curStaObj && curStaObj.today && !curStaObj.today.generatedAt ) { // What: Generated-At Backfill Guard. Why: Old state predates today.generatedAt entirely, and the footer needs SOME timestamp to read sensibly until the next regen. How: This backfills to "this morning" (7:12am) when today exists but generatedAt is missing.


		const defDatObj = new Date(); // What: Default Date Object. Why: A plausible "already generated this morning" moment is friendlier than an obviously-fake placeholder. How: This takes the current date as a starting point, pinned to 7:12am below.

		defDatObj.setHours( 7, 12, 0, 0 ); // What: Default Date Hours Pin. Why: The backfilled timestamp must read as "this morning" rather than the actual current moment. How: This pins defDatObj's own time to 7:12am.

		curStaObj.today.generatedAt = defDatObj.toISOString(); // What: Generated-At Backfill. Why: today.generatedAt must exist for the footer/streak logic elsewhere to read. How: This stamps defDatObj's own ISO string onto curStaObj.today.generatedAt.


	}



	if ( curStaObj && curStaObj.today && curStaObj.today.streakClaimed === undefined ) { // What: Streak-Claimed Backfill Guard. Why: Old state predates today.streakClaimed; whether today already counts toward the streak must be inferred from whether anything is done. How: This backfills true when any existing entry is already done, else false.


		curStaObj.today.streakClaimed = ( curStaObj.today.entries || [] ).some( ( curEntObj ) => curEntObj.done ); // What: Streak-Claimed Backfill. Why: This is the same "was anything already done today" rule stkSynFun itself uses. How: This checks whether any of today's own entries is already done.


	}



	if ( curStaObj && curStaObj.today && Array.isArray( curStaObj.today.entries ) ) { // What: Entry-Id Backfill Guard. Why: Older state (and the seed) predates per-entry eids, needed to support more than one entry per picker. How: This mints a fresh eid for any entry that doesn't already have one.


		for ( const curEntObj of curStaObj.today.entries ) { if ( !curEntObj.eid ) curEntObj.eid = newEidFun(); } // What: Entry-Id Backfill Loop. Why: Every entry needs its own stable eid, whether or not it already had one. How: This mints a fresh eid for any entry currently missing one, in place.


	}



	if ( curStaObj && Array.isArray( curStaObj.pickers ) && curStaObj.pickers.some( ( curPicObj ) => Array.isArray( curPicObj.itemIds ) ) ) { // What: Category-Collapse Backfill Guard. Why: The old category layer (picker.itemIds + item.categoryId) is collapsed into a direct item.pickerId link; detected by any picker still carrying an itemIds array. How: This rebuilds every item's own pickerId from whichever picker's itemIds listed it, then drops itemIds/categoryId/categories entirely.


		const itePicObj = {}; // What: Item Picker Object And Guard. Why: The item map below needs O(1) lookup of which picker (if any) used to list a given item id. How: This starts empty and is filled by the loop directly below.


		for ( const curPicObj of curStaObj.pickers ) { // What: Item-Picker Fill Loop. Why: Every old itemIds list must be inverted into itePicObj before the item map below can use it. How: This iterates every picker with an itemIds array, filing each listed id under this picker's own id.


			if ( Array.isArray( curPicObj.itemIds ) ) for ( const ownIdeStr of curPicObj.itemIds ) itePicObj[ ownIdeStr ] = curPicObj.id; // What: Owned-Id Fill. Why: Every item id this picker used to own must map back to this picker's own id. How: This assigns curPicObj.id under ownIdeStr for every id in curPicObj.itemIds.


		}


		if ( Array.isArray( curStaObj.items ) ) { // What: Item Pickerid Rewrite Guard. Why: Only when items actually exist is there anything to rewrite. How: This maps every item to carry a real pickerId and drop its own old categoryId.


			curStaObj.items = curStaObj.items.map( ( curIteObj ) => { // What: Item Picker Rewrite Map. Why: Every item must end up carrying a real pickerId. How: This maps each item, resolving its picker below.


				const rspIdeStr = curIteObj.pickerId || itePicObj[ curIteObj.id ] || null; // What: Resolved-Picker Identifier String. Why: An item may already carry a pickerId, or only be inferable from the old itemIds inversion above. How: This prefers curIteObj's own pickerId, falling back to itePicObj's lookup, then null.

				const { categoryId : catIdeStr, ...remFieObj } = curIteObj; // What: Remaining Fields Object. Why: The old categoryId field must be dropped entirely, not merely ignored. How: This destructures categoryId off curIteObj as catIdeStr, which goes unused, keeping every other field in remFieObj.



				return { ...remFieObj, pickerId : rspIdeStr }; // What: Rewritten Item Return. Why: The caller needs this item's own real pickerId written, with categoryId gone. How: This spreads remFieObj with pickerId set to rspIdeStr.


			} );


		}



		curStaObj.pickers = curStaObj.pickers.map( ( curPicObj ) => { // What: Picker Itemids Drop. Why: A picker no longer owns an itemIds list at all once items carry their own pickerId. How: This maps every picker to a copy without its itemIds.


			const { itemIds : iteIdeArr, ...remFieObj } = curPicObj; // What: Remaining Fields Object. Why: The itemIds list must be dropped entirely. How: This destructures itemIds off the picker as iteIdeArr, which goes unused, keeping every other field in remFieObj.



			return remFieObj; // What: Remaining Fields Return. Why: The map needs the picker without its itemIds. How: This returns remFieObj.


		} );

		delete curStaObj.categories; // What: Categories Entity Drop. Why: The categories entity is gone entirely under the new model. How: This deletes curStaObj's own categories field outright.


	}



	if ( curStaObj && !curStaObj.holidays && HOL_NAM_OBJ ) curStaObj.holidays = HOL_NAM_OBJ.defStaFun(); // What: Holidays Backfill. Why: The daily-schedule config (a global editable holiday list) was added later than this file's own first save shape. How: This backfills curStaObj.holidays to HOL_NAM_OBJ's own default state when it's missing.



	if ( curStaObj && curStaObj.daily && !curStaObj.daily.runTime ) curStaObj.daily.runTime = '04:00'; // What: Daily Run-Time Backfill. Why: The Daily generator's own auto-run time was added later, defaulting to 4:00am. How: This backfills curStaObj.daily.runTime when curStaObj.daily exists but lacks one.



	if ( curStaObj && !curStaObj.appearance ) curStaObj.appearance = { autoSystem : false, completionStyle : 'ripple', customDark : null, customLight : null, pickAnim : 'reel', tabPlacement : 'bottom', theme : 'ink' }; // What: Appearance Backfill. Why: The Settings tab's real persisted theme choice was added later, replacing a design-time-only palette default. How: This backfills curStaObj.appearance to a full default object when it's entirely missing.



	if ( curStaObj && curStaObj.appearance && curStaObj.appearance.autoSystem === undefined ) curStaObj.appearance.autoSystem = false; // What: Appearance Auto-System Backfill. Why: The "match system dark mode" toggle was added after appearance itself existed for some users. How: This backfills autoSystem to false when curStaObj.appearance exists but lacks it.



	if ( curStaObj && curStaObj.appearance && !curStaObj.appearance.pickAnim ) curStaObj.appearance.pickAnim = 'reel'; // What: Appearance Pick-Anim Backfill. Why: The pick-reveal animation style was added after appearance itself existed for some users. How: This backfills pickAnim to 'reel' when curStaObj.appearance exists but lacks it.



	if ( curStaObj && curStaObj.appearance && !curStaObj.appearance.completionStyle ) curStaObj.appearance.completionStyle = 'ripple'; // What: Appearance Completion-Style Backfill. Why: The completion-celebration style was added after appearance itself existed for some users. How: This backfills completionStyle to 'ripple' when curStaObj.appearance exists but lacks it.



	if ( curStaObj && curStaObj.appearance && !curStaObj.appearance.tabPlacement ) curStaObj.appearance.tabPlacement = 'bottom'; // What: Appearance Tab-Placement Backfill. Why: The tab bar placement option was added after appearance itself existed for some users. How: This backfills tabPlacement to 'bottom' when curStaObj.appearance exists but lacks it.



	if ( curStaObj && curStaObj.daily && !curStaObj.daily.mode ) curStaObj.daily.mode = 'auto'; // What: Daily Mode Backfill. Why: Whether the Daily generator runs on its own or only manually was added later, defaulting to 'auto'. How: This backfills curStaObj.daily.mode when curStaObj.daily exists but lacks one.



	if ( curStaObj && !Array.isArray( curStaObj.tasks ) ) curStaObj.tasks = []; // What: Tasks Array Backfill. Why: The manual reminders entity was added later; old state has no tasks array at all. How: This backfills curStaObj.tasks to an empty array when it isn't already one.



	if ( curStaObj && Array.isArray( curStaObj.tasks ) && TAS_NAM_OBJ ) { // What: Stale One-Time Task Purge Guard. Why: A one-time reminder completed on a previous day shouldn't linger forever. How: This drops every task TAS_NAM_OBJ itself considers stale-once.


		curStaObj.tasks = curStaObj.tasks.filter( ( curTasObj ) => !TAS_NAM_OBJ.isaStaFun( curTasObj ) ); // What: Stale-Once Filter. Why: Only TAS_NAM_OBJ itself knows the exact staleness rule for a one-time reminder. How: This keeps every task TAS_NAM_OBJ.isaStaFun reports false for.


	}



	if ( curStaObj && Array.isArray( curStaObj.tasks ) ) { // What: Task Hidden-Flag Backfill Guard. Why: The hidden flag (lets a picker/task be kept but excluded from every list/count/generator run) was added later; used to tuck the Welcome Tour's own sample pickers/reminders out of sight without deleting their history. How: This backfills hidden:false on any task that doesn't already carry a real boolean there.


		curStaObj.tasks = curStaObj.tasks.map( ( curTasObj ) => ( typeof curTasObj.hidden === 'boolean' ? curTasObj : { ...curTasObj, hidden : false } ) ); // What: Task Hidden-Flag Map. Why: Only a task genuinely missing a real boolean hidden field needs patching. How: This passes a task through unchanged when hidden is already boolean, else spreads in hidden:false.


	}



	if ( curStaObj && Array.isArray( curStaObj.tasks ) ) { // What: Task Scheduling-Fields Backfill Guard. Why: Every-N-weeks/months/years plus "Nth weekday" scheduling added dateMode/nthOrdinal/nthWeekday, which the UI now reads directly and so must be backfilled explicitly. How: This leaves an already-migrated task alone, else defaults it to plain date-based scheduling anchored on today.


		curStaObj.tasks = curStaObj.tasks.map( ( curTasObj ) => { // What: Task Scheduling Backfill Map. Why: Every task must carry the newer scheduling fields. How: This maps each task, backfilling only the ones that lack them.


			if ( curTasObj.dateMode === 'date' || curTasObj.dateMode === 'nthWeekday' ) return curTasObj; // What: Already-Migrated Guard. Why: A task that already carries a real dateMode needs no further backfill here. How: This returns curTasObj unchanged when dateMode is already one of the 2 known values.



			const nowDatObj = new Date(); // What: Now Date Object. Why: An old task's own nthWeekday default falls back to today's own weekday. How: This reads the current moment.



			return { // What: Backfilled Task Return. Why: The caller needs every new scheduling field present with a sensible default. How: This spreads curTasObj with dateMode/nthOrdinal/nthWeekday defaulted.


				...curTasObj, // What: Current Task Spread. Why: Every existing field must survive the backfill. How: This spreads curTasObj first so the defaults below only add fields.

				dateMode   : 'date',                                    // What: Date Mode. Why: Old tasks always meant a plain day-of-month date. How: This is the 'date' mode.
				nthOrdinal : curTasObj.nthOrdinal || 1,                 // What: Nth Ordinal. Why: The nth-weekday picker needs a starting ordinal. How: This keeps any existing value, else 1.
				nthWeekday : curTasObj.nthWeekday ?? nowDatObj.getDay() // What: Nth Weekday. Why: The nth-weekday picker needs a starting weekday. How: This keeps any existing value, else today's own weekday.


			};


		} );


	}



	// #region Task Interval One-Shot Reset

	/**
	 * store.js = Task Interval One-Shot Reset
	 *
	 * @summary
	 * `interval` is reused for weekly/monthly/annual's own "every N
	 * ___", but defTasFun has ALWAYS unconditionally set interval:2
	 * on every new task regardless of repeat kind (a leftover default
	 * from when only the 'interval' repeat used it), so every pre-
	 * existing weekly/monthly/annual reminder already carries a real
	 * interval:2, completely unused until this migration existed.
	 * Without this reset, every one of them would silently start
	 * meaning "every 2 weeks/months/years" the moment this shipped.
	 * This must run only ONCE: after a user deliberately sets an
	 * interval via the new controls, this reset must never fire again
	 * and clobber it, hence the _taskIntervalReset guard flag.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	if ( curStaObj && !curStaObj._taskIntervalReset && Array.isArray( curStaObj.tasks ) ) { // What: Task Interval One-Shot Reset Guard. Why: The stale, unused interval:2 default must only ever be reset once, per the design-rationale comment above. How: This gates the reset block below on the guard flag not yet being set, and tasks actually being a real array.


		curStaObj.tasks = curStaObj.tasks.map( ( curTasObj ) => // What: Interval Reset Map. Why: Only a weekly/monthly/annual task actually inherited the stale, unused interval:2. How: This resets interval to 1 for those 3 repeat kinds, leaving every other task untouched.
			( curTasObj.repeat === 'weekly' || curTasObj.repeat === 'monthly' || curTasObj.repeat === 'annual' ) ? { ...curTasObj, interval : 1 } : curTasObj ); // What: Interval Reset Test. Why: Only the three kinds that inherited the stale interval need resetting. How: This resets interval to 1 for weekly, monthly and annual tasks and passes every other task through.

		curStaObj._taskIntervalReset = true; // What: Reset-Guard Set. Why: This one-shot reset must never re-fire and clobber a user's own later interval choice. How: This flips the guard flag permanently true.


	}

	// #endregion Task Interval One-Shot Reset



	if ( curStaObj && TAS_NAM_OBJ ) curStaObj.reminderOpts = TAS_NAM_OBJ.norOptFun( curStaObj.reminderOpts ); // What: Reminder Options Normalize. Why: Per-type reminder participation options were added later; partial or absent state must get the full default switch set. How: This calls TAS_NAM_OBJ.norOptFun on whatever curStaObj.reminderOpts currently holds.



	// #region Data-Tab Collapse Defaults V2

	/**
	 * store.js = Data-Tab Collapse Defaults V2
	 *
	 * @summary
	 * The Data tab's main sections (Conditionals, Reminders, each
	 * picker card) all default COLLAPSED and are read via `=== false`
	 * for expanded, so no seeding is normally needed (see
	 * togColFun's own defaultCollapsed argument). But
	 * values saved by the OLD, inverted picker-card flag must be
	 * dropped once, so those cards don't load pre-expanded under the
	 * new polarity; the __collapseDefaultsV2 flag guards this so it
	 * only ever strips old values one time.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	if ( curStaObj && Array.isArray( curStaObj.pickers ) ) { // What: Collapse-Defaults Flip Guard. Why: The old inverted collapse-flag polarity must only ever be stripped from a real, migratable state, per the design-rationale comment above. How: This gates the one-shot strip block below on curStaObj existing with a real pickers array.


		const curUsiObj = curStaObj.ui || {};                           // What: Current User-Interface Object. Why: The collapse-state copy below needs curStaObj's own ui object, or an empty fallback. How: This reads curStaObj.ui, defaulting to {}.
		const conColObj = { ...( curUsiObj.controlsCollapsed || {} ) }; // What: Controls Collapsed Object. Why: The old flags must be stripped from a COPY, never the live object directly. How: This shallow-copies curUsiObj's own controlsCollapsed, defaulting to {}.


		if ( !conColObj.__collapseDefaultsV2 ) { // What: One-Shot Strip Guard. Why: This must only ever run once per save, per the design-rationale comment above. How: This strips every old per-picker/section flag and sets the guard, only when it hasn't run yet.


			conColObj.__collapseDefaultsV2 = true; // What: Guard Flag Set. Why: This one-shot strip must never re-run and clobber a user's own later collapse choices. How: This flips the guard flag permanently true.

			delete conColObj.__sectionsSeeded; // What: Old Sections-Seeded Flag Drop. Why: This flag belonged to the old polarity and has no meaning under the new one. How: This deletes it from conColObj outright.

			curStaObj.pickers.forEach( ( curPicObj ) => { delete conColObj[ curPicObj.id ]; } ); // What: Old Picker-Card Flags Drop. Why: Every picker's own old inverted flag must be cleared so it loads collapsed under the new polarity. How: This deletes conColObj's own entry for every picker's id.

			delete conColObj.__reminders_main; // What: Old Reminders-Main Flag Drop. Why: This flag belonged to the old polarity and has no meaning under the new one. How: This deletes it from conColObj outright.
			delete conColObj.__conditionals;   // What: Old Conditionals Flag Drop. Why: This flag belonged to the old polarity and has no meaning under the new one. How: This deletes it from conColObj outright.


		}



		curStaObj.ui = { ...curUsiObj, controlsCollapsed : conColObj }; // What: Ui Object Writeback. Why: The (possibly-stripped) collapse-state copy must actually land back on curStaObj. How: This spreads curUsiObj with controlsCollapsed replaced by conColObj.


	}

	// #endregion Data-Tab Collapse Defaults V2



	// #region Reminders Stats-Default Flip

	/**
	 * store.js = Reminders Stats-Default Flip
	 *
	 * @summary
	 * Reminders now count toward Stats by default, a one-time flip for
	 * state saved before that change. Guarded by _remStatsDefaultOn so
	 * a user who later turns the toggle back off isn't silently
	 * overridden on every subsequent load.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	if ( curStaObj && !curStaObj._remStatsDefaultOn && curStaObj.reminderOpts ) { // What: Reminders Stats-Default Flip Guard. Why: The one-time flip to make reminders count toward Stats must only ever run once, per the design-rationale comment above. How: This gates the flip block below on the guard flag not yet being set, and reminderOpts actually existing.


		curStaObj.reminderOpts.once.stats      = true; // What: Once-Reminder Stats Flip. Why: One-time reminders must count toward Stats by the new default. How: This sets curStaObj.reminderOpts.once.stats to true.
		curStaObj.reminderOpts.recurring.stats = true; // What: Recurring-Reminder Stats Flip. Why: Recurring reminders must count toward Stats by the new default. How: This sets curStaObj.reminderOpts.recurring.stats to true.
		curStaObj._remStatsDefaultOn           = true; // What: Flip-Guard Set. Why: This one-shot flip must never re-fire and override a user's own later choice to turn it off. How: This flips the guard flag permanently true.


	}

	// #endregion Reminders Stats-Default Flip



	// #region Onboarding Backfill

	/**
	 * store.js = Onboarding Backfill
	 *
	 * @summary
	 * Onboarding was added later; existing users must NOT be re-
	 * onboarded, so any state that lacks the field is treated as
	 * already welcomed/dismissed AND already past the mini-tour
	 * checklist (checklistDone:true), since this data predates the
	 * checklist system entirely and unambiguously belongs to an
	 * established account, not a first-time one.
	 *
	 * Without checklistDone set here too, the very next backfill below
	 * (which defaults it to false for ANY onboarding object still
	 * missing the field, including the one just created on this exact
	 * line) put such an account back into "first-time" mode the moment
	 * they next hit Replay Tour: the checklist's own real-picker name-
	 * collision suppression and the App Features section both require
	 * checklistDone to already be true, and the closing Generate card
	 * requires it to be false. So with it wrongly false, a Replay
	 * showed every mini-tour regardless of name collisions, hid App
	 * Features entirely, and left Generate stuck permanently visible
	 * (and permanently unreachable, since nothing tracked it as done).
	 *
	 * Fresh clean state sets welcomed:false (and, via the block below,
	 * checklistDone:false) explicitly to trigger the real first-run
	 * flow; this branch only ever fires for existing data an actual
	 * SED_NAM_OBJ.buiCleFun() never produces.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	if ( curStaObj && !curStaObj.onboarding ) curStaObj.onboarding = { checklistDone : true, dismissed : true, welcomed : true }; // What: Onboarding Backfill Guard. Why: An account missing onboarding entirely predates the checklist system and must be treated as already established, per the design-rationale comment above. How: This backfills curStaObj.onboarding to welcomed/dismissed/checklistDone all true when it's entirely missing.

	// #endregion Onboarding Backfill



	if ( curStaObj && curStaObj.onboarding && ( !curStaObj.onboarding.checklist || typeof curStaObj.onboarding.checklist !== 'object' ) ) { // What: Onboarding Checklist-Map Backfill. Why: The mini-tour checklist (see onboarding-checklist.js) maps an item id to its own resolution; an object map needs no per-item backfill of its own, just a manifest entry there. How: This backfills curStaObj.onboarding.checklist to {} when it's missing or not a plain object.


		curStaObj.onboarding.checklist = {}; // What: Checklist Map Set. Why: The checklist manifest itself must exist as a real object before any item resolution can be written into it. How: This sets curStaObj.onboarding.checklist to a fresh empty object.


	}



	// #region Onboarding Checklist-Done Backfill

	/**
	 * store.js = Onboarding Checklist-Done Backfill
	 *
	 * @summary
	 * The same reasoning as the missing-onboarding branch above applies
	 * here too: an account whose onboarding object ALREADY existed
	 * (from an even older build, before checklistDone was ever added as
	 * a field) is just as established as one missing onboarding
	 * entirely, since it predates the checklist system either way.
	 * Defaulting to welcomed's own value tells the two cases apart:
	 * SED_NAM_OBJ.buiCleFun()'s own fresh onboarding is {welcomed:false,
	 * dismissed:false} at this point (no checklistDone key yet either),
	 * so this correctly still defaults false for a genuine first-time
	 * user, but an existing account that had already dismissed the
	 * (pre-checklist-era) welcome modal (welcomed:true) gets
	 * checklistDone:true instead of the unconditional false this used
	 * to backfill. That unconditional false is exactly what silently
	 * broke Replay Tour for real, established accounts that updated
	 * through this exact version gap: it got written back into their
	 * save the very first time migStaFun() ran post-update, so it stayed
	 * false in every export/import from that point on, permanently
	 * defeating collision suppression, App Features, and the Generate
	 * card for them.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	if ( curStaObj && curStaObj.onboarding && typeof curStaObj.onboarding.checklistDone !== 'boolean' ) { // What: Onboarding Checklist-Done Backfill Guard. Why: An account whose onboarding object already existed from before checklistDone was added needs it backfilled, per the design-rationale comment above. How: This gates the backfill below on curStaObj.onboarding existing but its own checklistDone not yet being a real boolean.


		curStaObj.onboarding.checklistDone = !!curStaObj.onboarding.welcomed; // What: Checklist-Done Set. Why: An account whose onboarding already existed is told apart from a genuine first-time user by its own welcomed value, per the design-rationale comment above. How: This sets curStaObj.onboarding.checklistDone to curStaObj.onboarding's own welcomed, coerced to a real boolean.


	}

	// #endregion Onboarding Checklist-Done Backfill



	// #region Generate-Scroll-Pending Backfill

	/**
	 * store.js = Generate-Scroll-Pending Backfill
	 *
	 * @summary
	 * A one-shot signal (added later) for tab-today.jsx's own auto-
	 * scroll to the Generate card: set the instant every OTHER
	 * checklist item becomes resolved (see setCarFun below),
	 * consumed (and cleared back to false) the next time TabTodCom
	 * renders with it true. Persisted state rather than a local ref/
	 * effect, deliberately: the LAST checklist item to resolve is very
	 * often finished from a mini-tour or Page Tour running on a
	 * DIFFERENT tab, which unmounts TabTodCom for the whole tour, so a
	 * plain "did I see false-then-true" ref would miss the transition
	 * entirely (it only resets, matching whatever the value already
	 * is, on each fresh mount). This flag survives that gap by living
	 * in state instead of the component.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	if ( curStaObj && curStaObj.onboarding && typeof curStaObj.onboarding.generateScrollPending !== 'boolean' ) { // What: Generate-Scroll-Pending Backfill Guard. Why: An account whose onboarding object predates this flag needs it backfilled, per the design-rationale comment above. How: This gates the backfill below on curStaObj.onboarding existing but its own generateScrollPending not yet being a real boolean.


		curStaObj.onboarding.generateScrollPending = false; // What: Generate-Scroll-Pending Set. Why: An account predating this flag has nothing pending to auto-scroll to yet. How: This sets curStaObj.onboarding.generateScrollPending to false.


	}

	// #endregion Generate-Scroll-Pending Backfill



	if ( curStaObj && curStaObj.onboarding && typeof curStaObj.onboarding.pageToursName !== 'string' ) { // What: Page-Tours Name Backfill. Why: The Edit Mode-rename-able display name for the Page Tours group was added later; unlike a real group's name this doesn't double as the group's own identity (still the fixed '__pageTours' sentinel everywhere else), so renaming it is a plain label swap. How: This backfills pageToursName to 'Page Tours' when it isn't already a string.


		curStaObj.onboarding.pageToursName = 'Page Tours'; // What: Page-Tours Name Set. Why: An account predating this field needs the same default display name the group itself already ships with. How: This sets curStaObj.onboarding.pageToursName to 'Page Tours'.


	}



	if ( curStaObj && curStaObj.onboarding && typeof curStaObj.onboarding.activeTour === 'undefined' ) { // What: Active-Tour Backfill. Why: Active tour progress ({id,step}|null, added later) lets a guided tour resume exactly where a reload interrupted it. How: This backfills activeTour to null when the field is entirely absent.


		curStaObj.onboarding.activeTour = null; // What: Active-Tour Set. Why: An account predating this field has no in-progress guided tour to resume. How: This sets curStaObj.onboarding.activeTour to null.


	}



	if ( curStaObj && curStaObj.onboarding && ( !curStaObj.onboarding.appFeatures || typeof curStaObj.onboarding.appFeatures !== 'object' ) ) { // What: App-Features Map Backfill. Why: App Features tutorials (see onboarding/app-features.jsx) are deliberately separate from checklist above (no donCouNum/total ring, no closing Generate-style card), just a per-item resolved/not flag. How: This backfills appFeatures to {} when it's missing or not a plain object.


		curStaObj.onboarding.appFeatures = {}; // What: App-Features Map Set. Why: The per-item resolved/not map itself must exist as a real object before any item can be written into it. How: This sets curStaObj.onboarding.appFeatures to a fresh empty object.


	}



	// #region App-Features Intro-Seen Backfill

	/**
	 * store.js = App-Features Intro-Seen Backfill
	 *
	 * @summary
	 * The "One Last Thing..." App Features intro tip (see onboarding-
	 * app-features.jsx's own AppFeaturesIntroTip) shows exactly once,
	 * right after the closing checklist's own generate() finishes,
	 * pointing at the freshly-appeared App Features section. An
	 * existing user whose checklist was ALREADY done before this
	 * existed has long since passed that moment, so backfilling them
	 * straight to "already seen" avoids ambushing a returning user with
	 * it on their next ordinary Regenerate; a brand-new save (or one
	 * still mid-checklist) keeps the real default (false), so the tip
	 * still fires naturally once they finish for the first time.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	if ( curStaObj && curStaObj.onboarding && typeof curStaObj.onboarding.appFeaturesIntroSeen !== 'boolean' ) { // What: App-Features Intro-Seen Backfill Guard. Why: An account whose onboarding object predates this flag needs it backfilled, per the design-rationale comment above. How: This gates the backfill below on curStaObj.onboarding existing but its own appFeaturesIntroSeen not yet being a real boolean.


		curStaObj.onboarding.appFeaturesIntroSeen = !!curStaObj.onboarding.checklistDone; // What: App-Features Intro-Seen Set. Why: An account whose checklist was already done has long since passed the moment this tip would fire, per the design-rationale comment above. How: This sets curStaObj.onboarding.appFeaturesIntroSeen to curStaObj.onboarding's own checklistDone, coerced to a real boolean.


	}

	// #endregion App-Features Intro-Seen Backfill



	if ( curStaObj && !Array.isArray( curStaObj.reminderLog ) ) curStaObj.reminderLog = []; // What: Reminder-Log Backfill. Why: The reminder completion log (append-only history of check-offs) was added later. How: This backfills reminderLog to [] when it isn't already an array.



	if ( curStaObj && !Array.isArray( curStaObj.reminderSkipLog ) ) curStaObj.reminderSkipLog = []; // What: Reminder-Skip-Log Backfill. Why: The reminder skip log (append-only history of skip actions) was added later. How: This backfills reminderSkipLog to [] when it isn't already an array.



	if ( curStaObj && !Array.isArray( curStaObj.vacationLog ) ) curStaObj.vacationLog = []; // What: Vacation-Log Backfill. Why: The inactive-state event log (append-only on/off transitions per item, so Stats can exclude ineligible days) was added later; old state is treated as always-eligible in the past, with the live item.vacation flag as current truth. How: This backfills vacationLog to [] when it isn't already an array.



	if ( curStaObj && !Array.isArray( curStaObj.conditionals ) ) curStaObj.conditionals = []; // What: Conditionals-Array Backfill. Why: Conditionals (per-day picker gates) were added later. How: This backfills conditionals to [] when it isn't already an array.



	// #region Conditional Active/Triggered Split

	/**
	 * store.js = Conditional Active/Triggered Split
	 *
	 * @summary
	 * Splits the old single `active` field into `active` (enabled, not
	 * inactive) and `triggered` (currently firing). Old `active` was
	 * really the trigger, so it migrates straight across. Also migrates
	 * old weight-ratio odds (weight 1-9 via w/(w+1)) into a direct
	 * percentage, oddsPct (10-90 by 10): weight 1 becomes 50, weight 9
	 * becomes 90.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	if ( curStaObj && Array.isArray( curStaObj.conditionals ) ) { // What: Conditional Active/Triggered Split Guard. Why: Every persisted conditional needs the old single active field split into active/triggered, per the design-rationale comment above. How: This gates the split below on curStaObj carrying a real conditionals array.


		curStaObj.conditionals = curStaObj.conditionals.map( ( curConObj ) => { // What: Conditional Split-And-Odds Map. Why: Every conditional needs both migrations applied, in order, before it's usable under the new shape. How: This applies the active/triggered split, then the weight-to-oddsPct migration, to each conditional.


			let nexConObj = ( 'triggered' in curConObj ) ? curConObj : { ...curConObj, active : true, triggered : !!curConObj.active }; // What: Split Conditional And Guard. Why: A conditional already carrying its own triggered field is already past this migration. How: This passes curConObj through unchanged when triggered already exists, else derives it from the old active value.


			if ( !( 'oddsPct' in nexConObj ) ) { // What: Odds-Percentage Migrate Guard. Why: Only a conditional still missing oddsPct needs its old weight-ratio odds converted. How: This derives oddsPct from nexConObj's own weight, clamped to the 10-90 range in steps of 10.


				const weiValNum = nexConObj.weight ?? 1; // What: Weight Value Number. Why: The odds formula below needs this conditional's own old weight, defaulting to 1 when absent. How: This reads nexConObj.weight, defaulting via ??.

				nexConObj = { ...nexConObj, oddsPct : Math.min( 90, Math.max( 10, Math.round( ( weiValNum / ( weiValNum + 1 ) ) * 10 ) * 10 ) ) }; // What: Odds-Percentage Set. Why: The caller needs a direct percentage replacing the old ratio-weight scheme. How: This converts weiValNum via w/(w+1), rounds to the nearest 10, then clamps to [10,90].


			}



			return nexConObj; // What: Migrated Conditional Return. Why: The map above needs the fully-migrated conditional. How: This returns nexConObj, built above.


		} );


	}

	// #endregion Conditional Active/Triggered Split



	if ( curStaObj && Array.isArray( curStaObj.pickers ) ) { // What: Picker Conditionalid Backfill. Why: Every picker needs a conditionalId slot so gating code elsewhere can read it uniformly, whether or not the picker is actually gated. How: This backfills conditionalId to null on any picker that doesn't already carry the field.


		curStaObj.pickers = curStaObj.pickers.map( ( curPicObj ) => ( 'conditionalId' in curPicObj ? curPicObj : { ...curPicObj, conditionalId : null } ) ); // What: Picker Conditionalid Map. Why: A picker already carrying conditionalId (even null) needs no change. How: This passes curPicObj through unchanged when it already has the field, else spreads in conditionalId:null.


	}



	if ( curStaObj && !Array.isArray( curStaObj.pickLog ) ) curStaObj.pickLog = []; // What: Pick-Log Backfill. Why: The per-pick history log was added later; old state has none, while a fresh seed ships a full year of rows via seed.js instead. How: This backfills pickLog to [] when it isn't already an array.



	if ( curStaObj && !Array.isArray( curStaObj.conditionalLog ) ) curStaObj.conditionalLog = []; // What: Conditional-Log Backfill. Why: The conditional history log (append-only, one row per conditional per completed cycle) was added later. How: This backfills conditionalLog to [] when it isn't already an array.



	// #region Ease-Down Weights Normalize

	/**
	 * store.js = Ease-Down Weights Normalize
	 *
	 * @summary
	 * Ease Down's own fair-rotation weights were added later. Older
	 * state carried arbitrary static per-item weights, so every ease-
	 * down picker is normalized once to the real invariant: its active
	 * item sits at weight 0 (barred from an immediate re-pick) and
	 * every other item sits at weight 1, so the fair rotation starts
	 * from a clean footing. Guarded by _easeDownWeightsInit so later
	 * accumulated weights are never reset again.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	if ( curStaObj && !curStaObj._easeDownWeightsInit && Array.isArray( curStaObj.pickers ) && Array.isArray( curStaObj.items ) ) { // What: Ease-Down Weights Normalize Guard. Why: Every ease-down item's own fair-rotation weight must be normalized from a clean footing exactly once, per the design-rationale comment above. How: This gates the normalize block below on the guard flag not yet being set, and both pickers/items actually being real arrays.


		for ( const curPicObj of curStaObj.pickers ) { // What: Ease-Down Normalize Loop. Why: Only an ease-down picker's own items need this one-time weight reset. How: This skips every non-ease-down picker, else rewrites its own items' weights below.


			if ( curPicObj.mode !== 'ease-down' ) continue; // What: Non-Ease-Down Skip Guard. Why: Every other mode's items already own their real weights. How: This skips straight to the next picker when curPicObj.mode isn't 'ease-down'.



			curStaObj.items = curStaObj.items.map( ( curIteObj ) => // What: Ease-Down Weight Reset. Why: The active item must sit at weight 0 and every sibling at weight 1, per the design-rationale comment above. How: This rewrites weight only for items owned by curPicObj, leaving every other item untouched.
				curIteObj.pickerId === curPicObj.id ? { ...curIteObj, weight : curIteObj.id === curPicObj.activeItemId ? 0 : 1 } : curIteObj ); // What: Weight Assignment. Why: Only this picker's own items are affected. How: This gives the active item weight 0, every sibling weight 1, and passes other pickers' items through.


		}


		curStaObj._easeDownWeightsInit = true; // What: Init-Guard Set. Why: This one-shot normalize must never re-fire and clobber real accumulated fairness weights. How: This flips the guard flag permanently true.


	}

	// #endregion Ease-Down Weights Normalize



	if ( curStaObj && Array.isArray( curStaObj.pickers ) ) { // What: Picker Fields Normalize Guard. Why: Several independent per-picker fields (daysOfWeek, the weekly-cadence anchor-day rule, skipHolidays, avoidDuplicates, Picker Cadence, hidden) were each added at different times and all need backfilling together. How: This maps every picker through each field's own default/normalize step.


		curStaObj.pickers = curStaObj.pickers.map( ( curPicObj ) => { // What: Picker Fields Normalize Map. Why: Every picker needs its own copy patched field-by-field before the caller gets the fully-backfilled array. How: This maps curStaObj.pickers, building nexPicObj from each field's own backfill/normalize step below.


			const nexPicObj = { ...curPicObj }; // What: Next Picker Object. Why: Every backfill below patches a copy, never curPicObj itself. How: This starts as a shallow copy of curPicObj.


			if ( !Array.isArray( nexPicObj.daysOfWeek ) ) nexPicObj.daysOfWeek = [ 0, 1, 2, 3, 4, 5, 6 ]; // What: Days-Of-Week Backfill. Why: A picker with no schedule override at all still needs an explicit "every day" default. How: This backfills daysOfWeek to every weekday when it isn't already an array.



			if ( CAD_NAM_OBJ ) nexPicObj.daysOfWeek = CAD_NAM_OBJ.enfWeeFun( nexPicObj ); // What: Weekly-Anchor Enforce. Why: For weekly cadence, the anchor day must always be one of the allowed days, backfilling state saved before this rule existed. How: This calls CAD_NAM_OBJ.enfWeeFun to fold nexPicObj's own anchor into its daysOfWeek.



			if ( typeof nexPicObj.skipHolidays !== 'boolean' ) nexPicObj.skipHolidays = false; // What: Skip-Holidays Backfill. Why: Every picker needs an explicit holiday-skipping flag. How: This backfills skipHolidays to false when it isn't already a boolean.



			if ( typeof nexPicObj.avoidDuplicates !== 'boolean' ) nexPicObj.avoidDuplicates = false; // What: Avoid-Duplicates Backfill. Why: The avoid-duplicate-item-names flag was added later. How: This backfills avoidDuplicates to false when it isn't already a boolean.



			if ( !CAD_NAM_OBJ.isaCadFun( nexPicObj.cadence ) ) Object.assign( nexPicObj, CAD_NAM_OBJ.norCadFun( nexPicObj ) ); // What: Picker-Cadence Normalize. Why: Picker Cadence (surfacing anchor + display unit) was added later; old state defaults to 'daily' (the original behavior) with sensible anchors. How: This calls CAD_NAM_OBJ.norCadFun and merges its own result onto nexPicObj when nexPicObj's own cadence isn't already a real one.



			if ( typeof nexPicObj.hidden !== 'boolean' ) nexPicObj.hidden = false; // What: Hidden-Flag Backfill. Why: Every picker needs an explicit hidden flag, same reasoning as the tasks backfill above. How: This backfills hidden to false when it isn't already a boolean.



			return nexPicObj; // What: Normalized Picker Return. Why: The map above needs the fully-backfilled picker. How: This returns nexPicObj, built above.


		} );


	}



	if ( curStaObj && ( !curStaObj.ui || typeof curStaObj.ui !== 'object' ) ) curStaObj.ui = {}; // What: Ui Object Backfill. Why: Persisted UI prefs need a real object to build on. How: This backfills curStaObj.ui to {} when it's missing or not a plain object.



	if ( curStaObj && ( !curStaObj.ui.controlsCollapsed || typeof curStaObj.ui.controlsCollapsed !== 'object' ) ) curStaObj.ui.controlsCollapsed = {}; // What: Controls-Collapsed Object Backfill. Why: controlsCollapsed maps a section id to whether its own Controls sub-panel is collapsed (absent/false means open) and was added later. How: This backfills curStaObj.ui.controlsCollapsed to {} when it's missing or not a plain object.



	// #region Today Ordering Backfill

	/**
	 * store.js = Today Ordering Backfill
	 *
	 * @summary
	 * Today ordering (Edit Mode, added later): groupOrder is the
	 * display order of the picker-based groups on Today; pickerOrder
	 * maps a group label to the ordered picker ids within it (drives
	 * per-row order). Both are backfilled from first-occurrence order
	 * in state.pickers so nothing shifts on upgrade, and any newly-seen
	 * group/picker is appended to the end. This block also tidies
	 * every stored picker group/name to the same Title-Case form the
	 * group/name selectors now produce (transform only, no mass de-dup,
	 * so a user's own pickers are never silently renamed into
	 * collision), and brings groupOrder/pickerOrder's own keys onto the
	 * normalized group names too.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	*/

	if ( curStaObj && Array.isArray( curStaObj.pickers ) ) { // What: Today Ordering Backfill Guard. Why: groupOrder/pickerOrder and the group/name tidy pass below all need a real pickers array to backfill from, per the design-rationale comment above. How: This gates the whole block below on curStaObj carrying a real pickers array.


		if ( norGroFun ) { // What: Name-Tidy Guard. Why: The tidy/normalize pass below only makes sense when the normalizer itself is actually available. How: This runs the whole tidy pass only when norGroFun is truthy.


			curStaObj.pickers.forEach( ( curPicObj ) => { // What: Picker Tidy Loop. Why: Every picker's own group and name need the same Title-Case tidy applied in place. How: This normalizes curPicObj.group and curPicObj.name, each only when the normalizer actually returns something.


				if ( curPicObj.group ) { // What: Group Tidy Guard. Why: A picker with no group at all has nothing to tidy. How: This normalizes curPicObj.group only when it's truthy.


					const norGroStr = norGroFun( curPicObj.group ); // What: Normalized Group String And Guard. Why: The normalizer may decline to return anything for an unusual input. How: This calls norGroFun on curPicObj's own group.


					if ( norGroStr ) curPicObj.group = norGroStr; // What: Group Tidy Write. Why: Only a genuine normalized result should overwrite the picker's own group. How: This writes norGroStr back onto curPicObj.group when it's truthy.


				}



				if ( curPicObj.name && norPicFun ) { // What: Name Tidy Guard. Why: A picker with no name, or with no normalizer available, has nothing to tidy. How: This normalizes curPicObj.name only when both are truthy.


					const norNamStr = norPicFun( curPicObj.name ); // What: Normalized Name String And Guard. Why: The normalizer may decline to return anything for an unusual input. How: This calls norPicFun on curPicObj's own name.


					if ( norNamStr ) curPicObj.name = norNamStr; // What: Name Tidy Write. Why: Only a genuine normalized result should overwrite the picker's own name. How: This writes norNamStr back onto curPicObj.name when it's truthy.


				}


			} );


			if ( Array.isArray( curStaObj.groupOrder ) ) { // What: Group-Order Normalize. Why: Stored order structures must land on the same normalized group names the tidy pass above just applied to every picker. How: This maps every groupOrder entry through norGroFun, except the 2 fixed sentinels which are never real group names.


				curStaObj.groupOrder = curStaObj.groupOrder.map( ( curGroStr ) => ( // What: Group-Order Normalize Map. Why: Every stored group name must match the normalized form the tidy pass above just wrote onto each picker, or ordering lookups would miss. How: This passes the '__reminders'/'__pageTours' sentinels through untouched, else normalizes curGroStr via norGroFun, falling back to itself.


					( curGroStr === '__reminders' || curGroStr === '__pageTours' ) ? curGroStr : ( norGroFun( curGroStr ) || curGroStr ) // What: Group Name Pick. Why: The two built-in pseudo-groups must keep their exact keys. How: This passes '__reminders' and '__pageTours' through and normalizes every other group name.


				) );


			}



			if ( curStaObj.pickerOrder && typeof curStaObj.pickerOrder === 'object' ) { // What: Picker-Order Remap Guard. Why: pickerOrder's own keys are group names too, so they need the exact same normalization, merging any pre-existing/post-existing keys that collide once normalized. How: This rebuilds pickerOrder keyed by normalized group name.


				const rmpOrdObj = {}; // What: Remapped Order Object And Guard. Why: The loop below needs somewhere to accumulate the re-keyed pickerOrder. How: This starts empty and is filled by the loop directly below.


				for ( const [ curGroStr, picIdeArr ] of Object.entries( curStaObj.pickerOrder ) ) { // What: Picker-Order Remap Loop. Why: Every old group key must be normalized and merged into rmpOrdObj before it replaces curStaObj's own pickerOrder. How: This iterates curStaObj.pickerOrder's own entries, concatenating each onto its own normalized key's bucket.


					const norKeyStr = norGroFun( curGroStr ) || curGroStr; // What: Normalized Key String. Why: The new pickerOrder must be keyed the same way groupOrder now is. How: This normalizes curGroStr, falling back to itself when the normalizer declines.

					rmpOrdObj[ norKeyStr ] = ( rmpOrdObj[ norKeyStr ] || [] ).concat( picIdeArr ); // What: Remapped Bucket Concat. Why: 2 old keys that normalize to the same new key must have their own picker-id lists merged, not overwrite each other. How: This concatenates picIdeArr onto whatever's already filed under norKeyStr.


				}


				curStaObj.pickerOrder = rmpOrdObj; // What: Picker-Order Writeback. Why: The remapped object must actually replace the old one. How: This assigns rmpOrdObj onto curStaObj.pickerOrder.


			}


		}



		const seeGroArr = []; // What: Seen Group Array And Guard. Why: The loop below needs to record each group's own first-occurrence order exactly once. How: This starts empty and is pushed into (without duplicates) by the loop directly below.
		const groIdeObj = {}; // What: Group Identifier Object And Guard. Why: The loop below needs to bucket every picker's own id under its own group. How: This starts empty and is filled by the loop directly below.


		for ( const curPicObj of curStaObj.pickers ) { // What: Group/Bucket Fill Loop. Why: Every picker must contribute its own group (once) to seeGroArr and its own id to groIdeObj's matching bucket. How: This iterates curStaObj.pickers, updating both structures per picker.


			const curGroStr = curPicObj.group || 'Other'; // What: Current Group String. Why: A picker with no group at all still needs a real bucket to file under. How: This reads curPicObj's own group, defaulting to 'Other'.


			if ( !seeGroArr.includes( curGroStr ) ) seeGroArr.push( curGroStr ); // What: First-Occurrence Push Guard. Why: Each group must appear in seeGroArr exactly once, in its own first-seen order. How: This pushes curGroStr only when it isn't already present.



			( groIdeObj[ curGroStr ] = groIdeObj[ curGroStr ] || [] ).push( curPicObj.id ); // What: Bucket Push. Why: This picker's own id must join every other picker already filed under the same group. How: This creates curGroStr's own bucket on first use, then pushes curPicObj.id into it.


		}



		if ( !Array.isArray( curStaObj.groupOrder ) ) curStaObj.groupOrder = seeGroArr.slice(); // What: Group-Order Seed. Why: State with no groupOrder at all starts from the natural first-occurrence order computed above. How: This assigns a fresh copy of seeGroArr.

		else for ( const curGroStr of seeGroArr ) if ( !curStaObj.groupOrder.includes( curGroStr ) ) curStaObj.groupOrder.push( curGroStr ); // What: Group-Order Append. Why: An EXISTING groupOrder must keep its own saved order, only gaining any newly-seen group at the end. How: This appends curGroStr only when it isn't already present.



		if ( !curStaObj.groupOrder.includes( '__reminders' ) ) curStaObj.groupOrder.unshift( '__reminders' ); // What: Reminders-Sentinel Backfill. Why: The Reminders block participates in the same Edit Mode ordering (via the '__reminders' sentinel) and defaults to the front for anyone who hasn't reordered it. How: This unshifts '__reminders' onto groupOrder when it isn't already present.



		if ( !curStaObj.pickerOrder || typeof curStaObj.pickerOrder !== 'object' ) curStaObj.pickerOrder = {}; // What: Picker-Order Object Backfill. Why: A pickerOrder that isn't already a plain object needs a fresh one before the loop below can write into it. How: This resets curStaObj.pickerOrder to {} when it fails either check.



		for ( const curGroStr of seeGroArr ) { // What: Per-Group Order Reconcile Loop. Why: Every seen group needs its own pickerOrder entry reconciled: real picker ids plus any surviving synthetic day-off/charging ids, deduped, with newly-seen pickers appended. How: This rebuilds curStaObj.pickerOrder[curGroStr] for every group in seeGroArr.


			const valIdeSet = new Set( groIdeObj[ curGroStr ] ); // What: Valid Identifier Set. Why: The filter below needs fast membership checks against this group's own real picker ids. How: This wraps groIdeObj's own bucket for curGroStr in a Set.
			const seeIdeSet = new Set();                         // What: Seen Identifier Set And Guard. Why: The filter below must defensively dedupe, self-healing any older corrupted order. How: This starts empty and is filled as the filter below runs.

			const exiOrdArr = ( Array.isArray( curStaObj.pickerOrder[ curGroStr ] ) ? curStaObj.pickerOrder[ curGroStr ] : [] ) // What: Existing Order Array. Why: A saved order must be kept when present, dropping anything no longer valid and any duplicate. How: This keeps ids that are either a real current picker or a surviving synthetic 'dayoff_' id, each only once.
				.filter( ( curIdeStr ) => ( valIdeSet.has( curIdeStr ) || String( curIdeStr ).startsWith( 'dayoff_' ) ) && !seeIdeSet.has( curIdeStr ) && seeIdeSet.add( curIdeStr ) ); // What: Valid Unique Filter. Why: A saved order may hold ids that no longer exist or repeat. How: This keeps valid ids (and day-off cards) the first time each one appears.


			for ( const curIdeStr of groIdeObj[ curGroStr ] ) if ( !exiOrdArr.includes( curIdeStr ) ) exiOrdArr.push( curIdeStr ); // What: Newly-Seen Append. Why: A picker not yet present in the saved order (new since last save) must still be appended at the end. How: This pushes curIdeStr onto exiOrdArr only when it isn't already present.



			curStaObj.pickerOrder[ curGroStr ] = exiOrdArr; // What: Per-Group Order Writeback. Why: The reconciled order must actually replace whatever curStaObj.pickerOrder[curGroStr] held before. How: This assigns exiOrdArr onto curStaObj.pickerOrder[curGroStr].


		}


	}

	// #endregion Today Ordering Backfill



	if ( curStaObj ) curStaObj.v = SCH_VER_NUM; // What: Schema-Version Stamp. Why: Every migrated state (and every exported backup) must record which schema shape it was actually migrated to. How: This writes SCH_VER_NUM onto curStaObj.v.



	return curStaObj; // What: Migrated State Return. Why: The caller needs the fully-backfilled state, mutated in place above. How: This returns curStaObj itself.


}

// #endregion migStaFun

// #endregion Helpers



// #region Exports

export { migStaFun }; // What: Named Export. Why: The store runs every loaded or imported state through it. How: This exports migStaFun by name.

// #endregion Exports


