import React from 'react';
import { createPortal } from 'react-dom';
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

// Sample "Daily Chores" picker — seeded (along with OB_EXTRA_PICKERS, below)
// on a fresh install before the welcome tour begins, see the seeding effect
// in Onboarding(). Also prefill data for the (currently stashed)
// create-a-picker form flow further down, for whenever the future
// create-a-picker mini-tour reuses this same data.
const OB_EXAMPLE = {
  name: 'Daily Chores', group: 'Chores', mode: 'ease-up', step: 1,
  items: [
    { id: 'ob_it_laundry', name: 'Do the laundry', weight: 1, easeMin: 7, easeMax: 14, value: 100 },
    { id: 'ob_it_bath', name: 'Clean the bathrooms', weight: 1, easeMin: 12.5, easeMax: 20, value: 100 },
    { id: 'ob_it_dust', name: 'Dust the main living area', weight: 1, easeMin: 9.0909, easeMax: 12.5, value: 100 },
    { id: 'ob_it_vacuum', name: 'Vacuum the floors', weight: 1, easeMin: 11.1111, easeMax: 16.6667, value: 100 },
    { id: 'ob_it_shower', name: 'Clean the shower', weight: 1, easeMin: 5.5556, easeMax: 8.3333, value: 100 },
    { id: 'ob_it_oven', name: 'Clean the oven', weight: 1, easeMin: 4.7619, easeMax: 7.1429, value: 100 },
  ],
};

const OB_BRAND = 'M 24.467 527.792 C 67.266 416.298 77.088 228.913 172.207 434.412 C 200.739 535.77 262.562 434.412 314.873 292.51 C 381.45 120.201 450.381 44.636 528.854 24.365 C 521.725 22.337 512.215 24.365 493.193 34.5 C 369.548 105.451 295.85 292.51 234.029 363.461 C 186.473 414.14 167.451 241.831 124.651 262.102 C 101.828 270.008 60.133 375.754 24.467 527.792 Z';

