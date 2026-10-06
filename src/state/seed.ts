


// #region Imports

import { HOL_NAM_OBJ } from '../core/holidays.ts'; // What: Holidays Namespace Object. Why: The clean state needs the canonical empty holidays shape. How: This is called (defStaFun) by buiCleFun below.
import { isoDayFun   } from '../utils/date.ts';    // What: Iso Day Function. Why: Dates are stored and compared as local-calendar YYYY-MM-DD keys. How: This formats a Date (or now) as that key.
import { TAS_NAM_OBJ } from '../core/tasks.ts';    // What: Tasks Namespace Object. Why: The clean state needs the reminders engine's own default options shape. How: This is called (defOptFun) by buiCleFun below.


import type { IteRcdTyp } from '../core/data-model.ts'; // What: Item Record Type. Why: The history simulation draws picks from items. How: This types every item parameter.
import type { OnbStaTyp } from '../core/data-model.ts'; // What: Onboarding State Type. Why: A fresh state carries only part of onboarding. How: This types CleStaTyp's narrowed onboarding.
import type { PclOutTyp } from '../core/data-model.ts'; // What: Pick-Log Outcome Type. Why: A simulated pick can be rejected or skipped. How: This types logPicFun's outcome.
import type { PclRowTyp } from '../core/data-model.ts'; // What: Pick-Log Row Type. Why: The simulation produces pick-log rows. How: This types picLogFun's history.
import type { PclSouTyp } from '../core/data-model.ts'; // What: Pick-Log Source Type. Why: A simulated pick records how it was made. How: This types logPicFun's source.
import type { PicRcdTyp } from '../core/data-model.ts'; // What: Picker Record Type. Why: The simulation runs every sample picker. How: This types every picker parameter.
import type { StaAppTyp } from '../core/data-model.ts'; // What: State App Type. Why: buiCleFun builds the whole clean state. How: This types CleStaTyp's base.

// #endregion Imports



