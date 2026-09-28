


// #region Imports

import React from 'react'; // What: React. Why: InfTipCom is built directly on React's own APIs. How: This is used directly (React.useCallback, React.useEffect, React.useLayoutEffect, React.useRef, React.useState) instead of importing individual named hooks.


import { createPortal } from 'react-dom'; // What: Create Portal. Why: InfTipCom's floating tooltip must render into <body> so it is clamped to the viewport instead of being clipped by an ancestor's own overflow. How: This is called with the tooltip's JSX and document.body inside InfTipCom's return.

// #endregion Imports



/**
 * info-tip.jsx = Info Tip
 *
 * @summary
 * The app's custom tooltip. Unlike a native title attribute it matches the UI,
 * opens on tap as well as hover (most users are on mobile), and renders
 * through a portal to the body so it is clamped to the viewport and never
 * clipped by the app frame.
 *
 * Sections:
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Components

// #region InfTipCom

/**
 * InfTipCom = Info Tip Component
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
 * The actNamStr prop marks the tip as standing in for a disabled
 * control: it names the action in the accessible name and adds
 * aria-disabled, which announces the disabled state without removing
 * focusability or replacing the name, so the tip's explanation is
 * still read out. (These triggers are deliberately focusable: focus
 * plus Enter is the only way a keyboard user can learn why the action
 * is unavailable.)
 *
 * trnOnlBoo is for the "reveal a CSS-ellipsis-truncated name" use
 * case, as opposed to an always-relevant explanation like a disabled-
 * action reason or a "?" help icon. When set, the trigger measures its
 * own scrollWidth vs. clientWidth and behaves as a totally inert,
 * non-focusable span (no tooltip, no cursor affordance) whenever the
 * text isn't actually truncated, since there's nothing extra to
 * reveal. Watched via ResizeObserver on the trigger itself rather than
 * a window resize listener: a column can narrow (or a name can stop
 * fitting) for reasons that never fire resize, e.g. a sibling row's
 * ColDisCom animation later adding a scrollbar that shaves a few px off
 * every row's width, and only observing the element's own box catches
 * all of those, not just an outer-viewport size change.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actNamStr - Action Name String: The disabled action this tip
 *                          stands in for, defaulting to null.
 * @param props.children  - Children: The trigger content the tip is attached
 *                          to.
 * @param props.className - Class Name: Extra classes for the trigger,
 *                          defaulting to an empty string.
 * @param props.labTexStr - Label Text String: The tooltip's text.
 * @param props.trnOnlBoo - Truncated Only Boolean: Whether the tip only
 *                          activates when the trigger text is truncated,
 *                          defaulting to false.
 *
 * @returns The trigger, plus the tooltip portal while open.
 *
 * @example
 * ```tsx
 * InfTipCom({ actNamStr, children, labTexStr, ... }) // => <InfTipCom />
 * ```
 *
*/

