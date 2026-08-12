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
// Clips a rect against the app's own always-on-top navigation chrome (the
// Today page's sticky header, its stacked group-filter rail, and the tabbar
// in whatever placement it's currently rendered — bottom/top/side) so a
// target scrolled underneath one of them doesn't draw its highlight ON TOP
// of it. The dim layer has to sit above ordinary page content (up to the
// highest z-index any sticky panel or FAB uses) to dim it correctly, which
// also puts it above this chrome's own, much lower z-index — the chrome's
// own opacity doesn't hide a highlight painted above it in stacking order.
// The header/rail are hardcoded as top-anchored (a structural fact about
// this app's layout, not something worth detecting at runtime — getComputedStyle
// can't tell us anyway: a position:fixed element's `top` resolves to a real
// computed pixel value even when only `bottom` was ever set in CSS, at
// least in Chromium, so checking for the literal 'auto' string is
// unreliable). Only the tabbar's placement genuinely varies, and since it's
// position:fixed (not sticky), geometric edge-detection is safe for that
// one specifically, unlike for a sticky element stacked at a non-zero
// offset (the group rail sticks below the header, not flush to 0). Picks
// the viewport edge the rect is CLOSEST to rather than requiring it to
// literally touch (rect.bottom >= innerHeight etc) — this tabbar renders as
// a floating inset pill (rounded, margin on every side, safe-area padding
// baked in), never flush against any edge at all.
const detectEdgeSide = (rect) => {
  const gaps = { top: rect.top, bottom: window.innerHeight - rect.bottom, left: rect.left, right: window.innerWidth - rect.right };
  return Object.entries(gaps).reduce((a, b) => (b[1] < a[1] ? b : a))[0];
};
const clipToChrome = (rect, chromeItems) => {
  let { top, left, right, bottom } = rect;
  for (const { rect: c, side } of chromeItems) {
    const hOverlap = left < c.right && right > c.left;
    const vOverlap = top < c.bottom && bottom > c.top;
    // Require an ACTUAL rect intersection (both axes) before clipping —
    // hOverlap alone isn't enough for a top/bottom-anchored chrome, since
    // almost every target shares SOME horizontal range with a near-full-
    // width bar regardless of how far away it is vertically. Without this,
    // any target entirely below a bottom-pinned tabbar (no vertical overlap
    // at all) still got its bottom clamped down to the tabbar's own top,
    // producing a negative-height rect that then reads as "fully occluded"
    // and silently disappears — exactly what happened to a Pickers-page
    // form field sitting well below the tabbar with nothing behind it.
    if (!hOverlap || !vOverlap) continue;
    // Prefer the "natural" clamp direction for this chrome side (e.g. for
    // a bottom-anchored tabbar, keep whatever's ABOVE it — that's what's
    // already in view without scrolling further) — NOT whichever side
    // happens to have more raw span. A previous version of this function
    // picked the larger side unconditionally, which for a target that
    // genuinely extends past the chrome on BOTH sides with real content on
    // each (e.g. a long card comfortably spanning from well above the
    // tabbar to well below it) discarded the near, already-visible portion
    // just because the far portion measured bigger — the highlight then
    // didn't appear until the user scrolled far enough for the near
    // portion to vanish entirely, taking its badge out of reach with it.
    // Only fall back to the opposite side when the natural direction's own
    // candidate would be degenerate (<=0 height/width) — i.e. there's
    // nothing real on the near side at all, same as the earlier
    // heatmap-badge-never-appears bug this whole rule was built to fix.
    if (side === 'top') {
      const candidate = Math.max(top, c.bottom);
      if (bottom - candidate > 0) top = candidate; else bottom = Math.min(bottom, c.top);
    } else if (side === 'bottom') {
      const candidate = Math.min(bottom, c.top);
      if (candidate - top > 0) bottom = candidate; else top = Math.max(top, c.bottom);
    } else if (side === 'left') {
      const candidate = Math.max(left, c.right);
      if (right - candidate > 0) left = candidate; else right = Math.min(right, c.left);
    } else if (side === 'right') {
      const candidate = Math.min(right, c.left);
      if (candidate - left > 0) right = candidate; else left = Math.max(left, c.right);
    }
  }
  if (right - left <= 0 || bottom - top <= 0) return null;
  return { top, left, right, bottom };
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
  // A "pill" source radius (e.g. 999px on a chip/badge — comfortably past
  // any real rounded-corner value like --r-lg's 16px) renders as visibly
  // faceted rather than a smooth stadium once fed through the SVG mask's
  // own rx/ry clamping at such extreme values — confirmed by an isolated
  // test: the identical box rendered as a clean pill via plain CSS
  // border-radius, so the SVG corner-arc math is where this breaks down,
  // not the padding math above it. Rather than chase the true pill shape,
  // cap it to a plain rounded rectangle — reads cleanly at any size and
  // sidesteps the SVG precision issue entirely.
  if (px >= 24) return { rx: DEFAULT_R, ry: DEFAULT_R };
  return { rx: px + PAD, ry: px + PAD };
};

