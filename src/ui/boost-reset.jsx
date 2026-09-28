


// #region Imports

import cssModObj from './boost-reset.module.css'; // What: CSS Module Object. Why: The boost value and reset button styles live in their own module. How: This maps each class name in boost-reset.module.css to its hashed module class.
import React     from 'react';                    // What: React. Why: BooResCom is built directly on React's own APIs. How: This is used directly (React.useEffect, React.useRef, React.useState, React.Fragment) instead of importing individual named hooks.


import { redMotFun } from '../utils/motion.js'; // What: Reduce Motion Function. Why: Under reduced motion the boost value drops to 0 at once instead of ticking down. How: This is checked when Reset is pressed.

// #endregion Imports



/**
 * boost-reset.jsx = Boost Reset
 *
 * @summary
 * The dynamic-mode Boost value and its Reset lever: clicking Reset commits the
 * value to 0 and animates the shown number ticking down to zero. Picker items
 * and conditionals both use it.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

// #region BooResCom

/**
 * BooResCom = Boost Reset Component
 *
 * @summary
 * The dynamic-mode "+N" Boost value plus its Reset lever. Clicking
 * Reset commits the value to 0 (via onResBooFun) AND animates the shown
 * number ticking down to zero. Used by picker items (tab-today's
 * EntEdiCom) and conditionals.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.booValNum   - Boost Value Number: The current boost value to
 *                            display and reset from.
 * @param props.onResBooFun - On Reset Boost Function: Commits the real value
 *                            to 0; called once, immediately, when Reset is
 *                            clicked.
 * @param props.sufTexStr   - Suffix Text String: Extra text appended after
 *                            the number (e.g. a unit); defaults to an empty
 *                            string.
 *
 * @returns The boost value span and the Reset button, as sibling
 * elements with no shared wrapper.
 *
 * @example
 * ```tsx
 * BooResCom({ booValNum, onResBooFun, sufTexStr }) // => <BooResCom />
 * ```
 *
*/

