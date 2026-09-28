


// #region Imports

import React from 'react'; // What: React. Why: This file's own RemTouCom component and its step-building helpers all need React in scope to compile their JSX. How: This is used directly (React.useState) below, instead of importing individual named hooks.


import { emlTouObj    } from '../state/tour-bus.js';             // What: Ease My Life Tour Object. Why: This publishes the running tour's prefill data for the real reminder form and clears it again on every exit path. How: This is written to via .set() in buiAddFun's runFun and cloTouFun below.
import { GuiTouCom    } from './tour-runner.jsx';                // What: Guided Tour Component. Why: This is the generic spotlight-tour engine that actually drives each reminder mini-tour once its own intro modal is accepted. How: This is rendered while touPhaStr is 'tour', passed this file's own per-varKeyStr step array.
import { IcoSvgCom    } from '../ui/ui.jsx';                     // What: Icon Svg Component. Why: The intro modal needs a recognizable glyph matching the current varKeyStr. How: This is rendered as the intro modal's icon below.
import { IntModCom    } from './intro-modal.jsx';                // What: Intro Modal Component. Why: Each reminder mini-tour opens on this generic intro modal before any spotlight step ever shows. How: This is rendered while touPhaStr is 'intro', passed this file's own per-varKeyStr copy.
import { ONB_TAS_ARR  } from '../state/onboarding-seed-data.js'; // What: Onboarding Task Array. Why: A reload can land on this tour before the live sample task has been re-derived from state.tasks. How: This is searched as the fallback template lookup in buiAddFun's runFun below.
import { useEmlTouFun } from '../state/tour-bus.js';             // What: Use Ease My Life Tour Function. Why: The recurring tour's own Step 4 needs to read the live draft's current schedule type off the shared bus. How: This is called once to subscribe to the bus and read its own draRepStr field.

// #endregion Imports