// Badge geometry, shared between where it's actually drawn and where a tip
// anchored to it should point — a 20px circle overlapping the highlighted
// box's own top-right corner (matching the "small corner marker" design,
// distinct from InfoTip's own inline-trigger placement). Falls back to the
// top-LEFT corner instead when the target's own right edge sits past the
// viewport — e.g. a horizontally-scrollable row (Today's group nav) whose
// own rect is its full unclipped content width, not just what's currently
// visible; a right-corner badge there would only be reachable by scrolling
// the row all the way to its end. The target's LEFT edge is always what's
// initially in view (these rows start scrolled to 0), so that corner is
// always reachable.
const BADGE_SIZE = 20;
// `center`, true for columnGroup items (see help-mode's own columnGroup
// post-processing), centers the badge over the column's own top edge
// instead of using the usual right-corner placement below. A columnGroup
// member's own `right` is a shared, TOUCHING boundary with its neighbor
// (that's the whole point of columnGroup — no gap between columns), not a
// free edge with neutral space past it — the normal "right + PAD" math
// would land the badge on top of the next column over instead, and the
// last column in a group has no neighbor past it to land on at all.
const badgeRectFor = (targetRect, center) => {
  // Must match the render code's own effective padding exactly (see the
  // .help-spot/.mask <rect> computations below) — otherwise the badge marks
  // a corner that isn't actually the highlight box's corner anymore, which
  // is exactly what happened when padX/padY overrides were added: this
  // function kept using the flat PAD constant regardless.
  const padX = targetRect.noPadX ? 0 : (targetRect.padX ?? PAD);
  const padY = targetRect.padY ?? PAD;
  const top = targetRect.top - padY - BADGE_SIZE / 2;
  if (center) {
    const left = targetRect.left + targetRect.width / 2 - BADGE_SIZE / 2;
    return { top, left, width: BADGE_SIZE, height: BADGE_SIZE, bottom: top + BADGE_SIZE };
  }
  // Checks where a right-corner badge's own edge would actually land, not
  // just the target's raw right edge — a target rect already clipped flush
  // to the viewport (see clipHorizontalOverflow) can sit exactly AT the
  // viewport width, which still overflows once the badge's own pad gap and
  // half-width are added on top of it.
  const rightLeft = targetRect.right + padX - BADGE_SIZE / 2;
  const overflowsRight = rightLeft + BADGE_SIZE > window.innerWidth;
  const left = overflowsRight ? targetRect.left - padX - BADGE_SIZE / 2 : rightLeft;
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
//
// `pinBelowY`, when set (see pinBelowSel in the rAF loop), skips the
// "prefer below, flip above" choice entirely and always places the tip
// below that fixed Y — e.g. the Repeat Schedule tip always sits below the
// WHOLE add-reminder form, not just below whichever repeat option's own
// extra fields happen to be showing, so it never lands overlapping them
// regardless of which option is selected or how tall its fields are.
const placeTip = (targetRect, tw, th, pinBelowY) => {
  const vw = window.innerWidth, vh = window.innerHeight, M = 8;
  let top, arrowClass;
  if (pinBelowY != null) {
    top = pinBelowY + 16; arrowClass = 'ob-coach--up';
  } else {
    const spaceBelow = vh - targetRect.bottom;
    if (spaceBelow >= th + 16) { top = targetRect.bottom + 16; arrowClass = 'ob-coach--up'; }
    else { top = Math.max(M, targetRect.top - 16 - th); arrowClass = 'ob-coach--down'; }
  }
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
  // `matchTargetWidth` (e.g. the nav tip, once it grew to 5 paragraphs) sizes
  // the tip to targetRect.tipWidth (see matchWidthSel in the rAF loop above,
  // if the item set one) or the highlighted rect's own width otherwise,
  // instead of the usual fixed 280px — applied as an inline style (wins
  // over .help-tip's width regardless of render order) so it's already in
  // effect the moment offsetWidth below measures it, not just once CSS
  // catches up on a later paint.
  const widthStyle = item.matchTargetWidth ? { width: targetRect.tipWidth ?? targetRect.width } : null;
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { top, left, arrowClass: ac, arrowX } = placeTip(targetRect, el.offsetWidth, el.offsetHeight, targetRect.pinBelowY);
    setStyle({ top, left, '--ob-ax': arrowX + 'px' });
    setArrowClass(ac);
  }, [targetRect, item.matchTargetWidth]);
  return (
    <div ref={ref} className={`ob-coach help-tip ${arrowClass}`}
         style={{ ...(style || { top: -9999, left: -9999 }), ...widthStyle }} role="tooltip">
      {/* `body` as a function (e.g. the Charge Controls items) is called
          fresh on every render instead of being static JSX — lets a tip
          read something off the live DOM at open time, like the picker's
          own cadence unit word (days/weeks/months/years), rather than
          baking in a value that could be wrong for a different picker's
          own cadence setting. */}
      <p className="help-tip-title">{item.title}</p>
      <div className="ob-body">{typeof item.body === 'function' ? item.body() : item.body}</div>
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
  // padY:7 makes the highlight's own bounding box flush with the tabbar's
  // outer edge (its vertical padding is 7px at every breakpoint). That
  // alone wasn't enough, though: the tabbar is a fully-rounded pill
  // (border-radius: 999px), and a plain DEFAULT_R(12)-radius rectangle
  // flush with that bounding box still has square-ish corners that poke
  // past the pill's much-more-aggressively-curved ends, near the far
  // left/right where the [data-tab] buttons' own union sits close to the
  // tabbar's edge — this is what actually read as "bleeding" at the top/
  // bottom (most visible right at the corners, not the flat middle of an
  // edge). shape:{rx,ry} (see its own comment above) makes this box a
  // true pill matching the tabbar's own shape instead.
  id: '__nav', sel: '[data-tab]', matchTargetWidth: true, matchWidthSel: '.tabbar', padY: 7,
  shape: { rx: 999, ry: 999 },
  title: 'Navigation',
  body: (
    <>
      <p><b>Today:</b> This is the main page of the app and contains your auto-generated daily todo list.</p>
      <p><b>Pickers:</b> This is where you can manually run a picker to generate a task and then push it to the Today page's todo list. This is also where you can create new pickers and their items.</p>
      <p><b>Stats:</b> This is where you can view all of the statistics for everything that you have created. That includes conditionals, reminder items, pickers and picker items. You can see how many times an item has been picked, items' pick frequency, and much more.</p>
      <p><b>Data:</b> This is where you can view and edit everything that you have created. You can also create new conditionals, new reminders items and new picker items.</p>
      <p><b>Settings:</b> This is where you can customize the app, adjust the daily generator, edit which holidays are observed, control your data, install the app, get app information and view legal documents.</p>
    </>
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
  // element target, its own shape — see shapeFor's own comment). Shared by
  // the rAF tracking loop below (every frame while active, to stay correct
  // under scrolling/reflow) AND the click-guard (right after a click that
  // lands on a real target, e.g. Save/Cancel/Delete closing an editor) —
  // without the latter, a click that removes/changes a highlighted
  // element's DOM only self-corrects on the NEXT rAF tick, which can read
  // as a highlight "stuck" until something else (like a scroll) forces a
  // frame.
  const recomputeRects = React.useCallback(() => {
    const next = {};
    // Gathered once per frame (not per-item) — see clipToChrome's own
    // comment for why highlights need clipping against this chrome at all.
    // '.today-h' and '.group-rail' only exist on the Today page; '.tabbar'
    // exists everywhere. 'auto' defers to detectEdgeSide since the tabbar's
    // placement varies at runtime; the other two are always top-anchored.
    const chromeMatches = [['.today-h', 'top'], ['.group-rail', 'top'], ['.tabbar', 'auto']]
      .map(([sel, side]) => { const el = document.querySelector(sel); return el ? { el, side } : null; })
      .filter(Boolean);
    const chromeEls = chromeMatches.map((c) => c.el);
    const chromeItems = chromeMatches
      .map(({ el, side }) => { const rect = el.getBoundingClientRect(); return { rect, side: side === 'auto' ? detectEdgeSide(rect) : side }; })
      .filter((c) => c.side);
    allItems.forEach((it) => {
      let els = findTargets(it.sel);
      if (!els.length) return;
      // The nav item's own targets (and anything else whose selector
      // happens to live inside the header, like the streak/progress ring)
      // ARE this chrome — clipping those against their own container would
      // erase them, not just keep them from floating on top of something
      // else.
      const isChromeContent = els.some((el) => chromeEls.some((c) => c === el || c.contains(el)));
      // `perElement` gives EVERY matched element its own badge/highlight
      // (synthesized sub-ids `${it.id}::${i}`, all sharing the parent
      // item's title/body) instead of unioning them into one — needed
      // wherever a user could reasonably be looking at ANY one of several
      // repeated instances (every group's own Log button, every card's
      // own Mark Complete/Card Actions) rather than just "the first one
      // on the page", which they might not have scrolled to, or which
      // could even have its own buttons disabled for that specific card
      // (e.g. a day-off/charging card's Card Actions) even though other
      // cards' don't.
      if (it.perElement) {
        els.forEach((el, i) => {
          let r = clipHorizontalOverflow(el.getBoundingClientRect(), el);
          if (!r) return;
          if (!isChromeContent) {
            r = clipToChrome(r, chromeItems);
            if (!r) return;
          }
          const width = r.right - r.left, height = r.bottom - r.top;
          if (!Number.isFinite(width) || !Number.isFinite(height)) return;
          const shape = shapeFor(el, width + PAD * 2, height + PAD * 2, it.shape);
          next[`${it.id}::${i}`] = { ...r, width, height, shape, padY: it.padY ?? PAD, padX: it.padX ?? PAD };
        });
        return;
      }
      // `firstOnly` takes just the first DOCUMENT-order match instead of
      // unioning every match — needed when a selector's matches are
      // scattered across several different parents (e.g. one entry card
      // per today-list group section), where CSS's own :first-of-type
      // can't express "first anywhere on the page" (it resets per
      // parent, matching one per section instead of one overall — see
      // cardCheck's own narrower .rem-section-scoped selector for a case
      // where that per-parent reset is actually safe, since there's only
      // one such parent on the page).
      if (it.firstOnly) els = els.slice(0, 1);
      let r = unionRect(els);
      // Every matched element can still end up fully clipped away by
      // unionRect's own horizontal-scroll clipping (e.g. a target scrolled
      // out of a row with nothing else in the selector to fall back on) —
      // same "not currently reachable, so no badge this frame" outcome as
      // finding zero elements in the first place, rather than feeding an
      // Infinity-valued rect to the SVG below.
      if (!Number.isFinite(r.width) || !Number.isFinite(r.height)) return;
      if (!isChromeContent) {
        const clipped = clipToChrome(r, chromeItems);
        if (!clipped) return;
        r = { ...clipped, width: clipped.right - clipped.left, height: clipped.bottom - clipped.top };
      }
      // A literal `{ rx, ry }` shape override (as opposed to the 'circle'
      // string form) skips shapeFor/CSS-inspection entirely — needed for a
      // multi-element union like the nav bar, which has no single source
      // element's border-radius to read. An oversized value here (rather
      // than trying to guess the tabbar's actual pixel radius, which varies
      // by breakpoint) relies on both the SVG <rect> and the CSS
      // border-radius below auto-clamping to exactly half the box's own
      // height per spec — a true pill at any size, no magic number needed.
      const shape = (it.shape && typeof it.shape === 'object')
        ? it.shape
        : (els.length === 1 ? shapeFor(els[0], r.width + PAD * 2, r.height + PAD * 2, it.shape) : null);
      // `matchWidthSel` sizes the open tip to a DIFFERENT element's width
      // than whatever's highlighted — e.g. the nav tip highlights the
      // individual [data-tab] buttons (tested and correct as a spotlight),
      // but "as wide as the navbar itself" means the .tabbar container's
      // own width, padding included, not just the buttons' own union.
      const tipWidth = it.matchWidthSel ? document.querySelector(it.matchWidthSel)?.getBoundingClientRect().width : undefined;
      // `pinBelowSel` — see placeTip's own doc comment for why this exists.
      const pinBelowY = it.pinBelowSel ? document.querySelector(it.pinBelowSel)?.getBoundingClientRect().bottom : undefined;
      next[it.id] = { ...r, shape, tipWidth, pinBelowY, padY: it.padY ?? PAD, padX: it.padX ?? PAD };
    });
    // `columnGroup` (e.g. the Day Log panel's per-column highlights) —
    // each column's own union naturally shrinks to just its content's
    // width (a "+3" delta or a short label), leaving dead gaps between
    // neighboring columns and brushing right up against the column's own
    // text with no breathing room. Snaps each group's members edge-to-
    // edge instead: interior boundaries meet at the exact midpoint
    // between neighbors (touching, no gap, no overlap — the fix for a
    // narrow column like Δ getting crowded out or "bleeding" into the
    // next column), and the group's own outer left/right edges get a
    // normal PAD of breathing room, same as any other highlight.
    const groups = {};
    allItems.forEach((it) => {
      if (!it.columnGroup || !next[it.id]) return;
      (groups[it.columnGroup] || (groups[it.columnGroup] = [])).push(it.id);
    });
    Object.values(groups).forEach((ids) => {
      // Vertical: a column whose cells span two lines (e.g. an item's
      // name + its weight/range sub-line) is naturally taller than a
      // single-line column in the SAME rows — .dl-trow's own
      // align-items:center centers each cell within its row rather than
      // stretching it to match, so the shorter columns' own top/bottom
      // sit inset from the row's true edges. Give every member of the
      // group the tallest member's own span so the whole group reads as
      // one continuous table height instead of some columns overhanging
      // their shorter siblings on both ends.
      const top = Math.min(...ids.map((id) => next[id].top));
      const bottom = Math.max(...ids.map((id) => next[id].bottom));
      ids.forEach((id) => { next[id].top = top; next[id].bottom = bottom; next[id].height = bottom - top; });
      ids.sort((a, b) => next[a].left - next[b].left);
      ids.forEach((id, i) => {
        const cur = next[id];
        cur.noPadX = true;
        if (i === 0) cur.left -= PAD;
        if (i === ids.length - 1) {
          cur.right += PAD;
        } else {
          const nxt = next[ids[i + 1]];
          const mid = (cur.right + nxt.left) / 2;
          cur.right = mid;
          nxt.left = mid;
        }
        cur.width = cur.right - cur.left;
      });
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
  }, [allItems]);

  // A thrown error from a single bad measurement (e.g. a target mid-reflow)
  // must not kill the rAF loop permanently — without this, an exception
  // inside recomputeRects skips the requestAnimationFrame call after it and
  // the whole per-frame tracking silently stops until something unrelated
  // remounts this effect, which reads as a highlight "stuck" until
  // something else forces a re-render. Shared by both callers (the rAF loop
  // and the click-guard's deferred call below) so neither can go dark.
  const safeRecompute = React.useCallback(() => {
    try { recomputeRects(); } catch (err) { console.error('[help-mode] recompute failed', err); }
  }, [recomputeRects]);

  React.useEffect(() => {
    if (!active) { setRectsById({}); setOpenId(null); setToggleRect(null); return; }
    let raf, cancelled = false;
    const loop = () => {
      if (cancelled) return;
      safeRecompute();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelled = true; cancelAnimationFrame(raf); };
  }, [active, allItems, safeRecompute]);

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
      if (isOnTarget(e)) {
        // Fires in the capture phase, before the click's own handler (e.g.
        // a Save/Cancel/Delete button closing an editor) has run — defer to
        // a macrotask so the resulting DOM/React commit has already landed
        // by the time we re-measure, instead of waiting for the next
        // natural rAF tick.
        setTimeout(safeRecompute, 0);
        return;
      }
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
  }, [active, allItems, onExit, openId, safeRecompute]);

  if (!active) return null;

  const vw = window.innerWidth, vh = window.innerHeight;
  const entries = Object.entries(rectsById);
  // openId can be a perElement sub-id (`${it.id}::${i}`) — strip the
  // suffix to find the catalog item whose title/body every instance
  // shares, while the rect lookup itself still uses the FULL id.
  const openBaseId = openId ? openId.split('::')[0] : null;
  const openItem = openBaseId ? allItems.find((it) => it.id === openBaseId) : null;
  const openRect = openId ? rectsById[openId] : null;

  return createPortal(
    <div className="help-mode" aria-live="polite">
      <svg className="help-dim-svg" width={vw} height={vh}>
        <mask id="help-mask">
          <rect x="0" y="0" width={vw} height={vh} fill="#fff" />
          {entries.map(([id, r]) => {
            const { rx, ry } = r.shape || { rx: DEFAULT_R, ry: DEFAULT_R };
            // noPadX (columnGroup items) — r.left/right/width already have
            // their final, edge-to-edge-adjusted values baked in (see the
            // columnGroup post-processing above), so padding them again
            // here would reopen the exact gap/overlap that adjustment
            // exists to close. padY/padX (see it.padY/it.padX) are numeric
            // overrides for items whose target sits close enough to a
            // neighbor that the default PAD on both would visibly overlap —
            // e.g. EntryEditor's own stacked .pie-row elements (padY: 0,
            // separated only by a hairline border) or two footer buttons
            // sitting closer together than 2*PAD (padX below).
            const padX = r.noPadX ? 0 : (r.padX ?? PAD);
            const padY = r.padY ?? PAD;
            return (
              <rect key={id} x={r.left - padX} y={r.top - padY} rx={rx} ry={ry}
                    width={r.width + padX * 2} height={r.height + padY * 2} fill="#000" />
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
        const padX = r.noPadX ? 0 : (r.padX ?? PAD);
        const padY = r.padY ?? PAD;
        return (
          <div key={id} className="help-spot"
               style={{
                 top: r.top - padY, left: r.left - padX,
                 width: r.width + padX * 2, height: r.height + padY * 2,
                 borderRadius: `${rx}px / ${ry}px`,
               }} />
        );
      })}
      {allItems.flatMap((it) => {
        // perElement items have no single rectsById[it.id] — one badge per
        // synthesized `${it.id}::${i}` sub-id instead (see the rAF loop
        // above), all opening the same shared title/body.
        const ids = it.perElement
          ? Object.keys(rectsById).filter((k) => k.startsWith(`${it.id}::`))
          : (rectsById[it.id] ? [it.id] : []);
        return ids.map((id) => {
          const r = rectsById[id];
          const br = badgeRectFor(r, !!it.columnGroup);
          return (
            <button key={id} type="button"
                    className={`help-badge ${openId === id ? 'is-on' : ''}`}
                    style={{ top: br.top, left: br.left }}
                    onClick={(e) => { e.stopPropagation(); setOpenId((cur) => cur === id ? null : id); }}
                    aria-label={typeof it.title === 'string' ? it.title : 'More info'}>
              i
            </button>
          );
        });
      })}
      {openItem && openRect && (
        <HelpTip item={openItem} targetRect={openRect} />
      )}
    </div>,
    document.body
  );
}

export { HelpButton, HelpOverlay };
