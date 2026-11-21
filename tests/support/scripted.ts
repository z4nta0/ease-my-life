


// #region Imports

import type { Page } from '@playwright/test'; // What: Page. Why: The name and keyboard checks drive a Playwright page. How: This types their page parameters.

// #endregion Imports



/**
 * scripted.ts = Scripted Checks
 *
 * @summary
 * The name and keyboard checks axe-core can't make, shared by the app's
 * scripted spec and the legal pages' spec. Names: every link and button in
 * the accessibility tree has a name, no name carries a decorative glyph such
 * as an arrow, and every shown link that opens a new tab says so. Keyboard:
 * no element takes a positive tabindex, and a Tab walk reaches its end
 * without getting trapped, never moves backwards through the document, lands
 * only on stops that are on screen, not covered by anything else, and visibly
 * changed by focus, leaves no stop it should reach unreached, and finds a
 * state's open pop-up closed once focus moves past it. Each check returns a
 * list of the problems it finds, by element, for its spec to assert empty.
 *
 * Sections:
 *  - Constants
 *  - Helpers
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const GLY_DEC_REG = /[←↑→↓·•]/;                             // What: Glyph Decorative Regular Expression. Why: A decorative glyph inside a name is read aloud as noise, such as right arrow. How: This matches the arrows and dots an interface draws as decoration.
const TAB_HIN_REG = /\(opens (?:[^()"]+ )?in a new tab\)"/; // What: Tab Hint Regular Expression. Why: A link that opens a new tab has to say so at the end of its announced name. How: This matches the whole note, "(opens in a new tab)" or one naming where it goes, followed by the closing quote of the name.
const TAB_MAX_NUM = 300;                                    // What: Tab Maximum Number. Why: A keyboard trap would otherwise keep the walk going forever. How: This caps the walk at far more Tab presses than any one state has stops.

// #endregion Constants



// #region Helpers

// #region namProFun

/**
 * namProFun = Name Problems Function
 *
 * @summary
 * Reads the page's accessibility tree, the same tree a screen reader reads,
 * and returns a problem for every link or button with no name, for every one
 * whose name contains a decorative glyph that should have been hidden, and for
 * every shown link that opens a new tab without the tree reading it as a link
 * or without saying so at the end of its name. Elements hidden from assistive
 * technology don't appear in the tree, so decorative icons hidden from it are
 * never counted. A tree with no link or button at all is a problem too, since
 * every page it reads shows at least one, such as the tab bar's buttons.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page to read.
 *
 * @returns A promise that resolves with every naming problem found.
 * @see {@link proLisArr}
 *
 * @example
 * ```ts
 * namProFun(page) // => [ '- link "Home →" has a decorative glyph ...' ]
 * ```
 *
*/

async function namProFun ( curPagObj : Page ) : Promise< string[] > {


	// #region Control Name Check

	const ariSnaStr = await curPagObj.locator( 'body' ).ariaSnapshot();    // What: ARIA Snapshot String. Why: The accessibility tree shows each control's role and announced name. How: This reads the body's tree as text, one node per line.
	const conLinArr = ariSnaStr.match( /- (link|button)\b[^\n]*/g ) || []; // What: Control Line Array. Why: Only links and buttons are checked here. How: This keeps every tree line for one of those roles.

	const proLisArr : string[] = []; // What: Problem List Array. Why: Every problem should be reported, not just the first. How: This collects them.


	if ( !conLinArr.length ) proLisArr.push( 'the accessibility tree lists no link or button' ); // What: Empty Tree Check. Why: A snapshot that yields no controls, such as after a change to its format, would pass without checking any name, while every page this reads shows at least one. How: This records a problem when no link or button line was found.



	for ( const conLinStr of conLinArr ) { // What: Control Line Loop. Why: Each link and button is judged on its own. How: This reads each line's name and records what's wrong with it.


		const conNamStr = ( conLinStr.match( /"([^"]*)"/ ) || [] )[ 1 ] || ''; // What: Control Name String. Why: The announced name sits in quotes after the role. How: This takes the quoted text, or an empty name when there's none.


		if ( !conNamStr.trim() ) proLisArr.push( `${ conLinStr } has no name` ); // What: Missing Name Check. Why: A control with no name is announced as just its role. How: This records the line when its name is empty.

		else if ( GLY_DEC_REG.test( conNamStr ) ) proLisArr.push( `${ conLinStr } has a decorative glyph in its name` ); // What: Glyph Name Check. Why: A decorative arrow in a name is read aloud. How: This records the line when its name contains one.


	}

	// #endregion Control Name Check



	// #region Tab Link Check

	const tabLinArr = await curPagObj.locator( 'a[target="_blank"]' ).all(); // What: Tab Link Array. Why: A link that opens a new tab has to say so in its name. How: This lists every link with a blank target.


	for ( const tabLinObj of tabLinArr ) { // What: Tab Link Loop. Why: Each new tab link is judged on its own. How: This reads each shown link's announced name and records one that doesn't mention the new tab.


		if ( !await tabLinObj.isVisible() ) continue; // What: Hidden Link Guard. Why: A link out of sight, such as one in a closed panel, isn't announced. How: This skips it.



		const tabSnaStr = ( await tabLinObj.ariaSnapshot() ).split( '\n' )[ 0 ]; // What: Tab Snapshot String. Why: The link's own tree line holds its role and announced name. How: This reads the link's tree and keeps its first line.


		if ( !tabSnaStr.startsWith( '- link' ) ) proLisArr.push( `a new tab link reads as "${ tabSnaStr }" rather than as a link` ); // What: Tab Role Check. Why: A shown new tab link that the tree doesn't read as a link would otherwise slip past the hint check. How: This records the link's line when it doesn't open with the link role.

		else if ( !TAB_HIN_REG.test( tabSnaStr ) ) proLisArr.push( `${ tabSnaStr } opens a new tab without saying so` ); // What: Tab Hint Check. Why: A screen reader user should know before a new tab opens. How: This records a link whose tree line names it without ending in the note.


	}

	// #endregion Tab Link Check



	return proLisArr; // What: Problem List Return. Why: The recorded problems are the check's result. How: This hands back every problem found.


}

