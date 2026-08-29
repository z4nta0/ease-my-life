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

const PER_SIDE = 14;
// Y gets one exclusive row-band per glyph (14 — height is ample, so this is
// easy). X can't: a glyph's own width (up to 72px) means only a handful of
// column-bands actually fit across the gutter's real width, so 14 glyphs
// can't each get a fully exclusive column the way they do a row — 4 columns
// is what .bg-flourish's own width comfortably fits, so most columns end up
// shared by 3-4 glyphs (spread across very different rows, so they don't
// read as a stacked pair even though they share an x-band).
const GRID_COLS = 4;
const GRID_ROWS = PER_SIDE;

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

// Round-robins through the column indices enough times to cover n items
// (each column used as evenly as possible — floor(n/cols) or one more),
// then shuffles the result so which specific row lands in which column
// isn't a fixed repeating pattern.
function shuffledColumns(cols, n) {
  const seq = [];
  for (let i = 0; i < n; i++) seq.push(i % cols);
  return shuffle(seq);
}

// A symbol pool sized to n: each symbol is used at most twice (not once —
// with 28 total glyphs and only 15 symbols, every symbol repeating at least
// once is unavoidable) by concatenating two independently-shuffled passes
// over the full list and trimming to n, rather than n independent random
// picks that could let one symbol repeat 3+ times while another never
// appears at all.
function symbolPool(n) {
  const laps = Math.ceil(n / FLOURISH_SYMBOLS.length);
  let pool = [];
  for (let i = 0; i < laps; i++) pool = pool.concat(shuffle(FLOURISH_SYMBOLS));
  return pool.slice(0, n);
}

// One shuffled grid position, rotation, and size per item, all drawn from
// a single generation so nothing repeats more than the minimum unavoidable
// amount across the whole set (rotations and sizes are each a shuffled list
// of already-distinct values — no physical limit on how many distinct
// rotations/sizes exist, unlike symbols or x-position).
function generateFlourishes() {
  const total = PER_SIDE * 2;
  const symbols = symbolPool(total);
  const rotations = uniqueSpread(-28, 28, total);
  const sizes = uniqueSpread(36, 72, total);

  const items = [];
  let idx = 0;
  for (const side of ['left', 'right']) {
    const cols = shuffledColumns(GRID_COLS, PER_SIDE);
    const rows = shuffle(Array.from({ length: GRID_ROWS }, (_, i) => i));
    for (let i = 0; i < PER_SIDE; i++) {
      const colW = 100 / GRID_COLS;
      const rowH = 100 / GRID_ROWS;
      // Jitter within the cell's own band, staying off the cell's outer
      // edges so a large glyph (up to 72px) doesn't crowd its neighbor.
      const insetJitter = colW * 0.15 + Math.random() * (colW * 0.7);
      const topJitter = rowH * 0.15 + Math.random() * (rowH * 0.7);
      items.push({
        id: `${side}-${idx}`,
        side,
        symbol: symbols[idx],
        top: rows[i] * rowH + topJitter,
        inset: cols[i] * colW + insetJitter,
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
