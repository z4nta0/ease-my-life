


import React from 'react';


import { AppFeatureTour        } from './onboarding-app-features.jsx';
import { applyPaletteObj       } from './appearance.js';
import { BgFlourish            } from './bg-flourish.jsx';
import { CLEAN_STATE           } from './seed.js';
import { Icon                  } from './ui.jsx';
import { Onboarding            } from './onboarding.jsx';
import { PageTour              } from './onboarding-page-tours.jsx';
import { PALETTES              } from './appearance.js';
import { PickerTour            } from './onboarding-picker-tours.jsx';
import { reduceMotion          } from './ui.jsx';
import { resolveActiveThemeKey } from './appearance.js';
import { resolveCustomPalette  } from './appearance.js';
import { TabData               } from './tab-data.jsx';
import { TabPicker             } from './tab-picker.jsx';
import { TabSettings           } from './tab-settings.jsx';
import { TabStats              } from './tab-stats.jsx';
import { TabToday              } from './tab-today.jsx';
import { useEmlTour            } from './onboarding.jsx';
import { useStore              } from './store.jsx';



// App shell. Tab bar (bottom / side / top) + main content area.



const TAB_OBJ_ARR = [


	{ id : 'today',    label : 'Today',    icon : 'today'    },
	{ id : 'picker',   label : 'Pickers',  icon : 'picker'   },
	{ id : 'stats',    label : 'Stats',    icon : 'stats'    },
	{ id : 'data',     label : 'Data',     icon : 'data'     },
	{ id : 'settings', label : 'Settings', icon : 'settings' },


];



