


// #region Imports

import { rhyPixFun } from '../utils/rhythm.ts';   // What: Rhythm Pixel Function. Why: Pixel layout math here needs the same step sizes the stylesheet uses. How: This returns a vertical rhythm step in pixels at the current root font size.
import { splSelFun } from '../utils/selector.ts'; // What: Split Selector Function. Why: A selector list's alternatives are tried in turn, and a comma nested inside :is() or :has() must not split one alternative in two. How: This is called by finTarFun to split the selector list it resolves.

// #endregion Imports



/**
 * geometry.ts = Geometry
 *
 * @summary
 * The measurement math behind help mode's highlights, with no React: finding
 * and measuring each help item's targets (Target Measurement), which the
 * guided tours measure their steps with too, keeping a highlight from
 * painting over fixed app chrome (Chrome Clipping), and shaping each
 * highlight's cutout and badge (Shape And Placement).
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

type BadRecTyp = { bottom : number, height : number, left : number, top : number, width : number };        // What: Badge Rect Type. Why: A help badge is placed as a fixed-size box. How: This describes badBoxFun's badge rect.
type ChrIteTyp = { chrDomEle : HTMLElement, chrRecObj : DOMRect, chrSelStr : string, chrSidStr : string }; // What: Chrome Item Type. Why: Highlights are clipped against each piece of fixed app chrome on the page. How: This describes one chrome element, its rect, its selector, and the side it sits on.
type EdgRecTyp = { bottom : number, left : number, right : number, top : number };                         // What: Edge Rect Type. Why: Clipping only ever moves a rect's four edges. How: This describes a rect by those edges.

type BoxRecTyp = EdgRecTyp & { height : number, width : number }; // What: Box Rect Type. Why: A unioned target also carries its size. How: This is an edge rect plus its height and width.



type PadSidTyp = { padBotNum : number, padLefNum : number, padRigNum : number, padTopNum : number }; // What: Pad Sides Type. Why: A highlight's padding can be cut short on each side separately. How: This describes how much survived on each side.
type ShaRadTyp = { radXcoNum : number, radYcoNum : number };                                         // What: Shape Radius Type. Why: A highlight cutout's corners follow its target's rounding on each axis. How: This holds the horizontal and vertical radius, in pixels.

type HelRecTyp = BoxRecTyp & Partial< PadSidTyp > & { alwBelBoo? : boolean, badAncNum? : number, labStr? : string, shaObj? : ShaRadTyp | null, tipWidNum? : number | null }; // What: Help Rect Type. Why: Help mode measures each catalog item into one rect that its badge, tip, mask, and title all read. How: This is a box rect plus its surviving pads, the always-below flag, a column group's badge anchor, a live label, its cutout shape, and a matched tip width.

// #endregion Types



// #region Constants

const CHR_PRI_OBJ : Record< string, number > = { '[data-element-name-hook~="appTabNav"]' : 2, '[data-element-name-hook~="ediBanDiv"]' : 2, '[data-element-name-hook~="groRaiAsi"]' : 1, '[data-element-name-hook~="setRaiAsi"]' : 1, '[data-element-name-hook~="todPagHed"]' : 1 }; // What: Chrome Priority Object. Why: A target that is part of one chrome item (e.g. the nav bar's own [data-tab-button-key] buttons, "part of" the appTabNav hook element) must still be clippable against a DIFFERENT chrome item it visually sits behind, but never against one it sits IN FRONT OF. How: This maps a chrome selector to a plain priority number; a higher number visually wins, and cliChrFun below skips clipping a target against any chrome item whose priority its own home chrome matches or beats (its own home chrome included). The ediBanDiv banner outranks the groRaiAsi rail specifically because on narrow viewports both become independently position:sticky near the same top offset, and the banner visually covers the rail wherever they overlap.

// #endregion Constants



// #region Helpers

// #region Target Measurement

// #region cliHorFun

/**
 * cliHorFun = Clip Horizontal Function
 *
 * @summary
 * Clips an element's rect horizontally against the element itself and every
 * ancestor below document.body that clips its own overflow-x, so the part of
 * an element scrolled past the edge of a scrollable row never counts toward a
 * highlight. An item like Pickers' "Picker Selection" matches every tab in a
 * horizontally scrollable row (picTabDiv), and once there are enough pickers
 * to overflow it, the ones scrolled out of view still report a real,
 * full-width getBoundingClientRect(); unioning them in would stretch the
 * highlight into empty space past the row's own clipped edge. It returns null
 * if the element ends up fully clipped away. It is deliberately
 * horizontal-only, since a guided tour's own scroll to its target settles the
 * vertical case, and clipping vertically too would fight that scroll while it
 * runs.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tarRecObj - Target Rect Object: The element's own unclipped
 *                    bounding rect.
 * @param tarDomEle - Target DOM Element: The element
 *                    tarRecObj belongs to, needed to read its own and its
 *                    ancestors' overflow-x styling.
 *
 * @returns A clipped { bottom, left, right, top } rect, or null once the
 *          element ends up fully clipped away.
 *
 * @example
 * ```ts
 * cliHorFun(tarRecObj, tarDomEle) // => clipped rect, or null
 * ```
 *
*/

