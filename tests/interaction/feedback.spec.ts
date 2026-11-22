


// #region Imports

import { aniFinFun   } from '../support/feedback.ts'; // What: Animation Finish Function. Why: Each look is read once its motion has settled, not after a fixed pause. How: This waits two frames, then for every finite animation around the element to end.
import { cliBloFun   } from '../support/feedback.ts'; // What: Click Block Function. Why: Pressing a control shouldn't check off a card or switch tabs mid-check. How: This cancels every click in the page.
import { CON_PRO_ARR } from '../support/feedback.ts'; // What: Control Property Array. Why: A control's looks, such as its hover, are compared over the same properties. How: This lists them.
import { expect      } from '@playwright/test';       // What: Expect. Why: Each state passes only when every probed control and toggle responds. How: This asserts on what each check reads, such as that its problem list is empty.
import { EXT_STA_ARR } from '../support/states.ts';   // What: Extra State Array. Why: An editor or a form holds controls the plain tabs don't. How: This lists the opened states, such as an item editor, that the shared states module keeps.
import { FOC_PRO_ARR } from '../support/feedback.ts'; // What: Focus Property Array. Why: A focus look is compared over the control properties and the ring's outline. How: This lists them.
import { MIN_DUR_NUM } from '../support/feedback.ts'; // What: Minimum Duration Number. Why: A .01ms reduced-motion duration switches at once. How: This is the longest duration that still counts as none.
import { movProFun   } from '../support/feedback.ts'; // What: Moving Problems Function. Why: Under reduced motion a change has to switch rather than ease. How: This turns two snapshots into a problem for each eased change.
import { opeStaFun   } from '../support/states.ts';   // What: Open State Function. Why: Each check opens and settles its state first. How: This loads it and waits for it.
import { snaEleFun   } from '../support/feedback.ts'; // What: Snapshot Element Function. Why: Each look is recorded with whether each part of it would ease. How: This runs inside the page to read it.
import { snaProFun   } from '../support/feedback.ts'; // What: Snap Problems Function. Why: A change has to ease rather than snap. How: This turns two snapshots into a problem for each snapped change.
import { STA_RCD_ARR } from '../support/states.ts';   // What: State Record Array. Why: The shared app states are each checked. How: This lists them.
import { test        } from '@playwright/test';       // What: Test. Why: Each check of each state is its own test. How: This declares them.
import { valSigFun   } from '../support/feedback.ts'; // What: Value Signature Function. Why: Two looks are told apart by their values alone. How: This joins a snapshot's values into one string.


import type { ElementHandle } from '@playwright/test'; // What: Element Handle. Why: Each control and toggle is probed through a handle to its element. How: This types the element handles the helpers collect and read.
import type { Page          } from '@playwright/test'; // What: Page. Why: The helpers that drive the page from the test take a Playwright page, while those that run inside it take none. How: This types the driving helpers' page parameters.

// #endregion Imports