// Extra sample pickers (Chores/Food/Self Care/Entertainment) meant to make a
// generated day look like a fuller, more realistic todo list instead of a
// single lonely item. Each uses the Create-a-picker form's own defaults
// (daily cadence, every day of the week, holidays not skipped, included in
// the daily generator) aside from what's specified here. Seeded alongside
// OB_EXAMPLE — see the seeding effect in Onboarding().
const OB_EXTRA_PICKERS = [
  {
    name: 'Monthly Chores', group: 'Chores', mode: 'ease-up',
    items: [
      { name: 'Deep clean the oven', weight: 1, easeMin: 2.5, easeMax: 4.1667, value: 100 },
      { name: 'Dust the entire house', weight: 1, easeMin: 3.7037, easeMax: 5.5556, value: 100 },
      { name: 'Clean out the fridge', weight: 1, easeMin: 2.2222, easeMax: 3.0303, value: 100 },
      { name: 'Vacuum under the furniture', weight: 1, easeMin: 1.6667, easeMax: 2.5, value: 100 },
      { name: 'Mop the floors', weight: 1, easeMin: 4.3478, easeMax: 6.6667, value: 100 },
    ],
  },
  {
    name: 'Coffee Creamer', group: 'Food', mode: 'dynamic',
    items: [
      { name: 'French Vanilla', weight: 1 },
      { name: 'Caramel', weight: 3 },
      { name: 'Sweet Cream', weight: 2 },
      { name: 'Cinnamon', weight: 1 },
      { name: 'Pumpkin Spice', weight: 2 },
      { name: 'Hazelnut', weight: 1 },
      { name: 'Mocha', weight: 3 },
    ],
  },
  {
    name: 'Dinner', group: 'Food', mode: 'ease-up',
    items: [
      { name: 'Spaghetti and meatballs', weight: 1, easeMin: 8.3333, easeMax: 14.2857, value: 100 },
      { name: 'Meatloaf', weight: 1, easeMin: 7.1429, easeMax: 10, value: 100 },
      { name: 'Tacos', weight: 1, easeMin: 10, easeMax: 16.6667, value: 100 },
      { name: 'Pizza', weight: 1, easeMin: 12.5, easeMax: 20, value: 100 },
      { name: 'Steak and potatoes', weight: 1, easeMin: 7.6923, easeMax: 11.1111, value: 100 },
      { name: 'Burger and fries', weight: 1, easeMin: 9.0909, easeMax: 12.5, value: 100 },
      { name: 'Lemon Chicken', weight: 1, easeMin: 7.1429, easeMax: 14.2857, value: 100 },
      { name: 'Fried chicken', weight: 1, easeMin: 11.1111, easeMax: 16.6667, value: 100 },
    ],
  },
  {
    name: 'Workouts', group: 'Self Care', mode: 'ease-up',
    items: [
      { name: 'Chest', weight: 1, easeMin: 14.2857, easeMax: 20, value: 100 },
      { name: 'Legs', weight: 1, easeMin: 12.5, easeMax: 16.6667, value: 100 },
      { name: 'Shoulders', weight: 1, easeMin: 11.1111, easeMax: 14.2857, value: 100 },
      { name: 'Arms', weight: 1, easeMin: 12.5, easeMax: 25, value: 100 },
      { name: 'Core', weight: 1, easeMin: 12.5, easeMax: 20, value: 100 },
    ],
  },
  {
    name: 'Relax', group: 'Entertainment', mode: 'ease-down',
    items: [
      { name: 'Read a book', weight: 1, easeMin: 14.2857, easeMax: 20, value: 100 },
      { name: 'Binge watch a show', weight: 1, easeMin: 20, easeMax: 50, value: 100 },
      { name: 'Watch a movie', weight: 1, easeMin: 16.6667, easeMax: 33.3333, value: 100 },
      { name: 'Browse YouTube', weight: 1, easeMin: 25, easeMax: 50, value: 100 },
    ],
  },
];

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
  const [waiting, setWaiting] = React.useState(false); // generating in progress
  const [rect, setRect] = React.useState(null);
  const hadRectRef = React.useRef(false); // suppress the spot's slide-in on first paint
  const spotRef = React.useRef(null); // positioned imperatively each frame (no React lag)
  const reduce = reduceMotion && reduceMotion();
  const bus = useEmlTour ? useEmlTour() : {};

  // If the flag flips (replay from Settings / demo route), re-open.
  React.useEffect(() => {
    if (!ob.welcomed && phase === 'off') { setPhase('welcome'); setStep(0); }
  }, [ob.welcomed]);

  // Seed the sample pickers immediately on a fresh install — before the
  // welcome tour even begins — so every tour step always has real pickers to
  // point at and generate from. Checked once on mount only (an intentionally
  // empty dep array): re-running on later state changes would fight a user
  // who's since deleted every picker on purpose.
  React.useEffect(() => {
    if (ob.welcomed || state.pickers.length > 0) return;
    [OB_EXAMPLE, ...OB_EXTRA_PICKERS].forEach((p) => actions.addPicker(p));
  }, []);

  // Publish live phase/step on the bus so tabs can anchor tour targets even
  // when their normal render gate is off.
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
      body: 'Each morning the app will automatically generate your daily todo list, using the pickers that you created. You can also click Regenerate to run it whenever you like. Let’s go ahead and run it now.',
      primary: 'Next', back: true,
      run: () => {
        // On replay (dismissed:true) the user already has a real Today list —
        // don't regenerate and clobber it; just advance to the pick-highlight,
        // which anchors on their existing first pick.
        if (ob.dismissed) { setStep(2); return; }
        if (window.__emlGenerate) { setWaiting(true); window.__emlGenerate(); }
        else setStep(2);
      },
    },
    {
      sel: '.today-groups .today-card:not(.today-card--loader):not(.today-card--dayoff):not(.today-card--charging):not(.rem-card)',
      place: 'below',
      title: 'Your first picks were generated',
      body: 'The app created some extra pickers for you, so that you can see what a typical todo list will look like. You can check these off to mark them as completed. Let’s do that now to celebrate!',
      primary: 'Done', back: true,
      run: () => { markAllPicksDone(); finish(); },
    },
  ];
  const cur = phase === 'tour' ? steps[step] : null;
  // Resolve a step target honoring selector ORDER (querySelector uses DOM order).
  const findTarget = (sel) => { for (const s of sel.split(',')) { const el = document.querySelector(s.trim()); if (el) return el; } return null; };

  // Back reverses the step's navigation so the previous target exists again.
  const goBack = () => {
    setWaiting(false);
    const to = Math.max(0, step - 1);
    selectTab('today');
    setStep(to);
  };

  // Auto-advance past the generate step once the day has entries.
  React.useEffect(() => {
    if (phase === 'tour' && step === 1 && waiting && firstEntry) {
      setWaiting(false); setStep(2);
    }
  }, [phase, step, waiting, firstEntry]);

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