/**
 * reminder-tours.jsx = Reminder Tours
 *
 * @summary
 * Content for the two Reminders mini-tours ("Set up a one-time reminder" /"Set
 * up a recurring reminder"), launched by Play on their sample launcher cards
 * on Today (see reminders.jsx's own RemCarCom, whose tutorial card calls
 * onPlaTutFun). Both share the same intro-modal structure and first paragraph
 * (FIR_PAR_ELE below); only the icon, title, and second paragraph differ by
 * varKeyStr (VAR_COP_OBJ below), matching the two sample reminders seeded by
 * the Welcome Tour (onboarding-seed-data.js's ONB_TAS_ARR: tk_ob_meds is the
 * one-time sample, tk_ob_trash the recurring one).
 *
 * Sections:
 *  - Constants
 *  - Helpers
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const FIR_PAR_ELE = <>Reminders can be thought of as <b>what a normal task would be in a typical todo list app</b>, since not all tasks can be randomly selected. Taking out the trash for pickup, as an example, since this must be done on a set day every week.</>; // What: First Paragraph Element. Why: This is the intro modal's shared opening paragraph, identical for both tour variants. How: This is passed as the first entry of IntModCom's own parEleArr prop in the render below.



const NAM_STE_OBJ = { // What: Name Step Object. Why: Both tour variants share this exact step, highlighting the real name input right after Step 1's click opens the form. How: This is spread as-is into both variants' own steObjArr below; resBoo stays false since its own target only exists once the add-reminder form is already open, which a reload does not survive.


	bacBoo : true,                  // What: Back Boolean. Why: The user should always be able to return to the previous, "click the +" step. How: GuiTouCom shows its own Back button whenever this is true.
	priStr : 'Next',                // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
	resBoo : false,                 // What: Resumable Boolean. Why: This step's own target only exists because Step 1's click already opened the form, which a reload does not survive. How: GuiTouCom's own resume-persist effect never checkpoints a step whose resBoo is false.
	selStr : '.rem-quickadd input', // What: Selector String. Why: This step highlights the real name input inside the now-open add-reminder form. How: GuiTouCom spotlights whatever this selector matches.
	tabStr : 'today',               // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.
	titStr : 'Give it a name',      // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuiTouCom renders this as the step's own heading text.

	bodEle : <>This is the name of the reminder and is what will be <b>shown in your todo list on the Today page</b>. We’ve already filled this out for you but feel free to customize it to whatever you’d prefer.</> // What: Body Element. Why: This step's own coach card needs a plain description of what the name field is for. How: GuiTouCom renders this as the step's own descriptive paragraph, written as JSX so specific phrases can be bolded.


};



// #region REP_COP_OBJ

/**
 * REP_COP_OBJ = Repeat Copy Object
 *
 * @summary
 * Step 4 highlights whichever schedule control Step 3's own pill choice
 * reveals below it, the same container ('.rem-extra-fade') regardless of which
 * one that is, since reminders.jsx's own SchEdiCom only ever renders one
 * at a time. Only the copy needs to track the live selection, keyed by
 * reminders.jsx's own REP_OPT_ARR keys (interval/weekly/monthly/annual, "Once"
 * never reaches this tour at all).
 *
 * Every entry shares this exact shape, and none of the entries below repeat
 * these same fields' own boilerplate comments on their own lines (see the
 * "Repeated-shape object literals" comment exception in CLAUDE.md):
 *
 * - `leaStr` (String): Lead String is the shared, kind-specific middle clause
 *   of the step's own bodEle copy; interpolated into buiFreFun's own bodEle
 *   below.
 *
 * - `pluBoo` (Boolean, optional): Plural Boolean is read by buiFreFun to pick
 *   between "this selection"/"these selections"; only present on the interval
 *   entry, since that is the one kind whose own body copy needs the plural
 *   phrasing.
 *
 * - `taiStr` (String): Tail String is appended after leaStr in buiFreFun's own
 *   bodEle below. Each entry's own comment explains why its specific tail text
 *   was chosen, since that reasoning genuinely differs per kind.
 *
 * - `titStr` (String): Title String is this kind's own coach-card heading,
 *   rendered by GuiTouCom as the step's own heading text.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const REP_COP_OBJ = { // What: Repeat Copy Object. Why: Step 4's own copy differs by which schedule control Step 3's pill choice revealed. How: This is looked up by buiFreFun below, keyed by the live draft's own repeat kind.


	annual : { // What: Annual Entry. Why: This is the copy content descriptor for the annual recurring-schedule control. How: This is looked up by REP_COP_OBJ via the live draft's own 'annual' repeat kind.


		leaStr : 'how often and which day or weekday of the year a recurring reminder will show up in your todo list',
		taiStr : '.', // What: Tail String. Why: An annual schedule's own lead clause already reads as a complete sentence. How: This is appended after leaStr in buiFreFun's own bodEle below.
		titStr : 'Select day of the year'


	},

	interval : { // What: Interval Entry. Why: This is the copy content descriptor for the interval recurring-schedule control. How: This is looked up by REP_COP_OBJ via the live draft's own 'interval' repeat kind.


		leaStr : 'how frequently a recurring reminder will show up in your todo list',
		pluBoo : true,
		taiStr : ', with an additional selector control for the start date.', // What: Tail String. Why: An interval-based schedule also needs a start date, unlike the other 3 kinds. How: This is appended after leaStr in buiFreFun's own bodEle below.
		titStr : 'Select recurring frequency'


	},

	monthly : { // What: Monthly Entry. Why: This is the copy content descriptor for the monthly recurring-schedule control. How: This is looked up by REP_COP_OBJ via the live draft's own 'monthly' repeat kind.


		leaStr : 'how often and which day or weekday of the month a recurring reminder will show up in your todo list',
		taiStr : '.', // What: Tail String. Why: A monthly schedule's own lead clause already reads as a complete sentence. How: This is appended after leaStr in buiFreFun's own bodEle below.
		titStr : 'Select day of the month'


	},

	weekly : { // What: Weekly Entry. Why: This is the copy content descriptor for the weekly recurring-schedule control. How: This is looked up by REP_COP_OBJ via the live draft's own 'weekly' repeat kind.


		leaStr : 'how often and which day(s) of the week a recurring reminder will show up in your todo list',
		taiStr : ' (multiple days may be selected).', // What: Tail String. Why: A weekly schedule can select more than one day. How: This is appended after leaStr in buiFreFun's own bodEle below.
		titStr : 'Select day of the week'


	}


};

// #endregion REP_COP_OBJ



// #region REP_STE_OBJ

/**
 * REP_STE_OBJ = Repeat Step Object
 *
 * @summary
 * The recurring tour's own Step 3: all 4 non-"Once" pills of the Repeat
 * segmented control, highlighted together as one combined region. '.seg-btn ~
 * .seg-btn' matches every pill after the first, that is every option except
 * "Once", since reminders.jsx's own REP_OPT_ARR always lists "Once" first.
 *
 * Also scoped to '.seg[aria-label="Repeat"]' specifically, not just
 * '.rem-quickadd-wrap', since Monthly/Yearly's own Date/Weekday toggle below
 * is a second, nested SegConCom control ('aria-label="Day selection"');
 * without that extra scoping, finTarFun's own querySelectorAll would match its
 * pills too the moment one of those repeat kinds is selected, unioning the
 * highlight down to include that whole control as well.
 *
 * No cirBoo: there is no single correct pill to click, the prefilled "Weekly"
 * is just a starting point the user is free to change.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const REP_STE_OBJ = { // What: Repeat Step Object. Why: The recurring tour's own Step 3 needs a single combined highlight over every non-"Once" Repeat pill. How: This is spread as-is into the recurring varKeyStr's own steObjArr below.


	bacBoo : true,                                                               // What: Back Boolean. Why: The user should always be able to return to the previous, name-input step. How: GuiTouCom shows its own Back button whenever this is true.
	priStr : 'Next',                                                             // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
	resBoo : false,                                                              // What: Resumable Boolean. Why: This step's own target only exists because the add-reminder form is already open, which a reload does not survive. How: GuiTouCom's own resume-persist effect never checkpoints a step whose resBoo is false.
	selStr : '.rem-quickadd-wrap .seg[aria-label="Repeat"] .seg-btn ~ .seg-btn', // What: Selector String. Why: This step highlights every Repeat pill except "Once", scoped narrowly enough to exclude the Monthly/Yearly Date/Weekday toggle below it. How: GuiTouCom spotlights every element this combined selector matches.
	tabStr : 'today',                                                            // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.
	titStr : 'Select recurring schedule',                                        // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuiTouCom renders this as the step's own heading text.

	bodEle : <>Recurring reminders have multiple options for <b>how often they should show up in your todo list</b>. We’ve already selected "Weekly" for you but feel free to select whichever one you’d prefer.</> // What: Body Element. Why: This step's own coach card needs a plain description of what the Repeat pills control. How: GuiTouCom renders this as the step's own descriptive paragraph, written as JSX so specific phrases can be bolded.


};

// #endregion REP_STE_OBJ



const VAR_COP_OBJ = { // What: Variant Copy Object. Why: Each tour varKeyStr needs its own sample task id, icon, title, and second intro paragraph. How: This is looked up by varKeyStr ('once'/'recurring') everywhere a step or the intro modal needs varKeyStr-specific copy.


	once : { // What: Once Entry. Why: This is the copy content descriptor for the one-time reminder tour variant. How: This is looked up by VAR_COP_OBJ via the real 'once' varKeyStr.


		icoStr : 'pinEle',             // What: Icon String. Why: The intro modal needs a glyph matching this varKeyStr. How: This is passed to IcoSvgCom's own name prop in the render below.
		ideStr : 'tk_ob_meds',         // What: Identifier String. Why: This ties the 'once' varKeyStr to its own sample reminder. How: This is read back against state.tasks/ONB_TAS_ARR by buiAddFun's runFun below and against the checklist by cloTouFun.
		titStr : 'One-Time Reminders', // What: Title String. Why: The intro modal needs a heading naming this varKeyStr. How: This is rendered as IntModCom's own titHeaStr prop.

		bodStr : 'One-time reminders are simple one off things that need to get done and will never show up again once they are marked as completed in your todo list. e.g. pickup precription or pickup dry cleaning. Let’s create one of these now.' // What: Body String. Why: This varKeyStr's own second intro paragraph explains what a one-time reminder is. How: This is rendered as the second entry of IntModCom's own parEleArr prop.


	},

	recurring : { // What: Recurring Entry. Why: This is the copy content descriptor for the recurring reminder tour variant. How: This is looked up by VAR_COP_OBJ via the real 'recurring' varKeyStr.


		icoStr : 'calEle',              // What: Icon String. Why: The intro modal needs a glyph matching this varKeyStr. How: This is passed to IcoSvgCom's own name prop in the render below.
		ideStr : 'tk_ob_trash',         // What: Identifier String. Why: This ties the 'recurring' varKeyStr to its own sample reminder. How: This is read back against state.tasks/ONB_TAS_ARR by buiAddFun's runFun below and against the checklist by cloTouFun.
		titStr : 'Recurring Reminders', // What: Title String. Why: The intro modal needs a heading naming this varKeyStr. How: This is rendered as IntModCom's own titHeaStr prop.

		bodStr : 'Recurring tasks are things that need to get done on a set schedule. e.g. take trash out for pickup (weekly) or get the mail (daily). Let’s create one of these now.' // What: Body String. Why: This varKeyStr's own second intro paragraph explains what a recurring reminder is. How: This is rendered as the second entry of IntModCom's own parEleArr prop.


	}


};

// #endregion Constants



// #region Helpers

// #region buiAddFun

/**
 * buiAddFun = Build Add Function
 *
 * @summary
 * Requires the user to actually click the "+" button themselves (Next stays
 * disabled): the click is not just a gate, it is the thing being taught, and
 * it also opens the real add-reminder form. runFun publishes the sample's
 * prefill data onto the emlTouObj bus (read by reminders.jsx's own staAddFun)
 * in the click-guard's capture phase, ahead of staAddFun's own bubble-phase
 * handler, using the same ordering trick as the Picker tour's own Step 2.
 *
 * This is deliberately NOT set any earlier (for example the intro modal's
 * onBegTouFun, where an earlier version of this tour published it), since
 * resuming skips the intro modal entirely (see RemTouCom's own resBoo handling
 * below), and a resumed session still reaches this step via a real click, so
 * publishing here instead of there is the one place that fires on every path.
 * Resumable stays at its default (no flag needed) since this button always
 * exists on Today regardless of any form being open, so it survives a reload
 * fine.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param varKeyStr - Variant Key String: Which tour variant this step is for,
 *                    'once' or 'recurring'.
 * @param staAppObj - State App Object: The entire app's own persisted state,
 *                    searched for the live sample task.
 *
 * @returns A GuiTouCom step object for this tour's own steObjArr.
 *
 * @example
 * ```ts
 * buiAddFun( varKeyStr, staAppObj ) // => step object
 * ```
 *
*/