/**
 * feedback.spec.ts = Feedback Spec
 *
 * @summary
 * Checks the interaction feedback rule on every shared app state and a few
 * opened ones, such as an open item editor, in whichever engine the project
 * runs. The app repeats the same control many times over (a real list holds
 * dozens of identical cards), so the probe samples by kind: on each state it
 * groups every reachable link, button, form field, label-wrapped radio, and
 * focusable role by its tag, class list, type, role, and state attributes, and
 * probes the first one of each kind it can reach with the pointer, so each
 * kind of control the checked states show is read without probing every row. A
 * kind it couldn't reach is printed as a note. Each probed control has to look
 * different hovered than at rest, pressed than hovered, and focused the
 * keyboard way than unfocused, and a text field focused than unfocused, and
 * every probed property each of those changes, on it, its pseudo-elements, or
 * anything inside it, has to be eased by a transition or an animation, its
 * focus ring included. Cards and rows that respond to hover without being
 * controls, such as a Today card, are read hovered too. Each kind of element
 * with a state that switches on and off, such as the current tab or a chosen
 * pill, is flipped off, on, and off again by its attribute, and has to look
 * different and ease each change both ways. A control that waits above the
 * screen until it's focused, the skip link, is focused before it's hovered,
 * and on the plain tab states the probe fails when it isn't found. A control
 * whose click changes nothing, such as the current tab, may stay still on
 * hover, per the user's decision of 2026-11-18. Under reduced motion every
 * change stays but switches at once. Real clicks are blocked during the
 * checks, so a press doesn't run a control's click action. The snapshot and
 * comparison helpers live in tests/support/feedback.ts. Adapted from
 * TechGeek.support's own.
 *
 * Sections:
 *  - Constants
 *  - Helpers
 *  - Module Init
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const CON_SEL_STR = 'a[href], button, input:not([type="hidden"]), select, textarea, [role="button"], [role="radio"], [role="switch"], [role="tab"], [tabindex="0"]'; // What: Control Selector String. Why: Every element a person can press or focus is an interaction, the theme rows' radios and the info tips' trigger spans included. How: This matches the links, buttons, form fields, and focusable roles.
const FEE_STA_ARR = [ ...STA_RCD_ARR, ...EXT_STA_ARR ]; // What: Feedback State Array. Why: Every shared state is checked, and so is each opened one, since each holds controls the plain tabs don't. How: This lists the shared states first, then the opened ones.
const FIE_SEL_STR = 'input:not([type="checkbox"]):not([type="radio"]):not([type="file"]), select, textarea';                                                         // What: Field Selector String. Why: A text field has no hover or press look of its own, since pressing one only focuses it. How: This matches the fields, which the probe reads for focus alone.
const HOV_TAR_STR = '[class*="todCarArt"], [class*="preCarDiv"], [class*="lisRowDiv"]';                                                                              // What: Hover Target String. Why: Cards and rows, such as a Today card, respond to hover without being controls, so the control probe doesn't reach them. How: This matches each kind by its CSS module class, whose name Vite keeps inside the hashed class.
const IDE_LIS_ARR = FEE_STA_ARR.map( ( staRcdObj ) => staRcdObj.ideStr );                                                                                            // What: Identifier List Array. Why: Each toggle row names the states it has to be found in, and most rows name every state of a tab. How: This lists every checked state's name, for the tab lists below.
const DAT_IDE_ARR = IDE_LIS_ARR.filter( ( ideCurStr ) => ideCurStr.startsWith( 'data-' ) );                                                                          // What: Data Identifier Array. Why: The Data tab's chevrons, scope tabs, and vacation buttons show on its states. How: This lists the Data states' names.
const PIC_IDE_ARR = IDE_LIS_ARR.filter( ( ideCurStr ) => ideCurStr.startsWith( 'picker' ) );                                                                         // What: Pickers Identifier Array. Why: The Pickers tab's picker tabs and add button show on its states, the form's included. How: This lists the Pickers states' names.
const PIL_IDE_ARR = IDE_LIS_ARR.filter( ( ideCurStr ) => /^(data|picker|stats)-?/.test( ideCurStr ) );                                                               // What: Pill Identifier Array. Why: The filter rails' pills show on the Data, Pickers, and Stats states. How: This lists those states' names.
const SET_IDE_ARR = IDE_LIS_ARR.filter( ( ideCurStr ) => ideCurStr.startsWith( 'settings-' ) );                                                                      // What: Settings Identifier Array. Why: The Settings tab's rail and its toggled controls, such as the theme rows, show on its states. How: This lists the Settings states' names.
const SKI_STA_ARR = [ 'today-desktop', 'today-phone', 'pickers-desktop', 'pickers-phone', 'stats-desktop', 'stats-phone', 'data-desktop', 'data-phone', 'settings-desktop', 'settings-phone' ]; // What: Skip State Array. Why: The skip link waits above the screen on every plain tab, while an open modal or help mode makes it unreachable. How: This names the states where the probe has to find it.
const STA_IDE_ARR = IDE_LIS_ARR.filter( ( ideCurStr ) => ideCurStr.startsWith( 'stats-' ) );                                                                         // What: Stats Identifier Array. Why: The Stats tab's scope tabs, range pills, and heat cells show on its states. How: This lists the Stats states' names.
const TAB_IDE_ARR = FEE_STA_ARR.filter( ( staRcdObj ) => staRcdObj.fixBoo && !staRcdObj.ideStr.startsWith( 'privacy' ) ).map( ( staRcdObj ) => staRcdObj.ideStr );   // What: Tab Identifier Array. Why: The tab bar and its help button show on every state with the backup loaded, except under the Privacy panel, which covers them. How: This lists those states' names.
const TOD_IDE_ARR = FEE_STA_ARR.filter( ( staRcdObj ) => staRcdObj.fixBoo && staRcdObj.tabStr === 'today' ).map( ( staRcdObj ) => staRcdObj.ideStr );                // What: Today Identifier Array. Why: Today's cards, rail, and log chips show on every Today state with the backup loaded. How: This lists those states' names.



type TogTarTyp = { // What: Toggle Target Type. Why: Each kind of element with a state that switches on and off is flipped the same way. How: This holds what to find, which attribute marks the state, its two values, and the states it has to be found in.


	actStr : string,        // What: Active String. Why: The state is switched on by setting its attribute. How: This holds the value that marks it on, '' for an attribute that only has to be present.
	attStr : string,        // What: Attribute String. Why: The state lives in one attribute the stylesheet reacts to. How: This holds its name.
	inaStr : string | null, // What: Inactive String. Why: The state is switched off by its attribute too. How: This holds the value that marks it off, or null for an attribute that's removed.
	selStr : string,        // What: Selector String. Why: Each kind is found by its own class. How: This holds the selector that matches it.
	staArr : string[]       // What: State Array. Why: A kind the probe silently stopped finding would pass without checking anything. How: This names each state the kind has to be found in.


};

// #region TOG_TAR_ARR

/**
 * TOG_TAR_ARR = Toggle Target Array
 *
 * @summary
 * The kinds of element with a state that switches on and off, each flipped on
 * and off again in turn, in the order listed. A kind whose state is a value
 * attribute, such as aria-pressed, is found by that attribute too, since a
 * switch keys its look off whichever one it carries. Every row shares one
 * shape, so its fields carry no comments of their own:
 *
 * - `actStr` (String): Active String, the value that marks the state on.
 *
 * - `attStr` (String): Attribute String, the attribute that marks the state.
 *
 * - `inaStr` (String or null): Inactive String, the value that marks it off,
 *   or null to remove the attribute.
 *
 * - `selStr` (String): Selector String, the selector that finds the element,
 *   by the class name Vite keeps inside each hashed module class.
 *
 * - `staArr` (Array): State Array, the states, by their names, where at
 *   least one element of the kind has to be found and flipped.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const TOG_TAR_ARR : TogTarTyp[] = [ // What: Toggle Target Array. Why: A switched state is feedback as much as a hover, and has to ease in and out. How: This lists each kind of element to flip.


	{ // What: Current Tab Row. Why: The tab bar's current tab reads in the text color. How: This flips each tab button's aria-current.


		actStr : 'page',
		attStr : 'aria-current',
		inaStr : null,
		selStr : '[class*="navTabBut"]',
		staArr : TAB_IDE_ARR


	},

	{ // What: Selected Group Rail Row. Why: Today's rail marks the group in view. How: This flips each rail button's data-rail-select-active.


		actStr : '',
		attStr : 'data-rail-select-active',
		inaStr : null,
		selStr : '[class*="raiGroBut"]',
		staArr : TOD_IDE_ARR


	},

	{ // What: Selected Section Rail Row. Why: Settings' rail marks the section in view. How: This flips each rail button's data-rail-select-active.


		actStr : '',
		attStr : 'data-rail-select-active',
		inaStr : null,
		selStr : '[class*="raiSecBut"]',
		staArr : SET_IDE_ARR


	},

	{ // What: Selected Picker Tab Row. Why: Pickers' rail marks the picker shown. How: This flips each picker tab's data-tab-select-active.


		actStr : '',
		attStr : 'data-tab-select-active',
		inaStr : null,
		selStr : '[class*="picTabBut"]',
		staArr : PIC_IDE_ARR


	},

	{ // What: Selected Scope Tab Row. Why: Data's and Stats' scope tabs mark the scope shown. How: This flips each scope tab's data-tab-select-active.


		actStr : '',
		attStr : 'data-tab-select-active',
		inaStr : null,
		selStr : '[class*="scoTabBut"]',
		staArr : [ ...DAT_IDE_ARR, ...STA_IDE_ARR ]


	},

	{ // What: Selected Range Pill Row. Why: Stats' range pills mark the range shown. How: This flips each range pill's data-pill-select-active.


		actStr : '',
		attStr : 'data-pill-select-active',
		inaStr : null,
		selStr : '[class*="ranPilBut"]',
		staArr : STA_IDE_ARR


	},

	{ // What: Selected Heat Cell Row. Why: Stats' heat map marks the day chosen. How: This flips each cell's data-cell-select-active.


		actStr : '',
		attStr : 'data-cell-select-active',
		inaStr : null,
		selStr : '[class*="hetCelBut"]',
		staArr : STA_IDE_ARR


	},

	{ // What: Chosen Group Chip Row. Why: The picker form's group chips mark the group chosen. How: This flips each chip's data-chip-select-active.


		actStr : '',
		attStr : 'data-chip-select-active',
		inaStr : null,
		selStr : '[class*="groChiBut"]',
		staArr : [ 'picker-form-desktop' ]


	},

	{ // What: Chosen Mode Option Row. Why: A mode or style card marks the one chosen. How: This flips each option's data-option-select-active.


		actStr : '',
		attStr : 'data-option-select-active',
		inaStr : null,
		selStr : '[class*="modOptLab"]',
		staArr : [ 'data-card-desktop', 'picker-form-desktop', ...SET_IDE_ARR ]


	},

	{ // What: Selected Add Picker Row. Why: Pickers' add button reads as the shown tab while its form is open. How: This flips its data-tab-select-active.


		actStr : '',
		attStr : 'data-tab-select-active',
		inaStr : null,
		selStr : '[class*="picAddBut"]',
		staArr : PIC_IDE_ARR


	},

	{ // What: Open Chevron Row. Why: A Data section's chevron turns while it's open. How: This flips each chevron's data-chevron-open-active.


		actStr : '',
		attStr : 'data-chevron-open-active',
		inaStr : null,
		selStr : ':is([class*="chvDisSpa"], [class*="chvDisBut"])',
		staArr : DAT_IDE_ARR


	},

	{ // What: Done Card Row. Why: A Today card dims and fills its check once it's done. How: This flips each card's data-card-done-active.


		actStr : '',
		attStr : 'data-card-done-active',
		inaStr : null,
		selStr : '[class*="todCarArt"]',
		staArr : TOD_IDE_ARR


	},

	{ // What: Open Help Badge Row. Why: A help badge fills while its tip is open. How: This flips each badge's data-badge-open-active.


		actStr : '',
		attStr : 'data-badge-open-active',
		inaStr : null,
		selStr : '[class*="helBadBut"]',
		staArr : [ 'help-phone' ]


	},

	{ // What: Selected Filter Pill Row. Why: A filter rail's pill marks the filter chosen. How: This flips each pill's aria-selected.


		actStr : 'true',
		attStr : 'aria-selected',
		inaStr : 'false',
		selStr : '[class*="filPilBut"][aria-selected]',
		staArr : PIL_IDE_ARR


	},

	{ // What: Pressed Segment Row. Why: A segmented control marks its chosen segment. How: This flips each segment's aria-pressed.


		actStr : 'true',
		attStr : 'aria-pressed',
		inaStr : 'false',
		selStr : '[class*="segConBut"][aria-pressed]',
		staArr : [ 'picker-form-desktop', ...SET_IDE_ARR ]


	},

	{ // What: Pressed Switch Row. Why: A switch slides its knob and fills while it's on. How: This flips each switch's aria-pressed.


		actStr : 'true',
		attStr : 'aria-pressed',
		inaStr : 'false',
		selStr : '[class*="togSwiBut"][aria-pressed]',
		staArr : [ 'data-card-desktop', 'editor-phone', ...SET_IDE_ARR ]


	},

	{ // What: Checked Switch Row. Why: A switch slides its knob and fills while it's on. How: This flips each switch's aria-checked.


		actStr : 'true',
		attStr : 'aria-checked',
		inaStr : 'false',
		selStr : '[class*="togSwiBut"][aria-checked]',
		staArr : [ 'data-card-desktop', 'picker-form-desktop' ]


	},

	{ // What: Checked Theme Row. Why: The theme picker frames the theme chosen. How: This flips each row's aria-checked.


		actStr : 'true',
		attStr : 'aria-checked',
		inaStr : 'false',
		selStr : '[class*="theRowDiv"][aria-checked]',
		staArr : SET_IDE_ARR


	},

	{ // What: Checked Group Pill Row. Why: A group pill marks the group chosen. How: This flips each pill's aria-checked.


		actStr : 'true',
		attStr : 'aria-checked',
		inaStr : 'false',
		selStr : '[class*="groPilBut"][aria-checked]',
		staArr : [ 'data-card-desktop' ]


	},

	{ // What: Pressed Help Toggle Row. Why: The help button fills while help mode is on. How: This flips its aria-pressed.


		actStr : 'true',
		attStr : 'aria-pressed',
		inaStr : 'false',
		selStr : '[class*="helTogBut"][aria-pressed]',
		staArr : TAB_IDE_ARR


	},

	{ // What: Pressed Log Chip Row. Why: A group's log chip fills while its log is open. How: This flips each chip's aria-pressed.


		actStr : 'true',
		attStr : 'aria-pressed',
		inaStr : 'false',
		selStr : '[class*="logChiBut"][aria-pressed]',
		staArr : [ 'day-log-desktop', 'editor-phone', 'help-phone', 'today-desktop', 'today-phone' ]


	},

	{ // What: Pressed Weekday Chip Row. Why: A weekday chip fills while its day is chosen. How: This flips each chip's aria-pressed.


		actStr : 'true',
		attStr : 'aria-pressed',
		inaStr : 'false',
		selStr : '[class*="dowChiBut"][aria-pressed]',
		staArr : [ 'data-card-desktop', 'picker-form-desktop' ]


	},

	{ // What: Pressed Vacation Row. Why: A picker's vacation button fills while its items are all active. How: This flips its aria-pressed.


		actStr : 'true',
		attStr : 'aria-pressed',
		inaStr : 'false',
		selStr : '[class*="vacTogBut"][aria-pressed]',
		staArr : DAT_IDE_ARR


	}


];

// #endregion TOG_TAR_ARR

// #endregion Constants



// #region Helpers

// #region attSetFun

/**
 * attSetFun = Attribute Set Function
 *
 * @summary
 * Sets an attribute on an element the test holds a handle to, or removes it
 * when given null, the way the app itself marks a state on or off, so the
 * stylesheet's look for that state applies without a click.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param hanCurObj - Handle Current Object: The element to mark.
 * @param attNamStr - Attribute Name String: The attribute to set.
 * @param attValStr - Attribute Value String: Its value, or null to remove it.
 *
 * @returns A promise that settles once the attribute is set, with no value.
 *
 * @example
 * ```ts
 * attSetFun(togCurObj, 'aria-pressed', 'true') // => Promise<void>
 * ```
 *
*/

