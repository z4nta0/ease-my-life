


// #region Imports

import React from 'react'; // What: React. Why: This is the UI library every component in this file is built on. How: This is used directly (React.useState, React.useRef, React.useEffect, React.useMemo, React.useCallback, React.Fragment) throughout, instead of importing individual named hooks.


import { ButBasCom    } from './ui.jsx';                  // What: Button Base Component. Why: Every action in this file needs a consistently-styled clickable control. How: This is rendered wherever a styled button is needed, across the live picker view, the edit form, and the create form.
import { CAD_NAM_OBJ  } from './cadence.js';              // What: Cadence. Why: This is the namespace of pure functions this file uses to normalize and edit a picker's own cadence. How: This is called for CAD_NAM_OBJ.norCadFun/enfWeeFun/locTipFun/uniWorFun throughout PicForCom.
import { CadConCom    } from './cadence-control.jsx';     // What: Cadence Control. Why: This is the shared editor for a picker's cadence settings. How: This is rendered inside PicForCom's daily-schedule block, wired to the local cadence state.
import { clePicFun    } from './help-sample-data.js';     // What: Clear Pickers Function. Why: Help mode's disposable sample pickers/conditionals must be torn down the moment help mode turns off or this tab unmounts. How: This is called from TabPicCom's own help-mode effect and its unmount cleanup.
import { CodConCom    } from './tab-conditional.jsx';     // What: Conditional Control Component. Why: Attaching a brand-new inline conditional needs the same editor the Data tab uses. How: This is rendered inside PicForCom's conditional-attach block, wired to the local condDraft state.
import { ColDisCom    } from './ui.jsx';                  // What: Collapse Disclosure Component. Why: Several optional sections need an animated expand/collapse instead of an abrupt show/hide. How: This wraps the add-group input, the conditional-attach block, and the daily-schedule block, each gated on its own open boolean.
import { conDraFun    } from './tab-conditional.jsx';     // What: Conditional Draft Function. Why: Starting a new inline conditional needs a sensible starting draft shape. How: This is called whenever the user opens the Add New Conditional pill, seeded from the picker's own name.
import { emlTouObj    } from './eml-tour-bus.js';         // What: Ease My Life Tour Object. Why: A couple of tour-driven behaviors need to read the shared tour bus's current value synchronously, not through React state. How: This is read via emlTouObj.get() when staging a new draft item's tour prefill, and written via emlTouObj.set() to clear a staged empty-state prefill.
import { EntEdiCom  } from './tab-today.jsx';           // What: Entry Editor Component. Why: Adding or editing a pool item reuses the exact same weight/ease editor the Today tab uses. How: This is rendered inline below the pool list, wired to either the real store actions or a local draft-item actions object.
import { HelButCom    } from './help-mode.jsx';           // What: Help Button Component. Why: This page needs its own toggle for entering/exiting help mode. How: This is rendered in the page header, wired to the local helpOn boolean.
import { HelOveCom    } from './help-mode.jsx';           // What: Help Overlay Component. Why: Help mode needs its own highlighted-tooltip overlay layered above the page. How: This is rendered once, fed this page's own PIC_HEL_ARR.
import { IcoSvgCom    } from './ui.jsx';                  // What: Icon Svg Component. Why: Buttons and status rows throughout this file need a small recognizable glyph. How: This is rendered wherever an icon is needed, given a name and a size.
import { InfTipCom    } from './ui.jsx';                  // What: Info Tip Component. Why: Several controls need an explanatory tooltip on hover/focus. How: This wraps the weight/value pills and the disabled Send/Delete buttons, given the tooltip's own label text.
import { norConFun    } from './pickers.js';              // What: Normalize Conditional Function. Why: A new inline conditional's name must be compared against existing ones the same way the store itself normalizes them. How: This is called on the conditional draft's own name before checking it for a collision.
import { norGroFun    } from './pickers.js';              // What: Normalize Group Function. Why: A newly-typed group name must be normalized the same way the store itself normalizes group names. How: This is called on the new-group input's value to compute the picker's effective group.
import { ONB_CHE_OBJ  } from './onboarding-checklist.js'; // What: Onboarding Checklist Object. Why: The Add New Picker button must stay disabled while the guided-tour checklist is still in progress. How: This is checked via ONB_CHE_OBJ.tutProFun against the shared state.
import { PIC_HEL_ARR  } from './help-content.jsx';        // What: Picker Help Array. Why: Help mode needs this page's own list of highlighted elements and their explanations. How: This is passed straight through to HelOveCom.
import { PIC_NAM_OBJ  } from './pickers.js';              // What: Pickers Namespace Object. Why: This is the namespace of pure picking-engine functions this file drives every actual pick through. How: This is called throughout for PIC_NAM_OBJ.picIteFun/reaValFun/modEliFun/aveEasFun.
import { PilTagCom    } from './ui.jsx';                  // What: Pill Tag Component. Why: Small status labels need a consistent pill styling. How: This wraps the mode name, the 'inactive' tag, and the 'not yet'/'spent' tag.
import { ProBarCom    } from './ui.jsx';                  // What: Progress Bar Component. Why: A pool item's drift value needs a visual readiness bar, not just a raw number. How: This is rendered inside the pool row's InfTipCom alongside the raw value.
import { redMotFun    } from './ui.jsx';                  // What: Reduce Motion Function. Why: Several exit/scroll animations must be skipped for a user who prefers reduced motion. How: This is checked before every animated scroll, exit delay, or the reel/spotlight/dissolve cycle itself.
import { SED_NAM_OBJ  } from './seed.js';                 // What: Seed Namespace Object. Why: This is the canonical lookup of every picker mode's own label and hint text. How: This is read (MOD_DEF_OBJ) throughout to show the active mode's label/hint and to render the mode-choice radio list.
import { sedPicFun    } from './help-sample-data.js';     // What: Seed Pickers Function. Why: Help mode needs real pickers of every mode, plus a conditional-gated one, to point its tooltips at. How: This is called the moment help mode turns on.
import { useEmlTouFun } from './eml-tour-bus.js';         // What: Use Ease My Life Tour Function. Why: Several behaviors here read the shared tour bus as React state. How: This is called once per component to subscribe to the picker mini-tour's nonces, the page tour's gating, and the empty-state create prefill.
import { WeeChiCom    } from './ui.jsx';                  // What: Weekday Chip Component. Why: The daily-schedule block needs a 7-day picker for which weekdays a picker may run on. How: This is rendered in PicForCom's schedule block, wired to the local daysOfWeek state.

// #endregion Imports



/**
 * tab-picker.jsx = Tab Picker
 *
 * @summary
 * The Pickers tab: browse, manually run, and create/edit every picker.
 * PicStrCom is the manual "Pick One" spin-and-reveal animation, also reused
 * standalone by settings-previews.jsx's own pick-animation-style preview;
 * PicVieCom is a single picker's own run/view card; PicForCom is the
 * multi-step create/edit form (Details, then Items); TabPicCom ties all of it
 * together as the tab itself, plus the Group/Type filter rails and the
 * disposable-sample machinery help mode and the onboarding tours both rely on.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



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
 * own animation-style preview (see settings-previews.jsx's
 * PicAniCom), which is why `forMotBoo` exists: an explicit Play
 * press there should still show the animation even under a reduced-
 * motion preference.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.canIteArr   - Candidate Item Array: The pool of items being
 *                            cycled through.
 * @param props.picIteObj   - Picked Item Object: The already-decided outcome
 *                            the cycle animates toward, or null while nothing
 *                            has been chosen yet.
 * @param props.styKeyStr   - Style Key String: Which of the three animation
 *                            styles to render: 'reel', 'spotlight', or
 *                            'dissolve'.
 * @param props.onCycDonFun - On Cycle Done Function: Called once the cycle
 *                            settles on picIteObj; optional, since the
 *                            Settings preview never passes it.
 * @param props.forMotBoo   - Force Motion Boolean: Opts out of the
 *                            reduced-motion skip, for the Settings preview's
 *                            own explicit Play press; defaults to undefined
 *                            (falsy).
 *
 * @returns The current cycle frame for the given style, or the settled
 * end state directly when reduced motion applies.
 *
 * @example
 * ```tsx
 * PicStrCom({ canIteArr, picIteObj, styKeyStr, ... }) // => <PicStrCom />
 * ```
 *
*/

function PicStrCom ( { canIteArr, picIteObj, styKeyStr, onCycDonFun, forMotBoo } ) {


	const lenCanNum = canIteArr.length;                                                                                       // What: Length Candidate Number. Why: Several branches below need the pool size to compute a modulo row/index. How: This is read once from canIteArr.length and reused throughout.
	const indPicNum = ( picIteObj && lenCanNum ) ? canIteArr.findIndex( ( canCurObj ) => canCurObj.id === picIteObj.id ) : 0; // What: Index Picked Number. Why: The cycle needs to know where the decided outcome sits in the pool so it can land on it. How: This finds picked's own position in candidates, or 0 when there's nothing picked yet.
	const totSteNum = 22;                                                                                                     // What: Total Steps Number. Why: This is the fixed number of switches the cycle animation runs through before settling. How: This bounds the schedule loop below and shapes the deceleration curve.


	const staPosNum = lenCanNum ? ( ( ( ( indPicNum - totSteNum ) % lenCanNum ) + lenCanNum ) % lenCanNum ) + lenCanNum * 2 : 0; // What: Start Position Number. Why: This is the actual computed starting row position described above. How: This is passed as the initial value of rowPosNum below and reused by the schedule loop's own local copy. // What: Start Position Calculation. Why: rowPosNum below is an ABSOLUTE, monotonically-increasing row position, not a modulo index, so advancing it by a constant +1 each step keeps the reel sliding in one direction the whole time (the old approach took the index modulo the list length, snapping backwards a full height every time it wrapped). How: This pre-picks a start offset so that after exactly totSteNum constant steps the reel lands on indPicNum (mod lenCanNum), with a couple of full loops of runway above it.
	const aniOffBoo = !forMotBoo && !!( redMotFun && redMotFun() );                                                              // What: Animation Off Boolean. Why: This is the actual computed flag described above. How: This combines the forMotBoo opt-out with the shared redMotFun() check. // What: Animation-Off Boolean. Why: Reduced motion skips the cycle entirely, since the pick is already decided by the caller before this component even mounts, making the reel/spotlight/dissolve purely theatre; freezing the visuals via CSS alone would still leave the totSteNum-step timer running (roughly 2.5s) before onCycDonFun fires, gating the caller's own Send button behind a static screen with no feedback. How: forMotBoo (set by the Settings preview's own explicit Play press) opts out of this skip even under a system reduced-motion preference.
	const wraSpoRef = React.useRef( null );                                                                                      // What: Wrap Spotlight Reference. Why: The spotlight style's own wrapping div needs a stable DOM handle. How: This is attached via the spotlight branch's own ref prop, below.

	const [ rowPosNum, setRowPosNum ] = React.useState( staPosNum );                         // What: Row Position Number And Setter. Why: This is the strip's own current absolute row position, driving every style's rendered frame. How: This starts at staPosNum and is advanced by the schedule loop in the effect below.
	const [ traDurNum, setTraDurNum ] = React.useState( 0 );                                 // What: Transition Duration Number And Setter. Why: This is the actual per-step duration described above. How: This starts at 0 and is overwritten by the schedule loop on every step. // What: Per-Step Transition Duration. Why: Each move must animate over the SAME time as the gap until the next move, so transitions are never cut off mid-flight (a fast start) or left sitting idle (a slow end); the motion reads as one continuous, decelerating glide. How: This is recomputed every step by the schedule loop below and applied as the strip's own CSS transition-duration.
	const [ cycPhaStr, setCycPhaStr ] = React.useState( aniOffBoo ? 'settled' : 'cycling' ); // What: Cycle Phase String And Setter. Why: Every style renders differently depending on whether the cycle is still spinning or has already landed. How: This starts on 'settled' when animation is off, otherwise 'cycling', and is flipped to 'settled' once the schedule loop below finishes.


	const [ shoVieBoo, setShoVieBoo ] = React.useState( // What: Short Viewport Boolean And Setter. Why: This mirrors styles2.css's own `@media (max-height: 750px)` rule (.picker-stage's min-height drops there), but that alone can't help the 'reel' style: its own height is a fixed inline style (rowHeiNum * visRowNum, computed in JS), not CSS, so nothing in the stylesheet can shrink it. Without also reducing the row count here, the reel's own real content would stay exactly as tall as before, growing .picker-stage right back past its reduced min-height as soon as a pick starts running. How: This starts from the media query's current match state and is kept live by the effect right below.

		() => typeof matchMedia === 'function' && matchMedia( '(max-height: 750px)' ).matches // What: Initial Short Viewport Check. Why: The starting value must reflect the current viewport height immediately, without waiting for the effect below to run. How: This safely checks matchMedia support before querying the max-height media query's current match state.

	);


	React.useEffect( () => { // What: Short Viewport Listener Effect. Why: shoVieBoo needs to update live if the viewport is resized past the 750px breakpoint while the cycle is running, not just on mount. How: This subscribes a change listener to the max-height media query and cleans it up on unmount.


		if ( typeof matchMedia !== 'function' ) return; // What: No MatchMedia Guard. Why: Some environments may not support matchMedia at all. How: This bails out of the effect entirely, leaving shoVieBoo at its initial value.



		const medQueObj   = matchMedia( '(max-height: 750px)' );                // What: Media Query Object. Why: The same query used for the initial value must be reused here so the listener matches. How: This is the live MediaQueryList the change listener below attaches to.
		const onVieChaFun = ( chaEveObj ) => setShoVieBoo( chaEveObj.matches ); // What: On Viewport Change Function. Why: The viewport's own height can cross the 750px breakpoint at any time while the app is open. How: This updates shoVieBoo to the media query's current match state whenever it fires a change event.


		medQueObj.addEventListener( 'change', onVieChaFun ); // What: Viewport Change Subscribe Call. Why: shoVieBoo needs to be kept live, not just set once at mount. How: This registers onVieChaFun to run on every future change event from medQueObj.



		return () => medQueObj.removeEventListener( 'change', onVieChaFun ); // What: Effect Cleanup Return. Why: The change listener must not outlive this effect run. How: This removes the exact same onVieChaFun reference that was added above.


	}, [] ); // What: Effect Dependency Array. Why: This effect only ever needs to subscribe once, on mount. How: An empty array means it never re-subscribes or re-runs after the initial mount.


	React.useEffect( () => { // What: Cycle Schedule Effect. Why: The strip must run its own step-by-step schedule loop to animate rowPosNum toward indPicNum, unless there's nothing to animate or reduced motion applies. How: This bails out early for an empty pool, an unset pick, or reduced motion, otherwise recursively schedules each step via setTimeout until totSteNum is reached.


		if ( !lenCanNum || !picIteObj ) return; // What: Nothing To Animate Guard. Why: There is no cycle to run without both a real pool and a real decided pick. How: This bails out of the effect entirely when either is missing.



		if ( aniOffBoo ) { // What: Reduced Motion Branch. Why: Under reduced motion the cycle should skip straight to done instead of running its schedule loop. How: This defers the onCycDonFun call to the next tick and returns its own cleanup, skipping the rest of the effect.


			const defDonTim = setTimeout( () => { onCycDonFun && onCycDonFun(); }, 0 ); // What: Deferred Done Timeout. Why: Calling onCycDonFun synchronously here could fire the caller's own phase transition ('running' to 'done') mid-render. How: This hands control back on the very next tick instead.



			return () => clearTimeout( defDonTim ); // What: Effect Cleanup Return. Why: A pending deferred call must not fire after this effect re-runs or unmounts. How: This cancels the scheduled defDonTim timeout.


		}



		let curPosNum = staPosNum; // What: Current Position Number. Why: The schedule loop below needs its own mutable running position, seeded from the same start the initial render used. How: This is incremented by 1 on every step inside schSteFun.
		let steCouNum = 0;         // What: Step Count Number. Why: The schedule loop needs to know how many steps have elapsed so it can stop at totSteNum and shape the deceleration curve. How: This is incremented by 1 on every step inside schSteFun.
		let canRunBoo = false;     // What: Cancel Run Boolean. Why: A pending setTimeout chain must stop scheduling further steps once this effect is cleaned up. How: This is flipped to true by the cleanup function and checked at the top of every scheduled step.


		const schSteFun = ( gapTimNum ) => { // What: Schedule Step Function. Why: Each step's own timing depends on the previous step's computed duration, so the steps must schedule themselves recursively rather than run on one fixed interval. How: This waits gapTimNum ms, advances the position and step count, computes the next gap, updates state, then schedules itself again until totSteNum is reached.


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


			}, gapTimNum );


		};


		const kicOffTim = setTimeout( () => schSteFun( 40 ), 30 ); // What: Kick Off Timeout. Why: The very first step needs a small initial delay before the recursive chain above takes over. How: This starts the whole schedule loop with an initial 40ms gap, 30ms after this effect runs.



		return () => { // What: Effect Cleanup Return. Why: A stale schedule chain must stop scheduling and its pending kickoff must not fire after this effect re-runs or unmounts. How: This flips canRunBoo so every already-queued step's own guard bails out, and cancels the kickoff timeout directly.


			canRunBoo = true; // What: Cancel Flag Set. Why: Any step already queued must see the chain was cancelled. How: This flips canRunBoo to true.

			clearTimeout( kicOffTim ); // What: Kickoff Clear Call. Why: A kickoff that hasn't fired yet must never start the chain. How: This cancels kicOffTim.


		};


		// eslint-disable-next-line react-hooks/exhaustive-deps -- What: Deliberate Dependency Omission. Why: The cycle must restart only on a genuinely new pick, so the other values it reads stay out of the array. How: This silences the react-hooks exhaustive-deps warning for the dependency array below.
	}, [ picIteObj ] ); // What: Effect Dependency Array. Why: A fresh cycle must only start when a genuinely new pick arrives. How: picIteObj changing is the sole trigger; the other values this effect reads (lenCanNum, aniOffBoo, staPosNum, onCycDonFun) are intentionally excluded since they're derived from the same render and don't themselves signal a new cycle.


	if ( aniOffBoo ) { // What: Reduced Motion Render Branch. Why: One calm end-state is shown for every style when animation is off, matching what PicAniCom shows for the Settings preview. How: This returns the settled dissolve frame directly, skipping every style-specific branch below.


		return (


			<div className='dissolve dissolve--settled'>{ /* What: Dissolve Div Element. Why: This is the single calm end-state shown under reduced motion, regardless of the requested style. How: This renders the picked candidate's own name, already landed. */ }


				<span className='dissolve-name'>{ picIteObj ? picIteObj.name : '' }</span>{ /* What: Name Span Element. Why: The picked candidate's name is the only thing this end-state needs to show. How: This renders picked.name, or an empty string while nothing is picked yet. */ }


			</div>


		);


	}



	if ( styKeyStr === 'reel' ) { // What: Reel Style Branch. Why: One of the three requested animation styles is a vertical strip that shifts upward. How: This computes the reel's own row geometry and renders its scrolling track.


		const rowHeiNum = 56;                                                                       // What: Row Height Number. Why: Every reel row is drawn at this fixed pixel height. How: This sizes both the stage's own height below and the translateY offset applied to the track.
		const visRowNum = shoVieBoo ? 3 : 5;                                                        // What: Visible Row Number. Why: An odd count keeps the picked row centered in the stage; a short viewport needs fewer visible rows to fit. How: This picks 3 rows under shoVieBoo, otherwise 5.
		const topOffNum = -( rowPosNum * rowHeiNum ) + ( Math.floor( visRowNum / 2 ) * rowHeiNum ); // What: Top Offset Number. Why: The track must be shifted so the current row sits in the center of the visible window. How: This offsets by the current row's own pixel position, then re-centers by half the visible row count.
		const totRowNum = staPosNum + totSteNum + visRowNum + 4;                                    // What: Total Row Number. Why: Enough rows must actually exist in the DOM to cover the full monotonic travel plus the visible window above the landing row. How: This sums the start position, every scheduled step, the visible window, and a small buffer.



		return (


			<div
				className={ ` reel   reel--${ cycPhaStr } ` }
				style={{ height : rowHeiNum * visRowNum }}
			>{ /* What: Reel Div Element. Why: This is the reel style's own root, sized to exactly fit its visible row window. How: This wraps the scrolling track plus its top/bottom fade masks and center landing line. */ }


				<div
					className='reel-track'
					style={{
						transform          : `translateY(${ topOffNum }px)`,
						transitionDuration : `${ traDurNum }ms`
					}}
				>{ /* What: Track Div Element. Why: This is the actual scrolling element the animation slides. How: This is translated vertically by topOffNum, over a duration of traDurNum, and holds one row per rendered candidate below. */ }


					{ Array.from( Array( totRowNum ).keys(), ( rowIndNum ) => ( // What: Reel Row List Render. Why: totRowNum rows must actually exist so the track has real content to slide through for the whole travel distance. How: This maps a fresh array of that length into one row per rowIndNum, each showing the candidate at rowIndNum modulo lenCanNum.


						<div
							key={ rowIndNum }
							className={ ` reel-row   ${ cycPhaStr === 'settled' && rowIndNum === rowPosNum ? 'is-on' : '' } ` }
						>{ /* What: Row Div Element. Why: Each row shows one candidate's name at its own position in the endless scrolling loop. How: This marks itself "is-on" only once the cycle has settled and this is the exact landing row. */ }


							{ canIteArr[ rowIndNum % lenCanNum ].name }{ /* What: Row Name Expression. Why: Each reel row shows one candidate name, cycling through the pool. How: This reads the candidate at rowIndNum modulo the pool size. */ }


						</div>


					))}


				</div>

				<div className='reel-mask' />{ /* What: Mask Div Element. Why: The reel's own top/bottom edges need a soft fade instead of a hard visual cutoff. How: This is a purely decorative overlay, styled entirely via CSS. */ }

				<div className='reel-line' />{ /* What: Line Div Element. Why: The center landing row needs a visible marker line so the eye has somewhere to settle. How: This is a purely decorative overlay, styled entirely via CSS. */ }


			</div>


		);


	}



	if ( styKeyStr === 'dissolve' ) { // What: Dissolve Style Branch. Why: Another of the three requested animation styles swaps a single name with a soft cross-fade. How: This picks the currently-showing candidate and renders it inside a keyed span so React replays the fade on every change.


		const curCanObj = canIteArr[ rowPosNum % lenCanNum ]; // What: Current Candidate Object. Why: The dissolve style only ever shows one name at a time. How: This is the candidate at the current row position, modulo the pool size.



		return (


			<div className={ ` dissolve   dissolve--${ cycPhaStr } ` }>{ /* What: Dissolve Div Element. Why: This is the dissolve style's own root, wrapping the fading name and its optional settled glow. How: This is keyed by rowPosNum and curCanObj's own id below so React remounts the span, replaying the fade, on every change. */ }


				<span
					key={ rowPosNum + '_' + curCanObj.id }
					className='dissolve-name'
				>{ /* What: Name Span Element. Why: This is the actual name that cross-fades between candidates. How: This renders curCanObj's own name, or an empty string on the rare frame where none resolves. */ }


					{ curCanObj ? curCanObj.name : '' }{ /* What: Current Name Expression. Why: The dissolve frame shows the candidate for the current row position. How: This renders curCanObj's name, or nothing while it's missing. */ }


				</span>

				{ cycPhaStr === 'settled' && <div className='dissolve-glow' /> }{ /* What: Settled Glow Check. Why: A soft highlight should only appear once the cycle has actually landed. How: This renders the glow div only while cycPhaStr is 'settled', otherwise nothing. */ }


			</div>


		);


	}



	const visCanArr = canIteArr.slice( 0, 10 ); // What: Visible Candidate Array. Why: A very large pool would otherwise render an unreasonably tall list. How: This caps the spotlight's own visible list at the first 10 candidates. // What: Spotlight Style Fallthrough. Why: The only remaining requested style is the spotlight list, so nothing further needs to gate this branch. How: This caps the visible candidate list at 10 entries and highlights whichever one the current row position lands on.



	return (


		<div
			ref={ wraSpoRef }
			className={ ` spot   spot--${ cycPhaStr } ` }
		>{ /* What: Spotlight Div Element. Why: This is the spotlight style's own root, listing every visible candidate with the active one highlighted. How: This wraps one row per entry in visCanArr below. */ }


			{ visCanArr.map( ( curCanObj, rowIndNum ) => { // What: Spotlight Row List Render. Why: One row must exist per visible candidate, with the currently-landed one marked. How: This maps visCanArr to one row per curCanObj, computing isaActBoo per row from rowIndNum against the current position.


				const isaActBoo = ( rowIndNum === rowPosNum % visCanArr.length ); // What: Is-An Active Boolean. Why: The spotlight needs to know which single row the cycle currently lands on. How: This compares this row's own index against the current position, modulo the visible list length.



				return (


					<div
						key={ curCanObj.id }
						className={ ` spot-row   ${ isaActBoo ? 'is-on' : '' } ` }
					>{ /* What: Row Div Element. Why: Each row shows one candidate's name, highlighted only while it's the current landing row. How: This marks itself "is-on" whenever isaActBoo is true for this row. */ }


						<span>{ curCanObj.name }</span>{ /* What: Name Span Element. Why: Every row needs its own visible candidate name. How: This renders curCanObj's own name. */ }


					</div>


				);


			}) }


		</div>


	);


}

// #endregion PicStrCom



// #region PicVieCom

/**
 * PicVieCom = Picker View Component
 *
 * @summary
 * The heart of the app: shows the currently-selected picker, lets the user
 * either run a random "Pick One" (playing the reel/spotlight/dissolve cycle
 * from PicStrCom) or manually send/edit/delete individual pool items, and
 * renders the pool list itself with each item's own drift/weight state.
 * Several of its own flags exist purely to narrow or disable specific
 * buttons while either the Pickers page tour or the App Features manual-
 * pick tour is walking a user through this exact screen, without those
 * concerns leaking into the tours' own files.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.picDatObj - Picker Data Object: The currently-selected
 *                          picker record this view renders.
 * @param props.staAppObj - State App Object: {@link useAppStaFun}
 * @param props.actStoObj - Action Store Object: {@link useAppStaFun}
 * @param props.aniStyStr - Animation Style String: Which PicStrCom animation
 *                          style to play: 'reel', 'spotlight', or
 *                          'dissolve'.
 *
 * @returns Either the picker's own edit form (PicForCom, while ediOpeBoo
 * is true) or the full picker view: its run stage, its action buttons,
 * and its pool list.
 *
 * @example
 * ```tsx
 * PicVieCom({ picDatObj, staAppObj, actStoObj, ... }) // => <PicVieCom />
 * ```
 *
*/