const buiAddFun = ( varKeyStr, staAppObj ) => { // What: Build Add Function. Why: This builds both tours' shared step that highlights the real "+" button. How: This returns a step object whose runFun stages the live sample's prefill data onto the bus before the real click opens the add-reminder form.


	const varCopObj = VAR_COP_OBJ[ varKeyStr ]; // What: Variant Copy Object. Why: The step's own runFun needs this varKeyStr's own sample task id to look up the live sample. How: This looks up VAR_COP_OBJ by varKeyStr.



	return { // What: Step Object Return. Why: GuiTouCom needs this step's own selector, copy, and side effect. How: This returns the plain step object read by RemTouCom's own steObjArr below.


		bacBoo : false,               // What: Back Boolean. Why: This is the tour's very first step, so there is nothing to go back to. How: GuiTouCom hides its own Back button whenever this is false.
		cirBoo : true,                // What: Click-Is-Required Boolean. Why: The click itself is the thing being taught, not just a gate. How: GuiTouCom disables Next and only advances once the real target is clicked.
		priStr : 'Next',              // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
		selStr : '.rem-add-btn',      // What: Selector String. Why: This step highlights the real "+" button that opens the add-reminder form. How: GuiTouCom spotlights whatever this selector matches.
		tabStr : 'today',             // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.
		titStr : 'Create a Reminder', // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuiTouCom renders this as the step's own heading text.

		bodEle : <>The "+" button is always present on the Today page and will <b>open the interface for creating a Reminder</b>. Go ahead and click the "+" button now.</>, // What: Body Element. Why: This step's own coach card needs a plain description of what the "+" button does. How: GuiTouCom renders this as the step's own descriptive paragraph, written as JSX so specific phrases can be bolded.

		runFun : () => { // What: Run Function. Why: The live sample's own prefill data needs staging onto the bus before the real click opens the form. How: This looks up the live sample task, falling back to ONB_TAS_ARR's own static template, then publishes its own name/repeat/daysOfWeek onto the bus.


			const samTasObj = ( staAppObj.tasks || [] ).find( ( curTasObj ) => curTasObj.id === varCopObj.ideStr ) || ONB_TAS_ARR.find( ( curTasObj ) => curTasObj.id === varCopObj.ideStr ); // What: Sample Task Object. Why: The Welcome Tour seeds the recurring sample with today's real weekday (see onboarding/welcome-tour.jsx's own Generate step), which the static ONB_TAS_ARR template does not know, so the live one must win whenever it exists. How: This reads the live sample off staAppObj.tasks first, falling back to ONB_TAS_ARR only when no live one exists yet.


			emlTouObj.set({ // What: Prefill Publish Call. Why: reminders.jsx's own staAddFun reads this to prefill the real add-reminder form. How: This builds the prefill shape from the resolved samTasObj above.


				preFilObj : { // What: Prefill Object. Why: reminders.jsx's own staAddFun reads this nested shape directly as the real form's own prefill payload. How: This is built from samTasObj's own resolved fields below.


					createdFromSample : varCopObj.ideStr, // What: Created From Sample Field. Why: A future Replay needs to find and update this same reminder instead of creating a duplicate. How: This tags the prefill with the sample task's own id.
					name              : samTasObj.name,   // What: Name Field. Why: The real form's own name input needs the sample's own name. How: This reads samTasObj.name straight through.
					repeat            : samTasObj.repeat, // What: Repeat Field. Why: The real form's own Repeat control needs the sample's own schedule kind. How: This reads samTasObj.repeat straight through.

					...( samTasObj.daysOfWeek ? { daysOfWeek : samTasObj.daysOfWeek } : {} ) // What: Days Of Week Spread. Why: Only a weekly sample actually has this field, and the real form should not receive an explicit undefined for the others. How: This spreads daysOfWeek in only when samTasObj itself has one.


				}


			});


		}


	};


};

