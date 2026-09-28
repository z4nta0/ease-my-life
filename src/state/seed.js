





// #region Imports

import { HOL_NAM_OBJ } from '../core/holidays.js'; // What: Holidays Namespace Object. Why: The seeded demo state needs a real holidays-state shape, and the clean state needs the same canonical empty one. How: This is called (defStaFun) by both buiCleFun and buiSeeFun below.
import { isoDayFun   } from '../utils/date.js';    // What: Iso Day Function. Why: Dates are stored and compared as local-calendar YYYY-MM-DD keys. How: This formats a Date (or now) as that key.
import { TAS_NAM_OBJ } from '../core/tasks.js';    // What: Tasks Namespace Object. Why: The seeded demo state needs a few real reminder task objects, built to the reminders engine's own shape. How: This is called (defTasFun/defOptFun) by buiSeeFun and buiCleFun below.

// #endregion Imports



/**
 * seed.js = Seed Data And Canonical Types
 *
 * @summary
 * Canonical data-model documentation and sample/clean state builders
 * for Ease My Life. This comment is the closest thing this app has to
 * a schema doc: read it before touching buiCleFun, MOD_DEF_OBJ, or any of
 * the other buiXxxFun builders below.
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
 *   today:  { date, entries: [{ pickerId, itemId, done, skipped }] }
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

// #region ITE_DEF_ARR

/**
 * ITE_DEF_ARR = Item Definition Array
 *
 * @summary
 * The single source of truth every demo item in buiIteFun below is
 * expanded from; every item is tied to its own picker purely via its
 * own 2nd tuple field, pickerId.
 *
 * Isn't item objects directly, though: it's a flat list of raw tuples,
 * each [ name, pickerId, weight, value, vacation?, deleted? ],
 * destructured positionally by buiIteFun below into the full item
 * shape documented in this file's own top-level comment. vacation and
 * deleted both default to false when omitted, and every tuple shares
 * this exact same shape, so none of them repeat its own boilerplate
 * comment (see the "Repeated-shape object literals" exception in
 * CLAUDE.md); the 2 entries that actually set vacation or deleted keep
 * their own specific comment explaining why.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const ITE_DEF_ARR = [


	// #region Daily Chores

	[ 'Water the plants', 'pkr_chore_d', 1, 64 ],
	[ 'Wipe kitchen counters', 'pkr_chore_d', 2, 12 ],
	[ 'Take out compost', 'pkr_chore_d', 1, 88 ],
	[ 'Tidy entry table', 'pkr_chore_d', 1, 47 ],
	[ 'Sort the mail', 'pkr_chore_d', 1, 22 ],
	[ 'Wash a load of darks', 'pkr_chore_d', 1, 71 ],

	// #endregion Daily Chores



	// #region Weekly Chores

	[ 'Clean the bathroom', 'pkr_chore_w', 2, 30 ],
	[ 'Vacuum living room', 'pkr_chore_w', 2, 0, true ], // What: Item Definition Tuple. Why: This seeds one item into ITE_DEF_ARR, its own 5th field flagging it currently inactive so buiVacFun's seeded inactive-state log can demonstrate an open inactive interval (see the comment above buiVacFun). How: This is [ name, pickerId, weight, value, vacation ], destructured by position inside buiIteFun().
	[ 'Mop the kitchen', 'pkr_chore_w', 1, 52 ],
	[ 'Change the bed sheets', 'pkr_chore_w', 1, 80 ],
	[ 'Fridge wipe-down', 'pkr_chore_w', 1, 18 ],

	// #endregion Weekly Chores



	// #region Monthly Chores

	[ 'Dust the bookshelves', 'pkr_chore_m', 1, 40 ],
	[ 'Clean the oven', 'pkr_chore_m', 1, 12 ],
	[ 'Wash the windows', 'pkr_chore_m', 1, 35 ],
	[ 'Descale the kettle', 'pkr_chore_m', 1, 80 ],

	// #endregion Monthly Chores



	// #region Breakfast

	[ 'Oatmeal with berries', 'pkr_brk', 2, 0 ],
	[ 'Yoghurt and granola', 'pkr_brk', 2, 0 ],
	[ 'Eggs and toast', 'pkr_brk', 2, 0 ],
	[ 'Smoothie', 'pkr_brk', 1, 0 ],
	[ 'Avocado on rye', 'pkr_brk', 1, 0 ],

	// #endregion Breakfast



	// #region Lunch

	[ 'Big green salad', 'pkr_lun', 2, 0 ],
	[ 'Soup and bread', 'pkr_lun', 1, 0 ],
	[ 'Leftovers, made nice', 'pkr_lun', 2, 0 ],
	[ 'Grain bowl', 'pkr_lun', 1, 0 ],
	[ 'Sandwich, properly', 'pkr_lun', 1, 0 ],

	// #endregion Lunch



	// #region Self Care

	[ 'Ten-minute stretch', 'pkr_self', 2, 92 ],
	[ 'Phone call with a friend', 'pkr_self', 1, 64 ],
	[ 'Walk without headphones', 'pkr_self', 2, 100 ],
	[ 'Journal three lines', 'pkr_self', 1, 38 ],
	[ 'Skin care, properly', 'pkr_self', 1, 14 ],
	[ 'Read one paper chapter', 'pkr_self', 2, 76 ],
	[ 'Sit and do nothing', 'pkr_self', 1, 100 ],
	[ 'Five-minute meditation', 'pkr_self', 2, 60, false, true ], // What: Item Definition Tuple. Why: This seeds one retired item into ITE_DEF_ARR, kept only so it accrues about a year of pick-log history before buiSeeFun drops it from the live item list, demonstrating a deleted ghost row in Stats. How: This is [ name, pickerId, weight, value, vacation, deleted ], destructured by position inside buiIteFun().

	// #endregion Self Care



	// #region Work

	[ 'Inbox triage, 20 min', 'pkr_work', 3, 18 ],
	[ 'Write one short reply', 'pkr_work', 2, 5 ],
	[ 'Update the doc', 'pkr_work', 1, 42 ],
	[ 'Review one PR', 'pkr_work', 2, 0 ],
	[ 'Plan tomorrow', 'pkr_work', 3, 88 ],
	[ 'Note one open question', 'pkr_work', 1, 60 ],

	// #endregion Work



	// #region Dinner

	[ 'Lentil dal + rice', 'pkr_din', 2, 0 ],
	[ 'Sheet-pan vegetables', 'pkr_din', 2, 0 ],
	[ 'Cacio e pepe', 'pkr_din', 1, 0 ],
	[ 'Tomato soup + grilled cheese', 'pkr_din', 1, 0 ],
	[ 'Stir-fry, anything green', 'pkr_din', 2, 0 ],
	[ 'Order in (be honest)', 'pkr_din', 1, 0 ],

	// #endregion Dinner



	// #region Entertainment

	[ 'Watch a documentary', 'pkr_play', 1, 100 ],
	[ 'Long bath, no phone', 'pkr_play', 1, 64 ],
	[ 'Cook something new', 'pkr_play', 2, 88 ],
	[ 'Board game with company', 'pkr_play', 1, 100 ],
	[ 'Two episodes, then stop', 'pkr_play', 3, 32 ],
	[ 'Walk somewhere unfamiliar', 'pkr_play', 1, 100 ],

	// #endregion Entertainment


];

// #endregion ITE_DEF_ARR



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

const MOD_DEF_OBJ = { // What: Mode Definition Object. Why: Every consumer needing a picker mode's own display label and explanatory hint text (Pickers/Data/Stats tabs, the picker mini-tours) reads this shared table. How: This maps each of pickers.js's own 5 selection-algorithm keys to its own { label, hint } pair.


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

// #region Shared Utilities

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

function picWeiFun( itePooArr ) {


	const totWeiNum = itePooArr.reduce( ( sumWeiNum, curIteObj ) => sumWeiNum + ( curIteObj.weight || 1 ), 0 ); // What: Total Weight Number. Why: The random draw below needs the combined weight of the whole pool to scale against. How: This sums every item's own weight, defaulting a missing weight to 1.

	let remWeiNum = Math.random() * totWeiNum; // What: Remaining Weight Number And Guard. Why: The loop below needs a running countdown to know which item the random draw landed on. How: This starts at a random point somewhere within the total weight.


	for ( const curIteObj of itePooArr ) { // What: Weighted Draw Loop. Why: Every item in the pool must be walked in order, subtracting its own weight, until the running countdown crosses zero. How: This iterates itePooArr, returning the first item whose own weight subtraction brings remWeiNum to zero or below.


		remWeiNum -= ( curIteObj.weight || 1 ); // What: Remaining Weight Subtraction. Why: This item's own share of the total must be removed from the running countdown before checking whether it was the one drawn. How: This subtracts curIteObj's own weight (or 1, if missing) from remWeiNum.



		if ( remWeiNum <= 0 ) return curIteObj; // What: Draw Hit Guard. Why: Once the countdown crosses zero, this is the item the weighted draw landed on. How: This returns curIteObj immediately once remWeiNum is zero or below.


	}



	return itePooArr[ itePooArr.length - 1 ]; // What: Fallback Last Item Return. Why: Floating-point rounding could in rare cases leave the loop above without ever triggering its own return. How: This returns the pool's own last item as a safe fallback.


}

// #endregion picWeiFun



const uniIdeFun = (() => { // What: Unique Identifier Function. Why: Every seeded item/vacation/pick-log/reminder-log row below needs its own distinct string id, and nothing else in this module tracks a shared counter for that. How: This is an immediately-invoked closure that captures one counter and returns the actual generator function used everywhere below.


	let seqCouNum = 0; // What: Sequence Count Number And Guard. Why: Every id minted below needs a distinct numeric suffix appended after its own prefix. How: This starts at 0 and is incremented once per call to the returned generator function below.



	return ( preFixStr ) => `${ preFixStr }_${ ++seqCouNum }`; // What: Id Generator Return. Why: The caller needs a closure that mints a new, distinct id string on every call, sharing one counter across all of them. How: This returns an arrow function that increments seqCouNum and interpolates it after preFixStr, separated by an underscore.


})();

// #endregion Shared Utilities



// #region Demo State

// #region buiConFun

/**
 * buiConFun = Build Conditional Function
 *
 * @summary
 * Builds about 1 year of trigger history for the demo ease-up
 * "Chore Free Day" gate: one row per completed weekly cycle, mostly
 * triggered : false (chores got done and the gate didn't fire), with
 * the gate firing every 4 to 6 weeks once it charges to 100
 * (triggered : true).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns An array of conditionalLog rows, in state.conditionalLog's
 * own shape.
 *
 * @example
 * ```ts
 * buiConFun() // => array of conditionalLog rows
 * ```
 *
*/

