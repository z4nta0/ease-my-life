


// #region Imports

import React from 'react'; // What: React. Why: This file's own RemTouCom component and its step-building helpers all need React in scope to compile their JSX. How: This is used directly (React.useState) below, instead of importing individual named hooks.


import { emlTouObj    } from './eml-tour-bus.js';            // What: Ease My Life Tour Object. Why: This publishes the running tour's prefill data for the real reminder form and clears it again on every exit path. How: This is written to via .set() in bldAddFun's runFun() and cloTouFun below.
import { GuidedTour   } from './onboarding-tour-runner.jsx'; // What: Guided Tour. Why: This is the generic spotlight-tour engine that actually drives each reminder mini-tour once its own intro modal is accepted. How: This is rendered while touPhaStr is 'tour', passed this file's own per-varKeyStr step array.
import { IcoSvgCom    } from './ui.jsx';                     // What: Icon Svg Component. Why: The intro modal needs a recognizable glyph matching the current varKeyStr. How: This is rendered inside the intro modal's icon prop below.
import { IntModCom    } from './onboarding-intro-modal.jsx'; // What: Intro Modal Component. Why: Each reminder mini-tour opens on this generic intro modal before any spotlight step ever shows. How: This is rendered while touPhaStr is 'intro', passed this file's own per-varKeyStr copy.
import { OB_TASKS     } from './onboarding-seed-data.js';    // What: Onboarding Tasks. Why: A reload can land on this tour before the live sample task has been re-derived from state.tasks. How: This is searched as the fallback template lookup in bldAddFun's runFun() below.
import { useEmlTouFun } from './eml-tour-bus.js';            // What: Use Ease My Life Tour. Why: The recurring tour's own Step 4 needs to read the live draft's current schedule type off the shared bus. How: This is called once to subscribe to the bus and read its own draftRepeat field.

// #endregion Imports



