import React from 'react';

// Tiny observable bus letting the onboarding tour(s) and the tabs react to
// each other without a context provider — e.g. a tab anchoring a tour
// target needs to know the live phase/step even when its own normal render
// gate is off, or Today needs to push its list down by reserveTop while a
// tall highlight is up. Kept in its own module (not onboarding.jsx) so the
// guided-tour engine (onboarding-tour-runner.jsx) and whatever authors an
// individual tour's step content (onboarding.jsx, future mini-tour modules)
// can both import it without a circular dependency between them.
let s = { prefill: null, startCreate: null };
const subs = new Set();
export const emlTour = {
  get: () => s,
  set: (patch) => { s = { ...s, ...patch }; subs.forEach((f) => f(s)); },
  subscribe: (f) => { subs.add(f); return () => subs.delete(f); },
};
export const useEmlTour = function useEmlTour() {
  const [v, setV] = React.useState(emlTour.get());
  React.useEffect(() => {
    setV(emlTour.get()); // catch a set() that fired between render and subscribe
    return emlTour.subscribe(setV);
  }, []);
  return v;
};
