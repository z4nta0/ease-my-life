


// #region Imports

import type { ReactNode } from 'react'; // What: React Node. Why: Each nav target's body is renderable content. How: This types NAV_TAR_OBJ's bodEle.

// #endregion Imports



/**
 * targets.tsx = Targets
 *
 * @summary
 * A single-export file: NAV_TAR_OBJ, the shared nav-target catalog reused by
 * the Welcome Tour and every page's own mini-tour. See NAV_TAR_OBJ's own
 * comment right below for its full design rationale; this file exists purely
 * so that catalog has one home neither onboarding/welcome-tour.tsx nor
 * onboarding/page-tours.tsx needs to own on the other's behalf.
 *
 * Sections:
 *  - Constants
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

// #region NAV_TAR_OBJ

/**
 * NAV_TAR_OBJ = Nav Target Object
 *
 * @summary
 * Shared, reusable target-and-description catalog for onboarding overlays. The
 * nav bar's per-page buttons ([data-tab="..."]) are spotlighted both by the
 * main Welcome Tour (onboarding/welcome-tour.tsx) and, later, by each page's
 * own "Explore the {page}" mini-tour (see ONB_EPT_ARR in
 * onboarding-checklist.ts) as its opening step. This is kept as one source of
 * truth instead of being duplicated per consumer, keyed by the same page ids
 * as ONB_EPT_ARR's own pagStr field.
 *
 * Each entry holds content only (selStr/titStr/bodEle), no navigation
 * (priStr/bacBoo/runFun), since a guided tour needs Back/Next/Skip and a
 * future on-demand help mode won't. Consumers that need tour-flow-specific
 * framing (e.g. "let's explore this page now") append that themselves rather
 * than have it forced into the shared text; see the steps in
 * onboarding/welcome-tour.tsx for that split in practice.
 *
 * Every entry below shares this exact shape, and none of them repeat these
 * same fields' own boilerplate comments on their own lines (see the
 * "Repeated-shape object literals" comment exception in CLAUDE.md):
 *
 * - `bodEle` (Element): Body Element is a plain description of what the
 *   page IS, written to stand alone with no reference to "this tour" or
 *   "the next step" baked in, so it reads fine wherever it's reused;
 *   every consumer renders this directly as the step's own descriptive
 *   paragraph, written as JSX so specific phrases can be bolded.
 *
 * - `selStr` (String): Selector String is the actual DOM selector the
 *   overlay spotlights, matching the nav bar's own data-tab attribute
 *   for this page; every consumer (the Welcome Tour and each page's own
 *   mini-tour) reads this directly as the step's own selector.
 *
 * - `titStr` (String): Title String is the overlay's own callout
 *   heading, naming this page; every consumer renders this directly as
 *   the step's own heading text.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const NAV_TAR_OBJ : Record< string, { bodEle : ReactNode, selStr : string, titStr : string } > = { // What: Nav Target Object. Why: This is the shared onboarding nav-target catalog, kept as one source of truth instead of duplicating each page's selector/title/body per consumer. How: This is read by the Welcome Tour, the page-tour system, and the picker-tour system, each spreading or looking up one entry by its own page id.


	data : { // What: Data Nav Target Object. Why: This is the nav-target descriptor for the Data page's own tab button. How: This is spread into the Welcome Tour's Data step and read by the page-tour system's opening step for the 'data' page id.


		selStr : '[data-tab="data"]',
		titStr : 'The Data Page',

		bodEle : <>The Data page is <b>where you can view and edit all of your created data</b> and can be found using the database storage icon indicated here. The Data page content includes all of your reminders, pickers and their associated items.</>


	},

	picker : { // What: Picker Nav Target Object. Why: This is the nav-target descriptor for the Pickers page's own tab button. How: This is spread into the Welcome Tour's Pickers step and read by the page-tour system's opening step for the 'picker' page id.


		selStr : '[data-tab="picker"]',
		titStr : 'The Pickers Page',

		bodEle : <>The Pickers page is <b>where you can create new pickers</b> and can be found using the shuffle icon indicated here. You can also <b>manually run any picker, as well as send a specific item to your todo list</b>, from the Pickers page.</>


	},

	settings : { // What: Settings Nav Target Object. Why: This is the nav-target descriptor for the Settings page's own tab button. How: This is spread into the Welcome Tour's Settings step and read by the page-tour system's opening step for the 'settings' page id.


		selStr : '[data-tab="settings"]',
		titStr : 'The Settings Page',

		bodEle : <>The Settings page is where you can customize various aspects of the app and can be found using the gear icon indicated here. The Settings page allows you to change the app’s theme, animations, adjust the daily generator, customize holiday observances, <b>install the app</b>, export/import your data and contact the developer.</>


	},

	stats : { // What: Stats Nav Target Object. Why: This is the nav-target descriptor for the Stats page's own tab button. How: This is spread into the Welcome Tour's Stats step and read by the page-tour system's opening step for the 'stats' page id.


		selStr : '[data-tab="stats"]',
		titStr : 'The Stats Page',

		bodEle : <>The Stats page is where you can find a <b>breakdown of all the statistics associated with your created data</b> and can be found using the bar graph icon indicated here. As you continue to use the app over time, this page will be extremely useful.</>


	},

	today : { // What: Today Nav Target Object. Why: This is the nav-target descriptor for the Today page's own tab button. How: This is spread into the Welcome Tour's Today step and read by the page-tour system's opening step for the 'today' page id.


		selStr : '[data-tab="today"]',
		titStr : 'The Today Page',

		bodEle : <>The Today page is the main page of the app and can be found using the calendar icon indicated here. The Today page is <b>where your auto-generated todo list will be displayed every day</b>.</>


	}


};

// #endregion NAV_TAR_OBJ

// #endregion Constants



// #region Exports

export { NAV_TAR_OBJ }; // What: Named Export. Why: Every consumer imports this catalog by name. How: This re-exports NAV_TAR_OBJ, the sole binding this file defines.

// #endregion Exports


