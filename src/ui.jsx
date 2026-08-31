import React from 'react';
import { createPortal } from 'react-dom';

let announce;
export { announce };

// Shared UI primitives.

const Icon = ({ name, size = 18 }) => {
  const paths = {
    today:    <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /><rect x="7" y="12.5" width="4" height="4" rx="1" fill="currentColor" stroke="none" /></>,
    picker:   <><path d="M3 6h4l10 12h4M3 18h4l3.5-4.2M14.5 8.2L17 6h4" /><path d="M18 3l3 3-3 3M18 15l3 3-3 3" /></>,
    stats:    <><path d="M4 20V10M11 20V4M18 20v-8M21 20H3" /></>,
    data:     <><ellipse cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v12c0 1.66 3.13 3 7 3s7-1.34 7-3V6" /><path d="M5 12c0 1.66 3.13 3 7 3s7-1.34 7-3" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 0 1 7 4.7l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>,
    check:    <><path d="M4 12l5 5L20 6" /></>,
    skip:     <><path d="M5 4l10 8-10 8V4zM19 5v14" /></>,
    plus:     <><path d="M12 5v14M5 12h14" /></>,
    x:        <><path d="M6 6l12 12M18 6L6 18" /></>,
    play:     <><path d="M6 4l14 8-14 8z" /></>,
    sparkle:  <><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /></>,
    flame:    <><path d="M12 3c0 4-5 6-5 11a5 5 0 0 0 10 0c0-2-1-3-2-4 0 2-1 3-2 3 0-3 2-5-1-10z" /></>,
    moon:     <><path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z" /></>,
    refresh:  <><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5" /></>,
    grip:     <><circle cx="9" cy="6" r="1" /><circle cx="15" cy="6" r="1" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /><circle cx="9" cy="18" r="1" /><circle cx="15" cy="18" r="1" /></>,
    palette:  <><path d="M12 3a9 9 0 1 0 0 18c1 0 1.5-.5 1.5-1.3 0-.4-.2-.7-.4-1-.2-.3-.4-.6-.4-1 0-.8.6-1.4 1.4-1.4H16a4 4 0 0 0 4-4c0-5-3.6-9-8-9z"/><circle cx="7.5" cy="10.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="11" cy="7" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.5" cy="8" r="1.1" fill="currentColor" stroke="none"/></>,
    chev:     <><path d="M9 6l6 6-6 6" /></>,
    chev_d:   <><path d="M6 9l6 6 6-6" /></>,
    arrow_down: <><path d="M12 5v14M6 13l6 6 6-6" /></>,
    arrow_up:   <><path d="M12 19V5M6 11l6-6 6 6" /></>,
    download: <><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></>,
    upload:   <><path d="M12 21V9M7 14l5-5 5 5M5 3h14" /></>,
    edit:     <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></>,
    pin:      <><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
    trash:    <><path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" /></>,
    eye_off:  <><path d="M3 3l18 18M10.6 6.1A9.7 9.7 0 0 1 12 6c5 0 9 6 9 6a16 16 0 0 1-3.1 3.6M6.1 6.1A16 16 0 0 0 3 12s4 6 9 6c1.4 0 2.7-.4 4-1" /><circle cx="12" cy="12" r="3" /></>,
    eye:      <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
         aria-hidden="true">
      {paths[name]}
    </svg>
  );
};

// forwardRef so callers can restore focus to a button after an action that
// hands focus away (see the Settings export/import confirmations).
const Btn = React.forwardRef(({ children, kind = 'ghost', size = 'md', icon, className = '', ...rest }, ref) => (
  <button ref={ref} className={`btn btn--${kind} btn--${size} ${className}`} {...rest}>
    {icon && <Icon name={icon} size={size === 'sm' ? 14 : 16} />}
    {children}
  </button>
));

const Card = ({ children, padded = true, className = '', ...rest }) => (
  <div className={`card ${padded ? 'card--p' : ''} ${className}`} {...rest}>{children}</div>
);