async function attSetFun ( hanCurObj : ElementHandle< Element >, attNamStr : string, attValStr : string | null ) : Promise< void > {


	await hanCurObj.evaluate( ( hanCurEle, attArgArr ) => { // What: Attribute Set Call. Why: The page function takes one argument. How: This passes the name and value as a pair.


		if ( attArgArr[ 1 ] === null ) hanCurEle.removeAttribute( attArgArr[ 0 ] ); // What: Attribute Remove Branch. Why: A null value means the state is off. How: This removes the attribute.

		else hanCurEle.setAttribute( attArgArr[ 0 ], attArgArr[ 1 ] ); // What: Attribute Set Branch. Why: A string value, whether it marks the state on or off, is written as the attribute's value. How: This sets the attribute to it.


	}, [ attNamStr, attValStr ] as const ); // What: Attribute Pair Argument. Why: The page function reads the name and value from one argument. How: This hands them over as a pair. // What: Type Assertion Note. Why: Without it the array widens to a mixed array, so the page function's argument loses its pairing. How: as const keeps it a tuple, its first slot a string and its second a string or null.


}

// #endregion attSetFun



// #region kinLisFun

/**
 * kinLisFun = Kind List Function
 *
 * @summary
 * Collects a sample of the elements a person can reach on the page as it
 * stands: each element the selector matches that's drawn with a size, not
 * taken out of the tab order with tabindex -1, not disabled, and not inside
 * inert or hidden content, grouped into kinds by its tag, class list, type,
 * role, and state attributes, and returns up to a few of each kind in page
 * order, so a later step can take the first of a kind the pointer reaches.
 * Handles are taken once, so the list stays fixed while the checks scroll. It
 * marks the chosen elements with a numbered attribute of its own inside the
 * page to hand them back, clearing the marks of the call before.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page to collect from.
 * @param conSelStr - Control Selector String: The elements to collect, such as
 *                    every link and button.
 * @param perKinNum - Per Kind Number: How many of each kind to return.
 *
 * @returns A promise that resolves with each kind's sampled elements, in page
 *          order.
 *
 * @example
 * ```ts
 * kinLisFun(page, 'a, button', 3) // => [ [ ElementHandle, ... ], ... ]
 * ```
 *
*/

async function kinLisFun ( curPagObj : Page, conSelStr : string, perKinNum : number ) : Promise< ElementHandle< Element >[][] > {


	const kinIndArr = await curPagObj.evaluate( ( kinArgArr ) => { // What: Kind Index Array. Why: Judging each element in its own call would be slow, so the page sorts them in one pass. How: This marks the sampled elements and returns each kind's mark numbers.


		for ( const marCurEle of document.querySelectorAll( '[data-feedback-probe-mark]' ) ) marCurEle.removeAttribute( 'data-feedback-probe-mark' ); // What: Old Mark Loop. Why: A previous call's marks would mix into this one's. How: This clears every mark.



		const kinNumMap = new Map< string, number[] >(); // What: Kind Number Map. Why: Elements of one kind are sampled together. How: This maps each kind's signature to its elements' mark numbers.

		let marNumNum = 0; // What: Mark Number Number. Why: Each sampled element needs its own mark to be found again. How: This counts up with each one.


		for ( const conCurEle of document.querySelectorAll( kinArgArr[ 0 ] ) ) { // What: Element Sort Loop. Why: Every element the selector matches is judged on its own. How: This keeps each one a person can reach, by kind.


			const conRecObj = conCurEle.getBoundingClientRect(); // What: Control Rect Object. Why: An element with no size isn't drawn. How: This reads its box.

			const notDisBoo = !conCurEle.matches( ':disabled' );                                                  // What: Not Disabled Boolean. Why: A disabled control takes no input. How: This is true when the element isn't disabled.
			const notHidBoo = !conCurEle.closest( '[aria-hidden="true"]' );                                       // What: Not Hidden Boolean. Why: A hidden copy, such as the ghost tab bar a placement change plays, isn't a control a person uses. How: This is true when no ancestor hides it.
			const notIneBoo = !conCurEle.closest( '[inert]' );                                                    // What: Not Inert Boolean. Why: Inert content, such as the page behind a modal, can't be reached. How: This is true when no ancestor is inert.
			const sizNonBoo = conRecObj.width > 0 && conRecObj.height > 0;                                        // What: Size Nonzero Boolean. Why: A zero-sized element isn't drawn. How: This is true when its box has both a width and a height.
			const tabOrdBoo = conCurEle.getAttribute( 'tabindex' ) !== '-1';                                      // What: Tab Order Boolean. Why: A control taken out of the tab order isn't one a person reaches. How: This is true unless its tabindex is -1.
			const visCheBoo = conCurEle.checkVisibility( { opacityProperty : true, visibilityProperty : true } ); // What: Visible Check Boolean. Why: An element hidden by display, visibility, or a zero opacity can't be seen. How: This asks the browser.

			const reaConBoo = notDisBoo && notHidBoo && notIneBoo && sizNonBoo && tabOrdBoo && visCheBoo; // What: Reachable Control Boolean. Why: An element counts only when all of these hold. How: This combines them.


			if ( !reaConBoo ) continue; // What: Unreachable Guard. Why: Only reachable elements are sampled. How: This skips the rest.



			const kinSigStr = [ conCurEle.tagName, conCurEle.getAttribute( 'class' ) || '', conCurEle.getAttribute( 'type' ) || '', conCurEle.getAttribute( 'role' ) || '', ...[ ...conCurEle.attributes ].filter( ( attCurObj ) => /^(aria-(checked|current|disabled|pressed|selected)|data-[a-z-]+-active)$/.test( attCurObj.name ) ).map( ( attCurObj ) => `${ attCurObj.name }=${ attCurObj.value }` ) ].join( '|' ); // What: Kind Signature String. Why: Elements of one tag, class list, type, role, and state share their styling, so one stands for the rest, while a current tab looks different from the others. How: This joins the four with each state attribute the element carries, such as aria-current.
			const kinNumArr = kinNumMap.get( kinSigStr ) || []; // What: Kind Number Array. Why: The kind's sample grows up to its limit. How: This reads the kind's marks so far, or starts them.


			if ( kinNumArr.length >= kinArgArr[ 1 ] ) continue; // What: Full Kind Guard. Why: A kind already holds enough samples. How: This skips the element.



			conCurEle.setAttribute( 'data-feedback-probe-mark', String( marNumNum ) ); // What: Mark Set Call. Why: The test finds the sampled element again by its mark. How: This numbers it.

			kinNumArr.push( marNumNum++ ); // What: Mark Record Call. Why: The kind lists its own marks. How: This records the mark and counts on.

			kinNumMap.set( kinSigStr, kinNumArr ); // What: Kind Record Call. Why: The kind's sample is read back by signature. How: This stores it.


		}



		return [ ...kinNumMap.values() ]; // What: Kind Marks Return. Why: The test fetches each kind's elements by their marks. How: This hands back each kind's mark numbers, in page order.


	}, [ conSelStr, perKinNum ] as const ); // What: Kind Argument Pair. Why: The page function reads the selector and the limit from one argument. How: This hands them over as a pair. // What: Type Assertion Note. Why: Without it the array widens to a mixed array, so the page function's argument loses its pairing. How: as const keeps it a tuple of a string and a number.

	const marHanArr = await curPagObj.$$( '[data-feedback-probe-mark]' ); // What: Mark Handle Array. Why: Each sampled element is driven through a handle. How: This takes one for every marked element, in page order, which is mark order.



	return kinIndArr.map( ( kinNumArr ) => kinNumArr.map( ( marNumNum ) => marHanArr[ marNumNum ] ) ); // What: Kind Handles Return. Why: Each kind's sample is probed together. How: This maps each kind's marks to their handles.


}