function cliHorFun ( tarRecObj : EdgRecTyp, tarDomEle : HTMLElement ) : EdgRecTyp | null {


	// #region Working Rect

	const topCurNum = tarRecObj.top;    // What: Top Current Number. Why: The returned rect needs the incoming top edge, which this horizontal clamp never changes. How: This copies tarRecObj's own top.
	const botCurNum = tarRecObj.bottom; // What: Bottom Current Number. Why: The returned rect needs the incoming bottom edge, which this horizontal clamp never changes. How: This copies tarRecObj's own bottom.

	let lefCurNum = tarRecObj.left;  // What: Left Current Number. Why: The clamp below needs its own mutable copy of the incoming rect's own left edge. How: This starts as a plain copy of tarRecObj's own left.
	let rigCurNum = tarRecObj.right; // What: Right Current Number. Why: The clamp below needs its own mutable copy of the incoming rect's own right edge. How: This starts as a plain copy of tarRecObj's own right.

	// #endregion Working Rect



	// #region Own Overflow Clip

	const ownOveStr = getComputedStyle( tarDomEle ).overflowX; // What: Own Overflow String. Why: A target that is itself a horizontally-scrollable box must be clipped to its own visible client width, not its full scrollable content width. How: This reads tarDomEle's own computed overflow-x style.

	const ownAutBoo = ownOveStr === 'auto';                                  // What: Own Auto Boolean. Why: An overflow-x of auto clips the target's own content. How: This compares ownOveStr against 'auto'.
	const ownScrBoo = ownOveStr === 'scroll';                                // What: Own Scroll Boolean. Why: An overflow-x of scroll clips the target's own content. How: This compares ownOveStr against 'scroll'.
	const ownHidBoo = ownOveStr === 'hidden';                                // What: Own Hidden Boolean. Why: An overflow-x of hidden clips the target's own content. How: This compares ownOveStr against 'hidden'.
	const ownNarBoo = tarDomEle.clientWidth < ( rigCurNum - lefCurNum ) - 2; // What: Own Narrow Boolean. Why: Only a visible width meaningfully narrower than the reported rect needs the clamp. How: This compares tarDomEle's own clientWidth against the rect's width, with a 2px tolerance against float rounding.

	const ownCliBoo = ( ownAutBoo || ownScrBoo || ownHidBoo ) && ownNarBoo; // What: Own Clip Boolean. Why: The target needs its own clamp only when it clips its content and is narrower than its rect. How: This ANDs any of the 3 clipping overflow values with ownNarBoo.


	if ( ownCliBoo ) { // What: Self Overflow Guard. Why: Only a genuinely scrollable box whose visible width is meaningfully narrower than its reported rect needs this clamp at all. How: This reads ownCliBoo, which pairs the 3 CSS values that actually clip content with a 2px-tolerant width check.


		rigCurNum = lefCurNum + tarDomEle.clientWidth; // What: Right Clamp. Why: The right edge must stop at what is actually visible, not the full scrollable content width. How: This rebuilds rigCurNum from lefCurNum plus tarDomEle's own clientWidth.


	}

	// #endregion Own Overflow Clip



	// #region Ancestor Walk

	let curAncEle = tarDomEle.parentElement; // What: Current Ancestor Element. Why: A target nested inside a DIFFERENT scrollable ancestor also needs clipping against that ancestor's own visible bounds. How: This starts at tarDomEle's own parent and is reassigned by the loop below.


	while ( curAncEle && curAncEle !== document.body ) { // What: Ancestor Walk Loop. Why: Every scrollable ancestor between tarDomEle and the document body can further clip the working rect. How: This walks upward one parentElement at a time until it reaches document.body or runs out of ancestors.


		const ancOveStr = getComputedStyle( curAncEle ).overflowX; // What: Ancestor Overflow String. Why: Only a genuinely scrollable ancestor should clip anything. How: This reads curAncEle's own computed overflow-x style.

		const ancAutBoo = ancOveStr === 'auto';   // What: Ancestor Auto Boolean. Why: An overflow-x of auto clips the ancestor's content. How: This compares ancOveStr against 'auto'.
		const ancScrBoo = ancOveStr === 'scroll'; // What: Ancestor Scroll Boolean. Why: An overflow-x of scroll clips the ancestor's content. How: This compares ancOveStr against 'scroll'.
		const ancHidBoo = ancOveStr === 'hidden'; // What: Ancestor Hidden Boolean. Why: An overflow-x of hidden clips the ancestor's content. How: This compares ancOveStr against 'hidden'.

		const ancCliBoo = ancAutBoo || ancScrBoo || ancHidBoo; // What: Ancestor Clip Boolean. Why: Only an ancestor that clips its content can narrow the working rect. How: This ORs the 3 clipping overflow values above.


		if ( ancCliBoo ) { // What: Ancestor Overflow Guard. Why: A non-scrolling ancestor (the common case) has nothing to clip against. How: This reads ancCliBoo, which ORs the 3 CSS values that actually clip content.


			const ancRecObj = curAncEle.getBoundingClientRect(); // What: Ancestor Rect Object. Why: The clamp below needs the ancestor's own real on-screen bounds. How: This reads curAncEle's own bounding rect.

			lefCurNum = Math.max( lefCurNum, ancRecObj.left );  // What: Left Clamp. Why: The working rect must never extend past this ancestor's own visible left edge. How: This narrows lefCurNum to whichever is tighter between the working rect and ancRecObj.
			rigCurNum = Math.min( rigCurNum, ancRecObj.right ); // What: Right Clamp. Why: The working rect must never extend past this ancestor's own visible right edge. How: This narrows rigCurNum to whichever is tighter between the working rect and ancRecObj.



			if ( rigCurNum <= lefCurNum ) return null; // What: Fully Clipped Guard. Why: An element scrolled entirely out of this ancestor's visible bounds is not a real, clickable target at all. How: This returns null once the clamped width collapses to zero or less.


		}



		curAncEle = curAncEle.parentElement; // What: Ancestor Advance. Why: The walk must keep climbing toward the document body. How: This reassigns curAncEle to its own parentElement for the next loop iteration.


	}

	// #endregion Ancestor Walk



	return { bottom : botCurNum, left : lefCurNum, right : rigCurNum, top : topCurNum }; // What: Clipped Rect Return. Why: The caller needs the final, fully-clamped rect back. How: This builds the { bottom, left, right, top } shape every other rect helper in this file expects.


}

// #endregion cliHorFun



// #region finTarFun

/**
 * finTarFun = Find Targets Function
 *
 * @summary
 * Finds a selector list's visible targets: it tries each comma-separated
 * alternative in order (split by splSelFun) and returns the first
 * alternative's elements that have a real size. Help mode and the guided
 * tours both resolve selectors through it.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param selLisStr - Selector List String: A comma-separated CSS selector
 *                    list, tried left to right until one alternative
 *                    actually matches a visible element.
 *
 * @returns The first alternative's matched, currently-visible elements.
 * @see {@link tarEleArr}
 *
 * @example
 * ```ts
 * finTarFun(selLisStr) // => matched elements, or []
 * ```
 *
*/

