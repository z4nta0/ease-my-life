import React from 'react';
import { PickerStrip } from './tab-picker.jsx';
import { Icon } from './ui.jsx';

// Settings → Appearance preview stages. Two components that let the user PLAY
// the selected effect right in the Settings tab:
//   • CelebrationPreviewStage — a dedicated box (sized like the Today cards
//     area) that fires the real ripple / confetti / sparkle celebration.
//   • PickerAnimStage — reuses the real PickerStrip (reel/spotlight/
//     dissolve) over mock candidates.
// Pressing Play is an explicit request to SEE the animation, so both stages play
// even under prefers-reduced-motion — the motion is consented, labelled, and
// contained. They are wrapped in .motion-ok, which re-enables the specific
// animations the global reduced-motion rules switch off. The Settings copy states
// that the app itself will not animate while the OS setting is on.
// (Previously they honored prefers-reduced-motion by rendering a static end-state and
// their trigger buttons are disabled upstream).

// Mock candidates for the picker-animation preview.
const PREVIEW_CANDIDATES = [
  { id: 'pv1', name: 'Sort the mail' }, { id: 'pv2', name: 'Water the plants' },
  { id: 'pv3', name: 'Wipe the counters' }, { id: 'pv4', name: 'Take out recycling' },
  { id: 'pv5', name: 'Sweep the floor' }, { id: 'pv6', name: 'Fold laundry' },
];

// Mock done-cards for the celebration preview — the real effects act on the
// CARDS (ripple = per-card exhale cascade; confetti/sparkle rain over them), so
// the preview mirrors the Today list rather than the progress ring.
const PREVIEW_CARDS = [
  { id: 'pc1', picker: 'Morning', name: 'Make the bed' },
  { id: 'pc2', picker: 'Chores', name: 'Water the plants' },
  { id: 'pc3', picker: 'Focus', name: 'Inbox zero' },
];

// Celebration stage. `token` is a monotonically-increasing trigger — bumping it
// replays. `style` is 'ripple' | 'confetti' | 'sparkle'.
function CelebrationPreviewStage({ style, token }) {
  const cardsRef = React.useRef(null);
  const [particles, setParticles] = React.useState([]);
  const first = React.useRef(true);
  React.useEffect(() => {
    if (first.current) { first.current = false; return; }   // don't fire on mount
    // Play regardless of the OS setting — the user pressed Play.
    const reduce = false;
    const cardEls = cardsRef.current ? [...cardsRef.current.querySelectorAll('.today-card')] : [];
    let clearCards;
    if (!reduce && style === 'ripple') {
      // Per-card exhale cascade, exactly like the Today list.
      cardEls.forEach((card, i) => {
        card.classList.remove('is-exhaling'); void card.offsetWidth;
        card.style.setProperty('--exhale-delay', `${i * 70}ms`);
        card.classList.add('is-exhaling');
      });
      clearCards = setTimeout(() => cardEls.forEach((card) => {
        card.classList.remove('is-exhaling'); card.style.removeProperty('--exhale-delay');
      }), cardEls.length * 70 + 900);
    }
    if (reduce) { setParticles([]); return () => clearTimeout(clearCards); }
    if (style === 'confetti') {
      setParticles(Array.from({ length: 26 }, (_, i) => ({
        id: 'c' + token + '_' + i, kind: 'confetti',
        angle: Math.round(Math.random() * 360), dist: 70 + Math.random() * 150,
        rot: Math.round(Math.random() * 540 - 270) + 'deg', delay: Math.round(Math.random() * 180),
        opacity: 0.75 + Math.random() * 0.2,
      })));
    } else if (style === 'sparkle') {
      setParticles(Array.from({ length: 22 }, (_, i) => ({
        id: 's' + token + '_' + i, kind: 'sparkle',
        xPct: Math.round(Math.random() * 100), yPct: Math.round(Math.random() * 100),
        delay: Math.round(Math.random() * 260),
      })));
    } else {
      setParticles([]);
    }
    const clear = setTimeout(() => setParticles([]), 1800);
    return () => { clearTimeout(clear); clearTimeout(clearCards); };
  }, [token]);   // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="celeb-preview-stage motion-ok">
      <div className="celeb-preview-cards" ref={cardsRef}>
        {PREVIEW_CARDS.map((c) => (
          <div key={c.id} className="today-card is-done celeb-preview-card">
            <span className="check" aria-hidden="true"><Icon name="check" size={14} /></span>
            <div className="today-card-body">
              <div className="today-card-meta"><span className="meta-picker">{c.picker}</span></div>
              <div className="today-card-name">{c.name}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="celeb-preview-particles" aria-hidden="true">
        {particles.map((p) => p.kind === 'confetti' ? (
          <i key={p.id} className="confetti-piece"
             style={{ '--angle': p.angle + 'deg', '--dist': p.dist + 'px', '--rot': p.rot,
                      '--piece-opacity': p.opacity, animationDelay: p.delay + 'ms' }} />
        ) : (
          <span key={p.id} className="sparkle-piece"
             style={{ left: p.xPct + '%', top: p.yPct + '%', animationDelay: p.delay + 'ms' }}>✦</span>
        ))}
      </div>
    </div>
  );
}

// Picker-animation stage. Reuses the real PickerStrip. `token` replays; `style`
// is 'reel' | 'spotlight' | 'dissolve'.
function PickerAnimStage({ style, token }) {
  const Strip = PickerStrip;
  const picked = PREVIEW_CANDIDATES[2];   // deterministic landing
  return (
    <div className="pickanim-preview-stage motion-ok">
      {Strip && token > 0
        ? <Strip key={token} candidates={PREVIEW_CANDIDATES} picked={picked} style={style} forceMotion />
        : <span className="pickanim-preview-pick">{picked.name}</span>}
    </div>
  );
}

export { CelebrationPreviewStage, PickerAnimStage };
