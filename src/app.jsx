


// #region Imports

import React from 'react'; // What: React. Why: This is the UI library the entire file's components and hooks are built on. How: This is used directly (React.useState, React.useRef, React.useLayoutEffect, ...) throughout, instead of importing individual named hooks.


import { appPalFun    } from './appearance.js';               // What: Apply Palette Function. Why: A resolved palette still has to be written onto the document to take visible effect. How: This is called with the resolved palette and the active theme key inside the theme-application effect.
import { BacFloCom    } from './bg-flourish.jsx';             // What: Background Flourish Component. Why: The decorative background glyphs are rendered behind every non-Today tab. How: This is passed the shared main-inner ref and the current tab id.
import { FeaTouCom    } from './onboarding-app-features.jsx'; // What: Feature Tour Component. Why: This drives the App Features tutorial overlay. How: This is rendered while actFeaStr holds a feature id, passed the shared state/actions and a close handler.
import { IcoSvgCom    } from './ui.jsx';                      // What: Icon Svg Component. Why: Every tab button needs a recognizable glyph alongside its label. How: This is rendered inside TabBarCom with the name from each tab's own icoStr.
import { PagTouCom    } from './onboarding-page-tours.jsx';   // What: Page Tour Component. Why: This drives the currently-running "Explore the page" mini-tour. How: This is rendered while actPagStr holds a page id.
import { PAL_SET_OBJ  } from './appearance.js';               // What: Palette Set Object. Why: Every built-in theme key needs to resolve to one of the app's own palettes. How: This is looked up by the resolved theme key, falling back to the ink palette.
import { PicTouCom    } from './onboarding-picker-tours.jsx'; // What: Picker Tour Component. Why: This drives the currently-running sample-picker mini-tour. How: This is rendered while actPicStr holds a picker id.
import { redMotFun    } from './ui.jsx';                      // What: Reduce Motion Function. Why: A user who prefers reduced motion shouldn't see the ghost/enter animation. How: This is checked inside the animation effect to bail out early when it reports true.
import { resCusFun    } from './appearance.js';               // What: Resolve Custom Function. Why: A user-defined custom palette needs resolving into a usable palette object. How: This is called with 'light' or 'dark' and the user's saved custom colors when a custom theme key is active.
import { resTheFun    } from './appearance.js';               // What: Resolve Theme Function. Why: The palette to apply depends on both the user's theme choice and the current system dark-mode state. How: This resolves both into a single concrete theme key inside the theme-application effect.
import { SED_NAM_OBJ  } from './seed.js';                     // What: Seed Namespace Object. Why: The onboarding demo needs a fresh, non-persisted state to run against instead of the user's real data. How: This is called (buiCleFun) to seed useAppStaFun when the onboarding demo flag is set.
import { TabDatCom    } from './tab-data.jsx';                // What: Tab Data Component. Why: This is the actual Data tab content. How: This is rendered while actIdeStr is 'data', passed the shared state/actions.
import { TabPicCom    } from './tab-picker.jsx';              // What: Tab Picker Component. Why: This is the actual Pickers tab content. How: This is rendered while actIdeStr is 'picker', passed the shared state/actions plus the persisted pick-animation style.
import { TabSetCom    } from './tab-settings.jsx';            // What: Tab Settings Component. Why: This is the actual Settings tab content. How: This is rendered while actIdeStr is 'settings', passed the shared state/actions.
import { TabStats     } from './tab-stats.jsx';               // What: Tab Stats. Why: This is the actual Stats tab content. How: This is rendered while actIdeStr is 'stats', passed the shared state/actions.
import { TabToday     } from './tab-today.jsx';               // What: Tab Today. Why: This is the actual Today tab content and its own onboarding tour launchers. How: This is rendered while actIdeStr is 'today', passed the shared state/actions and the tour-starting setters.
import { useAppStaFun } from './store.js';                    // What: Use App State Function. Why: This is the entire state layer, the app's persisted state and the actions that mutate it. How: This is called once, seeded with a clean non-persisted state during the onboarding demo, otherwise loading the real persisted state.
import { useEmlTouFun } from './eml-tour-bus.js';             // What: Use Ease My Life Tour. Why: The Welcome Tour needs to auto-open/close the rail while running, outside the user's own manual toggling. How: This is called once to subscribe to the shared tour event bus's phase/wantRailOpen/step fields.
import { WelTouCom    } from './onboarding-welcome-tour.jsx'; // What: Welcome Tour Component. Why: The first-run welcome modal and its driven tour need to run above every tab. How: This is rendered once, passed the shared state/actions plus the active tab and the tab-switching function.

// #endregion Imports



