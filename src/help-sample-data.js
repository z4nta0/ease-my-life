


// #region Imports

import { hydStaFun   } from './onboarding-seed-data.js'; // What: Hydrate Stats Function. Why: This converts the precomputed onboarding stats into real dated pickLog/reminderLog/reminderSkipLog rows. How: This is called by unhHisFun the first time help mode needs a genuine year of history to show.
import { ONB_EXA_OBJ } from './onboarding-seed-data.js'; // What: Onboarding Example Object. Why: This is the real onboarding sample picker, borrowed here so help mode's own copy of it looks identical. How: This is read alongside ONB_ESP_ARR by sedPicFun/clePicFun below.
import { ONB_ESP_ARR } from './onboarding-seed-data.js'; // What: Onboarding Extra-Sample-Pickers Array. Why: These are the real onboarding sample pickers, borrowed here so help mode's own copies of them look identical. How: This is read alongside ONB_EXA_OBJ by sedPicFun/clePicFun below.
import { ONB_SPI_ARR } from './onboarding-seed-data.js'; // What: Onboarding Sample-Picker-Ids Array. Why: Help mode's Stats page borrows the real onboarding sample pickers directly rather than seeding its own copies. How: This is read by unhHisFun/hidHisFun to (un)hide each one by id.

// #endregion Imports



