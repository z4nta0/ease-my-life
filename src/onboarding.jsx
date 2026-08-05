import React from 'react';
import { createPortal } from 'react-dom';
import { OB_EXAMPLE, OB_EXTRA_PICKERS, OB_TASKS, hydrateOnboardingStats } from './onboarding-seed-data.js';
import { reduceMotion } from './ui.jsx';

// Onboarding: first-run welcome modal + a spotlight tour that actually drives
// the app (each coach card's primary button performs the step, so the user
// can do it themselves or let the tour do it).
//
// Mid-rework: the tour used to walk the user through creating a real picker
// via the Create-a-picker form. That content — the steps themselves plus the
// mechanics that drove the form — has been cut from the active tour below and
// preserved verbatim in the "STASHED" comment block ahead of the component,
// for reuse when we build a dedicated "Create your first picker" mini-tour
// (launched from its own dismissible card, alongside other per-feature
// mini-tours). The active tour is being rebuilt to instead orient the user
// around what the app is/does and how it works. Decoupled from the tabs via:
//   • emlTour — a tiny observable bus (prefill for the picker form, plus live
//     phase/step so other tabs can react to the tour without a context
//     provider — e.g. the Today tab's "Get started" checklist gates its own
//     completion celebration on obBus.phase).
//   • window.__emlGenerate() — registered by TabToday so the tour can run the
//     generator without reaching into the footer's confirm dialog.
//   • data-tour / .ob-* / data-tab selectors on real target elements.
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

// OB_EXAMPLE / OB_EXTRA_PICKERS / OB_TASKS (the sample pickers/items/reminders
// seeded on a fresh install, before the welcome tour begins — see the seeding
// effect in Onboarding()) live in ./onboarding-seed-data.js, imported above.
// Kept out of this file specifically so scripts/build-onboarding-stats.mjs
// (a Node script, can't parse this file's JSX) can import the exact same data
// when precomputing ~1yr of matching pick/reminder history.

const OB_BRAND = 'M 24.467 527.792 C 67.266 416.298 77.088 228.913 172.207 434.412 C 200.739 535.77 262.562 434.412 314.873 292.51 C 381.45 120.201 450.381 44.636 528.854 24.365 C 521.725 22.337 512.215 24.365 493.193 34.5 C 369.548 105.451 295.85 292.51 234.029 363.461 C 186.473 414.14 167.451 241.831 124.651 262.102 C 101.828 270.008 60.133 375.754 24.467 527.792 Z';

// Conservative estimate of the coach card's own height — good enough to
// decide whether it fits above/below a step's highlighted target; the real
// value depends on each step's body-text length, which isn't measured.
// Shared by the reserve-space calculation and the coach's own placement.
const OB_COACH_H = 220;

// The lowest screen-y a spotlight/coach can safely sit without landing
// under fixed/sticky Today-tab chrome: the sticky header, PLUS — on mobile,
// where the groups rail flips from a side column to a horizontal pill bar
// stacked below the header (see tab-today.jsx's isRailHorizontal) — that
// rail too. Shared by the spotlight clamp, the reserve-space decision, and
// the coach's own placement, so all three agree on where "safe" starts.
const obSafeTop = () => {
  const header = document.querySelector('.today-h');
  let bottom = header ? header.getBoundingClientRect().bottom : 0;
  const rail = document.querySelector('.group-rail');
  if (rail && getComputedStyle(rail).flexDirection === 'row') {
    bottom = Math.max(bottom, rail.getBoundingClientRect().bottom);
  }
  return bottom;
};