// #endregion namProFun



// #region scrSetFun

/**
 * scrSetFun = Scroll Settled Function
 *
 * @summary
 * Runs inside the page and resolves once the page has stopped scrolling,
 * meaning its scroll position hasn't changed for 15 frames in a row (about a
 * quarter of a second), or after 2 seconds at most. A stop is measured only
 * once the page has stopped scrolling, so its position is where it ends up.
 * Passed to Playwright's evaluate, so it can't read anything from this file.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns A promise that settles once scrolling has stopped, with no value.
 *
 * @example
 * ```ts
 * page.evaluate(scrSetFun) // => Promise<void>
 * ```
 *
*/

function scrSetFun () : Promise< void > {


	return new Promise( ( resSetFun ) => { // What: Settle Promise Return. Why: The walk waits on the page's frames. How: This resolves from inside a frame loop once scrolling has stopped.


		const staTimNum = performance.now(); // What: Start Time Number. Why: A page that never stops scrolling shouldn't hang the walk. How: This records when the wait began.

		let preScrNum = scrollY; // What: Previous Scroll Number. Why: Each frame is compared with the one before. How: This holds the last frame's scroll position.
		let staFraNum = 0;       // What: Stable Frame Number. Why: Scrolling has settled only after several unchanged frames. How: This counts them in a row.


		const fraCheFun = () => { // What: Frame Check Function. Why: Scrolling is judged once per frame. How: This counts unchanged frames and resolves after 15 of them or 2 seconds.


			staFraNum = scrollY === preScrNum ? staFraNum + 1 : 0; // What: Stable Frame Update. Why: Any movement restarts the count. How: This adds one for an unchanged frame and resets it otherwise.

			preScrNum = scrollY; // What: Previous Scroll Update. Why: The next frame is compared with this one. How: This stores this frame's position.



			if ( staFraNum >= 15 || performance.now() - staTimNum > 2000 ) { resSetFun(); return; } // What: Settled Guard. Why: The wait ends once scrolling has stopped, or after 2 seconds. How: This resolves the promise and stops the loop.



			requestAnimationFrame( fraCheFun ); // What: Next Frame Call. Why: Scrolling is checked again next frame. How: This schedules the check.


		};


		requestAnimationFrame( fraCheFun ); // What: First Frame Call. Why: The loop starts on the next frame. How: This schedules the first check.


	} );


}

// #endregion scrSetFun



type StoInfTyp = { // What: Stop Information Type. Why: The keyboard walk judges each stop outside the page. How: This describes what the page reports about one stop.


	befBoo : boolean, // What: Before Boolean. Why: Focus should move forward through the page. How: This is true when the stop comes earlier in the document than the stop before it.
	covBoo : boolean, // What: Covered Boolean. Why: A stop hidden behind another element can't be seen while focused. How: This is true when something else sits on top of the stop's center.
	desStr : string,  // What: Description String. Why: A problem should name the element a person would recognize. How: This joins the stop's tag and its label or text.
	firBoo : boolean, // What: First Boolean. Why: Focus coming back to the first stop means the walk went all the way around. How: This is true when the stop is the walk's first stop again.
	indBoo : boolean, // What: Indicator Boolean. Why: A keyboard user has to see where focus is. How: This is true when focusing the stop changes how it looks.
	samBoo : boolean, // What: Same Boolean. Why: Focus staying put after a press is how Firefox leaves its last stop. How: This is true when the stop is the one the previous press reached, a date or time field only once it has held focus through more presses than it has parts.
	visBoo : boolean  // What: Visible Boolean. Why: A stop off screen leaves a keyboard user lost. How: This is true when the stop has a size and overlaps the viewport.


};

