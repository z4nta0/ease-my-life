


// #region Imports

import React from 'react'; // What: React. Why: This is the UI library every component in this file is built on. How: This is used directly (React.useState, React.useRef, React.useLayoutEffect, React.useCallback, React.useEffect, React.forwardRef, React.Fragment) throughout, instead of importing individual named hooks.


import { createPortal } from 'react-dom'; // What: Create Portal. Why: InfoTip's floating tooltip must render into <body> so it is clamped to the viewport instead of being clipped by an ancestor's own overflow. How: This is called with the tooltip's JSX and document.body inside InfoTip's return.

// #endregion Imports



let announce; // What: announce. Why: The real implementation is only built once the IIFE further down in this file runs, but this exported binding must exist and be assignable before that. How: This starts undefined and is overwritten inside the announce-setup IIFE below.



export { announce }; // What: announce. Why: Nearly every tab needs to speak a transient status to screen readers after an action. How: This re-exports the same module-level binding declared just above, whose real value is assigned later in this file.



/**
 * ui.jsx = Shared UI Primitives
 *
 * @summary
 * Every small, reusable rendering/behavior building block the app's five
 * tabs share: icons, buttons, cards, the animated Collapse disclosure,
 * pills, the weekday chip row, progress bars, the numeric stepper, the
 * custom InfoTip tooltip, date/time formatters, the animated BoostReset
 * lever, the reduced-motion check, the shared Escape-to-cancel stack, the
 * screen-reader live region, the cross-editor edit-guard coordinator, the
 * FillButton lever, and the Data tab's shared sort comparator/select/row-
 * freezing helpers. None of this owns any app-specific domain logic; it is
 * imported by nearly every other file in src/.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



const Icon = ( { name, size = 18 } ) => { // What: Icon. Why: Every tab button, list row, and control across the app needs a small recognizable glyph. How: This looks up name in pahObj and renders the matching SVG shape at the given size.


	const pahObj = { // What: Path Object. Why: This is the lookup table mapping every icon name to its own inline SVG shape markup. How: This is indexed below by the name prop to pick which shape the rendered svg actually draws.


		today      : <><rect x='3' y='5' width='18' height='16' rx='2' /><path d='M3 9h18M8 3v4M16 3v4' /><rect x='7' y='12.5' width='4' height='4' rx='1' fill='currentColor' stroke='none' /></>, // What: Today Icon. Why: This marks the Today tab button. How: This draws a small calendar outline with one filled inner square marking the current day.
		picker     : <><path d='M3 6h4l10 12h4M3 18h4l3.5-4.2M14.5 8.2L17 6h4' /><path d='M18 3l3 3-3 3M18 15l3 3-3 3' /></>, // What: Picker Icon. Why: This marks the Pickers tab button. How: This draws a pair of crossing shuffle-style arrows.
		stats      : <><path d='M4 20V10M11 20V4M18 20v-8M21 20H3' /></>, // What: Stats Icon. Why: This marks the Stats tab button. How: This draws a simple 3-bar chart shape.
		data       : <><ellipse cx='12' cy='6' rx='7' ry='3' /><path d='M5 6v12c0 1.66 3.13 3 7 3s7-1.34 7-3V6' /><path d='M5 12c0 1.66 3.13 3 7 3s7-1.34 7-3' /></>, // What: Data Icon. Why: This marks the Data tab button. How: This draws a classic 3-band database cylinder.
		settings   : <><circle cx='12' cy='12' r='3' /><path d='M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 0 1 7 4.7l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z' /></>, // What: Settings Icon. Why: This marks the Settings tab button. How: This draws a classic gearwheel shape.
		check      : <><path d='M4 12l5 5L20 6' /></>, // What: Check Icon. Why: This marks a completed/done state. How: This draws a single checkmark stroke.
		skip       : <><path d='M5 4l10 8-10 8V4zM19 5v14' /></>, // What: Skip Icon. Why: This marks a skip action. How: This draws a "next track" style triangle-and-bar shape.
		plus       : <><path d='M12 5v14M5 12h14' /></>, // What: Plus Icon. Why: This marks an add action. How: This draws a plain plus sign.
		x          : <><path d='M6 6l12 12M18 6L6 18' /></>, // What: X Icon. Why: This marks a close/remove action. How: This draws a plain X shape.
		play       : <><path d='M6 4l14 8-14 8z' /></>, // What: Play Icon. Why: This marks a start/run action. How: This draws a plain filled play triangle.
		sparkle    : <><path d='M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z' /></>, // What: Sparkle Icon. Why: This marks a highlighted/celebratory state. How: This draws a 4-pointed sparkle star.
		flame      : <><path d='M12 3c0 4-5 6-5 11a5 5 0 0 0 10 0c0-2-1-3-2-4 0 2-1 3-2 3 0-3 2-5-1-10z' /></>, // What: Flame Icon. Why: This marks a streak/intensity indicator. How: This draws a stylized flame shape.
		moon       : <><path d='M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z' /></>, // What: Moon Icon. Why: This marks a dark-mode/night related control. How: This draws a crescent moon shape.
		refresh    : <><path d='M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5' /></>, // What: Refresh Icon. Why: This marks a Fill/Refill/reload action. How: This draws two curved arrows forming a full circular refresh glyph.
		grip       : <><circle cx='9' cy='6' r='1' /><circle cx='15' cy='6' r='1' /><circle cx='9' cy='12' r='1' /><circle cx='15' cy='12' r='1' /><circle cx='9' cy='18' r='1' /><circle cx='15' cy='18' r='1' /></>, // What: Grip Icon. Why: This marks a drag handle. How: This draws a 2x3 grid of dots.
		palette    : <><path d='M12 3a9 9 0 1 0 0 18c1 0 1.5-.5 1.5-1.3 0-.4-.2-.7-.4-1-.2-.3-.4-.6-.4-1 0-.8.6-1.4 1.4-1.4H16a4 4 0 0 0 4-4c0-5-3.6-9-8-9z' /><circle cx='7.5' cy='10.5' r='1.1' fill='currentColor' stroke='none' /><circle cx='11' cy='7' r='1.1' fill='currentColor' stroke='none' /><circle cx='15.5' cy='8' r='1.1' fill='currentColor' stroke='none' /></>, // What: Palette Icon. Why: This marks the Appearance/theme control. How: This draws a classic paint palette with 3 filled color-well dots.
		chev       : <><path d='M9 6l6 6-6 6' /></>, // What: Chevron Icon. Why: This marks a "forward/expand this way" affordance. How: This draws a plain right-pointing chevron.
		chev_d     : <><path d='M6 9l6 6 6-6' /></>, // What: Chevron Down Icon. Why: This marks a "collapsed, tap to expand downward" affordance. How: This draws a plain downward-pointing chevron.
		arrow_down : <><path d='M12 5v14M6 13l6 6 6-6' /></>, // What: Arrow Down Icon. Why: This marks a downward move/sort action. How: This draws a vertical line ending in a downward arrowhead.
		arrow_up   : <><path d='M12 19V5M6 11l6-6 6 6' /></>, // What: Arrow Up Icon. Why: This marks an upward move/sort action. How: This draws a vertical line ending in an upward arrowhead.
		download   : <><path d='M12 3v12M7 10l5 5 5-5M5 21h14' /></>, // What: Download Icon. Why: This marks an export/download action. How: This draws a downward arrow into a tray.
		upload     : <><path d='M12 21V9M7 14l5-5 5 5M5 3h14' /></>, // What: Upload Icon. Why: This marks an import/upload action. How: This draws an upward arrow out of a tray.
		edit       : <><path d='M12 20h9' /><path d='M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z' /></>, // What: Edit Icon. Why: This marks an edit action. How: This draws a classic pencil shape over a baseline.
		calendar   : <><rect x='3' y='5' width='18' height='16' rx='2' /><path d='M3 9h18M8 3v4M16 3v4' /></>, // What: Calendar Icon. Why: This marks a date-related control. How: This draws a plain calendar outline with 2 hanger tabs.
		pin        : <><path d='M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z' /><circle cx='12' cy='10' r='2.5' /></>, // What: Pin Icon. Why: This marks a location/anchor-day related control. How: This draws a classic map pin teardrop with a hollow center circle.
		trash      : <><path d='M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13' /></>, // What: Trash Icon. Why: This marks a delete action. How: This draws a classic lidded trash can outline.
		eye_off    : <><path d='M3 3l18 18M10.6 6.1A9.7 9.7 0 0 1 12 6c5 0 9 6 9 6a16 16 0 0 1-3.1 3.6M6.1 6.1A16 16 0 0 0 3 12s4 6 9 6c1.4 0 2.7-.4 4-1' /><circle cx='12' cy='12' r='3' /></>, // What: Eye Off Icon. Why: This marks a "hidden/inactive" state, or a control that reveals hidden content. How: This draws an eye shape crossed out by a diagonal slash.
		eye        : <><path d='M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z' /><circle cx='12' cy='12' r='3' /></> // What: Eye Icon. Why: This marks a "visible/active" state, or a control that hides revealed content. How: This draws a plain open eye shape.


	};


	return (


		<svg
			fill='none'
			height={ size }
			stroke='currentColor'
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth='1.6'
			viewBox='0 0 24 24'
			width={ size }
			aria-hidden='true'
		>{ /* What: Icon Svg Element. Why: This is Icon's own single rendered element, sized and stroked identically for every glyph. How: This renders whichever shape pahObj[name] resolves to. */ }


			{ pahObj[ name ] }


		</svg>


	);


};



// What: Btn. Why: forwardRef lets a caller restore focus to a button after an action that hands focus away (see the Settings export/import confirmations). How: This forwards ref onto the real <button> element, applies the kind/size modifier classes plus any caller className, and spreads every other passed prop through.
const Btn = React.forwardRef( ( { children, kind = 'ghost', size = 'md', icon, className = '', ...resProObj }, ref ) => (


	<button
		ref={ ref }
		className={ `btn btn--${ kind } btn--${ size } ${ className }` }
		{ ...resProObj }
	>{ /* What: Btn Button Element. Why: This is Btn's own root rendered element, a real <button> so it keeps native semantics/keyboard behavior. How: This applies the kind/size modifier classes plus any caller className, forwards ref, and spreads every other passed prop (onClick, disabled, aria-*, ...) directly onto the DOM node. */ }


		{ icon && <Icon name={ icon } size={ size === 'sm' ? 14 : 16 } /> }{ /* What: Icon Visibility Check. Why: An icon is optional, only some Btn callers pass one. How: This renders an Icon sized down for the "sm" size, only while the icon prop holds a name. */ }

		{ children }


	</button>


) );



const Card = ( { children, padded = true, className = '', ...resProObj } ) => ( // What: Card. Why: Card is the shared surface/panel wrapper used throughout every tab. How: This renders a div with the padded/className modifier classes, spreading every other passed prop onto the DOM node.


	<div
		className={ `card ${ padded ? 'card--p' : ''} ${ className }` }
		{ ...resProObj }
	>{ /* What: Card Div Element. Why: This is Card's own root rendered element. How: This applies the padded/className modifier classes, spreads any other passed props, and renders whatever children the caller passed. */ }


		{ children }


	</div>


);



/**
 * Collapse = Collapse
 *
 * @summary
 * Animated disclosure. Wraps children in a grid whose single row
 * transitions 0fr<->1fr, so it eases height to/from auto without
 * hardcoded max-heights, plus a fade+slide on the inner content.
 * Crucially it UNMOUNTS children after the close animation and
 * remounts them on open, which preserves the snapshot-on-open behavior
 * that the Controls panels and item editors rely on for Cancel.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.open      - Open: Whether this section should be expanded.
 * @param props.children  - Children: The section's own content, unmounted
 *                          while closed and remounted on open.
 * @param props.className - Class Name: Extra class name(s) to append; defaults
 *                          to an empty string.
 * @param props.instant   - Instant: Opts a specific mount out of the open
 *                          animation, snapping straight to expanded instead
 *                          (e.g. a freshly-created draft picker's Controls
 *                          section); defaults to false.
 *
 * @returns The section's own animated wrapper and its children, or
 * null while fully closed and unmounted.
 *
 * @example
 * ```tsx
 * Collapse({ open, children, className, instant }) // => <Collapse />
 * ```
 *
*/

