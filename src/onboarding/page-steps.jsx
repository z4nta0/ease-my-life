


// #region Imports

import { durMilFun   } from '../utils/rhythm.js';               // What: Duration Millisecond Function. Why: Timers that wait on a CSS animation must end with it. How: This returns a duration step's length in milliseconds, matching the stylesheet's own --dur-* tokens.
import { NAV_TAR_OBJ } from './targets.jsx';                    // What: Nav Target Object. Why: Every page tour's own Step 1 points at the real nav button this shared catalog describes. How: This is looked up by a page key inside buiTs1Fun.
import { ONB_EXA_OBJ } from '../state/onboarding-seed-data.js'; // What: Onboarding Example Object. Why: Its own id is the Stats tour's own preselected picker. How: This is read directly for PRE_PIC_STR.

// #endregion Imports



/**
 * page-steps.jsx = Page Steps
 *
 * @summary
 * The steps of each page mini-tour: buiTs1Fun builds the shared Step 1 that
 * points at a page's own nav tab, and buiTesFun builds the rest of a page's
 * tour from its own target catalog (DAT_TAR_OBJ, PIC_TAR_OBJ, SET_TAR_OBJ,
 * STA_TAR_OBJ, TOD_TAR_OBJ). canRenFun and forNamFun guard the Pickers tour's
 * own group-rename step, tracking the group's real name in pgtNamStr.
 *
 * Sections:
 *  - Constants
 *  - Module State
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const PRE_PIC_STR = ONB_EXA_OBJ.id; // What: Preselect Picker String. Why: The Stats tour's own single-picker steps below pre-select this exact real sample, matched by [data-picker-id] on the tab button (tab-stats.jsx), not by its display name, since nothing stops a user from naming their own picker the same thing. How: This reads ONB_EXA_OBJ's own id straight through.



// #region DAT_TAR_OBJ

/**
 * DAT_TAR_OBJ = Data Target Object
 *
 * @summary
 * Target and description catalog for the Data page's OWN interior elements,
 * same shape/reasoning as STA_TAR_OBJ below. Also a first draft covering only
 * the "main sections" per instruction, likely to grow more steps later.
 * pgfObj/pfsObj are both disabled while their own step is up (tab-data.jsx's
 * own disGroBoo/disShoBoo, the same touIdeStr plus touSteNum gating pattern as
 * tab-picker.jsx), narrating what they do is the point, and changing
 * filGroStr/curScoStr mid-tour would otherwise leave a LATER step's own target
 * (rmsObj, which only shows at scope 'all') unable to find anything, since
 * nothing here resets it back afterward.
 *
 * 2 of these fields carry the exact same boilerplate What/Why/How
 * wherever they appear, so none of the entries below repeat it on
 * their own lines (see the "Repeated-shape object literals" comment
 * exception in CLAUDE.md). `selStr` still gets its own bullet
 * explaining what the field is FOR in general, but keeps its own
 * per-entry inline comment too, since each entry's own Why genuinely
 * differs, describing that entry's own specific target:
 *
 * - `bodEle` (Element): Body Element is this step's own coach card
 *   body, a plain description of what the highlighted element does,
 *   rendered as JSX so specific phrases can be bolded.
 *
 * - `selStr` (String): Selector String is the CSS selector(s)
 *   GuiTouCom highlights for this step (comma-separated fallbacks
 *   honored in order, first match wins).
 *
 * - `titStr` (String): Title String is this step's own coach card
 *   heading, rendered by GuiTouCom as the step's own heading text.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const DAT_TAR_OBJ = { // What: Data Target Object. Why: buiTesFun below spreads each of these entries into the Data tour's own real step objects. How: This is looked up by a fixed key per step inside buiTesFun's own explore_data branch.


	cpfObj : { // What: Create-Picker-Form Object. Why: This is the target/content descriptor for the real Create Picker button. How: This is spread into buiTesFun's own Create Picker step object.


		bodEle : <>This creates a new picker directly from this list, respecting the group, type and conditional filters if they are used. This concludes the Data page tutorial, click Done when you are ready.</>,
		selStr : '[data-element-name-hook~="datCreBut"]', // What: Selector String. Why: This step highlights the real Create Picker button at the bottom of the list. How: GuiTouCom spotlights whatever this selector matches.
		titStr : 'Create New Picker'


	},

	pfsObj : { // What: Pickers-Filter-Selection Object. Why: This is the target/content descriptor for the real scope-tabs row. How: This is spread into buiTesFun's own Show Filter step object.


		bodEle : <>This will allow you to <b>further narrow exactly what you want to view and edit</b>.</>,
		selStr : '[data-element-name-hook~="scoTabDiv"] [data-element-name-hook~="scoTabBut"]', // What: Selector String. Why: This step highlights the whole scope-tabs row. How: GuiTouCom spotlights whatever this selector matches.
		titStr : 'Show Filter'


	},

	pgfObj : { // What: Picker-Group-Filter Object. Why: This is the target/content descriptor for the real Group Filter pills. How: This is spread into buiTesFun's own Group Filter step object.


		bodEle : <>This will allow you to <b>filter the pickers row below by group</b>, which is extremely useful if you have created a lot of pickers.</>,
		selStr : '[data-element-name-hook~="groFilDiv"] [data-element-name-hook~="filPilBut"]', // What: Selector String. Why: This step highlights the Group Filter pills specifically. How: GuiTouCom spotlights whatever this selector matches.
		titStr : 'Group Filter'


	},

	pmsObj : { // What: Pickers-Manager-Section Object. Why: This is the target/content descriptor for the real combined picker/Conditionals/Reminders region. How: This is spread into buiTesFun's own View and Edit Pickers step object.


		bodEle : <>This is where you can <b>view and edit all of your pickers, as well as their containing items</b>. You can also create new picker items. Feel free to explore this section yourself. Click Next when you are ready to move on.</>,
		selStr : '[data-element-name-hook~="datLisDiv"] > [data-element-name-hook~="datCatSec"]', // What: Selector String. Why: This step highlights every picker/Conditionals/Reminders card as one combined region. How: GuiTouCom spotlights every element this selector matches.
		titStr : 'View and Edit Pickers'


	},

	ptfObj : { // What: Picker-Type-Filter Object. Why: This is the target/content descriptor for the real Type Filter pills. How: This is spread into buiTesFun's own Type Filter step object.


		bodEle : <>This will allow you to <b>further filter the show row below by their type</b>, which combines with the group filter and is extremely useful if you have created a lot of pickers.</>,
		selStr : '[data-element-name-hook~="typFilDiv"] [data-element-name-hook~="filPilBut"]', // What: Selector String. Why: This step highlights the Type Filter pills specifically. How: GuiTouCom spotlights whatever this selector matches.
		titStr : 'Type Filter'


	},

	rmsObj : { // What: Reminders-Manager-Section Object. Why: This is the target/content descriptor for the real Reminders manager section. How: This is spread into buiTesFun's own View and Edit Reminders step object.


		bodEle : <>This is where you can <b>view and edit all of your reminders, as well as create new ones</b>. Feel free to explore this section yourself. Click Next when you are ready to move on.</>,
		selStr : '[data-element-name-hook~="remCatSec"]', // What: Selector String. Why: This step highlights the whole Reminders manager section. How: GuiTouCom spotlights whatever this selector matches.
		titStr : 'View and Edit Reminders'


	}


};

// #endregion DAT_TAR_OBJ



// #region PIC_TAR_OBJ

/**
 * PIC_TAR_OBJ = Pickers Target Object
 *
 * @summary
 * Target and description catalog for the Pickers page's OWN interior
 * elements, content only (selStr/titStr/bodEle, plus cliSelStr/pulSelStr
 * where a two-phase highlight is needed), no navigation fields, the same
 * shape/reasoning as TOD_TAR_OBJ below. buiTesFun spreads these entries
 * together with this flow's own tabStr/priStr/bacBoo/etc. flags.
 *
 * 3 of these fields carry the exact same boilerplate What/Why/How (or,
 * for pulSelStr, the exact same text) wherever they appear, so none of
 * the entries below repeat it on their own lines (see the "Repeated-
 * shape object literals" comment exception in CLAUDE.md). `selStr` and
 * `cliSelStr` still get their own bullet explaining what the field is
 * FOR in general, but keep their own per-entry inline comment too,
 * since each entry's own Why genuinely differs, describing that
 * entry's own specific target:
 *
 * - `bodEle` (Element): Body Element is this step's own coach card
 *   body, a plain description of what the highlighted element does,
 *   rendered as JSX so specific phrases can be bolded.
 *
 * - `cliSelStr` (String, optional): Click Selector String overrides
 *   what counts as "on target" for the click-guard/cirBoo logic
 *   specifically, when a step's own selStr highlights a bigger box
 *   than what should actually satisfy the click. Defaults to selStr
 *   when unset.
 *
 * - `pulSelStr` (String, optional): Pulse Selector String only exists
 *   on a step needing a two-phase highlight (see cliSelStr just
 *   above). There is nothing left to click once the highlight has
 *   widened to frame the window, so the pulse should stop there too,
 *   matching the same primary alternative as selStr.
 *
 * - `selStr` (String): Selector String is the CSS selector(s)
 *   GuiTouCom highlights for this step (comma-separated fallbacks
 *   honored in order, first match wins).
 *
 * - `titStr` (String): Title String is this step's own coach card
 *   heading, rendered by GuiTouCom as the step's own heading text.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const PIC_TAR_OBJ = { // What: Pickers Target Object. Why: buiTesFun below spreads each of these entries into the Pickers tour's own real step objects. How: This is looked up by a fixed key per step inside buiTesFun's own explore_pickers branch.


	atlObj : { // What: Add-Todo-List Object. Why: This is the target/content descriptor for the real Send to Today button. How: This is spread into buiTesFun's own Add To Todo List step object.


		bodEle    : <>The "Send to Today" button will <b>add the manually generated pick to your todo list on the Today page</b>. Go ahead and click the "Send to Today" button now to see how this works.</>,
		cliSelStr : '[data-element-name-hook~="picSenBut"]', // What: Click Selector String. Why: The cirBoo guard must stay scoped to Send to Today specifically, not any disabled sibling sharing the widened box. How: This is read by the click-guard/cirBoo logic separately from selStr.
		pulSelStr : '[data-element-name-hook~="picSenBut"]:not([data-pick-sent-active])',
		selStr    : '[data-element-name-hook~="picSenBut"]:not([data-pick-sent-active]), [data-element-name-hook~="picRunDiv"]', // What: Selector String. Why: This step highlights the real Send to Today button, falling back to framing the whole stage once it's sent. How: GuiTouCom spotlights the first alternative that matches.
		titStr    : 'Add to Todo List'


	},

	cnpObj : { // What: Create-New-Pickers Object. Why: This is the target/content descriptor for the real Add New Picker tab. How: This is spread into buiTesFun's own Create New Pickers step object.


		bodEle : <>The "Add New Picker" button will <b>open up a form that allows you to create new pickers</b>. This will not be included as part of the tutorial, but if you want to learn more then please do any one of the picker tutorials after this is finished.</>,
		selStr : ':is([data-element-name-hook~="picAddBut"], [data-element-name-hook~="picAddSpa"])', // What: Selector String. Why: This step highlights the real "Add New Picker" tab. How: GuiTouCom spotlights whatever this selector matches.
		titStr : 'Create New Pickers'


	},

	epsObj : { // What: Edit-Picker-Settings Object. Why: This is the target/content descriptor for the real Edit Picker button. How: This is spread into buiTesFun's own Edit Picker step object.


		bodEle : <>This opens the same form used to create a picker, pre-filled with this picker's current settings. You can <b>adjust its name, group, type, daily generator schedule, or conditional attachment</b>. Its items aren&rsquo;t edited here, but you can use this picker's own item list below or the Data tab for that.</>,
		selStr : '[data-element-name-hook~="picEdiBut"]', // What: Selector String. Why: This step highlights the real Edit Picker button. How: GuiTouCom spotlights whatever this selector matches.
		titStr : 'Edit Picker'


	},

	mpgObj : { // What: Manual-Pick-Generation Object. Why: This is the target/content descriptor for the real Pick One button. How: This is spread into buiTesFun's own Manual Generation step object.


		bodEle    : <>The "Pick One" button will <b>allow you to run a manual pick generation for your selected picker</b>, so that you do not have to completely rely on the todo list's auto generation feature on the Today page. Click the "Pick One" button now to see how this works.</>,
		cliSelStr : '[data-element-name-hook~="picOneBut"]', // What: Click Selector String. Why: The cirBoo guard must stay scoped to the button specifically even once the fallback widens the highlight. How: This is read by the click-guard/cirBoo logic separately from selStr.
		pulSelStr : '[data-element-name-hook~="picOneBut"]:not(:disabled)',
		selStr    : '[data-element-name-hook~="picOneBut"]:not(:disabled), [data-element-name-hook~="picRunDiv"]', // What: Selector String. Why: This step highlights the idle Pick One button, falling back to framing the whole stage once it goes busy. How: GuiTouCom spotlights the first alternative that matches.
		titStr    : 'Manual Generation'


	},

	pgfObj : { // What: Picker-Group-Filter Object. Why: This is the target/content descriptor for the real Group Filter pills. How: This is spread into buiTesFun's own Group Filter step object.


		bodEle : <>This will allow you to <b>filter the pickers row below by their group</b>, which is extremely useful if you have created a lot of pickers.</>,
		selStr : '[data-element-name-hook~="groFilDiv"] [data-element-name-hook~="filPilBut"]', // What: Selector String. Why: This step highlights the Group Filter pills specifically. How: GuiTouCom spotlights whatever this selector matches.
		titStr : 'Group Filter'


	},

	piaObj : { // What: Picker-Item-Add Object. Why: This is the target/content descriptor for the real Add Item button. How: This is spread into buiTesFun's own Add Picker Item step object.


		bodEle : <>The "Add Item" button will <b>allow you to add new items to the selected picker's list of items</b>. This button is disabled for this tutorial. This concludes the Pickers page tutorial, click Done when you are ready.</>,
		selStr : '[data-element-name-hook~="iteAddBut"]', // What: Selector String. Why: This step highlights the real Add Item button. How: GuiTouCom spotlights whatever this selector matches.
		titStr : 'Add Picker Item'


	},

	pivObj : { // What: Picker-Items-View Object. Why: This is the target/content descriptor for the picker's own item pool. How: This is spread into buiTesFun's own Picker Items step object.


		bodEle : <>Here you can <b>view all items in this picker's pool</b>. You can see a given items values, if applicable, as well as the <b>Send to Today, Edit and Delete buttons</b>. These buttons are disabled for this tutorial.</>,
		selStr : '[data-element-name-hook~="pooIteDiv"]', // What: Selector String. Why: This step highlights the whole item pool, excluding the Add Item button. How: GuiTouCom spotlights whatever this selector matches.
		titStr : 'Picker Items'


	},

	ptfObj : { // What: Picker-Type-Filter Object. Why: This is the target/content descriptor for the real Type Filter pills. How: This is spread into buiTesFun's own Type Filter step object.


		bodEle : <>This will allow you to <b>further filter the pickers row below by their type</b>, which combines with the previous group filter and is extremely useful if you have created a lot of pickers.</>,
		selStr : '[data-element-name-hook~="typFilDiv"] [data-element-name-hook~="filPilBut"]', // What: Selector String. Why: This step highlights the Type Filter pills specifically. How: GuiTouCom spotlights whatever this selector matches.
		titStr : 'Type Filter'


	},

	spsObj : { // What: Specific-Picker-Selection Object. Why: This is the target/content descriptor for selecting one specific picker's own tab. How: This is spread into buiTesFun's own Picker Selection step object.


		bodEle : <>This will <b>allow you to select a specific picker</b>, in order to initiate a manual picker generation as well as edit or delete its items.</>,
		selStr : '[data-element-name-hook~="picTabDiv"] [data-element-name-hook~="picTabBut"]', // What: Selector String. Why: This step highlights every existing picker's own tab, excluding the Add tab. How: GuiTouCom spotlights whatever this selector matches.
		titStr : 'Picker Selection'


	}


};

// #endregion PIC_TAR_OBJ



// #region SET_TAR_OBJ

/**
 * SET_TAR_OBJ = Settings Target Object
 *
 * @summary
 * Target and description catalog for the Settings page's OWN interior
 * elements, same shape/reasoning as PIC_TAR_OBJ above. One step per
 * section, each a fixed-content reference blurb (no interaction to
 * drive, unlike the Pickers tour), every setSecSec is always
 * mounted (a scroll-spy sidebar, not a disclosure), so GuiTouCom's own
 * scroll-into-view handles reaching each one without any runFun staging.
 *
 * 2 of these fields carry the exact same boilerplate What/Why/How
 * wherever they appear, so none of the entries below repeat it on
 * their own lines (see the "Repeated-shape object literals" comment
 * exception in CLAUDE.md). `selStr` still gets its own bullet
 * explaining what the field is FOR in general, but keeps its own
 * per-entry inline comment too, since each entry's own Why genuinely
 * differs, describing that entry's own specific target:
 *
 * - `bodEle` (Element): Body Element is this step's own coach card
 *   body, a plain description of what the highlighted element does,
 *   rendered as JSX so specific phrases can be bolded.
 *
 * - `selStr` (String): Selector String is the CSS selector(s)
 *   GuiTouCom highlights for this step (comma-separated fallbacks
 *   honored in order, first match wins).
 *
 * - `titStr` (String): Title String is this step's own coach card
 *   heading, rendered by GuiTouCom as the step's own heading text.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const SET_TAR_OBJ = { // What: Settings Target Object. Why: buiTesFun below spreads each of these entries into the Settings tour's own real step objects. How: This is looked up by a fixed key per step inside buiTesFun's own explore_settings branch.


	aboObj : { // What: About Object. Why: This is the target/content descriptor for the real About section. How: This is spread into buiTesFun's own About step object.


		bodEle : <>This is where you can find information about this app and its developer, replay the welcome tour and all of these tutorials at any time, and <b>contact the developer if you have any problems or suggestions</b>.</>,
		selStr : '[data-element-name-hook~="setAboSec"]', // What: Selector String. Why: This step highlights the whole About section. How: GuiTouCom spotlights whatever this selector matches.
		titStr : 'About Ease My Life'


	},

	appObj : { // What: Appearance Object. Why: This is the target/content descriptor for the real Appearance section. How: This is spread into buiTesFun's own Appearance step object.


		bodEle : <>This is where you can <b>customize the app's look and feel</b>: light, dark and custom theme colors, completion celebration animations, picker pick animations, and tab bar placement.</>,
		selStr : '[data-element-name-hook~="setAppSec"]', // What: Selector String. Why: This step highlights the whole Appearance section. How: GuiTouCom spotlights whatever this selector matches.
		titStr : 'App Customization'


	},

	daiObj : { // What: Daily Object. Why: This is the target/content descriptor for the real Daily Generator section. How: This is spread into buiTesFun's own Daily Generator step object.


		bodEle : <>This is where you can <b>control the daily generator</b>: turn auto generation on or off, what time it runs, and enabling notifications for when it does.</>,
		selStr : '[data-element-name-hook~="setDaiSec"]', // What: Selector String. Why: This step highlights the whole Daily Generator section. How: GuiTouCom spotlights whatever this selector matches.
		titStr : 'Daily Generator'


	},

	dtaObj : { // What: Data Object. Why: This is the target/content descriptor for the real Data Control section. How: This is spread into buiTesFun's own Data Control step object.


		bodEle : <>This is where you can protect your data from browser deletion, <b>install the app directly to your device</b>, back up your data (export), restore your data (import), or erase all of your data.</>,
		selStr : '[data-element-name-hook~="setDatSec"]', // What: Selector String. Why: This step highlights the whole Data Control section. How: GuiTouCom spotlights whatever this selector matches.
		titStr : 'Data Control'


	},

	holObj : { // What: Holidays Object. Why: This is the target/content descriptor for the real Holiday Controls section. How: This is spread into buiTesFun's own Holiday Controls step object.


		bodEle : <>This is where you can <b>toggle which holiday observances that the pickers and reminders option uses</b>. You can even add your own custom holidays, like your birthday!</>,
		selStr : '[data-element-name-hook~="setHolSec"]', // What: Selector String. Why: This step highlights the whole Holiday Controls section. How: GuiTouCom spotlights whatever this selector matches.
		titStr : 'Holiday Controls'


	},

	legObj : { // What: Legal Object. Why: This is the target/content descriptor for the real Legal section. How: This is spread into buiTesFun's own Legal step object.


		bodEle : <>This is where you can <b>view the Privacy Policy and Terms of Service</b>. This concludes the Settings page tutorial, click Done when you are ready.</>,
		selStr : '[data-element-name-hook~="setLegSec"]', // What: Selector String. Why: This step highlights the whole Legal section. How: GuiTouCom spotlights whatever this selector matches.
		titStr : 'Legal Information'


	}


};

// #endregion SET_TAR_OBJ



// #region STA_TAR_OBJ

/**
 * STA_TAR_OBJ = Stats Target Object
 *
 * @summary
 * Target and description catalog for the Stats page's OWN interior
 * elements, same shape/reasoning as PIC_TAR_OBJ above. A first draft
 * covering only the "main sections" per instruction, not every filter/
 * card gets its own step yet.
 *
 * 2 of these fields carry the exact same boilerplate What/Why/How
 * wherever they appear, so none of the entries below repeat it on
 * their own lines (see the "Repeated-shape object literals" comment
 * exception in CLAUDE.md). `selStr` still gets its own bullet
 * explaining what the field is FOR in general, but keeps its own
 * per-entry inline comment too, since each entry's own Why genuinely
 * differs, describing that entry's own specific target:
 *
 * - `bodEle` (Element): Body Element is this step's own coach card
 *   body, a plain description of what the highlighted element does,
 *   rendered as JSX so specific phrases can be bolded.
 *
 * - `selStr` (String): Selector String is the CSS selector(s)
 *   GuiTouCom highlights for this step (comma-separated fallbacks
 *   honored in order, first match wins).
 *
 * - `titStr` (String): Title String is this step's own coach card
 *   heading, rendered by GuiTouCom as the step's own heading text.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const STA_TAR_OBJ = { // What: Stats Target Object. Why: buiTesFun below spreads each of these entries into the Stats tour's own real step objects. How: This is looked up by a fixed key per step inside buiTesFun's own explore_stats branch.


	hemObj : { // What: Heatmap Object. Why: This is the target/content descriptor for the real activity heatmap card. How: This is spread into buiTesFun's own Heatmap step object.


		bodEle : <>This visualizes your completed activity over time, with <b>each day shaded by how much you got done</b>. You can click on any day for more details. Click Next when you are ready to advance to the next step.</>,
		selStr : '[data-element-name-hook~="heaMapDiv"]', // What: Selector String. Why: This step highlights the whole activity heatmap card. How: GuiTouCom spotlights whatever this selector matches.
		titStr : 'Activity Heatmap'


	},

	pbvObj : { // What: Picker-Breakdown-View Object. Why: This is the target/content descriptor for the real picker breakdown card. How: This is spread into buiTesFun's own Picker Breakdown step object.


		bodEle : <>Once a specific picker is selected, its individual items are broken down here. You can <b>view things like pick count, pick frequency, last picked date</b> and others. This concludes the Stats page tutorial, click Done when you are ready.</>,
		selStr : '[data-element-name-hook~="breCarDiv"]', // What: Selector String. Why: This step highlights the whole picker breakdown card. How: GuiTouCom spotlights whatever this selector matches.
		titStr : 'Picker Breakdown'


	},

	pfsObj : { // What: Pickers-Filter-Selection Object. Why: This is the target/content descriptor for the real scope-tabs row. How: This is spread into buiTesFun's own Show Filter step object.


		bodEle : <>This will allow you to <b>narrow your selection to specific pickers, reminders or conditionals</b>, or you can view everything all at once.</>,
		selStr : '[data-element-name-hook~="scoTabDiv"] [data-element-name-hook~="scoTabBut"]', // What: Selector String. Why: This step highlights the whole scope-tabs row. How: GuiTouCom spotlights whatever this selector matches.
		titStr : 'Show Filter'


	},

	pgfObj : { // What: Picker-Group-Filter Object. Why: This is the target/content descriptor for the real Group Filter pills. How: This is spread into buiTesFun's own Group Filter step object.


		bodEle : <>This will allow you to <b>filter the pickers row below by group</b>, which is extremely useful if you have created a lot of pickers.</>,
		selStr : '[data-element-name-hook~="groFilDiv"] [data-element-name-hook~="filPilBut"]', // What: Selector String. Why: This step highlights the Group Filter pills specifically. How: GuiTouCom spotlights whatever this selector matches.
		titStr : 'Group Filter'


	},

	ptfObj : { // What: Picker-Type-Filter Object. Why: This is the target/content descriptor for the real Type Filter pills. How: This is spread into buiTesFun's own Type Filter step object.


		bodEle : <>This will allow you to <b>further filter the show row below by their type</b>, which combines with the previous group filter and is extremely useful if you have created a lot of pickers.</>,
		selStr : '[data-element-name-hook~="typFilDiv"] [data-element-name-hook~="filPilBut"]', // What: Selector String. Why: This step highlights the Type Filter pills specifically. How: GuiTouCom spotlights whatever this selector matches.
		titStr : 'Type Filter'


	},

	trfObj : { // What: Time-Range-Filter Object. Why: This is the target/content descriptor for the real Range Filter pills. How: This is spread into buiTesFun's own Range Filter step object.


		bodEle : <>This will allow you to further <b>narrow your selection by date range</b>, with ranges from 1 week to 1 year to all time.</>,
		selStr : '[data-element-name-hook~="ranPilDiv"] [data-element-name-hook~="ranPilBut"]', // What: Selector String. Why: This step highlights the Range Filter pills specifically. How: GuiTouCom spotlights whatever this selector matches.
		titStr : 'Range Filter'


	}


};

// #endregion STA_TAR_OBJ



// #region TOD_TAR_OBJ

/**
 * TOD_TAR_OBJ = Today Target Object
 *
 * @summary
 * Target and description catalog for the Today page's OWN interior
 * elements (as opposed to NAV_TAR_OBJ, which only covers the nav bar
 * buttons), same shape/reasoning as PIC_TAR_OBJ above. Kept here
 * rather than moved into onboarding/targets.jsx for now (nothing
 * outside this file reads it yet), but is exactly what a future on-
 * demand multi-highlight help mode would pull from by id, see the
 * onboarding-engine-reuse-design memory. Extract into its own module
 * alongside NAV_TAR_OBJ if/when that help mode actually gets built and
 * needs to reference these same targets.
 *
 * 2 of these fields carry the exact same boilerplate What/Why/How
 * wherever they appear, so none of the entries below repeat it on
 * their own lines (see the "Repeated-shape object literals" comment
 * exception in CLAUDE.md). `selStr` still gets its own bullet
 * explaining what the field is FOR in general, but keeps its own
 * per-entry inline comment too, since each entry's own Why genuinely
 * differs, describing that entry's own specific target:
 *
 * - `bodEle` (Element): Body Element is this step's own coach card
 *   body, a plain description of what the highlighted element does,
 *   rendered as JSX so specific phrases can be bolded.
 *
 * - `selStr` (String): Selector String is the CSS selector(s)
 *   GuiTouCom highlights for this step (comma-separated fallbacks
 *   honored in order, first match wins).
 *
 * - `titStr` (String): Title String is this step's own coach card
 *   heading, rendered by GuiTouCom as the step's own heading text.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const TOD_TAR_OBJ = { // What: Today Target Object. Why: buiTesFun below spreads each of these entries into the Today tour's own real step objects. How: This is looked up by a fixed key per step inside buiTesFun's own explore_today branch.


	emfObj : { // What: Edit-Mode-Feature Object. Why: This is the target/content descriptor for the real Edit Mode control. How: This is spread into buiTesFun's own Edit Mode step object.


		bodEle : <>The "Edit Mode" button will allow you to both <b>rearrange the positions of the groups and items, as well as rename the groups</b>. Go ahead and click the "Edit Mode" button now.</>,
		selStr : '[data-element-name-hook~="ediRaiBut"], [data-element-name-hook~="fooEdiBut"]', // What: Selector String. Why: This step highlights whichever Edit Mode control is actually visible at the current width. How: GuiTouCom spotlights the first alternative that matches.
		titStr : 'Edit Mode'


	},

	gghObj : { // What: Group-Grip-Handle Object. Why: This is the target/content descriptor for the real group drag handle. How: This is spread into buiTesFun's own Movable Icon step object.


		bodEle : <>This will <b>allow you to move an entire group section to a different position in the todo list or move item positions within a group’s section</b>. Just click or press on it, hold it and move it up or down. You can try it yourself now. Click Next when you are ready to move on.</>,
		selStr : '[data-element-name-hook~="remGroSec"] [data-element-name-hook~="groGriSpa"]', // What: Selector String. Why: This step highlights the Reminders section's own drag handle specifically. How: GuiTouCom spotlights whatever this selector matches.
		titStr : 'Movable Icon'


	},

	gnlObj : { // What: Group-Navigation-List Object. Why: This is the target/content descriptor for the real group navigation list. How: This is spread into buiTesFun's own List Navigation step object.


		bodEle : <>This is the todo list’s navigation, <b>allowing you to jump directly to a group’s section</b>. Over time your list can grow quite long and this helps to quickly move between the different sections of your todo list.</>,
		selStr : '[data-element-name-hook~="groRaiAsi"] ul', // What: Selector String. Why: This step highlights the group navigation list, excluding Edit Mode. How: GuiTouCom spotlights whatever this selector matches.
		titStr : 'List Navigation'


	},

	prfObj : { // What: Progress-Ring-Feature Object. Why: This is the target/content descriptor for the real progress ring. How: This is spread into buiTesFun's own Progress Ring step object.


		bodEle : <>This <b>tracks your current progress of completed / total tasks for today’s todo list</b>. Once filled completely, your Day Streak will increase and the celebration animations will play.</>,
		selStr : '[data-element-name-hook~="proRinDiv"]', // What: Selector String. Why: This step highlights the real progress ring. How: GuiTouCom spotlights whatever this selector matches.
		titStr : 'Progress Ring'


	},

	rgiObj : { // What: Rename-Group-Input Object. Why: This is the target/content descriptor for the real group rename input. How: This is spread into buiTesFun's own Rename Group step object.


		bodEle : <>This will <b>allow you to change a group’s name</b>. You can go ahead and try it yourself, but once you exit this tutorial the changes will be reverted. This concludes the Today page tutorial, click Done when you are ready.</>,
		selStr : '[data-element-name-hook~="pagTouSec"] [data-element-name-hook~="groNamInp"]', // What: Selector String. Why: This step highlights the Page Tours group's own rename input. How: GuiTouCom spotlights whatever this selector matches.
		titStr : 'Rename Group'


	}


};

// #endregion TOD_TAR_OBJ

// #endregion Constants



// #region Module State

/**
 * pgtNamStr = Page-Tours Name String
 *
 * @summary
 * The Page Tours group's real name at the moment the rgiObj step (see
 * TOD_TAR_OBJ above) opens its rename input, captured off the rename button's
 * own aria-label ("Rename group {name}") before it disappears behind the
 * input. Lets a Back to the gghObj step reset the input to a genuine no-op
 * edit (draft === name) rather than an actual rename, without this module
 * otherwise needing to know the live app state (PagTouCom itself is only ever
 * passed `actStoObj`, not `staAppObj`, for this purpose).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

let pgtNamStr = 'Page Tours'; // What: Page-Tours Name String. Why: canRenFun/forNamFun below need this group's own real, pre-rename name to revert to. How: This starts as the group's own default name, then is overwritten by the rgiObj step's own runFun (see buiTesFun below) the instant it opens the rename input.

// #endregion Module State



// #region Helpers

// #region canRenFun

/**
 * canRenFun = Cancel Rename Function
 *
 * @summary
 * Discards a typed rename WITHOUT exiting Edit Mode, used only for a Back to
 * the gghObj step, which needs Edit Mode to stay on (the rgiObj step's own
 * Done doesn't need this at all, see forNamFun below for why). Resets the
 * input's value back to its real name first so the blur that follows reads as
 * a NO-OP commit (see tab-today.jsx's GroHeaCom: comEdiFun only calls
 * onRenGroFun when the draft differs from the name prop) instead of an actual
 * rename. Deliberately NOT Escape: GroHeaCom's own Escape handling is exactly
 * this (see its canEdiFun), but a real Escape keydown also bubbles to
 * tab-today.jsx's OWN global window listener, which exits Edit Mode entirely.
 *
 * The blur is deferred a frame, NOT a cosmetic choice. Dispatching the reset
 * 'input' event calls React's onChange (setDraNamStr) synchronously, but that
 * only SCHEDULES the re-render, draft's actual value inside the
 * ALREADY-DEFINED comEdiFun closure doesn't update until React re-renders.
 * Calling blur() in the same tick invokes that same (stale) comEdiFun, reading
 * the pre-reset, still-typed draft, and genuinely renames the group for real.
 * This is not hypothetical: it's exactly how an earlier version of this
 * function (calling blur() synchronously right after dispatch) shipped and
 * broke, Done appeared to discard the rename but actually committed it, then a
 * later run of this same tour could never find "Rename group Page Tours" again
 * since the group's real name no longer matched.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * canRenFun() // => void
 * ```
 *
*/

