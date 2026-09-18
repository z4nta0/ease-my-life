



// #region Imports

import React from 'react'; // What: React. Why: This file's own PagTouCom component needs React in scope to compile its JSX and to call React.useState. How: This is used directly (React.useState) below, instead of importing individual named hooks.


import { emlTouObj            } from './onboarding.jsx';             // What: Ease My Life Tour Object. Why: This publishes/reads bus nonces the Pickers-page onBacTouFun handler uses to reset or redo an in-flight picker-form animation. How: This is read via .get() and written via .set() inside PagTouCom's own onBacTouFun below.
import { GuidedTour           } from './onboarding-tour-runner.jsx'; // What: Guided Tour. Why: This is the generic spotlight-tour engine that actually drives each page mini-tour once its own intro modal is accepted. How: This is rendered while touPhaStr is 'tour', passed this file's own per-page step array.
import { hydStaFun            } from './onboarding-seed-data.js';    // What: Hydrate Stats Function. Why: The Stats tour's own borrowed sample history needs converting from its static template shape into real pickLog rows. How: This is called inside unhHisFun below, passed ONBOARDING_STATS.
import { IcoSvgCom            } from './ui.jsx';                     // What: Icon Svg Component. Why: The intro modal needs a recognizable glyph matching the current page. How: This is rendered inside the intro modal's icon prop below.
import { IntModCom            } from './onboarding-intro-modal.jsx'; // What: Intro Modal Component. Why: Each page mini-tour opens on this generic intro modal before any spotlight step ever shows. How: This is rendered while touPhaStr is 'intro', passed this page's own icon/title/paragraphs/pills.
import { NAV_TAR_OBJ          } from './onboarding-targets.jsx';     // What: Nav Target Object. Why: Every page tour's own Step 1 and its own intro-modal fallback copy read this shared nav-button catalog. How: This is looked up by a page key everywhere this file needs the real nav button's own selector/title/body.
import { OB_EXAMPLE           } from './onboarding-seed-data.js';    // What: Onboarding Example. Why: This is the "Daily Chores" sample picker's own template, one of the entries PAG_SAM_ARR below carries, and its own id is the Stats tour's own preselected picker. How: This is spread into PAG_SAM_ARR below and read directly for PRE_PIC_STR.
import { OB_EXTRA_PICKERS     } from './onboarding-seed-data.js';    // What: Onboarding Extra Pickers. Why: This is every OTHER sample picker's own template, alongside OB_EXAMPLE the full set PAG_SAM_ARR below carries. How: This is spread into PAG_SAM_ARR below.
import { OB_PAGE_TOURS        } from './onboarding-checklist.js';    // What: Onboarding Page Tours. Why: PagTouCom below needs this page tour's own id/page/label manifest entry. How: This is searched by pagIdeStr inside PagTouCom below.
import { OB_SAMPLE_PICKER_IDS } from './onboarding-seed-data.js';    // What: Onboarding Sample Picker Ids. Why: The Stats tour needs to unhide/rehide every real sample picker (not a disposable copy) for its own duration. How: This is iterated by unhHisFun/hidHisFun below.
import { OB_TASKS             } from './onboarding-seed-data.js';    // What: Onboarding Tasks. Why: The Data tour needs real reminders to point at, seeded/cleared as disposable copies the same way PAG_SAM_ARR is for pickers. How: This is iterated by seeTasFun/cleTasFun below.

// #endregion Imports