function TabBarCom ( { actIdeStr, onChange, tabPlaStr, raiOpeBoo, onTogRaiFun, className = '', tbcGhoBoo = false } ) {


	const navEleRef = React.useRef( null );

	const [ indRecObj, setIndRecObj ] = React.useState( null ); // {x,y,w,h} of the active tab, nav-relative


	React.useLayoutEffect( () => {


		const meaPosFun = () => {


			const navCurEle = navEleRef.current;

			if ( !navCurEle ) return;



			const butActEle = navCurEle.querySelector( '.tabbtn.is-on' );

			if ( !butActEle ) { setIndRecObj( null ); return; }



			const navRecObj = navCurEle.getBoundingClientRect();

			const butRecObj = butActEle.getBoundingClientRect();


			setIndRecObj( { x : butRecObj.left - navRecObj.left + navCurEle.scrollLeft, y : butRecObj.top - navRecObj.top + navCurEle.scrollTop, w : butRecObj.width, h : butRecObj.height } );


		};


		meaPosFun();



		const navCurEle = navEleRef.current;

		const resObsObj = navCurEle && window.ResizeObserver ? new ResizeObserver( meaPosFun ) : null;


		if ( resObsObj && navCurEle ) resObsObj.observe( navCurEle );


		window.addEventListener( 'resize', meaPosFun );



		return () => { if ( resObsObj ) resObsObj.disconnect(); window.removeEventListener( 'resize', meaPosFun ); };


	}, [ actIdeStr, tabPlaStr, raiOpeBoo ] );



	return (


		<nav ref={navEleRef} className={`tabbar tabbar--${tabPlaStr} ${raiOpeBoo ? 'is-open' : ''} ${className}`} aria-label="Sections" aria-hidden={tbcGhoBoo || undefined}>


			{indRecObj && <span className="tabbar-indicator" aria-hidden="true"
			              style={{ transform : `translate(${indRecObj.x}px, ${indRecObj.y}px)`, width : indRecObj.w + 'px', height : indRecObj.h + 'px' }} />}



			<button type="button" className="tabbar-brand" onClick={() => onChange( 'today' )} aria-label="Ease My Life — go to Today">


				<span className="brand-mark" aria-hidden="true">


					<svg viewBox="8 8 528 528" width="18" height="18" fill="none">


						<defs>


							<clipPath id="brandMarkClipNav" clipPathUnits="userSpaceOnUse">


								<rect width="512" height="512" y="16" x="16" rx="75" ry="75" />


							</clipPath>


						</defs>



						<g style={{ stroke : 'var(--accent-soft)', strokeWidth : 16 }}>


							<path d="M 528 112 L 16 112" />

							<path d="M 216 528 L 216 16" />

							<path d="M 320 528 L 320 16" />

							<path d="M 424 528 L 424 16" />

							<path d="M 112 528 L 112 16" />

							<path d="M 528 216 L 16 216" />

							<path d="M 528 320 L 16 320" />

							<path d="M 528 424 L 16 424" />


						</g>



						<rect width="512" height="512" y="16" x="16" rx="75" ry="75"
							style={{ strokeWidth : 16, strokeLinecap : 'round', strokeLinejoin : 'round', stroke : 'currentColor' }} />


						<path
							d="M 24.467 527.792 C 67.266 416.298 77.088 228.913 172.207 434.412 C 200.739 535.77 262.562 434.412 314.873 292.51 C 381.45 120.201 450.381 44.636 528.854 24.365 C 521.725 22.337 512.215 24.365 493.193 34.5 C 369.548 105.451 295.85 292.51 234.029 363.461 C 186.473 414.14 167.451 241.831 124.651 262.102 C 101.828 270.008 60.133 375.754 24.467 527.792 Z"
							strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"
							clipPath="url(#brandMarkClipNav)"
							style={{ fill : 'currentColor', stroke : 'currentColor' }}
						/>


					</svg>


				</span>


				<span className="brand-name">


					<span className="brand-letter">E</span><span className="brand-letter">M</span><span className="brand-letter">L</span>


				</span>


				<span className="brand-wordmark" aria-hidden="true">


					<span className="bw-mark">


						<svg viewBox="8 8 528 528" fill="none">


							<path d="M 24.467 527.792 C 67.266 416.298 77.088 228.913 172.207 434.412 C 200.739 535.77 262.562 434.412 314.873 292.51 C 381.45 120.201 450.381 44.636 528.854 24.365 C 521.725 22.337 512.215 24.365 493.193 34.5 C 369.548 105.451 295.85 292.51 234.029 363.461 C 186.473 414.14 167.451 241.831 124.651 262.102 C 101.828 270.008 60.133 375.754 24.467 527.792 Z"
								strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"
								style={{ fill : 'currentColor', stroke : 'currentColor' }} />


						</svg>


					</span>


					<span className="bw-lines">


						<span className="bw-ease">Ease</span>

						<span className="bw-rest">My Life</span>


					</span>


				</span>


			</button>



			{TAB_OBJ_ARR.map( ( tabConObj ) => (


				<button key={tabConObj.id}
				        className={`tabbtn ${tabConObj.id === actIdeStr ? 'is-on' : ''}`}
				        data-tab={tabConObj.id}
				        onClick={() => onChange( tabConObj.id )}
				        aria-current={tabConObj.id === actIdeStr ? 'page' : undefined}>


					<Icon name={tabConObj.icon} size={20} />


					<span>{tabConObj.label}</span>


				</button>


			) )}



			{/* Pull handle — only visible when the side rail collapses to a drawer on
			   small screens (CSS-gated). Rides the rail's outer edge; chevron flips. */}
			<button type="button" className="rail-handle"
			        onClick={onTogRaiFun}
			        aria-label={raiOpeBoo ? 'Collapse menu' : 'Expand menu'}
			        aria-expanded={raiOpeBoo}>


				<svg viewBox="0 0 24 24" width="16" height="16" fill="none"
				     stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">


					<path d={raiOpeBoo ? 'M 15 6 L 9 12 L 15 18' : 'M 9 6 L 15 12 L 9 18'} />


				</svg>


			</button>


		</nav>


	);


}