const canRenFun = () => { // What: Cancel Rename Function. Why: A Back out of the rgiObj step must discard whatever was typed without exiting Edit Mode. How: This resets the real input's value to pgtNamStr, then blurs it a frame later so the blur's own commit reads as a no-op.


	const renInpEle = document.querySelector( '[data-element-name-hook~="pagTouSec"] [data-element-name-hook~="groNamInp"]' ); // What: Rename Input Element. Why: This must only act on the real, currently-open rename input. How: This looks it up fresh, since it may not exist outside Edit Mode.


	if ( !renInpEle ) return; // What: Missing Input Guard. Why: A Back that lands here with the input already gone (never opened, or already closed) has nothing to reset. How: This returns early whenever renInpEle was not found.



	renInpEle.value = pgtNamStr; // What: Input Value Reset. Why: The dispatched 'input' event below must carry the real name, not whatever the user typed. How: This overwrites renInpEle's own value with pgtNamStr.

	renInpEle.dispatchEvent( new Event( 'input', { bubbles : true } ) ); // What: Input Event Dispatch. Why: React's own onChange (setDraNamStr) must see this reset value to update its own draft state. How: This dispatches a bubbling native 'input' event off renInpEle.

	requestAnimationFrame( () => renInpEle.blur() ); // What: Deferred Blur Call. Why: Blurring in the same tick would read the ALREADY-DEFINED comEdiFun closure's own stale, pre-reset draft and genuinely rename the group. How: This defers the blur a frame, after React's own re-render has updated draft to the reset value.


};