// #region Collapse

function Collapse ( { open, children, className = '', instant = false } ) {


	const [ chiMouBoo, setChiMouBoo ] = React.useState( open );            // What: Child Mounted Boolean And Setter. Why: Children must stay in the DOM through the close animation and unmount only once it finishes. How: This starts matching the initial open value and is flipped by the effects below.
	const [ expStaBoo, setExpStaBoo ] = React.useState( instant && open ); // What: Expand State Boolean And Setter. Why: This drives the 0fr/1fr grid row, starting collapsed even when open so a fresh mount-while-open still animates open instead of snapping. How: instant opts a specific mount out of that behavior by starting already expanded.


	React.useEffect( () => { // What: Mount Sync Effect. Why: A newly-opened section must mount its children before it can animate expanding, and a newly-closed one must animate before unmounting. How: This mounts immediately on open, or starts the close animation (unmounting right away under reduced motion, since transitionend never fires) on close.


		if ( open ) { setChiMouBoo( true ); return; } // What: Open Mount Guard. Why: Expanding is handled by the next effect below; this one only needs to ensure the child is mounted first. How: This mounts the child and bails out of the rest of this effect.


		setExpStaBoo( false ); // What: Collapse Trigger. Why: Closing must animate the grid row back to 0fr before anything unmounts. How: This flips expStaBoo false, which the JSX below reflects as the "is-open" class being removed.

		if ( reduceMotion && reduceMotion() ) setChiMouBoo( false ); // What: Reduced Motion Unmount Guard. Why: transitionend never fires without a real transition, so nothing else would ever unmount the child. How: This unmounts the child immediately when the user prefers reduced motion.


	}, [ open ] ); // What: Effect Dependency Array. Why: This effect only needs to re-run when the open prop itself changes. How: open is read directly inside the guard above.


	React.useEffect( () => { // What: Expand Trigger Effect. Why: The collapsed 0fr state must have painted before flipping to expanded, or a fresh open-from-unmounted mount races the paint and snaps open instead of animating. How: This waits two animation frames after the child is mounted and committed before flipping expStaBoo true.


		if ( !open || !chiMouBoo || expStaBoo ) return; // What: Already Handled Guard. Why: There is nothing to animate unless this is an open section whose child just mounted and isn't already expanded. How: This bails out of the rest of the effect when any of those 3 conditions fails.


		const rafOneNum = requestAnimationFrame( () => { // What: First Frame Request. Why: One frame lets the collapsed 0fr state actually paint before the second frame flips it. How: This schedules the second frame request below, itself cleaned up if this effect re-runs first.


			const rafTwoNum = requestAnimationFrame( () => setExpStaBoo( true ) ); // What: Second Frame Request. Why: This is the actual frame that flips the grid row to 1fr, animating the expand. How: This schedules setExpStaBoo(true) one more frame later.


			return () => cancelAnimationFrame( rafTwoNum ); // What: Second Frame Cleanup. Why: A re-run before the second frame fires must not let a stale expand still happen. How: This cancels the second animation frame request.


		} );


		return () => cancelAnimationFrame( rafOneNum ); // What: First Frame Cleanup. Why: A re-run before the first frame fires must not let a stale chain still start. How: This cancels the first animation frame request.


	}, [ open, chiMouBoo ] ); // What: Effect Dependency Array. Why: open decides whether an expand should happen at all, and chiMouBoo re-runs this on the mount commit rather than only on the open change. How: Both are read directly inside the guard above.


	const onTraEndFun = ( traEndObj ) => { // What: On Transition End Function. Why: The child can only safely unmount once the close animation has actually finished playing. How: This checks that the event is the grid-row transition finishing on this element itself while closed, then unmounts the child.


		const tarSelBoo  = traEndObj.target === traEndObj.currentTarget;    // What: Target Self Boolean. Why: A transitionend can bubble up from an unrelated descendant's own transition. How: This confirms the event fired on this element itself, not a child.
		const rowPropBoo = traEndObj.propertyName === 'grid-template-rows'; // What: Row Property Boolean. Why: Other CSS properties on this element could also transition and fire their own events. How: This confirms the specific property that finished is the grid row driving the collapse.
		const notOpenBoo = !open;                                          // What: Not Open Boolean. Why: Only a genuine close should ever unmount the child. How: This confirms open is currently false.


		if ( tarSelBoo && rowPropBoo && notOpenBoo ) setChiMouBoo( false ); // What: Unmount Guard. Why: All 3 conditions above must hold before it's actually safe to unmount. How: This unmounts the child once the real close transition has genuinely finished.


	};


	if ( !chiMouBoo ) return null; // What: Unmounted Guard. Why: Nothing should render at all once the child has actually unmounted. How: This returns null before building the wrapper JSX below.



	return (


		<div
			className={ `collapse ${ expStaBoo ? 'is-open' : '' } ${ className }` }
			onTransitionEnd={ onTraEndFun }
		>{ /* What: Collapse Div Element. Why: This is Collapse's own root wrapper, whose CSS grid-template-rows transition drives the whole expand/collapse animation. How: This toggles the "is-open" class per expStaBoo and reacts to its own transitionend via onTraEndFun. */ }


			<div className='collapse-inner'>{ children }</div>{ /* What: Collapse Inner Div Element. Why: The fade+slide-on-content animation needs its own inner element separate from the row-height transition on the outer div. How: This wraps whatever children the caller passed. */ }


		</div>


	);


}

// #endregion Collapse



// What: Section Title Component. Why: Several full-page views need the same kicker/title/subtitle header shape. How: This renders an optional kicker line, the required title as an h1, and an optional sub line.
const SecTitCom = ( { kicker, title, sub } ) => (


	<header className='section-h'>{ /* What: Container Section Header Element. Why: This is SecTitCom's own root landmark element. How: This wraps the optional kicker, the required title, and the optional sub line below. */ }


		{ kicker && <div className='kicker'>{ kicker }</div> }{ /* What: Kicker Visibility Check. Why: Not every section has a kicker line above its title. How: This renders the kicker div only while the kicker prop holds a value. */ }

		<h1 className='section-title'>{ title }</h1>{ /* What: Section Title Element. Why: This is the section's own required heading text. How: This renders the title prop as an h1. */ }

		{ sub && <p className='section-sub'>{ sub }</p> }{ /* What: Sub Visibility Check. Why: Not every section has a supporting sub line below its title. How: This renders the sub paragraph only while the sub prop holds a value. */ }


	</header>


);



// What: Pill. Why: Stats/Pickers/Data all need the same small colored label to tag a mode or status. How: This renders a span whose "pill--{tone}" modifier class picks the actual color/style, defaulting to a neutral tone.
const Pill = ( { children, tone = 'default' } ) => (


	<span className={ `pill pill--${ tone }` }>{ children }</span> // What: Pill Span Element. Why: This is Pill's own single rendered element. How: This applies the tone modifier class and renders whatever children the caller passed.


);



const WEE_LAB_ARR = [ 'S', 'M', 'T', 'W', 'T', 'F', 'S' ];                                                                     // What: Week Label Array. Why: Each weekday chip needs a single-letter visible label. How: This is mapped over by WeekdayChips below, indexed by day number (0=Sun).
const WEE_FUL_ARR = [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ]; // What: Week Full Array. Why: Each chip's own accessible name/title needs the full weekday name, not just its single-letter label. How: This is indexed by day number inside WeekdayChips below.



/**
 * WeekdayChips = WeekdayChips
 *
 * @summary
 * A row of 7 toggle chips (Sun...Sat). value is an array of day
 * indices (0=Sun ... 6=Sat); onChange gets the next array. At least
 * one day must stay selected, so the last remaining chip can't be
 * turned off.
 *
 * lockedDay (0-6, or null) pins one day ON: a weekly-cadence picker's
 * anchor day must stay selected, so that chip renders as an InfoTip
 * instead of a toggle. It still looks selected, but tapping explains
 * why it can't be turned off rather than silently doing nothing.
 * lockedTip is that explanation.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

// What: WeekdayChips. Why: See the design-rationale block above. How: This renders one chip per weekday, locked (InfoTip) or toggleable (button) depending on lockedDay.
const WeekdayChips = ( { value, onChange, size = 'md', lockedDay = null, lockedTip = '', describedBy } ) => {


	const togDayFun = ( dayIndNum ) => { // What: Toggle Day Function. Why: Clicking an unlocked chip needs to add or remove that single day from the selection, while keeping at least one day selected. How: This flips dayIndNum's membership in value, re-sorts the result, and calls onChange unless doing so would leave the week empty.


		const hasDayBoo = value.includes( dayIndNum );                                                                    // What: Has Day Boolean. Why: Whether dayIndNum is already selected decides whether this toggle adds or removes it. How: This checks value's own current membership for dayIndNum.
		const nexDayArr = hasDayBoo ? value.filter( ( curDayNum ) => curDayNum !== dayIndNum ) : [ ...value, dayIndNum ]; // What: Next Day Array. Why: This is the candidate selection after the toggle, before it's confirmed safe to apply. How: This removes dayIndNum when it was already selected, otherwise appends it.


		nexDayArr.sort( ( aDayNum, bDayNum ) => aDayNum - bDayNum ); // What: Next Day Sort Call. Why: The selection should always stay in weekday order regardless of which day was toggled. How: This sorts nexDayArr ascending in place.

		if ( nexDayArr.length === 0 ) return; // What: Empty Week Guard. Why: At least one day must always stay selected. How: This bails out without calling onChange when the toggle would leave the week empty.

		onChange( nexDayArr ); // What: On Change Call. Why: The parent owns the actual persisted selection. How: This hands the new, validated day array up to the caller.


	};


	return (


		<div
			className={ `dow-chips ${ size === 'sm' ? 'dow-chips--sm' : '' }` }
			role='group'
			aria-label='Days of the week'
			aria-describedby={ describedBy }
		>{ /* What: Container Dow Chips Div Element. Why: This groups all 7 weekday toggle chips as one accessible group. How: This renders one chip per WEE_LAB_ARR entry below, locked or toggleable depending on lockedDay. */ }


			{ WEE_LAB_ARR.map( ( labChrStr, dayIndNum ) => { // What: Weekday Chip Map. Why: One chip is needed per day of the week. How: This maps WEE_LAB_ARR to either a locked InfoTip chip or a toggleable button chip, keyed by dayIndNum.


				const onDayBoo = value.includes( dayIndNum ); // What: On Day Boolean. Why: Both chip variants below need to know whether this day is currently selected. How: This checks value's own membership for dayIndNum.


				if ( dayIndNum === lockedDay ) return ( // What: Locked Day Check. Why: A locked day (e.g. a weekly picker's anchor day) can't be toggled off and needs an explanation instead. How: This renders an InfoTip chip instead of a button when dayIndNum matches lockedDay.


					<InfoTip
						key={ dayIndNum }
						className={ `dow-chip is-on is-locked ${ size === 'sm' ? 'dow-chip--sm' : '' }` }
						label={ lockedTip }
					>{ labChrStr }</InfoTip> // What: Locked Day Chip Element. Why: This looks selected like any other "on" chip, but tapping explains why it can't be turned off instead of silently doing nothing. How: This renders as an InfoTip whose trigger is the day's own single-letter label.


				);


				return (


					<button
						key={ dayIndNum }
						type='button'
						className={ `dow-chip ${ onDayBoo ? 'is-on' : '' }` }
						aria-pressed={ onDayBoo }
						aria-label={ WEE_FUL_ARR[ dayIndNum ] }
						aria-describedby={ describedBy }
						title={ WEE_FUL_ARR[ dayIndNum ] }
						onClick={ () => togDayFun( dayIndNum ) }
					>{ labChrStr }</button> // What: Toggle Day Chip Element. Why: This is the actual clickable control for an unlocked day. How: This shows onDayBoo as its own "is-on" class and calls togDayFun with dayIndNum when clicked.


				);


			} ) }


		</div>


	);


};



const WEE_ABB_ARR = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ]; // What: Week Abbreviation Array. Why: The abbreviated-list fallback below needs a 3-letter label per weekday. How: This is indexed by day number inside weeSumFun below.



