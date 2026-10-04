


// #region Imports

import cssModObj from './previews.module.css'; // What: CSS Module Object. Why: Both preview stages are styled from their own module. How: This maps each class name in previews.module.css to its hashed module class.
import React     from 'react';                   // What: React. Why: This is the UI library both of this file's components are built on. How: This is used directly (React.useRef, React.useState, React.useEffect) throughout, instead of importing individual named hooks.


import { durMilFun } from '../../utils/rhythm.js';     // What: Duration Millisecond Function. Why: Timers that wait on a CSS animation must end with it. How: This returns a duration step's length in milliseconds, matching the stylesheet's own --dur-* tokens.
import { IcoSvgCom } from '../../ui/icon.jsx';         // What: Icon Svg Component. Why: The celebration preview's mock done-cards need the same check glyph the real Today list uses on a completed card. How: This is rendered inside CelPreCom's mock card rows, given the 'cheEle' icon name.
import { PicStrCom } from '../../ui/picker-strip.jsx'; // What: Picker Strip Component. Why: The picker-animation preview must show the exact reel/spotlight/dissolve cycle the real Pickers tab renders, not a separate copy of it. How: This is rendered directly inside PicAniCom once the user has pressed Play at least once.

// #endregion Imports



/**
 * previews.jsx = Previews
 *
 * @summary
 * Renders the Settings tab's Appearance preview stages: two components
 * that let the user PLAY the selected effect directly inside Settings
 * rather than only read about it. CelPreCom is a dedicated
 * box, sized like the Today cards area, that fires the real ripple/
 * confetti/sparkle celebration over a small set of mock done-cards.
 * PicAniCom reuses the real PicStrCom component (the exact
 * reel/spotlight/dissolve cycle the Pickers tab itself renders) over a
 * small set of mock candidates.
 *
 * Pressing Play is an explicit request to SEE the animation, so both
 * stages play even under a system-level prefers-reduced-motion setting:
 * the motion is consented to, labeled, and contained in these stages, whose
 * own module leaves the previewed animations running, and PicStrCom's
 * forMotBoo does the same for the pick animation. The Settings copy itself
 * states that the app will not animate on its own while the OS setting
 * is on.
 *
 * An earlier version of these two stages instead honored prefers-
 * reduced-motion directly, rendering a static end-state with their own
 * trigger buttons disabled upstream; that behavior was replaced by this
 * explicit-consent design.
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

// #region PRE_CAN_ARR

/**
 * PRE_CAN_ARR = Preview Candidate Array
 *
 * @summary
 * The picker-animation preview's own small mock item pool to cycle
 * through, since it must work even before the user has created any
 * pickers of their own. This is passed straight through to PicStrCom
 * as its own canIteArr prop.
 *
 * Every entry shares this exact shape, and none of them repeat these
 * same fields' own boilerplate comments on their own lines (see the
 * "Repeated-shape object literals" comment exception in CLAUDE.md):
 *
 * - `id` (String): Id is PicStrCom's own required identifier field
 *   for this mock candidate, compared against the picked candidate's
 *   own id to find its row/position.
 *
 * - `name` (String): Name is the mock candidate's own display text,
 *   rendered as this row's visible label inside PicStrCom.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const PRE_CAN_ARR = [ // What: Preview Candidate Array. Why: The picker-animation preview needs its own mock pool so it works before any real picker exists. How: PicAniCom passes this straight to PicStrCom as canIteArr.


	{ id : 'pv1', name : 'Sort the mail'      }, // What: Sort The Mail Candidate. Why: This is one mock item the preview reel cycles past. How: PicStrCom renders its name as one strip row.
	{ id : 'pv2', name : 'Water the plants'   }, // What: Water The Plants Candidate. Why: This is one mock item the preview reel cycles past. How: PicStrCom renders its name as one strip row.
	{ id : 'pv3', name : 'Wipe the counters'  }, // What: Wipe The Counters Candidate. Why: This is one mock item the preview reel cycles past. How: PicStrCom renders its name as one strip row.
	{ id : 'pv4', name : 'Take out recycling' }, // What: Take Out Recycling Candidate. Why: This is one mock item the preview reel cycles past. How: PicStrCom renders its name as one strip row.
	{ id : 'pv5', name : 'Sweep the floor'    }, // What: Sweep The Floor Candidate. Why: This is one mock item the preview reel cycles past. How: PicStrCom renders its name as one strip row.
	{ id : 'pv6', name : 'Fold laundry'       }  // What: Fold Laundry Candidate. Why: This is one mock item the preview reel cycles past. How: PicStrCom renders its name as one strip row.


];

// #endregion PRE_CAN_ARR



// #region PRE_CAR_ARR

/**
 * PRE_CAR_ARR = Preview Card Array
 *
 * @summary
 * The celebration preview's own few mock "done" cards for the ripple/
 * confetti/sparkle effects to visibly act on, mirroring the Today list
 * rather than the progress ring. This is mapped inside CelPreCom to
 * render one mock todCarDiv row per entry.
 *
 * Every entry shares this exact shape, and none of them repeat these
 * same fields' own boilerplate comments on their own lines (see the
 * "Repeated-shape object literals" comment exception in CLAUDE.md):
 *
 * - `ideStr` (String): Identifier String is every rendered mock card's
 *   own stable, unique React key, used directly as the card row's own
 *   key.
 *
 * - `namStr` (String): Name String is a real Today card's own item
 *   name, rendered inside the card's own name line.
 *
 * - `picStr` (String): Picker String names the picker a real Today
 *   card's item came from, rendered inside the card's own meta row.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const PRE_CAR_ARR = [ // What: Preview Card Array. Why: The celebration preview needs a few mock done-cards for its effects to act on. How: CelPreCom maps this to one mock todCarDiv row per entry.


	{ ideStr : 'pc1', namStr : 'Make the bed',     picStr : 'Morning' }, // What: Make The Bed Card. Why: This is one mock done-card the celebration acts on. How: CelPreCom renders it as one todCarDiv row.
	{ ideStr : 'pc2', namStr : 'Water the plants', picStr : 'Chores'  }, // What: Water The Plants Card. Why: This is one mock done-card the celebration acts on. How: CelPreCom renders it as one todCarDiv row.
	{ ideStr : 'pc3', namStr : 'Inbox zero',       picStr : 'Focus'   }  // What: Inbox Zero Card. Why: This is one mock done-card the celebration acts on. How: CelPreCom renders it as one todCarDiv row.


];

// #endregion PRE_CAR_ARR

// #endregion Constants



// #region Components

// #region CelPreCom

/**
 * CelPreCom = Celebration Preview Component
 *
 * @summary
 * Renders a dedicated preview box, sized like the Today cards area, that
 * plays the real ripple/confetti/sparkle celebration effect over a small
 * set of mock done-cards. Bumping the repTokNum prop replays the effect;
 * the effect always plays at full motion, since an explicit Play press
 * is itself the user's own consent to see it, even under a system
 * reduced-motion preference.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.repTokNum - Replay Token Number: {@link celTokNum}
 * @param props.styKeyStr - Style Key String: {@link celStyStr}
 *
 * @returns The preview stage: the mock done-cards row plus whichever
 * particles the current effect has staged on top of it.
 *
 * @example
 * ```tsx
 * CelPreCom({ repTokNum, styKeyStr }) // => <CelPreCom />
 * ```
 *
*/