function buiConFun() {


	const conRowArr = []; // What: Conditional Row Array And Guard. Why: Every row built by addConFun below needs somewhere to accumulate. How: This starts empty and is pushed into below.

	const todMidObj = new Date(); // What: Today Midnight Object. Why: Every simulated week below is computed relative to this same anchor. How: This is read as "now" and then floored to midnight on the next line.

	todMidObj.setHours( 0, 0, 0, 0 ); // What: Today Midnight Hours Reset. Why: Only the calendar day matters for the day-offset arithmetic below, not the current time of day. How: This zeroes out todMidObj's own hours/minutes/seconds/milliseconds in place.


	let weeSinNum = 2; // What: Weeks Since Number And Guard. Why: The fire-check below needs a running count of weeks since the gate last fired, seeded partway so an early fire is still plausible. How: This starts at 2 and is incremented once per simulated cycle below, reset to 0 whenever the gate fires.
	let seqCouNum = 0; // What: Sequence Count Number And Guard. Why: Every row needs its own unique id, and nothing else in this scope tracks that count. How: This starts at 0 and is incremented once per row created below.


	const addConFun = ( bacDayNum, trgValBoo ) => { // What: Add Conditional Function. Why: Every simulated cycle below shares the same row-building logic. How: This resolves bacDayNum into a real ISO date, then pushes one conditionalLog row onto conRowArr.


		const curDatObj = new Date( todMidObj ); // What: Current Date Object. Why: Every row needs its own resolved real date. How: This copies todMidObj.


		curDatObj.setDate( todMidObj.getDate() - bacDayNum ); // What: Current Date Step. Why: The copy must land on this row's own day. How: This moves curDatObj back bacDayNum days.



		conRowArr.push({ // What: Conditional Row Push. Why: This is one simulated row, in the exact shape state.conditionalLog itself expects. How: This builds the row from bacDayNum/trgValBoo plus a few fixed fields matching the demo gate's own identity.


			condId    : 'cnd_chorefree',                            // What: Conditional Identifier. Why: Every simulated row belongs to the demo's own Chore Free Day gate. How: This is that gate's fixed id.
			date      : isoDayFun( curDatObj ),                     // What: Date. Why: The Stats tab groups conditional history by day. How: This formats curDatObj as a local ISO date.
			id        : 'clseed_' + ( seqCouNum++ ).toString( 36 ), // What: Identifier. Why: Every log row needs its own unique id. How: This appends the next base-36 sequence number to a seed prefix.
			mode      : 'ease-up',                                  // What: Mode. Why: The demo gate charges up over time. How: This is the gate's fixed ease-up mode.
			name      : 'Chore Free Day',                           // What: Name. Why: Log rows denormalize the gate's name so history survives a rename. How: This is the gate's fixed display name.
			triggered : trgValBoo                                   // What: Triggered. Why: This records whether the gate fired that day. How: This is the caller's own trgValBoo.


		});


	};


	for ( let weeIndNum = 51; weeIndNum >= 1; weeIndNum-- ) { // What: Weekly Cycle Loop. Why: About 52 weeks of history needs simulating, one cycle per week, walking backward from 51 weeks ago to 1 week ago. How: This walks weeIndNum from 51 down to 1.


		const bacDayNum = weeIndNum * 7; // What: Back Day Number. Why: Every check and row below needs this simulated week's own real days-back count. How: This converts weeIndNum into a days-back count, 7 days per week.



		if ( weeIndNum % 9 === 0 ) continue; // What: Skipped Cycle Guard. Why: An occasional un-completed cycle (no row logged at all) reads more honestly than a row every single week without exception. How: This skips roughly 1 in 9 weeks entirely.



		weeSinNum++; // What: Weeks Since Increment. Why: Every completed cycle simulated below moves the gate one week closer to firing. How: This increments weeSinNum by 1.

		const isaFirBoo = weeSinNum >= 5 && ( weeSinNum >= 6 || weeIndNum % 2 === 0 ); // What: Is-A Fire Boolean. Why: The gate should fire every 4 to 6 weeks, not on a perfectly fixed schedule. How: This is true once weeSinNum reaches 5, guaranteed by 6, with a coin-flip at exactly 5 to vary the exact week.


		if ( isaFirBoo ) { // What: Fire Guard. Why: This is the guard gating the whole block below: a firing cycle must both log itself as triggered and reset the weeks-since counter. How: This checks isaFirBoo before running the 2 statements below.


			addConFun( bacDayNum, true ); // What: Triggered Row Log Call. Why: A firing cycle needs its own logged row, marked triggered. How: This logs bacDayNum's own row with triggered set true.

			weeSinNum = 0; // What: Weeks Since Reset. Why: A firing cycle must restart the weeks-since count from zero. How: This resets weeSinNum back to 0.


		}

		else addConFun( bacDayNum, false ); // What: Non-Fire Branch. Why: Every other completed cycle logs as a normal, non-triggered row. How: This logs a non-triggered row for this simulated week.


	}



	return conRowArr; // What: Conditional Row Array Return. Why: The caller needs the finished seeded conditional trigger history. How: This returns conRowArr, built above.


}

// #endregion buiConFun



// #region buiIteFun

/**
 * buiIteFun = Build Item Function
 *
 * @summary
 * Expands every ITE_DEF_ARR tuple into a full, persisted item object,
 * generating each one's own id and giving it a small random starting
 * pick count so the seeded demo data doesn't look untouched.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns An array of full item objects, in state.items' own shape.
 *
 * @example
 * ```ts
 * buiIteFun() // => array of item objects
 * ```
 *
*/

function buiIteFun() {


	return ITE_DEF_ARR.map( ( [ tupNamStr, tupPicStr, tupWeiNum, tupValNum, tupVacBoo, tupDelBoo ] ) => ({ // What: Item Object Map. Why: Every tuple in ITE_DEF_ARR must become a full item object before it can be seeded into state. How: This destructures each tuple positionally and builds the object below from its own fields.


		__deleted  : !!tupDelBoo,                     // What: Deleted. Why: A retired item is kept here only so its own pick-log history survives; buiSeeFun drops it from the live item list below. How: This coerces the tuple's own optional deleted field to a real boolean.
		id         : uniIdeFun( 'it' ),               // What: Id. Why: Every item needs its own stable, unique identifier. How: This mints one via uniIdeFun, prefixed 'it'.
		lastPicked : null,                            // What: Last Picked. Why: None of these items have a real last-picked timestamp yet. How: This is always null for freshly-seeded items.
		name       : tupNamStr,                       // What: Name. Why: This is the item's own display name shown throughout the app. How: This is copied straight from the tuple's own name field.
		pickerId   : tupPicStr,                       // What: Picker Id. Why: This ties the item to its owning picker; a picker's own pool is every item whose own pickerId matches. How: This is copied straight from the tuple's own pickerId field.
		picks      : Math.floor( Math.random() * 8 ), // What: Picks. Why: A brand-new-looking demo item with 0 picks would look untouched; a small random starting count reads as lived-in. How: This floors a random value between 0 and 8.
		vacation   : !!tupVacBoo,                     // What: Vacation. Why: This flags whether the item starts out inactive. How: This coerces the tuple's own optional vacation field to a real boolean.
		value      : tupValNum,                       // What: Value. Why: This is the item's own per-item drift state used by dynamic/ease-up/ease-down modes (see the file header comment). How: This is copied straight from the tuple's own value field.
		weight     : tupWeiNum                        // What: Weight. Why: This is the item's own base selection weight. How: This is copied straight from the tuple's own weight field.


	}) );


}

// #endregion buiIteFun



// #region buiPicFun

/**
 * buiPicFun = Build Picker Function
 *
 * @summary
 * Builds the 9 demo pickers, one per seeded group/mode combination. A
 * picker's own pool is derived purely from ITE_DEF_ARR's own pickerId
 * field, so there is no separate itemIds list to maintain here.
 * daysOfWeek/skipHolidays gate WHEN a picker runs in the Daily
 * generator (0 = Sunday ... 6 = Saturday); the defaults below are
 * full-week and keep-holidays, except for a few pickers pre-tuned to
 * showcase the schedule feature (the chore pickers skip holidays, the
 * work picker is weekdays-only).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns An array of full picker objects, in state.pickers' own shape.
 *
 * @example
 * ```ts
 * buiPicFun() // => array of picker objects
 * ```
 *
*/

