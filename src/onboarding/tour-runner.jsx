


// #region Imports

import cssModObj from './tour-runner.module.css'; // What: CSS Module Object. Why: The tour overlay, spotlight, and coach card styles live in their own module. How: This maps each class name in tour-runner.module.css to its hashed module class.
import React     from 'react';                    // What: React. Why: This is the UI library GuiTouCom and its supporting helpers are built on. How: This is used directly (React.useState, React.useRef, React.useEffect, React.useLayoutEffect, React.useCallback) throughout, instead of importing individual named hooks.


import { createPortal } from 'react-dom';            // What: Create Portal. Why: The dim layer, spotlight and coach card must render into <body> so they clamp to the viewport instead of being clipped by an ancestor's own overflow. How: This is called with GuiTouCom's own JSX and document.body inside the porBodFun helper below.
import { emlTouObj    } from '../state/tour-bus.js'; // What: Ease My Life Tour Object. Why: This publishes the running tour's touPhaStr/touSteNum/touIdeStr/resTopNum/wanRaiBoo fields so other tabs can react without a context provider. How: This is written to via .set() at several points below and never read synchronously here.
import { InfTipCom    } from '../ui/info-tip.jsx';   // What: Info Tip Component. Why: A cirBoo step's disabled Next button needs a hover/tap hint explaining why it can't be clicked yet. How: This wraps that disabled button in the render output below.
import { redMotFun    } from '../utils/motion.js';   // What: Reduce Motion Function. Why: A user who prefers reduced motion should get an instant scroll instead of a smooth one. How: This is checked inside briTarFun's own scroll calls below.
import { rhyPxlFun    } from '../utils/rhythm.js';   // What: Rhythm Pixel Function. Why: Pixel layout math here needs the same step sizes the stylesheet uses. How: This returns a vertical rhythm step in pixels at the current root font size.
import { splSelFun    } from '../utils/selector.js'; // What: Split Selector Function. Why: A selector list's alternatives are tried in turn, and a comma nested inside :is() or :has() must not split one alternative in two. How: This is called with the step's or item's own selector list.
import { useEmlTouFun } from '../state/tour-bus.js'; // What: Use Ease My Life Tour Function. Why: GuiTouCom needs to know whether a drag gesture is in progress elsewhere in the app, so it can hide its own coach card during one. How: This is called once to subscribe to the shared tour bus and read its own draActBoo field.

// #endregion Imports



/**
 * tour-runner.jsx = Tour Runner
 *
 * @summary
 * A generic guided-tour engine: sequential single-spotlight steps with a coach
 * card (Step N of N, Skip/Back/Next). Shared by the Welcome Tour
 * (onboarding/welcome-tour.jsx) and every per-feature mini-tour built on it.
 * This file owns none of any specific tour's content or business logic, only
 * the mechanics: spotlight positioning, the chrome clamp, the click-guard, the
 * not-found watchdog, tab-sync, the mobile rail auto-open, resume-on-reload
 * persistence. This is NOT used by the on-demand help mode (see
 * help/mode.jsx): that is simultaneous multi-highlight with no dimming that
 * blocks clicks and no sequential coach, a genuinely different engine.
 *
 * Sections:
 *  - Constants
 *  - Helpers
 *  - Components
 *  - Exports
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
*/



// #region Constants

const COA_HEI_NUM = 220; // What: Coach Height Number. Why: This is a conservative estimate of the coach card's own height, good enough to decide whether it fits above/below a step's highlighted target; the real value depends on each step's body-text length, which is not measured. How: This seeds the reserve-space calculation and the coach's own initial placement below, both of which are corrected once the coach's real height is measured.

// #endregion Constants



// #region Helpers

// #region arrHorFun

/**
 * arrHorFun = Arrow Horizontal Function
 *
 * @summary
 * Where the coach card's own arrow sits along its edge, in pixels from the
 * coach's own left edge. The arrow points at the highlighted target's own
 * horizontal midpoint, clamped so it never slides into the coach's own rounded
 * corners (at least 18px in from the left, and 26px short of the right).
 * Shared by the render function's own first-paint placement and plaTarFun's
 * per-frame write, so the two always agree.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curRecObj - Current Rect Object: The clamped highlight rect the arrow
 *                    points at.
 * @param coaLefNum - Coach Left Number: The coach's own left edge, in px.
 * @param coaWidNum - Coach Width Number: The coach's own width, in px.
 *
 * @returns The arrow's own horizontal offset in px, written to the coach's
 * --coa-arr-off custom property.
 *
 * @example
 * ```ts
 * arrHorFun( curRecObj, coaLefNum, coaWidNum ) // => 142
 * ```
 *
*/

const arrHorFun = ( curRecObj, coaLefNum, coaWidNum ) => Math.max( 18, Math.min( curRecObj.left + curRecObj.width / 2 - coaLefNum, coaWidNum - 26 ) ); // What: Arrow Horizontal Function. Why: The coach's own arrow must stay centered on the target's own horizontal midpoint while never sliding into the coach's own rounded corners. How: This computes that midpoint relative to the coach's own left edge, clamped to a safe inset range.

// #endregion arrHorFun



// #region safBotFun

/**
 * safBotFun = Safe Bottom Function
 *
 * @summary
 * The highest screen-y a spotlight/coach can safely reach without landing
 * UNDER the floating bottom tab bar (tabPlacement 'bottom' only; the other two
 * placements do not occupy this edge, so there is nothing to clamp against and
 * this returns the viewport height, i.e. no constraint). Mirrors safTopFun's
 * own job for the opposite edge.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param void - This function takes no parameters.
 *
 * @returns The bottom tab bar's own top edge in px, or window.innerHeight when
 * there is no bottom bar.
 *
 * @example
 * ```ts
 * safBotFun() // => 812
 * ```
 *
*/

const safBotFun = () => { // What: Safe Bottom Function. Why: A bottom-anchored tab bar is the one piece of chrome that clips from the BOTTOM of the viewport instead of the top. How: This returns the bar's own top edge when present, otherwise the full viewport height.


	const barCurEle = document.querySelector( '[data-placement="bottom"] > [data-element-name-hook~="appTabNav"]' ); // What: Bar Current Element. Why: Only a bottom-placed tab bar occupies this edge at all. How: This looks up the bar element fresh on every call.



	return barCurEle ? barCurEle.getBoundingClientRect().top : window.innerHeight; // What: Safe Bottom Return. Why: The caller needs either the bar's own top edge or, when there is no bottom bar, the plain viewport height as a no-op constraint. How: This picks whichever applies.


};

// #endregion safBotFun



// #region safTopFun

/**
 * safTopFun = Safe Top Function
 *
 * @summary
 * The lowest screen-y a SPOTLIGHT/TARGET can safely sit without landing under
 * fixed/sticky Today-tab chrome: the sticky header, plus, on mobile, where the
 * groups rail flips from a side column to a horizontal pill bar stacked below
 * the header, that rail too, plus the Edit Mode banner (present whenever
 * editMode is on, at any width; see tab-today.jsx's editmode-banner, which
 * sits sticky just below the header and, despite being in normal flow, does
 * not actually push .today-layout's content down to clear it). A target
 * scrolled up underneath any of these would be genuinely HIDDEN (they are
 * sticky, so they keep painting on top of whatever scrolls beneath them), not
 * just visually crowded; this floor exists to stop that, and applies to the
 * spotlight clamp and briTarFun's own scroll-up nudge (the ACTUAL highlighted
 * element's own visibility).
 *
 * The COACH card is a different story: it renders inside .touOveDiv, a z-index
 * 1010 overlay well above any of this chrome (header, rail, and the Edit Mode
 * banner alike), so it can sit wherever it likes on screen without ever being
 * physically obscured by any of it. Passing forCoaBoo:true (all of the coach's
 * own placement math does) skips this whole exclusion zone entirely. Confirmed
 * live: on a short viewport (iPhone SE) with the header plus rail counted
 * against the coach too, several steps' tooltips had nowhere left to fit at
 * all; the Edit Mode step hits the identical problem once the banner is
 * showing.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.forCoaBoo - For Coach Boolean: True when the caller is placing
 *                          the coach card rather than a target, which returns
 *                          0. The whole options object defaults to {}, so
 *                          omitting it measures the chrome.
 *
 * @returns The lowest bottom edge in px among the sticky header, the mobile
 * group rail, and the Edit Mode banner, or 0 for the coach.
 *
 * @example
 * ```ts
 * safTopFun( { forCoaBoo : true } ) // => 0
 * ```
 *
*/

const safTopFun = ( { forCoaBoo } = {} ) => { // What: Safe Top Function. Why: Every clamp/scroll calculation below needs one shared answer for "how far down does fixed chrome reach". How: This returns 0 for the coach (forCoaBoo), otherwise the lowest bottom edge among the sticky header, the mobile group rail, and the Edit Mode banner.


	if ( forCoaBoo ) return 0; // What: Coach Exemption Guard. Why: The coach card floats in its own high z-index overlay, never physically under this chrome. How: This skips the whole exclusion zone and returns 0 whenever forCoaBoo is true.



	const heaCurEle = document.querySelector( '[data-element-name-hook~="todPagHea"]' ); // What: Header Current Element. Why: Today's own sticky header is the first, always-present piece of chrome to clamp against. How: This looks it up fresh on every call, since it may not exist outside the Today tab.
	const raiCurEle = document.querySelector( '[data-element-name-hook~="groRaiAsi"]' ); // What: Rail Current Element. Why: On mobile the group rail stacks below the header as its own row, so it needs folding into the same floor. How: This looks up the rail element fresh on every call.

	let floBotNum = heaCurEle ? heaCurEle.getBoundingClientRect().bottom : 0; // What: Floor Bottom Number. Why: This is the running "safe top" answer, widened below by whichever additional chrome is also present. How: This starts at the header's own bottom edge, or 0 when there is no header at all.


	if ( raiCurEle && getComputedStyle( raiCurEle ).flexDirection === 'row' ) { // What: Mobile Rail Guard. Why: The rail only occupies this floor when it has actually flipped to its horizontal, below-header layout. How: This checks the rail's own computed flex-direction rather than viewport width directly.


		floBotNum = Math.max( floBotNum, raiCurEle.getBoundingClientRect().bottom ); // What: Rail Bottom Fold. Why: The rail can sit lower than the header alone would suggest. How: This widens floBotNum to whichever is lower between the current value and the rail's own bottom edge.


	}



	const banCurEle = document.querySelector( '[data-element-name-hook~="ediBanDiv"]' ); // What: Banner Current Element. Why: Edit Mode's own sticky banner is a third, independently-present piece of chrome. How: This looks up the banner element fresh on every call.

	if ( banCurEle ) floBotNum = Math.max( floBotNum, banCurEle.getBoundingClientRect().bottom ); // What: Banner Bottom Fold. Why: The banner can sit lower than the header/rail alone would suggest whenever Edit Mode is on. How: This widens floBotNum to whichever is lower between the current value and the banner's own bottom edge.



	return floBotNum; // What: Safe Top Return. Why: The caller needs the single lowest chrome edge to clamp against. How: This returns the fully-folded floBotNum.


};

// #endregion safTopFun



// #region coaLayFun

/**
 * coaLayFun = Coach Layout Function
 *
 * @summary
 * Where the coach should sit relative to the (already clamped) highlight rect,
 * shared by the render function's own React-driven placement and plaTarFun's
 * imperative per-frame write, so the two can never disagree. Having both
 * matters: plaTarFun is what keeps the coach in lockstep with the highlight
 * DURING a smooth scroll (see its own comment), but React's render still needs
 * the same math for the coach's very first paint each step (before plaTarFun
 * has run at all) and as the eventual-consistency fallback once React catches
 * up.
 *
 * Below the target is preferred whenever the coach's own height plus a
 * base-step gap fits there; otherwise the coach sits a base step above it,
 * never rising past the safe top floor.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param curRecObj - Current Rect Object: The clamped highlight rect.
 * @param coaHeiNum - Coach Height Number: The coach's own latest measured
 *                    height, in px.
 * @param coaWidNum - Coach Width Number: The coach's own width, in px.
 * @param vieWidNum - Viewport Width Number: The current viewport width, in px.
 * @param vieHeiNum - Viewport Height Number: The current viewport height, in
 *                    px.
 *
 * @returns A { arrStr, left, top } layout: the arrow direction class
 * (coaCarDiv--up when below the target, coaCarDiv--down when above it) and the
 * coach's own screen position in px.
 *
 * @example
 * ```ts
 * coaLayFun( curRecObj, coaHeiNum, coaWidNum, vieWidNum, vieHeiNum )
 * // => { arrStr, left, top }
 * ```
 *
*/

const coaLayFun = ( curRecObj, coaHeiNum, coaWidNum, vieWidNum, vieHeiNum ) => { // What: Coach Layout Function. Why: This is the one shared answer for where the coach sits relative to a clamped highlight rect. How: This prefers below the target, flipping above it only once there is no room below.


	const coaLefNum = Math.max( rhyPxlFun( 'm01' ), Math.min( curRecObj.left, vieWidNum - coaWidNum - rhyPxlFun( 'm01' ) ) ); // What: Coach Left Number. Why: The coach must never sit flush against either viewport edge. How: This clamps the target's own left edge between a small-step margin and the coach's own width from the right edge. // Vertical Rhythm Base Minus 1 = 11px
	const safTopNum = safTopFun( { forCoaBoo : true } ) + rhyPxlFun( 'm01' );                                                 // What: Safe Top Number. Why: The "flip above" branch below must not let the coach rise above the coach's own exclusion floor. How: This calls safTopFun in coach mode (always 0) plus a fixed small-step margin. // Vertical Rhythm Base Minus 1 = 11px
	const spaBelNum = vieHeiNum - ( curRecObj.top + curRecObj.height );                                                       // What: Space Below Number. Why: The below/above choice needs to know how much room actually exists under the target. How: This subtracts the target's own bottom edge from the viewport's own height.
	const aboTopNum = Math.max( curRecObj.top - rhyPxlFun( 'bas' ) - coaHeiNum, safTopNum );                                  // What: Above Top Number. Why: The above placement needs its own top edge. How: This places the coach a base step above the target, clamped down to safTopNum so it never rises past the safe floor. // Vertical Rhythm Base ~= 14.572px
	const belTopNum = curRecObj.top + curRecObj.height + rhyPxlFun( 'bas' );                                                  // What: Below Top Number. Why: The below placement needs its own top edge. How: This places the coach a base step under the target's own bottom edge. // Vertical Rhythm Base ~= 14.572px


	if ( spaBelNum >= coaHeiNum + rhyPxlFun( 'bas' ) ) return { arrStr : 'coaCarDiv--up', left : coaLefNum, top : belTopNum }; // What: Below Placement Return. Why: Below is preferred whenever the coach's own height plus its base-step gap actually fits there. How: This returns the below layout with an upward-pointing arrow. // Vertical Rhythm Base ~= 14.572px



	return { arrStr : 'coaCarDiv--down', left : coaLefNum, top : aboTopNum }; // What: Above Placement Return. Why: This is the fallback once below does not fit. How: This returns the above layout with a downward-pointing arrow.


};

// #endregion coaLayFun



// #region coaWidFun

/**
 * coaWidFun = Coach Width Function
 *
 * @summary
 * The coach card's width, sized the same way as help mode's tip: the small
 * text width at the card's base body font size, plus its side padding and
 * side border, each counted twice. On a viewport too narrow for that, it
 * shrinks to the viewport less a small-step margin on each side. Shared by
 * the render function's first paint and plaTarFun's per-frame placement, so
 * the two always agree.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param vieWidNum - Viewport Width Number: The current viewport width, in px.
 *
 * @returns The coach card's width, in px.
 *
 * @example
 * ```ts
 * coaWidFun( 1440 ) // => about 272.6 at an 11px root font size
 * ```
 *
*/

const coaWidFun = ( vieWidNum ) => Math.min( rhyPxlFun( 'p10' ) + ( rhyPxlFun( 'bas' ) + rhyPxlFun( 'm12' ) ) * 2, vieWidNum - rhyPxlFun( 'm01' ) * 2 ); // What: Coach Width Function. Why: The coach card should fit its body text like help mode's tip, without outgrowing a narrow viewport. How: This takes the smaller of the text width plus padding and borders, and the viewport less its edge margins. // Vertical Rhythm Base Plus 10 ~= 242.522px, Vertical Rhythm Base ~= 14.572px, Vertical Rhythm Base Minus 12 ~= 0.499px, Vertical Rhythm Base Minus 1 = 11px

// #endregion coaWidFun



// #region todTopFun

/**
 * todTopFun = Today Top Function
 *
 * @summary
 * Shared by every tour's Skip action (both the intro modal's and, once a tour
 * is under way, the coach card's) and by a finished tour: ending a tour should
 * always land back on a pristine Today, not wherever a mid-tour tab-switch or
 * scroll happened to leave things. Exported so onboarding/welcome-tour.jsx's
 * intro-modal Skip (which fires before any GuiTouCom is even mounted) can
 * reuse the exact same behavior. The scroll reset waits one animation frame,
 * so the tab switch has committed first.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param actIdeStr - Active Identifier String: The app's own currently active
 *                    tab id.
 * @param selTabFun - Select Tab Function: Switches the app's own active tab.
 *
 * @returns This function does not return anything.
 *
 * @example
 * ```ts
 * todTopFun( actIdeStr, selTabFun ) // => void
 * ```
 *
*/

const todTopFun = ( actIdeStr, selTabFun ) => { // What: Today Top Function. Why: Every tour ending (Skip, Done, or the not-found watchdog) needs to land the user back on a pristine, top-scrolled Today. How: This switches to Today if needed, then scrolls both the app's own scroller and the window to 0.


	if ( actIdeStr !== 'today' ) selTabFun( 'today' ); // What: Today Switch Guard. Why: A tour can end from any tab, but the landing spot is always Today. How: This only calls selTabFun when the actIdeStr tab is not already Today.



	requestAnimationFrame( () => { // What: Scroll Reset Frame. Why: The tab switch above may not have committed its own layout yet on this same tick. How: This waits one animation frame before scrolling both the app's own scroller and the window.


		const maiCurEle = document.querySelector( '[data-element-name-hook~="appConMai"]' ); // What: Main Current Element. Why: The app's own scrollable content lives inside this container, separate from the window itself. How: This looks it up fresh, since it may not exist on every layout.

		if ( maiCurEle ) maiCurEle.scrollTop = 0; // What: Main Scroll Reset. Why: The app's own scroller needs resetting independently of the window. How: This zeroes maiCurEle's own scrollTop when it exists.


		window.scrollTo( 0, 0 ); // What: Window Scroll Reset. Why: On layouts where the page itself (not .main) scrolls, that needs resetting too. How: This scrolls the window to the very top-left.


	} );


};

// #endregion todTopFun

// #endregion Helpers



// #region Components

// #region GuiTouCom