function CelPreCom ( { repTokNum, styKeyStr } ) {


	const carConRef = React.useRef( null ); // What: Card Container Reference. Why: The ripple style animates the real DOM card elements directly, so it needs a stable handle on their shared wrapper to query into. How: This is attached via the mock cards row's own ref prop below and read inside the replay effect.
	const firMouRef = React.useRef( true ); // What: First Mount Reference. Why: The very first render must not immediately replay the effect just because repTokNum already holds a defined starting value. How: This starts true and is flipped false the first time the effect below runs, gating the early return that skips that first run.

	const [ parIteArr, setParIteArr ] = React.useState( [] ); // What: Particle Item Array And Setter. Why: The confetti/sparkle styles need a list of already-rolled particle items to render. How: This starts empty and is populated by the replay effect below whenever repTokNum bumps.


	React.useEffect( () => { // What: Replay Effect. Why: Bumping repTokNum is Settings' own explicit "Play" trigger, and this is what actually restarts the ripple exhale cascade and/or rolls a fresh batch of confetti/sparkle particles. How: This skips its own first run on mount, then (depending on styKeyStr) restarts the card exhale animation, rolls new particles, or clears them, always tearing down its own timeouts on cleanup.


		if ( firMouRef.current ) { firMouRef.current = false; return; } // What: First Mount Guard. Why: The effect must not fire just because the component mounted; only an actual repTokNum bump (a real Play press) should replay anything. How: This flips firMouRef false and bails out, but only on this component's very first effect run.



		const carEleArr = carConRef.current ? [ ...carConRef.current.querySelectorAll( '[data-element-name-hook~="preCarDiv"]' ) ] : []; // What: Card Element Array. Why: The ripple style needs the actual rendered card DOM elements to animate directly. How: This queries every preCarDiv hook inside carConRef's own current element, or an empty array before it has mounted.

		let ripCleTim; // What: Ripple Clear Timeout. Why: The ripple branch below may schedule a cleanup timeout that this same effect's own cleanup function later needs to be able to cancel. How: This starts undefined and is assigned only inside the ripple branch below.


		if ( styKeyStr === 'ripple' ) { // What: Ripple Style Check. Why: The exhale cascade below only applies when this preview is actually showing the ripple style. How: This restarts every mock card's own staggered exhale animation and schedules its cleanup.


			carEleArr.forEach( ( carCurEle, iteIndNum ) => { // What: Ripple Start Loop. Why: Every mock card needs its own staggered exhale animation restarted, matching the real Today list's own cascade. How: This iterates carEleArr, giving each card a delay proportional to its own position before re-triggering its exhale class.


				carCurEle.classList.remove( cssModObj.todCarDivExhaling ); // What: Exhale Class Reset. Why: A card already mid-animation from a previous Play press must be reset before it can replay. How: This removes the module's isExhaling class so it can be re-added below to actually restart the CSS animation.

				void carCurEle.offsetWidth; // What: Reflow Force. Why: Re-adding the same class immediately after removing it would otherwise be batched by the browser and never restart the animation. How: Reading offsetWidth forces a synchronous layout flush between the remove above and the add below.

				carCurEle.style.setProperty( '--exh-car-del', `${ iteIndNum * durMilFun( 'm03' ) }ms` ); // What: Exhale Delay Set. Why: Each card's own cascade position needs its own staggered start time. How: This writes the '--exh-car-del' custom property, read by the CSS animation, proportional to this card's own index. // Duration Base Minus 3 ~= 67.9ms

				carCurEle.classList.add( cssModObj.todCarDivExhaling ); // What: Exhale Class Restart. Why: This is the actual trigger that (re)starts the CSS exhale animation on this card. How: This re-adds the module's isExhaling class, now that the reflow above guarantees the browser treats it as a fresh start.


			} );


			const ripCleFun = () => { // What: Ripple Cleanup Function. Why: The exhale state must not linger on the mock cards once the cascade has had time to finish. How: This clears both the animation class and its delay custom property from every card.


				carEleArr.forEach( ( carCurEle ) => { // What: Ripple Cleanup Loop. Why: Every card the loop above set exhaling needs its own animation state cleared afterward. How: This iterates carEleArr, clearing both the class and the custom property from each one.


					carCurEle.classList.remove( cssModObj.todCarDivExhaling ); // What: Exhale Class Clear. Why: This class must not linger past the end of the cascade animation. How: This removes the module's isExhaling class from the current card element.

					carCurEle.style.removeProperty( '--exh-car-del' ); // What: Exhale Delay Clear. Why: This inline custom property must not linger past the end of the cascade animation either. How: This removes the '--exh-car-del' custom property from the current card element.


				} );


			};


			ripCleTim = setTimeout( ripCleFun, carEleArr.length * durMilFun( 'm03' ) + durMilFun( 'p07' ) ); // What: Ripple Cleanup Schedule. Why: The cleanup must wait until every staggered card has actually finished its own exhale animation. How: This schedules ripCleFun to run once the last card's own delay plus its animation duration has elapsed. // Duration Base Minus 3 ~= 67.9ms, Duration Base Plus 7 ~= 1130.0ms


		}



		if ( styKeyStr === 'confetti' ) { // What: Confetti Style Check. Why: A fresh batch of confetti particles is only rolled when this preview is actually showing the confetti style. How: This builds and writes 26 randomly-scattered confetti particle items into parIteArr.


			setParIteArr( Array.from( Array( 26 ).keys(), ( iteIndNum ) => ( { // What: Confetti Particle Roll. Why: The confetti style needs a fresh batch of randomly-scattered pieces every time it replays. How: This builds 26 particle items, each with its own random angle, distance, rotation, delay, and opacity.


				angNum : Math.round( Math.random() * 360 ),              // What: Angle Number. Why: Each piece needs its own random direction to fly outward in. How: This is a random integer degree value read by the '--con-dir-ang' custom property.
				delNum : Math.round( Math.random() * 180 ),              // What: Delay Number. Why: Pieces should not all start flying at exactly the same instant. How: This is a random millisecond value applied as this piece's own animationDelay.
				disNum : 70 + Math.random() * 150,                       // What: Distance Number. Why: Each piece needs its own random travel distance. How: This is a random pixel value read by the '--con-tra-off' custom property.
				ideStr : 'c' + repTokNum + '_' + iteIndNum,              // What: Identifier String. Why: Each rendered piece needs a stable, unique React key. How: This concatenates a 'c' tag, the current repTokNum, and this item's own index into one string.
				kinStr : 'confetti',                                     // What: Kind String. Why: The renderer below needs to know which of the two particle shapes this item is. How: This is checked against 'confetti' when choosing between the <i> and <span> markup.
				opaNum : 0.75 + Math.random() * 0.2,                     // What: Opacity Number. Why: Pieces should read as solid confetti rather than translucent. How: This is a random opacity value in a narrow, mostly-opaque range.
				rotStr : Math.round( Math.random() * 540 - 270 ) + 'deg' // What: Rotate String. Why: Each piece needs its own random spin as it flies outward. How: This is a random degree value, already unit-suffixed, read by the '--con-spi-ang' custom property.


			} ) ) ); // What: Confetti State Update. Why: The freshly-rolled batch needs to actually render. How: This writes the 26-item array built above into parIteArr.


		}

		else if ( styKeyStr === 'sparkle' ) { // What: Sparkle Style Check. Why: A fresh batch of sparkle particles is only rolled when this preview is actually showing the sparkle style. How: This builds and writes 22 randomly-placed sparkle particle items into parIteArr.


			setParIteArr( Array.from( Array( 22 ).keys(), ( iteIndNum ) => ( { // What: Sparkle Particle Roll. Why: The sparkle style needs a fresh batch of randomly-placed glints every time it replays. How: This builds 22 particle items, each with its own random position and delay.


				delNum : Math.round( Math.random() * 260 ), // What: Delay Number. Why: Glints should not all appear at exactly the same instant. How: This is a random millisecond value applied as this piece's own animationDelay.
				ideStr : 's' + repTokNum + '_' + iteIndNum, // What: Identifier String. Why: Each rendered piece needs a stable, unique React key. How: This concatenates an 's' tag, the current repTokNum, and this item's own index into one string.
				kinStr : 'sparkle',                         // What: Kind String. Why: The renderer below needs to know which of the two particle shapes this item is. How: This is checked against 'confetti' (falling through to sparkle otherwise) when choosing between the <i> and <span> markup.
				lefNum : Math.round( Math.random() * 100 ), // What: Left Number. Why: Each glint needs its own random horizontal position within the stage. How: This is a random percentage value applied as this piece's own left offset.
				topNum : Math.round( Math.random() * 100 )  // What: Top Number. Why: Each glint needs its own random vertical position within the stage. How: This is a random percentage value applied as this piece's own top offset.


			} ) ) ); // What: Sparkle State Update. Why: The freshly-rolled batch needs to actually render. How: This writes the 22-item array built above into parIteArr.


		}

		else { // What: No Particle Style Fallback. Why: Any style other than confetti/sparkle (the ripple case, whose own effect is card-driven instead) needs no particles of its own. How: This clears parIteArr for every other style.


			setParIteArr( [] ); // What: Particle Clear Fallback. Why: Any style other than 'confetti'/'sparkle' (the 'ripple' case, whose own effect is card-driven, not particle-driven) has no particles of its own. How: This writes an empty array into parIteArr.


		}



		const parCleTim = setTimeout( () => setParIteArr( [] ), durMilFun( 'p09' ) ); // What: Particle Clear Schedule. Why: A rolled batch of particles must not linger onscreen forever once its own fly-out/glint animation has finished. How: This schedules parIteArr back to empty after the p09 duration step, which outlasts every particle's own p06 animation plus its random delay. // Duration Base Plus 9 ~= 1983.0ms



		return () => { // What: Effect Cleanup Function. Why: Neither scheduled timeout may outlive this effect run, whether it re-runs on the next Play press or the component unmounts. How: This clears both the particle-clear and ripple-clear timeouts.


			clearTimeout( parCleTim ); // What: Particle Timeout Clear. Why: A stale particle-clear callback firing after a newer run began would incorrectly clear a different run's particles. How: This cancels the scheduled clearing of parIteArr.

			clearTimeout( ripCleTim ); // What: Ripple Timeout Clear. Why: Same reasoning as the particle timeout, for the ripple cleanup callback. How: This cancels the scheduled clearing of the exhale animation state.


		};


	}, [ repTokNum ] ); // What: Effect Dependency Array. Why: This must only replay when repTokNum itself bumps, a real Play press, never merely because styKeyStr changed on its own, since switching the style dropdown without pressing Play should not retrigger anything. How: repTokNum is the only value this effect's own change-detection is built around.



	return (


		<div className={ cssModObj.celPreDiv }>{ /* What: Celebration Preview Stage Div Element. Why: This is CelPreCom's own root element, sized to match the Today cards area so the preview reads as a faithful copy. How: This wraps the mock done-cards row and the particle overlay that plays on top of it. */ }


			<div
				ref={ carConRef }

				className={ cssModObj.preLisDiv }
			>{ /* What: Celebration Preview Cards Div Element. Why: The ripple style animates these specific card elements directly, so they need a stable container carConRef can query into. How: This renders one mock done-card per entry in PRE_CAR_ARR. */ }


				{ PRE_CAR_ARR.map( ( carCurObj ) => ( // What: Preview Card Map. Why: One mock done-card is needed per entry in PRE_CAR_ARR. How: This maps PRE_CAR_ARR to one todCarDiv row per entry, keyed by its own ideStr.


					<div
						key={ carCurObj.ideStr }

						className={ cssModObj.todCarDiv }

						data-element-name-hook='preCarDiv'
					>{ /* What: Preview Card Div Element. Why: This mirrors the real Today tab's own done-card markup so the ripple/confetti/sparkle effects render identically here. How: This renders the check glyph and the card's own picker/name text. Its data-element-name-hook is read by the completion-celebration preview. */ }


						<span
							className={ cssModObj.carCheSpa }

							aria-hidden='true'
						>{ /* What: Check Span Element. Why: A completed Today card always shows a check glyph. How: This wraps the IcoSvgCom component rendering the 'cheEle' glyph. */ }


							<IcoSvgCom
								className={ cssModObj.cheIcoSvg }

								icoNamStr='cheEle'
								sizSteStr='bas' // Vertical Rhythm Base ~= 14.572px
							/>{ /* What: Icon Svg Component. Why: This is the actual check glyph shown on a completed card. How: This renders the 'cheEle' icon at a fixed size matching the real Today card. */ }


						</span>


						<div className={ cssModObj.carBodDiv }>{ /* What: Card Body Div Element. Why: The picker/name text needs its own grouping wrapper, matching the real Today card markup. How: This wraps the meta row and the name line below. */ }


							<div className={ cssModObj.carMetDiv }>{ /* What: Card Meta Div Element. Why: The picker name needs its own row, matching the real Today card markup. How: This wraps the single picker name span below. */ }


								<span>{ carCurObj.picStr }</span>{ /* What: Meta Picker Span Element. Why: Every real Today card shows which picker an item came from. How: This renders the mock card's own picStr. */ }


							</div>

							<div className={ cssModObj.carNamDiv }>{ carCurObj.namStr }</div>{ /* What: Card Name Div Element. Why: Every real Today card shows the item's own name. How: This renders the mock card's own namStr. */ }


						</div>


					</div>


				) ) }


			</div>



			<div
				className={ cssModObj.preParDiv }

				aria-hidden='true'
			>{ /* What: Celebration Preview Particles Div Element. Why: The confetti/sparkle overlay renders above the mock cards but must never be exposed to assistive tech, since it is purely decorative. How: This renders one piece per entry in parIteArr, each already fully styled/positioned. */ }


				{ parIteArr.map( ( parCurObj ) => ( // What: Particle Item Map. Why: One piece is needed per entry in parIteArr. How: This maps parIteArr to one confetti or sparkle piece per entry, keyed by its own ideStr.


					parCurObj.kinStr === 'confetti' ? ( // What: Confetti Piece Branch. Why: A confetti particle renders as a falling piece instead of a sparkle. How: This renders the if branch, taken whenever parCurObj.kinStr is 'confetti'.


						<i
							key={ parCurObj.ideStr }

							className={ cssModObj.conPieIta }

							style={{
								'--con-dir-ang' : parCurObj.angNum + 'deg',
								'--con-pie-opa' : parCurObj.opaNum,
								'--con-spi-ang' : parCurObj.rotStr,
								'--con-tra-off' : parCurObj.disNum + 'px',
								animationDelay  : parCurObj.delNum + 'ms'
							}}
						/> // What: Confetti Piece Element. Why: This is one falling confetti piece of the celebration. How: This is styled entirely via CSS custom properties read by the conPieIta animation.


					) : ( // What: Sparkle Piece Branch. Why: A non-confetti particle renders as a sparkle piece instead. How: This renders the else branch, taken whenever parCurObj.kinStr isn't 'confetti'.


						<span
							key={ parCurObj.ideStr }

							className={ cssModObj.spaPieSpa }

							style={{
								animationDelay : parCurObj.delNum + 'ms',
								left           : parCurObj.lefNum + '%',
								top            : parCurObj.topNum + '%'
							}}
						>{ /* What: Sparkle Piece Element. Why: This is one glinting sparkle piece of the celebration. How: This is positioned via inline style and renders the fixed sparkle glyph. */ }


							✦


						</span>


					)


				) ) }


			</div>


		</div>


	);


}

