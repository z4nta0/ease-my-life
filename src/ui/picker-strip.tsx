


// #region Imports

import cssModObj from './picker-strip.module.css'; // What: CSS Module Object. Why: The reel, dissolve, and spotlight pick animations are styled from their own module. How: This maps each class name in picker-strip.module.css to its hashed module class.
import React     from 'react';                     // What: React. Why: This is the UI library PicStrCom is built on. How: This is used directly (React.useState, React.useRef, React.useEffect, React.useMemo, ...) instead of importing individual named hooks.


import { redMotFun } from '../utils/motion.ts'; // What: Reduce Motion Function. Why: Under reduced motion the strip skips its cycle and mounts straight into the settled end state. How: This is checked once on mount unless forMotBoo forces the animation.


import type { IteRcdTyp } from '../core/data-model.ts'; // What: Item Record Type. Why: The strip's candidates are items. How: This types PscProTyp's candidates by their id and name.

// #endregion Imports



/**
 * picker-strip.tsx = Picker Strip
 *
 * @summary
 * The animated pick reveal a picker plays when it runs: a reel, spotlight, or
 * dissolve cycle over the candidate items that settles on the item already
 * picked. It is shared by the Pickers tab's Pick One button and the Settings
 * tab's picker-animation preview, so both always show the same animation.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

type PscProTyp = { canIteArr : Pick< IteRcdTyp, 'id' | 'name' >[], forMotBoo? : boolean, onCycDonFun? : () => void, picIteObj : Pick< IteRcdTyp, 'id' | 'name' > | null, styKeyStr : string }; // What: Picker-Strip-Component Props Type. Why: The strip animates through candidate names toward an already-picked one, in one of three styles. How: This types PicStrCom's props, reading only each candidate's id and name.

// #region PicStrCom

/**
 * PicStrCom = Picker Strip Component
 *
 * @summary
 * Renders the pick "cycle" visualization in one of three styles ('reel' |
 * 'spotlight' | 'dissolve'), all sharing the same timing curve: a fixed
 * number of switches that decelerate toward the already-decided `picIteObj`
 * candidate. Reduced motion skips the cycle entirely and mounts straight
 * into the settled end state, since the pick itself is already decided
 * before this component ever mounts. Reused as-is by the Settings tab's
 * own animation-style preview (see tabs/settings/previews.tsx's
 * PicAniCom), which is why `forMotBoo` exists: an explicit Play
 * press there should still show the animation even under a reduced-
 * motion preference.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.canIteArr   - Candidate Item Array: The pool of items being
 *                            cycled through.
 * @param props.forMotBoo   - Force Motion Boolean: Opts out of the
 *                            reduced-motion skip, for the Settings preview's
 *                            own explicit Play press; defaults to undefined
 *                            (falsy).
 * @param props.onCycDonFun - On Cycle Done Function: Called once the cycle
 *                            settles on picIteObj; optional, since the
 *                            Settings preview never passes it.
 * @param props.picIteObj   - Picked Item Object: The already-decided outcome
 *                            the cycle animates toward, or null while nothing
 *                            has been chosen yet.
 * @param props.styKeyStr   - Style Key String: Which of the three animation
 *                            styles to render: 'reel', 'spotlight', or
 *                            'dissolve'.
 *
 * @returns The current cycle frame for the given style, or the settled
 * end state directly when reduced motion applies.
 *
 * @example
 * ```tsx
 * PicStrCom({ canIteArr, forMotBoo, onCycDonFun, ... }) // => <PicStrCom />
 * ```
 *
*/