// #endregion canRenFun



// #region forNamFun

/**
 * forNamFun = Force Name Function
 *
 * @summary
 * Forces the real Page Tours name back, used wherever a click (Done, Back,
 * Skip) might have blurred a still-open, typed-in rename input a tick earlier,
 * see each call site's own comment for that race. Deferred a full 200ms, NOT
 * just a frame: GroHeaCom's own blur-triggered comEdiFun doesn't call
 * onRenGroFun synchronously either, it defers to its OWN setTimeout(…, 150)
 * (the closing-animation delay in finCloFun), so calling this immediately
 * would fire BEFORE that delayed commit and get overwritten right back to the
 * typed value 150ms later. 200ms leaves a safety margin past it.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param actStoObj - Action Store Object: The shared app actions object.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * forNamFun( actStoObj ) // => void
 * ```
 *
*/

const forNamFun = ( actStoObj ) => { // What: Force Name Function. Why: A click racing an open rename input's own delayed commit must still end with the group's own real name intact. How: This calls actStoObj.renTouFun with pgtNamStr, one p01 duration step after this fires.


	setTimeout( () => actStoObj.renTouFun( pgtNamStr ), durMilFun( 'p01' ) ); // What: Deferred Rename Call. Why: This must fire safely after GroHeaCom's own base-step closing-animation commit, not before it. How: This waits the next step up, p01, then renames the group back to pgtNamStr. // Duration Base Plus 1 ~= 209.1ms


};

