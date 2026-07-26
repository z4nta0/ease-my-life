import React from 'react';
import { Icon, reduceMotion } from './ui.jsx';

// Legal documents shown in a Settings-initiated modal (Privacy Policy / Terms of
// Service). Each doc is a SELF-CONTAINED component owning its own body copy, so
// when the real legal text lands it's a one-file edit per document. LegalModal is
// the shared shell: backdrop + centered scrollable panel, Esc / backdrop / close
// to dismiss, focus moved in on open, animated (reduced-motion → instant).
// Placeholder copy below — final text pending.

function PrivacyPolicyDoc() {
  return (
    <React.Fragment>
      <h1>Privacy Policy</h1>
      <p className="legal-meta"><em>Last updated: [date] · This is placeholder text and does not reflect the app’s actual data practices yet.</em></p>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
      <h2>1. Information We Collect</h2>
      <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      <ul>
        <li>Lorem ipsum dolor sit amet consectetur.</li>
        <li>Adipiscing elit sed do eiusmod tempor.</li>
        <li>Incididunt ut labore et dolore magna aliqua.</li>
      </ul>
      <h2>2. How We Use Information</h2>
      <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
      <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
      <h2>3. Local Storage &amp; Sync</h2>
      <p>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.</p>
      <h2>4. Third-Party Services</h2>
      <p>Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse.</p>
      <h2>5. Your Choices</h2>
      <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.</p>
      <h2>6. Contact</h2>
      <p>Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Questions about this policy can be sent via the Contact Support form in the app’s Settings tab.</p>
    </React.Fragment>
  );
}

function TermsOfServiceDoc() {
  return (
    <React.Fragment>
      <h1>Terms of Service</h1>
      <p className="legal-meta"><em>Last updated: [date] · This is placeholder text and does not reflect the app’s actual terms yet.</em></p>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
      <h2>1. Acceptance of Terms</h2>
      <p>Nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
      <h2>2. Use of the App</h2>
      <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
      <ul>
        <li>Totam rem aperiam eaque ipsa quae ab illo.</li>
        <li>Inventore veritatis et quasi architecto beatae.</li>
        <li>Vitae dicta sunt explicabo nemo enim ipsam.</li>
      </ul>
      <h2>3. Paid Features</h2>
      <p>Voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est qui dolorem ipsum quia dolor sit amet.</p>
      <h2>4. Disclaimer of Warranty</h2>
      <p>Consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.</p>
      <h2>5. Limitation of Liability</h2>
      <p>Nisi ut aliquid ex ea commodi consequatur, quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.</p>
      <h2>6. Changes to These Terms</h2>
      <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.</p>
      <h2>7. Contact</h2>
      <p>Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Questions about these terms can be sent via the Contact Support form in the app’s Settings tab.</p>
    </React.Fragment>
  );
}

// which: 'privacy' | 'terms' | null. onClose dismisses.
function LegalModal({ which, onClose }) {
  const panelRef = React.useRef(null);
  const [closing, setClosing] = React.useState(false);
  const dismiss = () => {
    if (reduceMotion && reduceMotion()) { onClose(); return; }
    setClosing(true);
    setTimeout(() => { setClosing(false); onClose(); }, 200);
  };
  React.useEffect(() => {
    if (!which) return;
    setClosing(false);
    const onKey = (e) => { if (e.key === 'Escape') dismiss(); };
    document.addEventListener('keydown', onKey);
    // Lock background scroll: the app scrolls inside <main class="main">, not the
    // body — freeze it at its current offset so nothing behind the modal scrolls
    // (even past the panel's own top/bottom), then restore on close.
    const scroller = document.querySelector('.main');
    const scrollTop = scroller ? scroller.scrollTop : 0;
    const prevOverflow = scroller ? scroller.style.overflow : '';
    if (scroller) scroller.style.overflow = 'hidden';
    // Move focus into the panel so Esc + scroll work immediately.
    const t = setTimeout(() => { if (panelRef.current) panelRef.current.focus(); }, 20);
    return () => {
      document.removeEventListener('keydown', onKey); clearTimeout(t);
      if (scroller) { scroller.style.overflow = prevOverflow; scroller.scrollTop = scrollTop; }
    };
  }, [which]);
  if (!which) return null;
  const title = which === 'privacy' ? 'Privacy Policy' : 'Terms of Service';
  return (
    <div className={`legal-modal-backdrop ${closing ? 'is-closing' : ''}`}
         onMouseDown={(e) => { if (e.target === e.currentTarget) dismiss(); }}>
      <div className={`legal-modal ${closing ? 'is-closing' : ''}`} role="dialog" aria-modal="true"
           aria-label={title} tabIndex={-1} ref={panelRef}>
        <div className="legal-modal-head">
          <span className="legal-modal-note">Placeholder text — final document pending.</span>
          <button type="button" className="legal-modal-close" aria-label="Close" onClick={dismiss}>
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="legal-modal-body">
          {which === 'privacy' ? <PrivacyPolicyDoc /> : <TermsOfServiceDoc />}
        </div>
      </div>
    </div>
  );
}

export { LegalModal };
