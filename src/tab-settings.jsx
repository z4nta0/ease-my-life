import React from 'react';
import { APPEARANCE } from './appearance.js';
import { HOLIDAYS } from './holidays.js';
import { LegalModal } from './legal-docs.jsx';
import { NOTIFY } from './notify.js';
import { PWA } from './pwa.js';
import { Segmented } from './reminders.jsx';
import { CelebrationPreviewStage, PickerAnimStage } from './settings-previews.jsx';
import { STORAGE } from './storage.js';
import { Btn, Card, Collapse, Icon, InfoTip, announce, reduceMotion, useEscapeCancel } from './ui.jsx';

// Settings — picker config + daily generator config + days off + reset.

// Editable "days off" list. Computed U.S. holidays for the current year can be
// toggled off (they stop triggering skip-on-holidays), and the user can add
// 24h "HH:MM" → friendly 12-hour label for the Daily-generator run-time copy.
function fmtRunTime(hhmm) {
  const [h, m] = (hhmm || '04:00').split(':').map(Number);
  const ap = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ap}`;
}

// their own recurring days. This is what every picker's "Skip on holidays"
// gate reads against.
function HolidayEditor({ state, actions }) {
  const year = new Date().getFullYear();
  const hstate = state.holidays || HOLIDAYS.defaultState();
  const computed = HOLIDAYS.computeForYear(year, hstate.country);
  const disabled = hstate.disabled || [];
  const custom = hstate.custom || [];
  const [name, setName] = React.useState('');
  const [date, setDate] = React.useState('');
  const [exitingId, setExitingId] = React.useState(null);

  const removeWithExit = (id) => {
    setExitingId(id);
    // Let the fade-up-and-out play before the store drops the row.
    setTimeout(() => { actions.removeCustomHoliday(id); setExitingId(null); }, 300);
  };

  const landsOn = (d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const actualDow = (d) => d.toLocaleDateString('en-US', { weekday: 'long' });
  const recurLabel = (m, d) =>
    new Date(2001, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const addCustom = () => {
    if (!name.trim() || !date) return;
    const [, m, d] = date.split('-').map(Number);
    actions.addCustomHoliday({ name: name.trim(), month: m, day: d });
    setName(''); setDate('');
  };

  return (
    <>
      <ul className="holiday-list">
        {computed.map((h) => {
          const on = !disabled.includes(h.key);
          return (
            <li key={h.key} className={`holiday-row ${on ? '' : 'is-off'}`}>
              <div className="holiday-info">
                <span className="holiday-name">{h.name}</span>
                <span className="holiday-date">
                  <span className="holiday-date-main">{landsOn(h.date)}</span>
                  {h.observed && <span className="holiday-obs">observed &middot; {h.name === "New Year's Day" ? 'falls' : 'lands'} on a {actualDow(h.actual)}</span>}
                </span>
              </div>
              <button className={`switch ${on ? 'is-on' : ''}`} aria-pressed={on}
                      aria-label={`${on ? 'Disable' : 'Enable'} ${h.name}`}
                      onClick={() => actions.toggleHoliday(h.key)}><i /></button>
            </li>
          );
        })}
        {custom.map((c) => (
          <li key={c.id} className={`holiday-row holiday-row--custom holiday-row--enter ${exitingId === c.id ? 'is-exiting' : ''}`}>
            <div className="holiday-info">
              <span className="holiday-name">{c.name}</span>
              <span className="holiday-date holiday-date--custom">
                <span>{recurLabel(c.month, c.day)}</span>
                <span className="holiday-recur">&middot; every year</span>
              </span>
            </div>
            <button className="item-del" onClick={() => removeWithExit(c.id)}
                    aria-label={`Remove ${c.name}`}><Icon name="trash" size={14} /></button>
          </li>
        ))}
      </ul>

      <div className="holiday-add">
        <input className="np-input np-input--sm" type="text" value={name}
               aria-label="Name of the day off to add"
               onChange={(e) => setName(e.target.value)}
               onKeyDown={(e) => { if (e.key === 'Enter') addCustom(); else if (e.key === 'Escape') e.currentTarget.blur(); }}
               placeholder="Add a day off, e.g. Family day" autoComplete="off" />
        <input className="np-input np-input--sm holiday-date-input" type="date" value={date}
               onKeyDown={(e) => { if (e.key === 'Escape') e.currentTarget.blur(); }}
               onChange={(e) => setDate(e.target.value)} aria-label="Date" />
        <Btn kind="primary" size="sm" icon="plus" disabled={!name.trim() || !date} onClick={addCustom}>Add</Btn>
      </div>
    </>
  );
}

// App version — injected from package.json at build time by vite.config.js, so
// `npm version` is the single source of truth and the About section can't drift
// from the actual build. The ?? guard keeps this rendering if the define is ever
// missing (e.g. running a file outside the Vite build).
const APP_VERSION = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : null;

// Lightweight browser name + version sniff for the support form's read-only
// diagnostic fields. Covers the common engines; falls back to the raw UA
// string if nothing matches rather than guessing wrong.
function detectBrowser() {
  const ua = navigator.userAgent;
  const patterns = [
    { name: 'Edge', re: /Edg\/([\d.]+)/ },
    { name: 'Opera', re: /OPR\/([\d.]+)/ },
    { name: 'Chrome', re: /Chrome\/([\d.]+)/ },
    { name: 'Firefox', re: /Firefox\/([\d.]+)/ },
    { name: 'Safari', re: /Version\/([\d.]+).*Safari/ },
  ];
  for (const { name, re } of patterns) {
    const m = ua.match(re);
    if (m) return `${name} ${m[1].split('.').slice(0, 2).join('.')}`;
  }
  return ua;
}

// Section registry — drives both the left nav (in this order) and the right
// pane. Keep the two in lockstep by mapping over this array.
const SETTINGS_SECTIONS = [
  { id: 'appearance', label: 'Appearance' },
  { id: 'daily',    label: 'Daily generator' },
  { id: 'holidays', label: 'Holidays' },
  { id: 'data',     label: 'Data control' },
  { id: 'account',  label: 'Account' },
  { id: 'about',    label: 'About' },
  { id: 'legal',    label: 'Legal' },
];

// Contact support — a collapsible card (same rd-ctl disclosure used in the
// Data tab) holding a small form: subject, message, and two read-only
// diagnostic fields (app version + browser) so bug reports arrive with useful
// context already attached.
//
// Send POSTs to Netlify Forms. Two things this depends on OUTSIDE this file:
//   1. The static <form name="support" netlify hidden> in index.html. Netlify
//      detects forms by parsing the built HTML at deploy time — it never runs
//      the app, so a React-rendered form alone is invisible to it. The field
//      names there MUST match the keys posted below.
//   2. Netlify's Forms feature enabled for the site, plus a notification email
//      configured (Site config → Forms → Form notifications) so submissions
//      actually reach an inbox rather than only the Netlify dashboard.
// If the POST fails for any reason — offline, forms not enabled, a deploy that
// dropped the static form — the user is shown the address instead and their
// text is preserved.
const SUPPORT_EMAIL = 'support@easemylife.app';
const SUPPORT_FORM_NAME = 'support';

function ContactSupportCard({ state, actions }) {
  // Local open state (not persisted) — the form always starts closed on load.
  const [open, setOpen] = React.useState(false);
  const [subject, setSubject] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [sentMsg, setSentMsg] = React.useState(0);
  const [validErr, setValidErr] = React.useState(false);
  // Set when the POST didn't go through, so the address can be surfaced as a
  // fallback instead of leaving the user stuck.
  const [sendFailed, setSendFailed] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  // Honeypot. Bots fill every field they find; humans never see this one, so a
  // non-empty value means we silently accept and drop the submission.
  const [botField, setBotField] = React.useState('');
  const browser = React.useMemo(() => detectBrowser(), []);
  const versionStr = APP_VERSION == null ? '1.0' : APP_VERSION;
  const formCardRef = React.useRef(null);
  const canSend = subject.trim() && message.trim();
  const [sending, setSending] = React.useState(false);

  const openForm = () => {
    setOpen(true);
    // Scroll the form into view once it's expanded — otherwise it renders
    // below the fold and clicking "Contact support" looks like it did nothing.
    // Wait past Collapse's own expand animation so we scroll to its final
    // height, not a mid-animation one.
    setTimeout(() => {
      const el = formCardRef.current;
      const container = el && el.closest('.main');
      if (!el || !container) return;
      const rect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      // Bring the form's bottom into view (with a little breathing room),
      // but never scroll past its top — so the "Having problems?" row stays
      // visible too when the form is short enough to fit alongside it.
      const overflowBelow = rect.bottom - containerRect.bottom + 24;
      if (overflowBelow > 0) {
        container.scrollTo({ top: container.scrollTop + overflowBelow, behavior: reduceMotion() ? 'auto' : 'smooth' });
      }
    }, 360);
  };

  const cancel = () => {
    setSubject(''); setMessage(''); setValidErr(false);
    setSendFailed(false); setCopied(false);
    setOpen(false);
  };

  const copyAddress = () => {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 2400); };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(SUPPORT_EMAIL).then(done, () => {});
      }
    } catch (e) { /* the address is on screen either way */ }
  };

  // POST to Netlify Forms. Netlify listens for form-encoded POSTs on any path
  // of the site and matches them to a detected form by the `form-name` field —
  // hence posting to '/' rather than to an endpoint of our own.
  //
  // Only clear the form on success. A failed send must never eat what the user
  // typed, which is the whole reason this waits on the response instead of
  // optimistically confirming.
  const send = () => {
    if (sending) return;
    if (!canSend) { setValidErr(true); return; }

    setValidErr(false);
    setSendFailed(false);
    setSending(true);

    const body = new URLSearchParams({
      'form-name': SUPPORT_FORM_NAME,
      'bot-field': botField,
      subject: subject.trim(),
      message: message.trim(),
      version: versionStr,
      browser: browser,
    }).toString();

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body,
    }).then((res) => {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      setSubject(''); setMessage('');
      setSentMsg(Date.now());
      setOpen(false);
    }).catch(() => {
      // Offline, Forms not enabled, or the static form missing from the build.
      setSendFailed(true);
    }).then(() => {
      setSending(false);
    });
  };

  return (
    <React.Fragment>
      <Card>
        <div className="set-data-row">
          <div className="set-data-info">
            <span className="set-data-name">Having problems?</span>
            <span className="set-data-sub">Send a note and it&rsquo;ll come through with your app version and browser attached, so there&rsquo;s no back-and-forth to track those down.</span>
            {sentMsg > 0 && (
              <span className="set-import-msg is-ok" role="status" key={sentMsg}>Message sent &mdash; thanks! I&rsquo;ll be in touch.</span>
            )}
          </div>
          <Btn kind="secondary" size="sm" onClick={openForm}>Contact support</Btn>
        </div>
      </Card>

      <Collapse open={open}>
        <Card>
          <div className="support-form" ref={formCardRef}>
            <label className="support-field">
              <span className="support-flabel">Subject</span>
              <input className="np-input" type="text" value={subject}
                     onChange={(e) => setSubject(e.target.value)} placeholder="What's going on?" />
            </label>
            <label className="support-field">
              <span className="support-flabel">Message</span>
              <textarea className="np-input support-textarea" value={message} rows={5}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="The more detail, the better." />
            </label>
            <div className="support-diag">
              <div className="support-diag-field">
                <span className="support-flabel">App version</span>
                <span className="support-diag-val">{versionStr}</span>
              </div>
              <div className="support-diag-field">
                <span className="support-flabel">Browser</span>
                <span className="support-diag-val">{browser}</span>
              </div>
            </div>
            <p className="support-hp" aria-hidden="true">
              <label>Don&rsquo;t fill this out if you&rsquo;re human:
                <input tabIndex={-1} autoComplete="off" name="bot-field" value={botField}
                       onChange={(e) => setBotField(e.target.value)} />
              </label>
            </p>
            <div className="support-form-foot">
              {validErr && !canSend && (
                <span className="support-valid-msg" key="verr">Please fill out both form fields.</span>
              )}
              {sendFailed && !validErr && (
                <span className="support-fallback" role="status" key="sfail">
                  Couldn&rsquo;t send &mdash; you may be offline. Your message is still here, so try again, or write to <span className="support-fallback-addr">{SUPPORT_EMAIL}</span>.
                </span>
              )}
              {sendFailed && !validErr && (
                <Btn kind="ghost" size="sm" onClick={copyAddress}>{copied ? 'Copied' : 'Copy address'}</Btn>
              )}
              <Btn kind="ghost" size="sm" onClick={cancel}>Cancel</Btn>
              <Btn kind="secondary" size="sm" onClick={send} disabled={sending}>{sending ? 'Sending\u2026' : 'Send'}</Btn>
            </div>
          </div>
        </Card>
      </Collapse>
    </React.Fragment>
  );
}

// ── Appearance → Theme ───────────────────────────────────────────────────────
// One full-width strip per theme (Option A from the mockups): background/
// accent colors span the row, name sits bottom-left. Only one theme is ever
// active — clicking a row in either the Light or Dark card makes it the
// live theme immediately (there's no separate "current mode" to track).
const LIGHT_THEMES = ['ink', 'sage', 'sand'];
const DARK_THEMES = ['night', 'moss', 'ember'];

function ThemeRow({ pKey, palette, active, dark, onClick }) {
  return (
    <div className={`theme-row ${active ? 'is-on' : ''} ${dark ? 'is-dark' : ''}`}
         role="radio" aria-checked={active} tabIndex={0}
         onClick={onClick} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}>
      <i style={{ background: palette.surface }} />
      <i style={{ background: palette.accent, flex: '0 0 34%' }} />
      <i style={{ background: palette.warm, flex: '0 0 12%' }} />
      <span>{palette.name}</span>
      {active && <span className="theme-row-check" aria-hidden="true">&#10003;</span>}
    </div>
  );
}

// The "Custom…" row — styled exactly like the preset rows (same height,
// border-radius, bottom-left name label), except its 3 segments ARE live
// <input type="color"> swatches (50% background / 30% accent / 20% text)
// rather than a static preview. Changing any swatch saves + activates
// immediately; clicking the name label activates without opening a picker.
function ThemeCustomRow({ mode, colors, active, dark, actions }) {
  const draft = colors || (dark
    ? { bg: '#1e2230', text: '#f2f3f6', accent: '#7da4ff' }
    : { bg: '#fcfbf9', text: '#242629', accent: '#3360a8' });
  const setColor = (key, value) => actions.setCustomTheme(mode, { ...draft, [key]: value });

  return (
    <div className={`theme-row theme-row--custom ${active ? 'is-on' : ''} ${dark ? 'is-dark' : ''}`}>
      <input type="color" className="theme-custom-swatch" style={{ flex: '1' }}
             value={draft.bg} title="Background" aria-label="Custom background color"
             onClick={() => actions.setAppearanceTheme(mode === 'dark' ? 'customDark' : 'customLight')}
             onChange={(e) => setColor('bg', e.target.value)} />
      <input type="color" className="theme-custom-swatch" style={{ flex: '0 0 34%' }}
             value={draft.accent} title="Accent" aria-label="Custom accent color"
             onClick={() => actions.setAppearanceTheme(mode === 'dark' ? 'customDark' : 'customLight')}
             onChange={(e) => setColor('accent', e.target.value)} />
      <input type="color" className="theme-custom-swatch" style={{ flex: '0 0 12%' }}
             value={draft.text} title="Text" aria-label="Custom text color"
             onClick={() => actions.setAppearanceTheme(mode === 'dark' ? 'customDark' : 'customLight')}
             onChange={(e) => setColor('text', e.target.value)} />
      <input type="text" className="theme-custom-name" placeholder="Custom"
             aria-label={`Name for your custom ${mode === 'dark' ? 'dark' : 'light'} theme`}
             value={draft.name || ''} maxLength={18}
             onFocus={() => actions.setAppearanceTheme(mode === 'dark' ? 'customDark' : 'customLight')}
             onChange={(e) => actions.setCustomThemeName(mode, e.target.value)}
             onClick={(e) => e.stopPropagation()} />
      {active && <span className="theme-row-check" aria-hidden="true">&#10003;</span>}
    </div>
  );
}

function ThemeSection({ state, actions }) {
  const ap = state.appearance || { theme: 'ink', customLight: null, customDark: null };

  return (
    <React.Fragment>
      <div className="set-subsection">
        <div className="set-subsection-h">Theme &middot; Light</div>
        <p className="settings-sub">
          Pick a light based theme below or create your own. If you enable the system
          preference option, the corresponding dark theme (Ink &rarr; Night) will be applied
          when applicable.
        </p>
        <p className="settings-sub">
          If you create a custom light theme then the app will automatically create an
          inverse dark theme from those colors, which you are then free to edit afterwards.
        </p>
        <Card>
          {LIGHT_THEMES.map((key) => (
            <ThemeRow key={key} pKey={key} palette={APPEARANCE.PALETTES[key]}
                      active={ap.theme === key}
                      onClick={() => actions.setAppearanceTheme(key)} />
          ))}
          <ThemeCustomRow mode="light" colors={ap.customLight} active={ap.theme === 'customLight'}
                          actions={actions} />
        </Card>
      </div>

      <div className="set-subsection">
        <div className="set-subsection-h">Theme &middot; Dark</div>
        <p className="settings-sub">
          Pick a dark based theme below or create your own. If you enable the system
          preference option, the corresponding light theme (Night &rarr; Ink) will be applied
          when applicable.
        </p>
        <p className="settings-sub">
          If you create a custom dark theme then the app will automatically create an
          inverse light theme from those colors, which you are then free to edit afterwards.
        </p>
        <Card>
          {DARK_THEMES.map((key) => (
            <ThemeRow key={key} pKey={key} palette={APPEARANCE.PALETTES[key]} dark
                      active={ap.theme === key}
                      onClick={() => actions.setAppearanceTheme(key)} />
          ))}
          <ThemeCustomRow mode="dark" colors={ap.customDark} active={ap.theme === 'customDark'} dark
                          actions={actions} />
        </Card>
      </div>
    </React.Fragment>
  );
}

// A named-style radio list (Picker animation / Completion celebration) —
// reuses the exact same full-bleed radio rows the Data tab's picker-mode
// selector uses (dot + name + hint that expands only on the selected row),
// so Appearance's style pickers look and behave consistently with the rest
// of the app rather than introducing a new control pattern.
function StyleRadioList({ groupName, options, value, onChange, onPreview, previewDisabled }) {
  return (
    <div className="rd-mode-radio">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <label key={o.value} className={`rd-mode-opt ${on ? 'is-on' : ''}`}>
            <input type="radio" name={groupName} checked={on} onChange={() => onChange(o.value)} />
            <span className="rd-mode-dot" aria-hidden="true"></span>
            <span className="rd-mode-text">
              <span className="rd-mode-name">{o.label}</span>
              {/* Always-mounted collapse (not <Collapse>, which unmounts the hint
                  on deselect — a freshly-inserted node can't transition its
                  grid-template-rows, so the height snapped). Keeping it mounted
                  lets the 0fr↔1fr glide run every time. */}
              <div className={`collapse ${on ? 'is-open' : ''}`}>
                <div className="collapse-inner"><span className="rd-mode-hint">{o.hint}</span></div>
              </div>
            </span>
            {onPreview && (
              <button type="button" className="style-preview-btn"
                      disabled={previewDisabled}
                      onClick={(e) => { e.preventDefault(); onPreview(o.value); }}>Preview</button>
            )}
          </label>
        );
      })}
    </div>
  );
}

function TabSettings({ state, actions, onHome, onNavTab }) {
  const ap = state.appearance || { theme: 'ink', customLight: null, customDark: null, autoSystem: false };
  // ── Scroll-spy + jump-to, mirroring the Today tab's group rail ──────────────
  // The scroll container is the shared <main className="main">; sections live in
  // the right pane and the sticky rail on the left tracks / drives position.
  const [activeSection, setActiveSection] = React.useState('daily');
  const [legalDoc, setLegalDoc] = React.useState(null); // 'privacy' | 'terms' | null
  // Appearance preview stages: bumping a token replays; celebPreview/pickPreview
  // hold which style is showing (null = idle, selector visible).
  const [celebToken, setCelebToken] = React.useState(0);
  const [celebStyle, setCelebStyle] = React.useState('confetti');
  const [pickToken, setPickToken] = React.useState(0);
  const [pickPreview, setPickPreview] = React.useState(null);
  const pickPreviewTimer = React.useRef(null);
  const playCeleb = (style) => { setCelebStyle(style); setCelebToken((t) => t + 1); };
  const playPick = (style) => {
    clearTimeout(pickPreviewTimer.current);
    setPickPreview(style); setPickToken((t) => t + 1);
    // The strip runs ~2s. Leave `pickPreview` holding the previewed style after
    // it ends (don't revert to the selected style) so the stage keeps the
    // previewed animation's final frame instead of snapping to another style.
    clearTimeout(pickPreviewTimer.current);
  };
  React.useEffect(() => () => clearTimeout(pickPreviewTimer.current), []);
  const sectionRefs = React.useRef({});
  const railRef = React.useRef(null);
  const rootRef = React.useRef(null);
  const skipSpy = React.useRef(false);
  // While set, scroll-spy leaves this section active and skips its own
  // computation — cleared only once the user scrolls back up above it. This is
  // what makes Account/About "click to highlight": once picked, ordinary
  // scroll-spy (which drives daily/holidays/data) can't silently override them.
  const pinnedRef = React.useRef(null);
  // Where a jumped-to section should land below the top of the scroll viewport
  // (desktop rail sticks at 16px; on mobile the rail is a sticky bar so we add
  // its height). Measured live so the two stay in agreement.
  const stickyOffset = () => {
    const rail = railRef.current;
    // .settings-rail is display:block; only its <ul> flips to row on mobile, so
    // read orientation from the ul (the rail's own flex-direction is always the
    // 'row' default and would misreport as horizontal on desktop).
    const ul = rail && rail.querySelector('ul');
    const horizontal = ul && getComputedStyle(ul).flexDirection === 'row';
    return (horizontal ? rail.offsetHeight + 8 : 0) + 16;
  };

  React.useEffect(() => {
    const entries = SETTINGS_SECTIONS.map((s) => [s.id, sectionRefs.current[s.id]]).filter(([, el]) => el);
    if (!entries.length) return;
    const container = rootRef.current?.closest('.main');
    // Account + About are the trailing sections — with nothing after them,
    // there's no scroll room left to carry their header past the spy's base
    // line, so scroll-position can never reliably distinguish "looking at
    // Account" from "looking at About" (or from the section before them).
    // Rather than fight that geometry, they're click-only: scrolling never
    // assigns them active, only clicking their nav link does (see jumpTo).
    const SPY_IDS = new Set(['daily', 'holidays', 'data', 'account', 'about']);
    const onScroll = () => {
      if (skipSpy.current) return;
      const base = (container ? container.getBoundingClientRect().top : 0) + stickyOffset() + 8;
      // Are we at (or within a hair of) the bottom of the scroll range? The last
      // sections can't scroll to the top line, so scroll-position alone can't tell
      // them apart — at the bottom, honor whatever section was pinned/active.
      const atBottom = container
        ? container.scrollTop + container.clientHeight >= container.scrollHeight - 2
        : window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
      if (pinnedRef.current) {
        const pinnedEl = sectionRefs.current[pinnedRef.current];
        // Bottom-cluster sections (account/about/legal) can't scroll their top up
        // to `base` — the page runs out of scroll first — so we can't use that as
        // the "still viewing it" test. Instead keep the pin while the section's top
        // is above the viewport's vertical midline; release only when the user
        // scrolls UP far enough to push it below the midline (back into earlier
        // sections). Also always keep it when bottomed out.
        const viewH = container ? container.clientHeight : window.innerHeight;
        const midline = (container ? container.getBoundingClientRect().top : 0) + viewH / 2;
        if (pinnedEl && (atBottom || pinnedEl.getBoundingClientRect().top <= midline)) return;
        // Scrolled back up above it — release the pin and fall through to the
        // normal spy computation below.
        pinnedRef.current = null;
      }
      let best = entries[0][0];
      for (const [id, el] of entries) {
        if (!SPY_IDS.has(id)) continue;
        if (el.getBoundingClientRect().top <= base) best = id;
      }
      setActiveSection(best);
    };
    onScroll();
    (container || window).addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      (container || window).removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Scroll-edge fades on the mobile rail (horizontal pill bar), same affordance
  // as the Data/Stats filter rows.
  React.useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const update = () => {
      const scrollable = el.scrollWidth - el.clientWidth > 1;
      el.classList.toggle('at-start', !scrollable || el.scrollLeft <= 1);
      el.classList.toggle('at-end', !scrollable || el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', update); ro.disconnect(); };
  }, []);

  const jumpTo = (id) => {
    const el = sectionRefs.current[id];
    if (!el) return;
    setActiveSection(id);
    // Only Legal (the very last section) still can't scroll its top to the line,
    // so it alone needs pinning to stay active; every other section now has
    // enough scroll room below it for the spy to track it naturally.
    pinnedRef.current = id === 'legal' ? id : null;
    skipSpy.current = true;
    const container = el.closest('.main');
    // The first section is the top of the tab — scroll all the way up so the
    // header comes back into view rather than stopping at the section.
    const toTop = id === SETTINGS_SECTIONS[0].id;
    if (container) {
      const delta = el.getBoundingClientRect().top - container.getBoundingClientRect().top;
      const top = toTop ? 0 : container.scrollTop + delta - stickyOffset();
      container.scrollTo({ top, behavior: reduceMotion() ? 'auto' : 'smooth' });
    } else {
      const top = toTop ? 0 : el.getBoundingClientRect().top + window.scrollY - stickyOffset();
      window.scrollTo({ top, behavior: reduceMotion() ? 'auto' : 'smooth' });
    }
    setTimeout(() => { skipSpy.current = false; }, 620);
  };

  // Both animation-choice sections are inert while the OS "reduce motion" setting
  // is on: the app skips the pick reveal and the completion celebration entirely.
  // The PREVIEWS still play on demand (pressing Play is explicit consent), so
  // without this note the choice would look active when it isn't. Tracked live so
  // the note appears/disappears if the OS setting changes mid-session.
  const [reduceMotionOn, setReduceMotionOn] = React.useState(() => !!(reduceMotion && reduceMotion()));
  React.useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduceMotionOn(mq.matches);
    mq.addEventListener ? mq.addEventListener('change', on) : mq.addListener(on);
    return () => { mq.removeEventListener ? mq.removeEventListener('change', on) : mq.removeListener(on); };
  }, []);
  const reduceMotionNote = (what) => reduceMotionOn ? (
    <p className="settings-sub set-rm-note">
      Your system is set to reduce motion, so {what} will not play in the app. You can still
      preview each one here.
    </p>
  ) : null;

  // ── Daily-generator notifications ───────────────────────────────────────────
  // Permission is asked exactly once, from the run-time change gesture: that is
  // the moment the user has shown they care when the generator runs, and a
  // denied prompt can't be re-shown by us.
  const [notifPerm, setNotifPerm] = React.useState(() => (NOTIFY ? NOTIFY.permission() : 'unsupported'));
  React.useEffect(() => {
    if (!NOTIFY) return;
    return NOTIFY.subscribe(() => setNotifPerm(NOTIFY.permission()));
  }, []);
  const onRunTimeChange = (v) => {
    actions.setDailyRunTime(v);
    if (NOTIFY) NOTIFY.askOnce().then(() => setNotifPerm(NOTIFY.permission()));
  };
  const enableNotifs = () => {
    if (NOTIFY) NOTIFY.request().then(() => setNotifPerm(NOTIFY.permission()));
  };

  // ── Storage & installation ──────────────────────────────────────────────────
  // Reports where the data actually lives, whether the browser has promised not
  // to evict it, and how fresh the fallback copy is. Refreshed on mount and
  // whenever the PWA layer changes (install, persistence grant).
  const [stor, setStor] = React.useState(null);
  const [pwaTick, setPwaTick] = React.useState(0);
  const [persistMsg, setPersistMsg] = React.useState(null);
  React.useEffect(() => {
    let alive = true;
    const read = () => {
      if (!STORAGE) return;
      STORAGE.status().then((v) => { if (alive) setStor(v); });
    };
    read();
    const off = PWA ? PWA.subscribe(() => { setPwaTick((n) => n + 1); read(); }) : null;
    return () => { alive = false; if (off) off(); };
  }, []);
  const standalone = !!(PWA && PWA.isStandalone());
  const canInstall = !!(PWA && PWA.canInstall());
  const iosInstall = !!(PWA && PWA.isIOS && !standalone);
  const macInstall = !!(PWA && PWA.isMac && !standalone);
  // Feature-detected rather than named-browser: 'unsupported' covers Firefox
  // and anything else without the install prompt, and stays 'pending' until we
  // have actually waited long enough to know.
  const installState = (PWA && PWA.installState) ? PWA.installState() : 'pending';
  const fmtBytes = (n) => {
    if (n == null) return '—';
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(0) + ' KB';
    return (n / 1048576).toFixed(1) + ' MB';
  };
  const fmtWhen = (iso) => {
    if (!iso) return 'not yet this install';
    try {
      const d = new Date(iso), now = new Date();
      const same = d.toDateString() === now.toDateString();
      const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      return same ? `today at ${time}` : d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ` at ${time}`;
    } catch (e) { return 'unknown'; }
  };
  const onInstall = async () => {
    const res = await PWA.promptInstall();
    if (res === 'accepted') setPersistMsg({ ok: true, text: 'Installed — your data is now protected from browser cleanup.' });
    else if (res === 'dismissed') setPersistMsg({ ok: false, text: 'Install dismissed.' });
  };
  const onPersist = async () => {
    const ok = await PWA.requestPersistOnce(true);
    setPersistMsg(ok
      ? { ok: true, text: 'Granted — this browser will not evict your data.' }
      : { ok: false, text: 'The browser declined for now. Installing the app is the surest way to get it.' });
    if (STORAGE) STORAGE.status().then(setStor);
  };

  // ── Data control: export / import ───────────────────────────────────────────
  const fileRef = React.useRef(null);
  // Both actions hand focus away (export appends and clicks a download link,
  // import opens the file dialog), leaving focus on <body> — where a screen
  // reader starts reading the browser and page title. Refocus the button that
  // was used and announce through the app-level live region.
  const exportBtnRef = React.useRef(null);
  const importBtnRef = React.useRef(null);
  const [importMsg, setImportMsg] = React.useState(null);
  // Parsed-but-unconfirmed backup. Replaces a native confirm(), which the
  // browser owns and no screen reader can be told about.
  const [pendingImport, setPendingImport] = React.useState(null);
  const [importLeaving, setImportLeaving] = React.useState(false);
  const importConfirmRef = React.useRef(null);
  // Set when a confirm closes; consumed by the effect that runs after the Import
  // button has actually remounted, so focus never lands on <body>.
  const restoreImportFocus = React.useRef(false);
  const [exportMsg, setExportMsg] = React.useState(null);
  const [confirmReset, setConfirmReset] = React.useState(false);
  const [resetLeaving, setResetLeaving] = React.useState(false);
  const [resetMsg, setResetMsg] = React.useState(null);
  // Same unmount-on-swap problem as the import row: the trigger button is
  // replaced by the confirm pair, so focus has to be moved deliberately in the
  // commit AFTER each swap or it falls to <body>.
  const resetBtnRef = React.useRef(null);
  const resetConfirmRef = React.useRef(null);
  const restoreResetFocus = React.useRef(false);
  // Something to reset? True if the user has created any pickers, items,
  // conditionals, reminders, groups, or accrued any pick/completion history.
  const hasData = !!(
    (state.pickers && state.pickers.length) ||
    (state.items && state.items.length) ||
    (state.conditionals && state.conditionals.length) ||
    (state.tasks && state.tasks.length) ||
    (state.pickLog && state.pickLog.length) ||
    (state.conditionalLog && state.conditionalLog.length) ||
    (state.groups && state.groups.length)
  );
  const closeResetConfirm = () => {
    restoreResetFocus.current = true;
    if (reduceMotion()) { setConfirmReset(false); return; }
    setResetLeaving(true);
    setTimeout(() => { setConfirmReset(false); setResetLeaving(false); }, 150);
  };
  // Escape backs out of the reset confirmation, like the other confirms.
  useEscapeCancel(confirmReset && !resetLeaving, closeResetConfirm);
  // Focus follows the swap: into the confirm's Reset button when it opens, back
  // to the row's own Reset button when it closes without resetting.
  React.useEffect(() => {
    if (confirmReset) {
      if (resetConfirmRef.current) resetConfirmRef.current.focus();
      return;
    }
    if (!restoreResetFocus.current) return;
    restoreResetFocus.current = false;
    if (resetBtnRef.current) resetBtnRef.current.focus();
  }, [confirmReset]);

  const exportData = async () => {
    // Export from the STORE OF RECORD, not just memory. If this session booted
    // from the warm localStorage mirror (which omits pickLog), the in-memory log
    // is empty and a naive export silently drops all history — the Stats tab
    // then comes back blank after a round-trip.
    let payload = state;
    try {
      if (STORAGE && STORAGE.readPersisted) {
        const p = await STORAGE.readPersisted();
        if (p && Array.isArray(p.pickLog) && p.pickLog.length > ((state.pickLog || []).length)) {
          payload = { ...state, pickLog: p.pickLog };
        }
      }
    } catch (e) { /* fall back to in-memory state */ }
    const entries = (payload.pickLog || []).length;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `ease-my-life-${stamp}.json`;
    setExportMsg({ t: Date.now(), entries });
    // Announce BEFORE firing the download. The browser's own download UI takes
    // focus the moment the link is clicked, and a screen reader that follows
    // focus into browser chrome drops any pending polite announcement — so the
    // speech has to be assertive and already under way. The file is fully built
    // by this point, so "exported" is true when it is said.
    announce(`Backup exported, including ${entries} history ${entries === 1 ? 'entry' : 'entries'}.`, { assertive: true });
    setTimeout(() => {
      // Never put the anchor in the document: appending it and clicking is what
      // moved focus to <body>. A detached anchor downloads identically. Focus is
      // then re-asserted on the button, so if the browser's download UI does not
      // grab it, focus stays somewhere meaningful.
      a.click();
      if (exportBtnRef.current) exportBtnRef.current.focus();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, 220);
  };

  const onImportFile = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = ''; // allow re-importing the same file
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result);
        if (!obj || !Array.isArray(obj.pickers)) throw new Error('Not an Ease My Life backup.');
        // Hold the parsed backup and ask in-app. No separate announcement: the
        // file dialog closing already sends the reader through browser chrome,
        // and an assertive message on top of that lands third, after its own
        // noise and the focus move. Instead we move focus (a little late, so the
        // dialog transition has settled) to the confirm button, whose name plus
        // aria-describedby warning is read as a single utterance.
        setImportMsg(null);
        setPendingImport({ name: file.name, data: obj });
        setTimeout(() => { if (importConfirmRef.current) importConfirmRef.current.focus(); }, 300);
      } catch (err) {
        setPendingImport(null);
        setImportMsg({ ok: false, text: "That file couldn't be read as a backup." });
        if (importBtnRef.current) importBtnRef.current.focus();
        announce("That file couldn't be read as a backup.", { assertive: true });
      }
    };
    reader.readAsText(file);
  };

  const closeImportConfirm = () => {
    // Focus restore is driven by a commit-watching effect below, not from here:
    // the Import button is unmounted while the confirm pair shows, and a
    // requestAnimationFrame guess can run before React commits the remount.
    restoreImportFocus.current = true;
    if (reduceMotion()) { setPendingImport(null); setImportLeaving(false); return; }
    setImportLeaving(true);
    setTimeout(() => { setPendingImport(null); setImportLeaving(false); }, 150);
  };
  const doImport = () => {
    if (!pendingImport) return;
    actions.importData(pendingImport.data);
    setImportMsg({ ok: true, text: 'Backup imported.' });
    announce('Backup imported.');
    closeImportConfirm();
  };
  const cancelImport = () => {
    if (!pendingImport) return;
    announce('Import cancelled.');
    closeImportConfirm();
  };
  // Escape backs out of the import confirmation, like every other confirm here.
  useEscapeCancel(!!pendingImport && !importLeaving, cancelImport);
  // Runs in the commit where the Import button is back in the tree.
  React.useEffect(() => {
    if (pendingImport || !restoreImportFocus.current) return;
    restoreImportFocus.current = false;
    if (importBtnRef.current) importBtnRef.current.focus();
  }, [pendingImport]);

  const pickerCount = (state.pickers || []).length;
  const itemCount = (state.items || []).length;
  const reminderCount = (state.tasks || []).length;
  const dailyIds = (state.daily && state.daily.pickerIds) || [];
  const dailyMode = (state.daily && state.daily.mode) || 'auto';

  return (
    <div className="tab tab--settings" ref={rootRef}>
      <header className="stat-h">
        <div className="kicker stat-h-kicker">Settings</div>
        <div className="stat-h-lead">
          <button type="button" onClick={onHome} className="brand-mark" aria-label="Ease My Life — go to Today">
            {/* Same theme-wired logo as the Today + Stats + Data headers. */}
            <svg viewBox="8 8 528 528" fill="none" aria-hidden="true">
              <defs>
                <clipPath id="brandMarkClipSettings" clipPathUnits="userSpaceOnUse">
                  <rect width="512" height="512" y="16" x="16" rx="75" ry="75" />
                </clipPath>
              </defs>
              <g style={{ stroke: 'var(--accent-soft)', strokeWidth: 16 }}>
                <path d="M 528 112 L 16 112" />
                <path d="M 216 528 L 216 16" />
                <path d="M 320 528 L 320 16" />
                <path d="M 424 528 L 424 16" />
                <path d="M 112 528 L 112 16" />
                <path d="M 528 216 L 16 216" />
                <path d="M 528 320 L 16 320" />
                <path d="M 528 424 L 16 424" />
              </g>
              <rect width="512" height="512" y="16" x="16" rx="75" ry="75"
                style={{ strokeWidth: 16, strokeLinecap: 'round', strokeLinejoin: 'round', stroke: 'currentColor' }} />
              <path
                d="M 24.467 527.792 C 67.266 416.298 77.088 228.913 172.207 434.412 C 200.739 535.77 262.562 434.412 314.873 292.51 C 381.45 120.201 450.381 44.636 528.854 24.365 C 521.725 22.337 512.215 24.365 493.193 34.5 C 369.548 105.451 295.85 292.51 234.029 363.461 C 186.473 414.14 167.451 241.831 124.651 262.102 C 101.828 270.008 60.133 375.754 24.467 527.792 Z"
                strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"
                clipPath="url(#brandMarkClipSettings)"
                style={{ fill: 'currentColor', stroke: 'currentColor' }}
              />
            </svg>
          </button>
          <div className="section-h">
            <h1 className="section-title">Behind the scenes, of your <span className="stat-title-accent">eased</span> life.</h1>
          </div>
        </div>
        <p className="section-sub">All app-wide settings can be found here relating to the app's appearance, the Daily generator, holiday preferences, app data import, export, and deletion, user account, about and legal. All conditionals, reminders, pickers and their items' settings can found in the <button type="button" className="sub-tablink" onClick={() => onNavTab && onNavTab('data')}>Data tab</button>.</p>
      </header>

      <div className="settings-layout">
        <aside className="settings-rail" aria-label="Settings sections" ref={railRef}>
          <div className="kicker rail-kicker">Sections</div>
          <ul>
            {SETTINGS_SECTIONS.map((s) => (
              <li key={s.id}>
                <button className={`rail-btn ${activeSection === s.id ? 'is-on' : ''}`}
                        onClick={() => jumpTo(s.id)}>
                  <span className="rail-name">{s.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="settings-sections">
          {/* ── Appearance ───────────────────────────────────────────────────── */}
          <section className="set-section" ref={(el) => { sectionRefs.current['appearance'] = el; }}>
            <div className="set-section-h"><span className="kicker">Appearance</span></div>
            <p className="settings-sub">
              Control the appearance of Ease My life, including colors, animations and tab placement.
            </p>

            <div className="set-subsection">
              <Card>
                <div className="set-data-row">
                  <div className="set-data-info">
                    <span className="set-data-name">System preference</span>
                    <span className="set-data-sub set-sub-fade" key={String(!!ap.autoSystem)}>
                      {ap.autoSystem
                        ? <React.Fragment>Your <strong>system</strong> will apply light and dark themes <strong>according to its preferences</strong>. Whichever theme is selected below will apply its counterpart (e.g. Ink &rarr; Night) when applicable.</React.Fragment>
                        : <React.Fragment>Themes will only be applied <strong>manually</strong> according to whichever preference you select in the options below.</React.Fragment>}
                    </span>
                  </div>
                  <button className={`switch ${ap.autoSystem ? 'is-on' : ''}`} aria-pressed={!!ap.autoSystem}
                          aria-label="System preference"
                          onClick={() => actions.setAppearanceAutoSystem(!ap.autoSystem)}><i /></button>
                </div>
              </Card>
            </div>

            <ThemeSection state={state} actions={actions} />

            <div className="set-subsection">
              <div className="set-subsection-h">Completion celebration</div>
              <p className="settings-sub">
                Pick which animation will play when all tasks are marked as completed
                inside of the Today tab.
              </p>
              {reduceMotionNote('celebrations')}
              <Card padded={false} className="style-radio-card">
                <StyleRadioList groupName="completionStyle" value={(state.appearance && state.appearance.completionStyle) || 'confetti'}
                                onChange={actions.setCompletionStyle}
                                onPreview={playCeleb}
                                previewDisabled={false}
                                options={[
                                  { value: 'confetti', label: 'Confetti', hint: 'A burst of accent-colored confetti drifts out across your cards.' },
                                  { value: 'ripple', label: 'Ripple', hint: 'The progress ring ripples, and each card exhales in turn.' },
                                  { value: 'sparkle', label: 'Sparkle', hint: 'Soft accent-colored sparkles twinkle briefly across your cards.' },
                                ]} />
                <CelebrationPreviewStage style={celebStyle} token={celebToken} />
              </Card>
            </div>

            <div className="set-subsection">
              <div className="set-subsection-h">Picker animation</div>
              <p className="settings-sub">
                Pick which animation will play when the &ldquo;Pick one&rdquo; button is clicked
                inside of the Pickers tab.
              </p>
              {reduceMotionNote('this animation')}
              <Card padded={false} className="style-radio-card">
                <StyleRadioList groupName="pickAnim" value={(state.appearance && state.appearance.pickAnim) || 'reel'}
                                onChange={(v) => { setPickPreview(null); actions.setPickAnim(v); }}
                                onPreview={playPick}
                                previewDisabled={false}
                                options={[
                                  { value: 'reel', label: 'Reel', hint: 'Candidates cycle past like a slot-machine reel before landing on the pick.' },
                                  { value: 'spotlight', label: 'Spotlight', hint: 'A spotlight sweeps across the candidates and settles on the pick.' },
                                  { value: 'dissolve', label: 'Dissolve', hint: 'Candidates crossfade in place, dissolving into the final pick.' },
                                ]} />
                <PickerAnimStage style={pickPreview || (state.appearance && state.appearance.pickAnim) || 'reel'} token={pickToken} />
              </Card>
            </div>

            <div className="set-subsection">
              <div className="set-subsection-h">Layout</div>
              <p className="settings-sub">
                Pick where the app&rsquo;s main navigation links should be located.
              </p>
              <Card>
                <div className="set-data-row">
                  <div className="set-data-info">
                    <span className="set-data-name">Tab bar placement</span>
                    <span className="set-data-sub set-sub-fade set-layout-sub" key={(state.appearance && state.appearance.tabPlacement) || 'bottom'}>
                      {((state.appearance && state.appearance.tabPlacement) || 'bottom') === 'bottom'
                        ? <>The main navigation is now a floating bar towards the <strong>bottom of the screen</strong>.</>
                        : ((state.appearance && state.appearance.tabPlacement) === 'side')
                        ? <>The main navigation is now a sidebar on the <strong>left side of the screen</strong>.</>
                        : <>The main navigation is now a bar at the <strong>top of the screen</strong>.</>}
                    </span>
                  </div>
                  <Segmented options={[
                                       { key: 'bottom', label: 'Bottom' },
                                       { key: 'side',   label: 'Side' },
                                       { key: 'top',    label: 'Top' },
                                     ]}
                                     value={(state.appearance && state.appearance.tabPlacement) || 'bottom'}
                                     onChange={actions.setTabPlacement} ariaLabel="Tab bar placement" />
                </div>
              </Card>
            </div>
          </section>

          {/* ── Daily generator ─────────────────────────────────────────────── */}
          <section className="set-section" ref={(el) => { sectionRefs.current['daily'] = el; }}>
            <div className="set-section-h"><span className="kicker">Daily generator</span></div>
            <p className="settings-sub">
              The Daily generator can always be run manually from the Today tab regardless of this setting.
              Which pickers are included in the Daily generator can be found with their own settings in the Data tab.
            </p>
            <Card>
              <div className="set-data-row">
                <div className="set-data-info">
                  <span className="set-data-name">Run automatically</span>
                  <span className="set-data-sub set-sub-fade" key={dailyMode + (state.daily && state.daily.runTime)}>
                    {dailyMode === 'auto'
                      ? <>Daily generator will run automatically every day at <strong>{fmtRunTime((state.daily && state.daily.runTime) || '04:00')}</strong>.</>
                      : <>Daily generator can only be run <strong>manually</strong> via the generator button at the bottom of the Today tab.</>}
                  </span>
                </div>
                <button className={`switch ${dailyMode === 'auto' ? 'is-on' : ''}`} aria-pressed={dailyMode === 'auto'}
                        aria-label="Run the Daily generator automatically"
                        onClick={() => actions.setDailyMode(dailyMode === 'auto' ? 'manual' : 'auto')}><i /></button>
              </div>
              <div className={`set-data-row set-data-row--sub ${dailyMode === 'auto' ? '' : 'is-disabled'}`}>
                <div className="set-data-info">
                  <span className="set-data-name">Run automatically at</span>
                  <span className="set-data-sub set-sub-fade" key={dailyMode}>
                    {dailyMode === 'auto'
                      ? 'A quiet, early hour works best so that your list is ready for you first thing in the morning.'
                      : 'Auto generation is turned off, turn it on to modify this setting.'}
                  </span>
                </div>
                <input className="np-input set-time-input" type="time"
                       onKeyDown={(e) => { if (e.key === 'Escape') e.currentTarget.blur(); }}
                       value={(state.daily && state.daily.runTime) || '04:00'}
                       disabled={dailyMode !== 'auto'}
                       onChange={(e) => onRunTimeChange(e.target.value)}
                       aria-label="Daily generator run time" />
              </div>
              {dailyMode === 'auto' && notifPerm !== 'unsupported' && (
                <div className="set-data-row">
                  <div className="set-data-info">
                    <span className="set-data-name">Notify me when it runs</span>
                    <span className="set-data-sub">
                      {notifPerm === 'granted'
                        ? <>You&rsquo;ll get a notification once your list has been generated &mdash; but only while the app is open in a tab or window. Notifications for a closed app are coming in a future release.</>
                        : notifPerm === 'denied'
                          ? <>Notifications are blocked for this site. You&rsquo;ll need to allow them in your browser&rsquo;s site settings.</>
                          : <>Get a nudge once your list has been generated. Only works while the app is open in a tab or window.</>}
                    </span>
                  </div>
                  {notifPerm === 'default' && (
                    <Btn kind="secondary" size="sm" onClick={enableNotifs}>Enable</Btn>
                  )}
                  {notifPerm === 'granted' && (
                    <span className="set-store-chip is-ok">On</span>
                  )}
                  {notifPerm === 'denied' && (
                    <span className="set-store-chip is-warn">Blocked</span>
                  )}
                </div>
              )}
            </Card>
          </section>

          {/* ── Holidays ────────────────────────────────────────────────────── */}
          <section className="set-section" ref={(el) => { sectionRefs.current['holidays'] = el; }}>
            <div className="set-section-h"><span className="kicker">Holidays</span></div>
            <p className="settings-sub">
              Any pickers that are set to &ldquo;Skip on holidays&rdquo; will not be run on the days
              that are toggled on here. Toggle off any that you don&rsquo;t observe, or even add your
              own! Dates shown are for {new Date().getFullYear()}.
            </p>
            <Card>
              <HolidayEditor state={state} actions={actions} />
            </Card>
          </section>

          {/* ── Data control ────────────────────────────────────────────────── */}
          <section className="set-section" ref={(el) => { sectionRefs.current['data'] = el; }}>
            <div className="set-section-h"><span className="kicker">Data control</span></div>
            <p className="settings-sub">
              All of your data is stored locally, on this device - do with it as you will. Unfortunately,
              this also means that if you want to use this app on a different device then you will need to
              export your data here, and then use the import feature on the other device. Exporting your data
              is also a good way to backup your data, just in case something were to happen either to
              your device or to the browser and its stored data.
            </p>
            <Card>
              <div className="set-data-row set-store-row">
                <div className="set-data-info">
                  <span className="set-data-name">Where your data lives</span>
                  <span className="set-data-sub">
                    {stor && stor.engine === 'idb'
                      ? <>Stored in this browser&rsquo;s database on this device.</>
                      : <>Stored in this browser&rsquo;s simple storage on this device &mdash; more likely to be cleared automatically. Exporting a backup is worth doing.</>}
                  </span>
                  <span className="set-store-facts">
                    <span className={`set-store-chip ${stor && stor.persisted ? 'is-ok' : 'is-warn'}`}>
                      {stor && stor.persisted ? 'Protected from cleanup' : 'Not protected yet'}
                    </span>
                    <span className="set-store-chip">{fmtBytes(stor && stor.dataBytes)} of your data</span>
                    <span className={`set-store-chip ${stor && stor.mirrorOk === false ? 'is-warn' : ''}`}>
                      Fallback copy: {stor && stor.mirrorOk === false ? 'out of date' : fmtWhen(stor && stor.mirrorAt)}
                    </span>
                    {standalone && <span className="set-store-chip is-ok">Installed</span>}
                  </span>
                  {persistMsg && (
                    <span className={`set-import-msg ${persistMsg.ok ? 'is-ok' : 'is-err'}`} role="status">{persistMsg.text}</span>
                  )}
                </div>
                <div className="set-store-actions">
                  {canInstall && <Btn kind="primary" size="sm" icon="download" onClick={onInstall}>Install app</Btn>}
                  {installState === 'pending' && (
                    <Btn kind="secondary" size="sm" icon="download" disabled>Install app</Btn>
                  )}
                  {!(stor && stor.persisted) && (
                    <Btn kind="secondary" size="sm" onClick={onPersist}>Protect data</Btn>
                  )}
                </div>
              </div>
              {installState === 'installed' && (
                <div className="set-data-row set-store-ios">
                  <div className="set-data-info">
                    <span className="set-data-name">Already installed on this device</span>
                    <span className="set-data-sub">
                      You&rsquo;re viewing Ease My Life in a browser tab. Open the installed app from your
                      home screen or app list instead &mdash; it&rsquo;s the same data, and the installed copy is
                      the one protected from browser cleanup.
                    </span>
                  </div>
                </div>
              )}
              {installState === 'unsupported' && !iosInstall && !macInstall && (
                <div className="set-data-row set-store-ios">
                  <div className="set-data-info">
                    <span className="set-data-name">Installing from this page isn&rsquo;t available here</span>
                    <span className="set-data-sub">
                      Some browsers offer <strong>Install app</strong> or <strong>Add to Home screen</strong> in their
                      own menu &mdash; it&rsquo;s worth a look. Others, including Firefox on desktop, can&rsquo;t install
                      web apps at all; there you&rsquo;d need a Chromium-based browser such as Chrome or Edge.
                      Either way you can keep using Ease My Life right here &mdash; use <strong>Protect data</strong> above
                      to make this browser far less likely to clear it.
                    </span>
                  </div>
                </div>
              )}
              {iosInstall && (
                <div className="set-data-row set-store-ios">
                  <div className="set-data-info">
                    <span className="set-data-name">Add to your Home Screen</span>
                    <span className="set-data-sub">
                      On iPhone and iPad, tap <strong>Share</strong> then <strong>Add to Home Screen</strong>. Do this and
                      Safari stops clearing your data when the app sits unused &mdash; without it, everything here can be
                      wiped after a period of not opening the app.
                    </span>
                    <span className="set-data-sub">
                      <strong>WARNING:</strong> iOS and iPadOS do not copy over your existing data when installing
                      the app. Please use the Export feature below to export your data and then import your data
                      back in using the Import feature.
                    </span>
                  </div>
                </div>
              )}
              {macInstall && (
                <div className="set-data-row set-store-ios">
                  <div className="set-data-info">
                    <span className="set-data-name">Add to your Dock</span>
                    <span className="set-data-sub">
                      On Mac, open Safari&rsquo;s <strong>File</strong> menu and choose <strong>Add to Dock</strong>. Do this
                      and Safari stops clearing your data when the app sits unused &mdash; without it, everything here can be
                      wiped after a period of not opening the app.
                    </span>
                    <span className="set-data-sub">
                      <strong>WARNING:</strong> macOS does not copy over your existing data when installing
                      the app. Please use the Export feature below to export your data and then import your data
                      back in using the Import feature.
                    </span>
                  </div>
                </div>
              )}
              <div className="set-data-row">
                <div className="set-data-info">
                  <span className="set-data-name">Export a backup</span>
                  <span className="set-data-sub">Downloads a JSON file of everything &mdash; <strong>{pickerCount}</strong> pickers, <strong>{itemCount}</strong> items, <strong>{reminderCount}</strong> reminders and <strong>all app settings</strong>.</span>
                  {exportMsg && (
                    <span className="set-import-msg is-ok" key={exportMsg.t}>
                      Backup exported &mdash; including <strong>{exportMsg.entries}</strong> history {exportMsg.entries === 1 ? 'entry' : 'entries'}.
                    </span>
                  )}
                </div>
                {hasData
                  ? <Btn kind="secondary" size="sm" icon="download" ref={exportBtnRef} onClick={exportData}>Export</Btn>
                  : <InfoTip className="set-disabled-btn" label="There is no user data to export."><Btn kind="secondary" size="sm" icon="download" disabled>Export</Btn></InfoTip>}
              </div>
              <div className="set-data-row">
                <div className="set-data-info">
                  <span className="set-data-name">Import a backup</span>
                  <span className="set-data-sub"><strong>Replaces all data</strong> that is currently being stored by this app with a previously exported file.</span>
                  {pendingImport && (
                    <span className="set-import-msg is-warn" id="set-import-confirm-msg">
                      Import <strong>{pendingImport.name}</strong>? This <strong>replaces all data</strong> currently stored by this app.
                    </span>
                  )}
                  {!pendingImport && importMsg && (
                    <span className={`set-import-msg ${importMsg.ok ? 'is-ok' : 'is-err'}`}>{importMsg.text}</span>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="application/json,.json"
                       onChange={onImportFile} style={{ display: 'none' }} />
                {pendingImport ? (
                  <div className={`set-reset-confirm ${importLeaving ? 'is-leaving' : ''}`}>
                    <Btn kind="danger" size="sm" ref={importConfirmRef}
                         aria-describedby="set-import-confirm-msg" onClick={doImport}>Import</Btn>
                    <Btn kind="ghost" size="sm" onClick={cancelImport}>Cancel</Btn>
                  </div>
                ) : (
                  <Btn kind="secondary" size="sm" icon="upload" ref={importBtnRef} onClick={() => fileRef.current && fileRef.current.click()}>Import</Btn>
                )}
              </div>
              <div className="set-data-row set-data-row--danger">
                <div className="set-data-info">
                  <span className="set-data-name">Reset all data</span>
                  <span className="set-data-sub" id="set-reset-confirm-msg">Wipes everything and restores the app to a clean state. <strong>This can&rsquo;t be undone.</strong></span>
                  {resetMsg && (
                    <span className="set-import-msg is-ok" role="status" key={resetMsg}>{resetMsg}</span>
                  )}
                </div>
                {confirmReset ? (
                  <div className={`set-reset-confirm ${resetLeaving ? 'is-leaving' : ''}`}>
                    <Btn kind="danger" size="sm" ref={resetConfirmRef}
                         aria-describedby="set-reset-confirm-msg" onClick={() => {
                      // Land on Today FIRST: the clean state re-opens the welcome
                      // modal, and its tour anchors only exist on the Today tab.
                      // Starting the tour from Settings left it dimmed with no coach.
                      if (onNavTab) onNavTab('today');
                      actions.reset(); setConfirmReset(false); setResetLeaving(false); setResetMsg('All data reset.');
                      // Nothing here to return focus to (the row's Reset button
                      // becomes disabled with no data), and the welcome modal
                      // takes focus on the Today tab, so just say what happened.
                      announce('All data reset.');
                    }}>Reset</Btn>
                    <Btn kind="ghost" size="sm" onClick={closeResetConfirm}>Cancel</Btn>
                  </div>
                ) : hasData ? (
                  <Btn kind="danger" size="sm" icon="refresh" ref={resetBtnRef}
                       onClick={() => { setResetMsg(null); setConfirmReset(true); }}>Reset</Btn>
                ) : (
                  <InfoTip className="set-disabled-btn" label="There is no user data to reset."><Btn kind="danger" size="sm" icon="refresh" disabled>Reset</Btn></InfoTip>
                )}
              </div>
            </Card>
          </section>

          {/* ── About ───────────────────────────────────────────────────────── */}
          {/* ── Account ─────────────────────────────────────────────────────── */}
          <section className="set-section" ref={(el) => { sectionRefs.current['account'] = el; }}>
            <div className="set-section-h"><span className="kicker">Account</span></div>
            <p className="settings-sub">
              Ease My Life runs entirely on this device &mdash; no account required. Sign in to
              sync across devices is planned for a future release as a paid feature (one time fee only).
            </p>
            <Card>
              <div className="set-data-row">
                <div className="set-data-info">
                  <span className="set-data-name">Sync across devices</span>
                  <span className="set-data-sub">This feature will keep all of your Ease My Life data synced across every device that you sign in to.</span>
                </div>
                <Btn kind="secondary" size="sm" disabled>Coming soon</Btn>
              </div>
            </Card>
          </section>

          {/* ── About ───────────────────────────────────────────────────────── */}
          <section className="set-section" ref={(el) => { sectionRefs.current['about'] = el; }}>
            <div className="set-section-h"><span className="kicker">About</span></div>
            <p className="settings-sub">
              Ease My Life is a labor of love for me. I have been using a version of this app on
              my own home server for years, and I have always wanted to turn it into a &ldquo;proper
              app&rdquo; that I could share with everyone else. I hope there are at least a few
              people out there that find it as useful as I do. You can find out more information
              about myself by visiting the link below to my personal website, including links to
              some of my other projects.
            </p>
            <p className="settings-sub">
              You will also find the link to this app&rsquo;s source code on GitHub. This is an open
              source project with an &ldquo;MIT + Non-Commercial&rdquo; Custom License which will
              allow anyone to freely fork and modify the project&rsquo;s source code, provided that
              attribution is included in your project and that you will not be selling the software
              or making money off it in any way. Please be responsible with the source code, because
              this is one person maintaining this project in their free time who is just trying to
              make a living &mdash; not some big company with vast resources that is trying to
              extract every dollar that they can.
            </p>
            <Card>
              <div className="set-about">
                <div className="set-about-brand">
                  <span className="set-about-name">Ease My Life</span>
                </div>
                <span className="set-about-ver">{APP_VERSION == null ? 'Version: 1.0' : `Version: ${APP_VERSION}`}</span>
                <span className="set-about-creator">Creator: <a href="https://techgeek.support/" target="_blank" rel="noopener noreferrer">https://techgeek.support/</a></span>
                <span className="set-about-creator">GitHub: <a href="https://github.com/z4nta0/ease-my-life" target="_blank" rel="noopener noreferrer">https://github.com/z4nta0/ease-my-life</a></span>
              </div>
            </Card>

            <Card>
              <div className="set-data-row">
                <div className="set-data-info">
                  <span className="set-data-name">Support the project</span>
                  <span className="set-data-sub">Enjoying Ease My Life? Consider buying me a coffee.</span>
                </div>
                <Btn kind="secondary" size="sm" disabled>Buy me a coffee</Btn>
              </div>
            </Card>

            <Card>
              <div className="set-data-row">
                <div className="set-data-info">
                  <span className="set-data-name">Replay the welcome tour</span>
                  <span className="set-data-sub">Runs the first-run walkthrough again. Including the welcome message, a guided tour of pickers, generating your day, and reminders.</span>
                </div>
                <Btn kind="secondary" size="sm" icon="refresh"
                     onClick={() => { if (onHome) onHome(); actions.setOnboarding({ welcomed: false, dismissed: true }); }}>Replay tour</Btn>
              </div>
            </Card>

            <ContactSupportCard state={state} actions={actions} />
          </section>

          {/* ── Legal ───────────────────────────────────────────────────────── */}
          <section className="set-section" ref={(el) => { sectionRefs.current['legal'] = el; }}>
            <div className="set-section-h"><span className="kicker">Legal</span></div>
            <p className="settings-sub">
              The documents below outline what you&rsquo;re agreeing to by using Ease My Life.
            </p>
            <Card>
              <div className="set-data-row">
                <div className="set-data-info">
                  <span className="set-data-name">Privacy Policy</span>
                  <span className="set-data-sub">How your data is collected, used, and stored.</span>
                </div>
                <button type="button" className="btn btn--secondary btn--sm"
                   onClick={() => setLegalDoc('privacy')}>View</button>
              </div>
              <div className="set-data-row">
                <div className="set-data-info">
                  <span className="set-data-name">Terms of Service</span>
                  <span className="set-data-sub">The rules for using Ease My Life, including paid features.</span>
                </div>
                <button type="button" className="btn btn--secondary btn--sm"
                   onClick={() => setLegalDoc('terms')}>View</button>
              </div>
            </Card>
          </section>
        </div>
      </div>
      <LegalModal which={legalDoc} onClose={() => setLegalDoc(null)} />
    </div>
  );
}

export { TabSettings };
