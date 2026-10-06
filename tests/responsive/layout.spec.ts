


// #region Imports

import { expect    } from '@playwright/test';    // What: Expect. Why: A layout passes only with no problems found. How: This asserts the list is empty.
import { mkdirSync } from 'node:fs';             // What: Make Directory Sync. Why: Screenshots need their folder. How: This creates it.
import { opeFixFun } from '../support/app.ts';   // What: Open Fixture Function. Why: Layouts are checked on real data. How: This opens the backup on a fixed day.
import { selTabFun } from '../support/app.ts';   // What: Select Tab Function. Why: Each tab is measured in turn. How: This switches tabs.
import { test      } from '@playwright/test';    // What: Test. Why: Each width and page state is its own test. How: This declares them.


import type { Page } from '@playwright/test'; // What: Page. Why: Every helper drives the page. How: This types the page parameters.

// #endregion Imports



/**
 * layout.spec.ts = Layout Spec
 *
 * @summary
 * Measures every tab's layout on real data at phone, tablet, and desktop
 * widths, from 375 pixels up. Each page state (a tab as it opens, plus a few
 * expanded states such as an open editor) is loaded at each width and
 * checked three ways: the page or the main area scrolling sideways;
 * visible content reaching past the screen's edges, or text spilling out of
 * its own box, outside any container meant to clip or scroll it; and
 * controls (buttons, inputs, tabs) overlapping one another. Each problem
 * names the element by its hook, label, or text. A full-page screenshot of
 * every state lands in tests/output/responsive for a look by eye, since no
 * measurement catches everything that looks wrong.
 *
 * Sections:
 *  - Types
 *  - Constants
 *  - Helpers
 *  - Module Init
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Types

type PagStaTyp = { namStr : string, preFun : ( curPagObj : Page ) => Promise< void >, tabStr : string }; // What: Page State Type. Why: Each measured state is a tab plus optional setup. How: This holds its name, tab, and setup.

// #endregion Types



// #region Constants

const OUT_DIR_STR = new URL( '../output/responsive/', import.meta.url ); // What: Output Directory String. Why: Screenshots land where git ignores them. How: This is tests/output/responsive.
const VIE_WID_ARR = [ 375, 414, 768, 1024, 1280 ];                       // What: Viewport Width Array. Why: Phones from 375 up, a tablet, and desktops. How: This lists the widths measured.
const NOO_PRE_FUN = async () => {};                                      // What: No-Op Prepare Function. Why: Most states need no setup beyond the tab. How: This does nothing.



const PAG_STA_ARR : PagStaTyp[] = [ // What: Page State Array. Why: Each tab, and the expanded states most likely to crowd, are measured. How: Each row is one state.


	{ namStr : 'today',        preFun : NOO_PRE_FUN, tabStr : 'today' },    // What: Today State. Why: The daily list is the main screen. How: This measures Today as it opens.
	{ namStr : 'pickers',      preFun : NOO_PRE_FUN, tabStr : 'picker' },   // What: Pickers State. Why: The picker view packs controls and a pool. How: This measures Pickers as it opens.
	{ namStr : 'stats',        preFun : NOO_PRE_FUN, tabStr : 'stats' },    // What: Stats State. Why: Stats holds wide cards and a heatmap. How: This measures Stats as it opens.
	{ namStr : 'settings',     preFun : NOO_PRE_FUN, tabStr : 'settings' }, // What: Settings State. Why: Settings holds every option row. How: This measures Settings as it opens.

	{ namStr : 'today-editor', tabStr : 'today', preFun : async ( curPagObj ) => { await curPagObj.locator( '[data-element-name-hook~="todCarArt"] [aria-label="Edit"]' ).first().click(); } }, // What: Today Editor State. Why: The inline item editor crowds a card. How: This opens the first card's editor.

	{ namStr : 'data-expanded', tabStr : 'data', preFun : async ( curPagObj ) => { // What: Data Expanded State. Why: An open picker card shows its controls and items, the Data tab's densest view. How: This opens the first picker's card, controls, and items.


		const carSecLoc = curPagObj.locator( '[data-element-name-hook~="datCatSec"][data-picker-id]' ).first(); // What: Card Section Locator. Why: The first picker card is opened. How: This finds it.



		if ( await carSecLoc.locator( '[data-element-name-hook~="catHeaBut"][aria-expanded="false"]' ).count() ) await carSecLoc.locator( '[data-element-name-hook~="catHeaBut"]' ).click(); // What: Card Open Call. Why: A closed card hides its body. How: This opens it when closed.



		for ( const togButLoc of await carSecLoc.locator( '[data-element-name-hook~="catTogBut"]' ).all() ) if ( await togButLoc.getAttribute( 'aria-expanded' ) !== 'true' ) await togButLoc.click(); // What: Section Open Loop. Why: Controls and items open separately. How: This opens each closed one.


	} }


];

// #endregion Constants



// #region Helpers

// #region meaLayFun

/**
 * meaLayFun = Measure Layout Function
 *
 * @summary
 * Measures the page as it stands and returns every layout problem found.
 * Hidden things don't count: elements that aren't displayed, are fully
 * transparent, sit inside an aria-hidden decoration, or show a pixel or
 * less across once every clipping ancestor has cut them down (the
 * visually-hidden technique, or content inside a closed section). Overflow
 * only counts outside any ancestor that scrolls horizontally, since those
 * contain it on purpose; an ancestor that only clips would cut the content
 * off, so it still counts there, and text truncated with an ellipsis is
 * left alone. The main area only counts as scrolling
 * sideways when it doesn't clip. Overlap is checked between controls that
 * don't contain each other and sit in the same layer, so content scrolling
 * under the fixed tab bar isn't counted, and an overlap counts once it
 * covers more than a tenth of the smaller control and more than four square
 * pixels.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page to measure.
 *
 * @returns Every problem found.
 *
 * @example
 * ```ts
 * await meaLayFun(curPagObj) // => [] when the layout holds
 * ```
 *
*/