// #region stoInfFun

/**
 * stoInfFun = Stop Information Function
 *
 * @summary
 * Runs inside the page after each Tab press and describes the focused stop, or
 * returns null once focus has left the page: onto the body or the root, to
 * nothing, or out of the document entirely. (Firefox does none of these after
 * its last stop; keyProFun catches it there instead, when focus stays on the
 * same stop. A date or time field, whose parts Chromium tabs through one press
 * at a time, counts as staying only after more presses than it has parts.) The
 * focus indicator is judged the first time the walk reaches a stop, by
 * blurring the stop for a moment and comparing the styles a focus indicator
 * usually changes (outline, shadow, border, background, color, and underline),
 * then focusing it again so the walk continues from it. Coverage is judged by
 * asking which element sits at the stop's center: anything other than the stop
 * or one of its own descendants means the stop is hidden behind it. A native
 * control hidden at no size, such as a custom-drawn radio, is judged by its
 * label instead, since that's what shows its focus. Order is judged by asking
 * the document directly whether the stop comes before the previous one, and
 * the first and previous stops are remembered on the window, so the walk stays
 * right even when the page adds or removes elements as focus moves. Every stop
 * reached is added to a list on the window too, for {@link tabStoFun} to read
 * once the walk ends. Passed to Playwright's evaluate, so it can't read
 * anything from this file.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns The stop's description, or null when the walk has ended.
 *
 * @example
 * ```ts
 * page.evaluate(stoInfFun) // => { befBoo, covBoo, desStr, firBoo, ... }
 * ```
 *
*/

