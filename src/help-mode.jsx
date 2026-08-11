import React from 'react';
import { createPortal } from 'react-dom';

// On-demand "help mode": a per-page toggle that, once on, simultaneously
// highlights every tagged element on the CURRENT page with a small corner
// badge; clicking a badge reveals that element's tip (title + body, no
// Step N of N / Skip / Back / Next — see onboarding-tour-runner.jsx for
// that, a genuinely different engine). Deliberately NOT built on top of
// GuidedTour: that engine is sequential/single-spotlight and its dimming
// trick (one element's own box-shadow spread darkening everything outside
// it) doesn't compose for "many holes at once" — this instead paints a
// single SVG mask (a full-viewport white rect, plus one black rounded-rect
// per highlighted target) so arbitrarily many cutouts coexist in one dim
// layer, each shaped to roughly match its own target's own border-radius
// rather than always being a plain square. What DOES carry over from the
// tour: reusing its exact coach visual language (.ob-coach and its arrow)
// for the tip itself, per the design conversation this was built from — the
// only difference is the tip's own content (no nav chrome) and how it's
// triggered (click a badge, not "the current tour step").
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
// Same fix as onboarding-tour-runner.jsx's own clipHorizontalOverflow (see
// its header comment there for the full story) ported here for the same
// reason: an item like Pickers' "Picker Selection" matches every tab in a
// horizontally-scrollable row (.picker-tabs), and once there are enough
// pickers to overflow it, the ones scrolled out of view still report a
// real, full-width getBoundingClientRect() — unioning them in stretches the
// highlight into empty space past the row's own clipped edge. Clips each
// element's rect against its own overflow-x (if it's the scrollable box
// itself) and every scrollable ancestor's visible bounds before it ever
// reaches the union; returns null if an element ends up fully clipped away.
const clipHorizontalOverflow = (rect, el) => {
  let top = rect.top, left = rect.left, right = rect.right, bottom = rect.bottom;
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

// Extra margin drawn around every highlighted target's own rect — module-
// level (not a render-local const) since the shape math below needs it too,
// at the point rects are first computed, not just at render time.
const PAD = 8;
// Only meaningful for a SINGLE matched element — a multi-element union (a
// clustered group of buttons, say) has no one shape of its own, so those
// fall back to the default rounded-rect (see DEFAULT_R below) instead of
// trying to average several unrelated corner radii together. Reads the
// element's own computed border-radius and reproduces it at the padded
// box's size: a percentage (almost always 50%, i.e. "fully round") scales
// with the padded width/height the exact way CSS's own border-radius:50%
// already does, so a padded circle stays a circle and a padded pill stays a
// pill; a pixel value just gets the same pad added back on top, to roughly
// preserve how rounded it reads once the box has grown.
const DEFAULT_R = 12; // matches --r-md
// `shapeOverride: 'circle'` on a help item skips CSS inspection entirely —
// needed for targets like the progress ring, whose round appearance comes
// from an inner SVG <circle> rather than the element's own border-radius
// (which reads as a plain 0), so auto-detection has nothing to read.
const shapeFor = (el, paddedW, paddedH, shapeOverride) => {
  if (shapeOverride === 'circle') return { rx: paddedW / 2, ry: paddedH / 2 };
  const first = (getComputedStyle(el).borderRadius || '').split(' ')[0];
  if (!first) return { rx: DEFAULT_R, ry: DEFAULT_R };
  if (first.endsWith('%')) {
    const pct = parseFloat(first) / 100;
    if (Number.isNaN(pct)) return { rx: DEFAULT_R, ry: DEFAULT_R };
    return { rx: pct * paddedW, ry: pct * paddedH };
  }
  const px = parseFloat(first);
  if (Number.isNaN(px) || px === 0) return { rx: DEFAULT_R, ry: DEFAULT_R };
  return { rx: px + PAD, ry: px + PAD };
};

// Badge geometry, shared between where it's actually drawn and where a tip
// anchored to it should point — a 20px circle overlapping the highlighted
// box's own top-right corner (matching the "small corner marker" design,
// distinct from InfoTip's own inline-trigger placement).
const BADGE_SIZE = 20;
const badgeRectFor = (targetRect) => {
  const top = targetRect.top - PAD - BADGE_SIZE / 2;
  const left = targetRect.right + PAD - BADGE_SIZE / 2;
  return { top, left, width: BADGE_SIZE, height: BADGE_SIZE, bottom: top + BADGE_SIZE };
};

// Where the open tip should sit relative to the target it describes — same
// "prefer below, flip above if it'd clip, clamp horizontally" idea as both
// InfoTip's place() and the tour's own coach placement. Both axes are
// TARGET-relative, not badge-relative (the badge only marks where to click,
// it isn't where the tip should point): vertically it clears the target's
// own rect so a big target (e.g. the progress ring) can't have "below"
// still land inside its own box; horizontally the arrow centers on the
// target's own midpoint, and the tip box is what shifts left/right off that
// centerpoint to stay clear of the viewport edge — e.g. a target near the
// left edge gets a tip whose bulk extends rightward with the arrow near the
// tip's own left end, and vice versa near the right edge.
const placeTip = (targetRect, tw, th) => {
  const vw = window.innerWidth, vh = window.innerHeight, M = 8;
  const spaceBelow = vh - targetRect.bottom;
  let top, arrowClass;
  if (spaceBelow >= th + 16) { top = targetRect.bottom + 16; arrowClass = 'ob-coach--up'; }
  else { top = Math.max(M, targetRect.top - 16 - th); arrowClass = 'ob-coach--down'; }
  const centerX = targetRect.left + targetRect.width / 2;
  const left = Math.max(M, Math.min(centerX - tw / 2, vw - tw - M));
  const arrowX = Math.max(18, Math.min(centerX - left, tw - 26));
  return { top, left, arrowClass, arrowX };
};

// One tip, positioned once its own size is known (mirrors InfoTip's own
// measure-after-mount approach) — simpler than the tour's permanent hidden
// measurer since at most one of these ever exists at a time.
function HelpTip({ item, targetRect }) {
  const ref = React.useRef(null);
  const [style, setStyle] = React.useState(null);
  const [arrowClass, setArrowClass] = React.useState('ob-coach--up');
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { top, left, arrowClass: ac, arrowX } = placeTip(targetRect, el.offsetWidth, el.offsetHeight);
    setStyle({ top, left, '--ob-ax': arrowX + 'px' });
    setArrowClass(ac);
  }, [targetRect]);
  return (
    <div ref={ref} className={`ob-coach help-tip ${arrowClass}`}
         style={style || { top: -9999, left: -9999 }} role="tooltip">
      <p className="help-tip-title">{item.title}</p>
      <div className="ob-body">{item.body}</div>
    </div>
  );
}

