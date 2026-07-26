import React from 'react';
import { createRoot } from 'react-dom/client';
import { STORAGE } from './storage.js';
import { App } from './app.jsx';
// Self-hosted fonts (Phase C) — see src/fonts.css. Imported before the app
// stylesheets so the @font-face rules are registered first.
import './fonts.css';

import './styles.css';
import './styles2.css';

function boot() {
  createRoot(document.getElementById('root')).render(<App />);
  // Let the first paint settle, then release the boot splash (it finishes its
  // current cycle before fading).
  requestAnimationFrame(() => setTimeout(() => {
    if (window.__dismissBootSplash) window.__dismissBootSplash();
  }, 180));
}

// Gate the mount on storage init so loadState() can stay synchronous. Never
// block forever: if IDB hangs, mount anyway and let storage.js fall back.
Promise.race([
  STORAGE.init(),
  new Promise((res) => setTimeout(res, 3500)),
]).then(boot, boot);