/**
 * seed.ts = Seed Data And Canonical Types
 *
 * @summary
 * Canonical data-model documentation, the clean state a fresh install
 * starts from (buiCleFun), the picker modes (MOD_DEF_OBJ), and the
 * pick-history simulation the onboarding stats generator script reuses
 * (picLogFun). This comment is the closest thing this app has to a schema
 * doc: read it before touching buiCleFun or MOD_DEF_OBJ.
 *
 * Data model:
 *   item:   { id, name, pickerId, weight, value, vacation, picks,
 *             lastPicked, easeMin?, easeMax? }
 *   picker: { id, group, name, mode, easeMin, easeMax, threshold }
 *           A picker owns its items: its pool is every item whose own
 *           pickerId matches the picker's own id. group is a label
 *           that clusters pickers on Today; name is UI display only.
 *           mode is one of 'random', 'weighted', 'dynamic', 'ease-up',
 *           or 'ease-down'.
 *   today:  { entries: [{ pickerId, itemId, done, skipped }], generatedAt }
 *
 * value is the per-item drift state used by the dynamic, ease-up, and
 * ease-down modes:
 *   - dynamic: value adds to the base weight (effective = weight +
 *     value); a picked item resets its own value back to 0.
 *   - ease-up: value grows from 0 by a random amount between easeMin
 *     and easeMax each tick it's missed. An item becomes eligible once
 *     its own value reaches threshold, then resets to 0 once picked.
 *   - ease-down: value is the currently-active item's own charge. It
 *     starts at threshold (100), and on each run the active item's
 *     own value is reduced by a random amount between easeMin and
 *     easeMax. Once it reaches 0 or below, it auto-recharges to full
 *     and releases; a new item is then chosen by a system-managed
 *     weight (a fairness counter): the picked item's own weight resets
 *     to 0 (barring it from the very next pick), while every other
 *     item's own weight goes up by 1, so long-ignored items rise and
 *     picks stay fair over time.
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

// #region MOD_DEF_OBJ

/**
 * MOD_DEF_OBJ = Mode Definition Object
 *
 * @summary
 * Every mode entry below shares one shape, read wherever a picker's mode
 * needs a label or an explanation (the Pickers, Data and Stats tabs and
 * the picker mini-tours), and none of them repeat these fields' own
 * boilerplate comments on their own lines (see the "Repeated-shape
 * object literals" comment exception in CLAUDE.md):
 *
 * - `hinArr` (Array): Hint Array, the mode's user-facing copy as 2
 *   paragraphs, a ruleset paragraph followed by an explanation paragraph.
 *
 * - `labStr` (String): Label String, the mode's user-facing display name.
 *
 * The entries keep their authored order rather than an alphabetical one:
 * the Data tab and the conditional editor render one option per mode
 * through Object.entries, so this order is the order those options
 * appear in.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const MOD_DEF_OBJ = { // What: Mode Definition Object. Why: Every consumer needing a picker mode's own display label and explanatory hint text (Pickers/Data/Stats tabs, the picker mini-tours) reads this shared table. How: This maps each of pickers.ts's own 5 selection-algorithm keys to its own { label, hint } pair.


	'random' : { // What: Random Mode Entry. Why: This documents the random selection algorithm for the user. How: This pairs a display label with a 2-paragraph hint (ruleset, then explanation).


		labStr : 'Truly Random',

		hinArr : [


			'Ruleset: This picker’s ruleset makes it so that all of its items have an equally likely chance of being picked.',

			'Explanation: This is a good choice for being truly random, but it also has some drawbacks. e.g. it can pick the exact same item multiple times in a row or an item can go a long time without being picked.'


		]


	},

	'weighted' : { // What: Weighted Mode Entry. Why: This documents the weighted selection algorithm for the user. How: This pairs a display label with a 2-paragraph hint (ruleset, then explanation).


		labStr : 'Weighted',

		hinArr : [


			'Ruleset: This picker’s ruleset uses adjustable, weighted per-item values that can make them more (or less) likely to be picked.',

			'Explanation: This is a good choice for mitigating some of the Truly Random drawbacks by tuning individual items’ % chance to make them more (or less) likely to be picked. e.g. it can still pick the exact same item multiple times in a row or an item can go a long time without being picked, although it is less likely to do so.'


		]


	},

	'dynamic' : { // What: Dynamic Mode Entry. Why: This documents the dynamic weighted selection algorithm for the user. How: This pairs a display label with a 2-paragraph hint (ruleset, then explanation).


		labStr : 'Dynamic Weighted',

		hinArr : [


			'Ruleset: This picker’s ruleset is exactly the same as the Weighted picker, but it also adds a second per-item value that increments the weighted value every time an item is not picked and then resets its value every time that it is.',

			'Explanation: This is a good choice for mitigating almost all of the Truly Random drawbacks by tuning individual items’ % chance to make them more (or less) likely to be picked. Furthermore, by adding a dynamic per-item value it makes it increasingly likely to be picked when it isn’t and less likely when it is. e.g. it can still pick the exact same item multiple times in a row or an item can go a long time without being picked, although it is much less likely to do so.'


		]


	},

	'ease-up' : { // What: Ease Up Mode Entry. Why: This documents the ease-up selection algorithm for the user. How: This pairs a display label with a 2-paragraph hint (ruleset, then explanation).


		labStr : 'Ease Up',

		hinArr : [


			'Ruleset: This picker’s ruleset makes it so that all items are ineligible to be picked until their individual values reach 100, at which point they are put into a list of eligible items to be picked. Said values will start at 0 and are incremented every cycle by a random amount within a user defined range.',

			'Explanation: This is a good choice for ensuring that picker items can only be picked once every N days and can never be picked multiple times in a row. e.g. an item can only be picked at most once a week and must be picked at least once every two weeks.'


		]


	},

	'ease-down' : { // What: Ease Down Mode Entry. Why: This documents the ease-down selection algorithm for the user. How: This pairs a display label with a 2-paragraph hint (ruleset, then explanation).


		labStr : 'Ease Down',

		hinArr : [


			'Ruleset: This picker’s ruleset is the opposite of the Ease Up picker. It makes it so that all items are eligible to be picked and once an item is picked it will stay picked until its value reaches 0, at which point a new item is picked. Said value will start at 100 and is decremented every cycle by a random amount within a user defined range.',

			'Explanation: This is a good choice for ensuring that an item stays picked for at least N days and then is not picked again for at least one cycle afterwards. e.g. it must remain picked for at least a week and must not remain picked for more than two weeks.'


		]


	}


};

// #endregion MOD_DEF_OBJ

// #endregion Constants



// #region Helpers

// #region picWeiFun

/**
 * picWeiFun = Pick Weighted Function
 *
 * @summary
 * Picks one random item from a pool, weighted by each item's own
 * weight field (falling back to 1 for an item with no weight at all).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param itePooArr - Item Pool Array: The pool of items to pick from.
 *
 * @returns The chosen item.
 *
 * @example
 * ```ts
 * picWeiFun(itePooArr) // => chosen item object
 * ```
 *
*/

