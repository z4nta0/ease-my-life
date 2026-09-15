


// #region Imports

import React from 'react'; // What: React. Why: This is the UI library HelButCom, HelOveCom and HelTipCom are built on. How: This is used directly (React.useState, React.useRef, React.useMemo, React.useCallback, React.useEffect, React.useLayoutEffect) throughout, instead of importing individual named hooks.


import { createPortal } from 'react-dom'; // What: Create Portal. Why: The dim layer, highlight spots, badges and the open tip must render into <body> so they clamp to the viewport instead of being clipped by an ancestor's own overflow. How: This is called with HelOveCom's own JSX and document.body inside its return.
import { Icon         } from './ui.jsx';  // What: Icon. Why: The navigation help item's own bodEle renders each tab's real nav icon next to its label. How: This is rendered once per tab entry inside NAV_HEL_OBJ's own bodEle JSX.

// #endregion Imports



// #region HelButCom

/**
 * help-mode.jsx = Help Mode
 *
 * @summary
 * On-demand "help mode": a per-page toggle that, once on, simultaneously
 * highlights every tagged element on the CURRENT page with a small
 * corner badge; clicking a badge reveals that element's tip (title plus
 * body, no Step N of N / Skip / Back / Next; see
 * onboarding-tour-runner.jsx for that, a genuinely different engine).
 * Deliberately not built on top of GuidedTour, since that engine is
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
 * plain local state and renders both HelButCom (a controlled toggle)
 * and HelOveCom from it, deliberately not a global bus like
 * emlTouObj. Since this app renders exactly one tab's component tree
 * at a time (no router, see CLAUDE.md), that local state resets to its
 * default (off) every time a tab unmounts and remounts, which is
 * exactly the "navigating away closes any open highlights, and the
 * page you land on does not auto-open its own" behavior this was
 * designed to have, for free, with no explicit reset needed.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



/**
 * HelButCom = Help Button Component
 *
 * @summary
 * The per-page toggle, usually placed in a page's own header. actModBoo
 * mirrors whether HelOveCom is currently showing anything for this
 * page.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actModBoo - Active Mode Boolean: Whether help mode is
 *                          currently on for this page; drives both the
 *                          "is-on" styling and the button's own pressed
 *                          state.
 * @param props.onClick   - On Click: Called when the button is pressed. The
 *                          caller owns actually flipping its own on/off
 *                          state.
 *
 * @returns The toggle's own single rendered button.
 *
 * @example
 * ```tsx
 * HelButCom({ actModBoo, onClick }) // => <HelButCom />
 * ```
 *
*/

function HelButCom ( { actModBoo, onClick } ) {


	return (


		<button
			type='button'
			className={ ` help-btn   ${ actModBoo ? 'is-on' : '' } ` }
			aria-pressed={ actModBoo }
			aria-label={ actModBoo ? 'Hide help highlights' : 'Show help highlights' }
			onClick={ onClick }
		>{ /* What: Help Toggle Button Element. Why: This is HelButCom's own single rendered element. How: This shows actModBoo as both its "is-on" class and its aria-pressed state, and calls onClick when pressed. */ }


			i


		</button>


	);


}

// #endregion HelButCom



// #region finTarFun

/**
 * finTarFun = Find Targets Function
 *
 * @summary
 * Same comma-separated-fallback semantics as the guided tour's own
 * findTargets, kept as an independent copy rather than a shared import:
 * these two engines are meant to stay decoupled (see this file's own
 * header comment), and the two copies are small enough that
 * duplicating them costs far less than the coupling would.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param selStr - Select String: A comma-separated CSS selector list, tried
 *                 left to right until one alternative actually matches a
 *                 visible element.
 *
 * @returns The first alternative's matched, currently-visible elements.
 *
 * @example
 * ```ts
 * finTarFun(selStr) // => matched elements, or []
 * ```
 *
*/

function finTarFun ( selStr ) {


	for ( const oneSelStr of selStr.split( ',' ) ) { // What: Selector Alternative Loop. Why: Each comma-separated alternative must be tried in order until one actually matches something visible. How: This walks selStr's own alternatives left to right.


		const tarEleArr = [ ...document.querySelectorAll( oneSelStr.trim() ) ] // What: Element Array. Why: Every element matching this one alternative needs collecting before it can be filtered down to visible ones. How: This spreads the live NodeList from querySelectorAll into a plain array.
			.filter( ( curTarEle ) => { const curRecObj = curTarEle.getBoundingClientRect(); return curRecObj.width > 0 || curRecObj.height > 0; } ); // What: Visibility Filter. Why: A matched element that is display:none or otherwise zero-sized should never count as a real, clickable target. How: This keeps only elements whose own bounding rect has a real width or height.



		if ( tarEleArr.length ) return tarEleArr; // What: First Match Return. Why: An earlier alternative that actually matched something wins over a later one. How: This returns as soon as this alternative's own filtered array is non-empty.


	}



	return []; // What: No Match Return. Why: The caller always needs an array back, even when nothing matched at all. How: This returns an empty array once every alternative has been tried.


}

// #endregion finTarFun



// #region cliHorFun

/**
 * cliHorFun = Clip Horizontal Overflow Function
 *
 * @summary
 * Same fix as onboarding-tour-runner.jsx's own clipHorizontalOverflow
 * (see its header comment there for the full story), ported here for
 * the same reason: an item like Pickers' "Picker Selection" matches
 * every tab in a horizontally-scrollable row (.picker-tabs), and once
 * there are enough pickers to overflow it, the ones scrolled out of
 * view still report a real, full-width getBoundingClientRect(); unioning
 * them in stretches the highlight into empty space past the row's own
 * clipped edge. This clips an element's rect against its own overflow-x
 * (if it is the scrollable box itself) and every scrollable ancestor's
 * visible bounds before it ever reaches uniRecFun's own union, and
 * returns null if an element ends up fully clipped away.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tarRecObj - Target Record Object: The element's own unclipped
 *                    bounding rect.
 * @param tarDomEle - Target Document-Object-Model Element: The element
 *                    tarRecObj belongs to, needed to read its own and its
 *                    ancestors' overflow-x styling.
 *
 * @returns A clipped { top, left, right, bottom } rect, or null once
 * the element ends up fully clipped away.
 *
 * @example
 * ```ts
 * cliHorFun(tarRecObj, tarDomEle) // => clipped rect, or null
 * ```
 *
*/

function cliHorFun ( tarRecObj, tarDomEle ) {


	let topCurNum = tarRecObj.top;    // What: Top Current Number. Why: The clamp below needs its own mutable copy of the incoming rect's own top edge. How: This starts as a plain copy of tarRecObj's own top.
	let lefCurNum = tarRecObj.left;   // What: Left Current Number. Why: The clamp below needs its own mutable copy of the incoming rect's own left edge. How: This starts as a plain copy of tarRecObj's own left.
	let rigCurNum = tarRecObj.right;  // What: Right Current Number. Why: The clamp below needs its own mutable copy of the incoming rect's own right edge. How: This starts as a plain copy of tarRecObj's own right.
	let botCurNum = tarRecObj.bottom; // What: Bottom Current Number. Why: The clamp below needs its own mutable copy of the incoming rect's own bottom edge. How: This starts as a plain copy of tarRecObj's own bottom.

	const ownOveStr = getComputedStyle( tarDomEle ).overflowX; // What: Own Overflow String. Why: A target that is itself a horizontally-scrollable box must be clipped to its own visible client width, not its full scrollable content width. How: This reads tarDomEle's own computed overflow-x style.


	if ( ( ownOveStr === 'auto' || ownOveStr === 'scroll' || ownOveStr === 'hidden' ) && tarDomEle.clientWidth < ( rigCurNum - lefCurNum ) - 2 ) { // What: Self Overflow Guard. Why: Only a genuinely scrollable box whose visible width is meaningfully narrower than its reported rect needs this clamp at all. How: This checks ownOveStr against the 3 CSS values that actually clip content, plus a 2px tolerance against float rounding.


		rigCurNum = lefCurNum + tarDomEle.clientWidth; // What: Right Clamp. Why: The right edge must stop at what is actually visible, not the full scrollable content width. How: This rebuilds rigCurNum from lefCurNum plus tarDomEle's own clientWidth.


	}



	let curAncEle = tarDomEle.parentElement; // What: Current Ancestor Element. Why: A target nested inside a DIFFERENT scrollable ancestor also needs clipping against that ancestor's own visible bounds. How: This starts at tarDomEle's own parent and is reassigned by the loop below.


	while ( curAncEle && curAncEle !== document.body ) { // What: Ancestor Walk Loop. Why: Every scrollable ancestor between tarDomEle and the document body can further clip the working rect. How: This walks upward one parentElement at a time until it reaches document.body or runs out of ancestors.


		const ancOveStr = getComputedStyle( curAncEle ).overflowX; // What: Ancestor Overflow String. Why: Only a genuinely scrollable ancestor should clip anything. How: This reads curAncEle's own computed overflow-x style.


		if ( ancOveStr === 'auto' || ancOveStr === 'scroll' || ancOveStr === 'hidden' ) { // What: Ancestor Overflow Guard. Why: A non-scrolling ancestor (the common case) has nothing to clip against. How: This checks ancOveStr against the 3 CSS values that actually clip content.


			const ancRecObj = curAncEle.getBoundingClientRect(); // What: Ancestor Rect Object. Why: The clamp below needs the ancestor's own real on-screen bounds. How: This reads curAncEle's own bounding rect.

			lefCurNum = Math.max( lefCurNum, ancRecObj.left ); rigCurNum = Math.min( rigCurNum, ancRecObj.right ); // What: Horizontal Clamp. Why: The working rect must never extend past this ancestor's own visible left/right edges. How: This narrows lefCurNum/rigCurNum to whichever is tighter between the working rect and ancRecObj.



			if ( rigCurNum <= lefCurNum ) return null; // What: Fully Clipped Guard. Why: An element scrolled entirely out of this ancestor's visible bounds is not a real, clickable target at all. How: This returns null once the clamped width collapses to zero or less.


		}



		curAncEle = curAncEle.parentElement; // What: Ancestor Advance. Why: The walk must keep climbing toward the document body. How: This reassigns curAncEle to its own parentElement for the next loop iteration.


	}



	return { top: topCurNum, left: lefCurNum, right: rigCurNum, bottom: botCurNum }; // What: Clipped Rect Return. Why: The caller needs the final, fully-clamped rect back. How: This builds the { top, left, right, bottom } shape every other rect helper in this file expects.


}

// #endregion cliHorFun



// #region uniRecFun

/**
 * uniRecFun = Union Rect Function
 *
 * @summary
 * Unions a group of matched elements into one bounding rect, the same
 * "union of matched elements" idea a tour step's own multi-element
 * spotlight uses. Each element's own rect is first passed through
 * {@link cliHorFun} so a scrolled-away portion of any one of them never
 * stretches the union into empty space.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tarEleArr - Target Element Array: The matched elements to union
 *                    together.
 *
 * @returns A { top, left, right, bottom, width, height } rect spanning
 * every element in tarEleArr that survived clipping.
 *
 * @example
 * ```ts
 * uniRecFun(tarEleArr) // => union rect
 * ```
 *
*/