// What: Weekday Summary Function. Why: Cadence editors need a compact human-readable summary of an arbitrary day selection instead of showing the raw index array. How: This sorts a defensive copy of daySelArr and matches it against the "every day"/"weekdays"/"weekends"/"never" special cases before falling back to an abbreviated list.
const weeSumFun = ( daySelArr ) => {


	const sorDayArr = [ ...( daySelArr || [] ) ].sort( ( aDayNum, bDayNum ) => aDayNum - bDayNum ); // What: Sorted Day Array. Why: Every check below assumes an ascending, defensive copy rather than mutating or trusting the caller's own array order. How: This spreads a copy of daySelArr (or an empty array when it's missing) and sorts it ascending.


	if ( sorDayArr.length === 7 ) return 'Every day'; // What: Every Day Check. Why: All 7 weekdays selected has its own friendlier label. How: This returns early once sorDayArr's own length confirms every day is selected.

	if ( sorDayArr.length === 5 && [ 1, 2, 3, 4, 5 ].every( ( curDayNum ) => sorDayArr.includes( curDayNum ) ) ) return 'Weekdays'; // What: Weekdays Check. Why: Exactly Monday through Friday selected has its own friendlier label. How: This returns early once sorDayArr's own length and membership confirm exactly the 5 weekdays are selected.

	if ( sorDayArr.length === 2 && sorDayArr.includes( 0 ) && sorDayArr.includes( 6 ) ) return 'Weekends'; // What: Weekends Check. Why: Exactly Saturday and Sunday selected has its own friendlier label. How: This returns early once sorDayArr's own length and membership confirm exactly the weekend days are selected.

	if ( sorDayArr.length === 0 ) return 'Never'; // What: Never Check. Why: An empty selection has its own friendlier label rather than an empty joined string. How: This returns early once sorDayArr's own length confirms nothing is selected.



	return sorDayArr.map( ( curDayNum ) => WEE_ABB_ARR[ curDayNum ] ).join( ', ' ); // What: Abbreviated List Return. Why: Every other selection falls back to a plain comma-separated abbreviated list. How: This maps each remaining day index through WEE_ABB_ARR and joins the results.


};



// What: ProgressBar. Why: Every group header and Stats card needs the same visual dash-bar to show completion progress. How: This renders a track div plus a filled <i>, whose width is the clamped value/max ratio driven by the tone modifier class.
const ProgressBar = ( { value, max = 1, tone = 'accent' } ) => (


	<div className={ `prog prog--${ tone }` }>{ /* What: Progress Track Div Element. Why: This is the fixed-width background track the filled bar sits inside. How: This applies the tone modifier class and wraps the filled <i> below. */ }


		<i style={{ width : `${ Math.max( 0, Math.min( 1, value / max ) ) * 100 }%` }} />{ /* What: Progress Fill Element. Why: This is the actual filled portion showing how far along value is toward max. How: This is a self-closing <i>, purely styled via inline width, clamped to [0,100]%. */ }


	</div>


);



/**
 * NumStepper = NumStepper
 *
 * @summary
 * A -/[editable number]/+ stepper. The value can be typed directly
 * (handy for big jumps the +/- buttons make tedious); typing commits
 * on blur/Enter, clamped to [min,max]. onSet receives the new integer.
 * Used by every ease Soonest/Latest control.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.value    - Value: {@link value}
 * @param props.min      - Minimum: The lowest allowed value; defaults to 1.
 * @param props.max      - Maximum: The highest allowed value; defaults to 99.
 * @param props.onSet    - On Setter: Receives the newly committed, clamped
 *                         integer.
 * @param props.ariaLabel - Aria Label: The accessible name for the whole
 *                          stepper group and its own text input.
 *
 * @returns The stepper's own -/text/+ trio as one grouped control.
 *
 * @example
 * ```tsx
 * NumStepper({ value, min, max, onSet, ariaLabel }) // => <NumStepper />
 * ```
 *
*/

// #region NumStepper

function NumStepper ( { value, min = 1, max = 99, onSet, ariaLabel } ) {


	const [ txtValStr, setTxtValStr ] = React.useState( String( value ) ); // What: Text Value String And Setter. Why: The value must be typeable as free text, not just steppable, so a separate string buffer is needed alongside the real numeric value. How: This starts mirroring the initial value and is kept in sync by the effect below and overwritten locally while the user types.


	React.useEffect( () => { setTxtValStr( String( value ) ); }, [ value ] ); // What: Value Sync Effect. Why: An external change to value (e.g. a +/- click, or another control writing the same state) must be reflected in the typed text too. How: This overwrites txtValStr with the current value whenever it changes.


	const comTxtFun = () => { // What: Commit Text Function. Why: Whatever the user typed must be parsed, validated, and clamped before it becomes the real committed value. How: This parses txtValStr, falls back to the last real value if unparseable, clamps to [min,max], calls onSet, and re-syncs the text buffer to the final result.


		let parIntNum = parseInt( txtValStr, 10 ); // What: Parsed Integer Number. Why: The raw typed text needs to become a real number before it can be validated. How: This parses txtValStr as a base-10 integer, which yields NaN for anything unparseable.

		if ( isNaN( parIntNum ) ) parIntNum = value; // What: Not A Number Guard. Why: An unparseable or emptied text field should fall back to the last known-good value rather than committing NaN. How: This overwrites parIntNum with the current value when parsing failed.

		parIntNum = Math.max( min, Math.min( max, parIntNum ) ); // What: Clamp Call. Why: A typed value can freely exceed [min,max], which must never reach onSet. How: This clamps parIntNum into the allowed range.


		onSet( parIntNum );                  // What: On Set Call. Why: The parent owns the real persisted value. How: This hands the freshly-validated integer up to the caller.
		setTxtValStr( String( parIntNum ) ); // What: Text Value Sync. Why: The visible text should reflect exactly what was actually committed, not whatever was typed. How: This overwrites txtValStr with the final clamped value.


	};


	return (


		<div
			className='np-stepper'
			role='group'
			aria-label={ ariaLabel }
		>{ /* What: Container Stepper Div Element. Why: This groups the -/text/+ trio as one accessible group. How: This renders the decrement button, the editable text input, and the increment button below. */ }


			<button
				className='np-weight-btn'
				disabled={ value <= min }
				aria-label='Fewer days'
				onClick={ () => onSet( Math.max( min, value - 1 ) ) }
			>−</button>{ /* What: Decrement Button Element. Why: This is the "-" side of the stepper. How: This is disabled once value reaches min, otherwise steps it down by 1 on click. */ }

			<input
				className='np-stepper-input'
				type='text'
				inputMode='numeric'
				value={ txtValStr }
				aria-label={ ariaLabel }
				onChange={ ( chaEveObj ) => setTxtValStr( chaEveObj.target.value.replace( /[^0-9]/g, '' ) ) }
				onFocus={ ( focEveObj ) => focEveObj.target.select() }
				onBlur={ comTxtFun }
				onKeyDown={ ( keyEveObj ) => { if ( keyEveObj.key === 'Enter' ) keyEveObj.currentTarget.blur(); } }
			/>{ /* What: Stepper Input Element. Why: This lets the value be typed directly, handy for big jumps the +/- buttons make tedious. How: This mirrors txtValStr, strips non-digit characters as the user types, selects-all on focus, commits on blur, and commits early on Enter. */ }

			<button
				className='np-weight-btn'
				disabled={ value >= max }
				aria-label='More days'
				onClick={ () => onSet( Math.min( max, value + 1 ) ) }
			>+</button>{ /* What: Increment Button Element. Why: This is the "+" side of the stepper. How: This is disabled once value reaches max, otherwise steps it up by 1 on click. */ }


		</div>


	);


}

// #endregion NumStepper



