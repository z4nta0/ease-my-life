import React from 'react';

// Subtle decorative math/randomness glyphs sprinkled in the empty side
// margins around the main content column — never behind actual content,
// purely in the gutters .main-inner (or Today's own .today-body, which
// shares the same centered-column shape) leaves open at wider viewports
// (see .bg-flourish's own CSS for how it's hidden below that width). Chosen
// once per real page load: the data lives in App's own state (src/app.jsx),
// which mounts once and outlives tab switches, so the same glyphs/positions
// stay put for the whole session instead of reshuffling every time the
// active tab changes.

const FLOURISH_SYMBOLS = ['✓', '⁓', '←', '→', '△', '∑', '√', '∛', '∳', '≤', '≥', '±', '∞', '≈', '∅'];

const PER_SIDE = 7;
// 2 columns × 4 rows = 8 cells per side, one glyph per cell (7 used, 1 spare
// dropped at random) — this is what keeps any two glyphs on the same side
// at least a grid cell apart in both x and y, instead of independent random
// coordinates that could cluster or land right on top of each other.
const GRID_COLS = 2;
const GRID_ROWS = 4;

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// n evenly-spaced values across [min, max], then shuffled — guarantees every
// item gets a genuinely distinct value (not just independent random draws
// that happen to rarely collide), while still spreading them across the
// full range rather than bunching near the middle.
function uniqueSpread(min, max, n) {
  if (n <= 1) return [min];
  const step = (max - min) / (n - 1);
  return shuffle(Array.from({ length: n }, (_, i) => min + step * i));
}

function gridCells(cols, rows) {
  const cells = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push({ c, r });
  return shuffle(cells);
}

// One shuffled grid position, rotation, and size per item, all drawn from
// a single generation so nothing repeats across the whole set (symbols,
// rotations, and sizes are each a shuffled list of already-distinct values,
// not independent random picks per item).
function generateFlourishes() {
  const total = PER_SIDE * 2;
  const symbols = shuffle(FLOURISH_SYMBOLS).slice(0, total);
  const rotations = uniqueSpread(-24, 24, total);
  const sizes = uniqueSpread(46, 92, total);

  const items = [];
  let idx = 0;
  for (const side of ['left', 'right']) {
    const cells = gridCells(GRID_COLS, GRID_ROWS).slice(0, PER_SIDE);
    for (const cell of cells) {
      const colW = 100 / GRID_COLS;
      const rowH = 100 / GRID_ROWS;
      // Jitter within the cell's own band, staying off the cell's outer
      // edges so a large glyph (up to 92px) doesn't crowd its neighbor.
      const insetJitter = colW * 0.2 + Math.random() * (colW * 0.6);
      const topJitter = rowH * 0.15 + Math.random() * (rowH * 0.7);
      items.push({
        id: `${side}-${idx}`,
        side,
        symbol: symbols[idx],
        top: cell.r * rowH + topJitter,
        inset: cell.c * colW + insetJitter,
        size: sizes[idx],
        opacity: 0.08 + Math.random() * 0.1,
        rotate: rotations[idx],
      });
      idx++;
    }
  }
  return items;
}

function FlourishColumn({ side, items }) {
  return (
    <div className={`bg-flourish bg-flourish--${side}`} aria-hidden="true">
      {items.map((it) => (
        <span key={it.id} className="bg-flourish-item"
              style={{
                top: `${it.top}%`,
                [side === 'left' ? 'right' : 'left']: `${it.inset}%`,
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

function BgFlourish({ items }) {
  if (!items || !items.length) return null;
  const left = items.filter((it) => it.side === 'left');
  const right = items.filter((it) => it.side === 'right');
  return (
    <React.Fragment>
      <FlourishColumn side="left" items={left} />
      <FlourishColumn side="right" items={right} />
    </React.Fragment>
  );
}

export { BgFlourish, generateFlourishes };
