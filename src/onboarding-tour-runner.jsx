


// #region Imports

import React from 'react'; // What: React. Why: This is the UI library GuidedTour and its supporting helpers are built on. How: This is used directly (React.useState, React.useRef, React.useEffect, React.useLayoutEffect, React.useCallback) throughout, instead of importing individual named hooks.


import { createPortal } from 'react-dom';         // What: Create Portal. Why: The dim layer, spotlight and coach card must render into <body> so they clamp to the viewport instead of being clipped by an ancestor's own overflow. How: This is called with GuidedTour's own JSX and document.body inside the porFun helper below.
import { emlTouObj    } from './eml-tour-bus.js';  // What: Ease My Life Tour Object. Why: This publishes the running tour's phase/step/tourId/reserveTop/wantRailOpen fields so other tabs can react without a context provider. How: This is written to via .set() at several points below and never read synchronously here.
import { InfoTip      } from './ui.jsx';           // What: Info Tip. Why: A requireClick step's disabled Next button needs a hover/tap hint explaining why it can't be clicked yet. How: This wraps that disabled button in the render output below.
import { reduceMotion } from './ui.jsx';           // What: Reduce Motion. Why: A user who prefers reduced motion should get an instant scroll instead of a smooth one. How: This is checked inside briTarFun's own scroll calls below.
import { useEmlTouFun } from './eml-tour-bus.js';  // What: Use Ease My Life Tour Function. Why: GuidedTour needs to know whether a drag gesture is in progress elsewhere in the app, so it can hide its own coach card during one. How: This is called once to subscribe to the shared tour bus and read its own dragging field.

// #endregion Imports



/**
 * onboarding-tour-runner.jsx = Onboarding Tour Runner
 *
 * @summary
 * A generic guided-tour engine: sequential single-spotlight steps with
 * a coach card (Step N of N, Skip/Back/Next). Shared by the Welcome
 * Tour (onboarding.jsx) and every per-feature mini-tour built on it.
 * This file owns none of any specific tour's content or business
 * logic, only the mechanics: spotlight positioning, the chrome clamp,
 * the click-guard, the not-found watchdog, tab-sync, the mobile rail
 * auto-open, resume-on-reload persistence. This is NOT used by the
 * on-demand help mode (see help-mode.jsx): that is simultaneous
 * multi-highlight with no dimming that blocks clicks and no sequential
 * coach, a genuinely different engine.
 *
 * A step is:
 *   sel      - CSS selector(s) for the element(s) to highlight
 *              (comma-separated fallbacks honored in order: finTarFun
 *              tries each in turn and uses the first that matches
 *              anything).
 *   clickSel - Optional override for what counts as "on target" for
 *              the click-guard/requireClick logic specifically (the
 *              spotlight tracking, scroll-into-view, and
 *              advanceWhen's own default still key off `sel`).
 *              Defaults to `sel`, only needed when a step highlights a
 *              BIGGER box than what it actually wants clicked, e.g.
 *              the whole picker stage plus actions area with multiple
 *              buttons in it, only one of which should count. Without
 *              this, any click landing anywhere inside `sel` (a
 *              disabled sibling button included, since a disabled
 *              element with pointer-events:none passes its click
 *              through to whatever is underneath, typically the
 *              highlighted container itself) would satisfy
 *              requireClick, which is almost never what a step author
 *              actually wants from a highlight wider than its real
 *              target.
 *   pulseSel - Optional; when set, the requireClick pulse (the
 *              .ob-spot.is-pulsing CSS) only plays while this selector
 *              currently matches. Used by a `sel` with a fallback
 *              alternative (e.g. a button that widens to its whole
 *              surrounding window once clicked, see manualGeneration
 *              in onboarding-page-tours.jsx) so the pulse stops the
 *              moment there is nothing left to click, instead of
 *              continuing to ping around the now-bigger, no-longer-
 *              actionable highlight. Defaults to matching
 *              cur.requireClick exactly (always pulses) when unset;
 *              every other requireClick step is unaffected.
 *   title/body - Coach card copy.
 *   tab      - Which app tab this step's target lives on. The tour
 *              switches there automatically whenever the active tab
 *              does not already match: this covers ordinary
 *              advancing and a resume (there is no "previous step" to
 *              have navigated there on a resume), plus going back, so
 *              step authors never call selectTab themselves.
 *   back     - Whether to show the Back button.
 *   primary  - Button label; 'Done' finishes the tour instead of
 *              advancing.
 *   run      - Optional side effect fired when the primary button is
 *              clicked, before advancing/finishing (e.g. running the
 *              real generator). A pure side effect: which step/tab
 *              comes next is handled generically, not by run() itself.
 *   scrollToTop - True if this step's target starts right at the top
 *              of the page anyway (e.g. a full-list review step), so
 *              landing on it scrolls all the way to 0 instead of just
 *              nudging the target into view.
 *   scrollToBottom - The same idea, inverted: true if this step's
 *              target always sits at the very bottom of its page/form
 *              (e.g. a footer button), so landing on it scrolls all
 *              the way to the end instead of nudging. This is more
 *              reliable than the pad-based nudge when the surrounding
 *              content just changed shape (a form switching sub-
 *              steps) and the carried-over scroll position no longer
 *              means anything.
 *   revealHorizontally - True if this step's target lives in a row
 *              that scrolls HORIZONTALLY (e.g. a tab strip), rather
 *              than being reachable through the normal vertical scroll
 *              the rest of briTarFun's own math handles (that math,
 *              and getScrFun, which only ever looks for a vertically-
 *              overflowing ancestor, has no horizontal equivalent, so
 *              a target sitting off the scrollable end of such a row
 *              would otherwise never actually come into view). A one-
 *              time native scrollIntoView({inline: 'end'}) once the
 *              target is first found. Not currently used by any step
 *              (the picker mini-tour's own "+Add" step used to need
 *              this, see buildPickerTourStep2's own comment for why
 *              moving that tab to the FRONT of its strip retired it),
 *              but the flag itself stays generic for the next
 *              horizontally-scrolling row a step needs to reach into.
 *   coachAtTop - True if this step's target can be TALLER than the
 *              viewport itself (e.g. a highlighted region that is
 *              most of a mobile screen's height). The normal reserve-
 *              space logic (decResFun below) only solves "does the
 *              coach fit adjacent to the target": it pads the target
 *              further down the page to make room for the coach
 *              above it, which is exactly backwards when the target
 *              is already tall enough to fill the viewport, since the
 *              padding pushes its own bottom edge past the fold
 *              instead of helping. This skips decResFun entirely and
 *              gives briTarFun a precise initial scroll target (the
 *              target starts right below where the coach will land)
 *              instead of the general pad/padBotNum math, which does
 *              not reliably land a too-tall target anywhere useful on
 *              the very first frame. The coach's own ONGOING position
 *              needs no special case at all beyond that: the normal
 *              below/above placement logic already reacts to the
 *              tracked rect (clamped to the safe viewport area, not
 *              the target's full height), so it naturally sits above
 *              the target while most of it is still below the fold,
 *              and flips to sit below it, arrow up, once the user has
 *              scrolled far enough that the target's real bottom edge
 *              comes into view with room to spare.
 *   requireClick - True if this step teaches the real interface
 *              rather than narrating it: Next is disabled (with a
 *              hover/tap hint) and the step only advances when the
 *              user clicks the highlighted target itself, the same
 *              click-guard exemption that already lets a target's own
 *              click through now also triggers the primary action
 *              (run(), then advance) instead of a no-op.
 *   advanceOn - Optional CSS selector, independent of requireClick:
 *              Next stays enabled and works as normal (this step
 *              narrates, it does not force the real interaction), but
 *              a real click landing on this selector is ALSO treated
 *              as clicking Next, the same onPrimary() call, run()
 *              included. For a step whose body copy already tells the
 *              user "we'll do this for you, or do it yourself via the
 *              real button", the real button's own click should count
 *              as having advanced, not leave the user still needing to
 *              also click Next afterward. Should stay within (or be a
 *              subset of) `sel`/`clickSel` so the generic guard does
 *              not block it as off-target.
 *   resumable - Defaults to true (every Welcome Tour step qualifies,
 *              since its targets are all durable/already-rendered).
 *              Set false on a step whose target only exists because an
 *              EARLIER step's un-persisted side effect put it there
 *              (e.g. a form opened by a previous click): a reload
 *              wipes that side effect, so resuming directly into such
 *              a step would highlight nothing and just trip the not-
 *              found watchdog a few seconds later. The persisted
 *              resume checkpoint (see the effect below) only ever
 *              advances to a resumable step, so a tour with a long
 *              non-resumable tail still resumes at its last safe step
 *              instead of being knocked all the way back to the
 *              intro.
 *   solo     - A standalone single-message tip, not a step in a
 *              sequence: hides the "Step N of N" progress line and
 *              the Skip/Back row, and stretches the one remaining
 *              button (whatever `primary` says, e.g. "Dismiss") to
 *              the full width of that row instead of pairing it
 *              against Skip/Back. Its click always finishes the tour
 *              outright regardless of the button's own label, see
 *              priActFun's own comment for why relying on
 *              primary === 'Done' would not work here. Built for the
 *              App Features intro tip (onboarding-app-features.jsx),
 *              but generic: any tour can use a solo step anywhere in
 *              its sequence, not just as a single-step tour.
 *
 * Props:
 *   tourId     - This tour's slot key in state.onboarding.activeTour,
 *                e.g. 'welcome'. The ONLY thing enforcing "one guided
 *                tour at a time" is that only one GuidedTour is ever
 *                mounted at once; tourId just labels whichever one
 *                that is for persistence.
 *   steps      - The array described above.
 *   resumeStep - Initial step index (the caller decides whether/what
 *                to resume, e.g. gating on its own intro-modal state;
 *                this component does not read activeTour itself, only
 *                writes it going forward).
 *   actions, active, selectTab - Same app plumbing every tab already
 *                gets.
 *   onGoBack   - Optional (targetStepIndex) => void, side effects to
 *                run before navigating back to a given step (e.g.
 *                undoing something a later step did). Called before
 *                the step actually changes.
 *   onFinish   - Called on genuine completion only: the primary
 *                button on a step whose `primary` is 'Done'. After
 *                this component's own cleanup (activeTour, the bus's
 *                phase, the body class) has already run.
 *   onSkip     - Called for everything else the tour can end from:
 *                the Skip button, a target that never resolves (the
 *                not-found watchdog), or a resumed/advanced step
 *                index past the end of `steps`. Optional; omit it to
 *                route all of these through onFinish instead, for a
 *                tour with nothing tracking the distinction (e.g. the
 *                Welcome Tour).
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// What: Coach Height Number. Why: This is a conservative estimate of the coach card's own height, good enough to decide whether it fits above/below a step's highlighted target; the real value depends on each step's body-text length, which is not measured. How: This seeds the reserve-space calculation and the coach's own initial placement below, both of which are corrected once the coach's real height is measured.
const COA_HEI_NUM = 220;



/**
 * safTopFun = Safe Top Function
 *
 * @summary
 * The lowest screen-y a SPOTLIGHT/TARGET can safely sit without
 * landing under fixed/sticky Today-tab chrome: the sticky header,
 * plus, on mobile, where the groups rail flips from a side column to
 * a horizontal pill bar stacked below the header, that rail too, plus
 * the Edit Mode banner (present whenever editMode is on, at any
 * width; see tab-today.jsx's editmode-banner, which sits sticky just
 * below the header and, despite being in normal flow, does not
 * actually push .today-layout's content down to clear it). A target
 * scrolled up underneath any of these would be genuinely HIDDEN
 * (they are sticky, so they keep painting on top of whatever scrolls
 * beneath them), not just visually crowded; this floor exists to stop
 * that, and applies to the spotlight clamp and briTarFun's own
 * scroll-up nudge (the ACTUAL highlighted element's own visibility).
 *
 * The COACH card is a different story: it renders inside .ob-tour, a
 * z-index 1010 overlay well above any of this chrome (header, rail,
 * and the Edit Mode banner alike), so it can sit wherever it likes on
 * screen without ever being physically obscured by any of it. Pass
 * forCoaBoo:true (all of the coach's own placement math below does)
 * to skip this whole exclusion zone entirely. Confirmed live: on a
 * short viewport (iPhone SE) with the header plus rail counted
 * against the coach too, several steps' tooltips had nowhere left to
 * fit at all; the Edit Mode step hits the identical problem once the
 * banner is showing.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const safTopFun = ( { forCoaBoo } = {} ) => { // What: Safe Top Function. Why: Every clamp/scroll calculation below needs one shared answer for "how far down does fixed chrome reach". How: This returns 0 for the coach (forCoaBoo), otherwise the lowest bottom edge among the sticky header, the mobile group rail, and the Edit Mode banner.


	if ( forCoaBoo ) return 0; // What: Coach Exemption Guard. Why: The coach card floats in its own high z-index overlay, never physically under this chrome. How: This skips the whole exclusion zone and returns 0 whenever forCoaBoo is true.

	const hdrEle = document.querySelector( '.today-h' ); // What: Header Element. Why: Today's own sticky header is the first, always-present piece of chrome to clamp against. How: This looks it up fresh on every call, since it may not exist outside the Today tab.

	let botNum = hdrEle ? hdrEle.getBoundingClientRect().bottom : 0; // What: Bottom Number. Why: This is the running "safe top" answer, widened below by whichever additional chrome is also present. How: This starts at the header's own bottom edge, or 0 when there is no header at all.

	const railEle = document.querySelector( '.group-rail' ); // What: Rail Element. Why: On mobile the group rail stacks below the header as its own row, so it needs folding into the same floor. How: This looks up the rail element fresh on every call.

	if ( railEle && getComputedStyle( railEle ).flexDirection === 'row' ) { // What: Mobile Rail Guard. Why: The rail only occupies this floor when it has actually flipped to its horizontal, below-header layout. How: This checks the rail's own computed flex-direction rather than viewport width directly.


		botNum = Math.max( botNum, railEle.getBoundingClientRect().bottom ); // What: Rail Bottom Fold. Why: The rail can sit lower than the header alone would suggest. How: This widens botNum to whichever is lower between the current value and the rail's own bottom edge.


	}

	const banEle = document.querySelector( '.editmode-banner' ); // What: Banner Element. Why: Edit Mode's own sticky banner is a third, independently-present piece of chrome. How: This looks up the banner element fresh on every call.

	if ( banEle ) botNum = Math.max( botNum, banEle.getBoundingClientRect().bottom ); // What: Banner Bottom Fold. Why: The banner can sit lower than the header/rail alone would suggest whenever Edit Mode is on. How: This widens botNum to whichever is lower between the current value and the banner's own bottom edge.



	return botNum; // What: Safe Top Return. Why: The caller needs the single lowest chrome edge to clamp against. How: This returns the fully-folded botNum.


};



/**
 * safBotFun = Safe Bottom Function
 *
 * @summary
 * The highest screen-y a spotlight/coach can safely reach without
 * landing UNDER the floating bottom tab bar (tabPlacement 'bottom'
 * only; the other two placements do not occupy this edge, so there
 * is nothing to clamp against and this returns the viewport height,
 * i.e. no constraint). Mirrors safTopFun's own job for the opposite
 * edge.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const safBotFun = () => { // What: Safe Bottom Function. Why: A bottom-anchored tab bar is the one piece of chrome that clips from the BOTTOM of the viewport instead of the top. How: This returns the bar's own top edge when present, otherwise the full viewport height.


	const barEle = document.querySelector( '.tabbar--bottom' ); // What: Bar Element. Why: Only a bottom-placed tab bar occupies this edge at all. How: This looks up the bar element fresh on every call.


	return barEle ? barEle.getBoundingClientRect().top : window.innerHeight; // What: Safe Bottom Return. Why: The caller needs either the bar's own top edge or, when there is no bottom bar, the plain viewport height as a no-op constraint. How: This picks whichever applies.


};



/**
 * coaLayFun = Coach Layout Function
 *
 * @summary
 * Where the coach should sit relative to the (already clamped)
 * highlight rect, shared by the render function's own React-driven
 * placement and plcTarFun's imperative per-frame write below, so the
 * two can never disagree. Having both matters: plcTarFun is what
 * keeps the coach in lockstep with the highlight DURING a smooth
 * scroll (see its own comment), but React's render still needs the
 * same math for the coach's very first paint each step (before
 * plcTarFun has run at all) and as the eventual-consistency fallback
 * once React catches up.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const coaLayFun = ( recObj, coaHeiNum, coaWidNum, vpWidNum, vpHeiNum ) => { // What: Coach Layout Function. Why: This is the one shared answer for where the coach sits relative to a clamped highlight rect. How: This prefers below the target, flipping above it only once there is no room below.


	const lefNum = Math.max( 12, Math.min( recObj.left, vpWidNum - coaWidNum - 12 ) ); // What: Left Number. Why: The coach must never sit flush against either viewport edge. How: This clamps the target's own left edge between a 12px margin and the coach's own width from the right edge.

	const safTopNum = safTopFun( { forCoaBoo: true } ) + 12; // What: Safe Top Number. Why: The "flip above" branch below must not let the coach rise above the coach's own exclusion floor. How: This calls safTopFun in coach mode (always 0) plus a fixed 12px margin.

	const spcBelNum = vpHeiNum - ( recObj.top + recObj.height ); // What: Space Below Number. Why: The below/above choice needs to know how much room actually exists under the target. How: This subtracts the target's own bottom edge from the viewport's own height.

	if ( spcBelNum >= coaHeiNum + 16 ) return { top: recObj.top + recObj.height + 16, left: lefNum, arrowClass: 'ob-coach--up' }; // What: Below Placement Return. Why: Below is preferred whenever the coach's own height plus its 16px gap actually fits there. How: This returns a layout 16px under the target with an upward-pointing arrow.


	return { top: Math.max( recObj.top - 16 - coaHeiNum, safTopNum ), left: lefNum, arrowClass: 'ob-coach--down' }; // What: Above Placement Return. Why: This is the fallback once below does not fit. How: This places the coach 16px above the target, clamped down to safTopNum so it never rises past the safe floor.


};

const arwXFun = ( recObj, coaLefNum, coaWidNum ) => Math.max( 18, Math.min( recObj.left + recObj.width / 2 - coaLefNum, coaWidNum - 26 ) ); // What: Arrow X Function. Why: The coach's own arrow must stay centered on the target's own horizontal midpoint while never sliding into the coach's own rounded corners. How: This computes that midpoint relative to the coach's own left edge, clamped to a safe inset range.



/**
 * goToTodayTop = Go To Today Top
 *
 * @summary
 * Shared by every tour's Skip action (both the intro modal's and, once
 * a tour is under way, the coach card's): skipping should always land
 * back on a pristine Today, not wherever a mid-tour tab-switch or
 * scroll happened to leave things. Exported so onboarding.jsx's intro-
 * modal Skip (which fires before any GuidedTour is even mounted) can
 * reuse the exact same behavior.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/

const goToTodayTop = ( active, selectTab ) => { // What: Go To Today Top. Why: Every tour ending (Skip, Done, or the not-found watchdog) needs to land the user back on a pristine, top-scrolled Today. How: This switches to Today if needed, then scrolls both the app's own scroller and the window to 0.


	if ( active !== 'today' ) selectTab( 'today' ); // What: Today Switch Guard. Why: A tour can end from any tab, but the landing spot is always Today. How: This only calls selectTab when the active tab is not already Today.

	requestAnimationFrame( () => { // What: Scroll Reset Frame. Why: The tab switch above may not have committed its own layout yet on this same tick. How: This waits one animation frame before scrolling both the app's own scroller and the window.


		const mainEle = document.querySelector( '.main' ); // What: Main Element. Why: The app's own scrollable content lives inside this container, separate from the window itself. How: This looks it up fresh, since it may not exist on every layout.

		if ( mainEle ) mainEle.scrollTop = 0; // What: Main Scroll Reset. Why: The app's own scroller needs resetting independently of the window. How: This zeroes mainEle's own scrollTop when it exists.

		window.scrollTo( 0, 0 ); // What: Window Scroll Reset. Why: On layouts where the page itself (not .main) scrolls, that needs resetting too. How: This scrolls the window to the very top-left.


	} );


};



// #region GuidedTour

/**
 * GuidedTour = Guided Tour
 *
 * @summary
 * Renders the currently-running guided tour: a full-viewport dim with
 * a single spotlight cutout around the current step's target(s), plus
 * a coach card (title, body, Skip/Back/Next) positioned relative to
 * it. Owns every mechanic described in this file's own header comment
 * above (spotlight tracking, the click-guard, the not-found watchdog,
 * tab-sync, the mobile rail auto-open, resume-on-reload persistence);
 * a specific tour's own content lives entirely in its `steps` prop,
 * authored by a caller such as onboarding.jsx or one of the
 * onboarding-*-tours.jsx mini-tour modules.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.tourId     - Tour Id: This tour's slot key in
 *                           state.onboarding.activeTour, e.g. 'welcome'.
 * @param props.steps      - Steps: The step array described in this file's own
 *                           header comment above.
 * @param props.resumeStep - Resume Step: Initial step index; the caller
 *                           decides whether/what to resume.
 * @param props.actions    - Actions: The shared app actions object.
 * @param props.active     - Active: The app's own currently active tab id.
 * @param props.selectTab  - Select Tab: Switches the app's own active tab.
 * @param props.onGoBack   - On Go Back: Optional (targetStepIndex) => void,
 *                           side effects to run before navigating back to a
 *                           given step.
 * @param props.onFinish   - On Finish: Called on genuine completion only (the
 *                           primary button on a 'Done' step).
 * @param props.onSkip     - On Skip: Called for everything else the tour can
 *                           end from; optional, falls back to onFinish when
 *                           omitted.
 *
 * @returns The tour's own dim/spotlight/coach overlay, portaled onto
 * document.body.
 *
 * @example
 * ```tsx
 * GuidedTour({ tourId, steps, resumeStep, actions, active, selectTab, ... })
 * // => <GuidedTour />
 * ```
 *
*/