// #endregion buiAddFun



// #region buiFreFun

/**
 * buiFreFun = Build Frequency Function
 *
 * @summary
 * Builds the recurring tour's own Step 4, highlighting whichever schedule
 * control the draft's repeat kind reveals below the Repeat pills
 * (.rem-extra-fade, the same container for every kind). Its title and body
 * come from REP_COP_OBJ for that kind, falling back to the weekly copy for the
 * one frame before reminders.jsx's own draft has published a real repeat kind
 * onto the bus.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param repValStr - Repeat Value String: The live draft's own repeat kind,
 *                    read off the bus as draRepStr.
 *
 * @returns A GuiTouCom step object for this tour's own steObjArr.
 *
 * @example
 * ```ts
 * buiFreFun( draRepStr ) // => step object
 * ```
 *
*/

const buiFreFun = ( repValStr ) => { // What: Build Frequency Function. Why: Step 4 highlights whichever schedule control the recurring draft's own repeat kind reveals, with copy that tracks it. How: This looks up REP_COP_OBJ by repValStr, falling back to 'weekly' for the one frame before reminders.jsx's own staAddFun/draActObj have published a real value onto the bus yet.


	const repCopObj = REP_COP_OBJ[ repValStr ] || REP_COP_OBJ.weekly; // What: Repeat Copy Object. Why: The step's own titStr/bodEle below need this repeat kind's own copy. How: This looks up REP_COP_OBJ by repValStr, falling back to weekly.



	return { // What: Step Object Return. Why: GuiTouCom needs this step's own selector, copy, and flags. How: This returns the plain step object read by RemTouCom's own steObjArr below.


		bacBoo : true,                                 // What: Back Boolean. Why: The user should always be able to return to the previous, Repeat-pills step. How: GuiTouCom shows its own Back button whenever this is true.
		catBoo : true,                                 // What: Coach-At-Top Boolean. Why: A revealed schedule control (the monthly or yearly one especially) can be tall enough to rival a short mobile viewport's whole height. How: GuiTouCom skips its own reserve-space math for this step and gives it a precise initial scroll target instead.
		priStr : 'Next',                               // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
		resBoo : false,                                // What: Resumable Boolean. Why: This step's own target only exists because the add-reminder form is already open, which a reload does not survive. How: GuiTouCom's own resume-persist effect never checkpoints a step whose resBoo is false.
		selStr : '.rem-quickadd-wrap .rem-extra-fade', // What: Selector String. Why: This step highlights whichever schedule control the recurring draft's own repeat kind reveals below the Repeat pills. How: GuiTouCom spotlights whatever this selector matches.
		tabStr : 'today',                              // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.
		titStr : repCopObj.titStr,                     // What: Title String. Why: This step's own coach card needs a heading naming what this repeat kind's own control does. How: GuiTouCom renders repCopObj.titStr as the step's own heading text.

		bodEle : <>This option controls <b>{ repCopObj.leaStr }</b>{ repCopObj.taiStr } We’ve already made { repCopObj.pluBoo ? 'these selections' : 'this selection' } for you but feel free to customize it to whatever you’d prefer.</> // What: Body Element. Why: This step's own coach card needs a plain description of what this repeat kind's own control does. How: GuiTouCom renders this as the step's own descriptive paragraph, written as JSX so specific phrases can be bolded.


	};


};

