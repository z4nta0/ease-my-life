


// #region Imports

import cssModObj from './tooltip.module.css'; // What: CSS Module Object. Why: This file's elements are styled from their own module. How: This maps each class name in tooltip.module.css to its hashed module class.
import React     from 'react';                // What: React. Why: HelTipCom is built directly on React's own APIs. How: This is used directly (React.useLayoutEffect, for one) instead of importing individual named hooks.


import { rhyPixFun } from '../utils/rhythm.ts'; // What: Rhythm Pixel Function. Why: Pixel layout math here needs the same step sizes the stylesheet uses. How: This returns a vertical rhythm step in pixels at the current root font size.


import type { HelIteTyp } from './catalog-item.ts'; // What: Help Item Type. Why: The tip renders one catalog item's title and body. How: This types HtcProTyp's item.
import type { HelRecTyp } from './geometry.ts';     // What: Help Rect Type. Why: The tip is placed against its item's measured rect. How: This types plaTipFun's and HtcProTyp's rect.

// #endregion Imports



/**
 * tooltip.tsx = Tooltip
 *
 * @summary
 * The tip a clicked help badge reveals: HelTipCom renders a highlighted
 * element's own title and body in the tour's coach visual language, and
 * plaTipFun places it beside the target, flipping above or below as space
 * allows.
 *
 * Sections:
 *  - Helpers
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Helpers

// #region plaTipFun

/**
 * plaTipFun = Place Tip Function
 *
 * @summary
 * Where the open tip should sit relative to the target it describes, the same
 * "prefer below, flip above if it would clip, clamp horizontally" idea as both
 * InfTipCom's own plaTipFun and the tour's own coach placement. Both axes are
 * TARGET-relative (the badge only marks where to click), except that a column
 * group member's above placement anchors to its badge (badAncNum), since that
 * badge sits well above the member's own rect: vertically it clears the
 * target's own rect so a big target cannot have "below" still land inside its
 * own box; horizontally the arrow centers on the target's own midpoint, and
 * the tip box is what shifts left/right off that centerpoint to stay clear of
 * the viewport edge. alwBelBoo skips the "prefer below, flip above" choice
 * entirely, for a target spanning nearly the whole viewport itself, where
 * "above" has essentially zero room no matter what. Otherwise this prefers
 * below whenever the full content fits there, and only prefers above when
 * above genuinely has more room than below, never unconditionally either way;
 * a hardcoded preference either way was the actual bug this replaced, since it
 * could either overflow the content back through the target or starve the
 * tip's own scrollable window to almost nothing.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param tarRecObj - Target Rect Object: The target rect the tip is being
 *                    placed relative to.
 * @param tipWidNum - Tip Width Number: The tip's own real, already-measured
 *                    width.
 * @param tipHeiNum - Tip Height Number: The tip's own real, already-measured
 *                    height.
 *
 * @returns { arrHorNum, lefTipNum, maxHeiNum, tipClaStr, topTipNum } for the
 *          tip's own inline style and scroll-capping.
 *
 * @example
 * ```ts
 * plaTipFun(tarRecObj, tipWidNum, tipHeiNum) // => placement
 * ```
 *
*/