function BooResCom ( { booValNum, onResBooFun, sufTexStr = '' } ) {


	const [ disValNum, setDisValNum ] = React.useState( booValNum ); // What: Display Value Number And Setter. Why: The shown number needs to animate independently of the real committed booValNum while a reset is ticking down. How: This starts mirroring booValNum and is driven by runResFun's own tick loop while a reset animation is running.

	const aniFraRef = React.useRef( 0 ); // What: Animation Frame Reference. Why: A running tick loop's own requestAnimationFrame id must be cancelable, both mid-animation and on unmount. How: This holds the current frame id, read/cleared by runResFun and the cleanup effect below.


	React.useEffect( () => { if ( !aniFraRef.current ) setDisValNum( booValNum ); }, [ booValNum ] ); // What: Value Follow Effect. Why: The shown number should track the real booValNum (e.g. it climbed +1) whenever no reset animation is currently running. How: This applies the real booValNum to disValNum only while aniFraRef holds no active frame id.

	React.useEffect( () => () => cancelAnimationFrame( aniFraRef.current ), [] ); // What: Unmount Cleanup Effect. Why: A tick loop still running when this component unmounts must not keep scheduling frames forever. How: This cancels whatever frame id aniFraRef holds when the component unmounts.


	const runResFun = () => { // What: Run Reset Function. Why: Clicking Reset must commit the real booValNum to 0 immediately while animating the shown number ticking down to match. How: This guards against a no-op reset, respects reduced motion, then drives a duration-scaled eased tick loop down to 0.


		if ( !booValNum ) return; // What: No Value Guard. Why: There is nothing to reset when the boost is already at 0. How: This bails out before touching onResBooFun or starting any animation.



		if ( redMotFun() ) { // What: Reduced Motion Guard. Why: A user who prefers reduced motion shouldn't see the ticking-down animation. How: This commits the reset and snaps the shown number straight to 0, skipping the tick loop entirely.


			onResBooFun();     // What: On Reset Boost Call. Why: The real value must still be committed to 0. How: This calls the caller's own reset handler.
			setDisValNum( 0 ); // What: Display Value Snap. Why: The shown number should match without animating. How: This sets disValNum straight to 0.



			return; // What: Reduced Motion Return. Why: Nothing is left to animate. How: This exits before the tick loop below is ever started.


		}



		const staValNum = booValNum;                                        // What: Start Value Number. Why: The tick loop below needs the original boost booValNum to ease down from, even after onResBooFun below changes the real booValNum to 0. How: This captures booValNum before it changes.
		const staTimNum = performance.now();                                // What: Start Time Number. Why: Each animation frame needs to know how much time has elapsed since the tick loop began. How: This captures the current high-resolution timestamp.
		const durValNum = Math.max( 280, Math.min( 900, staValNum * 55 ) ); // What: Duration Value Number. Why: A small boost shouldn't blink past and a large one shouldn't crawl. How: This scales the animation's own duration with staValNum, clamped to a sensible min/max.


		onResBooFun(); // What: On Reset Call. Why: The real committed booValNum must become 0 immediately, independent of however long the shown-number animation takes. How: This calls the caller's own reset handler right away.

		cancelAnimationFrame( aniFraRef.current ); // What: Frame Cancel Guard. Why: A rapid repeat click must not let an earlier tick loop keep racing this new one. How: This cancels whatever frame id aniFraRef currently holds before starting a fresh loop.


		const ticFraFun = ( fraTimNum ) => { // What: Tick Frame Function. Why: This is the actual per-frame step that eases the shown number down to 0 over durValNum. How: This computes an eased progress ratio from elapsed time, sets disValNum accordingly, and reschedules itself until progress reaches 1.


			const proRatNum = Math.min( 1, ( fraTimNum - staTimNum ) / durValNum ); // What: Progress Ratio Number. Why: The eased booValNum below needs a clamped [0,1] linear progress to work from. How: This divides elapsed time by durValNum, capped at 1.
			const easRatNum = 1 - Math.pow( 1 - proRatNum, 3 );                     // What: Eased Ratio Number. Why: A cubic ease-out reads more natural than a linear countdown. How: This applies a standard cubic ease-out curve to proRatNum.


			setDisValNum( Math.round( staValNum * ( 1 - easRatNum ) ) ); // What: Display Value Update. Why: This is the actual visible countdown step for this frame. How: This sets disValNum to staValNum scaled down by the eased ratio, rounded to a whole number.


			if ( proRatNum < 1 ) aniFraRef.current = requestAnimationFrame( ticFraFun ); // What: Reschedule Guard. Why: The loop must keep running until progress genuinely reaches 1. How: This schedules another frame and keeps aniFraRef pointed at it.

			else { // What: Completion Branch. Why: The loop must end exactly at 0, not whatever the last rounded frame happened to compute. How: This clears aniFraRef and snaps disValNum to exactly 0.


				aniFraRef.current = 0; // What: Animation Frame Clear. Why: No loop is running anymore, so the value-follow effect may resume. How: This resets aniFraRef to 0.
				setDisValNum( 0 );     // What: Display Value Snap. Why: The countdown must land on exactly 0. How: This sets disValNum to 0.


			}


		};


		aniFraRef.current = requestAnimationFrame( ticFraFun ); // What: Frame Start Call. Why: The tick loop above needs to actually begin. How: This schedules the first frame and records its id in aniFraRef.


	};



	return (


		<React.Fragment>{ /* What: Boost Reset Fragment Element. Why: The booValNum span and reset button are true siblings with no shared wrapper element of their own. How: This groups the two below without adding an extra DOM node. */ }


			<span
				className={ cssModObj.pieBoostVal }

				data-element-name-hook='booValSpa'
			>+{ disValNum }{ sufTexStr }</span>{ /* What: Boost Value Span Element. Why: This shows the current (possibly mid-animation) boost number. How: This renders a literal "+" followed by disValNum and the caller's own sufTexStr. Its data-element-name-hook is read by help mode's Today catalog, help mode's Pickers catalog, and help mode's Data catalog. */ }

			<button
				className={ cssModObj.pieReset }

				disabled={ !booValNum }

				aria-label='Reset boost to zero'

				onClick={ runResFun }
			>Reset</button>{ /* What: Reset Button Element. Why: This is the actual lever that commits the boost back to 0. How: This is disabled while already at 0, otherwise runs runResFun on click. */ }


		</React.Fragment>


	);


}

// #endregion BooResCom

// #endregion Components



// #region Exports

export { BooResCom }; // What: Named Export. Why: The item editor and the conditional controls both show this boost control. How: This exports BooResCom by name.

// #endregion Exports


