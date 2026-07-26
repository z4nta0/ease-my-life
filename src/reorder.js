// Hand-rolled pointer drag-to-reorder for the Today "Edit Mode".
//
// One entry point: REORDER.startDrag(pointerEvent, opts). Call it from a grip
// handle's onPointerDown. It manages the whole gesture with document-level
// listeners and commits a new order via opts.onDrop(newIndexOrder).
//
// Technique (no library, works with variable-height rows):
//   • Snapshot every sibling's rect at gesture start.
//   • The grabbed element gets translated by the pointer delta, lifted (class),
//     and raised above its siblings.
//   • The target index is derived from where the grabbed element's projected
//     center falls among the original sibling centers.
//   • Siblings between the origin and target shift by the grabbed element's
//     outer height (+gap) to open a hole at the target — a smooth CSS transition
//     on `transform` animates them out of the way.
//   • On release we clear transforms and hand the new index order to onDrop;
//     React re-renders the list already in that order, so the swap is seamless.
//
// opts:
//   container      — element whose direct children (matching itemSelector) are
//                    the reorderable list.
//   itemSelector   — CSS selector identifying draggable siblings within container.
//   handleEl       — the grabbed element (the row/section being dragged).
//   scroller       — scroll container for edge auto-scroll (optional).
//   onDrop(order)  — called with an array of original indices in their new order,
//                    e.g. [0,2,1,3]. Only fires when the order actually changed.
//   onStart/onEnd  — optional lifecycle hooks (e.g. toggle a body class).
const SHIFT_EASE = 'transform 0.18s cubic-bezier(0.4, 0, 0.2, 1)';
const EDGE = 64;          // px from viewport edge that triggers auto-scroll
const EDGE_SPEED = 14;    // px per frame at the edge