// #endregion kinLisFun



// #region parMovFun

/**
 * parMovFun = Park Move Function
 *
 * @summary
 * Moves the pointer to a resting spot where it hovers no control, so a look
 * read there is read with nothing hovered. It tries the corners and the
 * middle of each edge of the viewport in turn, and takes the first whose
 * topmost element sits inside no link, button, field, or focusable role,
 * falling back to the top left corner when none does.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page to move the pointer on.
 *
 * @returns A promise that settles once the pointer has moved, with no value.
 *
 * @example
 * ```ts
 * parMovFun(page) // => Promise<void>
 * ```
 *
*/

async function parMovFun ( curPagObj : Page ) : Promise< void > {


	const parPoiArr = await curPagObj.evaluate( ( conSelStr ) => { // What: Park Point Array. Why: Only the page knows what sits under each spot. How: This tries each candidate there and returns the first clear one.


		const heiValNum = innerHeight; // What: Height Value Number. Why: The candidates sit along the viewport's edges. How: This reads its height.
		const widValNum = innerWidth;  // What: Width Value Number. Why: The candidates sit along the viewport's edges. How: This reads its width.
		const canPoiArr = [ [ 2, 2 ], [ widValNum - 3, 2 ], [ 2, heiValNum - 3 ], [ widValNum - 3, heiValNum - 3 ], [ widValNum / 2, 2 ], [ widValNum / 2, heiValNum - 3 ], [ 2, heiValNum / 2 ], [ widValNum - 3, heiValNum / 2 ] ]; // What: Candidate Point Array. Why: An edge or a corner is least likely to sit on a control. How: This lists the four corners and the middle of each edge, just inside the viewport.



		return canPoiArr.find( ( canCurArr ) => !document.elementFromPoint( canCurArr[ 0 ], canCurArr[ 1 ] )?.closest( conSelStr ) ) || [ 0, 0 ]; // What: Clear Point Return. Why: The pointer rests where it hovers nothing a person presses. How: This returns the first candidate whose topmost element has no control around it, or the top left corner.


	}, CON_SEL_STR ); // What: Control Selector Argument. Why: The page function can't read this file's constants. How: This hands it the selector that matches controls.



	await curPagObj.mouse.move( parPoiArr[ 0 ], parPoiArr[ 1 ] ); // What: Pointer Park Call. Why: The resting look is read with nothing hovered. How: This moves the pointer to the clear spot.


}

// #endregion parMovFun



// #region reaHitFun

/**
 * reaHitFun = Reach Hit Function
 *
 * @summary
 * Scrolls an element into view and reports whether the pointer can reach it
 * there: true when the topmost element at the center of its box is the
 * element itself, something inside it, or the label holding it, and false
 * when something else covers it, such as a bar over the scrolled content. A
 * control that still waits above the screen, the skip link, counts as
 * reachable, since it's focused before it's hovered.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param hanCurObj - Handle Current Object: The element to reach.
 *
 * @returns A promise that resolves with whether the pointer can reach it.
 *
 * @example
 * ```ts
 * reaHitFun(conCurObj) // => true
 * ```
 *
*/

async function reaHitFun ( hanCurObj : ElementHandle< Element > ) : Promise< boolean > {


	await hanCurObj.evaluate( ( hanCurEle ) => hanCurEle.scrollIntoView( { block : 'center', inline : 'center' } ) ); // What: Element Scroll Call. Why: An element has to be on screen to hover or press. How: This scrolls it to the middle of its scrollers, clear of a bar at either edge.



	return hanCurObj.evaluate( ( hanCurEle ) => { // What: Hit Check Return. Why: Only the page knows what sits topmost at a point. How: This compares the element at the box's center with the element.


		const hanRecObj = hanCurEle.getBoundingClientRect();                                                                       // What: Handle Rect Object. Why: The hit is tested at the box's center. How: This reads the box.
		const hitCurEle = document.elementFromPoint( hanRecObj.left + hanRecObj.width / 2, hanRecObj.top + hanRecObj.height / 2 ); // What: Hit Current Element. Why: The pointer lands on whatever is topmost. How: This reads the element at the center.


		if ( hanRecObj.bottom <= 0 ) return true; // What: Above Screen Guard. Why: The skip link waits above the screen until it's focused. How: This counts it as reachable.



		return !!hitCurEle && ( hanCurEle.contains( hitCurEle ) || hitCurEle === hanCurEle.closest( 'label' ) ); // What: Hit Verdict Return. Why: A covered element can't be hovered. How: This is true when the topmost element is the element, inside it, or its label.


	} );


}

// #endregion reaHitFun



// #region stiConFun

/**
 * stiConFun = Still Control Function
 *
 * @summary
 * Runs inside the page and says whether a control may stay still when hovered,
 * and when pressed, because a click on it does nothing, per the user's
 * decision of 2026-11-18: a current or selected control a person can still
 * click to change something gets a hover look, while one where a click changes
 * nothing stays still. It judges by the element's own state, never by its
 * class, so a new control of the same kind is judged the same way. A control
 * marked current (aria-current, or a data-*-current-active attribute) and a
 * radio already checked, whose click chooses what's already chosen, may skip
 * the hover look. A control that is disabled through aria-disabled or a
 * data-*-disabled-active attribute, or wraps a disabled control, such as an
 * info tip trigger around a disabled button, may skip both looks. A hover card
 * that isn't a control and whose cursor isn't the pointer, such as an open
 * row's header, may skip the hover look too. Passed to Playwright's evaluate,
 * so it can't read anything from this file.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param conCurEle - Control Current Element: The element probed.
 * @param conSelStr - Control Selector String: What counts as a control, so a
 *                    card is told apart from one.
 *
 * @returns Whether the element may skip its hover look, and its press look.
 *
 * @example
 * ```ts
 * handle.evaluate(stiConFun, CON_SEL_STR)
 * // => { dowBoo : false, hovBoo : false }
 * ```
 *
*/