function picWeiFun ( itePooArr : IteRcdTyp[] ) : IteRcdTyp {


	const totWeiNum = itePooArr.reduce( ( sumWeiNum, curIteObj ) => sumWeiNum + ( curIteObj.weight || 1 ), 0 ); // What: Total Weight Number. Why: The random draw below needs the combined weight of the whole pool to scale against. How: This sums every item's own weight, defaulting a missing weight to 1.

	let remWeiNum = Math.random() * totWeiNum; // What: Remaining Weight Number And Guard. Why: The loop below needs a running countdown to know which item the random draw landed on. How: This starts at a random point somewhere within the total weight.


	for ( const curIteObj of itePooArr ) { // What: Weighted Draw Loop. Why: Every item in the pool must be walked in order, subtracting its own weight, until the running countdown crosses zero. How: This iterates itePooArr, returning the first item whose own weight subtraction brings remWeiNum to zero or below.


		remWeiNum -= ( curIteObj.weight || 1 ); // What: Remaining Weight Subtraction. Why: This item's own share of the total must be removed from the running countdown before checking whether it was the one drawn. How: This subtracts curIteObj's own weight (or 1, if missing) from remWeiNum.



		if ( remWeiNum <= 0 ) return curIteObj; // What: Draw Hit Guard. Why: Once the countdown crosses zero, this is the item the weighted draw landed on. How: This returns curIteObj immediately once remWeiNum is zero or below.


	}



	return itePooArr[ itePooArr.length - 1 ]; // What: Fallback Last Item Return. Why: Floating-point rounding could in rare cases leave the loop above without ever triggering its own return. How: This returns the pool's own last item as a safe fallback.


}

// #endregion picWeiFun



type EasStaTyp = Record< string, { activeItemId : string | null, charge : number } >; // What: Ease State Type. Why: The simulation ends with each Ease Down picker's live item and charge, which the sample data carries into the real state. How: This maps each picker id to its active item id (or null) and charge.

// #region picLogFun

/**
 * picLogFun = Pick Log Function
 *
 * @summary
 * Builds about 1 year of per-pick history (Stats reads this directly,
 * not an aggregate). For each past day, every scheduled picker
 * contributes one pick (its own weighted choice), marked done with a
 * high-but-imperfect probability. A sprinkling of fully "off" days
 * breaks up streaks so they read honestly; the most recent 10 days are
 * forced active so the headline streak (about 11) holds. Ease Down
 * pickers are handled separately below: an item, once chosen, stays
 * picked every run and decays until its own charge hits 0 (a completed
 * depletion streak, flagged depletedEnd), at which point a new item is
 * chosen. A few streaks are abandoned early (no depletedEnd) to prove
 * Stats' own "Spent" count only tallies completed cycles.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param allIteArr - All Item Array: Every seeded item to draw picks from.
 * @param allPicArr - All Picker Array: Every seeded picker to generate history
 *                    for.
 * @param isaVacFun - Is-A Vacation Function: {@link isaVacFun}
 * @param totDayNum - Total Day Number: How many days of history to generate,
 *                    counting back from today; defaults to 365.
 *
 * @returns The generated rows plus each Ease Down picker's own final
 * in-progress state.
 *
 * @example
 * ```ts
 * picLogFun(allIteArr, allPicArr, isaVacFun, 365) // => { easStaObj, ... }
 * ```
 *
*/