/**
 * onboarding-reminder-tours.jsx = Onboarding Reminder Tours
 *
 * @summary
 * Content for the two Reminders mini-tours ("Set up a one-time reminder" /
 * "Set up a recurring reminder"), launched by Play on their sample launcher
 * cards on Today (see tab-today.jsx's own startMiniTour, reminders.jsx's
 * ReminderCard isTutorial branch). Both share the same intro-modal structure
 * and first paragraph (FIR_PAR_ELE below); only the icon, title, and second
 * paragraph differ by varKeyStr (VAR_COP_OBJ below), matching the two sample
 * reminders seeded by the Welcome Tour (onboarding-seed-data.js's OB_TASKS:
 * tk_ob_meds is the one-time sample, tk_ob_trash the recurring one).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



const FIR_PAR_ELE = <>Reminders can be thought of as <b>what a normal task would be in a typical todo list app</b>, since not all tasks can be randomly selected. Taking out the trash for pickup, as an example, since this must be done on a set day every week.</>; // What: First Paragraph Element. Why: This is the intro modal's shared opening paragraph, identical for both tour variants. How: This is passed as the first entry of IntModCom's own paragraphs prop in the render below.



const VAR_COP_OBJ = { // What: Variant Copy Object. Why: Each tour varKeyStr needs its own sample task id, icon, title, and second intro paragraph. How: This is looked up by varKeyStr ('once'/'recurring') everywhere a step or the intro modal needs varKeyStr-specific copy.


	once      : {


		ideStr : 'tk_ob_meds',                                                                                                                                                                                                                         // What: Identifier String. Why: This ties the 'once' varKeyStr to its own sample reminder. How: This is read back against state.tasks/OB_TASKS by bldAddFun's runFun() below and against the checklist by cloTouFun.
		icoStr : 'pin',                                                                                                                                                                                                                                // What: Icon String. Why: The intro modal needs a glyph matching this varKeyStr. How: This is passed to IcoSvgCom's own name prop in the render below.
		titStr : 'One-Time Reminders',                                                                                                                                                                                                                 // What: Title String. Why: The intro modal needs a heading naming this varKeyStr. How: This is rendered as IntModCom's own title prop.
		bodStr : 'One-time reminders are simple one off things that need to get done and will never show up again once they are marked as completed in your todo list. e.g. pickup precription or pickup dry cleaning. Let’s create one of these now.' // What: Body String. Why: This varKeyStr's own second intro paragraph explains what a one-time reminder is. How: This is rendered as the second entry of IntModCom's own paragraphs prop.


	},

	recurring : {


		ideStr : 'tk_ob_trash',                                                                                                                                                        // What: Identifier String. Why: This ties the 'recurring' varKeyStr to its own sample reminder. How: This is read back against state.tasks/OB_TASKS by bldAddFun's runFun() below and against the checklist by cloTouFun.
		icoStr : 'calendar',                                                                                                                                                           // What: Icon String. Why: The intro modal needs a glyph matching this varKeyStr. How: This is passed to IcoSvgCom's own name prop in the render below.
		titStr : 'Recurring Reminders',                                                                                                                                                // What: Title String. Why: The intro modal needs a heading naming this varKeyStr. How: This is rendered as IntModCom's own title prop.
		bodStr : 'Recurring tasks are things that need to get done on a set schedule. e.g. take trash out for pickup (weekly) or get the mail (daily). Let’s create one of these now.' // What: Body String. Why: This varKeyStr's own second intro paragraph explains what a recurring reminder is. How: This is rendered as the second entry of IntModCom's own paragraphs prop.


	}


};



/**
 * bldAddFun = Build Add Function
 *
 * @summary
 * Requires the user to actually click the "+" button themselves (Next stays
 * disabled): the click is not just a gate, it is the thing being taught, and
 * it also opens the real add-reminder form. runFun() publishes the sample's
 * prefill data onto the emlTouObj bus (read by reminders.jsx's own startAdd)
 * in the click-guard's capture phase, the same batch as startAdd's own bubble-
 * phase handler, using the same ordering trick as the Picker tour's own Step
 * 2.
 *
 * This is deliberately NOT set any earlier (for example the intro modal's
 * onStart, where an earlier version of this tour published it), since resuming
 * skips the intro modal entirely (see RemTouCom's own resBoo handling
 * below), and a resumed session still reaches this step via a real click, so
 * publishing here instead of there is the one place that fires on every path.
 * Resumable stays at its default (no flag needed) since this button always
 * exists on Today regardless of any form being open, so it survives a reload
 * fine.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const bldAddFun = ( varKeyStr, state ) => { // What: Build Add Function. Why: This builds both tours' shared step that highlights the real "+" button. How: This returns a step object whose runFun() stages the live sample's prefill data onto the bus before the real click opens the add-reminder form.


	const varCopObj = VAR_COP_OBJ[ varKeyStr ]; // What: Variant Copy Object. Why: The step's own runFun() needs this varKeyStr's own sample task id to look up the live sample. How: This looks up VAR_COP_OBJ by varKeyStr.

	return { // What: Step Object Return. Why: GuidedTour needs this step's own selector, copy, and side effect. How: This returns the plain step object read by RemTouCom's own steObjArr below.


		selStr    : '.rem-add-btn', // What: Selector String. Why: This step highlights the real "+" button that opens the add-reminder form. How: GuidedTour spotlights whatever this selector matches.
		tabStr    : 'today', // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
		titStr    : 'Create a Reminder', // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.
		bodEle    : <>The "+" button is always present on the Today page and will <b>open the interface for creating a Reminder</b>. Go ahead and click the "+" button now.</>, // What: Body Element. Why: This step's own coach card needs a plain description of what the "+" button does. How: GuidedTour renders this as the step's own descriptive paragraph, written as JSX so specific phrases can be bolded.
		priStr    : 'Next', // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuidedTour renders this as the button's own visible text.
		bacBoo    : false, // What: Back Boolean. Why: This is the tour's very first step, so there is nothing to go back to. How: GuidedTour hides its own Back button whenever this is false.
		reqCliBoo : true, // What: Require Click Boolean. Why: The click itself is the thing being taught, not just a gate. How: GuidedTour disables Next and only advances once the real target is clicked.

		runFun : () => { // What: Run Function. Why: The live sample's own prefill data needs staging onto the bus before the real click opens the form. How: This looks up the live sample task, falling back to OB_TASKS' own static template, then publishes its own name/repeat/daysOfWeek onto the bus.


			const samTasObj = ( state.tasks || [] ).find( ( curTasObj ) => curTasObj.id === varCopObj.ideStr ) || OB_TASKS.find( ( curTasObj ) => curTasObj.id === varCopObj.ideStr ); // What: Sample Task Object. Why: The Welcome Tour seeds the recurring sample with today's real weekday (see onboarding.jsx's own Generate step), which the static OB_TASKS template does not know, so the live one must win whenever it exists. How: This reads the live sample off state.tasks first, falling back to OB_TASKS only when no live one exists yet.

			emlTouObj.set({ // What: Prefill Publish Call. Why: reminders.jsx's own startAdd reads this in its own bubble-phase handler to prefill the real add-reminder form. How: This builds the prefill shape from the resolved samTasObj above.


				prefill : {


					name              : samTasObj.name,                                       // What: Name Field. Why: The real form's own name input needs the sample's own name. How: This reads samTasObj.name straight through.
					repeat            : samTasObj.repeat,                                     // What: Repeat Field. Why: The real form's own Repeat control needs the sample's own schedule kind. How: This reads samTasObj.repeat straight through.
					...( samTasObj.daysOfWeek ? { daysOfWeek : samTasObj.daysOfWeek } : {} ), // What: Days Of Week Spread. Why: Only a weekly sample actually has this field, and the real form should not receive an explicit undefined for the others. How: This spreads daysOfWeek in only when samTasObj itself has one.
					createdFromSample : varCopObj.ideStr                                      // What: Created From Sample Field. Why: A future Replay needs to find and update this same reminder instead of creating a duplicate. How: This tags the prefill with the sample task's own id.


				}


			});


		},


	};


};



const NAM_STE_OBJ = { // What: Name Step Object. Why: Both tour variants share this exact step, highlighting the real name input right after Step 1's click opens the form. How: This is spread as-is into both variants' own steObjArr below; resBoo stays false since its own target only exists once the add-reminder form is already open, which a reload does not survive.


	selStr : '.rem-quickadd input', // What: Selector String. Why: This step highlights the real name input inside the now-open add-reminder form. How: GuidedTour spotlights whatever this selector matches.
	tabStr : 'today', // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
	titStr : 'Give it a name', // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.
	bodEle : <>This is the name of the reminder and is what will be <b>shown in your todo list on the Today page</b>. We’ve already filled this out for you but feel free to customize it to whatever you’d prefer.</>, // What: Body Element. Why: This step's own coach card needs a plain description of what the name field is for. How: GuidedTour renders this as the step's own descriptive paragraph, written as JSX so specific phrases can be bolded.
	priStr : 'Next', // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuidedTour renders this as the button's own visible text.
	bacBoo : true, // What: Back Boolean. Why: The user should always be able to return to the previous, "click the +" step. How: GuidedTour shows its own Back button whenever this is true.
	resBoo : false // What: Resumable Boolean. Why: This step's own target only exists because Step 1's click already opened the form, which a reload does not survive. How: GuidedTour's own resume-persist effect never checkpoints a step whose resBoo is false.


};



/**
 * REP_STE_OBJ = Repeat Step Object
 *
 * @summary
 * The recurring tour's own Step 3: all 4 non-"Once" pills of the Repeat
 * segmented control, highlighted together as one combined region. '.seg-btn ~
 * .seg-btn' matches every pill after the first, that is every option except
 * "Once", since reminders.jsx's own REPEAT_OPTS always lists "Once" first.
 *
 * Also scoped to '.seg[aria-label="Repeat"]' specifically, not just '.rem-
 * quickadd-wrap', since Monthly/Yearly's own Date/Weekday toggle below is a
 * second, nested SegConCom control ('aria-label="Day selection"'); without
 * that extra scoping, finTarFun's own querySelectorAll would match its pills
 * too the moment one of those repeat kinds is selected, unioning the highlight
 * down to include that whole control as well.
 *
 * No reqCliBoo: there is no single correct pill to click, the prefilled
 * "Weekly" is just a starting point the user is free to change.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const REP_STE_OBJ = { // What: Repeat Step Object. Why: The recurring tour's own Step 3 needs a single combined highlight over every non-"Once" Repeat pill. How: This is spread as-is into the recurring varKeyStr's own steObjArr below.


	selStr : '.rem-quickadd-wrap .seg[aria-label="Repeat"] .seg-btn ~ .seg-btn', // What: Selector String. Why: This step highlights every Repeat pill except "Once", scoped narrowly enough to exclude the Monthly/Yearly Date/Weekday toggle below it. How: GuidedTour spotlights every element this combined selector matches.
	tabStr : 'today', // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
	titStr : 'Select recurring schedule', // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.
	bodEle : <>Recurring reminders have multiple options for <b>how often they should show up in your todo list</b>. We’ve already selected "Weekly" for you but feel free to select whichever one you’d prefer.</>, // What: Body Element. Why: This step's own coach card needs a plain description of what the Repeat pills control. How: GuidedTour renders this as the step's own descriptive paragraph, written as JSX so specific phrases can be bolded.
	priStr : 'Next', // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuidedTour renders this as the button's own visible text.
	bacBoo : true, // What: Back Boolean. Why: The user should always be able to return to the previous, name-input step. How: GuidedTour shows its own Back button whenever this is true.
	resBoo : false // What: Resumable Boolean. Why: This step's own target only exists because the add-reminder form is already open, which a reload does not survive. How: GuidedTour's own resume-persist effect never checkpoints a step whose resBoo is false.


};



/**
 * REP_COP_OBJ = Repeat Copy Object
 *
 * @summary
 * Step 4 highlights whichever schedule control Step 3's own pill choice
 * reveals below it, the same container ('.rem-extra-fade') regardless of which
 * one that is, since reminders.jsx's own ReminderEditor only ever renders one
 * at a time. Only the copy needs to track the live selection, keyed by
 * reminders.jsx's own REPEAT_OPTS keys (interval/weekly/monthly/annual, "Once"
 * never reaches this tour at all).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const REP_COP_OBJ = { // What: Repeat Copy Object. Why: Step 4's own copy differs by which schedule control Step 3's pill choice revealed. How: This is looked up by bldFrqFun below, keyed by the live draft's own repeat kind.


	interval : {


		titStr  : 'Select recurring frequency',                                         // What: Title String. Why: This kind's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.
		leaStr  : 'how frequently a recurring reminder will show up in your todo list', // What: Lead String. Why: This is the shared, kind-specific middle clause of the step's own bodEle copy. How: This is interpolated into bldFrqFun's own bodEle below.
		taiStr  : ', with an additional selector control for the start date.',          // What: Tail String. Why: An interval-based schedule also needs a start date, unlike the other 3 kinds. How: This is appended after leaStr in bldFrqFun's own bodEle below.
		pluBoo  : true                                                                  // What: Plural Boolean. Why: An interval schedule's own body copy needs to say "these selections" (plural), unlike the other 3 kinds' single selection. How: This is read by bldFrqFun below to pick between "this selection"/"these selections".


	},

	weekly   : {


		titStr : 'Select day of the week',                                                                     // What: Title String. Why: This kind's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.
		leaStr : 'how often and which day(s) of the week a recurring reminder will show up in your todo list', // What: Lead String. Why: This is the shared, kind-specific middle clause of the step's own bodEle copy. How: This is interpolated into bldFrqFun's own bodEle below.
		taiStr : ' (multiple days may be selected).'                                                           // What: Tail String. Why: A weekly schedule can select more than one day. How: This is appended after leaStr in bldFrqFun's own bodEle below.


	},

	monthly  : {


		titStr : 'Select day of the month',                                                                             // What: Title String. Why: This kind's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.
		leaStr : 'how often and which day or weekday of the month a recurring reminder will show up in your todo list', // What: Lead String. Why: This is the shared, kind-specific middle clause of the step's own bodEle copy. How: This is interpolated into bldFrqFun's own bodEle below.
		taiStr : '.'                                                                                                    // What: Tail String. Why: A monthly schedule's own lead clause already reads as a complete sentence. How: This is appended after leaStr in bldFrqFun's own bodEle below.


	},

	annual   : {


		titStr : 'Select day of the year',                                                                             // What: Title String. Why: This kind's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.
		leaStr : 'how often and which day or weekday of the year a recurring reminder will show up in your todo list', // What: Lead String. Why: This is the shared, kind-specific middle clause of the step's own bodEle copy. How: This is interpolated into bldFrqFun's own bodEle below.
		taiStr : '.'                                                                                                   // What: Tail String. Why: An annual schedule's own lead clause already reads as a complete sentence. How: This is appended after leaStr in bldFrqFun's own bodEle below.


	}


};



const bldFrqFun = ( repValStr ) => { // What: Build Frequency Function. Why: Step 4 highlights whichever schedule control the recurring draft's own repeat kind reveals, with copy that tracks it. How: This looks up REP_COP_OBJ by repValStr, falling back to 'weekly' for the one frame before reminders.jsx's own startAdd/draftActions have published a real value onto the bus yet.


	const repCopObj = REP_COP_OBJ[ repValStr ] || REP_COP_OBJ.weekly; // What: Repeat Copy Object. Why: The step's own titStr/bodEle below need this repeat kind's own copy. How: This looks up REP_COP_OBJ by repValStr, falling back to weekly.

	return { // What: Step Object Return. Why: GuidedTour needs this step's own selector, copy, and flags. How: This returns the plain step object read by RemTouCom's own steObjArr below.


		selStr    : '.rem-quickadd-wrap .rem-extra-fade', // What: Selector String. Why: This step highlights whichever schedule control the recurring draft's own repeat kind reveals below the Repeat pills. How: GuidedTour spotlights whatever this selector matches.
		tabStr    : 'today', // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
		titStr    : repCopObj.titStr, // What: Title String. Why: This step's own coach card needs a heading naming what this repeat kind's own control does. How: GuidedTour renders repCopObj.titStr as the step's own heading text.
		bodEle    : <>This option controls <b>{ repCopObj.leaStr }</b>{ repCopObj.taiStr } We’ve already made { repCopObj.pluBoo ? 'these selections' : 'this selection' } for you but feel free to customize it to whatever you’d prefer.</>, // What: Body Element. Why: This step's own coach card needs a plain description of what this repeat kind's own control does. How: GuidedTour renders this as the step's own descriptive paragraph, written as JSX so specific phrases can be bolded.
		priStr    : 'Next', // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuidedTour renders this as the button's own visible text.
		bacBoo    : true, // What: Back Boolean. Why: The user should always be able to return to the previous, Repeat-pills step. How: GuidedTour shows its own Back button whenever this is true.
		resBoo    : false, // What: Resumable Boolean. Why: This step's own target only exists because the add-reminder form is already open, which a reload does not survive. How: GuidedTour's own resume-persist effect never checkpoints a step whose resBoo is false.
		coaTopBoo : true // What: Coach At Top Boolean. Why: The ease modes' own 2-paragraph descriptions can be tall enough to rival a short mobile viewport's whole height. How: GuidedTour skips its own reserve-space math for this step and gives it a precise initial scroll target instead.


	};


};



/**
 * bldSubFun = Build Submit Function
 *
 * @summary
 * Both tours' closing step: the real "Add" button. reqCliBoo plus
 * priStr:'Done' together mean Next stays disabled and clicking the button
 * itself both saves the reminder AND ends the tour (GuidedTour's own finish(),
 * not just an advance, see onboarding-tour-runner.jsx's own onPrimary). The
 * recurring varKeyStr gets one extra sentence about the recurrence date.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const bldSubFun = ( varKeyStr ) => ({


	selStr : '.rem-quickadd-wrap .btn--primary', // What: Selector String. Why: This step highlights the real "Add" button that both saves the reminder and ends the tour. How: GuidedTour spotlights whatever this selector matches.
	tabStr : 'today',                            // What: Tab String. Why: GuidedTour needs to know which app tab this step's own target lives on. How: This is read by GuidedTour's own tab-sync effect.
	titStr : 'Add your new Reminder',            // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuidedTour renders this as the step's own heading text.

	bodEle : varKeyStr === 'recurring' // What: Body Ternary. Why: The recurring varKeyStr needs an extra sentence about the recurrence date the one-time varKeyStr does not. How: This ternary picks between 2 JSX bodies based on varKeyStr.
		? <>We’re all done creating this reminder item. Go ahead and click the "Add" button now to <b>add it to your todo list</b>. NOTE: if you selected a day other than today as the recurrence date, then this item will not show up in your todo list until it is due.</>
		: <>We’re all done creating this reminder item. Go ahead and click the "Add" button now to <b>add it to your todo list</b>.</>,

	priStr    : 'Done', // What: Primary String. Why: This is both tours' own last step, so its main action finishes the tour instead of advancing. How: GuidedTour reads a 'Done' priStr as the signal to call onFinTouFun instead of moving to a next step.
	bacBoo    : true,   // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuidedTour shows its own Back button whenever this is true.
	reqCliBoo : true,   // What: Require Click Boolean. Why: The real click both saves the reminder and ends the tour, so the tour must not advance on its own before that click happens. How: GuidedTour disables Next and only advances once the real target is clicked.
	resBoo    : false   // What: Resumable Boolean. Why: This step's own target only exists because the add-reminder form is already open, which a reload does not survive. How: GuidedTour's own resume-persist effect never checkpoints a step whose resBoo is false.


});



// #region RemTouCom

/**
 * RemTouCom = Reminder Tour Component
 *
 * @summary
 * Renders whichever piece of one varKeyStr's own reminder mini-tour is currently
 * relevant: the intro modal, or the running GuidedTour. Both variants ('once'
 * and 'recurring') share the exact same 2 opening steps (bldAddFun,
 * NAM_STE_OBJ) and the exact same closing step (bldSubFun); only the recurring
 * varKeyStr adds 2 extra steps in between (REP_STE_OBJ, bldFrqFun) for its own
 * Repeat schedule.
 *
 * Every step stays on Today, and this component is only ever mounted from
 * within TabToday (see tab-today.jsx's own startMiniTour), so
 * actIdeStr/selTabFun are hardcoded/stubbed below rather than threaded all
 * the way up; a future step needing another tab would need this lifted the
 * way Onboarding (onboarding.jsx) is.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.varKeyStr   - Variant Key String: Which sample reminder this
 *                            mounts for, 'once' or 'recurring'.
 * @param props.state       - State: The entire app's own persisted state.
 * @param props.actions     - Actions: The actions that mutate props.state.
 * @param props.onCloFrmFun - On Close Form Function: Closes the real
 *                            add-reminder form on Today, exactly like its
 *                            own Cancel button would.
 * @param props.onCloFun    - On Close Function: Clears tab-today.jsx's own
 *                            activeMiniTour, ending this mount.
 *
 * @returns Either the intro modal (touPhaStr 'intro') or the running
 * guided tour (touPhaStr 'tour'), depending on this varKeyStr's own
 * phase.
 *
 * @example
 * ```tsx
 * RemTouCom({ varKeyStr, state, actions, onCloFrmFun, onCloFun })
 * // => <RemTouCom />
 * ```
 *
*/