function stoInfFun () : StoInfTyp | null {


	// #region Active Element Reading

	const actCurEle = document.activeElement as HTMLElement | null; // What: Active Current Element. Why: The stop is whatever holds focus after the press. How: This reads the focused element. // What: Type Assertion Note. Why: activeElement types as Element, which has no blur or focus. How: Every element that can hold focus in this app is an HTMLElement.

	const actBodBoo = actCurEle === document.body || actCurEle === document.documentElement; // What: Active Body Boolean. Why: Focus resting on the body, or in Firefox on the root a state's opener focused to reset the Tab start, means no stop holds it. How: This compares the focused element with the body and the root.
	const actMisBoo = !actCurEle;                                                            // What: Active Missing Boolean. Why: Some engines report no focused element at all once focus leaves. How: This is true when there is none.
	const docBluBoo = !document.hasFocus();                                                  // What: Document Blurred Boolean. Why: Focus can leave for the browser's own interface. How: This is true when the document no longer has focus.

	const walDonBoo = actMisBoo || actBodBoo || docBluBoo; // What: Walk Done Boolean. Why: Any of the three means the walk has left the page. How: This combines them.

	// #endregion Active Element Reading


	if ( walDonBoo ) return null; // What: Walk End Guard. Why: Focus on the body, nowhere, or outside the document means the walk has left the page. How: This returns null to end the walk.



	// #region Shown Element

	const actRecObj = actCurEle.getBoundingClientRect();                   // What: Active Rect Object. Why: A native control can be hidden at no size while its label stands in for it. How: This measures the focused element itself.
	const labCurEle = ( actCurEle as HTMLInputElement ).labels?.[ 0 ] || null; // What: Label Current Element. Why: A hidden radio or checkbox is drawn and shows its focus through its label. How: This reads the control's first label, or null. // What: Type Assertion Note. Why: Only form controls have labels. How: Any other element reads as having none.

	const hidConBoo = !!labCurEle && ( actRecObj.width === 0 || actRecObj.height === 0 ); // What: Hidden Control Boolean. Why: Only a control with no size of its own is judged by its label. How: This is true for a sizeless control that has a label.

	const shoCurEle = hidConBoo ? labCurEle! : actCurEle; // What: Shown Current Element. Why: Visibility, coverage, and the focus indicator are judged on what a person actually sees. How: This is the label for a hidden control and the stop itself otherwise. // What: Non-Null Note. Why: hidConBoo is only true when a label was found. How: The ! tells TypeScript it's set here.

	// #endregion Shown Element



	// #region Focus And Blurred Signatures

	const sigStyFun = () => { // What: Signature Style Function. Why: A focus indicator is any visible change between focused and unfocused. How: This reads the stop's styles as one string to compare.


		const styCurObj = getComputedStyle( shoCurEle ); // What: Style Current Object. Why: The stop's styles are compared as they're drawn now. How: This reads the computed styles of what a person sees, the stop or its label.



		return [ styCurObj.outlineStyle, styCurObj.outlineWidth, styCurObj.outlineColor, styCurObj.boxShadow, styCurObj.borderColor, styCurObj.backgroundColor, styCurObj.color, styCurObj.textDecorationLine ].join( '|' ); // What: Signature Return. Why: Two looks compare as one string. How: This joins every style a focus indicator usually changes.


	};


	const focSigStr = sigStyFun();                                      // What: Focused Signature String. Why: The stop's look while focused is the first half of the comparison. How: This reads it before anything changes.
	const newStoBoo = actCurEle !== Reflect.get( window, '__preStoEle' ); // What: New Stop Boolean. Why: A blur and refocus send a date or time field back to its first part, so a field met again would never move on to its next part. How: This is true when the stop isn't the one the previous press reached.



	const bluSigFun = () => { // What: Blurred Signature Function. Why: The stop's unfocused look completes the comparison, and the walk then continues from the stop. How: This removes focus for a moment, reads the same styles, and puts focus back where the Tab press left it.


		actCurEle.blur(); // What: Stop Blur Call. Why: The unfocused look is the other half of the comparison. How: This removes focus for a moment.


		const bluSigStr = sigStyFun(); // What: Blurred Signature String. Why: The stop's unfocused look completes the comparison. How: This reads the same styles after the blur.


		actCurEle.focus(); // What: Stop Refocus Call. Why: The walk continues from this stop. How: This puts focus back where the Tab press left it.



		return bluSigStr; // What: Blurred Signature Return. Why: The comparison reads the unfocused look. How: This hands it back.


	};


	const bluSigStr = newStoBoo ? bluSigFun() : ''; // What: Blurred Signature String. Why: Focus is judged once per stop, when the walk first reaches it, which leaves a date or time field free to move through its parts. How: This reads the unfocused look for a new stop, and is empty, never matching the focused look, for a stop met again.

	// #endregion Focus And Blurred Signatures



	// #region Stop Rect And Coverage

	const recCurObj = shoCurEle.getBoundingClientRect();                                                                       // What: Rect Current Object. Why: A focused stop has to be on screen and uncovered. How: This measures the stop, or its label for a hidden control.
	const fraRecObj = shoCurEle.getClientRects()[ 0 ] || recCurObj;                                                            // What: Fragment Rect Object. Why: A link that wraps onto two lines has a bounding box whose center can fall between its lines, on the text around it. How: This measures the stop's first line box, falling back to its whole box.
	const topCurEle = document.elementFromPoint( fraRecObj.left + fraRecObj.width / 2, fraRecObj.top + fraRecObj.height / 2 ); // What: Top Current Element. Why: Whatever is drawn on top at the stop's center is what a person sees there. How: This asks the page which element sits at the center of the stop's first line box.

	// #endregion Stop Rect And Coverage



	// #region Stop Label

	const ariLabStr = actCurEle.getAttribute( 'aria-label' ); // What: ARIA Label String. Why: A stop's own label names it best. How: This reads its aria-label, or null.
	const eleIdeStr = actCurEle.id;                           // What: Element Identifier String. Why: A form field without a label is still recognizable by its id. How: This reads the stop's id, empty when it has none.
	const eleTexStr = shoCurEle.textContent;                  // What: Element Text String. Why: A link or button is usually named by its text. How: This reads the stop's text, or its label's text for a hidden control.

	const stoLabStr = ariLabStr || eleIdeStr || eleTexStr || ''; // What: Stop Label String. Why: A problem should name the stop the way a person would recognize it. How: This takes the label, then the id, then the text, then nothing.

	// #endregion Stop Label



	// #region Visibility Geometry

	const botBelBoo = recCurObj.bottom > 0;        // What: Bottom Below Boolean. Why: A stop entirely above the viewport is off screen. How: This is true when its bottom edge sits below the viewport's top.
	const heiPosBoo = recCurObj.height > 0;        // What: Height Positive Boolean. Why: A stop with no height can't be seen. How: This is true when it has some height.
	const lefInsBoo = recCurObj.left < innerWidth; // What: Left Inside Boolean. Why: A stop entirely right of the viewport is off screen. How: This is true when its left edge sits inside the viewport's width.
	const rigInsBoo = recCurObj.right > 0;         // What: Right Inside Boolean. Why: A stop entirely left of the viewport is off screen. How: This is true when its right edge sits past the viewport's left.
	const topAboBoo = recCurObj.top < innerHeight; // What: Top Above Boolean. Why: A stop entirely below the viewport is off screen. How: This is true when its top edge sits above the viewport's bottom.
	const widPosBoo = recCurObj.width > 0;         // What: Width Positive Boolean. Why: A stop with no width can't be seen. How: This is true when it has some width.

	const visStoBoo = botBelBoo && heiPosBoo && lefInsBoo && rigInsBoo && topAboBoo && widPosBoo; // What: Visible Stop Boolean. Why: A focused stop has to be on screen. How: This is true when it has a size and overlaps the viewport.

	// #endregion Visibility Geometry



	// #region Stop Tracking

	const firStoEle = Reflect.get( window, '__firStoEle' ) as Element | undefined; // What: First Stop Element. Why: The walk ends when focus comes back to its first stop. How: This reads the first stop the page remembered, if any. // What: Type Assertion Note. Why: Reflect.get types the global as unknown. How: This function only ever stores an element there.
	const preStoEle = Reflect.get( window, '__preStoEle' ) as Element | undefined; // What: Previous Stop Element. Why: Each stop is compared with the one before it. How: This reads the previous stop the page remembered, if any. // What: Type Assertion Note. Why: Reflect.get types the global as unknown. How: This function only ever stores an element there.

	const befStoBoo = !!preStoEle && preStoEle.isConnected && preStoEle !== actCurEle && !!( preStoEle.compareDocumentPosition( actCurEle ) & Node.DOCUMENT_POSITION_PRECEDING ); // What: Before Stop Boolean. Why: Focus should move forward through the page. How: This asks the document directly whether the stop precedes the previous one, skipping a previous stop the page has since replaced, which keeps it right even when the page adds or removes elements during the walk, as help mode's overlay does while it scrolls a badge's target into view.
	const mulFieBoo = actCurEle.matches( 'input[type="date"], input[type="datetime-local"], input[type="month"], input[type="time"], input[type="week"]' );                       // What: Multi-Field Boolean. Why: Chromium moves Tab through a date or time field's parts, such as its hours and minutes, so focus stays on the same field for several presses. How: This is true when the stop is one of those fields.
	const samCouNum = actCurEle === preStoEle ? ( Number( Reflect.get( window, '__samCouNum' ) ) || 0 ) + 1 : 0;                                                                  // What: Same Count Number. Why: A field with parts holds focus for a few presses in a row without the walk having ended. How: This counts the presses in a row that left focus on the same stop, 0 when it moved.



	if ( !firStoEle ) Reflect.set( window, '__firStoEle', actCurEle ); // What: First Stop Record. Why: The walk ends if focus comes back to it. How: This remembers the first stop the walk reaches.



	Reflect.set( window, '__preStoEle', actCurEle );                                                                                     // What: Previous Stop Record. Why: The next stop is compared with this one. How: This remembers it.
	Reflect.set( window, '__reaStoArr', [ ...( ( Reflect.get( window, '__reaStoArr' ) as Element[] | undefined ) || [] ), actCurEle ] ); // What: Reached Stops Record. Why: A trap that cycles back to the first stop or holds focus on one ends the walk the way an ordinary end does, leaving later stops unreached, which only a list of where the walk has been can show. How: This adds the stop to the list the page keeps of every stop reached. // What: Type Assertion Note. Why: Reflect.get types the global as unknown. How: This function only ever stores an array of elements there.
	Reflect.set( window, '__samCouNum', samCouNum );                                                                                     // What: Same Count Record. Why: The next press's count builds on this one. How: This remembers it.

	// #endregion Stop Tracking



	return { // What: Stop Information Return. Why: The walk judges each stop outside the page. How: This hands back the stop's order, coverage, description, first-stop check, indicator, repeats, and visibility.


		befBoo : befStoBoo,                                                                     // What: Before Boolean. Why: Focus should move forward through the page. How: This reads whether the stop comes earlier in the document than the last one.
		covBoo : !!topCurEle && !shoCurEle.contains( topCurEle ),                               // What: Covered Boolean. Why: The stop is hidden when something else is on top of it. How: This is true when the top element at its center is neither the stop (or its label) nor inside it.
		desStr : `${ actCurEle.tagName.toLowerCase() } "${ stoLabStr.trim().slice( 0, 40 ) }"`, // What: Description String. Why: A problem should name the element a person would recognize. How: This joins the tag with the first 40 characters of its label, id, or text.
		firBoo : actCurEle === firStoEle,                                                       // What: First Boolean. Why: Focus back on the first stop means the walk went all the way around. How: This compares the stop with the remembered first one.
		indBoo : focSigStr !== bluSigStr,                                                       // What: Indicator Boolean. Why: A keyboard user has to see where focus is. How: This is true when focusing the stop changes how it looks.
		samBoo : samCouNum > ( mulFieBoo ? 6 : 0 ),                                             // What: Same Boolean. Why: Focus staying put after a press means the walk has left the page in Firefox. How: This is true once focus stays on the same stop, or for a date or time field, once it has stayed through more presses than such a field has parts.
		visBoo : visStoBoo                                                                      // What: Visible Boolean. Why: A stop off screen leaves a keyboard user lost. How: This reads whether the stop has a size and overlaps the viewport.


	};


}