function buiPicFun() {


	const weeAllArr = [ 0, 1, 2, 3, 4, 5, 6 ]; // What: Week All Array. Why: A picker with no schedule override still needs an explicit "every day" daysOfWeek default. How: This lists every weekday index, Sunday (0) through Saturday (6).
	const weeDayArr = [ 1, 2, 3, 4, 5 ];       // What: Week Day Array. Why: The weekly-chore and work pickers below are pre-tuned to run weekdays only. How: This lists Monday (1) through Friday (5), excluding both weekend days.


	const picSchObj = { // What: Picker Schedule Object. Why: A handful of pickers need a non-default daysOfWeek/skipHolidays pairing to showcase the schedule feature; this is looked up by picker id below. How: This maps each overridden picker's own id to its own { daysOfWeek, skipHolidays } pair.


		pkr_chore_d : { daysOfWeek : weeAllArr, skipHolidays : true }, // What: Daily Chore Schedule. Why: Chores are pre-tuned to skip holidays. How: This runs every day of the week, holidays skipped.
		pkr_chore_m : { daysOfWeek : weeAllArr, skipHolidays : true }, // What: Monthly Task Schedule. Why: Chores are pre-tuned to skip holidays. How: This runs every day of the week, holidays skipped.
		pkr_chore_w : { daysOfWeek : weeDayArr, skipHolidays : true }, // What: Weekly Chore Schedule. Why: Chores are pre-tuned to skip holidays. How: This runs weekdays only, holidays skipped.
		pkr_work    : { daysOfWeek : weeDayArr, skipHolidays : true }  // What: Quick Win Schedule. Why: The work picker is pre-tuned to weekdays only. How: This runs weekdays only, holidays skipped.


	};



	return [ // What: Built Pickers Return. Why: The caller needs the full array of demo picker objects, in state.pickers' own shape. How: This lists every sample picker, each spreading its own group's fixed fields plus picSchObj's own schedule override when one exists.


        // #region Chores Group

        { id : 'pkr_chore_d', group : 'Chores',    name : 'Daily Chore',  mode : 'dynamic',   easeMin : 8,  easeMax : 18, threshold : 100 }, // What: Id String. Why: This is this picker's own stable identifier, read by buiIteFun's pickerId field and by every picker lookup throughout the app. How: This is a literal, load-bearing string matching the pkr_* prefix used by ITE_DEF_ARR. What: Group String. Why: This clusters the picker under a shared label on Today. How: This is read by the grouping/filtering UI exactly like any real, user-created picker. What: Name String. Why: This is the picker's own display name shown throughout the app. How: This is read wherever a picker's name needs displaying. What: Mode String. Why: This selects which of pickers.js's own selection algorithms this picker uses. How: This is read by the picker engine exactly like any real picker's own mode. What: Ease Min Number. Why: This sets the lower bound of this picker's own per-tick ease amount. How: This is read by pickers.js wherever this picker's mode consults easeMin. What: Ease Max Number. Why: This sets the upper bound of this picker's own per-tick ease amount. How: This is read by pickers.js wherever this picker's mode consults easeMax. What: Threshold Number. Why: This is the value an item (or, for ease-down, the active item's own charge) must reach for ease-up eligibility or ease-down depletion. How: This is read by pickers.js's own ease-up/ease-down logic.
        { id : 'pkr_chore_w', group : 'Chores',    name : 'Weekly Chore', mode : 'ease-up',   easeMin : 12, easeMax : 22, threshold : 100 }, // What: Id String. Why: This is this picker's own stable identifier, read by buiIteFun's pickerId field and by every picker lookup throughout the app. How: This is a literal, load-bearing string matching the pkr_* prefix used by ITE_DEF_ARR. What: Group String. Why: This clusters the picker under a shared label on Today. How: This is read by the grouping/filtering UI exactly like any real, user-created picker. What: Name String. Why: This is the picker's own display name shown throughout the app. How: This is read wherever a picker's name needs displaying. What: Mode String. Why: This selects which of pickers.js's own selection algorithms this picker uses. How: This is read by the picker engine exactly like any real picker's own mode. What: Ease Min Number. Why: This sets the lower bound of this picker's own per-tick ease amount. How: This is read by pickers.js wherever this picker's mode consults easeMin. What: Ease Max Number. Why: This sets the upper bound of this picker's own per-tick ease amount. How: This is read by pickers.js wherever this picker's mode consults easeMax. What: Threshold Number. Why: This is the value an item (or, for ease-down, the active item's own charge) must reach for ease-up eligibility or ease-down depletion. How: This is read by pickers.js's own ease-up/ease-down logic.
        { id : 'pkr_chore_m', group : 'Chores',    name : 'Monthly Task', mode : 'dynamic',   easeMin : 6,  easeMax : 14, threshold : 100 }, // What: Id String. Why: This is this picker's own stable identifier, read by buiIteFun's pickerId field and by every picker lookup throughout the app. How: This is a literal, load-bearing string matching the pkr_* prefix used by ITE_DEF_ARR. What: Group String. Why: This clusters the picker under a shared label on Today. How: This is read by the grouping/filtering UI exactly like any real, user-created picker. What: Name String. Why: This is the picker's own display name shown throughout the app. How: This is read wherever a picker's name needs displaying. What: Mode String. Why: This selects which of pickers.js's own selection algorithms this picker uses. How: This is read by the picker engine exactly like any real picker's own mode. What: Ease Min Number. Why: This sets the lower bound of this picker's own per-tick ease amount. How: This is read by pickers.js wherever this picker's mode consults easeMin. What: Ease Max Number. Why: This sets the upper bound of this picker's own per-tick ease amount. How: This is read by pickers.js wherever this picker's mode consults easeMax. What: Threshold Number. Why: This is the value an item (or, for ease-down, the active item's own charge) must reach for ease-up eligibility or ease-down depletion. How: This is read by pickers.js's own ease-up/ease-down logic.

        // #endregion Chores Group



        // #region Food Group

        { id : 'pkr_brk',     group : 'Food',      name : 'Breakfast',    mode : 'random',    easeMin : 10, easeMax : 20, threshold : 100 }, // What: Id String. Why: This is this picker's own stable identifier, read by buiIteFun's pickerId field and by every picker lookup throughout the app. How: This is a literal, load-bearing string matching the pkr_* prefix used by ITE_DEF_ARR. What: Group String. Why: This clusters the picker under a shared label on Today. How: This is read by the grouping/filtering UI exactly like any real, user-created picker. What: Name String. Why: This is the picker's own display name shown throughout the app. How: This is read wherever a picker's name needs displaying. What: Mode String. Why: This selects which of pickers.js's own selection algorithms this picker uses. How: This is read by the picker engine exactly like any real picker's own mode. What: Ease Min Number. Why: This sets the lower bound of this picker's own per-tick ease amount. How: This is read by pickers.js wherever this picker's mode consults easeMin. What: Ease Max Number. Why: This sets the upper bound of this picker's own per-tick ease amount. How: This is read by pickers.js wherever this picker's mode consults easeMax. What: Threshold Number. Why: This is the value an item (or, for ease-down, the active item's own charge) must reach for ease-up eligibility or ease-down depletion. How: This is read by pickers.js's own ease-up/ease-down logic.
        { id : 'pkr_lun',     group : 'Food',      name : 'Lunch',        mode : 'random',    easeMin : 10, easeMax : 20, threshold : 100 }, // What: Id String. Why: This is this picker's own stable identifier, read by buiIteFun's pickerId field and by every picker lookup throughout the app. How: This is a literal, load-bearing string matching the pkr_* prefix used by ITE_DEF_ARR. What: Group String. Why: This clusters the picker under a shared label on Today. How: This is read by the grouping/filtering UI exactly like any real, user-created picker. What: Name String. Why: This is the picker's own display name shown throughout the app. How: This is read wherever a picker's name needs displaying. What: Mode String. Why: This selects which of pickers.js's own selection algorithms this picker uses. How: This is read by the picker engine exactly like any real picker's own mode. What: Ease Min Number. Why: This sets the lower bound of this picker's own per-tick ease amount. How: This is read by pickers.js wherever this picker's mode consults easeMin. What: Ease Max Number. Why: This sets the upper bound of this picker's own per-tick ease amount. How: This is read by pickers.js wherever this picker's mode consults easeMax. What: Threshold Number. Why: This is the value an item (or, for ease-down, the active item's own charge) must reach for ease-up eligibility or ease-down depletion. How: This is read by pickers.js's own ease-up/ease-down logic.
        { id : 'pkr_din',     group : 'Food',      name : 'Dinner',       mode : 'random',    easeMin : 10, easeMax : 20, threshold : 100 }, // What: Id String. Why: This is this picker's own stable identifier, read by buiIteFun's pickerId field and by every picker lookup throughout the app. How: This is a literal, load-bearing string matching the pkr_* prefix used by ITE_DEF_ARR. What: Group String. Why: This clusters the picker under a shared label on Today. How: This is read by the grouping/filtering UI exactly like any real, user-created picker. What: Name String. Why: This is the picker's own display name shown throughout the app. How: This is read wherever a picker's name needs displaying. What: Mode String. Why: This selects which of pickers.js's own selection algorithms this picker uses. How: This is read by the picker engine exactly like any real picker's own mode. What: Ease Min Number. Why: This sets the lower bound of this picker's own per-tick ease amount. How: This is read by pickers.js wherever this picker's mode consults easeMin. What: Ease Max Number. Why: This sets the upper bound of this picker's own per-tick ease amount. How: This is read by pickers.js wherever this picker's mode consults easeMax. What: Threshold Number. Why: This is the value an item (or, for ease-down, the active item's own charge) must reach for ease-up eligibility or ease-down depletion. How: This is read by pickers.js's own ease-up/ease-down logic.

        // #endregion Food Group



        // #region Standalone Groups

        { id : 'pkr_self',    group : 'Self Care', name : 'Care Moment',  mode : 'ease-up',   easeMin : 12, easeMax : 24, threshold : 100 }, // What: Id String. Why: This is this picker's own stable identifier, read by buiIteFun's pickerId field and by every picker lookup throughout the app. How: This is a literal, load-bearing string matching the pkr_* prefix used by ITE_DEF_ARR. What: Group String. Why: This clusters the picker under a shared label on Today. How: This is read by the grouping/filtering UI exactly like any real, user-created picker. What: Name String. Why: This is the picker's own display name shown throughout the app. How: This is read wherever a picker's name needs displaying. What: Mode String. Why: This selects which of pickers.js's own selection algorithms this picker uses. How: This is read by the picker engine exactly like any real picker's own mode. What: Ease Min Number. Why: This sets the lower bound of this picker's own per-tick ease amount. How: This is read by pickers.js wherever this picker's mode consults easeMin. What: Ease Max Number. Why: This sets the upper bound of this picker's own per-tick ease amount. How: This is read by pickers.js wherever this picker's mode consults easeMax. What: Threshold Number. Why: This is the value an item (or, for ease-down, the active item's own charge) must reach for ease-up eligibility or ease-down depletion. How: This is read by pickers.js's own ease-up/ease-down logic.
        { id : 'pkr_work',    group : 'Work',      name : 'Quick Win',    mode : 'weighted',  easeMin : 5,  easeMax : 15, threshold : 100 }, // What: Id String. Why: This is this picker's own stable identifier, read by buiIteFun's pickerId field and by every picker lookup throughout the app. How: This is a literal, load-bearing string matching the pkr_* prefix used by ITE_DEF_ARR. What: Group String. Why: This clusters the picker under a shared label on Today. How: This is read by the grouping/filtering UI exactly like any real, user-created picker. What: Name String. Why: This is the picker's own display name shown throughout the app. How: This is read wherever a picker's name needs displaying. What: Mode String. Why: This selects which of pickers.js's own selection algorithms this picker uses. How: This is read by the picker engine exactly like any real picker's own mode. What: Ease Min Number. Why: This sets the lower bound of this picker's own per-tick ease amount. How: This is read by pickers.js wherever this picker's mode consults easeMin. What: Ease Max Number. Why: This sets the upper bound of this picker's own per-tick ease amount. How: This is read by pickers.js wherever this picker's mode consults easeMax. What: Threshold Number. Why: This is the value an item (or, for ease-down, the active item's own charge) must reach for ease-up eligibility or ease-down depletion. How: This is read by pickers.js's own ease-up/ease-down logic.
        { id : 'pkr_play',    group : 'Wind Down', name : 'Evening Pick', mode : 'ease-down', easeMin : 18, easeMax : 30, threshold : 100 }, // What: Id String. Why: This is this picker's own stable identifier, read by buiIteFun's pickerId field and by every picker lookup throughout the app. How: This is a literal, load-bearing string matching the pkr_* prefix used by ITE_DEF_ARR. What: Group String. Why: This clusters the picker under a shared label on Today. How: This is read by the grouping/filtering UI exactly like any real, user-created picker. What: Name String. Why: This is the picker's own display name shown throughout the app. How: This is read wherever a picker's name needs displaying. What: Mode String. Why: This selects which of pickers.js's own selection algorithms this picker uses. How: This is read by the picker engine exactly like any real picker's own mode. What: Ease Min Number. Why: This sets the lower bound of this picker's own per-tick ease amount. How: This is read by pickers.js wherever this picker's mode consults easeMin. What: Ease Max Number. Why: This sets the upper bound of this picker's own per-tick ease amount. How: This is read by pickers.js wherever this picker's mode consults easeMax. What: Threshold Number. Why: This is the value an item (or, for ease-down, the active item's own charge) must reach for ease-up eligibility or ease-down depletion. How: This is read by pickers.js's own ease-up/ease-down logic.

        // #endregion Standalone Groups


	].map( ( rawPicObj ) => ({ // What: Picker Object Map. Why: Every raw picker definition above still needs its own schedule/ease-down/conditional defaults filled in before it matches state.pickers' own shape. How: This resolves each field below, then spreads rawPicObj over them so its own explicit fields win.


		daysOfWeek    : ( picSchObj[ rawPicObj.id ] || {} ).daysOfWeek || [ 0, 1, 2, 3, 4, 5, 6 ], // What: Days Of Week. Why: Every picker needs a schedule, falling back to every day when picSchObj has no override for it. How: This looks up rawPicObj.id in picSchObj, defaulting to every weekday.
		skipHolidays  : !!( picSchObj[ rawPicObj.id ] || {} ).skipHolidays,                        // What: Skip Holidays. Why: Every picker needs an explicit holiday-skipping flag, defaulting to false when picSchObj has no override for it. How: This looks up rawPicObj.id in picSchObj, coerced to a real boolean.
		activeItemId  : null,                                                                      // What: Active Item Id. Why: An Ease Down picker needs a place to record which item is currently being worked down; none are active yet at seed time. How: This starts every picker at null, later overwritten for Ease Down pickers by buiSeeFun.
		conditionalId : rawPicObj.id === 'pkr_chore_w' ? 'cnd_chorefree' : null,                   // What: Conditional Id. Why: The demo Chore-Free Day gate needs exactly one picker to attach to. How: This attaches the gate only to the weekly-chore picker, leaving every other picker ungated.
		...rawPicObj                                                                               // What: Raw Picker Spread. Why: rawPicObj's own explicit fields (id, group, name, mode, easeMin, easeMax, threshold) must win over any default above sharing the same name. How: This spreads every field of rawPicObj over the defaults built above.


	}) );


}

// #endregion buiPicFun



// #region buiRemFun

/**
 * buiRemFun = Build Reminder Function
 *
 * @summary
 * Builds a seeded reminder completion log: many completions each for
 * the recurring demo reminders (so they dominate a High to Low
 * completions sort), plus one completion each for several one-time
 * reminders, including some whose own tasks have since been purged, to
 * demonstrate that history survives deletion via this denormalized log.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns An array of reminderLog rows, in state.reminderLog's own
 * shape.
 *
 * @example
 * ```ts
 * buiRemFun() // => array of reminderLog rows
 * ```
 *
*/