// ── STASHED: create-a-picker tour content ──────────────────────────────────
// Cut from the active tour below when it was refocused on orienting the user
// around the app in general, rather than building a real picker step by
// step. Preserved verbatim (not live code — everything here is inside this
// comment) for reuse when we build a dedicated "Create your first picker"
// mini-tour, launched from its own dismissible card. All `step` numbers
// below are relative to the OLD 6-step layout (this content occupied indices
// 0-3, Generate was 4, the review/celebration step was 5) — recalculate for
// whatever local step numbering the new mini-tour ends up using.
//
// Supporting hooks this content depends on are NOT stashed — they were left
// in place in their own files, dormant but ready:
//   • app.jsx's TabBar renders `data-tab={t.id}` on every nav button (used
//     below to target the Pickers nav button).
//   • tab-picker.jsx's NewPickerForm still accepts an `openedByTour` prop
//     (suppresses its own tour-only "Picker name" field) and still renders
//     `.ob-picker-details` / `.ob-picker-next` / `.ob-picker-create` classes
//     on its Details-pill / Next / Create buttons for the tour to drive.
//   • tab-picker.jsx's onCreate still dedupes by name when `openedByTour` and
//     still calls `window.__emlPickerCreated()` on create/dedupe — that
//     window callback just isn't registered by anything right now (see the
//     advanceRef effect below, which needs to be restored to register it).
//
// 1) The advanceRef / window.__emlPickerCreated registration (lived right
//    after the `bus` line, inside the component body):
//
//   const advanceRef = React.useRef(null);
//   advanceRef.current = () => {
//     if (phase === 'tour' && (step === 2 || step === 3)) {
//       OB_EXTRA_PICKERS.forEach((p) => {
//         if (!state.pickers.some((pk) => pk.name === p.name)) actions.addPicker(p);
//       });
//       emlTour.set({ prefill: null });
//       selectTab('today');
//       setStep(4);
//     }
//   };
//   React.useEffect(() => {
//     window.__emlPickerCreated = () => { if (advanceRef.current) advanceRef.current(); };
//     return () => { if (window.__emlPickerCreated) delete window.__emlPickerCreated; };
//   }, []);
//
// 2) The four step definitions themselves (old indices 0-3, prepended to
//    whatever `steps` starts with today):
//
//   {
//     sel: '[data-tour="create-picker"], .ob-gsc', place: 'above',
//     title: 'Start with a picker',
//     body: 'Pickers are the heart of the app, containing a pool of items it chooses from each day. We’ll make one together.',
//     primary: 'Next', back: false,
//     run: () => { setStep(1); },
//   },
//   {
//     sel: '[data-tab="picker"]', place: 'below',
//     title: 'Pickers live here',
//     body: 'All of your pickers can be found on this page, which is also where new pickers are created. Click this button now so that we can create a new picker together.',
//     primary: 'Next', back: true,
//     run: () => { emlTour.set({ prefill: OB_EXAMPLE }); selectTab('picker'); setStep(2); },
//   },
//   {
//     sel: '.np-form', place: 'above',
//     title: 'Your first picker',
//     body: 'We’ve filled this out for you but feel free to change any of the details. Explore the form on your own to better understand how it works, or click Next once you’re ready to add items to its pool.',
//     primary: 'Next', back: true,
//     run: () => {
//       const toItems = document.querySelector('.ob-picker-next');
//       if (toItems) toItems.click();
//       setStep(3);
//     },
//   },
//   {
//     sel: '.np-form', place: 'above',
//     title: 'Your first picker’s items',
//     body: 'We’ve already added some items for you but feel free to delete any or add your own. Click Next once you are ready to generate your first todo list.',
//     primary: 'Next', back: true,
//     run: () => {
//       const create = document.querySelector('.ob-picker-create');
//       if (create) { create.click(); return; }
//       const toItems = document.querySelector('.ob-picker-next');
//       if (toItems) {
//         toItems.click();
//         let tries = 0;
//         const iv = setInterval(() => {
//           const c = document.querySelector('.ob-picker-create');
//           if (c) { clearInterval(iv); c.click(); }
//           else if (++tries > 25) clearInterval(iv);
//         }, 60);
//         return;
//       }
//       emlTour.set({ prefill: { ...OB_EXAMPLE, step: 2 } });
//       selectTab('picker');
//     },
//   },
//
// 3) goBack()'s special cases for to===0,1,2,3 (replaced the generic
//    `else selectTab('today')` fallback that's there now):
//
//   if (to === 0) { emlTour.set({ prefill: null }); selectTab('today'); }
//   else if (to === 1) { emlTour.set({ prefill: null }); selectTab('today'); }
//   else if (to === 2) {
//     emlTour.set({ prefill: { ...OB_EXAMPLE } });
//     selectTab('picker');
//     const details = document.querySelector('.ob-picker-details');
//     if (details) details.click();
//   }
//   else if (to === 3) { emlTour.set({ prefill: { ...OB_EXAMPLE, step: 2 } }); selectTab('picker'); }
//   else selectTab('today');
//
// 4) Desync-detection effect (catches the user clicking the real Pickers nav
//    button instead of the coach's Next during steps 0-1):
//
//   React.useEffect(() => {
//     if (phase === 'tour' && (step === 0 || step === 1) && active === 'picker') {
//       emlTour.set({ prefill: { ...OB_EXAMPLE } });
//       setStep(2);
//     }
//   }, [phase, step, active]);
//
// 5) Watchdog effect for steps 2-3 (re-opens the form if it hasn't mounted
//    shortly after the step opens):
//
//   React.useEffect(() => {
//     if (phase !== 'tour' || (step !== 2 && step !== 3)) return;
//     let tries = 0;
//     const iv = setInterval(() => {
//       if (document.querySelector('.np-form')) { clearInterval(iv); return; }
//       if (++tries > 20) { clearInterval(iv); return; }
//       emlTour.set({ prefill: { ...OB_EXAMPLE, ...(step === 3 ? { step: 2 } : {}) } });
//       selectTab('picker');
//     }, 120);
//     return () => clearInterval(iv);
//   }, [phase, step]);
//
// 6) Scroll-to-top special case inside the position-tracking effect's
//    bring() (landing on Details/Items scrolls the page to the very top
//    instead of just nudging the target into view):
//
//   if (step === 2 || step === 3) {
//     if (sc === document.scrollingElement || sc === document.documentElement) window.scrollTo(0, 0);
//     else sc.scrollTop = 0;
//     return;
//   }
// ─────────────────────────────────────────────────────────────────────────