function picLogFun ( allIteArr : IteRcdTyp[], allPicArr : PicRcdTyp[], isaVacFun : ( iteIdeStr : string, dayIsoStr : string ) => boolean, totDayNum : number = 365 ) : { easStaObj : EasStaTyp, hisRowArr : PclRowTyp[] } {


	const picRowArr = [];         // What: Pick Row Array And Guard. Why: Every row built by logPicFun below needs somewhere to accumulate. How: This starts empty and is pushed into below.
	const todMidObj = new Date(); // What: Today Midnight Object. Why: Every simulated day below is computed relative to this same anchor. How: This is read as "now" and then floored to midnight on the next line.

	todMidObj.setHours( 0, 0, 0, 0 ); // What: Today Midnight Hours Reset. Why: Only the calendar day matters for the day-offset arithmetic below, not the current time of day. How: This zeroes out todMidObj's own hours/minutes/seconds/milliseconds in place.


	const picPooObj = {}; // What: Picker Pool Object And Guard. Why: The simulation below repeatedly needs "every item belonging to this picker," which would otherwise mean re-filtering allIteArr on every single day simulated. How: This starts empty and is filled once by the loop directly below, then read many times.


	for ( const curIteObj of allIteArr ) ( picPooObj[ curIteObj.pickerId ] = picPooObj[ curIteObj.pickerId ] || [] ).push( curIteObj ); // What: Picker Pool Fill Loop. Why: Every item must be filed under its own picker exactly once before the simulation below can look pools up cheaply. How: This iterates allIteArr, creating each picker's own bucket on first use and pushing curIteObj into it.


	let seqCouNum = 0; // What: Sequence Count Number And Guard. Why: Every row needs its own unique id, and nothing else in this scope tracks that count. How: This starts at 0 and is incremented once per row created below.

	const ranBetFun = ( lowBouNum : number, higBouNum : number ) => lowBouNum + Math.random() * ( higBouNum - lowBouNum ); // What: Random Between Function. Why: Several places below need a random value somewhere inside a given range, not just 0 to 1. How: This scales Math.random()'s own 0-1 output into the [ lowBouNum, higBouNum ] range.


	const logPicFun = ( datValObj : Date, curPicObj : PicRcdTyp, curIteObj : IteRcdTyp, donValBoo : boolean, souValStr : PclSouTyp, outValStr? : PclOutTyp, depEndBoo? : boolean ) => { // What: Log Pick Function. Why: Every simulated pick, toss, skip, or Ease Down tick below shares the same row-building logic. How: This builds one pickLog row shaped to state.pickLog's own contract and pushes it onto picRowArr.


		const picTimObj = new Date( datValObj ); // What: Pick Timestamp Object. Why: A completed pick needs a plausible time of day, not just a bare date. How: This constructs a fresh copy of datValObj to set a random time of day on below.

		picTimObj.setHours( 8 + Math.floor( Math.random() * 12 ), Math.floor( Math.random() * 60 ), 0, 0 ); // What: Pick Timestamp Hours Set. Why: A real completion could happen any time between 8am and 8pm, not always at the same instant. How: This sets a random hour in that range and a random minute, zeroing seconds/milliseconds.



		picRowArr.push({ // What: Pick Row Push. Why: This is one simulated row, in the exact shape state.pickLog itself expects. How: This builds the row from every argument above, spreading in outcome/depletedEnd only when actually given.


			completedAt : ( outValStr !== 'rejected' && donValBoo ) ? picTimObj.toISOString() : null, // What: Completed At. Why: Only an actually-completed, non-rejected row has a real completion timestamp. How: This uses picTimObj's own ISO string only when both conditions hold, otherwise null.
			date        : isoDayFun( datValObj ),                                                     // What: Date. Why: Stats groups and filters rows by their own calendar day. How: This converts datValObj via isoDayFun.
			done        : outValStr === 'rejected' ? false : donValBoo,                               // What: Done. Why: A rejected toss was never actually completed, regardless of what donValBoo says. How: This forces false for a rejected row, otherwise uses donValBoo as given.
			eid         : null,                                                                       // What: Entry Identifier. Why: A simulated historical row was never a live Today entry, so it has no entry to reference. How: This is always null for a row built by this simulation.
			group       : curPicObj.group,                                                            // What: Group. Why: Stats groups rows by their own picker's group. How: This is copied straight from curPicObj's own group.
			id          : 'pls_' + ( seqCouNum++ ).toString( 36 ),                                    // What: Id. Why: Every row needs its own stable, unique identifier. How: This mints one from a running counter, prefixed 'pls_'.
			itemId      : curIteObj.id,                                                               // What: Item Id. Why: Every row must record which item it belongs to. How: This is copied straight from curIteObj's own id.
			itemName    : curIteObj.name,                                                             // What: Item Name. Why: This denormalized copy lets the row survive a later rename or deletion of the item itself. How: This is copied straight from curIteObj's own name.
			pickerId    : curPicObj.id,                                                               // What: Picker Id. Why: Every row must record which picker it belongs to. How: This is copied straight from curPicObj's own id.
			pickerName  : curPicObj.name,                                                             // What: Picker Name. Why: This denormalized copy lets the row survive a later rename or deletion of the picker itself. How: This is copied straight from curPicObj's own name.
			source      : souValStr,                                                                  // What: Source. Why: Stats breaks rows down by how the pick was made. How: This is copied straight from souValStr.

			...( outValStr ? { outcome : outValStr } : {} ), // What: Outcome Spread. Why: Most rows have no special outcome at all, so the field should be entirely absent rather than present-but-null. How: This spreads in an outcome field only when outValStr was actually given.
			...( depEndBoo ? { depletedEnd : true } : {} )   // What: Depleted End Spread. Why: Only the row ending an Ease Down depletion streak needs this flag at all. How: This spreads in depletedEnd : true only when depEndBoo is truthy.


		});


	};


	const isaOffFun = ( dayIndNum : number ) => dayIndNum === 11 ? true : ( dayIndNum <= 10 ? false : Math.random() < 0.13 ); // What: Is-An Off Function. Why: A sprinkling of fully skipped days makes the simulated streaks below read as honest rather than mechanically perfect, while the most recent 10 days are forced active so the headline streak holds. How: This forces day 11 off, forces days 0-10 active, and otherwise rolls a 13% chance of being off.


	for ( let dayIndNum = totDayNum - 1; dayIndNum >= 1; dayIndNum-- ) { // What: Daily Simulation Loop. Why: Every past day (excluding today, added separately from today.entries) needs its own simulated picks. How: This walks backward from totDayNum - 1 days ago to 1 day ago.


		const curDatObj = new Date( todMidObj ); curDatObj.setDate( todMidObj.getDate() - dayIndNum ); // What: Current Date Object. Why: Every check and row below needs this simulated day's own real date. How: This constructs a fresh copy of todMidObj, then moves it back dayIndNum days.
		const curDowNum = curDatObj.getDay();                                                          // What: Current Day-Of-Week Number. Why: A picker's own daysOfWeek schedule must be checked against this simulated day's own weekday. How: This reads curDatObj's own weekday via Date.getDay().



		if ( isaOffFun( dayIndNum ) ) continue; // What: Off Day Guard. Why: A day rolled fully off has no picks at all, for any picker. How: This skips straight to the next day when isaOffFun reports true.



		for ( const curPicObj of allPicArr ) { // What: Per-Picker Simulation Loop. Why: Every scheduled picker needs its own simulated pick for this simulated day. How: This iterates allPicArr, skipping any picker not due to run today.


			if ( curPicObj.mode === 'ease-down' ) continue; // What: Ease Down Skip Guard. Why: Ease Down pickers are simulated separately below, since they carry state across days rather than picking fresh each time. How: This skips an Ease Down picker entirely in this loop.



			if ( Array.isArray( curPicObj.daysOfWeek ) && !curPicObj.daysOfWeek.includes( curDowNum ) ) continue; // What: Schedule Skip Guard. Why: A picker not scheduled for this simulated day's own weekday must not pick at all today. How: This skips the picker when its own daysOfWeek excludes curDowNum.



			const dayIsoStr = isoDayFun( curDatObj );                                                                               // What: Day Iso String. Why: The inactive-state filter below needs a plain comparable date string, not a Date instance. How: This converts curDatObj via isoDayFun.
			const itePooArr = ( picPooObj[ curPicObj.id ] || [] ).filter( ( curIteObj ) => !isaVacFun( curIteObj.id, dayIsoStr ) ); // What: Item Pool Array And Guard. Why: An item inactive on this simulated day must not be eligible for it. How: This filters curPicObj's own pool down to items isaVacFun does not report inactive.


			if ( !itePooArr.length ) continue; // What: Empty Pool Guard. Why: A picker with nothing eligible today (e.g. every item currently inactive) cannot pick at all. How: This skips to the next picker when itePooArr is empty.



			const curIteObj = picWeiFun( itePooArr ); // What: Current Item Object. Why: This is the item this simulated day's own pick actually lands on. How: This draws one item from itePooArr, weighted by each item's own weight.


			if ( itePooArr.length > 1 && Math.random() < 0.2 ) { // What: Reroll Simulation Guard. Why: About 20% of real days involve the user rerolling once or twice before settling, and that history should be visible too. How: This only simulates a reroll when there is more than one eligible item and a 20% roll succeeds.


				const tosCouNum = Math.random() < 0.7 ? 1 : 2; // What: Toss Count Number. Why: A rerolling user usually rerolls once, occasionally twice. How: This rolls 1 toss 70% of the time, otherwise 2.


				for ( let tosIndNum = 0; tosIndNum < tosCouNum; tosIndNum++ ) { // What: Toss Loop. Why: Every simulated reroll needs its own discarded, rejected row logged before the final pick. How: This runs tosCouNum times, each drawing and logging one discarded item.


					let tosIteObj; // What: Tossed Item Object And Guard. Why: The do/while loop directly below needs somewhere to hold its own candidate before the loop condition can check it. How: This starts undefined and is assigned inside the loop body.


					do { tosIteObj = itePooArr[ Math.floor( Math.random() * itePooArr.length ) ]; } // What: Toss Draw Attempt. Why: Every retry needs a fresh random candidate to check against curIteObj. How: This draws one random item from itePooArr into tosIteObj.

					while ( tosIteObj.id === curIteObj.id && itePooArr.length > 1 ); // What: Toss Draw Repeat Condition. Why: A discarded item must actually differ from the final pick whenever another option exists. How: This keeps redrawing while tosIteObj still matches curIteObj and more than one option remains, giving up once itePooArr has only 1 item.


					if ( tosIteObj.id !== curIteObj.id ) logPicFun( curDatObj, curPicObj, tosIteObj, false, 'auto', 'rejected' ); // What: Toss Row Guard. Why: Only a genuinely different, discarded item should be logged as rejected. How: This logs tosIteObj as a rejected row only when it differs from curIteObj.


				}


			}



			const isaDonBoo = Math.random() < 0.82;                                               // What: Is-A Done Boolean. Why: A real generated pick is usually, but not always, actually completed. How: This rolls an 82% chance of having been completed.
			const souRolNum = Math.random();                                                      // What: Source Roll Number. Why: The source mix below needs one shared random roll to pick from. How: This rolls once, reused by souValStr's own ternary chain directly below.
			const souValStr = souRolNum < 0.10 ? 'manual' : souRolNum < 0.16 ? 'reroll' : 'auto'; // What: Source Value String. Why: Most picks come from the daily generator, with a smaller mix of hand-pushed and rerolled picks. How: This resolves souRolNum into 'manual' (10%), 'reroll' (6%), or 'auto' (the remaining 84%).



			if ( Math.random() < 0.09 ) { logPicFun( curDatObj, curPicObj, curIteObj, false, souValStr, 'skipped' ); continue; } // What: Skip Simulation Guard. Why: About 9% of the time, a real generated pick is skipped (marked, not completed) rather than acted on at all. How: This logs curIteObj as a skipped row and moves on to the next picker.



			logPicFun( curDatObj, curPicObj, curIteObj, isaDonBoo, souValStr ); // What: Normal Pick Log Call. Why: Every other simulated pick is logged as an ordinary row. How: This logs curIteObj with its own rolled done state and source.


		}


	}



	const easStaObj : EasStaTyp = {}; // What: Ease State Object And Guard. Why: Every Ease Down picker's own final in-progress state must be reported back to the caller, since the live app needs to resume it. How: This starts empty and is filled once per Ease Down picker by the loop directly below.


	for ( const curPicObj of allPicArr ) { // What: Ease Down Simulation Loop. Why: An Ease Down picker's own item stays picked across many days and decays over time, which the per-picker loop above deliberately skips. How: This simulates every Ease Down picker's own full history independently.


		if ( curPicObj.mode !== 'ease-down' ) continue; // What: Non-Ease-Down Skip Guard. Why: Only an Ease Down picker needs this simulation at all. How: This skips straight to the next picker otherwise.



		const thrValNum = curPicObj.threshold ?? 100; // What: Threshold Value Number. Why: Every charge calculation below needs this picker's own starting/eligibility value. How: This reads curPicObj's own threshold, defaulting to 100 when missing.

		let actIteObj = null; // What: Active Item Object And Guard. Why: The simulation below needs a running "currently active item" slot, starting with none picked yet. How: This starts null and is assigned/cleared throughout the loop below.
		let chaValNum = 0;    // What: Charge Value Number And Guard. Why: The simulation below needs a running charge for whichever item is active. How: This starts at 0, immediately overwritten once an item first becomes active below.


		for ( let dayIndNum = totDayNum - 1; dayIndNum >= 1; dayIndNum-- ) { // What: Ease Down Daily Loop. Why: This picker's own decay must be simulated one day at a time, in order, since each day's own charge depends on the day before it. How: This walks backward from totDayNum - 1 days ago to 1 day ago.


			const curDatObj = new Date( todMidObj ); curDatObj.setDate( todMidObj.getDate() - dayIndNum ); // What: Current Date Object. Why: Every check and row below needs this simulated day's own real date. How: This constructs a fresh copy of todMidObj, then moves it back dayIndNum days.
			const curDowNum = curDatObj.getDay();                                                          // What: Current Day-Of-Week Number. Why: This picker's own daysOfWeek schedule must be checked against this simulated day's own weekday. How: This reads curDatObj's own weekday via Date.getDay().


			if ( Array.isArray( curPicObj.daysOfWeek ) && !curPicObj.daysOfWeek.includes( curDowNum ) ) continue; // What: Schedule Skip Guard. Why: This picker not being scheduled for this simulated day's own weekday means no decay tick happens at all today. How: This skips the day when curPicObj's own daysOfWeek excludes curDowNum.



			if ( isaOffFun( dayIndNum ) ) continue; // What: Off Day Guard. Why: A day rolled fully off has no decay tick either. How: This skips straight to the next day when isaOffFun reports true.



			const dayIsoStr = isoDayFun( curDatObj );                                                                               // What: Day Iso String. Why: The inactive-state filter below needs a plain comparable date string, not a Date instance. How: This converts curDatObj via isoDayFun.
			const itePooArr = ( picPooObj[ curPicObj.id ] || [] ).filter( ( curIteObj ) => !isaVacFun( curIteObj.id, dayIsoStr ) ); // What: Item Pool Array And Guard. Why: An item inactive on this simulated day must not be eligible to become (or remain) active. How: This filters curPicObj's own pool down to items isaVacFun does not report inactive.


			if ( !itePooArr.length ) { actIteObj = null; continue; } // What: Empty Pool Guard. Why: With nothing eligible today, any in-progress item must be abandoned rather than kept active. How: This clears actIteObj and skips to the next day.



			if ( actIteObj && isaVacFun( actIteObj.id, dayIsoStr ) ) actIteObj = null; // What: Active Item Inactive Guard. Why: An in-progress item that just became inactive can no longer stay the active one. How: This clears actIteObj when isaVacFun reports it inactive on this simulated day.



			if ( actIteObj && Math.random() < 0.05 ) actIteObj = null; // What: Random Abandon Guard. Why: A real user occasionally rerolls or manually abandons an in-progress Ease Down item before it fully depletes. How: This clears actIteObj on a 5% roll, simulating that abandonment.



			if ( !actIteObj ) { // What: New Active Item Guard. Why: This is the guard gating the whole block below: with no item currently active, one must be drawn and started at full charge. How: This checks actIteObj for falsiness before running the 2 statements below.


				actIteObj = picWeiFun( itePooArr ); // What: New Active Item Assignment. Why: With no item currently active, a fresh one must be drawn from this picker's own pool. How: This assigns a weighted pick from itePooArr to actIteObj.
				chaValNum = thrValNum;              // What: Charge Value Full Reset. Why: A freshly-activated item must start at full charge, matching a real Ease Down pick. How: This sets chaValNum to thrValNum, resolved above.


			}



			const decValNum = ranBetFun( actIteObj.easeMin ?? curPicObj.easeMin ?? 20, actIteObj.easeMax ?? curPicObj.easeMax ?? 34 ); // What: Decay Value Number. Why: Every simulated day, the active item's own charge decays by a random amount within its own (or its picker's own) ease range. How: This resolves a random value between actIteObj's own easeMin/easeMax, falling back to curPicObj's own, then a hardcoded default.

			chaValNum = Math.max( 0, chaValNum - decValNum ); // What: Charge Value Decay. Why: The active item's own charge must never be simulated below 0. How: This subtracts decValNum from chaValNum, floored at 0.

			const depEndBoo = chaValNum <= 0; // What: Depleted End Boolean. Why: The row logged below needs to know whether this simulated day completed a full depletion cycle. How: This is true exactly when chaValNum has reached 0.


			logPicFun( curDatObj, curPicObj, actIteObj, Math.random() < 0.82, 'auto', null, depEndBoo ); // What: Ease Down Pick Log Call. Why: Every simulated day of an Ease Down streak still needs its own logged row. How: This logs actIteObj, rolling its own done state independently of the charge simulation.


			if ( depEndBoo ) actIteObj = null; // What: Depleted Release Guard. Why: A fully depleted item must release so the next day can choose a fresh one. How: This clears actIteObj once depEndBoo is true.


		}


		easStaObj[ curPicObj.id ] = actIteObj ? { activeItemId : actIteObj.id, charge : chaValNum } : { activeItemId : null, charge : 0 }; // What: Ease State Assignment. Why: The caller needs this picker's own final in-progress state, whatever it ended on. How: This records actIteObj's own id and charge, or a fully-released empty state when nothing is active.


	}



	return { easStaObj : easStaObj, hisRowArr : picRowArr }; // What: Pick Log Return. Why: The caller (scripts/build-onboarding-stats.mts) needs both the generated rows and every Ease Down picker's own final state at once. How: This returns picRowArr and easStaObj under their own external contract key names.


}

