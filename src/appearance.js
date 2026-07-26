import { reduceMotion } from './ui.jsx';

// Palette tokens + theme application. Split out of app.jsx so tab-settings.jsx
// can read palettes without importing the App component (that was an import cycle).

const PALETTES = {
  ink: {
    name: 'Ink',
    bg: 'oklch(0.985 0.003 240)',
    surface: 'oklch(0.975 0.004 240)',
    border: 'oklch(0.91 0.005 240)',
    text: 'oklch(0.17 0.012 250)',
    muted: 'oklch(0.5 0.012 250)',
    accent: 'oklch(0.5 0.14 250)',
    accentSoft: 'oklch(0.95 0.025 250)',
    warm: 'oklch(0.62 0.13 50)',
  },
  sage: {
    name: 'Sage',
    bg: 'oklch(0.985 0.005 130)',
    surface: 'oklch(0.97 0.008 130)',
    border: 'oklch(0.9 0.012 130)',
    text: 'oklch(0.19 0.015 150)',
    muted: 'oklch(0.5 0.012 150)',
    accent: 'oklch(0.48 0.09 155)',
    accentSoft: 'oklch(0.95 0.03 150)',
    warm: 'oklch(0.62 0.12 60)',
  },
  sand: {
    name: 'Sand',
    bg: 'oklch(0.98 0.008 80)',
    surface: 'oklch(0.96 0.012 80)',
    border: 'oklch(0.9 0.015 75)',
    text: 'oklch(0.2 0.018 50)',
    muted: 'oklch(0.5 0.018 50)',
    accent: 'oklch(0.5 0.12 40)',
    accentSoft: 'oklch(0.94 0.03 60)',
    warm: 'oklch(0.6 0.14 30)',
  },
  night: {
    name: 'Night',
    bg: 'oklch(0.18 0.012 250)',
    surface: 'oklch(0.22 0.014 250)',
    border: 'oklch(0.3 0.014 250)',
    text: 'oklch(0.95 0.005 250)',
    muted: 'oklch(0.65 0.012 250)',
    accent: 'oklch(0.75 0.14 250)',
    accentSoft: 'oklch(0.3 0.04 250)',
    warm: 'oklch(0.78 0.13 60)',
  },
  moss: {
    name: 'Moss',
    bg: 'oklch(0.17 0.01 150)',
    surface: 'oklch(0.21 0.014 150)',
    border: 'oklch(0.28 0.016 150)',
    text: 'oklch(0.95 0.008 150)',
    muted: 'oklch(0.65 0.012 150)',
    accent: 'oklch(0.7 0.1 155)',
    accentSoft: 'oklch(0.3 0.035 150)',
    warm: 'oklch(0.78 0.13 60)',
  },
  ember: {
    name: 'Ember',
    bg: 'oklch(0.17 0.014 45)',
    surface: 'oklch(0.21 0.016 45)',
    border: 'oklch(0.28 0.018 45)',
    text: 'oklch(0.95 0.012 50)',
    muted: 'oklch(0.65 0.016 50)',
    accent: 'oklch(0.72 0.13 42)',
    accentSoft: 'oklch(0.32 0.05 42)',
    warm: 'oklch(0.78 0.13 60)',
  },
};

// Applies a full 8-token palette object (a PALETTES entry, or a derived
// custom one built by resolveCustomPalette) directly to the document root.
// `name` is only used for the data-palette attribute other CSS may key off.
// Tracks whether the palette has been applied at least once — the first call is
// the initial page load (no transition); subsequent calls are user theme swaps,
// which get a brief cross-fade of the themable properties.
let __paletteApplied = false;
let __themeAnimTimer = null;
let __lastPaletteSig = null;
function applyPaletteObj(p, name) {
  // Cross-fade only when the resolved palette actually changed — not on other
  // appearance changes (e.g. tab placement) that re-run this effect. Otherwise
  // `.theme-animating` would clobber `.main`'s padding transition (used by the
  // nav layout-switch reflow) with its color-only transition list.
  const sig = [p.bg, p.surface, p.text, p.accent, p.accentSoft, p.border, p.muted, p.warm].join('|');
  const paletteChanged = sig !== __lastPaletteSig;
  __lastPaletteSig = sig;
  if (__paletteApplied && paletteChanged && !reduceMotion()) {
    const html = document.documentElement;
    html.classList.add('theme-animating');
    clearTimeout(__themeAnimTimer);
    __themeAnimTimer = setTimeout(() => html.classList.remove('theme-animating'), 480);
  }
  __paletteApplied = true;
  const root = document.documentElement.style;
  root.setProperty('--bg', p.bg);
  root.setProperty('--surface', p.surface);
  root.setProperty('--border', p.border);
  root.setProperty('--text', p.text);
  root.setProperty('--muted', p.muted);
  root.setProperty('--accent', p.accent);
  root.setProperty('--accent-soft', p.accentSoft);
  root.setProperty('--warm', p.warm);
  document.body.dataset.palette = name || 'custom';
  syncStatusBarTint(p.bg);
}