/**
 * onboarding-page-tours.jsx = Onboarding Page Tours
 *
 * @summary
 * Content for the page tours ("Explore the {page}" — Today/Pickers/
 * Stats/Data/Settings), launched from each page's own Today launcher
 * card (see onboarding-checklist.js's OB_PAGE_TOURS and tab-today.jsx's
 * PageTourCard). Still growing in from an intro-only stub: Today is
 * the only page with a full walkthrough of its own interior elements
 * so far, the others currently stop after Step 1 (the shared nav-
 * button highlight built by buildPageTourStep1, also reused verbatim
 * by onboarding-app-features.jsx's own App Features tours).
 *
 * The Pickers/Data tours need real pickers on screen to point at, but
 * both expose real edit/delete controls, so this seeds disposable
 * `pt_`-prefixed COPIES of the Welcome Tour's own hidden samples
 * (PAG_SAM_ARR) rather than risk the user's own interaction here
 * corrupting that shared reference data; the Data tour does the same
 * for reminders (OB_TASKS), and both clean their copies up the moment
 * their own tour ends. The Stats tour has no edit/delete controls at
 * all, so it instead unhides the REAL hidden samples for its own
 * duration (a copy would also start with zero pick history, leaving
 * its heatmap/breakdown empty), hiding them again on exit.
 *
 * Each page's own interior elements are described in a small "content
 * only" catalog (PIC_TAR_OBJ/STA_TAR_OBJ/DAT_TAR_OBJ/SET_TAR_OBJ/
 * TOD_TAR_OBJ), the same selStr/titStr/bodEle shape as NAV_TAR_OBJ, kept
 * separate from navigation flags (tabStr/priStr/bacBoo/...) so a future
 * on-demand multi-highlight help mode could pull from these same
 * catalogs directly. bldSteFun assembles each page's own real step
 * array by spreading a catalog entry together with that flow's own
 * navigation flags.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



/**
 * PAG_COP_OBJ = Page Copy Object
 *
 * @summary
 * Each page tour's own intro-modal title/body/pills, keyed by its own
 * checklist id. Falls back to NAV_TAR_OBJ's own per-page titStr/bodEle
 * (already written to stand alone, with no reference to "this tour" or
 * "the next step" baked in) for any page this object hasn't gotten its
 * own dedicated copy pass yet.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const PAG_COP_OBJ = { // What: Page Copy Object. Why: PagTouCom's own intro modal reads this by pagIdeStr for its title/body/pills, falling back to navTarObj's own content when a page has no entry here. How: This is looked up by pagIdeStr inside PagTouCom below.


	explore_data : {


		bodEle : <>This tutorial will take you on a quick tour of the Data page, in order to <b>highlight important elements and functionality</b>.</>,
		pilArr : [ 'page tour', 'data page', 'edit pickers' ],
		titStr : 'Data Page'


	},

	explore_pickers : {


		bodEle : <>This tutorial will take you on a quick tour of the Pickers page, in order to <b>highlight important elements and functionality</b>.</>,
		pilArr : [ 'page tour', 'pickers page', 'new pickers' ],
		titStr : 'Pickers Page'


	},

	explore_settings : {


		bodEle : <>This tutorial will take you on a quick tour of the Settings page, in order to <b>highlight important elements and functionality</b>.</>,
		pilArr : [ 'page tour', 'settings page', 'app customization' ],
		titStr : 'Settings Page'


	},

	explore_stats : {


		bodEle : <>This tutorial will take you on a quick tour of the Stats page, in order to <b>highlight important elements and functionality</b>.</>,
		pilArr : [ 'page tour', 'stats page', 'picker statistics' ],
		titStr : 'Stats Page'


	},

	explore_today : {


		pilArr : [ 'page tour', 'today page', 'todo list' ], // What: Pills Array. Why: The intro modal's own pill row needs 3 short tags describing this tour. How: This is rendered as IntModCom's own pilLabArr prop.
		titStr : 'Today Page',                               // What: Title String. Why: The intro modal needs a heading naming this page. How: This is rendered as IntModCom's own titHeaStr prop.

		bodEle : <>This tutorial will take you on a quick tour of the Today page, in order to <b>highlight important elements and functionality</b>.</> // What: Body Element. Why: The intro modal needs a plain description of what this tour covers. How: This is rendered as the sole entry of IntModCom's own parEleArr prop.


	}


};



/**
 * buildPageTourStep1 = Build Page Tour Step 1
 *
 * @summary
 * Step 1 for every page tour: highlight that page's own navbar button,
 * reusing the Welcome Tour's own copy for it verbatim (navTarObj
 * already carries a selStr/titStr/bodEle written to stand alone). Unlike
 * this file's own per-page catalogs (which deliberately write THEIR
 * own copy instructing the click), this one is asked to match the
 * Welcome Tour's wording exactly, cirBoo's own hover hint is
 * what tells the user to click.
 *
 * tabStr: 'today' keeps this from auto-navigating when the step opens (a
 * page tour is launched from Today, and clicking the real nav icon is
 * meant to be what does the navigating, not the step itself). priBut
 * Str defaults to 'Next' (every page tour has more steps after this
 * one) but is overridable, onboarding-app-features.jsx's own App
 * Features tours reuse this exact step verbatim as their OWN Step 1,
 * currently still their only step, so theirs pass 'Done' instead.
 * butLabStr names the actual nav button ("Today", "Pickers", ...) in
 * the closing sentence instead of the generic "click it now", optional
 * and only passed where a caller has explicitly asked for it, so other
 * callers' wording is unaffected.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const buildPageTourStep1 = ( pagKeyStr, runSteFun, priButStr = 'Next', butLabStr = null ) => { // What: Build Page Tour Step 1. Why: This builds every page tour's own shared Step 1, the real nav-button highlight. How: This looks up navTarObj by pagKeyStr, then spreads it with this step's own navigation flags.


	const navTarObj = NAV_TAR_OBJ[ pagKeyStr ]; // What: Nav Target Object. Why: This step's own selStr/titStr/bodEle come from the shared nav-button catalog. How: This looks up NAV_TAR_OBJ by pagKeyStr.

	return { // What: Step Object Return. Why: GuidedTour needs this step's own selector, copy, and navigation flags. How: This spreads navTarObj, then overrides bodEle/tabStr/priStr/bacBoo/cirBoo/runFun.


		...navTarObj,
		tabStr    : 'today',   // What: Tab String. Why: This step must stay on Today so the real nav click is what does the navigating, not this step itself. How: GuidedTour's own tab-sync effect reads this.
		priStr    : priButStr, // What: Primary String. Why: This step's own coach card needs a label for its main action button, 'Next' by default but overridable by a caller like the App Features tours. How: GuidedTour renders this as the button's own visible text.
		bacBoo    : false,     // What: Back Boolean. Why: This is every page tour's own very first step, so there is nothing to go back to. How: GuidedTour hides its own Back button whenever this is false.
		cirBoo    : true,      // What: Require Click Boolean. Why: The click itself is the thing being taught, not just a gate. How: GuidedTour disables Next and only advances once the real target is clicked.
		bodEle    : <>{ navTarObj.bodEle } Go ahead and click { butLabStr ? <>the "{ butLabStr }" page's button</> : 'it' } now.</>, // What: Body Element. Why: This step's own coach card needs navTarObj's own description plus an explicit click instruction. How: This appends a click sentence after navTarObj's own bodEle, naming the button when butLabStr is given.

		...( runSteFun ? { runFun : runSteFun } : {} ) // What: Run Spread. Why: Only some callers (the Pickers/Data/Stats tours below) need a side effect fired alongside this step's own click. How: This spreads a runFun field in only when runSteFun was actually passed.


	};


};



/**
 * PAG_SAM_ARR = Page Sample Array
 *
 * @summary
 * The Pickers/Data tours need real pickers on screen to point at (e.g.
 * the group filter row doesn't even render with fewer than 2 groups),
 * but both expose real edit/delete controls on whatever picker they
 * highlight, so reusing the Welcome Tour's own hidden sample pickers
 * directly (the same ones the Today mini-tour launcher cards and
 * Replay Tour depend on) would let the user's own interaction here
 * (deleting one, editing an item, re-selecting a scope, etc.) corrupt
 * that shared reference data. Seeded as full COPIES instead, under
 * their own `pt_`-prefixed ids (never colliding with the real
 * `pkr_ob_*`/`it_ob_*` ones), and cleaned up again the moment whichever
 * tour used them ends (see clePicFun) — real, interactive, but
 * disposable. Shared between the two tours rather than each
 * maintaining its own copy set. Stats does NOT use this, see unhHisFun
 * below for why it borrows the real samples instead.
 *
 * picCopFun derives a copy's own id from its real sample's id, and
 * neeCopFun decides which page tours need disposable copies seeded/
 * cleared at all, Today and Settings don't touch pickers, and Stats
 * uses the real samples instead.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const PAG_SAM_ARR = [ OB_EXAMPLE, ...OB_EXTRA_PICKERS ]; // What: Page Sample Array. Why: seePicFun/clePicFun below need every sample picker's own template to seed/clear a disposable copy of. How: This flattens OB_EXAMPLE and every OB_EXTRA_PICKERS entry into one array.
const picCopFun = ( samIdeStr ) => `pt_${ samIdeStr }`; // What: Picker Copy Function. Why: Every disposable picker copy's own id needs deriving from its real sample's id, consistently. How: This prefixes samIdeStr with 'pt_'.
const neeCopFun = ( pagIdeStr ) => pagIdeStr === 'explore_pickers' || pagIdeStr === 'explore_data'; // What: Needs Copies Function. Why: Only the Pickers/Data tours seed/clear disposable picker copies at all. How: This checks pagIdeStr against both of those page ids.



/**
 * seePicFun = Seed Picker Function
 *
 * @summary
 * Fired from Step 1's runFun() (see PagTouCom below), between the nav
 * click and Step 2 ever mounting, the same "prepare what the NEXT step
 * needs" timing already used elsewhere in this file (e.g. Today's own
 * Step 5 staging Step 6's rename input). Guarded by existence so
 * navigating back to Step 1 and forward again (re-firing this runFun())
 * can't create duplicate-id pickers.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const seePicFun = ( staAppObj, actions ) => { // What: Seed Picker Function. Why: The Pickers/Data tours need real, disposable copies of every sample picker seeded before their own steps can point at them. How: This adds one copy per PAG_SAM_ARR entry, skipping any already seeded.


	PAG_SAM_ARR.forEach( ( samPicObj ) => { // What: Sample Picker Object Loop. Why: Every sample picker's own template needs its own disposable copy. How: This iterates PAG_SAM_ARR, seeding one copy per entry.


		const copIdeStr = picCopFun( samPicObj.id ); // What: Picker Copy Id String. Why: This copy's own id must never collide with the real hidden picker's own id. How: This derives it from samPicObj's own id via picCopFun.

		if ( staAppObj.pickers.some( ( exiPicObj ) => exiPicObj.id === copIdeStr ) ) return; // What: Existing Copy Guard. Why: Re-firing this runFun() (Back then Forward again) must not create a duplicate-id picker. How: This returns early whenever a picker with this exact copy id already exists.

		actions.addPicker({ // What: Add Picker Call. Why: This is the real, interactive disposable copy the tour's own steps point at. How: This adds a picker under copIdeStr, copying samPicObj's own name/group/mode/items.


			group : samPicObj.group,
			id    : copIdeStr,
			items : samPicObj.items.map( ( { id : oldIdeStr, ...iteResObj } ) => iteResObj ), // What: Items Field. Why: Items keep their own name/weight/ease fields but must drop their real id, passing the real sample's own item ids through would collide with the real hidden picker's own items in state.items. How: This destructures each item, discarding its own id and keeping the rest.
			mode  : samPicObj.mode,
			name  : samPicObj.name


		});


	});


};



/**
 * clePicFun = Clear Picker Function
 *
 * @summary
 * Discards the copies seePicFun makes, called whenever a tour that
 * seeded them ends (Skip or Done), so they never linger as clutter in
 * the user's real picker list. Harmless no-op for any copy that was
 * never actually seeded (e.g. Skip from the intro modal, before Step
 * 1's own runFun() ever fires).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const clePicFun = ( actions ) => { // What: Clear Picker Function. Why: A disposable copy must never linger in the user's real picker list once its own tour ends. How: This removes every PAG_SAM_ARR entry's own copy id, a harmless no-op for one never seeded.


	PAG_SAM_ARR.forEach( ( samPicObj ) => actions.removePicker( picCopFun( samPicObj.id ) ) ); // What: Remove Picker Call. Why: Every seeded copy must be discarded, not just some. How: This removes a picker at picCopFun's own derived id for each PAG_SAM_ARR entry.


};



/**
 * tasCopFun / seeTasFun / cleTasFun
 *
 * @summary
 * The Data tour's own Reminders step needs real reminders to point at,
 * same reasoning as PAG_SAM_ARR above (real edit/delete controls are
 * exposed there too, so a disposable copy protects the real hidden
 * samples), just for OB_TASKS instead of pickers. Data-only, the
 * Pickers tour never touches reminders at all.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const tasCopFun = ( samIdeStr ) => `pt_${ samIdeStr }`; // What: Task Copy Function. Why: Every disposable reminder copy's own id needs deriving from its real sample's id, consistently. How: This prefixes samIdeStr with 'pt_'.
const seeTasFun = ( staAppObj, actions ) => { // What: Seed Task Function. Why: The Data tour needs real, disposable copies of every sample reminder seeded before its Reminders step can point at them. How: This adds one copy per OB_TASKS entry, skipping any already seeded.


	OB_TASKS.forEach( ( samTasObj ) => { // What: Sample Task Object Loop. Why: Every sample reminder's own template needs its own disposable copy. How: This iterates OB_TASKS, seeding one copy per entry.


		const copIdeStr = tasCopFun( samTasObj.id ); // What: Task Copy Id String. Why: This copy's own id must never collide with the real hidden reminder's own id. How: This derives it from samTasObj's own id via tasCopFun.

		if ( staAppObj.tasks.some( ( exiTasObj ) => exiTasObj.id === copIdeStr ) ) return; // What: Existing Copy Guard. Why: Re-firing this runFun() must not create a duplicate-id reminder. How: This returns early whenever a task with this exact copy id already exists.

		actions.addTask({ // What: Add Task Call. Why: This is the real, interactive disposable copy the Data tour's own Reminders step points at. How: This adds a task under copIdeStr, copying samTasObj's own name/repeat, and this weekday when it recurs weekly.


			id     : copIdeStr,
			name   : samTasObj.name,
			repeat : samTasObj.repeat,

			...( samTasObj.repeat === 'weekly' ? { daysOfWeek : [ new Date().getDay() ] } : {} ) // What: Days Of Week Spread. Why: Mirrors the real Welcome Tour's own seeding (see onboarding.jsx's Generate step): the recurring sample's own daysOfWeek should read as "due today", not the base template's hardcoded Monday. How: This spreads today's own weekday in only when this sample recurs weekly.


		});


	});


};
const cleTasFun = ( actions ) => { // What: Clear Task Function. Why: A disposable reminder copy must never linger in the user's real reminder list once its own tour ends. How: This removes every OB_TASKS entry's own copy id, a harmless no-op for one never seeded.


	OB_TASKS.forEach( ( samTasObj ) => actions.removeTask( tasCopFun( samTasObj.id ) ) ); // What: Remove Task Call. Why: Every seeded copy must be discarded, not just some. How: This removes a task at tasCopFun's own derived id for each OB_TASKS entry.


};



/**
 * unhHisFun = Unhide History Function
 *
 * @summary
 * The Stats tour has no edit/delete controls anywhere on the page,
 * it's pure viewing, so unlike Pickers/Data it doesn't need a
 * disposable copy to protect against corruption. A copy would also be
 * worse here specifically: it'd start with zero pick history, leaving
 * the heatmap/breakdown empty, the opposite of what the tour is trying
 * to demonstrate. Instead this borrows the REAL hidden sample pickers
 * directly, which normally already carry roughly 1 year of
 * precomputed pickLog history, seeded once on fresh install (see
 * onboarding.jsx's own mount effect), unhiding them for this tour's own
 * duration and hiding them again the moment it ends (hidHisFun below).
 * Mirrors the exact hide/show mechanism the main Welcome Tour itself
 * already uses for its own Back-navigation.
 *
 * "Normally" above is load-bearing: that mount effect only seeds
 * history on a genuinely virgin install (state.pickers.length === 0),
 * anyone who already had a picker of their own the very first time it
 * ran ends up with the sample PICKERS but none of their history, which
 * is exactly what made the heatmap/breakdown look empty. Backfilled
 * the same way as that effect, guarded by existence (checking for any
 * pickLog row already belonging to a sample picker) so a repeat tour
 * run, or Back-then-Forward re-firing this same runFun(), can't duplicate
 * rows.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const unhHisFun = ( staAppObj, actions ) => { // What: Unhide History Function. Why: The Stats tour's own heatmap/breakdown need real sample history to demonstrate, not an empty disposable copy. How: This unhides every real sample picker, backfilling its own pickLog history if none exists yet.


	OB_SAMPLE_PICKER_IDS.forEach( ( samIdeStr ) => actions.updatePicker( samIdeStr, { hidden : false } ) ); // What: Unhide Sample Picker Call. Why: The Stats tour's own steps need every real sample picker visible for its own duration. How: This updates every OB_SAMPLE_PICKER_IDS entry's own hidden field to false.

	if ( !( staAppObj.pickLog || [] ).some( ( curRowObj ) => OB_SAMPLE_PICKER_IDS.includes( curRowObj.pickerId ) ) ) { // What: Missing History Check. Why: Only a genuinely virgin-install user (or a first run of this tour) is missing the precomputed sample history. How: This checks whether any existing pickLog row already belongs to a sample picker.


		import( './onboarding-stats-data.js' ).then( ( { ONBOARDING_STATS } ) => { // What: Stats Data Import. Why: The precomputed sample history template is large enough to warrant a lazy, on-demand import instead of a static one. How: This dynamically imports onboarding-stats-data.js, then seeds its own ONBOARDING_STATS export.


			actions.seedHistory( hydStaFun( ONBOARDING_STATS ) ); // What: Seed History Call. Why: The static template needs converting into real pickLog rows before it means anything to the Stats tab. How: This calls actions.seedHistory with hydStaFun' own converted result.


		});


	}


};



const hidHisFun = ( actions ) => { // What: Hide History Function. Why: The real sample pickers borrowed by the Stats tour must go back to hidden the moment that tour ends. How: This updates every OB_SAMPLE_PICKER_IDS entry's own hidden field back to true.


	OB_SAMPLE_PICKER_IDS.forEach( ( samIdeStr ) => actions.updatePicker( samIdeStr, { hidden : true } ) ); // What: Hide Sample Picker Call. Why: This must run for every sample picker unhHisFun could have unhidden. How: This updates every OB_SAMPLE_PICKER_IDS entry's own hidden field to true.


};



/**
 * PIC_TAR_OBJ = Pickers Target Object
 *
 * @summary
 * Target and description catalog for the Pickers page's OWN interior
 * elements, content only (selStr/titStr/bodEle, plus cliSelStr/pulSelStr
 * where a two-phase highlight is needed), no navigation fields, the same
 * shape/reasoning as TOD_TAR_OBJ below. bldSteFun spreads these entries
 * together with this flow's own tabStr/priStr/bacBoo/etc. flags.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const PIC_TAR_OBJ = { // What: Pickers Target Object. Why: bldSteFun below spreads each of these entries into the Pickers tour's own real step objects. How: This is looked up by a fixed key per step inside bldSteFun's own explore_pickers branch.


	addPickerItem : {


		bodEle : <>The "Add Item" button will <b>allow you to add new items to the selected picker's list of items</b>. This button is disabled for this tutorial. This concludes the Pickers page tutorial, click Done when you are ready.</>,
		selStr : '.pv-additem-btn', // What: Selector String. Why: This step highlights the real Add Item button. How: GuidedTour spotlights whatever this selector matches.
		titStr : 'Add Picker Item'


	},

	addToTodoList : {


		bodEle    : <>The "Send to Today" button will <b>add the manually generated pick to your todo list on the Today page</b>. Go ahead and click the "Send to Today" button now to see how this works.</>,
		cliSelStr : '.pv-act--send',                            // What: Click Selector String. Why: The cirBoo guard must stay scoped to Send to Today specifically, not any disabled sibling sharing the widened box. How: This is read by the click-guard/cirBoo logic separately from selStr.
		pulSelStr : '.pv-act--send:not(.is-sent)',              // What: Pulse Selector String. Why: There is nothing left to click once the highlight has widened to frame the window, so the pulse should stop there too. How: This matches the same primary alternative as selStr.
		selStr    : '.pv-act--send:not(.is-sent), .picker-run', // What: Selector String. Why: This step highlights the real Send to Today button, falling back to framing the whole stage once it's sent. How: GuidedTour spotlights the first alternative that matches.
		titStr    : 'Add to Todo List'


	},

	createNewPickers : {


		bodEle : <>The "Add New Picker" button will <b>open up a form that allows you to create new pickers</b>. This will not be included as part of the tutorial, but if you want to learn more then please do any one of the picker tutorials after this is finished.</>,
		selStr : '.picker-tab--add', // What: Selector String. Why: This step highlights the real "Add New Picker" tab. How: GuidedTour spotlights whatever this selector matches.
		titStr : 'Create New Pickers'


	},

	editPicker : {


		bodEle : <>This opens the same form used to create a picker, pre-filled with this picker's current settings. You can <b>adjust its name, group, type, daily generator schedule, or conditional attachment</b>. Its items aren&rsquo;t edited here, but you can use this picker's own item list below or the Data tab for that.</>,
		selStr : '.picker-edit-btn', // What: Selector String. Why: This step highlights the real Edit Picker button. How: GuidedTour spotlights whatever this selector matches.
		titStr : 'Edit Picker'


	},

	groupFilter : {


		selStr : '.picker-groups:not(.picker-groups--type) .picker-group-pill', // What: Selector String. Why: This step highlights the Group Filter pills specifically. How: GuidedTour spotlights whatever this selector matches.
		titStr : 'Group Filter',                                                // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.

		bodEle : <>This will allow you to <b>filter the pickers row below by their group</b>, which is extremely useful if you have created a lot of pickers.</> // What: Body Element. Why: This step's own coach card needs a plain description of what the Group Filter pills do. How: GuidedTour renders this as the step's own descriptive paragraph, written as JSX so specific phrases can be bolded.


	},

	manualGeneration : {


		bodEle    : <>The "Pick One" button will <b>allow you to run a manual pick generation for your selected picker</b>, so that you do not have to completely rely on the todo list's auto generation feature on the Today page. Click the "Pick One" button now to see how this works.</>,
		cliSelStr : '.pv-act--pick',                            // What: Click Selector String. Why: The cirBoo guard must stay scoped to the button specifically even once the fallback widens the highlight. How: This is read by the click-guard/cirBoo logic separately from selStr.
		pulSelStr : '.pv-act--pick:not(.is-busy)',              // What: Pulse Selector String. Why: There is nothing left to click once the highlight has widened to frame the window, so the pulse should stop there too. How: This matches the same primary alternative as selStr.
		selStr    : '.pv-act--pick:not(.is-busy), .picker-run', // What: Selector String. Why: This step highlights the idle Pick One button, falling back to framing the whole stage once it goes busy. How: GuidedTour spotlights the first alternative that matches.
		titStr    : 'Manual Generation'


	},

	pickerItems : {


		bodEle : <>Here you can <b>view all items in this picker's pool</b>. You can see a given items values, if applicable, as well as the <b>Send to Today, Edit and Delete buttons</b>. These buttons are disabled for this tutorial.</>,
		selStr : '.pool-items', // What: Selector String. Why: This step highlights the whole item pool, excluding the Add Item button. How: GuidedTour spotlights whatever this selector matches.
		titStr : 'Picker Items'


	},

	pickerSelection : {


		bodEle : <>This will <b>allow you to select a specific picker</b>, in order to initiate a manual picker generation as well as edit or delete its items.</>,
		selStr : '.picker-tabs .picker-tab:not(.picker-tab--add)', // What: Selector String. Why: This step highlights every existing picker's own tab, excluding the Add tab. How: GuidedTour spotlights whatever this selector matches.
		titStr : 'Picker Selection'


	},

	typeFilter : {


		bodEle : <>This will allow you to <b>further filter the pickers row below by their type</b>, which combines with the previous group filter and is extremely useful if you have created a lot of pickers.</>,
		selStr : '.picker-groups--type .picker-group-pill', // What: Selector String. Why: This step highlights the Type Filter pills specifically. How: GuidedTour spotlights whatever this selector matches.
		titStr : 'Type Filter'


	}


};



const PRE_PIC_STR = OB_EXAMPLE.id; // What: Preselect Picker String. Why: The Stats tour's own single-picker steps below pre-select this exact real sample, matched by [data-picker-id] on the tab button (tab-stats.jsx), not by its display name, since nothing stops a user from naming their own picker the same thing. How: This reads OB_EXAMPLE's own id straight through.



/**
 * STA_TAR_OBJ = Stats Target Object
 *
 * @summary
 * Target and description catalog for the Stats page's OWN interior
 * elements, same shape/reasoning as PIC_TAR_OBJ above. A first draft
 * covering only the "main sections" per instruction, not every filter/
 * card gets its own step yet.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const STA_TAR_OBJ = { // What: Stats Target Object. Why: bldSteFun below spreads each of these entries into the Stats tour's own real step objects. How: This is looked up by a fixed key per step inside bldSteFun's own explore_stats branch.


	groupFilter : {


		bodEle : <>This will allow you to <b>filter the pickers row below by group</b>, which is extremely useful if you have created a lot of pickers.</>,
		selStr : '.stat-scope-groups:not(.stat-scope-groups--type) .picker-group-pill', // What: Selector String. Why: This step highlights the Group Filter pills specifically. How: GuidedTour spotlights whatever this selector matches.
		titStr : 'Group Filter'


	},

	heatmap : {


		bodEle : <>This visualizes your completed activity over time, with <b>each day shaded by how much you got done</b>. You can click on any day for more details. Click Next when you are ready to advance to the next step.</>,
		selStr : '.stat-heatmap-card', // What: Selector String. Why: This step highlights the whole activity heatmap card. How: GuidedTour spotlights whatever this selector matches.
		titStr : 'Activity Heatmap'


	},

	pickerBreakdown : {


		bodEle : <>Once a specific picker is selected, its individual items are broken down here. You can <b>view things like pick count, pick frequency, last picked date</b> and others. This concludes the Stats page tutorial, click Done when you are ready.</>,
		selStr : '.stat-breakdown-card', // What: Selector String. Why: This step highlights the whole picker breakdown card. How: GuidedTour spotlights whatever this selector matches.
		titStr : 'Picker Breakdown'


	},

	pickersFilter : {


		bodEle : <>This will allow you to <b>narrow your selection to specific pickers, reminders or conditionals</b>, or you can view everything all at once.</>,
		selStr : '.stat-scope-tabs .picker-tab', // What: Selector String. Why: This step highlights the whole scope-tabs row. How: GuidedTour spotlights whatever this selector matches.
		titStr : 'Show Filter'


	},

	rangeFilter : {


		bodEle : <>This will allow you to further <b>narrow your selection by date range</b>, with ranges from 1 week to 1 year to all time.</>,
		selStr : '.stat-filter-pills--seg .stat-pill', // What: Selector String. Why: This step highlights the Range Filter pills specifically. How: GuidedTour spotlights whatever this selector matches.
		titStr : 'Range Filter'


	},

	typeFilter : {


		bodEle : <>This will allow you to <b>further filter the show row below by their type</b>, which combines with the previous group filter and is extremely useful if you have created a lot of pickers.</>,
		selStr : '.stat-scope-groups--type .picker-group-pill',
		titStr : 'Type Filter'


	}


};



/**
 * DAT_TAR_OBJ = Data Target Object
 *
 * @summary
 * Target and description catalog for the Data page's OWN interior
 * elements, same shape/reasoning as STA_TAR_OBJ above. Also a first
 * draft covering only the "main sections" per instruction, likely to
 * grow more steps later. groupFilter/pickersFilter are both disabled
 * while their own step is up (tab-data.jsx's own disableGroupFilter/
 * disablePickersFilter, same tourId+step gating pattern as tab-
 * picker.jsx), narrating what they do is the point, and changing
 * statGroup/scope mid-tour would otherwise leave a LATER step's own
 * target (remindersManager, which only shows at scope 'all') unable to
 * find anything, since nothing here resets it back afterward.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const DAT_TAR_OBJ = { // What: Data Target Object. Why: bldSteFun below spreads each of these entries into the Data tour's own real step objects. How: This is looked up by a fixed key per step inside bldSteFun's own explore_data branch.


	createPicker : {


		bodEle : <>This creates a new picker directly from this list, respecting the group, type and conditional filters if they are used. This concludes the Data page tutorial, click Done when you are ready.</>,
		selStr : '.cat-create-btn', // What: Selector String. Why: This step highlights the real Create Picker button at the bottom of the list. How: GuidedTour spotlights whatever this selector matches.
		titStr : 'Create New Picker'


	},

	groupFilter : {


		bodEle : <>This will allow you to <b>filter the pickers row below by group</b>, which is extremely useful if you have created a lot of pickers.</>,
		selStr : '.stat-scope-groups:not(.stat-scope-groups--type) .picker-group-pill', // What: Selector String. Why: This step highlights the Group Filter pills specifically. How: GuidedTour spotlights whatever this selector matches.
		titStr : 'Group Filter'


	},

	pickersFilter : {


		bodEle : <>This will allow you to <b>further narrow exactly what you want to view and edit</b>.</>,
		selStr : '.stat-scope-tabs .picker-tab',
		titStr : 'Show Filter'


	},

	pickersManager : {


		bodEle : <>This is where you can <b>view and edit all of your pickers, as well as their containing items</b>. You can also create new picker items. Feel free to explore this section yourself. Click Next when you are ready to move on.</>,
		selStr : '.data-list > .cat', // What: Selector String. Why: This step highlights every picker/Conditionals/Reminders card as one combined region. How: GuidedTour spotlights every element this selector matches.
		titStr : 'View and Edit Pickers'


	},

	remindersManager : {


		bodEle : <>This is where you can <b>view and edit all of your reminders, as well as create new ones</b>. Feel free to explore this section yourself. Click Next when you are ready to move on.</>,
		selStr : '.cat--reminders', // What: Selector String. Why: This step highlights the whole Reminders manager section. How: GuidedTour spotlights whatever this selector matches.
		titStr : 'View and Edit Reminders'


	},

	typeFilter : {


		bodEle : <>This will allow you to <b>further filter the show row below by their type</b>, which combines with the group filter and is extremely useful if you have created a lot of pickers.</>,
		selStr : '.stat-scope-groups--type .picker-group-pill',
		titStr : 'Type Filter'


	}


};



/**
 * SET_TAR_OBJ = Settings Target Object
 *
 * @summary
 * Target and description catalog for the Settings page's OWN interior
 * elements, same shape/reasoning as PIC_TAR_OBJ above. One step per
 * section, each a fixed-content reference blurb (no interaction to
 * drive, unlike the Pickers tour), every .set-section is always
 * mounted (a scroll-spy sidebar, not a disclosure), so GuidedTour's own
 * scroll-into-view handles reaching each one without any runFun() staging.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const SET_TAR_OBJ = { // What: Settings Target Object. Why: bldSteFun below spreads each of these entries into the Settings tour's own real step objects. How: This is looked up by a fixed key per step inside bldSteFun's own explore_settings branch.


	about : {


		bodEle : <>This is where you can find information about this app and its developer, replay the welcome tour and all of these tutorials at any time, and <b>contact the developer if you have any problems or suggestions</b>.</>,
		selStr : '.set-section--about',
		titStr : 'About Ease My Life'


	},

	appearance : {


		bodEle : <>This is where you can <b>customize the app's look and feel</b>: light, dark and custom theme colors, completion celebration animations, picker pick animations, and tab bar placement.</>,
		selStr : '.set-section--appearance', // What: Selector String. Why: This step highlights the whole Appearance section. How: GuidedTour spotlights whatever this selector matches.
		titStr : 'App Customization'


	},

	daily : {


		bodEle : <>This is where you can <b>control the daily generator</b>: turn auto generation on or off, what time it runs, and enabling notifications for when it does.</>,
		selStr : '.set-section--daily',
		titStr : 'Daily Generator'


	},

	data : {


		bodEle : <>This is where you can protect your data from browser deletion, <b>install the app directly to your device</b>, back up your data (export), restore your data (import), or erase all of your data.</>,
		selStr : '.set-section--data',
		titStr : 'Data Control'


	},

	holidays : {


		bodEle : <>This is where you can <b>toggle which holiday observances that the pickers and reminders option uses</b>. You can even add your own custom holidays, like your birthday!</>,
		selStr : '.set-section--holidays',
		titStr : 'Holiday Controls'


	},

	legal : {


		bodEle : <>This is where you can <b>view the Privacy Policy and Terms of Service</b>. This concludes the Settings page tutorial, click Done when you are ready.</>,
		selStr : '.set-section--legal',
		titStr : 'Legal Information'


	}


};



/**
 * TOD_TAR_OBJ = Today Target Object
 *
 * @summary
 * Target and description catalog for the Today page's OWN interior
 * elements (as opposed to NAV_TAR_OBJ, which only covers the nav bar
 * buttons), same shape/reasoning as PIC_TAR_OBJ above. Kept here
 * rather than moved into onboarding-targets.jsx for now (nothing
 * outside this file reads it yet), but is exactly what a future on-
 * demand multi-highlight help mode would pull from by id, see the
 * onboarding-engine-reuse-design memory. Extract into its own module
 * alongside NAV_TAR_OBJ if/when that help mode actually gets built and
 * needs to reference these same targets.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const TOD_TAR_OBJ = { // What: Today Target Object. Why: bldSteFun below spreads each of these entries into the Today tour's own real step objects. How: This is looked up by a fixed key per step inside bldSteFun's own explore_today branch.


	editMode : {


		bodEle : <>The "Edit Mode" button will allow you to both <b>rearrange the positions of the groups and items, as well as rename the groups</b>. Go ahead and click the "Edit Mode" button now.</>,
		selStr : '.em-rail-btn, .foot-editmode', // What: Selector String. Why: This step highlights whichever Edit Mode control is actually visible at the current width. How: GuidedTour spotlights the first alternative that matches.
		titStr : 'Edit Mode'


	},

	groupGrip : {


		bodEle : <>This will <b>allow you to move an entire group section to a different position in the todo list or move item positions within a group’s section</b>. Just click or press on it, hold it and move it up or down. You can try it yourself now. Click Next when you are ready to move on.</>,
		selStr : '.rem-section .group-grip', // What: Selector String. Why: This step highlights the Reminders section's own drag handle specifically. How: GuidedTour spotlights whatever this selector matches.
		titStr : 'Movable Icon'


	},

	groupsNav : {


		bodEle : <>This is the todo list’s navigation, <b>allowing you to jump directly to a group’s section</b>. Over time your list can grow quite long and this helps to quickly move between the different sections of your todo list.</>,
		selStr : '.group-rail ul', // What: Selector String. Why: This step highlights the group navigation list, excluding Edit Mode. How: GuidedTour spotlights whatever this selector matches.
		titStr : 'List Navigation'


	},

	progressRing : {


		bodEle : <>This <b>tracks your current progress of completed / total tasks for today’s todo list</b>. Once filled completely, your Day Streak will increase and the celebration animations will play.</>,
		selStr : '.ring', // What: Selector String. Why: This step highlights the real progress ring. How: GuidedTour spotlights whatever this selector matches.
		titStr : 'Progress Ring'


	},

	renameGroup : {


		bodEle : <>This will <b>allow you to change a group’s name</b>. You can go ahead and try it yourself, but once you exit this tutorial the changes will be reverted. This concludes the Today page tutorial, click Done when you are ready.</>,
		selStr : '.pt-section .group-name-input', // What: Selector String. Why: This step highlights the Page Tours group's own rename input. How: GuidedTour spotlights whatever this selector matches.
		titStr : 'Rename Group'


	}


};



/**
 * pgtNamStr = Page-Tours Name String
 *
 * @summary
 * The Page Tours group's real name at the moment the renameGroup step
 * (see TOD_TAR_OBJ above) opens its rename input, captured off the
 * rename button's own aria-label ("Rename group {name}") before it
 * disappears behind the input. Lets a Back to the groupGrip step reset
 * the input to a genuine no-op edit (draft === name) rather than an
 * actual rename, without this module otherwise needing to know the
 * live app state (PagTouCom itself is only ever passed `actions`, not
 * `staAppObj`, for this purpose).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

let pgtNamStr = 'Page Tours'; // What: Page-Tours Name String. Why: canRenFun/forNamFun below need this group's own real, pre-rename name to revert to. How: This starts as the group's own default name, then is overwritten by the renameGroup step's own runFun() (see bldSteFun below) the instant it opens the rename input.



/**
 * canRenFun = Cancel Rename Function
 *
 * @summary
 * Discards a typed rename WITHOUT exiting Edit Mode, used only for a
 * Back to the groupGrip step, which needs Edit Mode to stay on (the
 * renameGroup step's own Done doesn't need this at all, see forNamFun
 * below for why). Resets the input's value back to its real name first
 * so the blur that follows reads as a NO-OP commit (see tab-
 * today.jsx's GroupHeader: commit() only calls onRenameGroup when draft
 * differs from the name prop) instead of an actual rename. Deliberately
 * NOT Escape: GroupHeader's own Escape handling is exactly this (see
 * its cancel()), but a real Escape keydown also bubbles to tab-
 * today.jsx's OWN global window listener, which exits Edit Mode
 * entirely.
 *
 * The blur is deferred a frame, NOT a cosmetic choice. Dispatching the
 * reset 'input' event calls React's onChange (setDraft) synchronously,
 * but that only SCHEDULES the re-render, draft's actual value inside
 * the ALREADY-DEFINED commit() closure doesn't update until React re-
 * renders. Calling blur() in the same tick invokes that same (stale)
 * commit(), reading the pre-reset, still-typed draft, and genuinely
 * renames the group for real. This is not hypothetical: it's exactly
 * how an earlier version of this function (calling blur() synchronously
 * right after dispatch) shipped and broke, Done appeared to discard
 * the rename but actually committed it, then a later run of this same
 * tour could never find "Rename group Page Tours" again since the
 * group's real name no longer matched.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const canRenFun = () => { // What: Cancel Rename Function. Why: A Back out of the renameGroup step must discard whatever was typed without exiting Edit Mode. How: This resets the real input's value to pgtNamStr, then blurs it a frame later so the blur's own commit reads as a no-op.


	const renInpEle = document.querySelector( '.pt-section .group-name-input' ); // What: Rename Input Element. Why: This must only act on the real, currently-open rename input. How: This looks it up fresh, since it may not exist outside Edit Mode.

	if ( !renInpEle ) return; // What: Missing Input Guard. Why: A Back that lands here with the input already gone (never opened, or already closed) has nothing to reset. How: This returns early whenever renInpEle was not found.

	renInpEle.value = pgtNamStr; // What: Input Value Reset. Why: The dispatched 'input' event below must carry the real name, not whatever the user typed. How: This overwrites renInpEle's own value with pgtNamStr.

	renInpEle.dispatchEvent( new Event( 'input', { bubbles : true } ) ); // What: Input Event Dispatch. Why: React's own onChange (setDraft) must see this reset value to update its own draft state. How: This dispatches a bubbling native 'input' event off renInpEle.

	requestAnimationFrame( () => renInpEle.blur() ); // What: Deferred Blur Call. Why: Blurring in the same tick would read the ALREADY-DEFINED commit() closure's own stale, pre-reset draft and genuinely rename the group. How: This defers the blur a frame, after React's own re-render has updated draft to the reset value.


};



/**
 * forNamFun = Force Name Function
 *
 * @summary
 * Forces the real Page Tours name back, used wherever a click (Done,
 * Back, Skip) might have blurred a still-open, typed-in rename input a
 * tick earlier, see each call site's own comment for that race.
 * Deferred a full 200ms, NOT just a frame: GroupHeader's own blur-
 * triggered commit() doesn't call onRenameGroup synchronously either,
 * it defers to its OWN setTimeout(…, 150) (the closing-animation delay
 * in finishClose), so calling this immediately would fire BEFORE that
 * delayed commit and get overwritten right back to the typed value
 * 150ms later. 200ms leaves a safety margin past it.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const forNamFun = ( actions ) => { // What: Force Name Function. Why: A click racing an open rename input's own delayed commit must still end with the group's own real name intact. How: This calls actions.renamePageTours with pgtNamStr, 200ms after this fires.


	setTimeout( () => actions.renamePageTours( pgtNamStr ), 200 ); // What: Deferred Rename Call. Why: This must fire safely after GroupHeader's own 150ms closing-animation commit, not before it. How: This waits 200ms, then renames the group back to pgtNamStr.


};



/**
 * bldSteFun = Build Step Function
 *
 * @summary
 * Steps beyond Step 1 (the nav-highlight every page tour shares, see
 * buildPageTourStep1 above), keyed by page tour id, empty/absent for
 * any page that only has Step 1 so far. Advancing past the last step
 * here falls through GuidedTour's own "ran off the end" safety net
 * into onSkiTouFun, same as every other mini-tour behaved before its
 * own final Done step existed. A function of `actions` (built fresh per
 * render, like buildPageTourStep1), not a static object, the Today
 * branch's own last step needs to call actions.renamePageTours
 * directly (see forNamFun above).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const bldSteFun = ( pagIdeStr, actions ) => { // What: Build Step Function. Why: PagTouCom below needs this page's own full ordered step array beyond Step 1. How: This branches on pagIdeStr, spreading the matching target catalog's entries with this flow's own navigation flags.


	if ( pagIdeStr === 'explore_pickers' ) { // What: Pickers Branch Check. Why: The Pickers tour's own steps only apply to this one page tour. How: This returns its own step array whenever pagIdeStr matches.


		return [ // What: Pickers Tour Steps Return. Why: The caller needs this page tour's own full ordered step array beyond Step 1. How: This returns the Pickers tour's own remaining steps, each spreading PIC_TAR_OBJ's matching entry with this flow's own navigation flags.

			{ ...PIC_TAR_OBJ.groupFilter, tabStr : 'picker', priStr : 'Next', bacBoo : true }, // What: Group Filter Step. Why: This is the Pickers tour's own 2nd step. How: This spreads PIC_TAR_OBJ.groupFilter with this flow's own navigation flags.
			{ ...PIC_TAR_OBJ.typeFilter, tabStr : 'picker', priStr : 'Next', bacBoo : true }, // What: Type Filter Step. Why: This is the Pickers tour's own 3rd step. How: This spreads PIC_TAR_OBJ.typeFilter with this flow's own navigation flags.
			{ ...PIC_TAR_OBJ.createNewPickers, tabStr : 'picker', priStr : 'Next', bacBoo : true }, // What: Create New Pickers Step. Why: This is the Pickers tour's own 4th step. How: This spreads PIC_TAR_OBJ.createNewPickers with this flow's own navigation flags.
			{ ...PIC_TAR_OBJ.pickerSelection, tabStr : 'picker', priStr : 'Next', bacBoo : true }, // What: Picker Selection Step. Why: This is the Pickers tour's own 5th step. How: This spreads PIC_TAR_OBJ.pickerSelection with this flow's own navigation flags.
			{ ...PIC_TAR_OBJ.editPicker, tabStr : 'picker', priStr : 'Next', bacBoo : true }, // What: Edit Picker Step. Why: This is the Pickers tour's own 6th step. How: This spreads PIC_TAR_OBJ.editPicker with this flow's own navigation flags.

			{
				...PIC_TAR_OBJ.manualGeneration, tabStr : 'picker', priStr : 'Next', bacBoo : true, cirBoo : true,
				// .picker-run (stage + actions) can run taller than a short viewport on its own, before Re-roll/Done even render alongside it, same "pin the coach to the top and let the target run off the bottom" reasoning as the Data tour's own tall .data-list step below. Confirmed live: without this, the coach overlapped the real Pick One button on an iPhone SE-sized viewport.
				catBoo : true, // What: Coach At Top Boolean. Why: .picker-run can run taller than a short viewport even before this step's own click. How: GuidedTour skips its own reserve-space math and pins the coach card to the top instead.
				// Pick One kicks off the multi-second spin animation, its result (the addToTodoList step's own target) isn't ready the instant the click fires. Stay on THIS step's own already-resolved coach/highlight for the whole wait instead of advancing into a blank "not found yet" dim. Polls for .pv-act--send specifically (addToTodoList's own cliSelStr, NOT its sel), since .picker-run itself (that step's own sel) already exists the whole time, spin animation included, so polling for that would advance immediately instead of waiting for the pick to actually resolve.
				advSelStr : PIC_TAR_OBJ.addToTodoList.cliSelStr // What: Advance Selector String. Why: This step must hold until the pick actually resolves, not until the next step's own target merely exists. How: GuidedTour polls for this selector before advancing past this step.


			}, // What: Manual Generation Step. Why: This is the Pickers tour's own 7th step, the real Pick One button. How: This spreads PIC_TAR_OBJ.manualGeneration with this flow's own navigation flags plus catBoo/advSelStr.

			{
				...PIC_TAR_OBJ.addToTodoList, tabStr : 'picker', priStr : 'Next', bacBoo : true, cirBoo : true,
				// Same short-viewport reasoning as manualGeneration just above, .picker-run is taller still here (Re-roll/Done now render alongside the stage too).
				catBoo : true, // What: Coach At Top Boolean. Why: .picker-run is taller still on this step, Re-roll/Done now render alongside the stage. How: GuidedTour skips its own reserve-space math and pins the coach card to the top instead.
				// Send to Today swaps its own label to "Sent!" for 1500ms (see sendToToday's own setTimeout in tab-picker.jsx) before reverting, advancing immediately would cut that confirmation off before the user ever sees it. 100ms past that own timer as a safety margin.
				advDelNum : 1600 // What: Advance Delay Number. Why: The "Sent!" confirmation must be visible before this step advances. How: GuidedTour waits this many milliseconds after the click before advancing.


			}, // What: Add To Todo List Step. Why: This is the Pickers tour's own 8th step, the real Send to Today button. How: This spreads PIC_TAR_OBJ.addToTodoList with this flow's own navigation flags plus catBoo/advDelNum.

			{
				...PIC_TAR_OBJ.pickerItems, tabStr : 'picker', priStr : 'Next', bacBoo : true,
				// .pool-items grows with the picker's own item count and can run WAY past a short viewport's height, same reasoning as manualGeneration above.
				catBoo : true // What: Coach At Top Boolean. Why: .pool-items grows with the picker's own item count and can run well past a short viewport. How: GuidedTour skips its own reserve-space math and pins the coach card to the top instead.


			}, // What: Picker Items Step. Why: This is the Pickers tour's own 9th step. How: This spreads PIC_TAR_OBJ.pickerItems with this flow's own navigation flags plus catBoo.

			{ ...PIC_TAR_OBJ.addPickerItem, tabStr : 'picker', priStr : 'Done', bacBoo : true } // What: Add Picker Item Step. Why: This is the Pickers tour's own final step. How: This spreads PIC_TAR_OBJ.addPickerItem with this flow's own navigation flags, priStr 'Done' ending the tour.


		];


	}

	if ( pagIdeStr === 'explore_stats' ) { // What: Stats Branch Check. Why: The Stats tour's own steps only apply to this one page tour. How: This returns its own step array whenever pagIdeStr matches.


		return [ // What: Stats Tour Steps Return. Why: The caller needs this page tour's own full ordered step array beyond Step 1. How: This returns the Stats tour's own remaining steps, each spreading STA_TAR_OBJ's matching entry with this flow's own navigation flags.

			{ ...STA_TAR_OBJ.groupFilter, tabStr : 'stats', priStr : 'Next', bacBoo : true }, // What: Group Filter Step. Why: This is the Stats tour's own 2nd step. How: This spreads STA_TAR_OBJ.groupFilter with this flow's own navigation flags.
			{ ...STA_TAR_OBJ.typeFilter, tabStr : 'stats', priStr : 'Next', bacBoo : true }, // What: Type Filter Step. Why: This is the Stats tour's own 3rd step. How: This spreads STA_TAR_OBJ.typeFilter with this flow's own navigation flags.
			{ ...STA_TAR_OBJ.pickersFilter, tabStr : 'stats', priStr : 'Next', bacBoo : true }, // What: Show Filter Step. Why: This is the Stats tour's own 4th step. How: This spreads STA_TAR_OBJ.pickersFilter with this flow's own navigation flags.
			{ ...STA_TAR_OBJ.rangeFilter, tabStr : 'stats', priStr : 'Next', bacBoo : true }, // What: Range Filter Step. Why: This is the Stats tour's own 5th step. How: This spreads STA_TAR_OBJ.rangeFilter with this flow's own navigation flags.

			{
				...STA_TAR_OBJ.heatmap, tabStr : 'stats', priStr : 'Next', bacBoo : true,
				// .stat-heatmap-card renders a full year's worth of cells and can run FAR past a short viewport's height, same "pin the coach to the top and let the target run off the bottom" reasoning as the Data tour's own tall .data-list step and this tour's own pickerBreakdown step below. Confirmed live: without this, the coach overlapped the top of the heatmap on an iPhone SE-sized viewport.
				catBoo : true, // What: Coach At Top Boolean. Why: .stat-heatmap-card renders a full year's worth of cells and can run far past a short viewport. How: GuidedTour skips its own reserve-space math and pins the coach card to the top instead.

				runFun : () => { // What: Run Function. Why: The pickerBreakdown step's own target only renders once a specific picker is the active scope, so this selects the real sample picker (unhidden for this whole tour, see unhHisFun) before that step ever mounts. How: This clicks the real scope tab matching PRE_PIC_STR.


					const picTabEle = document.querySelector( `.stat-scope-tabs .picker-tab[data-picker-id="${ PRE_PIC_STR }"]` ); // What: Picker Tab Element. Why: This must click the exact tab for the real, preselected sample picker. How: This looks it up fresh via its own data-picker-id attribute.

					if ( picTabEle ) picTabEle.click(); // What: Picker Tab Click. Why: This must only fire when the control actually exists. How: This clicks picTabEle.


				}


			}, // What: Heatmap Step. Why: This is the Stats tour's own 6th step, staging the next step's own single-picker scope. How: This spreads STA_TAR_OBJ.heatmap with this flow's own navigation flags plus catBoo/run.

			{
				...STA_TAR_OBJ.pickerBreakdown, tabStr : 'stats', priStr : 'Done', bacBoo : true,
				// .stat-breakdown-card lists every item in the picker's pool and can run well past a short viewport's height, same as the heatmap step just above. Confirmed live: without this, the coach clipped the top of its own body text and overlapped the card on an iPhone SE-sized viewport.
				catBoo : true, // What: Coach At Top Boolean. Why: .stat-breakdown-card lists every item in the picker's pool and can run past a short viewport. How: GuidedTour skips its own reserve-space math and pins the coach card to the top instead.
				// `scope` (tab-stats.jsx's own local useState, choosing which picker is active) is NOT persisted, a reload always lands back at 'all', so this step's own target wouldn't exist to resume into even though the real sample picker itself stays unhidden (a real, persisted field) across the reload. A reload mid this step falls back to the heatmap step, which is always safe to land on and re-runs the selection on its own next Next click.
				resBoo : false // What: Resumable Boolean. Why: This step's own target only exists because the heatmap step's own runFun() already selected a scope, which a reload does not survive. How: GuidedTour's own resume-persist effect never checkpoints a step whose resBoo is false.


			} // What: Picker Breakdown Step. Why: This is the Stats tour's own final step. How: This spreads STA_TAR_OBJ.pickerBreakdown with this flow's own navigation flags plus catBoo, priStr 'Done' ending the tour.


		];


	}

	if ( pagIdeStr === 'explore_data' ) { // What: Data Branch Check. Why: The Data tour's own steps only apply to this one page tour. How: This returns its own step array whenever pagIdeStr matches.


		return [ // What: Data Tour Steps Return. Why: The caller needs this page tour's own full ordered step array beyond Step 1. How: This returns the Data tour's own remaining steps, each spreading DAT_TAR_OBJ's matching entry with this flow's own navigation flags.

			{ ...DAT_TAR_OBJ.groupFilter, tabStr : 'data', priStr : 'Next', bacBoo : true }, // What: Group Filter Step. Why: This is the Data tour's own 2nd step. How: This spreads DAT_TAR_OBJ.groupFilter with this flow's own navigation flags.
			{ ...DAT_TAR_OBJ.typeFilter, tabStr : 'data', priStr : 'Next', bacBoo : true }, // What: Type Filter Step. Why: This is the Data tour's own 3rd step. How: This spreads DAT_TAR_OBJ.typeFilter with this flow's own navigation flags.
			{ ...DAT_TAR_OBJ.pickersFilter, tabStr : 'data', priStr : 'Next', bacBoo : true }, // What: Show Filter Step. Why: This is the Data tour's own 4th step. How: This spreads DAT_TAR_OBJ.pickersFilter with this flow's own navigation flags.
			{ ...DAT_TAR_OBJ.remindersManager, tabStr : 'data', priStr : 'Next', bacBoo : true }, // What: Reminders Manager Step. Why: This is the Data tour's own 5th step. How: This spreads DAT_TAR_OBJ.remindersManager with this flow's own navigation flags.

			{
				...DAT_TAR_OBJ.pickersManager, tabStr : 'data', priStr : 'Next', bacBoo : true,
				// .data-list > .cat can still union to a rect much taller than the viewport once every picker card renders (6 real disposable copies plus whatever the user has of their own), the normal reserve-space padding would push the target's own bottom edge further past the fold instead of helping, exactly backwards.
				catBoo : true // What: Coach At Top Boolean. Why: The unioned picker/Conditionals/Reminders card rect can run far taller than the viewport once every copy renders. How: GuidedTour skips its own reserve-space math and pins the coach card to the top instead.


			}, // What: Pickers Manager Step. Why: This is the Data tour's own 6th step. How: This spreads DAT_TAR_OBJ.pickersManager with this flow's own navigation flags plus catBoo.

			{ ...DAT_TAR_OBJ.createPicker, tabStr : 'data', priStr : 'Done', bacBoo : true } // What: Create Picker Step. Why: This is the Data tour's own final step. How: This spreads DAT_TAR_OBJ.createPicker with this flow's own navigation flags, priStr 'Done' ending the tour.


		];


	}

	if ( pagIdeStr === 'explore_settings' ) { // What: Settings Branch Check. Why: The Settings tour's own steps only apply to this one page tour. How: This returns its own step array whenever pagIdeStr matches, catBoo on every section but Legal (short enough to fit normally), each of these can be taller than the viewport, same "pin the coach to the top instead of padding the target past the fold" reasoning as the Data tour's own tall .data-list step above.


		return [ // What: Settings Tour Steps Return. Why: The caller needs this page tour's own full ordered step array beyond Step 1. How: This returns the Settings tour's own remaining steps, each spreading SET_TAR_OBJ's matching entry with this flow's own navigation flags.

			{ ...SET_TAR_OBJ.appearance, tabStr : 'settings', priStr : 'Next', bacBoo : true, catBoo : true }, // What: Appearance Step. Why: This is the Settings tour's own 2nd step. How: This spreads SET_TAR_OBJ.appearance with this flow's own navigation flags plus catBoo.
			{ ...SET_TAR_OBJ.daily, tabStr : 'settings', priStr : 'Next', bacBoo : true, catBoo : true }, // What: Daily Generator Step. Why: This is the Settings tour's own 3rd step. How: This spreads SET_TAR_OBJ.daily with this flow's own navigation flags plus catBoo.
			{ ...SET_TAR_OBJ.holidays, tabStr : 'settings', priStr : 'Next', bacBoo : true, catBoo : true }, // What: Holiday Controls Step. Why: This is the Settings tour's own 4th step. How: This spreads SET_TAR_OBJ.holidays with this flow's own navigation flags plus catBoo.
			{ ...SET_TAR_OBJ.data, tabStr : 'settings', priStr : 'Next', bacBoo : true, catBoo : true }, // What: Data Control Step. Why: This is the Settings tour's own 5th step. How: This spreads SET_TAR_OBJ.data with this flow's own navigation flags plus catBoo.
			{ ...SET_TAR_OBJ.about, tabStr : 'settings', priStr : 'Next', bacBoo : true, catBoo : true }, // What: About Step. Why: This is the Settings tour's own 6th step. How: This spreads SET_TAR_OBJ.about with this flow's own navigation flags plus catBoo.
			{ ...SET_TAR_OBJ.legal, tabStr : 'settings', priStr : 'Done', bacBoo : true } // What: Legal Step. Why: This is the Settings tour's own final step, short enough to need no catBoo. How: This spreads SET_TAR_OBJ.legal with this flow's own navigation flags, priStr 'Done' ending the tour.


		];


	}

	if ( pagIdeStr !== 'explore_today' ) return []; // What: Today Fallback Guard. Why: Any page tour not yet handled above (or not this one) has no steps beyond Step 1. How: This returns an empty array whenever pagIdeStr isn't 'explore_today'.

	return [ // What: Today Tour Steps Return. Why: The caller needs this page tour's own full ordered step array beyond Step 1. How: This returns the Today tour's own remaining steps, each spreading TOD_TAR_OBJ's matching entry with this flow's own navigation flags.

		{ ...TOD_TAR_OBJ.progressRing, tabStr : 'today', priStr : 'Next', bacBoo : true }, // What: Progress Ring Step. Why: This is the Today tour's own 2nd step. How: This spreads TOD_TAR_OBJ.progressRing with this flow's own navigation flags.
		{ ...TOD_TAR_OBJ.groupsNav, tabStr : 'today', priStr : 'Next', bacBoo : true }, // What: Groups Nav Step. Why: This is the Today tour's own 3rd step. How: This spreads TOD_TAR_OBJ.groupsNav with this flow's own navigation flags.
		{ ...TOD_TAR_OBJ.editMode, tabStr : 'today', priStr : 'Next', bacBoo : true, cirBoo : true }, // What: Edit Mode Step. Why: This is the Today tour's own 4th step, the real Edit Mode toggle. How: This spreads TOD_TAR_OBJ.editMode with this flow's own navigation flags plus cirBoo.

		{
			...TOD_TAR_OBJ.groupGrip, tabStr : 'today', priStr : 'Next', bacBoo : true,
			// Edit Mode is local, unpersisted UI state (tab-today.jsx's own useState, not part of `staAppObj`), a reload always lands back with it off, so this step's own target (only rendered while Edit Mode is on) wouldn't exist to resume into.
			resBoo : false, // What: Resumable Boolean. Why: This step's own target only exists while Edit Mode is on, which a reload does not survive. How: GuidedTour's own resume-persist effect never checkpoints a step whose resBoo is false.

			runFun : () => { // What: Run Function. Why: The renameGroup step's own target (the Page Tours group's rename input) needs staging by a real click before that step ever mounts, same real-UI-driving pattern used throughout the Picker/Reminder tours. How: This clicks the Page Tours group's own rename button, captures its real name first, then focuses the resulting input a frame later.


				// Found via .pt-section (see tab-today.jsx), not by matching the aria-label's current name text, a user who's already renamed Page Tours themselves, entirely outside any tour, would otherwise make this selector (and the whole rest of the step) silently never match again.
				const renButEle = document.querySelector( '.pt-section button.group-name--editable' ); // What: Rename Button Element. Why: This is the real control that opens the rename input this step highlights. How: This looks it up fresh, since it only exists while Edit Mode is on.

				if ( renButEle ) { // What: Rename Button Existence Check. Why: This must only act on a real, currently-rendered button. How: This branches on whether renButEle was found.


					pgtNamStr = ( renButEle.getAttribute( 'aria-label' ) || '' ).replace( /^Rename group /, '' ) || 'Page Tours'; // What: Page-Tours Name Capture. Why: canRenFun/forNamFun both need this group's own real name to revert to later. How: This strips the "Rename group " prefix off the button's own aria-label, falling back to the default name.

					renButEle.click(); // What: Rename Button Click. Why: This is the real click that opens the rename input, mirroring what a user clicking the button themselves would do. How: This clicks renButEle.


				}

				requestAnimationFrame( () => { // What: Deferred Focus Call. Why: The click's own re-render must have actually mounted the input before this can focus it. How: This runs a frame after the click above, well after React's own commit.


					const renInpEle = document.querySelector( '.pt-section .group-name-input' ); // What: Rename Input Element. Why: This is the real input this step highlights and needs focused. How: This looks it up fresh, since it only exists once the rename button above has been clicked.

					if ( renInpEle ) renInpEle.focus({ preventScroll : true } ); // What: Rename Input Focus. Why: Explicit focus alongside the input's own autoFocus is belt-and-suspenders, since the click driving it here is synthetic, not a direct user click on the rename button itself. How: This focuses renInpEle without scrolling the page.


				});


			}


		}, // What: Group Grip Step. Why: This is the Today tour's own 5th step, staging the next step's own rename input. How: This spreads TOD_TAR_OBJ.groupGrip with this flow's own navigation flags plus resBoo/runFun.

		{
			...TOD_TAR_OBJ.renameGroup, tabStr : 'today', priStr : 'Done', bacBoo : true,
			// Same as the groupGrip step's own resBoo:false, this step's target depends on BOTH Edit Mode being on AND that step's own runFun() having already clicked the rename button open, neither of which survives a reload.
			resBoo : false, // What: Resumable Boolean. Why: This step's own target depends on Edit Mode being on and the previous step's own click, neither of which survives a reload. How: GuidedTour's own resume-persist effect never checkpoints a step whose resBoo is false.

			runFun : () => { // What: Run Function. Why: Edit Mode's own real Cancel control alone isn't enough to discard an in-progress rename, since clicking this step's own Done button can itself race-commit a real rename first. How: This clicks the real Cancel control, then forces the real Page Tours name back afterward regardless of what the DOM did.


				// Edit Mode's own real Cancel control discards any group reordering AND closes the rename input, GroupHeader force-closes `editing` the instant editMode itself goes false. That's still not enough on its own, though: clicking this step's own Done button (a totally different element) blurs the currently-focused rename input FIRST, as an intrinsic part of the click's own focus-change handling, which happens before React's onClick (and therefore this runFun()) ever fires, and that blur's own commit() genuinely renames the group for real if the user typed something. There's no way to intercept that ordering from here, so this doesn't try to, it just forces the real name back afterward directly, via the same action a real rename commit would have called. A harmless no-op if nothing was ever typed.
				const canButEle = document.querySelector( '.editmode-banner-actions .btn--ghost' ); // What: Cancel Button Element. Why: This is the real control that discards any group reordering and closes the rename input. How: This looks it up fresh, since it only exists while Edit Mode is on.

				if ( canButEle ) canButEle.click(); // What: Cancel Button Click. Why: This must only fire when the control actually exists. How: This clicks canButEle.

				forNamFun( actions ); // What: Force Name Call. Why: The click above (and Done's own blur race) might still leave the group's real name overwritten. How: This forces the real pgtNamStr back, 200ms after this fires.


			}


		} // What: Rename Group Step. Why: This is the Today tour's own final step. How: This spreads TOD_TAR_OBJ.renameGroup with this flow's own navigation flags plus resBoo/runFun, priStr 'Done' ending the tour.


	];


};



// #region PagTouCom

/**
 * PagTouCom = Page Tour Component
 *
 * @summary
 * Renders whichever piece of one page's own mini-tour is currently
 * relevant: the intro modal, or the running GuidedTour. Mounted at the
 * app level (see app.jsx's own actPagStr), reads real persisted
 * staAppObj and calls real actions.* methods (see store.jsx), and
 * reads/writes emlTouObj's own bus fields for the Pickers tour's own
 * onBacTouFun handling below.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.pagIdeStr   - Page Identifier String: This page tour's own
 *                            checklist id (e.g. 'explore_today'), keying
 *                            PAG_COP_OBJ and bldSteFun.
 * @param props.staAppObj   - State App Object: The entire app's own
 *                            persisted state.
 * @param props.actions     - Actions: The actions that mutate
 *                            props.staAppObj.
 * @param props.actIdeStr   - Active Identifier String: The app's own currently
 *                            active tab id.
 * @param props.selTabFun   - Select Tab Function: Switches the app's own
 *                            active tab.
 * @param props.onCloTouFun - On Close Tour Function: Clears app.jsx's own
 *                            actPagStr, ending this mount.
 *
 * @returns Either the intro modal (touPhaStr 'intro') or the running
 * guided tour (touPhaStr 'tour'), depending on this page's own phase.
 *
 * @example
 * ```tsx
 * PagTouCom({ pagIdeStr, staAppObj, actions, actIdeStr, selTabFun, ... })
 * // => <PagTouCom />
 * ```
 *
*/