function plaTipFun ( tarRecObj : HelRecTyp, tipWidNum : number, tipHeiNum : number ) : { arrHorNum : number, lefTipNum : number, maxHeiNum : number, tipClaStr : string, topTipNum : number } {


	// #region Viewport Limits

	const vieWidNum = window.innerWidth;  // What: Viewport Width Number. Why: The horizontal clamp below needs the current viewport's own width. How: This is read once from window.innerWidth and reused throughout.
	const vieHeiNum = window.innerHeight; // What: Viewport Height Number. Why: The vertical placement below needs the current viewport's own height. How: This is read once from window.innerHeight and reused throughout.
	const edgMarNum = rhyPixFun( 'm02' ); // What: Edge Margin Number. Why: The tip should keep a small margin from the edge of the viewport. How: This is the fixed pixel margin the tip's position and height limits below keep clear. // Vertical Rhythm Base Minus 2 ~= 8.304px

	// #endregion Viewport Limits



	// #region Vertical Placement

	let maxHeiNum; // What: Maximum Height Number. Why: Exactly one of the branches below assigns the tip's own scroll cap. How: This is returned as-is once that branch has run.
	let tipClaStr; // What: Tip Class String. Why: Exactly one of the branches below picks the arrow direction class. How: This is returned as-is once that branch has run.
	let topTipNum; // What: Top Tip Number. Why: Exactly one of the branches below assigns the tip's own top. How: This is returned as-is once that branch has run.



	const useBadBoo = tarRecObj.badAncNum != null;                         // What: Use Badge Boolean. Why: A column group member's own badge sits well above tarRecObj.top itself, so an above-placed tip anchored to tarRecObj.top would point its own arrow at empty space instead of the badge. How: This checks whether tarRecObj carries a badAncNum at all.
	const aboAncNum = tarRecObj.badAncNum ?? tarRecObj.top;                // What: Above Anchor Number. Why: The "flips above" branch below needs one single Y to anchor against, whichever is correct for this target. How: This picks badAncNum when it's set, the same check as useBadBoo, otherwise the target's own top edge.
	const gapAboNum = useBadBoo ? rhyPixFun( 'm02' ) : rhyPixFun( 'bas' ); // What: Gap Above Number. Why: The usual base-step breathing room reads as "detached" for a small round badge specifically, so a badge anchor uses a tighter m02 step instead. How: This picks the m02 step when anchored to a badge, otherwise the app's own normal base-step gap. // Vertical Rhythm Base Minus 2 ~= 8.304px, Vertical Rhythm Base ~= 14.572px
	const spaBelNum = vieHeiNum - tarRecObj.bottom - rhyPixFun( 'bas' );   // What: Space Below Number. Why: This is how much room the "below" placement actually has to work with. How: This subtracts the target's own bottom edge and the normal base-step gap from the viewport's own height. // Vertical Rhythm Base ~= 14.572px
	const spaAboNum = aboAncNum - gapAboNum - edgMarNum;                   // What: Space Above Number. Why: This is how much room the "above" placement actually has to work with. How: This subtracts gapAboNum and the edge margin from aboAncNum.

	const alwBelBoo = !!tarRecObj.alwBelBoo;  // What: Always Below Boolean. Why: A target spanning nearly the whole viewport itself (the nav tip's own 'side'/'top' placements) has essentially zero room above no matter what. How: This reads the target's own always-below flag.
	const fitBelBoo = spaBelNum >= tipHeiNum; // What: Fits Below Boolean. Why: Below wins whenever the full content actually fits there. How: This checks the room below against tipHeiNum.
	const morBelBoo = spaBelNum >= spaAboNum; // What: More Below Boolean. Why: Below also wins whenever it simply has more room than above, even if neither fully fits. How: This compares the two rooms.

	const plaBelBoo = alwBelBoo || fitBelBoo || morBelBoo; // What: Place Below Boolean. Why: The tip prefers below and flips above only when above genuinely has more room. How: This is true when any one of the three holds.


	if ( plaBelBoo ) { // What: Below Branch. Why: Below is the tip's usual side. How: This places the tip a base step under the target, capped by the viewport's own bottom.


		topTipNum = tarRecObj.bottom + rhyPixFun( 'bas' ); // What: Below Top Set. Why: The below branch places the tip a fixed base step under the target, whether it always sits below or has the room there. How: This sets topTipNum to the target's own bottom plus the base step. // Vertical Rhythm Base ~= 14.572px
		tipClaStr = 'helTipDiv--up';                       // What: Up Arrow Set. Why: A tip below the target points its arrow up at it. How: This sets tipClaStr to the up-pointing arrow class.
		maxHeiNum = vieHeiNum - topTipNum - edgMarNum;     // What: Maximum Height Cap. Why: A below-placed tip must still not overflow past the bottom of the viewport. How: This subtracts topTipNum and the edge margin from the viewport's own height.


	}

	else { // What: Flip Above Branch. Why: Above only wins once it has genuinely more room than below. How: This places the tip so its own bottom edge sits gapAboNum clear of aboAncNum, capped to never rise above the edge margin.


		topTipNum = Math.max( edgMarNum, aboAncNum - gapAboNum - tipHeiNum ); // What: Above Top Set. Why: The flip-above branch places the tip so its own bottom edge clears aboAncNum by gapAboNum, capped to never rise above the edge margin. How: This sets topTipNum via Math.max against edgMarNum.
		tipClaStr = 'helTipDiv--down';                                        // What: Down Arrow Set. Why: A tip above the target points its arrow down at it. How: This sets tipClaStr to the down-pointing arrow class.
		maxHeiNum = spaAboNum;                                                // What: Above Maximum Height. Why: An above-placed tip's own ceiling is the target itself, not the viewport's own bottom edge (reusing the "below" formula here let a clamped top overflow back down through the target). How: This bounds maxHeiNum by spaAboNum instead.


	}

	// #endregion Vertical Placement



	// #region Horizontal Placement

	const cenHorNum = tarRecObj.left + tarRecObj.width / 2;                                                            // What: Center Horizontal Number. Why: The tip's own arrow points at the target's own horizontal midpoint, as far as the tip's corners allow. How: This adds half the target's own width to its left edge.
	const lefTipNum = Math.max( edgMarNum, Math.min( cenHorNum - tipWidNum / 2, vieWidNum - tipWidNum - edgMarNum ) ); // What: Left Tip Number. Why: The tip box itself must clamp within the viewport even while its arrow still points at cenHorNum. How: This centers the tip on cenHorNum, then clamps between the edge margin and the viewport's own right-edge margin.
	const arrHorNum = Math.max( 18, Math.min( cenHorNum - lefTipNum, tipWidNum - 26 ) );                               // What: Arrow Horizontal Number. Why: The arrow's own horizontal offset inside the tip box must stay clear of the tip's own rounded corners. How: This computes the arrow's position relative to lefTipNum, clamped to a safe inset range.

	// #endregion Horizontal Placement



	return { arrHorNum, lefTipNum, maxHeiNum, tipClaStr, topTipNum }; // What: Placement Return. Why: The tip's position, arrow direction and offset, and scroll cap are worked out together. How: This returns them as one object.


}