function uniRecFun ( tarEleArr ) {


	let topCurNum = Infinity;  // What: Top Current Number. Why: The union must start from a value any real rect's own top will immediately beat. How: This starts at Infinity, narrowed by Math.min as elements are folded in below.
	let lefCurNum = Infinity;  // What: Left Current Number. Why: The union must start from a value any real rect's own left will immediately beat. How: This starts at Infinity, narrowed by Math.min as elements are folded in below.
	let rigCurNum = -Infinity; // What: Right Current Number. Why: The union must start from a value any real rect's own right will immediately beat. How: This starts at -Infinity, widened by Math.max as elements are folded in below.
	let botCurNum = -Infinity; // What: Bottom Current Number. Why: The union must start from a value any real rect's own bottom will immediately beat. How: This starts at -Infinity, widened by Math.max as elements are folded in below.


	tarEleArr.forEach( ( curTarEle ) => { // What: Element Union Loop. Why: Every matched element contributes to the overall union. How: This walks tarEleArr, folding each element's own clipped rect into the accumulator numbers above.


		const cliRecObj = cliHorFun( curTarEle.getBoundingClientRect(), curTarEle ); // What: Clipped Rect Object. Why: A scrolled-away portion of this element must not stretch the union. How: This runs curTarEle's own bounding rect through cliHorFun.


		if ( !cliRecObj ) return; // What: Fully Clipped Guard. Why: An element clipped away entirely contributes nothing to the union. How: This skips the rest of this iteration when cliHorFun returned null.



		topCurNum = Math.min( topCurNum, cliRecObj.top ); lefCurNum = Math.min( lefCurNum, cliRecObj.left );     // What: Top/Left Fold. Why: The union's own top-left corner is whichever edge is furthest out among every element seen so far. How: This narrows topCurNum/lefCurNum to the smaller of the running value and this element's own edge.
		rigCurNum = Math.max( rigCurNum, cliRecObj.right ); botCurNum = Math.max( botCurNum, cliRecObj.bottom ); // What: Right/Bottom Fold. Why: The union's own bottom-right corner is whichever edge is furthest out among every element seen so far. How: This widens rigCurNum/botCurNum to the larger of the running value and this element's own edge.


	} );



	return { top: topCurNum, left: lefCurNum, right: rigCurNum, bottom: botCurNum, width: rigCurNum - lefCurNum, height: botCurNum - topCurNum }; // What: Union Rect Return. Why: The caller needs the final unioned rect back, including its own derived width/height. How: This builds the shape every other rect helper in this file expects.


}

// #endregion uniRecFun



// #region detEdgFun

/**
 * detEdgFun = Detect Edge Function
 *
 * @summary
 * Clips a rect against the app's own always-on-top navigation chrome
 * (the Today page's sticky header, its stacked group-filter rail, and
 * the tab bar in whatever placement it currently renders, bottom, top
 * or side) so a target scrolled underneath one of them does not draw
 * its highlight on top of it. The dim layer sits above ordinary page
 * content, which also puts it above this chrome's own, much lower
 * z-index; the chrome's own opacity does not hide a highlight painted
 * above it in stacking order. The header/rail are hardcoded elsewhere
 * as top-anchored, a structural fact about this app's layout rather
 * than something worth detecting at runtime (getComputedStyle cannot
 * tell us anyway, since a position:fixed element's own top resolves to
 * a real computed pixel value in Chromium even when only bottom was
 * ever set in CSS). Only the tab bar's own placement genuinely varies,
 * and since it is position:fixed rather than sticky, this geometric
 * edge-detection is safe for that one specifically. This picks the
 * viewport edge the rect sits CLOSEST to rather than requiring it to
 * literally touch that edge, since the tab bar renders as a floating
 * inset pill and never sits flush against any edge at all.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param recObj - Record Object: The chrome element's own bounding rect.
 *
 * @returns Whichever of 'top', 'bottom', 'left' or 'right' recObj sits
 * closest to.
 * @see {@link edgGapObj}
 *
 * @example
 * ```ts
 * detEdgFun(recObj) // => 'top' | 'bottom' | 'left' | 'right'
 * ```
 *
*/

function detEdgFun ( recObj ) {


	const edgGapObj = { // What: Edge Gap Object. Why: Every one of the 4 viewport edges needs its own candidate gap computed before the smallest one can be picked. How: This is reduced below to whichever single entry holds the smallest gap.


		top    : recObj.top,                         // What: Top Gap. Why: This is how far recObj's own top edge sits below the viewport's own top edge, which is always y=0. How: This is recObj's own top value used directly, with no subtraction needed.
		bottom : window.innerHeight - recObj.bottom, // What: Bottom Gap. Why: This is how far recObj's own bottom edge sits above the viewport's own bottom edge. How: This subtracts recObj's own bottom from the viewport's own total height.
		left   : recObj.left,                        // What: Left Gap. Why: This is how far recObj's own left edge sits right of the viewport's own left edge, which is always x=0. How: This is recObj's own left value used directly, with no subtraction needed.
		right  : window.innerWidth - recObj.right    // What: Right Gap. Why: This is how far recObj's own right edge sits left of the viewport's own right edge. How: This subtracts recObj's own right from the viewport's own total width.


	};



	return Object.entries( edgGapObj ).reduce( ( besEntArr, curEntArr ) => ( curEntArr[ 1 ] < besEntArr[ 1 ] ? curEntArr : besEntArr ) )[ 0 ]; // What: Smallest Gap Return. Why: The caller needs the single edge name recObj sits closest to, not the whole gap object. How: This reduces edgGapObj's own [name, gap] entries down to the smallest gap, then reads back just its own name.


}

// #endregion detEdgFun



const CHR_PRI_OBJ = { '.tabbar' : 2, '.today-h' : 1, '.group-rail' : 1, '.settings-rail' : 1, '.editmode-banner' : 2 }; // What: Chrome Priority Object. Why: A target that is part of one chrome item (e.g. the nav bar's own [data-tab] buttons, "part of" .tabbar) must still be clippable against a DIFFERENT chrome item it visually sits behind, but never against one it sits IN FRONT OF. How: This maps a chrome selector to a plain priority number; a higher number visually wins, and cliChrFun below skips clipping a target against any chrome item its own home chrome already outranks (or IS). '.editmode-banner' outranks '.group-rail' specifically because on narrow viewports both become independently position:sticky near the same top offset, and the banner visually covers the rail wherever they overlap.



// #region cliChrFun

/**
 * cliChrFun = Clip To Chrome Function
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
 * that same item (or against any other chrome item it already
 * outranks; see {@link CHR_PRI_OBJ}), but stays clippable against a
 * DIFFERENT, unrelated chrome item it happens to visually overlap.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tarRecObj - Target Record Object: The target's own rect to clip.
 * @param chrIteArr - Chrome Item Array: Every chrome item currently present
 *                    on the page, as { recObj, sidStr, chrEle, selStr }
 *                    entries.
 * @param tarEleArr - Target Element Array: The target's own matched
 *                    element(s), used to detect which chrome item (if any)
 *                    this target is itself part of.
 *
 * @returns The clipped rect, or null once it collapses to zero or
 * negative width/height.
 *
 * @example
 * ```ts
 * cliChrFun(tarRecObj, chrIteArr, tarEleArr) // => clipped rect, or null
 * ```
 *
*/