function Onboarding({ state, actions, active, selectTab }) {
  const ob = state.onboarding || { welcomed: true };
  // phase: 'welcome' | 'tour' | 'off'
  const [phase, setPhase] = React.useState(ob.welcomed ? 'off' : 'welcome');
  const [step, setStep] = React.useState(0);
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
  const reduce = reduceMotion && reduceMotion();
  const bus = useEmlTour ? useEmlTour() : {};

  // If the flag flips (replay from Settings / demo route), re-open.
  React.useEffect(() => {
    if (!ob.welcomed && phase === 'off') { setPhase('welcome'); setStep(0); }
  }, [ob.welcomed]);

  // Seed the sample pickers/reminders immediately on a fresh install —
  // before the welcome tour even begins — so every tour step always has real
  // content to point at and generate from. Checked once on mount only (an
  // intentionally empty dep array): re-running on later state changes would
  // fight a user who's since deleted every picker on purpose.
  //
  // The ~1yr of matching Stats history is a ~650KB precomputed file that's
  // irrelevant to everyone past their first run, so it's dynamic-imported
  // (code-split out of the main bundle) rather than imported at the top of
  // this file. Its rows store day-offsets, not absolute dates —
  // hydrateOnboardingStats converts them to real ISO dates relative to
  // TODAY, not whenever the data was generated (see
  // scripts/build-onboarding-stats.mjs for why).
  React.useEffect(() => {
    if (ob.welcomed || state.pickers.length > 0) return;
    [OB_EXAMPLE, ...OB_EXTRA_PICKERS].forEach((p) => actions.addPicker(p));
    OB_TASKS.forEach((t) => actions.addTask(t));
    import('./onboarding-stats-data.js').then(({ ONBOARDING_STATS }) => {
      actions.seedHistory(hydrateOnboardingStats(ONBOARDING_STATS));
    });
  }, []);

  // Publish live phase/step on the bus so tabs can anchor tour targets even
  // when their normal render gate is off.
  React.useEffect(() => { emlTour.set({ phase, step }); }, [phase, step]);

  const finish = React.useCallback(() => {
    setPhase('off'); emlTour.set({ prefill: null });
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
  // Marks every picker-item entry (not reminders/day-off/etc.) not already
  // done — used both by the review step's own Next and by the watcher below,
  // so however the user completes one item, the whole list finishes together
  // and the real completion celebration plays.
  const markAllPicksDone = () => {
    (state.today.entries || []).forEach((e) => {
      if (e.itemId && !e.kind && !e.done) actions.toggleDone(e.eid);
    });
  };
  const steps = [
    {
      sel: '[data-tab="today"]', place: 'below',
      title: 'This is the Today page',
      body: <>The <b>Today</b> page is the main page of the app, and it will be where your auto-generated list will be displayed every day. Let’s explore this page now.</>,
      primary: 'Next', back: false,
      run: () => { setStep(1); },
    },
    {
      sel: '.ob-generate', place: 'above',
      title: 'Your first todo list',
      body: <>Each morning the app will automatically generate your daily todo list. The app is set up with some sample data so that you can see how it works. You can always click <b>Regenerate</b> if you’d rather generate the list yourself. Let’s go ahead and run it now.</>,
      primary: 'Next', back: true,
      run: () => {
        // On replay (dismissed:true) the user already has a real Today list —
        // don't regenerate and clobber it, just advance to the review step,
        // which highlights the list as it already stands. Otherwise kick off
        // the real generator and move on immediately (rather than waiting for
        // it to finish) — the next step's highlight covers the whole list,
        // group sections included, so it already has a real target to point
        // at while the list is still filling in.
        if (!ob.dismissed && window.__emlGenerate) window.__emlGenerate();
        setStep(2);
      },
    },
    {
      sel: '.group-section',
      place: 'below',
      title: 'Your first todo list!',
      body: <>This is what a typical <b>todo list</b> will look like once you set up your own pickers. The app will guide you through the picker creation process later on. Let’s move on for now.</>,
      primary: 'Next', back: true,
      run: () => { markAllPicksDone(); setStep(3); },
    },
    {
      sel: '[data-tab="picker"]', place: 'below',
      title: 'This is the Pickers page',
      body: <>The <b>Pickers</b> page is where new pickers and their items can be created. You can also run any picker to generate a task. Let’s explore this page now.</>,
      primary: 'Next', back: true,
      run: () => { selectTab('picker'); setStep(4); },
    },
    {
      sel: '.ob-picker-content', place: 'below',
      title: 'Pickers',
      body: <>You can find all of your existing pickers here, as well as <b>create new pickers</b>. You can also select a picker and have it randomly select a task. We will explore this page later on in more detail. Let’s move on for now.</>,
      primary: 'Next', back: true,
      run: () => { setStep(5); },
    },
    {
      sel: '[data-tab="stats"]', place: 'below',
      title: 'This is the Stats page',
      body: <>The <b>Stats</b> page is where you can find a breakdown of all the statistics associated with a given picker and its items. Let’s explore this page now.</>,
      primary: 'Done', back: true,
      run: () => { finish(); },
    },
  ];
  const cur = phase === 'tour' ? steps[step] : null;
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

  // Back reverses the step's navigation so the previous target exists again.
  const goBack = () => {
    const to = Math.max(0, step - 1);
    selectTab('today');
    setStep(to);
  };

  // On the review step, if the user checks off one item themselves (rather
  // than clicking the coach's Next), finish the rest for them so the list
  // completes together and the real completion celebration plays.
  React.useEffect(() => {
    if (phase !== 'tour' || step !== 2) return;
    const picks = (state.today.entries || []).filter((e) => e.itemId && !e.kind);
    if (picks.length === 0) return;
    const someDone = picks.some((e) => e.done);
    const allDone = picks.every((e) => e.done);
    if (someDone && !allDone) markAllPicksDone();
  }, [phase, step, state.today.entries]);

  // ── Position tracking: follow the target every frame while a step is up ──
  React.useEffect(() => {
    setRect(null); // drop the previous step's position so it can't paint under new text
    // Also drop any reserve the PREVIOUS step needed — this step's own need
    // (computed below from fresh measurements) may well be different, and
    // starting from zero avoids the new target's very first measurement
    // already reflecting stale leftover padding.
    setReserveTop(0);
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
    // Bring the target(s) into view once when the step opens.
    const bring = () => {
      const els = findTargets(cur.sel);
      if (!els.length) return;
      const sc = getScroller(els[0]);
      // Landing on the review step, or the Pickers-page content step: the
      // highlighted content starts right at the top of the page anyway, so
      // scroll all the way up rather than just nudging it into view — keeps
      // everything visible from the top instead of opening mid-scroll.
      if (step === 2 || step === 4) {
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
    // The Today tab's own header (and, on mobile, the groups rail stacked
    // below it) is `position: sticky; top: 0`-ish, with a higher z-index than
    // the surrounding content but a LOWER one than this tour overlay — so if
    // a highlighted rect's top scrolls above that chrome's bottom edge, the
    // spotlight's cutout (a box-shadow "hole") would expose it through the
    // dim instead of dimming it, reading as if the chrome itself were the
    // highlighted target. Clamp the rect actually drawn (not the one bring()
    // scrolls by, which needs the real position) so the spotlight never
    // reaches into that safe zone.
    const spotPad = 8;
    const clampToHeader = (r) => {
      // Clamp to the safe boundary PLUS the spot's own padding, so the
      // padded box drawn below never overlaps that chrome even by that margin.
      const minTop = obSafeTop() + spotPad;
      if (r.top >= minTop) return r;
      const top = Math.max(r.top, minTop);
      return { ...r, top, height: r.bottom - top };
    };
    const place = (els) => {
      const r = clampToHeader(unionRect(els));
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
    const decideReserve = (els) => {
      if (reserveDecided) return;
      reserveDecided = true;
      const r = unionRect(els);
      const vh = window.innerHeight;
      if (vh - (r.top + r.height) >= OB_COACH_H + 16) return; // fits below — reserveTop is already 0
      if (r.top - 16 - OB_COACH_H >= obSafeTop() + 12) return; // fits above — reserveTop is already 0
      setReserveTop(OB_COACH_H + 40);
    };
    // Reposition synchronously as scroll fires (before paint) so the highlight
    // doesn't trail the content the way a purely rAF-driven fixed box does.
    // Listen broadly (capture) so it fires for whichever element scrolls.
    const onScroll = () => { const els = findTargets(cur.sel); if (els.length) place(els); };
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    const loop = () => {
      if (cancelled) return;
      const els = findTargets(cur.sel);
      if (els.length) {
        if (!broughtRef) { broughtRef = true; bring(); } // scroll once the target actually exists
        decideReserve(els);
        const r = place(els);
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

  // Published on the bus so the active tab (which owns the actual scrollable
  // content) can apply it — this component only overlays the page, it
  // doesn't own that layout. reserveTop itself is set by the position-
  // tracking effect above, decided ONCE per step rather than continuously —
  // see the comment on decideReserve there for why.
  React.useEffect(() => { emlTour.set({ reserveTop }); }, [reserveTop]);

  if (phase === 'off') return null;
  const portal = (node) => createPortal(node, document.body);

  // ── Welcome modal ────────────────────────────────────────────────────
  if (phase === 'welcome') {
    return portal(
      <div className="ob-scrim" role="dialog" aria-modal="true" aria-label="Welcome">
        <div className={`ob-welcome ${reduce ? '' : 'ob-in'}`}>
          <div className="ob-wmark"><svg viewBox="8 8 528 528" fill="none"><path d={OB_BRAND} style={{ fill: 'currentColor', stroke: 'currentColor' }} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
          <h2>Welcome to Ease My Life</h2>
          <p>Decide less and add some variety to your life! Ease My Life is a todo app that generates a daily list of tasks from pools of items that you create and according to the rules that you set.</p>
          <p>This welcome tour will show you the layout of the app and help you understand how it works. After it finishes, there will be a few smaller tours that will guide you through setting up everything you need in order to generate your first list. Let’s get started!</p>
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
    if (spaceBelow >= OB_COACH_H + 16) {
      coachStyle = { top: rect.top + rect.height + 16, left };
      arrowClass = 'ob-coach--up';
    } else {
      coachStyle = { top: Math.max(rect.top - 16 - OB_COACH_H, safeTop), left };
      arrowClass = 'ob-coach--down';
    }
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
          <button className="ob-next" onClick={cur.run}>
            {cur.primary}{cur.primary !== 'Done' ? ' \u203A' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}

export { Onboarding };