// #endregion forNamFun



// #region buiTesFun

/**
 * buiTesFun = Build Tour-Extra-Steps Function
 *
 * @summary
 * Steps beyond Step 1 (the nav-highlight every page tour shares, see buiTs1Fun
 * below), keyed by page tour id, empty for any other page id. Advancing past
 * the last step here falls through GuiTouCom's own "ran off the end" safety
 * net into onSkiTouFun, same as every other mini-tour behaved before its own
 * final Done step existed. A function of `actStoObj` (built fresh per render,
 * like buiTs1Fun), not a static object, the Today branch's own last step needs
 * to call actStoObj.renTouFun directly (see forNamFun above).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param pagIdeStr - Page Identifier String: This page tour's own checklist
 *                    id, e.g. 'explore_today'.
 * @param actStoObj - Action Store Object: The shared app actions object,
 *                    called directly by the Today tour's own last step.
 *
 * @returns This page tour's own steps beyond Step 1, as GuiTouCom step
 * objects, or an empty array for any other page id.
 *
 * @example
 * ```ts
 * buiTesFun( 'explore_today', actStoObj ) // => [ step, ... ]
 * ```
 *
*/

const buiTesFun = ( pagIdeStr, actStoObj ) => { // What: Build Tour-Extra-Steps Function. Why: PagTouCom below needs this page's own full ordered step array beyond Step 1. How: This branches on pagIdeStr, spreading the matching target catalog's entries with this flow's own navigation flags.


	if ( pagIdeStr === 'explore_pickers' ) { // What: Pickers Branch Check. Why: The Pickers tour's own steps only apply to this one page tour. How: This returns its own step array whenever pagIdeStr matches.


		return [ // What: Pickers Tour Steps Return. Why: The caller needs this page tour's own full ordered step array beyond Step 1. How: This returns the Pickers tour's own remaining steps, each spreading PIC_TAR_OBJ's matching entry with this flow's own navigation flags.


			{ // What: Group Filter Step. Why: This is the Pickers tour's own 2nd step. How: This spreads PIC_TAR_OBJ.pgfObj with this flow's own navigation flags.


				...PIC_TAR_OBJ.pgfObj, // What: Group Filter Target Spread. Why: This step reuses the Pickers catalog's own pgfObj entry as its base selector/copy. How: This spreads PIC_TAR_OBJ.pgfObj before this step's own navigation flags.

				bacBoo : true,    // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
				priStr : 'Next',  // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				tabStr : 'picker' // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


			},

			{ // What: Type Filter Step. Why: This is the Pickers tour's own 3rd step. How: This spreads PIC_TAR_OBJ.ptfObj with this flow's own navigation flags.


				...PIC_TAR_OBJ.ptfObj, // What: Type Filter Target Spread. Why: This step reuses the Pickers catalog's own ptfObj entry as its base selector/copy. How: This spreads PIC_TAR_OBJ.ptfObj before this step's own navigation flags.

				bacBoo : true,    // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
				priStr : 'Next',  // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				tabStr : 'picker' // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


			},

			{ // What: Create New Pickers Step. Why: This is the Pickers tour's own 4th step. How: This spreads PIC_TAR_OBJ.cnpObj with this flow's own navigation flags.


				...PIC_TAR_OBJ.cnpObj, // What: Create New Pickers Target Spread. Why: This step reuses the Pickers catalog's own cnpObj entry as its base selector/copy. How: This spreads PIC_TAR_OBJ.cnpObj before this step's own navigation flags.

				bacBoo : true,    // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
				priStr : 'Next',  // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				tabStr : 'picker' // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


			},

			{ // What: Picker Selection Step. Why: This is the Pickers tour's own 5th step. How: This spreads PIC_TAR_OBJ.spsObj with this flow's own navigation flags.


				...PIC_TAR_OBJ.spsObj, // What: Picker Selection Target Spread. Why: This step reuses the Pickers catalog's own spsObj entry as its base selector/copy. How: This spreads PIC_TAR_OBJ.spsObj before this step's own navigation flags.

				bacBoo : true,    // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
				priStr : 'Next',  // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				tabStr : 'picker' // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


			},

			{ // What: Edit Picker Step. Why: This is the Pickers tour's own 6th step. How: This spreads PIC_TAR_OBJ.epsObj with this flow's own navigation flags.


				...PIC_TAR_OBJ.epsObj, // What: Edit Picker Target Spread. Why: This step reuses the Pickers catalog's own epsObj entry as its base selector/copy. How: This spreads PIC_TAR_OBJ.epsObj before this step's own navigation flags.

				bacBoo : true,    // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
				priStr : 'Next',  // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				tabStr : 'picker' // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


			},

			{ // What: Manual Generation Step. Why: This is the Pickers tour's own 7th step, the real Pick One button. How: This spreads PIC_TAR_OBJ.mpgObj with this flow's own navigation flags plus catBoo/advSelStr.


				...PIC_TAR_OBJ.mpgObj, // What: Manual Generation Target Spread. Why: This step reuses the Pickers catalog's own mpgObj entry as its base selector/copy. How: This spreads PIC_TAR_OBJ.mpgObj before this step's own navigation flags.

				advSelStr : PIC_TAR_OBJ.atlObj.cliSelStr, // What: Advance Selector String. Why: This step must hold until the pick actually resolves, not until the next step's own target merely exists. How: GuiTouCom polls for this selector before advancing past this step. Pick One kicks off the multi-second spin animation, its result (the atlObj step's own target) isn't ready the instant the click fires. Stay on THIS step's own already-resolved coach/highlight for the whole wait instead of advancing into a blank "not found yet" dim. Polls for picSenBut specifically (atlObj's own cliSelStr, NOT its sel), since picRunDiv itself (that step's own sel) already exists the whole time, spin animation included, so polling for that would advance immediately instead of waiting for the pick to actually resolve.
				bacBoo    : true,                                // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
				catBoo    : true,                                // What: Coach-At-Top Boolean. Why: picRunDiv can run taller than a short viewport even before this step's own click. How: GuiTouCom skips its own reserve-space math and pins the coach card to the top instead. picRunDiv (stage + actions) can run taller than a short viewport on its own, before Re-roll/Done even render alongside it, same "pin the coach to the top and let the target run off the bottom" reasoning as the Data tour's own tall .datLisDiv step below. Confirmed live: without this, the coach overlapped the real Pick One button on an iPhone SE-sized viewport.
				cirBoo    : true,                                // What: Click-Is-Required Boolean. Why: The click itself is the thing being taught, not just a gate. How: GuiTouCom disables Next and only advances once the real target is clicked.
				priStr    : 'Next',                              // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				tabStr    : 'picker'                             // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


			},

			{ // What: Add To Todo List Step. Why: This is the Pickers tour's own 8th step, the real Send to Today button. How: This spreads PIC_TAR_OBJ.atlObj with this flow's own navigation flags plus catBoo/advDelNum.


				...PIC_TAR_OBJ.atlObj, // What: Add To Todo List Target Spread. Why: This step reuses the Pickers catalog's own atlObj entry as its base selector/copy. How: This spreads PIC_TAR_OBJ.atlObj before this step's own navigation flags.

				advDelNum : 1600,    // What: Advance Delay Number. Why: The "Sent!" confirmation must be visible before this step advances. How: GuiTouCom waits this many milliseconds after the click before advancing. Send to Today swaps its own label to "Sent!" for 1500ms (see sendToToday's own setTimeout in tab-picker.jsx) before reverting, advancing immediately would cut that confirmation off before the user ever sees it. 100ms past that own timer as a safety margin.
				bacBoo    : true,    // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
				catBoo    : true,    // What: Coach-At-Top Boolean. Why: picRunDiv is taller still on this step, Re-roll/Done now render alongside the stage. How: GuiTouCom skips its own reserve-space math and pins the coach card to the top instead. Same short-viewport reasoning as mpgObj just above, picRunDiv is taller still here (Re-roll/Done now render alongside the stage too).
				cirBoo    : true,    // What: Click-Is-Required Boolean. Why: The click itself is the thing being taught, not just a gate. How: GuiTouCom disables Next and only advances once the real target is clicked.
				priStr    : 'Next',  // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				tabStr    : 'picker' // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


			},

			{ // What: Picker Items Step. Why: This is the Pickers tour's own 9th step. How: This spreads PIC_TAR_OBJ.pivObj with this flow's own navigation flags plus catBoo.


				...PIC_TAR_OBJ.pivObj, // What: Picker Items Target Spread. Why: This step reuses the Pickers catalog's own pivObj entry as its base selector/copy. How: This spreads PIC_TAR_OBJ.pivObj before this step's own navigation flags.

				bacBoo : true,    // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
				catBoo : true,    // What: Coach-At-Top Boolean. Why: pooIteDiv grows with the picker's own item count and can run well past a short viewport. How: GuiTouCom skips its own reserve-space math and pins the coach card to the top instead. pooIteDiv grows with the picker's own item count and can run WAY past a short viewport's height, same reasoning as mpgObj above.
				priStr : 'Next',  // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				tabStr : 'picker' // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


			},

			{ // What: Add Picker Item Step. Why: This is the Pickers tour's own final step. How: This spreads PIC_TAR_OBJ.piaObj with this flow's own navigation flags, priStr 'Done' ending the tour.


				...PIC_TAR_OBJ.piaObj, // What: Add Picker Item Target Spread. Why: This step reuses the Pickers catalog's own piaObj entry as its base selector/copy. How: This spreads PIC_TAR_OBJ.piaObj before this step's own navigation flags.

				bacBoo : true,    // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
				priStr : 'Done',  // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				tabStr : 'picker' // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


			}


		];


	}



	if ( pagIdeStr === 'explore_stats' ) { // What: Stats Branch Check. Why: The Stats tour's own steps only apply to this one page tour. How: This returns its own step array whenever pagIdeStr matches.


		return [ // What: Stats Tour Steps Return. Why: The caller needs this page tour's own full ordered step array beyond Step 1. How: This returns the Stats tour's own remaining steps, each spreading STA_TAR_OBJ's matching entry with this flow's own navigation flags.


			{ // What: Group Filter Step. Why: This is the Stats tour's own 2nd step. How: This spreads STA_TAR_OBJ.pgfObj with this flow's own navigation flags.


				...STA_TAR_OBJ.pgfObj, // What: Group Filter Target Spread. Why: This step reuses the Stats catalog's own pgfObj entry as its base selector/copy. How: This spreads STA_TAR_OBJ.pgfObj before this step's own navigation flags.

				bacBoo : true,   // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
				priStr : 'Next', // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				tabStr : 'stats' // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


			},

			{ // What: Type Filter Step. Why: This is the Stats tour's own 3rd step. How: This spreads STA_TAR_OBJ.ptfObj with this flow's own navigation flags.


				...STA_TAR_OBJ.ptfObj, // What: Type Filter Target Spread. Why: This step reuses the Stats catalog's own ptfObj entry as its base selector/copy. How: This spreads STA_TAR_OBJ.ptfObj before this step's own navigation flags.

				bacBoo : true,   // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
				priStr : 'Next', // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				tabStr : 'stats' // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


			},

			{ // What: Show Filter Step. Why: This is the Stats tour's own 4th step. How: This spreads STA_TAR_OBJ.pfsObj with this flow's own navigation flags.


				...STA_TAR_OBJ.pfsObj, // What: Show Filter Target Spread. Why: This step reuses the Stats catalog's own pfsObj entry as its base selector/copy. How: This spreads STA_TAR_OBJ.pfsObj before this step's own navigation flags.

				bacBoo : true,   // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
				priStr : 'Next', // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				tabStr : 'stats' // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


			},

			{ // What: Range Filter Step. Why: This is the Stats tour's own 5th step. How: This spreads STA_TAR_OBJ.trfObj with this flow's own navigation flags.


				...STA_TAR_OBJ.trfObj, // What: Range Filter Target Spread. Why: This step reuses the Stats catalog's own trfObj entry as its base selector/copy. How: This spreads STA_TAR_OBJ.trfObj before this step's own navigation flags.

				bacBoo : true,   // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
				priStr : 'Next', // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				tabStr : 'stats' // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


			},

			{ // What: Heatmap Step. Why: This is the Stats tour's own 6th step, staging the next step's own single-picker scope. How: This spreads STA_TAR_OBJ.hemObj with this flow's own navigation flags plus catBoo/run.


				...STA_TAR_OBJ.hemObj, // What: Heatmap Target Spread. Why: This step reuses the Stats catalog's own hemObj entry as its base selector/copy. How: This spreads STA_TAR_OBJ.hemObj before this step's own navigation flags.

				bacBoo : true,   // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
				catBoo : true,   // What: Coach-At-Top Boolean. Why: .stat-heatmap-card renders a full year's worth of cells and can run far past a short viewport. How: GuiTouCom skips its own reserve-space math and pins the coach card to the top instead. .stat-heatmap-card renders a full year's worth of cells and can run FAR past a short viewport's height, same "pin the coach to the top and let the target run off the bottom" reasoning as the Data tour's own tall .datLisDiv step and this tour's own pbvObj step below. Confirmed live: without this, the coach overlapped the top of the heatmap on an iPhone SE-sized viewport.
				priStr : 'Next', // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.

				runFun : () => { // What: Run Function. Why: The pbvObj step's own target only renders once a specific picker is the active scope, so this selects the real sample picker (unhidden for this whole tour, see unhHisFun) before that step ever mounts. How: This clicks the real scope tab matching PRE_PIC_STR.


					const picTabEle = document.querySelector( `[data-element-name-hook~="scoTabDiv"] [data-element-name-hook~="scoTabBut"][data-picker-id="${ PRE_PIC_STR }"]` ); // What: Picker Tab Element. Why: This must click the exact tab for the real, preselected sample picker. How: This looks it up fresh via its own data-picker-id attribute.


					if ( picTabEle ) picTabEle.click(); // What: Picker Tab Click. Why: This must only fire when the control actually exists. How: This clicks picTabEle.


				},

				tabStr : 'stats' // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


			},

			{ // What: Picker Breakdown Step. Why: This is the Stats tour's own final step. How: This spreads STA_TAR_OBJ.pbvObj with this flow's own navigation flags plus catBoo, priStr 'Done' ending the tour.


				...STA_TAR_OBJ.pbvObj, // What: Picker Breakdown Target Spread. Why: This step reuses the Stats catalog's own pbvObj entry as its base selector/copy. How: This spreads STA_TAR_OBJ.pbvObj before this step's own navigation flags.

				bacBoo : true,   // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
				catBoo : true,   // What: Coach-At-Top Boolean. Why: .stat-breakdown-card lists every item in the picker's pool and can run past a short viewport. How: GuiTouCom skips its own reserve-space math and pins the coach card to the top instead. .stat-breakdown-card lists every item in the picker's pool and can run well past a short viewport's height, same as the hemObj step just above. Confirmed live: without this, the coach clipped the top of its own body text and overlapped the card on an iPhone SE-sized viewport.
				priStr : 'Done', // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				resBoo : false,  // What: Resumable Boolean. Why: This step's own target only exists because the hemObj step's own runFun already selected a scope, which a reload does not survive. How: GuiTouCom's own resume-persist effect never checkpoints a step whose resBoo is false. `scope` (tab-stats.jsx's own local useState, choosing which picker is active) is NOT persisted, a reload always lands back at 'all', so this step's own target wouldn't exist to resume into even though the real sample picker itself stays unhidden (a real, persisted field) across the reload. A reload mid this step falls back to the hemObj step, which is always safe to land on and re-runs the selection on its own next Next click.
				tabStr : 'stats' // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


			}


		];


	}



	if ( pagIdeStr === 'explore_data' ) { // What: Data Branch Check. Why: The Data tour's own steps only apply to this one page tour. How: This returns its own step array whenever pagIdeStr matches.


		return [ // What: Data Tour Steps Return. Why: The caller needs this page tour's own full ordered step array beyond Step 1. How: This returns the Data tour's own remaining steps, each spreading DAT_TAR_OBJ's matching entry with this flow's own navigation flags.


			{ // What: Group Filter Step. Why: This is the Data tour's own 2nd step. How: This spreads DAT_TAR_OBJ.pgfObj with this flow's own navigation flags.


				...DAT_TAR_OBJ.pgfObj, // What: Group Filter Target Spread. Why: This step reuses the Data catalog's own pgfObj entry as its base selector/copy. How: This spreads DAT_TAR_OBJ.pgfObj before this step's own navigation flags.

				bacBoo : true,   // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
				priStr : 'Next', // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				tabStr : 'data'  // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


			},

			{ // What: Type Filter Step. Why: This is the Data tour's own 3rd step. How: This spreads DAT_TAR_OBJ.ptfObj with this flow's own navigation flags.


				...DAT_TAR_OBJ.ptfObj, // What: Type Filter Target Spread. Why: This step reuses the Data catalog's own ptfObj entry as its base selector/copy. How: This spreads DAT_TAR_OBJ.ptfObj before this step's own navigation flags.

				bacBoo : true,   // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
				priStr : 'Next', // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				tabStr : 'data'  // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


			},

			{ // What: Show Filter Step. Why: This is the Data tour's own 4th step. How: This spreads DAT_TAR_OBJ.pfsObj with this flow's own navigation flags.


				...DAT_TAR_OBJ.pfsObj, // What: Show Filter Target Spread. Why: This step reuses the Data catalog's own pfsObj entry as its base selector/copy. How: This spreads DAT_TAR_OBJ.pfsObj before this step's own navigation flags.

				bacBoo : true,   // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
				priStr : 'Next', // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				tabStr : 'data'  // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


			},

			{ // What: Reminders Manager Step. Why: This is the Data tour's own 5th step. How: This spreads DAT_TAR_OBJ.rmsObj with this flow's own navigation flags.


				...DAT_TAR_OBJ.rmsObj, // What: Reminders Manager Target Spread. Why: This step reuses the Data catalog's own rmsObj entry as its base selector/copy. How: This spreads DAT_TAR_OBJ.rmsObj before this step's own navigation flags.

				bacBoo : true,   // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
				priStr : 'Next', // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				tabStr : 'data'  // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


			},

			{ // What: Pickers Manager Step. Why: This is the Data tour's own 6th step. How: This spreads DAT_TAR_OBJ.pmsObj with this flow's own navigation flags plus catBoo.


				...DAT_TAR_OBJ.pmsObj, // What: Pickers Manager Target Spread. Why: This step reuses the Data catalog's own pmsObj entry as its base selector/copy. How: This spreads DAT_TAR_OBJ.pmsObj before this step's own navigation flags.

				bacBoo : true,   // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
				catBoo : true,   // What: Coach-At-Top Boolean. Why: The unioned picker/Conditionals/Reminders card rect can run far taller than the viewport once every copy renders. How: GuiTouCom skips its own reserve-space math and pins the coach card to the top instead. .datLisDiv > .datCatSec can still union to a rect much taller than the viewport once every picker card renders (6 real disposable copies plus whatever the user has of their own), the normal reserve-space padding would push the target's own bottom edge further past the fold instead of helping, exactly backwards.
				priStr : 'Next', // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				tabStr : 'data'  // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


			},

			{ // What: Create Picker Step. Why: This is the Data tour's own final step. How: This spreads DAT_TAR_OBJ.cpfObj with this flow's own navigation flags, priStr 'Done' ending the tour.


				...DAT_TAR_OBJ.cpfObj, // What: Create Picker Target Spread. Why: This step reuses the Data catalog's own cpfObj entry as its base selector/copy. How: This spreads DAT_TAR_OBJ.cpfObj before this step's own navigation flags.

				bacBoo : true,   // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
				priStr : 'Done', // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				tabStr : 'data'  // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


			}


		];


	}



	if ( pagIdeStr === 'explore_settings' ) { // What: Settings Branch Check. Why: The Settings tour's own steps only apply to this one page tour. How: This returns its own step array whenever pagIdeStr matches, catBoo on every section but Legal (short enough to fit normally), each of these can be taller than the viewport, same "pin the coach to the top instead of padding the target past the fold" reasoning as the Data tour's own tall .datLisDiv step above.


		return [ // What: Settings Tour Steps Return. Why: The caller needs this page tour's own full ordered step array beyond Step 1. How: This returns the Settings tour's own remaining steps, each spreading SET_TAR_OBJ's matching entry with this flow's own navigation flags.


			{ // What: Appearance Step. Why: This is the Settings tour's own 2nd step. How: This spreads SET_TAR_OBJ.appObj with this flow's own navigation flags plus catBoo.


				...SET_TAR_OBJ.appObj, // What: Appearance Target Spread. Why: This step reuses the Settings catalog's own appObj entry as its base selector/copy. How: This spreads SET_TAR_OBJ.appObj before this step's own navigation flags.

				bacBoo : true,      // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
				catBoo : true,      // What: Coach-At-Top Boolean. Why: This section can run taller than the viewport before the target's own bottom edge would otherwise show. How: GuiTouCom skips its own reserve-space math and pins the coach card to the top instead.
				priStr : 'Next',    // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				tabStr : 'settings' // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


			},

			{ // What: Daily Generator Step. Why: This is the Settings tour's own 3rd step. How: This spreads SET_TAR_OBJ.daiObj with this flow's own navigation flags plus catBoo.


				...SET_TAR_OBJ.daiObj, // What: Daily Generator Target Spread. Why: This step reuses the Settings catalog's own daiObj entry as its base selector/copy. How: This spreads SET_TAR_OBJ.daiObj before this step's own navigation flags.

				bacBoo : true,      // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
				catBoo : true,      // What: Coach-At-Top Boolean. Why: This section can run taller than the viewport before the target's own bottom edge would otherwise show. How: GuiTouCom skips its own reserve-space math and pins the coach card to the top instead.
				priStr : 'Next',    // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				tabStr : 'settings' // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


			},

			{ // What: Holiday Controls Step. Why: This is the Settings tour's own 4th step. How: This spreads SET_TAR_OBJ.holObj with this flow's own navigation flags plus catBoo.


				...SET_TAR_OBJ.holObj, // What: Holiday Controls Target Spread. Why: This step reuses the Settings catalog's own holObj entry as its base selector/copy. How: This spreads SET_TAR_OBJ.holObj before this step's own navigation flags.

				bacBoo : true,      // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
				catBoo : true,      // What: Coach-At-Top Boolean. Why: This section can run taller than the viewport before the target's own bottom edge would otherwise show. How: GuiTouCom skips its own reserve-space math and pins the coach card to the top instead.
				priStr : 'Next',    // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				tabStr : 'settings' // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


			},

			{ // What: Data Control Step. Why: This is the Settings tour's own 5th step. How: This spreads SET_TAR_OBJ.dtaObj with this flow's own navigation flags plus catBoo.


				...SET_TAR_OBJ.dtaObj, // What: Data Control Target Spread. Why: This step reuses the Settings catalog's own dtaObj entry as its base selector/copy. How: This spreads SET_TAR_OBJ.dtaObj before this step's own navigation flags.

				bacBoo : true,      // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
				catBoo : true,      // What: Coach-At-Top Boolean. Why: This section can run taller than the viewport before the target's own bottom edge would otherwise show. How: GuiTouCom skips its own reserve-space math and pins the coach card to the top instead.
				priStr : 'Next',    // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				tabStr : 'settings' // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


			},

			{ // What: About Step. Why: This is the Settings tour's own 6th step. How: This spreads SET_TAR_OBJ.aboObj with this flow's own navigation flags plus catBoo.


				...SET_TAR_OBJ.aboObj, // What: About Target Spread. Why: This step reuses the Settings catalog's own aboObj entry as its base selector/copy. How: This spreads SET_TAR_OBJ.aboObj before this step's own navigation flags.

				bacBoo : true,      // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
				catBoo : true,      // What: Coach-At-Top Boolean. Why: This section can run taller than the viewport before the target's own bottom edge would otherwise show. How: GuiTouCom skips its own reserve-space math and pins the coach card to the top instead.
				priStr : 'Next',    // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				tabStr : 'settings' // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


			},

			{ // What: Legal Step. Why: This is the Settings tour's own final step, short enough to need no catBoo. How: This spreads SET_TAR_OBJ.legObj with this flow's own navigation flags, priStr 'Done' ending the tour.


				...SET_TAR_OBJ.legObj, // What: Legal Target Spread. Why: This step reuses the Settings catalog's own legObj entry as its base selector/copy. How: This spreads SET_TAR_OBJ.legObj before this step's own navigation flags.

				bacBoo : true,      // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
				priStr : 'Done',    // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
				tabStr : 'settings' // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


			}


		];


	}



	if ( pagIdeStr !== 'explore_today' ) return []; // What: Today Fallback Guard. Why: Any page tour not yet handled above (or not this one) has no steps beyond Step 1. How: This returns an empty array whenever pagIdeStr isn't 'explore_today'.



	return [ // What: Today Tour Steps Return. Why: The caller needs this page tour's own full ordered step array beyond Step 1. How: This returns the Today tour's own remaining steps, each spreading TOD_TAR_OBJ's matching entry with this flow's own navigation flags.


		{ // What: Progress Ring Step. Why: This is the Today tour's own 2nd step. How: This spreads TOD_TAR_OBJ.prfObj with this flow's own navigation flags.


			...TOD_TAR_OBJ.prfObj, // What: Progress Ring Target Spread. Why: This step reuses the Today catalog's own prfObj entry as its base selector/copy. How: This spreads TOD_TAR_OBJ.prfObj before this step's own navigation flags.

			bacBoo : true,   // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
			priStr : 'Next', // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
			tabStr : 'today' // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


		},

		{ // What: Groups Nav Step. Why: This is the Today tour's own 3rd step. How: This spreads TOD_TAR_OBJ.gnlObj with this flow's own navigation flags.


			...TOD_TAR_OBJ.gnlObj, // What: Groups Nav Target Spread. Why: This step reuses the Today catalog's own gnlObj entry as its base selector/copy. How: This spreads TOD_TAR_OBJ.gnlObj before this step's own navigation flags.

			bacBoo : true,   // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
			priStr : 'Next', // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
			tabStr : 'today' // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


		},

		{ // What: Edit Mode Step. Why: This is the Today tour's own 4th step, the real Edit Mode toggle. How: This spreads TOD_TAR_OBJ.emfObj with this flow's own navigation flags plus cirBoo.


			...TOD_TAR_OBJ.emfObj, // What: Edit Mode Target Spread. Why: This step reuses the Today catalog's own emfObj entry as its base selector/copy. How: This spreads TOD_TAR_OBJ.emfObj before this step's own navigation flags.

			bacBoo : true,   // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
			cirBoo : true,   // What: Click-Is-Required Boolean. Why: The click itself is the thing being taught, not just a gate. How: GuiTouCom disables Next and only advances once the real target is clicked.
			priStr : 'Next', // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
			tabStr : 'today' // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.


		},

		{ // What: Group Grip Step. Why: This is the Today tour's own 5th step, staging the next step's own rename input. How: This spreads TOD_TAR_OBJ.gghObj with this flow's own navigation flags plus resBoo/runFun.


			...TOD_TAR_OBJ.gghObj, // What: Group Grip Target Spread. Why: This step reuses the Today catalog's own gghObj entry as its base selector/copy. How: This spreads TOD_TAR_OBJ.gghObj before this step's own navigation flags.

			bacBoo : true,    // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
			priStr : 'Next',  // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
			resBoo : false,   // What: Resumable Boolean. Why: This step's own target only exists while Edit Mode is on, which a reload does not survive. How: GuiTouCom's own resume-persist effect never checkpoints a step whose resBoo is false. Edit Mode is local, unpersisted UI state (tab-today.jsx's own useState, not part of `staAppObj`), a reload always lands back with it off, so this step's own target (only rendered while Edit Mode is on) wouldn't exist to resume into.
			tabStr : 'today', // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.

			runFun : () => { // What: Run Function. Why: The rgiObj step's own target (the Page Tours group's rename input) needs staging by a real click before that step ever mounts, same real-UI-driving pattern used throughout the Picker/Reminder tours. How: This clicks the Page Tours group's own rename button, captures its real name first, then focuses the resulting input a frame later.


				const renButEle = document.querySelector( '[data-element-name-hook~="pagTouSec"] [data-element-name-hook~="groNamBut"]' ); // What: Rename Button Element. Why: This is the real control that opens the rename input this step highlights. How: This looks it up fresh, since it only exists while Edit Mode is on. // Found via the pagTouSec hook (see tab-today.jsx), not by matching the aria-label's current name text, a user who's already renamed Page Tours themselves, entirely outside any tour, would otherwise make this selector (and the whole rest of the step) silently never match again.


				if ( renButEle ) { // What: Rename Button Existence Check. Why: This must only act on a real, currently-rendered button. How: This branches on whether renButEle was found.


					pgtNamStr = ( renButEle.getAttribute( 'aria-label' ) || '' ).replace( /^Rename group /, '' ) || 'Page Tours'; // What: Page-Tours Name Capture. Why: canRenFun/forNamFun both need this group's own real name to revert to later. How: This strips the "Rename group " prefix off the button's own aria-label, falling back to the default name.


					renButEle.click(); // What: Rename Button Click. Why: This is the real click that opens the rename input, mirroring what a user clicking the button themselves would do. How: This clicks renButEle.


				}



				requestAnimationFrame( () => { // What: Deferred Focus Call. Why: The click's own re-render must have actually mounted the input before this can focus it. How: This runs a frame after the click above, well after React's own commit.


					const renInpEle = document.querySelector( '[data-element-name-hook~="pagTouSec"] [data-element-name-hook~="groNamInp"]' ); // What: Rename Input Element. Why: This is the real input this step highlights and needs focused. How: This looks it up fresh, since it only exists once the rename button above has been clicked.


					if ( renInpEle ) renInpEle.focus( { preventScroll : true } ); // What: Rename Input Focus. Why: Explicit focus alongside the input's own autoFocus is belt-and-suspenders, since the click driving it here is synthetic, not a direct user click on the rename button itself. How: This focuses renInpEle without scrolling the page.


				} );


			}


		},

		{ // What: Rename Group Step. Why: This is the Today tour's own final step. How: This spreads TOD_TAR_OBJ.rgiObj with this flow's own navigation flags plus resBoo/runFun, priStr 'Done' ending the tour.


			...TOD_TAR_OBJ.rgiObj, // What: Rename Group Target Spread. Why: This step reuses the Today catalog's own rgiObj entry as its base selector/copy. How: This spreads TOD_TAR_OBJ.rgiObj before this step's own navigation flags.

			bacBoo : true,    // What: Back Boolean. Why: The user should always be able to return to the previous step. How: GuiTouCom shows its own Back button whenever this is true.
			priStr : 'Done',  // What: Primary String. Why: This step's own coach card needs a label for its main action button. How: GuiTouCom renders this as the button's own visible text.
			resBoo : false,   // What: Resumable Boolean. Why: This step's own target depends on Edit Mode being on and the previous step's own click, neither of which survives a reload. How: GuiTouCom's own resume-persist effect never checkpoints a step whose resBoo is false. Same as the gghObj step's own resBoo:false, this step's target depends on BOTH Edit Mode being on AND that step's own runFun having already clicked the rename button open, neither of which survives a reload.
			tabStr : 'today', // What: Tab String. Why: GuiTouCom needs to know which app tab this step's own target lives on. How: This is read by GuiTouCom's own tab-sync effect.

			runFun : () => { // What: Run Function. Why: Edit Mode's own real Cancel control alone isn't enough to discard an in-progress rename, since clicking this step's own Done button can itself race-commit a real rename first. How: This clicks the real Cancel control, then forces the real Page Tours name back afterward regardless of what the DOM did.


				const canButEle = document.querySelector( '[data-element-name-hook~="ediBanSpa"] [data-element-name-hook~="ediCanBut"]' ); // What: Cancel Button Element. Why: This is the real control that discards any group reordering and closes the rename input. How: This looks it up fresh, since it only exists while Edit Mode is on. // Edit Mode's own real Cancel control discards any group reordering AND closes the rename input, GroupHeader force-closes `editing` the instant editMode itself goes false. That's still not enough on its own, though: clicking this step's own Done button (a totally different element) blurs the currently-focused rename input FIRST, as an intrinsic part of the click's own focus-change handling, which happens before React's onClick (and therefore this runFun) ever fires, and that blur's own commit() genuinely renames the group for real if the user typed something. There's no way to intercept that ordering from here, so this doesn't try to, it just forces the real name back afterward directly, via the same action a real rename commit would have called. A harmless no-op if nothing was ever typed.


				if ( canButEle ) canButEle.click(); // What: Cancel Button Click. Why: This must only fire when the control actually exists. How: This clicks canButEle.



				forNamFun( actStoObj ); // What: Force Name Call. Why: The click above (and Done's own blur race) might still leave the group's real name overwritten. How: This forces the real pgtNamStr back, 200ms after this fires.


			}


		}


	];


};