function buiRemFun() {


	const nowDatObj = new Date(); // What: Now Date Object. Why: Every row below is computed relative to this same anchor instant. How: This is read once and reused by bacDatFun below.
	const remRowArr = [];         // What: Reminder Row Array And Guard. Why: Every row built by addRemFun below needs somewhere to accumulate. How: This starts empty and is pushed into below.


	const addRemFun = ( tarTasStr, tarNamStr, tarTypStr, tarDatObj ) => remRowArr.push({ rowId : 'rl_seed_' + Math.random().toString( 36 ).slice( 2, 8 ), taskId : tarTasStr, name : tarNamStr, type : tarTypStr, completedAt : tarDatObj.toISOString() }); // What: Add Reminder Function. Why: Every completion simulated below shares the same row-building logic. How: This pushes one reminderLog row, shaped to state.reminderLog's own contract, onto remRowArr.

	const bacDatFun = ( bacDayNum, houValNum = 9, minValNum = 0 ) => { // What: Back Date Function. Why: Every row below needs to turn a plain days-back count plus a time of day into a real Date. How: This subtracts bacDayNum days from nowDatObj, then sets houValNum/minValNum onto the result.


		const retDatObj = new Date( nowDatObj ); // What: Return Date Object. Why: nowDatObj itself must not be mutated by the offset/time below. How: This constructs a fresh copy of nowDatObj to offset in place instead.

		retDatObj.setDate( nowDatObj.getDate() - bacDayNum ); // What: Return Date Day Subtraction. Why: This is the actual day-offset arithmetic this function exists to perform. How: This moves retDatObj back bacDayNum days from nowDatObj's own date.

		retDatObj.setHours( houValNum, minValNum, 0, 0 ); // What: Return Date Hours Set. Why: A completion needs a plausible time of day, not always midnight. How: This writes houValNum/minValNum onto retDatObj, zeroing seconds/milliseconds.



		return retDatObj; // What: Return Date Object Return. Why: The caller needs the resolved real date back. How: This returns the same copy offset/timed in place above.


	};


	let fouCouNum = 0; // What: Found Count Number And Guard. Why: The weekly-recurrence loops directly below each need to stop once they've generated enough rows, not walk the full day range every time. How: This is reset to 0 before each loop and incremented once per matching row found.


	for ( let bacIndNum = 1; bacIndNum <= 300 && fouCouNum < 38; bacIndNum++ ) { // What: Weekly Trash Loop. Why: About 9 months of a weekly Tuesday reminder needs simulating, walking day by day until 38 matches are found. How: This walks back up to 300 days, checking each one for a Tuesday.


		const curDatObj = bacDatFun( bacIndNum, 8, 10 ); // What: Current Date Object. Why: Every checked day needs its own resolved real date, at a plausible completion time. How: This resolves bacIndNum days back via bacDatFun.


		if ( curDatObj.getDay() === 2 ) { // What: Tuesday Match Guard. Why: This is the guard gating the whole block below: only a Tuesday counts as a real occurrence of this weekly reminder. How: This checks curDatObj's own weekday before running the 2 statements below.


			addRemFun( 'tk_trash', 'Take out the trash for pickup', 'recurring', curDatObj ); // What: Trash Completion Log Call. Why: A matching Tuesday needs its own logged completion. How: This logs curDatObj as one completion of the tk_trash reminder.

			fouCouNum++; // What: Found Count Increment. Why: The loop condition above needs to know how many matches have been found so far. How: This increments fouCouNum by 1.


		}


	}


	fouCouNum = 0; // What: Found Count Number Reset. Why: The next weekly-recurrence loop below needs its own fresh count, independent of the trash loop above. How: This resets fouCouNum back to 0.

	for ( let bacIndNum = 1; bacIndNum <= 300 && fouCouNum < 30; bacIndNum++ ) { // What: Weekly Plants Loop. Why: About 9 months of a weekly Saturday reminder needs simulating, walking day by day until 30 matches are found. How: This walks back up to 300 days, checking each one for a Saturday.


		const curDatObj = bacDatFun( bacIndNum, 10, 0 ); // What: Current Date Object. Why: Every checked day needs its own resolved real date, at a plausible completion time. How: This resolves bacIndNum days back via bacDatFun.


		if ( curDatObj.getDay() === 6 ) { // What: Saturday Match Guard. Why: This is the guard gating the whole block below: only a Saturday counts as a real occurrence of this weekly reminder. How: This checks curDatObj's own weekday before running the 2 statements below.


			addRemFun( 'tk_plants', 'Water the plants', 'recurring', curDatObj ); // What: Plants Completion Log Call. Why: A matching Saturday needs its own logged completion. How: This logs curDatObj as one completion of the tk_plants reminder.

			fouCouNum++; // What: Found Count Increment. Why: The loop condition above needs to know how many matches have been found so far. How: This increments fouCouNum by 1.


		}


	}


	fouCouNum = 0; // What: Found Count Number Reset. Why: The next weekly-recurrence loop below needs its own fresh count, independent of the loops above. How: This resets fouCouNum back to 0.

	for ( let bacIndNum = 1; bacIndNum <= 150 && fouCouNum < 18; bacIndNum++ ) { // What: Weekly Budget Loop. Why: About 5 months of a weekly Sunday reminder needs simulating, walking day by day until 18 matches are found. How: This walks back up to 150 days, checking each one for a Sunday.


		const curDatObj = bacDatFun( bacIndNum, 19, 30 ); // What: Current Date Object. Why: Every checked day needs its own resolved real date, at a plausible completion time. How: This resolves bacIndNum days back via bacDatFun.


		if ( curDatObj.getDay() === 0 ) { // What: Sunday Match Guard. Why: This is the guard gating the whole block below: only a Sunday counts as a real occurrence of this weekly reminder. How: This checks curDatObj's own weekday before running the 2 statements below.


			addRemFun( 'tk_budget', 'Weekly budget review', 'recurring', curDatObj ); // What: Budget Completion Log Call. Why: A matching Sunday needs its own logged completion. How: This logs curDatObj as one completion of the tk_budget reminder.

			fouCouNum++; // What: Found Count Increment. Why: The loop condition above needs to know how many matches have been found so far. How: This increments fouCouNum by 1.


		}


	}


	for ( let occIndNum = 1; occIndNum <= 8; occIndNum++ ) addRemFun( 'tk_meds', 'Refill prescription', 'recurring', bacDatFun( occIndNum * 30 + 2, 9, 0 ) ); // What: Monthly Prescription Loop. Why: A monthly recurring reminder needs 8 past completions, roughly 30 days apart. How: This logs one completion per occIndNum, spaced 30 days apart plus a small fixed offset.

	for ( let occIndNum = 1; occIndNum <= 5; occIndNum++ ) addRemFun( 'tk_filter', 'Change the HVAC filter', 'recurring', bacDatFun( occIndNum * 30 + 12, 17, 0 ) ); // What: Monthly Filter Loop. Why: A monthly recurring reminder needs 5 past completions, roughly 30 days apart. How: This logs one completion per occIndNum, spaced 30 days apart plus a small fixed offset.



	const oncDonArr = [ // What: Once Done Array. Why: Each of these one-time reminders needs exactly one past completion, spread across the year; several of their own tasks have since been purged, demonstrating that this denormalized log survives deletion. How: This is read by the loop directly below, one row logged per entry.


		[ 'tk_landlord',  'Email the landlord about the lease', 6   ], // What: One-Time Completion Tuple. Why: See the comment above this array. How: This is [ taskId, name, daysBack ], destructured by position below.
		[ 'tk_passport',  'Renew passport', 40                      ], // What: One-Time Completion Tuple. Why: See the comment above this array. How: This is [ taskId, name, daysBack ], destructured by position below.
		[ 'tk_dentist',   'Book dentist appointment', 22            ], // What: One-Time Completion Tuple. Why: See the comment above this array. How: This is [ taskId, name, daysBack ], destructured by position below.
		[ 'tk_faucet',    'Fix the leaky faucet', 95                ], // What: One-Time Completion Tuple. Why: See the comment above this array. How: This is [ taskId, name, daysBack ], destructured by position below.
		[ 'tk_taxes',     'Submit tax documents', 130               ], // What: One-Time Completion Tuple. Why: See the comment above this array. How: This is [ taskId, name, daysBack ], destructured by position below.
		[ 'tk_library',   'Return library books', 17                ], // What: One-Time Completion Tuple. Why: See the comment above this array. How: This is [ taskId, name, daysBack ], destructured by position below.
		[ 'tk_carserv',   'Schedule car service', 58                ], // What: One-Time Completion Tuple. Why: See the comment above this array. How: This is [ taskId, name, daysBack ], destructured by position below.
		[ 'tk_resume',    'Update resume', 210                      ], // What: One-Time Completion Tuple. Why: See the comment above this array. How: This is [ taskId, name, daysBack ], destructured by position below.
		[ 'tk_subcancel', 'Cancel unused subscription', 74          ], // What: One-Time Completion Tuple. Why: See the comment above this array. How: This is [ taskId, name, daysBack ], destructured by position below.
		[ 'tk_bday',      'Send birthday card to Mom', 160          ], // What: One-Time Completion Tuple. Why: See the comment above this array. How: This is [ taskId, name, daysBack ], destructured by position below.
		[ 'tk_backup',    'Back up the laptop', 33                  ], // What: One-Time Completion Tuple. Why: See the comment above this array. How: This is [ taskId, name, daysBack ], destructured by position below.
		[ 'tk_conf',      'Register for the conference', 118        ], // What: One-Time Completion Tuple. Why: See the comment above this array. How: This is [ taskId, name, daysBack ], destructured by position below.
		[ 'tk_smoke',     'Replace smoke detector battery', 250     ], // What: One-Time Completion Tuple. Why: See the comment above this array. How: This is [ taskId, name, daysBack ], destructured by position below.
		[ 'tk_drycln',    'Pick up dry cleaning', 9                 ]  // What: One-Time Completion Tuple. Why: See the comment above this array. How: This is [ taskId, name, daysBack ], destructured by position below.


	];


	for ( const [ tasIdeStr, tasNamStr, bckDayNum ] of oncDonArr ) addRemFun( tasIdeStr, tasNamStr, 'once', bacDatFun( bckDayNum, 12 + ( bckDayNum % 8 ), 15 ) ); // What: One-Time Completion Loop. Why: Every entry in oncDonArr needs its own single logged completion. How: This destructures each tuple and logs one completion at a time of day that varies with bckDayNum.



	return remRowArr; // What: Reminder Row Array Return. Why: The caller needs the finished seeded reminder completion log. How: This returns remRowArr, built above.


}

// #endregion buiRemFun



// #region buiVacFun

/**
 * buiVacFun = Build Vacation Function
 *
 * @summary
 * Builds a small seeded inactive-state event log: a few real on/off
 * transitions so Stats can demonstrate excluding days an item wasn't
 * eligible. Three scenarios are demonstrated: a currently inactive
 * item (an open interval, Vacuum living room), a past closed inactive
 * stretch already picked since returning (no special label, Mop the
 * kitchen), and a past inactive stretch not yet picked since returning
 * (the "Was Inactive" label, Fridge wipe-down).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param allIteArr - All Item Array: The full seeded item array to look items
 *                    up by name in.
 *
 * @returns An array of vacationLog rows, in state.vacationLog's own
 * shape.
 *
 * @example
 * ```ts
 * buiVacFun(allIteArr) // => array of vacationLog rows
 * ```
 *
*/