// #endregion buiFreFun



// #region buiSubFun

/**
 * buiSubFun = Build Submit Function
 *
 * @summary
 * Both tours' closing step: the real "Add" button. cirBoo plus priStr:'Done'
 * together mean Next stays disabled and clicking the button itself both saves
 * the reminder AND ends the tour (GuiTouCom's own finTouFun, not just an
 * advance, see onboarding/tour-runner.jsx's own priActFun). The recurring
 * varKeyStr gets one extra sentence about the recurrence date.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param varKeyStr - Variant Key String: Which tour variant this step is for,
 *                    'once' or 'recurring'.
 *
 * @returns A GuiTouCom step object for this tour's own steObjArr.
 *
 * @example
 * ```ts
 * buiSubFun( 'once' ) // => step object
 * ```
 *
*/

const buiSubFun = ( varKeyStr ) => ({ // What: Build Submit Function. Why: This builds both tours' shared closing step on the real "Add" button. How: This returns a step object whose body adds a recurrence-date note for the recurring varKeyStr.


	bacBoo : true,                               // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
	cirBoo : true,                               // What: Click-Is-Required Boolean. Why: The real click both saves the reminder and ends the tour, so the tour must not advance on its own before that click happens. How: GuiTouCom disables Next and only advances once the real target is clicked.
	priStr : 'Done',                             // What: Primary String. Why: This is both tours' own last step, so its main action finishes the tour instead of advancing. How: GuiTouCom reads a 'Done' priStr as the signal to call onFinTouFun instead of moving to a next step.
	resBoo : false,                              // What: Resumable Boolean. Why: This step's own target only exists because the add-reminder form is already open, which a reload does not survive. How: GuiTouCom's own resume-persist effect never checkpoints a step whose resBoo is false.
	selStr : '.rem-quickadd-wrap .btn--primary', // What: Selector String. Why: This step highlights the real "Add" button that both saves the reminder and ends the tour. How: GuiTouCom spotlights whatever this selector matches.
	tabStr : 'today',                            // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.
	titStr : 'Add your new Reminder',            // What: Title String. Why: This step's own coach card needs a heading naming what it does. How: GuiTouCom renders this as the step's own heading text.

	bodEle : varKeyStr === 'recurring' // What: Body Ternary. Why: The recurring varKeyStr needs an extra sentence about the recurrence date the one-time varKeyStr does not. How: This ternary picks between 2 JSX bodies based on varKeyStr.
		? <>We’re all done creating this reminder item. Go ahead and click the "Add" button now to <b>add it to your todo list</b>. NOTE: if you selected a day other than today as the recurrence date, then this item will not show up in your todo list until it is due.</> // What: Recurring Body Branch. Why: A recurring reminder dated later than today will not show up until it is due. How: This adds a note saying so after the shared instruction.
		: <>We’re all done creating this reminder item. Go ahead and click the "Add" button now to <b>add it to your todo list</b>.</> // What: One-Time Body Branch. Why: A one-time reminder needs only the shared instruction. How: This renders the instruction alone.


});

