


/**
 * icon.jsx = Icon
 *
 * @summary
 * The app's built-in line icons: one component renders any of them by name as
 * an inline SVG, so every glyph shares the same stroke style and sizing and
 * drops into a button or label matching its neighbors.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

// #region IcoSvgCom

/**
 * IcoSvgCom = Icon Svg Component
 *
 * @summary
 * Renders one of the app's built-in line icons as an inline SVG, looked
 * up by name from its own icon table. Every icon shares the same stroke
 * style and sizing, so any glyph drops into a button or label and
 * matches its neighbors.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.icoNamStr - Icon Name String: Which icon to draw, a key of the
 *                          icon table.
 * @param props.sizSteStr - Size Step String: The vertical rhythm step for
 *                          the width and height (e.g. 'bas'), defaulting
 *                          to 'p01'.
 *
 * @returns The icon's SVG element.
 *
 * @example
 * ```tsx
 * IcoSvgCom({ icoNamStr: 'plus', sizSteStr: 'p01' }) // => <IcoSvgCom />
 * ```
 *
*/

const IcoSvgCom = ( { icoNamStr, sizSteStr = 'p01' } ) => { // What: Icon Svg Component. Why: Every tab button, list row, and control across the app needs a small recognizable glyph. How: This looks up icoNamStr in icoPatObj and renders the matching SVG shape at the sizSteStr rhythm step.


	const icoPatObj = { // What: Icon Path Object. Why: This is the lookup table mapping every icon name to its own inline SVG shape markup. How: This is indexed below by the icoNamStr prop to pick which shape the rendered svg actually draws.


		ardEle : <><path d='M12 5v14M6 13l6 6 6-6' /></>,                                                                     // What: Arrow-Down Element. Why: This marks a downward move/sort action. How: This draws a vertical line ending in a downward arrowhead.
		aruEle : <><path d='M12 19V5M6 11l6-6 6 6' /></>,                                                                     // What: Arrow-Up Element. Why: This marks an upward move/sort action. How: This draws a vertical line ending in an upward arrowhead.
		calEle : <><rect x='3' y='5' width='18' height='16' rx='2' /><path d='M3 9h18M8 3v4M16 3v4' /></>,                    // What: Calendar Element. Why: This marks a date-related control. How: This draws a plain calendar outline with 2 hanger tabs.
		chdEle : <><path d='M6 9l6 6 6-6' /></>,                                                                              // What: Chevron-Down Element. Why: This marks a "collapsed, tap to expand downward" affordance. How: This draws a plain downward-pointing chevron.
		cheEle : <><path d='M4 12l5 5L20 6' /></>,                                                                            // What: Check Element. Why: This marks a completed/done state. How: This draws a single checkmark stroke.
		chvEle : <><path d='M9 6l6 6-6 6' /></>,                                                                              // What: Chevron Element. Why: This marks a "forward/expand this way" affordance. How: This draws a plain right-pointing chevron.
		croEle : <><path d='M6 6l12 12M18 6L6 18' /></>,                                                                      // What: Cross Element. Why: This marks a close/remove action. How: This draws a plain X shape.
		dowEle : <><path d='M12 3v12M7 10l5 5 5-5M5 21h14' /></>,                                                             // What: Download Element. Why: This marks an export/download action. How: This draws a downward arrow into a tray.
		ediEle : <><path d='M12 20h9' /><path d='M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z' /></>,                           // What: Edit Element. Why: This marks an edit action. How: This draws a classic pencil shape over a baseline.
		eyeEle : <><path d='M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z' /><circle cx='12' cy='12' r='3' /></>,              // What: Eye Element. Why: This marks a "visible/active" state, or a control that hides revealed content. How: This draws a plain open eye shape.
		flaEle : <><path d='M12 3c0 4-5 6-5 11a5 5 0 0 0 10 0c0-2-1-3-2-4 0 2-1 3-2 3 0-3 2-5-1-10z' /></>,                   // What: Flame Element. Why: This marks a streak/intensity indicator. How: This draws a stylized flame shape.
		mooEle : <><path d='M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z' /></>,                                                    // What: Moon Element. Why: This marks a dark-mode/night related control. How: This draws a crescent moon shape.
		pinEle : <><path d='M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z' /><circle cx='12' cy='10' r='2.5' /></>,       // What: Pin Element. Why: This marks a location/anchor-day related control. How: This draws a classic map pin teardrop with a hollow center circle.
		plaEle : <><path d='M6 4l14 8-14 8z' /></>,                                                                           // What: Play Element. Why: This marks a start/run action. How: This draws a plain filled play triangle.
		pluEle : <><path d='M12 5v14M5 12h14' /></>,                                                                          // What: Plus Element. Why: This marks an add action. How: This draws a plain plus sign.
		refEle : <><path d='M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5' /></>,               // What: Refresh Element. Why: This marks a Fill/Refill/reload action. How: This draws two curved arrows forming a full circular refresh glyph.
		skiEle : <><path d='M5 4l10 8-10 8V4zM19 5v14' /></>,                                                                 // What: Skip Element. Why: This marks a skip action. How: This draws a "next track" style triangle-and-bar shape.
		spaEle : <><path d='M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z' /></>,                                 // What: Sparkle Element. Why: This marks a highlighted/celebratory state. How: This draws a 4-pointed sparkle star.
		traEle : <><path d='M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13' /></>, // What: Trash Element. Why: This marks a delete action. How: This draws a classic lidded trash can outline.
		uplEle : <><path d='M12 21V9M7 14l5-5 5 5M5 3h14' /></>,                                                              // What: Upload Element. Why: This marks an import/upload action. How: This draws an upward arrow out of a tray.

		eyoEle : <><path d='M3 3l18 18M10.6 6.1A9.7 9.7 0 0 1 12 6c5 0 9 6 9 6a16 16 0 0 1-3.1 3.6M6.1 6.1A16 16 0 0 0 3 12s4 6 9 6c1.4 0 2.7-.4 4-1' /><circle cx='12' cy='12' r='3' /></>,                       // What: Eye-Off Element. Why: This marks a "hidden/inactive" state, or a control that reveals hidden content. How: This draws an eye shape crossed out by a diagonal slash.
		griEle : <><circle cx='9' cy='6' r='1' /><circle cx='15' cy='6' r='1' /><circle cx='9' cy='12' r='1' /><circle cx='15' cy='12' r='1' /><circle cx='9' cy='18' r='1' /><circle cx='15' cy='18' r='1' /></>, // What: Grip Element. Why: This marks a drag handle. How: This draws a 2x3 grid of dots.
		palEle : <><path d='M12 3a9 9 0 1 0 0 18c1 0 1.5-.5 1.5-1.3 0-.4-.2-.7-.4-1-.2-.3-.4-.6-.4-1 0-.8.6-1.4 1.4-1.4H16a4 4 0 0 0 4-4c0-5-3.6-9-8-9z' /><circle cx='7.5' cy='10.5' r='1.1' fill='currentColor' stroke='none' /><circle cx='11' cy='7' r='1.1' fill='currentColor' stroke='none' /><circle cx='15.5' cy='8' r='1.1' fill='currentColor' stroke='none' /></>, // What: Palette Element. Why: This marks the Appearance/theme control. How: This draws a classic paint palette with 3 filled color-well dots.

		data     : <><ellipse cx='12' cy='6' rx='7' ry='3' /><path d='M5 6v12c0 1.66 3.13 3 7 3s7-1.34 7-3V6' /><path d='M5 12c0 1.66 3.13 3 7 3s7-1.34 7-3' /></>,                              // What: Data Icon. Why: This marks the Data tab button. How: This draws a classic 3-band database cylinder.
		picker   : <><path d='M3 6h4l10 12h4M3 18h4l3.5-4.2M14.5 8.2L17 6h4' /><path d='M18 3l3 3-3 3M18 15l3 3-3 3' /></>,                                                                      // What: Picker Icon. Why: This marks the Pickers tab button. How: This draws a pair of crossing shuffle-style arrows.
		settings : <><circle cx='12' cy='12' r='3' /><path d='M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 0 1 7 4.7l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z' /></>, // What: Settings Icon. Why: This marks the Settings tab button. How: This draws a classic gearwheel shape.
		stats    : <><path d='M4 20V10M11 20V4M18 20v-8M21 20H3' /></>, // What: Stats Icon. Why: This marks the Stats tab button. How: This draws a simple 3-bar chart shape.
		today    : <><rect x='3' y='5' width='18' height='16' rx='2' /><path d='M3 9h18M8 3v4M16 3v4' /><rect x='7' y='12.5' width='4' height='4' rx='1' fill='currentColor' stroke='none' /></> // What: Today Icon. Why: This marks the Today tab button. How: This draws a small calendar outline with one filled inner square marking the current day.


	};



	const sizCssStr = `calc( var( --ver-rhy-${ sizSteStr } ) * 1rem )`; // What: Size Css String. Why: The icon's width and height both follow the named vertical rhythm step. How: This builds the step's length once for the style below.



	return (


		<svg
			style={{
				height : sizCssStr,
				width  : sizCssStr
			}}

			fill='none'
			stroke='currentColor'
			strokeLinecap='round'
			strokeLinejoin='round'
			strokeWidth='1.6'
			viewBox='0 0 24 24'

			aria-hidden='true'
		>{ /* What: Icon Svg Element. Why: This is IcoSvgCom's own single rendered element, sized and stroked identically for every glyph. How: This renders whichever shape icoPatObj[ icoNamStr ] resolves to. */ }


			{ icoPatObj[ icoNamStr ] }{ /* What: Icon Shape Lookup. Why: The svg's only content is the one glyph this icon name maps to. How: This reads icoNamStr's own entry out of icoPatObj. */ }


		</svg>


	);


};

// #endregion IcoSvgCom

// #endregion Components



// #region Exports

export { IcoSvgCom }; // What: Named Export. Why: Every button, label and tab that shows a glyph renders this icon. How: This exports IcoSvgCom by name.

// #endregion Exports