/**
 * InfoTip = InfoTip
 *
 * @summary
 * Custom tooltip. Unlike the native title attribute, this one is
 * styled to match the UI, opens on tap as well as hover (most users
 * are on mobile), and renders through a portal to <body> so it's
 * clamped to the viewport and never clipped by the app frame or
 * pushed off-screen.
 *
 * Interaction model, tuned to avoid the classic hover/tap conflict:
 * mouse hovers to show (pointerenter/leave, clicks ignored),
 * touch/pen taps to toggle, and keyboard uses focus plus Enter/Space
 * to toggle, with Escape or blur to close.
 *
 * The action prop marks the tip as standing in for a disabled
 * control: it names the action in the accessible name and adds
 * aria-disabled, which announces the disabled state without removing
 * focusability or replacing the name, so the tip's explanation is
 * still read out. (These triggers are deliberately focusable: focus
 * plus Enter is the only way a keyboard user can learn why the action
 * is unavailable.)
 *
 * truncationOnly is for the "reveal a CSS-ellipsis-truncated name" use
 * case, as opposed to an always-relevant explanation like a disabled-
 * action reason or a "?" help icon. When set, the trigger measures its
 * own scrollWidth vs. clientWidth and behaves as a totally inert,
 * non-focusable span (no tooltip, no cursor affordance) whenever the
 * text isn't actually truncated, since there's nothing extra to
 * reveal. Watched via ResizeObserver on the trigger itself rather than
 * a window resize listener: a column can narrow (or a name can stop
 * fitting) for reasons that never fire resize, e.g. a sibling row's
 * Collapse animation later adding a scrollbar that shaves a few px off
 * every row's width, and only observing the element's own box catches
 * all of those, not just an outer-viewport size change.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

// What: InfoTip. Why: See the design-rationale block above. How: This tracks its own open/position/truncation state and renders either an inert span or the full interactive trigger plus its portaled tooltip below.
const InfoTip = ( { children, label, className = '', action = null, truncationOnly = false } ) => {


	const [ tipOpeBoo, setTipOpeBoo ] = React.useState( false );                                     // What: Tip Open Boolean And Setter. Why: This tracks whether the floating tooltip is currently showing. How: This is flipped by the pointer/keyboard handlers below and read by the render's own portal guard.
	const [ tipPosObj, setTipPosObj ] = React.useState( { left : 0, top : 0, placement : 'top' } );   // What: Tip Position Object And Setter. Why: The portaled tooltip needs an absolute left/top plus which side it's placed on, recomputed every time it opens or the page scrolls/resizes. How: This is written by plaTipFun below and read directly in the portaled span's own inline style.
	const [ txtTrnBoo, setTxtTrnBoo ] = React.useState( false );                                     // What: Text Truncated Boolean And Setter. Why: truncationOnly mode needs to know whether the trigger's own text is actually overflowing before deciding to be interactive at all. How: This is measured by the effect below and read by actTipBoo.
	const trgEleRef                   = React.useRef( null );                                        // What: Trigger Element Reference. Why: Both the truncation measurement and the positioning math need a handle on the real trigger DOM node. How: This is attached to the trigger span's own ref prop in both the inert and interactive render branches below.
	const tipEleRef                   = React.useRef( null );                                        // What: Tip Element Reference. Why: The positioning math needs to measure the portaled tooltip's own rendered size. How: This is attached to the portaled tooltip span's own ref prop below.
	const lasPoiStr                   = React.useRef( 'mouse' );                                     // What: Last Pointer String Reference. Why: The click handler needs to know whether the interaction so far has been mouse-driven (where clicks are ignored) or touch/pen-driven (where a tap should toggle). How: This is updated on every pointerdown and read by the click handler below.
	const actTipBoo                   = truncationOnly ? txtTrnBoo : true;                           // What: Active Tip Boolean. Why: Every other piece of this component needs one single answer for whether the tip should behave as a real, focusable, interactive trigger at all. How: This is txtTrnBoo itself under truncationOnly, otherwise always true.


	React.useLayoutEffect( () => { // What: Truncation Measurement Effect. Why: truncationOnly needs to know, before paint, whether the trigger's own text is actually overflowing. How: This measures scrollWidth vs. clientWidth on mount and on every observed resize, via ResizeObserver where available, a plain window resize listener otherwise.


		if ( !truncationOnly ) return; // What: Not Truncation Only Guard. Why: The always-relevant tip variant never needs this measurement at all. How: This skips the rest of the effect entirely when truncationOnly is false.

		const trgCurEle = trgEleRef.current; // What: Trigger Current Element. Why: The measurement below needs a stable local reference to the live trigger DOM node. How: This is read once from trgEleRef.current and reused for every check below.

		if ( !trgCurEle ) return; // What: No Trigger Guard. Why: The ref may not be attached yet. How: This bails out early when there is no trigger element to measure.


		const cheTrnFun = () => setTxtTrnBoo( trgCurEle.scrollWidth > trgCurEle.clientWidth ); // What: Check Truncated Function. Why: This is the actual comparison that decides whether the trigger's own text is currently overflowing. How: This compares trgCurEle's own scrollWidth against its clientWidth.

		cheTrnFun(); // What: Initial Check Call. Why: The truncation state must be known immediately on mount, not just after a later resize. How: This invokes cheTrnFun once, synchronously.


		if ( typeof ResizeObserver === 'function' ) { // What: Resize Observer Support Check. Why: ResizeObserver catches every real cause of a width change, including ones that never fire a window resize event. How: This prefers ResizeObserver when the browser actually supports it.


			const resObsObj = new ResizeObserver( cheTrnFun ); // What: Resize Observer Object. Why: The trigger's own box (not just the viewport) needs to be watched. How: This creates an observer that re-runs cheTrnFun on every observed size change.

			resObsObj.observe( trgCurEle ); // What: Resize Observer Start Call. Why: An observer does nothing until it's actually watching something. How: This starts watching trgCurEle for size changes.


			return () => resObsObj.disconnect(); // What: Resize Observer Cleanup Return. Why: The observer must not outlive this effect run. How: This disconnects resObsObj on cleanup.


		}


		window.addEventListener( 'resize', cheTrnFun ); // What: Window Resize Listener Fallback. Why: A browser without ResizeObserver still needs some way to catch a viewport-level size change. How: This re-runs cheTrnFun on every window resize event.

		return () => window.removeEventListener( 'resize', cheTrnFun ); // What: Window Resize Listener Cleanup Return. Why: The fallback listener must not outlive this effect run. How: This removes the same cheTrnFun reference that was added above.


	}, [ truncationOnly, label ] ); // What: Effect Dependency Array. Why: truncationOnly decides whether to measure at all, and label changing means the underlying text (and therefore its own overflow) may have changed too. How: Both are read directly inside the guards/effect above.


	const plaTipFun = React.useCallback( () => { // What: Place Tip Function. Why: The portaled tooltip needs its own absolute position recomputed from scratch every time it might have moved. How: This measures both the trigger and the tip, prefers placing above, flips below if that would clip, and clamps both axes to the viewport.


		const trgCurEle = trgEleRef.current; // What: Trigger Current Element. Why: The measurement below needs a stable local reference to the live trigger DOM node. How: This is read once from trgEleRef.current and reused below.
		const tipCurEle = tipEleRef.current; // What: Tip Current Element. Why: The measurement below needs a stable local reference to the live tooltip DOM node. How: This is read once from tipEleRef.current and reused below.

		if ( !trgCurEle || !tipCurEle ) return; // What: No Element Guard. Why: Both elements must actually be mounted before there is anything real to measure. How: This bails out early when either ref isn't attached yet.


		const trgRecObj = trgCurEle.getBoundingClientRect(); // What: Trigger Rect Object. Why: The tooltip's own position is computed relative to the trigger's real on-screen position. How: This reads trgCurEle's own bounding rect.
		const tipWidNum = tipCurEle.offsetWidth;             // What: Tip Width Number. Why: Centering and clamping the tooltip both need its own real rendered width. How: This reads tipCurEle's own offsetWidth.
		const tipHeiNum = tipCurEle.offsetHeight;            // What: Tip Height Number. Why: Placing the tooltip above/below the trigger needs its own real rendered height. How: This reads tipCurEle's own offsetHeight.
		const edgMarNum = 8;                                 // What: Edge Margin Number. Why: The tooltip should never sit flush against the very edge of the viewport. How: This is the fixed pixel margin every clamp below keeps clear.
		const vpWidNum  = window.innerWidth;                 // What: Viewport Width Number. Why: The horizontal clamp below needs the real current viewport width. How: This reads window.innerWidth.
		const vpHeiNum  = window.innerHeight;                // What: Viewport Height Number. Why: The vertical clamp below needs the real current viewport height. How: This reads window.innerHeight.


		let tipPlaStr = 'top';                        // What: Tip Placement String. Why: Above the trigger is the preferred placement, flipped below only if it would clip. How: This starts at 'top' and may be overwritten to 'bottom' just below.
		let tipTopNum = trgRecObj.top - tipHeiNum - 8; // What: Tip Top Number. Why: This is the candidate vertical position for the preferred above-trigger placement. How: This sits tipHeiNum plus an 8px gap above trgRecObj's own top edge.

		if ( tipTopNum < edgMarNum ) { tipPlaStr = 'bottom'; tipTopNum = trgRecObj.bottom + 8; } // What: Top Clip Guard. Why: A tooltip that would clip the top of the viewport must flip to sit below the trigger instead. How: This overwrites both tipPlaStr and tipTopNum together when the above-placement candidate falls too high.

		if ( tipTopNum + tipHeiNum > vpHeiNum - edgMarNum ) tipTopNum = Math.max( edgMarNum, vpHeiNum - tipHeiNum - edgMarNum ); // What: Bottom Clip Guard. Why: A below-placement (or an above one that's still too tall) must not run past the bottom of the viewport either. How: This clamps tipTopNum so the tooltip's own bottom edge never crosses vpHeiNum - edgMarNum.


		let tipLefNum = trgRecObj.left + trgRecObj.width / 2 - tipWidNum / 2; // What: Tip Left Number. Why: The tooltip should start centered on the trigger horizontally. How: This computes the centered left offset before the horizontal clamp below.

		tipLefNum = Math.max( edgMarNum, Math.min( tipLefNum, vpWidNum - tipWidNum - edgMarNum ) ); // What: Horizontal Clamp. Why: A centered tooltip can still overflow either side of a narrow viewport. How: This clamps tipLefNum between edgMarNum and the viewport's own right-edge margin.


		setTipPosObj( { left : tipLefNum, top : tipTopNum, placement : tipPlaStr } ); // What: Tip Position Update Call. Why: This publishes the freshly-computed position so the portaled tooltip re-renders in the right place. How: This builds the { left, top, placement } shape the render below reads directly.


	}, [] ); // What: Effect Dependency Array. Why: plaTipFun only closes over stable refs and its own setter, none of which ever change identity. How: An empty array means this callback is created once and never recreated.


	React.useLayoutEffect( () => { // What: Open Positioning Effect. Why: An opening tooltip must be positioned immediately, then kept in place while the page scrolls or the viewport resizes. How: This calls plaTipFun once on open, then re-calls it on every scroll (capture phase, so it catches an inner scrollable ancestor too) and resize, cleaning both listeners up on close.


		if ( !tipOpeBoo ) return; // What: Not Open Guard. Why: There is nothing to position or track while the tooltip is closed. How: This skips the rest of the effect entirely while tipOpeBoo is false.

		plaTipFun(); // What: Initial Placement Call. Why: The tooltip must be positioned immediately on open, without waiting for a scroll or resize. How: This invokes plaTipFun once, synchronously.


		const onMovFun = () => plaTipFun(); // What: On Move Function. Why: Both the scroll and resize listeners below need to re-run the same placement logic. How: This is a thin wrapper calling plaTipFun.

		window.addEventListener( 'scroll', onMovFun, true ); // What: Scroll Listener Add Call. Why: The tooltip must follow the trigger if the page (or an inner scroll container) scrolls while it's open. How: This listens in the capture phase so it catches a scroll on any ancestor, not just the window.
		window.addEventListener( 'resize', onMovFun );       // What: Resize Listener Add Call. Why: The tooltip must re-clamp itself if the viewport is resized while it's open. How: This listens for the plain window resize event.


		return () => { // What: Effect Cleanup Function. Why: Neither listener may outlive this effect run. How: This removes both the scroll and resize listeners registered above.


			window.removeEventListener( 'scroll', onMovFun, true ); // What: Scroll Listener Remove Call. Why: This matches the addEventListener above so the listener does not outlive this effect run. How: This removes the same onMovFun reference, matching the capture-phase flag.
			window.removeEventListener( 'resize', onMovFun );       // What: Resize Listener Remove Call. Why: Same reasoning as the scroll listener removal above. How: This removes the same onMovFun reference.


		};


	}, [ tipOpeBoo, plaTipFun ] ); // What: Effect Dependency Array. Why: tipOpeBoo decides whether to track at all, and plaTipFun is included per the exhaustive-deps convention even though it never actually changes identity. How: Both are read directly inside the guard/calls above.


	React.useEffect( () => { // What: Outside Close Effect. Why: An open tooltip must close when the user interacts outside of it, whether by pointer or by Escape. How: This registers a capture-phase pointerdown listener and a keydown listener while open, both clearing tipOpeBoo, cleaned up together.


		if ( !tipOpeBoo ) return; // What: Not Open Guard. Why: There is nothing to guard against while the tooltip is already closed. How: This skips the rest of the effect entirely while tipOpeBoo is false.


		const onPoiDwnFun = ( poiDwnObj ) => { // What: On Pointer Down Function. Why: A pointerdown anywhere outside the trigger itself should close the tooltip. How: This checks whether the event's own target falls inside the trigger element before closing.


			if ( trgEleRef.current && trgEleRef.current.contains( poiDwnObj.target ) ) return; // What: Inside Trigger Guard. Why: A pointerdown on the trigger itself is handled by the trigger's own onPointerDown/onClick handlers below, not this outside-close listener. How: This bails out when the event's own target is contained within the trigger element.

			setTipOpeBoo( false ); // What: Tip Close Call. Why: A pointerdown genuinely outside the trigger should close the tooltip. How: This sets tipOpeBoo false.


		};

		const onKeyDwnFun = ( keyDwnObj ) => { if ( keyDwnObj.key === 'Escape' ) setTipOpeBoo( false ); }; // What: On Key Down Function. Why: Escape is a standard way to dismiss a transient overlay like this tooltip. How: This closes the tooltip only when the pressed key is exactly Escape.


		document.addEventListener( 'pointerdown', onPoiDwnFun, true ); // What: Pointer Down Listener Add Call. Why: The capture phase ensures this fires before an inner element's own stopPropagation could swallow it. How: This registers onPoiDwnFun for every pointerdown in the document.
		document.addEventListener( 'keydown', onKeyDwnFun );           // What: Key Down Listener Add Call. Why: Escape must close the tooltip regardless of which element currently has focus. How: This registers onKeyDwnFun for every keydown in the document.


		return () => { // What: Effect Cleanup Function. Why: Neither listener may outlive this effect run. How: This removes both listeners registered above.


			document.removeEventListener( 'pointerdown', onPoiDwnFun, true ); // What: Pointer Down Listener Remove Call. Why: This matches the addEventListener above so the listener does not outlive this effect run. How: This removes the same onPoiDwnFun reference, matching the capture-phase flag.
			document.removeEventListener( 'keydown', onKeyDwnFun );           // What: Key Down Listener Remove Call. Why: Same reasoning as the pointerdown listener removal above. How: This removes the same onKeyDwnFun reference.


		};


	}, [ tipOpeBoo ] ); // What: Effect Dependency Array. Why: This effect only needs to re-run when tipOpeBoo itself changes. How: tipOpeBoo is read directly inside the guard above.


	React.useEffect( () => { if ( !actTipBoo ) setTipOpeBoo( false ); }, [ actTipBoo ] ); // What: Truncation Safety Effect. Why: A resize that un-truncates the text while its tip is open (truncationOnly only) should close it rather than leave a tooltip open on what just became an inert span. How: This closes the tooltip whenever actTipBoo itself goes false.


	if ( !actTipBoo ) return ( // What: Inert Guard. Why: With nothing extra to reveal (untruncated text under truncationOnly), this must render as a totally inert, non-interactive span. How: This returns just the ref-and-className span, skipping every interactive attribute and the portal entirely.


		<span
			ref={ trgEleRef }
			className={ className }
		>{ children }</span> // What: Inert Trigger Span Element. Why: With nothing to reveal, this must still keep the ref attached so a later resize can re-measure and flip actTipBoo. How: This renders only the ref and the caller's own className, no interactive attributes at all.


	);



	return (


		<span
			ref={ trgEleRef }
			className={ `infotip-trigger ${ className }` }
			tabIndex={ 0 }
			role='button'
			aria-label={ action ? `${ action }, unavailable. ${ label }` : label }
			aria-disabled={ action ? 'true' : undefined }
			onPointerDown={ ( poiDwnObj ) => { lasPoiStr.current = poiDwnObj.pointerType || 'mouse'; } }
			onPointerEnter={ ( poiEntObj ) => { if ( ( poiEntObj.pointerType || 'mouse' ) === 'mouse' ) setTipOpeBoo( true ); } }
			onPointerLeave={ ( poiLeaObj ) => { if ( ( poiLeaObj.pointerType || 'mouse' ) === 'mouse' ) setTipOpeBoo( false ); } }
			onClick={ ( clkEveObj ) => { // What: On Click Handler. Why: A mouse click should never toggle the tooltip since hover already owns it, but a touch/pen tap should. How: This stops the click from also reaching an outside-close listener, then toggles tipOpeBoo only when the last known pointer type wasn't mouse.


				clkEveObj.stopPropagation(); // What: Propagation Stop Call. Why: This click must not also be seen as an "outside click" by some ancestor's own dismiss handler. How: This stops the click event from bubbling further.

				if ( lasPoiStr.current !== 'mouse' ) setTipOpeBoo( ( preOpeBoo ) => !preOpeBoo ); // What: Tap Toggle Guard. Why: Only a touch/pen tap should toggle the tooltip this way; a mouse click is intentionally ignored since hover already handles it. How: This flips tipOpeBoo only when lasPoiStr's own current value isn't 'mouse'.


			} }
			onKeyDown={ ( keyDwnObj ) => { // What: On Key Down Handler. Why: A keyboard user has no hover/tap, so Enter/Space must be able to toggle the tooltip directly. How: This toggles tipOpeBoo and prevents the key's own default action (e.g. Space scrolling the page) for either key.


				if ( keyDwnObj.key === 'Enter' || keyDwnObj.key === ' ' ) { keyDwnObj.preventDefault(); setTipOpeBoo( ( preOpeBoo ) => !preOpeBoo ); } // What: Toggle Key Guard. Why: Only Enter and Space are meaningful "activate" keys for a role="button" trigger. How: This prevents the key's default action and flips tipOpeBoo only for those 2 keys.


			} }
			onBlur={ () => setTipOpeBoo( false ) }
		>{ /* What: Container Infotip Trigger Span Element. Why: This is the actual focusable, interactive trigger, wrapping the caller's own children and (while open) the portaled tooltip. How: This handles hover for mouse, tap for touch/pen, and Enter/Space/Escape/blur for keyboard, per the design-rationale block above. */ }


			{ children }

			{ tipOpeBoo && createPortal( // What: Portal Visibility Check. Why: The floating tooltip itself should only exist in the DOM while actually open. How: This portals the tooltip span into document.body only while tipOpeBoo is true.


				<span
					ref={ tipEleRef }
					className={ `infotip infotip--${ tipPosObj.placement }` }
					style={{
						left : tipPosObj.left,
						top  : tipPosObj.top
					}}
					role='tooltip'
				>{ /* What: Tip Span Element. Why: This is the actual floating tooltip bubble, positioned via tipPosObj. How: This renders the caller's own label text, placed per its own infotip--{placement} modifier class. */ }


					{ label }


				</span>,

				document.body // What: Document Body Target. Why: The tooltip must render outside the app's own DOM subtree so ancestor overflow/clipping never affects it. How: This is createPortal's own target container argument.

			) }


		</span>


	);


};



