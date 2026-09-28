


// #region Imports

import React from 'react'; // What: React. Why: LoaReeCom and LoaCarCom is built directly on React's own APIs. How: This is used directly (React.useEffect, React.useState) instead of importing individual named hooks.

// #endregion Imports



/**
 * regeneration-loader.jsx = Regeneration Loader
 *
 * @summary
 * The placeholder that stands in for a picker's daily slot while a new list is
 * generated. LoaReeCom rapidly cycles item names in place; LoaCarCom wraps it
 * in a card that moves from pending to active to settled, and unmounts the
 * reel from the outside once it settles, so the reel itself just keeps cycling
 * until then.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

// #region LoaReeCom

/**
 * LoaReeCom = Loader Reel Component
 *
 * @summary
 * Cycles through canIteArr's own names at a fixed interval, advancing by
 * 1 or 2 each tick so the cycling reads as a genuine shuffle rather than
 * a plain round-robin.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.canIteArr - Candidate Item Array: The candidate pool this
 *                          picker's own slot is drawing from, cycled purely
 *                          for visual effect.
 *
 * @returns The currently-shown candidate's own name, in a span keyed by
 * its own index so each tick replays a fade.
 *
 * @example
 * ```tsx
 * LoaReeCom({ canIteArr }) // => <LoaReeCom />
 * ```
 *
*/

function LoaReeCom ( { canIteArr } ) {


	const [ curIndNum, setCurIndNum ] = React.useState( 0 ); // What: Current Index Number And Setter. Why: This tracks which candidate is currently shown. How: This starts at 0 and is advanced by the cycling effect below.


	React.useEffect( () => { // What: Cycle Effect. Why: The reel needs to keep advancing on its own for as long as it is mounted. How: This starts an interval advancing curIndNum by 1 or 2 (wrapping) every 90ms, and clears it on unmount.


		if ( !canIteArr || canIteArr.length < 2 ) return; // What: Too Few Candidates Guard. Why: Cycling makes no sense with fewer than 2 candidates to alternate between. How: This skips starting the interval at all when canIteArr is missing or too short.



		const cycTimNum = setInterval( () => { // What: Cycle Timer Number. Why: This is the actual recurring advance. How: This holds the interval id so the cleanup below can clear it.


			setCurIndNum( ( preIndNum ) => ( preIndNum + 1 + Math.floor( Math.random() * 2 ) ) % canIteArr.length ); // What: Current Index Advance. Why: Advancing by a random 1 or 2 (rather than a flat 1) reads as a shuffle instead of a mechanical round-robin. How: This computes the next index modulo canIteArr's own length.


		}, 90 ); // What: Cycle Interval. Why: The loader reel advances at a steady quick pace. How: This ticks every 90ms.



		return () => clearInterval( cycTimNum ); // What: Effect Cleanup Return. Why: The interval must not keep firing after this reel unmounts. How: This clears cycTimNum.

		// eslint-disable-next-line react-hooks/exhaustive-deps -- What: Deliberate Dependency Omission. Why: canIteArr is fixed for the reel's whole lifetime, and restarting the interval on a new array reference would visibly stutter the cycle. How: This keeps the dependency array empty so the interval starts once, on mount.
	}, [] ); // What: Effect Dependency Array. Why: This effect only ever needs to start once, on mount; canIteArr itself is fixed for the reel's whole lifetime. How: An empty array means this never re-subscribes.



	return (


		<span
			key={ curIndNum }

			className='loader-reel-name'
		>{ /* What: Loader Reel Name Span Element. Why: The key on curIndNum forces a fresh mount every tick, replaying the fade-in. How: This renders the current candidate's own name, or a non-breaking space while none exists yet. */ }


			{ canIteArr[ curIndNum ]?.name || ' ' }{ /* What: Candidate Name Expression. Why: The reel shows whichever candidate the current index points at. How: This renders that candidate's own name, or a non-breaking space while none exists yet. */ }


		</span>


	);


}

// #endregion LoaReeCom



// #region LoaCarCom

/**
 * LoaCarCom = Loader Card Component
 *
 * @summary
 * Renders one picker's own regeneration slot: a pending dots state, an
 * active cycling-reel (or dots, for a non-pick slot) state, and a
 * settled state showing the final picked/fixed name.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.infRecObj - Info Record Object: The slot's own
 *                          generation-in-progress record: { canArr, ideStr,
 *                          kinStr, staStr, texStr }, built up in TabTodCom's
 *                          own genLisFun.
 * @param props.picRecObj - Picker Record Object: The picker this loader slot
 *                          belongs to.
 *
 * @returns This slot's own loader card, whose visible state follows
 * infRecObj.staStr.
 *
 * @example
 * ```tsx
 * LoaCarCom({ infRecObj, picRecObj }) // => <LoaCarCom />
 * ```
 *
*/

