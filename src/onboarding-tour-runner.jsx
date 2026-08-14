import React from 'react';
import { createPortal } from 'react-dom';
import { emlTour, useEmlTour } from './eml-tour-bus.js';
import { InfoTip, reduceMotion } from './ui.jsx';

// Generic guided-tour engine: sequential single-spotlight steps with a coach
// card (Step N of N, Skip/Back/Next). Shared by the Welcome Tour
// (onboarding.jsx) and every per-feature mini-tour built on it — this file
// owns none of any specific tour's content or business logic, only the
// mechanics: spotlight positioning, the chrome clamp, the click-guard, the
// not-found watchdog, tab-sync, the mobile rail auto-open, resume-on-reload
// persistence. NOT used by the planned on-demand help mode — that's
// simultaneous multi-highlight with no dimming that blocks clicks and no
// sequential coach, a genuinely different engine.
//
// A step is:
//   sel      — CSS selector(s) for the element(s) to highlight (comma-
//              separated fallbacks honored in order — findTargets tries each
//              in turn and uses the first that matches anything).
//   clickSel — optional override for what counts as "on target" for the
//              click-guard/requireClick logic specifically (spotlight
//              tracking, scroll-into-view, and advanceWhen's own default
//              still key off `sel`). Defaults to `sel` — only needed when a
//              step highlights a BIGGER box than what it actually wants
//              clicked, e.g. the whole picker stage+actions area with
//              multiple buttons in it, only one of which should count.
//              Without this, any click landing anywhere inside `sel`
//              (including a disabled sibling button, since a disabled
//              element with pointer-events:none passes its click through to
//              whatever's underneath — typically the highlighted container
//              itself) would satisfy requireClick, which is almost never
//              what a step author actually wants from a highlight that's
//              wider than its real target.
//   title/body — coach card copy.
//   tab      — which app tab this step's target lives on. The tour switches
//              there automatically whenever the active tab doesn't already
//              match — covers ordinary advancing AND a resume (there's no
//              "previous step" to have navigated there on a resume) AND
//              going back, so step authors never call selectTab themselves.
//   back     — whether to show the Back button.
//   primary  — button label; 'Done' finishes the tour instead of advancing.
//   run      — optional side effect fired when the primary button is
//              clicked, before advancing/finishing (e.g. running the real
//              generator). Pure side effect — which step/tab comes next is
//              handled generically, not by run() itself.
//   scrollToTop — true if this step's target starts right at the top of the
//              page anyway (e.g. a full-list review step), so landing on it
//              scrolls all the way to 0 instead of just nudging the target
//              into view.
//   scrollToBottom — the same idea, inverted: true if this step's target
//              always sits at the very bottom of its page/form (e.g. a
//              footer button), so landing on it scrolls all the way to the
//              end instead of nudging — more reliable than the pad-based
//              nudge when the surrounding content just changed shape (a
//              form switching sub-steps) and the carried-over scroll
//              position no longer means anything.
//   coachAtTop — true if this step's target can be TALLER than the
//              viewport itself (e.g. a highlighted region that's most of a
//              mobile screen's height). The normal reserve-space logic
//              (decideReserve below) only solves "does the coach fit
//              adjacent to the target" — it pads the target further down
//              the page to make room for the coach above it, which is
//              exactly backwards when the target is already tall enough to
//              fill the viewport: the padding pushes its own bottom edge
//              past the fold instead of helping. Skips decideReserve
//              entirely and gives bring() a precise initial scroll target
//              (the target starts right below where the coach will land)
//              instead of the general pad/padB math, which doesn't reliably
//              land a too-tall target anywhere useful on the very first
//              frame. The coach's own ONGOING position needs no special
//              case at all beyond that — the normal below/above placement
//              logic already reacts to rect (which is clamped to the safe
//              viewport area, not the target's full height), so it
//              naturally sits above the target while most of it is still
//              below the fold and flips to sit below it, arrow up, once
//              the user has scrolled far enough that the target's real
//              bottom edge comes into view with room to spare.
//   requireClick — true if this step teaches the real interface rather than
//              narrating it: Next is disabled (with a hover/tap hint) and
//              the step only advances when the user clicks the highlighted
//              target itself — the same click-guard exemption that already
//              lets a target's own click through now also triggers the
//              primary action (run(), then advance) instead of a no-op.
//   resumable — defaults to true (every Welcome Tour step qualifies, since
//              its targets are all durable/already-rendered). Set false on
//              a step whose target only exists because an EARLIER step's
//              un-persisted side effect put it there (e.g. a form opened by
//              a previous click) — a reload wipes that side effect, so
//              resuming directly into such a step would highlight nothing
//              and just trip the not-found watchdog a few seconds later.
//              The persisted resume checkpoint (see the effect below) only
//              ever advances to a resumable step, so a tour with a long
//              non-resumable tail still resumes at its last safe step
//              instead of being knocked all the way back to the intro.
//
// Props:
//   tourId     — this tour's slot key in state.onboarding.activeTour, e.g.
//                'welcome'. The ONLY thing enforcing "one guided tour at a
//                time" is that only one GuidedTour is ever mounted at once —
//                tourId just labels whichever one that is for persistence.
//   steps      — the array described above.
//   resumeStep — initial step index (the caller decides whether/what to
//                resume, e.g. gating on its own intro-modal state — this
//                component doesn't read activeTour itself, only writes it
//                going forward).
//   actions, active, selectTab — same app plumbing every tab already gets.
//   onGoBack   — optional (targetStepIndex) => void, side effects to run
//                before navigating back to a given step (e.g. undoing
//                something a later step did). Called before the step
//                actually changes.
//   onFinish   — called on genuine completion only: the primary button on a
//                step whose `primary` is 'Done'. After this component's own
//                cleanup (activeTour, the bus's phase, the body class) has
//                already run.
//   onSkip     — called for everything else the tour can end from: the Skip
//                button, a target that never resolves (the not-found
//                watchdog), or a resumed/advanced step index past the end of
//                `steps`. Optional — omit it to route all of these through
//                onFinish instead, for a tour with nothing tracking the
//                distinction (e.g. the Welcome Tour).

// Conservative estimate of the coach card's own height — good enough to
// decide whether it fits above/below a step's highlighted target; the real
// value depends on each step's body-text length, which isn't measured.
// Shared by the reserve-space calculation and the coach's own placement.
const OB_COACH_H = 220;

// The lowest screen-y a spotlight/coach can safely sit without landing
// under fixed/sticky Today-tab chrome: the sticky header, PLUS — on mobile,
// where the groups rail flips from a side column to a horizontal pill bar
// stacked below the header — that rail too, PLUS the Edit Mode banner
// (present whenever editMode is on, any width — see tab-today.jsx's
// editmode-banner, which sits sticky just below the header and, despite
// being in normal flow, doesn't actually push .today-layout's content down
// to clear it). Shared by the spotlight clamp, the reserve-space decision,
// the coach's own placement, AND bring()'s own scroll-up nudge, so all four
// agree on where "safe" starts.
const obSafeTop = () => {
  const header = document.querySelector('.today-h');
  let bottom = header ? header.getBoundingClientRect().bottom : 0;
  const rail = document.querySelector('.group-rail');
  if (rail && getComputedStyle(rail).flexDirection === 'row') {
    bottom = Math.max(bottom, rail.getBoundingClientRect().bottom);
  }
  const banner = document.querySelector('.editmode-banner');
  if (banner) bottom = Math.max(bottom, banner.getBoundingClientRect().bottom);
  return bottom;
};