// What: fmtDate. Why: Every date shown compactly across the app (Today's header, Stats rows, ...) needs the same short weekday/month/day format. How: This builds a Date from isoDatStr (or now, when omitted) and formats it via toLocaleDateString.
const fmtDate = ( isoDatStr ) => {


	const parDatObj = isoDatStr ? new Date( isoDatStr ) : new Date(); // What: Parsed Date Object. Why: Every caller may pass an ISO string or omit it entirely for "right now". How: This constructs a Date from isoDatStr when given, otherwise the current moment.



	return parDatObj.toLocaleDateString( 'en-US', { weekday : 'short', month : 'short', day : 'numeric' } ); // What: Short Date Return. Why: The caller needs the actual formatted string, not the Date object itself. How: This formats parDatObj as e.g. "Wed, May 13" via the locale API.


};



// What: fmtDateLong. Why: A few spots (long-form date displays) need the full weekday name instead of the short 3-letter one. How: This builds a Date from isoDatStr (or now, when omitted) and formats it via toLocaleDateString with a long weekday.
const fmtDateLong = ( isoDatStr ) => {


	const parDatObj = isoDatStr ? new Date( isoDatStr ) : new Date(); // What: Parsed Date Object. Why: Every caller may pass an ISO string or omit it entirely for "right now". How: This constructs a Date from isoDatStr when given, otherwise the current moment.



	return parDatObj.toLocaleDateString( 'en-US', { weekday : 'long', month : 'short', day : 'numeric' } ); // What: Long Date Return. Why: The caller needs the actual formatted string, not the Date object itself. How: This formats parDatObj as e.g. "Wednesday, May 13" via the locale API.


};



// What: fmtTime. Why: A few spots need a plain "3:42 PM" style time with no seconds. How: This builds a Date from isoDatStr (or now, when omitted) and formats it via toLocaleTimeString.
const fmtTime = ( isoDatStr ) => {


	const parDatObj = isoDatStr ? new Date( isoDatStr ) : new Date(); // What: Parsed Date Object. Why: Every caller may pass an ISO string or omit it entirely for "right now". How: This constructs a Date from isoDatStr when given, otherwise the current moment.



	return parDatObj.toLocaleTimeString( 'en-US', { hour : 'numeric', minute : '2-digit' } ); // What: Time Return. Why: The caller needs the actual formatted string, not the Date object itself. How: This formats parDatObj as e.g. "3:42 PM" via the locale API.


};



/**
 * BoostReset = BoostReset
 *
 * @summary
 * The dynamic-mode "+N" Boost value plus its Reset lever. Clicking
 * Reset commits the value to 0 (via onReset) AND animates the shown
 * number ticking down to zero. Used by picker items (tab-today's
 * EntryEditor) and conditionals.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.value   - Value: The current boost value to display and reset
 *                        from.
 * @param props.suffix  - Suffix: Extra text appended after the number (e.g. a
 *                        unit); defaults to an empty string.
 * @param props.onReset - On Reset: Commits the real value to 0; called once,
 *                        immediately, when Reset is clicked.
 *
 * @returns The boost value span and the Reset button, as sibling
 * elements with no shared wrapper.
 *
 * @example
 * ```tsx
 * BoostReset({ value, suffix, onReset }) // => <BoostReset />
 * ```
 *
*/

// #region BoostReset

function BoostReset ( { value, suffix = '', onReset } ) {


	const [ dspValNum, setDspValNum ] = React.useState( value ); // What: Display Value Number And Setter. Why: The shown number needs to animate independently of the real committed value while a reset is ticking down. How: This starts mirroring value and is driven by doResFun's own tick loop while a reset animation is running.
	const aniFrmRef                  = React.useRef( 0 );        // What: Animation Frame Reference. Why: A running tick loop's own requestAnimationFrame id must be cancelable, both mid-animation and on unmount. How: This holds the current frame id, read/cleared by doResFun and the cleanup effect below.


	React.useEffect( () => { if ( !aniFrmRef.current ) setDspValNum( value ); }, [ value ] ); // What: Value Follow Effect. Why: The shown number should track the real value (e.g. it climbed +1) whenever no reset animation is currently running. How: This applies the real value to dspValNum only while aniFrmRef holds no active frame id.

	React.useEffect( () => () => cancelAnimationFrame( aniFrmRef.current ), [] ); // What: Unmount Cleanup Effect. Why: A tick loop still running when this component unmounts must not keep scheduling frames forever. How: This cancels whatever frame id aniFrmRef holds when the component unmounts.


	const doResFun = () => { // What: Do Reset Function. Why: Clicking Reset must commit the real value to 0 immediately while animating the shown number ticking down to match. How: This guards against a no-op reset, respects reduced motion, then drives a duration-scaled eased tick loop down to 0.


		if ( !value ) return; // What: No Value Guard. Why: There is nothing to reset when the boost is already at 0. How: This bails out before touching onReset or starting any animation.

		if ( reduceMotion && reduceMotion() ) { onReset(); setDspValNum( 0 ); return; } // What: Reduced Motion Guard. Why: A user who prefers reduced motion shouldn't see the ticking-down animation. How: This commits the reset and snaps the shown number straight to 0, skipping the tick loop entirely.


		const staValNum = value;                                            // What: Start Value Number. Why: The tick loop below needs the original boost value to ease down from, even after onReset below changes the real value to 0. How: This captures value before it changes.
		const staTimNum = performance.now();                                // What: Start Time Number. Why: Each animation frame needs to know how much time has elapsed since the tick loop began. How: This captures the current high-resolution timestamp.
		const durValNum = Math.max( 280, Math.min( 900, staValNum * 55 ) );  // What: Duration Value Number. Why: A small boost shouldn't blink past and a large one shouldn't crawl. How: This scales the animation's own duration with staValNum, clamped to a sensible min/max.


		onReset(); // What: On Reset Call. Why: The real committed value must become 0 immediately, independent of however long the shown-number animation takes. How: This calls the caller's own reset handler right away.

		cancelAnimationFrame( aniFrmRef.current ); // What: Frame Cancel Guard. Why: A rapid repeat click must not let an earlier tick loop keep racing this new one. How: This cancels whatever frame id aniFrmRef currently holds before starting a fresh loop.


		const tikFrmFun = ( frmTimNum ) => { // What: Tick Frame Function. Why: This is the actual per-frame step that eases the shown number down to 0 over durValNum. How: This computes an eased progress ratio from elapsed time, sets dspValNum accordingly, and reschedules itself until progress reaches 1.


			const prgRatNum = Math.min( 1, ( frmTimNum - staTimNum ) / durValNum ); // What: Progress Ratio Number. Why: The eased value below needs a clamped [0,1] linear progress to work from. How: This divides elapsed time by durValNum, capped at 1.
			const easRatNum = 1 - Math.pow( 1 - prgRatNum, 3 );                    // What: Eased Ratio Number. Why: A cubic ease-out reads more natural than a linear countdown. How: This applies a standard cubic ease-out curve to prgRatNum.


			setDspValNum( Math.round( staValNum * ( 1 - easRatNum ) ) ); // What: Display Value Update. Why: This is the actual visible countdown step for this frame. How: This sets dspValNum to staValNum scaled down by the eased ratio, rounded to a whole number.

			if ( prgRatNum < 1 ) aniFrmRef.current = requestAnimationFrame( tikFrmFun ); // What: Reschedule Guard. Why: The loop must keep running until progress genuinely reaches 1. How: This schedules another frame and keeps aniFrmRef pointed at it.

			else { aniFrmRef.current = 0; setDspValNum( 0 ); } // What: Completion Guard. Why: The loop must end exactly at 0, not whatever the last rounded frame happened to compute. How: This clears aniFrmRef and snaps dspValNum to exactly 0.


		};


		aniFrmRef.current = requestAnimationFrame( tikFrmFun ); // What: Frame Start Call. Why: The tick loop above needs to actually begin. How: This schedules the first frame and records its id in aniFrmRef.


	};


	return (


		<React.Fragment>{ /* What: Boost Reset Fragment Element. Why: The value span and reset button are true siblings with no shared wrapper element of their own. How: This groups the two below without adding an extra DOM node. */ }


			<span className='pie-boost-val'>+{ dspValNum }{ suffix }</span>{ /* What: Boost Value Span Element. Why: This shows the current (possibly mid-animation) boost number. How: This renders a literal "+" followed by dspValNum and the caller's own suffix. */ }

			<button
				className='pie-reset'
				disabled={ !value }
				aria-label='Reset boost to zero'
				onClick={ doResFun }
			>Reset</button>{ /* What: Reset Button Element. Why: This is the actual lever that commits the boost back to 0. How: This is disabled while already at 0, otherwise runs doResFun on click. */ }


		</React.Fragment>


	);


}