const meaLayFun = async ( curPagObj : Page ) : Promise< string[] > => curPagObj.evaluate( () => { // What: Measure Layout Function. Why: Layout problems are measured in the page. How: This checks overflow, spills, and overlaps and returns them.


	const issMesArr : string[] = [];                                                                             // What: Issue Message Array. Why: Every problem is reported. How: This collects them.
	const vieWidNum = document.documentElement.clientWidth;                                                      // What: Viewport Width Number. Why: Overflow is measured against the screen's width. How: This reads it.
	const conSelStr = 'a[href], button, input, select, textarea, [role="button"], [role="radio"], [role="tab"]'; // What: Control Selector String. Why: Overlap matters between things people tap. How: This selects every control.



	const cliRecFun = ( curDomEle : Element ) => { // What: Clipped Rect Function. Why: A clipping ancestor hides whatever falls outside it. How: This cuts the element's box down to every clipping ancestor's box.


		const eleRecObj = curDomEle.getBoundingClientRect(); // What: Element Rect Object. Why: The cut starts from the element's own box. How: This measures it.

		let botValNum = eleRecObj.bottom; // What: Bottom Value Number. Why: The cut box's bottom edge. How: This starts at the element's.
		let lefValNum = eleRecObj.left;   // What: Left Value Number. Why: The cut box's left edge. How: This starts at the element's.
		let rigValNum = eleRecObj.right;  // What: Right Value Number. Why: The cut box's right edge. How: This starts at the element's.
		let topValNum = eleRecObj.top;    // What: Top Value Number. Why: The cut box's top edge. How: This starts at the element's.



		for ( let ancDomEle = curDomEle.parentElement; ancDomEle && ancDomEle !== document.body; ancDomEle = ancDomEle.parentElement ) { // What: Clip Walk Loop. Why: Every clipping ancestor can cut the box further. How: This walks up to the body.


			const ancStyObj = getComputedStyle( ancDomEle ); // What: Ancestor Style Object. Why: Only an ancestor that clips cuts the box. How: This reads its overflow.



			if ( ancStyObj.overflowX === 'visible' && ancStyObj.overflowY === 'visible' ) continue; // What: Unclipped Guard. Why: An ancestor that shows its overflow cuts nothing. How: This skips it.



			const ancRecObj = ancDomEle.getBoundingClientRect(); // What: Ancestor Rect Object. Why: The box is cut to the ancestor's edges. How: This measures it.

			botValNum = Math.min( botValNum, ancRecObj.bottom ); // What: Bottom Cut. Why: Nothing below the ancestor shows. How: This keeps the higher bottom edge.
			lefValNum = Math.max( lefValNum, ancRecObj.left );   // What: Left Cut. Why: Nothing left of the ancestor shows. How: This keeps the further right left edge.
			rigValNum = Math.min( rigValNum, ancRecObj.right );  // What: Right Cut. Why: Nothing right of the ancestor shows. How: This keeps the further left right edge.
			topValNum = Math.max( topValNum, ancRecObj.top );    // What: Top Cut. Why: Nothing above the ancestor shows. How: This keeps the lower top edge.


		}



		return { // What: Clipped Rect Return. Why: Callers measure only what shows. How: This returns the cut box, its sides never negative.


			bottom : botValNum,                            // What: Bottom. Why: The cut box's bottom edge. How: This is the cut value.
			height : Math.max( 0, botValNum - topValNum ), // What: Height. Why: An emptied box has no height. How: This is the cut height, at least zero.
			left   : lefValNum,                            // What: Left. Why: The cut box's left edge. How: This is the cut value.
			right  : rigValNum,                            // What: Right. Why: The cut box's right edge. How: This is the cut value.
			top    : topValNum,                            // What: Top. Why: The cut box's top edge. How: This is the cut value.
			width  : Math.max( 0, rigValNum - lefValNum )  // What: Width. Why: An emptied box has no width. How: This is the cut width, at least zero.


		};


	};



	const layEleFun = ( curDomEle : Element ) => { // What: Layer Element Function. Why: A fixed or sticky bar floats over content scrolling past it on purpose. How: This finds the nearest fixed or sticky ancestor, or the element itself.


		for ( let ancDomEle : Element | null = curDomEle; ancDomEle && ancDomEle !== document.body; ancDomEle = ancDomEle.parentElement ) if ( [ 'fixed', 'sticky' ].includes( getComputedStyle( ancDomEle ).position ) ) return ancDomEle; // What: Layer Walk Loop. Why: The first fixed or sticky box sets the layer. How: This returns it.



		return null; // What: Page Layer Return. Why: Everything else scrolls with the page. How: This returns null for the page's own layer.


	};



	const visEleFun = ( curDomEle : Element ) => { // What: Visible Element Function. Why: Hidden things can't look wrong. How: This checks display, opacity, aria-hidden, and what shows once clipped.


		const comStyObj = getComputedStyle( curDomEle ); // What: Computed Style Object. Why: Visibility comes from the element's styles. How: This reads them.
		const eleRecObj = cliRecFun( curDomEle );        // What: Element Rect Object. Why: Tiny, empty, or clipped-away boxes don't count. How: This measures what shows of the element.



		const disShoBoo = comStyObj.display !== 'none';                 // What: Display Shown Boolean. Why: An element with no display isn't drawn. How: This checks its display.
		const visShoBoo = comStyObj.visibility !== 'hidden';            // What: Visibility Shown Boolean. Why: A hidden element isn't drawn. How: This checks its visibility.
		const opaShoBoo = Number( comStyObj.opacity ) > 0;              // What: Opacity Shown Boolean. Why: A fully transparent element can't be seen. How: This checks its opacity.
		const ariShoBoo = !curDomEle.closest( '[aria-hidden="true"]' ); // What: Aria Shown Boolean. Why: Decorative, hidden content isn't part of the layout being judged. How: This checks no ancestor hides it.
		const widShoBoo = eleRecObj.width > 1;                          // What: Width Shown Boolean. Why: An empty box can't crowd anything. How: This checks its width.
		const heiShoBoo = eleRecObj.height > 1;                         // What: Height Shown Boolean. Why: An empty box can't crowd anything. How: This checks its height.

		const visEleBoo = disShoBoo && visShoBoo && opaShoBoo && ariShoBoo && widShoBoo && heiShoBoo; // What: Visible Element Boolean. Why: Only shown things are measured. How: This combines the checks.



		return visEleBoo; // What: Visible Return. Why: The caller skips anything hidden. How: This returns the combined check.


	};



	const scrAncFun = ( curDomEle : Element ) => { // What: Scroll Ancestor Function. Why: A container that scrolls sideways, like a pill rail, holds its overflow on purpose. How: This finds the nearest such ancestor.


		for ( let ancDomEle = curDomEle.parentElement; ancDomEle && ancDomEle !== document.body; ancDomEle = ancDomEle.parentElement ) if ( [ 'auto', 'scroll' ].includes( getComputedStyle( ancDomEle ).overflowX ) ) return ancDomEle; // What: Ancestor Walk Loop. Why: Any sideways scroller contains the element, while one that only clips would cut it off. How: This returns the first scroller found.



		return null; // What: No Ancestor Return. Why: Nothing contains the element sideways. How: This returns null.


	};



	const desEleFun = ( curDomEle : Element ) => { // What: Describe Element Function. Why: Each problem must say which element. How: This names it by hook, label, or tag, with its text.


		const hooNamStr = curDomEle.getAttribute( 'data-element-name-hook' ); // What: Hook Name String. Why: A hook names an element most clearly. How: This reads it.
		const ariLabStr = curDomEle.getAttribute( 'aria-label' );             // What: Aria Label String. Why: A label is the next best name. How: This reads it.
		const tagNamStr = curDomEle.tagName.toLowerCase();                    // What: Tag Name String. Why: Every element has a tag to fall back on. How: This reads it.

		const eleNamStr = hooNamStr || ariLabStr || tagNamStr; // What: Element Name String. Why: The report names the element as clearly as it can. How: This takes the hook, then the label, then the tag.



		return `${ eleNamStr } "${ ( curDomEle.textContent || '' ).trim().slice( 0, 40 ) }"`; // What: Description Return. Why: The report shows the element's name and opening text. How: This joins them.


	};



	if ( document.documentElement.scrollWidth > vieWidNum + 1 ) issMesArr.push( `page scrolls sideways: ${ document.documentElement.scrollWidth } wide on a ${ vieWidNum } screen` ); // What: Page Scroll Check. Why: The page must never scroll sideways. How: This compares its width with the screen.



	const maiConEle = document.querySelector( '[data-element-name-hook~="appConMai"]' ); // What: Main Container Element. Why: The main area scrolls on its own. How: This finds it.



	const maiCliBoo = !!maiConEle && [ 'clip', 'hidden' ].includes( getComputedStyle( maiConEle ).overflowX ); // What: Main Clip Boolean. Why: A main area that clips sideways can't be scrolled sideways, whatever its content's width. How: This reads its horizontal overflow.



	if ( maiConEle && !maiCliBoo && maiConEle.scrollWidth > maiConEle.clientWidth + 1 ) issMesArr.push( `main area scrolls sideways: ${ maiConEle.scrollWidth } wide in ${ maiConEle.clientWidth }` ); // What: Main Scroll Check. Why: The main area must not scroll sideways either. How: This compares its widths.



	for ( const curDomEle of Array.from( document.querySelectorAll( 'body *' ) ) ) { // What: Element Loop. Why: Every visible element is checked for overflow. How: This walks the page.


		if ( !visEleFun( curDomEle ) || scrAncFun( curDomEle ) ) continue; // What: Contained Guard. Why: Hidden or contained elements are fine. How: This skips them.



		const eleRecObj = curDomEle.getBoundingClientRect();                // What: Element Rect Object. Why: Overflow is measured from the element's box. How: This measures it.
		const parRecObj = curDomEle.parentElement?.getBoundingClientRect(); // What: Parent Rect Object. Why: Only the outermost overflowing element is reported. How: This measures the parent.

		const offScrBoo = eleRecObj.right > vieWidNum + 1 || eleRecObj.left < -1;                    // What: Off Screen Boolean. Why: Content past the screen's edges can't be seen. How: This checks both edges.
		const parOffBoo = !!parRecObj && ( parRecObj.right > vieWidNum + 1 || parRecObj.left < -1 ); // What: Parent Off Boolean. Why: A child of an overflowing parent repeats its report. How: This checks the parent too.



		if ( offScrBoo && !parOffBoo ) issMesArr.push( `off screen: ${ desEleFun( curDomEle ) } spans ${ Math.round( eleRecObj.left ) } to ${ Math.round( eleRecObj.right ) } on a ${ vieWidNum } screen` ); // What: Off Screen Report. Why: Content must stay on screen. How: This reports the outermost offender.



		const hasTexBoo = Array.from( curDomEle.childNodes ).some( ( chiNodObj ) => chiNodObj.nodeType === 3 && ( chiNodObj.textContent || '' ).trim() ); // What: Has Text Boolean. Why: Spills are checked on elements holding text. How: This looks for a non-empty text node.
		const eleStyObj = getComputedStyle( curDomEle );                                                                                                  // What: Element Style Object. Why: Display and truncation come from the element's styles. How: This reads them.
		const bloDisBoo = eleStyObj.display !== 'inline';                                                                                                 // What: Block Display Boolean. Why: Inline text flows with its line rather than its own box. How: This checks the display.
		const trnEllBoo = eleStyObj.textOverflow === 'ellipsis';                                                                                          // What: Truncated Ellipsis Boolean. Why: Text cut off with an ellipsis is truncated on purpose. How: This checks the text overflow.
		const widPosBoo = curDomEle.clientWidth > 0; // What: Width Positive Boolean. Why: A box with no width has nothing to spill from. How: This checks its width.
		const texSpiBoo = curDomEle.scrollWidth > curDomEle.clientWidth + 1;                                                                              // What: Text Spill Boolean. Why: Text wider than its box spills. How: This compares the two widths.

		const spiRepBoo = hasTexBoo && bloDisBoo && !trnEllBoo && widPosBoo && texSpiBoo; // What: Spill Report Boolean. Why: A spill is reported only for a measurable block of text that isn't truncated on purpose. How: This combines the checks.


		if ( spiRepBoo ) issMesArr.push( `text spills: ${ desEleFun( curDomEle ) } needs ${ curDomEle.scrollWidth } in ${ curDomEle.clientWidth }` ); // What: Text Spill Report. Why: Text must fit its own box. How: This compares the text's width with the box.


	}



	const conEleArr = Array.from( document.querySelectorAll( conSelStr ) ).filter( visEleFun ); // What: Control Element Array. Why: Overlap is checked between visible controls. How: This collects them.



	for ( let oneIndNum = 0; oneIndNum < conEleArr.length; oneIndNum++ ) for ( let twoIndNum = oneIndNum + 1; twoIndNum < conEleArr.length; twoIndNum++ ) { // What: Pair Loop. Why: Every pair of controls could overlap. How: This checks each pair once.


		const oneDomEle = conEleArr[ oneIndNum ]; // What: One DOM Element. Why: The pair's first control. How: This reads it.
		const twoDomEle = conEleArr[ twoIndNum ]; // What: Two DOM Element. Why: The pair's second control. How: This reads it.



		if ( oneDomEle.contains( twoDomEle ) || twoDomEle.contains( oneDomEle ) ) continue; // What: Nested Guard. Why: A control inside another isn't an overlap. How: This skips nested pairs.



		if ( layEleFun( oneDomEle ) !== layEleFun( twoDomEle ) ) continue; // What: Layer Guard. Why: A fixed bar floats over scrolling content on purpose. How: This skips pairs in different layers.



		const oneRecObj = cliRecFun( oneDomEle );                                                                    // What: One Rect Object. Why: Overlap is measured between boxes. How: This measures the first.
		const twoRecObj = cliRecFun( twoDomEle );                                                                    // What: Two Rect Object. Why: Overlap is measured between boxes. How: This measures the second.
		const oveWidNum = Math.min( oneRecObj.right, twoRecObj.right ) - Math.max( oneRecObj.left, twoRecObj.left ); // What: Overlap Width Number. Why: The shared area's width. How: This intersects the boxes sideways.
		const oveHeiNum = Math.min( oneRecObj.bottom, twoRecObj.bottom ) - Math.max( oneRecObj.top, twoRecObj.top ); // What: Overlap Height Number. Why: The shared area's height. How: This intersects the boxes vertically.
		const oveAreNum = Math.max( 0, oveWidNum ) * Math.max( 0, oveHeiNum );                                       // What: Overlap Area Number. Why: How much the controls share. How: This multiplies the overlap's sides.
		const minAreNum = Math.min( oneRecObj.width * oneRecObj.height, twoRecObj.width * twoRecObj.height );        // What: Minimum Area Number. Why: An overlap is judged against the smaller control. How: This finds its area.



		if ( oveAreNum > 4 && oveAreNum > minAreNum * 0.1 ) issMesArr.push( `controls overlap: ${ desEleFun( oneDomEle ) } and ${ desEleFun( twoDomEle ) }` ); // What: Overlap Report. Why: Overlapping controls are hard to tap and look broken. How: This reports a real overlap.


	}



	return issMesArr; // What: Issues Return. Why: The test reports every problem. How: This returns the list.


} );