// #endregion CelPreCom



// #region PicAniCom

/**
 * PicAniCom = Picker Animation Component
 *
 * @summary
 * Renders a preview box that reuses the real PicStrCom component to
 * play its reel/spotlight/dissolve cycle over a small, fixed set of mock
 * candidates. Shows a static fallback (the fixed landing candidate's own
 * name) until the repTokNum prop first becomes greater than 0; bumping
 * it again afterward remounts PicStrCom and replays the cycle. The
 * cycle is always forced to play at full motion, since an explicit Play
 * press is itself the user's own consent to see it.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.repTokNum - Replay Token Number: {@link picTokNum}
 * @param props.styKeyStr - Style Key String: Which of PicStrCom's own
 *                          animation styles to preview: 'reel',
 *                          'spotlight', or 'dissolve'.
 *
 * @returns Either the live PicStrCom cycle (once Play has been pressed
 * at least once) or a static preview of the fixed landing candidate's
 * own name beforehand.
 *
 * @example
 * ```tsx
 * PicAniCom({ repTokNum, styKeyStr }) // => <PicAniCom />
 * ```
 *
*/

function PicAniCom ( { repTokNum, styKeyStr } ) {


	const picCanObj = PRE_CAN_ARR[ 2 ]; // What: Picked Candidate Object. Why: The preview always needs to land on the same predictable candidate so its own copy stays truthful regardless of which run this is. How: This reads the 3rd mock candidate from PRE_CAN_ARR as a fixed, deterministic landing spot.



	return (


		<div className={ cssModObj.aniStaDiv }>{ /* What: Picker Animation Stage Div Element. Why: This is PicAniCom's own root element, matching the Pickers tab's real stage sizing so the preview reads as a faithful copy. How: This renders either the live PicStrCom cycle or a static fallback, based on whether Play has been pressed. */ }


			{ repTokNum > 0 ? ( // What: Play Pressed Check. Why: The real cycle animation should only mount once the user has actually pressed Play at least once. How: This renders PicStrCom while repTokNum is greater than 0, a static preview of the landing candidate's own name otherwise.


				<PicStrCom
					key={ repTokNum }

					canIteArr={ PRE_CAN_ARR }
					forMotBoo // What: Force Motion Boolean. Why: An explicit Play press is consent to see the animation even under reduced motion. How: This bare true flag tells PicStrCom to skip its own reduced-motion shortcut.
					picIteObj={ picCanObj }
					styKeyStr={ styKeyStr }
				/> // What: Picker Strip Component. Why: This plays the real reel/spotlight/dissolve cycle so the preview shows the actual animation, not a mockup of it. How: This is remounted (via its own key) on every replay, forced to play even under reduced motion since this is an explicit Play press.


			) : ( // What: Static Pick Branch. Why: Before Play is first pressed, the stage still needs something meaningful to show instead of the cycling strip. How: This renders the else branch, taken while repTokNum is still 0.


				<span className={ cssModObj.aniPicSpa }>{ picCanObj.name }</span> // What: Picker Preview Pick Span Element. Why: Before Play is first pressed, the stage still needs to show something meaningful. How: This renders the fixed landing candidate's own name as a static placeholder.


			) }


		</div>


	);


}

// #endregion PicAniCom

// #endregion Components



// #region Exports

export { CelPreCom, PicAniCom }; // What: Named Exports. Why: tab-settings.jsx renders both as the live previews for its own Completion Celebration and Picker Animation style pickers. How: This re-exports the 2 declared above; every other binding in this file is internal-only.

// #endregion Exports