function finTarFun ( selLisStr : string ) : HTMLElement[] {


	for ( const oneSelStr of splSelFun( selLisStr ) ) { // What: Selector Alternative Loop. Why: Each comma-separated alternative must be tried in order until one actually matches something visible. How: This walks selLisStr's own alternatives left to right.


		const tarEleArr = [ ...document.querySelectorAll< HTMLElement >( oneSelStr ) ] // What: Target Element Array. Why: Every element matching this one alternative needs collecting before it can be filtered down to visible ones. How: This spreads the NodeList from querySelectorAll into a plain array.
			.filter( ( curTarEle ) => { // What: Visibility Filter. Why: A matched element that is display:none or otherwise zero-sized should never count as a real, clickable target. How: This keeps only elements whose own bounding rect has a real width or height.


				const curRecObj = curTarEle.getBoundingClientRect(); // What: Current Rect Object. Why: The visibility check reads this element's own size. How: This reads curTarEle's own bounding rect.



				return curRecObj.width > 0 || curRecObj.height > 0; // What: Visible Size Return. Why: A zero-sized element is not a real target. How: This keeps the element once either dimension is positive.


			} );


		if ( tarEleArr.length ) return tarEleArr; // What: First Match Return. Why: An earlier alternative that actually matched something wins over a later one. How: This returns as soon as this alternative's own filtered array is non-empty.


	}



	return []; // What: No Match Return. Why: The caller always needs an array back, even when nothing matched at all. How: This returns an empty array once every alternative has been tried.


}

// #endregion finTarFun



// #region uniRecFun

/**
 * uniRecFun = Union Rect Function
 *
 * @summary
 * Unions a group of matched elements into one bounding rect. Each element's
 * own rect is first passed through {@link cliHorFun} so a scrolled-away
 * portion of any one of them never stretches the union into empty space.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tarEleArr - Target Element Array: The matched elements to union
 *                    together.
 *
 * @returns A { bottom, height, left, right, top, width } rect spanning every
 *          element in tarEleArr that survived clipping.
 *
 * @example
 * ```ts
 * uniRecFun(tarEleArr) // => union rect
 * ```
 *
*/

function uniRecFun ( tarEleArr : HTMLElement[] ) : BoxRecTyp {


	let topCurNum = Infinity;  // What: Top Current Number. Why: The union must start from a value any real rect's own top will immediately beat. How: This starts at Infinity, narrowed by Math.min as elements are folded in below.
	let lefCurNum = Infinity;  // What: Left Current Number. Why: The union must start from a value any real rect's own left will immediately beat. How: This starts at Infinity, narrowed by Math.min as elements are folded in below.
	let rigCurNum = -Infinity; // What: Right Current Number. Why: The union must start from a value any real rect's own right will immediately beat. How: This starts at -Infinity, widened by Math.max as elements are folded in below.
	let botCurNum = -Infinity; // What: Bottom Current Number. Why: The union must start from a value any real rect's own bottom will immediately beat. How: This starts at -Infinity, widened by Math.max as elements are folded in below.


	tarEleArr.forEach( ( curTarEle ) => { // What: Element Union Loop. Why: Each matched element can contribute to the overall union. How: This walks tarEleArr, folding each element's own clipped rect into the accumulator numbers above.


		// #region Element Clipping

		const cliRecObj = cliHorFun( curTarEle.getBoundingClientRect(), curTarEle ); // What: Clipped Rect Object. Why: A scrolled-away portion of this element must not stretch the union. How: This runs curTarEle's own bounding rect through cliHorFun.


		if ( !cliRecObj ) return; // What: Fully Clipped Guard. Why: An element clipped away entirely contributes nothing to the union. How: This skips the rest of this iteration when cliHorFun returned null.

		// #endregion Element Clipping



		// #region Union Folding

		topCurNum = Math.min( topCurNum, cliRecObj.top );    // What: Top Fold. Why: The union's own top edge is whichever top is furthest out among every element seen so far. How: This narrows topCurNum to the smaller of the running value and this element's own top.
		lefCurNum = Math.min( lefCurNum, cliRecObj.left );   // What: Left Fold. Why: The union's own left edge is whichever left is furthest out among every element seen so far. How: This narrows lefCurNum to the smaller of the running value and this element's own left.
		rigCurNum = Math.max( rigCurNum, cliRecObj.right );  // What: Right Fold. Why: The union's own right edge is whichever right is furthest out among every element seen so far. How: This widens rigCurNum to the larger of the running value and this element's own right.
		botCurNum = Math.max( botCurNum, cliRecObj.bottom ); // What: Bottom Fold. Why: The union's own bottom edge is whichever bottom is furthest out among every element seen so far. How: This widens botCurNum to the larger of the running value and this element's own bottom.

		// #endregion Union Folding


	} );



	return { // What: Union Rect Return. Why: The caller needs the final unioned rect back, including its own derived width/height. How: This builds the shape every other rect helper in this file expects.


		bottom : botCurNum,             // What: Bottom Edge. Why: This is the union's own bottom edge. How: This is the widest bottom folded in above.
		height : botCurNum - topCurNum, // What: Height Value. Why: Callers size the highlight from this directly. How: This subtracts the union's top from its bottom.
		left   : lefCurNum,             // What: Left Edge. Why: This is the union's own left edge. How: This is the narrowest left folded in above.
		right  : rigCurNum,             // What: Right Edge. Why: This is the union's own right edge. How: This is the widest right folded in above.
		top    : topCurNum,             // What: Top Edge. Why: This is the union's own top edge. How: This is the narrowest top folded in above.
		width  : rigCurNum - lefCurNum  // What: Width Value. Why: Callers size the highlight from this directly. How: This subtracts the union's left from its right.


	};


}

// #endregion uniRecFun

// #endregion Target Measurement



// #region Chrome Clipping

// #region cliChrFun

/**
 * cliChrFun = Clip Chrome Function
 *
 * @summary
 * Clips a rect against every piece of always-on-top navigation chrome
 * it actually intersects, in the "natural" direction for that chrome
 * item's own edge (e.g. for a bottom-anchored tab bar, keeping
 * whatever is above it, since that is already in view without
 * scrolling further) rather than whichever side happens to have more
 * raw span; it only falls back to the opposite side when the natural
 * direction's own candidate would be degenerate. A target that is
 * itself part of one chrome item is exempted from clipping against
 * that same item (or against any other chrome item whose priority it
 * matches or beats; see {@link CHR_PRI_OBJ}), but stays clippable against a
 * DIFFERENT, unrelated chrome item it happens to visually overlap.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tarRecObj - Target Rect Object: The target's own rect to clip.
 * @param chrIteArr - Chrome Item Array: Every chrome item currently present
 *                    on the page, as { chrDomEle, chrRecObj, chrSelStr,
 *                    chrSidStr }
 *                    entries.
 * @param tarEleArr - Target Element Array: The target's own matched
 *                    element(s), used to detect which chrome item (if any)
 *                    this target is itself part of.
 *
 * @returns The clipped rect, or null once it collapses to zero or negative
 *          width/height.
 *
 * @example
 * ```ts
 * cliChrFun(tarRecObj, chrIteArr, tarEleArr) // => clipped rect, or null
 * ```
 *
*/

