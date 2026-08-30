import React from 'react';

// Subtle decorative math/randomness glyphs sprinkled in the empty side
// margins around the main content column — never behind actual content,
// purely in the gutters .main-inner (or Today's own .today-body, which
// shares the same centered-column shape) leaves open once there's enough
// room for at least a couple of grid columns (see MIN_FULL_COLS below).
//
// Placement is a real pixel grid, not percentages: fixed-size columns
// across the gutter's actual measured width, fixed-size rows down the
// container's actual measured content height (via scrollHeight — this is
// why it needs a DOM measurement instead of the pure-CSS trick the
// previous version used). Once a glyph claims a cell, every neighboring
// cell (including diagonals) is excluded for every other glyph — this is
// what guarantees real spacing in both x and y at once, instead of the
// independent-per-axis bands the previous version used, which still let
// two glyphs land close to each other whenever they happened to share an
// axis. A minority of glyphs claim a 2x2 block (bigger, spans two rows and
// two columns) instead of a single cell; at most one per row.
//
// Generated once per real page load, cached **per tab** the first time
// that tab is actually visited (not all five upfront) — each tab has its
// own gutter width and content height, so a single shared layout can't fit
// all of them accurately. The cache lives in this module's own closure, so
// it resets on an actual page reload but survives switching tabs back and
// forth within the same session.

const FLOURISH_SYMBOLS = ['✓', '⁓', '←', '→', '△', '∑', '√', '∛', '∳', '≤', '≥', '±', '∞', '≈', '∅'];

// Originally calibrated against a 1920px-wide viewport on a tab using the
// wider of the app's two content max-widths (Today's own .today-body,
// 960px — the tighter case, leaving less gutter than the other tabs' 720px
// at the same viewport width): (1920 - 40 padding - 960) / 2 = 460px of
// gutter, for 6 full columns + 1 half column. Sized down twice since
// (71->60->50, 60->48->40) for more density each time — how many
// columns/rows actually fit at any width/tab still just falls out of the
// real measured gutter width and content height divided by these, no
// separate lookup table needed.
const COLUMN_WIDTH = 50;
const ROW_HEIGHT = 40;
// Below this many full columns there's not enough room to bother — no
// point placing glyphs into a sliver of margin.
const MIN_FULL_COLS = 2;
// Chance, per available row, of attempting a 2x2 "big" glyph there instead
// of (or in addition to, in other cells) a normal one.
const BIG_CHANCE = 0.12;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function range(n) { return Array.from({ length: n }, (_, i) => i); }

// A cycler hands out values from a shuffled pool, reshuffling a fresh pool
// once exhausted — keeps values well-distributed over any window without
// needing to know the total count up front (unlike the previous version,
// placement here isn't capped at a fixed total, so there's no "generate N
// unique values" step possible; this is the closest equivalent).
function makeCycler(poolFactory) {
  let pool = [];
  let i = 0;
  return () => {
    if (i >= pool.length) { pool = poolFactory(); i = 0; }
    return pool[i++];
  };
}

function evenlySpaced(min, max, n) {
  if (n <= 1) return [min];
  const step = (max - min) / (n - 1);
  return range(n).map((i) => min + step * i);
}

function blockAround(blocked, r, c, h, w) {
  const rows = blocked.length, cols = blocked[0].length;
  for (let rr = r - 1; rr <= r + h; rr++) {
    for (let cc = c - 1; cc <= c + w; cc++) {
      if (rr >= 0 && rr < rows && cc >= 0 && cc < cols) blocked[rr][cc] = true;
    }
  }
}

// Greedy grid placement for one gutter: walk rows in random order, and
// within each row walk columns in random order, placing a glyph (maybe a
// 2x2 one, at most once per row) into any cell not already excluded by an
// earlier placement, then excluding its own neighborhood so nothing else
// can land adjacent to it. Density falls out of however many rows/columns
// actually fit — there's no separate "N per row" cap.
function placeGrid(cols, rows) {
  const blocked = range(rows).map(() => new Array(cols).fill(false));
  const placements = [];
  for (const r of shuffle(range(rows))) {
    let bigPlacedThisRow = false;
    for (const c of shuffle(range(cols))) {
      if (blocked[r][c]) continue;
      const canBig = !bigPlacedThisRow && r + 1 < rows && c + 1 < cols
        && !blocked[r][c + 1] && !blocked[r + 1][c] && !blocked[r + 1][c + 1];
      const big = canBig && Math.random() < BIG_CHANCE;
      placements.push({ row: r, col: c, big });
      blockAround(blocked, r, c, big ? 2 : 1, big ? 2 : 1);
      if (big) bigPlacedThisRow = true;
    }
  }
  return placements;
}

