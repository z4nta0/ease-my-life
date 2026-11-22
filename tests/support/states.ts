


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
 * The app states the accessibility and feedback suites visit, and the helper
 * that opens one. A state is a tab at a width on the real-data backup,
 * sometimes with something opened on it: the shared list holds every tab at
 * phone and desktop widths, help mode, the Privacy Policy panel, and the
 * welcome modal a fresh install opens with, and two more lists hold the
 * opened editors and forms, and the open tips and support form only the
 * accessibility suite visits. ALL_STA_ARR joins all three, and LEG_PAT_ARR
 * lists the legal pages' addresses, which sit outside the app's states.
 * opeStaFun sizes the viewport, loads the backup (or an empty install),
 * switches tabs, waits for the fonts, runs the state's own action, and then
 * waits for running animations to settle so nothing is measured mid-fade.
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

type StaRcdTyp = { // What: State Record Type. Why: Every check reads the same description of a state. How: This names a state, its tab, its viewport, whether it runs on real data, an optional action, and an optional open pop-up.


	actFun? : ( curPagObj : Page ) => Promise< void >, // What: Action Function. Why: Some states need something opened after the tab shows. How: This runs against the loaded page, e.g. turning help mode on.
	fixBoo  : boolean,                                 // What: Fixture Boolean. Why: Most states need real data, but the welcome modal only shows on an empty install. How: This is true when the backup is loaded.
	heiNum  : number,                                  // What: Height Number. Why: The viewport's height decides what's on screen. How: This is the viewport height in CSS pixels.
	ideStr  : string,                                  // What: Identifier String. Why: Each test names the state it checks. How: This becomes part of the test title.
	popStr? : string,                                  // What: Pop-Up String. Why: A pop-up that doesn't hold focus has to close once focus moves past it, or it could cover the next stop. How: This holds the selector matching the state's open pop-up, which the keyboard walk expects gone after its first stop.
	tabStr  : string,                                  // What: Tab String. Why: Each state shows one tab. How: This is the tab's navigation id: today, picker, stats, data, or settings.
	widNum  : number                                   // What: Width Number. Why: Layouts change with width. How: This is the viewport width in CSS pixels.


};

// #endregion Types



// #region Constants

// #region EXT_STA_ARR