// Animated disclosure. Wraps children in a grid whose single row transitions
// 0fr↔1fr, so it eases height to/from auto without hardcoded max-heights, plus
// a fade+slide on the inner content. Crucially it UNMOUNTS children after the
// close animation and remounts them on open — which preserves the snapshot-on-
// open behaviour that the Controls panels and item editors rely on for Cancel.
function Collapse({ open, children, className = '' }) {
  const [render, setRender] = React.useState(open);   // is the child mounted?
  const [expanded, setExpanded] = React.useState(false); // drives 0fr/1fr — starts
  // collapsed even when open, so a fresh mount-while-open still animates open
  // (the effect's rAF flips it) instead of snapping to the expanded state.
  React.useEffect(() => {
    if (open) { setRender(true); return; }   // mount first; expand handled below
    setExpanded(false);   // animate closed; unmount happens on transitionend
    // Reduced motion kills the transition, so transitionend never fires —
    // unmount the child directly instead of leaving it collapsed-but-mounted.
    if (reduceMotion && reduceMotion()) setRender(false);
  }, [open]);
  // Flip to expanded only AFTER the child is mounted (render true) and committed,
  // so the collapsed 0fr state has painted first — otherwise a fresh open-from-
  // unmounted races the mount paint and snaps open. Depends on `render` so it
  // re-runs on the mount commit, not just the open change.
  React.useEffect(() => {
    if (!open || !render) return;
    const r1 = requestAnimationFrame(() => {
      const r2 = requestAnimationFrame(() => setExpanded(true));
      return () => cancelAnimationFrame(r2);
    });
    return () => cancelAnimationFrame(r1);
  }, [open, render]);
  const onTransitionEnd = (e) => {
    if (e.target === e.currentTarget && e.propertyName === 'grid-template-rows' && !open) {
      setRender(false);
    }
  };
  if (!render) return null;
  return (
    <div className={`collapse ${expanded ? 'is-open' : ''} ${className}`} onTransitionEnd={onTransitionEnd}>
      <div className="collapse-inner">{children}</div>
    </div>
  );
}

const SectionTitle = ({ kicker, title, sub }) => (
  <header className="section-h">
    {kicker && <div className="kicker">{kicker}</div>}
    <h1 className="section-title">{title}</h1>
    {sub && <p className="section-sub">{sub}</p>}
  </header>
);

const Pill = ({ children, tone = 'default' }) => (
  <span className={`pill pill--${tone}`}>{children}</span>
);

// Weekday selector — a row of 7 toggle chips (Sun…Sat). `value` is an array of
// day indices (0=Sun … 6=Sat); onChange gets the next array. At least one day
// must stay selected, so the last chip can't be turned off.
//
// `lockedDay` (0–6, or null) pins one day ON: a weekly-cadence picker's anchor
// day must stay selected, so that chip renders as an InfoTip instead of a toggle
// — it still looks selected, but tapping explains why it can't be turned off
// rather than silently doing nothing. `lockedTip` is that explanation.
const WEEKDAY_LB = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const WEEKDAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WeekdayChips = ({ value, onChange, size = 'md', lockedDay = null, lockedTip = '', describedBy }) => {
  const toggle = (d) => {
    const has = value.includes(d);
    const next = has ? value.filter((x) => x !== d) : [...value, d];
    next.sort((a, b) => a - b);
    if (next.length === 0) return; // never allow an empty week
    onChange(next);
  };
  return (
    <div className={`dow-chips ${size === 'sm' ? 'dow-chips--sm' : ''}`} role="group" aria-label="Days of the week" aria-describedby={describedBy}>
      {WEEKDAY_LB.map((lb, d) => {
        const on = value.includes(d);
        if (d === lockedDay) return (
          <InfoTip key={d} className={`dow-chip is-on is-locked ${size === 'sm' ? 'dow-chip--sm' : ''}`}
                   label={lockedTip}>{lb}</InfoTip>
        );
        return (
          <button key={d} type="button"
                  className={`dow-chip ${on ? 'is-on' : ''}`}
                  aria-pressed={on} aria-label={WEEKDAY_FULL[d]} title={WEEKDAY_FULL[d]}
                  aria-describedby={describedBy}
                  onClick={() => toggle(d)}>{lb}</button>
        );
      })}
    </div>
  );
};

// Compact human summary of a daysOfWeek array: "Every day", "Weekdays",
// "Weekends", or an abbreviated list like "Mon, Wed, Fri".
const WEEKDAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const weekdaySummary = (days) => {
  const s = [...(days || [])].sort((a, b) => a - b);
  if (s.length === 7) return 'Every day';
  if (s.length === 5 && [1, 2, 3, 4, 5].every((d) => s.includes(d))) return 'Weekdays';
  if (s.length === 2 && s.includes(0) && s.includes(6)) return 'Weekends';
  if (s.length === 0) return 'Never';
  return s.map((d) => WEEKDAY_ABBR[d]).join(', ');
};