// #endregion plaTipFun

// #endregion Helpers



// #region Components

type HtcProTyp = { tarRecObj : HelRecTyp, tipIteObj : HelIteTyp }; // What: Help-Tip-Component Props Type. Why: A tip renders its catalog item's copy anchored to that item's measured rect. How: This types HelTipCom's props.

// #region HelTipCom

/**
 * HelTipCom = Help Tip Component
 *
 * @summary
 * One tip, positioned once its own size is known, mirroring InfTipCom's own
 * measure-after-mount approach; simpler than the guided tour's permanent
 * hidden measurer. tipIteObj.mtwBoo (set by a tip with long copy, such as the
 * nav tip) sizes the tip to tarRecObj.tipWidNum instead of the usual fixed
 * width, applied as an inline style so it already wins by the time offsetWidth
 * first measures it. tipIteObj.scrBoo caps the tip to whatever vertical room
 * plaTipFun found and scrolls internally past that instead of overflowing the
 * viewport; it is applied to an inner wrapper rather than the outer .helTipDiv
 * box itself, since overflow:auto on the outer box would clip its own arrow,
 * which is deliberately positioned outside the box's own normal content area
 * to poke out and point at the target.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.tarRecObj - Target Rect Object: {@link opeRecObj}
 * @param props.tipIteObj - Tip Item Object: {@link opeIteObj}
 *
 * @returns The tip's own positioned coach bubble.
 *
 * @example
 * ```tsx
 * HelTipCom({ tarRecObj, tipIteObj }) // => <HelTipCom />
 * ```
 *
*/

