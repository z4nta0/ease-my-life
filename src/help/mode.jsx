


// #region Imports

import cssModObj from './mode.module.css'; // What: CSS Module Object. Why: The help-mode overlay and the navigation tip's per-tab blocks are styled from their own module. How: This maps each class name in mode.module.css to its hashed module class.
import React     from 'react';             // What: React. Why: HelOveCom is built directly on React's own APIs. How: This is used directly (React.useCallback, React.useEffect, React.useMemo, React.useState) instead of importing individual named hooks.


import { badRecFun    } from './geometry.js';      // What: Badge Rect Function. Why: Each highlighted target's badge is positioned against its own rect. How: This is called once per highlighted target.
import { claPadFun    } from './geometry.js';      // What: Clamp Pad Function. Why: A highlight's padding must not spill past nearby app chrome. How: This is called once per highlighted target.
import { cliChrFun    } from './geometry.js';      // What: Clip Chrome Function. Why: A highlight must not paint over fixed app chrome above it. How: This is called once per highlighted target.
import { cliHorFun    } from './geometry.js';      // What: Clip Horizontal Function. Why: A highlight inside a horizontal scroller must stop at the scroller's own visible edges. How: This is called once per measured target.
import { createPortal } from 'react-dom';          // What: Create Portal. Why: The dim layer, highlight spots, badges and the open tip must render into <body> so they clamp to the viewport instead of being clipped by an ancestor's own overflow. How: This is called with HelOveCom's own JSX and document.body inside its return.
import { detEdgFun    } from './geometry.js';      // What: Detect Edge Function. Why: A clipped highlight needs to know which of its edges touch chrome. How: This is called once per clipped target.
import { finTarFun    } from './geometry.js';      // What: Find Target Function. Why: Each help item names its target by selector, which may match several elements. How: This is called once per help item.
import { HelTipCom    } from './tooltip.jsx';      // What: Help Tip Component. Why: A clicked badge reveals its own target's tip. How: This is rendered once for the open help item, given its target rect and item.
import { IcoSvgCom    } from '../ui/icon.jsx';     // What: Icon Svg Component. Why: The navigation help item's own bodEle renders each tab's real nav icon next to its label. How: This is rendered once per tab entry inside NAV_HEL_OBJ's own bodEle JSX.
import { rhyPxlFun    } from '../utils/rhythm.js'; // What: Rhythm Pixel Function. Why: Pixel layout math here needs the same step sizes the stylesheet uses. How: This returns a vertical rhythm step in pixels at the current root font size.
import { shaRadFun    } from './geometry.js';      // What: Shape Radius Function. Why: Each highlight cutout roughly matches its own target's border radius. How: This is called once per highlighted target.
import { uniRecFun    } from './geometry.js';      // What: Union Rect Function. Why: A help item covering several elements highlights them as one box. How: This is called once per multi-element help item.

// #endregion Imports



/**
 * mode.jsx = Mode
 *
 * @summary
 * On-demand "help mode": a per-page toggle that, once on, simultaneously
 * highlights every tagged element on the CURRENT page with a small
 * corner badge; clicking a badge reveals that element's tip (title plus
 * body, no Step N of N / Skip / Back / Next; see
 * onboarding/tour-runner.jsx for that, a genuinely different engine).
 * Deliberately not built on top of GuiTouCom, since that engine is
 * sequential/single-spotlight and its dimming trick (one element's own
 * box-shadow spread darkening everything outside it) does not compose
 * for "many holes at once". This instead paints a single SVG mask (a
 * full-viewport white rect, plus one black rounded-rect per highlighted
 * target) so arbitrarily many cutouts coexist in one dim layer, each
 * shaped to roughly match its own target's own border-radius rather
 * than always being a plain square. What does carry over from the tour
 * is reusing its exact coach visual language (.ob-coach and its arrow)
 * for the tip itself, per the design conversation this was built from;
 * the only difference is the tip's own content (no nav chrome) and how
 * it is triggered (click a badge, not "the current tour step").
 *
 * Ownership: the parent (each tab component) owns the on/off boolean as
 * plain local state and renders both HelButCom (button.jsx, a
 * controlled toggle) and HelOveCom from it, deliberately not a global bus like
 * emlTouObj. Since this app renders exactly one tab's component tree
 * at a time (no router, see CLAUDE.md), that local state resets to its
 * default (off) every time a tab unmounts and remounts, which is
 * exactly the "navigating away closes any open highlights, and the
 * page you land on does not auto-open its own" behavior this was
 * designed to have, for free, with no explicit reset needed.
 *
 * Sections:
 *  - Constants
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const NAV_TAB_ARR = [ // What: Nav Tab Array. Why: The shared nav tip describes each of the 5 tabs in the same icon/label/description form. How: NAV_HEL_OBJ's own bodEle maps every row to one help-nav-item block.


	{ icoStr : 'today',    labStr : 'Today',    desStr : 'This is the main page of the app and contains your auto-generated daily todo list.' }, // What: Today Tab Row. Why: This describes the Today tab inside the shared nav tip. How: The map below renders its icon, label and description.
	{ icoStr : 'picker',   labStr : 'Pickers',  desStr : 'This is where you can manually run a picker to generate a task and then push it to the Today page\'s todo list. This is also where you can create new pickers and their items.' }, // What: Pickers Tab Row. Why: This describes the Pickers tab inside the shared nav tip. How: The map below renders its icon, label and description.
	{ icoStr : 'stats',    labStr : 'Stats',    desStr : 'This is where you can view all of the statistics for everything that you have created. That includes conditionals, reminder items, pickers and picker items. You can see how many times an item has been picked, items\' pick frequency, and much more.' }, // What: Stats Tab Row. Why: This describes the Stats tab inside the shared nav tip. How: The map below renders its icon, label and description.
	{ icoStr : 'data',     labStr : 'Data',     desStr : 'This is where you can view and edit everything that you have created. You can also create new conditionals, new reminders items and new picker items.' }, // What: Data Tab Row. Why: This describes the Data tab inside the shared nav tip. How: The map below renders its icon, label and description.
	{ icoStr : 'settings', labStr : 'Settings', desStr : 'This is where you can customize the app, adjust the daily generator, edit which holidays are observed, control your data, install the app, get app information and view legal documents.' } // What: Settings Tab Row. Why: This describes the Settings tab inside the shared nav tip. How: The map below renders its icon, label and description.


];



// #region NAV_HEL_OBJ

/**
 * NAV_HEL_OBJ = Nav Help Object
 *
 * @summary
 * Always included ahead of whatever page-specific items are passed into
 * HelOveCom, since every page shares the same bottom/side nav, and it was
 * flagged as a real point of user confusion (icon-only on mobile, no label)
 * worth explaining everywhere rather than something each page's own catalog
 * has to remember to add. One shared badge/tip covers the whole bar rather
 * than one per button, the same reasoning behind clustering e.g. a card's
 * Re-roll/Skip/Edit under one badge.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const NAV_HEL_OBJ = { // What: Nav Help Object. Why: Every page shares the same nav, so its own help item is defined once here. How: HelOveCom prepends this ahead of every page's own catalog.


	absStr    : ':is([data-placement="side"], [data-placement="top"]) > [data-element-name-hook~="appTabNav"]', // What: Always-Below-Selector String. Why: On 'side' placement the target can span most of the viewport's height, and on 'top' the fits-below check can flip to above on a short viewport and cover the navbar entirely. How: HelOveCom sets alwBelBoo whenever this selector matches, so plaTipFun always places the tip below.
	ideStr    : '__nav',                                                                                        // What: Identifier String. Why: This is the item's own unique key. How: HelOveCom compares it against its own open-id state to track which tip is open.
	mtwBoo    : true,                                                                                           // What: Match-Target-Width Boolean. Why: This tip's own content grew to several paragraphs, and the usual fixed 280px width read too cramped. How: HelTipCom sizes the tip to the width mwsStr measures.
	mwsStr    : '[data-element-name-hook~="appTabNav"]',                                                        // What: Match-Width-Selector String. Why: The tip should be as wide as the navbar itself. How: HelOveCom measures this element's own width on 'bottom' placement.
	padYcoNum : 7,                                                                                              // What: Pad Y-Coordinate Number. Why: The highlight should sit flush with the tab bar's own outer edge on 'bottom' placement. How: This overrides the flat vertical pad.
	scrBoo    : true,                                                                                           // What: Scroll Boolean. Why: On 'side' placement the target can span most of the viewport's own height. How: HelTipCom caps the body to the room plaTipFun found and scrolls past it.
	selStr    : '[data-tab]',                                                                                   // What: Selector String. Why: Every nav button shares one badge and one tip. How: finTarFun matches all five tab buttons, which HelOveCom unions into one highlight.
	titStr    : 'Navigation',                                                                                   // What: Title String. Why: This is the tip's own heading text. How: HelTipCom renders it as the tip's title.

	bodEle : ( // What: Body Element. Why: This is NAV_HEL_OBJ's own tip content, one column per tab. How: This maps NAV_TAB_ARR, reusing each tab's own real nav icon so it can never drift from the real button.


		<>{ /* What: Nav Tip Fragment. Why: The tip body is several sibling blocks with no wrapper of its own. How: This groups one help-nav-item per NAV_TAB_ARR row. */ }


			{ NAV_TAB_ARR.map( ( curTabObj ) => ( // What: Tab Row Map. Why: Each tab row renders the same icon/label/description block. How: This maps every NAV_TAB_ARR row to a help-nav-item div.


				<div
					key={ curTabObj.icoStr }

					className={ cssModObj.helpNavItem }
				>{ /* What: Help Nav Item Div Element. Why: Each tab gets its own icon/label/description block inside the shared nav tip. How: This renders curTabObj's own icon and label on one line, its description below. */ }


					<div className={ cssModObj.helpNavLabel }><IcoSvgCom icoNamStr={ curTabObj.icoStr } sizSteStr='bas' /><b>{ curTabObj.labStr }:</b></div>{ /* What: Help Nav Label Div Element. Why: The tab's own real icon glyph next to its label lets a reader match this entry to the real button. How: This renders IcoSvgCom with curTabObj.icoStr alongside curTabObj.labStr in bold. */ }{ /* Vertical Rhythm Base ~= 14.572px */ }

					<p>{ curTabObj.desStr }</p>{ /* What: Help Nav Description Paragraph Element. Why: This is the actual explanatory text for this tab. How: This renders curTabObj.desStr as plain text. */ }


				</div>


			) ) }


		</>


	),

	shaStr : ( padWidNum, padHeiNum ) => { // What: Shape String. Why: A multi-element union like the nav bar has no single source element's own border-radius to read. How: This computes a true-pill radius only once the box is meaningfully elongated, matching 'bottom'/'top' placement but not 'side'.


		const shoPilNum = Math.min( padWidNum, padHeiNum );                                // What: Short Pill Number. Why: The elongation check and the pill radius itself both need to know which dimension is smaller. How: This takes the smaller of padWidNum/padHeiNum.
		const lonPilNum = Math.max( padWidNum, padHeiNum );                                // What: Long Pill Number. Why: The elongation check needs the larger dimension to compare against shoPilNum. How: This takes the larger of padWidNum/padHeiNum.
		const radPilNum = lonPilNum / shoPilNum >= 2 ? shoPilNum / 2 : rhyPxlFun( 'm01' ); // What: Radius Pill Number. Why: Only a box at least twice as long as it is short reads correctly as a true pill; a nearly-square union (the 'side' stack) would otherwise round into a circle/oval. How: This picks half of shoPilNum once elongated enough, otherwise the app's own default radius. // Vertical Rhythm Base Minus 1 ~= 11.000px



		return { radXcoNum : radPilNum, radYcoNum : radPilNum }; // What: Pill Radius Return. Why: The caller needs both radii in the same { radXcoNum, radYcoNum } shape every other shape source in this file already returns. How: This returns radPilNum for both axes, since a pill radius is always equal on both.


	}


};