// #endregion stoInfFun



// #region tabStoFun

/**
 * tabStoFun = Tab Stops Function
 *
 * @summary
 * Runs inside the page once the Tab walk ends and lists the elements a Tab
 * press should have reached but never did: links with an address, buttons, and
 * form fields, plus anything else given a tabindex of 0 or more, leaving out
 * what's disabled, inert, or not drawn, a radio the browser skips (every one
 * but the checked one in its group, or but the first when none is checked), a
 * color field when colSkiBoo says the engine is WebKit, what sits outside an
 * open modal dialog, what comes before the walk's first stop, and every stop
 * {@link stoInfFun} recorded, along with what sits inside a live region, since
 * help mode's overlay is one that replaces its badges with copies as it places
 * them. Each one is described the way stoInfFun describes a stop. Passed to
 * Playwright's evaluate, so it can't read anything from this file.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param colSkiBoo - Color Skip Boolean: True in WebKit, which never tabs to
 *                    a color field, even on a bare page (measured), so none
 *                    counts as missing there.
 *
 * @returns The description of every element Tab should have reached but
 *          didn't.
 *
 * @example
 * ```ts
 * page.evaluate(tabStoFun, false) // => [ 'button "Save"' ]
 * ```
 *
*/

function tabStoFun ( colSkiBoo : boolean ) : string[] {


	const desEleFun = ( eleCurEle : Element ) => `${ eleCurEle.tagName.toLowerCase() } "${ ( eleCurEle.getAttribute( 'aria-label' ) || eleCurEle.id || eleCurEle.textContent || '' ).trim().slice( 0, 40 ) }"`; // What: Describe Element Function. Why: A problem should name the element the way the walk names a stop. How: This joins the tag with the first 40 characters of its label, ID, or text.



	const firStoEle = Reflect.get( window, '__firStoEle' ) as Element;                         // What: First Stop Element. Why: An element before the walk's first stop was never part of the walk. How: This reads the first stop the page remembered. // What: Type Assertion Note. Why: Reflect.get types the global as unknown. How: The walk only lists unreached stops once it has reached one, so an element is stored there.
	const modDiaEle = document.querySelector( 'dialog:modal' );                                // What: Modal Dialog Element. Why: An open modal dialog keeps Tab inside itself. How: This finds the open one, or null when none is.
	const reaStoArr = ( Reflect.get( window, '__reaStoArr' ) as Element[] | undefined ) || []; // What: Reached Stop Array. Why: A stop the walk reached isn't missing. How: This reads the list stoInfFun kept, or an empty one. // What: Type Assertion Note. Why: Reflect.get types the global as unknown. How: stoInfFun only ever stores an array of elements there.



	return [ ...document.querySelectorAll< HTMLElement >( 'a[href], button, input, select, textarea, [tabindex]' ) ].filter( ( tabCurEle ) => { // What: Missing Stops Return. Why: The walk compares the stops it reached with every one it should have. How: This keeps each focusable element Tab should reach from the first stop on and never did, then describes each.


		// #region Radio Stop Lookup

		const radNamStr = tabCurEle instanceof HTMLInputElement && tabCurEle.type === 'radio' ? tabCurEle.name : '';                         // What: Radio Name String. Why: Tab reaches one radio per named group, the checked one, or the first when none is. How: This reads a radio's group name, empty for anything else.
		const radSelStr = `input[type="radio"][name="${ CSS.escape( radNamStr ) }"]`;                                                        // What: Radio Selector String. Why: The group's radios are found by their shared name. How: This builds a selector matching every radio named like this one.
		const radStoEle = radNamStr ? document.querySelector( `${ radSelStr }:checked` ) || document.querySelector( radSelStr ) : tabCurEle; // What: Radio Stop Element. Why: The group's one Tab stop is its checked radio, or its first when none is checked. How: This finds it for a radio in a group, and is the element itself for anything else.

		// #endregion Radio Stop Lookup



		// #region Missing Stop Conditions

		const aftFirBoo = tabCurEle === firStoEle || !!( firStoEle.compareDocumentPosition( tabCurEle ) & Node.DOCUMENT_POSITION_FOLLOWING ); // What: After First Boolean. Why: The walk starts at its first stop. How: This is true for the first stop and anything after it in the document.
		const enaTabBoo = tabCurEle.tabIndex >= 0 && !tabCurEle.matches( ':disabled' );                                                       // What: Enabled Tab Boolean. Why: Only an enabled element in the Tab order is a stop. How: This is true when its tabindex is 0 or more and it isn't disabled.
		const insModBoo = !modDiaEle || modDiaEle.contains( tabCurEle );                                                                      // What: Inside Modal Boolean. Why: The browser keeps Tab inside an open modal dialog. How: This is true when there's none, or the element sits inside it.
		const notColBoo = !colSkiBoo || !tabCurEle.matches( 'input[type="color"]' );                                                          // What: Not Color Boolean. Why: WebKit leaves color fields out of the Tab order. How: This is false for a color field when colSkiBoo is set, and true otherwise.
		const notIneBoo = !tabCurEle.closest( '[inert]' );                                                                                    // What: Not Inert Boolean. Why: An open layer makes the page behind it inert, out of the Tab order. How: This is true when no ancestor is inert.
		const notLivBoo = !tabCurEle.closest( '[aria-live]' );                                                                                // What: Not Live Boolean. Why: Help mode's overlay is a live region that replaces its badges with fresh copies as it places them while the page scrolls, so the walk can't tell a badge it reached from its replacement. How: This is true when no ancestor is a live region.
		const notReaBoo = !reaStoArr.includes( tabCurEle );                                                                                   // What: Not Reached Boolean. Why: Only a stop the walk never reached is missing. How: This is true when the element isn't on the reached list.
		const radStoBoo = radStoEle === tabCurEle;                                                                                            // What: Radio Stop Boolean. Why: A radio the browser skips isn't missing. How: This is true for its group's one stop, and for anything that isn't a radio.
		const shoEleBoo = tabCurEle.checkVisibility( { visibilityProperty : true } );                                                         // What: Shown Element Boolean. Why: An element that isn't drawn can't take focus. How: This is true when it's rendered and not hidden by visibility.

		const misStoBoo = aftFirBoo && enaTabBoo && insModBoo && notColBoo && notIneBoo && notLivBoo && notReaBoo && radStoBoo && shoEleBoo; // What: Missing Stop Boolean. Why: An element is missing only when every condition holds. How: This combines them.

		// #endregion Missing Stop Conditions



		return misStoBoo; // What: Missing Stop Return. Why: The filter keeps the missing stops. How: This hands back whether this element is one.


	} ).map( desEleFun ); // What: Stop Description Map. Why: A problem should name each missing stop. How: This describes each one through desEleFun.


}