const ProgressBar = ({ value, max = 1, tone = 'accent' }) => (
  <div className={`prog prog--${tone}`}>
    <i style={{ width: `${Math.max(0, Math.min(1, value / max)) * 100}%` }} />
  </div>
);

// −/[editable number]/+ stepper. The value can be typed directly (handy for big
// jumps the +/− buttons make tedious); typing commits on blur/Enter, clamped to
// [min,max]. onSet receives the new integer. Used by every ease Soonest/Latest.
function NumStepper({ value, min = 1, max = 99, onSet, ariaLabel }) {
  const [text, setText] = React.useState(String(value));
  React.useEffect(() => { setText(String(value)); }, [value]);
  const commit = () => {
    let n = parseInt(text, 10);
    if (isNaN(n)) n = value;
    n = Math.max(min, Math.min(max, n));
    onSet(n);
    setText(String(n));
  };
  return (
    <div className="np-stepper" role="group" aria-label={ariaLabel}>
      <button className="np-weight-btn" onClick={() => onSet(Math.max(min, value - 1))}
              disabled={value <= min} aria-label="Fewer days">−</button>
      <input className="np-stepper-input" type="text" inputMode="numeric" value={text}
             aria-label={ariaLabel}
             onChange={(e) => setText(e.target.value.replace(/[^0-9]/g, ''))}
             onFocus={(e) => e.target.select()}
             onBlur={commit}
             onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} />
      <button className="np-weight-btn" onClick={() => onSet(Math.min(max, value + 1))}
              disabled={value >= max} aria-label="More days">+</button>
    </div>
  );
}