// #endregion BoostReset



// What: reduceMotion. Why: JS-driven animations (rAF tweens, Element.animate, smooth scrolls) must check this since the CSS media query alone never reaches them. How: This reports whether the OS's prefers-reduced-motion media query currently matches reduce.
export const reduceMotion = () => !!( window.matchMedia && window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches );



window.__escStack = window.__escStack || []; // What: Escape Stack Global. Why: Multiple inline editors can be open across different components at once, and only the innermost one should react to Escape. How: This is a plain array of { run } entries, pushed/spliced by every useEscapeCancel call below and read by the document-level listener further down.



/**
 * useEscapeCancel = useEscapeCancel
 *
 * @summary
 * Escape cancels the innermost open inline editor/add-form. Registered
 * on a stack so only the deepest active editor reacts, and skipped
 * while a tooltip or modal scrim is showing (those own Escape first).
 * Escape is NOT bound to collapsible sections: the ARIA disclosure
 * pattern doesn't use it, their state is persisted, and they nest.
 * Document-level rather than an input's onKeyDown so it still fires
 * after focus has moved to a control inside the editor.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

// What: useEscapeCancel. Why: See the design-rationale block above. How: This registers/deregisters a stack entry while active, wired to always call whatever handler was most recently passed.
export const useEscapeCancel = function useEscapeCancel ( active, handler ) {


	const hndFunRef = React.useRef( handler ); // What: Handler Function Reference. Why: The registered stack entry must always call the latest handler, not whichever one was passed on the render that first mounted it. How: This is created once from the initial handler and overwritten on every render below.

	hndFunRef.current = handler; // What: Handler Reference Update. Why: A closure captured on mount would otherwise go stale across re-renders. How: This keeps hndFunRef pointed at the caller's own current handler on every render.


	React.useEffect( () => { // What: Stack Registration Effect. Why: Only an active editor should occupy a slot on the shared escape stack. How: This pushes a stack entry while active, and removes that same entry on cleanup.


		if ( !active ) return; // What: Inactive Guard. Why: A closed editor has nothing to register. How: This skips the rest of the effect while active is false.


		const staEntObj = { run : () => hndFunRef.current && hndFunRef.current() }; // What: Stack Entry Object. Why: The shared stack needs a stable object identity per registration, so this exact entry can be found and removed again on cleanup. How: This wraps a call to whatever handler hndFunRef currently points at.

		window.__escStack.push( staEntObj ); // What: Stack Push Call. Why: This is what actually makes this editor reachable by the document-level Escape listener below. How: This appends staEntObj to the shared stack.


		return () => { // What: Stack Cleanup Function. Why: A closed or unmounted editor must not linger on the shared stack. How: This finds staEntObj's own current index and removes it.


			const entIndNum = window.__escStack.indexOf( staEntObj ); // What: Entry Index Number. Why: splice needs a real index, not the entry object itself. How: This looks up staEntObj's own current position in the shared stack.

			if ( entIndNum > -1 ) window.__escStack.splice( entIndNum, 1 ); // What: Stack Splice Guard. Why: The entry could conceivably already be gone. How: This removes exactly one element at entIndNum when it was actually found.


		};


	}, [ active ] ); // What: Effect Dependency Array. Why: Registration/deregistration only needs to happen when active itself flips. How: active is read directly inside the guard above.


};



if ( !window.__escBound ) { // What: Escape Bound Guard. Why: The document-level Escape listener must only ever be attached once, even across multiple module re-evaluations (e.g. HMR). How: This gates the whole listener-attach block below on a global marker.


	window.__escBound = true; // What: Escape Bound Flag Set. Why: Every later module evaluation must see that the listener is already attached. How: This marks the global guard true before actually attaching the listener.

	document.addEventListener( 'keydown', ( keyDwnObj ) => { // What: Document Keydown Listener. Why: This is the single shared handler that lets Escape cancel whichever editor is currently innermost. How: This checks a run of guards, then invokes the top entry on the shared escape stack.


		if ( keyDwnObj.key !== 'Escape' || keyDwnObj.defaultPrevented ) return; // What: Non-Escape Guard. Why: Only an actual, not-already-handled Escape keypress should ever reach the stack. How: This bails out for any other key, or one whose default was already prevented by something else.


		const escStaArr = window.__escStack; // What: Escape Stack Array. Why: The rest of this handler needs a stable local reference to the shared stack. How: This reads window.__escStack once and reuses it below.

		if ( !escStaArr.length ) return; // What: Empty Stack Guard. Why: There is nothing to cancel when no editor is currently registered. How: This bails out when the shared stack is empty.

		if ( document.querySelector( '.infotip, .ob-scrim' ) ) return; // What: Overlay Guard. Why: A visible tooltip or modal scrim owns Escape first, ahead of any inline editor. How: This bails out while either kind of overlay is present in the document.


		keyDwnObj.preventDefault(); // What: Default Prevention Call. Why: The browser's own Escape behavior (e.g. exiting fullscreen) shouldn't also fire alongside this cancel. How: This prevents the keydown event's default action.

		escStaArr[ escStaArr.length - 1 ].run(); // What: Top Entry Run Call. Why: Only the deepest (innermost, most-recently-registered) active editor should react. How: This invokes the run() of the last entry in escStaArr.


	} );


}



// What: announce Setup IIFE. Why: The live region must be created exactly once, at module load, since a region that mounts together with its own text is announced unreliably (or not at all) in several browser/screen-reader pairs. How: This builds the live region, attaches it to <body> (immediately or on DOMContentLoaded), and assigns the real implementation into the module-level announce binding declared at the top of this file.
(() => {


	const livRegEle = document.createElement( 'div' ); // What: Live Region Element. Why: This is the actual DOM node screen readers watch for status announcements. How: This is a plain div, styled invisibly by CSS via its own class below, that persists for the app's whole lifetime.

	livRegEle.className = 'sr-live';                 // What: Live Region Class Name. Why: CSS needs a selector to visually hide this element while keeping it in the accessibility tree. How: This sets the class the app's stylesheet targets.
	livRegEle.setAttribute( 'role', 'status' );       // What: Live Region Role Attribute. Why: This tells assistive tech that this element carries transient status updates. How: This sets the standard ARIA role.
	livRegEle.setAttribute( 'aria-live', 'polite' );  // What: Live Region Live Attribute. Why: A default politeness level is needed before any real announce() call can override it per-call. How: This starts the region at "polite", overwritten per-call below.
	livRegEle.setAttribute( 'aria-atomic', 'true' );  // What: Live Region Atomic Attribute. Why: A screen reader should read the whole message, not just whatever text node changed. How: This tells assistive tech to treat content changes as replacing the whole region.


	const atcRegFun = () => document.body && document.body.appendChild( livRegEle ); // What: Attach Region Function. Why: The live region does nothing until it's actually in the document. How: This appends livRegEle to document.body, guarded in case body doesn't exist yet.

	if ( document.body ) atcRegFun(); else document.addEventListener( 'DOMContentLoaded', atcRegFun ); // What: Attach Timing Guard. Why: This module can evaluate before document.body exists in some load orders. How: This attaches immediately when body already exists, otherwise waits for DOMContentLoaded.


	let annTimNum = null; // What: Announce Timeout Number. Why: A rapid-fire announce() call must debounce against the previous call's own pending timeout. How: This holds the current setTimeout id, cleared and reassigned on every call below.


	announce = ( mesTxtStr, mesOptObj ) => { // What: announce. Why: This is the actual exported implementation, assigned into the module-level announce binding declared at the top of this file. How: This updates the region's own politeness, clears its text, then sets the new text on the next tick so the change is reliably detected.


		if ( !mesTxtStr ) return; // What: No Message Guard. Why: There is nothing useful to announce for an empty/falsy message. How: This bails out without touching the region at all.

		livRegEle.setAttribute( 'aria-live', ( mesOptObj && mesOptObj.assertive ) ? 'assertive' : 'polite' ); // What: Live Attribute Update. Why: Some announcements (e.g. an error) need to interrupt immediately rather than wait politely. How: This sets assertive only when mesOptObj explicitly asks for it, polite otherwise.


		livRegEle.textContent = ''; // What: Text Content Clear. Why: Re-announcing the exact same text as last time needs a real change for the reader to detect. How: This empties the region first, before the delayed set below.

		clearTimeout( annTimNum ); // What: Timeout Clear. Why: A rapid repeat call must not let an earlier delayed set race this newer one. How: This cancels whatever timeout was previously scheduled.

		annTimNum = setTimeout( () => { livRegEle.textContent = mesTxtStr; }, 60 ); // What: Timeout Schedule. Why: Setting the text on the very next tick (rather than immediately) is what makes even an identical repeat message reliably re-announced. How: This schedules the real text write 60ms later.


	};


} )();



/**
 * window.__editGuard = Edit Guard Coordinator
 *
 * @summary
 * Lets live-commit editors (picker settings, picker items) discard
 * UNSAVED edits when the editor closes implicitly (tab-switch or
 * reload) while KEEPING them on an in-tab sibling swap. An unmounting
 * editor arm()s a revert on the next macrotask; a sibling editor
 * mounting in the same React commit disarm()s it before it fires. A
 * real tab-switch leaves nothing to disarm, so the revert runs.
 * (Reload is handled by each editor's own pagehide synchronous
 * localStorage restore, so this timeout never matters there.)
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

window.__editGuard = window.__editGuard || { // What: Edit Guard Global. Why: This must be a single shared object every editor's mount/unmount can read and write, reachable outside the normal React import graph. How: This is only created once (a re-evaluation keeps whatever the global already holds), exposing arm/disarm as the stable methods every editor calls by name.


	_tmoNum : null, // What: Timeout Number. Why: A pending revert's own setTimeout id must be cancelable by a later arm/disarm call. How: This starts null and is set/cleared by arm and disarm below.
	_revFun : null, // What: Revert Function. Why: The actual staged revert callback must be reachable from the timeout that eventually runs it. How: This starts null and is set by arm, read and cleared by the timeout callback below.

	arm( pndRevFun ) { // What: Arm Method. Why: An unmounting editor needs to stage its own revert, cancelable by a sibling mounting in the same commit. How: This cancels any previous timeout, stores pndRevFun, and schedules it to run on the next macrotask unless disarmed first.


		clearTimeout( this._tmoNum ); // What: Timeout Cancel. Why: A previous arm() call's own pending revert must not also fire alongside this new one. How: This cancels whatever timeout id was previously stored.

		this._revFun = pndRevFun; // What: Revert Function Store. Why: The scheduled timeout below needs to find this exact callback when it runs. How: This overwrites _revFun with the newly-armed callback.

		this._tmoNum = setTimeout( () => { // What: Timeout Schedule. Why: A same-commit sibling mount must get a chance to disarm() before this actually runs. How: This schedules the revert for the very next macrotask, i.e. after the current commit's own synchronous work finishes.


			const staRevFun = this._revFun; // What: Staged Revert Function. Why: _revFun must be captured before it's cleared below, in case running it somehow re-enters arm/disarm. How: This reads the currently-staged callback into a local before touching the shared fields.

			this._revFun = null; // What: Revert Function Clear. Why: A fired revert must not remain staged as if it were still pending. How: This resets _revFun back to null.
			this._tmoNum = null; // What: Timeout Number Clear. Why: A fired timeout's own id is no longer meaningful to cancel. How: This resets _tmoNum back to null.


			if ( staRevFun ) { // What: Staged Revert Guard. Why: disarm() may have already cleared the callback before this timeout fired. How: This only attempts to run the revert when one was actually still staged.


				try { staRevFun(); } // What: Staged Revert Call. Why: This is the actual state-reverting side effect an unmounted editor asked for. How: This invokes the captured callback.

				catch ( errCauObj ) {} // What: Staged Revert Error Guard. Why: A revert callback throwing must not crash whatever unrelated code happens to run next on this same tick. How: This silently swallows any error the callback raised.


			}


		}, 0 );


	},

	disarm() { // What: Disarm Method. Why: A sibling editor mounting in the same React commit needs to cancel an outgoing editor's staged revert before it fires. How: This cancels the pending timeout and clears both shared fields back to their idle state.


		clearTimeout( this._tmoNum ); // What: Timeout Cancel. Why: The scheduled revert must never actually run once disarmed. How: This cancels whatever timeout id is currently stored.

		this._tmoNum = null; // What: Timeout Number Clear. Why: A canceled timeout's own id is no longer meaningful. How: This resets _tmoNum back to null.
		this._revFun = null; // What: Revert Function Clear. Why: A canceled arm should leave nothing staged behind. How: This resets _revFun back to null.


	}


};



/**
 * FillButton = FillButton
 *
 * @summary
 * The ghost "Fill / Refill / Fill all / Refill all" lever for ease
 * modes. Spins its refresh icon once on click for subtle feedback, and
 * takes a disabled flag (callers pass true when already at full
 * charge, so a filled item/picker can't be re-filled). Shared by
 * picker items, pickers, and conditionals.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.label    - Label: The button's own visible text (e.g. "Fill",
 *                         "Refill all").
 * @param props.onClick  - On Click: The real Fill/Refill action, called once
 *                         the disabled guard passes.
 * @param props.disabled - Disabled: Whether this lever is currently
 *                         unavailable (e.g. already at full charge).
 *
 * @returns The lever rendered as a Btn, with its own spin-on-click
 * behavior layered on top.
 *
 * @example
 * ```tsx
 * FillButton({ label, onClick, disabled }) // => <FillButton />
 * ```
 *
*/