function cliChrFun ( tarRecObj : EdgRecTyp, chrIteArr : ChrIteTyp[], tarEleArr : HTMLElement[] ) : EdgRecTyp | null {


	let { bottom : botEdgNum, left : lefEdgNum, right : rigEdgNum, top : topEdgNum } = tarRecObj; // What: Bottom Edge Number. Why: Every clamp in the loop below needs its own mutable copy of tarRecObj's edges. How: This copies tarRecObj's bottom into a reassignable binding. // What: Left Edge Number. Why: The same clamps move the left edge. How: This copies tarRecObj's left. // What: Right Edge Number. Why: The same clamps move the right edge. How: This copies tarRecObj's right. // What: Top Edge Number. Why: The same clamps move the top edge. How: This copies tarRecObj's top.

	const homChrObj = tarEleArr && chrIteArr.find( ( { chrDomEle } ) => tarEleArr.some( ( curTarEle ) => chrDomEle === curTarEle || chrDomEle.contains( curTarEle ) ) ); // What: Home Chrome Object. Why: The loop below needs to know which chrome item (if any) this target is itself a member of, e.g. the streak ring is part of todPagHed. How: This finds the first chrome item whose own element contains (or is) one of tarEleArr's own elements.
	const homPriNum = homChrObj ? ( CHR_PRI_OBJ[ homChrObj.chrSelStr ] ?? 0 ) : -Infinity;                                                                               // What: Home Priority Number. Why: This target's own home chrome's priority is what every candidate chrome item below gets weighed against. How: This looks up homChrObj's own selector in CHR_PRI_OBJ, or stays at -Infinity when there is no home chrome at all.


	for ( const chrIteObj of chrIteArr ) { // What: Chrome Item Loop. Why: Every chrome item currently on the page is a candidate to clip this target against. How: This walks chrIteArr, clamping the working rect against whichever items actually apply.


		if ( homPriNum >= ( CHR_PRI_OBJ[ chrIteObj.chrSelStr ] ?? 0 ) ) continue; // What: Outranked Skip. Why: A target must never be clipped against a chrome item whose priority its own home chrome matches or beats, its own home chrome included. How: This skips this specific chrome item once homPriNum is at least as high as its own priority.



		const horOveBoo = lefEdgNum < chrIteObj.chrRecObj.right && rigEdgNum > chrIteObj.chrRecObj.left; // What: Horizontal Overlap Boolean. Why: An actual rect intersection needs both axes checked, not just one. How: This checks whether the working rect and this chrome item's own rect overlap horizontally.
		const verOveBoo = topEdgNum < chrIteObj.chrRecObj.bottom && botEdgNum > chrIteObj.chrRecObj.top; // What: Vertical Overlap Boolean. Why: An actual rect intersection needs both axes checked, not just one. How: This checks whether the working rect and this chrome item's own rect overlap vertically.


		if ( !horOveBoo || !verOveBoo ) continue; // What: No Intersection Guard. Why: A target sharing only a horizontal (or only a vertical) range with a chrome item, but not both, is not actually behind it. How: This skips this chrome item unless both axes genuinely overlap.



		if ( chrIteObj.chrSidStr === 'top' ) { // What: Top Chrome Clamp. Why: A top-anchored chrome item (the header) should clip whatever sits below it, preferring to keep the portion already below the chrome. How: This clamps the working rect's own top edge down to the chrome's own bottom edge when that still leaves a real, positive-height rect.


			const canTopNum = Math.max( topEdgNum, chrIteObj.chrRecObj.bottom ); // What: Candidate Top Number. Why: This is the natural-direction clamp candidate for a top-anchored chrome item. How: This pushes top down to at least the chrome's own bottom edge.


			if ( botEdgNum - canTopNum > 0 ) topEdgNum = canTopNum; // What: Natural Direction Win. Why: The natural direction (pushing the working rect's own top down to the chrome's own bottom edge) wins whenever it still leaves a real, positive-height rect. How: This adopts canTopNum as the new top.

			else botEdgNum = Math.min( botEdgNum, chrIteObj.chrRecObj.top ); // What: Natural Direction Fallback. Why: Once the natural direction would collapse the rect to zero or negative height, the opposite side is the only real content left. How: This clamps bottom up to the chrome's own top edge instead.


		}

		else if ( chrIteObj.chrSidStr === 'bottom' ) { // What: Bottom Chrome Clamp. Why: A bottom-anchored chrome item (the tab bar) should clip whatever sits above it, preferring to keep the portion already above the chrome. How: This clamps the working rect's own bottom edge up to the chrome's own top edge when that still leaves a real, positive-height rect.


			const canBotNum = Math.min( botEdgNum, chrIteObj.chrRecObj.top ); // What: Candidate Bottom Number. Why: This is the natural-direction clamp candidate for a bottom-anchored chrome item. How: This pulls bottom up to at most the chrome's own top edge.


			if ( canBotNum - topEdgNum > 0 ) botEdgNum = canBotNum; // What: Natural Direction Win. Why: The natural direction (pulling the working rect's own bottom up to the chrome's own top edge) wins whenever it still leaves a real, positive-height rect. How: This adopts canBotNum as the new bottom.

			else topEdgNum = Math.max( topEdgNum, chrIteObj.chrRecObj.bottom ); // What: Natural Direction Fallback. Why: Once the natural direction would collapse the rect to zero or negative height, the opposite side is the only real content left. How: This clamps top down to the chrome's own bottom edge instead.


		}

		else if ( chrIteObj.chrSidStr === 'left' ) { // What: Left Chrome Clamp. Why: A left-anchored chrome item should clip whatever sits to its right, preferring to keep the portion already to the right of the chrome. How: This clamps the working rect's own left edge right to the chrome's own right edge when that still leaves a real, positive-width rect.


			const canLefNum = Math.max( lefEdgNum, chrIteObj.chrRecObj.right ); // What: Candidate Left Number. Why: This is the natural-direction clamp candidate for a left-anchored chrome item. How: This pushes left right to at least the chrome's own right edge.


			if ( rigEdgNum - canLefNum > 0 ) lefEdgNum = canLefNum; // What: Natural Direction Win. Why: The natural direction (pushing the working rect's own left right to the chrome's own right edge) wins whenever it still leaves a real, positive-width rect. How: This adopts canLefNum as the new left.

			else rigEdgNum = Math.min( rigEdgNum, chrIteObj.chrRecObj.left ); // What: Natural Direction Fallback. Why: Once the natural direction would collapse the rect to zero or negative width, the opposite side is the only real content left. How: This clamps right left to the chrome's own left edge instead.


		}

		else if ( chrIteObj.chrSidStr === 'right' ) { // What: Right Chrome Clamp. Why: A right-anchored chrome item should clip whatever sits to its left, preferring to keep the portion already to the left of the chrome. How: This clamps the working rect's own right edge left to the chrome's own left edge when that still leaves a real, positive-width rect.


			const canRigNum = Math.min( rigEdgNum, chrIteObj.chrRecObj.left ); // What: Candidate Right Number. Why: This is the natural-direction clamp candidate for a right-anchored chrome item. How: This pulls right left to at most the chrome's own left edge.


			if ( canRigNum - lefEdgNum > 0 ) rigEdgNum = canRigNum; // What: Natural Direction Win. Why: The natural direction (pulling the working rect's own right left to the chrome's own left edge) wins whenever it still leaves a real, positive-width rect. How: This adopts canRigNum as the new right.

			else lefEdgNum = Math.max( lefEdgNum, chrIteObj.chrRecObj.right ); // What: Natural Direction Fallback. Why: Once the natural direction would collapse the rect to zero or negative width, the opposite side is the only real content left. How: This clamps left right to the chrome's own right edge instead.


		}


	}



	if ( rigEdgNum - lefEdgNum <= 0 || botEdgNum - topEdgNum <= 0 ) return null; // What: Degenerate Guard. Why: A rect clamped down to zero or negative size is not a real, visible target any more. How: This returns null once either axis collapses.



	return { bottom : botEdgNum, left : lefEdgNum, right : rigEdgNum, top : topEdgNum }; // What: Clipped Rect Return. Why: The caller needs the final, fully-clamped rect back. How: This builds the { bottom, left, right, top } shape every other rect helper in this file expects.


}

