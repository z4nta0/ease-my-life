


// #region Imports

import { insClcFun } from './clock.ts'; // What: Install Clock Function. Why: A fresh install still opens on the suites' fixed day. How: This installs the fake clock.
import { opeFixFun } from './app.ts';   // What: Open Fixture Function. Why: Most states run on real data. How: This loads the backup on its fixed day.
import { selTabFun } from './app.ts';   // What: Select Tab Function. Why: Each state opens one tab. How: This switches to it through the navigation.


import type { Page } from '@playwright/test'; // What: Page. Why: Opening a state drives a Playwright page. How: This types opeStaFun's page parameter.

// #endregion Imports



/**
 * states.ts = States
 *
 * @summary
 * The app states the accessibility suite visits, and the helper that opens
 * one. A state is a tab at a width on the real-data backup, sometimes with
 * something opened on it: every tab at phone and desktop widths, help mode
 * on, and the Privacy Policy panel, plus the welcome modal a fresh install
 * opens with. opeStaFun sizes the viewport, loads the backup (or an empty
 * install), switches tabs, waits for the fonts, runs the state's own action,
 * and then waits for running animations to settle so nothing is measured
 * mid-fade.
 *
 * Sections:
 *  - Types
 *  - Constants
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Types

type StaRecTyp = { // What: State Record Type. Why: Every check reads the same description of a state. How: This names a state, its tab, its viewport, whether it runs on real data, and an optional action.


	actFun? : ( curPagObj : Page ) => Promise< void >, // What: Action Function. Why: Some states need something opened after the tab shows. How: This runs against the loaded page, e.g. turning help mode on.
	fixBoo  : boolean,                                 // What: Fixture Boolean. Why: Most states need real data, but the welcome modal only shows on an empty install. How: This is true when the backup is loaded.
	heiNum  : number,                                  // What: Height Number. Why: The viewport's height decides what's on screen. How: This is the viewport height in CSS pixels.
	ideStr  : string,                                  // What: Identifier String. Why: Each test names the state it checks. How: This becomes part of the test title.
	tabStr  : string,                                  // What: Tab String. Why: Each state shows one tab. How: This is the tab's navigation id: today, picker, stats, data, or settings.
	widNum  : number                                   // What: Width Number. Why: Layouts change with width. How: This is the viewport width in CSS pixels.


};

// #endregion Types



// #region Constants

// #region STA_REC_ARR

/**
 * STA_REC_ARR = State Record Array
 *
 * @summary
 * Every state the checks visit: each tab on the real-data backup at a phone
 * width (375px) and a desktop width (1,280px), help mode turned on over
 * Today, the Privacy Policy panel open over Settings, and the welcome modal a
 * fresh install opens with. Every row shares the {@link StaRecTyp} shape, so
 * its fields carry no comments of their own:
 *
 * - `actFun` (Function): Action Function, run after the tab shows to open
 *   something on it. Only the help mode and privacy rows have one.
 *
 * - `fixBoo` (Boolean): Fixture Boolean, true when the real-data backup is
 *   loaded, false for an empty install.
 *
 * - `heiNum` (Number): Height Number, the viewport height in CSS pixels.
 *
 * - `ideStr` (String): Identifier String, the state's name in test titles.
 *
 * - `tabStr` (String): Tab String, the tab's navigation id.
 *
 * - `widNum` (Number): Width Number, the viewport width in CSS pixels.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const STA_REC_ARR : StaRecTyp[] = [ // What: State Record Array. Why: Every check walks the same list of states, so a new state is added in one place. How: Each row names a state, its tab, its viewport, and whether it loads the backup, and the opened states add an action.


	{ fixBoo : true,  heiNum : 800, ideStr : 'today-desktop',    tabStr : 'today',    widNum : 1280 }, // What: Today Desktop State. Why: The day's list is the app's main screen. How: This opens Today at 1,280px.
	{ fixBoo : true,  heiNum : 812, ideStr : 'today-phone',      tabStr : 'today',    widNum : 375  }, // What: Today Phone State. Why: Most use is on a phone, where the tab bar sits at the bottom. How: This opens Today at 375px.
	{ fixBoo : true,  heiNum : 800, ideStr : 'pickers-desktop',  tabStr : 'picker',   widNum : 1280 }, // What: Pickers Desktop State. Why: Pickers are spun and managed here. How: This opens Pickers at 1,280px.
	{ fixBoo : true,  heiNum : 812, ideStr : 'pickers-phone',    tabStr : 'picker',   widNum : 375  }, // What: Pickers Phone State. Why: The picker rails scroll sideways on a phone. How: This opens Pickers at 375px.
	{ fixBoo : true,  heiNum : 800, ideStr : 'stats-desktop',    tabStr : 'stats',    widNum : 1280 }, // What: Stats Desktop State. Why: The charts and tables carry the most text and color. How: This opens Stats at 1,280px.
	{ fixBoo : true,  heiNum : 812, ideStr : 'stats-phone',      tabStr : 'stats',    widNum : 375  }, // What: Stats Phone State. Why: The tables reflow on a phone. How: This opens Stats at 375px.
	{ fixBoo : true,  heiNum : 800, ideStr : 'data-desktop',     tabStr : 'data',     widNum : 1280 }, // What: Data Desktop State. Why: Every record is edited here. How: This opens Data at 1,280px.
	{ fixBoo : true,  heiNum : 812, ideStr : 'data-phone',       tabStr : 'data',     widNum : 375  }, // What: Data Phone State. Why: The section cards stack on a phone. How: This opens Data at 375px.
	{ fixBoo : true,  heiNum : 800, ideStr : 'settings-desktop', tabStr : 'settings', widNum : 1280 }, // What: Settings Desktop State. Why: Every setting and the support form live here. How: This opens Settings at 1,280px.
	{ fixBoo : true,  heiNum : 812, ideStr : 'settings-phone',   tabStr : 'settings', widNum : 375  }, // What: Settings Phone State. Why: The section rail scrolls sideways on a phone. How: This opens Settings at 375px.
	{ fixBoo : false, heiNum : 812, ideStr : 'welcome-phone',    tabStr : 'today',    widNum : 375  }, // What: Welcome Phone State. Why: A first visit opens with the welcome modal. How: This opens an empty install at 375px.

	{ // What: Help Mode Phone State. Why: Help mode dims the tab and adds a badge to every explained control. How: This opens Today at 375px and turns help mode on.


		fixBoo : true,
		heiNum : 812,
		ideStr : 'help-phone',
		tabStr : 'today',
		widNum : 375,

		actFun : async ( curPagObj ) => { await curPagObj.locator( '[data-element-name-hook~="helTogBut"]' ).first().click(); }


	},

	{ // What: Privacy Panel Desktop State. Why: The legal panels are long modal documents. How: This opens Settings at 1,280px and opens the Privacy Policy.


		fixBoo : true,
		heiNum : 800,
		ideStr : 'privacy-desktop',
		tabStr : 'settings',
		widNum : 1280,

		actFun : async ( curPagObj ) => { await curPagObj.locator( '[data-element-name-hook~="priRowDiv"] button' ).first().click(); }


	}


];

// #endregion STA_REC_ARR

// #endregion Constants



// #region Helpers

// #region opeStaFun

/**
 * opeStaFun = Open State Function
 *
 * @summary
 * Opens one state on a page and waits until it's settled: sizes the viewport,
 * loads the real-data backup on the suites' fixed day (or an empty install
 * on that day), switches to the state's tab, waits for the web fonts, runs
 * the state's action if it has one, then waits until no finite animation is
 * still running, so a check never measures a card halfway through its
 * entrance. An endless animation (a looping boot or badge effect) can't
 * settle, so it's left out of the wait, and the wait fails the check after 5
 * seconds rather than hanging.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page to open the state on.
 * @param staRecObj - State Record Object: {@link StaRecTyp}
 *
 * @returns A promise that settles once the state is open and settled, with no
 *          value.
 *
 * @example
 * ```ts
 * opeStaFun(page, staRecObj) // => Promise<void>
 * ```
 *
*/