// #endregion NAV_HEL_OBJ



// #region RAI_HAN_OBJ

/**
 * RAI_HAN_OBJ = Rail Handle Object
 *
 * @summary
 * The rail's own pull handle only exists in the DOM (finTarFun's own
 * width/height check filters out anything else) on 'side' tab-bar
 * placement's narrow/drawer breakpoint, so this naturally shows up
 * only there without needing its own placement check the way
 * NAV_HEL_OBJ's absStr does. This gets its own separate item
 * (not folded into NAV_HEL_OBJ) since it is a single real button with
 * a single description, not one of the 5 nav tabs.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const RAI_HAN_OBJ = { // What: Rail Handle Object. Why: The side rail's own pull handle needs its own help item on every page. How: HelOveCom prepends this ahead of every page's own catalog, right after NAV_HEL_OBJ.


	ideStr : '__railHandle',                          // What: Identifier String. Why: This is the item's own unique key. How: HelOveCom compares it against its own open-id state to track which tip is open.
	selStr : '[data-element-name-hook~="raiHanBut"]', // What: Selector String. Why: The handle is a single real button. How: finTarFun matches it only while the drawer breakpoint renders it.
	titStr : 'Sidebar Toggle',                        // What: Title String. Why: This is the tip's own heading text. How: HelTipCom renders it as the tip's title.

	bodEle : <>This button will open the app's navigation, allowing you to navigate to the app's other pages.</> // What: Body Element. Why: This is the tip's own explanatory text. How: HelTipCom renders it as the tip's body.


};

// #endregion RAI_HAN_OBJ

// #endregion Constants



// #region Components

// #region HelOveCom

/**
 * HelOveCom = Help Overlay Component
 *
 * @summary
 * helIteArr is [{ bodEle, ideStr, selStr, titStr, ... }], where selStr
 * follows the guided tour's own comma-fallback convention and can
 * match several elements at once, the same way a tour step's selStr
 * can; the whole group shares one badge and one tip, positioned off
 * their combined union, the same "union of matched elements" idea
 * {@link uniRecFun} uses. onCloAllFun fires when the user asks to leave
 * help mode entirely (Escape with no tip open, or a second Escape
 * after one closes), since the parent is the one that actually flips
 * its own active state back off in response.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actModBoo   - Active Mode Boolean: Whether help mode is
 *                            currently on for this page.
 * @param props.helIteArr   - Help Item Array: The page-specific catalog of
 *                            help items; {@link NAV_HEL_OBJ} and {@link
 *                            RAI_HAN_OBJ} are always prepended ahead of these.
 * @param props.onCloAllFun - On Close All Function: Called once help mode
 *                            itself should close entirely, as opposed to just
 *                            closing one open tip.
 *
 * @returns The whole overlay (dim layer, highlight spots, badges, and
 * at most one open tip), portaled to document.body, or null while
 * inactive.
 *
 * @example
 * ```tsx
 * HelOveCom({ actModBoo, helIteArr, onCloAllFun }) // => <HelOveCom />
 * ```
 *
*/