// #region FillButton

function FillButton ( { label, onClick, disabled } ) {


	const [ spnAniBoo, setSpnAniBoo ] = React.useState( false ); // What: Spin Animate Boolean And Setter. Why: The refresh icon's own spin is purely decorative feedback, layered on top of the real Fill/Refill action. How: This is started on a live click (unless reduced motion) and cleared once the CSS spin animation finishes.


	return (


		<Btn
			className={ spnAniBoo ? 'is-spinning' : '' }
			kind='ghost'
			size='sm'
			icon='refresh'
			disabled={ disabled }
			onClick={ () => { // What: On Click Handler. Why: A disabled FillButton must be fully inert, and clicking a live one should spin the icon (unless reduced motion) before performing the real action. How: This guards on disabled, conditionally starts the spin, then always calls the caller's own onClick.


				if ( disabled ) return; // What: Disabled Guard. Why: A disabled button must not spin or fire its own action at all. How: This bails out before touching spnAniBoo or calling onClick.

				if ( !reduceMotion() ) setSpnAniBoo( true ); // What: Spin Start Guard. Why: The spin is purely decorative feedback, skipped entirely under reduced motion. How: This starts the spin animation only when reduceMotion() reports false.

				onClick(); // What: On Click Call. Why: This is the actual Fill/Refill action the caller owns. How: This invokes the passed-in onClick handler unconditionally once the guards above pass.


			} }
			onAnimationEnd={ () => setSpnAniBoo( false ) }
		>{ /* What: Fill Button Element. Why: This is FillButton's own rendered control, reusing Btn for consistent button chrome. How: This shows the spin class while spnAniBoo is true, is fully inert while disabled, and clears the spin on its own CSS animation finishing. */ }


			{ label }


		</Btn>


	);


}

// #endregion FillButton



/**
 * compareSortEntries = compareSortEntries
 *
 * @summary
 * Shared sort vocabulary for the Data tab's section list (Conditionals
 * / Reminders / each picker card) and, per section, its own item list
 * (picker pool items, conditionals, reminders). Each list builds its
 * own array of { name, type, group, count, range, odds, boost, date,
 * isActive } rows (fields that don't apply to a given row are null)
 * and sorts them with this one comparator, keyed by e.g. 'name-asc' or
 * 'count-desc'.
 *
 * group/date/isActive are N/A (null) for anything that doesn't have a
 * meaningful single value for that field (the Conditionals/Reminders
 * section as a whole, an item type with no such concept, or, for
 * date, a reminder with no next occurrence at all): those sort to the
 * top for the forward direction and the bottom for the reverse,
 * rather than being forced into a fake value. range/odds/boost are
 * different: null on a row means the field is irrelevant to that
 * row's own mode (mixed into the same list as rows it does apply to,
 * e.g. Odds/Boost only mean something for a weighted/dynamic
 * conditional, Range only for an ease-up/ease-down one), so those
 * always sort to the bottom in EITHER direction, rather than flipping
 * to the top on a reverse sort the way a genuinely missing value
 * would. Ties always fall back to name (A-Z); a reverse sort only
 * flips the primary field's comparison, never that tie-break.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param rowAObj   - Row A Object: The left-hand row to compare.
 * @param rowBObj   - Row B Object: The right-hand row to compare.
 * @param sorKeyStr - Sort Key String: The sort key, e.g. 'name-asc' or
 *                    'count-desc'; everything before the last dash names the
 *                    field, the trailing 'asc'/'desc' names the direction.
 *
 * @returns A standard Array.prototype.sort comparator result: negative
 * when rowAObj sorts first, positive when rowBObj sorts first, 0 on a
 * genuine tie.
 *
 * @example
 * ```ts
 * compareSortEntries(rowAObj, rowBObj, sorKeyStr) // => -1 | 0 | 1
 * ```
 *
*/

// #region compareSortEntries

function compareSortEntries ( rowAObj, rowBObj, sorKeyStr ) {


	const [ fieNamStr, sorDirStr ] = sorKeyStr.split( '-' ); // What: Field Name String And Direction String. Why: Every sort key packs both which field to compare and which way, joined by a dash. How: This splits sorKeyStr once into the two pieces every branch below reads.
	const revSorBoo                = sorDirStr === 'desc';   // What: Reverse Sort Boolean. Why: Every branch below needs to know whether to flip its own comparison. How: This is true only when sorDirStr is exactly 'desc'.


	const byNamFun = () => rowAObj.name.localeCompare( rowBObj.name ); // What: By Name Function. Why: Every field's own tie-break, and the fallback for an unrecognized field, both need the same plain A-Z name comparison. How: This calls String.localeCompare between the two rows' own name fields.


	const dirNulFun = ( aCmpVal, bCmpVal ) => { // What: Direction Null Function. Why: A field that's genuinely missing (not merely irrelevant) should sort to whichever end the current direction implies, rather than being forced into a fake value. How: This returns a real comparison result when either side is null/undefined, or null to mean both sides are real values and the caller does the actual field comparison.


		const aNulBoo = aCmpVal == null; // What: A Null Boolean. Why: The 3 outcomes below all depend on which side (if any) is actually missing. How: This checks aCmpVal with a loose null comparison, matching undefined too.
		const bNulBoo = bCmpVal == null; // What: B Null Boolean. Why: Same reasoning as aNulBoo, for the other side. How: This checks bCmpVal with a loose null comparison, matching undefined too.


		if ( aNulBoo && bNulBoo ) return byNamFun();  // What: Both Null Check. Why: Two equally-missing rows have nothing else to compare by. How: This falls back to the plain name tie-break.
		if ( aNulBoo ) return revSorBoo ? 1 : -1;     // What: A Null Check. Why: A missing left side sorts to the top ascending, bottom descending. How: This returns the direction-appropriate sentinel comparison result.
		if ( bNulBoo ) return revSorBoo ? -1 : 1;     // What: B Null Check. Why: Same reasoning as the A Null check, mirrored for the right side. How: This returns the direction-appropriate sentinel comparison result.


		return null; // What: Both Real Return. Why: Neither side was missing, so this helper has nothing useful to say. How: This signals the caller to fall through to its own real field comparison.


	};


	const lasNulFun = ( aCmpVal, bCmpVal ) => { // What: Last Null Function. Why: A field that's irrelevant to a row (not missing, just N/A for its own mode) should always sort last in EITHER direction, unlike a genuinely missing value. How: This is the same idea as dirNulFun, except both null cases return a fixed "goes last" result regardless of revSorBoo.


		const aNulBoo = aCmpVal == null; // What: A Null Boolean. Why: The 3 outcomes below all depend on which side (if any) is actually N/A. How: This checks aCmpVal with a loose null comparison, matching undefined too.
		const bNulBoo = bCmpVal == null; // What: B Null Boolean. Why: Same reasoning as aNulBoo, for the other side. How: This checks bCmpVal with a loose null comparison, matching undefined too.


		if ( aNulBoo && bNulBoo ) return byNamFun(); // What: Both Null Check. Why: Two equally-N/A rows have nothing else to compare by. How: This falls back to the plain name tie-break.
		if ( aNulBoo ) return 1;                     // What: A Null Check. Why: An N/A left side always sorts last, regardless of direction. How: This returns a fixed "a goes after b" result.
		if ( bNulBoo ) return -1;                    // What: B Null Check. Why: Same reasoning as the A Null check, mirrored for the right side. How: This returns a fixed "b goes after a" result.


		return null; // What: Both Real Return. Why: Neither side was N/A, so this helper has nothing useful to say. How: This signals the caller to fall through to its own real field comparison.


	};


	const numLasFun = ( aCmpVal, bCmpVal ) => { // What: Numeric Last Function. Why: A numeric field (Range/Odds/Boost) that's irrelevant to a row needs the same "always last" rule as lasNulFun, plus the actual numeric comparison once both sides are real. How: This defers to lasNulFun first, then subtracts the two values and applies revSorBoo/the name tie-break.


		const notAvaNum = lasNulFun( aCmpVal, bCmpVal ); // What: Not Available Number. Why: A real comparison result from lasNulFun means one side was N/A and nothing more needs computing. How: This calls lasNulFun and checks its result before doing any real math.

		if ( notAvaNum != null ) return notAvaNum; // What: Not Available Check. Why: An N/A result from lasNulFun already fully answers this comparison. How: This returns that result directly instead of falling through to the numeric comparison below.


		const priCmpNum = aCmpVal - bCmpVal; // What: Primary Compare Number. Why: Both sides are confirmed real numbers at this point, so a plain subtraction is a valid ascending comparison. How: This subtracts bCmpVal from aCmpVal.



		return ( revSorBoo ? -priCmpNum : priCmpNum ) || byNamFun(); // What: Numeric Compare Return. Why: The caller needs the actual final ordering, flipped for a descending sort, falling back to name on an exact tie. How: This negates priCmpNum when reversed, then falls back to byNamFun() only when the numeric comparison itself was exactly 0.


	};


	switch ( fieNamStr ) { // What: Field Switch. Why: Each sortable field has its own distinct comparison rule, keyed by name. How: This dispatches to one of the branches below, falling back to a plain name comparison for any unrecognized field. (Every case below returns directly; per this file's own switch-statement convention, a case's own return is treated like an if-branch's guard return rather than forcing a 3-blank-line gap before it.)


		case 'name':
			return revSorBoo ? -byNamFun() : byNamFun(); // What: Name Case Return. Why: Sorting by name itself is just the plain comparison, optionally flipped. How: This negates byNamFun()'s result when revSorBoo is true.

		case 'type': { // What: Type Case Block. Why: Type has no N/A concept at all, unlike most other fields, so it skips straight to a real comparison. How: This compares the two rows' own type strings, flips for descending, and falls back to name on a tie.


			const priCmpNum = rowAObj.type.localeCompare( rowBObj.type ); // What: Primary Compare Number. Why: This is the actual field comparison this case exists to perform. How: This calls String.localeCompare between the two rows' own type fields.

			return ( revSorBoo ? -priCmpNum : priCmpNum ) || byNamFun(); // What: Type Case Return. Why: The caller needs the actual final ordering, flipped for a descending sort, falling back to name on an exact tie. How: This negates priCmpNum when reversed, then falls back to byNamFun() only on an exact tie.


		}

		case 'group': { // What: Group Case Block. Why: Group can be genuinely N/A for a row with no meaningful single group. How: This defers to dirNulFun first, then compares the two rows' own group strings.


			const naaCmpNum = dirNulFun( rowAObj.group, rowBObj.group ); // What: NA Compare Number. Why: A real result from dirNulFun already fully answers this comparison. How: This calls dirNulFun and checks its result before doing any real comparison.

			if ( naaCmpNum != null ) return naaCmpNum; // What: NA Check. Why: An N/A result from dirNulFun already fully answers this comparison. How: This returns that result directly instead of falling through.


			const priCmpNum = rowAObj.group.localeCompare( rowBObj.group ); // What: Primary Compare Number. Why: Both sides are confirmed real strings at this point. How: This calls String.localeCompare between the two rows' own group fields.

			return ( revSorBoo ? -priCmpNum : priCmpNum ) || byNamFun(); // What: Group Case Return. Why: The caller needs the actual final ordering, flipped for a descending sort, falling back to name on an exact tie. How: This negates priCmpNum when reversed, then falls back to byNamFun() only on an exact tie.


		}

		case 'count': { // What: Count Case Block. Why: Count is always a real number for every row, with no N/A concept at all. How: This compares the two rows' own count fields directly.


			const priCmpNum = rowAObj.count - rowBObj.count; // What: Primary Compare Number. Why: This is the actual field comparison this case exists to perform. How: This subtracts rowBObj.count from rowAObj.count.

			return ( revSorBoo ? -priCmpNum : priCmpNum ) || byNamFun(); // What: Count Case Return. Why: The caller needs the actual final ordering, flipped for a descending sort, falling back to name on an exact tie. How: This negates priCmpNum when reversed, then falls back to byNamFun() only on an exact tie.


		}

		case 'date': { // What: Date Case Block. Why: Date can be genuinely N/A for a reminder with no next occurrence at all. How: This defers to dirNulFun first, then compares the two rows' own date fields.


			const naaCmpNum = dirNulFun( rowAObj.date, rowBObj.date ); // What: NA Compare Number. Why: A real result from dirNulFun already fully answers this comparison. How: This calls dirNulFun and checks its result before doing any real comparison.

			if ( naaCmpNum != null ) return naaCmpNum; // What: NA Check. Why: An N/A result from dirNulFun already fully answers this comparison. How: This returns that result directly instead of falling through.


			const priCmpNum = rowAObj.date - rowBObj.date; // What: Primary Compare Number. Why: Both sides are confirmed real timestamps at this point. How: This subtracts rowBObj.date from rowAObj.date.

			return ( revSorBoo ? -priCmpNum : priCmpNum ) || byNamFun(); // What: Date Case Return. Why: The caller needs the actual final ordering, flipped for a descending sort, falling back to name on an exact tie. How: This negates priCmpNum when reversed, then falls back to byNamFun() only on an exact tie.


		}

		case 'range':
			return numLasFun( rowAObj.range, rowBObj.range ); // What: Range Case Return. Why: Range only means something for an ease-up/ease-down conditional, so it always sorts last on any other mode. How: This defers entirely to numLasFun.

		case 'odds':
			return numLasFun( rowAObj.odds, rowBObj.odds ); // What: Odds Case Return. Why: Odds only means something for a weighted/dynamic conditional, so it always sorts last on any other mode. How: This defers entirely to numLasFun.

		case 'boost':
			return numLasFun( rowAObj.boost, rowBObj.boost ); // What: Boost Case Return. Why: Boost only means something for a dynamic conditional, so it always sorts last on any other mode. How: This defers entirely to numLasFun.

		case 'active': { // What: Active Case Block. Why: isActive can be genuinely N/A for a row with no single meaningful active state. How: This defers to dirNulFun first, then compares the two rows' own boolean isActive fields.


			const naaCmpNum = dirNulFun( rowAObj.isActive, rowBObj.isActive ); // What: NA Compare Number. Why: A real result from dirNulFun already fully answers this comparison. How: This calls dirNulFun and checks its result before doing any real comparison.

			if ( naaCmpNum != null ) return naaCmpNum; // What: NA Check. Why: An N/A result from dirNulFun already fully answers this comparison. How: This returns that result directly instead of falling through.


			if ( rowAObj.isActive !== rowBObj.isActive ) { // What: Active Difference Check. Why: A plain boolean subtraction doesn't work, so an unequal pair needs its own explicit comparison. How: This picks -1/1 based on which row is active, then flips it for a descending sort.


				const priCmpNum = rowAObj.isActive ? -1 : 1; // What: Primary Compare Number. Why: An active row should sort before an inactive one, ascending. How: This picks -1 when rowAObj is the active one, 1 otherwise.


				return revSorBoo ? -priCmpNum : priCmpNum; // What: Active Case Return. Why: The caller needs the actual final ordering, flipped for a descending sort. How: This negates priCmpNum when reversed.


			}


			return byNamFun(); // What: Active Tie Return. Why: Two rows with the same active state have nothing else to compare by for this field. How: This falls back to the plain name tie-break.


		}

		default:
			return byNamFun(); // What: Default Case Return. Why: An unrecognized field has no dedicated rule, so name is a safe universal fallback. How: This returns the plain name comparison.


	}


}

