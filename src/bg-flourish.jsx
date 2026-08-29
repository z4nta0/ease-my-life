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

const PER_SIDE = 8;

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// Evenly-spaced-then-jittered top offsets (percent) so glyphs spread across
// whatever the current tab's full content height turns out to be, rather
// than clustering near the top — this is what puts more of them "below the
// fold" on longer pages once .bg-flourish's own height matches that content
// (see the CSS comment there for the top:0/bottom:0 trick that makes a
// percentage-based position here resolve against actual content height).
function generateFlourishes() {
  const items = [];
  for (const side of ['left', 'right']) {
    for (let i = 0; i < PER_SIDE; i++) {
      const slot = (i / PER_SIDE) * 100;
      items.push({
        id: `${side}-${i}`,
        side,
        symbol: pick(FLOURISH_SYMBOLS),
        top: Math.min(97, Math.max(1, slot + (Math.random() * 8 - 4))),
        inset: 8 + Math.random() * 60,
        size: 24 + Math.random() * 22,
        opacity: 0.08 + Math.random() * 0.1,
        rotate: Math.random() * 36 - 18,
      });
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