// #endregion buiTesFun



// #region buiTs1Fun

/**
 * buiTs1Fun = Build Tour-Step-1 Function
 *
 * @summary
 * Step 1 for every page tour: highlight that page's own navbar button, reusing
 * the Welcome Tour's own copy for it verbatim (navTarObj already carries a
 * selStr/titStr/bodEle written to stand alone). Unlike this file's own
 * per-page catalogs (which deliberately write THEIR own copy instructing the
 * click), this one is asked to match the Welcome Tour's wording exactly,
 * cirBoo's own hover hint is what tells the user to click.
 *
 * tabStr: This property in the returned object uses 'today' in order to keep
 * this from auto-navigating when the step opens (a page tour is launched from
 * Today, and clicking the real nav icon is meant to be what does the
 * navigating, not the step itself). priButStr defaults to 'Next' (every page
 * tour has more steps after this one) but is overridable,
 * onboarding/app-features.jsx's own App Features tours reuse this exact step
 * verbatim as their OWN Step 1, currently still their only step, so theirs
 * pass 'Done' instead. butLabStr names the actual nav button ("Today",
 * "Pickers", ...) in the closing sentence instead of the generic "click it
 * now", optional and only passed where a caller has explicitly asked for it,
 * so other callers' wording is unaffected.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param pagKeyStr - Page Key String: The page's own NAV_TAR_OBJ key, e.g.
 *                    'picker'.
 * @param runSteFun - Run Step Function: An optional side effect fired with the
 *                    step's own click, set as the step's runFun; omitted when
 *                    not passed.
 * @param priButStr - Primary Button String: The coach card's primary button
 *                    label; defaults to 'Next'.
 * @param butLabStr - Button Label String: The nav button's own name for the
 *                    click sentence; defaults to null, which says "click it"
 *                    instead.
 *
 * @returns A GuiTouCom step object highlighting that page's own nav button.
 *
 * @example
 * ```ts
 * buiTs1Fun( 'picker', seeRunFun, 'Next', 'Pickers' ) // => step object
 * ```
 *
*/

