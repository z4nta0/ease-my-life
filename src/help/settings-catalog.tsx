


// #region Imports

import type { HelIteTyp } from './catalog-item.ts'; // What: Help Item Type. Why: Every item in this catalog shares the one shape help mode reads. How: This types SET_HEL_ARR.

// #endregion Imports



/**
 * settings-catalog.tsx = Settings Catalog
 *
 * @summary
 * The on-demand help catalog for the Settings tab, which help mode (see
 * help/mode.tsx) highlights and explains one item at a time.
 *
 * Copy is largely forked from onboarding/page-steps.tsx's own SET_TAR_OBJ
 * catalog, same targets, same underlying explanation, with directive tour
 * language ("click Next", "click Done when ready", "these buttons are disabled
 * for this tutorial") stripped out, since a help-mode tip has no steps to
 * advance through and no tutorial disables anything it points at.
 *
 * One item per DISTINCT piece of functionality, not one per DOM element, so
 * a row of related controls gets one tip explaining what the whole row does
 * rather than one per control. Every item is a HelIteTyp, whose fields are
 * documented once on the type in catalog-item.ts, so no item repeats their
 * comments; each item's opening line carries its identity comment instead.
 *
 * Sections:
 *  - Constants
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const SET_HEL_ARR : HelIteTyp[] = [ // What: Settings Help Array. Why: This is the on-demand help catalog for the Settings tab, one entry per distinct piece of functionality on that page rather than one per DOM element. How: This is the item list help mode reads for the Settings tab.


	// #region Settings Header

	{ // What: Home Link Help Item. Why: This is the on-demand help tip for the Home Link element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>You can click this logo at any time to navigate back to the home page of the app, the Today page.</>,
		ideStr : 'brandMark',
		selStr : '[data-element-name-hook~="heaLeaDiv"] [data-element-name-hook~="braMarBut"]',
		titStr : 'Home Link'


	},

	{ // What: Sections Navigation Help Item. Why: This is the on-demand help tip for the Sections Navigation element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // Section rail, at 760px and below this collapses into a horizontal sticky pill bar pinned above the sections (see setRaiAsi's own @container rule in tab-settings.module.css); above 760px it's a vertical sidebar. One combined highlight over the whole rail rather than per-button, matching the nav bar's own precedent.


		bodEle    : <>This will let you jump straight to any section of the Settings page. On mobile devices, this will stay pinned to the top of the page no matter how far down you have scrolled.</>,
		ideStr    : 'settingsRail',
		padYcoNum : 0, // padYcoNum:0, on narrow viewports this is sticky (position:sticky; top:0) with its own opaque background; the default pad extended the mask cutout past the rail's own real bottom edge, revealing whatever page content had scrolled underneath it in that gap (nothing there covers it, the dim overlay sits above the rail's own z-index:11, and the cutout hole doesn't care that the rail's own box doesn't reach that far).
		selStr    : '[data-element-name-hook~="setRaiAsi"]',
		titStr    : 'Sections Navigation'


	},

	// #endregion Settings Header



	// #region Appearance

	{ // What: System Theme Preference Help Item. Why: This is the on-demand help tip for the System Theme Preference element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>When on, the app follows your system's own light/dark setting and automatically switches between your chosen light and dark themes (e.g. Ink &rarr; Night) whenever your system does. When off, only your manually selected theme below applies.</>,
		ideStr : 'appearanceSystemPref',
		selStr : '[data-element-name-hook~="setAppSec"] [data-element-name-hook~="setRowDiv"]:has(button[aria-label="System preference"])',
		titStr : 'System Theme Preference'


	},

	{ // What: Light Theme Help Item. Why: This is the on-demand help tip for the Light Theme element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This is where you choose the theme that's used when the app is in light mode. Pick any of the presets, or use the Custom row to mix your own colors. Custom themes will automatically generate a matching dark theme, which you're then free to edit separately.</>,
		ideStr : 'appearanceThemeLight',
		selStr : '[data-element-name-hook~="theLigDiv"]',
		titStr : 'Light Theme'


	},

	// padYcoNum:4 (not the default 8), consecutive Appearance subsection blocks have a real but modest 11px gap (the section's own flex gap), and 8+8 exceeds that by 5px; 4+4 stays safely inside it.
	{ // What: Dark Theme Help Item. Why: This is the on-demand help tip for the Dark Theme element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This is where you choose the theme that's used when the app is in dark mode. Pick any of the presets, or use the Custom row to mix your own colors. Custom themes will automatically generate a matching light theme, which you're then free to edit separately.</>,
		ideStr    : 'appearanceThemeDark',
		padYcoNum : 4,
		selStr    : '[data-element-name-hook~="theDarDiv"]',
		titStr    : 'Dark Theme'


	},

	{ // What: Completion Celebration Help Item. Why: This is the on-demand help tip for the Completion Celebration element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This is where you choose which animation plays in the Today page when every item in your todo list is marked as done. Use Preview to watch any of them play out before picking one.</>,
		ideStr    : 'appearanceCelebration',
		padYcoNum : 4,
		selStr    : '[data-element-name-hook~="celStyDiv"]',
		titStr    : 'Completion Celebration'


	},

	{ // What: Picker Animation Help Item. Why: This is the on-demand help tip for the Picker Animation element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This is where you choose which animation plays in the Pickers tab when the manual picker functionality is triggered via the "Pick One" button. Use Preview to watch any of them play out before picking one.</>,
		ideStr    : 'appearancePickAnim',
		padYcoNum : 4,
		selStr    : '[data-element-name-hook~="picAniDiv"]',
		titStr    : 'Picker Animation'


	},

	{ // What: Tab Bar Placement Help Item. Why: This is the on-demand help tip for the Tab Bar Placement element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This controls where the app's main navigation is positioned on screen: a floating bar at the bottom, a sidebar on the left, or a bar along the top.</>,
		ideStr    : 'appearanceLayout',
		padYcoNum : 4,
		selStr    : '[data-element-name-hook~="setLayDiv"]',
		titStr    : 'Tab Bar Placement'


	},

	// #endregion Appearance



	// #region Daily Generator

	// padYcoNum:0 on all three below, setRowDiv rows have no margin between them, just their own padding + a border-bottom (Card is a plain div, not a flex/grid gap container), so they touch with zero gap.
	{ // What: Run Generator Automatically Help Item. Why: This is the on-demand help tip for the Run Generator Automatically element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This toggles whether the Daily generator runs on its own each day. When off, you'll need to run it manually using the Regenerate button at the bottom of the Today page.</>,
		ideStr    : 'dailyAutoToggle',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="setDaiSec"] [data-element-name-hook~="setRowDiv"]:has(button[aria-label="Run the Daily generator automatically"])',
		titStr    : 'Run Generator Automatically'


	},

	{ // What: Run Generator Time Help Item. Why: This is the on-demand help tip for the Run Generator Time element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This sets what time of day the Daily generator runs automatically. A quiet, early hour works best so your list is ready first thing in the morning.</>,
		ideStr    : 'dailyRunTime',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="setDaiSec"] [data-element-name-hook~="runTimDiv"]',
		titStr    : 'Run Generator Time'


	},

	{ // What: Run Generator Notification Help Item. Why: This is the on-demand help tip for the Run Generator Notification element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This lets you get a notification once your todo list has been generated for the day. This is the only notification the app will ever send and only once a day. It only works while the app is open in a tab or window, but always push notifications are coming in a future release.</>,
		ideStr    : 'dailyNotify',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="notRowDiv"]',
		titStr    : 'Run Generator Notification'


	},

	// #endregion Daily Generator



	// #region Holidays

	// padYcoNum:4, holAddDiv has a real but modest margin-top of about 14.6px from holLisUno above it, and default 8+8 pad exceeds that by about 1.4px.
	{ // What: Edit Observed Holidays Help Item. Why: This is the on-demand help tip for the Edit Observed Holidays element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This lists every computed holiday for the current year. Toggle any of them off if you don't observe it, any picker set to "Skip on holidays" will respect these settings.</>,
		ideStr    : 'holidayList',
		padYcoNum : 4,
		selStr    : '[data-element-name-hook~="holLisUno"]',
		titStr    : 'Edit Observed Holidays'


	},

	{ // What: Add Custom Holiday Help Item. Why: This is the on-demand help tip for the Add Custom Holiday element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This lets you add your own custom holiday, like a birthday or anniversary, which pickers will respect if their "Skip on holidays" toggle is turned on.</>,
		ideStr    : 'holidayAdd',
		padYcoNum : 4,
		selStr    : '[data-element-name-hook~="holAddDiv"]',
		titStr    : 'Add Custom Holiday'


	},

	// #endregion Holidays



	// #region Data Control

	// padYcoNum:0 on the whole group below, same zero-gap setRowDiv stacking as Daily generator above.
	{ // What: Protect Your Data Help Item. Why: This is the on-demand help tip for the Protect Your Data element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This shows how your data is currently being stored, whether the browser has promised not to clear it, and roughly how much data you are storing in the app. Installing the app or granting persistent storage both help protect it from being cleared automatically.</>,
		ideStr    : 'dataStorageStatus',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="stoRowDiv"]',
		titStr    : 'Protect Your Data'


	},

	{ // What: Install Instructions Help Item. Why: This is the on-demand help tip for the Install Instructions element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge. // Up to four install note rows (already installed / can't install here / iOS Add to Home Screen / Mac Add to Dock, see tab-settings.tsx) share this one class, so this covers whichever is showing.


		bodEle    : <>This shows device and browser specific information about how to install the app. Installing the app has many benefits, but you can always keep using the app as a website if you prefer.</>,
		ideStr    : 'dataInstallInstructions',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="insRowDiv"]',
		titStr    : 'Install Instructions'


	},

	{ // What: Export Your Data Help Item. Why: This is the on-demand help tip for the Export Your Data element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This downloads a file containing all of your data: pickers, items, reminders, history and app settings. Since all app data lives on your device, you alone are responsible for taking care of it. It is also handy for moving your data to a new, or second, device.</>,
		ideStr    : 'dataExport',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="expRowDiv"]',
		titStr    : 'Export Your Data'


	},

	{ // What: Import Your Data Help Item. Why: This is the on-demand help tip for the Import Your Data element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This restores your data from a previously exported backup file. Importing a backup <b>replaces all data</b> currently stored in the app, so make sure that's what you want first.</>,
		ideStr    : 'dataImport',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="impRowDiv"]',
		titStr    : 'Import Your Data'


	},

	{ // What: Reset All Data Help Item. Why: This is the on-demand help tip for the Reset All Data element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This wipes everything and restores the app to a clean, first-run state. <b>This can't be undone</b>, so export a backup first if there's any chance you'll want this data again.</>,
		ideStr    : 'dataReset',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="resRowDiv"]',
		titStr    : 'Reset All Data'


	},

	// #endregion Data Control



	// #region Account

	{ // What: Your Account Help Item. Why: This is the on-demand help tip for the Your Account element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>Ease My Life runs entirely on this device with no account required. Signing in, with Google or an emailed link, is optional and changes nothing on its own. Syncing your data across devices is a one-time purchase, not a subscription, and your theme and display settings stay separate on each device.</>,
		ideStr : 'account',
		selStr : '[data-element-name-hook~="setAccSec"]',
		titStr : 'Your Account'


	},

	// #endregion Account



	// #region About

	{ // What: App Info Help Item. Why: This is the on-demand help tip for the App Info element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This shows the app's current version, along with links to the creator's website and this app's source code on GitHub.</>,
		ideStr : 'aboutInfo',
		selStr : '[data-element-name-hook~="aboInfDiv"]',
		titStr : 'App Info'


	},

	{ // What: Support the Project Help Item. Why: This is the on-demand help tip for the Support the Project element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>A way to support the app's development with a one-time tip of any amount through Ko-fi, which opens in a new tab. No account is needed.</>,
		ideStr : 'aboutSupportProject',
		selStr : '[data-element-name-hook~="supProDiv"]',
		titStr : 'Support the Project'


	},

	{ // What: Replay the Welcome Tour Help Item. Why: This is the on-demand help tip for the Replay the Welcome Tour element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This replays the first-run walkthrough from the very beginning, including the welcome message and all of the tutorials.</>,
		ideStr : 'aboutReplayTour',
		selStr : '[data-element-name-hook~="repTouDiv"]',
		titStr : 'Replay the Welcome Tour'


	},

	{ // What: Contact Support Help Item. Why: This is the on-demand help tip for the Contact Support element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>This opens a short form for sending a message directly to the developer. Your app version and browser are attached automatically, so there's no back-and-forth needed to track those down.</>,
		ideStr : 'aboutContactTrigger',
		selStr : '[data-element-name-hook~="supTrgDiv"]',
		titStr : 'Contact Support'


	},

	{ // What: Support Message Help Item. Why: This is the on-demand help tip for the Support Message element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle : <>Fill in a subject and message describing your problem or suggestion. Your app version and browser are already filled in below for reference.</>,
		ideStr : 'aboutContactForm',
		selStr : '[data-element-name-hook~="supForDiv"]',
		titStr : 'Support Message'


	},

	{ // What: Cancel / Send Help Item. Why: This is the on-demand help tip for the Cancel / Send element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		ideStr : 'aboutContactFormFoot',
		selStr : '[data-element-name-hook~="supFooDiv"]',
		titStr : 'Cancel / Send',

		bodEle : (


			<>{ /* What: Body Fragment. Why: This tip's own body groups several lines as one element. How: This wraps them without adding a wrapper element to the tip. */ }


				<p><b>Cancel:</b> This discards your message and closes the form without sending.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }

				<p><b>Send:</b> This sends your message. If it can't go through (for example, if you're offline), you'll be shown an email address to reach out to instead, and your message will be kept so you can try again.</p>{ /* What: Body Paragraph Element. Why: This is one line of this help item's own explanatory copy. How: This is rendered as-is inside the tip. */ }


			</>


		)


	},

	// #endregion About



	// #region Legal

	// padYcoNum:0 on both, same zero-gap setRowDiv stacking as above.
	{ // What: Privacy Policy Help Item. Why: This is the on-demand help tip for the Privacy Policy element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This opens the Privacy Policy, which explains how your data is collected, used, and stored.</>,
		ideStr    : 'legalPrivacy',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="priRowDiv"]',
		titStr    : 'Privacy Policy'


	},

	{ // What: Terms of Service Help Item. Why: This is the on-demand help tip for the Terms of Service element. How: HelOveCom highlights this item's own selStr target and opens this tip from its badge.


		bodEle    : <>This opens the Terms of Service, which covers the rules for using Ease My Life, including any paid features.</>,
		ideStr    : 'legalTerms',
		padYcoNum : 0,
		selStr    : '[data-element-name-hook~="terRowDiv"]',
		titStr    : 'Terms of Service'


	}

	// #endregion Legal


];

// #endregion Constants



// #region Exports

export { SET_HEL_ARR }; // What: Named Export. Why: This catalog is the file's one public binding. How: This exports the catalog by name.

// #endregion Exports