function stiConFun ( conCurEle : Element, conSelStr : string ) : { dowBoo : boolean, hovBoo : boolean } {


	const cheRadBoo = conCurEle.matches( '[role="radio"][aria-checked="true"], input[type="radio"]:checked' ); // What: Checked Radio Boolean. Why: The user decided on 2026-11-18 that a chosen theme row or mode card stays still, since clicking it re-chooses the same one. How: This is true for a radio role marked checked or a native radio that is.
	const curMarBoo = ( conCurEle.hasAttribute( 'aria-current' ) && conCurEle.getAttribute( 'aria-current' ) !== 'false' ) || [ ...conCurEle.attributes ].some( ( attCurObj ) => /^data-[a-z-]+-current-active$/.test( attCurObj.name ) ); // What: Current Marked Boolean. Why: The user decided on 2026-11-18 that a control marked current, such as the current tab, stays still, since clicking it opens what's already open. How: This is true for an element carrying aria-current, or a data-*-current-active attribute such as the picker form's current step.
	const disWraBoo = conCurEle.matches( '[aria-disabled="true"]' ) || [ ...conCurEle.attributes ].some( ( attCurObj ) => /^data-[a-z-]+-disabled-active$/.test( attCurObj.name ) ) || !!conCurEle.querySelector( ':disabled' );           // What: Disabled Wrap Boolean. Why: The user decided on 2026-11-18 that an info tip trigger around a disabled control stays still on hover and on press, since its action can't run. How: This is true for an element marked aria-disabled or by a data-*-disabled-active attribute, such as the already-included Send's tip, or one holding a disabled control.
	const poiOffBoo = !conCurEle.matches( conSelStr ) && getComputedStyle( conCurEle ).cursor !== 'pointer'; // What: Pointer Off Boolean. Why: A card that isn't a control and shows no pointer cursor, such as an open row's header, does nothing on a click, so it stays still per the user's decision of 2026-11-18. How: This is true for a non-control whose computed cursor isn't the pointer.



	return { // What: Still Verdict Return. Why: The probe skips only the look the decision exempts. How: This frees the hover look for every still case and the press look for a disabled wrapper alone.


		dowBoo : disWraBoo,                                       // What: Down Boolean. Why: Only a control whose action can't run may skip the press look too. How: This is true for a disabled wrapper.
		hovBoo : cheRadBoo || curMarBoo || disWraBoo || poiOffBoo // What: Hover Boolean. Why: Every still case may skip the hover look. How: This is true when any of the four holds.


	};


}

// #endregion stiConFun



// #region feeProFun

/**
 * feeProFun = Feedback Problems Function
 *
 * @summary
 * Probes the first reachable element of each kind of control and returns a
 * problem for each one that gives no feedback, a single problem when it finds
 * no control at all, and one when it finds no skip link waiting above the
 * screen on a state {@link SKI_STA_ARR} names. A radio or checkbox inside a
 * label is read and pointed at through its label, which draws its look, and
 * focused itself. One that still waits above the screen until it's focused,
 * the skip link, is focused so it slides in before it's hovered. Each is read
 * at rest with the pointer parked, again while hovered, and again while the
 * mouse button is held on it, a text field skipping the press, since pressing
 * one only focuses it, then blurred with the pointer parked and read once more
 * while focused the way a keyboard focuses it, every look read once its motion
 * has settled. A control that looks the same unfocused and focused is a
 * problem, and so is a link or button that looks the same at rest and hovered
 * or hovered and pressed, while a text field isn't held to those two. Normally
 * every probed property that changes on hover, press, or focus, on the control
 * or anything inside it, has to be eased ({@link snaProFun}), the focus ring's
 * outline included; under reduced motion none of them may ease ({@link
 * movProFun}), and the control's own transition durations, read while it is
 * pressed, or hovered for a field, must all be no longer than {@link
 * MIN_DUR_NUM}. A control {@link stiConFun} finds still, since a click on it
 * changes nothing, may skip its hover look, or its press look, and in WebKit a
 * radio or checkbox pointed at through its label skips its press look, since
 * WebKit doesn't mark a pressed label :active. It expects real clicks already
 * blocked, so releasing the mouse does nothing, and it returns the kinds it
 * couldn't reach as notes.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page to probe.
 * @param staIdeStr - State Identifier String: The state's name, which says
 *                    whether the skip link has to be found.
 * @param redMotBoo - Reduced Motion Boolean: Whether the page is emulating
 *                    reduced motion.
 *
 * @returns A promise that resolves with every feedback problem found, and the
 *          kinds no sample of which could be reached.
 *
 * @example
 * ```ts
 * feeProFun(page, 'today-phone', false) // => { notArr : [], proArr : [] }
 * ```
 *
*/