function buiVacFun( allIteArr ) {


	const iteNamFun = ( tarNamStr ) => allIteArr.find( ( curIteObj ) => curIteObj.name === tarNamStr ); // What: Item Named Function. Why: Every row built below needs to resolve a seeded item by its own display name rather than a hardcoded id. How: This searches allIteArr for the first item whose own name matches tarNamStr.

	const todMidObj = new Date(); // What: Today Midnight Object. Why: Every row's own relative date is computed from this same anchor. How: This is read as "now" and then floored to midnight on the next line.

	todMidObj.setHours( 0, 0, 0, 0 ); // What: Today Midnight Hours Reset. Why: Only the calendar day matters for the day-offset arithmetic below, not the current time of day. How: This zeroes out todMidObj's own hours/minutes/seconds/milliseconds in place.


	const dayAgoFun = ( dayAgoNum ) => { // What: Day Ago Function. Why: Every row below needs to turn a plain days-back count into a real ISO date string. How: This subtracts dayAgoNum days from todMidObj and converts the result via isoDayFun.


		const offDatObj = new Date( todMidObj ); // What: Offset Date Object. Why: todMidObj itself must not be mutated by the offset below. How: This constructs a fresh copy of todMidObj to offset in place instead.

		offDatObj.setDate( todMidObj.getDate() - dayAgoNum ); // What: Offset Date Day Subtraction. Why: This is the actual day-offset arithmetic the whole function exists to perform. How: This moves offDatObj back by dayAgoNum days from todMidObj's own date.



		return isoDayFun( offDatObj ); // What: Offset Iso Day Return. Why: Every row below needs a plain ISO date string, not a Date instance. How: This converts the offset date via isoDayFun.


	};


	const vacRowArr = []; // What: Vacation Row Array And Guard. Why: Every row built by addRowFun below needs somewhere to accumulate. How: This starts empty and is pushed into below.

	let seqCouNum = 0; // What: Sequence Count Number And Guard. Why: Every row needs its own unique rowId, and nothing else in this scope tracks that count. How: This starts at 0 and is incremented once per row created below.


	const addRowFun = ( tarIteObj, dayAgoNum, vacOnBoo ) => { // What: Add Row Function. Why: Every scenario below shares the same row-building logic, guarded against a lookup that found nothing. How: This pushes one vacationLog row onto vacRowArr, built from its own 3 arguments, only when tarIteObj was actually found.


		if ( tarIteObj ) vacRowArr.push({ rowId : 'vac_' + ( seqCouNum++ ).toString( 36 ), itemId : tarIteObj.id, date : dayAgoFun( dayAgoNum ), on : vacOnBoo }); // What: Vacation Row Push Guard. Why: A lookup that found nothing must not push a broken row. How: This pushes one row shaped to state.vacationLog's own contract, only when tarIteObj is truthy.


	};


	addRowFun( iteNamFun( 'Vacuum living room' ), 24, true ); // What: Still-Inactive Row. Why: This demonstrates the "currently inactive" scenario described above. How: This marks the item inactive as of 24 days ago, with no matching "active again" row after it.
	addRowFun( iteNamFun( 'Mop the kitchen' ), 180, true );   // What: Old Inactive-Start Row. Why: This begins the "past inactive stretch, already picked since" scenario described above. How: This marks the item inactive as of 180 days ago.
	addRowFun( iteNamFun( 'Mop the kitchen' ), 150, false );  // What: Old Inactive-End Row. Why: This ends the "past inactive stretch, already picked since" scenario described above. How: This marks the item active again as of 150 days ago, long before today.
	addRowFun( iteNamFun( 'Fridge wipe-down' ), 20, true );   // What: Recent Inactive-Start Row. Why: This begins the "past inactive stretch, not yet picked since" scenario described above. How: This marks the item inactive as of 20 days ago.
	addRowFun( iteNamFun( 'Fridge wipe-down' ), 5, false );   // What: Recent Inactive-End Row. Why: This ends the "past inactive stretch, not yet picked since" scenario described above. How: This marks the item active again as of 5 days ago, recently enough that buiSeeFun can still drop its own post-return picks.



	return vacRowArr; // What: Vacation Row Array Return. Why: The caller needs the finished seeded inactive-state log. How: This returns vacRowArr, built above.


}

// #endregion buiVacFun



// #region makVacFun

/**
 * makVacFun = Make Vacation Function
 *
 * @summary
 * Builds an onVac(itemId, iso) predicate by replaying a vacationLog's
 * own inactive-state events in date order, so a caller can ask whether
 * a given item was inactive on a given day.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param vacRowArr - Vacation Row Array: The vacationLog rows to replay, in
 *                    state.vacationLog's own shape.
 *
 * @returns A function of (itemId, iso) resolving whether that item was
 * inactive on that day.
 * @see {@link isaVacFun}
 *
 * @example
 * ```ts
 * makVacFun(vacRowArr) // => isaVacFun
 * ```
 *
*/

function makVacFun( vacRowArr ) {


	const iteRowMap = new Map(); // What: Item Row Map And Guard. Why: Every item's own events must be grouped together before they can be replayed in order below. How: This starts empty and is filled by the loop directly below.


	for ( const curRowObj of vacRowArr ) { // What: Group By Item Loop. Why: Every row must be filed under its own itemId before the replay below can work per item. How: This iterates vacRowArr, filing each row into iteRowMap under its own itemId.


		if ( !iteRowMap.has( curRowObj.itemId ) ) iteRowMap.set( curRowObj.itemId, [] ); // What: New Item Bucket Guard. Why: An item seen for the first time has no bucket to push into yet. How: This creates an empty array for curRowObj's own itemId when none exists yet.

		iteRowMap.get( curRowObj.itemId ).push( curRowObj ); // What: Row Bucket Push. Why: This row must join every other row already filed under the same item. How: This pushes curRowObj onto its own itemId's bucket.


	}


	for ( const iteRowArr of iteRowMap.values() ) iteRowArr.sort( ( rowAObj, rowBObj ) => ( rowAObj.date < rowBObj.date ? -1 : 1 ) ); // What: Per-Item Sort Loop. Why: The replay below only works correctly if each item's own events are in chronological order. How: This sorts every item's own bucket in place, oldest date first.



	const isaVacFun = ( tarIdeStr, tarIsoStr ) => { // What: Is-A Vacation Function. Why: This is the actual predicate callers get back, closing over iteRowMap. How: This replays tarIdeStr's own events up to tarIsoStr and returns the last-seen on/off state.


		const matRowArr = iteRowMap.get( tarIdeStr ); // What: Matching Row Array And Guard. Why: An item with no seeded events at all was never inactive. How: This looks up tarIdeStr's own bucket, undefined when there is none.


		if ( !matRowArr ) return false; // What: No Events Guard. Why: An item with no seeded events at all was never inactive. How: This returns false immediately when matRowArr is undefined.



		let curOnBoo = false; // What: Current On Boolean And Guard. Why: The replay below needs a running "currently inactive" flag to update as it walks forward through time. How: This starts false, matching an item's own default active state.


		for ( const curRowObj of matRowArr ) { // What: Replay Loop. Why: Only events up to and including tarIsoStr matter; anything after it hasn't happened yet from the queried day's own perspective. How: This walks matRowArr in order, updating curOnBoo from each event at or before tarIsoStr, stopping at the first event still in the future.


			if ( curRowObj.date <= tarIsoStr ) curOnBoo = curRowObj.on; // What: Qualifying Event Branch. Why: An event on or before tarIsoStr is the most recent state known as of that day. How: This overwrites curOnBoo with curRowObj's own on value.

			else break; // What: Future Event Stop. Why: Once an event is found still in the future relative to tarIsoStr, every later event (matRowArr is chronological) is too. How: This breaks out of the loop immediately.


		}



		return curOnBoo; // What: Current On Boolean Return. Why: The caller wants the item's own resolved inactive state as of tarIsoStr. How: This returns curOnBoo, its own final value after the replay above.


	};



	return isaVacFun; // What: Is-A Vacation Function Return. Why: The caller needs the closure built above to query with. How: This returns isaVacFun, defined above.


}

// #endregion makVacFun



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
 * @see {@link picRowArr}
 *
 * @example
 * ```ts
 * picLogFun(allIteArr, allPicArr, isaVacFun, 365) // => { easStaObj, ... }
 * ```
 *
*/

function picLogFun( allIteArr, allPicArr, isaVacFun, totDayNum = 365 ) {


	const picRowArr = [];         // What: Pick Row Array And Guard. Why: Every row built by logPicFun below needs somewhere to accumulate. How: This starts empty and is pushed into below.
	const todMidObj = new Date(); // What: Today Midnight Object. Why: Every simulated day below is computed relative to this same anchor. How: This is read as "now" and then floored to midnight on the next line.

	todMidObj.setHours( 0, 0, 0, 0 ); // What: Today Midnight Hours Reset. Why: Only the calendar day matters for the day-offset arithmetic below, not the current time of day. How: This zeroes out todMidObj's own hours/minutes/seconds/milliseconds in place.


	const picPooObj = {}; // What: Picker Pool Object And Guard. Why: The simulation below repeatedly needs "every item belonging to this picker," which would otherwise mean re-filtering allIteArr on every single day simulated. How: This starts empty and is filled once by the loop directly below, then read many times.


	for ( const curIteObj of allIteArr ) ( picPooObj[ curIteObj.pickerId ] = picPooObj[ curIteObj.pickerId ] || [] ).push( curIteObj ); // What: Picker Pool Fill Loop. Why: Every item must be filed under its own picker exactly once before the simulation below can look pools up cheaply. How: This iterates allIteArr, creating each picker's own bucket on first use and pushing curIteObj into it.


	let seqCouNum = 0; // What: Sequence Count Number And Guard. Why: Every row needs its own unique id, and nothing else in this scope tracks that count. How: This starts at 0 and is incremented once per row created below.

	const ranBetFun = ( loBndNum, hiBndNum ) => loBndNum + Math.random() * ( hiBndNum - loBndNum ); // What: Random Between Function. Why: Several places below need a random value somewhere inside a given range, not just 0 to 1. How: This scales Math.random()'s own 0-1 output into the [ loBndNum, hiBndNum ] range.


	const logPicFun = ( datValObj, curPicObj, curIteObj, donValBoo, souValStr, outValStr, depEndBoo ) => { // What: Log Pick Function. Why: Every simulated pick, toss, skip, or Ease Down tick below shares the same row-building logic. How: This builds one pickLog row shaped to state.pickLog's own contract and pushes it onto picRowArr.


		const picTimObj = new Date( datValObj ); // What: Pick Timestamp Object. Why: A completed pick needs a plausible time of day, not just a bare date. How: This constructs a fresh copy of datValObj to set a random time of day on below.

		picTimObj.setHours( 8 + Math.floor( Math.random() * 12 ), Math.floor( Math.random() * 60 ), 0, 0 ); // What: Pick Timestamp Hours Set. Why: A real completion could happen any time between 8am and 8pm, not always at the same instant. How: This sets a random hour in that range and a random minute, zeroing seconds/milliseconds.



		picRowArr.push({ // What: Pick Row Push. Why: This is one simulated row, in the exact shape state.pickLog itself expects. How: This builds the row from every argument above, spreading in outcome/depletedEnd only when actually given.


			id          : 'pls_' + ( seqCouNum++ ).toString( 36 ),                                    // What: Id. Why: Every row needs its own stable, unique identifier. How: This mints one from a running counter, prefixed 'pls_'.
			eid         : null,                                                                       // What: Entry Id. Why: A simulated historical row was never a live Today entry, so it has no entry to reference. How: This is always null for a row built by this simulation.
			date        : isoDayFun( datValObj ),                                                     // What: Date. Why: Stats groups and filters rows by their own calendar day. How: This converts datValObj via isoDayFun.
			pickerId    : curPicObj.id,                                                               // What: Picker Id. Why: Every row must record which picker it belongs to. How: This is copied straight from curPicObj's own id.
			itemId      : curIteObj.id,                                                               // What: Item Id. Why: Every row must record which item it belongs to. How: This is copied straight from curIteObj's own id.
			itemName    : curIteObj.name,                                                             // What: Item Name. Why: This denormalized copy lets the row survive a later rename or deletion of the item itself. How: This is copied straight from curIteObj's own name.
			pickerName  : curPicObj.name,                                                             // What: Picker Name. Why: This denormalized copy lets the row survive a later rename or deletion of the picker itself. How: This is copied straight from curPicObj's own name.
			group       : curPicObj.group,                                                            // What: Group. Why: Stats groups rows by their own picker's group. How: This is copied straight from curPicObj's own group.
			done        : outValStr === 'rejected' ? false : donValBoo,                               // What: Done. Why: A rejected toss was never actually completed, regardless of what donValBoo says. How: This forces false for a rejected row, otherwise uses donValBoo as given.
			completedAt : ( outValStr !== 'rejected' && donValBoo ) ? picTimObj.toISOString() : null, // What: Completed At. Why: Only an actually-completed, non-rejected row has a real completion timestamp. How: This uses picTimObj's own ISO string only when both conditions hold, otherwise null.
			source      : souValStr,                                                                  // What: Source. Why: Stats breaks rows down by how the pick was made. How: This is copied straight from souValStr.
			...( outValStr ? { outcome : outValStr } : {} ),                                          // What: Outcome Spread. Why: Most rows have no special outcome at all, so the field should be entirely absent rather than present-but-null. How: This spreads in an outcome field only when outValStr was actually given.
			...( depEndBoo ? { depletedEnd : true } : {} )                                            // What: Depleted End Spread. Why: Only the row ending an Ease Down depletion streak needs this flag at all. How: This spreads in depletedEnd : true only when depEndBoo is truthy.


		});


	};


	const isaOffFun = ( dayIndNum ) => dayIndNum === 11 ? true : ( dayIndNum <= 10 ? false : Math.random() < 0.13 ); // What: Is-An Off Function. Why: A sprinkling of fully skipped days makes the simulated streaks below read as honest rather than mechanically perfect, while the most recent 10 days are forced active so the headline streak holds. How: This forces day 11 off, forces days 0-10 active, and otherwise rolls a 13% chance of being off.


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



	const easStaObj = {}; // What: Ease State Object And Guard. Why: Every Ease Down picker's own final in-progress state must be reported back to the caller, since the live app needs to resume it. How: This starts empty and is filled once per Ease Down picker by the loop directly below.


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



	return { easStaObj : easStaObj, hisRowArr : picRowArr }; // What: Pick Log Return. Why: The caller (buiSeeFun below, and scripts/build-onboarding-stats.mjs externally) needs both the generated rows and every Ease Down picker's own final state at once. How: This returns picRowArr and easStaObj under their own external contract key names.


}