// Always included ahead of whatever page-specific items are passed in —
// every page shares the same bottom/side nav, and it was flagged as a real
// point of user confusion (icon-only on mobile, no label) worth explaining
// everywhere rather than something each page's own catalog has to remember
// to add. One shared badge/tip for the whole bar rather than one per
// button: five that close together would be its own clutter problem, the
// same reasoning behind clustering e.g. a card's Re-roll/Skip/Edit under
// one badge.
const NAV_HELP_ITEM = {
  id: '__nav', sel: '[data-tab]',
  title: 'Navigation',
  body: (
    <ol className="help-tip-list">
      <li><b>Today</b> — your auto-generated daily todo list.</li>
      <li><b>Pickers</b> — create pickers/items, or run one manually.</li>
      <li><b>Stats</b> — statistics for your pickers and items.</li>
      <li><b>Data</b> — view and edit all your pickers, items and reminders.</li>
      <li><b>Settings</b> — customize the app, the daily generator, and more.</li>
    </ol>
  ),
};

// items: [{ id, sel, title, body }] — sel follows GuidedTour's own
// comma-fallback convention, and can match several elements at once (e.g. a
// tightly-clustered row of buttons) the same way a tour step's sel can; the
// whole group shares one badge and one tip, positioned off their combined
// union — same "union of matched elements" idea as unionRect above, just
// for a badge anchor instead of a single spotlight. `onExit` fires when the
// user asks to leave help mode entirely (Escape with no tip open, or a
// second Escape after one closes a tip) — the parent is the one that
// actually flips its own `active` state back off in response.
function HelpOverlay({ active, items, onExit }) {
  const allItems = React.useMemo(() => [NAV_HELP_ITEM, ...items], [items]);
  const [rectsById, setRectsById] = React.useState({});
  const [openId, setOpenId] = React.useState(null);
  const [toggleRect, setToggleRect] = React.useState(null);

  // Recomputes every tagged element's current rect (plus, for a single-
  // element target, its own shape — see shapeFor's own comment) every frame
  // while active — simplest reliable way to stay correct under scrolling
  // AND content reflow without hand-rolling separate scroll/resize/
  // MutationObserver plumbing, and with only a handful of elements per page
  // the per-frame cost is negligible (same trade-off the tour's own
  // position-tracking loop already makes, just over N targets instead of
  // one).
  React.useEffect(() => {
    if (!active) { setRectsById({}); setOpenId(null); setToggleRect(null); return; }
    let raf, cancelled = false;
    const loop = () => {
      if (cancelled) return;
      const next = {};
      allItems.forEach((it) => {
        const els = findTargets(it.sel);
        if (!els.length) return;
        const r = unionRect(els);
        // Every matched element can still end up fully clipped away by
        // unionRect's own horizontal-scroll clipping (e.g. a target scrolled
        // out of a row with nothing else in the selector to fall back on) —
        // same "not currently reachable, so no badge this frame" outcome as
        // finding zero elements in the first place, rather than feeding an
        // Infinity-valued rect to the SVG below.
        if (!Number.isFinite(r.width) || !Number.isFinite(r.height)) return;
        const shape = els.length === 1 ? shapeFor(els[0], r.width + PAD * 2, r.height + PAD * 2, it.shape) : null;
        next[it.id] = { ...r, shape };
      });
      setRectsById(next);
      // The page's own toggle button is never one of `allItems` (it's not a
      // highlighted target), but it still needs a mask cutout: it sits
      // inside `header.today-h`, which is `position:sticky` with its own
      // z-index — a nested stacking context that traps the button's own
      // z-index below the dim layer's, so without a hole punched for it
      // here it would render visually dimmed despite intending to read as
      // "always on top, always clickable".
      const btnEl = document.querySelector('.help-btn');
      if (btnEl) {
        const r = btnEl.getBoundingClientRect();
        setToggleRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelled = true; cancelAnimationFrame(raf); };
  }, [active, allItems]);

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
  // else untagged. Escape closes one thing at a time: a tip first if one's
  // open (so you can back out of what you clicked into without leaving help
  // mode altogether), then help mode itself on a second press.
  React.useEffect(() => {
    if (!active) return;
    const isOnTarget = (e) => {
      if (e.target.closest('.help-badge, .help-tip, .help-btn, .tabbar')) return true;
      return allItems.some((it) => findTargets(it.sel).some((el) => el.contains(e.target)));
    };
    const onClickCapture = (e) => {
      if (isOnTarget(e)) return;
      e.preventDefault(); e.stopPropagation();
      setOpenId(null);
    };
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (openId != null) { setOpenId(null); return; }
      onExit();
    };
    document.addEventListener('click', onClickCapture, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('click', onClickCapture, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [active, allItems, onExit, openId]);

  if (!active) return null;

  const vw = window.innerWidth, vh = window.innerHeight;
  const entries = Object.entries(rectsById);
  const openItem = openId ? allItems.find((it) => it.id === openId) : null;
  const openRect = openId ? rectsById[openId] : null;

  return createPortal(
    <div className="help-mode" aria-live="polite">
      <svg className="help-dim-svg" width={vw} height={vh}>
        <mask id="help-mask">
          <rect x="0" y="0" width={vw} height={vh} fill="#fff" />
          {entries.map(([id, r]) => {
            const { rx, ry } = r.shape || { rx: DEFAULT_R, ry: DEFAULT_R };
            return (
              <rect key={id} x={r.left - PAD} y={r.top - PAD} rx={rx} ry={ry}
                    width={r.width + PAD * 2} height={r.height + PAD * 2} fill="#000" />
            );
          })}
          {toggleRect && (
            <rect x={toggleRect.left - PAD} y={toggleRect.top - PAD}
                  rx={(toggleRect.height + PAD * 2) / 2} ry={(toggleRect.height + PAD * 2) / 2}
                  width={toggleRect.width + PAD * 2} height={toggleRect.height + PAD * 2} fill="#000" />
          )}
        </mask>
        <rect className="help-dim-fill" x="0" y="0" width={vw} height={vh} mask="url(#help-mask)" />
      </svg>
      {entries.map(([id, r]) => {
        const { rx, ry } = r.shape || { rx: DEFAULT_R, ry: DEFAULT_R };
        return (
          <div key={id} className="help-spot"
               style={{
                 top: r.top - PAD, left: r.left - PAD,
                 width: r.width + PAD * 2, height: r.height + PAD * 2,
                 borderRadius: `${rx}px / ${ry}px`,
               }} />
        );
      })}
      {allItems.map((it) => {
        const r = rectsById[it.id];
        if (!r) return null;
        const br = badgeRectFor(r);
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
        <HelpTip item={openItem} targetRect={openRect} />
      )}
    </div>,
    document.body
  );
}

export { HelpButton, HelpOverlay };