// #endregion meaLayFun

// #endregion Helpers



// #region Module Init

test.use( { contextOptions : { reducedMotion : 'reduce' } } ); // What: Page Options Call. Why: Layouts are measured at rest, not mid-animation. How: This turns on reduced motion.



for ( const vieWidNum of VIE_WID_ARR ) for ( const pagStaObj of PAG_STA_ARR ) test( `${ pagStaObj.namStr } at ${ vieWidNum }px`, async ( { page : curPagObj }, tesInfObj ) => { // What: Layout Test Loop. Why: Every state is checked at every width. How: This declares one test per pair.


	await curPagObj.setViewportSize({ // What: Viewport Size Call. Why: Each test measures one width. How: This sizes the page, phone-tall below tablet width.


		height : vieWidNum < 768 ? 812 : 900, // What: Height. Why: Phones are tall and narrow, tablets and desktops less so. How: This picks a phone height below tablet width.
		width  : vieWidNum                    // What: Width. Why: Each test runs at one width. How: This is that width.


	});



	await opeFixFun( curPagObj ); // What: App Open Call. Why: Layouts are measured on real data. How: This opens the backup on the fixed day.



	if ( pagStaObj.tabStr !== 'today' ) await selTabFun( curPagObj, pagStaObj.tabStr ); // What: Tab Switch Call. Why: Each state lives on a tab. How: This switches to it.



	await pagStaObj.preFun( curPagObj ); // What: State Setup Call. Why: Some states open editors or sections first. How: This runs the state's setup.



	await curPagObj.waitForTimeout( 500 ); // What: Settle Wait. Why: Layout can shift for a moment after opening things. How: This waits half a second.



	mkdirSync( OUT_DIR_STR, { recursive : true } ); // What: Output Folder Call. Why: Screenshots need their folder. How: This creates it.



	const shoBufObj = await curPagObj.screenshot( { fullPage : true, path : new URL( `${ pagStaObj.namStr }-${ vieWidNum }.png`, OUT_DIR_STR ).pathname } ); // What: Screenshot Buffer Object. Why: Some problems only show to the eye. How: This saves and keeps a full-page screenshot.



	await tesInfObj.attach( 'screenshot', { body : shoBufObj, contentType : 'image/png' } ); // What: Screenshot Attach Call. Why: The report shows each layout. How: This attaches the screenshot.



	const issMesArr = await meaLayFun( curPagObj ); // What: Issue Message Array. Why: The layout's measured problems. How: This measures the page.



	expect( issMesArr, issMesArr.join( '\n' ) ).toEqual( [] ); // What: No Problems Assertion. Why: The layout passes only when every check held. How: This expects the list empty.


} );

// #endregion Module Init