/**
 * EXT_STA_ARR = Extra State Array
 *
 * @summary
 * The opened states the accessibility and feedback specs add to the shared
 * ones, each a tab with something opened that brings controls the plain tab
 * doesn't show: an item editor on Today, the day log, Today's edit mode, the
 * new picker form, and a Data card with its sections and an item row open.
 * Every row shares the {@link StaRcdTyp} shape the shared states use.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const EXT_STA_ARR : StaRcdTyp[] = [ // What: Extra State Array. Why: An editor or a form holds controls the plain tabs don't. How: Each row opens one on a tab at one width.


	{ // What: Editor Phone State. Why: An item's editor holds the app's sliders, steppers, and switches. How: This opens Today at 375px and opens the first card's editor.


		fixBoo : true,
		heiNum : 812,
		ideStr : 'editor-phone',
		tabStr : 'today',
		widNum : 375,

		actFun : async ( curPagObj ) => { await curPagObj.locator( '[data-element-name-hook~="todCarArt"] [aria-label="Edit"]' ).first().click(); } // What: Editor Action Function. Why: The state shows an item's editor open. How: This presses the Edit button on Today's first card.


	},

	{ // What: Day Log Desktop State. Why: The day log holds its own chips and rows. How: This opens Today at 1,280px and opens the first group's log.


		fixBoo : true,
		heiNum : 800,
		ideStr : 'day-log-desktop',
		tabStr : 'today',
		widNum : 1280,

		actFun : async ( curPagObj ) => { await curPagObj.locator( '[data-element-name-hook~="logChiBut"]' ).first().dispatchEvent( 'click' ); } // What: Day Log Action Function. Why: At the reflow check's 320px the group header's progress dashes overlap the chip, so a pointer click would land on them. How: This sends the chip its click event directly, which opens the log at any width.


	},

	{ // What: Edit Mode Desktop State. Why: Edit mode swaps the cards' actions for grips and rename buttons. How: This opens Today at 1,280px and turns edit mode on.


		fixBoo : true,
		heiNum : 800,
		ideStr : 'edit-mode-desktop',
		tabStr : 'today',
		widNum : 1280,

		actFun : async ( curPagObj ) => { await curPagObj.locator( '[data-element-name-hook~="ediRaiBut"], [data-element-name-hook~="fooEdiBut"]' ).filter( { visible : true } ).first().click(); } // What: Edit Mode Action Function. Why: The rail's Edit Mode button shows on a wide app and the footer's on a narrow one, such as at the reflow check's 320px. How: This clicks whichever of the two is shown.


	},

	{ // What: Picker Form Desktop State. Why: The new picker form holds its steps, mode cards, and group chips. How: This opens Pickers at 1,280px and opens the form.


		fixBoo : true,
		heiNum : 800,
		ideStr : 'picker-form-desktop',
		tabStr : 'picker',
		widNum : 1280,

		actFun : async ( curPagObj ) => { await curPagObj.locator( '[data-element-name-hook~="picAddBut"]' ).first().click(); } // What: Form Action Function. Why: The state shows the new picker form open. How: This presses the first Add button.


	},

	{ // What: Data Card Desktop State. Why: An open Data card holds a picker's controls, its item rows, and an item's editor. How: This opens Data at 1,280px, opens the first card and both its sections, and opens its first item row.


		fixBoo : true,
		heiNum : 800,
		ideStr : 'data-card-desktop',
		tabStr : 'data',
		widNum : 1280,

		actFun : async ( curPagObj ) => { // What: Data Card Action Function. Why: The card, its sections, and its row each open on their own. How: This clicks each closed one in turn.


			const carSecLoc = curPagObj.locator( '[data-element-name-hook~="datCatSec"]' ).first(); // What: Card Section Locator. Why: The first picker's card is opened. How: This finds it.


			await carSecLoc.locator( '[data-element-name-hook~="catHeaBut"]' ).first().click(); // What: Card Open Call. Why: A closed card hides its sections. How: This opens it.


			for ( const togIndNum of [ 0, 1 ] ) { // What: Section Open Loop. Why: The controls and the items each open on their own. How: This opens each section that's still closed.


				const togButLoc = carSecLoc.locator( '[data-element-name-hook~="catTogBut"]' ).nth( togIndNum ); // What: Toggle Button Locator. Why: Each section has its own toggle. How: This finds it by place.


				if ( await togButLoc.getAttribute( 'aria-expanded' ) !== 'true' ) await togButLoc.click(); // What: Section Open Call. Why: Only a closed section needs opening. How: This clicks its toggle when it reads closed.


			}



			await carSecLoc.locator( '[data-element-name-hook~="lisRowBut"]' ).first().click(); // What: Row Open Call. Why: An item's editor opens from its row. How: This clicks the first row.


		}


	}


];

// #endregion EXT_STA_ARR



const LEG_PAT_ARR = [ '/privacy', '/terms' ]; // What: Legal Path Array. Why: The privacy policy and terms are static pages of their own, outside the app's states, and get the same checks. How: This lists their addresses.



// #region REA_STA_ARR

/**
 * REA_STA_ARR = Reachable State Array
 *
 * @summary
 * The states only the accessibility specs add, each a look a visitor reaches
 * through a control and can stay on: an info tip opened from the keyboard on
 * Today, a help mode badge's tip opened on a phone, and the support form open
 * on Settings. The two tip rows name their open pop-up, which the keyboard
 * walk expects to close once focus moves past it. Every row shares the
 * {@link StaRcdTyp} shape the shared states use.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const REA_STA_ARR : StaRcdTyp[] = [ // What: Reachable State Array. Why: A pop-up or form left open is a look of its own, over or beside the tab's other controls. How: Each row opens one on a tab at one width.


	{ // What: Info Tip Desktop State. Why: An info tip's bubble opens over the controls around it and stays until it's dismissed. How: This opens Today at 1,280px and opens the first info tip with Enter, the keyboard's way.


		fixBoo : true,
		heiNum : 800,
		ideStr : 'info-tip-desktop',
		popStr : '[data-element-name-hook~="infTipSpa"]',
		tabStr : 'today',
		widNum : 1280,

		actFun : async ( curPagObj ) => { // What: Info Tip Action Function. Why: The state shows the tip's bubble open. How: This presses Enter on the first info tip and waits for its bubble.


			await curPagObj.locator( '[class*="infTrgSpa"]' ).first().press( 'Enter' ); // What: Tip Open Call. Why: A keyboard user opens a tip with Enter. How: This focuses the first info tip's trigger and presses Enter on it.

			await curPagObj.locator( '[data-element-name-hook~="infTipSpa"]' ).waitFor(); // What: Bubble Wait. Why: The checks read the page only once the bubble shows. How: This waits for it.


		}


	},

	{ // What: Help Tip Phone State. Why: A help badge's tip opens over the tab and stays until it's dismissed. How: This opens Today at 375px, turns help mode on, and opens the first badge's tip.


		fixBoo : true,
		heiNum : 812,
		ideStr : 'help-tip-phone',
		popStr : '[data-element-name-hook~="helTipDiv"]',
		tabStr : 'today',
		widNum : 375,

		actFun : async ( curPagObj ) => { // What: Help Tip Action Function. Why: The state shows a help tip open. How: This turns help mode on, presses the first badge, and waits for its tip.


			await curPagObj.locator( '[data-element-name-hook~="helTogBut"]' ).first().click(); // What: Help Toggle Click. Why: The badges show only in help mode. How: This turns it on.

			await curPagObj.locator( '[data-element-name-hook~="helBadBut"]' ).first().click(); // What: Badge Click. Why: A badge's press opens its tip. How: This presses the first badge.

			await curPagObj.locator( '[data-element-name-hook~="helTipDiv"]' ).waitFor(); // What: Tip Wait. Why: The checks read the page only once the tip shows. How: This waits for it.


		}


	},

	{ // What: Support Form Desktop State. Why: The support form holds its message fields and its send controls, which only show once it opens. How: This opens Settings at 1,280px and opens the form.


		fixBoo : true,
		heiNum : 800,
		ideStr : 'support-form-desktop',
		tabStr : 'settings',
		widNum : 1280,

		actFun : async ( curPagObj ) => { await curPagObj.getByRole( 'button', { exact : true, name : 'Contact Support' } ).click(); } // What: Support Form Action Function. Why: The state shows the support form open. How: This presses the Contact Support button.


	}


];

// #endregion REA_STA_ARR



// #region STA_RCD_ARR

/**
 * STA_RCD_ARR = State Record Array
 *
 * @summary
 * The shared states the checks visit: each tab on the real-data backup at a
 * phone width (375px) and a desktop width (1,280px), help mode turned on over
 * Today, the Privacy Policy panel open over Settings, and the welcome modal a
 * fresh install opens with. Every row shares the {@link StaRcdTyp} shape, so
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
 * - `popStr` (String): Pop-Up String, the selector matching an open pop-up
 *   the keyboard walk expects to close. None of these rows has one.
 *
 * - `tabStr` (String): Tab String, the tab's navigation id.
 *
 * - `widNum` (Number): Width Number, the viewport width in CSS pixels.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const STA_RCD_ARR : StaRcdTyp[] = [ // What: State Record Array. Why: The checks share this list of the plain tabs and a few opened looks. How: Each row names a state, its tab, its viewport, and whether it loads the backup, and the opened states add an action.


	{ fixBoo : true,  heiNum : 800, ideStr : 'today-desktop',    tabStr : 'today',    widNum : 1280 }, // What: Today Desktop State. Why: The day's list is the app's main screen. How: This opens Today at 1,280px.
	{ fixBoo : true,  heiNum : 812, ideStr : 'today-phone',      tabStr : 'today',    widNum : 375  }, // What: Today Phone State. Why: Most use is on a phone, where the tab bar sits at the bottom. How: This opens Today at 375px.
	{ fixBoo : true,  heiNum : 800, ideStr : 'pickers-desktop',  tabStr : 'picker',   widNum : 1280 }, // What: Pickers Desktop State. Why: Pickers are spun and managed here. How: This opens Pickers at 1,280px.
	{ fixBoo : true,  heiNum : 812, ideStr : 'pickers-phone',    tabStr : 'picker',   widNum : 375  }, // What: Pickers Phone State. Why: The picker rails scroll sideways on a phone. How: This opens Pickers at 375px.
	{ fixBoo : true,  heiNum : 800, ideStr : 'stats-desktop',    tabStr : 'stats',    widNum : 1280 }, // What: Stats Desktop State. Why: The charts and tables carry the most text and color. How: This opens Stats at 1,280px.
	{ fixBoo : true,  heiNum : 812, ideStr : 'stats-phone',      tabStr : 'stats',    widNum : 375  }, // What: Stats Phone State. Why: The tables reflow on a phone. How: This opens Stats at 375px.
	{ fixBoo : true,  heiNum : 800, ideStr : 'data-desktop',     tabStr : 'data',     widNum : 1280 }, // What: Data Desktop State. Why: The pickers, items, and reminders are edited here. How: This opens Data at 1,280px.
	{ fixBoo : true,  heiNum : 812, ideStr : 'data-phone',       tabStr : 'data',     widNum : 375  }, // What: Data Phone State. Why: The section cards stack on a phone. How: This opens Data at 375px.
	{ fixBoo : true,  heiNum : 800, ideStr : 'settings-desktop', tabStr : 'settings', widNum : 1280 }, // What: Settings Desktop State. Why: The settings and the support form live here. How: This opens Settings at 1,280px.
	{ fixBoo : true,  heiNum : 812, ideStr : 'settings-phone',   tabStr : 'settings', widNum : 375  }, // What: Settings Phone State. Why: The section rail scrolls sideways on a phone. How: This opens Settings at 375px.
	{ fixBoo : false, heiNum : 812, ideStr : 'welcome-phone',    tabStr : 'today',    widNum : 375  }, // What: Welcome Phone State. Why: A first visit opens with the welcome modal. How: This opens an empty install at 375px.

	{ // What: Help Mode Phone State. Why: Help mode dims the tab and adds a badge to every explained control. How: This opens Today at 375px and turns help mode on.


		fixBoo : true,
		heiNum : 812,
		ideStr : 'help-phone',
		tabStr : 'today',
		widNum : 375,

		actFun : async ( curPagObj ) => { await curPagObj.locator( '[data-element-name-hook~="helTogBut"]' ).first().click(); } // What: Help Mode Action Function. Why: The state shows help mode turned on. How: This presses the help toggle.


	},

	{ // What: Privacy Panel Desktop State. Why: The legal panels are long modal documents. How: This opens Settings at 1,280px and opens the Privacy Policy.


		fixBoo : true,
		heiNum : 800,
		ideStr : 'privacy-desktop',
		tabStr : 'settings',
		widNum : 1280,

		actFun : async ( curPagObj ) => { await curPagObj.locator( '[data-element-name-hook~="priRowDiv"] button' ).first().click(); } // What: Privacy Action Function. Why: The state shows the Privacy Policy panel open. How: This presses the first button in the Privacy row.


	}


];

// #endregion STA_RCD_ARR



const ALL_STA_ARR = [ ...STA_RCD_ARR, ...EXT_STA_ARR, ...REA_STA_ARR ]; // What: All State Array. Why: Every shared state is checked, and so is each opened or reachable one, since each holds a look the plain tabs don't. How: This lists the shared states first, then the opened ones, then the reachable ones.

// #endregion Constants



// #region Helpers

// #region opeStaFun

/**
 * opeStaFun = Open State Function
 *
 * @summary
 * Opens one state on a page and waits until it's settled: sizes the viewport,
 * loads the real-data backup on the suites' fixed day, switches to the state's
 * tab, and moves the Tab starting point back to the top of the page (or loads
 * an empty install on that day and waits for its welcome dialog), waits for
 * the web fonts and for the boot splash to leave, runs the state's action if
 * it has one, then waits until no finite animation is still running, so a
 * check never measures a card halfway through its entrance. An endless
 * animation (a looping boot or badge effect) can't settle, so it's left out of
 * the wait, and the wait fails the check after 5 seconds rather than hanging.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page to open the state on.
 * @param staRcdObj - State Record Object: {@link StaRcdTyp}
 *
 * @returns A promise that settles once the state is open and settled, with no
 *          value.
 *
 * @example
 * ```ts
 * opeStaFun(page, staRcdObj) // => Promise<void>
 * ```
 *
*/