async function opeStaFun ( curPagObj : Page, staRecObj : StaRecTyp ) : Promise< void > {


	await curPagObj.setViewportSize( { height : staRecObj.heiNum, width : staRecObj.widNum } ); // What: Viewport Size Call. Why: The state's layout depends on its width. How: This sizes the page before it loads, so breakpoints apply from the first paint.



	if ( staRecObj.fixBoo ) { // What: Fixture Check. Why: Most states need real data, which opens on Today once the day's list is saved. How: This loads the backup and switches tabs.


		await opeFixFun( curPagObj ); // What: Backup Open Call. Why: Real names and lists show real layouts. How: This loads the backup on the fixed day and waits for its list.

		await selTabFun( curPagObj, staRecObj.tabStr ); // What: Tab Switch Call. Why: The state shows one tab. How: This switches to it through the navigation.


	}

	else { // What: Fresh Install Branch. Why: The welcome modal only shows on an empty install. How: This installs the clock and loads the app with nothing saved.


		await insClcFun( curPagObj, '2026-10-05', 10 ); // What: Clock Install Call. Why: A fresh install should still open on the suites' fixed day. How: This installs the fake clock there.

		await curPagObj.goto( '/' ); // What: App Load Call. Why: The empty install boots the app. How: This opens the app's root.

		await curPagObj.getByRole( 'dialog' ).first().waitFor(); // What: Welcome Modal Wait. Why: The state is the modal. How: This waits for it to show.


	}



	await curPagObj.evaluate( () => document.fonts.ready.then( () => undefined ) ); // What: Fonts Ready Wait. Why: Text measured before its web font loads would have the wrong size and wrapping. How: This waits until every font face has loaded.



	await curPagObj.locator( '[data-element-name-hook~="booSplDiv"]' ).waitFor( { state : 'detached' } ); // What: Boot Splash Wait. Why: The splash fades and leaves about half a second after the app mounts, and until then it covers whatever is under it. How: This waits until it's gone from the page.



	if ( staRecObj.actFun ) await staRecObj.actFun( curPagObj ); // What: State Action Call. Why: Some states need something opened first. How: This runs the state's action, if it has one.



	await curPagObj.waitForFunction( () => document.getAnimations().every( ( aniCurObj ) => aniCurObj.playState !== 'running' || aniCurObj.effect?.getTiming().iterations === Infinity ), undefined, { timeout : 5000 } ); // What: Animations Settled Wait. Why: A check should see the state at rest, not mid-fade. How: This waits until every finite animation and transition has finished, failing after 5 seconds.


}

// #endregion opeStaFun

// #endregion Helpers



// #region Exports

export { opeStaFun, STA_REC_ARR, type StaRecTyp }; // What: Named Exports. Why: The accessibility specs share these states and their opener. How: This exports the state list, the opener, and the state type by name.

// #endregion Exports