// #endregion picLogFun



// #region rslBuiFun

/**
 * rslBuiFun = Reminder-Skip-Log Build Function
 *
 * @summary
 * Builds a seeded reminder skip log: past skips across both recurring
 * and one-time demo reminders, with enough distinct entries to
 * exercise the breakdown pager. Denormalized name/type, same as
 * buiRemFun's own completion log, so history survives rename/deletion.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns An array of reminderSkipLog rows, in
 * state.reminderSkipLog's own shape.
 *
 * @example
 * ```ts
 * rslBuiFun() // => array of reminderSkipLog rows
 * ```
 *
*/

function rslBuiFun() {


	const nowDatObj = new Date(); // What: Now Date Object. Why: Every row below is computed relative to this same anchor instant. How: This is read once and reused by addSkiFun below.
	const skiRowArr = [];         // What: Skip Row Array And Guard. Why: Every row built by addSkiFun below needs somewhere to accumulate. How: This starts empty and is pushed into below.


	const addSkiFun = ( tarTasStr, tarNamStr, tarTypStr, bacDayNum ) => { // What: Add Skip Function. Why: Every skip simulated below shares the same row-building logic. How: This resolves bacDayNum into a real timestamp, then pushes one reminderSkipLog row onto skiRowArr.


		const skiDatObj = new Date( nowDatObj ); skiDatObj.setDate( nowDatObj.getDate() - bacDayNum ); skiDatObj.setHours( 7, 45, 0, 0 ); // What: Skip Date Object. Why: Every skip needs its own resolved real date, at a plausible (early-morning, not-yet-done) time. How: This copies nowDatObj, moves it back bacDayNum days, then fixes the time to 7:45am.



		skiRowArr.push({ rowId : 'rs_seed_' + Math.random().toString( 36 ).slice( 2, 8 ), taskId : tarTasStr, name : tarNamStr, type : tarTypStr, skippedAt : skiDatObj.toISOString() }); // What: Skip Row Push. Why: This is one simulated row, in the exact shape state.reminderSkipLog itself expects. How: This builds the row from every argument above plus skiDatObj, resolved above.


	};


	[ 4, 11, 25, 46, 88 ].forEach( ( bacDayNum ) => addSkiFun( 'tk_trash', 'Take out the trash for pickup', 'recurring', bacDayNum ) ); // What: Trash Skip Loop. Why: The trash reminder needs several past skips, more than any other, so it sorts to the top of a High-count breakdown. How: This logs one skip per listed days-back value.
	[ 9, 39, 69 ].forEach( ( bacDayNum ) => addSkiFun( 'tk_meds', 'Refill prescription', 'recurring', bacDayNum ) );                    // What: Meds Skip Loop. Why: The prescription reminder needs a moderate number of past skips. How: This logs one skip per listed days-back value.
	[ 13, 55 ].forEach( ( bacDayNum ) => addSkiFun( 'tk_plants', 'Water the plants', 'recurring', bacDayNum ) );                        // What: Plants Skip Loop. Why: The plant-watering reminder needs a small number of past skips. How: This logs one skip per listed days-back value.

	addSkiFun( 'tk_budget', 'Weekly budget review', 'recurring', 21 );  // What: Budget Skip Call. Why: The budget-review reminder needs exactly one past skip. How: This logs a single skip, 21 days back.
	addSkiFun( 'tk_call', 'Call the plumber back', 'once', 2 );         // What: Plumber Skip Call. Why: This one-time reminder was put off more than once, demonstrating a one-time reminder can still carry several skip rows. How: This logs the first of 2 skips, 2 days back.
	addSkiFun( 'tk_call', 'Call the plumber back', 'once', 5 );         // What: Plumber Skip Call. Why: This one-time reminder was put off more than once, demonstrating a one-time reminder can still carry several skip rows. How: This logs the second of 2 skips, 5 days back.
	addSkiFun( 'tk_dentist', 'Book dentist appointment', 'once', 30 );  // What: Dentist Skip Call. Why: This one-time reminder needs exactly one past skip. How: This logs a single skip, 30 days back.
	addSkiFun( 'tk_carserv', 'Schedule car service', 'once', 62 );      // What: Car Service Skip Call. Why: This one-time reminder needs exactly one past skip. How: This logs a single skip, 62 days back.
	addSkiFun( 'tk_resume', 'Update resume', 'once', 190 );             // What: Resume Skip Call. Why: This one-time reminder needs exactly one past skip. How: This logs a single skip, 190 days back.
	addSkiFun( 'tk_conf', 'Register for the conference', 'once', 124 ); // What: Conference Skip Call. Why: This one-time reminder needs exactly one past skip. How: This logs a single skip, 124 days back.



	return skiRowArr; // What: Skip Row Array Return. Why: The caller needs the finished seeded reminder skip log. How: This returns skiRowArr, built above.


}

// #endregion rslBuiFun



// #region buiSeeFun

/**
 * buiSeeFun = Build Seed Function
 *
 * @summary
 * Assembles the full demo/sample app state: every seeded item, picker,
 * conditional, reminder, and roughly a year of matching history,
 * plus today's own already-in-progress picks. This is design-time-only
 * demo data (see SEED below); it is never the shape a real fresh
 * install starts from (see buiCleFun for that).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns The full demo app state object.
 *
 * @example
 * ```ts
 * buiSeeFun() // => full demo app state object
 * ```
 *
*/

