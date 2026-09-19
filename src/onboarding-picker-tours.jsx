


// #region Imports

import React from 'react'; // What: React. Why: This file's own PicTouCom component needs React in scope to compile its JSX and to call React.useState. How: This is used directly (React.useState) below, instead of importing individual named hooks.


import { emlTouObj        } from './eml-tour-bus.js';            // What: Ease My Life Tour Object. Why: This publishes the running tour's prefill data for the real create-picker form and clears it again on every exit path. How: This is written to via .set() in buiNewFun's/buiAddFun's own runFun() and cloTouFun below, and read via .get() inside GuidedTour's own onBacTouFun handler.
import { GuidedTour       } from './onboarding-tour-runner.jsx'; // What: Guided Tour. Why: This is the generic spotlight-tour engine that actually drives this picker mini-tour once its own intro modal is accepted. How: This is rendered while touPhaStr is 'tour', passed this file's own per-picker step array.
import { IcoSvgCom        } from './ui.jsx';                     // What: Icon Svg Component. Why: The intro modal needs a recognizable glyph identifying this as a picker tutorial. How: This is rendered inside the intro modal's icon prop below.
import { IntModCom        } from './onboarding-intro-modal.jsx'; // What: Intro Modal Component. Why: Each picker mini-tour opens on this generic intro modal before any spotlight step ever shows. How: This is rendered while touPhaStr is 'intro', passed this picker's own icon/title/paragraphs/pills.
import { MODES            } from './seed.js';                    // What: Modes. Why: The intro modal's own pill needs this picker's own mode label, not its raw mode key. How: This is looked up by picRecObj's own mode to resolve modLabStr below.
import { NAV_TAR_OBJ      } from './onboarding-targets.jsx';     // What: Nav Target Object. Why: Step 1's own body copy is kept in sync with the Pickers page tour's own Step 1, which is built from this object. How: This is not referenced directly in this file's own code, only in NAV_STE_OBJ's own comment explaining that copy-sync relationship; left as an unused import, matching this pass's treatment of other currently-unused bindings elsewhere in this codebase.
import { OB_EXAMPLE       } from './onboarding-seed-data.js';    // What: Onboarding Example. Why: This is the "Daily Chores" sample picker's own template, one of the entries PIC_SAM_OBJ below indexes by id. How: This is spread into PIC_SAM_OBJ's own source array below.
import { OB_EXTRA_PICKERS } from './onboarding-seed-data.js';    // What: Onboarding Extra Pickers. Why: This is every OTHER sample picker's own template, alongside OB_EXAMPLE the full set PIC_SAM_OBJ below indexes by id. How: This is spread into PIC_SAM_OBJ's own source array below.

// #endregion Imports