function PicVieCom ( { picDatObj, staAppObj, actStoObj, aniStyStr } ) {


	const touBusObj = useEmlTouFun();                 // What: Tour Bus Object. Why: Several buttons on this view must narrow or disable themselves while a guided tour is walking through this exact screen. How: This subscribes to the shared tour event bus, read via its own touPhaStr/touIdeStr/touSteNum fields below.
	const isaTouBoo = touBusObj.touPhaStr === 'tour'; // What: Is-A Tour Boolean. Why: Every gate below needs to know a tour is actually running before it even checks which one. How: This is reused as the shared first operand of every tour-gating boolean that follows.

	const intSenBoo = isaTouBoo && touBusObj.touIdeStr === 'page-explore_pickers' && touBusObj.touSteNum === 7;                         // What: Intercept Send Boolean. Why: The Pickers page tour's own "Add to Todo List" step wants the real Send to Today -> Sent! animation to play, so the user sees what the button actually does, but explicitly does NOT want a real entry landing on Today from it, since this is a tutorial pick on a disposable sample picker, not something the user meant to act on. How: This gates on the exact tourId and step that step is shown at.
	const disDonBoo = intSenBoo || ( isaTouBoo && touBusObj.touIdeStr === 'appfeature-feat_manual_pick' && touBusObj.touSteNum === 3 ); // What: Disable Done Boolean. Why: Done needs the same visual and functional disabling during App Features' own "Make your first manual pick" tour's equivalent step (buildAppFeatureSteps, feat_manual_pick's Step 4, index 3: Step 1 is the shared nav-click, Step 2 is Picker Selection, Step 3 is Manual Generation), since leaving would discard the very pick that tour just walked the user through making, and would also make the step's own target (this whole done/sent view) vanish. How: Re-roll is deliberately NOT included here, unlike intSenBoo above: App Features wants Re-roll to stay genuinely usable without counting as this step's own advancing click; this is deliberately a SEPARATE flag from intSenBoo, since that one also skips the real actions.addEntFun call in senTodFun below, which is correct for the page tour's disposable sample pick but wrong here.
	const disIteBoo = isaTouBoo && touBusObj.touIdeStr === 'page-explore_pickers' && touBusObj.touSteNum === 8;                         // What: Disable Item Boolean. Why: Step 9 ("Picker Items") highlights the pool's per-item Send to Today/Edit/Delete buttons but explicitly doesn't want any of them actually usable from there, since narrating what they do is the point, not inviting the user to act on a disposable tutorial picker's real items. How: This gates on the exact tourId and step that step is shown at.
	const disEdiBoo = disIteBoo || ( isaTouBoo && touBusObj.touIdeStr === 'appfeature-feat_manual_pick' && touBusObj.touSteNum === 4 ); // What: Disable Edit-Delete Boolean. Why: App Features' own "Make your first manual pick" tour reaches this same pool at its own Step 5 (index 4), but unlike the page tour above, Send to Today should stay genuinely usable there (real data, a second valid way to land a pick besides Manual Generation), only Edit/Delete stay narrated-not-usable. How: This deliberately only gates the pool-edit/pool-del buttons below, NOT pool-send's own disabled prop (still disIteBoo alone, naturally unaffected/enabled during this tour).
	const higSenBoo = isaTouBoo && touBusObj.touIdeStr === 'appfeature-feat_manual_pick' && touBusObj.touSteNum === 4;                  // What: Highlight Send Boolean. Why: The same fading-outline pulse (.ob-tour-pulse) tab-data.jsx's own Edit Item tour uses on its own per-element targets draws the eye to the still-genuinely-usable Send to Today buttons specifically, not just the whole .pool-items box the step's own coach already frames. How: This is only ever applied to the real, enabled button below, since disIteBoo is false here and this never touches the is-sent/is-disabled branches.
	const disAddBoo = isaTouBoo && touBusObj.touIdeStr === 'page-explore_pickers' && touBusObj.touSteNum === 9;                         // What: Disable Add Boolean. Why: Step 10 ("Add Picker Item") highlights "+ Add Item" but explicitly doesn't want the user opening the real create-item form from a disposable tutorial picker. How: This gates on the exact tourId and step that step is shown at.

	const [ busPicBoo, setBusPicBoo ] = React.useState( false );  // What: Busy Picking Boolean And Setter. Why: The Pick One button must disable itself and show a busy label while the cycle animation is actually running. How: This is set true by runPicFun and cleared once onAniDonFun fires.
	const [ picResObj, setPicResObj ] = React.useState( null );   // What: Pick Result Object And Setter. Why: The stage and action buttons both need the most recent PIC_NAM_OBJ.picIteFun() outcome to render from. How: This is written by runPicFun/rerActFun and read throughout the render below.
	const [ runPhaStr, setRunPhaStr ] = React.useState( 'idle' ); // What: Run Phase String And Setter. Why: Every part of this view's stage and action row renders differently depending on where the current run actually is. How: This starts on 'idle' and is advanced by runPicFun, onAniDonFun, senTodFun, and the tour-driven effect below. // What: Run Phase Values Note. Why: The phase drives every stage render, so its possible values are worth listing. How: It is one of 'idle', 'running', 'done', 'sent' or 'empty'.


	React.useEffect( () => { // What: Tour Reset Effect. Why: Resets this view back to idle whenever the Pickers page tour's own onBacTouFun bumps touBusObj.resNonNum: a Back from its "Add to Todo List" step to "Manual Generation" needs Pick One showing again, not whatever real Send to Today/Re-roll/Done state a completed pick left behind. How: This is guarded on truthiness (not just present in the deps array) so the unset/0 starting value doesn't also reset on every fresh mount, only a genuine bump does anything.


		if ( !touBusObj.resNonNum ) return; // What: No Bump Guard. Why: A fresh mount's own initial nonce value must not trigger a reset. How: This bails out unless the nonce is genuinely truthy.



		setBusPicBoo( false ); setPicResObj( null ); setRunPhaStr( 'idle' ); // What: Reset Call. Why: The tour's own Back navigation needs this view showing its pre-pick state again. How: This clears every piece of in-progress pick state back to idle.


	}, [ touBusObj.resNonNum ] ); // What: Effect Dependency Array. Why: Only a genuine bump of this exact nonce should re-run this reset. How: touBusObj.resNonNum is the sole trigger; deliberately excluded from a broader deps list since this must NOT re-run for any other reason.


	const [ butLeaBoo, setButLeaBoo ] = React.useState( false ); // What: Button Leaving Boolean And Setter. Why: Re-roll and Done both need their own out-animation to play for a beat before the real state transition happens underneath them. How: This is flipped true by aftExiFun and cleared 180ms later, right before the real action actually runs.


	const aftExiFun = ( runActFun ) => { // What: After Exit Function. Why: Re-roll/Done need a shared helper that plays the exit animation (unless reduced motion applies) before running whatever the caller actually wants to happen. How: This either runs runActFun immediately, or stages butLeaBoo for 180ms first.


		if ( redMotFun() ) { runActFun(); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion shouldn't wait through a skipped animation. How: This runs the caller's action immediately and returns, skipping the staged delay below.



		setButLeaBoo( true ); // What: Leaving Stage Call. Why: The buttons need to actually play their own out-animation now. How: This flips butLeaBoo, which the render below applies as a className modifier.

		setTimeout( () => { // What: Delayed Action Call. Why: The real action must not run until the out-animation has had time to actually play. How: This clears butLeaBoo and runs the caller's action 180ms later.


			setButLeaBoo( false ); // What: Leaving Clear Call. Why: The buttons stop playing their exit once the delay is up. How: This resets butLeaBoo to false.
			runActFun();           // What: Run Action Call. Why: The deferred action runs only after the exit animation. How: This calls the runActFun the caller passed in.


		}, 180 );


	};


	const [ shoDriBoo, setShoDriBoo ] = React.useState( picDatObj.mode !== 'random' && picDatObj.mode !== 'weighted' ); // What: Show Drift Boolean And Setter. Why: A non-random/weighted picker's pool rows can optionally reveal each item's own drift/readiness bar, hidden by default to keep the list simple. How: This starts true whenever the picker's mode isn't 'random' or 'weighted', and is toggled by the pool header's own "Show/Hide drift" link.
	const [ newDraObj, setNewDraObj ] = React.useState( null );                                                         // What: New Draft Object And Setter. Why: Adding a new pool item is held as a LOCAL draft, not committed to the store, until Save, so a reload or tab-switch discards an in-progress item, matching the new-picker create flow. How: This is the editing item; draActObj (below) edits it locally, and cmtDraFun commits it via the real store actions on Save.
	const [ insSavStr, setInsSavStr ] = React.useState( null );                                                         // What: Insert Saved String And Setter. Why: A freshly-committed pool row needs its own insert animation, keyed to its own id. How: This is set by cmtDraFun and cleared once the row's own insert keyframe finishes.
	const [ conDelStr, setConDelStr ] = React.useState( null );                                                         // What: Confirm Delete String And Setter. Why: Deleting a pool item asks for confirmation inline, in place of that row's own normal content. How: This holds the id currently showing its own delete-confirm row.
	const [ conLeaStr, setConLeaStr ] = React.useState( null );                                                         // What: Confirm Leaving String And Setter. Why: Cancelling a delete confirmation needs its own out-animation before the row reverts to normal. How: This holds the id currently playing that leaving animation, cleared once it finishes.

	const penEdiRef = React.useRef( null ); // What: Pending Edit Reference. Why: Set by staEdiFun when it has to close an in-progress new-item draft OR another item's open editor out of the way first, this is picked back up once that draft's/editor's own closing animation ends, so the edit opens right after instead of being silently dropped. How: This holds the target item id to reopen, consumed by the relevant onAnimationEnd handler below.
	const ediSnaRef = React.useRef( null ); // What: Editing Snapshot Reference. Why: A snapshot of whatever item opeEdiFun last opened, taken at that exact moment, used ONLY by staEdiFun to explicitly revert live edits when jumping straight from one item's editor to a different item's, bypassing EntEdiCom's own internal revert-on-unmount. How: That mechanism alone isn't enough here: it arms window.__editGuard's revert via a 0ms setTimeout on unmount, but the very next EntEdiCom's mount effect unconditionally disarms it (so a stale pending revert can't clobber an unrelated fresh edit session), and both the unmount and the next mount happen in the same synchronous effect-flush, well before that timeout would ever fire, so the disarm always wins unless this reverts directly instead.


	const canConFun = () => { // What: Cancel Confirm Function. Why: Cancelling a pending delete needs to play the same leaving animation as everywhere else in this file, unless reduced motion applies. How: This either clears conDelStr immediately, or stages conLeaStr for 150ms first.


		if ( redMotFun() ) { setConDelStr( null ); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion shouldn't wait through a skipped animation. How: This clears the confirm state immediately and returns.



		setConLeaStr( conDelStr ); // What: Leaving Stage Call. Why: The confirm row needs to actually play its own out-animation now. How: This copies the current conDelStr into conLeaStr, which the render below applies as a className modifier.

		setTimeout( () => { // What: Delayed Clear Call. Why: The confirm row must not fully disappear until its own out-animation has had time to actually play. How: This clears both conLeaStr and conDelStr 150ms later.


			setConLeaStr( null ); // What: Leaving Clear Call. Why: The confirm row has finished its exit animation. How: This resets conLeaStr to null.
			setConDelStr( null ); // What: Confirm Clear Call. Why: No row stays in its delete-confirm state. How: This resets conDelStr to null.


		}, 150 );


	};


	const [ rmvIdeStr, setRmvIdeStr ] = React.useState( null ); // What: Removing Identifier String And Setter. Why: A deleted pool row needs its own removal animation to finish before it's actually taken out of the store. How: This holds the id currently playing that removal animation; the row's own onAnimationEnd handler below both clears it and calls actions.delIteFun.
	const [ senIdeStr, setSenIdeStr ] = React.useState( null ); // What: Sent Identifier String And Setter. Why: A pool item just sent to Today via its own per-row button needs a brief checkmark confirmation on that exact row. How: This holds the id currently showing that confirmation, cleared 1400ms later by senIteFun.


	const senIteFun = ( iteIdeStr ) => { // What: Send Item Function. Why: This is full parity with "Pick One" -> Send: it runs the engine forcing this exact item, then stages the identical pending mutation (drift/weight plus bumpPick) so marking it done has the same consequence as a natural pick. How: Ease Down replaces the picker's single entry; other modes add one, both handled inside actions.addEntFun.


		const senResObj = PIC_NAM_OBJ.picIteFun( picDatObj, staAppObj.items, { forceItemId : iteIdeStr } ); // What: Send Result Object. Why: Forcing the pick engine onto this exact item still needs to compute the same pending updates a natural pick would. How: This calls PIC_NAM_OBJ.picIteFun with forceItemId set to the item being sent.


		if ( !senResObj || !senResObj.picObj ) return; // What: No Result Guard. Why: An item that's somehow no longer pickable (already removed, say) must not commit a phantom Today entry. How: This bails out before touching the store at all.



		actStoObj.addEntFun( picDatObj.id, senResObj.picObj.id, { // What: Add Today Entry Call. Why: This is the actual commit that lands the forced pick as a real Today entry, staged exactly like a natural pick. How: This passes through every computed update alongside the forced pick's own id.


			bumpPick    : true,                // What: Bump Pick. Why: A manual send still counts as a pick. How: This is always true here.
			depletedEnd : senResObj.depBoo,    // What: Depleted End. Why: An ease-down pick can empty the pool. How: This passes senResObj.depBoo.
			pickedId    : senResObj.picObj.id, // What: Picked Id. Why: The entry records which item was chosen. How: This passes the picked item's id.
			pickerPatch : senResObj.patObj,    // What: Picker Patch. Why: Some modes also stage picker-level changes. How: This passes senResObj.patObj.
			updates     : senResObj.updArr     // What: Updates. Why: The pick's item mutations are staged, not applied yet. How: This passes senResObj.updArr.


		} );

		setSenIdeStr( iteIdeStr ); // What: Sent Row Flag Call. Why: The exact row just sent needs its own brief confirmation state. How: This writes iteIdeStr into senIdeStr.

		setTimeout( () => setSenIdeStr( ( preIdeStr ) => ( preIdeStr === iteIdeStr ? null : preIdeStr ) ), 1400 ); // What: Sent Row Clear Timeout. Why: The confirmation must not linger forever, but also must not clear a DIFFERENT row's own more recent confirmation. How: This clears senIdeStr 1400ms later, only if it still matches this exact item.


	};


	const [ newCloStr, setNewCloStr ] = React.useState( false ); // What: New Closing String And Setter. Why: The new-item draft's own editor needs to play a closing animation before it's actually torn down, distinguishing a Save close from a Cancel close. How: This holds 'save', 'cancel', or false, consumed by the draft wrap's own onAnimationEnd handler below.

	const addWraRef = React.useRef( null );                                           // What: Add Wrap Reference. Why: Both the new-item and edit-item flows render into this same below-the-list slot, which needs a stable handle so it can be scrolled into view. How: This is attached to the .pv-additem-wrap div's own ref prop, below.
	const useWeiBoo = picDatObj.mode === 'weighted' || picDatObj.mode === 'dynamic';  // What: Uses Weight Boolean. Why: Only these two modes treat an item's weight as a real lever; the others ignore it entirely. How: This gates whether weight fields are carried over/shown throughout this view.
	const isaEasBoo = picDatObj.mode === 'ease-up' || picDatObj.mode === 'ease-down'; // What: Is-An Ease Boolean. Why: Only these two modes use the easeMin/easeMax drift band at all. How: This gates whether ease fields are carried over/shown throughout this view.


	const draActObj = { // What: Draft Actions Object. Why: EntEdiCom expects a real actions-shaped object to call as the user edits the in-progress new-item draft, but that draft isn't committed to the store yet. How: Every method below mirrors the real store action's own name and signature, but writes into newDraObj instead of dispatching a real store update.


		delIteFun : () => setNewDraObj( null ), // What: Delete Item Function. Why: EntEdiCom's own footer Delete button (hidden here via CSS, see the render below) still expects this method to exist. How: This clears newDraObj entirely.
		renIteFun : ( tarIdeStr, newNamStr ) => setNewDraObj( ( preDraObj ) => preDraObj && preDraObj.id === tarIdeStr ? { ...preDraObj, name : newNamStr } : preDraObj ),   // What: Rename Item Function. Why: The name input's own onBlur calls this exactly like the real store action. How: This overwrites just the name field on newDraObj, if the ids still match.
		revIteFun : ( tarIdeStr, snaIteObj ) => setNewDraObj( ( preDraObj ) => preDraObj && preDraObj.id === tarIdeStr ? snaIteObj : preDraObj ),                            // What: Revert Item Function. Why: EntEdiCom's own Cancel/Escape handling calls this to revert to a prior snapshot. How: This replaces newDraObj wholesale with snaIteObj, if the ids still match.
		setWeiFun : ( tarIdeStr, weiValNum ) => setNewDraObj( ( preDraObj ) => preDraObj && preDraObj.id === tarIdeStr ? { ...preDraObj, weight : weiValNum } : preDraObj ), // What: Set Weight Function. Why: EntEdiCom's own weight stepper calls this exactly like the real store action. How: This overwrites just the weight field on newDraObj, if the ids still match.
		updIteFun : ( tarIdeStr, patIteObj ) => setNewDraObj( ( preDraObj ) => preDraObj && preDraObj.id === tarIdeStr ? { ...preDraObj, ...patIteObj } : preDraObj ),       // What: Update Item Function. Why: EntEdiCom calls this exactly like the real store action to apply a field patch. How: This merges patIteObj into newDraObj only if the ids still match.

		togVacFun : ( tarIdeStr ) => setNewDraObj( ( preDraObj ) => preDraObj && preDraObj.id === tarIdeStr ? { // What: Toggle Vacation Function. Why: EntEdiCom's own Active switch calls this exactly like the real store action. How: This flips just the vacation field on newDraObj, if the ids still match.


			...preDraObj, // What: Previous Draft Spread. Why: Every other field stays as it was. How: This copies preDraObj.

			vacation : !preDraObj.vacation // What: Vacation. Why: This is the flag being toggled. How: This inverts the draft's current vacation value.


		} : preDraObj )


	};


	const cmtDraFun = ( draIteObj ) => { // What: Commit Draft Function. Why: Saving the new-item draft must create the real store item and then carry over every field the draft flow itself edited. How: This calls actions.addIteFun, then patches in vacation/weight/ease fields, moves the new item to the end of the pool, and flags it for its own insert animation.


		actStoObj.addIteFun( picDatObj.id, draIteObj.name, draIteObj.id ); // What: Add Item Call. Why: The draft only exists locally until this point; this is what actually creates it in the store. How: This passes the draft's own id through so the created item keeps the same id the draft UI was already using.


		const patIteObj = { vacation : draIteObj.vacation }; // What: Patch Item Object. Why: actions.addIteFun always creates the item active, so the draft's own Active toggle must be carried over too, not just weight/ease fields, or turning it off is silently lost. How: This starts from just the vacation field and gains weight/ease fields below when relevant.


		if ( useWeiBoo ) patIteObj.weight = draIteObj.weight; // What: Weight Patch Guard. Why: Weight only matters for weighted/dynamic modes. How: This adds the draft's own weight into patIteObj only when useWeiBoo is true.



		if ( isaEasBoo ) { // What: Ease Patch Guard. Why: The drift band and starting charge only matter for ease-up/ease-down modes. How: This adds the draft's own easeMin/easeMax/value into patIteObj only when isaEasBoo is true.


			patIteObj.easeMin = draIteObj.easeMin; // What: Ease Min Copy. Why: An ease item keeps the soonest end of its drift band. How: This copies easeMin from the draft.
			patIteObj.easeMax = draIteObj.easeMax; // What: Ease Max Copy. Why: An ease item keeps the latest end of its drift band. How: This copies easeMax from the draft.
			patIteObj.value = draIteObj.value;     // What: Value Copy. Why: An ease item keeps its starting charge. How: This copies value from the draft.


		}



		actStoObj.updIteFun( draIteObj.id, patIteObj ); // What: Update Item Call. Why: actions.addIteFun alone doesn't accept these extra fields, so a follow-up patch is needed to apply them. How: This applies patIteObj to the freshly-created item.

		actStoObj.movIteFun( draIteObj.id ); // What: Move To End Call. Why: A newly-added item should land at the end of the pool's own display order, not wherever the store happened to insert it. How: This reorders the freshly-created item to the end.

		setInsSavStr( draIteObj.id ); // What: Insert Saved Flag Call. Why: The freshly-committed row needs its own insert animation. How: This writes the new item's id into insSavStr, consumed by that row's own onAnimationEnd handler.


	};


	const addIteFun = () => { // What: Add Item Function. Why: Starting a brand-new pool item opens the same slot the edit flow uses, seeded with sensible defaults, then scrolls it into view. How: This bails out if another editor is already open, otherwise generates a fresh id and default draft, then scrolls the new slot into view across two animation frames.


		if ( newDraObj || ediIteStr ) return; // What: One Editor Guard. Why: Only one item editor (new or existing) may be open at a time. How: This bails out if either a new draft or an existing edit is already in progress.



		const newIdeStr = 'it_' + Math.random().toString( 36 ).slice( 2, 8 ); // What: New Identifier String. Why: The new draft item needs a stable, unique-enough id before it's ever committed to the store. How: This builds a short random suffix onto the conventional 'it_' item-id prefix.


		setNewDraObj({ // What: New Draft Seed Call. Why: The freshly-opened editor needs a complete, sensible default item shape to start from. How: This seeds a full charge default for Ease Down (matching addPicFun's own initialValue) and a zeroed one otherwise.


			easeMax  : 14,                                                                  // What: Ease Max. Why: Ease items start with a default latest end. How: This is 14.
			easeMin  : 7,                                                                   // What: Ease Min. Why: Ease items start with a default soonest end. How: This is 7.
			id       : newIdeStr,                                                           // What: Id. Why: The draft needs its own id before it's saved. How: This uses newIdeStr.
			name     : 'New item',                                                          // What: Name. Why: The editor opens with a placeholder name. How: This is the literal 'New item'.
			vacation : false,                                                               // What: Vacation. Why: A new item starts active. How: This is false.
			value    : picDatObj.mode === 'ease-down' ? ( picDatObj.threshold ?? 100 ) : 0, // What: Value. Why: An ease-down item starts fully charged, everything else at 0. How: This uses the picker's threshold for ease-down, otherwise 0.
			weight   : 1                                                                    // What: Weight. Why: Every item starts at the baseline weight. How: This is 1.


		});

		requestAnimationFrame( () => requestAnimationFrame( () => { // What: Scroll Into View Call. Why: The just-opened creation slot can be well out of view at the bottom of a long pool. How: This waits two animation frames for layout to settle, then scrolls the shared .main container just enough to bring the slot fully into view.


			const addWraEle = addWraRef.current;                         // What: Add Wrap Element. Why: The scroll calculation needs the actual DOM node, not just the ref object. How: This reads addWraRef.current once and reuses it below.
			const scrConEle = addWraEle && addWraEle.closest( '.main' ); // What: Scroll Container Element. Why: The shared scrollable container is what actually needs to move, not the slot itself. How: This walks up from addWraEle to the nearest .main ancestor.


			if ( !addWraEle || !scrConEle ) return; // What: Missing Element Guard. Why: Either element may not exist yet if this fires after an unrelated unmount. How: This bails out of the scroll calculation entirely when either is missing.



			const oveBelNum = addWraEle.getBoundingClientRect().bottom - scrConEle.getBoundingClientRect().bottom + 96; // What: Overflow Below Number. Why: This is how far below the visible fold the new slot actually sits, plus a small comfort margin. How: This subtracts the container's own bottom edge from the slot's own bottom edge.


			if ( oveBelNum > 0 ) scrConEle.scrollTo({ // What: Scroll Adjust Guard. Why: Only an actually-overflowing slot needs to be scrolled into view at all. How: This scrolls the container down by exactly the overflow amount.


				behavior : redMotFun() ? 'auto' : 'smooth', // What: Behavior. Why: A user who prefers reduced motion gets an instant jump instead of a glide. How: This picks 'auto' under reduced motion, otherwise 'smooth'.
				top      : scrConEle.scrollTop + oveBelNum  // What: Top. Why: The page scrolls just enough to reveal the editor's bottom edge. How: This adds oveBelNum to the current scroll.


			});


		}) );


	};


	const [ ediIteStr, setEdiIteStr ] = React.useState( null );  // What: Editing Item String And Setter. Why: An existing pool item's own edit slot reuses the exact same below-the-list interface as "+ Add Item", just populated from a real item and wired to the REAL actions instead of a draft. How: This holds the id of whichever existing item currently has its editor open, or null.
	const [ ediCloBoo, setEdiCloBoo ] = React.useState( false ); // What: Editing Closing Boolean And Setter. Why: Closing an existing item's editor needs its own out-animation before it's actually torn down. How: This is flipped true to start that animation and consumed by the editor's own onAnimationEnd handler below.
	const [ ediNamStr, setEdiNamStr ] = React.useState( '' );    // What: Editing Name String And Setter. Why: The name input inside the existing-item editor needs its own live-typed value. How: This is seeded from the item's own name in opeEdiFun and written to the store on blur.


	React.useEffect( () => { // What: Deleted-Under-Editor Effect. Why: An item can be deleted out from under its own open editor (the row's own trash icon stays reachable while editing, see the render's own null-guard below), and that guard alone only stops THIS render from crashing; without also clearing ediIteStr here, it would stay set forever, permanently tripping staEdiFun's own "one editor at a time" guard against ever opening another. How: This watches for the currently-edited item vanishing from staAppObj.items and clears both ediIteStr and ediCloBoo the moment it does.


		if ( ediIteStr && !staAppObj.items.some( ( iteCurObj ) => iteCurObj.id === ediIteStr ) ) { // What: Vanished Item Guard. Why: Only an item that's genuinely gone needs this cleanup. How: This checks whether ediIteStr still resolves to a real item in staAppObj.items.


			setEdiIteStr( null ); // What: Clear Editing Call. Why: There's nothing left to edit once the item itself is gone. How: This resets ediIteStr to null.

			setEdiCloBoo( false ); // What: Clear Closing Call. Why: A stale closing flag must not linger for whatever opens next. How: This resets ediCloBoo to false.


		}


	}, [ ediIteStr, staAppObj.items ] ); // What: Effect Dependency Array. Why: This must re-check whenever either the edited id or the items list itself changes. How: ediIteStr identifies which item to check for, and staAppObj.items is what's actually checked against.


	const opeEdiFun = ( tarIdeStr ) => { // What: Open Edit Function. Why: Opening an existing item's editor needs to snapshot it first (for staEdiFun's own revert-on-switch below) and seed the local name input. How: This looks up the item, bails out if it's already gone, then opens the editor and scrolls it into view.


		const fouIteObj = staAppObj.items.find( ( iteCurObj ) => iteCurObj.id === tarIdeStr ); // What: Found Item Object. Why: The editor needs the real, current item record to open against. How: This looks up tarIdeStr in staAppObj.items.


		if ( !fouIteObj ) return; // What: Missing Item Guard. Why: A stale id (already deleted) must not open an editor with nothing to show. How: This bails out before touching any state.



		ediSnaRef.current = { ...fouIteObj }; // What: Snapshot Write. Why: staEdiFun needs a snapshot of this exact item, taken right now, in case it later has to revert this edit to switch to a different one. How: This shallow-copies fouIteObj into ediSnaRef.

		setEdiIteStr( tarIdeStr ); // What: Open Editor Call. Why: This is the actual state change that shows the editor. How: This writes tarIdeStr into ediIteStr.

		setEdiNamStr( fouIteObj.name ); // What: Seed Name Call. Why: The name input needs its own starting value. How: This writes the found item's own current name into ediNamStr.

		requestAnimationFrame( () => requestAnimationFrame( () => { // What: Scroll Into View Call. Why: This is the same below-the-list reveal as addIteFun's own, since the editor renders in the same slot, which can be well out of view from wherever in a long pool the Edit button that opened it was. How: This waits two animation frames for layout to settle, then scrolls the shared .main container just enough to bring the slot fully into view.


			const addWraEle = addWraRef.current;                         // What: Add Wrap Element. Why: The scroll calculation needs the actual DOM node, not just the ref object. How: This reads addWraRef.current once and reuses it below.
			const scrConEle = addWraEle && addWraEle.closest( '.main' ); // What: Scroll Container Element. Why: The shared scrollable container is what actually needs to move, not the slot itself. How: This walks up from addWraEle to the nearest .main ancestor.


			if ( !addWraEle || !scrConEle ) return; // What: Missing Element Guard. Why: Either element may not exist yet if this fires after an unrelated unmount. How: This bails out of the scroll calculation entirely when either is missing.



			const oveBelNum = addWraEle.getBoundingClientRect().bottom - scrConEle.getBoundingClientRect().bottom + 96; // What: Overflow Below Number. Why: This is how far below the visible fold the slot actually sits, plus a small comfort margin. How: This subtracts the container's own bottom edge from the slot's own bottom edge.


			if ( oveBelNum > 0 ) scrConEle.scrollTo({ // What: Scroll Adjust Guard. Why: Only an actually-overflowing slot needs to be scrolled into view at all. How: This scrolls the container down by exactly the overflow amount.


				behavior : redMotFun() ? 'auto' : 'smooth', // What: Behavior. Why: A user who prefers reduced motion gets an instant jump instead of a glide. How: This picks 'auto' under reduced motion, otherwise 'smooth'.
				top      : scrConEle.scrollTop + oveBelNum  // What: Top. Why: The page scrolls just enough to reveal the editor's bottom edge. How: This adds oveBelNum to the current scroll.


			});


		}) );


	};


	const staEdiFun = ( tarIdeStr ) => { // What: Start Edit Function. Why: Switching straight from one open editor to another (or from the new-item draft) needs to close whatever's currently open first, reverting it, before this edit can actually open. How: This closes an existing editor (with an explicit revert) or the new-item draft, staging tarIdeStr to reopen once that closing animation finishes; otherwise it opens directly.


		if ( ediIteStr === tarIdeStr ) return; // What: Already Open Guard. Why: Re-clicking Edit on the exact same row that's already open should do nothing. How: This bails out when tarIdeStr matches the currently-open editor.



		if ( ediIteStr ) { // What: Other Editor Open Branch. Why: Another item's editor is already open and must be closed (with its own explicit revert, see ediSnaRef's own comment above) before this one can open. How: This reverts the currently-open item, stages tarIdeStr, and starts that editor's own closing animation.


			if ( ediSnaRef.current ) actStoObj.revIteFun( ediIteStr, ediSnaRef.current ); // What: Revert Call Guard. Why: Only a genuine snapshot can be reverted to. How: This restores the currently-open item back to its pre-edit snapshot.



			penEdiRef.current = tarIdeStr; // What: Stage Reopen Call. Why: The requested edit must still open once the current one finishes closing. How: This stores tarIdeStr for the closing editor's own onAnimationEnd handler to pick up.

			setEdiCloBoo( true ); // What: Start Closing Call. Why: This is what actually plays the current editor's own out-animation. How: This flips ediCloBoo, consumed by the editor's own onAnimationEnd handler below.



			return; // What: Early Return. Why: The requested edit must wait for the closing animation, not open immediately. How: This exits staEdiFun without calling opeEdiFun yet.


		}



		if ( newDraObj ) { // What: New Draft Open Branch. Why: A new-item draft is in progress and must be closed (without saving) instead of silently no-oping, since the reverse never needs this: the "+ Add Item" button that starts a new draft isn't rendered while an existing item's edit form is open. How: This stages tarIdeStr and starts the draft's own closing animation.


			penEdiRef.current = tarIdeStr; // What: Stage Reopen Call. Why: The requested edit must still open once the draft finishes closing. How: This stores tarIdeStr for the draft wrap's own onAnimationEnd handler to pick up.

			setNewCloStr( 'cancel' ); // What: Cancel Draft Call. Why: Switching away from an in-progress new-item draft discards it rather than silently saving it. How: This starts the draft wrap's own closing animation in its 'cancel' shape.



			return; // What: Early Return. Why: The requested edit must wait for the closing animation, not open immediately. How: This exits staEdiFun without calling opeEdiFun yet.


		}



		opeEdiFun( tarIdeStr ); // What: Direct Open Call. Why: Neither another editor nor a draft was in the way, so the requested edit can open immediately. How: This calls opeEdiFun with the same tarIdeStr.


	};


	const picIteArr = staAppObj.items.filter( ( iteCurObj ) => iteCurObj.pickerId === picDatObj.id ); // What: Picker Item Array. Why: The pool list only ever shows items that actually belong to this picker. How: This filters staAppObj.items down to those whose pickerId matches picDatObj.id.
	const eliIteArr = picIteArr.filter( ( iteCurObj ) => !iteCurObj.vacation );                       // What: Eligible Item Array. Why: An inactive (vacationing) item still counts toward the pool but never toward what's actually pickable. How: This filters picIteArr down to those not flagged vacation.


	const todIdeSet = React.useMemo( // What: Today Identifier Set. Why: Item ids already on Today are used to disable per-item Send and to keep the "Pick One" spin from landing on a duplicate. How: This is memoized off state.today.entries, recomputed only when the entries themselves change.

		() => new Set( ( staAppObj.today.entries || [] ).filter( ( entCurObj ) => entCurObj.itemId ).map( ( entCurObj ) => entCurObj.itemId ) ), // What: Today Ids Build. Why: Only entries actually tied to an item (not a reminder or conditional row) belong in this set. How: This filters to entries with an itemId, then maps to just that id.

		[ staAppObj.today.entries ] // What: Effect Dependency Array. Why: The set only needs recomputing when today's own entries list changes. How: state.today.entries is the sole source this memo reads.

	);


	const modInfObj = SED_NAM_OBJ.MOD_DEF_OBJ[ picDatObj.mode ]; // What: Mode Info Object. Why: The header, hint text, and stage all need this picker's own mode's label/hint. How: This looks up picDatObj.mode in the shared SED_NAM_OBJ.MOD_DEF_OBJ table.

	const [ ediOpeBoo, setEdiOpeBoo ] = React.useState( false ); // What: Editing Open Boolean And Setter. Why: Editing this picker's own Details reuses PicForCom's Details step, pre-filled from its current settings, in place of the normal run/pool view. How: This is NOT an early return: every hook above still needs to run every render regardless of ediOpeBoo, so the branch only happens at the very end, where this component actually returns its JSX.


	const ediGroArr = React.useMemo( () => { // What: Edit Existing Groups Array. Why: This is the same distinct-groups memo TabPicCom itself computes, duplicated here rather than threaded down as a prop, since it's only needed while this one picker's own edit form is open. How: This walks staAppObj.pickers collecting each visible picker's own group name once, then alphabetizes them.


		const seeGroArr = []; // What: Seen Group Array. Why: The loop below needs an accumulator to collect each distinct group name into. How: This starts empty and is pushed to by the loop.


		for ( const curPicObj of staAppObj.pickers ) { // What: Collect Groups Loop. Why: Every visible picker's own group name (if it has one, and isn't already collected) belongs in the result. How: This walks staAppObj.pickers, pushing each new group name onto seeGroArr.


			const hasGroBoo = Boolean( curPicObj.group );             // What: Has Group Boolean. Why: A picker with no group adds nothing to the list. How: This coerces curPicObj.group to a boolean.
			const notHidBoo = !curPicObj.hidden;                      // What: Not Hidden Boolean. Why: A hidden picker's group shouldn't surface. How: This negates curPicObj.hidden.
			const unsGroBoo = !seeGroArr.includes( curPicObj.group ); // What: Unseen Group Boolean. Why: Each group name is collected once. How: This checks seeGroArr doesn't hold it yet.

			const addGroBoo = hasGroBoo && notHidBoo && unsGroBoo; // What: Add Group Boolean. Why: Only a real, visible, not-yet-collected group is added. How: This ANDs the 3 checks above.


			if ( addGroBoo ) seeGroArr.push( curPicObj.group ); // What: Group Push Guard. Why: This is the actual collection step. How: This pushes the group name when addGroBoo is true.


		}



		return seeGroArr.sort( ( groOneStr, groTwoStr ) => groOneStr.localeCompare( groTwoStr ) ); // What: Sorted Groups Return. Why: The group chips should read in a stable, predictable order. How: This returns seeGroArr sorted alphabetically.


	}, [ staAppObj.pickers ] ); // What: Effect Dependency Array. Why: The group list only needs recomputing when the pickers list itself changes. How: staAppObj.pickers is what the loop above actually reads.


	const ediIniObj = { // What: Edit Initial Object. Why: PicForCom's own edit mode needs every one of this picker's current settings prefilled, so Save can round-trip them through savEdiFun unchanged unless the user actually edits a field. How: This maps every relevant picker field onto the same shape PicForCom's own initial prop expects. // What: Deliberately Omitted Group Field. Why: `group` specifically means "prefill the inline ADD-A-NEW-GROUP sub-form" (see PicForCom's own addGroBoo/newGroStr state), which would be wrong here: this picker's group already exists (it's necessarily in ediGroArr, since that list is derived from staAppObj.pickers including this picker itself), so it should land on that EXISTING pill instead. How: initialGroup (passed at the return below) is the prop that does that, same as the create flow's own group-filter prefill.


		anchorDay       : picDatObj.anchorDay,                                                                 // What: Anchor Day. Why: A yearly date-mode picker prefills its day. How: This copies picDatObj.anchorDay.
		anchorDom       : picDatObj.anchorDom,                                                                 // What: Anchor Day Of Month. Why: A monthly date-mode picker prefills its day of the month. How: This copies picDatObj.anchorDom.
		anchorDow       : picDatObj.anchorDow,                                                                 // What: Anchor Day Of Week. Why: A weekly picker prefills its weekday. How: This copies picDatObj.anchorDow.
		anchorMonth     : picDatObj.anchorMonth,                                                               // What: Anchor Month. Why: A yearly picker prefills its month. How: This copies picDatObj.anchorMonth.
		avoidDuplicates : picDatObj.avoidDuplicates,                                                           // What: Avoid Duplicates. Why: The toggle prefills to the picker's current setting. How: This copies picDatObj.avoidDuplicates.
		cadence         : picDatObj.cadence,                                                                   // What: Cadence. Why: The cadence control prefills to the picker's current cadence. How: This copies picDatObj.cadence.
		conditionalId   : picDatObj.conditionalId || null,                                                     // What: Conditional Id. Why: The attach toggle and rail prefill to the attached conditional. How: This copies picDatObj.conditionalId, or null.
		dateMode        : picDatObj.dateMode,                                                                  // What: Date Mode. Why: A monthly/yearly picker prefills whether it anchors to a date or an nth weekday. How: This copies picDatObj.dateMode.
		daysOfWeek      : picDatObj.daysOfWeek,                                                                // What: Days Of Week. Why: The weekday picker prefills to the picker's run days. How: This copies picDatObj.daysOfWeek.
		includeInDaily  : ( ( staAppObj.daily && staAppObj.daily.pickerIds ) || [] ).includes( picDatObj.id ), // What: Include In Daily. Why: The daily switch prefills to the picker's real membership, which lives outside the picker record. How: This checks the daily generator's own id list.
		mode            : picDatObj.mode,                                                                      // What: Mode. Why: The mode picker prefills to the picker's current mode. How: This copies picDatObj.mode.
		name            : picDatObj.name,                                                                      // What: Name. Why: The name field prefills to the picker's current name. How: This copies picDatObj.name.
		nthOrdinal      : picDatObj.nthOrdinal,                                                                // What: Nth Ordinal. Why: An nth-weekday picker prefills its ordinal. How: This copies picDatObj.nthOrdinal.
		nthWeekday      : picDatObj.nthWeekday,                                                                // What: Nth Weekday. Why: An nth-weekday picker prefills its weekday. How: This copies picDatObj.nthWeekday.
		skipHolidays    : picDatObj.skipHolidays                                                               // What: Skip Holidays. Why: The holiday toggle prefills to the picker's current setting. How: This copies picDatObj.skipHolidays.


	};


	const runPicFun = () => { // What: Run Pick Function. Why: The Pick One button needs to execute a real, forced-new pick against the engine and stage its result for the cycle animation. How: This calls PIC_NAM_OBJ.picIteFun with forceNew and the current Today-excluded ids, then either shows the empty state or starts the running cycle.


		if ( busPicBoo ) return; // What: Already Busy Guard. Why: A second pick must not start while one is already running. How: This bails out entirely while busPicBoo is true.



		const iteSnaArr = staAppObj.items;                                                                            // What: Item Snapshot Array. Why: The pick engine needs a stable snapshot of items to compute against. How: This is just staAppObj.items, captured under a clearer local name for the call below.
		const runResObj = PIC_NAM_OBJ.picIteFun( picDatObj, iteSnaArr, { forceNew : true, excludeIds : todIdeSet } ); // What: Run Result Object. Why: This is the actual computed outcome the rest of this function and the stage below render from. How: This calls the shared picking engine with this picker's own current pool. // What: Force New Note. Why: This button is a manual "pick/roll again" action, so for ease-down it should offer a real choice, not just re-confirm whatever item is already active; abandoning it recharges it, same as re-roll. How: forceNew is passed through to PIC_NAM_OBJ.picIteFun below.


		if ( !runResObj.picObj ) { // What: Nothing Picked Guard. Why: An exhausted or empty pool has nothing left to cycle through. How: This stores the empty result and switches straight to the 'empty' stage, skipping the cycle animation entirely.


			setPicResObj( runResObj ); // What: Result Store Call. Why: The stage needs the empty result to show its own message. How: This writes runResObj into picResObj.
			setRunPhaStr( 'empty' );   // What: Empty Phase Call. Why: The stage switches to its nothing-to-pick state. How: This writes 'empty' into runPhaStr.



			return; // What: Early Return. Why: There is nothing to cycle through. How: This skips the running-phase setup below.


		}



		setPicResObj( runResObj ); // What: Result Store Call. Why: The stage and Send/Re-roll buttons both need this exact outcome once the cycle settles. How: This writes runResObj into picResObj.

		setBusPicBoo( true ); // What: Busy Start Call. Why: The button must disable itself and show a busy label while the cycle plays. How: This flips busPicBoo true.

		setRunPhaStr( 'running' ); // What: Running Phase Call. Why: The stage must switch to rendering PicStrCom's own cycle animation. How: This writes 'running' into runPhaStr.


	};


	const onAniDonFun = () => { // What: On Animation Done Function. Why: PicStrCom calls this once its own cycle settles on the decided pick. How: This clears busPicBoo and advances runPhaStr to 'done'. // What: Preview-Only Note. Why: The spin itself is a PREVIEW; it does NOT mutate item state. How: The chosen pick's value/weight changes are staged and applied only when the resulting Today entry is marked done, see senTodFun below and store.js's own addEntFun pending mechanism.


		setBusPicBoo( false ); // What: Busy Clear Call. Why: The button no longer needs to show a busy state once the cycle has settled. How: This flips busPicBoo false.

		setRunPhaStr( 'done' ); // What: Done Phase Call. Why: The stage must switch to showing the settled pick alongside the Send/Re-roll/Done buttons. How: This writes 'done' into runPhaStr.


	};


	const seeRedRef = React.useRef( touBusObj.redNonNum ); // What: Seen Redo Nonce Reference. Why: Whenever the Pickers page tour's own onBacTouFun bumps touBusObj.redNonNum (Back from its "Picker Items" step to "Add to Todo List"), a fresh 'done' result must be synthesized directly instead of going through runPicFun's own animated 'running' phase, since Step 8's own target (.pv-act--send) needs runPhaStr to genuinely be 'done'/'sent', and by the time this fires the earlier real pick has already run its full course and reverted; skipping the spin is deliberate, this is a revisit. How: Unlike touBusObj.resNonNum above, a plain truthiness guard isn't enough here, since this bus value outlives any one PicVieCom instance (it's a module-level singleton, not component state); tracking the last-seen value (initialized to whatever's already on the bus at mount) makes this only fire on a genuine increment that happens while mounted.


	React.useEffect( () => { // What: Tour Redo Effect. Why: Going Back to the tour's Add to Todo List step needs a fresh settled pick to point at. How: This synthesizes a new 'done' pick whenever pickerTourRedoNonce genuinely changes.


		if ( touBusObj.redNonNum === seeRedRef.current ) return; // What: No Change Guard. Why: Only a genuine increment counts as a new bump. How: This bails out when the current bus value still matches what was last seen.



		seeRedRef.current = touBusObj.redNonNum; // What: Seen Value Update. Why: The next run of this effect needs to compare against the value that's current now. How: This overwrites seeRedRef with the newly-seen nonce.



		if ( !touBusObj.redNonNum ) return; // What: Falsy Bus Value Guard. Why: A fresh mount that happens to see an unset/0 starting value must not synthesize a bogus result. How: This bails out unless the nonce is genuinely truthy.



		const runResObj = PIC_NAM_OBJ.picIteFun( picDatObj, staAppObj.items, { forceNew : true, excludeIds : todIdeSet } ); // What: Run Result Object. Why: The revisited step still needs a real, current pick result to show. How: This calls the shared picking engine exactly like runPicFun does.


		if ( !runResObj.picObj ) { // What: Nothing Picked Guard. Why: An exhausted or empty pool still has nothing to synthesize a 'done' result from. How: This stores the empty result and switches to the 'empty' stage instead.


			setPicResObj( runResObj ); // What: Result Store Call. Why: The stage needs the empty result to show its own message. How: This writes runResObj into picResObj.
			setRunPhaStr( 'empty' );   // What: Empty Phase Call. Why: The stage switches to its nothing-to-pick state. How: This writes 'empty' into runPhaStr.



			return; // What: Early Return. Why: There is nothing to cycle through. How: This skips the running-phase setup below.


		}



		setPicResObj( runResObj ); // What: Result Store Call. Why: The stage needs this exact synthesized outcome to render the revisited 'done' state from. How: This writes runResObj into picResObj.

		setBusPicBoo( false ); // What: Busy Clear Call. Why: This is a synthesized revisit, not a real spin, so nothing should ever appear busy. How: This keeps busPicBoo false.

		setRunPhaStr( 'done' ); // What: Done Phase Call. Why: Step 8's own target needs runPhaStr to genuinely be 'done'. How: This writes 'done' into runPhaStr directly, skipping 'running' entirely.


		// eslint-disable-next-line react-hooks/exhaustive-deps -- What: Deliberate Dependency Omission. Why: The redo pick must run only on a genuine nonce bump, so the values it reads fresh stay out of the array. How: This silences the react-hooks exhaustive-deps warning for the dependency array below.
	}, [ touBusObj.redNonNum ] ); // What: Effect Dependency Array. Why: Only a genuine change to this exact bus value should re-run this synthesis. How: touBusObj.redNonNum is the sole trigger; deliberately excluded from a broader deps list since picker/staAppObj.items/todIdeSet are read fresh from the closure each time it fires.


	const rerActFun = () => { // What: Reroll Action Function. Why: Re-roll needs to reset back to idle and then immediately kick off a fresh pick. How: This clears the phase and result, then schedules runPicFun on the next tick.


		setRunPhaStr( 'idle' ); // What: Idle Reset Call. Why: The stage must briefly show its idle state before the next pick starts. How: This writes 'idle' into runPhaStr.

		setPicResObj( null ); // What: Result Clear Call. Why: The previous outcome must not linger while a new pick is about to run. How: This clears picResObj.

		setTimeout( runPicFun, 50 ); // What: Delayed Repick Call. Why: A brief pause reads more naturally than an instant re-spin. How: This calls runPicFun again 50ms later.


	};


	const senTodFun = () => { // What: Send Today Function. Why: Committing the settled pick's staged mutation only happens once the user actually confirms it, and this is deliberately skipped when the Pickers page tour is intercepting this exact step. How: This applies the pending update via actions.addEntFun (unless intSenBoo), then plays the Sent! confirmation before resetting back to idle.


		const notDonBoo = runPhaStr !== 'done'; // What: Not Done Boolean. Why: A pick can only be sent once its cycle has settled. How: This checks runPhaStr isn't 'done'.
		const notResBoo = !picResObj;           // What: Not Result Boolean. Why: There must be a stored pick result. How: This negates picResObj.
		const notPicBoo = !picResObj.picObj;    // What: Not Picked Boolean. Why: The result must hold a real picked item. How: This negates picResObj.picObj.

		const notReaBoo = notDonBoo || notResBoo || notPicBoo; // What: Not Ready Boolean. Why: Any one missing piece means there's nothing to send. How: This ORs the 3 checks above.


		if ( notReaBoo ) return; // What: Not Ready Guard. Why: There is nothing to send unless the cycle has actually settled on a real pick. How: This bails out unless runPhaStr is 'done' and picResObj holds a real outcome.



		if ( !intSenBoo ) actStoObj.addEntFun( picDatObj.id, picResObj.picObj.id, { // What: Real Commit Guard. Why: The Pickers page tour's own "Add to Todo List" step wants the Sent! animation to play without a real entry landing on Today, see intSenBoo's own comment above. How: This skips the real store commit only during that exact tour step, otherwise landing the settled pick as a real Today entry.


			bumpPick    : true,                // What: Bump Pick. Why: A run from this view counts as a pick. How: This is always true here.
			depletedEnd : picResObj.depBoo,    // What: Depleted End. Why: An ease-down pick can empty the pool. How: This passes picResObj.depBoo.
			pickedId    : picResObj.picObj.id, // What: Picked Id. Why: The entry records which item was chosen. How: This passes the picked item's id.
			pickerPatch : picResObj.patObj,    // What: Picker Patch. Why: Some modes also stage picker-level changes. How: This passes picResObj.patObj.
			updates     : picResObj.updArr     // What: Updates. Why: The pick's item mutations are staged, not applied yet. How: This passes picResObj.updArr.


		} );



		setRunPhaStr( 'sent' ); // What: Sent Phase Call. Why: The stage and button both need to show their own "sent" confirmation state. How: This writes 'sent' into runPhaStr. // What: Confirmation Beat Note. Why: The stage swaps to an "Added to Today" checkmark and the button morphs to "Sent!", then the picker resets to idle so it's ready for the next pick. How: setRunPhaStr('sent') below drives that swap; the timeout resets everything 1500ms later.

		setTimeout( () => { // What: Delayed Reset Call. Why: The confirmation must not linger forever before the view is ready for another pick. How: This resets both runPhaStr and picResObj 1500ms later.


			setRunPhaStr( 'idle' ); // What: Idle Phase Call. Why: The stage returns to its starting state. How: This writes 'idle' into runPhaStr.
			setPicResObj( null );   // What: Result Clear Call. Why: The previous pick no longer applies. How: This resets picResObj to null.


		}, 1500 );


	};


	if ( ediOpeBoo ) { // What: Edit Form Render Guard. Why: While editing this picker's own Details, the normal run/pool view must be replaced entirely by PicForCom's own edit form. How: This returns PicForCom directly, pre-filled from ediIniObj, before the normal JSX below is ever reached.


		return (


			<PicForCom
				isaEdiBoo
				conObjArr={ staAppObj.conditionals || [] }
				exiGroArr={ ediGroArr }
				iniForObj={ ediIniObj }
				iniGroStr={ picDatObj.group }
				onCanForFun={ () => setEdiOpeBoo( false ) }
				onSavEdiFun={ ( payForObj ) => { // What: On Save Edit Handler. Why: Saving the edit form commits its fields and closes it. How: This calls savEdiFun, then closes the form.


					actStoObj.savEdiFun( picDatObj.id, payForObj ); // What: Save Edit Call. Why: This commits the edited Details fields to the picker. How: This calls savEdiFun with the picker's id and the form payload.
					setEdiOpeBoo( false );                          // What: Edit Close Call. Why: The edit form closes once saved. How: This resets ediOpeBoo to false.


				} }
			/> // What: Picker Form Component. Why: Editing reuses PicForCom's own Details step instead of a separate edit form. How: This is passed this picker's own current settings as ediIniObj, and routes Save through actions.savEdiFun.


		);


	}



	return (


		<div className='picker-view'>{ /* What: Picker View Div Element. Why: This is PicVieCom's own root, holding the header, the run stage/actions, and the pool. How: This wraps every piece of the selected picker's own live view. */ }


			<header className='picker-h'>{ /* What: Picker Header Element. Why: The picker's own name/mode and its Edit button both belong in one header row. How: This wraps the title block and the Edit button. */ }


				<div>{ /* What: Title Block Div Element. Why: The kicker, name, and mode pill read as one grouped title. How: This wraps those three pieces so the header's own flex layout can place the Edit button beside them. */ }


					<div className='kicker'>Picker</div>{ /* What: Kicker Div Element. Why: A small eyebrow label orients the reader before the picker's own name. How: This renders the literal word "Picker". */ }



					<h2 className='picker-title'>{ picDatObj.name }</h2>{ /* What: Title Heading Element. Why: The picker's own name is this view's main heading. How: This renders picker.name. */ }

					<PilTagCom tonValStr='mode'>{ modInfObj.labStr }</PilTagCom>{ /* What: Pill Tag Component. Why: The picker's own mode reads as a small status pill beside its name. How: This renders modInfObj.labStr inside the shared PilTagCom component. */ }


				</div>

				<ButBasCom
					className='picker-edit-btn'
					kinValStr='secondary'
					sizValStr='sm'
					icoNamStr='ediEle'
					onClick={ () => setEdiOpeBoo( true ) }
				>Edit</ButBasCom>{ /* What: Button Base Component. Why: The user needs a way to open PicForCom's own Details step against this exact picker. How: This flips ediOpeBoo true on click. */ }


			</header>

			{ Array.isArray( modInfObj.hinArr ) // What: Hint Content Check. Why: A mode's own hint can be one paragraph or several. How: This maps every paragraph when hint is an array, otherwise renders the single hint.


				? modInfObj.hinArr.map( ( parTexStr, parIndNum ) => ( // What: Multi-Paragraph Hint Render. Why: Some modes explain themselves across more than one short paragraph. How: This maps modInfObj.hinArr to one <p> per entry when it's an array.


					<p
						key={ parIndNum }
						className='picker-hint'
					>{ parTexStr }</p> // What: Hint Paragraph Element. Why: Each paragraph renders as its own hint line. How: This renders parTexStr, keyed by its index.


				) )

				: <p className='picker-hint'>{ modInfObj.hinArr }</p> // What: Single-Paragraph Hint Render. Why: Most modes only need one short explanation. How: This renders modInfObj.hinArr directly when it's a plain string.


			}

			<p className='picker-hint'>Please note that any items in this picker&rsquo;s pool that are already included in the Today tab will be excluded from being selected.</p>{ /* What: Exclusion Hint Paragraph Element. Why: The pool's own eligible count can otherwise look wrong to someone who doesn't know Today-listed items are excluded from picking. How: This renders a fixed explanatory sentence under every mode's own hint. */ }


			<div className='picker-run'>{ /* What: Run Div Element. Why: The stage and its action buttons form one visual unit. How: This wraps picker-stage and picker-actions together. */ }


				<div className='picker-stage'>{ /* What: Stage Div Element. Why: Exactly one of five states (idle/running-or-done/sent/empty) is showing at any moment. How: This wraps whichever of the branches below currently matches runPhaStr. */ }


					{ runPhaStr === 'idle' && ( // What: Idle Stage Check. Why: The idle state shows a simple eligible-count readout. How: This renders only while runPhaStr is 'idle'.


						<div className='stage-idle'>{ /* What: Idle Stage Div Element. Why: This groups the eligible count and its own label. How: This wraps stage-idle-num and stage-idle-lbl. */ }


							<div className='stage-idle-num'>{ eliIteArr.filter( ( iteCurObj ) => !todIdeSet.has( iteCurObj.id ) ).length }</div>{ /* What: Idle Number Div Element. Why: The user needs to see how many items are actually eligible right now. How: This counts eliIteArr minus whatever's already on Today. */ }

							<div className='stage-idle-lbl'>items in the pool</div>{ /* What: Idle Label Div Element. Why: The bare number above needs a caption. How: This renders the fixed literal text. */ }


						</div>


					) }

					{ ( runPhaStr === 'running' || runPhaStr === 'done' ) && picResObj && picResObj.picObj && ( // What: Running-Or-Done Stage Check. Why: The cycle animation itself spans both the running and just-settled done states. How: This renders PicStrCom only while a real pick result exists in either of those two phases.


						<PicStrCom
							canIteArr={ picResObj.cycArr }
							picIteObj={ picResObj.picObj }
							styKeyStr={ aniStyStr }
							onCycDonFun={ onAniDonFun }
						/> // What: Picker Strip Component. Why: This is the actual reel/spotlight/dissolve cycle animation. How: This is passed the computed cycle candidates and the settled pick, and calls onAniDonFun once it lands.


					) }

					{ runPhaStr === 'sent' && picResObj && picResObj.picObj && ( // What: Sent Stage Check. Why: A brief confirmation replaces the stage right after Send to Today commits. How: This renders only while runPhaStr is 'sent' and a real pick result still exists.


						<div className='stage-sent'>{ /* What: Sent Stage Div Element. Why: The checkmark, the sent item's own name, and its caption read as one confirmation block. How: This wraps those three pieces. */ }


							<div className='stage-sent-check'>{ /* What: Sent Check Div Element. Why: A checkmark icon needs its own small badge to sit in. How: This wraps a single IcoSvgCom. */ }


								<IcoSvgCom
									icoNamStr='cheEle'
									sizValNum={ 26 }
								/>{ /* What: Icon Svg Component. Why: A checkmark is the clearest possible confirmation glyph. How: This renders the shared check icon at a fixed size. */ }


							</div>

							<div className='stage-sent-name'>{ picResObj.picObj.name }</div>{ /* What: Sent Name Div Element. Why: The user should see exactly which item just landed on Today. How: This renders picResObj.picObj.name. */ }

							<div className='stage-idle-lbl'>Added to Today</div>{ /* What: Sent Label Div Element. Why: The confirmation needs a short caption. How: This renders the fixed literal text. */ }


						</div>


					) }

					{ runPhaStr === 'empty' && ( // What: Empty Stage Check. Why: A pool with nothing eligible needs its own explanatory state instead of a blank stage. How: This renders only while runPhaStr is 'empty'.


						<div className='stage-empty'>{ /* What: Empty Stage Div Element. Why: The placeholder number, its explanation, and (for Ease Down) a Refill button read as one block. How: This wraps those pieces. */ }


							<div className='stage-idle-num'>&mdash;</div>{ /* What: Empty Number Div Element. Why: A dash stands in for "nothing to count" in the same slot the idle count normally uses. How: This renders a literal em dash glyph, the documented display-character exception to the no-em-dash copy rule. */ }

							<div className='stage-idle-lbl'>{ /* What: Empty Label Div Element. Why: Each mode empties out for a different reason and needs its own explanation. How: This picks one of three fixed sentences based on picDatObj.mode. */ }


								{ picDatObj.mode === 'ease-up' // What: Ease Up Check. Why: An ease-up picker empties because nothing has drifted to eligibility yet. How: This picks the ease-up sentence when the mode matches.


									? 'Nothing eligible yet. Run again to drift items closer.'

									: picDatObj.mode === 'ease-down' // What: Ease Down Check. Why: An ease-down picker empties because everything is depleted. How: This picks the ease-down sentence when the mode matches.

									? 'Everything is depleted. Refill the picker to bring items back.'

									: 'No items in this picker.' // What: Empty Pool Branch. Why: Every other mode only empties when it has no items at all. How: This renders a fixed sentence.


								}


							</div>

							{ picDatObj.mode === 'ease-down' && ( // What: Refill Button Check. Why: Only Ease Down can ever be depleted in a way a Refill actually fixes. How: This renders the Refill button only for that mode.


								<ButBasCom
									kinValStr='primary'
									sizValStr='sm'
									icoNamStr='refEle'
									onClick={ () => actStoObj.filPicFun( picDatObj.id ) }
								>Refill</ButBasCom> // What: Button Base Component. Why: The user needs a direct way to bring every item back to full charge. How: This calls actions.filPicFun with this picker's own id.


							) }


						</div>


					) }


				</div>

				<div className='picker-actions'>{ /* What: Actions Div Element. Why: Exactly one action row (the done/sent trio, or the single Pick One button) shows at a time. How: This wraps whichever branch below currently matches runPhaStr. */ }


					{ ( runPhaStr === 'done' || runPhaStr === 'sent' ) ? ( // What: Done-Or-Sent Actions Check. Why: Send to Today, Re-Roll, and Done only make sense once a pick has actually settled. How: This renders that trio while runPhaStr is 'done' or 'sent', otherwise the single Pick One button below.


						<React.Fragment>{ /* What: Done-Or-Sent Fragment Element. Why: Send to Today, Re-Roll, and Done are true siblings with no shared wrapper of their own. How: This groups all 3 buttons without adding an extra DOM node. */ }


							<ButBasCom
								className={ ` pv-act   pv-act--send   ${ runPhaStr === 'sent' ? 'is-sent' : '' } ` }
								style={{ animationDelay : '0ms' }}
								kinValStr='primary'
								icoNamStr='cheEle'
								onClick={ senTodFun }
							>{ /* What: Button Base Component. Why: This is the primary confirm action for a settled pick. How: This calls senTodFun, then re-labels itself "Sent!" once runPhaStr flips to 'sent'. */ }


								<span
									key={ runPhaStr === 'sent' ? 'sent' : 'send' }
									className='pv-send-label set-sub-fade'
								>{ /* What: Send Label Span Element. Why: The label itself needs to cross-fade between its two states. How: This is re-keyed by runPhaStr so React replays the fade on every change. */ }


									{ runPhaStr === 'sent' ? 'Sent!' : 'Send to Today' }{ /* What: Send Label Expression. Why: The label confirms the send once it happens. How: This reads 'Sent!' while runPhaStr is 'sent', otherwise 'Send to Today'. */ }


								</span>


							</ButBasCom>

							<ButBasCom
								className={ ` pv-act   pv-act--reroll   ${ ( butLeaBoo || runPhaStr === 'sent' ) ? 'is-leaving' : '' }   ${ intSenBoo ? 'is-tour-disabled' : '' } ` }
								style={{ animationDelay : '60ms' }}
								kinValStr='ghost'
								icoNamStr='refEle'
								disabled={ intSenBoo }
								onClick={ () => aftExiFun( rerActFun ) }
							>Re-Roll</ButBasCom>{ /* What: Button Base Component. Why: The user needs a way to abandon this exact pick and get a fresh one, playing the shared exit animation first. How: This calls aftExiFun(rerActFun), disabled only during the page tour's own intercepted step. */ }{ /* What: Reroll Classname Design Note. Why: The pv-act--reroll class lets App Features' own manual-pick tour target this specific button (cptSelStr, see onboarding-app-features.jsx) without also matching Send to Today or Done. How: disabled/is-tour-disabled below still only ever check intSenBoo (the ORIGINAL Pickers page tour), unchanged; App Features leaves Re-Roll fully usable on purpose, see disDonBoo's own comment above. */ }

							<ButBasCom
								className={ ` pv-act   ${ ( butLeaBoo || runPhaStr === 'sent' ) ? 'is-leaving' : '' }   ${ disDonBoo ? 'is-tour-disabled' : '' } ` }
								style={{ animationDelay : '120ms' }}
								kinValStr='ghost'
								sizValStr='sm'
								disabled={ disDonBoo }
								onClick={ () => aftExiFun( () => { // What: On Click Handler. Why: Done plays the buttons' exit before clearing the pick. How: This runs aftExiFun with a reset of the phase and the result.


									setRunPhaStr( 'idle' ); // What: Idle Phase Call. Why: The stage returns to its starting state. How: This writes 'idle' into runPhaStr.
									setPicResObj( null );   // What: Result Clear Call. Why: The previous pick no longer applies. How: This resets picResObj to null.


								} ) }
							>Done</ButBasCom>{ /* What: Button Base Component. Why: The user needs a way to walk away from this pick without sending or re-rolling it, playing the shared exit animation first. How: This calls aftExiFun with a callback resetting straight back to idle. */ }


						</React.Fragment>


					) : ( // What: Pick One Branch. Why: Before a pick has settled, only the initial trigger belongs here. How: This renders the else branch, taken while runPhaStr is neither 'done' nor 'sent'.


						<ButBasCom
							className={ ` pv-act   pv-act--pick   ${ busPicBoo ? 'is-busy' : '' } ` }
							kinValStr='primary'
							icoNamStr='plaEle'
							disabled={ busPicBoo }
							onClick={ runPicFun }
						>{ busPicBoo ? 'Picking…' : 'Pick One' }</ButBasCom> // What: Button Base Component. Why: This is the sole entry point into a fresh cycle. How: This calls runPicFun, disabling and relabeling itself while busPicBoo is true.


					) }


				</div>


			</div>

			<div className='picker-pool'>{ /* What: Pool Div Element. Why: The item list and the add/edit slot below it form one visual section. How: This wraps pool-items and pv-additem-wrap. */ }


				<div className='pool-items'>{ /* What: Pool Items Div Element. Why: The pool's own header and its list of rows need one shared box the tour can highlight together. How: This wraps pool-h and pool-list. */ }{ /* What: Pool Items Wrap Design Note. Why: This wrapper is purely structural, letting the Pickers page tour highlight the header + item list as one combined box without also catching "+ Add Item" below (a step of its own, see .pv-additem-wrap further down). How: This mirrors .picker-pool's own flex/gap so wrapping these two doesn't change their spacing. */ }


					<div className='pool-h'>{ /* What: Pool Header Div Element. Why: The eligible-count kicker and the drift-toggle link sit on one row. How: This wraps those two pieces. */ }


						<span className='kicker'>Pool &middot; { eliIteArr.filter( ( iteCurObj ) => !todIdeSet.has( iteCurObj.id ) && PIC_NAM_OBJ.modEliFun( iteCurObj, picDatObj ) ).length } of { picIteArr.length } eligible</span>{ /* What: Kicker Span Element. Why: The user needs a quick sense of how many of the pool's own items are actually pickable right now. How: This renders both the mode-eligible-and-not-on-Today count and the pool's own total size. */ }

						{ ( picDatObj.mode !== 'random' && picDatObj.mode !== 'weighted' ) && ( // What: Drift Toggle Check. Why: Only a mode that actually tracks a drifting value has anything to show or hide here. How: This renders the Show/Hide drift link only for those modes.


							<button
								className='ghost-link'
								onClick={ () => setShoDriBoo( ( preValBoo ) => !preValBoo ) }
							>{ /* What: Drift Toggle Button Element. Why: The user needs a way to reveal or hide each row's own drift/readiness bar. How: This flips shoDriBoo on click. */ }


								<IcoSvgCom
									icoNamStr={ shoDriBoo ? 'eyoEle' : 'eyeEle' }
									sizValNum={ 13 }
								/>{ /* What: Icon Svg Component. Why: An eye/eye-off glyph reads faster than text alone for a show/hide toggle. How: This switches icon name based on shoDriBoo. */ }

								{ shoDriBoo ? 'Hide drift' : 'Show drift' }{ /* What: Drift Label Expression. Why: The toggle's text names what clicking it will do. How: This reads 'Hide drift' while shoDriBoo is on, otherwise 'Show drift'. */ }


							</button>


						) }


					</div>

					<div className='pool-list'>{ /* What: Pool List Div Element. Why: One row per pool item needs a shared list container. How: This maps picIteArr to one row per item below. */ }


						{ picIteArr.map( ( curIteObj ) => { // What: Pool Row List Render. Why: Every item in this picker's own pool needs its own row, computed fresh each render from its current readiness/eligibility. How: This maps picIteArr to one row per curIteObj, deriving each row's own tooltip text from its mode-specific meaning.


							const reaValNum = PIC_NAM_OBJ.reaValFun( curIteObj, picDatObj.mode, picDatObj.threshold ?? 100 ); // What: Readiness Value Number. Why: The drift bar (when shown) needs a normalized 0..1 progress value. How: This calls the shared readiness helper for this exact item/mode/threshold.
							const eliHerBoo = PIC_NAM_OBJ.modEliFun( curIteObj, picDatObj );                                  // What: Eligible Here Boolean. Why: The row needs to know whether this item is currently pickable under this picker's own mode rules. How: This calls the shared mode-eligibility helper.
							const weiValNum = curIteObj.weight;                                                               // What: Weight Value Number. Why: The tooltip text needs the item's own current weight. How: This is read directly off curIteObj.weight. // What: Weight Tooltip String. Why: The wN pill (itself fixed, it never drifts) benefits from a plain-language hover explanation of what the number means. How: This is computed from curIteObj's own weight below.


							const weiTipStr = weiValNum === 1 // What: Weight Tip String. Why: The weight pill's tooltip explains what this item's weight means. How: This picks the baseline sentence for w1, otherwise a multiplier sentence.
								? 'Weight 1, the baseline pick rate.'                                            // What: Baseline Weight Branch. Why: A w1 item is the reference point. How: This returns a fixed sentence.
								: `Weight ${ weiValNum }, ${ weiValNum }× as likely to be picked as a w1 item.`; // What: Multiplied Weight Branch. Why: A heavier item is picked proportionally more often. How: This names the weight as a multiple of w1.


							const thrValNum = picDatObj.threshold ?? 100; // What: Threshold Value Number. Why: Two of the three explanations below need to quote the picker's own threshold. How: This falls back to 100 when the picker has no explicit threshold set. // What: Value Tooltip String. Why: The drifting `value` shown beside wN changes run-to-run, and what it means depends entirely on the picker's own mode. How: This picks one of three explanations, or an empty string for modes with no such meaning.


							const valTipStr = picDatObj.mode === 'dynamic' // What: Value Tip String. Why: The value pill's tooltip explains what the drifting number means for this picker's mode. How: This picks one sentence per mode, empty for modes with no drifting value.
								? `Drift bonus, climbs by ${ weiValNum } (the item’s weight) every time it isn’t picked, and resets to 0 when it is.`                                                                       // What: Dynamic Value Branch. Why: A dynamic item's value is its drift bonus. How: This explains how the bonus climbs and resets.
								: picDatObj.mode === 'ease-up' // What: Ease Up Check. Why: Ease Up's value means progress toward eligibility. How: This checks the picker's mode.
								? `Progress toward eligibility, starts at 0 and rises by a random amount each run it isn’t picked. The item becomes pickable at ${ thrValNum }, then resets to 0.`                          // What: Ease Up Value Branch. Why: An ease-up item's value climbs toward the threshold. How: This explains how it rises and resets.
								: picDatObj.mode === 'ease-down' // What: Ease Down Check. Why: Ease Down's value means remaining charge. How: This checks the picker's mode.
								? `Remaining charge, starts at ${ thrValNum } and drops by a random amount each time it’s picked. At 0 it refills automatically and a new item is chosen; this one sits out the next pick.` // What: Ease Down Value Branch. Why: An ease-down item's value is its remaining charge. How: This explains how it drains and refills.
								: ''; // What: Empty Value Branch. Why: Random and Weighted have no drifting value at all. How: This returns an empty string.



							return (


								<div
									key={ curIteObj.id }
									className={ ` pool-row   ${ curIteObj.vacation ? 'is-vac' : '' }   ${ !eliHerBoo ? 'is-ineligible' : '' }   ${ insSavStr === curIteObj.id ? 'pool-row--insert' : '' }   ${ conDelStr === curIteObj.id ? 'pool-row--confirm' : '' }   ${ rmvIdeStr === curIteObj.id ? 'pool-row--removing' : '' } ` }
									onAnimationEnd={ ( aniEveObj ) => { // What: On Animation End Handler. Why: A saved row's slide-in and a deleted row's removal both finish on this row's own animation end. How: This clears the insert flag, and removes the item once its removal animation is done.


										if ( insSavStr === curIteObj.id ) setInsSavStr( null ); // What: Insert Clear Guard. Why: A just-saved row's slide-in plays only once. How: This clears insSavStr when its animation belongs to this row.



										if ( rmvIdeStr === curIteObj.id && aniEveObj.target === aniEveObj.currentTarget ) { // What: Removal Finished Guard. Why: The item leaves the store only after its own row finishes the removal animation. How: This checks the row is the one being removed and the event came from the row itself.


											actStoObj.delIteFun( curIteObj.id ); // What: Remove Item Call. Why: The row's removal animation has finished, so the store can drop it. How: This calls delIteFun with this row's id.
											setRmvIdeStr( null );                // What: Removing Clear Call. Why: The removal is finished. How: This resets rmvIdeStr to null.


										}


									} }
								>{ /* What: Row Div Element. Why: Every pool item needs one row, whichever of its own name/meta/actions or delete-confirm content currently applies. How: This carries every one of this row's own transient animation classes, and commits the real delete/removal once its own leaving keyframe finishes. */ }


									{ conDelStr === curIteObj.id ? ( // What: Delete Confirm Check. Why: A row pending delete confirmation replaces its own normal content entirely. How: This renders the confirm row while conDelStr matches this item, otherwise the row's real content below.


										<div className={ ` pool-confirm   ${ conLeaStr === curIteObj.id ? 'is-leaving' : '' } ` }>{ /* What: Confirm Div Element. Why: The delete question and its Cancel/Delete buttons form one block. How: This wraps pool-confirm-msg and pool-confirm-actions. */ }


											<span className='pool-confirm-msg'>Delete <strong>{ curIteObj.name }</strong>?</span>{ /* What: Confirm Message Span Element. Why: The user must see exactly which item they're about to delete. How: This renders curIteObj.name inside the fixed question text. */ }

											<div className='pool-confirm-actions'>{ /* What: Confirm Actions Div Element. Why: Cancel and Delete need to sit side by side. How: This wraps those two buttons. */ }


												<ButBasCom
													kinValStr='ghost'
													sizValStr='sm'
													onClick={ canConFun }
												>Cancel</ButBasCom>{ /* What: Button Base Component. Why: The user needs a clear way to back out of a delete they didn't mean to start. How: This calls canConFun. */ }

												<ButBasCom
													kinValStr='danger'
													sizValStr='sm'
													icoNamStr='traEle'
													onClick={ () => { // What: On Click Handler. Why: Confirming a delete starts the row's removal animation. How: This clears the confirm state and marks the row as removing.


														setConDelStr( null );         // What: Confirm Clear Call. Why: No row stays in its delete-confirm state. How: This resets conDelStr to null.
														setRmvIdeStr( curIteObj.id ); // What: Removing Set Call. Why: The row plays its removal animation before the item is dropped. How: This writes this row's id into rmvIdeStr.


													} }
												>Delete</ButBasCom>{ /* What: Button Base Component. Why: This is the actual confirmed delete action. How: This clears the confirm state and starts the row's own removal animation. */ }


											</div>


										</div>


									) : ( // What: Row Content Branch. Why: A row not pending delete confirmation shows its own normal name/meta/actions content instead. How: This renders the else branch, taken while conDelStr doesn't match this item.


										<React.Fragment>{ /* What: Row Content Fragment Element. Why: The name/meta block and the send/edit/delete actions below are true siblings with no shared wrapper of their own. How: This groups all of this row's own real content without adding an extra DOM node. */ }


											<div className='pool-name'>{ /* What: Name Div Element. Why: The item's own name and its status pills (inactive/not yet/spent) belong together. How: This wraps the name span and its conditional pills. */ }


												<span className='pool-item-name'>{ curIteObj.name }</span>{ /* What: Name Span Element. Why: Every row needs its own visible item name. How: This renders curIteObj.name. */ }

												{ curIteObj.vacation && <PilTagCom tonValStr='muted'>inactive</PilTagCom> }{ /* What: Inactive PilTagCom Check. Why: A vacationing item needs a clear status label. How: This renders the pill only while curIteObj.vacation is true. */ }

												{ !eliHerBoo && !curIteObj.vacation && <PilTagCom tonValStr='muted'>{ picDatObj.mode === 'ease-up' ? 'not yet' : 'spent' }</PilTagCom> }{ /* What: Ineligible PilTagCom Check. Why: An active-but-currently-ineligible item needs a status label distinct from "inactive". How: This renders only while eliHerBoo is false and curIteObj.vacation is also false, wording itself per mode. */ }


											</div>

											<div className='pool-meta'>{ /* What: Meta Div Element. Why: The optional drift bar and the optional weight pill sit side by side. How: This wraps both, each independently gated. */ }


												{ shoDriBoo && reaValNum != null && ( // What: Drift Bar Check. Why: The drift bar only makes sense once the toggle is on and this mode actually has a readiness value at all. How: This renders the InfTipCom-wrapped bar only when both conditions hold.


													<InfTipCom
														className='pool-prog'
														labTexStr={ valTipStr }
													>{ /* What: Info Tip Component. Why: The drift bar benefits from an on-demand explanation of what its value means. How: This shows valTipStr on hover or focus. */ }


														<ProBarCom
															curValNum={ reaValNum }
															maxValNum={ 1 }
															tonValStr={ picDatObj.mode === 'ease-down' ? 'warm' : 'accent' }
														/>{ /* What: Progress Bar Component. Why: A visual bar reads faster than the raw number alone. How: This renders reaValNum against a max of 1, tinted warm for Ease Down and accent otherwise. */ }

														<span className='pool-val'>{ Math.round( curIteObj.value ) }</span>{ /* What: Value Span Element. Why: The exact underlying number is still useful alongside the bar. How: This renders curIteObj.value, rounded. */ }


													</InfTipCom>


												) }

												{ ( picDatObj.mode === 'weighted' || picDatObj.mode === 'dynamic' ) && ( // What: Weight Pill Check. Why: Only these two modes treat weight as a real lever worth showing. How: This renders the weight pill only for those modes.


													<InfTipCom
														className='pool-weight'
														labTexStr={ weiTipStr }
													>w{ curIteObj.weight }</InfTipCom> // What: Info Tip Component. Why: The weight number benefits from the same hover explanation every other tooltip in this row gets. How: This renders "w" plus the raw weight, tipped with weiTipStr.


												) }


											</div>

											{ senIdeStr === curIteObj.id ? ( // What: Sent Row Check. Why: A row just sent via its own per-item button needs its own brief confirmation in place of the normal Send button. How: This renders the disabled checkmark button while senIdeStr matches this item.


												<button
													className='pool-send is-sent'
													type='button'
													disabled
													aria-label={ `${ curIteObj.name } sent to Today` }
													title='Sent to Today'
												>{ /* What: Sent Pool Button Element. Why: A brief, disabled confirmation reads clearer than the button just vanishing. How: This is disabled and shows a checkmark instead of the calendar glyph. */ }


													<IcoSvgCom
														icoNamStr='cheEle'
														sizValNum={ 15 }
													/>{ /* What: Icon Svg Component. Why: A sent row shows a checkmark instead of the send glyph. How: This renders the 'cheEle' icon at a fixed size. */ }


												</button>


											) : todIdeSet.has( curIteObj.id ) ? ( // What: Already On Today Check. Why: An item already sent to Today can't be sent again and needs an explained disabled state instead. How: This renders the disabled InfTipCom while todIdeSet has this item's own id, the real Send button otherwise.


												<InfTipCom
													className='pool-send is-disabled'
													labTexStr='This item is already included in the Today tab.'
												>{ /* What: Info Tip Component. Why: An item already on Today can't be sent again, and the user should know why the button is inert. How: This wraps the calendar glyph with an explanatory tooltip instead of a real button. */ }


													<IcoSvgCom
														icoNamStr='calEle'
														sizValNum={ 15 }
													/>{ /* What: Icon Svg Component. Why: The send action needs a recognizable "to Today" glyph. How: This renders the 'calEle' icon at a fixed size. */ }


												</InfTipCom>


											) : ( // What: Send Button Branch. Why: An item that's neither just-sent nor already on Today gets the real, working Send button. How: This renders the else branch, taken while neither prior condition holds.


												<button
													className={ ` pool-send   ${ higSenBoo ? 'ob-tour-pulse' : '' } ` }
													type='button'
													disabled={ disIteBoo }
													aria-label={ `Send ${ curIteObj.name } to Today` }
													title='Send to Today'
													onClick={ () => senIteFun( curIteObj.id ) }
												>{ /* What: Send Pool Button Element. Why: This is the actual per-item Send to Today action. How: This calls senIteFun with this row's own item id. */ }


													<IcoSvgCom
														icoNamStr='calEle'
														sizValNum={ 15 }
													/>{ /* What: Icon Svg Component. Why: The send action needs a recognizable "to Today" glyph. How: This renders the 'calEle' icon at a fixed size. */ }


												</button>


											) }

											<button
												className='pool-edit'
												type='button'
												disabled={ disEdiBoo }
												aria-label={ `Edit ${ curIteObj.name }` }
												title='Edit'
												onClick={ () => staEdiFun( curIteObj.id ) }
											>{ /* What: Edit Pool Button Element. Why: Every row needs a way to open its own item in the shared editor slot below. How: This calls staEdiFun with this row's own item id. */ }


												<IcoSvgCom
													icoNamStr='ediEle'
													sizValNum={ 15 }
												/>{ /* What: Icon Svg Component. Why: The edit action needs a recognizable pencil glyph. How: This renders the 'ediEle' icon at a fixed size. */ }


											</button>

											{ picIteArr.length <= 2 ? ( // What: Delete Guard Check. Why: A picker must always keep at least 2 items, so the last two rows can't offer a real delete button at all. How: This renders a disabled, explanatory InfTipCom instead of a working Delete button whenever the pool is at that floor.


												<InfTipCom
													className='pool-del is-disabled'
													actNamStr='Delete'
													labTexStr='Pickers require at least 2 items in their list, you need to add another item first or delete the entire picker instead.'
												>{ /* What: Info Tip Component. Why: The user should understand why Delete is unavailable rather than it just silently not working. How: This wraps the trash glyph with the explanatory tooltip above. */ }


													<IcoSvgCom
														icoNamStr='traEle'
														sizValNum={ 15 }
													/>{ /* What: Icon Svg Component. Why: The delete action needs a recognizable trash glyph. How: This renders the 'traEle' icon at a fixed size. */ }


												</InfTipCom>


											) : ( // What: Delete Button Branch. Why: With more than 2 items in the pool, a real working Delete button belongs here instead. How: This renders the else branch, taken while picIteArr.length is above 2.


												<button
													className='pool-del'
													type='button'
													disabled={ disEdiBoo }
													aria-label={ `Delete ${ curIteObj.name }` }
													onClick={ () => setConDelStr( curIteObj.id ) }
												>{ /* What: Delete Pool Button Element. Why: This starts this row's own delete-confirm flow. How: This writes curIteObj.id into conDelStr. */ }


													<IcoSvgCom
														icoNamStr='traEle'
														sizValNum={ 15 }
													/>{ /* What: Icon Svg Component. Why: The delete action needs a recognizable trash glyph. How: This renders the 'traEle' icon at a fixed size. */ }


												</button>


											) }


										</React.Fragment>


									) }


								</div>


							);


						}) }


					</div>


				</div>

				<div
					ref={ addWraRef }
					className='pv-additem-wrap'
				>{ /* What: Add Item Wrap Div Element. Why: The new-item form, the existing-item editor, and the plain "+ Add Item" button all share this one below-the-list slot. How: This wraps whichever of those three the IIFE below currently resolves to. */ }


					{ ( () => { // What: Additem Slot Render. Why: Exactly one of three things belongs in this slot at a time (an open existing-item editor, an open new-item draft editor, or the plain add button), and that choice is easier to express as a small function than as a nested ternary. How: This checks ediIteStr first, then newDraObj, falling back to the plain button.


						if ( ediIteStr ) { // What: Existing Item Editor Branch. Why: An existing item's own editor takes priority whenever one is open. How: This looks up the live item (not a snapshot, so EntEdiCom's own direct store calls stay reflected immediately) and renders its editor, or nothing if it vanished out from under itself.


							const ediLivObj = staAppObj.items.find( ( iteCurObj ) => iteCurObj.id === ediIteStr ); // What: Editing Live Object. Why: Weight/ease stepper clicks inside EntEdiCom call the REAL actions.updIteFun/setWeiFun directly, so this must be looked up live, not snapshotted, same as the pool row itself. How: This looks up ediIteStr fresh in staAppObj.items on every render.


							if ( !ediLivObj ) return null; // What: Vanished Item Guard. Why: The item may have been deleted via the row's own trash icon while this was open; that confirm flow already owns closing this out. How: This renders nothing rather than crashing against a missing item.



							return (


								<div
									className={ ` pv-newitem   rd-item   is-editing   ${ ediCloBoo ? 'is-closing' : '' } ` }
									onAnimationEnd={ ( aniEveObj ) => { // What: On Animation End Handler. Why: The item editor's own close animation must finish before its state clears. How: This clears the closing and open flags, then opens any editor requested meanwhile.


										if ( !ediCloBoo || aniEveObj.target !== aniEveObj.currentTarget ) return; // What: Not Closing Guard. Why: Only the editor's own closing animation should finish the close. How: This bails out unless ediCloBoo is set and the event came from this element.



										setEdiCloBoo( false ); // What: Closing Clear Call. Why: The close animation is over. How: This resets ediCloBoo to false.

										setEdiIteStr( null ); // What: Editor Clear Call. Why: No item's editor stays open. How: This resets ediIteStr to null.

										if ( penEdiRef.current ) { // What: Pending Editor Guard. Why: A different item's editor may have been requested while this one was closing. How: This opens it once this editor has finished closing.


											const tarIdeStr = penEdiRef.current; // What: Target Identifier String. Why: The pending editor request must be read before it's cleared. How: This copies penEdiRef.current.


											penEdiRef.current = null; // What: Pending Clear. Why: The request is being handled now, so it must not run twice. How: This resets penEdiRef to null.
											opeEdiFun( tarIdeStr );   // What: Open Editor Call. Why: The editor the user asked for opens once the previous one has closed. How: This calls opeEdiFun with tarIdeStr.


										}


									} }
								>{ /* What: Editing Item Wrap Div Element. Why: This is the whole existing-item editor slot, playing its own closing animation before actually unmounting. How: This reopens whatever edit staEdiFun staged in penEdiRef once its own closing keyframe finishes. */ }


									<div
										className='rd-row'
										onClick={ ( clkEveObj ) => clkEveObj.stopPropagation() }
									>{ /* What: Row Div Element. Why: A click inside the name row must not bubble up to whatever the pool row itself listens for. How: This stops propagation on every click. */ }


										<span className='rd-main'>{ /* What: Main Span Element. Why: The name input needs the same wrapper the closed row's name uses. How: This wraps the input below. */ }


											<input
												className='rd-name-input'
												type='text'
												maxLength={ 60 }
												placeholder='Item name'
												autoFocus
												value={ ediNamStr }
												aria-label='Item name'
												onChange={ ( chaEveObj ) => setEdiNamStr( chaEveObj.target.value ) }
												onBlur={ ( bluEveObj ) => { // What: On Blur Handler. Why: Leaving the name field commits a tidied name. How: This trims the value and renames the item when it's non-empty.


													const newNamStr = bluEveObj.target.value.trim(); // What: New Name String. Why: A blur commit should tidy the name, not keep stray whitespace. How: This trims the input's current value.


													if ( newNamStr ) actStoObj.renIteFun( ediLivObj.id, newNamStr ); // What: Rename Item Guard. Why: A blank name must never be committed. How: This renames the item only when newNamStr is non-empty.


												} }


												onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Enter' ) keyEveObj.currentTarget.blur(); } }
											/>{ /* What: Name Input Element. Why: This is the actual live-typed name field for the item being edited. How: This commits via actions.renIteFun on blur, and blurs itself on Enter. */ }


										</span>


									</div>

									<div className='rd-edit'>{ /* What: Edit Div Element. Why: EntEdiCom's own weight/ease/vacation controls need their own slot below the name row. How: This wraps a single EntEdiCom instance. */ }


										<EntEdiCom
											key={ ediLivObj.id }
											iteDatObj={ ediLivObj }
											picDatObj={ picDatObj }
											actStoObj={ actStoObj }
											onCloEdiFun={ () => setEdiCloBoo( true ) }
										/>{ /* What: Entry Editor Component. Why: Editing a pool item reuses the exact item editor Today and Data use. How: This is passed the live item, the picker, and the actions it edits through. */ }{ /* What: No-Ondelete Design Note. Why: EntEdiCom's own footer Delete button is already hidden by the existing .pv-newitem CSS rule (".rd-edit-foot > .btn--danger { display: none }"), same as the new-item flow below. How: Deleting an existing item stays solely the row's own trash icon + confirm flow, one delete affordance per item instead of two that could disagree with each other, so no onDelete prop is passed below. */ }{ /* What: Editor Key Design Note. Why: Without a key keyed to ediLivObj.id, switching ediIteStr straight from one item to another (see staEdiFun) can commit in a single React batch with no intervening null render, so this would stay the SAME EntEdiCom instance across the switch: its internal `orig` snapshot ref (captured once, on mount) would keep pointing at the FIRST item, and its unmount effect, which is what discards live edits via window.__editGuard when a close wasn't an explicit Save/Cancel, would never run at all. How: The key below forces React to unmount the old instance and mount a fresh one whenever the id changes, even within one commit. */ }


									</div>


								</div>


							);


						}



						const newIteObj = newDraObj; // What: New Item Object. Why: The branch below needs a stable local alias to check and render from. How: This is just newDraObj, read once for this render.


						if ( !newIteObj ) return ( // What: No Draft Branch. Why: When neither an existing edit nor a new draft is open, the plain add button belongs in this slot. How: This returns the "+ Add Item" button directly.


							<button
								className='pv-additem-btn'
								type='button'
								disabled={ disAddBoo }
								onClick={ addIteFun }
							>{ /* What: Add Item Button Element. Why: This starts a brand-new item draft in the pool. How: This calls the add handler on click, disabled during the matching tour step. */ }


								<IcoSvgCom
									icoNamStr='pluEle'
									sizValNum={ 14 }
								/>{ /* What: Icon Svg Component. Why: The button needs a recognizable "add" glyph beside its own label. How: This renders the 'pluEle' icon at a fixed size. */ } Add Item


							</button>


						);



						return (


							<div
								className={ ` pv-newitem   rd-item   is-editing   ${ newCloStr ? 'is-closing' : '' } ` }
								onAnimationEnd={ ( aniEveObj ) => { // What: On Animation End Handler. Why: The new-item editor's own close animation must finish before the add is committed or dropped. How: This commits a saved draft, clears the draft state, then opens any editor requested meanwhile.


									if ( !newCloStr || aniEveObj.target !== aniEveObj.currentTarget ) return; // What: Not Closing Guard. Why: Only the new item's own closing animation should finish the add. How: This bails out unless newCloStr is set and the event came from this element.



									if ( newCloStr === 'save' ) cmtDraFun( newIteObj ); // What: Save Commit Guard. Why: A saved new item becomes a real item, while a cancelled one is just dropped. How: This commits the draft only when newCloStr is 'save'.



									setNewCloStr( false ); // What: Closing Clear Call. Why: The close animation is over. How: This resets newCloStr to false.

									setNewDraObj( null ); // What: Draft Clear Call. Why: The new-item draft is finished either way. How: This resets newDraObj to null.

									if ( penEdiRef.current ) { // What: Pending Editor Guard. Why: A different item's editor may have been requested while this one was closing. How: This opens it once this editor has finished closing.


										const tarIdeStr = penEdiRef.current; // What: Target Identifier String. Why: The pending editor request must be read before it's cleared. How: This copies penEdiRef.current.


										penEdiRef.current = null; // What: Pending Clear. Why: The request is being handled now, so it must not run twice. How: This resets penEdiRef to null.
										opeEdiFun( tarIdeStr );   // What: Open Editor Call. Why: The editor the user asked for opens once the previous one has closed. How: This calls opeEdiFun with tarIdeStr.


									}


								} }
							>{ /* What: New Item Wrap Div Element. Why: This is the whole new-item draft editor slot, playing its own closing animation before actually committing or discarding. How: This commits the draft via cmtDraFun only when newCloStr is 'save', then reopens whatever staEdiFun staged in penEdiRef. */ }


								<div
									className='rd-row'
									onClick={ ( clkEveObj ) => clkEveObj.stopPropagation() }
								>{ /* What: Row Div Element. Why: A click inside the name row must not bubble up to whatever the pool wrap itself listens for. How: This stops propagation on every click. */ }


									<span className='rd-main'>{ /* What: Main Span Element. Why: The name input needs the same wrapper the closed row's name uses. How: This wraps the input below. */ }


										<input
											className='rd-name-input'
											type='text'
											maxLength={ 60 }
											placeholder='Item name'
											autoFocus
											value={ newIteObj.name }
											aria-label='Item name'
											onChange={ ( chaEveObj ) => draActObj.updIteFun( newIteObj.id, { name : chaEveObj.target.value } ) }
											onBlur={ ( bluEveObj ) => { // What: On Blur Handler. Why: Leaving the name field commits a tidied name. How: This trims the value and renames the draft item when it's non-empty.


												const newNamStr = bluEveObj.target.value.trim(); // What: New Name String. Why: A blur commit should tidy the name, not keep stray whitespace. How: This trims the input's current value.


												if ( newNamStr ) draActObj.renIteFun( newIteObj.id, newNamStr ); // What: Rename Item Guard. Why: A blank name must never be committed. How: This renames the draft item only when newNamStr is non-empty.


											} }


											onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Enter' ) keyEveObj.currentTarget.blur(); } }
										/>{ /* What: Name Input Element. Why: This is the actual live-typed name field for the draft being created. How: This writes into draActObj (not the real store) on every change, and commits the rename on blur. */ }


									</span>


								</div>

								<div className='rd-edit'>{ /* What: Edit Div Element. Why: EntEdiCom's own weight/ease/vacation controls need their own slot below the name row, wired to the draft instead of the real store. How: This wraps a single EntEdiCom instance bound to draActObj. */ }


									<EntEdiCom
										iteDatObj={ newIteObj }
										picDatObj={ picDatObj }
										actStoObj={ draActObj }
										onCloEdiFun={ () => setNewCloStr( 'save' ) }
										onCanEdiFun={ () => setNewCloStr( 'cancel' ) }
									/>{ /* What: Entry Editor Component. Why: The new-item draft reuses the exact item editor Today and Data use. How: This is passed the draft item, the picker, and the draft actions. */ }


								</div>


							</div>


						);


					} )() }


				</div>


			</div>


		</div>


	);


}

// #endregion PicVieCom



// #region PicForCom

/**
 * PicForCom = Picker Form Component
 *
 * @summary
 * The setup view for a brand-new picker, and (via isaEdiBoo) the shared
 * Details-only editor for an existing one. Renders in the same slot a
 * selected picker's own PicVieCom would, so creating a picker reuses the
 * mental model of "this is what a picker looks like" the whole app
 * already teaches: Step 1 (Details) covers Name/Group/Mode/Conditional/
 * Daily schedule, Step 2 (Items) builds a fresh pool by typing item
 * names. Editing only ever shows Step 1, since an existing picker's own
 * items are edited via the Data tab or PicVieCom's own live pool instead.
 * On submit this calls onCrePicFun (a fresh picker, which store.js's
 * addPicFun also spins up a matching Data-tab category for) or onSavEdiFun
 * (an in-place edit via savEdiFun), depending on isaEdiBoo.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.exiGroArr   - Existing Group Array: Every distinct group name
 *                            already in use, offered as chips.
 * @param props.iniGroStr   - Initial Group String: A group name to prefill the
 *                            picker onto, without opening the add-a-new-group
 *                            sub-form.
 * @param props.conObjArr   - Conditional Object Array: Every existing
 *                            conditional, offered for attachment; defaults to
 *                            an empty array.
 * @param props.onCanForFun - On Cancel Form Function: Called when the user
 *                            backs out without creating/saving anything.
 * @param props.onCrePicFun - On Create Picker Function: Called with the
 *                            finished payload when a new picker is submitted
 *                            (isaEdiBoo false).
 * @param props.onSavEdiFun - On Save Edit Function: Called with the finished
 *                            payload when an edit is submitted (isaEdiBoo
 *                            true).
 * @param props.iniForObj   - Initial Form Object: A prefilled starting shape
 *                            (edit values, a tour's staged sample, or an
 *                            empty-state quick-start prefill); optional.
 * @param props.opeTouBoo   - Open Tour Boolean: Marks this instance as opened
 *                            by a guided tour, so advSteFun skips its own
 *                            scroll-to-top (a tour step's own highlight target
 *                            can sit further down this same Items sub-step);
 *                            defaults to undefined (falsy).
 * @param props.isaEdiBoo   - Is-An Edit Boolean: Switches between the create
 *                            flow (both steps, onCrePicFun) and the edit flow
 *                            (Step 1 only, onSavEdiFun); defaults to undefined
 *                            (falsy).
 *
 * @returns The form's own current step (Details or Items), or, while
 * isaEdiBoo is true, only ever the Details step.
 *
 * @example
 * ```tsx
 * PicForCom({ exiGroArr, iniGroStr, conObjArr, ... }) // => <PicForCom />
 * ```
 *
*/

function PicForCom ( { exiGroArr, iniGroStr, conObjArr = [], onCanForFun, onCrePicFun, onSavEdiFun, iniForObj, opeTouBoo, isaEdiBoo } ) {


	const touBusObj = useEmlTouFun();       // What: Tour Bus Object. Why: advSteFun needs to know whether a guided tour (of any kind) is currently driving the page, so it can skip its own scroll-to-top when a picker mini-tour is mid-flight. How: This subscribes to the shared tour event bus.
	const namInpRef = React.useRef( null ); // What: Name Input Reference. Why: The focus effect right below needs a handle on the real input DOM node. How: This is attached to the name input's own ref prop, below.

	const [ forSteNum, setForSteNum ] = React.useState( ( iniForObj && iniForObj.step ) || 1 );  // What: Form Step Number And Setter. Why: This is the whole form's own current sub-step (1 Details, 2 Items). How: This starts from a prefilled step (a tour resuming mid-form) or 1.
	const [ newNamStr, setNewNamStr ] = React.useState( ( iniForObj && iniForObj.name ) || '' ); // What: New Name String And Setter. Why: This is the picker's own live-typed name field. How: This starts from a prefilled name, or empty.


	React.useEffect( () => { // What: Focus Name Effect. Why: Arriving from Today's empty-state card should land the cursor directly in the name field, ready to type. How: This focuses and selects the name input, once, only when iniForObj explicitly asks for it.


		if ( iniForObj && iniForObj.focusName && namInpRef.current ) { // What: Focus Request Guard. Why: Only an explicit focusName request should steal focus on mount. How: This checks both that a prefill exists and that it actually asked for focus.


			namInpRef.current.focus(); // What: Focus Call. Why: The cursor needs to land in the name field. How: This calls the native focus() on the input DOM node.

			namInpRef.current.select(); // What: Select Call. Why: A pre-filled placeholder value (if any) should be fully selected, ready to be typed over. How: This calls the native select() on the input DOM node.


		}


	}, [] ); // What: Effect Dependency Array. Why: This only ever needs to run once, on mount. How: An empty array means it never re-runs.


	const [ selGroStr, setSelGroStr ] = React.useState( iniGroStr || exiGroArr[ 0 ] || '' );                                                // What: Selected Group String And Setter. Why: This is which existing group chip is currently chosen. How: This starts from iniGroStr, or the first existing group, or empty.
	const [ addGroBoo, setAddGroBoo ] = React.useState( ( iniForObj && iniForObj.group ) ? true : exiGroArr.length === 0 );                 // What: Adding Group Boolean And Setter. Why: The inline "New Group" sub-form is its own mode, distinct from picking an existing chip. How: This starts open when a prefill explicitly stages a new group name, or when there are no existing groups to choose from at all.
	const [ newGroStr, setNewGroStr ] = React.useState( ( iniForObj && iniForObj.group ) || '' );                                           // What: New Group String And Setter. Why: This is the live-typed value of the inline "New Group" sub-form. How: This starts from a prefilled group name, or empty.
	const [ selModStr, setSelModStr ] = React.useState( ( iniForObj && iniForObj.mode ) || 'random' );                                      // What: Selected Mode String And Setter. Why: This is which picker mode is currently chosen. How: This starts from a prefilled mode, or 'random'.
	const [ incDaiBoo, setIncDaiBoo ] = React.useState( ( iniForObj && 'includeInDaily' in iniForObj ) ? iniForObj.includeInDaily : true ); // What: Include Daily Boolean And Setter. Why: Whether this picker is included when the user taps Regenerate on Today. How: This defaults on, matching existing behavior for newly-created pickers, unless editing an existing one, which prefills its own current membership.

	const daiBloRef = React.useRef( null );  // What: Daily Block Reference. Why: The reveal effect right below needs a handle on the schedule block's own DOM node. How: This is attached to the schedule block's own ref prop, below.
	const daiTogRef = React.useRef( false ); // What: Daily Toggled Reference. Why: The reveal effect below must only fire when the USER actually flipped the switch, not on an initial prefilled-true render. How: This is set true by the switch's own onClick and read (but never itself triggers a re-render) by the effect below.


	React.useEffect( () => { // What: Daily Reveal Effect. Why: Re-enabling the Daily section should bring the newly-revealed block fully into view, since it can unfurl below the fold. How: This waits for the ColDisCom unfurl to finish, then scrolls the shared .main container just enough to bring the block fully into view.


		if ( !incDaiBoo || !daiTogRef.current ) return; // What: Not User-Toggled Guard. Why: Only a genuine user toggle-on should trigger this scroll, not a prefilled initial value. How: This bails out unless both incDaiBoo is true and daiTogRef.current is true.



		const scrTimNum = setTimeout( () => { // What: Scroll Timeout Number. Why: The block must be measured only after ColDisCom's own unfurl animation has actually finished expanding it to full height. How: This waits redMotFun() ? 0 : 320ms before measuring and scrolling.


			const daiBloEle = daiBloRef.current;                         // What: Daily Block Element. Why: The scroll calculation needs the actual DOM node. How: This reads daiBloRef.current once and reuses it below.
			const scrConEle = daiBloEle && daiBloEle.closest( '.main' ); // What: Scroll Container Element. Why: The shared scrollable container is what actually needs to move. How: This walks up from daiBloEle to the nearest .main ancestor.


			if ( !daiBloEle || !scrConEle ) return; // What: Missing Element Guard. Why: Either element may not exist yet if this fires after an unrelated unmount. How: This bails out of the scroll calculation entirely when either is missing.



			const oveBelNum = daiBloEle.getBoundingClientRect().bottom - scrConEle.getBoundingClientRect().bottom + 96; // What: Overflow Below Number. Why: This is how far below the visible fold the block actually sits, plus a small comfort margin. How: This subtracts the container's own bottom edge from the block's own bottom edge.


			if ( oveBelNum > 0 ) scrConEle.scrollTo({ // What: Scroll Adjust Guard. Why: Only an actually-overflowing block needs to be scrolled into view at all. How: This scrolls the container down by exactly the overflow amount.


				behavior : redMotFun() ? 'auto' : 'smooth', // What: Behavior. Why: A user who prefers reduced motion gets an instant jump instead of a glide. How: This picks 'auto' under reduced motion, otherwise 'smooth'.
				top      : scrConEle.scrollTop + oveBelNum  // What: Top. Why: The page scrolls just enough to reveal the editor's bottom edge. How: This adds oveBelNum to the current scroll.


			});


		}, redMotFun() ? 0 : 320 );



		return () => clearTimeout( scrTimNum ); // What: Effect Cleanup Return. Why: A stale scroll must not fire after this effect re-runs or unmounts. How: This cancels the scheduled scrTimNum timeout.


	}, [ incDaiBoo ] ); // What: Effect Dependency Array. Why: This only needs re-evaluating when the Daily toggle itself changes. How: incDaiBoo is the sole value this effect's own guard checks.


	const [ runDowArr, setRunDowArr ] = React.useState( ( iniForObj && iniForObj.daysOfWeek ) || [ 0, 1, 2, 3, 4, 5, 6 ] ); // What: Run Dow Array And Setter. Why: When included, an optional schedule of which weekdays the picker may run on. How: This defaults to every day, unless a prefill (e.g. a picker mini-tour's sample data) specifies otherwise.
	const [ skiHolBoo, setSkiHolBoo ] = React.useState( ( iniForObj && iniForObj.skipHolidays ) || false );                 // What: Skip Holidays Boolean And Setter. Why: Whether this picker sits out major U.S. holidays. How: This starts from a prefilled value, or false.
	const [ avoDupBoo, setAvoDupBoo ] = React.useState( ( iniForObj && iniForObj.avoidDuplicates ) || false );              // What: Avoid Duplicates Boolean And Setter. Why: Excludes an item from this picker's own pool for the day if its name (case-insensitive) is already present elsewhere on today's list, for pickers that intentionally share items with another picker and don't want the same one to surface twice. How: This defaults off, since most pickers don't share a pool with anything else, so this should stay opt-in.
	const [ cadCurObj, setCadCurObj ] = React.useState( () => CAD_NAM_OBJ.norCadFun( iniForObj || {} ) );                   // What: Cadence Current Object And Setter. Why: How often this picker surfaces, plus its anchor. How: This defaults to daily, unless editing an existing picker (which prefills its current cadence): CAD_NAM_OBJ.norCadFun's accepted shape matches the same fields addPicFun/savEdiFun read off iniForObj here, so passing it straight through picks up any of them that are present and falls back to daily defaults for the rest.

	const locDowNum = cadCurObj.cadence === 'weekly' ? cadCurObj.anchorDow : null;                      // What: Locked Dow Number. Why: Weekly cadence pins its anchor day ON in the Days control (and blocks the presets from dropping it), so the two controls can't contradict each other. How: This is the anchor day while weekly, otherwise null.
	const witLocFun = ( dayInpArr ) => CAD_NAM_OBJ.enfWeeFun({ ...cadCurObj, daysOfWeek : dayInpArr }); // What: With Locked Function. Why: Every preset button below needs to apply the same locked-day enforcement the effect below already applies to manual edits. How: This calls the shared CAD_NAM_OBJ helper with the candidate days merged into the current cadence.


	React.useEffect( () => { // What: Enforce Weekly Day Effect. Why: A cadence change (e.g. switching into weekly, or changing which day is anchored) must also keep runDowArr consistent with the new anchor. How: This re-applies CAD_NAM_OBJ.enfWeeFun whenever the cadence or its anchor day changes.


		setRunDowArr( ( curDayArr ) => { // What: Days Reconcile Call. Why: Only a genuinely different result should trigger a re-render. How: This computes the enforced days and returns the previous array unchanged if nothing actually changed.


			const nexDayArr = CAD_NAM_OBJ.enfWeeFun({ ...cadCurObj, daysOfWeek : curDayArr }); // What: Next Day Array. Why: This is the actual enforced result to compare against. How: This calls the shared CAD_NAM_OBJ helper with the current days.



			return nexDayArr.length === curDayArr.length ? curDayArr : nexDayArr; // What: Unchanged Guard Return. Why: Returning the SAME array reference when nothing changed avoids a pointless extra render. How: This compares lengths as a cheap proxy for "did enforcement actually add the missing anchor day".


		});


	}, [ cadCurObj.cadence, cadCurObj.anchorDow ] ); // What: Effect Dependency Array. Why: Only these two fields of cadCurObj can ever change which day must be locked on. How: cadCurObj.cadence decides whether locking applies at all, and cadCurObj.anchorDow decides which day.


	const [ conAttBoo, setConAttBoo ] = React.useState( !!( iniForObj && iniForObj.conditionalId ) );       // What: Conditional Attach Boolean And Setter. Why: An optional conditional gate; when on, the user attaches an existing conditional or creates a fresh inline one. How: This starts on only when editing an existing picker that already has one attached.
	const [ conSelStr, setConSelStr ] = React.useState( ( iniForObj && iniForObj.conditionalId ) || null ); // What: Conditional Selected String And Setter. Why: This holds which conditional is chosen: an existing id, the literal 'new', or null. How: This starts from a prefilled conditionalId, or null.
	const [ conDraObj, setConDraObj ] = React.useState( () => conDraFun( '' ) );                            // What: Conditional Draft Object And Setter. Why: Creating a fresh inline conditional needs its own draft shape to edit. How: This starts from the shared default, seeded with an empty name until the user actually opens the "Add New Conditional" pill.

	const conTidStr = norConFun( conDraObj.name ) || ''; // What: Conditional Tidy String. Why: Create-new requires a UNIQUE name; normalizing first, then comparing against existing conditionals (which are stored normalized), is what actually detects a real collision, not just a surface-level text match. How: This runs conDraObj's own name through the shared normalizer.


	const conColBoo = conAttBoo && conSelStr === 'new' && conObjArr.some( ( conCurObj ) => ( conCurObj.name || '' ).toLowerCase() === conTidStr.toLowerCase() ); // What: Conditional Collides Boolean. Why: Reuse is the deliberate act of tapping an existing pill, not a silent name match, so only the create-new path can ever collide. How: This checks conTidStr against every existing conditional's own name, case-insensitively.


	const conErrStr = conColBoo // What: Conditional Error String. Why: The name field needs a concrete, actionable message once a collision is actually detected. How: This names the colliding conditional directly and suggests reusing it instead.
		? `A conditional named “${ conTidStr }” already exists. Choose a different name, or select it from the list above to reuse it.` // What: Collision Message Branch. Why: A colliding name needs a concrete, actionable message. How: This names the colliding conditional and suggests reusing it.
		: null; // What: No Collision Branch. Why: A unique name has no error. How: This returns null.


	const raiCleRef = React.useRef( null ); // What: Rail Cleanup Reference. Why: The edge-fade cue on the conditional rail (matching the app's other horizontal rails) needs its own teardown function remembered across callback-ref re-invocations. How: This holds whatever cleanup function raiCalFun most recently registered, run and cleared at the top of every subsequent call.
	const raiNodRef = React.useRef( null ); // What: Rail Node Reference. Why: The scroll-to-start effect below needs to read back the same DOM node raiCalFun most recently attached to. How: This mirrors whatever element is currently mounted, or null while the rail itself isn't rendered.


	const raiCalFun = React.useCallback( ( raiCurEle ) => { // What: Rail Callback Function. Why: ColDisCom (below) mounts this rail one render AFTER conAttBoo flips true (it stages its own `render` state first), so a plain useEffect keyed on conAttBoo would fire while the ref is still null and never get another chance to run once the rail actually appears; a callback ref, which fires exactly when the DOM node attaches, plus a ResizeObserver, which re-fires whenever conditionals are added/removed and the rail's content width changes, sidesteps that race entirely. How: This registers a scroll listener and a ResizeObserver on whatever element the rail's own ref prop attaches to below, tearing down the previous ones first.


		if ( raiCleRef.current ) { // What: Previous Cleanup Guard. Why: A remount (or unmount) must not leave the prior element's own listeners dangling. How: This runs and clears whatever teardown function was registered for the previous element, if any.


			raiCleRef.current();      // What: Previous Cleanup Call. Why: The old rail's listeners must not outlive it. How: This runs the stored cleanup.
			raiCleRef.current = null; // What: Cleanup Clear. Why: The stored cleanup has run and must not run again. How: This resets raiCleRef to null.


		}



		raiNodRef.current = raiCurEle; // What: Node Mirror Write. Why: The scroll-to-start effect below needs to read back the current node outside of this callback's own closure. How: This mirrors raiCurEle into raiNodRef.current.



		if ( !raiCurEle ) return; // What: Unmount Guard. Why: A null element means the rail just unmounted, with nothing left to observe. How: This bails out before registering anything.



		const updRaiFun = () => { // What: Update Rail Function. Why: The at-start/at-end edge-fade classes need recomputing every time the rail scrolls or resizes. How: This toggles both classes based on the rail's own current scroll position versus its scrollable width.


			const canScrBoo = raiCurEle.scrollWidth - raiCurEle.clientWidth > 1; // What: Can Scroll Boolean. Why: A rail that doesn't actually overflow should just show both fades as "at rest" rather than neither. How: This compares the rail's own full content width against its visible width.


			raiCurEle.classList.toggle( 'at-start', !canScrBoo || raiCurEle.scrollLeft <= 1 ); // What: At-Start Toggle Call. Why: The left edge fade should hide once the rail can't scroll left any further. How: This applies the class whenever the rail can't scroll at all, or is already scrolled to (near) its start.

			raiCurEle.classList.toggle( 'at-end', !canScrBoo || raiCurEle.scrollLeft + raiCurEle.clientWidth >= raiCurEle.scrollWidth - 1 ); // What: At-End Toggle Call. Why: The right edge fade should hide once the rail can't scroll right any further. How: This applies the class whenever the rail can't scroll at all, or is already scrolled to (near) its end.


		};


		updRaiFun(); // What: Initial Update Call. Why: The classes need to be correct immediately on mount, without waiting for a scroll or resize event. How: This invokes updRaiFun once, synchronously.

		raiCurEle.addEventListener( 'scroll', updRaiFun, { passive : true } ); // What: Scroll Listener Call. Why: The classes must stay correct as the user actually scrolls the rail. How: This re-runs updRaiFun on every scroll event.


		const resObsObj = new ResizeObserver( updRaiFun ); // What: Resize Observer Object. Why: Adding or removing a conditional pill can change the rail's own scrollable width without the rail itself scrolling. How: This re-runs updRaiFun whenever the observed element's size changes.


		resObsObj.observe( raiCurEle ); // What: Resize Observer Start Call. Why: The observer above does nothing until it's actually told what to watch. How: This starts watching raiCurEle for size changes.

		raiCleRef.current = () => { // What: Cleanup Registration. Why: The next callback-ref invocation (a remount or unmount) needs a teardown function ready to run. How: This stores a closure removing the scroll listener and disconnecting the observer.


			raiCurEle.removeEventListener( 'scroll', updRaiFun ); // What: Scroll Unsubscribe Call. Why: The listener must not outlive this rail. How: This removes updRaiFun from raiCurEle.
			resObsObj.disconnect();                               // What: Observer Disconnect Call. Why: The observer must not outlive this rail either. How: This disconnects resObsObj.


		};


	}, [] ); // What: Effect Dependency Array. Why: This callback ref never needs to change identity; the element it receives is a normal parameter, not a dependency. How: An empty array means React never has to detach and reattach it across renders.


	React.useEffect( () => { // What: Scroll To Start Effect. Why: Selecting a conditional pins it to the front of the rail (see the sort in the render below), so the rail should scroll back to the start to bring it into view, same idea as the Data tab's own attached-conditional pin. How: This scrolls raiNodRef's own current element back to its start whenever conSelStr changes to a real, non-'new' selection.


		const raiCurEle = raiNodRef.current; // What: Rail Current Element. Why: The scroll call below needs the actual live DOM node. How: This reads raiNodRef.current once.

		const notRaiBoo = !raiCurEle;          // What: Not Rail Boolean. Why: An unmounted rail has nothing to scroll. How: This negates raiCurEle.
		const notSelBoo = conSelStr == null;   // What: Not Selected Boolean. Why: With nothing selected there's no pill to scroll to. How: This checks conSelStr is null or undefined.
		const newSelBoo = conSelStr === 'new'; // What: New Selected Boolean. Why: The 'new' pill already sits at the rail's start. How: This checks conSelStr is 'new'.

		const skiScrBoo = notRaiBoo || notSelBoo || newSelBoo; // What: Skip Scroll Boolean. Why: Any one of these means there's no real selection to scroll to. How: This ORs the 3 checks above.


		if ( skiScrBoo ) return; // What: No Real Selection Guard. Why: Only picking a REAL existing conditional should trigger this scroll; neither an unmounted rail nor the 'new' pill (which has nothing to scroll to) should. How: This bails out unless a real element exists and conSelStr is a genuine id.



		if ( raiCurEle.scrollLeft > 1 ) raiCurEle.scrollTo({ // What: Scroll Adjust Guard. Why: A rail that's already at its start needs no animation at all. How: This scrolls back to the start only when it's actually scrolled away from it.


			behavior : redMotFun() ? 'auto' : 'smooth', // What: Behavior. Why: A user who prefers reduced motion gets an instant jump instead of a glide. How: This picks 'auto' under reduced motion, otherwise 'smooth'.
			left     : 0                                // What: Left. Why: The rail's start is its left edge. How: This scrolls to x 0.


		});


	}, [ conSelStr ] ); // What: Effect Dependency Array. Why: Only a genuine change to which conditional is selected should trigger this scroll. How: conSelStr is the sole value this effect's own guard checks.


	const [ pooIteArr, setPooIteArr ] = React.useState( ( iniForObj && iniForObj.items ) || [] ); // What: Pool Item Array And Setter. Why: Step 2's own pool; each item is { name, weight }, weight only mattering for weighted/dynamic modes and only editable inline then. How: This is a fresh pool (Option B, not a pick-from-library), starting from a prefilled items list, or empty; other defaults (drift value, ease knobs) are applied at commit time.

	const forWraRef = React.useRef( null ); // What: Form Wrap Reference. Why: advSteFun needs a handle on this form's own root so it can walk up to whichever ancestor actually scrolls. How: This is attached to the form's own root div, below.


	const advSteFun = () => { // What: Advance Step Function. Why: Moving to Step 2 from the bottom-of-form button leaves the user scrolled down; the form's own scroll container should be pulled back to the top so the add-item field is in view without a manual scroll. How: This is skipped while a guided tour is active, since a picker mini-tour's own next step highlights something further down this same Items sub-step, and this scroll-to-top fought that positioning.


		setForSteNum( 2 ); // What: Step Advance Call. Why: This is the actual step transition. How: This writes 2 into forSteNum.



		if ( touBusObj.touPhaStr === 'tour' ) return; // What: Tour Active Guard. Why: A running tour's own positioning must not be fought by this scroll-to-top. How: This bails out before scheduling any scroll at all.



		requestAnimationFrame( () => { // What: Scroll To Top Call. Why: The add-item field should be visible without a manual scroll. How: This walks up from forWraRef looking for the nearest genuinely-scrollable ancestor, falling back to the shared .main container.


			let curWalEle = forWraRef.current; // What: Current Walk Element. Why: The loop below needs a mutable pointer to walk up the DOM tree with. How: This starts at the form's own root and is reassigned to each ancestor in turn.


			while ( curWalEle && curWalEle !== document.body ) { // What: Ancestor Walk Loop. Why: The nearest ACTUALLY-scrollable ancestor (not just any parent) is what needs scrolling. How: This checks each ancestor's own computed overflow-y and real scroll height before deciding it's the one.


				const oveStyStr = getComputedStyle( curWalEle ).overflowY; // What: Overflow Style String. Why: Only an ancestor whose own CSS actually allows scrolling is a real candidate. How: This reads the computed overflowY value for curWalEle.


				if ( ( oveStyStr === 'auto' || oveStyStr === 'scroll' ) && curWalEle.scrollHeight > curWalEle.clientHeight ) { // What: Scrollable Ancestor Found Guard. Why: The first genuinely-scrollable ancestor found is the one that actually needs resetting. How: This scrolls it to the top and returns immediately, skipping every further ancestor.


					curWalEle.scrollTo({ // What: Ancestor Scroll Call. Why: This is the actual reset of the found ancestor. How: This scrolls curWalEle to its top.


						behavior : redMotFun() ? 'auto' : 'smooth', // What: Behavior. Why: A user who prefers reduced motion gets an instant jump instead of a glide. How: This picks 'auto' under reduced motion, otherwise 'smooth'.
						top      : 0                                // What: Top. Why: The form's start is the top of the page. How: This scrolls to y 0.


					});



					return; // What: Early Return. Why: The nearest scrollable ancestor was handled, so no fallback is needed. How: This exits the frame callback.


				}



				curWalEle = curWalEle.parentElement; // What: Walk Advance. Why: No scrollable ancestor was found yet, so the search continues one level up. How: This reassigns curWalEle to its own parent.


			}


			const scrConEle = document.querySelector( '.main' ); // What: Scroll Container Element. Why: No scrollable ancestor was found in the walk above, so the shared app-wide scroller is the fallback target. How: This queries for the .main element directly.


			if ( scrConEle ) { // What: Fallback Scroll Guard. Why: Only a genuinely-found fallback container should be scrolled. How: This scrolls .main to the top if it exists.


				scrConEle.scrollTo({ // What: Fallback Scroll Call. Why: This is the actual reset of the main container. How: This scrolls scrConEle to its top.


					behavior : redMotFun() ? 'auto' : 'smooth', // What: Behavior. Why: A user who prefers reduced motion gets an instant jump instead of a glide. How: This picks 'auto' under reduced motion, otherwise 'smooth'.
					top      : 0                                // What: Top. Why: The form's start is the top of the page. How: This scrolls to y 0.


				});


			}


		});


	};


	const effGroStr = addGroBoo ? norGroFun( newGroStr, exiGroArr ) : selGroStr; // What: Effective Group String. Why: The picker's own real group is whichever of the two group controls (existing chip or new-group input) is currently active. How: This normalizes newGroStr when addGroBoo is on, otherwise it's just selGroStr directly.
	const detReaBoo = !!( newNamStr.trim() && effGroStr && selModStr );          // What: Details Ready Boolean. Why: Both steps' own footer buttons need to know whether Step 1's own required fields are actually complete. How: This requires a non-blank trimmed name, a real effective group, and a chosen mode.
	const shoWeiBoo = selModStr === 'weighted' || selModStr === 'dynamic';       // What: Show Weight Boolean. Why: Weight is a lever only for these two modes; random/ease-* ignore it entirely, so the control stays hidden elsewhere to avoid asking for something irrelevant. How: This gates the weight column throughout Step 2.
	const isaEasBoo = selModStr === 'ease-up' || selModStr === 'ease-down';      // What: Is-An Ease Boolean. Why: Only these two modes use the easeMin/easeMax drift band at all. How: This gates the ease controls throughout Step 2.

	const easThrNum = 100;                           // What: Ease Threshold Number. Why: This is the fixed 0-100 scale every item's own drift value moves across. How: This is used throughout the conversion helpers right below. // What: Ease Cadence Design Note. Why: Ease cadence is PER-ITEM, since a fridge-clean and a counter-wipe want different rhythms; each item carries its own drift band { easeMin, easeMax }. How: Two human questions are asked per item and converted: soonest days (least time before it CAN come up) -> easeMax = 100/soonest; latest days (most time before it MUST come up) -> easeMin = 100/latest. The engine moves an item across the 0-100 threshold by random(easeMin, easeMax) each daily run, so maturing fastest (every roll = easeMax) takes 100/easeMax days = the soonest, and slowest (every roll = easeMin) takes 100/easeMin days = the latest; the gap between the two answers IS the randomness. One picker-level toggle (easManBoo below) flips ALL rows to raw drift inputs for power users. Drift values are the source of truth on each item.
	const defEasObj = { easeMin : 7, easeMax : 14 }; // What: Default Ease Object. Why: A freshly-added item needs a sensible starting drift band before the user tunes it. How: This seeds addDraFun's own new-item shape below. // What: Default Band Note. Why: The raw numbers are easier to picture as days. How: This band works out to roughly a 7-day soonest and a 14-day latest.

	const covSooFun = ( easMaxNum ) => Math.max( 1, Math.round( easThrNum / ( easMaxNum || 1 ) ) ); // What: Convert Soonest Function. Why: The soonest-days question is really just easThrNum divided by an item's own easeMax, floored at 1 day. How: This rounds the division and clamps it to at least 1.
	const covLatFun = ( easMinNum ) => Math.max( 1, Math.round( easThrNum / ( easMinNum || 1 ) ) ); // What: Convert Latest Function. Why: The latest-days question is really just easThrNum divided by an item's own easeMin, floored at 1 day. How: This rounds the division and clamps it to at least 1.

	const capStrFun = ( souTexStr ) => souTexStr.length ? souTexStr[ 0 ].toUpperCase() + souTexStr.slice( 1 ) : souTexStr; // What: Capitalize String Function. Why: Every item/picker name this form commits should read with a capitalized first letter, regardless of how the user actually typed it. How: This upper-cases just the first character and leaves the rest untouched.

	const [ actNewStr, setActNewStr ] = React.useState( null );  // What: Active New String And Setter. Why: This holds the id of whichever draft item is currently being newly added (as opposed to an already-committed row being edited). How: This is set by addDraFun and cleared once its own closing animation finishes. // What: Reused Item Editor Design Note. Why: This is the same UI as the live Pickers-tab add flow; draft items carry a stable id so the shared EntEdiCom plus a synthetic actions object (backed by the draft array, not the store) can key off it. How: Adding opens the editor inline at the bottom; Save/Cancel play the same fade animations as the live flow.
	const [ actCloStr, setActCloStr ] = React.useState( false ); // What: Active Closing String And Setter. Why: The new-item draft's own editor needs to play a closing animation before it's actually torn down. How: This holds 'save', 'cancel', or false, consumed by the draft wrap's own onAnimationEnd handler below. // What: Closing Values Note. Why: The close reason decides whether the draft is kept. How: It is false while open, otherwise 'save' or 'cancel'.
	const [ insDraStr, setInsDraStr ] = React.useState( null );  // What: Insert Draft String And Setter. Why: A freshly-committed pool row needs its own insert animation, keyed to its own id. How: This is set once a new-item draft's own closing animation reports 'save'.
	const [ conDelStr, setConDelStr ] = React.useState( null );  // What: Confirm Delete String And Setter. Why: Deleting a pool item asks for confirmation inline. How: This holds the id currently showing its own delete-confirm row.
	const [ conLeaStr, setConLeaStr ] = React.useState( null );  // What: Confirm Leaving String And Setter. Why: Cancelling a delete confirmation needs its own out-animation before the row reverts to normal. How: This holds the id currently playing that leaving animation, cleared once it finishes.


	const canConFun = () => { // What: Cancel Confirm Function. Why: Cancelling a pending delete needs to play the same leaving animation as everywhere else in this file, unless reduced motion applies. How: This either clears conDelStr immediately, or stages conLeaStr for 150ms first.


		if ( redMotFun() ) { setConDelStr( null ); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion shouldn't wait through a skipped animation. How: This clears the confirm state immediately and returns.



		setConLeaStr( conDelStr ); // What: Leaving Stage Call. Why: The confirm row needs to actually play its own out-animation now. How: This copies the current conDelStr into conLeaStr.

		setTimeout( () => { // What: Delayed Clear Call. Why: The confirm row must not fully disappear until its own out-animation has had time to actually play. How: This clears both conLeaStr and conDelStr 150ms later.


			setConLeaStr( null ); // What: Leaving Clear Call. Why: The confirm row has finished its exit animation. How: This resets conLeaStr to null.
			setConDelStr( null ); // What: Confirm Clear Call. Why: No row stays in its delete-confirm state. How: This resets conDelStr to null.


		}, 150 );


	};


	const [ rmvIdeStr, setRmvIdeStr ] = React.useState( null ); // What: Removing Identifier String And Setter. Why: A deleted pool row needs its own removal animation to finish before it's actually taken out of pooIteArr. How: This holds the id currently playing that removal animation.

	const addWraRef = React.useRef( null ); // What: Add Wrap Reference. Why: Both the new-item and edit-item flows render into this same below-the-list slot, which needs a stable handle so it can be scrolled into view. How: This is attached to the .pv-additem-wrap div's own ref prop, below.

	const [ ediIteStr, setEdiIteStr ] = React.useState( null );  // What: Editing Item String And Setter. Why: Editing an already-added draft item mirrors the live Pickers tab's own ediIteStr/opeEdiFun/staEdiFun exactly (see PicVieCom above), just bound to pooIteArr + draActObj instead of the real store. How: This holds the id of whichever committed draft item currently has its editor open, or null.
	const [ ediCloBoo, setEdiCloBoo ] = React.useState( false ); // What: Editing Closing Boolean And Setter. Why: Closing a committed draft item's editor needs its own out-animation before it's actually torn down. How: This is flipped true to start that animation.

	const penEdiRef = React.useRef( null );                                                   // What: Pending Edit Reference. Why: Switching straight from the new-item form (or a different item's editor) into this one must not silently drop the request. How: This holds the target id to reopen once whatever's currently closing finishes.
	const ediSnaRef = React.useRef( null );                                                   // What: Editing Snapshot Reference. Why: Switching directly between two draft items' editors needs an explicit revert, for the exact same reason PicVieCom's own ediSnaRef does (EntEdiCom's own unmount-triggered revert would be disarmed by the very next EntEdiCom's mount effect before it ever fires). How: This holds a snapshot of whichever draft item opeDraFun last opened.
	const comCouNum = pooIteArr.filter( ( iteCurObj ) => iteCurObj.id !== actNewStr ).length; // What: Committed Count Number. Why: The count and the Create button must not react early to a row still being edited, so its own Save hasn't landed yet. How: This is deliberately computed AFTER actNewStr's own declaration above; referencing it earlier in the body would (since this project targets Vite, not a var-hoisting build) read as undefined and this filter would exclude nothing.
	const enoIteBoo = comCouNum >= 2;                                                         // What: Enough Item Boolean. Why: A picker must have at least 2 real, committed items before it can be created. How: This is true once comCouNum reaches 2.


	const draActObj = { // What: Draft Actions Object. Why: EntEdiCom expects a real actions-shaped object to call as the user edits a draft pool item, but pooIteArr isn't the real store. How: Every method below mirrors the real store action's own name and signature, but writes into pooIteArr instead of dispatching a real store update.


		delIteFun : ( tarIdeStr ) => setPooIteArr( ( preIteArr ) => preIteArr.filter( ( iteCurObj ) => iteCurObj.id !== tarIdeStr ) ),                                                            // What: Delete Item Function. Why: EntEdiCom's own footer Delete button (hidden here via CSS, same as the live flow) still expects this method to exist. How: This filters the matching entry out entirely.
		renIteFun : ( tarIdeStr, newNamStr ) => setPooIteArr( ( preIteArr ) => preIteArr.map( ( iteCurObj ) => iteCurObj.id === tarIdeStr ? { ...iteCurObj, name : newNamStr } : iteCurObj ) ),   // What: Rename Item Function. Why: The name input's own onBlur calls this exactly like the real store action. How: This overwrites just the name field on the matching entry.
		revIteFun : ( tarIdeStr, snaIteObj ) => setPooIteArr( ( preIteArr ) => preIteArr.map( ( iteCurObj ) => iteCurObj.id === tarIdeStr ? snaIteObj : iteCurObj ) ),                            // What: Revert Item Function. Why: EntEdiCom's own Cancel/Escape handling calls this to revert to a prior snapshot. How: This replaces the matching entry wholesale with snaIteObj.
		setWeiFun : ( tarIdeStr, weiValNum ) => setPooIteArr( ( preIteArr ) => preIteArr.map( ( iteCurObj ) => iteCurObj.id === tarIdeStr ? { ...iteCurObj, weight : weiValNum } : iteCurObj ) ), // What: Set Weight Function. Why: EntEdiCom's own weight stepper calls this exactly like the real store action. How: This overwrites just the weight field on the matching entry.
		updIteFun : ( tarIdeStr, patIteObj ) => setPooIteArr( ( preIteArr ) => preIteArr.map( ( iteCurObj ) => iteCurObj.id === tarIdeStr ? { ...iteCurObj, ...patIteObj } : iteCurObj ) ),       // What: Update Item Function. Why: EntEdiCom calls this exactly like the real store action to apply a field patch. How: This merges patIteObj into whichever pooIteArr entry matches tarIdeStr.

		togVacFun : ( tarIdeStr ) => setPooIteArr( ( preIteArr ) => preIteArr.map( ( iteCurObj ) => iteCurObj.id === tarIdeStr ? { // What: Toggle Vacation Function. Why: EntEdiCom's own Active switch calls this exactly like the real store action. How: This flips just the vacation field on the matching entry.


			...iteCurObj, // What: Current Item Spread. Why: Every other field stays as it was. How: This copies iteCurObj.

			vacation : !iteCurObj.vacation // What: Vacation. Why: This is the flag being toggled. How: This inverts the item's current vacation value.


		} : iteCurObj ) )


	};


	const draPicObj = { mode : selModStr, threshold : easThrNum, cadence : cadCurObj.cadence }; // What: Draft Picker Object. Why: EntEdiCom still expects a picker-shaped object to read mode/threshold/cadence off of, even though the real picker doesn't exist yet. How: No `id` -- deliberately, since draft items carry no pickerId either (both undefined), so EntEdiCom's own PIC_NAM_OBJ.aveEasFun(items, picDatObj.id) fallback still matches every draft item against this pseudo-picker's undefined id and averages them correctly, not a coincidence to "fix" by inventing ids here. No easeMin/easeMax here either, since EntEdiCom no longer reads those off the picker directly.


	const addDraFun = () => { // What: Add Draft Function. Why: Starting a brand-new draft item opens the same slot the edit flow uses, seeded with sensible defaults (including any staged tour prefill), then scrolls it into view. How: This bails out if another editor is already open, otherwise generates a fresh id, resolves the tour's own staged name/ease if one applies, then seeds and scrolls the new slot into view.


		if ( actNewStr || ediIteStr ) return; // What: One Editor Guard. Why: Only one item editor (new or existing) may be open at a time. How: This bails out if either a new draft or an existing edit is already in progress.



		setActCloStr( false ); // What: Stale Closing Clear Call. Why: A prior editor's own closing state must not carry over onto this fresh one. How: This clears any stale closing state left behind by whatever was open before.


		const newIdeStr = 'draft_' + Math.random().toString( 36 ).slice( 2, 8 ); // What: New Identifier String. Why: The new draft item needs a stable, unique-enough id before it's ever committed. How: This builds a short random suffix onto the conventional 'draft_' item-id prefix.

		const curBusObj = emlTouObj.get();                                       // What: Current Bus Object. Why: The synchronous read described above needs the bus's own live snapshot. How: This calls emlTouObj.get() directly. // What: Tour Prefill Read Note. Why: This reads straight off the bus (emlTouObj.get()), not the React-state touBusObj, since this fires as the NATIVE bubble-phase handler of the same click whose CAPTURE-phase handling just ran a picker-tour step's own run() (which sets itePreStr on the bus synchronously), but useEmlTouFun's subscriber-driven setState is batched and hasn't actually landed in this component's own render yet, so touBusObj here would still be the PREVIOUS render's snapshot, from before itePreStr was set. How: Reading the bus's own synchronous getter instead (the same fix reminders.jsx's own prefill already uses) is what actually lands the tour's staged name/ease on the item it creates.
		const curTouBoo = curBusObj.touPhaStr === 'tour' && curBusObj.itePreStr; // What: Current Tour Boolean. Why: Only an actively-running tour that staged a specific item name should override the generated default below. How: This checks both the bus's own phase and its itePreStr field.

		let newNamStr; // What: New Name String. Why: The actual name to seed the draft with depends on which branch below resolves it. How: This is declared here and assigned in exactly one of the two branches that follow.


		if ( curTouBoo ) { // What: Tour Name Branch. Why: A tour stages a specific name for its own walkthrough item (see the picker tour's own run()), rather than falling back to a generic default. How: This takes the staged name directly off the bus.


			newNamStr = curBusObj.itePreStr; // What: Tour Name Assign. Why: This is the actual staged value described above. How: This reads curBusObj.itePreStr.


		}

		else { // What: Generated Name Branch. Why: Outside a tour, a fresh item needs a sensible, non-colliding default name. How: This starts from "New item" and appends an incrementing number until it no longer collides with an existing name.


			const basNamStr = 'New item'; // What: Base Name String. Why: This is the starting point every generated name is built from. How: This is reused below both as the bare default and as the prefix for a numbered variant.

			let dupCouNum = 1; // What: Duplicate Count Number. Why: The loop below needs a running counter to append once the bare name collides. How: This starts at 1 and increments each time the candidate name still collides.


			newNamStr = basNamStr; // What: Candidate Name Seed. Why: The loop below needs a starting candidate to test. How: This starts as the bare basNamStr before any numbering is applied.


			const lowNamSet = new Set( pooIteArr.map( ( iteCurObj ) => iteCurObj.name.toLowerCase() ) ); // What: Lowercase Name Set. Why: The collision check must be case-insensitive. How: This lowercases every existing draft item's own name into a Set for fast lookup.


			while ( lowNamSet.has( newNamStr.toLowerCase() ) ) { // What: Collision Loop. Why: The candidate name must keep incrementing until it's genuinely unique. How: This appends the next dupCouNum onto basNamStr each time the current candidate still collides.


				dupCouNum++;                                 // What: Duplicate Count Increment. Why: Each collision tries the next number. How: This adds 1 to dupCouNum.
				newNamStr = `${ basNamStr } ${ dupCouNum }`; // What: Numbered Name Assignment. Why: A numbered suffix makes the name unique. How: This appends dupCouNum to basNamStr.


			}


		}



		const fulChaBoo = selModStr === 'ease-down' || ( curTouBoo && selModStr === 'ease-up' ); // What: Full Charge Boolean. Why: Ease Down items start fully charged (mirrors addPicFun's own initialValue), otherwise the editor would show a spent item needing a Refill it never needed; the tour's own Ease Up item is also given a full charge (like the rest of the sample pool) so the later generation demo step has something eligible to pick, but this doesn't apply to Weighted/Dynamic/Random tour samples, since those modes have no eligibility gate at all (value there is a weight boost, not a charge), so forcing 100 would just unfairly skew the new item's odds against its siblings for no reason.


		const easBanObj = curTouBoo && curBusObj.iteMinNum != null && curBusObj.iteMaxNum != null // What: Ease Band Object. Why: A tour can override the generic 7/14-day defEasObj for its own added item (e.g. a monthly-cadence sample's own item shouldn't look like a daily one). How: This uses the bus's own staged easeMin/easeMax when a tour supplied both, otherwise defEasObj.
			? { easeMin : curBusObj.iteMinNum, easeMax : curBusObj.iteMaxNum } // What: Tour Band Branch. Why: A tour can stage its own ease band for the added item. How: This uses the bus's itemEaseMin/itemEaseMax.
			: defEasObj;                                                       // What: Default Band Branch. Why: Every other add uses the generic defaults. How: This returns defEasObj.


		setPooIteArr( ( preIteArr ) => [ ...preIteArr, { // What: Seed Item Call. Why: The freshly-opened editor needs a complete, sensible item already sitting in pooIteArr to edit. How: This appends the new item with every field resolved above.


			id     : newIdeStr,                 // What: Id. Why: The pool item needs its own id. How: This uses newIdeStr.
			name   : newNamStr,                 // What: Name. Why: The item starts with its de-duplicated name. How: This uses newNamStr.
			value  : fulChaBoo ? easThrNum : 0, // What: Value. Why: An item that should start full begins at the threshold, otherwise at 0. How: This uses easThrNum when fulChaBoo, otherwise 0.
			weight : 1,                         // What: Weight. Why: Every item starts at the baseline weight. How: This is 1.

			...easBanObj // What: Ease Band Spread. Why: The item carries the tour's or the default drift band. How: This spreads in easeMin and easeMax.


		} ] );

		setActNewStr( newIdeStr ); // What: Open Editor Call. Why: This is the actual state change that shows the new-item editor. How: This writes newIdeStr into actNewStr.

		requestAnimationFrame( () => requestAnimationFrame( () => { // What: Scroll Into View Call. Why: The just-opened creation slot can be well out of view at the bottom of a long pool. How: This waits two animation frames for layout to settle, then scrolls the shared .main container just enough to bring the slot fully into view.


			const addWraEle = addWraRef.current;                         // What: Add Wrap Element. Why: The scroll calculation needs the actual DOM node, not just the ref object. How: This reads addWraRef.current once and reuses it below.
			const scrConEle = addWraEle && addWraEle.closest( '.main' ); // What: Scroll Container Element. Why: The shared scrollable container is what actually needs to move, not the slot itself. How: This walks up from addWraEle to the nearest .main ancestor.


			if ( !addWraEle || !scrConEle ) return; // What: Missing Element Guard. Why: Either element may not exist yet if this fires after an unrelated unmount. How: This bails out of the scroll calculation entirely when either is missing.



			const oveBelNum = addWraEle.getBoundingClientRect().bottom - scrConEle.getBoundingClientRect().bottom + 96; // What: Overflow Below Number. Why: This is how far below the visible fold the new slot actually sits, plus a small comfort margin. How: This subtracts the container's own bottom edge from the slot's own bottom edge.


			if ( oveBelNum > 0 ) scrConEle.scrollTo({ // What: Scroll Adjust Guard. Why: Only an actually-overflowing slot needs to be scrolled into view at all. How: This scrolls the container down by exactly the overflow amount.


				behavior : redMotFun() ? 'auto' : 'smooth', // What: Behavior. Why: A user who prefers reduced motion gets an instant jump instead of a glide. How: This picks 'auto' under reduced motion, otherwise 'smooth'.
				top      : scrConEle.scrollTop + oveBelNum  // What: Top. Why: The page scrolls just enough to reveal the editor's bottom edge. How: This adds oveBelNum to the current scroll.


			});


		}) );


	};


	const opeDraFun = ( tarIdeStr ) => { // What: Open Draft Function. Why: Opening an already-committed draft item's editor needs to snapshot it first (for staDraFun's own revert-on-switch below) and scroll it into view. How: This looks up the item, bails out if it's already gone, then opens the editor and scrolls it into view.


		const fouIteObj = pooIteArr.find( ( iteCurObj ) => iteCurObj.id === tarIdeStr ); // What: Found Item Object. Why: The editor needs the real, current draft item record to open against. How: This looks up tarIdeStr in pooIteArr.


		if ( !fouIteObj ) return; // What: Missing Item Guard. Why: A stale id (already deleted) must not open an editor with nothing to show. How: This bails out before touching any state.



		ediSnaRef.current = { ...fouIteObj }; // What: Snapshot Write. Why: staDraFun needs a snapshot of this exact item, taken right now, in case it later has to revert this edit to switch to a different one. How: This shallow-copies fouIteObj into ediSnaRef.

		setEdiIteStr( tarIdeStr ); // What: Open Editor Call. Why: This is the actual state change that shows the editor. How: This writes tarIdeStr into ediIteStr.

		requestAnimationFrame( () => requestAnimationFrame( () => { // What: Scroll Into View Call. Why: The editor renders in the same below-the-list slot, which can be well out of view from wherever in a long pool the Edit button that opened it was. How: This waits two animation frames for layout to settle, then scrolls the shared .main container just enough to bring the slot fully into view.


			const addWraEle = addWraRef.current;                         // What: Add Wrap Element. Why: The scroll calculation needs the actual DOM node, not just the ref object. How: This reads addWraRef.current once and reuses it below.
			const scrConEle = addWraEle && addWraEle.closest( '.main' ); // What: Scroll Container Element. Why: The shared scrollable container is what actually needs to move, not the slot itself. How: This walks up from addWraEle to the nearest .main ancestor.


			if ( !addWraEle || !scrConEle ) return; // What: Missing Element Guard. Why: Either element may not exist yet if this fires after an unrelated unmount. How: This bails out of the scroll calculation entirely when either is missing.



			const oveBelNum = addWraEle.getBoundingClientRect().bottom - scrConEle.getBoundingClientRect().bottom + 96; // What: Overflow Below Number. Why: This is how far below the visible fold the slot actually sits, plus a small comfort margin. How: This subtracts the container's own bottom edge from the slot's own bottom edge.


			if ( oveBelNum > 0 ) scrConEle.scrollTo({ // What: Scroll Adjust Guard. Why: Only an actually-overflowing slot needs to be scrolled into view at all. How: This scrolls the container down by exactly the overflow amount.


				behavior : redMotFun() ? 'auto' : 'smooth', // What: Behavior. Why: A user who prefers reduced motion gets an instant jump instead of a glide. How: This picks 'auto' under reduced motion, otherwise 'smooth'.
				top      : scrConEle.scrollTop + oveBelNum  // What: Top. Why: The page scrolls just enough to reveal the editor's bottom edge. How: This adds oveBelNum to the current scroll.


			});


		}) );


	};


	const staDraFun = ( tarIdeStr ) => { // What: Start Draft Function. Why: Switching straight from one open editor to another (or from the new-item form) needs to close whatever's currently open first, reverting it, before this edit can actually open. How: This closes an existing editor (with an explicit revert) or the new-item form, staging tarIdeStr to reopen once that closing animation finishes; otherwise it opens directly.


		if ( ediIteStr === tarIdeStr ) return; // What: Already Open Guard. Why: Re-clicking Edit on the exact same row that's already open should do nothing. How: This bails out when tarIdeStr matches the currently-open editor.



		if ( ediIteStr ) { // What: Other Editor Open Branch. Why: Another item's editor is already open and must be closed (with its own explicit revert) before this one can open. How: This reverts the currently-open item, stages tarIdeStr, and starts that editor's own closing animation.


			if ( ediSnaRef.current ) draActObj.revIteFun( ediIteStr, ediSnaRef.current ); // What: Revert Call Guard. Why: Only a genuine snapshot can be reverted to. How: This restores the currently-open item back to its pre-edit snapshot.



			penEdiRef.current = tarIdeStr; // What: Stage Reopen Call. Why: The requested edit must still open once the current one finishes closing. How: This stores tarIdeStr for the closing editor's own onAnimationEnd handler to pick up.

			setEdiCloBoo( true ); // What: Start Closing Call. Why: This is what actually plays the current editor's own out-animation. How: This flips ediCloBoo.



			return; // What: Early Return. Why: The requested edit must wait for the closing animation, not open immediately. How: This exits staDraFun without calling opeDraFun yet.


		}



		if ( actNewStr ) { // What: New Draft Open Branch. Why: A brand-new item's own form is in progress and must be closed (without saving) instead of silently no-oping. How: This stages tarIdeStr and starts the new-item form's own closing animation.


			penEdiRef.current = tarIdeStr; // What: Stage Reopen Call. Why: The requested edit must still open once the new-item form finishes closing. How: This stores tarIdeStr for the new-item wrap's own onAnimationEnd handler to pick up.

			setActCloStr( 'cancel' ); // What: Cancel New Call. Why: Switching away from an in-progress new item discards it rather than silently saving it. How: This starts the new-item wrap's own closing animation in its 'cancel' shape.



			return; // What: Early Return. Why: The requested edit must wait for the closing animation, not open immediately. How: This exits staDraFun without calling opeDraFun yet.


		}



		opeDraFun( tarIdeStr ); // What: Direct Open Call. Why: Neither another editor nor the new-item form was in the way, so the requested edit can open immediately. How: This calls opeDraFun with the same tarIdeStr.


	};


	React.useEffect( () => { // What: Reopen Tour Item Effect. Why: Back from a picker tour's own Step 12 (Create Picker) to Step 11 (Save this task item) needs that item's editor open again, since its own Save already committed it into pooIteArr (there's no separate "draft" vs "committed" state once saved, just actNewStr no longer pointing at it), so Step 11's own target has nothing left to click; there's no real DOM control left that would reverse this, which is why this needs a bus nonce at all. How: This reopens the SAME item, found by matching the tour's own itePreStr name (still sitting on the bus since nothing clears it until the whole tour closes), rather than creating a fresh one, preserving whatever the user actually edited in the earlier steps instead of resetting it.


		if ( !touBusObj.reoNonNum ) return; // What: No Bump Guard. Why: A fresh mount's own initial nonce value must not trigger a reopen. How: This bails out unless the nonce is genuinely truthy.



		const matIteObj = pooIteArr.find( ( iteCurObj ) => iteCurObj.name === touBusObj.itePreStr ); // What: Matched Item Object. Why: The exact item the tour walked the user through creating needs to be found again by name. How: This searches pooIteArr for an entry whose own name matches the bus's own staged itePreStr.


		if ( matIteObj ) { // What: Reopen Guard. Why: Only a genuinely-found match should be reopened. How: This clears any stale closing state and writes the matched item's own id into actNewStr.


			setActCloStr( false );        // What: Closing Clear Call. Why: The matched item's editor must not be mid-close. How: This resets actCloStr to false.
			setActNewStr( matIteObj.id ); // What: Active New Set Call. Why: The tour's prefilled item opens in the editor. How: This writes the matched item's id into actNewStr.


		}


		// eslint-disable-next-line react-hooks/exhaustive-deps -- What: Deliberate Dependency Omission. Why: The reopen must run only on a genuine nonce bump, so the values it reads fresh stay out of the array. How: This silences the react-hooks exhaustive-deps warning for the dependency array below.
	}, [ touBusObj.reoNonNum ] ); // What: Effect Dependency Array. Why: Only a genuine bump of this exact nonce should re-run this reopen. How: touBusObj.reoNonNum is the sole trigger; pooIteArr/touBusObj.itePreStr are read fresh from the closure each time it fires.


	const bacSteFun = () => { // What: Back Step Function. Why: Returning to Step 1 must not leave Step 2 stuck with a stale actNewStr (which would make + Add Item a no-op), so any in-progress item is discarded first. How: This disarms EntEdiCom's own deferred revert (else it would fire on the next macrotask and re-set actCloStr='cancel', auto-closing whatever gets added next), removes an in-progress item if there is one, then steps back.


		window.__editGuard.disFun(); // What: Edit Guard Disarm Call. Why: A deferred revert firing after this navigation would corrupt whatever item gets added next. How: This calls the shared global editor guard's own disarm method.

		if ( actNewStr ) { // What: Discard In-Progress Guard. Why: An unsaved in-progress item must not linger once the user navigates away from it. How: This removes it from pooIteArr and clears actNewStr, only if one was actually open.


			draActObj.delIteFun( actNewStr ); // What: Remove Draft Call. Why: The unfinished new item is discarded. How: This removes actNewStr from the draft pool.
			setActNewStr( null );             // What: Active New Clear Call. Why: No new item is being added anymore. How: This resets actNewStr to null.


		}



		setActCloStr( false ); // What: Closing Reset Call. Why: A stale closing flag must not carry over into Step 1. How: This resets actCloStr to false.

		setForSteNum( 1 ); // What: Step Back Call. Why: This is the actual navigation back to Step 1. How: This writes 1 into forSteNum.


	};



	const subForFun = () => { // What: Submit Form Function. Why: This is the actual create/save commit, gated on both steps' own readiness and a resolved name collision. How: This builds the shared payload shape, attaches a conditional (or detaches one, on edit), attaches the legacy ease summary fields (create only), then routes to onSavEdiFun or onCrePicFun.


		if ( !detReaBoo || ( !isaEdiBoo && !enoIteBoo ) ) return; // What: Not Ready Guard. Why: Neither flow can submit until Step 1's own fields are complete, and creating additionally needs at least 2 real items. How: This bails out unless both conditions hold for the active flow.



		if ( conAttBoo && conSelStr === 'new' && conColBoo ) return; // What: Name Collision Guard. Why: A colliding new-conditional name must surface its own error instead of silently submitting. How: This bails out of the submit while conColBoo holds, leaving conErrStr visible on the name field.



		const payForObj = { // What: Payload Form Object. Why: Both onCrePicFun and onSavEdiFun expect this exact shared shape. How: This gathers every Step 1 field that both flows always send.


			avoidDuplicates : avoDupBoo,                     // What: Avoid Duplicates. Why: The picker saves the duplicates toggle. How: This passes avoDupBoo.
			daysOfWeek      : runDowArr,                     // What: Days Of Week. Why: The picker saves its chosen run days. How: This passes runDowArr.
			group           : effGroStr,                     // What: Group. Why: The picker saves its chosen or newly-typed group. How: This passes effGroStr.
			includeInDaily  : incDaiBoo,                     // What: Include In Daily. Why: The store adds or removes the picker from the daily generator. How: This passes incDaiBoo.
			mode            : selModStr,                     // What: Mode. Why: The picker saves its chosen mode. How: This passes selModStr.
			name            : capStrFun( newNamStr.trim() ), // What: Name. Why: The picker saves a tidied, capitalized name. How: This trims newNamStr and capitalizes it.
			skipHolidays    : skiHolBoo,                     // What: Skip Holidays. Why: The picker saves the holiday toggle. How: This passes skiHolBoo.

			...cadCurObj // What: Cadence Spread. Why: Every cadence field the control produced is saved alongside. How: This spreads in cadCurObj.


		};


		if ( !isaEdiBoo ) payForObj.items = pooIteArr; // What: Items Attach Guard. Why: Only a fresh create actually needs to send a full items array; an edit's own items are managed elsewhere. How: This attaches pooIteArr to payForObj only while isaEdiBoo is false.



		if ( conAttBoo && conSelStr === 'new' ) { // What: Conditional Attach Note. Why: Create-new names are unique by validation above, so no silent reuse happens here; edit explicitly clears the field (conditionalId: null) when turned off, since unlike a fresh create, this can also DETACH one the picker already had, so there's no bare "just omit the field" default to fall back on. How: The three branches below cover attaching an existing conditional, attaching a fresh inline one, or explicitly detaching on edit.


			payForObj.newConditional = { // What: New Conditional Attach. Why: A freshly-created inline conditional needs its own draft shape sent through, under its own tidied name. How: This spreads conDraObj and overwrites its name with conTidStr (or a bare fallback).


				...conDraObj, // What: Conditional Draft Spread. Why: The new conditional keeps every field the inline editor set. How: This copies conDraObj.

				name : conTidStr || 'Conditional' // What: Name. Why: The saved conditional needs a tidy name, even if the field was left blank. How: This uses conTidStr, falling back to 'Conditional'.


			};


		}

		else if ( conAttBoo && conSelStr ) { // What: Existing Conditional Branch. Why: Attaching an existing conditional only needs its id. How: This sets conditionalId to conSelStr.


			payForObj.conditionalId = conSelStr; // What: Existing Conditional Attach. Why: Reusing an existing conditional only needs its own id sent through. How: This writes conSelStr directly onto payForObj.conditionalId.


		}

		else if ( isaEdiBoo ) { // What: Detach On Edit Branch. Why: Turning the attach toggle off while editing must clear the old attachment. How: This sets conditionalId to null.


			payForObj.conditionalId = null; // What: Conditional Detach. Why: Turning the toggle off while editing must actively clear whatever conditional was previously attached, not just omit the field. How: This writes an explicit null onto payForObj.conditionalId.


		}



		if ( isaEasBoo && !isaEdiBoo ) { // What: Legacy Ease Summary Guard. Why: Nothing reads picker.easeMin/easeMax anymore (pick(), the Data tab, and the item editor all compute a live per-picker average from the items themselves instead, see PIC_NAM_OBJ.aveEasFun), so this is kept only so store.js's addPicFun still has a value to accept; harmless dead data on the created picker otherwise. How: This is skipped for edit, since there's no items array here to compute a fresh average from, and the field is inert anyway.


			payForObj.easeMin = Math.min( ...pooIteArr.map( ( iteCurObj ) => iteCurObj.easeMin ?? defEasObj.easeMin ) ); // What: Legacy Ease Min Attach. Why: A summary value is still expected on the created payload. How: This takes the smallest easeMin across every committed item.

			payForObj.easeMax = Math.max( ...pooIteArr.map( ( iteCurObj ) => iteCurObj.easeMax ?? defEasObj.easeMax ) ); // What: Legacy Ease Max Attach. Why: A summary value is still expected on the created payload. How: This takes the largest easeMax across every committed item.


		}



		if ( isaEdiBoo ) onSavEdiFun( payForObj ); // What: Edit Route Branch. Why: An in-progress edit of an existing picker must reach the save flow. How: This calls onSavEdiFun with payForObj.

		else onCrePicFun( payForObj ); // What: Create Route Branch. Why: A brand-new picker must reach the create flow instead. How: This calls onCrePicFun with payForObj.


	};



	return (


		<div
			ref={ forWraRef }
			className='picker-view np-form'
		>{ /* What: Picker Form Div Element. Why: This is PicForCom's own root, holding the header, the step indicator (create only), and whichever step's own content is active. How: This wraps every piece of the create/edit form. */ }


			<header className='picker-h'>{ /* What: Picker Header Element. Why: The kicker and heading read as one title block. How: This wraps those two pieces. */ }


				<div>{ /* What: Header Text Div Element. Why: The form's kicker and title belong together. How: This wraps the two lines below. */ }


					<div className='kicker'>{ isaEdiBoo ? 'Editing' : 'New picker' }</div>{ /* What: Kicker Div Element. Why: A small eyebrow label orients the reader before the heading below. How: This renders "Editing" or "New picker" depending on isaEdiBoo. */ }



					<h2 className='picker-title'>{ isaEdiBoo ? ( newNamStr.trim() || 'Editing picker' ) : 'Create a picker' }</h2>{ /* What: Title Heading Element. Why: This form's own main heading should reflect whatever the user has typed so far while editing. How: This shows the live-typed name (or a fallback) while editing, otherwise a fixed create-mode heading. */ }


				</div>


			</header>

			{ !isaEdiBoo && ( // What: Step Indicator Check. Why: Only the create flow ever has a second step to indicate. How: This renders the whole step indicator only while isaEdiBoo is false. // What: Edit Steps Design Note. Why: Edit reuses only the Details step, since this picker's items already exist and are edited via the Data tab or PicVieCom's own live pool instead. How: There's no Items step to switch to here, so the step indicator below is skipped entirely while isaEdiBoo is true.


				<div className='np-steps'>{ /* What: Steps Div Element. Why: Details and Items need a shared two-step indicator row. How: This wraps both step buttons and the connecting line between them. */ }


					<button
						className={ ` np-step   ob-picker-details   ${ forSteNum === 1 ? 'is-on' : 'is-done' } ` }
						type='button'
						onClick={ () => setForSteNum( 1 ) }
					>{ /* What: Details Step Button Element. Why: The user needs a way to jump back to Step 1 at any time. How: This marks itself "is-on" while forSteNum is 1, otherwise "is-done", and always allows navigating back. */ }


						<span className='np-step-num'>{ /* What: Step Number Span Element. Why: A completed step shows a checkmark instead of its own number. How: This renders a check icon once forSteNum has advanced past 1, otherwise the literal "1". */ }


							{ forSteNum > 1 ? ( // What: Step Done Check. Why: A completed Details step shows a checkmark in place of its number. How: This renders the check icon once forSteNum is past 1.


								<IcoSvgCom
									icoNamStr='cheEle'
									sizValNum={ 12 }
								/> // What: Icon Svg Component. Why: The finished step needs a recognizable checkmark. How: This renders the 'cheEle' icon at a fixed size.


							) : ( // What: Step Number Branch. Why: An unfinished step shows its own number. How: This renders the else branch while forSteNum is 1.


								'1' // What: Step Number Literal. Why: This is the Details step's own position. How: This renders the literal text "1".


							) }


						</span>

						<span className='np-step-lbl'>Details</span>{ /* What: Step Label Span Element. Why: The step needs a readable name alongside its number. How: This renders the fixed literal text. */ }


					</button>

					<span className='np-step-line' />{ /* What: Step Line Span Element. Why: The two step buttons need a visible connecting line between them. How: This is a purely decorative element, styled entirely via CSS. */ }

					<button
						className={ ` np-step   ${ forSteNum === 2 ? 'is-on' : '' } ` }
						type='button'
						disabled={ !detReaBoo }
						onClick={ () => detReaBoo && setForSteNum( 2 ) }
					>{ /* What: Items Step Button Element. Why: The user needs a way to jump to Step 2 once it's actually reachable. How: This stays disabled until detReaBoo is true, and marks itself "is-on" while forSteNum is 2. */ }


						<span className='np-step-num'>2</span>{ /* What: Step Number Span Element. Why: The step needs its own visible number. How: This renders the literal "2". */ }

						<span className='np-step-lbl'>Items</span>{ /* What: Step Label Span Element. Why: The step needs a readable name alongside its number. How: This renders the fixed literal text. */ }


					</button>


				</div>


			) }

			{ forSteNum === 1 ? ( // What: Step One Check. Why: Exactly one step's own content shows at a time. How: This renders the Details step below while forSteNum is 1, otherwise the Items step further down.


				<div
					key='np-step1'
					className='tab-fade'
				>{ /* What: Step One Fade Div Element. Why: Switching steps should play a fade transition, and React needs a stable key to treat each step as a distinct mounted instance. How: This wraps the whole Details step's own fields and footer. */ }


					<p className='picker-hint'>{ /* What: Intro Hint Paragraph Element. Why: A first-time user needs a plain-language orientation before the fields below. How: This shows a slightly different phrasing for edit versus create. */ }


						{ isaEdiBoo // What: Edit Mode Check. Why: Editing and creating need different intro text. How: This picks one of the two paragraphs below based on isaEdiBoo.


							? <React.Fragment>Pickers are the heart of the Ease My Life app. They are small machines that chooses one item for you from a list, e.g. a chore to do, a meal to make, a way to wind down. Adjust its name, group, how it should pick and when it should run below.</React.Fragment> // What: Editing Intro Phrase. Why: An existing picker's own intro reads slightly differently since it's being adjusted rather than created for the first time. How: This renders while isaEdiBoo is true.

							: <React.Fragment>Pickers are the heart of the Ease My Life app. They are small machines that chooses one item for you from a list, e.g. a chore to do, a meal to make, a way to wind down. Give it a name, attach a group, choose how it should pick and when it should run. You&rsquo;ll fill its list of items in the next step.</React.Fragment> // What: Create Intro Phrase. Why: A brand-new picker's own intro needs to set up the next Items step too. How: This renders while isaEdiBoo is false.


						}


					</p>


					<div className='np-fields'>{ /* What: Fields Div Element. Why: Every Details field (Name, Group, Picker type, conditional attach, daily schedule) belongs in one shared column. How: This wraps every np-field block below. */ }


						<div className='np-field'>{ /* What: Name Field Div Element. Why: The label, its help text, and the input itself form one field unit. How: This wraps those three pieces. */ }


							<label
								className='np-label'
								htmlFor='np-name'
							>Name</label>{ /* What: Name Label Element. Why: The input below needs an associated, readable label. How: This is linked to the input via the shared 'np-name' id. */ }

							<p className='np-help'>What you&rsquo;ll see on the picker bar above and on your todo list cards. Short and plain works best, e.g. &ldquo;Daily Chore&rdquo;, &ldquo;Dinner&rdquo;, &ldquo;Coffee Creamer&rdquo;.</p>{ /* What: Name Help Paragraph Element. Why: A first-time user needs guidance on what makes a good picker name. How: This renders a fixed explanatory sentence with a couple of worked examples. */ }

							<input
								ref={ namInpRef }
								id='np-name'
								className='np-input'
								type='text'
								maxLength={ 40 }
								placeholder='e.g. Daily Chore'
								autoComplete='off'
								value={ newNamStr }
								onChange={ ( chaEveObj ) => setNewNamStr( chaEveObj.target.value ) }
							/>{ /* What: Name Input Element. Why: This is the actual live-typed name field. How: This writes into newNamStr on every change. */ }


						</div>

						<div className='np-field'>{ /* What: Group Field Div Element. Why: The label, help text, group chips, and the inline new-group input form one field unit. How: This wraps those pieces. */ }


							<span className='np-label'>Group</span>{ /* What: Group Label Span Element. Why: The controls below need a readable label. How: This renders the literal word "Group". */ }

							<p className='np-help'>Pickers are clustered into groups on your todo list, like &ldquo;Chores&rdquo; or &ldquo;Food&rdquo;, so that related picks sit together. You may choose an existing group or create a new one.</p>{ /* What: Group Help Paragraph Element. Why: A first-time user needs to understand what a group actually does before choosing one. How: This renders a fixed explanatory sentence. */ }

							<div className='np-groups'>{ /* What: Groups Div Element. Why: Every existing group chip plus the "New Group" chip sit in one row. How: This maps exiGroArr to one chip each, then appends the fixed "New Group" chip. */ }


								{ exiGroArr.map( ( curGroStr ) => ( // What: Group Chip List Render. Why: Every existing group needs its own selectable chip. How: This maps exiGroArr to one button per curGroStr.


									<button
										key={ curGroStr }
										className={ ` np-chip   ${ !addGroBoo && selGroStr === curGroStr ? 'is-on' : '' } ` }
										type='button'
										onClick={ () => { // What: On Click Handler. Why: Tapping an existing group selects it. How: This closes the new-group sub-form and selects this chip's group.


											setAddGroBoo( false );     // What: Add Group Close Call. Why: Picking an existing group closes the new-group sub-form. How: This resets addGroBoo to false.
											setSelGroStr( curGroStr ); // What: Group Select Call. Why: This chip's group becomes the picker's group. How: This writes curGroStr into selGroStr.


										} }
									>{ /* What: Group Chip Button Element. Why: Tapping an existing group chip should select it and close the new-group sub-form. How: This clears addGroBoo and writes curGroStr into selGroStr. */ }


										{ curGroStr }{ /* What: Chip Name Expression. Why: Every group chip needs its own visible label. How: This renders curGroStr. */ }


									</button>


								)) }

								<button
									className={ ` np-chip   np-chip--new   ${ addGroBoo ? 'is-on' : '' } ` }
									type='button'
									onClick={ () => setAddGroBoo( true ) }
								>{ /* What: New Group Chip Button Element. Why: The user needs an explicit way to open the inline new-group sub-form. How: This flips addGroBoo true. */ }


									<IcoSvgCom
										icoNamStr='pluEle'
										sizValNum={ 13 }
									/>{ /* What: Icon Svg Component. Why: The button needs a recognizable "add" glyph beside its own label. How: This renders the 'pluEle' icon at a fixed size. */ } New Group


								</button>


							</div>

							<ColDisCom open={ addGroBoo }>{ /* What: Collapse Disclosure Component. Why: The new-group input only needs to exist while addGroBoo is actually on. How: This animates the input open/closed around that boolean. */ }


								<input
									className='np-input np-input--sm'
									type='text'
									autoFocus
									maxLength={ 30 }
									placeholder='Name the new group'
									autoComplete='off'
									value={ newGroStr }
									aria-label='New group name'
									onChange={ ( chaEveObj ) => setNewGroStr( chaEveObj.target.value ) }
								/>{ /* What: New Group Input Element. Why: A brand-new group needs its own typed name. How: This is a controlled text input committing on Enter or the checkmark. */ }


							</ColDisCom>


						</div>

						<fieldset className='np-field'>{ /* What: Mode Field Fieldset Element. Why: The picker-type radio group needs its own labelled fieldset. How: This wraps the legend, help text, and the radio list below. */ }


							<legend className='np-label'>Picker type</legend>{ /* What: Mode Legend Element. Why: A fieldset needs its own accessible legend. How: This renders the literal text "Picker type". */ }

							<p className='np-help'>This is the ruleset that the picker follows each time it runs. &ldquo;Truly Random&rdquo; is the simplest where every item has an equal chance. The others nudge the odds in different ways. Not sure? We recommend the Dynamic Weighted type but you can change a picker&rsquo;s type at any time.</p>{ /* What: Mode Help Paragraph Element. Why: A first-time user needs to understand what a "mode" even means before picking one. How: This renders a fixed explanatory sentence with a recommendation. */ }

							<div className='mode-radio'>{ /* What: Mode Radio Div Element. Why: Every mode in SED_NAM_OBJ.MOD_DEF_OBJ needs its own selectable radio row. How: This maps Object.entries(SED_NAM_OBJ.MOD_DEF_OBJ) to one label per entry. */ }


								{ Object.entries( SED_NAM_OBJ.MOD_DEF_OBJ ).map( ( [ modKeyStr, modInfObj ] ) => ( // What: Mode Option List Render. Why: The picker's own mode choice must be built from the shared SED_NAM_OBJ.MOD_DEF_OBJ table, not hardcoded. How: This maps each [key, info] pair to one radio label.


									<label
										key={ modKeyStr }
										className={ ` mode-opt   ${ selModStr === modKeyStr ? 'is-on' : '' } ` }
										data-mode={ modKeyStr }
									>{ /* What: Mode Option Label Element. Why: The radio input and its own name/hint text must all be one clickable label. How: This wraps the radio input and its description block. */ }


										<input
											name='np-mode'
											type='radio'
											checked={ selModStr === modKeyStr }
											onChange={ () => setSelModStr( modKeyStr ) }
										/>{ /* What: Mode Radio Input Element. Why: This is the actual selectable control. How: This is checked when selModStr matches modKeyStr, and selects it on change. */ }

										<div>{ /* What: Mode Text Div Element. Why: The mode's own name and hint text need to sit beside the radio input. How: This wraps mode-opt-name and mode-opt-hint. */ }


											<div className='mode-opt-name'>{ modInfObj.labStr }</div>{ /* What: Mode Name Div Element. Why: The mode needs its own readable name. How: This renders modInfObj.labStr. */ }

											{ Array.isArray( modInfObj.hinArr ) // What: Hint Content Check. Why: A mode's own hint can be one paragraph or several. How: This maps every paragraph when hint is an array, otherwise renders the single hint.


												? modInfObj.hinArr.map( ( parTexStr, parIndNum ) => ( // What: Multi-Paragraph Hint Render. Why: Some modes explain themselves across more than one short paragraph. How: This maps modInfObj.hinArr to one div per entry when it's an array.


													<div
														key={ parIndNum }
														className='mode-opt-hint'
													>{ parTexStr }</div> // What: Hint Paragraph Element. Why: Each paragraph renders as its own hint line. How: This renders parTexStr, keyed by its index.


												) )

												: <div className='mode-opt-hint'>{ modInfObj.hinArr }</div> // What: Single-Paragraph Hint Render. Why: Most modes only need one short explanation. How: This renders modInfObj.hinArr directly when it's a plain string.


											}


										</div>


									</label>


								)) }


							</div>


						</fieldset>

						<div className='np-field np-cond'>{ /* What: Conditional Field Div Element. Why: The attach-a-conditional toggle and its own collapsible content form one field unit. How: This wraps np-field--toggle and the ColDisCom below it. */ }


							<div className='np-field--toggle'>{ /* What: Toggle Div Element. Why: The label/help text block and the switch control sit side by side. How: This wraps np-toggle-text and the switch button. */ }


								<div className='np-toggle-text'>{ /* What: Toggle Text Div Element. Why: The label and its two help paragraphs read as one block. How: This wraps those three pieces. */ }


									<span className='np-label'>Attach a conditional</span>{ /* What: Conditional Label Span Element. Why: The toggle below needs a readable label. How: This renders the literal text. */ }

									<p className='np-help'>Conditionals can be attached to a picker that will determine whether a picker should be run on any given day during the auto generator phase for the Today page. Run eligibility can be determined using the same rules that the pickers use, e.g. Truly Random, Weighted, Dynamic Weighted, Ease Up and Ease Down.</p>{ /* What: Conditional Help Paragraph Element. Why: A first-time user needs to understand what a conditional even does. How: This renders a fixed explanatory sentence. */ }

									<p className='np-help'>Example: You have a Daily Chore picker that you attach a Weighted conditional to in order to determine whether a Day Off should should be triggered and therefore no chores should be chosen for that day.</p>{ /* What: Conditional Example Paragraph Element. Why: A concrete example lands faster than the abstract explanation above alone. How: This renders a fixed worked example sentence. */ }


								</div>

								<button
									className={ ` switch   ${ conAttBoo ? 'is-on' : '' } ` }
									type='button'
									role='switch'
									aria-checked={ conAttBoo }
									aria-label='Attach a conditional'
									onClick={ () => setConAttBoo( ( preValBoo ) => !preValBoo ) }
								>{ /* What: Conditional Switch Button Element. Why: This is the actual on/off control for the conditional attachment. How: This flips conAttBoo on click. */ }


									<i />{ /* What: Switch Dot Element. Why: This is the switch's own purely decorative sliding knob. How: This renders empty, positioned entirely via CSS off the "is-on" class on its parent button. */ }


								</button>


							</div>

							<ColDisCom open={ conAttBoo }>{ /* What: Collapse Disclosure Component. Why: The whole conditional-attach block only needs to exist while conAttBoo is actually on. How: This animates cnd-attach open/closed around that boolean. */ }


								<div className='cnd-attach'>{ /* What: Conditional Attach Div Element. Why: The pill rail and the inline new-conditional editor form one block. How: This wraps cnd-rail and the ColDisCom around CodConCom. */ }


									<div
										ref={ raiCalFun }
										className='cnd-rail picker-groups at-start at-end'
									>{ /* What: Conditional Rail Div Element. Why: Every existing conditional plus the "Add New" pill need a horizontally-scrolling rail. How: This wraps one pill per sorted entry in conObjArr, then the fixed "Add New Conditional" pill. */ }


										{ [ ...conObjArr ].sort( ( conOneObj, conTwoObj ) => { // What: Sorted Conditional List Render. Why: The rail needs a stable order with the active selection pinned to the front. How: This sorts alphabetically, except a or b matching conSelStr is forced to the very front. // What: Conditional Sort Design Note. Why: The rail reads alphabetically, except the currently-selected conditional (once the user has picked one) pins to the front. How: This is the same "selected stays first" convention as the Data tab's own rail.


											if ( conOneObj.id === conSelStr ) return -1; // What: First Pinned Guard. Why: The currently-selected conditional must sort before everything else. How: This returns -1 whenever conOneObj is the selection.



											if ( conTwoObj.id === conSelStr ) return 1; // What: Second Pinned Guard. Why: Same reasoning as above, for the other comparison side. How: This returns 1 whenever conTwoObj is the selection.



											return conOneObj.name.localeCompare( conTwoObj.name ); // What: Alphabetical Fallback Return. Why: Every other pair sorts by plain alphabetical name. How: This delegates to String.localeCompare.


										} ).map( ( curConObj ) => (


											<button
												key={ curConObj.id }
												className={ ` cnd-pill   ${ conSelStr === curConObj.id ? 'is-on' : '' } ` }
												type='button'
												onClick={ () => setConSelStr( curConObj.id ) }
											>{ /* What: Conditional Pill Button Element. Why: Every existing conditional needs its own selectable pill showing its name and mode. How: This selects curConObj.id on click. */ }


												<span className='cnd-pill-name'>{ curConObj.name }</span>{ /* What: Pill Name Span Element. Why: The pill needs its own readable name. How: This renders curConObj.name. */ }

												<span className='cnd-pill-mode'>{ ( SED_NAM_OBJ.MOD_DEF_OBJ[ curConObj.mode ] || {} ).labStr || curConObj.mode }</span>{ /* What: Pill Mode Span Element. Why: The pill also needs to show which mode the conditional itself runs under. How: This looks up the mode's own label in SED_NAM_OBJ.MOD_DEF_OBJ, falling back to the raw mode string. */ }


											</button>


										)) }

										<button
											className={ ` cnd-pill   cnd-pill--new   ${ conSelStr === 'new' ? 'is-on' : '' } ` }
											type='button'
											onClick={ () => { // What: On Click Handler. Why: Tapping New opens the inline conditional editor with a fresh draft. How: This selects 'new' and seeds conDraObj.


												setConSelStr( 'new' );                                                                           // What: New Conditional Select Call. Why: The new-conditional pill becomes the selected one. How: This writes 'new' into conSelStr.
												setConDraObj( conDraFun( newNamStr.trim(), conObjArr.map( ( conCurObj ) => conCurObj.name ) ) ); // What: Conditional Draft Seed Call. Why: The inline editor needs a sensible starting draft whose name won't collide. How: This builds one from the picker's name and every existing conditional name.


											} }
										>{ /* What: New Conditional Pill Button Element. Why: The user needs an explicit way to open the inline new-conditional editor. How: This selects the 'new' pill and seeds conDraObj from the shared default, pre-filled with this picker's own name. */ }


											<IcoSvgCom
												icoNamStr='pluEle'
												sizValNum={ 16 }
											/>{ /* What: Icon Svg Component. Why: The new-conditional pill needs a recognizable "add" glyph. How: This renders the 'pluEle' icon at a fixed size. */ }

											<span className='cnd-pill-name'>Add New Conditional</span>{ /* What: Pill Name Span Element. Why: The new-conditional pill needs its own visible label. How: This renders the literal text "Add New Conditional". */ }


										</button>


									</div>

									<ColDisCom open={ conSelStr === 'new' }>{ /* What: Collapse Disclosure Component. Why: The inline new-conditional editor only needs to exist while conSelStr is actually 'new'. How: This animates CodConCom open/closed around that check. */ }


										<CodConCom
											conDraObj={ conDraObj }
											namErrStr={ conErrStr }
											onChange={ setConDraObj }
										/>{ /* What: Conditional Control Component. Why: A new inline conditional is edited through the same control the Data tab uses. How: This is passed the draft and its own name error. */ }


									</ColDisCom>


								</div>


							</ColDisCom>


						</div>

						<div className='np-field np-daily-group'>{ /* What: Daily Field Div Element. Why: The daily-generator toggle and its own collapsible schedule content form one field unit. How: This wraps np-field--toggle and the ColDisCom below it. */ }


							<div className='np-field--toggle'>{ /* What: Toggle Div Element. Why: The label/help text block and the switch control sit side by side. How: This wraps np-toggle-text and the switch button. */ }


								<div className='np-toggle-text'>{ /* What: Toggle Text Div Element. Why: The label and its own live-updating help text read as one block. How: This wraps those two pieces. */ }


									<label
										className='np-label'
										htmlFor='np-daily'
									>Include in the daily generator</label>{ /* What: Daily Label Element. Why: The switch below needs an associated, readable label. How: This is linked to the switch via the shared 'np-daily' id. */ }

									<p
										key={ incDaiBoo ? 'on' : 'off' }
										className='np-help set-sub-fade'
									>{ /* What: Daily Help Paragraph Element. Why: The user should immediately see the practical consequence of the toggle's own current state. How: This is re-keyed by incDaiBoo so the text cross-fades on every change. */ }


										{ incDaiBoo // What: Daily Membership Check. Why: The explanation depends on whether the picker joins the daily generator. How: This picks one of the two phrases below based on incDaiBoo.


											? <React.Fragment>This picker <strong>will run</strong> automatically as part of your daily list or whenever you tap Regenerate in the Today tab.</React.Fragment> // What: Daily Enabled Phrase. Why: The daily-generator note needs its own live wording for the enabled state. How: This renders while incDaiBoo is true.

											: <React.Fragment>This picker <strong>will not run</strong> automatically, but you can still run it manually from this tab.</React.Fragment> // What: Daily Disabled Phrase. Why: The daily-generator note needs its own live wording for the disabled state. How: This renders while incDaiBoo is false.


										}


									</p>


								</div>

								<button
									id='np-daily'
									className={ ` switch   ${ incDaiBoo ? 'is-on' : '' } ` }
									type='button'
									role='switch'
									aria-checked={ incDaiBoo }
									aria-label='Include in the daily generator'
									onClick={ () => { // What: On Click Handler. Why: The daily switch should also let the schedule scroll into view. How: This marks the toggle as user-driven, then flips incDaiBoo.


										daiTogRef.current = true;                    // What: Daily Toggled Mark. Why: The schedule's scroll-into-view should only follow a real user toggle. How: This flags daiTogRef.
										setIncDaiBoo( ( preValBoo ) => !preValBoo ); // What: Daily Toggle Call. Why: This is the actual daily-generator switch. How: This flips incDaiBoo.


									} }
								>{ /* What: Daily Switch Button Element. Why: This is the actual on/off control for daily-generator membership. How: This marks daiTogRef true (so the reveal effect above knows this was a genuine user toggle) and flips incDaiBoo. */ }


									<i />{ /* What: Switch Dot Element. Why: This is the switch's own purely decorative sliding knob. How: This renders empty, positioned entirely via CSS off the "is-on" class on its parent button. */ }


								</button>


							</div>

							<ColDisCom open={ incDaiBoo }>{ /* What: Collapse Disclosure Component. Why: The whole schedule block only needs to exist while incDaiBoo is actually on. How: This animates np-sched open/closed around that boolean. */ }


								<div
									ref={ daiBloRef }
									className='np-sched np-daily-anim'
								>{ /* What: Schedule Div Element. Why: The cadence control, the weekday picker, and the two schedule toggles form one collapsible block. How: This wraps np-sched-block/np-sched-toggle sections below. */ }


									<div className='np-sched-block'>{ /* What: Cadence Block Div Element. Why: The shared cadence editor needs its own labelled block. How: This wraps a single CadConCom, wired to cadCurObj. */ }


										<CadConCom
											value={ cadCurObj }
											onChange={ ( patCadObj ) => setCadCurObj( ( preCadObj ) => CAD_NAM_OBJ.norCadFun({ ...preCadObj, ...patCadObj }) ) }
										/>{ /* What: Cadence Control Component. Why: The schedule's own cadence is edited through the shared cadence control. How: This normalizes every patch into cadCurObj. */ }


									</div>

									<div className='np-sched-block'>{ /* What: Days Block Div Element. Why: The weekday picker and its own presets form one block. How: This wraps the label, help text, chips, and preset buttons below. */ }


										<span className='np-label'>Which days?</span>{ /* What: Days Label Span Element. Why: The weekday picker below needs a readable label. How: This renders the literal text. */ }

										<p className='np-help'>Pick the days that this picker is allowed to run on. Tap a day to turn it off. This is handy for things like chores, that you&rsquo;d rather not see on weekends.</p>{ /* What: Days Help Paragraph Element. Why: A first-time user needs to understand what tapping a day chip actually does. How: This renders a fixed explanatory sentence. */ }

										<div className='np-sched-row'>{ /* What: Schedule Row Div Element. Why: The weekday chips and their preset shortcuts sit side by side. How: This wraps WeeChiCom and np-sched-presets. */ }


											<WeeChiCom
												locDayNum={ locDowNum }
												locTipStr={ locDowNum === null ? '' : CAD_NAM_OBJ.locTipFun( locDowNum, 'On which day?' ) }
												value={ runDowArr }
												onChange={ setRunDowArr }
											/>{ /* What: Weekday Chips Component. Why: The user needs a direct way to toggle individual weekdays on or off. How: This is passed runDowArr and locDowNum so a weekly cadence's own anchor day can't be turned off here. */ }

											<div className='np-sched-presets'>{ /* What: Presets Div Element. Why: Three common day patterns deserve one-tap shortcuts instead of manual chip-tapping every time. How: This wraps the Every day/Weekdays/Weekends buttons. */ }


												<button
													className='np-preset'
													type='button'
													onClick={ () => setRunDowArr( witLocFun( [ 0, 1, 2, 3, 4, 5, 6 ] ) ) }
												>Every day</button>{ /* What: Every Day Preset Button Element. Why: This is the fastest way to select every day at once. How: This calls witLocFun with the full week, keeping any locked anchor day intact. */ }

												<button
													className='np-preset'
													type='button'
													onClick={ () => setRunDowArr( witLocFun( [ 1, 2, 3, 4, 5 ] ) ) }
												>Weekdays</button>{ /* What: Weekdays Preset Button Element. Why: This is a common one-tap pattern for chore-like pickers. How: This calls witLocFun with Monday through Friday. */ }

												<button
													className='np-preset'
													type='button'
													onClick={ () => setRunDowArr( witLocFun( [ 0, 6 ] ) ) }
												>Weekends</button>{ /* What: Weekends Preset Button Element. Why: This is the inverse common one-tap pattern. How: This calls witLocFun with Saturday and Sunday. */ }


											</div>


										</div>


									</div>

									<div className='np-sched-toggle'>{ /* What: Skip Holidays Toggle Div Element. Why: The label/help text block and its own switch sit side by side. How: This wraps np-toggle-text and the switch button. */ }


										<div className='np-toggle-text'>{ /* What: Toggle Text Div Element. Why: The toggle's own label and live explanation belong together. How: This wraps the label and sub text below. */ }


											<label
												className='np-label'
												htmlFor='np-skiphol'
											>Skip on holidays</label>{ /* What: Skip Holidays Label Element. Why: The switch below needs an associated, readable label. How: This is linked to the switch via the shared 'np-skiphol' id. */ }

											<p
												key={ skiHolBoo ? 'on' : 'off' }
												className='np-help set-sub-fade'
											>{ /* What: Skip Holidays Help Paragraph Element. Why: The user should immediately see the practical consequence of the toggle's own current state. How: This is re-keyed by skiHolBoo so the text cross-fades on every change. */ }


												{ skiHolBoo // What: Skip Holidays Check. Why: The explanation depends on the holiday setting. How: This picks one of the two phrases below based on skiHolBoo.


													? <React.Fragment>This picker <strong>will not run</strong> on major U.S. holidays. You can edit which days count as holidays, or even add your own, on the Settings page.</React.Fragment> // What: Holidays Skip Phrase. Why: The holiday note needs its own live wording for the skip-enabled state. How: This renders while skiHolBoo is true.

													: <React.Fragment>This picker <strong>will always run</strong>, even on major U.S. holidays.</React.Fragment> // What: Holidays Run Phrase. Why: The holiday note needs its own live wording for the always-run state. How: This renders while skiHolBoo is false.


												}


											</p>


										</div>

										<button
											id='np-skiphol'
											className={ ` switch   ${ skiHolBoo ? 'is-on' : '' } ` }
											type='button'
											role='switch'
											aria-checked={ skiHolBoo }
											aria-label='Skip on holidays'
											onClick={ () => setSkiHolBoo( ( preValBoo ) => !preValBoo ) }
										>{ /* What: Holiday Switch Button Element. Why: This is the actual on/off control for skipping holidays. How: This flips skiHolBoo on click. */ }


											<i />{ /* What: Switch Dot Element. Why: This is the switch's own purely decorative sliding knob. How: This renders empty, positioned entirely via CSS off the "is-on" class on its parent button. */ }


										</button>


									</div>

									<div className='np-sched-toggle'>{ /* What: Avoid Duplicates Toggle Div Element. Why: The label/help text block and its own switch sit side by side. How: This wraps np-toggle-text and the switch button. */ }


										<div className='np-toggle-text'>{ /* What: Toggle Text Div Element. Why: The toggle's own label and live explanation belong together. How: This wraps the label and sub text below. */ }


											<label
												className='np-label'
												htmlFor='np-avoiddupes'
											>Avoid duplicate items</label>{ /* What: Avoid Duplicates Label Element. Why: The switch below needs an associated, readable label. How: This is linked to the switch via the shared 'np-avoiddupes' id. */ }

											<p
												key={ avoDupBoo ? 'on' : 'off' }
												className='np-help set-sub-fade'
											>{ /* What: Avoid Duplicates Help Paragraph Element. Why: The user should immediately see the practical consequence of the toggle's own current state. How: This is re-keyed by avoDupBoo so the text cross-fades on every change. */ }


												{ avoDupBoo // What: Avoid Duplicates Check. Why: The explanation depends on the duplicates setting. How: This picks one of the two phrases below based on avoDupBoo.


													? <React.Fragment>This picker <strong>won&rsquo;t pick</strong> an item whose name is already on today&rsquo;s todo list.</React.Fragment> // What: Avoid Duplicates On Phrase. Why: The duplicate-avoidance note needs its own live wording for the enabled state. How: This renders while avoDupBoo is true.

													: <React.Fragment>This picker <strong>may pick</strong> an item even if its name is already on today&rsquo;s todo list.</React.Fragment> // What: Avoid Duplicates Off Phrase. Why: The duplicate-avoidance note needs its own live wording for the disabled state. How: This renders while avoDupBoo is false.


												}


											</p>


										</div>

										<button
											id='np-avoiddupes'
											className={ ` switch   ${ avoDupBoo ? 'is-on' : '' } ` }
											type='button'
											role='switch'
											aria-checked={ avoDupBoo }
											aria-label='Avoid duplicate items'
											onClick={ () => setAvoDupBoo( ( preValBoo ) => !preValBoo ) }
										>{ /* What: Duplicates Switch Button Element. Why: This is the actual on/off control for avoiding duplicate items. How: This flips avoDupBoo on click. */ }


											<i />{ /* What: Switch Dot Element. Why: This is the switch's own purely decorative sliding knob. How: This renders empty, positioned entirely via CSS off the "is-on" class on its parent button. */ }


										</button>


									</div>


								</div>


							</ColDisCom>


						</div>


					</div>

					<div className='np-footer np-footer--step1'>{ /* What: Footer Div Element. Why: The step's own guidance note and its Cancel/Next actions sit in one footer row. How: This wraps np-footer-note and np-footer-actions. */ }


						<div className='np-footer-note'>{ /* What: Footer Note Div Element. Why: The Step 1 footer explains what's still missing before Next works. How: This renders the note text below. */ }


							{ ( () => { // What: Footer Note Render. Why: The exact guidance sentence depends on which required field (if any) is still missing, and whether this is a create or an edit. How: This checks name/group completeness first, branching separately for edit versus create phrasing.


								const neeNamBoo = !newNamStr.trim(); // What: Need Name Boolean. Why: The guidance text needs to know specifically whether the name field is the one still missing. How: This is true whenever the trimmed name is empty.
								const neeGroBoo = !effGroStr;        // What: Need Group Boolean. Why: The guidance text needs to know specifically whether the group field is the one still missing. How: This is true whenever effGroStr resolves to nothing.


								if ( isaEdiBoo ) { // What: Edit Guidance Branch. Why: An edit's own missing-field wording differs slightly from create's. How: This covers the (ordinarily unreachable, since an existing picker already has both) case of the user clearing either field while editing.


									if ( neeNamBoo && neeGroBoo ) return 'A picker name and group are both required.'; // What: Both Missing Return. Why: Both fields being blank needs its own combined sentence. How: This is the first, most specific case checked.



									if ( neeNamBoo ) return 'A picker name is required.'; // What: Name Missing Return. Why: Only the name being blank needs its own sentence. How: This is checked once the combined case above is ruled out.



									if ( neeGroBoo ) return 'A group name is required.'; // What: Group Missing Return. Why: Only the group being blank needs its own sentence. How: This is checked once both prior cases are ruled out.



									return 'Everything looks good, click Save to save this picker’s new settings.'; // What: Ready Return. Why: Neither field is missing, so the user is ready to save. How: This is the final fallback once every missing-field case above is ruled out.


								}



								if ( neeNamBoo && neeGroBoo ) return 'A picker name and group are both required before advancing to the next step to create items for the picker’s list.'; // What: Both Missing Return. Why: Both fields being blank needs its own combined sentence for the create flow. How: This is the first, most specific case checked.



								if ( neeNamBoo ) return 'A picker name is required before advancing to the next step to create items for the picker’s list.'; // What: Name Missing Return. Why: Only the name being blank needs its own sentence for the create flow. How: This is checked once the combined case above is ruled out.



								if ( neeGroBoo ) return 'A group name is required before advancing to the next step to create items for the picker’s list.'; // What: Group Missing Return. Why: Only the group being blank needs its own sentence for the create flow. How: This is checked once both prior cases are ruled out.



								return <React.Fragment>Up next, create items to be included in this picker&rsquo;s list.</React.Fragment>; // What: Ready Return. Why: Neither field is missing, so the user is ready to advance to Step 2. How: This is the final fallback once every missing-field case above is ruled out.


							} )() }


						</div>

						<div className='np-footer-actions'>{ /* What: Footer Actions Div Element. Why: Cancel and the Save/Add Items button sit side by side. How: This wraps those two controls. */ }


							<ButBasCom
								kinValStr='ghost'
								onClick={ onCanForFun }
							>Cancel</ButBasCom>{ /* What: Button Base Component. Why: The user needs a way to back out of this form entirely. How: This calls onCanForFun. */ }

							{ isaEdiBoo ? ( // What: Edit Mode Check. Why: Editing saves right away, while creating still has an Items step. How: This picks the Save or Next button based on isaEdiBoo.


								<ButBasCom
									kinValStr='primary'
									icoNamStr='cheEle'
									disabled={ !detReaBoo || conColBoo }
									onClick={ subForFun }
								>Save</ButBasCom> // What: Button Base Component. Why: Editing only ever has one step, so this button both validates and commits. How: This calls subForFun directly, disabled until detReaBoo holds and no conditional name collides.


							) : ( // What: Add Items Branch. Why: Creating still has an Items step to fill in. How: This renders the else branch while isaEdiBoo is false.


								<ButBasCom
									className='ob-picker-next'
									kinValStr='primary'
									icoNamStr='chvEle'
									disabled={ !detReaBoo || conColBoo }
									onClick={ advSteFun }
								>Add Items</ButBasCom> // What: Button Base Component. Why: Creating still has an Items step to fill in. How: This calls advSteFun to advance, disabled under the same conditions as the edit Save button above.


							) }


						</div>


					</div>


				</div>


			) : ( // What: Step Two Branch. Why: With forSteNum at 2, the Items step's own content shows instead. How: This renders the else branch, taken while forSteNum isn't 1.


				<div
					key='np-step2'
					className='tab-fade'
				>{ /* What: Step Two Fade Div Element. Why: Switching steps should play a fade transition, and React needs a stable key to treat each step as a distinct mounted instance. How: This wraps the whole Items step's own hint text, pool, and footer. */ }


					<p className='picker-hint'>{ /* What: Items Intro Hint Paragraph Element. Why: A first-time user needs to be reminded which picker/mode they're building items for. How: This renders the live-typed name (or a fallback) and the chosen mode's own label. */ }


						This is the list of items that your
						{ ' ' }{ newNamStr.trim() ? `“${ newNamStr.trim() }”` : 'this picker' } picker chooses from.
						Each time it runs it picks one of these items, following the
						{ ' ' }&ldquo;{ SED_NAM_OBJ.MOD_DEF_OBJ[ selModStr ].labStr }&rdquo; rule that you chose. You will need
						to add at least 2 items before you can finish creating this picker. You
						can always add, edit or remove items later.


					</p>

					{ selModStr === 'random' && ( // What: Random Note Check. Why: Only Truly Random has literally nothing extra to explain about its own items. How: This renders the note only for that mode.


						<p className='picker-hint np-weight-note'>Because you chose &ldquo;Truly Random&rdquo;, there are no extra controls to tweak for these items since they all have an equal chance of being picked.</p> // What: Random Note Paragraph Element. Why: A Truly Random picker has no per-item controls, which is worth saying. How: This renders a fixed explanation.


					) }

					{ selModStr === 'weighted' && ( // What: Weighted Note Check. Why: Weighted and Dynamic both introduce the per-item weight concept, worth explaining once items are being added. How: This renders the note only for that mode.


						<p className='picker-hint np-weight-note'>Because you chose &ldquo;Weighted&rdquo;, each item also has a weight. A higher weight means an item has a higher chance of being picked. e.g. a w2 item will be picked about twice as often as a w1. Leave them all at w1 for an even start, you can always change these later.</p> // What: Weighted Note Paragraph Element. Why: Weighted items carry a weight the user should understand. How: This renders a fixed explanation.


					) }

					{ selModStr === 'dynamic' && ( // What: Dynamic Note Check. Why: Same reasoning as the Weighted note above, worded to also quote the mode's own live label. How: This renders the note only for that mode.


						<p className='picker-hint np-weight-note'>Because you chose &ldquo;{ SED_NAM_OBJ.MOD_DEF_OBJ[ selModStr ].labStr }&rdquo;, each item also has a weight. A higher weight means an item has a higher chance of being picked. e.g. a w2 item will be picked about twice as often as a w1. Leave them all at w1 for an even start, you can always change these later.</p> // What: Dynamic Note Paragraph Element. Why: Dynamic items carry a weight plus a drift bonus the user should understand. How: This renders an explanation naming the chosen mode.


					) }

					{ selModStr === 'ease-up' && ( // What: Ease Up Note Check. Why: Ease Up/Ease Down both introduce the per-item drift-cadence concept, worth explaining once items are being added. How: This renders the note only for that mode.


						<p className='picker-hint np-weight-note'>Because you chose &ldquo;Ease Up&rdquo;, each item gets its own cadence. This is set per item below, since each item might need a different timeout period. For each one you will need to pick a soonest and a latest value, which will be used to determine its new value as it charges towards becoming eligible again.</p> // What: Ease Up Note Paragraph Element. Why: Ease Up items each need their own timeout band. How: This renders a fixed explanation.


					) }

					{ selModStr === 'ease-down' && ( // What: Ease Down Note Check. Why: Same reasoning as the Ease Up note above, worded for discharging instead of charging. How: This renders the note only for that mode.


						<p className='picker-hint np-weight-note'>Because you chose &ldquo;Ease Down&rdquo;, each item gets its own cadence. This is set per item below, since each item might need a different selection period. For each one you will need to pick a soonest and a latest value, which will be used to determine its new value as it discharges towards deselection.</p> // What: Ease Down Note Paragraph Element. Why: Ease Down items each need their own selection band. How: This renders a fixed explanation.


					) }

					{ iniForObj && !opeTouBoo && ( // What: Tour Name Field Check. Why: Only the empty-state quick-start prefill (not a real tour walkthrough) ever needs this redundant name field this deep into the form. How: This renders the field only when a prefill exists and it wasn't opened by a tour. // What: Tour Name Field Design Note. Why: The guided tour now walks through the Details sub-step normally (where the real name input already lives) before reaching Items, so this redundant field is only needed for the OTHER initial-prefill path. How: Today's "no pickers yet" quick-start card jumps straight here, which is the sole real remaining reason iniForObj can reach Step 2 without opeTouBoo.


						<div className='np-field np-tour-name'>{ /* What: Tour Name Field Div Element. Why: The label and input form one field unit. How: This wraps those two pieces. */ }


							<label
								className='np-label'
								htmlFor='np-tour-name'
							>Picker name</label>{ /* What: Picker Name Label Element. Why: The tour name field needs its own visible label, tied to the input below. How: This renders the literal text "Picker name" and points at np-tour-name through htmlFor. */ }

							<input
								id='np-tour-name'
								className='np-input'
								type='text'
								maxLength={ 40 }
								placeholder='e.g. Chores'
								autoComplete='off'
								value={ newNamStr }
								onChange={ ( chaEveObj ) => setNewNamStr( chaEveObj.target.value ) }
							/>{ /* What: Picker Name Input Element. Why: The tour-prefilled form still needs a real, editable name field. How: This is a controlled text input bound to newNamStr. */ }


						</div>


					) }

					<div className='np-pool'>{ /* What: Pool Div Element. Why: The empty-state message, the real pool list, and the add/edit slot below it all share this one section. How: This wraps whichever of those currently applies. */ }


						{ pooIteArr.filter( ( iteCurObj ) => iteCurObj.id !== actNewStr ).length === 0 && !actNewStr && ( // What: Empty Pool Check. Why: A pool with no committed items yet (and nothing currently being added) needs its own placeholder message. How: This renders the placeholder only under both conditions.


							<div className='np-pool-empty'>Nothing here yet. Add at least 2 items that this picker can choose between, so that there&rsquo;s a real choice to make.</div> // What: Empty Pool Div Element. Why: An empty draft pool needs a nudge toward adding items. How: This renders a fixed message.


						) }

						{ pooIteArr.filter( ( iteCurObj ) => iteCurObj.id !== actNewStr ).length > 0 && ( // What: Non-Empty Pool Check. Why: The real list only needs to render once at least one committed item actually exists. How: This renders pool-list only while that count is above 0.


							<div className='pool-list'>{ /* What: Pool List Div Element. Why: One row per committed draft item needs a shared list container. How: This maps every committed entry of pooIteArr to one row below. */ }


								{ pooIteArr.filter( ( iteCurObj ) => iteCurObj.id !== actNewStr ).map( ( curIteObj ) => { // What: Pool Row List Render. Why: Every committed draft item needs its own row, showing its own cadence/weight summary. How: This maps the filtered list to one row per curIteObj.


									const sooDayNum = covSooFun( curIteObj.easeMax ); // What: Soonest Day Number. Why: The row's own ease-meta text needs a human-readable soonest value. How: This converts curIteObj.easeMax back into days.
									const latDayNum = covLatFun( curIteObj.easeMin ); // What: Latest Day Number. Why: The row's own ease-meta text needs a human-readable latest value. How: This converts curIteObj.easeMin back into days.



									return (


										<div
											key={ curIteObj.id }
											className={ ` pool-row   ${ insDraStr === curIteObj.id ? 'pool-row--insert' : '' }   ${ conDelStr === curIteObj.id ? 'pool-row--confirm' : '' }   ${ rmvIdeStr === curIteObj.id ? 'pool-row--removing' : '' } ` }
											onAnimationEnd={ ( aniEveObj ) => { // What: On Animation End Handler. Why: A new row's slide-in and a deleted row's removal both finish on this row's own animation end. How: This clears the insert flag, and removes the draft item once its removal animation is done.


												if ( insDraStr === curIteObj.id ) setInsDraStr( null ); // What: Insert Clear Guard. Why: A just-added row's slide-in plays only once. How: This clears insDraStr when its animation belongs to this row.



												if ( rmvIdeStr === curIteObj.id && aniEveObj.target === aniEveObj.currentTarget ) { // What: Removal Finished Guard. Why: The item leaves the draft pool only after its own row finishes the removal animation. How: This checks the row is the one being removed and the event came from the row itself.


													draActObj.delIteFun( curIteObj.id ); // What: Remove Item Call. Why: The row's removal animation has finished, so the draft pool can drop it. How: This calls delIteFun with this row's id.
													setRmvIdeStr( null );                // What: Removing Clear Call. Why: The removal is finished. How: This resets rmvIdeStr to null.


												}


											} }
										>{ /* What: Row Div Element. Why: Every committed draft item needs one row, whichever of its own name/meta/actions or delete-confirm content currently applies. How: This carries this row's own transient animation classes, and commits the real removal once its own leaving keyframe finishes. */ }


											{ conDelStr === curIteObj.id ? ( // What: Delete Confirm Check. Why: A row pending delete confirmation replaces its own normal content entirely. How: This renders the confirm row while conDelStr matches this item, otherwise the row's real content below.


												<div className={ ` pool-confirm   ${ conLeaStr === curIteObj.id ? 'is-leaving' : '' } ` }>{ /* What: Confirm Div Element. Why: The delete question and its Cancel/Delete buttons form one block. How: This wraps pool-confirm-msg and pool-confirm-actions. */ }


													<span className='pool-confirm-msg'>Delete <strong>{ curIteObj.name }</strong>?</span>{ /* What: Confirm Message Span Element. Why: The user must see exactly which item they're about to remove from the draft. How: This renders curIteObj.name inside the fixed question text. */ }

													<div className='pool-confirm-actions'>{ /* What: Confirm Actions Div Element. Why: Cancel and Delete need to sit side by side. How: This wraps those two buttons. */ }


														<ButBasCom
															kinValStr='ghost'
															sizValStr='sm'
															onClick={ canConFun }
														>Cancel</ButBasCom>{ /* What: Button Base Component. Why: The user needs a clear way to back out of a delete they didn't mean to start. How: This calls canConFun. */ }

														<ButBasCom
															kinValStr='danger'
															sizValStr='sm'
															icoNamStr='traEle'
															onClick={ () => { // What: On Click Handler. Why: Confirming a delete starts the row's removal animation. How: This clears the confirm state and marks the row as removing.


																setConDelStr( null );         // What: Confirm Clear Call. Why: No row stays in its delete-confirm state. How: This resets conDelStr to null.
																setRmvIdeStr( curIteObj.id ); // What: Removing Set Call. Why: The row plays its removal animation before the item is dropped. How: This writes this row's id into rmvIdeStr.


															} }
														>Delete</ButBasCom>{ /* What: Button Base Component. Why: This is the actual confirmed removal action. How: This clears the confirm state and starts the row's own removal animation. */ }


													</div>


												</div>


											) : ( // What: Row Content Branch. Why: A row not pending delete confirmation shows its own normal name/meta/actions content instead. How: This renders the else branch, taken while conDelStr doesn't match this item.


												<React.Fragment>{ /* What: Row Content Fragment Element. Why: The name/meta block and the edit/delete actions below are true siblings with no shared wrapper of their own. How: This groups all of this draft row's own real content without adding an extra DOM node. */ }


													<div className='pool-name'>{ curIteObj.name }</div>{ /* What: Name Div Element. Why: Every row needs its own visible item name. How: This renders curIteObj.name. */ }

													<div className='pool-meta'>{ /* What: Meta Div Element. Why: The optional cadence summary and the optional weight pill sit side by side. How: This wraps both, each independently gated. */ }


														{ isaEasBoo && <span className='pool-ease-meta'>{ sooDayNum }&ndash;{ latDayNum } { CAD_NAM_OBJ.uniWorFun( cadCurObj.cadence, latDayNum ) }</span> }{ /* What: Ease Meta Span Check. Why: Only ease-up/ease-down items have a cadence summary worth showing. How: This renders the soonest-latest range, unit-worded per the picker's own cadence, only while isaEasBoo is true. */ }

														{ shoWeiBoo && <span className='pool-weight'>w{ curIteObj.weight }</span> }{ /* What: Weight Span Check. Why: Only weighted/dynamic items have a weight worth showing. How: This renders the raw weight only while shoWeiBoo is true. */ }


													</div>

													<div aria-hidden='true' />{ /* What: Spacer Div Element. Why: The row's own CSS grid still expects a cell in this column, even though the live pool's own drift/status pills have no equivalent here yet. How: This is an empty, hidden placeholder cell. */ }

													<button
														className='pool-edit'
														type='button'
														aria-label={ `Edit ${ curIteObj.name }` }
														title='Edit'
														onClick={ () => staDraFun( curIteObj.id ) }
													>{ /* What: Edit Pool Button Element. Why: Every row needs a way to open its own item in the shared editor slot below. How: This calls staDraFun with this row's own item id. */ }


														<IcoSvgCom
															icoNamStr='ediEle'
															sizValNum={ 15 }
														/>{ /* What: Icon Svg Component. Why: The edit action needs a recognizable pencil glyph. How: This renders the 'ediEle' icon at a fixed size. */ }


													</button>

													{ pooIteArr.filter( ( iteCurObj ) => iteCurObj.id !== actNewStr ).length <= 2 ? ( // What: Delete Guard Check. Why: A picker must always keep at least 2 committed items, so the last two rows can't offer a real delete button at all. How: This renders a disabled, explanatory InfTipCom instead of a working Delete button whenever the pool is at that floor.


														<InfTipCom
															className='pool-del is-disabled'
															actNamStr='Delete'
															labTexStr='Pickers require at least 2 items in their list, you need to add another item first or delete the entire picker instead.'
														>{ /* What: Info Tip Component. Why: The user should understand why Delete is unavailable rather than it just silently not working. How: This wraps the trash glyph with the explanatory tooltip above. */ }


															<IcoSvgCom
																icoNamStr='traEle'
																sizValNum={ 15 }
															/>{ /* What: Icon Svg Component. Why: The delete action needs a recognizable trash glyph. How: This renders the 'traEle' icon at a fixed size. */ }


														</InfTipCom>


													) : ( // What: Delete Button Branch. Why: With more than 2 committed items in the draft, a real working Delete button belongs here instead. How: This renders the else branch, taken while the draft pool is above that floor.


														<button
															className='pool-del'
															type='button'
															aria-label={ `Delete ${ curIteObj.name }` }
															onClick={ () => setConDelStr( curIteObj.id ) }
														>{ /* What: Delete Pool Button Element. Why: This starts this row's own delete-confirm flow. How: This writes curIteObj.id into conDelStr. */ }


															<IcoSvgCom
																icoNamStr='traEle'
																sizValNum={ 15 }
															/>{ /* What: Icon Svg Component. Why: The delete action needs a recognizable trash glyph. How: This renders the 'traEle' icon at a fixed size. */ }


														</button>


													) }


												</React.Fragment>


											) }


										</div>


									);


								}) }


							</div>


						) }

						<div
							ref={ addWraRef }
							className='pv-additem-wrap'
						>{ /* What: Add Item Wrap Div Element. Why: The new-item form, an already-committed item's editor, and the plain "+ Add Item" button all share this one below-the-list slot. How: This wraps whichever of those three the IIFE below currently resolves to. */ }


							{ ( () => { // What: Additem Slot Render. Why: Exactly one of three things belongs in this slot at a time, easier to express as a small function than as a nested ternary. How: This checks ediIteStr first, then actNewStr, falling back to the plain button.


								if ( ediIteStr ) { // What: Committed Item Editor Branch. Why: An already-committed draft item's own editor takes priority whenever one is open. How: This looks up the item and renders its editor, or nothing if it vanished out from under itself.


									const ediLivObj = pooIteArr.find( ( iteCurObj ) => iteCurObj.id === ediIteStr ); // What: Editing Live Object. Why: The editor needs the exact current draft item record to open against. How: This looks up ediIteStr in pooIteArr.


									if ( !ediLivObj ) return null; // What: Missing Item Guard. Why: The item may have been removed via the row's own trash icon while this was open; that confirm flow already owns closing this out. How: This renders nothing rather than crashing against a missing item.



									return (


										<div
											className={ ` pv-newitem   rd-item   is-editing   ${ ediCloBoo ? 'is-closing' : '' } ` }
											onAnimationEnd={ ( aniEveObj ) => { // What: On Animation End Handler. Why: The draft item editor's own close animation must finish before its state clears. How: This clears the closing and open flags, then opens any editor requested meanwhile.


												if ( !ediCloBoo || aniEveObj.target !== aniEveObj.currentTarget ) return; // What: Not Closing Guard. Why: Only the editor's own closing animation should finish the close. How: This bails out unless ediCloBoo is set and the event came from this element.



												setEdiCloBoo( false ); // What: Closing Clear Call. Why: The close animation is over. How: This resets ediCloBoo to false.

												setEdiIteStr( null ); // What: Editor Clear Call. Why: No item's editor stays open. How: This resets ediIteStr to null.

												if ( penEdiRef.current ) { // What: Pending Editor Guard. Why: A different item's editor may have been requested while this one was closing. How: This opens it once this editor has finished closing.


													const tarIdeStr = penEdiRef.current; // What: Target Identifier String. Why: The pending editor request must be read before it's cleared. How: This copies penEdiRef.current.


													penEdiRef.current = null; // What: Pending Clear. Why: The request is being handled now, so it must not run twice. How: This resets penEdiRef to null.
													opeDraFun( tarIdeStr );   // What: Open Draft Call. Why: The editor the user asked for opens once the previous one has closed. How: This calls opeDraFun with tarIdeStr.


												}


											} }
										>{ /* What: Editing Item Wrap Div Element. Why: This is the whole committed-item editor slot, playing its own closing animation before actually unmounting. How: This reopens whatever edit staDraFun staged in penEdiRef once its own closing keyframe finishes. */ }


											<div
												className='rd-row'
												onClick={ ( clkEveObj ) => clkEveObj.stopPropagation() }
											>{ /* What: Row Div Element. Why: A click inside the name row must not bubble up to whatever the pool wrap itself listens for. How: This stops propagation on every click. */ }


												<span className='rd-main'>{ /* What: Main Span Element. Why: The name input needs the same wrapper the closed row's name uses. How: This wraps the input below. */ }


													<input
														className='rd-name-input'
														type='text'
														maxLength={ 60 }
														placeholder='Item name'
														autoFocus
														value={ ediLivObj.name }
														aria-label='Item name'
														onChange={ ( chaEveObj ) => draActObj.updIteFun( ediLivObj.id, { name : chaEveObj.target.value } ) }
														onBlur={ ( bluEveObj ) => { // What: On Blur Handler. Why: Leaving the name field commits a tidied name. How: This trims the value and renames the draft item when it's non-empty.


															const newNamStr = bluEveObj.target.value.trim(); // What: New Name String. Why: A blur commit should tidy the name, not keep stray whitespace. How: This trims the input's current value.


															if ( newNamStr ) draActObj.renIteFun( ediLivObj.id, newNamStr ); // What: Rename Item Guard. Why: A blank name must never be committed. How: This renames the draft item only when newNamStr is non-empty.


														} }


														onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Enter' ) keyEveObj.currentTarget.blur(); } }
													/>{ /* What: Name Input Element. Why: This is the actual live-typed name field for the item being edited. How: This writes into draActObj on every change, and commits the rename on blur. */ }


												</span>


											</div>

											<div className='rd-edit'>{ /* What: Edit Div Element. Why: EntEdiCom's own weight/ease/vacation controls need their own slot below the name row, wired to the draft instead of the real store. How: This wraps a single EntEdiCom instance bound to draActObj. */ }


												<EntEdiCom
													key={ ediLivObj.id }
													iteDatObj={ ediLivObj }
													picDatObj={ draPicObj }
													actStoObj={ draActObj }
													picIteArr={ pooIteArr }
													onCloEdiFun={ () => setEdiCloBoo( true ) }
												/>{ /* What: Entry Editor Component. Why: Editing a pool item reuses the exact item editor Today and Data use. How: This is passed the live item, the picker, and the actions it edits through. */ }{ /* What: Editor Key Design Note. Why: See PicVieCom's own EntEdiCom for why a key on ediLivObj.id matters when switching directly between two items' editors. How: No onCancel is passed below, matching the live tab too: this item already exists (within the draft), so EntEdiCom's own internal Cancel/Escape handling (revert via draActObj.revIteFun, then close) is correct as-is with no extra bookkeeping needed here. */ }


											</div>


										</div>


									);


								}



								const newIteObj = pooIteArr.find( ( iteCurObj ) => iteCurObj.id === actNewStr ); // What: New Item Object. Why: The branch below needs a stable local alias to check and render from. How: This looks up actNewStr in pooIteArr.


								if ( !newIteObj ) return ( // What: No Draft Branch. Why: When neither a committed edit nor a new draft is open, the plain add button belongs in this slot. How: This returns the "+ Add Item" button directly.


									<button
										className='pv-additem-btn'
										type='button'
										onClick={ addDraFun }
									>{ /* What: Add Item Button Element. Why: This starts a brand-new item draft in the pool. How: This calls the add handler on click, disabled during the matching tour step. */ }


										<IcoSvgCom
											icoNamStr='pluEle'
											sizValNum={ 14 }
										/>{ /* What: Icon Svg Component. Why: The button needs a recognizable "add" glyph beside its own label. How: This renders the 'pluEle' icon at a fixed size. */ } Add Item


									</button>


								);



								return (


									<div
										className={ ` pv-newitem   rd-item   is-editing   ${ actCloStr ? 'is-closing' : '' } ` }
										onAnimationEnd={ ( aniEveObj ) => { // What: On Animation End Handler. Why: The new draft item's own close animation must finish before the add is kept or dropped. How: This keeps or discards the draft, clears the add state, then opens any editor requested meanwhile.


											if ( !actCloStr || aniEveObj.target !== aniEveObj.currentTarget ) return; // What: Not Closing Guard. Why: Only the new item's own closing animation should finish the add. How: This bails out unless actCloStr is set and the event came from this element.



											const savIdeStr = newIteObj.id; // What: Saved Identifier String. Why: The new item's id is needed after the draft state below is cleared. How: This copies newIteObj.id.


											if ( actCloStr === 'save' ) setInsDraStr( savIdeStr ); // What: Commit Save Branch. Why: A successful save should commit the newly-inserted item's own draft id so later UI can find it. How: This calls setInsDraStr with savIdeStr.

											else draActObj.delIteFun( savIdeStr ); // What: Discard Draft Branch. Why: Any other closing reason (cancel, etc.) should just discard the in-progress draft item entirely. How: This calls draActObj.delIteFun with savIdeStr.



											setActCloStr( false ); // What: Closing Clear Call. Why: The close animation is over. How: This resets actCloStr to false.

											setActNewStr( null ); // What: Active New Clear Call. Why: No new item is being added anymore. How: This resets actNewStr to null.

											if ( penEdiRef.current ) { // What: Pending Editor Guard. Why: A different item's editor may have been requested while this one was closing. How: This opens it once this editor has finished closing.


												const tarIdeStr = penEdiRef.current; // What: Target Identifier String. Why: The pending editor request must be read before it's cleared. How: This copies penEdiRef.current.


												penEdiRef.current = null; // What: Pending Clear. Why: The request is being handled now, so it must not run twice. How: This resets penEdiRef to null.
												opeDraFun( tarIdeStr );   // What: Open Draft Call. Why: The editor the user asked for opens once the previous one has closed. How: This calls opeDraFun with tarIdeStr.


											}


										} }
									>{ /* What: New Item Wrap Div Element. Why: This is the whole new-item draft editor slot, playing its own closing animation before actually keeping or discarding it. How: This flags the row for its own insert animation only when actCloStr is 'save', otherwise removes it, then reopens whatever staDraFun staged in penEdiRef. */ }


										<div
											className='rd-row'
											onClick={ ( clkEveObj ) => clkEveObj.stopPropagation() }
										>{ /* What: Row Div Element. Why: A click inside the name row must not bubble up to whatever the pool wrap itself listens for. How: This stops propagation on every click. */ }


											<span className='rd-main'>{ /* What: Main Span Element. Why: The name input needs the same wrapper the closed row's name uses. How: This wraps the input below. */ }


												<input
													className='rd-name-input'
													type='text'
													maxLength={ 60 }
													placeholder='Item name'
													autoFocus
													value={ newIteObj.name }
													aria-label='Item name'
													onChange={ ( chaEveObj ) => draActObj.updIteFun( newIteObj.id, { name : chaEveObj.target.value } ) }
													onBlur={ ( bluEveObj ) => { // What: On Blur Handler. Why: Leaving the name field commits a tidied name. How: This trims the value and renames the draft item when it's non-empty.


														const newNamStr = bluEveObj.target.value.trim(); // What: New Name String. Why: A blur commit should tidy the name, not keep stray whitespace. How: This trims the input's current value.


														if ( newNamStr ) draActObj.renIteFun( newIteObj.id, newNamStr ); // What: Rename Item Guard. Why: A blank name must never be committed. How: This renames the draft item only when newNamStr is non-empty.


													} }


													onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Enter' ) keyEveObj.currentTarget.blur(); } }
												/>{ /* What: Name Input Element. Why: This is the actual live-typed name field for the item being newly added. How: This writes into draActObj on every change, and commits the rename on blur. */ }


											</span>


										</div>

										<div className='rd-edit'>{ /* What: Edit Div Element. Why: EntEdiCom's own weight/ease/vacation controls need their own slot below the name row. How: This wraps a single EntEdiCom instance bound to draActObj. */ }


											<EntEdiCom
												iteDatObj={ newIteObj }
												picDatObj={ draPicObj }
												actStoObj={ draActObj }
												picIteArr={ pooIteArr }
												onCloEdiFun={ () => setActCloStr( 'save' ) }
												onCanEdiFun={ () => setActCloStr( 'cancel' ) }
											/>{ /* What: Entry Editor Component. Why: The new-item draft reuses the exact item editor Today and Data use. How: This is passed the draft item, the picker, and the draft actions. */ }


										</div>


									</div>


								);


							} )() }


						</div>


					</div>

					<div className='np-footer'>{ /* What: Footer Div Element. Why: The step's own guidance note and its Back/Create actions sit in one footer row. How: This wraps np-footer-note and np-footer-actions. */ }


						<div className='np-footer-note'>{ /* What: Footer Note Div Element. Why: The exact guidance sentence depends on how many committed items exist and whether weight is relevant. How: This branches on enoIteBoo first, then shoWeiBoo, otherwise counting toward the 2-item minimum. */ }


							{ !enoIteBoo // What: Not Enough Items Check. Why: The footer note either says how many more items are needed or confirms the minimum is met. How: This picks the add-more message first, then the weight or minimum message.


								? `Add at least 2 items to create this picker${ comCouNum === 1 ? ' (1 so far)' : '' }.` // What: Add More Message. Why: A picker needs at least 2 items to be a real choice. How: This notes the one item added so far, when there is one.

								: shoWeiBoo // What: Show Weight Check. Why: Weighted pools get a hint about setting weights. How: This checks shoWeiBoo.

								? 'Looks good, set each item’s weight above, or leave them even.' // What: Weight Hint Message. Why: The minimum is met and weights are worth a look. How: This renders a fixed sentence.

								: `Minimum number of items added (${ comCouNum } so far). You can always add more items later.` // What: Minimum Met Message. Why: The minimum is met with no weights to set. How: This names the item count so far.


							}


						</div>

						<div className='np-footer-actions'>{ /* What: Footer Actions Div Element. Why: Back and Create Picker sit side by side. How: This wraps those two buttons. */ }


							<ButBasCom
								kinValStr='ghost'
								onClick={ bacSteFun }
							>Back</ButBasCom>{ /* What: Button Base Component. Why: The user needs a way to return to Step 1 without losing their in-progress items. How: This calls bacSteFun. */ }

							<ButBasCom
								className='ob-picker-create'
								kinValStr='primary'
								icoNamStr='cheEle'
								disabled={ !enoIteBoo || conColBoo }
								onClick={ subForFun }
							>Create Picker</ButBasCom>{ /* What: Button Base Component. Why: This is the actual final commit for a brand-new picker. How: This calls subForFun, disabled until enoIteBoo holds and no conditional name collides. */ }


						</div>


					</div>


				</div>


			) }


		</div>


	);


}

// #endregion PicForCom



// #region TabPicCom

/**
 * TabPicCom = Tab Picker Component
 *
 * @summary
 * The whole Pickers page: a header, Group/Type filter rows, a Show row of
 * per-picker tabs (plus an Add New Picker tab), and below it either
 * PicForCom (creating a fresh picker) or PicVieCom (running/editing the
 * selected one). Also owns this page's own help mode (seeding/tearing down
 * a disposable copy set of sample pickers) and the several tour/checklist
 * gates that narrow what a first-time user can click before they've
 * finished the guided walkthroughs.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.staAppObj   - State App Object: {@link useAppStaFun}
 * @param props.actStoObj   - Action Store Object: {@link useAppStaFun}
 * @param props.aniStyStr   - Animation Style String: Which PicStrCom
 *                            animation style PicVieCom should play.
 * @param props.onNavHomFun - On Navigate Home Function: Navigates back to
 *                            the Today tab.
 * @param props.onNavTabFun - On Navigate Tab Function: Switches to an
 *                            arbitrary tab by id.
 *
 * @returns The whole Pickers page: its header, filter rows, the Show tab
 * row, and whichever of PicForCom/PicVieCom currently applies.
 *
 * @example
 * ```tsx
 * TabPicCom({ staAppObj, actStoObj, aniStyStr, ... }) // => <TabPicCom />
 * ```
 *
*/

function TabPicCom ( { staAppObj, actStoObj, aniStyStr, onNavHomFun, onNavTabFun } ) {


	const [ actPicStr, setActPicStr ] = React.useState( () => ( // What: Active Picker String And Setter. Why: This defaults to the first picker the Show row itself will display (see sorPicArr below), alphabetical, not pickers' own storage-array order, which the row's own render is sorted by too. How: This duplicates sorPicArr's own filter+sort inline, since that memo isn't declared yet at this point in the component, purely for this one initial value.


		[ ...staAppObj.pickers ].filter( ( picCurObj ) => !picCurObj.hidden ).sort( ( picOneObj, picTwoObj ) => picOneObj.name.localeCompare( picTwoObj.name ) )[ 0 ]?.id // What: First Visible Picker Expression. Why: The page opens on the first picker the Show row lists. How: This sorts the visible pickers by name and takes the first id.


	) );


	const [ creOpeBoo, setCreOpeBoo ] = React.useState( false ); // What: Create Open Boolean And Setter. Why: This is whether PicForCom is currently showing in place of PicVieCom. How: This is flipped by the Add New Picker tab and cleared once a picker is created or the form is cancelled.
	const [ groFilStr, setGroFilStr ] = React.useState( 'all' ); // What: Group Filter String And Setter. Why: This is which group pill is currently narrowing the Show row. How: This starts on 'all' and is set by the Group filter row below.
	const [ typFilStr, setTypFilStr ] = React.useState( 'all' ); // What: Type Filter String And Setter. Why: This is which mode pill is currently narrowing the Show row. How: This starts on 'all' and is set by the Type filter row below.

	const actPicObj = staAppObj.pickers.find( ( picCurObj ) => picCurObj.id === actPicStr ); // What: Active Picker Object. Why: PicVieCom needs the actual current picker record, not just its id. How: This looks up actPicStr in staAppObj.pickers.

	const [ helOpeBoo, setHelOpeBoo ] = React.useState( false ); // What: Help Open Boolean And Setter. Why: Help mode (see help-mode.jsx) needs real pickers of every mode plus a conditional-gated one to point at, so a disposable copy set is seeded the moment it turns on and torn down the moment it turns off (see help-sample-data.js's own header comment for why this is a SEPARATE disposable namespace from the page tour's own `pt_`-prefixed copies). How: This is toggled by HelButCom below.

	const helExiFun = React.useCallback( () => setHelOpeBoo( false ), [] ); // What: Help Exit Function. Why: HelOveCom needs a stable callback to close itself with. How: This just sets helOpeBoo false.


	React.useEffect( () => { // What: Help Seed Effect. Why: Help mode needs disposable sample pickers only while it's on. How: This seeds them when helOpeBoo turns on and clears them when it turns off.


		if ( helOpeBoo ) sedPicFun( staAppObj, actStoObj ); // What: Seed Branch. Why: The disposable help-mode sample set must exist the instant help mode turns on. How: This calls sedPicFun with the live state/actions.

		else clePicFun( actStoObj ); // What: Clear Branch. Why: The disposable sample set must not linger once help mode turns back off. How: This calls clePicFun with actions.


	}, [ helOpeBoo ] ); // What: Effect Dependency Array. Why: This only needs re-running when help mode itself is toggled. How: helOpeBoo is the sole trigger.

	React.useEffect( () => () => clePicFun( actStoObj ), [] ); // What: Unmount Cleanup Effect. Why: A tab switch away from Pickers with help mode still on needs its own cleanup, since the effect above's own cleanup only fires on a DEPENDENCY change, not on unmount. How: This is unconditional and harmless if nothing was ever seeded, since clePicFun's own delPicFun/delConFun calls are no-ops against ids that don't exist.


	const touBusObj = useEmlTouFun ? useEmlTouFun() : { preFilObj : null, staCreObj : null }; // What: Tour Bus Object. Why: This page needs the shared tour bus to stage a prefilled create form and to gate several buttons during the guided walkthroughs. How: This subscribes via useEmlTouFun, or falls back to an inert stub if that hook somehow isn't available.
	const isaTouBoo = touBusObj.touPhaStr === 'tour';                                         // What: Is-A Tour Boolean. Why: Every gate below needs to know a tour is actually running before it even checks which one. How: This is reused as the shared first operand of every tour-gating boolean that follows.

	const disAddBoo = isaTouBoo && touBusObj.touIdeStr === 'page-explore_pickers' && touBusObj.touSteNum === 3;            // What: Disable Add Boolean. Why: The Pickers page tour's own Step 4 highlights "Add New Picker" but explicitly doesn't want the user opening the real create form from it, since that flow is what the separate picker mini-tours already cover. How: This is gated on tourId, not just step index alone, since some OTHER tour could just as easily be sitting on step index 3 for its own unrelated reason.
	const picTouBoo = isaTouBoo && typeof touBusObj.touIdeStr === 'string' && touBusObj.touIdeStr.startsWith( 'picker-' ); // What: Picker Tour Active Boolean. Why: A running picker mini-tour's own Step 2 wants the user to click the real Add New Picker button themselves, not a simulated click, exempting it from tutProBoo's own gate below for its whole run (later steps' own cirBoo targets are elsewhere, so the click-guard already keeps a stray click on this button from doing anything by then anyway). How: This checks the shared tourId prefix convention picker mini-tours use.
	const tutProBoo = ONB_CHE_OBJ.tutProFun( staAppObj ) && !picTouBoo;                                                    // What: Tutorials Progress Boolean. Why: This button is separately disabled anywhere from the Welcome Tour's first step through the closing Generate card's flow completing. How: This is distinct from disAddBoo above (still needed on its own: a Replay of the Pickers page tour runs AFTER the checklist finishes, when this is always false), and is exempted for the whole run of a picker mini-tour via picTouBoo.

	const [ opeTouBoo, setOpeTouBoo ] = React.useState( false ); // What: Opened Tour Boolean And Setter. Why: Prefill staged by Today's empty-state card (name focus + "Chores") needs to know NOT to fire the tour's own advance callback, unlike a real tour walkthrough. How: This is set true only by the tour-prefill effect below, never by the empty-state entry effect.
	const [ empIniObj, setEmpIniObj ] = React.useState( null );  // What: Empty Initial Object And Setter. Why: Prefill staged by Today's empty-state card needs to survive clearing the bus signal that carried it. How: This is set once by the empty-state effect below and consumed as PicForCom's own iniForObj prop.


	React.useEffect( () => { // What: Tour Prefill Effect. Why: When the tour stages a prefill, the create form should open for it automatically. How: This opens creOpeBoo and flags opeTouBoo, but only when nothing is already open and the tour hasn't explicitly suppressed this auto-open (see touBusObj.supAutBoo's own comment at its use site in onboarding-picker-tours.jsx: that tour always opens this form via a real click on the button below, which sets creOpeBoo itself; without this flag, that same click's prefill can reach this effect on an earlier render than the one where creOpeBoo turns true, since the bus's subscriber callback isn't part of the click's own React batch, making this effect wrongly claim credit and flip opeTouBoo to true).


		const hasPreBoo = !!touBusObj.preFilObj; // What: Has Prefill Boolean. Why: The chain below combines 3 real-expression operands, so each is named individually per this project's long-boolean-expression rule. How: This is true whenever the bus is currently staging a prefill.
		const notCreBoo = !creOpeBoo;            // What: Not Creating Boolean. Why: See hasPreBoo's own comment. How: This is true whenever the create form isn't already open.
		const skiAutBoo = !touBusObj.supAutBoo;  // What: Skip Auto-Open Boolean. Why: See hasPreBoo's own comment. How: This is true whenever the tour hasn't explicitly suppressed this auto-open.


		if ( hasPreBoo && notCreBoo && skiAutBoo ) { // What: Auto-Open Guard. Why: All 3 conditions must hold before this effect may claim credit for opening the form. How: This opens creOpeBoo and flags opeTouBoo together.


			setCreOpeBoo( true ); // What: Create Open Call. Why: The tour's prefill needs the create form open. How: This sets creOpeBoo to true.
			setOpeTouBoo( true ); // What: Tour Open Mark Call. Why: The form must know a tour opened it. How: This sets opeTouBoo to true.


		}


	}, [ touBusObj.preFilObj ] ); // What: Effect Dependency Array. Why: Only a genuine change to the staged prefill should re-evaluate this. How: touBusObj.preFilObj is the sole trigger.

	React.useEffect( () => { // What: Empty-State Create Effect. Why: Today's "no pickers" empty-state card should open the create form with its own staged prefill, but WITHOUT opeTouBoo, since this isn't the tour and creating the picker must not fire the tour's own advance callback. How: This consumes touBusObj.staCreObj once, then clears it, prefilling a "Chores" group only when there are no groups to auto-select (a group can technically exist with no pickers, so an existing one is respected by leaving group unset, letting the form auto-select it).


		if ( touBusObj.staCreObj && !creOpeBoo ) { // What: Start Create Guard. Why: Only a genuinely-staged empty-state prefill, with nothing already open, should trigger this. How: This checks both conditions before doing anything.


			const staPayObj = exiGroArr.length === 0 ? { ...touBusObj.staCreObj, group : 'Chores' } : touBusObj.staCreObj; // What: Staged Payload Object. Why: A brand-new install with no groups at all should land the empty-state picker in a sensible default group. How: This adds group:'Chores' only when exiGroArr is empty, otherwise passing the staged prefill through unchanged.


			setEmpIniObj( staPayObj ); // What: Prefill Store Call. Why: PicForCom needs this exact shape as its own iniForObj prop. How: This writes staPayObj into empIniObj.

			setCreOpeBoo( true ); // What: Open Form Call. Why: The create form must actually show for the staged prefill to matter at all. How: This flips creOpeBoo true.

			emlTouObj.set({ staCreObj : null }); // What: Bus Clear Call. Why: This staged signal must only ever be consumed once. How: This writes staCreObj : null back onto the shared bus.


		}


	}, [ touBusObj.staCreObj ] ); // What: Effect Dependency Array. Why: Only a genuine change to this exact staged signal should re-run this. How: touBusObj.staCreObj is the sole trigger; exiGroArr/creOpeBoo are read fresh from the closure each time it fires.


	const exiGroArr = React.useMemo( () => { // What: Existing Group Array. Why: Distinct group names, alphabetical, offered as chips in the form and as the group filter bar above the picker strip ("All" itself is a separate, always-first pill rendered outside this list). How: This walks staAppObj.pickers collecting each visible picker's own group name once, then alphabetizes them.


		const seeGroArr = []; // What: Seen Group Array. Why: The loop below needs an accumulator to collect each distinct group name into. How: This starts empty and is pushed to by the loop.


		for ( const curPicObj of staAppObj.pickers ) { // What: Collect Groups Loop. Why: Every visible picker's own group name (if it has one, and isn't already collected) belongs in the result. How: This walks staAppObj.pickers, pushing each new group name onto seeGroArr.


			const hasGroBoo = Boolean( curPicObj.group );             // What: Has Group Boolean. Why: A picker with no group adds nothing to the list. How: This coerces curPicObj.group to a boolean.
			const notHidBoo = !curPicObj.hidden;                      // What: Not Hidden Boolean. Why: A hidden picker's group shouldn't surface. How: This negates curPicObj.hidden.
			const unsGroBoo = !seeGroArr.includes( curPicObj.group ); // What: Unseen Group Boolean. Why: Each group name is collected once. How: This checks seeGroArr doesn't hold it yet.

			const addGroBoo = hasGroBoo && notHidBoo && unsGroBoo; // What: Add Group Boolean. Why: Only a real, visible, not-yet-collected group is added. How: This ANDs the 3 checks above.


			if ( addGroBoo ) seeGroArr.push( curPicObj.group ); // What: Group Push Guard. Why: This is the actual collection step. How: This pushes the group name when addGroBoo is true.


		}



		return seeGroArr.sort( ( groOneStr, groTwoStr ) => groOneStr.localeCompare( groTwoStr ) ); // What: Sorted Groups Return. Why: The group chips should read in a stable, predictable order. How: This returns seeGroArr sorted alphabetically.


	}, [ staAppObj.pickers ] ); // What: Memo Dependency Array. Why: The group list only needs recomputing when the pickers list itself changes. How: staAppObj.pickers is what the loop above actually reads.


	const exiModArr = React.useMemo( () => { // What: Existing Mode Array. Why: Distinct modes actually in use, alphabetical by their own display label, are this page's own Type filter bar pills ("All" is pinned first, same as Group); unlike Stats/Data, this page has no management section for Conditionals/Reminders, so Type here is purely a picker-mode filter. How: This walks staAppObj.pickers collecting each visible picker's own mode once, then alphabetizes by SED_NAM_OBJ.MOD_DEF_OBJ's own label.


		const seeModSet = new Set(); // What: Seen Mode Set. Why: The loop below needs a Set to collect each distinct mode into, deduplicating for free. How: This starts empty and gains entries from the loop.


		for ( const curPicObj of staAppObj.pickers ) if ( !curPicObj.hidden ) seeModSet.add( curPicObj.mode ); // What: Collect Modes Loop. Why: Every visible picker's own mode belongs in the result. How: This walks staAppObj.pickers, adding each one's own mode into seeModSet.



		return [ ...seeModSet ].sort( ( modOneStr, modTwoStr ) => SED_NAM_OBJ.MOD_DEF_OBJ[ modOneStr ].labStr.localeCompare( SED_NAM_OBJ.MOD_DEF_OBJ[ modTwoStr ].labStr ) ); // What: Sorted Modes Return. Why: The mode chips should read in a stable order matching their own display labels, not their raw internal keys. How: This spreads seeModSet into an array and sorts by each key's own SED_NAM_OBJ.MOD_DEF_OBJ label.


	}, [ staAppObj.pickers ] ); // What: Memo Dependency Array. Why: The mode list only needs recomputing when the pickers list itself changes. How: staAppObj.pickers is what the loop above actually reads.


	const visPicArr = React.useMemo( () => staAppObj.pickers.filter( ( picCurObj ) => { // What: Visible Picker Array. Why: The picker strip is scoped to the selected group AND type, independent filters ("all" on either leaves that axis unfiltered); hidden pickers (see store.js's `hidden` flag) never appear here. How: This filters staAppObj.pickers against groFilStr/typFilStr, each independently gated by its own "all" check.


		const notHidBoo = !picCurObj.hidden;                                    // What: Not Hidden Boolean. Why: A hidden picker (a draft or a help sample) never lists here. How: This negates picCurObj.hidden.
		const groMatBoo = groFilStr === 'all' || picCurObj.group === groFilStr; // What: Group Match Boolean. Why: The Group filter narrows by group. How: This passes every picker while it's 'all', otherwise only a matching group.
		const typMatBoo = typFilStr === 'all' || picCurObj.mode === typFilStr;  // What: Type Match Boolean. Why: The Type filter narrows by mode. How: This passes every picker while it's 'all', otherwise only a matching mode.

		const incPicBoo = notHidBoo && groMatBoo && typMatBoo; // What: Include Picker Boolean. Why: A picker lists only when every filter passes it. How: This ANDs the 3 checks above.



		return incPicBoo; // What: Include Picker Return. Why: filter() needs a yes/no per picker. How: This returns incPicBoo.


	} ), [ staAppObj.pickers, groFilStr, typFilStr ] ); // What: Memo Dependency Array. Why: The visible list only changes when the pickers or either filter change. How: Each of these values independently affects which pickers pass.


	const sorPicArr = React.useMemo( () => ( // What: Sorted Visible Picker Array. Why: This is the same alphabetical order the Show row itself renders in below, reused so "jump to the first card" always agrees with what's actually shown first, not visPicArr's own storage-array order. How: This sorts a copy of visPicArr by name.


		[ ...visPicArr ].sort( ( picOneObj, picTwoObj ) => picOneObj.name.localeCompare( picTwoObj.name ) ) // What: Name Sort Expression. Why: The Show row lists pickers alphabetically. How: This sorts a copy of visPicArr by name.


	), [ visPicArr ] ); // What: Memo Dependency Array. Why: The sorted list only changes when the visible list does. How: visPicArr is the single value it sorts.


	const preFilRef = React.useRef( { groStr : groFilStr, typStr : typFilStr } ); // What: Previous Filters Reference. Why: The selection-coherence effect below needs to remember the last-seen filter values across renders to detect an actual filter change, distinct from the picker list itself changing for some unrelated reason. How: This starts at the current filters and is updated by that effect whenever either one changes.


	React.useEffect( () => { // What: Selection Coherence Effect. Why: Either filter itself just changing should always land on the first card in the new Show row, matching it exactly rather than only reacting once the OLD selection happens to fall out of view (e.g. switching from a wide group to a narrower one that still happens to contain the same active picker used to leave it stranded, not jumped to the new first card); the picker list changing for some unrelated reason (e.g. the active picker got deleted) should only jump when the current selection actually became invalid. How: This computes filChaBoo by comparing against preFilRef, then jumps to sorPicArr's own first entry whenever either that or an invalid selection applies.


		if ( creOpeBoo ) return; // What: Creating Guard. Why: The create form has no "selection" of its own to keep coherent. How: This bails out entirely while creOpeBoo is true.



		const filChaBoo = preFilRef.current.groStr !== groFilStr || preFilRef.current.typStr !== typFilStr; // What: Filter Changed Boolean. Why: The jump-to-first behavior below depends specifically on whether a filter itself just changed. How: This compares both current filter values against what preFilRef last recorded.


		preFilRef.current = { groStr : groFilStr, typStr : typFilStr }; // What: Previous Filters Update. Why: The next run of this effect needs to compare against the filters that are current now. How: This overwrites preFilRef with both current filter values.

		if ( filChaBoo || !visPicArr.some( ( picCurObj ) => picCurObj.id === actPicStr ) ) setActPicStr( sorPicArr[ 0 ]?.id ); // What: Jump To First Guard. Why: Either a genuine filter change, or the current selection no longer being visible at all, should land on the new first card. How: This writes sorPicArr's own first entry's id into actPicStr.


	}, [ groFilStr, typFilStr, visPicArr, sorPicArr, actPicStr, creOpeBoo ] ); // What: Effect Dependency Array. Why: This must re-check whenever any of these could change what "coherent" means. How: groFilStr/typFilStr are the filters themselves, visPicArr/sorPicArr are what they produce, actPicStr is the current selection, and creOpeBoo gates whether this applies at all.


	const tabRaiRef = React.useRef( null ); // What: Tab Rail Reference. Why: The scroll-edge fade effect below needs the Show row's own element. How: This is attached to that rail's ref prop. // What: Scroll-Aware Edge Fades Design Note. Why: The tab strip, and the Group/Type filter rails, all need the same at-start/at-end mask-gradient behavior so each one's own fade only shows on the side that has more content. How: tabRaiRef/groRaiRef/typRaiRef below are attached to those three rails; the effect right after wires up a shared scroll+resize listener for whichever of them are actually mounted.
	const groRaiRef = React.useRef( null ); // What: Group Rail Reference. Why: The scroll-edge fade effect below needs the Group rail's own element. How: This is attached to that rail's ref prop.
	const typRaiRef = React.useRef( null ); // What: Type Rail Reference. Why: Same reasoning as groRaiRef, for the Type rail. How: This is attached to that rail's ref prop.


	React.useEffect( () => { // What: Rail Fade Effect. Why: Every filter rail shares the same scroll-edge fade affordance. How: This wires at-start/at-end tracking for each mounted rail and tears it down on change.


		const valRaiArr = [ tabRaiRef.current, groRaiRef.current, typRaiRef.current ].filter( Boolean ); // What: Valid Rail Array. Why: Only whichever rails are actually mounted right now (the Group/Type rows can be entirely absent) should get listeners. How: This filters out any null ref.


		const cleFunArr = valRaiArr.map( ( curRaiEle ) => { // What: Cleanup Function Array. Why: Each rail needs its own independent listener/observer pair, and its own independent teardown. How: This maps each element to a closure removing exactly its own listener and disconnecting its own observer.


			const updFadFun = () => { // What: Update Fade Function. Why: The at-start/at-end classes need recomputing every time this rail scrolls or resizes. How: This toggles both classes based on the rail's own current scroll position versus its scrollable width.


				const canScrBoo = curRaiEle.scrollWidth - curRaiEle.clientWidth > 1;                                       // What: Can Scroll Boolean. Why: A rail that doesn't actually overflow should just show both fades as "at rest" rather than neither. How: This compares the rail's own full content width against its visible width.
				const reaStaBoo = !canScrBoo || curRaiEle.scrollLeft <= 1;                                                 // What: Reached Start Boolean. Why: The left edge fade should hide once the rail can't scroll left any further. How: This is true whenever the rail can't scroll at all, or is already scrolled to (near) its start.
				const reaEndBoo = !canScrBoo || curRaiEle.scrollLeft + curRaiEle.clientWidth >= curRaiEle.scrollWidth - 1; // What: Reached End Boolean. Why: The right edge fade should hide once the rail can't scroll right any further. How: This is true whenever the rail can't scroll at all, or is already scrolled to (near) its end.


				curRaiEle.classList.toggle( 'at-start', reaStaBoo ); // What: At-Start Toggle Call. Why: This is the actual class application described above. How: This applies reaStaBoo onto curRaiEle's own classList.

				curRaiEle.classList.toggle( 'at-end', reaEndBoo ); // What: At-End Toggle Call. Why: This is the actual class application described above. How: This applies reaEndBoo onto curRaiEle's own classList.


			};


			updFadFun(); // What: Initial Update Call. Why: The classes need to be correct immediately on mount, without waiting for a scroll or resize event. How: This invokes updFadFun once, synchronously.

			curRaiEle.addEventListener( 'scroll', updFadFun, { passive : true } ); // What: Scroll Listener Call. Why: The classes must stay correct as the user actually scrolls this rail. How: This re-runs updFadFun on every scroll event.


			const resObsObj = new ResizeObserver( updFadFun ); // What: Resize Observer Object. Why: The filter rows/Show row's own content can change width (a group added/removed, a picker created/deleted) without the rail itself scrolling. How: This re-runs updFadFun whenever the observed element's size changes.


			resObsObj.observe( curRaiEle ); // What: Resize Observer Start Call. Why: The observer above does nothing until it's actually told what to watch. How: This starts watching curRaiEle for size changes.



			return () => { // What: Per-Rail Cleanup Return. Why: This exact rail's own listener/observer must not outlive this effect run. How: This removes the scroll listener and disconnects the observer for curRaiEle specifically.


				curRaiEle.removeEventListener( 'scroll', updFadFun ); // What: Scroll Unsubscribe Call. Why: The listener must not outlive this effect run. How: This removes updFadFun from curRaiEle.
				resObsObj.disconnect();                               // What: Observer Disconnect Call. Why: The observer must not outlive this rail either. How: This disconnects resObsObj.


			};


		});



		return () => cleFunArr.forEach( ( curCleFun ) => curCleFun() ); // What: Effect Cleanup Return. Why: Every rail's own cleanup must actually run when this effect re-runs or unmounts. How: This calls every function collected in cleFunArr.


	}, [ staAppObj.pickers.length, exiGroArr.length, exiModArr.length, groFilStr, typFilStr, visPicArr.length ] ); // What: Effect Dependency Array. Why: Any of these can change whether a rail's own content actually overflows, requiring the fades to be recomputed. How: staAppObj.pickers.length/exiGroArr.length/exiModArr.length/visPicArr.length all reflect content-size changes, and groFilStr/typFilStr reflect the Show row's own content changing under a new filter.


	const scrTopFun = () => { // What: Scroll Top Function. Why: Both canCreFun below and the successful-create flow need to scroll the shared .main container back to the top. How: This queries for .main directly and scrolls it, if found.


		const scrConEle = document.querySelector( '.main' ); // What: Scroll Container Element. Why: The scroll call below needs the actual live DOM node. How: This queries for the .main element directly.


		if ( scrConEle ) scrConEle.scrollTo({ // What: Scroll Call Guard. Why: Only a genuinely-found container should be scrolled. How: This scrolls .main to the top if it exists.


			behavior : redMotFun() ? 'auto' : 'smooth', // What: Behavior. Why: A user who prefers reduced motion gets an instant jump instead of a glide. How: This picks 'auto' under reduced motion, otherwise 'smooth'.
			top      : 0                                // What: Top. Why: The page's start is its top. How: This scrolls to y 0.


		});


	};


	const canCreFun = () => { // What: Cancel Create Function. Why: Backing out of the create form should scroll up first (while the tall form is still mounted, so there's real distance to glide), then swap back to the picker view. How: This scrolls to top immediately under reduced motion (closing right away), otherwise scrolling first and closing 240ms later once the glide has had time to play.


		if ( redMotFun() ) { setCreOpeBoo( false ); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion shouldn't wait through a skipped scroll animation. How: This closes the form immediately and returns.



		scrTopFun(); // What: Scroll Up Call. Why: The tall form needs to still be mounted while this scroll actually plays, or there's nothing to glide past. How: This calls scrTopFun while creOpeBoo is still true.

		setTimeout( () => setCreOpeBoo( false ), 240 ); // What: Delayed Close Call. Why: The form must not vanish until the scroll-up glide has had time to actually finish. How: This closes the form 240ms later.


	};



	return (


		<div className='tab tab--picker'>{ /* What: Tab Picker Div Element. Why: This is TabPicCom's own root, holding the help overlay, the header, and the body (filters, Show row, and the active create/view content). How: This wraps every piece of the whole Pickers page. */ }


			<HelOveCom
				actModBoo={ helOpeBoo }
				helIteArr={ PIC_HEL_ARR }
				onCloAllFun={ helExiFun }
			/>{ /* What: Help Overlay Component. Why: This page needs its own highlighted-tooltip walkthrough. How: This is fed PIC_HEL_ARR and stays mounted regardless of helOpeBoo, gating its own visibility internally. */ }

			<header className='picker-h-head'>{ /* What: Header Element. Why: The kicker/help row, the brand lead, and the intro paragraph form one page header. How: This wraps those three pieces. */ }


				<div className='kicker-row'>{ /* What: Kicker Row Div Element. Why: The page kicker and the Help toggle sit side by side. How: This wraps those two pieces. */ }


					<div className='kicker'>Pickers</div>{ /* What: Kicker Div Element. Why: A small eyebrow label orients the reader before the page's own heading below. How: This renders the literal word "Pickers". */ }

					<HelButCom
						actModBoo={ helOpeBoo }
						onClick={ () => setHelOpeBoo( ( preOpeBoo ) => !preOpeBoo ) }
					/>{ /* What: Help Button Component. Why: The user needs a way to toggle this page's own help mode. How: This flips helOpeBoo on click. */ }


				</div>

				<div className='picker-h-lead'>{ /* What: Lead Div Element. Why: The brand mark and the page's own main heading sit side by side. How: This wraps those two pieces. */ }


					<button
						className='brand-mark'
						type='button'
						aria-label='Ease My Life link to go to the Today page'
						onClick={ onNavHomFun }
					>{ /* What: Brand Button Element. Why: The logo also works as a shortcut back to the Today tab. How: This wraps the logo svg and calls onHome on click. */ }


						<svg
							viewBox='8 8 528 528'
							fill='none'
							aria-hidden='true'
						>{ /* What: Logo Svg Element. Why: This draws the same small square "Ease My Life" logo mark app.jsx's own TabBarCom uses, so every page's own header reads as one product. How: This is a fixed-viewBox icon composed of a grid, a rounded-square badge outline, and a clipped glyph path. */ }


							<defs>{ /* What: Clip Defs Element. Why: An SVG clipPath can only be applied via a defined, referenced id, not inline. How: This holds the one clipPath definition the glyph path below references. */ }


								<clipPath
									id='braMarCli--pic'
									clipPathUnits='userSpaceOnUse'
								>{ /* What: Badge Clippath Element. Why: The glyph path's own curves slightly overshoot the rounded-square badge and need to be masked to it. How: This defines a rounded-square clip region under a fixed id local to this one page's own logo instance. */ }


									<rect
										width='512'
										height='512'
										y='16'
										x='16'
										rx='75'
										ry='75'
									/>{ /* What: Clip Rect Element. Why: The clip region itself needs a concrete shape to clip to. How: This draws the rounded-square shape that the clipPath above exposes for reference. */ }


								</clipPath>


							</defs>

							<g style={{ stroke : 'var(--accent-soft)', strokeWidth : 16 }}>{ /* What: Grid Group Element. Why: Groups the 8 decorative background lines so they can share one stroke style instead of repeating it 8 times. How: This sets the shared stroke/strokeWidth once, applied to every child path below. */ }


								<path d='M 528 112 L 16 112' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment; its siblings below draw the rest of the grid. */ }

								<path d='M 216 528 L 216 16' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment; its siblings draw the rest of the grid. */ }

								<path d='M 320 528 L 320 16' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment; its siblings draw the rest of the grid. */ }

								<path d='M 424 528 L 424 16' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment; its siblings draw the rest of the grid. */ }

								<path d='M 112 528 L 112 16' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment; its siblings draw the rest of the grid. */ }

								<path d='M 528 216 L 16 216' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment; its siblings draw the rest of the grid. */ }

								<path d='M 528 320 L 16 320' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment; its siblings draw the rest of the grid. */ }

								<path d='M 528 424 L 16 424' />{ /* What: Grid Line Element. Why: This is one of the purely decorative graph-paper lines behind the logo mark. How: This draws one straight horizontal/vertical segment, completing the grid. */ }


							</g>

							<rect
								style={{ strokeWidth : 16, strokeLinecap : 'round', strokeLinejoin : 'round', stroke : 'currentColor' }}
								width='512'
								height='512'
								y='16'
								x='16'
								rx='75'
								ry='75'
							/>{ /* What: Badge Rect Element. Why: The logo needs a visible rounded-square border/badge behind the glyph. How: This draws the same rounded-square shape as the clip rect above, but stroked and visible instead of hidden in defs. */ }

							<path
								style={{ fill : 'currentColor', stroke : 'currentColor' }}
								d='M 24.467 527.792 C 67.266 416.298 77.088 228.913 172.207 434.412 C 200.739 535.77 262.562 434.412 314.873 292.51 C 381.45 120.201 450.381 44.636 528.854 24.365 C 521.725 22.337 512.215 24.365 493.193 34.5 C 369.548 105.451 295.85 292.51 234.029 363.461 C 186.473 414.14 167.451 241.831 124.651 262.102 C 101.828 270.008 60.133 375.754 24.467 527.792 Z'
								strokeWidth='8'
								strokeLinecap='round'
								strokeLinejoin='round'
								clipPath='url(#braMarCli--pic)'
							/>{ /* What: Glyph Path Element. Why: This is the actual squiggly "Ease My Life" brand glyph drawn inside the badge. How: This path is clipped to the rounded-square badge so its curves never spill outside it. */ }


						</svg>


					</button>

					<div className='section-h'>{ /* What: Section Header Div Element. Why: The page's own main heading needs its own wrapper for layout. How: This wraps section-title. */ }


						<h1 className='section-title'><span className='picker-title-accent'>Easing</span> your life, one pick at a time.</h1>{ /* What: Title Heading Element. Why: Every tab needs its own main heading. How: This renders a fixed heading with its first word given its own accent-colored span. */ }


					</div>


				</div>

				<p className='section-sub picker-h-sub'>Each picker has its own rule for how it chooses. Run a picker for a random item or just select an item manually and then push it to the Today tab. You can also create an entirely new picker here, add to its list of items, or edit an existing picker and its items&rsquo; settings. Conditionals and reminders can be managed in the <button type='button' className='sub-tablink' onClick={ () => onNavTabFun && onNavTabFun( 'data' ) }>Data page</button>.</p>{ /* What: Intro Paragraph Element. Why: A first-time user needs a plain-language orientation to the whole page before touching anything. How: This renders a fixed explanatory sentence with an inline link that switches to the Data tab. */ }


			</header>

			<div
				className='picker-body'
				style={ touBusObj.resTopNum ? { paddingTop : touBusObj.resTopNum } : undefined }
			>{ /* What: Body Div Element. Why: A running tour can reserve extra top padding to keep its own coach clear of the header. How: This wraps every filter row, the Show row, and the active create/view content below. */ }


				<div className='stat-filters ob-picker-content'>{ /* What: Filters Div Element. Why: The Group row, the Type row, and the Show row all belong to one shared filter block the Pickers page tour can target together. How: This wraps every stat-filter-row below. */ }


					{ exiGroArr.length > 1 && ( // What: Group Row Check. Why: A single-group install has nothing to actually filter by. How: This renders the whole Group filter row only once more than one distinct group exists.


						<div className='stat-filter-row'>{ /* What: Group Filter Row Div Element. Why: The "Group" label and its own pill rail sit side by side. How: This wraps stat-filter-lbl and the picker-groups rail. */ }


							<span className='stat-filter-lbl'>Group</span>{ /* What: Group Filter Label Span Element. Why: The rail below needs a readable label. How: This renders the literal word "Group". */ }

							<div
								ref={ groRaiRef }
								className='picker-groups'
								role='tablist'
								aria-label='Filter pickers by group'
							>{ /* What: Group Rail Div Element. Why: Every distinct group plus the fixed "All" pill need a horizontally-scrolling tab list. How: This wraps the "All" pill and one pill per entry in exiGroArr. */ }


								<button
									className={ ` picker-group-pill   ${ groFilStr === 'all' ? 'is-on' : '' } ` }
									type='button'
									role='tab'
									aria-selected={ groFilStr === 'all' }
									onClick={ () => { // What: On Click Handler. Why: The All pill clears the group filter. How: This resets the filter, closes the create form, and selects the first visible picker.


										setGroFilStr( 'all' );                                                            // What: Group Filter Reset Call. Why: The All pill clears the group filter. How: This writes 'all' into groFilStr.
										setCreOpeBoo( false );                                                            // What: Create Close Call. Why: Choosing a filter or picker closes the create form. How: This resets creOpeBoo to false.
										setActPicStr( staAppObj.pickers.find( ( picCurObj ) => !picCurObj.hidden )?.id ); // What: Active Picker Reset Call. Why: The Show row should land on a real picker. How: This selects the first visible picker's id.


									} }
								>{ /* What: All Group Pill Button Element. Why: The user needs a way to clear the Group filter back to unfiltered. How: This resets groFilStr to 'all', closes the create form, and jumps to the first visible picker. */ }


									All

									<span className='picker-group-count'>{ staAppObj.pickers.filter( ( picCurObj ) => !picCurObj.hidden ).length }</span>{ /* What: Count Span Element. Why: The "All" pill needs its own total count. How: This counts every visible picker regardless of group. */ }


								</button>

								{ exiGroArr.map( ( curGroStr ) => { // What: Group Pill List Render. Why: Every existing group needs its own selectable filter pill with its own count. How: This maps exiGroArr to one button per curGroStr.


									const picCouNum = staAppObj.pickers.filter( ( picCurObj ) => picCurObj.group === curGroStr && !picCurObj.hidden ).length; // What: Picker Count Number. Why: Each group pill needs to show how many visible pickers actually belong to it. How: This counts staAppObj.pickers matching both curGroStr and visibility.



									return (


										<button
											key={ curGroStr }
											className={ ` picker-group-pill   ${ groFilStr === curGroStr ? 'is-on' : '' } ` }
											type='button'
											role='tab'
											aria-selected={ groFilStr === curGroStr }
											onClick={ () => setGroFilStr( curGroStr ) }
										>{ /* What: Group Pill Button Element. Why: Tapping a group pill should narrow the Show row down to just that group. How: This writes curGroStr into groFilStr. */ }


											{ curGroStr }{ /* What: Pill Name Expression. Why: Every group pill needs its own visible label. How: This renders curGroStr. */ }

											<span className='picker-group-count'>{ picCouNum }</span>{ /* What: Pill Count Span Element. Why: Each pill shows how many pickers it holds. How: This renders picCouNum. */ }


										</button>


									);


								}) }


							</div>


						</div>


					) }

					{ exiModArr.length > 1 && ( // What: Type Row Check. Why: A single-mode install has nothing to actually filter by. How: This renders the whole Type filter row only once more than one distinct mode exists.


						<div className='stat-filter-row'>{ /* What: Type Filter Row Div Element. Why: The "Type" label and its own pill rail sit side by side. How: This wraps stat-filter-lbl and the picker-groups--type rail. */ }


							<span className='stat-filter-lbl'>Type</span>{ /* What: Type Filter Label Span Element. Why: The rail below needs a readable label. How: This renders the literal word "Type". */ }

							<div
								ref={ typRaiRef }
								className='picker-groups picker-groups--type'
								role='tablist'
								aria-label='Filter pickers by type'
							>{ /* What: Type Rail Div Element. Why: Every distinct mode plus the fixed "All" pill need a horizontally-scrolling tab list. How: This wraps the "All" pill and one pill per entry in exiModArr. */ }


								<button
									className={ ` picker-group-pill   ${ typFilStr === 'all' ? 'is-on' : '' } ` }
									type='button'
									role='tab'
									aria-selected={ typFilStr === 'all' }
									onClick={ () => { // What: On Click Handler. Why: The All pill clears the type filter. How: This resets the filter, closes the create form, and selects the first visible picker.


										setTypFilStr( 'all' );                                                            // What: Type Filter Reset Call. Why: The All pill clears the type filter. How: This writes 'all' into typFilStr.
										setCreOpeBoo( false );                                                            // What: Create Close Call. Why: Choosing a filter or picker closes the create form. How: This resets creOpeBoo to false.
										setActPicStr( staAppObj.pickers.find( ( picCurObj ) => !picCurObj.hidden )?.id ); // What: Active Picker Reset Call. Why: The Show row should land on a real picker. How: This selects the first visible picker's id.


									} }
								>{ /* What: All Type Pill Button Element. Why: The user needs a way to clear the Type filter back to unfiltered. How: This resets typFilStr to 'all', closes the create form, and jumps to the first visible picker. */ }


									All

									<span className='picker-group-count'>{ staAppObj.pickers.filter( ( picCurObj ) => !picCurObj.hidden ).length }</span>{ /* What: Count Span Element. Why: The "All" pill needs its own total count. How: This counts every visible picker regardless of mode. */ }


								</button>

								{ exiModArr.map( ( curModStr ) => { // What: Type Pill List Render. Why: Every existing mode needs its own selectable filter pill with its own count. How: This maps exiModArr to one button per curModStr.


									const picCouNum = staAppObj.pickers.filter( ( picCurObj ) => picCurObj.mode === curModStr && !picCurObj.hidden ).length; // What: Picker Count Number. Why: Each type pill needs to show how many visible pickers actually use that mode. How: This counts staAppObj.pickers matching both curModStr and visibility.



									return (


										<button
											key={ curModStr }
											className={ ` picker-group-pill   ${ typFilStr === curModStr ? 'is-on' : '' } ` }
											type='button'
											role='tab'
											aria-selected={ typFilStr === curModStr }
											onClick={ () => setTypFilStr( curModStr ) }
										>{ /* What: Type Pill Button Element. Why: Tapping a type pill should narrow the Show row down to just that mode. How: This writes curModStr into typFilStr. */ }


											{ SED_NAM_OBJ.MOD_DEF_OBJ[ curModStr ].labStr }{ /* What: Pill Name Expression. Why: Every type pill needs its mode's visible label. How: This renders the mode's label. */ }

											<span className='picker-group-count'>{ picCouNum }</span>{ /* What: Pill Count Span Element. Why: Each pill shows how many pickers it holds. How: This renders picCouNum. */ }


										</button>


									);


								}) }


							</div>


						</div>


					) }

					<div className='stat-filter-row'>{ /* What: Show Filter Row Div Element. Why: The "Show" label and the actual per-picker tab rail sit side by side. How: This wraps stat-filter-lbl and the picker-tabs rail. */ }


						<span className='stat-filter-lbl'>Show</span>{ /* What: Show Filter Label Span Element. Why: The rail below needs a readable label. How: This renders the literal word "Show". */ }

						<div
							ref={ tabRaiRef }
							key={ groFilStr + '|' + typFilStr }
							className='picker-tabs'
						>{ /* What: Picker Tabs Div Element. Why: The Add New Picker tab plus one tab per currently-visible picker need a horizontally-scrolling rail; re-keying by the two filters together replays each tab's own stagger-in animation whenever the filtered set changes. How: This wraps the Add New Picker tab and one tab per entry in sorPicArr. */ }


							{ tutProBoo ? ( // What: Tutorials In Progress Check. Why: Distinct from disAddBoo below, this tooltip's wording ("until all tutorials are completed") would be misleading during a Replay of the Pickers page tour, which runs AFTER the checklist finishes, when tutProBoo is always false, so that case still falls through to the plain disabled button with no tooltip. How: This renders a disabled, explanatory InfTipCom instead of the real button while the guided checklist is still in progress.


								<InfTipCom
									className={ ` picker-tab   picker-tab--add   picker-tab--enter   is-tour-disabled   ${ creOpeBoo ? 'is-on' : '' } ` }
									actNamStr='Add New Picker'
									labTexStr='This button is disabled until all tutorials are completed.'
								>{ /* What: Info Tip Component. Why: A disabled add tab still needs to explain why it can't be clicked yet. How: This wraps the same visible label the real tab uses. */ }


									<span
										className='picker-tab-add-icon'
										aria-hidden='true'
									>{ /* What: Add Icon Span Element. Why: The add tab leads with a decorative plus glyph. How: This is hidden from screen readers and wraps the icon. */ }


										<IcoSvgCom
											icoNamStr='pluEle'
											sizValNum={ 16 }
										/>{ /* What: Icon Svg Component. Why: The add tab needs a recognizable "add" glyph. How: This renders the 'pluEle' icon at a fixed size. */ }


									</span>

									<span className='picker-tab-name'>Add New Picker</span>{ /* What: Tab Name Span Element. Why: The add tab needs its own visible label. How: This renders the literal text "Add New Picker". */ }


								</InfTipCom>


							) : ( // What: Add Button Branch. Why: Outside the guided checklist, the real working Add New Picker button belongs here instead. How: This renders the else branch, taken while tutProBoo is false.


								<button
									className={ ` picker-tab   picker-tab--add   picker-tab--enter   ${ creOpeBoo ? 'is-on' : '' } ` }
									style={{ animationDelay : '0ms' }}
									type='button'
									disabled={ disAddBoo }
									onClick={ () => setCreOpeBoo( true ) }
								>{ /* What: Add Picker Tab Button Element. Why: This is the real entry point into PicForCom's own create flow. How: This opens creOpeBoo, disabled only during the page tour's own intercepted step. */ }


									<span
										className='picker-tab-add-icon'
										aria-hidden='true'
									>{ /* What: Add Icon Span Element. Why: The add tab leads with a decorative plus glyph. How: This is hidden from screen readers and wraps the icon. */ }


										<IcoSvgCom
											icoNamStr='pluEle'
											sizValNum={ 16 }
										/>{ /* What: Icon Svg Component. Why: The add tab needs a recognizable "add" glyph. How: This renders the 'pluEle' icon at a fixed size. */ }


									</span>

									<span className='picker-tab-name'>Add New Picker</span>{ /* What: Tab Name Span Element. Why: The add tab needs its own visible label. How: This renders the literal text "Add New Picker". */ }


								</button>


							) }

							{ sorPicArr.map( ( curPicObj, picIndNum ) => ( // What: Picker Tab List Render. Why: Every currently-visible picker needs its own selectable tab, staggered in by its own position. How: This maps sorPicArr to one button per curPicObj.


								<button
									key={ curPicObj.id }
									className={ ` picker-tab   picker-tab--enter   ${ !creOpeBoo && curPicObj.id === actPicStr ? 'is-on' : '' } ` }
									style={{ animationDelay : ( ( picIndNum + 1 ) * 40 ) + 'ms' }}
									onClick={ () => { // What: On Click Handler. Why: Tapping a picker's tab shows that picker. How: This closes the create form and selects the picker.


										setCreOpeBoo( false );        // What: Create Close Call. Why: Choosing a filter or picker closes the create form. How: This resets creOpeBoo to false.
										setActPicStr( curPicObj.id ); // What: Active Picker Set Call. Why: This tab's picker becomes the shown one. How: This writes curPicObj.id into actPicStr.


									} }
								>{ /* What: Picker Tab Button Element. Why: Tapping a picker's own tab should select it and close the create form. How: This writes curPicObj.id into actPicStr. */ }


									<span className='picker-tab-name'>{ curPicObj.name }</span>{ /* What: Tab Name Span Element. Why: Every tab needs its own picker name. How: This renders curPicObj.name. */ }

									<span className='picker-tab-mode'>{ SED_NAM_OBJ.MOD_DEF_OBJ[ curPicObj.mode ].labStr }</span>{ /* What: Tab Mode Span Element. Why: Every tab also names its picker's mode. How: This renders the mode's label. */ }


								</button>


							)) }


						</div>


					</div>


				</div>

				<div
					key={ creOpeBoo ? '__new' : ( actPicStr || '__none' ) }
					className='tab-fade ob-picker-content'
				>{ /* What: Content Fade Div Element. Why: Switching between create/view (or between two different pickers) should play a fade transition, and React needs a stable key to treat each as a distinct mounted instance. How: This wraps whichever of PicForCom/PicVieCom currently applies. */ }


					{ creOpeBoo ? ( // What: Create Open Check. Why: The body shows either the create form or the selected picker's view. How: This picks PicForCom while creOpeBoo is on, otherwise PicVieCom.


						<PicForCom
							conObjArr={ staAppObj.conditionals || [] }
							exiGroArr={ exiGroArr }
							iniForObj={ touBusObj.preFilObj || empIniObj || null }
							iniGroStr={ groFilStr === 'all' ? '' : groFilStr }
							opeTouBoo={ opeTouBoo }
							onCanForFun={ () => { // What: On Cancel Form Handler. Why: Cancelling the create form must also drop any tour state and prefill. How: This clears the tour flag and the prefill, then runs canCreFun.


								setOpeTouBoo( false ); // What: Tour Open Clear Call. Why: The form is no longer tour-driven. How: This resets opeTouBoo to false.
								setEmpIniObj( null );  // What: Empty Prefill Clear Call. Why: A cancelled form should not reopen with the old prefill. How: This resets empIniObj to null.
								canCreFun();           // What: Cancel Create Call. Why: The rest of the cancel teardown is shared. How: This calls canCreFun.


							} }
							onCrePicFun={ ( payForObj ) => { // What: On Create Function. Why: A successful create must reconcile with whatever the guided-tour checklist expects, then land the user on the freshly-made picker. How: This dedupes an onboarding revisit by name, tags a tour-created picker for later replay matching, then advances the selection once the created id comes back.


								if ( opeTouBoo && !touBusObj.exiIdeStr && staAppObj.pickers.some( ( picCurObj ) => picCurObj.name === payForObj.name ) ) { // What: Onboarding Dedupe Guard. Why: During onboarding, a revisit must never create a second copy of the example picker; instead it should just dedupe by name and advance the tour. How: This is skipped when touBusObj.exiIdeStr is set, since that's an INTENTIONAL replay of an already-finished tutorial (see the picker tour's own Step 2 run()), where payForObj.name matching the prior picker is expected, not a same-session double-fire to guard against.


									setOpeTouBoo( false ); // What: Tour Flag Clear Call. Why: This branch is itself the tour's own completion path, so the flag must not linger. How: This resets opeTouBoo to false.

									canCreFun(); // What: Cancel Create Call. Why: The form must close exactly the same way a manual cancel would. How: This calls the shared canCreFun.

									if ( window.__emlPickerCreated ) window.__emlPickerCreated(); // What: Tour Advance Guard. Why: The tour still needs to advance past its own "create the picker" step, even though nothing new was actually created this time. How: This calls the global tour hook only if it's actually registered.



									return; // What: Early Return. Why: A genuine duplicate must not fall through into the real actions.addPicFun call below. How: This exits the handler immediately.


								}



								const newPicStr = actStoObj.addPicFun({ // What: New Picker String. Why: This is the actual created (or replayed-in-place) picker's own id. How: This calls actions.addPicFun with the payload plus the tour-driven fields above. // What: Replay Update Note. Why: A replay updates the SAME picker in place (via replaceId) instead of creating a duplicate, see store.js's own addPicFun; createdFromSample tags this run's picker either way, so a LATER replay can find it too. How: This is gated on touBusObj.preFilObj, not opeTouBoo, since this tour walks the form via a real click (opeTouBoo only ever gets set by the OTHER, dormant-auto-open prefill entry point above), so opeTouBoo is always false here. // What: Hidden Field Note. Why: While the mini-tour checklist is up, ANY picker created here (via a tutorial's own walkthrough OR the user just clicking this same real button themselves) stays out of the real list until the closing Generate step (mirrors reminders.jsx's own startAdd). How: This is driven by touBusObj.shoCheBoo below.


									...payForObj, // What: Payload Spread. Why: Every field the form collected goes into the new picker. How: This spreads in payForObj.

									hidden : !!touBusObj.shoCheBoo, // What: Hidden. Why: A picker made while the tour checklist is up stays out of sight until the tour finishes. How: This is true while the bus shows the checklist.

									...( touBusObj.preFilObj ? { createdFromSample : touBusObj.samIdeStr } : {} ), // What: Sample Tag Spread. Why: A tour-prefilled picker records which sample it came from. How: This adds createdFromSample only while a prefill is active.
									...( touBusObj.exiIdeStr ? { replaceId : touBusObj.exiIdeStr } : {} )          // What: Replace Id Spread. Why: A tour replay updates its earlier picker in place instead of adding a duplicate. How: This adds replaceId only while the bus names an existing picker.


								});


								if ( opeTouBoo ) { // What: Tour Advance Guard. Why: A genuine tour-driven create (not the dedupe branch above) still needs to advance the tour once it lands. How: This clears opeTouBoo and calls the global tour hook, only while opeTouBoo was actually true.


									setOpeTouBoo( false ); // What: Tour Open Clear Call. Why: The form is no longer tour-driven. How: This resets opeTouBoo to false.

									if ( window.__emlPickerCreated ) window.__emlPickerCreated(); // What: Picker Created Guard. Why: A waiting tour needs to know the picker now exists. How: This calls the registered global callback when there is one.


								}



								setEmpIniObj( null ); // What: Empty Prefill Clear Call. Why: A consumed empty-state prefill must not linger for the next time this form opens. How: This resets empIniObj to null.


								const finAniFun = () => { // What: Finish Animation Function. Why: Both the reduced-motion and animated paths below need the same final state change. How: This closes the form and selects the freshly-created picker.


									setCreOpeBoo( false );     // What: Create Close Call. Why: A successful create closes the form. How: This resets creOpeBoo to false.
									setActPicStr( newPicStr ); // What: Active Picker Set Call. Why: The newly created picker becomes the shown one. How: This writes newPicStr into actPicStr.


								};



								if ( redMotFun() ) { finAniFun(); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion shouldn't wait through a skipped scroll animation. How: This finishes immediately and returns.



								scrTopFun(); // What: Scroll Up Call. Why: The tall form needs to still be mounted while this scroll actually plays, or there's nothing to glide past. How: This calls the shared scrTopFun while creOpeBoo is still true.

								setTimeout( finAniFun, 240 ); // What: Delayed Finish Call. Why: The form must not vanish until the scroll-up glide has had time to actually finish. How: This calls finAniFun 240ms later.


							} }
						/> // What: Picker Form Component. Why: Creating a picker uses the full two-step form. How: This is passed the prefill, the existing groups and conditionals, and the create/cancel handlers.


					) : actPicObj ? ( // What: Picker View Check. Why: With the form closed, the selected picker's own view shows, when there is one. How: This renders PicVieCom only while actPicObj exists.


						<PicVieCom
							picDatObj={ actPicObj }
							staAppObj={ staAppObj }
							actStoObj={ actStoObj }
							aniStyStr={ aniStyStr }
						/> // What: Picker View Component. Why: This is the selected picker's own run stage and pool. How: This is passed the picker plus the shared state, actions, and animation style.


					) : null }


				</div>


			</div>


		</div>


	);


}

// #endregion TabPicCom



export { PicStrCom, TabPicCom }; // What: Named Exports. Why: app.jsx renders TabPicCom as the Pickers tab itself, and settings-previews.jsx reuses PicStrCom for its own pick-animation preview; every other binding in this file is internal-only. How: This re-exports both components declared above.


