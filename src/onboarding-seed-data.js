



/**
 * onboarding-seed-data.js = Onboarding Seed Data
 *
 * @summary
 * Sample-picker and sample-reminder data seeded on a fresh install,
 * before the Welcome Tour begins (see the seeding effect in
 * onboarding.jsx). Kept in its own plain-JS module, no JSX and no React
 * import, so it can also be imported directly by
 * scripts/build-onboarding-stats.mjs: a Node script that precomputes
 * about a year of matching pick/reminder history offline.
 *
 * The ids below are load-bearing: they must exactly match what that
 * script baked into src/onboarding-stats-data.js, or the precomputed
 * history will reference pickers, items, or tasks that no longer exist.
 * That generated file is auto-generated and must never be hand-edited;
 * treat it as read-only.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



/**
 * OB_EXAMPLE = Onboarding Example
 *
 * @summary
 * The sample "Daily Chores" picker seeded alongside the Welcome Tour.
 * Doubles as prefill data for the (currently stashed) create-a-picker
 * form flow in onboarding.jsx, for whenever a future create-a-picker
 * mini-tour reuses this same data.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

export const OB_EXAMPLE = { // What: Onboarding Example Object. Why: This is the sample "Daily Chores" picker seeded alongside the Welcome Tour (see the comment above this declaration). How: This is spread into actions.addPicker by onboarding.jsx's own seeding effect, exactly like a real, user-created picker.


	id    : 'pkr_ob_daily',    // What: Id String. Why: This is this sample picker's own stable identifier, matching what scripts/build-onboarding-stats.mjs baked into onboarding-stats-data.js and what store.jsx/onboarding.jsx use to recognize and later hide this sample. How: This is a literal, load-bearing string, never generated at runtime.
	name  : 'Daily Chores',    // What: Name String. Why: This is the picker's own display name shown throughout the app. How: This is read wherever a picker's name needs displaying, exactly like any real, user-created picker.
	group : 'Chores',          // What: Group String. Why: This assigns the picker to one of the app's built-in sample groups, so it sits alongside real pickers covering the same topic. How: This is read by the grouping/filtering UI exactly like any real picker's own group.
	mode  : 'ease-up',         // What: Mode String. Why: This selects which of pickers.js's own selection algorithms (random/weighted/dynamic/ease-up/ease-down) this sample picker uses. How: This is read by the picker engine exactly like any real picker's own mode.
	step  : 1,                 // What: Step Number. Why: This prefills the (currently stashed) create-a-picker form's own wizard step, for whenever a future create-a-picker mini-tour reuses this data. How: This is only read by that stashed form flow, not by the picker engine itself.

	items : [ // What: Items Array. Why: Every picker needs at least one item for the picker engine to actually choose between. How: This is read by the picker engine exactly like any real picker's own items array.


		{ id : 'ob_it_laundry', name : 'Do the laundry', weight : 1, easeMin : 7, easeMax : 14, value : 100 },                // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, eased via its own easeMin/easeMax/value fields.
		{ id : 'ob_it_bath', name : 'Clean the bathrooms', weight : 1, easeMin : 12.5, easeMax : 20, value : 100 },           // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, eased via its own easeMin/easeMax/value fields.
		{ id : 'ob_it_dust', name : 'Dust the main living area', weight : 1, easeMin : 9.0909, easeMax : 12.5, value : 100 }, // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, eased via its own easeMin/easeMax/value fields.
		{ id : 'ob_it_vacuum', name : 'Vacuum the floors', weight : 1, easeMin : 11.1111, easeMax : 16.6667, value : 100 },   // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, eased via its own easeMin/easeMax/value fields.
		{ id : 'ob_it_shower', name : 'Clean the shower', weight : 1, easeMin : 5.5556, easeMax : 8.3333, value : 100 },      // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, eased via its own easeMin/easeMax/value fields.
		{ id : 'ob_it_oven', name : 'Clean the oven', weight : 1, easeMin : 4.7619, easeMax : 7.1429, value : 100 }           // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, eased via its own easeMin/easeMax/value fields.


	]


};



/**
 * OB_EXTRA_PICKERS = Onboarding Extra Pickers
 *
 * @summary
 * Extra sample pickers (Chores/Food/Self Care/Entertainment) meant to
 * make a generated day look like a fuller, more realistic todo list
 * instead of a single lonely item. Each one uses the create-a-picker
 * form's own defaults (daily cadence, every day of the week, holidays
 * not skipped, included in the daily generator) aside from what is
 * specified here. Seeded alongside OB_EXAMPLE.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

export const OB_EXTRA_PICKERS = [ // What: Onboarding Extra Pickers Array. Why: This is the extra sample-picker pool described above, seeded alongside OB_EXAMPLE. How: This is spread into actions.addPicker by onboarding.jsx's own seeding effect, exactly like a real, user-created picker.


	{ // What: Extra Sample Picker Object. Why: This is one of the extra sample pickers described in the comment above this array, meant to round out a generated day. How: This follows the create-a-picker form's own defaults except for what is specified here, and is read by the picker engine exactly like any real, user-created picker.


		id    : 'pkr_ob_monthly', // What: Id String. Why: This is this sample picker's own stable identifier, matching what scripts/build-onboarding-stats.mjs baked into onboarding-stats-data.js and what store.jsx/onboarding.jsx use to recognize and later hide this sample. How: This is a literal, load-bearing string, never generated at runtime.
		name  : 'Monthly Chores', // What: Name String. Why: This is the picker's own display name shown throughout the app. How: This is read wherever a picker's name needs displaying, exactly like any real, user-created picker.
		group : 'Chores',         // What: Group String. Why: This assigns the picker to one of the app's built-in sample groups, so it sits alongside real pickers covering the same topic. How: This is read by the grouping/filtering UI exactly like any real picker's own group.
		mode  : 'ease-up',        // What: Mode String. Why: This selects which of pickers.js's own selection algorithms (random/weighted/dynamic/ease-up/ease-down) this sample picker uses. How: This is read by the picker engine exactly like any real picker's own mode.

		items : [ // What: Items Array. Why: Every picker needs at least one item for the picker engine to actually choose between. How: This is read by the picker engine exactly like any real picker's own items array.


			{ id : 'it_ob_oven2', name : 'Deep clean the oven', weight : 1, easeMin : 2.5, easeMax : 4.1667, value : 100 },          // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, eased via its own easeMin/easeMax/value fields.
			{ id : 'it_ob_dust2', name : 'Dust the entire house', weight : 1, easeMin : 3.7037, easeMax : 5.5556, value : 100 },     // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, eased via its own easeMin/easeMax/value fields.
			{ id : 'it_ob_fridge', name : 'Clean out the fridge', weight : 1, easeMin : 2.2222, easeMax : 3.0303, value : 100 },     // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, eased via its own easeMin/easeMax/value fields.
			{ id : 'it_ob_vacuum2', name : 'Vacuum under the furniture', weight : 1, easeMin : 1.6667, easeMax : 2.5, value : 100 }, // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, eased via its own easeMin/easeMax/value fields.
			{ id : 'it_ob_mop', name : 'Mop the floors', weight : 1, easeMin : 4.3478, easeMax : 6.6667, value : 100 }               // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, eased via its own easeMin/easeMax/value fields.


		]


	},

	{ // What: Extra Sample Picker Object. Why: This is one of the extra sample pickers described in the comment above this array, meant to round out a generated day. How: This follows the create-a-picker form's own defaults except for what is specified here, and is read by the picker engine exactly like any real, user-created picker.


		id    : 'pkr_ob_coffee', // What: Id String. Why: This is this sample picker's own stable identifier, matching what scripts/build-onboarding-stats.mjs baked into onboarding-stats-data.js and what store.jsx/onboarding.jsx use to recognize and later hide this sample. How: This is a literal, load-bearing string, never generated at runtime.
		name  : 'Coffee Creamer', // What: Name String. Why: This is the picker's own display name shown throughout the app. How: This is read wherever a picker's name needs displaying, exactly like any real, user-created picker.
		group : 'Food',           // What: Group String. Why: This assigns the picker to one of the app's built-in sample groups, so it sits alongside real pickers covering the same topic. How: This is read by the grouping/filtering UI exactly like any real picker's own group.
		mode  : 'dynamic',        // What: Mode String. Why: This selects which of pickers.js's own selection algorithms (random/weighted/dynamic/ease-up/ease-down) this sample picker uses. How: This is read by the picker engine exactly like any real picker's own mode.

		items : [ // What: Items Array. Why: Every picker needs at least one item for the picker engine to actually choose between. How: This is read by the picker engine exactly like any real picker's own items array.


			{ id : 'it_ob_vanilla', name : 'French Vanilla', weight : 1 }, // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, weighted via its own weight field.
			{ id : 'it_ob_caramel', name : 'Caramel', weight : 3 },        // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, weighted via its own weight field.
			{ id : 'it_ob_sweetcream', name : 'Sweet Cream', weight : 2 }, // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, weighted via its own weight field.
			{ id : 'it_ob_cinnamon', name : 'Cinnamon', weight : 1 },      // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, weighted via its own weight field.
			{ id : 'it_ob_pumpkin', name : 'Pumpkin Spice', weight : 2 },  // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, weighted via its own weight field.
			{ id : 'it_ob_hazelnut', name : 'Hazelnut', weight : 1 },      // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, weighted via its own weight field.
			{ id : 'it_ob_mocha', name : 'Mocha', weight : 3 }             // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, weighted via its own weight field.


		]


	},

	{ // What: Extra Sample Picker Object. Why: This is one of the extra sample pickers described in the comment above this array, meant to round out a generated day. How: This follows the create-a-picker form's own defaults except for what is specified here, and is read by the picker engine exactly like any real, user-created picker.


		id    : 'pkr_ob_dinner', // What: Id String. Why: This is this sample picker's own stable identifier, matching what scripts/build-onboarding-stats.mjs baked into onboarding-stats-data.js and what store.jsx/onboarding.jsx use to recognize and later hide this sample. How: This is a literal, load-bearing string, never generated at runtime.
		name  : 'Dinner',        // What: Name String. Why: This is the picker's own display name shown throughout the app. How: This is read wherever a picker's name needs displaying, exactly like any real, user-created picker.
		group : 'Food',          // What: Group String. Why: This assigns the picker to one of the app's built-in sample groups, so it sits alongside real pickers covering the same topic. How: This is read by the grouping/filtering UI exactly like any real picker's own group.
		mode  : 'ease-up',       // What: Mode String. Why: This selects which of pickers.js's own selection algorithms (random/weighted/dynamic/ease-up/ease-down) this sample picker uses. How: This is read by the picker engine exactly like any real picker's own mode.

		items : [ // What: Items Array. Why: Every picker needs at least one item for the picker engine to actually choose between. How: This is read by the picker engine exactly like any real picker's own items array.


			{ id : 'it_ob_spaghetti', name : 'Spaghetti and meatballs', weight : 1, easeMin : 8.3333, easeMax : 14.2857, value : 100 }, // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, eased via its own easeMin/easeMax/value fields.
			{ id : 'it_ob_meatloaf', name : 'Meatloaf', weight : 1, easeMin : 7.1429, easeMax : 10, value : 100 },                      // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, eased via its own easeMin/easeMax/value fields.
			{ id : 'it_ob_tacos', name : 'Tacos', weight : 1, easeMin : 10, easeMax : 16.6667, value : 100 },                           // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, eased via its own easeMin/easeMax/value fields.
			{ id : 'it_ob_pizza', name : 'Pizza', weight : 1, easeMin : 12.5, easeMax : 20, value : 100 },                              // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, eased via its own easeMin/easeMax/value fields.
			{ id : 'it_ob_steak', name : 'Steak and potatoes', weight : 1, easeMin : 7.6923, easeMax : 11.1111, value : 100 },          // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, eased via its own easeMin/easeMax/value fields.
			{ id : 'it_ob_burger', name : 'Burger and fries', weight : 1, easeMin : 9.0909, easeMax : 12.5, value : 100 },              // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, eased via its own easeMin/easeMax/value fields.
			{ id : 'it_ob_lemonchicken', name : 'Lemon Chicken', weight : 1, easeMin : 7.1429, easeMax : 14.2857, value : 100 },        // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, eased via its own easeMin/easeMax/value fields.
			{ id : 'it_ob_friedchicken', name : 'Fried chicken', weight : 1, easeMin : 11.1111, easeMax : 16.6667, value : 100 }        // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, eased via its own easeMin/easeMax/value fields.


		]


	},

	{ // What: Extra Sample Picker Object. Why: This is one of the extra sample pickers described in the comment above this array, meant to round out a generated day. How: This follows the create-a-picker form's own defaults except for what is specified here, and is read by the picker engine exactly like any real, user-created picker.


		id    : 'pkr_ob_workouts', // What: Id String. Why: This is this sample picker's own stable identifier, matching what scripts/build-onboarding-stats.mjs baked into onboarding-stats-data.js and what store.jsx/onboarding.jsx use to recognize and later hide this sample. How: This is a literal, load-bearing string, never generated at runtime.
		name  : 'Workouts',        // What: Name String. Why: This is the picker's own display name shown throughout the app. How: This is read wherever a picker's name needs displaying, exactly like any real, user-created picker.
		group : 'Self Care',       // What: Group String. Why: This assigns the picker to one of the app's built-in sample groups, so it sits alongside real pickers covering the same topic. How: This is read by the grouping/filtering UI exactly like any real picker's own group.
		mode  : 'ease-up',         // What: Mode String. Why: This selects which of pickers.js's own selection algorithms (random/weighted/dynamic/ease-up/ease-down) this sample picker uses. How: This is read by the picker engine exactly like any real picker's own mode.

		items : [ // What: Items Array. Why: Every picker needs at least one item for the picker engine to actually choose between. How: This is read by the picker engine exactly like any real picker's own items array.


			{ id : 'it_ob_chest', name : 'Chest', weight : 1, easeMin : 14.2857, easeMax : 20, value : 100 },              // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, eased via its own easeMin/easeMax/value fields.
			{ id : 'it_ob_legs', name : 'Legs', weight : 1, easeMin : 12.5, easeMax : 16.6667, value : 100 },              // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, eased via its own easeMin/easeMax/value fields.
			{ id : 'it_ob_shoulders', name : 'Shoulders', weight : 1, easeMin : 11.1111, easeMax : 14.2857, value : 100 }, // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, eased via its own easeMin/easeMax/value fields.
			{ id : 'it_ob_arms', name : 'Arms', weight : 1, easeMin : 12.5, easeMax : 25, value : 100 },                   // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, eased via its own easeMin/easeMax/value fields.
			{ id : 'it_ob_core', name : 'Core', weight : 1, easeMin : 12.5, easeMax : 20, value : 100 }                    // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, eased via its own easeMin/easeMax/value fields.


		]


	},

	{ // What: Extra Sample Picker Object. Why: This is one of the extra sample pickers described in the comment above this array, meant to round out a generated day. How: This follows the create-a-picker form's own defaults except for what is specified here, and is read by the picker engine exactly like any real, user-created picker.


		id    : 'pkr_ob_relax',    // What: Id String. Why: This is this sample picker's own stable identifier, matching what scripts/build-onboarding-stats.mjs baked into onboarding-stats-data.js and what store.jsx/onboarding.jsx use to recognize and later hide this sample. How: This is a literal, load-bearing string, never generated at runtime.
		name  : 'Relax',           // What: Name String. Why: This is the picker's own display name shown throughout the app. How: This is read wherever a picker's name needs displaying, exactly like any real, user-created picker.
		group : 'Entertainment',   // What: Group String. Why: This assigns the picker to one of the app's built-in sample groups, so it sits alongside real pickers covering the same topic. How: This is read by the grouping/filtering UI exactly like any real picker's own group.
		mode  : 'ease-down',       // What: Mode String. Why: This selects which of pickers.js's own selection algorithms (random/weighted/dynamic/ease-up/ease-down) this sample picker uses. How: This is read by the picker engine exactly like any real picker's own mode.

		items : [ // What: Items Array. Why: Every picker needs at least one item for the picker engine to actually choose between. How: This is read by the picker engine exactly like any real picker's own items array.


			{ id : 'it_ob_readbook', name : 'Read a book', weight : 1, easeMin : 14.2857, easeMax : 20, value : 100 },          // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, eased via its own easeMin/easeMax/value fields.
			{ id : 'it_ob_bingewatch', name : 'Binge watch a show', weight : 1, easeMin : 20, easeMax : 50, value : 100 },      // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, eased via its own easeMin/easeMax/value fields.
			{ id : 'it_ob_watchmovie', name : 'Watch a movie', weight : 1, easeMin : 16.6667, easeMax : 33.3333, value : 100 }, // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, eased via its own easeMin/easeMax/value fields.
			{ id : 'it_ob_youtube', name : 'Browse YouTube', weight : 1, easeMin : 25, easeMax : 50, value : 100 }              // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving the Welcome Tour something realistic to pick from. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, eased via its own easeMin/easeMax/value fields.


		]


	}


];



/**
 * OB_TASKS = Onboarding Tasks
 *
 * @summary
 * The two sample reminders seeded alongside the pickers above. "Pick up
 * prescription" is a one-time reminder; it stays pending, since no
 * history makes sense for something not yet completed. "Take trash out
 * for pickup" is weekly on Mondays and gets about a year of completion
 * history; see src/onboarding-stats-data.js.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

export const OB_TASKS = [ // What: Onboarding Tasks Array. Why: This is the sample-reminder pool described above, seeded alongside the pickers. How: This is spread into actions.addTask by onboarding.jsx's own seeding effect, exactly like a real, user-created task.


	{ id : 'tk_ob_meds', name : 'Pick up prescription', repeat : 'once' },                             // What: Sample Task Object. Why: This is one of the two sample reminders seeded alongside the pickers above (see the comment above this array for which is which). How: This is read by the reminders engine (tasks.js) exactly like any real, user-created task.
	{ id : 'tk_ob_trash', name : 'Take trash out for pickup', repeat : 'weekly', daysOfWeek : [ 1 ] }, // What: Sample Task Object. Why: This is one of the two sample reminders seeded alongside the pickers above (see the comment above this array for which is which). How: This is read by the reminders engine (tasks.js) exactly like any real, user-created task.


];



/**
 * OB_SAMPLE_PICKER_IDS = Onboarding Sample Picker Ids
 *
 * @summary
 * Every sample picker/task id in one place, used to hide them once the
 * Welcome Tour ends (see onboarding.jsx) and to recognize a still-hidden
 * one as a mini-tour launcher card on Today (see tab-today.jsx /
 * reminders.jsx).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

export const OB_SAMPLE_PICKER_IDS = [ OB_EXAMPLE, ...OB_EXTRA_PICKERS ].map( ( curPicObj ) => curPicObj.id ); // What: Onboarding Sample Picker Ids Array. Why: This is every seeded sample picker's own id, flattened into one array (see the comment above this declaration). How: This maps OB_EXAMPLE plus every OB_EXTRA_PICKERS entry down to just its own id field.
export const OB_SAMPLE_TASK_IDS   = OB_TASKS.map( ( curTasObj ) => curTasObj.id );                           // What: Onboarding Sample Task Ids Array. Why: This is every seeded sample task's own id, flattened into one array (see the comment above OB_SAMPLE_PICKER_IDS above). How: This maps every OB_TASKS entry down to just its own id field.



/**
 * OB_REMINDER_CARD_TEXT = Onboarding Reminder Card Text
 *
 * @summary
 * Override copy for each sample reminder's mini-tour launcher card. A
 * card's name always reads as an instruction (e.g. "Set up a ...
 * reminder") rather than the sample's own real name. kicker is an
 * explicit override only where the real schedule summary
 * (TASKS.summary(task)) isn't what should be shown: the one-time
 * reminder wants "One-Time" instead of TASKS.summary's own "One-time".
 * The recurring reminder has no kicker override here on purpose, since
 * its daysOfWeek is set dynamically at seed time (see onboarding.jsx) to
 * whatever day the tour is taken on, so TASKS.summary already produces
 * the right "Every {Day}" text for it on its own. Sample pickers don't
 * need an equivalent table at all: their own card kicker is just the
 * picker's own name, and the card name is always "Set up a {picker
 * name} picker". time is a real, user-confirmed estimate, manually
 * timed 2026-08-14, shown on the card.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

export const OB_REMINDER_CARD_TEXT = { // What: Onboarding Reminder Card Text Object. Why: This is the mini-tour launcher card copy override table described above, keyed by sample task id. How: This is read by reminders.jsx wherever a still-hidden sample task's own launcher card is rendered.


	tk_ob_meds  : { kicker : 'One-Time', name : 'Set up a one time reminder', time : '< 1 min' }, // What: One-Time Task Card Text Object. Why: The one-time sample reminder needs its own kicker override ("One-Time" instead of TASKS.summary's own "One-time"), plus its card name and manually-timed estimate. How: This is read by reminders.jsx keyed by tk_ob_meds, this sample task's own id.
	tk_ob_trash : { name : 'Set up a recurring reminder', time : '1 min' }                        // What: Recurring Task Card Text Object. Why: The recurring sample reminder needs no kicker override, since TASKS.summary already produces the right "Every {Day}" text for it on its own; only its card name and manually-timed estimate are given here. How: This is read by reminders.jsx keyed by tk_ob_trash, this sample task's own id.


};



/**
 * OB_PICKER_CARD_TIME = Onboarding Picker Card Time
 *
 * @summary
 * Same idea as OB_REMINDER_CARD_TEXT's own time field above, but pickers
 * have no equivalent card-text override table to hang it off of, since
 * their own kicker/name are derived directly from the picker rather
 * than overridden. A standalone map keyed by sample picker id instead.
 * Real, user-confirmed estimates, manually timed 2026-08-14.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

export const OB_PICKER_CARD_TIME = { // What: Onboarding Picker Card Time Object. Why: This is the manually-timed card estimate table described above, keyed by sample picker id. How: This is read by whatever component renders a still-hidden sample picker's own mini-tour launcher card.


	pkr_ob_daily    : '2.5 min', // What: Picker Time String. Why: This is one sample picker's own manually-timed card estimate (see the comment above this object for methodology). How: This is read by that picker's own mini-tour launcher card, keyed by this property's own name matching the picker's own id.
	pkr_ob_monthly  : '2.5 min', // What: Picker Time String. Why: This is one sample picker's own manually-timed card estimate (see the comment above this object for methodology). How: This is read by that picker's own mini-tour launcher card, keyed by this property's own name matching the picker's own id.
	pkr_ob_coffee   : '2.5 min', // What: Picker Time String. Why: This is one sample picker's own manually-timed card estimate (see the comment above this object for methodology). How: This is read by that picker's own mini-tour launcher card, keyed by this property's own name matching the picker's own id.
	pkr_ob_dinner   : '2.5 min', // What: Picker Time String. Why: This is one sample picker's own manually-timed card estimate (see the comment above this object for methodology). How: This is read by that picker's own mini-tour launcher card, keyed by this property's own name matching the picker's own id.
	pkr_ob_workouts : '2.5 min', // What: Picker Time String. Why: This is one sample picker's own manually-timed card estimate (see the comment above this object for methodology). How: This is read by that picker's own mini-tour launcher card, keyed by this property's own name matching the picker's own id.
	pkr_ob_relax    : '2.5 min'  // What: Picker Time String. Why: This is one sample picker's own manually-timed card estimate (see the comment above this object for methodology). How: This is read by that picker's own mini-tour launcher card, keyed by this property's own name matching the picker's own id.


};



// #region isoDayFun

/**
 * isoDayFun = Iso Day Function
 *
 * @summary
 * Produces the same local-timezone-adjusted ISO day string as
 * store.jsx's own isoDay and seed.js's own seedIsoDay, kept as a local
 * copy since this module has no dependency on either.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param datRawObj - Date Raw Object: The date to convert.
 *
 * @returns The given date's own local calendar day, as a "YYYY-MM-DD"
 * string.
 *
 * @example
 * ```ts
 * isoDayFun(datRawObj) // => 'YYYY-MM-DD'
 * ```
 *
*/