function cliChrFun ( tarRecObj, chrIteArr, tarEleArr ) {


	let { top, left, right, bottom } = tarRecObj; // What: Working Rect Numbers. Why: Every clamp in the loop below needs its own mutable copy of tarRecObj's own 4 edges. How: This destructures tarRecObj directly into 4 reassignable bindings.

	const homChrObj = tarEleArr && chrIteArr.find( ( { chrEle } ) => tarEleArr.some( ( curTarEle ) => chrEle === curTarEle || chrEle.contains( curTarEle ) ) ); // What: Home Chrome Object. Why: The loop below needs to know which chrome item (if any) this target is itself a member of, e.g. the streak ring is part of .today-h. How: This finds the first chrome item whose own element contains (or is) one of tarEleArr's own elements.
	const homPriNum = homChrObj ? ( CHR_PRI_OBJ[ homChrObj.selStr ] ?? 0 ) : -Infinity;                                                                         // What: Home Priority Number. Why: This target's own home chrome's priority is what every candidate chrome item below gets weighed against. How: This looks up homChrObj's own selector in CHR_PRI_OBJ, or stays at -Infinity when there is no home chrome at all.


	for ( const chrIteObj of chrIteArr ) { // What: Chrome Item Loop. Why: Every chrome item currently on the page is a candidate to clip this target against. How: This walks chrIteArr, clamping the working rect against whichever items actually apply.


		if ( homPriNum >= ( CHR_PRI_OBJ[ chrIteObj.selStr ] ?? 0 ) ) continue; // What: Outranked Skip. Why: A target must never be clipped against a chrome item its own home chrome already outranks (or is). How: This skips this specific chrome item once homPriNum is at least as high as its own priority.



		const horOveBoo = left < chrIteObj.recObj.right && right > chrIteObj.recObj.left; // What: Horizontal Overlap Boolean. Why: An actual rect intersection needs both axes checked, not just one. How: This checks whether the working rect and this chrome item's own rect overlap horizontally.
		const verOveBoo = top < chrIteObj.recObj.bottom && bottom > chrIteObj.recObj.top; // What: Vertical Overlap Boolean. Why: An actual rect intersection needs both axes checked, not just one. How: This checks whether the working rect and this chrome item's own rect overlap vertically.


		if ( !horOveBoo || !verOveBoo ) continue; // What: No Intersection Guard. Why: A target sharing only a horizontal (or only a vertical) range with a chrome item, but not both, is not actually behind it. How: This skips this chrome item unless both axes genuinely overlap.



		if ( chrIteObj.sidStr === 'top' ) { // What: Top Chrome Clamp. Why: A top-anchored chrome item (the header, the group rail) should clip whatever sits below it, preferring to keep the portion already below the chrome. How: This clamps the working rect's own top edge down to the chrome's own bottom edge when that still leaves a real, positive-height rect.


			const canTopNum = Math.max( top, chrIteObj.recObj.bottom ); // What: Candidate Top Number. Why: This is the natural-direction clamp candidate for a top-anchored chrome item. How: This pushes top down to at least the chrome's own bottom edge.


			if ( bottom - canTopNum > 0 ) top = canTopNum; // What: Natural Direction Win. Why: The natural direction (pushing the working rect's own top down to the chrome's own bottom edge) wins whenever it still leaves a real, positive-height rect. How: This adopts canTopNum as the new top.

			else bottom = Math.min( bottom, chrIteObj.recObj.top ); // What: Natural Direction Fallback. Why: Once the natural direction would collapse the rect to zero or negative height, the opposite side is the only real content left. How: This clamps bottom up to the chrome's own top edge instead.


		}

		else if ( chrIteObj.sidStr === 'bottom' ) { // What: Bottom Chrome Clamp. Why: A bottom-anchored chrome item (the tab bar) should clip whatever sits below it, preferring to keep the portion already above the chrome. How: This clamps the working rect's own bottom edge up to the chrome's own top edge when that still leaves a real, positive-height rect.


			const canBotNum = Math.min( bottom, chrIteObj.recObj.top ); // What: Candidate Bottom Number. Why: This is the natural-direction clamp candidate for a bottom-anchored chrome item. How: This pulls bottom up to at most the chrome's own top edge.


			if ( canBotNum - top > 0 ) bottom = canBotNum; // What: Natural Direction Win. Why: The natural direction (pulling the working rect's own bottom up to the chrome's own top edge) wins whenever it still leaves a real, positive-height rect. How: This adopts canBotNum as the new bottom.

			else top = Math.max( top, chrIteObj.recObj.bottom ); // What: Natural Direction Fallback. Why: Once the natural direction would collapse the rect to zero or negative height, the opposite side is the only real content left. How: This clamps top down to the chrome's own bottom edge instead.


		}

		else if ( chrIteObj.sidStr === 'left' ) { // What: Left Chrome Clamp. Why: A left-anchored chrome item should clip whatever sits to its right, preferring to keep the portion already to the right of the chrome. How: This clamps the working rect's own left edge right to the chrome's own right edge when that still leaves a real, positive-width rect.


			const canLefNum = Math.max( left, chrIteObj.recObj.right ); // What: Candidate Left Number. Why: This is the natural-direction clamp candidate for a left-anchored chrome item. How: This pushes left right to at least the chrome's own right edge.


			if ( right - canLefNum > 0 ) left = canLefNum; // What: Natural Direction Win. Why: The natural direction (pushing the working rect's own left right to the chrome's own right edge) wins whenever it still leaves a real, positive-width rect. How: This adopts canLefNum as the new left.

			else right = Math.min( right, chrIteObj.recObj.left ); // What: Natural Direction Fallback. Why: Once the natural direction would collapse the rect to zero or negative width, the opposite side is the only real content left. How: This clamps right left to the chrome's own left edge instead.


		}

		else if ( chrIteObj.sidStr === 'right' ) { // What: Right Chrome Clamp. Why: A right-anchored chrome item should clip whatever sits to its left, preferring to keep the portion already to the left of the chrome. How: This clamps the working rect's own right edge left to the chrome's own left edge when that still leaves a real, positive-width rect.


			const canRigNum = Math.min( right, chrIteObj.recObj.left ); // What: Candidate Right Number. Why: This is the natural-direction clamp candidate for a right-anchored chrome item. How: This pulls right left to at most the chrome's own left edge.


			if ( canRigNum - left > 0 ) right = canRigNum; // What: Natural Direction Win. Why: The natural direction (pulling the working rect's own right left to the chrome's own left edge) wins whenever it still leaves a real, positive-width rect. How: This adopts canRigNum as the new right.

			else left = Math.max( left, chrIteObj.recObj.right ); // What: Natural Direction Fallback. Why: Once the natural direction would collapse the rect to zero or negative width, the opposite side is the only real content left. How: This clamps left right to the chrome's own right edge instead.


		}


	}



	if ( right - left <= 0 || bottom - top <= 0 ) return null; // What: Degenerate Guard. Why: A rect clamped down to zero or negative size is not a real, visible target any more. How: This returns null once either axis collapses.



	return { top, left, right, bottom }; // What: Clipped Rect Return. Why: The caller needs the final, fully-clamped rect back. How: This builds the { top, left, right, bottom } shape every other rect helper in this file expects.


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
 * @param tarRecObj - Target Record Object: The target's own unpadded core
 *                    rect.
 * @param padHorNum - Padding Horizontal Number: The horizontal padding to
 *                    request on each side.
 * @param padVerNum - Padding Vertical Number: The vertical padding to
 *                    request on each side.
 * @param chrIteArr - Chrome Item Array: Every chrome item currently present
 *                    on the page; forwarded to cliChrFun.
 * @param tarEleArr - Target Element Array: The target's own matched
 *                    element(s); forwarded to cliChrFun.
 *
 * @returns { padTopNum, padBotNum, padLefNum, padRigNum }, each the
 * actual pad that survived clipping on that side.
 *
 * @example
 * ```ts
 * claPadFun(tarRecObj, padHorNum, padVerNum, chrIteArr, tarEleArr) // => padding
 * ```
 *
*/

function claPadFun ( tarRecObj, padHorNum, padVerNum, chrIteArr, tarEleArr ) {


	const padRecObj = { top: tarRecObj.top - padVerNum, bottom: tarRecObj.bottom + padVerNum, left: tarRecObj.left - padHorNum, right: tarRecObj.right + padHorNum }; // What: Padded Rect Object. Why: This is the candidate box before it is checked against chrome. How: This expands tarRecObj outward by padVerNum vertically and padHorNum horizontally.
	const cliRecObj = cliChrFun( padRecObj, chrIteArr, tarEleArr );                                                                                                   // What: Clipped Rect Object. Why: The padded box must itself be re-clipped against chrome, or padding on an already-flush side would re-bleed into it. How: This runs padRecObj back through cliChrFun.


	if ( !cliRecObj ) return { padTopNum: 0, padBotNum: 0, padLefNum: 0, padRigNum: 0 }; // What: Fully Clipped Guard. Why: A padded box clipped away entirely has no pad left to report on any side. How: This returns all-zero padding once cliChrFun itself returned null.



	return { // What: Surviving Pad Return. Why: The caller needs to know how much of the requested pad actually survived on each individual side. How: This compares tarRecObj's own unpadded edges against cliRecObj's own clipped edges, one side at a time.


		padTopNum : tarRecObj.top - cliRecObj.top,       // What: Pad Top Number. Why: The top side's own surviving pad is however much of the padded box's own top edge is still above the clipped rect's own top. How: This subtracts cliRecObj's own top from tarRecObj's own top.
		padBotNum : cliRecObj.bottom - tarRecObj.bottom, // What: Pad Bottom Number. Why: The bottom side's own surviving pad is however much of the padded box's own bottom edge is still below the clipped rect's own bottom. How: This subtracts tarRecObj's own bottom from cliRecObj's own bottom.
		padLefNum : tarRecObj.left - cliRecObj.left,     // What: Pad Left Number. Why: The left side's own surviving pad is however much of the padded box's own left edge is still left of the clipped rect's own left. How: This subtracts cliRecObj's own left from tarRecObj's own left.
		padRigNum : cliRecObj.right - tarRecObj.right    // What: Pad Right Number. Why: The right side's own surviving pad is however much of the padded box's own right edge is still right of the clipped rect's own right. How: This subtracts tarRecObj's own right from cliRecObj's own right.


	};


}

// #endregion claPadFun



const PAD_MAR_NUM = 8;  // What: Pad Margin Number. Why: This is the extra margin drawn around every highlighted target's own rect by default. How: This is read as the fallback whenever a help item does not supply its own padXNum/padYNum override, and is also used directly by shaRadFun's own pill-radius math below.
const DEF_RAD_NUM = 12; // What: Default Radius Number. Why: A multi-element union (a clustered group of buttons) has no one shape of its own to read, so it falls back to this plain rounded-rect radius instead of averaging several unrelated corner radii together; this also matches the app's own --r-md CSS token. How: This is returned by shaRadFun whenever no more specific radius can be computed.



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
 * instead of chased exactly, since the SVG mask's own rx/ry math
 * renders it visibly faceted at such extreme values rather than a
 * smooth stadium, confirmed by an isolated test against plain CSS
 * border-radius.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tarDomEle - Target Document-Object-Model Element: The single
 *                    matched element to read a radius from.
 * @param padWidNum - Padding Width Number: The padded box's own width, used to
 *                    scale a percentage radius.
 * @param padHeiNum - Padding Height Number: The padded box's own height, used
 *                    to scale a percentage radius.
 * @param shaOveStr - Shape Override String: 'circle' to skip CSS inspection
 *                    and force a perfect ellipse; otherwise omitted.
 *
 * @returns { rx, ry } for the SVG mask cutout and the highlight div's
 * own border-radius.
 *
 * @example
 * ```ts
 * shaRadFun(tarDomEle, padWidNum, padHeiNum, shaOveStr) // => { rx, ry }
 * ```
 *
*/

function shaRadFun ( tarDomEle, padWidNum, padHeiNum, shaOveStr ) {


	if ( shaOveStr === 'circle' ) { // What: Circle Override Guard. Why: A target whose round appearance comes from an inner SVG shape rather than its own border-radius has nothing for getComputedStyle to read. How: This forces a perfect ellipse matching the padded box's own half-width/half-height.


		return { rx: padWidNum / 2, ry: padHeiNum / 2 }; // What: Circle Override Return. Why: The caller needs a perfect ellipse matching the padded box, not a radius read off getComputedStyle. How: This halves padWidNum/padHeiNum directly.


	}



	const radTokStr = ( getComputedStyle( tarDomEle ).borderRadius || '' ).split( ' ' )[ 0 ]; // What: Radius Token String. Why: A multi-corner border-radius value can list up to 4 tokens; only the first is meaningful for this file's own single-radius rounded-rect approximation. How: This reads tarDomEle's own computed border-radius and takes its first space-separated token.


	if ( !radTokStr ) return { rx: DEF_RAD_NUM, ry: DEF_RAD_NUM }; // What: No Radius Guard. Why: An element with no computed border-radius at all falls back to the app's own default radius. How: This returns early once radTokStr is empty.



	if ( radTokStr.endsWith( '%' ) ) { // What: Percentage Radius Branch. Why: A percentage radius (almost always 50%) must scale with the padded box's own size rather than being reused as a literal pixel value. How: This parses the percentage and multiplies it against padWidNum/padHeiNum below.


		const perRatNum = parseFloat( radTokStr ) / 100; // What: Percent Number. Why: The parsed percentage needs converting to a plain 0-1 ratio before it can scale anything. How: This parses radTokStr as a float and divides by 100.


		if ( Number.isNaN( perRatNum ) ) return { rx: DEF_RAD_NUM, ry: DEF_RAD_NUM }; // What: Unparseable Guard. Why: A malformed percentage token must not silently produce NaN radii. How: This falls back to the default radius once perRatNum failed to parse.



		return { // What: Percentage Radius Return. Why: The caller needs the percentage token actually scaled against the padded box's own size. How: This multiplies perRatNum against padWidNum/padHeiNum.

			rx : perRatNum * padWidNum, // What: Radius X. Why: The horizontal radius must scale by the same percentage the source element's own border-radius specified. How: This multiplies perRatNum against padWidNum.
			ry : perRatNum * padHeiNum  // What: Radius Y. Why: The vertical radius must scale by that same percentage too. How: This multiplies perRatNum against padHeiNum.

		};


	}



	const pxNum = parseFloat( radTokStr ); // What: Pixel Number. Why: Every other radius form is a plain pixel value that needs parsing before it can be compared or added to. How: This parses radTokStr as a float.


	if ( Number.isNaN( pxNum ) || pxNum === 0 ) return { rx: DEF_RAD_NUM, ry: DEF_RAD_NUM }; // What: Zero/Unparseable Guard. Why: A square-cornered element (0) or a malformed value both fall back to the default radius. How: This checks pxNum against both failure cases at once.


	if ( pxNum >= 24 ) return { rx: DEF_RAD_NUM, ry: DEF_RAD_NUM }; // What: Pill Cap Guard. Why: A "pill" source radius renders visibly faceted through the SVG mask's own rx/ry math at extreme values, confirmed against plain CSS border-radius. How: This caps anything at or past 24px down to the app's own default radius instead.



	return { // What: Grown Radius Return. Why: A real, moderate rounded-corner value should keep reading as rounded once the box has grown by the pad amount. How: This adds the flat pad margin back onto the parsed pixel radius.

		rx : pxNum + PAD_MAR_NUM, // What: Radius X. Why: A pixel radius must grow by the same flat pad margin the box itself grew by, to roughly preserve how rounded it reads. How: This adds PAD_MAR_NUM onto the parsed pixel radius.
		ry : pxNum + PAD_MAR_NUM  // What: Radius Y. Why: Same reasoning as rx, since a border-radius grows uniformly on both axes for a plain pixel value. How: This adds PAD_MAR_NUM onto the parsed pixel radius.

	};


}

// #endregion shaRadFun



const BAD_SIZ_NUM = 20; // What: Badge Size Number. Why: Every highlighted target's own corner badge is drawn at this fixed diameter. How: This sizes the rendered badge button and is read throughout badRecFun's own placement math below.



// #region badRecFun

/**
 * badRecFun = Badge Rect Function
 *
 * @summary
 * Badge geometry, shared between where it is actually drawn and where
 * an open tip anchored to it should point: a 20px circle overlapping
 * the highlighted box's own top-right corner (matching the "small
 * corner marker" design, distinct from InfoTip's own inline-trigger
 * placement). This falls back to the top-LEFT corner instead when the
 * target's own right edge sits past the viewport, e.g. a
 * horizontally-scrollable row (Today's group nav) whose own rect is
 * its full unclipped content width, not just what is currently
 * visible; the target's LEFT edge is always what is initially in view,
 * since these rows start scrolled to 0. cenBadBoo, true for columnGroup
 * items, centers the badge over the column's own top edge instead,
 * since a columnGroup member's own right edge is a shared, touching
 * boundary with its neighbor rather than a free edge with neutral
 * space past it.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tarRecObj - Target Record Object: The already-padded target rect (its
 *                    own padTopNum/padRigNum/padLefNum, if any, came from
 *                    {@link claPadFun}) to anchor the badge to.
 * @param cenBadBoo - Center Badge Boolean: Whether to center the badge over
 *                    tarRecObj's own top edge (columnGroup members) instead of
 *                    using the usual corner placement.
 *
 * @returns { top, left, width, height, bottom } for the badge's own
 * fixed-position placement.
 *
 * @example
 * ```ts
 * badRecFun(tarRecObj, cenBadBoo) // => badge rect
 * ```
 *
*/

function badRecFun ( tarRecObj, cenBadBoo ) {


	const padTopNum = tarRecObj.padTopNum ?? PAD_MAR_NUM;                              // What: Pad Top Number. Why: The badge's own vertical anchor must match whatever pad actually survived clipping on this target's own top side, not the flat default. How: This reads tarRecObj's own padTopNum, falling back to the flat pad margin.
	const rawTopNum = tarRecObj.top - padTopNum - BAD_SIZ_NUM / 2;                     // What: Raw Top Number. Why: The badge's own natural vertical position overlaps up into the highlight box's own top-right corner. How: This subtracts the pad and half the badge's own size from the target's own top edge.
	const topBadNum = rawTopNum < -BAD_SIZ_NUM ? rawTopNum : Math.max( 4, rawTopNum ); // What: Top Badge Number. Why: A badge only ALMOST on screen (within one badge-height of the top edge) should nudge down to stay visible, but a badge genuinely scrolled far above the viewport must not get dragged all the way down to that same floor. How: This only applies the 4px floor once rawTopNum is no further than one badge-height above 0.


	if ( cenBadBoo ) { // What: Center Mode Branch. Why: A columnGroup member's own badge centers over its column's top edge instead of using the usual corner placement. How: This returns early with a horizontally-centered badge rect.


		const lefBadNum = tarRecObj.left + tarRecObj.width / 2 - BAD_SIZ_NUM / 2; // What: Left Badge Number. Why: The badge must sit centered on the column's own horizontal midpoint. How: This computes the target's own midpoint and subtracts half the badge's own size.



		return { top: topBadNum, left: lefBadNum, width: BAD_SIZ_NUM, height: BAD_SIZ_NUM, bottom: topBadNum + BAD_SIZ_NUM };


	}


	const padRigNum = tarRecObj.padRigNum ?? PAD_MAR_NUM;                                    // What: Pad Right Number. Why: The right-corner placement below needs whichever pad actually survived clipping on its own right side. How: This reads tarRecObj's own padRigNum, falling back to the flat pad margin.
	const padLefNum = tarRecObj.padLefNum ?? PAD_MAR_NUM;                                    // What: Pad Left Number. Why: The left-corner fallback below needs whichever pad actually survived clipping on its own left side. How: This reads tarRecObj's own padLefNum, falling back to the flat pad margin.
	const rigLefNum = tarRecObj.right + padRigNum - BAD_SIZ_NUM / 2;                         // What: Right Corner Left Number. Why: This is the badge's own candidate left position for the usual top-right corner placement. How: This adds the surviving right pad to the target's own right edge, then centers the badge on that point.
	const oveRigBoo = rigLefNum + BAD_SIZ_NUM > window.innerWidth;                           // What: Overflows Right Boolean. Why: A target rect already clipped flush to the viewport can still overflow once the badge's own pad gap and half-width are added on top. How: This checks whether the right-corner candidate's own far edge would cross the viewport's own width.
	const lefBadNum = oveRigBoo ? tarRecObj.left - padLefNum - BAD_SIZ_NUM / 2 : rigLefNum; // What: Left Badge Number. Why: The badge must fall back to the target's own top-LEFT corner whenever the right corner would overflow. How: This picks the left-corner candidate when oveRigBoo is true, otherwise the right-corner candidate.



	return { top: topBadNum, left: lefBadNum, width: BAD_SIZ_NUM, height: BAD_SIZ_NUM, bottom: topBadNum + BAD_SIZ_NUM }; // What: Badge Rect Return. Why: The caller needs the final fixed-position badge rect back. How: This builds the shape both the rendered badge button and plaTipFun's own anchoring read.


}

// #endregion badRecFun



// #region plaTipFun

/**
 * plaTipFun = Place Tip Function
 *
 * @summary
 * Where the open tip should sit relative to the target it describes,
 * the same "prefer below, flip above if it would clip, clamp
 * horizontally" idea as both InfoTip's own place() and the tour's own
 * coach placement. Both axes are TARGET-relative, not badge-relative
 * (the badge only marks where to click; it is not where the tip should
 * point): vertically it clears the target's own rect so a big target
 * cannot have "below" still land inside its own box; horizontally the
 * arrow centers on the target's own midpoint, and the tip box is what
 * shifts left/right off that centerpoint to stay clear of the viewport
 * edge. pinBelYNum, when set, skips the "prefer below, flip above"
 * choice entirely and always places the tip below that fixed Y.
 * alwaysBelow skips the choice too, for a target spanning nearly the
 * whole viewport itself, where "above" has essentially zero room no
 * matter what. Otherwise this prefers below whenever the full content
 * fits there, and only prefers above when above genuinely has more
 * room than below, never unconditionally either way; a hardcoded
 * preference either way was the actual bug this replaced, since it
 * could either overflow the content back through the target or starve
 * the tip's own scrollable window to almost nothing.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tarRecObj  - Target Record Object: The target rect the tip is being
 *                     placed relative to.
 * @param tipWidNum  - Tip Width Number: The tip's own real, already-measured
 *                     width.
 * @param tipHeiNum  - Tip Height Number: The tip's own real, already-measured
 *                     height.
 * @param pinBelYNum - Pin Below Y Number: A fixed Y to always place the tip
 *                     below, skipping the normal above/below choice; may be
 *                     null/undefined.
 *
 * @returns { topTipNum, lefTipNum, arrClaStr, arrHorNum, maxHeiNum } for
 * the tip's own inline style and scroll-capping.
 *
 * @example
 * ```ts
 * plaTipFun(tarRecObj, tipWidNum, tipHeiNum, pinBelYNum) // => placement
 * ```
 *
*/

function plaTipFun ( tarRecObj, tipWidNum, tipHeiNum, pinBelYNum ) {


	const vieWidNum = window.innerWidth;  // What: Viewport Width Number. Why: Every clamp below needs the current viewport's own width. How: This is read once from window.innerWidth and reused throughout.
	const vieHeiNum = window.innerHeight; // What: Viewport Height Number. Why: Every clamp below needs the current viewport's own height. How: This is read once from window.innerHeight and reused throughout.
	const edgMarNum = 8;                  // What: Edge Margin Number. Why: The tip should never sit flush against the very edge of the viewport. How: This is the fixed pixel margin every clamp below keeps clear.

	let topTipNum, arrClaStr, maxHeiNum; // What: Placement Result Numbers. Why: Exactly one of the 3 branches below assigns these, whichever applies. How: These are returned as-is once the branch below has run.



	if ( tarRecObj.alwaysBelow ) { // What: Always Below Branch. Why: A target spanning nearly the whole viewport itself (the nav tip's own 'side'/'top' placements) has essentially zero room above no matter what. How: This skips the below/above choice entirely and places the tip a fixed 16px below the target.


		topTipNum = tarRecObj.bottom + 16; arrClaStr = 'ob-coach--up'; // What: Below Placement Set. Why: The always-below branch places the tip a fixed 16px under the target regardless of available room, pointing its arrow up at the target it sits below. How: This sets topTipNum to the target's own bottom plus 16, and arrClaStr to the up-pointing arrow class.
		maxHeiNum = vieHeiNum - topTipNum - edgMarNum;                 // What: Max Height Cap. Why: A below-placed tip must still not overflow past the bottom of the viewport. How: This subtracts topTipNum and the edge margin from the viewport's own height.


	}

	else if ( pinBelYNum != null ) { // What: Pinned Below Branch. Why: Some tips (e.g. Repeat Schedule) must always sit below one fixed Y regardless of which of a form's own optional fields happen to be showing. How: This places the tip a fixed 16px below pinBelYNum instead of the target's own bottom edge.


		topTipNum = pinBelYNum + 16; arrClaStr = 'ob-coach--up'; // What: Pinned Below Placement Set. Why: A pinned tip ignores the target's own bottom edge entirely, always sitting 16px below the fixed pinBelYNum instead, still pointing up at whatever it's pinned to. How: This sets topTipNum to pinBelYNum plus 16, and arrClaStr to the up-pointing arrow class.
		maxHeiNum = vieHeiNum - topTipNum - edgMarNum;           // What: Max Height Cap. Why: A pinned-below tip must still not overflow past the bottom of the viewport. How: This subtracts topTipNum and the edge margin from the viewport's own height.


	}

	else { // What: Normal Above/Below Branch. Why: This is the ordinary case, where the tip prefers below but can flip above when that genuinely has more room. How: This compares the room below against the room above before picking a side.


		const useBadBoo = tarRecObj.badgeAnchorTop != null;                     // What: Use Badge Anchor Boolean. Why: A columnGroup member's own badge sits well above tarRecObj.top itself, so an above-placed tip anchored to tarRecObj.top would point its own arrow at empty space instead of the badge. How: This checks whether tarRecObj carries a badgeAnchorTop at all.
		const aboAncNum = useBadBoo ? tarRecObj.badgeAnchorTop : tarRecObj.top; // What: Above Anchor Number. Why: The "flips above" branch below needs one single Y to anchor against, whichever is correct for this target. How: This picks badgeAnchorTop when useBadBoo, otherwise the target's own top edge.
		const gapAboNum = useBadBoo ? 8 : 16;                                   // What: Gap Above Number. Why: The usual 16px breathing room reads as "detached" for a small round badge specifically, so a badge anchor uses a tighter 8px instead. How: This picks 8 when anchored to a badge, otherwise the app's own normal 16px gap.
		const spaBelNum = vieHeiNum - tarRecObj.bottom - 16;                    // What: Space Below Number. Why: This is how much room the "below" placement actually has to work with. How: This subtracts the target's own bottom edge and the normal 16px gap from the viewport's own height.
		const spaAboNum = aboAncNum - gapAboNum - edgMarNum;                    // What: Space Above Number. Why: This is how much room the "above" placement actually has to work with. How: This subtracts gapAboNum and the edge margin from aboAncNum.


		if ( spaBelNum >= tipHeiNum || spaBelNum >= spaAboNum ) { // What: Prefer Below Guard. Why: Below wins whenever the full content actually fits there, or whenever below simply has more room than above even if neither fully fits. How: This checks tipHeiNum against spaBelNum first, then compares the two spaces directly.


			topTipNum = tarRecObj.bottom + 16; arrClaStr = 'ob-coach--up'; // What: Below Placement Set. Why: The ordinary case's own below branch places the tip 16px under the target once it genuinely has the room, pointing its arrow up at the target. How: This sets topTipNum to the target's own bottom plus 16, and arrClaStr to the up-pointing arrow class.
			maxHeiNum = vieHeiNum - topTipNum - edgMarNum;                 // What: Max Height Cap. Why: A below-placed tip must still not overflow past the bottom of the viewport. How: This subtracts topTipNum and the edge margin from the viewport's own height.


		}

		else { // What: Flip Above Branch. Why: Above only wins once it has genuinely more room than below. How: This places the tip so its own bottom edge sits gapAboNum clear of aboAncNum, capped to never rise above the edge margin.


			topTipNum = Math.max( edgMarNum, aboAncNum - gapAboNum - tipHeiNum ); arrClaStr = 'ob-coach--down'; // What: Above Placement Set. Why: The flip-above branch places the tip so its own bottom edge clears aboAncNum by gapAboNum, capped to never rise above the edge margin, now pointing its arrow down at the target below it. How: This sets topTipNum via Math.max against edgMarNum, and arrClaStr to the down-pointing arrow class.
			maxHeiNum = spaAboNum;                                                                              // What: Above Max Height. Why: An above-placed tip's own ceiling is the target itself, not the viewport's own bottom edge (reusing the "below" formula here let a clamped top overflow back down through the target). How: This bounds maxHeiNum by spaAboNum instead.


		}


	}



	const cenHorNum = tarRecObj.left + tarRecObj.width / 2;                                                            // What: Center Horizontal Number. Why: The tip's own arrow always centers on the target's own horizontal midpoint. How: This adds half the target's own width to its left edge.
	const lefTipNum = Math.max( edgMarNum, Math.min( cenHorNum - tipWidNum / 2, vieWidNum - tipWidNum - edgMarNum ) ); // What: Left Tip Number. Why: The tip box itself must clamp within the viewport even while its arrow stays centered on cenHorNum. How: This centers the tip on cenHorNum, then clamps between the edge margin and the viewport's own right-edge margin.
	const arrHorNum = Math.max( 18, Math.min( cenHorNum - lefTipNum, tipWidNum - 26 ) );                               // What: Arrow Horizontal Number. Why: The arrow's own horizontal offset inside the tip box must stay clear of the tip's own rounded corners. How: This computes the arrow's position relative to lefTipNum, clamped to a safe inset range.



	return { topTipNum, lefTipNum, arrClaStr, arrHorNum, maxHeiNum }; // What: Placement Return. Why: The caller needs the tip's own final position, arrow direction/offset, and scroll cap all together. How: This builds the shape HelTipCom's own layout effect applies directly.


}

// #endregion plaTipFun



// #region HelTipCom

/**
 * HelTipCom = Help Tip Component
 *
 * @summary
 * One tip, positioned once its own size is known, mirroring InfoTip's
 * own measure-after-mount approach; simpler than the guided tour's
 * permanent hidden measurer since at most one of these ever exists at
 * a time. tipIteObj.mtwBoo (e.g. the nav tip, once it grew to 5
 * paragraphs) sizes the tip to tarRecObj.tipWidth instead of the usual
 * fixed 280px, applied as an inline style so it already wins by the
 * time offsetWidth first measures it. tipIteObj.scrBoo caps the tip
 * to whatever vertical room plaTipFun found and scrolls internally
 * past that instead of overflowing the viewport; it is applied to an
 * inner wrapper rather than the outer .ob-coach box itself, since
 * overflow:auto on the outer box would clip its own arrow, which is
 * deliberately positioned outside the box's own normal content area to
 * poke out and point at the target.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.tipIteObj - Tip Item Object: The catalog item this tip is
 *                          showing.
 * @param props.tarRecObj - Target Record Object: The already-measured/
 *                          padded target rect this tip is anchored to.
 *
 * @returns The tip's own positioned coach bubble.
 *
 * @example
 * ```tsx
 * HelTipCom({ tipIteObj, tarRecObj }) // => <HelTipCom />
 * ```
 *
*/

function HelTipCom ( { tipIteObj, tarRecObj } ) {


	const tipEleRef                   = React.useRef( null );             // What: Tip Element Reference. Why: The layout effect below needs a handle on the real tip DOM node to measure and position it. How: This is attached to the root coach div's own ref prop below.
	const [ tipStyObj, setTipStyObj ] = React.useState( null );           // What: Tip Style Object And Setter. Why: The tip's own absolute position is not known until after its first mount/measure. How: This starts null (rendered off-screen) and is written by the layout effect below.
	const [ arrClaStr, setArrClaStr ] = React.useState( 'ob-coach--up' ); // What: Arrow Class String And Setter. Why: The tip's own arrow direction depends on whether it landed above or below the target. How: This starts pointing up (the "below target" case) and is written by the layout effect below.
	const [ scrMaxNum, setScrMaxNum ] = React.useState( null );           // What: Scroll Max Number And Setter. Why: A scrollable tip needs its own inner cap recomputed alongside its position. How: This starts null (uncapped) and is written by the layout effect below.

	const widStyObj = tipIteObj.mtwBoo && tarRecObj.tipWidth != null ? { width: tarRecObj.tipWidth } : null; // What: Width Style Object. Why: Only a tip whose own catalog item opts in, AND whose target actually computed a tipWidth, should override the usual fixed 280px. How: This reads tarRecObj.tipWidth only under that combined condition, otherwise falls through to no override at all.


	React.useLayoutEffect( () => { // What: Placement Effect. Why: The tip's own position, arrow direction, and scroll cap must all be recomputed whenever the target it is anchored to changes. How: This measures the mounted tip element and runs plaTipFun against tarRecObj.


		const tipCurEle = tipEleRef.current; // What: Tip Current Element. Why: The measurement below needs a stable local reference to the live tip DOM node. How: This is read once from tipEleRef.current.


		if ( !tipCurEle ) return; // What: No Element Guard. Why: The ref may not be attached yet on a very first render. How: This bails out early when there is no tip element to measure.



		const { topTipNum, lefTipNum, arrClaStr: arrClaVal, arrHorNum, maxHeiNum } = plaTipFun( tarRecObj, tipCurEle.offsetWidth, tipCurEle.offsetHeight, tarRecObj.pinBelowY ); // What: Placement Result. Why: This is the whole positioning answer for this render. How: This calls plaTipFun with the tip's own real measured size and tarRecObj's own pinBelowY.


		setTipStyObj( { top: topTipNum, left: lefTipNum, '--ob-ax': arrHorNum + 'px' } ); // What: Tip Style Update. Why: The rendered tip needs its own top/left plus the CSS custom property its own arrow reads. How: This writes the freshly-computed position into tipStyObj.
		setArrClaStr( arrClaVal );                                                        // What: Arrow Class Update. Why: The rendered tip needs its own up/down arrow modifier class. How: This writes arrClaVal into arrClaStr.
		setScrMaxNum( tipIteObj.scrBoo ? maxHeiNum - 28 : null );                         // What: Scroll Max Update. Why: A scrollable tip's own inner wrapper must leave room for .ob-coach's own 28px of vertical padding. How: This writes maxHeiNum minus that padding, or null when this item is not scrollable at all.


	}, [ tarRecObj, tipIteObj.mtwBoo, tipIteObj.scrBoo ] ); // What: Effect Dependency Array. Why: This effect must re-run whenever the target it is anchored to moves or resizes, or whenever the item's own width/scroll behavior could change. How: tarRecObj changing means a new position is needed, and tipIteObj.mtwBoo/tipIteObj.scrBoo changing means the sizing rules themselves changed.



	const innStyObj = scrMaxNum != null ? { maxHeight: scrMaxNum, overflowY: 'auto' } : null; // What: Inner Style Object. Why: Only a scrollable item's own inner wrapper needs a capped height and its own scrollbar. How: This builds the style object only while scrMaxNum holds a real cap.



	return (


		<div
			ref={ tipEleRef }
			className={ ` ob-coach   help-tip   ${ arrClaStr } ` }
			style={{ ...( tipStyObj || { top: -9999, left: -9999 } ), ...widStyObj }}
			role='tooltip'
		>{ /* What: Container Help Tip Div Element. Why: This is HelTipCom's own root rendered element, positioned via tipStyObj/widStyObj and pointed via arrClaStr. How: This wraps the inner scroll-capped content below. */ }


			<div style={ innStyObj }>{ /* What: Inner Scroll Div Element. Why: The scroll cap must live on an inner wrapper so it never clips the outer box's own arrow. How: This applies innStyObj only while this item is scrollable and a cap has been computed. */ }


				<p className='help-tip-title'>{ typeof tipIteObj.titStr === 'function' ? tipIteObj.titStr( tarRecObj ) : tipIteObj.titStr }</p>{ /* What: Help Tip Title Element. Why: A function title (e.g. the Charge Controls items) reads something off the live DOM at open time instead of baking in a value that could be wrong for a different picker's own setting. How: This calls tipIteObj.titStr with tarRecObj when it is a function, otherwise renders it directly. */ }

				<div className='ob-body'>{ typeof tipIteObj.bodEle === 'function' ? tipIteObj.bodEle() : tipIteObj.bodEle }</div>{ /* What: Ob Body Div Element. Why: Same reasoning as the title above applies to a function body. How: This calls tipIteObj.bodEle when it is a function, otherwise renders it directly. */ }


			</div>


		</div>


	);


}

// #endregion HelTipCom



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
 * This item's own properties, one bullet per field, in the same order they're
 * declared below:
 *
 * - `ideStr` ('__nav'): Identifier String is this item's own unique key,
 *   letting HelOveCom track which item is currently open; compared against
 *   its own open-id state.
 *
 * - `selStr` ('[data-tab]'): Selector String determines which on-page
 *   element(s) this item highlights; passed through finTarFun, a
 *   comma-separated-fallback matcher tried left to right until one alternative
 *   matches a visible element.
 *
 * - `mtwBoo` / `mwsStr` (true / '.tabbar'): Match-Target-Width Boolean and
 *   Match-Width-Selector String size the open tip to match `.tabbar`'s own
 *   real width instead of the highlighted target's own, since this tip's own
 *   content grew to several paragraphs and the usual fixed 280px width read
 *   too cramped.
 *
 * - `padYNum` (7): Pad Y Number makes the highlight flush with the tab bar's
 *   own outer edge on 'bottom' placement.
 *
 * - `scrBoo` (true): Scroll Boolean caps the body to whatever room is found on
 *   'side' placement, where the target can span most of the viewport's own
 *   height.
 *
 * - `absStr`: Always-Below-Selector String covers both 'side' (same reason as
 *   scrBoo) and 'top' placement, where the normal fits-below check can
 *   otherwise flip to "above" on a short viewport and cover the navbar
 *   entirely.
 *
 * - `shaStr`: Shape String only applies the true-pill radius once the box is
 *   meaningfully elongated (the tab bar is a true pill only on 'bottom'
 *   placement; 'side' stacks its 5 buttons into a nearly-square union),
 *   falling back to the app's normal small corner radius otherwise.
 *
 * - `titStr` ('Navigation'): Title String is the tip's own heading text.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const NAV_HEL_OBJ = {


	ideStr  : '__nav',
	selStr  : '[data-tab]',
	mtwBoo  : true,
	mwsStr  : '.tabbar',
	padYNum : 7,
	scrBoo  : true,
	absStr  : '.tabbar--side, .tabbar--top',

	shaStr : ( padWidNum, padHeiNum ) => { // What: Shape Function. Why: A multi-element union like the nav bar has no single source element's own border-radius to read. How: This computes a true-pill radius only once the box is meaningfully elongated, matching 'bottom'/'top' placement but not 'side'.


		const shoPilNum = Math.min( padWidNum, padHeiNum );                         // What: Short Pill Number. Why: The elongation check and the pill radius itself both need to know which dimension is smaller. How: This takes the smaller of padWidNum/padHeiNum.
		const lonPilNum = Math.max( padWidNum, padHeiNum );                         // What: Long Pill Number. Why: The elongation check needs the larger dimension to compare against shoPilNum. How: This takes the larger of padWidNum/padHeiNum.
		const radPilNum = lonPilNum / shoPilNum >= 2 ? shoPilNum / 2 : DEF_RAD_NUM; // What: Radius Pill Number. Why: Only a box at least twice as long as it is short reads correctly as a true pill; a nearly-square union (the 'side' stack) would otherwise round into a circle/oval. How: This picks half of shoPilNum once elongated enough, otherwise the app's own default radius.



		return { rx: radPilNum, ry: radPilNum }; // What: Pill Radius Return. Why: The caller needs both radii in the same { rx, ry } shape every other shape source in this file already returns. How: This returns radPilNum for both axes, since a pill radius is always equal on both.


	},

	titStr : 'Navigation',

	bodEle : ( // What: Body Expression. Why: This is NAV_HEL_OBJ's own tip content, one column per tab. How: This maps a small local tab-description array, reusing each tab's own real nav icon so it can never drift from the real button.


		<>

			{ [

				{ icoStr : 'today',    labStr : 'Today',    desStr : 'This is the main page of the app and contains your auto-generated daily todo list.' },
				{ icoStr : 'picker',   labStr : 'Pickers',  desStr : 'This is where you can manually run a picker to generate a task and then push it to the Today page\'s todo list. This is also where you can create new pickers and their items.' },
				{ icoStr : 'stats',    labStr : 'Stats',    desStr : 'This is where you can view all of the statistics for everything that you have created. That includes conditionals, reminder items, pickers and picker items. You can see how many times an item has been picked, items\' pick frequency, and much more.' },
				{ icoStr : 'data',     labStr : 'Data',     desStr : 'This is where you can view and edit everything that you have created. You can also create new conditionals, new reminders items and new picker items.' },
				{ icoStr : 'settings', labStr : 'Settings', desStr : 'This is where you can customize the app, adjust the daily generator, edit which holidays are observed, control your data, install the app, get app information and view legal documents.' }

			].map( ( curTabObj ) => (

				<div className='help-nav-item' key={ curTabObj.icoStr }>{ /* What: Help Nav Item Div Element. Why: Each tab gets its own icon/label/description block inside the shared nav tip. How: This renders curTabObj's own icon and label on one line, its description below. */ }

					<div className='help-nav-label'><Icon name={ curTabObj.icoStr } size={ 14 } /><b>{ curTabObj.labStr }:</b></div>{ /* What: Help Nav Label Div Element. Why: The tab's own real icon glyph next to its label lets a reader match this entry to the real button. How: This renders Icon with curTabObj.icoStr alongside curTabObj.labStr in bold. */ }

					<p>{ curTabObj.desStr }</p>{ /* What: Help Nav Description Paragraph Element. Why: This is the actual explanatory text for this tab. How: This renders curTabObj.desStr as plain text. */ }

				</div>

			) ) }

		</>


	)


};



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
 * This item's own properties, one bullet per field, in the same order they're
 * declared below:
 *
 * - `ideStr` ('__railHandle'): Identifier String is this item's own unique
 *   key, letting HelOveCom track which item is currently open; compared
 *   against its own open-id state.
 *
 * - `selStr` ('.rail-handle'): Selector String determines which on-page
 *   element(s) this item highlights; passed through finTarFun, a
 *   comma-separated-fallback matcher tried left to right until one alternative
 *   matches a visible element.
 *
 * - `titStr` ('Sidebar Toggle'): Title String is the tip's own heading text.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const RAI_HAN_OBJ = {


	ideStr : '__railHandle',
	selStr : '.rail-handle',
	titStr : 'Sidebar Toggle',
	bodEle : <>This button will open the app's navigation, allowing you to navigate to the app's other pages.</>


};



