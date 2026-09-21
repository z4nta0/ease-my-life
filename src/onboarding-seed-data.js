


/**
 * onboarding-seed-data.js = Onboarding Seed Data
 *
 * @summary
 * Sample-picker and sample-reminder data seeded on a fresh install, before
 * the Welcome Tour begins (see the seeding effect in
 * onboarding-welcome-tour.jsx). Kept in its own plain-JS module, no JSX
 * and no React import, so it can also be imported directly by
 * scripts/build-onboarding-stats.mjs: a Node script that precomputes about
 * a year of matching pick/reminder history offline.
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
 * ONB_EXA_OBJ = Onboarding Example Object
 *
 * @summary
 * The sample "Daily Chores" picker seeded alongside the Welcome Tour.
 * Doubles as prefill data for whenever a future create-a-picker mini-tour
 * reuses this same data.
 *
 * Every property below shares this exact shape, and none of them repeat
 * these same fields' own boilerplate comments on their own lines (see
 * the "Repeated-shape object literals" comment exception in CLAUDE.md):
 *
 * - `group` (String): Group assigns the picker to one of the app's
 *   built-in sample groups, so it sits alongside real pickers covering
 *   the same topic; read by the grouping/filtering UI exactly like any
 *   real picker's own group.
 *
 * - `id` (String): Id is this sample picker's own stable identifier,
 *   matching what scripts/build-onboarding-stats.mjs baked into
 *   onboarding-stats-data.js and what store.jsx/onboarding-welcome-tour.jsx
 *   use to recognize and later hide this sample; a literal, load-bearing
 *   string, never generated at runtime.
 *
 * - `items` (Array): Items is every picker's own pool of choosable
 *   items, read by the picker engine exactly like any real picker's own
 *   items array; see below for the shape its own entries share.
 *
 * - `mode` (String): Mode selects which of pickers.js's own selection
 *   algorithms (random/weighted/dynamic/ease-up/ease-down) this sample
 *   picker uses; read by the picker engine exactly like any real
 *   picker's own mode.
 *
 * - `name` (String): Name is the picker's own display name shown
 *   throughout the app; read wherever a picker's name needs displaying,
 *   exactly like any real, user-created picker.
 *
 * - `step` (Number): Step prefills a picker-creation wizard's own step,
 *   for whenever a future create-a-picker mini-tour needs it; not read
 *   by the picker engine itself.
 *
 * Every entry inside `items` above shares this exact shape too, and
 * none of them repeat these same fields' own boilerplate comments
 * either. Each is one sample item in this picker's own seed pool,
 * giving the Welcome Tour something realistic to pick from, read by the
 * picker engine (pickers.js) exactly like any real, user-created item:
 *
 * - `easeMax` (Number): Ease Max is this item's own fastest drift rate,
 *   the upper bound of the random amount its own value grows by each
 *   tick it goes unpicked.
 *
 * - `easeMin` (Number): Ease Min is this item's own slowest drift rate,
 *   the lower bound of that same random growth.
 *
 * - `id` (String): Id is this item's own stable identifier.
 *
 * - `name` (String): Name is this item's own display name.
 *
 * - `value` (Number): Value is this item's own current drift state,
 *   seeded already at 100 (the picker engine's own default threshold)
 *   so every item is immediately eligible for the Welcome Tour's first
 *   generated list, rather than starting from a cold, unrealistic 0.
 *
 * - `weight` (Number): Weight is this item's own fairness weight,
 *   deliberately unused by an ease-up picker's own selection math
 *   (ease-up is a cadence system, not a preference one, per pikIteFun's
 *   own comment in pickers.js), kept at a flat 1 throughout since it
 *   plays no real role here.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

export const ONB_EXA_OBJ = { // What: Onboarding Example Object. Why: This is the sample "Daily Chores" picker seeded alongside the Welcome Tour (see the comment above this declaration). How: This is spread into actStoObj.addPicker by onboarding-welcome-tour.jsx's own seeding effect, exactly like a real, user-created picker.


	group : 'Chores',
	id    : 'pkr_ob_daily',
	mode  : 'ease-up',
	name  : 'Daily Chores',
	step  : 1,

	items : [


		{ id : 'ob_it_laundry', name : 'Do the laundry',            weight : 1, easeMin : 7,       easeMax : 14,      value : 100 },
		{ id : 'ob_it_bath',    name : 'Clean the bathrooms',       weight : 1, easeMin : 12.5,    easeMax : 20,      value : 100 },
		{ id : 'ob_it_dust',    name : 'Dust the main living area', weight : 1, easeMin : 9.0909,  easeMax : 12.5,    value : 100 },
		{ id : 'ob_it_vacuum',  name : 'Vacuum the floors',         weight : 1, easeMin : 11.1111, easeMax : 16.6667, value : 100 },
		{ id : 'ob_it_shower',  name : 'Clean the shower',          weight : 1, easeMin : 5.5556,  easeMax : 8.3333,  value : 100 },
		{ id : 'ob_it_oven',    name : 'Clean the oven',            weight : 1, easeMin : 4.7619,  easeMax : 7.1429,  value : 100 }


	]


};



/**
 * ONB_ESP_ARR = Onboarding Extra-Sample-Pickers Array
 *
 * @summary
 * Extra sample pickers (Chores/Food/Self Care/Entertainment) meant to
 * make a generated day look like a fuller, more realistic todo list
 * instead of a single lonely item. Each one uses the create-a-picker
 * form's own defaults (daily cadence, every day of the week, holidays
 * not skipped, included in the daily generator) aside from what is
 * specified here. Seeded alongside ONB_EXA_OBJ.
 *
 * Every entry below shares this exact shape, and none of them repeat
 * these same fields' own boilerplate comments on their own lines (see
 * the "Repeated-shape object literals" comment exception in CLAUDE.md).
 * Each entry follows the create-a-picker form's own defaults except for
 * what is specified here, and is read by the picker engine exactly like
 * any real, user-created picker:
 *
 * - `group` (String): Group assigns the picker to one of the app's
 *   built-in sample groups, so it sits alongside real pickers covering
 *   the same topic; read by the grouping/filtering UI exactly like any
 *   real picker's own group.
 *
 * - `id` (String): Id is this sample picker's own stable identifier,
 *   matching what scripts/build-onboarding-stats.mjs baked into
 *   onboarding-stats-data.js and what store.jsx/onboarding-welcome-tour.jsx
 *   use to recognize and later hide this sample; a literal, load-bearing
 *   string, never generated at runtime.
 *
 * - `items` (Array): Items is every picker's own pool of choosable
 *   items, read by the picker engine exactly like any real picker's own
 *   items array; see below for the shape each of its own entries share.
 *
 * - `mode` (String): Mode selects which of pickers.js's own selection
 *   algorithms (random/weighted/dynamic/ease-up/ease-down) this sample
 *   picker uses; read by the picker engine exactly like any real
 *   picker's own mode.
 *
 * - `name` (String): Name is the picker's own display name shown
 *   throughout the app; read wherever a picker's name needs displaying,
 *   exactly like any real, user-created picker.
 *
 * Every entry inside each `items` array above shares this exact shape
 * too, and none of them repeat these same fields' own boilerplate
 * comments either. Each is one sample item in that picker's own seed
 * pool, giving the Welcome Tour something realistic to pick from, read
 * by the picker engine (pickers.js) exactly like any real, user-created
 * item:
 *
 * - `easeMax` (Number, optional): Ease Max is this item's own fastest
 *   drift rate, the upper bound of the random amount its own value
 *   grows by each tick it goes unpicked; present only on an ease-up/
 *   ease-down picker's own items (the Coffee Creamer picker below is
 *   dynamic mode and carries no ease band at all).
 *
 * - `easeMin` (Number, optional): Ease Min is this item's own slowest
 *   drift rate, the lower bound of that same random growth; present
 *   under the same condition as easeMax above.
 *
 * - `id` (String): Id is this item's own stable identifier.
 *
 * - `name` (String): Name is this item's own display name.
 *
 * - `value` (Number, optional): Value is this item's own current drift
 *   state, seeded already at 100 (the picker engine's own default
 *   threshold) on an ease-up/ease-down item so it is immediately
 *   eligible for the Welcome Tour's first generated list; omitted
 *   entirely on a dynamic-mode item, where it simply defaults to a
 *   fresh, unbiased 0 the moment addPicker creates it.
 *
 * - `weight` (Number): Weight is this item's own fairness weight; on
 *   the dynamic-mode Coffee Creamer picker it genuinely drives the
 *   weighted-plus-drift draw (see pikIteFun's own 'dynamic' branch in
 *   pickers.js), but on every ease-up/ease-down picker here it is
 *   deliberately unused by the selection math (ease-up/ease-down is a
 *   cadence system, not a preference one) and just kept at a flat 1.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

export const ONB_ESP_ARR = [ // What: Onboarding Extra-Sample-Pickers Array. Why: This is the extra sample-picker pool described above, seeded alongside ONB_EXA_OBJ. How: This is spread into actStoObj.addPicker by onboarding-welcome-tour.jsx's own seeding effect, exactly like a real, user-created picker.


	{ // What: Monthly Chores Entry. Why: This is a second, less-frequent Chores-group picker alongside ONB_EXA_OBJ's own "Daily Chores," rounding out a generated day with deeper, longer-cycle cleaning tasks. How: This is read by the picker engine exactly like any real picker, its own 5 items (oven, whole-house dust, fridge, under-furniture vacuum, mop) themed around chores done far less often than the Daily Chores picker's own pool.


		group : 'Chores',
		id    : 'pkr_ob_monthly',
		mode  : 'ease-up',
		name  : 'Monthly Chores',

		items : [


			{ id : 'it_ob_oven2',   name : 'Deep clean the oven',        weight : 1, easeMin : 2.5,    easeMax : 4.1667, value : 100 },
			{ id : 'it_ob_dust2',   name : 'Dust the entire house',      weight : 1, easeMin : 3.7037, easeMax : 5.5556, value : 100 },
			{ id : 'it_ob_fridge',  name : 'Clean out the fridge',       weight : 1, easeMin : 2.2222, easeMax : 3.0303, value : 100 },
			{ id : 'it_ob_vacuum2', name : 'Vacuum under the furniture', weight : 1, easeMin : 1.6667, easeMax : 2.5,    value : 100 },
			{ id : 'it_ob_mop',     name : 'Mop the floors',             weight : 1, easeMin : 4.3478, easeMax : 6.6667, value : 100 }


		]


	},

	{ // What: Coffee Creamer Entry. Why: This is the only dynamic-mode sample picker seeded, so a fresh install's own first generated list exercises the weighted-plus-drift selection algorithm too, not just ease-up/ease-down. How: This is read by the picker engine's own 'dynamic' branch, weighing each of its 7 flavor items by both a starting weight and an accumulating drift value.


		group : 'Food',
		id    : 'pkr_ob_coffee',
		mode  : 'dynamic',
		name  : 'Coffee Creamer',

		items : [


			{ id : 'it_ob_vanilla',    name : 'French Vanilla', weight : 1 },
			{ id : 'it_ob_caramel',    name : 'Caramel',        weight : 3 },
			{ id : 'it_ob_sweetcream', name : 'Sweet Cream',    weight : 2 },
			{ id : 'it_ob_cinnamon',   name : 'Cinnamon',       weight : 1 },
			{ id : 'it_ob_pumpkin',    name : 'Pumpkin Spice',  weight : 2 },
			{ id : 'it_ob_hazelnut',   name : 'Hazelnut',       weight : 1 },
			{ id : 'it_ob_mocha',      name : 'Mocha',          weight : 3 }


		]


	},

	{ // What: Dinner Entry. Why: This is the Food group's own second sample picker, giving a generated day a real dinner choice alongside Coffee Creamer's own coffee flavoring. How: This is read by the picker engine exactly like any real picker, its own 8 items spanning a variety of dinner options.


		group : 'Food',
		id    : 'pkr_ob_dinner',
		mode  : 'ease-up',
		name  : 'Dinner',

		items : [


			{ id : 'it_ob_spaghetti',    name : 'Spaghetti and meatballs', weight : 1, easeMin : 8.3333,  easeMax : 14.2857, value : 100 },
			{ id : 'it_ob_meatloaf',     name : 'Meatloaf',                weight : 1, easeMin : 7.1429,  easeMax : 10,      value : 100 },
			{ id : 'it_ob_tacos',        name : 'Tacos',                   weight : 1, easeMin : 10,      easeMax : 16.6667, value : 100 },
			{ id : 'it_ob_pizza',        name : 'Pizza',                   weight : 1, easeMin : 12.5,    easeMax : 20,      value : 100 },
			{ id : 'it_ob_steak',        name : 'Steak and potatoes',      weight : 1, easeMin : 7.6923,  easeMax : 11.1111, value : 100 },
			{ id : 'it_ob_burger',       name : 'Burger and fries',        weight : 1, easeMin : 9.0909,  easeMax : 12.5,    value : 100 },
			{ id : 'it_ob_lemonchicken', name : 'Lemon Chicken',           weight : 1, easeMin : 7.1429,  easeMax : 14.2857, value : 100 },
			{ id : 'it_ob_friedchicken', name : 'Fried chicken',           weight : 1, easeMin : 11.1111, easeMax : 16.6667, value : 100 }


		]


	},

	{ // What: Workouts Entry. Why: This is the Self Care group's own sample picker, rotating which major muscle group gets focus from one generated day to the next. How: This is read by the picker engine exactly like any real picker, its own 5 items each covering one major muscle group.


		group : 'Self Care',
		id    : 'pkr_ob_workouts',
		mode  : 'ease-up',
		name  : 'Workouts',

		items : [


			{ id : 'it_ob_chest',     name : 'Chest',     weight : 1, easeMin : 14.2857, easeMax : 20,      value : 100 },
			{ id : 'it_ob_legs',      name : 'Legs',      weight : 1, easeMin : 12.5,    easeMax : 16.6667, value : 100 },
			{ id : 'it_ob_shoulders', name : 'Shoulders', weight : 1, easeMin : 11.1111, easeMax : 14.2857, value : 100 },
			{ id : 'it_ob_arms',      name : 'Arms',      weight : 1, easeMin : 12.5,    easeMax : 25,      value : 100 },
			{ id : 'it_ob_core',      name : 'Core',      weight : 1, easeMin : 12.5,    easeMax : 20,      value : 100 }


		]


	},

	{ // What: Relax Entry. Why: This is the only ease-down sample picker seeded, so a fresh install's own first generated list exercises the depleting-charge selection algorithm too, not just ease-up/dynamic. How: This is read by the picker engine's own 'ease-down' branch, its own 4 items decaying from a full charge instead of building toward one.


		group : 'Entertainment',
		id    : 'pkr_ob_relax',
		mode  : 'ease-down',
		name  : 'Relax',

		items : [


			{ id : 'it_ob_readbook',   name : 'Read a book',        weight : 1, easeMin : 14.2857, easeMax : 20,      value : 100 },
			{ id : 'it_ob_bingewatch', name : 'Binge watch a show', weight : 1, easeMin : 20,      easeMax : 50,      value : 100 },
			{ id : 'it_ob_watchmovie', name : 'Watch a movie',      weight : 1, easeMin : 16.6667, easeMax : 33.3333, value : 100 },
			{ id : 'it_ob_youtube',    name : 'Browse YouTube',     weight : 1, easeMin : 25,      easeMax : 50,      value : 100 }


		]


	}


];



/**
 * ONB_TAS_ARR = Onboarding Task Array
 *
 * @summary
 * The two sample reminders seeded alongside the pickers above. "Pick up
 * prescription" is a one-time reminder; it stays pending, since no
 * history makes sense for something not yet completed. "Take trash out
 * for pickup" is weekly on Mondays and gets about a year of completion
 * history; see src/onboarding-stats-data.js.
 *
 * Every entry below shares this exact shape, and neither repeats these
 * same fields' own boilerplate comments on its own line (see the
 * "Repeated-shape object literals" comment exception in CLAUDE.md):
 *
 * - `daysOfWeek` (Array, optional): Days Of Week is the weekly
 *   reminder's own fixed [1] (Monday) placeholder here;
 *   onboarding-welcome-tour.jsx overwrites it at seed
 *   time with whatever real weekday the tour is taken on, so the seeded
 *   task always reads as due today instead of drifting stale. Absent on
 *   the one-time reminder, which has no weekly schedule at all.
 *
 * - `id` (String): Id is this sample task's own stable identifier,
 *   matching what scripts/build-onboarding-stats.mjs baked into
 *   onboarding-stats-data.js and what store.jsx/onboarding-welcome-tour.jsx
 *   use to recognize and later hide this sample; a literal, load-bearing
 *   string, never generated at runtime.
 *
 * - `name` (String): Name is the task's own display name shown
 *   throughout the app; read wherever a task's name needs displaying,
 *   exactly like any real, user-created task.
 *
 * - `repeat` (String): Repeat is one of tasks.js's own 5 recurrence
 *   kinds, selecting whether/how often this sample task recurs; read by
 *   the reminders engine exactly like any real task's own repeat.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

export const ONB_TAS_ARR = [ // What: Onboarding Task Array. Why: This is the sample-reminder pool described above, seeded alongside the pickers. How: This is spread into actStoObj.addTask by onboarding-welcome-tour.jsx's own seeding effect, exactly like a real, user-created task.


	{ id : 'tk_ob_meds',  name : 'Pick up prescription',      repeat : 'once'                       }, // What: One-Time Reminder Entry. Why: This is the one-time sample reminder's own entry (see the comment above this array for why it stays pending). How: This is read by the reminders engine (tasks.js) exactly like any real, user-created task.
	{ id : 'tk_ob_trash', name : 'Take trash out for pickup', repeat : 'weekly', daysOfWeek : [ 1 ] }  // What: Weekly Reminder Entry. Why: This is the recurring sample reminder's own entry (see the comment above this array for its own completion-history treatment). How: This is read by the reminders engine (tasks.js) exactly like any real, user-created task, its own daysOfWeek overwritten at seed time by onboarding-welcome-tour.jsx to match today's real weekday.


];



/**
 * ONB_SPI_ARR = Onboarding Sample-Picker-Identifiers Array
 * ONB_STI_ARR = Onboarding Sample-Task-Identifiers Array
 *
 * @summary
 * Every sample picker/task id in one place, used to hide them once the
 * Welcome Tour ends (see onboarding-welcome-tour.jsx) and to recognize a
 * still-hidden one as a mini-tour launcher card on Today (see
 * tab-today.jsx / reminders.jsx).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

export const ONB_SPI_ARR = [ ONB_EXA_OBJ, ...ONB_ESP_ARR ].map( ( curPicObj ) => curPicObj.id ); // What: Onboarding Sample-Picker-Identifiers Array. Why: This is every seeded sample picker's own id, flattened into one array (see the comment above this declaration). How: This maps ONB_EXA_OBJ plus every ONB_ESP_ARR entry down to just its own id field.
export const ONB_STI_ARR = ONB_TAS_ARR.map( ( curTasObj ) => curTasObj.id );                     // What: Onboarding Sample-Task-Identifiers Array. Why: This is every seeded sample task's own id, flattened into one array (see the comment above ONB_SPI_ARR above). How: This maps every ONB_TAS_ARR entry down to just its own id field.



/**
 * ONB_RCT_OBJ = Onboarding Reminder-Card-Text Object
 *
 * @summary
 * Override copy for each sample reminder's mini-tour launcher card. A
 * card's name always reads as an instruction (e.g. "Set up a ...
 * reminder") rather than the sample's own real name. Sample pickers
 * don't need an equivalent table at all: their own card kicker is just
 * the picker's own name, and the card name is always "Set up a {picker
 * name} picker".
 *
 * Every entry below shares this exact shape, and neither repeats these
 * same fields' own boilerplate comments on its own line (see the
 * "Repeated-shape object literals" comment exception in CLAUDE.md):
 *
 * - `kicker` (String, optional): Kicker is an explicit override only
 *   where the real schedule summary (TASKS.summary(task)) isn't what
 *   should be shown, e.g. the one-time reminder wants "One-Time"
 *   instead of TASKS.summary's own "One-time". Absent on the recurring
 *   reminder on purpose, since its daysOfWeek is set dynamically at
 *   seed time (see onboarding-welcome-tour.jsx) to whatever day the
 *   tour is taken on, so TASKS.summary already produces the right
 *   "Every {Day}" text for it on its own.
 *
 * - `name` (String): Name is the launcher card's own display name,
 *   always phrased as an instruction (e.g. "Set up a ... reminder")
 *   rather than the sample's own real task name.
 *
 * - `time` (String): Time is a real, user-confirmed estimate, manually
 *   timed 2026-08-14, shown on the card.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

export const ONB_RCT_OBJ = { // What: Onboarding Reminder-Card-Text Object. Why: This is the mini-tour launcher card copy override table described above, keyed by sample task id. How: This is read by reminders.jsx wherever a still-hidden sample task's own launcher card is rendered.


	tk_ob_meds  : { name : 'Set up a one time reminder',  time : '< 1 min', kicker : 'One-Time' }, // What: One-Time Reminder Entry. Why: This is the one-time sample reminder's own launcher-card copy. How: This is looked up by reminders.jsx keyed by tk_ob_meds, this sample task's own id.
	tk_ob_trash : { name : 'Set up a recurring reminder', time : '1 min'                        }  // What: Weekly Reminder Entry. Why: This is the recurring sample reminder's own launcher-card copy. How: This is looked up by reminders.jsx keyed by tk_ob_trash, this sample task's own id.


};



/**
 * ONB_PCT_OBJ = Onboarding Picker-Card-Time Object
 *
 * @summary
 * Same idea as ONB_RCT_OBJ's own time field above, but pickers
 * have no equivalent card-text override table to hang it off of, since
 * their own kicker/name are derived directly from the picker rather
 * than overridden. A standalone map keyed by sample picker id instead.
 * Real, user-confirmed estimates, manually timed 2026-08-14.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

export const ONB_PCT_OBJ = { // What: Onboarding Picker-Card-Time Object. Why: This is the manually-timed card estimate table described above, keyed by sample picker id. How: This is read by whatever component renders a still-hidden sample picker's own mini-tour launcher card.


	pkr_ob_coffee   : '2.5 min', // What: Picker Onboarding Coffee Time String. Why: This is one sample picker's own manually-timed card estimate (see the comment above this object for methodology). How: This is read by that picker's own mini-tour launcher card, keyed by this property's own name matching the picker's own id.
	pkr_ob_daily    : '2.5 min', // What: Picker Onboarding Daily Time String. Why: This is one sample picker's own manually-timed card estimate (see the comment above this object for methodology). How: This is read by that picker's own mini-tour launcher card, keyed by this property's own name matching the picker's own id.
	pkr_ob_dinner   : '2.5 min', // What: Picker Onboarding Dinner Time String. Why: This is one sample picker's own manually-timed card estimate (see the comment above this object for methodology). How: This is read by that picker's own mini-tour launcher card, keyed by this property's own name matching the picker's own id.
	pkr_ob_monthly  : '2.5 min', // What: Picker Onboarding Monthly Time String. Why: This is one sample picker's own manually-timed card estimate (see the comment above this object for methodology). How: This is read by that picker's own mini-tour launcher card, keyed by this property's own name matching the picker's own id.
	pkr_ob_relax    : '2.5 min', // What: Picker Onboarding Relax Time String. Why: This is one sample picker's own manually-timed card estimate (see the comment above this object for methodology). How: This is read by that picker's own mini-tour launcher card, keyed by this property's own name matching the picker's own id.
	pkr_ob_workouts : '2.5 min'  // What: Picker Onboarding Workouts Time String. Why: This is one sample picker's own manually-timed card estimate (see the comment above this object for methodology). How: This is read by that picker's own mini-tour launcher card, keyed by this property's own name matching the picker's own id.


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



// #region hydStaFun

/**
 * hydStaFun = Hydrate Stats Function
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
 * hydStaFun(staRawObj) // => { pickLog, reminderLog, reminderSkipLog }
 * ```
 *
*/