// #endregion buiSubFun

// #endregion Helpers



// #region Components

// #region RemTouCom

/**
 * RemTouCom = Reminder Tour Component
 *
 * @summary
 * Renders whichever piece of one varKeyStr's own reminder mini-tour is currently
 * relevant: the intro modal, or the running GuiTouCom. Both variants ('once'
 * and 'recurring') share the exact same 2 opening steps (buiAddFun,
 * NAM_STE_OBJ) and the exact same closing step (buiSubFun); only the recurring
 * varKeyStr adds 2 extra steps in between (REP_STE_OBJ, buiFreFun) for its own
 * Repeat schedule.
 *
 * Every step stays on Today, and this component is only ever mounted from
 * within TabTodCom (see tab-today.jsx's own staTouFun), so
 * actIdeStr/selTabFun are hardcoded/stubbed below rather than threaded all
 * the way up; a future step needing another tab would need this lifted the
 * way WelTouCom (onboarding/welcome-tour.jsx) is.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actStoObj   - Action Store Object: The shared app actions
 *                            that mutate props.staAppObj.
 * @param props.onCloForFun - On Close Form Function: Closes the real
 *                            add-reminder form on Today, exactly like its
 *                            own Cancel button would.
 * @param props.onCloTouFun - On Close Tour Function: Clears tab-today.jsx's
 *                            own minTouObj, ending this mount.
 * @param props.staAppObj   - State App Object: The entire app's own
 *                            persisted state.
 * @param props.varKeyStr   - Variant Key String: Which sample reminder this
 *                            mounts for, 'once' or 'recurring'.
 *
 * @returns Either the intro modal (touPhaStr 'intro') or the running
 * guided tour (touPhaStr 'tour'), depending on this varKeyStr's own
 * phase.
 *
 * @example
 * ```tsx
 * RemTouCom({ actStoObj, onCloForFun, onCloTouFun, staAppObj, varKeyStr })
 * // => <RemTouCom />
 * ```
 *
*/