async function feeProFun ( curPagObj : Page, staIdeStr : string, redMotBoo : boolean ) : Promise< { notArr : string[], proArr : string[] } > {


	const kinHanArr = await kinLisFun( curPagObj, CON_SEL_STR, 3 ); // What: Kind Handle Array. Why: One reachable control of each kind is probed. How: This collects up to three of each kind to choose from.

	const notLisArr : string[] = []; // What: Note List Array. Why: A kind the pointer couldn't reach is worth printing without failing. How: This collects them.
	const proLisArr : string[] = []; // What: Problem List Array. Why: Every problem should be reported, not just the first. How: This collects them.


	if ( !kinHanArr.length ) proLisArr.push( 'no control to probe' ); // What: Empty Probe Check. Why: A probe that finds nothing would pass without checking anything, and every state has at least one reachable control. How: This records a problem when no control is found.



	let skiFouBoo = false; // What: Skip Found Boolean. Why: The skip link has to be reached by the probe's focus-first branch. How: This turns true once a control resting above the screen reads "Skip to main content".


	for ( const kinCurArr of kinHanArr ) { // What: Kind Probe Loop. Why: Every kind of control has to respond. How: This reads the first reachable control of each kind at rest, hovered, pressed, unfocused, and focused, a text field skipping the press.


		let conCurObj : ElementHandle< Element > | null = null; // What: Control Current Object. Why: The kind is probed through the first sample the pointer reaches. How: This holds it, or null when none is reached.


		for ( const samCurObj of kinCurArr ) if ( !conCurObj && await reaHitFun( samCurObj ) ) conCurObj = samCurObj; // What: Reachable Sample Loop. Why: A sample covered by a bar can't be hovered, while another of its kind may be clear. How: This keeps the first sample the pointer reaches.



		if ( !conCurObj ) { notLisArr.push( `${ await kinCurArr[ 0 ].evaluate( ( kinCurEle ) => `${ kinCurEle.tagName.toLowerCase() } "${ ( kinCurEle.getAttribute( 'aria-label' ) || kinCurEle.textContent || '' ).trim().slice( 0, 30 ) }"` ) } couldn't be reached by the pointer` ); continue; } // What: Unreached Kind Guard. Why: A kind none of whose samples the pointer reaches can't be hovered, which is worth noting rather than failing. How: This records a note naming its first sample and moves on.



		const conDesStr = await conCurObj.evaluate( ( conCurEle ) => `${ conCurEle.tagName.toLowerCase() } "${ ( conCurEle.getAttribute( 'aria-label' ) || ( conCurEle.matches( 'input, select, textarea' ) ? conCurEle.getAttribute( 'name' ) || conCurEle.getAttribute( 'type' ) : conCurEle.textContent ) || '' ).trim().slice( 0, 30 ) }" (${ ( conCurEle.getAttribute( 'class' ) || '' ).trim().slice( 0, 40 ) })` ); // What: Control Description String. Why: A problem should name the control a person would recognize, and the class a reader of the stylesheet would. How: This joins its tag, its label, its text, or for a field its name or type, and the start of its class list.
		const conFieBoo = await conCurObj.evaluate( ( conCurEle, fieSelStr ) => conCurEle.matches( fieSelStr ), FIE_SEL_STR );                                                                    // What: Control Field Boolean. Why: A text field has no hover or press look to require. How: This is true when the control is a text field.
		const conStiObj = await conCurObj.evaluate( stiConFun, CON_SEL_STR ); // What: Control Still Object. Why: A control whose click does nothing may stay still, per the user's decision of 2026-11-18. How: This reads which looks the control may skip.
		const labHanObj = await conCurObj.evaluateHandle( ( conCurEle ) => ( conCurEle.matches( 'input[type="radio"], input[type="checkbox"]' ) && conCurEle.closest( 'label' ) ) || conCurEle ); // What: Label Handle Object. Why: A radio or checkbox inside a label is drawn by its label, which takes the hover and press. How: This points at the label holding one, or the control itself.
		const looHanObj = labHanObj.asElement()!; // What: Look Handle Object. Why: The look is read and pointed at through one element. How: This reads the handle as an element. // What: Non-Null Note. Why: The page function always returns an element. How: The control or its label is an element, so asElement can't be null.
		const offScrBoo = await conCurObj.evaluate( ( conCurEle ) => conCurEle.getBoundingClientRect().bottom <= 0 );                                                                             // What: Off Screen Boolean. Why: A control that waits above the screen until it's focused, the skip link, can't be hovered where it rests. How: This is true when its box sits wholly above the viewport after the scroll.
		const labWebBoo = curPagObj.context().browser()?.browserType().name() === 'webkit' && await labHanObj.evaluate( ( labCurEle ) => labCurEle.matches( 'label' ) );                          // What: Label WebKit Boolean. Why: WebKit doesn't mark a pressed label :active, so a radio drawn by its label, such as the picker form's mode card, can't show a press there, measured 2026-11-18. How: This is true in WebKit when the control is pointed at through its label, which frees it from the press look alone.


		if ( offScrBoo && await conCurObj.evaluate( ( conCurEle ) => conCurEle.textContent?.trim() === 'Skip to main content' ) ) skiFouBoo = true; // What: Skip Found Assignment. Why: The skip link's focus-first branch has to run on the plain tabs. How: This marks it found when the control resting above the screen is the skip link.



		if ( offScrBoo ) await conCurObj.evaluate( ( conCurEle ) => { if ( conCurEle instanceof HTMLElement ) conCurEle.focus( { focusVisible : true } ); } ); // What: Off Screen Focus Call. Why: The skip link only slides into view once it's focused, and is hovered and pressed there. How: This focuses it, so the rest settle call lets it arrive before its resting look is read.



		await parMovFun( curPagObj ); // What: Pointer Park Call. Why: The resting look is read with nothing hovered. How: This moves the pointer to a clear spot.

		await looHanObj.evaluate( aniFinFun ); // What: Rest Settle Call. Why: Any earlier hover has to finish fading before the resting look is read. How: This waits two frames, then for every finite animation on the element, inside it, and above it to end.


		const resSnaArr = await looHanObj.evaluate( snaEleFun, CON_PRO_ARR ); // What: Rest Snapshot Array. Why: The resting look is what hover is compared with. How: This records the control and everything inside it.


		await looHanObj.hover( { force : true } ); // What: Control Hover Call. Why: Hover feedback is the first thing checked, and the reach check already found the control clear. How: This moves the pointer onto the control, skipping Playwright's own waits, which a sliding skip link could hold up.

		await looHanObj.evaluate( aniFinFun ); // What: Hover Settle Call. Why: The hover look is read once it has eased in. How: This waits two frames, then for every finite animation on the element, inside it, and above it to end.


		const hovSnaArr = await looHanObj.evaluate( snaEleFun, CON_PRO_ARR ); // What: Hover Snapshot Array. Why: The hovered look is compared with rest and with pressed. How: This records it.


		if ( !conFieBoo ) await curPagObj.mouse.down(); // What: Mouse Down Call. Why: A press shows while the button is held, while pressing a text field only focuses it, which the focus read below covers. How: This holds the mouse button down on the control.



		await looHanObj.evaluate( aniFinFun ); // What: Press Settle Call. Why: The pressed look is read once it has eased in. How: This waits two frames, then for every finite animation on the element, inside it, and above it to end.


		const dowSnaArr = await looHanObj.evaluate( snaEleFun, CON_PRO_ARR );                                            // What: Down Snapshot Array. Why: The pressed look is compared with hovered. How: This records it.
		const traDurStr = await looHanObj.evaluate( ( looCurEle ) => getComputedStyle( looCurEle ).transitionDuration ); // What: Transition Duration String. Why: Reduced motion should leave nothing moving. How: This reads the control's transition durations.


		if ( !conFieBoo ) await curPagObj.mouse.up(); // What: Mouse Up Call. Why: The press has to end before the focus is read. How: This releases the button, which does nothing further since clicks are blocked.



		await parMovFun( curPagObj ); // What: Pointer Park Call. Why: The focus look is compared with no hover on it. How: This moves the pointer to a clear spot.

		await conCurObj.evaluate( ( conCurEle ) => { if ( conCurEle instanceof HTMLElement ) conCurEle.blur(); } ); // What: Control Blur Call. Why: The focus look is compared with the control unfocused, and a press or the off screen focus may have focused it. How: This blurs it, so the skip link slides back out.
		await looHanObj.evaluate( aniFinFun );                                                                      // What: Blur Settle Call. Why: The unfocused look is read once the hover and focus have faded. How: This waits two frames, then for every finite animation on the element, inside it, and above it to end.


		const bluSnaArr = await looHanObj.evaluate( snaEleFun, FOC_PRO_ARR ); // What: Blur Snapshot Array. Why: The unfocused look is what focus is compared with. How: This records the control and everything inside it, outline included.


		await conCurObj.evaluate( ( conCurEle ) => { if ( conCurEle instanceof HTMLElement ) conCurEle.focus( { focusVisible : true } ); } ); // What: Keyboard Focus Call. Why: The focus ring shows only for keyboard focus, and a script's focus draws it in every engine only when it asks to show the ring. How: This focuses the control with focusVisible set.
		await looHanObj.evaluate( aniFinFun );                                                                                                // What: Focus Settle Call. Why: The focused look is read once it has eased in. How: This waits two frames, then for every finite animation on the element, inside it, and above it to end.


		const focSnaArr = await looHanObj.evaluate( snaEleFun, FOC_PRO_ARR ); // What: Focus Snapshot Array. Why: The focused look is compared with unfocused. How: This records it.


		await conCurObj.evaluate( ( conCurEle ) => { if ( conCurEle instanceof HTMLElement ) conCurEle.blur(); } ); // What: Control Blur Call. Why: Left focused, the control would keep its ring, or the skip link would stay in view over whatever is probed next. How: This blurs it.


		if ( offScrBoo ) await conCurObj.evaluate( aniFinFun ); // What: Skip Link Exit Wait. Why: A pointer landing on the next control while the skip link still slides out over it would hover the link instead. How: For the control that waited above the screen, this waits two frames, then for its slide back out to end.



		if ( !conFieBoo && !conStiObj.hovBoo && valSigFun( resSnaArr ) === valSigFun( hovSnaArr ) ) proLisArr.push( `${ conDesStr } looks the same hovered` ); // What: Hover Check. Why: A hovered link or button has to respond. How: This records one that doesn't change, leaving out a text field, which has no hover look.



		if ( !conFieBoo && !conStiObj.dowBoo && !labWebBoo && valSigFun( hovSnaArr ) === valSigFun( dowSnaArr ) ) proLisArr.push( `${ conDesStr } looks the same pressed` ); // What: Press Check. Why: A press has to register before anything happens. How: This records a link or button that doesn't change, leaving out a text field, which isn't pressed.



		if ( valSigFun( bluSnaArr ) === valSigFun( focSnaArr ) ) proLisArr.push( `${ conDesStr } looks the same focused` ); // What: Focus Check. Why: A focused control has to show where focus is. How: This records one whose look and ring don't change.



		if ( redMotBoo && traDurStr.split( ',' ).some( ( parDurStr ) => parseFloat( parDurStr ) * ( parDurStr.trim().endsWith( 'ms' ) ? 1 : 1000 ) > MIN_DUR_NUM ) ) proLisArr.push( `${ conDesStr } still transitions under reduced motion (${ traDurStr })` ); // What: Reduced Motion Duration Check. Why: Asking for less motion should stop every transition. How: This records a control with any duration longer than the minimum.



		if ( redMotBoo ) proLisArr.push( ...movProFun( resSnaArr, hovSnaArr, CON_PRO_ARR, conDesStr, 'when hovered' ), ...movProFun( hovSnaArr, dowSnaArr, CON_PRO_ARR, conDesStr, 'when pressed' ), ...movProFun( bluSnaArr, focSnaArr, FOC_PRO_ARR, conDesStr, 'when focused' ) ); // What: Reduced Motion Change Check. Why: Under reduced motion every change should switch at once, inside the control too. How: This records each property that changes while a transition still eases it.

		else proLisArr.push( ...snaProFun( resSnaArr, hovSnaArr, CON_PRO_ARR, conDesStr, 'when hovered' ), ...snaProFun( hovSnaArr, dowSnaArr, CON_PRO_ARR, conDesStr, 'when pressed' ), ...snaProFun( bluSnaArr, focSnaArr, FOC_PRO_ARR, conDesStr, 'when focused' ) ); // What: Snapped Change Check. Why: Every probed property a hover, press, or focus changes should ease rather than snap, the focus ring included. How: This records each one that changes without easing, on the control or anything inside it.


	}



	if ( SKI_STA_ARR.includes( staIdeStr ) && !skiFouBoo ) proLisArr.push( "the skip link isn't probed waiting above the screen" ); // What: Missing Skip Link Check. Why: A skip link that stopped waiting above the screen, or went missing, would let the focus-first branch drop out without failing. How: On the plain tab states, this records a problem when no probed control was the skip link resting above the screen.



	return { notArr : notLisArr, proArr : proLisArr }; // What: Probe Result Return. Why: The test prints the notes and fails on the problems. How: This hands back both lists.


}