/**
 * onboarding-picker-tours.jsx = Onboarding Picker Tours
 *
 * @summary
 * Content for the picker mini-tours ("Set up a {picker name} picker"),
 * launched by Play on each still-hidden sample picker's own launcher
 * card (see tab-today.jsx's own startMiniTour, EntryCard's own
 * entry.kind === 'tutorial' branch). Every one of these tours shares
 * the exact same intro-modal structure and first paragraph (FIR_PAR_ELE
 * below); only the title (the picker's own name) and the second
 * paragraph differ per picker, keyed by the sample picker's own id (see
 * onboarding-seed-data.js's own OB_EXAMPLE/OB_EXTRA_PICKERS).
 *
 * A tour's own step count and shape vary by the sample picker's own
 * mode: the Soonest/Latest steps only exist for an ease-up/ease-down
 * sample, the Weight step only for weighted/dynamic, and the Boost
 * step only for dynamic. See PicTouCom's own isaEasBoo/useWeiBoo/
 * isaDynBoo below for that gating.
 *
 * Mounted at the app level (see app.jsx's own actPicStr), not inside
 * TabToday the way the reminder mini-tours are: Step 1 navigates to
 * the Pickers tab, which would unmount TabToday (and this tour along
 * with it) if it lived there instead. actIdeStr/selTabFun passed into
 * PicTouCom below are therefore the real app-wide ones, not stubs.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



/**
 * PIC_SAM_OBJ = Picker Sample Object
 *
 * @summary
 * Every sample picker's own template data, keyed by id. This IS the
 * exact shape NewPickerForm's own initial prop expects (name/group/
 * mode/items/step), and unlike the reminder samples, nothing seeds a
 * picker with per-field overrides at tour time (see onboarding.jsx's
 * own seeding effect: pickers are added from these templates
 * verbatim), so reading the static template here is safe. There is no
 * live-vs-template divergence to worry about the way the reminder
 * tours had to for daysOfWeek.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const PIC_SAM_OBJ = Object.fromEntries( [ OB_EXAMPLE, ...OB_EXTRA_PICKERS ].map( ( curPicObj ) => [ curPicObj.id, curPicObj ] ) ); // What: Picker Sample Object. Why: Every step below that needs this sample's own template data (name/group/mode/items/step) reads it from here. How: This maps OB_EXAMPLE plus every OB_EXTRA_PICKERS entry down to a [id, template] pair, then folds those pairs into one object.



const FIR_PAR_ELE = <>Pickers are where the magic happens. They have rules for when and how they should pick from its list of items. There are 5 basic types of pickers: Truly Random, Weighted, Dynamic Weighted, Ease Up and Ease Down. Don’t worry too much about the details right now, as you start to use the app it will become more clear.</>; // What: First Paragraph Element. Why: This is the intro modal's shared opening paragraph, identical for every picker mini-tour. How: This is passed as the first entry of IntModCom's own parEleArr prop in the render below.



/**
 * PIC_COP_OBJ = Picker Copy Object
 *
 * @summary
 * Content for the picker mini-tours ("Set up a {picker name} picker"),
 * keyed by the sample picker's own id (see onboarding-seed-data.js's
 * own OB_EXAMPLE/OB_EXTRA_PICKERS). preStr is the name Step 7's own
 * runFun() stages for the tour's own added item (see buiAddFun below), a
 * new item distinct from anything already in that sample's own pool,
 * themed to fit. bodEle/preStr for every non-daily sample here is a
 * first pass, not yet manually verified live the way Daily Chores' own
 * tour was; expect touch-ups once each one gets its own dedicated
 * pass.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const PIC_COP_OBJ = { // What: Picker Copy Object. Why: Every picker mini-tour's own second intro paragraph, item prefill, and any per-step body override lives here, one entry per sample picker id. How: This is looked up by picIdeStr everywhere a step or the intro modal needs picker-specific copy.


	pkr_ob_coffee : {


		preStr : 'Peppermint Mocha', // What: Prefill String. Why: Step 7's own runFun() stages this as the tour's own added item's name. How: This is read as picCopObj.preStr inside buiAddFun's runFun() below.

		bodEle : <>This tutorial will guide you through creating a Coffee Creamer picker. This type of picker is a Dynamic Weighted and is <b>perfect for randomly choosing something, while also making sure that every item is eventually picked and for prioritizing certain items over others</b>. e.g. "Caramel" starts out more likely to be picked than "Cinnamon", but the longer "Cinnamon" goes unpicked the more its odds increase, until it’s eventually chosen and its odds reset. Let’s create one of these now.</> // What: Body Element. Why: This sample's own second intro paragraph explains what a Coffee Creamer picker is. How: This is rendered as the second entry of IntModCom's own parEleArr prop.


	},

	pkr_ob_daily : {


		preStr : 'Mop the floors', // What: Prefill String. Why: Step 7's own runFun() stages this as the tour's own added item's name. How: This is read as picCopObj.preStr inside buiAddFun's runFun() below.

		bodEle : <>This tutorial will guide you through creating a Daily Chores picker. This type of picker is an Ease Up and is <b>perfect for something like chore tasks where you don’t want an item to be picked twice within, say, 1 week</b>. e.g. once it picks "Do the laundry", you don’t want that task picked again for at least 1 week but also no later than 2 weeks. Let’s create one of these now.</> // What: Body Element. Why: This sample's own second intro paragraph explains what a Daily Chores picker is. How: This is rendered as the second entry of IntModCom's own parEleArr prop.


	},

	pkr_ob_dinner : {


		preStr : 'Grilled salmon', // What: Prefill String. Why: Step 7's own runFun() stages this as the tour's own added item's name. How: This is read as picCopObj.preStr inside buiAddFun's runFun() below.

		bodEle : <>This tutorial will guide you through creating a Dinner picker. This type of picker is an Ease Up and is <b>perfect for something like meals where you don’t want an item to be picked twice within, say, 1 week</b>. e.g. once it picks "Spaghetti and meatballs", you don’t want that meal picked again for at least 1 week but also no later than 2 weeks. Let’s create one of these now.</>, // What: Body Element. Why: This sample's own second intro paragraph explains what a Dinner picker is. How: This is rendered as the second entry of IntModCom's own parEleArr prop.
		latEle : <>This controls the <b>maximum number of days that a meal item must wait before it should be picked again</b>. This is also useful since you usually want a meal to be picked again within a certain timeframe.</>,                                                                                                                                                                               // What: Latest Element. Why: This overrides buiLatFun's own default body with meal-specific wording. How: This is read as picCopObj.latEle inside buiLatFun below, falling back to DEF_LAT_ELE when absent.
		namEle : <>This is the name of the meal item and is <b>what will show up in your todo list if it is picked</b>. We’ve already filled this out for you but feel free to customize it to whatever you’d prefer.</>,                                                                                                                                                                                          // What: Name Element. Why: This overrides buiNamFun's own default body with meal-specific wording. How: This is read as picCopObj.namEle inside buiNamFun below, falling back to DEF_NAM_ELE when absent.
		sooEle : <>This controls the <b>minimum number of days that a meal item must wait before it becomes eligible to be picked again</b>. This is useful since you do not usually want the same meal to be chosen again within a certain timeframe.</>                                                                                                                                                          // What: Soonest Element. Why: This overrides buiSooFun's own default body with meal-specific wording. How: This is read as picCopObj.sooEle inside buiSooFun below, falling back to DEF_SOO_ELE when absent.


	},

	pkr_ob_monthly : {


		latNum : 62,                 // What: Latest Number. Why: Same reasoning as sooNum, for the slow end of this item's own drift band. How: This is read as picCopObj.latNum inside buiAddFun's runFun() below, converted into itemEaseMin there.
		preStr : 'Wash the windows', // What: Prefill String. Why: Step 7's own runFun() stages this as the tour's own added item's name. How: This is read as picCopObj.preStr inside buiAddFun's runFun() below.
		sooNum : 31,                 // What: Soonest Number. Why: This overrides the generic 7/14-day default drift band for just this tour's own added item; a monthly-cadence picker's own sample item should look the part instead of a daily/weekly one. How: This is read as picCopObj.sooNum inside buiAddFun's runFun() below, converted into itemEaseMax there.

		bodEle : <>This tutorial will guide you through creating a Monthly Chores picker. This type of picker is an Ease Up and is <b>perfect for something like chore tasks where you don’t want an item to be picked twice within, say, 1 month</b>. e.g. once it picks "Deep clean the oven", you don’t want that task picked again for at least 1 month but also no later than 2 months. Let’s create one of these now.</>, // What: Body Element. Why: This sample's own second intro paragraph explains what a Monthly Chores picker is. How: This is rendered as the second entry of IntModCom's own parEleArr prop.
		sooEle : <>This controls the <b>minimum number of days that a task item must wait before it becomes eligible to be picked again</b>. This is useful since most chores do not usually need to be done again within a certain timeframe.</>                                                                                                                                                                               // What: Soonest Element. Why: This overrides buiSooFun's own default body with monthly-specific wording. How: This is read as picCopObj.sooEle inside buiSooFun below, falling back to DEF_SOO_ELE when absent.


	},

	pkr_ob_relax : {


		latNum : 5,            // What: Latest Number. Why: Same reasoning as sooNum, for the slow end of this item's own decay band. How: This is read as picCopObj.latNum inside buiAddFun's runFun() below, converted into itemEaseMin there.
		preStr : 'Take a nap', // What: Prefill String. Why: Step 7's own runFun() stages this as the tour's own added item's name. How: This is read as picCopObj.preStr inside buiAddFun's runFun() below.
		sooNum : 3,            // What: Soonest Number. Why: This overrides the generic 7/14-day default decay band; a Relax picker's own sample item should stick around on a shorter cadence. How: This is read as picCopObj.sooNum inside buiAddFun's runFun() below, converted into itemEaseMax there.

		bodEle : <>This tutorial will guide you through creating a Relax picker. This type of picker is an Ease Down and is <b>perfect for activities you want to stick with for a few days at a time instead of changing every day</b>. e.g. once it picks "Read a book", that activity will stay as the picked item for at least 5 days but no more than a week before a new activity is chosen. Let’s create one of these now.</>, // What: Body Element. Why: This sample's own second intro paragraph explains what a Relax picker is. How: This is rendered as the second entry of IntModCom's own parEleArr prop.
		latEle : <>This controls the <b>maximum number of days that an activity item will stay picked before it discharges</b> and another item is picked. This is also useful since most activities you don’t want to stay picked past a certain timeframe.</>,                                                                                                                                                                      // What: Latest Element. Why: This overrides buiLatFun's own default body with Ease Down/activity-specific wording. How: This is read as picCopObj.latEle inside buiLatFun below, falling back to DEF_LAT_ELE when absent.
		namEle : <>This is the name of the activity item and is <b>what will show up in your todo list if it is picked</b>. We’ve already filled this out for you but feel free to customize it to whatever you’d prefer.</>,                                                                                                                                                                                                         // What: Name Element. Why: This overrides buiNamFun's own default body with activity-specific wording. How: This is read as picCopObj.namEle inside buiNamFun below, falling back to DEF_NAM_ELE when absent.
		sooEle : <>This controls the <b>minimum number of days that an activity item will stay picked before it discharges</b> and another item is picked. This is useful since most activities you want to stick with for a certain timeframe instead of changing every day.</>                                                                                                                                                      // What: Soonest Element. Why: This overrides buiSooFun's own default body with Ease Down/activity-specific wording. How: This is read as picCopObj.sooEle inside buiSooFun below, falling back to DEF_SOO_ELE when absent.


	},

	pkr_ob_workouts : {


		latNum : 6,        // What: Latest Number. Why: Same reasoning as sooNum, for the slow end of this item's own drift band. How: This is read as picCopObj.latNum inside buiAddFun's runFun() below, converted into itemEaseMin there.
		preStr : 'Cardio', // What: Prefill String. Why: Step 7's own runFun() stages this as the tour's own added item's name. How: This is read as picCopObj.preStr inside buiAddFun's runFun() below.
		sooNum : 3,        // What: Soonest Number. Why: This overrides the generic 7/14-day default drift band; a workout picker's own sample item should recharge on a much shorter cadence. How: This is read as picCopObj.sooNum inside buiAddFun's runFun() below, converted into itemEaseMax there.

		bodEle : <>This tutorial will guide you through creating a Workouts picker. This type of picker is an Ease Up and is <b>perfect for something like workouts where you don’t want the same workout to be picked twice within, say, a few days</b>. e.g. once it picks "Chest", you don’t want that workout item picked again for at least 5 days but also no later than a week. Let’s create one of these now.</>, // What: Body Element. Why: This sample's own second intro paragraph explains what a Workouts picker is. How: This is rendered as the second entry of IntModCom's own parEleArr prop.
		latEle : <>This controls the <b>maximum number of days that a workout item must wait before it should be picked again</b>. This is also useful since you usually want a workout to be picked again within a certain timeframe.</>,                                                                                                                                                                                // What: Latest Element. Why: This overrides buiLatFun's own default body with workout-specific wording. How: This is read as picCopObj.latEle inside buiLatFun below, falling back to DEF_LAT_ELE when absent.
		namEle : <>This is the name of the workout item and is <b>what will show up in your todo list if it is picked</b>. We’ve already filled this out for you but feel free to customize it to whatever you’d prefer.</>,                                                                                                                                                                                              // What: Name Element. Why: This overrides buiNamFun's own default body with workout-specific wording. How: This is read as picCopObj.namEle inside buiNamFun below, falling back to DEF_NAM_ELE when absent.
		sooEle : <>This controls the <b>minimum number of days that a workout item must wait before it becomes eligible to be picked again</b>. This is useful since you do not usually want the same workout to be chosen again within a certain timeframe.</>                                                                                                                                                           // What: Soonest Element. Why: This overrides buiSooFun's own default body with workout-specific wording. How: This is read as picCopObj.sooEle inside buiSooFun below, falling back to DEF_SOO_ELE when absent.


	}


};



/**
 * NAV_STE_OBJ = Nav Step Object
 *
 * @summary
 * Step 1 is identical for every picker tutorial: just the Pickers nav
 * button itself, cirBoo so Next stays disabled and the user has
 * to actually click the real icon to advance. Body copy is kept in
 * sync with the Pickers page tour's own Step 1 (NAV_TAR_OBJ.picker
 * plus its own buiTs1Fun suffix, see onboarding-page-tours.jsx) by
 * explicit request; the step still has to stay on Today
 * (tabStr: 'today') rather than pre-navigating, so there is something
 * left for the user's own click to do. Only the copy is shared, not
 * the step object itself.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const NAV_STE_OBJ = { // What: Nav Step Object. Why: Every picker tutorial's own Step 1 is this exact same step, highlighting the real Pickers nav button. How: This is spread as-is into every picker's own steObjArr below.


	bacBoo : false,                 // What: Back Boolean. Why: This is every picker tutorial's own very first step, so there is nothing to go back to. How: GuidedTour hides its own Back button whenever this is false.
	cirBoo : true,                  // What: Click-Is-Required Boolean. Why: The click itself is the thing being taught, not just a gate. How: GuidedTour disables Next and only advances once the real target is clicked.
	priStr : 'Next',                // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuidedTour renders this as the button's own visible text.
	selStr : '[data-tab="picker"]', // What: Selector String. Why: This step highlights the real Pickers nav button. How: GuidedTour spotlights whatever this selector matches.
	tabStr : 'today',               // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
	titStr : 'The Pickers Page',    // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.

	bodEle : <>The Pickers page is <b>where you can create new pickers</b> and can be found using the shuffle icon indicated here. You can also <b>manually run any picker, as well as send a specific item to your todo list</b>, from the Pickers page. Go ahead and click the "Pickers" page's button now.</> // What: Body Element. Why: This step's own coach card needs a plain description of what the Pickers page does. How: GuidedTour renders this as the step's own descriptive paragraph, written as JSX so specific phrases can be bolded.


};



/**
 * buiNewFun = Build New Function
 *
 * @summary
 * Lands at the top of the Pickers page (sttBoo) and highlights
 * the real "+ Add New Picker" tab, cirBoo again, the same
 * teaching-the-real-interface pattern as NAV_STE_OBJ above. runFun()
 * publishes the sample's own data as the emlTouObj bus's prefill,
 * timed so the real click (which natively opens the form via the
 * button's own onClick, not this runFun()) ends up mounting NewPickerForm
 * with it already applied. See the design-rationale comment on
 * PicTouCom below for why this specific ordering matters.
 *
 * "+Add" is the FIRST tab in the strip (tab-picker.jsx), not the
 * last; no rhsBoo is needed here. It used to sit last,
 * which broke a Replay Tour once enough real pickers accumulated to
 * push it off the scrollable end with no horizontal-scroll handling
 * anywhere to reveal it (bring()'s own scroll math is vertical-only).
 * Moving it to the front of the strip (users had trouble finding it
 * there at all) fixed that same problem for real usage too, not just
 * this tour.
 *
 * suppressAutoOpen exists because tab-picker.jsx has its own dormant
 * effect from the original (stashed) create-a-picker tour design
 * (`if (tour.prefill && !creating)`) that auto-opens the form the
 * instant prefill appears; without this flag it would wrongly claim
 * credit for the click this step is teaching. existingPickerId/
 * createdFromSample let a finished-before run of this same tour
 * update its own already-created picker in place (via addPicker's own
 * replaceId) instead of creating a name-colliding duplicate.
 * createdFromSample is republished regardless (even on a genuine
 * first run) so THIS run's own picker is tagged for any future replay
 * to find.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const buiNewFun = ( picIdeStr, staAppObj ) => ({ // What: Build New Function. Why: This builds Step 2, the step that highlights the real "+ Add New Picker" tab and stages this sample's own prefill data. How: This returns a step object whose runFun() publishes picIdeStr's own template onto the shared bus before the real click opens the create-picker form.


	bacBoo : true,   // What: Back Boolean. Why: The user should always be able to return to the previous, Pickers-nav step. How: GuidedTour shows its own Back button whenever this is true.
	cirBoo : true,   // What: Click-Is-Required Boolean. Why: The click itself is the thing being taught, not just a gate. How: GuidedTour disables Next and only advances once the real target is clicked.
	priStr : 'Next', // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuidedTour renders this as the button's own visible text.

	runFun : () => { // What: Run Function. Why: This sample's own template needs staging onto the bus before the real click opens the create-picker form. How: This looks up whether this sample was already created before, then publishes the template alongside that lookup's own result.


		const exiPicObj = staAppObj.pickers.find( ( curPicObj ) => curPicObj.createdFromSample === picIdeStr ); // What: Existing Picker Object. Why: A previously-finished run of this same tour already left a real picker tagged with this sample's own id. How: This searches staAppObj.pickers for an entry whose own createdFromSample matches picIdeStr.

		emlTouObj.set({ // What: Prefill Publish Call. Why: tab-picker.jsx's own onCreate reads this in its own bubble-phase handler to prefill (or update in place) the real create-picker form. How: This builds the prefill shape from PIC_SAM_OBJ and the resolved exiPicObj above.


			prefill           : PIC_SAM_OBJ[ picIdeStr ], // What: Prefill Field. Why: The real form's own fields need this sample's own template data. How: This reads PIC_SAM_OBJ by picIdeStr straight through.
			suppressAutoOpen  : true,                     // What: Suppress Auto Open Field. Why: tab-picker.jsx's own dormant auto-open effect must not wrongly claim credit for the click this step is teaching. How: This is read by that effect's own guard, which stays silent whenever this is true.
			existingPickerId  : exiPicObj ? exiPicObj.id : null, // What: Existing Picker Id Field. Why: A previously-finished run's own real picker must be updated in place, not duplicated. How: This carries exiPicObj's own id through when found, null otherwise.
			createdFromSample : picIdeStr                 // What: Created From Sample Field. Why: A future replay of this same tour needs to find this run's own picker. How: This tags the prefill with picIdeStr.


		});


	},

	selStr : '.picker-tab--add',    // What: Selector String. Why: This step highlights the real "+ Add New Picker" tab. How: GuidedTour spotlights whatever this selector matches.
	sttBoo : true,                  // What: Scroll-To-Top Boolean. Why: This step's own target sits at the top of the Pickers page. How: GuidedTour scrolls all the way to 0 for this step instead of just nudging the target into view.
	tabStr : 'picker',              // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
	titStr : 'Create a new picker', // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.

	bodEle : <>The "Add New Picker" button will <b>open up the form for creating a new picker</b>. Go ahead and click the "Add New Picker" button now.</> // What: Body Element. Why: This step's own coach card needs a plain description of what the button does. How: GuidedTour renders this as the step's own descriptive paragraph, written as JSX so specific phrases can be bolded.


});



/**
 * NAM_STE_OBJ = Name Step Object
 *
 * @summary
 * Highlights the Name field's whole group (label + description +
 * input) as one region, the first .np-field in the Details step,
 * which is what is showing once Step 2's own click opens the form
 * (initial.step === 1 in the sample template keeps it on Details
 * rather than jumping to Items). resBoo is false: this and every
 * step through the Create Picker step only has a target because the
 * create-picker form is open, which a reload does not survive (see
 * resBoo's own doc comment in onboarding-tour-runner.jsx). Only
 * NAV_STE_OBJ and buiNewFun's own step stay resBoo, since neither
 * depends on the form already being open.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const NAM_STE_OBJ = { // What: Name Step Object. Why: This step highlights the create-picker form's own Name field. How: This is spread as-is into every picker's own steObjArr below.


	bacBoo : true,                               // What: Back Boolean. Why: The user should always be able to return to the previous, "Add New Picker" step. How: GuidedTour shows its own Back button whenever this is true.
	priStr : 'Next',                             // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuidedTour renders this as the button's own visible text.
	resBoo : false,                              // What: Resumable Boolean. Why: This step's own target only exists because Step 2's own click already opened the form, which a reload does not survive. How: GuidedTour's own resume-persist effect never checkpoints a step whose resBoo is false.
	selStr : '.np-fields .np-field:first-child', // What: Selector String. Why: This step highlights the Name field's whole group. How: GuidedTour spotlights whatever this selector matches.
	tabStr : 'picker',                           // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
	titStr : 'Give it a name',                   // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.

	bodEle : <>This is the <b>name of the picker</b> and should be descriptive of the types of items contained in its list of items. We’ve already filled this out for you but feel free to customize it to whatever you’d prefer.</> // What: Body Element. Why: This step's own coach card needs a plain description of what the Name field is for. How: GuidedTour renders this as the step's own descriptive paragraph, written as JSX so specific phrases can be bolded.


};



const GRO_STE_OBJ = { // What: Group Step Object. Why: This step highlights the create-picker form's own Group field, the second .np-field right after Name. How: This is spread as-is into every picker's own steObjArr below.


	bacBoo : true,                                // What: Back Boolean. Why: The user should always be able to return to the previous, Name step. How: GuidedTour shows its own Back button whenever this is true.
	priStr : 'Next',                              // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuidedTour renders this as the button's own visible text.
	resBoo : false,                               // What: Resumable Boolean. Why: This step's own target only exists because Step 2's own click already opened the form, which a reload does not survive. How: GuidedTour's own resume-persist effect never checkpoints a step whose resBoo is false.
	selStr : '.np-fields .np-field:nth-child(2)', // What: Selector String. Why: This step highlights the Group field's whole group. How: GuidedTour spotlights whatever this selector matches.
	tabStr : 'picker',                            // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
	titStr : 'Attach to a group',                 // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.

	bodEle : <>This is the group that the picker will be attached to and <b>controls how pickers are organized on the Today page</b>. You can either select an existing group or create a new one. We’ve already filled this out for you but feel free to customize it to whatever you’d prefer.</> // What: Body Element. Why: This step's own coach card needs a plain description of what the Group field is for. How: GuidedTour renders this as the step's own descriptive paragraph, written as JSX so specific phrases can be bolded.


};



/**
 * buiModFun = Build Mode Function
 *
 * @summary
 * Highlights ONLY the sample's own mode option, .mode-opt[data-
 * mode="..."] (the data-mode attribute exists purely for this),
 * rather than the whole .mode-radio list. Deliberately narrow: the
 * click-guard blocks clicks outside a step's own target for non-
 * cirBoo steps too, so scoping to just this one mode also
 * prevents switching to a different type here, which would break the
 * mode-specific copy/targets later steps assume (Soonest/Latest
 * wording, the Weight/Boost rows, etc. are all mode-specific; see
 * PicTouCom's own isaEasBoo/useWeiBoo/isaDynBoo checks below).
 *
 * catBoo exists since a single mode option (label + description)
 * can be tall enough on its own to rival a short mobile viewport's
 * whole height; the ease modes' own 2-paragraph descriptions are the
 * longest of the 5. Not every sample's own selected mode is long
 * enough to actually need this, but there is no real cost to always
 * requesting it (see the flag's own doc comment in onboarding-tour-
 * runner.jsx), so it is set unconditionally here rather than only for
 * the samples currently known to need it.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const buiModFun = ( picIdeStr ) => ({ // What: Build Mode Function. Why: This builds the mode-selection step, scoped to only this sample's own mode option. How: This returns a step object whose own selector is built from PIC_SAM_OBJ's own mode field.


	bacBoo : true,                                                                   // What: Back Boolean. Why: The user should always be able to return to the previous, Group step. How: GuidedTour shows its own Back button whenever this is true.
	catBoo : true,                                                                   // What: Coach-At-Top Boolean. Why: The ease modes' own 2-paragraph descriptions can be tall enough to rival a short mobile viewport's whole height. How: GuidedTour skips its own reserve-space math for this step and gives it a precise initial scroll target instead.
	priStr : 'Next',                                                                 // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuidedTour renders this as the button's own visible text.
	resBoo : false,                                                                  // What: Resumable Boolean. Why: This step's own target only exists because Step 2's own click already opened the form, which a reload does not survive. How: GuidedTour's own resume-persist effect never checkpoints a step whose resBoo is false.
	selStr : `.np-fields .mode-opt[data-mode="${ PIC_SAM_OBJ[ picIdeStr ].mode }"]`, // What: Selector String. Why: This step highlights only this sample's own mode option, never the whole list. How: GuidedTour spotlights whatever this selector matches.
	tabStr : 'picker',                                                               // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
	titStr : 'Select a picker type',                                                 // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.

	bodEle : <>These are the different types of pickers. They are the <b>main control for how pickers work</b> and each type has its own pros and cons. We have already selected the appropriate type for you. Click next when you are ready to move on.</> // What: Body Element. Why: This step's own coach card needs a plain description of what the mode options are. How: GuidedTour renders this as the step's own descriptive paragraph, written as JSX so specific phrases can be bolded.


});



/**
 * ITE_STE_OBJ = Items Step Object
 *
 * @summary
 * Highlights the "Add Items" button that advances the form from its
 * Details sub-step to its Items sub-step, .ob-picker-next, a class
 * name left over from the original stashed create-a-picker tour
 * design, reused here as-is since it already targets exactly this
 * button. stbBoo is set since it is always the last thing in
 * the Details footer regardless of how the form got here, reached
 * going forward (scrolled down from filling out fields) or Back from
 * buiNamFun's own step (the form just switched back from its Items
 * sub-step, a completely different shape, so whatever scroll position
 * carried over means nothing).
 *
 * The click this runFun() accompanies swaps the form from Details to its
 * own (much shorter) Items sub-step IN PLACE, within the same
 * scrollable container, not a real navigation, so bring() never gets
 * a chance to animate anything: the instant the shorter content
 * mounts, the browser auto-clamps the still-scrolled-to-the-bottom-
 * of-the-old-content scroll position down to whatever is now valid,
 * synchronously and completely unanimatably, before buiAddFun's own
 * tour effect ever runs (confirmed live: .main.scrollTop dropped from
 * roughly 2960 to 1060 within 50ms of the click, with zero scroll
 * calls of ours in between). By the time buiAddFun's own bring()
 * checks, the "+ Add Item" target is usually already sitting wherever
 * that clamp landed, so no scroll fires and the whole transition reads
 * as an unexplained jump instead of the tour visibly navigating there.
 * Resetting to the top HERE, before the native click's own handler
 * swaps the content, sidesteps the clamp entirely (0 is always a
 * valid scroll position, whatever the new content's own height turns
 * out to be) and leaves a real gap for buiAddFun's own bring() to
 * smoothly scroll across instead. This reset must be instant, not
 * smooth: it needs to be invisible (the same frame as the click,
 * before the old content is even gone), since an animated scroll here
 * would show as its own, separate upward motion before the content
 * swap, on top of buiAddFun's own real one after it.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const ITE_STE_OBJ = { // What: Items Step Object. Why: This step highlights the "Add Items" button that advances the form to its Items sub-step. How: This is spread as-is into every picker's own steObjArr below.


	bacBoo : true,   // What: Back Boolean. Why: The user should always be able to return to the previous, mode-selection step. How: GuidedTour shows its own Back button whenever this is true.
	cirBoo : true,   // What: Click-Is-Required Boolean. Why: The click itself is the thing being taught, not just a gate. How: GuidedTour disables Next and only advances once the real target is clicked.
	priStr : 'Next', // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuidedTour renders this as the button's own visible text.
	resBoo : false,  // What: Resumable Boolean. Why: This step's own target only exists because Step 2's own click already opened the form, which a reload does not survive. How: GuidedTour's own resume-persist effect never checkpoints a step whose resBoo is false.

	runFun : () => { // What: Run Function. Why: The scroll position must be reset to the top before the native click swaps the form's own content, so the clamp described above never gets a chance to fire. How: This zeroes .main's own scrollTop when it exists.


		const maiEle = document.querySelector( '.main' ); // What: Main Element. Why: This is the app's own shared scroll container whose position needs resetting. How: This looks it up fresh, since it may not exist on every layout.

		if ( maiEle ) maiEle.scrollTop = 0; // What: Main Scroll Reset. Why: This must only run when the element actually exists. How: This zeroes maiEle's own scrollTop.


	},

	selStr : '.ob-picker-next',          // What: Selector String. Why: This step highlights the real "Add Items" button. How: GuidedTour spotlights whatever this selector matches.
	stbBoo : true,                       // What: Scroll-To-Bottom Boolean. Why: This step's own target always sits at the bottom of the Details footer. How: GuidedTour scrolls all the way to the end for this step instead of just nudging the target into view.
	tabStr : 'picker',                   // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
	titStr : 'Add items to this picker', // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.

	bodEle : <>The picker options are all done, you just need to <b>add some items for the picker to choose from</b>. Go ahead and click the "Add Items" button now.</> // What: Body Element. Why: This step's own coach card needs a plain description of what the button does. How: GuidedTour renders this as the step's own descriptive paragraph, written as JSX so specific phrases can be bolded.


};



/**
 * buiAddFun = Build Add Function
 *
 * @summary
 * Highlights the "+ Add Item" button on the now-showing Items sub-step
 * (reached via ITE_STE_OBJ's own click), .pv-additem-btn. runFun() stages
 * the item's own name (and, if this sample overrides them, its
 * Soonest/Latest days too, see pkr_ob_monthly's own sooNum/latNum) on
 * the bus, the same timing trick as buiNewFun's own picker-level
 * prefill (fires in the click-guard's own capture phase, the same
 * batch as addNewDraft's own bubble-phase handler), so the draft item
 * addNewDraft creates matches this sample's own cadence instead of the
 * generic "New item" / 7-14 day defaults.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const buiAddFun = ( picIdeStr ) => ({ // What: Build Add Function. Why: This builds the step that highlights the real "+ Add Item" button and stages this item's own prefill data. How: This returns a step object whose runFun() publishes picCopObj's own item fields onto the shared bus.


	bacBoo : true,   // What: Back Boolean. Why: The user should always be able to return to the previous, "Add Items" step. How: GuidedTour shows its own Back button whenever this is true.
	cirBoo : true,   // What: Click-Is-Required Boolean. Why: The click itself is the thing being taught, not just a gate. How: GuidedTour disables Next and only advances once the real target is clicked.
	priStr : 'Next', // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuidedTour renders this as the button's own visible text.
	resBoo : false,  // What: Resumable Boolean. Why: This step's own target only exists because earlier clicks already opened the form and its Items sub-step, which a reload does not survive. How: GuidedTour's own resume-persist effect never checkpoints a step whose resBoo is false.

	runFun : () => { // What: Run Function. Why: This item's own prefill data needs staging onto the bus before the real click opens the inline item editor. How: This looks up this sample's own copy, then converts its own sooNum/latNum days into the drift values tab-picker.jsx's own editor expects.


		const picCopObj = PIC_COP_OBJ[ picIdeStr ]; // What: Picker Copy Object. Why: This item's own prefill name and Soonest/Latest overrides live here. How: This looks up PIC_COP_OBJ by picIdeStr.

		emlTouObj.set({ // What: Item Prefill Publish Call. Why: tab-picker.jsx's own addNewDraft reads this in its own bubble-phase handler to prefill the real inline item editor. How: This builds the prefill shape from picCopObj above.


			itemPrefill : picCopObj.preStr,                                       // What: Item Prefill Field. Why: The real editor's own name input needs this item's own prefilled name. How: This reads picCopObj's own preStr straight through.
			itemEaseMax : picCopObj.sooNum ? 100 / picCopObj.sooNum : null,       // What: Item Ease Max Field. Why: 100/days is the same days-to-drift conversion tab-picker.jsx's own driftToSoonest/daysToDrift use, kept in sync manually since those are not exported. How: This converts picCopObj's own sooNum into a drift value, or null when this sample has no override.
			itemEaseMin : picCopObj.latNum ? 100 / picCopObj.latNum : null        // What: Item Ease Min Field. Why: Same conversion as itemEaseMax, for the slow end of the drift band. How: This converts picCopObj's own latNum into a drift value, or null when this sample has no override.


		});


	},

	selStr : '.pv-additem-btn',                  // What: Selector String. Why: This step highlights the real "+ Add Item" button. How: GuidedTour spotlights whatever this selector matches.
	tabStr : 'picker',                           // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
	titStr : 'Add an item to the picker’s list', // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.

	bodEle : <>Pickers need a <b>list of items to choose from</b> when it is run, whether manually or via the auto generation feature. Go ahead and click the "Add Item" button now to add a new item to this picker's list of items.</> // What: Body Element. Why: This step's own coach card needs a plain description of what the button does. How: GuidedTour renders this as the step's own descriptive paragraph, written as JSX so specific phrases can be bolded.


});



const DEF_NAM_ELE = <>This is the name of the task item and is <b>what will show up in your todo list if it is picked</b>. We’ve already filled this out for you but feel free to customize it to whatever you’d prefer.</>;                          // What: Default Name Element.    Why: This is buiNamFun's own fallback body, used whenever a sample's own picCopObj has no namEle override. How: This is read as `picCopObj.namEle || DEF_NAM_ELE` inside buiNamFun below.
const DEF_SOO_ELE = <>This controls the <b>minimum number of days that a task item must wait before it becomes eligible to be picked again</b>. This is useful since most chores do not usually need to be done again within a certain timeframe.</>; // What: Default Soonest Element. Why: This is buiSooFun's own fallback body, used whenever a sample's own picCopObj has no sooEle override. How: This is read as `picCopObj.sooEle || DEF_SOO_ELE` inside buiSooFun below.
const DEF_LAT_ELE = <>This controls the <b>maximum number of days that a task item must wait before it should be picked again</b>. This is also useful since most chores need to be done again within a certain timeframe.</>;                        // What: Default Latest Element.  Why: This is buiLatFun's own fallback body, used whenever a sample's own picCopObj has no latEle override. How: This is read as `picCopObj.latEle || DEF_LAT_ELE` inside buiLatFun below.



const buiNamFun = ( picIdeStr ) => ({ // What: Build Name Function. Why: This builds the step that highlights the item editor's own name input. How: This returns a step object whose bodEle reads picIdeStr's own picCopObj, falling back to DEF_NAM_ELE.


	bacBoo : true,                              // What: Back Boolean. Why: The user should always be able to return to the previous, "Add Item" step. How: GuidedTour shows its own Back button whenever this is true.
	priStr : 'Next',                            // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuidedTour renders this as the button's own visible text.
	resBoo : false,                             // What: Resumable Boolean. Why: This step's own target only exists because earlier clicks already opened the form, its Items sub-step, and this item's own inline editor, which a reload does not survive. How: GuidedTour's own resume-persist effect never checkpoints a step whose resBoo is false.
	selStr : '.pv-additem-wrap .rd-name-input', // What: Selector String. Why: This step highlights the item name input inside the inline editor, scoped under .pv-additem-wrap since the same class is reused (mutually exclusively at render time) by the existing-picker "add item" flow elsewhere on this tab. How: GuidedTour spotlights whatever this selector matches.
	tabStr : 'picker',                          // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
	titStr : 'Give it a name',                  // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.

	bodEle : PIC_COP_OBJ[ picIdeStr ].namEle || DEF_NAM_ELE // What: Body Field. Why: This step's own coach card needs a plain description of what the name field is for, either this sample's own or the generic fallback. How: This reads PIC_COP_OBJ's own namEle, falling back to DEF_NAM_ELE.


});



/**
 * buiSooFun = Build Soonest Function
 *
 * @summary
 * Highlights the Soonest/Shortest row, the first .pie-row in the
 * editor's own isEase branch. Only meaningful for Ease Up/Ease Down
 * samples (the row does not exist at all for Weighted/Dynamic/Random
 * modes, where this same .pie-row position is a Weight stepper
 * instead); PicTouCom only includes this step when the sample's own
 * mode is one of the ease modes (see its own isaEasBoo below). The
 * whole body is per-picker (picCopObj.sooEle), defaulting to the
 * original Ease Up/"task item"/"week" wording; Daily Chores is the
 * only sample this has been manually verified against so far, and
 * Ease Down samples (Relax) reuse a dedicated sooEle override rather
 * than the ease-up-flavored default, for the "Shortest" label and
 * ease-down's reversed stays-picked-until-discharged semantics. No new
 * one-way DOM transition happens between buiNamFun's own step and
 * here (the editor stays open the whole time), so no onBacTouFun handling
 * is needed.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const buiSooFun = ( picIdeStr ) => ({ // What: Build Soonest Function. Why: This builds the step that highlights the item editor's own Soonest/Shortest row. How: This returns a step object whose bodEle reads picIdeStr's own picCopObj, falling back to DEF_SOO_ELE.


	bacBoo : true,                                    // What: Back Boolean. Why: The user should always be able to return to the previous, name-input step. How: GuidedTour shows its own Back button whenever this is true.
	priStr : 'Next',                                  // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuidedTour renders this as the button's own visible text.
	resBoo : false,                                   // What: Resumable Boolean. Why: This step's own target only exists because earlier clicks already opened the form, its Items sub-step, and this item's own inline editor, which a reload does not survive. How: GuidedTour's own resume-persist effect never checkpoints a step whose resBoo is false.
	selStr : '.pv-additem-wrap .pie-row:first-child', // What: Selector String. Why: This step highlights the Soonest/Shortest row, only present for ease-mode samples. How: GuidedTour spotlights whatever this selector matches.
	tabStr : 'picker',                                // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
	titStr : 'Set a timeout',                         // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.

	bodEle : PIC_COP_OBJ[ picIdeStr ].sooEle || DEF_SOO_ELE // What: Body Field. Why: This step's own coach card needs a plain description of what the Soonest/Shortest row is for, either this sample's own or the generic fallback. How: This reads PIC_COP_OBJ's own sooEle, falling back to DEF_SOO_ELE.


});



const buiLatFun = ( picIdeStr ) => ({ // What: Build Latest Function. Why: This builds the step that highlights the item editor's own Latest/Longest row, the second .pie-row right after Soonest/Shortest, same mode gating and per-picker override as buiSooFun above. How: This returns a step object whose bodEle reads picIdeStr's own picCopObj, falling back to DEF_LAT_ELE.


	bacBoo : true,                                     // What: Back Boolean. Why: The user should always be able to return to the previous, Soonest/Shortest step. How: GuidedTour shows its own Back button whenever this is true.
	priStr : 'Next',                                   // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuidedTour renders this as the button's own visible text.
	resBoo : false,                                    // What: Resumable Boolean. Why: This step's own target only exists because earlier clicks already opened the form, its Items sub-step, and this item's own inline editor, which a reload does not survive. How: GuidedTour's own resume-persist effect never checkpoints a step whose resBoo is false.
	selStr : '.pv-additem-wrap .pie-row:nth-child(2)', // What: Selector String. Why: This step highlights the Latest/Longest row, only present for ease-mode samples. How: GuidedTour spotlights whatever this selector matches.
	tabStr : 'picker',                                 // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
	titStr : 'Set a maximum wait',                     // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.

	bodEle : PIC_COP_OBJ[ picIdeStr ].latEle || DEF_LAT_ELE // What: Body Field. Why: This step's own coach card needs a plain description of what the Latest/Longest row is for, either this sample's own or the generic fallback. How: This reads PIC_COP_OBJ's own latEle, falling back to DEF_LAT_ELE.


});



/**
 * WEI_STE_OBJ = Weight Step Object
 *
 * @summary
 * Highlights the Weight stepper row, the first .pie-row in the
 * editor's own usesWeight branch (Weighted/Dynamic modes only,
 * mutually exclusive with the isEase branch above, so reusing the
 * same :first-child position is safe since only one of the two ever
 * renders for a given picker). PicTouCom only includes this step
 * when the sample's own mode is Weighted or Dynamic (see its own
 * useWeiBoo below). No new one-way DOM transition happens between
 * buiNamFun's own step and here (the editor stays open the whole
 * time), so no onBacTouFun handling is needed, same reasoning as the
 * isEase steps above.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const WEI_STE_OBJ = { // What: Weight Step Object. Why: This step highlights the item editor's own Weight stepper row. How: This is spread as-is into a Weighted/Dynamic sample's own steObjArr below.


	bacBoo : true,                                    // What: Back Boolean. Why: The user should always be able to return to the previous, name-input step. How: GuidedTour shows its own Back button whenever this is true.
	priStr : 'Next',                                  // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuidedTour renders this as the button's own visible text.
	resBoo : false,                                   // What: Resumable Boolean. Why: This step's own target only exists because earlier clicks already opened the form, its Items sub-step, and this item's own inline editor, which a reload does not survive. How: GuidedTour's own resume-persist effect never checkpoints a step whose resBoo is false.
	selStr : '.pv-additem-wrap .pie-row:first-child', // What: Selector String. Why: This step highlights the Weight stepper row, only present for Weighted/Dynamic samples. How: GuidedTour spotlights whatever this selector matches.
	tabStr : 'picker',                                // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
	titStr : 'Give it a weight',                      // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.

	bodEle : <>The Weight control allows you to <b>prioritize some items over others</b>. e.g. an item with a weight of 2 is twice as likely to be picked as an item with a weight of 1. That way the pick is still random while allowing you some control over how it works.</> // What: Body Element. Why: This step's own coach card needs a plain description of what the Weight row is for. How: GuidedTour renders this as the step's own descriptive paragraph, written as JSX so specific phrases can be bolded.


};



/**
 * BOO_STE_OBJ = Boost Step Object
 *
 * @summary
 * Highlights the Boost row, the second .pie-row, right after Weight,
 * in the editor's own isDynamic-only branch (Dynamic mode
 * specifically; unlike Weight, Weighted-mode pickers do not get this
 * row at all). Not interactive (there is no cirBoo, since the
 * BooResCom control only ever does something once an item has
 * actually accrued a boost, never true for a freshly-created item),
 * just narration, since this value is the core mechanic of how
 * Dynamic Weighted differs from plain Weighted.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const BOO_STE_OBJ = { // What: Boost Step Object. Why: This step highlights the item editor's own Boost row. How: This is spread as-is into a Dynamic sample's own steObjArr below.


	bacBoo : true,                                     // What: Back Boolean. Why: The user should always be able to return to the previous, Weight step. How: GuidedTour shows its own Back button whenever this is true.
	priStr : 'Next',                                   // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuidedTour renders this as the button's own visible text.
	resBoo : false,                                    // What: Resumable Boolean. Why: This step's own target only exists because earlier clicks already opened the form, its Items sub-step, and this item's own inline editor, which a reload does not survive. How: GuidedTour's own resume-persist effect never checkpoints a step whose resBoo is false.
	selStr : '.pv-additem-wrap .pie-row:nth-child(2)', // What: Selector String. Why: This step highlights the Boost row, only present for Dynamic samples. How: GuidedTour spotlights whatever this selector matches.
	tabStr : 'picker',                                 // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
	titStr : 'Boost value',                            // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.

	bodEle : <>This is the <b>crucial piece of a Dynamic Weighted picker</b>. Every time an item does not get picked this value will increase, making it more and more likely to be picked. Then when it does get picked this value will reset, making it much less likely to be picked.</> // What: Body Element. Why: This step's own coach card needs a plain description of what the Boost row is for. How: GuidedTour renders this as the step's own descriptive paragraph, written as JSX so specific phrases can be bolded.


};



/**
 * SAV_STE_OBJ = Save Step Object
 *
 * @summary
 * Highlights the item editor's own Save button, .ob-item-save (tagged
 * alongside .ob-item-cancel, see EntryEditor in tab-today.jsx).
 * cirBoo since this closes the editor for good, the same real-
 * interface-teaching pattern as buiNewFun/ITE_STE_OBJ/buiAddFun above.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const SAV_STE_OBJ = { // What: Save Step Object. Why: This step highlights the item editor's own Save button. How: This is spread as-is into every picker's own steObjArr below.


	bacBoo : true,                    // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuidedTour shows its own Back button whenever this is true.
	cirBoo : true,                    // What: Click-Is-Required Boolean. Why: The click itself is the thing being taught, not just a gate. How: GuidedTour disables Next and only advances once the real target is clicked.
	priStr : 'Next',                  // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuidedTour renders this as the button's own visible text.
	resBoo : false,                   // What: Resumable Boolean. Why: This step's own target only exists because earlier clicks already opened the form, its Items sub-step, and this item's own inline editor, which a reload does not survive. How: GuidedTour's own resume-persist effect never checkpoints a step whose resBoo is false.
	selStr : '.ob-item-save',         // What: Selector String. Why: This step highlights the real Save button. How: GuidedTour spotlights whatever this selector matches.
	tabStr : 'picker',                // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
	titStr : 'Save this picker item', // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.

	bodEle : <>This picker item is now complete and can be <b>saved to this picker’s list</b>. Go ahead and click the "Save" button now to save this item to this picker's list of items.</> // What: Body Element. Why: This step's own coach card needs a plain description of what the button does. How: GuidedTour renders this as the step's own descriptive paragraph, written as JSX so specific phrases can be bolded.


};



/**
 * CRE_STE_OBJ = Create Step Object
 *
 * @summary
 * Highlights the form's own real "Create Picker" button, .ob-picker-
 * create (see tab-picker.jsx's own np-footer). cirBoo plus
 * priStr:'Done' together mean this is the ONE step where the real
 * target's own native click handler (submit, which actually calls
 * actions.addPicker) has to survive finish()'s own side effects
 * (selTabFun away from Pickers, unmounting this whole tour);
 * GuidedTour's own onPrimary defers the 'Done'/advance half of a
 * cirBoo click by a tick for exactly this reason (see its own
 * comment), so submit() still fires normally in the click's own native
 * bubble phase before finish() tears anything down.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const CRE_STE_OBJ = { // What: Create Step Object. Why: This step highlights the form's own real "Create Picker" button. How: This is spread as-is into every picker's own steObjArr below.


	bacBoo : true,                 // What: Back Boolean. Why: The user should always be able to return to the previous, Save step. How: GuidedTour shows its own Back button whenever this is true.
	cirBoo : true,                 // What: Click-Is-Required Boolean. Why: The real click both creates the picker and ends the tour, so the tour must not advance on its own before that click happens. How: GuidedTour disables Next and only advances once the real target is clicked.
	priStr : 'Done',               // What: Primary String. Why: This is every picker tutorial's own last step, so its main action finishes the tour instead of advancing. How: GuidedTour reads a 'Done' priStr as the signal to call onFinTouFun instead of moving to a next step.
	resBoo : false,                // What: Resumable Boolean. Why: This step's own target only exists because earlier clicks already opened the form, which a reload does not survive. How: GuidedTour's own resume-persist effect never checkpoints a step whose resBoo is false.
	selStr : '.ob-picker-create',  // What: Selector String. Why: This step highlights the real Create Picker button. How: GuidedTour spotlights whatever this selector matches.
	tabStr : 'picker',             // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
	titStr : 'Create this picker', // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.

	bodEle : <>You’re all set! You’ve created this picker and its list of items. All that’s left is to finish creating this picker. Go ahead and <b>click the "Create Picker" button now</b> to create this picker.</> // What: Body Element. Why: This step's own coach card needs a plain description of what the button does. How: GuidedTour renders this as the step's own descriptive paragraph, written as JSX so specific phrases can be bolded.


};



// #region PicTouCom

/**
 * PicTouCom = Picker Tour Component
 *
 * @summary
 * Renders whichever piece of one sample picker's own mini-tour is
 * currently relevant: the intro modal, or the running GuidedTour.
 * Mounted at the app level (see app.jsx's own actPicStr), not inside
 * TabToday the way the reminder mini-tours are: Step 1 navigates to
 * the Pickers tab, which would unmount TabToday (and this along with
 * it) if it lived there instead. actIdeStr/selTabFun are therefore the
 * real app-wide ones, not stubs.
 *
 * Why buiNewFun's own runFun() (not, say, NAV_STE_OBJ's, or PicTouCom's
 * own mount) is where prefill gets published: tab-picker.jsx has its
 * own dormant effect from the original (stashed) create-a-picker tour
 * design, `if (tour.prefill && !creating) { setCreating(true);
 * setOpenedByTour(true); }`, that auto-opens the form the instant
 * prefill appears. Publishing any earlier (tour start, or even Step 1)
 * would trigger that the moment TabPicker mounts, skipping Step 2
 * entirely (the form would already be open before the user ever sees
 * "+ Add New Picker" highlighted). runFun() fires in the click-guard's own
 * CAPTURE-phase handling of the same click whose native bubble-phase
 * handler is the button's own `onClick={() => setCreating(true)}`,
 * that ordering (not, as an earlier version of this comment assumed,
 * both landing in one React batch; they do not, the bus's own plain-JS
 * subscriber callback commits its own render before the native
 * handler's does) is exactly why runFun() also sets
 * `suppressAutoOpen: true`, without it the dormant effect would see
 * `creating` still false on its own earlier render and wrongly claim
 * credit, flipping openedByTour to true (this tour walks Details
 * normally via a real click, unlike the other prefill entry point
 * that comment block still documents, which SHOULD trigger that
 * effect).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.picIdeStr   - Picker Identifier String: The sample picker's own
 *                            id, keying both PIC_SAM_OBJ and PIC_COP_OBJ.
 * @param props.staAppObj   - State App Object: The entire app's own
 *                            persisted state.
 * @param props.actions     - Actions: The actions that mutate
 *                            props.staAppObj.
 * @param props.actIdeStr   - Active Identifier String: The app's own currently
 *                            active tab id.
 * @param props.selTabFun   - Select Tab Function: Switches the app's own
 *                            active tab.
 * @param props.onCloTouFun - On Close Tour Function: Clears app.jsx's own
 *                            actPicStr, ending this mount.
 *
 * @returns Either the intro modal (touPhaStr 'intro') or the running
 * guided tour (touPhaStr 'tour'), depending on this picker's own
 * phase.
 *
 * @example
 * ```tsx
 * PicTouCom({ picIdeStr, staAppObj, actions, actIdeStr, selTabFun, ... })
 * // => <PicTouCom />
 * ```
 *
*/