// Custom tooltip. Unlike the native `title` attribute, this one is styled to
// match the UI, opens on tap as well as hover (most users are on mobile), and
// renders through a portal to <body> so it's clamped to the viewport and never
// clipped by the app frame or pushed off-screen.
//
// Interaction model, tuned to avoid the classic hover/tap conflict:
//   • mouse      → hover to show (pointerenter/leave); clicks are ignored
//   • touch/pen  → tap to toggle
//   • keyboard   → focus + Enter/Space to toggle, Escape or blur to close
// `action` marks the tip as standing in for a disabled control: it names the
// action in the accessible name and adds aria-disabled, which announces the
// disabled state WITHOUT removing focusability or replacing the name — so the
// tip's explanation is still read out. (These triggers are deliberately
// focusable: focus + Enter is the only way a keyboard user can learn WHY the
// action is unavailable.)
// `truncationOnly`: for the "reveal a CSS-ellipsis-truncated name" use case
// (as opposed to an always-relevant explanation like a disabled-action reason
// or a "?" help icon). When set, the trigger measures its own
// scrollWidth vs. clientWidth and behaves as a totally inert, non-focusable
// span — no tooltip, no cursor affordance — whenever the text isn't actually
// truncated, since there's nothing extra to reveal. Watched via ResizeObserver
// on the trigger itself rather than a window resize listener: a column can
// narrow (or a name can stop fitting) for reasons that never fire `resize` —
// e.g. a sibling row's Collapse animation later adding a scrollbar that
// shaves a few px off every row's width — and only observing the element's
// own box catches all of those, not just an outer-viewport size change.
const InfoTip = ({ children, label, className = '', action = null, truncationOnly = false }) => {
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState({ left: 0, top: 0, placement: 'top' });
  const [truncated, setTruncated] = React.useState(false);
  const triggerRef = React.useRef(null);
  const tipRef = React.useRef(null);
  const lastPointer = React.useRef('mouse');
  const active = truncationOnly ? truncated : true;

  React.useLayoutEffect(() => {
    if (!truncationOnly) return;
    const el = triggerRef.current;
    if (!el) return;
    const check = () => setTruncated(el.scrollWidth > el.clientWidth);
    check();
    if (typeof ResizeObserver === 'function') {
      const ro = new ResizeObserver(check);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [truncationOnly, label]);

  const place = React.useCallback(() => {
    const trg = triggerRef.current, tip = tipRef.current;
    if (!trg || !tip) return;
    const r = trg.getBoundingClientRect();
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    const M = 8; // keep this far from any viewport edge
    const vw = window.innerWidth, vh = window.innerHeight;
    // Prefer above the trigger; flip below if it would clip the top.
    let placement = 'top';
    let top = r.top - th - 8;
    if (top < M) { placement = 'bottom'; top = r.bottom + 8; }
    if (top + th > vh - M) top = Math.max(M, vh - th - M);
    // Center on the trigger, then clamp horizontally to the viewport.
    let left = r.left + r.width / 2 - tw / 2;
    left = Math.max(M, Math.min(left, vw - tw - M));
    setPos({ left, top, placement });
  }, []);

  React.useLayoutEffect(() => {
    if (!open) return;
    place();
    const onMove = () => place();
    window.addEventListener('scroll', onMove, true);
    window.addEventListener('resize', onMove);
    return () => {
      window.removeEventListener('scroll', onMove, true);
      window.removeEventListener('resize', onMove);
    };
  }, [open, place]);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (triggerRef.current && triggerRef.current.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Safety net: if a resize un-truncates the text while its tip is open
  // (truncationOnly only), close it rather than leave a tooltip open on what
  // just became an inert span.
  React.useEffect(() => { if (!active) setOpen(false); }, [active]);

  // Ref stays attached even while inactive so the truncation check above has
  // something to measure — this is the only state that can flip `active` on.
  if (!active) {
    return <span ref={triggerRef} className={className}>{children}</span>;
  }
  return (
    <span ref={triggerRef}
          className={`infotip-trigger ${className}`}
          tabIndex={0}
          role="button"
          aria-label={action ? `${action}, unavailable. ${label}` : label}
          aria-disabled={action ? 'true' : undefined}
          onPointerDown={(e) => { lastPointer.current = e.pointerType || 'mouse'; }}
          onPointerEnter={(e) => { if ((e.pointerType || 'mouse') === 'mouse') setOpen(true); }}
          onPointerLeave={(e) => { if ((e.pointerType || 'mouse') === 'mouse') setOpen(false); }}
          onClick={(e) => {
            e.stopPropagation();
            if (lastPointer.current !== 'mouse') setOpen((o) => !o);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((o) => !o); }
          }}
          onBlur={() => setOpen(false)}>
      {children}
      {open && createPortal(
        <span ref={tipRef}
              className={`infotip infotip--${pos.placement}`}
              style={{ left: pos.left, top: pos.top }}
              role="tooltip">
          {label}
        </span>,
        document.body
      )}
    </span>
  );
};

// Friendly date — "Wed · May 13"
const fmtDate = (iso) => {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

// Long form — "Wednesday, May 13"
const fmtDateLong = (iso) => {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
};

// Time — "3:42 PM" (no seconds)
const fmtTime = (iso) => {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

// BoostReset — the dynamic-mode "+N" Boost value + Reset lever. Clicking Reset
// commits the value to 0 (via onReset) AND animates the shown number ticking
// down to zero. Used by picker items (tab-today EntryEditor) and conditionals.
function BoostReset({ value, suffix = '', onReset }) {
  const [display, setDisplay] = React.useState(value);
  const animRef = React.useRef(0);
  // Follow the real value when we're not mid-animation (e.g. it climbed +1).
  React.useEffect(() => { if (!animRef.current) setDisplay(value); }, [value]);
  React.useEffect(() => () => cancelAnimationFrame(animRef.current), []);
  const doReset = () => {
    if (!value) return;
    if (reduceMotion && reduceMotion()) { onReset(); setDisplay(0); return; }
    // Duration scales with magnitude so small values don't blink past and large
    // ones don't crawl — clamped to a sensible min/max.
    const from = value, start = performance.now();
    const dur = Math.max(280, Math.min(900, from * 55));
    onReset();                       // commit real state to 0
    cancelAnimationFrame(animRef.current);
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from * (1 - eased)));
      if (p < 1) animRef.current = requestAnimationFrame(tick);
      else { animRef.current = 0; setDisplay(0); }
    };
    animRef.current = requestAnimationFrame(tick);
  };
  return (
    <React.Fragment>
      <span className="pie-boost-val">+{display}{suffix}</span>
      <button className="pie-reset" onClick={doReset} disabled={!value}
              aria-label="Reset boost to zero">Reset</button>
    </React.Fragment>
  );
}

// Edit-guard coordinator — lets live-commit editors (picker settings, picker
// items) discard UNSAVED edits when the editor closes implicitly (tab-switch or
// reload) while KEEPING them on an in-tab sibling swap. An unmounting editor
// arm()s a revert on the next macrotask; a sibling editor mounting in the same
// React commit disarm()s it before it fires. A real tab-switch leaves nothing to
// disarm, so the revert runs. (Reload is handled by each editor's own pagehide
// synchronous localStorage restore, so this timeout never matters there.)
// True when the user has asked the OS to minimize non-essential motion. JS-driven
// animations (rAF tweens, Element.animate, smooth scrolls) must check this since
// the CSS media query doesn't reach them.
export const reduceMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

// useEscapeCancel(active, handler) — Escape cancels the innermost open inline
// editor / add-form. Registered on a stack so only the deepest active editor
// reacts, and skipped while a tooltip or modal scrim is showing (those own
// Escape first). Escape is NOT bound to collapsible sections: the ARIA
// disclosure pattern doesn't use it, their state is persisted, and they nest.
// Document-level rather than an input's onKeyDown so it still fires after focus
// has moved to a control inside the editor.
window.__escStack = window.__escStack || [];
export const useEscapeCancel = function useEscapeCancel(active, handler) {
  const ref = React.useRef(handler);
  ref.current = handler;
  React.useEffect(() => {
    if (!active) return;
    const entry = { run: () => ref.current && ref.current() };
    window.__escStack.push(entry);
    return () => {
      const i = window.__escStack.indexOf(entry);
      if (i > -1) window.__escStack.splice(i, 1);
    };
  }, [active]);
};
if (!window.__escBound) {
  window.__escBound = true;
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    const stack = window.__escStack;
    if (!stack.length) return;
    if (document.querySelector('.infotip, .ob-scrim')) return;   // overlay owns Escape
    e.preventDefault();
    stack[stack.length - 1].run();
  });
}

