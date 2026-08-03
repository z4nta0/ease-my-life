import React from 'react';
import { createPortal } from 'react-dom';
import { reduceMotion } from './ui.jsx';

// Onboarding: first-run welcome modal + a 5-step spotlight tour that actually
// drives the app (each coach card's primary button performs the step, so the
// user can do it themselves or let the tour do it). Leaves the user a real
// "Chores" picker to tinker with. Decoupled from the tabs via:
//   • emlTour — a tiny observable bus (prefill for the picker form).
//   • window.__emlGenerate() — registered by TabToday so the tour can run the
//     generator without reaching into the footer's confirm dialog.
//   • data-tour / .ob-* selectors on real target elements.
//
// Trigger: shows when state.onboarding.welcomed is false (clean state). The dev
// SEED ships welcomed:true so the sample-data build isn't nagged; visit
// #onboard-demo for a non-destructive clean-state preview (see app.jsx).

// ── tiny observable bus ──────────────────────────────────────────────────
let s = { prefill: null, startCreate: null };
const subs = new Set();
export const emlTour = {
  get: () => s,
  set: (patch) => { s = { ...s, ...patch }; subs.forEach((f) => f(s)); },
  subscribe: (f) => { subs.add(f); return () => subs.delete(f); },
};
export const useEmlTour = function useEmlTour() {
  const [v, setV] = React.useState(emlTour.get());
  React.useEffect(() => {
    setV(emlTour.get()); // catch a set() that fired between render and subscribe
    return emlTour.subscribe(setV);
  }, []);
  return v;
};

// The example picker the tour seeds (editable in the real form).
const OB_EXAMPLE = {
  name: 'Daily Chores', group: 'Chores', mode: 'ease-up', step: 1,
  items: [
    { id: 'ob_it_laundry', name: 'Laundry', weight: 1, easeMin: 7, easeMax: 14, value: 100 },
    { id: 'ob_it_bath', name: 'Clean bathrooms', weight: 1, easeMin: 7, easeMax: 14, value: 100 },
  ],
};

const OB_BRAND = 'M 24.467 527.792 C 67.266 416.298 77.088 228.913 172.207 434.412 C 200.739 535.77 262.562 434.412 314.873 292.51 C 381.45 120.201 450.381 44.636 528.854 24.365 C 521.725 22.337 512.215 24.365 493.193 34.5 C 369.548 105.451 295.85 292.51 234.029 363.461 C 186.473 414.14 167.451 241.831 124.651 262.102 C 101.828 270.008 60.133 375.754 24.467 527.792 Z';