function PicTouCom ( { picIdeStr, staAppObj, actions, actIdeStr, selTabFun, onCloTouFun } ) {


	const picRecObj = ( staAppObj.pickers || [] ).find( ( curPicObj ) => curPicObj.id === picIdeStr ); // What: Picker Record Object. Why: The intro modal and every mode-gating check below need this sample's own live picker record. How: This searches staAppObj.pickers for the entry whose own id matches picIdeStr.
	const picCopObj = PIC_COP_OBJ[ picIdeStr ];                                                     // What: Picker Copy Object. Why: The intro modal's own second paragraph needs this sample's own copy. How: This looks up PIC_COP_OBJ by picIdeStr.
	const modLabStr = ( ( MODES[ picRecObj.mode ] || {} ).label || picRecObj.mode ).toLowerCase(); // What: Mode Label String. Why: The intro modal's own pill needs a human-readable mode label, not the raw mode key. How: This looks up MODES by picRecObj's own mode, falling back to the raw mode key, then lower-cases the result.



	const onbStaObj = staAppObj.onboarding || {}; // What: Onboarding State Object. Why: A reload lands here with app.jsx already having re-derived actPicStr from the SAME persisted activeTour, so this just decides whether to skip the intro modal and which (resBoo) step to land on. How: This reads staAppObj.onboarding, falling back to an empty object.
	const resTouObj = onbStaObj.activeTour && onbStaObj.activeTour.id === `picker-${ picIdeStr }` ? onbStaObj.activeTour : null; // What: Resume Tour Object. Why: See onboarding-tour-runner.jsx's own resBoo field doc comment for why this is a checkpoint, not necessarily the exact step the user was last on. How: This reads onbStaObj.activeTour back out only when its own id matches this picker's own tourId, otherwise null.

	const [ touPhaStr, setTouPhaStr ] = React.useState( resTouObj ? 'tour' : 'intro' ); // What: Tour Phase String And Setter. Why: This is the mini-tour's own top-level position, 'intro' (the modal showing) or 'tour' (GuidedTour running). How: This starts on 'tour' whenever resTouObj says a tour was left running, otherwise 'intro'.



	const cloTouFun = ( staValStr ) => { // What: Close Tour Function. Why: Clears both bus fields regardless of exit path (cancelled/skipped/finished), since tab-picker.jsx's own dormant auto-open effect keys off tour.prefill's mere presence, so a leftover value from THIS tour would silently reopen the create form with stale sample data the next time TabPicker mounts. How: This publishes every prefill-related field back to its own idle value, updates the checklist, then calls onCloTouFun.


		emlTouObj.set({ // What: Prefill Clear Call. Why: A stale prefill left over from this tour must not leak into a future visit to the Pickers tab. How: This resets every field buiNewFun's/buiAddFun's own runFun() published, back to its own idle value.


			createdFromSample : null, // What: Created From Sample Field. Why: Same reasoning as existingPickerId. How: This clears the field buiNewFun's own runFun() set.
			existingPickerId  : null, // What: Existing Picker Id Field. Why: This must not leak into a future, unrelated create-picker flow. How: This clears the field buiNewFun's own runFun() set.
			itemEaseMax       : null, // What: Item Ease Max Field. Why: Same reasoning as itemPrefill, for the drift band's own fast end. How: This clears the field buiAddFun's own runFun() set.
			itemEaseMin       : null, // What: Item Ease Min Field. Why: Same reasoning as itemPrefill, for the drift band's own slow end. How: This clears the field buiAddFun's own runFun() set.
			itemPrefill       : null, // What: Item Prefill Field. Why: The item editor must not reopen with a stale prefilled name. How: This clears the field buiAddFun's own runFun() set.
			prefill           : null, // What: Prefill Field. Why: The create-picker form must not reopen with stale sample data. How: This clears the field buiNewFun's own runFun() set.
			suppressAutoOpen  : false // What: Suppress Auto Open Field. Why: A future, non-tour visit to the Pickers tab must not have its own dormant auto-open effect silenced. How: This resets the flag buiNewFun's own runFun() set.


		});

		actions.setChecklistItem( picIdeStr, { status : staValStr } ); // What: Checklist Status Update Call. Why: The launcher card on Today reads this to know whether to keep showing itself. How: This updates this sample's own checklist entry to staValStr.

		onCloTouFun(); // What: On Close Call. Why: app.jsx's own actPicStr must be cleared however this tour ends. How: This calls the onCloTouFun prop passed down from app.jsx.


	};



	if ( touPhaStr === 'intro' ) { // What: Intro Phase Check. Why: The intro modal must show before any spotlight step ever does. How: This returns IntModCom below whenever touPhaStr is 'intro'.


		return (


			<IntModCom
				icoTopEle={ <IcoSvgCom name='picker' size={ 54 } /> }
				titHeaStr={ `${ picRecObj.name } Picker` }
				parEleArr={ [ FIR_PAR_ELE, picCopObj.bodEle ] }
				pilLabArr={ [ 'pickers', modLabStr, ( picRecObj.group || '' ).toLowerCase() ] }
				onBegTouFun={ () => setTouPhaStr( 'tour' ) }
				onSkiTouFun={ () => cloTouFun( 'cancelled' ) } // What: On Skip Handler. Why: This mirrors the launcher card's own X button exactly, marking the card cancelled without touching the underlying sample picker. How: This calls cloTouFun with 'cancelled'.
			/> // What: Tutorial Intro Modal Element. Why: This is this sample's own opening screen, shown before any spotlight step ever does. How: This is passed this sample's own icon/title/paragraphs/pills and the onBegTouFun/onSkiTouFun handlers above.


		);


	}



	const isaEasBoo = picRecObj.mode === 'ease-up' || picRecObj.mode === 'ease-down'; // What: Is-An Ease Boolean. Why: The Soonest/Latest steps only apply to Ease Up/Ease Down samples; every other mode's item editor does not have those rows at all. How: This checks picRecObj's own mode against both ease mode keys.
	const useWeiBoo = picRecObj.mode === 'weighted' || picRecObj.mode === 'dynamic';  // What: Uses Weight Boolean. Why: The Weight step is the mirror image of isaEasBoo; only Weighted/Dynamic samples get it. How: This checks picRecObj's own mode against both weight-using mode keys.
	const isaDynBoo = picRecObj.mode === 'dynamic';                                  // What: Is-A Dynamic Boolean. Why: The Boost step is narrower still; only Dynamic samples (not plain Weighted) get that row at all. How: This checks picRecObj's own mode against the dynamic mode key.

	const steObjArr = [ // What: Step Object Array. Why: GuidedTour needs this sample's own full ordered step list, varying in length by mode (isaEasBoo/useWeiBoo/isaDynBoo above decide which optional steps are included). How: This concatenates the shared steps with whichever mode-specific ones apply.


		NAV_STE_OBJ, buiNewFun( picIdeStr, staAppObj ), NAM_STE_OBJ, GRO_STE_OBJ,
		buiModFun( picIdeStr ), ITE_STE_OBJ, buiAddFun( picIdeStr ), buiNamFun( picIdeStr ),
		...( isaEasBoo ? [ buiSooFun( picIdeStr ), buiLatFun( picIdeStr ) ] : [] ),
		...( useWeiBoo ? [ WEI_STE_OBJ ] : [] ),
		...( isaDynBoo ? [ BOO_STE_OBJ ] : [] ),
		SAV_STE_OBJ, CRE_STE_OBJ


	];



	return (


		<GuidedTour
			touIdeStr={ `picker-${ picIdeStr }` }
			steObjArr={ steObjArr }
			resSteNum={ resTouObj ? resTouObj.step : 0 }
			actStoObj={ actions }
			actIdeStr={ actIdeStr }
			selTabFun={ selTabFun }
			onBacTouFun={ ( tarSteNum ) => { // What: On Go Back Handler. Why: Back from buiAddFun's own step (index 6, the Items sub-step's "+ Add Item" button) to ITE_STE_OBJ's own step (index 5, "Add Items") needs the form pushed back to its Details sub-step first; unlike the Reminders tours' own "+" button, .ob-picker-next's own click is a one-way step change inside NewPickerForm, not a toggle, so without this ITE_STE_OBJ's own target stays gone (the form is still showing Items) and the tour has nothing to highlight. How: This branches on tarSteNum, clicking the real DOM control that reverses whichever one-way transition the tour is backing out of.


				if ( tarSteNum === 5 ) { // What: Details Step Back Check. Why: Reversing buiAddFun's own step needs the form pushed back to Details. How: This clicks the form's own "Details" step-indicator tab, the only way to reverse this from outside the form, which owns that step state locally.


					const detTabEle = document.querySelector( '.ob-picker-details' ); // What: Details Tab Element. Why: This is the real control that reverses the form's own Details/Items step. How: This looks it up fresh, since it may not exist outside the create-picker form.

					if ( detTabEle ) detTabEle.click(); // What: Details Tab Click. Why: This must only fire when the control actually exists. How: This clicks detTabEle.


				}

				else if ( tarSteNum === 6 ) { // What: Item Editor Cancel Check. Why: buiNamFun's own step opened the inline item editor, which is also a one-way transition (no toggle); Cancel is the only real-DOM way to close it back to the bare "+ Add Item" button from outside. How: This clicks the item editor's own Cancel button, same reasoning as the tarSteNum === 5 branch above.


					const canButEle = document.querySelector( '.ob-item-cancel' ); // What: Cancel Button Element. Why: This is the real control that closes the inline item editor back to buiAddFun's own step. How: This looks it up fresh, since it may not exist outside an open item editor.

					if ( canButEle ) canButEle.click(); // What: Cancel Button Click. Why: This must only fire when the control actually exists. How: This clicks canButEle.


				}

				else if ( tarSteNum === steObjArr.length - 2 ) { // What: Reopen Item Nonce Check. Why: Back from CRE_STE_OBJ's own step to SAV_STE_OBJ's own step has no real DOM control, since SAV_STE_OBJ's own Save already committed the item into the real list for good (see tab-picker.jsx's own comment on this); steObjArr.length - 2 rather than a hardcoded index, since how many steps come before these last two varies by picker mode, but SAV_STE_OBJ's own step is always exactly 2 before the end. How: This publishes a bus nonce, the same reasoning as the Pickers page tour's own onBacTouFun uses for its own no-real-control Back cases.


					emlTouObj.set({ pickerTourReopenItemNonce : ( emlTouObj.get().pickerTourReopenItemNonce || 0 ) + 1 }); // What: Reopen Item Nonce Publish. Why: tab-picker.jsx's own effect watches this field to reopen the just-saved item's own editor. How: This increments the bus's own current pickerTourReopenItemNonce by 1.


				}


			} }
			onSkiTouFun={ () => cloTouFun( 'skipped' ) } // What: On Skip Handler. Why: Skip (or the not-found watchdog) reads as "the user didn't finish", distinct both from the intro modal's own 'cancelled' and from a genuine 'finished' below. How: This calls cloTouFun with 'skipped'.
			onFinTouFun={ () => cloTouFun( 'finished' ) } // What: On Finish Handler. Why: This only fires from CRE_STE_OBJ's own cirBoo, after the real click that creates the picker has already reached the button's own handler. How: This calls cloTouFun with 'finished'.
		/> // What: Guided Tour Element. Why: This is the actual running spotlight walkthrough for this sample, mounted once its own intro modal has been accepted or resumed into. How: This is passed this sample's own touIdeStr, steObjArr, and the resume/lifecycle plumbing above.


	);


}

// #endregion PicTouCom



export { PicTouCom }; // What: Named Exports. Why: app.jsx renders this as the Pickers page's own guided tour. How: This re-exports PicTouCom; every other binding in this file is internal-only.