// The highest screen-y a spotlight/coach can safely reach without landing
// UNDER the floating bottom tab bar (tabPlacement 'bottom' only — the other
// two placements don't occupy this edge, so there's nothing to clamp against
// and this returns the viewport height, i.e. no constraint). Mirrors
// obSafeTop's job for the opposite edge.
const obSafeBottom = () => {
  const bar = document.querySelector('.tabbar--bottom');
  return bar ? bar.getBoundingClientRect().top : window.innerHeight;
};

// Where the coach should sit relative to the (already clamped) highlight
// rect `r` — shared by the render function's own React-driven placement AND
// place()'s imperative per-frame write below, so the two can never disagree.
// Having both matters: place() is what keeps the coach in lockstep with the
// highlight DURING a smooth scroll (see its own comment), but React's
// render still needs the same math for the coach's very first paint each
// step (before place() has run at all) and as the eventual-consistency
// fallback once React catches up.
const computeCoachLayout = (r, coachHVal, coachWVal, vw, vh) => {
  const left = Math.max(12, Math.min(r.left, vw - coachWVal - 12));
  const safeTop = obSafeTop() + 12;
  const spaceBelow = vh - (r.top + r.height);
  if (spaceBelow >= coachHVal + 16) return { top: r.top + r.height + 16, left, arrowClass: 'ob-coach--up' };
  return { top: Math.max(r.top - 16 - coachHVal, safeTop), left, arrowClass: 'ob-coach--down' };
};
const computeArrowX = (r, coachLeft, coachWVal) => Math.max(18, Math.min(r.left + r.width / 2 - coachLeft, coachWVal - 26));

// Shared by every tour's Skip action (both the intro modal's and, once a
// tour is under way, the coach card's) — skipping should always land back on
// a pristine Today, not wherever a mid-tour tab-switch or scroll happened to
// leave things. Exported so onboarding.jsx's intro-modal Skip (which fires
// before any GuidedTour is even mounted) can reuse the exact same behavior.
const goToTodayTop = (active, selectTab) => {
  if (active !== 'today') selectTab('today');
  requestAnimationFrame(() => {
    const main = document.querySelector('.main');
    if (main) main.scrollTop = 0;
    window.scrollTo(0, 0);
  });
};

