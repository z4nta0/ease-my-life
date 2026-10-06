


// #region Imports

import cssModObj from './segmented-control.module.css'; // What: CSS Module Object. Why: The control's track, thumb, and buttons are styled from their own module. How: This maps each class name in segmented-control.module.css to its hashed module class.
import React     from 'react';                          // What: React. Why: SegConCom is built directly on React's own APIs. How: This is used directly (React.useRef, React.useCallback, React.useLayoutEffect) instead of importing individual named hooks.

// #endregion Imports



/**
 * segmented-control.tsx = Segmented Control
 *
 * @summary
 * The app's shared segmented control: a row of mutually exclusive option
 * buttons with a sliding thumb behind the selected one, used by the reminders
 * schedule editor, the cadence controls, and the Settings tab's placement and
 * theme-mode choices.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

type SccProTyp< T extends string > = { ariLabStr : string, desIdeStr? : string, layVarStr? : string, onChange : ( keyStr : T ) => void, optIteArr : { keyStr : T, labStr : string }[], value : T }; // What: Segmented-Control-Component Props Type. Why: The control picks one of its options by key, with an accessible name and an optional description and layout. How: This types SegConCom's props, with T the options' own key type, so a caller whose keys are a fixed set gets one of them back.

// #region SegConCom

/**
 * SegConCom = Segment Control Component
 *
 * @summary
 * A generic animated segmented control: a single accent "thumb" slides
 * between options. The thumb tracks the active button's own box (left,
 * width, top, height, so it also follows a wrap to a second line).
 * During a move, the leading edge uses a fast, slightly-overshooting
 * curve while the trailing edge eases in, so the pill stretches in
 * flight and settles with a small bounce, like real momentum.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.ariLabStr - Aria Label String: The control's own accessible
 *                          group label.
 * @param props.desIdeStr - Description Identifier String: An optional id of an
 *                          external element (an advisory note) that describes
 *                          this control.
 * @param props.layVarStr - Layout Variant String: An optional layout, 'grid'
 *                          for a control whose many options wrap into
 *                          aligned columns (Repeat), or 'snug' for one kept
 *                          to its content's width (Day selection).
 * @param props.onChange  - On Change: Called with the clicked entry's own key.
 * @param props.optIteArr - Option Item Array: The array of { keyStr, labStr }
 *                          entries this control renders one button per; also
 *                          read directly by cadence-control.tsx and
 *                          tab-settings.tsx when they build their own option
 *                          arrays for this same component.
 * @param props.value     - Value: The currently-selected entry's own key.
 *
 * @returns The segmented control's own group element, including the
 * sliding thumb span and one button per entry in props.optIteArr.
 *
 * @example
 * ```tsx
 * SegConCom({ ariLabStr, desIdeStr, layVarStr, ... }) // => <SegConCom />
 * ```
 *
*/