// #endregion cliChrFun



// #region claPadFun

/**
 * claPadFun = Clamp Pad Function
 *
 * @summary
 * The padding drawn around a target's core rect is added entirely
 * separately, at render time, from {@link cliChrFun}'s own clipping,
 * so a target whose core rect was already clamped flush to a chrome
 * edge (e.g. the Stats heatmap's bottom stopping exactly at the tab
 * bar's own top) would otherwise still get that same padding tacked on
 * afterward with no awareness of the boundary it had just been pulled
 * back from, re-bleeding the pad amount right back into the chrome.
 * This runs cliChrFun a second time on the PADDED box and reports how
 * much pad actually survived per side: full pad on sides with no
 * chrome to hit, less (down to 0) on a side that runs into one.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tarRecObj - Target Rect Object: The target's own unpadded core
 *                    rect.
 * @param padHorNum - Padding Horizontal Number: The horizontal padding to
 *                    request on each side.
 * @param padVerNum - Padding Vertical Number: The vertical padding to
 *                    request on each side.
 * @param chrIteArr - Chrome Item Array: {@link chrIteArr}
 * @param tarEleArr - Target Element Array: The target's own matched
 *                    element(s); forwarded to cliChrFun.
 *
 * @returns { padBotNum, padLefNum, padRigNum, padTopNum }, each the actual pad
 *          that survived clipping on that side.
 *
 * @example
 * ```ts
 * claPadFun(tarRecObj, padHorNum, padVerNum, ...) // => padding
 * ```
 *
*/

function claPadFun ( tarRecObj : EdgRecTyp, padHorNum : number, padVerNum : number, chrIteArr : ChrIteTyp[], tarEleArr : HTMLElement[] ) : PadSidTyp {


	const padRecObj = { // What: Padded Rect Object. Why: This is the candidate box before it is checked against chrome. How: This expands tarRecObj outward by padVerNum vertically and padHorNum horizontally.


		bottom : tarRecObj.bottom + padVerNum, // What: Padded Bottom. Why: The box grows downward by the vertical pad. How: This adds padVerNum to tarRecObj's own bottom.
		left   : tarRecObj.left - padHorNum,   // What: Padded Left. Why: The box grows leftward by the horizontal pad. How: This subtracts padHorNum from tarRecObj's own left.
		right  : tarRecObj.right + padHorNum,  // What: Padded Right. Why: The box grows rightward by the horizontal pad. How: This adds padHorNum to tarRecObj's own right.
		top    : tarRecObj.top - padVerNum     // What: Top. Why: The box grows upward by the vertical pad. How: This subtracts padVerNum from tarRecObj's own top.


	};


	const cliRecObj = cliChrFun( padRecObj, chrIteArr, tarEleArr ); // What: Clipped Rect Object. Why: The padded box must itself be re-clipped against chrome, or padding on an already-flush side would re-bleed into it. How: This runs padRecObj back through cliChrFun.


	if ( !cliRecObj ) return { padBotNum : 0, padLefNum : 0, padRigNum : 0, padTopNum : 0 }; // What: Fully Clipped Guard. Why: A padded box clipped away entirely has no pad left to report on any side. How: This returns all-zero padding once cliChrFun itself returned null.



	return { // What: Surviving Pad Return. Why: The caller needs to know how much of the requested pad actually survived on each individual side. How: This compares tarRecObj's own unpadded edges against cliRecObj's own clipped edges, one side at a time.


		padBotNum : cliRecObj.bottom - tarRecObj.bottom, // What: Pad Bottom Number. Why: The bottom side's own surviving pad is however far the clipped rect's own bottom still sits below tarRecObj's own bottom. How: This subtracts tarRecObj's own bottom from cliRecObj's own bottom.
		padLefNum : tarRecObj.left - cliRecObj.left,     // What: Pad Left Number. Why: The left side's own surviving pad is however far the clipped rect's own left still sits left of tarRecObj's own left. How: This subtracts cliRecObj's own left from tarRecObj's own left.
		padRigNum : cliRecObj.right - tarRecObj.right,   // What: Pad Right Number. Why: The right side's own surviving pad is however far the clipped rect's own right still sits right of tarRecObj's own right. How: This subtracts tarRecObj's own right from cliRecObj's own right.
		padTopNum : tarRecObj.top - cliRecObj.top        // What: Pad Top Number. Why: The top side's own surviving pad is however far the clipped rect's own top still sits above tarRecObj's own top. How: This subtracts cliRecObj's own top from tarRecObj's own top.


	};


}

