import React from 'react';
import { PALETTES, applyPaletteObj, resolveActiveThemeKey, resolveCustomPalette } from './appearance.js';
import { Onboarding, useEmlTour } from './onboarding.jsx';
import { PickerTour } from './onboarding-picker-tours.jsx';
import { CLEAN_STATE } from './seed.js';
import { useStore } from './store.jsx';
import { TabData } from './tab-data.jsx';
import { TabPicker } from './tab-picker.jsx';
import { TabSettings } from './tab-settings.jsx';
import { TabStats } from './tab-stats.jsx';
import { TabToday } from './tab-today.jsx';
import { Icon, reduceMotion } from './ui.jsx';

// App shell. Tab bar (bottom / side / top) + main content area.

const TABS = [
  { id: 'today',    label: 'Today',    icon: 'today' },
  { id: 'picker',   label: 'Pickers',  icon: 'picker' },
  { id: 'stats',    label: 'Stats',    icon: 'stats' },
  { id: 'data',     label: 'Data',     icon: 'data' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];



function TabBar({ active, onChange, placement, railOpen, onToggleRail, className = '', ghost }) {
  const navRef = React.useRef(null);
  const [ind, setInd] = React.useState(null); // {x,y,w,h} of active tab, nav-relative
  React.useLayoutEffect(() => {
    const measure = () => {
      const nav = navRef.current;
      if (!nav) return;
      const btn = nav.querySelector('.tabbtn.is-on');
      if (!btn) { setInd(null); return; }
      const nr = nav.getBoundingClientRect(), br = btn.getBoundingClientRect();
      setInd({ x: br.left - nr.left + nav.scrollLeft, y: br.top - nr.top + nav.scrollTop, w: br.width, h: br.height });
    };
    measure();
    const nav = navRef.current;
    const ro = nav && window.ResizeObserver ? new ResizeObserver(measure) : null;
    if (ro && nav) ro.observe(nav);
    window.addEventListener('resize', measure);
    return () => { if (ro) ro.disconnect(); window.removeEventListener('resize', measure); };
  }, [active, placement, railOpen]);
  return (
    <nav ref={navRef} className={`tabbar tabbar--${placement} ${railOpen ? 'is-open' : ''} ${className}`} aria-label="Sections" aria-hidden={ghost || undefined}>
      {ind && <span className="tabbar-indicator" aria-hidden="true"
                    style={{ transform: `translate(${ind.x}px, ${ind.y}px)`, width: ind.w + 'px', height: ind.h + 'px' }} />}
      <button type="button" className="tabbar-brand" onClick={() => onChange('today')} aria-label="Ease My Life — go to Today">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="8 8 528 528" width="18" height="18" fill="none">
            <defs>
              <clipPath id="brandMarkClipNav" clipPathUnits="userSpaceOnUse">
                <rect width="512" height="512" y="16" x="16" rx="75" ry="75" />
              </clipPath>
            </defs>
            <g style={{ stroke: 'var(--accent-soft)', strokeWidth: 16 }}>
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
              style={{ strokeWidth: 16, strokeLinecap: 'round', strokeLinejoin: 'round', stroke: 'currentColor' }} />
            <path
              d="M 24.467 527.792 C 67.266 416.298 77.088 228.913 172.207 434.412 C 200.739 535.77 262.562 434.412 314.873 292.51 C 381.45 120.201 450.381 44.636 528.854 24.365 C 521.725 22.337 512.215 24.365 493.193 34.5 C 369.548 105.451 295.85 292.51 234.029 363.461 C 186.473 414.14 167.451 241.831 124.651 262.102 C 101.828 270.008 60.133 375.754 24.467 527.792 Z"
              strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"
              clipPath="url(#brandMarkClipNav)"
              style={{ fill: 'currentColor', stroke: 'currentColor' }}
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
                style={{ fill: 'currentColor', stroke: 'currentColor' }} />
            </svg>
          </span>
          <span className="bw-lines">
            <span className="bw-ease">Ease</span>
            <span className="bw-rest">My Life</span>
          </span>
        </span>
      </button>
      {TABS.map((t) => (
        <button key={t.id}
                className={`tabbtn ${t.id === active ? 'is-on' : ''}`}
                data-tab={t.id}
                onClick={() => onChange(t.id)}
                aria-current={t.id === active ? 'page' : undefined}>
          <Icon name={t.icon} size={20} />
          <span>{t.label}</span>
        </button>
      ))}
      {/* Pull handle — only visible when the side rail collapses to a drawer on
         small screens (CSS-gated). Rides the rail's outer edge; chevron flips. */}
      <button type="button" className="rail-handle"
              onClick={onToggleRail}
              aria-label={railOpen ? 'Collapse menu' : 'Expand menu'}
              aria-expanded={railOpen}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
             stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d={railOpen ? 'M 15 6 L 9 12 L 15 18' : 'M 9 6 L 15 12 L 9 18'} />
        </svg>
      </button>
    </nav>
  );
}


function App() {
  // Non-destructive onboarding preview: #onboard-demo (or #onboard) runs the app
  // on a fresh clean state for this tab only, without touching saved data.
  const onboardDemo = typeof location !== 'undefined' && location.hash.indexOf('onboard') !== -1;
  const [state, actions] = useStore(onboardDemo ? { initial: CLEAN_STATE(), persist: false } : undefined);
  // Deep-link straight to Settings via #settings.
  const [active, setActive] = React.useState(() => (
    location.hash === '#settings' ? 'settings' : 'today'
  ));

  // Collapsible side rail (small screens only — the rail becomes an off-canvas
  // drawer there instead of falling back to bottom tabs). Starts closed; the
  // pull handle toggles it, and selecting a tab or tapping the scrim closes it.
  const [railOpen, setRailOpen] = React.useState(false);
  // Which sample picker's mini-tour is currently running — null when none
  // is. Lives here rather than in TabToday (unlike the reminder mini-tours)
  // because Step 1 navigates to the Pickers tab, which would unmount
  // TabToday (and anything it owns) along with it; same reasoning as
  // Onboarding itself living at this level.
  const [activePickerTour, setActivePickerTour] = React.useState(null);
  // The Welcome Tour auto-opens/closes this same rail while it's running, so
  // a step spotlighting a nav button can actually find it there even when
  // collapsed — see onboarding.jsx's wantRailOpen publish. Only acts while a
  // tour is actually active, so it never fights the user's own manual
  // toggling outside of one. Depends on obBus.step too, not just
  // wantRailOpen's own value — two consecutive nav-button steps both want it
  // open (true → true, no value change to react to), but selectTab (called
  // by the outgoing step's own run()) unconditionally closes the rail on
  // every tab switch in between. Without step in the deps, that close would
  // never get corrected past the first pair of back-to-back nav steps.
  const obBus = useEmlTour();
  React.useEffect(() => {
    if (obBus.phase === 'tour' && typeof obBus.wantRailOpen === 'boolean') setRailOpen(obBus.wantRailOpen);
  }, [obBus.phase, obBus.wantRailOpen, obBus.step]);
  const mainRef = React.useRef(null);
  // Nav layout-switch animation: when tabPlacement changes, keep a fixed-overlay
  // GHOST of the old bar mounted to play its exit-toward-edge keyframe while the
  // real bar (now in the new slot) plays a staggered enter-from-edge; main's
  // padding transition eases the content reflow. Reduced motion skips it all.
  const [exitingPlacement, setExitingPlacement] = React.useState(null);
  const [navEntering, setNavEntering] = React.useState(false);
  const prevPlacementRef = React.useRef((state.appearance && state.appearance.tabPlacement) || 'bottom');
  // Switching tabs should always land at the top of the new tab — otherwise the
  // shared <main> scroller keeps the previous tab's scroll position, which reads
  // as arriving on a page already scrolled down.
  const selectTab = React.useCallback((id) => {
    setActive(id);
    setRailOpen(false);
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, []);

  // Theme is now a real, persisted Settings feature (Appearance tab) rather
  // than a design-time default — resolve the active preset or custom
  // colors and apply them on every appearance change (and once on load).
  // When "System preference" is on, also track prefers-color-scheme so the
  // applied theme swaps to its counterpart as the OS switches.
  const [systemDark, setSystemDark] = React.useState(() => (
    typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches
  ));
  React.useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  React.useEffect(() => {
    const ap = state.appearance || { theme: 'ink' };
    const key = resolveActiveThemeKey(ap, systemDark);
    let palette;
    if (key === 'customLight' && ap.customLight) palette = resolveCustomPalette('light', ap.customLight);
    else if (key === 'customDark' && ap.customDark) palette = resolveCustomPalette('dark', ap.customDark);
    else palette = PALETTES[key] || PALETTES.ink;
    applyPaletteObj(palette, key);
  }, [state.appearance, systemDark]);
  React.useEffect(() => {
    document.body.dataset.placement = (state.appearance && state.appearance.tabPlacement) || 'bottom';
  }, [state.appearance && state.appearance.tabPlacement]);
  React.useEffect(() => {
    document.body.dataset.completionStyle = (state.appearance && state.appearance.completionStyle) || 'confetti';
  }, [state.appearance && state.appearance.completionStyle]);
  const placement = (state.appearance && state.appearance.tabPlacement) || 'bottom';
  React.useLayoutEffect(() => {
    const prev = prevPlacementRef.current;
    if (prev === placement) return;
    prevPlacementRef.current = placement;
    if (reduceMotion && reduceMotion()) return;
    setExitingPlacement(prev);
    setNavEntering(true);
    const t1 = setTimeout(() => setExitingPlacement(null), 380);
    const t2 = setTimeout(() => setNavEntering(false), 560);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [placement]);

  return (
    <div className="app" data-placement={placement}>
      <TabBar active={active} onChange={selectTab} placement={placement}
              className={navEntering ? 'tabbar--entering' : ''}
              railOpen={railOpen} onToggleRail={() => setRailOpen((v) => !v)} />
      {exitingPlacement && (
        <TabBar active={active} onChange={() => {}} placement={exitingPlacement}
                className="tabbar--exiting" ghost
                railOpen={false} onToggleRail={() => {}} />
      )}
      {railOpen && <div className="rail-scrim" onClick={() => setRailOpen(false)} aria-hidden="true" />}
      <main className="main" ref={mainRef}>
        {active === 'today' && <div className="tab-fade" key="today"><TabToday state={state} actions={actions} onHome={() => selectTab('today')} onNavTab={selectTab} onStartPickerTour={setActivePickerTour} /></div>}
        {active !== 'today' && (
          <div className="main-inner tab-fade" key={active}>
            {active === 'picker'   && <TabPicker   state={state} actions={actions} onHome={() => selectTab('today')} onNavTab={selectTab} animStyle={(state.appearance && state.appearance.pickAnim) || 'reel'} />}
            {active === 'stats'    && <TabStats    state={state} actions={actions} onHome={() => selectTab('today')} onNavTab={selectTab} />}
            {active === 'data'     && <TabData     state={state} actions={actions} onHome={() => selectTab('today')} onNavTab={selectTab} />}
            {active === 'settings' && <TabSettings state={state} actions={actions} onHome={() => selectTab('today')} onNavTab={selectTab} />}
          </div>
        )}
      </main>

      <Onboarding state={state} actions={actions} active={active} selectTab={selectTab} />
      {activePickerTour && (
        <PickerTour
          pickerId={activePickerTour}
          state={state}
          actions={actions}
          active={active}
          selectTab={selectTab}
          onClose={() => setActivePickerTour(null)}
        />
      )}

    </div>
  );
}

export { App };
