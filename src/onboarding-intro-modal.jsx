import React from 'react';
import { createPortal } from 'react-dom';
import { reduceMotion } from './ui.jsx';

// Generic intro modal for any guided tour (the Welcome Tour, and every
// per-feature mini-tour built on the same GuidedTour engine — see
// onboarding-tour-runner.jsx): an icon, a title, body paragraphs, up to a
// few small pills, then a primary "start" action over a secondary "skip"
// one. Content is fully parameterized; only the structure and the two
// buttons' styling are meant to stay identical across every tour that uses
// this — see onboarding.jsx for the Welcome Tour's own copy/labels, which
// differ slightly ("Take the quick tour" / "I'll explore myself") from a
// mini-tour's plainer "Get started" / "Skip".
function TutorialIntroModal({ icon, title, paragraphs, pills, onStart, onSkip, startLabel = 'Get started', skipLabel = 'Skip' }) {
  const reduce = reduceMotion && reduceMotion();
  return createPortal(
    <div className="ob-scrim" role="dialog" aria-modal="true" aria-label={title}>
      <div className={`ob-welcome ${reduce ? '' : 'ob-in'}`}>
        <div className="ob-wmark">{icon}</div>
        <h2>{title}</h2>
        {paragraphs.map((p, i) => <p key={i}>{p}</p>)}
        {pills && pills.length > 0 && (
          <div className="ob-chips">{pills.map((p) => <span key={p}>{p}</span>)}</div>
        )}
        <div className="ob-wact">
          <button className="ob-btn ob-btn--primary" autoFocus onClick={onStart}>{startLabel}</button>
          <button className="ob-btn ob-btn--ghost" onClick={onSkip}>{skipLabel}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export { TutorialIntroModal };