function SegConCom< T extends string > ( { ariLabStr, desIdeStr, layVarStr, onChange, optIteArr, value } : SccProTyp< T > ) : React.JSX.Element {


	const segEleRef = React.useRef< HTMLDivElement | null >( null );                                      // What: Segment Element Reference. Why: plaThuFun needs a handle on the actual group DOM node to query and measure it. How: This is attached via the group div's own ref prop below.
	const thuEleRef = React.useRef< HTMLSpanElement | null >( null );                                     // What: Thumb Element Reference. Why: plaThuFun needs a handle on the sliding thumb span to move and resize it. How: This is attached via the thumb span's own ref prop below.
	const preIndRef = React.useRef( optIteArr.findIndex( ( optConObj ) => optConObj.keyStr === value ) ); // What: Previous Index Reference. Why: plaThuFun needs to know which direction the selection just moved in, to decide which edge of the thumb leads the animation. How: This starts at the initially-selected entry's own index and is updated at the end of every plaThuFun run.


	const plaThuFun = React.useCallback( ( aniMovBoo : boolean ) => { // What: Place Thumb Function. Why: This centralizes measuring the active button and moving/resizing the thumb span to match it, with or without an animated transition. How: This is called by both layout effects below, once on every selection/resize and once (with animation) on every value change.


		const segCurEle = segEleRef.current; // What: Segment Current Element. Why: This gives a stable local reference to the live group DOM node for this placement pass. How: This is read once from segEleRef.current and reused below.
		const thuCurEle = thuEleRef.current; // What: Thumb Current Element. Why: This gives a stable local reference to the live thumb span for this placement pass. How: This is read once from thuEleRef.current and reused below.


		if ( !segCurEle || !thuCurEle ) return; // What: Missing Element Guard. Why: Neither ref may be attached yet, such as before the first render commits. How: This bails out of the placement early when either DOM node is unavailable.



		const butActEle = segCurEle.querySelector< HTMLButtonElement >( '[data-element-name-hook~="segConBut"][aria-pressed="true"]' ); // What: Button Active Element. Why: This is the specific option button the thumb needs to sit under. How: This is found via its hook and aria-pressed state inside the group.


		if ( !butActEle ) return; // What: No Active Button Guard. Why: No option is currently marked active, such as mid-transition. How: This bails out of the rest of the placement when there is nothing to measure against.



		const curIndNum = optIteArr.findIndex( ( optConObj ) => optConObj.keyStr === value );                   // What: Current Index Number. Why: This is compared against the previous index to decide which direction the thumb is moving. How: This looks up the currently-selected entry's own position in optIteArr.
		const movDirNum = curIndNum - preIndRef.current;                                                        // What: Move Direction Number. Why: A positive value means the selection moved right, negative means left, deciding which edge of the thumb leads. How: This subtracts the previous index from curIndNum.
		const redMotBoo = window.matchMedia && window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches; // What: Reduced Motion Boolean. Why: A user who prefers reduced motion shouldn't see the thumb glide between optIteArr. How: This safely checks matchMedia support before querying the prefers-reduced-motion media query's current match state.


		if ( !aniMovBoo || redMotBoo ) { // What: No-Animation Branch. Why: Either the caller explicitly asked for an instant placement, or the user prefers reduced motion. How: This clears the thumb's own transition so the move below applies instantly.


			thuCurEle.style.transition = 'none'; // What: Transition Clear. Why: The position/size writes below must apply with no animation at all in this branch. How: This sets the thumb's own CSS transition to 'none'.


		}

		else { // What: Animated Branch. Why: A genuine selection change should glide, with the leading edge overshooting slightly and the trailing edge easing in. How: This picks which edge leads based on movDirNum, then writes a matching CSS transition.


			const leaEasStr = 'cubic-bezier(.22,.9,.24,1.12)';       // What: Lead Ease String. Why: The leading edge of the thumb should overshoot slightly before settling, like real momentum. How: This is assigned to whichever of left/width is leading below.
			const traEasStr = 'cubic-bezier(.65,0,.5,1)';            // What: Trail Ease String. Why: The trailing edge of the thumb should ease in smoothly, stretching the pill in flight. How: This is assigned to whichever of left/width is trailing below.
			const movEasStr = 'cubic-bezier(.5,0,.2,1)';             // What: Move Ease String. Why: A vertical move (wrapping to a second line) has no leading/trailing edge concept, so it always uses this single ease-in-out curve. How: This is assigned to both top and height below.
			const lefEasStr = movDirNum < 0 ? leaEasStr : traEasStr; // What: Left Ease String. Why: The left edge leads when moving left, trails when moving right. How: This picks leaEasStr or traEasStr based on movDirNum's own sign.
			const widEasStr = movDirNum < 0 ? traEasStr : leaEasStr; // What: Width Ease String. Why: The right edge (expressed as width) leads when moving right, trails when moving left. How: This picks traEasStr or leaEasStr based on movDirNum's own sign.


			thuCurEle.style.transition = `left .36s ${ lefEasStr }, width .36s ${ widEasStr }, top .3s ${ movEasStr }, height .3s ${ movEasStr }`; // What: Transition Write. Why: This is the actual animated transition applied to the position/size writes below. How: This interpolates the 4 eased curves computed above into one CSS transition value.


		}



		thuCurEle.style.left     = butActEle.offsetLeft + 'px';   // What: Left Write. Why: This positions the thumb horizontally over the active button. How: This is taken directly from the active button's own offsetLeft.
		thuCurEle.style.top      = butActEle.offsetTop + 'px';    // What: Top Write. Why: This positions the thumb vertically over the active button. How: This is taken directly from the active button's own offsetTop.
		thuCurEle.style.width    = butActEle.offsetWidth + 'px';  // What: Width Write. Why: This sizes the thumb to match the active button's own width. How: This is taken directly from the active button's own offsetWidth.
		thuCurEle.style.height   = butActEle.offsetHeight + 'px'; // What: Height Write. Why: This sizes the thumb to match the active button's own height. How: This is taken directly from the active button's own offsetHeight.
		thuCurEle.style.opacity  = '1';                           // What: Opacity Write. Why: The thumb starts invisible until it has a real measurement to show. How: This reveals the thumb once it has actually been placed.

		preIndRef.current = curIndNum; // What: Previous Index Update. Why: The next call to plaThuFun needs to compare against the index that's current now. How: This overwrites preIndRef with curIndNum.


	}, [ value, optIteArr ] ); // What: Callback Dependency Array. Why: plaThuFun must be recreated whenever either the selected value or the option set itself changes, since both affect which button is "active". How: value decides which button matches, optIteArr decides the whole set plaThuFun searches.


	const plaThuRef = React.useRef( plaThuFun ); // What: Place Thumb Reference. Why: The ResizeObserver below lives for the component's whole life, so calling the plaThuFun it closed over at mount would place the thumb with a stale value and record a stale previous index. How: This holds the newest plaThuFun, synced by the effect just below.


	React.useLayoutEffect( () => { plaThuRef.current = plaThuFun; } ); // What: Place Thumb Sync Effect. Why: The resize observer must always call the current render's plaThuFun. How: This copies the newest plaThuFun into plaThuRef after every render.


	// eslint-disable-next-line react-hooks/exhaustive-deps -- What: Deliberate Dependency Omission. Why: Only a real selection change should animate the thumb, while plaThuFun also changes whenever a parent passes a fresh options array. How: The effect body is recreated every render, so it still calls the current plaThuFun when value changes.
	React.useLayoutEffect( () => { plaThuFun( true ); }, [ value ] ); // What: Selection Change Effect. Why: A genuine value change should animate the thumb to its new position. How: This calls plaThuFun with animation enabled whenever value itself changes.

	React.useLayoutEffect( () => { // What: Mount And Resize Effect. Why: The thumb needs an initial, unanimated placement on mount, and must stay in sync if the group's own layout changes size. How: This places the thumb instantly, then subscribes a ResizeObserver to re-place it (also instantly) on every observed resize.


		plaThuRef.current( false ); // What: Initial Placement Call. Why: This positions the thumb immediately on mount, without waiting for a resize. How: This invokes the current plaThuFun through plaThuRef with animation disabled.


		const resObsObj = new ResizeObserver( () => { // What: Resize Observer Object. Why: The thumb must re-place itself whenever the group's own layout changes size, such as a responsive wrap to a second line. How: This is created once and observes the group element below.


			const thuCurEle = thuEleRef.current; // What: Thumb Current Element. Why: A resize-triggered re-placement must not animate, so this needs a handle on the thumb to clear its transition first. How: This is read once from thuEleRef.current.


			if ( thuCurEle ) thuCurEle.style.transition = 'none'; // What: Transition Clear Guard. Why: A resize is not a user-driven selection change, so the thumb should snap rather than glide. How: This clears the thumb's own transition only when it's actually mounted.



			plaThuRef.current( false ); // What: Resize Placement Call. Why: This re-measures and re-places the thumb after the layout change. How: This invokes the current plaThuFun through plaThuRef with animation disabled, same as the initial call above.


		} );


		if ( segEleRef.current ) resObsObj.observe( segEleRef.current ); // What: Resize Observer Start Guard. Why: This should only begin observing once the group element actually exists. How: This starts watching the group element for size changes.



		return () => resObsObj.disconnect(); // What: Effect Cleanup Return. Why: The observer must not outlive this effect run. How: This disconnects resObsObj on unmount or before the next run.


	}, [] ); // What: Effect Dependency Array. Why: This effect only ever needs to subscribe its ResizeObserver once, on mount. How: An empty array means it never re-subscribes or re-runs after the initial mount.



	return (


		<div
			ref={ segEleRef }

			className={` ${ cssModObj.segConDiv }   ${ layVarStr === 'grid' ? cssModObj.segConDivGrid : '' }   ${ layVarStr === 'snug' ? cssModObj.segConDivSnug : '' } `}

			data-element-name-hook='segConDiv'

			aria-describedby={ desIdeStr }
			aria-label={ ariLabStr }
			role='group'
		>{ /* What: Segment Group Element. Why: This is SegConCom's own root element, holding the sliding thumb and every option button. How: This renders as a group landmark, its own aria-label/aria-describedby passed straight through from props. Its data-element-name-hook is read by the reminder mini-tours. */ }


			<span
				ref={ thuEleRef }

				className={ cssModObj.segThuSpa }

				aria-hidden='true'
			/>{ /* What: Thumb Span Element. Why: This is the small sliding pill plaThuFun positions and sizes via direct style writes. How: This starts with no inline position at all, until the first layout effect above places it. */ }

			{ optIteArr.map( ( optConObj ) => ( // What: Option Button List Render. Why: One button is needed per configured option, and the option set itself is data, not hardcoded markup. How: This maps optIteArr to one button element per entry, keyed by its own keyStr.


				<button
					key={ optConObj.keyStr }

					className={ cssModObj.segConBut }

					data-element-name-hook='segConBut'

					type='button'

					aria-describedby={ desIdeStr }
					aria-pressed={ value === optConObj.keyStr }

					onClick={ () => onChange( optConObj.keyStr ) }
				>{ optConObj.labStr }</button> // What: Option Button Element. Why: This is the clickable control for selecting this specific option. How: This marks itself pressed when its own keyStr matches value, and calls onChange with its keyStr when clicked. Its data-element-name-hook is read by SegConCom's own active-indicator measurement and the reminder mini-tours.


			) ) }


		</div>


	);


}

// #endregion SegConCom

// #endregion Components



// #region Exports

export { SegConCom }; // What: Named Export. Why: The reminders schedule editor, the cadence controls and the Settings tab all render this control. How: This exports SegConCom by name.

// #endregion Exports