/**
 * GuiTouCom = Guided Tour Component
 *
 * @summary
 * Renders the currently-running guided tour: a full-viewport dim with a single
 * spotlight cutout around the current step's target(s), plus a coach card
 * (title, body, Skip/Back/Next) positioned relative to it. Owns every mechanic
 * described in this file's own header comment (spotlight tracking, the
 * click-guard, the not-found watchdog, tab-sync, the mobile rail auto-open,
 * resume-on-reload persistence); a specific tour's own content lives entirely
 * in its steObjArr prop, authored by a caller such as
 * onboarding/welcome-tour.jsx or one of the onboarding-*-tours.jsx mini-tour
 * modules.
 *
 * Each step object in steObjArr carries these fields (every one optional
 * except bodEle, priStr, selStr, and titStr):
 *
 * - `advCliStr` (String): An optional CSS selector, independent of cirBoo:
 *   Next stays enabled and works as normal (this step narrates, it does not
 *   force the real interaction), but a real click landing on this selector is
 *   ALSO treated as clicking Next, the same priActFun call, runFun included.
 *   For a step whose body copy already tells the user "we'll do this for you,
 *   or do it yourself via the real button", the real button's own click should
 *   count as having advanced, not leave the user still needing to also click
 *   Next afterward. It should stay within (or be a subset of) selStr/cliSelStr
 *   so the generic guard does not block it as off-target.
 *
 * - `advDelNum` (Number): Optional milliseconds, only meaningful alongside
 *   cirBoo: this delays the advance by this many ms after a cirBoo step's
 *   target click, instead of the usual immediate (next-tick) advance. For a
 *   click that plays a brief, self-contained confirmation animation with a
 *   fixed duration and no lasting DOM trace to poll for (unlike advSelStr,
 *   which needs an actual target to appear), e.g. the Pickers tour's own "Add
 *   to Todo List" step, where Send to Today swaps its label to "Sent!" for a
 *   beat then reverts on its own; advancing immediately would cut that
 *   confirmation off before the user ever sees it.
 *
 * - `advSelStr` (String): An optional CSS selector, only meaningful alongside
 *   cirBoo: instead of advancing immediately after a cirBoo step's target
 *   click, this polls (every animation frame) until an element matching this
 *   selector actually appears, then advances. For a click that kicks off
 *   something ASYNC whose result IS the next step's own target, e.g. the
 *   Pickers tour's "Manual Generation" step, where clicking Pick One starts a
 *   multi-second spin animation and the Send to Today button (the next step's
 *   target) does not exist until it resolves; advancing on the usual immediate
 *   timer would move the step index forward before that target exists, so the
 *   tour would render a bare dim with no coach at all for however long the
 *   wait takes.
 *
 * - `bacBoo` (Boolean): Whether to show the Back button.
 *
 * - `bodEle` (Element): The coach card's body copy.
 *
 * - `catBoo` (Boolean): True if this step's target can be TALLER than the
 *   viewport itself (e.g. a highlighted region that is most of a mobile
 *   screen's height). The normal reserve-space logic (decResFun) only solves
 *   "does the coach fit adjacent to the target": it pads the target further
 *   down the page to make room for the coach above it, which is exactly
 *   backwards when the target is already tall enough to fill the viewport,
 *   since the padding pushes its own bottom edge past the fold instead of
 *   helping. This skips decResFun entirely and gives briTarFun a precise
 *   initial scroll target (the target starts right below where the coach will
 *   land) instead of the general pad/padBotNum math, which does not reliably
 *   land a too-tall target anywhere useful on the very first frame. The
 *   coach's own ONGOING position needs no special case at all beyond that: the
 *   normal below/above placement logic already reacts to the tracked rect
 *   (clamped to the safe viewport area, not the target's full height), so it
 *   naturally sits above the target while most of it is still below the fold,
 *   and flips to sit below it, arrow up, once the user has scrolled far enough
 *   that the target's real bottom edge comes into view with room to spare.
 *
 * - `cirBoo` (Boolean): True if this step teaches the real interface rather
 *   than narrating it: Next is disabled (with a hover/tap hint) and the step
 *   only advances when the user clicks the highlighted target itself, the same
 *   click-guard exemption that already lets a target's own click through now
 *   also triggers the primary action (runFun, then advance) instead of a
 *   no-op.
 *
 * - `cliSelStr` (String): An optional override for what counts as "on target"
 *   for the click-guard/cirBoo logic specifically (the spotlight tracking,
 *   scroll-into-view, and advSelStr's own default still key off selStr). It
 *   defaults to selStr, and is only needed when a step highlights a BIGGER box
 *   than what it actually wants clicked, e.g. the whole picker stage plus
 *   actions area with multiple buttons in it, only one of which should count.
 *   Without this, any click landing anywhere inside selStr (a disabled sibling
 *   button included, since a disabled element with pointer-events:none passes
 *   its click through to whatever is underneath, typically the highlighted
 *   container itself) would satisfy cirBoo, which is almost never what a step
 *   author actually wants from a highlight wider than its real target.
 *
 * - `cptSelStr` (String): An optional CSS selector naming element(s) whose
 *   click should reach their OWN real handler untouched: neither blocked by
 *   the click-guard nor treated as satisfying cirBoo/advCliStr, unlike
 *   cliSelStr (which ALSO counts as the step's own advancing click). For a
 *   real, repeatable action inside a cirBoo step that must stay genuinely
 *   usable without also counting as "the" advancing click, e.g. Re-roll inside
 *   the Pickers tour's Manual Generation step.
 *
 * - `priStr` (String): The primary button's label; 'Done' finishes the tour
 *   instead of advancing.
 *
 * - `pulSelStr` (String): Optional; when set, the cirBoo pulse (the
 *   .touSpoDiv--pulse CSS) only plays while this selector currently matches.
 *   Used by a selStr with a fallback alternative (e.g. a button that widens to
 *   its whole surrounding window once clicked, see the Pickers tour's own
 *   Manual Generation step) so the pulse stops the moment there is nothing
 *   left to click, instead of continuing to ping around the now-bigger,
 *   no-longer-actionable highlight. When unset, the pulse matches
 *   curSteObj.cirBoo exactly (always pulses); every other cirBoo step is
 *   unaffected.
 *
 * - `resBoo` (Boolean): Defaults to true (every Welcome Tour step qualifies,
 *   since its targets are all durable/already-rendered). Set false on a step
 *   whose target only exists because an EARLIER step's un-persisted side
 *   effect put it there (e.g. a form opened by a previous click): a reload
 *   wipes that side effect, so resuming directly into such a step would
 *   highlight nothing and just trip the not-found watchdog a few seconds
 *   later. The persisted resume checkpoint (see the Resume Persist Effect)
 *   only ever advances to a resBoo step, so a tour with a long non-resBoo tail
 *   still resumes at its last safe step instead of being knocked all the way
 *   back to the intro.
 *
 * - `rhsBoo` (Boolean): True if this step's target lives in a row that scrolls
 *   HORIZONTALLY (e.g. a tab strip), rather than being reachable through the
 *   normal vertical scroll the rest of briTarFun's own math handles (that
 *   math, and getScrFun, which only ever looks for a vertically-overflowing
 *   ancestor, has no horizontal equivalent, so a target sitting off the
 *   scrollable end of such a row would otherwise never actually come into
 *   view). This is a one-time native scrollIntoView({ inline : 'end' }) once
 *   the target is first found. It is not currently used by any step (the
 *   picker mini-tour's own "+Add" step used to need this, see buiNewFun's own
 *   comment in onboarding/picker-tours.jsx for why moving that tab to the
 *   FRONT of its strip retired it), but the flag itself stays generic for the
 *   next horizontally-scrolling row a step needs to reach into.
 *
 * - `runFun` (Function): An optional side effect fired when the primary button
 *   is clicked, before advancing/finishing (e.g. running the real generator).
 *   It is a pure side effect: which step/tab comes next is handled
 *   generically, not by runFun itself.
 *
 * - `selStr` (String): The CSS selector(s) for the element(s) to highlight
 *   (comma-separated fallbacks honored in order: finTarFun tries each in turn
 *   and uses the first that matches anything).
 *
 * - `solBoo` (Boolean): A standalone single-message tip, not a step in a
 *   sequence: this hides the "Step N of N" progress line and the Skip/Back
 *   row, and stretches the one remaining button (whatever priStr says, e.g.
 *   "Dismiss") to the full width of that row instead of pairing it against
 *   Skip/Back. Its click always finishes the tour outright regardless of the
 *   button's own label, see advSteFun's own comment for why relying on priStr
 *   === 'Done' would not work here. Built for the App Features intro tip
 *   (onboarding/app-features.jsx), but generic: any tour can use a solo step
 *   anywhere in its sequence, not just as a single-step tour.
 *
 * - `stbBoo` (Boolean): The same idea as sttBoo, inverted: true if this step's
 *   target always sits at the very bottom of its page/form (e.g. a footer
 *   button), so landing on it scrolls all the way to the end instead of
 *   nudging. This is more reliable than the pad-based nudge when the
 *   surrounding content just changed shape (a form switching sub-steps) and
 *   the carried-over scroll position no longer means anything.
 *
 * - `sttBoo` (Boolean): True if this step's target starts right at the top of
 *   the page anyway (e.g. a full-list review step), so landing on it scrolls
 *   all the way to 0 instead of just nudging the target into view.
 *
 * - `tabStr` (String): Which app tab this step's target lives on. The tour
 *   switches there automatically whenever the active tab does not already
 *   match: this covers ordinary advancing and a resume (there is no "previous
 *   step" to have navigated there on a resume), plus going back, so step
 *   authors never call selTabFun themselves.
 *
 * - `titStr` (String): The coach card's heading copy.
 *
 * @author z4nta0 <https://github.com/z4nta0>
 *
 * @param props.actIdeStr   - Active Identifier String: The app's own currently
 *                            active tab id, the same app plumbing every tab
 *                            already gets.
 * @param props.actStoObj   - Action Store Object: The shared app actions
 *                            object, the same app plumbing every tab already
 *                            gets.
 * @param props.onBacTouFun - On Back Tour Function: Optional (targetStepIndex)
 *                            => void, side effects to run before navigating
 *                            back to a given step (e.g. undoing something a
 *                            later step did). It is called before the step
 *                            actually changes.
 * @param props.onFinTouFun - On Finish Tour Function: Called on genuine
 *                            completion only (the primary button on a step
 *                            whose priStr is 'Done'), after this component's
 *                            own cleanup (activeTour, the bus's phase, the
 *                            body class) has already run.
 * @param props.onSkiTouFun - On Skip Tour Function: Called for everything else
 *                            the tour can end from: the Skip button, a target
 *                            that never resolves (the not-found watchdog), or
 *                            a resumed/advanced step index past the end of
 *                            steObjArr. Optional; omit it to route all of
 *                            these through onFinTouFun instead, for a tour
 *                            with nothing tracking the distinction (e.g. the
 *                            Welcome Tour).
 * @param props.resSteNum   - Resume Step Number: The initial step index. The
 *                            caller decides whether/what to resume (e.g.
 *                            gating on its own intro-modal state); this
 *                            component never reads activeTour itself, only
 *                            writes it going forward.
 * @param props.selTabFun   - Select Tab Function: Switches the app's own
 *                            active tab, the same app plumbing every tab
 *                            already gets.
 * @param props.steObjArr   - Step Object Array: The tour's own steps, each
 *                            shaped as described above.
 * @param props.touIdeStr   - Tour Identifier String: This tour's slot key in
 *                            state.onboarding.activeTour, e.g. 'welcome'. The
 *                            ONLY thing enforcing "one guided tour at a time"
 *                            is that only one GuiTouCom is ever mounted at
 *                            once; touIdeStr just labels whichever one that is
 *                            for persistence.
 *
 * @returns The tour's own dim/spotlight/coach overlay, portaled onto
 * document.body.
 *
 * @example
 * ```tsx
 * GuiTouCom({ actIdeStr, actStoObj, onBacTouFun, onFinTouFun, ... })
 * // => <GuiTouCom />
 * ```
 *
*/

