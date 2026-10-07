


// #region Imports

import type { IteRcdTyp } from '../../src/core/data-model.ts'; // What: Item Record Type. Why: The scenario adds items. How: This types them.
import type { PicRcdTyp } from '../../src/core/data-model.ts'; // What: Picker Record Type. Why: The scenario adds pickers. How: This types them.
import type { StaAppTyp } from '../../src/core/data-model.ts'; // What: State App Type. Why: The scenario extends a saved state. How: This types it.
import type { TasRcdTyp } from '../../src/core/data-model.ts'; // What: Task Record Type. Why: The scenario adds reminders. How: This types them.

// #endregion Imports



/**
 * scenario.ts = Scenario
 *
 * @summary
 * Adds a fixed set of pickers and reminders to the real data, so every
 * schedule the simulation should cover is present whatever the backup
 * holds. Every added name starts with "Sim", and the real records are left
 * untouched.
 *
 * The pickers: a monthly Ease Up on the 31st, which has to clamp to the
 * last day of shorter months; a yearly random picker on January 2; a weekly
 * weighted picker anchored on Wednesday and limited to Monday, Wednesday,
 * and Friday; a daily dynamic picker that skips holidays, whose window holds
 * Thanksgiving, Christmas, and New Year's Day; and a weekday random picker
 * that avoids duplicates and shares item names with the holiday picker, so
 * the duplicate rule gets exercised. The reminders: a yearly one on
 * December 31, a monthly one on the 31st, and a weekly one every other week
 * on Tuesdays and Thursdays.
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

const PIC_BAS_OBJ = { activeItemId : null, anchorDay : 1, anchorDom : 1, anchorDow : 1, anchorMonth : 1, avoidDuplicates : false, conditionalId : null, dateMode : 'date', daysOfWeek : [ 0, 1, 2, 3, 4, 5, 6 ], easeMax : 14, easeMin : 7, group : 'Sim', hidden : false, skipHolidays : false, threshold : 100 } as const; // What: Picker Base Object. Why: Every added picker shares the same defaults. How: This holds the fields each one doesn't set itself.



const SIM_PIC_ARR : Partial< PicRcdTyp >[] = [ // What: Sim Picker Array. Why: These pickers cover the schedules the real data may lack. How: Each row is one picker's own fields.


	{ anchorDom : 31, cadence : 'monthly', id : 'pkr_sim_month', mode : 'ease-up', name : 'Sim Monthly' },                                       // What: Monthly Picker Row. Why: A 31st anchor must clamp in shorter months. How: This is a monthly Ease Up on the 31st.
	{ anchorDay : 2, anchorMonth : 1, cadence : 'yearly', id : 'pkr_sim_year', mode : 'random', name : 'Sim Yearly' },                           // What: Yearly Picker Row. Why: A yearly date schedule must run once a year. How: This is a yearly random picker on January 2.
	{ anchorDow : 3, cadence : 'weekly', daysOfWeek : [ 1, 3, 5 ], id : 'pkr_sim_week', mode : 'weighted', name : 'Sim Weekly' },                // What: Weekly Picker Row. Why: A weekly schedule limited to some weekdays must still run once a week. How: This is a weekly weighted picker anchored on Wednesday.
	{ cadence : 'daily', id : 'pkr_sim_holiday', mode : 'dynamic', name : 'Sim Holiday', skipHolidays : true },                                  // What: Holiday Picker Row. Why: Holiday skipping must hold. How: This is a daily dynamic picker that skips holidays.
	{ avoidDuplicates : true, cadence : 'daily', daysOfWeek : [ 1, 2, 3, 4, 5 ], id : 'pkr_sim_weekday', mode : 'random', name : 'Sim Weekday' } // What: Weekday Picker Row. Why: Weekday limits and duplicate avoidance must hold. How: This is a weekday random picker avoiding duplicates.


];



const SIM_ITE_ARR : [ string, string ][] = [ // What: Sim Item Array. Why: Each added picker needs items, some sharing names across pickers. How: Each row is a picker id and an item name.


	[ 'pkr_sim_month',   'Sim Deep Clean' ],     // What: Monthly Item One. Why: The monthly picker needs a pool. How: This is its first item.
	[ 'pkr_sim_month',   'Sim Filters' ],        // What: Monthly Item Two. Why: The monthly picker needs a pool. How: This is its second item.
	[ 'pkr_sim_year',    'Sim Taxes' ],          // What: Yearly Item One. Why: The yearly picker needs a pool. How: This is its first item.
	[ 'pkr_sim_year',    'Sim Checkup' ],        // What: Yearly Item Two. Why: The yearly picker needs a pool. How: This is its second item.
	[ 'pkr_sim_week',    'Sim Laundry' ],        // What: Weekly Item One. Why: The weekly picker needs a pool. How: This is its first item.
	[ 'pkr_sim_week',    'Sim Groceries' ],      // What: Weekly Item Two. Why: The weekly picker needs a pool. How: This is its second item.
	[ 'pkr_sim_holiday', 'Sim Shared Walk' ],    // What: Holiday Item One. Why: This name is shared with the weekday picker. How: This is the holiday picker's first item.
	[ 'pkr_sim_holiday', 'Sim Shared Stretch' ], // What: Holiday Item Two. Why: This name is shared with the weekday picker. How: This is the holiday picker's second item.
	[ 'pkr_sim_weekday', 'Sim Shared Walk' ],    // What: Weekday Item One. Why: Sharing a name exercises duplicate avoidance. How: This is the weekday picker's first item.
	[ 'pkr_sim_weekday', 'Sim Shared Stretch' ], // What: Weekday Item Two. Why: Sharing a name exercises duplicate avoidance. How: This is the weekday picker's second item.
	[ 'pkr_sim_weekday', 'Sim Journal' ]         // What: Weekday Item Three. Why: An unshared name lets duplicates be avoided. How: This is the weekday picker's third item.


];



const SIM_TAS_ARR : Partial< TasRcdTyp >[] = [ // What: Sim Task Array. Why: These reminders cover schedules the real data may lack. How: Each row is one reminder's own fields.


	{ day : 31, id : 'tk_sim_year', month : 12, name : 'Sim Year End', repeat : 'annual' },                           // What: Yearly Reminder Row. Why: A yearly date reminder must fall once a year. How: This is due every December 31.
	{ dayOfMonth : 31, id : 'tk_sim_month', name : 'Sim Month End', repeat : 'monthly' },                             // What: Monthly Reminder Row. Why: A 31st reminder must clamp in shorter months. How: This is due on each month's last day.
	{ daysOfWeek : [ 2, 4 ], id : 'tk_sim_biweekly', interval : 2, name : 'Sim Every Other Week', repeat : 'weekly' } // What: Biweekly Reminder Row. Why: An every-N-weeks reminder must skip the weeks between. How: This is due Tuesdays and Thursdays every other week.


];

// #endregion Constants



// #region Helpers

// #region addSimFun

/**
 * addSimFun = Add Sim Function
 *
 * @summary
 * Returns a copy of a saved state with the scenario's pickers, items, and
 * reminders added and the pickers joined to the daily list. Every record is
 * complete, filled from shared defaults, so the app treats it like any
 * saved record. Reminders are anchored on 2026-09-01, before the default run
 * starts.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param staAppObj - State App Object: The saved state to extend.
 *
 * @returns The extended copy.
 *
 * @example
 * ```ts
 * addSimFun(reaFixFun()) // => the backup plus the Sim records
 * ```
 *
*/