// #endregion claPadFun



// #region detEdgFun

/**
 * detEdgFun = Detect Edge Function
 *
 * @summary
 * Picks the viewport edge a chrome element's rect sits closest to, returning
 * 'top', 'bottom', 'left', or 'right', so a caller knows which side that
 * chrome is anchored on. It takes the closest edge rather than requiring the
 * rect to touch it, so a chrome element that floats a little inside the
 * viewport still gets a side.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param chrRecObj - Chrome Rect Object: {@link chrRecObj}
 *
 * @returns Whichever of 'top', 'bottom', 'left' or 'right' chrRecObj sits
 *          closest to.
 *
 * @example
 * ```ts
 * detEdgFun(chrRecObj) // => 'top' | 'bottom' | 'left' | 'right'
 * ```
 *
*/

function detEdgFun ( chrRecObj : EdgRecTyp ) : string {


	const edgGapObj = { // What: Edge Gap Object. Why: Every one of the 4 viewport edges needs its own candidate gap computed before the smallest one can be picked. How: This is reduced below to whichever single entry holds the smallest gap.


		bottom : window.innerHeight - chrRecObj.bottom, // What: Bottom Gap. Why: This is how far chrRecObj's own bottom edge sits above the viewport's own bottom edge. How: This subtracts chrRecObj's own bottom from the viewport's own total height.
		left   : chrRecObj.left,                        // What: Left Gap. Why: This is how far chrRecObj's own left edge sits right of the viewport's own left edge, which is always x=0. How: This is chrRecObj's own left value used directly, with no subtraction needed.
		right  : window.innerWidth - chrRecObj.right,   // What: Right Gap. Why: This is how far chrRecObj's own right edge sits left of the viewport's own right edge. How: This subtracts chrRecObj's own right from the viewport's own total width.
		top    : chrRecObj.top                          // What: Top Gap. Why: This is how far chrRecObj's own top edge sits below the viewport's own top edge, which is always y=0. How: This is chrRecObj's own top value used directly, with no subtraction needed.


	};



	return Object.entries( edgGapObj ).reduce( ( besEntArr, curEntArr ) => ( curEntArr[ 1 ] < besEntArr[ 1 ] ? curEntArr : besEntArr ) )[ 0 ]; // What: Smallest Gap Return. Why: The caller needs the single edge name chrRecObj sits closest to, not the whole gap object. How: This reduces edgGapObj's own [name, gap] entries down to the smallest gap, then reads back just its own name.


}

// #endregion detEdgFun

// #endregion Chrome Clipping



// #region Shape And Placement

// #region badBoxFun

/**
 * badBoxFun = Badge Box Function
 *
 * @summary
 * Builds a badge's fixed-position rect from where it's drawn: a p02-step
 * square, its bottom and size worked out from that step.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param lefBadNum - Left Badge Number: The badge's left edge, in pixels.
 * @param topBadNum - Top Badge Number: {@link topBadNum}
 *
 * @returns { bottom, height, left, top, width } for the badge's own
 *          fixed-position placement.
 *
 * @example
 * ```ts
 * badBoxFun(lefBadNum, topBadNum) // => badge rect
 * ```
 *
*/

function badBoxFun ( lefBadNum : number, topBadNum : number ) : BadRecTyp {


	return { // What: Badge Rect Return. Why: The caller needs the final fixed-position badge rect back. How: This builds the { bottom, height, left, top, width } rect for the badge's fixed-position placement.


		bottom : topBadNum + rhyPixFun( 'p02' ), // What: Badge Bottom. Why: The badge's rect needs its own bottom edge. How: This adds the badge size to topBadNum. // Vertical Rhythm Base Plus 2 ~= 25.572px
		height : rhyPixFun( 'p02' ),             // What: Badge Height. Why: The badge is a fixed-size circle. How: This is the flat badge size. // Vertical Rhythm Base Plus 2 ~= 25.572px
		left   : lefBadNum,                      // What: Badge Left. Why: This is where the badge is drawn horizontally. How: This is the left position given.
		top    : topBadNum,                      // What: Top. Why: This is where the badge is drawn vertically. How: This is the top position given.
		width  : rhyPixFun( 'p02' )              // What: Badge Width. Why: The badge is a fixed-size circle. How: This is the flat badge size. // Vertical Rhythm Base Plus 2 ~= 25.572px


	};


}

// #endregion badBoxFun



// #region badRecFun

/**
 * badRecFun = Badge Rect Function
 *
 * @summary
 * Badge geometry, shared between where it is actually drawn and where an open
 * tip anchored to it should point: a p02-step circle overlapping the
 * highlighted box's own top-right corner (matching the "small corner marker"
 * design, distinct from InfTipCom's own inline-trigger placement). This falls
 * back to the top-LEFT corner instead when the top-right placement would run
 * the badge past the viewport's right edge, e.g. a target whose right edge
 * sits at or near the viewport's edge. cenBadBoo, true for groStr items,
 * centers the badge over the column's own top edge instead, since a column
 * group member's own right edge is a shared, touching boundary with its
 * neighbor rather than a free edge with neutral space past it.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tarRecObj - Target Rect Object: The already-padded target rect (its
 *                    own padTopNum/padRigNum/padLefNum, if any, came from
 *                    {@link claPadFun}) to anchor the badge to.
 * @param cenBadBoo - Center Badge Boolean: Whether to center the badge over
 *                    tarRecObj's own top edge (column group members)
 *                    instead of using the usual corner placement.
 *
 * @returns { bottom, height, left, top, width } for the badge's own
 *          fixed-position placement.
 *
 * @example
 * ```ts
 * badRecFun(tarRecObj, cenBadBoo) // => badge rect
 * ```
 *
*/