const InfTipCom = ( { actNamStr = null, children, className = '', labTexStr, trnOnlBoo = false } ) => { // What: Info Tip Component. Why: See the design-rationale block above. How: This tracks its own open/position/truncation state and renders either an inert span or the full interactive trigger plus its portaled tooltip below.


	const [ tipOpeBoo, setTipOpeBoo ] = React.useState( false );                                      // What: Tip Open Boolean And Setter. Why: This tracks whether the floating tooltip is currently showing. How: This is flipped by the pointer/keyboard handlers below and read by the render's own portal guard.
	const [ tipPosObj, setTipPosObj ] = React.useState( { lefNum : 0, plaStr : 'top', topNum : 0 } ); // What: Tip Position Object And Setter. Why: The portaled tooltip needs an absolute left/top plus which side it's placed on, recomputed every time it opens or the page scrolls/resizes. How: This is written by plaTipFun below and read directly in the portaled span's own inline style.
	const [ texTrnBoo, setTexTrnBoo ] = React.useState( false );                                      // What: Text Truncated Boolean And Setter. Why: trnOnlBoo mode needs to know whether the trigger's own text is actually overflowing before deciding to be interactive at all. How: This is measured by the effect below and read by actTipBoo.

	const trgEleRef = React.useRef( null );         // What: Trigger Element Reference. Why: Both the truncation measurement and the positioning math need a handle on the real trigger DOM node. How: This is attached to the trigger span's own ref prop in both the inert and interactive render branches below.
	const tipEleRef = React.useRef( null );         // What: Tip Element Reference. Why: The positioning math needs to measure the portaled tooltip's own rendered size. How: This is attached to the portaled tooltip span's own ref prop below.
	const lasPoiRef = React.useRef( 'mouse' );      // What: Last Pointer Reference. Why: The click handler needs to know whether the interaction so far has been mouse-driven (where clicks are ignored) or touch/pen-driven (where a tap should toggle). How: This is updated on every pointerdown and read by the click handler below.
	const actTipBoo = trnOnlBoo ? texTrnBoo : true; // What: Active Tip Boolean. Why: Every other piece of this component needs one single answer for whether the tip should behave as a real, focusable, interactive trigger at all. How: This is texTrnBoo itself under trnOnlBoo, otherwise always true.


	React.useLayoutEffect( () => { // What: Truncation Measurement Effect. Why: trnOnlBoo needs to know, before paint, whether the trigger's own text is actually overflowing. How: This measures scrollWidth vs. clientWidth on mount and on every observed resize, via ResizeObserver where available, a plain window resize listener otherwise.


		if ( !trnOnlBoo ) return; // What: Not Truncation Only Guard. Why: The always-relevant tip variant never needs this measurement at all. How: This skips the rest of the effect entirely when trnOnlBoo is false.



		const trgCurEle = trgEleRef.current; // What: Trigger Current Element. Why: The measurement below needs a stable local reference to the live trigger DOM node. How: This is read once from trgEleRef.current and reused for every check below.


		if ( !trgCurEle ) return; // What: No Trigger Guard. Why: The ref may not be attached yet. How: This bails out early when there is no trigger element to measure.



		const cheTrnFun = () => setTexTrnBoo( trgCurEle.scrollWidth > trgCurEle.clientWidth ); // What: Check Truncated Function. Why: This is the actual comparison that decides whether the trigger's own text is currently overflowing. How: This compares trgCurEle's own scrollWidth against its clientWidth.


		cheTrnFun(); // What: Initial Check Call. Why: The truncation state must be known immediately on mount, not just after a later resize. How: This invokes cheTrnFun once, synchronously.


		if ( typeof ResizeObserver === 'function' ) { // What: Resize Observer Support Check. Why: ResizeObserver catches every real cause of a width change, including ones that never fire a window resize event. How: This prefers ResizeObserver when the browser actually supports it.


			const resObsObj = new ResizeObserver( cheTrnFun ); // What: Resize Observer Object. Why: The trigger's own box (not just the viewport) needs to be watched. How: This creates an observer that re-runs cheTrnFun on every observed size change.


			resObsObj.observe( trgCurEle ); // What: Resize Observer Start Call. Why: An observer does nothing until it's actually watching something. How: This starts watching trgCurEle for size changes.



			return () => resObsObj.disconnect(); // What: Resize Observer Cleanup Return. Why: The observer must not outlive this effect run. How: This disconnects resObsObj on cleanup.


		}



		window.addEventListener( 'resize', cheTrnFun ); // What: Window Resize Listener Fallback. Why: A browser without ResizeObserver still needs some way to catch a viewport-level size change. How: This re-runs cheTrnFun on every window resize event.



		return () => window.removeEventListener( 'resize', cheTrnFun ); // What: Window Resize Listener Cleanup Return. Why: The fallback listener must not outlive this effect run. How: This removes the same cheTrnFun reference that was added above.


	}, [ trnOnlBoo, labTexStr ] ); // What: Effect Dependency Array. Why: trnOnlBoo decides whether to measure at all, and labTexStr changing means the underlying text (and therefore its own overflow) may have changed too. How: Both are read directly inside the guards/effect above.


	const plaTipFun = React.useCallback( () => { // What: Place Tip Function. Why: The portaled tooltip needs its own absolute position recomputed from scratch every time it might have moved. How: This measures both the trigger and the tip, prefers placing above, flips below if that would clip, and clamps both axes to the viewport.


		const trgCurEle = trgEleRef.current; // What: Trigger Current Element. Why: The measurement below needs a stable local reference to the live trigger DOM node. How: This is read once from trgEleRef.current and reused below.
		const tipCurEle = tipEleRef.current; // What: Tip Current Element. Why: The measurement below needs a stable local reference to the live tooltip DOM node. How: This is read once from tipEleRef.current and reused below.


		if ( !trgCurEle || !tipCurEle ) return; // What: No Element Guard. Why: Both elements must actually be mounted before there is anything real to measure. How: This bails out early when either ref isn't attached yet.



		const trgRecObj = trgCurEle.getBoundingClientRect(); // What: Trigger Rect Object. Why: The tooltip's own position is computed relative to the trigger's real on-screen position. How: This reads trgCurEle's own bounding rect.
		const tipWidNum = tipCurEle.offsetWidth;             // What: Tip Width Number. Why: Centering and clamping the tooltip both need its own real rendered width. How: This reads tipCurEle's own offsetWidth.
		const tipHeiNum = tipCurEle.offsetHeight;            // What: Tip Height Number. Why: Placing the tooltip above/below the trigger needs its own real rendered height. How: This reads tipCurEle's own offsetHeight.
		const edgMarNum = 8;                                 // What: Edge Margin Number. Why: The tooltip should never sit flush against the very edge of the viewport. How: This is the fixed pixel margin every clamp below keeps clear.
		const vieWidNum = window.innerWidth;                 // What: Viewport Width Number. Why: The horizontal clamp below needs the real current viewport width. How: This reads window.innerWidth.
		const vieHeiNum = window.innerHeight;                // What: Viewport Height Number. Why: The vertical clamp below needs the real current viewport height. How: This reads window.innerHeight.


		let tipPlaStr = 'top';                         // What: Tip Placement String. Why: Above the trigger is the preferred placement, flipped below only if it would clip. How: This starts at 'top' and may be overwritten to 'bottom' just below.
		let tipTopNum = trgRecObj.top - tipHeiNum - 8; // What: Tip Top Number. Why: This is the candidate vertical position for the preferred above-trigger placement. How: This sits tipHeiNum plus an 8px gap above trgRecObj's own top edge.


		if ( tipTopNum < edgMarNum ) { // What: Top Clip Guard. Why: A tooltip that would clip the top of the viewport must flip to sit below the trigger instead. How: This overwrites both tipPlaStr and tipTopNum together when the above-placement candidate falls too high.


			tipPlaStr = 'bottom';             // What: Bottom Placement Set. Why: The tooltip now sits below the trigger. How: This overwrites tipPlaStr.
			tipTopNum = trgRecObj.bottom + 8; // What: Bottom Top Set. Why: The flipped tooltip needs its own below-trigger vertical position. How: This places it 8px below trgRecObj's own bottom edge.


		}



		if ( tipTopNum + tipHeiNum > vieHeiNum - edgMarNum ) tipTopNum = Math.max( edgMarNum, vieHeiNum - tipHeiNum - edgMarNum ); // What: Bottom Clip Guard. Why: A below-placement (or an above one that's still too tall) must not run past the bottom of the viewport either. How: This clamps tipTopNum so the tooltip's own bottom edge never crosses vieHeiNum - edgMarNum.



		let tipLefNum = trgRecObj.left + trgRecObj.width / 2 - tipWidNum / 2; // What: Tip Left Number. Why: The tooltip should start centered on the trigger horizontally. How: This computes the centered left offset before the horizontal clamp below.


		tipLefNum = Math.max( edgMarNum, Math.min( tipLefNum, vieWidNum - tipWidNum - edgMarNum ) ); // What: Horizontal Clamp. Why: A centered tooltip can still overflow either side of a narrow viewport. How: This clamps tipLefNum between edgMarNum and the viewport's own right-edge margin.


		setTipPosObj( { lefNum : tipLefNum, plaStr : tipPlaStr, topNum : tipTopNum } ); // What: Tip Position Update Call. Why: This publishes the freshly-computed position so the portaled tooltip re-renders in the right place. How: This builds the { lefNum, plaStr, topNum } shape the render below reads directly.


	}, [] ); // What: Effect Dependency Array. Why: plaTipFun only closes over stable refs and its own setter, none of which ever change identity. How: An empty array means this callback is created once and never recreated.


	React.useLayoutEffect( () => { // What: Open Positioning Effect. Why: An opening tooltip must be positioned immediately, then kept in place while the page scrolls or the viewport resizes. How: This calls plaTipFun once on open, then re-calls it on every scroll (capture phase, so it catches an inner scrollable ancestor too) and resize, cleaning both listeners up on close.


		if ( !tipOpeBoo ) return; // What: Not Open Guard. Why: There is nothing to position or track while the tooltip is closed. How: This skips the rest of the effect entirely while tipOpeBoo is false.



		plaTipFun(); // What: Initial Placement Call. Why: The tooltip must be positioned immediately on open, without waiting for a scroll or resize. How: This invokes plaTipFun once, synchronously.


		const onTipMovFun = () => plaTipFun(); // What: On Tip Move Function. Why: Both the scroll and resize listeners below need to re-run the same placement logic. How: This is a thin wrapper calling plaTipFun.


		window.addEventListener( 'scroll', onTipMovFun, true ); // What: Scroll Listener Add Call. Why: The tooltip must follow the trigger if the page (or an inner scroll container) scrolls while it's open. How: This listens in the capture phase so it catches a scroll on any ancestor, not just the window.
		window.addEventListener( 'resize', onTipMovFun );       // What: Resize Listener Add Call. Why: The tooltip must re-clamp itself if the viewport is resized while it's open. How: This listens for the plain window resize event.



		return () => { // What: Effect Cleanup Function. Why: Neither listener may outlive this effect run. How: This removes both the scroll and resize listeners registered above.


			window.removeEventListener( 'scroll', onTipMovFun, true ); // What: Scroll Listener Remove Call. Why: This matches the addEventListener above so the listener does not outlive this effect run. How: This removes the same onTipMovFun reference, matching the capture-phase flag.
			window.removeEventListener( 'resize', onTipMovFun );       // What: Resize Listener Remove Call. Why: Same reasoning as the scroll listener removal above. How: This removes the same onTipMovFun reference.


		};


	}, [ tipOpeBoo, plaTipFun ] ); // What: Effect Dependency Array. Why: tipOpeBoo decides whether to track at all, and plaTipFun is included per the exhaustive-deps convention even though it never actually changes identity. How: Both are read directly inside the guard/calls above.


	React.useEffect( () => { // What: Outside Close Effect. Why: An open tooltip must close when the user interacts outside of it, whether by pointer or by Escape. How: This registers a capture-phase pointerdown listener and a keydown listener while open, both clearing tipOpeBoo, cleaned up together.


		if ( !tipOpeBoo ) return; // What: Not Open Guard. Why: There is nothing to guard against while the tooltip is already closed. How: This skips the rest of the effect entirely while tipOpeBoo is false.



		const onPoiDowFun = ( poiDowObj ) => { // What: On Pointer Down Function. Why: A pointerdown anywhere outside the trigger itself should close the tooltip. How: This checks whether the event's own target falls inside the trigger element before closing.


			if ( trgEleRef.current && trgEleRef.current.contains( poiDowObj.target ) ) return; // What: Inside Trigger Guard. Why: A pointerdown on the trigger itself is handled by the trigger's own onPointerDown/onClick handlers below, not this outside-close listener. How: This bails out when the event's own target is contained within the trigger element.



			setTipOpeBoo( false ); // What: Tip Close Call. Why: A pointerdown genuinely outside the trigger should close the tooltip. How: This sets tipOpeBoo false.


		};


		const onKeyDowFun = ( keyDowObj ) => { if ( keyDowObj.key === 'Escape' ) setTipOpeBoo( false ); }; // What: On Key Down Function. Why: Escape is a standard way to dismiss a transient overlay like this tooltip. How: This closes the tooltip only when the pressed key is exactly Escape.


		document.addEventListener( 'pointerdown', onPoiDowFun, true ); // What: Pointer Down Listener Add Call. Why: The capture phase ensures this fires before an inner element's own stopPropagation could swallow it. How: This registers onPoiDowFun for every pointerdown in the document.
		document.addEventListener( 'keydown', onKeyDowFun );           // What: Key Down Listener Add Call. Why: Escape must close the tooltip regardless of which element currently has focus. How: This registers onKeyDowFun for every keydown in the document.



		return () => { // What: Effect Cleanup Function. Why: Neither listener may outlive this effect run. How: This removes both listeners registered above.


			document.removeEventListener( 'pointerdown', onPoiDowFun, true ); // What: Pointer Down Listener Remove Call. Why: This matches the addEventListener above so the listener does not outlive this effect run. How: This removes the same onPoiDowFun reference, matching the capture-phase flag.
			document.removeEventListener( 'keydown', onKeyDowFun );           // What: Key Down Listener Remove Call. Why: Same reasoning as the pointerdown listener removal above. How: This removes the same onKeyDowFun reference.


		};


	}, [ tipOpeBoo ] ); // What: Effect Dependency Array. Why: This effect only needs to re-run when tipOpeBoo itself changes. How: tipOpeBoo is read directly inside the guard above.


	React.useEffect( () => { if ( !actTipBoo ) setTipOpeBoo( false ); }, [ actTipBoo ] ); // What: Truncation Safety Effect. Why: A resize that un-truncates the text while its tip is open (trnOnlBoo only) should close it rather than leave a tooltip open on what just became an inert span. How: This closes the tooltip whenever actTipBoo itself goes false.


	if ( !actTipBoo ) return ( // What: Inert Guard. Why: With nothing extra to reveal (untruncated text under trnOnlBoo), this must render as a totally inert, non-interactive span. How: This returns just the ref-and-className span, skipping every interactive attribute and the portal entirely.


		<span
			ref={ trgEleRef }

			className={ className }
		>{ children }</span> // What: Inert Trigger Span Element. Why: With nothing to reveal, this must still keep the ref attached so a later resize can re-measure and flip actTipBoo. How: This renders only the ref and the caller's own className, no interactive attributes at all.


	);



	return (


		<span
			ref={ trgEleRef }

			className={ ` infotip-trigger   ${ className } ` }

			aria-disabled={ actNamStr ? 'true' : undefined }                                     // What: Disabled Action Flag. Why: A tip standing in for a disabled control must announce that state without losing focusability. How: This sets aria-disabled only when actNamStr names an action.
			aria-label={ actNamStr ? `${ actNamStr }, unavailable. ${ labTexStr }` : labTexStr } // What: Accessible Name Pick. Why: A tip standing in for a disabled control must name the action and say it's unavailable. How: This prefixes the tip text with that when actNamStr is set, else uses the tip text alone.
			role='button'
			tabIndex={ 0 }

			onBlur={ () => setTipOpeBoo( false ) }
			onClick={ ( cliEveObj ) => { // What: On Click Handler. Why: A mouse click should never toggle the tooltip since hover already owns it, but a touch/pen tap should. How: This stops the click from also reaching an outside-close listener, then toggles tipOpeBoo only when the last known pointer type wasn't mouse.


				cliEveObj.stopPropagation(); // What: Propagation Stop Call. Why: This click must not also be seen as an "outside click" by some ancestor's own dismiss handler. How: This stops the click event from bubbling further.


				if ( lasPoiRef.current !== 'mouse' ) setTipOpeBoo( ( preOpeBoo ) => !preOpeBoo ); // What: Tap Toggle Guard. Why: Only a touch/pen tap should toggle the tooltip this way; a mouse click is intentionally ignored since hover already handles it. How: This flips tipOpeBoo only when lasPoiRef's own current value isn't 'mouse'.


			} }
			onKeyDown={ ( keyDowObj ) => { // What: On Key Down Handler. Why: A keyboard user has no hover/tap, so Enter/Space must be able to toggle the tooltip directly. How: This toggles tipOpeBoo and prevents the key's own default action (e.g. Space scrolling the page) for either key.


				if ( keyDowObj.key === 'Enter' || keyDowObj.key === ' ' ) { // What: Toggle Key Check. Why: Only Enter and Space are meaningful "activate" keys for a role="button" trigger. How: This prevents the key's default action and flips tipOpeBoo only for those 2 keys.


					keyDowObj.preventDefault();                  // What: Default Prevention Call. Why: Space would otherwise scroll the page. How: This prevents the key's own default action.
					setTipOpeBoo( ( preOpeBoo ) => !preOpeBoo ); // What: Tip Toggle Call. Why: This is the keyboard's own way to open or close the tip. How: This flips tipOpeBoo.


				}


			} }
			onPointerDown={ ( poiDowObj ) => { lasPoiRef.current = poiDowObj.pointerType || 'mouse'; } }                           // What: Pointer Type Record. Why: The click handler must know whether a touch or a mouse triggered it. How: This only stores the pointer type in lasPoiRef for that handler to read.
			onPointerEnter={ ( poiEntObj ) => { if ( ( poiEntObj.pointerType || 'mouse' ) === 'mouse' ) setTipOpeBoo( true ); } }  // What: Mouse Hover Open. Why: Only a mouse hovers; a touch must toggle on tap instead. How: This opens the tip only for a mouse pointer.
			onPointerLeave={ ( poiLeaObj ) => { if ( ( poiLeaObj.pointerType || 'mouse' ) === 'mouse' ) setTipOpeBoo( false ); } } // What: Mouse Hover Close. Why: A tip opened by hovering must close when the mouse leaves, while a tapped tip stays open. How: This closes the tip only for a mouse pointer.
		>{ /* What: Container Infotip Trigger Span Element. Why: This is the actual focusable, interactive trigger, wrapping the caller's own children and (while open) the portaled tooltip. How: This handles hover for mouse, tap for touch/pen, and Enter/Space/Escape/blur for keyboard, per the design-rationale block above. */ }


			{ children }{ /* What: Trigger Content. Why: InfTipCom wraps whatever the caller wants the tip attached to (a word, an icon, a chip). How: This renders the caller's own children inside the interactive trigger. */ }

			{ tipOpeBoo && createPortal( // What: Portal Visibility Check. Why: The floating tooltip itself should only exist in the DOM while actually open. How: This portals the tooltip span into document.body only while tipOpeBoo is true.


				<span
					ref={ tipEleRef }

					className={ ` infotip   infotip--${ tipPosObj.plaStr } ` }

					style={{
						left : tipPosObj.lefNum,
						top  : tipPosObj.topNum
					}}

					data-element-name-hook='infTipSpa'

					role='tooltip'
				>{ /* What: Tip Span Element. Why: This is the actual floating tooltip bubble, positioned via tipPosObj. How: This renders the caller's own labTexStr text, placed per its own infotip--{placement} modifier class. Its data-element-name-hook is read by the shared Escape-key handler. */ }


					{ labTexStr }


				</span>,

				document.body // What: Document Body Target. Why: The tooltip must render outside the app's own DOM subtree so ancestor overflow/clipping never affects it. How: This is createPortal's own target container argument.

			) }


		</span>


	);


};

// #endregion InfTipCom

// #endregion Components



// #region Exports

export { InfTipCom }; // What: Named Export. Why: Any control or label that needs an inline explanation renders this tooltip. How: This exports InfTipCom by name.

// #endregion Exports