// #endregion feeProFun



// #region hovProFun

/**
 * hovProFun = Hover Problems Function
 *
 * @summary
 * Probes the first reachable card and row of each kind that responds to hover
 * without being a control, such as a Today card, and returns a problem for
 * each one that gives no hover feedback. Each is scrolled into view, read at
 * rest with the pointer parked and again while hovered, every look read once
 * its motion has settled, and one that looks the same both ways is a problem,
 * unless {@link stiConFun} finds it still, such as an open row's header.
 * Normally every probed property that changes, on the card or anything inside
 * it, has to be eased ({@link snaProFun}); under reduced motion none of them
 * may ease ({@link movProFun}), while the hover look still has to change.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page to probe.
 * @param redMotBoo - Reduced Motion Boolean: Whether the page is emulating
 *                    reduced motion.
 *
 * @returns A promise that resolves with every hover feedback problem found.
 * @see {@link proLisArr}
 *
 * @example
 * ```ts
 * hovProFun(page, false) // => [] when every card responds
 * ```
 *
*/

async function hovProFun ( curPagObj : Page, redMotBoo : boolean ) : Promise< string[] > {


	const kinHanArr = await kinLisFun( curPagObj, HOV_TAR_STR, 3 ); // What: Kind Handle Array. Why: One reachable card of each kind is probed. How: This collects up to three of each kind to choose from.

	const proLisArr : string[] = []; // What: Problem List Array. Why: Every problem should be reported, not just the first. How: This collects them.


	for ( const kinCurArr of kinHanArr ) { // What: Kind Probe Loop. Why: Every kind of card has to respond to hover. How: This reads the first reachable one of each kind at rest and hovered.


		let tarCurObj : ElementHandle< Element > | null = null; // What: Target Current Object. Why: The kind is probed through the first sample the pointer reaches. How: This holds it, or null when none is reached.


		for ( const samCurObj of kinCurArr ) if ( !tarCurObj && await reaHitFun( samCurObj ) ) tarCurObj = samCurObj; // What: Reachable Sample Loop. Why: A card covered by a bar can't be hovered, while another of its kind may be clear. How: This keeps the first sample the pointer reaches.



		if ( !tarCurObj ) continue; // What: Unreached Kind Guard. Why: A kind the pointer can't reach can't be hovered. How: This moves on.



		const tarDesStr = await tarCurObj.evaluate( ( tarCurEle ) => `${ tarCurEle.tagName.toLowerCase() } "${ ( tarCurEle.textContent || '' ).trim().slice( 0, 30 ) }" (${ ( tarCurEle.getAttribute( 'class' ) || '' ).trim().slice( 0, 40 ) })` ); // What: Target Description String. Why: A problem should name the card a person would recognize. How: This joins its tag with the start of its text and its class list.
		const tarStiObj = await tarCurObj.evaluate( stiConFun, CON_SEL_STR ); // What: Target Still Object. Why: A card whose click does nothing may stay still, per the user's decision of 2026-11-18. How: This reads whether the card may skip its hover look.


		await parMovFun( curPagObj ); // What: Pointer Park Call. Why: The resting look is read with nothing hovered. How: This moves the pointer to a clear spot.

		await tarCurObj.evaluate( aniFinFun ); // What: Rest Settle Call. Why: Any earlier hover has to finish fading before the resting look is read. How: This waits two frames, then for every finite animation on the element, inside it, and above it to end.


		const resSnaArr = await tarCurObj.evaluate( snaEleFun, CON_PRO_ARR ); // What: Rest Snapshot Array. Why: The resting look is what hover is compared with. How: This records the card and everything inside it.



		const tarPoiObj = await tarCurObj.evaluate( ( tarCurEle, conSelStr ) => { // What: Target Point Object. Why: The pointer has to land on the card itself, clear of its rounded corners and of the controls inside it. How: This scans a grid across the card for a spot whose topmost element is inside the card but inside no control, falling back to its center.


			const tarRecObj = tarCurEle.getBoundingClientRect(); // What: Target Rect Object. Why: The grid spans the card's box. How: This reads it.


			for ( const ycoFraNum of [ 0.1, 0.5, 0.9, 0.3, 0.7 ] ) for ( const xcoFraNum of [ 0.5, 0.1, 0.9, 0.3, 0.7 ] ) { // What: Grid Scan Loop. Why: A card's free space sits in different places from card to card. How: This tries each fraction of its height and width in turn.


				const hitCurEle = document.elementFromPoint( tarRecObj.left + tarRecObj.width * xcoFraNum, tarRecObj.top + tarRecObj.height * ycoFraNum ); // What: Hit Current Element. Why: The pointer lands on whatever is topmost. How: This reads the element at the spot.


				if ( hitCurEle && tarCurEle.contains( hitCurEle ) && !hitCurEle.closest( conSelStr ) ) return { x : tarRecObj.width * xcoFraNum, y : tarRecObj.height * ycoFraNum }; // What: Clear Spot Return. Why: A spot on the card but on no control hovers just the card. How: This returns the spot, measured from the card's corner.


			}



			return { x : tarRecObj.width / 2, y : tarRecObj.height / 2 }; // What: Center Fallback Return. Why: A card covered in controls still has to be hovered somewhere. How: This returns its center.


		}, CON_SEL_STR ); // What: Control Selector Argument. Why: The page function can't read this file's constants. How: This hands it the selector that matches controls.


		await tarCurObj.hover( { force : true, position : tarPoiObj } ); // What: Target Hover Call. Why: Hover is the one interaction a card has. How: This moves the pointer onto the clear spot on the card.

		await tarCurObj.evaluate( aniFinFun ); // What: Hover Settle Call. Why: The hover look is read once it has eased in. How: This waits two frames, then for every finite animation on the element, inside it, and above it to end.


		const hovSnaArr = await tarCurObj.evaluate( snaEleFun, CON_PRO_ARR ); // What: Hover Snapshot Array. Why: The hovered look is compared with rest. How: This records it.


		if ( !tarStiObj.hovBoo && valSigFun( resSnaArr ) === valSigFun( hovSnaArr ) ) proLisArr.push( `${ tarDesStr } looks the same hovered` ); // What: Hover Check. Why: A hovered card has to respond, under reduced motion too. How: This records one that doesn't change.



		if ( redMotBoo ) proLisArr.push( ...movProFun( resSnaArr, hovSnaArr, CON_PRO_ARR, tarDesStr, 'when hovered' ) ); // What: Reduced Motion Change Check. Why: Under reduced motion a card's hover changes, such as its lift, should switch at once. How: This records each property that changes while a transition still eases it.

		else proLisArr.push( ...snaProFun( resSnaArr, hovSnaArr, CON_PRO_ARR, tarDesStr, 'when hovered' ) ); // What: Snapped Change Check. Why: A hover change, such as the lift, should ease rather than snap. How: This records each property that changes without easing, on the card or anything inside it.


	}



	return proLisArr; // What: Problem List Return. Why: The test prints whatever was found. How: This hands back every problem collected.


}

// #endregion hovProFun



// #region togProFun

/**
 * togProFun = Toggle Problems Function
 *
 * @summary
 * Flips the first reachable element of each kind listed in {@link
 * TOG_TAR_ARR} and returns a problem for each one that gives no feedback.
 * The pointer is parked, and each element is scrolled into view, marked off,
 * read, marked on, read again, marked off, and read a third time, every look
 * read once its motion has settled, then left as the page had it. An element
 * that looks the same off and on is a problem. Normally every probed property
 * that changes either way, on the element or anything inside it, has to be
 * eased ({@link snaProFun}); under reduced motion none of them may ease
 * ({@link movProFun}). A kind that flips nothing in a state its row names is
 * a problem too, so the check can't pass by quietly losing one.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page to probe.
 * @param staIdeStr - State Identifier String: The state's name, which each
 *                    row's states are checked against.
 * @param redMotBoo - Reduced Motion Boolean: Whether the page is emulating
 *                    reduced motion.
 *
 * @returns A promise that resolves with every toggle feedback problem found.
 * @see {@link proLisArr}
 *
 * @example
 * ```ts
 * togProFun(page, 'settings-phone', false) // => [] when every toggle eases
 * ```
 *
*/