/**
 * app.jsx = App
 *
 * @summary
 * The app's own root component. AppRooCom owns the single active-tab-id in
 * React state, calls useAppStaFun() once for the entire state layer, and
 * renders one of the five tabs directly, there is no router. It also owns
 * theme application (resolving and writing the active palette's own CSS custom
 * properties), the onboarding demo's clean-state seeding, and mounts WelTouCom
 * plus whichever mini-tour overlay (FeaTouCom/PagTouCom/PicTouCom) is
 * currently running.
 *
 * TabBarCom is the shared nav bar rendered by AppRooCom, built from
 * TAB_OBJ_ARR's own fixed tab list; it owns the sliding active-tab indicator's
 * own measurement/animation, including the rail-placement-switch ghost-copy
 * transition documented in its own reference comments (see CLAUDE.md's own
 * worked examples throughout the Code formatting rules section, which use this
 * file as the reference implementation).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



const TAB_OBJ_ARR = [ // What: Tab Object Array. Why: This defines the fixed set of tabs that TabBarCom renders. How: This is mapped over in TabBarCom's JSX to render one nav button per entry.


	{ ideStr : 'today',    labStr : 'Today',    icoStr : 'today'    }, // What: Identifier String. Why: This uniquely identifies the tab. How: This is compared against actIdeStr for active-state styling and passed to onChange when clicked. // What: Label String. Why: This names the tab for the user. How: This is rendered as the tab's visible text. // What: Icon String. Why: This selects the tab's icon glyph. How: This is passed to IcoSvgCom's name prop.
	{ ideStr : 'picker',   labStr : 'Pickers',  icoStr : 'picker'   }, // What: Identifier String. Why: This uniquely identifies the tab. How: This is compared against actIdeStr for active-state styling and passed to onChange when clicked. // What: Label String. Why: This names the tab for the user. How: This is rendered as the tab's visible text. // What: Icon String. Why: This selects the tab's icon glyph. How: This is passed to IcoSvgCom's name prop.
	{ ideStr : 'stats',    labStr : 'Stats',    icoStr : 'stats'    }, // What: Identifier String. Why: This uniquely identifies the tab. How: This is compared against actIdeStr for active-state styling and passed to onChange when clicked. // What: Label String. Why: This names the tab for the user. How: This is rendered as the tab's visible text. // What: Icon String. Why: This selects the tab's icon glyph. How: This is passed to IcoSvgCom's name prop.
	{ ideStr : 'data',     labStr : 'Data',     icoStr : 'data'     }, // What: Identifier String. Why: This uniquely identifies the tab. How: This is compared against actIdeStr for active-state styling and passed to onChange when clicked. // What: Label String. Why: This names the tab for the user. How: This is rendered as the tab's visible text. // What: Icon String. Why: This selects the tab's icon glyph. How: This is passed to IcoSvgCom's name prop.
	{ ideStr : 'settings', labStr : 'Settings', icoStr : 'settings' }, // What: Identifier String. Why: This uniquely identifies the tab. How: This is compared against actIdeStr for active-state styling and passed to onChange when clicked. // What: Label String. Why: This names the tab for the user. How: This is rendered as the tab's visible text. // What: Icon String. Why: This selects the tab's icon glyph. How: This is passed to IcoSvgCom's name prop.


];



// #region TabBarCom

/**
 * TabBarCom = Tab Bar Component
 *
 * @summary
 * Renders the app's persistent tab bar, showing one button per entry in
 * TAB_OBJ_ARR next to a sliding indicator pill that tracks the active tab's
 * measured position and size. Also renders the pull handle used to open the
 * off-canvas rail on small screens when the bar is placed on the side. Can
 * render as a decorative ghost copy of itself, flagged via tbcGhoBoo, so a
 * placement-change animation can crossfade between the old and new bar without
 * waiting on a full remount.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actIdeStr   - Active Identifier String: {@link actIdeStr}
 * @param props.onChange    - On Change: {@link selTabFun}
 * @param props.tabPlaStr   - Tab Placement String: {@link tabPlaStr}
 * @param props.raiOpeBoo   - Rail Open Boolean: {@link raiOpeBoo}
 * @param props.onTogRaiFun - On Toggle Rail Function: Toggles the rail open or
 *                            closed.
 * @param props.className   - Class Name: Extra class name(s) to append;
 *                            defaults to an empty string.
 * @param props.tbcGhoBoo   - Tab-Bar-Com Ghost Boolean: Marks this as a
 *                            decorative ghost copy during a placement-change
 *                            animation; defaults to false.
 *
 * @returns The tab bar's own nav element, including every tab button, the
 * sliding indicator, the brand button, and (when in a side placement)
 * the rail pull handle.
 *
 * @example
 * ```tsx
 * TabBarCom({ actIdeStr, onChange, tabPlaStr, ... }) // => <TabBarCom />
 * ```
 *
*/

