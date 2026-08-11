import React from 'react';
import { createPortal } from 'react-dom';

// On-demand "help mode": a per-page toggle that, once on, simultaneously
// highlights every tagged element on the CURRENT page with a small corner
// badge; clicking a badge reveals that element's tip (title + body, no
// Step N of N / Skip / Back / Next — see onboarding-tour-runner.jsx for
// that, a genuinely different engine). Deliberately NOT built on top of
// GuidedTour: that engine is sequential/single-spotlight and its dimming
// trick (one element's own box-shadow spread darkening everything outside
// it) doesn't compose for "many holes at once" — this instead paints ONE
// SVG path (evenodd fill-rule: an outer full-viewport rect plus one inner
// rect per highlighted target) so arbitrarily many cutouts coexist in a
// single dim layer. What DOES carry over from the tour: reusing its exact
// coach visual language (.ob-coach and its arrow) for the tip itself, per
// the design conversation this was built from — the only difference is the
// tip's own content (no nav chrome) and how it's triggered (click a badge,
// not "the current tour step").
//
// Ownership: the parent (each tab component) owns the on/off boolean as
// plain local state and renders both <HelpButton> (controlled toggle) and
// <HelpOverlay> from it — deliberately NOT a global bus like emlTour. Since
// this app renders exactly one tab's component tree at a time (no router —
// see CLAUDE.md), that local state resets to its default (off) every time a
// tab unmounts and remounts, which is exactly the "navigating away closes
// any open highlights, and the page you land on doesn't auto-open its own"
// behavior this was designed to have — for free, no explicit reset needed.

// The per-page toggle — usually placed in a page's own header. `active`
// mirrors whether HelpOverlay is currently showing anything for this page.
function HelpButton({ active, onClick }) {
  return (
    <button type="button" className={`help-btn ${active ? 'is-on' : ''}`}
            onClick={onClick} aria-pressed={active}
            aria-label={active ? 'Hide help highlights' : 'Show help highlights'}>
      i
    </button>
  );
}

// Same comma-separated-fallback semantics as the tour's own findTargets —
// kept as an independent copy rather than a shared import: these two
// engines are meant to stay decoupled (see this file's own header comment),
// and the two copies are small enough that duplicating them costs far less
// than the coupling would.
const findTargets = (sel) => {
  for (const s of sel.split(',')) {
    const els = [...document.querySelectorAll(s.trim())]
      .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 || r.height > 0; });
    if (els.length) return els;
  }
  return [];
};
const unionRect = (els) => {
  let top = Infinity, left = Infinity, right = -Infinity, bottom = -Infinity;
  els.forEach((el) => {
    const r = el.getBoundingClientRect();
    top = Math.min(top, r.top); left = Math.min(left, r.left);
    right = Math.max(right, r.right); bottom = Math.max(bottom, r.bottom);
  });
  return { top, left, right, bottom, width: right - left, height: bottom - top };
};

// Badge geometry, shared between where it's actually drawn and where a tip
// anchored to it should point — a 20px circle overlapping the highlighted
// box's own top-right corner (matching the "small corner marker" design,
// distinct from InfoTip's own inline-trigger placement).
const BADGE_SIZE = 20;
const badgeRectFor = (targetRect, pad) => {
  const top = targetRect.top - pad - BADGE_SIZE / 2;
  const left = targetRect.right + pad - BADGE_SIZE / 2;
  return { top, left, width: BADGE_SIZE, height: BADGE_SIZE, bottom: top + BADGE_SIZE };
};

// Where the open tip should sit relative to the badge that opened it — same
// "prefer below, flip above if it'd clip, clamp horizontally, keep the
// arrow pointed at the badge" math as both InfoTip's place() and the tour's
// own coach placement, just centered on a badge's small rect instead of a
// trigger span or a whole highlighted target.
const placeTip = (badgeRect, tw, th) => {
  const vw = window.innerWidth, vh = window.innerHeight, M = 8;
  const spaceBelow = vh - badgeRect.bottom;
  let top, arrowClass;
  if (spaceBelow >= th + 16) { top = badgeRect.bottom + 16; arrowClass = 'ob-coach--up'; }
  else { top = Math.max(M, badgeRect.top - 16 - th); arrowClass = 'ob-coach--down'; }
  const left = Math.max(M, Math.min(badgeRect.left + badgeRect.width / 2 - tw / 2, vw - tw - M));
  const arrowX = Math.max(18, Math.min(badgeRect.left + badgeRect.width / 2 - left, tw - 26));
  return { top, left, arrowClass, arrowX };
};