function HelTipCom ( { tarRecObj, tipIteObj } : HtcProTyp ) : React.JSX.Element {


	const tipEleRef                   = React.useRef< HTMLDivElement | null >( null );        // What: Tip Element Reference. Why: The layout effect below needs a handle on the real tip DOM node to measure and position it. How: This is attached to the root coach div's own ref prop below.
	const [ tipStyObj, setTipStyObj ] = React.useState< React.CSSProperties | null >( null ); // What: Tip Style Object And Setter. Why: The tip's own absolute position is not known until after its first mount/measure. How: This starts null (rendered off-screen) and is written by the layout effect below.
	const [ arrClaStr, setArrClaStr ] = React.useState( 'helTipDiv--up' );                    // What: Arrow Class String And Setter. Why: The tip's own arrow direction depends on whether it landed above or below the target. How: This starts pointing up (the "below target" case) and is written by the layout effect below.
	const [ scrMaxNum, setScrMaxNum ] = React.useState< number | null >( null );              // What: Scroll Maximum Number And Setter. Why: A scrollable tip needs its own inner cap recomputed alongside its position. How: This starts null (uncapped) and is written by the layout effect below.

	const widStyObj = tipIteObj.mtwBoo && tarRecObj.tipWidNum != null ? { width : tarRecObj.tipWidNum } : null; // What: Width Style Object. Why: Only a tip whose own catalog item opts in, AND whose target actually computed a tipWidNum, should override the usual fixed width. How: This reads tarRecObj.tipWidNum only under that combined condition, otherwise falls through to no override at all.


	React.useLayoutEffect( () => { // What: Placement Effect. Why: The tip's own position, arrow direction, and scroll cap must all be recomputed whenever the target it is anchored to changes. How: This measures the mounted tip element and runs plaTipFun against tarRecObj.


		// #region Tip Measurement

		const tipCurEle = tipEleRef.current; // What: Tip Current Element. Why: The measurement below needs a stable local reference to the live tip DOM node. How: This is read once from tipEleRef.current.


		if ( !tipCurEle ) return; // What: No Element Guard. Why: The ref's current value is typed as possibly null. How: This bails out early when there is no tip element to measure.



		const { arrHorNum, lefTipNum, maxHeiNum, tipClaStr, topTipNum } = plaTipFun( tarRecObj, tipCurEle.offsetWidth, tipCurEle.offsetHeight ); // What: Arrow Horizontal Number. Why: The arrow points at the target from wherever the tip lands. How: This reads its offset from plaTipFun, called with the tip's own real measured size. // What: Left Tip Number. Why: The tip's horizontal position for this render. How: This reads it from plaTipFun. // What: Maximum Height Number. Why: A scrollable tip taller than the room left scrolls instead. How: This reads its cap from plaTipFun. // What: Tip Class String. Why: The tip's side decides its arrow's look. How: This reads the class plaTipFun picks. // What: Top Tip Number. Why: The tip's vertical position for this render. How: This reads it from plaTipFun.

		// #endregion Tip Measurement



		// #region Placement State Updates

		setTipStyObj({ // What: Tip Style Update. Why: The rendered tip needs its own top/left plus the CSS custom property its own arrow reads. How: This writes the freshly-computed position into tipStyObj.


			'--tip-arr-off' : arrHorNum + 'px', // What: Tip Arrow Offset Property. Why: The tip's own arrow reads its horizontal offset from this custom property. How: This converts arrHorNum to a px string.
			left            : lefTipNum,        // What: Left Position. Why: This is the tip's own clamped left edge. How: This is lefTipNum as computed by plaTipFun.
			top             : topTipNum         // What: Top Position. Why: This is the tip's own chosen top edge. How: This is topTipNum as computed by plaTipFun.


		});


		setArrClaStr( tipClaStr );                                                    // What: Arrow Class Update. Why: The rendered tip needs its own up/down arrow modifier class. How: This writes tipClaStr into arrClaStr.
		setScrMaxNum( tipIteObj.scrBoo ? maxHeiNum - rhyPixFun( 'bas' ) * 2 : null ); // What: Scroll Maximum Update. Why: A scrollable tip's own inner wrapper must leave room for .helTipDiv's own top and bottom padding. How: This writes maxHeiNum minus that padding, or null when this item is not scrollable at all. // Vertical Rhythm Base ~= 14.572px

		// #endregion Placement State Updates


	}, [ tarRecObj, tipIteObj.mtwBoo, tipIteObj.scrBoo ] ); // What: Effect Dependency Array. Why: This effect must re-run whenever the target it is anchored to moves or resizes, or whenever the item's own width/scroll behavior could change. How: tarRecObj changing means a new position is needed, and tipIteObj.mtwBoo/tipIteObj.scrBoo changing means the sizing rules themselves changed.



	const innStyObj : React.CSSProperties | undefined = scrMaxNum != null ? { maxHeight : scrMaxNum, overflowY : 'auto' } : undefined; // What: Inner Style Object. Why: Only a scrollable item's own inner wrapper needs a capped height and its own scrollbar. How: This builds the style object only while scrMaxNum holds a real cap.



	return (


		<div
			ref={ tipEleRef }

			className={` ${ cssModObj.helTipDiv }   ${ arrClaStr === 'helTipDiv--up' ? cssModObj.helTipDivUp : '' }   ${ arrClaStr === 'helTipDiv--down' ? cssModObj.helTipDivDown : '' } `}

			style={{
				...( tipStyObj || { left : -9999, top : -9999 } ),
				...widStyObj
			}}

			data-element-name-hook='helTipDiv coaCarDiv'

			role='tooltip'
		>{ /* What: Help Tip Div Element. Why: This is HelTipCom's own root rendered element, positioned via tipStyObj/widStyObj and pointed via arrClaStr. How: This wraps the inner scroll-capped content below. Its data-element-name-hook is read by the tours, help mode, and the test suites. */ }


			<div style={ innStyObj }>{ /* What: Inner Scroll Div Element. Why: The scroll cap must live on an inner wrapper so it never clips the outer box's own arrow. How: This applies innStyObj only while this item is scrollable and a cap has been computed. */ }


				<p className={ cssModObj.tipTitPar }>{ typeof tipIteObj.titStr === 'function' ? tipIteObj.titStr( tarRecObj ) : tipIteObj.titStr }</p>{ /* What: Tip Title Paragraph Element. Why: A function title (e.g. the Edit Mode item's) reads the live DOM at open time instead of baking in a value that could go stale. How: This calls tipIteObj.titStr with tarRecObj when it is a function, otherwise renders it directly. */ }

				<div className={ cssModObj.tipBodDiv }>{ typeof tipIteObj.bodEle === 'function' ? tipIteObj.bodEle() : tipIteObj.bodEle }</div>{ /* What: Tip Body Div Element. Why: Same reasoning as the title above applies to a function body. How: This calls tipIteObj.bodEle when it is a function, otherwise renders it directly. */ }


			</div>


		</div>


	);


}

// #endregion HelTipCom

// #endregion Components



// #region Exports

export { HelTipCom }; // What: Named Export. Why: HelTipCom is this file's public component. How: This exports HelTipCom by name; plaTipFun stays private to this file.

// #endregion Exports