function RemTouCom ( { actStoObj, onCloForFun, onCloTouFun, staAppObj, varKeyStr } ) {


	const varCopObj = VAR_COP_OBJ[ varKeyStr ];                                                                                    // What: Variant Copy Object. Why: Both the intro modal and cloTouFun below need this varKeyStr's own sample task id, icon, title, and second paragraph. How: This looks up VAR_COP_OBJ by the varKeyStr prop.
	const onbStaObj = staAppObj.onboarding || {};                                                                                  // What: Onboarding State Object. Why: A reload lands here with tab-today.jsx's own minTouObj already re-derived from the SAME persisted activeTour, so this just decides whether to skip the intro modal and which step to resume into. How: This reads staAppObj.onboarding, falling back to an empty object.
	const resTouObj = onbStaObj.activeTour && onbStaObj.activeTour.id === `reminder-${ varKeyStr }` ? onbStaObj.activeTour : null; // What: Resume Tour Object. Why: See onboarding/tour-runner.jsx's own resBoo field doc comment for why this is a checkpoint, not necessarily the exact step the user was last on. How: This reads onbStaObj.activeTour back out only when its own id matches this varKeyStr's own touIdeStr, otherwise null.

	const { draRepStr }               = useEmlTouFun();                                 // What: Draft Repeat String. Why: Only the recurring tour's own Step 4 actually depends on this, but the hook itself has to run unconditionally either way. How: This subscribes to the shared bus and reads its own draRepStr field, harmless to read up front even when unused.
	const [ touPhaStr, setTouPhaStr ] = React.useState( resTouObj ? 'tour' : 'intro' ); // What: Tour Phase String And Setter. Why: This is the mini-tour's own top-level position, 'intro' (the modal showing) or 'tour' (GuiTouCom running). How: This starts on 'tour' whenever resTouObj says a tour was left running, otherwise 'intro'.



	// #region cloTouFun

	/**
	 * cloTouFun = Close Tour Function
	 *
	 * @summary
	 * Ends this reminder mini-tour however it ends after the intro modal,
	 * recording how in the sample's own checklist entry. It clears the prefill
	 * this tour published on the shared bus, updates this varKeyStr's own
	 * launcher card status, then calls onCloTouFun so tab-today.jsx unmounts the
	 * tour. It never touches the sample task itself, only the new draft built
	 * from it.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param staValStr - Status Value String: How the tour ended, 'skipped' (the
	 *                    coach card's Skip or the not-found watchdog) or
	 *                    'finished'.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * cloTouFun( 'finished' ) // => void
	 * ```
	 *
	*/

	const cloTouFun = ( staValStr ) => { // What: Close Tour Function. Why: Clears the checklist status and the shared bus's own prefill together, the only two bits of state this tour ever touches outside its own local phase. How: This never touches the sample task itself (see buiAddFun's own runFun above), only the new draft it seeded gets built from it.


		emlTouObj.set( { preFilObj : null } ); // What: Prefill Clear Call. Why: A stale prefill left over from Step 1 must not leak into whatever the add-reminder form shows next. How: This clears the shared bus's own preFilObj field.


		actStoObj.setCarFun( varCopObj.ideStr, { status : staValStr } ); // What: Checklist Status Update Call. Why: The launcher card on Today reads this to know whether to keep showing itself. How: This updates this varKeyStr's own sample task's checklist entry to staValStr.


		onCloTouFun(); // What: On Close Call. Why: tab-today.jsx's own minTouObj must be cleared however this tour ends. How: This calls the onCloTouFun prop passed down from tab-today.jsx.


	};

	// #endregion cloTouFun



	if ( touPhaStr === 'intro' ) { // What: Intro Phase Check. Why: The intro modal must show before any spotlight step ever does. How: This returns IntModCom below whenever touPhaStr is 'intro'.


		const intIcoEle = ( // What: Intro Icon Element. Why: The intro modal's own icon matches this varKeyStr. How: This renders varCopObj's own icon at 54px, passed as IntModCom's own icoTopEle prop below.


			<IcoSvgCom
				icoNamStr={ varCopObj.icoStr }
				sizValNum={ 54 }
			/> // What: Icon Svg Component. Why: This is the glyph identifying which kind of reminder this tour creates. How: This renders varCopObj.icoStr's own icon.


		);



		return (


			<IntModCom
				icoTopEle={ intIcoEle }
				parEleArr={ [ FIR_PAR_ELE, varCopObj.bodStr ] }
				pilLabArr={ [ 'reminders', 'one-time', 'recurring' ] }
				titHeaStr={ varCopObj.titStr }

				onBegTouFun={ () => setTouPhaStr( 'tour' ) }
				onSkiTouFun={ () => { // What: On Skip Handler. Why: This mirrors the launcher card's own X button exactly, marking the card cancelled without touching the underlying sample reminder. How: This never sets the prefill at this point, so there is nothing to clear.


					actStoObj.setCarFun( varCopObj.ideStr, { status : 'cancelled' } ); // What: Checklist Status Cancel Call. Why: Skipping the intro modal still needs the launcher card to stop showing itself. How: This updates this varKeyStr's own sample task's checklist entry to 'cancelled'.


					onCloTouFun(); // What: On Close Call. Why: tab-today.jsx's own minTouObj must be cleared however this tour ends. How: This calls the onCloTouFun prop passed down from tab-today.jsx.


				} }
			/> // What: Tutorial Intro Modal Element. Why: This is this varKeyStr's own opening screen, shown before any spotlight step ever does. How: This is passed this varKeyStr's own icon/title/paragraphs/pills and the onBegTouFun/onSkiTouFun handlers above.


		);


	}



	const steObjArr = varKeyStr === 'recurring' // What: Step Object Array. Why: The recurring varKeyStr has 2 extra steps (the Repeat pills and the schedule-detail step) the one-time varKeyStr skips entirely. How: This ternary picks between the 2 full step lists, both starting with buiAddFun and NAM_STE_OBJ and ending with buiSubFun.
		? [ buiAddFun( varKeyStr, staAppObj ), NAM_STE_OBJ, REP_STE_OBJ, buiFreFun( draRepStr ), buiSubFun( varKeyStr ) ] // What: Recurring Steps Branch. Why: A recurring reminder also needs its Repeat pills and schedule control taught. How: This lists all 5 steps.
		: [ buiAddFun( varKeyStr, staAppObj ), NAM_STE_OBJ, buiSubFun( varKeyStr ) ];                                     // What: One-Time Steps Branch. Why: A one-time reminder has no schedule to set. How: This lists only the shared 3 steps.



	return (


		<GuiTouCom
			actIdeStr='today'
			actStoObj={ actStoObj }
			resSteNum={ resTouObj ? resTouObj.step : 0 } // What: Resume Step Attribute. Why: A tour a reload interrupted should reopen on its own checkpoint step. How: This passes resTouObj's own step when there is one, otherwise 0.
			selTabFun={ () => {} } // What: Select Tab Stub Attribute. Why: Every step of this tour stays on Today, so there is never a tab to switch to. How: This passes a no-op in place of the app-wide selTabFun, which this mount never receives.
			steObjArr={ steObjArr }
			touIdeStr={ `reminder-${ varKeyStr }` }

			onBacTouFun={ ( tarSteNum ) => { if ( tarSteNum === 0 ) onCloForFun(); } } // What: On Go Back Handler. Why: Back to Step 1 re-highlights the "+" button, which toggles the add form open or closed. How: Closing it here keeps Step 1's own click meaning exactly what it always means, open the form, instead of closing an already-open one.
			onFinTouFun={ () => cloTouFun( 'finished' ) } // What: On Finish Handler. Why: This only fires from buiSubFun's own cirBoo, after the real click that saves the reminder has already reached the button's own handler. How: This deliberately does not touch the form, since closing it here would discard the save instead of letting it happen.
			onSkiTouFun={ () => { // What: On Skip Handler. Why: Skip discards the in-progress form exactly like its own Cancel button would. How: onCloForFun is a no-op if the form is not even open, for example Skip from Step 1.


				onCloForFun(); // What: Close Reminder Form Call. Why: A half-created reminder should not survive behind the scenes just because the user backed out via the tour instead of the form itself. How: This closes the add-reminder form exactly like its own Cancel button would.

				cloTouFun( 'skipped' ); // What: Close Tour Call. Why: This funnels Skip through the same cleanup any other exit path off this tour uses. How: This clears the bus prefill, updates the checklist to 'skipped', and calls onCloTouFun.


			} }
		/> // What: Guided Tour Element. Why: This is the actual running spotlight walkthrough for this varKeyStr, mounted once its own intro modal has been accepted or resumed into. How: This is passed this varKeyStr's own touIdeStr, steObjArr, and the resume/lifecycle plumbing above.


	);


}

// #endregion RemTouCom

// #endregion Components



// #region Exports

export { RemTouCom }; // What: Named Exports. Why: tab-today.jsx renders this as the Reminders section's own guided tour. How: This re-exports RemTouCom; every other binding in this file is internal-only.

// #endregion Exports