const addSimFun = ( staAppObj : StaAppTyp ) : StaAppTyp => ( { // What: Add Sim Function. Why: Every schedule must be present whatever the backup holds. How: This returns the state with the scenario's records added.


	...staAppObj, // What: State Spread. Why: Everything else stays as the backup has it. How: This copies the state.

	daily : { // What: Daily. Why: The added pickers run in the daily list. How: This appends their ids.


		...staAppObj.daily, // What: Daily Spread. Why: The daily settings stay as the backup has them. How: This copies them.

		pickerIds : [ ...staAppObj.daily.pickerIds, ...SIM_PIC_ARR.map( ( simPicObj ) => simPicObj.id! ) ] // What: Picker Identifiers. Why: The added pickers join the saved daily list. How: This appends their ids. // What: Non-Null Note. Why: Every scenario picker sets its id. How: The ! tells TypeScript it's set.


	},

	items : [ ...staAppObj.items, ...SIM_ITE_ARR.map( ( [ picIdeStr, namTexStr ], iteIndNum ) : IteRcdTyp => ( { id : `it_sim_${ iteIndNum }`, lastPicked : null, name : namTexStr, pickerId : picIdeStr, picks : 0, vacation : false, value : 0, weight : 1 } ) ) ], // What: Items. Why: Each added picker needs its pool. How: This appends complete item records.

	pickers : [ // What: Pickers. Why: The scenario's pickers join the saved ones. How: This appends each, filled from the base.


		...staAppObj.pickers, // What: Saved Pickers Spread. Why: The backup's pickers stay as they are. How: This copies them first.

		...SIM_PIC_ARR.map( ( simPicObj ) => ( { // What: Scenario Pickers Spread. Why: Each scenario picker is filled from the base. How: This merges each row over the base. // What: Type Assertion Note. Why: The rows only set what differs from the base. How: Each merged row is read as a full picker record, since the base supplies every other field.


			...PIC_BAS_OBJ, // What: Picker Base Spread. Why: Every scenario picker starts from the shared base. How: This copies the base fields.

			daysOfWeek : [ ...PIC_BAS_OBJ.daysOfWeek ], // What: Days Of Week. Why: Each picker gets its own copy of the base's days. How: This copies the array.

			...simPicObj // What: Scenario Picker Spread. Why: Each row sets what differs from the base. How: This lays the row over the base.


		} as PicRcdTyp ) )


	],

	tasks : [ ...staAppObj.tasks, ...SIM_TAS_ARR.map( ( simTasObj ) => ( { anchor : '2026-09-01', createdAt : '2026-09-01', dateMode : 'date', day : 1, dayOfMonth : 1, daysOfWeek : [ 1 ], hidden : false, interval : 1, lastDone : null, month : 1, nthOrdinal : 1, nthWeekday : 0, skipUntil : null, ...simTasObj } as TasRcdTyp ) ) ] // What: Tasks. Why: The scenario's reminders join the saved ones. How: This appends each, filled from shared defaults. // What: Type Assertion Note. Why: The rows only set what differs from the defaults. How: Each merged row is read as a full reminder record, since the defaults supply every other field.


} );

// #endregion addSimFun

// #endregion Helpers



// #region Exports

export { addSimFun }; // What: Named Exports. Why: The simulation extends the backup through this. How: This exports addSimFun by name.

// #endregion Exports


