// Boot splash dismiss logic — extracted from index.html so the page has no
// inline <script> (lets Content-Security-Policy's script-src stay locked to
// 'self' with no hash/'unsafe-inline' needed; see public/_headers).
(function(){
  var el=document.getElementById('boot-splash'); if(!el) return;
  var dismissed=false;
  // The splash must never vanish mid-assembly. Two conditions gate the
  // fade: the app has booted, AND the equation has finished assembling.
  // "Assembled" = the last token (the checkmark, --i:10) has appeared and
  // its pop has settled: delay (--i * .12s) + 16% of the 3.4s loop ≈ 1.74s.
  // Deliberately NOT the checkmark's full animationiteration (4.6s) — each
  // loop holds the finished equation static from 7% to 82%, so waiting for
  // a whole iteration would sit on ~2.8s of dead hold and read as two
  // cycles. Derived from the #boot-splash CSS in index.html rather than
  // hard-coded so retiming that loop keeps this in sync.
  var TOK_STAGGER=0.12, LOOP=3.4, POP_SETTLED=0.16, LAST_I=10;
  var ASSEMBLED_MS=(LAST_I*TOK_STAGGER + LOOP*POP_SETTLED)*1000;
  var booted=false, cycled=false;
  // Pure-CSS animation; JS only fades it out once the app mounts — the
  // .42s opacity transition smooths whatever frame the loop is on.
  function hide(){ if(dismissed) return; dismissed=true; el.classList.add('bl-hide'); setTimeout(function(){ el.remove(); }, 460); }
  function maybeHide(){ if(booted && cycled) hide(); }
  // Reduced motion renders the equation already assembled, so there is
  // nothing to wait for.
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches){
    cycled=true;
  } else {
    setTimeout(function(){ cycled=true; maybeHide(); }, ASSEMBLED_MS);
  }
  window.__dismissBootSplash=function(){ booted=true; maybeHide(); };
  // Safety net: never trap the user if boot never signals.
  setTimeout(hide, 6000);
})();