// #endregion tabStoFun



// #region keyProFun

/**
 * keyProFun = Keyboard Problems Function
 *
 * @summary
 * Walks the page with the Tab key from the top, or from the control a state's
 * action left focused, which it first moves onto by keyboard so its focus ring
 * shows and it's checked like any stop (a panel focused only to be announced
 * isn't a stop, so the walk simply tabs on from it), and returns every
 * problem: a count of the elements with a positive tabindex, which overrides
 * the document order, and every stop that comes earlier in the document than
 * the stop before it, sits off screen, is covered by something else, or looks
 * the same focused and unfocused. Given an open pop-up's selector, it also
 * fails the walk when the pop-up still shows at the second stop, once focus
 * has moved past where it opened. The walk ends when focus leaves the page,
 * comes back to the first stop, or stays on the same stop after a press, which
 * is how Firefox leaves its last stop; one that hasn't ended within
 * TAB_MAX_NUM presses counts as a keyboard trap, and one that ends before
 * reaching any stop is a problem too. Since a trap that cycles back to the
 * first stop or holds focus on one stop ends the walk the same way, every
 * element from the first stop on that {@link tabStoFun} says Tab should have
 * reached but never did is a problem as well. WebKit only tabs to links with
 * Alt held, the way Safari does by default, so the walk presses Alt+Tab there.
 * It expects reduced motion already requested, so the page jumps to each stop
 * instead of gliding and focus styles appear at once, and each press waits for
 * scrolling to settle, so every stop is measured where and how it ends up.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curPagObj - Current Page Object: The page to walk.
 * @param engNamStr - Engine Name String: The browser the project runs in.
 * @param popSelStr - Pop-Up Selector String: The selector matching the
 *                    state's open pop-up, or null when none is open.
 *
 * @returns A promise that resolves with every keyboard problem found.
 * @see {@link proLisArr}
 *
 * @example
 * ```ts
 * keyProFun(page, 'webkit', null) // => [ 'button "Today" has no ...' ]
 * ```
 *
*/