function PagTouCom ( { pagIdeStr, staAppObj, actions, actIdeStr, selTabFun, onCloTouFun } ) {


	const tourRecObj = OB_PAGE_TOURS.find( ( curTouObj ) => curTouObj.id === pagIdeStr ); // What: Tour Record Object. Why: This page's own real page key/label are read off its own OB_PAGE_TOURS manifest entry. How: This searches OB_PAGE_TOURS for the entry whose own id matches pagIdeStr.
	const navTarObj = NAV_TAR_OBJ[ tourRecObj.page ]; // What: Nav Target Object. Why: The intro modal's own fallback titStr/bodEle come from the shared nav-button catalog. How: This looks up NAV_TAR_OBJ by tourRecObj's own page.
	const pagCopObj = PAG_COP_OBJ[ pagIdeStr ]; // What: Page Copy Object. Why: The intro modal's own title/body/pills prefer this page's own dedicated copy when it has one. How: This looks up PAG_COP_OBJ by pagIdeStr.



	const onbStaObj = staAppObj.onboarding || {}; // What: Onboarding State Object. Why: A reload lands here with tab-today.jsx's own activeMiniTour already re-derived from this SAME persisted activeTour, so this just decides whether to skip the intro modal and which (resBoo) step to land on. How: This reads staAppObj.onboarding, falling back to an empty object.
	const resTouObj = onbStaObj.activeTour && onbStaObj.activeTour.id === `page-${ pagIdeStr }` ? onbStaObj.activeTour : null; // What: Resume Tour Object. Why: See onboarding-tour-runner.jsx's own resBoo field doc comment for why this is a checkpoint, not necessarily the exact step the user was last on. How: This reads onbStaObj.activeTour back out only when its own id matches this page's own tourId, otherwise null.
	const [ touPhaStr, setTouPhaStr ] = React.useState( resTouObj ? 'tour' : 'intro' ); // What: Tour Phase String And Setter. Why: This is the mini-tour's own top-level position, 'intro' (the modal showing) or 'tour' (GuidedTour running). How: This starts on 'tour' whenever resTouObj says a tour was left running, otherwise 'intro'.



	const cloTouFun = ( staValStr ) => { // What: Close Tour Function. Why: Discards this tour's own disposable sample copies/borrowed history the moment it ends, however it ends, harmless no-op paths included. How: This branches on pagIdeStr to run whichever cleanup that page's own tour needs, then updates the checklist and calls onCloTouFun.


		if ( neeCopFun( pagIdeStr ) ) clePicFun( actions ); // What: Picker Copy Cleanup Call. Why: The Pickers/Data tours must never leave a disposable picker copy behind. How: This calls clePicFun whenever neeCopFun says this page needed copies.

		else if ( pagIdeStr === 'explore_stats' ) hidHisFun( actions ); // What: Sample History Hide Call. Why: The Stats tour must re-hide the real samples it borrowed. How: This calls hidHisFun only for the Stats page.

		if ( pagIdeStr === 'explore_data' ) cleTasFun( actions ); // What: Task Copy Cleanup Call. Why: The Data tour must never leave a disposable reminder copy behind. How: This calls cleTasFun only for the Data page.

		actions.setChecklistItem( pagIdeStr, { status : staValStr } ); // What: Checklist Status Update Call. Why: This page's own Today launcher card reads this to know whether to keep showing itself. How: This updates this page's own checklist entry to staValStr.

		onCloTouFun(); // What: On Close Call. Why: app.jsx's own actPagStr must be cleared however this tour ends. How: This calls the onCloTouFun prop passed down from app.jsx.


	};



	if ( touPhaStr === 'intro' ) { // What: Intro Phase Check. Why: The intro modal must show before any spotlight step ever does. How: This returns IntModCom below whenever touPhaStr is 'intro'.


		return (

			<IntModCom
				icoTopEle={ <IcoSvgCom name={ tourRecObj.page } size={ 54 } /> }
				titHeaStr={ ( pagCopObj && pagCopObj.titStr ) || navTarObj.titStr }
				parEleArr={ [ ( pagCopObj && pagCopObj.bodEle ) || navTarObj.bodEle ] }
				pilLabArr={ ( pagCopObj && pagCopObj.pilArr ) || [ 'page tour', tourRecObj.label.toLowerCase() ] }
				onBegTouFun={ () => setTouPhaStr( 'tour' ) }
				onSkiTouFun={ () => cloTouFun( 'cancelled' ) } // What: On Skip Handler. Why: This mirrors the launcher card's own X button exactly, marking the card cancelled without touching the underlying page. How: This calls cloTouFun with 'cancelled'.
			/> // What: Tutorial Intro Modal Element. Why: This is this page's own opening screen, shown before any spotlight step ever does. How: This is passed this page's own icon/title/paragraphs/pills and the onBegTouFun/onSkiTouFun handlers above.


		);


	}



	return (


		<GuidedTour
			touIdeStr={ `page-${ pagIdeStr }` }
			steObjArr={ [
				buildPageTourStep1( tourRecObj.page,
					pagIdeStr === 'explore_data' ? () => { seePicFun( staAppObj, actions ); seeTasFun( staAppObj, actions ); } : // What: Data Run Branch. Why: The Data tour's own Step 1 must seed BOTH disposable picker and reminder copies before its later steps can point at them. How: This calls both seePicFun and seeTasFun when pagIdeStr is 'explore_data'.
					neeCopFun( pagIdeStr ) ? () => seePicFun( staAppObj, actions ) : // What: Pickers Run Branch. Why: The Pickers tour's own Step 1 only needs disposable picker copies. How: This calls seePicFun when neeCopFun says this page needs copies.
					pagIdeStr === 'explore_stats' ? () => unhHisFun( staAppObj, actions ) : // What: Stats Run Branch. Why: The Stats tour's own Step 1 instead needs the real samples unhidden. How: This calls unhHisFun when pagIdeStr is 'explore_stats'.
					undefined, // What: Default Run Branch. Why: Today/Settings touch neither pickers nor reminders, so Step 1 needs no side effect at all. How: This passes undefined as buildPageTourStep1's own runSteFun for every other page.
					'Next',
					tourRecObj.label ),
				...bldSteFun( pagIdeStr, actions )
			] }
			resSteNum={ resTouObj ? resTouObj.step : 0 }
			actStoObj={ actions }
			actIdeStr={ actIdeStr }
			selTabFun={ selTabFun }
			onBacTouFun={ ( tarSteNum ) => { // What: On Go Back Handler. Why: A real, one-way UI transition (the Pickers tour's own pick animation, or Today's own Edit Mode) must be reversed by a real control so a Back finds its target step's own selector again. How: This branches on pagIdeStr first, then on tarSteNum, driving whichever real DOM control or bus nonce reverses that specific transition.


				if ( pagIdeStr === 'explore_pickers' ) { // What: Pickers Back Branch Check. Why: Only the Pickers tour's own steps have this one-way pick-animation state to reverse. How: This branches on pagIdeStr matching 'explore_pickers'.


					if ( tarSteNum === 3 ) { // What: Add Tab Scroll Check. Why: Back from Picker Selection to Create New Pickers must undo Picker Selection's own scroll-into-view, which can scroll .picker-tabs rightward past the Add tab (the first tab in the row) if there are enough pickers to overflow it. How: This scrolls .picker-tabs back to its own left edge.


						const tabRowEle = document.querySelector( '.picker-tabs' ); // What: Tab Row Element. Why: This is the real, horizontally-scrollable strip that needs resetting. How: This looks it up fresh, since it only exists on the Pickers tab.

						if ( tabRowEle ) tabRowEle.scrollTo({ left : 0 } ); // What: Tab Row Scroll Reset. Why: This must only fire when the row actually exists. How: This scrolls tabRowEle back to its own left edge.


					}

					else if ( tarSteNum === 5 ) { // What: Manual Generation Reset Check. Why: Back from Manual Generation to Edit Picker (tarSteNum 5 is reached only by backing out of the step whose own target is manualGeneration) needs any still-spinning pick animation cancelled, so it doesn't settle into a 'done' result behind the tour's back. How: This bumps the Pickers tour's own reset nonce on the shared bus.


						emlTouObj.set({ pickerTourResetNonce : ( emlTouObj.get().pickerTourResetNonce || 0 ) + 1 } ); // What: Reset Nonce Publish. Why: tab-picker.jsx's own PickerStrip only renders while phase is 'running'/'done', so bumping this unmounts it immediately, actually cancelling the in-flight animation instead of leaving it to finish on its own. How: This increments the bus's own current pickerTourResetNonce by 1.


					}

					else if ( tarSteNum === 6 ) { // What: Add To Todo List Reset Check. Why: Back from Add To Todo List to Manual Generation needs PickerView's own local phase reset back to idle, otherwise a leftover 'done'/'sent' phase would let Re-roll/Done show on a step that was never written to expect them. How: This bumps the same reset nonce as the tarSteNum === 5 branch above.


						emlTouObj.set({ pickerTourResetNonce : ( emlTouObj.get().pickerTourResetNonce || 0 ) + 1 } ); // What: Reset Nonce Publish. Why: Same reasoning as the tarSteNum === 5 branch above, PickerStrip must unmount so only Pick One shows again. How: This increments the bus's own current pickerTourResetNonce by 1.


					}

					else if ( tarSteNum === 7 ) { // What: Picker Items Redo Check. Why: Back from Picker Items to Add To Todo List needs a real 'done' result synthesized, that step's own target (.pv-act--send) only exists while phase is 'done'/'sent', and by the time this fires the advDelNum wait has already let it revert to idle. How: This bumps a SEPARATE bus nonce telling PickerView to synthesize a result directly, skipping the spin animation since this is a revisit.


						emlTouObj.set({ pickerTourRedoNonce : ( emlTouObj.get().pickerTourRedoNonce || 0 ) + 1 } ); // What: Redo Nonce Publish. Why: Unlike a plain reset, this step NEEDS a real 'done' result to show Send to Today at all. How: This increments the bus's own current pickerTourRedoNonce by 1.


					}

					return; // What: Pickers Branch Return. Why: Nothing below this point applies to the Pickers tour. How: This exits onBacTouFun once the branch above has run.


				}

				if ( pagIdeStr !== 'explore_today' ) return; // What: Today Branch Guard. Why: Only the Today tour's own steps have Edit Mode/rename state to reverse. How: This returns early whenever pagIdeStr isn't 'explore_today'.

				if ( tarSteNum === 3 ) { // What: Edit Mode Toggle Check. Why: Back from Group Grip to Edit Mode must toggle Edit Mode back off via its own real control, since the .foot-editmode target only exists while it's off. How: This clicks whichever real Edit Mode toggle/Cancel control is currently visible.


					const butEdmEle = document.querySelector( '.em-rail-btn.is-on' ) || document.querySelector( '.today-foot-actions .btn--ghost' ); // What: Edit Mode Button Element. Why: Desktop's own toggle always exists and flips itself regardless of state, mobile's own footer swaps to Cancel/Done buttons instead of keeping .foot-editmode. How: This looks up whichever control is currently present.

					if ( butEdmEle ) butEdmEle.click(); // What: Edit Mode Button Click. Why: This must only fire when a control actually exists. How: This clicks butEdmEle.


				}

				else if ( tarSteNum === 4 ) { // What: Rename Cancel Check. Why: Back from Rename Group to Group Grip must discard the in-progress rename WITHOUT exiting Edit Mode. How: This calls canRenFun, then forces the real name back afterward regardless of what the DOM did.


					canRenFun(); // What: Cancel Rename Call. Why: See canRenFun's own doc comment for why this can't just be an Escape keydown. How: This resets the real rename input's value and defers its own blur a frame.

					forNamFun( actions ); // What: Force Name Call. Why: Clicking Back is ALSO a click on a different element than the input, which can blur-and-commit a real rename before this handler even runs. How: This forces the real pgtNamStr back, 200ms after this fires.


				}


			} }
			onSkiTouFun={ () => { // What: On Skip Handler. Why: Skip can fire mid-Edit-Mode too, so any open rename input and any active Edit Mode session both need reverting before this tour actually closes. How: This forces the real name back if a rename input is open, clicks the real Cancel control if Edit Mode is on, then calls cloTouFun.


				if ( document.querySelector( '.pt-section .group-name-input' ) ) forNamFun( actions ); // What: Open Rename Guard. Why: The same blur-races-the-click risk as a real Done click applies here too, clicking Skip is ALSO a click on a different element than the input. How: This forces the real name back only when the rename input is actually still open.

				const canButEle = document.querySelector( '.editmode-banner-actions .btn--ghost' ); // What: Cancel Button Element. Why: This reverts any group reordering, a harmless no-op if Edit Mode was never entered, since the banner/button won't exist. How: This looks it up fresh, since it only exists while Edit Mode is on.

				if ( canButEle ) canButEle.click(); // What: Cancel Button Click. Why: This must only fire when the control actually exists. How: This clicks canButEle.

				cloTouFun( 'skipped' ); // What: Close Tour Call. Why: This funnels Skip through the same cleanup any other exit path off this tour uses. How: This clears the disposable copies/borrowed history, updates the checklist to 'skipped', and calls onCloTouFun.


			} }
			onFinTouFun={ () => cloTouFun( 'finished' ) } // What: On Finish Handler. Why: This only fires from a step's own cirBoo priStr 'Done'. How: This calls cloTouFun with 'finished'.
		/> // What: Guided Tour Element. Why: This is the actual running spotlight walkthrough for this page, mounted once its own intro modal has been accepted or resumed into. How: This is passed this page's own touIdeStr, step array, and the resume/lifecycle plumbing above.


	);


}

// #endregion PagTouCom



export { PagTouCom, buildPageTourStep1 }; // What: Named Exports. Why: app.jsx renders PagTouCom directly, and onboarding-app-features.jsx reuses buildPageTourStep1 verbatim for its own App Features tours. How: This re-exports both bindings unchanged from their own module.