function buiSeeFun() {


	const allIteArr = buiIteFun(); // What: All Item Array. Why: Every other builder below needs the full seeded item list to work from. How: This calls buiIteFun once, reused throughout the rest of this function.
	const allPicArr = buiPicFun(); // What: All Picker Array. Why: Every other builder below needs the full seeded picker list to work from. How: This calls buiPicFun once, reused throughout the rest of this function.

	const picIdeObj = Object.fromEntries( allPicArr.map( ( curPicObj ) => [ curPicObj.id, curPicObj ] ) ); // What: Picker Identifier Object. Why: Today's own rows below need to look a picker up by id repeatedly. How: This maps allPicArr into an id-keyed lookup object.
	const iteNamFun = ( tarNamStr ) => allIteArr.find( ( curIteObj ) => curIteObj.name === tarNamStr );    // What: Item Named Function. Why: Today's own rows below are authored by item name for readability, not by id. How: This searches allIteArr for the first item whose own name matches tarNamStr.
	const todIsoStr = isoDayFun( new Date() );                                                             // What: Today Iso String. Why: Every row referencing "today" below needs the same real calendar day. How: This converts the current date via isoDayFun.

	let seqCouNum = 0; // What: Sequence Count Number And Guard. Why: Every one of today's own entries needs its own unique eid, and nothing else in this scope tracks that count. How: This starts at 0 and is incremented once per call to makEidFun below.

	const makEidFun = () => 'eseed_' + ( seqCouNum++ ).toString( 36 ); // What: Make Eid Function. Why: Today's own entries need an eid (entry id) the same way a live-picked entry would. How: This mints one from a running counter, prefixed 'eseed_'.


	const vacLogArr = buiVacFun( allIteArr ); // What: Vacation Log Array. Why: The pick-log simulation below needs a real inactive-state log to honor. How: This calls buiVacFun with the seeded items.
	const isaVacFun = makVacFun( vacLogArr ); // What: Is-A Vacation Function. Why: The pick-log simulation below needs a predicate, not just the raw log rows. How: This builds the predicate via makVacFun from vacLogArr.

	const { easStaObj, hisRowArr } = picLogFun( allIteArr, allPicArr, isaVacFun ); // What: History Row Array And Ease State Object. Why: This is about a year of simulated pick history, plus each Ease Down picker's own final in-progress state. How: This destructures picLogFun's own return value.


	for ( const curPicObj of allPicArr ) { // What: Ease Down Apply Loop. Why: Every Ease Down picker's own live snapshot must reflect where the simulation above actually left it, not the picker's own static defaults. How: This recharges every item in an Ease Down picker's own pool except the in-progress one, then points the picker at it.


		if ( curPicObj.mode !== 'ease-down' ) continue; // What: Non-Ease-Down Skip Guard. Why: Only an Ease Down picker needs its own live snapshot adjusted this way. How: This skips straight to the next picker otherwise.



		const curStaObj = easStaObj[ curPicObj.id ] || { activeItemId : null, charge : 0 }; // What: Current State Object And Guard. Why: A picker the simulation never touched (e.g. no eligible items at all) still needs a safe fallback state. How: This falls back to a fully-released empty state when easStaObj has no entry for curPicObj's own id.
		const thrValNum = curPicObj.threshold ?? 100;                                       // What: Threshold Value Number. Why: Every item in this picker's own pool must recharge to this same full value. How: This reads curPicObj's own threshold, defaulting to 100 when missing.


		for ( const curIteObj of allIteArr ) if ( curIteObj.pickerId === curPicObj.id ) curIteObj.value = thrValNum; // What: Recharge Loop. Why: Every item in this picker's own pool starts the live app fully charged, except the in-progress one overwritten directly below. How: This sets curIteObj's own value to thrValNum for every item belonging to curPicObj.

		curPicObj.activeItemId = curStaObj.activeItemId; // What: Active Item Id Assignment. Why: The live picker must point at whichever item the simulation left in progress, if any. How: This copies curStaObj's own activeItemId onto curPicObj.

		if ( curStaObj.activeItemId ) { // What: In-Progress Charge Guard. Why: The in-progress item alone must keep its own partial charge rather than the full recharge applied above. How: This looks the item up again and overwrites its own value with curStaObj's own charge.


			const actIteObj = allIteArr.find( ( curIteObj ) => curIteObj.id === curStaObj.activeItemId ); // What: Active Item Object And Guard. Why: The lookup could in principle fail if the simulation referenced an id no longer present. How: This searches allIteArr for the matching item, undefined when not found.

			if ( actIteObj ) actIteObj.value = curStaObj.charge; // What: Active Item Charge Overwrite Guard. Why: Only a genuinely found item should have its own value overwritten. How: This sets actIteObj's own value to curStaObj's own charge.


		}


	}



	const plaActObj = (() => { // What: Play Active Object. Why: Today's own Evening Pick entry below must continue whichever item the Ease Down simulation left in progress, not a fresh pick. How: This resolves the Wind Down picker's own in-progress item, or null when none is active.


		const actIdeStr = ( easStaObj[ 'pkr_play' ] || {} ).activeItemId; // What: Active Identifier String And Guard. Why: The lookup directly below only makes sense when an item is actually in progress. How: This reads easStaObj's own entry for 'pkr_play', falling back to an empty object.



		return actIdeStr ? allIteArr.find( ( curIteObj ) => curIteObj.id === actIdeStr ) : null; // What: Play Active Item Return. Why: The caller needs the actual item object, not just its own id. How: This looks actIdeStr up in allIteArr, or returns null when nothing is in progress.


	})();


	const todPicArr = [ // What: Today Pick Array. Why: Today's own already-in-progress picks need authoring by picker/item name, before being expanded into real entries/rows below. How: This is read by the 2 map calls directly below to build todayPicks/todayRows.


		// Chores group
		{ pickerId : 'pkr_chore_d', iteStr : 'Wipe kitchen counters',   donValBoo : true,  souValStr : 'auto'   }, // What: Chore Pick Tuple. Why: See the comment above this array. How: This is expanded below into both a today.entries row and a pickLog row.
		{ pickerId : 'pkr_chore_w', iteStr : 'Mop the kitchen',         donValBoo : false, souValStr : 'auto'   }, // What: Chore Pick Tuple. Why: See the comment above this array. How: This is expanded below into both a today.entries row and a pickLog row.
		{ pickerId : 'pkr_chore_m', iteStr : 'Dust the bookshelves',    donValBoo : false, souValStr : 'auto'   }, // What: Chore Pick Tuple. Why: See the comment above this array. How: This is expanded below into both a today.entries row and a pickLog row.

		// Food group
		{ pickerId : 'pkr_brk',     iteStr : 'Oatmeal with berries',    donValBoo : true,  souValStr : 'auto'   }, // What: Food Pick Tuple. Why: See the comment above this array. How: This is expanded below into both a today.entries row and a pickLog row.
		{ pickerId : 'pkr_lun',     iteStr : 'Grain bowl',              donValBoo : true,  souValStr : 'auto'   }, // What: Food Pick Tuple. Why: See the comment above this array. How: This is expanded below into both a today.entries row and a pickLog row.
		{ pickerId : 'pkr_din',     iteStr : 'Sheet-pan vegetables',    donValBoo : false, souValStr : 'auto'   }, // What: Food Pick Tuple. Why: See the comment above this array. How: This is expanded below into both a today.entries row and a pickLog row.

		// Singletons, a couple hand-picked from the Pickers tab
		{ pickerId : 'pkr_self',    iteStr : 'Walk without headphones', donValBoo : true,  souValStr : 'manual' },                           // What: Singleton Pick Tuple. Why: See the comment above this array. How: This is expanded below into both a today.entries row and a pickLog row.
		{ pickerId : 'pkr_work',    iteStr : 'Inbox triage, 20 min',    donValBoo : false, souValStr : 'auto'   },                           // What: Singleton Pick Tuple. Why: See the comment above this array. How: This is expanded below into both a today.entries row and a pickLog row.
		{ pickerId : 'pkr_play',    iteStr : ( plaActObj ? plaActObj.name : 'Long bath, no phone' ), donValBoo : false, souValStr : 'auto' } // What: Ease Down Singleton Pick Tuple. Why: This continues whichever item the Ease Down simulation left in progress (or a safe fallback name if somehow none is), rather than authoring a fixed name like every entry above it. How: This is expanded below into both a today.entries row and a pickLog row.


	].map( ( curPikObj ) => ({ ...curPikObj, eid : makEidFun(), itemId : iteNamFun( curPikObj.iteStr ).id }) ); // What: Today Pick Expansion Map. Why: Every authored tuple above still needs a real eid and a resolved itemId before it matches today.entries' own shape. How: This spreads curPikObj, adding a freshly-minted eid and the itemId resolved via iteNamFun.


	const todRowArr = todPicArr.map( ( curPikObj ) => { // What: Today Row Array Map. Why: Every one of today's own picks needs a matching pickLog row too, not just a today.entries row. How: This maps todPicArr into full pickLog-shaped rows.


		const curPicObj = picIdeObj[ curPikObj.pickerId ];               // What: Current Picker Object. Why: This row's own denormalized pickerName/group fields need the real picker looked up. How: This looks curPikObj's own pickerId up in picIdeObj.
		const picTimObj = new Date(); picTimObj.setHours( 8, 30, 0, 0 ); // What: Pick Timestamp Object. Why: A completed today-row needs a plausible, fixed time of day. How: This is set to 8:30am on today's own real date.



		return { // What: Today Row Return. Why: This is one row, in the exact shape state.pickLog itself expects, matching this pick's own today.entries counterpart. How: This builds the row from curPikObj/curPicObj/picTimObj above.


			completedAt : curPikObj.donValBoo ? picTimObj.toISOString() : null, // What: Completed At. Why: Only an actually-completed row has a real completion timestamp. How: This uses picTimObj's own ISO string only when curPikObj's own donValBoo is true, otherwise null.
			date        : todIsoStr,                                            // What: Date. Why: Every one of today's own rows shares the same calendar day. How: This is todIsoStr, resolved above.
			done        : curPikObj.donValBoo,                                  // What: Done. Why: Every row must record whether it was actually completed. How: This is copied straight from curPikObj's own donValBoo.
			eid         : curPikObj.eid,                                        // What: Entry Id. Why: This row must reference the live today.entries row it came from. How: This is copied straight from curPikObj's own eid.
			group       : curPicObj.group,                                      // What: Group. Why: Stats groups rows by their own picker's group. How: This is copied straight from curPicObj's own group.
			id          : 'pls_today_' + curPikObj.eid,                         // What: Id. Why: Every row needs its own stable, unique identifier, tied back to its own entry. How: This is prefixed 'pls_today_' plus curPikObj's own eid.
			itemId      : curPikObj.itemId,                                     // What: Item Id. Why: Every row must record which item it belongs to. How: This is copied straight from curPikObj's own itemId.
			itemName    : curPikObj.iteStr,                                     // What: Item Name. Why: This denormalized copy lets the row survive a later rename or deletion of the item itself. How: This is copied straight from curPikObj's own iteStr.
			pickerId    : curPikObj.pickerId,                                   // What: Picker Id. Why: Every row must record which picker it belongs to. How: This is copied straight from curPikObj's own pickerId.
			pickerName  : curPicObj.name,                                       // What: Picker Name. Why: This denormalized copy lets the row survive a later rename or deletion of the picker itself. How: This is copied straight from curPicObj's own name.
			source      : curPikObj.souValStr                                   // What: Source. Why: Stats breaks rows down by how the pick was made. How: This is copied straight from curPikObj's own souValStr.


		};


	});



	const friIteObj  = allIteArr.find( ( curIteObj ) => curIteObj.name === 'Fridge wipe-down' ); // What: Fridge Item Object And Guard. Why: This item's own history needs one further deterministic adjustment below (see friRetStr), on top of what buiVacFun/picLogFun already simulated. How: This looks the item up by its own known name.

	const friRetStr  = (() => { // What: Fridge Return String. Why: The filter directly below needs this exact same return date buiVacFun already used for this item's own "returned recently" scenario. How: This resolves the ISO date 5 days ago, matching buiVacFun's own hardcoded value for this item.


		const retDatObj = new Date(); // What: Return Date Object. Why: Every step below needs its own real Date instance to move backward from. How: This starts at the current instant.


		retDatObj.setHours( 0, 0, 0, 0 );             // What: Return Date Hours Reset. Why: Only the calendar day matters here, not the current time of day. How: This zeroes out retDatObj's own hours/minutes/seconds/milliseconds in place.
		retDatObj.setDate( retDatObj.getDate() - 5 ); // What: Return Date Day Subtraction. Why: This must match buiVacFun's own hardcoded 5-days-back return date for this exact item. How: This moves retDatObj back 5 days from its own current date.



		return isoDayFun( retDatObj ); // What: Fridge Return Iso Day Return. Why: The caller only wants a plain comparable ISO date string, not a Date instance. How: This converts retDatObj via isoDayFun.


	})();


	const picLogArr = hisRowArr // What: Pick Log Array. Why: This is the final assembled pickLog: the simulated year of history, with the Fridge wipe-down item's own post-return picks deliberately dropped, plus today's own rows appended. How: This filters hisRowArr, then concatenates todRowArr onto it.

		.filter( ( curRowObj ) => !( friIteObj && curRowObj.itemId === friIteObj.id && !curRowObj.outcome && curRowObj.date >= friRetStr ) ) // What: Fridge Post-Return Filter. Why: Fridge wipe-down must deterministically read as "returned but not picked since," which means its own ordinary (non-outcome) rows on or after its own return date must not exist at all. How: This drops exactly those rows, keeping every other row untouched.

		.concat( todRowArr ); // What: Today Row Concat. Why: Today's own rows belong at the end of the assembled log, after every historical row. How: This appends todRowArr onto the filtered history.



	return { // What: Demo State Return. Why: This is the full assembled demo/sample app state, in state's own top-level shape. How: This builds every top-level field from the pieces resolved throughout this function, or inline where no further processing is needed.


		conditionalLog : buiConFun(), // What: Conditional Log. Why: The demo Chore-Free Day gate needs its own year of trigger history. How: This calls buiConFun.

		conditionals   : [ // What: Conditionals. Why: The demo Chore-Free Day gate needs seeding here, attached to the weekly-chore picker via its own conditionalId (set inside buiPicFun above). How: This is a single-entry array, in state.conditionals' own shape.


			{ id : 'cnd_chorefree', name : 'Chore Free Day', cardText : 'Chore free day, enjoy the break!', mode : 'ease-up', value : 60, weight : 1, active : true, triggered : false, easeMin : 18, easeMax : 30, threshold : 100, chargedToday : false } // What: Id String. Why: This is the gate's own stable identifier, referenced by pkr_chore_w's own conditionalId. How: This is a literal, load-bearing string. What: Name String. Why: This is the gate's own display name. How: This is read wherever a conditional's name needs displaying. What: Card Text String. Why: This is shown on the day-off card when the gate actually fires. How: This is read by Today whenever this gate is the reason a picker is resting. What: Mode String. Why: This selects which of conditionals.js's own gate algorithms this conditional uses. How: This is read by the conditional engine exactly like any real, user-created conditional. What: Value Number. Why: This is the gate's own current charge, seeded partway so it is easy to exercise without waiting. How: This is read/written by the conditional engine's own ease-up logic. What: Weight Number. Why: Every conditional needs a weight, even though this ease-up gate does not use it for selection. How: This is read by the conditional engine exactly like any real, user-created conditional. What: Active Boolean. Why: The gate must actually be enabled for it to ever fire. How: This is read by the conditional engine to decide whether to evaluate this gate at all. What: Triggered Boolean. Why: The gate starts out not currently firing. How: This is flipped by the conditional engine once value reaches threshold. What: Ease Min Number. Why: This sets the lower bound of the gate's own per-tick charge amount. How: This is read by the conditional engine wherever this gate's mode consults easeMin. What: Ease Max Number. Why: This sets the upper bound of the gate's own per-tick charge amount. How: This is read by the conditional engine wherever this gate's mode consults easeMax. What: Threshold Number. Why: This is the value the gate must reach to fire. How: This is read by the conditional engine's own ease-up logic. What: Charged Today Boolean. Why: The gate has not yet ticked today at seed time. How: This is flipped by the conditional engine once it charges on a given day.


		],

		daily           : { pickerIds : allPicArr.map( ( curPicObj ) => curPicObj.id ), runTime : '04:00', mode : 'auto' }, // What: Daily. Why: The Daily generator needs to know which pickers to run and when; every seeded picker runs daily, auto-triggered at 4am. How: This maps allPicArr down to just its own ids, paired with a fixed runTime/mode.
		holidays        : HOL_NAM_OBJ.defStaFun(),                                                                          // What: Holidays. Why: The demo state needs a real, canonical holidays-state shape, same as a fresh install would get. How: This calls HOL_NAM_OBJ's own defStaFun.
		items           : allIteArr.filter( ( curIteObj ) => !curIteObj.__deleted ),                                        // What: Items. Why: A retired item is kept only long enough to seed its own pick-log history above; the live item list itself must exclude it, so Stats renders it as a "deleted" ghost row instead. How: This drops every item flagged __deleted from allIteArr.
		onboarding      : { welcomed : true, dismissed : true },                                                            // What: Onboarding. Why: The demo/sample-data build already has pickers and history seeded, so it must never trigger onboarding. How: This marks onboarding as both welcomed and dismissed.
		pickers         : allPicArr,                                                                                        // What: Pickers. Why: Every seeded picker, already fully resolved (schedule, ease-down state, conditional gate) above. How: This is allPicArr, unchanged.
		pickLog         : picLogArr,                                                                                        // What: Pick Log. Why: The demo state needs the full assembled pick history built above. How: This is picLogArr, resolved above.
		reminderLog     : buiRemFun(),                                                                                      // What: Reminder Log. Why: The demo state needs the seeded reminder completion history built above. How: This calls buiRemFun.
		reminderOpts    : TAS_NAM_OBJ.defOptFun(),                                                                          // What: Reminder Opts. Why: The demo state needs a full, valid reminder-options object, same shape a fresh install would get. How: This calls TAS_NAM_OBJ's own defOptFun.
		reminderSkipLog : rslBuiFun(),                                                                                      // What: Reminder Skip Log. Why: The demo state needs the seeded reminder skip history built above. How: This calls rslBuiFun.
		streak          : 11,                                                                                               // What: Streak. Why: The demo state needs a headline streak count consistent with picLogFun's own forced-active last 10 days. How: This is a fixed literal, matching that simulation's own design.

		tasks           : [ // What: Tasks Namespace Object. Why: A few manual reminders need seeding atop Today, covering weekly/monthly/interval/once recurrence. How: This is an array of TAS_NAM_OBJ.defTasFun calls, in state.tasks' own shape.


			TAS_NAM_OBJ.defTasFun({ // What: Trash Task Call. Why: A weekly reminder needs demonstrating, tied to Tuesdays to match buiRemFun's own completion history for tk_trash.

				id : 'tk_trash', name : 'Take out the trash for pickup', repeat : 'weekly', daysOfWeek : [ 2 ]

			}),
			TAS_NAM_OBJ.defTasFun({ id : 'tk_rent', name : 'Pay the rent', repeat : 'monthly', dayOfMonth : 1 }),        // What: Rent Task Call. Why: A monthly reminder needs demonstrating. How: This creates a task recurring on the 1st of every month.
			TAS_NAM_OBJ.defTasFun({ id : 'tk_meds', name : 'Refill prescription', repeat : 'interval', interval : 30 }), // What: Meds Task Call. Why: An interval reminder needs demonstrating, tied to buiRemFun's own tk_meds completion history. How: This creates a task recurring every 30 days.
			TAS_NAM_OBJ.defTasFun({ id : 'tk_call', name : 'Call the plumber back', repeat : 'once' })                   // What: Call Task Call. Why: A one-time reminder needs demonstrating, tied to rslBuiFun's own tk_call skip history. How: This creates a task with no recurrence at all.


		],

		today           : { // What: Today. Why: The demo state needs a real, in-progress-looking Today, not a blank one. How: This builds every field from todIsoStr/todPicArr above, or inline where no further processing is needed.


			date          : todIsoStr, // What: Date. Why: Today needs to know which calendar day it represents. How: This is todIsoStr, resolved above.
			streakClaimed : true,      // What: Streak Claimed. Why: The demo state already has done entries, so today already counts toward the streak. How: This is always true for the demo state.

			entries     : todPicArr.map( ( curPikObj ) => ({ eid : curPikObj.eid, pickerId : curPikObj.pickerId, itemId : curPikObj.itemId, done : curPikObj.donValBoo, skipped : false }) ), // What: Entries. Why: Today needs one real entry per today's own pick, in today.entries' own shape. How: This maps todPicArr down to just the fields that shape actually needs.

			generatedAt : (() => { // What: Generated At. Why: Today needs a plausible timestamp for when the Daily generator last ran. How: This resolves a fixed 7:12am on today's own real date.


				const genDatObj = new Date(); // What: Generated Date Object. Why: The fixed time below needs a real Date instance to write onto. How: This starts at the current instant.

				genDatObj.setHours( 7, 12, 0, 0 ); // What: Generated Date Hours Set. Why: The demo state needs a plausible, fixed generation time, not the current time of day. How: This writes a fixed 7:12am onto genDatObj, zeroing seconds/milliseconds.



				return genDatObj.toISOString(); // What: Generated At Iso String Return. Why: today.generatedAt is stored as a plain ISO timestamp string, not a Date instance. How: This converts genDatObj via its own toISOString.


			})()


		},

		vacationLog : vacLogArr, // What: Vacation Log. Why: The demo state needs the seeded inactive-state log built above. How: This is vacLogArr, resolved above.

		appearance : { theme : 'ink', customLight : null, customDark : null, autoSystem : false, pickAnim : 'reel', completionStyle : 'confetti', tabPlacement : 'bottom' } // What: Appearance. Why: The demo state needs a full, valid appearance settings object, same shape a fresh install would get. How: This is the app's own default theme/animation/placement settings.


	};


}