function Onboarding({ state, actions, active, selectTab }) {
  const ob = state.onboarding || { welcomed: true };
  // phase: 'welcome' | 'tour' | 'off'
  const [phase, setPhase] = React.useState(ob.welcomed ? 'off' : 'welcome');
  const [step, setStep] = React.useState(0);
  const [waiting, setWaiting] = React.useState(false); // generating in progress
  const [rect, setRect] = React.useState(null);
  const hadRectRef = React.useRef(false); // suppress the spot's slide-in on first paint
  const spotRef = React.useRef(null); // positioned imperatively each frame (no React lag)
  const reduce = reduceMotion && reduceMotion();
  const bus = useEmlTour ? useEmlTour() : {};

  // The picker form (both its own Create button and the coach's "Next") calls
  // window.__emlPickerCreated() after create/dedupe — a direct callback rather
  // than a mutable-bus flag, so advancement is deterministic. We keep the
  // handler current via a ref and register a stable window function once.
  const advanceRef = React.useRef(null);
  advanceRef.current = () => {
    // Fires once the picker is actually created — from either the Details or
    // the Items step (a user can fill everything in and hit the form's own
    // Create button before the tour's own Next catches up), so both count.
    if (phase === 'tour' && (step === 2 || step === 3)) {
      emlTour.set({ prefill: null });
      selectTab('today');
      setStep(4);
    }
  };
  React.useEffect(() => {
    window.__emlPickerCreated = () => { if (advanceRef.current) advanceRef.current(); };
    return () => { if (window.__emlPickerCreated) delete window.__emlPickerCreated; };
  }, []);

  // If the flag flips (replay from Settings / demo route), re-open.
  React.useEffect(() => {
    if (!ob.welcomed && phase === 'off') { setPhase('welcome'); setStep(0); }
  }, [ob.welcomed]);

  // Publish live phase/step on the bus so tabs can anchor tour targets even
  // when their normal render gate is off. TabToday uses this to force-render
  // the create-picker card during step 0 on replay (when ob.dismissed is true,
  // which otherwise hides both step-0 anchors → the dim-only "no coach" bug).
  React.useEffect(() => { emlTour.set({ phase, step }); }, [phase, step]);

  const finish = React.useCallback(() => {
    setPhase('off'); setWaiting(false); emlTour.set({ prefill: null });
  }, []);
  const welcomeDone = () => actions.setOnboarding({ welcomed: true });

  // While the tour runs, pad the scrollable content so bottom-anchored targets
  // (e.g. the Create-picker button) can scroll clear of the floating tab bar.
  React.useEffect(() => {
    document.body.classList.toggle('ob-touring', phase === 'tour');
    return () => document.body.classList.remove('ob-touring');
  }, [phase]);

  // ── Step definitions ────────────────────────────────────────────────
  // Each: target selector, placement hint, copy, primary action.
  const firstEntry = (state.today.entries || []).find((e) => e.itemId && !e.kind);
  const steps = [
    {
      sel: '[data-tour="create-picker"], .ob-gsc', place: 'above',
      title: 'Start with a picker',
      body: 'Pickers are the heart of the app, containing a pool of items it chooses from each day. We\u2019ll make one together.',
      primary: 'Next', back: false,
      run: () => { setStep(1); },
    },
    {
      sel: '[data-tab="picker"]', place: 'below',
      title: 'Pickers live here',
      body: 'All of your pickers can be found on this page, which is also where new pickers are created. Click this button now so that we can create a new picker together.',
      primary: 'Next', back: true,
      run: () => { emlTour.set({ prefill: OB_EXAMPLE }); selectTab('picker'); setStep(2); },
    },
    {
      // PLACEHOLDER copy — wording/what-to-point-out for this step is still TBD.
      sel: '.np-form', place: 'above',
      title: 'Your first picker',
      body: 'We’ve filled this out for you but feel free to change any of the details. Explore the form on your own to better understand how it works, or click Next once you’re ready to add items to its pool.',
      primary: 'Next', back: true,
      run: () => {
        // Advances the form itself (Details → Items); the tour's own step
        // then moves independently to the Items coach card.
        const toItems = document.querySelector('.ob-picker-next');
        if (toItems) toItems.click();
        setStep(3);
      },
    },
    {
      // PLACEHOLDER copy — wording/what-to-point-out for this step is still TBD.
      sel: '.np-form', place: 'above',
      title: 'Add items to the pool',
      body: 'We’ve added a couple of example items — rename or replace them, or just keep them and click Next to create the picker.',
      primary: 'Next', back: true,
      run: () => {
        // Both this "Next" and the form's own Create button funnel through the
        // picker form's onCreate, which dedupes and calls window.__emlPickerCreated()
        // to advance the tour.
        const create = document.querySelector('.ob-picker-create');
        if (create) { create.click(); return; }
        // The user hit the form's own "Details" step-pill, so the Create
        // button (only on the Items sub-step) isn't mounted. Advance the form
        // to Items (keeps the current name + prefilled items), then submit
        // once it mounts. Never blind-advance the tour here: doing so moved
        // on with no picker created and hung the generator in the next step.
        const toItems = document.querySelector('.ob-picker-next');
        if (toItems) {
          toItems.click();
          let tries = 0;
          const iv = setInterval(() => {
            const c = document.querySelector('.ob-picker-create');
            if (c) { clearInterval(iv); c.click(); }
            else if (++tries > 25) clearInterval(iv);
          }, 60);
          return;
        }
        // No form at all (shouldn't happen — the watchdog below re-opens it):
        // re-assert the prefill/tab rather than skipping ahead pickerless.
        emlTour.set({ prefill: { ...OB_EXAMPLE, step: 2 } });
        selectTab('picker');
      },
    },
    {
      sel: '.ob-generate', place: 'above',
      title: 'Your day builds itself',
      body: 'Each morning at a set time the app auto-picks your day or you can click Regenerate to run it whenever you like. Let’s go ahead and run it now.',
      primary: 'Next', back: true,
      run: () => {
        // On replay (dismissed:true) the user already has a real Today list —
        // don't regenerate and clobber it; just advance to the pick-highlight,
        // which anchors on their existing first pick.
        if (ob.dismissed) { setStep(5); return; }
        if (window.__emlGenerate) { setWaiting(true); window.__emlGenerate(); }
        else setStep(5);
      },
    },
    {
      sel: '.today-groups .today-card:not(.today-card--loader):not(.today-card--dayoff):not(.today-card--charging):not(.rem-card)',
      place: 'below',
      title: 'Your first pick was generated',
      body: 'The app picked one option from Chores. You can click it to check it off and mark it as completed, let’s do that now to celebrate!',
      primary: 'Next', back: true,
      run: () => { if (firstEntry) actions.toggleDone(firstEntry.eid); setStep(6); },
    },
    {
      sel: '.rem-section', place: 'above',
      title: 'Reminders',
      body: 'These are like normal to-dos, but with optional repeatability built in. e.g. “every 3 days”, “monthly”, etc... They surface here when due. You’re all set!',
      primary: 'Done', back: true,
      run: () => { finish(); },
    },
  ];
  const cur = phase === 'tour' ? steps[step] : null;
  // Resolve a step target honoring selector ORDER (querySelector uses DOM order),
  // so step 0 prefers the create-picker card and falls back to the checklist.
  const findTarget = (sel) => { for (const s of sel.split(',')) { const el = document.querySelector(s.trim()); if (el) return el; } return null; };

  // Back reverses the step's navigation so the previous target exists again.
  const goBack = () => {
    setWaiting(false);
    const to = Math.max(0, step - 1);
    if (to === 0) { emlTour.set({ prefill: null }); selectTab('today'); }
    // Coming back to "Pickers live here": undo the navigation so the coach
    // replays from the same vantage point (Today, pointing at the nav button)
    // it started from, rather than leaving the primed form open behind it.
    else if (to === 1) { emlTour.set({ prefill: null }); selectTab('today'); }
    else if (to === 2) {
      emlTour.set({ prefill: { ...OB_EXAMPLE } });
      selectTab('picker');
      // Coming back from the Items step: the form is still mounted (its own
      // internal sub-step doesn't reset just because the prefill ref changed),
      // so drive it back to Details itself — otherwise the coach card's
      // Details-oriented copy would sit over a form still showing Items.
      const details = document.querySelector('.ob-picker-details');
      if (details) details.click();
    }
    // Backing up from Generate to Items: force the form back open ON Items
    // (OB_EXAMPLE itself now starts on Details) in case it had already closed
    // after a successful create.
    else if (to === 3) { emlTour.set({ prefill: { ...OB_EXAMPLE, step: 2 } }); selectTab('picker'); }
    else selectTab('today');
    setStep(to);
  };

  // Auto-advance past the generate step once the day has entries.
  React.useEffect(() => {
    if (phase === 'tour' && step === 4 && waiting && firstEntry) {
      setWaiting(false); setStep(5);
    }
  }, [phase, step, waiting, firstEntry]);

  // If the user clicks the real Pickers nav button (or the create-picker
  // card's own button) instead of the coach's Next, they navigate to Pickers
  // without the prefill/advance — which desyncs the tour. Treat arriving on
  // Pickers during step 0 (the intro card) or step 1 ("Pickers live here",
  // this button's whole point) as the advance.
  React.useEffect(() => {
    if (phase === 'tour' && (step === 0 || step === 1) && active === 'picker') {
      emlTour.set({ prefill: { ...OB_EXAMPLE } });
      setStep(2);
    }
  }, [phase, step, active]);

  // Watchdog for steps 2-3 (the create-picker form's Details/Items sub-steps):
  // if the form hasn't mounted shortly after the step opens — a race where the
  // Picker tab or the prefill effect lagged — re-assert the prefill and tab so
  // the step can never strand on a blank dim. Checking for .np-form itself
  // (rather than a sub-step-specific target) means this doesn't misfire just
  // because the user has already clicked ahead to the other sub-step.
  React.useEffect(() => {
    if (phase !== 'tour' || (step !== 2 && step !== 3)) return;
    let tries = 0;
    const iv = setInterval(() => {
      if (document.querySelector('.np-form')) { clearInterval(iv); return; }
      if (++tries > 20) { clearInterval(iv); return; }
      // Fresh ref forces the form to (re)open; land it on whichever sub-step
      // this tour step represents.
      emlTour.set({ prefill: { ...OB_EXAMPLE, ...(step === 3 ? { step: 2 } : {}) } });
      selectTab('picker');
    }, 120);
    return () => clearInterval(iv);
  }, [phase, step]);

  // ── Position tracking: follow the target every frame while a step is up ──
  React.useEffect(() => {
    setRect(null); // drop the previous step's position so it can't paint under new text
    hadRectRef.current = false; // next appearance jumps into place, no slide-in
    if (!cur) return;
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
    // Bring the target into view once when the step opens.
    const bring = () => {
      const el = findTarget(cur.sel);
      if (!el) return;
      const sc = getScroller(el);
      // Landing on the Details step: the form is tall and starts at the very
      // top of the Pickers tab anyway, so scroll all the way up rather than
      // just nudging it into view — reads better fully from the top.
      if (step === 2) {
        if (sc === document.scrollingElement || sc === document.documentElement) window.scrollTo(0, 0);
        else sc.scrollTop = 0;
        return;
      }
      const isDoc = sc === document.scrollingElement || sc === document.documentElement;
      const er = el.getBoundingClientRect();
      const sr = isDoc ? { top: 0, bottom: window.innerHeight } : sc.getBoundingClientRect();
      const pad = 90, padB = 130;
      if (er.top < sr.top + pad) scrollByAmt(sc, -(sr.top + pad - er.top));
      else if (er.bottom > sr.bottom - padB) scrollByAmt(sc, er.bottom - (sr.bottom - padB));
    };
    bring();
    let broughtRef = false;
    const place = (el) => {
      const r = el.getBoundingClientRect();
      if (spotRef.current) {
        const pad = 8, s = spotRef.current.style;
        s.top = (r.top - pad) + 'px'; s.left = (r.left - pad) + 'px';
        s.width = (r.width + pad * 2) + 'px'; s.height = (r.height + pad * 2) + 'px';
      }
      return r;
    };
    // Reposition synchronously as scroll fires (before paint) so the highlight
    // doesn't trail the content the way a purely rAF-driven fixed box does.
    // Listen broadly (capture) so it fires for whichever element scrolls.
    const onScroll = () => { const el = findTarget(cur.sel); if (el) place(el); };
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    const loop = () => {
      if (cancelled) return;
      const el = findTarget(cur.sel);
      if (el) {
        if (!broughtRef) { broughtRef = true; bring(); } // scroll once the target actually exists
        const r = place(el);
        setRect((p) => (p && Math.abs(p.top - r.top) < 0.5 && Math.abs(p.left - r.left) < 0.5 && p.width === r.width && p.height === r.height)
          ? p : { top: r.top, left: r.left, width: r.width, height: r.height });
      } else {
        setRect(null);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelled = true; cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll, { capture: true }); };
  }, [phase, step, cur && cur.sel]);

  if (phase === 'off') return null;
  const portal = (node) => createPortal(node, document.body);

  // ── Welcome modal ────────────────────────────────────────────────────
  if (phase === 'welcome') {
    return portal(
      <div className="ob-scrim" role="dialog" aria-modal="true" aria-label="Welcome">
        <div className={`ob-welcome ${reduce ? '' : 'ob-in'}`}>
          <div className="ob-wmark"><svg viewBox="8 8 528 528" fill="none"><path d={OB_BRAND} style={{ fill: 'currentColor', stroke: 'currentColor' }} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
          <h2>Welcome to Ease My Life</h2>
          <p>Decide less. Ease My Life is a todo app that will generate a daily list of tasks for you. You will set up <b>pickers</b>, which are pools of tasks or choices, and then each day the app picks an item from each picker for you. Chores, meals, workouts or whatever you’d rather have the app decide for you. You add the items, so the picker is guaranteed to choose something you want.</p>
          <div className="ob-chips"><span>todo list</span><span>pickers</span><span>reminders</span></div>
          <div className="ob-wact">
            <button className="ob-btn ob-btn--primary" autoFocus onClick={() => { selectTab('today'); welcomeDone(); setPhase('tour'); setStep(0); }}>Take the quick tour</button>
            <button className="ob-btn ob-btn--ghost" onClick={() => { welcomeDone(); finish(); }}>I’ll explore myself</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Tour overlay (spotlight + coach) ──────────────────────────────────
  const total = steps.length;
  const vw = window.innerWidth, vh = window.innerHeight;
  const coachW = Math.min(300, vw - 24);
  let coachStyle, arrowClass, spotStyle = null;
  if (rect) {
    const pad = 8;
    hadRectRef.current = true;
    spotStyle = { top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2, transition: 'none' };
    const below = rect.top + rect.height / 2 < vh * 0.5;
    let left = Math.max(12, Math.min(rect.left, vw - coachW - 12));
    if (below) {
      coachStyle = { top: rect.top + rect.height + 16, left };
      arrowClass = 'ob-coach--up';
    } else {
      coachStyle = { bottom: vh - rect.top + 16, left };
      arrowClass = 'ob-coach--down';
    }
  } else if (waiting) {
    // Generating: target is briefly gone — center the coach with its wait state.
    coachStyle = { top: '50%', left: '50%', transform: 'translate(-50%,-50%)' };
    arrowClass = 'ob-coach--none';
  } else {
    // Target not found yet (mid-navigation). Show only the dim; the coach
    // appears once its target resolves, so no stale/centered flash.
    return portal(<div className="ob-tour" aria-live="polite"><div className="ob-dim" /></div>);
  }
  const arrowX = rect ? Math.max(18, Math.min(rect.left + rect.width / 2 - (coachStyle.left || 0), coachW - 26)) : 0;

  return portal(
    <div className="ob-tour" aria-live="polite">
      {spotStyle && <div className="ob-spot" ref={spotRef} style={spotStyle} />}
      {!spotStyle && <div className="ob-dim" />}
      <div className={`ob-coach ${arrowClass}`} style={{ ...coachStyle, width: coachW, '--ob-ax': arrowX + 'px' }}>
        <p className="ob-prog">Step {step + 1} of {total}</p>
        <h4>{cur.title}</h4>
        <p className="ob-body">{cur.body}</p>
        <div className="ob-crow">
          <div className="ob-lnav">
            <button className="ob-skip" onClick={finish}>Skip</button>
            {cur.back && <button className="ob-back" onClick={goBack}>‹ Back</button>}
          </div>
          <button className="ob-next" disabled={waiting} onClick={cur.run}>
            {waiting ? 'Generating\u2026' : cur.primary}{cur.primary !== 'Done' && !waiting ? ' \u203A' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

export { Onboarding };