async function opeStaFun ( curPagObj : Page, staRcdObj : StaRcdTyp ) : Promise< void > {


	// #region State Load

	await curPagObj.setViewportSize( { height : staRcdObj.heiNum, width : staRcdObj.widNum } ); // What: Viewport Size Call. Why: The state's layout depends on its width. How: This sizes the page before it loads, so breakpoints apply from the first paint.



	if ( staRcdObj.fixBoo ) { // What: Fixture Check. Why: Most states need real data, which opens on Today once the day's list is saved. How: This loads the backup and switches tabs.


		await opeFixFun( curPagObj ); // What: Backup Open Call. Why: Real names and lists show real layouts. How: This loads the backup on the fixed day and waits for its list.

		await selTabFun( curPagObj, staRcdObj.tabStr ); // What: Tab Switch Call. Why: The state shows one tab. How: This switches to it through the navigation.


		await curPagObj.evaluate( () => { // What: Tab Start Reset Call. Why: Switching tabs clicks a button in the tab bar, which moves the browser's Tab starting point there, past the skip link and the bar's earlier buttons. How: This focuses the root element for a moment, which puts the starting point at the top of the page.


			document.documentElement.tabIndex = -1; // What: Root Tab Index Set. Why: Only a focusable element can take focus from a script. How: This makes the root focusable without adding it to the Tab order.


			document.documentElement.focus(); // What: Root Focus Call. Why: Focusing an element moves the Tab starting point to it. How: This focuses the root.

			document.documentElement.removeAttribute( 'tabindex' ); // What: Root Tab Index Removal. Why: The root shouldn't stay focusable after the reset. How: This removes the attribute again.


		} );


	}

	else { // What: Fresh Install Branch. Why: The welcome modal only shows on an empty install. How: This installs the clock and loads the app with nothing saved.


		await insClcFun( curPagObj, '2026-10-05', 10 ); // What: Clock Install Call. Why: A fresh install should still open on the suites' fixed day. How: This installs the fake clock there.

		await curPagObj.goto( '/' ); // What: App Load Call. Why: The empty install boots the app. How: This opens the app's root.

		await curPagObj.getByRole( 'dialog' ).first().waitFor(); // What: Welcome Modal Wait. Why: The state is the modal. How: This waits for it to show.


	}

	// #endregion State Load



	// #region Settling Waits

	await curPagObj.evaluate( () => document.fonts.ready.then( () => undefined ) ); // What: Fonts Ready Wait. Why: Text measured before its web font loads would have the wrong size and wrapping. How: This waits until the page's fonts have finished loading.



	await curPagObj.locator( '[data-element-name-hook~="booSplDiv"]' ).waitFor( { state : 'detached' } ); // What: Boot Splash Wait. Why: The splash fades out after the app mounts, and until it leaves it covers whatever is under it. How: This waits until it's gone from the page.



	if ( staRcdObj.actFun ) await staRcdObj.actFun( curPagObj ); // What: State Action Call. Why: Some states need something opened first. How: This runs the state's action, if it has one.



	await curPagObj.waitForFunction( () => document.getAnimations().every( ( aniCurObj ) => aniCurObj.playState !== 'running' || aniCurObj.effect?.getTiming().iterations === Infinity ), undefined, { timeout : 5000 } ); // What: Animations Settled Wait. Why: A check should see the state at rest, not mid-fade. How: This waits until every finite animation and transition has finished, failing after 5 seconds.

	// #endregion Settling Waits


}

// #endregion opeStaFun

// #endregion Helpers



// #region Exports

export { ALL_STA_ARR, EXT_STA_ARR, LEG_PAT_ARR, opeStaFun, STA_RCD_ARR }; // What: Named Exports. Why: These are the shared states, the legal pages' addresses, and the state opener. How: This exports the state lists, the legal paths, and the opener by name.

// #endregion Exports