async function keyProFun ( curPagObj : Page, engNamStr : string, popSelStr : string | null ) : Promise< string[] > {


	// #region Walk Setup

	const tabKeyStr = engNamStr === 'webkit' ? 'Alt+Tab' : 'Tab'; // What: Tab Key String. Why: WebKit skips links on a plain Tab, the way Safari does by default. How: This picks Alt+Tab there and Tab everywhere else.



	const posTabNum = await curPagObj.locator( '[tabindex]' ).evaluateAll( ( tabEleArr ) => tabEleArr.filter( ( tabCurEle ) => Number( tabCurEle.getAttribute( 'tabindex' ) ) > 0 ).length ); // What: Positive Tabindex Number. Why: A positive tabindex pulls an element ahead of the document order. How: This counts every element carrying one.

	const proLisArr : string[] = posTabNum ? [ `${ posTabNum } element(s) use a positive tabindex` ] : []; // What: Problem List Array. Why: Every problem should be reported, not just the first. How: This starts with the positive tabindex count, when there is one, and collects the rest during the walk.


	const staFocBoo = await curPagObj.evaluate( () => document.activeElement !== document.body && ( document.activeElement as HTMLElement ).tabIndex >= 0 ); // What: Start Focused Boolean. Why: A state's action can leave a control focused by a click, such as help mode's toggle, which a plain Tab would step past unchecked, while a panel focused by script to be announced is no stop, so Tab and Shift+Tab wouldn't come back to it. How: This is true when a stop in the Tab order holds focus before the walk. // What: Type Assertion Note. Why: activeElement types as Element, which has no tabIndex. How: Every element that can hold focus in this app is an HTMLElement.

	// #endregion Walk Setup



	// #region Tab Walk

	for ( let tabCouNum = 0; tabCouNum < TAB_MAX_NUM; tabCouNum++ ) { // What: Tab Walk Loop. Why: Every stop is checked in the order a keyboard user meets it. How: This presses Tab once per pass, up to the cap.


		if ( tabCouNum === 0 && staFocBoo ) await curPagObj.keyboard.press( tabKeyStr ); // What: Focused Start Step. Why: A control focused by a click shows no focus ring, so the walk has to reach it by keyboard. How: On the first pass only, this tabs one stop past it, so the press below can come back.



		await curPagObj.keyboard.press( tabCouNum === 0 && staFocBoo ? `Shift+${ tabKeyStr }` : tabKeyStr ); // What: Tab Press Call. Why: Each pass moves focus to the next stop. How: This presses the engine's Tab key, or on a focused start's first pass, Shift with it, landing back on the control the action left focused.

		await curPagObj.evaluate( scrSetFun ); // What: Scroll Settled Wait. Why: A stop is measured only once the page has stopped scrolling. How: This waits until the page has stopped scrolling.


		const stoInfObj = await curPagObj.evaluate( stoInfFun );              // What: Stop Information Object. Why: The stop is described and measured inside the page. How: This runs stoInfFun there.
		const walEndBoo = !stoInfObj || stoInfObj.firBoo || stoInfObj.samBoo; // What: Walk Ended Boolean. Why: Focus leaving the page, coming back around, or staying put means the walk is over. How: This checks each in turn, the later two only once a stop exists, so the chain stays inline. // What: Firefox Walk End Note. Why: Firefox moves focus out to its own interface after the last stop but still reports that stop as focused. How: Focus staying on the same stop after a press is read as the walk leaving the page.


		if ( walEndBoo && !tabCouNum ) return [ ...proLisArr, 'the Tab walk reached no stop' ]; // What: Empty Walk Guard. Why: A walk that ends before its first stop has checked nothing. How: This returns the problems with one more, ending the walk.



		if ( walEndBoo ) return [ ...proLisArr, ...( await curPagObj.evaluate( tabStoFun, engNamStr === 'webkit' ) ).map( ( misStoStr ) => `${ misStoStr } is never reached by Tab` ) ]; // What: Walk End Guard. Why: A walk that ends has found every problem the stop checks look for, but a trap that wraps around or holds focus on one stop ends it too, leaving later stops unreached. How: This returns the problems, ending the walk, with one more for every element from the first stop on that Tab should have reached but never did.



		if ( stoInfObj.befBoo ) proLisArr.push( `${ stoInfObj.desStr } comes before the previous stop in the document` ); // What: Order Check. Why: Focus should move forward through the page. How: This records a stop that jumps backwards.



		if ( !stoInfObj.visBoo ) proLisArr.push( `${ stoInfObj.desStr } is focused but not on screen` ); // What: On Screen Check. Why: A keyboard user can't act on what they can't see. How: This records a stop with no size or outside the viewport.

		else if ( stoInfObj.covBoo ) proLisArr.push( `${ stoInfObj.desStr } is focused but covered by another element` ); // What: Covered Check. Why: A stop hidden behind something else can't be seen either. How: This records an on-screen stop with another element on top of it.



		if ( !stoInfObj.indBoo ) proLisArr.push( `${ stoInfObj.desStr } has no visible focus indicator` ); // What: Indicator Check. Why: A keyboard user has to see where focus is. How: This records a stop that looks the same focused and unfocused.



		if ( popSelStr && tabCouNum === 1 && await curPagObj.locator( popSelStr ).first().isVisible() ) proLisArr.push( `the pop-up still shows once Tab moves on to ${ stoInfObj.desStr }` ); // What: Pop-Up Close Check. Why: A pop-up that doesn't hold focus has to close once focus moves past it, or it could cover the control a keyboard user reaches next. How: At the walk's second stop, this records a problem when the state's pop-up still shows, each operand guarding the next, so the chain stays inline.


	}



	proLisArr.push( `focus never left the page within ${ TAB_MAX_NUM } presses, a likely keyboard trap` ); // What: Trap Record Call. Why: A keyboard user must always be able to Tab away. How: The loop returns as soon as the walk ends, so reaching this line means it never did.

	// #endregion Tab Walk



	return proLisArr; // What: Problem List Return. Why: The recorded problems are the check's result. How: This hands back every problem the walk found.


}

// #endregion keyProFun

// #endregion Helpers



// #region Exports

export { keyProFun, namProFun }; // What: Named Exports. Why: The app's scripted spec and the legal pages' spec run the same name and keyboard checks. How: This exports both checks by name.

// #endregion Exports