// Column index 0 = innermost (against the content edge); the last column
// is the ~half-width one meant to visually bleed off the edge of the
// viewport. Its band width is whatever's actually left over after fitting
// as many full columns as possible — NOT a fixed half-COLUMN_WIDTH, which
// (since gutterWidth rarely divides evenly by COLUMN_WIDTH) would usually
// end up short of the true gutter edge and leave a strip of dead space
// beyond it, defeating the bleed entirely. Anchoring flush against the
// real edge instead means a glyph's own rendered width (up to 92px, much
// wider than that leftover band) does the bleeding on its own; body's own
// overflow-x: hidden clips whatever crosses the actual viewport edge.
function generateSide(gutterWidth, contentHeight) {
  const fullCols = Math.max(0, Math.floor(gutterWidth / COLUMN_WIDTH - 0.3));
  if (fullCols < MIN_FULL_COLS) return [];
  const cols = fullCols + 1;
  const outerBandWidth = gutterWidth - fullCols * COLUMN_WIDTH;
  const rows = Math.max(1, Math.floor(contentHeight / ROW_HEIGHT));

  const nextSymbol = makeCycler(() => shuffle(FLOURISH_SYMBOLS));
  const nextRotation = makeCycler(() => shuffle(evenlySpaced(-28, 28, 11)));
  const nextSize = makeCycler(() => shuffle(evenlySpaced(24, 48, 9)));
  const nextBigSize = makeCycler(() => shuffle(evenlySpaced(64, 76, 5)));

  return placeGrid(cols, rows).map(({ row, col, big }, i) => {
    const isOuter = col === cols - 1;
    const bandWidth = isOuter ? outerBandWidth : COLUMN_WIDTH;
    const colJitter = bandWidth * 0.1 + Math.random() * (bandWidth * 0.85);
    const inset = col * COLUMN_WIDTH + colJitter;
    const rowJitter = ROW_HEIGHT * 0.15 + Math.random() * (ROW_HEIGHT * 0.7);
    return {
      id: `${row}-${col}-${i}`,
      big,
      top: row * ROW_HEIGHT + rowJitter,
      inset,
      symbol: nextSymbol(),
      size: big ? nextBigSize() : nextSize(),
      opacity: 0.08 + Math.random() * 0.1,
      rotate: nextRotation(),
    };
  });
}

const flourishCache = new Map();

function useFlourishItems(tabId, measureRef) {
  const [items, setItems] = React.useState(() => flourishCache.get(tabId) || null);

  // Not useLayoutEffect: measureRef points at this component's own PARENT
  // (.main-inner / .today-body), and React attaches refs and fires layout
  // effects bottom-up within the same commit — a child's useLayoutEffect
  // runs before its ancestor's own ref has been attached, so
  // measureRef.current would still be null here. Plain useEffect fires
  // after that commit settles, at the cost of a one-frame-later pop-in
  // that's a non-issue for a decorative background layer.
  React.useEffect(() => {
    if (flourishCache.has(tabId)) { setItems(flourishCache.get(tabId)); return; }
    const el = measureRef.current;
    const main = el && el.closest('.main');
    if (!el || !main) return;
    const mainStyle = getComputedStyle(main);
    const padX = (parseFloat(mainStyle.paddingLeft) || 0) + (parseFloat(mainStyle.paddingRight) || 0);
    const gutterWidth = Math.max(0, (main.getBoundingClientRect().width - padX - el.getBoundingClientRect().width) / 2);
    const contentHeight = el.scrollHeight;
    const generated = {
      left: generateSide(gutterWidth, contentHeight),
      right: generateSide(gutterWidth, contentHeight),
    };
    flourishCache.set(tabId, generated);
    setItems(generated);
  }, [tabId, measureRef]);

  return items;
}

function FlourishColumn({ side, items }) {
  if (!items.length) return null;
  return (
    <div className={`bg-flourish bg-flourish--${side}`} aria-hidden="true">
      {items.map((it) => (
        <span key={it.id} className={`bg-flourish-item ${it.big ? 'is-big' : ''}`}
              style={{
                top: `${it.top}px`,
                [side === 'left' ? 'right' : 'left']: `${it.inset}px`,
                fontSize: `${it.size}px`,
                opacity: it.opacity,
                transform: `rotate(${it.rotate}deg)`,
              }}>
          {it.symbol}
        </span>
      ))}
    </div>
  );
}

// tabId picks the per-session cache slot; measureRef must point at the
// tab's own centered-column container (.main-inner or .today-body) — the
// element whose real width/height the grid is measured against.
function BgFlourish({ tabId, measureRef }) {
  const items = useFlourishItems(tabId, measureRef);
  if (!items) return null;
  return (
    <React.Fragment>
      <FlourishColumn side="left" items={items.left} />
      <FlourishColumn side="right" items={items.right} />
    </React.Fragment>
  );
}

export { BgFlourish };
