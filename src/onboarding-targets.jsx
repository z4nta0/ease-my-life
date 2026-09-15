


// #region NAV_TAR_OBJ

/**
 * NAV_TAR_OBJ = Nav Target Object
 *
 * @summary
 * Shared, reusable target-and-description catalog for onboarding overlays. The
 * nav bar's per-page buttons ([data-tab="..."]) are spotlighted both by the
 * main Welcome Tour (onboarding.jsx) and, later, by each page's own "Explore
 * the {page}" mini-tour (see OB_PAGE_TOURS in onboarding-checklist.js) as its
 * opening step. This is kept as one source of truth instead of being
 * duplicated per consumer, keyed by the same page ids as OB_PAGE_TOURS' page
 * field.
 *
 * Each entry holds content only (sel/place/title/body), no navigation
 * (primary/back/run), since a guided tour needs Back/Next/Skip and a future
 * on-demand help mode won't. body is written to stand alone as a plain
 * description of what the page IS, with no reference to "this tour" or "the
 * next step" baked in, so it reads fine wherever it's reused. Consumers that
 * need tour-flow-specific framing (e.g. "let's explore this page now") append
 * that themselves rather than have it forced into the shared text; see the
 * steps in onboarding.jsx for that split in practice.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const NAV_TAR_OBJ = { // What: Nav Target Object. Why: This is the shared onboarding nav-target catalog, kept as one source of truth instead of duplicating each page's selector/placement/title/body per consumer. How: This is read by the Welcome Tour, the page-tour system, and the picker-tour system, each spreading or looking up one entry by its own page id.


	today : { // What: Today Nav Target Object. Why: This is the nav-target descriptor for the Today page's own tab button. How: This is spread into the Welcome Tour's Today step and read by the page-tour system's opening step for the 'today' page id.


		sel   : '[data-tab="today"]',                                                                                                                                                                              // What: Target Selector. Why: This is the actual DOM selector the overlay spotlights, matching the nav bar's own data-tab attribute for this page. How: Every consumer (the Welcome Tour and each page's own mini-tour) reads this directly as the step's own selector.
		place : 'below',                                                                                                                                                                                           // What: Target Placement. Why: The overlay's callout needs to know which side of the spotlighted element to render on. How: Every consumer reads this directly as the step's own placement value.
		title : 'The Today Page',                                                                                                                                                                                  // What: Target Title. Why: The overlay's callout needs a heading naming this page. How: Every consumer renders this directly as the step's own heading text.
		body  : <>The Today page is the main page of the app and can be found using the calendar icon indicated here. The Today page is <b>where your auto-generated todo list will be displayed every day</b>.</> // What: Target Body. Why: The overlay's callout needs a plain description of what this page actually is, written to stand alone outside of any one tour's own flow framing. How: Every consumer renders this directly as the step's own descriptive paragraph, written as JSX so specific phrases can be bolded.


	},

	picker : { // What: Picker Nav Target Object. Why: This is the nav-target descriptor for the Pickers page's own tab button. How: This is spread into the Welcome Tour's Pickers step and read by the page-tour system's opening step for the 'picker' page id.


		sel   : '[data-tab="picker"]',                                                                                                                                                                                                                          // What: Target Selector. Why: This is the actual DOM selector the overlay spotlights, matching the nav bar's own data-tab attribute for this page. How: Every consumer (the Welcome Tour and each page's own mini-tour) reads this directly as the step's own selector.
		place : 'below',                                                                                                                                                                                                                                        // What: Target Placement. Why: The overlay's callout needs to know which side of the spotlighted element to render on. How: Every consumer reads this directly as the step's own placement value.
		title : 'The Pickers Page',                                                                                                                                                                                                                             // What: Target Title. Why: The overlay's callout needs a heading naming this page. How: Every consumer renders this directly as the step's own heading text.
		body  : <>The Pickers page is <b>where you can create new pickers</b> and can be found using the shuffle icon indicated here. You can also <b>manually run any picker, as well as send a specific item to your todo list</b>, from the Pickers page.</> // What: Target Body. Why: The overlay's callout needs a plain description of what this page actually is, written to stand alone outside of any one tour's own flow framing. How: Every consumer renders this directly as the step's own descriptive paragraph, written as JSX so specific phrases can be bolded.


	},

	stats : { // What: Stats Nav Target Object. Why: This is the nav-target descriptor for the Stats page's own tab button. How: This is spread into the Welcome Tour's Stats step and read by the page-tour system's opening step for the 'stats' page id.


		sel   : '[data-tab="stats"]',                                                                                                                                                                                                                                        // What: Target Selector. Why: This is the actual DOM selector the overlay spotlights, matching the nav bar's own data-tab attribute for this page. How: Every consumer (the Welcome Tour and each page's own mini-tour) reads this directly as the step's own selector.
		place : 'below',                                                                                                                                                                                                                                                     // What: Target Placement. Why: The overlay's callout needs to know which side of the spotlighted element to render on. How: Every consumer reads this directly as the step's own placement value.
		title : 'The Stats Page',                                                                                                                                                                                                                                            // What: Target Title. Why: The overlay's callout needs a heading naming this page. How: Every consumer renders this directly as the step's own heading text.
		body  : <>The Stats page is where you can find a <b>breakdown of all the statistics associated with your created data</b> and can be found using the bar graph icon indicated here. As you continue to use the app over time, this page will be extremely useful.</> // What: Target Body. Why: The overlay's callout needs a plain description of what this page actually is, written to stand alone outside of any one tour's own flow framing. How: Every consumer renders this directly as the step's own descriptive paragraph, written as JSX so specific phrases can be bolded.


	},

	data : { // What: Data Nav Target Object. Why: This is the nav-target descriptor for the Data page's own tab button. How: This is spread into the Welcome Tour's Data step and read by the page-tour system's opening step for the 'data' page id.


		sel   : '[data-tab="data"]',                                                                                                                                                                                                                         // What: Target Selector. Why: This is the actual DOM selector the overlay spotlights, matching the nav bar's own data-tab attribute for this page. How: Every consumer (the Welcome Tour and each page's own mini-tour) reads this directly as the step's own selector.
		place : 'below',                                                                                                                                                                                                                                     // What: Target Placement. Why: The overlay's callout needs to know which side of the spotlighted element to render on. How: Every consumer reads this directly as the step's own placement value.
		title : 'The Data Page',                                                                                                                                                                                                                             // What: Target Title. Why: The overlay's callout needs a heading naming this page. How: Every consumer renders this directly as the step's own heading text.
		body  : <>The Data page is <b>where you can view and edit all of your created data</b> and can be found using the database storage icon indicated here. The Data page content includes all of your reminders, pickers and their associated items.</> // What: Target Body. Why: The overlay's callout needs a plain description of what this page actually is, written to stand alone outside of any one tour's own flow framing. How: Every consumer renders this directly as the step's own descriptive paragraph, written as JSX so specific phrases can be bolded.


	},

	settings : { // What: Settings Nav Target Object. Why: This is the nav-target descriptor for the Settings page's own tab button. How: This is spread into the Welcome Tour's Settings step and read by the page-tour system's opening step for the 'settings' page id.


		sel   : '[data-tab="settings"]',                                                                                                                                                                                                                                                                                                                    // What: Target Selector. Why: This is the actual DOM selector the overlay spotlights, matching the nav bar's own data-tab attribute for this page. How: Every consumer (the Welcome Tour and each page's own mini-tour) reads this directly as the step's own selector.
		place : 'below',                                                                                                                                                                                                                                                                                                                                    // What: Target Placement. Why: The overlay's callout needs to know which side of the spotlighted element to render on. How: Every consumer reads this directly as the step's own placement value.
		title : 'The Settings Page',                                                                                                                                                                                                                                                                                                                        // What: Target Title. Why: The overlay's callout needs a heading naming this page. How: Every consumer renders this directly as the step's own heading text.
		body  : <>The Settings page is where you can customize various aspects of the app and can be found using the gear icon indicated here. The Settings page allows you to change the app’s theme, animations, adjust the daily generator, customize holiday observances, <b>install the app</b>, export/import your data and contact the developer.</> // What: Target Body. Why: The overlay's callout needs a plain description of what this page actually is, written to stand alone outside of any one tour's own flow framing. How: Every consumer renders this directly as the step's own descriptive paragraph, written as JSX so specific phrases can be bolded.


	}


};

// #endregion NAV_TAR_OBJ



export { NAV_TAR_OBJ }; // What: Named Export. Why: Every consumer imports this catalog by name. How: This re-exports NAV_TAR_OBJ, the sole binding this file defines.