function GuiTouCom ( { actIdeStr, actStoObj, onBacTouFun, onFinTouFun, onSkiTouFun, resSteNum, selTabFun, steObjArr, touIdeStr } ) {


	// #region State, Refs And Coach Height Tracking

	const { draActBoo }               = useEmlTouFun();                   // What: Drag Active Boolean. Why: Published by tab-today.jsx's group/item drag handlers for the duration of a reorder gesture, since the coach card can sit right over whatever is being dragged. How: This reads the shared bus's own draActBoo field; only the coach hides while it is true, the spotlight/dim stay so the highlighted target is still visible to drop onto.
	const [ curSteNum, setCurSteNum ] = React.useState( resSteNum || 0 ); // What: Current Step Number And Setter. Why: This is the tour's own live position in `steObjArr`. How: This starts at resSteNum (or 0), then only setCurSteNum ever advances/rewinds it.
	const [ curRecObj, setCurRecObj ] = React.useState( null );           // What: Current Rect Object And Setter. Why: The render function needs the current step's own clamped highlight rect to position the spotlight and coach. How: This starts null (nothing to show yet) and is written by the position-tracking effect below.
	const [ resTopNum, setResTopNum ] = React.useState( 0 );              // What: Reserve Top Number And Setter. Why: Extra top-space (px) reserved above the Today list when the current step's highlight is too tall for the coach to fit above or below it. How: This is published on the bus (see the effect below) so TabTodCom can push its list content down by this amount instead of the coach card overlaying part of what is highlighted; driven by rect/viewport math, not any specific step, so any future tour step with a too-tall highlight gets this automatically.
	const [ coaHeiNum, setCoaHeiNum ] = React.useState( COA_HEI_NUM );    // What: Coach Height Number And Setter. Why: COA_HEI_NUM is only a rough estimate; a step with longer body text renders taller than it, and using the stale estimate for the "place above" branch made a long step's coach overlap the top of its own target instead of sitting flush above it. How: This starts at the rough estimate and is corrected once the real coach has been measured by the layout effect below.

	const spoEleRef = React.useRef( null );      // What: Spotlight Element Reference. Why: The spotlight is positioned imperatively every frame (no React lag) rather than through React state alone. How: This is attached to the rendered touSpoDiv div below.
	const meaCoaRef = React.useRef( null );      // What: Measure Coach Reference. Why: A hidden, off-screen coach clone needs a handle so its real rendered height can be measured. How: This is attached to the hidden measurer JSX below.
	const reaCoaRef = React.useRef( null );      // What: Real Coach Reference. Why: The real, visible coach is also positioned imperatively every frame, same as the spotlight. How: This is attached to the rendered .coaCarDiv div below and written to by plaTarFun.
	const coaHeiRef = React.useRef( coaHeiNum ); // What: Coach Height Reference. Why: The position-tracking effect below reads this ref rather than coaHeiNum directly, since that effect's own deps are [curSteNum, curSteObj.selStr]: whenever React re-renders without those changing (exactly what happens right after the layout effect below corrects coaHeiNum for a step whose coach differs in height from the one before it), React reuses that effect's ORIGINAL closure rather than the fresher one, permanently freezing whatever coaHeiNum was still stale at that render. How: This is written to on every render, so decResFun always reads the latest measured height regardless of which closure is still live; most visible navigating Back into a step whose coach is taller than the one it is coming from.

	coaHeiRef.current = coaHeiNum; // What: Coach Height Reference Sync. Why: This must happen on every render, not just inside an effect, so the very next synchronous read (even before any effect runs) already sees the latest value. How: This assigns coaHeiNum straight into coaHeiRef.current.



	React.useLayoutEffect( () => { // What: Coach Measure Effect. Why: The hidden measurer's real rendered height is only known after paint, and only needs feeding back into state when it actually changed. How: This runs after every render (no deps) but only calls setCoaHeiNum when the measured height differs, so it settles instead of looping.


		const meaHeiNum = meaCoaRef.current && meaCoaRef.current.offsetHeight; // What: Measured Height Number. Why: The hidden clone's own offsetHeight is the real, current height for whatever step is now showing. How: This reads meaCoaRef.current's own offsetHeight, or a falsy value when the ref is not yet attached.


		if ( meaHeiNum && meaHeiNum !== coaHeiNum ) setCoaHeiNum( meaHeiNum ); // What: Coach Height Commit. Why: Only a genuine change should trigger another render. How: This calls setCoaHeiNum only when meaHeiNum is truthy and differs from the current coaHeiNum.


	} );

	// #endregion State, Refs And Coach Height Tracking



	// #region Bus And Resume Publishing Effects

	React.useEffect( () => { // What: Bus Phase Effect. Why: Other tabs read bus.touPhaStr === 'tour' to know a guided tour of SOME kind is active, without caring which one (e.g. tab-today.jsx's own empty-state gating, app.jsx's rail sync). How: This is published for the duration this component is mounted and cleared back to 'off' on unmount, however that happens.


		emlTouObj.set( { touPhaStr : 'tour' } ); // What: Phase Publish. Why: Every other module gating on "is any tour running" needs this flipped on the instant this component mounts. How: This writes touPhaStr : 'tour' onto the shared bus.



		return () => { emlTouObj.set( { resTopNum : 0, touPhaStr : 'off' } ); }; // What: Phase Cleanup Return. Why: resTopNum is republished continuously while mounted (see the effect below), but nothing else clears it on unmount, so the last step's value would otherwise linger on the bus forever, permanently padding Today's list even after the tour is long over. How: This resets both touPhaStr and resTopNum back to their off/idle values.


	}, [] ); // What: Effect Dependency Array. Why: This mount/unmount publish should only ever run once for this component's own lifetime. How: An empty array means there is no dependency that could ever change to trigger a re-run.



	React.useEffect( () => { emlTouObj.set( { touSteNum : curSteNum } ); }, [ curSteNum ] ); // What: Step Publish Effect. Why: Other modules read bus.touSteNum to gate behavior on a specific step index (e.g. onboarding/app-features.jsx). How: This republishes the touSteNum field whenever curSteNum changes. // What: Effect Dependency Array. Why: This must re-run whenever curSteNum itself changes. How: curSteNum is the exact value being published.


	React.useEffect( () => { emlTouObj.set( { touIdeStr : touIdeStr } ); }, [ touIdeStr ] ); // What: Tour Identifier Publish Effect. Why: This lets a consumer that needs to act only during a SPECIFIC tour's specific step (not just "some tour is up") tell them apart, e.g. tab-picker.jsx disabling its own "Add New Picker" button only during the Pickers page tour's own Step 4, not any other tour that happens to pass through the same step index. How: This is never cleared on unmount (like `touSteNum` itself is not), since every consumer already gates on touPhaStr === 'tour' too, which IS cleared, so a stale touIdeStr left over from the last tour can never be read as still current. // What: Effect Dependency Array. Why: This must re-run whenever the touIdeStr prop itself changes. How: touIdeStr is the exact value being published.


	React.useEffect( () => { emlTouObj.set( { resTopNum : resTopNum } ); }, [ resTopNum ] ); // What: Reserve Top Publish Effect. Why: This is published on the bus so the active tab (which owns the actual scrollable content) can apply it, since this component only overlays the page and does not own that layout. How: resTopNum itself is set by the position-tracking effect below, decided ONCE per step rather than continuously, see the comment on decResFun there for why. // What: Effect Dependency Array. Why: This must re-run whenever resTopNum itself changes. How: resTopNum is the exact value being published.



	React.useEffect( () => { // What: Resume Persist Effect. Why: A reload should be able to resume this tour from wherever it left off; the caller is responsible for reading state.onboarding.activeTour back out as resSteNum on mount, and for only ever mounting one GuiTouCom at a time. How: This only actually persists a step marked resBoo (default true, see that field's own doc comment above), so a reload always resumes at the latest SAFE step rather than a step whose target only exists because of an earlier, un-persisted side effect.


		if ( steObjArr[ curSteNum ] && steObjArr[ curSteNum ].resBoo === false ) return; // What: Non-Resumable Guard. Why: Landing on a non-resBoo step, forward or back, must leave the last persisted checkpoint alone. How: This bails out before writing anything whenever the current step explicitly opts out.



		actStoObj.setOnbFun( { activeTour : { id : touIdeStr, step : curSteNum } } ); // What: Checkpoint Write. Why: This is the actual persisted resume checkpoint a future mount reads back as resSteNum. How: This writes the tour's own id alongside the literal step field, both required by the shared activeTour shape.


	}, [ curSteNum ] ); // What: Effect Dependency Array. Why: A new checkpoint only needs writing when the step index itself has actually moved. How: curSteNum is the value gating whether this step should be persisted at all.

	// #endregion Bus And Resume Publishing Effects



	React.useEffect( () => { // What: Touring Body Attribute Effect. Why: While a tour runs, the scrollable content needs padding so bottom-anchored targets can scroll clear of the floating tab bar. How: This sets a body attribute on mount and removes it on unmount.


		document.body.setAttribute( 'data-tour-active', '' ); // What: Tour Active Attribute Set. Why: The global stylesheet sets the tabs' bottom padding property under this attribute. How: This adds the presence-only data-tour-active attribute to document.body.



		return () => document.body.removeAttribute( 'data-tour-active' ); // What: Tour Active Cleanup Return. Why: The padding must not linger once the tour is over, however it ends. How: This returns a cleanup that removes the same attribute.


	}, [] ); // What: Effect Dependency Array. Why: This attribute should only ever be set once for this component's own mounted lifetime. How: An empty array means there is no dependency that could ever change to trigger a re-run.



	// #region Current Step Sync

	const curSteObj = steObjArr[ curSteNum ] || null; // What: Current Step Object. Why: A resumed step index that no longer exists (e.g. a stale activeTour left over from before this tour's step count changed) must read as undefined rather than throw, and the position-tracking effect below bails out to skiTouFun the moment it sees a falsy value here. How: This reads steObjArr at curSteNum, falling back to null.



	React.useEffect( () => { // What: Tab Sync Effect. Why: Whichever tab a step's target lives on is load-bearing for a resume (there is no previous step to have navigated there) and, since steps never call selTabFun themselves, this is the ONLY thing that switches tabs at all, forward, back, or resuming alike.


		if ( curSteObj && curSteObj.tabStr && actIdeStr !== curSteObj.tabStr ) selTabFun( curSteObj.tabStr ); // What: Tab Switch. Why: The step's own target may live on a different tab than whatever is currently active. How: This only calls selTabFun when the current step names a tab and it does not already match.


	}, [ curSteNum ] ); // What: Effect Dependency Array. Why: This should re-check whenever the step index moves, since a different step can name a different tab. How: curSteNum is what curSteObj itself is derived from.



	React.useEffect( () => { // What: Rail Open Publish Effect. Why: On tabPlacement 'side', the rail collapses to an off-canvas drawer on small screens (App owns the actual open/close state via its own subscription to this same field), and a step targeting a nav button would otherwise never find it there.


		emlTouObj.set( { wanRaiBoo : !!( curSteObj && curSteObj.selStr.includes( '[data-tab=' ) ) } ); // What: Rail Open Publish. Why: This is published unconditionally, not just when opening, so it also closes the drawer again once the tour moves to a step that does not need it, rather than leaving it open to cover a content target. How: This is a no-op at desktop widths, where the rail is never collapsed to begin with, and is keyed off the selector string itself (not resolved elements), since resolving would need the rail already open, which is exactly what this is for.


	}, [ curSteNum ] ); // What: Effect Dependency Array. Why: This should republish whenever the step index moves, since a different step's own selector decides the answer. How: curSteNum is what curSteObj itself is derived from.

	// #endregion Current Step Sync



	// #region Target Resolution And Rect Math Helpers

	// #region finTarFun

	/**
	 * finTarFun = Find Targets Function
	 *
	 * @summary
	 * Resolves a step selector to the visible elements it matches. The selector's
	 * comma-separated alternatives are tried in order, and the first one matching
	 * at least one element with a real, non-zero rect wins, so a display:none
	 * half of a responsive pair never beats the visible half. Every element that
	 * winning alternative matches is returned, which lets one step spotlight
	 * several elements as a single combined highlight.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param selStr - Selector String: A step's own selector field (selStr,
	 *                 cliSelStr, cptSelStr, advCliStr, or advSelStr),
	 *                 comma-separated alternatives allowed.
	 *
	 * @returns The visible elements the first matching alternative found, or an
	 * empty array when no alternative matched anything.
	 * @see {@link curEleArr}
	 *
	 * @example
	 * ```ts
	 * finTarFun( curSteObj.selStr ) // => [ curIteEle, ... ]
	 * ```
	 *
	*/

	const finTarFun = ( selStr ) => { // What: Find Targets Function. Why: Every element a step's selector matches needs resolving, honoring selector ORDER (comma-separated fallbacks), so a step can spotlight more than one element (e.g. "the whole list") as a single combined highlight. How: This filters out zero-rect (CSS display:none) elements before checking emptiness, since some responsive pairs (e.g. the sidebar vs. footer Edit Mode button) both exist in the DOM at every width, only swapping which one is display:none via a container query, unlike .ob-generate/.gen-confirm's conditional-render swap; without this, the first alternative in a fallback list would always win even when it is the hidden one.


		for ( const oneSelStr of splSelFun( selStr ) ) { // What: Selector Alternative Loop. Why: Each comma-separated alternative must be tried in order until one actually matches something visible. How: This walks selStr's own alternatives left to right.


			const curEleArr = [ ...document.querySelectorAll( oneSelStr ) ].filter( ( curIteEle ) => { // What: Current Element Array. Why: Every element matching this one alternative needs collecting before it can be filtered down to visible ones. How: This spreads the live NodeList from querySelectorAll into a plain array, then keeps only the elements the visibility filter below accepts.


				const eleRecObj = curIteEle.getBoundingClientRect(); // What: Element Rect Object. Why: The visibility check below needs this element's own on-screen size. How: This reads curIteEle's own bounding rect.



				return eleRecObj.width > 0 || eleRecObj.height > 0; // What: Visibility Filter Return. Why: A matched element that is display:none or otherwise zero-sized should never count as a real, clickable target. How: This keeps only elements whose own bounding rect has a real width or height.


			} );


			if ( curEleArr.length ) return curEleArr; // What: First Match Return. Why: An earlier alternative that actually matched something wins over a later one. How: This returns as soon as this alternative's own filtered array is non-empty.


		}



		return []; // What: No Match Return. Why: The caller always needs an array back, even when nothing matched at all. How: This returns an empty array once every alternative has been tried.


	};

	// #endregion finTarFun



	// #region cliHorFun

	/**
	 * cliHorFun = Clip Horizontal Function
	 *
	 * @summary
	 * Clips an element's rect horizontally against the element itself and every
	 * ancestor that clips its own overflow-x, so the part of an element scrolled
	 * past the edge of a scrollable row never counts toward a highlight. Without
	 * this, a step matching several items in the same scrollable row would union
	 * in the ones scrolled out of view, stretching the highlight into empty space
	 * past the row's own edge. It is deliberately horizontal-only, since
	 * briTarFun's own scroll already settles the vertical case, and clipping
	 * vertically too would fight that scroll while it runs.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param curRecObj - Current Rect Object: The element's own bounding rect,
	 *                    straight from getBoundingClientRect().
	 * @param curTarEle - Current Target Element: The element that rect belongs
	 *                    to, whose own overflow and ancestors are checked.
	 *
	 * @returns A plain { bottom, left, right, top } rect, or null once the
	 * element is clipped away entirely.
	 *
	 * @example
	 * ```ts
	 * cliHorFun( curIteEle.getBoundingClientRect(), curIteEle ) // => rect
	 * ```
	 *
	*/

	const cliHorFun = ( curRecObj, curTarEle ) => { // What: Clip Horizontal Overflow Function. Why: Clamps a rect's left/right against every ancestor that horizontally clips its own overflow (overflow-x auto/scroll/hidden, e.g. the Pickers page's Group/Show rows), since an element scrolled past the edge of one of these still has a real, full-width getBoundingClientRect() even though none of it is actually visible there. How: Without this, a step whose selector matches several items in the SAME scrollable row (e.g. "every picker tab") would union in whichever ones happen to be scrolled out of view, stretching the highlight into the empty space past the row's own clipped edge; deliberately horizontal-only, since briTarFun's own scroll-to-target already settles the VERTICAL case before this ever runs steady-state, and clipping vertically too would fight that during the brief transient scroll itself. Returns null once the element ends up fully clipped away.


		const cliTopNum = curRecObj.top;    // What: Clip Top Number. Why: This copies top out into a plain number up front rather than spreading curRecObj itself (a DOMRect), since DOMRect's fields are getters on its prototype, not its own enumerable properties, so a spread would silently drop every field this function does not explicitly set, poisoning every later Math.min/max call downstream with NaN. How: This starts as a plain copy of curRecObj's own top.
		const cliBotNum = curRecObj.bottom; // What: Clip Bottom Number. Why: Same reasoning as cliTopNum above, for the bottom edge. How: This starts as a plain copy of curRecObj's own bottom.

		let cliLefNum = curRecObj.left;  // What: Clip Left Number. Why: Same reasoning as cliTopNum above, for the left edge. How: This starts as a plain copy of curRecObj's own left.
		let cliRigNum = curRecObj.right; // What: Clip Right Number. Why: Same reasoning as cliTopNum above, for the right edge. How: This starts as a plain copy of curRecObj's own right.

		const ownOveStr = getComputedStyle( curTarEle ).overflowX; // What: Own Overflow String. Why: A step whose selector matches the scrollable row ITSELF as one element (e.g. the Stats tour's Range row) rather than several children inside it needs its own overflow-x checked too, since only inspecting ancestors below would miss that case. How: This reads curTarEle's own computed overflow-x style.


		if ( ( ownOveStr === 'auto' || ownOveStr === 'scroll' || ownOveStr === 'hidden' ) && curTarEle.clientWidth < ( cliRigNum - cliLefNum ) - 2 ) { // What: Self Overflow Guard. Why: clientWidth reflects what is actually rendered/visible regardless of a too-wide getBoundingClientRect() (seen on some engine/layout combinations even with min-width:0 set); only clamps if it is meaningfully narrower than the raw rect, so a normal thin border does not shave a couple pixels off every ordinary highlight. How: This checks ownOveStr against the 3 CSS values that actually clip content, plus a 2px tolerance against float rounding.


			cliRigNum = cliLefNum + curTarEle.clientWidth; // What: Right Clamp. Why: The right edge must stop at what is actually visible, not the full scrollable content width. How: This rebuilds cliRigNum from cliLefNum plus curTarEle's own clientWidth.


		}



		let ancCurEle = curTarEle.parentElement; // What: Ancestor Current Element And Walker. Why: A target nested inside a DIFFERENT scrollable ancestor also needs clipping against that ancestor's own visible bounds. How: This starts at curTarEle's own parent and is reassigned by the loop below.


		while ( ancCurEle && ancCurEle !== document.body ) { // What: Ancestor Walk Loop. Why: Every scrollable ancestor between curTarEle and the document body can further clip the working rect. How: This walks upward one parentElement at a time until it reaches document.body or runs out of ancestors.


			const ancOveStr = getComputedStyle( ancCurEle ).overflowX; // What: Ancestor Overflow String. Why: Only a genuinely scrollable ancestor should clip anything. How: This reads ancCurEle's own computed overflow-x style.


			if ( ancOveStr === 'auto' || ancOveStr === 'scroll' || ancOveStr === 'hidden' ) { // What: Ancestor Overflow Guard. Why: A non-scrolling ancestor (the common case) has nothing to clip against. How: This checks ancOveStr against the 3 CSS values that actually clip content.


				const ancRecObj = ancCurEle.getBoundingClientRect(); // What: Ancestor Rect Object. Why: The clamp below needs the ancestor's own real on-screen bounds. How: This reads ancCurEle's own bounding rect.

				cliLefNum = Math.max( cliLefNum, ancRecObj.left );  // What: Left Clamp. Why: The working rect must never extend past this ancestor's own visible left edge. How: This narrows cliLefNum to whichever is further right between the working rect and ancRecObj.
				cliRigNum = Math.min( cliRigNum, ancRecObj.right ); // What: Right Clamp. Why: The working rect must never extend past this ancestor's own visible right edge. How: This narrows cliRigNum to whichever is further left between the working rect and ancRecObj.



				if ( cliRigNum <= cliLefNum ) return null; // What: Fully Clipped Guard. Why: An element scrolled entirely out of this ancestor's visible bounds is not a real, clickable target at all. How: This returns null once the clamped width collapses to zero or less.


			}



			ancCurEle = ancCurEle.parentElement; // What: Ancestor Advance. Why: The walk must keep climbing toward the document body. How: This reassigns ancCurEle to its own parentElement for the next loop iteration.


		}



		return { bottom : cliBotNum, left : cliLefNum, right : cliRigNum, top : cliTopNum }; // What: Clipped Rect Return. Why: The caller needs the final, fully-clamped rect back. How: This builds the { top, left, right, bottom } shape every other rect helper below expects.


	};

	// #endregion cliHorFun



	// #region uniRecFun

	/**
	 * uniRecFun = Union Rect Function
	 *
	 * @summary
	 * Builds the single bounding box that encloses every matched element, the
	 * rect every highlight and coach placement is measured against. Each
	 * element's own rect is passed through cliHorFun first, so a scrolled-away
	 * portion of any one of them never stretches the union, and an element
	 * clipped away entirely contributes nothing at all.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param curEleArr - Current Element Array: The elements finTarFun matched
	 *                    for the current step.
	 *
	 * @returns A { bottom, height, left, right, top, width } rect, using the same
	 * edge names a DOMRect does.
	 *
	 * @example
	 * ```ts
	 * uniRecFun( curEleArr ) // => rect
	 * ```
	 *
	*/

	const uniRecFun = ( curEleArr ) => { // What: Union Rect Function. Why: This is the bounding box that encloses every matched element. How: Each element's own rect is first passed through cliHorFun so a scrolled-away portion of any one of them never stretches the union into empty space.


		let uniTopNum = Infinity;  // What: Union Top Number. Why: The union's own top edge must start from a value any real rect will immediately beat. How: This starts at Infinity before the loop below narrows it.
		let uniLefNum = Infinity;  // What: Union Left Number. Why: Same reasoning as uniTopNum above, for the left edge. How: This starts at Infinity before the loop below narrows it.
		let uniRigNum = -Infinity; // What: Union Right Number. Why: Same reasoning as uniTopNum above, for the right edge, widening instead of narrowing. How: This starts at -Infinity before the loop below widens it.
		let uniBotNum = -Infinity; // What: Union Bottom Number. Why: Same reasoning as uniTopNum above, for the bottom edge, widening instead of narrowing. How: This starts at -Infinity before the loop below widens it.



		curEleArr.forEach( ( curIteEle ) => { // What: Element Union Loop. Why: Every matched element contributes to the overall union. How: This walks curEleArr, folding each element's own clipped rect into the accumulator numbers above.


			const cliRecObj = cliHorFun( curIteEle.getBoundingClientRect(), curIteEle ); // What: Clipped Rect Object. Why: A scrolled-away portion of this element must not stretch the union. How: This runs curIteEle's own bounding rect through cliHorFun.


			if ( !cliRecObj ) return; // What: Fully Clipped Guard. Why: An element clipped away entirely contributes nothing to the union. How: This skips the rest of this iteration when cliHorFun returned null.



			uniTopNum = Math.min( uniTopNum, cliRecObj.top );    // What: Top Fold. Why: The union's own top edge is whichever top is furthest up among every element seen so far. How: This narrows uniTopNum to the smaller of the running value and this element's own top.
			uniLefNum = Math.min( uniLefNum, cliRecObj.left );   // What: Left Fold. Why: The union's own left edge is whichever left is furthest out among every element seen so far. How: This narrows uniLefNum to the smaller of the running value and this element's own left.
			uniRigNum = Math.max( uniRigNum, cliRecObj.right );  // What: Right Fold. Why: The union's own right edge is whichever right is furthest out among every element seen so far. How: This widens uniRigNum to the larger of the running value and this element's own right.
			uniBotNum = Math.max( uniBotNum, cliRecObj.bottom ); // What: Bottom Fold. Why: The union's own bottom edge is whichever bottom is furthest down among every element seen so far. How: This widens uniBotNum to the larger of the running value and this element's own bottom.


		} );



		return { // What: Union Rect Return. Why: The caller needs the final unioned rect back, including its own derived width/height, the same edge names a DOMRect uses so either one can be passed to the rect helpers. How: This builds the shape every other rect helper below expects.


			bottom : uniBotNum,             // What: Bottom. Why: This is the union's own bottom edge. How: This is the widest bottom any element reached.
			height : uniBotNum - uniTopNum, // What: Height. Why: Callers size the spotlight from this. How: This is derived from the union's own top and bottom edges.
			left   : uniLefNum,             // What: Left. Why: This is the union's own left edge. How: This is the furthest-out left any element reached.
			right  : uniRigNum,             // What: Right. Why: This is the union's own right edge. How: This is the furthest-out right any element reached.
			top    : uniTopNum,             // What: Top. Why: This is the union's own top edge. How: This is the furthest-up top any element reached.
			width  : uniRigNum - uniLefNum  // What: Width. Why: Callers size the spotlight from this. How: This is derived from the union's own left and right edges.


		};


	};

	// #endregion uniRecFun

	// #endregion Target Resolution And Rect Math Helpers



	// #region Click Guard Machinery

	const curSteRef = React.useRef( curSteObj ); // What: Current Step Reference. Why: Blocking every click during a tour except the coach card and the current step's own highlighted target(s) needs a listener that only needs to exist for as long as this component is mounted, without re-attaching per step. How: This is read fresh on every click rather than closed over stale, since curSteObj is re-evaluated fresh on every render.

	curSteRef.current = curSteObj; // What: Current Step Reference Sync. Why: The click-guard effect below reads this ref on every real click, so it must always reflect the LATEST render's curSteObj, not a stale closure. How: This assigns curSteObj into curSteRef.current on every render.



	const steNumRef = React.useRef( curSteNum ); // What: Step Number Reference. Why: This mirrors curSteRef, but for the raw step NUMBER rather than the step object, used by priActFun's own advSelStr poll below, which needs to notice a step change made for some OTHER reason (Back, Skip) while it was still waiting. How: curSteObj itself is not reliable for that same check, since steps are rebuilt as fresh objects on every render, so curSteRef.current would read as "changed" on the very next unrelated re-render even when the step index never actually moved.

	steNumRef.current = curSteNum; // What: Step Number Reference Sync. Why: This must always reflect the LATEST render's curSteNum. How: This assigns curSteNum into steNumRef.current on every render.



	const mouStaRef = React.useRef( true ); // What: Mounted State Reference. Why: This lets the advSelStr poll (and anything else scheduling a callback beyond this render's own lifetime) notice this component has actually unmounted and stop, rather than firing a state update into the void. How: This starts true and is flipped false by the unmount effect right below.

	React.useEffect( () => () => { mouStaRef.current = false; }, [] ); // What: Mounted State Cleanup Effect. Why: The flip must happen exactly once, on this component's own real unmount. How: This returns a cleanup closure with no dependency that could ever re-run it early.



	const priActRef = React.useRef( () => {} ); // What: Primary Action Reference. Why: Same lazy-ref pattern as curSteRef: priActFun below closes over curSteNum/curSteObj/finTouFun, all of which change every render, but the click-guard effect below is only ever set up once. How: This starts as a no-op and is overwritten with the latest priActFun at the end of every render.
	const supGuaRef = React.useRef( false );    // What: Suppress Guard Reference. Why: This lets bacSteFun's/skiTouFun's own side effects click through the guard below, e.g. a picker mini-tour's onBacTouFun simulating a click on the create-form's own "Details" step tab to undo a later step's "Add Items" click. How: That synthetic click is not the step's own target (curSteRef still points at the step being left, since onBacTouFun runs before the step index actually changes), so without this the guard would block onBacTouFun from doing anything at all; the exact clicks meant to fix the page up before navigating back are the ones most likely to look like "not the current target" to it.



	// #region isaPasFun

	/**
	 * isaPasFun = Is-A Pass-Through Function
	 *
	 * @summary
	 * Reports whether a click lands on one of the current step's own cptSelStr
	 * elements. A pass-through click reaches its own real handler untouched: the
	 * click-guard neither blocks it nor treats it as the step's advancing click,
	 * unlike cliSelStr. Built for App Features' own manual-pick tour, where
	 * Re-roll must stay genuinely usable without also counting as the step's own
	 * click.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param cliEveObj - Click Event Object: The mousedown or click event being
	 *                    guarded.
	 *
	 * @returns True when the live step names a cptSelStr and one of its elements
	 * contains the event's own target.
	 *
	 * @example
	 * ```ts
	 * isaPasFun( cliEveObj ) // => false
	 * ```
	 *
	*/

	const isaPasFun = ( cliEveObj ) => { // What: Is-A Pass-Through Function. Why: A step's optional cptSelStr names element(s) that should reach their OWN real click handler normally, unlike cliSelStr (which ALSO satisfies cirBoo and advances the tour): a pass-through click does neither, it is neither blocked nor treated as "the" action. How: This checks whether cliEveObj's own target sits inside any element matched by the current step's own cptSelStr; built for App Features' own manual-pick tour, where Re-roll needs to stay genuinely usable (a real re-roll, its own animation) without also counting as the step's advancing click the way clicking Send to Today does.


		const livSteObj = curSteRef.current; // What: Live Step Object. Why: The freshest step object must be read off the ref, not a stale render closure. How: This reads curSteRef.current directly.



		return !!( livSteObj && livSteObj.cptSelStr && finTarFun( livSteObj.cptSelStr ).some( ( curIteEle ) => curIteEle.contains( cliEveObj.target ) ) ); // What: Pass-Through Check Return. Why: The caller needs a plain boolean answer. How: This checks that a live step exists, that it names a cptSelStr, and that one of its matched elements contains the event's own target.


	};

	// #endregion isaPasFun



	// #region isaOffFun

	/**
	 * isaOffFun = Is-An Off Function
	 *
	 * @summary
	 * Reports whether a mousedown or click lands off the current step's own
	 * target, the check both of those guard listeners share. A click is never
	 * off-target while the guard is suppressed for a caller's own synthetic
	 * clicks, when it lands inside the coach card, or when it is a pass-through
	 * click (see isaPasFun); otherwise it is off-target unless it lands inside an
	 * element the step's own cliSelStr (or selStr) matches.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param cliEveObj - Click Event Object: The mousedown or click event being
	 *                    guarded.
	 *
	 * @returns True when the event should be blocked as off-target.
	 *
	 * @example
	 * ```ts
	 * isaOffFun( cliEveObj ) // => true
	 * ```
	 *
	*/

	const isaOffFun = ( cliEveObj ) => { // What: Is-An Off Function. Why: This is the off-target check shared by both the mousedown and click capture listeners below. How: This exempts the suppressed state, a click inside the coach card itself, and a pass-through click, then checks the current step's own cliSelStr (or selStr) for everything else.


		if ( supGuaRef.current ) return false; // What: Suppression Guard. Why: A caller-driven synthetic click must never itself be read as off-target. How: This returns false immediately whenever supGuaRef.current is true.



		if ( cliEveObj.target.closest( '[data-element-name-hook~="coaCarDiv"]' ) ) return false; // What: Coach Exemption Guard. Why: A click anywhere inside the coach card (Skip/Back/Next, or just its own body text) is always legitimate. How: This returns false whenever the event's own target has a .coaCarDiv ancestor.



		if ( isaPasFun( cliEveObj ) ) return false; // What: Pass-Through Exemption Guard. Why: A pass-through click is neither blocked nor treated as the step's own action. How: This defers to isaPasFun's own check.



		const livSteObj = curSteRef.current; // What: Live Step Object. Why: The freshest step object must be read off the ref, not a stale render closure. How: This reads curSteRef.current directly.


		return !( livSteObj && finTarFun( livSteObj.cliSelStr || livSteObj.selStr ).some( ( curIteEle ) => curIteEle.contains( cliEveObj.target ) ) ); // What: Off-Target Check Return. Why: The caller needs a plain boolean answer. How: This is true whenever there is no live step, or the event's own target does not sit inside any element the step's own cliSelStr/selStr currently matches.


	};

	// #endregion isaOffFun



	React.useEffect( () => { // What: Click Guard Setup Effect. Why: Every click during a tour must be blocked except the coach card and the current step's own highlighted target(s), otherwise the user could click straight through the dim to whatever is actually underneath (delete a picker, jump to an unrelated tab, etc.) and desync the tour from the real app state. How: This attaches 3 capture-phase document listeners once for this component's own mounted lifetime and tears them down on unmount.


		const dowGuaFun = ( dowEveObj ) => { // What: Mousedown Guard Function. Why: A focused real input (e.g. a step's own rename field) blurs the instant *mousedown* fires on whatever it lands on, the browser's own default focus-transfer running before the 'click' event below ever gets a chance to block anything, and that is not tied to whether the click goes on to do anything at all, it fires just from clicking a focusable element. How: preventDefault on mousedown itself is what suppresses the browser's own default focus transfer (a well-worn trick for toolbar buttons that should not steal focus from a text field), stopped here for exactly the same off-target elements the click guard blocks, so an in-progress edit stays focused and open until the user genuinely interacts with this step's own target; that blur can otherwise cascade into real app state changes (e.g. GroupHeader committing a rename on blur) the click-guard alone was never in a position to stop, and the step's own target can vanish from the DOM as a result, which reads as the tour randomly dying a moment after a click that "did nothing" visible.


			if ( !isaOffFun( dowEveObj ) ) return; // What: On-Target Guard. Why: A click landing on the legitimate target/coach must never be interfered with. How: This bails out whenever isaOffFun reports false.



			dowEveObj.preventDefault();  // What: Default Prevention. Why: This is what actually stops the browser's own focus transfer. How: This calls preventDefault on the mousedown event.
			dowEveObj.stopPropagation(); // What: Propagation Stop. Why: The click that would otherwise follow this mousedown must also be kept from reaching whatever it landed on. How: This calls stopPropagation on the mousedown event.


		};



		const cliGuaFun = ( cliEveObj ) => { // What: Click Guard Function. Why: This is the real click-guard: it lets advCliStr/cliSelStr/cirBoo clicks through to trigger the tour's own advance, lets a pass-through click through untouched, and blocks everything else.


			if ( supGuaRef.current ) return; // What: Suppression Guard. Why: A caller-driven synthetic click must never be intercepted by this guard at all. How: This returns immediately whenever supGuaRef.current is true.



			const livSteObj = curSteRef.current; // What: Live Step Object. Why: The freshest step object must be read off the ref, not a stale render closure. How: This reads curSteRef.current directly.



			if ( cliEveObj.target.closest( '[data-element-name-hook~="coaCarDiv"]' ) ) return; // What: Coach Exemption Guard. Why: A click anywhere inside the coach card is always legitimate and needs no further handling here. How: This returns whenever the event's own target has a .coaCarDiv ancestor.



			if ( livSteObj && livSteObj.advCliStr && finTarFun( livSteObj.advCliStr ).some( ( curIteEle ) => curIteEle.contains( cliEveObj.target ) ) ) { // What: Advance-On Check. Why: See advCliStr's own doc comment in GuiTouCom's own JSDoc above, an optional real-action shortcut, NOT a cirBoo step (Next keeps working normally too): the real target's click just also counts as clicking Next.


				priActRef.current(); // What: Primary Action Trigger. Why: An advCliStr click must run the exact same priActFun logic a real Next click would. How: This calls the latest priActFun via its own ref.



				return; // What: Advance-On Early Return. Why: Nothing else in this handler applies once advCliStr has already fired. How: This exits before the cliSelStr/cirBoo branch below.


			}



			if ( livSteObj && finTarFun( livSteObj.cliSelStr || livSteObj.selStr ).some( ( curIteEle ) => curIteEle.contains( cliEveObj.target ) ) ) { // What: Target Click Check. Why: A cirBoo step's target click IS its primary action, since the Next button is disabled, so this is the only way forward.


				if ( livSteObj.cirBoo ) priActRef.current(); // What: Require-Click Trigger. Why: Only a cirBoo step treats its own target click as the advancing action. How: This calls the latest priActFun only when the live step actually requires it.



				return; // What: Target Click Early Return. Why: A non-cirBoo step's own target click needs no further handling here, it is real UI reacting to itself. How: This exits before the pass-through/block logic below.


			}



			if ( isaPasFun( cliEveObj ) ) return; // What: Pass-Through Exemption Guard. Why: See isaPasFun's own comment above, this reaches its real handler untouched, neither blocked nor treated as this step's own click. How: This returns whenever isaPasFun reports true.



			cliEveObj.preventDefault();  // What: Default Prevention. Why: An off-target click must never be allowed to do whatever it would normally do underneath the dim. How: This calls preventDefault on the click event.
			cliEveObj.stopPropagation(); // What: Propagation Stop. Why: The click must also be kept from bubbling to any other listener on the page. How: This calls stopPropagation on the click event.


		};



		const focGuaFun = ( focEveObj ) => { // What: Focusout Guard Function. Why: The mousedown guard above only covers focus loss caused by something ELSE on the page stealing it; it cannot do anything about the target itself losing focus for a reason with no in-page click behind it at all, e.g. the browser window/tab losing OS-level focus (alt-tabbing away, or a mobile browser backgrounding and dismissing its own keyboard). How: That still fires a real 'focusout' on the target (unlike 'blur' on window, which does not reach the element), and unlike mousedown's default-focus-transfer, blur/focusout is not cancelable, so preventDefault does nothing here; what DOES work is that React's onBlur is itself just a delegated listener for the native 'focusout' bubbling up to the root container, so stopping propagation on it up here, in capture phase at the document (above where it would ever reach that root listener), keeps React from ever calling the target's own onBlur at all, e.g. GroupHeader's own commit(), which is what actually closes the rename input and makes the step's target vanish. Exempts a focus move INTO the coach (focEveObj.relatedTarget), e.g. Tab-ing to the Next/Done button, since that is a legitimate, deliberate way to leave the target, same as a click on it already is via isaOffFun's own '.coaCarDiv' exemption.


			if ( supGuaRef.current ) return; // What: Suppression Guard. Why: A caller-driven synthetic focus change must never be intercepted here. How: This returns immediately whenever supGuaRef.current is true.



			const livSteObj = curSteRef.current; // What: Live Step Object. Why: The freshest step object must be read off the ref, not a stale render closure. How: This reads curSteRef.current directly.


			if ( !livSteObj ) return; // What: No Step Guard. Why: There is nothing to protect once there is no live step at all. How: This returns whenever livSteObj is falsy.



			if ( focEveObj.relatedTarget && focEveObj.relatedTarget.closest( '[data-element-name-hook~="coaCarDiv"]' ) ) return; // What: Coach Move Exemption. Why: A focus move into the coach card is a legitimate, deliberate way to leave the target. How: This returns whenever the event's own relatedTarget has a .coaCarDiv ancestor.



			if ( !finTarFun( livSteObj.cliSelStr || livSteObj.selStr ).some( ( curIteEle ) => curIteEle.contains( focEveObj.target ) ) ) return; // What: On-Target Guard. Why: Only a focus loss FROM the current step's own target needs protecting. How: This returns whenever the event's own target does not sit inside any element the step's own cliSelStr/selStr currently matches.



			focEveObj.stopPropagation(); // What: Propagation Stop. Why: This is what actually keeps React's own delegated onBlur listener from ever seeing this event. How: This calls stopPropagation on the focusout event.


		};



		document.addEventListener( 'mousedown', dowGuaFun, true ); // What: Mousedown Listener Add. Why: The guard needs to see every mousedown before the browser's own default focus-transfer runs. How: This adds dowGuaFun in capture phase at the document.
		document.addEventListener( 'click', cliGuaFun, true );     // What: Click Listener Add. Why: The guard needs to see every click before it reaches whatever it landed on. How: This adds cliGuaFun in capture phase at the document.
		document.addEventListener( 'focusout', focGuaFun, true );  // What: Focusout Listener Add. Why: The guard needs to see every focus loss before React's own delegated onBlur listener does. How: This adds focGuaFun in capture phase at the document.



		return () => { // What: Listener Cleanup Return. Why: All 3 listeners must be torn down together once this component unmounts. How: This removes each of the 3 listeners added above, matching their own capture-phase flag.


			document.removeEventListener( 'mousedown', dowGuaFun, true ); // What: Mousedown Listener Remove. Why: This specific listener must stop firing once this component unmounts. How: This removes dowGuaFun in capture phase.
			document.removeEventListener( 'click', cliGuaFun, true );     // What: Click Listener Remove. Why: This specific listener must stop firing once this component unmounts. How: This removes cliGuaFun in capture phase.
			document.removeEventListener( 'focusout', focGuaFun, true );  // What: Focusout Listener Remove. Why: This specific listener must stop firing once this component unmounts. How: This removes focGuaFun in capture phase.


		};


	}, [] ); // What: Effect Dependency Array. Why: This listener setup should only ever run once for this component's own mounted lifetime; every closure inside reads live state via refs instead of depending on it directly. How: An empty array means there is no dependency that could ever change to trigger a re-run.

	// #endregion Click Guard Machinery



	// #region Tour Completion Actions

	// #region finTouFun

	/**
	 * finTouFun = Finish Tour Function
	 *
	 * @summary
	 * Ends the tour as a genuine completion: the primary button on a step whose
	 * priStr is 'Done', or the one button of a solo step. It clears the persisted
	 * activeTour checkpoint, calls the caller's own onFinTouFun, then lands back
	 * on a pristine, top-scrolled Today through todTopFun, so a caller's last
	 * step never needs to also be sttBoo just to stick the landing.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * finTouFun() // => void
	 * ```
	 *
	*/

	const finTouFun = React.useCallback( () => { // What: Finish Tour Function. Why: This is genuine completion only, the primary button on a step whose `priStr` is 'Done'. How: This clears activeTour, calls the caller's own onFinTouFun, then lands back on a pristine, scrolled-to-top Today the same way skiTouFun below does, so a caller's last step does not need to remember to also be sttBoo just to stick the landing.


		actStoObj.setOnbFun( { activeTour : null } ); // What: Active Tour Clear. Why: A finished tour must not still look resBoo to a future mount. How: This overwrites the persisted checkpoint with null.


		onFinTouFun(); // What: Finish Callback. Why: The caller needs its own completion hook to fire before this component tears itself down. How: This calls the onFinTouFun prop with no arguments.


		todTopFun( actIdeStr, selTabFun ); // What: Today Landing. Why: A finished tour should always end on a pristine Today, regardless of which tab/scroll position its last step left things in. How: This calls the shared todTopFun helper with the current actIdeStr tab and selTabFun.


	}, [ onFinTouFun, actIdeStr, selTabFun ] ); // What: Effect Dependency Array. Why: This callback must re-close over a fresh onFinTouFun whenever the prop itself changes, and over fresh actIdeStr/selTabFun so the landing logic always targets the current tab state. How: onFinTouFun is the completion hook being called, actIdeStr is read to decide whether a tab switch is needed, and selTabFun is the function that performs it.

	// #endregion finTouFun



	// #region skiTouFun

	/**
	 * skiTouFun = Skip Tour Function
	 *
	 * @summary
	 * Ends the tour as anything other than a genuine completion: the Skip button,
	 * the not-found watchdog, or a step index past the end of steObjArr. It
	 * clears the persisted activeTour checkpoint, calls the caller's own
	 * onSkiTouFun (or onFinTouFun when onSkiTouFun was omitted) with the
	 * click-guard suppressed so that callback's own synthetic clicks go through,
	 * then lands back on a pristine Today through todTopFun.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * skiTouFun() // => void
	 * ```
	 *
	*/

	const skiTouFun = () => { // What: Skip Tour Function. Why: Everything that is NOT genuine completion (the Skip button, but also the not-found watchdog and a resumed/advanced step index past the end of `steObjArr`) funnels through here instead of onFinTouFun, since none of these mean the tour's content was actually finished. How: This clears activeTour, calls the caller's own onSkiTouFun (or onFinTouFun when onSkiTouFun was omitted), then lands back on a pristine Today.


		actStoObj.setOnbFun( { activeTour : null } ); // What: Active Tour Clear. Why: A skipped tour must not still look resBoo to a future mount. How: This overwrites the persisted checkpoint with null.


		supGuaRef.current = true; // What: Guard Suppression. Why: A caller's own onSkiTouFun can drive real synthetic clicks to undo in-progress state (e.g. clicking Edit Mode's real Cancel button), and curSteRef.current still points at the step being left, so without this the guard would read that click as off-target and block it via preventDefault/stopPropagation before the target's own handler ever runs, the same reasoning as bacSteFun's own onBacTouFun call below. How: This flips supGuaRef.current on before calling onSkiTouFun/onFinTouFun.


		( onSkiTouFun || onFinTouFun )(); // What: Skip Or Finish Callback. Why: onSkiTouFun is optional; a caller that does not need the distinction (e.g. a tour with nothing to clean up on a Skip) can omit it and everything still funnels through onFinTouFun. How: This calls whichever of the two is actually present.


		supGuaRef.current = false; // What: Guard Suppression Release. Why: The suppression above must only cover onSkiTouFun/onFinTouFun's own synthetic clicks, not any real click the user makes afterward. How: This flips supGuaRef.current back off immediately after the call above returns.


		todTopFun( actIdeStr, selTabFun ); // What: Today Landing. Why: A skipped tour should always end on a pristine Today too, same as a finished one. How: This calls the shared todTopFun helper with the current actIdeStr tab and selTabFun.


	};

	// #endregion skiTouFun

	// #endregion Tour Completion Actions



	// #region Step Navigation Actions

	const navSteFun = ( tarSteNum ) => setCurSteNum( tarSteNum ); // What: Navigate Step Function. Why: Every place that moves the tour to a specific step index should funnel through one named function rather than calling setCurSteNum directly. How: This just forwards tarSteNum straight into setCurSteNum.



	const bacSteFun = () => { // What: Back Step Function. Why: Back reverses navigation so the previous target exists again. How: Any tour-specific side effects (undoing something a later step did) are the caller's job via onBacTouFun, called with the destination step before it actually changes, with the click-guard suppressed for its duration, see supGuaRef's own comment for why.


		const claSteNum = Math.max( 0, curSteNum - 1 ); // What: Clamp Step Number. Why: Back can never go below the first step. How: This clamps curSteNum - 1 to a floor of 0.



		if ( onBacTouFun ) { // What: On-Go-Back Guard. Why: Not every caller supplies undo side effects. How: This only runs the suppressed onBacTouFun call when the prop is actually present.


			supGuaRef.current = true;  // What: Guard Suppression. Why: onBacTouFun's own synthetic clicks must not be blocked by the guard below, see supGuaRef's own comment above. How: This flips supGuaRef.current on before calling onBacTouFun.
			onBacTouFun( claSteNum );  // What: On-Go-Back Callback. Why: The caller's own undo side effects must run before the step index actually changes. How: This calls onBacTouFun with the destination step number.
			supGuaRef.current = false; // What: Guard Suppression Release. Why: The suppression above must only cover onBacTouFun's own synthetic clicks. How: This flips supGuaRef.current back off immediately after the call above returns.


		}



		navSteFun( claSteNum ); // What: Step Navigation. Why: The actual step change must happen after onBacTouFun's own side effects have already run. How: This calls navSteFun with the computed destination step number.


	};



	// #region priActFun

	/**
	 * priActFun = Primary Action Function
	 *
	 * @summary
	 * Runs the current step's primary action: the Next/Done button, a cirBoo
	 * step's target click, or an advCliStr click. The step's own runFun side
	 * effect runs first, synchronously and with the click-guard suppressed, then
	 * the tour either finishes or advances through advSteFun.
	 *
	 * How it advances depends on the step: a cirBoo step with advSelStr polls
	 * every frame until that selector matches, one with advDelNum waits that many
	 * milliseconds, and any other cirBoo step waits a single tick so the target's
	 * own native click handler runs before the tour moves on; a step without
	 * cirBoo advances immediately. Each wait bails out if the component unmounts
	 * or the step changes in the meantime.
	 *
	 * @author z4nta0 <https://github.com/z4nta0>
	 *
	 * @param void - This function takes no parameters.
	 *
	 * @returns This function does not return anything.
	 *
	 * @example
	 * ```ts
	 * priActFun() // => void
	 * ```
	 *
	*/

	const priActFun = () => { // What: Primary Action Function. Why: The primary button's side effect (if any) runs first, then either finishes the tour ('Done') or advances to the next step; step authors never call navSteFun/selTabFun themselves, keeping runFun() a pure side effect and navigation fully generic. How: For a cirBoo step, this fires from the click-guard's CAPTURE-phase handling of the real target's click, the same event as the target's own native (bubble-phase) handler, which has not run yet; runFun() has to stay synchronous here (some steps' own prefill staging depends on landing before that native handler reads it), but advancing/finishing must NOT, since a 'Done' step's finTouFun calls selTabFun away and unmounts this tour, and doing that synchronously here can remove the target from the DOM before its own bubble-phase handler ever fires, observed concretely on the Picker tour's "Create Picker" step, where the real submit() got skipped entirely because finTouFun tore down the page mid-click; deferring the advance/finish by a tick lets the browser finish dispatching the native click (including the target's own handler) first, since a cirBoo step's target is real UI the user just interacted with, so nothing in `steObjArr` should be reading tour curSteNum synchronously off this same click.


		if ( curSteObj.runFun ) { // What: Run Side Effect Guard. Why: Not every step supplies a side effect. How: This only runs the suppressed curSteObj.runFun() call when the current step actually names one.


			supGuaRef.current = true;  // What: Guard Suppression. Why: A runFun() that drives a real click on something outside the CURRENT step's own target (e.g. staging the NEXT step's target on a different part of the page) would otherwise get blocked by the same document-level guard that stops the USER clicking off-target, since curSteRef.current still points at this step (the index has not advanced yet), so a synthetic click landing anywhere else would read as off-target and get preventDefault/stopPropagation'd before its own handler ever runs. How: This flips supGuaRef.current on before calling curSteObj.runFun().
			curSteObj.runFun();        // What: Run Callback. Why: The step's own declared side effect must actually execute. How: This calls curSteObj.runFun() with no arguments.
			supGuaRef.current = false; // What: Guard Suppression Release. Why: The suppression above must only cover runFun()'s own synthetic clicks. How: This flips supGuaRef.current back off immediately after the call above returns.


		}



		// #region advSteFun

		/**
		 * advSteFun = Advance Step Function
		 *
		 * @summary
		 * Moves the tour past the current step: a 'Done' step or a solo step
		 * finishes the tour through finTouFun, and every other step moves to the
		 * next step index. Solo steps finish whatever their button says, since their
		 * label (e.g. "Dismiss") is never 'Done'.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param void - This function takes no parameters.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * advSteFun() // => void
		 * ```
		 *
		*/

		const advSteFun = () => { // What: Advance Step Function. Why: solo steps (see their own doc comment in GuiTouCom's own JSDoc above) always finish on their one button regardless of its label, since a solo step is never actually followed by a real "next" step, so relying on priStr === 'Done' (every other step's own signal) would send it past the end of the array on a step whose button reads something else, like "Dismiss". How: This calls finTouFun for a 'Done' or solo step, otherwise moves to the next step index.


			if ( curSteObj.priStr === 'Done' || curSteObj.solBoo ) finTouFun(); // What: Finish Branch. Why: A 'Done'-labeled or solo step ends the tour instead of advancing further. How: This calls finTouFun with no arguments.

			else navSteFun( curSteNum + 1 ); // What: Advance Branch. Why: Every other step just moves to the next index in sequence. How: This calls navSteFun with curSteNum + 1.


		};

		// #endregion advSteFun



		if ( curSteObj.cirBoo && curSteObj.advSelStr ) { // What: Advance-When Poll Guard. Why: The real click just kicked off something ASYNC whose result is the next step's own target, e.g. the Pickers tour's "Manual Generation" step, where clicking Pick One starts a multi-second spin animation and the Send to Today button (the next step's target) does not exist until it resolves. How: Advancing on the usual immediate timer would move the step index forward before that target exists, and the position-tracking effect's own "target not found yet" fallback would render a bare dim with no coach at all for however long that takes, reading as the tour blanking out mid-click; polling here instead means THIS step's own already-resolved coach and highlight just keep sitting there, unbothered, for the whole wait, and the jump to the next step only happens once its target is actually ready to be found immediately.


			const begSteNum = curSteNum; // What: Began Step Number. Why: The poll below checks the LIVE step number (via steNumRef, not this closure's own curSteNum) on each frame, so if the user goes Back/Skip in the meantime this can notice and bail out instead of firing a stale advance() later. How: This snapshots curSteNum at the moment the poll starts.



			const polTarFun = () => { // What: Poll Target Function. Why: Each frame needs to check whether the async work has produced its own next-step target yet, without ever running past this component's own unmount or a step change made for some other reason. How: This bails out via mouStaRef/steNumRef, otherwise checks finTarFun(curSteObj.advSelStr) and either advances or schedules another frame.


				if ( !mouStaRef.current || steNumRef.current !== begSteNum ) return; // What: Staleness Guard. Why: This poll must stop the instant it becomes stale, whether from unmount or from the user having navigated away in the meantime. How: This returns whenever the component is no longer mounted or the live step number no longer matches begSteNum.



				if ( finTarFun( curSteObj.advSelStr ).length ) advSteFun(); // What: Target Found Advance. Why: The async work's own result is now ready to become the tour's new spotlight. How: This advances once finTarFun actually matches something for the step's own advSelStr selector.

				else requestAnimationFrame( polTarFun ); // What: Poll Reschedule. Why: The target is not ready yet. How: This schedules another check on the next animation frame.


			};



			requestAnimationFrame( polTarFun ); // What: Poll Start. Why: The very first check should also wait a frame, consistent with every later one. How: This schedules the first call to polTarFun.


		}

		else if ( curSteObj.cirBoo && curSteObj.advDelNum ) { // What: Advance-Delay Timer Guard. Why: The real click plays a self-contained confirmation animation with a fixed duration and no lasting DOM trace to poll for, e.g. the Pickers tour's own "Add to Todo List" step, where Send to Today swaps its label to "Sent!" for a beat then reverts on its own. How: advSelStr above cannot express "wait for this ANIMATION", only "wait for a target to exist"; advancing on the usual immediate timer would cut that confirmation off before the user ever sees it.


			const begSteNum = curSteNum; // What: Began Step Number. Why: Same staleness guard as advSelStr's own poll above, for the same reason (a Back/Skip during the wait should not fire a stale advance() once the timer finally elapses). How: This snapshots curSteNum at the moment the timer starts.



			setTimeout( () => { // What: Advance Delay Timer. Why: The confirmation animation's own fixed duration must actually elapse before advancing. How: This waits curSteObj.advDelNum milliseconds, then checks staleness before calling advSteFun.


				if ( !mouStaRef.current || steNumRef.current !== begSteNum ) return; // What: Staleness Guard. Why: This timer must not fire a stale advance once the component has unmounted or the user has navigated away. How: This returns whenever the component is no longer mounted or the live step number no longer matches begSteNum.



				advSteFun(); // What: Delayed Advance. Why: The confirmation animation has now had its own full duration to play. How: This calls advSteFun.


			}, curSteObj.advDelNum ); // What: Advance Delay Argument. Why: The timer must wait out the step's own confirmation animation. How: This passes curSteObj.advDelNum as the timeout's delay in milliseconds.


		}

		else if ( curSteObj.cirBoo ) setTimeout( advSteFun, 0 ); // What: Deferred Advance. Why: See this function's own header comment above for why a cirBoo step's advance must be deferred by a tick rather than run synchronously. How: This schedules advSteFun on the next tick via a 0ms timeout.

		else advSteFun(); // What: Immediate Advance. Why: A step that is neither polling nor delaying can advance right away. How: This calls advSteFun synchronously.


	};

	// #endregion priActFun



	priActRef.current = priActFun; // What: Primary Action Reference Sync. Why: The click-guard effect above only ever reads priActRef.current, never priActFun directly, so this must stay current every render. How: This assigns the freshly-closed-over priActFun into priActRef.current.

	// #endregion Step Navigation Actions



	React.useEffect( () => { // What: Position Tracking Effect. Why: This follows the target every frame while a step is up: scrolling it into view once, clamping the spotlight/coach against chrome, deciding reserve space, and watchdog-skipping a step whose target never resolves.


		setCurRecObj( null ); // What: Rect Reset. Why: The previous step's own position must not paint under new text. How: This drops curRecObj back to null the instant the step changes.
		setResTopNum( 0 );    // What: Reserve Reset. Why: The previous step's own reserve need (computed below from fresh measurements) may well be different, and starting from zero avoids the new target's very first measurement already reflecting stale leftover padding. How: This drops resTopNum back to 0 the instant the step changes.



		if ( !curSteObj ) { // What: No Step Guard. Why: See the clamp on curSteObj above; there is no valid step to track at all. How: This bails out cleanly rather than leave a permanent dim with nothing to click, calling skiTouFun (not finTouFun, see its own comment) since this is not a genuine completion.


			skiTouFun(); // What: Skip Call. Why: A missing step is never genuine completion. How: This calls skiTouFun directly.



			return; // What: Effect Early Return. Why: Nothing below this point has a valid step to work against. How: This exits before setting up the raf loop/scroll listener.


		}



		let rafIdeNum;         // What: Raf Identifier Number. Why: This holds the current requestAnimationFrame handle so the cleanup below can cancel it. How: This starts uninitialized and is only ever written inside this effect's own closures.
		let isaCanBoo = false; // What: Is-A Cancelled Boolean. Why: This is the flag every scheduled callback checks before doing anything. How: This starts false and is only ever written inside this effect's own closures.
		let resDecBoo = false; // What: Reserve Decided Boolean. Why: Whether THIS step's target needs top-space reserved above it is declared here (not down by decResFun's own definition, where it conceptually belongs) because briTarFun now needs to read/set it on its very first call, before decResFun's own code further down has even run. How: See decResFun's own comment for the full reasoning on what this tracks and why the decision only ever happens once per step.
		let resAmoNum = 0;     // What: Reserve Amount Number. Why: Same reasoning as resDecBoo above, hoisted here so briTarFun can read/set it before decResFun's own code has run. How: See decResFun's own comment for the full reasoning on what this tracks.



		// #region Scroll Helpers

		// #region getScrFun

		/**
		 * getScrFun = Get Scroller Function
		 *
		 * @summary
		 * Finds the element that actually scrolls a target vertically: the nearest
		 * ancestor whose overflow-y allows scrolling and whose content genuinely
		 * overflows it. On narrow layouts that is the page itself rather than .main,
		 * so a hardcoded .main would leave the target below the fold.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param curTarEle - Current Target Element: The element whose scroller is
		 *                    needed.
		 *
		 * @returns The nearest scrolling ancestor, or the document's own scrolling
		 * element when none qualifies.
		 *
		 * @example
		 * ```ts
		 * getScrFun( curEleArr[ 0 ] ) // => scroller element
		 * ```
		 *
		*/

		const getScrFun = ( curTarEle ) => { // What: Get Scroller Function. Why: The ACTUAL scrolling ancestor of the target must be resolved, since on narrow/mobile layouts the scroller is not ".main" (the page/body scrolls instead), and a hardcoded ".main" would leave the target below the fold with the coach and spot off-screen, the dim-only "no highlight" state.


			let ancCurEle = curTarEle && curTarEle.parentElement; // What: Ancestor Current Element And Walker. Why: The walk needs to start from the target's own parent. How: This starts at curTarEle's own parentElement, or undefined when curTarEle itself is falsy.


			while ( ancCurEle && ancCurEle !== document.body ) { // What: Ancestor Walk Loop. Why: Every ancestor between the target and the document body is a candidate scroller. How: This walks upward one parentElement at a time until it reaches document.body or runs out of ancestors.


				const oveYcoStr = getComputedStyle( ancCurEle ).overflowY; // What: Overflow Y-Coordinate String. Why: Only a genuinely vertically-scrollable ancestor counts as a real scroller. How: This reads ancCurEle's own computed overflow-y style.


				if ( ( oveYcoStr === 'auto' || oveYcoStr === 'scroll' ) && ancCurEle.scrollHeight > ancCurEle.clientHeight + 2 ) return ancCurEle; // What: Real Scroller Return. Why: An ancestor whose own content does not actually overflow is not a real scroller even if its CSS allows scrolling. How: This returns ancCurEle once both its overflow-y style and its actual scrollHeight/clientHeight gap qualify it.



				ancCurEle = ancCurEle.parentElement; // What: Ancestor Advance. Why: The walk must keep climbing toward the document body. How: This reassigns ancCurEle to its own parentElement for the next loop iteration.


			}



			return document.scrollingElement || document.documentElement; // What: Document Scroller Fallback Return. Why: No scrollable ancestor was found, so the page itself is what actually scrolls. How: This returns the document's own scrolling element, or documentElement as a last resort.


		};

		// #endregion getScrFun



		// #region scrAmoFun

		/**
		 * scrAmoFun = Scroll Amount Function
		 *
		 * @summary
		 * Scrolls a scroller by a vertical amount, smoothly unless the user prefers
		 * reduced motion, so a step that jumps to a different part of the page reads
		 * as the tour visibly navigating there. The document's own scroller is
		 * scrolled through window, and any other scroller directly.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param curScrEle - Current Scroll Element: The scroller getScrFun resolved
		 *                    for the target.
		 * @param delYcoNum - Delta Y-Coordinate Number: How far to scroll, in px;
		 *                    positive scrolls down.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * scrAmoFun( curScrEle, 120 ) // => void
		 * ```
		 *
		*/

		const scrAmoFun = ( curScrEle, delYcoNum ) => { // What: Scroll Amount Function. Why: A step that jumps to a different part of the page, or, via briTarFun's own content-grew re-trigger and decResFun's own follow-up correction below, mid-step too, should read as the tour visibly navigating there rather than an unexplained cut. How: This is smooth unless prefers-reduced-motion, and is deliberately NOT applied to todTopFun (the tour-END reset on Skip/Done), which is a closing reset, not a "here's the next thing" step transition, and already fires alongside a tab switch back to Today, staying an instant cut by design.


			const curBehStr = redMotFun() ? 'auto' : 'smooth';           // What: Current Behavior String. Why: The scroll should be instant for a user who prefers reduced motion. How: This resolves the reduced-motion preference once.
			const scrOptObj = { behavior : curBehStr, top : delYcoNum }; // What: Scroll Options Object. Why: Both branches below need the same options. How: This builds one shared options object from curBehStr and delYcoNum.


			if ( curScrEle === document.scrollingElement || curScrEle === document.documentElement ) window.scrollBy( scrOptObj ); // What: Window Scroll By. Why: The document's own scroller is addressed through window, not the element itself. How: This calls window.scrollBy when curScrEle is the document's own scroller.

			else curScrEle.scrollBy( scrOptObj ); // What: Element Scroll By. Why: Any other scroller is addressed directly. How: This calls curScrEle.scrollBy for every other case.


		};

		// #endregion scrAmoFun

		// #endregion Scroll Helpers



		// #region Bring Target Into View

		// #region briTarFun

		/**
		 * briTarFun = Bring Target Function
		 *
		 * @summary
		 * Scrolls the current step's target into a comfortable spot on screen.
		 * Depending on the step's own flags it reveals a horizontally scrolled
		 * target (rhsBoo), scrolls all the way to the top (sttBoo) or bottom
		 * (stbBoo), or lands the target right below the coach (catBoo); otherwise it
		 * nudges the target just inside a padded window below the sticky chrome.
		 *
		 * Before that nudge it predicts where the target will land, and when neither
		 * the below nor the above coach placement would fit there, it reserves top
		 * space for the coach, then retries itself on the next frame once that
		 * padding has rendered. It does nothing once the effect has been cancelled
		 * or while the target is not found.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param void - This function takes no parameters.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * briTarFun() // => void
		 * ```
		 *
		*/

		const briTarFun = () => { // What: Bring Target Function. Why: This brings the target(s) into view once when the step opens.


			if ( isaCanBoo ) return; // What: Cancelled Guard. Why: This guards the recursive requestAnimationFrame(() => briTarFun()) call below (the reserve-space retry), which fires on its own timer, outside this effect's own raf loop, so the ordinary isaCanBoo check further down never gets a chance to catch it if the step/tour has already moved on by the time it fires. How: This returns immediately whenever isaCanBoo is already true.



			const curEleArr = finTarFun( curSteObj.selStr ); // What: Current Element Array. Why: Nothing below can run without knowing which elements the current step actually targets. How: This resolves curSteObj.selStr via finTarFun.


			if ( !curEleArr.length ) return; // What: No Targets Guard. Why: There is nothing to bring into view yet. How: This returns whenever finTarFun matched nothing.



			if ( curSteObj.rhsBoo ) curEleArr[ 0 ].scrollIntoView( { block : 'nearest', inline : 'end' } ); // What: Horizontal Reveal. Why: See rhsBoo's own doc comment in GuiTouCom's own JSDoc above, a one-time native reveal for a target sitting off the end of a horizontally-scrolling row, independent of (and before) all the vertical handling below, which has no idea this axis exists at all. How: This calls scrollIntoView on the first matched element with inline:'end'.



			const curScrEle = getScrFun( curEleArr[ 0 ] ); // What: Current Scroll Element. Why: Every branch below needs to know which element actually scrolls. How: This resolves the first matched element's own scroller via getScrFun.


			if ( curSteObj.sttBoo ) { // What: Scroll-To-Top Guard. Why: A step whose target starts right at the top of the page anyway (e.g. a full-list review step) should scroll all the way up rather than just nudging it into view, keeping everything visible from the top instead of opening mid-scroll.


				const curBehStr = redMotFun() ? 'auto' : 'smooth';   // What: Current Behavior String. Why: The scroll should be instant for a user who prefers reduced motion. How: This resolves the reduced-motion preference once.
				const scrOptObj = { behavior : curBehStr, top : 0 }; // What: Scroll Options Object. Why: Both branches below need the same options. How: This builds one shared options object that scrolls to the very top.


				if ( curScrEle === document.scrollingElement || curScrEle === document.documentElement ) window.scrollTo( scrOptObj ); // What: Window Scroll To. Why: The document's own scroller is addressed through window. How: This calls window.scrollTo when curScrEle is the document's own scroller.

				else curScrEle.scrollTo( scrOptObj ); // What: Element Scroll To. Why: Any other scroller is addressed directly. How: This calls curScrEle.scrollTo for every other case.



				return; // What: Scroll-To-Top Early Return. Why: Nothing below applies once this branch has already handled the scroll. How: This exits before the stbBoo/catBoo/pad branches.


			}



			if ( curSteObj.stbBoo ) { // What: Scroll-To-Bottom Guard. Why: The symmetric case: a step whose target always sits at the very bottom of its page/form (e.g. a footer "next" button), where scrolling by pad math alone can undershoot after the surrounding content just changed shape (e.g. a form switching back from a longer sub-step to a shorter one), landing short of the target instead of reaching it.


				const curBehStr = redMotFun() ? 'auto' : 'smooth'; // What: Current Behavior String. Why: Both branches below need the same behavior choice. How: This resolves the reduced-motion preference once.


				if ( curScrEle === document.scrollingElement || curScrEle === document.documentElement ) window.scrollTo( { behavior : curBehStr, top : document.documentElement.scrollHeight } ); // What: Window Scroll To Bottom. Why: The document's own scroller is addressed through window. How: This scrolls the window all the way to documentElement's own scrollHeight.

				else curScrEle.scrollTo( { behavior : curBehStr, top : curScrEle.scrollHeight } ); // What: Element Scroll To Bottom. Why: Any other scroller is addressed directly. How: This scrolls curScrEle all the way to its own scrollHeight.



				return; // What: Scroll-To-Bottom Early Return. Why: Nothing below applies once this branch has already handled the scroll. How: This exits before the catBoo/pad branches.


			}



			const isaDocBoo = curScrEle === document.scrollingElement || curScrEle === document.documentElement;      // What: Is-A Document Boolean. Why: Several branches below need to know whether the resolved scroller is the document itself. How: This compares curScrEle against both document.scrollingElement and document.documentElement.
			const tarRecObj = uniRecFun( curEleArr );                                                                 // What: Target Rect Object. Why: Every branch below needs the target's own current union rect. How: This unions every matched element via uniRecFun.
			const scrRecObj = isaDocBoo ? { bottom : window.innerHeight, top : 0 } : curScrEle.getBoundingClientRect(); // What: Scroller Rect Object. Why: The pad math below needs the scroller's own visible bounds. How: This uses the viewport bounds for the document scroller, otherwise curScrEle's own bounding rect.


			if ( curSteObj.catBoo ) { // What: Coach-At-Top Guard. Why: See catBoo's own doc comment in GuiTouCom's own JSDoc above, scrolls so the target starts right where the coach (pinned to safTopNum) leaves off, instead of trying to fit the target's WHOLE height within the normal pad/padBotNum window below, which a too-tall target cannot do.


				const desTopNum = safTopFun( { forCoaBoo : true } ) + rhyPxlFun( 'm01' ) + coaHeiRef.current + rhyPxlFun( 'bas' ); // What: Desired Top Number. Why: This is exactly where the target's own top edge should land. How: This adds the coach's own floor, its small-step margin, its current measured height, and a base-step gap. // Vertical Rhythm Base Minus 1 = 11px, Vertical Rhythm Base ~= 14.572px

				scrAmoFun( curScrEle, tarRecObj.top - desTopNum ); // What: Scroll By Desired Delta. Why: The scroller needs to move by exactly the gap between the target's own current top and its desired top. How: This calls scrAmoFun with that difference.



				return; // What: Coach-At-Top Early Return. Why: Nothing below applies once this branch has already handled the scroll. How: This exits before the pad-based branch.


			}



			const padTopNum = rhyPxlFun( 'p06' );                                                      // What: Pad Top Number. Why: This is the ordinary top breathing-room margin used by the pad-based branch below. How: This is a fixed pixel constant tuned for the coach card's own typical size. // Vertical Rhythm Base Plus 6 ~= 78.750px
			const padBotNum = rhyPxlFun( 'p08' );                                                      // What: Pad Bottom Number. Why: Same reasoning as padTopNum above, for the bottom margin. How: This is a fixed pixel constant tuned for the coach card's own typical size. // Vertical Rhythm Base Plus 8 ~= 138.199px
			const minTopNum = Math.max( scrRecObj.top + padTopNum, safTopFun() + rhyPxlFun( 'm01' ) ); // What: Min Top Number. Why: The top boundary also cannot sit above safTopFun(), since a fixed pad alone assumes Today's own sticky header (plus, when present, the Edit Mode banner) is shorter than it actually is, which on a short enough viewport (or once the banner adds its own height) lets a target that "fits" by the pad's math alone still land partly behind that chrome, with briTarFun then seeing no need to scroll further. How: This takes whichever floor is higher between the plain pad math and the safe-chrome floor. // Vertical Rhythm Base Minus 1 = 11px

			let preTopNum = null; // What: Predicted Top Number. Why: A target too tall to fit alongside the coach no matter where it is scrolled to needs reserve space, decided HERE using a PREDICTED landing position (wherever the branch just below is about to place it) rather than an OBSERVED post-scroll one, so it can be applied before this step's very first scroll instead of discovered only after that scroll already settled. How: preTopNum mirrors whichever of the two branches below will actually fire; null (no scroll needed at all) is deliberately left unhandled, since a target that already fits without scrolling was never going to need reserve either.


			if ( tarRecObj.top < minTopNum ) preTopNum = minTopNum; // What: Predicted Top From Above. Why: A target starting above the safe floor will be scrolled down to exactly minTopNum. How: This sets preTopNum to minTopNum whenever the target's own top sits above it.

			else if ( tarRecObj.bottom > scrRecObj.bottom - padBotNum ) preTopNum = ( scrRecObj.bottom - padBotNum ) - tarRecObj.height; // What: Predicted Top From Below. Why: A target overflowing the bottom pad boundary will be scrolled up until its own bottom lands exactly there. How: This derives the resulting top from that landing bottom minus the target's own height.



			if ( !curSteObj.catBoo && !resDecBoo && preTopNum != null ) { // What: Reserve Prediction Guard. Why: This plugs the predicted landing position into the exact same fits-below/fits-above checks decResFun itself uses below, so this can never disagree with what decResFun would have decided anyway, just decided proactively instead of reactively; this replaces the loop's own decResFun (unchanged) used to be the only place this got decided, which meant a visibly separate second "jump then re-scroll" once it found the overlap, this step's target genuinely overlapping the coach at its settled position is exactly the case reproduced live and reported as jank.


				const vieHeiNum = window.innerHeight;                                                                                   // What: Viewport Height Number. Why: The fit checks below need the current viewport height. How: This is read fresh from window.innerHeight.
				const coaHeiNum = coaHeiRef.current;                                                                                    // What: Coach Height Number. Why: The fit checks below need the coach's own latest measured height. How: This is read fresh from coaHeiRef.current.
				const fitBelBoo = vieHeiNum - ( preTopNum + tarRecObj.height ) >= coaHeiNum + rhyPxlFun( 'bas' );                       // What: Fits Below Boolean. Why: The below placement only works if the coach's own height plus its base-step gap actually fits under the predicted landing position. How: This compares the remaining viewport space under the predicted bottom edge against coaHeiNum plus a base step. // Vertical Rhythm Base ~= 14.572px
				const fitAboBoo = preTopNum - rhyPxlFun( 'bas' ) - coaHeiNum >= safTopFun( { forCoaBoo : true } ) + rhyPxlFun( 'm01' ); // What: Fits Above Boolean. Why: The above placement only works if the coach's own height plus its base-step gap actually fits above the predicted top edge, down to the coach's own safe floor. How: This compares the predicted top edge minus the coach's own space against the safe floor. // Vertical Rhythm Base ~= 14.572px, Vertical Rhythm Base Minus 1 = 11px


				if ( !fitBelBoo && !fitAboBoo ) { // What: No Fit Guard. Why: Reserve space is only ever needed once neither the below nor the above placement actually fits. How: This only enters the reserve branch when both fit checks failed.


					resDecBoo = true;                           // What: Reserve Decided Commit. Why: This decision must only ever happen once per step. How: This flips resDecBoo to true so neither this branch nor decResFun's own later check re-decides it.
					resAmoNum = coaHeiNum + rhyPxlFun( 'p04' ); // What: Reserve Amount Commit. Why: The reserved space must be generous enough to fit the coach's own full height plus a comfortable gap. How: This sets resAmoNum to the coach's own height plus a fixed p04 step. // Vertical Rhythm Base Plus 4 ~= 44.876px

					setResTopNum( resAmoNum ); // What: Reserve Top Commit. Why: TabTodCom reads this off the bus to actually pad its own list. How: This publishes resAmoNum into React state, which the effect below forwards onto the bus.


					requestAnimationFrame( () => briTarFun() ); // What: Reserve Retry. Why: The padding has not rendered yet (React has not re-committed), so the retry must wait a real frame to measure the actual, already-reserved layout instead of guessing at it. How: This re-calls briTarFun on the next animation frame.



					return; // What: Reserve Early Return. Why: The scroll below must wait for the retry above instead of running against a stale layout. How: This exits before the plain scroll-by calls.


				}


			}



			if ( tarRecObj.top < minTopNum ) scrAmoFun( curScrEle, -( minTopNum - tarRecObj.top ) ); // What: Scroll Up To Min Top. Why: A target above the safe floor must be scrolled down until it clears it. How: This calls scrAmoFun with the negative gap between minTopNum and the target's own top.

			else if ( tarRecObj.bottom > scrRecObj.bottom - padBotNum ) scrAmoFun( curScrEle, tarRecObj.bottom - ( scrRecObj.bottom - padBotNum ) ); // What: Scroll Down To Pad Bottom. Why: A target overflowing the bottom pad boundary must be scrolled up until it clears it. How: This calls scrAmoFun with the gap between the target's own bottom and the pad boundary.


		};

		// #endregion briTarFun



		briTarFun(); // What: Initial Bring Call. Why: The target needs bringing into view once as soon as the step opens. How: This calls briTarFun for the first time; every subsequent call to it happens from inside the loop below.

		// #endregion Bring Target Into View



		// #region Chrome Clamping And Imperative Placement

		const spoPadNum = curSteObj.cirBoo ? 0 : rhyPxlFun( 'm02' ); // What: Spotlight Pad Number. Why: cirBoo steps get a pulsing ring drawn tight against the target (see the .touSpoDiv--pulse CSS); any padding here would leave a visible gap between the target's real edge and the pulse, which reads as the highlight being for some larger, vaguer area instead of the exact element to click. How: This is 0 for a cirBoo step, otherwise the normal m02 step. // Vertical Rhythm Base Minus 2 ~= 8.304px



		// #region claChrFun

		/**
		 * claChrFun = Clamp Chrome Function
		 *
		 * @summary
		 * Clamps the drawn highlight rect so the spotlight never reaches into
		 * Today's own sticky chrome at the top or a bottom-placed tab bar, both of
		 * which sit below this overlay and would otherwise show through the
		 * spotlight's cutout as if they were part of the target. Only the drawn rect
		 * is clamped, never the one briTarFun scrolls by. A target that lives inside
		 * the tab bar, the group rail, or Today's own header is returned unclamped,
		 * since clamping it against its own container would squash the highlight.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param curRecObj - Current Rect Object: The unioned target rect from
		 *                    uniRecFun.
		 * @param curEleArr - Current Element Array: The matched elements, checked
		 *                    for chrome membership.
		 *
		 * @returns The rect with its top, bottom, and height clamped to the safe
		 * area, or curRecObj unchanged for a target inside the chrome.
		 *
		 * @example
		 * ```ts
		 * claChrFun( uniRecFun( curEleArr ), curEleArr ) // => rect
		 * ```
		 *
		*/

		const claChrFun = ( curRecObj, curEleArr ) => { // What: Clamp Chrome Function. Why: Today's own sticky header (and, on mobile, the groups rail stacked below it) plus a floating bottom tab bar (tabPlacement 'bottom') both sit at a higher z-index than the surrounding content but a LOWER one than this tour overlay, so a highlighted rect reaching past either one's edge would expose it through the spotlight's cutout (a box-shadow "hole") instead of dimming it, reading as if that chrome were part of the highlighted target. How: This clamps the rect actually drawn (not the one briTarFun scrolls by, which needs the real position) so the spotlight never reaches into either safe zone; targets that live INSIDE the nav bar, the group rail, or Today's own header are exempt, since clamping those against their own containing chrome can squash the highlight down to a sliver sitting below/past the actual target instead of on it.


			if ( curEleArr.some( ( curIteEle ) => curIteEle.closest( '[data-element-name-hook~="appTabNav"], [data-element-name-hook~="groRaiAsi"], [data-element-name-hook~="todPagHea"]' ) ) ) return curRecObj; // What: Chrome Membership Exemption. Why: A target that is itself part of the nav bar, the group rail, or Today's own header must never be clamped against that same chrome. How: This returns curRecObj untouched whenever any matched element sits inside one of those 3 containers, matched with one selector list.



			const minTopNum = safTopFun() + spoPadNum;                 // What: Min Top Number. Why: The clamp needs to account for the spot's own padding too, so the padded box drawn below never overlaps that chrome even by that margin. How: This adds spoPadNum onto the safe-top floor.
			const maxBotNum = safBotFun() - spoPadNum;                 // What: Max Bottom Number. Why: Same reasoning as minTopNum, but for the opposite edge. How: This subtracts spoPadNum from the safe-bottom ceiling.
			const claTopNum = Math.max( curRecObj.top, minTopNum );    // What: Clamp Top Number. Why: The rect's own top edge must never rise above minTopNum. How: This takes whichever is lower between curRecObj.top and minTopNum.
			const claBotNum = Math.min( curRecObj.bottom, maxBotNum ); // What: Clamp Bottom Number. Why: The rect's own bottom edge must never sink below maxBotNum. How: This takes whichever is higher between curRecObj.bottom and maxBotNum.
			const claHeiNum = claBotNum - claTopNum;                   // What: Clamp Height Number. Why: The clamped rect's own height must match its clamped edges. How: This subtracts claTopNum from claBotNum.



			return { ...curRecObj, bottom : claBotNum, height : claHeiNum, top : claTopNum }; // What: Clamped Rect Return. Why: The caller needs the fully clamped rect back, height recomputed to match. How: This spreads curRecObj, then overwrites bottom/height/top with the clamped values.


		};

		// #endregion claChrFun



		// #region plaTarFun

		/**
		 * plaTarFun = Place Target Function
		 *
		 * @summary
		 * Positions the spotlight and the real coach imperatively, writing their
		 * inline styles straight to the DOM on every call, so neither one lags
		 * behind a smooth scroll the way React state alone would. The coach's own
		 * position and arrow come from the same coaLayFun and arrHorFun math the
		 * render uses.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param curEleArr - Current Element Array: The elements finTarFun matched
		 *                    for the current step.
		 *
		 * @returns The clamped rect it placed, for the caller to commit to React
		 * state.
		 * @see {@link tarRecObj}
		 *
		 * @example
		 * ```ts
		 * plaTarFun( curEleArr ) // => rect
		 * ```
		 *
		*/

		const plaTarFun = ( curEleArr ) => { // What: Place Target Function. Why: This positions both the spotlight and the real coach imperatively, every frame, so neither one visibly lags behind a smooth scroll the way pure React state would.


			const tarRecObj = claChrFun( uniRecFun( curEleArr ), curEleArr ); // What: Target Rect Object. Why: Both the spotlight and the coach below need the same clamped, unioned rect. How: This unions curEleArr, then clamps the result against chrome.


			if ( spoEleRef.current ) { // What: Spotlight Ref Guard. Why: The spotlight element may not be mounted yet on the very first call. How: This only writes to spoEleRef.current when it is actually present.


				const spoStyObj = spoEleRef.current.style; // What: Spotlight Style Object. Why: The values below must actually be written onto the real DOM element. How: This reads spoEleRef.current's own live CSSStyleDeclaration.

				spoStyObj.height = ( tarRecObj.height + spoPadNum * 2 ) + 'px'; // What: Spotlight Height Write. Why: The spot must grow by spoPadNum on both the top and bottom. How: This writes the inline height directly.
				spoStyObj.left   = ( tarRecObj.left - spoPadNum ) + 'px';       // What: Spotlight Left Write. Why: The spot must sit spoPadNum outside the target's own left edge. How: This writes the inline left directly.
				spoStyObj.top    = ( tarRecObj.top - spoPadNum ) + 'px';        // What: Spotlight Top Write. Why: The spot must sit spoPadNum outside the target's own top edge. How: This writes the inline top directly.
				spoStyObj.width  = ( tarRecObj.width + spoPadNum * 2 ) + 'px';  // What: Spotlight Width Write. Why: The spot must grow by spoPadNum on both the left and right. How: This writes the inline width directly.


			}



			if ( reaCoaRef.current ) { // What: Real Coach Ref Guard. Why: Same reasoning as the render function's own coach position: during briTarFun's (now smooth) scroll, the render function's OWN coach position (driven by the curRecObj React state set below, once per animation frame) lags a render/commit cycle behind the browser's own scroll animation and visibly stutters instead of gliding. How: Writing directly to the DOM here keeps the coach locked to the highlight, frame for frame; the render function still computes the same layout as a fallback for the coach's first paint each step (before this has run at all) and as the eventual React-driven value once it catches up.


				const vieWidNum = window.innerWidth;                                                          // What: Viewport Width Number. Why: The layout math below needs the current viewport width. How: This is read fresh from window on every call.
				const vieHeiNum = window.innerHeight;                                                         // What: Viewport Height Number. Why: The layout math below needs the current viewport height. How: This is read fresh from window on every call.
				const coaWidNum = coaWidFun( vieWidNum );                                                     // What: Coach Width Number. Why: The coach card should fit its body text like help mode's tip, within a narrow viewport. How: This asks coaWidFun for the text-based width, capped to the viewport.
				const coaLayObj = coaLayFun( tarRecObj, coaHeiRef.current, coaWidNum, vieWidNum, vieHeiNum ); // What: Coach Layout Object. Why: This is the single shared placement math also used by the render function's own first-paint fallback. How: This calls coaLayFun with the current target rect, the coach's own latest measured height, and the current viewport/coach sizes.
				const coaStyObj = reaCoaRef.current.style;                                                    // What: Coach Style Object. Why: The layout above must actually be written onto the real DOM element. How: This reads reaCoaRef.current's own live CSSStyleDeclaration.

				coaStyObj.left = coaLayObj.left + 'px';                                                             // What: Coach Left Write. Why: The coach must move to exactly where coaLayFun decided. How: This writes the inline left directly.
				coaStyObj.top  = coaLayObj.top + 'px';                                                              // What: Coach Top Write. Why: The coach must move to exactly where coaLayFun decided. How: This writes the inline top directly.
				coaStyObj.setProperty( '--coa-arr-off', arrHorFun( tarRecObj, coaLayObj.left, coaWidNum ) + 'px' );       // What: Arrow X Custom Property Write. Why: The coach's own CSS arrow reads this custom property to stay centered on the target. How: This sets --coa-arr-off to the freshly computed arrow offset.
				reaCoaRef.current.classList.toggle( cssModObj.coaCarDivUp, coaLayObj.arrStr === 'coaCarDiv--up' );     // What: Arrow Up Class Toggle. Why: The coach's own arrow direction must match whichever side coaLayFun picked. How: This toggles the module's upward-arrow class based on coaLayObj.arrStr.
				reaCoaRef.current.classList.toggle( cssModObj.coaCarDivDown, coaLayObj.arrStr === 'coaCarDiv--down' ); // What: Arrow Down Class Toggle. Why: Same reasoning as the up-class toggle, for the opposite direction. How: This toggles the module's downward-arrow class based on coaLayObj.arrStr.


			}



			return tarRecObj; // What: Placed Rect Return. Why: The caller (the loop below) needs the placed rect back to feed into React state too. How: This returns the same tarRecObj just placed.


		};

		// #endregion plaTarFun

		// #endregion Chrome Clamping And Imperative Placement



		// #region Reserve-Space Decision

		let lasTopNum = null; // What: Last Top Number. Why: The target can still be settling in two different ways (mid-CSS-transition, or briTarFun's own scroll adjustment not having fully landed yet), and deciding off a transient top reading would wrongly conclude "fits" and skip the reserve the final, settled geometry actually needs. How: This tracks the target's own top across consecutive frames so decResFun below can wait for it to stop changing before locking in its decision, the same idea as coaHeiNum's own stabilize-then-use pattern above, just for the other side of the same math.
		let lasHeiNum = null; // What: Last Height Number. Why: Same reasoning as lasTopNum above, for the target's own height instead of its top. How: This tracks the target's own height across consecutive frames so decResFun below can wait for it to stop changing too.
		let staFraNum = 0;    // What: Stable Frame Number. Why: Both lasTopNum and lasHeiNum need a shared counter of how many consecutive frames have read as unchanged, before decResFun below trusts the geometry as settled. How: This starts at 0 and is incremented/reset by the stability check further down.



		// #region decResFun

		/**
		 * decResFun = Decide Reserve Function
		 *
		 * @summary
		 * Decides once per step, as soon as the target's geometry has held still for
		 * 2 frames, whether the target needs top space reserved so the coach fits
		 * beside it. When neither the below nor the above placement fits, it
		 * publishes the reserve and, a frame later, scrolls the target to sit just
		 * below where the coach will land. Deciding once keeps the layout from
		 * jumping under the user mid-scroll on shorter pages. It does nothing for a
		 * catBoo step or once the decision has been made.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param curEleArr - Current Element Array: The elements finTarFun matched
		 *                    for the current step.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * decResFun( curEleArr ) // => void
		 * ```
		 *
		*/

		const decResFun = ( curEleArr ) => { // What: Decide Reserve Function. Why: This decides how much top-space (if any) THIS step's target needs reserved above it, ONCE, the very first time the target's own geometry has settled, rather than continuously on every frame. How: A continuous decision looks right on Today (its highlight is tall enough that scrolling never changes the verdict) but flips mid-scroll on shorter pages like Pickers, where scrolling the header over the target can cross the "fits above" threshold WHILE THE USER IS STILL SCROLLING, jumping the layout under them; deciding once and locking it for the step's duration reads like a person who sized up the space up front, not one who keeps rearranging things as you scroll.


			if ( curSteObj.catBoo ) { resDecBoo = true; return; } // What: Coach-At-Top Skip. Why: catBoo steps never reserve, see that flag's own doc comment in GuiTouCom's own JSDoc above; resTopNum stays at its already-0 default. How: This marks the decision as made without ever setting a nonzero reserve.



			if ( resDecBoo ) return; // What: Already Decided Guard. Why: This decision must only ever happen once per step. How: This returns immediately once resDecBoo is already true.



			const tarRecObj = uniRecFun( curEleArr ); // What: Target Rect Object. Why: The stability check below needs the target's own current union rect. How: This unions curEleArr via uniRecFun.


			if ( lasHeiNum != null && Math.abs( tarRecObj.height - lasHeiNum ) < 1 && Math.abs( tarRecObj.top - lasTopNum ) < 1 ) staFraNum++; // What: Stable Frame Increment. Why: Both the target's own top and height must be unchanged from the previous frame for it to count as settled. How: This increments staFraNum only when both deltas are under 1px.

			else staFraNum = 0; // What: Stable Frame Reset. Why: Any real movement restarts the settle count from scratch. How: This resets staFraNum to 0 whenever the stability check above failed.



			lasTopNum = tarRecObj.top;    // What: Last Top Commit. Why: The next frame's own stability check needs this frame's own top value to compare against. How: This overwrites lasTopNum with tarRecObj.top.
			lasHeiNum = tarRecObj.height; // What: Last Height Commit. Why: Same reasoning as the top commit, for height. How: This overwrites lasHeiNum with tarRecObj.height.



			if ( staFraNum < 2 ) return; // What: Not Yet Stable Guard. Why: 2 consecutive stable frames are required before trusting the geometry. How: This returns whenever staFraNum has not yet reached 2.



			resDecBoo = true; // What: Reserve Decided Commit. Why: This decision must only ever happen once per step. How: This flips resDecBoo to true.

			const vieHeiNum = window.innerHeight; // What: Viewport Height Number. Why: The fit checks below need the current viewport height. How: This reads window.innerHeight fresh.
			const coaHeiNum = coaHeiRef.current;  // What: Coach Height Number. Why: This must read coaHeiRef.current, not a closed-over value, since a narrower coach (small/mobile screens) wraps the same body text over more lines and renders taller, so the fixed COA_HEI_NUM guess under-reserved there specifically, this step fitting "above" by the estimate but not in reality, with the coach ending up overlapping the highlight's top edge anyway. How: This reads the ref's own current value fresh.


			if ( vieHeiNum - ( tarRecObj.top + tarRecObj.height ) >= coaHeiNum + rhyPxlFun( 'bas' ) ) return; // What: Fits Below Return. Why: No reserve is needed once the coach's own height plus its base-step gap already fits below the target. How: This returns whenever that check passes, leaving resTopNum at its already-0 default. // Vertical Rhythm Base ~= 14.572px



			if ( tarRecObj.top - rhyPxlFun( 'bas' ) - coaHeiNum >= safTopFun( { forCoaBoo : true } ) + rhyPxlFun( 'm01' ) ) return; // What: Fits Above Return. Why: No reserve is needed once the coach's own height plus its base-step gap already fits above the target either. How: This returns whenever that check passes, leaving resTopNum at its already-0 default. // Vertical Rhythm Base ~= 14.572px, Vertical Rhythm Base Minus 1 = 11px



			resAmoNum = coaHeiNum + rhyPxlFun( 'p04' ); // What: Reserve Amount Commit. Why: Neither side fits, so the reserved space must be generous enough to fit the coach's own full height plus a comfortable gap. How: This sets resAmoNum to the coach's own height plus a fixed p04 step. // Vertical Rhythm Base Plus 4 ~= 44.876px
			setResTopNum( resAmoNum );                  // What: Reserve Top Commit. Why: TabTodCom reads this off the bus to actually pad its own list. How: This publishes resAmoNum into React state.



			const resEleArr = finTarFun( curSteObj.selStr ); // What: Reserve Element Array. Why: The scroll compensation below needs to re-resolve the target's own elements now that the reserve padding above has just been committed. How: This calls finTarFun again for the current step's own selStr.


			if ( resEleArr.length ) { // What: Re-Resolved Guard. Why: The target must still exist for the scroll compensation below to make sense. How: This only proceeds when resEleArr is non-empty.


				requestAnimationFrame( () => { // What: Scroll Compensation Frame. Why: The padding needs to have actually landed in the DOM first, so this re-measures the target after a frame rather than computing from tarRecObj, which is now stale. How: This recomputes the scroller and desired top freshly below, rather than reusing a scroller resolved before the frame, which may be stale by the time this runs.


					const freEleArr = finTarFun( curSteObj.selStr ); // What: Fresh Element Array. Why: The target's own geometry must be read again, now that the reserve padding has actually rendered. How: This calls finTarFun once more for the current step's own selStr.


					if ( !freEleArr.length ) return; // What: Fresh Target Guard. Why: The target may have disappeared in the meantime. How: This returns whenever freEleArr is empty.



					const freScrEle = getScrFun( freEleArr[ 0 ] );                                                             // What: Fresh Scroll Element. Why: The scroller itself may have changed too, now that the reserve padding has actually rendered, so this must be re-resolved fresh rather than reusing resScrEle from before the frame. How: This resolves the first fresh element's own scroller via getScrFun.
					const freTopNum = uniRecFun( freEleArr ).top;                                                              // What: Fresh Top Number. Why: This is the target's own real, post-padding top edge. How: This unions freEleArr and reads its own top.
					const desTopNum = safTopFun( { forCoaBoo : true } ) + rhyPxlFun( 'm01' ) + coaHeiNum + rhyPxlFun( 'bas' ); // What: Desired Top Number. Why: This scrolls so the target lands exactly coaHeiNum plus a base step below the safe floor, the same threshold the "fits above" check above uses, and what the coach's own render-time placement needs to actually seat it flush above the target instead of overlapping it. How: This adds the safe floor, its small-step margin, the coach's own height, and a base-step gap. // Vertical Rhythm Base Minus 1 = 11px, Vertical Rhythm Base ~= 14.572px


					scrAmoFun( freScrEle, freTopNum - desTopNum ); // What: Scroll By Desired Delta. Why: This is deliberately NOT a scroll that compensates for the padding just added (e.g. scrolling by +resAmoNum), since that would fully cancel the reserve's own effect, undoing the room it just opened up and leaving the coach exactly as short on space as before any reserve existed. How: This calls scrAmoFun with the gap between the target's own fresh top and its desired top.


				} );


			}


		};

		// #endregion decResFun

		// #endregion Reserve-Space Decision



		// #region Live Position And Watchdog Loop

		const scrPosFun = () => { // What: Scroll Position Function. Why: This repositions synchronously as scroll fires (before paint) so the highlight does not trail the content the way a purely rAF-driven fixed box does. How: This resolves the target fresh and, when found, repositions it via plaTarFun; listening broadly (capture) so it fires for whichever element scrolls.


			const curEleArr = finTarFun( curSteObj.selStr ); // What: Current Element Array. Why: The reposition below needs the target's own current elements. How: This resolves curSteObj.selStr fresh on every scroll event.


			if ( curEleArr.length ) plaTarFun( curEleArr ); // What: Reposition Call. Why: A target that is not currently found has nothing to reposition. How: This calls plaTarFun only when curEleArr is non-empty.


		};


		window.addEventListener( 'scroll', scrPosFun, { capture : true, passive : true } ); // What: Scroll Listener Add. Why: This is what actually keeps the highlight in sync during a manual scroll, not just briTarFun's own programmatic one. How: This adds scrPosFun in capture phase, passively, at the window.



		const nftValNum = 4000; // What: Not-Found-Timeout Value Number. Why: A step whose target never resolves (normally just the tab-sync effect's own selTabFun() still settling) would otherwise sit as a permanent dim with nothing to click, most likely on a resume, where a stale activeTour survived some app change that moved or removed the target. How: This is generous enough not to fire during ordinary mounting.

		let hasBroBoo = false; // What: Has Brought Boolean. Why: briTarFun above should only run once as soon as the target actually exists, not on every frame; the loop below flips this once that first call has happened. How: This starts false and is set true the first time the target is found inside the loop.
		let notFouNum = null;  // What: Not Found Number. Why: The watchdog below needs to track how long the target has been missing, not just whether it currently is. How: This starts null (never yet missing) and is set to a timestamp the first time the loop below finds nothing.
		let preScrNum = null;  // What: Previous Scroll Number. Why: This tracks the scrollable content's total height so a step whose target stays put (no tab/step change) but whose SURROUNDING content grows or shrinks, e.g. the user does the step's own action themselves without ever clicking the coach's Next, can still get nudged back into view. How: Ordinary scrolling never changes this value, so it does not fight the user scrolling around on purpose; only an actual content-size change re-triggers briTarFun; measured with resAmoNum subtracted out, otherwise decResFun's own CSS padding (added specifically to make room for the coach above a highlight too tall to fit either way) reads as "content grew", re-triggers briTarFun, and briTarFun scrolls the target right back up to its usual pad-from-top position, undoing the reserve and putting the coach right back on top of it.
		let pulPriBoo = true;  // What: Pulse Primary Boolean. Why: This tracks pulSelStr's own on/off transition (see its own doc comment in GuiTouCom's own JSDoc above) so falling back to the wider, no-longer-pulsing highlight also brings it into view, since the wider box can extend well past what the tight button-only highlight needed. How: This starts true so a step that never had a pulSelStr primary target at all (pulSelStr unset) never spuriously fires this on its first frame.



		// #region perFraFun

		/**
		 * perFraFun = Per Frame Function
		 *
		 * @summary
		 * The per-frame heartbeat of the position-tracking effect. While the target
		 * exists it brings it into view the first time, re-brings it when the page
		 * content changes size or a pulSelStr target stops matching, settles the
		 * reserve decision, places the spotlight and coach, and commits the rect to
		 * React state. While the target is missing it clears the rect and, after
		 * nftValNum milliseconds, skips the tour. It reschedules itself every frame
		 * until the effect is cancelled.
		 *
		 * @author z4nta0 <https://github.com/z4nta0>
		 *
		 * @param void - This function takes no parameters.
		 *
		 * @returns This function does not return anything.
		 *
		 * @example
		 * ```ts
		 * perFraFun() // => void
		 * ```
		 *
		*/

		const perFraFun = () => { // What: Per Frame Function. Why: This is the per-frame heartbeat: it re-resolves the target, positions it, decides reserve, tracks the not-found watchdog, and reschedules itself.


			if ( isaCanBoo ) return; // What: Cancelled Guard. Why: A cancelled effect must never schedule another frame. How: This returns immediately whenever isaCanBoo is already true.



			const curEleArr = finTarFun( curSteObj.selStr ); // What: Current Element Array. Why: Every branch below needs to know whether the target currently exists. How: This resolves curSteObj.selStr fresh on every frame.


			if ( curEleArr.length ) { // What: Target Found Branch. Why: The target currently exists, so this positions it and clears the not-found watchdog. How: This runs the full per-frame bookkeeping below.


				notFouNum = null; // What: Not-Found Reset. Why: The watchdog must reset the instant the target reappears. How: This clears notFouNum back to null.


				const curScrEle = getScrFun( curEleArr[ 0 ] );                                                       // What: Current Scroll Element. Why: The content-grew check below needs to know which element actually scrolls. How: This resolves the first matched element's own scroller.
				const isaDocBoo = curScrEle === document.scrollingElement || curScrEle === document.documentElement; // What: Is-A Document Boolean. Why: The document's own scroller reports its height through documentElement rather than itself. How: This compares curScrEle against both document.scrollingElement and document.documentElement.
				const rawHeiNum = isaDocBoo ? document.documentElement.scrollHeight : curScrEle.scrollHeight;        // What: Raw Height Number. Why: The content-grew check needs the scrollable content's own total height. How: This reads documentElement's own scrollHeight for the document scroller, otherwise the scroller's own.
				const scrHeiNum = rawHeiNum - resAmoNum;                                                             // What: Scroll Height Number. Why: The content-grew check compares this against preScrNum. How: This subtracts resAmoNum from rawHeiNum (see preScrNum's own doc comment above for why).


				if ( !hasBroBoo ) { // What: First Bring Check. Why: The target must be brought into view exactly once, the first time it actually exists. How: This only enters on that first frame.


					hasBroBoo = true; // What: Has Brought Commit. Why: Every later frame must skip this branch. How: This flips hasBroBoo to true.

					briTarFun(); // What: First Bring Call. Why: The target has just been found for the first time. How: This calls briTarFun.


				}

				else if ( preScrNum != null && Math.abs( scrHeiNum - preScrNum ) > 40 ) briTarFun(); // What: Content Grew Re-Bring. Why: See preScrNum's own doc comment above, the surrounding content changing size mid-step should re-trigger the bring. How: This re-calls briTarFun once the scroll height has moved by more than a 40px tolerance.

				else if ( curSteObj.pulSelStr ) { // What: Pulse Transition Check. Why: A pulSelStr step's own primary target can stop matching mid-step (e.g. a button widening to its whole surrounding window once clicked), and the wider fallback highlight needs bringing into view too.


					const isaPriBoo = !!document.querySelector( curSteObj.pulSelStr ); // What: Is-A Primary Boolean. Why: This is the live answer to whether the tight, pulsing target still matches. How: This checks curSteObj.pulSelStr directly against the document.


					if ( pulPriBoo && !isaPriBoo ) briTarFun(); // What: Pulse Transition Bring. Why: The wider fallback box can extend well past what the tight target needed. How: This re-calls briTarFun exactly on the frame the primary target stops matching.



					pulPriBoo = isaPriBoo; // What: Pulse Primary Commit. Why: The next frame's own check needs this frame's own answer to compare against. How: This overwrites pulPriBoo with isaPriBoo.


				}



				preScrNum = scrHeiNum; // What: Last Scroll Height Commit. Why: The next frame's own content-grew check needs this frame's own scroll height to compare against. How: This overwrites preScrNum with scrHeiNum.

				decResFun( curEleArr ); // What: Reserve Decision Call. Why: Every frame gets a chance to settle the once-per-step reserve decision. How: This calls decResFun with the currently-resolved elements.

				const tarRecObj = plaTarFun( curEleArr ); // What: Target Rect Object. Why: The spotlight/coach must actually be positioned every frame. How: This calls plaTarFun, which both writes the DOM directly and returns the placed rect.


				setCurRecObj( ( preRecObj ) => { // What: Rect State Commit. Why: React state should only actually change when the placement moved by a meaningful amount, avoiding a render storm from sub-pixel jitter. How: This keeps the previous state object when every field is within tolerance, otherwise commits a fresh { height, left, top, width } snapshot.


					const tarSnaObj = { height : tarRecObj.height, left : tarRecObj.left, top : tarRecObj.top, width : tarRecObj.width }; // What: Target Snapshot Object. Why: React state should hold a plain copy of the placed rect, not the live rect object itself. How: This copies tarRecObj's own four placement fields.



					if ( !preRecObj ) return tarSnaObj; // What: First Rect Guard. Why: There is no previous rect to compare against yet. How: This commits the fresh snapshot straight away.



					const heiSamBoo = preRecObj.height === tarRecObj.height;             // What: Height Same Boolean. Why: A height change always counts as a real move. How: This compares both heights exactly.
					const lefSamBoo = Math.abs( preRecObj.left - tarRecObj.left ) < 0.5; // What: Left Same Boolean. Why: Sub-pixel jitter on the left edge should not count as a move. How: This allows under half a pixel of difference.
					const topSamBoo = Math.abs( preRecObj.top - tarRecObj.top ) < 0.5;   // What: Top Same Boolean. Why: Sub-pixel jitter on the top edge should not count as a move. How: This allows under half a pixel of difference.
					const widSamBoo = preRecObj.width === tarRecObj.width;               // What: Width Same Boolean. Why: A width change always counts as a real move. How: This compares both widths exactly.

					const samRecBoo = heiSamBoo && lefSamBoo && topSamBoo && widSamBoo; // What: Same Rect Boolean. Why: Only a rect unchanged on every field can keep the previous state object. How: This combines the four field checks above.



					return samRecBoo ? preRecObj : tarSnaObj; // What: Rect State Return. Why: Returning the same object tells React nothing changed, so no render follows. How: This keeps preRecObj when the rect is the same, otherwise returns the fresh snapshot.


				} );


			}

			else { // What: Target Not Found Branch. Why: The target currently does not exist, so this drives the not-found watchdog instead.


				setCurRecObj( null ); // What: Rect Clear. Why: Nothing should render as highlighted while the target is missing. How: This clears the React rect state back to null.



				if ( notFouNum == null ) notFouNum = performance.now(); // What: Not-Found Start. Why: The watchdog needs a timestamp to measure how long the target has been missing. How: This records the current time the first frame the target is missing.

				else if ( performance.now() - notFouNum > nftValNum ) { // What: Not-Found Timeout Check. Why: A target that never resolves within nftValNum must not leave a permanent, unclickable dim on screen. How: This enters once the missing duration exceeds nftValNum.


					isaCanBoo = true; // What: Loop Cancel. Why: No further frame may run once the tour is being skipped. How: This flips isaCanBoo to true.

					skiTouFun(); // What: Not-Found Skip Call. Why: A missing target is never genuine completion. How: This ends the tour through skiTouFun.



					return; // What: Not-Found Early Return. Why: The frame must not reschedule itself below. How: This exits before the requestAnimationFrame call.


				}


			}



			rafIdeNum = requestAnimationFrame( perFraFun ); // What: Frame Reschedule. Why: This heartbeat must keep running for as long as the step is up. How: This schedules the next call to perFraFun on the next animation frame.


		};

		// #endregion perFraFun



		rafIdeNum = requestAnimationFrame( perFraFun ); // What: Loop Start. Why: The very first frame should also go through requestAnimationFrame, consistent with every later one. How: This schedules the first call to perFraFun.



		return () => { // What: Effect Cleanup Return. Why: The loop, any queued frame, and the scroll listener must all stop once the step changes or this component unmounts. How: This cancels, then removes each of them.


			isaCanBoo = true; // What: Cancel Flag Set. Why: Every scheduled callback checks this before doing anything once the step changes or this component unmounts. How: This flips isaCanBoo to true so any already-queued frame becomes a no-op.

			cancelAnimationFrame( rafIdeNum ); // What: Frame Cancel Call. Why: A frame that hasn't fired yet must not fire after cleanup either. How: This cancels whatever frame rafIdeNum currently holds.

			window.removeEventListener( 'scroll', scrPosFun, { capture : true } ); // What: Scroll Listener Remove. Why: The scroll listener must stop firing once this effect cleans up. How: This removes the same scrPosFun reference, matching the capture-phase flag used when it was added.


		};

		// #endregion Live Position And Watchdog Loop


	}, [ curSteNum, curSteObj && curSteObj.selStr ] ); // What: Effect Dependency Array. Why: This must re-run whenever the step index moves (a genuinely new step to track) or, for the very same step, whenever its own selStr changes identity (steps are rebuilt as fresh objects on every render, so this is really just watching the one field that actually decides what to track). How: curSteNum is the step position itself, and curSteObj && curSteObj.selStr is the specific selector that drives everything inside this effect.



	const porBodFun = ( porNodEle ) => createPortal( porNodEle, document.body ); // What: Portal Body Function. Why: Every branch of this component's own render needs to portal its JSX onto document.body rather than wherever GuiTouCom happens to be mounted in the tree. How: This forwards porNodEle straight into React's own createPortal.



	if ( !curSteObj ) { // What: No Step Render Guard. Why: A step index advanced past the end of a `steObjArr` array whose last entry is not priStr:'Done' yet (most likely mid-content-authoring) is caught by the position-tracking effect above, which already calls skiTouFun the moment it sees this, but that is a separate effect firing after this render commits, so this render still needs to not crash reading off a null curSteObj in the meantime. How: This returns the same one-frame dim-only fallback as the "target not found yet" case below.


		return porBodFun( // What: Dim Only Portal Return. Why: There is no step to show, so only the dim belongs on screen. How: This portals the dim-only overlay onto document.body.


			<div
				className={ cssModObj.touOveDiv }

				data-element-name-hook='touOveDiv'

				aria-live='polite'
			>{ /* What: Tour Overlay Div Element. Why: This is the overlay root every render branch portals. How: This wraps the dim alone here. Its data-element-name-hook is read by help mode's own outside-click check. */ }


				<div className={ cssModObj.touDimDiv } />{ /* What: Tour Dim Div Element. Why: The page stays dimmed for the single frame before the tour skips itself. How: This renders the plain dim layer. */ }


			</div>


		);


	}



	const totSteNum = steObjArr.length;                                                                                // What: Total Step Number. Why: The progress line below needs the total step count. How: This reads steObjArr.length once per render.
	const vieWidNum = window.innerWidth;                                                                               // What: Viewport Width Number. Why: The coach's own sizing below needs the current viewport width. How: This is read fresh from window on every render.
	const vieHeiNum = window.innerHeight;                                                                              // What: Viewport Height Number. Why: The coach's own sizing below needs the current viewport height. How: This is read fresh from window on every render.
	const coaWidNum = coaWidFun( vieWidNum );                                                                          // What: Coach Width Number. Why: The coach card should fit its body text like help mode's tip, within a narrow viewport. How: This asks coaWidFun for the text-based width, capped to the viewport.
	const priLabStr = curSteObj.priStr + ( ( curSteObj.priStr !== 'Done' && !curSteObj.solBoo ) ? ' ›' : '' );         // What: Primary Label String. Why: The measurer and both real Next buttons render the same label. How: This appends a trailing arrow glyph to curSteObj.priStr unless the step is 'Done' or solo.
	const shoPulBoo = curSteObj.cirBoo && ( !curSteObj.pulSelStr || !!document.querySelector( curSteObj.pulSelStr ) ); // What: Should Pulse Boolean. Why: See pulSelStr's own doc comment in GuiTouCom's own JSDoc above, this defaults to matching cirBoo exactly when unset, so every other cirBoo step pulses for its whole duration same as before. How: This is true whenever the step requires a click and either names no pulSelStr at all, or its own pulSelStr currently matches something.



	const meaCoaEle = ( // What: Measurer Coach Element. Why: This is a hidden clone of the coach, rendered off-screen the moment a step's content is known, BEFORE its target (and so curRecObj) resolves, unlike the real coach below; its only job is to give meaCoaRef's own layout effect something to measure early enough for decResFun (which runs inside the position-tracking effect, as soon as the target is first found, before the real coach exists in the DOM at all) to see this step's REAL height instead of a stale one measured off whatever the previous, possibly shorter, step happened to be.


		<div
			ref={ meaCoaRef }

			className={ cssModObj.coaCarDiv }

			style={{
				left          : -9999,
				pointerEvents : 'none',
				position      : 'fixed',
				top           : 0,
				visibility    : 'hidden',
				width         : coaWidNum
			}}

			data-element-name-hook='coaCarDiv'

			aria-hidden='true'
		>{ /* What: Measurer Coach Element. Why: This is the hidden clone described above. How: This renders the exact same content as the real coach below, but off-screen and pointer-events:none. Its data-element-name-hook is read by the tour runner's own outside-click checks. */ }


			{ !curSteObj.solBoo && <p className={ cssModObj.coaProPar }>Step { curSteNum + 1 } of { totSteNum }</p> }{ /* What: Coach Progress Paragraph Element. Why: Every non-solo step shows its own position in the sequence. How: This renders only when curSteObj.solBoo is falsy. */ }

			<p className={ cssModObj.coaTitPar }>{ curSteObj.titStr }</p>{ /* What: Coach Title Paragraph Element. Why: Every step needs its own heading text. How: This renders curSteObj.titStr directly. */ }

			<p className={ cssModObj.coaBodPar }>{ curSteObj.bodEle }</p>{ /* What: Coach Body Paragraph Element. Why: Every step needs its own explanatory copy. How: This renders curSteObj.bodEle directly. */ }


			<div className={` ${ cssModObj.coaRowDiv }   ${ curSteObj.solBoo ? cssModObj.coaRowDivSolo : '' } `}>{ /* What: Coach Row Div Element. Why: This groups the Skip/Back/Next controls into one row, stretched full-width for a solo step. How: This adds the ob-crow--solo modifier class whenever curSteObj.solBoo is true. */ }


				{ !curSteObj.solBoo && ( // What: Left Nav Visibility Check. Why: A solo step hides the Skip/Back row entirely, per solBoo's own doc comment in GuiTouCom's own JSDoc above. How: This renders the left nav only for a non-solo step.


					<div className={ cssModObj.lefNavDiv }>{ /* What: Left Nav Div Element. Why: This groups Skip and the optional Back button together on the row's own left side. How: This is only rendered for a non-solo step. */ }


						<button className={ cssModObj.touSkiBut }>Skip</button>{ /* What: Tour Skip Button Element. Why: This is the measurer's own inert copy of the real Skip button. How: This has no onClick, since the measurer is never actually interactive. */ }

						{ curSteObj.bacBoo && <button className={ cssModObj.touBacBut }>&lsaquo; Back</button> }{ /* What: Tour Back Button Element. Why: Only a step that opts in via `bacBoo` shows this. How: This is the measurer's own inert copy of the real Back button. */ }


					</div>


				) }

				<button
					className={ cssModObj.touNexBut }

					disabled={ curSteObj.cirBoo }
				>{ priLabStr }</button>{ /* What: Tour Next Button Element. Why: This is the measurer's own inert copy of the real Next/Done button, disabled exactly when the real one would be. How: This renders priLabStr. */ }


			</div>


		</div>


	);



	if ( !curRecObj ) { // What: No Rect Render Guard. Why: The target has not resolved yet (mid-navigation). How: This shows only the dim; the visible coach appears once its target resolves, so no stale/centered flash, but the hidden measurer still needs to be here so its height is ready by the time the target IS found.


		return porBodFun( // What: Dim And Measurer Portal Return. Why: Until the target resolves, the page stays dimmed while the hidden measurer sizes the coach. How: This portals the dim and meaCoaEle onto document.body.


			<div
				className={ cssModObj.touOveDiv }

				data-element-name-hook='touOveDiv'

				aria-live='polite'
			>{ /* What: Tour Overlay Div Element. Why: This is the overlay root every render branch portals. How: This wraps the dim and the hidden measurer here. Its data-element-name-hook is read by help mode's own outside-click check. */ }


				<div className={ cssModObj.touDimDiv } />{ /* What: Tour Dim Div Element. Why: Nothing is highlighted yet, so the whole page stays dimmed. How: This renders the plain dim layer. */ }



				{ meaCoaEle }{ /* What: Measurer Coach Element Render. Why: The measurer must already be mounted so its height is ready once the target is found. How: This renders meaCoaEle unchanged. */ }


			</div>


		);


	}



	const spoPadNum = curSteObj.cirBoo ? 0 : rhyPxlFun( 'm02' );                          // What: Spotlight Pad Number. Why: See plaTarFun's own spoPadNum comment above, this is the render-time twin of that same value. How: This is 0 for a cirBoo step, otherwise the normal m02 step. // Vertical Rhythm Base Minus 2 ~= 8.304px
	const coaLayObj = coaLayFun( curRecObj, coaHeiNum, coaWidNum, vieWidNum, vieHeiNum ); // What: Coach Layout Object. Why: This is the same shared math plaTarFun uses imperatively every frame, kept here too as the coach's own first-paint value each step and the eventual React-driven fallback once it catches up. How: This calls coaLayFun with the current curRecObj, coaHeiNum, and the current viewport/coach sizes; catBoo needs no special branch here at all any more, letting it fall through to the exact same below/above logic every other step already uses is what lets the coach flip to sit BELOW the target (arrow up) once there is room, instead of only ever attaching above it, since catBoo's own remaining job is upstream of this (skipping decResFun's own padding and giving briTarFun a precise initial scroll target).
	const arrHorNum = arrHorFun( curRecObj, coaLayObj.left, coaWidNum );                  // What: Arrow Horizontal Number. Why: The real, visible coach's own render-time arrow position needs the same math plaTarFun uses imperatively. How: This calls arrHorFun with the current curRecObj and coaLayObj's own left.



	return porBodFun( // What: Tour Overlay Portal Return. Why: The overlay must render onto document.body so it clamps to the viewport instead of being clipped by an ancestor's own overflow. How: This portals the measurer, the spotlight, and the real coach together.


		<div
			className={ cssModObj.touOveDiv }

			data-element-name-hook='touOveDiv'

			aria-live='polite'
		>{ /* What: Tour Overlay Div Element. Why: This is the overlay root every render branch portals. How: This wraps the hidden measurer, the spot, and the coach together. Its data-element-name-hook is read by help mode's own outside-click check. */ }


			{ meaCoaEle }{ /* What: Measurer Coach Element Render. Why: The hidden measurer must stay mounted for every render this branch produces, not just the early pre-resolve branch above, so meaCoaRef's own layout effect keeps measuring the step's real, current height. How: This renders the same meaCoaEle already built above, unchanged in this branch. */ }



			<div
				ref={ spoEleRef }

				className={` ${ cssModObj.touSpoDiv }   ${ shoPulBoo ? cssModObj.touSpoDivPulse : '' } `}

				style={{
					height     : curRecObj.height + spoPadNum * 2,
					left       : curRecObj.left - spoPadNum,
					top        : curRecObj.top - spoPadNum,
					transition : 'none',
					width      : curRecObj.width + spoPadNum * 2
				}}

				data-spot-drag-active={ draActBoo || undefined } // What: Spot Drag Active Attribute. Why: The spotlight drops its dimming shadow while a group or item is dragged, so the page underneath stays visible. How: This sets the presence-only attribute while draActBoo is true and removes it otherwise, since undefined leaves it off.
			/>{ /* What: Tour Spotlight Div Element. Why: This is the actual cutout highlight drawn around the target. How: This pads curRecObj outward by spoPadNum on every side, disables any CSS transition since plaTarFun already moves it imperatively every frame, and marks its drag state with data-spot-drag-active and its pulse with a module class. */ }{ /* The highlight border itself stays during a drag (still marks the section being dragged); only its box-shadow, which is what dims the REST of the page (the touSpoDiv trick: a giant shadow darkens everything outside its own bounds), drops out, via the data-spot-drag-active override. Otherwise the darkened background would make it hard to see exactly where the group is landing. */ }



			{ !draActBoo && ( // What: Coach Visibility Check. Why: The coach card must hide entirely during a drag gesture, per draActBoo's own doc comment above. How: This renders the coach only while no drag is in progress.


				<div
					ref={ reaCoaRef }

					className={` ${ cssModObj.coaCarDiv }   ${ coaLayObj.arrStr === 'coaCarDiv--up' ? cssModObj.coaCarDivUp : '' }   ${ coaLayObj.arrStr === 'coaCarDiv--down' ? cssModObj.coaCarDivDown : '' } `}

					style={{
						'--coa-arr-off' : arrHorNum + 'px',
						left      : coaLayObj.left,
						top       : coaLayObj.top,
						width     : coaWidNum
					}}

					data-element-name-hook='coaCarDiv'
				>{ /* What: Coach Card Div Element. Why: This is the real, visible, interactive coach card. How: This positions itself from coaLayObj, coaWidNum, and arrHorNum, and renders its own arrow direction class. Its data-element-name-hook is read by the tour runner's own outside-click checks. */ }


					{ !curSteObj.solBoo && <p className={ cssModObj.coaProPar }>Step { curSteNum + 1 } of { totSteNum }</p> }{ /* What: Coach Progress Paragraph Element. Why: Every non-solo step shows its own position in the sequence. How: This renders only when curSteObj.solBoo is falsy. */ }

					<p className={ cssModObj.coaTitPar }>{ curSteObj.titStr }</p>{ /* What: Coach Title Paragraph Element. Why: Every step needs its own heading text. How: This renders curSteObj.titStr directly. */ }

					<p className={ cssModObj.coaBodPar }>{ curSteObj.bodEle }</p>{ /* What: Coach Body Paragraph Element. Why: Every step needs its own explanatory copy. How: This renders curSteObj.bodEle directly. */ }


					<div className={` ${ cssModObj.coaRowDiv }   ${ curSteObj.solBoo ? cssModObj.coaRowDivSolo : '' } `}>{ /* What: Coach Row Div Element. Why: This groups the Skip/Back/Next controls into one row, stretched full-width for a solo step. How: This adds the ob-crow--solo modifier class whenever curSteObj.solBoo is true. */ }


						{ !curSteObj.solBoo && ( // What: Left Nav Visibility Check. Why: A solo step hides the Skip/Back row entirely, per solBoo's own doc comment in GuiTouCom's own JSDoc above. How: This renders the left nav only for a non-solo step.


							<div className={ cssModObj.lefNavDiv }>{ /* What: Left Nav Div Element. Why: This groups Skip and the optional Back button together on the row's own left side. How: This is only rendered for a non-solo step. */ }


								<button
									className={ cssModObj.touSkiBut }

									onClick={ skiTouFun }
								>Skip</button>{ /* What: Tour Skip Button Element. Why: This ends the tour as a non-completion, per skiTouFun's own comment above. How: This calls skiTouFun on click. */ }

								{ curSteObj.bacBoo && ( // What: Back Visibility Check. Why: Only a step that opts in via `bacBoo` shows Back. How: This renders the Back button only while curSteObj.bacBoo is true.


									<button
										className={ cssModObj.touBacBut }

										onClick={ bacSteFun }
									>&lsaquo; Back</button> // What: Tour Back Button Element. Why: Back reverses to the previous step. How: This calls bacSteFun on click.


								) }


							</div>


						) }



						{ curSteObj.cirBoo ? ( // What: Require-Click Check. Why: A cirBoo step needs its Next button disabled and explained instead of the normal clickable one. How: This renders the InfTipCom-wrapped disabled button while curSteObj.cirBoo is true.


							<InfTipCom labTexStr='Please click the indicated element in order to advance.'>{ /* What: Require-Click Info Tip Element. Why: A cirBoo step's Next button is disabled, and the user needs to be told why. How: This wraps the disabled button below with a hover/tap hint. */ }


								<button
									className={ cssModObj.touNexBut }

									disabled
								>{ priLabStr }</button>{ /* What: Tour Next Button Element. Why: The user must click the highlighted target itself to advance, not this button. How: This renders priLabStr, always disabled. */ }


							</InfTipCom>


						) : ( // What: Normal Next Branch. Why: A step without cirBoo just needs the plain clickable button. How: This renders the else branch, taken while curSteObj.cirBoo is false.


							<button
								className={ cssModObj.touNexBut }

								onClick={ priActFun }
							>{ priLabStr }</button> // What: Tour Next Button Element. Why: A step without cirBoo needs a real, clickable way to advance instead of the disabled InfTipCom-wrapped one above. How: This renders priLabStr and calls priActFun on click.


						) }


					</div>


				</div>


			) }


		</div>


	);


}

// #endregion GuiTouCom

// #endregion Components



// #region Exports

export { GuiTouCom, todTopFun }; // What: Named Exports. Why: Every onboarding-*-tours.jsx module renders GuiTouCom as its own shared tour engine, and onboarding/welcome-tour.jsx calls todTopFun directly to reset scroll position. How: This re-exports the 2 declared above; every other binding in this file is internal-only.

// #endregion Exports