function GuidedTour({ tourId, steps, resumeStep, actions, active, selectTab, onGoBack, onFinish, onSkip }) {
  // Published by tab-today.jsx's group/item drag handlers (see REORDER's
  // own onStart/onEnd hooks) for the duration of a reorder gesture — the
  // coach card can sit right over whatever's being dragged, making it hard
  // to see where to drop. Only the coach hides; the spotlight/dim stay so
  // the highlighted target is still visible to drop onto.
  const { dragging } = useEmlTour();
  const [step, setStep] = React.useState(resumeStep || 0);
  const [rect, setRect] = React.useState(null);
  // Extra top-space (px) reserved above the Today list, ON the Today tab,
  // when the current step's highlight is too tall for the coach to fit
  // above or below it. Published on the bus (see the effect below) so
  // TabToday can push its list content down by this amount rather than the
  // coach card overlaying (and hiding) part of what's highlighted. Generic
  // — driven by rect/viewport math, not any specific step — so any future
  // tour step with a too-tall highlight gets this automatically.
  const [reserveTop, setReserveTop] = React.useState(0);
  const hadRectRef = React.useRef(false); // suppress the spot's slide-in on first paint
  const spotRef = React.useRef(null); // positioned imperatively each frame (no React lag)
  const coachRef = React.useRef(null); // the off-screen measurer clone — see its own comment below
  const realCoachRef = React.useRef(null); // the real, visible coach — also positioned imperatively each frame, see place()
  // The coach's REAL rendered height, measured after paint — OB_COACH_H is
  // only a rough estimate (used as the initial value here, before any step
  // has actually been measured) and steps with longer body text render
  // taller than it. Using the stale estimate for the "place above" branch
  // below made a long step's coach overlap the top of its own target instead
  // of sitting flush above it. No deps: runs after every render, but only
  // commits a new value (and thus only triggers another render) when the
  // measurement actually changed, so this settles instead of looping.
  const [coachH, setCoachH] = React.useState(OB_COACH_H);
  // The position-tracking effect below reads this ref, not `coachH`
  // directly — that effect's own deps are [step, cur.sel], so whenever
  // React re-renders WITHOUT those changing (exactly what happens right
  // after this same layout effect corrects `coachH` for a step whose
  // coach differs in height from whatever step came before it), React
  // reuses the position-tracking effect's ORIGINAL closure rather than
  // the fresher one from the new render — permanently freezing whatever
  // coachH was still stale at that render. decideReserve read that frozen
  // value forever after, most visible navigating Back into a step whose
  // coach is taller than the one it's coming from.
  const coachHRef = React.useRef(coachH);
  coachHRef.current = coachH;
  React.useLayoutEffect(() => {
    const h = coachRef.current && coachRef.current.offsetHeight;
    if (h && h !== coachH) setCoachH(h);
  });

  // Publish on the bus for the duration this component is mounted — other
  // tabs read bus.phase === 'tour' to know a guided tour of SOME kind is
  // active, without caring which one (see e.g. tab-today.jsx's
  // obShowEmpty/obShowNoRun, app.jsx's rail sync). Cleared back to 'off' on
  // unmount, however that happens.
  React.useEffect(() => {
    emlTour.set({ phase: 'tour' });
    // reserveTop is republished continuously while mounted (see the effect
    // below), but nothing clears it once this component unmounts — the last
    // step's value would otherwise linger on the bus forever, permanently
    // padding Today's list even after the tour is long over.
    return () => { emlTour.set({ phase: 'off', reserveTop: 0 }); };
  }, []);
  React.useEffect(() => { emlTour.set({ step }); }, [step]);
  // Lets a consumer that needs to act only during a SPECIFIC tour's specific
  // step (not just "some tour is up", like phase/step alone give you) tell
  // them apart — e.g. tab-picker.jsx disabling its own "Add new picker"
  // button only during the Pickers page tour's own Step 4, not any other
  // tour that happens to pass through step index 3. Never cleared on
  // unmount (like `step` itself isn't) — consumers already have to gate on
  // `phase === 'tour'` too, which IS cleared, so a stale tourId left over
  // from the last tour can't be read as still current.
  React.useEffect(() => { emlTour.set({ tourId }); }, [tourId]);

  // Persist progress as it advances, so a reload can resume from wherever
  // this tour is — the caller is responsible for reading
  // state.onboarding.activeTour back out as `resumeStep` on mount (and for
  // only ever mounting one GuidedTour at a time); tourId just labels this
  // tour's slot in that shared field. Only actually persists a step marked
  // resumable (default true — see that field's own comment above); landing
  // on a non-resumable step (forward OR back) leaves the last persisted
  // checkpoint alone, so it always names the latest SAFE step to resume at.
  React.useEffect(() => {
    if (steps[step] && steps[step].resumable === false) return;
    actions.setOnboarding({ activeTour: { id: tourId, step } });
  }, [step]);

  // Genuine completion only — the primary button on a step whose `primary`
  // is 'Done'. Also lands back on a pristine, scrolled-to-top Today, same as
  // skip() below, so a caller's last step doesn't need to remember to also
  // be scrollToTop just to stick the landing.
  const finish = React.useCallback(() => {
    actions.setOnboarding({ activeTour: null });
    onFinish();
    goToTodayTop(active, selectTab);
  }, [onFinish, active, selectTab]);
  // Everything that ISN'T genuine completion: the Skip button, but also the
  // two internal safety nets below (a target that never resolves, or a
  // resumed/advanced step index past the end of `steps`) — none of these
  // mean the tour's content was actually finished, so they're routed away
  // from onFinish. onSkip is optional: a caller that doesn't need the
  // distinction (e.g. the Welcome Tour, which isn't tracked in a per-tour
  // checklist) can omit it and everything still funnels through onFinish.
  const skip = () => {
    actions.setOnboarding({ activeTour: null });
    // Same suppression as goBack's own onGoBack call (see suppressGuardRef's
    // doc comment) — a caller's onSkip can drive real synthetic clicks to
    // undo in-progress state (e.g. clicking Edit Mode's real Cancel button),
    // and curRef.current still points at the step being left, so without
    // this the guard reads that click as off-target and blocks it via
    // preventDefault/stopPropagation before the target's own handler runs.
    suppressGuardRef.current = true;
    (onSkip || onFinish)();
    suppressGuardRef.current = false;
    goToTodayTop(active, selectTab);
  };

  // While a tour runs, pad the scrollable content so bottom-anchored targets
  // can scroll clear of the floating tab bar.
  React.useEffect(() => {
    document.body.classList.add('ob-touring');
    return () => document.body.classList.remove('ob-touring');
  }, []);

  // Guards a resumed step index that no longer exists (e.g. a stale
  // activeTour left over from before this tour's step count changed) —
  // steps[step] is undefined rather than throwing, and the position-tracking
  // effect below bails out to finish() the moment it sees a falsy cur.
  const cur = steps[step] || null;

  // Whichever tab this step's target lives on. Load-bearing for a resume
  // (no previous step to have navigated there) and, since steps never call
  // selectTab themselves, the ONLY thing that switches tabs at all —
  // forward, back, or resuming alike.
  React.useEffect(() => {
    if (cur && cur.tab && active !== cur.tab) selectTab(cur.tab);
  }, [step]);
  // On tabPlacement 'side', the rail collapses to an off-canvas drawer on
  // small screens (App owns the actual open/close state — see its
  // subscription to this same field) — a step targeting a nav button would
  // otherwise never find it there. Published unconditionally (not just when
  // opening) so it also closes the drawer again once we move to a step that
  // doesn't need it, rather than leaving it open to cover a content target.
  // A no-op at desktop widths, where the rail is never collapsed to begin
  // with. Keyed off the selector string itself, not resolved elements —
  // resolving would need the rail already open, which is exactly what this
  // is for.
  React.useEffect(() => {
    emlTour.set({ wantRailOpen: !!(cur && cur.sel.includes('[data-tab=')) });
  }, [step]);

  // Resolve every element a step's selector matches — honoring selector
  // ORDER (comma-separated fallbacks) — so a step can spotlight more than one
  // element (e.g. "the whole list") as a single combined highlight. Filters
  // out zero-rect (CSS display:none) elements before checking emptiness —
  // some responsive pairs (e.g. the sidebar vs. footer Edit Mode button)
  // both exist in the DOM at every width, only swapping which one is
  // display:none via a container query, unlike .ob-generate/.gen-confirm's
  // conditional-render swap. Without this, the first alternative in a
  // fallback list would always win even when it's the hidden one.
  const findTargets = (sel) => {
    for (const s of sel.split(',')) {
      const els = [...document.querySelectorAll(s.trim())]
        .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 || r.height > 0; });
      if (els.length) return els;
    }
    return [];
  };
  // Clamps a rect's left/right against every ancestor that horizontally
  // clips its own overflow (overflow-x auto/scroll/hidden — e.g. the
  // Pickers page's Group/Show rows) — an element scrolled past the edge of
  // one of these still has a real, full-width getBoundingClientRect() even
  // though none of it is actually visible there. Without this, a step
  // whose selector matches several items in the SAME scrollable row (e.g.
  // "every picker tab") would union in whichever ones happen to be
  // scrolled out of view, stretching the highlight into the empty space
  // past the row's own clipped edge — invisible on a narrow viewport
  // (nothing renders past its edge anyway) but very visible on a wide one,
  // where the row's clip boundary sits well short of the actual viewport
  // edge. Deliberately horizontal-only: bring()'s own scroll-to-target
  // already settles the VERTICAL case before this ever runs steady-state,
  // and clipping vertically too would fight that during the brief transient
  // scroll itself. Returns null if the element ends up fully clipped away.
  const clipHorizontalOverflow = (rect, el) => {
    // Copies top/left/right/bottom out into plain numbers up front rather
    // than spreading `rect` itself (a DOMRect) — DOMRect's fields are
    // getters on its prototype, not its own enumerable properties, so a
    // spread silently drops every field this function doesn't explicitly
    // set, poisoning every later Math.min/max call downstream with NaN.
    let top = rect.top, left = rect.left, right = rect.right, bottom = rect.bottom;
    // Same idea as the ancestor loop below, but for a step whose selector
    // matches the scrollable row ITSELF as one element (e.g. the Stats
    // tour's Range row, .stat-filter-pills--seg) rather than several
    // children inside it — the loop below only ever inspects el's
    // ancestors, so a too-wide getBoundingClientRect() on el's own
    // overflow-x:auto box (seen on some engine/layout combinations even
    // with min-width:0 set — the row's own content still fits, so this is
    // usually a no-op) never gets caught. clientWidth reflects what's
    // actually rendered/visible regardless of that; only clamps if it's
    // meaningfully narrower than the raw rect, so a normal thin border
    // doesn't shave a couple pixels off every ordinary highlight.
    const selfOxs = getComputedStyle(el).overflowX;
    if ((selfOxs === 'auto' || selfOxs === 'scroll' || selfOxs === 'hidden') && el.clientWidth < (right - left) - 2) {
      right = left + el.clientWidth;
    }
    let n = el.parentElement;
    while (n && n !== document.body) {
      const oxs = getComputedStyle(n).overflowX;
      if (oxs === 'auto' || oxs === 'scroll' || oxs === 'hidden') {
        const nr = n.getBoundingClientRect();
        left = Math.max(left, nr.left); right = Math.min(right, nr.right);
        if (right <= left) return null;
      }
      n = n.parentElement;
    }
    return { top, left, right, bottom };
  };
  // The bounding box that encloses every matched element.
  const unionRect = (els) => {
    let top = Infinity, left = Infinity, right = -Infinity, bottom = -Infinity;
    els.forEach((el) => {
      const r = clipHorizontalOverflow(el.getBoundingClientRect(), el);
      if (!r) return;
      top = Math.min(top, r.top); left = Math.min(left, r.left);
      right = Math.max(right, r.right); bottom = Math.max(bottom, r.bottom);
    });
    return { top, left, right, bottom, width: right - left, height: bottom - top };
  };

  // Block every click during a tour except the coach card and the current
  // step's own highlighted target(s) — otherwise the user can click straight
  // through the dim to whatever's actually underneath (delete a picker,
  // jump to an unrelated tab, etc.) and desync the tour from the real app
  // state. Capture-phase on document so it runs before the click reaches
  // whatever it landed on. Reads via a ref rather than re-attaching per
  // step — the listener only needs to exist for as long as this component
  // is mounted, and findTargets/cur are re-evaluated fresh on every click,
  // not closed over stale.
  const curRef = React.useRef(cur);
  curRef.current = cur;
  // Mirrors curRef, but for the raw step NUMBER rather than the step
  // object — used by onPrimary's advanceWhen poll below, which needs to
  // notice a step change made for some OTHER reason (Back, Skip) while it
  // was still waiting. `cur` itself isn't reliable for that same check:
  // steps are rebuilt as fresh objects on every render (buildPageTourStep1/
  // buildPageTourSteps are called anew each time), so curRef.current would
  // read as "changed" on the very next unrelated re-render even when the
  // step index never actually moved.
  const stepRef = React.useRef(step);
  stepRef.current = step;
  // Lets the advanceWhen poll (and anything else scheduling a callback
  // beyond this render's own lifetime) notice this component has actually
  // unmounted and stop, rather than firing a state update into the void.
  const mountedRef = React.useRef(true);
  React.useEffect(() => () => { mountedRef.current = false; }, []);
  // Same lazy-ref pattern as curRef — onPrimary closes over step/cur/finish,
  // all of which change every render, but the click-guard effect below is
  // only ever set up once.
  const onPrimaryRef = React.useRef(() => {});
  // Lets onGoBack's own side effects click through the guard below — e.g. a
  // picker mini-tour's onGoBack simulates a click on the create-form's own
  // "Details" step tab to undo a later step's "Add items" click. That
  // synthetic click isn't the step's own target (curRef still points at the
  // step being left, since onGoBack runs before goToStep actually changes
  // it), so without this the guard would block onGoBack from doing anything
  // at all — the exact clicks meant to fix the page up before navigating
  // back are the ones most likely to look like "not the current target" to
  // it.
  const suppressGuardRef = React.useRef(false);
  // Off-target check shared by both listeners below.
  const isOffTarget = (e) => {
    if (suppressGuardRef.current) return false;
    if (e.target.closest('.ob-coach')) return false;
    const c = curRef.current;
    return !(c && findTargets(c.clickSel || c.sel).some((el) => el.contains(e.target)));
  };
  React.useEffect(() => {
    // A focused real input (e.g. a step's own rename field) blurs the
    // instant *mousedown* fires on whatever it lands on — the browser's
    // default focus-transfer runs before the 'click' event below ever gets
    // a chance to block anything, and it isn't tied to whether the click
    // goes on to do anything: it fires just from clicking a focusable
    // element (any button/link under the dim, not just ones a click
    // handler would otherwise act on). That blur can cascade into real app
    // state changes (e.g. GroupHeader committing a rename on blur) the
    // click-guard below was never in a position to stop, and the step's
    // own target can vanish from the DOM as a result, which reads as the
    // tour randomly dying a moment after a click that "did nothing"
    // visible. preventDefault on mousedown itself is what suppresses the
    // browser's default focus transfer (well-worn trick for toolbar
    // buttons that shouldn't steal focus from a text field) — stopped here
    // for exactly the same off-target elements the click guard blocks, so
    // an in-progress edit stays focused and open until the user genuinely
    // interacts with this step's own target.
    const onMouseDownCapture = (e) => {
      if (!isOffTarget(e)) return;
      e.preventDefault();
      e.stopPropagation();
    };
    const onClickCapture = (e) => {
      if (suppressGuardRef.current) return;
      const c = curRef.current;
      if (e.target.closest('.ob-coach')) return;
      if (c && findTargets(c.clickSel || c.sel).some((el) => el.contains(e.target))) {
        // A requireClick step's target click IS its primary action — the
        // Next button is disabled, so this is the only way forward.
        if (c.requireClick) onPrimaryRef.current();
        return;
      }
      e.preventDefault();
      e.stopPropagation();
    };
    // The mousedown guard above only covers focus loss caused by something
    // ELSE on the page stealing it — it can't do anything about the target
    // itself losing focus for a reason with no in-page click behind it at
    // all, e.g. the browser window/tab losing OS-level focus (alt-tabbing
    // away, or a mobile browser backgrounding and dismissing its own
    // keyboard). That still fires a real 'focusout' on the target (unlike
    // 'blur' on window, which doesn't reach the element), and unlike
    // mousedown's default-focus-transfer, blur/focusout isn't cancelable —
    // preventDefault does nothing here. What DOES work: React's onBlur is
    // itself just a delegated listener for the native 'focusout' bubbling
    // up to the root container, so stopping propagation on it up here, in
    // capture phase at the document (above where it would ever reach that
    // root listener), keeps React from ever calling the target's own onBlur
    // at all — e.g. GroupHeader's commit(), which is what actually closes
    // the rename input and makes the step's target vanish. Exempts a
    // focus move INTO the coach (e.relatedTarget) — e.g. Tab-ing to the
    // Next/Done button — since that's a legitimate, deliberate way to leave
    // the target, same as a click on it already is via isOffTarget's own
    // '.ob-coach' exemption.
    const onFocusOutCapture = (e) => {
      if (suppressGuardRef.current) return;
      const c = curRef.current;
      if (!c) return;
      if (e.relatedTarget && e.relatedTarget.closest('.ob-coach')) return;
      if (!findTargets(c.clickSel || c.sel).some((el) => el.contains(e.target))) return;
      e.stopPropagation();
    };
    document.addEventListener('mousedown', onMouseDownCapture, true);
    document.addEventListener('click', onClickCapture, true);
    document.addEventListener('focusout', onFocusOutCapture, true);
    return () => {
      document.removeEventListener('mousedown', onMouseDownCapture, true);
      document.removeEventListener('click', onClickCapture, true);
      document.removeEventListener('focusout', onFocusOutCapture, true);
    };
  }, []);

  const goToStep = (n) => setStep(n);
  // Back reverses navigation so the previous target exists again. Any
  // tour-specific side effects (undoing something a later step did) are the
  // caller's job via onGoBack, called with the destination step before it
  // actually changes — with the click-guard suppressed for its duration, see
  // suppressGuardRef's own comment for why.
  const goBack = () => {
    const to = Math.max(0, step - 1);
    if (onGoBack) {
      suppressGuardRef.current = true;
      onGoBack(to);
      suppressGuardRef.current = false;
    }
    goToStep(to);
  };
  // The primary button's side effect (if any) runs first, then either
  // finishes the tour ('Done') or advances to the next step — step authors
  // never call goToStep/selectTab themselves, keeping run() a pure side
  // effect and navigation fully generic.
  //
  // For a requireClick step, this fires from the click-guard's CAPTURE-phase
  // handling of the real target's click — same event as the target's own
  // native (bubble-phase) handler, which hasn't run yet. run() has to stay
  // synchronous here (Steps 2/9's prefill staging depends on landing before
  // that native handler reads it), but advancing/finishing must NOT: a
  // 'Done' step's finish() calls selectTab away and unmounts this tour,
  // and doing that synchronously here can remove the target from the DOM
  // before its own bubble-phase handler ever fires — observed concretely on
  // the Picker tour's "Create picker" step, where the real submit() got
  // skipped entirely because finish() tore down the page mid-click. Deferring
  // the advance/finish by a tick lets the browser finish dispatching the
  // native click (including the target's own handler) first; a requireClick
  // step's target is real UI the user just interacted with, so nothing in
  // `steps` should be reading tour `step` synchronously off this same click.
  const onPrimary = () => {
    // Suppressed the same way goBack's own onGoBack call is (see
    // suppressGuardRef's doc comment above) — a run() that drives a real
    // click on something outside the CURRENT step's own target (e.g.
    // staging the NEXT step's target on a different part of the page)
    // would otherwise get blocked by the same document-level guard that
    // stops the USER clicking off-target: curRef.current still points at
    // this step (the index hasn't advanced yet), so a synthetic click
    // landing anywhere else reads as "off-target" and gets preventDefault/
    // stopPropagation'd before its own handler ever runs.
    if (cur.run) {
      suppressGuardRef.current = true;
      cur.run();
      suppressGuardRef.current = false;
    }
    const advance = () => { if (cur.primary === 'Done') finish(); else goToStep(step + 1); };
    if (cur.requireClick && cur.advanceWhen) {
      // The real click just kicked off something ASYNC whose result is the
      // next step's own target — e.g. the Pickers tour's "Manual
      // Generation" step: clicking Pick one starts a multi-second spin
      // animation, and the Send to Today button (the next step's target)
      // doesn't exist until it resolves. Advancing on the usual immediate
      // timer would move the step index forward before that target exists,
      // and the position-tracking effect's own "target not found yet"
      // fallback renders a bare dim with no coach at all for however long
      // that takes — reading as the tour blanking out mid-click. Polling
      // here instead means THIS step's own already-resolved coach and
      // highlight just keep sitting there, unbothered, for the whole wait,
      // and the jump to the next step only happens once its target is
      // actually ready to be found immediately. Checks the LIVE step
      // number (via stepRef, not this closure's own `step`) on each poll,
      // so if the user Back's/Skip's away in the meantime this notices and
      // bails out instead of firing a stale advance() later.
      const startedForStep = step;
      const check = () => {
        if (!mountedRef.current || stepRef.current !== startedForStep) return;
        if (findTargets(cur.advanceWhen).length) advance();
        else requestAnimationFrame(check);
      };
      requestAnimationFrame(check);
    } else if (cur.requireClick && cur.advanceDelay) {
      // The real click plays a self-contained confirmation animation with a
      // fixed duration and no lasting DOM trace to poll for — e.g. the
      // Pickers tour's own "Add to Todo List" step: Send to Today swaps its
      // label to "Sent!" for a beat, then reverts on its own. advanceWhen
      // above can't express "wait for this ANIMATION", only "wait for a
      // target to exist" — advancing on the usual immediate timer would cut
      // that confirmation off before the user ever sees it. Same
      // stepRef/mountedRef staleness guard as advanceWhen's own poll, for
      // the same reason (a Back/Skip during the wait shouldn't fire a stale
      // advance() once the timer finally elapses).
      const startedForStep = step;
      setTimeout(() => {
        if (!mountedRef.current || stepRef.current !== startedForStep) return;
        advance();
      }, cur.advanceDelay);
    } else if (cur.requireClick) {
      setTimeout(advance, 0);
    } else advance();
  };
  onPrimaryRef.current = onPrimary;

  // ── Position tracking: follow the target every frame while a step is up ──
  React.useEffect(() => {
    setRect(null); // drop the previous step's position so it can't paint under new text
    // Also drop any reserve the PREVIOUS step needed — this step's own need
    // (computed below from fresh measurements) may well be different, and
    // starting from zero avoids the new target's very first measurement
    // already reflecting stale leftover padding.
    setReserveTop(0);
    hadRectRef.current = false; // next appearance jumps into place, no slide-in
    if (!cur) {
      // No valid step (see the clamp on `cur` above) — bail out cleanly
      // rather than leave a permanent dim with nothing to click. Not a
      // genuine completion, so skip() (not finish()) — see its comment.
      skip();
      return;
    }
    let raf, cancelled = false;
    // Whether THIS step's target needs top-space reserved above it, and how
    // much — declared here (not down by decideReserve's own definition,
    // where they conceptually belong) because bring() now needs to read/set
    // them on its very first call, before decideReserve's own code further
    // down has even run. See decideReserve's own comment for the full
    // reasoning on what these track and why the decision only ever happens
    // once per step.
    let reserveDecided = false;
    let reservedAmount = 0;
    // Resolve the ACTUAL scrolling ancestor of the target. On narrow/mobile
    // layouts the scroller isn't ".main" (the page/body scrolls instead), so a
    // hardcoded ".main" left the target below the fold with the coach + spot
    // off-screen — the dim-only "no highlight" state.
    const getScroller = (el) => {
      let n = el && el.parentElement;
      while (n && n !== document.body) {
        const oy = getComputedStyle(n).overflowY;
        if ((oy === 'auto' || oy === 'scroll') && n.scrollHeight > n.clientHeight + 2) return n;
        n = n.parentElement;
      }
      return document.scrollingElement || document.documentElement;
    };
    // Smooth (unless prefers-reduced-motion) so a step that jumps to a
    // different part of the page — or, via bring()'s content-grew re-trigger
    // and decideReserve's own follow-up correction below, mid-step too —
    // reads as the tour visibly navigating there rather than an
    // unexplained cut. Deliberately NOT applied to goToTodayTop (the
    // tour-END reset on Skip/Done) — that's a closing reset, not a "here's
    // the next thing" step transition, and it already fires alongside a
    // tab switch back to Today, which stays an instant cut by design.
    const scrollByAmt = (sc, dy) => {
      const opts = { top: dy, behavior: reduceMotion() ? 'auto' : 'smooth' };
      if (sc === document.scrollingElement || sc === document.documentElement) window.scrollBy(opts);
      else sc.scrollBy(opts);
    };
    // Bring the target(s) into view once when the step opens.
    const bring = () => {
      // Guards the recursive requestAnimationFrame(() => bring()) call
      // below (the reserve-space retry) — that one fires on its own
      // timer, outside this effect's own raf loop, so the ordinary
      // `cancelled` check further down never gets a chance to catch it
      // if the step/tour has already moved on by the time it fires.
      if (cancelled) return;
      const els = findTargets(cur.sel);
      if (!els.length) return;
      const sc = getScroller(els[0]);
      // A step whose target starts right at the top of the page anyway
      // (e.g. a full-list review step) scrolls all the way up rather than
      // just nudging it into view — keeps everything visible from the top
      // instead of opening mid-scroll.
      if (cur.scrollToTop) {
        const opts = { top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' };
        if (sc === document.scrollingElement || sc === document.documentElement) window.scrollTo(opts);
        else sc.scrollTo(opts);
        return;
      }
      // Symmetric case: a step whose target always sits at the very bottom
      // of its page/form (e.g. a footer "next" button) — scrolling by pad
      // math alone can undershoot after the surrounding content just
      // changed shape (e.g. a form switching back from a longer sub-step to
      // a shorter one, whatever scroll position carried over from before no
      // longer means anything), landing short of the target instead of
      // reaching it.
      if (cur.scrollToBottom) {
        const behavior = reduceMotion() ? 'auto' : 'smooth';
        if (sc === document.scrollingElement || sc === document.documentElement) window.scrollTo({ top: document.documentElement.scrollHeight, behavior });
        else sc.scrollTo({ top: sc.scrollHeight, behavior });
        return;
      }
      const isDoc = sc === document.scrollingElement || sc === document.documentElement;
      const er = unionRect(els);
      const sr = isDoc ? { top: 0, bottom: window.innerHeight } : sc.getBoundingClientRect();
      // See coachAtTop's own doc comment above — scrolls so the target
      // starts right where the coach (pinned to safeTop) leaves off,
      // instead of trying to fit the target's WHOLE height within the
      // normal pad/padB window below, which a too-tall target can't do.
      if (cur.coachAtTop) {
        const desiredTop = obSafeTop() + 12 + coachHRef.current + 16;
        scrollByAmt(sc, er.top - desiredTop);
        return;
      }
      const pad = 90, padB = 130;
      // The top boundary also can't sit above obSafeTop() — a fixed pad
      // alone assumes Today's own sticky header (plus, when present, the
      // Edit Mode banner) is shorter than it actually is, which on a short
      // enough viewport (or once the banner adds its own height) lets a
      // target that "fits" by the pad's math alone still land partly behind
      // that chrome, with bring() then seeing no need to scroll further.
      const minTop = Math.max(sr.top + pad, obSafeTop() + 12);
      // A target too tall to fit alongside the coach no matter where it's
      // scrolled to needs reserve space — decided HERE, using a PREDICTED
      // landing position (wherever the branch just below is about to place
      // it) rather than an OBSERVED post-scroll one, so it can be applied
      // before this step's very first scroll instead of discovered only
      // after that scroll already settled. The latter is what this
      // replaces: the loop's own decideReserve (below, unchanged) used to
      // be the only place this got decided, which meant a visibly separate
      // second "jump then re-scroll" once it found the overlap — this
      // step's target genuinely overlapping the coach at its settled
      // position is exactly the case reproduced live and reported as jank.
      // predictedTop mirrors whichever of the two branches below will
      // actually fire (null — no scroll needed at all — is deliberately
      // left unhandled; a target that already fits without scrolling was
      // never going to need reserve either), then plugs it into the exact
      // same fits-below/fits-above checks decideReserve itself uses, so
      // this can't disagree with what decideReserve would have decided
      // anyway — just decided proactively instead of reactively. Once the
      // reserve padding lands and this retries, decideReserve (called from
      // the loop below, after reserveDecided is already true) just no-ops.
      let predictedTop = null;
      if (er.top < minTop) predictedTop = minTop;
      else if (er.bottom > sr.bottom - padB) predictedTop = (sr.bottom - padB) - er.height;
      if (!cur.coachAtTop && !reserveDecided && predictedTop != null) {
        const vh = window.innerHeight, ch = coachHRef.current;
        const fitsBelow = vh - (predictedTop + er.height) >= ch + 16;
        const fitsAbove = predictedTop - 16 - ch >= obSafeTop() + 12;
        if (!fitsBelow && !fitsAbove) {
          reserveDecided = true;
          reservedAmount = ch + 40;
          setReserveTop(reservedAmount);
          // The padding hasn't rendered yet (React hasn't re-committed) —
          // wait a real frame so the retry measures the actual,
          // already-reserved layout instead of guessing at it.
          requestAnimationFrame(() => bring());
          return;
        }
      }
      if (er.top < minTop) scrollByAmt(sc, -(minTop - er.top));
      else if (er.bottom > sr.bottom - padB) scrollByAmt(sc, er.bottom - (sr.bottom - padB));
    };
    bring();
    let broughtRef = false;
    // Today's own sticky header (and, on mobile, the groups rail stacked below
    // it) plus a floating bottom tab bar (tabPlacement 'bottom') both sit at a
    // higher z-index than the surrounding content but a LOWER one than this
    // tour overlay — so a highlighted rect reaching past either one's edge
    // would expose it through the spotlight's cutout (a box-shadow "hole")
    // instead of dimming it, reading as if that chrome were part of the
    // highlighted target. Clamp the rect actually drawn (not the one bring()
    // scrolls by, which needs the real position) so the spotlight never
    // reaches into either safe zone. Targets that live INSIDE the nav bar
    // itself are exempt from both — the nav is a separate region, never
    // actually "under" either piece of chrome regardless of its on-screen
    // position, so clamping it by the same rule can do real damage: a
    // tabPlacement 'side' nav sits in the same general screen area as
    // Today's header, and its topmost item (Today itself) can have a smaller
    // top-coordinate than obSafeTop()'s Today-header-derived floor purely by
    // being first in an unrelated column — clamping it there squashed the
    // highlight down to a sliver sitting below the actual button. Same
    // exemption for the group rail itself — obSafeTop() folds ITS OWN bottom
    // edge into the safe-top floor (mobile-only, so content further down the
    // page doesn't scroll under it), which is exactly backwards for a step
    // whose target IS the rail: clamping squashed that highlight down to a
    // sliver sitting just below the rail instead of on it. Same again for
    // .today-h itself — obSafeTop()'s FIRST term is the header's own bottom
    // edge, so a target that lives INSIDE it (e.g. the progress ring) is
    // never actually "under" its own container: obSafeTop() there is always
    // >= the target's bottom, clamping the highlight's top down past the
    // target's own bottom and collapsing it to an empty sliver instead of
    // leaving it alone.
    const spotPad = 8;
    const clampToChrome = (r, els) => {
      if (els.some((el) => el.closest('.tabbar') || el.closest('.group-rail') || el.closest('.today-h'))) return r;
      // Clamp to the safe boundary PLUS the spot's own padding, so the
      // padded box drawn below never overlaps that chrome even by that margin.
      const minTop = obSafeTop() + spotPad;
      const maxBottom = obSafeBottom() - spotPad;
      const top = Math.max(r.top, minTop);
      const bottom = Math.min(r.bottom, maxBottom);
      return { ...r, top, bottom, height: bottom - top };
    };
    const place = (els) => {
      const r = clampToChrome(unionRect(els), els);
      if (spotRef.current) {
        const pad = spotPad, s = spotRef.current.style;
        s.top = (r.top - pad) + 'px'; s.left = (r.left - pad) + 'px';
        s.width = (r.width + pad * 2) + 'px'; s.height = (r.height + pad * 2) + 'px';
      }
      // Same reasoning as the spot above: during bring()'s (now smooth)
      // scroll, the render function's OWN coach position — driven by the
      // `rect` React state set below, once per animation frame — lags a
      // render/commit cycle behind the browser's own scroll animation and
      // visibly stutters instead of gliding. Writing directly to the DOM
      // here keeps the coach locked to the highlight, frame for frame; the
      // render function still computes the same layout as a fallback for
      // the coach's first paint each step (before this has run at all) and
      // as the eventual React-driven value once it catches up.
      if (realCoachRef.current) {
        const vwNow = window.innerWidth, vhNow = window.innerHeight;
        const coachWNow = Math.min(300, vwNow - 24);
        const layout = computeCoachLayout(r, coachHRef.current, coachWNow, vwNow, vhNow);
        const cs = realCoachRef.current.style;
        cs.top = layout.top + 'px'; cs.left = layout.left + 'px';
        cs.setProperty('--ob-ax', computeArrowX(r, layout.left, coachWNow) + 'px');
        realCoachRef.current.classList.toggle('ob-coach--up', layout.arrowClass === 'ob-coach--up');
        realCoachRef.current.classList.toggle('ob-coach--down', layout.arrowClass === 'ob-coach--down');
      }
      return r;
    };
    // Decide how much top-space (if any) THIS step's target needs reserved
    // above it, ONCE — the very first time the target resolves (right after
    // bring()'s scroll-to-top has settled, so the measurement is accurate) —
    // rather than continuously on every frame. A continuous decision looks
    // right on Today (its highlight is tall enough that scrolling never
    // changes the verdict) but flips mid-scroll on shorter pages like
    // Pickers: scrolling the header over the target can cross the "fits
    // above" threshold WHILE THE USER IS STILL SCROLLING, jumping the layout
    // under them. Deciding once and locking it for the step's duration reads
    // like a person who sized up the space up front, not one who keeps
    // rearranging things as you scroll. (reserveDecided/reservedAmount
    // themselves are declared further up, before bring()'s own definition —
    // bring() now needs them on its very first call, before this point in
    // the file has even run yet.)
    // The TARGET can still be settling too, in two different ways: (1) mid-
    // CSS-transition — e.g. a Collapse section still animating open the
    // first time this step's target mounts, .np-daily-group's weekday chips
    // are exactly this — reading a shorter height than its final one, or
    // (2) bring()'s own scroll adjustment hasn't fully landed yet — most
    // visible going BACK to a step whose target was already on-screen
    // (nothing to animate open this time), where the height reads correctly
    // right away but the top position is still moving as the scroll
    // settles. Deciding off either kind of transient reading wrongly
    // concludes "fits" and skips the reserve the final, settled geometry
    // actually needs. Wait for BOTH top and height to stop changing between
    // consecutive frames before locking in the decision — same idea as
    // coachH's own stabilize-then-use pattern above, just for the other
    // side of the same math.
    let lastTargetTop = null, lastTargetH = null, stableFrames = 0;
    const decideReserve = (els) => {
      // coachAtTop steps never reserve — see that flag's own doc comment;
      // reserveTop stays at its already-0 default.
      if (cur.coachAtTop) { reserveDecided = true; return; }
      if (reserveDecided) return;
      const r = unionRect(els);
      if (lastTargetH != null && Math.abs(r.height - lastTargetH) < 1 && Math.abs(r.top - lastTargetTop) < 1) stableFrames++;
      else stableFrames = 0;
      lastTargetTop = r.top;
      lastTargetH = r.height;
      if (stableFrames < 2) return;
      reserveDecided = true;
      const vh = window.innerHeight;
      // coachHRef.current, not the closed-over coachH — see coachHRef's own
      // comment above for why the closure can't be trusted here. Also not
      // the fixed OB_COACH_H estimate: a narrower coach (small/mobile
      // screens) wraps the same body text over more lines and renders
      // taller, so the fixed guess under-reserved there specifically — this
      // step fit "above" by the estimate but not in reality, and the coach
      // ended up overlapping the highlight's top edge anyway.
      const ch = coachHRef.current;
      if (vh - (r.top + r.height) >= ch + 16) return; // fits below — reserveTop is already 0
      if (r.top - 16 - ch >= obSafeTop() + 12) return; // fits above — reserveTop is already 0
      reservedAmount = ch + 40;
      setReserveTop(reservedAmount);
      // Scrolls so the target lands exactly ch+16 below safeTop — the same
      // threshold the "fits above" check just above uses, and what the
      // coach's own render-time placement (top: rect.top - 16 - coachH,
      // clamped to safeTop) needs to actually seat it flush above the
      // target instead of overlapping it. Deliberately NOT a scroll that
      // compensates for the padding just added (e.g. scrolling by
      // +reservedAmount) — that fully cancels the reserve's own effect,
      // undoing the room it just opened up and leaving the coach exactly
      // as short on space as before any reserve existed. Re-measures the
      // target after a frame (rather than computing from `r`, which is
      // now stale) since the padding needs to have actually landed in the
      // DOM first; recomputes its own scroller rather than closing over
      // bring()'s local `sc`, which this function doesn't have access to.
      const els2 = findTargets(cur.sel);
      if (els2.length) {
        const sc2 = getScroller(els2[0]);
        requestAnimationFrame(() => {
          const freshEls = findTargets(cur.sel);
          if (!freshEls.length) return;
          const freshTop = unionRect(freshEls).top;
          const desiredTop = obSafeTop() + 12 + ch + 16;
          scrollByAmt(sc2, freshTop - desiredTop);
        });
      }
    };
    // Reposition synchronously as scroll fires (before paint) so the highlight
    // doesn't trail the content the way a purely rAF-driven fixed box does.
    // Listen broadly (capture) so it fires for whichever element scrolls.
    const onScroll = () => { const els = findTargets(cur.sel); if (els.length) place(els); };
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    // Watchdog: a step whose target never resolves (normally just the tab-sync
    // effect's selectTab() still settling) would otherwise sit as a permanent
    // dim with nothing to click — most likely on a resume, where a stale
    // activeTour survived some app change that moved or removed the target.
    // Generous enough not to fire during ordinary mounting.
    const NOT_FOUND_TIMEOUT = 4000;
    let notFoundSince = null;
    // Tracks the scrollable content's total height so a step whose target
    // stays put (no tab/step change) but whose SURROUNDING content grows or
    // shrinks — e.g. the user does the step's own action themselves without
    // ever clicking the coach's Next — can still get nudged back into view.
    // Ordinary scrolling never changes this value, so it doesn't fight the
    // user scrolling around on purpose; only an actual content-size change
    // re-triggers bring(). Measured with reservedAmount subtracted out —
    // otherwise decideReserve's own CSS padding (added specifically to make
    // room for the coach above a highlight too tall to fit either way) reads
    // as "content grew", re-triggers bring(), and bring() scrolls the target
    // right back up to its usual pad-from-top position — undoing the
    // reserve and putting the coach right back on top of it.
    let lastScrollHeight = null;
    const loop = () => {
      if (cancelled) return;
      const els = findTargets(cur.sel);
      if (els.length) {
        notFoundSince = null;
        const sc = getScroller(els[0]);
        const h = ((sc === document.scrollingElement || sc === document.documentElement)
          ? document.documentElement.scrollHeight : sc.scrollHeight) - reservedAmount; // exclude our own reserve-space padding — see decideReserve's comment on reservedAmount
        if (!broughtRef) { broughtRef = true; bring(); } // scroll once the target actually exists
        else if (lastScrollHeight != null && Math.abs(h - lastScrollHeight) > 40) bring();
        lastScrollHeight = h;
        decideReserve(els);
        const r = place(els);
        setRect((p) => (p && Math.abs(p.top - r.top) < 0.5 && Math.abs(p.left - r.left) < 0.5 && p.width === r.width && p.height === r.height)
          ? p : { top: r.top, left: r.left, width: r.width, height: r.height });
      } else {
        setRect(null);
        if (notFoundSince == null) notFoundSince = performance.now();
        else if (performance.now() - notFoundSince > NOT_FOUND_TIMEOUT) { cancelled = true; skip(); return; }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelled = true; cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll, { capture: true }); };
  }, [step, cur && cur.sel]);

  // Published on the bus so the active tab (which owns the actual scrollable
  // content) can apply it — this component only overlays the page, it
  // doesn't own that layout. reserveTop itself is set by the position-
  // tracking effect above, decided ONCE per step rather than continuously —
  // see the comment on decideReserve there for why.
  React.useEffect(() => { emlTour.set({ reserveTop }); }, [reserveTop]);

  const portal = (node) => createPortal(node, document.body);

  // No valid step (advanced past the end of a `steps` array whose last entry
  // isn't primary:'Done' yet, most likely mid-content-authoring) — the
  // position-tracking effect above already calls finish() the moment it sees
  // this, but that's a separate effect firing after this render commits, so
  // this render still needs to not crash reading off a null `cur` in the
  // meantime. Same one-frame dim-only fallback as the "target not found yet"
  // case below.
  if (!cur) return portal(<div className="ob-tour" aria-live="polite"><div className="ob-dim" /></div>);

  const total = steps.length;
  const vw = window.innerWidth, vh = window.innerHeight;
  const coachW = Math.min(300, vw - 24);
  // Hidden clone of the coach, rendered off-screen the moment a step's
  // content is known — BEFORE its target (and so `rect`) resolves, unlike
  // the real coach below. Its only job is to give coachRef's layout effect
  // something to measure early enough for decideReserve (which runs inside
  // the position-tracking effect, as soon as the target is first found — the
  // real coach doesn't exist in the DOM yet at that point) to see this
  // step's REAL height instead of a stale one measured off whatever the
  // previous, possibly shorter, step happened to be.
  const measurer = (
    <div className="ob-coach" ref={coachRef} aria-hidden="true"
         style={{ position: 'fixed', top: 0, left: -9999, width: coachW, visibility: 'hidden', pointerEvents: 'none' }}>
      <p className="ob-prog">Step {step + 1} of {total}</p>
      <h4>{cur.title}</h4>
      <p className="ob-body">{cur.body}</p>
      <div className="ob-crow">
        <div className="ob-lnav">
          <button className="ob-skip">Skip</button>
          {cur.back && <button className="ob-back">‹ Back</button>}
        </div>
        <button className="ob-next" disabled={cur.requireClick}>{cur.primary}{cur.primary !== 'Done' ? ' ›' : ''}</button>
      </div>
    </div>
  );
  let coachStyle, arrowClass, spotStyle = null;
  if (rect) {
    const pad = 8;
    hadRectRef.current = true;
    spotStyle = { top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2, transition: 'none' };
    // Same math place() uses to position the coach imperatively every frame
    // (see its own comment) — kept here too as the coach's first-paint value
    // each step and the eventual React-driven fallback once it catches up.
    // No coachAtTop-specific branch needed here at all any more — letting it
    // fall through to the exact same below/above logic every other step
    // already uses is what lets the coach flip to sit BELOW the target
    // (arrow up) once there's room, instead of only ever attaching above it.
    // coachAtTop's own remaining job is upstream of this: skip
    // decideReserve's padding (see that flag's own doc comment) and give
    // bring() a precise initial scroll target instead of the general pad/
    // padB math, which doesn't reliably land a too-tall target anywhere
    // useful on the very first frame.
    const layout = computeCoachLayout(rect, coachH, coachW, vw, vh);
    coachStyle = { top: layout.top, left: layout.left };
    arrowClass = layout.arrowClass;
  } else {
    // Target not found yet (mid-navigation). Show only the dim; the visible
    // coach appears once its target resolves, so no stale/centered flash —
    // but the hidden measurer still needs to be here so its height is ready
    // by the time the target IS found.
    return portal(<div className="ob-tour" aria-live="polite"><div className="ob-dim" />{measurer}</div>);
  }
  const arrowX = computeArrowX(rect, coachStyle.left, coachW);

  return portal(
    <div className="ob-tour" aria-live="polite">
      {measurer}
      {/* The highlight border itself stays during a drag (still marks the
          section being dragged) — only its box-shadow, which is what dims
          the REST of the page (the ".ob-spot" trick: a giant shadow darkens
          everything outside its own bounds), drops out, via the
          is-dragging CSS override. Otherwise the darkened background would
          make it hard to see exactly where the group's landing. */}
      {spotStyle && <div className={`ob-spot ${dragging ? 'is-dragging' : ''}`} ref={spotRef} style={spotStyle} />}
      {!spotStyle && !dragging && <div className="ob-dim" />}
      {!dragging && (
        <div className={`ob-coach ${arrowClass}`} ref={realCoachRef} style={{ ...coachStyle, width: coachW, '--ob-ax': arrowX + 'px' }}>
          <p className="ob-prog">Step {step + 1} of {total}</p>
          <h4>{cur.title}</h4>
          <p className="ob-body">{cur.body}</p>
          <div className="ob-crow">
            <div className="ob-lnav">
              <button className="ob-skip" onClick={skip}>Skip</button>
              {cur.back && <button className="ob-back" onClick={goBack}>‹ Back</button>}
            </div>
            {cur.requireClick ? (
              <InfoTip label="Please click the indicated element in order to advance.">
                <button className="ob-next" disabled>
                  {cur.primary}{cur.primary !== 'Done' ? ' ›' : ''}
                </button>
              </InfoTip>
            ) : (
              <button className="ob-next" onClick={onPrimary}>
                {cur.primary}{cur.primary !== 'Done' ? ' ›' : ''}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export { GuidedTour, goToTodayTop };