function GuidedTour ( { tourId, steps, resumeStep, actions, active, selectTab, onGoBack, onFinish, onSkip } ) {


	const { dragging } = useEmlTouFun(); // What: Dragging. Why: Published by tab-today.jsx's group/item drag handlers for the duration of a reorder gesture, since the coach card can sit right over whatever is being dragged. How: This reads the shared bus's own dragging field; only the coach hides while it is true, the spotlight/dim stay so the highlighted target is still visible to drop onto.

	const [ curSteNum, setCurSteNum ] = React.useState( resumeStep || 0 ); // What: Current Step Number And Setter. Why: This is the tour's own live position in `steps`. How: This starts at resumeStep (or 0), then only setCurSteNum ever advances/rewinds it.

	const [ recObj, setRecObj ] = React.useState( null ); // What: Rect Object And Setter. Why: The render function needs the current step's own clamped highlight rect to position the spotlight and coach. How: This starts null (nothing to show yet) and is written by the position-tracking effect below.

	const [ resTopNum, setResTopNum ] = React.useState( 0 ); // What: Reserve Top Number And Setter. Why: Extra top-space (px) reserved above the Today list when the current step's highlight is too tall for the coach to fit above or below it. How: This is published on the bus (see the effect below) so TabToday can push its list content down by this amount instead of the coach card overlaying part of what is highlighted; driven by rect/viewport math, not any specific step, so any future tour step with a too-tall highlight gets this automatically.

	const hadRecRef  = React.useRef( false ); // What: Had Rect Reference. Why: This suppresses the spot's own slide-in animation on its first paint. How: This starts false and is flipped true the first time the render function actually draws a spot.
	const spoEleRef  = React.useRef( null );  // What: Spotlight Element Reference. Why: The spotlight is positioned imperatively every frame (no React lag) rather than through React state alone. How: This is attached to the rendered .ob-spot div below.
	const meaCoaRef  = React.useRef( null );  // What: Measure Coach Reference. Why: A hidden, off-screen coach clone needs a handle so its real rendered height can be measured. How: This is attached to the hidden measurer JSX below.
	const reaCoaRef  = React.useRef( null );  // What: Real Coach Reference. Why: The real, visible coach is also positioned imperatively every frame, same as the spotlight. How: This is attached to the rendered .ob-coach div below and written to by plcTarFun.

	const [ coaHeiNum, setCoaHeiNum ] = React.useState( COA_HEI_NUM ); // What: Coach Height Number And Setter. Why: COA_HEI_NUM is only a rough estimate; a step with longer body text renders taller than it, and using the stale estimate for the "place above" branch made a long step's coach overlap the top of its own target instead of sitting flush above it. How: This starts at the rough estimate and is corrected once the real coach has been measured by the layout effect below.

	const coaHeiRef = React.useRef( coaHeiNum ); // What: Coach Height Reference. Why: The position-tracking effect below reads this ref rather than coaHeiNum directly, since that effect's own deps are [curSteNum, curSteObj.sel]: whenever React re-renders without those changing (exactly what happens right after the layout effect below corrects coaHeiNum for a step whose coach differs in height from the one before it), React reuses that effect's ORIGINAL closure rather than the fresher one, permanently freezing whatever coaHeiNum was still stale at that render. How: This is written to on every render, so decResFun always reads the latest measured height regardless of which closure is still live; most visible navigating Back into a step whose coach is taller than the one it is coming from.

	coaHeiRef.current = coaHeiNum; // What: Coach Height Reference Sync. Why: This must happen on every render, not just inside an effect, so the very next synchronous read (even before any effect runs) already sees the latest value. How: This assigns coaHeiNum straight into coaHeiRef.current.

	React.useLayoutEffect( () => { // What: Coach Measure Effect. Why: The hidden measurer's real rendered height is only known after paint, and only needs feeding back into state when it actually changed. How: This runs after every render (no deps) but only calls setCoaHeiNum when the measured height differs, so it settles instead of looping.


		const meaHeiNum = meaCoaRef.current && meaCoaRef.current.offsetHeight; // What: Measured Height Number. Why: The hidden clone's own offsetHeight is the real, current height for whatever step is now showing. How: This reads meaCoaRef.current's own offsetHeight, or a falsy value when the ref is not yet attached.

		if ( meaHeiNum && meaHeiNum !== coaHeiNum ) setCoaHeiNum( meaHeiNum ); // What: Coach Height Commit. Why: Only a genuine change should trigger another render. How: This calls setCoaHeiNum only when meaHeiNum is truthy and differs from the current coaHeiNum.


	} );

	React.useEffect( () => { // What: Bus Phase Effect. Why: Other tabs read bus.phase === 'tour' to know a guided tour of SOME kind is active, without caring which one (e.g. tab-today.jsx's own empty-state gating, app.jsx's rail sync). How: This is published for the duration this component is mounted and cleared back to 'off' on unmount, however that happens.


		emlTouObj.set( { phase: 'tour' } ); // What: Phase Publish. Why: Every other module gating on "is any tour running" needs this flipped on the instant this component mounts. How: This writes phase: 'tour' onto the shared bus.

		return () => { emlTouObj.set( { phase: 'off', reserveTop: 0 } ); }; // What: Phase Cleanup Return. Why: resTopNum is republished continuously while mounted (see the effect below), but nothing else clears it on unmount, so the last step's value would otherwise linger on the bus forever, permanently padding Today's list even after the tour is long over. How: This resets both phase and reserveTop back to their off/idle values.


	}, [] ); // What: Effect Dependency Array. Why: This mount/unmount publish should only ever run once for this component's own lifetime. How: An empty array means there is no dependency that could ever change to trigger a re-run.

	React.useEffect( () => { emlTouObj.set( { step: curSteNum } ); }, [ curSteNum ] ); // What: Step Publish Effect. Why: Other modules read bus.step to gate behavior on a specific step index (e.g. onboarding-app-features.jsx). How: This republishes the literal step field whenever curSteNum changes. // What: Effect Dependency Array. Why: This must re-run whenever curSteNum itself changes. How: curSteNum is the exact value being published.

	React.useEffect( () => { emlTouObj.set( { tourId } ); }, [ tourId ] ); // What: Tour Identifier Publish Effect. Why: This lets a consumer that needs to act only during a SPECIFIC tour's specific step (not just "some tour is up") tell them apart, e.g. tab-picker.jsx disabling its own "Add New Picker" button only during the Pickers page tour's own Step 4, not any other tour that happens to pass through the same step index. How: This is never cleared on unmount (like `step` itself is not), since every consumer already gates on phase === 'tour' too, which IS cleared, so a stale tourId left over from the last tour can never be read as still current. // What: Effect Dependency Array. Why: This must re-run whenever the tourId prop itself changes. How: tourId is the exact value being published.

	React.useEffect( () => { // What: Resume Persist Effect. Why: A reload should be able to resume this tour from wherever it left off; the caller is responsible for reading state.onboarding.activeTour back out as resumeStep on mount, and for only ever mounting one GuidedTour at a time. How: This only actually persists a step marked resumable (default true, see that field's own doc comment above), so a reload always resumes at the latest SAFE step rather than a step whose target only exists because of an earlier, un-persisted side effect.


		if ( steps[ curSteNum ] && steps[ curSteNum ].resumable === false ) return; // What: Non-Resumable Guard. Why: Landing on a non-resumable step, forward or back, must leave the last persisted checkpoint alone. How: This bails out before writing anything whenever the current step explicitly opts out.

		actions.setOnboarding( { activeTour: { id: tourId, step: curSteNum } } ); // What: Checkpoint Write. Why: This is the actual persisted resume checkpoint a future mount reads back as resumeStep. How: This writes the tour's own id alongside the literal step field, both required by the shared activeTour shape.


	}, [ curSteNum ] ); // What: Effect Dependency Array. Why: A new checkpoint only needs writing when the step index itself has actually moved. How: curSteNum is the value gating whether this step should be persisted at all.

	const finTouFun = React.useCallback( () => { // What: Finish Tour Function. Why: This is genuine completion only, the primary button on a step whose `primary` is 'Done'. How: This clears activeTour, calls the caller's own onFinish, then lands back on a pristine, scrolled-to-top Today the same way skpTouFun below does, so a caller's last step does not need to remember to also be scrollToTop just to stick the landing.


		actions.setOnboarding( { activeTour: null } ); // What: Active Tour Clear. Why: A finished tour must not still look resumable to a future mount. How: This overwrites the persisted checkpoint with null.

		onFinish(); // What: Finish Callback. Why: The caller needs its own completion hook to fire before this component tears itself down. How: This calls the onFinish prop with no arguments.

		goToTodayTop( active, selectTab ); // What: Today Landing. Why: A finished tour should always end on a pristine Today, regardless of which tab/scroll position its last step left things in. How: This calls the shared goToTodayTop helper with the current active tab and selectTab.


	}, [ onFinish, active, selectTab ] ); // What: Effect Dependency Array. Why: This callback must re-close over a fresh onFinish whenever the prop itself changes, and over fresh active/selectTab so the landing logic always targets the current tab state. How: onFinish is the completion hook being called, active is read to decide whether a tab switch is needed, and selectTab is the function that performs it.

	const skpTouFun = () => { // What: Skip Tour Function. Why: Everything that is NOT genuine completion (the Skip button, but also the not-found watchdog and a resumed/advanced step index past the end of `steps`) funnels through here instead of onFinish, since none of these mean the tour's content was actually finished. How: This clears activeTour, calls the caller's own onSkip (or onFinish when onSkip was omitted), then lands back on a pristine Today.


		actions.setOnboarding( { activeTour: null } ); // What: Active Tour Clear. Why: A skipped tour must not still look resumable to a future mount. How: This overwrites the persisted checkpoint with null.

		supGuaRef.current = true; // What: Guard Suppression. Why: A caller's own onSkip can drive real synthetic clicks to undo in-progress state (e.g. clicking Edit Mode's real Cancel button), and curSteRef.current still points at the step being left, so without this the guard would read that click as off-target and block it via preventDefault/stopPropagation before the target's own handler ever runs, the same reasoning as bacSteFun's own onGoBack call below. How: This flips supGuaRef.current on before calling onSkip/onFinish.

		( onSkip || onFinish )(); // What: Skip Or Finish Callback. Why: onSkip is optional; a caller that does not need the distinction (e.g. the Welcome Tour, which is not tracked in a per-tour checklist) can omit it and everything still funnels through onFinish. How: This calls whichever of the two is actually present.

		supGuaRef.current = false; // What: Guard Suppression Release. Why: The suppression above must only cover onSkip/onFinish's own synthetic clicks, not any real click the user makes afterward. How: This flips supGuaRef.current back off immediately after the call above returns.

		goToTodayTop( active, selectTab ); // What: Today Landing. Why: A skipped tour should always end on a pristine Today too, same as a finished one. How: This calls the shared goToTodayTop helper with the current active tab and selectTab.


	};

	React.useEffect( () => { // What: Touring Body Class Effect. Why: While a tour runs, the scrollable content needs padding so bottom-anchored targets can scroll clear of the floating tab bar. How: This adds a body class on mount and removes it on unmount.


		document.body.classList.add( 'ob-touring' ); // What: Touring Class Add. Why: The app's own stylesheet reads this class to add the bottom padding described above. How: This adds 'ob-touring' to document.body.

		return () => document.body.classList.remove( 'ob-touring' ); // What: Touring Class Cleanup Return. Why: The padding must not linger once the tour is over, however it ends. How: This returns a cleanup that removes the same class.


	}, [] ); // What: Effect Dependency Array. Why: This class should only ever be added once for this component's own mounted lifetime. How: An empty array means there is no dependency that could ever change to trigger a re-run.

	const curSteObj = steps[ curSteNum ] || null; // What: Current Step Object. Why: A resumed step index that no longer exists (e.g. a stale activeTour left over from before this tour's step count changed) must read as undefined rather than throw, and the position-tracking effect below bails out to skpTouFun the moment it sees a falsy value here. How: This reads steps at curSteNum, falling back to null.

	React.useEffect( () => { // What: Tab Sync Effect. Why: Whichever tab a step's target lives on is load-bearing for a resume (there is no previous step to have navigated there) and, since steps never call selectTab themselves, this is the ONLY thing that switches tabs at all, forward, back, or resuming alike.


		if ( curSteObj && curSteObj.tab && active !== curSteObj.tab ) selectTab( curSteObj.tab ); // What: Tab Switch. Why: The step's own target may live on a different tab than whatever is currently active. How: This only calls selectTab when the current step names a tab and it does not already match.


	}, [ curSteNum ] ); // What: Effect Dependency Array. Why: This should re-check whenever the step index moves, since a different step can name a different tab. How: curSteNum is what curSteObj itself is derived from.

	React.useEffect( () => { // What: Rail Open Publish Effect. Why: On tabPlacement 'side', the rail collapses to an off-canvas drawer on small screens (App owns the actual open/close state via its own subscription to this same field), and a step targeting a nav button would otherwise never find it there.


		emlTouObj.set( { wantRailOpen: !!( curSteObj && curSteObj.sel.includes( '[data-tab=' ) ) } ); // What: Rail Open Publish. Why: This is published unconditionally, not just when opening, so it also closes the drawer again once the tour moves to a step that does not need it, rather than leaving it open to cover a content target. How: This is a no-op at desktop widths, where the rail is never collapsed to begin with, and is keyed off the selector string itself (not resolved elements), since resolving would need the rail already open, which is exactly what this is for.


	}, [ curSteNum ] ); // What: Effect Dependency Array. Why: This should republish whenever the step index moves, since a different step's own selector decides the answer. How: curSteNum is what curSteObj itself is derived from.

	const finTarFun = ( selStr ) => { // What: Find Targets Function. Why: Every element a step's selector matches needs resolving, honoring selector ORDER (comma-separated fallbacks), so a step can spotlight more than one element (e.g. "the whole list") as a single combined highlight. How: This filters out zero-rect (CSS display:none) elements before checking emptiness, since some responsive pairs (e.g. the sidebar vs. footer Edit Mode button) both exist in the DOM at every width, only swapping which one is display:none via a container query, unlike .ob-generate/.gen-confirm's conditional-render swap; without this, the first alternative in a fallback list would always win even when it is the hidden one.


		for ( const oneSelStr of selStr.split( ',' ) ) { // What: Selector Alternative Loop. Why: Each comma-separated alternative must be tried in order until one actually matches something visible. How: This walks selStr's own alternatives left to right.


			const eleArr = [ ...document.querySelectorAll( oneSelStr.trim() ) ] // What: Element Array. Why: Every element matching this one alternative needs collecting before it can be filtered down to visible ones. How: This spreads the live NodeList from querySelectorAll into a plain array.
				.filter( ( curEle ) => { const curRecObj = curEle.getBoundingClientRect(); return curRecObj.width > 0 || curRecObj.height > 0; } ); // What: Visibility Filter. Why: A matched element that is display:none or otherwise zero-sized should never count as a real, clickable target. How: This keeps only elements whose own bounding rect has a real width or height.

			if ( eleArr.length ) return eleArr; // What: First Match Return. Why: An earlier alternative that actually matched something wins over a later one. How: This returns as soon as this alternative's own filtered array is non-empty.


		}


		return []; // What: No Match Return. Why: The caller always needs an array back, even when nothing matched at all. How: This returns an empty array once every alternative has been tried.


	};

	const cliHorFun = ( recObj, tarEle ) => { // What: Clip Horizontal Overflow Function. Why: Clamps a rect's left/right against every ancestor that horizontally clips its own overflow (overflow-x auto/scroll/hidden, e.g. the Pickers page's Group/Show rows), since an element scrolled past the edge of one of these still has a real, full-width getBoundingClientRect() even though none of it is actually visible there. How: Without this, a step whose selector matches several items in the SAME scrollable row (e.g. "every picker tab") would union in whichever ones happen to be scrolled out of view, stretching the highlight into the empty space past the row's own clipped edge; deliberately horizontal-only, since briTarFun's own scroll-to-target already settles the VERTICAL case before this ever runs steady-state, and clipping vertically too would fight that during the brief transient scroll itself. Returns null once the element ends up fully clipped away.


		let topNum = recObj.top, lefNum = recObj.left, rigNum = recObj.right, botNum = recObj.bottom; // What: Working Rect Numbers. Why: These copy top/left/right/bottom out into plain numbers up front rather than spreading recObj itself (a DOMRect), since DOMRect's fields are getters on its prototype, not its own enumerable properties, so a spread would silently drop every field this function does not explicitly set, poisoning every later Math.min/max call downstream with NaN. How: This starts as a plain copy of recObj's own top/left/right/bottom.

		const ownOvfStr = getComputedStyle( tarEle ).overflowX; // What: Own Overflow String. Why: A step whose selector matches the scrollable row ITSELF as one element (e.g. the Stats tour's Range row) rather than several children inside it needs its own overflow-x checked too, since only inspecting ancestors below would miss that case. How: This reads tarEle's own computed overflow-x style.

		if ( ( ownOvfStr === 'auto' || ownOvfStr === 'scroll' || ownOvfStr === 'hidden' ) && tarEle.clientWidth < ( rigNum - lefNum ) - 2 ) { // What: Self Overflow Guard. Why: clientWidth reflects what is actually rendered/visible regardless of a too-wide getBoundingClientRect() (seen on some engine/layout combinations even with min-width:0 set); only clamps if it is meaningfully narrower than the raw rect, so a normal thin border does not shave a couple pixels off every ordinary highlight. How: This checks ownOvfStr against the 3 CSS values that actually clip content, plus a 2px tolerance against float rounding.


			rigNum = lefNum + tarEle.clientWidth; // What: Right Clamp. Why: The right edge must stop at what is actually visible, not the full scrollable content width. How: This rebuilds rigNum from lefNum plus tarEle's own clientWidth.


		}

		let ancEle = tarEle.parentElement; // What: Ancestor Element And Walker. Why: A target nested inside a DIFFERENT scrollable ancestor also needs clipping against that ancestor's own visible bounds. How: This starts at tarEle's own parent and is reassigned by the loop below.

		while ( ancEle && ancEle !== document.body ) { // What: Ancestor Walk Loop. Why: Every scrollable ancestor between tarEle and the document body can further clip the working rect. How: This walks upward one parentElement at a time until it reaches document.body or runs out of ancestors.


			const ancOvfStr = getComputedStyle( ancEle ).overflowX; // What: Ancestor Overflow String. Why: Only a genuinely scrollable ancestor should clip anything. How: This reads ancEle's own computed overflow-x style.

			if ( ancOvfStr === 'auto' || ancOvfStr === 'scroll' || ancOvfStr === 'hidden' ) { // What: Ancestor Overflow Guard. Why: A non-scrolling ancestor (the common case) has nothing to clip against. How: This checks ancOvfStr against the 3 CSS values that actually clip content.


				const ancRecObj = ancEle.getBoundingClientRect(); // What: Ancestor Rect Object. Why: The clamp below needs the ancestor's own real on-screen bounds. How: This reads ancEle's own bounding rect.

				lefNum = Math.max( lefNum, ancRecObj.left ); rigNum = Math.min( rigNum, ancRecObj.right ); // What: Horizontal Clamp. Why: The working rect must never extend past this ancestor's own visible left/right edges. How: This narrows lefNum/rigNum to whichever is tighter between the working rect and ancRecObj.

				if ( rigNum <= lefNum ) return null; // What: Fully Clipped Guard. Why: An element scrolled entirely out of this ancestor's visible bounds is not a real, clickable target at all. How: This returns null once the clamped width collapses to zero or less.


			}

			ancEle = ancEle.parentElement; // What: Ancestor Advance. Why: The walk must keep climbing toward the document body. How: This reassigns ancEle to its own parentElement for the next loop iteration.


		}


		return { top: topNum, left: lefNum, right: rigNum, bottom: botNum }; // What: Clipped Rect Return. Why: The caller needs the final, fully-clamped rect back. How: This builds the { top, left, right, bottom } shape every other rect helper below expects.


	};

	const uniRecFun = ( eleArr ) => { // What: Union Rect Function. Why: This is the bounding box that encloses every matched element. How: Each element's own rect is first passed through cliHorFun so a scrolled-away portion of any one of them never stretches the union into empty space.


		let topNum = Infinity, lefNum = Infinity, rigNum = -Infinity, botNum = -Infinity; // What: Union Accumulator Numbers. Why: The union must start from values any real rect will immediately beat. How: This starts at the widest-possible-miss values before the loop below narrows them.

		eleArr.forEach( ( curEle ) => { // What: Element Union Loop. Why: Every matched element contributes to the overall union. How: This walks eleArr, folding each element's own clipped rect into the accumulator numbers above.


			const cliRecObj = cliHorFun( curEle.getBoundingClientRect(), curEle ); // What: Clipped Rect Object. Why: A scrolled-away portion of this element must not stretch the union. How: This runs curEle's own bounding rect through cliHorFun.

			if ( !cliRecObj ) return; // What: Fully Clipped Guard. Why: An element clipped away entirely contributes nothing to the union. How: This skips the rest of this iteration when cliHorFun returned null.


			topNum = Math.min( topNum, cliRecObj.top ); lefNum = Math.min( lefNum, cliRecObj.left ); // What: Top/Left Fold. Why: The union's own top-left corner is whichever edge is furthest out among every element seen so far. How: This narrows topNum/lefNum to the smaller of the running value and this element's own edge.
			rigNum = Math.max( rigNum, cliRecObj.right ); botNum = Math.max( botNum, cliRecObj.bottom ); // What: Right/Bottom Fold. Why: The union's own bottom-right corner is whichever edge is furthest out among every element seen so far. How: This widens rigNum/botNum to the larger of the running value and this element's own edge.


		} );


		return { top: topNum, left: lefNum, right: rigNum, bottom: botNum, width: rigNum - lefNum, height: botNum - topNum }; // What: Union Rect Return. Why: The caller needs the final unioned rect back, including its own derived width/height. How: This builds the shape every other rect helper below expects.


	};

	const curSteRef = React.useRef( curSteObj ); // What: Current Step Reference. Why: Blocking every click during a tour except the coach card and the current step's own highlighted target(s) needs a listener that only needs to exist for as long as this component is mounted, without re-attaching per step. How: This is read fresh on every click rather than closed over stale, since curSteObj is re-evaluated fresh on every render.

	curSteRef.current = curSteObj; // What: Current Step Reference Sync. Why: The click-guard effect below reads this ref on every real click, so it must always reflect the LATEST render's curSteObj, not a stale closure. How: This assigns curSteObj into curSteRef.current on every render.

	const steNumRef = React.useRef( curSteNum ); // What: Step Number Reference. Why: This mirrors curSteRef, but for the raw step NUMBER rather than the step object, used by priActFun's own advanceWhen poll below, which needs to notice a step change made for some OTHER reason (Back, Skip) while it was still waiting. How: curSteObj itself is not reliable for that same check, since steps are rebuilt as fresh objects on every render, so curSteRef.current would read as "changed" on the very next unrelated re-render even when the step index never actually moved.

	steNumRef.current = curSteNum; // What: Step Number Reference Sync. Why: This must always reflect the LATEST render's curSteNum. How: This assigns curSteNum into steNumRef.current on every render.

	const mouStaRef = React.useRef( true ); // What: Mounted State Reference. Why: This lets the advanceWhen poll (and anything else scheduling a callback beyond this render's own lifetime) notice this component has actually unmounted and stop, rather than firing a state update into the void. How: This starts true and is flipped false by the unmount effect right below.

	React.useEffect( () => () => { mouStaRef.current = false; }, [] ); // What: Mounted State Cleanup Effect. Why: The flip must happen exactly once, on this component's own real unmount. How: This returns a cleanup closure with no dependency that could ever re-run it early.

	const priActRef = React.useRef( () => {} ); // What: Primary Action Reference. Why: Same lazy-ref pattern as curSteRef: priActFun below closes over curSteNum/curSteObj/finTouFun, all of which change every render, but the click-guard effect below is only ever set up once. How: This starts as a no-op and is overwritten with the latest priActFun at the end of every render.

	const supGuaRef = React.useRef( false ); // What: Suppress Guard Reference. Why: This lets bacSteFun's/skpTouFun's own side effects click through the guard below, e.g. a picker mini-tour's onGoBack simulating a click on the create-form's own "Details" step tab to undo a later step's "Add Items" click. How: That synthetic click is not the step's own target (curSteRef still points at the step being left, since onGoBack runs before the step index actually changes), so without this the guard would block onGoBack from doing anything at all; the exact clicks meant to fix the page up before navigating back are the ones most likely to look like "not the current target" to it.

	const isaPasFun = ( eveObj ) => { // What: Is-A Pass-Through Function. Why: A step's optional clickPassThroughSel names element(s) that should reach their OWN real click handler normally, unlike clickSel (which ALSO satisfies requireClick and advances the tour): a pass-through click does neither, it is neither blocked nor treated as "the" action. How: This checks whether eveObj's own target sits inside any element matched by the current step's own clickPassThroughSel; built for App Features' own manual-pick tour, where Re-roll needs to stay genuinely usable (a real re-roll, its own animation) without also counting as the step's advancing click the way clicking Send to Today does.


		const liveSteObj = curSteRef.current; // What: Live Step Object. Why: The freshest step object must be read off the ref, not a stale render closure. How: This reads curSteRef.current directly.

		return !!( liveSteObj && liveSteObj.clickPassThroughSel && finTarFun( liveSteObj.clickPassThroughSel ).some( ( curEle ) => curEle.contains( eveObj.target ) ) ); // What: Pass-Through Check Return. Why: The caller needs a plain boolean answer. How: This checks that a live step exists, that it names a clickPassThroughSel, and that one of its matched elements contains the event's own target.


	};

	const isaOffFun = ( eveObj ) => { // What: Is-Off-Target Function. Why: This is the off-target check shared by both the mousedown and click capture listeners below. How: This exempts the suppressed state, a click inside the coach card itself, and a pass-through click, then checks the current step's own clickSel (or sel) for everything else.


		if ( supGuaRef.current ) return false; // What: Suppression Guard. Why: A caller-driven synthetic click must never itself be read as off-target. How: This returns false immediately whenever supGuaRef.current is true.

		if ( eveObj.target.closest( '.ob-coach' ) ) return false; // What: Coach Exemption Guard. Why: A click anywhere inside the coach card (Skip/Back/Next, or just its own body text) is always legitimate. How: This returns false whenever the event's own target has a .ob-coach ancestor.

		if ( isaPasFun( eveObj ) ) return false; // What: Pass-Through Exemption Guard. Why: A pass-through click is neither blocked nor treated as the step's own action. How: This defers to isaPasFun's own check.

		const liveSteObj = curSteRef.current; // What: Live Step Object. Why: The freshest step object must be read off the ref, not a stale render closure. How: This reads curSteRef.current directly.

		return !( liveSteObj && finTarFun( liveSteObj.clickSel || liveSteObj.sel ).some( ( curEle ) => curEle.contains( eveObj.target ) ) ); // What: Off-Target Check Return. Why: The caller needs a plain boolean answer. How: This is true whenever there is no live step, or the event's own target does not sit inside any element the step's own clickSel/sel currently matches.


	};

	React.useEffect( () => { // What: Click Guard Setup Effect. Why: Every click during a tour must be blocked except the coach card and the current step's own highlighted target(s), otherwise the user could click straight through the dim to whatever is actually underneath (delete a picker, jump to an unrelated tab, etc.) and desync the tour from the real app state. How: This attaches 3 capture-phase document listeners once for this component's own mounted lifetime and tears them down on unmount.


		const dwnGuaFun = ( eveObj ) => { // What: Mousedown Guard Function. Why: A focused real input (e.g. a step's own rename field) blurs the instant *mousedown* fires on whatever it lands on, the browser's own default focus-transfer running before the 'click' event below ever gets a chance to block anything, and that is not tied to whether the click goes on to do anything at all, it fires just from clicking a focusable element. How: preventDefault on mousedown itself is what suppresses the browser's own default focus transfer (a well-worn trick for toolbar buttons that should not steal focus from a text field), stopped here for exactly the same off-target elements the click guard blocks, so an in-progress edit stays focused and open until the user genuinely interacts with this step's own target; that blur can otherwise cascade into real app state changes (e.g. GroupHeader committing a rename on blur) the click-guard alone was never in a position to stop, and the step's own target can vanish from the DOM as a result, which reads as the tour randomly dying a moment after a click that "did nothing" visible.


			if ( !isaOffFun( eveObj ) ) return; // What: On-Target Guard. Why: A click landing on the legitimate target/coach must never be interfered with. How: This bails out whenever isaOffFun reports false.

			eveObj.preventDefault(); // What: Default Prevention. Why: This is what actually stops the browser's own focus transfer. How: This calls preventDefault on the mousedown event.
			eveObj.stopPropagation(); // What: Propagation Stop. Why: The click that would otherwise follow this mousedown must also be kept from reaching whatever it landed on. How: This calls stopPropagation on the mousedown event.


		};

		const clkGuaFun = ( eveObj ) => { // What: Click Guard Function. Why: This is the real click-guard: it lets advanceOn/clickSel/requireClick clicks through to trigger the tour's own advance, lets a pass-through click through untouched, and blocks everything else.


			if ( supGuaRef.current ) return; // What: Suppression Guard. Why: A caller-driven synthetic click must never be intercepted by this guard at all. How: This returns immediately whenever supGuaRef.current is true.

			const liveSteObj = curSteRef.current; // What: Live Step Object. Why: The freshest step object must be read off the ref, not a stale render closure. How: This reads curSteRef.current directly.

			if ( eveObj.target.closest( '.ob-coach' ) ) return; // What: Coach Exemption Guard. Why: A click anywhere inside the coach card is always legitimate and needs no further handling here. How: This returns whenever the event's own target has a .ob-coach ancestor.

			if ( liveSteObj && liveSteObj.advanceOn && finTarFun( liveSteObj.advanceOn ).some( ( curEle ) => curEle.contains( eveObj.target ) ) ) { // What: Advance-On Check. Why: See advanceOn's own doc comment in this file's own header above, an optional real-action shortcut, NOT a requireClick step (Next keeps working normally too): the real target's click just also counts as clicking Next.


				priActRef.current(); // What: Primary Action Trigger. Why: An advanceOn click must run the exact same onPrimary logic a real Next click would. How: This calls the latest priActFun via its own ref.

				return; // What: Advance-On Early Return. Why: Nothing else in this handler applies once advanceOn has already fired. How: This exits before the clickSel/requireClick branch below.


			}

			if ( liveSteObj && finTarFun( liveSteObj.clickSel || liveSteObj.sel ).some( ( curEle ) => curEle.contains( eveObj.target ) ) ) { // What: Target Click Check. Why: A requireClick step's target click IS its primary action, since the Next button is disabled, so this is the only way forward.


				if ( liveSteObj.requireClick ) priActRef.current(); // What: Require-Click Trigger. Why: Only a requireClick step treats its own target click as the advancing action. How: This calls the latest priActFun only when the live step actually requires it.

				return; // What: Target Click Early Return. Why: A non-requireClick step's own target click needs no further handling here, it is real UI reacting to itself. How: This exits before the pass-through/block logic below.


			}

			if ( isaPasFun( eveObj ) ) return; // What: Pass-Through Exemption Guard. Why: See isaPasFun's own comment above, this reaches its real handler untouched, neither blocked nor treated as this step's own click. How: This returns whenever isaPasFun reports true.

			eveObj.preventDefault(); // What: Default Prevention. Why: An off-target click must never be allowed to do whatever it would normally do underneath the dim. How: This calls preventDefault on the click event.
			eveObj.stopPropagation(); // What: Propagation Stop. Why: The click must also be kept from bubbling to any other listener on the page. How: This calls stopPropagation on the click event.


		};

		const focGuaFun = ( eveObj ) => { // What: Focusout Guard Function. Why: The mousedown guard above only covers focus loss caused by something ELSE on the page stealing it; it cannot do anything about the target itself losing focus for a reason with no in-page click behind it at all, e.g. the browser window/tab losing OS-level focus (alt-tabbing away, or a mobile browser backgrounding and dismissing its own keyboard). How: That still fires a real 'focusout' on the target (unlike 'blur' on window, which does not reach the element), and unlike mousedown's default-focus-transfer, blur/focusout is not cancelable, so preventDefault does nothing here; what DOES work is that React's onBlur is itself just a delegated listener for the native 'focusout' bubbling up to the root container, so stopping propagation on it up here, in capture phase at the document (above where it would ever reach that root listener), keeps React from ever calling the target's own onBlur at all, e.g. GroupHeader's own commit(), which is what actually closes the rename input and makes the step's target vanish. Exempts a focus move INTO the coach (eveObj.relatedTarget), e.g. Tab-ing to the Next/Done button, since that is a legitimate, deliberate way to leave the target, same as a click on it already is via isaOffFun's own '.ob-coach' exemption.


			if ( supGuaRef.current ) return; // What: Suppression Guard. Why: A caller-driven synthetic focus change must never be intercepted here. How: This returns immediately whenever supGuaRef.current is true.

			const liveSteObj = curSteRef.current; // What: Live Step Object. Why: The freshest step object must be read off the ref, not a stale render closure. How: This reads curSteRef.current directly.

			if ( !liveSteObj ) return; // What: No Step Guard. Why: There is nothing to protect once there is no live step at all. How: This returns whenever liveSteObj is falsy.

			if ( eveObj.relatedTarget && eveObj.relatedTarget.closest( '.ob-coach' ) ) return; // What: Coach Move Exemption. Why: A focus move into the coach card is a legitimate, deliberate way to leave the target. How: This returns whenever the event's own relatedTarget has a .ob-coach ancestor.

			if ( !finTarFun( liveSteObj.clickSel || liveSteObj.sel ).some( ( curEle ) => curEle.contains( eveObj.target ) ) ) return; // What: On-Target Guard. Why: Only a focus loss FROM the current step's own target needs protecting. How: This returns whenever the event's own target does not sit inside any element the step's own clickSel/sel currently matches.

			eveObj.stopPropagation(); // What: Propagation Stop. Why: This is what actually keeps React's own delegated onBlur listener from ever seeing this event. How: This calls stopPropagation on the focusout event.


		};

		document.addEventListener( 'mousedown', dwnGuaFun, true ); // What: Mousedown Listener Add. Why: The guard needs to see every mousedown before the browser's own default focus-transfer runs. How: This adds dwnGuaFun in capture phase at the document.
		document.addEventListener( 'click', clkGuaFun, true );     // What: Click Listener Add. Why: The guard needs to see every click before it reaches whatever it landed on. How: This adds clkGuaFun in capture phase at the document.
		document.addEventListener( 'focusout', focGuaFun, true );  // What: Focusout Listener Add. Why: The guard needs to see every focus loss before React's own delegated onBlur listener does. How: This adds focGuaFun in capture phase at the document.

		return () => { // What: Listener Cleanup Return. Why: All 3 listeners must be torn down together once this component unmounts. How: This removes each of the 3 listeners added above, matching their own capture-phase flag.


			document.removeEventListener( 'mousedown', dwnGuaFun, true ); // What: Mousedown Listener Remove. Why: This specific listener must stop firing once this component unmounts. How: This removes dwnGuaFun in capture phase.
			document.removeEventListener( 'click', clkGuaFun, true );     // What: Click Listener Remove. Why: This specific listener must stop firing once this component unmounts. How: This removes clkGuaFun in capture phase.
			document.removeEventListener( 'focusout', focGuaFun, true );  // What: Focusout Listener Remove. Why: This specific listener must stop firing once this component unmounts. How: This removes focGuaFun in capture phase.


		};


	}, [] ); // What: Effect Dependency Array. Why: This listener setup should only ever run once for this component's own mounted lifetime; every closure inside reads live state via refs instead of depending on it directly. How: An empty array means there is no dependency that could ever change to trigger a re-run.

	const navSteFun = ( n ) => setCurSteNum( n ); // What: Navigate Step Function. Why: Every place that moves the tour to a specific step index should funnel through one named function rather than calling setCurSteNum directly. How: This just forwards n straight into setCurSteNum.

	const bacSteFun = () => { // What: Back Step Function. Why: Back reverses navigation so the previous target exists again. How: Any tour-specific side effects (undoing something a later step did) are the caller's job via onGoBack, called with the destination step before it actually changes, with the click-guard suppressed for its duration, see supGuaRef's own comment for why.


		const toStepNum = Math.max( 0, curSteNum - 1 ); // What: To Step Number. Why: Back can never go below the first step. How: This clamps curSteNum - 1 to a floor of 0.

		if ( onGoBack ) { // What: On-Go-Back Guard. Why: Not every caller supplies undo side effects. How: This only runs the suppressed onGoBack call when the prop is actually present.


			supGuaRef.current = true; // What: Guard Suppression. Why: onGoBack's own synthetic clicks must not be blocked by the guard below, see supGuaRef's own comment above. How: This flips supGuaRef.current on before calling onGoBack.
			onGoBack( toStepNum ); // What: On-Go-Back Callback. Why: The caller's own undo side effects must run before the step index actually changes. How: This calls onGoBack with the destination step number.
			supGuaRef.current = false; // What: Guard Suppression Release. Why: The suppression above must only cover onGoBack's own synthetic clicks. How: This flips supGuaRef.current back off immediately after the call above returns.


		}

		navSteFun( toStepNum ); // What: Step Navigation. Why: The actual step change must happen after onGoBack's own side effects have already run. How: This calls navSteFun with the computed destination step number.


	};

	const priActFun = () => { // What: Primary Action Function. Why: The primary button's side effect (if any) runs first, then either finishes the tour ('Done') or advances to the next step; step authors never call navSteFun/selectTab themselves, keeping run() a pure side effect and navigation fully generic. How: For a requireClick step, this fires from the click-guard's CAPTURE-phase handling of the real target's click, the same event as the target's own native (bubble-phase) handler, which has not run yet; run() has to stay synchronous here (some steps' own prefill staging depends on landing before that native handler reads it), but advancing/finishing must NOT, since a 'Done' step's finTouFun calls selectTab away and unmounts this tour, and doing that synchronously here can remove the target from the DOM before its own bubble-phase handler ever fires, observed concretely on the Picker tour's "Create Picker" step, where the real submit() got skipped entirely because finTouFun tore down the page mid-click; deferring the advance/finish by a tick lets the browser finish dispatching the native click (including the target's own handler) first, since a requireClick step's target is real UI the user just interacted with, so nothing in `steps` should be reading tour curSteNum synchronously off this same click.


		if ( curSteObj.run ) { // What: Run Side Effect Guard. Why: Not every step supplies a side effect. How: This only runs the suppressed curSteObj.run() call when the current step actually names one.


			supGuaRef.current = true; // What: Guard Suppression. Why: A run() that drives a real click on something outside the CURRENT step's own target (e.g. staging the NEXT step's target on a different part of the page) would otherwise get blocked by the same document-level guard that stops the USER clicking off-target, since curSteRef.current still points at this step (the index has not advanced yet), so a synthetic click landing anywhere else would read as off-target and get preventDefault/stopPropagation'd before its own handler ever runs. How: This flips supGuaRef.current on before calling curSteObj.run().
			curSteObj.run(); // What: Run Callback. Why: The step's own declared side effect must actually execute. How: This calls curSteObj.run() with no arguments.
			supGuaRef.current = false; // What: Guard Suppression Release. Why: The suppression above must only cover run()'s own synthetic clicks. How: This flips supGuaRef.current back off immediately after the call above returns.


		}

		const advSteFun = () => { if ( curSteObj.primary === 'Done' || curSteObj.solo ) finTouFun(); else navSteFun( curSteNum + 1 ); }; // What: Advance Step Function. Why: solo steps (see their own doc comment in this file's own header above) always finish on their one button regardless of its label, since a solo step is never actually followed by a real "next" step, so relying on primary === 'Done' (every other step's own signal) would send it past the end of the array on a step whose button reads something else, like "Dismiss". How: This calls finTouFun for a 'Done' or solo step, otherwise moves to the next step index.

		if ( curSteObj.requireClick && curSteObj.advanceWhen ) { // What: Advance-When Poll Guard. Why: The real click just kicked off something ASYNC whose result is the next step's own target, e.g. the Pickers tour's "Manual Generation" step, where clicking Pick One starts a multi-second spin animation and the Send to Today button (the next step's target) does not exist until it resolves. How: Advancing on the usual immediate timer would move the step index forward before that target exists, and the position-tracking effect's own "target not found yet" fallback would render a bare dim with no coach at all for however long that takes, reading as the tour blanking out mid-click; polling here instead means THIS step's own already-resolved coach and highlight just keep sitting there, unbothered, for the whole wait, and the jump to the next step only happens once its target is actually ready to be found immediately.


			const begSteNum = curSteNum; // What: Began Step Number. Why: The poll below checks the LIVE step number (via steNumRef, not this closure's own curSteNum) on each frame, so if the user goes Back/Skip in the meantime this can notice and bail out instead of firing a stale advance() later. How: This snapshots curSteNum at the moment the poll starts.

			const polTarFun = () => { // What: Poll Target Function. Why: Each frame needs to check whether the async work has produced its own next-step target yet, without ever running past this component's own unmount or a step change made for some other reason. How: This bails out via mouStaRef/steNumRef, otherwise checks finTarFun(curSteObj.advanceWhen) and either advances or schedules another frame.


				if ( !mouStaRef.current || steNumRef.current !== begSteNum ) return; // What: Staleness Guard. Why: This poll must stop the instant it becomes stale, whether from unmount or from the user having navigated away in the meantime. How: This returns whenever the component is no longer mounted or the live step number no longer matches begSteNum.

				if ( finTarFun( curSteObj.advanceWhen ).length ) advSteFun(); // What: Target Found Advance. Why: The async work's own result is now ready to become the tour's new spotlight. How: This advances once finTarFun actually matches something for the step's own advanceWhen selector.

				else requestAnimationFrame( polTarFun ); // What: Poll Reschedule. Why: The target is not ready yet. How: This schedules another check on the next animation frame.


			};

			requestAnimationFrame( polTarFun ); // What: Poll Start. Why: The very first check should also wait a frame, consistent with every later one. How: This schedules the first call to polTarFun.


		}

		else if ( curSteObj.requireClick && curSteObj.advanceDelay ) { // What: Advance-Delay Timer Guard. Why: The real click plays a self-contained confirmation animation with a fixed duration and no lasting DOM trace to poll for, e.g. the Pickers tour's own "Add to Todo List" step, where Send to Today swaps its label to "Sent!" for a beat then reverts on its own. How: advanceWhen above cannot express "wait for this ANIMATION", only "wait for a target to exist"; advancing on the usual immediate timer would cut that confirmation off before the user ever sees it.


			const begSteNum = curSteNum; // What: Began Step Number. Why: Same staleness guard as advanceWhen's own poll above, for the same reason (a Back/Skip during the wait should not fire a stale advance() once the timer finally elapses). How: This snapshots curSteNum at the moment the timer starts.

			setTimeout( () => { // What: Advance Delay Timer. Why: The confirmation animation's own fixed duration must actually elapse before advancing. How: This waits curSteObj.advanceDelay milliseconds, then checks staleness before calling advSteFun.


				if ( !mouStaRef.current || steNumRef.current !== begSteNum ) return; // What: Staleness Guard. Why: This timer must not fire a stale advance once the component has unmounted or the user has navigated away. How: This returns whenever the component is no longer mounted or the live step number no longer matches begSteNum.

				advSteFun(); // What: Delayed Advance. Why: The confirmation animation has now had its own full duration to play. How: This calls advSteFun.


			}, curSteObj.advanceDelay );


		}

		else if ( curSteObj.requireClick ) setTimeout( advSteFun, 0 ); // What: Deferred Advance. Why: See this function's own header comment above for why a requireClick step's advance must be deferred by a tick rather than run synchronously. How: This schedules advSteFun on the next tick via a 0ms timeout.

		else advSteFun(); // What: Immediate Advance. Why: A step that is neither polling nor delaying can advance right away. How: This calls advSteFun synchronously.


	};

	priActRef.current = priActFun; // What: Primary Action Reference Sync. Why: The click-guard effect above only ever reads priActRef.current, never priActFun directly, so this must stay current every render. How: This assigns the freshly-closed-over priActFun into priActRef.current.

	React.useEffect( () => { // What: Position Tracking Effect. Why: This follows the target every frame while a step is up: scrolling it into view once, clamping the spotlight/coach against chrome, deciding reserve space, and watchdog-skipping a step whose target never resolves.


		setRecObj( null ); // What: Rect Reset. Why: The previous step's own position must not paint under new text. How: This drops recObj back to null the instant the step changes.

		setResTopNum( 0 ); // What: Reserve Reset. Why: The previous step's own reserve need (computed below from fresh measurements) may well be different, and starting from zero avoids the new target's very first measurement already reflecting stale leftover padding. How: This drops resTopNum back to 0 the instant the step changes.

		hadRecRef.current = false; // What: Had Rect Reset. Why: The next appearance of a highlight should jump straight into place, with no slide-in. How: This flips hadRecRef.current back to false the instant the step changes.

		if ( !curSteObj ) { // What: No Step Guard. Why: See the clamp on curSteObj above; there is no valid step to track at all. How: This bails out cleanly rather than leave a permanent dim with nothing to click, calling skpTouFun (not finTouFun, see its own comment) since this is not a genuine completion.


			skpTouFun(); // What: Skip Call. Why: A missing step is never genuine completion. How: This calls skpTouFun directly.
			return; // What: Effect Early Return. Why: Nothing below this point has a valid step to work against. How: This exits before setting up the raf loop/scroll listener.


		}

		let rafNum, canBoo = false; // What: Raf Number And Cancelled Boolean. Why: rafNum holds the current requestAnimationFrame handle so the cleanup below can cancel it, and canBoo is the flag every scheduled callback checks before doing anything. How: Both start uninitialized/false and are only ever written inside this effect's own closures.

		let resDecBoo = false, resAmtNum = 0; // What: Reserve Decided Boolean And Reserve Amount Number. Why: Whether THIS step's target needs top-space reserved above it, and how much, is declared here (not down by decResFun's own definition, where it conceptually belongs) because briTarFun now needs to read/set them on its very first call, before decResFun's own code further down has even run. How: See decResFun's own comment for the full reasoning on what these track and why the decision only ever happens once per step.

		const getScrFun = ( tarEle ) => { // What: Get Scroller Function. Why: The ACTUAL scrolling ancestor of the target must be resolved, since on narrow/mobile layouts the scroller is not ".main" (the page/body scrolls instead), and a hardcoded ".main" would leave the target below the fold with the coach and spot off-screen, the dim-only "no highlight" state.


			let ancEle = tarEle && tarEle.parentElement; // What: Ancestor Element And Walker. Why: The walk needs to start from the target's own parent. How: This starts at tarEle's own parentElement, or undefined when tarEle itself is falsy.

			while ( ancEle && ancEle !== document.body ) { // What: Ancestor Walk Loop. Why: Every ancestor between the target and the document body is a candidate scroller. How: This walks upward one parentElement at a time until it reaches document.body or runs out of ancestors.


				const ancOvfYStr = getComputedStyle( ancEle ).overflowY; // What: Ancestor Overflow-Y String. Why: Only a genuinely vertically-scrollable ancestor counts as a real scroller. How: This reads ancEle's own computed overflow-y style.

				if ( ( ancOvfYStr === 'auto' || ancOvfYStr === 'scroll' ) && ancEle.scrollHeight > ancEle.clientHeight + 2 ) return ancEle; // What: Real Scroller Return. Why: An ancestor whose own content does not actually overflow is not a real scroller even if its CSS allows scrolling. How: This returns ancEle once both its overflow-y style and its actual scrollHeight/clientHeight gap qualify it.

				ancEle = ancEle.parentElement; // What: Ancestor Advance. Why: The walk must keep climbing toward the document body. How: This reassigns ancEle to its own parentElement for the next loop iteration.


			}


			return document.scrollingElement || document.documentElement; // What: Document Scroller Fallback Return. Why: No scrollable ancestor was found, so the page itself is what actually scrolls. How: This returns the document's own scrolling element, or documentElement as a last resort.


		};

		const scrAmtFun = ( scrEle, dltYNum ) => { // What: Scroll By Amount Function. Why: A step that jumps to a different part of the page, or, via briTarFun's own content-grew re-trigger and decResFun's own follow-up correction below, mid-step too, should read as the tour visibly navigating there rather than an unexplained cut. How: This is smooth unless prefers-reduced-motion, and is deliberately NOT applied to goToTodayTop (the tour-END reset on Skip/Done), which is a closing reset, not a "here's the next thing" step transition, and already fires alongside a tab switch back to Today, staying an instant cut by design.


			const optObj = { top: dltYNum, behavior: reduceMotion() ? 'auto' : 'smooth' }; // What: Scroll Options Object. Why: Both branches below need the same behavior choice. How: This builds one shared options object from dltYNum and the current reduced-motion preference.

			if ( scrEle === document.scrollingElement || scrEle === document.documentElement ) window.scrollBy( optObj ); // What: Window Scroll By. Why: The document's own scroller is addressed through window, not the element itself. How: This calls window.scrollBy when scrEle is the document's own scroller.

			else scrEle.scrollBy( optObj ); // What: Element Scroll By. Why: Any other scroller is addressed directly. How: This calls scrEle.scrollBy for every other case.


		};

		const briTarFun = () => { // What: Bring Target Function. Why: This brings the target(s) into view once when the step opens.


			if ( canBoo ) return; // What: Cancelled Guard. Why: This guards the recursive requestAnimationFrame(() => briTarFun()) call below (the reserve-space retry), which fires on its own timer, outside this effect's own raf loop, so the ordinary canBoo check further down never gets a chance to catch it if the step/tour has already moved on by the time it fires. How: This returns immediately whenever canBoo is already true.

			const eleArr = finTarFun( curSteObj.sel ); // What: Element Array. Why: Nothing below can run without knowing which elements the current step actually targets. How: This resolves curSteObj.sel via finTarFun.

			if ( !eleArr.length ) return; // What: No Targets Guard. Why: There is nothing to bring into view yet. How: This returns whenever finTarFun matched nothing.

			if ( curSteObj.revealHorizontally ) eleArr[ 0 ].scrollIntoView( { inline: 'end', block: 'nearest' } ); // What: Horizontal Reveal. Why: See revealHorizontally's own doc comment in this file's own header above, a one-time native reveal for a target sitting off the end of a horizontally-scrolling row, independent of (and before) all the vertical handling below, which has no idea this axis exists at all. How: This calls scrollIntoView on the first matched element with inline:'end'.

			const scrEle = getScrFun( eleArr[ 0 ] ); // What: Scroll Element. Why: Every branch below needs to know which element actually scrolls. How: This resolves the first matched element's own scroller via getScrFun.

			if ( curSteObj.scrollToTop ) { // What: Scroll-To-Top Guard. Why: A step whose target starts right at the top of the page anyway (e.g. a full-list review step) should scroll all the way up rather than just nudging it into view, keeping everything visible from the top instead of opening mid-scroll.


				const optObj = { top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' }; // What: Scroll Options Object. Why: Both branches below need the same behavior choice. How: This builds one shared options object.

				if ( scrEle === document.scrollingElement || scrEle === document.documentElement ) window.scrollTo( optObj ); // What: Window Scroll To. Why: The document's own scroller is addressed through window. How: This calls window.scrollTo when scrEle is the document's own scroller.

				else scrEle.scrollTo( optObj ); // What: Element Scroll To. Why: Any other scroller is addressed directly. How: This calls scrEle.scrollTo for every other case.

				return; // What: Scroll-To-Top Early Return. Why: Nothing below applies once this branch has already handled the scroll. How: This exits before the scrollToBottom/coachAtTop/pad branches.


			}

			if ( curSteObj.scrollToBottom ) { // What: Scroll-To-Bottom Guard. Why: The symmetric case: a step whose target always sits at the very bottom of its page/form (e.g. a footer "next" button), where scrolling by pad math alone can undershoot after the surrounding content just changed shape (e.g. a form switching back from a longer sub-step to a shorter one), landing short of the target instead of reaching it.


				const behStr = reduceMotion() ? 'auto' : 'smooth'; // What: Behavior String. Why: Both branches below need the same behavior choice. How: This resolves the reduced-motion preference once.

				if ( scrEle === document.scrollingElement || scrEle === document.documentElement ) window.scrollTo( { top: document.documentElement.scrollHeight, behavior: behStr } ); // What: Window Scroll To Bottom. Why: The document's own scroller is addressed through window. How: This scrolls the window all the way to documentElement's own scrollHeight.

				else scrEle.scrollTo( { top: scrEle.scrollHeight, behavior: behStr } ); // What: Element Scroll To Bottom. Why: Any other scroller is addressed directly. How: This scrolls scrEle all the way to its own scrollHeight.

				return; // What: Scroll-To-Bottom Early Return. Why: Nothing below applies once this branch has already handled the scroll. How: This exits before the coachAtTop/pad branches.


			}

			const isaDocBoo = scrEle === document.scrollingElement || scrEle === document.documentElement; // What: Is-A Document Boolean. Why: Several branches below need to know whether the resolved scroller is the document itself. How: This compares scrEle against both document.scrollingElement and document.documentElement.

			const tarRecObj = uniRecFun( eleArr ); // What: Target Rect Object. Why: Every branch below needs the target's own current union rect. How: This unions every matched element via uniRecFun.

			const scrRecObj = isaDocBoo ? { top: 0, bottom: window.innerHeight } : scrEle.getBoundingClientRect(); // What: Scroller Rect Object. Why: The pad math below needs the scroller's own visible bounds. How: This uses the viewport bounds for the document scroller, otherwise scrEle's own bounding rect.

			if ( curSteObj.coachAtTop ) { // What: Coach-At-Top Guard. Why: See coachAtTop's own doc comment in this file's own header above, scrolls so the target starts right where the coach (pinned to safTopNum) leaves off, instead of trying to fit the target's WHOLE height within the normal pad/padBotNum window below, which a too-tall target cannot do.


				const desTopNum = safTopFun( { forCoaBoo: true } ) + 12 + coaHeiRef.current + 16; // What: Desired Top Number. Why: This is exactly where the target's own top edge should land. How: This adds the coach's own floor, its 12px margin, its current measured height, and a 16px gap.

				scrAmtFun( scrEle, tarRecObj.top - desTopNum ); // What: Scroll By Desired Delta. Why: The scroller needs to move by exactly the gap between the target's own current top and its desired top. How: This calls scrAmtFun with that difference.

				return; // What: Coach-At-Top Early Return. Why: Nothing below applies once this branch has already handled the scroll. How: This exits before the pad-based branch.


			}

			const padTopNum = 90, padBotNum = 130; // What: Pad Top Number And Pad Bottom Number. Why: These are the ordinary top/bottom breathing-room margins used by the pad-based branch below. How: Both are fixed pixel constants tuned for the coach card's own typical size.

			const minTopNum = Math.max( scrRecObj.top + padTopNum, safTopFun() + 12 ); // What: Min Top Number. Why: The top boundary also cannot sit above safTopFun(), since a fixed pad alone assumes Today's own sticky header (plus, when present, the Edit Mode banner) is shorter than it actually is, which on a short enough viewport (or once the banner adds its own height) lets a target that "fits" by the pad's math alone still land partly behind that chrome, with briTarFun then seeing no need to scroll further. How: This takes whichever floor is higher between the plain pad math and the safe-chrome floor.

			let preTopNum = null; // What: Predicted Top Number. Why: A target too tall to fit alongside the coach no matter where it is scrolled to needs reserve space, decided HERE using a PREDICTED landing position (wherever the branch just below is about to place it) rather than an OBSERVED post-scroll one, so it can be applied before this step's very first scroll instead of discovered only after that scroll already settled. How: preTopNum mirrors whichever of the two branches below will actually fire; null (no scroll needed at all) is deliberately left unhandled, since a target that already fits without scrolling was never going to need reserve either.

			if ( tarRecObj.top < minTopNum ) preTopNum = minTopNum; // What: Predicted Top From Above. Why: A target starting above the safe floor will be scrolled down to exactly minTopNum. How: This sets preTopNum to minTopNum whenever the target's own top sits above it.

			else if ( tarRecObj.bottom > scrRecObj.bottom - padBotNum ) preTopNum = ( scrRecObj.bottom - padBotNum ) - tarRecObj.height; // What: Predicted Top From Below. Why: A target overflowing the bottom pad boundary will be scrolled up until its own bottom lands exactly there. How: This derives the resulting top from that landing bottom minus the target's own height.

			if ( !curSteObj.coachAtTop && !resDecBoo && preTopNum != null ) { // What: Reserve Prediction Guard. Why: This plugs the predicted landing position into the exact same fits-below/fits-above checks decResFun itself uses below, so this can never disagree with what decResFun would have decided anyway, just decided proactively instead of reactively; this replaces the loop's own decResFun (unchanged) used to be the only place this got decided, which meant a visibly separate second "jump then re-scroll" once it found the overlap, this step's target genuinely overlapping the coach at its settled position is exactly the case reproduced live and reported as jank.


				const vpHeiNum = window.innerHeight, coaHeiNum = coaHeiRef.current; // What: Viewport Height Number And Coach Height Number. Why: Both fit checks below need the current viewport height and the coach's own latest measured height. How: These are read fresh from window.innerHeight and coaHeiRef.current.

				const ftsBelBoo = vpHeiNum - ( preTopNum + tarRecObj.height ) >= coaHeiNum + 16; // What: Fits Below Boolean. Why: The below placement only works if the coach's own height plus its 16px gap actually fits under the predicted landing position. How: This compares the remaining viewport space under the predicted bottom edge against coaHeiNum + 16.
				const ftsAbvBoo = preTopNum - 16 - coaHeiNum >= safTopFun( { forCoaBoo: true } ) + 12; // What: Fits Above Boolean. Why: The above placement only works if the coach's own height plus its 16px gap actually fits above the predicted top edge, down to the coach's own safe floor. How: This compares the predicted top edge minus the coach's own space against the safe floor.

				if ( !ftsBelBoo && !ftsAbvBoo ) { // What: No Fit Guard. Why: Reserve space is only ever needed once neither the below nor the above placement actually fits. How: This only enters the reserve branch when both fit checks failed.


					resDecBoo = true; // What: Reserve Decided Commit. Why: This decision must only ever happen once per step. How: This flips resDecBoo to true so neither this branch nor decResFun's own later check re-decides it.
					resAmtNum = coaHeiNum + 40; // What: Reserve Amount Commit. Why: The reserved space must be generous enough to fit the coach's own full height plus a comfortable gap. How: This sets resAmtNum to the coach's own height plus a fixed 40px.
					setResTopNum( resAmtNum ); // What: Reserve Top Commit. Why: TabToday reads this off the bus to actually pad its own list. How: This publishes resAmtNum into React state, which the effect below forwards onto the bus.

					requestAnimationFrame( () => briTarFun() ); // What: Reserve Retry. Why: The padding has not rendered yet (React has not re-committed), so the retry must wait a real frame to measure the actual, already-reserved layout instead of guessing at it. How: This re-calls briTarFun on the next animation frame.

					return; // What: Reserve Early Return. Why: The scroll below must wait for the retry above instead of running against a stale layout. How: This exits before the plain scroll-by calls.


				}


			}

			if ( tarRecObj.top < minTopNum ) scrAmtFun( scrEle, -( minTopNum - tarRecObj.top ) ); // What: Scroll Up To Min Top. Why: A target above the safe floor must be scrolled down until it clears it. How: This calls scrAmtFun with the negative gap between minTopNum and the target's own top.

			else if ( tarRecObj.bottom > scrRecObj.bottom - padBotNum ) scrAmtFun( scrEle, tarRecObj.bottom - ( scrRecObj.bottom - padBotNum ) ); // What: Scroll Down To Pad Bottom. Why: A target overflowing the bottom pad boundary must be scrolled up until it clears it. How: This calls scrAmtFun with the gap between the target's own bottom and the pad boundary.


		};

		briTarFun(); // What: Initial Bring Call. Why: The target needs bringing into view once as soon as the step opens. How: This calls briTarFun for the first time; every subsequent call to it happens from inside the loop below.

		let hasBroBoo = false; // What: Has Brought Boolean. Why: briTarFun above should only run once as soon as the target actually exists, not on every frame; the loop below flips this once that first call has happened. How: This starts false and is set true the first time the target is found inside the loop.

		const spoPadNum = curSteObj.requireClick ? 0 : 8; // What: Spotlight Pad Number. Why: requireClick steps get a pulsing ring drawn tight against the target (see the .ob-spot.is-pulsing CSS); any padding here would leave a visible gap between the target's real edge and the pulse, which reads as the highlight being for some larger, vaguer area instead of the exact element to click. How: This is 0 for a requireClick step, otherwise the normal 8px.

		const claChrFun = ( recObj, eleArr ) => { // What: Clamp Chrome Function. Why: Today's own sticky header (and, on mobile, the groups rail stacked below it) plus a floating bottom tab bar (tabPlacement 'bottom') both sit at a higher z-index than the surrounding content but a LOWER one than this tour overlay, so a highlighted rect reaching past either one's edge would expose it through the spotlight's cutout (a box-shadow "hole") instead of dimming it, reading as if that chrome were part of the highlighted target. How: This clamps the rect actually drawn (not the one briTarFun scrolls by, which needs the real position) so the spotlight never reaches into either safe zone; targets that live INSIDE the nav bar, the group rail, or Today's own header are exempt, since clamping those against their own containing chrome can squash the highlight down to a sliver sitting below/past the actual target instead of on it.


			if ( eleArr.some( ( curEle ) => curEle.closest( '.tabbar' ) || curEle.closest( '.group-rail' ) || curEle.closest( '.today-h' ) ) ) return recObj; // What: Chrome Membership Exemption. Why: A target that is itself part of the nav bar, the group rail, or Today's own header must never be clamped against that same chrome. How: This returns recObj untouched whenever any matched element sits inside one of those 3 containers.

			const minTopNum = safTopFun() + spoPadNum; // What: Min Top Number. Why: The clamp needs to account for the spot's own padding too, so the padded box drawn below never overlaps that chrome even by that margin. How: This adds spoPadNum onto the safe-top floor.
			const maxBotNum = safBotFun() - spoPadNum; // What: Max Bottom Number. Why: Same reasoning as minTopNum, but for the opposite edge. How: This subtracts spoPadNum from the safe-bottom ceiling.
			const topNum = Math.max( recObj.top, minTopNum ); // What: Top Number. Why: The rect's own top edge must never rise above minTopNum. How: This takes whichever is lower between recObj.top and minTopNum.
			const botNum = Math.min( recObj.bottom, maxBotNum ); // What: Bottom Number. Why: The rect's own bottom edge must never sink below maxBotNum. How: This takes whichever is higher between recObj.bottom and maxBotNum.


			return { ...recObj, top: topNum, bottom: botNum, height: botNum - topNum }; // What: Clamped Rect Return. Why: The caller needs the fully clamped rect back, height recomputed to match. How: This spreads recObj, then overwrites top/bottom/height with the clamped values.


		};

		const plcTarFun = ( eleArr ) => { // What: Place Target Function. Why: This positions both the spotlight and the real coach imperatively, every frame, so neither one visibly lags behind a smooth scroll the way pure React state would.


			const tarRecObj = claChrFun( uniRecFun( eleArr ), eleArr ); // What: Target Rect Object. Why: Both the spotlight and the coach below need the same clamped, unioned rect. How: This unions eleArr, then clamps the result against chrome.

			if ( spoEleRef.current ) { // What: Spotlight Ref Guard. Why: The spotlight element may not be mounted yet on the very first call. How: This only writes to spoEleRef.current when it is actually present.


				const padNum = spoPadNum, spoStyObj = spoEleRef.current.style; // What: Pad Number And Spotlight Style Object. Why: Both are needed together to size/position the spot below. How: padNum reuses spoPadNum, spoStyObj is the live CSSStyleDeclaration for the spotlight element.

				spoStyObj.top = ( tarRecObj.top - padNum ) + 'px'; spoStyObj.left = ( tarRecObj.left - padNum ) + 'px'; // What: Spotlight Top/Left Write. Why: The spot must sit padNum outside the target's own top-left corner. How: This writes both inline style properties directly.
				spoStyObj.width = ( tarRecObj.width + padNum * 2 ) + 'px'; spoStyObj.height = ( tarRecObj.height + padNum * 2 ) + 'px'; // What: Spotlight Width/Height Write. Why: The spot must grow by padNum on every side, not just its own position. How: This writes both inline style properties directly.


			}

			if ( reaCoaRef.current ) { // What: Real Coach Ref Guard. Why: Same reasoning as the render function's own coach position: during briTarFun's (now smooth) scroll, the render function's OWN coach position (driven by the recObj React state set below, once per animation frame) lags a render/commit cycle behind the browser's own scroll animation and visibly stutters instead of gliding. How: Writing directly to the DOM here keeps the coach locked to the highlight, frame for frame; the render function still computes the same layout as a fallback for the coach's first paint each step (before this has run at all) and as the eventual React-driven value once it catches up.


				const vpWidNum = window.innerWidth, vpHeiNum = window.innerHeight; // What: Viewport Width Number And Viewport Height Number. Why: The layout math below needs the current viewport size. How: These are read fresh from window on every call.
				const coaWidNum = Math.min( 300, vpWidNum - 24 ); // What: Coach Width Number. Why: The coach's own width must clamp to the viewport on a narrow screen. How: This caps the usual 300px width to the viewport minus a 24px margin.
				const layObj = coaLayFun( tarRecObj, coaHeiRef.current, coaWidNum, vpWidNum, vpHeiNum ); // What: Layout Object. Why: This is the single shared placement math also used by the render function's own first-paint fallback. How: This calls coaLayFun with the current target rect, the coach's own latest measured height, and the current viewport/coach sizes.
				const coaStyObj = reaCoaRef.current.style; // What: Coach Style Object. Why: The layout above must actually be written onto the real DOM element. How: This reads reaCoaRef.current's own live CSSStyleDeclaration.

				coaStyObj.top = layObj.top + 'px'; coaStyObj.left = layObj.left + 'px'; // What: Coach Top/Left Write. Why: The coach must move to exactly where coaLayFun decided. How: This writes both inline style properties directly.
				coaStyObj.setProperty( '--ob-ax', arwXFun( tarRecObj, layObj.left, coaWidNum ) + 'px' ); // What: Arrow X Custom Property Write. Why: The coach's own CSS arrow reads this custom property to stay centered on the target. How: This sets --ob-ax to the freshly computed arrow offset.
				reaCoaRef.current.classList.toggle( 'ob-coach--up', layObj.arrowClass === 'ob-coach--up' ); // What: Arrow Up Class Toggle. Why: The coach's own arrow direction must match whichever side coaLayFun picked. How: This toggles the ob-coach--up class based on layObj.arrowClass.
				reaCoaRef.current.classList.toggle( 'ob-coach--down', layObj.arrowClass === 'ob-coach--down' ); // What: Arrow Down Class Toggle. Why: Same reasoning as the up-class toggle, for the opposite direction. How: This toggles the ob-coach--down class based on layObj.arrowClass.


			}


			return tarRecObj; // What: Placed Rect Return. Why: The caller (the loop below) needs the placed rect back to feed into React state too. How: This returns the same tarRecObj just placed.


		};

		let lasTopNum = null, lasHeiNum = null, stbFraNum = 0; // What: Last Top Number, Last Height Number, And Stable Frame Number. Why: The target can still be settling in two different ways (mid-CSS-transition, or briTarFun's own scroll adjustment not having fully landed yet), and deciding off either kind of transient reading would wrongly conclude "fits" and skip the reserve the final, settled geometry actually needs. How: These track the target's own top/height across consecutive frames so decResFun below can wait for both to stop changing before locking in its decision, the same idea as coaHeiNum's own stabilize-then-use pattern above, just for the other side of the same math.

		const decResFun = ( eleArr ) => { // What: Decide Reserve Function. Why: This decides how much top-space (if any) THIS step's target needs reserved above it, ONCE, the very first time the target's own geometry has settled, rather than continuously on every frame. How: A continuous decision looks right on Today (its highlight is tall enough that scrolling never changes the verdict) but flips mid-scroll on shorter pages like Pickers, where scrolling the header over the target can cross the "fits above" threshold WHILE THE USER IS STILL SCROLLING, jumping the layout under them; deciding once and locking it for the step's duration reads like a person who sized up the space up front, not one who keeps rearranging things as you scroll.


			if ( curSteObj.coachAtTop ) { resDecBoo = true; return; } // What: Coach-At-Top Skip. Why: coachAtTop steps never reserve, see that flag's own doc comment in this file's own header above; resTopNum stays at its already-0 default. How: This marks the decision as made without ever setting a nonzero reserve.

			if ( resDecBoo ) return; // What: Already Decided Guard. Why: This decision must only ever happen once per step. How: This returns immediately once resDecBoo is already true.

			const tarRecObj = uniRecFun( eleArr ); // What: Target Rect Object. Why: The stability check below needs the target's own current union rect. How: This unions eleArr via uniRecFun.

			if ( lasHeiNum != null && Math.abs( tarRecObj.height - lasHeiNum ) < 1 && Math.abs( tarRecObj.top - lasTopNum ) < 1 ) stbFraNum++; // What: Stable Frame Increment. Why: Both the target's own top and height must be unchanged from the previous frame for it to count as settled. How: This increments stbFraNum only when both deltas are under 1px.

			else stbFraNum = 0; // What: Stable Frame Reset. Why: Any real movement restarts the settle count from scratch. How: This resets stbFraNum to 0 whenever the stability check above failed.

			lasTopNum = tarRecObj.top; // What: Last Top Commit. Why: The next frame's own stability check needs this frame's own top value to compare against. How: This overwrites lasTopNum with tarRecObj.top.
			lasHeiNum = tarRecObj.height; // What: Last Height Commit. Why: Same reasoning as the top commit, for height. How: This overwrites lasHeiNum with tarRecObj.height.

			if ( stbFraNum < 2 ) return; // What: Not Yet Stable Guard. Why: 2 consecutive stable frames are required before trusting the geometry. How: This returns whenever stbFraNum has not yet reached 2.

			resDecBoo = true; // What: Reserve Decided Commit. Why: This decision must only ever happen once per step. How: This flips resDecBoo to true.

			const vpHeiNum = window.innerHeight; // What: Viewport Height Number. Why: The fit checks below need the current viewport height. How: This reads window.innerHeight fresh.

			const coaHeiNum = coaHeiRef.current; // What: Coach Height Number. Why: This must read coaHeiRef.current, not a closed-over value, since a narrower coach (small/mobile screens) wraps the same body text over more lines and renders taller, so the fixed COA_HEI_NUM guess under-reserved there specifically, this step fitting "above" by the estimate but not in reality, with the coach ending up overlapping the highlight's top edge anyway. How: This reads the ref's own current value fresh.

			if ( vpHeiNum - ( tarRecObj.top + tarRecObj.height ) >= coaHeiNum + 16 ) return; // What: Fits Below Return. Why: No reserve is needed once the coach's own height plus its 16px gap already fits below the target. How: This returns whenever that check passes, leaving resTopNum at its already-0 default.

			if ( tarRecObj.top - 16 - coaHeiNum >= safTopFun( { forCoaBoo: true } ) + 12 ) return; // What: Fits Above Return. Why: No reserve is needed once the coach's own height plus its 16px gap already fits above the target either. How: This returns whenever that check passes, leaving resTopNum at its already-0 default.

			resAmtNum = coaHeiNum + 40; // What: Reserve Amount Commit. Why: Neither side fits, so the reserved space must be generous enough to fit the coach's own full height plus a comfortable gap. How: This sets resAmtNum to the coach's own height plus a fixed 40px.
			setResTopNum( resAmtNum ); // What: Reserve Top Commit. Why: TabToday reads this off the bus to actually pad its own list. How: This publishes resAmtNum into React state.

			const ele2Arr = finTarFun( curSteObj.sel ); // What: Element 2 Array. Why: The scroll compensation below needs to re-resolve the target's own elements. How: This calls finTarFun again for the current step's own sel.

			if ( ele2Arr.length ) { // What: Re-Resolved Guard. Why: The target must still exist for the scroll compensation below to make sense. How: This only proceeds when ele2Arr is non-empty.


				const scr2Ele = getScrFun( ele2Arr[ 0 ] ); // What: Scroller 2 Element. Why: The scroll compensation below needs to know which element actually scrolls. How: This resolves the first re-found element's own scroller via getScrFun.

				requestAnimationFrame( () => { // What: Scroll Compensation Frame. Why: The padding needs to have actually landed in the DOM first, so this re-measures the target after a frame rather than computing from tarRecObj, which is now stale. How: This recomputes the scroller and desired top freshly, rather than closing over briTarFun's own local scrEle, which this function does not have access to.


					const freEleArr = finTarFun( curSteObj.sel ); // What: Fresh Element Array. Why: The target's own geometry must be read again, now that the reserve padding has actually rendered. How: This calls finTarFun once more for the current step's own sel.

					if ( !freEleArr.length ) return; // What: Fresh Target Guard. Why: The target may have disappeared in the meantime. How: This returns whenever freEleArr is empty.

					const freTopNum = uniRecFun( freEleArr ).top; // What: Fresh Top Number. Why: This is the target's own real, post-padding top edge. How: This unions freEleArr and reads its own top.

					const desTopNum = safTopFun( { forCoaBoo: true } ) + 12 + coaHeiNum + 16; // What: Desired Top Number. Why: This scrolls so the target lands exactly coaHeiNum + 16 below the safe floor, the same threshold the "fits above" check above uses, and what the coach's own render-time placement needs to actually seat it flush above the target instead of overlapping it. How: This adds the safe floor, its 12px margin, the coach's own height, and a 16px gap.

					scrAmtFun( scr2Ele, freTopNum - desTopNum ); // What: Scroll By Desired Delta. Why: This is deliberately NOT a scroll that compensates for the padding just added (e.g. scrolling by +resAmtNum), since that would fully cancel the reserve's own effect, undoing the room it just opened up and leaving the coach exactly as short on space as before any reserve existed. How: This calls scrAmtFun with the gap between the target's own fresh top and its desired top.


				} );


			}


		};

		const scrPosFun = () => { const eleArr = finTarFun( curSteObj.sel ); if ( eleArr.length ) plcTarFun( eleArr ); }; // What: Scroll Position Function. Why: This repositions synchronously as scroll fires (before paint) so the highlight does not trail the content the way a purely rAF-driven fixed box does. How: This resolves the target fresh and, when found, repositions it via plcTarFun; listening broadly (capture) so it fires for whichever element scrolls.

		window.addEventListener( 'scroll', scrPosFun, { passive: true, capture: true } ); // What: Scroll Listener Add. Why: This is what actually keeps the highlight in sync during a manual scroll, not just briTarFun's own programmatic one. How: This adds scrPosFun in capture phase, passively, at the window.

		const nftNum = 4000; // What: Not-Found-Timeout Number. Why: A step whose target never resolves (normally just the tab-sync effect's own selectTab() still settling) would otherwise sit as a permanent dim with nothing to click, most likely on a resume, where a stale activeTour survived some app change that moved or removed the target. How: This is generous enough not to fire during ordinary mounting.

		let notFndNum = null; // What: Not-Found Number. Why: The watchdog below needs to track how long the target has been missing, not just whether it currently is. How: This starts null (never yet missing) and is set to a timestamp the first time the loop below finds nothing.

		let lasScrHeiNum = null; // What: Last Scroll Height Number. Why: This tracks the scrollable content's total height so a step whose target stays put (no tab/step change) but whose SURROUNDING content grows or shrinks, e.g. the user does the step's own action themselves without ever clicking the coach's Next, can still get nudged back into view. How: Ordinary scrolling never changes this value, so it does not fight the user scrolling around on purpose; only an actual content-size change re-triggers briTarFun; measured with resAmtNum subtracted out, otherwise decResFun's own CSS padding (added specifically to make room for the coach above a highlight too tall to fit either way) reads as "content grew", re-triggers briTarFun, and briTarFun scrolls the target right back up to its usual pad-from-top position, undoing the reserve and putting the coach right back on top of it.

		let pulPriBoo = true; // What: Pulse Primary Boolean. Why: This tracks pulseSel's own on/off transition (see its own doc comment in this file's own header above) so falling back to the wider, no-longer-pulsing highlight also brings it into view, since the wider box can extend well past what the tight button-only highlight needed. How: This starts true so a step that never had a pulseSel primary target at all (pulseSel unset) never spuriously fires this on its first frame.

		const loopFun = () => { // What: Loop Function. Why: This is the per-frame heartbeat: it re-resolves the target, positions it, decides reserve, tracks the not-found watchdog, and reschedules itself.


			if ( canBoo ) return; // What: Cancelled Guard. Why: A cancelled effect must never schedule another frame. How: This returns immediately whenever canBoo is already true.

			const eleArr = finTarFun( curSteObj.sel ); // What: Element Array. Why: Every branch below needs to know whether the target currently exists. How: This resolves curSteObj.sel fresh on every frame.

			if ( eleArr.length ) { // What: Target Found Branch. Why: The target currently exists, so this positions it and clears the not-found watchdog. How: This runs the full per-frame bookkeeping below.


				notFndNum = null; // What: Not-Found Reset. Why: The watchdog must reset the instant the target reappears. How: This clears notFndNum back to null.

				const scrEle = getScrFun( eleArr[ 0 ] ); // What: Scroll Element. Why: The content-grew check below needs to know which element actually scrolls. How: This resolves the first matched element's own scroller.

				const scrHeiNum = ( ( scrEle === document.scrollingElement || scrEle === document.documentElement ) // What: Scroll Height Number. Why: The content-grew check compares this against lasScrHeiNum. How: This reads either documentElement's own scrollHeight or the scroller's own, then subtracts resAmtNum (see lasScrHeiNum's own doc comment above for why).
					? document.documentElement.scrollHeight : scrEle.scrollHeight ) - resAmtNum;

				if ( !hasBroBoo ) { hasBroBoo = true; briTarFun(); } // What: First Bring Call. Why: The target must be brought into view exactly once, the first time it actually exists. How: This flips hasBroBoo and calls briTarFun only on that first frame.

				else if ( lasScrHeiNum != null && Math.abs( scrHeiNum - lasScrHeiNum ) > 40 ) briTarFun(); // What: Content Grew Re-Bring. Why: See lasScrHeiNum's own doc comment above, the surrounding content changing size mid-step should re-trigger the bring. How: This re-calls briTarFun once the scroll height has moved by more than a 40px tolerance.

				else if ( curSteObj.pulseSel ) { // What: Pulse Transition Check. Why: A pulseSel step's own primary target can stop matching mid-step (e.g. a button widening to its whole surrounding window once clicked), and the wider fallback highlight needs bringing into view too.


					const isaPriBoo = !!document.querySelector( curSteObj.pulseSel ); // What: Is-A Primary Boolean. Why: This is the live answer to whether the tight, pulsing target still matches. How: This checks curSteObj.pulseSel directly against the document.

					if ( pulPriBoo && !isaPriBoo ) briTarFun(); // What: Pulse Transition Bring. Why: The wider fallback box can extend well past what the tight target needed. How: This re-calls briTarFun exactly on the frame the primary target stops matching.

					pulPriBoo = isaPriBoo; // What: Pulse Primary Commit. Why: The next frame's own check needs this frame's own answer to compare against. How: This overwrites pulPriBoo with isaPriBoo.


				}

				lasScrHeiNum = scrHeiNum; // What: Last Scroll Height Commit. Why: The next frame's own content-grew check needs this frame's own scroll height to compare against. How: This overwrites lasScrHeiNum with scrHeiNum.

				decResFun( eleArr ); // What: Reserve Decision Call. Why: Every frame gets a chance to settle the once-per-step reserve decision. How: This calls decResFun with the currently-resolved elements.

				const tarRecObj = plcTarFun( eleArr ); // What: Target Rect Object. Why: The spotlight/coach must actually be positioned every frame. How: This calls plcTarFun, which both writes the DOM directly and returns the placed rect.

				setRecObj( ( preRecObj ) => ( preRecObj && Math.abs( preRecObj.top - tarRecObj.top ) < 0.5 && Math.abs( preRecObj.left - tarRecObj.left ) < 0.5 && preRecObj.width === tarRecObj.width && preRecObj.height === tarRecObj.height ) // What: Rect State Commit. Why: React state should only actually change when the placement moved by a meaningful amount, avoiding a render storm from sub-pixel jitter. How: This keeps the previous state object when every field is within tolerance, otherwise commits a fresh { top, left, width, height } snapshot.
					? preRecObj : { top: tarRecObj.top, left: tarRecObj.left, width: tarRecObj.width, height: tarRecObj.height } );


			}

			else { // What: Target Not Found Branch. Why: The target currently does not exist, so this drives the not-found watchdog instead.


				setRecObj( null ); // What: Rect Clear. Why: Nothing should render as highlighted while the target is missing. How: This clears the React rect state back to null.

				if ( notFndNum == null ) notFndNum = performance.now(); // What: Not-Found Start. Why: The watchdog needs a timestamp to measure how long the target has been missing. How: This records the current time the first frame the target is missing.

				else if ( performance.now() - notFndNum > nftNum ) { canBoo = true; skpTouFun(); return; } // What: Not-Found Timeout Skip. Why: A target that never resolves within nftNum must not leave a permanent, unclickable dim on screen. How: This cancels the loop and calls skpTouFun once the missing duration exceeds nftNum.


			}

			rafNum = requestAnimationFrame( loopFun ); // What: Loop Reschedule. Why: This heartbeat must keep running for as long as the step is up. How: This schedules the next call to loopFun on the next animation frame.


		};

		rafNum = requestAnimationFrame( loopFun ); // What: Loop Start. Why: The very first frame should also go through requestAnimationFrame, consistent with every later one. How: This schedules the first call to loopFun.

		return () => { canBoo = true; cancelAnimationFrame( rafNum ); window.removeEventListener( 'scroll', scrPosFun, { capture: true } ); }; // What: Position Tracking Cleanup Return. Why: The raf loop and the scroll listener must both stop the instant the step changes or this component unmounts. How: This flips canBoo, cancels the pending frame, and removes the scroll listener.


	}, [ curSteNum, curSteObj && curSteObj.sel ] ); // What: Effect Dependency Array. Why: This must re-run whenever the step index moves (a genuinely new step to track) or, for the very same step, whenever its own sel changes identity (steps are rebuilt as fresh objects on every render, so this is really just watching the one field that actually decides what to track). How: curSteNum is the step position itself, and curSteObj && curSteObj.sel is the specific selector that drives everything inside this effect.

	React.useEffect( () => { emlTouObj.set( { reserveTop: resTopNum } ); }, [ resTopNum ] ); // What: Reserve Top Publish Effect. Why: This is published on the bus so the active tab (which owns the actual scrollable content) can apply it, since this component only overlays the page and does not own that layout. How: resTopNum itself is set by the position-tracking effect above, decided ONCE per step rather than continuously, see the comment on decResFun there for why. // What: Effect Dependency Array. Why: This must re-run whenever resTopNum itself changes. How: resTopNum is the exact value being published.

	const porFun = ( nodEle ) => createPortal( nodEle, document.body ); // What: Portal Function. Why: Every branch of this component's own render needs to portal its JSX onto document.body rather than wherever GuidedTour happens to be mounted in the tree. How: This forwards nodEle straight into React's own createPortal.

	if ( !curSteObj ) return porFun( <div className='ob-tour' aria-live='polite'><div className='ob-dim' /></div> ); // What: No Step Render Guard. Why: A step index advanced past the end of a `steps` array whose last entry is not primary:'Done' yet (most likely mid-content-authoring) is caught by the position-tracking effect above, which already calls skpTouFun the moment it sees this, but that is a separate effect firing after this render commits, so this render still needs to not crash reading off a null curSteObj in the meantime. How: This returns the same one-frame dim-only fallback as the "target not found yet" case below.

	const totSteNum = steps.length; // What: Total Step Number. Why: The progress line below needs the total step count. How: This reads steps.length once per render.

	const vpWidNum = window.innerWidth, vpHeiNum = window.innerHeight; // What: Viewport Width Number And Viewport Height Number. Why: The coach's own sizing below needs the current viewport dimensions. How: These are read fresh from window on every render.

	const coaWidNum = Math.min( 300, vpWidNum - 24 ); // What: Coach Width Number. Why: The coach's own width must clamp to the viewport on a narrow screen. How: This caps the usual 300px width to the viewport minus a 24px margin.

	const meaCoaJsx = ( // What: Measurer Coach JSX. Why: This is a hidden clone of the coach, rendered off-screen the moment a step's content is known, BEFORE its target (and so recObj) resolves, unlike the real coach below; its only job is to give meaCoaRef's own layout effect something to measure early enough for decResFun (which runs inside the position-tracking effect, as soon as the target is first found, before the real coach exists in the DOM at all) to see this step's REAL height instead of a stale one measured off whatever the previous, possibly shorter, step happened to be.


		<div
			className='ob-coach'
			ref={ meaCoaRef }
			style={{
				position      : 'fixed',
				top           : 0,
				left          : -9999,
				width         : coaWidNum,
				visibility    : 'hidden',
				pointerEvents : 'none'
			}}
			aria-hidden='true'
		>{ /* What: Measurer Coach Element. Why: This is the hidden clone described above. How: This renders the exact same content as the real coach below, but off-screen and pointer-events:none. */ }


			{ !curSteObj.solo && <p className='ob-prog'>Step { curSteNum + 1 } of { totSteNum }</p> }{ /* What: Progress Paragraph Element. Why: Every non-solo step shows its own position in the sequence. How: This renders only when curSteObj.solo is falsy. */ }
			<p className='ob-coach-title'>{ curSteObj.title }</p>{ /* What: Coach Title Paragraph Element. Why: Every step needs its own heading text. How: This renders curSteObj.title directly. */ }
			<p className='ob-body'>{ curSteObj.body }</p>{ /* What: Coach Body Paragraph Element. Why: Every step needs its own explanatory copy. How: This renders curSteObj.body directly. */ }
			<div className={ `ob-crow   ${ curSteObj.solo ? 'ob-crow--solo' : '' }` }>{ /* What: Coach Row Container Element. Why: This groups the Skip/Back/Next controls into one row, stretched full-width for a solo step. How: This adds the ob-crow--solo modifier class whenever curSteObj.solo is true. */ }


				{ !curSteObj.solo && ( // What: Left Nav Visibility Check. Why: A solo step hides the Skip/Back row entirely, per solo's own doc comment in this file's own header above.


					<div className='ob-lnav'>{ /* What: Left Nav Container Element. Why: This groups Skip and the optional Back button together on the row's own left side. How: This is only rendered for a non-solo step. */ }


						<button className='ob-skip'>Skip</button>{ /* What: Skip Button Element. Why: This is the measurer's own inert copy of the real Skip button. How: This has no onClick, since the measurer is never actually interactive. */ }
						{ curSteObj.back && <button className='ob-back'>&lsaquo; Back</button> }{ /* What: Back Button Element. Why: Only a step that opts in via `back` shows this. How: This is the measurer's own inert copy of the real Back button. */ }


					</div>


				) }
				<button className='ob-next' disabled={ curSteObj.requireClick }>{ curSteObj.primary }{ ( curSteObj.primary !== 'Done' && !curSteObj.solo ) ? ' ›' : '' }</button>{ /* What: Next Button Element. Why: This is the measurer's own inert copy of the real Next/Done button, disabled exactly when the real one would be. How: This renders curSteObj.primary plus a trailing arrow glyph unless the step is 'Done' or solo. */ }


			</div>


		</div>


	);

	const shoPulBoo = curSteObj.requireClick && ( !curSteObj.pulseSel || !!document.querySelector( curSteObj.pulseSel ) ); // What: Should Pulse Boolean. Why: See pulseSel's own doc comment in this file's own header above, this defaults to matching requireClick exactly when unset, so every other requireClick step pulses for its whole duration same as before. How: This is true whenever the step requires a click and either names no pulseSel at all, or its own pulseSel currently matches something.

	let coaStyObj, arwClaStr, spoStyObj = null; // What: Coach Style Object, Arrow Class String, And Spotlight Style Object. Why: Exactly one of the two branches below assigns all 3. How: These start uninitialized (spoStyObj explicitly null) and are filled in by whichever branch applies.

	if ( recObj ) { // What: Rect Present Branch. Why: A resolved rect means the target currently exists and both the spot and coach can be laid out. How: This computes spoStyObj/coaStyObj/arwClaStr from the current recObj.


		const padNum = curSteObj.requireClick ? 0 : 8; // What: Pad Number. Why: See spoPadNum's own comment above inside the position-tracking effect, this is the render-time twin of that same value. How: This is 0 for a requireClick step, otherwise the normal 8px.

		hadRecRef.current = true; // What: Had Rect Commit. Why: Once a rect has actually been drawn, the very next step's own first appearance should no longer suppress the slide-in the way the very first one did. How: This flips hadRecRef.current to true.

		spoStyObj = { top: recObj.top - padNum, left: recObj.left - padNum, width: recObj.width + padNum * 2, height: recObj.height + padNum * 2, transition: 'none' }; // What: Spotlight Style Object Assignment. Why: The rendered .ob-spot div below reads this directly as its own inline style. How: This pads recObj outward by padNum on every side and disables any CSS transition, since plcTarFun already animates position imperatively every frame.

		const layObj = coaLayFun( recObj, coaHeiNum, coaWidNum, vpWidNum, vpHeiNum ); // What: Layout Object. Why: This is the same shared math plcTarFun uses imperatively every frame, kept here too as the coach's own first-paint value each step and the eventual React-driven fallback once it catches up. How: This calls coaLayFun with the current recObj, coaHeiNum, and the current viewport/coach sizes; coachAtTop needs no special branch here at all any more, letting it fall through to the exact same below/above logic every other step already uses is what lets the coach flip to sit BELOW the target (arrow up) once there is room, instead of only ever attaching above it, since coachAtTop's own remaining job is upstream of this (skipping decResFun's own padding and giving briTarFun a precise initial scroll target).

		coaStyObj = { top: layObj.top, left: layObj.left }; // What: Coach Style Object Assignment. Why: The rendered .ob-coach div below reads this directly as part of its own inline style. How: This takes layObj's own top/left.
		arwClaStr = layObj.arrowClass; // What: Arrow Class String Assignment. Why: The rendered .ob-coach div below needs to know which arrow direction class to apply. How: This takes layObj's own arrowClass.


	}

	else return porFun( <div className='ob-tour' aria-live='polite'><div className='ob-dim' />{ meaCoaJsx }</div> ); // What: No Rect Render Guard. Why: The target has not resolved yet (mid-navigation). How: This shows only the dim; the visible coach appears once its target resolves, so no stale/centered flash, but the hidden measurer still needs to be here so its height is ready by the time the target IS found.

	const arwXNum = arwXFun( recObj, coaStyObj.left, coaWidNum ); // What: Arrow X Number. Why: The real, visible coach's own render-time arrow position needs the same math plcTarFun uses imperatively. How: This calls arwXFun with the current recObj and the just-computed coaStyObj.left.


	return porFun(

		<div className='ob-tour' aria-live='polite'>{ /* What: Tour Overlay Container Element. Why: This is the single portaled root every branch of this render returns. How: This wraps the dim, the spot or coach, and the hidden measurer together. */ }


			{ meaCoaJsx }
			{ /* The highlight border itself stays during a drag (still marks the
			    section being dragged); only its box-shadow, which is what dims
			    the REST of the page (the ".ob-spot" trick: a giant shadow
			    darkens everything outside its own bounds), drops out, via the
			    is-dragging CSS override. Otherwise the darkened background
			    would make it hard to see exactly where the group is landing. */ }
			{ spoStyObj && <div className={ `ob-spot   ${ dragging ? 'is-dragging' : '' }   ${ shoPulBoo ? 'is-pulsing' : '' }` } ref={ spoEleRef } style={ spoStyObj } /> }{ /* What: Spotlight Element. Why: This is the actual cutout highlight drawn around the target. How: This renders only while spoStyObj is set, toggling the dragging/pulsing modifier classes. */ }
			{ !spoStyObj && !dragging && <div className='ob-dim' /> }{ /* What: Dim Element. Why: A step with nothing to highlight still needs the dim layer alone. How: This renders only when there is no spot AND no drag in progress. */ }
			{ !dragging && ( // What: Coach Visibility Check. Why: The coach card must hide entirely during a drag gesture, per dragging's own doc comment above.


				<div className={ `ob-coach   ${ arwClaStr }` } ref={ reaCoaRef } style={{ ...coaStyObj, width: coaWidNum, '--ob-ax': arwXNum + 'px' }}>{ /* What: Coach Container Element. Why: This is the real, visible, interactive coach card. How: This positions itself from coaStyObj/coaWidNum/arwXNum and renders its own arrow direction class. */ }


					{ !curSteObj.solo && <p className='ob-prog'>Step { curSteNum + 1 } of { totSteNum }</p> }{ /* What: Progress Paragraph Element. Why: Every non-solo step shows its own position in the sequence. How: This renders only when curSteObj.solo is falsy. */ }
					<p className='ob-coach-title'>{ curSteObj.title }</p>{ /* What: Coach Title Paragraph Element. Why: Every step needs its own heading text. How: This renders curSteObj.title directly. */ }
					<p className='ob-body'>{ curSteObj.body }</p>{ /* What: Coach Body Paragraph Element. Why: Every step needs its own explanatory copy. How: This renders curSteObj.body directly. */ }
					<div className={ `ob-crow   ${ curSteObj.solo ? 'ob-crow--solo' : '' }` }>{ /* What: Coach Row Container Element. Why: This groups the Skip/Back/Next controls into one row, stretched full-width for a solo step. How: This adds the ob-crow--solo modifier class whenever curSteObj.solo is true. */ }


						{ !curSteObj.solo && ( // What: Left Nav Visibility Check. Why: A solo step hides the Skip/Back row entirely, per solo's own doc comment in this file's own header above.


							<div className='ob-lnav'>{ /* What: Left Nav Container Element. Why: This groups Skip and the optional Back button together on the row's own left side. How: This is only rendered for a non-solo step. */ }


								<button className='ob-skip' onClick={ skpTouFun }>Skip</button>{ /* What: Skip Button Element. Why: This ends the tour as a non-completion, per skpTouFun's own comment above. How: This calls skpTouFun on click. */ }
								{ curSteObj.back && <button className='ob-back' onClick={ bacSteFun }>&lsaquo; Back</button> }{ /* What: Back Button Element. Why: Only a step that opts in via `back` shows this. How: This calls bacSteFun on click. */ }


							</div>


						) }
						{ curSteObj.requireClick ? ( // What: Require-Click Check. Why: A requireClick step needs its Next button disabled and explained instead of the normal clickable one. How: This renders the InfoTip-wrapped disabled button while curSteObj.requireClick is true.

							<InfoTip label='Please click the indicated element in order to advance.'>{ /* What: Require-Click Info Tip Element. Why: A requireClick step's Next button is disabled, and the user needs to be told why. How: This wraps the disabled button below with a hover/tap hint. */ }


								<button className='ob-next' disabled>
									{ curSteObj.primary }{ ( curSteObj.primary !== 'Done' && !curSteObj.solo ) ? ' ›' : '' }
								</button>{ /* What: Disabled Next Button Element. Why: The user must click the highlighted target itself to advance, not this button. How: This renders curSteObj.primary plus a trailing arrow glyph unless the step is 'Done' or solo, always disabled. */ }


							</InfoTip>

						) : ( // What: Normal Next Branch. Why: A step without requireClick just needs the plain clickable button. How: This renders the else branch, taken while curSteObj.requireClick is false.

							<button className='ob-next' onClick={ priActFun }>
								{ curSteObj.primary }{ ( curSteObj.primary !== 'Done' && !curSteObj.solo ) ? ' ›' : '' }
							</button>

						) }{ /* What: Next/Done Button Ternary. Why: A requireClick step swaps the interactive button for the disabled/InfoTip-wrapped one above. How: This picks between the two based on curSteObj.requireClick, calling priActFun on click for the enabled case. */ }


					</div>


				</div>


			) }


		</div>

	);


}

// #endregion GuidedTour



export { GuidedTour, goToTodayTop };