export function hydStaFun( staRawObj ) {


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


			const rowTimObj = new Date( rowDatObj ); // What: Row Timestamp Object. Why: rowDatObj itself must not be mutated by the time-of-day below. How: This constructs a fresh copy of rowDatObj to set a specific time on instead.

			rowTimObj.setHours( picRowObj.h, picRowObj.m, 0, 0 ); // What: Row Timestamp Hours Set. Why: The source data's own recorded hour/minute is what makes this timestamp realistic rather than always midnight. How: This writes picRowObj's own h/m onto rowTimObj, zeroing seconds/milliseconds.

			comTimStr = rowTimObj.toISOString(); // What: Completed Timestamp String Assignment. Why: state.pickLog's own completedAt field expects an ISO string, not a date. How: This converts the just-set rowTimObj to its own ISO string form.


		}



		return { // What: Pick Log Row Return. Why: This is one hydrated row, in the exact shape state.pickLog itself expects. How: This builds the row from rowDatObj/comTimStr above plus picRowObj's own denormalized fields, passed through unchanged.


			completedAt : comTimStr,                                  // What: Completed At. Why: state.pickLog's own completedAt field expects an ISO string when the row was actually completed, else null. How: This is comTimStr, resolved above.
			date        : isoDayFun( rowDatObj ),                     // What: Date. Why: Every pickLog row needs its own real calendar day. How: This converts rowDatObj to an ISO day string via isoDayFun.
			done        : picRowObj.done,                             // What: Done. Why: The row must record whether this pick was ever actually completed. How: This is copied straight from picRowObj's own done.
			eid         : null,                                       // What: Eid. Why: A real pickLog row always carries an entry id linking it back to a live Today entry, but a precomputed sample row has none. How: This is always null, since no real Today entry ever backed this hydrated row.
			group       : picRowObj.group,                            // What: Group. Why: This denormalized copy lets the row survive a later rename or deletion of the picker's own group. How: This is copied straight from picRowObj's own group.
			id          : 'pls_ob_' + ( seqCouNum++ ).toString( 36 ), // What: Id. Why: Every pickLog row needs its own unique identifier. How: This mints one from the shared seqCouNum counter, prefixed and base-36 encoded.
			itemId      : picRowObj.itemId,                           // What: Item Id. Why: Stats and other consumers filter/group pickLog rows by the item they belong to. How: This is copied straight from picRowObj's own itemId.
			itemName    : picRowObj.itemName,                         // What: Item Name. Why: This denormalized copy lets the row survive a later rename or deletion of the item itself. How: This is copied straight from picRowObj's own itemName.
			pickerId    : picRowObj.pickerId,                         // What: Picker Id. Why: Stats and other consumers filter/group pickLog rows by the picker they belong to. How: This is copied straight from picRowObj's own pickerId.
			pickerName  : picRowObj.pickerName,                       // What: Picker Name. Why: This denormalized copy lets the row survive a later rename or deletion of the picker itself. How: This is copied straight from picRowObj's own pickerName.
			source      : picRowObj.source,                           // What: Source. Why: Stats distinguishes how a pick actually happened (generated, manual, re-roll, ...). How: This is copied straight from picRowObj's own source.

			...( picRowObj.outcome ? { outcome : picRowObj.outcome } : {} ), // What: Outcome Spread. Why: Only a row with a real, non-default outcome (e.g. a rejected pick) needs this field at all. How: This spreads in outcome only when picRowObj's own outcome is truthy.
			...( picRowObj.depletedEnd ? { depletedEnd : true } : {} )       // What: Depleted End Spread. Why: Only the row ending an Ease Down depletion streak needs this flag at all. How: This spreads in depletedEnd:true only when picRowObj's own depletedEnd is truthy.


		};


	} );



	const remLogArr = ( staRawObj.reminderLog || [] ).map( ( remRowObj ) => { // What: Reminder Log Array. Why: Every precomputed reminder-log row must become a real, dated reminderLog row matching state.reminderLog's own shape. How: This maps staRawObj's own reminderLog array (or an empty array if missing) through the per-row logic below.


		const rowTimObj = dayAgoFun( remRowObj.daysAgo ); // What: Row Timestamp Object. Why: This row's own real completion timestamp needs both a resolved calendar date and, below, a specific time of day. How: This resolves remRowObj's own daysAgo offset via dayAgoFun.

		rowTimObj.setHours( remRowObj.h, remRowObj.m, 0, 0 ); // What: Row Timestamp Hours Set. Why: The source data's own recorded hour/minute is what makes this timestamp realistic rather than always midnight. How: This writes remRowObj's own h/m onto rowTimObj, zeroing seconds/milliseconds.



		return { // What: Reminder Log Row Return. Why: This is one hydrated row, in the exact shape state.reminderLog itself expects. How: This builds the row from rowTimObj above plus remRowObj's own denormalized fields, passed through unchanged.


			completedAt : rowTimObj.toISOString(),                   // What: Completed At. Why: state.reminderLog's own completedAt field expects a real ISO string. How: This is rowTimObj's own ISO string, resolved above.
			name        : remRowObj.name,                            // What: Name. Why: This denormalized copy lets the row survive a later rename or deletion of the task itself. How: This is copied straight from remRowObj's own name.
			rowId       : 'rl_ob_' + ( seqCouNum++ ).toString( 36 ), // What: Row Id. Why: Every reminderLog row needs its own unique identifier. How: This mints one from the shared seqCouNum counter, prefixed and base-36 encoded.
			taskId      : remRowObj.taskId,                          // What: Task Id. Why: Stats and other consumers filter/group reminderLog rows by the task they belong to. How: This is copied straight from remRowObj's own taskId.
			type        : remRowObj.type                             // What: Type. Why: Stats distinguishes a one-time completion from a recurring one. How: This is copied straight from remRowObj's own type.


		};


	} );



	const rslRowArr = ( staRawObj.reminderSkipLog || [] ).map( ( skpRowObj ) => { // What: Reminder-Skip-Log Row Array. Why: Every precomputed reminder-skip-log row must become a real, dated reminderSkipLog row matching state.reminderSkipLog's own shape. How: This maps staRawObj's own reminderSkipLog array (or an empty array if missing) through the per-row logic below.


		const rowTimObj = dayAgoFun( skpRowObj.daysAgo ); // What: Row Timestamp Object. Why: This row's own real skip timestamp needs both a resolved calendar date and, below, a specific time of day. How: This resolves skpRowObj's own daysAgo offset via dayAgoFun.

		rowTimObj.setHours( skpRowObj.h, skpRowObj.m, 0, 0 ); // What: Row Timestamp Hours Set. Why: The source data's own recorded hour/minute is what makes this timestamp realistic rather than always midnight. How: This writes skpRowObj's own h/m onto rowTimObj, zeroing seconds/milliseconds.



		return { // What: Reminder Skip Log Row Return. Why: This is one hydrated row, in the exact shape state.reminderSkipLog itself expects. How: This builds the row from rowTimObj above plus skpRowObj's own denormalized fields, passed through unchanged.


			name      : skpRowObj.name,                            // What: Name. Why: This denormalized copy lets the row survive a later rename or deletion of the task itself. How: This is copied straight from skpRowObj's own name.
			rowId     : 'rs_ob_' + ( seqCouNum++ ).toString( 36 ), // What: Row Id. Why: Every reminderSkipLog row needs its own unique identifier. How: This mints one from the shared seqCouNum counter, prefixed and base-36 encoded.
			skippedAt : rowTimObj.toISOString(),                   // What: Skipped At. Why: state.reminderSkipLog's own skippedAt field expects a real ISO string. How: This is rowTimObj's own ISO string, resolved above.
			taskId    : skpRowObj.taskId,                          // What: Task Id. Why: Stats and other consumers filter/group reminderSkipLog rows by the task they belong to. How: This is copied straight from skpRowObj's own taskId.
			type      : skpRowObj.type                             // What: Type. Why: Stats distinguishes a one-time skip from a recurring one. How: This is copied straight from skpRowObj's own type.


		};


	} );



	return { pickLog : picLogArr, reminderLog : remLogArr, reminderSkipLog : rslRowArr }; // What: Hydrated Logs Return. Why: The caller (onboarding-welcome-tour.jsx's own seeding effect) needs all 3 freshly-hydrated logs at once, in the same shape state itself expects. How: This returns picLogArr/remLogArr/rslRowArr above under their own state-contract key names.


}

// #endregion hydStaFun