function isoDayFun( datRawObj ) {


	const datCopObj = new Date( datRawObj ); // What: Date Copy Object. Why: The given date must not be mutated by the timezone shift below. How: This constructs a fresh Date instance from datRawObj.

	datCopObj.setMinutes( datCopObj.getMinutes() - datCopObj.getTimezoneOffset() ); // What: Date Copy Minutes Adjustment. Why: Shifting by the local timezone offset is what makes the ISO string below reflect the local calendar day instead of UTC's. How: This subtracts the local timezone offset, in minutes, from the copy's own minutes.



	return datCopObj.toISOString().slice( 0, 10 ); // What: Iso Day String Return. Why: The caller only wants the calendar-day portion, not a full timestamp. How: This takes the shifted copy's ISO string and slices off everything after the first 10 characters (YYYY-MM-DD).


}

// #endregion isoDayFun



// #region hydrateOnboardingStats

/**
 * hydrateOnboardingStats = Hydrate Onboarding Stats
 *
 * @summary
 * Converts the precomputed, day-offset-based ONBOARDING_STATS (see
 * src/onboarding-stats-data.js and scripts/build-onboarding-stats.mjs)
 * into real pickLog / reminderLog / reminderSkipLog rows, dated
 * relative to the ACTUAL current date rather than whenever that file
 * happened to be generated. Pure date arithmetic over a few thousand
 * rows; this is effectively instant, with no perceptible delay for the
 * tour that's about to start.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param staRawObj - State Raw Object: The precomputed stats object from
 *                    onboarding-stats-data.js, holding day-offset-based
 *                    pickLog / reminderLog / reminderSkipLog arrays.
 *
 * @returns The same 3 logs, converted into real dated rows ready to
 * append onto app state.
 *
 * @example
 * ```ts
 * hydrateOnboardingStats(staRawObj) // => { pickLog, reminderLog, reminderSkipLog }
 * ```
 *
*/