// announce(text, { assertive }) — speak a transient status to screen
// readers. The region is created ONCE at load and lives in <body>, because a
// live region that mounts together with its text is announced unreliably (and
// not at all in several browser/SR pairs). Independent of focus, so it still
// works after an action moves focus (a download link, a file dialog) — that
// focus loss is why the confirmations in Settings were silent while the reader
// wandered off to the page title.
(() => {
  const el = document.createElement('div');
  el.className = 'sr-live';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  el.setAttribute('aria-atomic', 'true');
  const attach = () => document.body && document.body.appendChild(el);
  if (document.body) attach(); else document.addEventListener('DOMContentLoaded', attach);
  let t = null;
  announce = (text, opts) => {
    if (!text) return;
    el.setAttribute('aria-live', (opts && opts.assertive) ? 'assertive' : 'polite');
    // Clear first, then set on the next tick: re-announces identical text and
    // guarantees the reader sees a change rather than a same-value write.
    el.textContent = '';
    clearTimeout(t);
    t = setTimeout(() => { el.textContent = text; }, 60);
  };
})();

window.__editGuard = window.__editGuard || {
  _t: null, _fn: null,
  arm(fn) { clearTimeout(this._t); this._fn = fn; this._t = setTimeout(() => { const f = this._fn; this._fn = null; this._t = null; if (f) try { f(); } catch (e) {} }, 0); },
  disarm() { clearTimeout(this._t); this._t = null; this._fn = null; },
};

// FillButton — the ghost "Fill / Refill / Fill all / Refill all" lever for ease
// modes. Spins its refresh icon once on click for subtle feedback, and takes a
// `disabled` flag (callers pass true when already at full charge, so a filled
// item/picker can't be re-filled). Shared by picker items, pickers, conditionals.
function FillButton({ label, onClick, disabled }) {
  const [spin, setSpin] = React.useState(false);
  return (
    <Btn kind="ghost" size="sm" icon="refresh" disabled={disabled}
         className={spin ? 'is-spinning' : ''}
         onClick={() => { if (disabled) return; if (!reduceMotion()) setSpin(true); onClick(); }}
         onAnimationEnd={() => setSpin(false)}>{label}</Btn>
  );
}

export { Icon, Btn, Card, Collapse, Pill, ProgressBar, NumStepper, InfoTip, WeekdayChips, BoostReset, FillButton, fmtDate, fmtDateLong, fmtTime };