function TabBarCom ( { actIdeStr, onChange, tabPlaStr, raiOpeBoo, onTogRaiFun, className = '', tbcGhoBoo = false } ) {


	// #region Active Tab Indicator

	const navEleRef                   = React.useRef( null );   // What: Nav Element Reference. Why: This gives the effect a handle on the actual nav DOM node. How: This is attached via the nav element's ref prop and read inside the layout effect to query and measure it.
	const [ indRecObj, setIndRecObj ] = React.useState( null ); // What: Indicator Record Object And Setter. Why: This holds the active tab's measured position and size so the sliding indicator pill can be rendered. How: This is computed by meaPosFun and consumed in the JSX style to position the indicator span.


	React.useLayoutEffect( () => { // What: Indicator Position Layout Effect. Why: This must measure and set the indicator's position before the browser paints, avoiding a visible flash. How: This measures the active button on mount and on dependency change, re-measures on resize via a ResizeObserver and a window resize listener, and cleans both up on unmount.


		// #region Measure Position

		const meaPosFun = () => { // What: Measure Position Function. Why: This centralizes the logic for locating the active tab button and computing the indicator's rect. How: This queries the active button, bails out if none exists, then sets indRecObj from its bounding rect relative to the nav.


			const navCurEle = navEleRef.current; // What: Nav Current Element. Why: This gives a stable local reference to the live nav DOM node for this measurement pass. How: This is read once from navEleRef.current and reused for the querySelector and rect calls below.


			if ( !navCurEle ) return; // What: Nav Missing Guard. Why: The ref may not be attached yet, such as before the first render commits. How: This bails out of the measurement early when there is no nav element to measure against.



			const butActEle = navCurEle.querySelector( '.tabbtn.is-on' ); // What: Button Active Element. Why: This is the specific tab button the indicator needs to sit under. How: This is found via a CSS query for the "is-on" class inside the nav.


			if ( !butActEle ) { setIndRecObj( null ); return; } // What: No Active Button Guard. Why: No tab is currently marked active, such as mid-transition. How: This clears the indicator to hide it and bails out of the rest of the measurement.



			const navRecObj = navCurEle.getBoundingClientRect(); // What: Nav Rect Object. Why: The indicator's position must be relative to the nav rather than the viewport. How: This is used to subtract the nav's own offset from the active button's rect below.
			const butRecObj = butActEle.getBoundingClientRect(); // What: Button Rect Object. Why: This gives the raw viewport position and size of the active tab. How: This is combined with navRecObj to compute the nav-relative position stored in indRecObj.


			setIndRecObj({ // What: Indicator Record Update Call. Why: This publishes the freshly-measured position and size so the indicator pill re-renders in the right place. How: This builds the lefNum/topNum/widNum/heiNum shape from the two bounding rects above.


				heiNum : butRecObj.height,                                       // What: Height Number. Why: This sizes the indicator pill to match the active tab's height. How: This is taken directly from the active button's bounding rect.
				lefNum : butRecObj.left - navRecObj.left + navCurEle.scrollLeft, // What: Left Number. Why: This positions the indicator pill horizontally over the active tab. How: This is computed from the active button's bounding rect minus the nav's, plus the current scroll offset.
				topNum : butRecObj.top - navRecObj.top + navCurEle.scrollTop,    // What: Top Number. Why: This positions the indicator pill vertically over the active tab. How: This is computed from the active button's bounding rect minus the nav's, plus the current scroll offset.
				widNum : butRecObj.width                                         // What: Width Number. Why: This sizes the indicator pill to match the active tab's width. How: This is taken directly from the active button's bounding rect.


			});


		};


		meaPosFun(); // What: Initial Measurement Call. Why: This positions the indicator immediately on mount or dependency change, without waiting for a resize. How: This invokes meaPosFun once, synchronously.

		// #endregion Measure Position



		const navCurEle = navEleRef.current;                                                           // What: Nav Current Element. Why: This is needed here to set up the resize observation below. How: This is read once and reused for the ResizeObserver's observe call and the guard on the next line.
		const resObsObj = navCurEle && window.ResizeObserver ? new ResizeObserver( meaPosFun ) : null; // What: Resize Observer Object. Why: The indicator must re-measure whenever the nav's own layout changes size, not just the window. How: This is created only when both the nav element and the ResizeObserver API are available, and it calls meaPosFun on every observed resize.


		if ( resObsObj && navCurEle ) resObsObj.observe( navCurEle ); // What: Resize Observer Start Guard. Why: This should only begin observing once both the observer and the nav element actually exist. How: This starts watching the nav element for size changes.


		window.addEventListener( 'resize', meaPosFun ); // What: Window Resize Listener. Why: This catches viewport-level resizes that would not necessarily change the nav element's own size but could still shift the tab layout. How: This re-runs meaPosFun on every window resize event.



		return () => { // What: Effect Cleanup Function. Why: This prevents leaking the observer and listener across re-runs or after unmount. How: This disconnects the resize observer and removes the window resize listener.


			if ( resObsObj ) resObsObj.disconnect(); // What: Resize Observer Teardown Guard. Why: This should only disconnect if an observer was actually created. How: This stops the observer from watching the nav element.



			window.removeEventListener( 'resize', meaPosFun ); // What: Window Resize Listener Teardown. Why: This matches the addEventListener above so the listener does not outlive this effect run. How: This removes the same function reference that was registered.


		};


	}, [ actIdeStr, tabPlaStr, raiOpeBoo ] ); // What: Effect Dependency Array. Why: This effect must re-run whenever a change to one of these values could move or resize the active tab's indicator target. How: actIdeStr changes which button is marked active, tabPlaStr changes the tab bar's placement and therefore its whole layout, and raiOpeBoo toggling the rail open or closed can resize the nav itself.

	// #endregion Active Tab Indicator



	const bmcIdeStr = `braMarCli${ tbcGhoBoo ? '--gho' : '' }`; // What: Brand-Mark-ClipPath Identifier String. Why: SVG clipPath references must use a document-unique id, and this component can render two instances at once. How: This appends a "--gho" modifier when tbcGhoBoo is true so the real and ghost instances never collide.



	return (


		<nav
			ref={ navEleRef }
			className={ ` tabbar   tabbar--${ tabPlaStr }   ${ raiOpeBoo ? 'is-open' : '' }   ${ className } ` }
			aria-hidden={ tbcGhoBoo || undefined }
			aria-label='Sections'
		>{ /* What: Container Nav Element. Why: This is TabBarCom's own root element, holding every tab, the brand button, and the rail handle. How: This renders as an actual <nav> landmark, positioned/laid out per tabPlaStr and styled with the caller's own className. */ }


			{ indRecObj && ( // What: Indicator Visibility Check. Why: There is nothing to position until a measurement has actually happened. How: This renders the indicator span only while indRecObj holds a value, otherwise it renders nothing at all.


				<span
					className='tabbar-indicator'
					style={{
						height    : indRecObj.heiNum + 'px',
						transform : `translate(${ indRecObj.lefNum }px, ${ indRecObj.topNum }px)`,
						width     : indRecObj.widNum + 'px'
					}}
					aria-hidden='true'
				/> // What: Indicator Span Element. Why: This is the small sliding pill that visually marks the active tab. How: This is absolutely positioned via inline style using indRecObj's measured offsets and size.


			) }



			<button
				className='tabbar-brand'
				type='button'
				aria-label='Ease My Life link to go to the Today page'
				onClick={ () => onChange( 'today' ) }
			>{ /* What: Brand Button Element. Why: The logo/wordmark should also work as a shortcut back to the Today tab. How: This wraps the mark and wordmark spans in a real button and jumps to 'today' on click. */ }


				<span
					className='brand-mark'
					aria-hidden='true'
				>{ /* What: Mark Span Element. Why: This groups the small square logo mark so it can be hidden from screen readers while the button's own label carries the meaning. How: This wraps the logo svg and is itself aria-hidden. */ }


					<svg
						fill='none'
						height='18'
						viewBox='8 8 528 528'
						width='18'
					>{ /* What: Logo Svg Element. Why: This draws the small square "Ease My Life" logo mark. How: This is a fixed-viewBox icon composed of a grid, a rounded-square badge outline, and a clipped glyph path. */ }


						<defs>{ /* What: Clip Defs Element. Why: An SVG clipPath can only be applied via a defined, referenced id, not inline. How: This holds the one clipPath definition the glyph path below references. */ }


							<clipPath
								id={ bmcIdeStr }
								clipPathUnits='userSpaceOnUse'
							>{ /* What: Badge Clippath Element. Why: The glyph path's own curves slightly overshoot the rounded-square badge and need to be masked to it. How: This defines a rounded-square clip region, given a unique id so it can be referenced via url(#...). */ }


								<rect
									height='512'
									rx='75'
									ry='75'
									width='512'
									x='16'
									y='16'
								/>{ /* What: Clip Rect Element. Why: The clip region itself needs a concrete shape to clip to. How: This draws the rounded-square shape that the clipPath above exposes for reference. */ }


							</clipPath>


						</defs>



						<g
							style={{
								stroke      : 'var(--accent-soft)',
								strokeWidth : 16
							}}
						>{ /* What: Grid Group Element. Why: Groups the 8 decorative background lines so they can share one stroke style instead of repeating it 8 times. How: This sets the shared stroke/strokeWidth once, applied to every child path below. */ }


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
							style={{
								stroke         : 'currentColor',
								strokeLinecap  : 'round',
								strokeLinejoin : 'round',
								strokeWidth    : 16
							}}
							height='512'
							rx='75'
							ry='75'
							width='512'
							x='16'
							y='16'
						/>{ /* What: Badge Rect Element. Why: The logo needs a visible rounded-square border/badge behind the glyph. How: This draws the same rounded-square shape as the clip rect above, but stroked and visible instead of hidden in defs. */ }


						<path
							style={{
								fill   : 'currentColor',
								stroke : 'currentColor'
							}}
							clipPath={ `url(#${ bmcIdeStr })` }
							d='M 24.467 527.792 C 67.266 416.298 77.088 228.913 172.207 434.412 C 200.739 535.77 262.562 434.412 314.873 292.51 C 381.45 120.201 450.381 44.636 528.854 24.365 C 521.725 22.337 512.215 24.365 493.193 34.5 C 369.548 105.451 295.85 292.51 234.029 363.461 C 186.473 414.14 167.451 241.831 124.651 262.102 C 101.828 270.008 60.133 375.754 24.467 527.792 Z'
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth='8'
						/>{ /* What: Glyph Path Element. Why: This is the actual squiggly "Ease My Life" brand glyph drawn inside the badge. How: This path is clipped to the rounded-square badge so its curves never spill outside it. */ }


					</svg>


				</span>


				<span className='brand-name'>{ /* What: Name Span Element. Why: This groups the three individual initial letters into one visual unit. How: This wraps the three "brand-letter" spans below. */ }


					<span className='brand-letter'>E</span>{ /* What: Letter Span Element. Why: This shows the "E" initial as a fallback wordmark on narrow layouts. How: This is one of three individually-styled single-letter spans forming "EML". */ }<span className='brand-letter'>M</span>{ /* What: Letter Span Element. Why: This shows the "M" initial as a fallback wordmark on narrow layouts. How: This is one of three individually-styled single-letter spans forming "EML". */ }<span className='brand-letter'>L</span>{ /* What: Letter Span Element. Why: This shows the "L" initial as a fallback wordmark on narrow layouts. How: This is one of three individually-styled single-letter spans forming "EML". */ }


				</span>


				<span
					className='brand-wordmark'
					aria-hidden='true'
				>{ /* What: Wordmark Span Element. Why: Wider layouts show the full "Ease My Life" wordmark instead of just the "EML" initials. How: This wraps a small repeated logo mark and the two text lines below, hidden from screen readers since the button's own label already covers it. */ }


					<span className='bw-mark'>{ /* What: Mark Span Element. Why: The wordmark repeats the small square logo mark beside the text. How: This wraps a second, simplified copy of the logo svg. */ }


						<svg
							fill='none'
							viewBox='8 8 528 528'
						>{ /* What: Logo Svg Element. Why: This draws the small square logo mark that accompanies the wordmark text. How: This is a simplified copy of the main logo svg, without the grid lines or clipped badge outline. */ }


							<path
								style={{
									fill   : 'currentColor',
									stroke : 'currentColor'
								}}
								d='M 24.467 527.792 C 67.266 416.298 77.088 228.913 172.207 434.412 C 200.739 535.77 262.562 434.412 314.873 292.51 C 381.45 120.201 450.381 44.636 528.854 24.365 C 521.725 22.337 512.215 24.365 493.193 34.5 C 369.548 105.451 295.85 292.51 234.029 363.461 C 186.473 414.14 167.451 241.831 124.651 262.102 C 101.828 270.008 60.133 375.754 24.467 527.792 Z'
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth='8'
							/>{ /* What: Glyph Path Element. Why: This is the same squiggly brand glyph as the main logo mark. How: This draws the glyph directly, unclipped, since this simplified copy has no badge outline to stay inside of. */ }


						</svg>


					</span>


					<span className='bw-lines'>{ /* What: Lines Span Element. Why: The wordmark's text reads more naturally as two stacked lines than one long run. How: This wraps the "Ease" and "My Life" spans below. */ }


						<span className='bw-ease'>Ease</span>{ /* What: Ease Span Element. Why: This is the wordmark's first line of text. How: This renders the literal word "Ease" on its own line. */ }

						<span className='bw-rest'>My Life</span>{ /* What: Rest Span Element. Why: This is the wordmark's second line of text. How: This renders the literal words "My Life" on their own line. */ }


					</span>


				</span>


			</button>



			{ TAB_OBJ_ARR.map( ( tabConObj ) => ( // What: Tab Button List Render. Why: One button is needed per configured tab, and the set of tabs is data, not hardcoded markup. How: This maps TAB_OBJ_ARR to one button element per entry, keyed by its ideStr.


				<button
					key={ tabConObj.ideStr }
					className={ ` tabbtn   ${ tabConObj.ideStr === actIdeStr ? 'is-on' : '' } ` }
					data-tab={ tabConObj.ideStr }
					aria-current={ tabConObj.ideStr === actIdeStr ? 'page' : undefined }
					onClick={ () => onChange( tabConObj.ideStr ) }
				>{ /* What: Tab Button Element. Why: This is the clickable control for switching to this specific tab. How: This marks itself "is-on"/current when its own ideStr matches actIdeStr, and calls onChange with its ideStr when clicked. */ }


					<IcoSvgCom
						name={ tabConObj.icoStr }
						size={ 20 }
					/>{ /* What: Icon Svg Component. Why: Every tab needs a recognizable glyph alongside its label. How: This renders the icon named by the tab's own icoStr at a fixed size. */ }


					<span>{ tabConObj.labStr }</span>{ /* What: Label Span Element. Why: Every tab needs its own visible text label. How: This renders the tab's own labStr. */ }


				</button>


			))}



			<button
				className='rail-handle'
				type='button'
				aria-expanded={ raiOpeBoo }
				aria-label={ raiOpeBoo ? 'Collapse menu' : 'Expand menu' }
				onClick={ onTogRaiFun }
			>{ /* What: Handle Button Element. Why: On small screens the rail collapses into an off-canvas drawer that needs a visible, CSS-gated pull handle to open/close, riding the rail's outer edge. How: This toggles raiOpeBoo via onTogRaiFun and flips its own chevron icon to reflect the current state. */ }


				<svg
					fill='none'
					height='16'
					stroke='currentColor'
					strokeLinecap='round'
					strokeLinejoin='round'
					strokeWidth='2.2'
					viewBox='0 0 24 24'
					width='16'
				>{ /* What: Chevron Svg Element. Why: The handle needs a small directional icon showing which way it will move. How: This is a fixed-viewBox icon whose single path flips direction based on raiOpeBoo. */ }


					<path d={ raiOpeBoo ? 'M 15 6 L 9 12 L 15 18' : 'M 9 6 L 15 12 L 9 18' } />{ /* What: Chevron Path Element. Why: This draws the actual arrow shape the handle icon shows. How: This switches between a left-pointing and right-pointing chevron based on raiOpeBoo. */ }


				</svg>


			</button>


		</nav>


	);


}