/**
 * help-sample-data.js = Help Sample Data
 *
 * @summary
 * Disposable sample data for the on-demand help mode (see help-mode.jsx),
 * seeded when a page's help toggle turns on so there's always something
 * concrete to point at (a real picker of each mode, a conditional-gated
 * picker, reminders covering every recurrence type, a year of pick history
 * for Stats), and torn back down the moment it turns off. Same "real,
 * interactive, but disposable" idea as onboarding-page-tours.jsx's own
 * PAGE_TOUR_SAMPLE_PICKERS, kept as an entirely separate hlp_-prefixed id
 * namespace (rather than reusing that file's own pt_ copies) so the two
 * features can never collide even if both happened to be active at once.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



const helIdeFun = ( rawIdeStr ) => `hlp_${ rawIdeStr }`; // What: Help Identifier Function. Why: Every help-mode copy needs its own id, kept in a namespace that can never collide with a real onboarding or user picker. How: This prefixes the given rawIdeStr with the literal 'hlp_' string.



/**
 * EXT_PIC_ARR = Extra Picker Array
 *
 * @summary
 * The real onboarding samples only cover ease-up, ease-down, and dynamic:
 * these two round out all 5 picker modes (see seed.js's own
 * SED_NAM_OBJ.MOD_DEF_OBJ) with a 'random' and a 'weighted' example.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const EXT_PIC_ARR = [ // What: Extra Picker Array. Why: This is the extra sample-picker pool described above, seeded/removed alongside every other help-only picker. How: This is read by sedPicFun to add each entry (guarded by existing id) and by clePicFun to remove each by id.


	{ // What: Extra Picker Object. Why: This is one of the extra picker-mode examples described in the comment above this array, rounding out all 5 picker modes. How: This is read by the picker engine exactly like any real, user-created picker.


		group : 'Entertainment',      // What: Group String. Why: This assigns the picker to one of the app's built-in sample groups, so it sits alongside real pickers covering the same topic. How: This is read by the grouping/filtering UI exactly like any real picker's own group.
		id    : 'hlp_pkr_icebreaker', // What: Id String. Why: This is this sample picker's own stable identifier, already living in help mode's own hlp_-prefixed namespace. How: This is a literal, load-bearing string, never generated at runtime.

		items : [ // What: Items Array. Why: Every picker needs at least one item for the picker engine to actually choose between. How: This is read by the picker engine exactly like any real picker's own items array.


			{ name : 'Would you rather...?',      weight : 1 }, // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving help mode something real to point at. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, weighted via its own weight field.
			{ name : 'Two truths and a lie',      weight : 1 }, // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving help mode something real to point at. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, weighted via its own weight field.
			{ name : 'Favorite childhood memory', weight : 1 }, // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving help mode something real to point at. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, weighted via its own weight field.
			{ name : 'Dream vacation spot',       weight : 1 }  // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving help mode something real to point at. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, weighted via its own weight field.


		],

		mode : 'random',               // What: Mode String. Why: This selects which of pickers.js's own selection algorithms (random/weighted/dynamic/ease-up/ease-down) this sample picker uses. How: This is read by the picker engine exactly like any real picker's own mode.
		name : 'Ice Breaker Questions' // What: Name String. Why: This is the picker's own display name shown throughout the app. How: This is read wherever a picker's name needs displaying, exactly like any real, user-created picker.


	},

	{ // What: Extra Picker Object. Why: This is one of the extra picker-mode examples described in the comment above this array, rounding out all 5 picker modes. How: This is read by the picker engine exactly like any real, user-created picker.


		group : 'Entertainment',      // What: Group String. Why: This assigns the picker to one of the app's built-in sample groups, so it sits alongside real pickers covering the same topic. How: This is read by the grouping/filtering UI exactly like any real picker's own group.
		id    : 'hlp_pkr_movienight', // What: Id String. Why: This is this sample picker's own stable identifier, already living in help mode's own hlp_-prefixed namespace. How: This is a literal, load-bearing string, never generated at runtime.

		items : [ // What: Items Array. Why: Every picker needs at least one item for the picker engine to actually choose between. How: This is read by the picker engine exactly like any real picker's own items array.


			{ name : 'Action',      weight : 3 }, // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving help mode something real to point at. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, weighted via its own weight field.
			{ name : 'Comedy',      weight : 3 }, // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving help mode something real to point at. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, weighted via its own weight field.
			{ name : 'Horror',      weight : 1 }, // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving help mode something real to point at. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, weighted via its own weight field.
			{ name : 'Documentary', weight : 1 }, // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving help mode something real to point at. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, weighted via its own weight field.
			{ name : 'Sci-Fi',      weight : 2 }  // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving help mode something real to point at. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, weighted via its own weight field.


		],

		mode : 'weighted',        // What: Mode String. Why: This selects which of pickers.js's own selection algorithms (random/weighted/dynamic/ease-up/ease-down) this sample picker uses. How: This is read by the picker engine exactly like any real picker's own mode.
		name : 'Movie Night Pick' // What: Name String. Why: This is the picker's own display name shown throughout the app. How: This is read wherever a picker's name needs displaying, exactly like any real, user-created picker.


	}


];



/**
 * CON_GAT_STR = Conditional Gate String
 *
 * @summary
 * One conditional (a day-off gate, see conditionals.js's own header
 * comment for the model) plus the one picker that depends on it, so help
 * mode has a real example of the "this picker can be gated off for the
 * day" feature to point at. CON_GAT_OBJ and PIC_GAT_OBJ right below this
 * declaration are both part of this same example.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const CON_GAT_STR = 'cnd_hlp_restday'; // What: Conditional Gate String. Why: PIC_GAT_OBJ below needs a stable id to point its own conditionalId at. How: This is a literal, load-bearing string, never generated at runtime.

const CON_GAT_OBJ = { // What: Conditional Gate Object. Why: This is the day-off gate example described above, holding an existing item of value; PIC_GAT_OBJ depends on it via conditionalId. How: This is added by sedPicFun/removed by clePicFun exactly like any real, user-created conditional.


	cardText : 'Take a rest day, no yard work today!', // What: Card Text String. Why: This is the message shown on Today whenever this conditional actually gates PIC_GAT_OBJ off for the day. How: This is read wherever a gated-off picker's own card text needs displaying.
	id       : CON_GAT_STR,                            // What: Id String. Why: This must match the id PIC_GAT_OBJ's own conditionalId points at. How: This is CON_GAT_STR, the identifier string declared just above.
	mode     : 'ease-up',                              // What: Mode String. Why: This selects which of conditionals.js's own gating modes (probability/ease-up/ease-down/dynamic) this sample conditional uses. How: This is read by the conditional engine exactly like any real conditional's own mode.
	name     : 'Rest Day'                              // What: Name String. Why: This is the conditional's own display name shown throughout the app. How: This is read wherever a conditional's name needs displaying, exactly like any real, user-created conditional.


};

const PIC_GAT_OBJ = { // What: Picker Gate Object. Why: This is the picker that depends on CON_GAT_OBJ in the day-off gate example described above. How: This is added by sedPicFun/removed by clePicFun exactly like any real, user-created picker.


	conditionalId : CON_GAT_STR,        // What: Conditional Identifier String. Why: This is what actually gates this picker off on the conditional's own down days. How: This is CON_GAT_STR, matching CON_GAT_OBJ's own id.
	group         : 'Chores',           // What: Group String. Why: This assigns the picker to one of the app's built-in sample groups, so it sits alongside real pickers covering the same topic. How: This is read by the grouping/filtering UI exactly like any real picker's own group.
	id            : 'hlp_pkr_yardwork', // What: Id String. Why: This is this sample picker's own stable identifier, already living in help mode's own hlp_-prefixed namespace. How: This is a literal, load-bearing string, never generated at runtime.

	items : [ // What: Items Array. Why: Every picker needs at least one item for the picker engine to actually choose between. How: This is read by the picker engine exactly like any real picker's own items array.


		{ name : 'Mow the lawn',    weight : 1, easeMin : 7,  easeMax : 10, value : 100 }, // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving help mode something real to point at. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, eased via its own easeMin/easeMax/value fields.
		{ name : 'Trim the hedges', weight : 1, easeMin : 10, easeMax : 14, value : 100 }, // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving help mode something real to point at. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, eased via its own easeMin/easeMax/value fields.
		{ name : 'Rake the leaves', weight : 1, easeMin : 5,  easeMax : 8,  value : 100 }  // What: Sample Item Object. Why: This is one sample item in this picker's own seed pool, giving help mode something real to point at. How: This is read by the picker engine (pickers.js) exactly like any real, user-created item, eased via its own easeMin/easeMax/value fields.


	],

	mode : 'ease-up',  // What: Mode String. Why: This selects which of pickers.js's own selection algorithms (random/weighted/dynamic/ease-up/ease-down) this sample picker uses. How: This is read by the picker engine exactly like any real picker's own mode.
	name : 'Yard Work' // What: Name String. Why: This is the picker's own display name shown throughout the app. How: This is read wherever a picker's name needs displaying, exactly like any real, user-created picker.


};



/**
 * TAS_SAM_ARR = Task Sample Array
 *
 * @summary
 * One reminder per recurrence kind (see tasks.js's own header comment
 * for the 5 repeat kinds); the real onboarding samples only cover once
 * and weekly. Data's reminder list shows every reminder regardless of
 * whether it's due today, so these don't need engineered due-dates.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const TAS_SAM_ARR = [ // What: Task Sample Array. Why: This is the sample-reminder pool described above, seeded/removed by sedTasFun/cleTasFun. How: This is iterated by sedTasFun to add each entry (guarded by existing id) and by cleTasFun to remove each by id.


	{ id : 'hlp_tk_once',     name : 'Renew car registration', repeat : 'once'                            }, // What: Sample Task Object. Why: This is one reminder covering one of tasks.js's own 5 repeat kinds (see the comment above this array for which is which). How: This is read by the reminders engine (tasks.js) exactly like any real, user-created task.
	{ id : 'hlp_tk_weekly',   name : 'Water the plants',       repeat : 'weekly',   daysOfWeek : [ 1, 4 ] }, // What: Sample Task Object. Why: This is one reminder covering one of tasks.js's own 5 repeat kinds (see the comment above this array for which is which). How: This is read by the reminders engine (tasks.js) exactly like any real, user-created task.
	{ id : 'hlp_tk_interval', name : 'Change the air filter',  repeat : 'interval', interval : 30         }, // What: Sample Task Object. Why: This is one reminder covering one of tasks.js's own 5 repeat kinds (see the comment above this array for which is which). How: This is read by the reminders engine (tasks.js) exactly like any real, user-created task.
	{ id : 'hlp_tk_monthly',  name : 'Pay rent',               repeat : 'monthly',  dayOfMonth : 1        }, // What: Sample Task Object. Why: This is one reminder covering one of tasks.js's own 5 repeat kinds (see the comment above this array for which is which). How: This is read by the reminders engine (tasks.js) exactly like any real, user-created task.
	{ id : 'hlp_tk_annual',   name : 'Anniversary',            repeat : 'annual',   month : 6, day : 15   }  // What: Sample Task Object. Why: This is one reminder covering one of tasks.js's own 5 repeat kinds (see the comment above this array for which is which). How: This is read by the reminders engine (tasks.js) exactly like any real, user-created task.


];



const sedPicFun = ( appStaObj, actShaObj ) => { // What: Seed Pickers Function. Why: Pickers and Data need real, editable copies of every mode plus the conditional-gated example whenever help mode turns on. How: This adds the day-off conditional, then adds each onboarding-sample and help-only picker under its own id, guarded by existence so re-toggling help mode repeatedly can't create duplicates.


	actShaObj.addConFun( CON_GAT_OBJ ); // What: Conditional Seed Call. Why: The gated-picker example needs its own day-off conditional to exist before the picker that depends on it is added. How: This adds CON_GAT_OBJ via the shared addConFun action.



	[ ONB_EXA_OBJ, ...ONB_ESP_ARR ].forEach( ( curPicObj ) => { // What: Onboarding Sample Copy Loop. Why: Every onboarding-sample picker needs its own disposable, hlp_-namespaced copy seeded alongside the help-only pickers below. How: This iterates ONB_EXA_OBJ plus every ONB_ESP_ARR entry, building and adding one copy per entry.


		const copIdeStr = helIdeFun( curPicObj.id ); // What: Copy Identifier String. Why: The copy must live in help mode's own hlp_-prefixed id namespace, never the real onboarding sample's own id. How: This prefixes curPicObj's own id via helIdeFun.


		if ( appStaObj.pickers.some( ( curExiObj ) => curExiObj.id === copIdeStr ) ) return; // What: Existing Copy Guard. Why: Re-toggling help mode on and off repeatedly must not create duplicate-id pickers. How: This bails out of this entry's own iteration when a picker already carries copIdeStr as its own id.



		actShaObj.addPicFun({ // What: Onboarding Sample Copy Add Call. Why: The copy must be a real, editable picker, not a reference to the onboarding sample itself. How: This adds a fresh picker under copIdeStr, carrying curPicObj's own name/group/mode plus its items stripped of their own onboarding-only id field.


			group : curPicObj.group,                                              // What: Group Field. Why: The copy should sit in the same group as the onboarding sample it mirrors. How: This carries curPicObj's own group through unchanged.
			id    : copIdeStr,                                                    // What: Id Field. Why: The added picker must live under its own help-namespaced id, not the onboarding sample's real id. How: This assigns copIdeStr, computed above via helIdeFun.
			items : curPicObj.items.map( ( { id, ...iteRstObj } ) => iteRstObj ), // What: Items Field. Why: Each item needs to drop its own onboarding-only id so the copy doesn't collide with the sample it mirrors. How: This maps every curPicObj item down to iteRstObj, its own fields minus id.
			mode  : curPicObj.mode,                                               // What: Mode Field. Why: The copy must use the same picker-engine algorithm as the onboarding sample it mirrors. How: This carries curPicObj's own mode through unchanged.
			name  : curPicObj.name                                                // What: Name Field. Why: The copy should display exactly like the onboarding sample it mirrors. How: This carries curPicObj's own name through unchanged.


		});


	} );



	[ ...EXT_PIC_ARR, PIC_GAT_OBJ ].forEach( ( curPicObj ) => { // What: Help-Only Picker Loop. Why: The extra picker-mode examples and the conditional-gated example are help-only, with no onboarding-sample counterpart to copy. How: This iterates EXT_PIC_ARR plus PIC_GAT_OBJ, adding each one directly under its own already-hlp_-prefixed id.


		if ( appStaObj.pickers.some( ( curExiObj ) => curExiObj.id === curPicObj.id ) ) return; // What: Existing Picker Guard. Why: Re-toggling help mode on and off repeatedly must not create duplicate-id pickers. How: This bails out of this entry's own iteration when a picker already carries curPicObj's own id.



		actShaObj.addPicFun( curPicObj ); // What: Help-Only Picker Add Call. Why: The picker must be a real, editable entry, exactly like any user-created picker. How: This adds curPicObj directly; unlike the onboarding-sample loop above, it needs no id remapping.


	} );


};


const clePicFun = ( actShaObj ) => { // What: Clear Pickers Function. Why: Every picker/conditional seeded by sedPicFun must be torn back down the moment help mode turns off. How: This removes each onboarding-sample copy and help-only picker by id, then removes the day-off conditional.


	[ ONB_EXA_OBJ, ...ONB_ESP_ARR ].forEach( ( curPicObj ) => actShaObj.delPicFun( helIdeFun( curPicObj.id ) ) ); // What: Onboarding Sample Copy Removal Loop. Why: Every copy seeded by sedPicFun's own onboarding-sample loop must be removed again. How: This maps each entry's own id through helIdeFun to find its copy's id, then removes it.

	[ ...EXT_PIC_ARR, PIC_GAT_OBJ ].forEach( ( curPicObj ) => actShaObj.delPicFun( curPicObj.id ) ); // What: Help-Only Picker Removal Loop. Why: Every help-only picker seeded by sedPicFun's own second loop must be removed again. How: This removes each entry directly by its own already-hlp_-prefixed id.


	actShaObj.delConFun( CON_GAT_STR ); // What: Conditional Removal Call. Why: The day-off conditional seeded alongside the gated picker must be removed once every picker that could depend on it is already gone. How: This removes the conditional by its own CON_GAT_STR id.


};



const sedTasFun = ( appStaObj, actShaObj ) => { // What: Seed Tasks Function. Why: Data needs one real reminder per recurrence kind whenever help mode turns on. How: This adds each TAS_SAM_ARR entry, guarded by existence so re-toggling help mode repeatedly can't create duplicates.


	TAS_SAM_ARR.forEach( ( curTasObj ) => { // What: Task Sample Seed Loop. Why: Every entry in TAS_SAM_ARR needs its own guarded add. How: This iterates TAS_SAM_ARR, adding each entry not already present.


		if ( appStaObj.tasks.some( ( curExiObj ) => curExiObj.id === curTasObj.id ) ) return; // What: Existing Task Guard. Why: Re-toggling help mode on and off repeatedly must not create duplicate-id tasks. How: This bails out of this entry's own iteration when a task already carries curTasObj's own id.



		actShaObj.addTasFun( curTasObj ); // What: Task Sample Add Call. Why: The reminder must be a real, editable entry, exactly like any user-created task. How: This adds curTasObj directly.


	} );


};


const cleTasFun = ( actShaObj ) => { // What: Clear Tasks Function. Why: Every reminder seeded by sedTasFun must be torn back down the moment help mode turns off. How: This removes each TAS_SAM_ARR entry by id.


	TAS_SAM_ARR.forEach( ( curTasObj ) => actShaObj.delTasFun( curTasObj.id ) ); // What: Task Sample Removal Loop. Why: Every reminder seeded by sedTasFun must be removed again. How: This removes each TAS_SAM_ARR entry directly by its own id.


};



/**
 * unhHisFun = Unhide History Function
 *
 * @summary
 * Stats needs no disposable copy of its own (nothing there is editable),
 * the same reasoning as the page tour's own unhideSampleHistory. This
 * borrows the REAL hidden onboarding sample pickers directly so the
 * heatmap/breakdown have a genuine year of history to show, and hides
 * them again once help mode turns off (see hidHisFun below).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const unhHisFun = ( appStaObj, actShaObj ) => { // What: Unhide History Function. Why: The Stats page needs a genuine year of history to show while help mode is on (see the comment above this declaration). How: This unhides every real onboarding sample picker, then lazily seeds their precomputed history the first time it's actually missing.


	ONB_SPI_ARR.forEach( ( curIdeStr ) => actShaObj.updPicFun( curIdeStr, { hidden : false } ) ); // What: Onboarding Sample Unhide Loop. Why: Stats can only chart a picker's own history while that picker isn't hidden. How: This unhides every onboarding sample picker by id.


	if ( !( appStaObj.pickLog || [] ).some( ( curRowObj ) => ONB_SPI_ARR.includes( curRowObj.pickerId ) ) ) { // What: Missing History Check. Why: The precomputed history only ever needs seeding once; re-toggling help mode on and off must not seed it again. How: This checks whether any existing pickLog row already belongs to an onboarding sample picker.


		import( './onboarding-stats-data.js' ).then( ( { ONBOARDING_STATS } ) => { // What: Onboarding Stats Data Import. Why: The precomputed history is large enough to load lazily rather than bundling it into every page. How: This dynamically imports onboarding-stats-data.js, resolving with its own ONBOARDING_STATS export.


			actShaObj.sedHisFun( hydStaFun( ONBOARDING_STATS ) ); // What: Stats History Seed Call. Why: The precomputed history must become real, dated pickLog/reminderLog/reminderSkipLog rows before appending. How: This hydrates ONBOARDING_STATS via hydStaFun, then appends the result via sedHisFun.


		} );


	}


};



const hidHisFun = ( actShaObj ) => { // What: Hide History Function. Why: The onboarding sample pickers borrowed by unhHisFun must be hidden again the moment help mode turns off. How: This re-hides every onboarding sample picker by id.


	ONB_SPI_ARR.forEach( ( curIdeStr ) => actShaObj.updPicFun( curIdeStr, { hidden : true } ) ); // What: Onboarding Sample Hide Loop. Why: A picker borrowed only for help mode's own Stats display shouldn't stay visible once help mode is off. How: This re-hides every onboarding sample picker by id.


};



export { sedPicFun, clePicFun, sedTasFun, cleTasFun, unhHisFun, hidHisFun }; // What: Named Exports. Why: tab-picker.jsx/tab-data.jsx/tab-stats.jsx each need to (un)seed their own slice of help-mode sample data as their own help toggle turns on/off. How: This re-exports all 6 seed/clear/unhide/hide functions declared above by name.