function LoaCarCom ( { infRecObj, picRecObj } ) {


	const sloStaStr = infRecObj?.staStr || 'pending'; // What: Slot Status String. Why: Every branch below renders differently depending on this slot's own current phase. How: This reads infRecObj's own staStr, defaulting to 'pending' before the generator even sets one.
	const sloKinStr = infRecObj?.kinStr || 'pick';    // What: Slot Kind String. Why: A non-pick slot (day-off/charging) has no candidate reel and a fixed settled name instead. How: This reads infRecObj's own kinStr, defaulting to 'pick'.
	const canIteArr = infRecObj?.canArr || [];        // What: Candidate Item Array. Why: Both the settled name lookup and the reel below read this slot's own candidate pool. How: This reads infRecObj's own canArr, defaulting to an empty array.


	const finNamStr = sloKinStr === 'dayoff' // What: Final Name String. Why: The settled state needs one final display name, computed differently per kind. How: This resolves a day-off's own card text (or the picker's own name), a fixed charging message, or the actually-picked candidate's own name.
		? ( infRecObj.texStr || picRecObj.name )                                            // What: Day-Off Name Branch. Why: A day-off slot settles on its own card text. How: This falls back to the picker's own name when the card has no text.
		: sloKinStr === 'charging'                                                          // What: Charging Check. Why: A charging slot has no candidate to settle on. How: This tests for the charging kind next.
		? 'No eligible items for today'                                                     // What: Charging Name Branch. Why: A charging slot settles on a fixed explanation instead of an item. How: This returns the same text a real charging card shows.
		: canIteArr.find( ( canCurObj ) => canCurObj.id === infRecObj.ideStr )?.name ?? ''; // What: Picked Name Branch. Why: A pick slot settles on whichever candidate the generator actually chose. How: This finds that candidate by infRecObj's own ideStr, falling back to an empty string.


	const hasReeBoo = sloKinStr === 'pick' && canIteArr.length > 0; // What: Has Reel Boolean. Why: Only an actual pick slot with real candidates gets the cycling reel; day-off/charging slots just show dots while active. How: This is true only when this is a pick slot with at least one candidate.



	return (


		<article
			className={ ` today-card   today-card--loader   is-${ sloStaStr } ` }

			data-element-name-hook='todCarArt'
		>{ /* What: Loader Card Article Element. Why: This is one picker's own regeneration slot, styled per its own current status. How: This renders a disabled-looking check spot, the body below, and an empty actions strip for layout parity with a real EntCarCom. Its data-element-name-hook is read by Today's own drag-to-reorder and card-scroll code and help mode's Today catalog. */ }


			<span
				className='check'

				data-element-name-hook='carCheSpa'

				aria-hidden='true'
			/>{ /* What: Check Span Element. Why: A loader card still needs the same layout slot a real card's check button occupies. How: This renders an inert, unclickable placeholder. Its data-element-name-hook is read by help mode's Today catalog. */ }


			<div className='today-card-body'>{ /* What: Loader Card Body Div Element. Why: The meta row and name row read as one grouped block, matching a real card's own layout. How: This wraps the meta row and the name row below. */ }


				<div className='today-card-meta'>{ /* What: Loader Card Meta Div Element. Why: The picker's own name needs a consistent meta-row slot, matching a real card's own layout. How: This wraps the picker-name span below. */ }


					<span className='meta-picker'>{ picRecObj.name }</span>{ /* What: Meta Picker Span Element. Why: The user needs to see which picker this slot belongs to while it is still generating. How: This renders picRecObj's own name. */ }


				</div>

				<div className='today-card-name'>{ /* What: Loader Card Name Div Element. Why: This is where the slot's own pending/active/settled visual actually renders. How: This renders exactly one of the three branches below, gated on staStr. */ }


					{ sloStaStr === 'pending' && <span className='loader-pending'>·  ·  ·</span> }{ /* What: Pending Dots Span Element. Why: A slot not yet reached by the cascade shows plain waiting dots. How: This renders only while sloStaStr is 'pending'. */ }



					{ sloStaStr === 'active' && hasReeBoo && <LoaReeCom canIteArr={ canIteArr } /> }{ /* What: Loader Reel Component. Why: An active pick slot with real candidates cycles through them. How: This renders only while sloStaStr is 'active' and hasReeBoo is true. */ }



					{ sloStaStr === 'active' && !hasReeBoo && <span className='loader-pending'>·  ·  ·</span> }{ /* What: Active Dots Span Element. Why: Any other active slot (day-off/charging, or a pick with no candidates) just shows the same waiting dots. How: This renders only while sloStaStr is 'active' and hasReeBoo is false. */ }

					{ sloStaStr === 'settled' && ( // What: Settled State Check. Why: Once this slot's own cascade step finishes, it shows the final resolved name instead of any dots/reel. How: This renders finNamStr only while sloStaStr is 'settled'.


						<span className='loader-reel-name loader-settled'>{ finNamStr }</span> // What: Loader Reel Name Span Element. Why: This is the slot's own final, settled display name. How: This renders finNamStr directly.


					) }


				</div>


			</div>


			<div
				className='today-card-actions'

				data-element-name-hook='carActDiv'
			/>{ /* What: Loader Card Actions Div Element. Why: A loader card still needs the same layout slot a real card's actions strip occupies. How: This renders an empty placeholder, matching a real card's own layout. Its data-element-name-hook is read by each Today card's own row-click handler, which ignores clicks inside it and help mode's Today catalog. */ }


		</article>


	);


}

// #endregion LoaCarCom

// #endregion Components



// #region Exports

export { LoaCarCom }; // What: Named Export. Why: The Today tab shows one loader card per picker slot while generating. How: This exports LoaCarCom by name; LoaReeCom stays private to this file.

// #endregion Exports