const buiTs1Fun = ( pagKeyStr, runSteFun, priButStr = 'Next', butLabStr = null ) => { // What: Build Tour-Step-1 Function. Why: This builds every page tour's own shared Step 1, the real nav-button highlight. How: This looks up navTarObj by pagKeyStr, then spreads it with this step's own navigation flags.


	const navTarObj = NAV_TAR_OBJ[ pagKeyStr ]; // What: Nav Target Object. Why: This step's own selStr/titStr/bodEle come from the shared nav-button catalog. How: This looks up NAV_TAR_OBJ by pagKeyStr.



	return { // What: Step Object Return. Why: GuiTouCom needs this step's own selector, copy, and navigation flags. How: This spreads navTarObj, then overrides bodEle/tabStr/priStr/bacBoo/cirBoo/runFun.


		...navTarObj, // What: Nav Target Spread. Why: This step's own selStr/titStr/bodEle default to navTarObj's own content, only some of which get overridden below. How: This spreads navTarObj first so the explicit properties below can still win.

		bacBoo : false,     // What: Back Boolean. Why: This is every page tour's own very first step, so there is nothing to go back to. How: GuiTouCom hides its own Back button whenever this is false.
		cirBoo : true,      // What: Click-Is-Required Boolean. Why: The click itself is the thing being taught, not just a gate. How: GuiTouCom disables Next and only advances once the real target is clicked.
		priStr : priButStr, // What: Primary String. Why: This step's own coach card needs a label for its main action button, 'Next' by default but overridable by a caller like the App Features tours. How: GuiTouCom renders this as the button's own visible text.
		tabStr : 'today',   // What: Tab String. Why: This step must stay on Today so the real nav click is what does the navigating, not this step itself. How: GuiTouCom's own tab-sync effect reads this.

		bodEle : <>{ navTarObj.bodEle } Go ahead and click { butLabStr ? <>the "{ butLabStr }" page's button</> : 'it' } now.</>, // What: Body Element. Why: This step's own coach card needs navTarObj's own description plus an explicit click instruction. How: This appends a click sentence after navTarObj's own bodEle, naming the button when butLabStr is given.

		...( runSteFun ? { runFun : runSteFun } : {} ) // What: Run Spread. Why: Only some callers (the Pickers/Data/Stats tours below) need a side effect fired alongside this step's own click. How: This spreads a runFun field in only when runSteFun was actually passed.


	};


};

// #endregion buiTs1Fun

// #endregion Helpers



// #region Exports

export { buiTesFun, buiTs1Fun, canRenFun, forNamFun }; // What: Named Exports. Why: PagTouCom builds each page tour's steps from these and guards its rename step with them. How: This exports the 2 step builders and the 2 rename guards by name; the target catalogs and pgtNamStr stay private to this file.

// #endregion Exports