function badRecFun ( tarRecObj : BoxRecTyp & Partial< PadSidTyp >, cenBadBoo : boolean ) : BadRecTyp {


	// #region Vertical Position

	const padTopNum = tarRecObj.padTopNum ?? rhyPixFun( 'm02' );                                               // What: Pad Top Number. Why: The badge's own vertical anchor must match whatever pad actually survived clipping on this target's own top side, not the flat default. How: This reads tarRecObj's own padTopNum, falling back to the flat pad margin. // Vertical Rhythm Base Minus 2 ~= 8.304px
	const rawTopNum = tarRecObj.top - padTopNum - rhyPixFun( 'p02' ) / 2;                                      // What: Raw Top Number. Why: The badge's own natural vertical position overlaps up into the highlight box's own top-right corner. How: This subtracts the pad and half the badge's own size from the target's own top edge. // Vertical Rhythm Base Plus 2 ~= 25.572px
	const topBadNum = rawTopNum < -rhyPixFun( 'p02' ) ? rawTopNum : Math.max( rhyPixFun( 'm05' ), rawTopNum ); // What: Top Badge Number. Why: A badge only ALMOST on screen (within one badge-height of the top edge) should nudge down to stay visible, but a badge genuinely scrolled far above the viewport must not get dragged all the way down to that same floor. How: This only applies the small top floor once rawTopNum is no further than one badge-height above 0. // Vertical Rhythm Base Plus 2 ~= 25.572px, Vertical Rhythm Base Minus 5 ~= 3.572px

	// #endregion Vertical Position



	if ( cenBadBoo ) { // What: Center Mode Branch. Why: A column group member's own badge centers over its column's top edge instead of using the usual corner placement. How: This returns early with a horizontally-centered badge rect.


		const lefBadNum = tarRecObj.left + tarRecObj.width / 2 - rhyPixFun( 'p02' ) / 2; // What: Left Badge Number. Why: The badge must sit centered on the column's own horizontal midpoint. How: This computes the target's own midpoint and subtracts half the badge's own size. // Vertical Rhythm Base Plus 2 ~= 25.572px



		return badBoxFun( lefBadNum, topBadNum ); // What: Centered Badge Return. Why: A column group member's own badge is complete once centered. How: This builds the badge rect around the centered left position.


	}



	// #region Horizontal Position

	const padRigNum = tarRecObj.padRigNum ?? rhyPixFun( 'm02' );                                   // What: Pad Right Number. Why: The right-corner placement below needs whichever pad actually survived clipping on its own right side. How: This reads tarRecObj's own padRigNum, falling back to the flat pad margin. // Vertical Rhythm Base Minus 2 ~= 8.304px
	const padLefNum = tarRecObj.padLefNum ?? rhyPixFun( 'm02' );                                   // What: Pad Left Number. Why: The left-corner fallback below needs whichever pad actually survived clipping on its own left side. How: This reads tarRecObj's own padLefNum, falling back to the flat pad margin. // Vertical Rhythm Base Minus 2 ~= 8.304px
	const rigLefNum = tarRecObj.right + padRigNum - rhyPixFun( 'p02' ) / 2;                        // What: Right Left Number. Why: This is the badge's own candidate left position for the usual top-right corner placement. How: This adds the surviving right pad to the target's own right edge, then centers the badge on that point. // Vertical Rhythm Base Plus 2 ~= 25.572px
	const oveRigBoo = rigLefNum + rhyPixFun( 'p02' ) > window.innerWidth;                          // What: Overflows Right Boolean. Why: A target rect already clipped flush to the viewport can still overflow once the badge's own pad gap and half-width are added on top. How: This checks whether the right-corner candidate's own far edge would cross the viewport's own width. // Vertical Rhythm Base Plus 2 ~= 25.572px
	const lefBadNum = oveRigBoo ? tarRecObj.left - padLefNum - rhyPixFun( 'p02' ) / 2 : rigLefNum; // What: Left Badge Number. Why: The badge must fall back to the target's own top-LEFT corner whenever the right corner would overflow. How: This picks the left-corner candidate when oveRigBoo is true, otherwise the right-corner candidate. // Vertical Rhythm Base Plus 2 ~= 25.572px

	// #endregion Horizontal Position



	return badBoxFun( lefBadNum, topBadNum ); // What: Badge Rect Return. Why: The caller needs the final fixed-position badge rect back. How: This builds it from the corner placement's left and the vertical top.


}

// #endregion badRecFun



// #region defRadFun

/**
 * defRadFun = Default Radius Function
 *
 * @summary
 * Returns the app's default highlight radius, the vertical rhythm's m01
 * step in pixels on both axes, read at call time so it follows the root
 * font size. shaRadFun falls back to it whenever a target's own
 * border-radius can't be used.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns The default { radXcoNum, radYcoNum } radii.
 *
 * @example
 * ```ts
 * defRadFun() // => { radXcoNum: 11, radYcoNum: 11 }
 * ```
 *
*/

function defRadFun () : ShaRadTyp {


	return { // What: Default Radius Return. Why: Every fallback case needs the same default rounding on both axes. How: This reads the Vertical Rhythm m01 step in pixels for each radius.


		radXcoNum : rhyPixFun( 'm01' ), // What: Radius X-Coordinate Number. Why: The horizontal radius falls back to the app's own default. How: This reads the Vertical Rhythm m01 step in pixels. // Vertical Rhythm Base Minus 1 = 11px
		radYcoNum : rhyPixFun( 'm01' )  // What: Radius Y-Coordinate Number. Why: The vertical radius falls back to that same default. How: This reads the Vertical Rhythm m01 step in pixels. // Vertical Rhythm Base Minus 1 = 11px


	};


}

// #endregion defRadFun



// #region shaRadFun