// Status-bar tint on installed PWAs.
//
// An installed PWA takes its status-bar colour from the manifest's theme_color,
// which is a single static value — manifests have no media-query support. That
// is why the light/dark <meta name="theme-color"> pair in index.html works in a
// browser tab but is ignored once installed. Chrome on Android DOES honour
// runtime changes to the meta tag in standalone mode, so we rewrite it whenever
// a palette is applied. Bonus: the status bar then follows the user's in-app
// theme and palette choice, not just the OS light/dark setting.
//
// theme-color must be a colour the UA will definitely parse. Palettes are
// authored in oklch(), so round-trip through a canvas — assigning to fillStyle
// and reading it back yields a plain hex string.
let __tintProbe = null;
function toHexColor(css) {
  try {
    if (window.CSS && CSS.supports && !CSS.supports('color', css)) return null;
    if (!__tintProbe) {
      const c = document.createElement('canvas');
      __tintProbe = c.getContext && c.getContext('2d');
    }
    if (!__tintProbe) return null;
    __tintProbe.fillStyle = '#000000';
    __tintProbe.fillStyle = css;
    const out = __tintProbe.fillStyle;
    return typeof out === 'string' && out.charAt(0) === '#' ? out : null;
  } catch (e) { return null; }
}

function syncStatusBarTint(bg) {
  const hex = toHexColor(bg);
  if (!hex) return;
  // Collapse the light/dark pair into one tag: JS now owns this, and a tag
  // carrying a media attribute would stop matching as soon as the in-app theme
  // and the OS preference disagree.
  const metas = document.querySelectorAll('meta[name="theme-color"]');
  let primary = null;
  for (const m of metas) {
    if (!primary) primary = m;
    else m.remove();
  }
  if (!primary) {
    primary = document.createElement('meta');
    primary.setAttribute('name', 'theme-color');
    document.head.appendChild(primary);
  }
  primary.removeAttribute('media');
  primary.setAttribute('content', hex);
}

// Builds a full palette from the 3 colors a Custom theme lets the user pick
// (background, text, accent) using CSS relative-color syntax — the derived
// tokens (surface/border/muted/accentSoft) are computed by the BROWSER off
// the literal color the user chose, so no color-math library is needed here.
// `mode` flips the lightness-offset direction: light themes' surface/border
// sit slightly DARKER than bg while dark themes' sit slightly LIGHTER (mirrors
// the built-in presets above), and muted/accentSoft move toward/away from the
// page background the same way.
//
// A plain offset breaks down at the BLACK end of the scale: sRGB is
// gamma-encoded, so +0.04 L off a true-black background lands at L 0.04
// (about rgb(4,4,4)) — cards and the switch control effectively vanish. The
// same +0.04 off rgb(1,1,1) already reaches L 0.107, which is why one step off
// black looked so different. Dark mode therefore FLOORS the derived lightness;
// above roughly rgb(12) the floor never binds and the offsets behave exactly as
// before. Light mode keeps the plain offset: near-white deltas get MORE visible
// under the same gamma curve, so there is no matching hazard there (and an
// absolute ceiling would wrongly bind on ordinary light backgrounds — white and
// the app's own #fcfbf9 seed included).
function resolveCustomPalette(mode, colors) {
  const bg = colors.bg, text = colors.text, accent = colors.accent;
  const sign = mode === 'dark' ? 1 : -1;
  const step = (offset, floor) => (mode === 'dark'
    ? `calc(max(l + ${offset}, ${floor}))`
    : `calc(l - ${offset})`);
  return {
    bg, text, accent,
    surface: `oklch(from ${bg} ${step(0.04, 0.17)} c h)`,
    border: `oklch(from ${bg} ${step(0.12, 0.26)} c h)`,
    muted: `oklch(from ${text} calc(l + ${sign * -0.32}) c h)`,
    accentSoft: `oklch(from ${accent} calc(l + ${sign * -0.42}) calc(c - 0.08) h)`,
    warm: mode === 'dark' ? 'oklch(0.78 0.13 60)' : 'oklch(0.62 0.13 50)',
  };
}

// Counterpart pairs for "System preference" auto-switching — each entry maps
// a theme key to its light/dark sibling. Built-ins mirror the palette design
// (Ink↔Night, Sage↔Moss, Sand↔Ember); custom slots pair with each other.
const THEME_PAIRS = {
  ink: { light: 'ink', dark: 'night' }, night: { light: 'ink', dark: 'night' },
  sage: { light: 'sage', dark: 'moss' }, moss: { light: 'sage', dark: 'moss' },
  sand: { light: 'sand', dark: 'ember' }, ember: { light: 'sand', dark: 'ember' },
  customLight: { light: 'customLight', dark: 'customDark' },
  customDark: { light: 'customLight', dark: 'customDark' },
};

// Resolves which theme key should actually be applied right now: if System
// preference is off, or the current theme has no known counterpart (or the
// counterpart custom slot hasn't been set up yet), just use the theme as-is.
export function resolveActiveThemeKey(appearance, systemPrefersDark) {
  const theme = appearance.theme || 'ink';
  if (!appearance.autoSystem) return theme;
  const pair = THEME_PAIRS[theme];
  if (!pair) return theme;
  const want = systemPrefersDark ? pair.dark : pair.light;
  if (want === 'customDark' && !appearance.customDark) return theme;
  if (want === 'customLight' && !appearance.customLight) return theme;
  return want;
}
export const APPEARANCE = { PALETTES, applyPaletteObj, resolveCustomPalette, resolveActiveThemeKey };
export { PALETTES, applyPaletteObj, resolveCustomPalette };
