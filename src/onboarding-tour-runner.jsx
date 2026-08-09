import React from 'react';
import { createPortal } from 'react-dom';
import { emlTour } from './eml-tour-bus.js';
import { InfoTip } from './ui.jsx';

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
//   requireClick — true if this step teaches the real interface rather than
//              narrating it: Next is disabled (with a hover/tap hint) and
//              the step only advances when the user clicks the highlighted
//              target itself — the same click-guard exemption that already
//              lets a target's own click through now also triggers the
//              primary action (run(), then advance) instead of a no-op.
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
// stacked below the header — that rail too. Shared by the spotlight clamp,
// the reserve-space decision, and the coach's own placement, so all three
// agree on where "safe" starts.
const obSafeTop = () => {
  const header = document.querySelector('.today-h');
  let bottom = header ? header.getBoundingClientRect().bottom : 0;
  const rail = document.querySelector('.group-rail');
  if (rail && getComputedStyle(rail).flexDirection === 'row') {
    bottom = Math.max(bottom, rail.getBoundingClientRect().bottom);
  }
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
  const coachRef = React.useRef(null);
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

  // Persist progress as it advances, so a reload can resume from wherever
  // this tour is — the caller is responsible for reading
  // state.onboarding.activeTour back out as `resumeStep` on mount (and for
  // only ever mounting one GuidedTour at a time); tourId just labels this
  // tour's slot in that shared field.
  React.useEffect(() => {
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
    (onSkip || onFinish)();
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
  // element (e.g. "the whole list") as a single combined highlight.
  const findTargets = (sel) => {
    for (const s of sel.split(',')) {
      const els = [...document.querySelectorAll(s.trim())];
      if (els.length) return els;
    }
    return [];
  };
  // The bounding box that encloses every matched element.
  const unionRect = (els) => {
    let top = Infinity, left = Infinity, right = -Infinity, bottom = -Infinity;
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
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
  React.useEffect(() => {
    const onClickCapture = (e) => {
      if (suppressGuardRef.current) return;
      const c = curRef.current;
      if (e.target.closest('.ob-coach')) return;
      if (c && findTargets(c.sel).some((el) => el.contains(e.target))) {
        // A requireClick step's target click IS its primary action — the
        // Next button is disabled, so this is the only way forward.
        if (c.requireClick) onPrimaryRef.current();
        return;
      }
      e.preventDefault();
      e.stopPropagation();
    };
    document.addEventListener('click', onClickCapture, true);
    return () => document.removeEventListener('click', onClickCapture, true);
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
  const onPrimary = () => {
    if (cur.run) cur.run();
    if (cur.primary === 'Done') finish();
    else goToStep(step + 1);
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
    const scrollByAmt = (sc, dy) => {
      if (sc === document.scrollingElement || sc === document.documentElement) window.scrollBy(0, dy);
      else sc.scrollTop += dy;
    };
    // Bring the target(s) into view once when the step opens.
    const bring = () => {
      const els = findTargets(cur.sel);
      if (!els.length) return;
      const sc = getScroller(els[0]);
      // A step whose target starts right at the top of the page anyway
      // (e.g. a full-list review step) scrolls all the way up rather than
      // just nudging it into view — keeps everything visible from the top
      // instead of opening mid-scroll.
      if (cur.scrollToTop) {
        if (sc === document.scrollingElement || sc === document.documentElement) window.scrollTo(0, 0);
        else sc.scrollTop = 0;
        return;
      }
      const isDoc = sc === document.scrollingElement || sc === document.documentElement;
      const er = unionRect(els);
      const sr = isDoc ? { top: 0, bottom: window.innerHeight } : sc.getBoundingClientRect();
      const pad = 90, padB = 130;
      if (er.top < sr.top + pad) scrollByAmt(sc, -(sr.top + pad - er.top));
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
    // highlight down to a sliver sitting below the actual button.
    const spotPad = 8;
    const clampToChrome = (r, els) => {
      if (els.some((el) => el.closest('.tabbar'))) return r;
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
    // rearranging things as you scroll.
    let reserveDecided = false;
    // Tracked outside React state (read by the scrollHeight watchdog below,
    // in the same closure, so no staleness risk the way reading the actual
    // `reserveTop` state here would have) — see its use there for why.
    let reservedAmount = 0;
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
    let left = Math.max(12, Math.min(rect.left, vw - coachW - 12));
    // The lowest the coach can sit without going under the Today tab's sticky
    // header (and, on mobile, the groups rail stacked below it) — raw
    // viewport space above the target isn't usable if that chrome occupies
    // part of it. Only a safety clamp at this point: the reserve-space effect
    // above already pushes the list down so the target's real position
    // leaves enough room above it, once that reflow settles (usually within
    // a frame or two).
    const safeTop = obSafeTop() + 12;
    const spaceBelow = vh - (rect.top + rect.height);
    if (spaceBelow >= coachH + 16) {
      coachStyle = { top: rect.top + rect.height + 16, left };
      arrowClass = 'ob-coach--up';
    } else {
      coachStyle = { top: Math.max(rect.top - 16 - coachH, safeTop), left };
      arrowClass = 'ob-coach--down';
    }
  } else {
    // Target not found yet (mid-navigation). Show only the dim; the visible
    // coach appears once its target resolves, so no stale/centered flash —
    // but the hidden measurer still needs to be here so its height is ready
    // by the time the target IS found.
    return portal(<div className="ob-tour" aria-live="polite"><div className="ob-dim" />{measurer}</div>);
  }
  const arrowX = rect ? Math.max(18, Math.min(rect.left + rect.width / 2 - (coachStyle.left || 0), coachW - 26)) : 0;

  return portal(
    <div className="ob-tour" aria-live="polite">
      {measurer}
      {spotStyle && <div className="ob-spot" ref={spotRef} style={spotStyle} />}
      {!spotStyle && <div className="ob-dim" />}
      <div className={`ob-coach ${arrowClass}`} style={{ ...coachStyle, width: coachW, '--ob-ax': arrowX + 'px' }}>
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
    </div>
  );
}

export { GuidedTour, goToTodayTop };