// #endregion buiSeeFun

// #endregion Demo State



// #region buiCleFun

/**
 * buiCleFun = Build Clean Function
 *
 * @summary
 * Builds the canonical clean state: what a brand-new user sees, no
 * pickers, no items, no reminders, and every app setting at its own
 * default. A Reset restores exactly this (never the demo/sample data
 * from buiSeeFun above, which is only for development/first-run
 * demoing).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns The full clean app state object.
 *
 * @example
 * ```ts
 * buiCleFun() // => full clean app state object
 * ```
 *
*/

function buiCleFun() {


	const todIsoStr = isoDayFun( new Date() ); // What: Today Iso String. Why: The clean state's own today.date field still needs a real calendar day, even with nothing else seeded. How: This converts the current date via isoDayFun.



	return { // What: Clean State Return. Why: This is the full canonical empty app state, in state's own top-level shape, mirroring every field buiSeeFun above also produces. How: This builds every top-level field to its own genuinely empty/default value.


		conditionalLog  : [],                                                                            // What: Conditional Log. Why: A brand-new user has no conditional trigger history at all. How: This is an empty array.
		conditionals    : [],                                                                            // What: Conditionals. Why: A brand-new user has no conditionals at all. How: This is an empty array.
		daily           : { pickerIds : [], runTime : '04:00', mode : 'auto' },                          // What: Daily. Why: The Daily generator needs a valid, empty configuration to start from. How: This is an empty pickerIds list paired with the app's own default runTime/mode.
		holidays        : HOL_NAM_OBJ.defStaFun(),                                                       // What: Holidays. Why: A brand-new user still needs a real, canonical holidays-state shape. How: This calls HOL_NAM_OBJ's own defStaFun.
		items           : [],                                                                            // What: Items. Why: A brand-new user has no items at all. How: This is an empty array.
		onboarding      : { welcomed : false, dismissed : false },                                       // What: Onboarding. Why: A brand-new user must actually see onboarding (the welcome modal, tour, and checklist). How: This marks onboarding as neither welcomed nor dismissed.
		pickers         : [],                                                                            // What: Pickers. Why: A brand-new user has no pickers at all. How: This is an empty array.
		pickLog         : [],                                                                            // What: Pick Log. Why: A brand-new user has no pick history at all. How: This is an empty array.
		reminderLog     : [],                                                                            // What: Reminder Log. Why: A brand-new user has no reminder completion history at all. How: This is an empty array.
		reminderOpts    : TAS_NAM_OBJ.defOptFun(),                                                       // What: Reminder Opts. Why: A brand-new user still needs a full, valid reminder-options object. How: This calls TAS_NAM_OBJ's own defOptFun.
		reminderSkipLog : [],                                                                            // What: Reminder Skip Log. Why: A brand-new user has no reminder skip history at all. How: This is an empty array.
		streak          : 0,                                                                             // What: Streak. Why: A brand-new user has no streak yet. How: This is a fixed literal 0.
		tasks           : [],                                                                            // What: Tasks Namespace Object. Why: A brand-new user has no reminders at all. How: This is an empty array.
		today           : { date : todIsoStr, generatedAt : null, streakClaimed : false, entries : [] }, // What: Today. Why: A brand-new user still needs a valid Today, just an entirely empty one. How: This is today's own real date paired with no generation yet and no entries.
		vacationLog     : [],                                                                            // What: Vacation Log. Why: A brand-new user has no inactive-state history at all. How: This is an empty array.

		appearance : { theme : 'ink', customLight : null, customDark : null, autoSystem : false, pickAnim : 'reel', completionStyle : 'confetti', tabPlacement : 'bottom' } // What: Appearance. Why: A brand-new user still needs a full, valid appearance settings object. How: This is the app's own default theme/animation/placement settings.


	};


}

// #endregion buiCleFun

// #endregion Helpers



// #region Exports

const SED_NAM_OBJ = { // What: Seed Namespace Object. Why: This is the single public entry point every consumer imports by name. How: This maps this file's own internal function/constant names directly onto matching external property names.


	buiCleFun   : buiCleFun,   // What: Build Clean Function. Why: A brand-new install, and a hard reset, both need this fresh empty-state shape rather than the design-time demo fixture. How: This re-exports buiCleFun under its own matching name.
	buiSeeFun   : buiSeeFun,   // What: Build Seed Function. Why: This design-time demo/sample state builder is meant to be called manually during development, not imported by any live app code path. How: This re-exports buiSeeFun under its own matching name.
	MOD_DEF_OBJ : MOD_DEF_OBJ, // What: Mode Definition Object. Why: Every consumer needing a picker mode's own display label and explanatory hint text reads this shared table. How: This re-exports MOD_DEF_OBJ under its own matching name.
	picLogFun   : picLogFun    // What: Pick Log Function. Why: scripts/build-onboarding-stats.mjs reuses this exact simulation to precompute the Welcome Tour's own sample history offline. How: This re-exports picLogFun under its own matching name.


};



export { SED_NAM_OBJ }; // What: Seed Namespace Object Export. Why: store.js, the tabs, the tours and the onboarding-stats script reach the clean state, the mode table and the simulation helpers through the one namespace object. How: This exports SED_NAM_OBJ by name at the very end of the file.

// #endregion Exports