// #endregion compareSortEntries



/**
 * SortSelect = SortSelect
 *
 * @summary
 * A small labeled select reused for every sort control on the Data
 * tab: the section-list sort and each section's own item-list sort.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.id      - Id: The id shared between the label's htmlFor and the
 *                        select itself.
 * @param props.label   - Label: The visible label text.
 * @param props.options - Options: The list of { keyStr, labStr } choices to
 *                        render as options.
 * @param props.value   - Value: The currently-selected option's own key.
 * @param props.onChange - On Change: Receives the newly-chosen option's own
 *                         key.
 *
 * @returns The labeled select as one grouped row.
 *
 * @example
 * ```tsx
 * SortSelect({ id, label, options, value, onChange }) // => <SortSelect />
 * ```
 *
*/

// #region SortSelect

function SortSelect ( { id, label, options, value, onChange } ) {


	return (


		<div className='data-sort-row'>{ /* What: Container Sort Row Div Element. Why: This groups the label and its own select as one labeled control. How: This wraps the label below and the actual select element. */ }


			<label
				className='data-sort-lbl'
				htmlFor={ id }
			>{ /* What: Sort Label Element. Why: The select below needs an associated visible label for accessibility. How: This is linked to the select via htmlFor/id and shows the caller's own label text. */ }


				{ label }


			</label>

			<select
				id={ id }
				className='np-input data-sort-sel'
				value={ value }
				onChange={ ( chaEveObj ) => onChange( chaEveObj.target.value ) }
			>{ /* What: Sort Select Element. Why: This is the actual control the user picks a sort option from. How: This renders one <option> per entry in options below, and reports the chosen key up via onChange. */ }


				{ options.map( ( optCurObj ) => <option key={ optCurObj.keyStr } value={ optCurObj.keyStr }>{ optCurObj.labStr }</option> ) }{ /* What: Sort Option Map. Why: One <option> is needed per entry in options. How: This maps options to one <option> per entry, keyed by its own keyStr. */ }


			</select>


		</div>


	);


}

// #endregion SortSelect



/**
 * freezeEditedRow = freezeEditedRow
 *
 * @summary
 * Keeps whichever row is currently open for editing from jumping
 * around a live sort (picker items and reminders both write each
 * keystroke straight to the store, so their sort key can change mid-
 * edit): a brand-new row (still being named for the first time, id
 * === justCreatedId) pins to the very top, matching where its own
 * "+ Add" button sits, rather than wherever its still-default values
 * would otherwise sort it; an existing row being edited freezes at
 * whatever index it already occupied when editing began, instead of
 * chasing its live-typed values through the sort in real time.
 * frozenRef is a plain useRef({}) owned by the caller, persisted
 * across renders for as long as openId stays the same; the caller is
 * responsible for replaying the row's entrance animation once its
 * editor actually closes (openId changes away), so it settles into
 * its now-current live position with the same visual treatment a
 * freshly-created row already gets, rather than silently snapping
 * there.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param sorLisArr  - Sort List Array: The list, already sorted by the
 *                     caller's own live sort key.
 * @param opeIdeVal  - Open Identifier Value: The currently-open row's own id,
 *                     or null/ undefined when nothing is open.
 * @param newIdeVal  - New Identifier Value: The id of a row that was just
 *                     created (pins to the top instead of freezing at its live
 *                     index).
 * @param frzRowRef  - Frozen Row Reference: A ref, owned by the caller, that
 *                     persists the frozen { id, index } record across renders.
 *
 * @returns sorLisArr unmodified when nothing is open or the open row
 * isn't in this list, otherwise the same rows with the open one
 * reinserted at its own frozen position.
 *
 * @example
 * ```ts
 * freezeEditedRow(sorLisArr, opeIdeVal, newIdeVal, frzRowRef) // => reordered array
 * ```
 *
*/

// #region freezeEditedRow

function freezeEditedRow ( sorLisArr, opeIdeVal, newIdeVal, frzRowRef ) {


	if ( opeIdeVal == null ) { // What: No Open Row Guard. Why: With nothing currently open for editing, there is no frozen position to maintain at all. How: This clears any stale frozen record and returns the live sorted list completely unmodified.


		frzRowRef.current = null; // What: Frozen Row Reference Clear. Why: A stale frozen record from a previously-open row must not leak into a later editing session. How: This resets frzRowRef back to null.


		return sorLisArr; // What: Live List Return. Why: With nothing open, the caller's own live sort order is already correct. How: This returns sorLisArr unmodified.


	}



	const livIndNum = sorLisArr.findIndex( ( curRowObj ) => curRowObj.id === opeIdeVal ); // What: Live Index Number. Why: The frozen position logic below needs to know where the open row currently sits in the live sort. How: This searches sorLisArr for the row whose id matches opeIdeVal.

	if ( livIndNum === -1 ) return sorLisArr; // What: Not Found Guard. Why: A list that doesn't contain the currently-open row has nothing to freeze at all. How: This returns sorLisArr unmodified when no matching row was found.



	if ( !frzRowRef.current || frzRowRef.current.id !== opeIdeVal ) { // What: Frozen Record Guard. Why: A frozen position must only be computed once per "this row became the open one" session, not recomputed on every render while it stays open. How: This (re)computes frzRowRef only when there's no existing record or it belongs to a different row than the currently-open one.


		frzRowRef.current = { id : opeIdeVal, index : opeIdeVal === newIdeVal ? 0 : livIndNum }; // What: Frozen Record Set. Why: A brand-new row pins to the very top matching its own "+ Add" button, while an existing row freezes at whatever index it already occupied. How: This records the open row's id plus its own starting index, 0 for a just-created row, livIndNum otherwise.


	}



	const opeRowObj = sorLisArr[ livIndNum ];                                          // What: Open Row Object. Why: The final result needs the actual open row's own data to reinsert at its frozen position. How: This reads the row at livIndNum from sorLisArr.
	const resRowArr = sorLisArr.filter( ( curRowObj ) => curRowObj.id !== opeIdeVal ); // What: Rest Row Array. Why: The open row must be pulled out before it can be reinserted at a fixed position rather than wherever it currently live-sorts to. How: This filters sorLisArr down to every row except the open one.
	const insIndNum = Math.min( frzRowRef.current.index, resRowArr.length );          // What: Insert Index Number. Why: A frozen index from an earlier, longer list must not run past the current (possibly shorter) rest array. How: This clamps frzRowRef's own recorded index to resRowArr's own current length.



	return [ ...resRowArr.slice( 0, insIndNum ), opeRowObj, ...resRowArr.slice( insIndNum ) ]; // What: Frozen Order Return. Why: The caller needs the open row reinserted at its own frozen position rather than wherever it currently live-sorts to. How: This splices opeRowObj back into resRowArr at insIndNum.


}

// #endregion freezeEditedRow



// What: Named Exports. Why: Every tab file imports these shared UI primitives by name rather than through a namespace object. How: This re-exports every non-inline-exported binding declared in this file (reduceMotion, useEscapeCancel, and announce are already exported directly at their own declarations above).
export { Icon, Btn, Card, Collapse, Pill, ProgressBar, NumStepper, InfoTip, WeekdayChips, BoostReset, FillButton, fmtDate, fmtDateLong, fmtTime, compareSortEntries, SortSelect, freezeEditedRow };