function HelOveCom ( { actModBoo, helIteArr, onCloAllFun } ) {


	const allIteArr                   = React.useMemo( () => [ NAV_HEL_OBJ, RAI_HAN_OBJ, ...helIteArr ], [ helIteArr ] ); // What: All Items Array And Memo. Why: The nav item and rail handle item are shared by every page, ahead of whatever page-specific items the caller passed. How: This concatenates the 2 shared items ahead of helIteArr, recomputed only when helIteArr itself changes.
	const [ recMapObj, setRecMapObj ] = React.useState( {} );                                                             // What: Rect Map Object And Setter. Why: Every tagged element's own current rect (keyed by its own catalog id) drives the whole rendered overlay. How: This starts empty and is written wholesale by recTarFun below on every animation frame while actModBoo.
	const [ opeIdeStr, setOpeIdeStr ] = React.useState( null );                                                           // What: Open Identifier String And Setter. Why: At most one tip can be open at a time, tracked by its own (possibly mulBoo-suffixed) id. How: This starts null (no tip open) and is toggled by a badge's own onClick below.
	const [ togRecObj, setTogRecObj ] = React.useState( null );                                                           // What: Toggle Rect Object And Setter. Why: The page's own help toggle button needs a mask cutout too, even though it is never one of allIteArr. How: This is written by recTarFun below whenever a .help-btn is found on the page.



	const recTarFun = React.useCallback( () => { // What: Recompute Target Function. Why: Every tagged element's own rect must be recomputed every frame while active, to stay correct under scrolling/reflow, and also right after a click that could have changed the DOM. How: This rebuilds the whole rect map from scratch and writes it via setRecMapObj.


		const nexMapObj = {}; // What: Next Map Object. Why: The whole rect map is rebuilt from scratch every call rather than patched incrementally. How: This starts empty and is filled in by the loops below before being committed via setRecMapObj.


		const chrSelArr = [ // What: Chrome Selector Array. Why: These are the only pieces of always-on-top chrome any highlight ever needs clipping against; the tab bar alone varies its own edge at runtime. How: This is mapped into real chrome items below.


			[ '[data-element-name-hook~="todPagHea"]', 'top'  ], // What: Today Header Entry. Why: The Today header stays pinned above the scrolling list. How: This pairs its hook selector with the edge a highlight is clipped against.
			[ '[data-element-name-hook~="groRaiAsi"]', 'top'  ], // What: Group Rail Entry. Why: The Today group rail stays pinned above the scrolling list. How: This pairs its hook selector with the edge a highlight is clipped against.
			[ '[data-element-name-hook~="setRaiAsi"]', 'top'  ], // What: Settings Rail Entry. Why: The Settings section rail stays pinned above the scrolling page. How: This pairs its hook selector with the edge a highlight is clipped against.
			[ '[data-element-name-hook~="appTabNav"]', 'auto' ], // What: Tab Bar Entry. Why: The tab bar's own clipped edge depends on its placement. How: This pairs its hook selector with the edge a highlight is clipped against.
			[ '[data-element-name-hook~="ediBanDiv"]', 'top'  ]  // What: Edit Mode Banner Entry. Why: The Edit Mode banner stays pinned above the scrolling list. How: This pairs its hook selector with the edge a highlight is clipped against.


		];


		const chrMatArr = chrSelArr // What: Chrome Match Array. Why: Only chrome that actually exists on the current page (e.g. the Settings rail only on Settings) should ever be clipped against. How: This looks each selector up once per frame and drops any that found nothing.
			.map( ( [ chrSelStr, chrSidStr ] ) => { // What: Chrome Lookup Callback. Why: Each chrome selector needs its own live element found before it can be measured. How: This queries chrSelStr once and wraps the result with its own selector and side, or null when nothing matched.


				const chrDomEle = document.querySelector( chrSelStr ); // What: Chrome Document-Object-Model Element. Why: The chrome item's own live element is what later gets measured and compared against targets. How: This queries chrSelStr once.



				return chrDomEle ? { chrDomEle, chrSelStr, chrSidStr } : null; // What: Chrome Match Return. Why: A selector that matched nothing must drop out in the filter below. How: This returns the wrapped match, or null.


			} )
			.filter( Boolean ); // What: Missing Chrome Filter. Why: Chrome absent from this page must never be clipped against. How: This drops every null from the map above.

		const chrIteArr = chrMatArr // What: Chrome Item Array. Why: cliChrFun needs each chrome item's own real rect and resolved side, not just its selector. How: This measures every matched chrome element and resolves 'auto' via detEdgFun, since only the tab bar's own placement varies at runtime.
			.map( ( { chrDomEle, chrSelStr, chrSidStr } ) => { // What: Chrome Measure Callback. Why: Each matched chrome element needs its own live rect and a concrete side. How: This measures chrDomEle and resolves an 'auto' side from that rect.


				const chrRecObj = chrDomEle.getBoundingClientRect(); // What: Chrome Rect Object. Why: Both the side detection and every later clip read this chrome item's own real rect. How: This reads chrDomEle's own bounding rect.



				return { // What: Chrome Item Return. Why: cliChrFun reads every one of these fields per chrome item. How: This carries the element, rect and selector through, resolving the side.


					chrDomEle,                                                           // What: Chrome Document-Object-Model Element. Why: cliChrFun checks whether a target sits inside this element. How: This passes the matched element through unchanged.
					chrRecObj,                                                           // What: Chrome Rect Object. Why: cliChrFun clips targets against this rect. How: This passes the rect measured above.
					chrSelStr,                                                           // What: Chrome Selector String. Why: cliChrFun looks this selector up in CHR_PRI_OBJ. How: This passes the selector through unchanged.
					chrSidStr : chrSidStr === 'auto' ? detEdgFun( chrRecObj ) : chrSidStr // What: Chrome Side String. Why: Only the tab bar's own side varies at runtime. How: This resolves 'auto' via detEdgFun, otherwise keeps the fixed side.


				};


			} )
			.filter( ( chrIteObj ) => chrIteObj.chrSidStr ); // What: Sided Chrome Filter. Why: A chrome item with no resolved side has no direction to clip in. How: This keeps only items whose own chrSidStr is set.



		allIteArr.forEach( ( curIteObj ) => { // What: Item Rect Loop. Why: Every catalog item's own current rect must be measured fresh this frame. How: This walks allIteArr, branching on mulBoo/feoBoo before falling through to the ordinary single-union case.


			let tarEleArr = finTarFun( curIteObj.selStr ); // What: Target Element Array. Why: A catalog item's own selector might currently match nothing at all (e.g. a conditional row that is not rendered right now). How: This runs curIteObj's own selStr through finTarFun.


			if ( !tarEleArr.length ) return; // What: No Match Guard. Why: An item with no currently-matched elements has nothing to highlight this frame. How: This skips the rest of this iteration once tarEleArr is empty.



			if ( curIteObj.mulBoo ) { // What: Per Element Branch. Why: Some items (every group's own Log button, every card's own actions) need one badge per matched element instead of unioning them into one. How: This gives each matched element its own synthesized sub-id and its own independently-clipped rect.


				tarEleArr.forEach( ( curTarEle, curIndNum ) => { // What: Per Element Loop. Why: Every one of this item's own matched elements needs its own rect computed and stored under its own sub-id. How: This walks tarEleArr, writing one nexMapObj entry per element.


					let tarRecObj = cliHorFun( curTarEle.getBoundingClientRect(), curTarEle ); // What: Target Rect Object. Why: A scrolled-out-of-view instance (e.g. a card off the bottom of a scrollable list) must not draw a bogus highlight. How: This runs curTarEle's own bounding rect through cliHorFun.


					if ( !tarRecObj ) return; // What: Fully Clipped Guard. Why: An element clipped away entirely has nothing to highlight. How: This skips this element once cliHorFun returned null.



					tarRecObj = cliChrFun( tarRecObj, chrIteArr, [ curTarEle ] ); // What: Chrome Clipped Rect. Why: This one element must also stay clear of any chrome it is not itself part of. How: This runs tarRecObj back through cliChrFun, exempting only the chrome curTarEle is a member of.



					if ( !tarRecObj ) return; // What: Fully Clipped Guard. Why: An element clipped away by chrome has nothing to highlight. How: This skips this element once cliChrFun returned null.



					const eleWidNum = tarRecObj.right - tarRecObj.left; // What: Element Width Number. Why: The shape/pad math below both need this element's own final width. How: This subtracts tarRecObj's own left from its right.
					const eleHeiNum = tarRecObj.bottom - tarRecObj.top; // What: Element Height Number. Why: The shape/pad math below both need this element's own final height. How: This subtracts tarRecObj's own top from its bottom.


					if ( !Number.isFinite( eleWidNum ) || !Number.isFinite( eleHeiNum ) ) return; // What: Finite Guard. Why: A degenerate rect must never reach the SVG mask below as an Infinity-valued rect. How: This skips this element once either dimension is not a finite number.



					const shaRadObj = shaRadFun( curTarEle, eleWidNum + rhyPxlFun( 'm02' ) * 2, eleHeiNum + rhyPxlFun( 'm02' ) * 2, curIteObj.shaStr ); // What: Shape Radius Object. Why: Each mulBoo instance reads its own border-radius independently. How: This calls shaRadFun with curTarEle's own padded box size. // Vertical Rhythm Base Minus 2 ~= 8.304px

					const curLabStr = curIteObj.labStr // What: Current Label String. Why: A mulBoo conditional/reminder/item row's own title should read as "{its own name} Conditional" rather than one generic title shared by every instance. How: This reads text (or an input's own value, for a row currently open/editing) from within curTarEle only, when curIteObj.labStr is set.
						? ( curTarEle.querySelector( curIteObj.labStr )?.textContent || curTarEle.querySelector( curIteObj.labStr )?.value ) // What: Live Label Read. Why: A row's own name is its text, or an input's value while it is being edited. How: This queries labStr inside curTarEle and reads either.
						: undefined;                                                                                                         // What: No Label Fallback. Why: An item without labStr has no per-row name. How: This leaves the label undefined.

					const padSurObj = claPadFun( tarRecObj, curIteObj.padXcoNum ?? rhyPxlFun( 'm02' ), curIteObj.padYcoNum ?? rhyPxlFun( 'm02' ), chrIteArr, [ curTarEle ] ); // What: Pad Surviving Object. Why: This element's own surviving per-side padding must be computed the same way as the ordinary single-union case below. How: This calls claPadFun with curIteObj's own padXcoNum/padYcoNum override, or the flat default. // Vertical Rhythm Base Minus 2 ~= 8.304px


					nexMapObj[ `${ curIteObj.ideStr }::${ curIndNum }` ] = { // What: Sub Identifier Map Write. Why: Each mulBoo instance is stored under its own synthesized sub-id, all sharing the parent item's own titStr/bodEle when opened. How: This writes the merged rect/shape/pad/label into nexMapObj.


						...tarRecObj, // What: Clipped Rect Spread. Why: The entry starts from this element's own clipped edges. How: This spreads tarRecObj's own top/left/right/bottom in first.

						height : eleHeiNum, // What: Height Value. Why: The mask and spot size themselves from this. How: This is the element's own final height.
						labStr : curLabStr, // What: Label String. Why: A function titStr reads this element's own live name back out. How: This is the label resolved above, or undefined.
						shaObj : shaRadObj, // What: Shape Object. Why: The mask and spot round their corners from this. How: This is the radius pair shaRadFun returned.
						width  : eleWidNum, // What: Width Value. Why: The mask and spot size themselves from this. How: This is the element's own final width.

						...padSurObj // What: Pad Surviving Spread. Why: The mask, spot and badge read each side's own surviving pad. How: This spreads claPadFun's own four pad fields in last, none of which overlap the keys above.


					};


				} );



				return; // What: Per Element Return. Why: A mulBoo item is fully handled by the loop above; it must never also fall through to the ordinary single-union branch below. How: This exits the outer forEach's own callback for this item.


			}



			if ( curIteObj.feoBoo ) tarEleArr = tarEleArr.slice( 0, 1 ); // What: First Only Slice. Why: Some selectors match one entry per section (one per-group card, say), where CSS's own :first-of-type cannot express "first anywhere on the page". How: This keeps only the first document-order match when curIteObj.feoBoo is set.



			let tarRecObj = uniRecFun( tarEleArr ); // What: Target Rect Object. Why: The ordinary case unions every remaining matched element into one combined rect. How: This runs tarEleArr through uniRecFun.


			if ( !Number.isFinite( tarRecObj.width ) || !Number.isFinite( tarRecObj.height ) ) return; // What: Finite Guard. Why: Every matched element can still end up fully clipped away by uniRecFun's own horizontal-scroll clipping. How: This skips this item once either dimension is not a finite number, the same "no badge this frame" outcome as finding zero elements at all.



			const cliRecObj = cliChrFun( tarRecObj, chrIteArr, tarEleArr ); // What: Clipped Rect Object. Why: The unioned rect must also stay clear of any chrome it is not itself part of. How: This runs tarRecObj through cliChrFun, exempting only the chrome tarEleArr is a member of.


			if ( !cliRecObj ) return; // What: Fully Clipped Guard. Why: An item clipped away by chrome entirely has nothing to highlight this frame. How: This skips this item once cliChrFun returned null.



			tarRecObj = { // What: Finalized Rect Object. Why: Every later step in this branch needs the clipped rect's own derived width/height alongside its edges. How: This spreads cliRecObj and adds width/height back on.


				...cliRecObj, // What: Clipped Rect Spread. Why: The finalized rect starts from the chrome-clipped edges. How: This spreads cliRecObj's own top/left/right/bottom in first.

				height : cliRecObj.bottom - cliRecObj.top, // What: Height Value. Why: Later steps size the highlight from this. How: This subtracts the clipped top from the clipped bottom.
				width  : cliRecObj.right - cliRecObj.left  // What: Width Value. Why: Later steps size the highlight from this. How: This subtracts the clipped left from the clipped right.


			};


			const padHorNum = curIteObj.padXcoNum ?? rhyPxlFun( 'm02' ); // What: Pad Horizontal Number. Why: The shape function branch below needs this item's own resolved horizontal pad, not just the flat default. How: This reads curIteObj's own padXcoNum override, or the flat default. // Vertical Rhythm Base Minus 2 ~= 8.304px
			const padVerNum = curIteObj.padYcoNum ?? rhyPxlFun( 'm02' ); // What: Pad Vertical Number. Why: The shape function branch below needs this item's own resolved vertical pad, not just the flat default. How: This reads curIteObj's own padYcoNum override, or the flat default. // Vertical Rhythm Base Minus 2 ~= 8.304px

			const shaRadObj = typeof curIteObj.shaStr === 'function'                                                                               // What: Shape Radius Object. Why: A multi-element union like the nav bar has no single source element's own border-radius to read, so its own shape function (passed the box's own padded dimensions) computes a radius directly instead. How: This calls curIteObj.shaStr when it is a function; otherwise a single-element union still reads a real border-radius via shaRadFun, and anything wider falls back to no shape at all.
				? curIteObj.shaStr( tarRecObj.width + padHorNum * 2, tarRecObj.height + padVerNum * 2 )                                               // What: Shape Function Call. Why: A multi-element union computes its own radius from the padded box size. How: This calls curIteObj.shaStr with the padded width and height.
				: tarEleArr.length === 1 // What: Single Element Check. Why: Only a single element has one real border-radius to read. How: This checks tarEleArr's own length.
					? shaRadFun( tarEleArr[ 0 ], tarRecObj.width + rhyPxlFun( 'm02' ) * 2, tarRecObj.height + rhyPxlFun( 'm02' ) * 2, curIteObj.shaStr ) // What: Element Radius Read. Why: A single element's own rounding should carry over to its highlight. How: This calls shaRadFun with the padded box size. // Vertical Rhythm Base Minus 2 ~= 8.304px
					: null; // What: No Shape Fallback. Why: A wider union has no one radius to reuse. How: This leaves the shape null so the default radius applies.

			const matWidEle = curIteObj.mwsStr ? document.querySelector( curIteObj.mwsStr ) : null; // What: Match Width Element. Why: mwsStr sizes the open tip to a DIFFERENT element's own width than whatever is highlighted, e.g. the nav tip's own .tabbar container. How: This looks mwsStr up directly, independent of tarEleArr.

			const tipWidNum = matWidEle && matWidEle.matches( '[data-placement="bottom"] > [data-element-name-hook~="appTabNav"]' ) // What: Tip Width Number. Why: "As wide as the navbar itself" is only sane on 'bottom' placement, where the container really is a reasonably-sized pill; 'top'/'side' would either run off-screen or force the tip's own text into an extremely tall narrow column. How: This reads matWidEle's own real width only while it carries the 'tabbar--bottom' class, otherwise leaves this undefined.
				? matWidEle.getBoundingClientRect().width // What: Navbar Width Read. Why: On 'bottom' placement the tip matches the navbar's own width. How: This reads matWidEle's own current width.
				: undefined;                              // What: No Width Fallback. Why: Other placements keep the usual fixed tip width. How: This leaves the width undefined.

			const alwBelBoo = curIteObj.absStr ? !!document.querySelector( curIteObj.absStr ) : false;                                   // What: Always Below Boolean. Why: Only a page/placement where absStr's own target actually exists (e.g. the nav on side placement) should skip the normal above/below choice. How: This checks whether absStr currently matches anything at all.
			const padSurObj = claPadFun( tarRecObj, padHorNum, padVerNum, chrIteArr, tarEleArr );                                        // What: Pad Surviving Object. Why: This item's own surviving per-side padding must be computed the same way as the mulBoo branch above. How: This calls claPadFun with the same padHorNum/padVerNum already resolved above.


			nexMapObj[ curIteObj.ideStr ] = { // What: Item Map Write. Why: The rendered overlay reads this exact merged shape back for its own mask cutout, highlight spot, badge, and (once opened) its own tip. How: This writes the finalized rect plus every derived field into nexMapObj.


				...tarRecObj, // What: Finalized Rect Spread. Why: The entry starts from this item's own finalized edges and size. How: This spreads tarRecObj in first.

				alwBelBoo : alwBelBoo, // What: Always Below Boolean. Why: plaTipFun skips its above/below choice when this is set. How: This is the absStr check resolved above.
				shaObj    : shaRadObj, // What: Shape Object. Why: The mask and spot round their corners from this. How: This is the radius pair resolved above.
				tipWidNum : tipWidNum, // What: Tip Width Number. Why: HelTipCom sizes a mtwBoo tip to this width. How: This is the mwsStr width resolved above.

				...padSurObj // What: Pad Surviving Spread. Why: The mask, spot and badge read each side's own surviving pad. How: This spreads claPadFun's own four pad fields in last, none of which overlap the keys above.


			};


		} );



		const groMapObj = {}; // What: Group Map Object. Why: column group items (the Day Log panel's per-column highlights) need their own siblings gathered together before they can be snapped edge-to-edge below. How: This starts empty and is filled by the loop directly below.


		allIteArr.forEach( ( curIteObj ) => { // What: Group Gather Loop. Why: Only an item that both declares a column group AND actually has a rect this frame belongs in a group. How: This pushes curIteObj's own ideStr into groMapObj under its own groStr key.


			if ( !curIteObj.groStr || !nexMapObj[ curIteObj.ideStr ] ) return; // What: Not Grouped Guard. Why: An item with no groStr, or one that found nothing this frame, contributes to no group at all. How: This skips this item once either condition fails.



			( groMapObj[ curIteObj.groStr ] || ( groMapObj[ curIteObj.groStr ] = [] ) ).push( curIteObj.ideStr ); // What: Group Push. Why: Every member of the same groStr must end up in the same array, in whatever order they were encountered. How: This lazily creates the group's own array on first use, then pushes this item's own ideStr.


		} );


		Object.values( groMapObj ).forEach( ( groIdeArr ) => { // What: Group Snap Loop. Why: Each column's own union naturally shrinks to just its content's width, leaving dead gaps between neighbors; this snaps every group's own members edge-to-edge instead. How: This walks each column group's own member ids, adjusting their shared rects in place.


			const groTopNum = Math.min( ...groIdeArr.map( ( curIdeStr ) => nexMapObj[ curIdeStr ].top ) );    // What: Group Top Number. Why: Every member of the group must share one continuous table height rather than some columns overhanging their shorter siblings. How: This takes the smallest top among every member's own current rect.
			const groBotNum = Math.max( ...groIdeArr.map( ( curIdeStr ) => nexMapObj[ curIdeStr ].bottom ) ); // What: Group Bottom Number. Why: Same reasoning as groTopNum, for the bottom edge. How: This takes the largest bottom among every member's own current rect.


			groIdeArr.forEach( ( curIdeStr ) => { // What: Vertical Snap. Why: Every member's own rect must actually reflect the shared top/bottom/height just computed. How: This overwrites each member's own top/bottom/height in place.


				nexMapObj[ curIdeStr ].top    = groTopNum;             // What: Top Snap. Why: Every member shares the group's own top. How: This writes groTopNum.
				nexMapObj[ curIdeStr ].bottom = groBotNum;             // What: Bottom Snap. Why: Every member shares the group's own bottom. How: This writes groBotNum.
				nexMapObj[ curIdeStr ].height = groBotNum - groTopNum; // What: Height Snap. Why: The height must match the snapped edges. How: This subtracts groTopNum from groBotNum.


			} );


			groIdeArr.sort( ( ideOneStr, ideTwoStr ) => nexMapObj[ ideOneStr ].left - nexMapObj[ ideTwoStr ].left ); // What: Left To Right Sort. Why: The horizontal snap below needs each member's own left neighbor known, which only works once the group is ordered left to right. How: This sorts groIdeArr in place by each member's own current left edge.


			groIdeArr.forEach( ( curIdeStr, curIndNum ) => { // What: Horizontal Snap Loop. Why: Interior boundaries between neighboring columns must meet at the exact midpoint between them, with no gap and no overlap. How: This walks groIdeArr in left-to-right order, adjusting each member's own left/right in place.


				const curRecObj = nexMapObj[ curIdeStr ]; // What: Current Rect Object. Why: This member's own rect is read and mutated repeatedly below. How: This is a direct reference into nexMapObj, so mutating it here mutates the map itself.

				curRecObj.padLefNum = 0; // What: Left Pad Reset. Why: This member's own left already carries its final, edge-to-edge-adjusted value; padding it again would reopen the exact gap/overlap this snap exists to close. How: This zeroes the left pad.
				curRecObj.padRigNum = 0; // What: Right Pad Reset. Why: This member's own right already carries its final, edge-to-edge-adjusted value; padding it again would reopen the exact gap/overlap this snap exists to close. How: This zeroes the right pad.


				if ( curIndNum === 0 ) curRecObj.left -= rhyPxlFun( 'm02' ); // What: First Column Guard. Why: Only the group's own leftmost outer edge should get normal breathing room, since it has no left neighbor to snap flush against. How: This subtracts the flat pad margin from curRecObj's own left only on the first iteration. // Vertical Rhythm Base Minus 2 ~= 8.304px



				if ( curIndNum === groIdeArr.length - 1 ) { // What: Last Column Guard. Why: The group's own rightmost outer edge also needs normal breathing room, since it has no right neighbor either. How: This adds the flat pad margin to curRecObj's own right only on the last iteration.


					curRecObj.right += rhyPxlFun( 'm02' ); // What: Last Column Pad Add. Why: The group's own rightmost outer edge needs the same normal breathing room a non-grouped item would get. How: This adds the flat pad margin back onto curRecObj's own right edge. // Vertical Rhythm Base Minus 2 ~= 8.304px


				}

				else { // What: Interior Boundary Branch. Why: Every other boundary is shared, touching ground between this member and its own right neighbor. How: This computes the exact midpoint between the two and snaps both edges to it.


					const nexRecObj = nexMapObj[ groIdeArr[ curIndNum + 1 ] ];  // What: Next Rect Object. Why: The midpoint below needs this member's own right neighbor's rect. How: This reads the next id in groIdeArr's own sorted order.
					const midBouNum = ( curRecObj.right + nexRecObj.left ) / 2; // What: Midpoint Boundary Number. Why: This is the exact shared boundary both neighbors must snap to. How: This averages curRecObj's own right and nexRecObj's own left.


					curRecObj.right = midBouNum; // What: Right Boundary Snap. Why: This member's own right edge must meet its neighbor exactly. How: This writes midBouNum onto curRecObj.right.
					nexRecObj.left  = midBouNum; // What: Left Boundary Snap. Why: The neighbor's own left edge must meet this member exactly. How: This writes midBouNum onto nexRecObj.left.


				}



				curRecObj.width = curRecObj.right - curRecObj.left; // What: Width Recompute. Why: curRecObj's own width must reflect whatever its left/right just settled to. How: This recomputes width directly from the just-adjusted edges.

				nexMapObj[ curIdeStr ].badAncNum = badRecFun( curRecObj, true ).top; // What: Badge Anchor Stash. Why: plaTipFun's own "flips above" branch needs to know where this member's own centered badge sits, well above curRecObj.top itself. How: This computes the centered badge rect (badRecFun's own cenBadBoo mode) now that curRecObj's own group-adjusted top/width are both final, and stashes just its own top as badAncNum.


			} );


		} );


		setRecMapObj( nexMapObj ); // What: Rect Map Commit. Why: The whole freshly-recomputed map must replace the previous one in one single state update. How: This writes nexMapObj into recMapObj via its own setter.


		const togBtnEle = document.querySelector( '[data-element-name-hook~="helTogBut"]' ); // What: Toggle Button Element. Why: The page's own toggle button sits inside sticky/stacked chrome that traps its own z-index below the dim layer's, so it needs its own mask cutout even though it is never one of allIteArr. How: This looks up the one .help-btn currently on the page.


		if ( togBtnEle ) { // What: Toggle Found Guard. Why: Only write a toggle rect when the button was actually found. How: This measures and stores togBtnEle's own bounding rect.


			const butRecObj = togBtnEle.getBoundingClientRect(); // What: Button Rect Object. Why: The mask cutout below needs the toggle button's own real on-screen position and size. How: This reads togBtnEle's own bounding rect.


			setTogRecObj( { height : butRecObj.height, left : butRecObj.left, top : butRecObj.top, width : butRecObj.width } ); // What: Toggle Rect Commit. Why: The rendered mask reads togRecObj directly for its own always-on-top cutout. How: This writes a plain { height, left, top, width } copy of butRecObj into togRecObj via its own setter.


		}


	}, [ allIteArr ] ); // What: Effect Dependency Array. Why: This callback's own identity only needs to change when the underlying catalog itself changes. How: allIteArr is read directly throughout the callback body above.



	const safRecFun = React.useCallback( () => { // What: Safe Recompute Function. Why: A thrown error from a single bad measurement (e.g. a target mid-reflow) must not kill the rAF loop permanently, since an uncaught exception would skip the requestAnimationFrame call after it and silently stop all per-frame tracking. How: This wraps recTarFun in a try/catch, logging and swallowing any error instead of letting it propagate.


		try { recTarFun(); } // What: Recompute Try. Why: A thrown error from a single bad measurement must not escape this wrapper uncaught. How: This calls recTarFun inside the guarded block.

		catch ( errValObj ) { console.error( '[help-mode] recompute failed', errValObj ); } // What: Recompute Catch. Why: Swallowing the error here, instead of letting it propagate, is what keeps the rAF loop alive for every later frame. How: This logs errValObj to the console and does nothing else.


	}, [ recTarFun ] ); // What: Effect Dependency Array. Why: This callback's own identity only needs to change when recTarFun's own identity does. How: recTarFun is called directly inside the try block above.



	React.useEffect( () => { // What: Raf Tracking Effect. Why: Every tagged element's own rect must be recomputed every animation frame while help mode is active, to stay correct under scrolling/reflow. How: This starts a self-rescheduling requestAnimationFrame loop on activation and cancels it on cleanup.


		if ( !actModBoo ) { // What: Inactive Cleanup Branch. Why: Turning help mode off must clear every piece of rendered state, not just stop the loop below. How: This resets the rect map, open tip, and toggle rect, then bails out before scheduling any frame.


			setRecMapObj( {} );   // What: Rect Map Clear. Why: No rect should stay considered on-screen once help mode is off. How: This resets recMapObj back to its own empty default.
			setOpeIdeStr( null ); // What: Open Id Clear. Why: No tip should stay marked open once help mode is off. How: This resets opeIdeStr back to null.
			setTogRecObj( null ); // What: Toggle Rect Clear. Why: The toggle button's own cutout must disappear along with everything else. How: This resets togRecObj back to null.



			return; // What: Inactive Return. Why: Nothing below (the raf loop setup) should run at all while help mode is off. How: This exits the effect immediately after the cleanup above.


		}



		let rafIdeNum;         // What: Raf Identifier Number. Why: The cleanup below needs to cancel whichever pending frame is currently scheduled. How: This starts undefined and is (re)assigned every time looRafFun schedules its own next frame.
		let looCanBoo = false; // What: Loop Cancelled Boolean. Why: A frame already in flight when this effect is cleaned up must not schedule yet another one after it fires. How: This starts false and is flipped true by the cleanup function below.


		const looRafFun = () => { // What: Loop Function. Why: This is the actual self-rescheduling tick that keeps every rect fresh every frame. How: This bails out once cancelled, otherwise recomputes and reschedules itself.


			if ( looCanBoo ) return; // What: Cancelled Guard. Why: A frame that fires after cleanup must do nothing at all. How: This returns immediately once looCanBoo is true.



			safRecFun(); // What: Safe Recompute Call. Why: This is the actual per-frame work, wrapped so one bad frame cannot kill the whole loop. How: This calls safRecFun, which itself calls recTarFun inside a try/catch.


			rafIdeNum = requestAnimationFrame( looRafFun ); // What: Next Frame Schedule. Why: The loop must keep going every frame while still active. How: This schedules looRafFun itself again and stashes the new frame id.


		};


		rafIdeNum = requestAnimationFrame( looRafFun ); // What: First Frame Schedule. Why: The loop must start immediately on activation rather than waiting for some other trigger. How: This schedules looRafFun's own very first tick.



		return () => { // What: Loop Cleanup Return. Why: The raf loop must stop the instant this effect re-runs or the component unmounts. How: This returns a cleanup function that flips looCanBoo and cancels the pending frame.


			looCanBoo = true; // What: Loop Cancel Flag. Why: A frame already in flight when cleanup runs must still check this before doing any work. How: This flips looCanBoo true.


			cancelAnimationFrame( rafIdeNum ); // What: Frame Cancel Call. Why: A frame that hasn't fired yet must not fire after cleanup either. How: This cancels whatever frame rafIdeNum currently holds.


		};


	}, [ actModBoo, allIteArr, safRecFun ] ); // What: Effect Dependency Array. Why: This effect must restart whenever help mode itself toggles, and re-close over a fresh safRecFun/allIteArr whenever either changes identity. How: actModBoo gates whether the loop runs at all, and the other two are read directly inside looRafFun/safRecFun above.



	React.useEffect( () => { // What: Click Guard Effect. Why: Anything NOT currently tagged (or part of help mode's own UI) must be blocked from interaction while active, the same capture-phase idea as the guided tour's own click-guard. How: This registers a capture-phase click listener plus a keydown listener while active, both cleaned up together.


		if ( !actModBoo ) return; // What: Inactive Guard. Why: There is nothing to guard while help mode itself is off. How: This skips registering either listener while actModBoo is false.



		const hitTarFun = ( cliEveObj ) => { // What: Hit Target Function. Why: A click is allowed through only when it lands on something help mode itself recognizes. How: This checks the app's own always-exempt chrome first, then falls back to checking every catalog item's own matched elements.


			if ( cliEveObj.target.closest( '[data-element-name-hook~="helBadBut"], [data-element-name-hook~="helTipDiv"], [data-element-name-hook~="helTogBut"], [data-element-name-hook~="appTabNav"], [data-element-name-hook~="touOveDiv"]' ) ) return true; // What: Exempt Chrome Guard. Why: Navigating away (the tab bar) must still work while help mode is up, and a guided tour walking through this exact feature owns its own clicks already. How: This allows the click through once it lands inside any of these 5 always-exempt regions.



			return allIteArr.some( ( curIteObj ) => finTarFun( curIteObj.selStr ).some( ( curTarEle ) => curTarEle.contains( cliEveObj.target ) ) ); // What: Tagged Element Check. Why: A click on any currently-highlighted target itself must also be allowed through. How: This checks whether the click's own target falls inside any catalog item's own currently-matched elements.


		};



		const cliCapFun = ( cliEveObj ) => { // What: Click Capture Function. Why: This is the actual capture-phase guard blocking every untagged click. How: This lets a genuine target click through (re-measuring shortly after), otherwise swallows the click and closes whatever tip is open.


			if ( hitTarFun( cliEveObj ) ) { // What: On Target Branch. Why: A click that lands on a real target (e.g. Save/Cancel/Delete closing an editor) must not be blocked, just re-measured. How: This defers to a macrotask so the resulting DOM/React commit has already landed before recomputing.


				setTimeout( safRecFun, 0 ); // What: Deferred Recompute Schedule. Why: The click's own resulting DOM/React commit (e.g. an editor closing) needs a tick to actually land before recomputing rects. How: This schedules safRecFun on a macrotask via a 0ms timeout.



				return; // What: On Target Return. Why: A genuine target click must not be swallowed like an off-target one is below. How: This exits the handler once the deferred recompute has been scheduled.


			}



			cliEveObj.preventDefault();  // What: Default Prevention. Why: A click outside any tagged target must never reach whatever it would have normally activated. How: This prevents the click's own default action.
			cliEveObj.stopPropagation(); // What: Propagation Stop. Why: Same reasoning as preventDefault above, for any other listener that might otherwise see this click. How: This stops the click from bubbling further.


			setOpeIdeStr( null ); // What: Open Close. Why: An untagged click is also help mode's own signal to close whatever tip happens to be open. How: This clears opeIdeStr back to null.


		};



		const keyDowFun = ( keyDowObj ) => { // What: Key Down Function. Why: Escape closes one thing at a time, a tip first if one is open, then help mode itself on a second press. How: This checks the key, then which of the 2 close targets currently applies.


			if ( keyDowObj.key !== 'Escape' ) return; // What: Non Escape Guard. Why: Only Escape is a meaningful key for this listener. How: This ignores every other key.



			if ( opeIdeStr != null ) { setOpeIdeStr( null ); return; } // What: Close Tip Guard. Why: Backing out of an open tip should not also leave help mode altogether. How: This closes just the open tip and stops, once one is actually open.



			onCloAllFun(); // What: Exit Call. Why: A second Escape (with no tip open) is what actually leaves help mode entirely. How: This calls the caller's own onCloAllFun, which flips its own active state back off.


		};



		document.addEventListener( 'click', cliCapFun, true ); // What: Click Listener Add. Why: The capture phase ensures this guard runs before any inner element's own handler could otherwise fire. How: This registers cliCapFun for every click in the document.
		document.addEventListener( 'keydown', keyDowFun );     // What: Keydown Listener Add. Why: Escape must close something regardless of which element currently has focus. How: This registers keyDowFun for every keydown in the document.



		return () => { // What: Listener Cleanup Return. Why: Both listeners must stop the instant this effect re-runs or help mode turns off. How: This returns a cleanup function that removes both the click and keydown listeners.


			document.removeEventListener( 'click', cliCapFun, true ); // What: Click Listener Remove. Why: The capture-phase guard must not keep intercepting clicks once this effect cleans up. How: This removes cliCapFun, matching the same phase/type it was added with.
			document.removeEventListener( 'keydown', keyDowFun );     // What: Keydown Listener Remove. Why: Escape must stop being intercepted once this effect cleans up. How: This removes keyDowFun.


		};


	}, [ actModBoo, allIteArr, onCloAllFun, opeIdeStr, safRecFun ] ); // What: Effect Dependency Array. Why: This effect must re-run whenever help mode itself toggles, or close over a fresh reference to any of the values its own handlers read. How: actModBoo gates registration, allIteArr/safRecFun are read inside hitTarFun/cliCapFun, onCloAllFun/opeIdeStr are read inside keyDowFun.



	if ( !actModBoo ) return null; // What: Inactive Guard. Why: Nothing at all should render while help mode itself is off. How: This returns null before building any of the JSX below.



	const vieWidNum  = window.innerWidth;                                                                   // What: Viewport Width Number. Why: The SVG mask below needs the current viewport width to fully cover the screen. How: This reads window.innerWidth once per render.
	const vieHeiNum  = window.innerHeight;                                                                  // What: Viewport Height Number. Why: The SVG mask below needs the current viewport height to fully cover the screen. How: This reads window.innerHeight once per render.
	const recEntArr = Object.entries( recMapObj );                                                          // What: Rect Entries Array. Why: Both the mask cutouts and the rendered highlight spots below need to walk every current [id, rect] pair. How: This converts recMapObj into a plain array via Object.entries.
	const basIdeStr = opeIdeStr ? opeIdeStr.split( '::' )[ 0 ] : null;                                      // What: Base Identifier String. Why: opeIdeStr can be a mulBoo sub-id, so the catalog lookup below needs the id with any "::N" suffix stripped off. How: This splits opeIdeStr on '::' and keeps just the first segment.
	const opeIteObj = basIdeStr ? allIteArr.find( ( curIteObj ) => curIteObj.ideStr === basIdeStr ) : null; // What: Open Item Object. Why: The open tip needs the catalog item whose titStr/bodEle every mulBoo instance shares. How: This finds the one entry in allIteArr whose own ideStr matches basIdeStr.
	const opeRecObj = opeIdeStr ? recMapObj[ opeIdeStr ] : null;                                            // What: Open Rect Object. Why: The open tip needs the FULL id's own rect, not the base id's. How: This looks opeIdeStr straight up in recMapObj.



	return createPortal( // What: Portal Return. Why: The whole overlay must render into <body> (not wherever this component happens to sit in the tree) so it clamps to the viewport instead of being clipped by an ancestor's own overflow. How: This calls createPortal with the JSX below and document.body as the target.


		<div
			className={ cssModObj.helpMode }

			aria-live='polite'
		>{ /* What: Container Help Mode Div Element. Why: This is HelOveCom's own root portaled element. How: This wraps the dim-layer SVG, the rendered highlight spots, every badge, and at most one open tip below. */ }


			<svg
				className={ cssModObj.helpDimSvg }
				height={ vieHeiNum }
				width={ vieWidNum }
			>{ /* What: Help Dim Svg Element. Why: This paints the single dim layer with cutouts for every currently-highlighted target. How: This wraps a <mask> defining the cutouts and a full-viewport <rect> filled through that mask below. */ }


				<mask id='help-mask'>{ /* What: Help Mask Element. Why: One shared SVG mask lets arbitrarily many cutouts coexist in a single dim layer, instead of the guided tour's own single-spotlight box-shadow trick. How: This paints a full white rect, then one black rounded-rect per highlighted target/toggle button below. */ }


					<rect
						fill='#fff'
						height={ vieHeiNum }
						width={ vieWidNum }
						x='0'
						y='0'
					/>{ /* What: Mask Base Rect Element. Why: A fully-white base means "dim everything" by default, before any cutouts punch through it. How: This is a plain full-viewport white rect. */ }

					{ recEntArr.map( ( [ curIdeStr, curRecObj ] ) => { // What: Mask Cutout Map. Why: Every currently-highlighted target needs its own black cutout rect, shaped and padded to match how it is actually rendered on top. How: This maps recEntArr, reading each rect's own shape/pad fields.


						const { radXcoNum, radYcoNum } = curRecObj.shaObj || { radXcoNum : rhyPxlFun( 'm01' ), radYcoNum : rhyPxlFun( 'm01' ) }; // What: Shape Destructure. Why: A multi-element union with no single shape falls back to the app's own default radius. How: This reads curRecObj's own shape, or the default, directly. // Vertical Rhythm Base Minus 1 ~= 11.000px
						const padTopNum  = curRecObj.padTopNum ?? rhyPxlFun( 'm02' );                                                            // What: Pad Top Number. Why: A column group member's own padLefNum/padRigNum are forced to 0 elsewhere, but its padTopNum/padBotNum still apply normally here. How: This reads curRecObj's own padTopNum, falling back to the flat default. // Vertical Rhythm Base Minus 2 ~= 8.304px
						const padBotNum  = curRecObj.padBotNum ?? rhyPxlFun( 'm02' );                                                            // What: Pad Bottom Number. Why: A column group member's own padLefNum/padRigNum are forced to 0 elsewhere, but its padTopNum/padBotNum still apply normally here. How: This reads curRecObj's own padBotNum, falling back to the flat default. // Vertical Rhythm Base Minus 2 ~= 8.304px
						const padLefNum  = curRecObj.padLefNum ?? rhyPxlFun( 'm02' );                                                            // What: Pad Left Number. Why: Same reasoning as padTopNum/padBotNum above, for the horizontal sides. How: This reads curRecObj's own padLefNum, falling back to the flat default. // Vertical Rhythm Base Minus 2 ~= 8.304px
						const padRigNum  = curRecObj.padRigNum ?? rhyPxlFun( 'm02' );                                                            // What: Pad Right Number. Why: Same reasoning as padTopNum/padBotNum above, for the horizontal sides. How: This reads curRecObj's own padRigNum, falling back to the flat default. // Vertical Rhythm Base Minus 2 ~= 8.304px



						return (

							<rect
								key={ curIdeStr }

								fill='#000'
								height={ curRecObj.height + padTopNum + padBotNum }
								rx={ radXcoNum }
								ry={ radYcoNum }
								width={ curRecObj.width + padLefNum + padRigNum }
								x={ curRecObj.left - padLefNum }
								y={ curRecObj.top - padTopNum }
							/> // What: Mask Cutout Rect Element. Why: Every currently-highlighted target needs its own black cutout, shaped and padded to match how it is actually rendered on top. How: This is punched at curRecObj's own padded position/size, using radXcoNum/radYcoNum from its own shape (or the default).

						);


					} ) }

					{ togRecObj && ( // What: Toggle Cutout Check. Why: The page's own toggle button sits inside sticky chrome whose own stacking context traps it below the dim layer's z-index, so it needs a cutout too even though it is never one of allIteArr. How: This renders a plain padded circular cutout only while togRecObj holds a measured rect.


						<rect
							fill='#000'
							height={ togRecObj.height + rhyPxlFun( 'm02' ) * 2 } // Vertical Rhythm Base Minus 2 ~= 8.304px
							rx={ ( togRecObj.height + rhyPxlFun( 'm02' ) * 2 ) / 2 } // Vertical Rhythm Base Minus 2 ~= 8.304px
							ry={ ( togRecObj.height + rhyPxlFun( 'm02' ) * 2 ) / 2 } // Vertical Rhythm Base Minus 2 ~= 8.304px
							width={ togRecObj.width + rhyPxlFun( 'm02' ) * 2 } // Vertical Rhythm Base Minus 2 ~= 8.304px
							x={ togRecObj.left - rhyPxlFun( 'm02' ) } // Vertical Rhythm Base Minus 2 ~= 8.304px
							y={ togRecObj.top - rhyPxlFun( 'm02' ) } // Vertical Rhythm Base Minus 2 ~= 8.304px
						/> // What: Toggle Cutout Rect Element. Why: The toggle button's own cutout needs the same treatment as every other target, just always circular and flatly padded. How: This is punched as a circle (rx/ry set to half the padded height) at togRecObj's own padded position/size.

					) }


				</mask>

				<rect
					className={ cssModObj.helpDimFill }

					height={ vieHeiNum }
					mask='url(#help-mask)'
					width={ vieWidNum }
					x='0'
					y='0'
				/>{ /* What: Help Dim Fill Rect Element. Why: This is the actual visible dim layer, its own cutouts coming entirely from the mask above. How: This is a full-viewport rect filled through url(#help-mask). */ }


			</svg>

			{ recEntArr.map( ( [ curIdeStr, curRecObj ] ) => { // What: Highlight Spot Map. Why: Alongside the mask's own dim-layer cutout, each target also gets a rendered help spot div, e.g. for its own visible border/glow styling. How: This maps recEntArr the same way the mask cutouts above do.


				const { radXcoNum, radYcoNum } = curRecObj.shaObj || { radXcoNum : rhyPxlFun( 'm01' ), radYcoNum : rhyPxlFun( 'm01' ) }; // What: Shape Destructure. Why: Same reasoning as the mask cutout above. How: This reads curRecObj's own shape, or the default, directly. // Vertical Rhythm Base Minus 1 ~= 11.000px
				const padTopNum  = curRecObj.padTopNum ?? rhyPxlFun( 'm02' );                                                            // What: Pad Top Number. Why: Same reasoning as the mask cutout above. How: This reads curRecObj's own padTopNum, falling back to the flat default. // Vertical Rhythm Base Minus 2 ~= 8.304px
				const padBotNum  = curRecObj.padBotNum ?? rhyPxlFun( 'm02' );                                                            // What: Pad Bottom Number. Why: Same reasoning as the mask cutout above. How: This reads curRecObj's own padBotNum, falling back to the flat default. // Vertical Rhythm Base Minus 2 ~= 8.304px
				const padLefNum  = curRecObj.padLefNum ?? rhyPxlFun( 'm02' );                                                            // What: Pad Left Number. Why: Same reasoning as the mask cutout above. How: This reads curRecObj's own padLefNum, falling back to the flat default. // Vertical Rhythm Base Minus 2 ~= 8.304px
				const padRigNum  = curRecObj.padRigNum ?? rhyPxlFun( 'm02' );                                                            // What: Pad Right Number. Why: Same reasoning as the mask cutout above. How: This reads curRecObj's own padRigNum, falling back to the flat default. // Vertical Rhythm Base Minus 2 ~= 8.304px

				const spoStyObj = { // What: Spot Style Object. Why: The rendered highlight spot needs its own absolute position/size plus a border-radius matching radXcoNum/radYcoNum exactly. How: This is applied directly as this div's own inline style below.


					borderRadius : `${ radXcoNum }px / ${ radYcoNum }px`,                  // What: Spot Border Radius. Why: The rendered spot's own rounding must exactly match the mask cutout's own radXcoNum/radYcoNum, or the two would visibly mismatch. How: This builds the 2-value CSS border-radius shorthand from radXcoNum/radYcoNum.
					height       : curRecObj.height + padTopNum + padBotNum, // What: Spot Height. Why: The rendered spot must span the padded target's own full height, matching the mask cutout above. How: This adds padTopNum and padBotNum onto curRecObj's own height.
					left         : curRecObj.left - padLefNum,               // What: Left Position. Why: The rendered spot must sit at the padded target's own left edge, matching the mask cutout above. How: This subtracts padLefNum from curRecObj's own left.
					top          : curRecObj.top - padTopNum,                // What: Top Position. Why: The rendered spot must sit at the padded target's own top edge, matching the mask cutout above. How: This subtracts padTopNum from curRecObj's own top.
					width        : curRecObj.width + padLefNum + padRigNum   // What: Spot Width. Why: The rendered spot must span the padded target's own full width, matching the mask cutout above. How: This adds padLefNum and padRigNum onto curRecObj's own width.


				};



				return (

					<div
						key={ curIdeStr }

						className={ cssModObj.helpSpot }

						style={ spoStyObj }
					/> // What: Help Spot Div Element. Why: This is the actual visible highlight box drawn around a target, e.g. for its own border/glow styling. How: This is positioned and shaped entirely via spoStyObj, keyed by curIdeStr for React's own list reconciliation.

				);


			} ) }

			{ allIteArr.flatMap( ( curIteObj ) => { // What: Badge Flat Map. Why: Every catalog item contributes 0 or more badges, one per mulBoo sub-id or exactly one for the ordinary union case. How: This flat-maps allIteArr into a single flat array of rendered badge buttons.


				const badIdeArr = curIteObj.mulBoo // What: Badge Identifier Array. Why: mulBoo items have no single recMapObj[id]; one badge per synthesized sub-id instead. How: This filters recMapObj's own keys down to this item's own sub-ids, or falls back to its own single id when it has a rect at all.
					? Object.keys( recMapObj ).filter( ( curKeyStr ) => curKeyStr.startsWith( `${ curIteObj.ideStr }::` ) ) // What: Sub Identifier Filter. Why: A mulBoo item gets one badge per synthesized sub-id. How: This keeps every recMapObj key prefixed with this item's own id.
					: recMapObj[ curIteObj.ideStr ]                                                                         // What: Rect Found Check. Why: An ordinary item only gets a badge once it has a rect this frame. How: This looks its own id up in recMapObj.
						? [ curIteObj.ideStr ]                                                                                // What: Single Badge Identifier. Why: An ordinary item has exactly one badge. How: This wraps its own id in an array.
						: [];                                                                                                 // What: No Badge Fallback. Why: An item with no rect this frame gets no badge. How: This returns an empty array.

				return badIdeArr.map( ( curIdeStr ) => { // What: Badge Id Map. Why: Every id this item resolved to above needs its own rendered badge button. How: This maps badIdeArr, reading each one's own current rect back out of recMapObj.


					const curRecObj = recMapObj[ curIdeStr ];                     // What: Current Rect Object. Why: The badge's own position and its title function (if any) both need this id's own current rect. How: This reads curIdeStr straight out of recMapObj.
					const badRecObj = badRecFun( curRecObj, !!curIteObj.groStr ); // What: Badge Rect Object. Why: The badge itself renders at its own anchor point, not at the highlighted target's own position. How: This calls badRecFun, centering only when this item is part of a column group.

					const badLabStr = typeof curIteObj.titStr === 'function' ? curIteObj.titStr( curRecObj ) : ( typeof curIteObj.titStr === 'string' ? curIteObj.titStr : 'More info' ); // What: Badge Label String. Why: The badge's own accessible name should reflect a dynamic title (e.g. reading a picker's own cadence unit) when curIteObj.titStr is a function. How: This calls curIteObj.titStr with curRecObj when it is a function, uses it directly when it is a string, otherwise falls back to a generic label.



					return (

						<button
							key={ curIdeStr }

							className={ cssModObj.helpBadge }

							style={{
								left : badRecObj.left,
								top  : badRecObj.top
							}}

							data-badge-open-active={ opeIdeStr === curIdeStr || undefined } // What: Badge Open Active Attribute. Why: The badge whose tip is open is filled in the accent color. How: This sets the presence-only attribute while this badge's own id is the open one.
							data-element-name-hook='helBadBut'

							type='button'

							aria-label={ badLabStr }

							onClick={ ( cliEveObj ) => { // What: Badge Click Handler. Why: A badge click must not reach the document-level click guard, which would close the tip again. How: This stops propagation, then toggles this badge's own tip open or closed.


								cliEveObj.stopPropagation(); // What: Propagation Stop. Why: The capture-phase guard already let this click through; bubbling on would count as an outside click. How: This stops the click from bubbling further.

								setOpeIdeStr( ( preIdeStr ) => preIdeStr === curIdeStr ? null : curIdeStr ); // What: Open Toggle. Why: Clicking an open badge closes its tip, clicking any other badge opens its own. How: This compares the previous open id against curIdeStr.


							} }
						>{ /* What: Help Badge Button Element. Why: This is the actual clickable "i" marker opening/closing this target's own tip. How: This marks itself open via data-badge-open-active while opeIdeStr === curIdeStr and toggles opeIdeStr when clicked. Its data-element-name-hook is read by help mode's own outside-click check. */ }


							i


						</button>

					);


				} );


			} ) }



			{ opeIteObj && opeRecObj && ( // What: Open Tip Check. Why: At most one tip is ever rendered at a time, and only once both its own catalog item and its own current rect are known. How: This renders HelTipCom only while both opeIteObj and opeRecObj are truthy.


				<HelTipCom
					tarRecObj={ opeRecObj }
					tipIteObj={ opeIteObj }
				/> // What: Help Tip Component. Why: The currently-open item's own tip must render on top of everything else once it has both a catalog item and a measured rect to anchor to. How: This renders HelTipCom with opeIteObj/opeRecObj as its own tipIteObj/tarRecObj props.

			) }


		</div>,

		document.body // What: Document Body Target. Why: The whole overlay must render outside the app's own DOM subtree so ancestor overflow/stacking never clips or buries it. How: This is createPortal's own target container argument.

	);


}

// #endregion HelOveCom

// #endregion Components



// #region Exports

export { HelOveCom }; // What: Named Export. Why: Every tab file that renders help mode imports the overlay by name. How: This exports HelOveCom; every other binding in this file is internal-only.

// #endregion Exports