// #region HelOveCom

/**
 * HelOveCom = Help Overlay Component
 *
 * @summary
 * items is [{ ideStr, selStr, titStr, bodEle, ... }], where selStr
 * follows the guided tour's own comma-fallback convention and can
 * match several elements at once, the same way a tour step's sel can;
 * the whole group shares one badge and one tip, positioned off their
 * combined union, the same "union of matched elements" idea
 * {@link uniRecFun} uses. onExit fires when the user asks to leave
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
	const [ opeIdeStr, setOpeIdeStr ] = React.useState( null );                                                           // What: Open Identifier String And Setter. Why: At most one tip can be open at a time, tracked by its own (possibly perElement-suffixed) id. How: This starts null (no tip open) and is toggled by a badge's own onClick below.
	const [ togRecObj, setTogRecObj ] = React.useState( null );                                                           // What: Toggle Rect Object And Setter. Why: The page's own help toggle button needs a mask cutout too, even though it is never one of allIteArr. How: This is written by recTarFun below whenever a .help-btn is found on the page.



	const recTarFun = React.useCallback( () => { // What: Recompute Target Function. Why: Every tagged element's own rect must be recomputed every frame while active, to stay correct under scrolling/reflow, and also right after a click that could have changed the DOM. How: This rebuilds the whole rect map from scratch and writes it via setRecMapObj.


		const nexMapObj = {}; // What: Next Map Object. Why: The whole rect map is rebuilt from scratch every call rather than patched incrementally. How: This starts empty and is filled in by the loops below before being committed via setRecMapObj.

		const chrSelArr = [ [ '.today-h', 'top' ], [ '.group-rail', 'top' ], [ '.settings-rail', 'top' ], [ '.tabbar', 'auto' ], [ '.editmode-banner', 'top' ] ]; // What: Chrome Selector Array. Why: These are the only pieces of always-on-top chrome any highlight ever needs clipping against; '.tabbar' alone varies its own edge at runtime. How: This is mapped into real chrome items below.

		const chrMatArr = chrSelArr // What: Chrome Match Array. Why: Only chrome that actually exists on the current page (e.g. '.settings-rail' only on Settings) should ever be clipped against. How: This looks each selector up once per frame and drops any that found nothing.
			.map( ( [ selStr, sidStr ] ) => { const chrEle = document.querySelector( selStr ); return chrEle ? { chrEle, sidStr, selStr } : null; } )
			.filter( Boolean );

		const chrIteArr = chrMatArr // What: Chrome Item Array. Why: cliChrFun needs each chrome item's own real rect and resolved side, not just its selector. How: This measures every matched chrome element and resolves 'auto' via detEdgFun, since only the tab bar's own placement varies at runtime.
			.map( ( { chrEle, sidStr, selStr } ) => { const recObj = chrEle.getBoundingClientRect(); return { recObj, sidStr : sidStr === 'auto' ? detEdgFun( recObj ) : sidStr, chrEle, selStr }; } )
			.filter( ( chrIteObj ) => chrIteObj.sidStr );



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



					const shaRadObj = shaRadFun( curTarEle, eleWidNum + PAD_MAR_NUM * 2, eleHeiNum + PAD_MAR_NUM * 2, curIteObj.shaStr ); // What: Shape Radius Object. Why: Each perElement instance reads its own border-radius independently. How: This calls shaRadFun with curTarEle's own padded box size.

					const curLabStr = curIteObj.labStr // What: Current Label String. Why: A perElement conditional/reminder/item row's own title should read as "{its own name} Conditional" rather than one generic title shared by every instance. How: This reads text (or an input's own value, for a row currently open/editing) from within curTarEle only, when curIteObj.labStr is set.
						? ( curTarEle.querySelector( curIteObj.labStr )?.textContent || curTarEle.querySelector( curIteObj.labStr )?.value )
						: undefined;

					const padSurObj = claPadFun( tarRecObj, curIteObj.padXNum ?? PAD_MAR_NUM, curIteObj.padYNum ?? PAD_MAR_NUM, chrIteArr, [ curTarEle ] ); // What: Padd Surviving Object. Why: This element's own surviving per-side padding must be computed the same way as the ordinary single-union case below. How: This calls claPadFun with curIteObj's own padXNum/padYNum override, or the flat default.


					nexMapObj[ `${ curIteObj.ideStr }::${ curIndNum }` ] = { ...tarRecObj, width: eleWidNum, height: eleHeiNum, shape: shaRadObj, ...padSurObj, label: curLabStr }; // What: Sub Id Map Write. Why: Each perElement instance is stored under its own synthesized sub-id, all sharing the parent item's own titStr/bodEle when opened. How: This writes the merged rect/shape/pad/label into nexMapObj.


				} );



				return; // What: Per Element Return. Why: A perElement item is fully handled by the loop above; it must never also fall through to the ordinary single-union branch below. How: This exits the outer forEach's own callback for this item.


			}



			if ( curIteObj.feoBoo ) tarEleArr = tarEleArr.slice( 0, 1 ); // What: First Only Slice. Why: Some selectors match one entry per section (one per-group card, say), where CSS's own :first-of-type cannot express "first anywhere on the page". How: This keeps only the first document-order match when curIteObj.feoBoo is set.



			let tarRecObj = uniRecFun( tarEleArr ); // What: Target Rect Object. Why: The ordinary case unions every remaining matched element into one combined rect. How: This runs tarEleArr through uniRecFun.


			if ( !Number.isFinite( tarRecObj.width ) || !Number.isFinite( tarRecObj.height ) ) return; // What: Finite Guard. Why: Every matched element can still end up fully clipped away by uniRecFun's own horizontal-scroll clipping. How: This skips this item once either dimension is not a finite number, the same "no badge this frame" outcome as finding zero elements at all.



			const cliRecObj = cliChrFun( tarRecObj, chrIteArr, tarEleArr ); // What: Clipped Rect Object. Why: The unioned rect must also stay clear of any chrome it is not itself part of. How: This runs tarRecObj through cliChrFun, exempting only the chrome tarEleArr is a member of.


			if ( !cliRecObj ) return; // What: Fully Clipped Guard. Why: An item clipped away by chrome entirely has nothing to highlight this frame. How: This skips this item once cliChrFun returned null.



			tarRecObj = { ...cliRecObj, width: cliRecObj.right - cliRecObj.left, height: cliRecObj.bottom - cliRecObj.top }; // What: Finalized Rect Object. Why: Every later step in this branch needs the clipped rect's own derived width/height alongside its edges. How: This spreads cliRecObj and adds width/height back on.


			const padHorNum = curIteObj.padXNum ?? PAD_MAR_NUM; // What: Pad Horizontal Number. Why: The shape function branch below needs this item's own resolved horizontal pad, not just the flat default. How: This reads curIteObj's own padXNum override, or the flat default.
			const padVerNum = curIteObj.padYNum ?? PAD_MAR_NUM; // What: Pad Vertical Number. Why: The shape function branch below needs this item's own resolved vertical pad, not just the flat default. How: This reads curIteObj's own padYNum override, or the flat default.

			const shaRadObj = typeof curIteObj.shaStr === 'function' // What: Shape Radius Object. Why: A multi-element union like the nav bar has no single source element's own border-radius to read, so its own shape function (passed the box's own padded dimensions) computes a radius directly instead. How: This calls curIteObj.shaStr when it is a function; otherwise a single-element union still reads a real border-radius via shaRadFun, and anything wider falls back to no shape at all.
				? curIteObj.shaStr( tarRecObj.width + padHorNum * 2, tarRecObj.height + padVerNum * 2 )
				: ( tarEleArr.length === 1 ? shaRadFun( tarEleArr[ 0 ], tarRecObj.width + PAD_MAR_NUM * 2, tarRecObj.height + PAD_MAR_NUM * 2, curIteObj.shaStr ) : null );

			const matWidEle = curIteObj.mwsStr ? document.querySelector( curIteObj.mwsStr ) : null; // What: Match Width Element. Why: mwsStr sizes the open tip to a DIFFERENT element's own width than whatever is highlighted, e.g. the nav tip's own .tabbar container. How: This looks mwsStr up directly, independent of tarEleArr.

			const tipWidNum = matWidEle && matWidEle.classList.contains( 'tabbar--bottom' ) // What: Tip Width Number. Why: "As wide as the navbar itself" is only sane on 'bottom' placement, where the container really is a reasonably-sized pill; 'top'/'side' would either run off-screen or force the tip's own text into an extremely tall narrow column. How: This reads matWidEle's own real width only while it carries the 'tabbar--bottom' class, otherwise leaves this undefined.
				? matWidEle.getBoundingClientRect().width : undefined;

			const pinBelYNum = curIteObj.pbsStr ? document.querySelector( curIteObj.pbsStr )?.getBoundingClientRect().bottom : undefined; // What: Pin Below Y Number. Why: Some tips must always sit below one fixed element (e.g. the whole add-reminder form) rather than whichever of its own optional fields happen to be showing. How: This reads pbsStr's own current bottom edge when curIteObj carries one.
			const alwBelBoo  = curIteObj.absStr ? !!document.querySelector( curIteObj.absStr ) : false;                                   // What: Always Below Boolean. Why: Only a page/placement where absStr's own target actually exists (e.g. '.tabbar--side') should skip the normal above/below choice. How: This checks whether absStr currently matches anything at all.
			const padSurObj  = claPadFun( tarRecObj, padHorNum, padVerNum, chrIteArr, tarEleArr );                                        // What: Pad Surviving Object. Why: This item's own surviving per-side padding must be computed the same way as the perElement branch above. How: This calls claPadFun with the same padHorNum/padVerNum already resolved above.


			nexMapObj[ curIteObj.ideStr ] = { ...tarRecObj, shape: shaRadObj, tipWidth: tipWidNum, pinBelowY: pinBelYNum, alwaysBelow: alwBelBoo, scrollable: !!curIteObj.scrBoo, ...padSurObj }; // What: Item Map Write. Why: The rendered overlay reads this exact merged shape back for its own mask cutout, highlight spot, badge, and (once opened) its own tip. How: This writes the finalized rect plus every derived field into nexMapObj.


		} );



		const groMapObj = {}; // What: Group Map Object. Why: columnGroup items (the Day Log panel's per-column highlights) need their own siblings gathered together before they can be snapped edge-to-edge below. How: This starts empty and is filled by the loop directly below.


		allIteArr.forEach( ( curIteObj ) => { // What: Group Gather Loop. Why: Only an item that both declares a columnGroup AND actually has a rect this frame belongs in a group. How: This pushes curIteObj's own ideStr into groMapObj under its own groStr key.


			if ( !curIteObj.groStr || !nexMapObj[ curIteObj.ideStr ] ) return; // What: Not Grouped Guard. Why: An item with no groStr, or one that found nothing this frame, contributes to no group at all. How: This skips this item once either condition fails.



			( groMapObj[ curIteObj.groStr ] || ( groMapObj[ curIteObj.groStr ] = [] ) ).push( curIteObj.ideStr ); // What: Group Push. Why: Every member of the same groStr must end up in the same array, in whatever order they were encountered. How: This lazily creates the group's own array on first use, then pushes this item's own ideStr.


		} );


		Object.values( groMapObj ).forEach( ( groIdeArr ) => { // What: Group Snap Loop. Why: Each column's own union naturally shrinks to just its content's width, leaving dead gaps between neighbors; this snaps every group's own members edge-to-edge instead. How: This walks each columnGroup's own member ids, adjusting their shared rects in place.


			const groTopNum = Math.min( ...groIdeArr.map( ( curIdeStr ) => nexMapObj[ curIdeStr ].top ) );    // What: Group Top Number. Why: Every member of the group must share one continuous table height rather than some columns overhanging their shorter siblings. How: This takes the smallest top among every member's own current rect.
			const groBotNum = Math.max( ...groIdeArr.map( ( curIdeStr ) => nexMapObj[ curIdeStr ].bottom ) ); // What: Group Bottom Number. Why: Same reasoning as groTopNum, for the bottom edge. How: This takes the largest bottom among every member's own current rect.


			groIdeArr.forEach( ( curIdeStr ) => { nexMapObj[ curIdeStr ].top = groTopNum; nexMapObj[ curIdeStr ].bottom = groBotNum; nexMapObj[ curIdeStr ].height = groBotNum - groTopNum; } ); // What: Vertical Snap. Why: Every member's own rect must actually reflect the shared top/bottom/height just computed. How: This overwrites each member's own top/bottom/height in place.

			groIdeArr.sort( ( aIdeStr, bIdeStr ) => nexMapObj[ aIdeStr ].left - nexMapObj[ bIdeStr ].left ); // What: Left To Right Sort. Why: The horizontal snap below needs each member's own left neighbor known, which only works once the group is ordered left to right. How: This sorts groIdeArr in place by each member's own current left edge.


			groIdeArr.forEach( ( curIdeStr, curIndNum ) => { // What: Horizontal Snap Loop. Why: Interior boundaries between neighboring columns must meet at the exact midpoint between them, with no gap and no overlap. How: This walks groIdeArr in left-to-right order, adjusting each member's own left/right in place.


				const curRecObj = nexMapObj[ curIdeStr ]; // What: Current Rect Object. Why: This member's own rect is read and mutated repeatedly below. How: This is a direct reference into nexMapObj, so mutating it here mutates the map itself.

				curRecObj.padLefNum = 0; curRecObj.padRigNum = 0; // What: Pad Reset. Why: This member's own left/right already carry their final, edge-to-edge-adjusted values; padding them again here would reopen the exact gap/overlap this snap exists to close. How: This zeroes both horizontal pads.


                if ( curIndNum === 0 ) curRecObj.left -= PAD_MAR_NUM; // What: First Column Guard. Why: Only the group's own leftmost outer edge should get normal breathing room, since it has no left neighbor to snap flush against. How: This subtracts the flat pad margin from curRecObj's own left only on the first iteration.



				if ( curIndNum === groIdeArr.length - 1 ) { // What: Last Column Guard. Why: The group's own rightmost outer edge also needs normal breathing room, since it has no right neighbor either. How: This adds the flat pad margin to curRecObj's own right only on the last iteration.


					curRecObj.right += PAD_MAR_NUM; // What: Last Column Pad Add. Why: The group's own rightmost outer edge needs the same normal breathing room a non-grouped item would get. How: This adds the flat pad margin back onto curRecObj's own right edge.


				}

				else { // What: Interior Boundary Branch. Why: Every other boundary is shared, touching ground between this member and its own right neighbor. How: This computes the exact midpoint between the two and snaps both edges to it.


					const nexRecObj = nexMapObj[ groIdeArr[ curIndNum + 1 ] ];  // What: Next Rect Object. Why: The midpoint below needs this member's own right neighbor's rect. How: This reads the next id in groIdeArr's own sorted order.
					const midBouNum = ( curRecObj.right + nexRecObj.left ) / 2; // What: Midpoint Boundary Number. Why: This is the exact shared boundary both neighbors must snap to. How: This averages curRecObj's own right and nexRecObj's own left.


					curRecObj.right = midBouNum; nexRecObj.left = midBouNum; // What: Boundary Snap. Why: Both neighbors must end up sharing the exact same boundary, touching with no gap and no overlap. How: This writes midBouNum onto both curRecObj.right and nexRecObj.left.


				}



				curRecObj.width = curRecObj.right - curRecObj.left; // What: Width Recompute. Why: curRecObj's own width must reflect whatever its left/right just settled to. How: This recomputes width directly from the just-adjusted edges.

				nexMapObj[ curIdeStr ].badgeAnchorTop = badRecFun( curRecObj, true ).top; // What: Badge Anchor Stash. Why: plaTipFun's own "flips above" branch needs to know where this member's own centered badge sits, well above curRecObj.top itself. How: This computes the centered badge rect (badRecFun's own cenBadBoo mode) now that curRecObj's own group-adjusted top/width are both final, and stashes just its own top.


			} );


		} );


		setRecMapObj( nexMapObj ); // What: Rect Map Commit. Why: The whole freshly-recomputed map must replace the previous one in one single state update. How: This writes nexMapObj into recMapObj via its own setter.


		const togBtnEle = document.querySelector( '.help-btn' ); // What: Toggle Button Element. Why: The page's own toggle button sits inside sticky/stacked chrome that traps its own z-index below the dim layer's, so it needs its own mask cutout even though it is never one of allIteArr. How: This looks up the one .help-btn currently on the page.


		if ( togBtnEle ) { // What: Toggle Found Guard. Why: Only write a toggle rect when the button was actually found. How: This measures and stores togBtnEle's own bounding rect.


			const butRecObj = togBtnEle.getBoundingClientRect(); // What: Button Rect Object. Why: The mask cutout below needs the toggle button's own real on-screen position and size. How: This reads togBtnEle's own bounding rect.


			setTogRecObj( { top: butRecObj.top, left: butRecObj.left, width: butRecObj.width, height: butRecObj.height } ); // What: Toggle Rect Commit. Why: The rendered mask reads togRecObj directly for its own always-on-top cutout. How: This writes a plain { top, left, width, height } copy of butRecObj into togRecObj via its own setter.


		}


	}, [ allIteArr ] ); // What: Effect Dependency Array. Why: This callback's own identity only needs to change when the underlying catalog itself changes. How: allIteArr is read directly throughout the callback body above.



	const safRecFun = React.useCallback( () => { // What: Safe Recompute Function. Why: A thrown error from a single bad measurement (e.g. a target mid-reflow) must not kill the rAF loop permanently, since an uncaught exception would skip the requestAnimationFrame call after it and silently stop all per-frame tracking. How: This wraps recTarFun in a try/catch, logging and swallowing any error instead of letting it propagate.


		try { recTarFun(); } // What: Recompute Try. Why: A thrown error from a single bad measurement must not escape this wrapper uncaught. How: This calls recTarFun inside the guarded block.

		catch ( errRecObj ) { console.error( '[help-mode] recompute failed', errRecObj ); } // What: Recompute Catch. Why: Swallowing the error here, instead of letting it propagate, is what keeps the rAF loop alive for every later frame. How: This logs errRecObj to the console and does nothing else.


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



		const hitTarFun = ( clkEveObj ) => { // What: Hit Target Function. Why: A click is allowed through only when it lands on something help mode itself recognizes. How: This checks the app's own always-exempt chrome first, then falls back to checking every catalog item's own matched elements.


			if ( clkEveObj.target.closest( '.help-badge, .help-tip, .help-btn, .tabbar, .ob-tour' ) ) return true; // What: Exempt Chrome Guard. Why: Navigating away (the tab bar) must still work while help mode is up, and a guided tour walking through this exact feature owns its own clicks already. How: This allows the click through once it lands inside any of these 5 always-exempt regions.



			return allIteArr.some( ( curIteObj ) => finTarFun( curIteObj.selStr ).some( ( curTarEle ) => curTarEle.contains( clkEveObj.target ) ) ); // What: Tagged Element Check. Why: A click on any currently-highlighted target itself must also be allowed through. How: This checks whether the click's own target falls inside any catalog item's own currently-matched elements.


		};



		const clkCapFun = ( clkEveObj ) => { // What: Click Capture Function. Why: This is the actual capture-phase guard blocking every untagged click. How: This lets a genuine target click through (re-measuring shortly after), otherwise swallows the click and closes whatever tip is open.


			if ( hitTarFun( clkEveObj ) ) { // What: On Target Branch. Why: A click that lands on a real target (e.g. Save/Cancel/Delete closing an editor) must not be blocked, just re-measured. How: This defers to a macrotask so the resulting DOM/React commit has already landed before recomputing.


				setTimeout( safRecFun, 0 ); // What: Deferred Recompute Schedule. Why: The click's own resulting DOM/React commit (e.g. an editor closing) needs a tick to actually land before recomputing rects. How: This schedules safRecFun on a macrotask via a 0ms timeout.



				return; // What: On Target Return. Why: A genuine target click must not be swallowed like an off-target one is below. How: This exits the handler once the deferred recompute has been scheduled.


			}



			clkEveObj.preventDefault();  // What: Default Prevention. Why: A click outside any tagged target must never reach whatever it would have normally activated. How: This prevents the click's own default action.
			clkEveObj.stopPropagation(); // What: Propagation Stop. Why: Same reasoning as preventDefault above, for any other listener that might otherwise see this click. How: This stops the click from bubbling further.


			setOpeIdeStr( null ); // What: Open Close. Why: An untagged click is also help mode's own signal to close whatever tip happens to be open. How: This clears opeIdeStr back to null.


		};



		const keyDwnFun = ( keyDwnObj ) => { // What: Key Down Function. Why: Escape closes one thing at a time, a tip first if one is open, then help mode itself on a second press. How: This checks the key, then which of the 2 close targets currently applies.


			if ( keyDwnObj.key !== 'Escape' ) return; // What: Non Escape Guard. Why: Only Escape is a meaningful key for this listener. How: This ignores every other key.



			if ( opeIdeStr != null ) { setOpeIdeStr( null ); return; } // What: Close Tip Guard. Why: Backing out of an open tip should not also leave help mode altogether. How: This closes just the open tip and stops, once one is actually open.



			onCloAllFun(); // What: Exit Call. Why: A second Escape (with no tip open) is what actually leaves help mode entirely. How: This calls the caller's own onCloAllFun, which flips its own active state back off.


		};



		document.addEventListener( 'click', clkCapFun, true ); // What: Click Listener Add. Why: The capture phase ensures this guard runs before any inner element's own handler could otherwise fire. How: This registers clkCapFun for every click in the document.
		document.addEventListener( 'keydown', keyDwnFun );     // What: Keydown Listener Add. Why: Escape must close something regardless of which element currently has focus. How: This registers keyDwnFun for every keydown in the document.



		return () => { // What: Listener Cleanup Return. Why: Both listeners must stop the instant this effect re-runs or help mode turns off. How: This returns a cleanup function that removes both the click and keydown listeners.


			document.removeEventListener( 'click', clkCapFun, true ); // What: Click Listener Remove. Why: The capture-phase guard must not keep intercepting clicks once this effect cleans up. How: This removes clkCapFun, matching the same phase/type it was added with.
			document.removeEventListener( 'keydown', keyDwnFun );     // What: Keydown Listener Remove. Why: Escape must stop being intercepted once this effect cleans up. How: This removes keyDwnFun.


		};


	}, [ actModBoo, allIteArr, onCloAllFun, opeIdeStr, safRecFun ] ); // What: Effect Dependency Array. Why: This effect must re-run whenever help mode itself toggles, or close over a fresh reference to any of the values its own handlers read. How: actModBoo gates registration, allIteArr/safRecFun are read inside hitTarFun/clkCapFun, onCloAllFun/opeIdeStr are read inside keyDwnFun.



	if ( !actModBoo ) return null; // What: Inactive Guard. Why: Nothing at all should render while help mode itself is off. How: This returns null before building any of the JSX below.



	const vieWidNum  = window.innerWidth;                                                                   // What: Viewport Width Number. Why: The SVG mask below needs the current viewport width to fully cover the screen. How: This reads window.innerWidth once per render.
	const vieHeiNum  = window.innerHeight;                                                                  // What: Viewport Height Number. Why: The SVG mask below needs the current viewport height to fully cover the screen. How: This reads window.innerHeight once per render.
	const recEntArr = Object.entries( recMapObj );                                                          // What: Rect Entries Array. Why: Both the mask cutouts and the rendered highlight spots below need to walk every current [id, rect] pair. How: This converts recMapObj into a plain array via Object.entries.
	const basIdeStr = opeIdeStr ? opeIdeStr.split( '::' )[ 0 ] : null;                                      // What: Base Identifier String. Why: opeIdeStr can be a perElement sub-id, so the catalog lookup below needs the id with any "::N" suffix stripped off. How: This splits opeIdeStr on '::' and keeps just the first segment.
	const opeIteObj = basIdeStr ? allIteArr.find( ( curIteObj ) => curIteObj.ideStr === basIdeStr ) : null; // What: Open Item Object. Why: The open tip needs the catalog item whose titStr/bodEle every perElement instance shares. How: This finds the one entry in allIteArr whose own ideStr matches basIdeStr.
	const opeRecObj = opeIdeStr ? recMapObj[ opeIdeStr ] : null;                                            // What: Open Rect Object. Why: The open tip needs the FULL id's own rect, not the base id's. How: This looks opeIdeStr straight up in recMapObj.



	return createPortal( // What: Portal Return. Why: The whole overlay must render into <body> (not wherever this component happens to sit in the tree) so it clamps to the viewport instead of being clipped by an ancestor's own overflow. How: This calls createPortal with the JSX below and document.body as the target.


		<div className='help-mode' aria-live='polite'>{ /* What: Container Help Mode Div Element. Why: This is HelOveCom's own root portaled element. How: This wraps the dim-layer SVG, the rendered highlight spots, every badge, and at most one open tip below. */ }


			<svg
				className='help-dim-svg'
				height={ vieHeiNum }
				width={ vieWidNum }
			>{ /* What: Help Dim Svg Element. Why: This paints the single dim layer with cutouts for every currently-highlighted target. How: This wraps a <mask> defining the cutouts and a full-viewport <rect> filled through that mask below. */ }


				<mask id='help-mask'>{ /* What: Help Mask Element. Why: One shared SVG mask lets arbitrarily many cutouts coexist in a single dim layer, instead of the guided tour's own single-spotlight box-shadow trick. How: This paints a full white rect, then one black rounded-rect per highlighted target/toggle button below. */ }


					<rect fill='#fff' height={ vieHeiNum } width={ vieWidNum } x='0' y='0' />{ /* What: Mask Base Rect Element. Why: A fully-white base means "dim everything" by default, before any cutouts punch through it. How: This is a plain full-viewport white rect. */ }

					{ recEntArr.map( ( [ curIdeStr, curRecObj ] ) => { // What: Mask Cutout Map. Why: Every currently-highlighted target needs its own black cutout rect, shaped and padded to match how it is actually rendered on top. How: This maps recEntArr, reading each rect's own shape/pad fields.


						const { rx, ry } = curRecObj.shape || { rx: DEF_RAD_NUM, ry: DEF_RAD_NUM }; // What: Shape Destructure. Why: A multi-element union with no single shape falls back to the app's own default radius. How: This reads curRecObj's own shape, or the default, directly.
						const padTopNum  = curRecObj.padTopNum ?? PAD_MAR_NUM;                      // What: Pad Top Number. Why: A columnGroup member's own padLefNum/padRigNum are forced to 0 elsewhere, but its padTopNum/padBotNum still apply normally here. How: This reads curRecObj's own padTopNum, falling back to the flat default.
						const padBotNum  = curRecObj.padBotNum ?? PAD_MAR_NUM;                      // What: Pad Bottom Number. Why: A columnGroup member's own padLefNum/padRigNum are forced to 0 elsewhere, but its padTopNum/padBotNum still apply normally here. How: This reads curRecObj's own padBotNum, falling back to the flat default.
						const padLefNum  = curRecObj.padLefNum ?? PAD_MAR_NUM;                      // What: Pad Left Number. Why: Same reasoning as padTopNum/padBotNum above, for the horizontal sides. How: This reads curRecObj's own padLefNum, falling back to the flat default.
						const padRigNum  = curRecObj.padRigNum ?? PAD_MAR_NUM;                      // What: Pad Right Number. Why: Same reasoning as padTopNum/padBotNum above, for the horizontal sides. How: This reads curRecObj's own padRigNum, falling back to the flat default.



						return (

							<rect
								key={ curIdeStr }
								x={ curRecObj.left - padLefNum }
								y={ curRecObj.top - padTopNum }
								rx={ rx }
								ry={ ry }
								width={ curRecObj.width + padLefNum + padRigNum }
								height={ curRecObj.height + padTopNum + padBotNum }
								fill='#000'
							/> // What: Mask Cutout Rect Element. Why: Every currently-highlighted target needs its own black cutout, shaped and padded to match how it is actually rendered on top. How: This is punched at curRecObj's own padded position/size, using rx/ry from its own shape (or the default).

						);


					} ) }

					{ togRecObj && ( // What: Toggle Cutout Check. Why: The page's own toggle button sits inside sticky chrome whose own stacking context traps it below the dim layer's z-index, so it needs a cutout too even though it is never one of allIteArr. How: This renders a plain padded circular cutout only while togRecObj holds a measured rect.


						<rect
							x={ togRecObj.left - PAD_MAR_NUM }
							y={ togRecObj.top - PAD_MAR_NUM }
							rx={ ( togRecObj.height + PAD_MAR_NUM * 2 ) / 2 }
							ry={ ( togRecObj.height + PAD_MAR_NUM * 2 ) / 2 }
							width={ togRecObj.width + PAD_MAR_NUM * 2 }
							height={ togRecObj.height + PAD_MAR_NUM * 2 }
							fill='#000'
						/> // What: Toggle Cutout Rect Element. Why: The toggle button's own cutout needs the same treatment as every other target, just always circular and flatly padded. How: This is punched as a circle (rx/ry set to half the padded height) at togRecObj's own padded position/size.

					) }


				</mask>

				<rect className='help-dim-fill' height={ vieHeiNum } mask='url(#help-mask)' width={ vieWidNum } x='0' y='0' />{ /* What: Help Dim Fill Rect Element. Why: This is the actual visible dim layer, its own cutouts coming entirely from the mask above. How: This is a full-viewport rect filled through url(#help-mask). */ }


			</svg>

			{ recEntArr.map( ( [ curIdeStr, curRecObj ] ) => { // What: Highlight Spot Map. Why: Alongside the mask's own dim-layer cutout, each target also gets a rendered .help-spot div, e.g. for its own visible border/glow styling. How: This maps recEntArr the same way the mask cutouts above do.


				const { rx, ry } = curRecObj.shape || { rx: DEF_RAD_NUM, ry: DEF_RAD_NUM }; // What: Shape Destructure. Why: Same reasoning as the mask cutout above. How: This reads curRecObj's own shape, or the default, directly.
				const padTopNum  = curRecObj.padTopNum ?? PAD_MAR_NUM;                      // What: Pad Top Number. Why: Same reasoning as the mask cutout above. How: This reads curRecObj's own padTopNum, falling back to the flat default.
				const padBotNum  = curRecObj.padBotNum ?? PAD_MAR_NUM;                      // What: Pad Bottom Number. Why: Same reasoning as the mask cutout above. How: This reads curRecObj's own padBotNum, falling back to the flat default.
				const padLefNum  = curRecObj.padLefNum ?? PAD_MAR_NUM;                      // What: Pad Left Number. Why: Same reasoning as the mask cutout above. How: This reads curRecObj's own padLefNum, falling back to the flat default.
				const padRigNum  = curRecObj.padRigNum ?? PAD_MAR_NUM;                      // What: Pad Right Number. Why: Same reasoning as the mask cutout above. How: This reads curRecObj's own padRigNum, falling back to the flat default.

				const spoStyObj = { // What: Spot Style Object. Why: The rendered highlight spot needs its own absolute position/size plus a border-radius matching rx/ry exactly. How: This is applied directly as this div's own inline style below.


					top          : curRecObj.top - padTopNum,                // What: Top Position. Why: The rendered spot must sit at the padded target's own top edge, matching the mask cutout above. How: This subtracts padTopNum from curRecObj's own top.
					left         : curRecObj.left - padLefNum,               // What: Left Position. Why: The rendered spot must sit at the padded target's own left edge, matching the mask cutout above. How: This subtracts padLefNum from curRecObj's own left.
					width        : curRecObj.width + padLefNum + padRigNum,  // What: Spot Width. Why: The rendered spot must span the padded target's own full width, matching the mask cutout above. How: This adds padLefNum and padRigNum onto curRecObj's own width.
					height       : curRecObj.height + padTopNum + padBotNum, // What: Spot Height. Why: The rendered spot must span the padded target's own full height, matching the mask cutout above. How: This adds padTopNum and padBotNum onto curRecObj's own height.
					borderRadius : `${ rx }px / ${ ry }px`                   // What: Spot Border Radius. Why: The rendered spot's own rounding must exactly match the mask cutout's own rx/ry, or the two would visibly mismatch. How: This builds the 2-value CSS border-radius shorthand from rx/ry.


				};



				return (

					<div
						key={ curIdeStr }
						className='help-spot'
						style={ spoStyObj }
					/> // What: Help Spot Div Element. Why: This is the actual visible highlight box drawn around a target, e.g. for its own border/glow styling. How: This is positioned and shaped entirely via spoStyObj, keyed by curIdeStr for React's own list reconciliation.

				);


			} ) }

			{ allIteArr.flatMap( ( curIteObj ) => { // What: Badge Flat Map. Why: Every catalog item contributes 0 or more badges, one per perElement sub-id or exactly one for the ordinary union case. How: This flat-maps allIteArr into a single flat array of rendered badge buttons.


				const badIdeArr = curIteObj.mulBoo // What: Badge Identifier Array. Why: perElement items have no single recMapObj[id]; one badge per synthesized sub-id instead. How: This filters recMapObj's own keys down to this item's own sub-ids, or falls back to its own single id when it has a rect at all.
					? Object.keys( recMapObj ).filter( ( curKeyStr ) => curKeyStr.startsWith( `${ curIteObj.ideStr }::` ) )
					: ( recMapObj[ curIteObj.ideStr ] ? [ curIteObj.ideStr ] : [] );

				return badIdeArr.map( ( curIdeStr ) => { // What: Badge Id Map. Why: Every id this item resolved to above needs its own rendered badge button. How: This maps badIdeArr, reading each one's own current rect back out of recMapObj.


					const curRecObj = recMapObj[ curIdeStr ];                     // What: Current Rect Object. Why: The badge's own position and its title function (if any) both need this id's own current rect. How: This reads curIdeStr straight out of recMapObj.
					const badRecObj = badRecFun( curRecObj, !!curIteObj.groStr ); // What: Badge Rect Object. Why: The badge itself renders at its own anchor point, not at the highlighted target's own position. How: This calls badRecFun, centering only when this item is part of a columnGroup.

					const badLabStr = typeof curIteObj.titStr === 'function' ? curIteObj.titStr( curRecObj ) : ( typeof curIteObj.titStr === 'string' ? curIteObj.titStr : 'More info' ); // What: Badge Label String. Why: The badge's own accessible name should reflect a dynamic title (e.g. reading a picker's own cadence unit) when curIteObj.titStr is a function. How: This calls curIteObj.titStr with curRecObj when it is a function, uses it directly when it is a string, otherwise falls back to a generic label.



					return (

						<button
							key={ curIdeStr }
							type='button'
							className={ ` help-badge   ${ opeIdeStr === curIdeStr ? 'is-on' : '' } ` }
							style={{ top: badRecObj.top, left: badRecObj.left }}
							aria-label={ badLabStr }
							onClick={ ( clkEveObj ) => { clkEveObj.stopPropagation(); setOpeIdeStr( ( preIdeStr ) => preIdeStr === curIdeStr ? null : curIdeStr ); } }
						>{ /* What: Help Badge Button Element. Why: This is the actual clickable "i" marker opening/closing this target's own tip. How: This shows opeIdeStr === curIdeStr as its own "is-on" class and toggles opeIdeStr when clicked. */ }


							i


						</button>

					);


				} );


			} ) }

			{ opeIteObj && opeRecObj && ( // What: Open Tip Check. Why: At most one tip is ever rendered at a time, and only once both its own catalog item and its own current rect are known. How: This renders HelTipCom only while both opeIteObj and opeRecObj are truthy.


				<HelTipCom tipIteObj={ opeIteObj } tarRecObj={ opeRecObj } /> // What: Help Tip Component. Why: The currently-open item's own tip must render on top of everything else once it has both a catalog item and a measured rect to anchor to. How: This renders HelTipCom with opeIteObj/opeRecObj as its own tipIteObj/tarRecObj props.

			) }


		</div>,

		document.body // What: Document Body Target. Why: The whole overlay must render outside the app's own DOM subtree so ancestor overflow/stacking never clips or buries it. How: This is createPortal's own target container argument.

	);


}

// #endregion HelOveCom



export { HelButCom, HelOveCom }; // What: Named Exports. Why: Every tab file that renders a help toggle imports both of these by name. How: This re-exports the 2 components declared above; every other binding in this file is internal-only.