// One tip, positioned once its own size is known (mirrors InfoTip's own
// measure-after-mount approach) — simpler than the tour's permanent hidden
// measurer since at most one of these ever exists at a time.
function HelpTip({ item, badgeRect }) {
  const ref = React.useRef(null);
  const [style, setStyle] = React.useState(null);
  const [arrowClass, setArrowClass] = React.useState('ob-coach--up');
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { top, left, arrowClass: ac, arrowX } = placeTip(badgeRect, el.offsetWidth, el.offsetHeight);
    setStyle({ top, left, '--ob-ax': arrowX + 'px' });
    setArrowClass(ac);
  }, [badgeRect]);
  return (
    <div ref={ref} className={`ob-coach help-tip ${arrowClass}`}
         style={style || { top: -9999, left: -9999 }} role="tooltip">
      <p className="help-tip-title">{item.title}</p>
      <div className="ob-body">{item.body}</div>
    </div>
  );
}

// items: [{ id, sel, title, body }] — sel follows GuidedTour's own
// comma-fallback convention, and can match several elements at once (e.g. a
// tightly-clustered row of buttons) the same way a tour step's sel can; the
// whole group shares one badge and one tip, positioned off their combined
// union — same "union of matched elements" idea as unionRect above, just
// for a badge anchor instead of a single spotlight.
function HelpOverlay({ active, items }) {
  const [rectsById, setRectsById] = React.useState({});
  const [openId, setOpenId] = React.useState(null);

  // Recomputes every tagged element's current rect every frame while
  // active — simplest reliable way to stay correct under scrolling AND
  // content reflow without hand-rolling separate scroll/resize/
  // MutationObserver plumbing, and with only a handful of elements per page
  // the per-frame cost is negligible (same trade-off the tour's own
  // position-tracking loop already makes, just over N targets instead of
  // one).
  React.useEffect(() => {
    if (!active) { setRectsById({}); setOpenId(null); return; }
    let raf, cancelled = false;
    const loop = () => {
      if (cancelled) return;
      const next = {};
      items.forEach((it) => {
        const els = findTargets(it.sel);
        if (els.length) next[it.id] = unionRect(els);
      });
      setRectsById(next);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelled = true; cancelAnimationFrame(raf); };
  }, [active, items]);

  // Blocks interaction with anything NOT currently tagged (or part of help
  // mode's own UI) while active — same capture-phase idea as the tour's own
  // click-guard, generalized from "the one current step's target" to "any
  // of this page's tagged elements". A plain click-only guard (not the
  // tour's fuller mousedown/focusout handling too) is enough here: help
  // mode has no editable-field-losing-focus scenario to protect against,
  // since nothing it points at is meant to be typed into while it's up.
  // .tabbar is always exempt too — navigating away is what's SUPPOSED to
  // close this (see this file's own header comment on ownership), which
  // can't happen if the nav buttons themselves get blocked like everything
  // else untagged.
  React.useEffect(() => {
    if (!active) return;
    const isOnTarget = (e) => {
      if (e.target.closest('.help-badge, .help-tip, .help-btn, .tabbar')) return true;
      return items.some((it) => findTargets(it.sel).some((el) => el.contains(e.target)));
    };
    const onClickCapture = (e) => {
      if (isOnTarget(e)) return;
      e.preventDefault(); e.stopPropagation();
      setOpenId(null);
    };
    document.addEventListener('click', onClickCapture, true);
    return () => document.removeEventListener('click', onClickCapture, true);
  }, [active, items]);

  if (!active) return null;

  const vw = window.innerWidth, vh = window.innerHeight, pad = 8;
  const entries = Object.entries(rectsById);
  // Evenodd path: an outer full-viewport rect, then one inner rect per
  // highlighted target — evenodd doesn't care about winding direction, so
  // each hole just needs to be A closed rect, not a specifically-wound one.
  const pathD = `M0,0H${vw}V${vh}H0Z ` + entries.map(([, r]) => {
    const w = r.width + pad * 2, h = r.height + pad * 2;
    return `M${r.left - pad},${r.top - pad}h${w}v${h}h${-w}Z`;
  }).join(' ');

  const openItem = openId ? items.find((it) => it.id === openId) : null;
  const openRect = openId ? rectsById[openId] : null;

  return createPortal(
    <div className="help-mode" aria-live="polite">
      <svg className="help-dim-svg" width={vw} height={vh}>
        <path d={pathD} fillRule="evenodd" />
      </svg>
      {entries.map(([id, r]) => (
        <div key={id} className="help-spot"
             style={{ top: r.top - pad, left: r.left - pad, width: r.width + pad * 2, height: r.height + pad * 2 }} />
      ))}
      {items.map((it) => {
        const r = rectsById[it.id];
        if (!r) return null;
        const br = badgeRectFor(r, pad);
        return (
          <button key={it.id} type="button"
                  className={`help-badge ${openId === it.id ? 'is-on' : ''}`}
                  style={{ top: br.top, left: br.left }}
                  onClick={(e) => { e.stopPropagation(); setOpenId((cur) => cur === it.id ? null : it.id); }}
                  aria-label={typeof it.title === 'string' ? it.title : 'More info'}>
            i
          </button>
        );
      })}
      {openItem && openRect && (
        <HelpTip item={openItem} badgeRect={badgeRectFor(openRect, pad)} />
      )}
    </div>,
    document.body
  );
}

export { HelpButton, HelpOverlay };