function PicStrCom ( { canIteArr, forMotBoo, onCycDonFun, picIteObj, styKeyStr } : PscProTyp ) : React.JSX.Element {


	// #region Cycle State

	const lenCanNum = canIteArr.length;                                                                                       // What: Length Candidate Number. Why: Several branches below need the pool size to compute a modulo row/index. How: This is read once from canIteArr.length and reused throughout.
	const indPicNum = ( picIteObj && lenCanNum ) ? canIteArr.findIndex( ( canCurObj ) => canCurObj.id === picIteObj.id ) : 0; // What: Index Picked Number. Why: The cycle needs to know where the decided outcome sits in the pool so it can land on it. How: This finds picked's own position in candidates, or 0 when there's nothing picked yet.
	const totSteNum = 22;                                                                                                     // What: Total Steps Number. Why: This is the fixed number of switches the cycle animation runs through before settling. How: This bounds the schedule loop below and shapes the deceleration curve.


	const staPosNum = lenCanNum ? ( ( ( ( indPicNum - totSteNum ) % lenCanNum ) + lenCanNum ) % lenCanNum ) + lenCanNum * 2 : 0; // What: Start Position Number. Why: This is the actual computed starting row position described above. How: This is passed as the initial value of rowPosNum below and reused by the schedule loop's own local copy. // What: Start Position Calculation. Why: rowPosNum below is an ABSOLUTE, monotonically-increasing row position, not a modulo index, so advancing it by a constant +1 each step keeps the reel sliding in one direction the whole time (the old approach took the index modulo the list length, snapping backwards a full height every time it wrapped). How: This pre-picks a start offset so that after exactly totSteNum constant steps the reel lands on indPicNum (mod lenCanNum), with a couple of full loops of runway above it.
	const aniOffBoo = !forMotBoo && !!( redMotFun() );                                                                           // What: Animation Off Boolean. Why: This is the actual computed flag described above. How: This combines the forMotBoo opt-out with the shared redMotFun() check. // What: Animation-Off Boolean. Why: Reduced motion skips the cycle entirely, since the pick is already decided by the caller before this component even mounts, making the reel/spotlight/dissolve purely theatre; freezing the visuals via CSS alone would still leave the totSteNum-step timer running (roughly 2.5s) before onCycDonFun fires, gating the caller's own Send button behind a static screen with no feedback. How: forMotBoo (set by the Settings preview's own explicit Play press) opts out of this skip even under a system reduced-motion preference.
	const wraSpoRef = React.useRef( null );                                                                                      // What: Wrap Spotlight Reference. Why: The spotlight style's own wrapping div needs a stable DOM handle. How: This is attached via the spotlight branch's own ref prop, below.

	const [ rowPosNum, setRowPosNum ] = React.useState( staPosNum );                         // What: Row Position Number And Setter. Why: This is the strip's own current absolute row position, driving every style's rendered frame. How: This starts at staPosNum and is advanced by the schedule loop in the effect below.
	const [ traDurNum, setTraDurNum ] = React.useState( 0 );                                 // What: Transition Duration Number And Setter. Why: This is the actual per-step duration described above. How: This starts at 0 and is overwritten by the schedule loop on every step. // What: Per-Step Transition Duration. Why: Each move must animate over the SAME time as the gap until the next move, so transitions are never cut off mid-flight (a fast start) or left sitting idle (a slow end); the motion reads as one continuous, decelerating glide. How: This is recomputed every step by the schedule loop below and applied as the strip's own CSS transition-duration.
	const [ cycPhaStr, setCycPhaStr ] = React.useState( aniOffBoo ? 'settled' : 'cycling' ); // What: Cycle Phase String And Setter. Why: Every style renders differently depending on whether the cycle is still spinning or has already landed. How: This starts on 'settled' when animation is off, otherwise 'cycling', and is flipped to 'settled' once the schedule loop below finishes.

	// #endregion Cycle State



	// #region Short Viewport Tracking

	const [ shoVieBoo, setShoVieBoo ] = React.useState( // What: Short Viewport Boolean And Setter. Why: This mirrors picker-strip.module.css's own `@media (max-height: 750px)` rule (picker-view.module.css's picStaDiv drops its min-height at the same height), but that alone can't help the 'reel' style: its own height is an inline style (rowHeiStr times visRowNum, computed in JS), not CSS, so nothing in the stylesheet can shrink it. Without also reducing the row count here, the reel's own real content would stay exactly as tall as before, growing picStaDiv right back past its reduced min-height as soon as a pick starts running. How: This starts from the media query's current match state and is kept live by the effect right below.

		() => typeof matchMedia === 'function' && matchMedia( '(max-height: 750px)' ).matches // What: Initial Short Viewport Check. Why: The starting value must reflect the current viewport height immediately, without waiting for the effect below to run. How: This safely checks matchMedia support before querying the max-height media query's current match state.

	);


	React.useEffect( () => { // What: Short Viewport Listener Effect. Why: shoVieBoo needs to update live if the viewport is resized past the 750px breakpoint while the cycle is running, not just on mount. How: This subscribes a change listener to the max-height media query and cleans it up on unmount.


		if ( typeof matchMedia !== 'function' ) return; // What: No MatchMedia Guard. Why: Some environments may not support matchMedia at all. How: This bails out of the effect entirely, leaving shoVieBoo at its initial value.



		const medQueObj   = matchMedia( '(max-height: 750px)' );                // What: Media Query Object. Why: The same query used for the initial value must be reused here so the listener matches. How: This is the live MediaQueryList the change listener below attaches to.
		const onVieChaFun = ( chaEveObj : MediaQueryListEvent ) => setShoVieBoo( chaEveObj.matches ); // What: On Viewport Change Function. Why: The viewport's own height can cross the 750px breakpoint at any time while the app is open. How: This updates shoVieBoo to the media query's current match state whenever it fires a change event.


		medQueObj.addEventListener( 'change', onVieChaFun ); // What: Viewport Change Subscribe Call. Why: shoVieBoo needs to be kept live, not just set once at mount. How: This registers onVieChaFun to run on every future change event from medQueObj.



		return () => medQueObj.removeEventListener( 'change', onVieChaFun ); // What: Effect Cleanup Return. Why: The change listener must not outlive this effect run. How: This removes the exact same onVieChaFun reference that was added above.


	}, [] ); // What: Effect Dependency Array. Why: This effect only ever needs to subscribe once, on mount. How: An empty array means it never re-subscribes or re-runs after the initial mount.

	// #endregion Short Viewport Tracking



	React.useEffect( () => { // What: Cycle Schedule Effect. Why: The strip must run its own step-by-step schedule loop to animate rowPosNum toward indPicNum, unless there's nothing to animate or reduced motion applies. How: This bails out early for an empty pool, an unset pick, or reduced motion, otherwise recursively schedules each step via setTimeout until totSteNum is reached.


		if ( !lenCanNum || !picIteObj ) return; // What: Nothing To Animate Guard. Why: There is no cycle to run without both a real pool and a real decided pick. How: This bails out of the effect entirely when either is missing.



		if ( aniOffBoo ) { // What: Reduced Motion Branch. Why: Under reduced motion the cycle should skip straight to done instead of running its schedule loop. How: This defers the onCycDonFun call to the next tick and returns its own cleanup, skipping the rest of the effect.


			const defDonTim = setTimeout( () => { onCycDonFun && onCycDonFun(); }, 0 ); // What: Deferred Done Timeout. Why: Calling onCycDonFun synchronously here could fire the caller's own phase transition ('running' to 'done') mid-render. How: This hands control back on the very next tick instead.



			return () => clearTimeout( defDonTim ); // What: Effect Cleanup Return. Why: A pending deferred call must not fire after this effect re-runs or unmounts. How: This cancels the scheduled defDonTim timeout.


		}



		let curPosNum = staPosNum; // What: Current Position Number. Why: The schedule loop below needs its own mutable running position, seeded from the same start the initial render used. How: This is incremented by 1 on every step inside schSteFun.
		let steCouNum = 0;         // What: Step Count Number. Why: The schedule loop needs to know how many steps have elapsed so it can stop at totSteNum and shape the deceleration curve. How: This is incremented by 1 on every step inside schSteFun.
		let canRunBoo = false;     // What: Cancel Run Boolean. Why: A pending setTimeout chain must stop scheduling further steps once this effect is cleaned up. How: This is flipped to true by the cleanup function and checked at the top of every scheduled step.


		const schSteFun = ( gapTimNum : number ) => { // What: Schedule Step Function. Why: Each step's own timing depends on the previous step's computed duration, so the steps must schedule themselves recursively rather than run on one fixed interval. How: This waits gapTimNum ms, advances the position and step count, computes the next gap, updates state, then schedules itself again until totSteNum is reached.


			if ( canRunBoo ) return; // What: Already Cancelled Guard. Why: A step that fires after cleanup ran must not do anything at all. How: This bails out before even setting the inner setTimeout.



			setTimeout( () => { // What: Step Timeout. Why: This is the actual delay before this step's own state updates apply. How: This waits gapTimNum ms, then runs the step body below.


				if ( canRunBoo ) return; // What: Cancelled-Mid-Wait Guard. Why: Cleanup may have run while this exact timeout was pending. How: This bails out before applying any state updates for this step.



				steCouNum++; // What: Step Count Increment. Why: This step has now actually happened. How: This advances the running step counter by 1.


				if ( steCouNum > totSteNum ) { // What: Cycle Complete Guard. Why: Once every scheduled step has run, the cycle is done and should settle. How: This flips cycPhaStr to 'settled', calls onCycDonFun, and returns without scheduling any further step.


					setCycPhaStr( 'settled' ); // What: Settle Phase Call. Why: Every style's render branch needs to know the cycle has landed. How: This writes 'settled' into cycPhaStr.

					onCycDonFun && onCycDonFun(); // What: Done Callback Guard. Why: The caller needs to know the cycle has finished so it can move its own phase from 'running' to 'done'. How: This calls onCycDonFun only when the caller actually passed one.



					return; // What: Early Return. Why: There is nothing left to schedule once the cycle is complete. How: This exits schSteFun's inner timeout callback immediately.


				}



				curPosNum += 1; // What: Position Advance. Why: The reel/spotlight/dissolve frame must move forward by exactly one row each step. How: This increments the running position by 1.


				const proRatNum = steCouNum / totSteNum;                 // What: Progress Ratio Number. Why: This is the actual 0..1 progress value described above. How: This is steCouNum divided by totSteNum. // What: Deceleration Curve. Why: The cycle should start fast (roughly 40ms per step) and slow to a stop (roughly 300ms per step) as it approaches indPicNum. How: proRatNum is this step's progress through totSteNum, raised to a 2.2 exponent to bias the curve toward a late, gentle stop.
				const nexGapNum = 40 + Math.pow( proRatNum, 2.2 ) * 260; // What: Next Gap Number. Why: This is the actual eased delay, in ms, before the following step should fire. How: This maps proRatNum through the curve above onto the 40-300ms range.


				setTraDurNum( nexGapNum ); // What: Transition Duration Update Call. Why: The CSS transition for this exact move must last exactly as long as the gap until the next one. How: This writes nexGapNum into traDurNum.
				setRowPosNum( curPosNum ); // What: Row Position Update Call. Why: This is the actual frame advance every style's render branch reacts to. How: This writes the freshly-incremented curPosNum into rowPosNum.

				schSteFun( nexGapNum ); // What: Recursive Schedule Call. Why: The chain must continue until the cycle-complete guard above stops it. How: This schedules the next step using the same eased gap just computed.


			}, gapTimNum ); // What: Step Delay. Why: Each frame of the cycle waits its own scheduled gap before advancing. How: This delays the step by gapTimNum milliseconds.


		};


		const kicOffTim = setTimeout( () => schSteFun( 40 ), 30 ); // What: Kick Off Timeout. Why: The very first step needs a small initial delay before the recursive chain above takes over. How: This starts the whole schedule loop with an initial 40ms gap, 30ms after this effect runs.



		return () => { // What: Effect Cleanup Return. Why: A stale schedule chain must stop scheduling and its pending kickoff must not fire after this effect re-runs or unmounts. How: This flips canRunBoo so every already-queued step's own guard bails out, and cancels the kickoff timeout directly.


			canRunBoo = true; // What: Cancel Flag Set. Why: Any step already queued must see the chain was cancelled. How: This flips canRunBoo to true.

			clearTimeout( kicOffTim ); // What: Kickoff Clear Call. Why: A kickoff that hasn't fired yet must never start the chain. How: This cancels kicOffTim.


		};


		// eslint-disable-next-line react-hooks/exhaustive-deps -- What: Deliberate Dependency Omission. Why: The cycle must restart only on a genuinely new pick, so the other values it reads stay out of the array. How: This silences the react-hooks exhaustive-deps warning for the dependency array below.
	}, [ picIteObj ] ); // What: Effect Dependency Array. Why: A fresh cycle must only start when a genuinely new pick arrives. How: picIteObj changing is the sole trigger; the other values this effect reads (lenCanNum, aniOffBoo, staPosNum, onCycDonFun) are intentionally excluded since they're derived from the same render and don't themselves signal a new cycle.



	// #region Alternate Style Renders

	if ( aniOffBoo ) { // What: Reduced Motion Render Branch. Why: One calm end-state is shown for every style when animation is off, matching what PicAniCom shows for the Settings preview. How: This returns the settled dissolve frame directly, skipping every style-specific branch below.


		return (


			<div className={` ${ cssModObj.picDisDiv }   ${ cssModObj.picDisDivSettled } `}>{ /* What: Dissolve Div Element. Why: This is the single calm end-state shown under reduced motion, regardless of the requested style. How: This renders the picked candidate's own name, already landed. */ }


				<span className={ cssModObj.disNamSpa }>{ picIteObj ? picIteObj.name : '' }</span>{ /* What: Name Span Element. Why: The picked candidate's name is the only thing this end-state needs to show. How: This renders picked.name, or an empty string while nothing is picked yet. */ }


			</div>


		);


	}



	if ( styKeyStr === 'reel' ) { // What: Reel Style Branch. Why: One of the three requested animation styles is a vertical strip that shifts upward. How: This computes the reel's own row geometry and renders its scrolling track.


		const rowHeiStr = 'calc( var( --ver-rhy-p05 ) * 1rem )';   // What: Row Height String. Why: Every reel row is one rhythm step tall, the same token the module's reel rows use, so the JS geometry can never drift from the CSS. How: This is multiplied by row counts in the reel's height and the track's offset below. // Vertical Rhythm Base Plus 5 ~= 59.447px
		const visRowNum = shoVieBoo ? 3 : 5;                       // What: Visible Row Number. Why: An odd count keeps the picked row centered in the stage; a short viewport needs fewer visible rows to fit. How: This picks 3 rows under shoVieBoo, otherwise 5.
		const offRowNum = Math.floor( visRowNum / 2 ) - rowPosNum; // What: Offset Row Number. Why: The track must be shifted so the current row sits in the center of the visible window. How: This counts rows up by the current row's position, then back down by half the visible row count.
		const totRowNum = staPosNum + totSteNum + visRowNum + 4;   // What: Total Row Number. Why: Enough rows must actually exist in the DOM to cover the full monotonic travel plus the visible window above the landing row. How: This sums the start position, every scheduled step, the visible window, and a small buffer.



		return (


			<div
				className={` ${ cssModObj.picReeDiv }   ${ cycPhaStr === 'settled' ? cssModObj.picReeDivSettled : '' } `}

				style={{ height : `calc( ${ rowHeiStr } * ${ visRowNum } )` }}

				data-motion-force-active={ forMotBoo || undefined } // What: Motion Force Active Attribute. Why: An explicit preview request should play the animation even under reduced motion, and the module's reduced-motion rules skip anything under this attribute. How: This sets the presence-only attribute while forMotBoo is true and removes it otherwise.
			>{ /* What: Reel Div Element. Why: This is the reel style's own root, sized to exactly fit its visible row window. How: This wraps the scrolling track plus its top/bottom fade masks and center landing line. */ }


				<div
					className={ cssModObj.reeTraDiv }

					style={{
						transform          : `translateY( calc( ${ rowHeiStr } * ${ offRowNum } ) )`,
						transitionDuration : `${ traDurNum }ms`
					}}
				>{ /* What: Track Div Element. Why: This is the actual scrolling element the animation slides. How: This is translated vertically by offRowNum rows, over a duration of traDurNum, and holds one row per rendered candidate below. */ }


					{ Array.from( Array( totRowNum ).keys(), ( rowIndNum ) => ( // What: Reel Row List Render. Why: totRowNum rows must actually exist so the track has real content to slide through for the whole travel distance. How: This maps a fresh array of that length into one row per rowIndNum, each showing the candidate at rowIndNum modulo lenCanNum.


						<div
							key={ rowIndNum }

							className={ cssModObj.reeRowDiv }

							data-row-highlight-active={ ( cycPhaStr === 'settled' && rowIndNum === rowPosNum ) || undefined } // What: Row Highlight Active Attribute. Why: Once the reel settles, the row on the center line is marked as the pick. How: This sets the presence-only attribute on that one row after settling and removes it otherwise.
						>{ /* What: Row Div Element. Why: Each row shows one candidate's name at its own position in the endless scrolling loop. How: This marks itself with data-row-highlight-active only once the cycle has settled and this is the exact landing row. */ }


							{ canIteArr[ rowIndNum % lenCanNum ].name }{ /* What: Row Name Expression. Why: Each reel row shows one candidate name, cycling through the pool. How: This reads the candidate at rowIndNum modulo the pool size. */ }


						</div>


					))}


				</div>

				<div className={ cssModObj.reeMasDiv } />{ /* What: Mask Div Element. Why: The reel's own top/bottom edges need a soft fade instead of a hard visual cutoff. How: This is a purely decorative overlay, styled entirely via CSS. */ }

				<div className={ cssModObj.reeLinDiv } />{ /* What: Line Div Element. Why: The center landing row needs a visible marker line so the eye has somewhere to settle. How: This is a purely decorative overlay, styled entirely via CSS. */ }


			</div>


		);


	}



	if ( styKeyStr === 'dissolve' ) { // What: Dissolve Style Branch. Why: Another of the three requested animation styles swaps a single name with a soft cross-fade. How: This picks the currently-showing candidate and renders it inside a keyed span so React replays the fade on every change.


		const curCanObj = canIteArr[ rowPosNum % lenCanNum ]; // What: Current Candidate Object. Why: The dissolve style only ever shows one name at a time. How: This is the candidate at the current row position, modulo the pool size.



		return (


			<div
				className={` ${ cssModObj.picDisDiv }   ${ cycPhaStr === 'settled' ? cssModObj.picDisDivSettled : '' } `}

				data-motion-force-active={ forMotBoo || undefined } // What: Motion Force Active Attribute. Why: An explicit preview request should play the animation even under reduced motion, and the module's reduced-motion rules skip anything under this attribute. How: This sets the presence-only attribute while forMotBoo is true and removes it otherwise.
			>{ /* What: Dissolve Div Element. Why: This is the dissolve style's own root, wrapping the fading name and its optional settled glow. How: This is keyed by rowPosNum and curCanObj's own id below so React remounts the span, replaying the fade, on every change. */ }


				<span
					key={ rowPosNum + '_' + curCanObj.id }

					className={ cssModObj.disNamSpa }
				>{ /* What: Name Span Element. Why: This is the actual name that cross-fades between candidates. How: This renders curCanObj's own name, or an empty string on the rare frame where none resolves. */ }


					{ curCanObj ? curCanObj.name : '' }{ /* What: Current Name Expression. Why: The dissolve frame shows the candidate for the current row position. How: This renders curCanObj's name, or nothing while it's missing. */ }


				</span>

				{ cycPhaStr === 'settled' && <div className={ cssModObj.disGloDiv } /> }{ /* What: Settled Glow Check. Why: A soft highlight should only appear once the cycle has actually landed. How: This renders the glow div only while cycPhaStr is 'settled', otherwise nothing. */ }


			</div>


		);


	}

	// #endregion Alternate Style Renders



	const visCanArr = canIteArr.slice( 0, 10 ); // What: Visible Candidate Array. Why: A very large pool would otherwise render an unreasonably tall list. How: This caps the spotlight's own visible list at the first 10 candidates. // What: Spotlight Style Fallthrough. Why: The only remaining requested style is the spotlight list, so nothing further needs to gate this branch. How: This caps the visible candidate list at 10 entries and highlights whichever one the current row position lands on.



	return (


		<div
			ref={ wraSpoRef }

			className={` ${ cssModObj.picSpoDiv }   ${ cycPhaStr === 'settled' ? cssModObj.picSpoDivSettled : '' } `}

			data-motion-force-active={ forMotBoo || undefined } // What: Motion Force Active Attribute. Why: An explicit preview request should play the animation even under reduced motion, and the module's reduced-motion rules skip anything under this attribute. How: This sets the presence-only attribute while forMotBoo is true and removes it otherwise.
		>{ /* What: Spotlight Div Element. Why: This is the spotlight style's own root, listing every visible candidate with the active one highlighted. How: This wraps one row per entry in visCanArr below. */ }


			{ visCanArr.map( ( curCanObj, rowIndNum ) => { // What: Spotlight Row List Render. Why: One row must exist per visible candidate, with the currently-landed one marked. How: This maps visCanArr to one row per curCanObj, computing isaActBoo per row from rowIndNum against the current position.


				const isaActBoo = ( rowIndNum === rowPosNum % visCanArr.length ); // What: Is-An Active Boolean. Why: The spotlight needs to know which single row the cycle currently lands on. How: This compares this row's own index against the current position, modulo the visible list length.



				return (


					<div
						key={ curCanObj.id }

						className={ cssModObj.spoRowDiv }

						data-row-highlight-active={ isaActBoo || undefined } // What: Row Highlight Active Attribute. Why: The row the highlight is currently on stands out from the rest. How: This sets the presence-only attribute on that one row and removes it otherwise.
					>{ /* What: Row Div Element. Why: Each row shows one candidate's name, highlighted only while it's the current landing row. How: This marks itself with data-row-highlight-active whenever isaActBoo is true for this row. */ }


						<span>{ curCanObj.name }</span>{ /* What: Name Span Element. Why: Every row needs its own visible candidate name. How: This renders curCanObj's own name. */ }


					</div>


				);


			}) }


		</div>


	);


}

// #endregion PicStrCom

// #endregion Components



// #region Exports

export { PicStrCom }; // What: Named Export. Why: The Pickers tab's run view and the Settings tab's animation preview both render this strip. How: This exports PicStrCom by name.

// #endregion Exports