function RemTouCom ( { varKeyStr, state, actions, onCloFrmFun, onCloFun } ) {


	const varCopObj = VAR_COP_OBJ[ varKeyStr ]; // What: Variant Copy Object. Why: Both the intro modal and cloTouFun below need this varKeyStr's own sample task id, icon, title, and second paragraph. How: This looks up VAR_COP_OBJ by the varKeyStr prop.

	const { draftRepeat } = useEmlTouFun(); // What: Draft Repeat. Why: Only the recurring tour's own Step 4 actually depends on this, but the hook itself has to run unconditionally either way. How: This subscribes to the shared bus and reads its own draftRepeat field, harmless to read up front even when unused.


	const onbStaObj = state.onboarding || {}; // What: Onboarding State Object. Why: A reload lands here with tab-today.jsx's own activeMiniTour already re-derived from the SAME persisted activeTour, so this just decides whether to skip the intro modal and which step to resume into. How: This reads state.onboarding, falling back to an empty object.
	const resTouObj = onbStaObj.activeTour && onbStaObj.activeTour.id === `reminder-${ varKeyStr }` ? onbStaObj.activeTour : null; // What: Resume Tour Object. Why: See onboarding-tour-runner.jsx's own resBoo field doc comment for why this is a checkpoint, not necessarily the exact step the user was last on. How: This reads onbStaObj.activeTour back out only when its own id matches this varKeyStr's own touIdeStr, otherwise null.
	const [ touPhaStr, setTouPhaStr ] = React.useState( resTouObj ? 'tour' : 'intro' ); // What: Tour Phase String And Setter. Why: This is the mini-tour's own top-level position, 'intro' (the modal showing) or 'tour' (GuidedTour running). How: This starts on 'tour' whenever resTouObj says a tour was left running, otherwise 'intro'.



	const cloTouFun = ( staValStr ) => { // What: Close Tour Function. Why: Clears the checklist status and the shared bus's own prefill together, the only two bits of state this tour ever touches outside its own local phase. How: This never touches the sample task itself (see bldAddFun's own runFun() above), only the new draft it seeded gets built from it.


		emlTouObj.set( { prefill : null } ); // What: Prefill Clear Call. Why: A stale prefill left over from Step 1 must not leak into whatever the add-reminder form shows next. How: This clears the shared bus's own prefill field.

		actions.setChecklistItem( varCopObj.ideStr, { status : staValStr } ); // What: Checklist Status Update Call. Why: The launcher card on Today reads this to know whether to keep showing itself. How: This updates this varKeyStr's own sample task's checklist entry to staValStr.

		onCloFun(); // What: On Close Call. Why: tab-today.jsx's own activeMiniTour must be cleared however this tour ends. How: This calls the onCloFun prop passed down from tab-today.jsx.


	};



	if ( touPhaStr === 'intro' ) { // What: Intro Phase Check. Why: The intro modal must show before any spotlight step ever does. How: This returns IntModCom below whenever touPhaStr is 'intro'.


		return (


			<IntModCom
				icon={ <IcoSvgCom name={ varCopObj.icoStr } size={ 54 } /> }
				title={ varCopObj.titStr }
				paragraphs={ [ FIR_PAR_ELE, varCopObj.bodStr ] }
				pills={ [ 'reminders', 'one-time', 'recurring' ] }
				onStart={ () => setTouPhaStr( 'tour' ) }
				onSkip={ () => { // What: On Skip Handler. Why: This mirrors the launcher card's own X button exactly, marking the card cancelled without touching the underlying sample reminder. How: This never sets the prefill at this point, so there is nothing to clear.


					actions.setChecklistItem( varCopObj.ideStr, { status : 'cancelled' } ); // What: Checklist Status Cancel Call. Why: Skipping the intro modal still needs the launcher card to stop showing itself. How: This updates this varKeyStr's own sample task's checklist entry to 'cancelled'.

					onCloFun(); // What: On Close Call. Why: tab-today.jsx's own activeMiniTour must be cleared however this tour ends. How: This calls the onCloFun prop passed down from tab-today.jsx.


				} }
			/> // What: Tutorial Intro Modal Element. Why: This is this varKeyStr's own opening screen, shown before any spotlight step ever does. How: This is passed this varKeyStr's own icon/title/paragraphs/pills and the onStart/onSkip handlers above.


		);


	}



	const steObjArr = varKeyStr === 'recurring' // What: Step Object Array. Why: The recurring varKeyStr has 2 extra steps (the Repeat pills and the schedule-detail step) the one-time varKeyStr skips entirely. How: This ternary picks between the 2 full step lists, both starting with bldAddFun and NAM_STE_OBJ and ending with bldSubFun.
		? [ bldAddFun( varKeyStr, state ), NAM_STE_OBJ, REP_STE_OBJ, bldFrqFun( draftRepeat ), bldSubFun( varKeyStr ) ]
		: [ bldAddFun( varKeyStr, state ), NAM_STE_OBJ, bldSubFun( varKeyStr ) ];



	return (


		<GuidedTour
			touIdeStr={ `reminder-${ varKeyStr }` }
			steObjArr={ steObjArr }
			resSteNum={ resTouObj ? resTouObj.step : 0 }
			actions={ actions }
			actIdeStr='today'
			selTabFun={ () => {} }
			onBacFun={ ( tarSteNum ) => { if ( tarSteNum === 0 ) onCloFrmFun(); } } // What: On Go Back Handler. Why: Back to Step 1 re-highlights the "+" button, which toggles the add form open or closed. How: Closing it here keeps Step 1's own click meaning exactly what it always means, open the form, instead of closing an already-open one.
			onSkiTouFun={ () => { // What: On Skip Handler. Why: Skip discards the in-progress form exactly like its own Cancel button would. How: onCloFrmFun is a no-op if the form is not even open, for example Skip from Step 1.


				onCloFrmFun(); // What: Close Reminder Form Call. Why: A half-created reminder should not survive behind the scenes just because the user backed out via the tour instead of the form itself. How: This closes the add-reminder form exactly like its own Cancel button would.

				cloTouFun( 'skipped' ); // What: Close Tour Call. Why: This funnels Skip through the same cleanup any other exit path off this tour uses. How: This clears the bus prefill, updates the checklist to 'skipped', and calls onCloFun.


			} }
			onFinTouFun={ () => cloTouFun( 'finished' ) } // What: On Finish Handler. Why: This only fires from bldSubFun's own reqCliBoo, after the real click that saves the reminder has already reached the button's own handler. How: This deliberately does not touch the form, since closing it here would discard the save instead of letting it happen.
		/> // What: Guided Tour Element. Why: This is the actual running spotlight walkthrough for this varKeyStr, mounted once its own intro modal has been accepted or resumed into. How: This is passed this varKeyStr's own touIdeStr, steObjArr, and the resume/lifecycle plumbing above.


	);


}

// #endregion RemTouCom



export { RemTouCom }; // What: Named Exports. Why: tab-today.jsx renders this as the Reminders section's own guided tour. How: This re-exports RemTouCom; every other binding in this file is internal-only.