export function hydrateOnboardingStats( staRawObj ) {


	const todMidObj = new Date(); // What: Today Midnight Object. Why: Every row's own real date is computed relative to this same instant, so all 3 logs line up on the same calendar. How: This is read as "now" and then floored to midnight on the next line.

	todMidObj.setHours( 0, 0, 0, 0 ); // What: Today Midnight Hours Reset. Why: Only the calendar day matters for the day-offset arithmetic below, not the current time of day. How: This zeroes out todMidObj's own hours/minutes/seconds/milliseconds in place.


	const dayAgoFun = ( dayAgoNum ) => { // What: Day Ago Function. Why: Every row below needs to turn its own precomputed daysAgo offset into a real date. How: This subtracts dayAgoNum days from todMidObj and returns a fresh Date for that day.


		const offDatObj = new Date( todMidObj ); // What: Offset Date Object. Why: todMidObj itself must not be mutated by the offset below. How: This constructs a fresh copy of todMidObj to offset in place instead.

		offDatObj.setDate( todMidObj.getDate() - dayAgoNum ); // What: Offset Date Day Subtraction. Why: This is the actual day-offset arithmetic the whole function exists to perform. How: This moves offDatObj back by dayAgoNum days from todMidObj's own date.



		return offDatObj; // What: Offset Date Return. Why: The caller needs the resolved real date back. How: This returns the same copy offset in place above.


	};


	let seqCouNum = 0; // What: Sequence Count Number And Guard. Why: Every hydrated row across all 3 logs needs its own unique id, and none of the source data carries one. How: This starts at 0 and is incremented once per row created below, shared across all 3 maps.


	const picLogArr = ( staRawObj.pickLog || [] ).map( ( picRowObj ) => { // What: Pick Log Array. Why: Every precomputed pick-log row must become a real, dated pickLog row matching state.pickLog's own shape. How: This maps staRawObj's own pickLog array (or an empty array if missing) through the per-row logic below.


		const rowDatObj = dayAgoFun( picRowObj.daysAgo ); // What: Row Date Object. Why: This row's own real calendar date is needed both for its own date field and, if done, to build its own completedAt timestamp below. How: This resolves picRowObj's own daysAgo offset via dayAgoFun.

		let comTimStr = null; // What: Completed Timestamp String And Guard. Why: An entry that was never actually completed has no completion time at all. How: This starts null and is only overwritten below when picRowObj is done and carries a recorded hour.


		if ( picRowObj.done && picRowObj.h != null ) { // What: Done With Hour Check. Why: A completion timestamp only makes sense for a row that was actually completed and carries a recorded hour. How: This gates the timestamp construction below on both conditions holding at once.


			const rowTspObj = new Date( rowDatObj ); // What: Row Timestamp Object. Why: rowDatObj itself must not be mutated by the time-of-day below. How: This constructs a fresh copy of rowDatObj to set a specific time on instead.

			rowTspObj.setHours( picRowObj.h, picRowObj.m, 0, 0 ); // What: Row Timestamp Hours Set. Why: The source data's own recorded hour/minute is what makes this timestamp realistic rather than always midnight. How: This writes picRowObj's own h/m onto rowTspObj, zeroing seconds/milliseconds.

			comTimStr = rowTspObj.toISOString(); // What: Completed Timestamp String Assignment. Why: state.pickLog's own completedAt field expects an ISO string, not a date. How: This converts the just-set rowTspObj to its own ISO string form.


		}



		return { // What: Pick Log Row Return. Why: This is one hydrated row, in the exact shape state.pickLog itself expects. How: This builds the row from rowDatObj/comTimStr above plus picRowObj's own denormalized fields, passed through unchanged.


			id          : 'pls_ob_' + ( seqCouNum++ ).toString( 36 ),
			eid         : null,
			date        : isoDayFun( rowDatObj ),
			pickerId    : picRowObj.pickerId,
			itemId      : picRowObj.itemId,
			itemName    : picRowObj.itemName,
			pickerName  : picRowObj.pickerName,
			group       : picRowObj.group,
			done        : picRowObj.done,
			completedAt : comTimStr,
			source      : picRowObj.source,
			...( picRowObj.outcome ? { outcome : picRowObj.outcome } : {} ),
			...( picRowObj.depletedEnd ? { depletedEnd : true } : {} )


		};


	} );

	const remLogArr = ( staRawObj.reminderLog || [] ).map( ( remRowObj ) => { // What: Reminder Log Array. Why: Every precomputed reminder-log row must become a real, dated reminderLog row matching state.reminderLog's own shape. How: This maps staRawObj's own reminderLog array (or an empty array if missing) through the per-row logic below.


		const rowTspObj = dayAgoFun( remRowObj.daysAgo ); // What: Row Timestamp Object. Why: This row's own real completion timestamp needs both a resolved calendar date and, below, a specific time of day. How: This resolves remRowObj's own daysAgo offset via dayAgoFun.

		rowTspObj.setHours( remRowObj.h, remRowObj.m, 0, 0 ); // What: Row Timestamp Hours Set. Why: The source data's own recorded hour/minute is what makes this timestamp realistic rather than always midnight. How: This writes remRowObj's own h/m onto rowTspObj, zeroing seconds/milliseconds.



		return { // What: Reminder Log Row Return. Why: This is one hydrated row, in the exact shape state.reminderLog itself expects. How: This builds the row from rowTspObj above plus remRowObj's own denormalized fields, passed through unchanged.


			rowId       : 'rl_ob_' + ( seqCouNum++ ).toString( 36 ),
			taskId      : remRowObj.taskId,
			name        : remRowObj.name,
			type        : remRowObj.type,
			completedAt : rowTspObj.toISOString()


		};


	} );

	const rslRowArr = ( staRawObj.reminderSkipLog || [] ).map( ( skpRowObj ) => { // What: Reminder-Skip-Log Row Array. Why: Every precomputed reminder-skip-log row must become a real, dated reminderSkipLog row matching state.reminderSkipLog's own shape. How: This maps staRawObj's own reminderSkipLog array (or an empty array if missing) through the per-row logic below.


		const rowTspObj = dayAgoFun( skpRowObj.daysAgo ); // What: Row Timestamp Object. Why: This row's own real skip timestamp needs both a resolved calendar date and, below, a specific time of day. How: This resolves skpRowObj's own daysAgo offset via dayAgoFun.

		rowTspObj.setHours( skpRowObj.h, skpRowObj.m, 0, 0 ); // What: Row Timestamp Hours Set. Why: The source data's own recorded hour/minute is what makes this timestamp realistic rather than always midnight. How: This writes skpRowObj's own h/m onto rowTspObj, zeroing seconds/milliseconds.



		return { // What: Reminder Skip Log Row Return. Why: This is one hydrated row, in the exact shape state.reminderSkipLog itself expects. How: This builds the row from rowTspObj above plus skpRowObj's own denormalized fields, passed through unchanged.


			rowId     : 'rs_ob_' + ( seqCouNum++ ).toString( 36 ),
			taskId    : skpRowObj.taskId,
			name      : skpRowObj.name,
			type      : skpRowObj.type,
			skippedAt : rowTspObj.toISOString()


		};


	} );



	return { pickLog : picLogArr, reminderLog : remLogArr, reminderSkipLog : rslRowArr }; // What: Hydrated Logs Return. Why: The caller (onboarding.jsx's own seeding effect) needs all 3 freshly-hydrated logs at once, in the same shape state itself expects. How: This returns picLogArr/remLogArr/rslRowArr above under their own state-contract key names.


}

// #endregion hydrateOnboardingStats