function startDrag(ev, opts) {
  const { container, itemSelector, handleEl, gripEl, scroller, onDrop, onStart, onEnd } = opts;
  const captureTarget = gripEl || handleEl;
  if (ev.button != null && ev.button !== 0) return; // primary button / touch only
  const items = Array.from(container.querySelectorAll(itemSelector))
    .filter((el) => el.parentElement === container);
  const originIndex = items.indexOf(handleEl);
  if (originIndex === -1) return;

  ev.preventDefault();
  // Capture the pointer on the GRIP (the element that received pointerdown)
  // and — crucially — listen for move/up ON that same captured element. This is
  // the spec-guaranteed path: a captured element receives every subsequent
  // pointer event directly, regardless of what's under the cursor. Relying on
  // document bubbling instead is what silently failed in Firefox for the item
  // rows (their clickable <article> ancestor interfered).
  const pid = ev.pointerId;
  let captured = false;
  if (pid != null && captureTarget.setPointerCapture) {
    try { captureTarget.setPointerCapture(pid); captured = true; } catch (e) { /* ignore */ }
  }

  const rects = items.map((el) => el.getBoundingClientRect());
  const centers = rects.map((r) => r.top + r.height / 2);
  // Gap between adjacent siblings (flex/grid gap); read from the first pair.
  let gap = 0;
  if (rects.length > 1) gap = Math.max(0, rects[1].top - rects[0].bottom);
  const shift = rects[originIndex].height + gap;

  const startY = ev.clientY;
  let dy = 0;
  let target = originIndex;
  let raf = null;
  let edgeDir = 0;      // -1 up, +1 down, 0 none
  let scrollComp = 0;   // accumulated auto-scroll offset added to dy
  let done = false;     // guards against double cleanup (grip + document)

  // Prep siblings for smooth shifting; grabbed element floats freely.
  items.forEach((el, i) => {
    el.style.willChange = 'transform';
    if (i === originIndex) {
      el.classList.add('is-dragging');
      el.style.transition = 'none';
      el.style.zIndex = '50';
      el.style.position = 'relative';
    } else {
      el.style.transition = SHIFT_EASE;
    }
  });

  document.body.classList.add('is-reordering');
  // Firefox will start a NATIVE drag-and-drop on the grip's SVG/icon, which
  // silently kills all further pointermove events (the row lifts but never
  // follows the cursor). preventDefault on pointerdown doesn't stop it — we
  // have to cancel dragstart for the duration of the gesture.
  const killDrag = (e) => e.preventDefault();
  document.addEventListener('dragstart', killDrag, true);
  if (onStart) onStart();

  function computeTarget() {
    const pc = centers[originIndex] + dy;
    let t = originIndex;
    if (dy > 0) {
      while (t < items.length - 1 && pc > centers[t + 1]) t++;
    } else if (dy < 0) {
      while (t > 0 && pc < centers[t - 1]) t--;
    }
    return t;
  }

  function applyShifts() {
    target = computeTarget();
    items.forEach((el, i) => {
      if (i === originIndex) return;
      let t = 0;
      if (target > originIndex && i > originIndex && i <= target) t = -shift;
      else if (target < originIndex && i < originIndex && i >= target) t = shift;
      el.style.transform = t ? `translateY(${t}px)` : '';
    });
    handleEl.style.transform = `translateY(${dy}px)`;
  }

  function edgeLoop() {
    if (edgeDir !== 0 && scroller) {
      const before = scroller.scrollTop;
      scroller.scrollTop += edgeDir * EDGE_SPEED;
      const moved = scroller.scrollTop - before;
      if (moved !== 0) { scrollComp += moved; dy += moved; applyShifts(); }
    }
    raf = requestAnimationFrame(edgeLoop);
  }
  raf = requestAnimationFrame(edgeLoop);

  function onMove(e) {
    dy = (e.clientY - startY) + scrollComp;
    // Edge auto-scroll intent
    if (scroller) {
      const sr = scroller.getBoundingClientRect();
      if (e.clientY < sr.top + EDGE) edgeDir = -1;
      else if (e.clientY > sr.bottom - EDGE) edgeDir = 1;
      else edgeDir = 0;
    }
    applyShifts();
  }

  function cleanup() {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    document.removeEventListener('dragstart', killDrag, true);
    if (captured && captureTarget.releasePointerCapture) {
      try { captureTarget.releasePointerCapture(pid); } catch (e) { /* ignore */ }
    }
    captureTarget.removeEventListener('pointermove', onMove);
    captureTarget.removeEventListener('pointerup', onUp);
    captureTarget.removeEventListener('pointercancel', onUp);
    document.removeEventListener('pointermove', onMove, true);
    document.removeEventListener('pointerup', onUp, true);
    document.removeEventListener('pointercancel', onUp, true);
    items.forEach((el) => {
      el.classList.remove('is-dragging');
      el.style.transition = '';
      el.style.transform = '';
      el.style.zIndex = '';
      el.style.position = '';
      el.style.willChange = '';
    });
    document.body.classList.remove('is-reordering');
    if (onEnd) onEnd();
  }

  function onUp() {
    const finalTarget = target;
    cleanup();
    if (finalTarget !== originIndex) {
      const order = items.map((_, i) => i);
      const [moved] = order.splice(originIndex, 1);
      order.splice(finalTarget, 0, moved);
      if (onDrop) onDrop(order);
    }
  }

  // Primary path: listen on the captured grip (fires reliably everywhere).
  // ALSO bind capture-phase document listeners unconditionally: capture-phase
  // handlers fire for every pointer event before any nested target-phase
  // handler could swallow it, and they survive Firefox silently dropping the
  // pointer capture (which left the item rows with no working listener). Both
  // paths call the same idempotent onMove; cleanup() is guarded, so binding
  // twice is safe.
  captureTarget.addEventListener('pointermove', onMove);
  captureTarget.addEventListener('pointerup', onUp);
  captureTarget.addEventListener('pointercancel', onUp);
  document.addEventListener('pointermove', onMove, true);
  document.addEventListener('pointerup', onUp, true);
  document.addEventListener('pointercancel', onUp, true);
}

export const REORDER = { startDrag };