async function togProFun ( curPagObj : Page, staIdeStr : string, redMotBoo : boolean ) : Promise< string[] > {


	const proLisArr : string[] = []; // What: Problem List Array. Why: Every problem should be reported, not just the first. How: This collects them.


	for ( const togTarObj of TOG_TAR_ARR ) { // What: Toggle Kind Loop. Why: Every switched state has to show and ease. How: This flips the first reachable element of each kind off, on, and off again.


		const togCurObj = ( await kinLisFun( curPagObj, togTarObj.selStr, 1 ) ).flat()[ 0 ]; // What: Toggle Current Object. Why: One element stands for its kind. How: This takes the first reachable one, or undefined when none is.


		if ( !togCurObj ) { if ( togTarObj.staArr.includes( staIdeStr ) ) proLisArr.push( `${ togTarObj.selStr } flips nothing` ); continue; } // What: Missing Kind Guard. Why: A kind that stopped matching, such as after a class rename, would otherwise drop out without failing. How: This records a problem when the row names this state, and moves on.



		const oriValStr = await togCurObj.getAttribute( togTarObj.attStr ); // What: Original Value String. Why: The element is left as the page had it. How: This reads the attribute's value, or null when it's absent.
		const togDesStr = await togCurObj.evaluate( ( togCurEle ) => `${ togCurEle.tagName.toLowerCase() } "${ ( togCurEle.getAttribute( 'aria-label' ) || togCurEle.textContent || '' ).trim().slice( 0, 30 ) }"` ); // What: Toggle Description String. Why: A problem should name the element a person would recognize. How: This joins its tag with its label or the start of its text.


		await togCurObj.evaluate( ( togCurEle ) => togCurEle.scrollIntoView( { block : 'center', inline : 'center' } ) ); // What: Toggle Scroll Call. Why: An element's look is read on screen. How: This scrolls it to the middle of its scrollers.

		await parMovFun( curPagObj ); // What: Pointer Park Call. Why: The state's look is read with nothing hovered. How: This moves the pointer to a clear spot.

		await attSetFun( togCurObj, togTarObj.attStr, togTarObj.inaStr ); // What: Off Set Call. Why: The state is read switching on from off. How: This marks it off.

		await togCurObj.evaluate( aniFinFun ); // What: Off Settle Call. Why: Any earlier look has to finish fading. How: This waits two frames, then for every finite animation on the element, inside it, and above it to end.


		const inaSnaArr = await togCurObj.evaluate( snaEleFun, FOC_PRO_ARR ); // What: Inactive Snapshot Array. Why: The off look is what the on look is compared with. How: This records the element and everything inside it.


		await attSetFun( togCurObj, togTarObj.attStr, togTarObj.actStr ); // What: On Set Call. Why: Switching the state on is the change checked first. How: This marks it on.

		await togCurObj.evaluate( aniFinFun ); // What: On Settle Call. Why: The on look is read once it has eased in. How: This waits two frames, then for every finite animation on the element, inside it, and above it to end.


		const actSnaArr = await togCurObj.evaluate( snaEleFun, FOC_PRO_ARR ); // What: Active Snapshot Array. Why: The on look is compared with off both ways. How: This records it.


		await attSetFun( togCurObj, togTarObj.attStr, togTarObj.inaStr ); // What: Off Again Set Call. Why: Switching the state off has to ease too. How: This marks it off again.

		await togCurObj.evaluate( aniFinFun ); // What: Off Again Settle Call. Why: The off look is read once it has eased out. How: This waits two frames, then for every finite animation on the element, inside it, and above it to end.


		const retSnaArr = await togCurObj.evaluate( snaEleFun, FOC_PRO_ARR ); // What: Return Snapshot Array. Why: The look switched back off is compared with on. How: This records it.


		await attSetFun( togCurObj, togTarObj.attStr, oriValStr ); // What: Original Set Call. Why: The next element is read on the page as it was. How: This puts the attribute back as the page had it.

		await togCurObj.evaluate( aniFinFun ); // What: Original Settle Call. Why: The next kind's resting look shouldn't catch this one mid-fade. How: This waits two frames, then for every finite animation on the element, inside it, and above it to end.



		if ( valSigFun( inaSnaArr ) === valSigFun( actSnaArr ) ) proLisArr.push( `${ togDesStr } (${ togTarObj.attStr }) looks the same toggled on` ); // What: Toggle Check. Why: A switched state has to show. How: This records an element that doesn't change.



		if ( redMotBoo ) proLisArr.push( ...movProFun( inaSnaArr, actSnaArr, FOC_PRO_ARR, togDesStr, 'when toggled on' ), ...movProFun( actSnaArr, retSnaArr, FOC_PRO_ARR, togDesStr, 'when toggled off' ) ); // What: Reduced Motion Check. Why: Asking for less motion should switch a state at once. How: This records each property that changes while a transition still eases it, both ways.

		else proLisArr.push( ...snaProFun( inaSnaArr, actSnaArr, FOC_PRO_ARR, togDesStr, 'when toggled on' ), ...snaProFun( actSnaArr, retSnaArr, FOC_PRO_ARR, togDesStr, 'when toggled off' ) ); // What: Snapped Change Check. Why: A state switching on or off should ease rather than snap. How: This records each property that changes without easing, both ways.


	}



	return proLisArr; // What: Problem List Return. Why: The test prints whatever was found. How: This hands back every problem collected.


}

// #endregion togProFun

// #endregion Helpers



// #region Module Init

test.describe.configure( { mode : 'parallel' } ); // What: Parallel Mode Call. Why: Each test opens its own state in its own page, so none depends on another, and run in sequence this file alone would set the pace of the whole suite. How: This lets the file's tests spread across the workers.



for ( const redMotBoo of [ false, true ] ) for ( const staRcdObj of FEE_STA_ARR ) { // What: State Test Loop. Why: Every state is checked with motion and again under reduced motion. How: This declares one test per state and motion setting.


	test( `${ staRcdObj.ideStr } gives each kind of control hover, press, and focus feedback, and each toggle its switch${ redMotBoo ? ', without motion under reduced motion' : '' }`, async ( { page : curPagObj } ) => { // What: Feedback Test. Why: Every interaction should visibly register, and still register without moving for someone who asked for less motion. How: This opens the state, blocks clicks, flips each toggle kind, probes each kind of control and hover card, and checks it finds no problems.


		// #region Probe Setup

		test.setTimeout( 600000 ); // What: Test Timeout Call. Why: Probing each kind's hover, press, focus, and toggles waits out each look's motion, which adds up across a slow engine. How: This gives the test ten minutes.


		if ( redMotBoo ) await curPagObj.emulateMedia( { reducedMotion : 'reduce' } ); // What: Reduced Motion Emulation. Why: The preference has to be set before the page loads. How: On the reduced-motion pass, this makes the page match prefers-reduced-motion: reduce.



		await opeStaFun( curPagObj, staRcdObj ); // What: State Open Call. Why: The controls are probed with the state settled. How: This loads and settles it.

		await curPagObj.evaluate( cliBloFun ); // What: Click Block Call. Why: Pressing a control shouldn't run its action. How: This cancels every click from here on.

		// #endregion Probe Setup



		// #region Probe Runs

		const togProArr = await togProFun( curPagObj, staRcdObj.ideStr, redMotBoo ); // What: Toggle Problem Array. Why: Every switched state has to show and ease. How: This flips the toggles first, since probing the controls moves focus and the pointer, which can close what a toggle shows.
		const feeResObj = await feeProFun( curPagObj, staRcdObj.ideStr, redMotBoo ); // What: Feedback Result Object. Why: Every kind of control has to respond. How: This probes them, collecting problems and notes.
		const hovProArr = await hovProFun( curPagObj, redMotBoo );                   // What: Hover Problem Array. Why: The cards and rows that respond to hover are checked too. How: This probes them.

		// #endregion Probe Runs



		// #region Probe Reporting

		for ( const notCurStr of feeResObj.notArr ) test.info().annotations.push( { description : notCurStr, type : 'unreached' } ); // What: Note Record Loop. Why: A kind the pointer couldn't reach should be visible in the report without failing the test. How: This adds each note as an annotation.



		expect( [ ...togProArr, ...feeResObj.proArr, ...hovProArr ] ).toEqual( [] ); // What: No Feedback Problems Assertion. Why: The state passes only when every probe finds nothing. How: This compares the problems with an empty list, so a failure prints each one.

		// #endregion Probe Reporting


	} );


}

// #endregion Module Init