function AppRooCom () {


	// Non-destructive onboarding preview: #onboard-demo (or #onboard) runs the app
	// on a fresh clean state for this tab only, without touching saved data.
	const onbDemBoo = typeof location !== 'undefined' && location.hash.indexOf( 'onboard' ) !== -1;

	const [ staAppObj, actStoObj ] = useStore( onbDemBoo ? { initial : CLEAN_STATE(), persist : false } : undefined );

	// Deep-link straight to Settings via #settings.
	const [ actIdeStr, setActIdeStr ] = React.useState( () => (


		location.hash === '#settings' ? 'settings' : 'today'


	) );

	// Decorative background glyphs (see bg-flourish.jsx) — .main-inner is
	// shared by every non-Today tab (one at a time, remounted per switch via
	// its own key={actIdeStr} below), so one ref reused across all of them is
	// enough; Today has its own .today-body and manages its own ref/ instance
	// internally instead (see tab-today.jsx).
	const maiInnRef = React.useRef( null );


	// Collapsible side rail (small screens only — the rail becomes an off-canvas
	// drawer there instead of falling back to bottom tabs). Starts closed; the
	// pull handle toggles it, and selecting a tab or tapping the scrim closes it.
	const [ raiOpeBoo, setRaiOpeBoo ] = React.useState( false );


	// Which sample picker's mini-tour is currently running — null when none
	// is. Lives here rather than in TabToday (unlike the reminder mini-tours)
	// because Step 1 navigates to the Pickers tab, which would unmount
	// TabToday (and anything it owns) along with it; same reasoning as
	// Onboarding itself living at this level. Seeded from a persisted
	// activeTour on first mount (a reload) so the tour resumes instead of
	// silently vanishing — see onboarding-picker-tours.jsx's own resume
	// handling for the other half of this (skipping the intro modal,
	// resuming at the right — resumable — step).
	const [ actPicStr, setActPicStr ] = React.useState( () => {


		const actTouObj = staAppObj.onboarding && staAppObj.onboarding.activeTour;



		return ( actTouObj && typeof actTouObj.id === 'string' && actTouObj.id.startsWith( 'picker-' ) ) ? actTouObj.id.slice( 'picker-'.length ) : null;


	});

	// Same reasoning as actPicStr just above, for the "Explore the
	// {page}" page tours: only the Today page tour stays entirely on Today —
	// the others (Pickers' own Step 2+, and presumably Stats/Data/Settings
	// once built) navigate to their own tab, which would unmount TabToday
	// (and this tour along with it) if it lived there instead. A page tour's
	// activeTour.id is already `page-${checklist id}` (see PageTour's own
	// tourId), which already IS the id this needs.
	const [ actPagStr, setActPagStr ] = React.useState( () => {


		const actTouObj = staAppObj.onboarding && staAppObj.onboarding.activeTour;



		return ( actTouObj && typeof actTouObj.id === 'string' && actTouObj.id.startsWith( 'page-' ) ) ? actTouObj.id.slice( 'page-'.length ) : null;


	} );

	// Same reasoning again, for App Features tutorials (see
	// onboarding-app-features.jsx) — most of these live on Pickers/Settings,
	// not Today, so this has to live here too rather than in TabToday.
	const [ actFeaStr, setActFeaStr ] = React.useState( () => {


		const actTouObj = staAppObj.onboarding && staAppObj.onboarding.activeTour;



		return ( actTouObj && typeof actTouObj.id === 'string' && actTouObj.id.startsWith( 'appfeature-' ) ) ? actTouObj.id.slice( 'appfeature-'.length ) : null;


	} );

	// The Welcome Tour auto-opens/closes this same rail while it's running, so
	// a step spotlighting a nav button can actually find it there even when
	// collapsed — see onboarding.jsx's wantRailOpen publish. Only acts while a
	// tour is actually active, so it never fights the user's own manual
	// toggling outside of one. Depends on onbEveBus.step too, not just
	// wantRailOpen's own value — two consecutive nav-button steps both want it
	// open (true → true, no value change to react to), but selTabFun (called
	// by the outgoing step's own run()) unconditionally closes the rail on
	// every tab switch in between. Without step in the deps, that close would
	// never get corrected past the first pair of back-to-back nav steps.
	const onbEveBus = useEmlTour();


	React.useEffect( () => {


		if ( onbEveBus.phase === 'tour' && typeof onbEveBus.wantRailOpen === 'boolean' ) setRaiOpeBoo( onbEveBus.wantRailOpen );


	}, [ onbEveBus.phase, onbEveBus.wantRailOpen, onbEveBus.step ] );



	const maiEleRef = React.useRef( null );



	// Nav layout-switch animation: when tabPlacement changes, keep a fixed-overlay
	// GHOST of the old bar mounted to play its exit-toward-edge keyframe while the
	// real bar (now in the new slot) plays a staggered enter-from-edge; main's
	// padding transition eases the content reflow. Reduced motion skips it all.
	const [ exiPlaStr, setExiPlaStr ] = React.useState( null );

	const [ navEntBoo, setNavEntBoo ] = React.useState( false );

	const prePlaRef = React.useRef( ( staAppObj.appearance && staAppObj.appearance.tabPlacement ) || 'bottom' );



	// Switching tabs should always land at the top of the new tab — otherwise the
	// shared <main> scroller keeps the previous tab's scroll position, which reads
	// as arriving on a page already scrolled down.
	const selTabFun = React.useCallback( ( tabIdeStr ) => {


		setActIdeStr( tabIdeStr );

		setRaiOpeBoo( false );


		if ( maiEleRef.current ) maiEleRef.current.scrollTop = 0;


	}, [] );


	// Theme is now a real, persisted Settings feature (Appearance tab) rather
	// than a design-time default — resolve the active preset or custom
	// colors and apply them on every appearance change (and once on load).
	// When "System preference" is on, also track prefers-color-scheme so the
	// applied theme swaps to its counterpart as the OS switches.
	const [ sysDarBoo, setSysDarBoo ] = React.useState( () => (


		typeof matchMedia === 'function' && matchMedia( '(prefers-color-scheme: dark)' ).matches


	) );


	React.useEffect( () => {


		if ( typeof matchMedia !== 'function' ) return;

		const medQueObj = matchMedia( '(prefers-color-scheme: dark)' );

		const onDarChaFun = ( chaEveObj ) => setSysDarBoo( chaEveObj.matches );

		medQueObj.addEventListener( 'change', onDarChaFun );



		return () => medQueObj.removeEventListener( 'change', onDarChaFun );


	}, [] );


	React.useEffect( () => {


		const appCurObj = staAppObj.appearance || { theme : 'ink' };

		const theKeyStr = resolveActiveThemeKey( appCurObj, sysDarBoo );

		let palResObj;


		if ( theKeyStr === 'customLight' && appCurObj.customLight ) palResObj = resolveCustomPalette( 'light', appCurObj.customLight );

		else if ( theKeyStr === 'customDark' && appCurObj.customDark ) palResObj = resolveCustomPalette( 'dark', appCurObj.customDark );

		else palResObj = PALETTES[theKeyStr] || PALETTES.ink;


		applyPaletteObj( palResObj, theKeyStr );


	}, [ staAppObj.appearance, sysDarBoo ] );


	React.useEffect( () => {


		document.body.dataset.placement = ( staAppObj.appearance && staAppObj.appearance.tabPlacement ) || 'bottom';


	}, [ staAppObj.appearance && staAppObj.appearance.tabPlacement ] );


	React.useEffect( () => {


		document.body.dataset.completionStyle = ( staAppObj.appearance && staAppObj.appearance.completionStyle ) || 'confetti';


	}, [ staAppObj.appearance && staAppObj.appearance.completionStyle ] );


	const tabPlaStr = ( staAppObj.appearance && staAppObj.appearance.tabPlacement ) || 'bottom';


	React.useLayoutEffect( () => {


		const prePlaStr = prePlaRef.current;

		if ( prePlaStr === tabPlaStr ) return;



		prePlaRef.current = tabPlaStr;

		if ( reduceMotion && reduceMotion() ) return;



		setExiPlaStr( prePlaStr );

		setNavEntBoo( true );



		const exiEndTmo = setTimeout( () => setExiPlaStr( null ), 380 );

		const entEndTmo = setTimeout( () => setNavEntBoo( false ), 560 );



		return () => { clearTimeout( exiEndTmo ); clearTimeout( entEndTmo ); };


	}, [ tabPlaStr ] );



	return (


		<div className="app" data-placement={tabPlaStr}>


			<TabBarCom actIdeStr={actIdeStr} onChange={selTabFun} tabPlaStr={tabPlaStr}
			        className={navEntBoo ? 'tabbar--entering' : ''}
			        raiOpeBoo={raiOpeBoo} onTogRaiFun={() => setRaiOpeBoo( ( v ) => !v )} />

			{exiPlaStr && (


				<TabBarCom actIdeStr={actIdeStr} onChange={() => {}} tabPlaStr={exiPlaStr}
				        className="tabbar--exiting" tbcGhoBoo
				        raiOpeBoo={false} onTogRaiFun={() => {}} />


			)}


			{raiOpeBoo && <div className="rail-scrim" onClick={() => setRaiOpeBoo( false )} aria-hidden="true" />}



			<main className="main" ref={maiEleRef}>


				{actIdeStr === 'today' && <div className="tab-fade" key="today"><TabToday state={staAppObj} actions={actStoObj} onHome={() => selTabFun( 'today' )} onNavTab={selTabFun} onStartPickerTour={setActPicStr} onStartPageTour={setActPagStr} onStartAppFeatureTour={setActFeaStr} /></div>}


				{actIdeStr !== 'today' && (


					<div className="main-inner tab-fade" key={actIdeStr} ref={maiInnRef}>


						<BgFlourish tabId={actIdeStr} measureRef={maiInnRef} />

						{actIdeStr === 'picker'   && <TabPicker   state={staAppObj} actions={actStoObj} onHome={() => selTabFun( 'today' )} onNavTab={selTabFun} animStyle={(staAppObj.appearance && staAppObj.appearance.pickAnim) || 'reel'} />}

						{actIdeStr === 'stats'    && <TabStats    state={staAppObj} actions={actStoObj} onHome={() => selTabFun( 'today' )} onNavTab={selTabFun} />}

						{actIdeStr === 'data'     && <TabData     state={staAppObj} actions={actStoObj} onHome={() => selTabFun( 'today' )} onNavTab={selTabFun} />}

						{actIdeStr === 'settings' && <TabSettings state={staAppObj} actions={actStoObj} onHome={() => selTabFun( 'today' )} onNavTab={selTabFun} />}


					</div>


				)}


			</main>



			<Onboarding state={staAppObj} actions={actStoObj} active={actIdeStr} selectTab={selTabFun} />


			{actPicStr && (


				<PickerTour
					pickerId={actPicStr}
					state={staAppObj}
					actions={actStoObj}
					active={actIdeStr}
					selectTab={selTabFun}
					onClose={() => setActPicStr( null )}
				/>


			)}


			{actPagStr && (


				<PageTour
					pageId={actPagStr}
					state={staAppObj}
					actions={actStoObj}
					active={actIdeStr}
					selectTab={selTabFun}
					onClose={() => setActPagStr( null )}
				/>


			)}


			{actFeaStr && (


				<AppFeatureTour
					featureId={actFeaStr}
					state={staAppObj}
					actions={actStoObj}
					active={actIdeStr}
					selectTab={selTabFun}
					onClose={() => setActFeaStr( null )}
				/>


			)}


		</div>


	);


}



export { AppRooCom };