// #endregion picLogFun



type CleStaTyp = Omit< StaAppTyp, 'groupOrder' | 'onboarding' | 'pickerOrder' | 'ui' | 'v' > & { onboarding : Pick< OnbStaTyp, 'dismissed' | 'welcomed' > }; // What: Clean State Type. Why: A fresh state is never used until migStaFun has run on it, which fills in the group and picker orders, the UI settings, the schema version, and the rest of onboarding. How: This is the full app state without those four fields, and with onboarding narrowed to the two flags a new user needs.

// #region buiCleFun

/**
 * buiCleFun = Build Clean Function
 *
 * @summary
 * Builds the canonical clean state: what a brand-new user sees, no
 * pickers, no items, no reminders, and every app setting at its own
 * default. A Reset restores exactly this. It leaves a few fields for
 * migStaFun to fill in, which every caller runs on it before use.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns The clean app state, before migStaFun completes it.
 *
 * @example
 * ```ts
 * buiCleFun() // => full clean app state object
 * ```
 *
*/

function buiCleFun () : CleStaTyp {


	return { // What: Clean State Return. Why: This is the full canonical empty app state, in state's own top-level shape. How: This builds every top-level field to its own genuinely empty/default value.


		conditionalLog  : [],                                                          // What: Conditional Log. Why: A brand-new user has no conditional trigger history at all. How: This is an empty array.
		conditionals    : [],                                                          // What: Conditionals. Why: A brand-new user has no conditionals at all. How: This is an empty array.
		daily           : { mode : 'auto', pickerIds : [], runTime : '04:00' },        // What: Daily. Why: The Daily generator needs a valid, empty configuration to start from. How: This is an empty pickerIds list paired with the app's own default runTime/mode.
		holidays        : HOL_NAM_OBJ.defStaFun(),                                     // What: Holidays. Why: A brand-new user still needs a real, canonical holidays-state shape. How: This calls HOL_NAM_OBJ's own defStaFun.
		items           : [],                                                          // What: Items. Why: A brand-new user has no items at all. How: This is an empty array.
		onboarding      : { dismissed : false, welcomed : false },                     // What: Onboarding. Why: A brand-new user must actually see onboarding (the welcome modal, tour, and checklist). How: This marks onboarding as neither welcomed nor dismissed.
		pickers         : [],                                                          // What: Pickers. Why: A brand-new user has no pickers at all. How: This is an empty array.
		pickLog         : [],                                                          // What: Pick Log. Why: A brand-new user has no pick history at all. How: This is an empty array.
		reminderLog     : [],                                                          // What: Reminder Log. Why: A brand-new user has no reminder completion history at all. How: This is an empty array.
		reminderOpts    : TAS_NAM_OBJ.defOptFun(),                                     // What: Reminder Opts. Why: A brand-new user still needs a full, valid reminder-options object. How: This calls TAS_NAM_OBJ's own defOptFun.
		reminderSkipLog : [],                                                          // What: Reminder Skip Log. Why: A brand-new user has no reminder skip history at all. How: This is an empty array.
		streak          : 0,                                                           // What: Streak. Why: A brand-new user has no streak yet. How: This is a fixed literal 0.
		tasks           : [],                                                          // What: Tasks. Why: A brand-new user has no reminders at all. How: This is an empty array.
		today           : { entries : [], generatedAt : null, streakClaimed : false }, // What: Today. Why: A brand-new user still needs a valid Today, just an entirely empty one. How: This is an empty entry list with no generation yet.
		vacationLog     : [],                                                          // What: Vacation Log. Why: A brand-new user has no inactive-state history at all. How: This is an empty array.

		appearance : { autoSystem : false, completionStyle : 'confetti', customDark : null, customLight : null, pickAnim : 'reel', tabPlacement : 'bottom', theme : 'ink' } // What: Appearance. Why: A brand-new user still needs a full, valid appearance settings object. How: This is the app's own default theme/animation/placement settings.


	};


}

// #endregion buiCleFun

// #endregion Helpers



// #region Exports

const SED_NAM_OBJ = { // What: Seed Namespace Object. Why: This is the single public entry point every consumer imports by name. How: This maps this file's own internal function/constant names directly onto matching external property names.


	buiCleFun   : buiCleFun,   // What: Build Clean Function. Why: A brand-new install, and a hard reset, both need this fresh empty-state shape rather than any sample data. How: This re-exports buiCleFun under its own matching name.
	MOD_DEF_OBJ : MOD_DEF_OBJ, // What: Mode Definition Object. Why: Every consumer needing a picker mode's own display label and explanatory hint text reads this shared table. How: This re-exports MOD_DEF_OBJ under its own matching name.
	picLogFun   : picLogFun    // What: Pick Log Function. Why: scripts/build-onboarding-stats.mts reuses this exact simulation to precompute the Welcome Tour's own sample history offline. How: This re-exports picLogFun under its own matching name.


};



export { SED_NAM_OBJ }; // What: Seed Namespace Object Export. Why: store.ts, the tabs, the tours and the onboarding-stats script reach the clean state, the mode table and the simulation helpers through the one namespace object. How: This exports SED_NAM_OBJ by name at the very end of the file.

// #endregion Exports