// #endregion TabBarCom



// #region AppRooCom

/**
 * AppRooCom = App Root Component
 *
 * @summary
 * Owns the single source of truth for which of the five tabs is active and
 * renders the app's entire shell around it: the persistent tab bar (plus its
 * ghost copy during a placement-change animation), the active tab's own
 * content component, and every onboarding/tour overlay layered on top. Also
 * resolves and applies the current color palette, tracks the system's
 * dark-mode preference, and manages the animated crossfade between tab bar
 * placements when the user changes it in Settings.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props - This component does not use any props.
 *
 * @returns The app's entire rendered shell: the current tab bar, the active
 * tab's own content, and any onboarding overlay that's currently
 * running.
 *
 * @example
 * ```tsx
 * AppRooCom() // => <AppRooCom />
 * ```
 *
*/

function AppRooCom () {


	const onbDemBoo                = typeof location !== 'undefined' && location.hash.indexOf( 'onboard' ) !== -1;     // What: Onboard Demo Boolean. Why: This lets #onboard-demo/#onboard run the app against a fresh clean state without touching the user's real saved data. How: This checks the URL hash for the "onboard" substring.
	const [ staAppObj, actStoObj ] = useAppStaFun( onbDemBoo ? { initial : SED_NAM_OBJ.buiCleFun(), persist : false } : undefined ); // What: State App Object And Action Store Object. Why: This is the entire app's persisted state and the actions that mutate it. How: This calls useAppStaFun, seeded with a clean, non-persisted state when the onboarding demo flag is set, otherwise loading the real persisted state normally.


	const [ actIdeStr, setActIdeStr ] = React.useState( () => ( // What: Active Identifier String And Setter. Why: This tracks which of the five tabs is currently shown. How: This starts on 'settings' when the URL hash is #settings (a deep link), otherwise defaults to 'today'.


		location.hash === '#settings' ? 'settings' : 'today' // What: Deep Link Check. Why: This decides which tab the app should first show. How: This checks the URL hash for #settings and defaults to 'today' otherwise.


	) );



	const maiInnRef = React.useRef( null ); // What: Main Inner Reference. Why: Every non-Today tab shares one .main-inner wrapper (remounted per switch), so a single ref reused across all of them is enough, unlike Today which manages its own instance. How: This is attached to the shared main-inner div's ref prop below and read by BacFloCom to measure it.



	const [ raiOpeBoo, setRaiOpeBoo ] = React.useState( false ); // What: Rail Open Boolean And Setter. Why: On small screens the nav collapses into an off-canvas drawer that starts closed. How: This is toggled by the pull handle and closed automatically on tab selection or scrim tap.



	// #region Tour Resume State

	const [ actPicStr, setActPicStr ] = React.useState( () => { // What: Active Picker String And Setter. Why: Tracks which sample picker's mini-tour is running, kept here (not in TabToday) since Step 1 navigates away to the Pickers tab and would unmount TabToday. How: This seeds itself from a persisted activeTour on first mount so a reload resumes the tour instead of losing it.


		const actTouObj = staAppObj.onboarding && staAppObj.onboarding.activeTour; // What: Active Tour Object. Why: This is the persisted record of whichever onboarding tour (if any) was mid-progress on last save. How: This is read from the app's own onboarding state and checked below for a "picker-" prefixed id.



		return ( actTouObj && typeof actTouObj.id === 'string' && actTouObj.id.startsWith( 'picker-' ) ) ? actTouObj.id.slice( 'picker-'.length ) : null; // What: Resumed Picker Id Return. Why: Only a "picker-" prefixed activeTour id belongs to this state. How: This strips the "picker-" prefix and returns the remaining id, or null if no matching tour was active.


	});


	const [ actPagStr, setActPagStr ] = React.useState( () => { // What: Active Page String And Setter. Why: Tracks which "Explore the {page}" page tour is running, kept here for the same reason as actPicStr: some page tours navigate away from Today and would unmount it. How: This seeds itself from a persisted activeTour on first mount so a reload resumes the tour instead of losing it.


		const actTouObj = staAppObj.onboarding && staAppObj.onboarding.activeTour; // What: Active Tour Object. Why: This is the persisted record of whichever onboarding tour (if any) was mid-progress on last save. How: This is read from the app's own onboarding state and checked below for a "page-" prefixed id.



		return ( actTouObj && typeof actTouObj.id === 'string' && actTouObj.id.startsWith( 'page-' ) ) ? actTouObj.id.slice( 'page-'.length ) : null; // What: Resumed Page Id Return. Why: Only a "page-" prefixed activeTour id belongs to this state. How: This strips the "page-" prefix and returns the remaining id, or null if no matching tour was active.


	} );


	const [ actFeaStr, setActFeaStr ] = React.useState( () => { // What: Active Feature String And Setter. Why: Tracks which App Features tutorial is running, kept here since most of these live on Pickers/Settings, not Today. How: This seeds itself from a persisted activeTour on first mount so a reload resumes the tour instead of losing it.


		const actTouObj = staAppObj.onboarding && staAppObj.onboarding.activeTour; // What: Active Tour Object. Why: This is the persisted record of whichever onboarding tour (if any) was mid-progress on last save. How: This is read from the app's own onboarding state and checked below for an "appfeature-" prefixed id.



		return ( actTouObj && typeof actTouObj.id === 'string' && actTouObj.id.startsWith( 'appfeature-' ) ) ? actTouObj.id.slice( 'appfeature-'.length ) : null; // What: Resumed Feature Id Return. Why: Only an "appfeature-" prefixed activeTour id belongs to this state. How: This strips the "appfeature-" prefix and returns the remaining id, or null if no matching tour was active.


	} );

	// #endregion Tour Resume State



	const onbEveBus = useEmlTouFun(); // What: Onboarding Event Bus. Why: The Welcome Tour needs to auto-open/close the rail while running, even outside the user's own manual toggling. How: This subscribes to the shared tour event bus's phase/wantRailOpen/step fields, read by the effect right below.


	React.useEffect( () => { // What: Rail Sync Effect. Why: A running tour needs to force the rail open/closed to spotlight nav buttons, without fighting the user's own manual toggle outside of a tour. How: This applies onbEveBus.wantRailOpen to raiOpeBoo whenever the bus reports an active tour phase.


		if ( onbEveBus.phase === 'tour' && typeof onbEveBus.wantRailOpen === 'boolean' ) setRaiOpeBoo( onbEveBus.wantRailOpen ); // What: Tour Rail Sync Guard. Why: Only a tour actively publishing a boolean wantRailOpen should override the rail's state. How: This applies the bus's requested open/closed value to raiOpeBoo when both conditions hold.


	}, [ onbEveBus.phase, onbEveBus.wantRailOpen, onbEveBus.step ] ); // What: Effect Dependency Array. Why: Re-run whenever the tour's phase, desired rail state, or step changes. How: phase/wantRailOpen changes are the obvious triggers; step is included too so two consecutive nav-button steps (which both want the rail open, an unchanged value) still get re-evaluated and re-corrected.



	const maiEleRef = React.useRef( null ); // What: Main Element Reference. Why: selTabFun needs a handle on the shared main scroller to reset its scroll position on tab switch. How: This is attached to main's own ref prop below.



	const [ exiPlaStr, setExiPlaStr ] = React.useState( null );                                                                    // What: Exiting Placement String And Setter. Why: The old nav bar's ghost copy needs to know which placement it's animating away from. How: This is set to the previous placement when tabPlaStr changes, then cleared after the exit keyframe finishes.
	const [ navEntBoo, setNavEntBoo ] = React.useState( false );                                                                   // What: Nav Entering Boolean And Setter. Why: The real nav bar needs to know when it's mid-entrance so it can play its staggered enter-from-edge keyframe. How: This is set true when tabPlaStr changes and cleared after the enter keyframe finishes.
	const prePlaRef                   = React.useRef( ( staAppObj.appearance && staAppObj.appearance.tabPlacement ) || 'bottom' ); // What: Previous Placement Reference. Why: The layout-switch effect needs to remember the last placement across renders to detect an actual change. How: This starts at the current persisted placement and is updated by the effect below whenever tabPlaStr changes.



	// #region App Shell Behavior

	const selTabFun = React.useCallback( ( tabIdeStr ) => { // What: Select Tab Function. Why: Switching tabs should always land at the top of the new tab, not keep the previous tab's scroll position. How: This sets the active tab, closes the rail, and resets the shared main scroller's scrollTop to 0.


		setActIdeStr( tabIdeStr ); // What: Active Tab Update Call. Why: This is the actual tab switch. How: This writes the requested tab id into actIdeStr.

		setRaiOpeBoo( false ); // What: Rail Close Call. Why: Selecting a tab should always close an open rail drawer. How: This forces raiOpeBoo to false regardless of its prior value.



		if ( maiEleRef.current ) maiEleRef.current.scrollTop = 0; // What: Scroll Reset Guard. Why: The shared main scroller would otherwise keep the previous tab's scroll position. How: This zeroes the scroll position of the main element, if it's currently mounted.


	}, [] ); // What: Effect Dependency Array. Why: selTabFun only closes over stable setters and a ref, none of which ever change identity. How: An empty array means this callback is created once and never recreated.


	const [ sysDarBoo, setSysDarBoo ] = React.useState( () => ( // What: System Dark Boolean And Setter. Why: When the user has "System preference" selected, the applied theme must track the OS's own light/dark setting. How: This starts from the current prefers-color-scheme media query result, then is kept in sync by the effect below.


		typeof matchMedia === 'function' && matchMedia( '(prefers-color-scheme: dark)' ).matches // What: Initial Dark Mode Check. Why: The starting value for sysDarBoo must reflect the OS's current preference immediately, without waiting for the effect below to run. How: This safely checks matchMedia support before querying the prefers-color-scheme media query's current match state.


	) );


	React.useEffect( () => { // What: System Dark Listener Effect. Why: sysDarBoo needs to update live if the OS switches light/dark mode while the app is open, not just on load. How: This subscribes a change listener to the prefers-color-scheme media query and cleans it up on unmount.


		if ( typeof matchMedia !== 'function' ) return; // What: No MatchMedia Guard. Why: Some environments (or very old browsers) may not support matchMedia at all. How: This bails out of the effect entirely when matchMedia isn't available, leaving sysDarBoo at its initial value.



		const medQueObj   = matchMedia( '(prefers-color-scheme: dark)' );       // What: Media Query Object. Why: The same query used for the initial value must be reused here so the listener matches. How: This is the live MediaQueryList that the change listener below attaches to.
		const onDarChaFun = ( chaEveObj ) => setSysDarBoo( chaEveObj.matches ); // What: On Dark Change Function. Why: The OS's own light/dark setting can change at any time while the app is open. How: This updates sysDarBoo to the media query's current match state whenever it fires a change event.

		medQueObj.addEventListener( 'change', onDarChaFun ); // What: Dark Change Subscribe Call. Why: sysDarBoo needs to be kept live, not just set once at mount. How: This registers onDarChaFun to run on every future change event from medQueObj.



		return () => medQueObj.removeEventListener( 'change', onDarChaFun ); // What: Effect Cleanup Return. Why: The change listener must not outlive this effect run. How: This removes the exact same onDarChaFun reference that was added above.


	}, [] ); // What: Effect Dependency Array. Why: This effect only ever needs to subscribe once, on mount. How: An empty array means it never re-subscribes or re-runs after the initial mount.


	React.useEffect( () => { // What: Theme Application Effect. Why: The active palette must be recalculated and applied whenever the persisted appearance settings or the system's dark-mode state change. How: This resolves the active theme key, picks the matching palette (built-in or custom), and applies it to the document.


		const appCurObj = staAppObj.appearance || { theme : 'ink' }; // What: Appearance Current Object. Why: Very old/incomplete persisted states might not have an appearance object at all. How: This falls back to a default theme:'ink' object when appearance is missing.
		const theKeyStr = resTheFun( appCurObj, sysDarBoo );         // What: Theme Key String. Why: The actual palette to apply depends on the user's theme choice combined with the current system dark-mode state. How: This resolves both into a single concrete theme key, such as 'ink' or 'customLight'.

		let palResObj; // What: Palette Resolved Object. Why: The concrete color palette to apply isn't known yet, since it depends on which branch below resolves it. How: This is declared here and assigned in exactly one of the branches that follow.


		if ( theKeyStr === 'customLight' && appCurObj.customLight ) palResObj = resCusFun( 'light', appCurObj.customLight ); // What: Custom Light Branch. Why: A user-defined light palette takes priority when that theme key is active and a custom palette actually exists. How: This resolves the user's own saved custom-light colors into a usable palette object.

		else if ( theKeyStr === 'customDark' && appCurObj.customDark ) palResObj = resCusFun( 'dark', appCurObj.customDark ); // What: Custom Dark Branch. Why: Same reasoning as the light branch, for a user-defined dark palette. How: This resolves the user's own saved custom-dark colors into a usable palette object.

		else palResObj = PAL_SET_OBJ[theKeyStr] || PAL_SET_OBJ.ink; // What: Built-in Palette Branch. Why: Every other theme key maps to one of the app's own built-in palettes. How: This looks up the resolved key in PAL_SET_OBJ, falling back to the ink palette if the key is somehow unrecognized.


		appPalFun( palResObj, theKeyStr ); // What: Apply Palette Call. Why: Resolving a palette does nothing on its own, since it still has to be written to the page. How: This applies the resolved palette's colors, and records the active key, onto the document.


	}, [ staAppObj.appearance, sysDarBoo ] ); // What: Effect Dependency Array. Why: The applied palette only ever needs to change when the persisted appearance settings or the system dark-mode state change. How: staAppObj.appearance covers the user's own theme choice/custom colors; sysDarBoo covers the OS-level light/dark toggle.


	React.useEffect( () => { // What: Placement Dataset Effect. Why: CSS elsewhere in the app selects on document.body's own data attributes to react to the current tab placement. How: This mirrors the persisted tabPlacement (or its 'bottom' default) onto body.dataset.placement.


		document.body.dataset.placement = ( staAppObj.appearance && staAppObj.appearance.tabPlacement ) || 'bottom'; // What: Placement Dataset Write. Why: This is the actual value CSS reads to lay out the tab bar differently per placement. How: This writes the persisted tabPlacement, or 'bottom' if none is set, onto the body element.


	}, [ staAppObj.appearance && staAppObj.appearance.tabPlacement ] ); // What: Effect Dependency Array. Why: The dataset only needs rewriting when the persisted placement itself actually changes. How: This depends on the specific tabPlacement field rather than the whole appearance object, so unrelated appearance changes don't trigger it.


	React.useEffect( () => { // What: Completion Style Dataset Effect. Why: CSS elsewhere in the app selects on document.body's own data attributes to pick the completion celebration's visual style. How: This mirrors the persisted completionStyle (or its 'confetti' default) onto body.dataset.completionStyle.


		document.body.dataset.completionStyle = ( staAppObj.appearance && staAppObj.appearance.completionStyle ) || 'confetti'; // What: Completion Style Dataset Write. Why: This is the actual value CSS reads to choose which celebration animation plays. How: This writes the persisted completionStyle, or 'confetti' if none is set, onto the body element.


	}, [ staAppObj.appearance && staAppObj.appearance.completionStyle ] ); // What: Effect Dependency Array. Why: The dataset only needs rewriting when the persisted completion style itself actually changes. How: This depends on the specific completionStyle field rather than the whole appearance object, so unrelated appearance changes don't trigger it.


	const tabPlaStr = ( staAppObj.appearance && staAppObj.appearance.tabPlacement ) || 'bottom'; // What: Tab Placement String. Why: Both the JSX below and the layout-switch effect need the current resolved placement as a plain value, not buried in staAppObj. How: This resolves the persisted tabPlacement, or 'bottom' if none is set, same computation as the dataset effect above.


	React.useLayoutEffect( () => { // What: Layout Switch Animation Effect. Why: Moving the tab bar to a new placement needs a ghost of the old bar to play an exit keyframe while the real bar enters from its new edge. How: This detects an actual placement change, stages the ghost's exit and the real bar's enter flags, then clears them after their keyframes finish.


		const prePlaStr = prePlaRef.current; // What: Previous Placement String. Why: Detecting an actual change requires comparing against what was last recorded, not just the current value.


		if ( prePlaStr === tabPlaStr ) return; // What: No Change Guard. Why: The whole ghost/enter animation should only run when the placement actually changed. How: This bails out of the effect early when the previous and current placement are identical.



		prePlaRef.current = tabPlaStr; // What: Previous Placement Update. Why: The next run of this effect needs to compare against the placement that's current now. How: This overwrites prePlaRef with the newly-confirmed placement.


		if ( redMotFun && redMotFun() ) return; // What: Reduced Motion Guard. Why: A user who prefers reduced motion shouldn't see the ghost/enter animation at all. How: This bails out of the effect, skipping the animation entirely, when the shared redMotFun check reports true.



		setExiPlaStr( prePlaStr ); // What: Ghost Exit Trigger. Why: The old nav bar's ghost copy needs to know which placement it's animating away from. How: This mounts the ghost TabBarCom at the previous placement so it can play its exit keyframe.

		setNavEntBoo( true ); // What: Real Bar Enter Trigger. Why: The real nav bar, now in its new slot, needs to play its staggered enter-from-edge keyframe. How: This flags the real bar as entering, which the JSX applies as a className modifier.



		const exiEndTim = setTimeout( () => setExiPlaStr( null ), 380 );  // What: Exit End Timeout. Why: The ghost bar must be unmounted once its own exit keyframe has actually finished playing. How: This clears exiPlaStr, removing the ghost, 380ms later, matching the exit animation's own duration.
		const entEndTim = setTimeout( () => setNavEntBoo( false ), 560 ); // What: Enter End Timeout. Why: The "entering" className modifier only needs to apply for the duration of the enter keyframe. How: This clears navEntBoo 560ms later, matching the enter animation's own duration.



		return () => { // What: Effect Cleanup Function. Why: Both scheduled timeouts must not fire after this effect re-runs or the component unmounts. How: This clears both the exit-end and enter-end timeouts.


			clearTimeout( exiEndTim ); // What: Exit Timeout Clear. Why: A stale exit-end callback firing after a newer effect run began would incorrectly clear a different render's ghost state. How: This cancels the scheduled clearing of exiPlaStr.

			clearTimeout( entEndTim ); // What: Enter Timeout Clear. Why: Same reasoning as the exit timeout, for the enter-end callback. How: This cancels the scheduled clearing of navEntBoo.


		};


	}, [ tabPlaStr ] ); // What: Effect Dependency Array. Why: The whole ghost/enter animation sequence only needs to re-evaluate when the resolved placement itself changes. How: tabPlaStr is the single value this effect's own change-detection, via prePlaRef, is built around.

	// #endregion App Shell Behavior



	return (


		<div
			className='app'
			data-placement={ tabPlaStr }
		>{ /* What: App Div Element. Why: This is AppRooCom's own root element, holding the real and ghost nav bars, the rail scrim, the active tab's content, and every onboarding overlay. How: This renders as a plain div, tagged with the current tabPlaStr via a data attribute for CSS layout. */ }


			<TabBarCom
				className={ navEntBoo ? 'tabbar--entering' : '' }
				actIdeStr={ actIdeStr }
				raiOpeBoo={ raiOpeBoo }
				tabPlaStr={ tabPlaStr }
				onChange={ selTabFun }
				onTogRaiFun={ () => setRaiOpeBoo( ( v ) => !v ) }
			/>{ /* What: Tab Bar Component. Why: This is the app's persistent navigation bar. How: This renders in its current placement/entering state, driven by the app's own active tab, rail-open, and placement values. */ }

			{ exiPlaStr && ( // What: Ghost Bar Visibility Check. Why: A ghost copy of the old nav bar only needs to exist while it's still playing its exit keyframe. How: This mounts a second TabBarCom (flagged as a ghost) only while exiPlaStr holds the placement it's animating away from, otherwise nothing.


				<TabBarCom
					className='tabbar--exiting'
					actIdeStr={ actIdeStr }
					raiOpeBoo={ false }
					tabPlaStr={ exiPlaStr }
					tbcGhoBoo
					onChange={ () => {} }
					onTogRaiFun={ () => {} }
				/> // What: Tab Bar Component. Why: This plays the exit-toward-edge keyframe for the old placement while the real bar above enters its new slot. How: This is rendered at the previous placement, flagged tbcGhoBoo so its clipPath id gets the "--gho" modifier, with no-op handlers since it's purely decorative during its exit animation.


			) }


			{ raiOpeBoo && ( // What: Rail Scrim Visibility Check. Why: A dimming scrim behind the rail should only exist while the rail is actually open. How: This renders the scrim only while raiOpeBoo is true, otherwise nothing.


				<div
					className='rail-scrim'
					aria-hidden='true'
					onClick={ () => setRaiOpeBoo( false ) }
				/> // What: Scrim Div Element. Why: Tapping outside an open rail drawer is a common way users expect to close it. How: This renders a full-screen overlay that closes the rail when clicked, hidden from screen readers since it's purely a visual/interaction affordance.


			) }



			<main
				ref={ maiEleRef }
				className='main'
			>{ /* What: Content Main Element. Why: This is the single shared scroll container for whichever tab is currently active. How: This renders the Today tab directly, or wraps every other tab in a shared main-inner div, based on actIdeStr. */ }


				{ actIdeStr === 'today' && ( // What: Today Tab Visibility Check. Why: The Today tab is rendered directly, not through the shared main-inner wrapper other tabs use. How: This renders TabToday, wrapped in its own fade/key transition div, only while actIdeStr is 'today'.


					<div
						key='today'
						className='tab-fade'
					>{ /* What: Today Fade Div Element. Why: Switching tabs should play a fade transition, and React needs a stable key to treat each tab as a distinct mounted instance. How: This wraps TabToday and remounts (replaying the fade) whenever the active tab changes back to 'today'. */ }


						<TabToday
							actions={ actStoObj }
							state={ staAppObj }
							onHome={ () => selTabFun( 'today' ) }
							onNavTab={ selTabFun }
							onStartAppFeatureTour={ setActFeaStr }
							onStartPageTour={ setActPagStr }
							onStartPickerTour={ setActPicStr }
						/>{ /* What: TabToday. Why: This is the actual Today tab content and its own onboarding tour launchers. How: This is passed the shared state/actions and the tour-starting setters so it can kick off the picker, page, or app-feature tours. */ }


					</div>


				) }


				{ actIdeStr !== 'today' && ( // What: Other Tabs Visibility Check. Why: Every tab except Today shares one main-inner wrapper for its background flourish and fade transition. How: This renders the shared wrapper, and inside it whichever specific tab matches actIdeStr, only while actIdeStr isn't 'today'.


					<div
						key={ actIdeStr }
						ref={ maiInnRef }
						className='main-inner tab-fade'
					>{ /* What: Main Inner Fade Div Element. Why: Every non-Today tab needs the same fade transition and a stable per-tab key so React remounts it on switch, plus a shared ref for the background flourish to measure. How: This wraps whichever tab matches actIdeStr below, remounting (and replaying the fade) every time the active tab changes. */ }


						<BacFloCom
							measureRef={ maiInnRef }
							tabId={ actIdeStr }
						/>{ /* What: Background Flourish Component. Why: The decorative background glyphs need to know which tab they're behind and where to measure their bounds. How: This is passed the shared main-inner ref and the current tab id. */ }

						{ actIdeStr === 'picker' && ( // What: Picker Tab Visibility Check. Why: Only one tab's content should render at a time. How: This renders TabPicCom only while actIdeStr is 'picker'.


							<TabPicCom
								actStoObj={ actStoObj }
								aniStyStr={ (staAppObj.appearance && staAppObj.appearance.pickAnim) || 'reel' }
								staAppObj={ staAppObj }
								onNavHomFun={ () => selTabFun( 'today' ) }
								onNavTabFun={ selTabFun }
							/> // What: Tab Picker Component. Why: This is the actual Pickers tab content. How: This is passed the shared state/actions plus the persisted pick-animation style.


						) }

						{ actIdeStr === 'stats' && ( // What: Stats Tab Visibility Check. Why: Only one tab's content should render at a time. How: This renders TabStats only while actIdeStr is 'stats'.


							<TabStats
								actions={ actStoObj }
								state={ staAppObj }
								onHome={ () => selTabFun( 'today' ) }
								onNavTab={ selTabFun }
							/> // What: TabStats. Why: This is the actual Stats tab content. How: This is passed the shared state/actions.


						) }

						{ actIdeStr === 'data' && ( // What: Data Tab Visibility Check. Why: Only one tab's content should render at a time. How: This renders TabDatCom only while actIdeStr is 'data'.


							<TabDatCom
								actStoObj={ actStoObj }
								staAppObj={ staAppObj }
								onNavHomFun={ () => selTabFun( 'today' ) }
								onNavTabFun={ selTabFun }
							/> // What: Tab Data Component. Why: This is the actual Data tab content. How: This is passed the shared state/actions.


						) }

						{ actIdeStr === 'settings' && ( // What: Settings Tab Visibility Check. Why: Only one tab's content should render at a time. How: This renders TabSetCom only while actIdeStr is 'settings'.


							<TabSetCom
								actStoObj={ actStoObj }
								staAppObj={ staAppObj }
								onNavHomFun={ () => selTabFun( 'today' ) }
								onNavTabFun={ selTabFun }
							/> // What: Tab Settings Component. Why: This is the actual Settings tab content. How: This is passed the shared state/actions.


						) }


					</div>


				)}


			</main>



			<WelTouCom
				actStoObj={ actStoObj }
				actIdeStr={ actIdeStr }
				staAppObj={ staAppObj }
				selTabFun={ selTabFun }
			/>{ /* What: Welcome Tour Component. Why: The first-run welcome modal and its driven tour need to run above every tab, regardless of which one is active. How: This is passed the shared state/actions plus the current active tab and the tab-switching function. */ }


			{ actPicStr && ( // What: Picker Tour Visibility Check. Why: A picker mini-tour overlay should only exist while one is actually running. How: This renders PicTouCom only while actPicStr holds a picker id.


				<PicTouCom
					picIdeStr={ actPicStr }
					actStoObj={ actStoObj }
					actIdeStr={ actIdeStr }
					staAppObj={ staAppObj }
					onCloTouFun={ () => setActPicStr( null ) }
					selTabFun={ selTabFun }
				/> // What: PicTouCom. Why: This drives the currently-running sample-picker mini-tour. How: This is passed the specific picker's id, the shared state/actions, the active tab, the tab-switching function, and a close handler that clears actPicStr.


			) }


			{ actPagStr && ( // What: Page Tour Visibility Check. Why: A page mini-tour overlay should only exist while one is actually running. How: This renders PagTouCom only while actPagStr holds a page id.


				<PagTouCom
					pagIdeStr={ actPagStr }
					actStoObj={ actStoObj }
					actIdeStr={ actIdeStr }
					staAppObj={ staAppObj }
					onCloTouFun={ () => setActPagStr( null ) }
					selTabFun={ selTabFun }
				/> // What: PagTouCom. Why: This drives the currently-running "Explore the page" tour. How: This is passed the specific page's id, the shared state/actions, the active tab, the tab-switching function, and a close handler that clears actPagStr.


			) }


			{ actFeaStr && ( // What: App Feature Tour Visibility Check. Why: An App Features tutorial overlay should only exist while one is actually running. How: This renders FeaTouCom only while actFeaStr holds a feature id.


				<FeaTouCom
					feaIdeStr={ actFeaStr }
					actStoObj={ actStoObj }
					actIdeStr={ actIdeStr }
					staAppObj={ staAppObj }
					onCloTouFun={ () => setActFeaStr( null ) }
					selTabFun={ selTabFun }
				/> // What: FeaTouCom. Why: This drives the currently-running App Features tutorial. How: This is passed the specific feature's id, the shared state/actions, the active tab, the tab-switching function, and a close handler that clears actFeaStr.


			) }


		</div>


	);


}

// #endregion AppRooCom



export { AppRooCom }; // What: Named Exports. Why: main.jsx is the sole consumer, mounting this as the app's whole root. How: This re-exports AppRooCom; every other binding in this file is internal-only.