/**
 * shaRadFun = Shape Radius Function
 *
 * @summary
 * Only meaningful for a SINGLE matched element. Reads the element's
 * own computed border-radius and reproduces it at the padded box's own
 * size: a percentage (almost always 50%, i.e. "fully round") scales
 * with the padded width/height the exact way CSS's own
 * border-radius:50% already does, so a padded circle stays a circle
 * and a padded pill stays a pill; a pixel value just gets the same pad
 * added back on top, to roughly preserve how rounded it reads once the
 * box has grown. shaOveStr of 'circle' skips CSS inspection entirely,
 * needed for a target like the progress ring whose round appearance
 * comes from an inner SVG circle rather than its own border-radius
 * (which reads as a plain 0). A "pill" source radius (comfortably past
 * any real rounded-corner value) is capped to a plain rounded rectangle
 * instead of chased exactly, since the SVG mask's own radXcoNum/radYcoNum math
 * renders it visibly faceted at such extreme values rather than a
 * smooth stadium, confirmed by an isolated test against plain CSS
 * border-radius.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tarDomEle - Target DOM Element: The single
 *                    matched element to read a radius from.
 * @param padWidNum - Padding Width Number: The padded box's own width, used to
 *                    scale a percentage radius.
 * @param padHeiNum - Padding Height Number: The padded box's own height, used
 *                    to scale a percentage radius.
 * @param shaOveStr - Shape Override String: 'circle' to skip CSS inspection
 *                    and force a perfect ellipse; otherwise omitted.
 *
 * @returns { radXcoNum, radYcoNum } for the SVG mask cutout and the highlight
 *          div's own border-radius.
 *
 * @example
 * ```ts
 * shaRadFun(tarDomEle, padWidNum, padHeiNum, shaOveStr) // => radii
 * ```
 *
*/

function shaRadFun ( tarDomEle : HTMLElement, padWidNum : number, padHeiNum : number, shaOveStr? : string ) : ShaRadTyp {


	if ( shaOveStr === 'circle' ) { // What: Circle Override Guard. Why: A target whose round appearance comes from an inner SVG shape rather than its own border-radius has nothing for getComputedStyle to read. How: This forces a perfect ellipse matching the padded box's own half-width/half-height.


		return { // What: Circle Override Return. Why: The caller needs a perfect ellipse matching the padded box, not a radius read off getComputedStyle. How: This halves padWidNum/padHeiNum directly.


			radXcoNum : padWidNum / 2, // What: Radius X-Coordinate Number. Why: A perfect ellipse's horizontal radius is half the padded box's width. How: This halves padWidNum.
			radYcoNum : padHeiNum / 2  // What: Radius Y-Coordinate Number. Why: A perfect ellipse's vertical radius is half the padded box's height. How: This halves padHeiNum.


		};


	}



	const radTokStr = ( getComputedStyle( tarDomEle ).borderRadius || '' ).split( ' ' )[ 0 ]; // What: Radius Token String. Why: A multi-corner border-radius value can list up to 4 tokens; only the first is meaningful for this file's own single-radius rounded-rect approximation. How: This reads tarDomEle's own computed border-radius and takes its first space-separated token.


	if ( !radTokStr ) return defRadFun(); // What: No Radius Guard. Why: An element with no computed border-radius at all falls back to the app's own default radius. How: This returns early once radTokStr is empty.



	if ( radTokStr.endsWith( '%' ) ) { // What: Percentage Radius Branch. Why: A percentage radius (almost always 50%) must scale with the padded box's own size rather than being reused as a literal pixel value. How: This parses the percentage and multiplies it against padWidNum/padHeiNum below.


		const perRatNum = parseFloat( radTokStr ) / 100; // What: Percent Ratio Number. Why: The parsed percentage needs converting to a plain 0-1 ratio before it can scale anything. How: This parses radTokStr as a float and divides by 100.


		if ( Number.isNaN( perRatNum ) ) return defRadFun(); // What: Unparseable Guard. Why: A malformed percentage token must not silently produce NaN radii. How: This falls back to the default radius once perRatNum failed to parse.



		return { // What: Percentage Radius Return. Why: The caller needs the percentage token actually scaled against the padded box's own size. How: This multiplies perRatNum against padWidNum/padHeiNum.


			radXcoNum : perRatNum * padWidNum, // What: Radius X-Coordinate Number. Why: The horizontal radius must scale by the same percentage the source element's own border-radius specified. How: This multiplies perRatNum against padWidNum.
			radYcoNum : perRatNum * padHeiNum  // What: Radius Y-Coordinate Number. Why: The vertical radius must scale by that same percentage too. How: This multiplies perRatNum against padHeiNum.


		};


	}



	const pixValNum = parseFloat( radTokStr ); // What: Pixel Value Number. Why: Every other radius form is a plain pixel value that needs parsing before it can be compared or added to. How: This parses radTokStr as a float.


	if ( Number.isNaN( pixValNum ) || pixValNum === 0 ) return defRadFun(); // What: Zero/Unparseable Guard. Why: A square-cornered element (0) or a malformed value both fall back to the default radius. How: This checks pixValNum against both failure cases at once.



	if ( pixValNum >= rhyPixFun( 'p02' ) ) return defRadFun(); // What: Pill Cap Guard. Why: A "pill" source radius renders visibly faceted through the SVG mask's own radXcoNum/radYcoNum math at extreme values, confirmed against plain CSS border-radius, and the cap sits one step above the radius scale's largest so it follows the root font size. How: This caps anything at or past the p02 rhythm step down to the app's own default radius instead. // Vertical Rhythm Base Plus 2 ~= 25.572px



	return { // What: Grown Radius Return. Why: A real, moderate rounded-corner value should keep reading as rounded once the box has grown by the pad amount. How: This adds the flat pad margin back onto the parsed pixel radius.


		radXcoNum : pixValNum + rhyPixFun( 'm02' ), // What: Radius X-Coordinate Number. Why: A pixel radius must grow by the same flat pad margin the box itself grew by, to roughly preserve how rounded it reads. How: This adds rhyPixFun( 'm02' ) onto the parsed pixel radius. // Vertical Rhythm Base Minus 2 ~= 8.304px
		radYcoNum : pixValNum + rhyPixFun( 'm02' )  // What: Radius Y-Coordinate Number. Why: Same reasoning as radXcoNum, since a border-radius grows uniformly on both axes for a plain pixel value. How: This adds rhyPixFun( 'm02' ) onto the parsed pixel radius. // Vertical Rhythm Base Minus 2 ~= 8.304px


	};


}

// #endregion shaRadFun

// #endregion Shape And Placement

// #endregion Helpers



// #region Exports

export { badRecFun, type BoxRecTyp, claPadFun, cliChrFun, cliHorFun, detEdgFun, finTarFun, type HelRecTyp, type PadSidTyp, shaRadFun, type ShaRadTyp, uniRecFun }; // What: Named Exports. Why: The measurement math is shared through these, with the four types for its rects, pads, and shapes. How: This exports the public helpers and the four types by name; everything else stays private to this file.

// #endregion Exports


